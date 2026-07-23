export {};

const BRIDGE_SOURCE = 'knowflow-deepseek-main';
const HOOK_KEY = '__knowflowDeepSeekFetchHookV1__';

function publishToken(token: string): void {
  if (token.length <= 20 || token.length >= 2000) return;
  window.postMessage({ source: BRIDGE_SOURCE, type: 'token', token }, window.location.origin);
}

function tokenFromStoredValue(value: string, allowRaw: boolean): string {
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'string') return parsed;
    return parsed?.access_token
      || parsed?.token
      || parsed?.data?.userToken
      || parsed?.userToken
      || '';
  } catch {
    return allowRaw ? value : '';
  }
}

function extractStoredToken(): string {
  const candidates: Array<[key: string, allowRaw: boolean]> = [
    ['userToken', true],
    ['ds_token', true],
    ['token', true],
    ['appearanceSettings', false],
    ['AGENT_MESSAGES', false],
  ];
  for (const [key, allowRaw] of candidates) {
    const value = localStorage.getItem(key);
    if (!value) continue;
    const token = tokenFromStoredValue(value, allowRaw);
    if (token.length > 20 && token.length < 2000) return token;
  }
  return '';
}

function installFetchHook(): void {
  const pageWindow = window as typeof window & Record<string, unknown>;
  if (pageWindow[HOOK_KEY] === true) return;
  pageWindow[HOOK_KEY] = true;

  const originalFetch = window.fetch;
  window.fetch = function (...args: Parameters<typeof fetch>): ReturnType<typeof fetch> {
    const [input, init] = args;
    const url = typeof input === 'string'
      ? input
      : input instanceof Request
        ? input.url
        : String(input);
    if (url.startsWith('https://chat.deepseek.com/api/')) {
      const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
      const authorization = headers.get('authorization') || '';
      if (authorization.startsWith('Bearer ')) publishToken(authorization.slice(7));
    }
    return originalFetch.apply(window, args);
  };
}

const storedToken = extractStoredToken();
if (storedToken) publishToken(storedToken);
installFetchHook();
