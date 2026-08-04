# KnowFlow 文档中心

本仓库将“当前规格”与“历史资料”分开。开始工作前先读当前入口，不要从历史设计稿的旧勾选状态推断当前任务。

## 快速入口

| 我要做什么 | 入口 |
|---|---|
| 了解项目和安装 | [`../README.md`](../README.md) |
| 查当前产品与安全边界 | [`../SPEC.md`](../SPEC.md) |
| 提交或查看需求 | [`../需求池.md`](../需求池.md) |
| 用页面写自然语言需求 | [`../需求编辑器.html`](../需求编辑器.html) |
| 查当前进度与发布 | [`../PROGRESS.md`](../PROGRESS.md) / [`../VERSION_INDEX.md`](../VERSION_INDEX.md) |
| 让 AI / Codex 接手 | [`AI_HANDOFF.md`](AI_HANDOFF.md) |
| 查当前设计决策 | [`design/README.md`](design/README.md) |
| 查飞书 ↔ Obsidian 格式映射 | [`design/feishu-obsidian-format.md`](design/feishu-obsidian-format.md) |
| 查 UI 原型 | [`../ui-prototype/README.md`](../ui-prototype/README.md) |
| 查 4.5.5 验收边界 | [`validation/4.5.5-acceptance.md`](validation/4.5.5-acceptance.md) |

## 当前文档

- [`human-guide.html`](human-guide.html)：面向人的非技术说明。
- [`AI_HANDOFF.md`](AI_HANDOFF.md)：组件边界、路径、验证和当前状态。
- [`design/README.md`](design/README.md)：当前有效设计决策和正式实现/原型边界。
- [`design/feishu-obsidian-format.md`](design/feishu-obsidian-format.md)：YAML 完整字段、飞书 Block 全目录与双向降级规则。
- [`validation/4.5.5-acceptance.md`](validation/4.5.5-acceptance.md)：当前稳定版验收记录和 2026-08-04 真机全流程章节。
- [`diagrams/`](diagrams/)：任务依赖、状态和错误回退图。

## 历史资料

`history/` 只用于追溯：

- [`history/design/`](history/design/)：v3 产品方案、悬浮工具栏调研和已实施重设计。
- [`history/plans/`](history/plans/)：4.0 实施计划。
- [`history/validation/`](history/validation/)：4.0 验收记录。
- [`history/GOAL-3.0.md`](history/GOAL-3.0.md)：3.0 目标快照。

## 维护规则

- 当前规格、路径和状态只在当前文档更新。
- 已完成、被替代或仅用于追溯的文档移入 `history/`。
- 需求只在 `需求池.md` 管理，不在多份路线图里重复维护。
- 原型、源码、构建产物和真机验收必须分开表述。
