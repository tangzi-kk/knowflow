/**
 * 新建或触碰文档时必须存在的 YAML 字段。
 *
 * 这些默认值只补“缺失”字段，不覆盖用户已有值；同步绑定和文档 ID
 * 仍由各自的事务流程负责生成，避免 shared 层引入运行时随机数。
 */
export declare const YAML_METADATA_DEFAULTS: Readonly<Record<string, unknown>>;
/** 补齐规范字段；数组默认值每次复制，避免调用方互相污染。 */
export declare function withCompleteFrontmatter(fm: Record<string, unknown>): Record<string, unknown>;
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
export declare function inspectFrontmatter(content: string): FrontmatterInspection;
/**
 * 将 frontmatter + body 拼成完整文件内容。
 */
export declare function assembleFile(fm: Record<string, unknown>, body: string, format?: {
    hasBom?: boolean;
    lineEnding?: '\n' | '\r\n';
}): string;
//# sourceMappingURL=yaml.d.ts.map