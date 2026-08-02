# KnowFlow · 知流 — 飞书 ↔ Obsidian 知识同步

<p align="center">
  <img src="extension/icons/icon128.png" alt="KnowFlow" width="128" height="128">
</p>

<p align="center">
  <strong>飞书创作，Obsidian 整理，双向同步闭环。</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/release-4.5.3-blue" alt="release version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license">
  <img src="https://img.shields.io/badge/platform-Obsidian%20Desktop%20%7C%20Chrome%20%7C%20Edge-orange" alt="platform">
  <img src="https://img.shields.io/badge/node-%3E%3D22.6-brightgreen" alt="node">
</p>

---

## 版本状态

当前已核验的最新运行产物见 [`VERSION_INDEX.md`](VERSION_INDEX.md)：

| 分类 | 组件 | 版本 | 仓库内地址 | 状态 |
|---|---|---:|---|---|
| 当前版本 | `fs-TB` + `KnowFlow` | `4.5.3` | [`GitHub Release v4.5.3`](https://github.com/tangzi-kk/knowflow/releases/tag/v4.5.3) | 日志导出、编码目标冲突保护、纯中文右键菜单 |
| 运行归档 | `fs-TB` | `3.2.1` | `releases/obsidian-fs-TB/3.2.1/` | 已核验真实运行 |
| 独立旧扩展 | `Feishu Doc Exporter` | `0.3.0` | `releases/browser-feishu-doc-exporter/0.3.0/` | 已核验，不与 KnowFlow 混同 |

仓库地址：[github.com/tangzi-kk/knowflow](https://github.com/tangzi-kk/knowflow)

当前正式发布：[KnowFlow v4.5.3](https://github.com/tangzi-kk/knowflow/releases/tag/v4.5.3)

4.5.3 已完成双端自动门禁和真实 Obsidian 验收：插件状态接口返回 `4.5.3`，提示词目录恢复后保持 17 篇 Markdown，Vault 内没有残留 `.knowflow-tmp.md`。详细记录见 [`4.5.3 验收记录`](docs/validation/4.5.3-acceptance.md)。

当前安装包：

- Obsidian：`artifacts/fs-TB-Obsidian-4.5.3.zip`
- Chrome/Edge：`artifacts/KnowFlow-Browser-4.5.3/` 或 `artifacts/KnowFlow-Browser-4.5.3.zip`

阅读入口：

- 人类阅读说明：[`docs/human-guide.html`](docs/human-guide.html)
- AI 接手说明：[`docs/AI_HANDOFF.md`](docs/AI_HANDOFF.md)
- 当前设计入口：[`docs/design/README.md`](docs/design/README.md)
- 需求池：[`需求池.md`](需求池.md)；本地编辑页：[`需求编辑器.html`](需求编辑器.html)（产品需求直接保存，另可导出记忆候选与知识需求）
- UI 原型：[`ui-prototype/README.md`](ui-prototype/README.md)

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
│  │ → localhost /fetch │    │ → 输入 URL/Token       │     │
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
│  │ callout  │ │ 图片     │ │ 整理预览  │ │ 删除       │ │
│  │ 双向转换  │ │ token    │ │ + 事务回滚│ │ registry   │ │
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

本项目分为两个独立组件，各取所需。不要混装：Obsidian 插件放进 vault，浏览器扩展加载到 Chrome/Edge。

### 🔌 组件 A · Obsidian 插件

> 在 Obsidian 中运行，负责接收同步请求、调用 lark-cli、读写文件、回写飞书。

**[⬇️ 下载最新版 Obsidian 插件](https://github.com/tangzi-kk/knowflow/releases/latest)**

| 文件 | 用途 |
|------|------|
| `main.js` | 插件主程序 |
| `manifest.json` | 插件元信息 |
| `styles.css` | 样式表 |

**安装步骤**：
1. 下载 [`fs-TB-Obsidian-4.5.3.zip`](https://github.com/tangzi-kk/knowflow/releases/download/v4.5.3/fs-TB-Obsidian-4.5.3.zip) 并解压
2. 放入 vault 的 `.obsidian/plugins/fs-TB/` 目录
3. Obsidian → 设置 → 第三方插件 → 关闭安全模式 → 启用「飞书同步 (fs-TB)」
4. 在插件设置页确认 lark-cli 路径，复制启动令牌

升级时只替换 `main.js`、`manifest.json`、`styles.css`，保留已有的 `data.json`；不要把其他 Vault 私有文件复制进插件目录。

> 前置依赖：`lark-cli ≥ 1.0.52`，并已登录飞书（`lark-cli login`）

### 🧩 组件 B · 浏览器扩展

> 在 Chrome/Edge 中运行，注入飞书页面「同步到 OB」按钮，提供 Sidepanel 仪表盘。

**[⬇️ 下载最新版浏览器扩展](https://github.com/tangzi-kk/knowflow/releases/latest)**

**安装步骤**：
1. 下载 [`KnowFlow-Browser-4.5.3.zip`](https://github.com/tangzi-kk/knowflow/releases/download/v4.5.3/KnowFlow-Browser-4.5.3.zip) 并解压
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
| 🔢 **自动识别与编码** | 新建/修改后自动按标题、正文和关键词识别标签、分配完整编码并改名为短编码前缀；需要重新归类时从右键修改标签，文件夹还可直接剪藏到当前目录 |
| 📋 **Clipper 兼容** | 监听飞书官方 Clipper 占位文件，自动替换为真实同步内容 |
| 🛡️ **Token 鉴权** | 本地通信 `X-Sync-Token` 保护，防止同网段未授权访问 |
| 📂 **目录树选择** | 同步时可选择 OB vault 中的落地目录 |
| 🧾 **同步日志导出** | 命令面板执行“导出同步日志”，写入当前 Vault 的 `.feishu-sync/同步日志-<时间>.md` |
| 🧱 **冲突安全保护** | 自动编码遇到目标占用或重复编码时只跳过冲突项，不覆盖已有文档，也不反复弹出失败通知 |

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
| `npm test` | 运行全部自动验收门禁 |
| `npm run typecheck:ob` | 严格检查 Obsidian 源码 |
| `npm run typecheck:ext` | 严格检查浏览器源码 |
| `npm run dev` | watch 模式开发 |
| `npm run test:protocol` | 协议 URI 解析测试 |

Obsidian 命令面板常用入口：`自动识别并整理全库文档`、`显示最近同步记录`、`导出同步日志`。日志导出文件写入当前 Vault 的 `.feishu-sync/同步日志-<时间>.md`。

发布包校验：

```bash
shasum -a 256 -c artifacts/KnowFlow-4.5.3-SHA256SUMS
(cd artifacts && shasum -a 256 -c KnowFlow-4.5.3-PACKAGES-SHA256SUMS)
```

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
├── docs/
│   ├── design/          # 设计方案、悬浮窗交互与调研文档
│   ├── human-guide.html # 给人类阅读的组件说明
│   ├── AI_HANDOFF.md    # 给 AI/Codex 接手的说明
│   └── diagrams/        # Mermaid 架构与流程图
├── releases/            # 已核验运行产物归档
├── VERSION_INDEX.md     # 最新版本索引
├── LICENSE              # MIT
└── package.json         # monorepo 根配置
```

---

## 🛠️ 技术栈

- **TypeScript 5** + **esbuild**（OB 插件 CJS bundle，扩展 IIFE bundle）
- **node:http**（OB 插件本地 server，零第三方框架依赖）
- **js-yaml**（frontmatter 解析，支持中文 YAML 键名）
- **localhost HTTP**（可信写入主通道，返回最终路径后才显示成功）
- **obsidian://** URI 协议（保留为唤醒/兼容入口，不作为写入成功证据）
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

# ═══════════ 编码（后端完整值；界面和文件名显示短编码）═══════════
编码: 25_1221_S_09_a1
短编码: S09.a1

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

当前只完成安全的“主动登记”基础能力；直接删除已绑定文件时，自动识别并生成待确认记录仍是未完成需求 `KF-001`。默认不删除飞书远端文档。
</details>

<details>
<summary><b>Q: 文档很多，如何自动编码？</b></summary>

默认打开“自动识别并编码文档”后，新建、修改或改名 Markdown 会自动识别、分配完整编码并写入；文件名和界面默认显示短编码（如 `S01.a1`），低置信度文档回退为 `S`。受保护目录、损坏 YAML 和冲突项会跳过并提示；需要把目录内文档从 `Q`、`Z` 等任一合法标签统一改为另一合法标签时，在文件树右键“修改标签”，目录默认递归处理子目录。文件夹右键的“剪藏到这里…”负责把飞书内容采集到当前目录。需要全库补齐时，运行 Ribbon 或命令面板中的“自动识别并整理全库文档”。

标签修改面板只显示标签下拉选择和修改后的路径预览，不展示完整编码、重复编码或内部事务信息。
</details>

<details>
<summary><b>Q: 文件夹会自动编码吗？</b></summary>

会，但目录层级是固定的：根入口目录永远不编码；`🪧导引/` 和 `3️⃣附件文件/` 整棵目录树永远保护；`0️⃣输入/` 与 `1️⃣🗃知识池/` 的二级语义入口也不编码，从三级文件夹开始才自动编码；`2️⃣输出/` 的二级目录可以编码。可编码目录会得到类似 `Z01 · 剪藏` 的短编码并提示，长编码保存在 `.feishu-sync/目录编码索引.json`，不写入 YAML。设置页可填写相对 Vault 路径白名单，白名单及隐藏目录、`.feishu-sync` 始终跳过。右键只有可编码目录才显示“调整此文件夹结构编码…”，目录内 Markdown 的标签整理使用“修改此目录标签（含子目录）…”。
</details>

---

## 🗺️ 路线图

- [x] Phase 0：流程验证
- [x] Phase 1：MVP 核心同步
- [x] Phase 2：协议通道 + Clipper 兼容 + 构建一致性
- [ ] `KF-101`：飞书知识库批量同步
- [ ] `KF-102`：同步仪表盘与待处理收件箱
- [ ] `KF-103`：冲突提示与差异界面
- [ ] `KF-104`：后台定时拉取与规则管道
- [ ] `KF-105`：条件模板工厂
- [ ] `KF-108`：知识关联、多 Vault 和跨端长期方向

状态和优先级只在 [需求池.md](./需求池.md) 维护，设计入口见 [docs/design/README.md](./docs/design/README.md)。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request。贡献前请阅读：

1. 架构设计文档：[docs/README.md](./docs/README.md)
2. 已知问题：[KNOWN_ISSUES.md](./packages/ob-plugin/KNOWN_ISSUES.md)
3. 代码风格：TypeScript strict mode，共享层修改需两边构建验证

---

## 📄 许可证

MIT © 2026 [Shi Keran](https://github.com/shikeran)

---

<p align="center">
  <sub>Made with ❤️ for knowledge workers who use both Feishu and Obsidian.</sub>
</p>
