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

test('the Obsidian settings page uses one user-oriented flow', () => {
  for (const label of ['连接', '同步与本地显示', '飞书知识库', '高级设置']) {
    assert.match(settingsSource, new RegExp(`createSection\\(containerEl, '${label}'`));
  }

  assert.doesNotMatch(settingsSource, /fstb-tab/);
  assert.doesNotMatch(settingsSource, /activeTab/);
  assert.match(settingsSource, /这里只管理长期配置/);
});

test('technical compatibility stays advanced and dead switches stay hidden', () => {
  assert.match(settingsSource, /命令行工具路径/);
  assert.match(settingsSource, /旧版 Lark Doc 独立视图和写入通道不会启用/);
  assert.doesNotMatch(settingsSource, /this\.plugin\.settings\.defaultNoteFolder/);
  assert.doesNotMatch(settingsSource, /同步装饰\/排版图片/);
  assert.doesNotMatch(settingsSource, /keepDecorativeImages/);
  assert.doesNotMatch(settingsSource, /删除自动登记/);
  assert.doesNotMatch(settingsSource, /autoDeleteRegistry/);
  assert.doesNotMatch(settingsSource, /registerView/);
  assert.doesNotMatch(settingsSource, /registerObsidianProtocolHandler/);
  assert.doesNotMatch(settingsSource, /require\(['"]\.\.\/lark-doc\.js['"]\)/);
  assert.doesNotMatch(settingsSource, /require\(['"]\.\.\/auto-rename\.js['"]\)/);
});

test('the Obsidian package ships responsive single-page settings styles', () => {
  for (const selector of [
    '.fstb-title',
    '.fstb-settings-intro',
    '.fstb-settings-section',
    '.fstb-status-card',
    '.fstb-info-box',
    '.fstb-encoding-preview-list',
    '.fstb-advanced-actions',
  ]) {
    assert.equal(styles.includes(selector), true, `missing ${selector}`);
  }

  assert.match(buildConfig, /access\(new URL\('\.\/styles\.css'/);
  assert.match(styles, /@media \(max-width: 520px\)/);
  assert.match(styles, /@container \(max-width: 520px\)/);
  assert.match(styles, /container-type: inline-size/);
  assert.match(styles, /\.fstb-settings-section \.setting-item-control/);
});
