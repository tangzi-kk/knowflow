import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PROTOCOL_VERSION,
  REQUIRED_WRITE_CAPABILITIES,
  evaluateProtocolCompatibility,
} from '../packages/shared/dist/index.js';

const compatibleInfo = {
  protocolVersion: PROTOCOL_VERSION,
  capabilities: [...REQUIRED_WRITE_CAPABILITIES, 'status'],
  componentVersion: '3.2.2',
};

test('matching protocol and capabilities allow writes', () => {
  assert.deepEqual(evaluateProtocolCompatibility(compatibleInfo), {
    compatible: true,
  });
});

test('missing protocol metadata fails closed', () => {
  const result = evaluateProtocolCompatibility(undefined);
  assert.equal(result.compatible, false);
  assert.match(result.reason ?? '', /missing protocol metadata/i);
});

test('older and newer protocols both fail closed', () => {
  for (const protocolVersion of [PROTOCOL_VERSION - 1, PROTOCOL_VERSION + 1]) {
    const result = evaluateProtocolCompatibility({
      ...compatibleInfo,
      protocolVersion,
    });
    assert.equal(result.compatible, false);
    assert.match(result.reason ?? '', /protocol version mismatch/i);
  }
});

test('missing a required write capability fails closed', () => {
  const result = evaluateProtocolCompatibility({
    ...compatibleInfo,
    capabilities: compatibleInfo.capabilities.filter((value) => value !== 'pushback'),
  });
  assert.equal(result.compatible, false);
  assert.match(result.reason ?? '', /pushback/);
});
