/**
 * lark-cli 新版默认把 docs +fetch 包在 JSON envelope 中：
 * { ok, data: { document: { content, document_id, revision_id } } }
 *
 * 同步层只需要真实文档内容；wiki/base 等非 document JSON 必须保持原样。
 */
export function unwrapLarkEnvelope(stdout: string): string {
  const text = extractFirstJsonObject(stdout);
  if (!text) return stdout;

  try {
    const data = JSON.parse(text) as {
      data?: { document?: { content?: unknown } };
    };
    const content = data?.data?.document?.content;
    return typeof content === 'string' ? content : stdout;
  } catch {
    return stdout;
  }
}

function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
    } else if (ch === '{') {
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  return null;
}
