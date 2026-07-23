"use strict";
(() => {
  // src/content/content.ts
  var FAB_ID = "feishu-sync-fab";
  var LABEL_ID = "feishu-sync-fab-label";
  var FAB_SIZE = 52;
  var DEFAULT_AI_EXCERPT_CHARS = 4e3;
  var LS_KEY = "feishu-sync-fab-pos";
  var CAT_ICON = `<svg viewBox="0 0 32 32" width="26" height="26">
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
  <!-- \u8EAB\u4F53 -->
  <circle cx="16" cy="17" r="13" fill="url(#cat-body)"/>
  <!-- \u8033\u6735 -->
  <path d="M8 9 L5 3 L12 8Z" fill="#06A050"/>
  <path d="M24 9 L27 3 L20 8Z" fill="#06A050"/>
  <!-- \u5185\u8033 -->
  <path d="M9 8 L7 4 L12 8Z" fill="#FFD700" opacity="0.6"/>
  <path d="M23 8 L25 4 L20 8Z" fill="#FFD700" opacity="0.6"/>
  <!-- \u773C\u775B -->
  <ellipse cx="11" cy="14" rx="2" ry="2.5" fill="white"/>
  <ellipse cx="21" cy="14" rx="2" ry="2.5" fill="white"/>
  <circle cx="11.5" cy="14" r="1.2" fill="#191919"/>
  <circle cx="21.5" cy="14" r="1.2" fill="#191919"/>
  <!-- \u9AD8\u5149 -->
  <circle cx="12" cy="13.2" r="0.4" fill="white"/>
  <circle cx="22" cy="13.2" r="0.4" fill="white"/>
  <!-- \u9F3B\u5B50 -->
  <circle cx="16" cy="17" r="1.2" fill="#FF6B6B"/>
  <!-- \u5634\u5DF4 -->
  <path d="M13 17.5 Q16 21 19 17.5" fill="none" stroke="white" stroke-width="0.8" stroke-linecap="round"/>
  <!-- \u94C3\u94DB -->
  <circle cx="16" cy="22" r="2.5" fill="url(#cat-bell)"/>
  <circle cx="16" cy="22.8" r="0.4" fill="#8B6914"/>
  <!-- \u80E1\u987B -->
  <line x1="7" y1="16" x2="10" y2="17" stroke="white" stroke-width="0.5" opacity="0.7"/>
  <line x1="7" y1="18" x2="10" y2="18" stroke="white" stroke-width="0.5" opacity="0.7"/>
  <line x1="25" y1="16" x2="22" y2="17" stroke="white" stroke-width="0.5" opacity="0.7"/>
  <line x1="25" y1="18" x2="22" y2="18" stroke="white" stroke-width="0.5" opacity="0.7"/>
</svg>`;
  var SYNC_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16"/>
</svg>`;
  var SPINNER_ICON = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
  <path d="M16 4a12 12 0 0 1 12 12" class="fab-spinner-arc"/>
</svg>`;
  var CHECK_ICON = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#07C160" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="6 16 14 24 26 8"/>
</svg>`;
  var ERROR_ICON = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#E24B4A" stroke-width="2.5" stroke-linecap="round">
  <line x1="10" y1="10" x2="22" y2="22"/><line x1="22" y1="10" x2="10" y2="22"/>
</svg>`;
  function loadPosition() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.left === "number" && typeof parsed.top === "number") return parsed;
      }
    } catch {
    }
    return { left: 0, top: 0, dock: "floating" };
  }
  function savePosition(pos) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(pos));
    } catch {
    }
  }
  function defaultPosition() {
    return {
      left: window.innerWidth - FAB_SIZE - 16,
      top: window.innerHeight - FAB_SIZE - 100,
      dock: "floating"
    };
  }
  function computeSnap(pos) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = pos.left + FAB_SIZE / 2;
    let left = Math.max(0, Math.min(pos.left, w - FAB_SIZE));
    let top = Math.max(0, Math.min(pos.top, h - FAB_SIZE));
    let dock = "floating";
    const distLeft = cx;
    const distRight = w - cx;
    const threshold = w * 0.4;
    if (distLeft < threshold) {
      dock = "left";
    } else if (distRight < threshold) {
      dock = "right";
    }
    return { left, top, dock };
  }
  function applySnap(fab, pos) {
    fab.style.left = "";
    fab.style.right = "";
    if (pos.dock === "left") {
      fab.style.top = `${pos.top}px`;
      fab.dataset.dock = "left";
    } else if (pos.dock === "right") {
      fab.style.top = `${pos.top}px`;
      fab.dataset.dock = "right";
    } else {
      fab.dataset.dock = "floating";
      fab.style.left = `${pos.left}px`;
      fab.style.top = `${pos.top}px`;
    }
  }
  function createOrGetLabel() {
    const existing = document.getElementById(LABEL_ID);
    if (existing) return existing;
    const label = document.createElement("div");
    label.id = LABEL_ID;
    label.className = "feishu-sync-fab-label";
    label.innerHTML = `${SYNC_ICON}\u540C\u6B65\u5230 Obsidian`;
    document.body.appendChild(label);
    return label;
  }
  function updateLabelPosition(fab, label) {
    const rect = fab.getBoundingClientRect();
    const fabCenterX = rect.left + rect.width / 2;
    const fabCenterY = rect.top + rect.height / 2;
    const dock = fab.dataset.dock;
    if (dock === "left") {
      label.style.left = `${rect.right + 10}px`;
      label.style.top = `${fabCenterY}px`;
      label.style.transform = "translateY(-50%)";
    } else if (dock === "right") {
      label.style.left = "";
      label.style.right = `${window.innerWidth - rect.left + 10}px`;
      label.style.top = `${fabCenterY}px`;
      label.style.transform = "translateY(-50%)";
      label.style.right = "";
      label.style.left = `${rect.left - 10}px`;
      label.style.transform = "translate(-100%, -50%)";
    } else {
      label.style.left = `${fabCenterX}px`;
      label.style.top = `${rect.top - 10}px`;
      label.style.transform = "translate(-50%, -100%)";
    }
  }
  function showLabel(fab) {
    const label = createOrGetLabel();
    updateLabelPosition(fab, label);
    label.classList.add("is-visible");
  }
  function hideLabel() {
    const label = document.getElementById(LABEL_ID);
    if (label) label.classList.remove("is-visible");
  }
  var dragState = null;
  function setupDrag(fab) {
    fab.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      fab.setPointerCapture(e.pointerId);
      fab.classList.add("is-dragging");
      hideLabel();
      const rect = fab.getBoundingClientRect();
      dragState = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startLeft: rect.left,
        startTop: rect.top,
        moved: false
      };
    });
    fab.addEventListener("pointermove", (e) => {
      if (!dragState || e.pointerId !== dragState.pointerId) return;
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist < 3) return;
      dragState.moved = true;
      let newLeft = dragState.startLeft + dx;
      let newTop = dragState.startTop + dy;
      const maxLeft = window.innerWidth - FAB_SIZE;
      const maxTop = window.innerHeight - FAB_SIZE;
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));
      fab.dataset.dock = "floating";
      fab.style.left = `${newLeft}px`;
      fab.style.top = `${newTop}px`;
      fab.style.right = "";
      dragState.startLeft = newLeft;
      dragState.startTop = newTop;
      dragState.startX = e.clientX;
      dragState.startY = e.clientY;
    });
    fab.addEventListener("pointerup", (e) => {
      if (!dragState || e.pointerId !== dragState.pointerId) return;
      const wasMoved = dragState.moved;
      const currentRect = fab.getBoundingClientRect();
      const pos = {
        left: currentRect.left,
        top: currentRect.top,
        dock: "floating"
      };
      fab.classList.remove("is-dragging");
      const snapped = computeSnap(pos);
      savePosition(snapped);
      fab.classList.add("is-snapping");
      applySnap(fab, snapped);
      setTimeout(() => fab.classList.remove("is-snapping"), 500);
      dragState = null;
      fab.releasePointerCapture(e.pointerId);
      if (!wasMoved) {
        onSyncClick();
      }
    });
    fab.addEventListener("pointercancel", () => {
      if (dragState) {
        fab.classList.remove("is-dragging");
        dragState = null;
      }
    });
  }
  function extractTokenFromUrl() {
    const url = window.location.href;
    const wikiMatch = url.match(/\/wiki\/([A-Za-z0-9]+)/);
    if (wikiMatch) return { node_token: wikiMatch[1] };
    const docxMatch = url.match(/\/(?:docx|doc)\/([A-Za-z0-9]+)/);
    if (docxMatch) return { obj_token: docxMatch[1] };
    return null;
  }
  function isDocPage() {
    return /\/(wiki|docx|doc)\//.test(window.location.pathname);
  }
  function getDocumentTitle() {
    const candidates = [
      document.querySelector(".doc-title"),
      document.querySelector(".wiki-title"),
      document.querySelector('[data-testid="doc-title"]'),
      document.querySelector("h1")
    ];
    const title = candidates.map((el) => el?.innerText?.trim()).find(Boolean);
    return title || document.title.replace(/\s*[-|].*$/, "").trim() || "\u672A\u547D\u540D\u98DE\u4E66\u6587\u6863";
  }
  function getDocumentExcerpt(limit = DEFAULT_AI_EXCERPT_CHARS) {
    const candidates = [
      document.querySelector('[data-testid="doc-content"]'),
      document.querySelector(".docx-content"),
      document.querySelector(".wiki-content"),
      document.querySelector(".suite-web-doc-body"),
      document.querySelector("main"),
      document.body
    ];
    const text = candidates.map((el) => el?.innerText || el?.textContent || "").map((value) => value.replace(/\s+/g, " ").trim()).find((value) => value.length > 80) || document.body.innerText.replace(/\s+/g, " ").trim();
    return text.slice(0, limit);
  }
  function injectFab() {
    if (document.getElementById(FAB_ID)) return;
    if (!isDocPage()) return;
    const fab = document.createElement("div");
    fab.id = FAB_ID;
    fab.className = "feishu-sync-fab";
    fab.innerHTML = CAT_ICON;
    fab.setAttribute("role", "button");
    fab.setAttribute("aria-label", "\u540C\u6B65\u5230 Obsidian");
    fab.setAttribute("tabindex", "0");
    const saved = loadPosition();
    const pos = saved.dock !== "floating" ? saved : defaultPosition();
    document.body.appendChild(fab);
    applySnap(fab, pos);
    if (pos.dock === "floating") {
      fab.style.left = `${pos.left}px`;
      fab.style.top = `${pos.top}px`;
    }
    savePosition(pos);
    setupDrag(fab);
    fab.addEventListener("pointerenter", () => {
      if (!dragState) showLabel(fab);
    });
    fab.addEventListener("pointerleave", () => hideLabel());
    console.log("[feishu-sync] draggable FAB injected");
  }
  async function onSyncClick() {
    const tokenInfo = extractTokenFromUrl();
    if (!tokenInfo?.node_token && !tokenInfo?.obj_token) {
      showToast("\u65E0\u6CD5\u8BC6\u522B\u5F53\u524D\u98DE\u4E66\u6587\u6863 token", "error");
      return;
    }
    const docTitle = getDocumentTitle();
    const nodeToken = tokenInfo.node_token || tokenInfo.obj_token;
    const fab = document.getElementById(FAB_ID);
    if (!fab) return;
    setFabState("syncing", fab);
    try {
      const response = await chrome.runtime.sendMessage({
        type: "feishu-sync-trigger",
        payload: {
          directSync: true,
          nodeToken,
          title: docTitle,
          url: window.location.href,
          docToken: tokenInfo,
          domain: window.location.hostname
        }
      });
      if (!response?.ok || !response.result?.path) {
        throw new Error(response?.error || "Obsidian \u672A\u8FD4\u56DE\u6700\u7EC8\u6587\u4EF6\u8DEF\u5F84\u3002");
      }
      setFabState("success", fab);
      showToast(`\u5DF2\u540C\u6B65\uFF1A${response.result.path}`);
      setTimeout(() => setFabState("idle", fab), 2e3);
    } catch (error) {
      setFabState("error", fab);
      showToast(`\u540C\u6B65\u5931\u8D25\uFF1A${error instanceof Error ? error.message : String(error)}`, "error");
      setTimeout(() => setFabState("idle", fab), 3e3);
    }
  }
  function setFabState(state, fab) {
    fab.classList.remove("syncing", "success", "error");
    switch (state) {
      case "idle":
        fab.innerHTML = CAT_ICON;
        break;
      case "syncing":
        fab.classList.add("syncing");
        fab.innerHTML = SPINNER_ICON;
        break;
      case "success":
        fab.classList.add("success");
        fab.innerHTML = CHECK_ICON;
        break;
      case "error":
        fab.classList.add("error");
        fab.innerHTML = ERROR_ICON;
        break;
    }
  }
  function showToast(message, type = "info") {
    const existing = document.querySelector(".feishu-sync-toast");
    if (existing) {
      existing.classList.add("feishu-sync-toast-closing");
      existing.addEventListener("animationend", () => existing.remove(), { once: true });
    }
    const toast = document.createElement("div");
    toast.className = `feishu-sync-toast feishu-sync-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add("feishu-sync-toast-closing");
        toast.addEventListener("animationend", () => toast.remove(), { once: true });
      }
    }, 4e3);
  }
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "GET_FEISHU_DOC_EXCERPT") return false;
    const limit = Number(message.limit) || DEFAULT_AI_EXCERPT_CHARS;
    sendResponse({
      ok: true,
      title: getDocumentTitle(),
      excerpt: getDocumentExcerpt(limit)
    });
    return false;
  });
  var lastPath = "";
  function watchRoute() {
    const check = () => {
      const path = window.location.pathname;
      if (path !== lastPath) {
        lastPath = path;
        document.getElementById(FAB_ID)?.remove();
        document.getElementById(LABEL_ID)?.remove();
        if (isDocPage()) {
          setTimeout(injectFab, 1200);
        }
      }
    };
    window.addEventListener("popstate", check);
    window.addEventListener("hashchange", check);
    new MutationObserver(check).observe(document.body, { childList: true, subtree: true });
    check();
  }
  watchRoute();
  console.log("[feishu-sync] content script loaded");
})();
//# sourceMappingURL=content.js.map
