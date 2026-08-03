import { Modal, Notice, type App } from 'obsidian';
import { TAG_NAMES } from '@sync/shared';
import type { FeishuSyncPlugin } from './main.js';
import {
  commitFolderEncodingGroup,
  folderParentPath,
  isFolderEncodingContainer,
  normalizeFolderPath,
  previewFolderEncodingGroup,
  type FolderEncodingBatchPreview,
} from './folderEncoding.js';
import { ALLOWED_TAGS } from './knowledgeContract.js';

/** 打开目标文件夹所在容器的编码面板；应用前预览整个容器的排序结果。 */
export async function openFolderEncodingPanel(
  plugin: FeishuSyncPlugin,
  path: string,
): Promise<void> {
  try {
    const normalizedPath = normalizeFolderPath(path);
    const isContainer = isFolderEncodingContainer(normalizedPath);
    const parentPath = isContainer ? normalizedPath : folderParentPath(normalizedPath);
    const targetPath = isContainer ? undefined : normalizedPath;
    const preview = await previewFolderEncodingGroup(plugin.app, parentPath, {
      whitelist: plugin.settings.folderAutoEncodingWhitelist,
    });
    new FolderEncodingModal(plugin.app, plugin, targetPath, parentPath, preview).open();
  } catch (error) {
    new Notice(`❌ 无法打开文件夹编码面板：${messageOf(error)}`);
  }
}

class FolderEncodingModal extends Modal {
  private selectedTag: string;
  private preview?: FolderEncodingBatchPreview;
  private previewArea?: HTMLElement;
  private applyButton?: HTMLButtonElement;
  private working = false;

  constructor(
    app: App,
    private readonly plugin: FeishuSyncPlugin,
    private readonly targetPath: string | undefined,
    private readonly parentPath: string,
    initialPreview: FolderEncodingBatchPreview,
  ) {
    super(app);
    this.preview = initialPreview;
    this.selectedTag = targetPath
      ? initialPreview.items.find((item) => item.folderPath === targetPath)?.tag || 'S'
      : '';
  }

  onOpen(): void {
    this.titleEl.setText('整理容器编码');
    this.contentEl.empty();
    this.contentEl.createEl('p', {
      text: `文件夹是一个容器：只整理当前容器内的直接子文件夹。输入/知识池从三级、输出从二级开始编码；导引、附件和固定入口不会进入这里。`,
      cls: 'setting-item-description',
    });

    if (this.targetPath) {
      const field = this.contentEl.createDiv({ cls: 'fstb-advanced-row' });
      field.createEl('label', { text: '当前文件夹标签' });
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
    }

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
      this.preview = await previewFolderEncodingGroup(this.plugin.app, this.parentPath, {
        ...(this.targetPath ? { tagOverride: this.selectedTag, targetPath: this.targetPath } : {}),
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

  private renderPreview(preview: FolderEncodingBatchPreview | undefined): void {
    if (!this.previewArea || !preview) return;
    this.previewArea.empty();
    if (preview.blockedReason) {
      this.previewArea.createEl('p', {
        text: `⛔ ${preview.blockedReason}`,
        cls: 'fstb-plan-blockers',
      });
      if (this.applyButton) this.applyButton.disabled = true;
      return;
    }
    this.previewArea.createEl('p', {
      text: `容器：${preview.parentPath || '/'} · ${preview.items.length} 个直接子文件夹`,
      cls: 'setting-item-description',
    });
    const list = this.previewArea.createEl('ul', { cls: 'fstb-tag-preview-list' });
    for (const item of preview.items) {
      const row = list.createEl('li');
      row.createEl('span', { text: item.changed ? `${item.originalName} → ${item.newName}` : `${item.newName}（不变）` });
    }
    this.previewArea.createEl('p', {
      text: preview.changed ? '应用后会按名称排序更新容器内目录名称和本地索引。' : '当前容器已按名称连续编号，无需改名。',
      cls: 'setting-item-description',
    });
    if (this.applyButton) this.applyButton.disabled = !preview.changed;
  }

  private async commit(): Promise<void> {
    if (this.working || !this.preview || this.preview.blockedReason || !this.preview.changed) return;
    this.working = true;
    if (this.applyButton) this.applyButton.disabled = true;
    try {
      const result = await commitFolderEncodingGroup(this.plugin.app, this.preview);
      new Notice(`✅ 容器编码已整理：${result.preview.items.length} 个文件夹`);
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
