import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import test from 'node:test';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('./') && specifier.endsWith('.js') && context.parentURL?.includes('/src/')) {
      const typescriptUrl = new URL(specifier.replace(/\.js$/, '.ts'), context.parentURL);
      if (existsSync(typescriptUrl)) return nextResolve(typescriptUrl.href, context);
    }
    return nextResolve(specifier, context);
  },
});

const {
  commitKnowledgePlan,
  createKnowledgeWorkflow,
  previewKnowledgeTargets,
} = await import('../src/encodingWorkflow.ts');

class MemoryAdapter {
  directories = new Set();
  files = new Map();
  events;
  failWriteAt = 0;
  writeCount = 0;

  constructor(events) {
    this.events = events;
  }

  async exists(path) {
    return this.directories.has(path) || this.files.has(path);
  }

  async mkdir(path) {
    this.directories.add(path);
  }

  async write(path, content) {
    this.writeCount += 1;
    if (this.failWriteAt === this.writeCount) throw new Error('backup disk full');
    this.events.push({ kind: 'recovery', path, content });
    this.files.set(path, content);
  }

  async list(path) {
    return {
      files: [...this.files.keys()].filter((file) => file.startsWith(`${path}/`)),
      folders: [],
    };
  }

  async remove(path) {
    this.files.delete(path);
  }
}

function note(path, content, parent) {
  const name = path.split('/').pop();
  return {
    path,
    name,
    basename: name.replace(/\.md$/, ''),
    extension: 'md',
    parent,
    content,
  };
}

function validContent(tag = 'S', body = '# 测试\n') {
  return `---\n标签: ${tag}\n日期: 2026-07-26\n状态: 收集\n---\n${body}`;
}

function createApp(contents = [validContent()]) {
  const events = [];
  const behavior = {
    failRenameAt: 0,
    failModifyAt: 0,
    renameCount: 0,
    modifyCount: 0,
    readCount: 0,
    onRead: null,
  };
  const root = { path: '', name: '', children: [] };
  const directory = { path: '0️⃣输入', name: '0️⃣输入', children: [] };
  root.children.push(directory);
  const entries = new Map([[directory.path, directory]]);
  contents.forEach((content, index) => {
    const title = index === 0 ? '测试' : `第${index + 1}篇`;
    const file = note(`0️⃣输入/${title}.md`, content, directory);
    directory.children.push(file);
    entries.set(file.path, file);
  });
  const adapter = new MemoryAdapter(events);
  const vault = {
    adapter,
    getAbstractFileByPath(path) {
      return entries.get(path) ?? null;
    },
    getRoot() {
      return root;
    },
    getMarkdownFiles() {
      return [...entries.values()].filter((entry) => entry.extension === 'md');
    },
    async read(file) {
      behavior.readCount += 1;
      const content = file.content;
      await behavior.onRead?.(file, behavior.readCount);
      return content;
    },
    async rename(file, newPath) {
      behavior.renameCount += 1;
      events.push({ kind: 'rename', from: file.path, to: newPath });
      if (behavior.failRenameAt === behavior.renameCount) {
        behavior.failRenameAt = 0;
        throw new Error('rename denied');
      }
      entries.delete(file.path);
      file.path = newPath;
      file.name = newPath.split('/').pop();
      file.basename = file.name.replace(/\.md$/, '');
      entries.set(newPath, file);
    },
    async modify(file, content) {
      behavior.modifyCount += 1;
      events.push({ kind: 'modify', path: file.path });
      if (behavior.failModifyAt === behavior.modifyCount) {
        behavior.failModifyAt = 0;
        throw new Error('modify denied');
      }
      file.content = content;
    },
  };
  return {
    app: { vault },
    adapter,
    behavior,
    directory,
    root,
    entries,
    events,
    notes: directory.children,
  };
}

const directoryScope = { kind: 'directory', depth: 'direct' };

test('preview is pure and proposes strict encoding, short code, identity and protocol', async () => {
  const fixture = createApp();
  const plan = await previewKnowledgeTargets(fixture.app, [fixture.directory.path], directoryScope);

  assert.equal(plan.items.length, 1);
  assert.match(plan.items[0].code, /^26_0726_S_01_a1$/);
  assert.equal(plan.items[0].shortCode, 'S01.a1');
  assert.match(plan.items[0].documentId, /^[0-9a-f-]{36}$/);
  assert.match(plan.items[0].newContent, /协议版本:\s*1/);
  assert.match(plan.items[0].newContent, /短编码:\s*S01\.a1/);
  assert.deepEqual(fixture.events, []);
});

test('missing label is blocked instead of inferred from directory', async () => {
  const fixture = createApp(['---\n日期: 2026-07-26\n状态: 收集\n---\n正文']);
  const plan = await previewKnowledgeTargets(fixture.app, [fixture.directory.path], directoryScope);

  assert.equal(plan.items.length, 0);
  assert.match(plan.blockedReasons.join('\n'), /不能由目录猜测标签/);
});

test('auto mode recursively recognizes missing labels and allocates one batch plan', async () => {
  const fixture = createApp(['---\n日期: 2026-07-26\n状态: 收集\n---\n项目里程碑与上线需求']);
  const plan = await previewKnowledgeTargets(fixture.app, [''], {
    kind: 'directory',
    depth: 'recursive',
    mode: 'auto',
  });

  assert.equal(plan.blockedReasons.length, 0);
  assert.equal(plan.items.length, 1);
  assert.equal(plan.items[0].recognition.tag, 'X');
  assert.match(plan.items[0].code, /^26_0726_X_01_a1$/);
  assert.match(plan.warnings.join('\n'), /自动识别标签为 X/);
});

test('auto mode uses the safe S fallback and never enters protected roots', async () => {
  const fixture = createApp(['---\n日期: 2026-07-26\n状态: 收集\n---\n没有分类词的记录']);
  const protectedFolder = { path: '🪧导引', name: '🪧导引', children: [] };
  const protectedFile = note(
    '🪧导引/规范.md',
    '---\n日期: 2026-07-26\n状态: 收集\n---\n项目需求',
    protectedFolder,
  );
  protectedFolder.children.push(protectedFile);
  fixture.root.children.push(protectedFolder);
  fixture.entries.set(protectedFolder.path, protectedFolder);
  fixture.entries.set(protectedFile.path, protectedFile);

  const plan = await previewKnowledgeTargets(fixture.app, [''], {
    kind: 'directory',
    depth: 'recursive',
    mode: 'auto',
  });

  assert.equal(plan.items.length, 1);
  assert.equal(plan.items[0].recognition.tag, 'S');
  assert.equal(plan.items[0].recognition.confidence, 'low');
  assert.match(plan.blockedReasons.join('\n'), /🪧导引\/规范\.md/);
});

test('auto mode can commit safe items while leaving blocked items out of the transaction', async () => {
  const fixture = createApp(['---\n日期: 2026-07-26\n状态: 收集\n---\n项目里程碑']);
  const protectedFolder = { path: '🪧导引', name: '🪧导引', children: [] };
  const protectedFile = note(
    '🪧导引/规范.md',
    '---\n日期: 2026-07-26\n状态: 收集\n---\n项目需求',
    protectedFolder,
  );
  protectedFolder.children.push(protectedFile);
  fixture.root.children.push(protectedFolder);
  fixture.entries.set(protectedFolder.path, protectedFolder);
  fixture.entries.set(protectedFile.path, protectedFile);

  const plan = await previewKnowledgeTargets(fixture.app, [''], {
    kind: 'directory',
    depth: 'recursive',
    mode: 'auto',
  });
  const protectedOriginal = protectedFile.content;
  const result = await commitKnowledgePlan(fixture.app, plan);

  assert.equal(result.status, 'committed');
  assert.equal(plan.items.length, 1);
  assert.equal(protectedFile.content, protectedOriginal);
  assert.match(fixture.notes[0].path, /^0️⃣输入\/X01\.a1 /);
});

test('invalid YAML is blocked and never wrapped in a second frontmatter', async () => {
  const original = '---\n标签: [\n---\n正文';
  const fixture = createApp([original]);
  const plan = await previewKnowledgeTargets(fixture.app, [fixture.directory.path], directoryScope);

  assert.equal(plan.items.length, 0);
  assert.match(plan.blockedReasons.join('\n'), /frontmatter 损坏/);
  assert.equal(fixture.notes[0].content, original);
});

test('a human tag change proposes the matching encoding segment and keeps document identity', async () => {
  const content = `---
协议版本: 1
文档ID: 550e8400-e29b-41d4-a716-446655440000
标签: X
编码: 26_0726_S_01_a1
短编码: S01.a1
日期: 2026-07-26
状态: 收集
---
正文`;
  const fixture = createApp([content]);
  const file = fixture.notes[0];
  fixture.entries.delete(file.path);
  file.path = '0️⃣输入/26_0726_S_01_a1 测试.md';
  file.name = '26_0726_S_01_a1 测试.md';
  file.basename = '26_0726_S_01_a1 测试';
  fixture.entries.set(file.path, file);

  const plan = await previewKnowledgeTargets(fixture.app, [fixture.directory.path], directoryScope);

  assert.equal(plan.blockedReasons.length, 0);
  assert.equal(plan.items[0].code, '26_0726_X_01_a1');
  assert.equal(plan.items[0].shortCode, 'X01.a1');
  assert.equal(plan.items[0].documentId, '550e8400-e29b-41d4-a716-446655440000');
  assert.equal(plan.items[0].newPath, '0️⃣输入/X01.a1 测试.md');
  assert.match(plan.warnings.join('\n'), /编码标签段将由 S 更新为 X/);
});

test('short filenames stay human-readable while the protocol keeps full encoding', async () => {
  const content = `---
协议版本: 1
文档ID: 550e8400-e29b-41d4-a716-446655440000
标签: X
编码: 26_0726_S_01_a1
短编码: S01.a1
日期: 2026-07-26
状态: 收集
---
正文`;
  const fixture = createApp([content]);
  const file = fixture.notes[0];
  fixture.entries.delete(file.path);
  file.path = '0️⃣输入/S01.a1 测试.md';
  file.name = 'S01.a1 测试.md';
  file.basename = 'S01.a1 测试';
  fixture.entries.set(file.path, file);

  const plan = await previewKnowledgeTargets(fixture.app, [fixture.directory.path], directoryScope);

  assert.equal(plan.items[0].code, '26_0726_X_01_a1');
  assert.equal(plan.items[0].shortCode, 'X01.a1');
  assert.equal(plan.items[0].newPath, '0️⃣输入/X01.a1 测试.md');
  assert.doesNotMatch(plan.items[0].newPath, /S01\.a1 S01\.a1/);
});

test('manual correction accepts short code and expands it using the document date', async () => {
  const fixture = createApp([validContent()]);
  const plan = await previewKnowledgeTargets(fixture.app, [fixture.notes[0].path], {
    kind: 'file',
    depth: 'direct',
    mode: 'manual',
    manualCode: 'J02.a1',
  });

  assert.equal(plan.items[0].code, '26_0726_J_02_a1');
  assert.equal(plan.items[0].shortCode, 'J02.a1');
  assert.equal(plan.items[0].newPath, '0️⃣输入/J02.a1 测试.md');
});

test('explicit tag override updates the full code short code filename and YAML tag', async () => {
  const content = `---
协议版本: 1
文档ID: 550e8400-e29b-41d4-a716-446655440000
标签: Q
编码: 26_0726_Q_21_a1
短编码: Q21.a1
日期: 2026-07-26
状态: 收集
---
剪藏内容`;
  const fixture = createApp([content]);
  const file = fixture.notes[0];
  fixture.entries.delete(file.path);
  file.path = '0️⃣输入/Q21.a1 剪藏内容.md';
  file.name = 'Q21.a1 剪藏内容.md';
  file.basename = 'Q21.a1 剪藏内容';
  fixture.entries.set(file.path, file);

  const plan = await previewKnowledgeTargets(fixture.app, [file.path], {
    kind: 'file',
    depth: 'direct',
    mode: 'auto',
    tagOverride: 'Z',
  });

  assert.equal(plan.blockedReasons.length, 0);
  assert.equal(plan.items[0].code, '26_0726_Z_21_a1');
  assert.equal(plan.items[0].shortCode, 'Z21.a1');
  assert.equal(plan.items[0].newPath, '0️⃣输入/Z21.a1 剪藏内容.md');
  assert.match(plan.items[0].newContent, /标签: Z/);

  const result = await commitKnowledgePlan(fixture.app, plan);
  assert.equal(result.status, 'committed');
  assert.equal(file.path, '0️⃣输入/Z21.a1 剪藏内容.md');
  assert.match(file.content, /编码: 26_0726_Z_21_a1/);
});

test('tag override reallocates a free sequence when the target tag code is occupied', async () => {
  const sourceContent = `---
协议版本: 1
文档ID: 550e8400-e29b-41d4-a716-446655440000
标签: Q
编码: 26_0726_Q_01_a1
短编码: Q01.a1
日期: 2026-07-26
状态: 收集
---
待归类内容`;
  const occupantContent = `---
协议版本: 1
文档ID: 650e8400-e29b-41d4-a716-446655440000
标签: Z
编码: 26_0726_Z_01_a1
短编码: Z01.a1
日期: 2026-07-26
状态: 收集
---
已有 Z 内容`;
  const fixture = createApp([sourceContent, occupantContent]);
  const source = fixture.notes[0];
  const occupant = fixture.notes[1];
  fixture.entries.delete(source.path);
  source.path = '0️⃣输入/Q01.a1 待归类内容.md';
  source.name = 'Q01.a1 待归类内容.md';
  source.basename = 'Q01.a1 待归类内容';
  fixture.entries.set(source.path, source);
  fixture.entries.delete(occupant.path);
  occupant.path = '0️⃣输入/Z01.a1 已有 Z 内容.md';
  occupant.name = 'Z01.a1 已有 Z 内容.md';
  occupant.basename = 'Z01.a1 已有 Z 内容';
  fixture.entries.set(occupant.path, occupant);

  const plan = await previewKnowledgeTargets(fixture.app, [source.path], {
    kind: 'file',
    depth: 'direct',
    mode: 'auto',
    tagOverride: 'Z',
  });

  assert.equal(plan.blockedReasons.length, 0);
  assert.equal(plan.items.length, 1);
  assert.equal(plan.items[0].code, '26_0726_Z_02_a1');
  assert.equal(plan.items[0].shortCode, 'Z02.a1');
  assert.equal(plan.items[0].newPath, '0️⃣输入/Z02.a1 待归类内容.md');
  assert.match(plan.warnings.join('\n'), /原序号已占用，已自动分配新序号/);
});

test('directory tag override applies recursively to child directories', async () => {
  const fixture = createApp([validContent('Q')]);
  const childDirectory = {
    path: '0️⃣输入/S02 · 剪藏',
    name: 'S02 · 剪藏',
    children: [],
  };
  const child = note(
    '0️⃣输入/S02 · 剪藏/Q02.a1 剪藏记录.md',
    validContent('Q', '# 子目录剪藏\n'),
    childDirectory,
  );
  childDirectory.children.push(child);
  fixture.directory.children.push(childDirectory);
  fixture.entries.set(childDirectory.path, childDirectory);
  fixture.entries.set(child.path, child);

  const plan = await previewKnowledgeTargets(fixture.app, [fixture.directory.path], {
    kind: 'directory',
    depth: 'recursive',
    mode: 'auto',
    tagOverride: 'Z',
  });

  assert.equal(plan.blockedReasons.length, 0);
  assert.equal(plan.scannedCount, 2);
  assert.equal(plan.items.length, 2);
  assert.deepEqual(
    plan.items.map((item) => item.code).sort(),
    ['26_0726_Z_01_a1', '26_0726_Z_02_a1'],
  );
  assert.ok(plan.items.some((item) => item.originalPath.includes('S02 · 剪藏')));
  assert.ok(plan.items.every((item) => item.newContent.includes('标签: Z')));
});

test('tag override rejects labels outside the contract enum', async () => {
  const fixture = createApp([validContent('Q')]);
  const plan = await previewKnowledgeTargets(fixture.app, [fixture.directory.path], {
    kind: 'directory',
    depth: 'recursive',
    mode: 'auto',
    tagOverride: 'P',
  });

  assert.equal(plan.items.length, 0);
  assert.match(plan.blockedReasons.join('\n'), /目标标签不在协议枚举中/);
});

test('short rename does not duplicate a short code already present in the title', async () => {
  const content = `---
协议版本: 1
文档ID: 550e8400-e29b-41d4-a716-446655440000
标签: Q
编码: 26_0727_Q_21_a1
短编码: Q21.a1
日期: 2026-07-27
状态: 收集
---
正文`;
  const fixture = createApp([content]);
  const file = fixture.notes[0];
  fixture.entries.delete(file.path);
  file.path = '0️⃣输入/26_0727_Q_21_a1 Q21.a1 · 1.视频制作流程.md';
  file.name = '26_0727_Q_21_a1 Q21.a1 · 1.视频制作流程.md';
  file.basename = '26_0727_Q_21_a1 Q21.a1 · 1.视频制作流程';
  fixture.entries.set(file.path, file);

  const plan = await previewKnowledgeTargets(fixture.app, [fixture.directory.path], directoryScope);

  assert.equal(plan.items[0].newPath, '0️⃣输入/Q21.a1 · 1.视频制作流程.md');
});

test('root directory scope is direct-only and selection skips unsupported files', async () => {
  const fixture = createApp();
  const rootNote = note('根文档.md', validContent('X'), fixture.root);
  fixture.root.children.push(rootNote);
  fixture.entries.set(rootNote.path, rootNote);
  const image = {
    path: '0️⃣输入/图片.png',
    name: '图片.png',
    basename: '图片',
    extension: 'png',
    parent: fixture.directory,
  };
  fixture.entries.set(image.path, image);

  const rootPlan = await previewKnowledgeTargets(fixture.app, [''], directoryScope);
  assert.deepEqual(rootPlan.items.map((item) => item.originalPath), ['根文档.md']);

  const selectionPlan = await previewKnowledgeTargets(
    fixture.app,
    [fixture.notes[0].path, image.path],
    { kind: 'selection', depth: 'direct' },
  );
  assert.equal(selectionPlan.items.length, 1);
  assert.equal(selectionPlan.skipped, 1);
  assert.equal(selectionPlan.blockedReasons.length, 0);
});

test('commit rejects stale preview before recovery or mutation', async () => {
  const fixture = createApp();
  const plan = await previewKnowledgeTargets(fixture.app, [fixture.directory.path], directoryScope);
  fixture.notes[0].content += '\n用户刚刚修改';

  await assert.rejects(commitKnowledgePlan(fixture.app, plan), /预览已过期.*内容已变化/);
  assert.deepEqual(fixture.events, []);
});

test('commit rechecks global encoding uniqueness after preview', async () => {
  const fixture = createApp();
  const plan = await previewKnowledgeTargets(fixture.app, [fixture.directory.path], directoryScope);
  const code = plan.items[0].code;
  const external = note(
    `外部/${code} 抢占.md`,
    `---
协议版本: 1
文档ID: 650e8400-e29b-41d4-a716-446655440000
标签: S
编码: ${code}
短编码: S01.a1
日期: 2026-07-26
状态: 收集
---
外部写入`,
    { path: '外部' },
  );
  fixture.entries.set(external.path, external);

  await assert.rejects(
    commitKnowledgePlan(fixture.app, plan),
    /预览已过期.*编码已被占用/,
  );
  assert.equal(fixture.events.some((event) => event.kind === 'recovery'), false);
});

test('two-path encoding swap commits and explicitly rolls back through temporary paths', async () => {
  const first = `---
协议版本: 1
文档ID: 550e8400-e29b-41d4-a716-446655440000
标签: X
编码: 26_0726_S_01_a1
短编码: S01.a1
日期: 2026-07-26
状态: 收集
---
第一篇`;
  const second = `---
协议版本: 1
文档ID: 650e8400-e29b-41d4-a716-446655440000
标签: S
编码: 26_0726_X_01_a1
短编码: X01.a1
日期: 2026-07-26
状态: 收集
---
第二篇`;
  const fixture = createApp([first, second]);
  const originalPaths = [
    '0️⃣输入/26_0726_S_01_a1 同名.md',
    '0️⃣输入/26_0726_X_01_a1 同名.md',
  ];
  fixture.notes.forEach((file, index) => {
    fixture.entries.delete(file.path);
    file.path = originalPaths[index];
    file.name = originalPaths[index].split('/').pop();
    file.basename = file.name.replace(/\.md$/, '');
    fixture.entries.set(originalPaths[index], file);
  });
  const coordinator = { run: async (_key, _requestId, task) => task() };
  const workflow = createKnowledgeWorkflow(fixture.app, coordinator);
  const plan = await workflow.previewTargets([fixture.directory.path], directoryScope);

  assert.equal(plan.conflicts.length, 0);
  const result = await workflow.commitPlan(plan.operationId);
  assert.equal(result.status, 'committed');
  const targetPaths = [
    '0️⃣输入/X01.a1 同名.md',
    '0️⃣输入/S01.a1 同名.md',
  ];
  assert.deepEqual(
    new Set(fixture.notes.map((file) => file.path)),
    new Set(targetPaths),
  );
  assert.equal(
    fixture.events.filter((event) => event.kind === 'rename')
      .some((event) => event.to.includes('.knowflow-tmp.md')),
    true,
  );
  const rolledBack = await workflow.rollbackOperation(plan.operationId);
  assert.equal(rolledBack.status, 'rolled_back');
  assert.deepEqual(
    fixture.notes.map((file) => file.path),
    originalPaths,
  );
  assert.equal(fixture.notes[0].content, first);
  assert.equal(fixture.notes[1].content, second);
  assert.equal(
    fixture.events.filter((event) => event.kind === 'rename')
      .some((event) => event.to.includes('.knowflow-rollback.md')),
    true,
  );
});

test('commit creates all recoveries, writes content, renames, rebuilds and then emits events', async () => {
  const fixture = createApp([validContent(), validContent()]);
  const hookEvents = [];
  const plan = await previewKnowledgeTargets(fixture.app, [fixture.directory.path], directoryScope);
  const result = await commitKnowledgePlan(fixture.app, plan, {
    rebuildIndex: async () => hookEvents.push('index'),
    emitSyncEvents: async (events) => hookEvents.push(['sync', events]),
  });

  assert.equal(result.status, 'committed');
  assert.deepEqual(
    fixture.events.map((event) => event.kind),
    ['recovery', 'recovery', 'modify', 'modify', 'rename', 'rename', 'rename', 'rename'],
  );
  assert.equal(hookEvents[0], 'index');
  assert.equal(hookEvents[1][0], 'sync');
  assert.equal(hookEvents[1][1].length, 2);
  assert.equal(hookEvents[1][1][0].documentId.length, 36);
});

test('backup failure identifies the object and starts no mutation or success event', async () => {
  const fixture = createApp([validContent(), validContent()]);
  const emitted = [];
  fixture.adapter.failWriteAt = 2;
  const plan = await previewKnowledgeTargets(fixture.app, [fixture.directory.path], directoryScope);

  await assert.rejects(
    commitKnowledgePlan(fixture.app, plan, { emitSyncEvents: async (events) => emitted.push(events) }),
    /第2篇\.md 备份失败.*backup disk full/,
  );
  assert.equal(fixture.events.some((event) => event.kind === 'modify' || event.kind === 'rename'), false);
  assert.deepEqual(emitted, []);
});

test('repeated partial backup failures still keep the recovery directory bounded', async () => {
  const fixture = createApp([validContent(), validContent()]);
  for (let index = 0; index < 205; index += 1) {
    fixture.adapter.failWriteAt = fixture.adapter.writeCount + 2;
    const plan = await previewKnowledgeTargets(fixture.app, [fixture.directory.path], directoryScope);
    await assert.rejects(commitKnowledgePlan(fixture.app, plan), /备份失败/);
  }
  assert.equal(fixture.adapter.files.size <= 200, true);
});

for (const failurePosition of [1, 2, 3]) {
  test(`modify failure at batch position ${failurePosition} restores every document`, async () => {
    const fixture = createApp([validContent(), validContent(), validContent()]);
    const originals = fixture.notes.map((item) => ({ path: item.path, content: item.content }));
    fixture.behavior.failModifyAt = failurePosition;
    const emitted = [];
    const plan = await previewKnowledgeTargets(fixture.app, [fixture.directory.path], directoryScope);

    await assert.rejects(
      commitKnowledgePlan(fixture.app, plan, { emitSyncEvents: async (events) => emitted.push(events) }),
      (error) => {
        assert.match(error.message, /失败并已回滚.*写入失败.*modify denied/);
        assert.match(error.message, /恢复点：\.feishu-sync\/recovery\//);
        return true;
      },
    );
    assert.deepEqual(
      fixture.notes.map((item) => ({ path: item.path, content: item.content })),
      originals,
    );
    assert.deepEqual(emitted, []);
  });
}

test('rename failure restores YAML and original path', async () => {
  const fixture = createApp();
  const original = { path: fixture.notes[0].path, content: fixture.notes[0].content };
  fixture.behavior.failRenameAt = 1;
  const plan = await previewKnowledgeTargets(fixture.app, [fixture.directory.path], directoryScope);

  await assert.rejects(commitKnowledgePlan(fixture.app, plan), /失败并已回滚.*临时换序失败.*rename denied/);
  assert.equal(fixture.notes[0].path, original.path);
  assert.equal(fixture.notes[0].content, original.content);
});

test('index failure after all file changes restores names and YAML without an event', async () => {
  const fixture = createApp([validContent(), validContent()]);
  const originals = fixture.notes.map((item) => ({ path: item.path, content: item.content }));
  const emitted = [];
  const plan = await previewKnowledgeTargets(fixture.app, [fixture.directory.path], directoryScope);

  await assert.rejects(
    commitKnowledgePlan(fixture.app, plan, {
      rebuildIndex: async () => {
        throw new Error('index read-only');
      },
      emitSyncEvents: async (events) => emitted.push(events),
    }),
    /失败并已回滚.*重建索引失败.*index read-only/,
  );
  assert.deepEqual(
    fixture.notes.map((item) => ({ path: item.path, content: item.content })),
    originals,
  );
  assert.deepEqual(emitted, []);
});

test('duplicate YAML encoding is a blocking conflict', async () => {
  const duplicate = `---\n协议版本: 1\n文档ID: 550e8400-e29b-41d4-a716-446655440000\n标签: S\n编码: 26_0726_S_01_a1\n短编码: S01.a1\n日期: 2026-07-26\n状态: 收集\n---\n正文`;
  const fixture = createApp([duplicate, duplicate.replace('550e8400', '650e8400')]);
  fixture.notes.forEach((item, index) => {
    const next = `0️⃣输入/26_0726_S_01_a1 文档${index + 1}.md`;
    fixture.entries.delete(item.path);
    item.path = next;
    item.name = next.split('/').pop();
    item.basename = item.name.replace(/\.md$/, '');
    fixture.entries.set(next, item);
  });
  const plan = await previewKnowledgeTargets(fixture.app, [fixture.directory.path], directoryScope);

  assert.match(plan.blockedReasons.join('\n'), /编码重复/);
});

test('auto mode commits safe documents while isolating a conflicting target path', async () => {
  const changedTag = '---\n协议版本: 1\n文档ID: 550e8400-e29b-41d4-a716-446655440000\n标签: X\n编码: 26_0726_S_01_a1\n短编码: S01.a1\n日期: 2026-07-26\n状态: 收集\n---\n项目需求';
  const fixture = createApp([changedTag, '---\n日期: 2026-07-26\n状态: 收集\n---\n没有分类词的记录']);
  const changed = fixture.notes[0];
  fixture.entries.delete(changed.path);
  changed.path = '0️⃣输入/26_0726_S_01_a1 变更标签.md';
  changed.name = changed.path.split('/').pop();
  changed.basename = changed.name.replace(/\.md$/, '');
  fixture.entries.set(changed.path, changed);

  const occupant = {
    path: '0️⃣输入/X01.a1 变更标签.md',
    name: 'X01.a1 变更标签.md',
    basename: 'X01.a1 变更标签',
    extension: 'png',
    parent: fixture.directory,
  };
  fixture.entries.set(occupant.path, occupant);

  const plan = await previewKnowledgeTargets(fixture.app, [''], {
    kind: 'directory',
    depth: 'recursive',
    mode: 'auto',
  });

  assert.equal(plan.items.length, 1);
  assert.equal(plan.items[0].originalPath, fixture.notes[1].path);
  assert.equal(plan.conflicts.length, 1);
  assert.match(plan.blockedReasons.join('\n'), /目标路径已被占用/);

  const result = await commitKnowledgePlan(fixture.app, plan);
  assert.equal(result.status, 'committed');
  assert.equal(changed.path, '0️⃣输入/26_0726_S_01_a1 变更标签.md');
  assert.equal(occupant.path, '0️⃣输入/X01.a1 变更标签.md');
  assert.match(fixture.notes[1].path, /^0️⃣输入\/S02\.a1 /);
});

test('stateful workflow exposes only preview, commit and rollback paths', async () => {
  const fixture = createApp();
  const keys = [];
  const coordinator = {
    async run(key, requestId, task) {
      keys.push([key, requestId]);
      return task();
    },
  };
  const workflow = createKnowledgeWorkflow(fixture.app, coordinator);
  const plan = await workflow.previewTargets([fixture.directory.path], directoryScope);
  const committed = await workflow.commitPlan(plan.operationId);
  const rolledBack = await workflow.rollbackOperation(plan.operationId);

  assert.equal(committed.status, 'committed');
  assert.equal(rolledBack.status, 'rolled_back');
  assert.equal(fixture.notes[0].path, '0️⃣输入/测试.md');
  assert.deepEqual(keys.map(([key]) => key), [
    'knowledge:vault',
    'knowledge:vault',
  ]);
  assert.deepEqual(Object.keys(workflow).sort(), [
    'commitPlan',
    'previewTargets',
    'rollbackOperation',
  ]);
});

test('explicit rollback refuses to overwrite post-commit edits and preserves a new recovery point', async () => {
  const fixture = createApp();
  const coordinator = { run: async (_key, _requestId, task) => task() };
  const workflow = createKnowledgeWorkflow(fixture.app, coordinator);
  const plan = await workflow.previewTargets([fixture.directory.path], directoryScope);
  await workflow.commitPlan(plan.operationId);
  fixture.notes[0].content += '\n提交后用户编辑';

  await assert.rejects(
    workflow.rollbackOperation(plan.operationId),
    /拒绝覆盖式回滚.*当前内容恢复点/,
  );
  assert.match(fixture.notes[0].content, /提交后用户编辑/);
});

test('multi-file rollback rechecks content immediately before every destructive step', async () => {
  const fixture = createApp([validContent(), validContent()]);
  const coordinator = { run: async (_key, _requestId, task) => task() };
  const workflow = createKnowledgeWorkflow(fixture.app, coordinator);
  const plan = await workflow.previewTargets([fixture.directory.path], directoryScope);
  await workflow.commitPlan(plan.operationId);
  fixture.behavior.readCount = 0;
  fixture.behavior.onRead = (file, count) => {
    if (count === 5) file.content += '\n并发编辑';
  };

  const result = await workflow.rollbackOperation(plan.operationId);

  assert.equal(result.status, 'rollback_failed');
  assert.match(result.rollbackErrors.join('\n'), /拒绝覆盖式回滚/);
  assert.equal(fixture.notes.some((file) => file.content.includes('并发编辑')), true);
  assert.equal(
    fixture.events.some((event) => event.kind === 'recovery' && event.content.includes('并发编辑')),
    true,
  );
});

test('failed rollback keeps its journal and succeeds after the path conflict is removed', async () => {
  const fixture = createApp();
  const coordinator = { run: async (_key, _requestId, task) => task() };
  const workflow = createKnowledgeWorkflow(fixture.app, coordinator);
  const plan = await workflow.previewTargets([fixture.directory.path], directoryScope);
  await workflow.commitPlan(plan.operationId);
  const occupant = note(plan.items[0].originalPath, validContent('X'), fixture.directory);
  fixture.entries.set(occupant.path, occupant);

  const first = await workflow.rollbackOperation(plan.operationId);
  assert.equal(first.status, 'rollback_failed');
  fixture.entries.delete(occupant.path);
  const second = await workflow.rollbackOperation(plan.operationId);
  assert.equal(second.status, 'rolled_back');
});

test('successful rollback emits a compensating sync event', async () => {
  const fixture = createApp();
  const coordinator = { run: async (_key, _requestId, task) => task() };
  const deliveries = [];
  const workflow = createKnowledgeWorkflow(fixture.app, coordinator, {
    emitSyncEvents: async (events) => deliveries.push(events),
  });
  const plan = await workflow.previewTargets([fixture.directory.path], directoryScope);
  await workflow.commitPlan(plan.operationId);
  const rolledBack = await workflow.rollbackOperation(plan.operationId);

  assert.equal(rolledBack.status, 'rolled_back');
  assert.equal(deliveries.length, 2);
  assert.match(deliveries[1][0].operationId, /^rollback:/);
  assert.equal(deliveries[1][0].path, plan.items[0].originalPath);
});
