/**
 * fs-TB 统一设置界面。
 *
 * 恢复 3.2.1 的六标签布局，但仅映射当前 4.x 已验证的安全设置。
 * 旧版 lark-doc View、协议处理和写通道不会由设置页重新启用。
 */
import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import type { FeishuSyncPlugin } from './main.js';
import type { FeishuSyncSettings } from './settings.js';
import { resolveCli } from './lark/cli.js';
import { refreshMapping } from './mapping.js';
import { generateSyncToken } from './settingsMigration.js';

const TABS = [
  { id: 'comm', label: '通信', icon: '📡' },
  { id: 'lark-cli', label: 'lark-cli', icon: '🔧' },
  { id: 'sync', label: '同步', icon: '🔄' },
  { id: 'wiki', label: '知识库', icon: '📚' },
  { id: 'encoding', label: '编码系统', icon: '🔢' },
  { id: 'lark-doc', label: 'Lark Doc', icon: '📄' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export class FeishuSyncSettingTab extends PluginSettingTab {
  plugin: FeishuSyncPlugin;
  private activeTab: TabId = 'comm';

  constructor(app: App, plugin: FeishuSyncPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: '飞书同步 (fs-TB)', cls: 'fstb-title' });

    const tabBar = containerEl.createDiv({ cls: 'fstb-tab-bar' });
    for (const tab of TABS) {
      const button = tabBar.createEl('button', {
        cls: `fstb-tab${this.activeTab === tab.id ? ' fstb-tab-active' : ''}`,
        text: `${tab.icon} ${tab.label}`,
        attr: {
          type: 'button',
          'aria-selected': String(this.activeTab === tab.id),
        },
      });
      button.onclick = () => {
        this.activeTab = tab.id;
        this.display();
      };
    }

    const content = containerEl.createDiv({ cls: 'fstb-tab-content' });
    switch (this.activeTab) {
      case 'comm':
        this.renderCommunication(content);
        break;
      case 'lark-cli':
        this.renderLarkCli(content);
        break;
      case 'sync':
        this.renderSync(content);
        break;
      case 'wiki':
        this.renderWiki(content);
        break;
      case 'encoding':
        this.renderEncoding(content);
        break;
      case 'lark-doc':
        this.renderLarkDoc(content);
        break;
    }
  }

  private save(): Promise<void> {
    return this.plugin.saveSettings();
  }

  private renderCommunication(el: HTMLElement): void {
    el.createEl('h3', { text: '📡 通信' });

    new Setting(el)
      .setName('本地端口')
      .setDesc('浏览器扩展连接 Obsidian 插件的端口（修改后需重新加载插件）')
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

  private renderLarkCli(el: HTMLElement): void {
    el.createEl('h3', { text: '🔧 lark-cli' });

    const status = el.createEl('p', {
      cls: 'setting-item-description',
      text: this.plugin.state.larkCliResolved
        ? `✅ ${this.plugin.state.larkCliVersion} @ ${this.plugin.state.larkCliResolved}`
        : '❌ 未找到（需 ≥ 1.0.52）',
    });

    new Setting(el)
      .setName('lark-cli 路径')
      .setDesc('留空则自动探测；自动探测失败时填写绝对路径。')
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
            new Notice('❌ 未找到 lark-cli（需 ≥ 1.0.52）');
          }),
      );
  }

  private renderSync(el: HTMLElement): void {
    el.createEl('h3', { text: '🔄 同步行为' });

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
      .setName('删除自动登记')
      .setDesc('仅登记待确认删除；不会自动删除飞书节点，默认关闭')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoDeleteRegistry)
          .onChange(async (value) => {
            this.plugin.settings.autoDeleteRegistry = value;
            await this.save();
          }),
      );

    new Setting(el)
      .setName('保留装饰图片')
      .setDesc('飞书排版物料等纯图片是否落地到 Obsidian')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.keepDecorativeImages)
          .onChange(async (value) => {
            this.plugin.settings.keepDecorativeImages = value;
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
    el.createEl('h3', { text: '📚 飞书知识库' });

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

  private renderEncoding(el: HTMLElement): void {
    el.createEl('h3', { text: '🔢 编码系统' });

    new Setting(el)
      .setName('自动分配编码')
      .setDesc('飞书文档成功落地后，使用当前安全编码流程分配编码')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoRename)
          .onChange(async (value) => {
            this.plugin.settings.autoRename = value;
            await this.save();
          }),
      );

    el.createDiv({
      cls: 'fstb-info-box',
      text: '此处只控制当前同步流程的编码开关，不会加载旧版 auto-rename 子插件或其写入逻辑。',
    });
  }

  private renderLarkDoc(el: HTMLElement): void {
    el.createEl('h3', { text: '📄 Lark Doc' });

    new Setting(el)
      .setName('兼容笔记目录')
      .setDesc('保留 3.2.1 升级兼容字段；当前安全同步仍以“默认落地目录”为准')
      .addText((text) =>
        text
          .setValue(this.plugin.settings.defaultNoteFolder)
          .onChange(async (value) => {
            this.plugin.settings.defaultNoteFolder = value;
            await this.save();
          }),
      );

    el.createDiv({
      cls: 'fstb-info-box',
      text: '旧版 Lark Doc View、obsidian://lark-doc 协议和独立写通道未启用。浏览器请求继续经过当前已验证的同步入口。',
    });
  }
}
