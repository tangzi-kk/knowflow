import { execFile } from 'node:child_process';
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).version;
const sourceData = process.argv[2];
if (!sourceData) throw new Error('usage: node scripts/staging-vault-smoke.mjs /absolute/path/to/data.json');

const stagingRoot = await mkdtemp(path.join(tmpdir(), `knowflow-${version}-vault-smoke-`));
try {
  const pluginsRoot = path.join(stagingRoot, '.obsidian/plugins');
  const archive = path.join(root, `artifacts/fs-TB-Obsidian-${version}.zip`);
  await mkdir(pluginsRoot, { recursive: true });
  await execFileAsync('unzip', ['-q', archive, '-d', pluginsRoot]);

  const pluginRoot = path.join(pluginsRoot, 'fs-TB');
  const before = await readFile(sourceData);
  await copyFile(sourceData, path.join(pluginRoot, 'data.json'));
  const after = await readFile(path.join(pluginRoot, 'data.json'));
  if (!before.equals(after)) throw new Error('staged data.json changed during installation');

  const manifest = JSON.parse(await readFile(path.join(pluginRoot, 'manifest.json'), 'utf8'));
  if (manifest.id !== 'fs-TB' || manifest.version !== version) {
    throw new Error(`unexpected staged manifest: ${manifest.id} ${manifest.version}`);
  }
  const files = (await readdir(pluginRoot)).sort();
  const expected = ['data.json', 'main.js', 'manifest.json', 'styles.css'];
  if (JSON.stringify(files) !== JSON.stringify(expected)) {
    throw new Error(`unexpected staged plugin files: ${files.join(', ')}`);
  }

  console.log(`staging-vault-smoke: PASS`);
  console.log(`manifest: fs-TB ${version}`);
  console.log('data.json: byte-identical');
  console.log(`plugin-files: ${files.join(' ')}`);
} finally {
  await rm(stagingRoot, { recursive: true, force: true });
}
