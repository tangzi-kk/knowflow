/**
 * YAML frontmatter 解析/序列化。依据 `02_YAML字段规范.md`。
 *
 * - 用 js-yaml 处理中文字段名（js-yaml 原生支持 Unicode key）
 * - 解析时保留注释顺序（js-yaml 不保留，但我们用固定字段映射重建）
 * - 序列化时按规范顺序输出（同步绑定→标签→编码→输入→日期→关键词→评分→索引）
 */
import * as YAML from 'js-yaml';

/** frontmatter 分隔符。 */
const FM_DELIMITER = '---';

/** frontmatter 输出时的字段顺序。依据 `02_YAML字段规范.md` §一模板。 */
const FIELD_ORDER: (keyof import('./types').YAMLFrontmatter)[] = [
  '协议版本',
  '文档ID',
  'feishu_id',
  'feishu_doc_id',
  'feishu_title',
  'sync_hash',
  'sync_time',
  '标签',
  '编码',
  '短编码',
  '输入',
  '日期',
  '日期索引',
  '关键词',
  '概述',
  '评分',
  '评分_显示',
  '状态',
  '索引_知识库',
  '索引_颜色',
  '索引_操作&反馈',
  '索引_块',
  '索引_风险',
];

/** 空值跳过集合：仅跳过未设置；空字符串/空数组用于规范字段占位。 */
function isEmpty(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  return false;
}

/**
 * 将 frontmatter 对象序列化为 YAML 字符串（含 `---` 分隔符）。
 * 按规范顺序输出，跳过空值。
 */
export function serializeFrontmatter(fm: Record<string, unknown>): string {
  const ordered: Record<string, unknown> = {};
  for (const key of FIELD_ORDER) {
    if (!isEmpty(fm[key])) {
      ordered[key as string] = fm[key];
    }
  }
  // 收尾：可能有多余字段不在 FIELD_ORDER 里（向后兼容）
  for (const [k, v] of Object.entries(fm)) {
    if (!(k in ordered) && !isEmpty(v)) {
      ordered[k] = v;
    }
  }
  const yamlStr = YAML.dump(ordered, {
    lineWidth: -1,           // 不折行（表格等长行不破坏）
    quoteStyle: 'double',    // 字符串用双引号（保留 emoji）
    forceQuotes: false,
    sortKeys: false,         // 我们自己控制顺序
  }) as string;
  return `${FM_DELIMITER}\n${yamlStr}${FM_DELIMITER}`;
}

/**
 * 从 md 文件内容解析 frontmatter。
 * @param content 完整文件内容
 * @returns { frontmatter, body }，frontmatter 为 null 表示无 frontmatter
 */
export function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown> | null;
  body: string;
} {
  const inspected = inspectFrontmatter(content);
  if (inspected.status === 'valid') {
    return { frontmatter: inspected.frontmatter, body: inspected.body };
  }
  if (inspected.status === 'invalid') {
    console.warn('[sync/shared] frontmatter parse failed:', inspected.error);
  }
  return { frontmatter: null, body: content };
}

export interface FrontmatterInspection {
  status: 'none' | 'valid' | 'invalid';
  frontmatter: Record<string, unknown> | null;
  body: string;
  hasBom: boolean;
  lineEnding: '\n' | '\r\n';
  error?: string;
}

/**
 * 严格检查 frontmatter，区分“没有 frontmatter”和“存在但损坏”。
 * 写事务必须使用本函数，避免把损坏的 YAML 当正文再包一层 frontmatter。
 */
export function inspectFrontmatter(content: string): FrontmatterInspection {
  const offset = content.charCodeAt(0) === 0xfeff ? 1 : 0;
  const lineEnding = content.includes('\r\n') ? '\r\n' : '\n';
  const base = {
    hasBom: offset === 1,
    lineEnding,
  } as const;
  if (!content.startsWith(FM_DELIMITER, offset)) {
    return {
      ...base,
      status: 'none',
      frontmatter: null,
      body: content,
    };
  }

  const rest = content.slice(offset + FM_DELIMITER.length);
  const match = rest.match(/^\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!match) {
    return {
      ...base,
      status: 'invalid',
      frontmatter: null,
      body: content,
      error: 'frontmatter 分隔符未闭合',
    };
  }

  const yamlBlock = match[1];
  const bodyStart = offset + FM_DELIMITER.length + match[0].length;
  const body = content.slice(bodyStart).replace(/^(?:\r?\n)+/, '');
  try {
    const fm = YAML.load(yamlBlock) as Record<string, unknown>;
    if (fm !== undefined && (fm === null || Array.isArray(fm) || typeof fm !== 'object')) {
      return {
        ...base,
        status: 'invalid',
        frontmatter: null,
        body: content,
        error: 'frontmatter 顶层必须是对象',
      };
    }
    return {
      ...base,
      status: 'valid',
      frontmatter: fm ?? {},
      body,
    };
  } catch (e) {
    return {
      ...base,
      status: 'invalid',
      frontmatter: null,
      body: content,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * 将 frontmatter + body 拼成完整文件内容。
 */
export function assembleFile(
  fm: Record<string, unknown>,
  body: string,
  format?: { hasBom?: boolean; lineEnding?: '\n' | '\r\n' },
): string {
  const lineEnding = format?.lineEnding ?? '\n';
  const serialized = serializeFrontmatter(fm).replace(/\n/g, lineEnding);
  const bom = format?.hasBom ? '\uFEFF' : '';
  return `${bom}${serialized}${lineEnding}${lineEnding}${body}`;
}
