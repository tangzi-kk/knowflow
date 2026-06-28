/**
 * 同步绑定 + YAML frontmatter 数据模型。
 *
 * 依据：`设计方案/02_YAML字段规范.md`（权威 v1）+ `00_同步方案设计_v2.md` §5.1。
 * 铁律：同步绑定组（feishu_*）由插件自动写，用户不可手改。
 */

/** 同步绑定组（核心，不可手改）。对应 YAML 同步绑定段。 */
export interface SyncBinding {
  /** 飞书 wiki node_token（唯一绑定）。 */
  feishu_id: string;
  /** 飞书 docx obj_token（回写用）。 */
  feishu_doc_id: string;
  /** 飞书原始标题（含 emoji，回写时用）。 */
  feishu_title: string;
  /** 上次同步内容 hash（轻核验用，sha256 hex）。 */
  sync_hash?: string;
  /** 上次同步时间（ISO8601，带时区）。 */
  sync_time?: string;
}

/** 标签封闭枚举。依据 `02_YAML字段规范.md` §2.2。 */
export type Tag = 'S' | 'X' | 'L' | 'Z' | 'Q' | 'J';

export const TAG_NAMES: Record<Tag, string> = {
  S: '📥收集',
  X: '🎯项目',
  L: '🌳领域',
  Z: '📚资源',
  Q: '💡灵感',
  J: '🛠️技能',
};

/** 知识库元数据（OB 维护，回写飞书成 callout）。依据 `02_YAML字段规范.md`。 */
export interface KnowledgeMeta {
  /** 标签，封闭枚举。置信度 <0.6 → S。 */
  标签?: Tag;
  /** 编码，auto-rename 分配，格式 YY_MMDD_标签_序号[_子序号]。 */
  编码?: string;
  /** 输入完整路径（最深注册路径）。 */
  输入?: string;
  /** 日期，ISO 格式 YYYY-MM-DD。 */
  日期?: string;
  /** 日期索引，可选项数组。 */
  日期索引?: string[];
  /** 关键词，顿号分隔。 */
  关键词?: string;
  /** 概述，给后续 AI 快速识别文档内容用。 */
  概述?: string;
  /** 评分 1-5；未评分时保留空值以显式占位。 */
  评分?: number | '';
  /** 评分显示串，如 "🌟🌟🌟｜实践"。 */
  评分_显示?: string;
  /** 索引_知识库（正财/偏财/...）。 */
  索引_知识库?: string;
  /** 索引_颜色。 */
  索引_颜色?: string;
  /** 索引_操作&反馈，两组选一（想法/规划/执行/受挫/克服 × 初稿/审核/修改/完成/复盘）。 */
  '索引_操作&反馈'?: string[];
  /** 索引_块，多选（具象/抽象 × 简单/困难）。 */
  索引_块?: string[];
  /** 索引_风险，零或多个。 */
  索引_风险?: string[];
}

/** OB 文件完整 frontmatter = 同步绑定 + 知识库元数据。 */
export interface YAMLFrontmatter extends SyncBinding, KnowledgeMeta {}

/** OB→飞书 callout 字段映射项。依据 `02_YAML字段规范.md` §五。 */
export interface CalloutFieldMap {
  /** YAML 字段名。 */
  field: keyof KnowledgeMeta;
  /** callout 里显示的中文标签。 */
  label: string;
  /** emoji（不带 variation selector）。 */
  emoji: string;
}

/**
 * YAML 字段 → 飞书 callout 行映射。依据 `02_YAML字段规范.md` §五。
 * 注意 emoji 全部不带 U+FE0F（飞书不认 VS，见 03 文档 §3.3）。
 */
export const CALLOUT_FIELD_MAP: CalloutFieldMap[] = [
  { field: '标签', label: '标签', emoji: '🏷' },
  { field: '编码', label: '编码', emoji: '🔢' },
  { field: '输入', label: '输入', emoji: '📥' },
  { field: '日期', label: '日期', emoji: '📅' },
  { field: '关键词', label: '关键词', emoji: '🔑' },
  { field: '评分_显示', label: '评分', emoji: '⭐' },
  { field: '索引_知识库', label: '索引', emoji: '💰' },
];

/** OB→飞书 callout 整体配色（合并信息块用）。 */
export const DOC_INFO_CALLOUT = {
  emoji: '📋',
  'background-color': 'light-blue',
  'border-color': 'blue',
} as const;

/** 飞书 callout 背景色 → OB callout 类型。依据 `03_格式规范.md` §3.1。 */
export const FEISHU_BG_TO_OB_CALLOUT: Record<string, string> = {
  'light-yellow': 'tip',
  'medium-red': 'warning',
  'light-green': 'success',
  'light-blue': 'info',
  'light-purple': 'note',
  'light-gray': 'quote',
  'light-orange': 'faq',
};

/** OB callout 类型 → 飞书 callout 配色。§3.1 反向。 */
export const OB_CALLOUT_TO_FEISHU: Record<string, { emoji: string; bg: string; border: string }> = {
  tip: { emoji: '💡', bg: 'light-yellow', border: 'yellow' },
  warning: { emoji: '⚠️', bg: 'medium-red', border: 'red' },
  success: { emoji: '✅', bg: 'light-green', border: 'green' },
  info: { emoji: 'ℹ️', bg: 'light-blue', border: 'blue' },
  note: { emoji: '📝', bg: 'light-purple', border: 'purple' },
  quote: { emoji: '💬', bg: 'light-gray', border: 'gray' },
  faq: { emoji: '❓', bg: 'light-orange', border: 'orange' },
  abstract: { emoji: '📋', bg: 'light-blue', border: 'blue' },
};
