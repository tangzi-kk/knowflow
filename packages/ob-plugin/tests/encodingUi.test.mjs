import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourceDirectory = path.resolve(testDirectory, '../src');
const uiSource = await readFile(path.join(sourceDirectory, 'encodingUi.ts'), 'utf8');
const entrySource = await readFile(path.join(sourceDirectory, 'uiEntry.ts'), 'utf8');
const mainSource = await readFile(path.join(sourceDirectory, 'main.ts'), 'utf8');

test('one registrar owns the file explorer single and multi-selection menus', () => {
  assert.match(uiSource, /function registerEncodingContextMenu/);
  assert.equal((uiSource.match(/workspace\.on\(\s*['"]file-menu['"]/g) ?? []).length, 1);
  assert.equal((uiSource.match(/workspace\.on\(\s*['"]files-menu['"]/g) ?? []).length, 1);
  assert.match(uiSource, /source !== FILE_EXPLORER_SOURCE/);
  assert.match(uiSource, /file-explorer-context-menu/);
  assert.match(uiSource, /整理此文档…/);
  assert.match(uiSource, /整理此目录…/);
  assert.match(uiSource, /整理所选内容…/);
  assert.match(uiSource, /WeakSet<FeishuSyncPlugin>/);
});

test('protected roots are hidden and blocked before transaction preview', () => {
  assert.match(uiSource, /PROTECTED_PATH_RE/);
  assert.match(uiSource, /AGENTS/);
  assert.match(uiSource, /🪧导引/);
  assert.match(uiSource, /targets\.some\(\(target\) => isProtectedPath\(target\.path\)\)/);
  assert.match(uiSource, /safePaths\.some\(isProtectedPath\)/);
});

test('all organization actions use the 4.1 preview and commit transaction boundary', () => {
  assert.match(uiSource, /previewTargets\(safePaths, scope\)/);
  assert.match(uiSource, /commitPlan\(this\.plan\.operationId\)/);
  assert.match(uiSource, /depth: 'direct'/);
  assert.match(uiSource, /mode: 'manual'/);
  assert.match(uiSource, /mode: 'clear'/);
  assert.doesNotMatch(uiSource, /createEncodingWorkflow|\.apply\(|setManualCode|clearCode/);
  assert.doesNotMatch(uiSource, /\.vault\.(?:modify|rename|create|delete|trash)\s*\(/);
});

test('clear encoding explains both file and property impact before a second preview', () => {
  assert.match(uiSource, /同时移除文件名编码与文档属性中的编码\/短编码/);
  assert.match(uiSource, /继续生成清除预览/);
  assert.match(uiSource, /高级操作仍会重新生成预览/);
});

test('the plugin registers one KnowFlow ribbon and no persistent view', () => {
  assert.equal((entrySource.match(/addRibbonIcon\(/g) ?? []).length, 1);
  assert.match(entrySource, /'KnowFlow：整理与同步'/);
  assert.match(entrySource, /new Menu\(\)/);
  assert.match(entrySource, /整理当前文档…/);
  assert.match(entrySource, /待确认任务/);
  assert.match(entrySource, /getPendingKnowledgePlans/);
  assert.match(entrySource, /同步状态与最近记录/);
  assert.match(entrySource, /刷新目录映射/);
  assert.match(entrySource, /重建编码索引/);
  assert.match(entrySource, /导出同步日志/);
  assert.doesNotMatch(entrySource, /registerView|setViewState|getRightLeaf/);
  assert.doesNotMatch(mainSource, /addRibbonIcon\(/);
});

test('mixed selections skip unsupported files and failed registration can retry cleanly', () => {
  assert.match(uiSource, /targets\.filter\(isSupportedSelectionTarget\)/);
  assert.match(uiSource, /workspace\.offref\(eventRef\)/);
  assert.match(uiSource, /targets\.map\(\(target\) => target\.path\)/);
  assert.match(uiSource, /registeredPlugins\.add\(plugin\)/);
  assert.doesNotMatch(entrySource, /rememberedFileTreeTargets|getRememberedFileTreeTargets/);
});

test('removed structure-container and direct operation entries do not return', () => {
  for (const removed of [
    'StructureContainerModal',
    '新建结构容器',
    '预览批量编码',
    '调整编码顺序',
    '手动改编码',
    '删除编码',
  ]) {
    assert.equal(uiSource.includes(removed), false, removed);
    assert.equal(entrySource.includes(removed), false, removed);
  }
});
