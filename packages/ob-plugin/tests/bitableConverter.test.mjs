import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizeFieldValue,
  convertRecordToMarkdown,
  generateBitableIndex,
  convertEmbeddedBitableToCallout,
} from '../src/bitable/bitableConverter.ts';
import { inspectFrontmatter } from '../../shared/dist/index.js';

test('normalizeFieldValue correctly normalizes complex Lark Base field types', () => {
  // 1. Primitive types
  assert.equal(normalizeFieldValue(null), null);
  assert.equal(normalizeFieldValue(undefined), null);
  assert.equal(normalizeFieldValue('  测试文本  '), '测试文本');
  assert.equal(normalizeFieldValue(42), 42);
  assert.equal(normalizeFieldValue(true), true);

  // 2. Date timestamp
  const ts = 1729000000000;
  const normalizedDate = normalizeFieldValue(ts, '截止时间');
  assert.match(String(normalizedDate), /^\d{4}-\d{2}-\d{2}$/);

  // 3. User lists
  const users = [{ name: '张三', id: 'ou_1' }, { name: '李四', id: 'ou_2' }];
  assert.deepEqual(normalizeFieldValue(users, '负责人'), ['张三', '李四']);

  // 4. Attachments
  const attachments = [{ name: '架构图.png', file_token: 'boxcn123' }];
  assert.deepEqual(normalizeFieldValue(attachments, '附件'), ['架构图.png']);

  // 5. Rich text spans
  const richText = [{ type: 'text', text: 'Hello ' }, { type: 'text', text: 'Feishu' }];
  assert.equal(normalizeFieldValue(richText, '说明'), 'Hello Feishu');

  // 6. Hyperlinks
  const linkObj = { text: '点击查看', link: 'https://feishu.cn' };
  assert.equal(normalizeFieldValue(linkObj, '相关链接'), '[点击查看](https://feishu.cn)');

  // 7. Multi-select options
  const options = [{ text: 'P0' }, { text: '高优先级' }];
  assert.deepEqual(normalizeFieldValue(options, '优先级'), ['P0', '高优先级']);
});

test('convertRecordToMarkdown produces compliant Markdown cards with Frontmatter', () => {
  const record = {
    record_id: 'rec_abc123',
    fields: {
      任务名称: '落地 3:7 康奈尔分栏与七标签算法',
      状态: '已完成',
      优先级: 'P0',
      负责人: [{ name: '塘子', id: 'ou_tang' }],
      截止日期: 1729000000000,
      详细描述: '这是一段超过二十个字符的长篇描述文本，用于验证正文提取分离逻辑是否正常生效。',
      附件清单: [{ name: '验收报告.pdf', file_token: 'boxcn456' }],
    },
  };

  const result = convertRecordToMarkdown({
    record,
    baseToken: 'bascn_test_token',
    tableId: 'tbl_test_table',
    tableName: '开发任务台账',
    tag: 'X',
  });

  assert.equal(result.recordId, 'rec_abc123');
  assert.equal(result.filename, '落地 3_7 康奈尔分栏与七标签算法.md');
  assert.equal(result.frontmatter.title, '落地 3:7 康奈尔分栏与七标签算法');
  assert.equal(result.frontmatter.feishu_record_id, 'rec_abc123');
  assert.equal(result.frontmatter.feishu_base_token, 'bascn_test_token');
  assert.equal(result.frontmatter.feishu_table_id, 'tbl_test_table');
  assert.equal(result.frontmatter.feishu_table_name, '开发任务台账');
  assert.equal(result.frontmatter.状态, '已完成');
  assert.equal(result.frontmatter.优先级, 'P0');
  assert.deepEqual(result.frontmatter.负责人, ['塘子']);
  assert.equal(result.frontmatter.标签, 'X');

  // 正文分离验证
  assert.ok(result.body.includes('## 详细描述'));
  assert.ok(result.body.includes('这是一段超过二十个字符的长篇描述文本'));
  assert.ok(result.body.includes('## 📎 附件'));
  assert.ok(result.body.includes('验收报告.pdf'));

  // 验证序列化格式
  const parsed = inspectFrontmatter(result.fullMarkdown);
  assert.equal(parsed.status, 'valid');
  assert.equal(parsed.frontmatter.feishu_record_id, 'rec_abc123');
});

test('generateBitableIndex outputs Dataview query and Obsidian Projects guide', () => {
  const indexMd = generateBitableIndex({
    baseToken: 'bascn_base999',
    tableId: 'tbl_table888',
    tableName: '年度目标库',
    fields: [
      { name: '目标名称' },
      { name: '状态' },
      { name: '责任人' },
      { name: '进度' },
    ],
    recordCount: 15,
    primaryField: '目标名称',
  });

  assert.ok(indexMd.includes('# 📊 年度目标库'));
  assert.ok(indexMd.includes('TABLE 状态, 责任人, 进度'));
  assert.ok(indexMd.includes('WHERE file.name != "_view"'));
  assert.ok(indexMd.includes('Obsidian Projects 插件视图指引'));
  assert.ok(indexMd.includes('bascn_base999'));
  assert.ok(indexMd.includes('tbl_table888'));
});

test('convertEmbeddedBitableToCallout generates correct Callout preview', () => {
  const callout = convertEmbeddedBitableToCallout({
    baseToken: 'bascn_embed_123',
    tableId: 'tbl_embed_456',
    title: '运营数据看板',
  });

  assert.ok(callout.includes('> [!bitable] 📊 多维表格：运营数据看板'));
  assert.ok(callout.includes('https://feishu.cn/base/bascn_embed_123?table=tbl_embed_456'));
  assert.ok(callout.includes('Base Token'));
  assert.ok(callout.includes('Table ID'));
});
