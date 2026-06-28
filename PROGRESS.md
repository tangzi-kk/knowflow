# sync-plugin 3.0 升级进度

## 当前决策

- 主方案：`/Users/changbeifenggongzuoshi/my/插件设计/设计方案/04_新版设计方案_v3.md`
- MVP 补充：`/Users/changbeifenggongzuoshi/my/插件设计/设计方案/Lark_Suite_Sync_Architecture_MVP.md`
- Obsidian 安装目录：`/Users/changbeifenggongzuoshi/my/插件设计/Obsidian-fs-TB`
- 浏览器扩展产物：`/Users/changbeifenggongzuoshi/my/插件设计/sync-plugin/extension/dist`
- Ponytail 应用方式：少写新框架，复用现有 handler、标准 API 和共享模块；不削弱验证、安全和数据保护。

## 子目标状态

| 子目标 | 状态 | 说明 |
| --- | --- | --- |
| A. Obsidian 端 3.0 MVP | 已完成 | 已补协议入口、命令入口、Clipper 占位监听；安装目录已同步 |
| B. 浏览器扩展 3.0 MVP | 已完成 | 飞书页面按钮和 toolbar 飞书同步按钮已走 obsidian:// 主通道；HTTP 辅通道保留 |
| C. 共享契约与构建一致性 | 已完成 | shared 新增协议 URI builder/parser，并由扩展与 OB 共用 |
| D. 整体验证与交付记录 | 已完成 | 已运行协议测试、完整构建、产物一致性检查 |

## 并行代理

| 代理 | 目标 | 状态 |
| --- | --- | --- |
| Nash | 只读盘点 Obsidian 端 v3.0 MVP 缺口 | 因额度限制失败，主线程接管 |
| Herschel | 只读盘点浏览器扩展端 v3.0 MVP 缺口 | 因额度限制失败，主线程接管 |

## 验证记录

- `npm run test:protocol`：通过。
- `npm run build`：通过，覆盖 shared、OB 插件、浏览器扩展。
- `cmp -s packages/ob-plugin/main.js ../Obsidian-fs-TB/main.js`：返回 `0`，说明 OB 安装目录 main.js 与源码构建产物一致。
- `/Users/changbeifenggongzuoshi/my/插件设计/Obsidian-fs-TB/manifest.json`：版本 `3.0.0`，保留插件 id `fs-TB`。
- `/Users/changbeifenggongzuoshi/my/插件设计/sync-plugin/extension/dist/manifest.json`：版本 `3.0.0`。
- 静态检查确认产物包含：`lark-doc`、`fetch-feishu-doc`、`feishu_sync_url`、`replace_path`、`buildObsidianLarkDocUri`。

## 风险与待确认

- 当前目录不是 Git 仓库，无法用 git diff 追踪改动；本次用文件路径、构建输出和静态搜索记录证据。
- 未做真实飞书云端拉取/回写，因为这需要 Obsidian 运行态、lark-cli 登录态和真实飞书文档 token；代码级构建和产物检查已完成。
