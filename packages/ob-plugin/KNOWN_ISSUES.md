# 已知坑清单

> 来源：`设计方案/03_飞书文档格式规范与OB映射.md` §十，已在代码中处理。

## 1. overwrite 后标题变 "Untitled"

**原因**：`docs +update --command overwrite` 会清空整个文档，包括 title block。

**处理**（`lark/cli.ts` `overwriteDoc` / `overwriteDocXml`）：overwrite 后追加一次 `str_replace`，用 `block_type: 1`（page）重写标题。

## 2. emoji 带 U+FE0F variation selector 飞书不认

**现象**：`🏷️`（U+1F3F7 + U+FE0F）写入后飞书显示默认 💡。

**处理**（`shared/callout.ts` `stripVariationSelectors`）：写入飞书前移除所有 U+FE0F。OB 侧保留 VS（OB 原生支持），仅在往返飞书时清洗。

## 3. 波浪号 `~` 被转义成 `\~`

**原因**：飞书 md 把 `~` 转义（因为 `~~` 是删除线）。

**处理**（`shared/callout.ts` `unescapeFeishuTilde` + `lark/cli.ts` run）：回读时反向 `str_replace` `\~` → `~`。

## 4. callout 颜色 md 导出丢失

**原因**：markdown 格式不保留 block 属性（背景色/边框色）。

**处理**（`fetchHandler`）：导出时同时抓 XML（`--doc-format xml --detail with-ids`），从 XML 拿 callout 颜色 + 图片 file_token。

## 5. 图片链接 OB 里裂

**原因**：md 导出的图片链接是 `internal-api-drive-stream.feishu.cn/.../authcode=...`，需飞书登录态 + authcode 1 小时过期。OB 没登录态 → 链接裂。

**处理**（`shared/image.ts` + `imageRender.ts`）：
- OB md 里图片写成 `![](feishu://FILE_TOKEN)`（FILE_TOKEN 永久不过期）
- 渲染时调 `lark-cli docs +media-download` 下载到 `.feishu-sync/cache/`，本地路径塞回 src
- LRU 缓存 + 周期清理

## 6. `lark-cli --content @file` 要相对路径

**原因**：绝对路径被 lark-cli 拒绝。

**处理**（`lark/cli.ts` run）：检测 `--content @xxx` 时，用 `execOpts.cwd` 设为文件所在目录，参数改为 `@./basename`。

## 7. node-list 输出含 "Found X node(s)" 前缀

**现象**：`wiki +node-list` 的 stdout 前面有日志行，直接 JSON.parse 失败。

**处理**（`lark/cli.ts` run，`json: true` 选项）：解析时跳到第一个 `{` 字符。

## 8. 旧版 doc 类型 API 不支持

**现象**：飞书旧版 `doc`（非 `docx`）API 返回 `code 3380002: Unsupported document type 'doc'`。

**处理**：fetch 失败时捕获错误，Notice 提示"该文档是旧版 doc，需在飞书手动迁移为 docx"。扫描场景应检测 `obj_type`。

## 9. 删除事件读不到已删文件内容

**原因**：OB 的 `vault.on('delete')` 回调里文件已不可读。

**处理**（`deleteRegistry.ts`）：当前实现是"主动登记"模式（`registerDeletion` 在文件仍可读时调用）。要支持"删除自动登记"，需在 `modify` 时缓存 feishu_id → path 映射到 `.feishu-sync/deleted-pending.json`，删除时从缓存读。这是已知 TODO。

## 10. CORS：扩展从飞书页面 fetch localhost 被拦

**处理**（`server.ts`）：响应头加 `Access-Control-Allow-Origin: *` + `Access-Control-Allow-Headers: X-Sync-Token, Content-Type`，处理 OPTIONS 预检。
