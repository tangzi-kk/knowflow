/**
 * GET /tree — 返回 vault 目录树（给扩展目录下拉用）。
 *
 * 优化：
 * - 内存缓存（5 秒 TTL），避免每次请求遍历全 vault
 * - 支持 maxDepth 参数（query string），默认返回较完整目录树
 * - 支持 prefix 参数，展开指定子树
 */
import type { TreeResponse, TreeNode } from '@sync/shared';
import { type App, TFolder } from 'obsidian';
import type { RequestContext } from '../server.js';

const EXCLUDE = new Set([
  '插件',
  'scripts',
  '.obsidian',
  '.trash',
  '.feishu-sync',
  'node_modules',
]);

/** 缓存 */
let cacheDirs: TreeNode[] = [];
let cacheTime = 0;
const CACHE_TTL = 5_000; // 5 秒

function buildFullTree(app: App): TreeNode[] {
  const root = app.vault.getRoot();
  const dirs: TreeNode[] = [];

  const walk = (folder: TFolder, depth: number) => {
    if (depth > 0) {
      const name = folder.name;
      if (EXCLUDE.has(name) || name.startsWith('.')) return;
      dirs.push({ path: folder.path, label: name, depth });
    }
    for (const child of folder.children) {
      if (child instanceof TFolder) walk(child, depth + 1);
    }
  };

  walk(root, 0);

  dirs.sort((a, b) => a.path.localeCompare(b.path, 'zh'));

  return dirs;
}

export function createTreeHandler(app: App) {
  return async (ctx: RequestContext): Promise<TreeResponse> => {
    const now = Date.now();
    const maxDepth = parseInt(ctx.query.get('maxDepth') || '12', 10);
    const prefix = ctx.query.get('prefix') || '';

    // 刷新缓存
    if (now - cacheTime > CACHE_TTL || cacheDirs.length === 0) {
      cacheDirs = buildFullTree(app);
      cacheTime = now;
    }

    let dirs = cacheDirs;

    // prefix 筛选：只返回 prefix/ 下的子节点（depth 从 prefix 下一级开始）
    if (prefix) {
      const prefixDepth = prefix.split('/').length + 1;
      dirs = dirs.filter(d => d.path.startsWith(prefix + '/') && d.depth <= prefixDepth + 1);
      // 重新计算相对深度
      dirs = dirs.map(d => ({
        ...d,
        depth: d.depth - prefixDepth + 2,
      }));
    } else {
      // 按 maxDepth 截断
      dirs = dirs.filter(d => d.depth <= maxDepth);
    }

    return { ok: true, dirs };
  };
}

/** 导出刷新缓存（文件操作后调用）。 */
export function invalidateTreeCache(): void {
  cacheDirs = [];
  cacheTime = 0;
}
