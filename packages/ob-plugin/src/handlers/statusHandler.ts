/**
 * GET /status — 握手/健康检查。
 */
import {
  PROTOCOL_VERSION,
  SERVER_CAPABILITIES,
  type StatusResponse,
} from '@sync/shared';
import type { PluginState } from '../settings.js';
import type { RequestContext } from '../server.js';

export function createStatusHandler(pluginVersion: string, vaultName: string, state: PluginState) {
  return async (_ctx: RequestContext): Promise<StatusResponse> => {
    return {
      ok: true,
      version: pluginVersion,
      componentVersion: pluginVersion,
      protocolVersion: PROTOCOL_VERSION,
      capabilities: [...SERVER_CAPABILITIES],
      vault: vaultName,
      larkReady: !!state.larkCliResolved,
      larkVersion: state.larkCliVersion || null,
      recentActivity: state.recentSyncs.slice(0, 10),
    };
  };
}
