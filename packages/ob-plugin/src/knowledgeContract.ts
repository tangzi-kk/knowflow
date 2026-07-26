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
