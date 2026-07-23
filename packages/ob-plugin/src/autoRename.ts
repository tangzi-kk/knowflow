/**
 * 自动编码兼容入口。
 *
 * 交互式批量编码统一走 encodingWorkflow 的“预览 → 明确确认 → 协调执行”。
 * fetch/clip 创建新文件后的单文件自动编码仍可调用 assignEncoding；该入口同样执行
 * 内容重验、恢复快照和非静默重命名，只由外层 fetch/clip 协调器负责串行。
 */
import type { App } from 'obsidian';
import {
  applyEncodingPlan,
  decodeEncoding,
  previewEncodingFile,
} from './encodingWorkflow.js';

export async function assignEncoding(
  app: App,
  filePath: string,
  directory: string,
): Promise<string | undefined> {
  const plan = await previewEncodingFile(app, filePath, directory);
  const item = plan.items[0];
  if (!item) return undefined;
  await applyEncodingPlan(app, plan);
  return item.code;
}

export const decodeCode = decodeEncoding;
