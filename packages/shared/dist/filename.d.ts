/**
 * 飞书标题 → 安全文件名清洗。依据 `00_同步方案设计_v2.md` §二步骤 ②。
 * 跨平台非法字符（Windows/macOS/Linux 并集）：/ \ : * ? " < > |
 * 以及控制字符、首尾点号/空格（Windows 禁止）。
 */
/**
 * 清洗飞书标题为安全文件名（不含扩展名）。
 * - 去非法字符 → 用下划线替换
 * - 折叠连续空白
 * - 去首尾点号/空格
 * - 截断到 100 字符（保留编码前缀空间）
 * - 空标题回退到 "未命名"
 */
export declare function sanitizeFilename(title: string): string;
/**
 * 加 .md 扩展（若已有就不重复加）。
 */
export declare function withMdExt(name: string): string;
/**
 * 拼接目录与文件名（处理斜杠）。
 * @param dir 相对 vault 根的目录，如 "0️⃣输入/💡碎片输入"
 * @param filename 文件名（含扩展名）
 */
export declare function joinPath(dir: string | undefined, filename: string): string;
//# sourceMappingURL=filename.d.ts.map