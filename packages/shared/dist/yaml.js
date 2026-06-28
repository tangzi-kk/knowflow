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
const FIELD_ORDER = [
    'feishu_id',
    'feishu_doc_id',
    'feishu_title',
    'sync_hash',
    'sync_time',
    '标签',
    '编码',
    '输入',
    '日期',
    '日期索引',
    '关键词',
    '概述',
    '评分',
    '评分_显示',
    '索引_知识库',
    '索引_颜色',
    '索引_操作&反馈',
    '索引_块',
    '索引_风险',
];
/** 空值跳过集合：仅跳过未设置；空字符串/空数组用于规范字段占位。 */
function isEmpty(v) {
    if (v === undefined || v === null)
        return true;
    return false;
}
/**
 * 将 frontmatter 对象序列化为 YAML 字符串（含 `---` 分隔符）。
 * 按规范顺序输出，跳过空值。
 */
export function serializeFrontmatter(fm) {
    const ordered = {};
    for (const key of FIELD_ORDER) {
        if (!isEmpty(fm[key])) {
            ordered[key] = fm[key];
        }
    }
    // 收尾：可能有多余字段不在 FIELD_ORDER 里（向后兼容）
    for (const [k, v] of Object.entries(fm)) {
        if (!(k in ordered) && !isEmpty(v)) {
            ordered[k] = v;
        }
    }
    const yamlStr = YAML.dump(ordered, {
        lineWidth: -1, // 不折行（表格等长行不破坏）
        quotingType: '"', // 字符串用双引号（保留 emoji）
        forceQuotes: false,
        sortKeys: false, // 我们自己控制顺序
    });
    return `${FM_DELIMITER}\n${yamlStr}${FM_DELIMITER}`;
}
/**
 * 从 md 文件内容解析 frontmatter。
 * @param content 完整文件内容
 * @returns { frontmatter, body }，frontmatter 为 null 表示无 frontmatter
 */
export function parseFrontmatter(content) {
    const trimmed = content.trimStart();
    if (!trimmed.startsWith(FM_DELIMITER)) {
        return { frontmatter: null, body: content };
    }
    // 找第二个 ---
    const rest = trimmed.slice(FM_DELIMITER.length);
    const secondDelim = rest.indexOf('\n' + FM_DELIMITER);
    if (secondDelim === -1) {
        return { frontmatter: null, body: content };
    }
    const yamlBlock = rest.slice(0, secondDelim);
    const body = rest.slice(secondDelim + FM_DELIMITER.length + 1).replace(/^\n+/, '');
    try {
        const fm = YAML.load(yamlBlock);
        return { frontmatter: fm ?? {}, body };
    }
    catch (e) {
        // YAML 解析失败：视为无 frontmatter
        console.warn('[sync/shared] frontmatter parse failed:', e);
        return { frontmatter: null, body: content };
    }
}
/**
 * 将 frontmatter + body 拼成完整文件内容。
 */
export function assembleFile(fm, body) {
    return `${serializeFrontmatter(fm)}\n\n${body}`;
}
//# sourceMappingURL=yaml.js.map