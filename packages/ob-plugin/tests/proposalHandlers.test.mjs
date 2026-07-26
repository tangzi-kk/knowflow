import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const fetchSource = await readFile(new URL('../src/handlers/fetchHandler.ts', import.meta.url), 'utf8');
const clipSource = await readFile(new URL('../src/handlers/clipHandler.ts', import.meta.url), 'utf8');

test('fetch lands content without invoking the legacy silent encoding path', () => {
  assert.doesNotMatch(fetchSource, /import\s+\{\s*assignEncoding\s*\}/);
  assert.doesNotMatch(fetchSource, /\bassignEncoding\s*\(/);
  assert.match(fetchSource, /createKnowledgeProposal\(\{\s*paths:\s*\[path\],\s*source:\s*'fetch'\s*\}\)/);
});

test('clip and append both create a pending proposal without silent encoding', () => {
  assert.doesNotMatch(clipSource, /import\s+\{\s*assignEncoding\s*\}/);
  assert.doesNotMatch(clipSource, /\bassignEncoding\s*\(/);
  assert.equal((clipSource.match(/createPendingProposal\(deps,/g) ?? []).length, 2);
  assert.match(clipSource, /createKnowledgeProposal\(\{\s*paths:\s*\[path\],\s*source:\s*'clip'\s*\}\)/);
});

test('both responses preserve landing fields and require confirmation with protocol metadata', () => {
  for (const source of [fetchSource, clipSource]) {
    assert.match(source, /proposalId:\s*proposal\.proposalId/);
    assert.match(source, /requiresConfirmation:\s*true/);
    assert.match(source, /protocolVersion:\s*proposal\.protocolVersion/);
    assert.doesNotMatch(source, /fallbackProposalId|pending-(?:fetch|clip)/);
    assert.doesNotMatch(source, /knowledge proposal registration failed/);
  }
});
