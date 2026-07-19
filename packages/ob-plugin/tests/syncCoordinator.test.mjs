import assert from 'node:assert/strict';
import test from 'node:test';

import { SyncCoordinator } from '../src/syncCoordinator.ts';

test('twenty duplicate request IDs execute exactly once', async () => {
  const coordinator = new SyncCoordinator({ maxCompleted: 50 });
  let calls = 0;
  const task = async () => {
    calls += 1;
    await new Promise((resolve) => setTimeout(resolve, 5));
    return { path: 'note.md' };
  };

  const results = await Promise.all(
    Array.from({ length: 20 }, () => coordinator.run('doc:A', 'request-1', task)),
  );

  assert.equal(calls, 1);
  assert.deepEqual(results, Array(20).fill({ path: 'note.md' }));
});

test('different requests for one document are serialized', async () => {
  const coordinator = new SyncCoordinator();
  let active = 0;
  let maxActive = 0;
  const task = async (value) => coordinator.run('doc:A', value, async () => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    await new Promise((resolve) => setTimeout(resolve, 4));
    active -= 1;
    return value;
  });

  assert.deepEqual(await Promise.all([task('A'), task('B'), task('C')]), ['A', 'B', 'C']);
  assert.equal(maxActive, 1);
});

test('different documents can progress concurrently', async () => {
  const coordinator = new SyncCoordinator();
  let active = 0;
  let maxActive = 0;
  const task = (key) => coordinator.run(key, undefined, async () => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    await new Promise((resolve) => setTimeout(resolve, 5));
    active -= 1;
  });

  await Promise.all([task('doc:A'), task('doc:B')]);
  assert.equal(maxActive, 2);
});

test('failed requests are retryable and request IDs cannot switch documents', async () => {
  const coordinator = new SyncCoordinator();
  let calls = 0;
  await assert.rejects(
    coordinator.run('doc:A', 'request-1', async () => {
      calls += 1;
      throw new Error('temporary');
    }),
    /temporary/,
  );
  assert.equal(await coordinator.run('doc:A', 'request-1', async () => ++calls), 2);
  await assert.rejects(
    coordinator.run('doc:B', 'request-1', async () => 3),
    { code: 'REQUEST_ID_CONFLICT' },
  );
});

test('completed replay cache stays bounded', async () => {
  const coordinator = new SyncCoordinator({ maxCompleted: 2 });
  await coordinator.run('doc:A', 'one', async () => 1);
  await coordinator.run('doc:B', 'two', async () => 2);
  await coordinator.run('doc:C', 'three', async () => 3);

  assert.equal(coordinator.completedCount, 2);
});

test('request IDs are bounded opaque identifiers', async () => {
  const coordinator = new SyncCoordinator();
  await assert.rejects(coordinator.run('doc:A', 'bad request\n', async () => 1), /requestId/);
  await assert.rejects(coordinator.run('doc:A', 'a'.repeat(129), async () => 1), /requestId/);
});
