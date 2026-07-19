import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const manifestUrl = new URL('../manifest.json', import.meta.url);
const backgroundUrl = new URL('../src/background.ts', import.meta.url);
const contentUrl = new URL('../src/content/content.ts', import.meta.url);

test('high-risk debugger access is optional and unused desktop capture access is absent', async () => {
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  assert.equal(manifest.permissions.includes('debugger'), false);
  assert.equal(manifest.permissions.includes('desktopCapture'), false);
  assert.deepEqual(manifest.optional_permissions, ['debugger']);

  const background = await readFile(backgroundUrl, 'utf8');
  assert.match(background, /chrome\.permissions\.request\(\{ permissions: \['debugger'\] \}\)/);
});

test('the Feishu FAB reports success only after a direct operation returns a final path', async () => {
  const content = await readFile(contentUrl, 'utf8');
  assert.match(content, /directSync: true/);
  assert.match(content, /!response\?\.ok \|\| !response\.result\?\.path/);
  assert.doesNotMatch(content, /\.then\(\(\) => \{\s*setFabState\('success'/);
});

test('sidepanel writes are serialized by the background workflow owner', async () => {
  const background = await readFile(backgroundUrl, 'utf8');
  const sidepanel = await readFile(new URL('../src/sidepanel/sidepanel.ts', import.meta.url), 'utf8');
  assert.match(background, /message\.type === 'knowflow-write'/);
  assert.match(sidepanel, /type: 'knowflow-write'/);
  assert.doesNotMatch(sidepanel, /from '\.\.\/workflow\.js'/);
});
