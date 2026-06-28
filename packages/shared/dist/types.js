/**
 * 同步绑定 + YAML frontmatter 数据模型。
 *
 * 依据：`设计方案/02_YAML字段规范.md`（权威 v1）+ `00_同步方案设计_v2.md` §5.1。
 * 铁律：同步绑定组（feishu_*）由插件自动写，用户不可手改。
 */
export const TAG_NAMES = {
    S: '📥收集',
    X: '🎯项目',
    L: '🌳领域',
    Z: '📚资源',
    Q: '💡灵感',
    J: '🛠️技能',
};
/**
 * YAML 字段 → 飞书 callout 行映射。依据 `02_YAML字段规范.md` §五。
 * 注意 emoji 全部不带 U+FE0F（飞书不认 VS，见 03 文档 §3.3）。
 */
export const CALLOUT_FIELD_MAP = [
    { field: '标签', label: '标签', emoji: '🏷' },
    { field: '编码', label: '编码', emoji: '🔢' },
    { field: '输入', label: '输入', emoji: '📥' },
    { field: '日期', label: '日期', emoji: '📅' },
    { field: '关键词', label: '关键词', emoji: '🔑' },
    { field: '评分_显示', label: '评分', emoji: '⭐' },
    { field: '索引_知识库', label: '索引', emoji: '💰' },
];
/** OB→飞书 callout 整体配色（合并信息块用）。 */
export const DOC_INFO_CALLOUT = {
    emoji: '📋',
    'background-color': 'light-blue',
    'border-color': 'blue',
};
/** 飞书 callout 背景色 → OB callout 类型。依据 `03_格式规范.md` §3.1。 */
export const FEISHU_BG_TO_OB_CALLOUT = {
    'light-yellow': 'tip',
    'medium-red': 'warning',
    'light-green': 'success',
    'light-blue': 'info',
    'light-purple': 'note',
    'light-gray': 'quote',
    'light-orange': 'faq',
};
/** OB callout 类型 → 飞书 callout 配色。§3.1 反向。 */
export const OB_CALLOUT_TO_FEISHU = {
    tip: { emoji: '💡', bg: 'light-yellow', border: 'yellow' },
    warning: { emoji: '⚠️', bg: 'medium-red', border: 'red' },
    success: { emoji: '✅', bg: 'light-green', border: 'green' },
    info: { emoji: 'ℹ️', bg: 'light-blue', border: 'blue' },
    note: { emoji: '📝', bg: 'light-purple', border: 'purple' },
    quote: { emoji: '💬', bg: 'light-gray', border: 'gray' },
    faq: { emoji: '❓', bg: 'light-orange', border: 'orange' },
    abstract: { emoji: '📋', bg: 'light-blue', border: 'blue' },
};
//# sourceMappingURL=types.js.map