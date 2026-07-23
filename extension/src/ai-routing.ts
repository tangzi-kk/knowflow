export type AiProvider =
  | 'gemini-api'
  | 'openai'
  | 'deepseek'
  | 'custom'
  | 'gemini-nano'
  | 'gemini-web'
  | 'deepseek-web';

export type AiRoute =
  | { kind: 'gemini-web'; model: string }
  | { kind: 'deepseek-web'; model: string }
  | { kind: 'gemini-api'; endpoint: string; model: string; requiresApiKey: true }
  | { kind: 'openai-compatible'; endpoint: string; model: string; requiresApiKey: boolean }
  | { kind: 'unsupported'; model: string };

export const GEMINI_WEB_MODELS: Record<string, {
  hash: string;
  label: string;
  aliases: readonly string[];
  mode: number;
}> = {
  fbb127bbb056c959: {
    hash: 'fbb127bbb056c959',
    label: '3.6 Flash',
    aliases: ['gemini-3.6-flash', 'gemini-3-flash-thinking'],
    mode: 1,
  },
  cf41b0e0dd7d53e5: {
    hash: 'cf41b0e0dd7d53e5',
    label: '3.5 Flash-Lite',
    aliases: ['gemini-3.5-flash-lite'],
    mode: 6,
  },
  e6fa609c3fa255c0: {
    hash: 'e6fa609c3fa255c0',
    label: '3.1 Pro',
    aliases: ['gemini-3.1-pro', 'gemini-3-pro'],
    mode: 3,
  },
};

const DEFAULT_GEMINI_WEB_MODEL = 'fbb127bbb056c959';
const LEGACY_GEMINI_WEB_MODELS = new Set([
  '56fdd199312815e2',
  '8c46e95b1a07cecc',
]);

const GEMINI_WEB_ALIASES = new Map<string, string>();
for (const model of Object.values(GEMINI_WEB_MODELS)) {
  GEMINI_WEB_ALIASES.set(model.hash, model.hash);
  for (const alias of model.aliases) GEMINI_WEB_ALIASES.set(alias, model.hash);
}

function modelOrDefault(model: string | undefined, fallback: string): string {
  const value = model?.trim() || '';
  return !value || LEGACY_GEMINI_WEB_MODELS.has(value) ? fallback : value;
}

function chatCompletionsEndpoint(baseUrl: string): string {
  const normalized = baseUrl.trim().replace(/\/+$/, '');
  if (!normalized) return '';
  return normalized.endsWith('/chat/completions')
    ? normalized
    : `${normalized}/chat/completions`;
}

export function resolveAiRoute(config: {
  provider: AiProvider;
  baseUrl?: string;
  model?: string;
}): AiRoute {
  if (config.provider === 'gemini-web') {
    const requested = config.model?.trim() || '';
    return {
      kind: 'gemini-web',
      model: GEMINI_WEB_ALIASES.get(requested) || DEFAULT_GEMINI_WEB_MODEL,
    };
  }

  if (config.provider === 'deepseek-web') {
    return { kind: 'deepseek-web', model: 'deepseek-chat' };
  }

  if (config.provider === 'gemini-nano') {
    return { kind: 'unsupported', model: config.model?.trim() || 'gemini-nano' };
  }

  if (config.provider === 'gemini-api') {
    const model = modelOrDefault(config.model, 'gemini-3.6-flash');
    return {
      kind: 'gemini-api',
      endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      model,
      requiresApiKey: true,
    };
  }

  const isOpenAi = config.provider === 'openai';
  const isDeepSeek = config.provider === 'deepseek';
  const defaultBaseUrl = isOpenAi
    ? 'https://api.openai.com/v1'
    : isDeepSeek
      ? 'https://api.deepseek.com'
      : '';
  const endpoint = chatCompletionsEndpoint(config.baseUrl || defaultBaseUrl);
  const model = modelOrDefault(
    config.model,
    isOpenAi ? 'gpt-4o-mini' : isDeepSeek ? 'deepseek-chat' : 'gpt-4o-mini',
  );

  return {
    kind: 'openai-compatible',
    endpoint,
    model,
    requiresApiKey: config.provider !== 'custom',
  };
}
