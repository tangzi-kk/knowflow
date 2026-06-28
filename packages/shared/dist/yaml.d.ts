/**
 * 将 frontmatter 对象序列化为 YAML 字符串（含 `---` 分隔符）。
 * 按规范顺序输出，跳过空值。
 */
export declare function serializeFrontmatter(fm: Record<string, unknown>): string;
/**
 * 从 md 文件内容解析 frontmatter。
 * @param content 完整文件内容
 * @returns { frontmatter, body }，frontmatter 为 null 表示无 frontmatter
 */
export declare function parseFrontmatter(content: string): {
    frontmatter: Record<string, unknown> | null;
    body: string;
};
/**
 * 将 frontmatter + body 拼成完整文件内容。
 */
export declare function assembleFile(fm: Record<string, unknown>, body: string): string;
//# sourceMappingURL=yaml.d.ts.map