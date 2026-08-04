# KnowFlow 飞书 ↔ Obsidian 正式格式规范

> 版本：4.5.5 / 格式契约 v1 · 2026-08-05
> 本文是当前格式实现的唯一入口。旧版 `02_YAML字段规范.md`、`03_飞书文档格式规范与OB映射.md` 仅作历史追溯，不能覆盖本文。

## 1. 先说结论

KnowFlow 支持飞书新版文档的完整 Block 目录识别，并对能在 Markdown 中表达的内容做双向转换；“支持所有格式”不等于 OpenAPI 对所有 Block 都允许无损创建、读取和编辑。

- **Obsidian YAML** 是本地元数据的唯一事实源，必须保留完整字段集合。
- **飞书正文** 是创作内容；YAML 不原样粘贴到正文，而是渲染成一个可读的 `KnowFlow 元数据` 高亮块。
- **系统绑定字段**（`feishu_id`、`feishu_doc_id`、`sync_hash`、`sync_time`）只在 Obsidian YAML 中维护，不在飞书卡片中展示，避免把内部绑定信息当成用户内容。
- **文档 ID、完整编码、短编码、协议版本**会在飞书卡片的“系统信息”区展示；它们不是正文事实，回读时只作为元数据补充。
- 不可直接映射的块必须保留“可见占位 + 原始资源引用或降级说明”，不能静默丢弃，也不能伪造双向成功。

## 2. 数据边界与稳定身份

### 2.1 权威顺序

1. 用户当前指令；
2. 本文与 `SPEC.md`；
3. `contracts/skr-knowledge-v1.json` 及共享协议；
4. 插件实现与验收证据；
5. `docs/history/` 中的旧设计。

### 2.2 YAML 完整字段

新建、拉取、回写或自动整理触碰文件时，字段集合必须完整。空值也要保留，避免“同一文档在不同阶段字段忽隐忽现”。

| 分组 | 字段 | 类型/规则 | 飞书展示 |
|---|---|---|---|
| 协议 | `协议版本` | 固定为 `1` | 系统信息 |
| 身份 | `文档ID` | UUID；移动、改名、改标签不变 | 系统信息 |
| 飞书绑定 | `feishu_id` | wiki `node_token` | 仅 YAML，不展示 |
| 飞书绑定 | `feishu_doc_id` | docx `obj_token` / `document_id` | 仅 YAML，不展示 |
| 飞书绑定 | `feishu_title` | 飞书原标题 | 标题本身，不重复展示 |
| 同步状态 | `sync_hash` | 正文 SHA-256 | 仅 YAML，不展示 |
| 同步状态 | `sync_time` | ISO 8601 | 仅 YAML，不展示 |
| 分类 | `标签` | `S/X/L/Z/Q/J` | 元数据卡片 |
| 编码 | `编码` | 完整编码 `YY_MMDD_TAG_TOPIC_LEVEL` | 系统信息 |
| 编码 | `短编码` | 派生显示值，如 `X02.a1` | 系统信息 |
| 来源 | `输入` | 输入目录或来源路径 | 元数据卡片 |
| 时间 | `日期` | `YYYY-MM-DD` | 元数据卡片 |
| 时间 | `日期索引` | 字符串数组 | 元数据卡片 |
| 语义 | `关键词` | 字符串数组；兼容旧字符串 | 元数据卡片 |
| 语义 | `概述` | 一段短摘要 | 元数据卡片 |
| 评价 | `评分` / `评分_显示` | `1–5` 与可读显示串 | 元数据卡片 |
| 生命周期 | `状态` | `收集` / `整理中` / `已消化` / `应用中` / `已归档` | 元数据卡片 |
| 索引 | `索引_知识库`、`索引_颜色` | 字符串 | 元数据卡片 |
| 索引 | `索引_操作&反馈`、`索引_块`、`索引_风险` | 字符串数组 | 元数据卡片 |
| 关系 | `关联项目`、`关联文档`、`关联人物` | 字符串数组 | 元数据卡片 |

缺失值使用 `""`、`[]` 或 `收集` 默认值；不得用 `null` 表示“未知”。`feishu_id` 与 `feishu_doc_id` 永远由绑定流程写入，不能从普通正文猜测。

### 2.3 飞书侧元数据卡片

回写使用一个浅蓝色 Callout，结构固定为两段：

```xml
<callout emoji="📋" background-color="light-blue" border-color="blue">
  <p><b>KnowFlow 元数据</b></p>
  <ul>
    <li><b>标签</b>：🎯项目 X</li>
    <li><b>状态</b>：收集</li>
    <li><b>概述</b>：……</li>
    <li><b>关键词</b>：项目 · 需求 · 迭代</li>
    <li><b>评分</b>：🌟🌟🌟·实践</li>
    <li><b>关联项目</b>：KnowFlow</li>
  </ul>
  <p><b>系统信息</b></p>
  <ul>
    <li><b>协议版本</b>：1</li>
    <li><b>文档ID</b>：UUID</li>
    <li><b>编码</b>：26_0805_X_02_a1</li>
    <li><b>短编码</b>：X02.a1</li>
  </ul>
</callout>
```

空值显示为“未设置”，不再把 YAML 原文、内部 token 或 hash 直接铺在飞书正文里。飞书→Obsidian 回读按字段名解析，旧版“文档信息”单段 callout 仍兼容。

## 3. 飞书 Block 全目录与互通策略

下表按飞书官方 `BlockType` 枚举完整列出 1–52 与 `undefined`。能力列是官方 OpenAPI 能力；KnowFlow 列是本项目的落地策略。

状态含义：

- **双向**：飞书↔Markdown 可读写，结构在当前映射内保持。
- **拉取/展示**：可读取或保留视觉占位，但不能承诺回写同一种 Block。
- **资源专用**：必须交给飞书对应 API（多维表格、电子表格、媒体、任务等）。
- **只读/降级**：保留文字、链接、资源 token 或明确占位，禁止静默丢失。

| BlockType | 中文 | 官方创建/读/编辑 | Obsidian 映射与策略 |
|---|---|---|---|
| `page` | 页面根块 | 自动生成 / 读 / — | 文档根，不单独输出 |
| `text` | 文本 | ✓ / ✓ / ✓ | Markdown 段落，**双向** |
| `heading1`–`heading9` | 1–9 级标题 | ✓ / ✓ / ✓ | `#`–`#########`，**双向** |
| `bullet` | 无序列表 | ✓ / ✓ / ✓ | `-` 列表，**双向** |
| `ordered` | 有序列表 | ✓ / ✓ / ✓ | `1.` 列表，保留顺序，**双向** |
| `code` | 代码块 | ✓ / ✓ / ✓ | fenced code，保留语言，**双向** |
| `quote` | 引用 | ✓ / ✓ / ✓ | `>` 引用，**双向** |
| `todo` | 待办事项 | ✓ / ✓ / ✓ | `- [ ]` / `- [x]`，**双向** |
| `bitable` | 多维表格 | ✓ / 需 Base API / 需 Base API | 保留 Base token/链接，**资源专用** |
| `callout` | 高亮块 | ✓ / ✓ / ✓ | Obsidian Callout；元数据使用固定卡片，**双向** |
| `chat_card` | 会话卡片 | ✓ / — / — | 保存可见文字与链接，**只读/降级** |
| `diagram` | 流程图/UML | × / × / × | 保存标题、说明和原始占位，**只读/降级** |
| `divider` | 分割线 | ✓ / — / — | `---`，回写可创建，读取端无正文，**展示/创建** |
| `file` | 文件 | ✓ / — / — | 下载到 `3️⃣附件文件/`，正文用相对链接，**资源专用** |
| `grid` | 分栏 | ✓ / ✓ / ✓ | 转为 Markdown 分组/表格；可回写分栏，**双向（降级布局）** |
| `grid_column` | 分栏列 | — / ✓ / ✓ | 隶属 `grid`，不可独立创建，**容器子块** |
| `iframe` | 内嵌 | ✓ / ✓ / × | 保存 URL 与标题，回写只在原块仍可用时，**拉取/展示** |
| `image` | 图片 | ✓ / — / — | `feishu://token` + 附件缓存，**资源专用** |
| `isv` | 开放平台小组件 | ✓ / — / — | 保存组件类型/链接，**只读/降级** |
| `mindnote` | 思维笔记 | × / — / — | 保存标题与链接，**只读/降级** |
| `sheet` | 电子表格 | ✓ / — / — | 交给 Sheets API，正文保留 token/链接，**资源专用** |
| `table` | 表格 | ✓ / ✓ / ✓ | Markdown 表格；合并单元格需降级说明，**双向** |
| `table_cell` | 表格单元格 | — / ✓ / ✓ | 仅随 `table` 处理，**容器子块** |
| `view` | 视图 | — / ✓ / × | 保留视图类型和关联资源，**只读/降级** |
| `quote_container` | 引用容器 | ✓ / ✓ / ✓ | Markdown 引用组，**双向** |
| `task` | 任务 | × / — / — | 保存任务链接/文本；任务详情走 Task API，**资源专用** |
| `okr` | OKR | ✓ / ✓ / — | 保存 OKR 链接与摘要，**资源专用** |
| `okr_objective` | OKR 目标 | — / ✓ / — | 只读摘要，**只读/降级** |
| `okr_key_result` | OKR 关键结果 | — / ✓ / — | 只读摘要，**只读/降级** |
| `okr_progress` | OKR 进展 | — / ✓ / — | 只读摘要，**只读/降级** |
| `add_ons` | 新版文档小组件 | ✓ / ✓ / — | 保留组件 ID/JSON 摘要，**只读/降级** |
| `jira_issue` | Jira 问题 | — / ✓ / — | 保留 Jira 链接/标题，**只读/降级** |
| `wiki_catalog` | Wiki 子页面列表（旧） | ✓ / — / — | 转为子页面链接列表，**展示/创建** |
| `board` | 画板 | ✓ / ✓ / ✓ | 保留画板链接/导出图，**拉取/展示** |
| `agenda` | 议程 | × / ✓ / — | 展平为标题、项和正文，**拉取/降级** |
| `agenda_item` | 议程项 | — / ✓ / — | 归属 `agenda`，展平为段落，**只读/降级** |
| `agenda_item_title` | 议程项标题 | — / ✓ / × | 标题文本，**只读/降级** |
| `agenda_item_content` | 议程项内容 | — / ✓ / — | 正文文本，**只读/降级** |
| `link_preview` | 链接预览 | ✓ / × / — | 保存原 URL/标题，**只读/降级** |
| `source_synced` | 源同步块 | × / ✓ / — | 保留源文档链接和文本，**只读/降级** |
| `reference_synced` | 引用同步块 | × / ✓ / — | 保留源文档链接和文本，**只读/降级** |
| `sub_page_list` | Wiki 子页面列表（新） | ✓ / — / — | 转为子页面链接列表，**展示/创建** |
| `ai_template` | AI 模板 | × / — / × | 保存名称/说明，**只读/降级** |
| `undefined` | 未定义块 | — / — / — | 生成“未支持 Block”占位和审计日志 |

### 3.1 文本元素与样式

文本块里的粗体、斜体、下划线、删除线、字体色、背景色、超链接、@用户、@文档、日期提醒、内联文件和公式属于 TextElement/Style，不应被误当成独立段落：

- Markdown 可表达的样式使用标准 Markdown；
- @、提醒、内联文件、公式保存显示文本与目标链接/token；
- 无法在 Markdown 中保持的样式必须在正文附近生成降级说明；
- 代码块保留官方语言标识（包括 `YAML`、`TypeScript`、`JSON` 等），不要把代码转成普通段落。

### 3.2 媒体与附件

飞书图片/文件的 token 是资源身份，不是永久 URL。拉取时读取 Block token，图片写为 `feishu://TOKEN`，预览时再下载；Markdown 临时链接既可能来自 `internal-api-drive-stream.*`，也可能来自 `api3-*-drive.*`，两者都必须通过 XML 的 `src` token 归一化。回写后飞书可能重新分配图片 token，插件需回读并更新本地引用；文件落到受保护的 `3️⃣附件文件/`，正文只引用相对路径。任何 authcode URL、Token、请求头和登录凭据都不得写入 YAML、日志或 Git。

## 4. 实现规则

1. 飞书 XML（带 block/媒体信息）优先于纯 Markdown；纯 Markdown 只负责正文可读性。
2. `feishu_id`（wiki 节点）与 `feishu_doc_id`（docx 文档）必须分开保存，不能互换。
3. 回写使用 XML；图片、Callout、表格、分栏等结构不能依赖 Markdown 猜测。
4. 双方同时修改时返回 `SYNC_CONFLICT`，不覆盖任意一方；恢复后再同步。
5. OpenAPI 不支持编辑的 Block 不得假报成功；结果必须记录为“跳过/降级/资源专用”。
6. 自动编码只修改 YAML、短编码文件名和派生索引，不改正文 Block 内容。

## 5. 场景验收矩阵

每次版本验收至少覆盖以下真实场景；不能用单测或接口 fixture 代替真实飞书与真实 Obsidian：

| 场景 | 飞书操作 | Obsidian 预期 | 结果记录 |
|---|---|---|---|
| 文本基础 | 标题、段落、粗斜体、删除线、链接 | Markdown 结构与样式可读 | 4.5.5 样本已通过 |
| 列表/任务 | 无序、有序、未完成/已完成待办 | 列表顺序和勾选状态保持 | 4.5.5 样本已通过 |
| 表格/代码 | 表格、代码块、语言、引用 | 表格/代码/引用可回读 | 4.5.5 样本已通过 |
| Callout/元数据 | 高亮块 + KnowFlow 元数据卡片 | 正文 Callout 与 YAML 字段互补 | 2026-08-05 真实回写通过 |
| 图片/附件 | 合成图片、文件附件 | `feishu://` / `3️⃣附件文件/` 可打开 | 需真实媒体复测 |
| 分栏/嵌入 | Grid、Iframe、链接预览 | 结构或 URL 降级可见 | 按能力矩阵记录 |
| 外部资源 | Bitable、Sheet、Board、OKR、Jira | 保留资源链接/token，不伪造正文 | 资源 API 单独验收 |
| 双向幂等 | 无变化重复拉取/回写 | 明确跳过，不新增文件/绑定 | 4.5.5 全流程记录持续补充 |
| 冲突恢复 | 双端从同一基线分别修改 | `SYNC_CONFLICT`，人工恢复后再同步 | 失败即部分通过 |

## 6. 官方依据

- [飞书块数据结构与完整 BlockType 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block)
- [飞书新版云文档概述与 OpenAPI 能力边界](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/docx-overview)
- [飞书新版文档接入指南](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/guide?lang=zh-CN)
- [获取文档所有 Block](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document/list?lang=zh-CN)
- [飞书媒体资源概述（图片/文件 token）](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN)
- [飞书云文档小组件概述](https://open.feishu.cn/document/client-docs/docs-add-on/docs-add-on-introduction)
