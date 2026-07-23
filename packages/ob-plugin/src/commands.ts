/**
 * 命令栏命令。依据方案 §10 + `00_同步方案设计_v2.md`。
 *
 * - 回写当前文件到飞书
 * - 批量回写当前目录
 * - 刷新目录映射
 * - 批量清理已删除
 * - 显示/复制启动令牌
 * - 重新加载插件（重启 HTTP server）
 */
import { Notice, Modal, TFile, type App } from 'obsidian';
import type { FeishuSyncPlugin } from './main.js';
import { refreshMapping } from './mapping.js';
import { createPushbackHandler } from './handlers/pushbackHandler.js';
import { createEncodingWorkflow } from './encodingWorkflow.js';
import { PreviewModal, registerEncodingContextMenu } from './encodingUi.js';

export function registerCommands(plugin: FeishuSyncPlugin): void {
  const { app, settings } = plugin;
  const encodingWorkflow = createEncodingWorkflow(app, plugin.syncCoordinator);
  registerEncodingContextMenu(plugin);

  // 回写当前文件到飞书
  plugin.addCommand({
    id: 'pushback-current',
    name: '回写当前文件到飞书',
    editorCallback: async () => {
      const file = app.workspace.getActiveFile();
      if (!(file instanceof TFile) || !file.path.endsWith('.md')) {
        new Notice('⚠️ 请在 markdown 文件中使用此命令');
        return;
      }

      const handler = createPushbackHandler({
        app,
        settings,
        notice: (m) => new Notice(m),
      });

      try {
        const key = await plugin.documentCoordinationKey(undefined, file.path);
        const result = await plugin.syncCoordinator.run(key, undefined, () => handler({
          method: 'POST',
          url: '/pushback',
          path: '/pushback',
          query: new URLSearchParams(),
          body: { path: file.path },
          token: '',
        }));
        if (result.action === 'pushed') {
          new Notice(`✅ 已回写：${result.title}`);
        } else {
          new Notice('⏭ 无变化，已跳过');
        }
      } catch (err) {
        new Notice(`❌ 回写失败：${err instanceof Error ? err.message : String(err)}`);
      }
    },
  });

  // 批量回写当前目录
  plugin.addCommand({
    id: 'pushback-dir',
    name: '批量回写当前目录到飞书',
    callback: async () => {
      const file = app.workspace.getActiveFile();
      if (!file) {
        new Notice('⚠️ 请先打开一个文件以确定目录');
        return;
      }
      const dir = file.parent?.path;
      if (!dir) return;

      const files = app.vault.getMarkdownFiles().filter(f => f.path.startsWith(dir + '/'));
      let pushed = 0;
      let skipped = 0;
      let failed = 0;

      const handler = createPushbackHandler({
        app,
        settings,
        notice: () => {},
      });

      for (const f of files) {
        try {
          const key = await plugin.documentCoordinationKey(undefined, f.path);
          const result = await plugin.syncCoordinator.run(key, undefined, () => handler({
            method: 'POST',
            url: '/pushback',
            path: '/pushback',
            query: new URLSearchParams(),
            body: { path: f.path },
            token: '',
          }));
          if (result.action === 'pushed') pushed++;
          else skipped++;
        } catch {
          failed++;
        }
      }

      new Notice(`⬆ 批量回写完成：推送 ${pushed}，跳过 ${skipped}，失败 ${failed}`);
    },
  });

  // 批量分配编码（当前目录）
  plugin.addCommand({
    id: 'assign-encoding-dir',
    name: '批量分配编码（当前目录）',
    callback: async () => {
      const file = app.workspace.getActiveFile();
      if (!file) {
        new Notice('⚠️ 请先打开一个文件以确定目录');
        return;
      }
      const dir = file.parent?.path;
      if (!dir) return;

      try {
        const plan = await encodingWorkflow.previewDirectory(dir);
        new PreviewModal(app, encodingWorkflow, plan).open();
      } catch (error) {
        new Notice(`❌ 编码预览失败：${error instanceof Error ? error.message : String(error)}`);
      }
    },
  });

  // 刷新目录映射
  plugin.addCommand({
    id: 'refresh-mapping',
    name: '刷新目录映射（OB→飞书）',
    callback: async () => {
      await refreshMapping(app, settings.spaceId);
    },
  });

  // 显示启动令牌
  plugin.addCommand({
    id: 'show-token',
    name: '显示启动令牌（连接浏览器扩展用）',
    callback: () => {
      const modal = new TokenModal(app, settings.syncToken);
      modal.open();
    },
  });

  // 显示最近同步记录
  plugin.addCommand({
    id: 'show-recent',
    name: '显示最近同步记录',
    callback: () => {
      const recent = plugin.state.recentSyncs;
      if (recent.length === 0) {
        new Notice('（暂无同步记录）');
        return;
      }
      const lines = recent.slice(0, 10).map(
        r => `${r.status === 'failed' ? '❌' : r.status === 'skipped' ? '⏭' : '✅'} ${r.title || r.kind} → ${r.path || r.action || ''}`,
      );
      const modal = new Modal(app);
      modal.titleEl.setText('最近同步记录');
      const pre = modal.contentEl.createEl('pre');
      pre.setText(lines.join('\n'));
      modal.open();
    },
  });
}

/** 令牌展示 Modal。 */
class TokenModal extends Modal {
  constructor(app: App, private token: string) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: '启动令牌' });
    contentEl.createEl('p', {
      text: '复制此令牌，粘贴到浏览器扩展弹窗的"Token"输入框。',
      cls: 'setting-item-description',
    });
    const codeEl = contentEl.createEl('code');
    codeEl.setText(this.token);
    codeEl.style.display = 'block';
    codeEl.style.padding = '12px';
    codeEl.style.fontFamily = 'monospace';
    codeEl.style.wordBreak = 'break-all';
    codeEl.style.background = 'var(--background-secondary)';

    const btn = contentEl.createEl('button', { text: '复制' });
    btn.onclick = async () => {
      await navigator.clipboard.writeText(this.token);
      new Notice('✅ 已复制');
    };
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
