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