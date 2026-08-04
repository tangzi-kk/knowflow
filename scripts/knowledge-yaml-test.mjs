import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assembleFile,
  calloutXmlToMeta,
  inspectFrontmatter,
  metaToCalloutXml,
} from '../packages/shared/dist/index.js';

test('strict frontmatter inspection distinguishes absent valid and invalid YAML', () => {
  const absent = inspectFrontmatter('# 无头部\n');
  assert.equal(absent.status, 'none');
  assert.equal(absent.body, '# 无头部\n');

  const valid = inspectFrontmatter('---\n标签: S\n---\n正文\n');
  assert.equal(valid.status, 'valid');
  assert.equal(valid.frontmatter?.标签, 'S');
  assert.equal(valid.body, '正文\n');

  const invalid = inspectFrontmatter('---\n标签: [\n---\n正文\n');
  assert.equal(invalid.status, 'invalid');
  assert.match(invalid.error ?? '', /flow (?:sequence|collection)|YAML/i);
});

test('BOM and CRLF survive a valid knowledge metadata rewrite', () => {
  const original = '\uFEFF---\r\n标签: S\r\n---\r\n正文\r\n';
  const inspected = inspectFrontmatter(original);
  assert.equal(inspected.status, 'valid');
  assert.equal(inspected.hasBom, true);
  assert.equal(inspected.lineEnding, '\r\n');

  const rewritten = assembleFile(
    { ...inspected.frontmatter, 编码: '26_0726_S_01_a1', 短编码: 'S01.a1' },
    inspected.body,
    { hasBom: inspected.hasBom, lineEnding: inspected.lineEnding },
  );
  assert.equal(rewritten.startsWith('\uFEFF---\r\n'), true);
  assert.equal(rewritten.includes('\n') && !rewritten.replaceAll('\r\n', '').includes('\n'), true);
  assert.equal(rewritten.endsWith('正文\r\n'), true);
});

test('new YAML output contains the complete metadata contract', () => {
  const parsed = inspectFrontmatter(assembleFile({ feishu_id: 'node', feishu_doc_id: 'doc' }, '# 正文'));
  assert.equal(parsed.status, 'valid');
  for (const field of [
    '协议版本', '标签', '编码', '短编码', '输入', '日期', '日期索引', '关键词', '概述',
    '评分', '评分_显示', '状态', '索引_知识库', '索引_颜色', '索引_操作&反馈',
    '索引_块', '索引_风险', '关联项目', '关联文档', '关联人物',
  ]) {
    assert.ok(Object.hasOwn(parsed.frontmatter ?? {}, field), `missing YAML field: ${field}`);
  }
});

test('Feishu metadata callout round-trips all human fields without leaking XML', () => {
  const input = {
    协议版本: 1,
    文档ID: '11469ce3-8a7e-46d8-82c0-5cd3f9291c22',
    标签: 'X',
    编码: '26_0805_X_02_a1',
    短编码: 'X02.a1',
    状态: '收集',
    概述: '包含 < 和 & 的概述',
    关键词: ['项目', '互通'],
    日期: '2026-08-05',
    日期索引: ['2026-Q3'],
    评分: 3,
    评分_显示: '🌟🌟🌟·实践',
    索引_知识库: '正财',
    索引_颜色: '工作',
    '索引_操作&反馈': ['规划', '初稿'],
    索引_块: ['具象', '简单'],
    索引_风险: ['知识'],
    关联项目: ['KnowFlow'],
    关联文档: ['格式规范'],
    关联人物: ['测试用户'],
  };
  const xml = metaToCalloutXml(input);
  assert.match(xml, /KnowFlow 元数据/);
  assert.match(xml, /系统信息/);
  assert.match(xml, /&lt; 和 &amp; 的概述/);
  assert.equal(xml.includes('< 和 & 的概述'), false);
  const output = calloutXmlToMeta(xml);
  assert.equal(output.标签, 'X');
  assert.deepEqual(output.关键词, ['项目', '互通']);
  assert.deepEqual(output['索引_操作&反馈'], ['规划', '初稿']);
  assert.deepEqual(output.关联人物, ['测试用户']);
  assert.equal(output.概述, '包含 < 和 & 的概述');
  assert.equal(output.文档ID, input.文档ID);
});
