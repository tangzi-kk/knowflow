export type ActivityKind = 'fetch' | 'clip' | 'pushback' | 'deletion' | 'system';
export type ActivityStatus = 'succeeded' | 'failed' | 'skipped';

export interface ActivityRecord {
  time: string;
  kind: ActivityKind;
  status: ActivityStatus;
  action?: string;
  title?: string;
  path?: string;
  errorCode?: string;
}

const MAX_ACTIVITY = 50;
const KINDS = new Set<ActivityKind>(['fetch', 'clip', 'pushback', 'deletion', 'system']);
const STATUSES = new Set<ActivityStatus>(['succeeded', 'failed', 'skipped']);

export function appendActivity(
  current: unknown,
  input: Record<string, unknown>,
): ActivityRecord[] {
  const previous = normalizeActivity(current);
  const record = normalizeRecord(input);
  return record ? [record, ...previous].slice(0, MAX_ACTIVITY) : previous;
}

export function normalizeActivity(input: unknown): ActivityRecord[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => normalizeRecord(item))
    .filter((item): item is ActivityRecord => item !== null)
    .slice(0, MAX_ACTIVITY);
}

function normalizeRecord(input: unknown): ActivityRecord | null {
  if (!input || typeof input !== 'object') return null;
  const value = input as Record<string, unknown>;
  if (!KINDS.has(value.kind as ActivityKind) || !STATUSES.has(value.status as ActivityStatus)) return null;
  const time = typeof value.time === 'string' && Number.isFinite(Date.parse(value.time))
    ? value.time
    : new Date().toISOString();
  const record: ActivityRecord = {
    time,
    kind: value.kind as ActivityKind,
    status: value.status as ActivityStatus,
  };
  assignBoundedString(record, 'action', value.action, 40);
  assignBoundedString(record, 'title', value.title, 160);
  assignBoundedString(record, 'path', value.path, 500);
  if (typeof value.errorCode === 'string' && /^[A-Z0-9_-]{1,80}$/.test(value.errorCode)) {
    record.errorCode = value.errorCode;
  }
  return record;
}

function assignBoundedString(
  target: ActivityRecord,
  key: 'action' | 'title' | 'path',
  value: unknown,
  maxLength: number,
): void {
  if (typeof value === 'string' && value.trim()) target[key] = value.trim().slice(0, maxLength);
}
