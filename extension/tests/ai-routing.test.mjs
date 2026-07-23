import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  GEMINI_WEB_MODELS,
  resolveAiRoute,
} from '../src/ai-routing.ts';

const legacyGeminiWebModel = '56fdd199312815e2';

test('Gemini Web model catalog follows the current upstream hashes', () => {
  assert.deepEqual(Object.keys(GEMINI_WEB_MODELS).sort(), [
    'cf41b0e0dd7d53e5',
    'e6fa609c3fa255c0',
    'fbb127bbb056c959',
  ]);
  assert.equal(resolveAiRoute({ provider: 'gemini-web', model: legacyGeminiWebModel }).model, 'fbb127bbb056c959');
});

test('OpenAI and DeepSeek API routes replace stale Web hashes with valid API defaults', () => {
  assert.deepEqual(
    resolveAiRoute({ provider: 'openai', model: legacyGeminiWebModel }),
    {
      kind: 'openai-compatible',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o-mini',
      requiresApiKey: true,
    },
  );
  assert.deepEqual(
    resolveAiRoute({ provider: 'deepseek', model: legacyGeminiWebModel }),
    {
      kind: 'openai-compatible',
      endpoint: 'https://api.deepseek.com/chat/completions',
      model: 'deepseek-chat',
      requiresApiKey: true,
    },
  );
});

test('custom OpenAI-compatible routes normalize one chat completions suffix', () => {
  assert.deepEqual(
    resolveAiRoute({ provider: 'custom', baseUrl: 'http://127.0.0.1:3000/v1/', model: 'custom-model' }),
    {
      kind: 'openai-compatible',
      endpoint: 'http://127.0.0.1:3000/v1/chat/completions',
      model: 'custom-model',
      requiresApiKey: false,
    },
  );
  assert.equal(
    resolveAiRoute({
      provider: 'custom',
      baseUrl: 'http://127.0.0.1:3000/v1',
      model: 'gemini-3.6-flash',
    }).model,
    'gemini-3.6-flash',
  );
});

test('AI settings accept provider-specific model names instead of forcing Web hashes', async () => {
  const settings = await readFile(new URL('../settings.html', import.meta.url), 'utf8');
  assert.match(settings, /<input[^>]+id="ai-model"/);
  assert.doesNotMatch(settings, /<select[^>]+id="ai-model"/);
  assert.match(settings, /fbb127bbb056c959/);
  assert.doesNotMatch(settings, /56fdd199312815e2|8c46e95b1a07cecc/);
});

test('sidepanel API requests use the shared route resolver', async () => {
  const sidepanel = await readFile(new URL('../src/sidepanel/sidepanel.ts', import.meta.url), 'utf8');
  assert.match(sidepanel, /resolveAiRoute\(config\)/);
  assert.doesNotMatch(sidepanel, /config\.provider === 'openai' \? 'https:\/\/api\.openai\.com'/);
});

test('toolbar streaming uses the same provider dispatcher and always reports a terminal state', async () => {
  const background = await readFile(new URL('../src/background.ts', import.meta.url), 'utf8');
  const streaming = background.slice(
    background.indexOf('async function runInlineAiStreaming'),
    background.indexOf('// ───── Gemini Web Session'),
  );
  assert.match(streaming, /runInlineAiWithRetry\(payload\)/);
  assert.match(streaming, /ai-stream-done/);
  assert.match(streaming, /ai-stream-error/);
  assert.doesNotMatch(streaming, /sendGeminiWebMessageStreaming/);
  assert.doesNotMatch(streaming, /sendDeepSeekWebMessageStream/);
});

test('runtime message listener uses one callback response contract', async () => {
  const background = await readFile(new URL('../src/background.ts', import.meta.url), 'utf8');
  assert.match(background, /onMessage\.addListener\(\(message, sender, sendResponse\) =>/);
  assert.doesNotMatch(background, /onMessage\.addListener\(async \(message, sender, sendResponse\)/);
});

test('DeepSeek MAIN-world token capture crosses an isolated extension bridge', async () => {
  const manifest = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
  const deepSeekScripts = manifest.content_scripts.filter((entry) => entry.matches.includes('https://chat.deepseek.com/*'));
  assert.equal(deepSeekScripts.some((entry) => entry.world === 'MAIN' && entry.js.includes('ds-token-main.js')), true);
  assert.equal(deepSeekScripts.some((entry) => entry.world !== 'MAIN' && entry.js.includes('ds-token.js')), true);

  const main = await readFile(new URL('../src/content/ds-token-main.ts', import.meta.url), 'utf8');
  const bridge = await readFile(new URL('../src/content/ds-token.ts', import.meta.url), 'utf8');
  assert.match(main, /window\.postMessage/);
  assert.match(bridge, /event\.source !== window/);
  assert.match(bridge, /chrome\.runtime\.sendMessage/);
});
