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
export function startServer(port: number, deps: ServerDeps): Promise<{ stop: () => Promise<void> }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
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

      // 解析 URL
      const fullUrl = req.url ?? '/';
      const urlObj = new URL(fullUrl, `http://localhost:${port}`);
      const ctxPath = urlObj.pathname;

      // 读取 body（POST/PUT）
      let body: unknown;
      if (req.method === 'POST' || req.method === 'PUT') {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk as Buffer);
        }
        const raw = Buffer.concat(chunks).toString('utf8');
        if (raw) {
          try {
            body = JSON.parse(raw);
          } catch {
            json(res, 400, { ok: false, code: 'BAD_JSON', message: 'Invalid JSON body' });
            return;
          }
        }
      }

      // 鉴权（/status 允许无 token 探测，但实际握手需要）
      const token = req.headers[TOKEN_HEADER.toLowerCase()] as string | undefined;
      if (ctxPath !== '/status' && !deps.validateToken(token ?? '')) {
        json(res, 401, { ok: false, code: 'UNAUTHORIZED', message: 'Invalid or missing X-Sync-Token' });
        return;
      }

      // 路由
      const handler = deps.routes.get(ctxPath);
      if (!handler) {
        json(res, 404, { ok: false, code: 'NOT_FOUND', message: `Unknown path: ${ctxPath}` });
        return;
      }

      try {
        const result = await handler({
          method: req.method ?? 'GET',
          url: fullUrl,
          path: ctxPath,
          query: urlObj.searchParams,
          body,
          token: token ?? '',
        });
        json(res, 200, result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        const code = (err as { code?: string })?.code ?? 'INTERNAL';
        const status = (err as { status?: number })?.status ?? 500;
        console.error('[sync/server] handler error:', err);
        json(res, status, { ok: false, code, message });
      }
    });

    server.on('error', (err) => {
      reject(err);
    });

    server.listen(port, '127.0.0.1', () => {
      console.log(`[sync/server] listening on http://127.0.0.1:${port}`);
      resolve({
        stop: () =>
          new Promise((res) => {
            server.close(() => {
              console.log(`[sync/server] stopped`);
              res();
            });
          }),
      });
    });
  });
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
