/**
 * 内容 hash（轻核验）。依据 `00_同步方案设计_v2.md` §6.2 步骤 2。
 * 用 sha256，只 hash 正文（不含 frontmatter 的 sync_* 字段，避免自指）。
 *
 * 跨环境：优先用 Web Crypto API（浏览器 + Node 18+ 都有 globalThis.crypto.subtle），
 * fallback 到 node:crypto（OB 插件 node 环境保险）。
 */
/** 同步版 sha256 hex（仅 Node 环境）。浏览器用 bodyHashAsync。 */
export declare function bodyHash(body: string): string;
/**
 * 元数据同步 hash。
 *
 * 正文 hash 不能发现“只改 YAML 编码/标签”的变更。这里单独对用户可见
 * 的知识元数据做稳定规范化，供 pushback 进行三方判断；同步绑定、文档
 * ID 和两个 hash 字段不参与，避免把本地身份字段误当成远端内容。
 */
export declare function metadataHash(meta: Record<string, unknown>): string;
/**
 * 异步 sha256 hex（浏览器 + Node 通用）。推荐使用。
 */
export declare function bodyHashAsync(body: string): Promise<string>;
/**
 * 比对是否变化。
 * @param current 当前正文 hash
 * @param last 上次同步写入的 sync_hash
 */
export declare function isChanged(current: string, last?: string): boolean;
//# sourceMappingURL=hash.d.ts.map