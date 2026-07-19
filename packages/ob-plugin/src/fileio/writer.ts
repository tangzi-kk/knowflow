/**
 * 文件 IO：读写 vault 中的 .md 文件。
 * 依据方案 §6（关键流程）+ `02_YAML字段规范.md`。
 *
 * - reader：解析 frontmatter + body，计算 hash，比对 sync_hash
 * - writer：组装 YAML + body，写文件
 */
import {
  parseFrontmatter,
  assembleFile,
  bodyHash,
  isChanged,
  sanitizeFilename,
  withMdExt,
  joinPath,
  rewriteImagesToFeishuProto,
  type YAMLFrontmatter,
} from '@sync/shared';

/** 读文件结果。 */
export interface ParsedFile {
  /** 完整文件内容。 */
  content: string;
  /** frontmatter（无则为空对象）。 */
  frontmatter: Record<string, unknown>;
  /** 正文（不含 frontmatter）。 */
  body: string;
  /** 正文 hash（sha256 hex）。 */
  hash: string;
}

/**
 * 从完整文件内容解析。
 */
export function parseFile(content: string): ParsedFile {
  const { frontmatter, body } = parseFrontmatter(content);
  const hash = bodyHash(body);
  return {
    content,
    frontmatter: frontmatter ?? {},
    body,
    hash,
  };
}

/**
 * 检测内容是否相对上次同步发生变化。
 */
export function hasContentChanged(parsed: ParsedFile): boolean {
  return isChanged(parsed.hash, parsed.frontmatter.sync_hash as string | undefined);
}

/**
 * 组装新文件的 frontmatter（飞书→OB 首次落地）。
 * @param meta 从飞书 callout 解析出的元数据（标签/编码/输入/日期/关键词/评分/索引）
 */
export function buildInitialFrontmatter(
  feishuId: string,
  feishuDocId: string,
  feishuTitle: string,
  syncTime: string,
  meta?: Record<string, unknown>,
): YAMLFrontmatter {
  return {
    feishu_id: feishuId,
    feishu_doc_id: feishuDocId,
    feishu_title: feishuTitle,
    sync_time: syncTime,
    // 飞书 callout 元数据（空值字段不写入，保持 YAML 干净）
    ...(meta && stripEmpty(meta)),
    // sync_hash 在写入时由 writer 计算填入
  };
}

/**
 * 合并更新已有文件的 frontmatter（保留用户改的元数据字段）。
 * 只刷同步绑定组（feishu_* / sync_*），保留 标签/编码/输入/日期/关键词/评分/索引 等用户字段。
 *
 * 注意：已有字段优先（用户在 OB 里改过的），飞书侧 callout 元数据仅在字段缺失时补齐。
 * 这样避免飞书侧的旧 callout 覆盖 OB 里的最新整理。
 */
export function mergeFrontmatterForUpdate(
  existing: Record<string, unknown>,
  feishuId: string,
  feishuDocId: string,
  feishuTitle: string,
  syncTime: string,
  meta?: Record<string, unknown>,
): YAMLFrontmatter {
  return {
    // 已有字段优先（用户改过的），飞书 callout 元数据只补缺失
    ...(meta && stripEmpty(meta)),
    ...existing,
    feishu_id: feishuId,
    feishu_doc_id: feishuDocId,
    feishu_title: feishuTitle,
    sync_time: syncTime,
  } as YAMLFrontmatter;
}

/** 移除值为空（undefined/null/''/空数组）的字段，避免污染 YAML。 */
function stripEmpty(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out;
}

/**
 * 组装最终文件内容（YAML + 正文 + hash）。
 * @param frontmatter 同步绑定 + 用户元数据
 * @param body 正文 md
 */
export function assembleMd(frontmatter: YAMLFrontmatter, body: string): string {
  // 计算并写入 sync_hash
  const hash = bodyHash(body);
  const fmWithHash: YAMLFrontmatter = {
    ...frontmatter,
    sync_hash: hash,
  };
  return assembleFile(fmWithHash, body);
}

/**
 * 把飞书导出的 md 处理为 OB 正文。
 * - 图片 authcode URL → feishu://TOKEN
 * - 标题行去掉（标题已在 frontmatter.feishu_title，OB 里 H1 保留但飞书侧由 obj 处理）
 */
export function processFeishuMd(md: string, imgTokens: Set<string>): string {
  return rewriteImagesToFeishuProto(md, imgTokens);
}

/**
 * 生成落地文件名（安全清洗）。
 */
export function makeFilename(feishuTitle: string, override?: string): string {
  const name = override ? sanitizeFilename(override) : sanitizeFilename(feishuTitle);
  return withMdExt(name);
}

/**
 * 拼接落地路径。
 */
export function makePath(dir: string | undefined, filename: string): string {
  return joinPath(dir, filename);
}
