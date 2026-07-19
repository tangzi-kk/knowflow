import assert from 'node:assert/strict';
import test from 'node:test';

import { buildRemoteDocument } from '../src/remoteCanonical.ts';

test('remote canonicalization produces one stable body hash and extracts identity', () => {
  const first = buildRemoteDocument('# Remote title\n\nBody', '<title id="obj_123"></title>', 'node_123');
  const second = buildRemoteDocument('# Remote title\n\nBody', '<title id="obj_123"></title>', 'node_123');

  assert.equal(first.title, 'Remote title');
  assert.equal(first.objToken, 'obj_123');
  assert.equal(first.body, second.body);
  assert.equal(first.hash, second.hash);
  assert.ok(first.hash);
});

test('explicit obj token wins and missing title falls back to the node token', () => {
  const result = buildRemoteDocument('Body only', '<title id="xml_obj"></title>', 'node_123', 'explicit_obj');
  assert.equal(result.title, 'node_123');
  assert.equal(result.objToken, 'explicit_obj');
});
