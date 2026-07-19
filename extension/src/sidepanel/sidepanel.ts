import {
  getTree,
  loadConfig,
  loadInterpreterConfig,
  loadPropertyOptions,
  loadPropertyTemplate,
  normalizePropertyOptionValue,
  postExists,
  suggestMetaWithInterpreter,
  testConnection,
  type InterpreterConfig,
  type PropertyOptions,
  type PropertyTemplate,
  type SyncConfig,
} from '../client.js';
import type { ClipResponse, FetchResponse, TreeNode } from '@sync/shared';
import { AI_CONFIG_STORAGE, loadSecretBackedConfig } from '../storage.js';

type StatusType = 'info' | 'success' | 'error';
type MetaValue = string | number | string[];
type SyncMeta = Record<string, MetaValue>;
const DEFAULT_AI_EXCERPT_CHARS = 4000;

async function runPersistedWrite<T extends { path: string; action: string }>(
  kind: 'fetch' | 'clip',
  request: Record<string, unknown>,
): Promise<T> {
  const requestId = crypto.randomUUID();
  const response = await chrome.runtime.sendMessage({
    type: 'knowflow-write',
    payload: { kind, request: { ...request, requestId } },
  });
  if (!response?.ok || !response.result?.path || !response.result?.action) {
    throw new Error(response?.error || 'Obsidian 未返回最终写入结果。');
  }
  return response.result as T;
}

type MetaField = {
  key: keyof PropertyTemplate;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number' | 'grouped';
  help?: string;
};

type TokenInfo = {
  node_token?: string;
  obj_token?: string;
};

type SourceKind = 'feishu-doc' | 'feishu-base' | 'article' | 'selection' | 'generic-page';
type PanelMode = 'feishu-sync' | 'web-clip';

type WebPageSnapshot = {
  title: string;
  url: string;
  description: string;
  selection: string;
  headings: string[];
  tables: string[];
  text: string;
  sourceKind: SourceKind;
};

type WebConversionDraft = {
  meta: Record<string, unknown>;
  bodyMarkdown: string;
  suggestedDir?: string;
};

type PanelState = {
  config: SyncConfig;
  template: PropertyTemplate;
  options: PropertyOptions;
  interpreter: InterpreterConfig;
  mode: PanelMode;
  sourceKind: SourceKind;
  tokenInfo: TokenInfo;
  nodeToken: string;
  title: string;
  source: string;
  dirs: TreeNode[];
  fallbackDir: string;
  pageSnapshot?: WebPageSnapshot;
  webDraft?: WebConversionDraft;
  sceneId?: string;
  sceneLabel?: string;
  sceneAction?: 'save' | 'append' | 'refine' | 'showResult' | 'copy' | 'openSidepanel' | '';
  scenePrompt?: string;
  defaultAppendPath?: string;
  defaultDir?: string;
  aiEnabled?: boolean;
  existingPath?: string;
  treeError?: string;
};

// ═══════════════════════════════════════════════
// AI Provider Types
// ═══════════════════════════════════════════════
type AIProvider = 'gemini-web' | 'gemini-nano' | 'gemini-api' | 'openai' | 'deepseek' | 'deepseek-web' | 'custom';

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  systemPrompt: string;
}

const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'gemini-web',
  apiKey: '',
  baseUrl: '',
  model: '56fdd199312815e2',
  systemPrompt: '你是飞书同步插件的 AI 助手。你可以帮助用户翻译、总结文档，解答 Obsidian 和飞书同步相关的问题。请用简洁的中文回答。',
};

const META_FIELDS: MetaField[] = [
  { key: '标签', label: '标签', type: 'text', help: 'S / X / L / Z / Q / J' },
  { key: '编码', label: '编码', type: 'text' },
  { key: '输入', label: '输入', type: 'text' },
  { key: '日期', label: '日期', type: 'date' },
  { key: '日期索引', label: '日期索引', type: 'text', help: '多个值用逗号或顿号分隔' },
  { key: '关键词', label: '关键词', type: 'textarea' },
  { key: '概述', label: '概述', type: 'textarea', help: '80-160 字，方便以后 AI 快速识别文档内容' },
  { key: '评分', label: '评分', type: 'number' },
  { key: '评分_显示', label: '评分_显示', type: 'text' },
  { key: '索引_知识库', label: '索引_知识库', type: 'text' },
  { key: '索引_颜色', label: '索引_颜色', type: 'text' },
  { key: '索引_操作&反馈', label: '索引_操作&反馈', type: 'grouped', help: '每组最多选一个' },
  { key: '索引_块', label: '索引_块', type: 'grouped', help: '抽象/具象选一个，简单/困难选一个' },
  { key: '索引_风险', label: '索引_风险', type: 'text', help: '多个值用逗号或顿号分隔' },
];
const SELECT_FIELDS = new Set<keyof PropertyTemplate>([
  '标签',
  '评分',
  '评分_显示',
  '索引_知识库',
  '索引_颜色',
]);

const GROUPED_FIELDS: Partial<Record<keyof PropertyTemplate, Array<{ name: string; options: Array<{ label: string; value: string }> }>>> = {
  '索引_操作&反馈': [
    {
      name: '动作状态',
      options: [
        { label: '💡想法', value: '想法' },
        { label: '📋规划', value: '规划' },
        { label: '🚀执行', value: '执行' },
        { label: '🚫受挫', value: '受挫' },
        { label: '💪克服', value: '克服' },
      ],
    },
    {
      name: '产出阶段',
      options: [
        { label: '📝初稿', value: '初稿' },
        { label: '🔍审核', value: '审核' },
        { label: '✏️修改', value: '修改' },
        { label: '✅完成', value: '完成' },
        { label: '📊复盘', value: '复盘' },
      ],
    },
  ],
  索引_块: [
    {
      name: '抽象度',
      options: [
        { label: '💭抽象', value: '抽象' },
        { label: '🎯具象', value: '具象' },
      ],
    },
    {
      name: '难度',
      options: [
        { label: '✅简单', value: '简单' },
        { label: '🚧困难', value: '困难' },
      ],
    },
  ],
};

let state: PanelState | null = null;
let aiConfig: AIConfig = { ...DEFAULT_AI_CONFIG };
let aiMessages: Array<{ role: string; content: string }> = [];
let aiAttachments: Array<{ name: string; dataUrl: string }> = [];
type AiAttachment = { name: string; dataUrl: string };
const RECENT_TARGET_DIR_KEY = 'recentTargetDir';
type DirTreeView = TreeNode & { children: DirTreeView[]; parentPath: string };

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

async function init(): Promise<void> {
  bindEvents();
  setupTabs();
  await loadAiConfig();
  setupAiChat();
  await loadPanel();
}

function bindEvents(): void {
  $('refresh-btn').addEventListener('click', () => {
    loadPanel();
  });
  $('sync-btn').addEventListener('click', () => {
    confirmSync();
  });
  $('suggest-btn').addEventListener('click', () => {
    suggestMeta();
  });

  // 监听目录变更更新步骤指示器
  document.addEventListener('change', (e) => {
    const target = e.target as HTMLElement;
    if (target instanceof HTMLSelectElement && target.name === 'target-dir') {
      if (target.value) updateSteps(2, 'done');
    }
  });
  document.addEventListener('input', (e) => {
    const target = e.target as HTMLElement;
    if (target instanceof HTMLInputElement && target.name === 'target-dir') {
      if (target.value.trim()) updateSteps(2, 'done');
    }
  });
}

async function loadPanel(passedDocToken?: { node_token?: string; obj_token?: string }): Promise<void> {
  setStatus('正在读取当前标签页...', 'info');
  $('sync-btn').setAttribute('disabled', 'true');
  renderLoading();

  const activeTab = await getActiveTab();
  const urlTokenInfo = extractTokenFromUrl(activeTab.url ?? '');
  // 优先使用消息传递中带来的 docToken，降级到 URL 提取
  const tokenInfo = (passedDocToken?.node_token || passedDocToken?.obj_token)
    ? passedDocToken
    : urlTokenInfo;
  const [config, template, options, interpreter] = await Promise.all([
    loadConfig(),
    loadPropertyTemplate(),
    loadPropertyOptions(),
    loadInterpreterConfig(),
  ]);
  const isFeishuDoc = Boolean(activeTab.url && tokenInfo && (tokenInfo.node_token || tokenInfo.obj_token));
  const pageSnapshot = isFeishuDoc ? undefined : await getActivePageSnapshot(activeTab);
  const sourceKind = isFeishuDoc ? 'feishu-doc' : pageSnapshot?.sourceKind ?? detectSourceKind(activeTab.url ?? '', false, '');

  const next: PanelState = {
    config,
    template,
    options,
    interpreter,
    mode: isFeishuDoc ? 'feishu-sync' : 'web-clip',
    sourceKind,
    tokenInfo: tokenInfo ?? {},
    nodeToken: tokenInfo?.node_token || tokenInfo?.obj_token || '',
    title: cleanTitle(pageSnapshot?.title || activeTab.title || (isFeishuDoc ? '未命名飞书文档' : '未命名网页')),
    source: pageSnapshot?.url || activeTab.url || '',
    dirs: [],
    fallbackDir: '',
    pageSnapshot,
  };
  state = next;

  renderPanel(next);

  if (!config.token) {
    setStatus('请先在扩展设置里保存 OB 插件启动令牌。', 'error');
    return;
  }

  if (next.mode === 'feishu-sync') {
    try {
      const exists = await postExists(config, { node_token: next.nodeToken });
      if (exists.exists) {
        next.existingPath = exists.path;
        next.fallbackDir = dirname(exists.path);
      }
    } catch {
      next.existingPath = undefined;
    }
  }

  const recentDir = await loadRecentTargetDir();
  try {
    const tree = await getTree(config);
    next.dirs = tree.dirs;
    next.fallbackDir = resolveTargetDir(next.dirs, next.fallbackDir || recentDir);
  } catch (err) {
    next.treeError = err instanceof Error ? err.message : String(err);
  }

  state = next;
  renderPanel(next);
  $('sync-btn').toggleAttribute('disabled', !next.config.token || (next.mode === 'feishu-sync' && !next.nodeToken));
  $('suggest-btn').toggleAttribute('disabled', !next.interpreter.enabled);
  setStatus(getReadyMessage(next), next.treeError ? 'error' : 'info');
  updateSteps(1, 'done');

  if (next.interpreter.enabled && next.interpreter.autoRun) {
    suggestMeta();
  }
}

async function getActiveTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ?? {};
}

function extractTokenFromUrl(url: string): TokenInfo | null {
  const wikiMatch = url.match(/\/wiki\/([A-Za-z0-9]+)/);
  if (wikiMatch) return { node_token: wikiMatch[1] };
  const docxMatch = url.match(/\/(?:docx|doc)\/([A-Za-z0-9]+)/);
  if (docxMatch) return { obj_token: docxMatch[1] };
  return null;
}

function renderLoading(): void {
  $('doc-summary').innerHTML = `
    <div class="skeleton title"></div>
    <div class="skeleton line"></div>
  `;
  $('directory-control').innerHTML = '';
  $('meta-form').innerHTML = '';
  $('interpreter-note').textContent = '';
}

function renderPanel(next: PanelState): void {
  const modeLabel = next.mode === 'feishu-sync' ? '飞书文档同步' : '网页转 Obsidian';
  $('doc-summary').innerHTML = `
    <div class="summary-title">${escapeHtml(next.title)}</div>
    <span class="summary-existing">${modeLabel} · ${escapeHtml(next.sourceKind)}</span>
    <a class="summary-source" href="${escapeAttr(next.source)}" target="_blank" rel="noreferrer">${escapeHtml(next.source)}</a>
    ${next.existingPath ? `<span class="summary-existing">已同步：${escapeHtml(next.existingPath)}</span>` : ''}
  `;
  const syncBtn = $('sync-btn') as HTMLButtonElement;
  syncBtn.textContent = next.mode === 'feishu-sync'
    ? (next.existingPath ? '更新飞书文档到 Obsidian' : '同步飞书文档')
    : '网页转 Obsidian';
  $('directory-control').innerHTML = '';
  $('directory-control').appendChild(createDirectoryControl(next));
  renderMetaForm(next);
  $('interpreter-note').textContent = getInterpreterSummary(next);
}

function createDirectoryControl(next: PanelState): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'dir-control';

  const hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.name = 'target-dir';
  hidden.value = next.fallbackDir;
  wrapper.appendChild(hidden);

  if (next.mode === 'web-clip') {
    wrapper.appendChild(createAppendControl());
  }

  if (next.dirs.length > 0) {
    const tree = document.createElement('div');
    tree.className = 'dir-tree';
    tree.setAttribute('role', 'tree');
    const roots = buildDirTree(next.dirs);
    const expanded = new Set(getAncestorPaths(next.fallbackDir));
    const renderTree = () => {
      tree.innerHTML = '';
      const appendNode = (dir: DirTreeView) => {
        const hasChildren = dir.children.length > 0;
        const isExpanded = expanded.has(dir.path);
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'dir-tree-item';
        row.dataset.path = dir.path;
        row.style.setProperty('--depth', String(Math.max(0, dir.depth - 1)));
        row.classList.toggle('is-selected', dir.path === next.fallbackDir);
        row.classList.toggle('is-expanded', isExpanded);
        row.innerHTML = `<span class="dir-tree-caret">${hasChildren ? (isExpanded ? '▾' : '▸') : ''}</span><span class="dir-tree-icon">📁</span><span class="dir-tree-label">${escapeHtml(dir.label)}</span>`;
        row.addEventListener('click', (event) => {
          if (hasChildren && (event.offsetX < 28 + Math.max(0, dir.depth - 1) * 16 || dir.path === next.fallbackDir)) {
            if (isExpanded) expanded.delete(dir.path);
            else expanded.add(dir.path);
            renderTree();
            return;
          }
          hidden.value = dir.path;
          next.fallbackDir = dir.path;
          expanded.add(dir.path);
          getAncestorPaths(dir.path).forEach((path) => expanded.add(path));
          updateSteps(2, 'done');
          renderTree();
        });
        tree.appendChild(row);
        if (isExpanded) dir.children.forEach(appendNode);
      };
      roots.forEach(appendNode);
    };
    renderTree();
    wrapper.appendChild(tree);
    return wrapper;
  }

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = '例如：26_0421_L02 提示词';
  input.value = next.fallbackDir;
  input.addEventListener('input', () => {
    hidden.value = input.value.trim();
  });
  wrapper.appendChild(input);
  return wrapper;
}

function renderMetaForm(next: PanelState): void {
  const form = $('meta-form');
  form.innerHTML = '';
  const defaults = getDefaultMeta(next);

  META_FIELDS.forEach((field) => {
    const label = document.createElement('label');
    label.className = 'field';

    const title = document.createElement('span');
    title.className = 'field-label';
    title.textContent = field.label;

    const control = createMetaControl(field, defaults[field.key], next.options[field.key as keyof PropertyOptions]);
    label.append(title, control);

    if (field.help) {
      const help = document.createElement('small');
      help.textContent = field.help;
      label.appendChild(help);
    }

    form.appendChild(label);
  });
}

function createMetaControl(field: MetaField, value: MetaValue, rawOptions?: string): HTMLElement {
  const options = parseOptions(rawOptions);
  const stringValue = Array.isArray(value) ? value.join('、') : String(value ?? '');

  if (field.type === 'grouped') {
    return createGroupedControl(field.key, stringValue);
  }

  if (SELECT_FIELDS.has(field.key) && options.length > 0) {
    const select = document.createElement('select');
    select.dataset.metaKey = field.key;
    appendOption(select, '', '未选择');
    const optionValues = options.map((option) => normalizePropertyOptionValue(String(field.key), option));
    options.forEach((option, index) => appendOption(select, optionValues[index], option));
    const normalizedValue = normalizePropertyOptionValue(String(field.key), stringValue);
    if (normalizedValue && !optionValues.includes(normalizedValue)) appendOption(select, normalizedValue, stringValue);
    select.value = normalizedValue;
    return select;
  }

  if (field.type === 'textarea') {
    const textarea = document.createElement('textarea');
    textarea.dataset.metaKey = field.key;
    textarea.rows = field.key === '概述' ? 4 : field.key === '关键词' ? 3 : 2;
    textarea.value = stringValue;
    return textarea;
  }

  const input = document.createElement('input');
  input.dataset.metaKey = field.key;
  input.type = field.type;
  input.value = stringValue;

  if (field.type === 'number') {
    input.min = '0';
    input.max = '5';
    input.step = '1';
  }

  if (options.length > 0) {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-input';
    const listId = `options-${encodeURIComponent(String(field.key))}`;
    input.setAttribute('list', listId);
    const datalist = document.createElement('datalist');
    datalist.id = listId;
    options.forEach((option) => appendOption(datalist, option, option));
    wrapper.append(input, datalist);
    return wrapper;
  }

  return input;
}

function createAppendControl(): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'append-control';
  wrapper.innerHTML = `
    <label class="append-toggle">
      <input type="checkbox" name="append-mode" />
      <span>补充到已有文档，不新建</span>
    </label>
    <input type="text" name="append-path" placeholder="例如：2️⃣输出/金句汇总.md" disabled />
    <small>适合划词金句、片段素材、同一主题持续补充。填写 vault 内相对路径。</small>
  `;
  const checkbox = wrapper.querySelector<HTMLInputElement>('[name="append-mode"]');
  const input = wrapper.querySelector<HTMLInputElement>('[name="append-path"]');
  checkbox?.addEventListener('change', () => {
    if (!input || !checkbox) return;
    input.disabled = !checkbox.checked;
    if (checkbox.checked) input.focus();
  });
  return wrapper;
}

function getDefaultMeta(next: PanelState): SyncMeta {
  const today = new Date().toISOString().slice(0, 10);
  const keywords = draftKeywords(next.title).join('、');
  const vars: Record<string, string> = {
    title: next.title,
    url: next.source,
    date: today,
    dir: next.fallbackDir,
    keywords,
  };

  return {
    标签: applyTemplate(next.template.标签 || 'S', vars),
    编码: applyTemplate(next.template.编码, vars),
    输入: applyTemplate(next.template.输入 || next.fallbackDir, vars),
    日期: applyTemplate(next.template.日期 || today, vars),
    日期索引: applyTemplate(next.template.日期索引, vars),
    关键词: applyTemplate(next.template.关键词 || keywords, vars),
    概述: applyTemplate(next.template.概述, vars),
    评分: next.template.评分,
    评分_显示: applyTemplate(next.template.评分_显示, vars),
    索引_知识库: applyTemplate(next.template.索引_知识库, vars),
    索引_颜色: applyTemplate(next.template.索引_颜色, vars),
    '索引_操作&反馈': applyTemplate(next.template['索引_操作&反馈'], vars),
    索引_块: applyTemplate(next.template.索引_块, vars),
    索引_风险: applyTemplate(next.template.索引_风险, vars),
  };
}

function applyTemplate(template: string, vars: Record<string, string>): string {
  return String(template ?? '').replace(/\{\{(\w+)\}\}/g, (_full, key: string) => vars[key] ?? '');
}

function collectMeta(): SyncMeta {
  const meta: SyncMeta = {};
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[data-meta-key]').forEach((control) => {
    const key = control.dataset.metaKey;
    if (!key) return;

    if (key === '索引_操作&反馈') {
      meta[key] = splitList(control.value).map((item) => normalizePropertyOptionValue(key, item)).join('、');
      return;
    }

    if (key === '日期索引' || key === '索引_块' || key === '索引_风险') {
      meta[key] = splitList(control.value).map((item) => normalizePropertyOptionValue(key, item));
      return;
    }

    if (key === '评分') {
      const normalized = normalizePropertyOptionValue(key, control.value);
      meta[key] = normalized === '' ? '' : Number(normalized);
      return;
    }

    meta[key] = normalizePropertyOptionValue(key, control.value);
  });
  return meta;
}

async function suggestMeta(): Promise<void> {
  if (!state) return;
  const button = $('suggest-btn') as HTMLButtonElement;
  const dirControl = document.querySelector<HTMLInputElement | HTMLSelectElement>('[name="target-dir"]');
  const dir = dirControl?.value.trim() || state.fallbackDir;

  button.disabled = true;
  setStatus('正在读取正文前段并生成 AI 标签与索引建议...', 'info');
  try {
    const excerpt = state.mode === 'web-clip' && state.pageSnapshot
      ? buildSnapshotExcerpt(state.pageSnapshot, state.interpreter.excerptChars || DEFAULT_AI_EXCERPT_CHARS)
      : await getActiveTabExcerpt(state.interpreter.excerptChars || DEFAULT_AI_EXCERPT_CHARS);
    const input = {
      title: state.title,
      source: state.source,
      dir,
      excerpt,
      template: state.template,
      options: state.options,
    };
    const suggestion = state.interpreter.customProviderEnabled === true
      ? await suggestMetaWithInterpreter(state.interpreter, input)
      : await suggestMetaWithAiAssistant(input);
    applyMetaSuggestion(suggestion);
    setStatus('AI 建议已填入，请人工确认后再同步。', 'success');
  } catch (err) {
    setStatus(`AI 建议失败：${err instanceof Error ? err.message : String(err)}`, 'error');
  } finally {
    button.disabled = false;
  }
}

async function suggestMetaWithAiAssistant(input: {
  title: string;
  source: string;
  dir: string;
  excerpt?: string;
  template: PropertyTemplate;
  options: PropertyOptions;
}): Promise<Record<string, unknown>> {
  const today = new Date().toISOString().slice(0, 10);
  const prompt = [
    '你是 Obsidian 知识库同步插件的 YAML 属性建议器。请根据用户预设尽量填好字段。',
    '若说明文档和插件预设冲突，以插件预设/可选项为准。',
    '编码字段必须留空字符串，因为编码由 auto-rename 插件分配。',
    '输入字段优先使用目标目录完整路径。',
    `日期字段用 ISO 格式 YYYY-MM-DD；无法从内容判断时使用今天：${today}。`,
    '关键词给 3-7 个，用顿号分隔。',
    '评分必须是 1-5；评分_显示必须从可选项中选择最接近的一项。',
    '所有枚举字段必须从可选项中选择最接近的一项；索引_块和索引_风险可以返回数组。',
    '只返回严格 JSON 对象，不要 Markdown，不要解释。',
    '',
    `标题：${input.title}`,
    `URL：${input.source}`,
    `目标目录：${input.dir}`,
    `属性模板：${JSON.stringify(input.template)}`,
    `可选项：${JSON.stringify(input.options)}`,
    `正文摘要：\n${input.excerpt || ''}`,
    '',
    '必须返回这些字段：标签、编码、输入、日期、日期索引、关键词、概述、评分、评分_显示、索引_知识库、索引_颜色、索引_操作&反馈、索引_块、索引_风险。',
  ].join('\n');
  const result = await chatWithAI(aiConfig, [
    { role: 'system', content: '你只输出可解析 JSON。' },
    { role: 'user', content: prompt },
  ]);
  return normalizeAiSuggestion(parseAiJsonObject(result), input.dir);
}

function parseAiJsonObject(raw: string): Record<string, unknown> {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  const jsonText = start >= 0 && end > start ? trimmed.slice(start, end + 1) : trimmed;
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not object');
    return parsed as Record<string, unknown>;
  } catch {
    throw new Error(`AI 助手返回非 JSON：${raw.slice(0, 160)}`);
  }
}

function normalizeAiSuggestion(suggestion: Record<string, unknown>, dir: string): Record<string, unknown> {
  const today = new Date().toISOString().slice(0, 10);
  const next: Record<string, unknown> = { ...suggestion };
  next.编码 = '';
  next.输入 = String(next.输入 || dir || '');
  next.标签 = normalizePropertyOptionValue('标签', String(next.标签 || 'S')) || 'S';
  const rawDate = String(next.日期 || today).replace(/\//g, '-');
  next.日期 = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : today;
  if (!next.关键词) next.关键词 = draftKeywords(String(next.概述 || '')).join('、');

  const score = normalizePropertyOptionValue('评分', String(next.评分 || '2'));
  next.评分 = score || '2';
  const scoreLabelMap: Record<string, string> = {
    '1': '🌟·素材',
    '2': '🌟🌟·整理',
    '3': '🌟🌟🌟·实践',
    '4': '🌟🌟🌟🌟·通用',
    '5': '🌟🌟🌟🌟🌟·体系',
  };
  if (!next.评分_显示 || String(next.评分_显示).includes('未选择')) {
    next.评分_显示 = scoreLabelMap[String(next.评分)] || scoreLabelMap['2'];
  }

  for (const key of ['日期索引', '索引_知识库', '索引_颜色', '索引_操作&反馈', '索引_块', '索引_风险']) {
    const raw = next[key];
    if (Array.isArray(raw)) {
      next[key] = raw.map((item) => normalizePropertyOptionValue(key, String(item))).filter(Boolean);
    } else {
      const parts = splitList(String(raw || ''));
      if (key === '索引_块' || key === '索引_风险' || key === '日期索引') {
        next[key] = parts.map((item) => normalizePropertyOptionValue(key, item)).filter(Boolean);
      } else {
        next[key] = normalizePropertyOptionValue(key, String(raw || ''));
      }
    }
  }
  return next;
}

function applyMetaSuggestion(suggestion: Record<string, unknown>): void {
  for (const [key, raw] of Object.entries(suggestion)) {
    const control = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[data-meta-key="${cssEscape(key)}"]`);
    if (!control) continue;
    const value = Array.isArray(raw) ? raw.join('、') : String(raw ?? '');
    if (control.dataset.groupedMeta === 'true') {
      setGroupedControlValue(control, key, value);
      continue;
    }
    if (control instanceof HTMLSelectElement && value && !Array.from(control.options).some((option) => option.value === value)) {
      appendOption(control, value, value);
    }
    control.value = value;
  }
}

function createGroupedControl(key: keyof PropertyTemplate, value: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'grouped-control';

  const hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.dataset.metaKey = key;
  hidden.dataset.groupedMeta = 'true';
  wrapper.appendChild(hidden);

  const groups = GROUPED_FIELDS[key] ?? [];
  groups.forEach((group, groupIndex) => {
    const row = document.createElement('div');
    row.className = 'choice-row';

    const title = document.createElement('span');
    title.className = 'choice-title';
    title.textContent = group.name;
    row.appendChild(title);

    group.options.forEach((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-chip';
      button.textContent = option.label;
      button.dataset.groupIndex = String(groupIndex);
      button.dataset.value = option.value;
      button.addEventListener('click', () => {
        const active = button.classList.contains('is-selected');
        row.querySelectorAll<HTMLButtonElement>('.choice-chip').forEach((chip) => chip.classList.remove('is-selected'));
        if (!active) button.classList.add('is-selected');
        syncGroupedHiddenValue(wrapper, hidden);
      });
      row.appendChild(button);
    });

    wrapper.appendChild(row);
  });

  setGroupedControlValue(hidden, String(key), value);
  return wrapper;
}

function setGroupedControlValue(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, key: string, value: string): void {
  const wrapper = control.closest<HTMLElement>('.grouped-control');
  if (!wrapper) {
    control.value = value;
    return;
  }

  const selected = new Set(splitList(value).map((item) => normalizePropertyOptionValue(key, item)));
  wrapper.querySelectorAll<HTMLButtonElement>('.choice-chip').forEach((chip) => {
    chip.classList.toggle('is-selected', selected.has(chip.dataset.value ?? ''));
  });
  syncGroupedHiddenValue(wrapper, control as HTMLInputElement);
}

function syncGroupedHiddenValue(wrapper: HTMLElement, hidden: HTMLInputElement): void {
  const values = Array.from(wrapper.querySelectorAll<HTMLButtonElement>('.choice-chip.is-selected'))
    .map((chip) => chip.dataset.value ?? '')
    .filter(Boolean);
  hidden.value = values.join('、');
}

async function confirmSync(): Promise<void> {
  if (!state) return;
  const current = state;
  const syncBtn = $('sync-btn') as HTMLButtonElement;
  const dirControl = document.querySelector<HTMLInputElement | HTMLSelectElement>('[name="target-dir"]');
  const appendEnabled = document.querySelector<HTMLInputElement>('[name="append-mode"]')?.checked === true;
  const dir = dirControl?.value.trim() || state.fallbackDir || undefined;

  if (!dir && !appendEnabled) {
    setStatus('请选择或填写目标目录后再同步。', 'error');
    return;
  }

  syncBtn.disabled = true;
  setStatus('正在连接 OB 插件...', 'info');

  const conn = await testConnection(state.config);
  if (!conn.ok) {
    setStatus(conn.message, 'error');
    syncBtn.disabled = false;
    return;
  }

  try {
    if (current.mode === 'web-clip') {
      await confirmWebClip(current, dir || current.fallbackDir);
      return;
    }
    const targetDir = dir || '';

    setStatus('正在抓取并写入 Obsidian...', 'info');
    const result = await runPersistedWrite<FetchResponse>('fetch', {
      node_token: current.nodeToken,
      obj_token: current.tokenInfo.obj_token,
      dir: targetDir,
      meta: collectMeta(),
    });
    await saveRecentTargetDir(targetDir);
    const codeMsg = result.编码 ? `（编码 ${result.编码}）` : '';
    setStatus(`${result.action === 'created' ? '已创建' : '已更新'}：${result.path}${codeMsg}`, 'success');
    updateSteps(4, 'done');
  } catch (err) {
    setStatus(`同步失败：${err instanceof Error ? err.message : String(err)}`, 'error');
    syncBtn.disabled = false;
  }
}

async function confirmWebClip(current: PanelState, dir: string): Promise<void> {
  const appendEnabled = document.querySelector<HTMLInputElement>('[name="append-mode"]')?.checked === true;
  const appendPath = document.querySelector<HTMLInputElement>('[name="append-path"]')?.value.trim() || '';
  if (appendEnabled && !appendPath) {
    throw new Error('已勾选“补充到已有文档”，请填写要补充的 .md 文件路径。');
  }

  setStatus(appendEnabled ? '正在整理网页内容并补充到已有文档...' : '正在整理网页内容并转换为 Obsidian 文档...', 'info');
  const snapshot = current.pageSnapshot ?? await getActivePageSnapshot(await getActiveTab());
  const draft = await buildWebConversionDraft(current, snapshot, dir);
  const result = await runPersistedWrite<ClipResponse>('clip', {
    title: snapshot.title || current.title,
    url: snapshot.url || current.source,
    sourceKind: snapshot.sourceKind === 'feishu-doc' ? 'generic-page' : snapshot.sourceKind,
    text: snapshot.selection || snapshot.text,
    rawText: snapshot.text,
    bodyMarkdown: draft.bodyMarkdown,
    description: snapshot.description,
    dir: draft.suggestedDir || dir,
    appendPath: appendEnabled ? appendPath : undefined,
    meta: draft.meta,
  });
  await saveRecentTargetDir(dir);
  setStatus(`${appendEnabled ? '已补充' : '已保存'}：${result.path}`, 'success');
  updateSteps(4, 'done');
}

function getReadyMessage(next: PanelState): string {
  if (next.treeError) return `目录树加载失败，可手动填写目录：${next.treeError}`;
  if (next.existingPath) return `检测到已同步文件，确认后将更新：${next.existingPath}`;
  if (next.mode === 'web-clip') return '当前页不是飞书 wiki/docx/doc 文档，将使用“网页转 Obsidian”模式。Base、多维表格和普通网页会按可见内容生成 Obsidian 文档。';
  return '请确认目录和属性，确认后开始同步。';
}

function getInterpreterSummary(next: PanelState): string {
  if (next.mode === 'web-clip') {
    return '网页转换：读取当前页可见内容；可勾选“补充到已有文档”把划词/金句追加到汇总文件。';
  }
  if (!next.interpreter.enabled) return '解释器：关闭。侧边栏将只使用属性模板预填。';
  if (next.interpreter.customProviderEnabled !== true) {
    const excerptChars = next.interpreter.excerptChars || DEFAULT_AI_EXCERPT_CHARS;
    return `解释器：使用 AI 助手 / ${aiConfig.provider}，手动确认模式。AI 只读取正文前 ${excerptChars} 字生成建议，最终写入以这里确认为准。`;
  }
  const provider = next.interpreter.provider || '本地规则';
  const model = next.interpreter.model ? ` / ${next.interpreter.model}` : '';
  const route = next.interpreter.baseUrl ? `，中转：${next.interpreter.baseUrl}` : '';
  const mode = next.interpreter.autoRun ? '自动建议开启' : '手动确认模式';
  const excerptChars = next.interpreter.excerptChars || DEFAULT_AI_EXCERPT_CHARS;
  return `解释器：${provider}${model}${route}，${mode}。AI 只读取正文前 ${excerptChars} 字生成建议，最终写入以这里确认为准。`;
}

async function getActiveTabExcerpt(limit: number): Promise<string> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return '';
  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'GET_FEISHU_DOC_EXCERPT',
      limit,
    }) as { ok?: boolean; excerpt?: string };
    return response?.ok ? response.excerpt ?? '' : '';
  } catch {
    return '';
  }
}

async function getActivePageSnapshot(tab: chrome.tabs.Tab): Promise<WebPageSnapshot> {
  const fallbackUrl = tab.url || '';
  const fallbackTitle = cleanTitle(tab.title || '未命名网页');
  if (!tab.id || !/^https?:/i.test(fallbackUrl)) {
    return {
      title: fallbackTitle,
      url: fallbackUrl,
      description: '',
      selection: '',
      headings: [],
      tables: [],
      text: '',
      sourceKind: detectSourceKind(fallbackUrl, false, ''),
    };
  }
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const pickText = (element: Element | null, limit = 12000) => (element?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, limit);
        const selection = window.getSelection()?.toString().replace(/\s+/g, ' ').trim() || '';
        const title = document.title || '';
        const description = document.querySelector<HTMLMetaElement>('meta[name="description"],meta[property="og:description"]')?.content || '';
        const main = document.querySelector('article, main, [role="main"], .article, .post, .content, .doc-content');
        const bodyText = pickText(main, 16000) || pickText(document.body, 16000);
        const headings = Array.from(document.querySelectorAll('h1,h2,h3'))
          .map((heading) => heading.textContent?.replace(/\s+/g, ' ').trim() || '')
          .filter(Boolean)
          .slice(0, 24);
        const tables = Array.from(document.querySelectorAll('table,[role="table"],.table,.grid,.bitable,.base-table'))
          .map((table) => pickText(table, 3000))
          .filter(Boolean)
          .slice(0, 6);
        return {
          title,
          url: location.href,
          description,
          selection,
          headings,
          tables,
          text: selection || bodyText,
        };
      },
    });
    const value = result?.result as Omit<WebPageSnapshot, 'sourceKind'> | undefined;
    const text = value?.text || '';
    return {
      title: cleanTitle(value?.title || fallbackTitle),
      url: value?.url || fallbackUrl,
      description: value?.description || '',
      selection: value?.selection || '',
      headings: value?.headings || [],
      tables: value?.tables || [],
      text,
      sourceKind: detectSourceKind(value?.url || fallbackUrl, Boolean(value?.selection), text),
    };
  } catch {
    return {
      title: fallbackTitle,
      url: fallbackUrl,
      description: '',
      selection: '',
      headings: [],
      tables: [],
      text: '',
      sourceKind: detectSourceKind(fallbackUrl, false, ''),
    };
  }
}

function detectSourceKind(url: string, hasSelection: boolean, text: string): SourceKind {
  if (hasSelection) return 'selection';
  if (/\.feishu\.cn\/(base|bitable|sheets|mindnotes|wiki\/base)/i.test(url) || /多维表格|Base|bitable/i.test(text)) return 'feishu-base';
  if (/\/(article|post|news|blog|posts)\b/i.test(url)) return 'article';
  return 'generic-page';
}

async function buildWebConversionDraft(current: PanelState, snapshot: WebPageSnapshot, dir: string): Promise<WebConversionDraft> {
  const scenePrompt = current.scenePrompt?.trim();
  if (!current.interpreter.enabled && !current.aiEnabled) return fallbackWebDraft(current, snapshot, dir);
  if (current.interpreter.customProviderEnabled === true) {
    try {
      const meta = await suggestMetaWithInterpreter(current.interpreter, {
        title: snapshot.title,
        source: snapshot.url,
        dir,
        excerpt: buildSnapshotExcerpt(snapshot, current.interpreter.excerptChars || DEFAULT_AI_EXCERPT_CHARS),
        template: current.template,
        options: current.options,
      });
      return {
        meta: normalizeAiSuggestion(meta, dir),
        bodyMarkdown: fallbackBodyMarkdown(snapshot),
        suggestedDir: dir,
      };
    } catch {
      return fallbackWebDraft(current, snapshot, dir);
    }
  }
  try {
    const prompt = [
      '你是网页转 Obsidian 文档转换器。请把当前网页/选中文本整理成用户知识库可用的 Obsidian Markdown。',
      '只返回严格 JSON，不要 Markdown 代码块，不要解释。',
      'JSON 结构：{"meta":{...},"bodyMarkdown":"...","suggestedDir":""}',
      'meta 必须符合插件预设；说明文档和插件预设冲突时，以插件预设/可选项为准。',
      '编码必须是空字符串；输入优先填目标目录；日期 YYYY-MM-DD；关键词 3-7 个顿号分隔；评分 1-5；评分_显示与评分匹配。',
      scenePrompt ? `用户自定义场景 Prompt：\n${scenePrompt}` : '',
      '',
      `标题：${snapshot.title}`,
      `URL：${snapshot.url}`,
      `来源类型：${snapshot.sourceKind}`,
      `目标目录：${dir}`,
      `属性模板：${JSON.stringify(current.template)}`,
      `可选项：${JSON.stringify(current.options)}`,
      `Meta description：${snapshot.description}`,
      `Headings：${snapshot.headings.join(' / ')}`,
      `Tables：\n${snapshot.tables.join('\n\n')}`,
      `正文：\n${buildSnapshotExcerpt(snapshot, 12000)}`,
    ].join('\n');
    const result = await chatWithAI(aiConfig, [
      { role: 'system', content: '你只输出可解析 JSON。' },
      { role: 'user', content: prompt },
    ]);
    const parsed = parseAiJsonObject(result);
    const meta = parsed.meta && typeof parsed.meta === 'object' && !Array.isArray(parsed.meta) ? parsed.meta as Record<string, unknown> : parsed;
    const bodyMarkdown = typeof parsed.bodyMarkdown === 'string' && parsed.bodyMarkdown.trim()
      ? parsed.bodyMarkdown.trim()
      : fallbackBodyMarkdown(snapshot);
    return {
      meta: normalizeAiSuggestion(meta, dir),
      bodyMarkdown,
      suggestedDir: typeof parsed.suggestedDir === 'string' ? parsed.suggestedDir.trim() : dir,
    };
  } catch {
    return fallbackWebDraft(current, snapshot, dir);
  }
}

function fallbackWebDraft(current: PanelState, snapshot: WebPageSnapshot, dir: string): WebConversionDraft {
  const today = new Date().toISOString().slice(0, 10);
  return {
    meta: normalizeAiSuggestion({
      标签: 'S',
      编码: '',
      输入: dir,
      日期: today,
      关键词: draftKeywords(`${snapshot.title} ${snapshot.description} ${snapshot.text}`).join('、') || '网页剪存',
      概述: snapshot.description || `从网页转换：${snapshot.title}`,
      评分: 1,
      评分_显示: '🌟·素材',
    }, dir),
    bodyMarkdown: fallbackBodyMarkdown(snapshot),
    suggestedDir: dir || current.fallbackDir,
  };
}

function buildSnapshotExcerpt(snapshot: WebPageSnapshot, limit: number): string {
  return [
    snapshot.selection ? `选中文本：\n${snapshot.selection}` : '',
    snapshot.tables.length ? `表格/卡片：\n${snapshot.tables.join('\n\n')}` : '',
    snapshot.text ? `正文：\n${snapshot.text}` : '',
  ].filter(Boolean).join('\n\n').slice(0, limit);
}

function fallbackBodyMarkdown(snapshot: WebPageSnapshot): string {
  const sections = [
    snapshot.description ? `## 摘要\n\n${snapshot.description}` : '',
    snapshot.headings.length ? `## 页面结构\n\n${snapshot.headings.map((heading) => `- ${heading}`).join('\n')}` : '',
    snapshot.tables.length ? `## 可见表格/卡片\n\n${snapshot.tables.join('\n\n---\n\n')}` : '',
    `## 正文\n\n${snapshot.selection || snapshot.text || '（当前页面没有可读取的可见文本。）'}`,
  ].filter(Boolean);
  return sections.join('\n\n');
}

function cleanTitle(title: string): string {
  return title.replace(/\s*-\s*飞书云文档\s*$/, '').trim() || title.trim();
}

function dirname(path?: string): string {
  if (!path) return '';
  const parts = path.split('/').filter(Boolean);
  if (parts.length <= 1) return '';
  return parts.slice(0, -1).join('/');
}

async function loadRecentTargetDir(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get([RECENT_TARGET_DIR_KEY], (result) => {
      resolve(typeof result[RECENT_TARGET_DIR_KEY] === 'string' ? result[RECENT_TARGET_DIR_KEY] : '');
    });
  });
}

async function saveRecentTargetDir(dir: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [RECENT_TARGET_DIR_KEY]: dir }, () => resolve());
  });
}

function resolveTargetDir(dirs: TreeNode[], preferred: string): string {
  if (dirs.length === 0) return preferred;
  if (preferred && dirs.some((dir) => dir.path === preferred)) return preferred;
  if (preferred) {
    const parent = dirs
      .filter((dir) => preferred.startsWith(`${dir.path}/`))
      .sort((a, b) => b.path.length - a.path.length)[0];
    if (parent) return parent.path;
  }
  const inboxLike = dirs.find((dir) => /inbox|输入|收集|素材|闪念/i.test(dir.path));
  return inboxLike?.path || dirs[0].path;
}

function buildDirTree(dirs: TreeNode[]): DirTreeView[] {
  const nodes = new Map<string, DirTreeView>();
  dirs
    .slice()
    .sort((a, b) => a.path.localeCompare(b.path, 'zh'))
    .forEach((dir) => {
      nodes.set(dir.path, { ...dir, children: [], parentPath: dirname(dir.path) });
    });

  const roots: DirTreeView[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentPath ? nodes.get(node.parentPath) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  const sortChildren = (items: DirTreeView[]) => {
    items.sort((a, b) => a.label.localeCompare(b.label, 'zh'));
    items.forEach((item) => sortChildren(item.children));
  };
  sortChildren(roots);
  return roots;
}

function getAncestorPaths(path: string): string[] {
  const parts = path.split('/').filter(Boolean);
  const ancestors: string[] = [];
  for (let index = 1; index < parts.length; index += 1) {
    ancestors.push(parts.slice(0, index).join('/'));
  }
  return ancestors;
}

function draftKeywords(title: string): string[] {
  const words = title
    .replace(/[^\p{Script=Han}\p{Letter}\p{Number}]+/gu, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2);
  return Array.from(new Set(words)).slice(0, 6);
}

function splitList(value: string): string[] {
  return value
    .split(/[\n,，、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseOptions(value?: string): string[] {
  return Array.from(new Set(splitList(value ?? ''))).slice(0, 30);
}

function appendOption(target: HTMLSelectElement | HTMLDataListElement, value: string, label: string): void {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  target.appendChild(option);
}

function cssEscape(value: string): string {
  return value.replace(/["\\]/g, '\\$&');
}

function setStatus(message: string, type: StatusType): void {
  const status = $('status');
  status.textContent = message;
  status.className = `status status-${type}`;
}

function updateSteps(current: number, stepState: 'active' | 'done'): void {
  const dots = document.querySelectorAll<HTMLElement>('.step');
  dots.forEach((dot, i) => {
    const n = i + 1;
    dot.classList.remove('step-active', 'step-done');
    if (n < current) dot.classList.add('step-done');
    if (n === current) dot.classList.add(stepState === 'active' ? 'step-active' : 'step-done');
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
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
  return escapeHtml(value).replace(/`/g, '&#096;');
}

// ═══════════════════════════════════════════════
// Tab 切换 + AI Chat v2.0 — 多 Provider 架构
// ═══════════════════════════════════════════════

function setupTabs(): void {
  document.querySelectorAll('.panel-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = (btn as HTMLElement).dataset.panel!;
      switchTab(panel);
    });
  });
}

function switchTab(panel: string): void {
  document.querySelectorAll('.panel-tab').forEach(b => {
    b.classList.toggle('panel-tab-active', (b as HTMLElement).dataset.panel === panel);
  });
  const syncEl = document.getElementById('panel-sync');
  const aiEl = document.getElementById('panel-ai');
  if (syncEl) syncEl.style.display = panel === 'sync' ? '' : 'none';
  if (aiEl) aiEl.style.display = panel === 'ai' ? 'flex' : 'none';
  const title = document.getElementById('page-title');
  if (title) title.textContent = panel === 'sync' ? '同步前预览' : 'AI 对话';
}

// ═══════════════════════════════════════════════
// AI Config 加载 / 保存
// ═══════════════════════════════════════════════
async function loadAiConfig(): Promise<void> {
  aiConfig = await loadSecretBackedConfig(DEFAULT_AI_CONFIG, AI_CONFIG_STORAGE);
  updateProviderBadge();
}

function updateProviderBadge(): void {
  const badge = document.getElementById('ai-provider-badge');
  if (!badge) return;
  const labels: Record<AIProvider, string> = {
    'gemini-web': 'Gemini Web',
    'gemini-nano': 'Gemini Nano (内置)',
    'gemini-api': 'Gemini API',
    'openai': 'OpenAI',
    'deepseek': 'DeepSeek',
    'deepseek-web': 'DeepSeek Web (免费)',
    'custom': '自定义',
  };
  badge.textContent = labels[aiConfig.provider] || aiConfig.provider;
  badge.className = `ai-provider-badge ai-provider-${aiConfig.provider}`;
}

// ═══════════════════════════════════════════════
// 多 Provider AI 调用
// ═══════════════════════════════════════════════
async function chatWithAI(config: AIConfig, messages: Array<{ role: string; content: string }>, attachments: AiAttachment[] = []): Promise<string> {
  switch (config.provider) {
    case 'gemini-web': {
      const prompt = messages.filter((message) => message.role !== 'system').map((message) => message.content).join('\n\n');
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: 'ai-inline', payload: { action: 'ai-chat', text: prompt, attachments } }, (response) => {
          const error = chrome.runtime.lastError?.message || response?.error;
          if (error) reject(new Error(error));
          else resolve(response?.text || 'Gemini Web 未返回内容');
        });
      });
    }

    case 'deepseek-web': {
      const prompt = messages.filter((message) => message.role !== 'system').map((message) => message.content).join('\n\n');
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: 'ai-inline-deepseek-web', payload: { text: prompt } }, (response) => {
          const error = chrome.runtime.lastError?.message || response?.error;
          if (error) reject(new Error(error));
          else resolve(response?.text || 'DeepSeek Web 未返回内容');
        });
      });
    }

    case 'gemini-nano': {
      const ai = (window as any).ai;
      if (!ai?.languageModel) {
        throw new Error('当前 Chrome 不支持 Gemini Nano。请在扩展设置 > AI 助手中选择 Gemini API、OpenAI、DeepSeek 或自定义兼容服务。');
      }
      const session = await ai.languageModel.create({
        temperature: 0.7,
        topK: 40,
        systemPrompt: config.systemPrompt,
      });
      try {
        // Gemini Nano 不支持多轮对话数组，拼接为文本
        const prompt = messages.map(m => {
          if (m.role === 'system') return `[系统]: ${m.content}`;
          if (m.role === 'user') return `[用户]: ${m.content}`;
          return `[AI]: ${m.content}`;
        }).join('\n\n') + '\n\n[AI]: ';
        const result = await session.prompt(prompt);
        return result;
      } finally {
        session.destroy();
      }
    }

    case 'gemini-api': {
      if (!config.apiKey) throw new Error('Gemini API 需要 API Key。请在设置中配置。');
      const model = config.model || 'gemini-2.0-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;
      // 转换消息格式
      const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));
      // 如果有 system prompt，加到第一条 user message 前面
      if (config.systemPrompt && contents.length > 0) {
        contents[0].parts[0].text = `[系统指令: ${config.systemPrompt}]\n\n${contents[0].parts[0].text}`;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });
      const data = await res.json() as any;
      if (!res.ok) throw new Error(data.error?.message || `Gemini API HTTP ${res.status}`);
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '(空响应)';
    }

    case 'openai':
    case 'deepseek':
    case 'custom': {
      const baseUrl = config.baseUrl || (
        config.provider === 'openai' ? 'https://api.openai.com' :
        config.provider === 'deepseek' ? 'https://api.deepseek.com' : ''
      );
      if (!baseUrl) throw new Error('AI 助手尚未配置。请在扩展设置 > AI 助手中填写 Base URL 和模型，或选择 Gemini API、OpenAI、DeepSeek。');
      if (!config.apiKey && config.provider !== 'custom') throw new Error('请配置 API Key。');

      const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;

      const payload: any = {
        model: config.model || (config.provider === 'openai' ? 'gpt-4o-mini' : config.provider === 'deepseek' ? 'deepseek-chat' : 'gpt-3.5-turbo'),
        messages: [
          ...(config.systemPrompt ? [{ role: 'system', content: config.systemPrompt }] : []),
          ...messages.filter(m => m.role !== 'system'),
        ],
        temperature: 0.7,
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json() as any;
      if (!res.ok) throw new Error(data.error?.message || `API HTTP ${res.status}`);
      return data.choices?.[0]?.message?.content || '(空响应)';
    }

    default:
      throw new Error(`未知 Provider: ${config.provider}`);
  }
}

// ═══════════════════════════════════════════════
// AI 消息 UI
// ═══════════════════════════════════════════════
function renderMarkdown(text: string): string {
  // 简单 Markdown 渲染
  let html = escapeHtml(text);
  // 代码块：```code```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) => {
    return `<pre class="ai-code-block"><code>${escapeHtml(code.trim())}</code></pre>`;
  });
  // 行内代码：`code`
  html = html.replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>');
  // 粗体：**text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // 斜体：*text*
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // 换行
  html = html.replace(/\n/g, '<br>');
  return html;
}

function addUserMessage(text: string): void {
  const el = document.getElementById('ai-messages');
  if (!el) return;
  const empty = el.querySelector('.ai-empty');
  if (empty) empty.remove();
  const msg = document.createElement('div');
  msg.className = 'ai-msg ai-msg-user';
  msg.textContent = text;
  el.appendChild(msg);
  el.scrollTop = el.scrollHeight;
}

function addAiMessage(text: string): void {
  const el = document.getElementById('ai-messages');
  if (!el) return;
  const msg = document.createElement('div');
  msg.className = 'ai-msg ai-msg-ai';
  msg.innerHTML = renderMarkdown(text);
  el.appendChild(msg);
  el.scrollTop = el.scrollHeight;
}

function addAiError(text: string): void {
  const el = document.getElementById('ai-messages');
  if (!el) return;
  const msg = document.createElement('div');
  msg.className = 'ai-msg ai-msg-error';
  msg.textContent = text;
  el.appendChild(msg);
  el.scrollTop = el.scrollHeight;
}

function addScreenshotMessage(dataUrl: string, label: string): void {
  const el = document.getElementById('ai-messages');
  if (!el) return;
  const empty = el.querySelector('.ai-empty');
  if (empty) empty.remove();
  const msg = document.createElement('div');
  msg.className = 'ai-msg ai-msg-user ai-screenshot-msg';
  const caption = document.createElement('div');
  caption.textContent = `${label}：已捕获当前页面截图`;
  const image = document.createElement('img');
  image.src = dataUrl;
  image.alt = '当前页面截图';
  image.className = 'ai-screenshot';
  msg.append(caption, image);
  el.appendChild(msg);
  el.scrollTop = el.scrollHeight;
}

function renderAttachmentChips(): void {
  const target = document.getElementById('ai-attachments');
  if (!target) return;
  target.innerHTML = aiAttachments
    .map((file) => `<span class="ai-attachment" title="${escapeAttr(file.name)}">${escapeHtml(file.name)}</span>`)
    .join('');
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`读取附件失败：${file.name}`));
    reader.readAsDataURL(file);
  });
}

async function captureDisplayFrame(): Promise<AiAttachment> {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('当前浏览器不支持屏幕选择截图。');
  }
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  try {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    await video.play();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const track = stream.getVideoTracks()[0];
    const settings = track?.getSettings();
    const width = settings?.width || video.videoWidth || 1280;
    const height = settings?.height || video.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法创建截图画布。');
    ctx.drawImage(video, 0, 0, width, height);
    return { name: 'screen-shot.png', dataUrl: canvas.toDataURL('image/png') };
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}

function addAiLoading(): HTMLElement {
  const el = document.getElementById('ai-messages');
  const msg = document.createElement('div');
  msg.className = 'ai-msg ai-msg-ai ai-msg-loading';
  msg.innerHTML = '<span class="ai-dot"></span><span class="ai-dot"></span><span class="ai-dot"></span>';
  el!.appendChild(msg);
  el!.scrollTop = el!.scrollHeight;
  return msg;
}

async function sendAiMessage(prompt: string, attachmentsOverride?: AiAttachment[], options: { skipUserBubble?: boolean } = {}): Promise<void> {
  const sendBtn = document.getElementById('ai-send') as HTMLButtonElement;
  const attachmentsForSend = attachmentsOverride ?? aiAttachments;
  const attachmentSuffix = attachmentsForSend.length > 0 ? `\n[已附加 ${attachmentsForSend.length} 张图片]` : '';

  if (!options.skipUserBubble) addUserMessage(`${prompt}${attachmentSuffix}`);
  if (sendBtn) sendBtn.disabled = true;
  const loadingEl = addAiLoading();

  // 添加到历史
  aiMessages.push({ role: 'user', content: `${prompt}${attachmentSuffix}` });
  if (!attachmentsOverride) {
    aiAttachments = [];
    renderAttachmentChips();
  }

  try {
    // 构造完整消息（包含 system prompt）
    const fullMessages = [
      { role: 'system', content: aiConfig.systemPrompt },
      ...aiMessages,
    ];

    const result = await chatWithAI(aiConfig, fullMessages, attachmentsForSend);
    loadingEl.remove();
    addAiMessage(result);
    aiMessages.push({ role: 'assistant', content: result });
  } catch (e) {
    loadingEl.remove();
    const errMsg = `❌ ${e instanceof Error ? e.message : String(e)}`;
    addAiError(errMsg);
  } finally {
    if (sendBtn) sendBtn.disabled = false;
  }
}

function setupAiChat(): void {
  const sendBtn = document.getElementById('ai-send');
  const inputEl = document.getElementById('ai-input') as HTMLTextAreaElement;
  const clearBtn = document.getElementById('ai-clear');
  const fileInput = document.getElementById('ai-file') as HTMLInputElement;
  if (!sendBtn || !inputEl) return;

  sendBtn.addEventListener('click', () => {
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    sendAiMessage(text);
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      aiMessages = [];
      const el = document.getElementById('ai-messages');
      if (el) {
        el.innerHTML = '<div class="ai-empty">在下方输入问题，AI 助手将为你解答</div>';
      }
    });
  }
  fileInput?.addEventListener('change', async () => {
    const files = Array.from(fileInput.files ?? []);
    const invalidFile = files.find((file) => !file.type.startsWith('image/'));
    if (invalidFile) {
      addAiError(`Gemini Web 目前只支持图片附件：${invalidFile.name}`);
      fileInput.value = '';
      return;
    }
    aiAttachments = await Promise.all(files.map(async (file) => ({ name: file.name, dataUrl: await readFileAsDataUrl(file) })));
    renderAttachmentChips();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-ai-tool]').forEach((button) => button.addEventListener('click', async () => {
    const action = button.dataset.aiTool || 'ai-chat';
    const instruction = inputEl.value.trim();
    if (action === 'screen-shot') {
      try {
        const attachment = await captureDisplayFrame();
        addScreenshotMessage(attachment.dataUrl, '屏幕截图');
        const prompt = instruction || '请分析这张屏幕截图，提取关键信息，并整理成适合 Obsidian 的中文笔记。';
        await sendAiMessage(prompt, [attachment], { skipUserBubble: true });
      } catch (error) {
        addAiError(`屏幕截图失败：${error instanceof Error ? error.message : String(error)}`);
      }
      return;
    }
    chrome.runtime.sendMessage({ type: 'ai-tool', payload: { action, text: instruction } });
  }));
}

// 监听来自 content script 的消息（clip / ai-prompt）
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'ai-prompt') {
    switchTab('ai');
    setTimeout(() => {
      const actionLabels: Record<string, string> = {
        translate: '翻译',
        summarize: '总结',
        explain: '解释',
        grammar: '语法修正',
        'ai-chat': 'AI 对话',
        'browser-control': '浏览器控制',
        page: '网页',
        quote: '引用',
        ocr: 'OCR',
        'screenshot-translate': '截图翻译',
        'screen-shot': '屏幕截图',
      };
      const label = actionLabels[message.payload.action] || 'AI';
      const rawText = String(message.payload.text || message.payload.selection || '');
      let userText = rawText.slice(0, 500);
      const attachments: AiAttachment[] = message.payload.imageDataUrl
        ? [{ name: `${message.payload.action || 'screenshot'}.png`, dataUrl: message.payload.imageDataUrl }]
        : [];
      if (message.payload.imageDataUrl) {
        addScreenshotMessage(message.payload.imageDataUrl, label);
      }
      if (message.payload.captureError) {
        addAiError(`截图失败：${message.payload.captureError}`);
      }

      // 根据 action 构建最优 prompt
      const actionPrompts: Record<string, string> = {
        translate: `请将以下内容翻译成中文，只输出翻译结果：\n\n${message.payload.text}`,
        summarize: `请用简洁的要点式中文总结以下内容：\n\n${message.payload.text}`,
        explain: `请用通俗易懂的中文解释以下内容，适合初学者理解：\n\n${message.payload.text}`,
        grammar: `请修正以下文本的语法错误，用中文简要说明修改了什么：\n\n${message.payload.text}`,
        'browser-control': `你是浏览器控制助手。请根据当前网页快照给出下一步操作建议。不要虚构已执行动作；如果需要点击或输入，请给出明确的目标元素和文本。\n\n用户意图：${message.payload.userInstruction || '未填写'}\n标题：${message.payload.title}\nURL：${message.payload.url}\n选中文本：${message.payload.selection || '无'}\n可交互元素：\n${JSON.stringify(message.payload.debugTarget || message.payload.elements || [], null, 2)}`,
        page: `请分析当前网页，提取主题、关键信息、适合剪藏到 Obsidian 的摘要和标签建议。\n\n用户意图：${message.payload.userInstruction || '未填写'}\n标题：${message.payload.title}\nURL：${message.payload.url}\n\n网页正文：\n${rawText}`,
        quote: `请把下面内容整理成适合引用到 Obsidian 的格式：保留原意，给出一句摘要、引用正文和可选标签。\n\n来源：${message.payload.url}\n\n${message.payload.text || userText || '未选中文本'}`,
        ocr: message.payload.imageDataUrl
          ? `请对这张截图做 OCR：识别所有可见文字，尽量保持原有层级和表格结构，并输出可复制的 Markdown。`
          : `OCR 功能需要读取截图或图片。当前还没有收到图片，请提示我先执行屏幕截图或上传图片，并说明你可以帮我识别文字、整理结构、生成可复制文本。`,
        'screenshot-translate': message.payload.imageDataUrl
          ? `请识别这张截图中的文字，并翻译成自然中文。输出格式：先给译文，再列出原文中不确定的部分。`
          : `截图翻译功能需要截图图像。当前还没有收到图片，请提示我先执行屏幕截图或上传图片，并说明你可以帮我识别截图文字后翻译。`,
        'screen-shot': `请分析这张屏幕截图，提取关键信息、可见文字和下一步建议。\n\n标题：${message.payload.title}\nURL：${message.payload.url}`,
        'ai-chat': message.payload.text,
      };
      const prompt = actionPrompts[message.payload.action] || message.payload.text;
      if (!message.payload.imageDataUrl) addUserMessage(`${label}：${userText || message.payload.title || ''}`);
      sendAiMessage(prompt, attachments, { skipUserBubble: true });
    }, 200);
  }
  if (message.type === 'clip-data') {
    if (message.payload?.triggerSync) {
      switchTab('sync');
      // 把 background 透传的 docToken 传入 loadPanel，避免重复从 URL 提取
      const docToken = message.payload?.docToken as
        | { node_token?: string; obj_token?: string }
        | undefined;
      loadPanel(docToken);
    } else {
      handleClipData(message.payload ?? {});
    }
  }
});

init();

async function handleClipData(payload: Record<string, unknown>): Promise<void> {
  const title = typeof payload.title === 'string' && payload.title.trim() ? payload.title.trim() : '网页剪藏';
  const url = typeof payload.url === 'string' ? payload.url.trim() : '';
  const text = typeof payload.text === 'string' ? payload.text.trim() : '';
  const description = typeof payload.description === 'string' ? payload.description.trim() : '';
  const snapshot: WebPageSnapshot = {
    title,
    url,
    description,
    selection: text,
    headings: [],
    tables: [],
    text,
    sourceKind: detectSourceKind(url, Boolean(text), text),
  };
  await openWebClipPanel(snapshot, {
    sceneId: typeof payload.sceneId === 'string' ? payload.sceneId : '',
    sceneLabel: typeof payload.sceneLabel === 'string' ? payload.sceneLabel : '',
    sceneAction: typeof payload.sceneAction === 'string' ? payload.sceneAction as PanelState['sceneAction'] : '',
    scenePrompt: typeof payload.prompt === 'string' ? payload.prompt : '',
    defaultAppendPath: typeof payload.appendPath === 'string' ? payload.appendPath : '',
    defaultDir: typeof payload.defaultDir === 'string' ? payload.defaultDir : '',
    aiEnabled: payload.aiEnabled === true,
  });
  const label = typeof payload.sceneLabel === 'string' && payload.sceneLabel ? payload.sceneLabel : '划词/右键';
  setStatus(`已读取${label}内容。可直接保存，也可勾选“补充到已有文档”。`, 'info');
}

async function openWebClipPanel(snapshot: WebPageSnapshot, scene: Partial<PanelState> = {}): Promise<void> {
  switchTab('sync');
  renderLoading();
  const [config, template, options, interpreter] = await Promise.all([
    loadConfig(),
    loadPropertyTemplate(),
    loadPropertyOptions(),
    loadInterpreterConfig(),
  ]);
  const recentDir = await loadRecentTargetDir();
  const next: PanelState = {
    config,
    template,
    options,
    interpreter,
    mode: 'web-clip',
    sourceKind: snapshot.sourceKind,
    tokenInfo: {},
    nodeToken: '',
    title: cleanTitle(snapshot.title || '网页剪藏'),
    source: snapshot.url,
    dirs: [],
    fallbackDir: recentDir,
    pageSnapshot: snapshot,
    sceneId: scene.sceneId || '',
    sceneLabel: scene.sceneLabel || '',
    sceneAction: scene.sceneAction || '',
    scenePrompt: scene.scenePrompt || '',
    defaultAppendPath: scene.defaultAppendPath || '',
    defaultDir: scene.defaultDir || '',
    aiEnabled: scene.aiEnabled === true,
  };
  state = next;
  try {
    const tree = config.token ? await getTree(config) : { dirs: [] };
    next.dirs = tree.dirs;
    next.fallbackDir = resolveTargetDir(next.dirs, next.defaultDir || recentDir);
  } catch (err) {
    next.treeError = err instanceof Error ? err.message : String(err);
  }
  renderPanel(next);
  applySceneControls(next);
  $('sync-btn').toggleAttribute('disabled', !next.config.token);
  $('suggest-btn').toggleAttribute('disabled', !next.interpreter.enabled);
}

function applySceneControls(next: PanelState): void {
  const appendCheckbox = document.querySelector<HTMLInputElement>('[name="append-mode"]');
  const appendInput = document.querySelector<HTMLInputElement>('[name="append-path"]');
  const dirInput = document.querySelector<HTMLInputElement | HTMLSelectElement>('[name="target-dir"]');
  if (next.defaultDir && dirInput) dirInput.value = next.defaultDir;

  if (!appendCheckbox || !appendInput) return;
  const shouldAppend = next.sceneAction === 'append';
  if (!shouldAppend) return;

  appendCheckbox.checked = true;
  appendInput.disabled = false;
  appendInput.value = next.defaultAppendPath || appendInput.value;
  if (appendInput.value) {
    setStatus(`补充模式：将追加到 ${appendInput.value}`, 'info');
  } else {
    appendInput.focus();
    setStatus('请先设置默认补充文档，或在这里填写要补充的 .md 文件路径。', 'error');
  }
}
