import { createHash, randomUUID } from 'node:crypto';

const RECOVERY_ROOT = '.feishu-sync/recovery';

export interface RecoveryAdapter {
  exists(path: string): Promise<boolean>;
  mkdir(path: string): Promise<void>;
  write(path: string, content: string): Promise<void>;
  list(path: string): Promise<{ files: string[]; folders: string[] }>;
  remove(path: string): Promise<void>;
}

export interface RecoverySnapshotInput {
  originalPath: string;
  content: string;
  source: 'local' | 'remote';
  now?: Date;
  nonce?: string;
  maxSnapshots?: number;
}

export async function createRecoverySnapshot(
  adapter: RecoveryAdapter,
  input: RecoverySnapshotInput,
): Promise<string> {
  await ensureDirectory(adapter, '.feishu-sync');
  await ensureDirectory(adapter, RECOVERY_ROOT);

  const now = input.now ?? new Date();
  const nonce = input.nonce ?? randomUUID();
  const identity = createHash('sha256')
    .update(`${input.originalPath}\0${nonce}`)
    .digest('hex')
    .slice(0, 16);
  const timestamp = now.toISOString().replace(/[-:.]/g, '');
  const snapshotPath = `${RECOVERY_ROOT}/${timestamp}-${input.source}-${identity}.json`;
  const snapshot = {
    schemaVersion: 1,
    createdAt: now.toISOString(),
    source: input.source,
    originalPath: input.originalPath,
    content: input.content,
  };

  await adapter.write(snapshotPath, JSON.stringify(snapshot, null, 2));
  await rotateSnapshots(adapter, Math.max(1, input.maxSnapshots ?? 20));
  return snapshotPath;
}

async function ensureDirectory(adapter: RecoveryAdapter, path: string): Promise<void> {
  if (await adapter.exists(path)) return;
  try {
    await adapter.mkdir(path);
  } catch (error) {
    if (!(await adapter.exists(path))) throw error;
  }
}

async function rotateSnapshots(adapter: RecoveryAdapter, maxSnapshots: number): Promise<void> {
  try {
    const entries = await adapter.list(RECOVERY_ROOT);
    const files = entries.files
      .filter((path) => path.endsWith('.json'))
      .sort();
    const excess = files.slice(0, Math.max(0, files.length - maxSnapshots));
    await Promise.all(excess.map((path) => adapter.remove(path)));
  } catch (error) {
    console.warn('[sync/recovery] snapshot rotation failed:', error);
  }
}
