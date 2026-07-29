# KnowFlow 4.1 发布收口

## 当前决策

- 协议上游：`tangzi-kk/skr-knowledge` 1.2.1，协议主版本保持为 1。
- 唯一实现：`tangzi-kk/knowflow` 4.1.0；`obsidian-auto-rename` 仅作为事务核心迁移来源。
- 发布状态：源码、文档、双端安装包、SHA256 和真机门禁已完成，4.1.0 为当前稳定版。
- 本机 Obsidian 运行目录：`.obsidian/plugins/fs-TB/`；浏览器从 4.1.0 解包目录加载。

## 2026-07-29 未发布改进

- KF-109：Obsidian 设置页收口为“连接、同步与本地显示、飞书知识库、高级设置”四个单页区段；移除无运行消费者的装饰图片与删除自动登记开关。
- KF-110：右键菜单只处理当前上下文，左侧 Ribbon 只提供任务和状态入口，设置页只保存长期配置；没有新增持久侧栏或第二套写通道。
- 需求编辑器：产品需求改为一次点击直接保存，写入冲突或截图失败时保留草稿并回滚本次附件；记忆候选与知识需求继续独立导出。
- 验证：167/167 自动检查、两端类型检查与完整生产构建通过；本段改进尚未重新打包或安装到真机。

## 子目标状态

| 子目标 | 状态 | 说明 |
| --- | --- | --- |
| 协议快照 | 已完成 | 上游仓库、commit、知识库版本、Schema/协议版本离线锁定 |
| 整理事务 | 已完成 | 预览、确认、全批备份、两阶段换序、逆序恢复、审计与同步事件 |
| 单一 UI | 已完成 | 一套文件树右键、一个 Ribbon、无持久侧栏、设置页窄宽修复 |
| 采集 proposal | 已完成 | fetch/clip 先落地再等待确认；旧服务失败关闭 |
| 发布门禁 | 已完成 | 版本一致性、构建、发布审计、SHA256、暂存 Vault 与真机通信通过 |
| 真机安装 | 已完成 | Obsidian 4.1.0 运行正常；Chrome Profile 4 使用 4.1.0 解包目录 |

## 验证记录

- 完整发布基线：163/163 通过；两端 typecheck、build、release audit 与版本一致性通过。
- 通信专项：25/25 通过；真实 localhost 回环：7/7 通过。
- `artifacts/KnowFlow-4.1.0-SHA256SUMS`：构建产物校验通过。
- `artifacts/KnowFlow-4.1.0-PACKAGES-SHA256SUMS`：浏览器与 Obsidian 安装包校验通过。
- Obsidian 真机：HTTP 200、版本 4.1.0、协议 1、`capture-proposal-v1` 可用、`lark-cli` 就绪。
- 当前对外文件：`artifacts/fs-TB-Obsidian-4.1.0.zip` 与 `artifacts/KnowFlow-Browser-4.1.0.zip`。

## 运行记录与边界

- 最近活动使用有界元数据记录，不保存正文、Token 或原始错误；最新一次 `fetch-proposal` 被 `KNOWLEDGE_PLAN_BLOCKED` 安全阻断。
- proposal 队列为会话级；插件重载后内容仍安全保留，可从落地 Markdown 重新发起整理。
- 旧浏览器归档 `Feishu Doc Exporter 0.3.0` 是独立历史产品，不声称能原位升级到 KnowFlow。
