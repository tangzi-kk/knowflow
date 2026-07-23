import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const pluginDirectory = path.resolve(testDirectory, '..');
const settingsSource = await readFile(
  path.join(pluginDirectory, 'src/settingsTab.ts'),
  'utf8',
);
const styles = await readFile(path.join(pluginDirectory, 'styles.css'), 'utf8');
const buildConfig = await readFile(
  path.join(pluginDirectory, 'esbuild.config.mjs'),
  'utf8',
);

test('the unified Obsidian settings page exposes the recovered six tabs', () => {
  for (const [id, label] of [
    ['comm', '通信'],
    ['lark-cli', 'lark-cli'],
    ['sync', '同步'],
    ['wiki', '知识库'],
    ['encoding', '编码系统'],
    ['lark-doc', 'Lark Doc'],
  ]) {
    assert.match(settingsSource, new RegExp(`id: '${id}', label: '${label}'`));
  }

  assert.match(settingsSource, /fstb-tab-bar/);
  assert.match(settingsSource, /fstb-tab-active/);
  assert.match(settingsSource, /fstb-tab-content/);
});

test('the restored UI only maps Lark Doc and encoding to current safe settings', () => {
  assert.match(settingsSource, /this\.plugin\.settings\.defaultNoteFolder/);
  assert.match(settingsSource, /this\.plugin\.settings\.autoRename/);
  assert.doesNotMatch(settingsSource, /registerView/);
  assert.doesNotMatch(settingsSource, /registerObsidianProtocolHandler/);
  assert.doesNotMatch(settingsSource, /require\(['"]\.\.\/lark-doc\.js['"]\)/);
  assert.doesNotMatch(settingsSource, /require\(['"]\.\.\/auto-rename\.js['"]\)/);
});

test('the Obsidian package ships the recovered tab styles', () => {
  for (const selector of [
    '.fstb-title',
    '.fstb-tab-bar',
    '.fstb-tab',
    '.fstb-tab-active',
    '.fstb-tab-content h3',
    '.fstb-info-box',
  ]) {
    assert.equal(styles.includes(selector), true, `missing ${selector}`);
  }

  assert.match(buildConfig, /access\(new URL\('\.\/styles\.css'/);
});
