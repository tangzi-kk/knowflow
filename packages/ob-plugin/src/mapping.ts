/**
 * 目录映射推导。依据 `01_OB↔飞书对比报告.md` + `00_同步方案设计_v2.md` §七。
 *
 * OB 25 个根目录 → 飞书 5 个顶级节点的映射规则：
 *   0️⃣输入 / S → 飞书"输入"
 *   1️⃣输出 / X → 飞书"输出"
 *   2️⃣🗃知识池 / Z / L / J / Q → 飞书"知识池"
 *   🪧导引 → 飞书"导引"
 *   3️⃣附件文件 → 飞书"附件"（特殊，非文档）
 *
 * 推导结果缓存到 `.feishu-sync/mapping.json`，不硬编码。
 */
import type { App } from 'obsidian';
import { Notice } from 'obsidian';
import { listWikiChildren } from './lark/cli.js';

const MAPPING_FILE = '.feishu-sync/mapping.json';

/** 单条映射：OB 路径 → 飞书节点。 */
export interface DirMapping {
  /** OB 相对路径，如 "0️⃣输入/💡碎片输入（闪念）"。 */
  obPath: string;
  /** 飞书 node_token。 */
  feishuNodeToken: string;
  /** 飞书节点标题。 */
  feishuTitle: string;
}

/** 映射缓存。 */
export interface MappingCache {
  /** 生成时间。 */
  generatedAt: string;
  /** space_id。 */
  spaceId: string;
  /** 顶级节点。 */
  topNodes: Array<{ token: string; title: string }>;
  /** 详细映射。 */
  mappings: DirMapping[];
}

/** OB 根目录 emoji → 飞书顶级节点标题（依据 01 对比报告）。 */
const ROOT_DIR_TO_FEISHU: Record<string, string> = {
  '0️⃣输入': '输入',
  '1️⃣输出': '输出',
  '2️⃣🗃知识池': '知识池',
  '3️⃣附件文件': '附件',
  '🪧导引': '导引',
};

/**
 * 推导并缓存目录映射。
 * 1. 拉飞书顶级节点列表
 * 2. 按 emoji 规则匹配 OB 根目录 → 飞书顶级
 * 3. 递归匹配子目录（按标题模糊匹配）
 * 4. 写入 .feishu-sync/mapping.json
 *
 * @returns 推导的映射数
 */
export async function refreshMapping(app: App, spaceId: string): Promise<number> {
  if (!spaceId) {
    new Notice('⚠️ 未配置 space_id，请在设置页填写');
    return 0;
  }

  new Notice('🔄 推导目录映射...');

  // 拉 5 个顶级节点
  const topNodes = listWikiChildren(spaceId, '');
  if (topNodes.length === 0) {
    new Notice('⚠️ 拉不到飞书顶级节点，请检查 space_id 和 lark-cli 登录态');
    return 0;
  }

  const mappings: DirMapping[] = [];

  // 顶级匹配
  for (const [obRoot, feishuTitle] of Object.entries(ROOT_DIR_TO_FEISHU)) {
    const matched = topNodes.find(n => n.title.includes(feishuTitle) || feishuTitle.includes(n.title));
    if (matched) {
      mappings.push({
        obPath: obRoot,
        feishuNodeToken: matched.node_token,
        feishuTitle: matched.title,
      });
    }
  }

  // 递归匹配子目录（一级即可，避免过深）
  const root = app.vault.getRoot();
  for (const child of root.children) {
    if (!child.name || child.name.startsWith('.')) continue;
    if (!(child.children?.length)) continue;
    // 找到这个根的飞书 token
    const rootMapping = mappings.find(m => m.obPath === child.name);
    if (!rootMapping) continue;

    // 拉飞书子节点
    const feishuChildren = listWikiChildren(spaceId, rootMapping.feishuNodeToken);
    for (const obSub of child.children) {
      if (!obSub.name || obSub.name.startsWith('.')) continue;
      // 模糊匹配（去掉编码前缀后比较）
      const cleanObName = obSub.name.replace(/^\d{2}_\d{4}_[SXZLQJ]\d+\s*/, '');
      const matched = feishuChildren.find(
        n => n.title.includes(cleanObName) || cleanObName.includes(n.title),
      );
      if (matched) {
        mappings.push({
          obPath: `${child.name}/${obSub.name}`,
          feishuNodeToken: matched.node_token,
          feishuTitle: matched.title,
        });
      }
    }
  }

  // 写缓存
  const cache: MappingCache = {
    generatedAt: new Date().toISOString(),
    spaceId,
    topNodes: topNodes.map(n => ({ token: n.node_token, title: n.title })),
    mappings,
  };

  await ensureConfigDir(app);
  await app.vault.adapter.write(MAPPING_FILE, JSON.stringify(cache, null, 2));

  new Notice(`✅ 目录映射已更新（${mappings.length} 条）`);
  return mappings.length;
}

/**
 * 读映射缓存。无缓存返回 null。
 */
export async function loadMapping(app: App): Promise<MappingCache | null> {
  try {
    if (!(await app.vault.adapter.exists(MAPPING_FILE))) return null;
    const raw = await app.vault.adapter.read(MAPPING_FILE);
    return JSON.parse(raw) as MappingCache;
  } catch (err) {
    console.warn('[sync/mapping] load failed:', err);
    return null;
  }
}

/**
 * 查 OB 路径对应的飞书节点 token。
 */
export function lookupFeishuNode(cache: MappingCache, obPath: string): DirMapping | null {
  // 精确匹配
  const exact = cache.mappings.find(m => m.obPath === obPath);
  if (exact) return exact;

  // 前缀匹配（取最长匹配）
  let best: DirMapping | null = null;
  for (const m of cache.mappings) {
    if (obPath.startsWith(m.obPath + '/') || obPath.startsWith(m.obPath)) {
      if (!best || m.obPath.length > best.obPath.length) best = m;
    }
  }
  return best;
}

async function ensureConfigDir(app: App): Promise<void> {
  const dir = '.feishu-sync';
  if (!(await app.vault.adapter.exists(dir))) {
    try {
      await app.vault.adapter.mkdir(dir);
    } catch {
      /* ignore */
    }
  }
}
