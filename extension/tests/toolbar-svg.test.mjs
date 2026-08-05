import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const toolbarSource = new URL('../src/content/toolbar.ts', import.meta.url);

test('copy feedback polyline uses numeric coordinate pairs', async () => {
  const source = await readFile(toolbarSource, 'utf8');

  assert.match(source, /<polyline points="3 8 6 11 13 4"\/>/);
  assert.doesNotMatch(source, /<polyline[^>]*points="[^"]*[a-z]/i);
});
