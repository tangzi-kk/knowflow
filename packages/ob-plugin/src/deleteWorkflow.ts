export interface PendingDeletion {
  recordId: string;
  nodeToken: string;
  title: string;
  path: string;
}

export interface DeleteConfirmation {
  confirmed: boolean;
  expectedNodeToken?: string;
  includeChildren?: boolean;
  confirmedChildren?: boolean;
}

export function previewPendingDeletions(records: PendingDeletion[]): PendingDeletion[] {
  return records
    .filter((record) => record.recordId && record.nodeToken)
    .map((record) => ({ ...record }));
}

export function buildConfirmedDeleteCommands(
  candidate: PendingDeletion,
  confirmation: DeleteConfirmation,
): { deleteArgs: string[]; updateArgs: string[] } {
  if (!confirmation.confirmed) throw new Error('Deletion requires explicit confirmation');
  if (!confirmation.expectedNodeToken || confirmation.expectedNodeToken !== candidate.nodeToken) {
    throw new Error('Deletion candidate changed after preview');
  }
  if (confirmation.includeChildren && !confirmation.confirmedChildren) {
    throw new Error('Deleting children requires a separate children confirmation');
  }

  const deleteArgs = ['wiki', '+node-delete', '--node-token', candidate.nodeToken, '--yes'];
  if (confirmation.includeChildren) deleteArgs.push('--include-children');
  return {
    deleteArgs,
    updateArgs: [
      'base', '+record-update',
      '--record-id', candidate.recordId,
      '--fields', JSON.stringify({ 状态: '已删除' }),
    ],
  };
}
