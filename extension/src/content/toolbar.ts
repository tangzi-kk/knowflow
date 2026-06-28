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

  type ToolbarState = 'IDLE' | 'CAPSULE';
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

  // ═══════════════════════════════════════════════════════════════
  // Constants (must be declared before state initializers)
  // ═══════════════════════════════════════════════════════════════

  const MAIN_SCENE_IDS = ['save', 'append', 'refine'];
  const MORE_SCENE_IDS = ['translate-explain', 'concept-card', 'quote', 'question', 'copy', 'open-sidepanel'];

  // ═══════════════════════════════════════════════════════════════
  // State
  // ═══════════════════════════════════════════════════════════════

  let state: ToolbarState = 'IDLE';
  let lastSelection = '';
  let host: HTMLDivElement | null = null;
  let shadow: ShadowRoot | null = null;
  let lastPath = window.location.pathname;
  let resultTitle = '';
  let toolbarConfig: SelectionToolbarConfig = getDefaultToolbarConfig();
  let knowledgeScenes: KnowledgeScene[] = getDefaultKnowledgeScenes();
  let moreOpen = false;

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

  function fillPrompt(template: string, text: string): string {
    const metadata = getPageMetadata();
    const date = new Date().toISOString().slice(0, 10);
    return String(template || '{text}')
      .replace(/\{text\}/g, text)
      .replace(/\{title\}/g, metadata.title)
      .replace(/\{url\}/g, metadata.url)
      .replace(/\{domain\}/g, metadata.domain)
      .replace(/\{date\}/g, date);
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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Microsoft YaHei", "Helvetica Neue", sans-serif;
}
.capsule {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 20px;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.08),
    0 0 0 0.5px rgba(0, 0, 0, 0.04);
  user-select: none;
  pointer-events: auto;
  animation: capsule-in 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}
@keyframes capsule-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.capsule button {
  min-width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #444;
  transition: background 0.15s, color 0.15s, transform 0.15s;
  padding: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.capsule button.text {
  width: auto;
  border-radius: 15px;
  padding: 0 10px;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
}
.capsule button:hover {
  background: #f0f0f0;
  color: #07c160;
}
.capsule button:active {
  transform: scale(0.9);
}
.capsule .divider {
  width: 1px;
  height: 18px;
  background: rgba(0, 0, 0, 0.08);
  margin: 0 3px;
  flex-shrink: 0;
}
.capsule button.primary {
  background: #07c160;
  color: #fff;
  border-radius: 16px;
  width: auto;
  padding: 0 12px;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
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
  border-radius: 12px;
  background: rgba(255,255,255,.97);
  box-shadow: 0 10px 28px rgba(0,0,0,.14), 0 0 0 .5px rgba(0,0,0,.08);
}
.more-menu button {
  width: 100%;
  justify-content: flex-start;
  border-radius: 9px;
  padding: 0 8px;
}
.toast {
  margin-left: 6px;
  padding: 6px 8px;
  border-radius: 12px;
  background: #eef8f2;
  color: #058040;
  font-size: 12px;
  white-space: nowrap;
}
.capsule button.primary:hover {
  background: #06ad56;
  color: #fff;
}
.capsule button.copied {
  color: #07c160;
}
.result-window {
  width: min(360px, calc(100vw - 24px));
  max-height: min(360px, calc(100vh - 24px));
  overflow: hidden;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.14), 0 0 0 0.5px rgba(0, 0, 0, 0.08);
  pointer-events: auto;
}
.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  color: #222;
  font-size: 13px;
  font-weight: 600;
}
.result-close {
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #777;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}
.result-close:hover { background: #f0f0f0; color: #111; }
.result-body {
  max-height: 300px;
  overflow: auto;
  padding: 12px;
  color: #222;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
}
@media (prefers-color-scheme: dark) {
  .capsule {
    background: rgba(30, 30, 30, 0.92);
    box-shadow:
      0 2px 12px rgba(0, 0, 0, 0.3),
      0 0 0 0.5px rgba(255, 255, 255, 0.06);
  }
  .capsule button { color: #ccc; }
  .capsule button:hover { background: #333; color: #07c160; }
  .capsule .divider { background: rgba(255, 255, 255, 0.08); }
  .capsule button.primary { background: #07c160; color: #fff; }
  .capsule button.primary:hover { background: #06ad56; color: #fff; }
  .more-menu { background: rgba(30, 30, 30, 0.97); box-shadow: 0 10px 28px rgba(0,0,0,.35), 0 0 0 .5px rgba(255,255,255,.08); }
  .toast { background: #0D2B1A; color: #71D69A; }
  .result-window { background: rgba(30, 30, 30, 0.96); box-shadow: 0 10px 30px rgba(0,0,0,.35), 0 0 0 .5px rgba(255,255,255,.08); }
  .result-header { color: #f2f2f2; border-bottom-color: rgba(255,255,255,.08); }
  .result-close { color: #aaa; }
  .result-close:hover { background: #333; color: #fff; }
  .result-body { color: #eee; }
}
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
      { id: 'translate-explain', label: '译解', action: 'showResult', prompt: '请不要做逐字翻译。请把以下内容转换成我能放入 Obsidian 的“概念理解笔记”：\n\n要求：\n1. 先给自然中文解释。\n2. 保留关键原文术语，并解释它们的含义。\n3. 如果原文有隐含背景，请补出来。\n4. 给一个我能复用的例子。\n5. 最后给 3-5 个关键词。\n\n内容：\n{text}\n\n来源：\n{title}\n{url}', enabled: true, aiEnabled: true },
      { id: 'concept-card', label: '概念卡', action: 'showResult', prompt: '请把以下内容整理成一个 Obsidian 概念卡：\n\n输出结构：\n## 定义\n## 背景\n## 例子\n## 容易误解的点\n## 关联概念\n\n内容：\n{text}', enabled: true, aiEnabled: true },
      { id: 'quote', label: '金句', action: 'showResult', prompt: '请把以下选中文本整理成“金句/洞察卡片”：\n\n输出结构：\n> 原句\n\n## 这句话的含义\n## 为什么重要\n## 我可以怎么用\n## 关键词\n\n内容：\n{text}', enabled: true, aiEnabled: true },
      { id: 'question', label: '问题', action: 'showResult', prompt: '请把以下内容转成后续可探索的问题：\n\n输出结构：\n## 核心问题\n## 可能答案\n## 还需要查什么\n## 适合放入 Obsidian 的追问\n\n内容：\n{text}', enabled: true, aiEnabled: true },
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
      buttons.push(`<button data-action="${escapeAttr(scene.id)}" title="${escapeAttr(scene.label)}" class="text${primary}">${ICONS[scene.id] || ''}<span>${escapeHtml(scene.label)}</span></button>`);
    }

    const moreScenes = MORE_SCENE_IDS.map((id) => sceneById.get(id)).filter((scene): scene is KnowledgeScene => Boolean(scene));
    if (moreScenes.length > 0) {
      const menu = moreOpen
        ? `<div class="more-menu">${moreScenes.map((scene) => `<button data-action="${escapeAttr(scene.id)}" title="${escapeAttr(scene.label)}" class="text">${ICONS[scene.id] || ''}<span>${escapeHtml(scene.label)}</span></button>`).join('')}</div>`
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

  function renderCapsule(): void {
    if (!shadow) return;
    shadow.innerHTML = '';
    // Re-inject styles
    const style = document.createElement('style');
    style.textContent = TOOLBAR_CSS;
    shadow.appendChild(style);
    // Build capsule
    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildCapsuleHTML();
    shadow.appendChild(wrapper.firstElementChild!);
  }

  function renderInlineResult(title: string, content: string): void {
    if (!shadow) return;
    shadow.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = TOOLBAR_CSS;
    shadow.appendChild(style);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <section class="result-window" role="dialog" aria-label="${escapeHtml(title)}">
        <header class="result-header"><span>${escapeHtml(title)}</span><button class="result-close" type="button" aria-label="关闭">×</button></header>
        <div class="result-body">${escapeHtml(content)}</div>
      </section>`;
    shadow.appendChild(wrapper.firstElementChild!);
    shadow.querySelector('.result-close')?.addEventListener('click', hideToolbar);
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

    // Horizontal: center on selection, clamp to viewport
    const left = Math.min(
      Math.max(x - elWidth / 2, 8),
      window.innerWidth - elWidth - 12,
    );

    // Vertical: prefer above selection, fallback below
    const top =
      y - elHeight - 12 > 0
        ? y - elHeight - 12
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
    state = 'CAPSULE';
    bindCapsuleEvents();
  }

  function hideToolbar(): void {
    clearShadow();
    if (host) {
      host.style.display = 'none';
    }
    state = 'IDLE';
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
        resultTitle = scene.label;
        renderInlineResult(resultTitle, '正在生成…');
        try {
          chrome.runtime.sendMessage({
            type: 'ai-inline',
            payload: {
              action: scene.id,
              prompt: fillPrompt(scene.prompt, text),
              text,
              title: document.title,
              url: window.location.href,
            },
          }, (response) => {
            const error = chrome.runtime.lastError?.message;
            renderInlineResult(resultTitle, error || response?.error || response?.text || 'AI 未返回内容');
          });
        } catch {
          renderInlineResult(resultTitle, '扩展连接已失效，请刷新网页后重试。');
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
      state = 'IDLE';
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Global Event Listeners
  // ═══════════════════════════════════════════════════════════════

  function setupGlobalListeners(): void {
    // Mouseup: detect text selection
    document.addEventListener('mouseup', () => {
      setTimeout(() => {
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
      }, 10);
    });

    // Mousedown: hide if clicking outside toolbar
    document.addEventListener('mousedown', (e: Event) => {
      if (state === 'IDLE') return;
      if (host && !host.contains(e.target as Node)) {
        hideToolbar();
      }
    });

    // Keydown: Escape hides
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state !== 'IDLE') {
        hideToolbar();
      }
    });

    // Scroll: hide
    window.addEventListener(
      'scroll',
      () => {
        if (state !== 'IDLE') hideToolbar();
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

    // 监听工具栏开关（来自 popup 的 toggle 消息）
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
      return true;
    });
  }

  init();
})();
