import type { App } from 'obsidian';
import {
  ALLOWED_TAGS,
  datePrefixFromDate,
} from './knowledgeContract.js';
import {
  folderEncodingBlockedReason,
  isFolderEncodingContainer as isSemanticContainerPath,
  normalizeStructurePath,
} from './vaultStructure.js';

/**
 * 文件夹不是 Markdown 文档，不能伪造 YAML。它使用独立的结构编码容器模型：
 * 父文件夹定义编号边界，完整值保存到 `.feishu-sync/目录编码索引.json`，
 * 界面和文件夹名只显示 `TAGnn`。
 */
export const FOLDER_ENCODING_INDEX_PATH = '.feishu-sync/目录编码索引.json';
export const FOLDER_SHORT_RE = /^([SXLZQJ])(\d{2})\s*·\s*(.+)$/;
export const FOLDER_FULL_RE = /^(\d{2}_\d{4})_([SXLZQJ])_(\d{2})$/;

const BUILTIN_EXCLUDED_RE = /^(?:(?:.*\/)?AGENTS\.md$|🪧导引(?:\/|$)|\.[^/]+(?:\/|$))/;

interface FolderLike {
  path: string;
  name: string;
  children: unknown[];
}

interface FolderIndexRecord {
  path: string;
  name: string;
  tag: string;
  shortCode: string;
  encoding: string;
  updatedAt: string;
}

export interface FolderEncodingPreview {
  folderPath: string;
  originalName: string;
  newPath: string;
  newName: string;
  tag: string;
  number: number;
  shortCode: string;
  encoding: string;
  changed: boolean;
  warning?: string;
  blockedReason?: string;
}

export interface FolderEncodingOptions {
  tagOverride?: string;
  whitelist?: string[];
  /** 在容器批量预览中，只把标签修改应用到这个目标文件夹。 */
  targetPath?: string;
}

export interface FolderEncodingResult {
  preview: FolderEncodingPreview;
  changed: boolean;
}

export interface FolderEncodingBatchPreview {
  parentPath: string;
  items: FolderEncodingPreview[];
  changed: boolean;
  blockedReason?: string;
}

export interface FolderEncodingBatchResult {
  preview: FolderEncodingBatchPreview;
  changed: boolean;
}

/** 统一相对 Vault 的目录路径，空字符串代表根目录。 */
export function normalizeFolderPath(path: string): string {
  return normalizeStructurePath(path);
}

/** 返回目录的直接父路径；根目录返回空字符串。 */
export function folderParentPath(path: string): string {
  const normalized = normalizeFolderPath(path);
  const separator = normalized.lastIndexOf('/');
  return separator < 0 ? '' : normalized.slice(0, separator);
}

/** 二级语义入口不编码，但它们承载三级目录的容器整理。 */
export function isFolderEncodingContainer(path: string): boolean {
  return isSemanticContainerPath(path);
}

/** 保护目录、隐藏目录和用户白名单永远不参与文件夹自动编码。 */
export function isFolderEncodingExcluded(path: string, whitelist: string[] = []): boolean {
  const normalized = normalizeFolderPath(path);
  if (!normalized || BUILTIN_EXCLUDED_RE.test(normalized)) return true;
  if (folderEncodingBlockedReason(normalized)) return true;
  return normalizeWhitelist(whitelist).some((entry) =>
    normalized === entry || normalized.startsWith(`${entry}/`));
}

export function parseFolderShortCode(name: string): {
  tag: string;
  number: number;
  title: string;
} | undefined {
  const match = name.match(FOLDER_SHORT_RE);
  if (!match) return undefined;
  return {
    tag: match[1],
    number: Number(match[2]),
    title: match[3].trim(),
  };
}

export async function previewFolderEncoding(
  app: App,
  path: string,
  options: FolderEncodingOptions = {},
): Promise<FolderEncodingPreview> {
  const folderPath = normalizeFolderPath(path);
  const folder = getFolder(app, folderPath);
  const originalName = folder?.name ?? folderPath.split('/').pop() ?? '';
  if (!folder) return blockedPreview(folderPath, originalName, '目标不是可编码的文件夹');
  const structuralBlock = folderEncodingBlockedReason(folderPath);
  if (structuralBlock) return blockedPreview(folderPath, originalName, structuralBlock);
  if (isFolderEncodingExcluded(folderPath, options.whitelist)) {
    return blockedPreview(folderPath, originalName, '文件夹位于保护目录或自动编码白名单中');
  }

  const records = await readFolderIndex(app);
  const parsed = parseFolderShortCode(originalName);
  const overrideTag = normalizeTag(options.tagOverride);
  if (options.tagOverride !== undefined && !overrideTag) {
    return blockedPreview(folderPath, originalName, `目标标签不在协议枚举中：${options.tagOverride}`);
  }
  const tag = overrideTag ?? parsed?.tag ?? inferFolderTag(originalName);
  const parentPath = folderParentPath(folderPath);
  const number = parsed?.number ?? nextFolderNumber(app, records, tag, parentPath, folderPath);
  const title = (parsed?.title
    ?? originalName.replace(/^[SXLZQJ]\d{2}\s*·\s*/, '').trim()) || '未命名';
  const shortCode = `${tag}${String(number).padStart(2, '0')}`;
  const existingRecord = records.find((record) => record.path === folderPath);
  const datePrefix = existingRecord?.encoding.match(FOLDER_FULL_RE)?.[1] ?? datePrefixFromDate();
  const encoding = `${datePrefix}_${tag}_${String(number).padStart(2, '0')}`;
  const newName = `${shortCode} · ${title}`;
  const sequenceConflict = records.some((record) => (
    record.path !== folderPath
    && folderParentPath(record.path) === parentPath
    && record.encoding.match(FOLDER_FULL_RE)?.[2] === tag
    && Number(record.encoding.match(FOLDER_FULL_RE)?.[3]) === number
  )) || listDirectFolders(app, parentPath).some((candidate) => {
    if (candidate.path === folderPath) return false;
    const candidateCode = parseFolderShortCode(candidate.name);
    return candidateCode?.tag === tag && candidateCode.number === number;
  });
  if (sequenceConflict) {
    return blockedPreview(folderPath, originalName, `标签 ${tag} 的目录序号 ${shortCode} 已被占用，请先处理冲突或选择其他标签`);
  }
  const newPath = parentPath ? `${parentPath}/${newName}` : newName;
  const occupied = app.vault.getAbstractFileByPath(newPath);
  if (occupied && occupied.path !== folder.path) {
    return blockedPreview(folderPath, originalName, `目标文件夹已存在：${newPath}`);
  }

  const changed = newPath !== folderPath
    || !existingRecord
    || existingRecord.encoding !== encoding
    || existingRecord.name !== newName;
  const warning = parsed ? undefined : '未检测到标签前缀，按文件夹名称规则或低置信度 S 自动归类';
  return {
    folderPath,
    originalName,
    newPath,
    newName,
    tag,
    number,
    shortCode,
    encoding,
    changed,
    warning,
  };
}

/**
 * 预览同一父目录下的全部可编码子目录。
 * 每个标签在自己的父目录内从 01 开始，按去掉旧短编码后的名称自然排序；
 * 这样新增目录不会因为其他父目录已经使用 S01 而跳到 S07。
 */
export async function previewFolderEncodingGroup(
  app: App,
  parentPath: string,
  options: FolderEncodingOptions = {},
): Promise<FolderEncodingBatchPreview> {
  const normalizedParent = normalizeFolderPath(parentPath);
  const targetPath = options.targetPath ? normalizeFolderPath(options.targetPath) : undefined;
  const overrideTag = normalizeTag(options.tagOverride);
  if (options.tagOverride !== undefined && !overrideTag) {
    return blockedBatch(normalizedParent, `目标标签不在协议枚举中：${options.tagOverride}`);
  }
  if (options.tagOverride !== undefined && !targetPath) {
    return blockedBatch(normalizedParent, '容器标签修改缺少目标文件夹');
  }
  const records = await readFolderIndex(app);
  const folders = listDirectFolders(app, normalizedParent)
    .filter((folder) => !isFolderEncodingExcluded(folder.path, options.whitelist))
    .filter((folder) => !folderEncodingBlockedReason(folder.path));
  if (folders.length === 0) {
    return { parentPath: normalizedParent, items: [], changed: false };
  }
  if (targetPath && !folders.some((folder) => folder.path === targetPath)) {
    return blockedBatch(normalizedParent, '目标文件夹不在当前容器内');
  }

  const groups = new Map<string, FolderLike[]>();
  for (const folder of folders) {
    const inferredTag = parseFolderShortCode(folder.name)?.tag ?? inferFolderTag(folder.name);
    const tag = folder.path === targetPath && overrideTag ? overrideTag : inferredTag;
    const group = groups.get(tag) ?? [];
    group.push(folder);
    groups.set(tag, group);
  }

  const items: FolderEncodingPreview[] = [];
  for (const [tag, group] of groups) {
    group.sort(compareFolderNames);
    group.forEach((folder, index) => {
      const parsed = parseFolderShortCode(folder.name);
      const title = folderTitle(folder.name) || '未命名';
      const number = index + 1;
      const shortCode = `${tag}${String(number).padStart(2, '0')}`;
      const existingRecord = records.find((record) => record.path === folder.path);
      const datePrefix = existingRecord?.encoding.match(FOLDER_FULL_RE)?.[1] ?? datePrefixFromDate();
      const encoding = `${datePrefix}_${tag}_${String(number).padStart(2, '0')}`;
      const newName = `${shortCode} · ${title}`;
      const newPath = normalizedParent ? `${normalizedParent}/${newName}` : newName;
      const warning = parsed ? undefined : '未检测到标签前缀，按文件夹名称规则或低置信度 S 自动归类';
      items.push({
        folderPath: folder.path,
        originalName: folder.name,
        newPath,
        newName,
        tag,
        number,
        shortCode,
        encoding,
        changed: newPath !== folder.path
          || !existingRecord
          || existingRecord.encoding !== encoding
          || existingRecord.name !== newName,
        warning,
      });
    });
  }

  const originalPaths = new Set(items.map((item) => item.folderPath));
  const plannedPaths = new Set<string>();
  for (const item of items) {
    if (plannedPaths.has(item.newPath)) {
      return blockedBatch(normalizedParent, `计划内目标路径重复：${item.newPath}`);
    }
    plannedPaths.add(item.newPath);
    const occupied = app.vault.getAbstractFileByPath(item.newPath);
    if (occupied && !originalPaths.has(occupied.path)) {
      return blockedBatch(normalizedParent, `目标文件夹已存在：${item.newPath}`);
    }
  }
  return {
    parentPath: normalizedParent,
    items,
    changed: items.some((item) => item.changed),
  };
}

/** 原子提交容器内直接子目录的连续重编号；只改目录名和目录编码索引，不改 Markdown 内容。 */
export async function commitFolderEncodingGroup(
  app: App,
  preview: FolderEncodingBatchPreview,
): Promise<FolderEncodingBatchResult> {
  if (preview.blockedReason) {
    const error = new Error(preview.blockedReason) as Error & { code?: string };
    if (preview.blockedReason.includes('目标文件夹已存在')) {
      error.code = 'FOLDER_ENCODING_TARGET_OCCUPIED';
    }
    throw error;
  }
  const before = await readFolderIndex(app);
  const moves = preview.items
    .filter((item) => item.changed && item.newPath !== item.folderPath)
    .map((item, index) => ({
      item,
      temporaryPath: `${preview.parentPath ? `${preview.parentPath}/` : ''}.knowflow-folder-tmp-${Date.now()}-${index}`,
      state: 'original' as 'original' | 'temporary' | 'final',
    }));
  const originalPaths = new Set(preview.items.map((item) => item.folderPath));
  for (const move of moves) {
    const occupied = app.vault.getAbstractFileByPath(move.item.newPath);
    if (occupied && !originalPaths.has(occupied.path)) {
      const error = new Error(`目标文件夹已存在：${move.item.newPath}`) as Error & { code?: string };
      error.code = 'FOLDER_ENCODING_TARGET_OCCUPIED';
      throw error;
    }
  }

  try {
    for (const move of moves) {
      const folder = getFolder(app, move.item.folderPath);
      if (!folder) throw new Error(`文件夹不存在：${move.item.folderPath}`);
      await app.vault.rename(folder as never, move.temporaryPath);
      move.state = 'temporary';
    }
    for (const move of moves) {
      const folder = getFolder(app, move.temporaryPath);
      if (!folder) throw new Error(`临时文件夹不存在：${move.temporaryPath}`);
      await app.vault.rename(folder as never, move.item.newPath);
      move.state = 'final';
    }
    await writeFolderIndex(app, rebaseFolderIndex(app, before, preview.items));
    return { preview, changed: preview.changed };
  } catch (error) {
    for (const move of [...moves].reverse()) {
      if (move.state === 'original') continue;
      const currentPath = move.state === 'final' ? move.item.newPath : move.temporaryPath;
      const folder = getFolder(app, currentPath);
      if (!folder) continue;
      try {
        await app.vault.rename(folder as never, move.item.folderPath);
      } catch {
        // 保留原始错误；活动日志会把目录留在待处理状态。
      }
    }
    try {
      await writeFolderIndex(app, before);
    } catch {
      // 不掩盖最初的目录改名错误。
    }
    throw error;
  }
}

export async function commitFolderEncoding(
  app: App,
  preview: FolderEncodingPreview,
): Promise<FolderEncodingResult> {
  if (preview.blockedReason) throw new Error(preview.blockedReason);
  const folder = getFolder(app, preview.folderPath);
  if (!folder) throw new Error(`文件夹不存在：${preview.folderPath || '/'}`);
  if (preview.newPath !== preview.folderPath) {
    const occupied = app.vault.getAbstractFileByPath(preview.newPath);
    if (occupied && occupied.path !== preview.folderPath) {
      const error = new Error(`目标文件夹已存在：${preview.newPath}`) as Error & {
        code?: string;
      };
      error.code = 'FOLDER_ENCODING_TARGET_OCCUPIED';
      throw error;
    }
  }
  const before = await readFolderIndex(app);
  let renamed = false;
  try {
    if (preview.newPath !== preview.folderPath) {
      await app.vault.rename(folder as never, preview.newPath);
      renamed = true;
    }
    await writeFolderIndex(app, upsertRecord(before, preview));
    return { preview, changed: renamed || preview.changed };
  } catch (error) {
    if (renamed) {
      try {
        await app.vault.rename(folder as never, preview.folderPath);
      } catch {
        // 保留原始错误；活动日志会把该文件夹留在待处理状态。
      }
    }
    try {
      await writeFolderIndex(app, before);
    } catch {
      // 索引恢复失败不能掩盖最初的写入错误。
    }
    throw error;
  }
}

export async function ensureFolderEncoding(
  app: App,
  path: string,
  options: FolderEncodingOptions = {},
): Promise<FolderEncodingResult> {
  const preview = await previewFolderEncoding(app, path, options);
  if (preview.blockedReason) return { preview, changed: false };
  return commitFolderEncoding(app, preview);
}

function blockedPreview(path: string, name: string, blockedReason: string): FolderEncodingPreview {
  return {
    folderPath: path,
    originalName: name,
    newPath: path,
    newName: name,
    tag: '',
    number: 0,
    shortCode: '',
    encoding: '',
    changed: false,
    blockedReason,
  };
}

function getFolder(app: App, path: string): FolderLike | undefined {
  const candidate = app.vault.getAbstractFileByPath(path) as unknown;
  return isFolder(candidate) ? candidate : undefined;
}

function isFolder(value: unknown): value is FolderLike {
  return Boolean(
    value
    && typeof value === 'object'
    && Array.isArray((value as { children?: unknown[] }).children)
    && !('extension' in value),
  );
}

function listDirectFolders(app: App, parentPath: string): FolderLike[] {
  const parent = parentPath ? getFolder(app, parentPath) : app.vault.getRoot() as unknown as FolderLike;
  if (!isFolder(parent)) return [];
  return parent.children.filter(isFolder) as FolderLike[];
}

function nextFolderNumber(
  app: App,
  records: FolderIndexRecord[],
  tag: string,
  parentPath: string,
  currentPath: string,
): number {
  const used = new Set<number>();
  for (const record of records) {
    const match = record.encoding.match(FOLDER_FULL_RE);
    if (folderParentPath(record.path) === parentPath && match?.[2] === tag) {
      used.add(Number(match[3]));
    }
  }
  for (const folder of listDirectFolders(app, parentPath)) {
    if (folder.path === currentPath) continue;
    const parsed = parseFolderShortCode(folder.name);
    if (parsed?.tag === tag) used.add(parsed.number);
  }
  for (let number = 1; number < 100; number += 1) {
    if (!used.has(number)) return number;
  }
  throw new Error(`标签 ${tag} 的文件夹编码已用完 01-99`);
}

function folderTitle(name: string): string {
  return parseFolderShortCode(name)?.title
    ?? name.replace(/^[SXLZQJ]\d{2}\s*·\s*/, '').trim();
}

function compareFolderNames(left: FolderLike, right: FolderLike): number {
  const leftTitle = folderTitle(left.name);
  const rightTitle = folderTitle(right.name);
  const leftLatin = /^[A-Za-z0-9]/.test(leftTitle);
  const rightLatin = /^[A-Za-z0-9]/.test(rightTitle);
  if (leftLatin !== rightLatin) return leftLatin ? -1 : 1;
  const locale = leftLatin ? 'en' : 'zh-CN';
  const titleOrder = leftTitle.localeCompare(rightTitle, locale, {
    numeric: true,
    sensitivity: 'base',
  });
  return titleOrder || left.path.localeCompare(right.path, locale, { sensitivity: 'base' });
}

function inferFolderTag(name: string): string {
  const normalized = name.toLocaleLowerCase('zh-CN');
  const rules: Array<[string, string[]]> = [
    ['X', ['项目', '需求', '里程碑', '待办', '交付', '上线']],
    ['L', ['领域', '体系', '方法论', '行业', '知识']],
    ['Z', ['资源', '资料', '参考', '书签', '链接', '教程', '工具', '剪藏']],
    ['Q', ['灵感', '想法', '点子', '脑暴', '启发']],
    ['J', ['技能', '技巧', '流程', 'sop', '工作流', '实践', '经验']],
  ];
  let best = 'S';
  let bestScore = 0;
  for (const [tag, terms] of rules) {
    const score = terms.filter((term) => normalized.includes(term)).length;
    if (score > bestScore) {
      best = tag;
      bestScore = score;
    }
  }
  return best;
}

function normalizeTag(value: string | undefined): string | undefined {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : undefined;
  return normalized && ALLOWED_TAGS.includes(normalized) ? normalized : undefined;
}

function normalizeWhitelist(values: string[]): string[] {
  return [...new Set((Array.isArray(values) ? values : [])
    .filter((value): value is string => typeof value === 'string')
    .flatMap((value) => value.split(/[\n,，]/))
    .map(normalizeFolderPath)
    .filter(Boolean))];
}

function blockedBatch(parentPath: string, blockedReason: string): FolderEncodingBatchPreview {
  return {
    parentPath,
    items: [],
    changed: false,
    blockedReason,
  };
}

function rebaseFolderIndex(
  app: App,
  records: FolderIndexRecord[],
  previews: FolderEncodingPreview[],
): FolderIndexRecord[] {
  const originalPaths = new Set(previews.map((preview) => preview.folderPath));
  const destinationPaths = new Set(previews.map((preview) => preview.newPath));
  const renames = previews
    .filter((preview) => preview.newPath !== preview.folderPath)
    .sort((left, right) => right.folderPath.length - left.folderPath.length);
  const next = records.flatMap((record) => {
    if (originalPaths.has(record.path) || destinationPaths.has(record.path)) return [];
    const rename = renames.find((candidate) =>
      record.path.startsWith(`${candidate.folderPath}/`));
    if (!rename) return [record];
    return [{
      ...record,
      path: `${rename.newPath}/${record.path.slice(rename.folderPath.length + 1)}`,
      updatedAt: new Date().toISOString(),
    }];
  });
  for (const preview of previews) {
    next.push({
      path: preview.newPath,
      name: preview.newName,
      tag: preview.tag,
      shortCode: preview.shortCode,
      encoding: preview.encoding,
      updatedAt: new Date().toISOString(),
    });
  }
  return next
    .filter((record) => Boolean(app.vault.getAbstractFileByPath(record.path)))
    .sort((left, right) => left.path.localeCompare(right.path, 'zh-CN'));
}

function upsertRecord(records: FolderIndexRecord[], preview: FolderEncodingPreview): FolderIndexRecord[] {
  const next = records
    .filter((record) => record.path !== preview.folderPath && record.path !== preview.newPath)
    .map((record) => {
      const prefix = `${preview.folderPath}/`;
      if (preview.newPath === preview.folderPath || !record.path.startsWith(prefix)) return record;
      return {
        ...record,
        path: `${preview.newPath}/${record.path.slice(prefix.length)}`,
        updatedAt: new Date().toISOString(),
      };
    });
  next.push({
    path: preview.newPath,
    name: preview.newName,
    tag: preview.tag,
    shortCode: preview.shortCode,
    encoding: preview.encoding,
    updatedAt: new Date().toISOString(),
  });
  return next.sort((left, right) => left.path.localeCompare(right.path, 'zh-CN'));
}

async function readFolderIndex(app: App): Promise<FolderIndexRecord[]> {
  const adapter = app.vault.adapter;
  if (!(await adapter.exists(FOLDER_ENCODING_INDEX_PATH))) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(await adapter.read(FOLDER_ENCODING_INDEX_PATH)) as unknown;
  } catch {
    throw new Error('目录编码索引损坏，请先备份并修复 .feishu-sync/目录编码索引.json');
  }
  if (!Array.isArray(parsed) || parsed.some((record) => !isIndexRecord(record))) {
    throw new Error('目录编码索引格式无效，请先备份并修复 .feishu-sync/目录编码索引.json');
  }
  return parsed;
}

async function writeFolderIndex(app: App, records: FolderIndexRecord[]): Promise<void> {
  const adapter = app.vault.adapter;
  const runtimeDir = '.feishu-sync';
  if (!(await adapter.exists(runtimeDir))) await adapter.mkdir(runtimeDir);
  const serialized = JSON.stringify(records, null, 2);
  const temporaryPath = `${FOLDER_ENCODING_INDEX_PATH}.tmp-${Date.now()}`;
  await adapter.write(temporaryPath, serialized);
  if (typeof adapter.rename === 'function') {
    const destinationExists = await adapter.exists(FOLDER_ENCODING_INDEX_PATH);
    let previousContent: string | undefined;
    if (destinationExists && typeof adapter.read === 'function') {
      previousContent = await adapter.read(FOLDER_ENCODING_INDEX_PATH);
    }
    try {
      // Obsidian DataAdapter.rename 通常拒绝覆盖已存在的目标；先移走旧索引，
      // 再把完整临时文件放到正式路径。若第二步失败，立即恢复旧内容。
      if (destinationExists) {
        if (typeof adapter.remove !== 'function') {
          throw new Error(`无法安全替换已存在的目录编码索引：${FOLDER_ENCODING_INDEX_PATH}`);
        }
        await adapter.remove(FOLDER_ENCODING_INDEX_PATH);
      }
      await adapter.rename(temporaryPath, FOLDER_ENCODING_INDEX_PATH);
      return;
    } catch (error) {
      try {
        await adapter.remove(temporaryPath);
      } catch {
        // 保留原始错误；调用方会尝试恢复此前的索引。
      }
      if (previousContent !== undefined) {
        try {
          await adapter.write(FOLDER_ENCODING_INDEX_PATH, previousContent);
        } catch {
          // 调用方仍会尝试以事务前的记录恢复；不掩盖替换错误。
        }
      }
      throw error;
    }
  }
  // 仅供没有 rename 能力的测试适配器使用；真实 Obsidian DataAdapter 支持原子改名。
  await adapter.write(FOLDER_ENCODING_INDEX_PATH, serialized);
  if (typeof adapter.remove === 'function') await adapter.remove(temporaryPath);
}

function isIndexRecord(value: unknown): value is FolderIndexRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<FolderIndexRecord>;
  return typeof record.path === 'string'
    && typeof record.name === 'string'
    && typeof record.tag === 'string'
    && typeof record.shortCode === 'string'
    && typeof record.encoding === 'string'
    && typeof record.updatedAt === 'string';
}
