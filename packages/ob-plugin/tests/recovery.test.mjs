import assert from 'node:assert/strict';
import test from 'node:test';

import { createRecoverySnapshot } from '../src/recovery.ts';

class MemoryAdapter {
  directories = new Set();
  files = new Map();
  failWrite = false;

  async exists(path) {
    return this.directories.has(path) || this.files.has(path);
  }

  async mkdir(path) {
    this.directories.add(path);
  }

  async write(path, content) {
    if (this.failWrite) throw new Error('disk full');
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

test('snapshot records exact content and recovery metadata before overwrite', async () => {
  const adapter = new MemoryAdapter();
  const snapshotPath = await createRecoverySnapshot(adapter, {
    originalPath: '0️⃣输入/note.md',
    content: '---\ntitle: x\n---\nbody',
    source: 'local',
    now: new Date('2026-07-19T00:00:00.000Z'),
    nonce: 'fixed',
  });
  const snapshot = JSON.parse(adapter.files.get(snapshotPath));

  assert.equal(snapshot.originalPath, '0️⃣输入/note.md');
  assert.equal(snapshot.content, '---\ntitle: x\n---\nbody');
  assert.equal(snapshot.source, 'local');
  assert.equal(snapshot.createdAt, '2026-07-19T00:00:00.000Z');
  assert.match(snapshotPath, /^\.feishu-sync\/recovery\//);
  assert.equal(snapshotPath.includes('note.md'), false);
});

test('snapshot write failure rejects so the caller can abort the destructive write', async () => {
  const adapter = new MemoryAdapter();
  adapter.failWrite = true;
  await assert.rejects(
    createRecoverySnapshot(adapter, {
      originalPath: 'note.md',
      content: 'body',
      source: 'local',
      nonce: 'fixed',
    }),
    /disk full/,
  );
});

test('recovery snapshots rotate to a bounded total', async () => {
  const adapter = new MemoryAdapter();
  for (let index = 0; index < 5; index += 1) {
    await createRecoverySnapshot(adapter, {
      originalPath: 'note.md',
      content: String(index),
      source: 'remote',
      now: new Date(`2026-07-19T00:00:0${index}.000Z`),
      nonce: String(index),
      maxSnapshots: 3,
    });
  }
  assert.equal(adapter.files.size, 3);
  assert.deepEqual(
    [...adapter.files.values()].map((value) => JSON.parse(value).content).sort(),
    ['2', '3', '4'],
  );
});
