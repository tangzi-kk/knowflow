import assert from 'node:assert/strict';
import test from 'node:test';

import { buildConfirmedDeleteCommands, previewPendingDeletions } from '../src/deleteWorkflow.ts';

const records = [
  { recordId: 'record-1', nodeToken: 'node-1', title: 'One', path: 'a.md' },
  { recordId: 'record-2', nodeToken: 'node-2', title: 'Two', path: 'b.md' },
];

test('preview is data-only and never creates a delete command', () => {
  const preview = previewPendingDeletions(records);
  assert.equal(preview.length, 2);
  assert.equal(JSON.stringify(preview).includes('node-delete'), false);
});

test('remote deletion requires an exact candidate and explicit confirmation', () => {
  assert.throws(() => buildConfirmedDeleteCommands(records[0], { confirmed: false }), /confirm/i);
  assert.throws(
    () => buildConfirmedDeleteCommands(records[0], { confirmed: true, expectedNodeToken: 'wrong' }),
    /changed/i,
  );
});

test('confirmed deletion excludes children by default and only then passes yes', () => {
  const commands = buildConfirmedDeleteCommands(records[0], {
    confirmed: true,
    expectedNodeToken: 'node-1',
  });
  assert.equal(commands.deleteArgs.includes('--yes'), true);
  assert.equal(commands.deleteArgs.includes('--include-children'), false);
  assert.equal(commands.updateArgs.join(' ').includes('已删除'), true);
});

test('children are included only when separately confirmed', () => {
  const commands = buildConfirmedDeleteCommands(records[0], {
    confirmed: true,
    expectedNodeToken: 'node-1',
    includeChildren: true,
    confirmedChildren: true,
  });
  assert.equal(commands.deleteArgs.includes('--include-children'), true);
  assert.throws(() => buildConfirmedDeleteCommands(records[0], {
    confirmed: true,
    expectedNodeToken: 'node-1',
    includeChildren: true,
  }), /children/i);
});
