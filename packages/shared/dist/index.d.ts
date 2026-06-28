/**
 * @sync/shared — 飞书↔OB 同步共享层入口。
 *
 * 导出所有类型、协议常量、工具函数，供 OB 插件和浏览器扩展引用。
 */
export type { SyncBinding, Tag, KnowledgeMeta, YAMLFrontmatter, CalloutFieldMap, } from './types.js';
export { TAG_NAMES, CALLOUT_FIELD_MAP, DOC_INFO_CALLOUT, FEISHU_BG_TO_OB_CALLOUT, OB_CALLOUT_TO_FEISHU, } from './types.js';
export type { FeishuDocRef, StatusResponse, TreeNode, TreeResponse, FetchRequest, FetchResponse, ClipRequest, ClipResponse, ExistsRequest, ExistsResponse, PushbackRequest, PushbackResponse, ErrorResponse, ObsidianLarkDocParams, ProgressStage, } from './protocol.js';
export { DEFAULT_PORT, TOKEN_HEADER, ENDPOINTS, OBSIDIAN_LARK_DOC_ACTION, OBSIDIAN_LARK_DOC_URI_PREFIX, buildObsidianLarkDocUri, parseObsidianLarkDocParams, } from './protocol.js';
export { bodyHash, bodyHashAsync, isChanged } from './hash.js';
export { sanitizeFilename, withMdExt, joinPath } from './filename.js';
export { FEISHU_PROTO, extractTokenFromAuthcodeUrl, rewriteImagesToFeishuProto, extractImgTokenMapFromXml, extractImgTokensFromXml, extractFeishuImageTokens, feishuProtoToXml, } from './image.js';
export { serializeFrontmatter, parseFrontmatter, assembleFile, } from './yaml.js';
export { stripVariationSelectors, unescapeFeishuTilde, metaToCalloutXml, calloutXmlToMeta, feishuCalloutToOB, convertFeishuCalloutsToOB, obCalloutToFeishu, convertOBCalloutsToFeishu, } from './callout.js';
export { unwrapLarkEnvelope } from './larkEnvelope.js';
//# sourceMappingURL=index.d.ts.map