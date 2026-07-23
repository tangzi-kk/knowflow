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
  applyEncodingPlan,
  createEncodingWorkflow,
  previewEncodingDirectory,
} = await import('../src/encodingWorkflow.ts');

class MemoryAdapter {
  directories = new Set();
  files = new Map();
  events;

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

function createApp() {
  const events = [];
  const behavior = { failRename: false };
  const directory = { path: '0️⃣输入', children: [] };
  const note = {
    path: '0️⃣输入/测试.md',
    name: '测试.md',
    basename: '测试',
    extension: 'md',
    parent: directory,
    content: '---\n标签: S\n---\n# 测试\n',
  };
  directory.children.push(note);
  const entries = new Map([
    [directory.path, directory],
    [note.path, note],
  ]);
  const adapter = new MemoryAdapter(events);
  const vault = {
    adapter,
    getAbstractFileByPath(path) {
      return entries.get(path) ?? null;
    },
    async read(file) {
      return file.content;
    },
    async rename(file, newPath) {
      events.push({ kind: 'rename', from: file.path, to: newPath });
      if (behavior.failRename) throw new Error('rename denied');
      entries.delete(file.path);
      file.path = newPath;
      file.name = newPath.split('/').pop();
      file.basename = file.name.replace(/\.md$/, '');
      entries.set(newPath, file);
    },
    async modify(file, content) {
      events.push({ kind: 'modify', path: file.path });
      file.content = content;
    },
  };
  return { app: { vault }, behavior, directory, entries, events, note };
}

test('preview is pure and produces no recovery, rename, or content write', async () => {
  const fixture = createApp();
  const plan = await previewEncodingDirectory(fixture.app, fixture.directory.path);

  assert.equal(plan.items.length, 1);
  assert.equal(plan.items[0].originalPath, '0️⃣输入/测试.md');
  assert.match(plan.items[0].newPath, /^0️⃣输入\/\d{2}_\d{4}_S_01 测试\.md$/);
  assert.deepEqual(fixture.events, []);
  assert.equal(fixture.note.content, '---\n标签: S\n---\n# 测试\n');
});

test('apply rejects a stale preview before any recovery or mutation', async () => {
  const fixture = createApp();
  const plan = await previewEncodingDirectory(fixture.app, fixture.directory.path);
  fixture.note.content += '\n用户刚刚修改';

  await assert.rejects(
    applyEncodingPlan(fixture.app, plan),
    /编码预览已过期.*内容已变化/,
  );
  assert.deepEqual(fixture.events, []);
});

test('recovery snapshot completes before rename and content write', async () => {
  const fixture = createApp();
  const plan = await previewEncodingDirectory(fixture.app, fixture.directory.path);
  const result = await applyEncodingPlan(fixture.app, plan);

  assert.equal(result.assigned, 1);
  assert.deepEqual(
    fixture.events.map((event) => event.kind),
    ['recovery', 'rename', 'modify'],
  );
  assert.match(fixture.note.content, /编码:\s*["']?\d{2}_\d{4}_S_01/);
});

test('batch writes every recovery snapshot before the first mutation', async () => {
  const fixture = createApp();
  const second = {
    path: '0️⃣输入/第二篇.md',
    name: '第二篇.md',
    basename: '第二篇',
    extension: 'md',
    parent: fixture.directory,
    content: '---\n标签: S\n---\n# 第二篇\n',
  };
  fixture.directory.children.push(second);
  fixture.entries.set(second.path, second);

  const plan = await previewEncodingDirectory(fixture.app, fixture.directory.path);
  await applyEncodingPlan(fixture.app, plan);

  assert.deepEqual(
    fixture.events.map((event) => event.kind),
    ['recovery', 'recovery', 'rename', 'modify', 'rename', 'modify'],
  );
});

test('rename failure rejects and is never reported as a successful write', async () => {
  const fixture = createApp();
  const plan = await previewEncodingDirectory(fixture.app, fixture.directory.path);
  fixture.behavior.failRename = true;

  await assert.rejects(applyEncodingPlan(fixture.app, plan), /rename denied/);
  assert.deepEqual(
    fixture.events.map((event) => event.kind),
    ['recovery', 'rename'],
  );
  assert.equal(fixture.note.path, '0️⃣输入/测试.md');
  assert.equal(fixture.events.some((event) => event.kind === 'modify'), false);
});

test('workflow applies through the directory coordination key', async () => {
  const fixture = createApp();
  const keys = [];
  const coordinator = {
    async run(key, requestId, task) {
      keys.push([key, requestId]);
      return task();
    },
  };
  const workflow = createEncodingWorkflow(fixture.app, coordinator);
  const plan = await workflow.previewDirectory(fixture.directory.path);
  await workflow.apply(plan, 'encoding-test');

  assert.deepEqual(keys, [['directory:0️⃣输入', 'encoding-test']]);
});
