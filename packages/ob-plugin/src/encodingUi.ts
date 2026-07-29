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

export type OrganizationKind = OrganizationScope['kind'];
export type OrganizationMode = NonNullable<OrganizationScope['mode']>;

interface PluginWithKnowledgeWorkflow {
  knowledgeWorkflow: KnowledgeWorkflow;
}

const FILE_EXPLORER_SOURCE = 'file-explorer-context-menu';
const PROTECTED_PATH_RE = /^(?:AGENTS\.md$|🪧导引(?:\/|$)|\.[^/]+(?:\/|$))/;
const registeredPlugins = new WeakSet<FeishuSyncPlugin>();

/**
 * 只注册一套文件树整理菜单。
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
        const title = kind === 'directory' ? 'KnowFlow：整理此目录…' : 'KnowFlow：整理此文档…';
        addOrganizationMenuItem(menu, plugin, [target.path], kind, title);
      },
    ));

    eventRefs.push(plugin.app.workspace.on(
      'files-menu',
      (menu, targets, source) => {
        if (source !== FILE_EXPLORER_SOURCE || targets.length < 2) return;
        if (targets.some((target) => isProtectedPath(target.path))) return;

        const supportedTargets = targets.filter(isSupportedSelectionTarget);
        if (supportedTargets.length === 0) return;
        addOrganizationMenuItem(
          menu,
          plugin,
          targets.map((target) => target.path),
          'selection',
          'KnowFlow：整理所选内容…',
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
      depth: 'direct',
      mode,
      ...(manualCode ? { manualCode } : {}),
    };
    const plan = await workflow.previewTargets(safePaths, scope);
    new PreviewModal(plugin.app, workflow, plan, safePaths, scope).open();
  } catch (error) {
    new Notice(`❌ 无法生成整理预览：${messageOf(error)}`);
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
      void openOrganizationPreview(plugin, paths, kind);
    }));
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
      text: `范围：${scopeLabel(this.organizationScope.kind)}，仅直属层（不会递归）`,
      cls: 'setting-item-description',
    });

    renderMessages(this.contentEl, '阻断', this.plan.blockedReasons, 'fstb-plan-blockers');
    renderMessages(this.contentEl, '冲突', this.plan.conflicts, 'fstb-plan-conflicts');
    renderMessages(this.contentEl, '警告', this.plan.warnings, 'fstb-plan-warnings');

    const list = this.contentEl.createEl('div', { cls: 'fstb-encoding-preview-list' });
    for (const item of this.plan.items) {
      const currentPath = item.originalPath;
      const targetPath = item.newPath;
      const row = list.createEl('div', { cls: 'fstb-encoding-preview-row' });
      row.createEl('div', { text: currentPath });
      row.createEl('div', {
        text: targetPath === currentPath ? '→ 更新属性/索引' : `→ ${targetPath}`,
        cls: 'setting-item-description',
      });
      if (item.code) {
        row.createEl('code', { text: item.code });
      }
    }

    if (this.organizationScope.mode === 'organize') {
      this.renderAdvancedActions();
    }

    const actions = this.contentEl.createEl('div', { cls: 'modal-button-container' });
    const cancel = actions.createEl('button', { text: '取消' });
    cancel.onclick = () => this.close();
    const confirm = actions.createEl('button', {
      text: this.organizationScope.mode === 'clear' ? '确认清除' : '确认执行',
      cls: 'mod-cta',
    });
    const blocked = this.plan.items.length === 0
      || this.plan.blockedReasons.length > 0
      || this.plan.conflicts.length > 0;
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
      placeholder: '完整编码 YY_MMDD_TAG_TOPIC_LEVEL',
    });
    const manual = manualRow.createEl('button', { text: '手动指定编码…' });
    manual.onclick = () => {
      const code = input.value.trim();
      if (!code) {
        new Notice('⚠️ 请先输入完整编码');
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
      new Notice(`✅ 整理事务已完成${result.changedPaths.length ? `：${result.changedPaths.length} 项` : ''}`);
      this.onCommitted?.(this.plan.operationId);
      this.close();
    } catch (error) {
      new Notice(`❌ 整理事务失败：${messageOf(error)}`);
      button.disabled = this.plan.blockedReasons.length > 0 || this.plan.conflicts.length > 0;
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
  return target instanceof TFolder || (target instanceof TFile && target.extension === 'md');
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
  section.createEl('strong', { text: `${label}：` });
  section.createEl('span', { text: messages.join('；') });
}

function scopeLabel(kind: OrganizationKind): string {
  if (kind === 'file') return '单个文档';
  if (kind === 'directory') return '目录';
  return '所选内容';
}

function previewTitle(mode: OrganizationMode | undefined): string {
  if (mode === 'clear') return '清除编码预览';
  if (mode === 'manual') return '手动编码预览';
  return '整理变更预览';
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
