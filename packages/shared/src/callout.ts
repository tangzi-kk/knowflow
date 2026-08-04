/**
 * YAML ↔ 飞书 callout 双向转换。
 *
 * 依据：
 * - `03_飞书文档格式规范与OB映射.md` §三（callout 颜色映射）
 * - `02_YAML字段规范.md` §五（YAML→callout 映射表）
 * - §四（合并信息块设计：所有字段进一个 callout）
 *
 * 已知坑（03 文档 §十 + §3.3）：
 * - emoji 带 U+FE0F variation selector 飞书不认 → 写入前 strip
 * - `~` 被飞书转义成 `\~` → 回读时反转义
 */

import type { KnowledgeMeta, Tag } from './types.js';
import {
  TAG_NAMES,
  DOC_INFO_CALLOUT,
  OB_CALLOUT_TO_FEISHU,
  FEISHU_BG_TO_OB_CALLOUT,
} from './types.js';

// ──────────────── emoji 清洗 ────────────────

/** 移除 emoji 的 U+FE0F variation selector。飞书不认带 VS 的 emoji（03 文档 §3.3）。 */
const VS_RE = /\uFE0F/gu;

export function stripVariationSelectors(s: string): string {
  return s.replace(VS_RE, '');
}

// ──────────────── 波浪号转义 ────────────────

/** 飞书 md 把 `~` 转义成 `\~`，回读时反向。 */
export function unescapeFeishuTilde(s: string): string {
  return s.replace(/\\~/g, '~');
}

/** 写入飞书前反转义（如果用户想用 `~` 删除线）。飞书 md 里 `~~~text~~~` 是删除线。 */
export function escapeFeishuTilde(s: string): string {
  // 不主动转义，保持原样。仅在 overwrite 场景确认需要时手动处理。
  return s;
}

// ──────────────── 标签值格式化 ────────────────

function formatTagValue(tag: Tag | undefined): string {
  if (!tag) return '';
  return `${TAG_NAMES[tag]} ${tag}`;
}

function parseTagValue(value: string): Tag | null {
  const normalized = stripVariationSelectors(value).trim();
  const direct = normalized.match(/(?:^|\s)([SXLZQJ])(?:\s|$)/);
  const compact = normalized.match(/[SXLZQJ]/);
  const tag = (direct?.[1] ?? compact?.[0]) as Tag | undefined;
  return tag && ['S', 'X', 'L', 'Z', 'Q', 'J'].includes(tag) ? tag : null;
}

function mapFeishuBgToObType(bgColor: string): string {
  if (!bgColor) return 'tip';
  if (FEISHU_BG_TO_OB_CALLOUT[bgColor]) return FEISHU_BG_TO_OB_CALLOUT[bgColor];
  const normalized = bgColor.replace(/\s+/g, '').toLowerCase();
  const rgbMap: Record<string, string> = {
    'rgb(255,245,235)': 'tip',
    'rgb(254,212,164)': 'tip',
    'rgba(255,246,122,0.8)': 'tip',
    'rgb(255,240,240)': 'warning',
    'rgb(242,243,245)': 'quote',
    'rgb(240,244,255)': 'info',
    'rgb(240,253,244)': 'success',
  };
  return rgbMap[normalized] ?? 'abstract';
}

function htmlBlockToTextLines(html: string): string[] {
  const lines: string[] = [];
  const blockRe = /<(?:p|li)\b[^>]*>([\s\S]*?)<\/(?:p|li)>/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(html)) !== null) {
    const text = htmlToPlainText(m[1]);
    if (text) lines.push(...text.split('\n').map(line => line.trim()).filter(Boolean));
  }
  if (lines.length > 0) return lines;
  const fallback = htmlToPlainText(html);
  return fallback ? fallback.split('\n').map(line => line.trim()).filter(Boolean) : [];
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    // 飞书 Markdown 导出会把 callout 内的强调符号转义成 `\\**`、`\\*`。
    // 回到 Obsidian 前还原，避免同一正文仅因展示层转义而被判定为冲突。
    .replace(/\\([*_~`])/g, '$1')
    .trim();
}

function escapeXmlText(value: unknown): string {
  return stripVariationSelectors(String(value ?? ''))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

function isBlankValue(value: unknown): boolean {
  return value === undefined
    || value === null
    || value === ''
    || (Array.isArray(value) && value.length === 0);
}

function displayValue(value: unknown, fallback = '未设置'): string {
  if (isBlankValue(value)) return fallback;
  if (Array.isArray(value)) {
    const values = value.map(item => String(item).trim()).filter(Boolean);
    return values.length > 0 ? values.join(' · ') : fallback;
  }
  return String(value).trim() || fallback;
}

function xmlListItem(label: string, value: unknown, fallback = '未设置'): string {
  return `<li><b>${escapeXmlText(label)}</b>：${escapeXmlText(displayValue(value, fallback))}</li>`;
}

function xmlSection(title: string, fields: Array<[string, unknown]>): string[] {
  return [
    `<p><b>${escapeXmlText(title)}</b></p>`,
    '<ul>',
    ...fields.map(([label, value]) => xmlListItem(label, value)),
    '</ul>',
  ];
}

// ──────────────── OB→飞书：YAML→合并信息 callout XML ────────────────

/**
 * 将 OB 的 YAML 元数据字段渲染为飞书合并信息 callout XML。
 * 依据 `03_格式规范.md` §四（合并进一个 callout 高亮块）。
 *
 * @param meta 知识库元数据
 * @returns callout XML 字符串（含 strip VS）
 */
export function metaToCalloutXml(meta: Record<string, unknown>): string {
  const score = !isBlankValue(meta.评分_显示) ? meta.评分_显示 : meta.评分;
  const primary = [
    ['标签', isBlankValue(meta.标签) ? undefined : formatTagValue(meta.标签 as Tag)],
    ['状态', meta.状态],
    ['概述', meta.概述],
    ['关键词', meta.关键词],
    ['输入', meta.输入],
    ['日期', meta.日期],
    ['日期索引', meta.日期索引],
    ['评分', score],
    ['知识库索引', meta.索引_知识库],
    ['颜色索引', meta.索引_颜色],
    ['操作与反馈', meta['索引_操作&反馈']],
    ['块索引', meta.索引_块],
    ['风险索引', meta.索引_风险],
    ['关联项目', meta.关联项目],
    ['关联文档', meta.关联文档],
    ['关联人物', meta.关联人物],
  ] as Array<[string, unknown]>;
  const system = [
    ['协议版本', meta.协议版本],
    ['文档ID', meta.文档ID],
    ['编码', meta.编码],
    ['短编码', meta.短编码],
  ] as Array<[string, unknown]>;

  const { emoji, ...attrs } = DOC_INFO_CALLOUT;
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
  const cleanEmoji = stripVariationSelectors(emoji);

  return [
    `<callout emoji="${cleanEmoji}" ${attrStr}>`,
    ...xmlSection('KnowFlow 元数据', primary),
    ...xmlSection('系统信息', system),
    `</callout>`,
    '',
  ].join('\n');
}

// ──────────────── 飞书→OB：解析合并信息 callout → YAML 字段 ────────────────

/**
 * 从飞书 XML 的头部信息 callout 中解析出 YAML 字段值。
 * 依据 `03_格式规范.md` §四：`<li><b>字段名</b>：值</li>` 格式。
 *
 * @param xml 飞书文档 XML 片段
 * @returns 解析到的元数据字段
 */
export function calloutXmlToMeta(xml: string): Partial<KnowledgeMeta> {
  const result: Partial<KnowledgeMeta> = {};

  const calloutRe = /<callout\b[^>]*>[\s\S]*?<\/callout>/g;
  for (const match of xml.matchAll(calloutRe)) {
    const callout = match[0];
    if (!/<p><b>(?:KnowFlow 元数据|文档信息)<\/b><\/p>/.test(callout)) continue;

    const liRe = /<li>\s*<b>([^<]+)<\/b>\s*[：:]\s*([\s\S]*?)<\/li>/g;
    let item: RegExpExecArray | null;
    while ((item = liRe.exec(callout)) !== null) {
      const label = htmlToPlainText(item[1]);
      const value = unescapeFeishuTilde(htmlToPlainText(item[2]));
      applyCalloutField(label, value, result);
    }
  }

  return result;
}

function arrayFieldValue(value: string): string[] {
  if (!value || value === '未设置' || value === '—') return [];
  return value.split(/\s*·\s*|\s*[、,，]\s*|\n/).map(item => item.trim()).filter(Boolean);
}

function applyCalloutField(label: string, value: string, result: Partial<KnowledgeMeta>): void {
  if (!value || value === '未设置' || value === '—') return;
  if (label === '标签') {
    const tag = parseTagValue(value);
    if (tag) result.标签 = tag;
  } else if (label === '协议版本') {
    const version = Number(value);
    if (Number.isInteger(version)) result.协议版本 = version as 1;
  } else if (label === '文档ID') {
    result.文档ID = value;
  } else if (label === '编码') {
    result.编码 = value.replace(/^🔢\s*/, '').trim();
  } else if (label === '短编码') {
    result.短编码 = value.trim();
  } else if (label === '输入') {
    result.输入 = value.replace(/^📥\s*/, '').trim();
  } else if (label === '日期') {
    result.日期 = value.replace(/^📅\s*/, '').trim();
  } else if (label === '日期索引') {
    result.日期索引 = arrayFieldValue(value);
  } else if (label === '关键词') {
    result.关键词 = arrayFieldValue(value);
  } else if (label === '概述') {
    result.概述 = value;
  } else if (label === '状态') {
    result.状态 = value as KnowledgeMeta['状态'];
  } else if (label === '评分') {
    result.评分_显示 = stripVariationSelectors(value);
    const starCount = (value.match(/🌟/g) || []).length;
    const numeric = value.match(/(?:^|\D)([1-5])(?:\D|$)/)?.[1];
    const score = starCount >= 1 && starCount <= 5 ? starCount : Number(numeric);
    if (score >= 1 && score <= 5) result.评分 = score;
  } else if (label === '知识库索引' || label === '索引_知识库') {
    result.索引_知识库 = value;
  } else if (label === '颜色索引' || label === '索引_颜色') {
    result.索引_颜色 = value;
  } else if (label === '操作与反馈' || label === '索引_操作&反馈') {
    result['索引_操作&反馈'] = arrayFieldValue(value);
  } else if (label === '块索引' || label === '索引_块') {
    result.索引_块 = arrayFieldValue(value);
  } else if (label === '风险索引' || label === '索引_风险') {
    result.索引_风险 = arrayFieldValue(value);
  } else if (label === '关联项目') {
    result.关联项目 = arrayFieldValue(value);
  } else if (label === '关联文档') {
    result.关联文档 = arrayFieldValue(value);
  } else if (label === '关联人物') {
    result.关联人物 = arrayFieldValue(value);
  } else if (label === '索引') {
    // 兼容旧版把所有索引合并成一行的格式。
    parseIndexField(value, result);
  }
}

/**
 * 解析索引合并字段 "💰正财 · 🔵工作 · ✅完成 · 🎯具象 · ✅简单 · ❤️健康"
 * 回各索引子字段。
 */
function parseIndexField(value: string, result: Partial<KnowledgeMeta>): void {
  const parts = value.split(/[·\n]/).map(s => s.trim()).filter(Boolean);
  for (const part of parts) {
    const cleaned = stripVariationSelectors(part);
    // 知识库维度
    for (const kw of ['正财', '偏财', '正印', '偏印', '正宫', '伤官']) {
      if (cleaned.includes(kw)) { result.索引_知识库 = kw; break; }
    }
    // 颜色维度
    for (const kw of ['睡眠', '工作', '生活', '娱乐', '社交', '学习', '运动']) {
      if (cleaned.includes(kw)) { result.索引_颜色 = cleaned; break; }
    }
    // 操作维度
    for (const kw of ['想法', '规划', '执行', '受挫', '克服', '初稿', '审核', '修改', '完成', '复盘']) {
      if (cleaned.includes(kw)) {
        result['索引_操作&反馈'] = result['索引_操作&反馈'] ?? [];
        if (!result['索引_操作&反馈'].includes(kw)) result['索引_操作&反馈'].push(kw);
        break;
      }
    }
    // 块维度（多选）
    for (const kw of ['抽象', '具象', '简单', '困难']) {
      if (cleaned.includes(kw) && kw !== cleaned) {
        result.索引_块 = result.索引_块 ?? [];
        if (!result.索引_块.includes(kw)) result.索引_块.push(kw);
      }
    }
    // 风险维度（多选）
    for (const kw of ['行为', '管理', '健康', '知识', '社交', '家庭', '社会', '意外']) {
      if (cleaned.includes(kw) && kw !== cleaned) {
        result.索引_风险 = result.索引_风险 ?? [];
        if (!result.索引_风险.includes(kw)) result.索引_风险.push(kw);
      }
    }
  }
}

// ──────────────── 正文 callout 双向转换 ────────────────

/**
 * 飞书正文 callout XML → OB `> [!type]` callout。
 * 依据 `03_格式规范.md` §3.1。
 *
 * 输入单个 `<callout ...>content</callout>` 块，输出 OB markdown callout。
 * 多个 callout 块由调用方拆分后逐个调用。
 */
export function feishuCalloutToOB(xml: string): string {
  // 提取属性
  const openMatch = xml.match(/<callout\b([^>]*)>/);
  if (!openMatch) return xml;

  const attrs = openMatch[1];
  let emoji = '';
  let bgColor = '';

  const emojiMatch = attrs.match(/emoji=["']([^"']+)["']/);
  if (emojiMatch) emoji = stripVariationSelectors(emojiMatch[1]);

  const bgMatch = attrs.match(/background-color=["']([^"']+)["']/);
  if (bgMatch) bgColor = bgMatch[1];

  // 提取内容（去掉 open/close tag）
  const content = xml
    .replace(/<callout\b[^>]*>/, '')
    .replace(/<\/callout>/, '')
    .trim();

  // 映射 callout 类型
  const obType = mapFeishuBgToObType(bgColor);
  const lines = htmlBlockToTextLines(content);
  const title = `> [!${obType}]${emoji ? ` ${emoji}` : ''}`;

  if (lines.length === 0) return title;
  return [title, ...lines.map(line => `> ${line}`)].join('\n');
}

/**
 * 批量将飞书 XML 里的所有 callout 块转换为 OB callout。
 */
export function convertFeishuCalloutsToOB(xml: string): string {
  const calloutRe = /<callout\b[^>]*>[\s\S]*?<\/callout>/g;
  return xml.replace(calloutRe, (match) => feishuCalloutToOB(match));
}

/**
 * OB `> [!type]` callout → 飞书 callout XML。
 * 依据 `03_格式规范.md` §3.2。
 *
 * 输入单个 OB callout 块（含 `> [!type]` 首行 + 子行）。
 * 多个 callout 由调用方拆分后逐个调用。
 */
export function obCalloutToFeishu(md: string): string {
  const lines = md.split('\n').map(l => l.replace(/^>\s?/, ''));
  if (lines.length === 0) return md;

  // 解析首行 `> [!type]`
  const headerMatch = lines[0].match(/\[!(\w+)\]\s*(.*)/);
  if (!headerMatch) return md;

  const obType = headerMatch[1];
  let rest = stripVariationSelectors(headerMatch[2] ?? '').trim();
  const feishu = OB_CALLOUT_TO_FEISHU[obType];

  let emoji = feishu?.emoji ?? '💡';
  let bg = feishu?.bg ?? 'light-blue';
  let border = feishu?.border ?? 'blue';

  // 尝试从首行剩余内容提取用户写的 emoji，并从正文中移除。
  const emojiMatch = rest.match(/^(\p{Extended_Pictographic})\s*/u);
  if (emojiMatch) {
    emoji = emojiMatch[1];
    rest = rest.slice(emojiMatch[0].length).trimStart();
  }

  // 内容（首行去掉 emoji + 后续子行）
  const bodyLines = lines.slice(1);
  if (rest) {
    bodyLines.unshift(rest);
  }
  const contentHtml = bodyLines
    .filter(l => l.trim())
    .map(l => `<p>${l}</p>`)
    .join('\n');

  return [
    `<callout emoji="${emoji}" background-color="${bg}" border-color="${border}">`,
    contentHtml,
    `</callout>`,
  ].join('\n');
}

/**
 * 批量将 OB md 里的所有 `> [!type]` callout 转换为飞书 XML callout。
 */
export function convertOBCalloutsToFeishu(md: string): string {
  // 匹配连续的 callout 块（以 > [! 开头的行，直到非 > 或空行）
  const calloutRe = /(?:^> \[!\w+\].*\n(?:^>.*\n?)*)/gm;
  return md.replace(calloutRe, (match) => obCalloutToFeishu(match));
}
