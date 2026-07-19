import { initialToolbarState, reduceToolbarState } from './toolbar-state.js';

/**
 * 浮动选择工具栏 v3.1 — 精简版：AI 操作委托给 Sidepanel 统一处理
 *
 * 状态机:
 *   IDLE → mouseup(选中文本) → CAPSULE(显示紧凑胶囊栏)
 *   CAPSULE → 点击复制 → 图标闪烁 → IDLE
 *   CAPSULE → 外部点击/Escape/滚动 → IDLE
 *   CAPSULE → AI 按钮 → hideToolbar + 发消息到 sidepanel
 */
(function () {
  // ═══════════════════════════════════════════════════════════════
  // Types
  // ═══════════════════════════════════════════════════════════════

  type KnowledgeSceneAction = 'save' | 'append' | 'refine' | 'showResult' | 'copy' | 'openSidepanel';
  type Action = string | 'more' | 'feishu-sync';
  type KnowledgeScene = {
    id: string;
    label: string;
    action: KnowledgeSceneAction;
    prompt: string;
    enabled: boolean;
    defaultDir?: string;
    defaultAppendPath?: string;
    aiEnabled: boolean;
  };
  type SelectionToolbarConfig = {
    enabled: boolean;
    defaultAction: 'save' | 'append' | 'refine';
    saveBehavior: 'silent' | 'confirmInSidepanel';
    defaultAppendPath: string;
    aiBeforeSave: boolean;
    visibleActions: string[];
  };

  /** AI 错误类型（与 background.ts 一致） */
  type AiErrorType =
    | 'TIMEOUT'
    | 'CONNECTION_ERROR'
    | 'CONTENT_TOO_LONG'
    | 'QUOTA_EXHAUSTED'
    | 'EMPTY_RESULT'
    | 'SESSION_EXPIRED'
    | 'UNKNOWN';

  /** AI 错误响应（与 background.ts 一致） */
  interface AiErrorResponse {
    errorType: AiErrorType;
    message: string;
    provider: string;
  }

  /** 错误卡片配置 */
  interface ErrorCardConfig {
    icon: string;
    title: string;
    desc: string;
    actions: ErrorCardAction[];
  }

  interface ErrorCardAction {
    label: string;
    action: string;
    primary: boolean;
  }

  // ═══════════════════════════════════════════════════════════════
  // Constants (must be declared before state initializers)
  // ═══════════════════════════════════════════════════════════════

  const MAIN_SCENE_IDS = ['save', 'append', 'refine'];
  const MORE_SCENE_IDS = ['translate-explain', 'concept-card', 'quote', 'question', 'copy', 'open-sidepanel'];

  /** 划词防误触 debounce 时长（Google Docs 200-300ms 折中） */
  const SELECTION_DEBOUNCE_MS = 150;

  // ═══════════════════════════════════════════════════════════════
  // State
  // ═══════════════════════════════════════════════════════════════

  let state = initialToolbarState();
  let lastSelection = '';
  let host: HTMLDivElement | null = null;
  let shadow: ShadowRoot | null = null;
  let lastPath = window.location.pathname;
  let resultTitle = '';
  let toolbarConfig: SelectionToolbarConfig = getDefaultToolbarConfig();
  let knowledgeScenes: KnowledgeScene[] = getDefaultKnowledgeScenes();
  let moreOpen = false;
  let geminiSessionAlive = true; // Gemini Web session 状态
  let aiRequestInFlight = false;  // 防止重复 AI 请求
  let selectionDebounceTimer: number | null = null;  // mouseup debounce 定时器
  let lastStreamPrompt = '';  // 最近一次流式 AI 请求的 prompt（用于重试）
  let lastStreamScenePromptTemplate = '';  // 未填充的 prompt 模板（用于截取重试）
  let streamChunkReceived = false;  // 是否已收到第一个 chunk
  let streamProgressTimer: number | null = null;  // 流式进度提示定时器
  let retryAvailableAt = 0;  // 重试可用的时间戳（防快速重复点击）

  // ═══════════════════════════════════════════════════════════════
  // Page Detection
  // ═══════════════════════════════════════════════════════════════

  function isFeishuDocPage(): boolean {
    const hostname = window.location.hostname;
    return (
      /feishu\.cn|larksuite\.com/.test(hostname) &&
      /\/(wiki|docx|doc)\//.test(window.location.pathname)
    );
  }

  function extractDocToken(): {
    node_token?: string;
    obj_token?: string;
  } | null {
    const url = window.location.href;
    const wikiMatch = url.match(/\/wiki\/([A-Za-z0-9]+)/);
    if (wikiMatch) return { node_token: wikiMatch[1] };
    const docxMatch = url.match(/\/(?:docx|doc)\/([A-Za-z0-9]+)/);
    if (docxMatch) return { obj_token: docxMatch[1] };
    return null;
  }

  function getPageMetadata(): {
    title: string;
    url: string;
    description: string;
    selectedText: string;
    favicon: string;
    domain: string;
  } {
    const description =
      document
        .querySelector<HTMLMetaElement>('meta[name="description"]')
        ?.content ||
      document.querySelector<HTMLMetaElement>(
        'meta[property="og:description"]',
      )?.content ||
      '';
    const favicon =
      document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.href ||
      document.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]')
        ?.href ||
      `${window.location.origin}/favicon.ico`;
    return {
      title: document.title,
      url: window.location.href,
      description,
      selectedText: lastSelection.trim(),
      favicon,
      domain: window.location.hostname,
    };
  }

  function getSurroundingContext(chars: number = 200): string {
    try {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return '';
      const range = sel.getRangeAt(0);
      const selectedText = sel.toString();
      if (!selectedText) return '';
      // 向上找到段落级容器
      let container: Node | null = range.commonAncestorContainer;
      while (container && container.nodeType === Node.TEXT_NODE && container.parentElement) {
        container = container.parentElement;
      }
      const parentText = (container as HTMLElement)?.innerText || (container as HTMLElement)?.textContent || '';
      const index = parentText.indexOf(selectedText);
      if (index === -1) {
        // 回退：直接取父节点前 400 字符
        return parentText.slice(0, chars * 2 + selectedText.length);
      }
      const start = Math.max(0, index - chars);
      const end = Math.min(parentText.length, index + selectedText.length + chars);
      const before = parentText.slice(start, index).trim();
      const after = parentText.slice(index + selectedText.length, end).trim();
      let ctx = '';
      if (before) ctx += `上文：${before}\n`;
      if (after) ctx += `下文：${after}`;
      return ctx;
    } catch {
      return '';
    }
  }

  function normalizeScene(scene: Partial<KnowledgeScene> & { id?: string }, fallback?: KnowledgeScene): KnowledgeScene {
    return {
      id: scene.id || fallback?.id || 'scene',
      label: scene.label || fallback?.label || '场景',
      action: (scene.action || fallback?.action || 'showResult') as KnowledgeSceneAction,
      prompt: scene.prompt ?? fallback?.prompt ?? '{text}',
      enabled: scene.enabled ?? fallback?.enabled ?? true,
      defaultDir: scene.defaultDir ?? fallback?.defaultDir ?? '',
      defaultAppendPath: scene.defaultAppendPath ?? fallback?.defaultAppendPath ?? '',
      aiEnabled: scene.aiEnabled ?? fallback?.aiEnabled ?? true,
    };
  }

  function normalizeScenes(input: unknown): KnowledgeScene[] {
    const defaults = getDefaultKnowledgeScenes();
    const fallbackById = new Map(defaults.map((scene) => [scene.id, scene]));
    const rawScenes = Array.isArray(input) && input.length > 0 ? input : defaults;
    const normalized = rawScenes
      .filter((scene): scene is Partial<KnowledgeScene> & { id?: string } => Boolean(scene && typeof scene === 'object'))
      .map((scene) => normalizeScene(scene, scene.id ? fallbackById.get(scene.id) : undefined))
      .filter((scene) => scene.id);
    const existingIds = new Set(normalized.map((scene) => scene.id));
    for (const scene of defaults) {
      if (!existingIds.has(scene.id)) normalized.push(scene);
    }
    return normalized;
  }

  function normalizeToolbarConfig(input: unknown): SelectionToolbarConfig {
    const defaults = getDefaultToolbarConfig();
    if (!input || typeof input !== 'object') return defaults;
    const value = input as Partial<SelectionToolbarConfig>;
    return {
      enabled: value.enabled ?? defaults.enabled,
      defaultAction: value.defaultAction ?? defaults.defaultAction,
      saveBehavior: value.saveBehavior ?? defaults.saveBehavior,
      defaultAppendPath: value.defaultAppendPath ?? defaults.defaultAppendPath,
      aiBeforeSave: value.aiBeforeSave ?? defaults.aiBeforeSave,
      visibleActions: Array.isArray(value.visibleActions) && value.visibleActions.length > 0
        ? value.visibleActions
        : defaults.visibleActions,
    };
  }

  function loadToolbarSettings(): void {
    try {
      chrome.storage.sync.get(['contextScenes', 'selectionToolbarConfig'], (result) => {
        toolbarConfig = normalizeToolbarConfig(result.selectionToolbarConfig);
        knowledgeScenes = normalizeScenes(result.contextScenes);
      });
    } catch {
      toolbarConfig = getDefaultToolbarConfig();
      knowledgeScenes = getDefaultKnowledgeScenes();
    }
  }

  function fillPrompt(template: string, text: string, extraContext?: string): string {
    const metadata = getPageMetadata();
    const date = new Date().toISOString().slice(0, 10);
    const context = extraContext || getSurroundingContext();
    return String(template || '{text}')
      .replace(/\{text\}/g, text)
      .replace(/\{title\}/g, metadata.title)
      .replace(/\{url\}/g, metadata.url)
      .replace(/\{domain\}/g, metadata.domain)
      .replace(/\{date\}/g, date)
      .replace(/\{context\}/g, context);
  }

  // ═══════════════════════════════════════════════════════════════
  // Inline CSS (injected into Shadow DOM)
  // ═══════════════════════════════════════════════════════════════

  const TOOLBAR_CSS = `
:host {
  all: initial;
  position: fixed;
  z-index: 2147483647;
  pointer-events: none;
  font-family: '宋体', SimSun, 'Songti SC', serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Microsoft YaHei", "Helvetica Neue", sans-serif;

  /* ── Design Tokens ── */
  --brand-50:  #E8F8EE;
  --brand-100: #D0F2DD;
  --brand-200: #A1E4BC;
  --brand-500: #07C160;
  --brand-600: #06A050;
  --brand-700: #058040;

  --neutral-0:   #FFFFFF;
  --neutral-50:  #F7F7F7;
  --neutral-100: #EDEDED;
  --neutral-200: #E5E5E5;
  --neutral-400: #B2B2B2;
  --neutral-500: #999999;
  --neutral-600: #666666;
  --neutral-700: #404040;
  --neutral-800: #2C2C2C;
  --neutral-900: #191919;

  --c-brand:       var(--brand-500);
  --c-brand-hover: var(--brand-600);
  --c-brand-soft:  var(--brand-50);
  --c-brand-ring:  rgba(7, 193, 96, 0.18);

  --c-surface:     var(--neutral-0);
  --c-surface-dim: var(--neutral-100);
  --c-border:      var(--neutral-200);
  --c-divider:     var(--neutral-100);

  --c-text:        var(--neutral-900);
  --c-text-2:      var(--neutral-600);
  --c-text-3:      var(--neutral-500);

  --c-error:       #FA5151;
  --c-error-soft:  #FDEAEA;
  --c-white:       #FFFFFF;

  --r-sm: 6px;
  --r-md: 8px;
  --r-lg: 12px;
  --ease:  cubic-bezier(0.22, 1, 0.36, 1);
  --spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --t-fast: 0.15s var(--ease);

  /* ═══════════════════════════════════════════════════════════════
     KnowFlow Design Tokens (--kf-* 体系)
     参考：Fluent 2 Shadow / Linear Design / M3 State Layer / Apple Material
     ═══════════════════════════════════════════════════════════════ */

  /* ── 表面层次（Linear 亮度递进 + Apple 半透明材料）── */
  --kf-bg-base:             rgba(255, 255, 255, 0.82);   /* 胶囊底色 */
  --kf-bg-elevated:         rgba(255, 255, 255, 0.92);   /* 结果面板底色 */
  --kf-bg-hover:            rgba(0, 0, 0, 0.04);         /* 按钮 hover State Layer */
  --kf-bg-active:           rgba(0, 0, 0, 0.08);         /* 按钮 active State Layer */
  --kf-bg-error:            rgba(239, 68, 68, 0.06);     /* 错误态背景 */
  --kf-bg-ai-loading:       rgba(99, 102, 241, 0.08);    /* AI loading 按钮底色 */

  /* ── 文本层次（Linear opacity 控制）── */
  --kf-text-primary:        rgba(0, 0, 0, 0.88);
  --kf-text-secondary:      rgba(0, 0, 0, 0.60);
  --kf-text-tertiary:       rgba(0, 0, 0, 0.38);

  /* ── 边框（Arc 细边框 + Linear 低透明度）── */
  --kf-border:              rgba(0, 0, 0, 0.06);
  --kf-border-strong:       rgba(0, 0, 0, 0.12);
  --kf-divider:             rgba(0, 0, 0, 0.06);

  /* ── AI 品牌色（Notion AI 紫色策略）── */
  --kf-ai-primary:          #6366F1;     /* Indigo 500 */
  --kf-ai-secondary:        #8B5CF6;     /* Violet 500 */
  --kf-ai-gradient:         linear-gradient(135deg, #6366F1, #8B5CF6);
  --kf-ai-gradient-soft:    linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08));

  /* ── 阴影系统（Fluent 2 Key + Ambient 双层）── */
  --kf-shadow-sm:
    0 2px 4px rgba(0, 0, 0, 0.06),
    0 0 8px rgba(0, 0, 0, 0.04);

  --kf-shadow-md:
    0 8px 16px rgba(0, 0, 0, 0.10),
    0 0 24px rgba(0, 0, 0, 0.06);

  --kf-shadow-hover:
    0 4px 8px rgba(0, 0, 0, 0.08),
    0 0 16px rgba(0, 0, 0, 0.06);

  --kf-shadow-error:
    0 4px 12px rgba(239, 68, 68, 0.12),
    0 0 16px rgba(239, 68, 68, 0.06);

  /* ── 圆角 ── */
  --kf-radius-sm:           8px;
  --kf-radius-md:           12px;
  --kf-radius-lg:           16px;
  --kf-radius-btn:          8px;
  --kf-radius-capsule:      20px;
  --kf-radius-panel:        14px;
  --kf-radius-full:         9999px;

  /* ── 字号（Linear 紧凑排版）── */
  --kf-text-xs:             11px;
  --kf-text-sm:             12px;
  --kf-text-base:           13px;
  --kf-text-lg:             15px;

  /* ── 间距（4px 基准网格）── */
  --kf-space-xs:            4px;
  --kf-space-sm:            8px;
  --kf-space-md:            12px;
  --kf-space-lg:            16px;
  --kf-space-xl:            24px;

  /* ── backdrop-blur（从 20px 降至 6/12px）── */
  --kf-blur-toolbar:        6px;
  --kf-blur-panel:          12px;

  /* ── 缓动曲线与时长（Linear 动效系统）── */
  --kf-ease-out:            cubic-bezier(0.16, 1, 0.3, 1);
  --kf-ease-in-out:         cubic-bezier(0.65, 0, 0.35, 1);
  --kf-ease-spring:         cubic-bezier(0.34, 1.56, 0.64, 1);
  --kf-dur-fast:            100ms;
  --kf-dur-normal:          150ms;
  --kf-dur-slow:            250ms;
  --kf-dur-ripple:          300ms;
}
.capsule {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 4px 5px;
  background: var(--kf-bg-base);
  backdrop-filter: blur(var(--kf-blur-toolbar));
  -webkit-backdrop-filter: blur(var(--kf-blur-toolbar));
  border-radius: var(--kf-radius-capsule);
  border: 0.5px solid var(--kf-border);
  box-shadow: var(--kf-shadow-sm);
  user-select: none;
  pointer-events: auto;
  animation: capsule-in var(--kf-dur-slow) var(--kf-ease-out);
  transition:
    box-shadow var(--kf-dur-normal) var(--kf-ease-out),
    border-radius var(--kf-dur-slow) var(--kf-ease-out);
}
@keyframes capsule-in {
  from { opacity: 0; transform: scale(0.88) translateY(6px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.capsule button {
  position: relative;
  overflow: hidden;
  min-width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: var(--kf-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--kf-text-secondary);
  padding: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform var(--kf-dur-fast) var(--kf-ease-out),
    box-shadow var(--kf-dur-normal) var(--kf-ease-out),
    color var(--kf-dur-fast) ease;
}
/* ═══ State Layer（M3）— 替代 background 变化 ═══ */
.capsule button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--kf-text-primary);
  opacity: 0;
  transition: opacity var(--kf-dur-fast) ease;
  pointer-events: none;
  z-index: 0;
}
.capsule button > * { position: relative; z-index: 1; }
.capsule button.text {
  width: auto;
  border-radius: 16px;
  padding: 0 10px;
  gap: 5px;
  font-size: var(--kf-text-sm);
  font-weight: 600;
}
.capsule button:hover::before { opacity: 0.06; }
.capsule button:active::before { opacity: 0.12; }
.capsule button:hover {
  color: var(--c-brand);
  transform: translateY(-1px);
  box-shadow: var(--kf-shadow-hover);
}
.capsule button:active {
  transform: translateY(0) scale(0.96);
  transition: transform 60ms ease-out;
  box-shadow: var(--kf-shadow-sm);
}
.capsule .divider {
  width: 1px;
  height: 18px;
  background: var(--kf-divider);
  margin: 0 3px;
  flex-shrink: 0;
}
.capsule button.primary {
  background: var(--c-brand);
  color: var(--c-white);
  border-radius: 16px;
  width: auto;
  padding: 0 12px;
  gap: 4px;
  font-size: var(--kf-text-sm);
  font-weight: 600;
  box-shadow: var(--kf-shadow-sm);
}
.capsule button.primary:hover {
  background: var(--c-brand-hover);
  color: var(--c-white);
  box-shadow: var(--kf-shadow-hover);
  transform: translateY(-1px);
}
.capsule button.primary:active {
  transform: translateY(1px) scale(0.97);
  box-shadow: var(--kf-shadow-sm);
}
.more-wrap { position: relative; }
.more-menu {
  position: absolute;
  right: 0;
  top: 38px;
  display: grid;
  gap: 4px;
  min-width: 128px;
  padding: 6px;
  border-radius: var(--r-lg);
  background: var(--kf-bg-elevated);
  backdrop-filter: blur(var(--kf-blur-panel));
  -webkit-backdrop-filter: blur(var(--kf-blur-panel));
  border: 0.5px solid var(--kf-border);
  box-shadow: var(--kf-shadow-md);
}
.more-menu button {
  width: 100%;
  justify-content: flex-start;
  border-radius: 9px;
  padding: 0 8px;
}
.toast {
  margin-left: 6px;
  padding: 6px 10px;
  border-radius: var(--kf-radius-lg);
  background: var(--c-brand-soft);
  color: var(--c-brand-hover);
  font-size: var(--kf-text-sm);
  font-weight: 500;
  white-space: nowrap;
}
.capsule button.copied {
  color: var(--c-brand);
}
.result-window {
  width: min(360px, calc(100vw - 24px));
  max-height: min(360px, calc(100vh - 24px));
  overflow: hidden;
  background: var(--kf-bg-elevated);
  backdrop-filter: blur(var(--kf-blur-panel));
  -webkit-backdrop-filter: blur(var(--kf-blur-panel));
  border-radius: var(--kf-radius-panel);
  border: 0.5px solid var(--kf-border);
  box-shadow: var(--kf-shadow-md);
  pointer-events: auto;
}
.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--kf-divider);
  color: var(--kf-text-primary);
  font-size: var(--kf-text-base);
  font-weight: 600;
}
.result-close {
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--kf-text-tertiary);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: background var(--kf-dur-fast) ease, color var(--kf-dur-fast) ease;
}
.result-close:hover { background: var(--kf-bg-hover); color: var(--kf-text-primary); }
.result-body {
  max-height: 300px;
  overflow: auto;
  padding: 12px 14px;
  color: var(--kf-text-primary);
  font-size: var(--kf-text-base);
  line-height: 1.65;
  white-space: pre-wrap;
}
.result-content {
  opacity: 1;
  transition: opacity 0.18s ease;
}
.result-content.crossfading {
  opacity: 0;
}
/* ───── 结果面板展开/收起动画 ───── */
.result-panel {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px) scaleY(0.96);
  transform-origin: top center;
  transition:
    max-height var(--kf-dur-slow) var(--kf-ease-out),
    opacity var(--kf-dur-slow) var(--kf-ease-out),
    transform var(--kf-dur-slow) var(--kf-ease-out);
  margin-top: 4px;
}
.result-panel.expanded {
  max-height: 420px;
  opacity: 1;
  transform: translateY(0) scaleY(1);
}
.result-panel.collapsing {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px) scaleY(0.96);
}
/* ───── 胶囊收缩态（展开面板时） ───── */
.capsule.shrinking {
  border-radius: 14px 14px 4px 4px;
  transition: border-radius var(--kf-dur-slow) var(--kf-ease-out);
}
/* ───── 按钮点击涟漪 ───── */
.capsule button::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--c-brand);
  opacity: 0;
  transform: scale(0.4);
}
.capsule button.ripple::after {
  animation: btn-ripple var(--kf-dur-ripple) var(--kf-ease-out);
}
@keyframes btn-ripple {
  0%   { opacity: 0.18; transform: scale(0.4); }
  100% { opacity: 0; transform: scale(2.5); }
}
/* ───── 胶囊入场优化 ───── */
@keyframes capsule-bounce-in {
  0%   { opacity: 0; transform: scale(0.82) translateY(10px); }
  60%  { opacity: 1; transform: scale(1.03) translateY(-1px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
.capsule.entering {
  animation: capsule-bounce-in var(--kf-dur-slow) var(--kf-ease-out);
}
.ai-progress { display: flex; align-items: center; gap: 8px; color: var(--kf-text-secondary); padding: 8px 0; }
.ai-spinner {
  width: 16px; height: 16px; border: 2px solid var(--kf-divider);
  border-top-color: var(--kf-ai-primary); border-radius: 50%;
  animation: ai-spin 0.6s linear infinite; flex-shrink: 0;
}
@keyframes ai-spin { to { transform: rotate(360deg); } }
.ai-error { color: #D85A30; white-space: pre-wrap; margin-bottom: 10px; }
.ai-retry-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 14px; border: 1px solid var(--c-brand); border-radius: var(--kf-radius-btn);
  background: transparent; color: var(--c-brand); cursor: pointer;
  font-size: var(--kf-text-sm); font-weight: 500; transition: background var(--kf-dur-fast) ease, color var(--kf-dur-fast) ease;
}
.ai-retry-btn:hover { background: var(--c-brand-soft); }
.capsule button.loading { opacity: 0.5; pointer-events: none; }
/* ═══ AI 按钮品牌色 — 图标用蓝紫渐变，区别于普通按钮 ═══ */
.capsule button.ai-btn svg {
  color: var(--kf-ai-primary);
}
/* Gemini session 过期提示 */
.capsule button.session-warn { position: relative; }
.capsule button.session-warn::after {
  content: '';
  position: absolute; top: 5px; right: 4px;
  width: 6px; height: 6px; border-radius: 50%;
  background: #FAAD14;
  box-shadow: 0 0 4px rgba(250, 173, 20, 0.5);
}
@media (prefers-color-scheme: dark) {
  :host {
    --c-surface:      #1E1E1E;
    --c-surface-dim:  #2A2A2A;
    --c-border:       #333333;
    --c-divider:      rgba(255, 255, 255, 0.08);
    --c-text:         #E5E5E5;
    --c-text-2:       #999999;
    --c-text-3:       #666666;
    --c-brand:        #07C160;
    --c-brand-hover:  #06AD56;
    --c-brand-soft:   #0D2B1A;

    /* ── --kf-* 暗色模式覆盖（Fluent 2 Dark: Key shadow opacity 28%）── */
    --kf-bg-base:             rgba(30, 30, 30, 0.82);
    --kf-bg-elevated:         rgba(38, 38, 38, 0.92);
    --kf-bg-hover:            rgba(255, 255, 255, 0.06);
    --kf-bg-active:           rgba(255, 255, 255, 0.10);
    --kf-bg-error:            rgba(239, 68, 68, 0.10);
    --kf-bg-ai-loading:       rgba(129, 140, 248, 0.12);

    --kf-text-primary:        rgba(255, 255, 255, 0.95);
    --kf-text-secondary:      rgba(255, 255, 255, 0.65);
    --kf-text-tertiary:       rgba(255, 255, 255, 0.38);

    --kf-border:              rgba(255, 255, 255, 0.08);
    --kf-border-strong:       rgba(255, 255, 255, 0.14);
    --kf-divider:             rgba(255, 255, 255, 0.08);

    --kf-shadow-sm:
      0 2px 4px rgba(0, 0, 0, 0.28),
      0 0 8px rgba(0, 0, 0, 0.20);
    --kf-shadow-md:
      0 8px 16px rgba(0, 0, 0, 0.32),
      0 0 24px rgba(0, 0, 0, 0.24);
    --kf-shadow-hover:
      0 4px 8px rgba(0, 0, 0, 0.30),
      0 0 16px rgba(0, 0, 0, 0.22);
  }
  .capsule button { color: var(--kf-text-secondary); }
  .capsule .divider { background: var(--kf-divider); }
  .capsule button.primary { background: var(--c-brand); color: var(--c-white); }
  .capsule button.primary:hover { background: var(--c-brand-hover); color: var(--c-white); }
  .toast { background: var(--c-brand-soft); color: #71D69A; }
  .result-header { color: var(--kf-text-primary); border-bottom-color: var(--kf-divider); }
  .result-close { color: var(--kf-text-tertiary); }
  .result-close:hover { background: var(--kf-bg-hover); color: var(--kf-text-primary); }
  .result-body { color: var(--kf-text-primary); }
  .ai-error { color: #F09595; }
  .ai-retry-btn { border-color: var(--c-brand); color: var(--c-brand); }
  .ai-retry-btn:hover { background: var(--c-brand-soft); }
}
/* ═══ 流式输出光标 ═══ */
.result-content.streaming {
  display: inline;
}
.result-content.streaming::after {
  content: '▊';
  display: inline-block;
  margin-left: 2px;
  color: var(--kf-ai-primary);
  animation: kf-blink 1s step-end infinite;
}
@keyframes kf-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
/* ═══ AI 错误卡片 ═══ */
.ai-error-card {
  padding: 18px 14px;
  text-align: center;
}
.ai-error-card .error-icon {
  font-size: 32px;
  margin-bottom: 8px;
  line-height: 1;
}
.ai-error-card .error-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--kf-text-primary);
  margin-bottom: 4px;
}
.ai-error-card .error-desc {
  font-size: 12px;
  color: var(--kf-text-secondary);
  line-height: 1.5;
  margin-bottom: 14px;
  white-space: pre-wrap;
}
.ai-error-card .error-actions {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}
.ai-error-card .error-btn {
  padding: 6px 12px;
  border: 1px solid var(--kf-border-strong);
  background: var(--neutral-0);
  border-radius: var(--kf-radius-btn);
  font-size: 12px;
  cursor: pointer;
  color: var(--kf-text-secondary);
  transition: all var(--kf-dur-fast) ease;
}
.ai-error-card .error-btn:hover:not(:disabled) {
  border-color: var(--c-brand);
  color: var(--c-brand);
}
.ai-error-card .error-btn.primary {
  background: var(--c-brand);
  color: var(--c-white);
  border-color: var(--c-brand);
}
.ai-error-card .error-btn.primary:hover:not(:disabled) {
  background: var(--c-brand-hover);
}
.ai-error-card .error-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ai-error-card .error-btn.countdown::after {
  content: " (" attr(data-countdown) "s)";
  font-size: 11px;
}
/* ═══ AI 按钮 loading 态（渐变底色 + pulse）═══ */
.capsule button.ai-btn.loading {
  background: var(--kf-ai-gradient-soft);
  color: var(--kf-ai-primary);
  pointer-events: none;
}
.capsule button.ai-btn.loading svg {
  animation: ai-pulse 1.4s ease-in-out infinite;
}
@keyframes ai-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.9); }
}
/* ═══ 动态暗色模式（页面背景检测，覆盖 prefers-color-scheme）═══ */
:host([data-theme="dark"]) {
  --c-surface:      #1E1E1E;
  --c-surface-dim:  #2A2A2A;
  --c-border:       #333333;
  --c-divider:      rgba(255, 255, 255, 0.08);
  --c-text:         #E5E5E5;
  --c-text-2:       #999999;
  --c-text-3:       #666666;
  --c-brand:        #07C160;
  --c-brand-hover:  #06AD56;
  --c-brand-soft:   #0D2B1A;
  --kf-bg-base:             rgba(30, 30, 30, 0.82);
  --kf-bg-elevated:         rgba(38, 38, 38, 0.92);
  --kf-bg-hover:            rgba(255, 255, 255, 0.06);
  --kf-bg-active:           rgba(255, 255, 255, 0.10);
  --kf-bg-error:            rgba(239, 68, 68, 0.10);
  --kf-bg-ai-loading:       rgba(129, 140, 248, 0.12);
  --kf-text-primary:        rgba(255, 255, 255, 0.95);
  --kf-text-secondary:      rgba(255, 255, 255, 0.65);
  --kf-text-tertiary:       rgba(255, 255, 255, 0.38);
  --kf-border:              rgba(255, 255, 255, 0.08);
  --kf-border-strong:       rgba(255, 255, 255, 0.14);
  --kf-divider:             rgba(255, 255, 255, 0.08);
  --kf-shadow-sm:
    0 2px 4px rgba(0, 0, 0, 0.28),
    0 0 8px rgba(0, 0, 0, 0.20);
  --kf-shadow-md:
    0 8px 16px rgba(0, 0, 0, 0.32),
    0 0 24px rgba(0, 0, 0, 0.24);
  --kf-shadow-hover:
    0 4px 8px rgba(0, 0, 0, 0.30),
    0 0 16px rgba(0, 0, 0, 0.22);
}
:host([data-theme="dark"]) .capsule button { color: var(--kf-text-secondary); }
:host([data-theme="dark"]) .capsule .divider { background: var(--kf-divider); }
:host([data-theme="dark"]) .capsule button.primary { background: var(--c-brand); color: var(--c-white); }
:host([data-theme="dark"]) .capsule button.primary:hover { background: var(--c-brand-hover); color: var(--c-white); }
:host([data-theme="dark"]) .toast { background: var(--c-brand-soft); color: #71D69A; }
:host([data-theme="dark"]) .result-header { color: var(--kf-text-primary); border-bottom-color: var(--kf-divider); }
:host([data-theme="dark"]) .result-close { color: var(--kf-text-tertiary); }
:host([data-theme="dark"]) .result-close:hover { background: var(--kf-bg-hover); color: var(--kf-text-primary); }
:host([data-theme="dark"]) .result-body { color: var(--kf-text-primary); }
:host([data-theme="dark"]) .ai-error { color: #F09595; }
:host([data-theme="dark"]) .ai-error-card .error-btn { background: #2A2A2A; border-color: var(--kf-border-strong); color: var(--kf-text-secondary); }
:host([data-theme="dark"]) .ai-error-card .error-btn:hover:not(:disabled) { border-color: var(--c-brand); color: var(--c-brand); }
:host([data-theme="dark"]) .ai-error-card .error-title { color: var(--kf-text-primary); }
:host([data-theme="dark"]) .ai-error-card .error-desc { color: var(--kf-text-secondary); }
`;

  // ═══════════════════════════════════════════════════════════════
  // SVG Icons
  // ═══════════════════════════════════════════════════════════════

  function iconSVG(path: string): string {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  }

  const ICONS: Record<string, string> = {
    'translate-explain': iconSVG(
      '<path d="M1 4h4l2 6H5L4 8H2l-1 2H0l2-6zm2 3l1-2 1 2H3zm7-3h4v1h-1.5L11 10h-1l-1.5-5H7V4h4z"/>',
    ),
    refine: iconSVG(
      '<path d="M2 4h12M2 8h8M2 12h6"/><circle cx="13" cy="13" r="1.5"/>',
    ),
    'concept-card': iconSVG(
      '<circle cx="8" cy="8" r="6"/><path d="M8 11V8M8 5.5V5"/>',
    ),
    save: iconSVG(
      '<path d="M3 2v12l5-3 5 3V2a1 1 0 00-1-1H4a1 1 0 00-1 1z"/>',
    ),
    append: iconSVG(
      '<path d="M8 2v12"/><path d="M2 8h12"/><path d="M3 14h10"/>',
    ),
    copy: iconSVG(
      '<rect x="5" y="1" width="8" height="12" rx="1"/><path d="M3 4v10a1 1 0 001 1h8"/>',
    ),
    quote: iconSVG(
      '<path d="M5 5H3a2 2 0 00-2 2v2h4V5zM13 5h-2a2 2 0 00-2 2v2h4V5z"/>',
    ),
    question: iconSVG(
      '<circle cx="8" cy="8" r="6"/><path d="M6.5 6a1.8 1.8 0 113 1.3c-.8.5-1.3 1-1.3 1.9"/><path d="M8 12h.01"/>',
    ),
    'open-sidepanel': iconSVG(
      '<rect x="2" y="2" width="12" height="12" rx="1"/><path d="M6 2v12"/>',
    ),
    more: iconSVG(
      '<circle cx="3.5" cy="8" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="12.5" cy="8" r="1"/>',
    ),
    'feishu-sync': iconSVG(
      '<path d="M1 8a7 7 0 1114 0A7 7 0 011 8z"/><path d="M5 8l2 2 4-4"/>',
    ),
  };

  function getDefaultToolbarConfig(): SelectionToolbarConfig {
    return {
      enabled: true,
      defaultAction: 'append',
      saveBehavior: 'confirmInSidepanel',
      defaultAppendPath: '',
      aiBeforeSave: false,
      visibleActions: [...MAIN_SCENE_IDS, ...MORE_SCENE_IDS],
    };
  }

  function getDefaultKnowledgeScenes(): KnowledgeScene[] {
    return [
      { id: 'save', label: '收存', action: 'save', prompt: '{text}', enabled: true, aiEnabled: false },
      { id: 'append', label: '补充', action: 'append', prompt: '{text}', enabled: true, aiEnabled: false },
      { id: 'refine', label: '精炼', action: 'refine', prompt: '请把以下内容整理成 Obsidian 知识卡片：\n\n输出结构：\n## 核心观点\n## 关键要点\n## 可复用启发\n## 相关关键词\n\n要求：\n- 不要空泛总结。\n- 保留有信息密度的原句。\n- 如果内容很短，就直接围绕这句话展开。\n- 用中文输出。\n\n内容：\n{text}', enabled: true, aiEnabled: true },
      { id: 'translate-explain', label: '译解', action: 'showResult', prompt: '请不要做逐字翻译。请把以下内容转换成我能放入 Obsidian 的"概念理解笔记"：\n\n要求：\n1. 先给自然中文解释。\n2. 保留关键原文术语，并解释它们的含义。\n3. 如果原文有隐含背景，请补出来。\n4. 给一个我能复用的例子。\n5. 最后给 3-5 个关键词。\n\n页面：{title}\n来源：{url}\n选中文本：\n{text}\n\n{context}', enabled: true, aiEnabled: true },
      { id: 'concept-card', label: '概念卡', action: 'showResult', prompt: '请把以下内容整理成一个 Obsidian 概念卡：\n\n输出结构：\n## 定义\n## 背景\n## 例子\n## 容易误解的点\n## 关联概念\n\n页面：{title}\n来源：{url}\n选中文本：\n{text}\n\n{context}', enabled: true, aiEnabled: true },
      { id: 'quote', label: '金句', action: 'showResult', prompt: '请把以下选中文本整理成"金句/洞察卡片"：\n\n输出结构：\n> 原句\n\n## 这句话的含义\n## 为什么重要\n## 我可以怎么用\n## 关键词\n\n选中文本：\n{text}\n\n{context}', enabled: true, aiEnabled: true },
      { id: 'question', label: '问题', action: 'showResult', prompt: '请把以下内容转成后续可探索的问题：\n\n输出结构：\n## 核心问题\n## 可能答案\n## 还需要查什么\n## 适合放入 Obsidian 的追问\n\n页面：{title}\n来源：{url}\n选中文本：\n{text}\n\n{context}', enabled: true, aiEnabled: true },
      { id: 'copy', label: '复制', action: 'copy', prompt: '{text}', enabled: true, aiEnabled: false },
      { id: 'open-sidepanel', label: '侧边栏', action: 'openSidepanel', prompt: '{text}', enabled: true, aiEnabled: false },
    ];
  }

  // ═══════════════════════════════════════════════════════════════
  // Shadow DOM Initialization
  // ═══════════════════════════════════════════════════════════════

  function ensureHost(): void {
    if (host && shadow) return;

    // Remove old toolbar host if exists
    const existing = document.getElementById('__fs_toolbar_host');
    if (existing) existing.remove();

    host = document.createElement('div');
    host.id = '__fs_toolbar_host';
    shadow = host.attachShadow({ mode: 'open' });

    // Inject styles
    const style = document.createElement('style');
    style.textContent = TOOLBAR_CSS;
    shadow.appendChild(style);

    document.body.appendChild(host);

    // 动态检测页面暗色（覆盖 prefers-color-scheme，适配飞书/Notion 暗色页面）
    applyTheme();
  }

  // ═══════════════════════════════════════════════════════════════
  // DOM Building
  // ═══════════════════════════════════════════════════════════════

  function buildCapsuleHTML(): string {
    const buttons: string[] = [];
    const visible = new Set(toolbarConfig.visibleActions);
    const enabledScenes = knowledgeScenes.filter((scene) => scene.enabled && visible.has(scene.id));
    const sceneById = new Map(enabledScenes.map((scene) => [scene.id, scene]));

    for (const id of MAIN_SCENE_IDS) {
      const scene = sceneById.get(id);
      if (!scene) continue;
      const primary = scene.action === toolbarConfig.defaultAction ? ' primary' : '';
      const aiCls = scene.aiEnabled ? ' ai-btn' : '';
      const aiWarn = !geminiSessionAlive && scene.aiEnabled ? ' session-warn' : '';
      buttons.push(`<button data-action="${escapeAttr(scene.id)}" title="${escapeAttr(scene.label)}" class="text${primary}${aiCls}${aiWarn}">${ICONS[scene.id] || ''}<span>${escapeHtml(scene.label)}</span></button>`);
    }

    const moreScenes = MORE_SCENE_IDS.map((id) => sceneById.get(id)).filter((scene): scene is KnowledgeScene => Boolean(scene));
    if (moreScenes.length > 0) {
      const menu = moreOpen
        ? `<div class="more-menu">${moreScenes.map((scene) => {
            const aiCls = scene.aiEnabled ? ' ai-btn' : '';
            const aiWarn = !geminiSessionAlive && scene.aiEnabled ? ' session-warn' : '';
            return `<button data-action="${escapeAttr(scene.id)}" title="${escapeAttr(scene.label)}" class="text${aiCls}${aiWarn}">${ICONS[scene.id] || ''}<span>${escapeHtml(scene.label)}</span></button>`;
          }).join('')}</div>`
        : '';
      buttons.push(`<span class="more-wrap"><button data-action="more" title="更多">${ICONS.more}</button>${menu}</span>`);
    }

    // Feishu sync (only on feishu pages)
    if (isFeishuDocPage()) {
      buttons.push('<span class="divider"></span>');
      buttons.push(
        `<button data-action="feishu-sync" title="飞书文档同步" class="text">${ICONS['feishu-sync']}<span>同步</span></button>`,
      );
    }

    return `<div class="capsule">${buttons.join('')}<span class="toast" hidden></span></div>`;
  }

  // ═══════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════
  // Stage-based Render (变形过渡架构)
  // ═══════════════════════════════════════════════════════════════

  function ensureStage(): void {
    if (!shadow) return;
    if (shadow.querySelector('.toolbar-stage')) return;
    shadow.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = TOOLBAR_CSS;
    shadow.appendChild(style);
    const stage = document.createElement('div');
    stage.className = 'toolbar-stage';
    stage.innerHTML = `
      <div class="capsule"></div>
      <div class="result-panel">
        <header class="result-header">
          <span class="result-title"></span>
          <button class="result-close" type="button" aria-label="关闭">×</button>
        </header>
        <div class="result-body">
          <div class="result-content"></div>
        </div>
      </div>`;
    shadow.appendChild(stage);
    stage.querySelector('.result-close')?.addEventListener('click', () => collapseResult());
    // 首次打开 toast 也放在 stage 下
  }

  function renderCapsule(): void {
    if (!shadow) return;
    ensureStage();
    const capsule = shadow.querySelector('.capsule')!;
    // 清除面板展开状态
    capsule.classList.remove('shrinking');
    const panel = shadow.querySelector('.result-panel')!;
    panel.classList.remove('expanded');
    panel.classList.add('collapsing');
    // 入场上弹动画
    capsule.classList.add('entering');
    capsule.addEventListener('animationend', () => capsule.classList.remove('entering'), { once: true });
    // 等 collapse 动画走完再清空面板内容
    setTimeout(() => {
      panel.classList.remove('collapsing');
      const rc = panel.querySelector('.result-content')!;
      rc.innerHTML = '';
    }, 280);
    // 刷新胶囊按钮
    capsule.innerHTML = buildCapsuleHTML();
  }

  function expandToResult(title: string, content: string, isHtml = false): void {
    if (!shadow) return;
    ensureStage();
    const capsule = shadow.querySelector('.capsule')!;
    const panel = shadow.querySelector('.result-panel')! as HTMLElement;
    const titleEl = panel.querySelector('.result-title')!;
    const contentEl = panel.querySelector('.result-content')!;

    // 1. 胶囊收缩
    capsule.classList.add('shrinking');

    // 2. 填充内容
    titleEl.textContent = title;
    contentEl.classList.remove('crossfading');
    contentEl.innerHTML = isHtml ? content : escapeHtml(content);

    // 3. 展开面板（移除 collapsing，触发 expand）
    panel.classList.remove('collapsing');
    void panel.offsetHeight; // force reflow
    panel.classList.add('expanded');
  }

  function updateResultContent(content: string, isHtml = false): void {
    if (!shadow) return;
    const contentEl = shadow.querySelector('.result-content')!;
    contentEl.classList.add('crossfading');
    setTimeout(() => {
      contentEl.innerHTML = isHtml ? content : escapeHtml(content);
      contentEl.classList.remove('crossfading');
    }, 180);
  }

  function collapseResult(): void {
    if (!shadow) return;
    aiRequestInFlight = false;
    state = reduceToolbarState(state, { type: 'CLOSE' });
    const capsule = shadow.querySelector('.capsule')!;
    const panel = shadow.querySelector('.result-panel')!;
    panel.classList.remove('expanded');
    panel.classList.add('collapsing');
    capsule.classList.remove('shrinking');
    setTimeout(() => {
      panel.classList.remove('collapsing');
      const rc = panel.querySelector('.result-content')!;
      rc.innerHTML = '';
      state = reduceToolbarState(state, { type: 'SHOW_CAPSULE' });
      renderCapsule();
    }, 300);
  }

  // ═══════════════════════════════════════════════════════════════
  // Page Theme Detection (动态暗色检测)
  // ═══════════════════════════════════════════════════════════════

  function detectPageDarkness(): boolean {
    try {
      const bg = window.getComputedStyle(document.body).backgroundColor;
      const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!m) return false;
      const r = parseInt(m[1], 10);
      const g = parseInt(m[2], 10);
      const b = parseInt(m[3], 10);
      // W3C 相对亮度（简化）
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.4;
    } catch {
      return false;
    }
  }

  function applyTheme(): void {
    if (!host) return;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const pageDark = detectPageDarkness();
    const isDark = prefersDark || pageDark;
    host.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  // ═══════════════════════════════════════════════════════════════
  // Streaming AI Result (流式输出 + 错误卡片)
  // ═══════════════════════════════════════════════════════════════

  function appendStreamChunk(chunk: string, requestId: string): void {
    const nextState = reduceToolbarState(state, { type: 'CHUNK', requestId, chunk });
    if (nextState === state) return;
    state = nextState;
    if (!shadow) return;
    const wrapper = shadow.querySelector('.result-content');
    if (!wrapper) return;
    let streamEl = wrapper.querySelector('.result-content.streaming');
    if (!streamChunkReceived) {
      // 首个 chunk：把 spinner 替换为 streaming 容器
      streamChunkReceived = true;
      if (streamProgressTimer) {
        clearTimeout(streamProgressTimer);
        streamProgressTimer = null;
      }
      wrapper.innerHTML = '<div class="result-content streaming"></div>';
      streamEl = wrapper.querySelector('.result-content.streaming');
    }
    if (streamEl) streamEl.textContent += chunk;
  }

  function renderSimpleMarkdown(text: string): string {
    // 先转义 HTML 实体（防 XSS）
    let html = escapeHtml(text);
    // 代码块 ```
    html = html.replace(/```([\s\S]*?)```/g, (_m, code) =>
      `<pre style="background:var(--kf-bg-hover);padding:8px;border-radius:6px;overflow-x:auto;font-size:12px;margin:6px 0;"><code>${code}</code></pre>`);
    // 行内代码 `xxx`
    html = html.replace(/`([^`\n]+)`/g,
      '<code style="background:var(--kf-bg-hover);padding:1px 4px;border-radius:3px;font-size:12px;">$1</code>');
    // 粗体 **xxx**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // 无序列表 - xxx
    html = html.replace(/(?:^|\n)- (.+)/g, (_m, item) => `\n<li>${item}</li>`);
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
    // 换行
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  function finalizeStreamResult(fullText: string, requestId: string): void {
    if (requestId !== state.requestId || (state.phase !== 'loading' && state.phase !== 'streaming')) return;
    if (!shadow) return;
    aiRequestInFlight = false;
    const wrapper = shadow.querySelector('.result-content');
    if (!wrapper) return;
    const streamEl = wrapper.querySelector('.result-content.streaming');
    const text = fullText || state.content || streamEl?.textContent || '';
    if (!text.trim()) {
      // 空结果 → 错误卡片
      showStreamErrorCard({ errorType: 'EMPTY_RESULT', message: 'AI 未返回内容', provider: '' }, requestId);
      return;
    }
    state = reduceToolbarState(state, { type: 'DONE', requestId, text });
    // 渲染 Markdown，移除 streaming class（光标消失）
    wrapper.innerHTML = `<div class="result-content">${renderSimpleMarkdown(text)}</div>`;
  }

  function showStreamErrorCard(errorInfo: AiErrorResponse, requestId: string): void {
    const nextState = reduceToolbarState(state, { type: 'FAIL', requestId, error: errorInfo.message });
    if (nextState === state) return;
    state = nextState;
    if (!shadow) return;
    aiRequestInFlight = false;
    if (streamProgressTimer) {
      clearTimeout(streamProgressTimer);
      streamProgressTimer = null;
    }
    const html = buildErrorCard(errorInfo);
    updateResultContent(html, true);
    // 等交叉淡入完成后绑定按钮
    setTimeout(() => {
      if (!shadow) return;
      const card = shadow.querySelector('.ai-error-card');
      if (card) bindErrorCardActions(card as HTMLElement, errorInfo);
    }, 220);
  }

  function buildErrorCard(errorInfo: AiErrorResponse): string {
    const configs: Record<AiErrorType, ErrorCardConfig> = {
      TIMEOUT: {
        icon: '⏱',
        title: 'AI 响应超时',
        desc: 'AI 处理时间过长，可能是网络或服务繁忙',
        actions: [
          { label: '重试', action: 'retry', primary: true },
          { label: '切换模型', action: 'switch-model', primary: false },
        ],
      },
      CONNECTION_ERROR: {
        icon: '📡',
        title: '网络连接失败',
        desc: '无法连接到 AI 服务，请检查网络',
        actions: [
          { label: '重试', action: 'retry', primary: true },
        ],
      },
      CONTENT_TOO_LONG: {
        icon: '📄',
        title: '内容过长',
        desc: '选中文本超过 5000 字，AI 难以一次性处理',
        actions: [
          { label: '截取前 2000 字重试', action: 'retry-trimmed', primary: true },
        ],
      },
      QUOTA_EXHAUSTED: {
        icon: '💎',
        title: 'AI 额度用尽',
        desc: '当前模型额度已用完，可切换模型或稍后再试',
        actions: [
          { label: '打开设置', action: 'open-settings', primary: true },
        ],
      },
      EMPTY_RESULT: {
        icon: '🤔',
        title: 'AI 返回空内容',
        desc: 'AI 未给出有效回答，可重试或换个问法',
        actions: [
          { label: '重试', action: 'retry', primary: true },
          { label: '换个问法', action: 'rephrase', primary: false },
        ],
      },
      SESSION_EXPIRED: {
        icon: '🔑',
        title: '登录会话失效',
        desc: `${errorInfo.provider || 'AI'} 登录已过期，请重新登录`,
        actions: [
          { label: `打开 ${errorInfo.provider || 'AI'} 网页登录`, action: 'open-login', primary: true },
        ],
      },
      UNKNOWN: {
        icon: '⚠️',
        title: 'AI 出错了',
        desc: `未预期的错误：${escapeHtml(errorInfo.message)}`,
        actions: [
          { label: '重试', action: 'retry', primary: true },
          { label: '复制错误信息', action: 'copy-error', primary: false },
        ],
      },
    };
    const cfg = configs[errorInfo.errorType] || configs.UNKNOWN;
    const actionsHtml = cfg.actions.map((a) =>
      `<button class="error-btn${a.primary ? ' primary' : ''}" data-error-action="${a.action}">${escapeHtml(a.label)}</button>`,
    ).join('');
    return `<div class="ai-error-card">
      <div class="error-icon">${cfg.icon}</div>
      <div class="error-title">${escapeHtml(cfg.title)}</div>
      <div class="error-desc">${cfg.desc}</div>
      <div class="error-actions">${actionsHtml}</div>
    </div>`;
  }

  function bindErrorCardActions(cardEl: HTMLElement, errorInfo: AiErrorResponse): void {
    const btns = cardEl.querySelectorAll<HTMLButtonElement>('.error-btn');
    btns.forEach((btn) => {
      const act = btn.dataset.errorAction;
      if (!act) return;
      btn.addEventListener('click', () => {
        handleErrorAction(act, errorInfo, btn, cardEl);
      });
    });
  }

  function handleErrorAction(
    act: string,
    errorInfo: AiErrorResponse,
    btn: HTMLButtonElement,
    cardEl: HTMLElement,
  ): void {
    switch (act) {
      case 'retry':
        if (!startRetryCountdown(cardEl)) break;
        restartStreamRequest(lastStreamPrompt);
        break;
      case 'retry-trimmed': {
        if (!startRetryCountdown(cardEl)) break;
        const trimmed = lastSelection.slice(0, 2000);
        const prompt = fillPrompt(lastStreamScenePromptTemplate, trimmed);
        restartStreamRequest(prompt);
        break;
      }
      case 'rephrase': {
        if (!startRetryCountdown(cardEl)) break;
        const rephrased = '请用更简洁的方式回答：\n\n' + lastStreamPrompt;
        restartStreamRequest(rephrased);
        break;
      }
      case 'switch-model':
      case 'open-settings':
        try { chrome.runtime.sendMessage({ type: 'open-settings' }); } catch { /* noop */ }
        break;
      case 'open-login': {
        const provider = errorInfo.provider || '';
        const url = provider.toLowerCase().includes('deepseek')
          ? 'https://chat.deepseek.com'
          : 'https://gemini.google.com';
        window.open(url, '_blank');
        break;
      }
      case 'copy-error':
        navigator.clipboard.writeText(errorInfo.message).then(() => {
          const orig = btn.textContent;
          btn.textContent = '已复制 ✓';
          setTimeout(() => { btn.textContent = orig; }, 1500);
        }).catch(() => { /* noop */ });
        break;
      default:
        break;
    }
  }

  /** 启动 3 秒重试倒计时。返回 false 表示已在倒计时中（忽略本次点击）。*/
  function startRetryCountdown(cardEl: HTMLElement): boolean {
    const now = Date.now();
    if (now < retryAvailableAt) return false;
    retryAvailableAt = now + 3000;
    const btns = cardEl.querySelectorAll<HTMLButtonElement>(
      '.error-btn[data-error-action="retry"], .error-btn[data-error-action="retry-trimmed"], .error-btn[data-error-action="rephrase"]',
    );
    let remaining = 3;
    btns.forEach((b) => {
      b.disabled = true;
      b.classList.add('countdown');
      b.setAttribute('data-countdown', String(remaining));
    });
    const timer = window.setInterval(() => {
      remaining -= 1;
      btns.forEach((b) => b.setAttribute('data-countdown', String(Math.max(remaining, 0))));
      if (remaining <= 0) {
        window.clearInterval(timer);
        retryAvailableAt = 0;
        btns.forEach((b) => {
          b.disabled = false;
          b.classList.remove('countdown');
          b.removeAttribute('data-countdown');
        });
      }
    }, 1000);
    return true;
  }

  /** 重新发起流式 AI 请求（用于错误卡片重试/截取/换问法）。*/
  function restartStreamRequest(prompt: string): void {
    if (!shadow) return;
    const requestId = crypto.randomUUID();
    state = reduceToolbarState(state, { type: 'START', requestId });
    aiRequestInFlight = true;
    streamChunkReceived = false;
    lastStreamPrompt = prompt;
    expandToResult(resultTitle, '<div class="ai-progress"><span class="ai-spinner"></span> 正在连接 AI...</div>', true);
    streamProgressTimer = window.setTimeout(() => {
      if (shadow && !streamChunkReceived) {
        updateResultContent('<div class="ai-progress"><span class="ai-spinner"></span> 正在分析内容...</div>', true);
      }
    }, 1500);
    try {
      chrome.runtime.sendMessage({
        type: 'ai-inline-stream',
        payload: {
          requestId,
          action: 'ai-chat',
          prompt,
          text: lastSelection.trim(),
          title: document.title,
          url: window.location.href,
        },
      });
    } catch {
      aiRequestInFlight = false;
      updateResultContent('<div class="ai-error">扩展连接已失效，请刷新网页后重试。</div>', true);
    }
  }

  function clearShadow(): void {
    if (!shadow) return;
    shadow.innerHTML = '';
  }

  // ═══════════════════════════════════════════════════════════════
  // Positioning
  // ═══════════════════════════════════════════════════════════════

  function positionAt(x: number, y: number): void {
    if (!host) return;
    // Get current dimensions
    const rect = host.getBoundingClientRect();
    const elWidth = rect.width || 200;
    const elHeight = rect.height || 40;

    // Horizontal: center on selection, clamp to viewport (8px padding)
    const left = Math.min(
      Math.max(x - elWidth / 2, 8),
      window.innerWidth - elWidth - 8,
    );

    // Vertical: prefer above selection, fallback below if < 8px space above
    const top =
      y - elHeight - 8 > 8
        ? y - elHeight - 8
        : y + 20;

    host.style.left = left + 'px';
    host.style.top = top + 'px';
    host.style.display = 'block';
  }

  // ═══════════════════════════════════════════════════════════════
  // State Transitions
  // ═══════════════════════════════════════════════════════════════

  function showCapsule(): void {
    if (!toolbarConfig.enabled) return;
    ensureHost();
    renderCapsule();
    state = reduceToolbarState(state, { type: 'SHOW_CAPSULE' });
    bindCapsuleEvents();
  }

  function hideToolbar(): void {
    state = reduceToolbarState(state, { type: 'CLOSE' });
    // 如果结果面板展开中，先收起面板再隐藏
    const panel = shadow?.querySelector('.result-panel');
    if (panel?.classList.contains('expanded')) {
      collapseResult();
      // 面板收起后隐藏整个 host
      setTimeout(() => {
        clearShadow();
        if (host) host.style.display = 'none';
        state = reduceToolbarState(state, { type: 'RESET' });
      }, 350);
      return;
    }
    // 普通状态：加退场动画后隐藏
    const capsule = shadow?.querySelector<HTMLElement>('.capsule');
    if (capsule) {
      capsule.style.transition = 'opacity 150ms cubic-bezier(0.16, 1, 0.3, 1), transform 150ms cubic-bezier(0.16, 1, 0.3, 1)';
      capsule.style.opacity = '0';
      capsule.style.transform = 'scale(0.92) translateY(6px)';
      setTimeout(() => {
        clearShadow();
        if (host) host.style.display = 'none';
        state = reduceToolbarState(state, { type: 'RESET' });
      }, 150);
      return;
    }
    clearShadow();
    if (host) host.style.display = 'none';
    state = reduceToolbarState(state, { type: 'RESET' });
  }

  // ═══════════════════════════════════════════════════════════════
  // Event Binding (inside Shadow DOM)
  // ═══════════════════════════════════════════════════════════════

  function bindCapsuleEvents(): void {
    if (!shadow) return;

    // Click delegation on capsule
    const capsule = shadow.querySelector('.capsule');
    if (!capsule) return;

    capsule.addEventListener('click', (e: Event) => {
      const btn = (e.target as HTMLElement).closest(
        'button',
      ) as HTMLButtonElement | null;
      if (!btn) return;
      const action = btn.dataset.action as Action | undefined;
      if (action) handleCapsuleAction(action, btn);
    });

    // Prevent mousedown from clearing selection
    capsule.addEventListener('mousedown', (e: Event) =>
      e.preventDefault(),
    );
  }

  function showToast(message: string): void {
    if (!shadow) return;
    const toast = shadow.querySelector<HTMLElement>('.toast');
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    setTimeout(() => {
      if (toast) toast.hidden = true;
    }, 1600);
  }

  // ═══════════════════════════════════════════════════════════════
  // Action Handler
  // ═══════════════════════════════════════════════════════════════

  async function handleCapsuleAction(
    action: Action,
    btn: HTMLButtonElement,
  ): Promise<void> {
    const text = lastSelection.trim();
    const domain = window.location.hostname;
    if (action === 'more') {
      moreOpen = !moreOpen;
      renderCapsule();
      bindCapsuleEvents();
      return;
    }

    const scene = knowledgeScenes.find((item) => item.id === action);

    if (scene?.action === 'copy') {
        if (text) {
          try {
            await navigator.clipboard.writeText(text);
            // Flash checkmark
            const originalHTML = btn.innerHTML;
            btn.innerHTML = iconSVG(
              '<polyline points="3 8l3 3 7-7"/>',
            );
            btn.classList.add('copied');
            setTimeout(() => {
              btn.innerHTML = originalHTML;
              btn.classList.remove('copied');
            }, 1200);
          } catch {
            // Clipboard write failed silently
          }
        }
        showToast('已复制');
        hideToolbar();
        return;
    }

    if (scene?.action === 'showResult') {
        if (!text) return;
        if (aiRequestInFlight) return;  // 防重复点击
        aiRequestInFlight = true;
        const requestId = crypto.randomUUID();
        state = reduceToolbarState(state, { type: 'START', requestId });
        resultTitle = scene.label;

        // 1. 按钮涟漪反馈
        btn.classList.add('ripple');
        setTimeout(() => btn.classList.remove('ripple'), 300);

        // 2. 胶囊变形 → 结果面板展开（带进度信息）
        expandToResult(resultTitle, '<div class="ai-progress"><span class="ai-spinner"></span> 正在连接 AI...</div>', true);

        // 3. 1.5s 后更新进度（若仍未收到首个 chunk）
        streamProgressTimer = window.setTimeout(() => {
          if (shadow && !streamChunkReceived) {
            updateResultContent('<div class="ai-progress"><span class="ai-spinner"></span> 正在分析内容...</div>', true);
          }
        }, 1500);

        const scenePrompt = fillPrompt(scene.prompt, text);
        lastStreamPrompt = scenePrompt;
        lastStreamScenePromptTemplate = scene.prompt;
        streamChunkReceived = false;

        // 4. 流式 AI 调用（ai-inline-stream；结果通过 ai-stream-* 消息推送）
        try {
          chrome.runtime.sendMessage({
            type: 'ai-inline-stream',
            payload: {
              requestId,
              action: scene.id,
              prompt: scenePrompt,
              text,
              title: document.title,
              url: window.location.href,
            },
          });
        } catch {
          aiRequestInFlight = false;
          if (streamProgressTimer) { clearTimeout(streamProgressTimer); streamProgressTimer = null; }
          updateResultContent('<div class="ai-error">扩展连接已失效，请刷新网页后重试。</div>', true);
        }
        return;
    }

    if (scene && ['save', 'append', 'refine', 'openSidepanel'].includes(scene.action)) {
        hideToolbar();
        const metadata = getPageMetadata();
        const docToken = extractDocToken();
        try {
          chrome.runtime.sendMessage({
            type: 'clip-to-obsidian',
            payload: {
              text,
              title: metadata.title,
              url: metadata.url,
              description: metadata.description,
              favicon: metadata.favicon,
              docToken,
              domain,
              sceneId: scene.id,
              sceneLabel: scene.label,
              sceneAction: scene.action,
              prompt: fillPrompt(scene.prompt, text),
              defaultDir: scene.defaultDir || '',
              appendPath: scene.defaultAppendPath || toolbarConfig.defaultAppendPath || '',
              aiEnabled: scene.aiEnabled || (scene.action === 'save' && toolbarConfig.aiBeforeSave),
              openMode: scene.action === 'save' ? toolbarConfig.saveBehavior : 'confirmInSidepanel',
            },
          });
        } catch {
          // Extension context may be invalid
        }
        return;
    }

    switch (action) {
      case 'feishu-sync': {
        hideToolbar();
        const docToken = extractDocToken();
        try {
          chrome.runtime.sendMessage({
            type: 'feishu-sync-trigger',
            payload: {
              ...getPageMetadata(),
              docToken,
              domain,
            },
          });
        } catch {
          // Extension context may be invalid
        }
        break;
      }

      default:
        break;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // HTML Escape
  // ═══════════════════════════════════════════════════════════════

  function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char: string) => {
      const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      };
      return map[char];
    });
  }

  function escapeAttr(value: string): string {
    return escapeHtml(value);
  }

  // ═══════════════════════════════════════════════════════════════
  // SPA Route Change Detection
  // ═══════════════════════════════════════════════════════════════

  function checkRouteChange(): void {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      // Destroy and rebuild on route change
      if (host) {
        host.remove();
        host = null;
        shadow = null;
      }
      state = reduceToolbarState(state, { type: 'RESET' });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Global Event Listeners
  // ═══════════════════════════════════════════════════════════════

  function setupGlobalListeners(): void {
    // Mouseup: detect text selection (150ms debounce 防误触)
    document.addEventListener('mouseup', () => {
      if (selectionDebounceTimer) clearTimeout(selectionDebounceTimer);
      selectionDebounceTimer = window.setTimeout(() => {
        checkRouteChange();
        const sel = window.getSelection();
        const text = sel?.toString().trim();

        if (!text || text.length < 3) {
          hideToolbar();
          return;
        }

        lastSelection = text;
        // Store range for potential replacement later
        if (sel && sel.rangeCount > 0) {
        }

        const range = sel!.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const topY = rect.top;

        // Show capsule at position
        ensureHost();
        showCapsule();
        positionAt(centerX, topY);
      }, SELECTION_DEBOUNCE_MS);
    });

    // Mousedown: hide if clicking outside toolbar
    document.addEventListener('mousedown', (e: Event) => {
      if (state.phase === 'idle') return;
      if (host && !host.contains(e.target as Node)) {
        hideToolbar();
      }
    });

    // Keydown: Escape hides
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.phase !== 'idle') {
        hideToolbar();
      }
    });

    // Scroll: hide
    window.addEventListener(
      'scroll',
      () => {
        if (state.phase !== 'idle') hideToolbar();
      },
      { passive: true, capture: true },
    );

    // SPA route change
    window.addEventListener('popstate', checkRouteChange);
    window.addEventListener('hashchange', checkRouteChange);
  }

  // ═══════════════════════════════════════════════════════════════
  // Init
  // ═══════════════════════════════════════════════════════════════

  function init(): void {
    loadToolbarSettings();
    setupGlobalListeners();
    chrome.storage?.onChanged?.addListener((changes, areaName) => {
      if (areaName !== 'sync') return;
      if (changes.contextScenes || changes.selectionToolbarConfig) loadToolbarSettings();
    });

    // 监听工具栏开关（来自 popup 的 toggle 消息）+ 流式 AI 推送
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'toolbar-toggle') {
        if (message.payload.enabled === false) {
          hideToolbar();
          // 移除 host 以完全禁用
          if (host) {
            host.remove();
            host = null;
            shadow = null;
          }
        }
        sendResponse({ ok: true });
      }
      // Gemini session 状态更新
      if (message.type === 'gemini-session-status') {
        geminiSessionAlive = message.payload?.alive !== false;
        if (state.phase === 'capsule') {
          renderCapsule();
          bindCapsuleEvents();
        }
      }
      // ═══ 流式 AI 消息处理（background → toolbar）═══
      if (message.type === 'ai-stream-chunk') {
        appendStreamChunk(message.payload?.chunk || '', message.payload?.requestId || '');
      } else if (message.type === 'ai-stream-done') {
        finalizeStreamResult(message.payload?.text || '', message.payload?.requestId || '');
      } else if (message.type === 'ai-stream-error') {
        const info: AiErrorResponse = message.payload || { errorType: 'UNKNOWN', message: '未知错误', provider: '' };
        showStreamErrorCard(info, message.payload?.requestId || '');
      }
      return true;
    });
  }

  init();
})();
