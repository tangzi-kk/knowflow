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
  fixedVaultArea,
  folderEncodingBlockedReason,
  isAlwaysProtectedPath,
  isProtectedDocumentPath,
} = await import('../src/vaultStructure.ts');

test('fixed roots map to the documented areas', () => {
  assert.equal(fixedVaultArea('🪧导引/AI系统'), 'guide');
  assert.equal(fixedVaultArea('0️⃣输入/💡碎片输入_闪念'), 'input');
  assert.equal(fixedVaultArea('1️⃣知识池/🔵工作_正财'), 'knowledge');
  assert.equal(fixedVaultArea('2️⃣输出/S01 · 观点'), 'output');
  assert.equal(fixedVaultArea('3️⃣附件文件/Lark'), 'attachments');
});

test('fixed structure blocks protected areas at the boundary', () => {
  assert.match(folderEncodingBlockedReason('0️⃣输入'), /一级目录/);
  assert.match(folderEncodingBlockedReason('0️⃣输入/💡碎片输入_闪念'), /二级目录/);
  assert.equal(folderEncodingBlockedReason('0️⃣输入/💡碎片输入_闪念/剪藏'), undefined);
  assert.equal(folderEncodingBlockedReason('2️⃣输出/S01 · 观点'), undefined);
  assert.match(folderEncodingBlockedReason('3️⃣附件文件/Lark'), /附件/);
});

test('guide, attachments and AGENTS are excluded from document automation', () => {
  for (const path of [
    '🪧导引/AI系统/SPEC.md',
    '3️⃣附件文件/Lark/image.png',
    'AGENTS.md',
    '.obsidian/plugins/fs-TB/main.js',
  ]) {
    assert.equal(isAlwaysProtectedPath(path), true, path);
    assert.equal(isProtectedDocumentPath(path), true, path);
  }
  assert.equal(isProtectedDocumentPath('0️⃣输入/💡碎片输入_闪念/记录.md'), false);
});
