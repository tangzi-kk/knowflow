# 悬浮窗交互与 OB 同步改进方案

> 2026-06-28 | 基于代码审查 + 用户反馈

---

## 现状诊断

### 问题一：悬浮窗 AI 点击反馈差

**当前代码链路**（toolbar.ts:736-758 + background.ts:51-85）：

```
点击「译解/金句/问题/概念卡」
  → renderInlineResult(title, '正在生成…')     ← 静态文字，无变化
  → chrome.runtime.sendMessage({ type: 'ai-inline' })
  → background.runInlineAi()                    ← 读 aiConfig from storage
  → provider === 'gemini-web' (默认)
  → fetch(gemini.google.com/app) 拿 token       ← 2-5 秒，无进度反馈
  → 解析 + fetch Bard API
  → 结果通过 sendResponse 返回
  → renderInlineResult(title, text)
```

**核心问题**：

1. **双套 AI 配置互相隔离**：`runInlineAi()` 只读 `aiConfig`，`suggestMetaWithInterpreter()` 只读 `interpreterConfig`。用户设置的"自定义 AI 解释器"开关对 toolbar inline AI 完全不生效。

2. **Gemini Web 失败静默**：session 过期 → fetch gemini.google.com/app 失败 → Error 抛出 → toolbar 就显示一个红色错误文字。用户不知道该重试还是换 provider。

3. **"正在生成…" 是死文字**：从点击到结果出来之间没有任何状态变化，用户大概率以为卡死了。

### 问题二：OB 同步双通道同时打

**当前代码**（content.ts onSyncClick()）：

```
点击 FAB →
  ├─ [主通道] tryOpenObsidianUri(obsidian://lark-doc?token=...)
  │       ↓ 协议成功/失败 → 前端完全不知道
  │       ↓ OB 端 9 步处理 → 前端完全不可见
  │
  └─ [降级通道] 同时 feishu-sync-trigger → background
          ↓ sidePanel.open() ← 不管协议通没通都开！
          ↓ clip-data(triggerSync:true) → 侧边栏 feishu-sync 面板
```

**核心问题**：双通道无差别同时触发 + FAB 按钮零状态反馈。

---

## 改进方案

### 改法一：统一 AI Provider 选择逻辑

**改动文件**：`background.ts` 的 `runInlineAi()`

**逻辑**：

```
runInlineAi() 执行时：
  1. 读取 interpreterConfig.customProviderEnabled
  2. 如果 customProviderEnabled === false（默认）
     → 强制使用 Gemini Web（忽略 aiConfig.provider）
     → 失败时：显示 "Gemini Web 连接失败。请打开 gemini.google.com 刷新登录，或开启「自定义 AI 解释器」"
  3. 如果 customProviderEnabled === true
     → 使用 aiConfig.provider 走用户配置的通道
     → 失败时：显示对应 provider 的错误信息
  4. 全程 8 秒超时
```

**具体改动**（background.ts `runInlineAi` 函数）：

```typescript
async function runInlineAi(payload: { ... }): Promise<string> {
  const stored = await chrome.storage.sync.get('aiConfig');
  const config = { ...DEFAULT_INLINE_AI_CONFIG, ...(stored.aiConfig ?? {}) };
  
  // ★ 新增：统一读取解释器配置
  const interpreterStored = await chrome.storage.sync.get('interpreterConfig');
  const interpreterConfig = interpreterStored?.interpreterConfig ?? {};
  const useCustomProvider = interpreterConfig?.customProviderEnabled === true;
  
  const text = payload.text?.trim();
  // ... 现有 validation ...
  
  if (!useCustomProvider) {
    // 强制走 Gemini Web（不管 aiConfig.provider 设了什么）
    try {
      return await withTimeout(
        sendGeminiWebMessage(`${config.systemPrompt}\n\n${prompt}`, config.model, attachments),
        8000,
        'AI 请求超时。请重试或开启「自定义 AI 解释器」后使用自定义 API。'
      );
    } catch (e) {
      throw new Error(
        'Gemini Web 连接失败。请打开 gemini.google.com 刷新登录，' +
        '或先在侧边栏开启「自定义 AI 解释器」后使用自定义 API Key。'
      );
    }
  }
  
  // customProviderEnabled === true：走用户配置的 provider 链
  if (config.provider === 'gemini-web') return sendGeminiWebMessage(...);
  if (config.provider === 'gemini-nano') throw new Error(...);
  if (config.provider === 'gemini-api') {
    // ... 现有代码，加 timeout ...
  }
  // ... 现有 openai/deepseek/custom 代码，加 timeout ...
}
```

---

### 改法二：Toolbar showResult 即时反馈 + 进度

**改动文件**：`toolbar.ts` 的 `handleCapsuleAction` 分支 B + `renderInlineResult`

**改动点**：

1. **按钮即时反应**：点击瞬间按钮变 loading spinner，`renderInlineResult` 显示带 spinner 的面板
2. **分阶段进度**：
   - "正在连接 AI..." （0-2s）
   - "正在分析内容..." （2-8s）
   - 渲染结果 / 错误 + 重试按钮
3. **取消按钮**：在 loading 面板上加关闭按钮（设置 abort controller）
4. **超时 8s**：满 8s 显示 "请求超时 + 重试按钮"

```typescript
// 分支 B：handleCapsuleAction 中的 showResult
if (scene.action === 'showResult') {
  const resultTitle = scene.label || 'AI 结果';
  const btnEl = btn; // 保存按钮引用
  
  // 1. 按钮变 loading
  btn.classList.add('loading');
  btn.disabled = true;
  
  // 2. 打开结果面板 + 第一段进度
  renderInlineResult(resultTitle, '<div class="ai-progress"><span class="spinner"></span> 正在连接 AI...</div>');
  
  // 3. 1.5s 后更新进度
  const progressTimer = setTimeout(() => {
    renderInlineResult(resultTitle, '<div class="ai-progress"><span class="spinner"></span> 正在分析内容...</div>');
  }, 1500);
  
  // 4. 发起 AI 请求
  chrome.runtime.sendMessage(
    { type: 'ai-inline', payload: { action: scene.id, prompt: fillPrompt(scene.prompt, text), text, title, url } },
    (response) => {
      clearTimeout(progressTimer);
      btn.classList.remove('loading');
      btn.disabled = false;
      
      const error = chrome.runtime.lastError?.message;
      if (error || response?.error) {
        const errMsg = error || response?.error || 'AI 未返回内容';
        renderInlineResult(
          resultTitle,
          `<div class="ai-error">${escapeHtml(errMsg)}</div>
           <button class="ai-retry-btn" data-action="${scene.id}">重试</button>`
        );
        bindInlineRetry(scene, text, title, url); // 绑定重试事件
        showToast('AI 调用失败');
        return;
      }
      renderInlineResult(resultTitle, response?.text || 'AI 未返回内容');
    }
  );
}

// 取消按钮绑定
function bindInlineClose() {
  shadow?.querySelector('.result-close')?.addEventListener('click', () => {
    // 如果有进行中的请求，通过 controller abort
    hideToolbar();
  });
}
```

---

### 改法三：FAB 同步按钮状态机

**改动文件**：`content.ts` 的 `onSyncClick()` + FAB DOM 结构

**当前问题**：onSyncClick() 双通道同时打，FAB 按钮无状态反馈

**改进**：

```
FAB 状态机：
  idle → [点击] → syncing(协议连接中) → OB 处理中 → ✓ 成功 / ✗ 失败

具体流程：
  1. 点击 → 按钮变 spinner + "同步中..."
  2. 先走协议通道 tryOpenObsidianUri()
  3. 等 3s：
     a. 如果 OB 通过 HTTP callback 回传成功 → 显示 ✓（2s 后回 idle）
     b. 如果超时 → 走降级通道 sidePanel.open + clip-data
  4. 降级通道完成后 → 显示 ✓ / ✗
```

**具体改动**：

```typescript
async function onSyncClick(fabBtn: HTMLElement): Promise<void> {
  const tokenInfo = extractTokenFromUrl();
  const title = getDocumentTitle();
  const obsidianUri = buildObsidianLarkDocUri(tokenInfo, title);
  
  // 1. 进入 syncing 状态
  fabBtn.classList.add('syncing');
  fabBtn.innerHTML = '<span class="fab-spinner"></span> 同步中';
  
  // 2. 先走协议主通道
  const protocolResult = await tryOpenObsidianUri(obsidianUri);
  
  // 3. 等协议结果（带 timeout）
  const callbackReceived = await waitForSyncCallback(3000);
  
  if (callbackReceived) {
    // 成功
    fabBtn.classList.remove('syncing');
    fabBtn.classList.add('success');
    fabBtn.innerHTML = '<span class="fab-check">✓</span>';
    setTimeout(() => { fabBtn.classList.remove('success'); resetFabButton(); }, 2000);
    return;
  }
  
  // 4. 协议超时/失败 → 走降级通道
  chrome.runtime.sendMessage({
    type: 'feishu-sync-trigger',
    payload: { node_token: tokenInfo?.node_token, obj_token: tokenInfo?.obj_token, title, url: window.location.href }
  });
  
  // 降级通道会打开 sidepanel，监听 sidepanel 的完成消息
  // 完成后更新 FAB 状态
  fabBtn.classList.remove('syncing');
  fabBtn.classList.add('success');
  fabBtn.innerHTML = '<span class="fab-check">✓</span>';
  setTimeout(resetFabButton, 2000);
}
```

---

### 改法四：OB 端新增 /callback 端点（长期优化，P2）

**改动文件**：`server.ts` + `fetchHandler.ts`

OB 同步完成后 POST 回扩展的 background 端口：
```
OB 端 fetchHandler 完成后
  → POST http://extension-localhost:xxxxx/callback
  → Body: { token, status: 'ok' | 'error', path }
  → background 更新 badge / 回传 toolbar/content
```

这个改动较大，涉及扩展端暴露 HTTP 监听，建议作为 P2。

---

## 改动文件清单

| 优先级 | 文件 | 改动范围 | 预计行数 |
|--------|------|---------|---------|
| **P0** | `background.ts` | runInlineAi 统一 Provider 选择 + 超时 + 错误信息 | ~30 行 |
| **P0** | `toolbar.ts` | showResult 即时反馈 + 分阶段进度 + 重试按钮 | ~50 行 |
| **P1** | `content.ts` | FAB 同步按钮状态机 + 串行通道 | ~60 行 |
| **P1** | `toolbar.css` | spinner / progress / error / retry 样式 | ~40 行 |
| **P2** | `server.ts` | 新增 /callback 端点 | ~20 行 |

---

## 预期效果

| 指标 | 当前 | 改进后 |
|------|------|--------|
| 点击到首次视觉反馈 | 0ms（静态"正在生成"） | <50ms（按钮变 spinner + 面板展开） |
| 进度可感知 | 无 | 2 阶段文字变化 |
| 超时处理 | 无（一直等） | 8s 超时 + 重试按钮 |
| AI 配置一致性 | 两套独立系统 | 统一由 interpreterEnabled 控制 |
| 同步按钮反馈 | 无状态变化 | idle → syncing → ✓/✗ |
| 同步双通道 | 同时打 | 串行：协议优先 → 降级 |
