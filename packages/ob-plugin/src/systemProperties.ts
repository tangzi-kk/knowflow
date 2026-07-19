const LEGACY_SYSTEM_PROPERTY_KEYS = new Set([
  'feishu_id',
  'feishu_doc_id',
  'feishu_title',
  'sync_hash',
  'sync_time',
]);

export const SYSTEM_PROPERTY_STYLE_ID = 'fstb-system-property-style';
export const SYSTEM_PROPERTY_HIDDEN_CLASS = 'fstb-system-property-hidden';
export const SYSTEM_PROPERTY_BODY_CLASS = 'fstb-hide-system-properties';

export function isSystemPropertyKey(value: unknown): boolean {
  const key = String(value ?? '').trim();
  return key.startsWith('_sys_') || LEGACY_SYSTEM_PROPERTY_KEYS.has(key);
}

export const SYSTEM_PROPERTY_CSS = `
body.${SYSTEM_PROPERTY_BODY_CLASS} .metadata-property[data-property-key^="_sys_"],
body.${SYSTEM_PROPERTY_BODY_CLASS} .metadata-property[data-property-name^="_sys_"],
body.${SYSTEM_PROPERTY_BODY_CLASS} .metadata-property[data-property-key="feishu_id"],
body.${SYSTEM_PROPERTY_BODY_CLASS} .metadata-property[data-property-key="feishu_doc_id"],
body.${SYSTEM_PROPERTY_BODY_CLASS} .metadata-property[data-property-key="feishu_title"],
body.${SYSTEM_PROPERTY_BODY_CLASS} .metadata-property[data-property-key="sync_hash"],
body.${SYSTEM_PROPERTY_BODY_CLASS} .metadata-property[data-property-key="sync_time"],
body.${SYSTEM_PROPERTY_BODY_CLASS} .metadata-property[data-property-name="feishu_id"],
body.${SYSTEM_PROPERTY_BODY_CLASS} .metadata-property[data-property-name="feishu_doc_id"],
body.${SYSTEM_PROPERTY_BODY_CLASS} .metadata-property[data-property-name="feishu_title"],
body.${SYSTEM_PROPERTY_BODY_CLASS} .metadata-property[data-property-name="sync_hash"],
body.${SYSTEM_PROPERTY_BODY_CLASS} .metadata-property[data-property-name="sync_time"],
body.${SYSTEM_PROPERTY_BODY_CLASS} .metadata-property:has(.metadata-property-key-input[value^="_sys_"]),
body.${SYSTEM_PROPERTY_BODY_CLASS} .metadata-property:has(.metadata-property-key-input[aria-label^="_sys_"]),
body.${SYSTEM_PROPERTY_BODY_CLASS} .metadata-property:has(.metadata-property-key input[value^="_sys_"]),
body.${SYSTEM_PROPERTY_BODY_CLASS} .metadata-property:has(.metadata-property-key span[title^="_sys_"]),
body.${SYSTEM_PROPERTY_BODY_CLASS} .metadata-property:has(.metadata-property-key-inner[title^="_sys_"]) {
  display: none !important;
}
.${SYSTEM_PROPERTY_HIDDEN_CLASS} {
  display: none !important;
}
`;
