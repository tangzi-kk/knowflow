# 悬浮窗交互重设计 — 大厂设计规范调研报告

> 调研时间：2026-06-29
> 调研目的：为 KnowFlow 插件的划词悬浮工具栏重设计提供视觉层次与交互反馈的设计依据
> 调研对象：Arc Browser、Notion AI、飞书 AI 划词、Linear、Google Docs、Grammarly、Apple HIG、Material Design 3、Fluent 2

---

## 一、调研概览

### 1.1 调研产品清单

| # | 产品 | 调研重点 | 信息来源 |
|---|------|---------|---------|
| 1 | Arc Browser | 划词浮栏视觉风格、色彩哲学 | Arc UI 官方组件文档、设计分析文章 |
| 2 | Notion AI | AI 按钮、loading、流式结果、错误处理 | Notion 官方文档、使用教程分析 |
| 3 | 飞书 AI 划词工具 | 划词浮栏交互流程、结果呈现 | 飞书官方帮助文档 |
| 4 | Linear | 深色浮层质感、动效系统、乐观 UI | Linear 设计深度分析、UI Kit 逆向 |
| 5 | Google Docs | 划词工具栏出现时机与位置 | Smart Canvas 文档、交互分析 |
| 6 | Grammarly | 划词建议浮层视觉层次 | 官方支持文档、扩展行为分析 |
| 7 | Apple HIG | 浮层材料规范、Liquid Glass、Vibrancy | Apple Developer 官方 HIG |
| 8 | Material Design 3 | 浮动菜单、按钮反馈、elevation 系统 | M3 官方规范 |
| 9 | Fluent 2 (Microsoft) | 阴影系统数学公式、elevation 层级 | Fluent 2 官方设计系统 |

### 1.2 核心发现

1. **"质感"来自多层阴影而非单一阴影**：所有大厂都使用"key shadow（锐利方向性阴影，定义边缘）+ ambient shadow（柔和弥散阴影，暗示距离）"的双层叠加策略，而非单一 box-shadow
2. **深色/半透明比纯白底更有层次感**：Linear、Arc 以深色为基底通过亮度递进制造层次；Apple 以 Liquid Glass 半透明材料让背景"透出"增加深度
3. **backdrop-blur 值不宜过大**：实际项目中 2-6px 比常见的 12-20px 更自然，过大值会让界面"糊"而非"透"
4. **乐观 UI 是消除延迟感的最佳策略**：Linear 的核心设计哲学——先在本地更新 UI，后台同步，只在真正出错时才回滚显示错误
5. **AI 错误处理应提供"前进路径"而非"道歉"**：大厂 AI 产品统一采用"错误 → 重试/编辑/降级/转人工"的可操作模式，而非干巴巴的错误文字
6. **工具栏出现延迟应控制在 100ms 以内**：Linear 将 100ms 作为交互响应的"瞬间感"门槛，超过 300ms 用户会感知到"出了问题"

---

## 二、各产品深度分析

### 2.1 Arc Browser

#### 视觉规范

- **配色哲学**：Arc 追求"让浏览器成为一个家，一个让人感到舒适的地方"。不使用传统浏览器的灰白冷色调，而是通过丰富的主题色彩（Spaces 可定制不同颜色）营造情绪感
- **工具栏基底**：使用 `--bg-card` 语义 token，比页面表面 `--bg-page` 略亮，制造"浮起"感
- **底部边框**：默认启用 `--border-subtle`（细微边框）将工具栏与下方内容视觉分离
- **间距系统**：使用 `--space-sm` 作为按钮间统一 gap
- **尺寸**：主工具栏 48px (md)，次级/嵌套工具栏 36px (sm)

#### 交互反馈

- 工具栏采用三槽位布局：start（左固定）、center（弹性）、end（右固定），最重要的操作放在 end 槽位
- 按钮使用 ghost 变体（无边框透明底），hover 时显示底色变化
- 最多 5-6 个控件，超出则移入 DropdownMenu

#### 工具栏出现时机

- Arc 的设计哲学是"calm internet"——不过度打扰，浮动元素出现克制

#### 对 KnowFlow 的启发

- **用语义 token 管理颜色层次**：不要硬编码白色背景，而是定义 `--toolbar-bg` / `--toolbar-bg-hover` / `--toolbar-border` 等 token，通过亮度递进制造层次
- **底部细边框**比纯阴影更能定义工具栏边界，特别是浅色背景下
- **克制是关键**：按钮数量控制在 4-5 个以内，超出折叠到"更多"

---

### 2.2 Notion AI

#### 视觉规范

- **AI 品牌色**：Notion AI 使用紫色系（`#7B61FF` 附近）作为 AI 功能的统一标识色，与 Notion 常规黑白形成对比
- **触发方式**：空格键 `Space` 或斜杠 `/` 或快捷键 `Cmd+J` 唤起 AI 面板
- **面板风格**：内嵌式而非悬浮式——AI 面板直接在文档流中展开，上下文连续

#### 交互反馈

- **Loading 状态**：AI 思考时显示动画指示器（脉冲点/渐变文字），而非传统 spinner
- **流式呈现**：结果以流式逐字输出（打字机效果），配合闪烁光标，让用户感知"AI 正在实时生成"
- **结果操作**：生成完成后提供 `Accept`（接受）/ `Discard`（丢弃）/ `Try again`（重新生成）/ `Continue writing`（继续）等操作按钮
- **渐进披露**：先展示结果概要，可展开查看详情

#### 错误处理

- 网络错误时显示友好提示 + "Try again" 按钮
- AI 生成不满意时可一键 "Try again" 重新生成，无需重新输入指令
- 不会阻塞用户操作——错误状态可关闭，用户可继续编辑

#### 对 KnowFlow 的启发

- **流式输出**比"spinner → 一次性展示结果"体验好得多，用户能实时看到 AI 在"工作"
- **结果操作按钮**（重试/复制/继续）应内嵌在结果面板中，而非工具栏上
- **AI 品牌色**：KnowFlow 可定义统一的 AI 功能色（如蓝紫渐变），让用户一眼识别"这是 AI 操作"

---

### 2.3 飞书 AI 划词工具

#### 视觉规范

- **触发范围**：飞书客户端内部（消息、邮件、任务）及外部（浏览器、备忘录等任意应用）均可划词触发
- **功能按钮**：AI 搜索、翻译、解释、保存、问一问
- **macOS 权限要求**：需开启系统"辅助功能"权限

#### 交互反馈

- **划词即出**：选中文字后浮动工具栏直接出现
- **结果内联展示**：翻译/解释结果在浮层内直接展示，右上角可切换语言
- **二次操作**：结果区提供「继续提问」（跳转知识问答）和「复制」按钮
- **保存功能**：划词内容可直接生成文档（含来源、时间），可进一步编辑分享
- **问一问**：在划词结果基础上追加输入框，结合划选内容和用户问题生成回答

#### 错误处理

- 消耗 AI 额度机制：基于企业知识回答消耗 20 点/次，仅联网/大模型调用消耗 3 点/次
- 额度不足时有明确提示

#### 工具栏出现时机

- 划词后即时出现，无需额外操作
- 可按应用/网站禁用（在特定场景不唤起）

#### 对 KnowFlow 的启发

- **结果区可追加输入框**：KnowFlow 的「问题」功能可参考飞书的"问一问"模式，在结果基础上追加提问
- **禁用名单机制**：KnowFlow 可增加按域名/网站禁用工具栏出现的功能
- **保存为文档**：金句/概念卡结果可提供"保存到 Obsidian"快捷操作

---

### 2.4 Linear

#### 视觉规范

Linear 是本次调研中"质感"做得最好的产品，其设计哲学值得重点参考。

- **深色优先**：以深色为基底，通过亮度递进制造层次感
  ```
  --bg-primary:  #0D0D0D    /* 最底层 - 主背景 */
  --bg-elevated: #141414    /* 卡片/浮层面板 */
  --bg-hover:    #1F1F1F    /* hover 态 */
  --bg-active:   #292929    /* active/选中态 */
  ```
- **文本层次通过 opacity 控制**（而非不同灰度值）：
  ```
  --text-primary:   rgba(255,255,255, 0.95)
  --text-secondary: rgba(255,255,255, 0.65)
  --text-tertiary:  rgba(255,255,255, 0.45)
  ```
- **边框使用低透明度白色**：
  ```
  --border-default: rgba(255,255,255, 0.08)
  --border-hover:   rgba(255,255,255, 0.12)
  ```
- **字体**：Inter，紧凑排版（正文 13px，元数据 11px，标题 16-20px）
- **语义色系**：状态色高饱和（蓝 #3B82F6 / 琥珀 #F59E0B / 绿 #10B981 / 红 #EF4444），优先级色按色相递进（红→橙→黄→灰）

#### 交互反馈

- **悬停上浮**：卡片 hover 时 `translateY(-1px)` + `box-shadow: 0 4px 12px rgba(0,0,0,0.15)`
- **动效系统**：
  ```
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1)    /* 减速出场 */
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)   /* 平滑过渡 */
  --duration-fast:   100ms    /* 微反馈 */
  --duration-normal: 150ms    /* 标准过渡 */
  --duration-slow:   250ms    /* 页面级过渡 */
  ```
- **乐观 UI（核心设计哲学）**：
  1. 立即在本地更新 UI 状态
  2. 显示成功反馈
  3. 后台同步服务器
  4. 仅在真正失败时回滚 + 显示错误
- **信息密度**：用图标/符号替代文字标签，悬停时才显示详情（渐进披露）

#### 工具栏出现时机

- **< 100ms 原则**：Linear 认为"如果某个操作需要 300ms，用户就会觉得出了问题"。所有交互目标 < 100ms
- **命令面板**：Cmd+K 模糊搜索，助记快捷键（S=Status, P=Priority, A=Assign）
- 加载状态尽可能不可见，只在必要时使用骨架屏

#### 错误处理

- 乐观 UI 的核心：不阻塞等待网络请求，失败时才回滚 + 显示错误
- 错误不打断用户工作流——可关闭、可重试

#### 对 KnowFlow 的启发

- **乐观 UI 是解决"工具栏出现延迟"的最佳方案**：划词后工具栏应在 < 100ms 内出现，AI 按钮点击后立即展示 loading 状态而非等待响应
- **通过 opacity 控制文本层次**比使用不同灰度值更优雅、更一致
- **cubic-bezier(0.16, 1, 0.3, 1)** 是制造"有分量感"减速动画的最佳缓动曲线
- **translateY(-1px) + 多层阴影** 的组合比单纯 scale 更有"质感"
- **100ms / 150ms / 250ms** 三档动效时长可直接采用

---

### 2.5 Google Docs

#### 视觉规范

- **Smart Canvas**：划词后根据上下文弹出智能建议浮层
- 浮层使用 Google Material 风格，白底 + 轻阴影 + 圆角
- 字体使用 Google Sans / Roboto

#### 交互反馈

- 划词后浮动工具栏在选区附近出现
- 工具栏包含格式化操作（加粗/斜体/链接等）
- @ 符号触发智能芯片插入菜单

#### 工具栏出现时机

- 划词后短暂延迟出现（约 200-300ms），避免误触
- 位置在选区上方或下方，自动避让屏幕边缘

#### 对 KnowFlow 的启发

- **防误触延迟**：划词后加 200-300ms 延迟（debounce），避免拖选过程中的误弹出。但这个延迟应在用户无感知范围内（配合快速出现动画）
- **位置自动避让**：工具栏应在选区上方优先，空间不足时翻转到下方，且不能超出视口

---

### 2.6 Grammarly

#### 视觉规范

- **浮动指示器**：右下角圆形小部件（绿色圆圈表示无误，红色表示有建议）
- **建议卡片**：可拖拽定位的浮动卡片，展示详细建议
- **视觉层次**：使用阴影 + 白底 + 圆角制造浮起感
- 品牌色绿色（#15C39A 附近）贯穿整个交互

#### 交互反馈

- 划词/输入时实时检测，下划线标注问题（红/蓝/绿不同类型）
- 点击下划线词弹出建议浮层
- 浮层包含：问题说明 + 建议修改 + Accept/Dismiss 按钮
- 动画：浮层以 scale + fade 组合出现

#### 错误处理

- 建议"低置信度"时标注 "Maybe" 等不确定性标识
- 用户可一键 Accept 或 Ignore，操作即时反馈

#### 对 KnowFlow 的启发

- **浮动指示器模式**：KnowFlow 可考虑在划词时不直接弹出完整工具栏，而是先出现一个小型指示器，hover/click 后展开——减少打扰感
- **不确定性标注**：AI 结果可标注置信度（高/中/低），低置信度结果视觉上区分（如虚线边框、淡色背景）

---

### 2.7 Apple Human Interface Guidelines（浮层材料规范）

#### 视觉规范 — Liquid Glass 系统

Apple 在 iOS 26 / macOS 26 引入 Liquid Glass 设计语言，对浮层设计有最权威的指导：

**两种玻璃变体：**

| 变体 | 特性 | 适用场景 |
|------|------|---------|
| `regular` | 模糊背景 + 调整亮度（luminosity），保证前景可读性 | 含大量文本的浮层（alerts、sidebars、**popovers**） |
| `clear` | 高度半透明，优先展示底层内容 | 浮动在媒体（照片/视频）上方的控件 |

**关键规则：**
- 底层内容较亮时，clear 变体需添加 **35% opacity 暗色遮罩层**保证对比度
- **Popover 应使用 `regular` 变体**（因为通常含大量文本）
- Liquid Glass 仅用于浮动在内容层上方的控件，**不要在内容层使用**

**标准材料厚度层级：**

| 材料 | 特征 | 设计含义 |
|------|------|---------|
| `ultraThin` | 最薄、最半透明 | 保留背景上下文 |
| `thin` | 较薄 | 同上 |
| `regular`（默认） | 中等 | 平衡对比度与透明度 |
| `thick` | 最厚、最不透明 | 为文本和精细元素提供更好对比度 |

**Vibrancy（活力效果）层级：**
- `label`：最高对比度（默认，用于所有材料）
- `secondaryLabel`：次高
- `tertiaryLabel`：较低
- `quaternaryLabel`：最低（**避免**在 thin/ultraThin 材料上使用）

#### 对 KnowFlow 的启发

- **Popover 使用 regular 变体**：KnowFlow 的结果面板含大量文本，应使用"中等厚度"的半透明背景（而非高度透明），保证可读性
- **亮色背景上加遮罩层**：当网页背景较亮时，工具栏应增加一层暗色遮罩（~35% opacity）保证按钮和文字可读
- **Vibrancy 层级**：工具栏中的文字应使用不同的"活力"级别——按钮文字用 label 级（最高对比），辅助说明用 secondaryLabel 级
- **不要过度透明**：透明度是为了"保留上下文"，不是炫技。工具栏的可读性优先

---

### 2.8 Material Design 3

#### 视觉规范 — Elevation 系统

M3 的 elevation 系统使用 dp 为单位的层级体系：

| 层级 | dp 值 | 适用组件 |
|------|-------|---------|
| Level 0 | 0dp | 平铺内容、背景 |
| Level 1 | 1dp | 卡片（elevated button 默认） |
| Level 2 | 3dp | 悬浮菜单、FAB（静止） |
| Level 3 | 6dp | 激活态 FAB、Snackbar |
| Level 4 | 8dp | 导航栏、底部栏 |
| Level 5 | 12dp | 对话框（Modal） |

#### 交互反馈 — State Layer 系统

M3 使用"状态层"（State Layer）提供交互反馈，而非改变背景色：

| 状态 | State Layer Opacity |
|------|---------------------|
| Hover | 8% |
| Focus | 10% |
| Pressed | 10% → 12% |
| Dragged | 16% |

- 状态层覆盖在组件上方，使用组件的 `onColor` 叠加
- **涟漪效果（Ripple）**：从触控点扩散，半径扩散至组件边界，持续约 300ms

#### 按钮规范

- **Elevated Button**：elevation 1（默认）→ 0（disabled），hover 时 elevation 升至 3
- **Filled Tonal Button**：使用次级容器色填充，无阴影
- 圆角：全宽按钮 20dp，普通按钮根据尺寸 20-24dp

#### 对 KnowFlow 的启发

- **State Layer 模式**：按钮 hover/active 反馈应使用半透明覆盖层（8-12% opacity），而非改变背景色——更细腻、更一致
- **涟漪效果**：按钮点击时从点击点扩散涟漪（300ms），比 scale(0.9) 更有"分量感"和"物理感"
- **Elevation 动态变化**：hover 时 elevation 从 1 → 3（阴影加深 + 上浮），给用户"按钮被托起"的感觉

---

### 2.9 Fluent 2 Design System（Microsoft）

#### 视觉规范 — 数学化的阴影系统

Fluent 2 提供了最精确的阴影数学公式，值得直接参考：

**阴影组合策略：Key Shadow + Ambient Shadow**
- **Key Shadow**：锐利、方向性，定义物体边缘（小 blur + 有 Y 轴偏移）
- **Ambient Shadow**：柔和、弥散，暗示距离（大 blur + 零偏移）

**低 Elevation 层级（Light 模式）：**

| Token | Blur (px) | Y Offset (px) | Opacity | 适用组件 |
|-------|-----------|---------------|---------|---------|
| Shadow 2 | 2 | 1 | 14% | FAB 按压态 |
| Shadow 4 | 4 | 2 | 14% | 卡片（无边缘） |
| Shadow 8 | 8 | 4 | 14% | FAB、悬浮卡片、**命令栏、下拉菜单、Tooltip** |
| Shadow 16 | 16 | 8 | 14% | **Callout、Hover Card** |

**高 Elevation 层级（Light 模式）：**

| Token | Key Shadow | Ambient Shadow | 适用组件 |
|-------|-----------|----------------|---------|
| Shadow 28 | Blur=28, Y=14, Opacity=24% | Blur=8, Y=0, Opacity=20% | **底部抽屉、侧导航** |
| Shadow 64 | Blur=64, Y=32, Opacity=24% | Blur=8, Y=0, Opacity=20% | **弹窗对话框** |

**Dark 模式调整：**
- Key Shadow opacity 提高至 **28%**（暗色背景上阴影需更强才能可见）
- Ambient Shadow opacity 保持 14-20%

**彩色表面的阴影调整（亮度方程）：**
```
Luminosity = 0.2126 * R + 0.7152 * G + 0.0722 * B
Shadow 1 opacity = Round(42 - 0.116 * luminosity)
Shadow 2 opacity = Round(34 - 0.09 * luminosity)
```

#### 对 KnowFlow 的启发

- **直接采用 Fluent 2 的阴影数值**：KnowFlow 工具栏对应 Shadow 8-16 层级
  - 建议组合：`box-shadow: 0 4px 8px rgba(0,0,0,0.14), 0 0 16px rgba(0,0,0,0.12)`
  - 结果面板展开时升至 Shadow 16-28
- **Dark 模式阴影 opacity 翻倍**：如果 KnowFlow 支持暗色网页，阴影 opacity 需从 14% 提高到 28%
- **双层阴影是关键**：单一阴影无法同时定义边缘和距离感，必须用 key + ambient 双层叠加

---

## 三、横向对比总结

### 3.1 视觉层次策略对比

| 产品 | 配色策略 | 阴影层次 | 圆角 | 质感来源 |
|------|---------|---------|------|---------|
| **Arc Browser** | 主题色彩 + `--bg-card` 语义递进 | `--border-subtle` 底边框 | 中等（~12px） | 色彩情绪 + 细边框分隔 |
| **Notion AI** | 白底 + 紫色 AI 品牌色 | 轻阴影 | 8-12px | 品牌色对比 + 内嵌式连续性 |
| **飞书 AI 划词** | 白底 + 飞书蓝 | 中等阴影 | 8-12px | 功能图标 + 结果区层级 |
| **Linear** | 深色优先，亮度递进（#0D→#14→#1F→#29） | `0 4px 12px rgba(0,0,0,0.15)` + 边框 `rgba(255,255,255,0.08)` | 6-8px | 深色亮度递进 + opacity 文本层次 + 紧凑排版 |
| **Google Docs** | 白底 Material 风格 | Material elevation dp 系统 | 4-8px | 标准 Material 阴影 |
| **Grammarly** | 白底 + 绿色品牌色 | 中等阴影 + 圆角 | 8-12px | 品牌色指示 + 拖拽浮层 |
| **Apple HIG** | Liquid Glass 半透明材料 | 系统管理（vibrancy + blur） | 大圆角（连续圆角） | 玻璃材料 + 亮度调整 + 活力效果 |
| **Material Design 3** | Tonal 色彩系统 | dp 层级（0-12dp）+ 状态层 | 16-24dp（全宽按钮 20dp） | Elevation + State Layer + Ripple |
| **Fluent 2** | 语义 token + 亮度方程 | Key + Ambient 双层数学公式 | 4-8px | 双层阴影数学公式 + 精确 opacity |

### 3.2 交互反馈策略对比

| 产品 | 按压反馈 | Loading | 结果呈现 | 错误处理 |
|------|---------|---------|---------|---------|
| **Arc Browser** | Ghost 按钮 hover 底色变化 | — | — | — |
| **Notion AI** | 按钮底色变化 | 脉冲点/渐变动画 | **流式逐字输出** + 光标闪烁 | 友好提示 + Try again 按钮 |
| **飞书 AI 划词** | 按钮高亮 | 进度提示 | 结果内联 + 继续提问/复制 | 额度提示 |
| **Linear** | `translateY(-1px)` + 阴影加深 | **乐观 UI（loading 尽可能不可见）** | 即时呈现（乐观更新） | **回滚 + 错误提示，不阻塞工作流** |
| **Google Docs** | Material Ripple | 骨架屏 | 内联插入 | — |
| **Grammarly** | 浮层 scale + fade | 实时检测 | 建议卡片 + Accept/Dismiss | 低置信度标注 "Maybe" |
| **Apple HIG** | 系统触觉反馈 + 动画 | 系统进度指示 | 模态/非模态浮层 | 标准 Alert + 操作按钮 |
| **Material Design 3** | **State Layer 8-12% + Ripple 300ms** | 圆形进度指示器 | 卡片展开 | Snackbar + 操作按钮 |
| **Fluent 2** | 阴影变化 + Reveal 效果 | 进度环 | 浮层展开 | 消息条 + 重试 |

### 3.3 工具栏出现时机对比

| 产品 | 出现延迟 | 出现动画 | 位置策略 |
|------|---------|---------|---------|
| **Arc Browser** | 即时 | 淡入 | 上下文相关 |
| **Notion AI** | 快捷键触发即出 | 面板展开 | 文档流内嵌 |
| **飞书 AI 划词** | 划词即时出现 | 淡入 + 轻微 scale | 选区附近 |
| **Linear** | **< 100ms（核心目标）** | `cubic-bezier(0.16,1,0.3,1)` 150ms | 居中模态 |
| **Google Docs** | 200-300ms（防误触 debounce） | fade + scale | 选区上方/下方自动避让 |
| **Grammarly** | 实时检测，点击触发 | scale + fade | 可拖拽定位 |
| **Apple HIG** | 系统标准动画 | spring 弹性动画 | 指向触发源 |
| **Material Design 3** | 即时 | `cubic-bezier(0.2,0,0,1)` 200ms | 锚点上方 |

---

## 四、对 KnowFlow 的设计建议

### 4.1 视觉规范建议

#### 配色策略

采用"浅色玻璃态 + 语义 token 递进"策略，参考 Linear 的 token 体系 + Apple 的材料规范：

```css
/* KnowFlow 工具栏 Token 体系 */
:root {
  /* 表面层次 - 通过亮度递进 */
  --kf-bg-base:        rgba(255, 255, 255, 0.72);  /* 工具栏底色（半透明） */
  --kf-bg-elevated:    rgba(255, 255, 255, 0.88);  /* 结果面板底色（更不透明） */
  --kf-bg-hover:       rgba(0, 0, 0, 0.04);        /* 按钮 hover 覆盖层 */
  --kf-bg-active:      rgba(0, 0, 0, 0.08);        /* 按钮 active 覆盖层 */
  --kf-bg-error:       rgba(239, 68, 68, 0.06);    /* 错误态背景 */

  /* 文本层次 - 通过 opacity 控制 */
  --kf-text-primary:   rgba(0, 0, 0, 0.88);
  --kf-text-secondary: rgba(0, 0, 0, 0.60);
  --kf-text-tertiary:  rgba(0, 0, 0, 0.38);

  /* 边框 */
  --kf-border:         rgba(0, 0, 0, 0.06);        /* 细微边框 */
  --kf-border-strong:  rgba(0, 0, 0, 0.12);        /* 强调边框 */

  /* AI 品牌色（蓝紫渐变） */
  --kf-ai-gradient:    linear-gradient(135deg, #6366F1, #8B5CF6);

  /* 暗色网页适配（自动检测） */
  --kf-bg-base-dark:        rgba(30, 30, 30, 0.72);
  --kf-bg-elevated-dark:    rgba(38, 38, 38, 0.88);
  --kf-text-primary-dark:   rgba(255, 255, 255, 0.95);
  --kf-text-secondary-dark: rgba(255, 255, 255, 0.65);
  --kf-border-dark:         rgba(255, 255, 255, 0.08);
}
```

#### 阴影层次

采用 Fluent 2 的 Key + Ambient 双层阴影策略，参考 Shadow 8-16 层级：

```css
/* KnowFlow 阴影系统 */
:root {
  /* Level 1 - 工具栏胶囊（对应 Fluent Shadow 8） */
  --kf-shadow-sm:
    0 2px 4px rgba(0, 0, 0, 0.06),       /* Key shadow - 定义边缘 */
    0 0 8px rgba(0, 0, 0, 0.04);          /* Ambient shadow - 暗示距离 */

  /* Level 2 - 结果面板展开（对应 Fluent Shadow 16） */
  --kf-shadow-md:
    0 8px 16px rgba(0, 0, 0, 0.10),       /* Key shadow */
    0 0 24px rgba(0, 0, 0, 0.06);          /* Ambient shadow */

  /* Level 3 - 模态/全屏结果（对应 Fluent Shadow 28） */
  --kf-shadow-lg:
    0 14px 28px rgba(0, 0, 0, 0.12),
    0 0 40px rgba(0, 0, 0, 0.08);

  /* hover 态阴影增强 */
  --kf-shadow-hover:
    0 4px 8px rgba(0, 0, 0, 0.08),
    0 0 16px rgba(0, 0, 0, 0.06);
}
```

#### 圆角 / 字号 / 间距

```css
:root {
  /* 圆角 */
  --kf-radius-sm: 8px;       /* 按钮 */
  --kf-radius-md: 12px;      /* 胶囊工具栏 */
  --kf-radius-lg: 16px;      /* 结果面板 */
  --kf-radius-full: 9999px;  /* 圆形按钮 */

  /* 字号（参考 Linear 紧凑排版） */
  --kf-text-xs: 11px;    /* 元数据、辅助说明 */
  --kf-text-sm: 12px;    /* 按钮文字、标签 */
  --kf-text-base: 13px;  /* 结果正文 */
  --kf-text-lg: 15px;    /* 结果标题 */
  --kf-text-xl: 17px;    /* 强调标题 */

  /* 间距（4px 基准网格） */
  --kf-space-xs: 4px;
  --kf-space-sm: 8px;
  --kf-space-md: 12px;
  --kf-space-lg: 16px;
  --kf-space-xl: 24px;
}
```

#### Backdrop Blur

```css
/* 参考 glassmorphism 最佳实践：2-6px 比更自然 */
--kf-blur-toolbar: 6px;    /* 工具栏 - 轻微模糊 */
--kf-blur-panel: 12px;     /* 结果面板 - 中等模糊 */
/* 注意：当前 20px 过大，会导致"糊"而非"透" */
```

### 4.2 交互反馈建议

#### 按钮按压

采用 Material Design 3 的 State Layer + Ripple 组合：

```css
.kf-btn {
  position: relative;
  overflow: hidden;
  transition: 
    box-shadow 150ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 100ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* State Layer 模式（M3） */
.kf-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--kf-text-primary);
  opacity: 0;  /* 默认透明 */
  transition: opacity 150ms ease;
  border-radius: inherit;
}

.kf-btn:hover::before { opacity: 0.06; }    /* 6% 覆盖 */
.kf-btn:active::before { opacity: 0.12; }   /* 12% 覆盖 */

/* 悬停上浮（Linear 风格） */
.kf-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--kf-shadow-hover);
}

/* 按压回弹 - 比 scale(0.9) 更有"分量感" */
.kf-btn:active {
  transform: translateY(0px) scale(0.96);
  transition: transform 60ms ease-out;
}

/* Ripple 涟漪效果（M3 风格） */
.kf-ripple {
  position: absolute;
  border-radius: 50%;
  background: var(--kf-text-primary);
  opacity: 0.15;
  transform: scale(0);
  animation: kf-ripple 300ms cubic-bezier(0.2, 0, 0, 1);
  pointer-events: none;
}

@keyframes kf-ripple {
  to { transform: scale(2.5); opacity: 0; }
}
```

#### Loading 设计

采用 Notion AI 的流式 + Linear 的乐观 UI 结合：

```css
/* 1. 按钮级 Loading - AI 按钮点击后立即反馈 */
.kf-btn.loading {
  background: var(--kf-ai-gradient);
  color: white;
}

.kf-btn.loading .kf-btn-icon {
  animation: kf-pulse 1.2s ease-in-out infinite;
}

@keyframes kf-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

/* 2. 面板级 Loading - 流式输出前的过渡 */
.kf-loading-dots {
  display: inline-flex;
  gap: 4px;
}

.kf-loading-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--kf-ai-gradient);
  animation: kf-bounce 1.4s ease-in-out infinite;
}

.kf-loading-dots span:nth-child(2) { animation-delay: 0.16s; }
.kf-loading-dots span:nth-child(3) { animation-delay: 0.32s; }

@keyframes kf-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* 3. 流式文本光标 */
.kf-streaming-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--kf-ai-gradient);
  margin-left: 2px;
  animation: kf-blink 1s step-end infinite;
  vertical-align: text-bottom;
}

@keyframes kf-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

**Loading 策略：**
1. 点击 AI 按钮 → **立即**（< 50ms）按钮变为 loading 态（脉冲动画）
2. 面板展开 → 显示 loading dots + 进度文字（"正在译解..."）
3. AI 响应开始 → 切换为流式输出（逐字 + 光标闪烁）
4. 完成 → 光标消失，结果淡入完成态

#### 结果呈现

```css
.kf-result {
  animation: kf-result-appear 250ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes kf-result-appear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 胶囊 → 面板 变形过渡 */
.kf-toolbar.expanded {
  transition: 
    width 200ms cubic-bezier(0.16, 1, 0.3, 1),
    border-radius 200ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

### 4.3 工具栏出现优化建议

#### 出现时机

```javascript
// 划词后出现逻辑
const SELECTION_DEBOUNCE = 150;  // 150ms debounce，防误触（参考 Google Docs 200-300ms 折中）
const APPEAR_ANIMATION_MS = 150; // 出现动画时长（参考 Linear duration-normal）

let selectionTimer = null;

document.addEventListener('selectionchange', () => {
  clearTimeout(selectionTimer);
  selectionTimer = setTimeout(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      showToolbar(selection);  // 立即触发出现动画
    } else {
      hideToolbar();
    }
  }, SELECTION_DEBOUNCE);
});
```

#### 出现动画

```css
/* 工具栏出现 - scale + fade + 轻微上移组合 */
.kf-toolbar {
  opacity: 0;
  transform: scale(0.92) translateY(4px);
  transform-origin: center bottom;
  transition: 
    opacity 150ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

.kf-toolbar.visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}
```

#### 位置计算

```javascript
function calculateToolbarPosition(selection, toolbarWidth, toolbarHeight) {
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  // 默认在选区上方
  let top = rect.top - toolbarHeight - 8;
  let left = rect.left + (rect.width - toolbarWidth) / 2;
  
  // 上方空间不足 → 翻转到下方
  if (top < 8) {
    top = rect.bottom + 8;
  }
  
  // 水平边界避让
  left = Math.max(8, Math.min(left, window.innerWidth - toolbarWidth - 8));
  
  return { top, left };
}
```

### 4.4 AI 报错的优雅降级策略

#### 错误提示视觉

```css
/* 错误状态 - 不用刺眼红色，用柔和的警示色 */
.kf-error {
  background: var(--kf-bg-error);           /* rgba(239,68,68,0.06) 淡红底 */
  border: 1px solid rgba(239, 68, 68, 0.15); /* 淡红边框 */
  border-radius: var(--kf-radius-md);
  padding: var(--kf-space-lg);
  animation: kf-result-appear 250ms cubic-bezier(0.16, 1, 0.3, 1);
}

.kf-error-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #EF4444;
  margin-bottom: var(--kf-space-sm);
}

.kf-error-title {
  font-size: var(--kf-text-base);
  font-weight: 600;
  color: var(--kf-text-primary);
  margin-bottom: 4px;
}

.kf-error-desc {
  font-size: var(--kf-text-sm);
  color: var(--kf-text-secondary);
  line-height: 1.5;
  margin-bottom: var(--kf-space-md);
}
```

#### 错误状态分类与微文案

参考大厂 AI 错误处理的"前进路径"原则，错误提示应提供可操作的后续步骤：

| 错误类型 | 标题 | 描述 | 操作按钮 |
|---------|------|------|---------|
| AI 超时 | "响应超时" | "AI 处理时间较长，可能是网络波动或服务繁忙。" | 「重试」「切换模型」 |
| 连接失败 | "无法连接 AI 服务" | "请检查网络连接后重试。如果问题持续，可尝试切换 AI 模型。" | 「重试」「切换模型」「复制原文」 |
| 内容过长 | "内容超出处理限制" | "选中文本过长，AI 最多处理 5000 字。请缩短后重试。" | 「截取前 5000 字重试」「取消」 |
| 额度耗尽 | "AI 额度已用完" | "今日 AI 调用次数已达上限，明日重置或切换模型。" | 「切换模型」「了解详情」 |
| 结果为空 | "未获取到结果" | "AI 未能生成有效结果，请尝试换一种方式提问。" | 「重新生成」「修改选中内容」 |

#### 重试机制

```javascript
// 指数退避重试策略
class AIRetryStrategy {
  constructor(maxRetries = 2, baseDelay = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
  }

  async execute(aiCall, retryCount = 0) {
    try {
      return await aiCall();
    } catch (error) {
      if (retryCount >= this.maxRetries) {
        throw error;  // 超过最大重试次数，抛出错误
      }
      
      // 指数退避：1s → 2s
      const delay = this.baseDelay * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // UI 提示："正在重试 (2/3)..."
      return this.execute(aiCall, retryCount + 1);
    }
  }
}
```

#### 降级方案

```
AI 调用失败时的降级链路：

1. 自动重试（1-2次，指数退避）
   ↓ 仍失败
2. 提示用户「重试」/「切换模型」（Gemini ↔ DeepSeek）
   ↓ 用户选择切换
3. 切换备选 AI 模型重新调用
   ↓ 仍失败
4. 降级为本地处理：
   - 「译解」→ 调用浏览器自带翻译 API
   - 「概念卡」→ 显示 Wikipedia 搜索链接
   - 「金句」→ 仅高亮选中文本，提示"已标记"
   - 「问题」→ 提供 Google 搜索链接
   ↓ 用户仍需 AI 结果
5. 提供「复制原文」+「稍后重试」选项
```

#### 空状态设计

```css
/* 空状态 - 引导用户而非显示空白 */
.kf-empty {
  text-align: center;
  padding: var(--kf-space-xl) var(--kf-space-lg);
}

.kf-empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--kf-space-md);
  opacity: 0.4;
}

.kf-empty-text {
  font-size: var(--kf-text-sm);
  color: var(--kf-text-tertiary);
  line-height: 1.6;
}
```

---

## 五、优先级建议

### P0 — 必须改进（直接影响用户核心体验）

| # | 改进项 | 依据 | 预期效果 |
|---|--------|------|---------|
| 1 | **双层阴影系统**（Key + Ambient） | Fluent 2 数学化阴影系统 | 解决"视觉层次感不足"，让工具栏有"浮起"质感 |
| 2 | **降低 backdrop-blur 至 6-12px** | Glassmorphism 最佳实践 | 当前 20px 过大导致"糊"，降低后更"透"更自然 |
| 3 | **划词出现延迟优化至 < 150ms** | Linear < 100ms 原则 + Google Docs 防误触 | 解决"出现延迟感"，配合 debounce 防误触 |
| 4 | **AI 错误状态提供操作按钮**（重试/切换模型） | AI 错误处理"前进路径"原则 | 解决"错误提示体验差"，从"错误文字"到"可操作方案" |
| 5 | **流式输出替代 spinner** | Notion AI 流式呈现 | 用户实时感知 AI 工作，减少等待焦虑 |

### P1 — 应该改进（显著提升体验质感）

| # | 改进项 | 依据 | 预期效果 |
|---|--------|------|---------|
| 6 | **State Layer 按钮反馈**（6-12% opacity 覆盖） | Material Design 3 | 比 scale(0.9) 更细腻一致的按压反馈 |
| 7 | **Ripple 涟漪效果** | Material Design 3 | 增加"物理感"和"分量感" |
| 8 | **hover 时 translateY(-1px) + 阴影增强** | Linear 微交互 | 按钮"被托起"的质感 |
| 9 | **cubic-bezier(0.16, 1, 0.3, 1) 统一缓动** | Linear 动效系统 | 所有过渡有"减速出场"的分量感 |
| 10 | **AI 按钮品牌色**（蓝紫渐变） | Notion AI 品牌色策略 | 视觉识别度提升，AI 功能统一标识 |
| 11 | **自动重试 + 指数退避** | 大厂容错标准 | 减少用户手动重试次数 |
| 12 | **降级方案**（切换模型 / 本地处理 / 搜索链接） | AI 优雅降级模式 | AI 不可用时不阻断用户工作流 |

### P2 — 可以优化（锦上添花）

| # | 改进项 | 依据 | 预期效果 |
|---|--------|------|---------|
| 13 | **暗色网页自适应**（检测页面暗色 → 切换工具栏配色） | Linear 深色优先 + Fluent 2 暗色阴影调整 | 在暗色网页上保持可读性 |
| 14 | **不确定性标注**（AI 结果置信度标识） | Grammarly "Maybe" 标注 | 低置信度结果视觉区分 |
| 15 | **按域名禁用工具栏** | 飞书 AI 划词禁用名单 | 减少在不需要的页面打扰用户 |
| 16 | **结果区追加提问** | 飞书"问一问"模式 | 在 AI 结果基础上连续对话 |
| 17 | **位置自动避让视口边缘** | Google Docs 位置策略 | 工具栏不被屏幕边缘裁切 |
| 18 | **细边框 + 阴影组合** | Arc `--border-subtle` | 浅色背景下更清晰的工具栏边界 |

---

## 附录：关键设计数值速查表

| 参数 | 推荐值 | 来源 |
|------|--------|------|
| 工具栏 backdrop-blur | 6px | Glassmorphism 最佳实践 |
| 面板 backdrop-blur | 12px | Glassmorphism 最佳实践 |
| 工具栏阴影 | `0 2px 4px rgba(0,0,0,0.06), 0 0 8px rgba(0,0,0,0.04)` | Fluent 2 Shadow 8 |
| 面板阴影 | `0 8px 16px rgba(0,0,0,0.10), 0 0 24px rgba(0,0,0,0.06)` | Fluent 2 Shadow 16 |
| 胶囊圆角 | 12px | — |
| 面板圆角 | 16px | — |
| 按钮圆角 | 8px | — |
| 按钮尺寸 | 32×32px（保持现有） | — |
| hover State Layer | 6% opacity | M3（8% 调低以适配浅色） |
| active State Layer | 12% opacity | M3 |
| Ripple 时长 | 300ms | M3 |
| 出现 debounce | 150ms | Google Docs 折中 |
| 出现动画时长 | 150ms | Linear duration-normal |
| 微反馈时长 | 100ms | Linear duration-fast |
| 页面过渡时长 | 250ms | Linear duration-slow |
| 缓动曲线 | `cubic-bezier(0.16, 1, 0.3, 1)` | Linear ease-out |
| hover 位移 | translateY(-1px) | Linear |
| active 缩放 | scale(0.96) | M3 调整 |
| 正文字号 | 13px | Linear |
| 辅助字号 | 11-12px | Linear |
| 文本主色 opacity | 88-95% | Linear / Apple |
| 文本次色 opacity | 60-65% | Linear / Apple |
| 边框 opacity | 6-8% | Linear |
| 暗色模式阴影 opacity | 28% | Fluent 2 Dark |

---

*报告结束。以上所有数值建议均基于大厂公开设计规范和最佳实践，可直接用于 KnowFlow 插件悬浮窗重设计的开发实现。*
