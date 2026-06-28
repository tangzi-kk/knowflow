/**
 * 图片 token 处理。依据 `00_同步方案设计_v2.md` §3.3 + `03_格式规范.md` §六。
 *
 * 飞书导出的图片链接形态：
 *   - md 导出：`![](https://internal-api-drive-stream.feishu.cn/.../authcode=...)`（需登录态，1h 过期）
 *   - xml 导出：`<img src="FILE_TOKEN" href="authcode_url"/>`（FILE_TOKEN 永久不过期）
 *
 * OB 里统一写成：`![](feishu://FILE_TOKEN)`
 * 预览时由 OB 插件调 `lark-cli docs +media-download` 换临时链接。
 */
/** OB 侧图片引用协议前缀。 */
export declare const FEISHU_PROTO = "feishu://";
/**
 * 从飞书 internal-api authcode URL 里提取 file_token。
 * URL 形如 `https://internal-api-drive-stream.feishu.cn/drive-stream/<TOKEN>/<extra>?authcode=...`
 * 取路径段中最长的 token-like 子串。
 * @returns token 或 null（无法识别）
 */
export declare function extractTokenFromAuthcodeUrl(url: string): string | null;
/**
 * 把 md 正文里的 internal-api authcode 图片链接替换为 `feishu://TOKEN`。
 * 提供一个 token 映射表（xml 导出拿到的 src token → href 可能含同 token）。
 * 对找不到映射的 authcode URL，尝试就地 extract。
 *
 * @param md 正文 markdown
 * @param tokenMap xml 导出拿到的 file_token 集合（用于精确匹配）
 */
export declare function rewriteImagesToFeishuProto(md: string, tokenMap?: Set<string> | Map<string, string>): string;
/**
 * 从 xml 里提取所有 `<img src="TOKEN" .../>` 的 file_token。
 * 飞书 xml 的 src 直接就是 file_token（不是 URL）。
 */
export declare function extractImgTokensFromXml(xml: string): string[];
/**
 * 从飞书 XML 提取 `href 临时图链 -> src file_token` 映射。
 * markdown 导出只给临时 authcode URL；XML 的 src 才是可长期保存的 file_token。
 */
export declare function extractImgTokenMapFromXml(xml: string): Map<string, string>;
/**
 * 从 md 正文里提取所有 feishu://TOKEN。
 */
export declare function extractFeishuImageTokens(md: string): string[];
/**
 * 把 OB 正文里的 `![](feishu://TOKEN)` 还原为飞书 xml `<img src="TOKEN"/>`。
 * 用于 OB→飞书回写（md 部分用 markdown，图片需用 xml 标签才能被飞书识别为已有 token）。
 */
export declare function feishuProtoToXml(md: string): string;
//# sourceMappingURL=image.d.ts.map