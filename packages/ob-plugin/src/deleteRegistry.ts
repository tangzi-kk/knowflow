/**
 * 删除登记。依据 `00_同步方案设计_v2.md` §6.3。
 *
 * OB 删文件 → 若含 feishu_id → 登记到飞书"同步删除登记"多维表格。
 * 用户肉眼确认后，命令栏"批量清理已删除"调 wiki +node-delete。
 *
 * 表结构：删除时间 / OB原路径 / 飞书文档标题 / feishu_id / 状态
 * 状态枚举：待处理 / 已删除 / 已忽略
 */
import type { App, TFile } from 'obsidian';
import { Notice } from 'obsidian';
import { parseFrontmatter } from '@sync/shared';
import { run } from './lark/cli.js';

/** 删除登记表配置（设置页配置）。 */
export interface DeleteRegistryConfig {
  /** Base token。 */
  baseToken: string;
  /** 表 ID。 */
  tableId: string;
}

/** 登记记录。 */
export interface DeleteRecord {
  删除时间: string;
  OB原路径: string;
  飞书文档标题: string;
  feishu_id: string;
  状态: '待处理' | '已删除' | '已忽略';
}

/**
 * 监听 vault 文件删除事件。
 * 检测被删文件是否含 feishu_id，若是则登记。
 */
export function registerDeleteWatcher(
  app: App,
  getConfig: () => DeleteRegistryConfig | null,
  enabled: () => boolean,
  registerFn: (event: string, callback: (file: TFile) => void) => void,
): void {
  registerFn('delete', async (file: TFile) => {
    if (!enabled()) return;
    if (!file.path.endsWith('.md')) return;
    if (file.path.startsWith('.obsidian') || file.path.startsWith('.feishu-sync')) return;

    const config = getConfig();
    if (!config?.baseToken || !config?.tableId) return;

    try {
      // 文件已删，读不到内容了——从缓存或 frontmatter 历史
      // OB 的 delete 事件无法读已删文件内容，需要在 modify 时缓存 feishu_id
      // 这里简化：跳过（实际部署时用 fileop 缓存）
      console.log('[sync/delete] file deleted:', file.path);
    } catch (err) {
      console.warn('[sync/delete] watch failed:', err);
    }
  });
}

/**
 * 主动登记一条删除记录（在文件仍可读时调用）。
 */
export async function registerDeletion(
  config: DeleteRegistryConfig,
  file: TFile,
  app: App,
): Promise<boolean> {
  try {
    const content = await app.vault.read(file);
    const { frontmatter } = parseFrontmatter(content);
    const feishuId = frontmatter?.feishu_id as string | undefined;
    const feishuTitle = frontmatter?.feishu_title as string | undefined;

    if (!feishuId) return false; // 非飞书同步文件，跳过

    const record: DeleteRecord = {
      删除时间: new Date().toISOString(),
      OB原路径: file.path,
      飞书文档标题: feishuTitle || file.basename,
      feishu_id: feishuId,
      状态: '待处理',
    };

    // 写飞书多维表格
    run([
      'base', '+record-add',
      '--app-token', config.baseToken,
      '--table-id', config.tableId,
      '--fields', JSON.stringify(buildFields(record)),
    ], { json: true, timeout: 15000 });

    return true;
  } catch (err) {
    console.warn('[sync/delete] register failed:', err);
    return false;
  }
}

/**
 * 批量清理已登记的删除（调 wiki +node-delete）。
 * 仅清理"待处理"状态的记录。
 *
 * @returns { processed, deleted, failed }
 */
export async function cleanupRegisteredDeletions(
  config: DeleteRegistryConfig,
  spaceId: string,
): Promise<{ processed: number; deleted: number; failed: number }> {
  let processed = 0;
  let deleted = 0;
  let failed = 0;

  try {
    // 拉所有"待处理"记录
    const output = run([
      'base', '+record-list',
      '--app-token', config.baseToken,
      '--table-id', config.tableId,
      '--filter', JSON.stringify({
        conjunction: 'and',
        conditions: [{ field_name: '状态', operator: 'is', value: ['待处理'] }],
      }),
    ], { json: true, timeout: 30000 });

    const data = JSON.parse(output);
    const records = data?.items ?? data?.records ?? [];

    for (const record of records) {
      processed++;
      const feishuId = record?.fields?.feishu_id?.text ?? record?.fields?.feishu_id;
      if (!feishuId) {
        failed++;
        continue;
      }

      try {
        run([
          'wiki', '+node-delete',
          '--node-token', feishuId,
          '--space-id', spaceId,
          '--include-children',
          '--yes',
        ], { timeout: 15000 });
        deleted++;

        // 更新状态为"已删除"
        run([
          'base', '+record-update',
          '--app-token', config.baseToken,
          '--table-id', config.tableId,
          '--record-id', record.record_id,
          '--fields', JSON.stringify({ 状态: '已删除' }),
        ], { timeout: 15000 });
      } catch (err) {
        console.warn(`[sync/delete] cleanup failed for ${feishuId}:`, err);
        failed++;
      }
    }
  } catch (err) {
    console.warn('[sync/delete] list failed:', err);
    new Notice('⚠️ 拉取删除登记失败');
  }

  new Notice(`🗑 已清理 ${deleted}/${processed}（失败 ${failed}）`);
  return { processed, deleted, failed };
}

/**
 * 构造多维表格 fields（中文字段名）。
 */
function buildFields(record: DeleteRecord): Record<string, string> {
  return {
    删除时间: record.删除时间,
    OB原路径: record.OB原路径,
    飞书文档标题: record.飞书文档标题,
    feishu_id: record.feishu_id,
    状态: record.状态,
  };
}
