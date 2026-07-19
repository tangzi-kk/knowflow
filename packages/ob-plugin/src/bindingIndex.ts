export interface BindingEntry {
  path: string;
  content: string;
}

class BindingConflictError extends Error {
  code = 'BINDING_CONFLICT';
  status = 409;
}

export function extractFeishuId(content: string): string | null {
  const normalized = content.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const frontmatter = normalized.match(/^---[ \t]*\n([\s\S]*?)\n---(?:\n|$)/)?.[1];
  if (!frontmatter) return null;
  const match = frontmatter.match(/^feishu_id[ \t]*:[ \t]*(?:"([A-Za-z0-9_-]+)"|'([A-Za-z0-9_-]+)'|([A-Za-z0-9_-]+))[ \t]*$/m);
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

export function findUniqueBinding<T extends BindingEntry>(feishuId: string, entries: readonly T[]): T | null {
  const matches = entries.filter((entry) => {
    const root = entry.path.split('/')[0].toLowerCase();
    if (root === '.obsidian' || root === '.feishu-sync') return false;
    return extractFeishuId(entry.content) === feishuId;
  });
  if (matches.length > 1) {
    const paths = matches.map((entry) => entry.path).sort();
    throw new BindingConflictError(`Multiple local files bind feishu_id ${feishuId}: ${paths.join(', ')}`);
  }
  return matches[0] ?? null;
}

export function assertReplacementBinding(content: string, expectedFeishuId: string, path: string): void {
  const existingFeishuId = extractFeishuId(content);
  if (existingFeishuId && existingFeishuId !== expectedFeishuId) {
    const error = new BindingConflictError(
      `Refusing to replace ${path}; it is bound to another feishu_id`,
    );
    error.code = 'REPLACEMENT_BINDING_CONFLICT';
    throw error;
  }
}
