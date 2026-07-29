# KnowFlow 当前产品规格

当前稳定基线：`4.1.0`
本文档定义当前产品边界和安全不变量；历史版本方案保存在 `docs/history/`。

## 目标

KnowFlow 连接飞书与 Obsidian，让内容可靠落地、安全整理并可回写。任何捕获、整理或同步都必须产生真实、可解释、可恢复的终态。

## 权威顺序

1. 用户当前明确指令。
2. 本 `SPEC.md` 的当前规格和安全不变量。
3. `contracts/` 与 `packages/shared/` 中的协议实现。
4. `README.md`、`PROGRESS.md`、`VERSION_INDEX.md` 和 `docs/validation/4.1-acceptance.md` 的当前记录。
5. `docs/history/` 中的历史方案，仅用于追溯，不作为当前实现指令。

## 当前结构

- `packages/ob-plugin/`：Obsidian 正式源码。
- `extension/`：Chrome / Edge 正式源码。
- `packages/shared/`：双端共享协议与转换逻辑。
- `ui-prototype/`：UI 原型、视觉素材和样式历史，不是正式运行代码。
- `artifacts/`：当前发布产物与校验文件。
- `releases/`：已核验的历史真机运行归档。
- `docs/design/`：当前设计入口与有效决策。
- `docs/history/`：旧版方案、调研、任务书和验收记录。
- `需求池.md`：本地需求的唯一事实源；GitHub 用于备份和同步。

## 不变量

- 同一个 `feishu_id` 最多绑定一个本地文件；重复绑定必须显式报冲突。
- Pull / Pushback 在双方都变更时默认暂停，不猜测赢家。
- 相同 `requestId` 重放不得产生第二个文件、编码或远程写入。
- 浏览器显示成功前必须收到真实终态和最终路径。
- 采集只生成待确认 proposal；不静默编码、改名或回写。
- 批量写入必须预览、显式确认、备份、原子执行并可回滚。
- Token、API Key、Cookie、验证码和登录凭据不得进入同步存储、日志、需求截图或 GitHub。
- 本地删除只进入待确认；不默认远程删除、不默认包含子节点。
- 协议不兼容时禁用写操作，并明确提示需升级的组件。
- 所有发布产物必须可追溯到同一 commit、版本和 SHA256 清单。

## 需求与设计流程

1. 自然语言需求先进入 `需求池.md`，保留用户原话和截图。
2. 确认后再标记优先级、验收标准和影响组件。
3. UI 原型只验证交互和视觉，不直接覆盖 `extension/` 或 `packages/ob-plugin/`。
4. 实现后更新 `CHANGELOG.md`、必要的验收记录和需求状态。

## 验证门禁

```bash
npm run test
npm run build
git diff --check
git status --short
```

发布时另需执行 `npm run release:verify`、SHA256 校验，并将自动测试、真机验收、Git 提交和 GitHub Release 分开记录。

## 当前状态

- `4.1.0` 是当前稳定版；发布与真机记录见 `PROGRESS.md` 和 `docs/validation/4.1-acceptance.md`。
- 未完成的产品需求只在 `需求池.md` 维护，不再从历史设计文档的旧勾选状态推断。
