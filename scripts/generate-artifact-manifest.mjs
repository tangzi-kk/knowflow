import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).version;
const files = [
  'packages/ob-plugin/main.js',
  'packages/ob-plugin/manifest.json',
  'extension/dist/background.js',
  'extension/dist/content.js',
  'extension/dist/toolbar.js',
  'extension/dist/sidepanel.js',
  'extension/dist/popup.js',
  'extension/dist/settings.js',
  'extension/dist/manifest.json',
];

const lines = [`# KnowFlow ${version}`];
for (const relativePath of files) {
  const digest = createHash('sha256').update(await readFile(path.join(root, relativePath))).digest('hex');
  lines.push(`${digest}  ${relativePath}`);
}
const outputDirectory = path.join(root, 'artifacts');
await mkdir(outputDirectory, { recursive: true });
await writeFile(path.join(outputDirectory, `KnowFlow-${version}-SHA256SUMS`), `${lines.join('\n')}\n`, 'utf8');
console.log(`wrote artifacts/KnowFlow-${version}-SHA256SUMS`);
