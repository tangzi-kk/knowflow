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
