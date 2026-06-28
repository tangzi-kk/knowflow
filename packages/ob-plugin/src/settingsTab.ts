/**
 * OB 插件设置界面。依据方案 §10（SettingsTab）。
 *
 * 端口、启动令牌（生成/重置/复制）、lark-cli 路径、默认目录、开关、缓存周期。
 */
import { App, PluginSettingTab, Setting, Notice, setIcon } from 'obsidian';
import type { FeishuSyncPlugin } from './main.js';
import { resolveCli } from './lark/cli.js';
import { refreshMapping } from './mapping.js';

export class FeishuSyncSettingTab extends PluginSettingTab {
  plugin: FeishuSyncPlugin;

  constructor(app: App, plugin: FeishuSyncPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: '飞书同步设置' });

    // ── 通信 ──
    new Setting(containerEl)
      .setName('本地端口')
      .setDesc('浏览器扩展连接 OB 插件的端口（修改后需重启 OB 或重新加载插件）')
      .addText((text) =>
        text
          .setValue(String(this.plugin.settings.port))
          .onChange(async (value) => {
            const port = parseInt(value, 10);
            if (port > 0 && port < 65536) {
              this.plugin.settings.port = port;
              await this.plugin.saveSettings();
            }
          }),
      );

    // 启动令牌
    const tokenSetting = new Setting(containerEl)
      .setName('启动令牌')
      .setDesc('浏览器扩展首次连接需粘贴此令牌。点击复制后粘贴到扩展弹窗。');

    tokenSetting.addText((text) => {
      text
        .setValue(this.plugin.settings.syncToken)
        .setDisabled(true) // 只读，避免手改
        .inputEl.style.fontFamily = 'monospace';
    });

    tokenSetting.addButton((btn) =>
      btn
        .setButtonText('复制')
        .setTooltip('复制令牌到剪贴板')
        .onClick(async () => {
          await navigator.clipboard.writeText(this.plugin.settings.syncToken);
          new Notice('✅ 令牌已复制');
        }),
    );

    tokenSetting.addButton((btn) =>
      btn
        .setButtonText('重置')
        .setTooltip('生成新令牌（扩展需重新粘贴）')
        .onClick(async () => {
          this.plugin.settings.syncToken = generateToken();
          await this.plugin.saveSettings();
          this.display();
          new Notice('🔄 令牌已重置');
        }),
    );

    // ── lark-cli ──
    containerEl.createEl('h3', { text: 'lark-cli' });

    const larkInfo = containerEl.createEl('p', {
      text: `状态：${this.plugin.state.larkCliResolved ? '✅ ' + this.plugin.state.larkCliVersion : '❌ 未找到'}`,
      cls: 'setting-item-description',
    });

    new Setting(containerEl)
      .setName('lark-cli 路径')
      .setDesc('留空则自动探测。如自动探测失败，请手动填写绝对路径。')
      .addText((text) =>
        text
          .setValue(this.plugin.settings.larkCliPath)
          .setPlaceholder('自动探测')
          .onChange(async (value) => {
            this.plugin.settings.larkCliPath = value;
            await this.plugin.saveSettings();
          }),
      )
      .addButton((btn) =>
        btn
          .setButtonText('测试')
          .setTooltip('重新探测 lark-cli')
          .onClick(async () => {
            const result = resolveCli(this.plugin.settings.larkCliPath || undefined);
            if (result) {
              this.plugin.state.larkCliResolved = result.path;
              this.plugin.state.larkCliVersion = result.version;
              larkInfo.setText(`状态：✅ ${result.version}`);
              new Notice(`✅ 找到 ${result.version}`);
            } else {
              this.plugin.state.larkCliResolved = '';
              this.plugin.state.larkCliVersion = '';
              larkInfo.setText('状态：❌ 未找到');
              new Notice('❌ 未找到 lark-cli（需 ≥ 1.0.52）');
            }
          }),
      );

    // ── 同步行为 ──
    containerEl.createEl('h3', { text: '同步行为' });

    new Setting(containerEl)
      .setName('默认落地目录')
      .setDesc('扩展未指定目录时，飞书文档落地到此目录（相对 vault 根）')
      .addText((text) =>
        text
          .setValue(this.plugin.settings.defaultDir)
          .onChange(async (value) => {
            this.plugin.settings.defaultDir = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('自动分配编码')
      .setDesc('飞书文档落地后自动触发 auto-rename 编码分配')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoRename)
          .onChange(async (value) => {
            this.plugin.settings.autoRename = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('删除自动登记')
      .setDesc('删除含 feishu_id 的文件时，自动登记到飞书多维表格')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoDeleteRegistry)
          .onChange(async (value) => {
            this.plugin.settings.autoDeleteRegistry = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('保留装饰图片')
      .setDesc('飞书排版物料（135编辑器风格等纯图片）是否落地到 OB')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.keepDecorativeImages)
          .onChange(async (value) => {
            this.plugin.settings.keepDecorativeImages = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('图片缓存清理周期')
      .setDesc('feishu://token 预览图片的本地缓存保留时长')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('daily', '每天')
          .addOption('weekly', '每周')
          .addOption('monthly', '每月')
          .addOption('never', '永不')
          .setValue(this.plugin.settings.cacheCleanup)
          .onChange(async (value) => {
            this.plugin.settings.cacheCleanup = value as FeishuSyncSettings['cacheCleanup'];
            await this.plugin.saveSettings();
          }),
      );

    // ── 飞书知识库 ──
    containerEl.createEl('h3', { text: '飞书知识库' });

    new Setting(containerEl)
      .setName('知识库 space_id')
      .setDesc('目录映射用。新知识库默认 7651314150060067803')
      .addText((text) =>
        text
          .setValue(this.plugin.settings.spaceId)
          .onChange(async (value) => {
            this.plugin.settings.spaceId = value;
            await this.plugin.saveSettings();
          }),
      )
      .addButton((btn) =>
        btn
          .setButtonText('刷新映射')
          .onClick(async () => {
            await refreshMapping(this.app, this.plugin.settings.spaceId);
          }),
      );
  }
}

import type { FeishuSyncSettings } from './settings.js';

/** 生成 32 字节 hex 令牌。 */
function generateToken(): string {
  const bytes = new Uint8Array(32);
  (globalThis.crypto ?? (require('node:crypto') as { webcrypto: Crypto })).webcrypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
