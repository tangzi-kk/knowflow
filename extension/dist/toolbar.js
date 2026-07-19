"use strict";
(() => {
  // src/content/toolbar.ts
  (function() {
    const MAIN_SCENE_IDS = ["save", "append", "refine"];
    const MORE_SCENE_IDS = ["translate-explain", "concept-card", "quote", "question", "copy", "open-sidepanel"];
    const SELECTION_DEBOUNCE_MS = 150;
    let state = "IDLE";
    let lastSelection = "";
    let host = null;
    let shadow = null;
    let lastPath = window.location.pathname;
    let resultTitle = "";
    let toolbarConfig = getDefaultToolbarConfig();
    let knowledgeScenes = getDefaultKnowledgeScenes();
    let moreOpen = false;
    let geminiSessionAlive = true;
    let aiRequestInFlight = false;
    let selectionDebounceTimer = null;
    let lastStreamPrompt = "";
    let lastStreamScenePromptTemplate = "";
    let streamChunkReceived = false;
    let streamProgressTimer = null;
    let retryAvailableAt = 0;
    function isFeishuDocPage() {
      const hostname = window.location.hostname;
      return /feishu\.cn|larksuite\.com/.test(hostname) && /\/(wiki|docx|doc)\//.test(window.location.pathname);
    }
    function extractDocToken() {
      const url = window.location.href;
      const wikiMatch = url.match(/\/wiki\/([A-Za-z0-9]+)/);
      if (wikiMatch) return { node_token: wikiMatch[1] };
      const docxMatch = url.match(/\/(?:docx|doc)\/([A-Za-z0-9]+)/);
      if (docxMatch) return { obj_token: docxMatch[1] };
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
    function getSurroundingContext(chars = 200) {
      try {
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return "";
        const range = sel.getRangeAt(0);
        const selectedText = sel.toString();
        if (!selectedText) return "";
        let container = range.commonAncestorContainer;
        while (container && container.nodeType === Node.TEXT_NODE && container.parentElement) {
          container = container.parentElement;
        }
        const parentText = container?.innerText || container?.textContent || "";
        const index = parentText.indexOf(selectedText);
        if (index === -1) {
          return parentText.slice(0, chars * 2 + selectedText.length);
        }
        const start = Math.max(0, index - chars);
        const end = Math.min(parentText.length, index + selectedText.length + chars);
        const before = parentText.slice(start, index).trim();
        const after = parentText.slice(index + selectedText.length, end).trim();
        let ctx = "";
        if (before) ctx += `\u4E0A\u6587\uFF1A${before}
`;
        if (after) ctx += `\u4E0B\u6587\uFF1A${after}`;
        return ctx;
      } catch {
        return "";
      }
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
        if (!existingIds.has(scene.id)) normalized.push(scene);
      }
      return normalized;
    }
    function normalizeToolbarConfig(input) {
      const defaults = getDefaultToolbarConfig();
      if (!input || typeof input !== "object") return defaults;
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
    function fillPrompt(template, text, extraContext) {
      const metadata = getPageMetadata();
      const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const context = extraContext || getSurroundingContext();
      return String(template || "{text}").replace(/\{text\}/g, text).replace(/\{title\}/g, metadata.title).replace(/\{url\}/g, metadata.url).replace(/\{domain\}/g, metadata.domain).replace(/\{date\}/g, date).replace(/\{context\}/g, context);
    }
    const TOOLBAR_CSS = `
:host {
  all: initial;
  position: fixed;
  z-index: 2147483647;
  pointer-events: none;
  font-family: '\u5B8B\u4F53', SimSun, 'Songti SC', serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Microsoft YaHei", "Helvetica Neue", sans-serif;

  /* \u2500\u2500 Design Tokens \u2500\u2500 */
  --brand-50:  #E8F8EE;
  --brand-100: #D0F2DD;
  --brand-200: #A1E4BC;
  --brand-500: #07C160;
  --brand-600: #06A050;
  --brand-700: #058040;

  --neutral-0:   #FFFFFF;
  --neutral-50:  #F7F7F7;
  --neutral-100: #EDEDED;
  --neutral-200: #E5E5E5;
  --neutral-400: #B2B2B2;
  --neutral-500: #999999;
  --neutral-600: #666666;
  --neutral-700: #404040;
  --neutral-800: #2C2C2C;
  --neutral-900: #191919;

  --c-brand:       var(--brand-500);
  --c-brand-hover: var(--brand-600);
  --c-brand-soft:  var(--brand-50);
  --c-brand-ring:  rgba(7, 193, 96, 0.18);

  --c-surface:     var(--neutral-0);
  --c-surface-dim: var(--neutral-100);
  --c-border:      var(--neutral-200);
  --c-divider:     var(--neutral-100);

  --c-text:        var(--neutral-900);
  --c-text-2:      var(--neutral-600);
  --c-text-3:      var(--neutral-500);

  --c-error:       #FA5151;
  --c-error-soft:  #FDEAEA;
  --c-white:       #FFFFFF;

  --r-sm: 6px;
  --r-md: 8px;
  --r-lg: 12px;
  --ease:  cubic-bezier(0.22, 1, 0.36, 1);
  --spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --t-fast: 0.15s var(--ease);

  /* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
     KnowFlow Design Tokens (--kf-* \u4F53\u7CFB)
     \u53C2\u8003\uFF1AFluent 2 Shadow / Linear Design / M3 State Layer / Apple Material
     \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

  /* \u2500\u2500 \u8868\u9762\u5C42\u6B21\uFF08Linear \u4EAE\u5EA6\u9012\u8FDB + Apple \u534A\u900F\u660E\u6750\u6599\uFF09\u2500\u2500 */
  --kf-bg-base:             rgba(255, 255, 255, 0.82);   /* \u80F6\u56CA\u5E95\u8272 */
  --kf-bg-elevated:         rgba(255, 255, 255, 0.92);   /* \u7ED3\u679C\u9762\u677F\u5E95\u8272 */
  --kf-bg-hover:            rgba(0, 0, 0, 0.04);         /* \u6309\u94AE hover State Layer */
  --kf-bg-active:           rgba(0, 0, 0, 0.08);         /* \u6309\u94AE active State Layer */
  --kf-bg-error:            rgba(239, 68, 68, 0.06);     /* \u9519\u8BEF\u6001\u80CC\u666F */
  --kf-bg-ai-loading:       rgba(99, 102, 241, 0.08);    /* AI loading \u6309\u94AE\u5E95\u8272 */

  /* \u2500\u2500 \u6587\u672C\u5C42\u6B21\uFF08Linear opacity \u63A7\u5236\uFF09\u2500\u2500 */
  --kf-text-primary:        rgba(0, 0, 0, 0.88);
  --kf-text-secondary:      rgba(0, 0, 0, 0.60);
  --kf-text-tertiary:       rgba(0, 0, 0, 0.38);

  /* \u2500\u2500 \u8FB9\u6846\uFF08Arc \u7EC6\u8FB9\u6846 + Linear \u4F4E\u900F\u660E\u5EA6\uFF09\u2500\u2500 */
  --kf-border:              rgba(0, 0, 0, 0.06);
  --kf-border-strong:       rgba(0, 0, 0, 0.12);
  --kf-divider:             rgba(0, 0, 0, 0.06);

  /* \u2500\u2500 AI \u54C1\u724C\u8272\uFF08Notion AI \u7D2B\u8272\u7B56\u7565\uFF09\u2500\u2500 */
  --kf-ai-primary:          #6366F1;     /* Indigo 500 */
  --kf-ai-secondary:        #8B5CF6;     /* Violet 500 */
  --kf-ai-gradient:         linear-gradient(135deg, #6366F1, #8B5CF6);
  --kf-ai-gradient-soft:    linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08));

  /* \u2500\u2500 \u9634\u5F71\u7CFB\u7EDF\uFF08Fluent 2 Key + Ambient \u53CC\u5C42\uFF09\u2500\u2500 */
  --kf-shadow-sm:
    0 2px 4px rgba(0, 0, 0, 0.06),
    0 0 8px rgba(0, 0, 0, 0.04);

  --kf-shadow-md:
    0 8px 16px rgba(0, 0, 0, 0.10),
    0 0 24px rgba(0, 0, 0, 0.06);

  --kf-shadow-hover:
    0 4px 8px rgba(0, 0, 0, 0.08),
    0 0 16px rgba(0, 0, 0, 0.06);

  --kf-shadow-error:
    0 4px 12px rgba(239, 68, 68, 0.12),
    0 0 16px rgba(239, 68, 68, 0.06);

  /* \u2500\u2500 \u5706\u89D2 \u2500\u2500 */
  --kf-radius-sm:           8px;
  --kf-radius-md:           12px;
  --kf-radius-lg:           16px;
  --kf-radius-btn:          8px;
  --kf-radius-capsule:      20px;
  --kf-radius-panel:        14px;
  --kf-radius-full:         9999px;

  /* \u2500\u2500 \u5B57\u53F7\uFF08Linear \u7D27\u51D1\u6392\u7248\uFF09\u2500\u2500 */
  --kf-text-xs:             11px;
  --kf-text-sm:             12px;
  --kf-text-base:           13px;
  --kf-text-lg:             15px;

  /* \u2500\u2500 \u95F4\u8DDD\uFF084px \u57FA\u51C6\u7F51\u683C\uFF09\u2500\u2500 */
  --kf-space-xs:            4px;
  --kf-space-sm:            8px;
  --kf-space-md:            12px;
  --kf-space-lg:            16px;
  --kf-space-xl:            24px;

  /* \u2500\u2500 backdrop-blur\uFF08\u4ECE 20px \u964D\u81F3 6/12px\uFF09\u2500\u2500 */
  --kf-blur-toolbar:        6px;
  --kf-blur-panel:          12px;

  /* \u2500\u2500 \u7F13\u52A8\u66F2\u7EBF\u4E0E\u65F6\u957F\uFF08Linear \u52A8\u6548\u7CFB\u7EDF\uFF09\u2500\u2500 */
  --kf-ease-out:            cubic-bezier(0.16, 1, 0.3, 1);
  --kf-ease-in-out:         cubic-bezier(0.65, 0, 0.35, 1);
  --kf-ease-spring:         cubic-bezier(0.34, 1.56, 0.64, 1);
  --kf-dur-fast:            100ms;
  --kf-dur-normal:          150ms;
  --kf-dur-slow:            250ms;
  --kf-dur-ripple:          300ms;
}
.capsule {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 4px 5px;
  background: var(--kf-bg-base);
  backdrop-filter: blur(var(--kf-blur-toolbar));
  -webkit-backdrop-filter: blur(var(--kf-blur-toolbar));
  border-radius: var(--kf-radius-capsule);
  border: 0.5px solid var(--kf-border);
  box-shadow: var(--kf-shadow-sm);
  user-select: none;
  pointer-events: auto;
  animation: capsule-in var(--kf-dur-slow) var(--kf-ease-out);
  transition:
    box-shadow var(--kf-dur-normal) var(--kf-ease-out),
    border-radius var(--kf-dur-slow) var(--kf-ease-out);
}
@keyframes capsule-in {
  from { opacity: 0; transform: scale(0.88) translateY(6px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.capsule button {
  position: relative;
  overflow: hidden;
  min-width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: var(--kf-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--kf-text-secondary);
  padding: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform var(--kf-dur-fast) var(--kf-ease-out),
    box-shadow var(--kf-dur-normal) var(--kf-ease-out),
    color var(--kf-dur-fast) ease;
}
/* \u2550\u2550\u2550 State Layer\uFF08M3\uFF09\u2014 \u66FF\u4EE3 background \u53D8\u5316 \u2550\u2550\u2550 */
.capsule button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--kf-text-primary);
  opacity: 0;
  transition: opacity var(--kf-dur-fast) ease;
  pointer-events: none;
  z-index: 0;
}
.capsule button > * { position: relative; z-index: 1; }
.capsule button.text {
  width: auto;
  border-radius: 16px;
  padding: 0 10px;
  gap: 5px;
  font-size: var(--kf-text-sm);
  font-weight: 600;
}
.capsule button:hover::before { opacity: 0.06; }
.capsule button:active::before { opacity: 0.12; }
.capsule button:hover {
  color: var(--c-brand);
  transform: translateY(-1px);
  box-shadow: var(--kf-shadow-hover);
}
.capsule button:active {
  transform: translateY(0) scale(0.96);
  transition: transform 60ms ease-out;
  box-shadow: var(--kf-shadow-sm);
}
.capsule .divider {
  width: 1px;
  height: 18px;
  background: var(--kf-divider);
  margin: 0 3px;
  flex-shrink: 0;
}
.capsule button.primary {
  background: var(--c-brand);
  color: var(--c-white);
  border-radius: 16px;
  width: auto;
  padding: 0 12px;
  gap: 4px;
  font-size: var(--kf-text-sm);
  font-weight: 600;
  box-shadow: var(--kf-shadow-sm);
}
.capsule button.primary:hover {
  background: var(--c-brand-hover);
  color: var(--c-white);
  box-shadow: var(--kf-shadow-hover);
  transform: translateY(-1px);
}
.capsule button.primary:active {
  transform: translateY(1px) scale(0.97);
  box-shadow: var(--kf-shadow-sm);
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
  border-radius: var(--r-lg);
  background: var(--kf-bg-elevated);
  backdrop-filter: blur(var(--kf-blur-panel));
  -webkit-backdrop-filter: blur(var(--kf-blur-panel));
  border: 0.5px solid var(--kf-border);
  box-shadow: var(--kf-shadow-md);
}
.more-menu button {
  width: 100%;
  justify-content: flex-start;
  border-radius: 9px;
  padding: 0 8px;
}
.toast {
  margin-left: 6px;
  padding: 6px 10px;
  border-radius: var(--kf-radius-lg);
  background: var(--c-brand-soft);
  color: var(--c-brand-hover);
  font-size: var(--kf-text-sm);
  font-weight: 500;
  white-space: nowrap;
}
.capsule button.copied {
  color: var(--c-brand);
}
.result-window {
  width: min(360px, calc(100vw - 24px));
  max-height: min(360px, calc(100vh - 24px));
  overflow: hidden;
  background: var(--kf-bg-elevated);
  backdrop-filter: blur(var(--kf-blur-panel));
  -webkit-backdrop-filter: blur(var(--kf-blur-panel));
  border-radius: var(--kf-radius-panel);
  border: 0.5px solid var(--kf-border);
  box-shadow: var(--kf-shadow-md);
  pointer-events: auto;
}
.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--kf-divider);
  color: var(--kf-text-primary);
  font-size: var(--kf-text-base);
  font-weight: 600;
}
.result-close {
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--kf-text-tertiary);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: background var(--kf-dur-fast) ease, color var(--kf-dur-fast) ease;
}
.result-close:hover { background: var(--kf-bg-hover); color: var(--kf-text-primary); }
.result-body {
  max-height: 300px;
  overflow: auto;
  padding: 12px 14px;
  color: var(--kf-text-primary);
  font-size: var(--kf-text-base);
  line-height: 1.65;
  white-space: pre-wrap;
}
.result-content {
  opacity: 1;
  transition: opacity 0.18s ease;
}
.result-content.crossfading {
  opacity: 0;
}
/* \u2500\u2500\u2500\u2500\u2500 \u7ED3\u679C\u9762\u677F\u5C55\u5F00/\u6536\u8D77\u52A8\u753B \u2500\u2500\u2500\u2500\u2500 */
.result-panel {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px) scaleY(0.96);
  transform-origin: top center;
  transition:
    max-height var(--kf-dur-slow) var(--kf-ease-out),
    opacity var(--kf-dur-slow) var(--kf-ease-out),
    transform var(--kf-dur-slow) var(--kf-ease-out);
  margin-top: 4px;
}
.result-panel.expanded {
  max-height: 420px;
  opacity: 1;
  transform: translateY(0) scaleY(1);
}
.result-panel.collapsing {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px) scaleY(0.96);
}
/* \u2500\u2500\u2500\u2500\u2500 \u80F6\u56CA\u6536\u7F29\u6001\uFF08\u5C55\u5F00\u9762\u677F\u65F6\uFF09 \u2500\u2500\u2500\u2500\u2500 */
.capsule.shrinking {
  border-radius: 14px 14px 4px 4px;
  transition: border-radius var(--kf-dur-slow) var(--kf-ease-out);
}
/* \u2500\u2500\u2500\u2500\u2500 \u6309\u94AE\u70B9\u51FB\u6D9F\u6F2A \u2500\u2500\u2500\u2500\u2500 */
.capsule button::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--c-brand);
  opacity: 0;
  transform: scale(0.4);
}
.capsule button.ripple::after {
  animation: btn-ripple var(--kf-dur-ripple) var(--kf-ease-out);
}
@keyframes btn-ripple {
  0%   { opacity: 0.18; transform: scale(0.4); }
  100% { opacity: 0; transform: scale(2.5); }
}
/* \u2500\u2500\u2500\u2500\u2500 \u80F6\u56CA\u5165\u573A\u4F18\u5316 \u2500\u2500\u2500\u2500\u2500 */
@keyframes capsule-bounce-in {
  0%   { opacity: 0; transform: scale(0.82) translateY(10px); }
  60%  { opacity: 1; transform: scale(1.03) translateY(-1px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
.capsule.entering {
  animation: capsule-bounce-in var(--kf-dur-slow) var(--kf-ease-out);
}
.ai-progress { display: flex; align-items: center; gap: 8px; color: var(--kf-text-secondary); padding: 8px 0; }
.ai-spinner {
  width: 16px; height: 16px; border: 2px solid var(--kf-divider);
  border-top-color: var(--kf-ai-primary); border-radius: 50%;
  animation: ai-spin 0.6s linear infinite; flex-shrink: 0;
}
@keyframes ai-spin { to { transform: rotate(360deg); } }
.ai-error { color: #D85A30; white-space: pre-wrap; margin-bottom: 10px; }
.ai-retry-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 14px; border: 1px solid var(--c-brand); border-radius: var(--kf-radius-btn);
  background: transparent; color: var(--c-brand); cursor: pointer;
  font-size: var(--kf-text-sm); font-weight: 500; transition: background var(--kf-dur-fast) ease, color var(--kf-dur-fast) ease;
}
.ai-retry-btn:hover { background: var(--c-brand-soft); }
.capsule button.loading { opacity: 0.5; pointer-events: none; }
/* \u2550\u2550\u2550 AI \u6309\u94AE\u54C1\u724C\u8272 \u2014 \u56FE\u6807\u7528\u84DD\u7D2B\u6E10\u53D8\uFF0C\u533A\u522B\u4E8E\u666E\u901A\u6309\u94AE \u2550\u2550\u2550 */
.capsule button.ai-btn svg {
  color: var(--kf-ai-primary);
}
/* Gemini session \u8FC7\u671F\u63D0\u793A */
.capsule button.session-warn { position: relative; }
.capsule button.session-warn::after {
  content: '';
  position: absolute; top: 5px; right: 4px;
  width: 6px; height: 6px; border-radius: 50%;
  background: #FAAD14;
  box-shadow: 0 0 4px rgba(250, 173, 20, 0.5);
}
@media (prefers-color-scheme: dark) {
  :host {
    --c-surface:      #1E1E1E;
    --c-surface-dim:  #2A2A2A;
    --c-border:       #333333;
    --c-divider:      rgba(255, 255, 255, 0.08);
    --c-text:         #E5E5E5;
    --c-text-2:       #999999;
    --c-text-3:       #666666;
    --c-brand:        #07C160;
    --c-brand-hover:  #06AD56;
    --c-brand-soft:   #0D2B1A;

    /* \u2500\u2500 --kf-* \u6697\u8272\u6A21\u5F0F\u8986\u76D6\uFF08Fluent 2 Dark: Key shadow opacity 28%\uFF09\u2500\u2500 */
    --kf-bg-base:             rgba(30, 30, 30, 0.82);
    --kf-bg-elevated:         rgba(38, 38, 38, 0.92);
    --kf-bg-hover:            rgba(255, 255, 255, 0.06);
    --kf-bg-active:           rgba(255, 255, 255, 0.10);
    --kf-bg-error:            rgba(239, 68, 68, 0.10);
    --kf-bg-ai-loading:       rgba(129, 140, 248, 0.12);

    --kf-text-primary:        rgba(255, 255, 255, 0.95);
    --kf-text-secondary:      rgba(255, 255, 255, 0.65);
    --kf-text-tertiary:       rgba(255, 255, 255, 0.38);

    --kf-border:              rgba(255, 255, 255, 0.08);
    --kf-border-strong:       rgba(255, 255, 255, 0.14);
    --kf-divider:             rgba(255, 255, 255, 0.08);

    --kf-shadow-sm:
      0 2px 4px rgba(0, 0, 0, 0.28),
      0 0 8px rgba(0, 0, 0, 0.20);
    --kf-shadow-md:
      0 8px 16px rgba(0, 0, 0, 0.32),
      0 0 24px rgba(0, 0, 0, 0.24);
    --kf-shadow-hover:
      0 4px 8px rgba(0, 0, 0, 0.30),
      0 0 16px rgba(0, 0, 0, 0.22);
  }
  .capsule button { color: var(--kf-text-secondary); }
  .capsule .divider { background: var(--kf-divider); }
  .capsule button.primary { background: var(--c-brand); color: var(--c-white); }
  .capsule button.primary:hover { background: var(--c-brand-hover); color: var(--c-white); }
  .toast { background: var(--c-brand-soft); color: #71D69A; }
  .result-header { color: var(--kf-text-primary); border-bottom-color: var(--kf-divider); }
  .result-close { color: var(--kf-text-tertiary); }
  .result-close:hover { background: var(--kf-bg-hover); color: var(--kf-text-primary); }
  .result-body { color: var(--kf-text-primary); }
  .ai-error { color: #F09595; }
  .ai-retry-btn { border-color: var(--c-brand); color: var(--c-brand); }
  .ai-retry-btn:hover { background: var(--c-brand-soft); }
}
/* \u2550\u2550\u2550 \u6D41\u5F0F\u8F93\u51FA\u5149\u6807 \u2550\u2550\u2550 */
.result-content.streaming {
  display: inline;
}
.result-content.streaming::after {
  content: '\u258A';
  display: inline-block;
  margin-left: 2px;
  color: var(--kf-ai-primary);
  animation: kf-blink 1s step-end infinite;
}
@keyframes kf-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
/* \u2550\u2550\u2550 AI \u9519\u8BEF\u5361\u7247 \u2550\u2550\u2550 */
.ai-error-card {
  padding: 18px 14px;
  text-align: center;
}
.ai-error-card .error-icon {
  font-size: 32px;
  margin-bottom: 8px;
  line-height: 1;
}
.ai-error-card .error-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--kf-text-primary);
  margin-bottom: 4px;
}
.ai-error-card .error-desc {
  font-size: 12px;
  color: var(--kf-text-secondary);
  line-height: 1.5;
  margin-bottom: 14px;
  white-space: pre-wrap;
}
.ai-error-card .error-actions {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}
.ai-error-card .error-btn {
  padding: 6px 12px;
  border: 1px solid var(--kf-border-strong);
  background: var(--neutral-0);
  border-radius: var(--kf-radius-btn);
  font-size: 12px;
  cursor: pointer;
  color: var(--kf-text-secondary);
  transition: all var(--kf-dur-fast) ease;
}
.ai-error-card .error-btn:hover:not(:disabled) {
  border-color: var(--c-brand);
  color: var(--c-brand);
}
.ai-error-card .error-btn.primary {
  background: var(--c-brand);
  color: var(--c-white);
  border-color: var(--c-brand);
}
.ai-error-card .error-btn.primary:hover:not(:disabled) {
  background: var(--c-brand-hover);
}
.ai-error-card .error-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ai-error-card .error-btn.countdown::after {
  content: " (" attr(data-countdown) "s)";
  font-size: 11px;
}
/* \u2550\u2550\u2550 AI \u6309\u94AE loading \u6001\uFF08\u6E10\u53D8\u5E95\u8272 + pulse\uFF09\u2550\u2550\u2550 */
.capsule button.ai-btn.loading {
  background: var(--kf-ai-gradient-soft);
  color: var(--kf-ai-primary);
  pointer-events: none;
}
.capsule button.ai-btn.loading svg {
  animation: ai-pulse 1.4s ease-in-out infinite;
}
@keyframes ai-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.9); }
}
/* \u2550\u2550\u2550 \u52A8\u6001\u6697\u8272\u6A21\u5F0F\uFF08\u9875\u9762\u80CC\u666F\u68C0\u6D4B\uFF0C\u8986\u76D6 prefers-color-scheme\uFF09\u2550\u2550\u2550 */
:host([data-theme="dark"]) {
  --c-surface:      #1E1E1E;
  --c-surface-dim:  #2A2A2A;
  --c-border:       #333333;
  --c-divider:      rgba(255, 255, 255, 0.08);
  --c-text:         #E5E5E5;
  --c-text-2:       #999999;
  --c-text-3:       #666666;
  --c-brand:        #07C160;
  --c-brand-hover:  #06AD56;
  --c-brand-soft:   #0D2B1A;
  --kf-bg-base:             rgba(30, 30, 30, 0.82);
  --kf-bg-elevated:         rgba(38, 38, 38, 0.92);
  --kf-bg-hover:            rgba(255, 255, 255, 0.06);
  --kf-bg-active:           rgba(255, 255, 255, 0.10);
  --kf-bg-error:            rgba(239, 68, 68, 0.10);
  --kf-bg-ai-loading:       rgba(129, 140, 248, 0.12);
  --kf-text-primary:        rgba(255, 255, 255, 0.95);
  --kf-text-secondary:      rgba(255, 255, 255, 0.65);
  --kf-text-tertiary:       rgba(255, 255, 255, 0.38);
  --kf-border:              rgba(255, 255, 255, 0.08);
  --kf-border-strong:       rgba(255, 255, 255, 0.14);
  --kf-divider:             rgba(255, 255, 255, 0.08);
  --kf-shadow-sm:
    0 2px 4px rgba(0, 0, 0, 0.28),
    0 0 8px rgba(0, 0, 0, 0.20);
  --kf-shadow-md:
    0 8px 16px rgba(0, 0, 0, 0.32),
    0 0 24px rgba(0, 0, 0, 0.24);
  --kf-shadow-hover:
    0 4px 8px rgba(0, 0, 0, 0.30),
    0 0 16px rgba(0, 0, 0, 0.22);
}
:host([data-theme="dark"]) .capsule button { color: var(--kf-text-secondary); }
:host([data-theme="dark"]) .capsule .divider { background: var(--kf-divider); }
:host([data-theme="dark"]) .capsule button.primary { background: var(--c-brand); color: var(--c-white); }
:host([data-theme="dark"]) .capsule button.primary:hover { background: var(--c-brand-hover); color: var(--c-white); }
:host([data-theme="dark"]) .toast { background: var(--c-brand-soft); color: #71D69A; }
:host([data-theme="dark"]) .result-header { color: var(--kf-text-primary); border-bottom-color: var(--kf-divider); }
:host([data-theme="dark"]) .result-close { color: var(--kf-text-tertiary); }
:host([data-theme="dark"]) .result-close:hover { background: var(--kf-bg-hover); color: var(--kf-text-primary); }
:host([data-theme="dark"]) .result-body { color: var(--kf-text-primary); }
:host([data-theme="dark"]) .ai-error { color: #F09595; }
:host([data-theme="dark"]) .ai-error-card .error-btn { background: #2A2A2A; border-color: var(--kf-border-strong); color: var(--kf-text-secondary); }
:host([data-theme="dark"]) .ai-error-card .error-btn:hover:not(:disabled) { border-color: var(--c-brand); color: var(--c-brand); }
:host([data-theme="dark"]) .ai-error-card .error-title { color: var(--kf-text-primary); }
:host([data-theme="dark"]) .ai-error-card .error-desc { color: var(--kf-text-secondary); }
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
        { id: "translate-explain", label: "\u8BD1\u89E3", action: "showResult", prompt: '\u8BF7\u4E0D\u8981\u505A\u9010\u5B57\u7FFB\u8BD1\u3002\u8BF7\u628A\u4EE5\u4E0B\u5185\u5BB9\u8F6C\u6362\u6210\u6211\u80FD\u653E\u5165 Obsidian \u7684"\u6982\u5FF5\u7406\u89E3\u7B14\u8BB0"\uFF1A\n\n\u8981\u6C42\uFF1A\n1. \u5148\u7ED9\u81EA\u7136\u4E2D\u6587\u89E3\u91CA\u3002\n2. \u4FDD\u7559\u5173\u952E\u539F\u6587\u672F\u8BED\uFF0C\u5E76\u89E3\u91CA\u5B83\u4EEC\u7684\u542B\u4E49\u3002\n3. \u5982\u679C\u539F\u6587\u6709\u9690\u542B\u80CC\u666F\uFF0C\u8BF7\u8865\u51FA\u6765\u3002\n4. \u7ED9\u4E00\u4E2A\u6211\u80FD\u590D\u7528\u7684\u4F8B\u5B50\u3002\n5. \u6700\u540E\u7ED9 3-5 \u4E2A\u5173\u952E\u8BCD\u3002\n\n\u9875\u9762\uFF1A{title}\n\u6765\u6E90\uFF1A{url}\n\u9009\u4E2D\u6587\u672C\uFF1A\n{text}\n\n{context}', enabled: true, aiEnabled: true },
        { id: "concept-card", label: "\u6982\u5FF5\u5361", action: "showResult", prompt: "\u8BF7\u628A\u4EE5\u4E0B\u5185\u5BB9\u6574\u7406\u6210\u4E00\u4E2A Obsidian \u6982\u5FF5\u5361\uFF1A\n\n\u8F93\u51FA\u7ED3\u6784\uFF1A\n## \u5B9A\u4E49\n## \u80CC\u666F\n## \u4F8B\u5B50\n## \u5BB9\u6613\u8BEF\u89E3\u7684\u70B9\n## \u5173\u8054\u6982\u5FF5\n\n\u9875\u9762\uFF1A{title}\n\u6765\u6E90\uFF1A{url}\n\u9009\u4E2D\u6587\u672C\uFF1A\n{text}\n\n{context}", enabled: true, aiEnabled: true },
        { id: "quote", label: "\u91D1\u53E5", action: "showResult", prompt: '\u8BF7\u628A\u4EE5\u4E0B\u9009\u4E2D\u6587\u672C\u6574\u7406\u6210"\u91D1\u53E5/\u6D1E\u5BDF\u5361\u7247"\uFF1A\n\n\u8F93\u51FA\u7ED3\u6784\uFF1A\n> \u539F\u53E5\n\n## \u8FD9\u53E5\u8BDD\u7684\u542B\u4E49\n## \u4E3A\u4EC0\u4E48\u91CD\u8981\n## \u6211\u53EF\u4EE5\u600E\u4E48\u7528\n## \u5173\u952E\u8BCD\n\n\u9009\u4E2D\u6587\u672C\uFF1A\n{text}\n\n{context}', enabled: true, aiEnabled: true },
        { id: "question", label: "\u95EE\u9898", action: "showResult", prompt: "\u8BF7\u628A\u4EE5\u4E0B\u5185\u5BB9\u8F6C\u6210\u540E\u7EED\u53EF\u63A2\u7D22\u7684\u95EE\u9898\uFF1A\n\n\u8F93\u51FA\u7ED3\u6784\uFF1A\n## \u6838\u5FC3\u95EE\u9898\n## \u53EF\u80FD\u7B54\u6848\n## \u8FD8\u9700\u8981\u67E5\u4EC0\u4E48\n## \u9002\u5408\u653E\u5165 Obsidian \u7684\u8FFD\u95EE\n\n\u9875\u9762\uFF1A{title}\n\u6765\u6E90\uFF1A{url}\n\u9009\u4E2D\u6587\u672C\uFF1A\n{text}\n\n{context}", enabled: true, aiEnabled: true },
        { id: "copy", label: "\u590D\u5236", action: "copy", prompt: "{text}", enabled: true, aiEnabled: false },
        { id: "open-sidepanel", label: "\u4FA7\u8FB9\u680F", action: "openSidepanel", prompt: "{text}", enabled: true, aiEnabled: false }
      ];
    }
    function ensureHost() {
      if (host && shadow) return;
      const existing = document.getElementById("__fs_toolbar_host");
      if (existing) existing.remove();
      host = document.createElement("div");
      host.id = "__fs_toolbar_host";
      shadow = host.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = TOOLBAR_CSS;
      shadow.appendChild(style);
      document.body.appendChild(host);
      applyTheme();
    }
    function buildCapsuleHTML() {
      const buttons = [];
      const visible = new Set(toolbarConfig.visibleActions);
      const enabledScenes = knowledgeScenes.filter((scene) => scene.enabled && visible.has(scene.id));
      const sceneById = new Map(enabledScenes.map((scene) => [scene.id, scene]));
      for (const id of MAIN_SCENE_IDS) {
        const scene = sceneById.get(id);
        if (!scene) continue;
        const primary = scene.action === toolbarConfig.defaultAction ? " primary" : "";
        const aiCls = scene.aiEnabled ? " ai-btn" : "";
        const aiWarn = !geminiSessionAlive && scene.aiEnabled ? " session-warn" : "";
        buttons.push(`<button data-action="${escapeAttr(scene.id)}" title="${escapeAttr(scene.label)}" class="text${primary}${aiCls}${aiWarn}">${ICONS[scene.id] || ""}<span>${escapeHtml(scene.label)}</span></button>`);
      }
      const moreScenes = MORE_SCENE_IDS.map((id) => sceneById.get(id)).filter((scene) => Boolean(scene));
      if (moreScenes.length > 0) {
        const menu = moreOpen ? `<div class="more-menu">${moreScenes.map((scene) => {
          const aiCls = scene.aiEnabled ? " ai-btn" : "";
          const aiWarn = !geminiSessionAlive && scene.aiEnabled ? " session-warn" : "";
          return `<button data-action="${escapeAttr(scene.id)}" title="${escapeAttr(scene.label)}" class="text${aiCls}${aiWarn}">${ICONS[scene.id] || ""}<span>${escapeHtml(scene.label)}</span></button>`;
        }).join("")}</div>` : "";
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
    function ensureStage() {
      if (!shadow) return;
      if (shadow.querySelector(".toolbar-stage")) return;
      shadow.innerHTML = "";
      const style = document.createElement("style");
      style.textContent = TOOLBAR_CSS;
      shadow.appendChild(style);
      const stage = document.createElement("div");
      stage.className = "toolbar-stage";
      stage.innerHTML = `
      <div class="capsule"></div>
      <div class="result-panel">
        <header class="result-header">
          <span class="result-title"></span>
          <button class="result-close" type="button" aria-label="\u5173\u95ED">\xD7</button>
        </header>
        <div class="result-body">
          <div class="result-content"></div>
        </div>
      </div>`;
      shadow.appendChild(stage);
      stage.querySelector(".result-close")?.addEventListener("click", () => collapseResult());
    }
    function renderCapsule() {
      if (!shadow) return;
      ensureStage();
      const capsule = shadow.querySelector(".capsule");
      capsule.classList.remove("shrinking");
      const panel = shadow.querySelector(".result-panel");
      panel.classList.remove("expanded");
      panel.classList.add("collapsing");
      capsule.classList.add("entering");
      capsule.addEventListener("animationend", () => capsule.classList.remove("entering"), { once: true });
      setTimeout(() => {
        panel.classList.remove("collapsing");
        const rc = panel.querySelector(".result-content");
        rc.innerHTML = "";
      }, 280);
      capsule.innerHTML = buildCapsuleHTML();
    }
    function expandToResult(title, content, isHtml = false) {
      if (!shadow) return;
      ensureStage();
      const capsule = shadow.querySelector(".capsule");
      const panel = shadow.querySelector(".result-panel");
      const titleEl = panel.querySelector(".result-title");
      const contentEl = panel.querySelector(".result-content");
      capsule.classList.add("shrinking");
      titleEl.textContent = title;
      contentEl.classList.remove("crossfading");
      contentEl.innerHTML = isHtml ? content : escapeHtml(content);
      panel.classList.remove("collapsing");
      void panel.offsetHeight;
      panel.classList.add("expanded");
    }
    function updateResultContent(content, isHtml = false) {
      if (!shadow) return;
      const contentEl = shadow.querySelector(".result-content");
      contentEl.classList.add("crossfading");
      setTimeout(() => {
        contentEl.innerHTML = isHtml ? content : escapeHtml(content);
        contentEl.classList.remove("crossfading");
      }, 180);
    }
    function collapseResult() {
      if (!shadow) return;
      aiRequestInFlight = false;
      const capsule = shadow.querySelector(".capsule");
      const panel = shadow.querySelector(".result-panel");
      panel.classList.remove("expanded");
      panel.classList.add("collapsing");
      capsule.classList.remove("shrinking");
      setTimeout(() => {
        panel.classList.remove("collapsing");
        const rc = panel.querySelector(".result-content");
        rc.innerHTML = "";
        renderCapsule();
      }, 300);
    }
    function detectPageDarkness() {
      try {
        const bg = window.getComputedStyle(document.body).backgroundColor;
        const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!m) return false;
        const r = parseInt(m[1], 10);
        const g = parseInt(m[2], 10);
        const b = parseInt(m[3], 10);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.4;
      } catch {
        return false;
      }
    }
    function applyTheme() {
      if (!host) return;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const pageDark = detectPageDarkness();
      const isDark = prefersDark || pageDark;
      host.setAttribute("data-theme", isDark ? "dark" : "light");
    }
    function appendStreamChunk(chunk) {
      if (!shadow) return;
      const wrapper = shadow.querySelector(".result-content");
      if (!wrapper) return;
      let streamEl = wrapper.querySelector(".result-content.streaming");
      if (!streamChunkReceived) {
        streamChunkReceived = true;
        if (streamProgressTimer) {
          clearTimeout(streamProgressTimer);
          streamProgressTimer = null;
        }
        wrapper.innerHTML = '<div class="result-content streaming"></div>';
        streamEl = wrapper.querySelector(".result-content.streaming");
      }
      if (streamEl) streamEl.textContent += chunk;
    }
    function renderSimpleMarkdown(text) {
      let html = escapeHtml(text);
      html = html.replace(/```([\s\S]*?)```/g, (_m, code) => `<pre style="background:var(--kf-bg-hover);padding:8px;border-radius:6px;overflow-x:auto;font-size:12px;margin:6px 0;"><code>${code}</code></pre>`);
      html = html.replace(
        /`([^`\n]+)`/g,
        '<code style="background:var(--kf-bg-hover);padding:1px 4px;border-radius:3px;font-size:12px;">$1</code>'
      );
      html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      html = html.replace(/(?:^|\n)- (.+)/g, (_m, item) => `
<li>${item}</li>`);
      html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
      html = html.replace(/\n/g, "<br>");
      return html;
    }
    function finalizeStreamResult(fullText) {
      if (!shadow) return;
      aiRequestInFlight = false;
      const wrapper = shadow.querySelector(".result-content");
      if (!wrapper) return;
      const streamEl = wrapper.querySelector(".result-content.streaming");
      const text = fullText || streamEl?.textContent || "";
      if (!text.trim()) {
        showStreamErrorCard({ errorType: "EMPTY_RESULT", message: "AI \u672A\u8FD4\u56DE\u5185\u5BB9", provider: "" });
        return;
      }
      wrapper.innerHTML = `<div class="result-content">${renderSimpleMarkdown(text)}</div>`;
    }
    function showStreamErrorCard(errorInfo) {
      if (!shadow) return;
      aiRequestInFlight = false;
      if (streamProgressTimer) {
        clearTimeout(streamProgressTimer);
        streamProgressTimer = null;
      }
      const html = buildErrorCard(errorInfo);
      updateResultContent(html, true);
      setTimeout(() => {
        if (!shadow) return;
        const card = shadow.querySelector(".ai-error-card");
        if (card) bindErrorCardActions(card, errorInfo);
      }, 220);
    }
    function buildErrorCard(errorInfo) {
      const configs = {
        TIMEOUT: {
          icon: "\u23F1",
          title: "AI \u54CD\u5E94\u8D85\u65F6",
          desc: "AI \u5904\u7406\u65F6\u95F4\u8FC7\u957F\uFF0C\u53EF\u80FD\u662F\u7F51\u7EDC\u6216\u670D\u52A1\u7E41\u5FD9",
          actions: [
            { label: "\u91CD\u8BD5", action: "retry", primary: true },
            { label: "\u5207\u6362\u6A21\u578B", action: "switch-model", primary: false }
          ]
        },
        CONNECTION_ERROR: {
          icon: "\u{1F4E1}",
          title: "\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25",
          desc: "\u65E0\u6CD5\u8FDE\u63A5\u5230 AI \u670D\u52A1\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC",
          actions: [
            { label: "\u91CD\u8BD5", action: "retry", primary: true }
          ]
        },
        CONTENT_TOO_LONG: {
          icon: "\u{1F4C4}",
          title: "\u5185\u5BB9\u8FC7\u957F",
          desc: "\u9009\u4E2D\u6587\u672C\u8D85\u8FC7 5000 \u5B57\uFF0CAI \u96BE\u4EE5\u4E00\u6B21\u6027\u5904\u7406",
          actions: [
            { label: "\u622A\u53D6\u524D 2000 \u5B57\u91CD\u8BD5", action: "retry-trimmed", primary: true }
          ]
        },
        QUOTA_EXHAUSTED: {
          icon: "\u{1F48E}",
          title: "AI \u989D\u5EA6\u7528\u5C3D",
          desc: "\u5F53\u524D\u6A21\u578B\u989D\u5EA6\u5DF2\u7528\u5B8C\uFF0C\u53EF\u5207\u6362\u6A21\u578B\u6216\u7A0D\u540E\u518D\u8BD5",
          actions: [
            { label: "\u6253\u5F00\u8BBE\u7F6E", action: "open-settings", primary: true }
          ]
        },
        EMPTY_RESULT: {
          icon: "\u{1F914}",
          title: "AI \u8FD4\u56DE\u7A7A\u5185\u5BB9",
          desc: "AI \u672A\u7ED9\u51FA\u6709\u6548\u56DE\u7B54\uFF0C\u53EF\u91CD\u8BD5\u6216\u6362\u4E2A\u95EE\u6CD5",
          actions: [
            { label: "\u91CD\u8BD5", action: "retry", primary: true },
            { label: "\u6362\u4E2A\u95EE\u6CD5", action: "rephrase", primary: false }
          ]
        },
        SESSION_EXPIRED: {
          icon: "\u{1F511}",
          title: "\u767B\u5F55\u4F1A\u8BDD\u5931\u6548",
          desc: `${errorInfo.provider || "AI"} \u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55`,
          actions: [
            { label: `\u6253\u5F00 ${errorInfo.provider || "AI"} \u7F51\u9875\u767B\u5F55`, action: "open-login", primary: true }
          ]
        },
        UNKNOWN: {
          icon: "\u26A0\uFE0F",
          title: "AI \u51FA\u9519\u4E86",
          desc: `\u672A\u9884\u671F\u7684\u9519\u8BEF\uFF1A${escapeHtml(errorInfo.message)}`,
          actions: [
            { label: "\u91CD\u8BD5", action: "retry", primary: true },
            { label: "\u590D\u5236\u9519\u8BEF\u4FE1\u606F", action: "copy-error", primary: false }
          ]
        }
      };
      const cfg = configs[errorInfo.errorType] || configs.UNKNOWN;
      const actionsHtml = cfg.actions.map(
        (a) => `<button class="error-btn${a.primary ? " primary" : ""}" data-error-action="${a.action}">${escapeHtml(a.label)}</button>`
      ).join("");
      return `<div class="ai-error-card">
      <div class="error-icon">${cfg.icon}</div>
      <div class="error-title">${escapeHtml(cfg.title)}</div>
      <div class="error-desc">${cfg.desc}</div>
      <div class="error-actions">${actionsHtml}</div>
    </div>`;
    }
    function bindErrorCardActions(cardEl, errorInfo) {
      const btns = cardEl.querySelectorAll(".error-btn");
      btns.forEach((btn) => {
        const act = btn.dataset.errorAction;
        if (!act) return;
        btn.addEventListener("click", () => {
          handleErrorAction(act, errorInfo, btn, cardEl);
        });
      });
    }
    function handleErrorAction(act, errorInfo, btn, cardEl) {
      switch (act) {
        case "retry":
          if (!startRetryCountdown(cardEl)) break;
          restartStreamRequest(lastStreamPrompt);
          break;
        case "retry-trimmed": {
          if (!startRetryCountdown(cardEl)) break;
          const trimmed = lastSelection.slice(0, 2e3);
          const prompt = fillPrompt(lastStreamScenePromptTemplate, trimmed);
          restartStreamRequest(prompt);
          break;
        }
        case "rephrase": {
          if (!startRetryCountdown(cardEl)) break;
          const rephrased = "\u8BF7\u7528\u66F4\u7B80\u6D01\u7684\u65B9\u5F0F\u56DE\u7B54\uFF1A\n\n" + lastStreamPrompt;
          restartStreamRequest(rephrased);
          break;
        }
        case "switch-model":
        case "open-settings":
          try {
            chrome.runtime.sendMessage({ type: "open-settings" });
          } catch {
          }
          break;
        case "open-login": {
          const provider = errorInfo.provider || "";
          const url = provider.toLowerCase().includes("deepseek") ? "https://chat.deepseek.com" : "https://gemini.google.com";
          window.open(url, "_blank");
          break;
        }
        case "copy-error":
          navigator.clipboard.writeText(errorInfo.message).then(() => {
            const orig = btn.textContent;
            btn.textContent = "\u5DF2\u590D\u5236 \u2713";
            setTimeout(() => {
              btn.textContent = orig;
            }, 1500);
          }).catch(() => {
          });
          break;
        default:
          break;
      }
    }
    function startRetryCountdown(cardEl) {
      const now = Date.now();
      if (now < retryAvailableAt) return false;
      retryAvailableAt = now + 3e3;
      const btns = cardEl.querySelectorAll(
        '.error-btn[data-error-action="retry"], .error-btn[data-error-action="retry-trimmed"], .error-btn[data-error-action="rephrase"]'
      );
      let remaining = 3;
      btns.forEach((b) => {
        b.disabled = true;
        b.classList.add("countdown");
        b.setAttribute("data-countdown", String(remaining));
      });
      const timer = window.setInterval(() => {
        remaining -= 1;
        btns.forEach((b) => b.setAttribute("data-countdown", String(Math.max(remaining, 0))));
        if (remaining <= 0) {
          window.clearInterval(timer);
          retryAvailableAt = 0;
          btns.forEach((b) => {
            b.disabled = false;
            b.classList.remove("countdown");
            b.removeAttribute("data-countdown");
          });
        }
      }, 1e3);
      return true;
    }
    function restartStreamRequest(prompt) {
      if (!shadow) return;
      aiRequestInFlight = true;
      streamChunkReceived = false;
      lastStreamPrompt = prompt;
      expandToResult(resultTitle, '<div class="ai-progress"><span class="ai-spinner"></span> \u6B63\u5728\u8FDE\u63A5 AI...</div>', true);
      streamProgressTimer = window.setTimeout(() => {
        if (shadow && !streamChunkReceived) {
          updateResultContent('<div class="ai-progress"><span class="ai-spinner"></span> \u6B63\u5728\u5206\u6790\u5185\u5BB9...</div>', true);
        }
      }, 1500);
      try {
        chrome.runtime.sendMessage({
          type: "ai-inline-stream",
          payload: {
            action: "ai-chat",
            prompt,
            text: lastSelection.trim(),
            title: document.title,
            url: window.location.href
          }
        });
      } catch {
        aiRequestInFlight = false;
        updateResultContent('<div class="ai-error">\u6269\u5C55\u8FDE\u63A5\u5DF2\u5931\u6548\uFF0C\u8BF7\u5237\u65B0\u7F51\u9875\u540E\u91CD\u8BD5\u3002</div>', true);
      }
    }
    function clearShadow() {
      if (!shadow) return;
      shadow.innerHTML = "";
    }
    function positionAt(x, y) {
      if (!host) return;
      const rect = host.getBoundingClientRect();
      const elWidth = rect.width || 200;
      const elHeight = rect.height || 40;
      const left = Math.min(
        Math.max(x - elWidth / 2, 8),
        window.innerWidth - elWidth - 8
      );
      const top = y - elHeight - 8 > 8 ? y - elHeight - 8 : y + 20;
      host.style.left = left + "px";
      host.style.top = top + "px";
      host.style.display = "block";
    }
    function showCapsule() {
      if (!toolbarConfig.enabled) return;
      ensureHost();
      renderCapsule();
      state = "CAPSULE";
      bindCapsuleEvents();
    }
    function hideToolbar() {
      const panel = shadow?.querySelector(".result-panel");
      if (panel?.classList.contains("expanded")) {
        collapseResult();
        setTimeout(() => {
          clearShadow();
          if (host) host.style.display = "none";
          state = "IDLE";
        }, 350);
        return;
      }
      const capsule = shadow?.querySelector(".capsule");
      if (capsule) {
        capsule.style.transition = "opacity 150ms cubic-bezier(0.16, 1, 0.3, 1), transform 150ms cubic-bezier(0.16, 1, 0.3, 1)";
        capsule.style.opacity = "0";
        capsule.style.transform = "scale(0.92) translateY(6px)";
        setTimeout(() => {
          clearShadow();
          if (host) host.style.display = "none";
          state = "IDLE";
        }, 150);
        return;
      }
      clearShadow();
      if (host) host.style.display = "none";
      state = "IDLE";
    }
    function bindCapsuleEvents() {
      if (!shadow) return;
      const capsule = shadow.querySelector(".capsule");
      if (!capsule) return;
      capsule.addEventListener("click", (e) => {
        const btn = e.target.closest(
          "button"
        );
        if (!btn) return;
        const action = btn.dataset.action;
        if (action) handleCapsuleAction(action, btn);
      });
      capsule.addEventListener(
        "mousedown",
        (e) => e.preventDefault()
      );
    }
    function showToast(message) {
      if (!shadow) return;
      const toast = shadow.querySelector(".toast");
      if (!toast) return;
      toast.textContent = message;
      toast.hidden = false;
      setTimeout(() => {
        if (toast) toast.hidden = true;
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
        if (!text) return;
        if (aiRequestInFlight) return;
        aiRequestInFlight = true;
        resultTitle = scene.label;
        btn.classList.add("ripple");
        setTimeout(() => btn.classList.remove("ripple"), 300);
        expandToResult(resultTitle, '<div class="ai-progress"><span class="ai-spinner"></span> \u6B63\u5728\u8FDE\u63A5 AI...</div>', true);
        streamProgressTimer = window.setTimeout(() => {
          if (shadow && !streamChunkReceived) {
            updateResultContent('<div class="ai-progress"><span class="ai-spinner"></span> \u6B63\u5728\u5206\u6790\u5185\u5BB9...</div>', true);
          }
        }, 1500);
        const scenePrompt = fillPrompt(scene.prompt, text);
        lastStreamPrompt = scenePrompt;
        lastStreamScenePromptTemplate = scene.prompt;
        streamChunkReceived = false;
        try {
          chrome.runtime.sendMessage({
            type: "ai-inline-stream",
            payload: {
              action: scene.id,
              prompt: scenePrompt,
              text,
              title: document.title,
              url: window.location.href
            }
          });
        } catch {
          aiRequestInFlight = false;
          if (streamProgressTimer) {
            clearTimeout(streamProgressTimer);
            streamProgressTimer = null;
          }
          updateResultContent('<div class="ai-error">\u6269\u5C55\u8FDE\u63A5\u5DF2\u5931\u6548\uFF0C\u8BF7\u5237\u65B0\u7F51\u9875\u540E\u91CD\u8BD5\u3002</div>', true);
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
        if (selectionDebounceTimer) clearTimeout(selectionDebounceTimer);
        selectionDebounceTimer = window.setTimeout(() => {
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
        }, SELECTION_DEBOUNCE_MS);
      });
      document.addEventListener("mousedown", (e) => {
        if (state === "IDLE") return;
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
          if (state !== "IDLE") hideToolbar();
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
        if (areaName !== "sync") return;
        if (changes.contextScenes || changes.selectionToolbarConfig) loadToolbarSettings();
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
        if (message.type === "gemini-session-status") {
          geminiSessionAlive = message.payload?.alive !== false;
          if (state === "CAPSULE") {
            renderCapsule();
            bindCapsuleEvents();
          }
        }
        if (message.type === "ai-stream-chunk") {
          appendStreamChunk(message.payload?.chunk || "");
        } else if (message.type === "ai-stream-done") {
          finalizeStreamResult(message.payload?.text || "");
        } else if (message.type === "ai-stream-error") {
          const info = message.payload || { errorType: "UNKNOWN", message: "\u672A\u77E5\u9519\u8BEF", provider: "" };
          showStreamErrorCard(info);
        }
        return true;
      });
    }
    init();
  })();
})();
//# sourceMappingURL=toolbar.js.map
