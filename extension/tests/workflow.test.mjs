import assert from 'node:assert/strict';
import test from 'node:test';

import { WorkflowStore } from '../src/workflow.ts';

class MemoryStorage {
  data = {};

  async get(keys) {
    const selected = Array.isArray(keys) ? keys : [keys];
    return Object.fromEntries(selected.filter((key) => key in this.data).map((key) => [key, structuredClone(this.data[key])]));
  }

  async set(items) {
    Object.assign(this.data, structuredClone(items));
  }
}

function makeStore(storage = new MemoryStorage()) {
  let sequence = 0;
  let now = 1_000;
  return {
    storage,
    store: new WorkflowStore(storage, {
      idFactory: () => `operation-${++sequence}`,
      now: () => ++now,
      maxOperations: 3,
    }),
  };
}

test('a workflow succeeds only after the real task returns its final path', async () => {
  const { store } = makeStore();
  let finish;
  const execution = store.run('fetch', 'request-1', () => new Promise((resolve) => {
    finish = resolve;
  }));
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal((await store.list())[0].state, 'running');

  finish({ path: 'notes/final.md', action: 'created' });
  const result = await execution;
  const operation = (await store.list())[0];
  assert.equal(result.path, 'notes/final.md');
  assert.equal(operation.state, 'succeeded');
  assert.deepEqual(operation.result, { path: 'notes/final.md', action: 'created' });
});

test('failures persist a redacted terminal error and remain retryable as a new operation', async () => {
  const { store } = makeStore();
  await assert.rejects(
    store.run('clip', 'request-1', async () => {
      throw new Error('Bearer abcdefghijklmnopqrstuvwxyz token=super-secret-value');
    }),
  );
  const failed = (await store.list())[0];
  assert.equal(failed.state, 'failed');
  assert.equal(failed.error.message.includes('abcdefghijklmnopqrstuvwxyz'), false);
  assert.equal(failed.error.message.includes('super-secret-value'), false);

  const result = await store.run('clip', 'request-2', async () => ({ path: 'retry.md', action: 'created' }));
  assert.equal(result.path, 'retry.md');
});

test('worker restart turns abandoned running work into an explicit failure', async () => {
  const { storage, store } = makeStore();
  const queued = await store.create('fetch', 'request-1');
  await store.transition(queued.operationId, 'running');

  const recoveredStore = makeStore(storage).store;
  const recovered = await recoveredStore.recoverInterrupted();
  assert.equal(recovered, 1);
  const operation = (await recoveredStore.list())[0];
  assert.equal(operation.state, 'failed');
  assert.equal(operation.error.code, 'WORKER_RESTARTED');
});

test('invalid stale and terminal transitions fail closed', async () => {
  const { store } = makeStore();
  const operation = await store.create('fetch', 'request-1');
  await assert.rejects(store.transition(operation.operationId, 'succeeded'), { code: 'INVALID_OPERATION_TRANSITION' });
  await store.transition(operation.operationId, 'running');
  await store.transition(operation.operationId, 'succeeded', { result: { path: 'a.md', action: 'created' } });
  await assert.rejects(store.transition(operation.operationId, 'failed'), { code: 'INVALID_OPERATION_TRANSITION' });
});

test('concurrent creates do not lose operations and history remains bounded', async () => {
  const { store } = makeStore();
  await Promise.all(Array.from({ length: 10 }, (_, index) =>
    store.run('clip', `request-${index}`, async () => ({ path: `${index}.md`, action: 'created' }))));
  const operations = await store.list();
  assert.equal(operations.length, 3);
  assert.deepEqual(operations.map((item) => item.requestId), ['request-9', 'request-8', 'request-7']);
});
