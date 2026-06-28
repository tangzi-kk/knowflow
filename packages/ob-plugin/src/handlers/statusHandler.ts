/**
 * GET /status — 握手/健康检查。
 */
import type { StatusResponse } from '@sync/shared';
import type { PluginState } from '../settings.js';
import type { RequestContext } from '../server.js';

export function createStatusHandler(pluginVersion: string, vaultName: string, state: PluginState) {
  return async (_ctx: RequestContext): Promise<StatusResponse> => {
    return {
      ok: true,
      version: pluginVersion,
      vault: vaultName,
      larkReady: !!state.larkCliResolved,
      larkVersion: state.larkCliVersion || null,
    };
  };
}
