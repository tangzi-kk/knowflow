# feishu-sync — Obsidian 插件（模块 B）

飞书 ↔ Obsidian 知识库同步闭环的 OB 端。接收浏览器扩展推送的飞书文档、落地为 md、管理 YAML、回写飞书。

## 安装（开发模式）

```bash
# 1. 在 sync-plugin 根目录构建
cd sync-plugin
npm install
npm run build

# 2. 把 packages/ob-plugin 软链到 vault 插件目录
ln -s "$(pwd)/packages/ob-plugin" "/path/to/vault/.obsidian/plugins/feishu-sync"

# 3. Obsidian → 设置 → 第三方插件 → 关闭安全模式 → 启用"飞书同步"
```

> 软链后 OB 会读取 `manifest.json` + `main.js` + `styles.css`。改代码后 `npm run build -w @sync/ob-plugin` 重新构建，再到 OB 设置里"重新加载插件"。

## 前置要求

- Obsidian ≥ 1.5（桌面端）
- lark-cli ≥ 1.0.52，已登录飞书账号（`lark-cli login`）
  - 自动探测路径：`LARK_CLI_BIN` 环境变量 → `larksuite-cli` → `lark-cli` → `~/.local/bin/lark-cli` → nvm/homebrew 路径
  - 探测失败可在设置页手动填绝对路径

## 配置

启用插件后，到 **设置 → 飞书同步**：

1. **本地端口**：默认 4567（与浏览器扩展对接）
2. **启动令牌**：点"复制"，粘贴到浏览器扩展弹窗
3. **lark-cli 路径**：留空自动探测；点"测试"确认版本
4. **默认落地目录**：飞书文档默认落地处（默认 `0️⃣输入`）
5. **自动识别并编码**：新建或修改 Markdown 后自动识别、分配完整编码并写入；界面与文件名默认显示短编码，异常项从文件树右键进入纠错面板
6. **知识库 space_id**：目录映射用；新安装留空，填写后再点“刷新映射”

## 命令（命令面板搜"飞书"）

| 命令 | 作用 |
|------|------|
| 回写当前文件到飞书 | 把当前 md 的 YAML 转成 callout + 正文回写飞书 |
| 批量回写当前目录到飞书 | 回写当前文件所在目录的全部 md |
| 自动识别并整理全库文档 | 递归扫描并自动提交安全项，异常项提示右键修正 |
| 检查并纠正当前目录… | 当前目录（含子目录）进入纠错面板 |
| 刷新目录映射（OB→飞书） | 重新推导 OB 根目录 → 飞书顶级节点映射 |
| 显示启动令牌 | 弹窗显示 + 复制令牌 |
| 显示最近同步记录 | 最近 10 条同步日志 |

## 数据流

```
浏览器扩展点"同步到OB"
   │ POST /fetch {node_token, dir}
   ▼
OB 插件：
  1. lark-cli docs +fetch --doc-format markdown  → 正文 md
  2. lark-cli docs +fetch --doc-format xml        → 图片 file_token + callout 颜色
  3. 图片 authcode URL → feishu://TOKEN
  4. 飞书正文 callout → OB callout
  5. 写入 vault（YAML frontmatter + 正文）
  6. 返回落地路径与待确认 proposal；本地自动编码只监听 Markdown 变化

用户可在 Ribbon 中执行“自动识别并整理全库文档”，插件会自动提交安全项；异常项用文件树右键手动修正。飞书拉取/剪藏 proposal 仍需确认。

编码约定：文件名和纠错面板默认显示短编码（如 `S01.a1`）；完整编码（如 `26_0726_S_01_a1`）仍写入 YAML `编码`、同步事件和索引，作为唯一性与后端交互的事实值。

OB 整理后，命令"回写当前文件到飞书"：
   │ POST /pushback
   ▼
OB 插件：
  1. hash 比对（无变化跳过）
  2. YAML 字段 → callout 信息块 XML
  3. 图片 feishu://TOKEN → <img src="TOKEN"/>
  4. OB callout → 飞书 callout XML
  5. lark-cli docs +update overwrite + 标题修复
```

## HTTP 端点（供扩展调用）

| 方法 | 路径 | 鉴权 | 用途 |
|------|------|:----:|------|
| GET | `/status` | 否 | 健康检查 + lark-cli 状态 |
| GET | `/tree` | 是 | vault 目录树（给扩展目录下拉） |
| POST | `/exists` | 是 | 检查 node_token 是否已同步 |
| POST | `/fetch` | 是 | 拉取飞书文档落地 OB |
| POST | `/pushback` | 是 | 回写飞书（通常命令触发） |

所有非 `/status` 请求需带 `X-Sync-Token` header。

## 数据存储

- vault 下 `.feishu-sync/`：插件配置目录
  - `mapping.json`：目录映射缓存
  - `cache/`：飞书图片预览缓存（按 cacheCleanup 周期清理）
- 插件设置存 OB 的 `data.json`（含 syncToken，勿泄露）

## 已知坑

见 `KNOWN_ISSUES.md`。
