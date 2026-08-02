/**
 * OB 插件入口。依据方案 §4.1（模块 B）。
 *
 * 职责：
 * 1. 加载设置（首次自动生成启动令牌）
 * 2. 探测 lark-cli
 * 3. 启动本地 HTTP server，注册路由
 * 4. 注册命令、设置页、图片渲染、删除监听和自动编码监听
 * 5. 卸载时停止 server
 */
import { Plugin, Notice, TFile, TFolder, type TAbstractFile } from 'obsidian';
import { PROTOCOL_VERSION } from '@sync/shared';
import {
  type FeishuSyncSettings,
  type PluginState,
  type RecentSync,
} from './settings.js';
import { generateSyncToken, migrateSettings } from './settingsMigration.js';
import { FeishuSyncSettingTab } from './settingsTab.js';
import { startServer, type ServerDeps, type RouteHandler } from './server.js';
import { disableCli, enableCli, resolveCli } from './lark/cli.js';
import { createStatusHandler } from './handlers/statusHandler.js';
import { createTreeHandler } from './handlers/treeHandler.js';
import { createFetchHandler } from './handlers/fetchHandler.js';
import { createClipHandler } from './handlers/clipHandler.js';
import { createExistsHandler } from './handlers/existsHandler.js';
import { createPushbackHandler } from './handlers/pushbackHandler.js';
import { registerCommands } from './commands.js';
import { registerFetchEntrypoints } from './fetchEntrypoints.js';
import { registerImageRenderer, cleanupImageCache } from './imageRender.js';
import { registerKnowFlowRibbon } from './uiEntry.js';
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
import { appendActivity, normalizeActivity, type ActivityKind } from './activity.js';
import {
  createKnowledgeWorkflow,
  type KnowledgeChangePlan,
  type KnowledgeTransactionResult,
  type KnowledgeWorkflow,
} from './encodingWorkflow.js';
import { rebuildEncodingIndex } from './encodingIndex.js';
import {
  commitFolderEncoding,
  isFolderEncodingExcluded,
  normalizeFolderPath,
  previewFolderEncoding,
} from './folderEncoding.js';
import { isProtectedDocumentPath } from './vaultStructure.js';

const DEFAULT_CAPTURE_PROPOSALS = true;
const PROTECTED_RECOGNITION_PATH_RE = /^(?:(?:.*\/)?AGENTS(?:\.md)?$|🪧导引(?:\/|$)|3️⃣附件文件(?:\/|$)|\.[^/]+(?:\/|$))/;

export class FeishuSyncPlugin extends Plugin {
  settings!: FeishuSyncSettings;
  state!: PluginState;
  private stopServer?: () => Promise<void>;
  private systemPropertyObserver?: MutationObserver;
  private activitySaveTail: Promise<void> = Promise.resolve();
  readonly syncCoordinator = new SyncCoordinator();
  knowledgeWorkflow!: KnowledgeWorkflow;
  private pendingKnowledgePlans: KnowledgeChangePlan[] = [];
  private automaticRecognitionTimer?: ReturnType<typeof setTimeout>;
  private automaticRecognitionPaths = new Set<string>();
  private automaticRecognitionTail: Promise<void> = Promise.resolve();
  private automaticRecognitionIgnore = new Map<string, number>();
  private automaticRecognitionReady = false;
  private automaticFolderEncodingTimer?: ReturnType<typeof setTimeout>;
  private automaticFolderEncodingPaths = new Set<string>();
  private automaticFolderEncodingTail: Promise<void> = Promise.resolve();
  private automaticFolderEncodingIgnore = new Map<string, number>();

  async onload(): Promise<void> {
    enableCli();
    let shouldSaveSettings = await this.loadSettings();

    // 运行时状态
    this.state = {
      larkCliResolved: '',
      larkCliVersion: '',
      serverRunning: false,
      recentSyncs: normalizeActivity(this.settings.recentActivity) as RecentSync[],
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
    this.knowledgeWorkflow = createKnowledgeWorkflow(this.app, this.syncCoordinator, {
      rebuildIndex: async () => {
        await rebuildEncodingIndex(this.app);
      },
      appendAudit: async (result) => {
        this.recordKnowledgeTransaction(result);
      },
      emitSyncEvents: async (events) => {
        for (const event of events) {
          document.dispatchEvent(new CustomEvent('knowflow:sync-event', { detail: event }));
        }
      },
    });
    this.registerAutomaticRecognition();

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

    // UI 入口互相隔离：单一 Ribbon 或菜单注册失败时，不中断本地服务。
    this.registerUi('KnowFlow 按钮', () => registerKnowFlowRibbon(this));
    this.registerUi('命令与文件树菜单', () => registerCommands(this));
    this.registerUi('拉取入口', () => registerFetchEntrypoints(this));
    this.registerUi('图片渲染', () => registerImageRenderer(this));

    // 启动 HTTP server
    await this.startHttpServer();

    // 启动时清理一次过期缓存
    this.app.workspace.onLayoutReady(() => {
      this.automaticRecognitionReady = true;
      cleanupImageCache(this, this.settings.cacheCleanup).catch(() => {});
    });

    console.log(`[fs-TB] ${this.manifest.version} loaded on port ${this.settings.port}`);
  }

  private registerUi(label: string, register: () => void): void {
    try {
      register();
    } catch (error) {
      console.error(`[fs-TB] 注册${label}失败：`, error);
      new Notice(`⚠️ ${label}注册失败，其余功能不受影响`);
    }
  }

  async onunload(): Promise<void> {
    disableCli();
    if (this.automaticRecognitionTimer) {
      clearTimeout(this.automaticRecognitionTimer);
      this.automaticRecognitionTimer = undefined;
    }
    if (this.automaticFolderEncodingTimer) {
      clearTimeout(this.automaticFolderEncodingTimer);
      this.automaticFolderEncodingTimer = undefined;
    }
    this.automaticRecognitionPaths.clear();
    this.automaticRecognitionIgnore.clear();
    this.automaticRecognitionReady = false;
    this.automaticFolderEncodingPaths.clear();
    this.automaticFolderEncodingIgnore.clear();
    await this.automaticRecognitionTail;
    await this.automaticFolderEncodingTail;
    await this.activitySaveTail;
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
    const saved = await this.loadData() as Record<string, unknown> | null;
    const migration = migrateSettings(saved);
    this.settings = migration.settings;
    let changed = migration.changed;

    // 4.1 将旧 autoRename 迁移为“采集后生成待确认建议”。
    // 无论旧值为何，fetch/clip 写通道使用的 autoRename 都关闭；本地文档自动编码由
    // automaticRecognition 单独控制。
    if (this.settings.createProposalsAfterCapture !== DEFAULT_CAPTURE_PROPOSALS) {
      this.settings.createProposalsAfterCapture = DEFAULT_CAPTURE_PROPOSALS;
      changed = true;
    }
    if (this.settings.autoRename !== false) {
      this.settings.autoRename = false;
      changed = true;
    }
    return changed;
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private registerAutomaticRecognition(): void {
    this.registerEvent(this.app.vault.on('create', (file) => {
      if (file instanceof TFolder) this.queueAutomaticFolderEncoding(file);
      else this.queueAutomaticRecognition(file);
    }));
    this.registerEvent(this.app.vault.on('modify', (file) => {
      if (!(file instanceof TFolder)) this.queueAutomaticRecognition(file);
    }));
    this.registerEvent(this.app.vault.on('rename', (file, oldPath) => {
      if (file instanceof TFolder) this.queueAutomaticFolderEncoding(file, oldPath);
      else this.queueAutomaticRecognition(file);
    }));
  }

  private queueAutomaticFolderEncoding(folder: TFolder, previousPath?: string): void {
    if (!this.settings.automaticRecognition || !this.automaticRecognitionReady) return;
    const path = normalizeFolderPath(folder.path);
    if (!path || isFolderEncodingExcluded(path, this.settings.folderAutoEncodingWhitelist)) return;
    const oldPath = previousPath ? normalizeFolderPath(previousPath) : '';
    if (oldPath && oldPath !== path) {
      for (const pendingPath of [...this.automaticFolderEncodingPaths]) {
        if (pendingPath === oldPath || pendingPath.startsWith(`${oldPath}/`)) {
          this.automaticFolderEncodingPaths.delete(pendingPath);
          this.automaticFolderEncodingPaths.add(`${path}${pendingPath.slice(oldPath.length)}`);
        }
      }
      this.automaticFolderEncodingIgnore.set(oldPath, Date.now() + 5000);
    }
    const ignoredUntil = this.automaticFolderEncodingIgnore.get(path);
    if (ignoredUntil) {
      if (ignoredUntil > Date.now()) return;
      this.automaticFolderEncodingIgnore.delete(path);
    }
    this.automaticFolderEncodingPaths.add(path);
    if (this.automaticFolderEncodingTimer) clearTimeout(this.automaticFolderEncodingTimer);
    this.automaticFolderEncodingTimer = setTimeout(() => {
      this.automaticFolderEncodingTimer = undefined;
      void this.flushAutomaticFolderEncoding();
    }, 800);
  }

  private async flushAutomaticFolderEncoding(): Promise<void> {
    const paths = [...this.automaticFolderEncodingPaths];
    this.automaticFolderEncodingPaths.clear();
    if (paths.length === 0) return;
    this.automaticFolderEncodingTail = this.automaticFolderEncodingTail
      .catch(() => {})
      .then(() => this.processAutomaticFolderEncoding(paths));
    await this.automaticFolderEncodingTail;
  }

  private async processAutomaticFolderEncoding(paths: string[]): Promise<void> {
    for (const path of paths) {
      try {
        const preview = await previewFolderEncoding(this.app, path, {
          whitelist: this.settings.folderAutoEncodingWhitelist,
        });
        if (preview.blockedReason || !preview.changed) continue;
        const expiresAt = Date.now() + 5000;
        this.automaticFolderEncodingIgnore.set(path, expiresAt);
        this.automaticFolderEncodingIgnore.set(preview.newPath, expiresAt);
        const result = await commitFolderEncoding(this.app, preview);
        this.recordActivity({
          time: new Date().toISOString(),
          kind: 'system',
          status: 'succeeded',
          action: 'automatic-folder-encoding',
          path: result.preview.newPath,
        });
        new Notice(
          `📁 文件夹已自动编码：${result.preview.newName}`
          + (result.preview.warning ? `（${result.preview.warning}）` : ''),
        );
      } catch (error) {
        // 目标占用通常会伴随一次 rename 事件；短窗口抑制同一路径，避免重复刷屏。
        this.automaticFolderEncodingIgnore.set(path, Date.now() + 30000);
        this.recordActivity({
          time: new Date().toISOString(),
          kind: 'system',
          status: 'failed',
          action: 'automatic-folder-encoding',
          path,
          errorCode: 'FOLDER_ENCODING_FAILED',
        });
        new Notice(`⚠️ 文件夹自动编码失败：${messageOf(error)}；可右键手动设置`);
        console.warn('[fs-TB] automatic folder encoding failed:', error);
      }
    }
  }

  private queueAutomaticRecognition(file: TAbstractFile): void {
    if (!this.settings.automaticRecognition || !this.automaticRecognitionReady) return;
    const path = file.path.replace(/^\/+/, '');
    const ignoredUntil = this.automaticRecognitionIgnore.get(path);
    if (ignoredUntil) {
      if (ignoredUntil > Date.now()) return;
      this.automaticRecognitionIgnore.delete(path);
    }
    if (!path.toLowerCase().endsWith('.md') || isProtectedRecognitionPath(path)) return;
    this.automaticRecognitionPaths.add(path);
    if (this.automaticRecognitionTimer) clearTimeout(this.automaticRecognitionTimer);
    this.automaticRecognitionTimer = setTimeout(() => {
      this.automaticRecognitionTimer = undefined;
      void this.flushAutomaticRecognition();
    }, 800);
  }

  private async flushAutomaticRecognition(): Promise<void> {
    const paths = [...this.automaticRecognitionPaths];
    this.automaticRecognitionPaths.clear();
    if (paths.length === 0 || !this.knowledgeWorkflow) return;
    this.automaticRecognitionTail = this.automaticRecognitionTail
      .catch(() => {})
      .then(() => this.processAutomaticRecognition(paths));
    await this.automaticRecognitionTail;
  }

  private async processAutomaticRecognition(paths: string[]): Promise<void> {
    try {
      const plan = await this.knowledgeWorkflow.previewTargets(paths, {
        kind: paths.length > 1 ? 'selection' : 'file',
        depth: 'direct',
        mode: 'auto',
      });
      // 自动模式会把每个冲突同时记录为 blocker 和 conflict；以 blocker 计数，避免同一篇重复提示。
      const skipped = plan.blockedReasons.length;
      if (plan.items.length === 0) {
        if (skipped > 0) {
          this.recordActivity({
            time: new Date().toISOString(),
            kind: 'system',
            status: 'failed',
            action: 'automatic-recognition',
            path: paths[0],
            errorCode: 'KNOWLEDGE_PLAN_BLOCKED',
          });
          new Notice(`⚠️ 自动编码跳过 ${skipped} 项：请右键手动修正`);
        }
        return;
      }

      const result = await this.commitAutomaticKnowledgePlan(plan);
      this.recordActivity({
        time: new Date().toISOString(),
        kind: 'system',
        status: 'succeeded',
        action: 'automatic-recognition',
        path: paths[0],
      });
      new Notice(
        `✅ 自动编码完成：${result.changedPaths.length} 篇`
        + (skipped ? `；${skipped} 项跳过，请右键手动修正` : ''),
      );
    } catch (error) {
      const expiresAt = Date.now() + 30000;
      for (const path of paths) this.automaticRecognitionIgnore.set(path, expiresAt);
      this.recordActivity({
        time: new Date().toISOString(),
        kind: 'system',
        status: 'failed',
        action: 'automatic-recognition',
        path: paths[0],
        errorCode: 'KNOWLEDGE_AUTO_COMMIT_FAILED',
      });
      new Notice(`⚠️ 自动编码失败：${messageOf(error)}；请右键手动修正`);
      console.warn('[fs-TB] automatic recognition failed:', error);
    }
  }

  /** 自动编码唯一写入口；右键纠错仍走显式预览。 */
  async commitAutomaticKnowledgePlan(plan: KnowledgeChangePlan): Promise<KnowledgeTransactionResult> {
    const expiresAt = Date.now() + 5000;
    for (const item of plan.items) {
      this.automaticRecognitionIgnore.set(item.originalPath, expiresAt);
      this.automaticRecognitionIgnore.set(item.newPath, expiresAt);
    }
    return this.knowledgeWorkflow.commitPlan(plan.operationId);
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
      createKnowledgeProposal: (input) => this.createKnowledgeProposal(input),
    });
    routes.set('/fetch', (ctx) => {
      const req = ctx.body as FetchRequest;
      const documentKey = `document:${req?.node_token ?? ''}`;
      const directoryKey = `directory:${normalizeVaultDir(req?.dir ?? this.settings.defaultDir)}`;
      return this.withActivity('fetch', () => this.syncCoordinator.run(documentKey, req?.requestId, () =>
        this.syncCoordinator.run(directoryKey, undefined, () => fetchHandler(ctx))));
    });
    const clipHandler = createClipHandler({
      app: this.app,
      settings: this.settings,
      notice: (m) => new Notice(m),
      createKnowledgeProposal: (input) => this.createKnowledgeProposal(input),
    });
    routes.set('/clip', (ctx) => {
      const req = ctx.body as ClipRequest;
      const key = req?.appendPath ? `clip:${req.appendPath}` : `clip:${req?.requestId ?? 'anonymous'}`;
      return this.withActivity('clip', () => this.syncCoordinator.run(key, req?.requestId, () => clipHandler(ctx)));
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
      return this.withActivity('pushback', () => this.syncCoordinator.run(key, req?.requestId, () => pushbackHandler(ctx)));
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

  private async withActivity<T>(kind: ActivityKind, task: () => Promise<T>): Promise<T> {
    try {
      const result = await task();
      const value = result as Record<string, unknown>;
      this.recordActivity({
        time: new Date().toISOString(),
        kind,
        status: value.action === 'skipped' ? 'skipped' : 'succeeded',
        action: value.action,
        title: value.feishu_title ?? value.title,
        path: value.path,
      });
      return result;
    } catch (error) {
      this.recordActivity({
        time: new Date().toISOString(),
        kind,
        status: 'failed',
        errorCode: (error as { code?: unknown })?.code ?? 'INTERNAL',
      });
      throw error;
    }
  }

  async createKnowledgeProposal(input: {
    paths: string[];
    source: 'fetch' | 'clip';
  }): Promise<{ proposalId: string; protocolVersion: typeof PROTOCOL_VERSION }> {
    const plan = await this.knowledgeWorkflow.previewTargets(input.paths, {
      kind: input.paths.length > 1 ? 'selection' : 'file',
      depth: 'direct',
      mode: 'organize',
    });
    this.pendingKnowledgePlans = [
      plan,
      ...this.pendingKnowledgePlans.filter((item) => item.operationId !== plan.operationId),
    ].slice(0, 20);
    this.recordActivity({
      time: new Date().toISOString(),
      kind: 'system',
      status: plan.blockedReasons.length ? 'failed' : 'succeeded',
      action: `${input.source}-proposal`,
      path: input.paths[0],
      errorCode: plan.blockedReasons.length ? 'KNOWLEDGE_PLAN_BLOCKED' : undefined,
    });
    return {
      proposalId: plan.operationId,
      protocolVersion: PROTOCOL_VERSION,
    };
  }

  getPendingKnowledgePlans(): readonly KnowledgeChangePlan[] {
    return this.pendingKnowledgePlans;
  }

  consumeKnowledgePlan(operationId: string): void {
    this.pendingKnowledgePlans = this.pendingKnowledgePlans
      .filter((plan) => plan.operationId !== operationId);
  }

  private recordKnowledgeTransaction(result: KnowledgeTransactionResult): void {
    this.recordActivity({
      time: new Date().toISOString(),
      kind: 'system',
      status: result.status === 'committed' || result.status === 'rolled_back'
        ? 'succeeded'
        : 'failed',
      action: `knowledge-${result.status}`,
      path: result.changedPaths[0],
      errorCode: result.status === 'rollback_failed' ? 'KNOWLEDGE_ROLLBACK_FAILED' : undefined,
    });
  }

  private recordActivity(record: Record<string, unknown>): void {
    this.state.recentSyncs = appendActivity(this.state.recentSyncs, record) as RecentSync[];
    this.settings.recentActivity = this.state.recentSyncs;
    this.activitySaveTail = this.activitySaveTail
      .then(() => this.saveSettings())
      .catch((error) => console.warn('[fs-TB] activity persistence failed:', error));
  }
}

// Obsidian 插件入口：必须默认导出 Plugin 子类
export default FeishuSyncPlugin;

function isProtectedRecognitionPath(path: string): boolean {
  return PROTECTED_RECOGNITION_PATH_RE.test(path.replace(/^\/+/, ''))
    || isProtectedDocumentPath(path);
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
