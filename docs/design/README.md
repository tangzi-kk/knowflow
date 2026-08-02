# KnowFlow 当前设计入口

这里只保留当前有效的设计决策和入口。已实施或被替代的设计稿已移入 `../history/`，不再作为当前开发任务。

## 当前产品决策

- 飞书负责创作，Obsidian 负责整理与本地存储。
- KnowFlow 是唯一正式插件实现，由 Obsidian 插件、浏览器扩展和共享协议组成。
- 采集、整理和编码默认生成 proposal，只在人工确认后执行。
- 4.2 的自动识别把新建/修改事件和全库扫描合并为一个批量 proposal；不按文档逐篇点击，也不静默写入。
- 标签缺失时只根据文档自身内容给出封闭枚举建议，低置信度统一回退 `S` 并在预览中标明。
- 双方同时修改时暂停，不自动选择覆盖方。
- 浏览器和 Obsidian 的成功状态必须对应真实写入终态。
- UI 原型用于试验视觉和交互，不等于正式功能已实现。

## 当前入口

- 产品与安全规格：[`../../SPEC.md`](../../SPEC.md)
- 需求与优先级：[`../../需求池.md`](../../需求池.md)
- 需求编辑器：[`../../需求编辑器.html`](../../需求编辑器.html)
- UI 原型说明：[`../../ui-prototype/README.md`](../../ui-prototype/README.md)
- 当前验收边界：[`../validation/4.1-acceptance.md`](../validation/4.1-acceptance.md)
- 4.2 自动识别与全库整理：[`4.2-自动识别与全库整理.md`](4.2-自动识别与全库整理.md)
- 状态图与回退流程：[`../diagrams/`](../diagrams/)

## 正式实现与原型边界

| 内容 | 路径 | 是否运行代码 |
|---|---|---|
| Chrome / Edge 扩展 | `extension/` | 是 |
| Obsidian 插件 | `packages/ob-plugin/` | 是 |
| 双端共享协议 | `packages/shared/` | 是 |
| UI 原型与样式历史 | `ui-prototype/` | 否 |
| 历史设计和任务书 | `docs/history/` | 否 |

## Obsidian 入口职责

- 文件右键菜单只处理当前选中的文档、目录或多选内容；所有整理动作先生成预览，再由用户确认。
- 左侧 KnowFlow 入口负责待确认任务、当前整理、同步状态和低频维护，不复制设置项。
- 设置页只管理长期配置，按“连接、同步与本地显示、飞书知识库、高级设置”组织。
- 编码是整理流程，不是独立设置；`lark-cli`、端口和旧版 Lark Doc 兼容信息只在高级区域出现。
- 全库自动识别是“发现 + 一次批量确认”，不是后台静默编码；设置只控制是否自动发现。
- 未接入真实运行链路的开关不得展示为可用功能。

## 历史资料

- 飞书 ↔ Obsidian v3 方案、悬浮工具栏调研与重设计：[`../history/design/`](../history/design/)
- KnowFlow 4.0 实施计划：[`../history/plans/`](../history/plans/)
- KnowFlow 4.0 验收记录：[`../history/validation/`](../history/validation/)
- KnowFlow 3.0 目标快照：[`../history/GOAL-3.0.md`](../history/GOAL-3.0.md)
