import { run, getWikiNodeInfo } from './lark/cli.js';
import { buildRemoteDocument, type RemoteDocument } from './remoteCanonical.js';

export function fetchRemoteDocument(input: {
  nodeToken: string;
  spaceId?: string;
  objToken?: string;
}): RemoteDocument {
  let resolvedObjToken = input.objToken ?? '';
  let wikiInfo: ReturnType<typeof getWikiNodeInfo> | null = null;
  let rawMarkdown: string;
  try {
    rawMarkdown = fetchFormat(input.nodeToken, 'markdown');
  } catch (error) {
    wikiInfo = input.spaceId ? getWikiNodeInfo(input.nodeToken, input.spaceId) : null;
    resolvedObjToken ||= wikiInfo?.obj_token ?? '';
    if (!resolvedObjToken) throw error;
    rawMarkdown = fetchFormat(resolvedObjToken, 'markdown');
  }

  let xml = '';
  try {
    xml = fetchFormat(input.nodeToken, 'xml');
  } catch (error) {
    if (!resolvedObjToken && input.spaceId) {
      wikiInfo ??= getWikiNodeInfo(input.nodeToken, input.spaceId);
      resolvedObjToken = wikiInfo?.obj_token ?? '';
    }
    if (resolvedObjToken && resolvedObjToken !== input.nodeToken) {
      try {
        xml = fetchFormat(resolvedObjToken, 'xml');
      } catch {
        console.warn('[sync/remote] xml fetch failed; image and callout metadata may be incomplete:', error);
      }
    } else {
      console.warn('[sync/remote] xml fetch failed; image and callout metadata may be incomplete:', error);
    }
  }

  return buildRemoteDocument(rawMarkdown, xml, input.nodeToken, resolvedObjToken);
}

function fetchFormat(token: string, format: 'markdown' | 'xml'): string {
  const args = ['docs', '+fetch', '--doc', token, '--doc-format', format];
  if (format === 'xml') args.push('--detail', 'with-ids');
  return run(args, { timeout: 60_000 });
}
