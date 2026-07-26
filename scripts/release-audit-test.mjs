import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('4.1 destructive paths fail closed', async () => {
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

test('4.1 browser success and permissions remain evidence-based', async () => {
  const [content, manifest, workflow] = await Promise.all([
    read('extension/src/content/content.ts'),
    read('extension/manifest.json'),
    read('extension/src/workflow.ts'),
  ]);
  assert.match(content, /!response\?\.ok/);
  assert.match(content, /!response\.result\?\.proposalId/);
  assert.match(content, /response\.result\.protocolVersion !== PROTOCOL_VERSION/);
  const parsedManifest = JSON.parse(manifest);
  assert.equal(parsedManifest.permissions.includes('desktopCapture'), false);
  assert.equal(parsedManifest.permissions.includes('debugger'), false);
  assert.match(workflow, /WORKER_RESTARTED/);
});

test('4.1 activity schema cannot persist body prompt token or raw error', async () => {
  const activity = await read('packages/ob-plugin/src/activity.ts');
  for (const forbidden of ['body:', 'prompt:', 'token:', 'error:']) {
    assert.equal(activity.includes(forbidden), false, `activity source must not define ${forbidden}`);
  }
});

test('4.1 knowledge transactions and capture proposals fail closed', async () => {
  const [workflow, fetch, clip, protocol, browserWorkflow] = await Promise.all([
    read('packages/ob-plugin/src/encodingWorkflow.ts'),
    read('packages/ob-plugin/src/handlers/fetchHandler.ts'),
    read('packages/ob-plugin/src/handlers/clipHandler.ts'),
    read('packages/shared/src/protocol.ts'),
    read('extension/src/workflow.ts'),
  ]);
  assert.match(workflow, /coordinator\.run\('knowledge:vault'/);
  assert.match(workflow, /verifyRollbackFresh/);
  assert.match(workflow, /transactionTemporaryPath/);
  assert.match(workflow, /buildRollbackSyncEvent/);
  assert.match(protocol, /capture-proposal-v1/);
  for (const handler of [fetch, clip]) {
    assert.doesNotMatch(handler, /fallbackProposalId|pending-(?:fetch|clip)/);
    assert.match(handler, /KNOWLEDGE_PROPOSAL_FAILED_AFTER_LANDING/);
  }
  assert.match(browserWorkflow, /'awaiting-confirmation'/);
  assert.match(browserWorkflow, /result\.proposalId && result\.requiresConfirmation === true/);
});
