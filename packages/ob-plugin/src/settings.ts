/**
 * OB 插件设置接口 + 默认值。
 * 依据方案 §10（SettingsTab）。
 */
import type { TreeNode } from '@sync/shared';

export interface FeishuSyncSettings {
  /** 本地 HTTP server 端口（默认 4567）。 */
  port: number;
  /** 启动令牌（32 字节 hex，首次自动生成）。 */
  syncToken: string;
  /** lark-cli 路径（空=自动探测）。 */
  larkCliPath: string;
  /** 默认落地目录（相对 vault 根）。 */
  defaultDir: string;
  /** 自动触发 auto-rename 编码分配。 */
  autoRename: boolean;
  /** 自动登记删除（写飞书多维表格）。 */
  autoDeleteRegistry: boolean;
  /** 图片缓存清理周期。 */
  cacheCleanup: 'daily' | 'weekly' | 'monthly' | 'never';
  /** 保留装饰图片。 */
  keepDecorativeImages: boolean;
  /** 飞书知识库 space_id（目录映射用）。 */
  spaceId: string;
}

export const DEFAULT_SETTINGS: FeishuSyncSettings = {
  port: 4567,
  syncToken: '',
  larkCliPath: '',
  defaultDir: '0️⃣输入',
  autoRename: true,
  autoDeleteRegistry: true,
  cacheCleanup: 'weekly',
  keepDecorativeImages: true,
  spaceId: '7651314150060067803',
};

/** 插件运行时状态（不持久化）。 */
export interface PluginState {
  /** lark-cli 实际路径（探测/设置后的绝对路径）。 */
  larkCliResolved: string;
  /** lark-cli 版本号（如 "1.0.52"）。 */
  larkCliVersion: string;
  /** HTTP server 是否正在运行。 */
  serverRunning: boolean;
  /** 最近同步记录（内存中，最多 50 条）。 */
  recentSyncs: RecentSync[];
}

export interface RecentSync {
  time: string;
  node_token: string;
  title: string;
  path: string;
  action: 'created' | 'updated' | 'error';
  error?: string;
}
