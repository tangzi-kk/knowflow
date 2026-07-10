/**
 * DeepSeek Token 自动提取
 *
 * 注入到 chat.deepseek.com，从 localStorage / IndexedDB 提取 Bearer token
 * 并发送给 background 保存。用户无需手动粘贴 token。
 */
(function () {
  // 用 requestIdleCallback 确保页面完全加载后再提取
  const extract = () => {
    try {
      // 尝试从 localStorage 提取（DeepSeek Web 常见的 key）
      const keys = [
        'userToken',
        'ds_token',
        'token',
        'appearanceSettings', // 可能间接包含 token
        'AGENT_MESSAGES',
      ];

      let token = '';
      for (const key of keys) {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (typeof parsed === 'string' && parsed.length > 20) {
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
            // Is plain string
            if (val.length > 20 && val.length < 2000) {
              token = val;
              break;
            }
          }
        }
      }

      // 方法 2：监听 DeepSeek 的 API 请求，从 Authorization header 提取
      if (!token) {
        const origFetch = window.fetch;
        window.fetch = function (...args: Parameters<typeof fetch>) {
          const [url, init] = args;
          const urlStr = typeof url === 'string' ? url : url instanceof Request ? url.url : '';
          if (urlStr.includes('chat.deepseek.com/api') && init?.headers) {
            const headers = init.headers instanceof Headers
              ? Object.fromEntries(init.headers.entries())
              : Array.isArray(init.headers)
                ? Object.fromEntries(init.headers)
                : { ...init.headers };
            const auth = headers['authorization'] || headers['Authorization'] || '';
            if (auth.startsWith('Bearer ')) {
              const t = auth.slice(7);
              if (t.length > 20) {
                chrome.runtime.sendMessage({
                  type: 'set-deepseek-token',
                  payload: { token: t },
                });
                // 恢复原始 fetch
                window.fetch = origFetch;
              }
            }
          }
          return origFetch.apply(window, args as [RequestInfo | URL, RequestInit | undefined]);
        } as typeof fetch;
      }

      // 发送提取到的 token
      if (token) {
        chrome.runtime.sendMessage({
          type: 'set-deepseek-token',
          payload: { token },
        });
        console.log('[KnowFlow] DeepSeek token 已自动提取并保存');
      }
    } catch {
      // 静默失败
    }
  };

  // 延迟提取，确保 localStorage 已可用
  if (document.readyState === 'complete') {
    setTimeout(extract, 2000);
  } else {
    window.addEventListener('load', () => setTimeout(extract, 2000));
  }
})();
