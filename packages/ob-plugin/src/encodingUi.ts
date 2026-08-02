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
import { TAG_NAMES } from '@sync/shared';
import type { FeishuSyncPlugin } from './main.js';
import type {
  KnowledgeChangePlan,
  KnowledgeChangeScope as OrganizationScope,
  KnowledgeWorkflow,
} from './encodingWorkflow.js';
import {
  ALLOWED_TAGS,
  FILE_PREFIX_RE,
  FULL_ENCODING_RE,
  SHORT_ENCODING_RE,
  SHORT_FILE_PREFIX_RE,
  deriveShortEncoding,
} from './knowledgeContract.js';
import { openFolderEncodingPanel } from './folderEncodingUi.js';
import { isFolderEncodingExcluded } from './folderEncoding.js';
import { isProtectedDocumentPath } from './vaultStructure.js';
import { openFetchToDirectory } from './fetchEntrypoints.js';

export type OrganizationKind = OrganizationScope['kind'];
export type OrganizationMode = NonNullable<OrganizationScope['mode']>;

interface PluginWithKnowledgeWorkflow {
  knowledgeWorkflow: KnowledgeWorkflow;
}

const FILE_EXPLORER_SOURCE = 'file-explorer-context-menu';
const PROTECTED_PATH_RE = /^(?:(?:.*\/)?AGENTS(?:\.md)?$|🪧导引(?:\/|$)|3️⃣附件文件(?:\/|$)|\.[^/]+(?:\/|$))/;
const registeredPlugins = new WeakSet<FeishuSyncPlugin>();

/**
 * 只注册一套文件树标签整理菜单。
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
        if (target instanceof TFolder) {
          addClipMenuItem(menu, plugin, target.path);
          menu.addSeparator();
        }
        if (target instanceof TFolder
          && !isFolderEncodingExcluded(target.path, plugin.settings.folderAutoEncodingWhitelist)) {
          addFolderEncodingMenuItem(menu, plugin, target.path);
        }
        const title = kind === 'directory'
          ? '修改此目录标签（含子目录）…'
          : '修改此文档标签…';
        addTagAssignmentMenuItem(menu, plugin, [target.path], kind, title);
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
        addTagAssignmentMenuItem(
          menu,
          plugin,
          supportedTargets.map((target) => target.path),
          'selection',
          ignoredCount
            ? `修改所选内容标签（${supportedTargets.length}，已忽略 ${ignoredCount} 项）…`
            : '修改所选内容标签…',
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

function addTagAssignmentMenuItem(
  menu: Menu,
  plugin: FeishuSyncPlugin,
  paths: string[],
  kind: OrganizationKind,
  title: string,
): void {
  menu.addItem((item) => item
    .setTitle(title)
    .setIcon('tag')
    .onClick(() => {
      void openTagAssignmentPanel(plugin, paths, kind);
    }));
}

function addClipMenuItem(menu: Menu, plugin: FeishuSyncPlugin, directory: string): void {
  menu.addItem((item) => item
    .setTitle('剪藏到这里…')
    .setIcon('download')
    .onClick(() => openFetchToDirectory(plugin, directory)));
}

function addFolderEncodingMenuItem(menu: Menu, plugin: FeishuSyncPlugin, path: string): void {
  menu.addItem((item) => item
    .setTitle('整理此容器编码…')
    .setIcon('folder-cog')
    .onClick(() => {
      void openFolderEncodingPanel(plugin, path);
    }));
}

/**
 * 文件树右键的第一性原理入口：用户明确选择“这个范围应该属于哪个标签”。
 * 目录只定义递归范围，标签事实仍写入范围内 Markdown 的 YAML；目录名称本身不伪装成标签。
 */
export async function openTagAssignmentPanel(
  plugin: FeishuSyncPlugin,
  paths: string[],
  kind: OrganizationKind,
  depth: OrganizationScope['depth'] = kind === 'file' ? 'direct' : 'recursive',
): Promise<void> {
  const safePaths = uniquePaths(paths);
  if (safePaths.length === 0) {
    new Notice('⚠️ 没有可修改标签的 Markdown 文档或目录');
    return;
  }
  if (safePaths.some(isProtectedPath)) {
    new Notice('⛔ 受保护目录不能修改标签');
    return;
  }
  try {
    const workflow = knowledgeWorkflow(plugin);
    const scope: OrganizationScope = { kind, depth, mode: 'auto' };
    const plan = await workflow.previewTargets(safePaths, scope);
    new TagAssignmentModal(plugin.app, workflow, plan, safePaths, scope).open();
  } catch (error) {
    new Notice(`❌ 无法打开标签修改面板：${messageOf(error)}`);
  }
}

/**
 * 自动编码不会经过这里；右键只处理用户明确的标签归类与编码同步。
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

export class TagAssignmentModal extends Modal {
  private selectedTag: string;
  private previewPlan?: KnowledgeChangePlan;
  private previewArea?: HTMLElement;
  private applyButton?: HTMLButtonElement;
  private working = false;

  constructor(
    app: App,
    private readonly workflow: KnowledgeWorkflow,
    initialPlan: KnowledgeChangePlan,
    private readonly targets: string[],
    private readonly organizationScope: OrganizationScope,
  ) {
    super(app);
    this.selectedTag = inferCommonTag(initialPlan) ?? 'S';
  }

  onOpen(): void {
    this.titleEl.setText('修改标签');
    this.contentEl.empty();
    this.contentEl.createEl('p', {
      text: this.organizationScope.kind === 'directory'
        ? '选择一个标签，下面预览此目录及子目录中文档的修改结果。'
        : '选择一个标签，下面预览文档的修改结果。',
      cls: 'setting-item-description',
    });

    const field = this.contentEl.createDiv({ cls: 'fstb-advanced-row' });
    field.createEl('label', { text: '修改为标签' });
    const select = field.createEl('select', { attr: { 'aria-label': '修改为标签' } });
    for (const tag of ALLOWED_TAGS) {
      select.createEl('option', {
        value: tag,
        text: `${tag} · ${tagName(tag)}`,
      });
    }
    select.value = this.selectedTag;
    select.addEventListener('change', () => {
      this.selectedTag = select.value;
      void this.refreshPreview();
    });

    this.previewArea = this.contentEl.createDiv({ cls: 'fstb-tag-preview' });
    const actions = this.contentEl.createDiv({ cls: 'modal-button-container' });
    actions.createEl('button', { text: '取消' }).onclick = () => this.close();
    this.applyButton = actions.createEl('button', {
      text: '应用标签修改',
      cls: 'mod-cta',
    });
    this.applyButton.disabled = true;
    this.applyButton.onclick = () => {
      void this.commit();
    };

    void this.refreshPreview();
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private async refreshPreview(): Promise<void> {
    if (!this.previewArea) return;
    this.applyButton && (this.applyButton.disabled = true);
    this.previewArea.empty();
    this.previewArea.createEl('p', {
      text: `正在预览：${this.selectedTag} · ${tagName(this.selectedTag)}`,
      cls: 'setting-item-description',
    });
    try {
      this.previewPlan = await this.workflow.previewTargets(this.targets, {
        ...this.organizationScope,
        mode: 'auto',
        tagOverride: this.selectedTag,
      });
      this.renderPreview(this.previewPlan);
      if (this.applyButton) {
        this.applyButton.disabled = this.previewPlan.items.length === 0;
      }
    } catch (error) {
      this.previewArea.createEl('p', {
        text: `预览失败：${messageOf(error)}`,
        cls: 'fstb-plan-blockers',
      });
    }
  }

  private renderPreview(plan: KnowledgeChangePlan): void {
    if (!this.previewArea) return;
    this.previewArea.empty();
    this.previewArea.createEl('p', {
      text: plan.items.length
        ? `修改为 ${this.selectedTag} · ${tagName(this.selectedTag)}，共 ${plan.items.length} 篇文档`
        : '当前没有可修改的文档',
      cls: 'setting-item-description',
    });
    if (plan.items.length === 0) {
      this.previewArea.createEl('p', {
        text: plan.scannedCount === 0 ? '此范围没有可修改的 Markdown 文档。' : '请先选择其他标签，或关闭面板。',
        cls: 'setting-item-description',
      });
      return;
    }
    const list = this.previewArea.createDiv({ cls: 'fstb-encoding-preview-list' });
    for (const item of plan.items) {
      const row = list.createDiv({ cls: 'fstb-encoding-preview-row' });
      row.createEl('div', { text: displayPath(item.originalPath, item.shortCode) });
      row.createEl('div', {
        text: item.newPath === item.originalPath
          ? '→ 文件名不变，仅修改标签'
          : `→ ${displayPath(item.newPath, item.shortCode)}`,
        cls: 'setting-item-description',
      });
    }
  }

  private async commit(): Promise<void> {
    if (this.working || !this.previewPlan || this.previewPlan.items.length === 0) return;
    this.working = true;
    if (this.applyButton) this.applyButton.disabled = true;
    try {
      const result = await this.workflow.commitPlan(this.previewPlan.operationId);
      if (result.status !== 'committed') throw new Error('事务已回滚，文件未保持半完成状态');
      const skipped = this.previewPlan.blockedReasons.length;
      new Notice(
        `✅ 标签已修改为 ${this.selectedTag} · ${tagName(this.selectedTag)}：${result.changedPaths.length} 项`
        + (skipped ? `；${skipped} 项保留待处理` : ''),
      );
      this.close();
    } catch (error) {
      new Notice(`❌ 标签修改失败：${messageOf(error)}`);
      if (this.applyButton && this.contentEl.isConnected) this.applyButton.disabled = false;
    } finally {
      this.working = false;
    }
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
  return PROTECTED_PATH_RE.test(path.replace(/^\/+/, '')) || isProtectedDocumentPath(path);
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

function inferCommonTag(plan: KnowledgeChangePlan): string | undefined {
  const tags = plan.items
    .map((item) => item.code.match(/^\d{2}_\d{4}_([SXLZQJ])_/)?.[1] ?? item.recognition?.tag)
    .filter((tag): tag is string => Boolean(tag));
  const unique = [...new Set(tags)];
  return unique.length === 1 ? unique[0] : undefined;
}

function tagName(tag: string): string {
  return TAG_NAMES[tag as keyof typeof TAG_NAMES] ?? tag;
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
