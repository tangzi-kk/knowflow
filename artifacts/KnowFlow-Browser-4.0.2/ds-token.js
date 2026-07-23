"use strict";
(() => {
  // src/content/ds-token.ts
  var BRIDGE_SOURCE = "knowflow-deepseek-main";
  window.addEventListener("message", (event) => {
    if (event.source !== window || event.origin !== window.location.origin) return;
    const data = event.data;
    if (!data || data.source !== BRIDGE_SOURCE || data.type !== "token" || typeof data.token !== "string" || data.token.length <= 20 || data.token.length >= 2e3) return;
    chrome.runtime.sendMessage({
      type: "set-deepseek-token",
      payload: { token: data.token }
    }).catch(() => void 0);
  });
})();
//# sourceMappingURL=ds-token.js.map
