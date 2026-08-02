import assert from 'node:assert/strict';
import test from 'node:test';

const { recognizeDocument } = await import('../src/documentRecognition.ts');

test('keeps an explicit protocol tag as a high-confidence decision', () => {
  const result = recognizeDocument({
    path: '输入/任意文档.md',
    title: '任意文档',
    body: '正文没有分类词。',
    frontmatter: { 标签: 'J' },
  });

  assert.deepEqual(result, {
    tag: 'J',
    confidence: 'high',
    reason: '沿用已有合法标签',
    signals: ['frontmatter.标签'],
  });
});

test('recognizes a project from title and body signals', () => {
  const result = recognizeDocument({
    path: '输入/任意文档.md',
    title: 'KnowFlow 项目迭代计划',
    body: '本周里程碑是完成需求评审并准备上线。',
    frontmatter: {},
  });

  assert.equal(result.tag, 'X');
  assert.notEqual(result.confidence, 'low');
  assert.match(result.reason, /项目/);
});

test('falls back to collection instead of inventing a new tag', () => {
  const result = recognizeDocument({
    path: '输入/一篇随手记录.md',
    title: '一篇随手记录',
    body: '今天记录一个暂时没有明显分类的事实。',
    frontmatter: {},
  });

  assert.equal(result.tag, 'S');
  assert.equal(result.confidence, 'low');
  assert.match(result.reason, /回退/);
});
