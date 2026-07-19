import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'));
}

test('all release-facing packages and manifests use one version', async () => {
  const files = await Promise.all([
    readJson('package.json'),
    readJson('extension/package.json'),
    readJson('extension/manifest.json'),
    readJson('packages/ob-plugin/package.json'),
    readJson('packages/ob-plugin/manifest.json'),
  ]);
  const versions = files.map((file) => file.version);

  assert.deepEqual(versions, Array(versions.length).fill('3.5.0'));
});

test('the package lock agrees with the root and workspace package versions', async () => {
  const lock = await readJson('package-lock.json');

  assert.equal(lock.version, '3.5.0');
  assert.equal(lock.packages[''].version, '3.5.0');
  assert.equal(lock.packages.extension.version, '3.5.0');
  assert.equal(lock.packages['packages/ob-plugin'].version, '3.5.0');
  assert.equal(lock.packages[''].engines.node, '>=22.6');
});
