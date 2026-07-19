import { TFile, type App } from 'obsidian';
import { findUniqueBinding } from './bindingIndex.js';

export async function findUniqueVaultBinding(app: App, feishuId: string): Promise<TFile | null> {
  const entries: Array<{ path: string; content: string; file: TFile }> = [];
  for (const file of app.vault.getMarkdownFiles()) {
    const root = file.path.split('/')[0].toLowerCase();
    if (root === '.obsidian' || root === '.feishu-sync') continue;
    try {
      const content = await app.vault.read(file);
      if (content.includes('feishu_id:')) entries.push({ path: file.path, content, file });
    } catch {
      continue;
    }
  }
  return findUniqueBinding(feishuId, entries)?.file ?? null;
}
