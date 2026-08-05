import assert from 'node:assert/strict';
import test from 'node:test';

import { copyTextWithFallback } from '../src/content/clipboard.ts';

function replaceGlobal(name, value) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, {
    configurable: true,
    enumerable: previous?.enumerable ?? false,
    writable: true,
    value,
  });
  return () => {
    if (previous) Object.defineProperty(globalThis, name, previous);
    else delete globalThis[name];
  };
}

test('uses the Clipboard API when it succeeds', async () => {
  let copiedText = '';
  const restoreNavigator = replaceGlobal('navigator', {
    clipboard: { writeText: async (text) => { copiedText = text; } },
  });
  try {
    assert.equal(await copyTextWithFallback('selected text'), true);
    assert.equal(copiedText, 'selected text');
  } finally {
    restoreNavigator();
  }
});

test('falls back to a hidden textarea when Clipboard API fails', async () => {
  let selectedText = '';
  let removed = false;
  const textarea = {
    value: '',
    style: {},
    setAttribute() {},
    focus() {},
    select() { selectedText = this.value; },
    remove() { removed = true; },
  };
  const restoreNavigator = replaceGlobal('navigator', {
    clipboard: { writeText: async () => { throw new Error('permission denied'); } },
  });
  const restoreDocument = replaceGlobal('document', {
    body: { appendChild() {} },
    createElement: () => textarea,
    execCommand: (command) => command === 'copy',
  });
  try {
    assert.equal(await copyTextWithFallback('fallback text'), true);
    assert.equal(selectedText, 'fallback text');
    assert.equal(removed, true);
  } finally {
    restoreDocument();
    restoreNavigator();
  }
});

test('returns false when both copy methods fail', async () => {
  const restoreNavigator = replaceGlobal('navigator', {
    clipboard: { writeText: async () => { throw new Error('permission denied'); } },
  });
  const restoreDocument = replaceGlobal('document', {
    body: { appendChild() {} },
    createElement: () => ({
      value: '',
      style: {},
      setAttribute() {},
      focus() {},
      select() {},
      remove() {},
    }),
    execCommand: () => false,
  });
  try {
    assert.equal(await copyTextWithFallback('not copied'), false);
  } finally {
    restoreDocument();
    restoreNavigator();
  }
});
