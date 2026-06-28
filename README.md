# KnowFlow · 知流 — 飞书 ↔ Obsidian 知识同步

<p align="center">
  <img src="extension/icons/icon128.png" alt="KnowFlow" width="128" height="128">
</p>

<p align="center">
  <strong>飞书创作，Obsidian 整理，双向同步闭环。</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.1-blue" alt="version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license">
  <img src="https://img.shields.io/badge/platform-Obsidian%20Desktop%20%7C%20Chrome%20%7C%20Edge-orange" alt="platform">
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="node">
</p>

---

## 📖 核心理念

> **飞书 = 创作器**（高亮块、表格、多端编辑）  
> **Obsidian = 整理器 + 存储基准**（双链、标签、YAML 在此维护，最终以 OB 为准）

这不是单向推送，而是 **飞书创作 → 落地 OB → 整理后回写飞书** 的完整闭环。

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    触发层（3 入口）                       │
│                                                         │
│  ① 飞书悬浮按钮           ② OB 命令面板                 │
│  ┌──────────────────┐    ┌───────────────────────┐     │
│  │ "⬇ 同步到 OB"    │    │ Cmd+P "拉取飞书文档"    │     │
│  │ → obsidian://协议  │    │ → 输入 URL/Token       │     │
│  └────────┬─────────┘    └───────────┬───────────┘     │
│           │                          │                  │
│  ③ Clipper 兼容                                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 飞书官方 Clipper 剪藏 → 自动监听 → 真实同步       │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         ▼                               │
│              ┌──────────────────┐                       │
│              │   fetchHandler   │ ← 统一收口             │
│              │ (标准化下载+转换) │                        │
│              └────────┬─────────┘                       │
└───────────────────────┼─────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────┐
│              OB 插件核心 (FeishuSyncModule)              │
│                       │                                  │
│  ┌────────────────────▼─────────────────────┐          │
│  │       HTTP Server (localhost:4567)         │          │
│  │  /status  /tree  /fetch  /exists  /pushback│         │
│  └───────────────────────────────────────────┘          │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ callout  │ │ 图片     │ │ auto-    │ │ 删除       │ │
│  │ 双向转换  │ │ token    │ │ rename   │ │ registry   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │               lark-cli 封装层                       │ │
│  │  · GUI PATH 增强  · envelope 解包  · 指数退避重试  │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 下载 & 安装

本项目分为两个独立组件，各取所需：

### 🔌 组件 A · Obsidian 插件

> 在 Obsidian 中运行，负责接收同步请求、调用 lark-cli、读写文件、回写飞书。

**[⬇️ 下载最新版 Obsidian 插件](https://github.com/tangzi-kk/knowflow/releases/latest)**

| 文件 | 用途 |
|------|------|
| `main.js` | 插件主程序 |
| `manifest.json` | 插件元信息 |
| `styles.css` | 样式表 |

**安装步骤**：
1. 下载 `knowflow-obsidian-vX.X.X.zip` 并解压
2. 放入 vault 的 `.obsidian/plugins/feishu-sync/` 目录
3. Obsidian → 设置 → 第三方插件 → 关闭安全模式 → 启用「飞书同步 (fs-TB)」
4. 在插件设置页确认 lark-cli 路径，复制启动令牌

> 前置依赖：`lark-cli ≥ 1.0.52`，并已登录飞书（`lark-cli login`）

### 🧩 组件 B · 浏览器扩展

> 在 Chrome/Edge 中运行，注入飞书页面「同步到 OB」按钮，提供 Sidepanel 仪表盘。

**[⬇️ 下载最新版浏览器扩展](https://github.com/tangzi-kk/knowflow/releases/latest)**

**安装步骤**：
1. 下载 `knowflow-extension-vX.X.X.zip` 并解压
2. Chrome → `chrome://extensions` → 打开「开发者模式」
3. 点击「加载已解压的扩展程序」→ 选择解压后的文件夹
4. 点击扩展图标 → 设置页填入 OB 插件地址 `127.0.0.1:4567` 和启动令牌
5. 打开飞书文档，看到「⬇ 同步到 OB」按钮即成功

---

## ✨ 功能特性

| 特性 | 说明 |
|------|------|
| 🔄 **双向同步** | 飞书 → OB（拉取）、OB → 飞书（回写），hash 轻核验避免重复 |
| 🎨 **Callout 保留** | 飞书高亮块颜色/emoji → OB callout，回写时反向还原 |
| 🏷️ **元数据绑定** | 飞书头部「文档信息」callout ↔ OB YAML frontmatter 自动互转 |
| 📸 **图片处理** | 飞书图片 → `feishu://FILE_TOKEN` 永久引用，预览时实时下载 |
| 🔢 **自动编码** | auto-rename 自动分配短编码，支持标签 + 日期 + 序号 |
| 📋 **Clipper 兼容** | 监听飞书官方 Clipper 占位文件，自动替换为真实同步内容 |
| 🛡️ **Token 鉴权** | 本地通信 `X-Sync-Token` 保护，防止同网段未授权访问 |
| 📂 **目录树选择** | 同步时可选择 OB vault 中的落地目录 |

---

## 🚀 从源码构建

```bash
# 1. 克隆仓库
git clone https://github.com/tangzi-kk/knowflow.git
cd knowflow

# 2. 安装依赖
npm install

# 3. 构建全部（shared + OB 插件 + 浏览器扩展）
npm run build

# 4. 产物位置
# OB 插件：  packages/ob-plugin/main.js
# 浏览器扩展：extension/dist/
```

| 命令 | 作用 |
|------|------|
| `npm run build` | 构建全部 |
| `npm run build:shared` | 构建共享层 `@sync/shared` |
| `npm run build:ob` | 构建 OB 插件 → `packages/ob-plugin/main.js` |
| `npm run build:ext` | 构建扩展 → `extension/dist/` |
| `npm run dev` | watch 模式开发 |
| `npm run test:protocol` | 协议 URI 解析测试 |

---

## 📡 API 端点（OB 插件本地服务）

| 方法 | 路径 | 鉴权 | 用途 |
|------|------|:----:|------|
| GET | `/status` | 否 | 健康检查 + lark-cli 状态 |
| GET | `/tree` | 是 | vault 目录树（给扩展目录下拉） |
| POST | `/exists` | 是 | 检查 node_token 是否已同步 |
| POST | `/fetch` | 是 | 拉取飞书文档落地 OB |
| POST | `/pushback` | 是 | 回写飞书（通常命令触发） |

除 `/status` 外均需 `X-Sync-Token` 请求头。

---

## 🗂️ 项目结构

```
knowflow/
├── packages/
│   ├── shared/          # 共享层：类型、协议、callout 转换、hash、YAML、文件名、图片
│   └── ob-plugin/       # Obsidian 插件：HTTP Server + handler + lark-cli 封装
├── extension/           # 浏览器扩展：Chrome/Edge MV3
│   ├── src/             # TypeScript 源码
│   └── dist/            # 构建产物（可直接加载）
├── 方案.md              # 完整设计方案文档
├── LICENSE              # MIT
└── package.json         # monorepo 根配置
```

---

## 🛠️ 技术栈

- **TypeScript 5** + **esbuild**（OB 插件 CJS bundle，扩展 IIFE bundle）
- **node:http**（OB 插件本地 server，零第三方框架依赖）
- **js-yaml**（frontmatter 解析，支持中文 YAML 键名）
- **obsidian://** URI 协议（主通信通道，零延迟）
- **localhost HTTP**（辅助通道，目录查询/健康检查）
- **lark-cli**（飞书文档 API 命令行封装）
- **@sync/shared**（monorepo 共享层，被 OB 插件和扩展同时引用）

---

## 📝 YAML Frontmatter 规范

```yaml
---
# ═══════════ 同步绑定（插件自动维护，勿手动修改）═══════════
feishu_id: FauBwiFA7ipdMdkiCK7c4d1YnYb
feishu_doc_id: R3PLdIWglokwnqxdMlLcaXIgnnh
feishu_title: "🎯 眼镜的选择全攻略"
sync_hash: a3f5e8c2...
sync_time: 2026-06-15T10:30:00+08:00

# ═══════════ 知识标签（封闭枚举：S/X/L/Z/Q/J）═══════════
标签: S

# ═══════════ 编码（auto-rename 自动分配）═══════════
编码: 25_1221_S_09_a1

# ═══════════ 元数据字段 ═══════════
输入: "#0️⃣输入/💡碎片输入"
日期: 2025-12-21
关键词: 眼镜、验光、镜片选择
评分: 3
评分_显示: "🌟🌟🌟｜实践"
索引_知识库: 正财
索引_颜色: 蓝色工作
索引_操作&反馈: 完成
索引_块: [具象, 简单]
索引_风险: [行为]
---
```

---

## ❓ 常见问题

<details>
<summary><b>Q: lark-cli 找不到？</b></summary>

OB 桌面端由 macOS LaunchServices 启动，拿不到终端 PATH。插件已内置 GUI PATH 增强（nvm/homebrew/~/.local/bin），也可在设置页手动填绝对路径。
</details>

<details>
<summary><b>Q: 图片在 OB 里显示裂了？</b></summary>

飞书图片链接 1 小时过期。插件将图片转为 `feishu://FILE_TOKEN` 永久引用，预览时通过 `lark-cli docs +media-download` 实时下载。
</details>

<details>
<summary><b>Q: 回写后飞书标题变成 "Untitled"？</b></summary>

overwrite 命令清空整个文档含 title block。插件会在 overwrite 后追加 `str_replace` 修复标题。
</details>

<details>
<summary><b>Q: 什么是"删除登记"？</b></summary>

在 OB 中删除已同步的文件时，插件自动登记到飞书多维表格，以便后续在飞书端同步删除对应文档。
</details>

---

## 🗺️ 路线图

- [x] Phase 0：流程验证
- [x] Phase 1：MVP 核心同步
- [x] Phase 2：协议通道 + Clipper 兼容 + 构建一致性
- [ ] Phase 2.5：同步仪表盘 + 收件箱 + 模板工厂
- [ ] Phase 3：智能管道 + 自动同步规则
- [ ] Phase 4：知识图谱 + 语义关联
- [ ] Phase 5：跨端共生

详见 [方案.md](./方案.md)。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request。贡献前请阅读：

1. 架构设计文档：[方案.md](./方案.md)
2. 已知问题：[KNOWN_ISSUES.md](./packages/ob-plugin/KNOWN_ISSUES.md)
3. 代码风格：TypeScript strict mode，共享层修改需两边构建验证

---

## 📄 许可证

MIT © 2026 [Shi Keran](https://github.com/shikeran)

---

<p align="center">
  <sub>Made with ❤️ for knowledge workers who use both Feishu and Obsidian.</sub>
</p>
