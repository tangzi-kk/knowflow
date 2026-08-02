import {
  Modal,
  Notice,
  TFile,
  TFolder,
  type App,
  type EventRef,
  type Menu,
  type TAbstractFile,
} from 'obsidian';
import type { FeishuSyncPlugin } from './main.js';
import type {
  KnowledgeChangePlan,
  KnowledgeChangeScope as OrganizationScope,
  KnowledgeWorkflow,
} from './encodingWorkflow.js';
import {
  FILE_PREFIX_RE,
  FULL_ENCODING_RE,
  SHORT_ENCODING_RE,
  SHORT_FILE_PREFIX_RE,
  deriveShortEncoding,
} from './knowledgeContract.js';

export type OrganizationKind = OrganizationScope['kind'];
export type OrganizationMode = NonNullable<OrganizationScope['mode']>;

interface PluginWithKnowledgeWorkflow {
  knowledgeWorkflow: KnowledgeWorkflow;
}

const FILE_EXPLORER_SOURCE = 'file-explorer-context-menu';
const PROTECTED_PATH_RE = /^(?:(?:.*\/)?AGENTS\.md$|🪧导引(?:\/|$)|\.[^/]+(?:\/|$))/;
const registeredPlugins = new WeakSet<FeishuSyncPlugin>();

/**
 * 只注册一套文件树手动纠错菜单。
 *
 * 单个目标使用 `file-menu`，多选使用 Obsidian 官方 `files-menu`；两者都严格
 * 限定 File Explorer 来源，不向编辑器、链接或其他菜单注入入口。
 */
export function registerEncodingContextMenu(plugin: FeishuSyncPlugin): void {
  if (registeredPlugins.has(plugin)) return;
  const eventRefs: EventRef[] = [];
  try {
    eventRefs.push(plugin.app.workspace.on(
      'file-menu',
      (menu, target, source) => {
        if (source !== FILE_EXPLORER_SOURCE || !isSupportedSingleTarget(target)) return;
        if (isProtectedPath(target.path)) return;

        const kind: OrganizationKind = target instanceof TFolder ? 'directory' : 'file';
        const title = kind === 'directory'
          ? 'KnowFlow：检查并纠正此目录…'
          : 'KnowFlow：纠正此文档…';
        addOrganizationMenuItem(menu, plugin, [target.path], kind, title);
      },
    ));

    eventRefs.push(plugin.app.workspace.on(
      'files-menu',
      (menu, targets, source) => {
        if (source !== FILE_EXPLORER_SOURCE || targets.length < 2) return;
        const supportedTargets = targets
          .filter(isSupportedSelectionTarget)
          .filter((target) => !isProtectedPath(target.path));
        if (supportedTargets.length === 0) return;
        const ignoredCount = targets.length - supportedTargets.length;
        addOrganizationMenuItem(
          menu,
          plugin,
          supportedTargets.map((target) => target.path),
          'selection',
          ignoredCount
            ? `KnowFlow：检查并纠正所选内容（${supportedTargets.length}，已忽略 ${ignoredCount} 项）…`
            : 'KnowFlow：检查并纠正所选内容…',
        );
      },
    ));
    eventRefs.forEach((eventRef) => plugin.registerEvent(eventRef));
    registeredPlugins.add(plugin);
  } catch (error) {
    eventRefs.forEach((eventRef) => plugin.app.workspace.offref(eventRef));
    throw error;
  }
}

export async function openOrganizationPreview(
  plugin: FeishuSyncPlugin,
  paths: string[],
  kind: OrganizationKind,
  mode: OrganizationMode = 'organize',
  depth: OrganizationScope['depth'] = kind === 'file' ? 'direct' : 'recursive',
  manualCode?: string,
): Promise<void> {
  const safePaths = uniquePaths(paths);
  if (safePaths.length === 0) {
    new Notice('⚠️ 没有可整理的 Markdown 文档或目录');
    return;
  }
  if (safePaths.some(isProtectedPath)) {
    new Notice('⛔ 受保护目录不能进入整理事务');
    return;
  }

  try {
    const workflow = knowledgeWorkflow(plugin);
    const scope: OrganizationScope = {
      kind,
      depth,
      mode,
      ...(manualCode ? { manualCode } : {}),
    };
    const plan = await workflow.previewTargets(safePaths, scope);
    new PreviewModal(plugin.app, workflow, plan, safePaths, scope).open();
  } catch (error) {
    new Notice(`❌ 无法生成整理预览：${messageOf(error)}`);
  }
}

/**
 * 全库入口：一次扫描所有可整理 Markdown，自动识别标签并直接执行安全项。
 * 空路径代表 Vault 根目录；异常项会跳过并提示用户使用右键手动修正。
 */
export async function openAutoRecognitionPreview(plugin: FeishuSyncPlugin): Promise<void> {
  new Notice('🤖 正在自动识别并编码全库 Markdown，请稍候…');
  try {
    const plan = await knowledgeWorkflow(plugin).previewTargets([''], {
      kind: 'directory',
      depth: 'recursive',
      mode: 'auto',
    });
    // 自动模式会把每个冲突同时记录为 blocker 和 conflict；以 blocker 计数，避免同一篇重复提示。
    const skipped = plan.blockedReasons.length;
    if (plan.items.length === 0) {
      new Notice(skipped ? `⚠️ 自动编码跳过 ${skipped} 项，请右键手动修正` : '✅ 全库已完成编码，无需处理');
      return;
    }
    const result = await plugin.commitAutomaticKnowledgePlan(plan);
    new Notice(
      `✅ 全库自动编码完成：${result.changedPaths.length} 篇`
      + (skipped ? `；${skipped} 项跳过，请右键手动修正` : ''),
    );
  } catch (error) {
    new Notice(`⚠️ 全库自动编码失败：${messageOf(error)}；可右键手动修正`);
  }
}

function addOrganizationMenuItem(
  menu: Menu,
  plugin: FeishuSyncPlugin,
  paths: string[],
  kind: OrganizationKind,
  title: string,
): void {
  menu.addItem((item) => item
    .setTitle(title)
    .setIcon('list-checks')
    .onClick(() => {
      void openCorrectionPanel(plugin, paths, kind);
    }));
}

/**
 * 文件树右键的唯一入口：先给出当前对象的异常与短编码建议，再由用户明确应用纠错。
 * 自动编码不会经过这里；右键只处理自动流程跳过或用户认为识别不准的对象。
 */
export async function openCorrectionPanel(
  plugin: FeishuSyncPlugin,
  paths: string[],
  kind: OrganizationKind,
  depth: OrganizationScope['depth'] = kind === 'file' ? 'direct' : 'recursive',
): Promise<void> {
  const safePaths = uniquePaths(paths);
  if (safePaths.length === 0) {
    new Notice('⚠️ 没有可纠正的 Markdown 文档或目录');
    return;
  }
  if (safePaths.some(isProtectedPath)) {
    new Notice('⛔ 受保护目录不能进入纠错面板');
    return;
  }
  try {
    const workflow = knowledgeWorkflow(plugin);
    const scope: OrganizationScope = { kind, depth, mode: 'auto' };
    const plan = await workflow.previewTargets(safePaths, scope);
    new CorrectionModal(plugin.app, workflow, plan, safePaths, scope).open();
  } catch (error) {
    new Notice(`❌ 无法打开纠错面板：${messageOf(error)}`);
  }
}

export class CorrectionModal extends Modal {
  private committing = false;
  private shortInput?: HTMLInputElement;
  private applyButton?: HTMLButtonElement;

  constructor(
    app: App,
    private readonly workflow: KnowledgeWorkflow,
    private readonly plan: KnowledgeChangePlan,
    private readonly targets: string[],
    private readonly organizationScope: OrganizationScope,
  ) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText('KnowFlow 编码纠错');
    this.render();
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private render(): void {
    this.contentEl.empty();
    const isSingleFile = this.organizationScope.kind === 'file' && this.targets.length === 1;
    this.contentEl.createEl('p', {
      text: isSingleFile
        ? '这里处理自动编码跳过或识别不准的文档。日常编码无需打开此面板。'
        : `检查${scopeLabel(this.organizationScope.kind)}：安全项可一次应用，异常项请继续右键单篇纠正。`,
      cls: 'setting-item-description',
    });

    const current = this.plan.items[0];
    if (isSingleFile) {
      const currentShortCode = shortCodeFromPath(this.targets[0]) || current?.shortCode || '';
      const currentRow = this.contentEl.createDiv({ cls: 'fstb-correction-current' });
      currentRow.createEl('strong', { text: '当前短编码：' });
      currentRow.createEl('code', { text: currentShortCode || '未编码' });

      const field = this.contentEl.createDiv({ cls: 'fstb-advanced-row' });
      field.createEl('label', { text: '修正为短编码' });
      this.shortInput = field.createEl('input', {
        type: 'text',
        placeholder: '例如 S01.a1',
      });
      this.shortInput.value = current?.shortCode || currentShortCode;
      this.shortInput.setAttribute('aria-label', '修正为短编码');
      this.shortInput.addEventListener('input', () => {
        if (this.applyButton) {
          this.applyButton.disabled = !isManualCodeInput(this.shortInput?.value.trim() ?? '');
        }
      });
      field.createEl('span', {
        text: '保存后会自动按文档日期展开为完整编码。',
        cls: 'setting-item-description',
      });
    }

    renderMessages(this.contentEl, '需要处理', this.plan.blockedReasons, 'fstb-plan-blockers');
    renderMessages(this.contentEl, '路径冲突', this.plan.conflicts, 'fstb-plan-conflicts');
    renderMessages(this.contentEl, '提示', this.plan.warnings, 'fstb-plan-warnings');

    const list = this.contentEl.createDiv({ cls: 'fstb-encoding-preview-list' });
    for (const item of this.plan.items) {
      const row = list.createDiv({ cls: 'fstb-encoding-preview-row' });
      row.createEl('div', { text: displayPath(item.originalPath, item.shortCode) });
      row.createEl('div', {
        text: item.newPath === item.originalPath
          ? '→ 更新属性/索引'
          : `→ ${displayPath(item.newPath, item.shortCode)}`,
        cls: 'setting-item-description',
      });
      row.createEl('code', { text: item.shortCode || '无编码' });
      renderCodeDetails(row, item);
      if (item.recognition) {
        row.createEl('span', {
          text: `识别：${item.recognition.tag} · ${confidenceLabel(item.recognition.confidence)}`,
          cls: 'setting-item-description',
        });
      }
    }

    const actions = this.contentEl.createDiv({ cls: 'modal-button-container' });
    actions.createEl('button', { text: '取消' }).onclick = () => this.close();
    if (isSingleFile) {
      const clear = actions.createEl('button', { text: '清除编码…', cls: 'mod-warning' });
      clear.onclick = () => {
        new ClearCodeConfirmModal(this.app, async () => {
          this.close();
          await openPreviewWithWorkflow(
            this.app,
            this.workflow,
            this.targets,
            { ...this.organizationScope, mode: 'clear', manualCode: undefined },
          );
        }).open();
      };
    }
    this.applyButton = actions.createEl('button', {
      text: isSingleFile ? '应用纠错' : '应用安全项',
      cls: 'mod-cta',
    });
    this.applyButton.disabled = isSingleFile
      ? !isManualCodeInput(this.shortInput?.value.trim() ?? '')
      : this.plan.items.length === 0;
    this.applyButton.onclick = () => {
      if (this.applyButton) void this.commit(this.applyButton, isSingleFile);
    };
  }

  private async commit(button: HTMLButtonElement, isSingleFile: boolean): Promise<void> {
    if (this.committing) return;
    this.committing = true;
    button.disabled = true;
    try {
      let operationId = this.plan.operationId;
      if (isSingleFile) {
        const shortCode = this.shortInput?.value.trim() ?? '';
        if (!isManualCodeInput(shortCode)) {
          new Notice('⚠️ 请输入合法短编码，例如 S01.a1');
          return;
        }
        const normalizedShortCode = FULL_ENCODING_RE.test(shortCode)
          ? deriveShortEncoding(shortCode)
          : shortCode;
        if (this.shortInput && normalizedShortCode !== shortCode) this.shortInput.value = normalizedShortCode;
        const manualPlan = await this.workflow.previewTargets(this.targets, {
          ...this.organizationScope,
          mode: 'manual',
          manualCode: normalizedShortCode,
        });
        if (manualPlan.blockedReasons.length || manualPlan.conflicts.length || manualPlan.items.length === 0) {
          renderMessages(this.contentEl, '无法应用', manualPlan.blockedReasons, 'fstb-plan-blockers');
          renderMessages(this.contentEl, '路径冲突', manualPlan.conflicts, 'fstb-plan-conflicts');
          new Notice('⚠️ 这组短编码无法应用，请根据原因修改');
          return;
        }
        operationId = manualPlan.operationId;
      }

      const result = await this.workflow.commitPlan(operationId);
      if (result.status !== 'committed') throw new Error('事务已回滚，文件未保持半完成状态');
      new Notice(`✅ 编码纠正完成：${result.changedPaths.length} 项`);
      this.close();
    } catch (error) {
      new Notice(`❌ 编码纠正失败：${messageOf(error)}`);
    } finally {
      this.committing = false;
      if (this.applyButton && this.contentEl.isConnected) {
        this.applyButton.disabled = isSingleFile
          ? !isManualCodeInput(this.shortInput?.value.trim() ?? '')
          : this.plan.items.length === 0;
      }
    }
  }
}

export class PreviewModal extends Modal {
  private committing = false;

  constructor(
    app: App,
    private readonly workflow: KnowledgeWorkflow,
    private readonly plan: KnowledgeChangePlan,
    private readonly targets: string[],
    private readonly organizationScope: OrganizationScope,
    private readonly onCommitted?: (operationId: string) => void,
  ) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText(previewTitle(this.organizationScope.mode));
    this.render();
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private render(): void {
    this.contentEl.empty();
    this.contentEl.createEl('p', {
      text: `目标 ${this.targets.length} · 待处理 ${this.plan.items.length} · 跳过 ${this.plan.skipped}`,
      cls: 'setting-item-description',
    });
    this.contentEl.createEl('p', {
      text: `范围：${scopeLabel(this.organizationScope.kind)}${this.organizationScope.depth === 'recursive' ? '，递归全库' : '，仅直属层'}`,
      cls: 'setting-item-description',
    });

    renderMessages(this.contentEl, '阻断', this.plan.blockedReasons, 'fstb-plan-blockers');
    renderMessages(this.contentEl, '冲突', this.plan.conflicts, 'fstb-plan-conflicts');
    renderMessages(this.contentEl, '警告', this.plan.warnings, 'fstb-plan-warnings');

    const list = this.contentEl.createEl('div', { cls: 'fstb-encoding-preview-list' });
    for (const item of this.plan.items) {
      const row = list.createEl('div', { cls: 'fstb-encoding-preview-row' });
      row.createEl('div', { text: displayPath(item.originalPath, item.shortCode) });
      row.createEl('div', {
        text: item.newPath === item.originalPath
          ? '→ 更新属性/索引'
          : `→ ${displayPath(item.newPath, item.shortCode)}`,
        cls: 'setting-item-description',
      });
      row.createEl('code', { text: item.shortCode || '无编码' });
      renderCodeDetails(row, item);
      if (item.recognition) {
        row.createEl('span', {
          text: `识别：${item.recognition.tag} · ${confidenceLabel(item.recognition.confidence)}`,
          cls: 'setting-item-description',
        });
      }
    }

    if (this.organizationScope.mode === 'organize') {
      this.renderAdvancedActions();
    }

    const actions = this.contentEl.createEl('div', { cls: 'modal-button-container' });
    const cancel = actions.createEl('button', { text: '取消' });
    cancel.onclick = () => this.close();
    const confirm = actions.createEl('button', {
      text: this.organizationScope.mode === 'clear'
        ? '确认清除'
        : this.organizationScope.mode === 'auto' && this.plan.blockedReasons.length
          ? '确认执行可行项'
          : '确认执行',
      cls: 'mod-cta',
    });
    const blocked = this.plan.items.length === 0
      || (this.plan.blockedReasons.length > 0 && this.organizationScope.mode !== 'auto')
      || (this.plan.conflicts.length > 0 && this.organizationScope.mode !== 'auto');
    confirm.disabled = blocked;
    confirm.onclick = () => {
      void this.commit(confirm);
    };
  }

  private renderAdvancedActions(): void {
    const details = this.contentEl.createEl('details', { cls: 'fstb-advanced-actions' });
    details.createEl('summary', { text: '高级操作' });
    details.createEl('p', {
      text: '高级操作仍会重新生成预览，不会绕过事务直接写入。',
      cls: 'setting-item-description',
    });

    const manualRow = details.createDiv({ cls: 'fstb-advanced-row' });
    const input = manualRow.createEl('input', {
      type: 'text',
      placeholder: '短编码 S01.a1（也可粘贴完整编码）',
    });
    const manual = manualRow.createEl('button', { text: '手动指定短编码…' });
    manual.onclick = () => {
      const code = input.value.trim();
      if (!code) {
        new Notice('⚠️ 请先输入短编码或完整编码');
        return;
      }
      this.close();
      void openPreviewWithWorkflow(
        this.app,
        this.workflow,
        this.targets,
        { ...this.organizationScope, mode: 'manual', manualCode: code },
      );
    };

    const clear = details.createEl('button', {
      text: '彻底清除编码…',
      cls: 'mod-warning',
    });
    clear.onclick = () => {
      new ClearCodeConfirmModal(this.app, async () => {
        this.close();
        await openPreviewWithWorkflow(
          this.app,
          this.workflow,
          this.targets,
          { ...this.organizationScope, mode: 'clear', manualCode: undefined },
        );
      }).open();
    };
  }

  private async commit(button: HTMLButtonElement): Promise<void> {
    if (this.committing) return;
    this.committing = true;
    button.disabled = true;
    try {
      const result = await this.workflow.commitPlan(this.plan.operationId);
      if (result.status !== 'committed') {
        throw new Error('事务已回滚，文件未保持半完成状态');
      }
      const blockedNote = this.plan.blockedReasons.length
        ? `，另有 ${this.plan.blockedReasons.length} 项保留待处理`
        : '';
      new Notice(`✅ 整理事务已完成${result.changedPaths.length ? `：${result.changedPaths.length} 项` : ''}${blockedNote}`);
      this.onCommitted?.(this.plan.operationId);
      this.close();
    } catch (error) {
      new Notice(`❌ 整理事务失败：${messageOf(error)}`);
      button.disabled = (this.plan.blockedReasons.length > 0 && this.organizationScope.mode !== 'auto')
        || (this.plan.conflicts.length > 0 && this.organizationScope.mode !== 'auto');
    } finally {
      this.committing = false;
    }
  }
}

class ClearCodeConfirmModal extends Modal {
  constructor(app: App, private readonly confirm: () => Promise<void>) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText('确认彻底清除编码');
    this.contentEl.createEl('p', {
      text: '此操作会同时移除文件名编码与文档属性中的编码/短编码。下一步仍会展示最终变更预览。',
      cls: 'mod-warning',
    });
    const actions = this.contentEl.createEl('div', { cls: 'modal-button-container' });
    actions.createEl('button', { text: '返回' }).onclick = () => this.close();
    actions.createEl('button', { text: '继续生成清除预览', cls: 'mod-warning' }).onclick = () => {
      this.close();
      void this.confirm();
    };
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

async function openPreviewWithWorkflow(
  app: App,
  workflow: KnowledgeWorkflow,
  targets: string[],
  scope: OrganizationScope,
): Promise<void> {
  try {
    const plan = await workflow.previewTargets(targets, scope);
    new PreviewModal(app, workflow, plan, targets, scope).open();
  } catch (error) {
    new Notice(`❌ 无法生成整理预览：${messageOf(error)}`);
  }
}

function knowledgeWorkflow(plugin: FeishuSyncPlugin): KnowledgeWorkflow {
  const candidate = (plugin as FeishuSyncPlugin & Partial<PluginWithKnowledgeWorkflow>).knowledgeWorkflow;
  if (!candidate) {
    throw new Error('KnowFlow 事务核心尚未初始化');
  }
  return candidate;
}

function isSupportedSingleTarget(target: TAbstractFile): target is TFile | TFolder {
  return target instanceof TFolder
    || (target instanceof TFile && target.extension.toLowerCase() === 'md');
}

function isSupportedSelectionTarget(target: TAbstractFile): target is TFile | TFolder {
  return isSupportedSingleTarget(target);
}

export function isProtectedPath(path: string): boolean {
  return PROTECTED_PATH_RE.test(path.replace(/^\/+/, ''));
}

function uniquePaths(paths: string[]): string[] {
  // Obsidian 以空路径表示 Vault 根目录，不能把它当成无效目标过滤掉。
  return [...new Set(paths.map((path) => path.trim()))];
}

function renderMessages(
  container: HTMLElement,
  label: string,
  messages: string[],
  className: string,
): void {
  if (messages.length === 0) return;
  const section = container.createDiv({ cls: className });
  section.createEl('strong', { text: `${label}（${messages.length}）：` });
  section.createEl('span', { text: messages.map(displayMessage).join('；') });
}

function renderCodeDetails(container: HTMLElement, item: KnowledgeChangePlan['items'][number]): void {
  if (!item.code) return;
  const details = container.createEl('details', { cls: 'fstb-code-details' });
  details.createEl('summary', { text: '查看完整编码' });
  details.createEl('div', { text: `完整编码（后端）：${item.code}` });
  details.createEl('div', { text: `YAML 编码：${item.code} · 短编码：${item.shortCode}` });
  details.createEl('div', { text: `文件名显示：${item.newPath}` });
}

function displayPath(path: string, shortCode?: string): string {
  const slash = path.lastIndexOf('/');
  const directory = slash >= 0 ? path.slice(0, slash + 1) : '';
  const basename = slash >= 0 ? path.slice(slash + 1) : path;
  const fullCode = basename.match(FILE_PREFIX_RE)?.[1];
  const visibleCode = fullCode
    ? deriveShortEncoding(fullCode)
    : basename.match(SHORT_FILE_PREFIX_RE)?.[1] ?? shortCode;
  if (!visibleCode) return path;
  return directory + basename
    .replace(FILE_PREFIX_RE, `${visibleCode} `)
    .replace(SHORT_FILE_PREFIX_RE, `${visibleCode} `);
}

function shortCodeFromPath(path: string): string {
  const basename = path.split('/').pop() ?? path;
  const fullCode = basename.match(FILE_PREFIX_RE)?.[1];
  if (fullCode) return deriveShortEncoding(fullCode);
  return basename.match(SHORT_FILE_PREFIX_RE)?.[1] ?? '';
}

function displayMessage(message: string): string {
  return message.replace(
    /\b\d{2}_\d{4}_[SXLZQJ]_\d{2}_[a-z]\d+(?:[a-z]\d+)*\b/g,
    (fullCode) => {
      try {
        return deriveShortEncoding(fullCode);
      } catch {
        return fullCode;
      }
    },
  );
}

function isManualCodeInput(value: string): boolean {
  return SHORT_ENCODING_RE.test(value) || FULL_ENCODING_RE.test(value);
}

function scopeLabel(kind: OrganizationKind): string {
  if (kind === 'file') return '单个文档';
  if (kind === 'directory') return '目录';
  return '所选内容';
}

function confidenceLabel(confidence: 'high' | 'medium' | 'low'): string {
  if (confidence === 'high') return '高置信度';
  if (confidence === 'medium') return '中置信度';
  return '低置信度回退';
}

function previewTitle(mode: OrganizationMode | undefined): string {
  if (mode === 'clear') return '清除编码预览';
  if (mode === 'manual') return '手动编码预览';
  if (mode === 'auto') return '全库自动识别与编码预览';
  return '整理变更预览';
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
