/**
 * POST /fetch — 飞书→OB 落地主链路。
 *
 * 依据 `00_同步方案设计_v2.md` §6.1：
 * 1. lark-cli docs +fetch --doc-format markdown → 正文 md
 * 2. lark-cli docs +fetch --doc-format xml --detail with-ids → file_token 列表 + callout 颜色 + docx obj_token
 * 3. 图片 authcode URL → feishu://TOKEN
 * 4. exists 检查：已有同 feishu_id → 更新分支；无 → 新建
 * 5. 组装 YAML（feishu_id/feishu_doc_id/feishu_title/sync_time）+ 正文
 * 6. 文件名 = 安全清洗(feishu_title)，写入 dir
 * 7. auto-rename 触发编码 → 写回文件名 + YAML 编码
 * 8. 计算 sync_hash，写 sync_time
 * 9. 返回落地路径
 */
import type { FetchRequest, FetchResponse } from '@sync/shared';
import { App, TFile, TFolder } from 'obsidian';
import type { RequestContext } from '../server.js';
import type { FeishuSyncSettings, PluginState } from '../settings.js';
import {
  parseFile,
  buildInitialFrontmatter,
  mergeFrontmatterForUpdate,
  assembleMd,
  makeFilename,
  makePath,
} from '../fileio/writer.js';
import { assignEncoding } from '../autoRename.js';
import { findUniqueVaultBinding } from '../vaultBinding.js';
import { normalizeVaultDir, normalizeVaultMarkdownPath } from '../vaultPath.js';
import { assertReplacementBinding } from '../bindingIndex.js';
import { fetchRemoteDocument } from '../remoteDocument.js';
import { decideThreeWaySync, planSyncExecution } from '../syncDecision.js';
import { createRecoverySnapshot } from '../recovery.js';

export interface FetchDeps {
  app: App;
  settings: FeishuSyncSettings;
  state: PluginState;
  notice: (msg: string) => void;
}

export function createFetchHandler(deps: FetchDeps) {
  return async (ctx: RequestContext): Promise<FetchResponse> => {
    const req = ctx.body as FetchRequest;
    if (!req?.node_token) {
      const e = new Error('node_token is required') as Error & { code: string; status: number };
      e.code = 'MISSING_TOKEN';
      e.status = 400;
      throw e;
    }

    const { node_token, space_id, dir } = req;
    const settings = deps.settings;
    const targetDir = normalizeVaultDir(dir ?? settings.defaultDir);
    const replacePath = req.replace_path
      ? normalizeVaultMarkdownPath(req.replace_path)
      : undefined;

    deps.notice(`⬇ 同步飞书文档 ${node_token.slice(0, 8)}...`);

    const remote = fetchRemoteDocument({
      nodeToken: node_token,
      spaceId: space_id,
      objToken: req.obj_token,
    });

    // 步骤 2.5：从飞书头部 callout 解析元数据（标签/编码/输入/日期/关键词/评分/索引）
    // 这些字段会写进 YAML frontmatter；正文 callout 保留不动（步骤 3.5 转 OB callout）
    const meta = {
      ...remote.meta,
      ...(req.meta ?? {}),
    };
    if (Object.keys(meta).length > 0) {
      deps.notice(`📋 提取到 ${Object.keys(meta).length} 个元数据字段`);
    }

    const processedMd = remote.body;
    const objToken = remote.objToken;
    const feishuTitle = remote.title;

    // 步骤 4：exists 检查
    const existingFile = await findUniqueVaultBinding(deps.app, node_token);
    const syncTime = new Date().toISOString();
    let action: 'created' | 'updated';
    let finalPath: string;
    let encoding: string | undefined;

    if (existingFile) {
      // 更新分支：保留用户改的元数据，只刷正文 + 绑定字段
      action = 'updated';
      const existing = await deps.app.vault.read(existingFile);
      const parsed = parseFile(existing);
      finalPath = existingFile.path;
      const decision = decideThreeWaySync({
        baseHash: parsed.frontmatter.sync_hash as string | undefined,
        localHash: parsed.hash,
        remoteHash: remote.hash,
      });
      const execution = planSyncExecution('pull', decision);
      if (execution !== 'skip') {
        const merged = mergeFrontmatterForUpdate(
          parsed.frontmatter,
          node_token,
          objToken,
          feishuTitle,
          syncTime,
          meta,
        );
        const content = assembleMd(merged, processedMd);
        await createRecoverySnapshot(deps.app.vault.adapter, {
          originalPath: existingFile.path,
          content: existing,
          source: 'local',
        });
        await deps.app.vault.modify(existingFile, content);
        deps.notice(`✏ 已更新 ${existingFile.name}`);
      } else {
        deps.notice(`⏭ 无变化 ${existingFile.name}`);
      }
    } else {
      // 新建分支
      action = 'created';
      const filename = makeFilename(feishuTitle, req.filename);
      const relativePath = makePath(targetDir, filename);

      // 确保目录存在
      await ensureFolder(deps.app, targetDir);

      const fm = buildInitialFrontmatter(node_token, objToken, feishuTitle, syncTime, meta);
      const content = assembleMd(fm, processedMd);

      // 检查文件是否已存在（同名不同 feishu_id）
      const replaceFile = replacePath
        ? deps.app.vault.getAbstractFileByPath(replacePath)
        : null;
      const existing = deps.app.vault.getAbstractFileByPath(relativePath);
      if (replaceFile instanceof TFile) {
        const replacementContent = await deps.app.vault.read(replaceFile);
        assertReplacementBinding(replacementContent, node_token, replaceFile.path);
        await createRecoverySnapshot(deps.app.vault.adapter, {
          originalPath: replaceFile.path,
          content: replacementContent,
          source: 'local',
        });
        await deps.app.vault.modify(replaceFile, content);
        finalPath = replaceFile.path;
        action = 'updated';
      } else if (existing instanceof TFile) {
        // 同名冲突：加后缀
        const conflictPath = makePath(targetDir, `${filename.replace(/\.md$/, '')}-${node_token.slice(0, 6)}.md`);
        await deps.app.vault.create(conflictPath, content);
        finalPath = conflictPath;
      } else {
        const created = await deps.app.vault.create(relativePath, content);
        finalPath = created.path;
      }

      deps.notice(`✅ 已创建 ${filename}`);

      // 步骤 7：auto-rename 编码分配
      if (settings.autoRename) {
        try {
          encoding = await assignEncoding(deps.app, finalPath, targetDir);
          if (encoding) {
            deps.notice(`🔢 编码：${encoding}`);
          }
        } catch (err) {
          console.warn('[sync/fetch] auto-rename failed:', err);
          deps.notice(`⚠ 文档已创建，但自动编码失败：${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    return {
      ok: true,
      path: finalPath,
      filename: finalPath.split('/').pop() ?? '',
      action,
      编码: encoding,
      feishu_title: feishuTitle,
    };
  };
}

/**
 * 确保目录存在（递归创建）。
 */
async function ensureFolder(app: App, dir: string): Promise<void> {
  if (!dir || dir === '.' || dir === '/') return;
  const existing = app.vault.getAbstractFileByPath(dir);
  if (existing instanceof TFolder) return;
  try {
    await app.vault.createFolder(dir);
  } catch {
    // 可能父目录也不存在，递归
    const parent = dir.split('/').slice(0, -1).join('/');
    if (parent) await ensureFolder(app, parent);
    try {
      await app.vault.createFolder(dir);
    } catch {
      // 已存在或其他错误，忽略
    }
  }
}
