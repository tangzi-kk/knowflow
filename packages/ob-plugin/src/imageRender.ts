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

  plugin.registerMarkdownPostProcessor(async (el) => {
    const imgs = el.querySelectorAll('img');
    for (const img of Array.from(imgs)) {
      const src = img.getAttribute('src') || '';
      if (!src.startsWith('feishu://')) continue;

      try {
        const token = validateImageToken(src.slice('feishu://'.length));
        const localPath = await resolveImage(plugin, token);
        if (localPath) {
          // 用 vault:// 链接或 app://local/ 链接
          const vaultBase = (
            plugin.app.vault.adapter as typeof plugin.app.vault.adapter & { getBasePath?: () => string }
          ).getBasePath?.() ?? '';
          const fullPath = path.join(vaultBase, localPath);
          img.setAttribute('src', `app://local/${fullPath}`);
        } else {
          img.setAttribute('alt', `[飞书图片 ${token.slice(0, 8)} 加载失败]`);
          img.setAttribute('src', '');
        }
      } catch (err) {
        console.warn('[sync/image] render failed:', err);
        img.setAttribute('alt', '[飞书图片加载失败]');
      }
    }
  });
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

  // 下载到临时本地路径（lark-cli 需要本地文件系统路径）
  const vaultBase = (adapter as { getBasePath?: () => string }).getBasePath?.() ?? process.cwd();
  const localFullPath = path.join(vaultBase, cachePath);

  try {
    run(['docs', '+media-download', '--token', token, '--output', localFullPath], {
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
