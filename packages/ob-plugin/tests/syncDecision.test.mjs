import assert from 'node:assert/strict';
import test from 'node:test';

import { decideThreeWaySync, planSyncExecution } from '../src/syncDecision.ts';

test('missing reliable base always pauses', () => {
  assert.deepEqual(
    decideThreeWaySync({ baseHash: '', localHash: 'same', remoteHash: 'same' }),
    { action: 'pause', reason: 'MISSING_BASE' },
  );
});

test('unchanged local accepts pull and unchanged remote accepts push', () => {
  assert.deepEqual(
    decideThreeWaySync({ baseHash: 'base', localHash: 'base', remoteHash: 'remote' }),
    { action: 'pull' },
  );
  assert.deepEqual(
    decideThreeWaySync({ baseHash: 'base', localHash: 'local', remoteHash: 'base' }),
    { action: 'push' },
  );
});

test('equal current hashes converge without an overwrite', () => {
  assert.deepEqual(
    decideThreeWaySync({ baseHash: 'base', localHash: 'current', remoteHash: 'current' }),
    { action: 'converged' },
  );
  assert.deepEqual(
    decideThreeWaySync({ baseHash: 'base', localHash: 'base', remoteHash: 'base' }),
    { action: 'unchanged' },
  );
});

test('different local and remote changes are a conflict', () => {
  assert.deepEqual(
    decideThreeWaySync({ baseHash: 'base', localHash: 'local', remoteHash: 'remote' }),
    { action: 'conflict', reason: 'BOTH_CHANGED' },
  );
});

test('pull and push intents map every decision to a safe execution', () => {
  assert.equal(planSyncExecution('pull', { action: 'pull' }), 'write');
  assert.equal(planSyncExecution('push', { action: 'push' }), 'write');
  assert.equal(planSyncExecution('pull', { action: 'unchanged' }), 'skip');
  assert.equal(planSyncExecution('push', { action: 'converged' }), 'advance');
  assert.throws(() => planSyncExecution('pull', { action: 'push' }), { code: 'LOCAL_CHANGES_PENDING' });
  assert.throws(() => planSyncExecution('push', { action: 'pull' }), { code: 'REMOTE_CHANGES_PENDING' });
  assert.throws(() => planSyncExecution('pull', { action: 'pause', reason: 'MISSING_BASE' }), { code: 'MISSING_SYNC_BASE' });
  assert.throws(() => planSyncExecution('push', { action: 'conflict', reason: 'BOTH_CHANGED' }), { code: 'SYNC_CONFLICT' });
});
