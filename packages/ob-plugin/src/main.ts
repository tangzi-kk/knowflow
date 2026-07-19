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
import { Plugin, Notice, TFile } from 'obsidian';
import {
  type FeishuSyncSettings,
  type PluginState,
  type RecentSync,
} from './settings.js';
import { generateSyncToken, migrateSettings } from './settingsMigration.js';
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
import {
  isSystemPropertyKey,
  SYSTEM_PROPERTY_BODY_CLASS,
  SYSTEM_PROPERTY_CSS,
  SYSTEM_PROPERTY_HIDDEN_CLASS,
  SYSTEM_PROPERTY_STYLE_ID,
} from './systemProperties.js';
import { SyncCoordinator } from './syncCoordinator.js';
import type { ClipRequest, FetchRequest, PushbackRequest } from '@sync/shared';
import { extractFeishuId } from './bindingIndex.js';
import { normalizeVaultDir, normalizeVaultMarkdownPath } from './vaultPath.js';

export class FeishuSyncPlugin extends Plugin {
  settings!: FeishuSyncSettings;
  state!: PluginState;
  private stopServer?: () => Promise<void>;
  private systemPropertyObserver?: MutationObserver;
  readonly syncCoordinator = new SyncCoordinator();

  async onload(): Promise<void> {
    let shouldSaveSettings = await this.loadSettings();

    // 运行时状态
    this.state = {
      larkCliResolved: '',
      larkCliVersion: '',
      serverRunning: false,
      recentSyncs: [] as RecentSync[],
    };

    // 首次自动生成启动令牌
    if (!this.settings.syncToken) {
      this.settings.syncToken = generateSyncToken();
      shouldSaveSettings = true;
    }
    if (shouldSaveSettings) {
      await this.saveSettings();
    }
    this.applySystemPropertiesVisibility();

    // 探测 lark-cli
    const larkInfo = resolveCli(this.settings.larkCliPath || undefined);
    if (larkInfo) {
      this.state.larkCliResolved = larkInfo.path;
      this.state.larkCliVersion = larkInfo.version;
      process.env.__LARK_CLI_PATH__ = larkInfo.path;
      console.log(`[fs-TB] lark-cli: ${larkInfo.version} @ ${larkInfo.path}`);
    } else {
      console.warn('[fs-TB] lark-cli not found (need >= 1.0.52)');
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
    this.app.workspace.onLayoutReady(() => {
      cleanupImageCache(this, this.settings.cacheCleanup).catch(() => {});
    });

    console.log(`[fs-TB] ${this.manifest.version} loaded on port ${this.settings.port}`);
  }

  async onunload(): Promise<void> {
    this.systemPropertyObserver?.disconnect();
    this.systemPropertyObserver = undefined;
    document.body.classList.remove(SYSTEM_PROPERTY_BODY_CLASS);
    document.documentElement.classList.remove(SYSTEM_PROPERTY_BODY_CLASS);
    document.getElementById(SYSTEM_PROPERTY_STYLE_ID)?.remove();
    document.querySelectorAll(`.${SYSTEM_PROPERTY_HIDDEN_CLASS}`).forEach((element) => {
      element.classList.remove(SYSTEM_PROPERTY_HIDDEN_CLASS);
    });
    if (this.stopServer) {
      await this.stopServer();
      this.stopServer = undefined;
    }
    console.log('[fs-TB] unloaded');
  }

  async loadSettings(): Promise<boolean> {
    const migration = migrateSettings(await this.loadData());
    this.settings = migration.settings;
    return migration.changed;
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async documentCoordinationKey(nodeToken?: string, path?: string): Promise<string> {
    if (nodeToken) return `document:${nodeToken}`;
    if (path) {
      const normalizedPath = normalizeVaultMarkdownPath(path);
      const file = this.app.vault.getAbstractFileByPath(normalizedPath);
      if (file instanceof TFile) {
        const feishuId = extractFeishuId(await this.app.vault.read(file));
        if (feishuId) return `document:${feishuId}`;
      }
      return `path:${normalizedPath}`;
    }
    return 'document:missing';
  }

  applySystemPropertiesVisibility(): void {
    const enabled = this.settings.hideSystemProperties ?? true;
    document.body.classList.toggle(SYSTEM_PROPERTY_BODY_CLASS, enabled);
    document.documentElement.classList.toggle(SYSTEM_PROPERTY_BODY_CLASS, enabled);

    let styleElement = document.getElementById(SYSTEM_PROPERTY_STYLE_ID);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = SYSTEM_PROPERTY_STYLE_ID;
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = enabled ? SYSTEM_PROPERTY_CSS : '';

    this.systemPropertyObserver?.disconnect();
    this.systemPropertyObserver = undefined;
    if (!enabled) {
      document.querySelectorAll(`.${SYSTEM_PROPERTY_HIDDEN_CLASS}`).forEach((element) => {
        element.classList.remove(SYSTEM_PROPERTY_HIDDEN_CLASS);
      });
      return;
    }

    this.refreshSystemPropertyDomVisibility();
    this.systemPropertyObserver = new MutationObserver(() => {
      this.refreshSystemPropertyDomVisibility();
    });
    this.systemPropertyObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-property-key', 'data-property-name', 'value', 'title', 'aria-label'],
    });
  }

  private refreshSystemPropertyDomVisibility(): void {
    document.querySelectorAll<HTMLElement>('.metadata-property').forEach((element) => {
      const input = element.querySelector<HTMLInputElement>(
        '.metadata-property-key-input, .metadata-property-key input, input',
      );
      const keyNode = element.querySelector<HTMLElement>(
        '.metadata-property-key, .metadata-property-key-inner, .metadata-property-label',
      );
      const values = [
        element.dataset.propertyKey,
        element.dataset.propertyName,
        input?.value,
        input?.getAttribute('value'),
        input?.getAttribute('aria-label'),
        keyNode?.title,
        keyNode?.textContent,
      ];
      const shouldHide = values.some(isSystemPropertyKey);
      element.classList.toggle(SYSTEM_PROPERTY_HIDDEN_CLASS, shouldHide);
    });
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
    const fetchHandler = createFetchHandler({
      app: this.app,
      settings: this.settings,
      state: this.state,
      notice: (m) => new Notice(m),
    });
    routes.set('/fetch', (ctx) => {
      const req = ctx.body as FetchRequest;
      const documentKey = `document:${req?.node_token ?? ''}`;
      const directoryKey = `directory:${normalizeVaultDir(req?.dir ?? this.settings.defaultDir)}`;
      return this.syncCoordinator.run(documentKey, req?.requestId, () =>
        this.syncCoordinator.run(directoryKey, undefined, () => fetchHandler(ctx)));
    });
    const clipHandler = createClipHandler({
      app: this.app,
      settings: this.settings,
      notice: (m) => new Notice(m),
    });
    routes.set('/clip', (ctx) => {
      const req = ctx.body as ClipRequest;
      const key = req?.appendPath ? `clip:${req.appendPath}` : `clip:${req?.requestId ?? 'anonymous'}`;
      return this.syncCoordinator.run(key, req?.requestId, () => clipHandler(ctx));
    });
    routes.set('/exists', createExistsHandler(this.app));
    const pushbackHandler = createPushbackHandler({
      app: this.app,
      settings: this.settings,
      notice: (m) => new Notice(m),
    });
    routes.set('/pushback', async (ctx) => {
      const req = ctx.body as PushbackRequest;
      const key = await this.documentCoordinationKey(req?.node_token, req?.path);
      return this.syncCoordinator.run(key, req?.requestId, () => pushbackHandler(ctx));
    });

    try {
      const { stop } = await startServer(this.settings.port, deps);
      this.stopServer = stop;
      this.state.serverRunning = true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      new Notice(`❌ HTTP server 启动失败（端口 ${this.settings.port}）：${msg}`);
      console.error('[fs-TB] server start failed:', err);
    }
  }
}

// Obsidian 插件入口：必须默认导出 Plugin 子类
export default FeishuSyncPlugin;
