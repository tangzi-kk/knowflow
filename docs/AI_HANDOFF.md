# KnowFlow AI 接手说明

本文件给后续 AI / Codex 接手 KnowFlow 项目时使用。先区分组件，再改代码；不要把 Obsidian 插件和浏览器扩展混在一起。

## 组件分类

| 分类 | 组件 | 当前发布版本 | 源码/产物路径 | 运行位置 |
|---|---|---:|---|---|
| Obsidian 插件 | `fs-TB` | `4.0.2` | 源码：`packages/ob-plugin/`；安装包：`artifacts/fs-TB-Obsidian-4.0.2.zip` | Obsidian vault 的 `.obsidian/plugins/fs-TB/` |
| 浏览器扩展 | `KnowFlow` | `4.0.2` | 源码：`extension/`；加载目录：`artifacts/KnowFlow-Browser-4.0.2/` | Chrome/Edge 扩展管理页加载已解压目录 |
| 共享层 | `@sync/shared` | `0.1.0` | `packages/shared/` | 被 Obsidian 插件和浏览器扩展共同引用 |

## 关键边界

- Obsidian 插件负责本地 HTTP 服务、vault 文件读写、`lark-cli` 调用、frontmatter、callout、图片 token 和回写。
- 浏览器扩展负责飞书网页侧入口、content script、background、popup、sidepanel、settings，以及向 Obsidian 插件发请求。
- 共享层改动需要同时验证 Obsidian 插件和浏览器扩展构建。
- 不要提交真实用户的 `data.json`、Cookie、Token、API Key、验证码或 Chrome `_metadata`。
- 更新运行产物前，先确认源码构建结果和真实运行目录，不要只看旧归档。

## 常用路径

```text
/Users/changbeifenggongzuoshi/my/Projects/插件设计/sync-plugin
├── packages/ob-plugin/     # Obsidian 插件源码
├── extension/              # 浏览器扩展源码
├── packages/shared/        # 共享协议和转换逻辑
├── releases/               # 已核验运行产物归档
├── VERSION_INDEX.md        # 最新版本索引
└── docs/                   # 设计文档和交接说明
```

## 验证命令

从仓库根目录执行：

```bash
git diff --check
npm run test:protocol
npm run build
```

组件单独构建：

```bash
npm run build:shared
npm run build:ob
npm run build:ext
```

当前发布校验：

```bash
shasum -a 256 -c artifacts/KnowFlow-4.0.2-SHA256SUMS
(cd artifacts && shasum -a 256 -c KnowFlow-4.0.2-PACKAGES-SHA256SUMS)
```

## 依赖升级策略

- 兼容范围升级可以直接做，但必须跑完整验证。
- 主版本升级需要单独处理，重点看 `@types/chrome`、`@types/node`、`esbuild`、`typescript`、`js-yaml`。
- 如果升级 `js-yaml`，必须重点验证 `packages/shared/src/yaml.ts` 的 frontmatter 解析边界，包括 BOM 开头和正文中空白后 `---` 的场景。
- 如果升级 Vite/React，只处理 `插件 UI 设计/react-vite` 原型，不应混进运行仓库的发布产物。

## 当前已知状态

- 当前 4.0.2 源码、安装包和文档已同步 GitHub `main`。
- 自动验收 130/130、两端类型检查、构建和安装包 SHA256 已通过。
- 真实 Vault、飞书账号和 Chrome/Edge 真机验收尚未执行，不能写成已通过。
- `releases/obsidian-fs-TB/3.2.1/` 与旧浏览器 0.3.0 仅作为历史真机归档。
- 设计文档已集中到 `docs/design/`
- Mermaid 图已集中到 `docs/diagrams/`
- 人类阅读入口：`docs/human-guide.html`
