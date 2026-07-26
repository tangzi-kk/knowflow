import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assembleFile,
  inspectFrontmatter,
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
