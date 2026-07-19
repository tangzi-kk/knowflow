import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test, { after } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import ts from 'typescript';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const compiledDirectory = await mkdtemp(path.join(tmpdir(), 'system-properties-test-'));

after(async () => {
  await rm(compiledDirectory, { recursive: true, force: true });
});

const source = await readFile(path.resolve(testDirectory, '../src/systemProperties.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;
const modulePath = path.join(compiledDirectory, 'systemProperties.js');
await writeFile(modulePath, compiled);

const { isSystemPropertyKey, SYSTEM_PROPERTY_CSS } = await import(pathToFileURL(modulePath).href);

test('recognizes current and legacy system-property keys', () => {
  for (const key of ['_sys_source', 'feishu_id', 'feishu_doc_id', 'feishu_title', 'sync_hash', 'sync_time']) {
    assert.equal(isSystemPropertyKey(key), true, key);
  }
});

test('does not hide user properties that only resemble system keys', () => {
  for (const key of ['', 'sys_source', 'feishu_id_copy', 'my_sync_time', null, undefined]) {
    assert.equal(isSystemPropertyKey(key), false, String(key));
  }
});

test('style contains both prefix and legacy fallbacks', () => {
  assert.match(SYSTEM_PROPERTY_CSS, /data-property-key\^="_sys_"/);
  assert.match(SYSTEM_PROPERTY_CSS, /data-property-key="feishu_id"/);
  assert.match(SYSTEM_PROPERTY_CSS, /fstb-system-property-hidden/);
});
