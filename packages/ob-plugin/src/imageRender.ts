/**
 * 图片预览渲染。依据 `00_同步方案设计_v2.md` §3.3 + `03_格式规范.md` §六。
 *
 * OB md 里图片写成 `![](feishu://FILE_TOKEN)`，渲染时调 lark-cli 换临时链接。
 * 带 LRU 缓存（避免每次渲染都下载），缓存目录在 vault 下 `.feishu-sync/cache/`。
 */
import type { Plugin } from 'obsidian';
import { Notice, Platform } from 'obsidian';
import * as path from 'node:path';
import { run } from './lark/cli.js';
import { validateImageToken } from './vaultPath.js';

const CACHE_DIR = '.feishu-sync/cache';

/**
 * 注册图片渲染处理器。
 * 拦截渲染后的 <img src="feishu://TOKEN">，换成 lark-cli 下载的本地临时文件。
 */
export function registerImageRenderer(plugin: Plugin): void {
  if (!Platform.isDesktopApp) return;

  const processImages = async (root: ParentNode): Promise<void> => {
    const imgs: HTMLImageElement[] = [];
    if (root instanceof HTMLImageElement) imgs.push(root);
    imgs.push(...Array.from(root.querySelectorAll<HTMLImageElement>('img')));
    await Promise.all(imgs.map((img) => renderImage(plugin, img)));
  };

  // MarkdownPostProcessor 只覆盖阅读视图；Live Preview 使用 CodeMirror 自己
  // 创建 img，因此另加一个 DOM 观察器，保证两种视图都能处理 feishu:// 图片。
  plugin.registerMarkdownPostProcessor(async (el) => {
    await processImages(el);
  });
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE) void processImages(node as Element);
      }
    }
  });
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
    void processImages(document.body);
  }
  plugin.register(() => observer.disconnect());
}

async function renderImage(plugin: Plugin, img: HTMLImageElement): Promise<void> {
  const src = img.getAttribute('src') || '';
  if (!src.startsWith('feishu://')) return;
  if (img.dataset.knowflowImageState) return;
  img.dataset.knowflowImageState = 'pending';

  try {
    const token = validateImageToken(src.slice('feishu://'.length));
    const localPath = await resolveImage(plugin, token);
    // 视图在下载期间可能已经被关闭或换成了别的资源，避免旧任务覆盖新内容。
    if (img.getAttribute('src') !== src) return;
    if (localPath) {
      // 使用 Vault adapter 的官方资源 URI，不手工拼接绝对路径，也不要求
      // metadata cache 先建立 TFile；这正是 Live Preview 所需的路径形式。
      const adapter = plugin.app.vault.adapter as typeof plugin.app.vault.adapter & {
        getResourcePath?: (normalizedPath: string) => string;
        getBasePath?: () => string;
      };
      const resourcePath = adapter.getResourcePath?.(localPath);
      if (resourcePath) {
        img.setAttribute('src', resourcePath);
      } else {
        const vaultBase = adapter.getBasePath?.() ?? '';
        img.setAttribute('src', `app://local/${path.join(vaultBase, localPath)}`);
      }
      img.dataset.knowflowImageState = 'resolved';
    } else {
      img.setAttribute('alt', `[飞书图片 ${token.slice(0, 8)} 加载失败]`);
      img.removeAttribute('src');
      img.dataset.knowflowImageState = 'failed';
    }
  } catch (err) {
    console.warn('[sync/image] render failed:', err);
    img.setAttribute('alt', '[飞书图片加载失败]');
    img.removeAttribute('src');
    img.dataset.knowflowImageState = 'failed';
  }
}

/**
 * 解析单个飞书图片 token → 本地缓存路径。
 * 命中缓存直接返回，否则调 lark-cli docs +media-download 下载。
 */
const resolving = new Map<string, Promise<string | null>>();

async function resolveImage(plugin: Plugin, token: string): Promise<string | null> {
  // 并发去重（同一 token 多个 img 同时渲染只下载一次）
  if (resolving.has(token)) return resolving.get(token)!;

  const promise = doResolveImage(plugin, token);
  resolving.set(token, promise);
  try {
    return await promise;
  } finally {
    resolving.delete(token);
  }
}

async function doResolveImage(plugin: Plugin, token: string): Promise<string | null> {
  const { adapter } = plugin.app.vault;
  const ext = '.png'; // 飞书图片默认 png，无法预知格式，统一 png
  const cachePath = `${CACHE_DIR}/${token}${ext}`;

  // 命中缓存
  if (await adapter.exists(cachePath)) {
    return cachePath;
  }

  // 确保缓存目录存在
  try {
    if (!(await adapter.exists(CACHE_DIR))) {
      await adapter.mkdir(CACHE_DIR);
    }
  } catch {
    /* ignore */
  }

  // lark-cli 的 --output 只接受当前工作目录内的相对路径。
  // 让它在 Vault 根目录执行，既满足 CLI 安全校验，又保持缓存路径可由 Vault adapter 管理。
  const vaultBase = (adapter as { getBasePath?: () => string }).getBasePath?.() ?? process.cwd();

  try {
    run(['docs', '+media-download', '--token', token, '--output', cachePath], {
      cwd: vaultBase,
      timeout: 30000,
    });
    return cachePath;
  } catch (err) {
    console.warn('[sync/image] media-download failed:', token, err);
    return null;
  }
}

/**
 * 清理过期缓存。依据设置 cacheCleanup 周期。
 */
export async function cleanupImageCache(plugin: Plugin, mode: 'daily' | 'weekly' | 'monthly' | 'never'): Promise<void> {
  if (mode === 'never') return;

  const { adapter } = plugin.app.vault;
  if (!(await adapter.exists(CACHE_DIR))) return;

  const now = Date.now();
  const ttlMs =
    mode === 'daily' ? 24 * 3600 * 1000 :
    mode === 'weekly' ? 7 * 24 * 3600 * 1000 :
    30 * 24 * 3600 * 1000;

  let cleaned = 0;
  try {
    const files = await adapter.list(CACHE_DIR);
    for (const f of files.files) {
      try {
        const stat = await adapter.stat(f);
        if (stat?.mtime && now - stat.mtime > ttlMs) {
          await adapter.remove(f);
          cleaned++;
        }
      } catch {
        continue;
      }
    }
  } catch (err) {
    console.warn('[sync/image] cleanup failed:', err);
  }

  if (cleaned > 0) {
    new Notice(`🧹 已清理 ${cleaned} 个过期图片缓存`);
  }
}
