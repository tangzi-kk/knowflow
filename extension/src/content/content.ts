/**
 * Content script — 注入飞书文档页。
 *
 * 交互模式（参考微信悬浮球 / Lark 浮动入口）：
 * 1. 圆形绿色悬浮球（含猫吉祥物），初始位置右下
 * 2. 鼠标 / 触摸拖拽自由移动
 * 3. 释放后自动吸附到最近边缘（左/右），仅露出 ~12px 半隐藏
 * 4. hover 时完整滑出显示 → 出现「同步到 Obsidian」标签
 * 5. 点击 → obsidian:// 协议主通道 + Sidepanel 降级
 * 6. 位置持久化到 localStorage
 */
import './content.css';
import { buildObsidianLarkDocUri } from '@sync/shared';

const FAB_ID = 'feishu-sync-fab';
const LABEL_ID = 'feishu-sync-fab-label';
const FAB_SIZE = 52;
const DEFAULT_AI_EXCERPT_CHARS = 4000;
const LS_KEY = 'feishu-sync-fab-pos';

/* ──────────── Doraemon 风格猫吉祥物 SVG ──────────── */
const CAT_ICON = `<svg viewBox="0 0 32 32" width="26" height="26">
  <defs>
    <radialGradient id="cat-body" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#41C978"/>
      <stop offset="100%" stop-color="#07C160"/>
    </radialGradient>
    <radialGradient id="cat-bell" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#FFA500"/>
    </radialGradient>
  </defs>
  <!-- 身体 -->
  <circle cx="16" cy="17" r="13" fill="url(#cat-body)"/>
  <!-- 耳朵 -->
  <path d="M8 9 L5 3 L12 8Z" fill="#06A050"/>
  <path d="M24 9 L27 3 L20 8Z" fill="#06A050"/>
  <!-- 内耳 -->
  <path d="M9 8 L7 4 L12 8Z" fill="#FFD700" opacity="0.6"/>
  <path d="M23 8 L25 4 L20 8Z" fill="#FFD700" opacity="0.6"/>
  <!-- 眼睛 -->
  <ellipse cx="11" cy="14" rx="2" ry="2.5" fill="white"/>
  <ellipse cx="21" cy="14" rx="2" ry="2.5" fill="white"/>
  <circle cx="11.5" cy="14" r="1.2" fill="#191919"/>
  <circle cx="21.5" cy="14" r="1.2" fill="#191919"/>
  <!-- 高光 -->
  <circle cx="12" cy="13.2" r="0.4" fill="white"/>
  <circle cx="22" cy="13.2" r="0.4" fill="white"/>
  <!-- 鼻子 -->
  <circle cx="16" cy="17" r="1.2" fill="#FF6B6B"/>
  <!-- 嘴巴 -->
  <path d="M13 17.5 Q16 21 19 17.5" fill="none" stroke="white" stroke-width="0.8" stroke-linecap="round"/>
  <!-- 铃铛 -->
  <circle cx="16" cy="22" r="2.5" fill="url(#cat-bell)"/>
  <circle cx="16" cy="22.8" r="0.4" fill="#8B6914"/>
  <!-- 胡须 -->
  <line x1="7" y1="16" x2="10" y2="17" stroke="white" stroke-width="0.5" opacity="0.7"/>
  <line x1="7" y1="18" x2="10" y2="18" stroke="white" stroke-width="0.5" opacity="0.7"/>
  <line x1="25" y1="16" x2="22" y2="17" stroke="white" stroke-width="0.5" opacity="0.7"/>
  <line x1="25" y1="18" x2="22" y2="18" stroke="white" stroke-width="0.5" opacity="0.7"/>
</svg>`;

const SYNC_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16"/>
</svg>`;

const SPINNER_ICON = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
  <path d="M16 4a12 12 0 0 1 12 12" class="fab-spinner-arc"/>
</svg>`;

const CHECK_ICON = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#07C160" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="6 16 14 24 26 8"/>
</svg>`;

const ERROR_ICON = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#E24B4A" stroke-width="2.5" stroke-linecap="round">
  <line x1="10" y1="10" x2="22" y2="22"/><line x1="22" y1="10" x2="10" y2="22"/>
</svg>`;

/* ──────────── 位置持久化 ──────────── */
interface FabPosition {
  left: number;
  top: number;
  dock: 'left' | 'right' | 'floating';
}

function loadPosition(): FabPosition {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FabPosition;
      if (typeof parsed.left === 'number' && typeof parsed.top === 'number') return parsed;
    }
  } catch { /* ignore */ }
  return { left: 0, top: 0, dock: 'floating' };
}

function savePosition(pos: FabPosition): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(pos)); } catch { /* ignore */ }
}

function defaultPosition(): FabPosition {
  return {
    left: window.innerWidth - FAB_SIZE - 16,
    top: window.innerHeight - FAB_SIZE - 100,
    dock: 'floating',
  };
}

/* ──────────── 边缘吸附计算 ──────────── */
function computeSnap(pos: FabPosition): FabPosition {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const cx = pos.left + FAB_SIZE / 2;

  // 夹持边界
  let left = Math.max(0, Math.min(pos.left, w - FAB_SIZE));
  let top = Math.max(0, Math.min(pos.top, h - FAB_SIZE));
  let dock: FabPosition['dock'] = 'floating';

  // 判断贴合哪侧
  const distLeft = cx;
  const distRight = w - cx;
  const threshold = w * 0.4;

  if (distLeft < threshold) {
    dock = 'left';
  } else if (distRight < threshold) {
    dock = 'right';
  }

  return { left, top, dock };
}

function applySnap(fab: HTMLElement, pos: FabPosition): void {
  // 先移除贴合样式
  fab.style.left = '';
  fab.style.right = '';

  if (pos.dock === 'left') {
    fab.style.top = `${pos.top}px`;
    fab.dataset.dock = 'left';
    // 贴合模式由 CSS 处理 (left: -36px / hover: left: 8px)
  } else if (pos.dock === 'right') {
    fab.style.top = `${pos.top}px`;
    fab.dataset.dock = 'right';
  } else {
    fab.dataset.dock = 'floating';
    fab.style.left = `${pos.left}px`;
    fab.style.top = `${pos.top}px`;
  }
}

/* ──────────── 悬浮标签 ──────────── */
function createOrGetLabel(): HTMLElement {
  const existing = document.getElementById(LABEL_ID);
  if (existing) return existing;
  const label = document.createElement('div');
  label.id = LABEL_ID;
  label.className = 'feishu-sync-fab-label';
  label.innerHTML = `${SYNC_ICON}同步到 Obsidian`;
  document.body.appendChild(label);
  return label;
}

function updateLabelPosition(fab: HTMLElement, label: HTMLElement): void {
  const rect = fab.getBoundingClientRect();
  const fabCenterX = rect.left + rect.width / 2;
  const fabCenterY = rect.top + rect.height / 2;
  const dock = fab.dataset.dock;

  if (dock === 'left') {
    label.style.left = `${rect.right + 10}px`;
    label.style.top = `${fabCenterY}px`;
    label.style.transform = 'translateY(-50%)';
  } else if (dock === 'right') {
    label.style.left = '';
    label.style.right = `${window.innerWidth - rect.left + 10}px`;
    label.style.top = `${fabCenterY}px`;
    label.style.transform = 'translateY(-50%)';
    label.style.right = '';
    // ensure right positioning
    label.style.left = `${rect.left - 10}px`;
    label.style.transform = 'translate(-100%, -50%)';
  } else {
    label.style.left = `${fabCenterX}px`;
    label.style.top = `${rect.top - 10}px`;
    label.style.transform = 'translate(-50%, -100%)';
  }
}

function showLabel(fab: HTMLElement): void {
  const label = createOrGetLabel();
  updateLabelPosition(fab, label);
  label.classList.add('is-visible');
}

function hideLabel(): void {
  const label = document.getElementById(LABEL_ID);
  if (label) label.classList.remove('is-visible');
}

/* ──────────── 拖拽系统 ──────────── */
interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  startLeft: number;
  startTop: number;
  moved: boolean;
}

let dragState: DragState | null = null;

function setupDrag(fab: HTMLElement): void {
  fab.addEventListener('pointerdown', (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return; // 仅左键

    e.preventDefault();
    fab.setPointerCapture(e.pointerId);
    fab.classList.add('is-dragging');
    hideLabel();

    const rect = fab.getBoundingClientRect();
    dragState = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      moved: false,
    };
  });

  fab.addEventListener('pointermove', (e: PointerEvent) => {
    if (!dragState || e.pointerId !== dragState.pointerId) return;

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const dist = Math.abs(dx) + Math.abs(dy);

    if (dist < 3) return; // 防抖
    dragState.moved = true;

    let newLeft = dragState.startLeft + dx;
    let newTop = dragState.startTop + dy;

    // 夹持边界
    const maxLeft = window.innerWidth - FAB_SIZE;
    const maxTop = window.innerHeight - FAB_SIZE;
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    fab.dataset.dock = 'floating';
    fab.style.left = `${newLeft}px`;
    fab.style.top = `${newTop}px`;
    fab.style.right = '';

    // 更新拖拽状态中的起始位置（连续移动时）
    dragState.startLeft = newLeft;
    dragState.startTop = newTop;
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;
  });

  fab.addEventListener('pointerup', (e: PointerEvent) => {
    if (!dragState || e.pointerId !== dragState.pointerId) return;

    const wasMoved = dragState.moved;
    const currentRect = fab.getBoundingClientRect();
    const pos: FabPosition = {
      left: currentRect.left,
      top: currentRect.top,
      dock: 'floating',
    };

    fab.classList.remove('is-dragging');

    // 计算吸附
    const snapped = computeSnap(pos);
    savePosition(snapped);

    // 吸附动画
    fab.classList.add('is-snapping');
    applySnap(fab, snapped);

    // 动画完成后去除 class
    setTimeout(() => fab.classList.remove('is-snapping'), 500);

    dragState = null;
    fab.releasePointerCapture(e.pointerId);

    // 如果没移动 → 触发同步点击
    if (!wasMoved) {
      onSyncClick();
    }
  });

  fab.addEventListener('pointercancel', () => {
    if (dragState) {
      fab.classList.remove('is-dragging');
      dragState = null;
    }
  });
}

/* ──────────── token 提取 ──────────── */
function extractTokenFromUrl(): { node_token?: string; obj_token?: string } | null {
  const url = window.location.href;
  const wikiMatch = url.match(/\/wiki\/([A-Za-z0-9]+)/);
  if (wikiMatch) return { node_token: wikiMatch[1] };
  const docxMatch = url.match(/\/(?:docx|doc)\/([A-Za-z0-9]+)/);
  if (docxMatch) return { obj_token: docxMatch[1] };
  return null;
}

function isDocPage(): boolean {
  return /\/(wiki|docx|doc)\//.test(window.location.pathname);
}

function getDocumentTitle(): string {
  const candidates = [
    document.querySelector<HTMLElement>('.doc-title'),
    document.querySelector<HTMLElement>('.wiki-title'),
    document.querySelector<HTMLElement>('[data-testid="doc-title"]'),
    document.querySelector<HTMLElement>('h1'),
  ];
  const title = candidates
    .map((el) => el?.innerText?.trim())
    .find(Boolean);
  return title || document.title.replace(/\s*[-|].*$/, '').trim() || '未命名飞书文档';
}

function getDocumentExcerpt(limit = DEFAULT_AI_EXCERPT_CHARS): string {
  const candidates = [
    document.querySelector<HTMLElement>('[data-testid="doc-content"]'),
    document.querySelector<HTMLElement>('.docx-content'),
    document.querySelector<HTMLElement>('.wiki-content'),
    document.querySelector<HTMLElement>('.suite-web-doc-body'),
    document.querySelector<HTMLElement>('main'),
    document.body,
  ];
  const text = candidates
    .map((el) => el?.innerText || el?.textContent || '')
    .map((value) => value.replace(/\s+/g, ' ').trim())
    .find((value) => value.length > 80)
    || document.body.innerText.replace(/\s+/g, ' ').trim();
  return text.slice(0, limit);
}

/* ──────────── 注入可拖拽悬浮球 ──────────── */
function injectFab(): void {
  if (document.getElementById(FAB_ID)) return;
  if (!isDocPage()) return;

  const fab = document.createElement('div');
  fab.id = FAB_ID;
  fab.className = 'feishu-sync-fab';
  fab.innerHTML = CAT_ICON;
  fab.setAttribute('role', 'button');
  fab.setAttribute('aria-label', '同步到 Obsidian');
  fab.setAttribute('tabindex', '0');

  // 恢复位置或使用默认
  const saved = loadPosition();
  const pos = saved.dock !== 'floating' ? saved : defaultPosition();

  // 先 append 到 body（必须存在才能读取尺寸）
  document.body.appendChild(fab);

  // 设置位置
  applySnap(fab, pos);
  if (pos.dock === 'floating') {
    fab.style.left = `${pos.left}px`;
    fab.style.top = `${pos.top}px`;
  }
  savePosition(pos);

  // 拖拽
  setupDrag(fab);

  // label hover
  fab.addEventListener('pointerenter', () => {
    if (!dragState) showLabel(fab);
  });
  fab.addEventListener('pointerleave', () => hideLabel());

  console.log('[feishu-sync] draggable FAB injected');
}

/* ──────────── 同步逻辑 ──────────── */
async function onSyncClick(): Promise<void> {
  const tokenInfo = extractTokenFromUrl();
  if (!tokenInfo?.node_token && !tokenInfo?.obj_token) {
    showToast('无法识别当前飞书文档 token', 'error');
    return;
  }

  const docTitle = getDocumentTitle();
  const nodeToken = tokenInfo.node_token || tokenInfo.obj_token!;
  const fab = document.getElementById(FAB_ID);
  if (!fab) return;

  const obsidianUri = buildObsidianLarkDocUri({
    token: nodeToken,
    node_token: tokenInfo.node_token,
    obj_token: tokenInfo.obj_token,
    title: docTitle,
    url: window.location.href,
  });

  // ★ 进入 syncing 状态
  setFabState('syncing', fab);

  // ★ 先走协议主通道
  tryOpenObsidianUri(obsidianUri);

  // ★ 等 3s 看是否有 sync-complete 回调（来自 sidepanel 或未来 /callback）
  let syncDone = false;
  const onSyncComplete = (msg: any) => {
    if (msg?.type === 'sync-complete' && msg?.payload?.token === nodeToken) {
      syncDone = true;
      if (msg.payload.success) {
        setFabState('success', fab);
        setTimeout(() => setFabState('idle', fab), 2000);
      } else {
        setFabState('error', fab);
        setTimeout(() => setFabState('idle', fab), 3000);
      }
    }
  };
  chrome.runtime.onMessage.addListener(onSyncComplete);

  // ★ 3s 后降级
  setTimeout(() => {
    chrome.runtime.onMessage.removeListener(onSyncComplete);
    if (syncDone) return;

    chrome.runtime.sendMessage({
      type: 'feishu-sync-trigger',
      payload: {
        title: docTitle,
        url: window.location.href,
        docToken: tokenInfo,
        domain: window.location.hostname,
        obsidianUri,
        protocolFailed: false,
      },
    }).then(() => {
      setFabState('success', fab);
      setTimeout(() => setFabState('idle', fab), 2000);
    }).catch(() => {
      setFabState('error', fab);
      showToast('同步失败。请打开 Obsidian 并在侧边栏手动同步。', 'error');
      setTimeout(() => setFabState('idle', fab), 3000);
    });
  }, 3000);
}

function setFabState(state: 'idle' | 'syncing' | 'success' | 'error', fab: HTMLElement): void {
  fab.classList.remove('syncing', 'success', 'error');
  switch (state) {
    case 'idle': fab.innerHTML = CAT_ICON; break;
    case 'syncing': fab.classList.add('syncing'); fab.innerHTML = SPINNER_ICON; break;
    case 'success': fab.classList.add('success'); fab.innerHTML = CHECK_ICON; break;
    case 'error': fab.classList.add('error'); fab.innerHTML = ERROR_ICON; break;
  }
}

function tryOpenObsidianUri(uri: string): boolean {
  try {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = uri;
    document.body.appendChild(iframe);
    setTimeout(() => iframe.remove(), 5000);
    return true;
  } catch {
    return false;
  }
}

/* ──────────── Toast ──────────── */
function showToast(message: string, type: 'info' | 'error' = 'info'): void {
  const existing = document.querySelector('.feishu-sync-toast');
  if (existing) {
    existing.classList.add('feishu-sync-toast-closing');
    existing.addEventListener('animationend', () => existing.remove(), { once: true });
  }

  const toast = document.createElement('div');
  toast.className = `feishu-sync-toast feishu-sync-toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('feishu-sync-toast-closing');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }
  }, 4000);
}

/* ──────────── 消息监听 ──────────── */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'GET_FEISHU_DOC_EXCERPT') return false;
  const limit = Number(message.limit) || DEFAULT_AI_EXCERPT_CHARS;
  sendResponse({
    ok: true,
    title: getDocumentTitle(),
    excerpt: getDocumentExcerpt(limit),
  });
  return false;
});

/* ──────────── SPA 路由监听 ──────────── */
let lastPath = '';
function watchRoute(): void {
  const check = () => {
    const path = window.location.pathname;
    if (path !== lastPath) {
      lastPath = path;
      // 清除旧 FAB / label
      document.getElementById(FAB_ID)?.remove();
      document.getElementById(LABEL_ID)?.remove();
      if (isDocPage()) {
        setTimeout(injectFab, 1200);
      }
    }
  };

  window.addEventListener('popstate', check);
  window.addEventListener('hashchange', check);
  new MutationObserver(check).observe(document.body, { childList: true, subtree: true });

  check();
}

/* ──────────── 启动 ──────────── */
watchRoute();
console.log('[feishu-sync] content script loaded');
