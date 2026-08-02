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
  assert.match(uiSource, /KnowFlow：修改此文档标签…/);
  assert.match(uiSource, /KnowFlow：修改此目录标签（含子目录）…/);
  assert.match(uiSource, /KnowFlow：调整此文件夹结构编码…/);
  assert.match(uiSource, /KnowFlow：剪藏到这里…/);
  assert.match(uiSource, /openFolderEncodingPanel/);
  assert.match(uiSource, /KnowFlow：修改所选内容标签/);
  assert.match(uiSource, /openTagAssignmentPanel/);
  assert.match(uiSource, /tagOverride/);
  assert.match(uiSource, /TagAssignmentModal/);
  assert.match(uiSource, /WeakSet<FeishuSyncPlugin>/);
});

test('tag assignment panel only shows the tag choice and a human-readable path preview', () => {
  const start = uiSource.indexOf('export class TagAssignmentModal');
  const end = uiSource.indexOf('export class CorrectionModal');
  assert.ok(start >= 0 && end > start);
  const panelSource = uiSource.slice(start, end);
  assert.match(panelSource, /修改为标签/);
  assert.match(panelSource, /修改为 \$\{this\.selectedTag\}/);
  assert.match(panelSource, /文件名不变，仅修改标签/);
  assert.doesNotMatch(panelSource, /renderMessages/);
  assert.doesNotMatch(panelSource, /renderCodeDetails/);
  assert.doesNotMatch(panelSource, /完整编码（后端）/);
  assert.doesNotMatch(panelSource, /需要处理|路径冲突|提示/);
});

test('protected roots are hidden and blocked before transaction preview', () => {
  assert.match(uiSource, /PROTECTED_PATH_RE/);
  assert.match(uiSource, /AGENTS/);
  assert.match(uiSource, /🪧导引/);
  assert.match(uiSource, /3️⃣附件文件/);
  assert.match(uiSource, /isProtectedDocumentPath/);
  assert.match(uiSource, /filter\(\(target\) => !isProtectedPath\(target\.path\)\)/);
  assert.match(uiSource, /safePaths\.some\(isProtectedPath\)/);
});

test('all organization actions use the 4.1 preview and commit transaction boundary', () => {
  assert.match(uiSource, /previewTargets\(safePaths, scope\)/);
  assert.match(uiSource, /commitPlan\(this\.plan\.operationId\)/);
  assert.match(uiSource, /depth: OrganizationScope\['depth'\]/);
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
  assert.match(entrySource, /修改当前文档标签并整理…/);
  assert.match(entrySource, /待确认同步任务/);
  assert.match(entrySource, /getPendingKnowledgePlans/);
  assert.match(entrySource, /同步状态与最近记录/);
  assert.match(entrySource, /刷新目录映射/);
  assert.match(entrySource, /重建编码索引/);
  assert.match(entrySource, /导出同步日志/);
  assert.match(entrySource, /自动识别并整理全库文档/);
  assert.doesNotMatch(entrySource, /registerView|setViewState|getRightLeaf/);
  assert.doesNotMatch(mainSource, /addRibbonIcon\(/);
});

test('whole-vault recognition automatically commits safe items and isolates exceptions', () => {
  assert.match(uiSource, /openAutoRecognitionPreview/);
  assert.match(uiSource, /depth: 'recursive'/);
  assert.match(uiSource, /mode: 'auto'/);
  assert.match(uiSource, /自动识别并编码全库 Markdown/);
  assert.match(uiSource, /commitAutomaticKnowledgePlan\(plan\)/);
  assert.match(uiSource, /请右键手动修正/);
  assert.match(entrySource, /自动识别并整理全库文档/);
  assert.match(mainSource, /registerAutomaticRecognition/);
  assert.match(mainSource, /automatic-recognition/);
  assert.match(mainSource, /commitAutomaticKnowledgePlan/);
  assert.match(mainSource, /automaticRecognitionIgnore/);
  assert.doesNotMatch(mainSource, /automatic-recognition-proposal/);
});

test('folder create and rename events use the automatic folder encoding path', () => {
  assert.match(mainSource, /file instanceof TFolder/);
  assert.match(mainSource, /queueAutomaticFolderEncoding/);
  assert.match(mainSource, /folderAutoEncodingWhitelist/);
  assert.match(mainSource, /automatic-folder-encoding/);
  assert.match(mainSource, /文件夹已自动编码/);
});

test('correction UI defaults to short code and keeps full code behind details', () => {
  assert.match(uiSource, /当前短编码/);
  assert.match(uiSource, /修正为短编码/);
  assert.match(uiSource, /查看完整编码/);
  assert.match(uiSource, /完整编码（后端）/);
  assert.match(uiSource, /文件名显示/);
  assert.match(uiSource, /短编码 S01\.a1/);
  assert.match(uiSource, /expand.*完整编码|按文档日期展开为完整编码/);
});

test('mixed selections skip unsupported files and failed registration can retry cleanly', () => {
  assert.match(uiSource, /targets\n\s+\.filter\(isSupportedSelectionTarget\)/);
  assert.match(uiSource, /workspace\.offref\(eventRef\)/);
  assert.match(uiSource, /supportedTargets\.map\(\(target\) => target\.path\)/);
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
