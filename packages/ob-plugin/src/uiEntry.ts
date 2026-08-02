/**
 * KnowFlow 唯一 Ribbon 入口。
 *
 * Ribbon 只负责打开轻量菜单；不会注册持久 View，也不会直接执行编码写入。
 */
import { Menu, Modal, Notice, TFile, type App } from 'obsidian';
import type { FeishuSyncPlugin } from './main.js';
import {
  openAutoRecognitionPreview,
  openTagAssignmentPanel,
  PreviewModal,
} from './encodingUi.js';
import { exportActivityLog, rebuildEncodingIndex } from './encodingIndex.js';
import { refreshMapping } from './mapping.js';

const registeredPlugins = new WeakSet<FeishuSyncPlugin>();

/** 每个插件实例只注册一个 KnowFlow Ribbon。 */
export function registerKnowFlowRibbon(plugin: FeishuSyncPlugin): void {
  if (registeredPlugins.has(plugin)) return;

  plugin.addRibbonIcon('workflow', 'KnowFlow：整理与同步', (event) => {
    const menu = new Menu();
    const targets = currentFileTreeTargets(plugin.app);

    menu.addItem((item) => item
      .setTitle('修改当前文档标签并整理…')
      .setIcon('list-checks')
      .setDisabled(targets.length === 0)
      .onClick(() => {
        void openTagAssignmentPanel(plugin, targets, targets.length > 1 ? 'selection' : targetKind(targets[0]));
      }));

    const pending = plugin.getPendingKnowledgePlans();
    menu.addItem((item) => item
      .setTitle(`待确认同步任务${pending.length ? `（${pending.length}）` : ''}`)
      .setIcon('inbox')
      .setDisabled(pending.length === 0)
      .onClick(() => {
        const plan = plugin.getPendingKnowledgePlans()[0];
        if (!plan) return;
        new PreviewModal(
          plugin.app,
          plugin.knowledgeWorkflow,
          plan,
          plan.targetPaths,
          plan.scope,
          (operationId) => plugin.consumeKnowledgePlan(operationId),
        ).open();
      }));

    menu.addItem((item) => item
      .setTitle('自动识别并整理全库文档')
      .setIcon('scan-search')
      .onClick(() => {
        void openAutoRecognitionPreview(plugin);
      }));

    menu.addItem((item) => item
      .setTitle('同步状态与最近记录')
      .setIcon('activity')
      .onClick(() => new SyncStatusModal(plugin.app, plugin).open()));

    menu.addSeparator();
    menu.addItem((item) => item
      .setTitle('刷新目录映射')
      .setIcon('refresh-cw')
      .onClick(async () => {
        try {
          const count = await refreshMapping(plugin.app, plugin.settings.spaceId);
          new Notice(`✅ 目录映射已刷新：${count} 项`);
        } catch (error) {
          new Notice(`❌ 刷新目录映射失败：${messageOf(error)}`);
        }
      }));
    menu.addItem((item) => item
      .setTitle('重建编码索引')
      .setIcon('database')
      .onClick(async () => {
        try {
          const result = await rebuildEncodingIndex(plugin.app);
          new Notice(`✅ 编码索引已重建：${result.count} 项 → ${result.path}`);
        } catch (error) {
          new Notice(`❌ 重建编码索引失败：${messageOf(error)}`);
        }
      }));
    menu.addItem((item) => item
      .setTitle('导出同步日志')
      .setIcon('file-output')
      .onClick(async () => {
        try {
          const result = await exportActivityLog(
            plugin.app,
            plugin.state.recentSyncs,
            plugin.app.vault.getName(),
          );
          new Notice(`✅ 已导出 ${result.count} 条记录 → ${result.path}`);
        } catch (error) {
          new Notice(`❌ 导出同步日志失败：${messageOf(error)}`);
        }
      }));

    menu.showAtMouseEvent(event);
  });
  registeredPlugins.add(plugin);
}

function currentFileTreeTargets(app: App): string[] {
  const active = app.workspace.getActiveFile();
  return active instanceof TFile && active.extension === 'md' ? [active.path] : [];
}

function targetKind(path: string | undefined): 'file' | 'directory' {
  return path?.endsWith('.md') ? 'file' : 'directory';
}

class SyncStatusModal extends Modal {
  constructor(app: App, private readonly plugin: FeishuSyncPlugin) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText('KnowFlow 状态');
    const server = this.plugin.state.serverRunning ? '已连接' : '未连接';
    const cli = this.plugin.state.larkCliResolved
      ? `${this.plugin.state.larkCliVersion} · ${this.plugin.state.larkCliResolved}`
      : '未找到（本地整理仍可使用）';
    this.contentEl.createEl('p', { text: `本地服务：${server}` });
    this.contentEl.createEl('p', { text: `lark-cli：${cli}` });
    this.contentEl.createEl('h4', { text: '最近同步' });

    const recent = this.plugin.state.recentSyncs.slice(0, 10);
    if (recent.length === 0) {
      this.contentEl.createEl('p', {
        text: '暂无同步记录。',
        cls: 'setting-item-description',
      });
      return;
    }

    const list = this.contentEl.createEl('ul', { cls: 'fstb-recent-sync-list' });
    for (const entry of recent) {
      const status = entry.status === 'failed' ? '❌' : entry.status === 'skipped' ? '⏭' : '✅';
      list.createEl('li', {
        text: `${status} ${entry.title ?? entry.kind} · ${entry.path ?? entry.action ?? entry.time}`,
      });
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
