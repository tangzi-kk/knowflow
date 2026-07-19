import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('4.0 destructive paths fail closed', async () => {
  const [settings, deletion, server] = await Promise.all([
    read('packages/ob-plugin/src/settings.ts'),
    read('packages/ob-plugin/src/deleteWorkflow.ts'),
    read('packages/ob-plugin/src/server.ts'),
  ]);
  assert.match(settings, /autoDeleteRegistry: false/);
  assert.match(deletion, /Deletion requires explicit confirmation/);
  assert.match(deletion, /confirmedChildren/);
  assert.match(server, /if \(!deps\.validateToken/);
  assert.match(server, /BODY_TOO_LARGE/);
  assert.match(server, /REQUEST_TIMEOUT/);
});

test('4.0 browser success and permissions remain evidence-based', async () => {
  const [content, manifest, workflow] = await Promise.all([
    read('extension/src/content/content.ts'),
    read('extension/manifest.json'),
    read('extension/src/workflow.ts'),
  ]);
  assert.match(content, /!response\?\.ok \|\| !response\.result\?\.path/);
  const parsedManifest = JSON.parse(manifest);
  assert.equal(parsedManifest.permissions.includes('desktopCapture'), false);
  assert.equal(parsedManifest.permissions.includes('debugger'), false);
  assert.match(workflow, /WORKER_RESTARTED/);
});

test('4.0 activity schema cannot persist body prompt token or raw error', async () => {
  const activity = await read('packages/ob-plugin/src/activity.ts');
  for (const forbidden of ['body:', 'prompt:', 'token:', 'error:']) {
    assert.equal(activity.includes(forbidden), false, `activity source must not define ${forbidden}`);
  }
});
