export {};

const BRIDGE_SOURCE = 'knowflow-deepseek-main';

window.addEventListener('message', (event: MessageEvent) => {
  if (event.source !== window || event.origin !== window.location.origin) return;
  const data = event.data as { source?: unknown; type?: unknown; token?: unknown } | null;
  if (
    !data
    || data.source !== BRIDGE_SOURCE
    || data.type !== 'token'
    || typeof data.token !== 'string'
    || data.token.length <= 20
    || data.token.length >= 2000
  ) return;

  chrome.runtime.sendMessage({
    type: 'set-deepseek-token',
    payload: { token: data.token },
  }).catch(() => undefined);
});
