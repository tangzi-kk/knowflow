/**
 * YAML ↔ 飞书 callout 双向转换。
 *
 * 依据：
 * - `03_飞书文档格式规范与OB映射.md` §三（callout 颜色映射）
 * - `02_YAML字段规范.md` §五（YAML→callout 映射表）
 * - §四（合并信息块设计：所有字段进一个 callout）
 *
 * 已知坑（03 文档 §十 + §3.3）：
 * - emoji 带 U+FE0F variation selector 飞书不认 → 写入前 strip
 * - `~` 被飞书转义成 `\~` → 回读时反转义
 */
import type { KnowledgeMeta } from './types.js';
export declare function stripVariationSelectors(s: string): string;
/** 飞书 md 把 `~` 转义成 `\~`，回读时反向。 */
export declare function unescapeFeishuTilde(s: string): string;
/** 写入飞书前反转义（如果用户想用 `~` 删除线）。飞书 md 里 `~~~text~~~` 是删除线。 */
export declare function escapeFeishuTilde(s: string): string;
/**
 * 将 OB 的 YAML 元数据字段渲染为飞书合并信息 callout XML。
 * 依据 `03_格式规范.md` §四（合并进一个 callout 高亮块）。
 *
 * @param meta 知识库元数据
 * @returns callout XML 字符串（含 strip VS）
 */
export declare function metaToCalloutXml(meta: KnowledgeMeta): string;
/**
 * 从飞书 XML 的头部信息 callout 中解析出 YAML 字段值。
 * 依据 `03_格式规范.md` §四：`<li><b>字段名</b>：值</li>` 格式。
 *
 * @param xml 飞书文档 XML 片段
 * @returns 解析到的元数据字段
 */
export declare function calloutXmlToMeta(xml: string): Partial<KnowledgeMeta>;
/**
 * 飞书正文 callout XML → OB `> [!type]` callout。
 * 依据 `03_格式规范.md` §3.1。
 *
 * 输入单个 `<callout ...>content</callout>` 块，输出 OB markdown callout。
 * 多个 callout 块由调用方拆分后逐个调用。
 */
export declare function feishuCalloutToOB(xml: string): string;
/**
 * 批量将飞书 XML 里的所有 callout 块转换为 OB callout。
 */
export declare function convertFeishuCalloutsToOB(xml: string): string;
/**
 * OB `> [!type]` callout → 飞书 callout XML。
 * 依据 `03_格式规范.md` §3.2。
 *
 * 输入单个 OB callout 块（含 `> [!type]` 首行 + 子行）。
 * 多个 callout 由调用方拆分后逐个调用。
 */
export declare function obCalloutToFeishu(md: string): string;
/**
 * 批量将 OB md 里的所有 `> [!type]` callout 转换为飞书 XML callout。
 */
export declare function convertOBCalloutsToFeishu(md: string): string;
//# sourceMappingURL=callout.d.ts.map