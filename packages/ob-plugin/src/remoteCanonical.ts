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
