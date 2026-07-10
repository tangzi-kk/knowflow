# Changelog

All notable changes to KnowFlow · 知流 (飞书 ↔ Obsidian 同步插件) will be documented in this file.

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
