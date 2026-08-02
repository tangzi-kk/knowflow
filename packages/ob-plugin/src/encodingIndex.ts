/**
 * 只读扫描 Vault 后重建编码索引，或导出最近同步活动。
 * 两类产物都写入插件运行目录 `.feishu-sync/`。
 */
import type { App } from 'obsidian';
import { inspectFrontmatter, TAG_NAMES, type Tag } from '@sync/shared';
import { FILE_PREFIX_RE, FULL_ENCODING_RE, SHORT_FILE_PREFIX_RE } from './knowledgeContract.js';
import type { RecentSync } from './settings.js';

const INDEX_PATH = '.feishu-sync/编码索引.md';
const RUNTIME_DIR = '.feishu-sync';
const PROTECTED_PATH_RE = /^(?:(?:.*\/)?AGENTS\.md$|🪧导引(?:\/|$)|\.[^/]+(?:\/|$))/;

interface IndexRow {
  code: string;
  tag: Tag | string;
  path: string;
  name: string;
}

interface VaultNodeLike {
  path: string;
  name: string;
  basename?: string;
  extension?: string;
}

export async function rebuildEncodingIndex(app: App): Promise<{ count: number; path: string }> {
  const rows: IndexRow[] = [];
  for (const raw of app.vault.getMarkdownFiles()) {
    const node = raw as unknown as VaultNodeLike;
    if (node.extension !== 'md' || typeof node.basename !== 'string') continue;
    if (PROTECTED_PATH_RE.test(node.path)) continue;

    let code = node.basename.match(FILE_PREFIX_RE)?.[1] ?? '';
    try {
      const inspected = inspectFrontmatter(await app.vault.read(raw as never));
      const yamlCode = typeof inspected.frontmatter?.编码 === 'string'
        ? inspected.frontmatter.编码.trim()
        : '';
      if (FULL_ENCODING_RE.test(yamlCode)) code = yamlCode;
    } catch {
      continue;
    }
    if (!FULL_ENCODING_RE.test(code)) continue;
    rows.push({
      code,
      tag: code.split('_')[2] as Tag,
      path: node.path,
      name: node.basename
        .replace(FILE_PREFIX_RE, '')
        .replace(SHORT_FILE_PREFIX_RE, '')
        .trim() || node.name,
    });
  }

  rows.sort((left, right) =>
    left.code.localeCompare(right.code) || left.path.localeCompare(right.path, 'zh-CN'));
  const duplicates = new Set(
    rows.filter((row, index) => rows.some((other, otherIndex) =>
      otherIndex !== index && other.code === row.code)).map((row) => row.code),
  );
  const lines = [
    '# 编码索引',
    '',
    `> KnowFlow 只读重建 · ${new Date().toLocaleString('zh-CN')} · 共 ${rows.length} 项`,
    '',
    '| 序号 | 核心编码 | 标签 | 语义名称 | 状态 | 链接 |',
    '| --- | --- | --- | --- | --- | --- |',
  ];
  rows.forEach((row, index) => {
    const tagName = row.tag in TAG_NAMES ? TAG_NAMES[row.tag as Tag] : String(row.tag);
    const status = duplicates.has(row.code) ? '❌重复' : '正常';
    lines.push(
      `| ${index + 1} | \`${row.code}\` | ${tagName} | ${escapeCell(row.name)} | ${status} | [[${row.path.replace(/\.md$/, '')}]] |`,
    );
  });

  await ensureDir(app, RUNTIME_DIR);
  await app.vault.adapter.write(INDEX_PATH, lines.join('\n'));
  return { count: rows.length, path: INDEX_PATH };
}

export async function exportActivityLog(
  app: App,
  recent: RecentSync[],
  vaultName: string,
): Promise<{ path: string; count: number }> {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:TZ.]/g, '');
  const path = `${RUNTIME_DIR}/同步日志-${stamp}.md`;
  const failed = recent.filter((record) => record.status === 'failed').length;
  const lines = [
    '# KnowFlow 同步日志',
    '',
    `> 导出时间：${now.toLocaleString('zh-CN')}`,
    '',
    '| 项目 | 值 |',
    '| --- | --- |',
    `| Vault | ${escapeCell(vaultName)} |`,
    `| 记录条数 | ${recent.length} |`,
    `| 失败条数 | ${failed} |`,
    '',
    '## 最近同步活动',
    '',
  ];
  if (!recent.length) {
    lines.push('_暂无同步记录。_');
  } else {
    lines.push('| 时间 | 类型 | 状态 | 标题/动作 | 路径 |');
    lines.push('| --- | --- | --- | --- | --- |');
    for (const record of recent) {
      const status = record.status === 'failed' ? '❌失败'
        : record.status === 'skipped' ? '⏭跳过' : '✅成功';
      lines.push(
        `| ${record.time.replace('T', ' ').slice(0, 19)} | ${record.kind} | ${status} | ${escapeCell(record.title || record.action || record.errorCode || '')} | ${escapeCell(record.path ?? '')} |`,
      );
    }
  }

  await ensureDir(app, RUNTIME_DIR);
  await app.vault.adapter.write(path, lines.join('\n'));
  return { path, count: recent.length };
}

async function ensureDir(app: App, path: string): Promise<void> {
  if (await app.vault.adapter.exists(path)) return;
  try {
    await app.vault.adapter.mkdir(path);
  } catch {
    if (!(await app.vault.adapter.exists(path))) throw new Error(`无法创建目录：${path}`);
  }
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
