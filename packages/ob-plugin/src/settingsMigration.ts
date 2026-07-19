import { webcrypto as nodeWebCrypto } from 'node:crypto';

import {
  DEFAULT_SETTINGS,
  type FeishuSyncSettings,
} from './settings.js';
import { normalizeActivity } from './activity.js';

export interface SettingsMigrationResult {
  settings: FeishuSyncSettings;
  changed: boolean;
}

type DataRecord = Record<string, unknown>;

const CACHE_CLEANUP_VALUES = new Set([
  'daily',
  'weekly',
  'monthly',
  'never',
]);

/**
 * 将当前扁平设置或旧版嵌套设置收敛为 schema v1。
 * 函数不修改输入，也不记录任何设置值。普通 getter 会被跳过；
 * Proxy trap 可能执行，但 trap 异常会被捕获并安全回退。
 */
export function migrateSettings(input: unknown): SettingsMigrationResult {
  const source = copyOwnData(input);
  const feishuSync = copyOwnData(source?.feishuSync);
  const runtimeLarkDoc = copyOwnData(source?._larkDoc);
  const legacyLarkDoc = copyOwnData(source?.larkDoc);
  const migrated = source ? copyRecord(source) : {};

  migrated.schemaVersion = 1;
  migrated.port = firstPort(source?.port, feishuSync?.port) ?? DEFAULT_SETTINGS.port;
  migrated.syncToken = firstNonEmptyString(source?.syncToken, feishuSync?.syncToken)
    ?? DEFAULT_SETTINGS.syncToken;
  migrated.larkCliPath = firstNonEmptyString(
    source?.larkCliPath,
    runtimeLarkDoc?.larkCliPath,
    legacyLarkDoc?.larkCliPath,
    feishuSync?.larkCliPath,
  ) ?? DEFAULT_SETTINGS.larkCliPath;

  const defaultDir = firstNonEmptyString(
    source?.defaultDir,
    feishuSync?.defaultDir,
  ) ?? DEFAULT_SETTINGS.defaultDir;
  migrated.defaultDir = defaultDir;
  migrated.defaultNoteFolder = firstNonEmptyString(
    source?.defaultNoteFolder,
    runtimeLarkDoc?.defaultNoteFolder,
    legacyLarkDoc?.defaultNoteFolder,
  ) ?? DEFAULT_SETTINGS.defaultNoteFolder;

  const legacyAutoRename = copyOwnData(source?.autoRename);
  if (legacyAutoRename && source?._autoRename === undefined) {
    migrated._autoRename = source?.autoRename;
  }
  migrated.autoRename = automaticBehavior(
    [source, feishuSync],
    'autoRename',
    DEFAULT_SETTINGS.autoRename,
  );
  migrated.autoDeleteRegistry = automaticBehavior(
    [source, feishuSync],
    'autoDeleteRegistry',
    DEFAULT_SETTINGS.autoDeleteRegistry,
  );
  migrated.cacheCleanup = firstCacheCleanup(
    source?.cacheCleanup,
    feishuSync?.cacheCleanup,
  ) ?? DEFAULT_SETTINGS.cacheCleanup;
  migrated.keepDecorativeImages = firstBoolean(
    source?.keepDecorativeImages,
    feishuSync?.keepDecorativeImages,
  ) ?? DEFAULT_SETTINGS.keepDecorativeImages;
  migrated.spaceId = firstNonEmptyString(source?.spaceId, feishuSync?.spaceId)
    ?? DEFAULT_SETTINGS.spaceId;
  migrated.hideSystemProperties = firstBoolean(
    source?.hideSystemProperties,
    feishuSync?.hideSystemProperties,
  ) ?? DEFAULT_SETTINGS.hideSystemProperties;
  const normalizedActivity = normalizeActivity(source?.recentActivity);
  migrated.recentActivity = sameJsonData(source?.recentActivity, normalizedActivity)
    ? source?.recentActivity
    : normalizedActivity;

  return {
    settings: migrated as FeishuSyncSettings,
    changed: !sameData(source, migrated),
  };
}

/** 生成 32 字节启动令牌；Obsidian 无 Web Crypto 全局量时回退到 Node。 */
export function generateSyncToken(): string {
  const randomSource = globalThis.crypto ?? nodeWebCrypto as unknown as Crypto;
  const bytes = new Uint8Array(32);
  randomSource.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * 只复制自有可枚举数据属性，普通 getter 不会被读取。
 * Proxy 的 ownKeys/getOwnPropertyDescriptor trap 仍可能执行，其异常在此捕获。
 */
function copyOwnData(value: unknown): DataRecord | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  try {
    const result: DataRecord = {};
    for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
      if (descriptor.enumerable && 'value' in descriptor) {
        defineData(result, key, descriptor.value);
      }
    }
    return result;
  } catch {
    return undefined;
  }
}

function copyRecord(source: DataRecord): DataRecord {
  const result: DataRecord = {};
  for (const [key, value] of Object.entries(source)) {
    defineData(result, key, value);
  }
  return result;
}

function defineData(target: DataRecord, key: string, value: unknown): void {
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
    configurable: true,
    writable: true,
  });
}

function firstNonEmptyString(...values: unknown[]): string | undefined {
  return values.find((value): value is string => (
    typeof value === 'string' && value.trim().length > 0
  ));
}

function firstBoolean(...values: unknown[]): boolean | undefined {
  for (const value of values) {
    const parsed = parseBoolean(value);
    if (parsed !== undefined) return parsed;
  }
  return undefined;
}

function firstPort(...values: unknown[]): number | undefined {
  for (const value of values) {
    const candidate = typeof value === 'string' && /^\d+$/.test(value.trim())
      ? Number(value.trim())
      : value;
    if (
      typeof candidate === 'number'
      && Number.isInteger(candidate)
      && candidate >= 1
      && candidate <= 65_535
    ) {
      return candidate;
    }
  }
  return undefined;
}

function automaticBehavior(
  sources: Array<DataRecord | undefined>,
  key: 'autoRename' | 'autoDeleteRegistry',
  fallback: boolean,
): boolean {
  for (const source of sources) {
    if (!source || !Object.prototype.hasOwnProperty.call(source, key)) continue;
    return parseBoolean(source[key]) ?? false;
  }
  return fallback;
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return undefined;

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return undefined;
}

function firstCacheCleanup(...values: unknown[]): FeishuSyncSettings['cacheCleanup'] | undefined {
  return values.find((value): value is FeishuSyncSettings['cacheCleanup'] => (
    typeof value === 'string' && CACHE_CLEANUP_VALUES.has(value)
  ));
}

function sameData(source: DataRecord | undefined, migrated: DataRecord): boolean {
  if (!source) return false;

  const sourceKeys = Object.keys(source);
  const migratedKeys = Object.keys(migrated);
  return sourceKeys.length === migratedKeys.length
    && migratedKeys.every((key) => (
      Object.prototype.hasOwnProperty.call(source, key)
      && Object.is(source[key], migrated[key])
    ));
}

function sameJsonData(left: unknown, right: unknown): boolean {
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}
