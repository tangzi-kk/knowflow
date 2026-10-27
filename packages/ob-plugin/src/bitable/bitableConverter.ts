/**
 * 飞书多维表格 (Bitable) ↔ Obsidian 转换器。
 * 依据 `docs/design/feishu-obsidian-format.md` §3.4。
 *
 * 核心能力：
 * 1. normalizeFieldValue()：智能清洗飞书各种复杂字段类型（人员、单选多选、日期、链接、附件）；
 * 2. convertRecordToMarkdown()：将单条数据表行记录转换为带独立 YAML Frontmatter 的 Markdown 卡片；
 * 3. generateBitableIndex()：生成数据表目录根索引 `_view.md`，内置 Dataview 动态查询与 Projects 插件引导；
 * 4. convertEmbeddedBitableToCallout()：将飞书云文档中的嵌入式 bitable block 转换为优雅的 Callout。
 */

import { dumpCustomFrontmatter, sanitizeFilename, withMdExt } from '@sync/shared';
import type {
  BitableIndexOptions,
  ConvertRecordOptions,
  ConvertedRecordResult,
} from './bitableTypes.js';

/**
 * 归一化清洗飞书 Base 单个单元格值。
 */
export function normalizeFieldValue(value: unknown, fieldName = ''): unknown {
  if (value === null || value === undefined) {
    return null;
  }

  // 基础原始类型
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    // 若值在时间戳区间（> 100000000000，即 1973 年之后）且字段名带有日期/时间语义，转为 YYYY-MM-DD
    const isDateField = /(?:date|time|日期|时间|截止|创建|更新)/i.test(fieldName);
    if (isDateField && value > 100_000_000_000 && value < 4_000_000_000_000) {
      try {
        const d = new Date(value);
        if (!Number.isNaN(d.getTime())) {
          return d.toISOString().split('T')[0];
        }
      } catch { /* fall back to raw number */ }
    }
    return value;
  }
  if (typeof value === 'string') {
    return value.trim();
  }

  // 数组处理
  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    
    // 元素均为纯字符串
    if (value.every((item) => typeof item === 'string')) {
      return value.map((s) => s.trim()).filter(Boolean);
    }

    // 飞书富文本段落数组 [{ type: 'text', text: '...' }]
    const hasRichTextSpans = value.every(
      (item) => typeof item === 'object' && item !== null && (item as { type?: string }).type === 'text' && 'text' in item
    );
    if (hasRichTextSpans) {
      return value.map((item) => (item as { text?: string }).text ?? '').join('');
    }

    // 人员列表 [{ name: '张三', id: 'ou_...' }]
    const hasUsers = value.every(
      (item) => typeof item === 'object' && item !== null && 'name' in item && ('id' in item || 'en_name' in item)
    );
    if (hasUsers) {
      return value.map((item) => (item as { name: string }).name).filter(Boolean);
    }

    // 附件列表 [{ name: 'file.pdf', file_token: 'box...' }]
    const hasAttachments = value.every(
      (item) => typeof item === 'object' && item !== null && 'file_token' in item
    );
    if (hasAttachments) {
      return value.map((item) => (item as { name?: string; file_token: string }).name ?? item.file_token);
    }

    // 选项列表 [{ text: 'P0' }] 或 [{ name: 'P0' }]
    const hasOptions = value.every(
      (item) => typeof item === 'object' && item !== null && ('text' in item || 'name' in item)
    );
    if (hasOptions) {
      return value
        .map((item) => (item as { text?: string; name?: string }).text ?? (item as { text?: string; name?: string }).name ?? '')
        .filter(Boolean);
    }

    // 兜底递归清洗
    return value.map((item) => normalizeFieldValue(item, fieldName)).filter((v) => v !== null);
  }

  // 单个对象处理
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    // 超链接 { text: '百度', link: 'https://baidu.com' }
    if ('link' in obj && typeof obj.link === 'string') {
      const linkText = typeof obj.text === 'string' && obj.text.trim() ? obj.text.trim() : obj.link;
      return `[${linkText}](${obj.link})`;
    }
    // 单选标签 { text: '已完成' }
    if ('text' in obj && typeof obj.text === 'string') {
      return obj.text.trim();
    }
    // 泛人员 { name: '李四' }
    if ('name' in obj && typeof obj.name === 'string') {
      return obj.name.trim();
    }
  }

  return String(value);
}

/**
 * 提取主字段（标题）。
 */
function resolvePrimaryTitle(fields: Record<string, unknown>, preferredFieldName?: string): { title: string; primaryKey: string } {
  if (preferredFieldName && preferredFieldName in fields) {
    const val = normalizeFieldValue(fields[preferredFieldName], preferredFieldName);
    if (val && typeof val === 'string') {
      return { title: val, primaryKey: preferredFieldName };
    }
  }

  // 候选常见主字段名
  const candidates = ['title', 'Title', '标题', '名称', '任务', '任务名称', '项目名称', '主题', 'Name', 'name'];
  for (const cand of candidates) {
    if (cand in fields) {
      const val = normalizeFieldValue(fields[cand], cand);
      if (val && typeof val === 'string' && val.trim()) {
        return { title: val.trim(), primaryKey: cand };
      }
    }
  }

  // 查找第一个非空的字符串字段
  for (const [key, rawVal] of Object.entries(fields)) {
    const val = normalizeFieldValue(rawVal, key);
    if (typeof val === 'string' && val.trim().length > 0 && val.length < 100) {
      return { title: val.trim(), primaryKey: key };
    }
  }

  return { title: '', primaryKey: '' };
}

/**
 * 将单条 Bitable 记录转换为 Obsidian Markdown 卡片。
 */
export function convertRecordToMarkdown(options: ConvertRecordOptions): ConvertedRecordResult {
  const { record, baseToken, tableId, tableName, primaryFieldName, tag } = options;
  const rawFields = record.fields ?? {};

  // 1. 标题提取与清洗
  const { title: resolvedTitle, primaryKey } = resolvePrimaryTitle(rawFields, primaryFieldName);
  const title = resolvedTitle || `记录-${record.record_id.slice(-6)}`;
  const safeFilename = sanitizeFilename(title) || record.record_id;
  const filename = withMdExt(safeFilename);

  // 2. 字段分离：哪些进入正文描述，哪些留在 YAML frontmatter
  const bodyFields: Array<{ name: string; content: string }> = [];
  const attachmentFields: Array<{ name: string; items: string[] }> = [];
  const frontmatter: Record<string, unknown> = {
    title,
    feishu_record_id: record.record_id,
    feishu_base_token: baseToken,
    feishu_table_id: tableId,
  };

  if (tableName) {
    frontmatter.feishu_table_name = tableName;
  }
  if (tag) {
    frontmatter.标签 = tag;
  }
  frontmatter.sync_time = new Date().toISOString();

  // 常见正文描述候选字段
  const isDescriptionField = (name: string) => /(?:描述|详情|备注|内容|正文|description|detail|details|content|note|notes|body)/i.test(name);
  const isAttachmentField = (name: string) => /(?:附件|文件|attachment|files?)/i.test(name);

  for (const [k, v] of Object.entries(rawFields)) {
    if (v === null || v === undefined) continue;
    const normalized = normalizeFieldValue(v, k);
    if (normalized === null || normalized === undefined || normalized === '') continue;

    // 检查是否提取为长篇正文
    if (isDescriptionField(k) && typeof normalized === 'string' && normalized.length > 20) {
      bodyFields.push({ name: k, content: normalized });
      frontmatter[k] = normalized.length > 80 ? `${normalized.slice(0, 77)}...` : normalized;
      continue;
    }

    // 检查是否为附件字段
    if (isAttachmentField(k) && Array.isArray(normalized)) {
      attachmentFields.push({ name: k, items: normalized.map(String) });
      frontmatter[k] = normalized;
      continue;
    }

    // 其他常规字段直接写入 frontmatter
    if (k !== primaryKey || !frontmatter.title) {
      frontmatter[k] = normalized;
    }
  }

  // 3. 构建正文 Markdown Body
  const bodyLines: string[] = [`# ${title}`, ''];

  if (bodyFields.length > 0) {
    for (const bf of bodyFields) {
      bodyLines.push(`## ${bf.name}`, '', bf.content, '');
    }
  }

  if (attachmentFields.length > 0) {
    bodyLines.push('## 📎 附件', '');
    for (const af of attachmentFields) {
      for (const item of af.items) {
        bodyLines.push(`- 📄 ${item}`);
      }
    }
    bodyLines.push('');
  }

  // 如果既没有长正文也没有附件，追加一个简要属性卡片
  if (bodyFields.length === 0 && attachmentFields.length === 0) {
    bodyLines.push('> [!info] 📊 记录详情', `> 来自多维表格：**${tableName || '数据表'}**`, '');
  }

  const body = bodyLines.join('\n').trimEnd();
  const fmString = dumpCustomFrontmatter(frontmatter);
  const fullMarkdown = `${fmString}\n\n${body}\n`;

  return {
    recordId: record.record_id,
    filename,
    frontmatter,
    body,
    fullMarkdown,
  };
}

/**
 * 生成数据表目录的索引视图文件 `_view.md`。
 */
export function generateBitableIndex(options: BitableIndexOptions): string {
  const { baseToken, tableId, tableName, fields, recordCount, primaryField } = options;

  // 挑选展示列（过滤掉内部 ID 和超大字段，最多取 6 列）
  const displayColumns = fields
    .map((f) => f.name)
    .filter((name) => name !== primaryField && !/(?:token|id|uuid|记录ID)/i.test(name))
    .slice(0, 5);

  const dataviewCols = displayColumns.length > 0
    ? `TABLE ${displayColumns.join(', ')}`
    : 'TABLE file.mtime AS "修改时间"';

  const statusField = displayColumns.find((c) => /(?:状态|status|阶段|优先级|priority)/i.test(c)) || '状态';

  const fm = dumpCustomFrontmatter({
    title: `${tableName} · 视图总览`,
    feishu_base_token: baseToken,
    feishu_table_id: tableId,
    feishu_table_name: tableName,
    total_records: recordCount,
    sync_time: new Date().toISOString(),
  });

  return `${fm}

# 📊 ${tableName}

- **飞书 Base 来源**：[在飞书中打开多维表格](https://feishu.cn/base/${baseToken}?table=${tableId})
- **Base Token**：\`${baseToken}\`
- **Table ID**：\`${tableId}\`
- **本地记录总数**：${recordCount} 篇卡片

---

## 📋 Dataview 表格动态视图

\`\`\`dataview
${dataviewCols}
FROM "./"
WHERE file.name != "_view"
SORT file.ctime DESC
\`\`\`

---

> [!tip] 💡 Obsidian Projects 插件视图指引
> 本目录已完全适配 **Obsidian Projects** 插件：
> 1. 打开 Projects 侧边栏，新建项目并选择数据源为当前文件夹；
> 2. **表格视图 (Table)**：查看所有字段并支持双击单元格就地编辑 Frontmatter；
> 3. **看板视图 (Board)**：推荐选用 \`${statusField}\` 字段进行分组，实现卡片拖拽流转；
> 4. **画廊视图 (Gallery)**：展示多维表格卡片流。
`;
}

/**
 * 将云文档中的嵌入式 bitable block 转换为优雅的 Callout 占位。
 */
export function convertEmbeddedBitableToCallout(options: {
  baseToken: string;
  tableId?: string;
  viewId?: string;
  title?: string;
}): string {
  const { baseToken, tableId, viewId, title = '多维表格' } = options;
  const params = new URLSearchParams();
  if (tableId) params.set('table', tableId);
  if (viewId) params.set('view', viewId);
  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const url = `https://feishu.cn/base/${baseToken}${queryStr}`;

  const tablePart = tableId ? ` | **Table ID**: \`${tableId}\`` : '';

  return [
    `> [!bitable] 📊 多维表格：${title}`,
    `> 🔗 **飞书直达**：[${title}](${url})`,
    `> 📌 **Base Token**: \`${baseToken}\`${tablePart}`,
    `> 💡 *该组件为多维表格视图。本地支持通过 KnowFlow Bitable 功能将其拉取为独立卡片库。*`,
  ].join('\n');
}
