import { Modal, Notice, type App } from 'obsidian';
import { TAG_NAMES } from '@sync/shared';
import type { FeishuSyncPlugin } from './main.js';
import {
  commitFolderEncoding,
  previewFolderEncoding,
  type FolderEncodingPreview,
} from './folderEncoding.js';
import { ALLOWED_TAGS } from './knowledgeContract.js';

/** 打开单个文件夹的结构编码面板；应用前始终显示目标名称和长编码。 */
export async function openFolderEncodingPanel(
  plugin: FeishuSyncPlugin,
  path: string,
): Promise<void> {
  try {
    const preview = await previewFolderEncoding(plugin.app, path, {
      whitelist: plugin.settings.folderAutoEncodingWhitelist,
    });
    new FolderEncodingModal(plugin.app, plugin, path, preview).open();
  } catch (error) {
    new Notice(`❌ 无法打开文件夹编码面板：${messageOf(error)}`);
  }
}

class FolderEncodingModal extends Modal {
  private selectedTag: string;
  private preview?: FolderEncodingPreview;
  private previewArea?: HTMLElement;
  private applyButton?: HTMLButtonElement;
  private working = false;

  constructor(
    app: App,
    private readonly plugin: FeishuSyncPlugin,
    private readonly path: string,
    initialPreview: FolderEncodingPreview,
  ) {
    super(app);
    this.preview = initialPreview;
    this.selectedTag = initialPreview.tag || 'S';
  }

  onOpen(): void {
    this.titleEl.setText('KnowFlow 设置文件夹编码');
    this.contentEl.empty();
    this.contentEl.createEl('p', {
      text: '文件夹只承担结构归类：输入/知识池从三级、输出从二级开始编码；导引、附件和固定入口不会进入这里。显示名称使用短编码，长编码只保存到本地索引供后端使用。',
      cls: 'setting-item-description',
    });

    const field = this.contentEl.createDiv({ cls: 'fstb-advanced-row' });
    field.createEl('label', { text: '文件夹标签' });
    const select = field.createEl('select', { attr: { 'aria-label': '文件夹标签' } });
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
      text: '应用文件夹编码',
      cls: 'mod-cta',
    });
    this.applyButton.onclick = () => {
      void this.commit();
    };
    this.renderPreview(this.preview);
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private async refreshPreview(): Promise<void> {
    this.applyButton && (this.applyButton.disabled = true);
    if (this.previewArea) {
      this.previewArea.empty();
      this.previewArea.createEl('p', {
        text: `正在预览：${this.selectedTag} · ${tagName(this.selectedTag)}`,
        cls: 'setting-item-description',
      });
    }
    try {
      this.preview = await previewFolderEncoding(this.plugin.app, this.path, {
        tagOverride: this.selectedTag,
        whitelist: this.plugin.settings.folderAutoEncodingWhitelist,
      });
      this.renderPreview(this.preview);
    } catch (error) {
      if (this.previewArea) {
        this.previewArea.empty();
        this.previewArea.createEl('p', {
          text: `预览失败：${messageOf(error)}`,
          cls: 'fstb-plan-blockers',
        });
      }
    }
  }

  private renderPreview(preview: FolderEncodingPreview | undefined): void {
    if (!this.previewArea || !preview) return;
    this.previewArea.empty();
    this.previewArea.createEl('p', {
      text: `当前：${preview.folderPath || '/'}\n将显示：${preview.newName}`,
      cls: 'setting-item-description',
    });
    if (preview.blockedReason) {
      this.previewArea.createEl('p', {
        text: `⛔ ${preview.blockedReason}`,
        cls: 'fstb-plan-blockers',
      });
      if (this.applyButton) this.applyButton.disabled = true;
      return;
    }
    this.previewArea.createEl('p', {
      text: `显示短编码：${preview.shortCode}`,
      cls: 'setting-item-description',
    });
    const details = this.previewArea.createEl('details');
    details.createEl('summary', { text: '查看目录长编码（后端记录）' });
    details.createEl('code', { text: preview.encoding });
    if (preview.warning) {
      this.previewArea.createEl('p', {
        text: `提示：${preview.warning}`,
        cls: 'fstb-plan-warnings',
      });
    }
    this.previewArea.createEl('p', {
      text: preview.changed ? '应用后会更新文件夹名称和目录编码索引。' : '当前文件夹已使用该编码，无需改名。',
      cls: 'setting-item-description',
    });
    if (this.applyButton) this.applyButton.disabled = !preview.changed;
  }

  private async commit(): Promise<void> {
    if (this.working || !this.preview || this.preview.blockedReason || !this.preview.changed) return;
    this.working = true;
    if (this.applyButton) this.applyButton.disabled = true;
    try {
      const result = await commitFolderEncoding(this.plugin.app, this.preview);
      new Notice(`✅ 文件夹编码已更新：${result.preview.newName}`);
      this.close();
    } catch (error) {
      new Notice(`❌ 文件夹编码失败：${messageOf(error)}`);
      if (this.applyButton && this.contentEl.isConnected) this.applyButton.disabled = false;
    } finally {
      this.working = false;
    }
  }
}

function tagName(tag: string): string {
  return TAG_NAMES[tag as keyof typeof TAG_NAMES] ?? tag;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
