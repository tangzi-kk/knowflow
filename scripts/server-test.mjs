/**
 * HTTP server 端点冒烟 —— 临时产物，测完即删。
 * 单独拉起 server.ts 的 startServer，不走 obsidian 运行时。
 */
import { startServer } from '../packages/ob-plugin/src/server.ts';

const routes = new Map();
routes.set('/status', async () => ({
  ok: true,
  version: '0.0.0-test',
  vault: 'probe-vault',
  larkReady: true,
  larkVersion: '1.0.52',
}));

const { stop } = await startServer(4599, {
  validateToken: (t) => t === 'test-token',
  routes,
});

// 测无 token 访问 /status（设计上允许）
const r1 = await fetch('http://127.0.0.1:4599/status');
console.log('[/status 无token]', r1.status, JSON.stringify(await r1.json()));

// 测鉴权端点（伪路径）
const r2 = await fetch('http://127.0.0.1:4599/fetch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{}',
});
console.log('[/fetch 无token]', r2.status, JSON.stringify(await r2.json()));

// 测错误 token
const r3 = await fetch('http://127.0.0.1:4599/fetch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Sync-Token': 'wrong' },
  body: '{}',
});
console.log('[/fetch 错token]', r3.status, JSON.stringify(await r3.json()));

// 测正确 token + 未知路由
const r4 = await fetch('http://127.0.0.1:4599/nope', {
  headers: { 'X-Sync-Token': 'test-token' },
});
console.log('[/nope 404]', r4.status, JSON.stringify(await r4.json()));

// 测 CORS 预检
const r5 = await fetch('http://127.0.0.1:4599/status', { method: 'OPTIONS' });
console.log('[OPTIONS 预检]', r5.status, r5.headers.get('access-control-allow-origin'));

await stop();
process.exit(0);
