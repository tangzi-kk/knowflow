/**
 * 飞书多维表格 (Bitable) 核心类型定义。
 * 依据 `docs/design/feishu-obsidian-format.md` §3.4。
 */
import type { Tag } from '@sync/shared';

export interface BitableRecord {
  record_id: string;
  fields: Record<string, unknown>;
  created_time?: number;
  last_modified_time?: number;
}

export interface BitableField {
  field_id: string;
  field_name: string;
  type: number;
  ui_type?: string;
  property?: Record<string, unknown>;
}

export interface BitableTable {
  table_id: string;
  name: string;
  revision?: number;
}

export interface ConvertedRecordResult {
  recordId: string;
  filename: string;
  frontmatter: Record<string, unknown>;
  body: string;
  fullMarkdown: string;
}

export interface BitableIndexOptions {
  baseToken: string;
  tableId: string;
  tableName: string;
  fields: Array<{ name: string; type?: string | number }>;
  recordCount: number;
  primaryField?: string;
}

export interface ConvertRecordOptions {
  record: BitableRecord;
  baseToken: string;
  tableId: string;
  tableName?: string;
  primaryFieldName?: string;
  tag?: Tag;
}
