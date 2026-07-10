# KnowFlow / fs-TB 版本索引

本文件记录从当前机器与 Mac mini 核验到的最新可运行版本。源码开发线仍在本仓库根目录；`releases/` 保存已经在真实环境中出现过的运行产物，便于 Git/GitHub 版本管理和回滚。

## 当前最新版本

| 组件 | 最新版本 | 仓库内地址 | 来源与核验 |
|---|---:|---|---|
| Obsidian 插件 `fs-TB` | `3.2.1` | `releases/obsidian-fs-TB/3.2.1/` | 来自 Mac mini `/Users/tangtang/Desktop/Obsidian-fs-TB-3.2.1`；与 Mac mini vault 运行目录 `/Users/tangtang/Documents/04_📚_石柯然知识库/.obsidian/plugins/fs-TB` 的 `main.js` 和 `manifest.json` 哈希一致。 |
| 浏览器插件 `Feishu Doc Exporter` | `0.3.0` | `releases/browser-feishu-doc-exporter/0.3.0/` | 来自 Mac mini Chrome 已安装扩展 `binjgfnbkdfeknemgcidljibfjkjmcjp/0.3.0_0`；只保存运行文件，不保存 Chrome `_metadata`。 |

## GitHub 地址

- 仓库：`https://github.com/tangzi-kk/knowflow`
- 最新运行产物在仓库内：
  - Obsidian 插件：`releases/obsidian-fs-TB/3.2.1/`
  - 浏览器插件：`releases/browser-feishu-doc-exporter/0.3.0/`

## 安装入口

### Obsidian 插件 3.2.1

将以下文件放入目标 vault 的 `.obsidian/plugins/fs-TB/`，保留用户自己的 `data.json`：

```text
releases/obsidian-fs-TB/3.2.1/main.js
releases/obsidian-fs-TB/3.2.1/manifest.json
releases/obsidian-fs-TB/3.2.1/styles.css
```

### 浏览器插件 0.3.0

Chrome/Edge 开发者模式加载目录：

```text
releases/browser-feishu-doc-exporter/0.3.0/
```

不要加载 Chrome 运行目录中的 `_metadata`，本仓库没有保存该目录。

## 校验

每个版本目录都带 `SHA256SUMS`：

```bash
cd releases/obsidian-fs-TB/3.2.1
shasum -a 256 -c SHA256SUMS

cd ../../browser-feishu-doc-exporter/0.3.0
shasum -a 256 -c SHA256SUMS
```
