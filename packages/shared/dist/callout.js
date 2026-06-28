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
import { CALLOUT_FIELD_MAP, TAG_NAMES, DOC_INFO_CALLOUT, OB_CALLOUT_TO_FEISHU, FEISHU_BG_TO_OB_CALLOUT, } from './types.js';
// ──────────────── emoji 清洗 ────────────────
/** 移除 emoji 的 U+FE0F variation selector。飞书不认带 VS 的 emoji（03 文档 §3.3）。 */
const VS_RE = /\uFE0F/gu;
export function stripVariationSelectors(s) {
    return s.replace(VS_RE, '');
}
// ──────────────── 波浪号转义 ────────────────
/** 飞书 md 把 `~` 转义成 `\~`，回读时反向。 */
export function unescapeFeishuTilde(s) {
    return s.replace(/\\~/g, '~');
}
/** 写入飞书前反转义（如果用户想用 `~` 删除线）。飞书 md 里 `~~~text~~~` 是删除线。 */
export function escapeFeishuTilde(s) {
    // 不主动转义，保持原样。仅在 overwrite 场景确认需要时手动处理。
    return s;
}
// ──────────────── 标签值格式化 ────────────────
function formatTagValue(tag) {
    if (!tag)
        return '';
    return `${TAG_NAMES[tag]} ${tag}`;
}
function parseTagValue(value) {
    const normalized = stripVariationSelectors(value).trim();
    const direct = normalized.match(/(?:^|\s)([SXLZQJ])(?:\s|$)/);
    const compact = normalized.match(/[SXLZQJ]/);
    const tag = (direct?.[1] ?? compact?.[0]);
    return tag && ['S', 'X', 'L', 'Z', 'Q', 'J'].includes(tag) ? tag : null;
}
function mapFeishuBgToObType(bgColor) {
    if (!bgColor)
        return 'tip';
    if (FEISHU_BG_TO_OB_CALLOUT[bgColor])
        return FEISHU_BG_TO_OB_CALLOUT[bgColor];
    const normalized = bgColor.replace(/\s+/g, '').toLowerCase();
    const rgbMap = {
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
function htmlBlockToTextLines(html) {
    const lines = [];
    const blockRe = /<(?:p|li)\b[^>]*>([\s\S]*?)<\/(?:p|li)>/g;
    let m;
    while ((m = blockRe.exec(html)) !== null) {
        const text = htmlToPlainText(m[1]);
        if (text)
            lines.push(...text.split('\n').map(line => line.trim()).filter(Boolean));
    }
    if (lines.length > 0)
        return lines;
    const fallback = htmlToPlainText(html);
    return fallback ? fallback.split('\n').map(line => line.trim()).filter(Boolean) : [];
}
function htmlToPlainText(html) {
    return html
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .trim();
}
// ──────────────── OB→飞书：YAML→合并信息 callout XML ────────────────
/**
 * 将 OB 的 YAML 元数据字段渲染为飞书合并信息 callout XML。
 * 依据 `03_格式规范.md` §四（合并进一个 callout 高亮块）。
 *
 * @param meta 知识库元数据
 * @returns callout XML 字符串（含 strip VS）
 */
export function metaToCalloutXml(meta) {
    const lines = [];
    for (const item of CALLOUT_FIELD_MAP) {
        const raw = meta[item.field];
        if (raw === undefined || raw === null || raw === '' || (Array.isArray(raw) && raw.length === 0))
            continue;
        let value;
        if (item.field === '标签') {
            value = formatTagValue(raw);
        }
        else if (item.field === '评分_显示') {
            value = stripVariationSelectors(String(raw));
        }
        else if (Array.isArray(raw)) {
            value = raw.join(' · ');
        }
        else {
            value = stripVariationSelectors(String(raw));
        }
        if (!value)
            continue;
        lines.push(`<li><b>${item.label}</b>：${value}</li>`);
    }
    if (lines.length === 0)
        return '';
    const { emoji, ...attrs } = DOC_INFO_CALLOUT;
    const attrStr = Object.entries(attrs)
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ');
    const cleanEmoji = stripVariationSelectors(emoji);
    return [
        `<callout emoji="${cleanEmoji}" ${attrStr}>`,
        `<p><b>文档信息</b></p>`,
        `<ul>`,
        ...lines,
        `</ul>`,
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
export function calloutXmlToMeta(xml) {
    const result = {};
    // 找"文档信息"callout
    const calloutRe = /<callout\b[^>]*>\s*<p><b>文档信息<\/b><\/p>\s*<ul>([\s\S]*?)<\/ul>\s*<\/callout>/;
    const calloutMatch = xml.match(calloutRe);
    if (!calloutMatch)
        return result;
    const ulContent = calloutMatch[1];
    const liRe = /<li><b>([^<]+)<\/b>[：:](.+?)<\/li>/g;
    let m;
    while ((m = liRe.exec(ulContent)) !== null) {
        const label = m[1].trim();
        const value = unescapeFeishuTilde(m[2].trim());
        // 根据标签名映射到字段
        if (label === '标签') {
            const tag = parseTagValue(value);
            if (tag)
                result.标签 = tag;
        }
        else if (label === '编码') {
            result.编码 = value.replace(/^🔢\s*/, '').trim();
        }
        else if (label === '输入') {
            result.输入 = value.replace(/^📥\s*/, '').trim();
        }
        else if (label === '日期') {
            result.日期 = value.replace(/^📅\s*/, '').trim();
        }
        else if (label === '关键词') {
            result.关键词 = value.replace(/^🔑\s*/, '').trim();
        }
        else if (label === '评分') {
            // 提取评分显示串（如 "🌟🌟🌟｜实践"）
            result.评分_显示 = stripVariationSelectors(value);
            // 尝试提取数字
            const starCount = (value.match(/🌟/g) || []).length;
            if (starCount >= 1 && starCount <= 5) {
                result.评分 = starCount;
            }
        }
        else if (label === '索引') {
            // 索引是多维度合并显示（💰正财 · 🔵工作 · ...）
            // 需要进一步拆分各维度
            parseIndexField(value, result);
        }
    }
    return result;
}
/**
 * 解析索引合并字段 "💰正财 · 🔵工作 · ✅完成 · 🎯具象 · ✅简单 · ❤️健康"
 * 回各索引子字段。
 */
function parseIndexField(value, result) {
    const parts = value.split(/[·\n]/).map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
        const cleaned = stripVariationSelectors(part);
        // 知识库维度
        for (const kw of ['正财', '偏财', '正印', '偏印', '正宫', '伤官']) {
            if (cleaned.includes(kw)) {
                result.索引_知识库 = kw;
                break;
            }
        }
        // 颜色维度
        for (const kw of ['睡眠', '工作', '生活', '娱乐', '社交', '学习', '运动']) {
            if (cleaned.includes(kw)) {
                result.索引_颜色 = cleaned;
                break;
            }
        }
        // 操作维度
        for (const kw of ['想法', '规划', '执行', '受挫', '克服', '初稿', '审核', '修改', '完成', '复盘']) {
            if (cleaned.includes(kw)) {
                result['索引_操作&反馈'] = result['索引_操作&反馈'] ?? [];
                if (!result['索引_操作&反馈'].includes(kw))
                    result['索引_操作&反馈'].push(kw);
                break;
            }
        }
        // 块维度（多选）
        for (const kw of ['抽象', '具象', '简单', '困难']) {
            if (cleaned.includes(kw) && kw !== cleaned) {
                result.索引_块 = result.索引_块 ?? [];
                if (!result.索引_块.includes(kw))
                    result.索引_块.push(kw);
            }
        }
        // 风险维度（多选）
        for (const kw of ['行为', '管理', '健康', '知识', '社交', '家庭', '社会', '意外']) {
            if (cleaned.includes(kw) && kw !== cleaned) {
                result.索引_风险 = result.索引_风险 ?? [];
                if (!result.索引_风险.includes(kw))
                    result.索引_风险.push(kw);
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
export function feishuCalloutToOB(xml) {
    // 提取属性
    const openMatch = xml.match(/<callout\b([^>]*)>/);
    if (!openMatch)
        return xml;
    const attrs = openMatch[1];
    let emoji = '';
    let bgColor = '';
    const emojiMatch = attrs.match(/emoji=["']([^"']+)["']/);
    if (emojiMatch)
        emoji = stripVariationSelectors(emojiMatch[1]);
    const bgMatch = attrs.match(/background-color=["']([^"']+)["']/);
    if (bgMatch)
        bgColor = bgMatch[1];
    // 提取内容（去掉 open/close tag）
    const content = xml
        .replace(/<callout\b[^>]*>/, '')
        .replace(/<\/callout>/, '')
        .trim();
    // 映射 callout 类型
    const obType = mapFeishuBgToObType(bgColor);
    const lines = htmlBlockToTextLines(content);
    const title = `> [!${obType}]${emoji ? ` ${emoji}` : ''}`;
    if (lines.length === 0)
        return title;
    return [title, ...lines.map(line => `> ${line}`)].join('\n');
}
/**
 * 批量将飞书 XML 里的所有 callout 块转换为 OB callout。
 */
export function convertFeishuCalloutsToOB(xml) {
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
export function obCalloutToFeishu(md) {
    const lines = md.split('\n').map(l => l.replace(/^>\s?/, ''));
    if (lines.length === 0)
        return md;
    // 解析首行 `> [!type]`
    const headerMatch = lines[0].match(/\[!(\w+)\]\s*(.*)/);
    if (!headerMatch)
        return md;
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
export function convertOBCalloutsToFeishu(md) {
    // 匹配连续的 callout 块（以 > [! 开头的行，直到非 > 或空行）
    const calloutRe = /(?:^> \[!\w+\].*\n(?:^>.*\n?)*)/gm;
    return md.replace(calloutRe, (match) => obCalloutToFeishu(match));
}
//# sourceMappingURL=callout.js.map