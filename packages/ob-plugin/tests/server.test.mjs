import assert from 'node:assert/strict';
import http from 'node:http';
import test, { afterEach } from 'node:test';

import { startServer } from '../src/server.ts';

const stops = [];
afterEach(async () => {
  await Promise.all(stops.splice(0).map((stop) => stop()));
});

async function start(routes, options = {}) {
  const started = await startServer(0, {
    validateToken: (token) => token === 'valid-token',
    routes: new Map(routes),
    ...options,
  });
  stops.push(started.stop);
  return started.port;
}

function request(port, { method = 'GET', path = '/status', token, body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: '127.0.0.1', port, method, path,
      headers: { ...headers, ...(token ? { 'X-Sync-Token': token } : {}) },
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(Buffer.concat(chunks).toString()) }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

test('status is authenticated and wrong methods fail closed', async () => {
  const port = await start([['/status', () => ({ ok: true })]]);
  assert.equal((await request(port)).status, 401);
  assert.equal((await request(port, { token: 'valid-token' })).status, 200);
  assert.equal((await request(port, { method: 'POST', token: 'valid-token' })).status, 405);
});

test('oversized bodies are rejected before handlers run', async () => {
  let calls = 0;
  const port = await start([['/fetch', () => { calls += 1; return { ok: true }; }]], { maxBodyBytes: 32 });
  const response = await request(port, {
    method: 'POST', path: '/fetch', token: 'valid-token', body: JSON.stringify({ text: 'x'.repeat(100) }),
  });
  assert.equal(response.status, 413);
  assert.equal(calls, 0);
});

test('handler deadlines return a recoverable timeout', async () => {
  const port = await start([['/tree', () => new Promise(() => {})]], { handlerTimeoutMs: 25 });
  const response = await request(port, { path: '/tree', token: 'valid-token' });
  assert.equal(response.status, 504);
  assert.equal(response.body.code, 'REQUEST_TIMEOUT');
});
