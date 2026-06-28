/**
 * lark-cli 新版默认把 docs +fetch 包在 JSON envelope 中：
 * { ok, data: { document: { content, document_id, revision_id } } }
 *
 * 同步层只需要真实文档内容；wiki/base 等非 document JSON 必须保持原样。
 */
export declare function unwrapLarkEnvelope(stdout: string): string;
//# sourceMappingURL=larkEnvelope.d.ts.map