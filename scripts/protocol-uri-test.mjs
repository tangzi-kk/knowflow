import assert from 'node:assert/strict';
import {
  buildObsidianLarkDocUri,
  parseObsidianLarkDocParams,
} from '../packages/shared/dist/index.js';

const uri = buildObsidianLarkDocUri({
  node_token: 'NODE123',
  obj_token: 'DOC456',
  title: '标题 A&B',
  url: 'https://example.feishu.cn/wiki/NODE123',
  space_id: 'SPACE789',
});

assert.equal(
  uri,
  'obsidian://lark-doc?token=NODE123&node_token=NODE123&obj_token=DOC456&space_id=SPACE789&title=%E6%A0%87%E9%A2%98%20A%26B&url=https%3A%2F%2Fexample.feishu.cn%2Fwiki%2FNODE123',
);

assert.deepEqual(parseObsidianLarkDocParams(uri), {
  token: 'NODE123',
  node_token: 'NODE123',
  obj_token: 'DOC456',
  space_id: 'SPACE789',
  title: '标题 A&B',
  url: 'https://example.feishu.cn/wiki/NODE123',
});

assert.deepEqual(parseObsidianLarkDocParams({ token: 'NODE123', title: '标题' }), {
  token: 'NODE123',
  title: '标题',
});
