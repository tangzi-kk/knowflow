/**
 * POST /exists — 检查 node_token 是否已同步过。
 */
import type { ExistsRequest, ExistsResponse } from '@sync/shared';
import type { App } from 'obsidian';
import type { RequestContext } from '../server.js';
import { findUniqueVaultBinding } from '../vaultBinding.js';

export function createExistsHandler(app: App) {
  return async (ctx: RequestContext): Promise<ExistsResponse> => {
    const req = ctx.body as ExistsRequest;
    if (!req?.node_token) {
      const e = new Error('node_token is required') as Error & { code: string; status: number };
      e.code = 'MISSING_TOKEN';
      e.status = 400;
      throw e;
    }

    const file = await findUniqueVaultBinding(app, req.node_token);
    return {
      ok: true,
      exists: !!file,
      path: file?.path,
    };
  };
}
