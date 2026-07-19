import assert from 'node:assert/strict';
import test from 'node:test';

import { assertReplacementBinding, extractFeishuId, findUniqueBinding } from '../src/bindingIndex.ts';

test('extracts quoted and unquoted IDs across BOM and CRLF input', () => {
  assert.equal(extractFeishuId('\ufeff---\r\nfeishu_id: "abc123"\r\n---\r\nbody'), 'abc123');
  assert.equal(extractFeishuId("---\nfeishu_id: 'xyz789'\n---\nbody"), 'xyz789');
  assert.equal(extractFeishuId('---\nother: value\n---\nbody'), null);
});

test('finds one binding and ignores internal files', () => {
  const result = findUniqueBinding('abc', [
    { path: '.obsidian/plugins/test.md', content: '---\nfeishu_id: abc\n---' },
    { path: '0️⃣输入/a.md', content: '---\nfeishu_id: abc\n---' },
  ]);
  assert.equal(result?.path, '0️⃣输入/a.md');
});

test('duplicate bindings fail closed with every conflicting path', () => {
  assert.throws(
    () => findUniqueBinding('abc', [
      { path: 'a.md', content: '---\nfeishu_id: abc\n---' },
      { path: 'b.md', content: '---\nfeishu_id: "abc"\n---' },
    ]),
    (error) => error.code === 'BINDING_CONFLICT'
      && error.status === 409
      && error.message.includes('a.md')
      && error.message.includes('b.md'),
  );
});

test('scan remains deterministic at the verified 537-document scale', () => {
  const entries = Array.from({ length: 537 }, (_, index) => ({
    path: `notes/${String(index).padStart(3, '0')}.md`,
    content: `---\nfeishu_id: id${index}\n---\nbody`,
  }));
  assert.equal(findUniqueBinding('id536', entries)?.path, 'notes/536.md');
  assert.equal(findUniqueBinding('missing', entries), null);
});

test('a Clipper placeholder cannot replace a note bound to another document', () => {
  assert.doesNotThrow(() => assertReplacementBinding('plain placeholder', 'abc', 'placeholder.md'));
  assert.doesNotThrow(() => assertReplacementBinding('---\nfeishu_id: abc\n---', 'abc', 'same.md'));
  assert.throws(
    () => assertReplacementBinding('---\nfeishu_id: other\n---', 'abc', 'other.md'),
    { code: 'REPLACEMENT_BINDING_CONFLICT', status: 409 },
  );
});
