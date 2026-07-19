/**
 * 本地 HTTP server。依据方案 §2（localhost HTTP 协议）。
 *
 * - 用 node:http 起 server（OB 插件 isDesktopOnly，可用 node 内置模块）
 * - 端口可配置（默认 4567）
 * - 鉴权：每个请求校验 X-Sync-Token header
 * - CORS：放通 OPTIONS 预检（扩展从飞书页面 fetch 会被拦）
 * - 路由分发到 handlers
 */
import * as http from 'node:http';
import { TOKEN_HEADER } from '@sync/shared';

export interface ServerDeps {
  /** 校验 token 是否匹配。 */
  validateToken: (token: string) => boolean;
  /** 路由处理器映射。 */
  routes: Map<string, RouteHandler>;
  maxBodyBytes?: number;
  bodyTimeoutMs?: number;
  handlerTimeoutMs?: number;
}

export interface RequestContext {
  method: string;
  url: string;
  /** 解析后的 path（不含 query）。 */
  path: string;
  /** query 参数。 */
  query: URLSearchParams;
  /** 请求体（POST/PUT 才有，已 parse JSON）。 */
  body?: unknown;
  /** 原始 token。 */
  token: string;
  /** 插件卸载或请求超时时取消下游工作。 */
  signal?: AbortSignal;
}

export type RouteHandler = (ctx: RequestContext) => Promise<unknown> | unknown;

/** JSON 响应工具。 */
function json(res: http.ServerResponse, status: number, data: unknown): void {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': `${TOKEN_HEADER}, Content-Type`,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

/**
 * 启动 HTTP server。
 * @returns stop() 函数
 */
export function startServer(
  port: number,
  deps: ServerDeps,
): Promise<{ port: number; stop: () => Promise<void> }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      handleRequest(req, res, port, deps).catch((error) => {
        if (res.headersSent || res.destroyed) return;
        const normalized = normalizeHttpError(error);
        json(res, normalized.status, { ok: false, code: normalized.code, message: normalized.message });
      });
    });

    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => {
      const address = server.address();
      const actualPort = typeof address === 'object' && address ? address.port : port;
      console.log(`[sync/server] listening on http://127.0.0.1:${actualPort}`);
      resolve({
        port: actualPort,
        stop: () => new Promise((done) => {
          server.closeAllConnections?.();
          server.close(() => {
            console.log('[sync/server] stopped');
            done();
          });
        }),
      });
    });
  });
}

async function handleRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  port: number,
  deps: ServerDeps,
): Promise<void> {
      // CORS 预检
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': `${TOKEN_HEADER}, Content-Type`,
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        });
        res.end();
        return;
      }

      const fullUrl = req.url ?? '/';
      const urlObj = new URL(fullUrl, `http://localhost:${port}`);
      const ctxPath = urlObj.pathname;
      const handler = deps.routes.get(ctxPath);
      if (!handler) {
        json(res, 404, { ok: false, code: 'NOT_FOUND', message: `Unknown path: ${ctxPath}` });
        return;
      }

      const token = req.headers[TOKEN_HEADER.toLowerCase()] as string | undefined;
      if (!deps.validateToken(token ?? '')) {
        json(res, 401, { ok: false, code: 'UNAUTHORIZED', message: 'Invalid or missing X-Sync-Token' });
        return;
      }

      const expectedMethod = ctxPath === '/status' || ctxPath === '/tree' ? 'GET' : 'POST';
      if (req.method !== expectedMethod) {
        res.setHeader('Allow', expectedMethod);
        json(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED', message: `${ctxPath} requires ${expectedMethod}` });
        return;
      }

      let body: unknown;
      if (expectedMethod === 'POST') {
        body = await readJsonBody(req, deps.maxBodyBytes ?? 1024 * 1024, deps.bodyTimeoutMs ?? 10_000);
      }

      const controller = new AbortController();
      const timeoutMs = Math.max(1, deps.handlerTimeoutMs ?? 120_000);
      const timeout = expectedMethod === 'GET'
        ? setTimeout(() => controller.abort(), timeoutMs)
        : undefined;
      try {
        const handlerResult = Promise.resolve(handler({
          method: req.method ?? 'GET',
          url: fullUrl,
          path: ctxPath,
          query: urlObj.searchParams,
          body,
          token: token ?? '',
          signal: controller.signal,
        }));
        const result = expectedMethod === 'GET'
          ? await Promise.race([handlerResult, new Promise<never>((_resolve, rejectTimeout) => {
            controller.signal.addEventListener('abort', () => {
              rejectTimeout(new HttpError('REQUEST_TIMEOUT', 'Request timed out', 504));
            }, { once: true });
          })])
          : await handlerResult;
        json(res, 200, result);
      } catch (err: unknown) {
        const normalized = normalizeHttpError(err);
        console.error('[sync/server] handler error:', err);
        json(res, normalized.status, { ok: false, code: normalized.code, message: normalized.message });
      } finally {
        if (timeout) clearTimeout(timeout);
      }
}

async function readJsonBody(
  req: http.IncomingMessage,
  maxBodyBytes: number,
  timeoutMs: number,
): Promise<unknown> {
  const declaredLength = Number(req.headers['content-length'] ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) {
    req.resume();
    throw new HttpError('BODY_TOO_LARGE', 'Request body is too large', 413);
  }
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let received = 0;
    const timeout = setTimeout(() => finish(new HttpError('BODY_TIMEOUT', 'Request body timed out', 408)), timeoutMs);
    const finish = (error?: Error, value?: unknown): void => {
      clearTimeout(timeout);
      req.removeListener('data', onData);
      req.removeListener('end', onEnd);
      req.removeListener('error', onError);
      if (error) {
        req.resume();
        reject(error);
      } else resolve(value);
    };
    const onData = (chunk: Buffer): void => {
      received += chunk.length;
      if (received > maxBodyBytes) {
        finish(new HttpError('BODY_TOO_LARGE', 'Request body is too large', 413));
        return;
      }
      chunks.push(Buffer.from(chunk));
    };
    const onEnd = (): void => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return finish(undefined, undefined);
      try {
        finish(undefined, JSON.parse(raw));
      } catch {
        finish(new HttpError('BAD_JSON', 'Invalid JSON body', 400));
      }
    };
    const onError = (error: Error): void => finish(error);
    req.on('data', onData);
    req.on('end', onEnd);
    req.on('error', onError);
  });
}

function normalizeHttpError(error: unknown): { code: string; status: number; message: string } {
  return {
    code: typeof (error as { code?: unknown })?.code === 'string' ? (error as { code: string }).code : 'INTERNAL',
    status: typeof (error as { status?: unknown })?.status === 'number' ? (error as { status: number }).status : 500,
    message: error instanceof Error ? error.message : String(error),
  };
}

/** 构造错误（带 code/status）。 */
export class HttpError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
