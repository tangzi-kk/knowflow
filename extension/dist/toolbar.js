"use strict";
(() => {
  // src/content/toolbar.ts
  (function() {
    const MAIN_SCENE_IDS = ["save", "append", "refine"];
    const MORE_SCENE_IDS = ["translate-explain", "concept-card", "quote", "question", "copy", "open-sidepanel"];
    let state = "IDLE";
    let lastSelection = "";
    let host = null;
    let shadow = null;
    let lastPath = window.location.pathname;
    let resultTitle = "";
    let toolbarConfig = getDefaultToolbarConfig();
    let knowledgeScenes = getDefaultKnowledgeScenes();
    let moreOpen = false;
    function isFeishuDocPage() {
      const hostname = window.location.hostname;
      return /feishu\.cn|larksuite\.com/.test(hostname) && /\/(wiki|docx|doc)\//.test(window.location.pathname);
    }
    function extractDocToken() {
      const url = window.location.href;
      const wikiMatch = url.match(/\/wiki\/([A-Za-z0-9]+)/);
      if (wikiMatch)
        return { node_token: wikiMatch[1] };
      const docxMatch = url.match(/\/(?:docx|doc)\/([A-Za-z0-9]+)/);
      if (docxMatch)
        return { obj_token: docxMatch[1] };
      return null;
    }
    function getPageMetadata() {
      const description = document.querySelector('meta[name="description"]')?.content || document.querySelector(
        'meta[property="og:description"]'
      )?.content || "";
      const favicon = document.querySelector('link[rel="icon"]')?.href || document.querySelector('link[rel="shortcut icon"]')?.href || `${window.location.origin}/favicon.ico`;
      return {
        title: document.title,
        url: window.location.href,
        description,
        selectedText: lastSelection.trim(),
        favicon,
        domain: window.location.hostname
      };
    }
    function normalizeScene(scene, fallback) {
      return {
        id: scene.id || fallback?.id || "scene",
        label: scene.label || fallback?.label || "\u573A\u666F",
        action: scene.action || fallback?.action || "showResult",
        prompt: scene.prompt ?? fallback?.prompt ?? "{text}",
        enabled: scene.enabled ?? fallback?.enabled ?? true,
        defaultDir: scene.defaultDir ?? fallback?.defaultDir ?? "",
        defaultAppendPath: scene.defaultAppendPath ?? fallback?.defaultAppendPath ?? "",
        aiEnabled: scene.aiEnabled ?? fallback?.aiEnabled ?? true
      };
    }
    function normalizeScenes(input) {
      const defaults = getDefaultKnowledgeScenes();
      const fallbackById = new Map(defaults.map((scene) => [scene.id, scene]));
      const rawScenes = Array.isArray(input) && input.length > 0 ? input : defaults;
      const normalized = rawScenes.filter((scene) => Boolean(scene && typeof scene === "object")).map((scene) => normalizeScene(scene, scene.id ? fallbackById.get(scene.id) : void 0)).filter((scene) => scene.id);
      const existingIds = new Set(normalized.map((scene) => scene.id));
      for (const scene of defaults) {
        if (!existingIds.has(scene.id))
          normalized.push(scene);
      }
      return normalized;
    }
    function normalizeToolbarConfig(input) {
      const defaults = getDefaultToolbarConfig();
      if (!input || typeof input !== "object")
        return defaults;
      const value = input;
      return {
        enabled: value.enabled ?? defaults.enabled,
        defaultAction: value.defaultAction ?? defaults.defaultAction,
        saveBehavior: value.saveBehavior ?? defaults.saveBehavior,
        defaultAppendPath: value.defaultAppendPath ?? defaults.defaultAppendPath,
        aiBeforeSave: value.aiBeforeSave ?? defaults.aiBeforeSave,
        visibleActions: Array.isArray(value.visibleActions) && value.visibleActions.length > 0 ? value.visibleActions : defaults.visibleActions
      };
    }
    function loadToolbarSettings() {
      try {
        chrome.storage.sync.get(["contextScenes", "selectionToolbarConfig"], (result) => {
          toolbarConfig = normalizeToolbarConfig(result.selectionToolbarConfig);
          knowledgeScenes = normalizeScenes(result.contextScenes);
        });
      } catch {
        toolbarConfig = getDefaultToolbarConfig();
        knowledgeScenes = getDefaultKnowledgeScenes();
      }
    }
    function fillPrompt(template, text) {
      const metadata = getPageMetadata();
      const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      return String(template || "{text}").replace(/\{text\}/g, text).replace(/\{title\}/g, metadata.title).replace(/\{url\}/g, metadata.url).replace(/\{domain\}/g, metadata.domain).replace(/\{date\}/g, date);
    }
    const TOOLBAR_CSS = `
:host {
  all: initial;
  position: fixed;
  z-index: 2147483647;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Microsoft YaHei", "Helvetica Neue", sans-serif;
}
.capsule {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 20px;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.08),
    0 0 0 0.5px rgba(0, 0, 0, 0.04);
  user-select: none;
  pointer-events: auto;
  animation: capsule-in 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}
@keyframes capsule-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.capsule button {
  min-width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #444;
  transition: background 0.15s, color 0.15s, transform 0.15s;
  padding: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.capsule button.text {
  width: auto;
  border-radius: 15px;
  padding: 0 10px;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
}
.capsule button:hover {
  background: #f0f0f0;
  color: #07c160;
}
.capsule button:active {
  transform: scale(0.9);
}
.capsule .divider {
  width: 1px;
  height: 18px;
  background: rgba(0, 0, 0, 0.08);
  margin: 0 3px;
  flex-shrink: 0;
}
.capsule button.primary {
  background: #07c160;
  color: #fff;
  border-radius: 16px;
  width: auto;
  padding: 0 12px;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}
.more-wrap { position: relative; }
.more-menu {
  position: absolute;
  right: 0;
  top: 38px;
  display: grid;
  gap: 4px;
  min-width: 128px;
  padding: 6px;
  border-radius: 12px;
  background: rgba(255,255,255,.97);
  box-shadow: 0 10px 28px rgba(0,0,0,.14), 0 0 0 .5px rgba(0,0,0,.08);
}
.more-menu button {
  width: 100%;
  justify-content: flex-start;
  border-radius: 9px;
  padding: 0 8px;
}
.toast {
  margin-left: 6px;
  padding: 6px 8px;
  border-radius: 12px;
  background: #eef8f2;
  color: #058040;
  font-size: 12px;
  white-space: nowrap;
}
.capsule button.primary:hover {
  background: #06ad56;
  color: #fff;
}
.capsule button.copied {
  color: #07c160;
}
.result-window {
  width: min(360px, calc(100vw - 24px));
  max-height: min(360px, calc(100vh - 24px));
  overflow: hidden;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.14), 0 0 0 0.5px rgba(0, 0, 0, 0.08);
  pointer-events: auto;
}
.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  color: #222;
  font-size: 13px;
  font-weight: 600;
}
.result-close {
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #777;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}
.result-close:hover { background: #f0f0f0; color: #111; }
.result-body {
  max-height: 300px;
  overflow: auto;
  padding: 12px;
  color: #222;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
}
@media (prefers-color-scheme: dark) {
  .capsule {
    background: rgba(30, 30, 30, 0.92);
    box-shadow:
      0 2px 12px rgba(0, 0, 0, 0.3),
      0 0 0 0.5px rgba(255, 255, 255, 0.06);
  }
  .capsule button { color: #ccc; }
  .capsule button:hover { background: #333; color: #07c160; }
  .capsule .divider { background: rgba(255, 255, 255, 0.08); }
  .capsule button.primary { background: #07c160; color: #fff; }
  .capsule button.primary:hover { background: #06ad56; color: #fff; }
  .more-menu { background: rgba(30, 30, 30, 0.97); box-shadow: 0 10px 28px rgba(0,0,0,.35), 0 0 0 .5px rgba(255,255,255,.08); }
  .toast { background: #0D2B1A; color: #71D69A; }
  .result-window { background: rgba(30, 30, 30, 0.96); box-shadow: 0 10px 30px rgba(0,0,0,.35), 0 0 0 .5px rgba(255,255,255,.08); }
  .result-header { color: #f2f2f2; border-bottom-color: rgba(255,255,255,.08); }
  .result-close { color: #aaa; }
  .result-close:hover { background: #333; color: #fff; }
  .result-body { color: #eee; }
}
`;
    function iconSVG(path) {
      return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
    }
    const ICONS = {
      "translate-explain": iconSVG(
        '<path d="M1 4h4l2 6H5L4 8H2l-1 2H0l2-6zm2 3l1-2 1 2H3zm7-3h4v1h-1.5L11 10h-1l-1.5-5H7V4h4z"/>'
      ),
      refine: iconSVG(
        '<path d="M2 4h12M2 8h8M2 12h6"/><circle cx="13" cy="13" r="1.5"/>'
      ),
      "concept-card": iconSVG(
        '<circle cx="8" cy="8" r="6"/><path d="M8 11V8M8 5.5V5"/>'
      ),
      save: iconSVG(
        '<path d="M3 2v12l5-3 5 3V2a1 1 0 00-1-1H4a1 1 0 00-1 1z"/>'
      ),
      append: iconSVG(
        '<path d="M8 2v12"/><path d="M2 8h12"/><path d="M3 14h10"/>'
      ),
      copy: iconSVG(
        '<rect x="5" y="1" width="8" height="12" rx="1"/><path d="M3 4v10a1 1 0 001 1h8"/>'
      ),
      quote: iconSVG(
        '<path d="M5 5H3a2 2 0 00-2 2v2h4V5zM13 5h-2a2 2 0 00-2 2v2h4V5z"/>'
      ),
      question: iconSVG(
        '<circle cx="8" cy="8" r="6"/><path d="M6.5 6a1.8 1.8 0 113 1.3c-.8.5-1.3 1-1.3 1.9"/><path d="M8 12h.01"/>'
      ),
      "open-sidepanel": iconSVG(
        '<rect x="2" y="2" width="12" height="12" rx="1"/><path d="M6 2v12"/>'
      ),
      more: iconSVG(
        '<circle cx="3.5" cy="8" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="12.5" cy="8" r="1"/>'
      ),
      "feishu-sync": iconSVG(
        '<path d="M1 8a7 7 0 1114 0A7 7 0 011 8z"/><path d="M5 8l2 2 4-4"/>'
      )
    };
    function getDefaultToolbarConfig() {
      return {
        enabled: true,
        defaultAction: "append",
        saveBehavior: "confirmInSidepanel",
        defaultAppendPath: "",
        aiBeforeSave: false,
        visibleActions: [...MAIN_SCENE_IDS, ...MORE_SCENE_IDS]
      };
    }
    function getDefaultKnowledgeScenes() {
      return [
        { id: "save", label: "\u6536\u5B58", action: "save", prompt: "{text}", enabled: true, aiEnabled: false },
        { id: "append", label: "\u8865\u5145", action: "append", prompt: "{text}", enabled: true, aiEnabled: false },
        { id: "refine", label: "\u7CBE\u70BC", action: "refine", prompt: "\u8BF7\u628A\u4EE5\u4E0B\u5185\u5BB9\u6574\u7406\u6210 Obsidian \u77E5\u8BC6\u5361\u7247\uFF1A\n\n\u8F93\u51FA\u7ED3\u6784\uFF1A\n## \u6838\u5FC3\u89C2\u70B9\n## \u5173\u952E\u8981\u70B9\n## \u53EF\u590D\u7528\u542F\u53D1\n## \u76F8\u5173\u5173\u952E\u8BCD\n\n\u8981\u6C42\uFF1A\n- \u4E0D\u8981\u7A7A\u6CDB\u603B\u7ED3\u3002\n- \u4FDD\u7559\u6709\u4FE1\u606F\u5BC6\u5EA6\u7684\u539F\u53E5\u3002\n- \u5982\u679C\u5185\u5BB9\u5F88\u77ED\uFF0C\u5C31\u76F4\u63A5\u56F4\u7ED5\u8FD9\u53E5\u8BDD\u5C55\u5F00\u3002\n- \u7528\u4E2D\u6587\u8F93\u51FA\u3002\n\n\u5185\u5BB9\uFF1A\n{text}", enabled: true, aiEnabled: true },
        { id: "translate-explain", label: "\u8BD1\u89E3", action: "showResult", prompt: "\u8BF7\u4E0D\u8981\u505A\u9010\u5B57\u7FFB\u8BD1\u3002\u8BF7\u628A\u4EE5\u4E0B\u5185\u5BB9\u8F6C\u6362\u6210\u6211\u80FD\u653E\u5165 Obsidian \u7684\u201C\u6982\u5FF5\u7406\u89E3\u7B14\u8BB0\u201D\uFF1A\n\n\u8981\u6C42\uFF1A\n1. \u5148\u7ED9\u81EA\u7136\u4E2D\u6587\u89E3\u91CA\u3002\n2. \u4FDD\u7559\u5173\u952E\u539F\u6587\u672F\u8BED\uFF0C\u5E76\u89E3\u91CA\u5B83\u4EEC\u7684\u542B\u4E49\u3002\n3. \u5982\u679C\u539F\u6587\u6709\u9690\u542B\u80CC\u666F\uFF0C\u8BF7\u8865\u51FA\u6765\u3002\n4. \u7ED9\u4E00\u4E2A\u6211\u80FD\u590D\u7528\u7684\u4F8B\u5B50\u3002\n5. \u6700\u540E\u7ED9 3-5 \u4E2A\u5173\u952E\u8BCD\u3002\n\n\u5185\u5BB9\uFF1A\n{text}\n\n\u6765\u6E90\uFF1A\n{title}\n{url}", enabled: true, aiEnabled: true },
        { id: "concept-card", label: "\u6982\u5FF5\u5361", action: "showResult", prompt: "\u8BF7\u628A\u4EE5\u4E0B\u5185\u5BB9\u6574\u7406\u6210\u4E00\u4E2A Obsidian \u6982\u5FF5\u5361\uFF1A\n\n\u8F93\u51FA\u7ED3\u6784\uFF1A\n## \u5B9A\u4E49\n## \u80CC\u666F\n## \u4F8B\u5B50\n## \u5BB9\u6613\u8BEF\u89E3\u7684\u70B9\n## \u5173\u8054\u6982\u5FF5\n\n\u5185\u5BB9\uFF1A\n{text}", enabled: true, aiEnabled: true },
        { id: "quote", label: "\u91D1\u53E5", action: "showResult", prompt: "\u8BF7\u628A\u4EE5\u4E0B\u9009\u4E2D\u6587\u672C\u6574\u7406\u6210\u201C\u91D1\u53E5/\u6D1E\u5BDF\u5361\u7247\u201D\uFF1A\n\n\u8F93\u51FA\u7ED3\u6784\uFF1A\n> \u539F\u53E5\n\n## \u8FD9\u53E5\u8BDD\u7684\u542B\u4E49\n## \u4E3A\u4EC0\u4E48\u91CD\u8981\n## \u6211\u53EF\u4EE5\u600E\u4E48\u7528\n## \u5173\u952E\u8BCD\n\n\u5185\u5BB9\uFF1A\n{text}", enabled: true, aiEnabled: true },
        { id: "question", label: "\u95EE\u9898", action: "showResult", prompt: "\u8BF7\u628A\u4EE5\u4E0B\u5185\u5BB9\u8F6C\u6210\u540E\u7EED\u53EF\u63A2\u7D22\u7684\u95EE\u9898\uFF1A\n\n\u8F93\u51FA\u7ED3\u6784\uFF1A\n## \u6838\u5FC3\u95EE\u9898\n## \u53EF\u80FD\u7B54\u6848\n## \u8FD8\u9700\u8981\u67E5\u4EC0\u4E48\n## \u9002\u5408\u653E\u5165 Obsidian \u7684\u8FFD\u95EE\n\n\u5185\u5BB9\uFF1A\n{text}", enabled: true, aiEnabled: true },
        { id: "copy", label: "\u590D\u5236", action: "copy", prompt: "{text}", enabled: true, aiEnabled: false },
        { id: "open-sidepanel", label: "\u4FA7\u8FB9\u680F", action: "openSidepanel", prompt: "{text}", enabled: true, aiEnabled: false }
      ];
    }
    function ensureHost() {
      if (host && shadow)
        return;
      const existing = document.getElementById("__fs_toolbar_host");
      if (existing)
        existing.remove();
      host = document.createElement("div");
      host.id = "__fs_toolbar_host";
      shadow = host.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = TOOLBAR_CSS;
      shadow.appendChild(style);
      document.body.appendChild(host);
    }
    function buildCapsuleHTML() {
      const buttons = [];
      const visible = new Set(toolbarConfig.visibleActions);
      const enabledScenes = knowledgeScenes.filter((scene) => scene.enabled && visible.has(scene.id));
      const sceneById = new Map(enabledScenes.map((scene) => [scene.id, scene]));
      for (const id of MAIN_SCENE_IDS) {
        const scene = sceneById.get(id);
        if (!scene)
          continue;
        const primary = scene.action === toolbarConfig.defaultAction ? " primary" : "";
        buttons.push(`<button data-action="${escapeAttr(scene.id)}" title="${escapeAttr(scene.label)}" class="text${primary}">${ICONS[scene.id] || ""}<span>${escapeHtml(scene.label)}</span></button>`);
      }
      const moreScenes = MORE_SCENE_IDS.map((id) => sceneById.get(id)).filter((scene) => Boolean(scene));
      if (moreScenes.length > 0) {
        const menu = moreOpen ? `<div class="more-menu">${moreScenes.map((scene) => `<button data-action="${escapeAttr(scene.id)}" title="${escapeAttr(scene.label)}" class="text">${ICONS[scene.id] || ""}<span>${escapeHtml(scene.label)}</span></button>`).join("")}</div>` : "";
        buttons.push(`<span class="more-wrap"><button data-action="more" title="\u66F4\u591A">${ICONS.more}</button>${menu}</span>`);
      }
      if (isFeishuDocPage()) {
        buttons.push('<span class="divider"></span>');
        buttons.push(
          `<button data-action="feishu-sync" title="\u98DE\u4E66\u6587\u6863\u540C\u6B65" class="text">${ICONS["feishu-sync"]}<span>\u540C\u6B65</span></button>`
        );
      }
      return `<div class="capsule">${buttons.join("")}<span class="toast" hidden></span></div>`;
    }
    function renderCapsule() {
      if (!shadow)
        return;
      shadow.innerHTML = "";
      const style = document.createElement("style");
      style.textContent = TOOLBAR_CSS;
      shadow.appendChild(style);
      const wrapper = document.createElement("div");
      wrapper.innerHTML = buildCapsuleHTML();
      shadow.appendChild(wrapper.firstElementChild);
    }
    function renderInlineResult(title, content) {
      if (!shadow)
        return;
      shadow.innerHTML = "";
      const style = document.createElement("style");
      style.textContent = TOOLBAR_CSS;
      shadow.appendChild(style);
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
      <section class="result-window" role="dialog" aria-label="${escapeHtml(title)}">
        <header class="result-header"><span>${escapeHtml(title)}</span><button class="result-close" type="button" aria-label="\u5173\u95ED">\xD7</button></header>
        <div class="result-body">${escapeHtml(content)}</div>
      </section>`;
      shadow.appendChild(wrapper.firstElementChild);
      shadow.querySelector(".result-close")?.addEventListener("click", hideToolbar);
    }
    function clearShadow() {
      if (!shadow)
        return;
      shadow.innerHTML = "";
    }
    function positionAt(x, y) {
      if (!host)
        return;
      const rect = host.getBoundingClientRect();
      const elWidth = rect.width || 200;
      const elHeight = rect.height || 40;
      const left = Math.min(
        Math.max(x - elWidth / 2, 8),
        window.innerWidth - elWidth - 12
      );
      const top = y - elHeight - 12 > 0 ? y - elHeight - 12 : y + 20;
      host.style.left = left + "px";
      host.style.top = top + "px";
      host.style.display = "block";
    }
    function showCapsule() {
      if (!toolbarConfig.enabled)
        return;
      ensureHost();
      renderCapsule();
      state = "CAPSULE";
      bindCapsuleEvents();
    }
    function hideToolbar() {
      clearShadow();
      if (host) {
        host.style.display = "none";
      }
      state = "IDLE";
    }
    function bindCapsuleEvents() {
      if (!shadow)
        return;
      const capsule = shadow.querySelector(".capsule");
      if (!capsule)
        return;
      capsule.addEventListener("click", (e) => {
        const btn = e.target.closest(
          "button"
        );
        if (!btn)
          return;
        const action = btn.dataset.action;
        if (action)
          handleCapsuleAction(action, btn);
      });
      capsule.addEventListener(
        "mousedown",
        (e) => e.preventDefault()
      );
    }
    function showToast(message) {
      if (!shadow)
        return;
      const toast = shadow.querySelector(".toast");
      if (!toast)
        return;
      toast.textContent = message;
      toast.hidden = false;
      setTimeout(() => {
        if (toast)
          toast.hidden = true;
      }, 1600);
    }
    async function handleCapsuleAction(action, btn) {
      const text = lastSelection.trim();
      const domain = window.location.hostname;
      if (action === "more") {
        moreOpen = !moreOpen;
        renderCapsule();
        bindCapsuleEvents();
        return;
      }
      const scene = knowledgeScenes.find((item) => item.id === action);
      if (scene?.action === "copy") {
        if (text) {
          try {
            await navigator.clipboard.writeText(text);
            const originalHTML = btn.innerHTML;
            btn.innerHTML = iconSVG(
              '<polyline points="3 8l3 3 7-7"/>'
            );
            btn.classList.add("copied");
            setTimeout(() => {
              btn.innerHTML = originalHTML;
              btn.classList.remove("copied");
            }, 1200);
          } catch {
          }
        }
        showToast("\u5DF2\u590D\u5236");
        hideToolbar();
        return;
      }
      if (scene?.action === "showResult") {
        if (!text)
          return;
        resultTitle = scene.label;
        renderInlineResult(resultTitle, "\u6B63\u5728\u751F\u6210\u2026");
        try {
          chrome.runtime.sendMessage({
            type: "ai-inline",
            payload: {
              action: scene.id,
              prompt: fillPrompt(scene.prompt, text),
              text,
              title: document.title,
              url: window.location.href
            }
          }, (response) => {
            const error = chrome.runtime.lastError?.message;
            renderInlineResult(resultTitle, error || response?.error || response?.text || "AI \u672A\u8FD4\u56DE\u5185\u5BB9");
          });
        } catch {
          renderInlineResult(resultTitle, "\u6269\u5C55\u8FDE\u63A5\u5DF2\u5931\u6548\uFF0C\u8BF7\u5237\u65B0\u7F51\u9875\u540E\u91CD\u8BD5\u3002");
        }
        return;
      }
      if (scene && ["save", "append", "refine", "openSidepanel"].includes(scene.action)) {
        hideToolbar();
        const metadata = getPageMetadata();
        const docToken = extractDocToken();
        try {
          chrome.runtime.sendMessage({
            type: "clip-to-obsidian",
            payload: {
              text,
              title: metadata.title,
              url: metadata.url,
              description: metadata.description,
              favicon: metadata.favicon,
              docToken,
              domain,
              sceneId: scene.id,
              sceneLabel: scene.label,
              sceneAction: scene.action,
              prompt: fillPrompt(scene.prompt, text),
              defaultDir: scene.defaultDir || "",
              appendPath: scene.defaultAppendPath || toolbarConfig.defaultAppendPath || "",
              aiEnabled: scene.aiEnabled || scene.action === "save" && toolbarConfig.aiBeforeSave,
              openMode: scene.action === "save" ? toolbarConfig.saveBehavior : "confirmInSidepanel"
            }
          });
        } catch {
        }
        return;
      }
      switch (action) {
        case "feishu-sync": {
          hideToolbar();
          const docToken = extractDocToken();
          try {
            chrome.runtime.sendMessage({
              type: "feishu-sync-trigger",
              payload: {
                ...getPageMetadata(),
                docToken,
                domain
              }
            });
          } catch {
          }
          break;
        }
        default:
          break;
      }
    }
    function escapeHtml(value) {
      return value.replace(/[&<>"']/g, (char) => {
        const map = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        };
        return map[char];
      });
    }
    function escapeAttr(value) {
      return escapeHtml(value);
    }
    function checkRouteChange() {
      if (window.location.pathname !== lastPath) {
        lastPath = window.location.pathname;
        if (host) {
          host.remove();
          host = null;
          shadow = null;
        }
        state = "IDLE";
      }
    }
    function setupGlobalListeners() {
      document.addEventListener("mouseup", () => {
        setTimeout(() => {
          checkRouteChange();
          const sel = window.getSelection();
          const text = sel?.toString().trim();
          if (!text || text.length < 3) {
            hideToolbar();
            return;
          }
          lastSelection = text;
          if (sel && sel.rangeCount > 0) {
          }
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const topY = rect.top;
          ensureHost();
          showCapsule();
          positionAt(centerX, topY);
        }, 10);
      });
      document.addEventListener("mousedown", (e) => {
        if (state === "IDLE")
          return;
        if (host && !host.contains(e.target)) {
          hideToolbar();
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && state !== "IDLE") {
          hideToolbar();
        }
      });
      window.addEventListener(
        "scroll",
        () => {
          if (state !== "IDLE")
            hideToolbar();
        },
        { passive: true, capture: true }
      );
      window.addEventListener("popstate", checkRouteChange);
      window.addEventListener("hashchange", checkRouteChange);
    }
    function init() {
      loadToolbarSettings();
      setupGlobalListeners();
      chrome.storage?.onChanged?.addListener((changes, areaName) => {
        if (areaName !== "sync")
          return;
        if (changes.contextScenes || changes.selectionToolbarConfig)
          loadToolbarSettings();
      });
      chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message.type === "toolbar-toggle") {
          if (message.payload.enabled === false) {
            hideToolbar();
            if (host) {
              host.remove();
              host = null;
              shadow = null;
            }
          }
          sendResponse({ ok: true });
        }
        return true;
      });
    }
    init();
  })();
})();
//# sourceMappingURL=toolbar.js.map
