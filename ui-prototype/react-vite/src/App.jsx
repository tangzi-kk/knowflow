import { useState } from "react";
import "./styles.css";

/* ═══════════ MASCOT (Duolingo-style: green round head, white oval eyes) ═══════════ */
function CatMascot({ state = "idle", size = 48, ...props }) {
  const s = state === "ok" ? "idle" : state;
  return (
    <div
      className={["mascot", `mascot-${s}`, props?.className].filter(Boolean).join(" ")}
      style={props?.style}
     data-qoder-id={props?.["data-qoder-id"]} data-qoder-source={props?.["data-qoder-source"]}>
      <svg className="mascot-svg" width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* ── Head — full green circle ── */}
        <circle cx="32" cy="32" r="28" fill="#07C160"/>
        {/* ── Depth shadow at bottom ── */}
        <ellipse cx="32" cy="54" rx="18" ry="5" fill="#058040" opacity="0.2"/>

        {/* ── Eyes ── */}
        {s === "sleeping" ? (
          <>
            <path d="M20 28Q25 23 30 28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <path d="M34 28Q39 23 44 28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          </>
        ) : s === "success" ? (
          <>
            <path d="M20 29Q25 22 30 29" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M34 29Q39 22 44 29" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none"/>
          </>
        ) : (
          <>
            <ellipse cx="24" cy="29" rx="7" ry="8" fill="#FFFFFF"/>
            <ellipse cx="40" cy="29" rx="7" ry="8" fill="#FFFFFF"/>
            <circle cx={s === "error" ? "22" : "25"} cy="30" r="3.5" fill="#1A3A28"/>
            <circle cx={s === "error" ? "38" : "41"} cy="30" r="3.5" fill="#1A3A28"/>
            <circle cx={s === "error" ? "21" : "24"} cy="28.5" r="1.2" fill="#FFFFFF"/>
            <circle cx={s === "error" ? "37" : "40"} cy="28.5" r="1.2" fill="#FFFFFF"/>
          </>
        )}

        {/* ── Mouth ── */}
        {s === "success" ? (
          <path d="M24 40Q32 48 40 40" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        ) : s === "error" ? (
          <path d="M26 44Q32 40 38 44" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none"/>
        ) : s === "sleeping" ? (
          <ellipse cx="32" cy="42" rx="4" ry="2.5" fill="#058040" opacity="0.5"/>
        ) : (
          <path d="M26 41Q32 47 38 41" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none"/>
        )}

        {/* ── State decorations ── */}
        {s === "success" && (
          <>
            <text x="4" y="16" fontSize="10" fill="#A8EFC7" className="star-particle">&#9733;</text>
            <text x="52" y="12" fontSize="8" fill="#FFFFFF" className="star-particle">&#9733;</text>
            <text x="54" y="24" fontSize="6" fill="#A8EFC7" className="star-particle">&#10022;</text>
          </>
        )}
        {s === "sleeping" && (
          <>
            <text x="48" y="20" fontSize="10" fill="#A8EFC7" fontWeight="700">z</text>
            <text x="53" y="13" fontSize="7" fill="#A8EFC7" fontWeight="700" opacity="0.5">z</text>
            <text x="56" y="7" fontSize="5" fill="#A8EFC7" fontWeight="700" opacity="0.3">z</text>
          </>
        )}
        {s === "loading" && (
          <>
            <circle cx="24" cy="7" r="1.5" fill="#FFFFFF" className="orbit-dot"/>
            <circle cx="32" cy="5" r="1.8" fill="#A8EFC7" className="orbit-dot"/>
            <circle cx="40" cy="7" r="1.5" fill="#FFFFFF" className="orbit-dot"/>
          </>
        )}
      </svg>
    </div>
  );
}




/* ═══════════ THEME TOGGLE ═══════════ */
function ThemeToggle({ theme, onToggle, ...qoderProps }) {
  return (
    <button className={["btn btn-ghost btn-sm", qoderProps?.className].filter(Boolean).join(" ")} onClick={onToggle} style={{ ...({ position: "fixed", top: 16, right: 16, zIndex: 99, background: "var(--c-surface)", borderRadius: "var(--r-md)" }), ...(qoderProps?.style) }} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      {theme === "light" ? "🌙 暗色" : "☀️ 亮色"}
    </button>
  );
}

/* ═══════════ POPUP PREVIEW ═══════════ */
function PopupPreview(qoderProps) {
  const [toolbarOn, setToolbarOn] = useState(true);
  const [connState, setConnState] = useState("ok");
  const [host, setHost] = useState("127.0.0.1");
  const [port, setPort] = useState("4567");
  const [token, setToken] = useState("");

  return (
    <div style={{ ...({ width: 380, background: "var(--c-bg)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-lg)", border: "0.5px solid var(--c-divider)" }), ...(qoderProps?.style) }} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      {/* Status Bar */}
      <div className={`status-bar status-bar-${connState}`} style={{ borderRadius: 0, justifyContent: "space-between" }} data-qoder-id="qel-div-aa947880" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-aa947880&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:94,&quot;column&quot;:7}}">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} data-qoder-id="qel-div-ab947a13" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ab947a13&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:95,&quot;column&quot;:9}}">
          <div className="status-dot"  data-qoder-id="qel-status-dot-e327fc5b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-status-dot-e327fc5b&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;status-dot&quot;,&quot;loc&quot;:{&quot;line&quot;:96,&quot;column&quot;:11}}"/>
          <span data-qoder-id="qel-span-d74020a1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-d74020a1&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:97,&quot;column&quot;:11}}">{connState === "ok" ? "已连接" : connState === "error" ? "连接失败" : "检测中…"}</span>
        </div>
        <span className="chip chip-badge chip-brand" style={{ height: 20, padding: "0 6px", fontSize: 10 }} data-qoder-id="qel-chip-c51fa43e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-c51fa43e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:99,&quot;column&quot;:9}}">
          我的知识库
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "0 0 16px" }} data-qoder-id="qel-div-af94805f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-af94805f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:105,&quot;column&quot;:7}}">
        {/* Hero Mascot Row */}
        <div style={{ padding: "14px 14px 8px", display: "flex", alignItems: "center", gap: 12, background: "var(--c-brand-soft)", borderBottom: "0.5px solid var(--c-divider)" }} data-qoder-id="qel-div-b494883e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b494883e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:107,&quot;column&quot;:9}}">
          <CatMascot state="idle" size={36}  data-qoder-id="qel-catmascot-f45060bd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-catmascot-f45060bd&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;catmascot&quot;,&quot;loc&quot;:{&quot;line&quot;:108,&quot;column&quot;:11}}"/>
          <div data-qoder-id="qel-div-2e887c59" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-2e887c59&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:109,&quot;column&quot;:11}}">
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--c-text)" }} data-qoder-id="qel-div-2d887ac6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-2d887ac6&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:110,&quot;column&quot;:13}}">Hi，知识收集者</div>
            <div className="caption" data-qoder-id="qel-caption-732ed728" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-caption-732ed728&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;caption&quot;,&quot;loc&quot;:{&quot;line&quot;:111,&quot;column&quot;:13}}">今天也要同步干货哦</div>
          </div>
        </div>

        {/* Toolbar Toggle */}
        <div style={{ padding: "12px 14px", borderBottom: "0.5px solid var(--c-divider)" }} data-qoder-id="qel-div-2b8877a0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-2b8877a0&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:116,&quot;column&quot;:9}}">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} data-qoder-id="qel-div-328882a5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-328882a5&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:117,&quot;column&quot;:11}}">
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--c-text)" }} data-qoder-id="qel-span-47478cb6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-47478cb6&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:118,&quot;column&quot;:13}}">悬浮工具栏</span>
            <label className="switch" data-qoder-id="qel-switch-24dde223" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-switch-24dde223&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;switch&quot;,&quot;loc&quot;:{&quot;line&quot;:119,&quot;column&quot;:13}}">
              <input type="checkbox" checked={toolbarOn} onChange={() => setToolbarOn(!toolbarOn)}  data-qoder-id="qel-input-6a969648" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-6a969648&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:120,&quot;column&quot;:15}}"/>
              <span className="switch-track"  data-qoder-id="qel-switch-track-80fb2a03" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-switch-track-80fb2a03&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;switch-track&quot;,&quot;loc&quot;:{&quot;line&quot;:121,&quot;column&quot;:15}}"/>
            </label>
          </div>
          <span className="caption" style={{ display: "block", marginTop: 4 }} data-qoder-id="qel-caption-b0a8515e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-caption-b0a8515e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;caption&quot;,&quot;loc&quot;:{&quot;line&quot;:124,&quot;column&quot;:11}}">
            选中文字后出现 AI 浮动工具栏
          </span>
        </div>

        {/* Hero Actions */}
        <div style={{ padding: "14px 14px 8px", display: "flex", flexDirection: "column", gap: 8 }} data-qoder-id="qel-div-28863450" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-28863450&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:130,&quot;column&quot;:9}}">
          <button className="btn btn-primary btn-lg" style={{ width: "100%" }} data-qoder-id="qel-btn-e32b993d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-e32b993d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:131,&quot;column&quot;:11}}">
            打开同步面板
          </button>
          <div style={{ display: "flex", gap: 8 }} data-qoder-id="qel-div-2a863776" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-2a863776&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:134,&quot;column&quot;:11}}">
            <button className="btn btn-secondary btn-md" style={{ flex: 1 }} data-qoder-id="qel-btn-e12b9617" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-e12b9617&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:135,&quot;column&quot;:13}}">
              AI 助手
            </button>
            <button className="btn btn-secondary btn-md" style={{ padding: "0 12px", fontSize: 15 }} data-qoder-id="qel-btn-de2b915e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-de2b915e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:138,&quot;column&quot;:13}}">
              ⚙
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider" style={{ padding: "4px 16px" }} data-qoder-id="qel-section-divider-45ea9aaf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-section-divider-45ea9aaf&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;section-divider&quot;,&quot;loc&quot;:{&quot;line&quot;:145,&quot;column&quot;:9}}">
          <span data-qoder-id="qel-span-c4447fe6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-c4447fe6&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:146,&quot;column&quot;:11}}">连接</span>
        </div>

        {/* Connection Form */}
        <div style={{ padding: "8px 14px 16px", display: "flex", flexDirection: "column", gap: 10 }} data-qoder-id="qel-div-2f863f55" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-2f863f55&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:150,&quot;column&quot;:9}}">
          <div data-qoder-id="qel-div-308640e8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-308640e8&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:151,&quot;column&quot;:11}}">
            <span className="small-label" style={{ display: "block", marginBottom: 4 }} data-qoder-id="qel-small-label-99047b81" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-small-label-99047b81&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;small-label&quot;,&quot;loc&quot;:{&quot;line&quot;:152,&quot;column&quot;:13}}">主机 & 端口</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }} data-qoder-id="qel-div-3a8d0c6b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-3a8d0c6b&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:153,&quot;column&quot;:13}}">
              <input className="input input-md" value={host} onChange={e => setHost(e.target.value)} style={{ flex: 1 }}  data-qoder-id="qel-input-dc9bc6ec" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-dc9bc6ec&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:154,&quot;column&quot;:15}}"/>
              <span style={{ color: "var(--c-text-3)", fontWeight: 500 }} data-qoder-id="qel-span-5a4c27cd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-5a4c27cd&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:155,&quot;column&quot;:15}}">:</span>
              <input className="input input-md" value={port} onChange={e => setPort(e.target.value)} style={{ width: 72, fontFamily: "var(--font-mono)", fontSize: 12 }}  data-qoder-id="qel-input-de9bca12" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-de9bca12&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:156,&quot;column&quot;:15}}"/>
            </div>
          </div>
          <div data-qoder-id="qel-div-3e8d12b7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-3e8d12b7&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:159,&quot;column&quot;:11}}">
            <span className="small-label" style={{ display: "block", marginBottom: 4 }} data-qoder-id="qel-small-label-a5024fce" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-small-label-a5024fce&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;small-label&quot;,&quot;loc&quot;:{&quot;line&quot;:160,&quot;column&quot;:13}}">令牌</span>
            <input className="input input-md" value={token} onChange={e => setToken(e.target.value)} style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}  data-qoder-id="qel-input-db9bc559" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-db9bc559&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:161,&quot;column&quot;:13}}"/>
          </div>
          <div style={{ display: "flex", gap: 8 }} data-qoder-id="qel-div-3f8d144a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-3f8d144a&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:163,&quot;column&quot;:11}}">
            <button className="btn btn-secondary btn-sm" onClick={() => setConnState("ok")} data-qoder-id="qel-btn-d4294309" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-d4294309&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:164,&quot;column&quot;:13}}">测试连接</button>
            <button className="btn btn-primary btn-sm" data-qoder-id="qel-btn-d3294176" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-d3294176&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;PopupPreview&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:165,&quot;column&quot;:13}}">保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ SVG ICONS (inline, no emoji) ═══════════ */
const SvgIcons = {
  folder: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props} data-qoder-id="qel-svg-128dfd08" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-128dfd08&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:241,&quot;column&quot;:22}}"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" data-qoder-id="qel-path-1059201d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-1059201d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:241,&quot;column&quot;:178}}"/></svg>,
  folderOpen: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props} data-qoder-id="qel-svg-188e067a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-188e067a&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:242,&quot;column&quot;:26}}"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2H3V7z" data-qoder-id="qel-path-0a5916ab" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-0a5916ab&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:242,&quot;column&quot;:182}}"/><path d="M3 9h18l-2 8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" data-qoder-id="qel-path-0b59183e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-0b59183e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:242,&quot;column&quot;:235}}"/></svg>,
  tag: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props} data-qoder-id="qel-svg-178e04e7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-178e04e7&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:243,&quot;column&quot;:19}}"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" data-qoder-id="qel-path-05590ecc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-05590ecc&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:243,&quot;column&quot;:175}}"/><line x1="7" y1="7" x2="7.01" y2="7" data-qoder-id="qel-line-bab6fbc9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-bab6fbc9&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:243,&quot;column&quot;:262}}"/></svg>,
  star: (filled, props) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props} data-qoder-id="qel-svg-82a446c2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-82a446c2&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:244,&quot;column&quot;:28}}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" data-qoder-id="qel-polygon-1ccf7721" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-polygon-1ccf7721&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;polygon&quot;,&quot;loc&quot;:{&quot;line&quot;:244,&quot;column&quot;:212}}"/></svg>,
  doc: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props} data-qoder-id="qel-svg-80a4439c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-80a4439c&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:245,&quot;column&quot;:19}}"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" data-qoder-id="qel-path-d21a3e8d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-d21a3e8d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:245,&quot;column&quot;:175}}"/><polyline points="14 2 14 8 20 8" data-qoder-id="qel-polyline-0be35086" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-polyline-0be35086&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;polyline&quot;,&quot;loc&quot;:{&quot;line&quot;:245,&quot;column&quot;:240}}"/></svg>,
  spark: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props} data-qoder-id="qel-svg-7fa44209" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-7fa44209&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:246,&quot;column&quot;:21}}"><path d="M12 3l1.5 5L19 9.5 13.5 11 12 16l-1.5-5L5 9.5 10.5 8z" data-qoder-id="qel-path-cd1a36ae" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-cd1a36ae&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:246,&quot;column&quot;:177}}"/></svg>,
  check: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} data-qoder-id="qel-svg-7da43ee3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-7da43ee3&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:247,&quot;column&quot;:21}}"><polyline points="20 6 9 17 4 12" data-qoder-id="qel-polyline-17e3636a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-polyline-17e3636a&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;polyline&quot;,&quot;loc&quot;:{&quot;line&quot;:247,&quot;column&quot;:175}}"/></svg>,
  send: (props) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} data-qoder-id="qel-svg-8ba454ed" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-8ba454ed&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:248,&quot;column&quot;:20}}"><line x1="22" y1="2" x2="11" y2="13" data-qoder-id="qel-line-7efe636b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-7efe636b&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:248,&quot;column&quot;:174}}"/><polygon points="22 2 15 22 11 13 2 9 22 2" data-qoder-id="qel-polygon-20d1bc04" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-polygon-20d1bc04&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;polygon&quot;,&quot;loc&quot;:{&quot;line&quot;:248,&quot;column&quot;:212}}"/></svg>,
  clip: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props} data-qoder-id="qel-svg-8aa691f1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-8aa691f1&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:249,&quot;column&quot;:20}}"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" data-qoder-id="qel-path-d21c7d24" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-d21c7d24&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:249,&quot;column&quot;:176}}"/></svg>,
  trash: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props} data-qoder-id="qel-svg-8ca69517" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-8ca69517&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:250,&quot;column&quot;:21}}"><polyline points="3 6 5 6 21 6" data-qoder-id="qel-polyline-18e5a394" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-polyline-18e5a394&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;polyline&quot;,&quot;loc&quot;:{&quot;line&quot;:250,&quot;column&quot;:177}}"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" data-qoder-id="qel-path-cf1c786b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-cf1c786b&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:250,&quot;column&quot;:210}}"/></svg>,
  refresh: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props} data-qoder-id="qel-svg-8da696aa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-8da696aa&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:251,&quot;column&quot;:23}}"><polyline points="23 4 23 10 17 10" data-qoder-id="qel-polyline-0de59243" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-polyline-0de59243&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;polyline&quot;,&quot;loc&quot;:{&quot;line&quot;:251,&quot;column&quot;:179}}"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" data-qoder-id="qel-path-cc1c73b2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-cc1c73b2&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:251,&quot;column&quot;:216}}"/></svg>,
  chevron: (dir, props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform: dir === "down" ? "rotate(0deg)" : dir === "up" ? "rotate(180deg)" : dir === "left" ? "rotate(90deg)" : "rotate(-90deg)"}} {...props} data-qoder-id="qel-svg-f69eed30" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-f69eed30&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:252,&quot;column&quot;:28}}"><polyline points="6 9 12 15 18 9" data-qoder-id="qel-polyline-84ddfed3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-polyline-84ddfed3&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;polyline&quot;,&quot;loc&quot;:{&quot;line&quot;:252,&quot;column&quot;:323}}"/></svg>,
  popup: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props} data-qoder-id="qel-svg-f89ef056" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-f89ef056&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:253,&quot;column&quot;:21}}"><rect x="3" y="3" width="18" height="18" rx="2" data-qoder-id="qel-rect-28d12259" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rect-28d12259&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;rect&quot;,&quot;loc&quot;:{&quot;line&quot;:253,&quot;column&quot;:177}}"/><line x1="3" y1="9" x2="21" y2="9" data-qoder-id="qel-line-70f7919c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-70f7919c&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:253,&quot;column&quot;:226}}"/></svg>,
  panel: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props} data-qoder-id="qel-svg-fb9ef50f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-fb9ef50f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:254,&quot;column&quot;:21}}"><rect x="3" y="3" width="18" height="18" rx="2" data-qoder-id="qel-rect-2bd12712" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rect-2bd12712&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;rect&quot;,&quot;loc&quot;:{&quot;line&quot;:254,&quot;column&quot;:177}}"/><line x1="15" y1="3" x2="15" y2="21" data-qoder-id="qel-line-73f79655" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-73f79655&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:254,&quot;column&quot;:226}}"/></svg>,
  gear: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props} data-qoder-id="qel-svg-fe9ef9c8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-fe9ef9c8&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:255,&quot;column&quot;:20}}"><line x1="4" y1="21" x2="4" y2="14" data-qoder-id="qel-line-75f7997b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-75f7997b&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:255,&quot;column&quot;:176}}"/><line x1="4" y1="10" x2="4" y2="3" data-qoder-id="qel-line-72f9d359" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-72f9d359&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:255,&quot;column&quot;:213}}"/><line x1="12" y1="21" x2="12" y2="12" data-qoder-id="qel-line-71f9d1c6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-71f9d1c6&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:255,&quot;column&quot;:249}}"/><line x1="12" y1="8" x2="12" y2="3" data-qoder-id="qel-line-70f9d033" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-70f9d033&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:255,&quot;column&quot;:288}}"/><line x1="20" y1="21" x2="20" y2="16" data-qoder-id="qel-line-6ff9cea0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-6ff9cea0&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:255,&quot;column&quot;:325}}"/><line x1="20" y1="12" x2="20" y2="3" data-qoder-id="qel-line-76f9d9a5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-76f9d9a5&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:255,&quot;column&quot;:364}}"/><line x1="1" y1="14" x2="7" y2="14" data-qoder-id="qel-line-75f9d812" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-75f9d812&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:255,&quot;column&quot;:402}}"/><line x1="9" y1="8" x2="15" y2="8" data-qoder-id="qel-line-74f9d67f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-74f9d67f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:255,&quot;column&quot;:439}}"/><line x1="17" y1="16" x2="23" y2="16" data-qoder-id="qel-line-73f9d4ec" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-73f9d4ec&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:255,&quot;column&quot;:475}}"/></svg>,
};

/* ═══════════ SIDE PANEL - SYNC TAB ═══════════ */
function SidePanelSync(qoderProps) {
  const [selectedTags, setSelectedTags] = useState(["效率工具", "浏览器插件"]);
  const [selectedRating, setSelectedRating] = useState(3);
  const [selectedDir, setSelectedDir] = useState("Inbox/浏览器剪藏");
  const [syncState, setSyncState] = useState("ready");
  const [showYaml, setShowYaml] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState({ tags: ["知识管理", "Markdown"], summary: "Chrome MV3 迁移指南，涵盖 Service Worker 生命周期、权限模型和 declarativeNetRequest。" });

  const tags = ["效率工具", "浏览器插件", "知识管理", "Obsidian", "飞书", "AI", "Markdown"];
  const dirs = [
    { name: "笔记", depth: 0, icon: "folder" },
    { name: "项目", depth: 0, icon: "folder" },
    { name: "Inbox", depth: 0, icon: "folderOpen" },
    { name: "浏览器剪藏", depth: 1, icon: "folder" },
    { name: "微信收藏", depth: 1, icon: "folder" },
    { name: "模板", depth: 0, icon: "folder" },
  ];
  const steps = [
    { label: "检测", done: true },
    { label: "目录", done: true },
    { label: "属性", active: true },
    { label: "同步", done: false },
  ];

  const handleSync = () => {
    if (syncState === "ready") {
      setSyncState("syncing");
      setTimeout(() => setSyncState("done"), 2000);
    } else if (syncState === "done") {
      setSyncState("ready");
    }
  };

  return (
    <div style={{ ...({ display: "flex", flexDirection: "column", height: "100%" }), ...(qoderProps?.style) }} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      {/* ── Progress Bar ── */}
      <div style={{ padding: "10px 14px", borderBottom: "0.5px solid var(--c-divider)", background: "var(--c-surface)", display: "flex", alignItems: "center", gap: 4 }} data-qoder-id="qel-div-fa82e9bb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fa82e9bb&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:292,&quot;column&quot;:7}}">
        {steps.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i === steps.length - 1 ? "0 0 auto" : "1 1 auto" }} data-qoder-id="qel-div-ff82f19a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ff82f19a&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:294,&quot;column&quot;:11}}">
            <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: step.done || step.active ? 1 : 0.35, transition: "opacity 0.2s" }} data-qoder-id="qel-div-0082f32d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-0082f32d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:295,&quot;column&quot;:13}}">
              <div style={{
                width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, flexShrink: 0,
                background: step.done ? "var(--c-brand)" : step.active ? "var(--c-brand)" : "var(--c-bg-soft)",
                color: step.done || step.active ? "#fff" : "var(--c-text-3)",
                boxShadow: step.active ? "0 0 0 3px var(--c-brand-soft)" : "none",
                transition: "all 0.3s",
              }} data-qoder-id="qel-div-fd82ee74" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fd82ee74&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:296,&quot;column&quot;:15}}">
                {step.done ? <SvgIcons.check width={12} height={12}  data-qoder-id="qel-svgicons-check-ac17dee4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-check-ac17dee4&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;svgicons-check&quot;,&quot;loc&quot;:{&quot;line&quot;:304,&quot;column&quot;:30}}"/> : i + 1}
              </div>
              <span style={{ fontSize: 11, fontWeight: step.active ? 600 : 500, color: step.active ? "var(--c-text)" : "var(--c-text-2)", whiteSpace: "nowrap" }} data-qoder-id="qel-span-59e7c512" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-59e7c512&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:306,&quot;column&quot;:15}}">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: step.done ? "var(--c-brand)" : "var(--c-bg-soft)", margin: "0 6px", borderRadius: 1, transition: "background 0.3s" }}  data-qoder-id="qel-div-f482e049" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f482e049&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:309,&quot;column&quot;:15}}"/>
            )}
          </div>
        ))}
      </div>

      {/* ── Document Summary Card ── */}
      <div style={{ margin: "10px 14px", padding: 12, borderRadius: "var(--r-md)", background: "var(--c-brand-soft)", border: "0.5px solid var(--c-brand-soft-border, rgba(7,193,96,0.15))", display: "flex", gap: 10 }} data-qoder-id="qel-div-01853357" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-01853357&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:316,&quot;column&quot;:7}}">
        <div style={{ width: 36, height: 36, borderRadius: "var(--r-sm)", background: "var(--c-brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff" }} data-qoder-id="qel-div-008531c4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-008531c4&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:317,&quot;column&quot;:9}}">
          <SvgIcons.doc width={18} height={18}  data-qoder-id="qel-svgicons-doc-0528a90a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-doc-0528a90a&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;svgicons-doc&quot;,&quot;loc&quot;:{&quot;line&quot;:318,&quot;column&quot;:11}}"/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }} data-qoder-id="qel-div-028534ea" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-028534ea&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:320,&quot;column&quot;:9}}">
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} data-qoder-id="qel-div-fd852d0b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fd852d0b&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:321,&quot;column&quot;:11}}">
            Chrome 扩展开发指南：Manifest V3 迁移
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }} data-qoder-id="qel-div-fc852b78" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fc852b78&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:324,&quot;column&quot;:11}}">
            <span className="caption" style={{ fontSize: 11 }} data-qoder-id="qel-caption-fdc78b11" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-caption-fdc78b11&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;caption&quot;,&quot;loc&quot;:{&quot;line&quot;:325,&quot;column&quot;:13}}">飞书文档</span>
            <span style={{ color: "var(--c-text-4)" }} data-qoder-id="qel-span-4ce9ef32" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-4ce9ef32&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:326,&quot;column&quot;:13}}">·</span>
            <span className="caption" style={{ fontSize: 11 }} data-qoder-id="qel-caption-f7c7819f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-caption-f7c7819f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;caption&quot;,&quot;loc&quot;:{&quot;line&quot;:327,&quot;column&quot;:13}}">3,240 字</span>
            <span style={{ color: "var(--c-text-4)" }} data-qoder-id="qel-span-4ee9f258" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-4ee9f258&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:328,&quot;column&quot;:13}}">·</span>
            <span className="caption" style={{ fontSize: 11 }} data-qoder-id="qel-caption-f5b63558" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-caption-f5b63558&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;caption&quot;,&quot;loc&quot;:{&quot;line&quot;:329,&quot;column&quot;:13}}">12 分钟阅读</span>
          </div>
        </div>
      </div>

      {/* ── Scrollable Form ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 14px 10px" }} data-qoder-id="qel-div-f873dc0b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f873dc0b&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:335,&quot;column&quot;:7}}">
        {/* Target Directory */}
        <div style={{ marginBottom: 12 }} data-qoder-id="qel-div-f973dd9e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f973dd9e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:337,&quot;column&quot;:9}}">
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }} data-qoder-id="qel-div-fa73df31" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fa73df31&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:338,&quot;column&quot;:11}}">
            <SvgIcons.folder width={14} height={14} style={{ color: "var(--c-text-2)" }}  data-qoder-id="qel-svgicons-folder-577cbb75" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-folder-577cbb75&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;svgicons-folder&quot;,&quot;loc&quot;:{&quot;line&quot;:339,&quot;column&quot;:13}}"/>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)" }} data-qoder-id="qel-span-caecf423" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-caecf423&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:340,&quot;column&quot;:13}}">目标目录</span>
          </div>
          <div style={{ borderRadius: "var(--r-md)", border: "0.5px solid var(--c-border)", overflow: "hidden" }} data-qoder-id="qel-div-fd73e3ea" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fd73e3ea&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:342,&quot;column&quot;:11}}">
            {dirs.map((item, i) => (
              <button
                key={i}
                onClick={() => setSelectedDir(`${item.depth === 0 ? "" : "Inbox/"}${item.name}`)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", paddingLeft: 10 + item.depth * 16,
                  border: "none", borderBottom: i < dirs.length - 1 ? "0.5px solid var(--c-divider)" : "none",
                  background: selectedDir.includes(item.name) ? "var(--c-brand-soft)" : "var(--c-surface)",
                  color: selectedDir.includes(item.name) ? "var(--c-brand)" : "var(--c-text-2)",
                  fontSize: 13, fontWeight: selectedDir.includes(item.name) ? 600 : 500,
                  cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                }}
               data-qoder-id="qel-button-99f59015" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-99f59015&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:344,&quot;column&quot;:15}}">
                {item.icon === "folderOpen" ? <SvgIcons.folderOpen width={14} height={14}  data-qoder-id="qel-svgicons-folderopen-ea64b255" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-folderopen-ea64b255&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;svgicons-folderopen&quot;,&quot;loc&quot;:{&quot;line&quot;:357,&quot;column&quot;:47}}"/> : <SvgIcons.folder width={14} height={14}  data-qoder-id="qel-svgicons-folder-5a7cc02e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-folder-5a7cc02e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;svgicons-folder&quot;,&quot;loc&quot;:{&quot;line&quot;:357,&quot;column&quot;:96}}"/>}
                {item.name}
                {selectedDir.includes(item.name) && <SvgIcons.check width={12} height={12} style={{ marginLeft: "auto" }}  data-qoder-id="qel-svgicons-check-a924a61e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-check-a924a61e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;svgicons-check&quot;,&quot;loc&quot;:{&quot;line&quot;:359,&quot;column&quot;:53}}"/>}
              </button>
            ))}
          </div>
        </div>

        {/* YAML Properties */}
        <div style={{ marginBottom: 12 }} data-qoder-id="qel-div-fc7620ee" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fc7620ee&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:366,&quot;column&quot;:9}}">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }} data-qoder-id="qel-div-fb761f5b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fb761f5b&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:367,&quot;column&quot;:11}}">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }} data-qoder-id="qel-div-fa761dc8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fa761dc8&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:368,&quot;column&quot;:13}}">
              <SvgIcons.tag width={14} height={14} style={{ color: "var(--c-text-2)" }}  data-qoder-id="qel-svgicons-tag-a88a2926" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-tag-a88a2926&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;svgicons-tag&quot;,&quot;loc&quot;:{&quot;line&quot;:369,&quot;column&quot;:15}}"/>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)" }} data-qoder-id="qel-span-ceef3906" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-ceef3906&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:370,&quot;column&quot;:15}}">YAML 属性</span>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, gap: 4 }} data-qoder-id="qel-btn-fea606f1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-fea606f1&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:372,&quot;column&quot;:13}}">
              <SvgIcons.spark width={12} height={12}  data-qoder-id="qel-svgicons-spark-e5390f9d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-spark-e5390f9d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;svgicons-spark&quot;,&quot;loc&quot;:{&quot;line&quot;:373,&quot;column&quot;:15}}"/> AI 建议
            </button>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: 10 }} data-qoder-id="qel-div-f57615e9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f57615e9&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:378,&quot;column&quot;:11}}">
            <span className="small-label" style={{ display: "block", marginBottom: 6 }} data-qoder-id="qel-small-label-55bb4690" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-small-label-55bb4690&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;small-label&quot;,&quot;loc&quot;:{&quot;line&quot;:379,&quot;column&quot;:13}}">标签</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }} data-qoder-id="qel-div-03786a8a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-03786a8a&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:380,&quot;column&quot;:13}}">
              {tags.map(tag => {
                const selected = selectedTags.includes(tag);
                const suggested = aiSuggestions.tags.includes(tag) && !selected;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      if (selected) setSelectedTags(selectedTags.filter(t => t !== tag));
                      else setSelectedTags([...selectedTags, tag]);
                    }}
                    className={`chip ${selected ? "chip-active" : ""}`}
                    style={suggested ? { borderColor: "var(--c-brand)", borderStyle: "dashed" } : {}}
                   data-qoder-id="qel-button-9ffa16b5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-9ffa16b5&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:385,&quot;column&quot;:19}}">
                    {suggested && <SvgIcons.spark width={10} height={10} style={{ marginRight: 2 }}  data-qoder-id="qel-svgicons-spark-524076f9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-spark-524076f9&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;svgicons-spark&quot;,&quot;loc&quot;:{&quot;line&quot;:394,&quot;column&quot;:35}}"/>}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div style={{ marginBottom: 10 }} data-qoder-id="qel-div-027868f7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-027868f7&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:403,&quot;column&quot;:11}}">
            <span className="small-label" style={{ display: "block", marginBottom: 6 }} data-qoder-id="qel-small-label-d0b3b96c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-small-label-d0b3b96c&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;small-label&quot;,&quot;loc&quot;:{&quot;line&quot;:404,&quot;column&quot;:13}}">评分</span>
            <div style={{ display: "flex", gap: 4 }} data-qoder-id="qel-div-007865d1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-007865d1&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:405,&quot;column&quot;:13}}">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setSelectedRating(n)}
                  style={{
                    border: "none", background: "none", cursor: "pointer",
                    color: n <= selectedRating ? "#FA9D3B" : "var(--c-text-4)",
                    padding: "2px", transition: "color 0.15s",
                  }}
                 data-qoder-id="qel-button-98fa0bb0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-98fa0bb0&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:407,&quot;column&quot;:17}}">
                  {SvgIcons.star(n <= selectedRating, { width: 16, height: 16 })}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{ marginBottom: 10 }} data-qoder-id="qel-div-fe7862ab" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fe7862ab&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:423,&quot;column&quot;:11}}">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }} data-qoder-id="qel-div-fb785df2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fb785df2&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:424,&quot;column&quot;:13}}">
              <span className="small-label" data-qoder-id="qel-small-label-d5b3c14b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-small-label-d5b3c14b&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;small-label&quot;,&quot;loc&quot;:{&quot;line&quot;:425,&quot;column&quot;:15}}">摘要</span>
              <button onClick={() => setAiSuggestions({ ...aiSuggestions })} className="btn btn-ghost btn-sm" style={{ fontSize: 11, gap: 3, padding: "2px 6px" }} data-qoder-id="qel-btn-74a0b085" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-74a0b085&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:426,&quot;column&quot;:15}}">
                <SvgIcons.spark width={10} height={10}  data-qoder-id="qel-svgicons-spark-6b3e5fbd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-spark-6b3e5fbd&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;svgicons-spark&quot;,&quot;loc&quot;:{&quot;line&quot;:427,&quot;column&quot;:17}}"/> 重生成
              </button>
            </div>
            <textarea
              className="input"
              rows={2}
              defaultValue={aiSuggestions.summary}
              style={{ fontSize: 12, minHeight: 48, resize: "none" }}
             data-qoder-id="qel-input-a1d97c85" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-a1d97c85&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:430,&quot;column&quot;:13}}"/>
          </div>

          {/* YAML Preview */}
          <button
            onClick={() => setShowYaml(!showYaml)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", border: "0.5px solid var(--c-border)", borderRadius: "var(--r-sm)", background: "var(--c-bg-soft)", fontSize: 11, fontWeight: 600, color: "var(--c-text-2)", cursor: "pointer" }}
           data-qoder-id="qel-button-a5fc5ebe" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-a5fc5ebe&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:439,&quot;column&quot;:11}}">
            <span data-qoder-id="qel-span-dbf3caab" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-dbf3caab&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:443,&quot;column&quot;:13}}">YAML 预览</span>
            {SvgIcons.chevron(showYaml ? "down" : "up", { width: 12, height: 12 })}
          </button>
          {showYaml && (
            <pre style={{
              margin: "6px 0 0", padding: 10, borderRadius: "var(--r-sm)",
              background: "var(--neutral-900)", color: "#B5E8C8",
              fontSize: 11, fontFamily: "var(--font-mono)", lineHeight: 1.6,
              overflow: "auto", maxHeight: 160,
            }} data-qoder-id="qel-pre-ddd6afb4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pre-ddd6afb4&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;pre&quot;,&quot;loc&quot;:{&quot;line&quot;:447,&quot;column&quot;:13}}">{`---
source: feishu
url: docs.feishu.cn/d/1abc
title: Chrome 扩展开发指南
tags: [${selectedTags.join(", ")}]
rating: ${"★".repeat(selectedRating)}
date: 2026-06-25
---`}</pre>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: "10px 14px 14px", borderTop: "0.5px solid var(--c-divider)", background: "var(--c-surface)" }} data-qoder-id="qel-div-6f7b5325" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-6f7b5325&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:465,&quot;column&quot;:7}}">
        {syncState === "done" ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "8px 0" }} data-qoder-id="qel-div-6e7b5192" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-6e7b5192&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:467,&quot;column&quot;:11}}">
            <CatMascot state="success" size={40}  data-qoder-id="qel-catmascot-08655a77" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-catmascot-08655a77&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;catmascot&quot;,&quot;loc&quot;:{&quot;line&quot;:468,&quot;column&quot;:13}}"/>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--c-brand)" }} data-qoder-id="qel-span-d6f3c2cc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-d6f3c2cc&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:469,&quot;column&quot;:13}}">同步成功！已保存到 Obsidian</span>
            <button onClick={handleSync} className="btn btn-secondary btn-sm" style={{ marginTop: 4 }} data-qoder-id="qel-btn-f285a062" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-f285a062&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:470,&quot;column&quot;:13}}">继续同步</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }} data-qoder-id="qel-div-806a24c7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-806a24c7&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:474,&quot;column&quot;:13}}">
              <span className="caption" data-qoder-id="qel-caption-7fac813a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-caption-7fac813a&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;caption&quot;,&quot;loc&quot;:{&quot;line&quot;:475,&quot;column&quot;:15}}">目标：{selectedDir}</span>
              <span className="caption" data-qoder-id="qel-caption-80ac82cd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-caption-80ac82cd&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;caption&quot;,&quot;loc&quot;:{&quot;line&quot;:476,&quot;column&quot;:15}}">3,240 字 · 2 张图片</span>
            </div>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: "100%", ...(syncState === "syncing" ? { opacity: 0.8 } : {}) }}
              onClick={handleSync}
              disabled={syncState === "syncing"}
             data-qoder-id="qel-btn-ee859a16" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-ee859a16&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:478,&quot;column&quot;:13}}">
              {syncState === "syncing" ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }} data-qoder-id="qel-span-cacedf0f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-cacedf0f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:485,&quot;column&quot;:17}}">
                  <CatMascot state="loading" size={20}  data-qoder-id="qel-catmascot-8c6868da" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-catmascot-8c6868da&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;catmascot&quot;,&quot;loc&quot;:{&quot;line&quot;:486,&quot;column&quot;:19}}"/> 同步中…
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }} data-qoder-id="qel-span-cccee235" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-cccee235&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelSync&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:489,&quot;column&quot;:17}}">
                  同步到 Obsidian
                </span>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════ SIDE PANEL - AI CHAT TAB ═══════════ */
function SidePanelAI(qoderProps) {
  const [messages, setMessages] = useState([
    { role: "user", text: "帮我分析 Manifest V3 的主要变化" },
    { role: "ai", text: "Manifest V3 有几个核心变化：\n\n1. Service Worker 替代 Background Page，不再持久运行\n2. 权限模型更严格，host_permissions 独立声明\n3. declarativeNetRequest 替代 webRequest\n\n需要我详细展开哪个部分？" },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickActions = [
    { label: "总结全文", icon: "doc" },
    { label: "提取关键点", icon: "spark" },
    { label: "生成属性", icon: "tag" },
    { label: "翻译", icon: "refresh" },
  ];

  const handleSend = (text) => {
    const msg = text || inputVal;
    if (!msg.trim()) return;
    setMessages([...messages, { role: "user", text: msg }]);
    setInputVal("");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setMessages(prev => [...prev, { role: "ai", text: "这是一个很好的问题！让我来为你详细解答…" }]);
    }, 1500);
  };

  return (
    <div style={{ ...({ display: "flex", flexDirection: "column", height: "100%" }), ...(qoderProps?.style) }} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      {/* ── Context Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderBottom: "0.5px solid var(--c-divider)", background: "var(--c-surface)" }} data-qoder-id="qel-div-25b39b82" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-25b39b82&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:532,&quot;column&quot;:7}}">
        <CatMascot state="idle" size={24}  data-qoder-id="qel-catmascot-a8d6c080" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-catmascot-a8d6c080&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;catmascot&quot;,&quot;loc&quot;:{&quot;line&quot;:533,&quot;column&quot;:9}}"/>
        <div style={{ flex: 1, minWidth: 0 }} data-qoder-id="qel-div-a9b099b7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a9b099b7&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:534,&quot;column&quot;:9}}">
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} data-qoder-id="qel-div-aab09b4a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-aab09b4a&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:535,&quot;column&quot;:11}}">
            正在讨论：Chrome MV3 迁移指南
          </div>
          <div style={{ fontSize: 10, color: "var(--c-text-3)" }} data-qoder-id="qel-div-abb09cdd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-abb09cdd&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:538,&quot;column&quot;:11}}">基于当前飞书文档上下文</div>
        </div>
        <span className="chip chip-badge chip-brand" style={{ height: 20, padding: "0 6px", fontSize: 10 }} data-qoder-id="qel-chip-20449e3a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-20449e3a&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:540,&quot;column&quot;:9}}">Gemini</span>
        <button className="btn btn-ghost btn-sm" style={{ padding: "2px 6px" }} data-qoder-id="qel-btn-08d0f3a3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-08d0f3a3&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:541,&quot;column&quot;:9}}"><SvgIcons.trash width={12} height={12}  data-qoder-id="qel-svgicons-trash-d699fbb5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-trash-d699fbb5&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;svgicons-trash&quot;,&quot;loc&quot;:{&quot;line&quot;:541,&quot;column&quot;:81}}"/></button>
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }} data-qoder-id="qel-div-a7b09691" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a7b09691&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:545,&quot;column&quot;:7}}">
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            gap: 8,
            flexDirection: msg.role === "user" ? "row-reverse" : "row",
            alignItems: "flex-end",
          }} data-qoder-id="qel-div-a0b08b8c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a0b08b8c&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:547,&quot;column&quot;:11}}">
            {msg.role === "ai" && <CatMascot state="idle" size={28} style={{ flexShrink: 0 }}  data-qoder-id="qel-catmascot-b1d6ceab" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-catmascot-b1d6ceab&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;catmascot&quot;,&quot;loc&quot;:{&quot;line&quot;:553,&quot;column&quot;:35}}"/>}
            <div
              className={`msg-bubble ${msg.role === "user" ? "msg-user" : "msg-ai"}`}
              style={{ maxWidth: msg.role === "user" ? "80%" : "82%" }}
             data-qoder-id="qel-div-e1c415f4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-e1c415f4&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:554,&quot;column&quot;:13}}">
              {msg.text.split("\n").map((line, j) => (
                <span key={j} style={{ display: "block" }} data-qoder-id="qel-span-f3e9aa5b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-f3e9aa5b&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:559,&quot;column&quot;:17}}">
                  {line || "\u00A0"}
                </span>
              ))}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }} data-qoder-id="qel-div-e3c4191a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-e3c4191a&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:568,&quot;column&quot;:11}}">
            <CatMascot state="loading" size={28} style={{ flexShrink: 0 }}  data-qoder-id="qel-catmascot-e4ea4309" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-catmascot-e4ea4309&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;catmascot&quot;,&quot;loc&quot;:{&quot;line&quot;:569,&quot;column&quot;:13}}"/>
            <div className="msg-bubble msg-ai" style={{ display: "flex", alignItems: "center", gap: 6 }} data-qoder-id="qel-msg-bubble-b604caf3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-msg-bubble-b604caf3&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;msg-bubble&quot;,&quot;loc&quot;:{&quot;line&quot;:570,&quot;column&quot;:13}}">
              <div className="loading-dots" data-qoder-id="qel-loading-dots-fcc0470d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-loading-dots-fcc0470d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;loading-dots&quot;,&quot;loc&quot;:{&quot;line&quot;:571,&quot;column&quot;:15}}">
                <div className="loading-dot"  data-qoder-id="qel-loading-dot-2eb6dd2f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-loading-dot-2eb6dd2f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;loading-dot&quot;,&quot;loc&quot;:{&quot;line&quot;:572,&quot;column&quot;:17}}"/>
                <div className="loading-dot"  data-qoder-id="qel-loading-dot-2db6db9c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-loading-dot-2db6db9c&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;loading-dot&quot;,&quot;loc&quot;:{&quot;line&quot;:573,&quot;column&quot;:17}}"/>
                <div className="loading-dot"  data-qoder-id="qel-loading-dot-34b6e6a1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-loading-dot-34b6e6a1&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;loading-dot&quot;,&quot;loc&quot;:{&quot;line&quot;:574,&quot;column&quot;:17}}"/>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      {messages.length <= 2 && (
        <div style={{ padding: "0 14px 8px", display: "flex", gap: 6, flexWrap: "wrap" }} data-qoder-id="qel-div-dac40aef" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-dac40aef&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:583,&quot;column&quot;:9}}">
          {quickActions.map((action, i) => {
            const Icon = SvgIcons[action.icon];
            return (
              <button
                key={i}
                className="chip"
                onClick={() => handleSend(action.label)}
                style={{ gap: 4 }}
               data-qoder-id="qel-chip-ec08fceb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-ec08fceb&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:587,&quot;column&quot;:15}}">
                {Icon && <Icon width={12} height={12}  data-qoder-id="qel-icon-0a97c4cc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-icon-0a97c4cc&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;icon&quot;,&quot;loc&quot;:{&quot;line&quot;:593,&quot;column&quot;:26}}"/>}
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Input Footer ── */}
      <div style={{ padding: "8px 12px 12px", borderTop: "0.5px solid var(--c-divider)", display: "flex", flexDirection: "column", gap: 6, background: "var(--c-surface)" }} data-qoder-id="qel-div-e5c65ad7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-e5c65ad7&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:602,&quot;column&quot;:7}}">
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }} data-qoder-id="qel-div-e4c65944" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-e4c65944&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:603,&quot;column&quot;:9}}">
          <button className="btn btn-ghost btn-sm" style={{ padding: "4px 6px", flexShrink: 0 }} data-qoder-id="qel-btn-470dc759" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-470dc759&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:604,&quot;column&quot;:11}}">
            <SvgIcons.clip width={14} height={14}  data-qoder-id="qel-svgicons-clip-9ffc8433" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-clip-9ffc8433&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;svgicons-clip&quot;,&quot;loc&quot;:{&quot;line&quot;:605,&quot;column&quot;:13}}"/>
          </button>
          <textarea
            className="input"
            rows={1}
            placeholder="问点什么…"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            style={{ flex: 1, minHeight: 36, maxHeight: 80, resize: "none", borderRadius: "var(--r-sm)", fontSize: 13 }}
           data-qoder-id="qel-input-c256757d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-c256757d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:607,&quot;column&quot;:11}}"/>
          <button
            className="btn btn-primary btn-sm"
            style={{ width: 36, height: 36, borderRadius: "var(--r-sm)", padding: 0, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => handleSend()}
            disabled={!inputVal.trim() || isLoading}
           data-qoder-id="qel-btn-440dc2a0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-440dc2a0&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:616,&quot;column&quot;:11}}">
            <SvgIcons.send width={16} height={16}  data-qoder-id="qel-svgicons-send-9dbfe2c8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-send-9dbfe2c8&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;svgicons-send&quot;,&quot;loc&quot;:{&quot;line&quot;:622,&quot;column&quot;:13}}"/>
          </button>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }} data-qoder-id="qel-div-dec64fd2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-dec64fd2&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:625,&quot;column&quot;:9}}">
          <span className="chip" style={{ fontSize: 10, height: 20, padding: "0 6px", gap: 3 }} data-qoder-id="qel-chip-84c61528" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-84c61528&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:626,&quot;column&quot;:11}}">
            <SvgIcons.doc width={10} height={10}  data-qoder-id="qel-svgicons-doc-0621696e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-doc-0621696e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;svgicons-doc&quot;,&quot;loc&quot;:{&quot;line&quot;:627,&quot;column&quot;:13}}"/> 当前文档
          </span>
          <span className="caption" style={{ fontSize: 10 }} data-qoder-id="qel-caption-7c92d03a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-caption-7c92d03a&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelAI&quot;,&quot;elementRole&quot;:&quot;caption&quot;,&quot;loc&quot;:{&quot;line&quot;:629,&quot;column&quot;:11}}">Enter 发送 · Shift+Enter 换行</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ SIDE PANEL PREVIEW ═══════════
   Chrome side-panel frame: topbar + tab switcher + content area        */
function SidePanelPreview(qoderProps) {
  const [activeTab, setActiveTab] = useState("sync");
  const tabs = [
    { id: "sync", label: "同步" },
    { id: "ai",   label: "AI 对话" },
  ];

  return (
    <div style={{ ...({
      width: 420, height: 680,
      borderRadius: "var(--r-lg)", overflow: "hidden",
      border: "0.5px solid var(--c-divider)",
      background: "var(--c-bg)",
      display: "flex", flexDirection: "column",
      boxShadow: "var(--shadow-lg)"
    }), ...(qoderProps?.style) }} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      {/* — Topbar — */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px",
        borderBottom: "0.5px solid var(--c-divider)",
        background: "var(--c-surface)", flexShrink: 0
      }} data-qoder-id="qel-div-b5b9b508" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b5b9b508&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:655,&quot;column&quot;:7}}">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} data-qoder-id="qel-div-b6b9b69b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b6b9b69b&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:661,&quot;column&quot;:9}}">
          <div style={{
            width: 28, height: 28, borderRadius: "var(--r-sm)",
            background: "linear-gradient(135deg, var(--brand-50), var(--brand-100))",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }} data-qoder-id="qel-div-b7b9b82e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b7b9b82e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:662,&quot;column&quot;:11}}">
            <CatMascot state="idle" size={24}  data-qoder-id="qel-catmascot-efd71615" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-catmascot-efd71615&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelPreview&quot;,&quot;elementRole&quot;:&quot;catmascot&quot;,&quot;loc&quot;:{&quot;line&quot;:667,&quot;column&quot;:13}}"/>
          </div>
          <div data-qoder-id="qel-div-b1b9aebc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b1b9aebc&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:669,&quot;column&quot;:11}}">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", lineHeight: 1.2 }} data-qoder-id="qel-div-b2b9b04f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b2b9b04f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:670,&quot;column&quot;:13}}">
              飞书 → Obsidian
            </div>
            <div style={{ fontSize: 10, color: "var(--c-text-3)", lineHeight: 1.2 }} data-qoder-id="qel-div-bfbc035d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-bfbc035d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:673,&quot;column&quot;:13}}">
              侧边栏
            </div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{
          width: 28, height: 28, padding: 0,
          display: "flex", alignItems: "center", justifyContent: "center"
        }} data-qoder-id="qel-btn-d5f7f3c2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-d5f7f3c2&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelPreview&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:678,&quot;column&quot;:9}}">
          <SvgIcons.refresh width={14} height={14}  data-qoder-id="qel-svgicons-refresh-d9d1209e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-refresh-d9d1209e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelPreview&quot;,&quot;elementRole&quot;:&quot;svgicons-refresh&quot;,&quot;loc&quot;:{&quot;line&quot;:682,&quot;column&quot;:11}}"/>
        </button>
      </div>

      {/* — Tab Switcher — */}
      <div style={{
        display: "flex", padding: "0 12px",
        borderBottom: "0.5px solid var(--c-divider)",
        background: "var(--c-surface)", flexShrink: 0
      }} data-qoder-id="qel-div-bcbbfea4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-bcbbfea4&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:687,&quot;column&quot;:7}}">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: "10px 0", border: "none",
            borderBottom: activeTab === tab.id ? "2px solid var(--c-brand)" : "2px solid transparent",
            background: "transparent",
            color: activeTab === tab.id ? "var(--c-brand)" : "var(--c-text-2)",
            fontSize: 13, fontWeight: 500, cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5
          }} data-qoder-id="qel-button-d2c14395" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-d2c14395&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelPreview&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:693,&quot;column&quot;:11}}">
            {tab.id === "sync"
              ? <SvgIcons.refresh width={14} height={14}  data-qoder-id="qel-svgicons-refresh-dcd12557" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-refresh-dcd12557&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelPreview&quot;,&quot;elementRole&quot;:&quot;svgicons-refresh&quot;,&quot;loc&quot;:{&quot;line&quot;:703,&quot;column&quot;:17}}"/>
              : <SvgIcons.spark   width={14} height={14}  data-qoder-id="qel-svgicons-spark-b1a25ec2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-spark-b1a25ec2&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelPreview&quot;,&quot;elementRole&quot;:&quot;svgicons-spark&quot;,&quot;loc&quot;:{&quot;line&quot;:704,&quot;column&quot;:17}}"/>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* — Content Area — */}
      <div style={{ flex: 1, overflow: "auto" }} data-qoder-id="qel-div-b8bbf858" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b8bbf858&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:711,&quot;column&quot;:7}}">
        {activeTab === "sync" && <SidePanelSync  data-qoder-id="qel-sidepanelsync-4803fbc1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-sidepanelsync-4803fbc1&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelPreview&quot;,&quot;elementRole&quot;:&quot;sidepanelsync&quot;,&quot;loc&quot;:{&quot;line&quot;:712,&quot;column&quot;:34}}"/>}
        {activeTab === "ai"   && <SidePanelAI  data-qoder-id="qel-sidepanelai-4efafb86" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-sidepanelai-4efafb86&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SidePanelPreview&quot;,&quot;elementRole&quot;:&quot;sidepanelai&quot;,&quot;loc&quot;:{&quot;line&quot;:713,&quot;column&quot;:34}}"/>}
      </div>
    </div>
  );
}

/* ═══════════ SETTINGS PREVIEW ═══════════
   Two-column layout: sidebar nav + scrollable content panels           */
function SettingsPreview(qoderProps) {
  const [activeSection, setActiveSection] = useState("general");

  const sections = [
    { id: "general",      label: "常规设置",   desc: "界面主题 · 语言 · 同步策略" },
    { id: "templates",    label: "属性模板",   desc: "YAML front-matter 模板" },
    { id: "dropdowns",    label: "下拉选项",   desc: "自定义属性候选项" },
    { id: "interpreters", label: "AI 解释器",  desc: "AI 属性推断引擎配置（NewAPI / OpenAI 兼容端点）" },
    { id: "assistant",    label: "AI 助手",    desc: "AI 对话引擎配置与个性化提示词管理" },
    { id: "selection",    label: "划词场景",   desc: "划词剪贴板配置：选中文本后显示知识剪贴板悬浮窗，支持收存、补充、AI 整理后进入 Obsidian" },
  ];

  /* helper: setting row with label/desc on left, control on right */
  const row = (label, desc, control) => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 0", borderBottom: "0.5px solid var(--c-divider)"
    }} data-qoder-id="qel-div-9718f6a6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9718f6a6&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:735,&quot;column&quot;:5}}">
      <div style={{ flex: 1, minWidth: 0 }} data-qoder-id="qel-div-9818f839" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9818f839&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:739,&quot;column&quot;:7}}">
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--c-text)" }} data-qoder-id="qel-div-9518f380" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9518f380&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:740,&quot;column&quot;:9}}">{label}</div>
        {desc && <div style={{ fontSize: 11, color: "var(--c-text-3)", marginTop: 2 }} data-qoder-id="qel-div-9618f513" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9618f513&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:741,&quot;column&quot;:18}}">{desc}</div>}
      </div>
      <div style={{ flexShrink: 0, marginLeft: 12 }} data-qoder-id="qel-div-9b18fcf2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9b18fcf2&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:743,&quot;column&quot;:7}}">{control}</div>
    </div>
  );

  /* helper: WeUI switch toggle */
  const toggle = (on = true) => (
    <label className="switch" data-qoder-id="qel-switch-1f57cf0f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-switch-1f57cf0f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;switch&quot;,&quot;loc&quot;:{&quot;line&quot;:749,&quot;column&quot;:5}}">
      <input type="checkbox" defaultChecked={on} readOnly  data-qoder-id="qel-input-04813b28" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-04813b28&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:750,&quot;column&quot;:7}}"/>
      <span className="switch-track"  data-qoder-id="qel-switch-track-0fbda41d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-switch-track-0fbda41d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;switch-track&quot;,&quot;loc&quot;:{&quot;line&quot;:751,&quot;column&quot;:7}}"/>
    </label>
  );

  /* helper: segmented control */
  const seg = (opts, active) => (
    <div className="tabs" style={{ display: "flex", gap: 0, background: "transparent", borderBottom: "none" }} data-qoder-id="qel-tabs-e82d634f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tabs-e82d634f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;tabs&quot;,&quot;loc&quot;:{&quot;line&quot;:757,&quot;column&quot;:5}}">
      {opts.map(o => (
        <button key={o} className={`tab ${o === active ? "tab-active" : ""}`}
          style={{ fontSize: 11, padding: "4px 10px", flex: "none" }} data-qoder-id="qel-button-449206c5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-449206c5&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:759,&quot;column&quot;:9}}">
          {o}
        </button>
      ))}
    </div>
  );
  /* helper: WeUI dropdown select */
  const select = (opts, active) => (
    <select className="weui-select" defaultValue={active} readOnly data-qoder-id="qel-weui-select-0958b1c4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-weui-select-0958b1c4&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;weui-select&quot;,&quot;loc&quot;:{&quot;line&quot;:771,&quot;column&quot;:5}}">
      {opts.map(o => <option key={o} value={o} data-qoder-id="qel-option-d3d1aee6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-d3d1aee6&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:772,&quot;column&quot;:22}}">{o}</option>)}
    </select>
  );


  return (
    <div style={{ ...({
      width: 720, height: 680,
      borderRadius: "var(--r-lg)", overflow: "hidden",
      border: "0.5px solid var(--c-divider)",
      background: "var(--c-bg)",
      display: "flex", boxShadow: "var(--shadow-lg)"
    }), ...(qoderProps?.style) }} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      {/* — Sidebar — */}
      <div style={{
        width: 200, borderRight: "0.5px solid var(--c-divider)",
        background: "var(--c-surface)",
        display: "flex", flexDirection: "column", flexShrink: 0
      }} data-qoder-id="qel-div-1c1c069c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-1c1c069c&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:776,&quot;column&quot;:7}}">
        <div style={{
          padding: "16px", display: "flex", alignItems: "center", gap: 8,
          borderBottom: "0.5px solid var(--c-divider)"
        }} data-qoder-id="qel-div-1f1c0b55" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-1f1c0b55&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:781,&quot;column&quot;:9}}">
          <CatMascot state="idle" size={28}  data-qoder-id="qel-catmascot-112342f6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-catmascot-112342f6&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;catmascot&quot;,&quot;loc&quot;:{&quot;line&quot;:785,&quot;column&quot;:11}}"/>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--c-text)" }} data-qoder-id="qel-span-43fb43df" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-43fb43df&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:786,&quot;column&quot;:11}}">设置</span>
        </div>
        <nav style={{ flex: 1, padding: "8px", overflow: "auto" }} data-qoder-id="qel-nav-f626c7e4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-nav-f626c7e4&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;nav&quot;,&quot;loc&quot;:{&quot;line&quot;:788,&quot;column&quot;:9}}">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "flex-start",
              width: "100%", padding: "10px 12px", marginBottom: 2,
              border: "none", borderRadius: "var(--r-md)",
              background: activeSection === s.id ? "var(--c-brand-soft)" : "transparent",
              color: activeSection === s.id ? "var(--c-brand)" : "var(--c-text)",
              cursor: "pointer", transition: "all 0.15s ease", textAlign: "left"
            }} data-qoder-id="qel-button-b794fa65" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-b794fa65&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:790,&quot;column&quot;:13}}">
              <span style={{ fontSize: 13, fontWeight: 500 }} data-qoder-id="qel-span-44fb4572" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-44fb4572&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:798,&quot;column&quot;:15}}">{s.label}</span>
              <span style={{
                fontSize: 11, marginTop: 2, opacity: 0.8,
                color: activeSection === s.id ? "var(--c-brand)" : "var(--c-text-3)"
              }} data-qoder-id="qel-span-47fb4a2b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-47fb4a2b&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:799,&quot;column&quot;:15}}">{s.desc}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* — Content — */}
      <div style={{ flex: 1, padding: 24, overflow: "auto" }} data-qoder-id="qel-div-241c1334" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-241c1334&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:809,&quot;column&quot;:7}}">

        {activeSection === "general" && (
          <div data-qoder-id="qel-div-ab1498f4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ab1498f4&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:812,&quot;column&quot;:11}}">
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, color: "var(--c-text)" }} data-qoder-id="qel-h2-b2dbda37" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h2-b2dbda37&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;h2&quot;,&quot;loc&quot;:{&quot;line&quot;:813,&quot;column&quot;:13}}">常规设置</h2>
            <p style={{ fontSize: 13, color: "var(--c-text-3)", marginBottom: 20 }} data-qoder-id="qel-p-3751414e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-3751414e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:814,&quot;column&quot;:13}}">全局偏好与同步策略配置</p>
            <div style={{ background: "var(--c-surface)", borderRadius: "var(--r-md)", padding: "0 16px" }} data-qoder-id="qel-div-ae149dad" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ae149dad&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:815,&quot;column&quot;:13}}">
              {row("主题", "界面主题模式（跟随系统 / 浅色 / 深色）", seg(["自动", "浅色", "深色"], "自动"))}
              {row("自动同步", "文档变更后自动推送到 Obsidian Vault", toggle(true))}
              {row("同步频率", "同步间隔策略", <span className="chip chip-brand" style={{ fontSize: 11 }} data-qoder-id="qel-chip-4d725d36" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-4d725d36&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:818,&quot;column&quot;:46}}">实时</span>)}
              {row("Obsidian Vault 路径", "Obsidian Vault 本地存储路径", <span style={{ fontSize: 12, color: "var(--c-text-3)" }} data-qoder-id="qel-span-d2f3d637" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-d2f3d637&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:819,&quot;column&quot;:52}}">~/Documents/Obsidian</span>)}
            </div>
          </div>
        )}

        {activeSection === "templates" && (
          <div data-qoder-id="qel-div-a91495ce" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a91495ce&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:825,&quot;column&quot;:11}}">
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, color: "var(--c-text)" }} data-qoder-id="qel-h2-b0dbd711" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h2-b0dbd711&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;h2&quot;,&quot;loc&quot;:{&quot;line&quot;:826,&quot;column&quot;:13}}">属性模板</h2>
            <p style={{ fontSize: 13, color: "var(--c-text-3)", marginBottom: 20 }} data-qoder-id="qel-p-2d513190" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-2d513190&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:827,&quot;column&quot;:13}}">YAML front-matter 模板配置</p>
            <div style={{ background: "var(--c-surface)", borderRadius: "var(--r-md)", padding: "0 16px" }} data-qoder-id="qel-div-a4148def" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a4148def&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:828,&quot;column&quot;:13}}">
              {row("默认模板", "新建文档时应用的默认模板，支持 {{title}} {{url}} {{date}} {{dir}} {{keywords}} 变量", <span className="chip" style={{ fontSize: 11 }} data-qoder-id="qel-chip-5774ab8b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-5774ab8b&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:829,&quot;column&quot;:47}}">default</span>)}
              {row("AI 自动补全", "AI 基于文档语义自动推断并填充缺失的 YAML 属性", toggle(true))}
              {row("标签建议", "基于文档内容语义分析推荐合适的标签分类", toggle(true))}
            </div>
            <div style={{
              marginTop: 16, background: "#1a1a1a", borderRadius: "var(--r-md)", padding: 16,
              fontFamily: "monospace", fontSize: 12, color: "#e0e0e0", lineHeight: 1.6, overflow: "auto"
            }} data-qoder-id="qel-div-b016df6a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b016df6a&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:833,&quot;column&quot;:13}}">
              <div style={{ color: "#666" }} data-qoder-id="qel-div-2822d545" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-2822d545&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:840,&quot;column&quot;:15}}">{"# 默认 YAML 模板 · 支持 {{title}} {{url}} {{date}} {{dir}} {{keywords}}"}</div>
              <div data-qoder-id="qel-div-9525bf73" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9525bf73&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:841,&quot;column&quot;:15}}"><span style={{ color: "#569CD6" }} data-qoder-id="qel-span-c6f184bc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-c6f184bc&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:841,&quot;column&quot;:20}}">标签</span>: <span style={{ color: "#CE9178" }} data-qoder-id="qel-span-c9f18975" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-c9f18975&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:841,&quot;column&quot;:66}}">S</span></div>
              <div data-qoder-id="qel-div-9625c106" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9625c106&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:842,&quot;column&quot;:15}}"><span style={{ color: "#569CD6" }} data-qoder-id="qel-span-c3f18003" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-c3f18003&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:842,&quot;column&quot;:20}}">编码</span>: <span style={{ color: "#CE9178" }} data-qoder-id="qel-span-c2f17e70" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-c2f17e70&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:842,&quot;column&quot;:66}}">输入</span></div>
              <div data-qoder-id="qel-div-9b25c8e5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9b25c8e5&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:843,&quot;column&quot;:15}}"><span style={{ color: "#569CD6" }} data-qoder-id="qel-span-c4f18196" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-c4f18196&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:843,&quot;column&quot;:20}}">日期</span>: <span style={{ color: "#CE9178" }} data-qoder-id="qel-span-cff192e7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-cff192e7&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:843,&quot;column&quot;:66}}">{"{{date}}"}</span></div>
              <div data-qoder-id="qel-div-9c25ca78" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9c25ca78&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:844,&quot;column&quot;:15}}"><span style={{ color: "#569CD6" }} data-qoder-id="qel-span-b04b2a99" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-b04b2a99&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:844,&quot;column&quot;:20}}">日期索引</span>: <span style={{ color: "#808080" }} data-qoder-id="qel-span-af4b2906" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-af4b2906&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:844,&quot;column&quot;:68}}">{"# 用逗号或顿号分隔"}</span></div>
              <div data-qoder-id="qel-div-9ce3d6e7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9ce3d6e7&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:845,&quot;column&quot;:15}}"><span style={{ color: "#569CD6" }} data-qoder-id="qel-span-ad4b25e0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-ad4b25e0&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:845,&quot;column&quot;:20}}">关键词</span>: <span style={{ color: "#CE9178" }} data-qoder-id="qel-span-b44b30e5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-b44b30e5&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:845,&quot;column&quot;:67}}">{"{{keywords}}"}</span></div>
              <div data-qoder-id="qel-div-99e3d22e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-99e3d22e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:846,&quot;column&quot;:15}}"><span style={{ color: "#569CD6" }} data-qoder-id="qel-span-b24b2dbf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-b24b2dbf&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:846,&quot;column&quot;:20}}">概述</span>: <span style={{ color: "#808080" }} data-qoder-id="qel-span-b14b2c2c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-b14b2c2c&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:846,&quot;column&quot;:66}}">{"# 80-160 字"}</span></div>
              <div data-qoder-id="qel-div-96e3cd75" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-96e3cd75&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:847,&quot;column&quot;:15}}"><span style={{ color: "#569CD6" }} data-qoder-id="qel-span-b74b359e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-b74b359e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:847,&quot;column&quot;:20}}">评分</span>: <span style={{ color: "#808080" }} data-qoder-id="qel-span-aa48e290" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-aa48e290&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:847,&quot;column&quot;:66}}">{"# 未选择"}</span></div>
              <div data-qoder-id="qel-div-99e19397" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-99e19397&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:848,&quot;column&quot;:15}}"><span style={{ color: "#569CD6" }} data-qoder-id="qel-span-ac48e5b6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-ac48e5b6&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:848,&quot;column&quot;:20}}">评分_显示</span>: <span style={{ color: "#808080" }} data-qoder-id="qel-span-ad48e749" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-ad48e749&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:848,&quot;column&quot;:69}}">{"# 未选择"}</span></div>
              <div data-qoder-id="qel-div-94e18bb8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-94e18bb8&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:849,&quot;column&quot;:15}}"><span style={{ color: "#569CD6" }} data-qoder-id="qel-span-af48ea6f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-af48ea6f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:849,&quot;column&quot;:20}}">索引_知识库</span>: <span style={{ color: "#808080" }} data-qoder-id="qel-span-b048ec02" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-b048ec02&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:849,&quot;column&quot;:70}}">{"# 未选择"}</span></div>
              <div data-qoder-id="qel-div-97e19071" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-97e19071&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:850,&quot;column&quot;:15}}"><span style={{ color: "#569CD6" }} data-qoder-id="qel-span-b248ef28" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-b248ef28&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:850,&quot;column&quot;:20}}">索引_颜色</span>: <span style={{ color: "#808080" }} data-qoder-id="qel-span-b348f0bb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-b348f0bb&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:850,&quot;column&quot;:69}}">{"# 未选择"}</span></div>
              <div data-qoder-id="qel-div-0ae9013f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-0ae9013f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:851,&quot;column&quot;:15}}"><span style={{ color: "#569CD6" }} data-qoder-id="qel-span-bb4fb918" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-bb4fb918&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:851,&quot;column&quot;:20}}">索引_操作&反馈</span>: <span style={{ color: "#808080" }} data-qoder-id="qel-span-be4fbdd1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-be4fbdd1&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:851,&quot;column&quot;:72}}">{"# 动作状态 / 产出阶段"}</span></div>
              <div data-qoder-id="qel-div-0be902d2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-0be902d2&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:852,&quot;column&quot;:15}}"><span style={{ color: "#569CD6" }} data-qoder-id="qel-span-c04fc0f7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-c04fc0f7&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:852,&quot;column&quot;:20}}">索引_块</span>: <span style={{ color: "#808080" }} data-qoder-id="qel-span-bf4fbf64" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-bf4fbf64&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:852,&quot;column&quot;:68}}">{"# 抽象/具象·简单/困难"}</span></div>
              <div data-qoder-id="qel-div-08e8fe19" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-08e8fe19&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:853,&quot;column&quot;:15}}"><span style={{ color: "#569CD6" }} data-qoder-id="qel-span-c14fc28a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-c14fc28a&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:853,&quot;column&quot;:20}}">索引_风险</span>: <span style={{ color: "#808080" }} data-qoder-id="qel-span-b44fae13" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-b44fae13&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:853,&quot;column&quot;:69}}">{"# 用逗号或顿号分隔"}</span></div>
            </div>
          </div>
        )}

        {activeSection === "dropdowns" && (
          <div data-qoder-id="qel-div-2c22db91" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-2c22db91&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:847,&quot;column&quot;:11}}">
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, color: "var(--c-text)" }} data-qoder-id="qel-h2-afeae008" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h2-afeae008&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;h2&quot;,&quot;loc&quot;:{&quot;line&quot;:848,&quot;column&quot;:13}}">下拉选项</h2>
            <p style={{ fontSize: 13, color: "var(--c-text-3)", marginBottom: 20 }} data-qoder-id="qel-p-ac4be94f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-ac4be94f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:849,&quot;column&quot;:13}}">自定义属性候选项管理</p>
            <div style={{ background: "var(--c-surface)", borderRadius: "var(--r-md)", padding: 16 }} data-qoder-id="qel-div-2722d3b2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-2722d3b2&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:850,&quot;column&quot;:13}}">
              {[
                { name: "标签选项", options: ["📥S_收集", "🎯X_项目", "🌳L_领域", "📚Z_资源", "💡Q_灵感", "🛠️J_技能"] },
                { name: "日期索引选项", options: ["⌚时间", "🔄周期性", "🌄情景式", "⏳倒计时", "🏆里程碑", "😊心情", "☁️习惯", "💡灵感", "📈活跃时间"] },
                { name: "评分选项", options: ["🌟", "🌟🌟", "🌟🌟🌟", "🌟🌟🌟🌟", "🌟🌟🌟🌟🌟"] },
                { name: "评分显示选项", options: ["🌟·素材", "🌟🌟·整理", "🌟🌟🌟·实践", "🌟🌟🌟🌟·通用", "🌟🌟🌟🌟🌟·体系"] },
                { name: "知识库索引", options: ["💼正财（主业）", "🧧偏财（副业）", "👨‍🏫正印（前辈）", "👥偏印（伙伴）", "❤️正宫（爱情）", "👨‍👩‍👧‍👦伤官（家人｜朋友）"] },
                { name: "颜色索引", options: ["⚪灰色·睡眠", "🔵蓝色·工作", "🟢深绿·生活", "🔴红色·娱乐", "🟡黄色·社交", "🟣紫色·学习", "🟢浅绿·运动"] },
                { name: "操作反馈索引", options: ["💡想法", "📋规划", "🚀执行", "🚫受挫", "💪克服", "📝初稿", "🔍审核", "✏️修改", "✅完成", "📊复盘"] },
                { name: "块索引", options: ["💭抽象", "🎯具象", "✅简单", "🚧困难"] },
                { name: "风险索引", options: ["👣行为", "⚙️管理", "❤️健康", "🧠知识", "🗣️社交", "👨‍👩‍👧‍👦家庭", "🌆社会", "🚨意外"] },
              ].map(d => (
                <div key={d.name} style={{ padding: "12px 0", borderBottom: "0.5px solid var(--c-divider)" }} data-qoder-id="qel-div-2822d545" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-2822d545&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:856,&quot;column&quot;:17}}">
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--c-text)", marginBottom: 6 }} data-qoder-id="qel-div-9525bf73" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9525bf73&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:857,&quot;column&quot;:19}}">{d.name}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }} data-qoder-id="qel-div-9425bde0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9425bde0&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:858,&quot;column&quot;:19}}">
                    {d.options.map(opt => (
                      <span key={opt} className="chip" style={{ fontSize: 11 }} data-qoder-id="qel-chip-d18d707f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-d18d707f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:860,&quot;column&quot;:23}}">{opt}</span>
                    ))}
                    <span className="chip chip-brand" style={{ fontSize: 11, borderStyle: "dashed" }} data-qoder-id="qel-chip-d08d6eec" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-d08d6eec&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:862,&quot;column&quot;:21}}">+ 添加</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "interpreters" && (
          <div data-qoder-id="qel-div-9925c5bf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9925c5bf&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:871,&quot;column&quot;:11}}">
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, color: "var(--c-text)" }} data-qoder-id="qel-h2-1eedcd5c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h2-1eedcd5c&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;h2&quot;,&quot;loc&quot;:{&quot;line&quot;:872,&quot;column&quot;:13}}">AI 解释器</h2>
            <p style={{ fontSize: 13, color: "var(--c-text-3)", marginBottom: 20 }} data-qoder-id="qel-p-ad4e2979" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-ad4e2979&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:873,&quot;column&quot;:13}}">API Key 与模型配置</p>
            <div style={{ background: "var(--c-surface)", borderRadius: "var(--r-md)", padding: "0 16px" }} data-qoder-id="qel-div-9a25c752" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9a25c752&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:874,&quot;column&quot;:13}}">
              {row("启用解释器", "启用后 AI 自动推断 YAML 属性建议，所有建议需人工确认后生效", toggle(true))}
              {row("自动运行", "侧边栏打开时自动触发属性推断，生成标签、评分、索引建议", toggle(true))}
              {row("使用自定义解释器", "关闭时复用 AI 助手的 Gemini Web 会话；开启后使用独立 NewAPI 端点", toggle(false))}
              {row("提供商", "NewAPI / OpenAI 兼容协议", <span className="chip chip-brand" style={{ fontSize: 11 }} data-qoder-id="qel-chip-db8d803d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-db8d803d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:875,&quot;column&quot;:60}}">Gemini</span>)}
              {row("路由模型", "NewAPI 路由策略", <span className="chip" style={{ fontSize: 11 }} data-qoder-id="qel-chip-da8d7eaa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-da8d7eaa&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:876,&quot;column&quot;:39}}">gemini-2.0-flash</span>)}
              {row("API Key（本机保存）", "NewAPI 访问令牌（仅本机保存，不上传）", <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} data-qoder-id="qel-btn-05abdea5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-05abdea5&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:877,&quot;column&quot;:49}}">修改</button>)}
              {row("AI 分析正文长度", "单次 AI 分析的正文截取长度上限", <span style={{ fontSize: 12, color: "var(--c-text-2)" }} data-qoder-id="qel-span-af4b2906" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-af4b2906&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:878,&quot;column&quot;:53}}">4000</span>)}
            </div>
          </div>
        )}

        {activeSection === "assistant" && (
          <div data-qoder-id="qel-div-9ce3d6e7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9ce3d6e7&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:884,&quot;column&quot;:11}}">
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, color: "var(--c-text)" }} data-qoder-id="qel-h2-216eaa04" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h2-216eaa04&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;h2&quot;,&quot;loc&quot;:{&quot;line&quot;:885,&quot;column&quot;:13}}">AI 助手</h2>
            <p style={{ fontSize: 13, color: "var(--c-text-3)", marginBottom: 20 }} data-qoder-id="qel-p-9ce50bb5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-9ce50bb5&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:886,&quot;column&quot;:13}}">对话风格与快捷指令</p>
            <div style={{ background: "var(--c-surface)", borderRadius: "var(--r-md)", padding: "0 16px" }} data-qoder-id="qel-div-99e3d22e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-99e3d22e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:887,&quot;column&quot;:13}}">
              {row("AI Provider", "Gemini Web（复用浏览器登录）", <span className="chip chip-brand" style={{ fontSize: 11 }} data-qoder-id="qel-chip-cd09c4f4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-cd09c4f4&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:900,&quot;column&quot;:58}}">Gemini Web</span>)}
              {row("API Key", "API 密钥（仅本机保存，支持 Gemini / OpenAI / DeepSeek）", <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} data-qoder-id="qel-btn-0db0686b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-0db0686b&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:901,&quot;column&quot;:73}}">修改</button>)}
              {row("Model", "当前使用的模型版本", <span className="chip" style={{ fontSize: 11 }} data-qoder-id="qel-chip-cb09c1ce" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-cb09c1ce&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:902,&quot;column&quot;:55}}">3.5 Flash</span>)}
              {row("System Prompt", "全局系统提示词，影响所有 AI 对话的基线行为", <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} data-qoder-id="qel-btn-0fb06b91" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-0fb06b91&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:903,&quot;column&quot;:48}}">编辑</button>)}
              {row("快捷指令", "自定义对话快捷入口",
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }} data-qoder-id="qel-div-98e3d09b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-98e3d09b&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:891,&quot;column&quot;:17}}">
                  <span className="chip" style={{ fontSize: 10 }} data-qoder-id="qel-chip-b90e22a6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-b90e22a6&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:892,&quot;column&quot;:19}}">总结</span>
                  <span className="chip" style={{ fontSize: 10 }} data-qoder-id="qel-chip-c40e33f7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-c40e33f7&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:893,&quot;column&quot;:19}}">翻译</span>
                  <span className="chip" style={{ fontSize: 10 }} data-qoder-id="qel-chip-c30e3264" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-c30e3264&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:894,&quot;column&quot;:19}}">提问</span>
                  <span className="chip chip-brand" style={{ fontSize: 10, borderStyle: "dashed" }} data-qoder-id="qel-chip-b60bdf56" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-b60bdf56&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:895,&quot;column&quot;:19}}">+</span>
                </div>
              )}
            </div>
              {/* 自定义提示词 */}
              <div style={{ padding: "14px 0", borderBottom: "0.5px solid var(--c-divider)" }} data-qoder-id="qel-div-06d9f069" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-06d9f069&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:921,&quot;column&quot;:15}}">
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--c-text)", marginBottom: 4 }} data-qoder-id="qel-div-05d9eed6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-05d9eed6&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:922,&quot;column&quot;:17}}">自定义提示词</div>
                <div style={{ fontSize: 11, color: "var(--c-text-3)", marginBottom: 10 }} data-qoder-id="qel-div-04d9ed43" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-04d9ed43&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:923,&quot;column&quot;:17}}">添加个性化 AI 指令模板</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }} data-qoder-id="qel-div-03d9ebb0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-03d9ebb0&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:924,&quot;column&quot;:17}}">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--c-bg)", borderRadius: "var(--r-sm)", border: "0.5px solid var(--c-divider)" }} data-qoder-id="qel-div-0ad9f6b5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-0ad9f6b5&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:925,&quot;column&quot;:19}}">
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--c-text)" }} data-qoder-id="qel-span-43550c5e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-43550c5e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:926,&quot;column&quot;:21}}">用大白话解释</span>
                    <span style={{ fontSize: 11, color: "var(--c-text-3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} data-qoder-id="qel-span-42550acb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-42550acb&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:927,&quot;column&quot;:21}}">请用通俗易懂的语言解释以下内容…</span>
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: "2px 8px" }} data-qoder-id="qel-btn-8ea228f4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-8ea228f4&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:928,&quot;column&quot;:21}}">编辑</button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--c-bg)", borderRadius: "var(--r-sm)", border: "0.5px solid var(--c-divider)" }} data-qoder-id="qel-div-0ed9fd01" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-0ed9fd01&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:930,&quot;column&quot;:19}}">
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--c-text)" }} data-qoder-id="qel-span-3f550612" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-3f550612&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:931,&quot;column&quot;:21}}">总结关键点</span>
                    <span style={{ fontSize: 11, color: "var(--c-text-3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} data-qoder-id="qel-span-4252cc34" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-4252cc34&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:932,&quot;column&quot;:21}}">请提取以下内容的 3-5 个关键要点…</span>
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: "2px 8px" }} data-qoder-id="qel-btn-089f176b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-089f176b&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:933,&quot;column&quot;:21}}">编辑</button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--c-bg)", borderRadius: "var(--r-sm)", border: "0.5px solid var(--c-divider)" }} data-qoder-id="qel-div-02d7ab86" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-02d7ab86&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:935,&quot;column&quot;:19}}">
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--c-text)" }} data-qoder-id="qel-span-4552d0ed" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-4552d0ed&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:936,&quot;column&quot;:21}}">提取待办事项</span>
                    <span style={{ fontSize: 11, color: "var(--c-text-3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} data-qoder-id="qel-span-3e52c5e8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-3e52c5e8&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:937,&quot;column&quot;:21}}">从以下内容中提取所有待办事项…</span>
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: "2px 8px" }} data-qoder-id="qel-btn-0c9f1db7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-0c9f1db7&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:938,&quot;column&quot;:21}}">编辑</button>
                  </div>
                  <button className="chip chip-brand" style={{ fontSize: 10, borderStyle: "dashed", alignSelf: "flex-start", cursor: "pointer" }} data-qoder-id="qel-chip-de7563dc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-de7563dc&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:940,&quot;column&quot;:19}}">+ 添加提示词</button>
                </div>
              </div>
          </div>
        )}

        {activeSection === "selection" && (
          <div data-qoder-id="qel-div-99e19397" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-99e19397&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:903,&quot;column&quot;:11}}">
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, color: "var(--c-text)" }} data-qoder-id="qel-h2-206c69da" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h2-206c69da&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;h2&quot;,&quot;loc&quot;:{&quot;line&quot;:904,&quot;column&quot;:13}}">划词场景</h2>
            <p style={{ fontSize: 13, color: "var(--c-text-3)", marginBottom: 20 }} data-qoder-id="qel-p-95e2c219" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-95e2c219&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:905,&quot;column&quot;:13}}">划词悬浮菜单配置</p>
            <div style={{ background: "var(--c-surface)", borderRadius: "var(--r-md)", padding: "0 16px" }} data-qoder-id="qel-div-94e18bb8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-94e18bb8&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:906,&quot;column&quot;:13}}">
              {row("启用划词悬浮窗", "关闭后仍可通过右键菜单和侧边栏进行操作", toggle(true))}
              {row("触发方式", "选中文本后自动出现", <span className="chip chip-brand" style={{ fontSize: 11 }} data-qoder-id="qel-chip-bb0be735" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-bb0be735&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:908,&quot;column&quot;:41}}">自动</span>)}
              {row("功能项", "划词菜单中展示的操作项，支持自定义配置",
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }} data-qoder-id="qel-div-96e18ede" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-96e18ede&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:910,&quot;column&quot;:17}}">
                  <span className="chip chip-active" style={{ fontSize: 10 }} data-qoder-id="qel-chip-b90be40f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-b90be40f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:911,&quot;column&quot;:19}}">AI 解释</span>
                  <span className="chip chip-active" style={{ fontSize: 10 }} data-qoder-id="qel-chip-be0bebee" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-be0bebee&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:912,&quot;column&quot;:19}}">翻译</span>
                  <span className="chip chip-active" style={{ fontSize: 10 }} data-qoder-id="qel-chip-bf0bed81" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-bf0bed81&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:913,&quot;column&quot;:19}}">保存笔记</span>
                  <span className="chip" style={{ fontSize: 10 }} data-qoder-id="qel-chip-d009c9ad" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-d009c9ad&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:914,&quot;column&quot;:19}}">高亮</span>
                </div>
              )}
              {/* 自定义菜单项 */}
              <div style={{ padding: "14px 0", borderBottom: "0.5px solid var(--c-divider)" }} data-qoder-id="qel-div-97df51da" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-97df51da&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:962,&quot;column&quot;:15}}">
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--c-text)", marginBottom: 4 }} data-qoder-id="qel-div-8adf3d63" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-8adf3d63&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:963,&quot;column&quot;:17}}">自定义菜单项</div>
                <div style={{ fontSize: 11, color: "var(--c-text-3)", marginBottom: 10 }} data-qoder-id="qel-div-89df3bd0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-89df3bd0&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:964,&quot;column&quot;:17}}">添加自定义划词操作及对应提示词</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }} data-qoder-id="qel-div-0cdc3872" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-0cdc3872&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:965,&quot;column&quot;:17}}">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--c-bg)", borderRadius: "var(--r-sm)", border: "0.5px solid var(--c-divider)" }} data-qoder-id="qel-div-0ddc3a05" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-0ddc3a05&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:966,&quot;column&quot;:19}}">
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--c-text)" }} data-qoder-id="qel-span-2c5726c0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-2c5726c0&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:967,&quot;column&quot;:21}}">术语解释</span>
                    <span style={{ fontSize: 11, color: "var(--c-text-3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} data-qoder-id="qel-span-2d572853" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-2d572853&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:968,&quot;column&quot;:21}}">请解释这个术语的含义和用法…</span>
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: "2px 8px" }} data-qoder-id="qel-btn-8fa4691e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-8fa4691e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:969,&quot;column&quot;:21}}">编辑</button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--c-bg)", borderRadius: "var(--r-sm)", border: "0.5px solid var(--c-divider)" }} data-qoder-id="qel-div-09dc33b9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-09dc33b9&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:971,&quot;column&quot;:19}}">
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--c-text)" }} data-qoder-id="qel-span-30572d0c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-30572d0c&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:972,&quot;column&quot;:21}}">中英互译</span>
                    <span style={{ fontSize: 11, color: "var(--c-text-3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} data-qoder-id="qel-span-31572e9f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-31572e9f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:973,&quot;column&quot;:21}}">请将以下内容在中英文之间互译…</span>
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: "2px 8px" }} data-qoder-id="qel-btn-8ba462d2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-8ba462d2&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:974,&quot;column&quot;:21}}">编辑</button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--c-bg)", borderRadius: "var(--r-sm)", border: "0.5px solid var(--c-divider)" }} data-qoder-id="qel-div-15dc469d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-15dc469d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:976,&quot;column&quot;:19}}">
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--c-text)" }} data-qoder-id="qel-span-c05ecb81" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-c05ecb81&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:977,&quot;column&quot;:21}}">生成思维导图</span>
                    <span style={{ fontSize: 11, color: "var(--c-text-3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} data-qoder-id="qel-span-bf5ec9ee" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-bf5ec9ee&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:978,&quot;column&quot;:21}}">请将以下内容整理为思维导图格式…</span>
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 10, padding: "2px 8px" }} data-qoder-id="qel-btn-9397a377" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-9397a377&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:979,&quot;column&quot;:21}}">编辑</button>
                  </div>
                  <button className="chip chip-brand" style={{ fontSize: 10, borderStyle: "dashed", alignSelf: "flex-start", cursor: "pointer" }} data-qoder-id="qel-chip-5b816196" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-5b816196&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;SettingsPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:981,&quot;column&quot;:19}}">+ 添加菜单项</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ═══════════ APP ROOT ═══════════ */
export default /* ═══════════ FLOATING TOOLBAR PREVIEW (Selection capsule + AI result + Feishu FAB) ═══════════
   Four states: capsule / more-menu / ai-result / feishu-fab
   Mock webpage context + frosted-glass capsule + Doraemon cat avatar in AI panel.        */
function FloatingToolbarPreview(qoderProps) {
  const [fabState, setFabState] = useState("capsule");

  const fabIcons = {
    save:    (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p} data-qoder-id="qel-svg-7ae59cea" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-7ae59cea&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:8,&quot;column&quot;:21}}"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" data-qoder-id="qel-path-15383225" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-15383225&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:8,&quot;column&quot;:173}}"/></svg>,
    append:  (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p} data-qoder-id="qel-svg-78e599c4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-78e599c4&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:9,&quot;column&quot;:21}}"><path d="M12 5v14M5 12h14" data-qoder-id="qel-path-0f3828b3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-0f3828b3&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:9,&quot;column&quot;:173}}"/></svg>,
    refine:  (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p} data-qoder-id="qel-svg-76e5969e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-76e5969e&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:10,&quot;column&quot;:21}}"><path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z" data-qoder-id="qel-path-11382bd9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-11382bd9&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:10,&quot;column&quot;:173}}"/></svg>,
    explain: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p} data-qoder-id="qel-svg-74e59378" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-74e59378&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:11,&quot;column&quot;:21}}"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" data-qoder-id="qel-path-1b383b97" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-1b383b97&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:11,&quot;column&quot;:173}}"/><path d="M12 16v-4M12 8h.01" data-qoder-id="qel-path-1a383a04" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-1a383a04&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:11,&quot;column&quot;:221}}"/></svg>,
    concept: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p} data-qoder-id="qel-svg-5175eb2e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-5175eb2e&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:12,&quot;column&quot;:21}}"><rect x="3" y="3" width="18" height="18" rx="2" data-qoder-id="qel-rect-6f125cd1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rect-6f125cd1&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;rect&quot;,&quot;loc&quot;:{&quot;line&quot;:12,&quot;column&quot;:173}}"/><path d="M3 9h18M9 3v18" data-qoder-id="qel-path-0c6f6afa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-0c6f6afa&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:12,&quot;column&quot;:222}}"/></svg>,
    quote:   (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p} data-qoder-id="qel-svg-5075e99b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-5075e99b&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:13,&quot;column&quot;:21}}"><path d="M3 7c0-1.1.9-2 2-2h4v6H5c-1.1 0-2-.9-2-2V7zM15 7c0-1.1.9-2 2-2h4v6h-4c-1.1 0-2-.9-2-2V7z" data-qoder-id="qel-path-066f6188" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-066f6188&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:13,&quot;column&quot;:173}}"/></svg>,
    question:(p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p} data-qoder-id="qel-svg-5675f30d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-5675f30d&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:14,&quot;column&quot;:21}}"><circle cx="12" cy="12" r="10" data-qoder-id="qel-circle-ef35c2f8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-circle-ef35c2f8&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;circle&quot;,&quot;loc&quot;:{&quot;line&quot;:14,&quot;column&quot;:173}}"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" data-qoder-id="qel-path-096f6641" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-096f6641&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:14,&quot;column&quot;:205}}"/></svg>,
    copy:    (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p} data-qoder-id="qel-svg-4975de96" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-4975de96&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:15,&quot;column&quot;:21}}"><rect x="9" y="9" width="13" height="13" rx="2" data-qoder-id="qel-rect-67125039" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rect-67125039&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;rect&quot;,&quot;loc&quot;:{&quot;line&quot;:15,&quot;column&quot;:173}}"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" data-qoder-id="qel-path-7c76d70f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-7c76d70f&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:15,&quot;column&quot;:222}}"/></svg>,
    panel:   (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p} data-qoder-id="qel-svg-4a73a192" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-4a73a192&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:16,&quot;column&quot;:21}}"><rect x="3" y="3" width="18" height="18" rx="2" data-qoder-id="qel-rect-6610100f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rect-6610100f&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;rect&quot;,&quot;loc&quot;:{&quot;line&quot;:16,&quot;column&quot;:173}}"/><path d="M15 3v18" data-qoder-id="qel-path-7d76d8a2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-7d76d8a2&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:16,&quot;column&quot;:222}}"/></svg>,
    more:    (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p} data-qoder-id="qel-svg-47739cd9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-47739cd9&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:17,&quot;column&quot;:21}}"><circle cx="5" cy="12" r="1" data-qoder-id="qel-circle-f233891a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-circle-f233891a&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;circle&quot;,&quot;loc&quot;:{&quot;line&quot;:17,&quot;column&quot;:148}}"/><circle cx="12" cy="12" r="1" data-qoder-id="qel-circle-f1338787" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-circle-f1338787&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;circle&quot;,&quot;loc&quot;:{&quot;line&quot;:17,&quot;column&quot;:178}}"/><circle cx="19" cy="12" r="1" data-qoder-id="qel-circle-f03385f4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-circle-f03385f4&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;circle&quot;,&quot;loc&quot;:{&quot;line&quot;:17,&quot;column&quot;:209}}"/></svg>,
    close:   (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p} data-qoder-id="qel-svg-5373afbd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-5373afbd&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:18,&quot;column&quot;:21}}"><path d="M18 6L6 18M6 6l12 12" data-qoder-id="qel-path-8376e214" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-8376e214&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:18,&quot;column&quot;:148}}"/></svg>,
    sync:    (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p} data-qoder-id="qel-svg-45715b1c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-45715b1c&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:19,&quot;column&quot;:21}}"><path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16" data-qoder-id="qel-path-77749099" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-77749099&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:19,&quot;column&quot;:173}}"/></svg>,
  };

  const mainActions = [
    { id: "save",    label: "收存", icon: fabIcons.save },
    { id: "append",  label: "补充", icon: fabIcons.append, primary: true },
    { id: "refine",  label: "精炼", icon: fabIcons.refine },
  ];
  const moreActions = [
    { id: "explain", label: "译解", icon: fabIcons.explain },
    { id: "concept", label: "概念卡", icon: fabIcons.concept },
    { id: "quote",   label: "金句", icon: fabIcons.quote },
    { id: "question",label: "问题", icon: fabIcons.question },
    { id: "copy",    label: "复制", icon: fabIcons.copy },
    { id: "panel",   label: "侧边栏", icon: fabIcons.panel },
  ];

  return (
    <div style={{
      width: 420, height: 680,
      borderRadius: "var(--r-lg)", overflow: "hidden",
      border: "0.5px solid var(--c-divider)",
      background: "var(--c-bg)", display: "flex",
      flexDirection: "column", boxShadow: "var(--shadow-lg)",
      position: "relative",
      ...(qoderProps?.style || {})
    }} className={qoderProps?.className} data-qoder-id="qel-div-b38463ae" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b38463ae&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:37,&quot;column&quot;:5}}">

      {/* ── State Switcher ── */}
      <div style={{
        display: "flex", gap: 4, padding: "8px 12px",
        background: "var(--c-surface)",
        borderBottom: "0.5px solid var(--c-divider)",
        flexShrink: 0
      }} data-qoder-id="qel-div-b4846541" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b4846541&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:48,&quot;column&quot;:7}}">
        {[
          { id: "capsule", label: "胶囊工具栏" },
          { id: "more",    label: "展开菜单" },
          { id: "ai",      label: "AI 内联结果" },
          { id: "fab",     label: "飞书同步按钮" },
        ].map(t => (
          <button key={t.id} onClick={() => setFabState(t.id)}
            style={{
              padding: "5px 10px", fontSize: 11, fontWeight: 500,
              border: "none", borderRadius: "var(--r-sm)",
              background: fabState === t.id ? "var(--c-brand-soft)" : "transparent",
              color: fabState === t.id ? "var(--c-brand)" : "var(--c-text-3)",
              cursor: "pointer", transition: "all 0.15s ease"
            }} data-qoder-id="qel-button-79ef119c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-79ef119c&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:60,&quot;column&quot;:11}}">
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Mock Webpage ── */}
      <div style={{
        flex: 1, overflow: "auto", padding: "20px 24px",
        background: "var(--c-bg)", position: "relative"
      }} data-qoder-id="qel-div-b6846867" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b6846867&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:74,&quot;column&quot;:7}}">
        {/* Mock article */}
        <div style={{ marginBottom: 12 }} data-qoder-id="qel-div-b78469fa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b78469fa&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:79,&quot;column&quot;:9}}">
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }} data-qoder-id="qel-h3-b57b713b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h3-b57b713b&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;h3&quot;,&quot;loc&quot;:{&quot;line&quot;:80,&quot;column&quot;:11}}">
            知识管理的 PARA 体系
          </h3>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--c-text-2)", marginBottom: 10 }} data-qoder-id="qel-p-42a79294" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-42a79294&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:83,&quot;column&quot;:11}}">
            PARA 体系由 Tiago Forte 提出，将所有信息分为四个类别：Projects（项目）、Areas（领域）、Resources（资源）和 Archives（归档）。
          </p>
          {/* "Selected" text — highlighted */}
          <p style={{
            fontSize: 13, lineHeight: 1.7, color: "var(--c-text)",
            background: "var(--c-brand-soft)", borderRadius: "var(--r-sm)",
            padding: "6px 8px", margin: "8px 0"
          }} data-qoder-id="qel-p-43a79427" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-43a79427&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:87,&quot;column&quot;:11}}">
            {fabState === "ai" ? "请把以下内容整理成 Obsidian 知识卡片" : "PARA 的核心理念是：所有输入的信息都按其可操作性而非主题分类"}
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--c-text-2)" }} data-qoder-id="qel-p-34a53df3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-34a53df3&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:94,&quot;column&quot;:11}}">
            项目是有明确目标和截止时间的，领域是需要持续维护的责任范围，资源是未来可能用到的参考资料，归档是已完成或不再活跃的内容。
          </p>
        </div>

        {/* ── Capsule Toolbar ── */}
        {fabState === "capsule" && (
          <div className="fab-capsule" style={{
            display: "inline-flex", alignItems: "center", gap: 2,
            padding: "4px 6px", borderRadius: 20,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)",
            marginTop: 8,
          }} data-qoder-id="qel-fab-capsule-4df68348" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-fab-capsule-4df68348&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;fab-capsule&quot;,&quot;loc&quot;:{&quot;line&quot;:101,&quot;column&quot;:11}}">
            {mainActions.map(a => (
              <button key={a.id} className={`fab-btn ${a.primary ? "fab-btn-primary" : ""}`}
                style={a.primary ? {
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "0 12px", height: 30, fontSize: 12, fontWeight: 600,
                  border: "none", borderRadius: 16,
                  background: "var(--c-brand)", color: "#fff",
                  cursor: "pointer", transition: "all 0.15s ease"
                } : {
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 30, height: 30, fontSize: 11,
                  border: "none", borderRadius: "50%",
                  background: "transparent", color: "var(--c-text-2)",
                  cursor: "pointer", transition: "all 0.15s ease"
                }} data-qoder-id="qel-button-82006755" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-82006755&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:110,&quot;column&quot;:15}}">
                {a.icon({ width: 14, height: 14 })}
                {a.primary && a.label}
              </button>
            ))}
            {/* Divider */}
            <span style={{ width: 1, height: 18, background: "rgba(0,0,0,0.08)", margin: "0 2px" }}  data-qoder-id="qel-span-e9a6491e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-e9a6491e&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:129,&quot;column&quot;:13}}"/>
            <button onClick={() => setFabState("more")} className="fab-btn" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 30, height: 30, border: "none", borderRadius: "50%",
              background: "transparent", color: "var(--c-text-3)", cursor: "pointer"
            }} data-qoder-id="qel-fab-btn-2b34b8c9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-fab-btn-2b34b8c9&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;fab-btn&quot;,&quot;loc&quot;:{&quot;line&quot;:130,&quot;column&quot;:13}}">
              {fabIcons.more({ width: 16, height: 16 })}
            </button>
          </div>
        )}

        {/* ── More Menu (expanded) ── */}
        {fabState === "more" && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 0, alignItems: "flex-start" }} data-qoder-id="qel-div-b695b188" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b695b188&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:142,&quot;column&quot;:11}}">
            {/* Mini capsule */}
            <div className="fab-capsule" style={{
              display: "inline-flex", alignItems: "center", gap: 2,
              padding: "4px 6px", borderRadius: 20,
              background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)",
              marginBottom: 4,
            }} data-qoder-id="qel-fab-capsule-54f68e4d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-fab-capsule-54f68e4d&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;fab-capsule&quot;,&quot;loc&quot;:{&quot;line&quot;:144,&quot;column&quot;:13}}">
              {mainActions.slice(0, 2).map(a => (
                <button key={a.id} className={`fab-btn ${a.primary ? "fab-btn-primary" : ""}`}
                  style={a.primary ? {
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "0 12px", height: 30, fontSize: 12, fontWeight: 600,
                    border: "none", borderRadius: 16,
                    background: "var(--c-brand)", color: "#fff", cursor: "pointer"
                  } : {
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 30, height: 30, border: "none", borderRadius: "50%",
                    background: "transparent", color: "var(--c-text-2)", cursor: "pointer"
                  }} data-qoder-id="qel-button-7d005f76" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-7d005f76&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:152,&quot;column&quot;:17}}">
                  {a.icon({ width: 14, height: 14 })}
                  {a.primary && a.label}
                </button>
              ))}
              <span style={{ width: 1, height: 18, background: "rgba(0,0,0,0.08)", margin: "0 2px" }}  data-qoder-id="qel-span-e0a63af3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-e0a63af3&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:167,&quot;column&quot;:15}}"/>
              <button className="fab-btn" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 30, height: 30, border: "none", borderRadius: "50%",
                background: "var(--c-brand-soft)", color: "var(--c-brand)", cursor: "pointer"
              }} data-qoder-id="qel-fab-btn-3634ca1a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-fab-btn-3634ca1a&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;fab-btn&quot;,&quot;loc&quot;:{&quot;line&quot;:168,&quot;column&quot;:15}}">{fabIcons.more({ width: 16, height: 16 })}</button>
            </div>
            {/* More menu dropdown */}
            <div className="fab-more-menu" style={{
              minWidth: 128, borderRadius: 12, padding: 4,
              background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1), 0 0 0 0.5px rgba(0,0,0,0.04)",
            }} data-qoder-id="qel-fab-more-menu-30530842" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-fab-more-menu-30530842&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;fab-more-menu&quot;,&quot;loc&quot;:{&quot;line&quot;:175,&quot;column&quot;:13}}">
              {moreActions.map(a => (
                <button key={a.id} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  width: "100%", padding: "8px 10px", fontSize: 12,
                  border: "none", borderRadius: 8,
                  background: "transparent", color: "var(--c-text)",
                  cursor: "pointer", transition: "all 0.1s ease", textAlign: "left"
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--c-surface-dim)"; e.currentTarget.style.color = "var(--c-brand)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--c-text)"; }} data-qoder-id="qel-button-fafd5439" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-fafd5439&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:181,&quot;column&quot;:17}}">
                  {a.icon({ width: 14, height: 14 })}
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── AI Result Window ── */}
        {fabState === "ai" && (
          <div className="fab-result" style={{
            width: "100%", borderRadius: 12, overflow: "hidden",
            background: "var(--c-surface)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 0 0 0.5px var(--c-divider)",
            marginTop: 8,
          }} data-qoder-id="qel-fab-result-f3396192" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-fab-result-f3396192&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;fab-result&quot;,&quot;loc&quot;:{&quot;line&quot;:200,&quot;column&quot;:11}}">
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 12px", borderBottom: "0.5px solid var(--c-divider)"
            }} data-qoder-id="qel-div-b4936fcb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b4936fcb&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:207,&quot;column&quot;:13}}">
              <div style={{ display: "flex", alignItems: "center", gap: 6 }} data-qoder-id="qel-div-b99377aa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b99377aa&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:211,&quot;column&quot;:15}}">
                <CatMascot state="loading" size={20}  data-qoder-id="qel-catmascot-81adc029" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-catmascot-81adc029&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;catmascot&quot;,&quot;loc&quot;:{&quot;line&quot;:212,&quot;column&quot;:17}}"/>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--c-text)" }} data-qoder-id="qel-span-dca3f610" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-dca3f610&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:213,&quot;column&quot;:17}}">精炼 · 知识卡片</span>
              </div>
              <button style={{
                border: "none", background: "transparent",
                color: "var(--c-text-3)", cursor: "pointer", padding: 2
              }} data-qoder-id="qel-button-fcfd575f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-fcfd575f&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:215,&quot;column&quot;:15}}">{fabIcons.close({ width: 14, height: 14 })}</button>
            </div>
            {/* Body */}
            <div style={{ padding: "12px", fontSize: 12, lineHeight: 1.7, color: "var(--c-text-2)" }} data-qoder-id="qel-div-ad9364c6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ad9364c6&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:221,&quot;column&quot;:13}}">
              <div style={{ fontWeight: 600, color: "var(--c-text)", marginBottom: 6 }} data-qoder-id="qel-div-ae936659" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ae936659&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:222,&quot;column&quot;:15}}">## 核心观点</div>
              <p style={{ marginBottom: 10 }} data-qoder-id="qel-p-c8a016c1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-c8a016c1&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:223,&quot;column&quot;:15}}">PARA 体系的本质是按可操作性而非主题分类信息，让知识库始终保持行动导向。</p>
              <div style={{ fontWeight: 600, color: "var(--c-text)", marginBottom: 6 }} data-qoder-id="qel-div-ae9127c2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ae9127c2&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:224,&quot;column&quot;:15}}">## 关键要点</div>
              <p style={{ marginBottom: 4 }} data-qoder-id="qel-p-c6a0139b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-c6a0139b&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:225,&quot;column&quot;:15}}">• Projects 有截止时间，Areas 需要持续维护</p>
              <p style={{ marginBottom: 4 }} data-qoder-id="qel-p-c5a01208" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-c5a01208&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:226,&quot;column&quot;:15}}">• Resources 是未来参考，Archives 是已完成</p>
              <p style={{ marginBottom: 10 }} data-qoder-id="qel-p-cca01d0d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-cca01d0d&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:227,&quot;column&quot;:15}}">• 分类标准是「下一步行动」而非「主题领域」</p>
              <div style={{ fontWeight: 600, color: "var(--c-text)", marginBottom: 6 }} data-qoder-id="qel-div-aa912176" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-aa912176&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:228,&quot;column&quot;:15}}">## 可复用启发</div>
              <p style={{ marginBottom: 10 }} data-qoder-id="qel-p-caa019e7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-caa019e7&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:229,&quot;column&quot;:15}}">在 Obsidian 中用 MOC（内容地图）作为 PARA 的入口，而非文件夹层级。</p>
              <div style={{
                display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8,
                paddingTop: 8, borderTop: "0.5px solid var(--c-divider)"
              }} data-qoder-id="qel-div-a8911e50" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a8911e50&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:230,&quot;column&quot;:15}}">
                <span className="chip" style={{ fontSize: 10 }} data-qoder-id="qel-chip-803e663f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-803e663f&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:234,&quot;column&quot;:17}}">#知识管理</span>
                <span className="chip" style={{ fontSize: 10 }} data-qoder-id="qel-chip-7f3e64ac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-7f3e64ac&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:235,&quot;column&quot;:17}}">#PARA</span>
                <span className="chip" style={{ fontSize: 10 }} data-qoder-id="qel-chip-823c2ace" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-823c2ace&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:236,&quot;column&quot;:17}}">#Obsidian</span>
              </div>
            </div>
            {/* Follow-up input */}
            <div style={{
              padding: "8px 12px", borderTop: "0.5px solid var(--c-divider)",
              display: "flex", gap: 8, alignItems: "center"
            }} data-qoder-id="qel-div-2a8e195f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-2a8e195f&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:240,&quot;column&quot;:13}}">
              <input type="text" placeholder="追问…" readOnly
                style={{
                  flex: 1, border: "0.5px solid var(--c-divider)", borderRadius: 16,
                  padding: "4px 10px", fontSize: 11, background: "var(--c-bg)",
                  color: "var(--c-text-3)", outline: "none"
                }}  data-qoder-id="qel-input-d6cede66" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-d6cede66&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:244,&quot;column&quot;:15}}"/>
              <button className="btn btn-primary btn-sm" style={{ fontSize: 10, padding: "3px 10px" }} data-qoder-id="qel-btn-b8551287" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-b8551287&quot;,&quot;filePath&quot;:&quot;react-vite/src/new-fab.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:250,&quot;column&quot;:15}}">发送</button>
            </div>
          </div>
        )}

        {/* ── Feishu FAB (redesigned) ── */}
        {fabState === "fab" && (
          <div style={{
            position: "absolute", right: 20, bottom: 20,
            display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end"
          }} data-qoder-id="qel-div-dc562f6d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-dc562f6d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:1259,&quot;column&quot;:11}}">
            {/* Tooltip */}
            <div style={{
              fontSize: 11, color: "var(--c-text-2)", background: "var(--c-surface)",
              padding: "6px 12px", borderRadius: 10, boxShadow: "var(--shadow-md)",
              border: "0.5px solid var(--c-divider)", maxWidth: 200, textAlign: "right",
              lineHeight: 1.5
            }} data-qoder-id="qel-div-db562dda" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-db562dda&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:1264,&quot;column&quot;:13}}">
              飞书文档页面自动检测<br data-qoder-id="qel-br-674f0416" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-br-674f0416&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;br&quot;,&quot;loc&quot;:{&quot;line&quot;:1270,&quot;column&quot;:25}}"/>
              <span style={{ color: "var(--c-text-3)", fontSize: 10 }} data-qoder-id="qel-span-6a5c24e1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-6a5c24e1&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1271,&quot;column&quot;:15}}">点击同步当前文档到 Obsidian</span>
            </div>
            {/* FAB — circular with cat mascot */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }} data-qoder-id="qel-div-d03a460c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-d03a460c&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:1274,&quot;column&quot;:13}}">
              {/* Expanded label */}
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", fontSize: 12, fontWeight: 600,
                borderRadius: 999, border: "0.5px solid var(--c-divider)",
                background: "var(--c-surface)", color: "var(--c-text)",
                boxShadow: "var(--shadow-sm)", cursor: "pointer",
                transition: "all 0.2s ease"
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--c-brand-soft)"; e.currentTarget.style.color = "var(--c-brand)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--c-surface)"; e.currentTarget.style.color = "var(--c-text)"; }} data-qoder-id="qel-div-d13a479f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-d13a479f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:1276,&quot;column&quot;:15}}">
                {fabIcons.sync({ width: 14, height: 14 })}
                同步到 Obsidian
              </div>
              {/* Circular FAB with cat */}
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "var(--c-brand)",
                boxShadow: "0 4px 14px rgba(7,193,96,0.3), 0 2px 0 0 rgba(6,160,80,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s var(--spring)",
                position: "relative"
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px) scale(1.05)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(7,193,96,0.35), 0 2px 0 0 rgba(6,160,80,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(7,193,96,0.3), 0 2px 0 0 rgba(6,160,80,0.5), inset 0 1px 0 rgba(255,255,255,0.15)"; }} data-qoder-id="qel-div-ce3a42e6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ce3a42e6&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:1290,&quot;column&quot;:15}}">
                <CatMascot state="idle" size={28} style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))" }}  data-qoder-id="qel-catmascot-0c278095" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-catmascot-0c278095&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;FloatingToolbarPreview&quot;,&quot;elementRole&quot;:&quot;catmascot&quot;,&quot;loc&quot;:{&quot;line&quot;:1300,&quot;column&quot;:17}}"/>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


function App(qoderProps) {
  const [activeView, setActiveView] = useState("popup");
  const [theme, setTheme] = useState("light");
  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

  return (
    <div
      data-theme={theme}
      style={{
        minHeight: "100vh",
        background: "var(--c-bg)",
        color: "var(--c-text)",
        padding: "48px 24px 80px",
        ...(qoderProps?.style || {})
      }}
     className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <ThemeToggle theme={theme} onToggle={toggleTheme}  data-qoder-id="qel-themetoggle-767fbb1d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-themetoggle-767fbb1d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;themetoggle&quot;,&quot;loc&quot;:{&quot;line&quot;:943,&quot;column&quot;:7}}"/>

      {/* — Header — */}
      <div style={{ textAlign: "center", marginBottom: 36 }} data-qoder-id="qel-div-bdbd5922" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-bdbd5922&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:946,&quot;column&quot;:7}}">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 8 }} data-qoder-id="qel-div-b8bd5143" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b8bd5143&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:947,&quot;column&quot;:9}}">
          <CatMascot state="idle" size={48}  data-qoder-id="qel-catmascot-6c309344" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-catmascot-6c309344&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;catmascot&quot;,&quot;loc&quot;:{&quot;line&quot;:948,&quot;column&quot;:11}}"/>
          <div style={{ textAlign: "left" }} data-qoder-id="qel-div-babd5469" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-babd5469&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:949,&quot;column&quot;:11}}">
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--c-text)", lineHeight: 1.2 }} data-qoder-id="qel-h1-58c1a8ac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h1-58c1a8ac&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;h1&quot;,&quot;loc&quot;:{&quot;line&quot;:950,&quot;column&quot;:13}}">
              KnowFlow · 知流
            </h1>
            <p style={{ fontSize: 13, color: "var(--c-text-3)", marginTop: 2 }} data-qoder-id="qel-p-8623d433" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-8623d433&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:953,&quot;column&quot;:13}}">
              飞书 → Obsidian 知识同步 · 设计预览
            </p>
          </div>
        </div>
      </div>

      {/* View Switcher */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }} data-qoder-id="qel-div-c91c3ed9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-c91c3ed9&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:634,&quot;column&quot;:7}}">
        <div className="view-switcher" data-qoder-id="qel-tabs-c5ac292d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tabs-c5ac292d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;tabs&quot;,&quot;loc&quot;:{&quot;line&quot;:635,&quot;column&quot;:9}}">
          {[
            { id: "popup", label: "Popup", icon: "popup" },
            { id: "sidepanel", label: "Side Panel", icon: "panel" },
             { id: "settings", label: "Settings", icon: "gear" },
            { id: "floating", label: "悬浮按钮", icon: "panel" },
          ].map(v => (
            <button key={v.id} className={`view-tab ${activeView === v.id ? "view-tab-active" : ""}`} onClick={() => setActiveView(v.id)} data-qoder-id="qel-button-d6f30a13" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-d6f30a13&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:641,&quot;column&quot;:13}}">
              {v.id === "popup" && <SvgIcons.popup width={14} height={14}  data-qoder-id="qel-svgicons-popup-3d77cd52" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-popup-3d77cd52&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;svgicons-popup&quot;,&quot;loc&quot;:{&quot;line&quot;:972,&quot;column&quot;:36}}"/>}
              {v.id === "sidepanel" && <SvgIcons.panel width={14} height={14}  data-qoder-id="qel-svgicons-panel-c321dc49" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-panel-c321dc49&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;svgicons-panel&quot;,&quot;loc&quot;:{&quot;line&quot;:973,&quot;column&quot;:40}}"/>}
              {v.id === "settings" && <SvgIcons.gear width={14} height={14}  data-qoder-id="qel-svgicons-gear-e5df5d01" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svgicons-gear-e5df5d01&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;svgicons-gear&quot;,&quot;loc&quot;:{&quot;line&quot;:974,&quot;column&quot;:39}}"/>}
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Container */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }} data-qoder-id="qel-div-b3ac0043" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b3ac0043&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:982,&quot;column&quot;:7}}">
        <div key={activeView} className="view-enter" data-qoder-id="qel-view-enter-74dae12d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-view-enter-74dae12d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;view-enter&quot;,&quot;loc&quot;:{&quot;line&quot;:983,&quot;column&quot;:9}}">
          {activeView === "popup" && <PopupPreview  data-qoder-id="qel-popuppreview-ca886555" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-popuppreview-ca886555&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;popuppreview&quot;,&quot;loc&quot;:{&quot;line&quot;:984,&quot;column&quot;:38}}"/>}
          {activeView === "sidepanel" && <SidePanelPreview  data-qoder-id="qel-sidepanelpreview-e973c742" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-sidepanelpreview-e973c742&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;sidepanelpreview&quot;,&quot;loc&quot;:{&quot;line&quot;:985,&quot;column&quot;:42}}"/>}
          {activeView === "settings" && <SettingsPreview  data-qoder-id="qel-settingspreview-2f2a36c7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-settingspreview-2f2a36c7&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;settingspreview&quot;,&quot;loc&quot;:{&quot;line&quot;:986,&quot;column&quot;:41}}"/>}
          {activeView === "floating" && <FloatingToolbarPreview  data-qoder-id="qel-floatingtoolbarpreview-50c94bcb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-floatingtoolbarpreview-50c94bcb&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;floatingtoolbarpreview&quot;,&quot;loc&quot;:{&quot;line&quot;:1339,&quot;column&quot;:41}}"/>}
        </div>
      </div>

      {/* Design Tokens Preview */}
      <div style={{ maxWidth: 680, margin: "48px auto 0" }} data-qoder-id="qel-div-cc1e8229" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-cc1e8229&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:656,&quot;column&quot;:7}}">
        <h2 style={{ textAlign: "center", marginBottom: 20, color: "var(--c-text)" }} data-qoder-id="qel-h2-08df69c6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h2-08df69c6&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;h2&quot;,&quot;loc&quot;:{&quot;line&quot;:657,&quot;column&quot;:9}}">设计系统一览</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }} data-qoder-id="qel-div-ca1e7f03" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ca1e7f03&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:658,&quot;column&quot;:9}}">
          {/* Colors */}
          <div className="card" data-qoder-id="qel-card-c1378aa7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-c1378aa7&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:660,&quot;column&quot;:11}}">
            <h3 style={{ marginBottom: 12, fontSize: 13, color: "var(--c-text)" }} data-qoder-id="qel-h3-65db688f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h3-65db688f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;h3&quot;,&quot;loc&quot;:{&quot;line&quot;:661,&quot;column&quot;:13}}">色板</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }} data-qoder-id="qel-div-cf1e86e2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-cf1e86e2&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:662,&quot;column&quot;:13}}">
              {[
                { color: "#07C160", label: "Brand" },
                { color: "#06A050", label: "Hover" },
                { color: "#E8F8EE", label: "Soft" },
                { color: "#F7F7F7", label: "BG" },
                { color: "#191919", label: "Text" },
                { color: "#666666", label: "Text 2" },
                { color: "#FA5151", label: "Error" },
                { color: "#FA9D3B", label: "Warn" },
              ].map(c => (
                <div key={c.label} style={{ textAlign: "center" }} data-qoder-id="qel-div-ce1e854f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ce1e854f&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:673,&quot;column&quot;:17}}">
                  <div style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", background: c.color, border: "0.5px solid var(--c-border)", marginBottom: 4 }}  data-qoder-id="qel-div-cd1e83bc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-cd1e83bc&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:674,&quot;column&quot;:19}}"/>
                  <span style={{ fontSize: 9, color: "var(--c-text-3)", fontWeight: 500 }} data-qoder-id="qel-span-aefda94d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-aefda94d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:675,&quot;column&quot;:19}}">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="card" data-qoder-id="qel-card-bb378135" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-bb378135&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:682,&quot;column&quot;:11}}">
            <h3 style={{ marginBottom: 12, fontSize: 13, color: "var(--c-text)" }} data-qoder-id="qel-h3-67ddaa4c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h3-67ddaa4c&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;h3&quot;,&quot;loc&quot;:{&quot;line&quot;:683,&quot;column&quot;:13}}">字体</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }} data-qoder-id="qel-div-cb2b4c89" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-cb2b4c89&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:684,&quot;column&quot;:13}}">
              <span style={{ fontSize: 20, fontWeight: 600, color: "var(--c-text)" }} data-qoder-id="qel-span-32f62a54" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-32f62a54&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:685,&quot;column&quot;:15}}">系统字体 600</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--c-text-2)" }} data-qoder-id="qel-span-33f62be7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-33f62be7&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:686,&quot;column&quot;:15}}">正文 500 中文测试</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: "var(--c-text-2)" }} data-qoder-id="qel-span-30f6272e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-30f6272e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:687,&quot;column&quot;:15}}">辅助文字 Regular</span>
              <span style={{ fontSize: 11, fontWeight: 400, color: "var(--c-text-3)" }} data-qoder-id="qel-span-31f628c1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-31f628c1&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:688,&quot;column&quot;:15}}">Caption muted</span>
            </div>
          </div>

          {/* Components */}
          <div className="card" data-qoder-id="qel-card-2e3ef203" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-2e3ef203&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:693,&quot;column&quot;:11}}">
            <h3 style={{ marginBottom: 12, fontSize: 13, color: "var(--c-text)" }} data-qoder-id="qel-h3-66dda8b9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h3-66dda8b9&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;h3&quot;,&quot;loc&quot;:{&quot;line&quot;:694,&quot;column&quot;:13}}">控件</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }} data-qoder-id="qel-div-d22b578e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-d22b578e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:695,&quot;column&quot;:13}}">
              <button className="btn btn-primary btn-md" style={{ width: "100%" }} data-qoder-id="qel-btn-61686d49" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-61686d49&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:696,&quot;column&quot;:15}}">Primary (按下试试)</button>
              <button className="btn btn-secondary btn-md" style={{ width: "100%" }} data-qoder-id="qel-btn-6e6ac057" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-6e6ac057&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:697,&quot;column&quot;:15}}">Secondary</button>
              <div style={{ display: "flex", gap: 6 }} data-qoder-id="qel-div-cf2d916c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-cf2d916c&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:698,&quot;column&quot;:15}}">
                <span className="chip chip-active" data-qoder-id="qel-chip-5ea65043" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-5ea65043&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:699,&quot;column&quot;:17}}">Active</span>
                <span className="chip" data-qoder-id="qel-chip-5da64eb0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-5da64eb0&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:700,&quot;column&quot;:17}}">Default</span>
                <span className="chip chip-brand" data-qoder-id="qel-chip-64a659b5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-64a659b5&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;chip&quot;,&quot;loc&quot;:{&quot;line&quot;:701,&quot;column&quot;:17}}">Brand</span>
              </div>
            </div>
          </div>

          {/* Cat States */}
          <div className="card" data-qoder-id="qel-card-2b3caeb3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-2b3caeb3&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:707,&quot;column&quot;:11}}">
            <h3 style={{ marginBottom: 12, fontSize: 13, color: "var(--c-text)" }} data-qoder-id="qel-h3-e7e0b263" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h3-e7e0b263&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;h3&quot;,&quot;loc&quot;:{&quot;line&quot;:708,&quot;column&quot;:13}}">猫咪状态</h3>
            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }} data-qoder-id="qel-div-cd2d8e46" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-cd2d8e46&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:709,&quot;column&quot;:13}}">
              {[
                { state: "idle", label: "空闲" },
                { state: "loading", label: "加载" },
                { state: "success", label: "成功" },
                { state: "sleeping", label: "睡觉" },
              ].map(c => (
                <div key={c.state} style={{ textAlign: "center" }} data-qoder-id="qel-div-d82d9f97" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-d82d9f97&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:716,&quot;column&quot;:17}}">
                  <CatMascot state={c.state} size={32}  data-qoder-id="qel-catmascot-f29ee7f8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-catmascot-f29ee7f8&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;catmascot&quot;,&quot;loc&quot;:{&quot;line&quot;:717,&quot;column&quot;:19}}"/>
                  <span className="caption" style={{ display: "block", marginTop: 4 }} data-qoder-id="qel-caption-dc88e3aa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-caption-dc88e3aa&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;caption&quot;,&quot;loc&quot;:{&quot;line&quot;:718,&quot;column&quot;:19}}">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
