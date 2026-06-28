/**
 * 飞书标题 → 安全文件名清洗。依据 `00_同步方案设计_v2.md` §二步骤 ②。
 * 跨平台非法字符（Windows/macOS/Linux 并集）：/ \ : * ? " < > |
 * 以及控制字符、首尾点号/空格（Windows 禁止）。
 */
const ILLEGAL = /[\/\\:*?"<>|]/g;
const CONTROL = /[\x00-\x1f\x7f]/g;
/**
 * 清洗飞书标题为安全文件名（不含扩展名）。
 * - 去非法字符 → 用下划线替换
 * - 折叠连续空白
 * - 去首尾点号/空格
 * - 截断到 100 字符（保留编码前缀空间）
 * - 空标题回退到 "未命名"
 */
export function sanitizeFilename(title) {
    let s = (title ?? '').trim();
    s = s.replace(ILLEGAL, '_').replace(CONTROL, '');
    s = s.replace(/\s+/g, ' ').trim();
    // Windows 禁止首尾点号/空格
    s = s.replace(/^[\.\s]+|[\.\s]+$/g, '');
    if (s.length > 100)
        s = s.slice(0, 100).trim();
    return s || '未命名';
}
/**
 * 加 .md 扩展（若已有就不重复加）。
 */
export function withMdExt(name) {
    return name.toLowerCase().endsWith('.md') ? name : `${name}.md`;
}
/**
 * 拼接目录与文件名（处理斜杠）。
 * @param dir 相对 vault 根的目录，如 "0️⃣输入/💡碎片输入"
 * @param filename 文件名（含扩展名）
 */
export function joinPath(dir, filename) {
    if (!dir || dir === '.' || dir === '/')
        return filename;
    const d = dir.replace(/[\/\\]+$/, '').replace(/^[\/\\]+/, '');
    return d ? `${d}/${filename}` : filename;
}
//# sourceMappingURL=filename.js.map