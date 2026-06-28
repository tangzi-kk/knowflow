/**
 * 内容 hash（轻核验）。依据 `00_同步方案设计_v2.md` §6.2 步骤 2。
 * 用 sha256，只 hash 正文（不含 frontmatter 的 sync_* 字段，避免自指）。
 *
 * 跨环境：优先用 Web Crypto API（浏览器 + Node 18+ 都有 globalThis.crypto.subtle），
 * fallback 到 node:crypto（OB 插件 node 环境保险）。
 */

/** 同步版 sha256 hex（仅 Node 环境）。浏览器用 bodyHashAsync。 */
export function bodyHash(body: string): string {
  // Node 环境
  try {
    const { createHash } = require('node:crypto') as typeof import('node:crypto');
    return createHash('sha256').update(body, 'utf8').digest('hex');
  } catch {
    // 浏览器环境无 require，走 async 版（这里同步返回 fallback，调用方应用 async 版）
    return syncFallbackHash(body);
  }
}

/**
 * 异步 sha256 hex（浏览器 + Node 通用）。推荐使用。
 */
export async function bodyHashAsync(body: string): Promise<string> {
  const crypto = globalThis.crypto as { subtle?: { digest: (alg: string, data: ArrayBuffer) => Promise<ArrayBuffer> } };
  if (crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body).buffer as ArrayBuffer);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return syncFallbackHash(body);
}

/**
 * 简易同步 fallback（非加密级，仅当 crypto API 都不可用时用）。
 * 用 djb2 变种，保证一致性即可（轻核验场景）。
 */
function syncFallbackHash(body: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < body.length; i++) {
    const c = body.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ (c + 0x9e3779b9), 0x85ebca77);
  }
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0') + '_fallback';
}

/**
 * 比对是否变化。
 * @param current 当前正文 hash
 * @param last 上次同步写入的 sync_hash
 */
export function isChanged(current: string, last?: string): boolean {
  if (!last) return true;
  return current !== last;
}
