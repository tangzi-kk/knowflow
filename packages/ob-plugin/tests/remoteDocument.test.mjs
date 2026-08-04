import assert from 'node:assert/strict';
import test from 'node:test';

import { buildRemoteDocument } from '../src/remoteCanonical.ts';

test('remote canonicalization produces one stable body hash and extracts identity', () => {
  const first = buildRemoteDocument('# Remote title\n\nBody', '<title id="obj_123"></title>', 'node_123');
  const second = buildRemoteDocument('# Remote title\n\nBody', '<title id="obj_123"></title>', 'node_123');

  assert.equal(first.title, 'Remote title');
  assert.equal(first.objToken, 'obj_123');
  assert.equal(first.body, second.body);
  assert.equal(first.hash, second.hash);
  assert.ok(first.hash);
});

test('explicit obj token wins and missing title falls back to the node token', () => {
  const result = buildRemoteDocument('Body only', '<title id="xml_obj"></title>', 'node_123', 'explicit_obj');
  assert.equal(result.title, 'node_123');
  assert.equal(result.objToken, 'explicit_obj');
});

test('metadata callout is not counted as body content', () => {
  const markdown = [
    '# 标题',
    '',
    '<callout emoji="📋">',
    '**KnowFlow 元数据**',
    '- **标签**：🎯项目 X',
    '- **编码**：26_0805_X_02_a1',
    '</callout>',
    '',
    '正文内容',
  ].join('\n');
  const xml = '<title id="obj_123"></title>'
    + '<callout><p><b>KnowFlow 元数据</b></p><ul>'
    + '<li><b>标签</b>：🎯项目 X</li>'
    + '<li><b>编码</b>：26_0805_X_02_a1</li>'
    + '</ul></callout>';
  const result = buildRemoteDocument(markdown, xml, 'node_123');
  assert.equal(result.body.includes('KnowFlow 元数据'), false);
  assert.equal(result.body.includes('正文内容'), true);
  assert.equal(result.meta.标签, 'X');
  assert.equal(result.meta.编码, '26_0805_X_02_a1');
});

test('Feishu escaped emphasis in a body callout is normalized before hashing', () => {
  const markdown = [
    '# 标题',
    '',
    '<callout emoji="💡">',
    '\\*\\*同步提示\\*\\*',
    '正文提醒',
    '</callout>',
  ].join('\n');
  const result = buildRemoteDocument(markdown, '<title id="obj_123"></title>', 'node_123');
  assert.equal(result.body.includes('**同步提示**'), true);
  assert.equal(result.body.includes('\\*\\*同步提示'), false);
});
