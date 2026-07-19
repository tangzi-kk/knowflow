/**
 * Popup 脚本 v2 — 状态条 + 卡片按钮 + 连接配置。
 */
import {
  loadConfig,
  saveConfig,
  getStatus,
  testConnection,
  type SyncConfig,
} from '../client.js';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

async function init(): Promise<void> {
  const config = await loadConfig();

  $<HTMLInputElement>('host').value = config.host;
  $<HTMLInputElement>('port').value = String(config.port);
  $<HTMLInputElement>('token').value = config.token;

  if (config.token) {
    checkStatus(config);
  } else {
    updateStatus(false);
  }

  $<HTMLButtonElement>('save-btn').onclick = async () => {
    const newConfig: SyncConfig = {
      host: $<HTMLInputElement>('host').value.trim() || '127.0.0.1',
      port: parseInt($<HTMLInputElement>('port').value, 10) || 4567,
      token: $<HTMLInputElement>('token').value.trim(),
    };
    await saveConfig(newConfig);
    showResult('已保存', 'success');
    checkStatus(newConfig);
  };

  $<HTMLButtonElement>('test-btn').onclick = async () => {
    const newConfig: SyncConfig = {
      host: $<HTMLInputElement>('host').value.trim() || '127.0.0.1',
      port: parseInt($<HTMLInputElement>('port').value, 10) || 4567,
      token: $<HTMLInputElement>('token').value.trim(),
    };
    showResult('测试中...', 'success');
    const result = await testConnection(newConfig);
    showResult(result.message, result.ok ? 'success' : 'error');
    updateStatus(result.ok);
  };

  $<HTMLButtonElement>('open-sidepanel-btn').onclick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      showResult('无法识别当前标签页', 'error');
      return;
    }
    try {
      const sidePanel = chrome.sidePanel as typeof chrome.sidePanel & {
        open(options: { tabId: number }): Promise<void>;
      };
      await sidePanel.open({ tabId: tab.id });
      window.close();
    } catch (err) {
      showResult(`侧边栏打开失败：${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  };

  $<HTMLButtonElement>('open-settings-btn').onclick = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html?section=general') });
  };

  // AI 助手按钮
  $<HTMLButtonElement>('open-ai-btn').onclick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      const sidePanel = chrome.sidePanel as typeof chrome.sidePanel & { open(options: { tabId: number }): Promise<void> };
      sidePanel.open({ tabId: tab.id });
      // 等 sidepanel 加载后切到 AI tab
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'ai-chat', payload: { action: 'ai-chat', text: '' } }).catch(() => {});
      }, 500);
    }
  };

  // 悬浮工具栏开关
  const toolbarToggle = document.getElementById('toolbar-enabled') as HTMLInputElement;
  if (toolbarToggle) {
    chrome.storage.sync.get(['toolbarEnabled'], (result) => {
      toolbarToggle.checked = result.toolbarEnabled !== false;
    });
    toolbarToggle.addEventListener('change', () => {
      chrome.storage.sync.set({ toolbarEnabled: toolbarToggle.checked });
      // 通知所有 tab 刷新工具栏状态
      chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, {
              type: 'toolbar-toggle',
              payload: { enabled: toolbarToggle.checked },
            }).catch(() => {});
          }
        }
      });
    });
  }
}

async function checkStatus(config: SyncConfig): Promise<void> {
  try {
    const status = await getStatus(config);
    const ok = status.larkReady;
    const recentFailure = status.recentActivity?.find((item) => item.status === 'failed');
    updateStatus(ok, recentFailure ? `${status.vault} · 最近失败 ${recentFailure.errorCode || recentFailure.kind}` : status.vault);
  } catch {
    updateStatus(false);
  }
}

function updateStatus(ok: boolean, vault?: string): void {
  const bar = $<HTMLDivElement>('status-bar');
  const text = $<HTMLSpanElement>('status-text');
  const label = $<HTMLSpanElement>('vault-label');

  if (ok) {
    bar.className = 'status-bar status-ok';
    text.textContent = '已连接';
    if (vault) {
      label.textContent = vault;
      label.style.display = '';
    } else {
      label.style.display = 'none';
    }
  } else {
    bar.className = 'status-bar status-error';
    text.textContent = '未连接';
    label.style.display = 'none';
  }
}

function showResult(message: string, type: 'success' | 'error'): void {
  const el = $<HTMLDivElement>('result');
  el.textContent = message;
  el.className = `result show ${type}`;
}

init();
