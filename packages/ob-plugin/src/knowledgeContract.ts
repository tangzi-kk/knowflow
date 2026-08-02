import contractSnapshot from '../../../contracts/skr-knowledge-v1.json' with { type: 'json' };

interface KnowledgeContractSnapshot {
  contractVersion: string;
  source: {
    repository: string;
    commit: string;
    knowledgeVersion: string;
    schemaVersion: number;
  };
  tags: { allowed: string[] };
  statuses: string[];
  encoding: {
    fullPattern: string;
    shortPattern: string;
  };
}

export interface KnowledgeContractRef {
  repository: string;
  commit: string;
  knowledgeVersion: string;
  schemaVersion: number;
}

export const KNOWLEDGE_CONTRACT = contractSnapshot as KnowledgeContractSnapshot;
export const KNOWLEDGE_CONTRACT_REF: KnowledgeContractRef = Object.freeze({
  repository: KNOWLEDGE_CONTRACT.source.repository,
  commit: KNOWLEDGE_CONTRACT.source.commit,
  knowledgeVersion: KNOWLEDGE_CONTRACT.source.knowledgeVersion,
  schemaVersion: KNOWLEDGE_CONTRACT.source.schemaVersion,
});

export const PROTOCOL_VERSION = KNOWLEDGE_CONTRACT_REF.schemaVersion;
export const ALLOWED_TAGS = Object.freeze([...KNOWLEDGE_CONTRACT.tags.allowed]);
export const ALLOWED_STATUSES = Object.freeze([...KNOWLEDGE_CONTRACT.statuses]);
export const FULL_ENCODING_RE = new RegExp(KNOWLEDGE_CONTRACT.encoding.fullPattern);
export const SHORT_ENCODING_RE = new RegExp(KNOWLEDGE_CONTRACT.encoding.shortPattern);
export const FILE_PREFIX_RE =
  /^(\d{2}_\d{4}_[SXLZQJ]_\d{2}_[a-z]\d+(?:[a-z]\d+)*)\s+/;
export const LEGACY_FILE_PREFIX_RE =
  /^(\d{2}_\d{4}_[SXLZQJ]_\d+(?:_[a-z]\d+)?)\s+/;
/** 新版文件名只展示短编码；YAML 与同步事件仍保存完整编码。 */
export const SHORT_FILE_PREFIX_RE =
  /^([SXLZQJ]\d{2}\.[a-z]\d+(?:[a-z]\d+)*)\s+/;

export function deriveShortEncoding(fullEncoding: string): string {
  if (!FULL_ENCODING_RE.test(fullEncoding)) {
    throw new TypeError(`无法从非法编码派生短编码：${fullEncoding}`);
  }
  const parts = fullEncoding.split('_');
  return `${parts[2]}${parts[3]}.${parts[4]}`;
}

export function encodingTag(fullEncoding: string): string {
  if (!FULL_ENCODING_RE.test(fullEncoding)) {
    throw new TypeError(`非法完整编码：${fullEncoding}`);
  }
  return fullEncoding.split('_')[2];
}

export function datePrefixFromDate(dateValue?: string): string {
  if (dateValue && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return `${dateValue.slice(2, 4)}_${dateValue.slice(5, 7)}${dateValue.slice(8, 10)}`;
  }
  const today = new Date().toISOString().slice(0, 10);
  return `${today.slice(2, 4)}_${today.slice(5, 7)}${today.slice(8, 10)}`;
}

/** 将界面输入的短编码按文档日期展开为协议要求的完整编码。 */
export function expandShortEncoding(shortEncoding: string, datePrefix?: string): string {
  const normalized = shortEncoding.trim();
  if (!SHORT_ENCODING_RE.test(normalized)) {
    throw new TypeError(`无法从非法短编码展开完整编码：${shortEncoding}`);
  }
  const prefix = datePrefix && /^\d{2}_\d{4}$/.test(datePrefix)
    ? datePrefix
    : datePrefixFromDate(datePrefix);
  const [tagAndTopic, hierarchy] = normalized.split('.');
  return `${prefix}_${tagAndTopic[0]}_${tagAndTopic.slice(1)}_${hierarchy}`;
}
