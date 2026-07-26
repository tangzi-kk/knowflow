import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/sidepanel/sidepanel.ts', import.meta.url), 'utf8');
const clientSource = await readFile(new URL('../src/client.ts', import.meta.url), 'utf8');
const contentSource = await readFile(new URL('../src/content/content.ts', import.meta.url), 'utf8');

test('fetch and clip report landed content as awaiting Obsidian confirmation', () => {
  assert.match(source, /function formatProposalLandingStatus/);
  assert.match(source, /result\.requiresConfirmation === true/);
  assert.match(source, /result\.protocolVersion === PROTOCOL_VERSION/);
  assert.match(source, /已生成待确认整理建议 \$\{result\.proposalId\.slice\(0, 8\)\}/);
  assert.match(source, /内容已落地，但当前 Obsidian 插件未返回整理提案/);
  assert.doesNotMatch(source, /const codeMsg = result\.编码/);
});

test('4.1 writes require proposal capability and validate the returned proposal', () => {
  assert.match(clientSource, /'capture-proposal-v1'/);
  assert.match(clientSource, /function assertProposalResponse/);
  assert.match(clientSource, /内容可能已落地，但 Obsidian 未返回完整的 4\.1 整理提案/);
  assert.match(contentSource, /response\.result\.requiresConfirmation !== true/);
  assert.match(contentSource, /response\.result\.protocolVersion !== PROTOCOL_VERSION/);
  assert.match(contentSource, /内容已落地，等待整理确认/);
});
