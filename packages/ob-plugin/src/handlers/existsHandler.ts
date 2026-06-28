/**
 * POST /exists — 检查 node_token 是否已同步过。
 */
import type { ExistsRequest, ExistsResponse } from '@sync/shared';
import type { App, TFile } from 'obsidian';
import type { RequestContext } from '../server.js';

export function createExistsHandler(app: App) {
  return async (ctx: RequestContext): Promise<ExistsResponse> => {
    const req = ctx.body as ExistsRequest;
    if (!req?.node_token) {
      const e = new Error('node_token is required') as Error & { code: string; status: number };
      e.code = 'MISSING_TOKEN';
      e.status = 400;
      throw e;
    }

    const file = await findByFeishuId(app, req.node_token);
    return {
      ok: true,
      exists: !!file,
      path: file?.path,
    };
  };
}

async function findByFeishuId(app: App, feishuId: string): Promise<TFile | null> {
  const files = app.vault.getMarkdownFiles();
  for (const file of files) {
    if (file.path.startsWith('.obsidian') || file.path.startsWith('.feishu-sync')) continue;
    try {
      const content = await app.vault.read(file);
      if (!content.includes('feishu_id:')) continue;
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch) continue;
      const idMatch = fmMatch[1].match(/feishu_id:\s*["']?([A-Za-z0-9]+)/);
      if (idMatch && idMatch[1] === feishuId) return file;
    } catch {
      continue;
    }
  }
  return null;
}
