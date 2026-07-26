import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).version;
const artifacts = path.join(root, 'artifacts');
const browserDirectoryName = `KnowFlow-Browser-${version}`;
const browserDirectory = path.join(artifacts, browserDirectoryName);
const browserZip = path.join(artifacts, `${browserDirectoryName}.zip`);
const obsidianZip = path.join(artifacts, `fs-TB-Obsidian-${version}.zip`);
const tempRoot = await mkdtemp(path.join(tmpdir(), `knowflow-${version}-package-`));

try {
  await mkdir(artifacts, { recursive: true });
  await rm(browserDirectory, { recursive: true, force: true });
  await rm(browserZip, { force: true });
  await rm(obsidianZip, { force: true });

  await cp(path.join(root, 'extension/dist'), browserDirectory, { recursive: true });
  await assertNoPrivateState(browserDirectory);

  const obsidianDirectory = path.join(tempRoot, 'fs-TB');
  await mkdir(obsidianDirectory);
  for (const file of ['main.js', 'manifest.json', 'styles.css']) {
    await cp(
      path.join(root, 'packages/ob-plugin', file),
      path.join(obsidianDirectory, file),
    );
  }
  await assertNoPrivateState(obsidianDirectory);

  await execFileAsync('zip', ['-X', '-q', '-r', obsidianZip, 'fs-TB'], { cwd: tempRoot });
  await execFileAsync('zip', ['-X', '-q', '-r', browserZip, browserDirectoryName], { cwd: artifacts });

  const packageSums = [
    `${await sha256(browserZip)}  ${path.basename(browserZip)}`,
    `${await sha256(obsidianZip)}  ${path.basename(obsidianZip)}`,
  ];
  await writeFile(
    path.join(artifacts, `KnowFlow-${version}-PACKAGES-SHA256SUMS`),
    `${packageSums.join('\n')}\n`,
    'utf8',
  );
  console.log(`packaged KnowFlow ${version} release candidate`);
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}

async function sha256(file) {
  return createHash('sha256').update(await readFile(file)).digest('hex');
}

async function assertNoPrivateState(directory) {
  const forbidden = new Set(['data.json', '_metadata']);
  const { readdir } = await import('node:fs/promises');
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  for (const entry of entries) {
    if (forbidden.has(entry.name)) {
      throw new Error(`release package contains private runtime state: ${entry.name}`);
    }
  }
}
