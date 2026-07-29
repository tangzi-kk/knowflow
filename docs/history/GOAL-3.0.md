# sync-plugin 3.0 升级目标

## 主目标

以 `设计方案/04_新版设计方案_v3.md` 为主方案，`设计方案/Lark_Suite_Sync_Architecture_MVP.md` 为 MVP 架构补充，升级飞书 ↔ Obsidian 同步套件到 3.0 MVP。

最终交付标准：

- Obsidian 端优先对齐并产出到 `/Users/changbeifenggongzuoshi/my/插件设计/Obsidian-fs-TB`。
- 浏览器扩展产物可从 `/Users/changbeifenggongzuoshi/my/插件设计/sync-plugin/extension/dist` 加载。
- 三入口拉取链路成立：飞书页面悬浮按钮、Obsidian 命令、Clipper 占位文件兼容。
- HTTP 辅通道保留：`/status`、`/tree`、`/exists`、`/fetch`、`/pushback` 可用于扩展和本地验证。
- 回写链路保留：当前文件可按 `feishu_id` / `feishu_doc_id` 回写飞书，并维护 `sync_hash` / `sync_time`。
- 共享契约、构建脚本、安装产物之间不漂移。
- 代码优化遵循 Ponytail 原则：优先复用平台能力、标准库和现有模块，避免新增不必要抽象；不牺牲安全、数据保护、错误处理和验证。

## 子目标 A：Obsidian 端 3.0 MVP

Deliverable:

- Obsidian 端能接收 `obsidian://lark-doc?...` 主通道触发。
- 命令面板支持输入飞书链接/Token 后拉取。
- Clipper 占位 Markdown 创建后可被监听并替换为真实飞书同步内容。
- fetch/pushback 统一复用现有 handler。

验收标准:

- 源码中存在协议入口、命令入口、占位文件监听入口。
- 入口最终调用同一条 fetch handler。
- 构建后 `main.js`、`manifest.json`、`styles.css` 可同步到 `Obsidian-fs-TB`。

验证方式:

- `npm run build:ob`
- 静态检查入口注册代码。
- 检查 `Obsidian-fs-TB` 安装目录产物更新时间和 manifest 版本。

## 子目标 B：浏览器扩展 3.0 MVP

Deliverable:

- 飞书文档页主按钮可触发 `obsidian://lark-doc`。
- popup/sidepanel/settings 继续使用 localhost HTTP 作为配置、目录树和兼容操作通道。
- 普通网页剪藏 toolbar 不破坏。

验收标准:

- 飞书页面 content script 使用共享 URI builder。
- background/toolbar 的飞书同步触发也可走主通道或转发到主通道。
- `extension/dist` 由源码构建生成。

验证方式:

- `npm run build:ext`
- 检查 `dist/content.js` / `dist/background.js` 包含协议主通道逻辑。

## 子目标 C：共享契约与构建一致性

Deliverable:

- `@sync/shared` 包含 v3 需要的 protocol/types/callout/hash/yaml/image/filename 工具。
- 新增协议 URI 工具复用在扩展与 Obsidian 端。
- 根构建覆盖 shared、ob-plugin、extension。

验收标准:

- `npm run build:shared`
- `npm run build`
- 没有重复协议字符串散落在多个模块。

验证方式:

- TypeScript 构建通过。
- 搜索关键协议常量和重复实现。

## 子目标 D：整体验证与交付记录

Deliverable:

- `PROGRESS.md` 持续记录进度、代理结论、验证结果和遗留风险。
- 完成后做一次整体 review。
- 必要时更新长期记忆。

验收标准:

- 每个 P0 子目标均有验证证据。
- 未完成项明确记录为 P1/P2，不伪装成完成。
