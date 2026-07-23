/**
 * Service worker（MV3 background）v3.0.1。
 * - 配置初始化
 * - 消息路由（连接检测 / Web Clipper / AI Chat / 飞书同步触发）
 * - 定期健康检查 + badge 更新
 */
import { DEFAULT_CONFIG, loadConfig, testConnection, saveConfig, postClip, postFetch } from './client.js';
import { sendDeepSeekWebMessage, getDeepSeekToken, setDeepSeekToken, isValidToken } from './deepseek-web.js';
import { GEMINI_WEB_MODELS, resolveAiRoute, type AiProvider } from './ai-routing.js';
import { AI_CONFIG_STORAGE, loadSecretBackedConfig, migrateLegacySecrets } from './storage.js';
import { recoverInterruptedOperations, runWorkflowOperation } from './workflow.js';

type InlineAiConfig = {
  provider: AiProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  systemPrompt: string;
};

type AiAttachment = {
  name: string;
  dataUrl: string;
};

/** AI 错误类型枚举 */
type AiErrorType = 'TIMEOUT' | 'CONNECTION_ERROR' | 'CONTENT_TOO_LONG'
  | 'QUOTA_EXHAUSTED' | 'EMPTY_RESULT' | 'SESSION_EXPIRED' | 'UNKNOWN';

/** AI 错误分类响应 */
interface AiErrorResponse {
  errorType: AiErrorType;
  message: string;
  provider: string;
}

type KnowledgeSceneAction = 'save' | 'append' | 'refine' | 'showResult' | 'copy' | 'openSidepanel';
type ContextScene = {
  id: string;
  label: string;
  action: KnowledgeSceneAction;
  prompt: string;
  enabled: boolean;
  defaultDir?: string;
  defaultAppendPath?: string;
  aiEnabled: boolean;
};

const DEFAULT_INLINE_AI_CONFIG: InlineAiConfig = {
  provider: 'gemini-web', apiKey: '', baseUrl: '', model: 'fbb127bbb056c959',
  systemPrompt: '你是飞书同步插件的 AI 助手。请用简洁的中文回答。',
};

const DEFAULT_CONTEXT_SCENES: ContextScene[] = [
  { id: 'save', label: '收存', action: 'save', prompt: '{text}', enabled: true, aiEnabled: false },
  { id: 'append', label: '补充', action: 'append', prompt: '{text}', enabled: true, aiEnabled: false },
  { id: 'refine', label: '精炼', action: 'refine', prompt: '请把以下内容整理成 Obsidian 知识卡片：\n\n输出结构：\n## 核心观点\n## 关键要点\n## 可复用启发\n## 相关关键词\n\n要求：\n- 不要空泛总结。\n- 保留有信息密度的原句。\n- 如果内容很短，就直接围绕这句话展开。\n- 用中文输出。\n\n页面：{title}\n来源：{url}\n内容：\n{text}\n\n{context}', enabled: true, aiEnabled: true },
  { id: 'translate-explain', label: '译解', action: 'showResult', prompt: '请不要做逐字翻译。请把以下内容转换成我能放入 Obsidian 的"概念理解笔记"：\n\n要求：\n1. 先给自然中文解释。\n2. 保留关键原文术语，并解释它们的含义。\n3. 如果原文有隐含背景，请补出来。\n4. 给一个我能复用的例子。\n5. 最后给 3-5 个关键词。\n\n页面：{title}\n来源：{url}\n选中文本：\n{text}\n\n{context}', enabled: true, aiEnabled: true },
  { id: 'concept-card', label: '概念卡', action: 'showResult', prompt: '请把以下内容整理成一个 Obsidian 概念卡：\n\n输出结构：\n## 定义\n## 背景\n## 例子\n## 容易误解的点\n## 关联概念\n\n页面：{title}\n来源：{url}\n选中文本：\n{text}\n\n{context}', enabled: true, aiEnabled: true },
  { id: 'quote', label: '金句', action: 'showResult', prompt: '请把以下选中文本整理成"金句/洞察卡片"：\n\n输出结构：\n> 原句\n\n## 这句话的含义\n## 为什么重要\n## 我可以怎么用\n## 关键词\n\n选中文本：\n{text}\n\n{context}', enabled: true, aiEnabled: true },
  { id: 'question', label: '问题', action: 'showResult', prompt: '请把以下内容转成后续可探索的问题：\n\n输出结构：\n## 核心问题\n## 可能答案\n## 还需要查什么\n## 适合放入 Obsidian 的追问\n\n页面：{title}\n来源：{url}\n选中文本：\n{text}\n\n{context}', enabled: true, aiEnabled: true },
  { id: 'copy', label: '复制', action: 'copy', prompt: '{text}', enabled: true, aiEnabled: false },
  { id: 'open-sidepanel', label: '打开侧边栏', action: 'openSidepanel', prompt: '{text}', enabled: true, aiEnabled: false },
];

const AI_TIMEOUT_MS = 30000;
const AI_TIMEOUT_MESSAGE = 'AI 请求超时。请重试，或开启「自定义 AI 解释器」后使用自定义 API。';

async function migrateAllSecrets(): Promise<void> {
  const report = await migrateLegacySecrets();
  if (report.issues.length > 0) {
    console.warn(
      '[feishu-sync] secret migration incomplete:',
      report.issues.map((issue) => issue.key).join(', '),
    );
  }
}

// ───── AI 结果缓存（5 分钟 TTL）─────
type CacheEntry = { result: string; timestamp: number };
const AI_CACHE_TTL_MS = 5 * 60 * 1000; // 5 分钟
const aiResultCache = new Map<string, CacheEntry>();

function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // 转 32 位整数
  }
  return Math.abs(hash).toString(36);
}

function getCacheKey(sceneId: string, text: string, prompt: string): string {
  return `${sceneId}:${hashString(text + '|' + prompt)}`;
}

function getCachedResult(key: string): string | null {
  const entry = aiResultCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > AI_CACHE_TTL_MS) {
    aiResultCache.delete(key);
    return null;
  }
  return entry.result;
}

function setCachedResult(key: string, result: string): void {
  aiResultCache.set(key, { result, timestamp: Date.now() });
  // 定期清理过期条目（每 20 个插入触发一次）
  if (aiResultCache.size % 20 === 0) {
    const now = Date.now();
    for (const [k, v] of aiResultCache) {
      if (now - v.timestamp > AI_CACHE_TTL_MS) aiResultCache.delete(k);
    }
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); },
    );
  });
}

async function runInlineAi(payload: { action?: string; text?: string; prompt?: string; attachments?: AiAttachment[] }): Promise<string> {
  const config = await loadSecretBackedConfig(DEFAULT_INLINE_AI_CONFIG, AI_CONFIG_STORAGE);
  const text = payload.text?.trim();
  const attachments = normalizeAiAttachments(payload.attachments);
  if (!text && attachments.length === 0) throw new Error('请先输入文字、划选文本或添加图片。');
  const instruction: Record<string, string> = {
    translate: '将以下内容翻译成简洁自然的中文：', summarize: '用要点总结以下内容：',
    explain: '解释以下内容：', grammar: '修正以下内容的语法和表达，并只返回修正后的文本：',
    'ai-chat': '基于以下内容回答：',
  };
  const prompt = payload.prompt?.trim() || `${instruction[payload.action ?? 'ai-chat'] ?? instruction['ai-chat']}\n\n${text}`;

  // ───── 结果缓存（5 分钟 TTL，加速重复查询）─────
  const sceneId = (payload as any)?.action || 'ai-chat';
  const cacheKey = getCacheKey(sceneId, text || '', `${config.provider}|${config.model}|${prompt}`);
  const cached = getCachedResult(cacheKey);
  if (cached) return cached;

  const route = resolveAiRoute(config);
  const systemPrompt = config.systemPrompt ? `${config.systemPrompt}\n\n` : '';
  const fullPrompt = `${systemPrompt}${prompt}`;
  let aiResult: string;

  if (route.kind === 'deepseek-web') {
    const token = await getDeepSeekToken();
    if (!isValidToken(token)) {
      throw new Error('DeepSeek Token 未配置。请打开 chat.deepseek.com 登录，扩展会自动提取 Token。');
    }
    aiResult = await withTimeout(
      sendDeepSeekWebMessage({ prompt: fullPrompt, model: route.model }),
      AI_TIMEOUT_MS,
      AI_TIMEOUT_MESSAGE,
    );
  } else if (route.kind === 'gemini-web') {
    try {
      aiResult = await withTimeout(
        sendGeminiWebMessage(fullPrompt, route.model, attachments),
        AI_TIMEOUT_MS,
        AI_TIMEOUT_MESSAGE,
      );
    } catch (geminiError) {
      const token = await getDeepSeekToken();
      if (!isValidToken(token)) throw geminiError;
      try {
        aiResult = await withTimeout(
          sendDeepSeekWebMessage({ prompt: fullPrompt }),
          AI_TIMEOUT_MS,
          AI_TIMEOUT_MESSAGE,
        );
      } catch (deepSeekError) {
        throw new Error(
          `Gemini Web 不可用，DeepSeek Web 降级也失败。\n` +
          `Gemini：${geminiError instanceof Error ? geminiError.message : String(geminiError)}\n` +
          `DeepSeek：${deepSeekError instanceof Error ? deepSeekError.message : String(deepSeekError)}`,
        );
      }
    }
  } else if (route.kind === 'unsupported') {
    throw new Error('当前 Chrome 不支持 Gemini Nano。请在 AI 助手设置中选择其他 Provider。');
  } else if (route.kind === 'gemini-api') {
    if (!config.apiKey) throw new Error('Gemini API 尚未配置 API Key。');
    const response = await withTimeout(fetch(`${route.endpoint}?key=${encodeURIComponent(config.apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: fullPrompt }] }] }),
    }), AI_TIMEOUT_MS, AI_TIMEOUT_MESSAGE);
    const data = await response.json() as any;
    if (!response.ok) throw new Error(data.error?.message || `Gemini API HTTP ${response.status}`);
    aiResult = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else {
    if (!route.endpoint) throw new Error('自定义 AI 服务缺少 Base URL。');
    if (route.requiresApiKey && !config.apiKey) throw new Error('请在 AI 助手设置中填写 API Key。');
    const response = await withTimeout(fetch(route.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: route.model,
        temperature: 0.7,
        messages: [
          ...(config.systemPrompt ? [{ role: 'system', content: config.systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
      }),
    }), AI_TIMEOUT_MS, AI_TIMEOUT_MESSAGE);
    const data = await response.json() as any;
    if (!response.ok) throw new Error(data.error?.message || `AI 请求失败：HTTP ${response.status}`);
    aiResult = data.choices?.[0]?.message?.content || '';
  }

  if (!aiResult.trim()) throw new Error('AI 未返回内容');

  setCachedResult(cacheKey, aiResult);
  return aiResult;
}

// ───── AI 错误分类 + 重试 ─────

const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1000;

/** 不可重试的错误类型，遇到直接抛出 */
const NON_RETRYABLE_ERRORS: ReadonlySet<AiErrorType> = new Set<AiErrorType>([
  'CONTENT_TOO_LONG',
  'QUOTA_EXHAUSTED',
  'EMPTY_RESULT',
  'SESSION_EXPIRED',
]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 对 AI 错误进行分类，返回错误类型、消息和涉及的 provider。
 * 用于错误降级和用户提示。
 */
function classifyAiError(error: unknown, textLength: number): AiErrorResponse {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMsg = message.toLowerCase();

  // SESSION_EXPIRED — 登录会话 / Token 失效
  if (message.includes('登录会话不可用') || message.includes('Token') || message.includes('401')) {
    const provider = lowerMsg.includes('deepseek') ? 'deepseek' : 'gemini';
    return { errorType: 'SESSION_EXPIRED', message, provider };
  }

  // QUOTA_EXHAUSTED — 额度耗尽
  if (message.includes('429') || message.includes('额度') || lowerMsg.includes('quota')) {
    const provider = lowerMsg.includes('deepseek') ? 'deepseek' : 'gemini';
    return { errorType: 'QUOTA_EXHAUSTED', message, provider };
  }

  // CONTENT_TOO_LONG — 内容过长
  if (textLength > 5000) {
    return { errorType: 'CONTENT_TOO_LONG', message, provider: 'unknown' };
  }

  // TIMEOUT — 超时
  if (message.includes('超时') || lowerMsg.includes('timeout')) {
    const provider = lowerMsg.includes('deepseek') ? 'deepseek' : 'gemini';
    return { errorType: 'TIMEOUT', message, provider };
  }

  // CONNECTION_ERROR — 网络连接错误
  if (lowerMsg.includes('fetch') || lowerMsg.includes('network') || lowerMsg.includes('failed to fetch')) {
    const provider = lowerMsg.includes('deepseek') ? 'deepseek' : 'gemini';
    return { errorType: 'CONNECTION_ERROR', message, provider };
  }

  // UNKNOWN — 兜底
  const provider = lowerMsg.includes('deepseek') ? 'deepseek' : (lowerMsg.includes('gemini') ? 'gemini' : 'unknown');
  return { errorType: 'UNKNOWN', message, provider };
}

/**
 * 带 retry 的 inline AI 调用。
 * - 最多重试 2 次（总 3 次尝试）
 * - 指数退避：1s → 2s
 * - 不可重试错误（CONTENT_TOO_LONG / QUOTA_EXHAUSTED / EMPTY_RESULT / SESSION_EXPIRED）直接抛出
 * - 可重试（TIMEOUT / CONNECTION_ERROR / UNKNOWN）才退避重试
 */
async function runInlineAiWithRetry(
  payload: { action?: string; text?: string; prompt?: string; attachments?: AiAttachment[] },
): Promise<string> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const result = await runInlineAi(payload);
      return result;
    } catch (error) {
      lastError = error;
      const textLength = (payload.text || '').length;
      const classified = classifyAiError(error, textLength);
      // 不可重试错误直接抛出
      if (NON_RETRYABLE_ERRORS.has(classified.errorType)) {
        throw error;
      }
      // 最后一次尝试不再等待
      if (attempt >= MAX_RETRIES) break;
      // 指数退避：1s → 2s
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  throw lastError;
}

function extractGeminiToken(key: string, html: string): string {
  const match = html.match(new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`))?.[1];
  if (match) return match;
  if (key === 'SNlM0e') return html.match(/"(AHz[a-zA-Z0-9_-]+)"/)?.[1] || '';
  if (key === 'cfb2h') return html.match(/"(boq_bard[a-zA-Z0-9_-]+)"/)?.[1] || '';
  if (key === 'FdrFJe') return html.match(/"(-?[0-9]{18,})"/)?.[1] || '';
  return '';
}

function parseGeminiLine(line: string): string | null {
  try {
    const envelope = JSON.parse(line.replace(/^\)\]\}'/, '').trim());
    for (const item of envelope) {
      const payload = typeof item?.[2] === 'string' ? JSON.parse(item[2]) : null;
      const candidate = payload?.[4]?.[0];
      const text = candidate?.[1]?.[0];
      if (typeof text === 'string') return text;
    }
  } catch {}
  return null;
}

function normalizeAiAttachments(attachments: unknown): AiAttachment[] {
  if (!Array.isArray(attachments)) return [];
  return attachments
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const value = item as Partial<AiAttachment>;
      if (typeof value.dataUrl !== 'string' || !value.dataUrl.startsWith('data:')) return null;
      return {
        name: typeof value.name === 'string' && value.name.trim() ? value.name.trim() : 'image.png',
        dataUrl: value.dataUrl,
      };
    })
    .filter((item): item is AiAttachment => Boolean(item));
}

function getDataUrlMime(dataUrl: string): string {
  return dataUrl.match(/^data:([^;,]+)[;,]/)?.[1] || 'application/octet-stream';
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, payload] = dataUrl.split(',');
  const mimeType = header?.match(/:(.*?);/)?.[1] || 'application/octet-stream';
  if (!payload) throw new Error('图片数据无效。');
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: mimeType });
}

async function uploadGeminiWebImage(file: AiAttachment, uploadContext: { uploadPushId: string; uploadClientPctx: string }): Promise<[[string], string]> {
  const mimeType = getDataUrlMime(file.dataUrl);
  if (!mimeType.startsWith('image/')) throw new Error(`Gemini Web 目前只支持图片附件：${file.name}`);
  const baseHeaders = {
    'Push-ID': uploadContext.uploadPushId,
    'X-Tenant-Id': 'bard-storage',
    'X-Client-Pctx': uploadContext.uploadClientPctx,
  };
  const startResponse = await fetch('https://push.clients6.google.com/upload/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...baseHeaders,
      'X-Goog-Upload-Protocol': 'resumable',
      'X-Goog-Upload-Command': 'start',
    },
    body: `File name: ${file.name}`,
  });
  if (!startResponse.ok) throw new Error(`Gemini Web 图片上传初始化失败：HTTP ${startResponse.status}`);
  const uploadUrl = startResponse.headers.get('X-Goog-Upload-URL');
  if (!uploadUrl) throw new Error('Gemini Web 图片上传失败：缺少上传 URL。');

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...baseHeaders,
      'X-Goog-Upload-Command': 'upload, finalize',
      'X-Goog-Upload-Offset': '0',
    },
    body: dataUrlToBlob(file.dataUrl),
  });
  if (!uploadResponse.ok) throw new Error(`Gemini Web 图片上传失败：HTTP ${uploadResponse.status}`);
  const uploadedPath = (await uploadResponse.text()).trim();
  if (!uploadedPath) throw new Error('Gemini Web 图片上传失败：返回路径为空。');
  return [[uploadedPath], file.name];
}

async function sendGeminiWebMessage(prompt: string, configuredModel: string, attachments: AiAttachment[] = []): Promise<string> {
  const htmlResponse = await fetch('https://gemini.google.com/app', { credentials: 'include', redirect: 'manual' });
  if (htmlResponse.type === 'opaqueredirect' || htmlResponse.status === 0 || htmlResponse.status === 302) {
    throw new Error('Gemini Web 会话不可用或已重定向，请打开 gemini.google.com 登录。');
  }
  const html = await htmlResponse.text();
  const at = extractGeminiToken('SNlM0e', html);
  const bl = extractGeminiToken('cfb2h', html);
  const fSid = extractGeminiToken('FdrFJe', html);
  const uploadPushId = extractGeminiToken('qKIAYe', html);
  const uploadClientPctx = extractGeminiToken('Ylro7b', html);
  const authUser = html.match(/data-index="(\d+)"/)?.[1] || '0';
  if (!at || !bl || !fSid) throw new Error('Gemini Web 登录会话不可用。请打开 gemini.google.com 后刷新登录。');
  if (attachments.length > 0 && (!uploadPushId || !uploadClientPctx)) throw new Error('Gemini Web 图片上传令牌不可用。请打开 gemini.google.com 后刷新登录。');
  const route = resolveAiRoute({ provider: 'gemini-web', model: configuredModel });
  const model = GEMINI_WEB_MODELS[route.model];
  if (!model) throw new Error('Gemini Web 模型不受支持。请重新保存 AI 设置。');
  const requestId = crypto.randomUUID().toUpperCase();
  const modelHeader: unknown[] = []; modelHeader[0] = 1; modelHeader[4] = model.hash; modelHeader[7] = true; modelHeader[8] = [4, 5, 6, 8]; modelHeader[11] = model.mode; modelHeader[14] = model.mode; modelHeader[15] = 1; modelHeader[16] = requestId;
  const fileList = attachments.length > 0 ? await Promise.all(attachments.map((file) => uploadGeminiWebImage(file, { uploadPushId, uploadClientPctx }))) : [];
  const messageStruct = fileList.length > 0 ? [prompt, 0, null, fileList] : [prompt];
  const requestPayload: unknown[] = [messageStruct, null, ['', '', '']]; requestPayload[45] = true;
  const accountPrefix = authUser === '0' ? '' : `/u/${authUser}`;
  const query = new URLSearchParams({ bl, 'f.sid': fSid, hl: html.match(/<html[^>]*\slang="([^"]+)"/)?.[1] || 'zh-CN', _reqid: String(Math.floor(Math.random() * 900000) + 100000), rt: 'c' });
  const response = await fetch(`https://gemini.google.com${accountPrefix}/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?${query}`, {
    method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'X-Same-Domain': '1', Origin: 'https://gemini.google.com', Referer: 'https://gemini.google.com/', 'x-goog-ext-525001261-jspb': JSON.stringify(modelHeader), 'x-goog-ext-525005358-jspb': JSON.stringify([requestId, 1]), 'x-goog-ext-73010989-jspb': '[0]', 'x-goog-ext-73010990-jspb': '[0,0,0]', ...(authUser === '0' ? {} : { 'X-Goog-AuthUser': authUser }) },
    body: new URLSearchParams({ at, 'f.req': JSON.stringify([null, JSON.stringify(requestPayload)]) }),
  });
  if (!response.ok) throw new Error(`Gemini Web 请求失败：${response.status} ${response.statusText}`);
  const raw = await response.text();
  const parsedResults = raw.split('\n').map(parseGeminiLine).filter((value): value is string => Boolean(value));
  const result = parsedResults[parsedResults.length - 1];
  if (!result) throw new Error('Gemini Web 未返回可解析内容，请刷新 Gemini 登录后重试。');
  return result;
}

/**
 * 流式推送 AI 结果到 toolbar（Chrome MV3 不支持流式消息，用分块推送方案）。
 * 优先 Gemini Web 流式（模拟）；失败降级 DeepSeek Web 流式。
 * 通过 chrome.tabs.sendMessage 推送 ai-stream-chunk / ai-stream-done / ai-stream-error 事件。
 */
async function runInlineAiStreaming(
  payload: { action?: string; text?: string; prompt?: string; requestId?: string; attachments?: AiAttachment[] },
  sender: chrome.runtime.MessageSender,
): Promise<void> {
  const tabId = sender.tab?.id;
  if (!tabId) return;
  const requestId = payload.requestId || crypto.randomUUID();

  try {
    const fullText = await runInlineAiWithRetry(payload);
    const chars = Array.from(fullText);
    for (let index = 0; index < chars.length; index += 24) {
      const chunk = chars.slice(index, index + 24).join('');
      await chrome.tabs.sendMessage(tabId, { type: 'ai-stream-chunk', payload: { requestId, chunk } });
    }
    await chrome.tabs.sendMessage(tabId, { type: 'ai-stream-done', payload: { requestId, text: fullText } });
  } catch (error) {
    const errorInfo = classifyAiError(error, (payload.text || '').length);
    await chrome.tabs.sendMessage(tabId, { type: 'ai-stream-error', payload: { ...errorInfo, requestId } }).catch(() => {});
  }
}

// ───── Gemini Web Session 预检 ─────
let lastSessionCheck: number | null = null;
let lastSessionAlive = false;
let lastSessionError = '';

async function checkGeminiSession(): Promise<{ alive: boolean; error: string }> {
  try {
    const response = await fetch('https://gemini.google.com/app', { credentials: 'include', redirect: 'manual' });
    if (response.type === 'opaqueredirect' || response.status === 0 || response.status === 302) {
      throw new Error('Gemini Web 会话不可用或已重定向，请打开 gemini.google.com 登录。');
    }
    if (!response.ok) {
      lastSessionAlive = false;
      lastSessionError = `Gemini 页面返回 HTTP ${response.status}`;
      return { alive: false, error: lastSessionError };
    }
    const html = await response.text();
    const at = extractGeminiToken('SNlM0e', html);
    const bl = extractGeminiToken('cfb2h', html);
    const fSid = extractGeminiToken('FdrFJe', html);
    lastSessionAlive = Boolean(at && bl && fSid);
    lastSessionError = lastSessionAlive ? '' : 'Gemini Web 会话令牌不可用，请打开 gemini.google.com 登录。';
    lastSessionCheck = Date.now();
    return { alive: lastSessionAlive, error: lastSessionError };
  } catch (err) {
    lastSessionAlive = false;
    lastSessionError = err instanceof Error ? err.message : String(err);
    lastSessionCheck = Date.now();
    return { alive: false, error: lastSessionError };
  }
}

async function broadcastSessionStatus(): Promise<void> {
  const status = await checkGeminiSession();
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'gemini-session-status',
          payload: { alive: status.alive, error: status.error },
        }).catch(() => { /* tab 可能未加载 content script */ });
      }
    }
  } catch { /* 广播失败不阻塞 */ }
}

// 安装/更新时初始化默认配置
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[feishu-sync] installed/updated:', details.reason);
  try {
    await migrateAllSecrets();
    await recoverInterruptedOperations();
  } catch (error) {
    console.warn('[feishu-sync] secret migration incomplete:', error);
  }
  const config = await loadConfig();
  if (!config.token) {
    await saveConfig(DEFAULT_CONFIG);
  }
  await ensureContextScenes();
  await rebuildContextMenus();
  // 启动后延迟 3 秒执行 Gemini session 预检（等浏览器稳定）
  setTimeout(() => broadcastSessionStatus().catch(() => {}), 3000);
});

chrome.runtime.onStartup?.addListener(async () => {
  await migrateAllSecrets();
  await recoverInterruptedOperations();
  await rebuildContextMenus();
  setTimeout(() => broadcastSessionStatus().catch(() => {}), 3000);
});

async function ensureContextScenes(): Promise<ContextScene[]> {
  const stored = await chrome.storage.sync.get('contextScenes');
  const scenes = normalizeContextScenes(stored.contextScenes);
  if (!stored.contextScenes) await chrome.storage.sync.set({ contextScenes: scenes });
  return scenes;
}

function normalizeContextScenes(input: unknown): ContextScene[] {
  const fallbackById = new Map(DEFAULT_CONTEXT_SCENES.map((scene) => [scene.id, scene]));
  const rawScenes = Array.isArray(input) && input.length > 0 ? input : DEFAULT_CONTEXT_SCENES;

  const seenIds = new Set<string>();
  const scenes: ContextScene[] = [];

  for (const item of rawScenes) {
    if (item && typeof item === 'object') {
      const rawId = (item as any).id;
      const fallback = rawId ? fallbackById.get(rawId) : undefined;
      const id = rawId || fallback?.id || 'scene';
      if (!id || seenIds.has(id)) continue;
      seenIds.add(id);

      scenes.push({
        id,
        label: (item as any).label || fallback?.label || '场景',
        action: ((item as any).action || fallback?.action || 'showResult') as KnowledgeSceneAction,
        prompt: (item as any).prompt ?? fallback?.prompt ?? '{text}',
        enabled: (item as any).enabled ?? fallback?.enabled ?? true,
        defaultDir: (item as any).defaultDir || fallback?.defaultDir || '',
        defaultAppendPath: (item as any).defaultAppendPath || fallback?.defaultAppendPath || '',
        aiEnabled: (item as any).aiEnabled ?? fallback?.aiEnabled ?? true,
      });
    }
  }

  for (const scene of DEFAULT_CONTEXT_SCENES) {
    if (!seenIds.has(scene.id)) {
      scenes.push(scene);
      seenIds.add(scene.id);
    }
  }
  return scenes;
}

async function rebuildContextMenus(): Promise<void> {
  await new Promise<void>((resolve) => chrome.contextMenus.removeAll(() => resolve()));
  const scenes = (await ensureContextScenes()).filter((scene) => scene.enabled && scene.action !== 'copy');
  for (const scene of scenes) {
    chrome.contextMenus.create({
      id: `context-scene:${scene.id}`,
      title: `飞书同步 · ${scene.label}`,
      contexts: ['selection'],
    }, () => {
      const err = chrome.runtime.lastError;
      if (err) {
        console.warn(`[feishu-sync] context menu item context-scene:${scene.id} creation warning/error:`, err.message);
      }
    });
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.menuItemId || typeof info.menuItemId !== 'string' || !info.menuItemId.startsWith('context-scene:')) return;
  (async () => {
    const sceneId = String(info.menuItemId).replace('context-scene:', '');
    const scenes = await ensureContextScenes();
    const scene = scenes.find((item) => item.id === sceneId);
    if (!scene || !tab?.id) return;
    const selectedText = info.selectionText || '';
    const prompt = fillScenePrompt(scene.prompt, {
      text: selectedText,
      title: tab.title || '',
      url: tab.url || '',
      domain: getHostname(tab.url || ''),
      date: new Date().toISOString().slice(0, 10),
    });
    if (scene.action === 'showResult') {
      const sidePanel = chrome.sidePanel as any;
      if (sidePanel.open) await sidePanel.open({ tabId: tab.id });
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: 'ai-prompt',
          payload: { action: scene.id, label: scene.label, text: prompt, title: tab.title || '', url: tab.url || '' },
        });
      }, 400);
      return;
    }
    if (scene.action === 'save' || scene.action === 'append' || scene.action === 'refine' || scene.action === 'openSidepanel') {
      const sidePanel = chrome.sidePanel as any;
      if (sidePanel.open) await sidePanel.open({ tabId: tab.id });
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: 'clip-data',
          payload: {
            text: selectedText,
            title: tab.title || '',
            url: tab.url || '',
            description: '',
            favicon: tab.favIconUrl || '',
            domain: getHostname(tab.url || ''),
            sceneId: scene.id,
            sceneLabel: scene.label,
            sceneAction: scene.action,
            prompt,
            defaultDir: scene.defaultDir || '',
            appendPath: scene.defaultAppendPath || '',
            aiEnabled: scene.aiEnabled,
          },
        });
      }, 400);
      return;
    }
  })().catch((error) => console.warn('[feishu-sync] context menu action failed:', error));
});

function fillScenePrompt(template: string, values: { text: string; title: string; url: string; domain: string; date: string; context?: string }): string {
  return template
    .replace(/\{text\}/g, values.text)
    .replace(/\{title\}/g, values.title)
    .replace(/\{url\}/g, values.url)
    .replace(/\{domain\}/g, values.domain)
    .replace(/\{date\}/g, values.date)
    .replace(/\{context\}/g, values.context || '');
}

function getHostname(url: string): string {
  try {
    return url ? new URL(url).hostname : '';
  } catch {
    return '';
  }
}

function buildSilentClipMarkdown(payload: Record<string, any>): string {
  const title = String(payload.title || '网页剪藏').trim();
  const url = String(payload.url || '').trim();
  const text = String(payload.text || '').trim();
  const description = String(payload.description || '').trim();
  return [
    `# ${title}`,
    '',
    url ? `来源：${url}` : '',
    description ? `> ${description}` : '',
    '',
    text || '（未读取到选中文本）',
  ].filter((line) => line !== '').join('\n');
}

function draftSilentKeywords(text: string): string[] {
  return Array.from(new Set(String(text)
    .replace(/[^\p{L}\p{N}\u4e00-\u9fa5]+/gu, ' ')
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && item.length <= 12)
    .slice(0, 6)));
}

// 消息路由
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ai-tool') {
    (async () => {
      const action = message.payload?.action as string;
      if (action === 'browser-control') {
        const hasDebuggerPermission = await chrome.permissions.contains({ permissions: ['debugger'] });
        if (!hasDebuggerPermission) {
          const granted = await chrome.permissions.request({ permissions: ['debugger'] });
          if (!granted) throw new Error('浏览器控制需要临时授予 debugger 权限。');
        }
      }
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('未找到当前网页标签页。');
      const userInstruction = typeof message.payload?.text === 'string' ? message.payload.text.trim() : '';
      const page = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const selection = window.getSelection()?.toString() || '';
          const text = (selection || document.body.innerText || '').slice(0, 12000);
          const elements = Array.from(document.querySelectorAll('a,button,input,textarea,select,[role="button"],[role="link"]'))
            .slice(0, 80)
            .map((element, index) => {
              const htmlElement = element as HTMLElement;
              return {
                index,
                tag: element.tagName.toLowerCase(),
                role: element.getAttribute('role') || '',
                text: (htmlElement.innerText || htmlElement.getAttribute('aria-label') || htmlElement.getAttribute('placeholder') || '').trim().slice(0, 120),
                href: element instanceof HTMLAnchorElement ? element.href : '',
                disabled: element instanceof HTMLButtonElement || element instanceof HTMLInputElement ? element.disabled : false,
              };
            })
            .filter((item) => item.text || item.href);
          return { title: document.title, url: location.href, selection, text, elements };
        },
      });
      const context = page[0]?.result || {
        title: tab.title || '',
        url: tab.url || '',
        text: '',
        selection: '',
        elements: [],
      };
      const payload: Record<string, unknown> = { action, title: context.title, url: context.url, text: context.text, selection: context.selection || '', elements: context.elements || [], userInstruction };
      if (action === 'screenshot-translate' || action === 'ocr' || action === 'screen-shot') {
        payload.imageDataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
      }
      if (action === 'browser-control') {
        const debuggee = { tabId: tab.id };
        try {
          await chrome.debugger.attach(debuggee, '1.3');
          const result = await chrome.debugger.sendCommand(debuggee, 'Runtime.evaluate', {
            expression: `(() => ({
              title: document.title,
              url: location.href,
              selection: window.getSelection()?.toString() || '',
              viewport: { width: innerWidth, height: innerHeight },
              scroll: { x: scrollX, y: scrollY },
              interactive: Array.from(document.querySelectorAll('a,button,input,textarea,select,[role="button"],[role="link"]')).slice(0, 80).map((el, index) => ({
                index,
                tag: el.tagName.toLowerCase(),
                text: (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').trim().slice(0, 120),
                href: el.href || '',
                rect: (() => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })()
              }))
            }))()`,
            returnByValue: true,
          });
          payload.debugTarget = (result as { result?: { value?: unknown } }).result?.value;
        } finally {
          chrome.debugger.detach(debuggee).catch(() => undefined);
        }
      }
      chrome.runtime.sendMessage({ type: 'ai-prompt', payload });
    })().catch((error) => chrome.runtime.sendMessage({ type: 'ai-prompt', payload: { action: 'error', text: error instanceof Error ? error.message : String(error) } }));
    sendResponse({ ok: true });
    return true;
  }
  // 连接检测
  if (message.type === 'TEST_CONNECTION') {
    loadConfig().then(testConnection).then(sendResponse).catch((err) => sendResponse({ ok: false, message: String(err) }));
    return true;
  }

  if (message.type === 'GET_STATUS') {
    loadConfig().then(async (config) => {
      try {
        const { getStatus } = await import('./client.js');
        sendResponse({ ok: true, status: await getStatus(config) });
      } catch (err) { sendResponse({ ok: false, message: String(err) }); }
    });
    return true;
  }

  if (message.type === 'ai-inline') {
    runInlineAiWithRetry(message.payload ?? {})
      .then((text) => {
        if (!text || !text.trim()) {
          sendResponse({ error: 'AI 未返回内容', errorType: 'EMPTY_RESULT' });
          return;
        }
        sendResponse({ text });
      })
      .catch((error) => {
        const errorInfo = classifyAiError(error, (message.payload?.text || '').length);
        sendResponse({ error: errorInfo.message, errorType: errorInfo.errorType });
      });
    return true;
  }

  // ───── 流式 AI 调用（toolbar 端使用，分块推送）─────
  if (message.type === 'ai-inline-stream') {
    runInlineAiStreaming(message.payload ?? {}, sender).catch((error) => {
      console.warn('[feishu-sync] ai-inline-stream error:', error);
    });
    sendResponse({ ok: true });
    return true;
  }

  // ───── DeepSeek Web 直连（sidepanel 显式选择时）─────
  if (message.type === 'ai-inline-deepseek-web') {
    const text = message.payload?.text || '';
    if (!text) { sendResponse({ error: '请输入内容' }); return true; }
    withTimeout(
        sendDeepSeekWebMessage({ prompt: text }),
        AI_TIMEOUT_MS,
        AI_TIMEOUT_MESSAGE,
      )
      .then((result) => sendResponse({ text: result }))
      .catch((error) => sendResponse({ error: error instanceof Error ? error.message : String(error) }));
    return true;
  }

  if (message.type === 'REBUILD_CONTEXT_MENUS') {
    rebuildContextMenus()
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, message: error instanceof Error ? error.message : String(error) }));
    return true;
  }

  if (message.type === 'knowflow-write') {
    (async () => {
      const kind = message.payload?.kind;
      const request = message.payload?.request;
      if ((kind !== 'fetch' && kind !== 'clip') || !request || typeof request !== 'object') {
        throw new Error('无效的写操作请求。');
      }
      if (kind === 'fetch' && typeof request.node_token !== 'string') {
        throw new Error('同步请求缺少飞书文档 token。');
      }
      const requestId = typeof request.requestId === 'string' && request.requestId
        ? request.requestId
        : crypto.randomUUID();
      const config = await loadConfig();
      if (kind === 'fetch') {
        return runWorkflowOperation('fetch', requestId, () => postFetch(config, { ...request, requestId }));
      }
      return runWorkflowOperation('clip', requestId, () => postClip(config, { ...request, requestId }));
    })()
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }));
    return true;
  }

  // ───── Web Clipper（增强版）─────
  if (message.type === 'clip-to-obsidian') {
    (async () => {
      const tab = sender.tab;
      if (!tab?.id) throw new Error('未找到当前网页标签页。');

      const payload = message.payload || {};
      console.log('[feishu-sync] clip-to-obsidian:', payload);

      try {
        if (
          payload.openMode === 'silent' &&
          payload.sceneAction === 'save' &&
          payload.aiEnabled !== true &&
          typeof payload.defaultDir === 'string' &&
          payload.defaultDir.trim()
        ) {
          const config = await loadConfig();
          const requestId = crypto.randomUUID();
          return runWorkflowOperation('clip', requestId, () => postClip(config, {
            requestId,
            title: payload.title || tab.title || '网页剪藏',
            url: payload.url || tab.url || '',
            sourceKind: 'selection',
            text: payload.text || '',
            rawText: payload.text || '',
            bodyMarkdown: buildSilentClipMarkdown(payload),
            description: payload.description || '',
            dir: payload.defaultDir.trim(),
            meta: {
              标签: 'S',
              编码: '',
              输入: payload.defaultDir.trim(),
              日期: new Date().toISOString().slice(0, 10),
              关键词: draftSilentKeywords(`${payload.title || ''} ${payload.text || ''}`).join('、') || '网页剪存',
              概述: String(payload.description || payload.text || payload.title || '网页剪存').slice(0, 160),
              评分: 1,
              评分_显示: '🌟·素材',
            },
          }));
        }
        const sidePanel = chrome.sidePanel as any;
        if (sidePanel.open) {
          await sidePanel.open({ tabId: tab.id });
        }
        // 等面板加载后发送剪藏数据
        setTimeout(() => {
          chrome.runtime.sendMessage({
            type: 'clip-data',
            payload: {
              text: payload.text || '',
              title: payload.title || tab.title || '',
              url: payload.url || tab.url || '',
              description: payload.description || '',
              favicon: payload.favicon || '',
              docToken: payload.docToken || null,
              domain: payload.domain || '',
              sceneId: payload.sceneId || '',
              sceneLabel: payload.sceneLabel || '',
              sceneAction: payload.sceneAction || '',
              prompt: payload.prompt || '',
              defaultDir: payload.defaultDir || '',
              appendPath: payload.appendPath || '',
              aiEnabled: payload.aiEnabled === true,
              openMode: payload.openMode || 'confirmInSidepanel',
            },
          });
        }, 500);
        return undefined;
      } catch (e) {
        console.error('[feishu-sync] clip error:', e);
        throw e;
      }
    })()
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }));
    return true;
  }

  // ───── 飞书同步触发（从工具栏）─────
  if (message.type === 'feishu-sync-trigger') {
    const payload = message.payload || {};
    if (payload.directSync === true) {
      (async () => {
        const nodeToken = String(payload.nodeToken || payload.docToken?.node_token || payload.docToken?.obj_token || '').trim();
        if (!nodeToken) throw new Error('无法识别当前飞书文档 token。');
        const requestId = crypto.randomUUID();
        const config = await loadConfig();
        return runWorkflowOperation('fetch', requestId, () => postFetch(config, {
          requestId,
          node_token: nodeToken,
          obj_token: payload.docToken?.obj_token || undefined,
        }));
      })()
        .then((result) => sendResponse({ ok: true, result }))
        .catch((error) => sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }));
      return true;
    }
    (async () => {
      const tab = sender.tab;
      if (!tab?.id) return;

      try {
        const sidePanel = chrome.sidePanel as any;
        if (sidePanel.open) {
          await sidePanel.open({ tabId: tab.id });
        }
        // 发消息让 sidepanel 切换到同步面板并刷新
        setTimeout(() => {
          chrome.runtime.sendMessage({
            type: 'clip-data',
            payload: {
              text: '',
              title: payload.title || tab.title || '',
              url: payload.url || tab.url || '',
              description: payload.description || '',
              docToken: payload.docToken || null,
              domain: payload.domain || '',
              triggerSync: true,
              obsidianUri: payload.obsidianUri || null,
              protocolFailed: payload.protocolFailed === true,
            },
          });
        }, 500);
      } catch (e) { console.error('[feishu-sync] feishu-sync-trigger error:', e); }
    })();
    sendResponse({ ok: true });
    return true;
  }

  // ───── Gemini Session 状态查询 ─────
  if (message.type === 'query-gemini-session') {
    // 如果 30 秒内有缓存结果就直接返回，否则重新检查
    if (lastSessionCheck && Date.now() - lastSessionCheck < 30000) {
      sendResponse({ alive: lastSessionAlive, error: lastSessionError });
    } else {
      checkGeminiSession().then((status) => sendResponse(status)).catch(() => sendResponse({ alive: false, error: '检查失败' }));
    }
    return true;
  }

  // ───── DeepSeek Token 管理 ─────
  if (message.type === 'set-deepseek-token') {
    const token = message.payload?.token || '';
    setDeepSeekToken(token)
      .then(() => sendResponse({ ok: true, hasToken: isValidToken(token) }))
      .catch((error) => sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }));
    return true;
  }
  if (message.type === 'get-deepseek-token') {
    getDeepSeekToken()
      .then((token) => sendResponse({ token: token || '', hasToken: isValidToken(token) }))
      .catch((error) => sendResponse({ token: '', hasToken: false, error: error instanceof Error ? error.message : String(error) }));
    return true;
  }

  // ───── AI Chat ─────
  // 处理所有 AI 文本操作：translate / summarize / explain / grammar / ai-chat
  // toolbar.ts 统一发送 type: 'ai-chat'，通过 payload.action 区分具体操作
  if (message.type === 'ai-chat') {
    (async () => {
      const tab = sender.tab;
      if (!tab?.id) return;
      try {
        const payload = { ...(message.payload ?? {}) };
        if (payload.action === 'screen-shot' || payload.action === 'screenshot-translate' || payload.action === 'ocr') {
          try {
            payload.imageDataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
              format: 'png',
            });
          } catch (captureErr) {
            payload.captureError = captureErr instanceof Error ? captureErr.message : String(captureErr);
          }
        }
        const sidePanel = chrome.sidePanel as any;
        if (sidePanel.open) {
          await sidePanel.open({ tabId: tab.id });
        }
        setTimeout(() => {
          chrome.runtime.sendMessage({
            type: 'ai-prompt',
            payload,
          });
        }, 500);
      } catch (e) { console.error('[feishu-sync] ai error:', e); }
    })();
    sendResponse({ ok: true });
    return true;
  }

  return false;
});

// 定期健康检查 + badge
chrome.alarms?.create('health-check', { periodInMinutes: 5 });
chrome.alarms?.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'health-check') return;
  const config = await loadConfig();
  if (!config.token) {
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#999' });
    return;
  }
  const result = await testConnection(config);
  chrome.action.setBadgeText({ text: result.ok ? '✓' : '✗' });
  chrome.action.setBadgeBackgroundColor({ color: result.ok ? '#07C160' : '#d93025' });
});

console.log('[feishu-sync] background v3.0.1 loaded');
