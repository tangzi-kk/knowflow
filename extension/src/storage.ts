export interface StorageAreaAdapter {
  get(keys?: string | string[] | null): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
}

export interface ExtensionStorageAdapter {
  sync: StorageAreaAdapter;
  local: StorageAreaAdapter;
}

export interface SecretBackedConfigSpec {
  syncKey: string;
  secretField: string;
  localSecretKey: string;
  envelopeKey: string;
}

export interface MigrationTarget<T extends object = Record<string, unknown>> {
  spec: SecretBackedConfigSpec;
  defaults: T;
}

export interface MigrationIssue {
  key: string;
  error: string;
}

export interface MigrationReport {
  issues: MigrationIssue[];
}

interface CanonicalEnvelope<T extends object = Record<string, unknown>> {
  schema: typeof CANONICAL_SCHEMA;
  revision: string;
  verified: boolean;
  config: T;
}

export const CANONICAL_SCHEMA = 1 as const;

export const LOCAL_SECRET_KEYS = {
  syncToken: 'syncToken',
  aiApiKey: 'aiApiKey',
  interpreterApiKey: 'interpreterApiKey',
  deepseekToken: 'deepseek_web_token',
} as const;

export const LOCAL_ENVELOPE_KEYS = {
  syncConfig: 'knowflow_sync_config_v1',
  aiConfig: 'knowflow_ai_config_v1',
  interpreterConfig: 'knowflow_interpreter_config_v1',
  deepseekToken: 'knowflow_deepseek_token_v1',
} as const;

export const DEEPSEEK_TOKEN_KEY = 'deepseek_web_token';

export const SYNC_CONFIG_STORAGE: SecretBackedConfigSpec = {
  syncKey: 'syncConfig',
  secretField: 'token',
  localSecretKey: LOCAL_SECRET_KEYS.syncToken,
  envelopeKey: LOCAL_ENVELOPE_KEYS.syncConfig,
};

export const AI_CONFIG_STORAGE: SecretBackedConfigSpec = {
  syncKey: 'aiConfig',
  secretField: 'apiKey',
  localSecretKey: LOCAL_SECRET_KEYS.aiApiKey,
  envelopeKey: LOCAL_ENVELOPE_KEYS.aiConfig,
};

export const INTERPRETER_CONFIG_STORAGE: SecretBackedConfigSpec = {
  syncKey: 'interpreterConfig',
  secretField: 'apiKey',
  localSecretKey: LOCAL_SECRET_KEYS.interpreterApiKey,
  envelopeKey: LOCAL_ENVELOPE_KEYS.interpreterConfig,
};

const CONFIG_SECRET_SPECS = [
  SYNC_CONFIG_STORAGE,
  AI_CONFIG_STORAGE,
  INTERPRETER_CONFIG_STORAGE,
];

function chromeStorage(): ExtensionStorageAdapter {
  return {
    sync: chrome.storage.sync as unknown as StorageAreaAdapter,
    local: chrome.storage.local as unknown as StorageAreaAdapter,
  };
}

function storageOrDefault(storage?: ExtensionStorageAdapter): ExtensionStorageAdapter {
  return storage ?? chromeStorage();
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function newRevision(): string {
  return globalThis.crypto?.randomUUID?.()
    ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    const arrA = a as unknown[];
    const arrB = b as unknown[];
    if (arrA.length !== arrB.length) return false;
    for (let i = 0; i < arrA.length; i++) {
      if (!deepEqual(arrA[i], arrB[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) return false;
  }
  return true;
}

function sameData(left: unknown, right: unknown): boolean {
  return deepEqual(left, right);
}

function parseEnvelope<T extends object>(
  value: unknown,
  key: string,
): CanonicalEnvelope<T> | null {
  if (value === undefined) return null;
  const record = asObject(value);
  if (
    !record
    || record.schema !== CANONICAL_SCHEMA
    || typeof record.revision !== 'string'
    || typeof record.verified !== 'boolean'
    || !asObject(record.config)
  ) {
    throw new Error(`Invalid canonical envelope: ${key}`);
  }
  return record as unknown as CanonicalEnvelope<T>;
}

async function readEnvelope<T extends object>(
  key: string,
  storage: ExtensionStorageAdapter,
): Promise<CanonicalEnvelope<T> | null> {
  const result = await storage.local.get(key);
  return parseEnvelope<T>(result[key], key);
}

async function writeCanonicalEnvelope<T extends object>(
  key: string,
  config: T,
  storage: ExtensionStorageAdapter,
): Promise<CanonicalEnvelope<T>> {
  const revision = newRevision();
  const pending: CanonicalEnvelope<T> = {
    schema: CANONICAL_SCHEMA,
    revision,
    verified: false,
    config,
  };
  await storage.local.set({ [key]: pending });
  const pendingReadback = await readEnvelope<T>(key, storage);
  if (!pendingReadback || !sameData(pendingReadback, pending)) {
    throw new Error(`Failed to verify pending canonical envelope: ${key}`);
  }

  const committed: CanonicalEnvelope<T> = { ...pending, verified: true };
  await storage.local.set({ [key]: committed });
  const committedReadback = await readEnvelope<T>(key, storage);
  if (!committedReadback || !sameData(committedReadback, committed)) {
    throw new Error(`Failed to verify canonical envelope: ${key}`);
  }
  return committed;
}

function withoutSecret(
  config: Record<string, unknown>,
  secretField: string,
): Record<string, unknown> {
  const projection = { ...config };
  delete projection[secretField];
  return projection;
}

async function cleanupLegacyConfig(
  spec: SecretBackedConfigSpec,
  config: Record<string, unknown>,
  storage: ExtensionStorageAdapter,
): Promise<void> {
  await storage.sync.set({
    [spec.syncKey]: withoutSecret(config, spec.secretField),
  });
  await storage.local.remove(spec.localSecretKey);
}

async function migrateConfig<T extends object>(
  defaults: T,
  spec: SecretBackedConfigSpec,
  storage: ExtensionStorageAdapter,
): Promise<CanonicalEnvelope<T>> {
  const existing = await readEnvelope<T>(spec.envelopeKey, storage);
  if (existing) {
    if (!existing.verified) {
      throw new Error(`Unverified canonical envelope: ${spec.envelopeKey}`);
    }
    try {
      await cleanupLegacyConfig(
        spec,
        existing.config as Record<string, unknown>,
        storage,
      );
    } catch {
      // 已验证的 local envelope 是读取真相；sync 投影清理可在下次加载重试。
    }
    return existing;
  }

  const [syncResult, localResult] = await Promise.all([
    storage.sync.get(spec.syncKey),
    storage.local.get(spec.localSecretKey),
  ]);
  const legacyConfig = asObject(syncResult[spec.syncKey]) ?? {};
  const syncSecret = legacyConfig[spec.secretField];
  const localSecret = localResult[spec.localSecretKey];

  if (syncSecret !== undefined && typeof syncSecret !== 'string') {
    throw new Error(`Invalid legacy secret in ${spec.syncKey}.${spec.secretField}`);
  }
  if (localSecret !== undefined && typeof localSecret !== 'string') {
    throw new Error(`Invalid local secret in ${spec.localSecretKey}`);
  }
  if (
    typeof syncSecret === 'string'
    && syncSecret.length > 0
    && typeof localSecret === 'string'
    && localSecret.length > 0
    && syncSecret !== localSecret
  ) {
    throw new Error(`Legacy secret conflict: ${spec.syncKey}`);
  }

  const secret = typeof localSecret === 'string' && localSecret.length > 0
    ? localSecret
    : typeof syncSecret === 'string'
      ? syncSecret
      : '';
  const config = {
    ...defaults,
    ...legacyConfig,
    [spec.secretField]: secret,
  } as T;
  const envelope = await writeCanonicalEnvelope(spec.envelopeKey, config, storage);
  await cleanupLegacyConfig(spec, config as Record<string, unknown>, storage);
  return envelope;
}

export async function loadSecretBackedConfig<T extends object>(
  defaults: T,
  spec: SecretBackedConfigSpec,
  storage?: ExtensionStorageAdapter,
): Promise<T> {
  try {
    const envelope = await migrateConfig(defaults, spec, storageOrDefault(storage));
    return { ...defaults, ...envelope.config };
  } catch (err) {
    if (storage) {
      throw err;
    }
    if (err instanceof Error && err.message.includes('Unverified canonical envelope')) {
      console.warn(`[feishu-sync] Unverified envelope for ${spec.envelopeKey}. Attempting recovery...`);
      try {
        const areas = storageOrDefault(storage);
        const result = await areas.local.get(spec.envelopeKey);
        const record = result[spec.envelopeKey];
        if (record && typeof record === 'object' && 'config' in record) {
          const config = record.config as T;
          await writeCanonicalEnvelope(spec.envelopeKey, config, areas);
          console.log(`[feishu-sync] Envelope ${spec.envelopeKey} recovered successfully.`);
          return { ...defaults, ...config };
        }
      } catch (recoveryErr) {
        console.error(`[feishu-sync] Recovery failed for ${spec.envelopeKey}:`, recoveryErr);
      }
    }
    throw err;
  }
}

export async function saveSecretBackedConfig<T extends object>(
  config: T,
  spec: SecretBackedConfigSpec,
  storage?: ExtensionStorageAdapter,
): Promise<void> {
  const record = asObject(config);
  if (!record || typeof record[spec.secretField] !== 'string') {
    throw new Error(`Invalid secret value for ${spec.secretField}`);
  }
  const areas = storageOrDefault(storage);
  await writeCanonicalEnvelope(spec.envelopeKey, config, areas);
  await cleanupLegacyConfig(spec, record, areas);
}

async function migrateDeepSeekSecret(storage: ExtensionStorageAdapter): Promise<void> {
  const existing = await readEnvelope<{ token: string }>(
    LOCAL_ENVELOPE_KEYS.deepseekToken,
    storage,
  );
  if (existing) {
    if (!existing.verified) {
      throw new Error(`Unverified canonical envelope: ${LOCAL_ENVELOPE_KEYS.deepseekToken}`);
    }
    try {
      await storage.sync.remove(DEEPSEEK_TOKEN_KEY);
      await storage.local.remove(LOCAL_SECRET_KEYS.deepseekToken);
    } catch {
      // canonical envelope 已提交；遗留副本清理失败时下次重试。
    }
    return;
  }

  const [syncResult, localResult] = await Promise.all([
    storage.sync.get(DEEPSEEK_TOKEN_KEY),
    storage.local.get(LOCAL_SECRET_KEYS.deepseekToken),
  ]);
  const syncToken = syncResult[DEEPSEEK_TOKEN_KEY];
  const localToken = localResult[LOCAL_SECRET_KEYS.deepseekToken];
  if (syncToken !== undefined && typeof syncToken !== 'string') {
    throw new Error(`Invalid legacy secret in ${DEEPSEEK_TOKEN_KEY}`);
  }
  if (localToken !== undefined && typeof localToken !== 'string') {
    throw new Error(`Invalid local secret in ${LOCAL_SECRET_KEYS.deepseekToken}`);
  }
  if (
    typeof syncToken === 'string'
    && syncToken.length > 0
    && typeof localToken === 'string'
    && localToken.length > 0
    && syncToken !== localToken
  ) {
    throw new Error(`Legacy secret conflict: ${DEEPSEEK_TOKEN_KEY}`);
  }
  const token = typeof localToken === 'string' && localToken.length > 0
    ? localToken
    : typeof syncToken === 'string'
      ? syncToken
      : '';
  await writeCanonicalEnvelope(
    LOCAL_ENVELOPE_KEYS.deepseekToken,
    { token },
    storage,
  );
  await storage.sync.remove(DEEPSEEK_TOKEN_KEY);
  await storage.local.remove(LOCAL_SECRET_KEYS.deepseekToken);
}

export async function getDeepSeekToken(storage?: ExtensionStorageAdapter): Promise<string | null> {
  const areas = storageOrDefault(storage);
  try {
    await migrateDeepSeekSecret(areas);
  } catch (err) {
    if (storage) {
      throw err;
    }
    if (err instanceof Error && err.message.includes('Unverified canonical envelope')) {
      console.warn(`[feishu-sync] Unverified DeepSeek token envelope found. Attempting recovery...`);
      try {
        const key = LOCAL_ENVELOPE_KEYS.deepseekToken;
        const result = await areas.local.get(key);
        const record = result[key];
        if (record && typeof record === 'object' && 'config' in record) {
          const config = record.config as { token: string };
          await writeCanonicalEnvelope(key, config, areas);
          console.log(`[feishu-sync] DeepSeek token envelope recovered successfully.`);
        }
      } catch (recoveryErr) {
        console.error(`[feishu-sync] Failed to recover DeepSeek token:`, recoveryErr);
      }
    } else {
      throw err;
    }
  }
  const envelope = await readEnvelope<{ token: string }>(
    LOCAL_ENVELOPE_KEYS.deepseekToken,
    areas,
  );
  if (!envelope?.verified) return null;
  return envelope.config.token.length > 0 ? envelope.config.token : null;
}

export async function setDeepSeekToken(
  token: string,
  storage?: ExtensionStorageAdapter,
): Promise<void> {
  const areas = storageOrDefault(storage);
  await writeCanonicalEnvelope(
    LOCAL_ENVELOPE_KEYS.deepseekToken,
    { token },
    areas,
  );
  await areas.sync.remove(DEEPSEEK_TOKEN_KEY);
  await areas.local.remove(LOCAL_SECRET_KEYS.deepseekToken);
}

export async function clearDeepSeekToken(storage?: ExtensionStorageAdapter): Promise<void> {
  await setDeepSeekToken('', storage);
}

function defaultMigrationTargets(): MigrationTarget[] {
  return CONFIG_SECRET_SPECS.map((spec) => ({ spec, defaults: {} }));
}

export async function migrateLegacySecrets(
  targets: MigrationTarget[] = defaultMigrationTargets(),
  storage?: ExtensionStorageAdapter,
): Promise<MigrationReport> {
  const areas = storageOrDefault(storage);
  const issues: MigrationIssue[] = [];

  for (const target of targets) {
    try {
      await migrateConfig(target.defaults, target.spec, areas);
    } catch (error) {
      issues.push({
        key: target.spec.syncKey,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  try {
    await migrateDeepSeekSecret(areas);
  } catch (error) {
    issues.push({
      key: DEEPSEEK_TOKEN_KEY,
      error: error instanceof Error ? error.message : String(error),
    });
  }
  return { issues };
}
