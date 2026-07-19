/**
 * localhost HTTP 协议契约（OB 插件 ↔ 浏览器扩展）。
 *
 * 依据：`00_同步方案设计_v2.md` §4.2 + 方案设计（填补文档缺口）。
 * 鉴权：每个请求带 header `X-Sync-Token: <启动令牌>`。
 * CORS：OB server 必须放通 OPTIONS 预检（扩展从飞书页面发起 fetch 会被拦）。
 */
/** 默认端口。可在 OB 插件设置页改。 */
export const DEFAULT_PORT = 4567;
/** 鉴权 header 名。 */
export const TOKEN_HEADER = 'X-Sync-Token';
/** 跨端协议版本；不一致时写操作必须失败关闭。 */
export const PROTOCOL_VERSION = 1;
/** 当前服务端实际提供的能力。 */
export const SERVER_CAPABILITIES = [
    'status',
    'tree',
    'fetch',
    'clip',
    'exists',
    'pushback',
];
/** 完整写入协议的最低能力集合。 */
export const REQUIRED_WRITE_CAPABILITIES = [
    'fetch',
    'clip',
    'pushback',
];
export function evaluateProtocolCompatibility(info, required = REQUIRED_WRITE_CAPABILITIES) {
    if (!info
        || typeof info.protocolVersion !== 'number'
        || !Array.isArray(info.capabilities)
        || typeof info.componentVersion !== 'string') {
        return { compatible: false, reason: 'Missing protocol metadata' };
    }
    if (info.protocolVersion !== PROTOCOL_VERSION) {
        return {
            compatible: false,
            reason: `Protocol version mismatch: browser=${PROTOCOL_VERSION}, obsidian=${info.protocolVersion}`,
        };
    }
    const capabilities = new Set(info.capabilities);
    const missing = required.filter((capability) => !capabilities.has(capability));
    if (missing.length > 0) {
        return {
            compatible: false,
            reason: `Missing required capabilities: ${missing.join(', ')}`,
        };
    }
    return { compatible: true };
}
/** 所有端点定义（路径 + 方法），供两端引用避免拼写漂移。 */
export const ENDPOINTS = {
    status: '/status',
    tree: '/tree',
    fetch: '/fetch',
    clip: '/clip',
    exists: '/exists',
    pushback: '/pushback',
};
/** Obsidian 系统协议：浏览器主通道动作名。 */
export const OBSIDIAN_LARK_DOC_ACTION = 'lark-doc';
/** Obsidian 系统协议：浏览器主通道 URI 前缀。 */
export const OBSIDIAN_LARK_DOC_URI_PREFIX = `obsidian://${OBSIDIAN_LARK_DOC_ACTION}`;
/**
 * 构造 `obsidian://lark-doc` URI。
 *
 * Ponytail: 用浏览器和系统已有的自定义协议能力承载主通道，
 * 不再为“点击飞书按钮”额外发明一套后台消息协议。
 */
export function buildObsidianLarkDocUri(params) {
    const token = params.token || params.node_token || params.obj_token;
    const query = [
        ['token', token],
        ['node_token', params.node_token],
        ['obj_token', params.obj_token],
        ['space_id', params.space_id],
        ['title', params.title],
        ['url', params.url],
        ['dir', params.dir],
    ];
    const encoded = query
        .filter(([, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
    return encoded ? `${OBSIDIAN_LARK_DOC_URI_PREFIX}?${encoded}` : OBSIDIAN_LARK_DOC_URI_PREFIX;
}
/** 解析 `obsidian://lark-doc` URI 或 Obsidian protocol handler params。 */
export function parseObsidianLarkDocParams(input) {
    const searchParams = (() => {
        if (typeof input === 'string') {
            const query = input.includes('?') ? input.slice(input.indexOf('?') + 1) : input;
            return new URLSearchParams(query);
        }
        if (input instanceof URLSearchParams)
            return input;
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(input)) {
            if (value !== undefined)
                params.set(key, value);
        }
        return params;
    })();
    const get = (key) => searchParams.get(key) || undefined;
    const parsed = {};
    for (const key of ['token', 'node_token', 'obj_token', 'space_id', 'title', 'url', 'dir']) {
        const value = get(key);
        if (value !== undefined)
            parsed[key] = value;
    }
    return parsed;
}
//# sourceMappingURL=protocol.js.map