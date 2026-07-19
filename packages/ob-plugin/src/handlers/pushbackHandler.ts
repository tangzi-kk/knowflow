/**
 * POST /pushback — OB→飞书回写。
 *
 * 依据 `00_同步方案设计_v2.md` §6.2：
 * 1. 读 .md 的 YAML，拿 feishu_doc_id + sync_hash
 * 2. 计算当前内容 hash，比对 sync_hash
 *    ├ 一致 → 跳过（无变化）
 *    └ 不一致 → 继续
 * 3. 解析正文 md + YAML
 * 4. YAML 字段 → callout XML 片段（文档头）
 * 5. 图片 feishu://token → 飞书 <img src="TOKEN"/>
 * 6. 组装最终内容 = [callout XML] + [正文 md]
 * 7. 调 lark-cli docs +update overwrite（XML 格式）
 * 8. 标题同步（已在 overwrite 时修复）
 * 9. 更新 sync_hash + sync_time
 */
import type { PushbackRequest, PushbackResponse } from '@sync/shared';
import {
  metaToCalloutXml,
  feishuProtoToXml,
  convertOBCalloutsToFeishu,
  isChanged,
} from '@sync/shared';
import { TFile, type App } from 'obsidian';
import type { RequestContext } from '../server.js';
import type { FeishuSyncSettings } from '../settings.js';
import { overwriteDocXml, getWikiNodeInfo } from '../lark/cli.js';
import { parseFile, assembleMd } from '../fileio/writer.js';
import { findUniqueVaultBinding } from '../vaultBinding.js';
import { normalizeVaultMarkdownPath } from '../vaultPath.js';

export interface PushbackDeps {
  app: App;
  settings: FeishuSyncSettings;
  notice: (msg: string) => void;
}

export function createPushbackHandler(deps: PushbackDeps) {
  return async (ctx: RequestContext): Promise<PushbackResponse> => {
    const req = ctx.body as PushbackRequest;

    // 定位文件
    let file: TFile | null = null;
    if (req.path) {
      const f = deps.app.vault.getAbstractFileByPath(normalizeVaultMarkdownPath(req.path));
      if (f instanceof TFile) file = f;
    } else if (req.node_token) {
      file = await findUniqueVaultBinding(deps.app, req.node_token);
    }

    if (!file) {
      const e = new Error('File not found') as Error & { code: string; status: number };
      e.code = 'NOT_FOUND';
      e.status = 404;
      throw e;
    }

    const content = await deps.app.vault.read(file);
    const parsed = parseFile(content);

    const feishuDocId = parsed.frontmatter.feishu_doc_id as string | undefined;
    const feishuId = parsed.frontmatter.feishu_id as string | undefined;
    const feishuTitle = parsed.frontmatter.feishu_title as string | undefined;

    // 解析回写用的 docToken（必须是 docx obj_token，node_token 不能直接用于 docs +update）
    let docToken = feishuDocId;
    if (!docToken && feishuId) {
      // feishu_doc_id 缺失：用 wiki +node-get 把 node_token 解析成 obj_token
      deps.notice('🔗 解析文档 token...');
      const info = getWikiNodeInfo(feishuId, deps.settings.spaceId);
      docToken = info?.obj_token;
      if (!docToken) {
        const e = new Error(`无法解析 obj_token（node_token=${feishuId.slice(0, 8)}...，检查 space_id 设置）`) as Error & { code: string; status: number };
        e.code = 'TOKEN_RESOLVE_FAILED';
        e.status = 400;
        throw e;
      }
      // 回写 feishu_doc_id 进 frontmatter（下次不用再解析）
      parsed.frontmatter.feishu_doc_id = docToken;
    }
    if (!docToken) {
      const e = new Error('No feishu binding in frontmatter') as Error & { code: string; status: number };
      e.code = 'NO_BINDING';
      e.status = 400;
      throw e;
    }
    const title = feishuTitle || file.basename;

    // 步骤 2：hash 比对
    if (!req.force && !isChanged(parsed.hash, parsed.frontmatter.sync_hash as string | undefined)) {
      return {
        ok: true,
        action: 'skipped',
        hash: parsed.hash,
        title,
      };
    }

    deps.notice(`⬆ 回写飞书 ${file.name}...`);

    // 步骤 3-6：组装最终 XML 内容
    const finalContent = buildPushbackContent(parsed);

    // 步骤 7-8：overwrite + 标题修复
    overwriteDocXml(docToken, finalContent, title);

    // 步骤 9：更新 sync_hash + sync_time
    const syncTime = new Date().toISOString();
    const updatedFm = {
      ...parsed.frontmatter,
      sync_hash: parsed.hash,
      sync_time: syncTime,
    };
    const newContent = assembleMd(updatedFm as never, parsed.body);
    await deps.app.vault.modify(file, newContent);

    deps.notice(`✅ 已回写 ${title}`);

    return {
      ok: true,
      action: 'pushed',
      hash: parsed.hash,
      title,
    };
  };
}

/**
 * 组装回写飞书的最终内容（XML 格式）。
 * = [YAML callout 信息块] + [正文（图片转 XML、OB callout 转 XML）]
 */
function buildPushbackContent(parsed: ReturnType<typeof parseFile>): string {
  const parts: string[] = [];

  // 1. YAML 元数据 → callout 信息块
  const calloutXml = metaToCalloutXml(parsed.frontmatter);
  if (calloutXml) {
    parts.push(calloutXml);
  }

  // 2. 正文处理
  let body = parsed.body;

  // 2a. 图片 feishu://token → <img src="TOKEN"/>
  body = feishuProtoToXml(body);

  // 2b. OB callout > [!type] → 飞书 callout XML
  body = convertOBCalloutsToFeishu(body);

  parts.push(body.trim());

  return parts.filter(Boolean).join('\n\n');
}
