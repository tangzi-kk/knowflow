import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { isRetryableCliFailure, resolveNodeTokenFromUrl } from '../src/lark/cli.ts';

test('resolveNodeTokenFromUrl extracts wiki, docx, and bitable base tokens', () => {
  assert.deepEqual(resolveNodeTokenFromUrl('https://sample.feishu.cn/wiki/wikcn123456'), { node_token: 'wikcn123456' });
  assert.deepEqual(resolveNodeTokenFromUrl('https://sample.feishu.cn/docx/doxcn654321'), { obj_token: 'doxcn654321' });
  assert.deepEqual(
    resolveNodeTokenFromUrl('https://sample.feishu.cn/base/bascnABCDEF?table=tblGHIJKL'),
    { base_token: 'bascnABCDEF', table_id: 'tblGHIJKL' }
  );
  assert.deepEqual(resolveNodeTokenFromUrl('https://sample.feishu.cn/base/bascnONLYBASE'), {
    base_token: 'bascnONLYBASE',
    table_id: undefined,
  });
});

test('CLI retries only transient failures', () => {
  assert.equal(isRetryableCliFailure('HTTP 429'), true);
  assert.equal(isRetryableCliFailure('ECONNRESET'), true);
  assert.equal(isRetryableCliFailure('invalid token'), false);
  assert.equal(isRetryableCliFailure('permission denied'), false);
});

test('CLI writes use isolated temporary directories and one total deadline', async () => {
  const source = await readFile(new URL('../src/lark/cli.ts', import.meta.url), 'utf8');
  assert.match(source, /mkdtempSync\(path\.join\(os\.tmpdir\(\), 'knowflow-write-'\)\)/);
  assert.match(source, /fs\.rmSync\(tmpDir, \{ recursive: true, force: true \}\)/);
  assert.match(source, /const deadline = Date\.now\(\) \+ Math\.max\(1, totalTimeout\)/);
  assert.match(source, /export function disableCli/);
  assert.match(source, /export function enableCli/);
});
