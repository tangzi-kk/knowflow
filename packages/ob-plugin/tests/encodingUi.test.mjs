import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourceDirectory = path.resolve(testDirectory, '../src');
const uiSource = await readFile(path.join(sourceDirectory, 'encodingUi.ts'), 'utf8');
const commandSource = await readFile(path.join(sourceDirectory, 'commands.ts'), 'utf8');

test('encoding UI exposes preview, layer sort, structure, and context menu entrypoints', () => {
  for (const symbol of [
    'class PreviewModal',
    'class LayerSortModal',
    'class StructureContainerModal',
    'registerEncodingContextMenu',
  ]) {
    assert.match(uiSource, new RegExp(symbol));
  }
  assert.match(commandSource, /encodingWorkflow\.previewDirectory\(dir\)/);
  assert.match(commandSource, /new PreviewModal/);
});

test('encoding UI has no direct vault mutation channel', () => {
  assert.doesNotMatch(uiSource, /\.vault\.(?:modify|rename|create|delete|trash)\s*\(/);
  assert.doesNotMatch(uiSource, /\.fileManager\.renameFile\s*\(/);
  assert.doesNotMatch(commandSource, /batchAssignEncoding/);
});
