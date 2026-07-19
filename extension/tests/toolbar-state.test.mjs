import assert from 'node:assert/strict';
import test from 'node:test';

import { initialToolbarState, reduceToolbarState } from '../src/content/toolbar-state.ts';

test('toolbar follows one explicit loading streaming result lifecycle', () => {
  let state = reduceToolbarState(initialToolbarState(), { type: 'SHOW_CAPSULE' });
  assert.equal(state.phase, 'capsule');
  state = reduceToolbarState(state, { type: 'START', requestId: 'request-a' });
  state = reduceToolbarState(state, { type: 'CHUNK', requestId: 'request-a', chunk: 'A' });
  state = reduceToolbarState(state, { type: 'CHUNK', requestId: 'request-a', chunk: 'B' });
  assert.deepEqual({ phase: state.phase, content: state.content }, { phase: 'streaming', content: 'AB' });
  state = reduceToolbarState(state, { type: 'DONE', requestId: 'request-a' });
  assert.equal(state.phase, 'result');
});

test('late chunks and terminal messages from an older request are ignored', () => {
  let state = reduceToolbarState(initialToolbarState(), { type: 'START', requestId: 'request-new' });
  const sameAfterChunk = reduceToolbarState(state, { type: 'CHUNK', requestId: 'request-old', chunk: 'stale' });
  assert.equal(sameAfterChunk, state);
  const sameAfterDone = reduceToolbarState(state, { type: 'DONE', requestId: 'request-old', text: 'stale' });
  assert.equal(sameAfterDone, state);
});

test('closing invalidates the request so worker messages cannot reopen the result', () => {
  let state = reduceToolbarState(initialToolbarState(), { type: 'START', requestId: 'request-a' });
  state = reduceToolbarState(state, { type: 'CLOSE' });
  const afterLateChunk = reduceToolbarState(state, { type: 'CHUNK', requestId: 'request-a', chunk: 'late' });
  assert.equal(afterLateChunk, state);
  assert.equal(afterLateChunk.phase, 'closing');
  assert.equal(reduceToolbarState(afterLateChunk, { type: 'RESET' }).phase, 'idle');
});

test('a stale error cannot replace a newer request', () => {
  const state = reduceToolbarState(initialToolbarState(), { type: 'START', requestId: 'request-b' });
  assert.equal(reduceToolbarState(state, { type: 'FAIL', requestId: 'request-a', error: 'old' }), state);
  const failed = reduceToolbarState(state, { type: 'FAIL', requestId: 'request-b', error: 'current' });
  assert.deepEqual({ phase: failed.phase, error: failed.error }, { phase: 'error', error: 'current' });
});
