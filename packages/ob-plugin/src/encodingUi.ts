import { Modal, Notice, TFile, TFolder, type App } from 'obsidian';
import type { FeishuSyncPlugin } from './main.js';
import {
  createEncodingWorkflow,
  type EncodingPlan,
  type EncodingWorkflow,
} from './encodingWorkflow.js';

export class PreviewModal extends Modal {
  private applying = false;

  constructor(
    app: App,
    private readonly workflow: EncodingWorkflow,
    private readonly plan: EncodingPlan,
  ) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText('编码变更预览');
    this.render();
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private render(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('p', {
      text: `待编码 ${this.plan.items.length}，已跳过 ${this.plan.skipped}`,
      cls: 'setting-item-description',
    });

    if (this.plan.conflicts.length > 0) {
      contentEl.createEl('p', {
        text: `存在路径冲突：${this.plan.conflicts.join('、')}`,
        cls: 'mod-warning',
      });
    }

    const list = contentEl.createEl('div', { cls: 'fstb-encoding-preview-list' });
    for (const item of this.plan.items) {
      const row = list.createEl('div', { cls: 'fstb-encoding-preview-row' });
      row.createEl('div', { text: item.originalPath });
      row.createEl('div', {
        text: `→ ${item.newPath}`,
        cls: 'setting-item-description',
      });
    }

    if (this.plan.items.length === 0) {
      contentEl.createEl('p', { text: '没有需要应用的编码变更。' });
      return;
    }

    const actions = contentEl.createEl('div', { cls: 'modal-button-container' });
    const cancel = actions.createEl('button', { text: '取消' });
    cancel.onclick = () => this.close();
    const confirm = actions.createEl('button', {
      text: '确认应用',
      cls: 'mod-cta',
    });
    confirm.disabled = this.plan.conflicts.length > 0;
    confirm.onclick = async () => {
      if (this.applying) return;
      this.applying = true;
      confirm.disabled = true;
      try {
        const result = await this.workflow.apply(this.plan);
        new Notice(`🔢 编码分配：${result.assigned}/${result.total}`);
        this.close();
      } catch (error) {
        new Notice(`❌ 编码应用失败：${error instanceof Error ? error.message : String(error)}`);
        confirm.disabled = this.plan.conflicts.length > 0;
      } finally {
        this.applying = false;
      }
    };
  }
}

export class LayerSortModal extends Modal {
  private readonly orderedPaths: string[];

  constructor(
    app: App,
    private readonly workflow: EncodingWorkflow,
    private readonly directory: string,
    plan: EncodingPlan,
  ) {
    super(app);
    this.orderedPaths = plan.items.map((item) => item.originalPath);
  }

  onOpen(): void {
    this.titleEl.setText('编码顺序调整');
    this.renderRows();
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private renderRows(): void {
    this.contentEl.empty();
    this.contentEl.createEl('p', {
      text: '调整顺序后会重新生成预览；此窗口不会修改文件。',
      cls: 'setting-item-description',
    });
    this.orderedPaths.forEach((path, index) => {
      const row = this.contentEl.createEl('div', { cls: 'setting-item' });
      row.createEl('span', { text: path });
      const controls = row.createEl('div', { cls: 'setting-item-control' });
      const up = controls.createEl('button', { text: '↑' });
      up.disabled = index === 0;
      up.onclick = () => this.move(index, index - 1);
      const down = controls.createEl('button', { text: '↓' });
      down.disabled = index === this.orderedPaths.length - 1;
      down.onclick = () => this.move(index, index + 1);
    });

    const actions = this.contentEl.createEl('div', { cls: 'modal-button-container' });
    const preview = actions.createEl('button', { text: '生成预览', cls: 'mod-cta' });
    preview.onclick = async () => {
      const plan = await this.workflow.previewDirectory(this.directory, this.orderedPaths);
      this.close();
      new PreviewModal(this.app, this.workflow, plan).open();
    };
  }

  private move(from: number, to: number): void {
    if (to < 0 || to >= this.orderedPaths.length) return;
    const [path] = this.orderedPaths.splice(from, 1);
    this.orderedPaths.splice(to, 0, path);
    this.renderRows();
  }
}

export class StructureContainerModal extends Modal {
  constructor(
    app: App,
    private readonly workflow: EncodingWorkflow,
    private readonly plan: EncodingPlan,
  ) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText('编码结构预览');
    const groups = new Map<string, typeof this.plan.items>();
    for (const item of this.plan.items) {
      const group = groups.get(item.tag) ?? [];
      group.push(item);
      groups.set(item.tag, group);
    }
    for (const [tag, items] of groups) {
      this.contentEl.createEl('h4', { text: `${tag} · ${items.length}` });
      const list = this.contentEl.createEl('ul');
      for (const item of items) {
        list.createEl('li', { text: `${item.code}  ${item.originalPath}` });
      }
    }
    const preview = this.contentEl.createEl('button', {
      text: '进入变更预览',
      cls: 'mod-cta',
    });
    preview.onclick = () => {
      this.close();
      new PreviewModal(this.app, this.workflow, this.plan).open();
    };
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

export function registerEncodingContextMenu(plugin: FeishuSyncPlugin): void {
  const workflow = createEncodingWorkflow(plugin.app, plugin.syncCoordinator);
  plugin.registerEvent(plugin.app.workspace.on('file-menu', (menu, target) => {
    if (target instanceof TFile && target.extension === 'md') {
      menu.addItem((item) => item
        .setTitle('预览并分配编码')
        .setIcon('file-plus')
        .onClick(async () => {
          const plan = await workflow.previewFile(target.path, target.parent?.path);
          new PreviewModal(plugin.app, workflow, plan).open();
        }));
      return;
    }
    if (!(target instanceof TFolder)) return;

    menu.addItem((item) => item
      .setTitle('预览批量编码')
      .setIcon('list-checks')
      .onClick(async () => {
        const plan = await workflow.previewDirectory(target.path);
        new PreviewModal(plugin.app, workflow, plan).open();
      }));
    menu.addItem((item) => item
      .setTitle('调整编码顺序')
      .setIcon('arrow-up-down')
      .onClick(async () => {
        const plan = await workflow.previewDirectory(target.path);
        new LayerSortModal(plugin.app, workflow, target.path, plan).open();
      }));
    menu.addItem((item) => item
      .setTitle('查看编码结构')
      .setIcon('network')
      .onClick(async () => {
        const plan = await workflow.previewDirectory(target.path);
        new StructureContainerModal(plugin.app, workflow, plan).open();
      }));
  }));
}
