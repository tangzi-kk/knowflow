const MAX_PATH_BYTES = 1024;
const MAX_SEGMENT_BYTES = 255;
const INTERNAL_ROOTS = new Set(['.obsidian', '.feishu-sync']);

class ValidationError extends Error {
  code: string;
  status = 400;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function unsafePath(message: string): never {
  throw new ValidationError('UNSAFE_VAULT_PATH', message);
}

export function normalizeVaultDir(value: unknown): string {
  if (typeof value !== 'string') unsafePath('Vault path must be a string');
  const raw = value.trim();
  if (!raw) return '';
  if (raw.includes('\0')) unsafePath('Vault path contains NUL');
  if (/^(?:\/|\\|[A-Za-z]:)/.test(raw)) unsafePath('Absolute Vault paths are not allowed');
  if (/\\/.test(raw)) unsafePath('Backslash separators are not allowed');
  if (/%(?:2f|5c|00)/i.test(raw)) unsafePath('Encoded separators and NUL are not allowed');

  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    unsafePath('Vault path contains malformed percent encoding');
  }
  if (decoded.includes('\0') || decoded.includes('\\')) unsafePath('Decoded Vault path is unsafe');

  const withoutTrailingSlash = raw.replace(/\/+$/, '');
  const decodedWithoutTrailingSlash = decoded.replace(/\/+$/, '');
  const rawSegments = withoutTrailingSlash.split('/');
  const decodedSegments = decodedWithoutTrailingSlash.split('/');
  if (rawSegments.length !== decodedSegments.length) unsafePath('Encoded path separators are not allowed');
  if (decodedSegments.some((segment) => !segment || segment === '.' || segment === '..')) {
    unsafePath('Empty and traversal path segments are not allowed');
  }

  const normalizedSegments = rawSegments.map((segment) => segment.trim());
  if (normalizedSegments.some((segment) => !segment)) unsafePath('Empty path segments are not allowed');
  if (INTERNAL_ROOTS.has(decodedSegments[0].trim().toLowerCase())) {
    unsafePath('Internal plugin paths are not writable');
  }
  for (const segment of normalizedSegments) {
    if (Buffer.byteLength(segment, 'utf8') > MAX_SEGMENT_BYTES) {
      unsafePath('Vault path segment is too long');
    }
  }

  const normalized = normalizedSegments.join('/');
  if (Buffer.byteLength(normalized, 'utf8') > MAX_PATH_BYTES) unsafePath('Vault path is too long');
  return normalized;
}

export function normalizeVaultMarkdownPath(value: unknown): string {
  const normalized = normalizeVaultDir(value);
  if (!normalized || !/\.md$/i.test(normalized)) {
    unsafePath('Vault file path must end in .md');
  }
  return normalized;
}

export function validateImageToken(value: unknown): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,256}$/.test(value)) {
    throw new ValidationError('UNSAFE_IMAGE_TOKEN', 'Image token is not a safe opaque identifier');
  }
  return value;
}
