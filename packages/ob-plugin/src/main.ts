/**
 * OB 插件入口。依据方案 §4.1（模块 B）。
 *
 * 职责：
 * 1. 加载设置（首次自动生成启动令牌）
 * 2. 探测 lark-cli
 * 3. 启动本地 HTTP server，注册路由
 * 4. 注册命令、设置页、图片渲染、删除监听
 * 5. 卸载时停止 server
 */
import { Plugin, Notice } from 'obsidian';
import {
  DEFAULT_SETTINGS,
  type FeishuSyncSettings,
  type PluginState,
  type RecentSync,
} from './settings.js';
import { FeishuSyncSettingTab } from './settingsTab.js';
import { startServer, type ServerDeps, type RouteHandler } from './server.js';
import { resolveCli } from './lark/cli.js';
import { createStatusHandler } from './handlers/statusHandler.js';
import { createTreeHandler } from './handlers/treeHandler.js';
import { createFetchHandler } from './handlers/fetchHandler.js';
import { createClipHandler } from './handlers/clipHandler.js';
import { createExistsHandler } from './handlers/existsHandler.js';
import { createPushbackHandler } from './handlers/pushbackHandler.js';
import { registerCommands } from './commands.js';
import { registerFetchEntrypoints } from './fetchEntrypoints.js';
import { registerImageRenderer, cleanupImageCache } from './imageRender.js';
import { refreshMapping } from './mapping.js';

export class FeishuSyncPlugin extends Plugin {
  settings!: FeishuSyncSettings;
  state!: PluginState;
  private stopServer?: () => Promise<void>;

  async onload(): Promise<void> {
    await this.loadSettings();

    // 运行时状态
    this.state = {
      larkCliResolved: '',
      larkCliVersion: '',
      serverRunning: false,
      recentSyncs: [] as RecentSync[],
    };

    // 首次自动生成启动令牌
    if (!this.settings.syncToken) {
      this.settings.syncToken = generateToken();
      await this.saveSettings();
    }

    // 探测 lark-cli
    const larkInfo = resolveCli(this.settings.larkCliPath || undefined);
    if (larkInfo) {
      this.state.larkCliResolved = larkInfo.path;
      this.state.larkCliVersion = larkInfo.version;
      process.env.__LARK_CLI_PATH__ = larkInfo.path;
      console.log(`[sync] lark-cli: ${larkInfo.version} @ ${larkInfo.path}`);
    } else {
      console.warn('[sync] lark-cli not found (need >= 1.0.52)');
    }

    // 设置页
    this.addSettingTab(new FeishuSyncSettingTab(this.app, this));

    // 命令
    registerCommands(this);
    registerFetchEntrypoints(this);

    // 图片渲染
    registerImageRenderer(this);

    // 启动 HTTP server
    await this.startHttpServer();

    // ribbon 图标
    this.addRibbonIcon('refresh-cw', '飞书同步', async () => {
      await refreshMapping(this.app, this.settings.spaceId);
    });

    // 启动时清理一次过期缓存
    this.registerEvent(
      this.app.workspace.on('layout-ready', () => {
        cleanupImageCache(this, this.settings.cacheCleanup).catch(() => {});
      }),
    );

    console.log(`[sync] feishu-sync loaded on port ${this.settings.port}`);
  }

  async onunload(): Promise<void> {
    if (this.stopServer) {
      await this.stopServer();
      this.stopServer = undefined;
    }
    console.log('[sync] feishu-sync unloaded');
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  /** 启动 HTTP server，注册所有路由。 */
  private async startHttpServer(): Promise<void> {
    const routes = new Map<string, RouteHandler>();

    const deps: ServerDeps = {
      validateToken: (token) => token === this.settings.syncToken,
      routes,
    };

    // 注册路由
    routes.set('/status', createStatusHandler(this.manifest.version, this.app.vault.getName(), this.state));
    routes.set('/tree', createTreeHandler(this.app));
    routes.set('/fetch', createFetchHandler({
      app: this.app,
      settings: this.settings,
      state: this.state,
      notice: (m) => new Notice(m),
    }));
    routes.set('/clip', createClipHandler({
      app: this.app,
      settings: this.settings,
      notice: (m) => new Notice(m),
    }));
    routes.set('/exists', createExistsHandler(this.app));
    routes.set('/pushback', createPushbackHandler({
      app: this.app,
      settings: this.settings,
      notice: (m) => new Notice(m),
    }));

    try {
      const { stop } = await startServer(this.settings.port, deps);
      this.stopServer = stop;
      this.state.serverRunning = true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      new Notice(`❌ HTTP server 启动失败（端口 ${this.settings.port}）：${msg}`);
      console.error('[sync] server start failed:', err);
    }
  }
}

/** 生成 32 字节 hex 令牌。 */
function generateToken(): string {
  const bytes = new Uint8Array(32);
  (globalThis.crypto as Crypto).getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Obsidian 插件入口：必须默认导出 Plugin 子类
export default FeishuSyncPlugin;
