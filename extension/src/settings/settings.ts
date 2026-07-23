import {
  DEFAULT_INTERPRETER_CONFIG,
  DEFAULT_PROPERTY_OPTIONS,
  DEFAULT_PROPERTY_TEMPLATE,
  loadConfig,
  loadInterpreterConfig,
  loadPropertyOptions,
  loadPropertyTemplate,
  saveConfig,
  saveInterpreterConfig,
  savePropertyOptions,
  savePropertyTemplate,
  testConnection,
  type InterpreterConfig,
  type PropertyOptionKey,
  type PropertyOptions,
  type PropertyTemplate,
  type SyncConfig,
} from '../client.js';
import {
  AI_CONFIG_STORAGE,
  loadSecretBackedConfig,
  saveSecretBackedConfig,
} from '../storage.js';
import { resolveAiRoute } from '../ai-routing.js';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

const PROPERTY_FIELDS: Array<{ key: keyof PropertyTemplate; label: string; kind: 'text' | 'number' | 'list' }> = [
  { key: '标签', label: '标签', kind: 'text' },
  { key: '编码', label: '编码', kind: 'text' },
  { key: '输入', label: '输入', kind: 'text' },
  { key: '日期', label: '日期', kind: 'text' },
  { key: '日期索引', label: '日期索引', kind: 'list' },
  { key: '关键词', label: '关键词', kind: 'text' },
  { key: '概述', label: '概述', kind: 'text' },
  { key: '评分', label: '评分', kind: 'number' },
  { key: '评分_显示', label: '评分显示', kind: 'text' },
  { key: '索引_知识库', label: '索引_知识库', kind: 'text' },
  { key: '索引_颜色', label: '索引_颜色', kind: 'text' },
  { key: '索引_操作&反馈', label: '索引_操作&反馈', kind: 'text' },
  { key: '索引_块', label: '索引_块', kind: 'list' },
  { key: '索引_风险', label: '索引_风险', kind: 'list' },
];

const OPTION_FIELDS: Array<{ key: PropertyOptionKey; label: string }> = [
  { key: '标签', label: '标签选项' },
  { key: '日期索引', label: '日期索引选项' },
  { key: '评分', label: '评分选项' },
  { key: '评分_显示', label: '评分显示选项' },
  { key: '索引_知识库', label: '知识库索引' },
  { key: '索引_颜色', label: '颜色索引' },
  { key: '索引_操作&反馈', label: '操作反馈索引' },
  { key: '索引_块', label: '块索引' },
  { key: '索引_风险', label: '风险索引' },
];

// ═══════════════════════════════════════════════
// AI 助手配置类型
// ═══════════════════════════════════════════════
type AIProvider = 'gemini-web' | 'gemini-nano' | 'gemini-api' | 'openai' | 'deepseek' | 'deepseek-web' | 'custom';

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  systemPrompt: string;
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
type SelectionToolbarConfig = {
  enabled: boolean;
  defaultAction: 'save' | 'append' | 'refine';
  saveBehavior: 'silent' | 'confirmInSidepanel';
  defaultAppendPath: string;
  aiBeforeSave: boolean;
  visibleActions: string[];
};

const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'gemini-web',
  apiKey: '',
  baseUrl: '',
  model: 'fbb127bbb056c959',
  systemPrompt: '你是飞书同步插件的 AI 助手。你可以帮助用户翻译、总结文档，解答 Obsidian 和飞书同步相关的问题。请用简洁的中文回答。',
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

const DEFAULT_SELECTION_TOOLBAR_CONFIG: SelectionToolbarConfig = {
  enabled: true,
  defaultAction: 'append',
  saveBehavior: 'confirmInSidepanel',
  defaultAppendPath: '',
  aiBeforeSave: false,
  visibleActions: DEFAULT_CONTEXT_SCENES.map((scene) => scene.id),
};

async function init(): Promise<void> {
  const [config, template, options, interpreter] = await Promise.all([
    loadConfig(),
    loadPropertyTemplate(),
    loadPropertyOptions(),
    loadInterpreterConfig(),
  ]);

  renderConfig(config);
  renderPropertyFields(template);
  renderPropertyOptions(options);
  renderInterpreter(interpreter);
  await renderAiConfig();
  await renderContextScenes();
  bindEvents();
  applySectionFromUrl();
  window.addEventListener('popstate', applySectionFromUrl);
}

function bindEvents(): void {
  document.querySelectorAll<HTMLAnchorElement>('[data-section-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const section = link.dataset.sectionLink || 'general';
      history.pushState(null, '', `?section=${encodeURIComponent(section)}`);
      applySectionFromUrl();
    });
  });

  $('save-config-btn').addEventListener('click', async () => {
    const config = readConfig();
    await saveConfig(config);
    showResult('连接设置已保存');
  });

  $('test-btn').addEventListener('click', async () => {
    showResult('正在测试连接...');
    const result = await testConnection(readConfig());
    showResult(result.message, result.ok ? 'success' : 'error');
  });

  $('save-template-btn').addEventListener('click', async () => {
    await Promise.all([
      savePropertyTemplate(readPropertyTemplate()),
      savePropertyOptions(readPropertyOptions()),
    ]);
    showResult('属性模板与下拉选项已保存');
  });

  $('reset-template-btn').addEventListener('click', async () => {
    renderPropertyFields(DEFAULT_PROPERTY_TEMPLATE);
    renderPropertyOptions(DEFAULT_PROPERTY_OPTIONS);
    await Promise.all([
      savePropertyTemplate(DEFAULT_PROPERTY_TEMPLATE),
      savePropertyOptions(DEFAULT_PROPERTY_OPTIONS),
    ]);
    showResult('已恢复导引默认选项');
  });

  $('save-interpreter-btn').addEventListener('click', async () => {
    await saveInterpreterConfig(readInterpreter());
    showResult('AI 解释器设置已保存');
  });

  // ── AI 助手配置 ──
  $('save-ai-config-btn').addEventListener('click', async () => {
    await saveAiConfig(readAiConfig());
    showResult('AI 助手配置已保存');
  });

  $('save-context-scenes-btn').addEventListener('click', async () => {
    await Promise.all([
      saveContextScenes(readContextScenes()),
      saveSelectionToolbarConfig(readSelectionToolbarConfig()),
    ]);
    await rebuildContextMenus();
    showResult('划词剪贴板与 AI 场景已保存');
  });

  $('reset-context-scenes-btn').addEventListener('click', async () => {
    renderSelectionToolbarConfig(DEFAULT_SELECTION_TOOLBAR_CONFIG);
    renderContextSceneRows(DEFAULT_CONTEXT_SCENES);
    await Promise.all([
      saveContextScenes(DEFAULT_CONTEXT_SCENES),
      saveSelectionToolbarConfig(DEFAULT_SELECTION_TOOLBAR_CONFIG),
    ]);
    await rebuildContextMenus();
    showResult('已恢复默认划词剪贴板');
  });

  // Provider 切换时显示/隐藏 Base URL
  $('ai-provider').addEventListener('change', () => {
    const provider = $<HTMLSelectElement>('ai-provider').value as AIProvider;
    const baseUrlGroup = $('ai-base-url-group');
    baseUrlGroup.style.display = (provider === 'openai' || provider === 'deepseek' || provider === 'custom') ? '' : 'none';
    $<HTMLInputElement>('ai-model').value = resolveAiRoute({ provider, model: '' }).model;
  });
}

function renderConfig(config: SyncConfig): void {
  $<HTMLInputElement>('host').value = config.host;
  $<HTMLInputElement>('port').value = String(config.port);
  $<HTMLInputElement>('token').value = config.token;
}

function readConfig(): SyncConfig {
  return {
    host: $<HTMLInputElement>('host').value.trim() || '127.0.0.1',
    port: parseInt($<HTMLInputElement>('port').value, 10) || 4567,
    token: $<HTMLInputElement>('token').value.trim(),
  };
}

function renderPropertyFields(template: PropertyTemplate): void {
  const container = $<HTMLDivElement>('property-fields');
  container.innerHTML = PROPERTY_FIELDS.map(({ key, label, kind }) => `
    <label class="property-row">
      <span class="row-label">${label}</span>
      <input
        type="${kind === 'number' ? 'number' : 'text'}"
        data-property-key="${String(key)}"
        placeholder="${kind === 'list' ? '用逗号或顿号分隔' : ''}"
        value="${escapeAttr(String(template[key] ?? ''))}"
      />
    </label>
  `).join('');
}

function renderPropertyOptions(options: PropertyOptions): void {
  const container = $<HTMLDivElement>('property-options');
  container.innerHTML = OPTION_FIELDS.map(({ key, label }) => `
    <label class="property-row">
      <span class="row-label">${label}</span>
      <input
        type="text"
        data-option-key="${String(key)}"
        placeholder="用逗号或顿号分隔"
        value="${escapeAttr(String(options[key] ?? ''))}"
      />
    </label>
  `).join('');
}

function readPropertyTemplate(): PropertyTemplate {
  const next = { ...DEFAULT_PROPERTY_TEMPLATE };
  for (const input of Array.from(document.querySelectorAll<HTMLInputElement>('[data-property-key]'))) {
    const key = input.dataset.propertyKey as keyof PropertyTemplate;
    next[key] = input.value.trim();
  }
  return next;
}

function readPropertyOptions(): PropertyOptions {
  const next = { ...DEFAULT_PROPERTY_OPTIONS };
  for (const input of Array.from(document.querySelectorAll<HTMLInputElement>('[data-option-key]'))) {
    const key = input.dataset.optionKey as PropertyOptionKey;
    next[key] = input.value.trim();
  }
  return next;
}

function renderInterpreter(config: InterpreterConfig): void {
  $<HTMLInputElement>('interpreter-enabled').checked = config.enabled;
  $<HTMLInputElement>('interpreter-auto-run').checked = config.autoRun;
  $<HTMLInputElement>('interpreter-custom-enabled').checked = config.customProviderEnabled === true;
  $<HTMLInputElement>('interpreter-provider').value = config.provider;
  $<HTMLInputElement>('interpreter-base-url').value = config.baseUrl;
  $<HTMLInputElement>('interpreter-model').value = config.model;
  $<HTMLInputElement>('interpreter-excerpt-chars').value = String(config.excerptChars || DEFAULT_INTERPRETER_CONFIG.excerptChars || 4000);
  $<HTMLInputElement>('interpreter-api-key').value = config.apiKey;
  $<HTMLTextAreaElement>('interpreter-context').value = config.context;
}

function readInterpreter(): InterpreterConfig {
  return {
    ...DEFAULT_INTERPRETER_CONFIG,
    enabled: $<HTMLInputElement>('interpreter-enabled').checked,
    autoRun: $<HTMLInputElement>('interpreter-auto-run').checked,
    customProviderEnabled: $<HTMLInputElement>('interpreter-custom-enabled').checked,
    provider: $<HTMLInputElement>('interpreter-provider').value.trim() || DEFAULT_INTERPRETER_CONFIG.provider,
    baseUrl: $<HTMLInputElement>('interpreter-base-url').value.trim() || DEFAULT_INTERPRETER_CONFIG.baseUrl,
    model: $<HTMLInputElement>('interpreter-model').value.trim() || DEFAULT_INTERPRETER_CONFIG.model,
    excerptChars: clampNumber(parseInt($<HTMLInputElement>('interpreter-excerpt-chars').value, 10), 800, 12000, DEFAULT_INTERPRETER_CONFIG.excerptChars || 4000),
    apiKey: $<HTMLInputElement>('interpreter-api-key').value.trim(),
    context: $<HTMLTextAreaElement>('interpreter-context').value.trim() || DEFAULT_INTERPRETER_CONFIG.context,
  };
}

// ═══════════════════════════════════════════════
// AI 助手配置
// ═══════════════════════════════════════════════
async function loadAiConfig(): Promise<AIConfig> {
  return loadSecretBackedConfig(DEFAULT_AI_CONFIG, AI_CONFIG_STORAGE);
}

async function saveAiConfig(config: AIConfig): Promise<void> {
  await saveSecretBackedConfig(config, AI_CONFIG_STORAGE);
}

async function renderAiConfig(): Promise<void> {
  const config = await loadAiConfig();
  $<HTMLSelectElement>('ai-provider').value = config.provider;
  $<HTMLInputElement>('ai-api-key').value = config.apiKey;
  $<HTMLInputElement>('ai-base-url').value = config.baseUrl;
  $<HTMLInputElement>('ai-model').value = resolveAiRoute(config).model;
  $<HTMLTextAreaElement>('ai-system-prompt').value = config.systemPrompt;

  // 根据 provider 显示/隐藏 Base URL
  const baseUrlGroup = $('ai-base-url-group');
  baseUrlGroup.style.display = (config.provider === 'openai' || config.provider === 'deepseek' || config.provider === 'custom') ? '' : 'none';
}

function readAiConfig(): AIConfig {
  return {
    provider: $<HTMLSelectElement>('ai-provider').value as AIProvider,
    apiKey: $<HTMLInputElement>('ai-api-key').value.trim(),
    baseUrl: $<HTMLInputElement>('ai-base-url').value.trim(),
    model: $<HTMLInputElement>('ai-model').value.trim() || DEFAULT_AI_CONFIG.model,
    systemPrompt: $<HTMLTextAreaElement>('ai-system-prompt').value.trim() || DEFAULT_AI_CONFIG.systemPrompt,
  };
}

async function loadContextScenes(): Promise<ContextScene[]> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['contextScenes'], (result) => {
      resolve(normalizeContextScenes(result.contextScenes));
    });
  });
}

async function saveContextScenes(scenes: ContextScene[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ contextScenes: scenes }, () => resolve());
  });
}

async function renderContextScenes(): Promise<void> {
  const [toolbarConfig, scenes] = await Promise.all([
    loadSelectionToolbarConfig(),
    loadContextScenes(),
  ]);
  renderSelectionToolbarConfig(toolbarConfig);
  renderContextSceneRows(scenes);
}

function renderContextSceneRows(scenes: ContextScene[]): void {
  const container = $<HTMLDivElement>('context-scenes-list');
  container.innerHTML = scenes.map((scene) => `
    <div class="scene-row" data-scene-id="${escapeAttr(scene.id)}" data-scene-action="${escapeAttr(scene.action)}">
      <label class="scene-enabled">
        <input type="checkbox" data-scene-enabled ${scene.enabled ? 'checked' : ''} />
        <span>${escapeHtml(scene.label)}</span>
      </label>
      <input type="text" data-scene-label value="${escapeAttr(scene.label)}" placeholder="场景名称" />
      <label class="mini-field">
        <span>保存方式</span>
        <select data-scene-action-select>
          ${renderActionOptions(scene.action)}
        </select>
      </label>
      <label class="mini-check">
        <input type="checkbox" data-scene-ai-enabled ${scene.aiEnabled ? 'checked' : ''} />
        <span>使用 AI Prompt</span>
      </label>
      <label class="mini-field">
        <span>默认目标目录</span>
        <input type="text" data-scene-default-dir value="${escapeAttr(scene.defaultDir || '')}" placeholder="例如：0️⃣输入" />
      </label>
      <label class="mini-field">
        <span>默认补充文档</span>
        <input type="text" data-scene-default-append-path value="${escapeAttr(scene.defaultAppendPath || '')}" placeholder="例如：2️⃣输出/金句汇总.md" />
      </label>
      <label class="scene-prompt">
        <span>Prompt 模板</span>
        <textarea data-scene-prompt rows="6" placeholder="支持 {text} {title} {url} {domain} {date}">${escapeHtml(scene.prompt)}</textarea>
      </label>
    </div>
  `).join('');
}

function renderActionOptions(selected: KnowledgeSceneAction): string {
  const options: Array<{ value: KnowledgeSceneAction; label: string }> = [
    { value: 'save', label: '新建文档' },
    { value: 'append', label: '补充到已有文档' },
    { value: 'refine', label: 'AI 整理后保存' },
    { value: 'showResult', label: '仅显示 AI 结果' },
    { value: 'copy', label: '复制' },
    { value: 'openSidepanel', label: '打开侧边栏' },
  ];
  return options.map((option) => `<option value="${option.value}" ${option.value === selected ? 'selected' : ''}>${option.label}</option>`).join('');
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

async function loadSelectionToolbarConfig(): Promise<SelectionToolbarConfig> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['selectionToolbarConfig'], (result) => {
      resolve(normalizeSelectionToolbarConfig(result.selectionToolbarConfig));
    });
  });
}

async function saveSelectionToolbarConfig(config: SelectionToolbarConfig): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ selectionToolbarConfig: config }, () => resolve());
  });
}

function normalizeSelectionToolbarConfig(input: unknown): SelectionToolbarConfig {
  if (!input || typeof input !== 'object') return { ...DEFAULT_SELECTION_TOOLBAR_CONFIG };
  const value = input as Partial<SelectionToolbarConfig>;
  return {
    enabled: value.enabled ?? DEFAULT_SELECTION_TOOLBAR_CONFIG.enabled,
    defaultAction: value.defaultAction ?? DEFAULT_SELECTION_TOOLBAR_CONFIG.defaultAction,
    saveBehavior: value.saveBehavior ?? DEFAULT_SELECTION_TOOLBAR_CONFIG.saveBehavior,
    defaultAppendPath: value.defaultAppendPath ?? DEFAULT_SELECTION_TOOLBAR_CONFIG.defaultAppendPath,
    aiBeforeSave: value.aiBeforeSave ?? DEFAULT_SELECTION_TOOLBAR_CONFIG.aiBeforeSave,
    visibleActions: Array.isArray(value.visibleActions) && value.visibleActions.length > 0
      ? value.visibleActions
      : DEFAULT_SELECTION_TOOLBAR_CONFIG.visibleActions,
  };
}

function renderSelectionToolbarConfig(config: SelectionToolbarConfig): void {
  $<HTMLInputElement>('selection-toolbar-enabled').checked = config.enabled;
  $<HTMLSelectElement>('selection-default-action').value = config.defaultAction;
  $<HTMLSelectElement>('selection-save-behavior').value = config.saveBehavior;
  $<HTMLInputElement>('selection-default-append-path').value = config.defaultAppendPath;
  $<HTMLInputElement>('selection-ai-before-save').checked = config.aiBeforeSave;
  const visible = new Set(config.visibleActions);
  document.querySelectorAll<HTMLInputElement>('[data-visible-action]').forEach((input) => {
    input.checked = visible.has(input.dataset.visibleAction || '');
  });
}

function readSelectionToolbarConfig(): SelectionToolbarConfig {
  const visibleActions = Array.from(document.querySelectorAll<HTMLInputElement>('[data-visible-action]'))
    .filter((input) => input.checked)
    .map((input) => input.dataset.visibleAction || '')
    .filter(Boolean);
  return {
    enabled: $<HTMLInputElement>('selection-toolbar-enabled').checked,
    defaultAction: $<HTMLSelectElement>('selection-default-action').value as SelectionToolbarConfig['defaultAction'],
    saveBehavior: $<HTMLSelectElement>('selection-save-behavior').value as SelectionToolbarConfig['saveBehavior'],
    defaultAppendPath: $<HTMLInputElement>('selection-default-append-path').value.trim(),
    aiBeforeSave: $<HTMLInputElement>('selection-ai-before-save').checked,
    visibleActions,
  };
}

function readContextScenes(): ContextScene[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-scene-id]')).map((row) => ({
    id: row.dataset.sceneId || '',
    action: (row.querySelector<HTMLSelectElement>('[data-scene-action-select]')?.value || row.dataset.sceneAction || 'showResult') as KnowledgeSceneAction,
    label: row.querySelector<HTMLInputElement>('[data-scene-label]')?.value.trim() || row.dataset.sceneId || '场景',
    prompt: row.querySelector<HTMLTextAreaElement>('[data-scene-prompt]')?.value.trim() || '{text}',
    enabled: row.querySelector<HTMLInputElement>('[data-scene-enabled]')?.checked ?? true,
    defaultDir: row.querySelector<HTMLInputElement>('[data-scene-default-dir]')?.value.trim() || '',
    defaultAppendPath: row.querySelector<HTMLInputElement>('[data-scene-default-append-path]')?.value.trim() || '',
    aiEnabled: row.querySelector<HTMLInputElement>('[data-scene-ai-enabled]')?.checked ?? true,
  })).filter((scene) => scene.id);
}

async function rebuildContextMenus(): Promise<void> {
  await chrome.runtime.sendMessage({ type: 'REBUILD_CONTEXT_MENUS' }).catch(() => undefined);
}

function clampNumber(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

function showResult(message: string, type: 'success' | 'error' = 'success'): void {
  const el = $<HTMLDivElement>('result');
  el.textContent = message;
  el.className = `result ${type}`;
}

function applySectionFromUrl(): void {
  const sectionId = new URLSearchParams(location.search).get('section') || 'general';
  const activeNav = document.querySelector<HTMLAnchorElement>(`[data-section-link="${CSS.escape(sectionId)}"]`);

  // 切换导航活跃态
  document.querySelectorAll<HTMLAnchorElement>('[data-section-link]').forEach((link) => {
    link.classList.toggle('active', link === activeNav);
  });

  // 仅显示当前 section，隐藏其余
  document.querySelectorAll<HTMLElement>('.section').forEach((section) => {
    section.style.display = section.id === sectionId ? '' : 'none';
  });

  // 更新 hero 标题
  const titles: Record<string, string> = {
    general: '常规',
    template: '属性模板',
    options: '下拉选项',
    interpreter: 'AI 解释器',
    ai: 'AI 助手',
    scenes: '划词场景',
  };
  const h1 = document.querySelector<HTMLHeadingElement>('.hero h1');
  if (h1) h1.textContent = titles[sectionId] || '扩展设置';
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

init();
