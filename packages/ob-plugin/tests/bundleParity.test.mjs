import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const bundle = await readFile(path.resolve(testDirectory, '../main.js'), 'utf8');
const runtime = bundle.slice(0, bundle.lastIndexOf('//# sourceMappingURL='));

test('the shipped bundle contains the 3.5.0 settings migration path', () => {
  assert.equal(
    /function migrateSettings\(input\)/.test(runtime),
    true,
    'bundle must include migrateSettings',
  );
  assert.equal(
    /migrateSettings\(await this\.loadData\(\)\)/.test(runtime),
    true,
    'plugin load must call migrateSettings',
  );
  assert.equal(
    /this\.settings = Object\.assign\(\{\}, DEFAULT_SETTINGS, await this\.loadData\(\)\)/.test(runtime),
    false,
    'Object.assign-only loading must not return',
  );
});

test('the shipped bundle contains the verified runtime default and token fallback', () => {
  assert.equal(
    /defaultNoteFolder: "3\\uFE0F\\u20E3\\u9644\\u4EF6\\u6587\\u4EF6\/Lark"/.test(runtime),
    true,
    'bundle must retain the verified Lark folder default',
  );
  assert.equal(
    /function generateSyncToken\(\)/.test(runtime),
    true,
    'bundle must include the shared token helper',
  );
  assert.equal(
    /globalThis\.crypto \?\? import_node_crypto\.webcrypto/.test(runtime),
    true,
    'bundle token helper must retain the Node Web Crypto fallback',
  );
});

test('the shipped bundle reports the fs-TB identity', () => {
  assert.equal(/\[fs-TB\]/.test(runtime), true);
  assert.equal(/\[sync\] feishu-sync (?:loaded|unloaded)/.test(runtime), false);
});

test('the shipped bundle preserves the 3.2.1 system-property visibility behavior', () => {
  assert.equal(/applySystemPropertiesVisibility\(\)/.test(runtime), true);
  assert.equal(/fstb-hide-system-properties/.test(runtime), true);
  assert.equal(/fstb-system-property-hidden/.test(runtime), true);
  assert.equal(/feishu_doc_id/.test(runtime), true);
});
