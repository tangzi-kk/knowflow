import { createHash } from 'node:crypto';
import type { App } from 'obsidian';
import { assembleFile, parseFrontmatter, type Tag } from '@sync/shared';
import { createRecoverySnapshot } from './recovery.js';
import type { SyncCoordinator } from './syncCoordinator.js';

const CODE_RE = /^(\d{2})_(\d{4})_([SXLZQJ])_(\d+)(?:_([a-z]\d+))?$/;
const FILE_CODE_RE = /^(\d{2}_\d{4}_[SXLZQJ]_\d+(?:_[a-z]\d+)?)\s+/;

const TAG_BY_DIR_HINT: Record<string, Tag> = {
  '0️⃣输入': 'S',
  '1️⃣输出': 'X',
  '2️⃣🗃知识池': 'Z',
};

interface VaultFileLike {
  path: string;
  name: string;
  basename: string;
  extension: string;
  parent?: { path: string } | null;
}

interface VaultFolderLike {
  path: string;
  children: unknown[];
}

export interface EncodingPlanItem {
  originalPath: string;
  expectedContentHash: string;
  originalContent: string;
  newContent: string;
  newPath: string;
  code: string;
  tag: Tag;
}

export interface EncodingPlan {
  directory: string;
  items: EncodingPlanItem[];
  skipped: number;
  conflicts: string[];
}

export interface EncodingApplyResult {
  total: number;
  assigned: number;
  paths: string[];
}

export interface EncodingWorkflow {
  previewDirectory(directory: string, orderedPaths?: string[]): Promise<EncodingPlan>;
  previewFile(path: string, directory?: string): Promise<EncodingPlan>;
  apply(plan: EncodingPlan, requestId?: string): Promise<EncodingApplyResult>;
}

export function createEncodingWorkflow(
  app: App,
  coordinator: SyncCoordinator,
): EncodingWorkflow {
  return {
    previewDirectory: (directory, orderedPaths) =>
      previewEncodingDirectory(app, directory, orderedPaths),
    previewFile: (path, directory) =>
      previewEncodingFile(app, path, directory),
    apply: (plan, requestId) =>
      coordinator.run(`directory:${normalizeDirectory(plan.directory)}`, requestId, () =>
        applyEncodingPlan(app, plan)),
  };
}

export async function previewEncodingDirectory(
  app: App,
  directory: string,
  orderedPaths?: string[],
): Promise<EncodingPlan> {
  const normalizedDirectory = normalizeDirectory(directory);
  const folder = app.vault.getAbstractFileByPath(normalizedDirectory);
  if (!isFolder(folder)) {
    return { directory: normalizedDirectory, items: [], skipped: 0, conflicts: [] };
  }

  const files = folder.children.filter(isMarkdownFile);
  const order = new Map((orderedPaths ?? []).map((path, index) => [path, index]));
  files.sort((left, right) => {
    const leftOrder = order.get(left.path);
    const rightOrder = order.get(right.path);
    if (leftOrder !== undefined || rightOrder !== undefined) {
      return (leftOrder ?? Number.MAX_SAFE_INTEGER) - (rightOrder ?? Number.MAX_SAFE_INTEGER);
    }
    return left.path.localeCompare(right.path, 'zh-CN');
  });
  return buildPlan(app, normalizedDirectory, files);
}

export async function previewEncodingFile(
  app: App,
  path: string,
  directory?: string,
): Promise<EncodingPlan> {
  const file = app.vault.getAbstractFileByPath(path);
  const normalizedDirectory = normalizeDirectory(
    directory ?? (isMarkdownFile(file) ? file.parent?.path ?? '' : ''),
  );
  if (!isMarkdownFile(file)) {
    return { directory: normalizedDirectory, items: [], skipped: 0, conflicts: [] };
  }
  return buildPlan(app, normalizedDirectory, [file]);
}

export async function applyEncodingPlan(
  app: App,
  plan: EncodingPlan,
): Promise<EncodingApplyResult> {
  if (plan.conflicts.length > 0) {
    throw new Error(`编码计划存在路径冲突：${plan.conflicts.join('、')}`);
  }

  const verified: Array<{ file: VaultFileLike; item: EncodingPlanItem }> = [];
  for (const item of plan.items) {
    const file = app.vault.getAbstractFileByPath(item.originalPath);
    if (!isMarkdownFile(file)) {
      throw stalePlanError(item.originalPath, '文件已移动或不存在');
    }
    const content = await app.vault.read(file as never);
    if (hashContent(content) !== item.expectedContentHash) {
      throw stalePlanError(item.originalPath, '内容已变化');
    }
    if (item.newPath !== item.originalPath) {
      const target = app.vault.getAbstractFileByPath(item.newPath);
      if (target && target !== file) {
        throw stalePlanError(item.originalPath, `目标路径已被占用：${item.newPath}`);
      }
    }
    verified.push({ file, item });
  }

  // 整批恢复点先全部落盘。任一恢复点创建失败时，不开始改名或改正文，
  // 避免批处理中途才发现无法恢复而留下半完成状态。
  for (const { item } of verified) {
    await createRecoverySnapshot(app.vault.adapter, {
      originalPath: item.originalPath,
      content: item.originalContent,
      source: 'local',
    });
  }

  const paths: string[] = [];
  for (const { file, item } of verified) {
    if (item.newPath !== item.originalPath) {
      await app.vault.rename(file as never, item.newPath);
    }
    const current = app.vault.getAbstractFileByPath(item.newPath);
    if (!isMarkdownFile(current)) {
      throw new Error(`重命名后无法定位文件：${item.newPath}`);
    }
    await app.vault.modify(current as never, item.newContent);
    paths.push(item.newPath);
  }

  return { total: plan.items.length + plan.skipped, assigned: plan.items.length, paths };
}

async function buildPlan(
  app: App,
  directory: string,
  files: VaultFileLike[],
): Promise<EncodingPlan> {
  const sequenceByTag = await collectSequences(app, directory);
  const items: EncodingPlanItem[] = [];
  const conflicts: string[] = [];
  let skipped = 0;
  const reservedPaths = new Set<string>();

  for (const file of files) {
    const content = await app.vault.read(file as never);
    const { frontmatter, body } = parseFrontmatter(content);
    const fm = frontmatter ?? {};
    const yamlCode = typeof fm.编码 === 'string' ? fm.编码.trim() : '';
    if (CODE_RE.test(yamlCode)) {
      skipped += 1;
      continue;
    }

    const filenameCode = file.basename.match(FILE_CODE_RE)?.[1];
    const tag = inferTag(directory, fm.标签 as Tag | undefined);
    const code = filenameCode && CODE_RE.test(filenameCode)
      ? filenameCode
      : allocateCode(tag, sequenceByTag);
    const newContent = assembleFile({ ...fm, 标签: tag, 编码: code }, body);
    const unprefixedName = file.basename.replace(FILE_CODE_RE, '');
    const newPath = joinPath(directory, `${code} ${unprefixedName}.${file.extension}`);

    const existing = app.vault.getAbstractFileByPath(newPath);
    if ((existing && existing.path !== file.path) || reservedPaths.has(newPath)) {
      conflicts.push(newPath);
    }
    reservedPaths.add(newPath);
    items.push({
      originalPath: file.path,
      expectedContentHash: hashContent(content),
      originalContent: content,
      newContent,
      newPath,
      code,
      tag,
    });
  }

  return { directory, items, skipped, conflicts };
}

async function collectSequences(app: App, directory: string): Promise<Map<Tag, number>> {
  const maximums = new Map<Tag, number>();
  const folder = app.vault.getAbstractFileByPath(directory);
  if (!isFolder(folder)) return maximums;

  for (const file of folder.children.filter(isMarkdownFile)) {
    let code = file.basename.match(FILE_CODE_RE)?.[1];
    if (!code) {
      try {
        const { frontmatter } = parseFrontmatter(await app.vault.read(file as never));
        code = typeof frontmatter?.编码 === 'string' ? frontmatter.编码.trim() : undefined;
      } catch {
        continue;
      }
    }
    const match = code?.match(CODE_RE);
    if (!match) continue;
    const tag = match[3] as Tag;
    maximums.set(tag, Math.max(maximums.get(tag) ?? 0, Number(match[4])));
  }
  return maximums;
}

function allocateCode(tag: Tag, maximums: Map<Tag, number>): string {
  const next = (maximums.get(tag) ?? 0) + 1;
  maximums.set(tag, next);
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `${yy}_${mmdd}_${tag}_${String(next).padStart(2, '0')}`;
}

function inferTag(directory: string, existingTag?: Tag): Tag {
  if (existingTag && ['S', 'X', 'L', 'Z', 'Q', 'J'].includes(existingTag)) {
    return existingTag;
  }
  for (const [hint, tag] of Object.entries(TAG_BY_DIR_HINT)) {
    if (directory.startsWith(hint)) return tag;
  }
  if (directory.includes('知识池') || directory.includes('🗃')) {
    if (directory.includes('领域')) return 'L';
    if (directory.includes('灵感')) return 'Q';
    if (directory.includes('技能')) return 'J';
    return 'Z';
  }
  if (directory.includes('输出') || directory.includes('1️⃣')) return 'X';
  return 'S';
}

function isMarkdownFile(value: unknown): value is VaultFileLike {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<VaultFileLike>;
  return candidate.extension === 'md'
    && typeof candidate.path === 'string'
    && typeof candidate.basename === 'string';
}

function isFolder(value: unknown): value is VaultFolderLike {
  return Boolean(value && typeof value === 'object' && Array.isArray((value as VaultFolderLike).children));
}

function normalizeDirectory(directory: string): string {
  return directory.replace(/^\/+|\/+$/g, '');
}

function joinPath(directory: string, name: string): string {
  return directory ? `${directory}/${name}` : name;
}

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function stalePlanError(path: string, reason: string): Error & { code: string } {
  const error = new Error(`编码预览已过期（${path}）：${reason}`) as Error & { code: string };
  error.code = 'ENCODING_PLAN_STALE';
  return error;
}

export function decodeEncoding(code: string): {
  yy: string;
  mmdd: string;
  tag: Tag;
  seq: number;
  sub?: string;
} | null {
  const match = code.match(CODE_RE);
  if (!match) return null;
  return {
    yy: match[1],
    mmdd: match[2],
    tag: match[3] as Tag,
    seq: Number(match[4]),
    sub: match[5],
  };
}
