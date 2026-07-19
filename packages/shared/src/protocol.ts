import type { KnowledgeMeta } from './types.js';

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

export type SyncCapability = 'status' | 'tree' | 'fetch' | 'clip' | 'exists' | 'pushback';

export interface ProtocolInfo {
  protocolVersion: number;
  capabilities: string[];
  componentVersion: string;
}

export interface ProtocolCompatibility {
  compatible: boolean;
  reason?: string;
}

/** 当前服务端实际提供的能力。 */
export const SERVER_CAPABILITIES: readonly SyncCapability[] = [
  'status',
  'tree',
  'fetch',
  'clip',
  'exists',
  'pushback',
];

/** 完整写入协议的最低能力集合。 */
export const REQUIRED_WRITE_CAPABILITIES: readonly SyncCapability[] = [
  'fetch',
  'clip',
  'pushback',
];

export function evaluateProtocolCompatibility(
  info: Partial<ProtocolInfo> | null | undefined,
  required: readonly SyncCapability[] = REQUIRED_WRITE_CAPABILITIES,
): ProtocolCompatibility {
  if (
    !info
    || typeof info.protocolVersion !== 'number'
    || !Array.isArray(info.capabilities)
    || typeof info.componentVersion !== 'string'
  ) {
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

/** 飞书文档 URL 解析结果。 */
export interface FeishuDocRef {
  /** wiki node_token（优先用，唯一绑定）。 */
  node_token?: string;
  /** docx obj_token（回写用）。 */
  obj_token?: string;
  /** space_id（部分操作需要，可选）。 */
  space_id?: string;
}

/** GET /status 响应。 */
export interface StatusResponse extends ProtocolInfo {
  ok: true;
  /** 插件版本。 */
  version: string;
  /** vault 名。 */
  vault: string;
  /** lark-cli 是否就绪。 */
  larkReady: boolean;
  /** lark-cli 版本（探测不到时为 null）。 */
  larkVersion: string | null;
  /** 最近活动的无敏感元数据摘要。 */
  recentActivity?: Array<{
    time: string;
    kind: string;
    status: string;
    action?: string;
    title?: string;
    path?: string;
    errorCode?: string;
  }>;
}

/** 目录树节点（给扩展目录下拉用）。 */
export interface TreeNode {
  /** 相对 vault 根的路径，如 "0️⃣输入/💡碎片输入（闪念）"。 */
  path: string;
  /** 显示名（最后一段）。 */
  label: string;
  /** 深度（根=0）。 */
  depth: number;
}

/** GET /tree 响应。 */
export interface TreeResponse {
  ok: true;
  dirs: TreeNode[];
}

/** POST /fetch 请求。 */
export interface FetchRequest {
  /** 重试时保持不变的幂等请求 ID。 */
  requestId?: string;
  /** 必填：wiki node_token。 */
  node_token: string;
  /** 可选：docx obj_token（未给则插件用 wiki +node-get 解析）。 */
  obj_token?: string;
  /** 可选：space_id。 */
  space_id?: string;
  /** 落地目录（相对 vault 根），未给用设置默认值。 */
  dir?: string;
  /** 覆盖文件名（不含扩展名），未给用飞书标题清洗结果。 */
  filename?: string;
  /** 浏览器同步前确认后的 YAML 元数据覆盖；仅限知识库元数据字段。 */
  meta?: Partial<KnowledgeMeta>;
  /** OB 内部使用：Clipper 占位文件路径，命中时原位覆盖。 */
  replace_path?: string;
}

/** POST /fetch 响应。 */
export interface FetchResponse {
  ok: true;
  /** 落地完整路径（相对 vault 根）。 */
  path: string;
  /** 文件名（含扩展名）。 */
  filename: string;
  /** 本次是新建还是更新。 */
  action: 'created' | 'updated';
  /** 分配到的编码（auto-rename 触发后）。 */
  编码?: string;
  /** 飞书原始标题。 */
  feishu_title: string;
}

/** POST /clip 请求：任意网页/划词剪存到 Obsidian。 */
export interface ClipRequest {
  /** 重试时保持不变的幂等请求 ID。 */
  requestId?: string;
  /** 网页标题。 */
  title?: string;
  /** 来源 URL。 */
  url?: string;
  /** 来源类型。 */
  sourceKind?: 'feishu-base' | 'article' | 'selection' | 'generic-page';
  /** 选中文本或正文摘要。 */
  text?: string;
  /** AI 或规则转换后的 Obsidian Markdown 正文。 */
  bodyMarkdown?: string;
  /** 原始可见文本。 */
  rawText?: string;
  /** 页面描述。 */
  description?: string;
  /** 落地目录（相对 vault 根）。未给用 OB 插件默认目录。 */
  dir?: string;
  /** 勾选“补充到已有文档”时，追加到这个相对 vault 根的 Markdown 路径。 */
  appendPath?: string;
  /** 已按插件预设归一化的 YAML 元数据。 */
  meta?: Record<string, unknown>;
}

/** POST /clip 响应。 */
export interface ClipResponse {
  ok: true;
  /** 落地完整路径（相对 vault 根）。 */
  path: string;
  /** 文件名（含扩展名）。 */
  filename: string;
  /** 本次是新建还是更新。 */
  action: 'created' | 'updated';
}

/** POST /exists 请求。 */
export interface ExistsRequest {
  node_token: string;
}

/** POST /exists 响应。 */
export interface ExistsResponse {
  ok: true;
  exists: boolean;
  /** 已存在时给出相对 vault 根路径。 */
  path?: string;
}

/** POST /pushback 请求。 */
export interface PushbackRequest {
  /** 重试时保持不变的幂等请求 ID。 */
  requestId?: string;
  /** 二选一：本地路径（相对 vault 根）。 */
  path?: string;
  /** 二选一：node_token（从绑定找文件）。 */
  node_token?: string;
  /** 强制回写（忽略 hash 一致跳过）。 */
  force?: boolean;
}

/** POST /pushback 响应。 */
export interface PushbackResponse {
  ok: true;
  /** 实际回写还是跳过（hash 一致）。 */
  action: 'pushed' | 'skipped';
  /** 新的 sync_hash。 */
  hash?: string;
  /** 回写的飞书文档标题。 */
  title?: string;
}

/** 统一错误响应。 */
export interface ErrorResponse {
  ok: false;
  /** 机器可读错误码。 */
  code: string;
  /** 人类可读消息。 */
  message: string;
}

/** 所有端点定义（路径 + 方法），供两端引用避免拼写漂移。 */
export const ENDPOINTS = {
  status: '/status',
  tree: '/tree',
  fetch: '/fetch',
  clip: '/clip',
  exists: '/exists',
  pushback: '/pushback',
} as const;

/** Obsidian 系统协议：浏览器主通道动作名。 */
export const OBSIDIAN_LARK_DOC_ACTION = 'lark-doc';

/** Obsidian 系统协议：浏览器主通道 URI 前缀。 */
export const OBSIDIAN_LARK_DOC_URI_PREFIX = `obsidian://${OBSIDIAN_LARK_DOC_ACTION}`;

/** obsidian://lark-doc 参数。 */
export interface ObsidianLarkDocParams {
  /** v3 主通道兼容字段，优先传 wiki node_token。 */
  token?: string;
  /** wiki node_token。 */
  node_token?: string;
  /** docx obj_token。 */
  obj_token?: string;
  /** 飞书知识库 space_id。 */
  space_id?: string;
  /** 页面标题。 */
  title?: string;
  /** 原始飞书 URL。 */
  url?: string;
  /** 可选目标目录；为空时由 OB 端选择或使用默认目录。 */
  dir?: string;
}

/**
 * 构造 `obsidian://lark-doc` URI。
 *
 * Ponytail: 用浏览器和系统已有的自定义协议能力承载主通道，
 * 不再为“点击飞书按钮”额外发明一套后台消息协议。
 */
export function buildObsidianLarkDocUri(params: ObsidianLarkDocParams): string {
  const token = params.token || params.node_token || params.obj_token;
  const query: Array<[string, string | undefined]> = [
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
export function parseObsidianLarkDocParams(
  input: string | URLSearchParams | Record<string, string | undefined>,
): ObsidianLarkDocParams {
  const searchParams = (() => {
    if (typeof input === 'string') {
      const query = input.includes('?') ? input.slice(input.indexOf('?') + 1) : input;
      return new URLSearchParams(query);
    }
    if (input instanceof URLSearchParams) return input;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) params.set(key, value);
    }
    return params;
  })();

  const get = (key: keyof ObsidianLarkDocParams): string | undefined =>
    searchParams.get(key) || undefined;

  const parsed: ObsidianLarkDocParams = {};
  for (const key of ['token', 'node_token', 'obj_token', 'space_id', 'title', 'url', 'dir'] as const) {
    const value = get(key);
    if (value !== undefined) parsed[key] = value;
  }
  return parsed;
}

/** 进度阶段（扩展浮层用）。 */
export type ProgressStage =
  | 'connecting'
  | 'fetching-md'
  | 'fetching-xml'
  | 'rewriting-images'
  | 'writing-file'
  | 'assigning-code'
  | 'done'
  | 'error';
