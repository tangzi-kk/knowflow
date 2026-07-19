/**
 * DeepSeek Web 免费接口 — PoW 求解 + Chat API
 *
 * 原理（来自 deepseek-free-api / ds-free-api 源码分析）：
 *   1. DeepSeek Web 要求每个 Chat 请求附带 PoW（Proof of Work）响应
 *   2. PoW 挑战：POST /api/v0/chat/create_pow_challenge → 返回 { challenge, salt, difficulty, expire_at, ... }
 *   3. PoW 求解：SHA3-256(challenge + salt_expireAt_nonce)，检查前 4 字节 LE uint32 < 2^32/difficulty
 *   4. Chat 请求：POST /api/v0/chat/completion，header x-ds-pow-response 携带 base64 编码的 PoW 答案
 *   5. 认证：Bearer token（需从浏览器 localStorage 提取，约 24h 有效）
 *
 * Token 获取方式：
 *   1. 打开 chat.deepseek.com 登录
 *   2. DevTools → Application → Local Storage → 找 userToken 或类似的 key
 *   3. 粘贴到扩展设置中
 *
 *   或者在 chat.deepseek.com 页面自动提取（通过 content script）
 */

import { sha3_256 } from 'js-sha3';
import {
  clearDeepSeekToken,
  getDeepSeekToken,
  setDeepSeekToken,
} from './storage.js';
export { clearDeepSeekToken, getDeepSeekToken, setDeepSeekToken };

// ───── 类型定义 ─────

interface PowChallenge {
  algorithm: string;   // "DeepSeekHashV1"
  challenge: string;   // hex string
  salt: string;        // hex string (e.g. 10-16 chars)
  difficulty: number;  // e.g. 144000
  expire_at: number;   // unix timestamp ms
  signature: string;
  target_path: string; // "/api/v0/chat/completion"
}

// ───── PoW 求解器（纯 JS SHA3-256）─────

/**
 * 求解 DeepSeek PoW 挑战
 * 算法：遍历 nonce，SHA3-256(challenge + salt_expireAt_nonce) 的前 4 字节 LE uint32 < 2^32/difficulty
 * @returns nonce 或 null（10 秒内未找到解）
 */
function solvePoW(challenge: PowChallenge, maxTimeMs: number = 10000): number | null {
  const prefix = `${challenge.salt}_${challenge.expire_at}_`;
  const threshold = Math.floor(0x100000000 / challenge.difficulty);
  const startTime = performance.now();
  const input = new TextEncoder();

  const bChallenge = input.encode(challenge.challenge);
  const bPrefix = input.encode(prefix);

  // 预组合 challenge + prefix（不变部分）
  const preLen = bChallenge.length + bPrefix.length;
  const preBuf = new Uint8Array(preLen + 10); // 留 10 字节给 nonce 字符串
  preBuf.set(bChallenge, 0);
  preBuf.set(bPrefix, bChallenge.length);

  let nonce = 0;
  while (nonce < 50_000_000) {
    // 将 nonce 转为字符串拼接到末尾
    const nonceStr = String(nonce);
    const nonceBytes = input.encode(nonceStr);
    const totalLen = preLen + nonceBytes.length;

    // 构造完整输入（尽可能重用 buffer）
    const fullInput = new Uint8Array(
      preBuf.buffer.slice(0, preLen),
    );
    const combined = new Uint8Array(totalLen);
    combined.set(fullInput, 0);
    combined.set(nonceBytes, preLen);

    // SHA3-256 哈希（js-sha3 接受 Uint8Array）
    const hash = sha3_256.array(combined);
    // 前 4 字节 LE uint32
    const value = (hash[0] | (hash[1] << 8) | (hash[2] << 16) | (hash[3] << 24)) >>> 0;

    if (value < threshold) {
      const elapsed = performance.now() - startTime;
      console.log(`[DeepSeek PoW] nonce=${nonce}, time=${elapsed.toFixed(0)}ms, value=${value.toString(16)}, threshold=${threshold.toString(16)}`);
      return nonce;
    }

    nonce++;

    // 超时检查（每 10 万次检查一次以节省开销）
    if (nonce % 100_000 === 0) {
      const elapsed = performance.now() - startTime;
      if (elapsed > maxTimeMs) {
        console.warn(`[DeepSeek PoW] timeout after ${elapsed.toFixed(0)}ms, ${nonce} iterations`);
        return null;
      }
    }
  }

  console.warn(`[DeepSeek PoW] no solution found in ${nonce} iterations`);
  return null;
}

/**
 * 将 PoW 答案编码为 x-ds-pow-response header 值
 */
function encodePowResponse(challenge: PowChallenge, nonce: number): string {
  const payload = {
    algorithm: challenge.algorithm,
    challenge: challenge.challenge,
    salt: challenge.salt,
    answer: nonce,
    signature: challenge.signature,
    target_path: challenge.target_path,
  };
  const json = JSON.stringify(payload);
  // 注意：deepseek-free-api 使用 base64 编码，但 ds-free-api 使用直接 JSON
  // 根据官方 web 应用行为，使用 base64
  return btoa(unescape(encodeURIComponent(json)));
}

// ───── PoW 挑战获取 ─────

async function fetchPowChallenge(token: string): Promise<PowChallenge> {
  const resp = await fetch('https://chat.deepseek.com/api/v0/chat/create_pow_challenge', {
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Origin': 'https://chat.deepseek.com',
      'Referer': 'https://chat.deepseek.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/134.0.0.0 Safari/537.36',
      'x-client-version': '2.0.2',
      'x-client-platform': 'web',
    },
    body: JSON.stringify({ target_path: '/api/v0/chat/completion' }),
  });

  if (!resp.ok) {
    throw new Error(`获取 PoW 挑战失败：HTTP ${resp.status}`);
  }

  const data = await resp.json();
  const bizData = data?.data?.biz_data || data?.biz_data || data;
  if (!bizData.challenge || !bizData.salt || !bizData.difficulty) {
    throw new Error(`PoW 挑战格式异常：${JSON.stringify(bizData).slice(0, 200)}`);
  }

  return {
    algorithm: bizData.algorithm || 'DeepSeekHashV1',
    challenge: bizData.challenge,
    salt: bizData.salt,
    difficulty: bizData.difficulty,
    expire_at: bizData.expire_at || (Date.now() + 60000),
    signature: bizData.signature || '',
    target_path: bizData.target_path || '/api/v0/chat/completion',
  };
}

/**
 * 检查 token 是否有效（简单有效性检查：非空且看起来像 JWT）
 */
export function isValidToken(token: string | null): boolean {
  if (!token || token.length < 20) return false;
  // DeepSeek token 通常是类似 JWT 的格式或长随机字符串
  return true;
}

// ───── Chat API ─────

export interface DeepSeekChatRequest {
  prompt: string;
  model?: string;
  chatSessionId?: string;
  parentMessageId?: string;
}

/**
 * 发送 DeepSeek Web Chat 请求（非流式，提取最终文本）
 */
export async function sendDeepSeekWebMessage(opts: DeepSeekChatRequest): Promise<string> {
  const token = await getDeepSeekToken();
  if (!isValidToken(token)) {
    throw new Error(
      'DeepSeek Token 未配置。请在扩展设置中粘贴您的 DeepSeek Token，' +
      '或打开 chat.deepseek.com 登录后自动提取。'
    );
  }

  // 1. 获取 PoW 挑战并求解
  const challenge = await fetchPowChallenge(token!);
  const nonce = solvePoW(challenge, 10000);
  if (nonce === null) {
    throw new Error('DeepSeek PoW 求解超时（10s）。请检查网络连接或重试。');
  }
  const powResponse = encodePowResponse(challenge, nonce);

  // 2. 构造 Chat 请求
  const model = opts.model || 'deepseek-chat';
  const messages = [
    { role: 'user', content: opts.prompt },
  ];

  const chatBody: Record<string, unknown> = {
    model,
    messages,
    stream: false,
    temperature: 0.7,
  };

  const resp = await fetch('https://chat.deepseek.com/api/v0/chat/completion', {
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Origin': 'https://chat.deepseek.com',
      'Referer': 'https://chat.deepseek.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/134.0.0.0 Safari/537.36',
      'x-client-version': '2.0.2',
      'x-client-platform': 'web',
      'x-ds-pow-response': powResponse,
    },
    body: JSON.stringify(chatBody),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    if (resp.status === 401) {
      throw new Error(
        'DeepSeek Token 已失效（401），请重新获取。' +
        '打开 chat.deepseek.com 登录后可自动提取。'
      );
    }
    throw new Error(`DeepSeek API 错误 [${resp.status}]：${errText.slice(0, 200)}`);
  }

  const data = await resp.json();
  // 提取文本（兼容多种响应格式）
  const text =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text ||
    data?.data?.content ||
    data?.content ||
    '';
  if (!text) {
    throw new Error('DeepSeek 未返回内容。响应：' + JSON.stringify(data).slice(0, 300));
  }
  return text;
}

// ───── 流式 Chat API ─────

/**
 * 发送 DeepSeek Web Chat 流式请求（stream: true）
 * 通过 onChunk 回调逐块推送 delta 内容
 * @returns 完整文本（用于缓存）
 */
export async function sendDeepSeekWebMessageStream(
  opts: DeepSeekChatRequest,
  onChunk: (chunk: string) => void,
): Promise<string> {
  const token = await getDeepSeekToken();
  if (!isValidToken(token)) {
    throw new Error(
      'DeepSeek Token 未配置。请在扩展设置中粘贴您的 DeepSeek Token，' +
      '或打开 chat.deepseek.com 登录后自动提取。'
    );
  }

  // 1. 获取 PoW 挑战并求解
  const challenge = await fetchPowChallenge(token!);
  const nonce = solvePoW(challenge, 10000);
  if (nonce === null) {
    throw new Error('DeepSeek PoW 求解超时（10s）。请检查网络连接或重试。');
  }
  const powResponse = encodePowResponse(challenge, nonce);

  // 2. 构造 Chat 请求（stream: true）
  const model = opts.model || 'deepseek-chat';
  const messages = [
    { role: 'user', content: opts.prompt },
  ];

  const chatBody: Record<string, unknown> = {
    model,
    messages,
    stream: true,
    temperature: 0.7,
  };

  const resp = await fetch('https://chat.deepseek.com/api/v0/chat/completion', {
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Origin': 'https://chat.deepseek.com',
      'Referer': 'https://chat.deepseek.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/134.0.0.0 Safari/537.36',
      'x-client-version': '2.0.2',
      'x-client-platform': 'web',
      'x-ds-pow-response': powResponse,
    },
    body: JSON.stringify(chatBody),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    if (resp.status === 401) {
      throw new Error(
        'DeepSeek Token 已失效（401），请重新获取。' +
        '打开 chat.deepseek.com 登录后可自动提取。'
      );
    }
    throw new Error(`DeepSeek API 错误 [${resp.status}]：${errText.slice(0, 200)}`);
  }

  if (!resp.body) {
    throw new Error('DeepSeek 流式响应不支持：response.body 为空。');
  }

  // 3. SSE 流式解析
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  const processSSELine = (line: string): void => {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith('data:')) return;
    const data = trimmed.slice(5).trim();
    if (!data || data === '[DONE]') return;
    try {
      const json = JSON.parse(data);
      const content = json?.choices?.[0]?.delta?.content;
      if (typeof content === 'string' && content) {
        fullText += content;
        onChunk(content);
      }
    } catch {
      // 忽略解析失败的行（可能是心跳或注释）
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    // 保留最后不完整的行
    buffer = lines.pop() || '';
    for (const line of lines) {
      processSSELine(line);
    }
  }
  // 处理缓冲区剩余数据
  if (buffer.trim()) {
    processSSELine(buffer);
  }

  if (!fullText) {
    throw new Error('DeepSeek 流式未返回内容。');
  }
  return fullText;
}
