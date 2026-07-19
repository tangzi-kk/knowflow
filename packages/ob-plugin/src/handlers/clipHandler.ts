/**
 * POST /clip — 任意网页/划词剪存到 Obsidian。
 *
 * MVP 决策：
 * - 不绑定 feishu_id，避免把普通网页伪装成飞书同步文件。
 * - 写入插件默认目录或请求传入目录。
 * - 使用知识库字段预设填充基础 YAML，编码仍交给 auto-rename。
 */
import { assembleFile, type ClipRequest, type ClipResponse } from '@sync/shared';
import { App, TFile, TFolder } from 'obsidian';
import type { RequestContext } from '../server.js';
import type { FeishuSyncSettings } from '../settings.js';
import { makeFilename, makePath } from '../fileio/writer.js';
import { assignEncoding } from '../autoRename.js';

export interface ClipDeps {
  app: App;
  settings: FeishuSyncSettings;
  notice: (msg: string) => void;
}

export function createClipHandler(deps: ClipDeps) {
  return async (ctx: RequestContext): Promise<ClipResponse> => {
    const req = (ctx.body ?? {}) as ClipRequest;
    const title = cleanText(req.title) || '网页剪藏';
    const url = cleanText(req.url);
    const text = cleanText(req.text);
    const rawText = cleanText(req.rawText) || text;
    const bodyMarkdown = cleanText(req.bodyMarkdown);
    const description = cleanText(req.description);
    const sourceKind = cleanText(req.sourceKind) || 'generic-page';
    const appendPath = cleanPath(req.appendPath);
    if (!url && !text && !bodyMarkdown && !rawText) {
      const e = new Error('url or text is required') as Error & { code: string; status: number };
      e.code = 'MISSING_CLIP_CONTENT';
      e.status = 400;
      throw e;
    }

    const createdAt = new Date();
    const targetDir = cleanDir(req.dir) || deps.settings.defaultDir;
    const meta = normalizeClipMeta(req.meta, {
      title,
      url,
      text: rawText || bodyMarkdown || text,
      description,
      dir: targetDir,
      date: formatDate(createdAt),
    });

    const contentInput = {
      title,
      url,
      text,
      rawText,
      bodyMarkdown,
      description,
      dir: targetDir,
      meta,
      sourceKind,
      date: formatDate(createdAt),
      createdAt: createdAt.toISOString(),
    };

    if (appendPath) {
      const target = deps.app.vault.getAbstractFileByPath(appendPath);
      if (!(target instanceof TFile)) {
        const e = new Error(`补充目标文件不存在：${appendPath}`) as Error & { code: string; status: number };
        e.code = 'APPEND_TARGET_NOT_FOUND';
        e.status = 404;
        throw e;
      }
      const current = await deps.app.vault.read(target);
      const appendix = buildAppendMarkdown(contentInput);
      await deps.app.vault.modify(target, `${current.replace(/\s*$/, '')}\n\n${appendix}\n`);
      deps.notice(`📝 已补充到 ${appendPath}`);
      return {
        ok: true,
        path: target.path,
        filename: target.name,
        action: 'updated',
      };
    }

    await ensureFolder(deps.app, targetDir);

    const filename = makeFilename(title);
    let finalPath = makePath(targetDir, filename);
    const existing = deps.app.vault.getAbstractFileByPath(finalPath);
    if (existing instanceof TFile) {
      finalPath = makePath(targetDir, `${filename.replace(/\.md$/, '')}-${Date.now().toString(36)}.md`);
    }

    const content = buildClipMarkdown(contentInput);

    await deps.app.vault.create(finalPath, content);
    deps.notice(`📎 已剪存 ${title}`);

    if (deps.settings.autoRename) {
      try {
        await assignEncoding(deps.app, finalPath, targetDir);
      } catch (err) {
        console.warn('[sync/clip] auto-rename failed:', err);
      }
    }

    return {
      ok: true,
      path: finalPath,
      filename: finalPath.split('/').pop() ?? filename,
      action: 'created',
    };
  };
}

function buildClipMarkdown(input: {
  title: string;
  url: string;
  text: string;
  rawText: string;
  bodyMarkdown: string;
  description: string;
  dir: string;
  meta: Record<string, unknown>;
  sourceKind: string;
  date: string;
  createdAt: string;
}): string {
  const bodyContent = normalizeMarkdownBody(input.bodyMarkdown || input.rawText || input.text || input.description);
  const body = [
    `# ${input.title}`,
    '',
    input.url ? `> 来源：${input.url}` : '',
    `> 类型：${input.sourceKind}`,
    `> 剪存时间：${input.createdAt}`,
    '',
    bodyContent,
    '',
  ].filter((line, index, arr) => line || arr[index - 1] !== '').join('\n');

  return assembleFile(input.meta, body);
}

function buildAppendMarkdown(input: {
  title: string;
  url: string;
  text: string;
  rawText: string;
  bodyMarkdown: string;
  description: string;
  sourceKind: string;
  createdAt: string;
}): string {
  const bodyContent = normalizeMarkdownBody(input.bodyMarkdown || input.rawText || input.text || input.description);
  return [
    `## ${input.title}`,
    '',
    input.url ? `> 来源：${input.url}` : '',
    `> 类型：${input.sourceKind}`,
    `> 补充时间：${input.createdAt}`,
    '',
    bodyContent,
  ].filter((line, index, arr) => line || arr[index - 1] !== '').join('\n');
}

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanDir(value: unknown): string {
  return cleanText(value).replace(/^\/+|\/+$/g, '');
}

function cleanPath(value: unknown): string {
  const raw = cleanDir(value);
  if (!raw) return '';
  return raw.endsWith('.md') ? raw : `${raw}.md`;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function normalizeClipMeta(meta: unknown, fallback: {
  title: string;
  url: string;
  text: string;
  description: string;
  dir: string;
  date: string;
}): Record<string, unknown> {
  const input = meta && typeof meta === 'object' && !Array.isArray(meta) ? meta as Record<string, unknown> : {};
  const score = normalizeScore(input.评分);
  const out: Record<string, unknown> = {
    标签: normalizeTag(input.标签),
    编码: '',
    输入: cleanText(input.输入) || fallback.dir || fallback.url,
    日期: normalizeDate(input.日期, fallback.date),
    日期索引: normalizeList(input.日期索引),
    关键词: cleanText(input.关键词) || draftKeywords(`${fallback.title} ${fallback.description} ${fallback.text}`),
    概述: cleanText(input.概述) || fallback.description || `从网页剪存并转换：${fallback.title}`,
    评分: score,
    评分_显示: cleanText(input.评分_显示) || scoreLabel(score),
    索引_知识库: cleanText(input.索引_知识库),
    索引_颜色: cleanText(input.索引_颜色),
    '索引_操作&反馈': normalizeList(input['索引_操作&反馈']),
    索引_块: normalizeList(input.索引_块),
    索引_风险: normalizeList(input.索引_风险),
  };
  if (!out.关键词) out.关键词 = '网页剪存';
  if (!out.概述) out.概述 = `网页剪存：${fallback.title}`;
  return out;
}

function normalizeTag(value: unknown): string {
  const raw = cleanText(value);
  return raw.match(/^[SXLZQJ]$/) ? raw : raw.match(/([SXLZQJ])(?:_|$)/)?.[1] || 'S';
}

function normalizeDate(value: unknown, fallback: string): string {
  const raw = cleanText(value).replace(/\//g, '-');
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : fallback;
}

function normalizeScore(value: unknown): number {
  const raw = cleanText(value);
  const explicit = raw.match(/[1-5]/)?.[0];
  if (explicit) return Number(explicit);
  const stars = Array.from(raw.matchAll(/🌟/g)).length;
  return stars > 0 ? Math.min(stars, 5) : 1;
}

function scoreLabel(score: number): string {
  return ['🌟·素材', '🌟🌟·整理', '🌟🌟🌟·实践', '🌟🌟🌟🌟·通用', '🌟🌟🌟🌟🌟·体系'][Math.max(1, Math.min(score, 5)) - 1];
}

function normalizeList(value: unknown): string[] {
  const source = Array.isArray(value) ? value : cleanText(value).split(/[\n,，、]/);
  return source.map((item) => cleanText(item)).filter(Boolean);
}

function normalizeMarkdownBody(value: string): string {
  const text = value.trim();
  if (!text) return '（无可见正文，已保存页面标题和来源。）';
  return text;
}

function draftKeywords(text: string): string {
  const words = Array.from(new Set(
    text
      .replace(/[^\p{Script=Han}\p{Letter}\p{Number}\s_-]/gu, ' ')
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length >= 2 && word.length <= 20),
  ));
  return words.slice(0, 6).join('、');
}

async function ensureFolder(app: App, dir: string): Promise<void> {
  if (!dir || dir === '.' || dir === '/') return;
  const existing = app.vault.getAbstractFileByPath(dir);
  if (existing instanceof TFolder) return;
  const parent = dir.split('/').slice(0, -1).join('/');
  if (parent) await ensureFolder(app, parent);
  try {
    await app.vault.createFolder(dir);
  } catch {
    // 已存在或由其他流程刚创建时忽略。
  }
}
