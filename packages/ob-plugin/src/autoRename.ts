/**
 * auto-rename 编码分配。依据 `26_0509_S_08_a4b10 三种编码模式实现说明.md`
 * + `知识库自动打标协议边界.md` + `02_YAML字段规范.md` §2.3。
 *
 * 编码格式：YY_MMDD_标签_序号[_子序号]
 *   - 文件：舒展型 S_01（标签_序号 用下划线）
 *   - 文件夹：紧凑型 S01（标签序号 无下划线）
 *
 * 标签体系（6 类，含补全的 Q 灵气）：
 *   S=收集  X=项目  L=领域  Z=资源  Q=灵感  J=技能
 *
 * 触发：fetch 落地后、右键菜单、ribbon 批量。
 */
import type { App, TFile, TFolder } from 'obsidian';
import { parseFrontmatter, serializeFrontmatter, assembleFile, type Tag } from '@sync/shared';

/** 标签 → 目录映射（依据 01_对比报告.md 的目录路由规则）。 */
const TAG_BY_DIR_HINT: Record<string, Tag> = {
  '0️⃣输入': 'S',
  '1️⃣输出': 'X',
  '2️⃣🗃知识池': 'Z',
};

/** 编码正则：YY_MMDD_T_NN[_aN]。 */
const CODE_RE = /^(\d{2})_(\d{4})_([SXSLZQJ])_(\d+)(?:_([a-z]\d+))?$/;

/**
 * 从文件所在目录推导标签。
 * 优先级：YAML 标签字段 > 目录前缀 > 默认 S。
 */
function inferTag(dir: string, existingTag?: Tag): Tag {
  if (existingTag && ['S', 'X', 'L', 'Z', 'Q', 'J'].includes(existingTag)) {
    return existingTag;
  }
  for (const [dirHint, tag] of Object.entries(TAG_BY_DIR_HINT)) {
    if (dir.startsWith(dirHint)) return tag;
  }
  // 知识池下的子目录可能进一步细分
  if (dir.includes('知识池') || dir.includes('🗃')) {
    // 资源类默认 Z，可被目录名覆盖
    if (dir.includes('L') || dir.includes('领域')) return 'L';
    if (dir.includes('Q') || dir.includes('灵感')) return 'Q';
    if (dir.includes('J') || dir.includes('技能')) return 'J';
    return 'Z';
  }
  if (dir.includes('输出') || dir.includes('1️⃣')) return 'X';
  if (dir.includes('输入') || dir.includes('0️⃣')) return 'S';
  return 'S';
}

/**
 * 扫描同目录下同标签的最大序号，分配新序号。
 */
async function nextSequence(app: App, dir: string, tag: Tag): Promise<number> {
  const folder = app.vault.getAbstractFileByPath(dir);
  if (!(folder instanceof TFolder)) return 1;

  let maxSeq = 0;
  for (const child of folder.children) {
    if (!(child instanceof TFile) || !child.name.endsWith('.md')) continue;
    const match = child.name.match(CODE_RE);
    if (match && match[3] === tag) {
      const seq = parseInt(match[4], 10);
      if (seq > maxSeq) maxSeq = seq;
    }
    // 也匹配无前缀但有 YAML 编码的情况
    if (!match) {
      try {
        const content = await app.vault.read(child);
        const { frontmatter } = parseFrontmatter(content);
        const enc = frontmatter?.编码 as string | undefined;
        if (enc) {
          const encMatch = enc.match(CODE_RE);
          if (encMatch && encMatch[3] === tag) {
            const seq = parseInt(encMatch[4], 10);
            if (seq > maxSeq) maxSeq = seq;
          }
        }
      } catch {
        continue;
      }
    }
  }
  return maxSeq + 1;
}

/**
 * 为文件分配编码。
 * - 生成 YY_MMDD_T_NN 格式
 * - 重命名文件（加编码前缀）
 * - 写回 YAML 编码字段
 *
 * @returns 分配到的编码串，如 "26_0615_S_01"
 */
export async function assignEncoding(
  app: App,
  filePath: string,
  dir: string,
): Promise<string | undefined> {
  const file = app.vault.getAbstractFileByPath(filePath);
  if (!(file instanceof TFile)) return undefined;

  const content = await app.vault.read(file);
  const { frontmatter, body } = parseFrontmatter(content);
  const fm = frontmatter ?? {};

  // 已有编码就跳过
  if (fm.编码 && CODE_RE.test(fm.编码 as string)) {
    return fm.编码 as string;
  }

  // 推导标签 + 序号
  const tag = inferTag(dir, fm.标签 as Tag | undefined);
  const seq = await nextSequence(app, dir, tag);

  // 生成编码
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const code = `${yy}_${mmdd}_${tag}_${String(seq).padStart(2, '0')}`;

  // 写回 YAML
  const newFm = { ...fm, 标签: tag, 编码: code };
  const newContent = assembleFile(newFm, body);
  await app.vault.modify(file, newContent);

  // 重命名文件（加编码前缀）
  const ext = file.extension;
  const oldName = file.basename;
  const newName = `${code} ${oldName}`;
  const newPath = filePath.replace(/[^/]+$/, `${newName}.${ext}`);
  if (newPath !== filePath) {
    try {
      await app.vault.rename(file, newPath);
    } catch (err) {
      console.warn('[sync/autoRename] rename failed:', err);
    }
  }

  return code;
}

/**
 * 批量分配编码（ribbon 触发）。
 */
export async function batchAssignEncoding(app: App, dir: string): Promise<{ total: number; assigned: number }> {
  const folder = app.vault.getAbstractFileByPath(dir);
  if (!(folder instanceof TFolder)) return { total: 0, assigned: 0 };

  let assigned = 0;
  let total = 0;
  for (const child of folder.children) {
    if (!(child instanceof TFile) || !child.name.endsWith('.md')) continue;
    total++;
    try {
      const result = await assignEncoding(app, child.path, dir);
      if (result) assigned++;
    } catch (err) {
      console.warn(`[sync/autoRename] batch failed for ${child.path}:`, err);
    }
  }
  return { total, assigned };
}

/**
 * 解码：从文件名或 YAML 提取编码信息。
 */
export function decodeCode(code: string): {
  yy: string;
  mmdd: string;
  tag: Tag;
  seq: number;
  sub?: string;
} | null {
  const match = code.match(CODE_RE);
  if (!match) return null;
  return {
    yy: match[1],
    mmdd: match[2],
    tag: match[3] as Tag,
    seq: parseInt(match[4], 10),
    sub: match[5],
  };
}
