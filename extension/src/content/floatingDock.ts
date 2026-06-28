type DockAction =
  | 'clip'
  | 'browser-control'
  | 'page'
  | 'quote'
  | 'ocr'
  | 'screenshot-translate'
  | 'screen-shot';

const HOST_ID = '__fs_floating_dock_host';

const ICONS: Record<DockAction, string> = {
  clip: icon('<path d="M7 4l5-2a3 3 0 012 5l-8 8a4 4 0 01-6-6l7-7"/>'),
  'browser-control': icon('<path d="M3 2l11 7-5 1.2L6 15 3 2z"/>'),
  page: icon('<rect x="3" y="2" width="10" height="12" rx="1.5"/><path d="M5 5h6M5 8h6M5 11h4"/>'),
  quote: icon('<path d="M6 5H3v4h3v3H2V5h4zm8 0h-3v4h3v3h-4V5h4z"/>'),
  ocr: icon('<path d="M3 1H1v4M13 1h2v4M1 11v4h4M15 11v4h-4"/><path d="M5 8h6M8 5v6"/>'),
  'screenshot-translate': icon('<path d="M2 4h4l2 8H6L5 9H3l-1 3H0l3-8zm2 3h1L4.5 5.5 4 7zm7-3h4v2h-1l-1.5 6h-2L9 6H8V4h3z"/>'),
  'screen-shot': icon('<rect x="2" y="3" width="12" height="8" rx="1.5"/><path d="M6 14h4M8 11v3"/>'),
};

const LABELS: Record<DockAction, string> = {
  clip: '',
  'browser-control': '浏览器控制',
  page: '网页',
  quote: '引用',
  ocr: 'OCR',
  'screenshot-translate': '截图翻译',
  'screen-shot': '屏幕截图',
};

function icon(path: string): string {
  return `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

function getPageMetadata() {
  return {
    title: document.title,
    url: window.location.href,
    description:
      document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ||
      document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content ||
      '',
    text: window.getSelection()?.toString().trim() || '',
    favicon:
      document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.href ||
      `${window.location.origin}/favicon.ico`,
  };
}

function render(): void {
  if (document.getElementById(HOST_ID)) return;
  const host = document.createElement('div');
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = `
    :host {
      all: initial;
      position: fixed;
      left: 50%;
      bottom: 18px;
      transform: translateX(-50%);
      z-index: 2147483646;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
    }
    .dock {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 10px 18px;
      border-radius: 999px;
      background: rgba(255, 255, 255, .96);
      border: 1px solid rgba(0, 0, 0, .06);
      box-shadow: 0 10px 30px rgba(0, 0, 0, .14);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      pointer-events: auto;
      user-select: none;
    }
    button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 32px;
      border: none;
      background: transparent;
      color: #444;
      font: inherit;
      font-size: 18px;
      font-weight: 600;
      white-space: nowrap;
      cursor: pointer;
      transition: color .15s, transform .15s;
    }
    button:hover { color: #075ec8; transform: translateY(-1px); }
    svg { width: 24px; height: 24px; flex: 0 0 auto; }
    .icon-only { width: 34px; justify-content: center; padding: 0; }
    @media (max-width: 760px) {
      :host { bottom: 10px; }
      .dock { max-width: calc(100vw - 18px); gap: 10px; padding: 8px 10px; overflow-x: auto; }
      button { font-size: 14px; }
      svg { width: 20px; height: 20px; }
    }
    @media (prefers-color-scheme: dark) {
      .dock { background: rgba(30, 30, 30, .94); border-color: rgba(255,255,255,.08); }
      button { color: #e5e5e5; }
      button:hover { color: #6aa7ff; }
    }
  `;
  const dock = document.createElement('div');
  dock.className = 'dock';
  dock.innerHTML = (Object.keys(ICONS) as DockAction[])
    .map((action) => `<button class="${action === 'clip' ? 'icon-only' : ''}" data-action="${action}" title="${LABELS[action] || '剪藏'}">${ICONS[action]}${LABELS[action] ? `<span>${LABELS[action]}</span>` : ''}</button>`)
    .join('');
  dock.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest('button') as HTMLButtonElement | null;
    const action = button?.dataset.action as DockAction | undefined;
    if (action) dispatch(action);
  });
  dock.addEventListener('mousedown', (event) => event.preventDefault());
  shadow.append(style, dock);
  document.documentElement.appendChild(host);
}

function dispatch(action: DockAction): void {
  const meta = getPageMetadata();
  if (action === 'clip' || action === 'page' || action === 'quote') {
    chrome.runtime.sendMessage({
      type: 'clip-to-obsidian',
      payload: {
        text: action === 'quote' ? meta.text : '',
        title: meta.title,
        url: meta.url,
        description: meta.description,
        favicon: meta.favicon,
        domain: location.hostname,
      },
    });
    return;
  }
  chrome.runtime.sendMessage({
    type: 'ai-chat',
    payload: {
      action,
      text: meta.text,
      title: meta.title,
      url: meta.url,
      domain: location.hostname,
    },
  });
}

function remove(): void {
  document.getElementById(HOST_ID)?.remove();
}

render();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'toolbar-toggle') return false;
  if (message.payload?.enabled === false) remove();
  else render();
  sendResponse({ ok: true });
  return true;
});
