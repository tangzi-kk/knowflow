/**
 * 浏览器扩展 → OB 插件的 HTTP 客户端。
 *
 * 依据方案 §2（localhost HTTP 协议）：
 * - 每个请求带 X-Sync-Token header
 * - 端点：/status /tree /fetch /exists /pushback
 * - 重试 + 超时
 */
import {
  TOKEN_HEADER,
  DEFAULT_PORT,
  type StatusResponse,
  type TreeResponse,
  type FetchRequest,
  type FetchResponse,
  type ClipRequest,
  type ClipResponse,
  type ExistsRequest,
  type ExistsResponse,
  type ErrorResponse,
} from '@sync/shared';

/** 扩展存储的连接配置。 */
export interface SyncConfig {
  /** OB 插件 host（默认 localhost）。 */
  host: string;
  /** 端口（默认 4567）。 */
  port: number;
  /** 启动令牌。 */
  token: string;
}

export interface PropertyTemplate {
  标签: string;
  编码: string;
  输入: string;
  日期: string;
  日期索引: string;
  关键词: string;
  概述: string;
  评分: string;
  评分_显示: string;
  索引_知识库: string;
  索引_颜色: string;
  '索引_操作&反馈': string;
  索引_块: string;
  索引_风险: string;
}

export type PropertyOptionKey = keyof Pick<
  PropertyTemplate,
  '标签' | '日期索引' | '评分' | '评分_显示' | '索引_知识库' | '索引_颜色' | '索引_操作&反馈' | '索引_块' | '索引_风险'
>;

export type PropertyOptions = Record<PropertyOptionKey, string>;

export interface InterpreterConfig {
  enabled: boolean;
  autoRun: boolean;
  customProviderEnabled?: boolean;
  provider: string;
  baseUrl: string;
  model: string;
  apiKey: string;
  context: string;
  excerptChars?: number;
}

export type SuggestedMeta = Partial<Record<keyof PropertyTemplate, string | number | string[]>>;

export interface InterpreterInput {
  title: string;
  source: string;
  dir: string;
  excerpt?: string;
  template: PropertyTemplate;
  options: PropertyOptions;
}

export const DEFAULT_CONFIG: SyncConfig = {
  host: '127.0.0.1',
  port: DEFAULT_PORT,
  token: '',
};

export const DEFAULT_PROPERTY_TEMPLATE: PropertyTemplate = {
  标签: 'S',
  编码: '',
  输入: '{{dir}}',
  日期: '{{date}}',
  日期索引: '',
  关键词: '{{keywords}}',
  概述: '',
  评分: '',
  评分_显示: '',
  索引_知识库: '',
  索引_颜色: '',
  '索引_操作&反馈': '',
  索引_块: '',
  索引_风险: '',
};

export const DEFAULT_PROPERTY_OPTIONS: PropertyOptions = {
  标签: '📥S_收集, 🎯X_项目, 🌳L_领域, 📚Z_资源, 💡Q_灵感, 🛠️J_技能',
  日期索引: '⌚时间, 🔄周期性, 🌄情景式, ⏳倒计时, 🏆里程碑, 😊心情, ☁️习惯, 💡灵感, 📈活跃时间',
  评分: '🌟, 🌟🌟, 🌟🌟🌟, 🌟🌟🌟🌟, 🌟🌟🌟🌟🌟',
  评分_显示: '🌟·素材, 🌟🌟·整理, 🌟🌟🌟·实践, 🌟🌟🌟🌟·通用, 🌟🌟🌟🌟🌟·体系',
  索引_知识库: '💼正财（主业）, 🧧偏财（副业）, 👨‍🏫正印（前辈）, 👥偏印（伙伴）, ❤️正宫（爱情）, 👨‍👩‍👧‍👦伤官（家人｜朋友）',
  索引_颜色: '⚪灰色·睡眠, 🔵蓝色·工作, 🟢深绿·生活, 🔴红色·娱乐, 🟡黄色·社交, 🟣紫色·学习, 🟢浅绿·运动',
  '索引_操作&反馈': '💡想法, 📋规划, 🚀执行, 🚫受挫, 💪克服, 📝初稿, 🔍审核, ✏️修改, ✅完成, 📊复盘',
  索引_块: '💭抽象, 🎯具象, ✅简单, 🚧困难',
  索引_风险: '👣行为, ⚙️管理, ❤️健康, 🧠知识, 🗣️社交, 👨‍👩‍👧‍👦家庭, 🌆社会, 🚨意外',
};

export function normalizePropertyOptionValue(key: string, value: string): string {
  const raw = value.trim();
  if (!raw) return '';

  if (key === '标签') {
    const tag = raw.match(/([SXLZQJ])(?:_|$)/)?.[1];
    return tag ?? raw;
  }

  if (key === '评分') {
    const explicit = raw.match(/[1-5]/)?.[0];
    if (explicit) return explicit;
    const stars = Array.from(raw.matchAll(/🌟/g)).length;
    return stars > 0 ? String(Math.min(stars, 5)) : raw;
  }

  if (key === '日期索引') {
    const dateIndex = pickKnownValue(raw, ['时间', '周期性', '情景式', '倒计时', '里程碑', '心情', '习惯', '灵感', '活跃时间']);
    return dateIndex ? `#📅日期/${dateIndex}` : raw;
  }

  if (key === '索引_知识库') {
    return pickKnownValue(raw, ['正财', '偏财', '正印', '偏印', '正宫', '伤官']) ?? raw;
  }

  if (key === '索引_颜色') {
    const color = pickKnownValue(raw, ['灰色', '蓝色', '深绿', '红色', '黄色', '紫色', '浅绿']);
    const domain = pickKnownValue(raw, ['睡眠', '工作', '生活', '娱乐', '社交', '学习', '运动']);
    return color && domain ? `${color}${domain}` : raw;
  }

  if (key === '索引_操作&反馈') {
    return pickKnownValue(raw, ['想法', '规划', '执行', '受挫', '克服', '初稿', '审核', '修改', '完成', '复盘']) ?? raw;
  }

  if (key === '索引_块') {
    return pickKnownValue(raw, ['抽象', '具象', '简单', '困难']) ?? raw;
  }

  if (key === '索引_风险') {
    return pickKnownValue(raw, ['行为', '管理', '健康', '知识', '社交', '家庭', '社会', '意外']) ?? raw;
  }

  return raw;
}

function pickKnownValue(raw: string, values: string[]): string | undefined {
  return values.find((value) => raw.includes(value));
}

export const DEFAULT_INTERPRETER_CONFIG: InterpreterConfig = {
  enabled: true,
  autoRun: false,
  customProviderEnabled: false,
  provider: 'NewAPI',
  baseUrl: 'http://127.0.0.1:3000/v1',
  model: 'smart',
  apiKey: '',
  excerptChars: 4000,
  context: '从页面标题、URL、正文摘要和目标目录推断 Obsidian YAML 属性。通过 NewAPI 角色路由调用本地中转；保持保守，不确定的字段留空。',
};

/** 从 chrome.storage 加载配置。 */
export async function loadConfig(): Promise<SyncConfig> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['syncConfig'], (result) => {
      resolve({ ...DEFAULT_CONFIG, ...(result.syncConfig ?? {}) });
    });
  });
}

export async function loadPropertyTemplate(): Promise<PropertyTemplate> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['propertyTemplate'], (result) => {
      resolve({ ...DEFAULT_PROPERTY_TEMPLATE, ...(result.propertyTemplate ?? {}) });
    });
  });
}

export async function loadPropertyOptions(): Promise<PropertyOptions> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['propertyOptions'], (result) => {
      resolve({ ...DEFAULT_PROPERTY_OPTIONS, ...(result.propertyOptions ?? {}) });
    });
  });
}

export async function savePropertyTemplate(template: PropertyTemplate): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ propertyTemplate: template }, () => resolve());
  });
}

export async function savePropertyOptions(options: PropertyOptions): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ propertyOptions: options }, () => resolve());
  });
}

export async function loadInterpreterConfig(): Promise<InterpreterConfig> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['interpreterConfig'], (syncResult) => {
      chrome.storage.local.get(['interpreterApiKey'], (localResult) => {
        resolve({
          ...DEFAULT_INTERPRETER_CONFIG,
          ...(syncResult.interpreterConfig ?? {}),
          apiKey: localResult.interpreterApiKey ?? '',
        });
      });
    });
  });
}

export async function saveInterpreterConfig(config: InterpreterConfig): Promise<void> {
  const { apiKey, ...syncConfig } = config;
  return new Promise((resolve) => {
    chrome.storage.sync.set({ interpreterConfig: syncConfig }, () => {
      chrome.storage.local.set({ interpreterApiKey: apiKey }, () => resolve());
    });
  });
}

export async function suggestMetaWithInterpreter(
  config: InterpreterConfig,
  input: InterpreterInput,
): Promise<SuggestedMeta> {
  if (!config.enabled) throw new Error('解释器未启用');
  if (!config.baseUrl || !config.model) throw new Error('请先配置 AI 中转地址和路由模型');
  if (/newapi/i.test(config.provider) && !config.apiKey) throw new Error('请先在 AI 解释器设置里填写 NewAPI API Key');

  const endpoint = `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: [
              '你是 Obsidian 知识库同步插件的属性建议器。',
              '只根据给定标题、URL、目录和可选项建议 YAML 属性。',
              '人工确认优先；你只提供建议，不要编造没有证据的字段。',
              '输出严格 JSON，不要 Markdown。',
            ].join('\n'),
          },
          {
            role: 'user',
            content: JSON.stringify({
              task: '为飞书文档建议 Obsidian YAML 属性',
              title: input.title,
              source: input.source,
              targetDir: input.dir,
              excerpt: input.excerpt ?? '',
              template: input.template,
              options: input.options,
              rules: {
                标签: '必须从 S/X/L/Z/Q/J 中选一个；不确定选 S。',
                评分: '可为空；有证据时从 1-5 选一个。',
                评分_显示: '与评分对应：🌟｜素材 到 🌟🌟🌟🌟🌟｜体系。',
                日期索引: '可多选：#📅日期/时间、#📅日期/周期性、#📅日期/情景式、#📅日期/倒计时、#📅日期/里程碑、#📅日期/心情、#📅日期/习惯、#📅日期/灵感、#📅日期/活跃时间；普通文章返回空数组。',
                概述: '生成 1-3 句、80-160 字的文档概述。概述要说明主题、用途和可复用价值，方便未来 AI 不读全文也能判断内容。',
                索引_知识库: '从正财/偏财/正印/偏印/正宫/伤官中选，没证据留空。',
                索引_颜色: '从颜色索引中选一个，没证据留空。',
                '索引_操作&反馈': '返回数组，最多 2 项。第一组只可选一个：想法/规划/执行/受挫/克服；第二组只可选一个：初稿/审核/修改/完成/复盘。不确定的组留空，不能同组多选。',
                索引_块: '返回数组，最多 2 项。第一组只可选一个：抽象/具象；第二组只可选一个：简单/困难。不确定的组留空，不能同组多选。',
                索引_风险: '可多选：行为/管理/健康/知识/社交/家庭/社会/意外，没证据返回空数组。',
                关键词: '提取 3-6 个关键词，用顿号分隔。',
              },
              outputSchema: {
                标签: 'string',
                日期索引: 'string_array',
                关键词: 'string',
                概述: 'string',
                评分: 'number_or_empty_string',
                评分_显示: 'string',
                索引_知识库: 'string',
                索引_颜色: 'string',
                '索引_操作&反馈': 'string_array',
                索引_块: 'string_array',
                索引_风险: 'string_array',
              },
            }),
          },
        ],
      }),
    });
  } catch (err) {
    throw new Error(`无法连接 AI 中转：${err instanceof Error ? err.message : String(err)}。请确认 ${config.baseUrl} 可访问，且 Chrome 已重载扩展。`);
  }

  const data = await res.json() as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };

  if (!res.ok) {
    throw new Error(data.error?.message || `AI 请求失败：HTTP ${res.status}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI 未返回建议内容');

  try {
    return JSON.parse(content) as SuggestedMeta;
  } catch {
    throw new Error(`AI 返回非 JSON：${content.slice(0, 160)}`);
  }
}

/** 保存配置到 chrome.storage。 */
export async function saveConfig(config: SyncConfig): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ syncConfig: config }, () => resolve());
  });
}

/** 构造 baseUrl。 */
function baseUrl(config: SyncConfig): string {
  return `http://${config.host}:${config.port}`;
}

/** 通用请求。 */
async function request<T>(
  config: SyncConfig,
  method: string,
  path: string,
  body?: unknown,
  timeoutMs = 60000,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl(config)}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        [TOKEN_HEADER]: config.token,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`OB 插件返回非 JSON：${text.slice(0, 200)}`);
    }

    if (!res.ok) {
      const err = data as ErrorResponse;
      if (res.status === 401 || err.code === 'UNAUTHORIZED') {
        throw new Error('OB 插件启动令牌无效或未填写。请在 Obsidian「飞书同步」设置页复制启动令牌，再到浏览器扩展设置页保存同一个令牌。');
      }
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    return data as T;
  } finally {
    clearTimeout(timer);
  }
}

/** GET /status — 健康检查。 */
export async function getStatus(config: SyncConfig): Promise<StatusResponse> {
  return request<StatusResponse>(config, 'GET', '/status', undefined, 5000);
}

/** GET /tree — 目录树。 */
export async function getTree(config: SyncConfig): Promise<TreeResponse> {
  return request<TreeResponse>(config, 'GET', '/tree?maxDepth=12', undefined, 10000);
}

/** POST /fetch — 触发同步。 */
export async function postFetch(
  config: SyncConfig,
  req: FetchRequest,
): Promise<FetchResponse> {
  return request<FetchResponse>(config, 'POST', '/fetch', req, 120000);
}

/** POST /clip — 任意网页/划词剪存。 */
export async function postClip(
  config: SyncConfig,
  req: ClipRequest,
): Promise<ClipResponse> {
  return request<ClipResponse>(config, 'POST', '/clip', req, 30000);
}

/** POST /exists — 检查是否已同步。 */
export async function postExists(
  config: SyncConfig,
  req: ExistsRequest,
): Promise<ExistsResponse> {
  return request<ExistsResponse>(config, 'POST', '/exists', req, 10000);
}

/** 测试连接（调 /status）。 */
export async function testConnection(config: SyncConfig): Promise<{ ok: boolean; message: string }> {
  try {
    const status = await getStatus(config);
    if (!status.larkReady) {
      return { ok: false, message: `OB 插件已连接，但 lark-cli 未就绪（${status.larkVersion ?? '未找到'}）` };
    }
    return {
      ok: true,
      message: `✅ 连接成功：vault=${status.vault}，lark-cli=${status.larkVersion}`,
    };
  } catch (err) {
    return {
      ok: false,
      message: `❌ 连接失败：${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
