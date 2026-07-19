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
import { run, getWikiNodeInfo } from '../lark/cli.js';
import {
  extractImgTokensFromXml,
  convertFeishuCalloutsToOB,
  calloutXmlToMeta,
} from '@sync/shared';
import {
  parseFile,
  buildInitialFrontmatter,
  mergeFrontmatterForUpdate,
  assembleMd,
  processFeishuMd,
  makeFilename,
  makePath,
} from '../fileio/writer.js';
import { assignEncoding } from '../autoRename.js';

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
    const targetDir = dir ?? settings.defaultDir;

    deps.notice(`⬇ 同步飞书文档 ${node_token.slice(0, 8)}...`);

    // 步骤 1：拿正文 md
    let md: string;
    try {
      md = run(
        ['docs', '+fetch', '--doc', node_token, '--doc-format', 'markdown'],
        { timeout: 60000 },
      );
    } catch (err) {
      // node_token 可能是 wiki node，需先解析为 obj_token
      const info = space_id ? getWikiNodeInfo(node_token, space_id) : null;
      if (info?.obj_token) {
        md = run(
          ['docs', '+fetch', '--doc', info.obj_token, '--doc-format', 'markdown'],
          { timeout: 60000 },
        );
      } else {
        throw err;
      }
    }

    // 步骤 2：拿 XML（图片 token + callout 颜色 + docx obj_token）
    let xml = '';
    let objToken = req.obj_token ?? '';
    try {
      xml = run(
        ['docs', '+fetch', '--doc', node_token, '--doc-format', 'xml', '--detail', 'with-ids'],
        { timeout: 60000 },
      );
      if (!objToken) {
        // obj_token 在 XML 的 <title id="..."> 属性里（解包后的纯 XML 没有显式 obj_token 字段）
        const titleIdMatch = xml.match(/<title[^>]*\bid="([A-Za-z0-9]+)"/);
        if (titleIdMatch) objToken = titleIdMatch[1];
      }
    } catch (err) {
      console.warn('[sync/fetch] xml fetch failed (image tokens may be missing):', err);
    }

    // 步骤 2.5：从飞书头部 callout 解析元数据（标签/编码/输入/日期/关键词/评分/索引）
    // 这些字段会写进 YAML frontmatter；正文 callout 保留不动（步骤 3.5 转 OB callout）
    const meta = {
      ...(xml ? calloutXmlToMeta(xml) : {}),
      ...(req.meta ?? {}),
    };
    if (Object.keys(meta).length > 0) {
      deps.notice(`📋 提取到 ${Object.keys(meta).length} 个元数据字段`);
    }

    // 步骤 3：图片 token → feishu:// 协议
    const imgTokens = new Set(extractImgTokensFromXml(xml));
    let processedMd = processFeishuMd(md, imgTokens);

    // 步骤 3.5：飞书正文 callout XML → OB callout
    if (xml) {
      processedMd = convertFeishuCalloutsToOB(processedMd);
    }

    // 提取飞书标题（md 第一个 H1，或 fallback 到 node 信息）
    const titleMatch = processedMd.match(/^#\s+(.+)$/m);
    let feishuTitle = titleMatch?.[1]?.trim() ?? node_token;
    // 如果 md 里有 H1，从正文去掉（OB 文件 H1 保留，但避免重复——这里保留 H1 作为正文首行）
    // 决策：保留 H1，因为 OB 的文件名和 H1 可以不同

    // 步骤 4：exists 检查
    const existingFile = await findByFeishuId(deps.app, node_token);
    const syncTime = new Date().toISOString();
    let action: 'created' | 'updated';
    let finalPath: string;
    let encoding: string | undefined;

    if (existingFile) {
      // 更新分支：保留用户改的元数据，只刷正文 + 绑定字段
      action = 'updated';
      const existing = await deps.app.vault.read(existingFile);
      const parsed = parseFile(existing);
      const merged = mergeFrontmatterForUpdate(
        parsed.frontmatter,
        node_token,
        objToken,
        feishuTitle,
        syncTime,
        meta,
      );
      const content = assembleMd(merged, processedMd);
      await deps.app.vault.modify(existingFile, content);
      finalPath = existingFile.path;
      deps.notice(`✏ 已更新 ${existingFile.name}`);
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
      const replaceFile = req.replace_path
        ? deps.app.vault.getAbstractFileByPath(req.replace_path)
        : null;
      const existing = deps.app.vault.getAbstractFileByPath(relativePath);
      if (replaceFile instanceof TFile) {
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
        }
      }
    }

    // 记录最近同步
    deps.state.recentSyncs.unshift({
      time: syncTime,
      node_token,
      title: feishuTitle,
      path: finalPath,
      action,
    });
    if (deps.state.recentSyncs.length > 50) {
      deps.state.recentSyncs = deps.state.recentSyncs.slice(0, 50);
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
 * 按 feishu_id 查找已同步文件。
 * 扫描 vault 下所有 .md，解析 frontmatter 匹配 feishu_id。
 */
async function findByFeishuId(app: App, feishuId: string): Promise<TFile | null> {
  const files = app.vault.getMarkdownFiles();
  for (const file of files) {
    // 跳过插件目录
    if (file.path.startsWith('.obsidian') || file.path.startsWith('.feishu-sync')) continue;
    try {
      const content = await app.vault.read(file);
      // 快速检测：含 feishu_id 字段才解析
      if (!content.includes('feishu_id:')) continue;
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch) continue;
      const idMatch = fmMatch[1].match(/feishu_id:\s*["']?([A-Za-z0-9]+)/);
      if (idMatch && idMatch[1] === feishuId) {
        return file;
      }
    } catch {
      continue;
    }
  }
  return null;
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
