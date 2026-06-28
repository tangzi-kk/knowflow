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
export const FEISHU_PROTO = 'feishu://';
/** 飞书 internal-api 图片域名（识别需登录态的临时链接）。 */
const INTERNAL_API_HOST = 'internal-api-drive-stream.feishu.cn';
const INTERNAL_API_HOST_LARK = 'internal-api-drive-stream.larksuite.com';
/** file_token 格式：飞书 token 是 base62-ish，长度 ~28。 */
const TOKEN_RE = /[A-Za-z0-9]{20,}/;
/**
 * 从飞书 internal-api authcode URL 里提取 file_token。
 * URL 形如 `https://internal-api-drive-stream.feishu.cn/drive-stream/<TOKEN>/<extra>?authcode=...`
 * 取路径段中最长的 token-like 子串。
 * @returns token 或 null（无法识别）
 */
export function extractTokenFromAuthcodeUrl(url) {
    if (!url)
        return null;
    let u;
    try {
        u = new URL(url);
    }
    catch {
        return null;
    }
    const host = u.hostname;
    if (host !== INTERNAL_API_HOST && host !== INTERNAL_API_HOST_LARK)
        return null;
    const segments = u.pathname.split('/').filter(Boolean);
    let best = null;
    for (const seg of segments) {
        const m = seg.match(TOKEN_RE);
        if (m && (!best || m[0].length > best.length))
            best = m[0];
    }
    return best;
}
/**
 * 把 md 正文里的 internal-api authcode 图片链接替换为 `feishu://TOKEN`。
 * 提供一个 token 映射表（xml 导出拿到的 src token → href 可能含同 token）。
 * 对找不到映射的 authcode URL，尝试就地 extract。
 *
 * @param md 正文 markdown
 * @param tokenMap xml 导出拿到的 file_token 集合（用于精确匹配）
 */
export function rewriteImagesToFeishuProto(md, tokenMap = new Set()) {
    // 匹配 ![alt](url) 形式的图片，url 是 internal-api 链接
    const imgRe = /!\[([^\]]*)\]\(([^)]+)\)/g;
    return md.replace(imgRe, (full, alt, url) => {
        const trimmed = url.trim().replace(/^<|>$/g, '');
        // 已经是 feishu:// 协议，跳过
        if (trimmed.startsWith(FEISHU_PROTO))
            return full;
        // internal-api 链接：提 token
        if (trimmed.includes(INTERNAL_API_HOST) ||
            trimmed.includes(INTERNAL_API_HOST_LARK)) {
            const token = pickExactToken(tokenMap, trimmed) ?? extractTokenFromAuthcodeUrl(trimmed) ?? pickFromMap(tokenMap);
            if (token)
                return `![${alt}](${FEISHU_PROTO}${token})`;
        }
        // 普通外链或 base64，原样保留
        return full;
    });
}
/** 从 tokenMap 里取一个（fallback，用于顺序匹配场景，调用方应优先精确匹配）。 */
function pickFromMap(tokenMap) {
    if (tokenMap instanceof Map)
        return null;
    if (tokenMap.size === 0)
        return null;
    return tokenMap.values().next().value ?? null;
}
function pickExactToken(tokenMap, url) {
    if (!(tokenMap instanceof Map))
        return null;
    return tokenMap.get(url) ?? tokenMap.get(url.replace(/&amp;/g, '&')) ?? null;
}
/**
 * 从 xml 里提取所有 `<img src="TOKEN" .../>` 的 file_token。
 * 飞书 xml 的 src 直接就是 file_token（不是 URL）。
 */
export function extractImgTokensFromXml(xml) {
    const tokens = new Set();
    const imgRe = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*\/?>/g;
    let m;
    while ((m = imgRe.exec(xml)) !== null) {
        const src = m[1].trim();
        if (src.startsWith(FEISHU_PROTO)) {
            tokens.add(src.slice(FEISHU_PROTO.length));
        }
        else if (TOKEN_RE.test(src) && !src.startsWith('http')) {
            tokens.add(src);
        }
    }
    return [...tokens];
}
/**
 * 从飞书 XML 提取 `href 临时图链 -> src file_token` 映射。
 * markdown 导出只给临时 authcode URL；XML 的 src 才是可长期保存的 file_token。
 */
export function extractImgTokenMapFromXml(xml) {
    const map = new Map();
    const imgRe = /<img\b[^>]*>/g;
    let m;
    while ((m = imgRe.exec(xml)) !== null) {
        const tag = m[0];
        const src = attr(tag, 'src');
        const href = attr(tag, 'href');
        if (!src || !href || src.startsWith('http'))
            continue;
        if (!TOKEN_RE.test(src))
            continue;
        map.set(decodeXmlAttr(href), src);
    }
    return map;
}
function attr(tag, name) {
    const re = new RegExp(`\\b${name}=["']([^"']+)["']`);
    return tag.match(re)?.[1] ?? null;
}
function decodeXmlAttr(value) {
    return value
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}
/**
 * 从 md 正文里提取所有 feishu://TOKEN。
 */
export function extractFeishuImageTokens(md) {
    const tokens = new Set();
    const re = new RegExp(`!\\[[^\\]]*\\]\\(${FEISHU_PROTO.replace('/', '\\/')}([A-Za-z0-9]+)\\)`, 'g');
    let m;
    while ((m = re.exec(md)) !== null) {
        tokens.add(m[1]);
    }
    return [...tokens];
}
/**
 * 把 OB 正文里的 `![](feishu://TOKEN)` 还原为飞书 xml `<img src="TOKEN"/>`。
 * 用于 OB→飞书回写（md 部分用 markdown，图片需用 xml 标签才能被飞书识别为已有 token）。
 */
export function feishuProtoToXml(md) {
    const re = /!\[([^\]]*)\]\(feishu:\/\/([A-Za-z0-9]+)\)/g;
    return md.replace(re, (_full, _alt, token) => {
        return `<img src="${token}"/>`;
    });
}
//# sourceMappingURL=image.js.map