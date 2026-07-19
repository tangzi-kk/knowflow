import assert from 'node:assert/strict';
import test from 'node:test';

import { appendActivity, normalizeActivity } from '../src/activity.ts';

test('activity is bounded and contains metadata only', () => {
  let activity = [];
  for (let index = 0; index < 80; index += 1) {
    activity = appendActivity(activity, {
      time: new Date(index * 1000).toISOString(),
      kind: 'fetch',
      status: 'succeeded',
      action: 'created',
      title: `Title ${index}`,
      path: `${index}.md`,
      token: 'must-not-survive',
      body: 'must-not-survive',
      prompt: 'must-not-survive',
    });
  }
  assert.equal(activity.length, 50);
  assert.equal(JSON.stringify(activity).includes('must-not-survive'), false);
});

test('corrupt persisted activity is ignored without blocking startup', () => {
  assert.deepEqual(normalizeActivity(null), []);
  assert.deepEqual(normalizeActivity({ nope: true }), []);
  assert.deepEqual(normalizeActivity([{ kind: 'fetch', status: 'not-real' }]), []);
});

test('errors keep a bounded code but never raw error details', () => {
  const activity = appendActivity([], {
    time: new Date().toISOString(),
    kind: 'pushback',
    status: 'failed',
    errorCode: 'REMOTE_WRITE_UNKNOWN',
    error: 'Bearer secret-value',
  });
  assert.equal(activity[0].errorCode, 'REMOTE_WRITE_UNKNOWN');
  assert.equal(JSON.stringify(activity).includes('secret-value'), false);
});
