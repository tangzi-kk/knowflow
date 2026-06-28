# 飞书 ↔ Obsidian 同步插件 — 完整设计方案

> **版本**: v3 整合版
> **创建**: 2026-06-16
> **最后更新**: 2026-06-18
> **作者**: 石柯然 + ZCode
> **说明**: 本文档整合了 v2 方案、v3 升级、拓展方案、代码实施方案、架构评审

---

# 第一部分：核心方案（v3）

---

## 一、v2 → v3 变更摘要

| 变更项 | v2 方案 | v3 新版 | 依据 |
|--------|---------|---------|------|
| **触发入口** | 单一入口（浏览器扩展 POST） | 三入口统一收口（悬浮按钮 + OB 命令 + Clipper 占位文件） | MVP 实践发现用户体验需求 |
| **通信通道** | localhost HTTP（方案1） | 双通道并行：**obsidian:// 协议**（主）+ **localhost HTTP**（辅） | 协议更丝滑、零延迟；HTTP 作备选 |
| **OB 插件架构** | 单一 Plugin 类 | `FeishuSyncModule`（模块化），可被 wrapper plugin 组合 | 支持多插件套件化 |
| **Clipper 兼容** | 未涉及 | 监听官方 Clipper 产生的占位文件，自动提取 `feishu_sync_url` → 真实同步 | 用户已有 Clipper 使用习惯 |
| **飞书 callout → YAML** | 仅文档正文 callout 转 OB callout | 新增从飞书头部"文档信息" callout **反向解析出 YAML 字段**（标签/编码/评分/索引等） | 实现元数据双向绑定 |
| **lark-cli envelope** | 直接使用 stdout | 自动解包 lark-cli JSON envelope（`{ok, data:{document:{content}}}`） | 新版 lark-cli 默认 JSON 包装 |
| **GUI 进程 PATH** | 未涉及 | 注入增强 PATH（nvm/latest/bin + homebrew + ~/.local/bin） | Obsidian 桌面端 PATH 缺失问题 |
| **findByFeishuId** | 未明确 | 全 vault 扫描 frontmatter 匹配 `feishu_id`，支持更新分支 | 已有文档重新同步场景 |

---

## 二、核心理念

> "OB 的排版我很喜欢，我更喜欢使用飞书文档创建新的文档内容，而 OB 负责同步和存储。"

- **飞书 = 创作器**（用它的排版：高亮块、表格、多端编辑）
- **OB = 整理器 + 存储基准**（双链、标签、YAML 在此维护，最终以 OB 为准）
- **NotebookLM / OpenClaw** = 外围消费者（本方案不直接处理，留接口）

这不是"单向推送"，而是**飞书创作 → 落地 OB → 整理后回写飞书**的闭环。

---

## 三、系统架构（v3）

### 3.1 三入口统一收口

```
┌─────────────────────────────────────────────────────────┐
│                    触发层（3 入口）                       │
│                                                         │
│  入口A: 浮动按钮               入口B: OB 命令             │
│  ┌──────────────────┐         ┌──────────────────────┐ │
│  │ content.js 注入   │         │ Cmd+P "拉取飞书文档"    │ │
│  │ "⬇ 同步到 OB"    │         │ → 输入框填 URL/Token  │ │
│  │ → obsidian://协议  │         │ → 目录选择器          │ │
│  └────────┬─────────┘         └──────────┬───────────┘ │
│           │                               │             │
│           └───────────┬───────────────────┘             │
│                       ▼                                 │
│  入口C: Clipper 兼容                                      │
│  ┌──────────────────────────────────────────────────────┐│
│  │ 官方 Clipper 剪藏 → vault.on("create") 监听         ││
│  │ → 探测 feishu_sync_url → 提取 token → fetchHandler  ││
│  └──────────────────────┬───────────────────────────────┘│
│                         ▼                                │
│              ┌──────────────────┐                         │
│              │  fetchHandler    │ ← 统一收口              │
│              │  (标准化下载+转换) │                        │
│              └────────┬─────────┘                         │
│                       │                                   │
└───────────────────────┼───────────────────────────────────┘
                        │
┌───────────────────────┼───────────────────────────────────┐
│              OB 插件核心层 (FeishuSyncModule)              │
│                       │                                   │
│  ┌────────────────────▼─────────────────────┐            │
│  │            HTTP Server (localhost:4567)    │            │
│  │  GET /status  GET /tree                   │            │
│  │  POST /fetch  POST /exists  POST /pushback│            │
│  └───────────────────────────────────────────┘            │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ callout  │ │ image    │ │ auto-    │ │ delete       │ │
│  │ 转换引擎  │ │ token    │ │ rename   │ │ registry     │ │
│  │ (双向)    │ │ 预览     │ │ 编码      │ │ (多维表格)   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────────┐│
│  │                lark-cli 封装层                       ││
│  │  · 增强 PATH（GUI 进程兼容）                          ││
│  │  · envelope 自动解包                                  ││
│  │  · emoji VS 清洗 + ~ 转义                            ││
│  │  · 相对路径 @file 处理                                ││
│  │  · 429 限流指数退避重试                               ││
│  └──────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                        │
┌───────────────────────┼───────────────────────────────────┐
│              共享层 (@sync/shared)                        │
│  types.ts  │  protocol.ts  │  callout.ts  │  hash.ts    │
│  filename.ts │  image.ts  │  yaml.ts                        │
└─────────────────────────────────────────────────────────┘
```

### 3.2 套件化架构（Lark Suite Sync wrapper）

```
LarkSuiteSyncPlugin（wrapper，单入口注册）
  ├── lark-doc（官方 Clipper 插件，魔改版）
  │     └── 通过 require() 动态加载，拦截其协议处理
  ├── auto-rename（编码分配插件）
  │     └── 通过 require() 动态加载
  └── feishu-sync（核心同步模块，本项目主体）
        └── FeishuSyncModule 类，独立可测试
```

### 3.3 双通道通信

| 通道 | 用途 | 优势 | 场景 |
|------|------|------|------|
| `obsidian://` URI 协议 | 浏览器→OB 触发拉取 | 零延迟、无需端口、系统原生 | 主通道（悬浮按钮） |
| `localhost:4567` HTTP | 扩展↔OB 数据传输 + 状态查询 | 支持目录树查询、exists 检查、健康探测 | 辅助通道（Clipper/弹窗配置） |

---

## 四、核心数据流

### 4.1 Pull 流程（飞书→OB）—— fetchHandler

```
用户触发（任一入口）
  │
  ├─ 1. fetchHandler 接收 {node_token, space_id, dir}
  │
  ├─ 2. lark-cli docs +fetch --doc-format markdown → 正文 md
  │     └─ 失败时尝试 wiki +node-get 解析 obj_token 再 fetch
  │     └─ ★ 自动解包 lark-cli JSON envelope
  │
  ├─ 3. lark-cli docs +fetch --doc-format xml --detail with-ids
  │     └─ ★ 获取图片 file_token + callout 颜色
  │     └─ ★ 从 XML <title id="..."> 提取 docx obj_token
  │
  ├─ 4. ★ 从飞书头部 callout 解析元数据（标签/编码/输入/日期/关键词/评分/索引）
  │     └─ calloutXmlToMeta(xml) → {标签: "S", 编码: "25_1221_S_09_a1", ...}
  │
  ├─ 5. 图片 authcode URL → feishu://TOKEN（永久不过期）
  │
  ├─ 6. 飞书正文 callout XML → OB callout（> [!info] / > [!warning] 等）
  │
  ├─ 7. exists 检查：findByFeishuId 扫描 vault
  │     ├─ 已有 → 更新分支（保留用户改的元数据，只刷正文+绑定字段）
  │     └─ 无 → 新建分支
  │
  ├─ 8. 组装 YAML frontmatter + 正文 → 写入 vault
  │     └─ 同名冲突 → 加 node_token 前 6 位后缀
  │
  ├─ 9. ★ auto-rename 编码分配（可配置开关）
  │
  └─ 10. 返回落地路径 + 编码 + 动作（created/updated）
```

### 4.2 Push 流程（OB→飞书）—— pushbackHandler

```
用户在 OB 编辑后，命令"回写当前文件到飞书"
  │
  ├─ 1. 读 .md → 解析 frontmatter → 拿 feishu_doc_id
  │     └─ ★ feishu_doc_id 缺失时自动调 wiki +node-get 解析
  │
  ├─ 2. hash 比对（sha256 正文 → sync_hash）
  │     └─ 一致 → 跳过
  │
  ├─ 3. 组装 XML 内容：
  │     ├─ YAML 元数据 → ★ 合并信息块 callout XML
  │     ├─ 图片 feishu://TOKEN → <img src="TOKEN"/>
  │     └─ OB callout → 飞书 callout XML
  │
  ├─ 4. lark-cli docs +update overwrite --doc-format xml
  │     └─ ★ 标题修复：追加 str_replace 修 <title>
  │     └─ ★ emoji VS 清洗 + ~ 反转义
  │
  └─ 5. 更新 sync_hash + sync_time
```

---

## 五、共享层设计（@sync/shared）

### 5.1 类型系统（types.ts）

```typescript
// 同步绑定（核心，不可手改）
interface SyncBinding {
  feishu_id: string;       // wiki node_token
  feishu_doc_id: string;   // docx obj_token
  feishu_title: string;    // 原始标题（含 emoji）
  sync_hash?: string;      // sha256 hex
  sync_time?: string;      // ISO8601
}

// 标签枚举
type Tag = 'S' | 'X' | 'L' | 'Z' | 'Q' | 'J';

// 知识库元数据（OB 维护）
interface KnowledgeMeta {
  标签?: Tag;
  编码?: string;
  输入?: string;
  日期?: string;
  日期索引?: string[];
  关键词?: string;
  评分?: number;
  评分_显示?: string;
  索引_知识库?: string;
  索引_颜色?: string;
  '索引_操作&反馈'?: string;
  索引_块?: string[];
  索引_风险?: string[];
}

// 完整 frontmatter
interface YAMLFrontmatter extends SyncBinding, KnowledgeMeta {}
```

### 5.2 协议定义（protocol.ts）

```typescript
const DEFAULT_PORT = 4567;
const TOKEN_HEADER = 'X-Sync-Token';

interface FetchRequest {
  node_token: string;
  space_id?: string;
  obj_token?: string;
  dir?: string;
  filename?: string;
}

interface FetchResponse {
  ok: true;
  path: string;
  filename: string;
  action: 'created' | 'updated';
  编码?: string;
  feishu_title: string;
}

interface PushbackRequest {
  path?: string;
  node_token?: string;
  force?: boolean;
}
```

### 5.3 工具函数清单

| 模块 | 函数 | 用途 |
|------|------|------|
| `hash.ts` | `bodyHash()` / `isChanged()` | 正文 sha256，轻核验 |
| `filename.ts` | `sanitizeFilename()` / `makePath()` | 安全文件名 |
| `image.ts` | `extractImgTokensFromXml()` / `feishuProtoToXml()` | 图片 token 转换 |
| `yaml.ts` | `serializeFrontmatter()` / `parseFrontmatter()` | YAML 序列化/解析 |
| `callout.ts` | `convertFeishuCalloutsToOB()` / `convertOBCalloutsToFeishu()` / `calloutXmlToMeta()` / `metaToCalloutXml()` | callout 双向转换 + 元数据提取 |

---

## 六、lark-cli 封装层（核心增强）

### 6.1 GUI 进程 PATH 问题

Obsidian 桌面端由 macOS LaunchServices 启动，**拿不到终端 PATH**。

**解决**：`buildEnhancedPath()` 构造增强 PATH：
```
~/.nvm/versions/node/<最新版>/bin
~/.local/bin
/opt/homebrew/bin
/usr/local/bin
```

### 6.2 lark-cli envelope 自动解包

新版 lark-cli 的 `docs +fetch` 默认返回 JSON 包装。`unwrapLarkEnvelope()` 自动检测并解包。

### 6.3 重试策略

遇到 `429`/`ETIMEDOUT`/`ECONNRESET`/`socket hang up` 时：
- 指数退避重试（1s → 2s → 4s，上限 10s）
- 默认 3 次重试
- 用 `Atomics.wait` 同步阻塞

### 6.4 命令清单

| 命令 | 用途 | 场景 |
|------|------|------|
| `docs +fetch --doc <token> --doc-format markdown` | 飞书→md 正文 | fetchHandler |
| `docs +fetch --doc <token> --doc-format xml --detail with-ids` | 飞书→XML（token/颜色） | fetchHandler |
| `docs +update --doc <token> --command overwrite --doc-format xml` | OB→飞书覆写 | pushbackHandler |
| `docs +update --doc <token> --command str_replace` | 标题修复 | pushbackHandler |
| `docs +media-download --token <file_token>` | 下载图片预览 | imageRender |
| `wiki +node-get --node-token <t> --space-id <id>` | node→obj_token 解析 | fetchHandler/pushbackHandler |
| `wiki +node-list --space-id <id> --parent-node-token <t>` | 子节点列表 | treeHandler/mapping |
| `wiki +node-create` | 新建节点 | 未来批量同步 |
| `wiki +node-delete --include-children` | 删除节点 | deleteRegistry |

---

## 七、飞书 callout ↔ YAML 双向绑定

### 7.1 飞书头部信息块格式

```xml
<callout emoji="📋" background-color="light-blue" border-color="blue">
<p><b>文档信息</b></p>
<ul>
<li><b>标签</b>：📥 S 收集</li>
<li><b>编码</b>：25_1221_S_09_a1</li>
<li><b>输入</b>：#0️⃣输入/💡碎片输入（闪念）/...</li>
<li><b>日期</b>：2025-12-21</li>
<li><b>关键词</b>：眼镜、验光、镜片</li>
<li><b>评分</b>：🌟🌟🌟｜实践</li>
<li><b>索引</b>：💰正财 · 🔵工作 · ✅完成 · 🎯具象 · ✅简单 · ❤️健康</li>
</ul>
</callout>
```

### 7.2 Pull 时：callout → YAML

`calloutXmlToMeta(xml)` 解析飞书头部 callout，提取元数据写入 YAML frontmatter。

### 7.3 Push 时：YAML → callout

`metaToCalloutXml(frontmatter)` 将 YAML 字段转回合并 callout XML，插入飞书文档头部。

---

## 八、Clipper 兼容

OB 插件监听 `vault.on("create")` 事件，自动探测 Clipper 占位文件中的 `feishu_sync_url`，提取 token 后调用 fetchHandler 用真实数据覆盖。

---

## 九、数据模型

### 9.1 YAML frontmatter 模板

```yaml
---
# ═══════════ 同步绑定（插件自动写，勿手改）═══════════
feishu_id: FauBwiFA7ipdMdkiCK7c4d1YnYb
feishu_doc_id: R3PLdIWglokwnqxdMlLcaXIgnnh
feishu_title: "🎯 眼镜的选择全攻略"
sync_hash: a3f5e8c2...
sync_time: 2026-06-15T10:30:00+08:00

# ═══════════ 标签（封闭枚举）═══════════
标签: S

# ═══════════ 编码（auto-rename 分配）═══════════
编码: 25_1221_S_09_a1

# ═══════════ 输入（完整路径）═══════════
输入: "#0️⃣输入/💡碎片输入（闪念）/📝闪记_信息源/🎥媒体输入/📱平台/🎬B站"

# ═══════════ 日期（ISO格式）═══════════
日期: 2025-12-21

# ═══════════ 关键词（3-7个，顿号分隔）═══════════
关键词: 眼镜、验光、镜片选择

# ═══════════ 评分（1-5星）═══════════
评分: 3
评分_显示: "🌟🌟🌟｜实践"

# ═══════════ 索引（5类）═══════════
索引_知识库: 正财
索引_颜色: 蓝色工作
索引_操作&反馈: 完成
索引_块: [具象, 简单]
索引_风险: [行为]
---
```

### 9.2 字段权限矩阵

| 字段 | 浏览器插件 | auto-rename | AI Agent | 人工 |
|------|:---:|:---:|:---:|:---:|
| 同步绑定(4) | ✅自动 | | | ❌勿改 |
| 标签 | ★飞书 callout | | 推荐(置信度<0.6→S) | ✅最高 |
| 编码 | | ✅自动 | | |
| 输入 | | | | |
| 日期 | ✅自动 | | | ✅可覆盖 |
| 关键词 | ★飞书 callout | | 推荐 | ✅确认 |
| 评分 | ★飞书 callout | | 推荐(不覆盖人工) | ✅最高 |
| 索引(6维) | ★飞书 callout | | 推荐 | ✅可改 |

---

## 十、已知坑处理

| # | 坑 | 原因 | 处理 |
|---|------|------|------|
| 1 | overwrite 后标题变 "Untitled" | overwrite 清空整个文档含 title block | overwrite 后追加 str_replace 修 `<title>` |
| 2 | emoji 带 U+FE0F 飞书不认 | variation selector 飞书不显示 | 写入前 stripVariationSelectors() |
| 3 | 波浪号 `\~` 转义 | 飞书 md 把 `~` 转义 | 回读时 unescapeFeishuTilde() |
| 4 | callout 颜色 md 导出丢失 | markdown 不保留 block 属性 | 导出时同时抓 XML |
| 5 | 图片链接 OB 里裂 | authcode 1h 过期 | 存 feishu://FILE_TOKEN，预览时下载 |
| 6 | `--content @file` 要相对路径 | 绝对路径被 lark-cli 拒绝 | execOpts.cwd + @./basename |
| 7 | node-list 输出含日志前缀 | "Found X node(s)" 前缀 | JSON 模式跳到第一个 `{` |
| 8 | 旧版 doc API 不支持 | code 3380002 | 提示"需手动迁移为 docx" |
| 9 | 删除事件读不到内容 | vault.on('delete') 回调文件已不可读 | modify 时缓存 feishu_id 映射 |
| 10 | CORS 拦截 | 扩展从飞书页面 fetch localhost | 响应头 Access-Control-Allow-Origin: * |
| 11 | GUI 进程 PATH 缺失 | Obsidian LaunchServices 启动无终端 PATH | buildEnhancedPath() 注入增强 PATH |
| 12 | lark-cli envelope 包装 | 新版 lark-cli 返回 JSON 包装 | unwrapLarkEnvelope() 自动解包 |
| 13 | 429 限流 | 飞书 API 限速 | 指数退避重试（1s→2s→4s） |

---

## 十一、关键技术决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 通信主通道 | obsidian:// 协议 | 零延迟、无需端口、系统原生 |
| OB 插件架构 | FeishuSyncModule（DI） | 可被 wrapper 组合，支持套件化 |
| 封装类型 | syncHash 轻核验 | 毫秒级、无需版本数据库 |
| 回写格式 | XML（非 Markdown） | 需要精确控制 callout 颜色/emoji |
| YAML→callout | 合并信息块（单 callout） | 用户确认偏好 |
| feishu_id 存储 | frontmatter（非文件名/文件夹名） | 文件改名/移动不影响绑定 |
| lark-cli 调用 | execFileSync（同步） | OB 插件上下文不适合 async spawn |

---

## 十二、实现路线图

### Phase 0：流程验证 ✅ 已完成
- [x] 新知识库建测试文档
- [x] 跑通：飞书创建→导 md→模拟 OB 整理→回写飞书
- [x] callout 元数据双向绑定验证
- [x] Clipper 兼容验证

### Phase 1：MVP ✅ 已完成
- [x] OB 插件骨架
- [x] 浏览器扩展骨架
- [x] localhost HTTP 通信通道
- [x] YAML ↔ callout 双向转换
- [x] obsidian:// 协议拦截（三入口）
- [x] Clipper 占位文件监听
- [x] lark-cli envelope 解包
- [x] GUI 进程 PATH 增强
- [x] 轻核验（hash）

### Phase 2：完善 🔧 进行中
- [ ] 图片 feishu:// 预览渲染
- [ ] 删除登记多维表格
- [ ] auto-rename 集成
- [ ] 目录映射自动推导
- [ ] 批量回写当前目录
- [ ] 最近同步记录

### Phase 3：增强 📋 规划中
- [ ] 批量同步
- [ ] 冲突提示 UI
- [ ] 细粒度差异同步
- [ ] 后台定时拉取
- [ ] 多端（手机端 Hermes 对接）

---

# 第二部分：拓展方案（Phase 2.5+）

---

## 一、现状诊断 — 五大设计瓶颈

| # | 瓶颈 | 表现 | 影响 |
|---|------|------|------|
| 1 | **单文档思维** | 所有 UI 都是"打开一个文档→同步一个文档" | 无法从知识库维度俯瞰全局 |
| 2 | **工具感太强** | 每次同步都需要手动填表 | 使用成本高，低频文档被遗忘 |
| 3 | **被动同步** | 只在用户手动触发时工作 | 知识库同步率低（42/537=7.8%） |
| 4 | **单向元数据** | AI 只做建议，不从用户行为中学习 | AI 永远是"新手上路" |
| 5 | **孤岛体验** | 飞书端和 OB 端各自为战 | 用户需要在两个工具间反复切换 |

---

## 二、六大拓展方向

| 方向 | 代号 | 核心升级 | 难度 | 价值 | 建议阶段 |
|------|------|---------|------|------|---------|
| 同步仪表盘 | A | 操作工具 → 管理中枢 | 低 | 高 | Phase 2.5 |
| 智能管道 | B | 手动同步 → 自动流转 | 中 | 高 | Phase 3 |
| 知识图谱 | C | 文件同步 → 知识关联 | 高 | 极高 | Phase 4 |
| 模板工厂 | D | 固定字段 → 可编程模板 | 低 | 中 | Phase 2.5 |
| 版本时空 | E | 覆盖式 → 可追溯 | 中 | 中 | Phase 3 |
| 跨端共生 | F | 单向推送 → 双端原生 | 极高 | 长期 | Phase 5 |

---

## 三、A. 同步仪表盘

### 3.1 Sidepanel 三 Tab 改造

```
┌─ Sidepanel ──────────────────────────┐
│ [同步] [仪表盘] [收件箱]              │
│                                      │
│  Tab 1: 同步 (现有功能，保留)         │
│  Tab 2: 仪表盘 (新增)                │
│  Tab 3: 收件箱 (新增)                │
└──────────────────────────────────────┘
```

### 3.2 仪表盘 Tab

**顶部统计卡片**:
```
┌──────────────┬──────────────┬──────────────┐
│ 已同步        │ 待同步        │ 冲突          │
│ 42 / 537     │ 495          │ 3            │
│ 7.8%         │ 📥 收件箱     │ ⚠️ 需确认    │
└──────────────┴──────────────┴──────────────┘
```

**活动流**: 每次同步/回写/冲突记录，时间 + 文档名 + 动作类型 + 状态

### 3.3 收件箱 Tab

**核心概念**: 飞书新建的文档自动出现在收件箱，用户可以批量处理。

**数据结构**:
```typescript
interface InboxItem {
  node_token: string;
  title: string;
  space_id: string;
  parent_title?: string;
  discovered_at: string;
  ai_suggestion?: Partial<KnowledgeMeta>;
  status: 'pending' | 'suggested' | 'syncing' | 'done';
}
```

### 3.4 健康度指标

| 指标 | 计算方式 | 告警阈值 |
|------|---------|---------|
| 同步覆盖率 | 已同步数 / 飞书节点总数 | < 30% |
| 过期率 | sync_time > 7天的文档数 / 已同步数 | > 50% |
| 冲突数 | hash 不一致且双方都改了的文档数 | > 0 |
| 裂链率 | 含 feishu:// 但无法下载的图片数 | > 0 |
| 回写率 | 有 pushback 记录的 / 已同步总数 | < 20% |

---

## 四、B. 智能管道

### 4.1 规则引擎

```typescript
interface PipelineRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: {
    event: 'feishu_new' | 'feishu_update' | 'ob_edit' | 'schedule';
    schedule?: string;
  };
  condition: {
    urlPattern?: string;
    titlePattern?: string;
    spaceId?: string;
    tagSuggestion?: Tag;
    confidenceMin?: number;
  };
  action: {
    autoSync: boolean;
    autoTag?: Tag;
    autoDir?: string;
    autoPushback?: boolean;
    conflictStrategy?: 'ob-wins' | 'feishu-wins' | 'pause' | 'ai-merge';
  };
}
```

### 4.2 内置规则预设

| 规则名 | 触发 | 条件 | 动作 |
|--------|------|------|------|
| 高分自动同步 | 飞书新建 | AI 置信度 > 0.8 且评分建议 >= 4 | 自动同步 + 自动回写 |
| 低分仅收集 | 飞书新建 | AI 置信度 > 0.8 且评分建议 <= 2 | 自动同步 + 不回写 |
| 不确定需确认 | 飞书新建 | AI 置信度 < 0.6 | 入收件箱，等人工确认 |
| OB 编辑回写 | OB 编辑 | hash 变更 + 无冲突 | 自动回写飞书 |

---

## 五、C. 知识图谱

### 5.1 三层架构

**L1. 标签网络**（Phase 4.1）: 利用 6 种标签构建反向索引，OB Dataview 查询

**L2. 语义关联**（Phase 4.2）: AI 提取关键词 → 向量化 → 语义相似文档推荐

```yaml
related:
  - 验光注意事项
  - 镜片对比表
```

**L3. 结构映射**（Phase 4.3）: 飞书知识库树 ↔ OB 目录树双向结构同步

---

## 六、D. 模板工厂

### 6.1 条件模板

```typescript
interface ConditionalTemplate {
  id: string;
  name: string;
  priority: number;
  match: {
    urlPattern?: string;
    titlePattern?: string;
    spaceId?: string;
    dirPattern?: string;
  };
  template: Record<string, string>;
}
```

### 6.2 模板继承链

```
全局默认模板
  └── 目录绑定模板 (覆盖全局默认)
        └── 条件模板 (覆盖目录默认)
              └── AI 建议 (作为预填值，最低优先级)
```

---

## 七、E. 版本时空

### 7.1 版本快照

```typescript
interface SyncVersion {
  feishu_id: string;
  version: number;
  timestamp: string;
  action: 'pull' | 'pushback';
  hash: string;
  yaml_snapshot: Record<string, any>;
  body_preview: string;
}
```

### 7.2 冲突策略可配置

| 策略 | 行为 | 适用场景 |
|------|------|---------|
| `ob-wins` | OB 永远覆盖飞书（当前默认） | OB 为主工作区 |
| `feishu-wins` | 飞书覆盖 OB | 飞书为主工作区 |
| `pause` | 冲突时暂停，等人工确认 | 安全优先 |
| `yaml-smart` | YAML 字段取较新值，正文取 OB | 折中方案 |

---

## 八、F. 跨端共生（长期愿景）

- 双向搜索：OB 搜索同时返回飞书未同步文档
- 飞书机器人：在飞书对话中触发同步
- OB 实时预览：嵌入飞书文档实时只读预览
- 多 Vault 支持：不同飞书知识库 → 不同 OB Vault

---

## 九、技术影响评估

### 9.1 协议扩展

| 端点 | 方法 | 用途 | 方向 |
|------|------|------|------|
| `/inbox` | GET | 获取收件箱（未同步节点列表） | A |
| `/activity` | GET | 获取最近同步活动 | A |
| `/health` | GET | 获取同步健康度指标 | A |
| `/rules` | GET/POST | 管道规则 CRUD | B |
| `/versions/:id` | GET | 获取版本历史 | E |
| `/rollback` | POST | 回滚到指定版本 | E |
| `/related/:id` | GET | 获取关联文档列表 | C |

### 9.2 数据模型扩展

```typescript
interface KnowledgeMetaV2 extends KnowledgeMeta {
  related?: string[];
  template_id?: string;
  last_conflict?: string;
  pipeline_rule?: string;
}
```

---

# 第三部分：代码实施方案（Phase 2.5）

---

## 一、文件变更总览

### Phase 2.5 新增文件

| 文件路径 | 说明 |
|---------|------|
| `packages/shared/src/dashboard.ts` | 仪表盘协议类型 |
| `packages/ob-plugin/src/handlers/inboxHandler.ts` | GET /inbox 收件箱端点 |
| `packages/ob-plugin/src/handlers/activityHandler.ts` | GET /activity 活动流端点 |
| `packages/ob-plugin/src/handlers/healthHandler.ts` | GET /health 健康度端点 |
| `packages/ob-plugin/src/templateEngine.ts` | 条件模板引擎 |
| `extension/src/sidepanel/tabs/syncTab.ts` | 同步 Tab |
| `extension/src/sidepanel/tabs/dashboardTab.ts` | 仪表盘 Tab |
| `extension/src/sidepanel/tabs/inboxTab.ts` | 收件箱 Tab |

### Phase 2.5 修改文件

| 文件路径 | 变更要点 |
|---------|---------|
| `packages/shared/src/types.ts` | 新增 related, template_id, pipeline_rule 字段 |
| `packages/shared/src/protocol.ts` | 新增 Inbox/Activity/Health 类型 + ENDPOINTS 条目 |
| `packages/ob-plugin/src/main.ts` | 注册 3 个新 handler |
| `packages/ob-plugin/src/settings.ts` | 新增 dirTemplates, conditionalTemplates 设置项 |
| `packages/ob-plugin/src/handlers/fetchHandler.ts` | 集成模板引擎 |
| `extension/src/client.ts` | 新增 3 个 API 调用函数 |
| `extension/sidepanel.html` | 重构为 Tab 布局 |
| `extension/sidepanel.css` | 新增 Tab 导航 + 仪表盘 + 收件箱样式 |
| `extension/src/sidepanel/sidepanel.ts` | 重构为 Tab 路由 |

---

## 二、共享层变更

### 2.1 types.ts — 新增字段

```typescript
export interface KnowledgeMeta {
  // ... 现有字段 ...
  related?: string[];
  template_id?: string;
  pipeline_rule?: string;
}

export interface InboxItem {
  node_token: string;
  title: string;
  space_id: string;
  parent_title?: string;
  discovered_at: string;
  ai_suggestion?: Partial<KnowledgeMeta>;
  status: 'pending' | 'suggested' | 'syncing' | 'done';
}

export interface ActivityEntry {
  time: string;
  node_token: string;
  title: string;
  action: 'created' | 'updated' | 'pushed' | 'error';
  path?: string;
  error?: string;
}

export interface HealthMetrics {
  syncedCount: number;
  totalFeishuNodes: number;
  syncRate: number;
  staleCount: number;
  staleRate: number;
  conflictCount: number;
  brokenImageCount: number;
  pushbackRate: number;
}
```

### 2.2 新增 dashboard.ts

```typescript
export interface ConditionalTemplate {
  id: string;
  name: string;
  priority: number;
  enabled: boolean;
  match: {
    urlPattern?: string;
    titlePattern?: string;
    spaceId?: string;
    dirPattern?: string;
  };
  template: Partial<Record<string, string>>;
}

export interface DirTemplate {
  dir: string;
  defaults: Partial<Record<string, string>>;
}

export interface TemplateMatchResult {
  templateId: string;
  templateName: string;
  merged: Partial<Record<string, string>>;
  matchedRule: string;
}
```

---

## 三、OB 插件变更

### 3.1 main.ts — 注册新 handler

```typescript
routes.set('/inbox', createInboxHandler({ app: this.app, settings, state }));
routes.set('/activity', createActivityHandler({ state }));
routes.set('/health', createHealthHandler({ app: this.app, settings, state }));
```

### 3.2 settings.ts — 新增设置项

```typescript
export interface FeishuSyncSettings {
  // ... 现有字段 ...
  dirTemplates: DirTemplate[];
  conditionalTemplates: ConditionalTemplate[];
  inboxScanEnabled: boolean;
  inboxScanInterval: number;
}
```

### 3.3 新增 templateEngine.ts

条件模板引擎：全局默认 → 目录绑定 → 条件模板 → AI 建议

### 3.4 新增 handlers

- `inboxHandler.ts` — 扫描飞书知识库中未同步的节点
- `activityHandler.ts` — 返回最近同步活动
- `healthHandler.ts` — 同步健康度指标

---

## 四、浏览器扩展变更

### 4.1 client.ts — 新增 API

```typescript
export async function getInbox(config, spaceId?): Promise<InboxResponse> { ... }
export async function getActivity(config, limit = 20): Promise<ActivityResponse> { ... }
export async function getHealth(config): Promise<HealthResponse> { ... }
```

### 4.2 sidepanel.html — Tab 布局

```html
<nav class="tabs">
  <button class="tab active" data-tab="sync">同步</button>
  <button class="tab" data-tab="dashboard">仪表盘</button>
  <button class="tab" data-tab="inbox">收件箱 <span id="inbox-badge" class="badge hidden">0</span></button>
</nav>
```

---

## 五、实现任务列表

```
Task 1: 共享层类型扩展（无依赖）
Task 2: OB 插件 - 模板引擎（依赖 Task 1）
Task 3: OB 插件 - settings 扩展（依赖 Task 1）
Task 4: OB 插件 - 新 handler（依赖 Task 1, 3）
Task 5: OB 插件 - main.ts 路由注册（依赖 Task 4）
Task 6: OB 插件 - fetchHandler 集成模板引擎（依赖 Task 2, 3）
Task 7: 扩展 - client.ts 新增 API（依赖 Task 1）
Task 8: 扩展 - sidepanel.html + CSS 重构（无依赖）
Task 9: 扩展 - sidepanel.ts Tab 路由（依赖 Task 7, 8）
Task 10: 集成测试（依赖 Task 5, 9）
```

**可并行**: Task 2 + Task 3 + Task 7 + Task 8

---

# 第四部分：架构评审（v2.1.0）

---

## 一、系统组成

| 模块 | 版本 | 运行环境 | 核心职责 |
|------|------|----------|----------|
| **OB 插件 (fs-TB)** | v2.1.0 | Obsidian Desktop | HTTP Server + lark-cli + 文件读写 |
| **Chrome 扩展** | v1.5.0 | Chrome/Edge | 飞书页面交互 + 同步触发 + AI 建议 |

---

## 二、核心数据流

### 2.1 飞书→OB 同步

```
Chrome 扩展 → POST /exists → GET /tree → 用户确认 → POST /fetch
  → lark-cli fetch (md + xml) → 图片转换 → callout 转换 → exists 检查 → 写入 vault
```

### 2.2 OB→飞书回写

```
OB 插件 → 读 .md → hash 比对 → YAML→callout XML → 图片转换 → callout 转换
  → lark-cli overwrite (xml) → str_replace 标题修复 → 更新 sync_hash
```

---

## 三、API 接口清单

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/status` | 健康检查 |
| GET | `/tree` | Vault 目录树 |
| POST | `/fetch` | 飞书→OB 同步 |
| POST | `/exists` | 检查是否已同步 |
| POST | `/pushback` | OB→飞书回写 |

---

## 四、潜在问题

### 4.1 架构风险

| 编号 | 问题 | 严重度 | 说明 |
|------|------|--------|------|
| R1 | 子插件耦合高风险 | 🔴 高 | auto-rename.js + lark-doc.js 是编译后黑盒 |
| R2 | findByFeishuId 全量扫描 | 🔴 高 | 每次调用遍历 vault 所有 .md |
| R3 | lark-cli 同步阻塞 | 🟡 中 | execFileSync 同步阻塞 Node 线程 |
| R4 | shared 层双份维护 | 🟡 中 | 同源代码但独立编译 |
| R5 | 进程内缓存无持久化 | 🟡 中 | OB 重启后丢失 |
| R6 | CORS 完全放通 | 🟠 低-中 | 同网段任何页面可探测 |

### 4.2 性能瓶颈

| 编号 | 瓶颈 | 影响 |
|------|------|------|
| P1 | fetchHandler 串行调用 lark-cli | 一次同步需 2~3 次 CLI 调用 |
| P2 | pushbackHandler 也用全量扫描 | 批量回写时每篇文档都要扫一遍 |
| P3 | autoRename 逐文件读内容 | 对同目录每个文件都调用 read |
| P4 | content.ts DOM 遍历取摘要 | 大文档页面可能有性能问题 |

---

## 五、优化建议

### 短期可做

| 编号 | 建议 | 优先级 |
|------|------|--------|
| O1 | 建立 feishu_id 索引（Map 缓存） | P0 |
| O2 | 统一 findByFeishuId | P1 |
| O3 | lark-cli 异步化 | P1 |
| O4 | 补全 deleteRegistry | P2 |
| O5 | 去掉硬编码 spaceId | P1 |

### 中期建议

| 编号 | 建议 |
|------|------|
| O6 | shared 层独立 npm 包 |
| O7 | 子插件 TypeScript 重写 |
| O8 | WebSocket 双向通信 |
| O9 | 增量同步 |
| O10 | 图片本地化可选 |

### 长期愿景

| 编号 | 建议 |
|------|------|
| O11 | 去 lark-cli 依赖，直接调用飞书 OpenAPI |
| O12 | 多 vault 支持 |
| O13 | 协同编辑（OT/CRDT） |

---

## 六、代码质量评价

### 优点
1. 类型安全，shared 层接口清晰
2. 协议规范，protocol.ts 集中定义
3. 防御性编程：lark-cli 封装覆盖已知坑
4. PATH 增强解决 GUI 启动问题
5. callout 双向转换完整
6. AI 只建议不自动操作

### 待改进
1. 测试覆盖为零
2. 日志不规范
3. 配置验证缺失
4. 并发控制不足

---

**最需要优先解决的是 findByFeishuId 全量扫描问题**（R2），这是当前最大的性能瓶颈。其次是 lark-cli 同步阻塞（R3）和子插件耦合（R1）。
