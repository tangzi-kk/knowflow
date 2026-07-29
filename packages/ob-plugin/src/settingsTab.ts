/** KnowFlow 单页设置界面。日常整理留在右键菜单和 Ribbon，设置页只保留长期配置。 */
import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import type { FeishuSyncPlugin } from './main.js';
import type { FeishuSyncSettings } from './settings.js';
import { resolveCli } from './lark/cli.js';
import { refreshMapping } from './mapping.js';
import { generateSyncToken } from './settingsMigration.js';

export class FeishuSyncSettingTab extends PluginSettingTab {
  plugin: FeishuSyncPlugin;

  constructor(app: App, plugin: FeishuSyncPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass('fstb-settings-root');

    containerEl.createEl('h2', { text: 'KnowFlow', cls: 'fstb-title' });
    containerEl.createEl('p', {
      text: '这里只管理长期配置。整理、编码和同步操作请使用文件右键菜单或左侧 KnowFlow 入口。',
      cls: 'setting-item-description fstb-settings-intro',
    });

    this.renderConnection(this.createSection(containerEl, '连接'));
    this.renderSync(this.createSection(containerEl, '同步与本地显示'));
    this.renderWiki(this.createSection(containerEl, '飞书知识库'));
    this.renderAdvanced(this.createSection(containerEl, '高级设置', true));
  }

  private save(): Promise<void> {
    return this.plugin.saveSettings();
  }

  private createSection(container: HTMLElement, title: string, advanced = false): HTMLElement {
    const section = container.createDiv({
      cls: `fstb-settings-section${advanced ? ' fstb-settings-section-advanced' : ''}`,
    });
    section.createEl('h3', { text: title });
    return section;
  }

  private renderConnection(el: HTMLElement): void {
    const server = this.plugin.state.serverRunning ? '已连接' : '未连接';
    const cli = this.plugin.state.larkCliResolved
      ? `命令行工具 ${this.plugin.state.larkCliVersion} 已就绪`
      : '命令行工具未就绪；本地整理仍可使用';
    el.createDiv({
      cls: 'fstb-status-card',
      text: `浏览器连接：${server} · ${cli}`,
    });

    const tokenSetting = new Setting(el)
      .setName('启动令牌')
      .setDesc('浏览器扩展首次连接时使用。令牌只读，重置后扩展需要重新配置。');

    tokenSetting.addText((text) => {
      text.setValue(this.plugin.settings.syncToken).setDisabled(true);
      text.inputEl.style.fontFamily = 'monospace';
    });

    tokenSetting.addButton((button) =>
      button
        .setButtonText('复制')
        .setTooltip('复制令牌到剪贴板')
        .onClick(async () => {
          await navigator.clipboard.writeText(this.plugin.settings.syncToken);
          new Notice('✅ 令牌已复制');
        }),
    );

    tokenSetting.addButton((button) =>
      button
        .setButtonText('重置')
        .setTooltip('生成新令牌')
        .onClick(async () => {
          this.plugin.settings.syncToken = generateSyncToken();
          await this.save();
          this.display();
          new Notice('🔄 令牌已重置');
        }),
    );
  }

  private renderAdvanced(el: HTMLElement): void {
    el.createEl('p', {
      text: '正常使用无需修改。只在连接故障、自动探测失败或旧版本升级排查时调整。',
      cls: 'setting-item-description',
    });

    new Setting(el)
      .setName('本地服务端口')
      .setDesc('浏览器扩展连接 Obsidian 的端口；修改后需重新加载插件')
      .addText((text) =>
        text
          .setValue(String(this.plugin.settings.port))
          .onChange(async (value) => {
            const port = Number.parseInt(value, 10);
            if (port > 0 && port < 65536) {
              this.plugin.settings.port = port;
              await this.save();
            }
          }),
      );

    const status = el.createEl('p', {
      cls: 'setting-item-description',
      text: this.plugin.state.larkCliResolved
        ? `当前命令行工具：${this.plugin.state.larkCliVersion} · ${this.plugin.state.larkCliResolved}`
        : '未找到命令行工具（需要 1.0.52 或更高版本）',
    });

    new Setting(el)
      .setName('命令行工具路径')
      .setDesc('留空自动探测；只有自动探测失败时才填写 lark-cli 的绝对路径')
      .addText((text) =>
        text
          .setValue(this.plugin.settings.larkCliPath)
          .setPlaceholder('自动探测')
          .onChange(async (value) => {
            this.plugin.settings.larkCliPath = value;
            await this.save();
          }),
      )
      .addButton((button) =>
        button
          .setButtonText('重新探测')
          .onClick(async () => {
            const result = resolveCli(this.plugin.settings.larkCliPath || undefined);
            if (result) {
              this.plugin.state.larkCliResolved = result.path;
              this.plugin.state.larkCliVersion = result.version;
              status.setText(`✅ ${result.version} @ ${result.path}`);
              new Notice(`✅ 找到 ${result.version}`);
              return;
            }

            this.plugin.state.larkCliResolved = '';
            this.plugin.state.larkCliVersion = '';
            status.setText('❌ 未找到（需 ≥ 1.0.52）');
            new Notice('❌ 未找到 lark-cli（需要 1.0.52 或更高版本）');
          }),
      );

    el.createDiv({
      cls: 'fstb-info-box',
      text: '旧版 Lark Doc 独立视图和写入通道不会启用；升级兼容数据由插件自动处理。',
    });
  }

  private renderSync(el: HTMLElement): void {
    new Setting(el)
      .setName('默认落地目录')
      .setDesc('扩展未指定目录时，飞书文档落地到此目录（相对 Vault 根目录）')
      .addText((text) =>
        text
          .setValue(this.plugin.settings.defaultDir)
          .onChange(async (value) => {
            this.plugin.settings.defaultDir = value;
            await this.save();
          }),
      );

    new Setting(el)
      .setName('隐藏系统属性')
      .setDesc('隐藏 _sys_ 开头和旧版同步字段；字段仍保留给同步逻辑使用')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.hideSystemProperties)
          .onChange(async (value) => {
            this.plugin.settings.hideSystemProperties = value;
            await this.save();
            this.plugin.applySystemPropertiesVisibility();
          }),
      );

    new Setting(el)
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
            await this.save();
          }),
      );
  }

  private renderWiki(el: HTMLElement): void {
    new Setting(el)
      .setName('知识库 space_id')
      .setDesc('用于目录映射')
      .addText((text) =>
        text
          .setValue(this.plugin.settings.spaceId)
          .onChange(async (value) => {
            this.plugin.settings.spaceId = value;
            await this.save();
          }),
      )
      .addButton((button) =>
        button
          .setButtonText('刷新映射')
          .onClick(async () => {
            await refreshMapping(this.app, this.plugin.settings.spaceId);
            new Notice('✅ 映射已刷新');
          }),
      );

    el.createEl('p', {
      text: '刷新映射会从飞书知识库读取目录结构，并与 Obsidian 本地目录匹配。',
      cls: 'setting-item-description',
    });
  }

}
