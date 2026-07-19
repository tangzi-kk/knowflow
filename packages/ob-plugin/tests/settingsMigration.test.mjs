import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test, { after } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import ts from 'typescript';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourceDirectory = path.resolve(testDirectory, '../src');
const compiledDirectory = await mkdtemp(path.join(tmpdir(), 'settings-migration-test-'));

after(async () => {
  await rm(compiledDirectory, { recursive: true, force: true });
});

for (const sourceName of ['settings.ts', 'settingsMigration.ts']) {
  const source = await readFile(path.join(sourceDirectory, sourceName), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  await writeFile(
    path.join(compiledDirectory, sourceName.replace(/\.ts$/, '.js')),
    compiled,
  );
}

const { generateSyncToken, migrateSettings } = await import(
  pathToFileURL(path.join(compiledDirectory, 'settingsMigration.js')).href
);

test('manifest and package retain the fs-TB identity at 3.4.0', async () => {
  const manifest = JSON.parse(await readFile(
    path.resolve(testDirectory, '../manifest.json'),
    'utf8',
  ));
  const packageJson = JSON.parse(await readFile(
    path.resolve(testDirectory, '../package.json'),
    'utf8',
  ));

  assert.equal(manifest.id, 'fs-TB');
  assert.equal(manifest.version, '3.4.0');
  assert.equal(packageJson.version, manifest.version);
});

test('fresh installs receive only the current defaults', () => {
  const result = migrateSettings(undefined);

  assert.equal(result.changed, true);
  assert.deepEqual(result.settings, {
    schemaVersion: 1,
    port: 4567,
    syncToken: '',
    larkCliPath: '',
    defaultDir: '0️⃣输入',
    autoRename: true,
    autoDeleteRegistry: true,
    cacheCleanup: 'weekly',
    keepDecorativeImages: true,
    spaceId: '7651314150060067803',
    defaultNoteFolder: '3️⃣附件文件/Lark',
    hideSystemProperties: true,
  });
});

test('empty note folders recover the generated 3.2.1 runtime default', () => {
  const result = migrateSettings({ defaultNoteFolder: '   ' });

  assert.equal(result.settings.defaultDir, '0️⃣输入');
  assert.equal(result.settings.defaultNoteFolder, '3️⃣附件文件/Lark');
});

test('real 3.2.1 flat settings keep every non-empty user value', () => {
  const customFeature = { enabled: true };
  const legacyAutoRename = { repairOrder: 'visible' };
  const input = {
    port: 5678,
    syncToken: 'existing-token',
    larkCliPath: '/custom/bin/lark-cli',
    defaultDir: 'User Inbox',
    autoRename: false,
    autoDeleteRegistry: false,
    cacheCleanup: 'daily',
    keepDecorativeImages: false,
    spaceId: 'user-space',
    defaultNoteFolder: 'User Notes',
    customFeature,
    _autoRename: legacyAutoRename,
  };

  const result = migrateSettings(input);

  assert.equal(result.settings.schemaVersion, 1);
  for (const [key, value] of Object.entries(input)) {
    assert.deepEqual(result.settings[key], value, `preserves ${key}`);
  }
});

test('nested legacy settings are flattened without discarding their namespaces', () => {
  const autoRenameNamespace = { repairScope: 'selected-recursive' };
  const feishuSync = {
    port: 6789,
    syncToken: 'nested-token',
    defaultDir: 'Legacy Inbox',
    autoRename: false,
    autoDeleteRegistry: false,
    cacheCleanup: 'monthly',
    keepDecorativeImages: false,
    spaceId: 'legacy-space',
    futureSyncOption: 'keep-me',
  };
  const larkDoc = {
    larkCliPath: '/legacy/bin/lark-cli',
    defaultNoteFolder: 'Legacy Notes',
    futureDocOption: 'keep-me-too',
  };
  const input = {
    feishuSync,
    larkDoc,
    autoRename: autoRenameNamespace,
    futureTopLevelOption: 42,
  };

  const result = migrateSettings(input);

  assert.equal(result.settings.port, 6789);
  assert.equal(result.settings.syncToken, 'nested-token');
  assert.equal(result.settings.defaultDir, 'Legacy Inbox');
  assert.equal(result.settings.defaultNoteFolder, 'Legacy Notes');
  assert.equal(result.settings.larkCliPath, '/legacy/bin/lark-cli');
  assert.equal(result.settings.autoRename, false);
  assert.equal(result.settings.autoDeleteRegistry, false);
  assert.equal(result.settings.cacheCleanup, 'monthly');
  assert.equal(result.settings.keepDecorativeImages, false);
  assert.equal(result.settings.spaceId, 'legacy-space');
  assert.equal(result.settings.futureTopLevelOption, 42);
  assert.deepEqual(result.settings.feishuSync, feishuSync);
  assert.deepEqual(result.settings.larkDoc, larkDoc);
  assert.deepEqual(result.settings._autoRename, autoRenameNamespace);
});

test('generated 3.2.1 _larkDoc settings supply missing flat values', () => {
  const runtimeLarkDoc = {
    larkCliPath: '/runtime/bin/lark-cli',
    defaultNoteFolder: 'Runtime Lark Notes',
    futureRuntimeOption: 'keep-runtime-value',
  };
  const input = {
    larkCliPath: '',
    defaultNoteFolder: '',
    hideSystemProperties: false,
    _larkDoc: runtimeLarkDoc,
  };

  const result = migrateSettings(input);

  assert.equal(result.settings.larkCliPath, '/runtime/bin/lark-cli');
  assert.equal(result.settings.defaultNoteFolder, 'Runtime Lark Notes');
  assert.equal(result.settings.hideSystemProperties, false);
  assert.deepEqual(result.settings._larkDoc, runtimeLarkDoc);
});

test('unambiguous legacy scalar strings are converted', () => {
  const result = migrateSettings({
    port: '5678',
    autoRename: 'false',
    autoDeleteRegistry: 'true',
    keepDecorativeImages: 'false',
    hideSystemProperties: 'true',
  });

  assert.equal(result.settings.port, 5678);
  assert.equal(result.settings.autoRename, false);
  assert.equal(result.settings.autoDeleteRegistry, true);
  assert.equal(result.settings.keepDecorativeImages, false);
  assert.equal(result.settings.hideSystemProperties, true);
});

test('invalid existing automatic behavior settings fail closed', () => {
  const legacyNamespace = { repairOrder: 'visible' };
  const result = migrateSettings({
    autoRename: legacyNamespace,
    autoDeleteRegistry: 'sometimes',
  });

  assert.equal(result.settings.autoRename, false);
  assert.equal(result.settings.autoDeleteRegistry, false);
  assert.deepEqual(result.settings._autoRename, legacyNamespace);
});

test('an interrupted current migration fills gaps without resetting saved values', () => {
  const input = {
    schemaVersion: 1,
    port: 4321,
    syncToken: 'keep-after-interruption',
    defaultDir: 'Do Not Reset',
    autoRename: false,
    interruptedMarker: 'keep',
  };

  const result = migrateSettings(input);

  assert.equal(result.settings.port, 4321);
  assert.equal(result.settings.syncToken, 'keep-after-interruption');
  assert.equal(result.settings.defaultDir, 'Do Not Reset');
  assert.equal(result.settings.autoRename, false);
  assert.equal(result.settings.interruptedMarker, 'keep');
  assert.equal(result.settings.cacheCleanup, 'weekly');
});

test('repeating a migration is idempotent', () => {
  const first = migrateSettings({
    port: 7654,
    syncToken: 'stable-token',
    custom: { nested: true },
  });
  const second = migrateSettings(first.settings);

  assert.equal(first.changed, true);
  assert.equal(second.changed, false);
  assert.deepEqual(second.settings, first.settings);
});

test('corrupt or hostile input falls back safely without exposing a token', () => {
  const secret = 'token-that-must-not-appear';
  const messages = [];
  const originalError = console.error;
  const originalWarn = console.warn;
  console.error = (...args) => messages.push(args.join(' '));
  console.warn = (...args) => messages.push(args.join(' '));

  try {
    const hostile = new Proxy({}, {
      ownKeys() {
        throw new Error(secret);
      },
    });

    assert.doesNotThrow(() => migrateSettings(hostile));
    assert.doesNotThrow(() => migrateSettings(null));
    assert.doesNotThrow(() => migrateSettings(['not', 'settings']));
    assert.equal(migrateSettings(hostile).settings.syncToken, '');
  } finally {
    console.error = originalError;
    console.warn = originalWarn;
  }

  assert.equal(messages.join('\n').includes(secret), false);
});

test('prototype-shaped legacy keys remain inert data properties', () => {
  const input = JSON.parse(`{
    "__proto__": { "polluted": "from-proto" },
    "constructor": { "prototype": { "polluted": "from-constructor" } }
  }`);

  const result = migrateSettings(input);

  assert.equal(Object.getPrototypeOf(result.settings), Object.prototype);
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(result.settings, '__proto__')?.value,
    { polluted: 'from-proto' },
  );
  assert.deepEqual(result.settings.constructor, {
    prototype: { polluted: 'from-constructor' },
  });
  assert.equal(Object.prototype.polluted, undefined);
  assert.equal({}.polluted, undefined);
});

test('fresh installs generate a token when global crypto is unavailable', () => {
  const cryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: undefined,
  });

  try {
    const token = generateSyncToken();
    assert.match(token, /^[0-9a-f]{64}$/);
  } finally {
    if (cryptoDescriptor) {
      Object.defineProperty(globalThis, 'crypto', cryptoDescriptor);
    } else {
      delete globalThis.crypto;
    }
  }
});
