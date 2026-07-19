import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  AI_CONFIG_STORAGE,
  CANONICAL_SCHEMA,
  DEEPSEEK_TOKEN_KEY,
  INTERPRETER_CONFIG_STORAGE,
  LOCAL_ENVELOPE_KEYS,
  LOCAL_SECRET_KEYS,
  SYNC_CONFIG_STORAGE,
  getDeepSeekToken,
  loadSecretBackedConfig,
  migrateLegacySecrets,
  saveSecretBackedConfig,
} from '../src/storage.ts';

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

class MemoryStorageArea {
  constructor(name, initial, operations, options = {}) {
    this.name = name;
    this.data = clone(initial) ?? {};
    this.operations = operations;
    this.readOverrides = options.readOverrides ?? {};
    this.readAfterSetOverrides = options.readAfterSetOverrides ?? {};
    this.writtenKeys = new Set();
    this.setError = options.setError;
    this.removeError = options.removeError;
  }

  async get(keys = null) {
    const requested = keys === null
      ? Object.keys(this.data)
      : Array.isArray(keys)
        ? keys
        : [keys];
    this.operations.push(`${this.name}:get:${requested.join(',')}`);

    const result = {};
    for (const key of requested) {
      if (this.writtenKeys.has(key) && Object.hasOwn(this.readAfterSetOverrides, key)) {
        result[key] = clone(this.readAfterSetOverrides[key]);
      } else if (Object.hasOwn(this.readOverrides, key)) {
        result[key] = clone(this.readOverrides[key]);
      } else if (Object.hasOwn(this.data, key)) {
        result[key] = clone(this.data[key]);
      }
    }
    return result;
  }

  async set(items) {
    this.operations.push(`${this.name}:set:${Object.keys(items).join(',')}`);
    if (this.setError) throw this.setError;
    Object.assign(this.data, clone(items));
    for (const key of Object.keys(items)) this.writtenKeys.add(key);
  }

  async remove(keys) {
    const requested = Array.isArray(keys) ? keys : [keys];
    this.operations.push(`${this.name}:remove:${requested.join(',')}`);
    if (this.removeError) throw this.removeError;
    for (const key of requested) delete this.data[key];
  }
}

function createStorage({ sync = {}, local = {}, syncOptions = {}, localOptions = {} } = {}) {
  const operations = [];
  return {
    operations,
    sync: new MemoryStorageArea('sync', sync, operations, syncOptions),
    local: new MemoryStorageArea('local', local, operations, localOptions),
  };
}

const DEFAULT_SYNC = { host: '127.0.0.1', port: 4567, token: '' };
const DEFAULT_AI = { provider: 'gemini-web', apiKey: '', baseUrl: '', model: 'default', systemPrompt: 'system' };
const DEFAULT_INTERPRETER = { enabled: true, provider: 'NewAPI', baseUrl: 'http://localhost/v1', model: 'smart', apiKey: '' };

function migrationTargets() {
  return [
    { spec: SYNC_CONFIG_STORAGE, defaults: DEFAULT_SYNC },
    { spec: AI_CONFIG_STORAGE, defaults: DEFAULT_AI },
    { spec: INTERPRETER_CONFIG_STORAGE, defaults: DEFAULT_INTERPRETER },
  ];
}

function verifiedEnvelope(config, revision = 'verified-revision') {
  return { schema: CANONICAL_SCHEMA, revision, verified: true, config: clone(config) };
}

test('save atomically commits a complete local envelope before projecting secret-free sync preferences', async () => {
  const storage = createStorage();
  const config = { host: 'endpoint-a', port: 4567, token: 'token-a' };

  await saveSecretBackedConfig(config, SYNC_CONFIG_STORAGE, storage);

  const envelope = storage.local.data[LOCAL_ENVELOPE_KEYS.syncConfig];
  assert.equal(envelope.schema, CANONICAL_SCHEMA);
  assert.equal(envelope.verified, true);
  assert.deepEqual(envelope.config, config);
  assert.deepEqual(storage.sync.data.syncConfig, { host: 'endpoint-a', port: 4567 });
  assert.equal(storage.local.data[LOCAL_SECRET_KEYS.syncToken], undefined);
  assert.deepEqual(
    storage.operations.filter((entry) => entry.includes(LOCAL_ENVELOPE_KEYS.syncConfig)).slice(0, 4),
    [
      `local:set:${LOCAL_ENVELOPE_KEYS.syncConfig}`,
      `local:get:${LOCAL_ENVELOPE_KEYS.syncConfig}`,
      `local:set:${LOCAL_ENVELOPE_KEYS.syncConfig}`,
      `local:get:${LOCAL_ENVELOPE_KEYS.syncConfig}`,
    ],
  );
});

test('concurrent A and B saves can only load one complete canonical config', async () => {
  const storage = createStorage();
  const configA = { host: 'endpoint-a', port: 4567, token: 'token-a' };
  const configB = { host: 'endpoint-b', port: 9876, token: 'token-b' };

  await Promise.allSettled([
    saveSecretBackedConfig(configA, SYNC_CONFIG_STORAGE, storage),
    saveSecretBackedConfig(configB, SYNC_CONFIG_STORAGE, storage),
  ]);
  const loaded = await loadSecretBackedConfig(DEFAULT_SYNC, SYNC_CONFIG_STORAGE, storage);

  assert.ok(
    (loaded.host === 'endpoint-a' && loaded.port === 4567 && loaded.token === 'token-a')
    || (loaded.host === 'endpoint-b' && loaded.port === 9876 && loaded.token === 'token-b'),
  );
});

test('a sync projection failure leaves a complete local canonical config loadable', async () => {
  const storage = createStorage({ syncOptions: { setError: new Error('sync unavailable') } });
  const config = { host: 'endpoint-a', port: 4567, token: 'token-a' };

  await assert.rejects(
    () => saveSecretBackedConfig(config, SYNC_CONFIG_STORAGE, storage),
    /sync unavailable/,
  );

  assert.deepEqual(await loadSecretBackedConfig(DEFAULT_SYNC, SYNC_CONFIG_STORAGE, storage), config);
});

test('an MV3 interruption that leaves a pending envelope fails closed instead of mixing sync and local', async () => {
  const pending = {
    schema: CANONICAL_SCHEMA,
    revision: 'interrupted-revision',
    verified: false,
    config: { host: 'endpoint-a', port: 4567, token: 'token-a' },
  };
  const storage = createStorage({
    sync: { syncConfig: { host: 'endpoint-b', port: 9876, token: 'token-b' } },
    local: { [LOCAL_ENVELOPE_KEYS.syncConfig]: pending },
  });

  await assert.rejects(
    () => loadSecretBackedConfig(DEFAULT_SYNC, SYNC_CONFIG_STORAGE, storage),
    /unverified canonical envelope/i,
  );
  assert.deepEqual(storage.local.data[LOCAL_ENVELOPE_KEYS.syncConfig], pending);
  assert.equal(storage.sync.data.syncConfig.token, 'token-b');
});

test('different unmarked local and sync legacy secrets return conflict without deleting either', async () => {
  const storage = createStorage({
    sync: { syncConfig: { host: 'legacy-endpoint', port: 4567, token: 'sync-token' } },
    local: { [LOCAL_SECRET_KEYS.syncToken]: 'local-token' },
  });

  await assert.rejects(
    () => loadSecretBackedConfig(DEFAULT_SYNC, SYNC_CONFIG_STORAGE, storage),
    /legacy secret conflict/i,
  );

  assert.equal(storage.sync.data.syncConfig.token, 'sync-token');
  assert.equal(storage.local.data[LOCAL_SECRET_KEYS.syncToken], 'local-token');
  assert.equal(storage.local.data[LOCAL_ENVELOPE_KEYS.syncConfig], undefined);
});

test('a verified canonical marker makes the complete local config authoritative over legacy values', async () => {
  const canonical = { host: 'canonical-endpoint', port: 4567, token: 'canonical-token' };
  const storage = createStorage({
    sync: { syncConfig: { host: 'sync-endpoint', port: 9876, token: 'sync-token' } },
    local: {
      [LOCAL_ENVELOPE_KEYS.syncConfig]: verifiedEnvelope(canonical),
      [LOCAL_SECRET_KEYS.syncToken]: 'legacy-local-token',
    },
  });

  assert.deepEqual(await loadSecretBackedConfig(DEFAULT_SYNC, SYNC_CONFIG_STORAGE, storage), canonical);
  assert.deepEqual(storage.sync.data.syncConfig, { host: 'canonical-endpoint', port: 4567 });
  assert.equal(storage.local.data[LOCAL_SECRET_KEYS.syncToken], undefined);
});

test('one bad secret does not block independent AI interpreter and DeepSeek migrations', async () => {
  const malformedSyncToken = { damaged: true };
  const storage = createStorage({
    sync: {
      syncConfig: { host: 'broken', port: 4567, token: malformedSyncToken },
      aiConfig: { provider: 'openai', apiKey: 'ai-key', baseUrl: 'https://ai.example/v1', model: 'model-a' },
      interpreterConfig: { enabled: true, provider: 'NewAPI', apiKey: 'interpreter-key', model: 'smart' },
      [DEEPSEEK_TOKEN_KEY]: 'deepseek-key',
    },
  });

  const report = await migrateLegacySecrets(migrationTargets(), storage);

  assert.ok(report.issues.some((issue) => issue.key === 'syncConfig'));
  assert.equal((await loadSecretBackedConfig(DEFAULT_AI, AI_CONFIG_STORAGE, storage)).apiKey, 'ai-key');
  assert.equal((await loadSecretBackedConfig(DEFAULT_INTERPRETER, INTERPRETER_CONFIG_STORAGE, storage)).apiKey, 'interpreter-key');
  assert.equal(await getDeepSeekToken(storage), 'deepseek-key');
  assert.deepEqual(storage.sync.data.syncConfig.token, malformedSyncToken);
  assert.equal(storage.sync.data.aiConfig.apiKey, undefined);
  assert.equal(storage.sync.data.interpreterConfig.apiKey, undefined);
  assert.equal(storage.sync.data[DEEPSEEK_TOKEN_KEY], undefined);
});

test('clearDeepSeekToken commits an empty canonical envelope before removing every legacy copy', async () => {
  const storage = createStorage({
    sync: { [DEEPSEEK_TOKEN_KEY]: 'legacy-deepseek-token' },
    local: { [LOCAL_SECRET_KEYS.deepseekToken]: 'legacy-deepseek-token' },
  });
  const { clearDeepSeekToken } = await import('../src/storage.ts');

  await clearDeepSeekToken(storage);

  assert.equal(await getDeepSeekToken(storage), null);
  assert.equal(storage.local.data[LOCAL_ENVELOPE_KEYS.deepseekToken].verified, true);
  assert.equal(storage.local.data[LOCAL_ENVELOPE_KEYS.deepseekToken].config.token, '');
  assert.equal(storage.local.data[LOCAL_SECRET_KEYS.deepseekToken], undefined);
  assert.equal(storage.sync.data[DEEPSEEK_TOKEN_KEY], undefined);
});

test('background and sidepanel consume secrets only through the tested storage facade', async () => {
  const [background, sidepanel] = await Promise.all([
    readFile(new URL('../src/background.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/sidepanel/sidepanel.ts', import.meta.url), 'utf8'),
  ]);
  const rawAiRead = /chrome\.storage\.sync\.get\((?:\[['"]aiConfig|['"]aiConfig)/;
  const rawInterpreterRead = /chrome\.storage\.sync\.get\((?:\[['"]interpreterConfig|['"]interpreterConfig)/;

  assert.doesNotMatch(background, rawAiRead);
  assert.doesNotMatch(sidepanel, rawAiRead);
  assert.doesNotMatch(background, rawInterpreterRead);
  assert.match(background, /loadSecretBackedConfig/);
  assert.match(sidepanel, /loadSecretBackedConfig/);
  assert.doesNotMatch(background, /void migrateLegacySecrets/);
  assert.match(background, /async function migrateAllSecrets/);
  assert.ok((background.match(/await migrateAllSecrets\(\)/g) ?? []).length >= 2);
});

test('exports distinct storage specs for every config secret', () => {
  assert.deepEqual(
    [SYNC_CONFIG_STORAGE, AI_CONFIG_STORAGE, INTERPRETER_CONFIG_STORAGE].map((spec) => spec.envelopeKey),
    [LOCAL_ENVELOPE_KEYS.syncConfig, LOCAL_ENVELOPE_KEYS.aiConfig, LOCAL_ENVELOPE_KEYS.interpreterConfig],
  );
});
