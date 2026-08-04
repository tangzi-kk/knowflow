import {
  bodyHash,
  calloutXmlToMeta,
  convertFeishuCalloutsToOB,
  extractImgTokensFromXml,
  rewriteImagesToFeishuProto,
} from '@sync/shared';

export interface RemoteDocument {
  rawMarkdown: string;
  body: string;
  hash: string;
  title: string;
  objToken: string;
  meta: Record<string, unknown>;
}

export function buildRemoteDocument(
  rawMarkdown: string,
  xml: string,
  nodeToken: string,
  objToken = '',
): RemoteDocument {
  const resolvedObjToken = objToken
    || xml.match(/<title[^>]*\bid="([A-Za-z0-9_-]+)"/)?.[1]
    || '';
  const imageTokens = new Set(extractImgTokensFromXml(xml));
  let body = rewriteImagesToFeishuProto(rawMarkdown, imageTokens);
  // YAML 元数据在飞书侧是展示卡片，不属于正文事实。
  // 回写后若把这张卡片继续算入正文 hash，会导致每次拉取都被误判为冲突。
  body = stripMetadataCallouts(body);
  if (xml) body = convertFeishuCalloutsToOB(body);
  const title = body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? nodeToken;

  return {
    rawMarkdown,
    body,
    hash: bodyHash(body),
    title,
    objToken: resolvedObjToken,
    meta: xml ? calloutXmlToMeta(xml) : {},
  };
}

function stripMetadataCallouts(markdown: string): string {
  return markdown.replace(/<callout\b[^>]*>[\s\S]*?<\/callout>\s*/gi, (block) => {
    return /(?:KnowFlow\s+元数据|文档信息)/i.test(block) ? '' : block;
  });
}
