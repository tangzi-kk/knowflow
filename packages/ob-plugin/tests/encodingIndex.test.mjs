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

const { exportActivityLog } = await import('../src/encodingIndex.ts');

class MemoryAdapter {
  directories = new Set();
  files = new Map();

  async exists(path) {
    return this.directories.has(path) || this.files.has(path);
  }

  async mkdir(path) {
    this.directories.add(path);
  }

  async write(path, content) {
    this.files.set(path, content);
  }
}

test('exports recent activity from the command palette into the runtime directory', async () => {
  const adapter = new MemoryAdapter();
  const app = { vault: { adapter } };
  const recent = [
    {
      time: '2026-08-02T15:00:00.000Z',
      kind: 'system',
      status: 'succeeded',
      action: 'automatic-recognition',
      path: '2️⃣输出/S01 · 观点/测试.md',
      title: '测试 | 标题',
    },
    {
      time: '2026-08-02T15:01:00.000Z',
      kind: 'system',
      status: 'failed',
      action: '',
      errorCode: 'KNOWLEDGE_PLAN_BLOCKED',
    },
  ];

  const result = await exportActivityLog(app, recent, '测试 Vault');
  assert.match(result.path, /^\.feishu-sync\/同步日志-\d+\.md$/);
  assert.equal(result.count, 2);
  assert.equal(adapter.directories.has('.feishu-sync'), true);

  const content = adapter.files.get(result.path);
  assert.match(content, /# KnowFlow 同步日志/);
  assert.match(content, /\| 失败条数 \| 1 \|/);
  assert.match(content, /测试 \\| 标题/);
  assert.match(content, /KNOWLEDGE_PLAN_BLOCKED/);
});
