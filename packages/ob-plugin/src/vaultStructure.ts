/**
 * KnowFlow Vault 的固定目录边界。
 *
 * 这些规则来自本地 Vault 的 S08 · AI 编程规范：入口目录是稳定的
 * 结构层，不应被自动编码器改名；真正可编码的文件夹从各业务区规定的
 * 层级开始。所有自动、手动和索引入口都应复用本模块，避免出现一处放行
 * 另一处拦截的分叉行为。
 */

export type FixedVaultArea =
  | 'guide'
  | 'input'
  | 'knowledge'
  | 'output'
  | 'attachments'
  | 'other';

/** 当前 Vault 的固定根目录；保留旧名称别名只用于识别，不会主动改名。 */
export const FIXED_ROOTS = Object.freeze({
  guide: ['🪧导引'],
  input: ['0️⃣输入'],
  knowledge: ['1️⃣🗃知识池', '1️⃣知识池', '2️⃣🗃知识池'],
  output: ['2️⃣输出', '1️⃣输出'],
  attachments: ['3️⃣附件文件'],
} as const);

const FIXED_ROOT_BY_NAME = new Map<string, FixedVaultArea>([
  ...FIXED_ROOTS.guide.map((name) => [name, 'guide'] as const),
  ...FIXED_ROOTS.input.map((name) => [name, 'input'] as const),
  ...FIXED_ROOTS.knowledge.map((name) => [name, 'knowledge'] as const),
  ...FIXED_ROOTS.output.map((name) => [name, 'output'] as const),
  ...FIXED_ROOTS.attachments.map((name) => [name, 'attachments'] as const),
]);

/** 归一化相对 Vault 路径；非法路径返回空字符串。 */
export function normalizeStructurePath(path: string): string {
  const raw = String(path ?? '').trim();
  if (!raw || raw === '/') return '';
  if (
    raw.includes('\0')
    || /^\//.test(raw)
    || /^[A-Za-z]:[\\/]/.test(raw)
    || /%(?:2f|5c|00|2e)/i.test(raw)
  ) return '';
  const normalized = raw
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/+/g, '/');
  const segments = normalized.split('/');
  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) return '';
  return normalized;
}

export function fixedVaultArea(path: string): FixedVaultArea {
  const normalized = normalizeStructurePath(path);
  if (!normalized) return 'other';
  return FIXED_ROOT_BY_NAME.get(normalized.split('/')[0]) ?? 'other';
}

/** 导引、附件、隐藏路径和 AGENTS 相关路径永远不进入自动文档编码。 */
export function isAlwaysProtectedPath(path: string): boolean {
  const normalized = normalizeStructurePath(path);
  if (!normalized) return true;
  const segments = normalized.split('/');
  if (segments.some((segment) => segment.startsWith('.'))) return true;
  if (segments.some((segment) => segment === 'AGENTS' || segment === 'AGENTS.md')) return true;
  const area = fixedVaultArea(normalized);
  return area === 'guide' || area === 'attachments';
}

/**
 * 返回文件夹不能自动/手动编码的原因；undefined 表示允许进入编码预览。
 *
 * - 根目录下一级入口固定，不编码；
 * - 输入、知识池的二级目录是固定语义入口，从三级目录开始编码；
 * - 输出的二级目录可以编码；
 * - 导引和附件整棵目录树保护。
 */
export function folderEncodingBlockedReason(path: string): string | undefined {
  const normalized = normalizeStructurePath(path);
  if (!normalized) return 'Vault 根目录或非法路径不允许编码';
  const segments = normalized.split('/');
  if (isAlwaysProtectedPath(normalized)) {
    const area = fixedVaultArea(normalized);
    if (area === 'guide') return '🪧导引及其全部子目录是固定保护区';
    if (area === 'attachments') return '3️⃣附件文件及其全部子目录是固定保护区';
    if (segments.some((segment) => segment === 'AGENTS' || segment === 'AGENTS.md')) {
      return 'AGENTS 保护路径不允许编码';
    }
    return '隐藏目录及其子目录不允许编码';
  }
  if (segments.length === 1) return 'Vault 一级目录是固定入口，不允许编码';

  const area = fixedVaultArea(normalized);
  if ((area === 'input' || area === 'knowledge') && segments.length < 3) {
    return '输入与知识池的二级目录是固定入口，从三级目录开始编码';
  }
  return undefined;
}

/**
 * 输入与知识池的二级语义入口本身不编码，但它们是目录编码容器。
 * 容器内的三级直接子文件夹才是结构编码对象。
 */
export function isFolderEncodingContainer(path: string): boolean {
  const normalized = normalizeStructurePath(path);
  if (!normalized) return false;
  const segments = normalized.split('/');
  const area = fixedVaultArea(normalized);
  return (area === 'input' || area === 'knowledge') && segments.length === 2;
}

/** 文档自动编码和编码索引共用的保护判断。 */
export function isProtectedDocumentPath(path: string): boolean {
  return isAlwaysProtectedPath(path);
}
