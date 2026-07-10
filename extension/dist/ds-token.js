"use strict";
(() => {
  // src/content/ds-token.ts
  (function() {
    const extract = () => {
      try {
        const keys = [
          "userToken",
          "ds_token",
          "token",
          "appearanceSettings",
          // 可能间接包含 token
          "AGENT_MESSAGES"
        ];
        let token = "";
        for (const key of keys) {
          const val = localStorage.getItem(key);
          if (val) {
            try {
              const parsed = JSON.parse(val);
              if (typeof parsed === "string" && parsed.length > 20) {
                token = parsed;
                break;
              }
              if (parsed?.access_token || parsed?.token) {
                token = parsed.access_token || parsed.token;
                break;
              }
              if (parsed?.data?.userToken || parsed?.userToken) {
                token = parsed.data?.userToken || parsed?.userToken;
                break;
              }
            } catch {
              if (val.length > 20 && val.length < 2e3) {
                token = val;
                break;
              }
            }
          }
        }
        if (!token) {
          const origFetch = window.fetch;
          window.fetch = function(...args) {
            const [url, init] = args;
            const urlStr = typeof url === "string" ? url : url instanceof Request ? url.url : "";
            if (urlStr.includes("chat.deepseek.com/api") && init?.headers) {
              const headers = init.headers instanceof Headers ? Object.fromEntries(init.headers.entries()) : Array.isArray(init.headers) ? Object.fromEntries(init.headers) : { ...init.headers };
              const auth = headers["authorization"] || headers["Authorization"] || "";
              if (auth.startsWith("Bearer ")) {
                const t = auth.slice(7);
                if (t.length > 20) {
                  chrome.runtime.sendMessage({
                    type: "set-deepseek-token",
                    payload: { token: t }
                  });
                  window.fetch = origFetch;
                }
              }
            }
            return origFetch.apply(window, args);
          };
        }
        if (token) {
          chrome.runtime.sendMessage({
            type: "set-deepseek-token",
            payload: { token }
          });
          console.log("[KnowFlow] DeepSeek token \u5DF2\u81EA\u52A8\u63D0\u53D6\u5E76\u4FDD\u5B58");
        }
      } catch {
      }
    };
    if (document.readyState === "complete") {
      setTimeout(extract, 2e3);
    } else {
      window.addEventListener("load", () => setTimeout(extract, 2e3));
    }
  })();
})();
//# sourceMappingURL=ds-token.js.map
