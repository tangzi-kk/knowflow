import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { isRetryableCliFailure } from '../src/lark/cli.ts';

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
