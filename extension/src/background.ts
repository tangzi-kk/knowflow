/**
 * Service worker（MV3 background）v3.0.1。
 * - 配置初始化
 * - 消息路由（连接检测 / Web Clipper / AI Chat / 飞书同步触发）
 * - 定期健康检查 + badge 更新
 */
import { DEFAULT_CONFIG, loadConfig, testConnection, saveConfig, postClip } from './client.js';

type InlineAiConfig = {
  provider: 'gemini-api' | 'openai' | 'deepseek' | 'custom' | 'gemini-nano' | 'gemini-web';
  apiKey: string;
  baseUrl: string;
  model: string;
  systemPrompt: string;
};

type AiAttachment = {
  name: string;
  dataUrl: string;
};

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
  provider: 'gemini-web', apiKey: '', baseUrl: '', model: '56fdd199312815e2',
  systemPrompt: '你是飞书同步插件的 AI 助手。请用简洁的中文回答。',
};

const DEFAULT_CONTEXT_SCENES: ContextScene[] = [
  { id: 'save', label: '收存', action: 'save', prompt: '{text}', enabled: true, aiEnabled: false },
  { id: 'append', label: '补充', action: 'append', prompt: '{text}', enabled: true, aiEnabled: false },
  { id: 'refine', label: '精炼', action: 'refine', prompt: '请把以下内容整理成 Obsidian 知识卡片：\n\n输出结构：\n## 核心观点\n## 关键要点\n## 可复用启发\n## 相关关键词\n\n要求：\n- 不要空泛总结。\n- 保留有信息密度的原句。\n- 如果内容很短，就直接围绕这句话展开。\n- 用中文输出。\n\n内容：\n{text}', enabled: true, aiEnabled: true },
  { id: 'translate-explain', label: '译解', action: 'showResult', prompt: '请不要做逐字翻译。请把以下内容转换成我能放入 Obsidian 的“概念理解笔记”：\n\n要求：\n1. 先给自然中文解释。\n2. 保留关键原文术语，并解释它们的含义。\n3. 如果原文有隐含背景，请补出来。\n4. 给一个我能复用的例子。\n5. 最后给 3-5 个关键词。\n\n内容：\n{text}\n\n来源：\n{title}\n{url}', enabled: true, aiEnabled: true },
  { id: 'concept-card', label: '概念卡', action: 'showResult', prompt: '请把以下内容整理成一个 Obsidian 概念卡：\n\n输出结构：\n## 定义\n## 背景\n## 例子\n## 容易误解的点\n## 关联概念\n\n内容：\n{text}', enabled: true, aiEnabled: true },
  { id: 'quote', label: '金句', action: 'showResult', prompt: '请把以下选中文本整理成“金句/洞察卡片”：\n\n输出结构：\n> 原句\n\n## 这句话的含义\n## 为什么重要\n## 我可以怎么用\n## 关键词\n\n内容：\n{text}', enabled: true, aiEnabled: true },
  { id: 'question', label: '问题', action: 'showResult', prompt: '请把以下内容转成后续可探索的问题：\n\n输出结构：\n## 核心问题\n## 可能答案\n## 还需要查什么\n## 适合放入 Obsidian 的追问\n\n内容：\n{text}', enabled: true, aiEnabled: true },
  { id: 'copy', label: '复制', action: 'copy', prompt: '{text}', enabled: true, aiEnabled: false },
  { id: 'open-sidepanel', label: '打开侧边栏', action: 'openSidepanel', prompt: '{text}', enabled: true, aiEnabled: false },
];

async function runInlineAi(payload: { action?: string; text?: string; prompt?: string; attachments?: AiAttachment[] }): Promise<string> {
  const stored = await chrome.storage.sync.get('aiConfig');
  const config = { ...DEFAULT_INLINE_AI_CONFIG, ...(stored.aiConfig ?? {}) } as InlineAiConfig;
  const text = payload.text?.trim();
  const attachments = normalizeAiAttachments(payload.attachments);
  if (!text && attachments.length === 0) throw new Error('请先输入文字、划选文本或添加图片。');
  const instruction: Record<string, string> = {
    translate: '将以下内容翻译成简洁自然的中文：', summarize: '用要点总结以下内容：',
    explain: '解释以下内容：', grammar: '修正以下内容的语法和表达，并只返回修正后的文本：',
    'ai-chat': '基于以下内容回答：',
  };
  const prompt = payload.prompt?.trim() || `${instruction[payload.action ?? 'ai-chat'] ?? instruction['ai-chat']}\n\n${text}`;
  if (config.provider === 'gemini-web') return sendGeminiWebMessage(`${config.systemPrompt}\n\n${prompt}`, config.model, attachments);
  if (config.provider === 'gemini-nano') throw new Error('当前 Chrome 不支持 Gemini Nano。');
  if (config.provider === 'gemini-api') {
    if (!config.apiKey) throw new Error('Gemini API 尚未配置 API Key。');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-2.0-flash'}:generateContent?key=${config.apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: `${config.systemPrompt}\n\n${prompt}` }] }] }),
    });
    const data = await response.json() as any;
    if (!response.ok) throw new Error(data.error?.message || `Gemini API HTTP ${response.status}`);
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'AI 未返回内容';
  }
  const baseUrl = config.baseUrl || (config.provider === 'openai' ? 'https://api.openai.com' : config.provider === 'deepseek' ? 'https://api.deepseek.com' : '');
  if (!baseUrl) throw new Error('AI 助手尚未配置。请在扩展设置 > AI 助手中填写 Base URL 和模型。');
  if (!config.apiKey && config.provider !== 'custom') throw new Error('请在扩展设置 > AI 助手中填写 API Key。');
  const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}) },
    body: JSON.stringify({ model: config.model, temperature: 0.7, messages: [{ role: 'system', content: config.systemPrompt }, { role: 'user', content: prompt }] }),
  });
  const data = await response.json() as any;
  if (!response.ok) throw new Error(data.error?.message || `AI 请求失败：HTTP ${response.status}`);
  return data.choices?.[0]?.message?.content || 'AI 未返回内容';
}

const WEB_MODELS: Record<string, { hash: string; mode: number }> = {
  '8c46e95b1a07cecc': { hash: '8c46e95b1a07cecc', mode: 6 },
  '56fdd199312815e2': { hash: '56fdd199312815e2', mode: 1 },
  e6fa609c3fa255c0: { hash: 'e6fa609c3fa255c0', mode: 3 },
};
const WEB_ALIASES: Record<string, string> = { 'gemini-3.1-flash-lite': '8c46e95b1a07cecc', 'gemini-3.5-flash': '56fdd199312815e2', 'gemini-3.1-pro': 'e6fa609c3fa255c0' };

function extractGeminiToken(key: string, html: string): string {
  return html.match(new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`))?.[1] || '';
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
  const htmlResponse = await fetch('https://gemini.google.com/app', { credentials: 'include' });
  const html = await htmlResponse.text();
  const at = extractGeminiToken('SNlM0e', html);
  const bl = extractGeminiToken('cfb2h', html);
  const fSid = extractGeminiToken('FdrFJe', html);
  const uploadPushId = extractGeminiToken('qKIAYe', html);
  const uploadClientPctx = extractGeminiToken('Ylro7b', html);
  const authUser = html.match(/data-index="(\d+)"/)?.[1] || '0';
  if (!at || !bl || !fSid) throw new Error('Gemini Web 登录会话不可用。请打开 gemini.google.com 后刷新登录。');
  if (attachments.length > 0 && (!uploadPushId || !uploadClientPctx)) throw new Error('Gemini Web 图片上传令牌不可用。请打开 gemini.google.com 后刷新登录。');
  const modelId = WEB_ALIASES[configuredModel] || configuredModel || '56fdd199312815e2';
  const model = WEB_MODELS[modelId];
  if (!model) throw new Error('Gemini Web 模型不受支持。请选择 3.5 Flash、3.1 Flash-Lite 或 3.1 Pro。');
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
  const result = raw.split('\n').map(parseGeminiLine).filter((value): value is string => Boolean(value)).at(-1);
  if (!result) throw new Error('Gemini Web 未返回可解析内容，请刷新 Gemini 登录后重试。');
  return result;
}

// 安装/更新时初始化默认配置
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[feishu-sync] installed/updated:', details.reason);
  const config = await loadConfig();
  if (!config.token) {
    await saveConfig(DEFAULT_CONFIG);
  }
  // 初始化 AI 配置默认值
  chrome.storage.sync.get(['aiConfig'], (result) => {
    if (!result.aiConfig) {
      chrome.storage.sync.set({
        aiConfig: {
          provider: 'gemini-web',
          apiKey: '',
          baseUrl: '',
          model: '56fdd199312815e2',
          systemPrompt: '你是飞书同步插件的 AI 助手。你可以帮助用户翻译、总结文档，解答 Obsidian 和飞书同步相关的问题。请用简洁的中文回答。',
        },
      });
    }
  });
  await ensureContextScenes();
  await rebuildContextMenus();
});

chrome.runtime.onStartup?.addListener(() => {
  rebuildContextMenus().catch((error) => console.warn('[feishu-sync] context menu rebuild failed:', error));
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
  const scenes: ContextScene[] = rawScenes
    .filter((item): item is Partial<ContextScene> & { id?: string } => Boolean(item && typeof item === 'object'))
    .map((item): ContextScene => {
      const fallback = item.id ? fallbackById.get(item.id) : undefined;
      return {
        id: item.id || fallback?.id || 'scene',
        label: item.label || fallback?.label || '场景',
        action: (item.action || fallback?.action || 'showResult') as KnowledgeSceneAction,
        prompt: item.prompt ?? fallback?.prompt ?? '{text}',
        enabled: item.enabled ?? fallback?.enabled ?? true,
        defaultDir: item.defaultDir || fallback?.defaultDir || '',
        defaultAppendPath: item.defaultAppendPath || fallback?.defaultAppendPath || '',
        aiEnabled: item.aiEnabled ?? fallback?.aiEnabled ?? true,
      };
    })
    .filter((scene) => scene.id);
  const ids = new Set(scenes.map((scene) => scene.id));
  for (const scene of DEFAULT_CONTEXT_SCENES) {
    if (!ids.has(scene.id)) scenes.push(scene);
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

function fillScenePrompt(template: string, values: { text: string; title: string; url: string; domain: string; date: string }): string {
  return template
    .replace(/\{text\}/g, values.text)
    .replace(/\{title\}/g, values.title)
    .replace(/\{url\}/g, values.url)
    .replace(/\{domain\}/g, values.domain)
    .replace(/\{date\}/g, values.date);
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
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('未找到当前网页标签页。');
      const action = message.payload?.action as string;
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
      const context = page[0]?.result || { title: tab.title || '', url: tab.url || '', text: '' };
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
    runInlineAi(message.payload ?? {})
      .then((text) => sendResponse({ text }))
      .catch((error) => sendResponse({ error: error instanceof Error ? error.message : String(error) }));
    return true;
  }

  if (message.type === 'REBUILD_CONTEXT_MENUS') {
    rebuildContextMenus()
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, message: error instanceof Error ? error.message : String(error) }));
    return true;
  }

  // ───── Web Clipper（增强版）─────
  if (message.type === 'clip-to-obsidian') {
    (async () => {
      const tab = sender.tab;
      if (!tab?.id) return;

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
          await postClip(config, {
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
          });
          return;
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
      } catch (e) { console.error('[feishu-sync] clip error:', e); }
    })();
    sendResponse({ ok: true });
    return true;
  }

  // ───── 飞书同步触发（从工具栏）─────
  if (message.type === 'feishu-sync-trigger') {
    (async () => {
      const tab = sender.tab;
      if (!tab?.id) return;
      const payload = message.payload || {};

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
            },
          });
        }, 500);
      } catch (e) { console.error('[feishu-sync] feishu-sync-trigger error:', e); }
    })();
    sendResponse({ ok: true });
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
