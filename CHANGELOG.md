# Changelog

All notable changes to KnowFlow · 知流 (飞书 ↔ Obsidian 同步插件) will be documented in this file.

## [4.0.2] - 2026-07-24

### 融合版本纠正
- 恢复 3.2.1 成熟版的六标签设置布局和完整样式，同时继续使用 4.x 的可信同步、安全删除、冲突恢复与活动记录。
- 自动编码改为先预览、写前复核，再通过目录协调锁和恢复副本执行，避免旧版本直接批量改名。
- 发布门禁强制包含 Obsidian `styles.css`，避免再次生成只有简化界面的不完整安装包。
- 浏览器继续包含 4.0.1 的 AI Provider 路由、Gemini Web 模型目录和 DeepSeek Web 消息桥修复。

## [4.0.1] - 2026-07-24

### 浏览器 AI 修复
- 工具栏、侧边栏和设置统一使用同一 Provider 路由，修复选中 API/自定义服务后仍固定调用 Web Provider 的问题。
- 更新 Gemini Web 模型目录并迁移已失效的旧 Hash；保留自定义 OpenAI 兼容服务的模型名。
- DeepSeek Web 改用 MAIN World 捕获与隔离脚本转发，修复扩展消息通道不可用。
- 异步消息统一返回终态，并继续保持 `debugger` 为按需权限。

## [4.0.0] - 2026-07-19

### 可信同步收口
- 汇总 3.2.2–3.5.0 的升级基线、唯一绑定、幂等并发、三方冲突、恢复副本和浏览器真实终态。
- 远端删除改为先预览、再逐项精确确认；默认不删除子节点，待确认记录失败时继续保留。
- 最近活动持久化为最多 50 条元数据，不保存正文、提示词、Token 或原始错误详情；损坏记录不阻塞启动。
- HTTP 服务统一要求鉴权并限制方法、请求大小和读入时间；只读健康请求有处理截止时间，写请求必须等待真实终态。
- lark-cli 只重试瞬态故障，受总截止时间约束；写入使用操作级临时目录并在结束后清理，插件卸载后拒绝新调用。
- 3.6 安全层按用户要求直接折叠进 4.0，不单独发布中间版本。

## [3.5.0] - 2026-07-19

### 浏览器可信事务
- 飞书悬浮按钮、侧栏同步和静默剪藏统一由后台执行；只有 Obsidian 返回最终 `path/action` 后才显示成功。
- 新增有界操作账本，记录 `queued/running/succeeded/failed/cancelled` 终态；后台重启会把未确认操作标成明确失败，不猜测成功。
- 工具栏改用显式状态和请求 ID；旧请求的迟到分块、结束或错误消息不会污染新结果，关闭后也不会被重新打开。
- 移除未使用的 `desktopCapture` 权限；`debugger` 改为浏览器控制动作触发时单独申请。
- 新增浏览器工作流、权限和工具栏状态对抗测试，并纳入根级测试门禁。

## [3.4.0] - 2026-07-19

### 冲突与恢复
- Pull/Pushback 均比较上次共同基线、本地当前内容和飞书当前内容；双方都改且不同时返回冲突，绝不自动选赢家。
- 缺少可靠 `sync_hash` 时失败关闭，不从时间戳或单边内容猜测。
- 覆盖本地或远端前，在 `.feishu-sync/recovery/` 写入可恢复 JSON 副本；创建失败即取消覆盖，最多保留 20 份。
- 远端写入结果不明或远端成功后本地基线更新失败时，返回专用修复状态和恢复副本路径。

## [3.3.0] - 2026-07-19

### 数据安全
- 同一 `feishu_id` 出现多个本地绑定时返回 409，不再随机取第一个。
- Pull/Pushback 共用文档锁，同目录 Pull 叠加目录锁，避免自动编码并发抢号。
- 新增有界请求幂等缓存；20 路相同 `requestId` 只执行一次，失败请求仍可重试。
- 统一验证 Vault 目录、Markdown 路径和图片 token，拒绝绝对路径、遍历、编码分隔符、NUL 和内部目录。
- Clipper 占位替换不得覆盖已绑定其他飞书文档的笔记。

## [3.2.2] - 2026-07-19

### 可升级基线
- 可维护源码恢复 `fs-TB` 身份，保留 3.2.1 设置、默认目录和系统属性隐藏行为。
- 新增幂等设置迁移：保留未知旧字段，损坏自动化值失败关闭，首次启动生成本地令牌。
- 浏览器 Token/API Key 改存 `chrome.storage.local`，使用可验证完整信封防止并发保存混配配置。
- 新增跨端协议版本和能力协商；不兼容组件禁止写操作。
- 建立统一构建、严格类型检查和 59 项自动验收门禁。

## [3.2.1] - 2026-07-02

### Obsidian 插件 (fs-TB)
- 从 Mac mini 已运行版本归档 `fs-TB 3.2.1` 到 `releases/obsidian-fs-TB/3.2.1/`。
- 修复子层显示规则：父级显示 `S07 · 标题`，子级显示相对层级如 `a1 · 标题`，frontmatter `短编码` 保留完整值。
- 增强自动编码和重排稳定性，避免插件重命名期间 create/rename/delete 事件相互抢占。
- 恢复历史临时名和编码表备份；保留差异内容，不擅自覆盖或删除。

### 浏览器插件 (Feishu Doc Exporter)
- 从 Mac mini Chrome 已安装扩展归档 `Feishu Doc Exporter 0.3.0` 到 `releases/browser-feishu-doc-exporter/0.3.0/`。
- 该扩展为飞书文档 Markdown 导出悬浮面板，来源为 Chrome 运行目录，已排除 `_metadata`。

## [3.1.1] - 2026-06-28

### Obsidian 插件 (fs-TB)
- 稳定版发布，优化构建流程
- 完善 lark-cli PATH 增强逻辑
- 修复 GUI 进程启动时的 PATH 缺失问题

### 浏览器扩展 (KnowFlow)
- Sidepanel 界面优化
- Toolbar 剪藏功能增强
- 飞书页面悬浮按钮稳定性提升

---

## [3.1.0] - 2026-06-27

### 新增 ✨
- **obsidian:// 协议主通道**：浏览器扩展→OB 通过系统 URI 协议触发同步，零延迟
- **三入口统一收口**：悬浮按钮 + OB 命令面板 + Clipper 占位文件监听
- **Clipper 兼容**：监听飞书官方 Clipper 占位文件，自动 `feishu_sync_url` → 真实同步
- **飞书 callout → YAML 反向解析**：从飞书头部「文档信息」callout 提取标签/编码/评分/索引等元数据
- **共享协议 URI builder**：`@sync/shared` 中统一 URI 生成/解析，扩展与 OB 共用

### 改进 🔧
- lark-cli JSON envelope 自动解包
- GUI 进程 PATH 增强（nvm/homebrew/~/.local/bin）
- callout 双向转换引擎（颜色/emoji 保留）
- 图片 feishu://FILE_TOKEN 永久引用
- HTTP 辅助通道保留（/status /tree /exists /fetch /pushback）

### 修复 🐛
- overwrite 后标题变 "Untitled" → 追加 str_replace 修复
- emoji U+FE0F variation selector 飞书不认 → 写入前清洗
- 波浪号 `~` 转义问题 → 回读时反转义
- 429 限流 → 指数退避重试（1s→2s→4s）

---

## [3.0.0] - 2026-06-26

### 首次 MVP 发布 🎉

**核心链路**：
- 飞书文档 → 浏览器扩展触发 → OB 插件拉取 → 写入 YAML frontmatter + 正文 → auto-rename 编码分配
- OB 整理 → 命令回写 → hash 比对 → callout + YAML 转 XML → lark-cli overwrite 飞书

**架构特性**：
- Monorepo 结构：`@sync/shared` 共享层 + OB 插件 + 浏览器扩展
- TypeScript 5 + esbuild 构建
- localhost HTTP 通信（鉴权 + CORS）
- 飞书 callout ↔ OB callout 双向转换
- 轻核验 hash（sha256 正文，毫秒级）

---

## 版本号规则

遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能新增
- **修订号**：向下兼容的问题修正

OB 插件版本号在 `packages/ob-plugin/package.json` 和 `manifest.json` 中定义；
浏览器扩展版本号在 `extension/manifest.json` 中定义。
