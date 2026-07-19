export interface ThreeWaySyncInput {
  baseHash?: string;
  localHash: string;
  remoteHash: string;
}

export type ThreeWaySyncDecision =
  | { action: 'pause'; reason: 'MISSING_BASE' }
  | { action: 'conflict'; reason: 'BOTH_CHANGED' }
  | { action: 'pull' | 'push' | 'converged' | 'unchanged' };

export function decideThreeWaySync(input: ThreeWaySyncInput): ThreeWaySyncDecision {
  const baseHash = input.baseHash?.trim();
  if (!baseHash) return { action: 'pause', reason: 'MISSING_BASE' };

  const localChanged = input.localHash !== baseHash;
  const remoteChanged = input.remoteHash !== baseHash;
  if (!localChanged && !remoteChanged) return { action: 'unchanged' };
  if (input.localHash === input.remoteHash) return { action: 'converged' };
  if (!localChanged && remoteChanged) return { action: 'pull' };
  if (localChanged && !remoteChanged) return { action: 'push' };
  return { action: 'conflict', reason: 'BOTH_CHANGED' };
}

export type SyncExecution = 'write' | 'skip' | 'advance';

class SyncDecisionError extends Error {
  code: string;
  status = 409;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export function planSyncExecution(
  intent: 'pull' | 'push',
  decision: ThreeWaySyncDecision,
): SyncExecution {
  if (decision.action === 'pause') {
    throw new SyncDecisionError('MISSING_SYNC_BASE', '缺少可靠同步基线，已暂停覆盖');
  }
  if (decision.action === 'conflict') {
    throw new SyncDecisionError('SYNC_CONFLICT', '本地和飞书都已修改，已暂停覆盖');
  }
  if (decision.action === 'unchanged') return 'skip';
  if (decision.action === 'converged') return 'advance';
  if (decision.action === intent) return 'write';
  if (intent === 'pull') {
    throw new SyncDecisionError('LOCAL_CHANGES_PENDING', '本地有未回写修改，请先回写或人工处理');
  }
  throw new SyncDecisionError('REMOTE_CHANGES_PENDING', '飞书有未拉取修改，请先拉取或人工处理');
}
