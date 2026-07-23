# KnowFlow / fs-TB 版本索引

本文件记录从当前机器与 Mac mini 核验到的最新可运行版本。源码开发线仍在本仓库根目录；`releases/` 保存已经在真实环境中出现过的运行产物，便于 Git/GitHub 版本管理和回滚。

## 当前发布

| 组件 | 版本 | 源码/产物 | 状态 |
|---|---:|---|---|
| Obsidian `fs-TB` | `4.0.2` | `artifacts/fs-TB-Obsidian-4.0.2.zip` | 恢复融合设置 UI 和安全编码流程，自动门禁与 SHA256 通过，已同步 GitHub，未安装到真实 Vault |
| 浏览器 `KnowFlow` | `4.0.2` | `artifacts/KnowFlow-Browser-4.0.2/`、同名 ZIP | AI Provider 路由和 Web 消息桥修复，自动门禁与 SHA256 通过，已同步 GitHub，未加载到真实 Chrome/Edge |

## 已核验运行归档

| 分类 | 组件 | 归档版本 | 仓库内地址 | 运行位置 | 来源与核验 |
|---|---|---:|---|---|---|
| Obsidian 插件 | `fs-TB` | `3.2.1` | `releases/obsidian-fs-TB/3.2.1/` | Obsidian vault 的 `.obsidian/plugins/fs-TB/` | 来自 Mac mini `/Users/tangtang/Desktop/Obsidian-fs-TB-3.2.1`；与 Mac mini vault 运行目录 `/Users/tangtang/Documents/04_📚_石柯然知识库/.obsidian/plugins/fs-TB` 的 `main.js` 和 `manifest.json` 哈希一致。 |
| 浏览器扩展 | `Feishu Doc Exporter` | `0.3.0` | `releases/browser-feishu-doc-exporter/0.3.0/` | Chrome/Edge 扩展管理页加载 | 来自 Mac mini Chrome 已安装扩展 `binjgfnbkdfeknemgcidljibfjkjmcjp/0.3.0_0`；只保存运行文件，不保存 Chrome `_metadata`。 |

## GitHub 地址

- 仓库：`https://github.com/tangzi-kk/knowflow`
- 当前 4.0.2 发布产物在仓库 `artifacts/` 内。
- `releases/` 中的 3.2.1 和 0.3.0 是历史真机归档，不是当前安装包。
- 人类阅读说明：`docs/human-guide.html`
- AI 接手说明：`docs/AI_HANDOFF.md`

## 安装入口

### Obsidian 插件 4.0.2

解压以下安装包，将其中 `fs-TB/` 放入目标 vault 的 `.obsidian/plugins/`，升级时保留用户自己的 `data.json`：

```text
artifacts/fs-TB-Obsidian-4.0.2.zip
```

### 浏览器插件 4.0.2

Chrome/Edge 开发者模式加载目录：

```text
artifacts/KnowFlow-Browser-4.0.2/
```

也可以先解压 `artifacts/KnowFlow-Browser-4.0.2.zip`。浏览器应选择解压后的目录，不能直接选择 ZIP。

## 校验

当前发布提供构建文件和安装包两级校验：

```bash
shasum -a 256 -c artifacts/KnowFlow-4.0.2-SHA256SUMS
(cd artifacts && shasum -a 256 -c KnowFlow-4.0.2-PACKAGES-SHA256SUMS)
```
