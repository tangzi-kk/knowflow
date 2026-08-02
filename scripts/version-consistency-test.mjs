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

  assert.deepEqual(versions, Array(versions.length).fill('4.5.1'));
});

test('the package lock agrees with the root and workspace package versions', async () => {
  const lock = await readJson('package-lock.json');

  assert.equal(lock.version, '4.5.1');
  assert.equal(lock.packages[''].version, '4.5.1');
  assert.equal(lock.packages.extension.version, '4.5.1');
  assert.equal(lock.packages['packages/ob-plugin'].version, '4.5.1');
  assert.equal(lock.packages[''].engines.node, '>=22.6');
});

test('the bundled SKR contract snapshot is pinned and self-consistent offline', async () => {
  const snapshot = await readJson('contracts/skr-knowledge-v1.json');
  const { contractVersion, source, tags, statuses, encoding, identity, sourceFiles } = snapshot;

  assert.equal(contractVersion, '1');
  assert.deepEqual(source, {
    repository: 'tangzi-kk/skr-knowledge',
    commit: '85cab3b942cb5ff967d8fd9e56cfb7b53915aa72',
    knowledgeVersion: '1.2.1',
    schemaVersion: 1,
    sourceSchemaVersion: 1,
  });
  assert.match(source.commit, /^[0-9a-f]{40}$/);
  assert.equal(encoding.fullFormat, 'YY_MMDD_TAG_TOPIC_LEVEL');
  assert.equal(encoding.shortFormat, 'TAGTOPIC.LEVEL');
  assert.deepEqual(tags.allowed, ['S', 'X', 'L', 'Z', 'Q', 'J']);
  assert.deepEqual(statuses, ['收集', '整理中', '已消化', '应用中', '已归档']);
  assert.equal(identity.primaryKey, '文档ID');
  assert.equal(identity.shortEncodingIsDerived, true);

  const fullEncoding = new RegExp(encoding.fullPattern);
  const shortEncoding = new RegExp(encoding.shortPattern);
  assert.equal(fullEncoding.test('25_1221_L_03_a4'), true);
  assert.equal(shortEncoding.test('L03.a4'), true);
  assert.equal(fullEncoding.test('25_1221_L_03'), false, 'legacy encoding without level must remain invalid');
  assert.equal(fullEncoding.test('25_1221_N_03_a4'), false, 'unknown legacy tag code must remain invalid');

  assert.deepEqual(sourceFiles, [
    {
      path: 'schema/enums.yaml',
      sha256: '966df6985f77b3926705ac779d64429930c64a8c431a9d79712a7b8721033cd1',
    },
    {
      path: 'schema/note.schema.json',
      sha256: '6f0c07555151cdb09b018dfab78303f8969ad6917e9a326c78119219bbee45ab',
    },
    {
      path: 'schema/encoding.yaml',
      sha256: '5ca6a5ccf8b40a15506260cc61665d63c1eadc514de2722a33d0d777919eb766',
    },
    {
      path: 'schema/feishu-sync.yaml',
      sha256: '255bb531709b074017c02f6c691612f81764636a164394a82b08b8bd4ae1f4fb',
    },
    {
      path: 'plugin-contract/sync-event.schema.json',
      sha256: '322419ca6d88f0421547315f6249cb40d01adec417b02159a27022202896454c',
    },
  ]);
  for (const sourceFile of sourceFiles) {
    assert.match(sourceFile.path, /^(?:schema|plugin-contract)\//);
    assert.match(sourceFile.sha256, /^[0-9a-f]{64}$/);
  }
});

test('the Obsidian contract module statically consumes the pinned snapshot', async () => {
  const source = await readFile(
    path.join(root, 'packages/ob-plugin/src/knowledgeContract.ts'),
    'utf8',
  );

  assert.match(
    source,
    /import contractSnapshot from '\.\.\/\.\.\/\.\.\/contracts\/skr-knowledge-v1\.json' with \{ type: 'json' \};/,
  );
  assert.doesNotMatch(source, /\bfetch\s*\(|https?:\/\//, 'contract loading must remain offline');
  for (const exportedName of [
    'KNOWLEDGE_CONTRACT',
    'FULL_ENCODING_RE',
    'FILE_PREFIX_RE',
    'deriveShortEncoding',
    'KnowledgeContractRef',
  ]) {
    assert.match(source, new RegExp(`\\b${exportedName}\\b`));
  }
});
