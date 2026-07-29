import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../需求编辑器.html', import.meta.url), 'utf8');
const inlineScript = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];

test('requirement editor inline script remains valid JavaScript', () => {
  assert.ok(inlineScript, 'missing inline script');
  assert.doesNotThrow(() => new Function(inlineScript));
});

test('one requirement action writes before clearing the recoverable draft', () => {
  assert.doesNotMatch(html, /id="saveButton"/);
  assert.match(html, /action: '保存需求'/);

  const writeFinished = inlineScript.indexOf('await writable.close();');
  const inputCleared = inlineScript.indexOf("elements.input.value = '';", writeFinished);
  const draftCleared = inlineScript.indexOf('window.localStorage.removeItem(STORAGE_KEY);', writeFinished);
  assert.ok(writeFinished > -1, 'missing completed file write');
  assert.ok(inputCleared > writeFinished, 'input must remain until the file write succeeds');
  assert.ok(draftCleared > writeFinished, 'draft must remain until the file write succeeds');
});

test('requirement writes detect conflicts and roll back newly created screenshots', () => {
  assert.match(inlineScript, /需求池已被其他窗口修改，本次未覆盖/);
  assert.match(inlineScript, /imageNameExists/);
  assert.match(inlineScript, /rollbackImages/);
  assert.match(inlineScript, /保存失败，草稿仍保留/);
});

test('structured intake keeps product, memory and knowledge outputs separate', () => {
  assert.match(inlineScript, /requirement: \{/);
  assert.match(inlineScript, /memory: \{/);
  assert.match(inlineScript, /knowledge: \{/);
  assert.match(inlineScript, /buildMemoryBlock/);
  assert.match(inlineScript, /buildKnowledgeDocument/);
});
