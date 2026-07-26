/**
 * 旧 auto-rename 模块只保留无副作用的解析兼容。
 *
 * 4.1 起禁止 fetch/clip 或其他调用方绕过 proposal 直接分配编码；
 * 所有写操作统一经 FeishuSyncPlugin.knowledgeWorkflow。
 */
import { deriveShortEncoding, FULL_ENCODING_RE } from './knowledgeContract.js';

export interface DecodedCode {
  yy: string;
  mmdd: string;
  tag: string;
  sequence: number;
  hierarchy: string;
  shortCode: string;
}

export function decodeCode(code: string): DecodedCode | null {
  if (!FULL_ENCODING_RE.test(code)) return null;
  const [yy, mmdd, tag, sequence, hierarchy] = code.split('_');
  return {
    yy,
    mmdd,
    tag,
    sequence: Number(sequence),
    hierarchy,
    shortCode: deriveShortEncoding(code),
  };
}
