# KnowFlow 4.0 当前任务规格

## Goal

把现有飞书 ↔ Obsidian 套件升级成可验证的 KnowFlow 4.0：一次捕获或同步必须得到真实、可解释、可恢复的终态；任何组件错配、冲突、并发、重启或外部依赖失败都不能静默覆盖数据或报告假成功。

## First Principles

1. 用户真正需要的是内容可靠进入 Obsidian，并能安全回写飞书，不是更多页面。
2. 成功只能由真实写入结果证明，打开面板、发出请求或没有抛错都不等于成功。
3. 双方都修改时默认暂停；没有可靠基线时不猜赢家。
4. 先保证可升级、可回滚、可恢复，再增加自动化。
5. 每新增一个生产实体，必须证明现有模块无法承担该职责。

## Current Baseline

- Obsidian 可维护源码：`packages/ob-plugin/`，已对齐 `fs-TB 3.4.0`。
- Obsidian 已核验运行归档：`releases/obsidian-fs-TB/3.2.1/`，插件 ID `fs-TB`；其 `main.js` 内嵌完整 source map 和原始源码。
- 浏览器可维护源码：`extension/`，已对齐 KnowFlow `3.4.0`。
- 浏览器已核验运行归档：`releases/browser-feishu-doc-exporter/0.3.0/`；它是独立旧产品，不宣称可原位升级成 KnowFlow。
- 当前自动测试只覆盖部分共享协议；浏览器和 Obsidian 业务逻辑缺少正式测试门禁。

## Version Plan

| 版本 | 单一目标 | 不包含 |
|---|---|---|
| `3.2.2` | 恢复真实 3.2.1 能力、统一身份/协议/设置迁移、建立测试基线 | 新产品功能 |
| `3.3.0` | 唯一绑定、幂等、并发锁、路径安全 | 冲突 UI、自动远端删除 |
| `3.4.0` | 三方冲突判断、覆盖前恢复副本、失败不推进状态 | AI 合并、版本数据库 |
| `3.5.0` | 浏览器可信事务、真实成功状态、秘密本地化、最小权限 | 新框架、第二套消息总线 |
| `3.6.0` | 安全删除、持久活动、HTTP/CLI 加固、最小健康视图 | 自动远端删除、后台全库同步 |
| `4.0.0` | 单一同步中心、升级/回滚/E2E/灾难测试收口 | 知识图谱、向量库、CRDT、多 Vault |

## 4.0 Invariants

- 同一个 `feishu_id` 最多绑定一个本地文件；重复绑定必须显式报冲突。
- Pull/Pushback 在双方都变更时不得覆盖任何一方。
- 相同 `requestId` 重放不得产生第二个文件、第二次编码或第二次远端写入。
- 临时文件必须按操作隔离，成功或失败都清理。
- 浏览器显示成功前必须收到真实 `/fetch` 或 `/pushback` 终态和最终路径。
- Token、API Key、登录凭据不得进入 `chrome.storage.sync`、日志或导出数据。
- 本地删除只进入待确认；默认不携带 `--include-children` 或隐式 `--yes`。
- 组件协议不兼容时禁用写操作，并明确提示需要升级哪一端。
- 所有发布产物必须能追溯到同一 commit、版本和 SHA256 清单。

## Agent Boundaries

- Obsidian 实现 Agent 独占 `packages/ob-plugin/`。
- 浏览器实现 Agent 独占 `extension/`。
- 主线程负责 `packages/shared/`、版本集成和最终验收。
- 只有文件边界清晰、交接成本低于并行收益时才并行；禁止两个实现 Agent 同时修改共享文件。
- 每项代码变更依次经过 TDD、规格审查、质量审查和对抗审查。

## Validation Gates

```bash
npm run test
npm run build
git diff --check
git status --short
```

4.0 额外要求真实执行：旧版升级、回滚、飞书 Pull、Obsidian Pushback、双端冲突、并发重放、CLI 缺失/过期、端口占用、Token 错误、MV3 Service Worker 被终止和状态文件损坏恢复。

## Status

- [x] 当前状态与版本分叉核验
- [x] 4.0 第一性原理和非目标确定
- [x] Murphy 对抗风险矩阵完成
- [x] `3.2.2`
- [x] `3.3.0`
- [x] `3.4.0`
- [ ] `3.5.0`
- [ ] `3.6.0`
- [ ] `4.0.0`
