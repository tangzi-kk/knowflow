import { Modal, Notice, TFile, TFolder, type App } from 'obsidian';
import {
  OBSIDIAN_LARK_DOC_ACTION,
  parseObsidianLarkDocParams,
  type FetchRequest,
} from '@sync/shared';
import type { FeishuSyncPlugin } from './main.js';
import { createFetchHandler } from './handlers/fetchHandler.js';
import { resolveNodeTokenFromUrl } from './lark/cli.js';

type TriggerSource = 'protocol' | 'command' | 'clipper';

interface TriggerInput {
  node_token?: string;
  obj_token?: string;
  space_id?: string;
  title?: string;
  url?: string;
  dir?: string;
  replace_path?: string;
  source: TriggerSource;
}

export function registerFetchEntrypoints(plugin: FeishuSyncPlugin): void {
  plugin.registerObsidianProtocolHandler(OBSIDIAN_LARK_DOC_ACTION, (params) => {
    const parsed = parseObsidianLarkDocParams(params);
    void triggerFetch(plugin, {
      node_token: parsed.node_token || parsed.token,
      obj_token: parsed.obj_token,
      space_id: parsed.space_id,
      title: parsed.title,
      url: parsed.url,
      dir: parsed.dir,
      source: 'protocol',
    });
  });

  plugin.addCommand({
    id: 'fetch-feishu-doc',
    name: '拉取飞书文档',
    callback: () => {
      new FeishuInputModal(plugin.app, async (value) => {
        const parsed = parseUserInput(value);
        await triggerFetch(plugin, {
          ...parsed,
          source: 'command',
        });
      }).open();
    },
  });

  plugin.registerEvent(
    plugin.app.vault.on('create', (file) => {
      if (!(file instanceof TFile) || file.extension !== 'md') return;
      window.setTimeout(() => {
        void handleClipperPlaceholder(plugin, file);
      }, 250);
    }),
  );
}

async function triggerFetch(plugin: FeishuSyncPlugin, input: TriggerInput): Promise<void> {
  const resolved = normalizeInput(plugin, input);
  if (!resolved.node_token) {
    new Notice('无法识别飞书文档 token');
    return;
  }

  const req: FetchRequest = {
    node_token: resolved.node_token,
    obj_token: resolved.obj_token,
    space_id: resolved.space_id || plugin.settings.spaceId,
    dir: resolved.dir || plugin.settings.defaultDir,
    filename: resolved.title,
    replace_path: resolved.replace_path,
  };

  const run = async (dir?: string) => {
    try {
      const handler = createFetchHandler({
        app: plugin.app,
        settings: plugin.settings,
        state: plugin.state,
        notice: (message) => new Notice(message),
      });
      const result = await handler({
        method: 'POST',
        url: '/fetch',
        path: '/fetch',
        query: new URLSearchParams(),
        body: { ...req, dir: dir || req.dir },
        token: '',
      });
      new Notice(`${result.action === 'created' ? '已创建' : '已更新'}：${result.path}`);
    } catch (err) {
      new Notice(`同步失败：${err instanceof Error ? err.message : String(err)}`);
    }
  };

  if (input.source === 'protocol' && !input.dir) {
    new FolderPickModal(plugin.app, plugin.settings.defaultDir, run).open();
    return;
  }

  await run(req.dir);
}

function normalizeInput(plugin: FeishuSyncPlugin, input: TriggerInput): TriggerInput {
  if (input.url) {
    const fromUrl = resolveNodeTokenFromUrl(input.url);
    return {
      ...input,
      node_token: input.node_token || fromUrl.node_token || input.obj_token || fromUrl.obj_token,
      obj_token: input.obj_token || fromUrl.obj_token,
    };
  }
  return {
    ...input,
    node_token: input.node_token || input.obj_token,
    space_id: input.space_id || plugin.settings.spaceId,
  };
}

function parseUserInput(value: string): Omit<TriggerInput, 'source'> {
  const trimmed = value.trim();
  if (/^https?:\/\//.test(trimmed)) {
    const parsed = resolveNodeTokenFromUrl(trimmed);
    return {
      node_token: parsed.node_token || parsed.obj_token,
      obj_token: parsed.obj_token,
      url: trimmed,
    };
  }
  const protocolParams = parseObsidianLarkDocParams(trimmed);
  if (protocolParams.token || protocolParams.node_token || protocolParams.obj_token) {
    return {
      node_token: protocolParams.node_token || protocolParams.token || protocolParams.obj_token,
      obj_token: protocolParams.obj_token,
      space_id: protocolParams.space_id,
      title: protocolParams.title,
      url: protocolParams.url,
      dir: protocolParams.dir,
    };
  }
  return { node_token: trimmed };
}

async function handleClipperPlaceholder(plugin: FeishuSyncPlugin, file: TFile): Promise<void> {
  let content = '';
  try {
    content = await plugin.app.vault.read(file);
  } catch {
    return;
  }

  const url = extractClipperUrl(content);
  if (!url) return;
  const parsed = resolveNodeTokenFromUrl(url);
  const nodeToken = parsed.node_token || parsed.obj_token;
  if (!nodeToken) return;

  await triggerFetch(plugin, {
    node_token: nodeToken,
    obj_token: parsed.obj_token,
    url,
    dir: file.parent?.path || plugin.settings.defaultDir,
    replace_path: file.path,
    source: 'clipper',
  });
}

function extractClipperUrl(content: string): string | null {
  const patterns = [
    /feishu_sync_url:\s*["']?([^\n"']+)/,
    /source:\s*["']?(https?:\/\/[^\n"']*(?:feishu\.cn|larksuite\.com)\/(?:wiki|docx|doc)\/[A-Za-z0-9]+)/,
    /(https?:\/\/[^\s)"']*(?:feishu\.cn|larksuite\.com)\/(?:wiki|docx|doc)\/[A-Za-z0-9]+)/,
  ];
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

class FeishuInputModal extends Modal {
  private inputEl!: HTMLInputElement;

  constructor(app: App, private onSubmit: (value: string) => Promise<void>) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText('拉取飞书文档');
    this.inputEl = this.contentEl.createEl('input', {
      type: 'text',
      placeholder: '粘贴飞书链接、token 或 obsidian://lark-doc 地址',
    });
    this.inputEl.style.width = '100%';
    this.inputEl.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      const value = this.inputEl.value.trim();
      if (!value) return;
      this.close();
      void this.onSubmit(value);
    });
    this.inputEl.focus();
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

class FolderPickModal extends Modal {
  constructor(
    app: App,
    private defaultDir: string,
    private onSubmit: (dir: string) => Promise<void>,
  ) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText('选择同步目录');
    const select = this.contentEl.createEl('select');
    select.style.width = '100%';

    const folders = getFolders(this.app);
    for (const folder of folders) {
      const option = select.createEl('option', {
        text: folder.path || '/',
        value: folder.path,
      });
      option.selected = folder.path === this.defaultDir;
    }

    const row = this.contentEl.createDiv();
    row.style.marginTop = '12px';
    const confirm = row.createEl('button', { text: '同步' });
    confirm.onclick = () => {
      const dir = select.value || this.defaultDir;
      this.close();
      void this.onSubmit(dir);
    };
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

function getFolders(app: App): TFolder[] {
  const folders = app.vault
    .getAllLoadedFiles()
    .filter((file): file is TFolder => file instanceof TFolder)
    .filter((folder) => !folder.path.startsWith('.obsidian') && !folder.path.startsWith('.feishu-sync'));
  return folders.length > 0 ? folders : [app.vault.getRoot()];
}
