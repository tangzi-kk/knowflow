import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizeVaultDir,
  normalizeVaultMarkdownPath,
  validateImageToken,
} from '../src/vaultPath.ts';

test('normalizes safe Vault directories and Markdown paths', () => {
  assert.equal(normalizeVaultDir(' 0️⃣输入/飞书 '), '0️⃣输入/飞书');
  assert.equal(normalizeVaultMarkdownPath('0️⃣输入/note.md'), '0️⃣输入/note.md');
  assert.equal(normalizeVaultDir(''), '');
});

test('rejects absolute traversal encoded-separator NUL and internal paths', () => {
  const unsafe = [
    '/tmp/a',
    '\\\\server\\share',
    'C:\\temp\\a',
    '../a',
    'safe/../../a',
    'safe/%2fetc',
    'safe/%5cetc',
    'safe/%2e%2e/a',
    'safe\u0000/a',
    '.obsidian/plugins/a',
    '.feishu-sync/state.json',
  ];
  for (const value of unsafe) {
    assert.throws(() => normalizeVaultDir(value), { code: 'UNSAFE_VAULT_PATH' }, value);
  }
});

test('replacement and append paths must be Markdown and bounded', () => {
  for (const value of ['note', 'note.txt', 'folder/', `${'a'.repeat(256)}.md`, `${'a/'.repeat(600)}note.md`]) {
    assert.throws(() => normalizeVaultMarkdownPath(value), undefined, value);
  }
});

test('image token validation permits only bounded opaque identifiers', () => {
  assert.equal(validateImageToken('abc_DEF-123'), 'abc_DEF-123');
  for (const value of ['', '../secret', 'a/b', 'a%2fb', 'a.png', 'a'.repeat(257)]) {
    assert.throws(() => validateImageToken(value), { code: 'UNSAFE_IMAGE_TOKEN' }, value);
  }
});
