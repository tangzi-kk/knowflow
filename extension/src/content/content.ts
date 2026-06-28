/**
 * Content script — 注入飞书文档页。
 *
 * 当前流程：
 * 1. 识别飞书文档页并注入“同步到 OB”按钮
 * 2. 点击按钮后打开右侧预览面板，不立即同步
 * 3. 面板内预填文档信息、目录和 YAML 属性
 * 4. 用户确认后 POST /fetch，payload 携带 dir 和 meta
 */
import './content.css';
import {
  DEFAULT_INTERPRETER_CONFIG,
  DEFAULT_PROPERTY_OPTIONS,
  getTree,
  loadConfig,
  loadInterpreterConfig,
  loadPropertyOptions,
  loadPropertyTemplate,
  normalizePropertyOptionValue,
  postExists,
  postFetch,
  suggestMetaWithInterpreter,
  testConnection,
  type InterpreterConfig,
  type PropertyOptions,
  type PropertyTemplate,
  type SyncConfig,
} from '../client.js';
import type { TreeNode } from '@sync/shared';

const BUTTON_ID = 'feishu-sync-btn';
const PANEL_ID = 'feishu-sync-panel';
const PANEL_BACKDROP_ID = 'feishu-sync-panel-backdrop';
const DEFAULT_AI_EXCERPT_CHARS = 4000;

type StatusType = 'idle' | 'info' | 'success' | 'error';

type MetaValue = string | number | boolean | string[];

type SyncMeta = Record<string, MetaValue>;

type MetaField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number' | 'checkbox' | 'grouped';
  help?: string;
};

type PreviewState = {
  config: SyncConfig;
  propertyTemplate: PropertyTemplate;
  propertyOptions: PropertyOptions;
  interpreter: InterpreterConfig;
  tokenInfo: { node_token?: string; obj_token?: string };
  nodeToken: string;
  title: string;
  source: string;
  dirs: TreeNode[];
  fallbackDir: string;
  existingPath?: string;
  treeError?: string;
};

const META_FIELDS: MetaField[] = [
  { key: '标签', label: '标签', type: 'text', help: 'S / X / L / Z / Q / J' },
  { key: '编码', label: '编码', type: 'text' },
  { key: '输入', label: '输入', type: 'text' },
  { key: '日期', label: '日期', type: 'date' },
  { key: '日期索引', label: '日期索引', type: 'text', help: '多个值用逗号或顿号分隔' },
  { key: '关键词', label: '关键词', type: 'textarea', help: '多个关键词用顿号分隔' },
  { key: '概述', label: '概述', type: 'textarea', help: '80-160 字，方便以后 AI 快速识别文档内容' },
  { key: '评分', label: '评分', type: 'number' },
  { key: '评分_显示', label: '评分_显示', type: 'text' },
  { key: '索引_知识库', label: '索引_知识库', type: 'text' },
  { key: '索引_颜色', label: '索引_颜色', type: 'text' },
  { key: '索引_操作&反馈', label: '索引_操作&反馈', type: 'grouped', help: '每组最多选一个' },
  { key: '索引_块', label: '索引_块', type: 'grouped', help: '抽象/具象选一个，简单/困难选一个' },
  { key: '索引_风险', label: '索引_风险', type: 'text', help: '多个值用逗号或顿号分隔' },
];
const SELECT_FIELDS = new Set<string>([
  '标签',
  '评分',
  '评分_显示',
  '索引_知识库',
  '索引_颜色',
]);

const GROUPED_FIELDS: Record<string, Array<{ name: string; options: Array<{ label: string; value: string }> }>> = {
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

/** 从当前 URL 提取 token。 */
function extractTokenFromUrl(): { node_token?: string; obj_token?: string } | null {
  const url = window.location.href;
  const wikiMatch = url.match(/\/wiki\/([A-Za-z0-9]+)/);
  if (wikiMatch) return { node_token: wikiMatch[1] };
  const docxMatch = url.match(/\/(?:docx|doc)\/([A-Za-z0-9]+)/);
  if (docxMatch) return { obj_token: docxMatch[1] };
  return null;
}

/** 判断当前是否在可尝试同步的飞书文档页。Base/多维表格仍走剪藏/AI，不走 /fetch 文档同步。 */
function isDocPage(): boolean {
  return /\/(wiki|docx|doc)\//.test(window.location.pathname);
}

/** 等待元素出现（飞书 SPA 异步渲染）。 */
function waitForElement(selector: string, timeout = 10000): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLElement>(selector);
    if (existing) return resolve(existing);

    const observer = new MutationObserver(() => {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/** 注入浮动按钮。 */
async function injectButton(): Promise<void> {
  if (document.getElementById(BUTTON_ID)) return;
  if (!isDocPage()) return;

  let mount = await waitForElement('.doc-title, .wiki-title, [data-testid="doc-title"]', 5000);
  if (!mount) {
    mount = document.body;
  }

  const btn = document.createElement('button');
  btn.id = BUTTON_ID;
  btn.textContent = '同步到 OB';
  btn.title = '预览并同步此飞书文档到 Obsidian';
  btn.className = 'feishu-sync-fab';
  btn.onclick = onSyncClick;

  if (mount === document.body) {
    document.body.appendChild(btn);
  } else {
    btn.style.marginLeft = '12px';
    mount.parentElement?.insertBefore(btn, mount.nextSibling);
  }
}

/** 按钮点击处理：只打开预览面板，不触发同步。 */
async function onSyncClick(event?: MouseEvent): Promise<void> {
  const tokenInfo = extractTokenFromUrl();
  if (!tokenInfo?.node_token && !tokenInfo?.obj_token) {
    openPanelShell('无法识别当前飞书文档 token', 'error');
    return;
  }

  // 普通点击：打开扩展侧边栏，由侧边栏读取目录树和执行同步。
  // Alt/Option 点击保留旧的页面内 HTTP 预览面板，便于调试。
  if (!event?.altKey) {
    chrome.runtime.sendMessage({
      type: 'feishu-sync-trigger',
      payload: {
        title: getDocumentTitle(),
        url: window.location.href,
        docToken: tokenInfo,
        domain: window.location.hostname,
      },
    }).catch(() => openPanelShell('扩展连接已失效，请刷新页面后重试。', 'error'));
    return;
  }

  const [config, propertyTemplate, propertyOptions, interpreter] = await Promise.all([
    loadConfig(),
    loadPropertyTemplate(),
    loadPropertyOptions(),
    loadInterpreterConfig(),
  ]);
  const nodeToken = tokenInfo.node_token || tokenInfo.obj_token!;
  const state: PreviewState = {
    config,
    propertyTemplate,
    propertyOptions,
    interpreter,
    tokenInfo,
    nodeToken,
    title: getDocumentTitle(),
    source: window.location.href,
    dirs: [],
    fallbackDir: '',
  };

  renderPreviewPanel(state, '正在加载目录和同步状态...', 'info');

  if (!config.token) {
    updatePanelStatus('请先在扩展弹窗配置 OB 插件地址和令牌', 'error');
    return;
  }

  try {
    const exists = await postExists(config, { node_token: nodeToken });
    if (exists.exists) {
      state.existingPath = exists.path;
      state.fallbackDir = dirname(exists.path);
    }
  } catch {
    state.existingPath = undefined;
  }

  try {
    const tree = await getTree(config);
    state.dirs = tree.dirs;
    state.fallbackDir = state.fallbackDir || tree.dirs[0]?.path || '';
  } catch (err) {
    state.treeError = err instanceof Error ? err.message : String(err);
  }

  renderPreviewPanel(state, getReadyMessage(state), state.treeError ? 'error' : 'idle');
}

function getDocumentTitle(): string {
  const candidates = [
    document.querySelector<HTMLElement>('.doc-title'),
    document.querySelector<HTMLElement>('.wiki-title'),
    document.querySelector<HTMLElement>('[data-testid="doc-title"]'),
    document.querySelector<HTMLElement>('h1'),
  ];
  const title = candidates
    .map((el) => el?.innerText?.trim())
    .find(Boolean);
  return title || document.title.replace(/\s*[-|].*$/, '').trim() || '未命名飞书文档';
}

function getDocumentExcerpt(limit = DEFAULT_AI_EXCERPT_CHARS): string {
  const candidates = [
    document.querySelector<HTMLElement>('[data-testid="doc-content"]'),
    document.querySelector<HTMLElement>('.docx-content'),
    document.querySelector<HTMLElement>('.wiki-content'),
    document.querySelector<HTMLElement>('.suite-web-doc-body'),
    document.querySelector<HTMLElement>('main'),
    document.body,
  ];
  const text = candidates
    .map((el) => el?.innerText || el?.textContent || '')
    .map((value) => value.replace(/\s+/g, ' ').trim())
    .find((value) => value.length > 80)
    || document.body.innerText.replace(/\s+/g, ' ').trim();
  return text.slice(0, limit);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'GET_FEISHU_DOC_EXCERPT') return false;
  const limit = Number(message.limit) || DEFAULT_AI_EXCERPT_CHARS;
  sendResponse({
    ok: true,
    title: getDocumentTitle(),
    excerpt: getDocumentExcerpt(limit),
  });
  return false;
});

function dirname(path?: string): string {
  if (!path) return '';
  const parts = path.split('/').filter(Boolean);
  if (parts.length <= 1) return '';
  return parts.slice(0, -1).join('/');
}

function getReadyMessage(state: PreviewState): string {
  if (state.treeError) {
    return `目录树加载失败，可手动填写目录：${state.treeError}`;
  }
  if (state.existingPath) {
    return `检测到已同步文件：${state.existingPath}，确认后将更新`;
  }
  return '请确认目录和属性，确认后开始同步';
}

function openPanelShell(message: string, type: StatusType): void {
  const config: SyncConfig = { host: '', port: 0, token: '' };
  const propertyTemplate = {
    标签: 'S',
    编码: '',
    输入: '',
    日期: '',
    日期索引: '',
    关键词: '',
    概述: '',
    评分: '',
    评分_显示: '',
    索引_知识库: '',
    索引_颜色: '',
    '索引_操作&反馈': '',
    索引_块: '',
    索引_风险: '',
  };
  renderPreviewPanel({
    config,
    propertyTemplate,
    propertyOptions: DEFAULT_PROPERTY_OPTIONS,
    interpreter: { ...DEFAULT_INTERPRETER_CONFIG, enabled: false, autoRun: false },
    tokenInfo: {},
    nodeToken: '',
    title: getDocumentTitle(),
    source: window.location.href,
    dirs: [],
    fallbackDir: '',
  }, message, type);
}

function renderPreviewPanel(state: PreviewState, statusMessage: string, statusType: StatusType): void {
  closePreviewPanel();

  const backdrop = document.createElement('div');
  backdrop.id = PANEL_BACKDROP_ID;
  backdrop.className = 'feishu-sync-panel-backdrop';

  const panel = document.createElement('aside');
  panel.id = PANEL_ID;
  panel.className = 'feishu-sync-panel';
  panel.setAttribute('aria-label', '同步到 Obsidian 预览面板');

  const header = document.createElement('div');
  header.className = 'feishu-sync-panel-header';
  header.innerHTML = `
    <div>
      <p class="feishu-sync-eyebrow">Obsidian Sync</p>
      <h2>同步前预览</h2>
    </div>
    <button class="feishu-sync-icon-btn" type="button" aria-label="关闭">×</button>
  `;

  const closeBtn = header.querySelector<HTMLButtonElement>('.feishu-sync-icon-btn')!;
  closeBtn.onclick = closePreviewPanel;

  const body = document.createElement('div');
  body.className = 'feishu-sync-panel-body';

  const summary = document.createElement('section');
  summary.className = 'feishu-sync-section';
  summary.innerHTML = `
    <div class="feishu-sync-doc-title">${escapeHtml(state.title)}</div>
    <a class="feishu-sync-source" href="${escapeAttribute(state.source)}" target="_blank" rel="noreferrer">${escapeHtml(state.source)}</a>
    <div class="feishu-sync-interpreter">${escapeHtml(getInterpreterSummary(state))}</div>
  `;

  const directory = document.createElement('section');
  directory.className = 'feishu-sync-section';
  directory.appendChild(createSectionTitle('目标目录'));
  directory.appendChild(createDirectoryControl(state));

  const formSection = document.createElement('section');
  formSection.className = 'feishu-sync-section';
  formSection.appendChild(createSectionTitle('YAML 属性'));
  formSection.appendChild(createMetaForm(state));

  const status = document.createElement('div');
  status.className = `feishu-sync-status feishu-sync-status-${statusType}`;
  status.dataset.status = 'true';
  status.textContent = statusMessage;

  body.append(summary, directory, formSection, status);

  const footer = document.createElement('div');
  footer.className = 'feishu-sync-panel-footer';
  footer.innerHTML = `
    <button class="feishu-sync-secondary" type="button">取消</button>
    <button class="feishu-sync-suggest" type="button">AI 建议</button>
    <button class="feishu-sync-primary" type="button">同步</button>
  `;
  const cancelBtn = footer.querySelector<HTMLButtonElement>('.feishu-sync-secondary')!;
  const suggestBtn = footer.querySelector<HTMLButtonElement>('.feishu-sync-suggest')!;
  const syncBtn = footer.querySelector<HTMLButtonElement>('.feishu-sync-primary')!;
  cancelBtn.onclick = closePreviewPanel;
  suggestBtn.onclick = () => suggestMeta(state);
  syncBtn.onclick = () => confirmSync(state);
  suggestBtn.disabled = !state.interpreter.enabled;
  syncBtn.disabled = !state.config.token || !state.nodeToken;

  panel.append(header, body, footer);
  backdrop.onclick = closePreviewPanel;
  document.body.append(backdrop, panel);
}

function createSectionTitle(title: string): HTMLElement {
  const heading = document.createElement('h3');
  heading.className = 'feishu-sync-section-title';
  heading.textContent = title;
  return heading;
}

function createDirectoryControl(state: PreviewState): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'feishu-sync-dir-control';

  if (state.dirs.length > 0) {
    const select = document.createElement('select');
    select.className = 'feishu-sync-dir-select';
    select.name = 'feishu-sync-dir';

    state.dirs.forEach((dir) => {
      const option = document.createElement('option');
      option.value = dir.path;
      option.textContent = `${dir.depth > 0 ? '  '.repeat(dir.depth - 1) : ''}${dir.label}`;
      option.selected = dir.path === state.fallbackDir;
      select.appendChild(option);
    });

    wrapper.appendChild(select);
    return wrapper;
  }

  const input = document.createElement('input');
  input.className = 'feishu-sync-dir-input';
  input.name = 'feishu-sync-dir';
  input.placeholder = '例如：0️⃣输入/💡碎片输入（闪念）';
  input.value = state.fallbackDir;
  wrapper.appendChild(input);
  return wrapper;
}

function createMetaForm(state: PreviewState): HTMLElement {
  const form = document.createElement('div');
  form.className = 'feishu-sync-meta-form';
  const defaults = getDefaultMeta(state);

  META_FIELDS.forEach((field) => {
    const row = document.createElement('label');
    row.className = `feishu-sync-field feishu-sync-field-${field.type}`;

    const label = document.createElement('span');
    label.className = 'feishu-sync-field-label';
    label.textContent = field.label;

    const control = createMetaControl(field, defaults[field.key], state.propertyOptions[field.key as keyof PropertyOptions]);
    row.append(label, control);

    if (field.help) {
      const help = document.createElement('small');
      help.textContent = field.help;
      row.appendChild(help);
    }

    form.appendChild(row);
  });

  return form;
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
    const optionValues = options.map((option) => normalizePropertyOptionValue(field.key, option));
    options.forEach((option, index) => appendOption(select, optionValues[index], option));
    const normalizedValue = normalizePropertyOptionValue(field.key, stringValue);
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
    wrapper.className = 'feishu-sync-option-input';
    const listId = `feishu-sync-options-${encodeURIComponent(field.key)}`;
    input.setAttribute('list', listId);
    const datalist = document.createElement('datalist');
    datalist.id = listId;
    options.forEach((option) => appendOption(datalist, option, option));
    wrapper.append(input, datalist);
    return wrapper;
  }

  return input;
}

function getDefaultMeta(state: PreviewState): SyncMeta {
  const today = new Date().toISOString().slice(0, 10);
  const keywords = draftKeywords(state.title);
  const templateVars: Record<string, string> = {
    title: state.title,
    url: state.source,
    date: today,
    dir: state.fallbackDir,
    keywords: keywords.join('、'),
  };

  return {
    标签: applyTemplate(state.propertyTemplate.标签 || 'S', templateVars),
    编码: applyTemplate(state.propertyTemplate.编码, templateVars),
    输入: applyTemplate(state.propertyTemplate.输入 || state.fallbackDir, templateVars),
    日期: applyTemplate(state.propertyTemplate.日期 || today, templateVars),
    日期索引: applyTemplate(state.propertyTemplate.日期索引, templateVars),
    关键词: applyTemplate(state.propertyTemplate.关键词 || keywords.join('、'), templateVars),
    概述: applyTemplate(state.propertyTemplate.概述, templateVars),
    评分: state.propertyTemplate.评分,
    评分_显示: applyTemplate(state.propertyTemplate.评分_显示, templateVars),
    索引_知识库: applyTemplate(state.propertyTemplate.索引_知识库, templateVars),
    索引_颜色: applyTemplate(state.propertyTemplate.索引_颜色, templateVars),
    '索引_操作&反馈': applyTemplate(state.propertyTemplate['索引_操作&反馈'], templateVars),
    索引_块: applyTemplate(state.propertyTemplate.索引_块, templateVars),
    索引_风险: applyTemplate(state.propertyTemplate.索引_风险, templateVars),
  };
}

function applyTemplate(template: string, vars: Record<string, string>): string {
  return String(template ?? '').replace(/\{\{(\w+)\}\}/g, (_full, key: string) => vars[key] ?? '');
}

function getInterpreterSummary(state: PreviewState): string {
  if (!state.interpreter.enabled) return '解释器：关闭。将仅使用属性模板预填。';
  const mode = state.interpreter.provider || '本地规则';
  return `解释器：${mode}${state.interpreter.autoRun ? '，已自动生成建议' : '，同步前可按模板手动确认'}`;
}

function draftKeywords(title: string): string[] {
  const words = title
    .replace(/[^\p{Script=Han}\p{Letter}\p{Number}]+/gu, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2);
  return Array.from(new Set(words)).slice(0, 6);
}

async function confirmSync(state: PreviewState): Promise<void> {
  const panel = document.getElementById(PANEL_ID);
  if (!panel) return;

  const syncBtn = panel.querySelector<HTMLButtonElement>('.feishu-sync-primary');
  const dirControl = panel.querySelector<HTMLInputElement | HTMLSelectElement>('[name="feishu-sync-dir"]');
  const dir = dirControl?.value.trim() || undefined;
  const meta = collectMeta(panel);

  if (!dir) {
    updatePanelStatus('请选择或填写目标目录后再同步。', 'error');
    return;
  }

  syncBtn!.disabled = true;
  updatePanelStatus('正在连接 OB 插件...', 'info');

  const conn = await testConnection(state.config);
  if (!conn.ok) {
    syncBtn!.disabled = false;
    updatePanelStatus(conn.message, 'error');
    return;
  }

  updatePanelStatus('正在抓取并写入 Obsidian...', 'info');

  try {
    const payload = {
      node_token: state.nodeToken,
      obj_token: state.tokenInfo.obj_token,
      dir,
      meta,
    };
    const result = await postFetch(state.config, payload);
    const codeMsg = result.编码 ? `（编码 ${result.编码}）` : '';
    updatePanelStatus(`${result.action === 'created' ? '已创建' : '已更新'}：${result.path}${codeMsg}`, 'success');
  } catch (err) {
    syncBtn!.disabled = false;
    updatePanelStatus(`同步失败：${err instanceof Error ? err.message : String(err)}`, 'error');
  }
}

function collectMeta(panel: HTMLElement): SyncMeta {
  const meta: SyncMeta = {};
  panel.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[data-meta-key]').forEach((control) => {
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

async function suggestMeta(state: PreviewState): Promise<void> {
  const panel = document.getElementById(PANEL_ID);
  if (!panel) return;
  const button = panel.querySelector<HTMLButtonElement>('.feishu-sync-suggest');
  const dirControl = panel.querySelector<HTMLInputElement | HTMLSelectElement>('[name="feishu-sync-dir"]');
  const dir = dirControl?.value.trim() || state.fallbackDir;

  if (button) button.disabled = true;
  updatePanelStatus('正在读取正文前段并生成 AI 标签与索引建议...', 'info');
  try {
    const excerpt = getDocumentExcerpt(state.interpreter.excerptChars || DEFAULT_AI_EXCERPT_CHARS);
    const suggestion = await suggestMetaWithInterpreter(state.interpreter, {
      title: state.title,
      source: state.source,
      dir,
      excerpt,
      template: state.propertyTemplate,
      options: state.propertyOptions,
    });
    applyMetaSuggestion(panel, suggestion);
    updatePanelStatus('AI 建议已填入，请人工确认后再同步。', 'success');
  } catch (err) {
    updatePanelStatus(`AI 建议失败：${err instanceof Error ? err.message : String(err)}`, 'error');
  } finally {
    if (button) button.disabled = false;
  }
}

function applyMetaSuggestion(panel: HTMLElement, suggestion: Record<string, unknown>): void {
  for (const [key, raw] of Object.entries(suggestion)) {
    const control = panel.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[data-meta-key="${cssEscape(key)}"]`);
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

function createGroupedControl(key: string, value: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'feishu-sync-grouped-control';

  const hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.dataset.metaKey = key;
  hidden.dataset.groupedMeta = 'true';
  wrapper.appendChild(hidden);

  const groups = GROUPED_FIELDS[key] ?? [];
  groups.forEach((group, groupIndex) => {
    const row = document.createElement('div');
    row.className = 'feishu-sync-choice-row';

    const title = document.createElement('span');
    title.className = 'feishu-sync-choice-title';
    title.textContent = group.name;
    row.appendChild(title);

    group.options.forEach((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'feishu-sync-choice-chip';
      button.textContent = option.label;
      button.dataset.groupIndex = String(groupIndex);
      button.dataset.value = option.value;
      button.addEventListener('click', () => {
        const active = button.classList.contains('is-selected');
        row.querySelectorAll<HTMLButtonElement>('.feishu-sync-choice-chip').forEach((chip) => chip.classList.remove('is-selected'));
        if (!active) button.classList.add('is-selected');
        syncGroupedHiddenValue(wrapper, hidden);
      });
      row.appendChild(button);
    });

    wrapper.appendChild(row);
  });

  setGroupedControlValue(hidden, key, value);
  return wrapper;
}

function setGroupedControlValue(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, key: string, value: string): void {
  const wrapper = control.closest<HTMLElement>('.feishu-sync-grouped-control');
  if (!wrapper) {
    control.value = value;
    return;
  }

  const selected = new Set(splitList(value).map((item) => normalizePropertyOptionValue(key, item)));
  wrapper.querySelectorAll<HTMLButtonElement>('.feishu-sync-choice-chip').forEach((chip) => {
    chip.classList.toggle('is-selected', selected.has(chip.dataset.value ?? ''));
  });
  syncGroupedHiddenValue(wrapper, control as HTMLInputElement);
}

function syncGroupedHiddenValue(wrapper: HTMLElement, hidden: HTMLInputElement): void {
  const values = Array.from(wrapper.querySelectorAll<HTMLButtonElement>('.feishu-sync-choice-chip.is-selected'))
    .map((chip) => chip.dataset.value ?? '')
    .filter(Boolean);
  hidden.value = values.join('、');
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

function updatePanelStatus(message: string, type: StatusType): void {
  const status = document.querySelector<HTMLElement>(`#${PANEL_ID} [data-status="true"]`);
  if (!status) return;
  status.textContent = message;
  status.className = `feishu-sync-status feishu-sync-status-${type}`;
}

function closePreviewPanel(): void {
  document.getElementById(PANEL_ID)?.remove();
  document.getElementById(PANEL_BACKDROP_ID)?.remove();
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

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, '&#096;');
}

/** 监听 SPA 路由变化。 */
let lastPath = '';
function watchRoute(): void {
  const check = () => {
    const path = window.location.pathname;
    if (path !== lastPath) {
      lastPath = path;
      document.getElementById(BUTTON_ID)?.remove();
      closePreviewPanel();
      if (isDocPage()) {
        setTimeout(injectButton, 1500);
      }
    }
  };

  window.addEventListener('popstate', check);
  window.addEventListener('hashchange', check);
  new MutationObserver(check).observe(document.body, { childList: true, subtree: true });

  check();
}

watchRoute();
console.log('[feishu-sync] content script loaded');
