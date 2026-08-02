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
  commitFolderEncoding,
  ensureFolderEncoding,
  isFolderEncodingExcluded,
  previewFolderEncoding,
} = await import('../src/folderEncoding.ts');

class MemoryAdapter {
  directories = new Set(['.feishu-sync']);
  files = new Map();

  async exists(path) {
    return this.directories.has(path) || this.files.has(path);
  }

  async mkdir(path) {
    this.directories.add(path);
  }

  async read(path) {
    return this.files.get(path) ?? '';
  }

  async write(path, content) {
    this.files.set(path, content);
  }
}

class RefusingRenameAdapter extends MemoryAdapter {
  async rename(from, to) {
    if (this.files.has(to)) throw new Error('Destination file already exists!');
    const content = this.files.get(from);
    this.files.delete(from);
    this.files.set(to, content);
  }

  async remove(path) {
    this.files.delete(path);
    this.directories.delete(path);
  }
}

class MemoryFolder {
  constructor(path, name) {
    this.path = path;
    this.name = name;
    this.children = [];
  }
}

class MemoryVault {
  constructor(paths = [], adapter = new MemoryAdapter()) {
    this.adapter = adapter;
    this.root = new MemoryFolder('', '');
    this.folders = new Map([['', this.root]]);
    for (const path of paths) this.ensureFolder(path);
  }

  getRoot() {
    return this.root;
  }

  getAbstractFileByPath(path) {
    return this.folders.get(path);
  }

  ensureFolder(path) {
    const parts = path.split('/').filter(Boolean);
    let currentPath = '';
    let parent = this.root;
    for (const name of parts) {
      currentPath = currentPath ? `${currentPath}/${name}` : name;
      let folder = this.folders.get(currentPath);
      if (!folder) {
        folder = new MemoryFolder(currentPath, name);
        this.folders.set(currentPath, folder);
        parent.children.push(folder);
      }
      parent = folder;
    }
    return parent;
  }

  async rename(folder, newPath) {
    const oldPath = folder.path;
    const updates = [...this.folders.entries()]
      .filter(([path]) => path === oldPath || path.startsWith(`${oldPath}/`))
      .map(([path, value]) => [path, value]);
    for (const [path] of updates) this.folders.delete(path);
    for (const [path, value] of updates) {
      const suffix = path === oldPath ? '' : path.slice(oldPath.length);
      const nextPath = `${newPath}${suffix}`;
      value.path = nextPath;
      value.name = nextPath.split('/').pop() ?? value.name;
      this.folders.set(nextPath, value);
    }
  }
}

function appWithFolders(paths, adapter) {
  return { vault: new MemoryVault(paths, adapter) };
}

function indexOf(app) {
  return JSON.parse(app.vault.adapter.files.get('.feishu-sync/目录编码索引.json') ?? '[]');
}

test('new folders infer a tag, show a short name and persist a full structural code', async () => {
  const app = appWithFolders(['0️⃣输入/💡碎片输入_闪念/剪藏']);
  const result = await ensureFolderEncoding(app, '0️⃣输入/💡碎片输入_闪念/剪藏');

  assert.equal(result.preview.tag, 'Z');
  assert.equal(result.preview.shortCode, 'Z01');
  assert.equal(result.preview.newName, 'Z01 · 剪藏');
  assert.match(result.preview.encoding, /^\d{2}_\d{4}_Z_01$/);
  assert.ok(app.vault.getAbstractFileByPath('0️⃣输入/💡碎片输入_闪念/Z01 · 剪藏'));
  assert.deepEqual(indexOf(app)[0], {
    path: '0️⃣输入/💡碎片输入_闪念/Z01 · 剪藏',
    name: 'Z01 · 剪藏',
    tag: 'Z',
    shortCode: 'Z01',
    encoding: result.preview.encoding,
    updatedAt: indexOf(app)[0].updatedAt,
  });
});

test('built-in and user whitelist paths are blocked, including descendants', async () => {
  assert.equal(isFolderEncodingExcluded('🪧导引/规范'), true);
  assert.equal(isFolderEncodingExcluded('3️⃣附件文件/Lark/图片'), true);
  assert.equal(isFolderEncodingExcluded('0️⃣输入/💡碎片输入_闪念'), true);
  assert.equal(isFolderEncodingExcluded('1️⃣🗃知识池/🔵工作_正财'), true);
  assert.equal(isFolderEncodingExcluded('2️⃣输出/S01 · 观点'), false);
  assert.equal(isFolderEncodingExcluded('项目/.草稿'), true);
  assert.equal(isFolderEncodingExcluded('归档/原始资料/2024', ['归档/原始资料']), true);
  assert.equal(isFolderEncodingExcluded('a/../b'), true);

  const app = appWithFolders(['归档/原始资料']);
  const result = await previewFolderEncoding(app, '归档/原始资料', {
    whitelist: ['归档/原始资料'],
  });
  assert.match(result.blockedReason, /白名单/);
  assert.equal(app.vault.getAbstractFileByPath('归档/原始资料').name, '原始资料');
});

test('manual tag change keeps the short sequence and changes only the structural tag', async () => {
  const app = appWithFolders(['1️⃣🗃知识池/🔵工作_正财/灵感']);
  const first = await ensureFolderEncoding(app, '1️⃣🗃知识池/🔵工作_正财/灵感');
  const preview = await previewFolderEncoding(app, first.preview.newPath, { tagOverride: 'Z' });

  assert.equal(preview.shortCode, 'Z01');
  assert.match(preview.encoding, /^\d{2}_\d{4}_Z_01$/);
  const result = await commitFolderEncoding(app, preview);
  assert.equal(result.preview.newName, 'Z01 · 灵感');
  assert.equal(app.vault.getAbstractFileByPath('1️⃣🗃知识池/🔵工作_正财/Z01 · 灵感').name, 'Z01 · 灵感');
  assert.equal(indexOf(app)[0].tag, 'Z');
});

test('manual tag change blocks when the target tag and sequence are already occupied', async () => {
  const app = appWithFolders([
    '1️⃣🗃知识池/🔵工作_正财/灵感',
    '1️⃣🗃知识池/🔵工作_正财/Z01 · 已占用',
  ]);
  const first = await ensureFolderEncoding(app, '1️⃣🗃知识池/🔵工作_正财/灵感');
  const preview = await previewFolderEncoding(app, first.preview.newPath, { tagOverride: 'Z' });

  assert.match(preview.blockedReason, /目录序号 Z01 已被占用/);
  assert.equal(preview.changed, false);
});

test('commit rechecks a target folder occupied after preview', async () => {
  const app = appWithFolders(['2️⃣输出/观点']);
  const preview = await previewFolderEncoding(app, '2️⃣输出/观点');
  app.vault.ensureFolder(preview.newPath);

  await assert.rejects(
    commitFolderEncoding(app, preview),
    /目标文件夹已存在/,
  );
  assert.ok(app.vault.getAbstractFileByPath('2️⃣输出/观点'));
  assert.equal(app.vault.getAbstractFileByPath(preview.newPath).name, preview.newName);
});

test('renaming a parent re-bases child index paths', async () => {
  const app = appWithFolders(['0️⃣输入/📦项目note_技能/项目', '0️⃣输入/📦项目note_技能/项目/子目录']);
  const parent = await ensureFolderEncoding(app, '0️⃣输入/📦项目note_技能/项目');
  const child = await ensureFolderEncoding(app, `${parent.preview.newPath}/子目录`);
  const changed = await previewFolderEncoding(app, parent.preview.newPath, { tagOverride: 'L' });
  await commitFolderEncoding(app, changed);

  assert.ok(indexOf(app).some((record) => record.path === '0️⃣输入/📦项目note_技能/L01 · 项目/S01 · 子目录'));
  assert.equal(child.preview.tag, 'S');
});

test('fixed root folders and input/knowledge level-two folders are blocked', async () => {
  const app = appWithFolders([
    '0️⃣输入',
    '0️⃣输入/📦项目note_技能',
    '0️⃣输入/📦项目note_技能/项目文档',
    '1️⃣🗃知识池',
    '1️⃣🗃知识池/🔵工作_正财',
    '2️⃣输出',
    '2️⃣输出/观点',
    '3️⃣附件文件',
    '3️⃣附件文件/图片',
  ]);

  for (const path of [
    '0️⃣输入',
    '0️⃣输入/📦项目note_技能',
    '1️⃣🗃知识池',
    '1️⃣🗃知识池/🔵工作_正财',
    '3️⃣附件文件',
    '3️⃣附件文件/图片',
  ]) {
    const preview = await previewFolderEncoding(app, path);
    assert.equal(preview.changed, false, path);
    assert.ok(preview.blockedReason, path);
  }

  const outputPreview = await previewFolderEncoding(app, '2️⃣输出/观点');
  assert.equal(outputPreview.blockedReason, undefined);
  assert.equal(outputPreview.shortCode, 'S01');

  const thirdLevelPreview = await previewFolderEncoding(app, '0️⃣输入/📦项目note_技能/项目文档');
  assert.equal(thirdLevelPreview.blockedReason, undefined);
});

test('replaces an existing index when the adapter refuses rename-overwrite', async () => {
  const adapter = new RefusingRenameAdapter();
  const app = appWithFolders(['2️⃣输出/第一个目录', '2️⃣输出/第二个目录'], adapter);
  await ensureFolderEncoding(app, '2️⃣输出/第一个目录');
  const firstIndex = indexOf(app);
  assert.equal(firstIndex.length, 1);

  const second = await ensureFolderEncoding(app, '2️⃣输出/第二个目录');
  assert.equal(second.changed, true);
  assert.equal(indexOf(app).length, 2);
  assert.equal(app.vault.adapter.files.has('.feishu-sync/目录编码索引.json'), true);
});
