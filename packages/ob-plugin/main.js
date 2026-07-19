"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  FeishuSyncPlugin: () => FeishuSyncPlugin,
  default: () => main_default
});
module.exports = __toCommonJS(main_exports);
var import_obsidian11 = require("obsidian");

// src/settingsMigration.ts
var import_node_crypto = require("node:crypto");

// src/settings.ts
var DEFAULT_SETTINGS = {
  schemaVersion: 1,
  port: 4567,
  syncToken: "",
  larkCliPath: "",
  defaultDir: "0\uFE0F\u20E3\u8F93\u5165",
  autoRename: true,
  autoDeleteRegistry: false,
  cacheCleanup: "weekly",
  keepDecorativeImages: true,
  spaceId: "7651314150060067803",
  defaultNoteFolder: "3\uFE0F\u20E3\u9644\u4EF6\u6587\u4EF6/Lark",
  hideSystemProperties: true,
  recentActivity: []
};

// src/activity.ts
var MAX_ACTIVITY = 50;
var KINDS = /* @__PURE__ */ new Set(["fetch", "clip", "pushback", "deletion", "system"]);
var STATUSES = /* @__PURE__ */ new Set(["succeeded", "failed", "skipped"]);
function appendActivity(current, input) {
  const previous = normalizeActivity(current);
  const record = normalizeRecord(input);
  return record ? [record, ...previous].slice(0, MAX_ACTIVITY) : previous;
}
function normalizeActivity(input) {
  if (!Array.isArray(input)) return [];
  return input.map((item) => normalizeRecord(item)).filter((item) => item !== null).slice(0, MAX_ACTIVITY);
}
function normalizeRecord(input) {
  if (!input || typeof input !== "object") return null;
  const value = input;
  if (!KINDS.has(value.kind) || !STATUSES.has(value.status)) return null;
  const time = typeof value.time === "string" && Number.isFinite(Date.parse(value.time)) ? value.time : (/* @__PURE__ */ new Date()).toISOString();
  const record = {
    time,
    kind: value.kind,
    status: value.status
  };
  assignBoundedString(record, "action", value.action, 40);
  assignBoundedString(record, "title", value.title, 160);
  assignBoundedString(record, "path", value.path, 500);
  if (typeof value.errorCode === "string" && /^[A-Z0-9_-]{1,80}$/.test(value.errorCode)) {
    record.errorCode = value.errorCode;
  }
  return record;
}
function assignBoundedString(target, key, value, maxLength) {
  if (typeof value === "string" && value.trim()) target[key] = value.trim().slice(0, maxLength);
}

// src/settingsMigration.ts
var CACHE_CLEANUP_VALUES = /* @__PURE__ */ new Set([
  "daily",
  "weekly",
  "monthly",
  "never"
]);
function migrateSettings(input) {
  const source = copyOwnData(input);
  const feishuSync = copyOwnData(source?.feishuSync);
  const runtimeLarkDoc = copyOwnData(source?._larkDoc);
  const legacyLarkDoc = copyOwnData(source?.larkDoc);
  const migrated = source ? copyRecord(source) : {};
  migrated.schemaVersion = 1;
  migrated.port = firstPort(source?.port, feishuSync?.port) ?? DEFAULT_SETTINGS.port;
  migrated.syncToken = firstNonEmptyString(source?.syncToken, feishuSync?.syncToken) ?? DEFAULT_SETTINGS.syncToken;
  migrated.larkCliPath = firstNonEmptyString(
    source?.larkCliPath,
    runtimeLarkDoc?.larkCliPath,
    legacyLarkDoc?.larkCliPath,
    feishuSync?.larkCliPath
  ) ?? DEFAULT_SETTINGS.larkCliPath;
  const defaultDir = firstNonEmptyString(
    source?.defaultDir,
    feishuSync?.defaultDir
  ) ?? DEFAULT_SETTINGS.defaultDir;
  migrated.defaultDir = defaultDir;
  migrated.defaultNoteFolder = firstNonEmptyString(
    source?.defaultNoteFolder,
    runtimeLarkDoc?.defaultNoteFolder,
    legacyLarkDoc?.defaultNoteFolder
  ) ?? DEFAULT_SETTINGS.defaultNoteFolder;
  const legacyAutoRename = copyOwnData(source?.autoRename);
  if (legacyAutoRename && source?._autoRename === void 0) {
    migrated._autoRename = source?.autoRename;
  }
  migrated.autoRename = automaticBehavior(
    [source, feishuSync],
    "autoRename",
    DEFAULT_SETTINGS.autoRename
  );
  migrated.autoDeleteRegistry = automaticBehavior(
    [source, feishuSync],
    "autoDeleteRegistry",
    DEFAULT_SETTINGS.autoDeleteRegistry
  );
  migrated.cacheCleanup = firstCacheCleanup(
    source?.cacheCleanup,
    feishuSync?.cacheCleanup
  ) ?? DEFAULT_SETTINGS.cacheCleanup;
  migrated.keepDecorativeImages = firstBoolean(
    source?.keepDecorativeImages,
    feishuSync?.keepDecorativeImages
  ) ?? DEFAULT_SETTINGS.keepDecorativeImages;
  migrated.spaceId = firstNonEmptyString(source?.spaceId, feishuSync?.spaceId) ?? DEFAULT_SETTINGS.spaceId;
  migrated.hideSystemProperties = firstBoolean(
    source?.hideSystemProperties,
    feishuSync?.hideSystemProperties
  ) ?? DEFAULT_SETTINGS.hideSystemProperties;
  const normalizedActivity = normalizeActivity(source?.recentActivity);
  migrated.recentActivity = sameJsonData(source?.recentActivity, normalizedActivity) ? source?.recentActivity : normalizedActivity;
  return {
    settings: migrated,
    changed: !sameData(source, migrated)
  };
}
function generateSyncToken() {
  const randomSource = globalThis.crypto ?? import_node_crypto.webcrypto;
  const bytes = new Uint8Array(32);
  randomSource.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function copyOwnData(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return void 0;
  }
  try {
    const result = {};
    for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
      if (descriptor.enumerable && "value" in descriptor) {
        defineData(result, key, descriptor.value);
      }
    }
    return result;
  } catch {
    return void 0;
  }
}
function copyRecord(source) {
  const result = {};
  for (const [key, value] of Object.entries(source)) {
    defineData(result, key, value);
  }
  return result;
}
function defineData(target, key, value) {
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
    configurable: true,
    writable: true
  });
}
function firstNonEmptyString(...values) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0);
}
function firstBoolean(...values) {
  for (const value of values) {
    const parsed = parseBoolean(value);
    if (parsed !== void 0) return parsed;
  }
  return void 0;
}
function firstPort(...values) {
  for (const value of values) {
    const candidate = typeof value === "string" && /^\d+$/.test(value.trim()) ? Number(value.trim()) : value;
    if (typeof candidate === "number" && Number.isInteger(candidate) && candidate >= 1 && candidate <= 65535) {
      return candidate;
    }
  }
  return void 0;
}
function automaticBehavior(sources, key, fallback) {
  for (const source of sources) {
    if (!source || !Object.prototype.hasOwnProperty.call(source, key)) continue;
    return parseBoolean(source[key]) ?? false;
  }
  return fallback;
}
function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return void 0;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return void 0;
}
function firstCacheCleanup(...values) {
  return values.find((value) => typeof value === "string" && CACHE_CLEANUP_VALUES.has(value));
}
function sameData(source, migrated) {
  if (!source) return false;
  const sourceKeys = Object.keys(source);
  const migratedKeys = Object.keys(migrated);
  return sourceKeys.length === migratedKeys.length && migratedKeys.every((key) => Object.prototype.hasOwnProperty.call(source, key) && Object.is(source[key], migrated[key]));
}
function sameJsonData(left, right) {
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}

// src/settingsTab.ts
var import_obsidian2 = require("obsidian");

// src/lark/cli.ts
var import_node_child_process = require("node:child_process");
var path = __toESM(require("node:path"), 1);
var os = __toESM(require("node:os"), 1);
var fs = __toESM(require("node:fs"), 1);

// ../shared/dist/types.js
var TAG_NAMES = {
  S: "\u{1F4E5}\u6536\u96C6",
  X: "\u{1F3AF}\u9879\u76EE",
  L: "\u{1F333}\u9886\u57DF",
  Z: "\u{1F4DA}\u8D44\u6E90",
  Q: "\u{1F4A1}\u7075\u611F",
  J: "\u{1F6E0}\uFE0F\u6280\u80FD"
};
var CALLOUT_FIELD_MAP = [
  { field: "\u6807\u7B7E", label: "\u6807\u7B7E", emoji: "\u{1F3F7}" },
  { field: "\u7F16\u7801", label: "\u7F16\u7801", emoji: "\u{1F522}" },
  { field: "\u8F93\u5165", label: "\u8F93\u5165", emoji: "\u{1F4E5}" },
  { field: "\u65E5\u671F", label: "\u65E5\u671F", emoji: "\u{1F4C5}" },
  { field: "\u5173\u952E\u8BCD", label: "\u5173\u952E\u8BCD", emoji: "\u{1F511}" },
  { field: "\u8BC4\u5206_\u663E\u793A", label: "\u8BC4\u5206", emoji: "\u2B50" },
  { field: "\u7D22\u5F15_\u77E5\u8BC6\u5E93", label: "\u7D22\u5F15", emoji: "\u{1F4B0}" }
];
var DOC_INFO_CALLOUT = {
  emoji: "\u{1F4CB}",
  "background-color": "light-blue",
  "border-color": "blue"
};
var FEISHU_BG_TO_OB_CALLOUT = {
  "light-yellow": "tip",
  "medium-red": "warning",
  "light-green": "success",
  "light-blue": "info",
  "light-purple": "note",
  "light-gray": "quote",
  "light-orange": "faq"
};
var OB_CALLOUT_TO_FEISHU = {
  tip: { emoji: "\u{1F4A1}", bg: "light-yellow", border: "yellow" },
  warning: { emoji: "\u26A0\uFE0F", bg: "medium-red", border: "red" },
  success: { emoji: "\u2705", bg: "light-green", border: "green" },
  info: { emoji: "\u2139\uFE0F", bg: "light-blue", border: "blue" },
  note: { emoji: "\u{1F4DD}", bg: "light-purple", border: "purple" },
  quote: { emoji: "\u{1F4AC}", bg: "light-gray", border: "gray" },
  faq: { emoji: "\u2753", bg: "light-orange", border: "orange" },
  abstract: { emoji: "\u{1F4CB}", bg: "light-blue", border: "blue" }
};

// ../shared/dist/protocol.js
var TOKEN_HEADER = "X-Sync-Token";
var PROTOCOL_VERSION = 1;
var SERVER_CAPABILITIES = [
  "status",
  "tree",
  "fetch",
  "clip",
  "exists",
  "pushback"
];
var OBSIDIAN_LARK_DOC_ACTION = "lark-doc";
var OBSIDIAN_LARK_DOC_URI_PREFIX = `obsidian://${OBSIDIAN_LARK_DOC_ACTION}`;
function parseObsidianLarkDocParams(input) {
  const searchParams = (() => {
    if (typeof input === "string") {
      const query = input.includes("?") ? input.slice(input.indexOf("?") + 1) : input;
      return new URLSearchParams(query);
    }
    if (input instanceof URLSearchParams)
      return input;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(input)) {
      if (value !== void 0)
        params.set(key, value);
    }
    return params;
  })();
  const get = (key) => searchParams.get(key) || void 0;
  const parsed = {};
  for (const key of ["token", "node_token", "obj_token", "space_id", "title", "url", "dir"]) {
    const value = get(key);
    if (value !== void 0)
      parsed[key] = value;
  }
  return parsed;
}

// ../shared/dist/hash.js
function bodyHash(body) {
  try {
    const { createHash: createHash2 } = require("node:crypto");
    return createHash2("sha256").update(body, "utf8").digest("hex");
  } catch {
    return syncFallbackHash(body);
  }
}
function syncFallbackHash(body) {
  let h1 = 2166136261;
  let h2 = 16777619;
  for (let i = 0; i < body.length; i++) {
    const c = body.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619);
    h2 = Math.imul(h2 ^ c + 2654435769, 2246822519);
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0") + "_fallback";
}

// ../shared/dist/filename.js
var ILLEGAL = /[\/\\:*?"<>|]/g;
var CONTROL = /[\x00-\x1f\x7f]/g;
function sanitizeFilename(title) {
  let s = (title ?? "").trim();
  s = s.replace(ILLEGAL, "_").replace(CONTROL, "");
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/^[\.\s]+|[\.\s]+$/g, "");
  if (s.length > 100)
    s = s.slice(0, 100).trim();
  return s || "\u672A\u547D\u540D";
}
function withMdExt(name) {
  return name.toLowerCase().endsWith(".md") ? name : `${name}.md`;
}
function joinPath(dir, filename) {
  if (!dir || dir === "." || dir === "/")
    return filename;
  const d = dir.replace(/[\/\\]+$/, "").replace(/^[\/\\]+/, "");
  return d ? `${d}/${filename}` : filename;
}

// ../shared/dist/image.js
var FEISHU_PROTO = "feishu://";
var INTERNAL_API_HOST = "internal-api-drive-stream.feishu.cn";
var INTERNAL_API_HOST_LARK = "internal-api-drive-stream.larksuite.com";
var TOKEN_RE = /[A-Za-z0-9]{20,}/;
function extractTokenFromAuthcodeUrl(url) {
  if (!url)
    return null;
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname;
  if (host !== INTERNAL_API_HOST && host !== INTERNAL_API_HOST_LARK)
    return null;
  const segments = u.pathname.split("/").filter(Boolean);
  let best = null;
  for (const seg of segments) {
    const m = seg.match(TOKEN_RE);
    if (m && (!best || m[0].length > best.length))
      best = m[0];
  }
  return best;
}
function rewriteImagesToFeishuProto(md, tokenMap = /* @__PURE__ */ new Set()) {
  const imgRe = /!\[([^\]]*)\]\(([^)]+)\)/g;
  return md.replace(imgRe, (full, alt, url) => {
    const trimmed = url.trim().replace(/^<|>$/g, "");
    if (trimmed.startsWith(FEISHU_PROTO))
      return full;
    if (trimmed.includes(INTERNAL_API_HOST) || trimmed.includes(INTERNAL_API_HOST_LARK)) {
      const token = pickExactToken(tokenMap, trimmed) ?? extractTokenFromAuthcodeUrl(trimmed) ?? pickFromMap(tokenMap);
      if (token)
        return `![${alt}](${FEISHU_PROTO}${token})`;
    }
    return full;
  });
}
function pickFromMap(tokenMap) {
  if (tokenMap instanceof Map)
    return null;
  if (tokenMap.size === 0)
    return null;
  return tokenMap.values().next().value ?? null;
}
function pickExactToken(tokenMap, url) {
  if (!(tokenMap instanceof Map))
    return null;
  return tokenMap.get(url) ?? tokenMap.get(url.replace(/&amp;/g, "&")) ?? null;
}
function extractImgTokensFromXml(xml) {
  const tokens = /* @__PURE__ */ new Set();
  const imgRe = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*\/?>/g;
  let m;
  while ((m = imgRe.exec(xml)) !== null) {
    const src = m[1].trim();
    if (src.startsWith(FEISHU_PROTO)) {
      tokens.add(src.slice(FEISHU_PROTO.length));
    } else if (TOKEN_RE.test(src) && !src.startsWith("http")) {
      tokens.add(src);
    }
  }
  return [...tokens];
}
function feishuProtoToXml(md) {
  const re = /!\[([^\]]*)\]\(feishu:\/\/([A-Za-z0-9]+)\)/g;
  return md.replace(re, (_full, _alt, token) => {
    return `<img src="${token}"/>`;
  });
}

// ../../node_modules/js-yaml/dist/js-yaml.mjs
var NOT_RESOLVED = /* @__PURE__ */ Symbol("NOT_RESOLVED");
var MERGE_KEY = /* @__PURE__ */ Symbol("MERGE_KEY");
function defineScalarTag(tagName, options) {
  return {
    tagName,
    nodeKind: "scalar",
    implicit: options.implicit ?? false,
    matchByTagPrefix: options.matchByTagPrefix ?? false,
    implicitFirstChars: options.implicitFirstChars ?? null,
    resolve: options.resolve,
    identify: options.identify ?? null,
    represent: options.represent ?? ((data) => String(data)),
    representTagName: options.representTagName ?? null
  };
}
function defineSequenceTag(tagName, options) {
  const carrierIsResult = options.finalize === void 0;
  return {
    tagName,
    nodeKind: "sequence",
    implicit: false,
    matchByTagPrefix: options.matchByTagPrefix ?? false,
    create: options.create,
    addItem: options.addItem,
    finalize: options.finalize ?? ((carrier) => carrier),
    carrierIsResult,
    identify: options.identify ?? null,
    represent: options.represent ?? ((data) => data),
    representTagName: options.representTagName ?? null
  };
}
function defineMappingTag(tagName, options) {
  const carrierIsResult = options.finalize === void 0;
  return {
    tagName,
    nodeKind: "mapping",
    implicit: false,
    matchByTagPrefix: options.matchByTagPrefix ?? false,
    create: options.create,
    addPair: options.addPair,
    has: options.has,
    keys: options.keys,
    get: options.get,
    finalize: options.finalize ?? ((carrier) => carrier),
    carrierIsResult,
    identify: options.identify ?? null,
    represent: options.represent ?? ((data) => data),
    representTagName: options.representTagName ?? null
  };
}
var strTag = defineScalarTag("tag:yaml.org,2002:str", {
  resolve: (source) => source,
  identify: (data) => typeof data === "string"
});
var NULL_VALUES$1 = [
  "",
  "~",
  "null",
  "Null",
  "NULL"
];
var nullCoreTag = defineScalarTag("tag:yaml.org,2002:null", {
  implicit: true,
  implicitFirstChars: [
    "",
    "~",
    "n",
    "N"
  ],
  resolve: (source) => {
    if (NULL_VALUES$1.indexOf(source) !== -1) return null;
    return NOT_RESOLVED;
  },
  identify: (object) => object === null,
  represent: () => "null"
});
var nullJsonTag = defineScalarTag("tag:yaml.org,2002:null", {
  implicit: true,
  implicitFirstChars: ["n"],
  resolve: (source, isExplicit) => {
    if (source === "null" || isExplicit && source === "") return null;
    return NOT_RESOLVED;
  },
  identify: (object) => object === null,
  represent: () => "null"
});
var NULL_VALUES = [
  "",
  "~",
  "null",
  "Null",
  "NULL"
];
var nullYaml11Tag = defineScalarTag("tag:yaml.org,2002:null", {
  implicit: true,
  implicitFirstChars: [
    "",
    "~",
    "n",
    "N"
  ],
  resolve: (source) => {
    if (NULL_VALUES.indexOf(source) !== -1) return null;
    return NOT_RESOLVED;
  },
  identify: (object) => object === null,
  represent: () => "null"
});
var TRUE_VALUES$2 = [
  "true",
  "True",
  "TRUE"
];
var FALSE_VALUES$2 = [
  "false",
  "False",
  "FALSE"
];
var boolCoreTag = defineScalarTag("tag:yaml.org,2002:bool", {
  implicit: true,
  implicitFirstChars: [
    "t",
    "T",
    "f",
    "F"
  ],
  resolve: (source) => {
    if (TRUE_VALUES$2.indexOf(source) !== -1) return true;
    if (FALSE_VALUES$2.indexOf(source) !== -1) return false;
    return NOT_RESOLVED;
  },
  identify: (object) => Object.prototype.toString.call(object) === "[object Boolean]",
  represent: (object) => object ? "true" : "false"
});
var TRUE_VALUES$1 = ["true"];
var FALSE_VALUES$1 = ["false"];
var boolJsonTag = defineScalarTag("tag:yaml.org,2002:bool", {
  implicit: true,
  implicitFirstChars: ["t", "f"],
  resolve: (source) => {
    if (TRUE_VALUES$1.indexOf(source) !== -1) return true;
    if (FALSE_VALUES$1.indexOf(source) !== -1) return false;
    return NOT_RESOLVED;
  },
  identify: (object) => Object.prototype.toString.call(object) === "[object Boolean]",
  represent: (object) => object ? "true" : "false"
});
var TRUE_VALUES = [
  "true",
  "True",
  "TRUE",
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON"
];
var FALSE_VALUES = [
  "false",
  "False",
  "FALSE",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
var boolYaml11Tag = defineScalarTag("tag:yaml.org,2002:bool", {
  implicit: true,
  implicitFirstChars: [
    "y",
    "Y",
    "n",
    "N",
    "t",
    "T",
    "f",
    "F",
    "o",
    "O"
  ],
  resolve: (source) => {
    if (TRUE_VALUES.indexOf(source) !== -1) return true;
    if (FALSE_VALUES.indexOf(source) !== -1) return false;
    return NOT_RESOLVED;
  },
  identify: (object) => Object.prototype.toString.call(object) === "[object Boolean]",
  represent: (object) => object ? "true" : "false"
});
var YAML_INTEGER_IMPLICIT_PATTERN$1 = /* @__PURE__ */ new RegExp("^(?:0o[0-7]+|0x[0-9a-fA-F]+|[-+]?[0-9]+)$");
var YAML_INTEGER_EXPLICIT_PATTERN$1 = /* @__PURE__ */ new RegExp("^(?:[-+]?0b[0-1]+|[-+]?0o[0-7]+|[-+]?0x[0-9a-fA-F]+|[-+]?[0-9]+)$");
function parseYamlInteger$2(source) {
  let value = source;
  let sign = 1;
  if (value[0] === "-" || value[0] === "+") {
    if (value[0] === "-") sign = -1;
    value = value.slice(1);
  }
  if (value.startsWith("0b")) return sign * parseInt(value.slice(2), 2);
  if (value.startsWith("0o")) return sign * parseInt(value.slice(2), 8);
  if (value.startsWith("0x")) return sign * parseInt(value.slice(2), 16);
  return sign * parseInt(value, 10);
}
function resolveYamlInteger$2(source, isExplicit) {
  if (isExplicit) {
    if (!YAML_INTEGER_EXPLICIT_PATTERN$1.test(source)) return NOT_RESOLVED;
  } else if (!YAML_INTEGER_IMPLICIT_PATTERN$1.test(source)) return NOT_RESOLVED;
  const result = parseYamlInteger$2(source);
  return Number.isFinite(result) ? result : NOT_RESOLVED;
}
var intCoreTag = defineScalarTag("tag:yaml.org,2002:int", {
  implicit: true,
  implicitFirstChars: [
    "-",
    "+",
    ..."0123456789"
  ],
  resolve: resolveYamlInteger$2,
  identify: (object) => Number.isInteger(object) && !Object.is(object, -0) && object.toString(10).indexOf("e") < 0,
  represent: (object) => object.toString(10)
});
var YAML_INTEGER_IMPLICIT_PATTERN = /* @__PURE__ */ new RegExp("^-?(?:0|[1-9][0-9]*)$");
var YAML_INTEGER_EXPLICIT_PATTERN = /* @__PURE__ */ new RegExp("^(?:[-+]?0b[0-1]+|[-+]?0o[0-7]+|[-+]?0x[0-9a-fA-F]+|[-+]?[0-9]+)$");
function parseYamlInteger$1(source) {
  let value = source;
  let sign = 1;
  if (value[0] === "-" || value[0] === "+") {
    if (value[0] === "-") sign = -1;
    value = value.slice(1);
  }
  if (value.startsWith("0b")) return sign * parseInt(value.slice(2), 2);
  if (value.startsWith("0o")) return sign * parseInt(value.slice(2), 8);
  if (value.startsWith("0x")) return sign * parseInt(value.slice(2), 16);
  return sign * parseInt(value, 10);
}
function resolveYamlInteger$1(source, isExplicit) {
  if (isExplicit) {
    if (!YAML_INTEGER_EXPLICIT_PATTERN.test(source)) return NOT_RESOLVED;
  } else if (!YAML_INTEGER_IMPLICIT_PATTERN.test(source)) return NOT_RESOLVED;
  const result = parseYamlInteger$1(source);
  return Number.isFinite(result) ? result : NOT_RESOLVED;
}
var intJsonTag = defineScalarTag("tag:yaml.org,2002:int", {
  implicit: true,
  implicitFirstChars: ["-", ..."0123456789"],
  resolve: resolveYamlInteger$1,
  identify: (object) => Number.isInteger(object) && !Object.is(object, -0) && object.toString(10).indexOf("e") < 0,
  represent: (object) => object.toString(10)
});
var YAML_INTEGER_PATTERN = /* @__PURE__ */ new RegExp("^(?:[-+]?0b[0-1_]+|[-+]?0[0-7_]+|[-+]?0x[0-9a-fA-F_]+|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+|[-+]?(?:0|[1-9][0-9_]*))$");
function parseYamlInteger(source) {
  let value = source.replace(/_/g, "");
  let sign = 1;
  if (value[0] === "-" || value[0] === "+") {
    if (value[0] === "-") sign = -1;
    value = value.slice(1);
  }
  if (value.startsWith("0b")) return sign * parseInt(value.slice(2), 2);
  if (value.startsWith("0x")) return sign * parseInt(value.slice(2), 16);
  if (value.includes(":")) {
    let result = 0;
    for (const part of value.split(":")) result = result * 60 + Number(part);
    return sign * result;
  }
  if (value !== "0" && value[0] === "0") return sign * parseInt(value, 8);
  return sign * parseInt(value, 10);
}
function resolveYamlInteger(source) {
  if (!YAML_INTEGER_PATTERN.test(source)) return NOT_RESOLVED;
  const result = parseYamlInteger(source);
  return Number.isFinite(result) ? result : NOT_RESOLVED;
}
var intYaml11Tag = defineScalarTag("tag:yaml.org,2002:int", {
  implicit: true,
  implicitFirstChars: [
    "-",
    "+",
    ..."0123456789"
  ],
  resolve: resolveYamlInteger,
  identify: (object) => Number.isInteger(object) && !Object.is(object, -0) && object.toString(10).indexOf("e") < 0,
  represent: (object) => object.toString(10)
});
var YAML_FLOAT_PATTERN$1 = /* @__PURE__ */ new RegExp("^(?:[-+]?[0-9]+(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|[-+]?\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");
var YAML_FLOAT_SPECIAL_PATTERN$1 = /* @__PURE__ */ new RegExp("^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");
function resolveYamlFloat$2(source) {
  if (!YAML_FLOAT_PATTERN$1.test(source)) return NOT_RESOLVED;
  let value = source.toLowerCase();
  const sign = value[0] === "-" ? -1 : 1;
  if ("+-".includes(value[0])) value = value.slice(1);
  if (value === ".inf") return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  if (value === ".nan") return NaN;
  const result = sign * parseFloat(value);
  if (Number.isFinite(result) || YAML_FLOAT_SPECIAL_PATTERN$1.test(source)) return result;
  return NOT_RESOLVED;
}
function representYamlFloat$2(object) {
  if (isNaN(object)) return ".nan";
  if (object === Number.POSITIVE_INFINITY) return ".inf";
  if (object === Number.NEGATIVE_INFINITY) return "-.inf";
  if (Object.is(object, -0)) return "-0.0";
  const result = object.toString(10);
  return /^[-+]?[0-9]+e/.test(result) ? result.replace("e", ".e") : result;
}
var floatCoreTag = defineScalarTag("tag:yaml.org,2002:float", {
  implicit: true,
  implicitFirstChars: [
    "-",
    "+",
    ".",
    ..."0123456789"
  ],
  resolve: resolveYamlFloat$2,
  identify: (object) => typeof object === "number" && (!Number.isInteger(object) || Object.is(object, -0) || object.toString(10).indexOf("e") >= 0),
  represent: representYamlFloat$2
});
var YAML_FLOAT_IMPLICIT_PATTERN = /* @__PURE__ */ new RegExp("^-?(?:0|[1-9][0-9]*)(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$");
var YAML_FLOAT_EXPLICIT_PATTERN = /* @__PURE__ */ new RegExp("^(?:[-+]?[0-9]+(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|[-+]?\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");
function resolveYamlFloat$1(source, isExplicit) {
  if (isExplicit) {
    if (!YAML_FLOAT_EXPLICIT_PATTERN.test(source)) return NOT_RESOLVED;
    let value = source.toLowerCase();
    const sign = value[0] === "-" ? -1 : 1;
    if ("+-".includes(value[0])) value = value.slice(1);
    if (value === ".inf") return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    if (value === ".nan") return NaN;
    const result2 = sign * parseFloat(value);
    return Number.isFinite(result2) ? result2 : NOT_RESOLVED;
  }
  if (!YAML_FLOAT_IMPLICIT_PATTERN.test(source)) return NOT_RESOLVED;
  const result = Number(source);
  if (Number.isFinite(result)) return result;
  return NOT_RESOLVED;
}
function representYamlFloat$1(object) {
  if (isNaN(object)) return ".nan";
  if (object === Number.POSITIVE_INFINITY) return ".inf";
  if (object === Number.NEGATIVE_INFINITY) return "-.inf";
  if (Object.is(object, -0)) return "-0.0";
  const result = object.toString(10);
  return /^[-+]?[0-9]+e/.test(result) ? result.replace("e", ".e") : result;
}
var floatJsonTag = defineScalarTag("tag:yaml.org,2002:float", {
  implicit: true,
  implicitFirstChars: ["-", ..."0123456789"],
  resolve: resolveYamlFloat$1,
  identify: (object) => typeof object === "number" && (!Number.isInteger(object) || Object.is(object, -0) || object.toString(10).indexOf("e") >= 0),
  represent: representYamlFloat$1
});
var YAML_FLOAT_PATTERN = /* @__PURE__ */ new RegExp("^(?:[-+]?(?:(?:[0-9][0-9_]*)?\\.[0-9_]*)(?:[eE][-+][0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");
var YAML_FLOAT_SPECIAL_PATTERN = /* @__PURE__ */ new RegExp("^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");
function resolveYamlFloat(source) {
  if (!YAML_FLOAT_PATTERN.test(source)) return NOT_RESOLVED;
  let value = source.toLowerCase().replace(/_/g, "");
  const sign = value[0] === "-" ? -1 : 1;
  if ("+-".includes(value[0])) value = value.slice(1);
  if (value === ".inf") return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  if (value === ".nan") return NaN;
  let result = 0;
  if (value.includes(":")) {
    for (const part of value.split(":")) result = result * 60 + Number(part);
    result *= sign;
  } else result = sign * parseFloat(value);
  if (Number.isFinite(result) || YAML_FLOAT_SPECIAL_PATTERN.test(source)) return result;
  return NOT_RESOLVED;
}
function representYamlFloat(object) {
  if (isNaN(object)) return ".nan";
  if (object === Number.POSITIVE_INFINITY) return ".inf";
  if (object === Number.NEGATIVE_INFINITY) return "-.inf";
  if (Object.is(object, -0)) return "-0.0";
  const result = object.toString(10);
  return /^[-+]?[0-9]+e/.test(result) ? result.replace("e", ".e") : result;
}
var floatYaml11Tag = defineScalarTag("tag:yaml.org,2002:float", {
  implicit: true,
  implicitFirstChars: [
    "-",
    "+",
    ".",
    ..."0123456789"
  ],
  resolve: resolveYamlFloat,
  identify: (object) => typeof object === "number" && (!Number.isInteger(object) || Object.is(object, -0) || object.toString(10).indexOf("e") >= 0),
  represent: representYamlFloat
});
var mergeTag = defineScalarTag("tag:yaml.org,2002:merge", {
  implicit: true,
  implicitFirstChars: ["<"],
  resolve: (source, isExplicit) => {
    if (source === "<<" || isExplicit && source === "") return MERGE_KEY;
    return NOT_RESOLVED;
  }
});
var BASE64_PATTERN = /^[A-Za-z0-9+/]*={0,2}$/;
function resolveYamlBinary(source) {
  const input = source.replace(/\s/g, "");
  if (input.length % 4 !== 0 || !BASE64_PATTERN.test(input)) return NOT_RESOLVED;
  const binary = atob(input);
  const result = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) result[index] = binary.charCodeAt(index);
  return result;
}
function representYamlBinary(object) {
  let binary = "";
  for (let index = 0; index < object.length; index++) binary += String.fromCharCode(object[index]);
  return btoa(binary);
}
var binaryTag = defineScalarTag("tag:yaml.org,2002:binary", {
  resolve: resolveYamlBinary,
  identify: (object) => Object.prototype.toString.call(object) === "[object Uint8Array]",
  represent: representYamlBinary
});
var YAML_DATE_REGEXP = /* @__PURE__ */ new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$");
var YAML_TIMESTAMP_REGEXP = /* @__PURE__ */ new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");
function resolveYamlTimestamp(source) {
  let match = YAML_DATE_REGEXP.exec(source);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(source);
  if (match === null) return NOT_RESOLVED;
  const year = +match[1];
  const month = +match[2] - 1;
  const day = +match[3];
  if (!match[4]) {
    const date2 = new Date(Date.UTC(year, month, day));
    if (date2.getUTCFullYear() !== year || date2.getUTCMonth() !== month || date2.getUTCDate() !== day) return NOT_RESOLVED;
    return date2;
  }
  const hour = +match[4];
  const minute = +match[5];
  const second = +match[6];
  let fraction = 0;
  if (hour > 23 || minute > 59 || second > 59) return NOT_RESOLVED;
  if (match[7]) {
    let value = match[7].slice(0, 3);
    while (value.length < 3) value += "0";
    fraction = +value;
  }
  const date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) return NOT_RESOLVED;
  if (match[9]) {
    const offsetHour = +match[10];
    const offsetMinute = +(match[11] || 0);
    if (offsetHour > 23 || offsetMinute > 59) return NOT_RESOLVED;
    const offset = (offsetHour * 60 + offsetMinute) * 6e4;
    date.setTime(date.getTime() - (match[9] === "-" ? -offset : offset));
  }
  return date;
}
var timestampTag = defineScalarTag("tag:yaml.org,2002:timestamp", {
  implicit: true,
  implicitFirstChars: [..."0123456789"],
  resolve: resolveYamlTimestamp,
  identify: (object) => object instanceof Date,
  represent: (object) => object.toISOString()
});
var seqTag = defineSequenceTag("tag:yaml.org,2002:seq", {
  create: () => [],
  addItem: (container, item) => {
    container.push(item);
  },
  identify: Array.isArray
});
function isPlainObject(data) {
  if (data === null || typeof data !== "object" || Array.isArray(data)) return false;
  const prototype = Object.getPrototypeOf(data);
  return prototype === null || prototype === Object.prototype;
}
function pick(object, keys) {
  const result = {};
  for (const key of keys) if (object[key] !== void 0) result[key] = object[key];
  return result;
}
var omapTag = defineSequenceTag("tag:yaml.org,2002:omap", {
  create: () => ({
    list: [],
    seen: /* @__PURE__ */ new Set()
  }),
  addItem: (carrier, item) => {
    let key;
    if (item instanceof Map) {
      if (item.size !== 1) return "cannot resolve an ordered map item";
      key = item.keys().next().value;
    } else if (isPlainObject(item)) {
      const itemKeys = Object.keys(item);
      if (itemKeys.length !== 1) return "cannot resolve an ordered map item";
      key = itemKeys[0];
    } else return "cannot resolve an ordered map item";
    if (carrier.seen.has(key)) return "duplicate key in ordered map";
    carrier.seen.add(key);
    carrier.list.push(item);
    return "";
  },
  finalize: (carrier) => carrier.list
});
var pairsTag = defineSequenceTag("tag:yaml.org,2002:pairs", {
  create: () => [],
  addItem: (container, item) => {
    if (item instanceof Map) {
      if (item.size !== 1) return "cannot resolve a pairs item";
      container.push(item.entries().next().value);
      return "";
    }
    if (Object.prototype.toString.call(item) !== "[object Object]") return "cannot resolve a pairs item";
    const object = item;
    const keys = Object.keys(object);
    if (keys.length !== 1) return "cannot resolve a pairs item";
    container.push([keys[0], object[keys[0]]]);
    return "";
  }
});
var mapTag = defineMappingTag("tag:yaml.org,2002:map", {
  create: () => ({}),
  identify: isPlainObject,
  represent: (o) => {
    const map = /* @__PURE__ */ new Map();
    for (const key of Object.keys(o)) map.set(key, o[key]);
    return map;
  },
  addPair: (container, key, value) => {
    if (key !== null && typeof key === "object") return "object-based map does not support complex keys";
    const normalizedKey = String(key);
    if (normalizedKey === "__proto__") Object.defineProperty(container, normalizedKey, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    else container[normalizedKey] = value;
    return "";
  },
  has: (container, key) => {
    if (key !== null && typeof key === "object") return false;
    return Object.prototype.hasOwnProperty.call(container, String(key));
  },
  keys: (container) => Object.keys(container),
  get: (container, key) => container[String(key)]
});
var setTag = defineMappingTag("tag:yaml.org,2002:set", {
  create: () => /* @__PURE__ */ new Set(),
  identify: (data) => data instanceof Set,
  represent: (data) => {
    const map = /* @__PURE__ */ new Map();
    for (const key of data) map.set(key, null);
    return map;
  },
  addPair: (container, key, value) => {
    if (value !== null) return "cannot resolve a set item";
    container.add(key);
    return "";
  },
  has: (container, key) => container.has(key),
  keys: (container) => container.keys(),
  get: () => null
});
function createTagDefinitionMap() {
  return {
    scalar: {},
    sequence: {},
    mapping: {}
  };
}
function createTagDefinitionListMap() {
  return {
    scalar: [],
    sequence: [],
    mapping: []
  };
}
function compileTags(tags) {
  const result = [];
  for (const tag of tags) {
    let index = result.length;
    for (let previousIndex = 0; previousIndex < result.length; previousIndex++) {
      const previous = result[previousIndex];
      if (previous.nodeKind === tag.nodeKind && previous.tagName === tag.tagName && previous.matchByTagPrefix === tag.matchByTagPrefix) {
        index = previousIndex;
        break;
      }
    }
    result[index] = tag;
  }
  return result;
}
var Schema = class Schema2 {
  constructor(tags) {
    __publicField(this, "tags");
    __publicField(this, "implicitScalarTags");
    __publicField(this, "implicitScalarByFirstChar");
    __publicField(this, "implicitScalarAnyFirstChar");
    __publicField(this, "defaultScalarTag");
    __publicField(this, "defaultSequenceTag");
    __publicField(this, "defaultMappingTag");
    __publicField(this, "exact");
    __publicField(this, "prefix");
    const compiledTags = compileTags(tags);
    const implicitScalarTags = [];
    const exact = createTagDefinitionMap();
    const prefix = createTagDefinitionListMap();
    for (const tag of compiledTags) {
      if (tag.nodeKind === "scalar" && tag.implicit) {
        if (tag.matchByTagPrefix) throw new Error("Implicit scalar tags cannot match by tag prefix");
        implicitScalarTags.push(tag);
      }
      switch (tag.nodeKind) {
        case "scalar":
          if (tag.matchByTagPrefix) prefix.scalar.push(tag);
          else exact.scalar[tag.tagName] = tag;
          break;
        case "sequence":
          if (tag.matchByTagPrefix) prefix.sequence.push(tag);
          else exact.sequence[tag.tagName] = tag;
          break;
        case "mapping":
          if (tag.matchByTagPrefix) prefix.mapping.push(tag);
          else exact.mapping[tag.tagName] = tag;
          break;
      }
    }
    const implicitScalarAnyFirstChar = implicitScalarTags.filter((tag) => tag.implicitFirstChars === null);
    const keys = /* @__PURE__ */ new Set();
    for (const tag of implicitScalarTags) if (tag.implicitFirstChars !== null) for (const key of tag.implicitFirstChars) keys.add(key);
    const implicitScalarByFirstChar = /* @__PURE__ */ new Map();
    for (const key of keys) implicitScalarByFirstChar.set(key, implicitScalarTags.filter((tag) => tag.implicitFirstChars === null || tag.implicitFirstChars.indexOf(key) !== -1));
    const defaultScalarTag = exact.scalar["tag:yaml.org,2002:str"];
    if (!defaultScalarTag) throw new Error("schema does not define the default scalar tag (tag:yaml.org,2002:str)");
    this.tags = compiledTags;
    this.implicitScalarTags = implicitScalarTags;
    this.implicitScalarByFirstChar = implicitScalarByFirstChar;
    this.implicitScalarAnyFirstChar = implicitScalarAnyFirstChar;
    this.defaultScalarTag = defaultScalarTag;
    this.defaultSequenceTag = exact.sequence["tag:yaml.org,2002:seq"];
    this.defaultMappingTag = exact.mapping["tag:yaml.org,2002:map"];
    this.exact = exact;
    this.prefix = prefix;
  }
  withTags(...tags) {
    let flatTags = [];
    for (const tag of tags) flatTags = flatTags.concat(tag);
    return new Schema2([...this.tags, ...flatTags]);
  }
};
var FAILSAFE_SCHEMA = new Schema([
  strTag,
  seqTag,
  mapTag
]);
var JSON_SCHEMA = new Schema([
  ...FAILSAFE_SCHEMA.tags,
  nullJsonTag,
  boolJsonTag,
  intJsonTag,
  floatJsonTag
]);
var CORE_SCHEMA = new Schema([
  ...FAILSAFE_SCHEMA.tags,
  nullCoreTag,
  boolCoreTag,
  intCoreTag,
  floatCoreTag
]);
var YAML11_SCHEMA = new Schema([
  ...FAILSAFE_SCHEMA.tags,
  nullYaml11Tag,
  boolYaml11Tag,
  intYaml11Tag,
  floatYaml11Tag,
  timestampTag,
  mergeTag,
  binaryTag,
  omapTag,
  pairsTag,
  setTag
]);
var realMapTag = defineMappingTag("tag:yaml.org,2002:map", {
  create: () => /* @__PURE__ */ new Map(),
  addPair: (container, key, value) => {
    container.set(key, value);
    return "";
  },
  has: (container, key) => container.has(key),
  keys: (container) => container.keys(),
  get: (container, key) => container.get(key),
  identify: (data) => data instanceof Map || isPlainObject(data),
  represent: (data) => {
    if (data instanceof Map) return data;
    const map = /* @__PURE__ */ new Map();
    const obj = data;
    for (const key of Object.keys(obj)) map.set(key, obj[key]);
    return map;
  }
});
function normalizeKey(key) {
  if (Array.isArray(key)) {
    const array = Array.prototype.slice.call(key);
    for (let index = 0; index < array.length; index++) {
      if (Array.isArray(array[index])) return null;
      if (typeof array[index] === "object" && Object.prototype.toString.call(array[index]) === "[object Object]") array[index] = "[object Object]";
    }
    return String(array);
  }
  if (typeof key === "object" && Object.prototype.toString.call(key) === "[object Object]") return "[object Object]";
  return String(key);
}
var legacyMapTag = defineMappingTag("tag:yaml.org,2002:map", {
  create: () => ({}),
  identify: isPlainObject,
  represent: (o) => {
    const map = /* @__PURE__ */ new Map();
    for (const key of Object.keys(o)) map.set(key, o[key]);
    return map;
  },
  addPair: (container, key, value) => {
    const normalizedKey = normalizeKey(key);
    if (normalizedKey === null) return "nested arrays are not supported inside keys";
    if (normalizedKey === "__proto__") Object.defineProperty(container, normalizedKey, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    else container[normalizedKey] = value;
    return "";
  },
  has: (container, key) => {
    const normalizedKey = normalizeKey(key);
    return normalizedKey !== null && Object.prototype.hasOwnProperty.call(container, normalizedKey);
  },
  keys: (container) => Object.keys(container),
  get: (container, key) => container[String(key)]
});
var DEFAULT_SNIPPET_OPTIONS = {
  maxLength: 79,
  indent: 1,
  linesBefore: 3,
  linesAfter: 2
};
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  let head = "";
  let tail = "";
  const maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  if (position - lineStart > maxHalfLength) {
    head = " ... ";
    lineStart = position - maxHalfLength + head.length;
  }
  if (lineEnd - position > maxHalfLength) {
    tail = " ...";
    lineEnd = position + maxHalfLength - tail.length;
  }
  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "\u2192") + tail,
    pos: position - lineStart + head.length
  };
}
function padStart(string, max) {
  return " ".repeat(Math.max(max - string.length, 0)) + string;
}
function makeSnippet(mark, options) {
  if (!mark.buffer) return null;
  const opts = {
    ...DEFAULT_SNIPPET_OPTIONS,
    ...options
  };
  const re = /\r?\n|\r|\0/g;
  const lineStarts = [0];
  const lineEnds = [];
  let match;
  let foundLineNo = -1;
  while (match = re.exec(mark.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);
    if (mark.position <= match.index && foundLineNo < 0) foundLineNo = lineStarts.length - 2;
  }
  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
  let result = "";
  const lineNoLength = Math.min(mark.line + opts.linesAfter, lineEnds.length).toString().length;
  const maxLineLength = opts.maxLength - (opts.indent + lineNoLength + 3);
  for (let i = 1; i <= opts.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    const line2 = getLine(mark.buffer, lineStarts[foundLineNo - i], lineEnds[foundLineNo - i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]), maxLineLength);
    result = `${" ".repeat(opts.indent)}${padStart((mark.line - i + 1).toString(), lineNoLength)} | ${line2.str}
${result}`;
  }
  const line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += `${" ".repeat(opts.indent)}${padStart((mark.line + 1).toString(), lineNoLength)} | ${line.str}
`;
  result += `${"-".repeat(opts.indent + lineNoLength + 3 + line.pos)}^
`;
  for (let i = 1; i <= opts.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    const line2 = getLine(mark.buffer, lineStarts[foundLineNo + i], lineEnds[foundLineNo + i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]), maxLineLength);
    result += `${" ".repeat(opts.indent)}${padStart((mark.line + i + 1).toString(), lineNoLength)} | ${line2.str}
`;
  }
  return result.replace(/\n$/, "");
}
function formatError(exception, compact) {
  let where = "";
  if (!exception.mark) return exception.reason;
  if (exception.mark.name) where += `in "${exception.mark.name}" `;
  where += `(${exception.mark.line + 1}:${exception.mark.column + 1})`;
  if (!compact && exception.mark.snippet) where += `

${exception.mark.snippet}`;
  return `${exception.reason} ${where}`;
}
var YAMLException = class extends Error {
  constructor(reason, mark) {
    super();
    __publicField(this, "reason");
    __publicField(this, "mark");
    this.name = "YAMLException";
    this.reason = reason;
    this.mark = mark;
    this.message = formatError(this, false);
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }
  toString(compact) {
    return `${this.name}: ${formatError(this, compact)}`;
  }
};
function throwErrorAt(source, position, message, filename = "") {
  let line = 0;
  let lineStart = 0;
  for (let index = 0; index < position; index++) {
    const ch = source.charCodeAt(index);
    if (ch === 10) {
      line++;
      lineStart = index + 1;
    } else if (ch === 13) {
      line++;
      if (source.charCodeAt(index + 1) === 10) index++;
      lineStart = index + 1;
    }
  }
  const mark = {
    name: filename,
    buffer: source,
    position,
    line,
    column: position - lineStart
  };
  mark.snippet = makeSnippet(mark);
  throw new YAMLException(message, mark);
}
var NO_RANGE$3 = -1;
function simpleEscapeSequence(c) {
  switch (c) {
    case 48:
      return "\0";
    case 97:
      return "\x07";
    case 98:
      return "\b";
    case 116:
      return "	";
    case 9:
      return "	";
    case 110:
      return "\n";
    case 118:
      return "\v";
    case 102:
      return "\f";
    case 114:
      return "\r";
    case 101:
      return "\x1B";
    case 32:
      return " ";
    case 34:
      return '"';
    case 47:
      return "/";
    case 92:
      return "\\";
    case 78:
      return "\x85";
    case 95:
      return "\xA0";
    case 76:
      return "\u2028";
    case 80:
      return "\u2029";
    default:
      return "";
  }
}
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (let i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
function charFromCodepoint(c) {
  if (c <= 65535) return String.fromCharCode(c);
  return String.fromCharCode((c - 65536 >> 10) + 55296, (c - 65536 & 1023) + 56320);
}
function fromHexCode$1(c) {
  if (c >= 48 && c <= 57) return c - 48;
  return (c | 32) - 97 + 10;
}
function escapedHexLen$1(c) {
  if (c === 120) return 2;
  if (c === 117) return 4;
  return 8;
}
function skipFoldedBreaks(input, position, end) {
  let breaks = 0;
  while (position < end) {
    const ch = input.charCodeAt(position);
    if (ch === 10) {
      breaks++;
      position++;
    } else if (ch === 13) {
      breaks++;
      position++;
      if (input.charCodeAt(position) === 10) position++;
    } else if (ch === 32 || ch === 9) position++;
    else break;
  }
  return {
    position,
    breaks
  };
}
function foldedBreaks(count) {
  if (count === 1) return " ";
  return "\n".repeat(count - 1);
}
function getPlainValue(input, start, end) {
  let result = "";
  let position = start;
  let captureStart = start;
  let captureEnd = start;
  while (position < end) {
    const ch = input.charCodeAt(position);
    if (ch === 10 || ch === 13) {
      result += input.slice(captureStart, captureEnd);
      const fold = skipFoldedBreaks(input, position, end);
      result += foldedBreaks(fold.breaks);
      position = captureStart = captureEnd = fold.position;
    } else {
      position++;
      if (ch !== 32 && ch !== 9) captureEnd = position;
    }
  }
  return result + input.slice(captureStart, captureEnd);
}
function getSingleQuotedValue(input, start, end) {
  let result = "";
  let position = start;
  let captureStart = start;
  let captureEnd = start;
  while (position < end) {
    const ch = input.charCodeAt(position);
    if (ch === 39) {
      result += input.slice(captureStart, position) + "'";
      position += 2;
      captureStart = captureEnd = position;
    } else if (ch === 10 || ch === 13) {
      result += input.slice(captureStart, captureEnd);
      const fold = skipFoldedBreaks(input, position, end);
      result += foldedBreaks(fold.breaks);
      position = captureStart = captureEnd = fold.position;
    } else {
      position++;
      if (ch !== 32 && ch !== 9) captureEnd = position;
    }
  }
  return result + input.slice(captureStart, end);
}
function getDoubleQuotedValue(input, start, end) {
  let result = "";
  let position = start;
  let captureStart = start;
  let captureEnd = start;
  while (position < end) {
    const ch = input.charCodeAt(position);
    if (ch === 92) {
      result += input.slice(captureStart, position);
      position++;
      const escaped = input.charCodeAt(position);
      if (escaped === 10 || escaped === 13) position = skipFoldedBreaks(input, position, end).position;
      else if (escaped < 256 && simpleEscapeCheck[escaped]) {
        result += simpleEscapeMap[escaped];
        position++;
      } else {
        let hexLength = escapedHexLen$1(escaped);
        let hexResult = 0;
        for (; hexLength > 0; hexLength--) {
          position++;
          const digit = fromHexCode$1(input.charCodeAt(position));
          hexResult = (hexResult << 4) + digit;
        }
        result += charFromCodepoint(hexResult);
        position++;
      }
      captureStart = captureEnd = position;
    } else if (ch === 10 || ch === 13) {
      result += input.slice(captureStart, captureEnd);
      const fold = skipFoldedBreaks(input, position, end);
      result += foldedBreaks(fold.breaks);
      position = captureStart = captureEnd = fold.position;
    } else {
      position++;
      if (ch !== 32 && ch !== 9) captureEnd = position;
    }
  }
  return result + input.slice(captureStart, end);
}
function getBlockValue(input, start, end, indent, chomping, folded) {
  const textIndent = indent < 0 ? 0 : indent;
  const region = input.slice(start, end).replace(/\r\n?/g, "\n");
  const lines = region === "" ? [] : (region.endsWith("\n") ? region.slice(0, -1) : region).split("\n");
  let result = "";
  let didReadContent = false;
  let emptyLines = 0;
  let atMoreIndented = false;
  for (const line of lines) {
    let column = 0;
    while (column < textIndent && line.charCodeAt(column) === 32) column++;
    if (indent < 0 || column >= line.length) {
      emptyLines++;
      continue;
    }
    const content = line.slice(textIndent);
    const first = content.charCodeAt(0);
    if (folded) if (first === 32 || first === 9) {
      atMoreIndented = true;
      result += "\n".repeat(didReadContent ? 1 + emptyLines : emptyLines);
    } else if (atMoreIndented) {
      atMoreIndented = false;
      result += "\n".repeat(emptyLines + 1);
    } else if (emptyLines === 0) {
      if (didReadContent) result += " ";
    } else result += "\n".repeat(emptyLines);
    else result += "\n".repeat(didReadContent ? 1 + emptyLines : emptyLines);
    result += content;
    didReadContent = true;
    emptyLines = 0;
  }
  if (chomping === 3) result += "\n".repeat(didReadContent ? 1 + emptyLines : emptyLines);
  else if (chomping !== 2) {
    if (didReadContent) result += "\n";
  }
  return result;
}
function getScalarValue(input, scalar) {
  if (scalar.valueStart === NO_RANGE$3) return "";
  const { valueStart, valueEnd } = scalar;
  if (scalar.fast) return input.slice(valueStart, valueEnd);
  switch (scalar.style) {
    case 2:
      return getSingleQuotedValue(input, valueStart, valueEnd);
    case 3:
      return getDoubleQuotedValue(input, valueStart, valueEnd);
    case 4:
      return getBlockValue(input, valueStart, valueEnd, scalar.indent, scalar.chomping, false);
    case 5:
      return getBlockValue(input, valueStart, valueEnd, scalar.indent, scalar.chomping, true);
    default:
      return getPlainValue(input, valueStart, valueEnd);
  }
}
var DEFAULT_TAG_HANDLERS = {
  "!": "!",
  "!!": "tag:yaml.org,2002:"
};
function tagPercentEncode(source) {
  return encodeURI(source).replace(/!/g, "%21");
}
function tagNameFull(rawTag, tagHandlers) {
  if (rawTag.startsWith("!<") && rawTag.endsWith(">")) return decodeURIComponent(rawTag.slice(2, -1));
  const handleEnd = rawTag.indexOf("!", 1);
  const handle = handleEnd === -1 ? "!" : rawTag.slice(0, handleEnd + 1);
  const prefix = tagHandlers?.[handle] ?? DEFAULT_TAG_HANDLERS[handle] ?? handle;
  return decodeURIComponent(prefix) + decodeURIComponent(rawTag.slice(handle.length));
}
function tagNameShort(fullTag) {
  let tag = fullTag;
  if (tag.charCodeAt(0) === 33) {
    tag = tag.slice(1);
    return `!${tagPercentEncode(tag)}`;
  }
  if (tag.slice(0, 18) === "tag:yaml.org,2002:") return `!!${tagPercentEncode(tag.slice(18))}`;
  return `!<${tagPercentEncode(tag)}>`;
}
var NO_RANGE$2 = -1;
var DEFAULT_CONSTRUCTOR_OPTIONS = {
  filename: "",
  schema: CORE_SCHEMA,
  json: false,
  maxTotalMergeKeys: 1e4,
  maxAliases: -1
};
function eventPosition$1(event) {
  if ("tagStart" in event && event.tagStart !== NO_RANGE$2) return event.tagStart;
  if ("anchorStart" in event && event.anchorStart !== NO_RANGE$2) return event.anchorStart;
  if ("valueStart" in event && event.valueStart !== NO_RANGE$2) return event.valueStart;
  if ("start" in event) return event.start;
  return 0;
}
function throwError$1(state, message) {
  throwErrorAt(state.source, state.position, message, state.filename);
}
function finalizeCollection(state, position, tag, carrier) {
  try {
    return tag.finalize(carrier);
  } catch (error) {
    if (error instanceof YAMLException) throw error;
    throwErrorAt(state.source, position, error instanceof Error ? error.message : String(error), state.filename);
  }
}
function lookupTag(exact, prefix, tagName) {
  const exactTag = exact[tagName];
  if (exactTag) return exactTag;
  for (const tag of prefix) if (tagName.startsWith(tag.tagName)) return tag;
}
function findExplicitTag(state, exact, prefix, tagName, nodeKind) {
  const tag = lookupTag(exact, prefix, tagName);
  if (tag) return tag;
  throwError$1(state, `unknown ${nodeKind} tag !<${tagName}>`);
}
function constructScalar(state, event) {
  const source = getScalarValue(state.source, event);
  const rawTag = event.tagStart === NO_RANGE$2 ? "" : state.source.slice(event.tagStart, event.tagEnd);
  const strTag2 = state.schema.defaultScalarTag;
  if (rawTag !== "") {
    if (rawTag === "!") return {
      value: source,
      tag: strTag2
    };
    const tagName = tagNameFull(rawTag, state.tagHandlers);
    const scalarTag = lookupTag(state.schema.exact.scalar, state.schema.prefix.scalar, tagName);
    if (scalarTag) {
      const result = scalarTag.resolve(source, true, tagName);
      if (result === NOT_RESOLVED) throwError$1(state, `cannot resolve a node with !<${tagName}> explicit tag`);
      return {
        value: result,
        tag: scalarTag
      };
    }
    const collectionTagDef = lookupTag(state.schema.exact.mapping, state.schema.prefix.mapping, tagName) ?? lookupTag(state.schema.exact.sequence, state.schema.prefix.sequence, tagName);
    if (collectionTagDef) {
      if (source !== "") throwError$1(state, `cannot resolve a node with !<${tagName}> explicit tag`);
      const carrier = collectionTagDef.create(tagName);
      return {
        value: collectionTagDef.carrierIsResult ? carrier : finalizeCollection(state, state.position, collectionTagDef, carrier),
        tag: collectionTagDef
      };
    }
    throwError$1(state, `unknown scalar tag !<${tagName}>`);
  }
  if (event.style === 1) {
    const candidates = state.schema.implicitScalarByFirstChar.get(source.charAt(0)) ?? state.schema.implicitScalarAnyFirstChar;
    for (const tag of candidates) {
      const result = tag.resolve(source, false, tag.tagName);
      if (result !== NOT_RESOLVED) return {
        value: result,
        tag
      };
    }
  }
  return {
    value: strTag2.resolve(source, false, strTag2.tagName),
    tag: strTag2
  };
}
function collectionTag(state, event, exact, prefix, defaultTagName, nodeKind) {
  const rawTag = event.tagStart === NO_RANGE$2 ? "" : state.source.slice(event.tagStart, event.tagEnd);
  const tagName = rawTag === "" || rawTag === "!" ? defaultTagName : tagNameFull(rawTag, state.tagHandlers);
  return {
    tagName,
    tag: findExplicitTag(state, exact, prefix, tagName, nodeKind)
  };
}
function isMappingTag(tag) {
  return tag.nodeKind === "mapping";
}
function mergeKeys(state, frame, source, sourceTag) {
  for (const sourceKey of sourceTag.keys(source)) {
    if (state.maxTotalMergeKeys !== -1 && ++state.totalMergeKeys > state.maxTotalMergeKeys) throwError$1(state, `merge keys exceeded maxTotalMergeKeys (${state.maxTotalMergeKeys})`);
    if (frame.tag.has(frame.value, sourceKey)) continue;
    const err = frame.tag.addPair(frame.value, sourceKey, sourceTag.get(source, sourceKey));
    if (err) throwError$1(state, err);
    (frame.overridable ?? (frame.overridable = /* @__PURE__ */ new Set())).add(sourceKey);
  }
}
function mergeSource(state, frame, source, sourceTag) {
  state.position = frame.keyPosition;
  if (isMappingTag(sourceTag)) mergeKeys(state, frame, source, sourceTag);
  else if (sourceTag.nodeKind === "sequence" && Array.isArray(source)) for (const element of source) mergeKeys(state, frame, element, frame.tag);
  else throwError$1(state, "cannot merge mappings; the provided source object is unacceptable");
}
function addMappingValue(state, frame, key, value, tag) {
  state.position = frame.keyPosition;
  if (key === MERGE_KEY) {
    mergeSource(state, frame, value, tag);
    return;
  }
  if (!state.json && frame.tag.has(frame.value, key) && !frame.overridable?.has(key)) throwError$1(state, "duplicated mapping key");
  const err = frame.tag.addPair(frame.value, key, value);
  if (err) throwError$1(state, err);
  frame.overridable?.delete(key);
}
function addValue(state, value, tag) {
  const frame = state.frames[state.frames.length - 1];
  if (frame.kind === "document") {
    frame.value = value;
    frame.hasValue = true;
  } else if (frame.kind === "sequence") {
    if (frame.merge) {
      if (!isMappingTag(tag)) throwError$1(state, "cannot merge mappings; the provided source object is unacceptable");
    }
    const err = frame.tag.addItem(frame.value, value, frame.index++);
    if (err) throwError$1(state, err);
  } else if (frame.hasKey) {
    const key = frame.key;
    frame.key = void 0;
    frame.hasKey = false;
    addMappingValue(state, frame, key, value, tag);
  } else {
    frame.key = value;
    frame.keyPosition = state.position;
    frame.hasKey = true;
  }
}
function storeAnchor(state, event, value, tag, isValueFinal) {
  if (event.anchorStart !== NO_RANGE$2) {
    const anchor = {
      value,
      tag,
      isValueFinal
    };
    state.anchors.set(state.source.slice(event.anchorStart, event.anchorEnd), anchor);
    return anchor;
  }
  return null;
}
function constructFromEvents(events, options) {
  const state = {
    ...DEFAULT_CONSTRUCTOR_OPTIONS,
    ...options,
    events,
    documents: [],
    eventIndex: 0,
    position: 0,
    frames: [],
    anchors: /* @__PURE__ */ new Map(),
    tagHandlers: /* @__PURE__ */ Object.create(null),
    totalMergeKeys: 0,
    aliasCount: 0
  };
  while (state.eventIndex < state.events.length) {
    const event = state.events[state.eventIndex++];
    state.position = eventPosition$1(event);
    switch (event.type) {
      case 1:
        state.anchors = /* @__PURE__ */ new Map();
        state.aliasCount = 0;
        state.tagHandlers = /* @__PURE__ */ Object.create(null);
        for (const directive of event.directives) if (directive.kind === "tag") state.tagHandlers[directive.handle] = directive.prefix;
        state.frames.push({
          kind: "document",
          position: state.position,
          value: void 0,
          hasValue: false
        });
        break;
      case 4: {
        const { value, tag } = constructScalar(state, event);
        storeAnchor(state, event, value, tag, true);
        addValue(state, value, tag);
        break;
      }
      case 2: {
        const definition = collectionTag(state, event, state.schema.exact.sequence, state.schema.prefix.sequence, "tag:yaml.org,2002:seq", "sequence");
        const value = definition.tag.create(definition.tagName);
        const anchor = storeAnchor(state, event, value, definition.tag, definition.tag.carrierIsResult);
        const parent = state.frames[state.frames.length - 1];
        const merge = parent !== void 0 && parent.kind === "mapping" && parent.hasKey && parent.key === MERGE_KEY;
        state.frames.push({
          kind: "sequence",
          position: state.position,
          value,
          tag: definition.tag,
          anchor,
          index: 0,
          merge
        });
        break;
      }
      case 3: {
        const definition = collectionTag(state, event, state.schema.exact.mapping, state.schema.prefix.mapping, "tag:yaml.org,2002:map", "mapping");
        const value = definition.tag.create(definition.tagName);
        const anchor = storeAnchor(state, event, value, definition.tag, definition.tag.carrierIsResult);
        state.frames.push({
          kind: "mapping",
          position: state.position,
          value,
          tag: definition.tag,
          anchor,
          key: void 0,
          keyPosition: state.position,
          hasKey: false,
          overridable: null
        });
        break;
      }
      case 5: {
        if (state.maxAliases !== -1 && ++state.aliasCount > state.maxAliases) throwError$1(state, `aliases exceeded maxAliases (${state.maxAliases})`);
        const name = state.source.slice(event.anchorStart, event.anchorEnd);
        const anchor = state.anchors.get(name);
        if (!anchor) throwError$1(state, `unidentified alias "${name}"`);
        if (!anchor.isValueFinal) throwError$1(state, `recursive alias "${name}" is not supported for tag ${anchor.tag.tagName} because it uses finalize()`);
        addValue(state, anchor.value, anchor.tag);
        break;
      }
      case 6: {
        const frame = state.frames.pop();
        if (frame.kind === "document") state.documents.push(frame.value);
        else {
          const value = frame.tag.carrierIsResult ? frame.value : finalizeCollection(state, frame.position, frame.tag, frame.value);
          if (frame.anchor) {
            frame.anchor.value = value;
            frame.anchor.isValueFinal = true;
          }
          addValue(state, value, frame.tag);
        }
        break;
      }
    }
  }
  return state.documents;
}
var NO_RANGE$1 = -1;
var HAS_OWN = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]{}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![0-9A-Za-z-]+!)$/;
var NS_URI_CHAR = String.raw`(?:%[0-9A-Fa-f]{2}|[0-9A-Za-z\-#;/?:@&=+$,_.!~*'()\[\]])`;
var NS_TAG_CHAR = String.raw`(?:%[0-9A-Fa-f]{2}|[0-9A-Za-z\-#;/?:@&=+$.~*'()_])`;
var PATTERN_TAG_URI = new RegExp(`^(?:${NS_URI_CHAR})*$`);
var PATTERN_TAG_SUFFIX = new RegExp(`^(?:${NS_TAG_CHAR})+$`);
var PATTERN_TAG_PREFIX = new RegExp(`^(?:!(?:${NS_URI_CHAR})*|${NS_TAG_CHAR}(?:${NS_URI_CHAR})*)$`);
var DEFAULT_PARSER_OPTIONS = {
  filename: "",
  maxDepth: 100
};
function addDocumentEvent(state, explicitStart, explicitEnd) {
  state.events.push({
    type: 1,
    explicitStart,
    explicitEnd,
    directives: state.directives
  });
}
function addSequenceEvent(state, start, anchorStart, anchorEnd, tagStart, tagEnd, style) {
  state.events.push({
    type: 2,
    start,
    anchorStart,
    anchorEnd,
    tagStart,
    tagEnd,
    style
  });
}
function addMappingEvent(state, start, anchorStart, anchorEnd, tagStart, tagEnd, style) {
  state.events.push({
    type: 3,
    start,
    anchorStart,
    anchorEnd,
    tagStart,
    tagEnd,
    style
  });
}
function addScalarEvent(state, valueStart, valueEnd, anchorStart, anchorEnd, tagStart, tagEnd, style, chomping = 1, indent = -1, fast = false) {
  state.events.push({
    type: 4,
    valueStart,
    valueEnd,
    anchorStart,
    anchorEnd,
    tagStart,
    tagEnd,
    style,
    chomping,
    indent,
    fast
  });
}
function addAliasEvent(state, anchorStart, anchorEnd) {
  state.events.push({
    type: 5,
    anchorStart,
    anchorEnd
  });
}
function addPopEvent(state) {
  state.events.push({ type: 6 });
}
function addEmptyScalarEvent(state) {
  addScalarEvent(state, NO_RANGE$1, NO_RANGE$1, NO_RANGE$1, NO_RANGE$1, NO_RANGE$1, NO_RANGE$1, 1);
}
function emptyProperties() {
  return {
    anchorStart: NO_RANGE$1,
    anchorEnd: NO_RANGE$1,
    tagStart: NO_RANGE$1,
    tagEnd: NO_RANGE$1
  };
}
function snapshotState(state) {
  return {
    position: state.position,
    line: state.line,
    lineStart: state.lineStart,
    lineIndent: state.lineIndent,
    firstTabInLine: state.firstTabInLine,
    eventsLength: state.events.length
  };
}
function restoreState(state, snapshot) {
  state.position = snapshot.position;
  state.line = snapshot.line;
  state.lineStart = snapshot.lineStart;
  state.lineIndent = snapshot.lineIndent;
  state.firstTabInLine = snapshot.firstTabInLine;
  state.events.length = snapshot.eventsLength;
}
function throwError(state, message) {
  throwErrorAt(state.input.slice(0, state.length), state.position, message, state.filename);
}
function isEol(c) {
  return c === 10 || c === 13;
}
function isWhiteSpace(c) {
  return c === 9 || c === 32;
}
function isWsOrEol(c) {
  return isWhiteSpace(c) || isEol(c);
}
function isWsOrEolOrEnd(c) {
  return c === 0 || isWsOrEol(c);
}
function isFlowIndicator(c) {
  return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromDecimalCode(c) {
  return c >= 48 && c <= 57 ? c - 48 : -1;
}
function fromHexCode(c) {
  if (c >= 48 && c <= 57) return c - 48;
  const lc = c | 32;
  if (lc >= 97 && lc <= 102) return lc - 97 + 10;
  return -1;
}
function escapedHexLen(c) {
  if (c === 120) return 2;
  if (c === 117) return 4;
  if (c === 85) return 8;
  return 0;
}
function isSimpleEscape(c) {
  return c === 48 || c === 97 || c === 98 || c === 116 || c === 9 || c === 110 || c === 118 || c === 102 || c === 114 || c === 101 || c === 32 || c === 34 || c === 47 || c === 92 || c === 78 || c === 95 || c === 76 || c === 80;
}
function consumeLineBreak(state) {
  if (state.input.charCodeAt(state.position) === 10) state.position++;
  else {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) state.position++;
  }
  state.line++;
  state.lineStart = state.position;
  state.lineIndent = 0;
  state.firstTabInLine = -1;
}
function skipSeparationSpace(state, allowComments) {
  let lineBreaks = 0;
  let ch = state.input.charCodeAt(state.position);
  let hasSeparation = state.position === state.lineStart || isWsOrEol(state.input.charCodeAt(state.position - 1));
  while (ch !== 0) {
    while (isWhiteSpace(ch)) {
      hasSeparation = true;
      if (ch === 9 && state.firstTabInLine === -1) state.firstTabInLine = state.position;
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && hasSeparation && ch === 35) do
      ch = state.input.charCodeAt(++state.position);
    while (!isEol(ch) && ch !== 0);
    if (!isEol(ch)) break;
    consumeLineBreak(state);
    lineBreaks++;
    hasSeparation = true;
    ch = state.input.charCodeAt(state.position);
    while (ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
  }
  return lineBreaks;
}
function testDocumentSeparator(state, position = state.position) {
  const ch = state.input.charCodeAt(position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(position + 1) && ch === state.input.charCodeAt(position + 2)) {
    const following = state.input.charCodeAt(position + 3);
    return following === 0 || isWsOrEol(following);
  }
  return false;
}
function skipUntilLineEnd(state) {
  let ch = state.input.charCodeAt(state.position);
  while (ch !== 0 && !isEol(ch)) ch = state.input.charCodeAt(++state.position);
}
function checkPrintable(state, start, end) {
  if (PATTERN_NON_PRINTABLE.test(state.input.slice(start, end))) throwError(state, "the stream contains non-printable characters");
}
function readTagProperty(state, props, inFlow) {
  if (state.input.charCodeAt(state.position) !== 33) return false;
  if (props.tagStart !== NO_RANGE$1) throwError(state, "duplication of a tag property");
  const start = state.position;
  let isVerbatim = false;
  let isNamed = false;
  let tagHandle = "!";
  let ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  }
  let suffixStart = state.position;
  let tagName;
  if (isVerbatim) {
    while (ch !== 0 && ch !== 62) ch = state.input.charCodeAt(++state.position);
    if (ch !== 62) throwError(state, "unexpected end of the stream within a verbatim tag");
    tagName = state.input.slice(suffixStart, state.position);
    state.position++;
  } else {
    while (ch !== 0 && !isWsOrEol(ch) && !(inFlow && isFlowIndicator(ch))) {
      if (ch === 33) if (!isNamed) {
        tagHandle = state.input.slice(suffixStart - 1, state.position + 1);
        if (!PATTERN_TAG_HANDLE.test(tagHandle)) throwError(state, "named tag handle cannot contain such characters");
        isNamed = true;
        suffixStart = state.position + 1;
      } else throwError(state, "tag suffix cannot contain exclamation marks");
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(suffixStart, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) throwError(state, "tag suffix cannot contain flow indicator characters");
  }
  if (tagName && !(isVerbatim ? PATTERN_TAG_URI.test(tagName) : PATTERN_TAG_SUFFIX.test(tagName))) throwError(state, `tag name cannot contain such characters: ${tagName}`);
  if (!isVerbatim && tagHandle !== "!" && tagHandle !== "!!" && !HAS_OWN.call(state.tagHandlers, tagHandle)) throwError(state, `undeclared tag handle "${tagHandle}"`);
  props.tagStart = start;
  props.tagEnd = state.position;
  return true;
}
function readAnchorProperty(state, props) {
  if (state.input.charCodeAt(state.position) !== 38) return false;
  if (props.anchorStart !== NO_RANGE$1) throwError(state, "duplication of an anchor property");
  state.position++;
  const start = state.position;
  while (state.input.charCodeAt(state.position) !== 0 && !isWsOrEol(state.input.charCodeAt(state.position)) && !isFlowIndicator(state.input.charCodeAt(state.position))) state.position++;
  if (state.position === start) throwError(state, "name of an anchor node must contain at least one character");
  props.anchorStart = start;
  props.anchorEnd = state.position;
  return true;
}
function readAlias(state, props) {
  if (state.input.charCodeAt(state.position) !== 42) return false;
  if (props.anchorStart !== NO_RANGE$1 || props.tagStart !== NO_RANGE$1) throwError(state, "alias node should not have any properties");
  state.position++;
  const start = state.position;
  while (state.input.charCodeAt(state.position) !== 0 && !isWsOrEol(state.input.charCodeAt(state.position)) && !isFlowIndicator(state.input.charCodeAt(state.position))) state.position++;
  if (state.position === start) throwError(state, "name of an alias node must contain at least one character");
  addAliasEvent(state, start, state.position);
  return true;
}
function readFlowScalarBreak(state, nodeIndent) {
  skipSeparationSpace(state, false);
  if (state.lineIndent < nodeIndent) throwError(state, "deficient indentation");
}
function readSingleQuotedScalar(state, nodeIndent, props) {
  if (state.input.charCodeAt(state.position) !== 39) return false;
  state.position++;
  const start = state.position;
  let simple = true;
  while (state.input.charCodeAt(state.position) !== 0) {
    const ch = state.input.charCodeAt(state.position);
    if (ch === 39) {
      if (state.input.charCodeAt(state.position + 1) === 39) {
        simple = false;
        state.position += 2;
        continue;
      }
      const end = state.position;
      state.position++;
      addScalarEvent(state, start, end, props.anchorStart, props.anchorEnd, props.tagStart, props.tagEnd, 2, 1, -1, simple);
      return true;
    }
    if (isEol(ch)) {
      simple = false;
      readFlowScalarBreak(state, nodeIndent);
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) throwError(state, "unexpected end of the document within a single quoted scalar");
    else if (ch !== 9 && ch < 32) throwError(state, "expected valid JSON character");
    else state.position++;
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent, props) {
  if (state.input.charCodeAt(state.position) !== 34) return false;
  state.position++;
  const start = state.position;
  let simple = true;
  while (state.input.charCodeAt(state.position) !== 0) {
    const ch = state.input.charCodeAt(state.position);
    if (ch === 34) {
      const end = state.position;
      state.position++;
      addScalarEvent(state, start, end, props.anchorStart, props.anchorEnd, props.tagStart, props.tagEnd, 3, 1, -1, simple);
      return true;
    }
    if (ch === 92) {
      simple = false;
      const escaped = state.input.charCodeAt(++state.position);
      if (isEol(escaped)) readFlowScalarBreak(state, nodeIndent);
      else if (isSimpleEscape(escaped)) state.position++;
      else {
        let hexLength = escapedHexLen(escaped);
        if (hexLength === 0) throwError(state, "unknown escape sequence");
        while (hexLength-- > 0) {
          state.position++;
          if (fromHexCode(state.input.charCodeAt(state.position)) < 0) throwError(state, "expected hexadecimal character");
        }
        state.position++;
      }
    } else if (isEol(ch)) {
      simple = false;
      readFlowScalarBreak(state, nodeIndent);
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) throwError(state, "unexpected end of the document within a double quoted scalar");
    else if (ch !== 9 && ch < 32) throwError(state, "expected valid JSON character");
    else state.position++;
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readBlockScalar(state, parentIndent, props) {
  const ch = state.input.charCodeAt(state.position);
  let chomping = 1;
  let indent = -1;
  let detectedIndent = false;
  if (ch !== 124 && ch !== 62) return false;
  const style = ch === 124 ? 4 : 5;
  state.position++;
  while (state.input.charCodeAt(state.position) !== 0) {
    const current = state.input.charCodeAt(state.position);
    const digit = fromDecimalCode(current);
    if (current === 43 || current === 45) {
      if (chomping !== 1) throwError(state, "repeat of a chomping mode identifier");
      chomping = current === 43 ? 3 : 2;
      state.position++;
    } else if (digit >= 0) {
      if (digit === 0) throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      if (detectedIndent) throwError(state, "repeat of an indentation width identifier");
      indent = parentIndent + digit - 1;
      detectedIndent = true;
      state.position++;
    } else break;
  }
  let hadWhitespace = false;
  while (isWhiteSpace(state.input.charCodeAt(state.position))) {
    hadWhitespace = true;
    state.position++;
  }
  if (hadWhitespace && state.input.charCodeAt(state.position) === 35) skipUntilLineEnd(state);
  if (isEol(state.input.charCodeAt(state.position))) consumeLineBreak(state);
  else if (state.input.charCodeAt(state.position) !== 0) throwError(state, "a line break is expected");
  let contentIndent = detectedIndent ? indent : -1;
  let maxLeadingIndent = 0;
  const valueStart = state.position;
  let valueEnd = state.position;
  while (state.input.charCodeAt(state.position) !== 0) {
    const linePosition = state.position;
    let column = 0;
    while (state.input.charCodeAt(linePosition + column) === 32) column++;
    const first = state.input.charCodeAt(linePosition + column);
    if (first === 0) {
      if (contentIndent >= 0) {
        if (column > contentIndent) valueEnd = linePosition + column;
      } else if (column > 0) valueEnd = linePosition + column;
      break;
    }
    if (linePosition === state.lineStart && testDocumentSeparator(state, linePosition)) break;
    if (!detectedIndent && contentIndent === -1 && isEol(first)) maxLeadingIndent = Math.max(maxLeadingIndent, column);
    if (!detectedIndent && contentIndent === -1 && !isEol(first)) {
      if (first === 9 && column < parentIndent) {
        state.position = linePosition + column;
        throwError(state, "tab characters must not be used in indentation");
      }
      if (column < maxLeadingIndent) {
        state.position = linePosition + column;
        throwError(state, "bad indentation of a mapping entry");
      }
    }
    if (contentIndent === -1 && first !== 0 && !isEol(first) && column < parentIndent) {
      state.lineIndent = column;
      state.position = linePosition + column;
      break;
    }
    if (!detectedIndent && first !== 0 && !isEol(first) && contentIndent === -1) contentIndent = column;
    const requiredIndent = contentIndent === -1 ? parentIndent + 1 : contentIndent;
    if (first !== 0 && !isEol(first) && column < requiredIndent) {
      state.lineIndent = column;
      state.position = linePosition + column;
      break;
    }
    skipUntilLineEnd(state);
    valueEnd = state.position;
    if (isEol(state.input.charCodeAt(state.position))) {
      consumeLineBreak(state);
      valueEnd = state.position;
    }
  }
  checkPrintable(state, valueStart, valueEnd);
  addScalarEvent(state, valueStart, valueEnd, props.anchorStart, props.anchorEnd, props.tagStart, props.tagEnd, style, chomping, contentIndent);
  return true;
}
function canStartPlainScalar(state, nodeContext) {
  const ch = state.input.charCodeAt(state.position);
  const inFlow = nodeContext === CONTEXT_FLOW_IN;
  if (ch === 0 || isWsOrEol(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96 || inFlow && isFlowIndicator(ch)) return false;
  if (ch === 63 || ch === 45) {
    const following = state.input.charCodeAt(state.position + 1);
    if (isWsOrEolOrEnd(following) || inFlow && isFlowIndicator(following)) return false;
  }
  return true;
}
function readPlainScalar(state, nodeIndent, nodeContext, props) {
  if (!canStartPlainScalar(state, nodeContext)) return false;
  const start = state.position;
  let end = state.position;
  let ch = state.input.charCodeAt(state.position);
  const inFlow = nodeContext === CONTEXT_FLOW_IN;
  let multiline = false;
  while (ch !== 0) {
    if (state.position === state.lineStart && testDocumentSeparator(state)) break;
    if (ch === 58) {
      const following = state.input.charCodeAt(state.position + 1);
      if (isWsOrEolOrEnd(following) || inFlow && isFlowIndicator(following)) break;
    } else if (ch === 35) {
      if (isWsOrEol(state.input.charCodeAt(state.position - 1))) break;
    } else if (inFlow && isFlowIndicator(ch)) break;
    else if (isEol(ch)) {
      const savedPosition = state.position;
      const savedLine = state.line;
      const savedLineStart = state.lineStart;
      const savedLineIndent = state.lineIndent;
      skipSeparationSpace(state, false);
      if (state.lineIndent >= nodeIndent) {
        multiline = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      }
      state.position = savedPosition;
      state.line = savedLine;
      state.lineStart = savedLineStart;
      state.lineIndent = savedLineIndent;
      break;
    }
    if (!isWhiteSpace(ch)) end = state.position + 1;
    ch = state.input.charCodeAt(++state.position);
  }
  if (end === start) return false;
  checkPrintable(state, start, end);
  addScalarEvent(state, start, end, props.anchorStart, props.anchorEnd, props.tagStart, props.tagEnd, 1, 1, -1, !multiline);
  return true;
}
function skipFlowSeparationSpace(state, nodeIndent) {
  const startLine = state.line;
  skipSeparationSpace(state, true);
  if (state.line > startLine && state.lineIndent < nodeIndent || state.firstTabInLine !== -1 && state.lineIndent < nodeIndent) throwError(state, "deficient indentation");
}
function readFlowCollection(state, nodeIndent, props) {
  const ch = state.input.charCodeAt(state.position);
  const isMapping = ch === 123;
  const start = state.position;
  let readNext = true;
  if (ch !== 91 && ch !== 123) return false;
  const terminator = isMapping ? 125 : 93;
  if (isMapping) addMappingEvent(state, start, props.anchorStart, props.anchorEnd, props.tagStart, props.tagEnd, 2);
  else addSequenceEvent(state, start, props.anchorStart, props.anchorEnd, props.tagStart, props.tagEnd, 2);
  state.position++;
  while (state.input.charCodeAt(state.position) !== 0) {
    skipFlowSeparationSpace(state, nodeIndent);
    let ch2 = state.input.charCodeAt(state.position);
    if (ch2 === terminator) {
      state.position++;
      addPopEvent(state);
      return true;
    } else if (!readNext) throwError(state, "missed comma between flow collection entries");
    else if (ch2 === 44) throwError(state, "expected the node content, but found ','");
    let isPair = false;
    let isExplicitPair = false;
    if (ch2 === 63 && isWsOrEol(state.input.charCodeAt(state.position + 1))) {
      isPair = isExplicitPair = true;
      state.position += 1;
      skipFlowSeparationSpace(state, nodeIndent);
    }
    const entryLine = state.line;
    const entryStart = snapshotState(state);
    const keyWasRead = parseNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    skipFlowSeparationSpace(state, nodeIndent);
    ch2 = state.input.charCodeAt(state.position);
    if ((isMapping || isExplicitPair || state.line === entryLine) && ch2 === 58) {
      isPair = true;
      state.position++;
      skipFlowSeparationSpace(state, nodeIndent);
      if (!isMapping) {
        restoreState(state, entryStart);
        addMappingEvent(state, entryStart.position, NO_RANGE$1, NO_RANGE$1, NO_RANGE$1, NO_RANGE$1, 2);
        if (!parseNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true)) addEmptyScalarEvent(state);
        skipFlowSeparationSpace(state, nodeIndent);
        state.position++;
        skipFlowSeparationSpace(state, nodeIndent);
      } else if (!keyWasRead) addEmptyScalarEvent(state);
      if (!parseNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true)) addEmptyScalarEvent(state);
      skipFlowSeparationSpace(state, nodeIndent);
      if (!isMapping) addPopEvent(state);
    } else if (isMapping && isPair) {
      if (!keyWasRead) addEmptyScalarEvent(state);
      addEmptyScalarEvent(state);
    } else if (isMapping) addEmptyScalarEvent(state);
    else if (isPair) {
      restoreState(state, entryStart);
      addMappingEvent(state, entryStart.position, NO_RANGE$1, NO_RANGE$1, NO_RANGE$1, NO_RANGE$1, 2);
      parseNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      addEmptyScalarEvent(state);
      addPopEvent(state);
    }
    ch2 = state.input.charCodeAt(state.position);
    if (ch2 === 44) {
      readNext = true;
      state.position++;
    } else readNext = false;
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockSequence(state, nodeIndent, props) {
  if (state.firstTabInLine !== -1 || state.input.charCodeAt(state.position) !== 45 || !isWsOrEolOrEnd(state.input.charCodeAt(state.position + 1))) return false;
  addSequenceEvent(state, state.position, props.anchorStart, props.anchorEnd, props.tagStart, props.tagEnd, 1);
  while (state.input.charCodeAt(state.position) === 45 && isWsOrEolOrEnd(state.input.charCodeAt(state.position + 1))) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    const entryLine = state.line;
    state.position++;
    const hadBreak = skipSeparationSpace(state, true) > 0;
    if (state.firstTabInLine !== -1 && state.input.charCodeAt(state.position) === 45 && isWsOrEolOrEnd(state.input.charCodeAt(state.position + 1))) throwError(state, "bad indentation of a sequence entry");
    if (hadBreak && state.lineIndent <= nodeIndent) addEmptyScalarEvent(state);
    else parseNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    skipSeparationSpace(state, true);
    if (state.lineIndent < nodeIndent || state.position >= state.length) break;
    if (state.lineIndent > nodeIndent) throwError(state, "bad indentation of a sequence entry");
    if (state.line === entryLine && state.input.charCodeAt(state.position) === 45 && isWsOrEolOrEnd(state.input.charCodeAt(state.position + 1))) throwError(state, "bad indentation of a sequence entry");
  }
  addPopEvent(state);
  return true;
}
function readBlockMapping(state, nodeIndent, flowIndent, props) {
  let atExplicitKey = false;
  let detected = false;
  let mappingOpened = false;
  let pendingExplicitKey = false;
  if (state.firstTabInLine !== -1) return false;
  let ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    const following = state.input.charCodeAt(state.position + 1);
    const entryLine = state.line;
    if ((ch === 63 || ch === 58) && isWsOrEolOrEnd(following)) {
      if (!mappingOpened) {
        addMappingEvent(state, state.position, props.anchorStart, props.anchorEnd, props.tagStart, props.tagEnd, 1);
        mappingOpened = true;
      }
      if (ch === 63) {
        if (atExplicitKey) addEmptyScalarEvent(state);
        detected = true;
        atExplicitKey = true;
      } else if (atExplicitKey) atExplicitKey = false;
      else {
        addEmptyScalarEvent(state);
        detected = true;
        atExplicitKey = false;
      }
      state.position += 1;
      pendingExplicitKey = true;
    } else {
      if (atExplicitKey) {
        addEmptyScalarEvent(state);
        atExplicitKey = false;
      }
      const beforeKey = snapshotState(state);
      if (!parseNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) break;
      if (state.line === entryLine) {
        ch = state.input.charCodeAt(state.position);
        while (isWhiteSpace(ch)) ch = state.input.charCodeAt(++state.position);
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!isWsOrEolOrEnd(ch)) throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          if (!mappingOpened) {
            restoreState(state, beforeKey);
            addMappingEvent(state, beforeKey.position, props.anchorStart, props.anchorEnd, props.tagStart, props.tagEnd, 1);
            mappingOpened = true;
            parseNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true);
            ch = state.input.charCodeAt(state.position);
            while (isWhiteSpace(ch)) ch = state.input.charCodeAt(++state.position);
            state.position++;
          }
          detected = true;
          atExplicitKey = false;
          pendingExplicitKey = false;
        } else if (detected) throwError(state, "expected ':' after a mapping key");
        else {
          if (props.anchorStart !== NO_RANGE$1 || props.tagStart !== NO_RANGE$1) {
            restoreState(state, beforeKey);
            return false;
          }
          return true;
        }
      } else if (detected) throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      else {
        if (props.anchorStart !== NO_RANGE$1 || props.tagStart !== NO_RANGE$1) {
          restoreState(state, beforeKey);
          return false;
        }
        return true;
      }
    }
    if (parseNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, pendingExplicitKey)) pendingExplicitKey = false;
    if (!atExplicitKey) {
      if (pendingExplicitKey) {
        addEmptyScalarEvent(state);
        pendingExplicitKey = false;
      }
    }
    skipSeparationSpace(state, true);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === entryLine || state.lineIndent > nodeIndent) && ch !== 0) throwError(state, "bad indentation of a mapping entry");
    else if (state.lineIndent < nodeIndent) break;
  }
  if (!detected) return false;
  if (atExplicitKey) addEmptyScalarEvent(state);
  if (mappingOpened) addPopEvent(state);
  return true;
}
function parseNode(state, parentIndent, nodeContext, allowToSeek, allowCompact, allowPropertyMapping = true) {
  if (state.depth >= state.maxDepth) throwError(state, `nesting exceeded maxDepth (${state.maxDepth})`);
  state.depth++;
  let indentStatus = 1;
  let atNewLine = false;
  let hasContent = false;
  let propertyStart = null;
  const props = emptyProperties();
  let allowBlockScalars = nodeContext === CONTEXT_BLOCK_OUT || nodeContext === CONTEXT_BLOCK_IN;
  let allowBlockCollections = allowBlockScalars;
  const allowBlockStyles = allowBlockScalars;
  if (allowToSeek && skipSeparationSpace(state, true)) {
    atNewLine = true;
    if (state.lineIndent > parentIndent) indentStatus = 1;
    else if (state.lineIndent === parentIndent) indentStatus = 0;
    else indentStatus = -1;
  }
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    state.depth--;
    return false;
  }
  if (indentStatus === 1) while (true) {
    const ch = state.input.charCodeAt(state.position);
    const propertyState = snapshotState(state);
    if (atNewLine && indentStatus !== 1 && (ch === 33 || ch === 38)) break;
    if (atNewLine && allowBlockStyles && (props.tagStart !== NO_RANGE$1 || props.anchorStart !== NO_RANGE$1) && (ch === 33 || ch === 38)) {
      const fallbackState = snapshotState(state);
      const flowIndent = parentIndent + 1;
      if (readBlockMapping(state, state.position - state.lineStart, flowIndent, props) && state.events[fallbackState.eventsLength]?.type === 3) {
        state.depth--;
        return true;
      }
      restoreState(state, fallbackState);
    }
    if (atNewLine && (ch === 33 && props.tagStart !== NO_RANGE$1 || ch === 38 && props.anchorStart !== NO_RANGE$1)) break;
    if (!readTagProperty(state, props, nodeContext === CONTEXT_FLOW_IN) && !readAnchorProperty(state, props)) break;
    if (propertyStart === null) propertyStart = propertyState;
    if (skipSeparationSpace(state, true)) {
      atNewLine = true;
      allowBlockCollections = allowBlockStyles;
      if (state.lineIndent > parentIndent) indentStatus = 1;
      else if (state.lineIndent === parentIndent) indentStatus = 0;
      else indentStatus = -1;
    } else allowBlockCollections = false;
  }
  if (allowBlockCollections) allowBlockCollections = atNewLine || allowCompact;
  if (indentStatus === 1 || nodeContext === CONTEXT_BLOCK_OUT) {
    const flowIndent = nodeContext === CONTEXT_FLOW_IN || nodeContext === CONTEXT_FLOW_OUT ? parentIndent : parentIndent + 1;
    const blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) if (allowBlockCollections && (readBlockSequence(state, blockIndent, props) || readBlockMapping(state, blockIndent, flowIndent, props)) || readFlowCollection(state, flowIndent, props)) hasContent = true;
    else {
      const ch = state.input.charCodeAt(state.position);
      if (propertyStart !== null && allowPropertyMapping && allowBlockStyles && !allowBlockCollections && ch !== 124 && ch !== 62) {
        const fallbackState = snapshotState(state);
        const propertyIndent = propertyStart.position - propertyStart.lineStart;
        restoreState(state, propertyStart);
        if (readBlockMapping(state, propertyIndent, flowIndent, emptyProperties()) && state.events[fallbackState.eventsLength]?.type === 3) hasContent = true;
        else restoreState(state, fallbackState);
      }
      if (!hasContent && (allowBlockScalars && readBlockScalar(state, flowIndent, props) || readSingleQuotedScalar(state, flowIndent, props) || readDoubleQuotedScalar(state, flowIndent, props) || readAlias(state, props) || readPlainScalar(state, flowIndent, nodeContext, props))) hasContent = true;
    }
    else if (indentStatus === 0) hasContent = allowBlockCollections && readBlockSequence(state, blockIndent, props);
  }
  allowBlockScalars = allowBlockScalars && !hasContent;
  if (!hasContent && (props.anchorStart !== NO_RANGE$1 || props.tagStart !== NO_RANGE$1 || allowBlockScalars)) {
    addScalarEvent(state, NO_RANGE$1, NO_RANGE$1, props.anchorStart, props.anchorEnd, props.tagStart, props.tagEnd, 1);
    hasContent = true;
  }
  state.depth--;
  return hasContent || props.anchorStart !== NO_RANGE$1 || props.tagStart !== NO_RANGE$1;
}
function readDirective(state) {
  if (state.lineIndent > 0 || state.input.charCodeAt(state.position) !== 37) return false;
  state.position++;
  const nameStart = state.position;
  while (state.input.charCodeAt(state.position) !== 0 && !isWsOrEol(state.input.charCodeAt(state.position))) state.position++;
  const name = state.input.slice(nameStart, state.position);
  const args = [];
  if (name.length === 0) throwError(state, "directive name must not be less than one character in length");
  while (state.input.charCodeAt(state.position) !== 0 && !isEol(state.input.charCodeAt(state.position))) {
    while (isWhiteSpace(state.input.charCodeAt(state.position))) state.position++;
    if (state.input.charCodeAt(state.position) === 35 || isEol(state.input.charCodeAt(state.position)) || state.input.charCodeAt(state.position) === 0) break;
    const start = state.position;
    while (state.input.charCodeAt(state.position) !== 0 && !isWsOrEol(state.input.charCodeAt(state.position))) state.position++;
    args.push(state.input.slice(start, state.position));
  }
  if (isEol(state.input.charCodeAt(state.position))) consumeLineBreak(state);
  if (name === "YAML") {
    if (state.directives.some((directive) => directive.kind === "yaml")) throwError(state, "duplication of %YAML directive");
    if (args.length !== 1) throwError(state, "YAML directive accepts exactly one argument");
    const match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) throwError(state, "ill-formed argument of the YAML directive");
    if (parseInt(match[1], 10) !== 1) throwError(state, "unacceptable YAML version of the document");
    state.directives.push({
      kind: "yaml",
      version: args[0]
    });
  } else if (name === "TAG") {
    if (args.length !== 2) throwError(state, "TAG directive accepts exactly two arguments");
    const [handle, prefix] = args;
    if (!PATTERN_TAG_HANDLE.test(handle)) throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    if (HAS_OWN.call(state.tagHandlers, handle)) throwError(state, `there is a previously declared suffix for "${handle}" tag handle`);
    if (!PATTERN_TAG_PREFIX.test(prefix)) throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    state.tagHandlers[handle] = prefix;
    state.directives.push({
      kind: "tag",
      handle,
      prefix
    });
  }
  return true;
}
function readDocument(state) {
  state.directives = [];
  state.tagHandlers = /* @__PURE__ */ Object.create(null);
  let hasDirectives = false;
  skipSeparationSpace(state, true);
  while (readDirective(state)) {
    hasDirectives = true;
    skipSeparationSpace(state, true);
  }
  let explicitStart = false;
  let explicitEnd = false;
  let allowCompact = true;
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45 && isWsOrEolOrEnd(state.input.charCodeAt(state.position + 3))) {
    explicitStart = true;
    const markerLine = state.line;
    state.position += 3;
    skipSeparationSpace(state, true);
    allowCompact = state.line > markerLine;
  } else if (hasDirectives) throwError(state, "directives end mark is expected");
  const documentEventIndex = state.events.length;
  if (!explicitStart && state.position === state.lineStart && state.input.charCodeAt(state.position) === 46 && testDocumentSeparator(state)) {
    state.position += 3;
    skipSeparationSpace(state, true);
    return;
  }
  addDocumentEvent(state, explicitStart, false);
  if (!parseNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, allowCompact, allowCompact)) addEmptyScalarEvent(state);
  skipSeparationSpace(state, true);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    explicitEnd = state.input.charCodeAt(state.position) === 46;
    if (explicitEnd) {
      const markerLine = state.line;
      state.position += 3;
      skipSeparationSpace(state, true);
      if (state.line === markerLine && state.position < state.length) throwError(state, "end of the stream or a document separator is expected");
    }
  }
  const documentEvent = state.events[documentEventIndex];
  if (documentEvent?.type === 1) documentEvent.explicitEnd = explicitEnd;
  addPopEvent(state);
  if (!explicitEnd && state.position < state.length && !(state.position === state.lineStart && testDocumentSeparator(state))) throwError(state, "end of the stream or a document separator is expected");
}
function parseEvents(input, options) {
  const length = input.length;
  const state = {
    ...DEFAULT_PARSER_OPTIONS,
    ...options,
    input: `${input}\0`,
    length,
    position: 0,
    line: 0,
    lineStart: 0,
    lineIndent: 0,
    firstTabInLine: -1,
    depth: 0,
    directives: [],
    tagHandlers: /* @__PURE__ */ Object.create(null),
    events: []
  };
  const nullpos = input.indexOf("\0");
  if (nullpos !== -1) throwErrorAt(input, nullpos, "null byte is not allowed in input", state.filename);
  if (state.input.charCodeAt(state.position) === 65279) state.position++;
  while (state.position < state.length) {
    skipSeparationSpace(state, true);
    if (state.position >= state.length) break;
    const documentStart = state.position;
    readDocument(state);
    if (state.position === documentStart)
      throwError(state, "can not read a document");
  }
  return state.events;
}
var DEFAULT_LOAD_OPTIONS = {
  ...DEFAULT_PARSER_OPTIONS,
  ...DEFAULT_CONSTRUCTOR_OPTIONS
};
function loadDocuments(input, options = {}) {
  const opts = {
    ...DEFAULT_LOAD_OPTIONS,
    ...options
  };
  const source = String(input);
  const PARSER_OPT_KEYS = Object.keys(DEFAULT_PARSER_OPTIONS);
  const CONSTRUCTOR_OPT_KEYS = Object.keys(DEFAULT_CONSTRUCTOR_OPTIONS);
  return constructFromEvents(parseEvents(source, pick(opts, PARSER_OPT_KEYS)), {
    ...pick(opts, CONSTRUCTOR_OPT_KEYS),
    source
  });
}
function load(input, options) {
  const documents = loadDocuments(input, options);
  if (documents.length === 0) throw new YAMLException("expected a document, but the input is empty");
  if (documents.length === 1) return documents[0];
  throw new YAMLException("expected a single document in the stream, but found more");
}
var Style = class {
  constructor() {
    __publicField(this, "tagged", false);
    __publicField(this, "flow", false);
    __publicField(this, "singleQuoted", false);
    __publicField(this, "doubleQuoted", false);
    __publicField(this, "literal", false);
    __publicField(this, "folded", false);
  }
};
var INVALID = /* @__PURE__ */ Symbol("INVALID");
function buildRepresentTypes(schema) {
  const defaultTags = new Set([
    schema.defaultScalarTag,
    schema.defaultSequenceTag,
    schema.defaultMappingTag
  ].filter((t) => t !== void 0));
  const implicitScalars = schema.implicitScalarTags;
  const explicitTags = schema.tags.filter((t) => !(t.nodeKind === "scalar" && t.implicit) && !defaultTags.has(t));
  const defaultTagsLast = schema.tags.filter((t) => defaultTags.has(t));
  return [
    ...implicitScalars.map((tag) => ({
      tag,
      implicitTag: true
    })),
    ...explicitTags.map((tag) => ({
      tag,
      implicitTag: false
    })),
    ...defaultTagsLast.map((tag) => ({
      tag,
      implicitTag: true
    }))
  ];
}
function matchTag(state, object) {
  for (let index = 0, length = state.representTypes.length; index < length; index += 1) {
    const { tag, implicitTag } = state.representTypes[index];
    if (tag.identify && tag.identify(object)) {
      let tagName;
      if (tag.matchByTagPrefix && tag.representTagName) tagName = tag.representTagName(object);
      else tagName = tag.tagName;
      return {
        tag,
        tagName,
        implicitTag
      };
    }
  }
  return null;
}
function build(state, object) {
  if (!state.noRefs && object !== null && typeof object === "object") {
    const existing = state.refs.get(object);
    if (existing) {
      if (existing.anchor === void 0) existing.anchor = `ref_${state.refCounter++}`;
      return {
        kind: "alias",
        tag: "",
        style: new Style(),
        anchor: existing.anchor
      };
    }
  }
  const matched = matchTag(state, object);
  if (!matched) {
    if (object === void 0) return INVALID;
    if (state.skipInvalid) return INVALID;
    throw new YAMLException(`unacceptable kind of an object to dump ${Object.prototype.toString.call(object)}`);
  }
  const { tag, tagName, implicitTag } = matched;
  const nodeTagName = implicitTag ? tagName : tagNameShort(tagName);
  if (tag.nodeKind === "scalar") {
    const style2 = new Style();
    style2.tagged = !implicitTag;
    return {
      kind: "scalar",
      tag: nodeTagName,
      style: style2,
      value: tag.represent(object)
    };
  }
  if (tag.nodeKind === "sequence") {
    const container = tag.represent(object);
    const style2 = new Style();
    style2.tagged = !implicitTag;
    const node2 = {
      kind: "sequence",
      tag: nodeTagName,
      style: style2,
      items: []
    };
    if (!state.noRefs) state.refs.set(object, node2);
    for (let index = 0, length = container.length; index < length; index += 1) {
      let item = build(state, container[index]);
      if (item === INVALID && container[index] === void 0) item = build(state, null);
      if (item === INVALID) continue;
      node2.items.push(item);
    }
    return node2;
  }
  const map = tag.represent(object);
  const style = new Style();
  style.tagged = !implicitTag;
  const node = {
    kind: "mapping",
    tag: nodeTagName,
    style,
    items: []
  };
  if (!state.noRefs) state.refs.set(object, node);
  for (const [objectKey, objectValue] of map) {
    const key = build(state, objectKey);
    if (key === INVALID) continue;
    const value = build(state, objectValue);
    if (value === INVALID) continue;
    node.items.push({
      key,
      value
    });
  }
  return node;
}
function jsToAst(input, schema, options = {}) {
  const root = build({
    representTypes: buildRepresentTypes(schema),
    noRefs: options.noRefs ?? false,
    skipInvalid: options.skipInvalid ?? false,
    refs: /* @__PURE__ */ new Map(),
    refCounter: 0
  }, input);
  return [{
    contents: root === INVALID ? null : root,
    directives: []
  }];
}
var VISIT_BREAK = /* @__PURE__ */ Symbol("visit:break");
var VISIT_SKIP = /* @__PURE__ */ Symbol("visit:skip");
function visitNode(node, visitor, ctx) {
  const control = visitor(node, ctx);
  if (control === VISIT_BREAK) return true;
  if (control === VISIT_SKIP) return false;
  const depth = ctx.depth + 1;
  switch (node.kind) {
    case "sequence":
      for (const item of node.items) if (visitNode(item, visitor, {
        depth,
        parent: node,
        isKey: false
      })) return true;
      break;
    case "mapping":
      for (const { key, value } of node.items) {
        if (visitNode(key, visitor, {
          depth,
          parent: node,
          isKey: true
        })) return true;
        if (visitNode(value, visitor, {
          depth,
          parent: node,
          isKey: false
        })) return true;
      }
      break;
  }
  return false;
}
function visit(documents, visitor) {
  for (const doc of documents) if (doc.contents && visitNode(doc.contents, visitor, {
    depth: 0,
    parent: null,
    isKey: false
  })) return;
}
var CHAR_BOM = 65279;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = '\\"';
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEFAULT_PRESENTER_OPTIONS = {
  indent: 2,
  seqNoIndent: false,
  seqInlineFirst: true,
  sortKeys: false,
  lineWidth: 80,
  flowBracketPadding: false,
  flowSkipCommaSpace: false,
  flowSkipColonSpace: false,
  quoteFlowKeys: false,
  quoteStyle: "single",
  forceQuotes: false,
  tagBeforeAnchor: false
};
function nodeTagShort(node) {
  return node.style.tagged ? node.tag : tagNameShort(node.tag);
}
function createPresenterState(options) {
  const opts = {
    ...DEFAULT_PRESENTER_OPTIONS,
    ...options
  };
  return {
    ...opts,
    defaultScalarTagName: opts.schema.defaultScalarTag.tagName,
    implicitResolvers: opts.schema.implicitScalarTags
  };
}
function encodeNonPrintable(character) {
  const string = character.toString(16).toUpperCase();
  const handle = character <= 255 ? "x" : "u";
  const length = character <= 255 ? 2 : 4;
  return `\\${handle}${"0".repeat(length - string.length)}${string}`;
}
function indentString(string, spaces) {
  const ind = " ".repeat(spaces);
  let position = 0;
  let result = "";
  const length = string.length;
  while (position < length) {
    let line;
    const next = string.indexOf("\n", position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== "\n") result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return `
${" ".repeat(state.indent * level)}`;
}
function scalarLayout(state, level) {
  const indent = state.indent * Math.max(1, level);
  return {
    indent,
    blockIndent: level === 0 ? state.indent + 1 : state.indent,
    lineWidth: state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent)
  };
}
function resolveImplicitTag(state, str) {
  for (let index = 0, length = state.implicitResolvers.length; index < length; index += 1) {
    const tagDefinition = state.implicitResolvers[index];
    if (tagDefinition.resolve(str, false, tagDefinition.tagName) !== NOT_RESOLVED) return tagDefinition.tagName;
  }
  return state.defaultScalarTagName;
}
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
function startsWithDocumentSeparator(string) {
  const marker = string.charCodeAt(0);
  if (marker !== CHAR_MINUS && marker !== 46 || string.charCodeAt(1) !== marker || string.charCodeAt(2) !== marker) return false;
  if (string.length === 3) return true;
  const following = string.charCodeAt(3);
  return isWhitespace(following) || following === CHAR_CARRIAGE_RETURN || following === CHAR_LINE_FEED;
}
function isPrintable(c) {
  return c >= 32 && c <= 126 || c >= 161 && c <= 55295 && c !== 8232 && c !== 8233 || c >= 57344 && c <= 65533 && c !== CHAR_BOM || c >= 65536 && c <= 1114111;
}
function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
function isPlainSafe(c, prev, inblock) {
  const cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  const cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (inblock ? cIsNsCharOrWhitespace : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar;
}
function isPlainSafeFirst(c) {
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
function isPlainSafeAtStart(string, inblock) {
  const first = codePointAt(string, 0);
  if (isPlainSafeFirst(first)) return true;
  if (string.length > 1 && (first === CHAR_MINUS || first === CHAR_QUESTION || first === CHAR_COLON)) {
    const second = codePointAt(string, 1);
    return !isWhitespace(second) && isPlainSafe(second, first, inblock);
  }
  return false;
}
function isPlainSafeLast(c) {
  return !isWhitespace(c) && c !== CHAR_COLON;
}
function codePointAt(string, pos) {
  const first = string.charCodeAt(pos);
  let second;
  if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 56320 && second <= 57343) return (first - 55296) * 1024 + second - 56320 + 65536;
  }
  return first;
}
function needIndentIndicator(string) {
  return /^\n* /.test(string);
}
var STYLE_PLAIN = 1;
var STYLE_SINGLE = 2;
var STYLE_LITERAL = 3;
var STYLE_FOLDED = 4;
var STYLE_DOUBLE = 5;
function chooseScalarStyle(state, string, layout, singleLineOnly, forceQuote, inblock) {
  const { blockIndent, lineWidth } = layout;
  let i;
  let char = 0;
  let prevChar = -1;
  let hasLineBreak = false;
  let hasFoldableLine = false;
  const shouldTrackWidth = lineWidth !== -1;
  let previousLineBreak = -1;
  let plain = !startsWithDocumentSeparator(string) && isPlainSafeAtStart(string, inblock) && isPlainSafeLast(codePointAt(string, string.length - 1));
  if (singleLineOnly || forceQuote) for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
    char = codePointAt(string, i);
    if (!isPrintable(char)) return STYLE_DOUBLE;
    plain = plain && isPlainSafe(char, prevChar, inblock);
    prevChar = char;
  }
  else {
    for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) return STYLE_DOUBLE;
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
  }
  if (!hasLineBreak && !hasFoldableLine) {
    if (plain && !forceQuote) return STYLE_PLAIN;
    return state.quoteStyle === "double" ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  if (blockIndent > 9 && needIndentIndicator(string)) return STYLE_DOUBLE;
  return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
}
function renderScalarStyle(string, style, layout) {
  const { indent, blockIndent, lineWidth } = layout;
  switch (style) {
    case STYLE_PLAIN:
      return encodeFlowBreaks(string, indent);
    case STYLE_SINGLE:
      return `'${encodeFlowBreaks(string, indent).replace(/'/g, "''")}'`;
    case STYLE_LITERAL:
      return "|" + blockHeader(string, blockIndent) + dropEndingNewline(indentString(string, indent));
    case STYLE_FOLDED:
      return ">" + blockHeader(string, blockIndent) + dropEndingNewline(indentString(foldBlockScalar(string, lineWidth), indent));
    case STYLE_DOUBLE:
      return `"${escapeString(string)}"`;
  }
}
function resolveScalarStyle(state, node, layout, iskey, inblock) {
  const singleLineOnly = iskey || !inblock;
  if (node.style.singleQuoted) return STYLE_SINGLE;
  if (node.style.doubleQuoted) return STYLE_DOUBLE;
  if (!singleLineOnly) {
    if (node.style.literal) return STYLE_LITERAL;
    if (node.style.folded) return STYLE_FOLDED;
  }
  const string = node.value;
  if (string.length === 0) {
    if (node.style.tagged || resolveImplicitTag(state, string) === node.tag) return STYLE_PLAIN;
    return state.quoteStyle === "double" ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  const style = chooseScalarStyle(state, string, layout, singleLineOnly, state.forceQuotes && !iskey, inblock);
  if (style === STYLE_PLAIN && !node.style.tagged && resolveImplicitTag(state, string) !== node.tag) return state.quoteStyle === "double" ? STYLE_DOUBLE : STYLE_SINGLE;
  return style;
}
function blockHeader(string, indentPerLevel) {
  const indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
  const clip = string[string.length - 1] === "\n";
  return `${indentIndicator}${clip && (string[string.length - 2] === "\n" || string === "\n") ? "+" : clip ? "" : "-"}
`;
}
function encodeFlowBreaks(string, indent) {
  let nextLF = string.indexOf("\n");
  if (nextLF === -1) return string;
  const pad = " ".repeat(indent);
  let result = string.slice(0, nextLF);
  const lineRe = /(\n+)([^\n]*)/g;
  lineRe.lastIndex = nextLF;
  let match;
  while (match = lineRe.exec(string)) {
    const breaks = match[1].length;
    const line = match[2];
    result += "\n".repeat(breaks + 1) + pad + line;
  }
  return result;
}
function dropEndingNewline(string) {
  return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
function foldBlockScalar(string, width) {
  const lineRe = /(\n+)([^\n]*)/g;
  let nextLF = string.indexOf("\n");
  if (nextLF === -1) nextLF = string.length;
  lineRe.lastIndex = nextLF;
  let result = foldLine(string.slice(0, nextLF), width);
  let prevMoreIndented = string[0] === "\n" || string[0] === " ";
  let moreIndented;
  let match;
  while (match = lineRe.exec(string)) {
    const prefix = match[1];
    const line = match[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
function foldLine(line, width) {
  if (line === "" || line[0] === " ") return line;
  const breakRe = / [^ ]/g;
  let match;
  let start = 0;
  let end;
  let curr = 0;
  let next = 0;
  let result = "";
  while (match = breakRe.exec(line)) {
    next = match.index;
    if (next - start > width) {
      end = curr > start ? curr : next;
      result += `
${line.slice(start, end)}`;
      start = end + 1;
    }
    curr = next;
  }
  result += "\n";
  if (line.length - start > width && curr > start) result += `${line.slice(start, curr)}
${line.slice(curr + 1)}`;
  else result += line.slice(start);
  return result.slice(1);
}
function escapeString(string) {
  let result = "";
  let char = 0;
  for (let i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
    char = codePointAt(string, i);
    const escapeSeq = ESCAPE_SEQUENCES[char];
    if (escapeSeq) {
      result += escapeSeq;
      continue;
    }
    if (isPrintable(char)) {
      result += string[i];
      if (char >= 65536) result += string[i + 1];
      continue;
    }
    result += encodeNonPrintable(char);
  }
  return result;
}
function writeFlowSequence(state, level, node) {
  let result = "";
  for (let index = 0, length = node.items.length; index < length; index += 1) {
    const item = writeNode(state, level, node.items[index], {});
    if (result !== "") result += `,${!state.flowSkipCommaSpace ? " " : ""}`;
    result += item;
  }
  const pad = state.flowBracketPadding && result !== "" ? " " : "";
  return `[${pad}${result}${pad}]`;
}
function writeBlockSequence(state, level, node, compact) {
  let result = "";
  for (let index = 0, length = node.items.length; index < length; index += 1) {
    const item = writeNode(state, level + 1, node.items[index], {
      block: true,
      compact: state.seqInlineFirst,
      isblockseq: true
    });
    if (!compact || result !== "") result += generateNextLine(state, level);
    if (item === "" || CHAR_LINE_FEED === item.charCodeAt(0)) result += "-";
    else result += "- ";
    result += item;
  }
  return result;
}
function writeFlowMapping(state, level, node) {
  let result = "";
  const items = sortMappingItems(state, node.items);
  for (const { key, value } of items) {
    let pairBuffer = "";
    if (result !== "") pairBuffer += `,${!state.flowSkipCommaSpace ? " " : ""}`;
    const keyText = writeNode(state, level, key, { iskey: true });
    const explicitPair = keyText.length > 1024;
    if (explicitPair) pairBuffer += "? ";
    else if (state.quoteFlowKeys) pairBuffer += '"';
    const valueText = writeNode(state, level, value, {});
    const sep = state.flowSkipColonSpace || valueText === "" ? "" : " ";
    pairBuffer += `${keyText}${state.quoteFlowKeys && !explicitPair ? '"' : ""}:${sep}${valueText}`;
    result += pairBuffer;
  }
  const pad = state.flowBracketPadding && result !== "" ? " " : "";
  return `{${pad}${result}${pad}}`;
}
function sortKeyValue(key) {
  return key.kind === "scalar" ? key.value : key;
}
function sortMappingItems(state, items) {
  if (!state.sortKeys) return items;
  const copy = items.slice();
  if (state.sortKeys === true) copy.sort((a, b) => {
    const x = sortKeyValue(a.key);
    const y = sortKeyValue(b.key);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  });
  else {
    const fn = state.sortKeys;
    copy.sort((a, b) => fn(sortKeyValue(a.key), sortKeyValue(b.key)));
  }
  return copy;
}
function writeBlockMapping(state, level, node, compact) {
  let result = "";
  const items = sortMappingItems(state, node.items);
  for (let index = 0, length = items.length; index < length; index += 1) {
    let pairBuffer = "";
    if (!compact || result !== "") pairBuffer += generateNextLine(state, level);
    const { key, value } = items[index];
    const keyIsBlock = (key.kind === "mapping" || key.kind === "sequence") && !key.style.flow && key.items.length !== 0 || key.kind === "scalar" && (key.style.literal || key.style.folded);
    const keyText = keyIsBlock ? writeNode(state, level + 1, key, {
      block: true,
      compact: true,
      isblockseq: !cannotBeCompact(state, key, level + 1)
    }) : writeNode(state, level + 1, key, {
      block: true,
      compact: true,
      iskey: true
    });
    const keyHasLineBreak = key.kind === "scalar" && key.value.indexOf("\n") !== -1;
    const explicitPair = keyIsBlock || keyHasLineBreak || keyText.length > 1024;
    if (explicitPair) if (keyText && CHAR_LINE_FEED === keyText.charCodeAt(0)) pairBuffer += "?";
    else pairBuffer += "? ";
    pairBuffer += keyText;
    if (explicitPair) pairBuffer += generateNextLine(state, level);
    const valueText = writeNode(state, level + 1, value, {
      block: true,
      compact: explicitPair,
      isblockseq: explicitPair && !cannotBeCompact(state, value, level + 1)
    });
    const keyIsBareProps = key.kind === "scalar" && key.value === "" && keyText !== "" && keyText.charCodeAt(keyText.length - 1) !== CHAR_SINGLE_QUOTE && keyText.charCodeAt(keyText.length - 1) !== CHAR_DOUBLE_QUOTE;
    const keyColonSep = !explicitPair && (key.kind === "alias" || keyIsBareProps) ? " " : "";
    if (valueText === "" || CHAR_LINE_FEED === valueText.charCodeAt(0)) pairBuffer += `${keyColonSep}:`;
    else pairBuffer += `${keyColonSep}: `;
    pairBuffer += valueText;
    result += pairBuffer;
  }
  return result;
}
function cannotBeCompact(state, node, level) {
  return node.style.tagged || node.anchor !== void 0 || state.indent < 2 && level > 0;
}
function writeNode(state, level, node, ctx) {
  if (node.kind === "alias") return `*${node.anchor}`;
  const { block = false, iskey = false, isblockseq = false } = ctx;
  let compact = ctx.compact ?? false;
  const hasAnchor = node.anchor !== void 0;
  if (cannotBeCompact(state, node, level)) compact = false;
  let body;
  let shouldPrintTag = node.style.tagged;
  const useBlockCollection = block && (node.kind === "mapping" || node.kind === "sequence") && !node.style.flow && node.items.length !== 0;
  if (node.kind === "mapping") if (useBlockCollection) body = writeBlockMapping(state, level, node, compact);
  else body = writeFlowMapping(state, level, node);
  else if (node.kind === "sequence") if (useBlockCollection) if (state.seqNoIndent && !isblockseq && level > 0) body = writeBlockSequence(state, level - 1, node, compact);
  else body = writeBlockSequence(state, level, node, compact);
  else body = writeFlowSequence(state, level, node);
  else {
    const layout = scalarLayout(state, level);
    const style = resolveScalarStyle(state, node, layout, iskey, block);
    body = renderScalarStyle(node.value, style, layout);
    shouldPrintTag = node.style.tagged || style !== STYLE_PLAIN && node.tag !== state.defaultScalarTagName;
  }
  if (useBlockCollection && compact && level > 0 && state.indent > 2) body = `${" ".repeat(state.indent - 2)}${body}`;
  if (shouldPrintTag || hasAnchor) {
    const props = [];
    const tag = shouldPrintTag ? nodeTagShort(node) : null;
    const anchor = hasAnchor ? `&${node.anchor}` : null;
    if (state.tagBeforeAnchor) {
      if (tag !== null) props.push(tag);
      if (anchor !== null) props.push(anchor);
    } else {
      if (anchor !== null) props.push(anchor);
      if (tag !== null) props.push(tag);
    }
    const sep = body === "" || body.charCodeAt(0) === CHAR_LINE_FEED ? "" : " ";
    body = `${props.join(" ")}${sep}${body}`;
  }
  return body;
}
function rootStartsOwnLine(node) {
  return (node.kind === "sequence" || node.kind === "mapping") && !node.style.flow && node.items.length !== 0 && !node.style.tagged && node.anchor === void 0;
}
function isOpenEnded(node) {
  let leaf = node;
  while ((leaf.kind === "sequence" || leaf.kind === "mapping") && !leaf.style.flow && leaf.items.length !== 0) leaf = leaf.kind === "sequence" ? leaf.items[leaf.items.length - 1] : leaf.items[leaf.items.length - 1].value;
  if (leaf.kind !== "scalar" || !(leaf.style.literal || leaf.style.folded)) return false;
  const { value } = leaf;
  return value.endsWith("\n\n") || value === "\n";
}
function writeDocumentDirectives(doc) {
  let result = "";
  for (const directive of doc.directives) {
    if (directive.kind === "yaml") {
      result += `%YAML ${directive.version}
`;
      continue;
    }
    const { handle, prefix } = directive;
    result += `%TAG ${handle} ${prefix}
`;
  }
  return result;
}
function present(documents, options) {
  const state = createPresenterState(options);
  let result = "";
  let previousEnded = false;
  for (let index = 0; index < documents.length; index += 1) {
    const doc = documents[index];
    const directives = writeDocumentDirectives(doc);
    const hasDirectives = directives !== "";
    const marker = doc.explicitStart || hasDirectives || index > 0 && !previousEnded;
    result += directives;
    if (doc.contents === null) {
      if (marker) result += "---\n";
    } else if (marker) {
      const body = writeNode(state, 0, doc.contents, {
        block: true,
        compact: true
      });
      const sep = body === "" ? "" : hasDirectives || rootStartsOwnLine(doc.contents) ? "\n" : " ";
      result += `---${sep}${body}
`;
    } else result += writeNode(state, 0, doc.contents, {
      block: true,
      compact: true
    }) + "\n";
    previousEnded = doc.explicitEnd || doc.contents !== null && isOpenEnded(doc.contents);
    if (previousEnded) result += "...\n";
  }
  return result;
}
var DEFAULT_DUMP_SCHEMA = YAML11_SCHEMA.withTags({
  ...intYaml11Tag,
  resolve: (source, isExplicit, tagName) => {
    const result = intYaml11Tag.resolve(source, isExplicit, tagName);
    return result === NOT_RESOLVED ? intCoreTag.resolve(source, isExplicit, tagName) : result;
  }
}, {
  ...floatYaml11Tag,
  resolve: (source, isExplicit, tagName) => {
    const result = floatYaml11Tag.resolve(source, isExplicit, tagName);
    return result === NOT_RESOLVED ? floatCoreTag.resolve(source, isExplicit, tagName) : result;
  }
});
var DEFAULT_DUMP_OPTIONS = {
  ...DEFAULT_PRESENTER_OPTIONS,
  schema: DEFAULT_DUMP_SCHEMA,
  skipInvalid: false,
  noRefs: false,
  flowLevel: -1,
  transform: () => {
  }
};
function dump(input, options = {}) {
  const opts = {
    ...DEFAULT_DUMP_OPTIONS,
    ...options
  };
  const documents = jsToAst(input, opts.schema, {
    noRefs: opts.noRefs,
    skipInvalid: opts.skipInvalid
  });
  if (opts.flowLevel >= 0) visit(documents, (node, ctx) => {
    if (ctx.depth < opts.flowLevel) return;
    node.style.flow = true;
    return VISIT_SKIP;
  });
  opts.transform(documents);
  return present(documents, {
    ...pick(opts, Object.keys(DEFAULT_PRESENTER_OPTIONS)),
    schema: opts.schema
  });
}

// ../shared/dist/yaml.js
var FM_DELIMITER = "---";
var FIELD_ORDER = [
  "feishu_id",
  "feishu_doc_id",
  "feishu_title",
  "sync_hash",
  "sync_time",
  "\u6807\u7B7E",
  "\u7F16\u7801",
  "\u8F93\u5165",
  "\u65E5\u671F",
  "\u65E5\u671F\u7D22\u5F15",
  "\u5173\u952E\u8BCD",
  "\u6982\u8FF0",
  "\u8BC4\u5206",
  "\u8BC4\u5206_\u663E\u793A",
  "\u7D22\u5F15_\u77E5\u8BC6\u5E93",
  "\u7D22\u5F15_\u989C\u8272",
  "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988",
  "\u7D22\u5F15_\u5757",
  "\u7D22\u5F15_\u98CE\u9669"
];
function isEmpty(v) {
  if (v === void 0 || v === null)
    return true;
  return false;
}
function serializeFrontmatter(fm) {
  const ordered = {};
  for (const key of FIELD_ORDER) {
    if (!isEmpty(fm[key])) {
      ordered[key] = fm[key];
    }
  }
  for (const [k, v] of Object.entries(fm)) {
    if (!(k in ordered) && !isEmpty(v)) {
      ordered[k] = v;
    }
  }
  const yamlStr = dump(ordered, {
    lineWidth: -1,
    // 不折行（表格等长行不破坏）
    quoteStyle: "double",
    // 字符串用双引号（保留 emoji）
    forceQuotes: false,
    sortKeys: false
    // 我们自己控制顺序
  });
  return `${FM_DELIMITER}
${yamlStr}${FM_DELIMITER}`;
}
function parseFrontmatter(content) {
  const offset = content.charCodeAt(0) === 65279 ? 1 : 0;
  if (!content.startsWith(FM_DELIMITER, offset)) {
    return { frontmatter: null, body: content };
  }
  const rest = content.slice(offset + FM_DELIMITER.length);
  const match = rest.match(/^\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!match) {
    return { frontmatter: null, body: content };
  }
  const yamlBlock = match[1];
  const bodyStart = offset + FM_DELIMITER.length + match[0].length;
  const body = content.slice(bodyStart).replace(/^(?:\r?\n)+/, "");
  try {
    const fm = load(yamlBlock);
    return { frontmatter: fm ?? {}, body };
  } catch (e) {
    console.warn("[sync/shared] frontmatter parse failed:", e);
    return { frontmatter: null, body: content };
  }
}
function assembleFile(fm, body) {
  return `${serializeFrontmatter(fm)}

${body}`;
}

// ../shared/dist/callout.js
var VS_RE = /\uFE0F/gu;
function stripVariationSelectors(s) {
  return s.replace(VS_RE, "");
}
function unescapeFeishuTilde(s) {
  return s.replace(/\\~/g, "~");
}
function formatTagValue(tag) {
  if (!tag)
    return "";
  return `${TAG_NAMES[tag]} ${tag}`;
}
function parseTagValue(value) {
  const normalized = stripVariationSelectors(value).trim();
  const direct = normalized.match(/(?:^|\s)([SXLZQJ])(?:\s|$)/);
  const compact = normalized.match(/[SXLZQJ]/);
  const tag = direct?.[1] ?? compact?.[0];
  return tag && ["S", "X", "L", "Z", "Q", "J"].includes(tag) ? tag : null;
}
function mapFeishuBgToObType(bgColor) {
  if (!bgColor)
    return "tip";
  if (FEISHU_BG_TO_OB_CALLOUT[bgColor])
    return FEISHU_BG_TO_OB_CALLOUT[bgColor];
  const normalized = bgColor.replace(/\s+/g, "").toLowerCase();
  const rgbMap = {
    "rgb(255,245,235)": "tip",
    "rgb(254,212,164)": "tip",
    "rgba(255,246,122,0.8)": "tip",
    "rgb(255,240,240)": "warning",
    "rgb(242,243,245)": "quote",
    "rgb(240,244,255)": "info",
    "rgb(240,253,244)": "success"
  };
  return rgbMap[normalized] ?? "abstract";
}
function htmlBlockToTextLines(html) {
  const lines = [];
  const blockRe = /<(?:p|li)\b[^>]*>([\s\S]*?)<\/(?:p|li)>/g;
  let m;
  while ((m = blockRe.exec(html)) !== null) {
    const text = htmlToPlainText(m[1]);
    if (text)
      lines.push(...text.split("\n").map((line) => line.trim()).filter(Boolean));
  }
  if (lines.length > 0)
    return lines;
  const fallback = htmlToPlainText(html);
  return fallback ? fallback.split("\n").map((line) => line.trim()).filter(Boolean) : [];
}
function htmlToPlainText(html) {
  return html.replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'").trim();
}
function metaToCalloutXml(meta) {
  const lines = [];
  for (const item of CALLOUT_FIELD_MAP) {
    const raw = meta[item.field];
    if (raw === void 0 || raw === null || raw === "" || Array.isArray(raw) && raw.length === 0)
      continue;
    let value;
    if (item.field === "\u6807\u7B7E") {
      value = formatTagValue(raw);
    } else if (item.field === "\u8BC4\u5206_\u663E\u793A") {
      value = stripVariationSelectors(String(raw));
    } else if (Array.isArray(raw)) {
      value = raw.join(" \xB7 ");
    } else {
      value = stripVariationSelectors(String(raw));
    }
    if (!value)
      continue;
    lines.push(`<li><b>${item.label}</b>\uFF1A${value}</li>`);
  }
  if (lines.length === 0)
    return "";
  const { emoji, ...attrs } = DOC_INFO_CALLOUT;
  const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(" ");
  const cleanEmoji = stripVariationSelectors(emoji);
  return [
    `<callout emoji="${cleanEmoji}" ${attrStr}>`,
    `<p><b>\u6587\u6863\u4FE1\u606F</b></p>`,
    `<ul>`,
    ...lines,
    `</ul>`,
    `</callout>`,
    ""
  ].join("\n");
}
function calloutXmlToMeta(xml) {
  const result = {};
  const calloutRe = /<callout\b[^>]*>\s*<p><b>文档信息<\/b><\/p>\s*<ul>([\s\S]*?)<\/ul>\s*<\/callout>/;
  const calloutMatch = xml.match(calloutRe);
  if (!calloutMatch)
    return result;
  const ulContent = calloutMatch[1];
  const liRe = /<li><b>([^<]+)<\/b>[：:](.+?)<\/li>/g;
  let m;
  while ((m = liRe.exec(ulContent)) !== null) {
    const label = m[1].trim();
    const value = unescapeFeishuTilde(m[2].trim());
    if (label === "\u6807\u7B7E") {
      const tag = parseTagValue(value);
      if (tag)
        result.\u6807\u7B7E = tag;
    } else if (label === "\u7F16\u7801") {
      result.\u7F16\u7801 = value.replace(/^🔢\s*/, "").trim();
    } else if (label === "\u8F93\u5165") {
      result.\u8F93\u5165 = value.replace(/^📥\s*/, "").trim();
    } else if (label === "\u65E5\u671F") {
      result.\u65E5\u671F = value.replace(/^📅\s*/, "").trim();
    } else if (label === "\u5173\u952E\u8BCD") {
      result.\u5173\u952E\u8BCD = value.replace(/^🔑\s*/, "").trim();
    } else if (label === "\u8BC4\u5206") {
      result.\u8BC4\u5206_\u663E\u793A = stripVariationSelectors(value);
      const starCount = (value.match(/🌟/g) || []).length;
      if (starCount >= 1 && starCount <= 5) {
        result.\u8BC4\u5206 = starCount;
      }
    } else if (label === "\u7D22\u5F15") {
      parseIndexField(value, result);
    }
  }
  return result;
}
function parseIndexField(value, result) {
  const parts = value.split(/[·\n]/).map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    const cleaned = stripVariationSelectors(part);
    for (const kw of ["\u6B63\u8D22", "\u504F\u8D22", "\u6B63\u5370", "\u504F\u5370", "\u6B63\u5BAB", "\u4F24\u5B98"]) {
      if (cleaned.includes(kw)) {
        result.\u7D22\u5F15_\u77E5\u8BC6\u5E93 = kw;
        break;
      }
    }
    for (const kw of ["\u7761\u7720", "\u5DE5\u4F5C", "\u751F\u6D3B", "\u5A31\u4E50", "\u793E\u4EA4", "\u5B66\u4E60", "\u8FD0\u52A8"]) {
      if (cleaned.includes(kw)) {
        result.\u7D22\u5F15_\u989C\u8272 = cleaned;
        break;
      }
    }
    for (const kw of ["\u60F3\u6CD5", "\u89C4\u5212", "\u6267\u884C", "\u53D7\u632B", "\u514B\u670D", "\u521D\u7A3F", "\u5BA1\u6838", "\u4FEE\u6539", "\u5B8C\u6210", "\u590D\u76D8"]) {
      if (cleaned.includes(kw)) {
        result["\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988"] = result["\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988"] ?? [];
        if (!result["\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988"].includes(kw))
          result["\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988"].push(kw);
        break;
      }
    }
    for (const kw of ["\u62BD\u8C61", "\u5177\u8C61", "\u7B80\u5355", "\u56F0\u96BE"]) {
      if (cleaned.includes(kw) && kw !== cleaned) {
        result.\u7D22\u5F15_\u5757 = result.\u7D22\u5F15_\u5757 ?? [];
        if (!result.\u7D22\u5F15_\u5757.includes(kw))
          result.\u7D22\u5F15_\u5757.push(kw);
      }
    }
    for (const kw of ["\u884C\u4E3A", "\u7BA1\u7406", "\u5065\u5EB7", "\u77E5\u8BC6", "\u793E\u4EA4", "\u5BB6\u5EAD", "\u793E\u4F1A", "\u610F\u5916"]) {
      if (cleaned.includes(kw) && kw !== cleaned) {
        result.\u7D22\u5F15_\u98CE\u9669 = result.\u7D22\u5F15_\u98CE\u9669 ?? [];
        if (!result.\u7D22\u5F15_\u98CE\u9669.includes(kw))
          result.\u7D22\u5F15_\u98CE\u9669.push(kw);
      }
    }
  }
}
function feishuCalloutToOB(xml) {
  const openMatch = xml.match(/<callout\b([^>]*)>/);
  if (!openMatch)
    return xml;
  const attrs = openMatch[1];
  let emoji = "";
  let bgColor = "";
  const emojiMatch = attrs.match(/emoji=["']([^"']+)["']/);
  if (emojiMatch)
    emoji = stripVariationSelectors(emojiMatch[1]);
  const bgMatch = attrs.match(/background-color=["']([^"']+)["']/);
  if (bgMatch)
    bgColor = bgMatch[1];
  const content = xml.replace(/<callout\b[^>]*>/, "").replace(/<\/callout>/, "").trim();
  const obType = mapFeishuBgToObType(bgColor);
  const lines = htmlBlockToTextLines(content);
  const title = `> [!${obType}]${emoji ? ` ${emoji}` : ""}`;
  if (lines.length === 0)
    return title;
  return [title, ...lines.map((line) => `> ${line}`)].join("\n");
}
function convertFeishuCalloutsToOB(xml) {
  const calloutRe = /<callout\b[^>]*>[\s\S]*?<\/callout>/g;
  return xml.replace(calloutRe, (match) => feishuCalloutToOB(match));
}
function obCalloutToFeishu(md) {
  const lines = md.split("\n").map((l) => l.replace(/^>\s?/, ""));
  if (lines.length === 0)
    return md;
  const headerMatch = lines[0].match(/\[!(\w+)\]\s*(.*)/);
  if (!headerMatch)
    return md;
  const obType = headerMatch[1];
  let rest = stripVariationSelectors(headerMatch[2] ?? "").trim();
  const feishu = OB_CALLOUT_TO_FEISHU[obType];
  let emoji = feishu?.emoji ?? "\u{1F4A1}";
  let bg = feishu?.bg ?? "light-blue";
  let border = feishu?.border ?? "blue";
  const emojiMatch = rest.match(/^(\p{Extended_Pictographic})\s*/u);
  if (emojiMatch) {
    emoji = emojiMatch[1];
    rest = rest.slice(emojiMatch[0].length).trimStart();
  }
  const bodyLines = lines.slice(1);
  if (rest) {
    bodyLines.unshift(rest);
  }
  const contentHtml = bodyLines.filter((l) => l.trim()).map((l) => `<p>${l}</p>`).join("\n");
  return [
    `<callout emoji="${emoji}" background-color="${bg}" border-color="${border}">`,
    contentHtml,
    `</callout>`
  ].join("\n");
}
function convertOBCalloutsToFeishu(md) {
  const calloutRe = /(?:^> \[!\w+\].*\n(?:^>.*\n?)*)/gm;
  return md.replace(calloutRe, (match) => obCalloutToFeishu(match));
}

// src/lark/cli.ts
var MIN_VERSION = [1, 0, 52];
function buildEnhancedPath() {
  const extra = [];
  const nvmBase = path.join(os.homedir(), ".nvm/versions/node");
  try {
    const dirs = fs.readdirSync(nvmBase);
    const latest = dirs.map((d) => ({ name: d, ver: parseInt(d.replace(/^v/, ""), 10) })).filter((x) => !Number.isNaN(x.ver)).sort((a, b) => a.ver - b.ver).pop();
    if (latest) extra.push(path.join(nvmBase, latest.name, "bin"));
  } catch {
  }
  extra.push(path.join(os.homedir(), ".local", "bin"));
  extra.push("/opt/homebrew/bin");
  extra.push("/usr/local/bin");
  const base = process.env.PATH ?? "";
  return [...extra.filter((p) => !base.split(path.delimiter).includes(p)), base].join(path.delimiter);
}
var enhancedPath;
var cliEnabled = true;
function getEnhancedPath() {
  return enhancedPath ?? (enhancedPath = buildEnhancedPath());
}
function which(cmd) {
  try {
    const found = (0, import_node_child_process.execFileSync)("/usr/bin/which", [cmd], {
      encoding: "utf8",
      timeout: 3e3,
      env: { ...process.env }
    }).trim();
    if (found) return found;
  } catch {
  }
  try {
    const found = (0, import_node_child_process.execFileSync)("/usr/bin/which", [cmd], {
      encoding: "utf8",
      timeout: 3e3,
      env: { ...process.env, PATH: getEnhancedPath() }
    }).trim();
    return found || null;
  } catch {
    return null;
  }
}
var CLI_CANDIDATES = [
  () => process.env.LARK_CLI_BIN ?? null,
  () => which("larksuite-cli"),
  () => which("lark-cli"),
  () => {
    const nvmBase = path.join(os.homedir(), ".nvm/versions/node");
    try {
      const dirs = fs.readdirSync(nvmBase);
      const latest = dirs.map((d) => ({ name: d, ver: parseInt(d.replace(/^v/, ""), 10) })).filter((x) => !Number.isNaN(x.ver)).sort((a, b) => a.ver - b.ver).pop();
      return latest ? path.join(nvmBase, latest.name, "bin", "lark-cli") : null;
    } catch {
      return null;
    }
  },
  () => path.join(os.homedir(), ".local", "bin", "lark-cli"),
  () => "/opt/homebrew/bin/lark-cli",
  () => "/usr/local/bin/lark-cli"
];
function resolveCli(overridePath) {
  const candidates = overridePath ? [() => overridePath] : CLI_CANDIDATES;
  for (const getCli of candidates) {
    const cli = getCli();
    if (!cli) continue;
    try {
      const ver = (0, import_node_child_process.execFileSync)(cli, ["--version"], {
        encoding: "utf8",
        timeout: 5e3,
        env: { ...process.env, PATH: getEnhancedPath() }
      }).trim();
      const match = ver.match(/(\d+)\.(\d+)\.(\d+)/);
      if (match) {
        const major = parseInt(match[1], 10);
        const minor = parseInt(match[2], 10);
        const patch = parseInt(match[3], 10);
        if (major > MIN_VERSION[0] || major === MIN_VERSION[0] && minor > MIN_VERSION[1] || major === MIN_VERSION[0] && minor === MIN_VERSION[1] && patch >= MIN_VERSION[2]) {
          return { path: cli, version: ver };
        }
      }
      if (ver) return { path: cli, version: ver };
    } catch {
      continue;
    }
  }
  return null;
}
function run(args, options = {}) {
  if (!cliEnabled) throw Object.assign(new Error("lark-cli is disabled because the plugin is unloading"), { code: "CLI_UNLOADING" });
  const { cwd, retries = 3, timeout = 3e4, totalTimeout = timeout * Math.max(1, retries), json: json2 = false } = options;
  const cliPath = process.env.__LARK_CLI_PATH__ || "lark-cli";
  const deadline = Date.now() + Math.max(1, totalTimeout);
  let lastError = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const remaining = deadline - Date.now();
      if (remaining <= 0) throw Object.assign(new Error("lark-cli total deadline exceeded"), { code: "CLI_DEADLINE" });
      const fullArgs = [...args];
      const execOpts = {
        encoding: "utf8",
        timeout: Math.min(timeout, remaining),
        maxBuffer: 10 * 1024 * 1024,
        // 10MB（大文档）
        // 注入增强 PATH：GUI 启动的 Obsidian 拿不到 nvm/homebrew，导致
        // `#!/usr/bin/env node` 找不到 node（cli 是 node 脚本）
        env: { ...process.env, PATH: getEnhancedPath() }
      };
      const contentIdx = fullArgs.indexOf("--content");
      if (contentIdx !== -1 && contentIdx + 1 < fullArgs.length) {
        const contentVal = fullArgs[contentIdx + 1];
        if (contentVal.startsWith("@")) {
          const filePath = contentVal.slice(1);
          const dir = cwd || path.dirname(filePath);
          const baseName = path.basename(filePath);
          fullArgs[contentIdx + 1] = `@./${baseName}`;
          execOpts.cwd = dir;
        }
      } else if (cwd) {
        execOpts.cwd = cwd;
      }
      if (contentIdx !== -1 && contentIdx + 1 < fullArgs.length) {
        const filePath = fullArgs[contentIdx + 1].replace(/^@\.\//, "");
        const executionDirectory = typeof execOpts.cwd === "string" ? execOpts.cwd : process.cwd();
        const fullFilePath = path.join(executionDirectory, filePath);
        try {
          let content = fs.readFileSync(fullFilePath, "utf8");
          content = stripVariationSelectors(content);
          content = content.replace(/\\~/g, "~");
          fs.writeFileSync(fullFilePath, content, "utf8");
        } catch {
        }
      }
      let stdout = (0, import_node_child_process.execFileSync)(cliPath, fullArgs, execOpts);
      stdout = unescapeFeishuTilde(stdout);
      stdout = unwrapLarkEnvelope2(stdout);
      if (json2) {
        const braceIdx = stdout.indexOf("{");
        if (braceIdx !== -1) {
          stdout = stdout.slice(braceIdx);
        }
      }
      return stdout.trim();
    } catch (err) {
      lastError = err;
      const errMsg = err?.message ?? String(err);
      if (isRetryableCliFailure(errMsg)) {
        const remaining = deadline - Date.now();
        const delay = Math.min(1e3 * Math.pow(2, attempt - 1), 1e4, Math.max(0, remaining));
        if (attempt >= retries || delay <= 0) break;
        console.warn(`[sync/lark] attempt ${attempt} failed, retrying in ${delay}ms: ${errMsg}`);
        const ms = delay;
        const buf = new Int32Array(new SharedArrayBuffer(4));
        Atomics.wait(buf, 0, 0, ms);
        continue;
      }
      break;
    }
  }
  throw lastError ?? new Error("lark-cli run failed with unknown error");
}
function disableCli() {
  cliEnabled = false;
}
function enableCli() {
  cliEnabled = true;
}
function isRetryableCliFailure(message) {
  return message.includes("429") || message.includes("ETIMEDOUT") || message.includes("ECONNRESET") || message.includes("socket hang up");
}
function unwrapLarkEnvelope2(stdout) {
  const trimmed = stdout.trimStart();
  if (!trimmed.startsWith("{")) return stdout;
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return stdout;
  }
  const env = parsed;
  if (env && typeof env.ok === "boolean" && env.data?.document?.content !== void 0) {
    const content = env.data.document.content;
    return typeof content === "string" ? content : JSON.stringify(content);
  }
  return stdout;
}
function overwriteDocXml(token, xmlContent, title, _cwd) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "knowflow-write-"));
  const tmpFile = path.join(tmpDir, "content.xml");
  const cleaned = stripVariationSelectors(xmlContent);
  fs.writeFileSync(tmpFile, cleaned, "utf8");
  try {
    run(["docs", "+update", "--doc", token, "--command", "overwrite", "--doc-format", "xml", "--content", "@./content.xml"], { cwd: tmpDir });
    const cleanTitle = stripVariationSelectors(title);
    run([
      "docs",
      "+update",
      "--doc",
      token,
      "--command",
      "str_replace",
      "--doc-format",
      "json",
      "--content",
      JSON.stringify({
        request: [{
          block_type: 1,
          page: {
            elements: [{
              text_run: { content: cleanTitle, text_element_style: { bold: true } }
            }]
          }
        }],
        index: 0
      })
    ], { cwd: tmpDir, timeout: 15e3 });
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
    }
  }
}
function resolveNodeTokenFromUrl(url) {
  const wikiMatch = url.match(/\/wiki\/([A-Za-z0-9]+)/);
  if (wikiMatch) return { node_token: wikiMatch[1] };
  const docxMatch = url.match(/\/docx\/([A-Za-z0-9]+)/);
  if (docxMatch) return { obj_token: docxMatch[1] };
  return {};
}
function getWikiNodeInfo(nodeToken, spaceId) {
  try {
    const output = run([
      "wiki",
      "+node-get",
      "--node-token",
      nodeToken,
      "--space-id",
      spaceId
    ], { json: true });
    const data = JSON.parse(output);
    const objToken = data?.node?.obj_token ?? data?.obj_token ?? data?.obj_token;
    const title = data?.node?.title ?? data?.title ?? "";
    if (objToken) return { obj_token: objToken, title };
    return null;
  } catch (err) {
    console.warn("[sync/lark] wiki +node-get failed:", err);
    return null;
  }
}
function listWikiChildren(spaceId, parentToken) {
  try {
    const output = run([
      "wiki",
      "+node-list",
      "--space-id",
      spaceId,
      "--parent-node-token",
      parentToken
    ], { json: true });
    const data = JSON.parse(output);
    const items = data?.items ?? data?.nodes ?? [];
    return items.map((n) => ({
      node_token: n.node_token ?? "",
      title: n.title ?? "",
      obj_token: n.obj_token ?? ""
    }));
  } catch (err) {
    console.warn("[sync/lark] wiki +node-list failed:", err);
    return [];
  }
}

// src/mapping.ts
var import_obsidian = require("obsidian");
var MAPPING_FILE = ".feishu-sync/mapping.json";
var ROOT_DIR_TO_FEISHU = {
  "0\uFE0F\u20E3\u8F93\u5165": "\u8F93\u5165",
  "1\uFE0F\u20E3\u8F93\u51FA": "\u8F93\u51FA",
  "2\uFE0F\u20E3\u{1F5C3}\u77E5\u8BC6\u6C60": "\u77E5\u8BC6\u6C60",
  "3\uFE0F\u20E3\u9644\u4EF6\u6587\u4EF6": "\u9644\u4EF6",
  "\u{1FAA7}\u5BFC\u5F15": "\u5BFC\u5F15"
};
async function refreshMapping(app, spaceId) {
  if (!spaceId) {
    new import_obsidian.Notice("\u26A0\uFE0F \u672A\u914D\u7F6E space_id\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u9875\u586B\u5199");
    return 0;
  }
  new import_obsidian.Notice("\u{1F504} \u63A8\u5BFC\u76EE\u5F55\u6620\u5C04...");
  const topNodes = listWikiChildren(spaceId, "");
  if (topNodes.length === 0) {
    new import_obsidian.Notice("\u26A0\uFE0F \u62C9\u4E0D\u5230\u98DE\u4E66\u9876\u7EA7\u8282\u70B9\uFF0C\u8BF7\u68C0\u67E5 space_id \u548C lark-cli \u767B\u5F55\u6001");
    return 0;
  }
  const mappings = [];
  for (const [obRoot, feishuTitle] of Object.entries(ROOT_DIR_TO_FEISHU)) {
    const matched = topNodes.find((n) => n.title.includes(feishuTitle) || feishuTitle.includes(n.title));
    if (matched) {
      mappings.push({
        obPath: obRoot,
        feishuNodeToken: matched.node_token,
        feishuTitle: matched.title
      });
    }
  }
  const root = app.vault.getRoot();
  for (const child of root.children) {
    if (!(child instanceof import_obsidian.TFolder)) continue;
    if (!child.name || child.name.startsWith(".")) continue;
    if (!child.children.length) continue;
    const rootMapping = mappings.find((m) => m.obPath === child.name);
    if (!rootMapping) continue;
    const feishuChildren = listWikiChildren(spaceId, rootMapping.feishuNodeToken);
    for (const obSub of child.children) {
      if (!obSub.name || obSub.name.startsWith(".")) continue;
      const cleanObName = obSub.name.replace(/^\d{2}_\d{4}_[SXZLQJ]\d+\s*/, "");
      const matched = feishuChildren.find(
        (n) => n.title.includes(cleanObName) || cleanObName.includes(n.title)
      );
      if (matched) {
        mappings.push({
          obPath: `${child.name}/${obSub.name}`,
          feishuNodeToken: matched.node_token,
          feishuTitle: matched.title
        });
      }
    }
  }
  const cache = {
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    spaceId,
    topNodes: topNodes.map((n) => ({ token: n.node_token, title: n.title })),
    mappings
  };
  await ensureConfigDir(app);
  await app.vault.adapter.write(MAPPING_FILE, JSON.stringify(cache, null, 2));
  new import_obsidian.Notice(`\u2705 \u76EE\u5F55\u6620\u5C04\u5DF2\u66F4\u65B0\uFF08${mappings.length} \u6761\uFF09`);
  return mappings.length;
}
async function ensureConfigDir(app) {
  const dir = ".feishu-sync";
  if (!await app.vault.adapter.exists(dir)) {
    try {
      await app.vault.adapter.mkdir(dir);
    } catch {
    }
  }
}

// src/settingsTab.ts
var FeishuSyncSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "\u98DE\u4E66\u540C\u6B65\u8BBE\u7F6E" });
    new import_obsidian2.Setting(containerEl).setName("\u672C\u5730\u7AEF\u53E3").setDesc("\u6D4F\u89C8\u5668\u6269\u5C55\u8FDE\u63A5 OB \u63D2\u4EF6\u7684\u7AEF\u53E3\uFF08\u4FEE\u6539\u540E\u9700\u91CD\u542F OB \u6216\u91CD\u65B0\u52A0\u8F7D\u63D2\u4EF6\uFF09").addText(
      (text) => text.setValue(String(this.plugin.settings.port)).onChange(async (value) => {
        const port = parseInt(value, 10);
        if (port > 0 && port < 65536) {
          this.plugin.settings.port = port;
          await this.plugin.saveSettings();
        }
      })
    );
    const tokenSetting = new import_obsidian2.Setting(containerEl).setName("\u542F\u52A8\u4EE4\u724C").setDesc("\u6D4F\u89C8\u5668\u6269\u5C55\u9996\u6B21\u8FDE\u63A5\u9700\u7C98\u8D34\u6B64\u4EE4\u724C\u3002\u70B9\u51FB\u590D\u5236\u540E\u7C98\u8D34\u5230\u6269\u5C55\u5F39\u7A97\u3002");
    tokenSetting.addText((text) => {
      text.setValue(this.plugin.settings.syncToken).setDisabled(true).inputEl.style.fontFamily = "monospace";
    });
    tokenSetting.addButton(
      (btn) => btn.setButtonText("\u590D\u5236").setTooltip("\u590D\u5236\u4EE4\u724C\u5230\u526A\u8D34\u677F").onClick(async () => {
        await navigator.clipboard.writeText(this.plugin.settings.syncToken);
        new import_obsidian2.Notice("\u2705 \u4EE4\u724C\u5DF2\u590D\u5236");
      })
    );
    tokenSetting.addButton(
      (btn) => btn.setButtonText("\u91CD\u7F6E").setTooltip("\u751F\u6210\u65B0\u4EE4\u724C\uFF08\u6269\u5C55\u9700\u91CD\u65B0\u7C98\u8D34\uFF09").onClick(async () => {
        this.plugin.settings.syncToken = generateSyncToken();
        await this.plugin.saveSettings();
        this.display();
        new import_obsidian2.Notice("\u{1F504} \u4EE4\u724C\u5DF2\u91CD\u7F6E");
      })
    );
    containerEl.createEl("h3", { text: "lark-cli" });
    const larkInfo = containerEl.createEl("p", {
      text: `\u72B6\u6001\uFF1A${this.plugin.state.larkCliResolved ? "\u2705 " + this.plugin.state.larkCliVersion : "\u274C \u672A\u627E\u5230"}`,
      cls: "setting-item-description"
    });
    new import_obsidian2.Setting(containerEl).setName("lark-cli \u8DEF\u5F84").setDesc("\u7559\u7A7A\u5219\u81EA\u52A8\u63A2\u6D4B\u3002\u5982\u81EA\u52A8\u63A2\u6D4B\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u586B\u5199\u7EDD\u5BF9\u8DEF\u5F84\u3002").addText(
      (text) => text.setValue(this.plugin.settings.larkCliPath).setPlaceholder("\u81EA\u52A8\u63A2\u6D4B").onChange(async (value) => {
        this.plugin.settings.larkCliPath = value;
        await this.plugin.saveSettings();
      })
    ).addButton(
      (btn) => btn.setButtonText("\u6D4B\u8BD5").setTooltip("\u91CD\u65B0\u63A2\u6D4B lark-cli").onClick(async () => {
        const result = resolveCli(this.plugin.settings.larkCliPath || void 0);
        if (result) {
          this.plugin.state.larkCliResolved = result.path;
          this.plugin.state.larkCliVersion = result.version;
          larkInfo.setText(`\u72B6\u6001\uFF1A\u2705 ${result.version}`);
          new import_obsidian2.Notice(`\u2705 \u627E\u5230 ${result.version}`);
        } else {
          this.plugin.state.larkCliResolved = "";
          this.plugin.state.larkCliVersion = "";
          larkInfo.setText("\u72B6\u6001\uFF1A\u274C \u672A\u627E\u5230");
          new import_obsidian2.Notice("\u274C \u672A\u627E\u5230 lark-cli\uFF08\u9700 \u2265 1.0.52\uFF09");
        }
      })
    );
    containerEl.createEl("h3", { text: "\u540C\u6B65\u884C\u4E3A" });
    new import_obsidian2.Setting(containerEl).setName("\u9ED8\u8BA4\u843D\u5730\u76EE\u5F55").setDesc("\u6269\u5C55\u672A\u6307\u5B9A\u76EE\u5F55\u65F6\uFF0C\u98DE\u4E66\u6587\u6863\u843D\u5730\u5230\u6B64\u76EE\u5F55\uFF08\u76F8\u5BF9 vault \u6839\uFF09").addText(
      (text) => text.setValue(this.plugin.settings.defaultDir).onChange(async (value) => {
        this.plugin.settings.defaultDir = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("\u81EA\u52A8\u5206\u914D\u7F16\u7801").setDesc("\u98DE\u4E66\u6587\u6863\u843D\u5730\u540E\u81EA\u52A8\u89E6\u53D1 auto-rename \u7F16\u7801\u5206\u914D").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.autoRename).onChange(async (value) => {
        this.plugin.settings.autoRename = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("\u5220\u9664\u81EA\u52A8\u767B\u8BB0").setDesc("\u4EC5\u767B\u8BB0\u5F85\u786E\u8BA4\u5220\u9664\uFF1B\u4E0D\u4F1A\u81EA\u52A8\u5220\u9664\u98DE\u4E66\u8282\u70B9\uFF0C\u9ED8\u8BA4\u5173\u95ED").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.autoDeleteRegistry).onChange(async (value) => {
        this.plugin.settings.autoDeleteRegistry = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("\u4FDD\u7559\u88C5\u9970\u56FE\u7247").setDesc("\u98DE\u4E66\u6392\u7248\u7269\u6599\uFF08135\u7F16\u8F91\u5668\u98CE\u683C\u7B49\u7EAF\u56FE\u7247\uFF09\u662F\u5426\u843D\u5730\u5230 OB").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.keepDecorativeImages).onChange(async (value) => {
        this.plugin.settings.keepDecorativeImages = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("\u9690\u85CF\u7CFB\u7EDF\u5C5E\u6027").setDesc("\u9690\u85CF _sys_ \u5F00\u5934\u548C\u65E7\u7248\u98DE\u4E66\u540C\u6B65\u5B57\u6BB5\uFF1B\u5B57\u6BB5\u4ECD\u4FDD\u7559\u7ED9\u540C\u6B65\u903B\u8F91\u4F7F\u7528").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.hideSystemProperties).onChange(async (value) => {
        this.plugin.settings.hideSystemProperties = value;
        await this.plugin.saveSettings();
        this.plugin.applySystemPropertiesVisibility();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("\u56FE\u7247\u7F13\u5B58\u6E05\u7406\u5468\u671F").setDesc("feishu://token \u9884\u89C8\u56FE\u7247\u7684\u672C\u5730\u7F13\u5B58\u4FDD\u7559\u65F6\u957F").addDropdown(
      (dropdown) => dropdown.addOption("daily", "\u6BCF\u5929").addOption("weekly", "\u6BCF\u5468").addOption("monthly", "\u6BCF\u6708").addOption("never", "\u6C38\u4E0D").setValue(this.plugin.settings.cacheCleanup).onChange(async (value) => {
        this.plugin.settings.cacheCleanup = value;
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h3", { text: "\u98DE\u4E66\u77E5\u8BC6\u5E93" });
    new import_obsidian2.Setting(containerEl).setName("\u77E5\u8BC6\u5E93 space_id").setDesc("\u76EE\u5F55\u6620\u5C04\u7528\u3002\u65B0\u77E5\u8BC6\u5E93\u9ED8\u8BA4 7651314150060067803").addText(
      (text) => text.setValue(this.plugin.settings.spaceId).onChange(async (value) => {
        this.plugin.settings.spaceId = value;
        await this.plugin.saveSettings();
      })
    ).addButton(
      (btn) => btn.setButtonText("\u5237\u65B0\u6620\u5C04").onClick(async () => {
        await refreshMapping(this.app, this.plugin.settings.spaceId);
      })
    );
  }
};

// src/server.ts
var http = __toESM(require("node:http"), 1);
function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": `${TOKEN_HEADER}, Content-Type`,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}
function startServer(port, deps) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      handleRequest(req, res, port, deps).catch((error) => {
        if (res.headersSent || res.destroyed) return;
        const normalized = normalizeHttpError(error);
        json(res, normalized.status, { ok: false, code: normalized.code, message: normalized.message });
      });
    });
    server.on("error", reject);
    server.listen(port, "127.0.0.1", () => {
      const address = server.address();
      const actualPort = typeof address === "object" && address ? address.port : port;
      console.log(`[sync/server] listening on http://127.0.0.1:${actualPort}`);
      resolve({
        port: actualPort,
        stop: () => new Promise((done) => {
          server.closeAllConnections?.();
          server.close(() => {
            console.log("[sync/server] stopped");
            done();
          });
        })
      });
    });
  });
}
async function handleRequest(req, res, port, deps) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": `${TOKEN_HEADER}, Content-Type`,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    });
    res.end();
    return;
  }
  const fullUrl = req.url ?? "/";
  const urlObj = new URL(fullUrl, `http://localhost:${port}`);
  const ctxPath = urlObj.pathname;
  const handler = deps.routes.get(ctxPath);
  if (!handler) {
    json(res, 404, { ok: false, code: "NOT_FOUND", message: `Unknown path: ${ctxPath}` });
    return;
  }
  const token = req.headers[TOKEN_HEADER.toLowerCase()];
  if (!deps.validateToken(token ?? "")) {
    json(res, 401, { ok: false, code: "UNAUTHORIZED", message: "Invalid or missing X-Sync-Token" });
    return;
  }
  const expectedMethod = ctxPath === "/status" || ctxPath === "/tree" ? "GET" : "POST";
  if (req.method !== expectedMethod) {
    res.setHeader("Allow", expectedMethod);
    json(res, 405, { ok: false, code: "METHOD_NOT_ALLOWED", message: `${ctxPath} requires ${expectedMethod}` });
    return;
  }
  let body;
  if (expectedMethod === "POST") {
    body = await readJsonBody(req, deps.maxBodyBytes ?? 1024 * 1024, deps.bodyTimeoutMs ?? 1e4);
  }
  const controller = new AbortController();
  const timeoutMs = Math.max(1, deps.handlerTimeoutMs ?? 12e4);
  const timeout = expectedMethod === "GET" ? setTimeout(() => controller.abort(), timeoutMs) : void 0;
  try {
    const handlerResult = Promise.resolve(handler({
      method: req.method ?? "GET",
      url: fullUrl,
      path: ctxPath,
      query: urlObj.searchParams,
      body,
      token: token ?? "",
      signal: controller.signal
    }));
    const result = expectedMethod === "GET" ? await Promise.race([handlerResult, new Promise((_resolve, rejectTimeout) => {
      controller.signal.addEventListener("abort", () => {
        rejectTimeout(new HttpError("REQUEST_TIMEOUT", "Request timed out", 504));
      }, { once: true });
    })]) : await handlerResult;
    json(res, 200, result);
  } catch (err) {
    const normalized = normalizeHttpError(err);
    console.error("[sync/server] handler error:", err);
    json(res, normalized.status, { ok: false, code: normalized.code, message: normalized.message });
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
async function readJsonBody(req, maxBodyBytes, timeoutMs) {
  const declaredLength = Number(req.headers["content-length"] ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) {
    req.resume();
    throw new HttpError("BODY_TOO_LARGE", "Request body is too large", 413);
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    let received = 0;
    const timeout = setTimeout(() => finish(new HttpError("BODY_TIMEOUT", "Request body timed out", 408)), timeoutMs);
    const finish = (error, value) => {
      clearTimeout(timeout);
      req.removeListener("data", onData);
      req.removeListener("end", onEnd);
      req.removeListener("error", onError);
      if (error) {
        req.resume();
        reject(error);
      } else resolve(value);
    };
    const onData = (chunk) => {
      received += chunk.length;
      if (received > maxBodyBytes) {
        finish(new HttpError("BODY_TOO_LARGE", "Request body is too large", 413));
        return;
      }
      chunks.push(Buffer.from(chunk));
    };
    const onEnd = () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return finish(void 0, void 0);
      try {
        finish(void 0, JSON.parse(raw));
      } catch {
        finish(new HttpError("BAD_JSON", "Invalid JSON body", 400));
      }
    };
    const onError = (error) => finish(error);
    req.on("data", onData);
    req.on("end", onEnd);
    req.on("error", onError);
  });
}
function normalizeHttpError(error) {
  return {
    code: typeof error?.code === "string" ? error.code : "INTERNAL",
    status: typeof error?.status === "number" ? error.status : 500,
    message: error instanceof Error ? error.message : String(error)
  };
}
var HttpError = class extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
};

// src/handlers/statusHandler.ts
function createStatusHandler(pluginVersion, vaultName, state) {
  return async (_ctx) => {
    return {
      ok: true,
      version: pluginVersion,
      componentVersion: pluginVersion,
      protocolVersion: PROTOCOL_VERSION,
      capabilities: [...SERVER_CAPABILITIES],
      vault: vaultName,
      larkReady: !!state.larkCliResolved,
      larkVersion: state.larkCliVersion || null,
      recentActivity: state.recentSyncs.slice(0, 10)
    };
  };
}

// src/handlers/treeHandler.ts
var import_obsidian3 = require("obsidian");
var EXCLUDE = /* @__PURE__ */ new Set([
  "\u63D2\u4EF6",
  "scripts",
  ".obsidian",
  ".trash",
  ".feishu-sync",
  "node_modules"
]);
var cacheDirs = [];
var cacheTime = 0;
var CACHE_TTL = 5e3;
function buildFullTree(app) {
  const root = app.vault.getRoot();
  const dirs = [];
  const walk = (folder, depth) => {
    if (depth > 0) {
      const name = folder.name;
      if (EXCLUDE.has(name) || name.startsWith(".")) return;
      dirs.push({ path: folder.path, label: name, depth });
    }
    for (const child of folder.children) {
      if (child instanceof import_obsidian3.TFolder) walk(child, depth + 1);
    }
  };
  walk(root, 0);
  dirs.sort((a, b) => a.path.localeCompare(b.path, "zh"));
  return dirs;
}
function createTreeHandler(app) {
  return async (ctx) => {
    const now = Date.now();
    const maxDepth = parseInt(ctx.query.get("maxDepth") || "12", 10);
    const prefix = ctx.query.get("prefix") || "";
    if (now - cacheTime > CACHE_TTL || cacheDirs.length === 0) {
      cacheDirs = buildFullTree(app);
      cacheTime = now;
    }
    let dirs = cacheDirs;
    if (prefix) {
      const prefixDepth = prefix.split("/").length + 1;
      dirs = dirs.filter((d) => d.path.startsWith(prefix + "/") && d.depth <= prefixDepth + 1);
      dirs = dirs.map((d) => ({
        ...d,
        depth: d.depth - prefixDepth + 2
      }));
    } else {
      dirs = dirs.filter((d) => d.depth <= maxDepth);
    }
    return { ok: true, dirs };
  };
}

// src/handlers/fetchHandler.ts
var import_obsidian5 = require("obsidian");

// src/fileio/writer.ts
function parseFile(content) {
  const { frontmatter, body } = parseFrontmatter(content);
  const hash = bodyHash(body);
  return {
    content,
    frontmatter: frontmatter ?? {},
    body,
    hash
  };
}
function buildInitialFrontmatter(feishuId, feishuDocId, feishuTitle, syncTime, meta) {
  return {
    feishu_id: feishuId,
    feishu_doc_id: feishuDocId,
    feishu_title: feishuTitle,
    sync_time: syncTime,
    // 飞书 callout 元数据（空值字段不写入，保持 YAML 干净）
    ...meta && stripEmpty(meta)
    // sync_hash 在写入时由 writer 计算填入
  };
}
function mergeFrontmatterForUpdate(existing, feishuId, feishuDocId, feishuTitle, syncTime, meta) {
  return {
    // 已有字段优先（用户改过的），飞书 callout 元数据只补缺失
    ...meta && stripEmpty(meta),
    ...existing,
    feishu_id: feishuId,
    feishu_doc_id: feishuDocId,
    feishu_title: feishuTitle,
    sync_time: syncTime
  };
}
function stripEmpty(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === void 0 || v === null || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out;
}
function assembleMd(frontmatter, body) {
  const hash = bodyHash(body);
  const fmWithHash = {
    ...frontmatter,
    sync_hash: hash
  };
  return assembleFile(fmWithHash, body);
}
function makeFilename(feishuTitle, override) {
  const name = override ? sanitizeFilename(override) : sanitizeFilename(feishuTitle);
  return withMdExt(name);
}
function makePath(dir, filename) {
  return joinPath(dir, filename);
}

// src/autoRename.ts
var import_obsidian4 = require("obsidian");
var TAG_BY_DIR_HINT = {
  "0\uFE0F\u20E3\u8F93\u5165": "S",
  "1\uFE0F\u20E3\u8F93\u51FA": "X",
  "2\uFE0F\u20E3\u{1F5C3}\u77E5\u8BC6\u6C60": "Z"
};
var CODE_RE = /^(\d{2})_(\d{4})_([SXSLZQJ])_(\d+)(?:_([a-z]\d+))?$/;
function inferTag(dir, existingTag) {
  if (existingTag && ["S", "X", "L", "Z", "Q", "J"].includes(existingTag)) {
    return existingTag;
  }
  for (const [dirHint, tag] of Object.entries(TAG_BY_DIR_HINT)) {
    if (dir.startsWith(dirHint)) return tag;
  }
  if (dir.includes("\u77E5\u8BC6\u6C60") || dir.includes("\u{1F5C3}")) {
    if (dir.includes("L") || dir.includes("\u9886\u57DF")) return "L";
    if (dir.includes("Q") || dir.includes("\u7075\u611F")) return "Q";
    if (dir.includes("J") || dir.includes("\u6280\u80FD")) return "J";
    return "Z";
  }
  if (dir.includes("\u8F93\u51FA") || dir.includes("1\uFE0F\u20E3")) return "X";
  if (dir.includes("\u8F93\u5165") || dir.includes("0\uFE0F\u20E3")) return "S";
  return "S";
}
async function nextSequence(app, dir, tag) {
  const folder = app.vault.getAbstractFileByPath(dir);
  if (!(folder instanceof import_obsidian4.TFolder)) return 1;
  let maxSeq = 0;
  for (const child of folder.children) {
    if (!(child instanceof import_obsidian4.TFile) || !child.name.endsWith(".md")) continue;
    const match = child.name.match(CODE_RE);
    if (match && match[3] === tag) {
      const seq = parseInt(match[4], 10);
      if (seq > maxSeq) maxSeq = seq;
    }
    if (!match) {
      try {
        const content = await app.vault.read(child);
        const { frontmatter } = parseFrontmatter(content);
        const enc = frontmatter?.\u7F16\u7801;
        if (enc) {
          const encMatch = enc.match(CODE_RE);
          if (encMatch && encMatch[3] === tag) {
            const seq = parseInt(encMatch[4], 10);
            if (seq > maxSeq) maxSeq = seq;
          }
        }
      } catch {
        continue;
      }
    }
  }
  return maxSeq + 1;
}
async function assignEncoding(app, filePath, dir) {
  const file = app.vault.getAbstractFileByPath(filePath);
  if (!(file instanceof import_obsidian4.TFile)) return void 0;
  const content = await app.vault.read(file);
  const { frontmatter, body } = parseFrontmatter(content);
  const fm = frontmatter ?? {};
  if (fm.\u7F16\u7801 && CODE_RE.test(fm.\u7F16\u7801)) {
    return fm.\u7F16\u7801;
  }
  const tag = inferTag(dir, fm.\u6807\u7B7E);
  const seq = await nextSequence(app, dir, tag);
  const now = /* @__PURE__ */ new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mmdd = `${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const code = `${yy}_${mmdd}_${tag}_${String(seq).padStart(2, "0")}`;
  const newFm = { ...fm, \u6807\u7B7E: tag, \u7F16\u7801: code };
  const newContent = assembleFile(newFm, body);
  await app.vault.modify(file, newContent);
  const ext = file.extension;
  const oldName = file.basename;
  const newName = `${code} ${oldName}`;
  const newPath = filePath.replace(/[^/]+$/, `${newName}.${ext}`);
  if (newPath !== filePath) {
    try {
      await app.vault.rename(file, newPath);
    } catch (err) {
      console.warn("[sync/autoRename] rename failed:", err);
    }
  }
  return code;
}
async function batchAssignEncoding(app, dir) {
  const folder = app.vault.getAbstractFileByPath(dir);
  if (!(folder instanceof import_obsidian4.TFolder)) return { total: 0, assigned: 0 };
  let assigned = 0;
  let total = 0;
  for (const child of folder.children) {
    if (!(child instanceof import_obsidian4.TFile) || !child.name.endsWith(".md")) continue;
    total++;
    try {
      const result = await assignEncoding(app, child.path, dir);
      if (result) assigned++;
    } catch (err) {
      console.warn(`[sync/autoRename] batch failed for ${child.path}:`, err);
    }
  }
  return { total, assigned };
}

// src/bindingIndex.ts
var BindingConflictError = class extends Error {
  constructor() {
    super(...arguments);
    this.code = "BINDING_CONFLICT";
    this.status = 409;
  }
};
function extractFeishuId(content) {
  const normalized = content.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const frontmatter = normalized.match(/^---[ \t]*\n([\s\S]*?)\n---(?:\n|$)/)?.[1];
  if (!frontmatter) return null;
  const match = frontmatter.match(/^feishu_id[ \t]*:[ \t]*(?:"([A-Za-z0-9_-]+)"|'([A-Za-z0-9_-]+)'|([A-Za-z0-9_-]+))[ \t]*$/m);
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}
function findUniqueBinding(feishuId, entries) {
  const matches = entries.filter((entry) => {
    const root = entry.path.split("/")[0].toLowerCase();
    if (root === ".obsidian" || root === ".feishu-sync") return false;
    return extractFeishuId(entry.content) === feishuId;
  });
  if (matches.length > 1) {
    const paths = matches.map((entry) => entry.path).sort();
    throw new BindingConflictError(`Multiple local files bind feishu_id ${feishuId}: ${paths.join(", ")}`);
  }
  return matches[0] ?? null;
}
function assertReplacementBinding(content, expectedFeishuId, path3) {
  const existingFeishuId = extractFeishuId(content);
  if (existingFeishuId && existingFeishuId !== expectedFeishuId) {
    const error = new BindingConflictError(
      `Refusing to replace ${path3}; it is bound to another feishu_id`
    );
    error.code = "REPLACEMENT_BINDING_CONFLICT";
    throw error;
  }
}

// src/vaultBinding.ts
async function findUniqueVaultBinding(app, feishuId) {
  const entries = [];
  for (const file of app.vault.getMarkdownFiles()) {
    const root = file.path.split("/")[0].toLowerCase();
    if (root === ".obsidian" || root === ".feishu-sync") continue;
    try {
      const content = await app.vault.read(file);
      if (content.includes("feishu_id:")) entries.push({ path: file.path, content, file });
    } catch {
      continue;
    }
  }
  return findUniqueBinding(feishuId, entries)?.file ?? null;
}

// src/vaultPath.ts
var MAX_PATH_BYTES = 1024;
var MAX_SEGMENT_BYTES = 255;
var INTERNAL_ROOTS = /* @__PURE__ */ new Set([".obsidian", ".feishu-sync"]);
var ValidationError = class extends Error {
  constructor(code, message) {
    super(message);
    this.status = 400;
    this.code = code;
  }
};
function unsafePath(message) {
  throw new ValidationError("UNSAFE_VAULT_PATH", message);
}
function normalizeVaultDir(value) {
  if (typeof value !== "string") unsafePath("Vault path must be a string");
  const raw = value.trim();
  if (!raw) return "";
  if (raw.includes("\0")) unsafePath("Vault path contains NUL");
  if (/^(?:\/|\\|[A-Za-z]:)/.test(raw)) unsafePath("Absolute Vault paths are not allowed");
  if (/\\/.test(raw)) unsafePath("Backslash separators are not allowed");
  if (/%(?:2f|5c|00)/i.test(raw)) unsafePath("Encoded separators and NUL are not allowed");
  let decoded;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    unsafePath("Vault path contains malformed percent encoding");
  }
  if (decoded.includes("\0") || decoded.includes("\\")) unsafePath("Decoded Vault path is unsafe");
  const withoutTrailingSlash = raw.replace(/\/+$/, "");
  const decodedWithoutTrailingSlash = decoded.replace(/\/+$/, "");
  const rawSegments = withoutTrailingSlash.split("/");
  const decodedSegments = decodedWithoutTrailingSlash.split("/");
  if (rawSegments.length !== decodedSegments.length) unsafePath("Encoded path separators are not allowed");
  if (decodedSegments.some((segment) => !segment || segment === "." || segment === "..")) {
    unsafePath("Empty and traversal path segments are not allowed");
  }
  const normalizedSegments = rawSegments.map((segment) => segment.trim());
  if (normalizedSegments.some((segment) => !segment)) unsafePath("Empty path segments are not allowed");
  if (INTERNAL_ROOTS.has(decodedSegments[0].trim().toLowerCase())) {
    unsafePath("Internal plugin paths are not writable");
  }
  for (const segment of normalizedSegments) {
    if (Buffer.byteLength(segment, "utf8") > MAX_SEGMENT_BYTES) {
      unsafePath("Vault path segment is too long");
    }
  }
  const normalized = normalizedSegments.join("/");
  if (Buffer.byteLength(normalized, "utf8") > MAX_PATH_BYTES) unsafePath("Vault path is too long");
  return normalized;
}
function normalizeVaultMarkdownPath(value) {
  const normalized = normalizeVaultDir(value);
  if (!normalized || !/\.md$/i.test(normalized)) {
    unsafePath("Vault file path must end in .md");
  }
  return normalized;
}
function validateImageToken(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,256}$/.test(value)) {
    throw new ValidationError("UNSAFE_IMAGE_TOKEN", "Image token is not a safe opaque identifier");
  }
  return value;
}

// src/remoteCanonical.ts
function buildRemoteDocument(rawMarkdown, xml, nodeToken, objToken = "") {
  const resolvedObjToken = objToken || xml.match(/<title[^>]*\bid="([A-Za-z0-9_-]+)"/)?.[1] || "";
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
    meta: xml ? calloutXmlToMeta(xml) : {}
  };
}

// src/remoteDocument.ts
function fetchRemoteDocument(input) {
  let resolvedObjToken = input.objToken ?? "";
  let wikiInfo = null;
  let rawMarkdown;
  try {
    rawMarkdown = fetchFormat(input.nodeToken, "markdown");
  } catch (error) {
    wikiInfo = input.spaceId ? getWikiNodeInfo(input.nodeToken, input.spaceId) : null;
    resolvedObjToken || (resolvedObjToken = wikiInfo?.obj_token ?? "");
    if (!resolvedObjToken) throw error;
    rawMarkdown = fetchFormat(resolvedObjToken, "markdown");
  }
  let xml = "";
  try {
    xml = fetchFormat(input.nodeToken, "xml");
  } catch (error) {
    if (!resolvedObjToken && input.spaceId) {
      wikiInfo ?? (wikiInfo = getWikiNodeInfo(input.nodeToken, input.spaceId));
      resolvedObjToken = wikiInfo?.obj_token ?? "";
    }
    if (resolvedObjToken && resolvedObjToken !== input.nodeToken) {
      try {
        xml = fetchFormat(resolvedObjToken, "xml");
      } catch {
        console.warn("[sync/remote] xml fetch failed; image and callout metadata may be incomplete:", error);
      }
    } else {
      console.warn("[sync/remote] xml fetch failed; image and callout metadata may be incomplete:", error);
    }
  }
  return buildRemoteDocument(rawMarkdown, xml, input.nodeToken, resolvedObjToken);
}
function fetchFormat(token, format) {
  const args = ["docs", "+fetch", "--doc", token, "--doc-format", format];
  if (format === "xml") args.push("--detail", "with-ids");
  return run(args, { timeout: 6e4 });
}

// src/syncDecision.ts
function decideThreeWaySync(input) {
  const baseHash = input.baseHash?.trim();
  if (!baseHash) return { action: "pause", reason: "MISSING_BASE" };
  const localChanged = input.localHash !== baseHash;
  const remoteChanged = input.remoteHash !== baseHash;
  if (!localChanged && !remoteChanged) return { action: "unchanged" };
  if (input.localHash === input.remoteHash) return { action: "converged" };
  if (!localChanged && remoteChanged) return { action: "pull" };
  if (localChanged && !remoteChanged) return { action: "push" };
  return { action: "conflict", reason: "BOTH_CHANGED" };
}
var SyncDecisionError = class extends Error {
  constructor(code, message) {
    super(message);
    this.status = 409;
    this.code = code;
  }
};
function planSyncExecution(intent, decision) {
  if (decision.action === "pause") {
    throw new SyncDecisionError("MISSING_SYNC_BASE", "\u7F3A\u5C11\u53EF\u9760\u540C\u6B65\u57FA\u7EBF\uFF0C\u5DF2\u6682\u505C\u8986\u76D6");
  }
  if (decision.action === "conflict") {
    throw new SyncDecisionError("SYNC_CONFLICT", "\u672C\u5730\u548C\u98DE\u4E66\u90FD\u5DF2\u4FEE\u6539\uFF0C\u5DF2\u6682\u505C\u8986\u76D6");
  }
  if (decision.action === "unchanged") return "skip";
  if (decision.action === "converged") return "advance";
  if (decision.action === intent) return "write";
  if (intent === "pull") {
    throw new SyncDecisionError("LOCAL_CHANGES_PENDING", "\u672C\u5730\u6709\u672A\u56DE\u5199\u4FEE\u6539\uFF0C\u8BF7\u5148\u56DE\u5199\u6216\u4EBA\u5DE5\u5904\u7406");
  }
  throw new SyncDecisionError("REMOTE_CHANGES_PENDING", "\u98DE\u4E66\u6709\u672A\u62C9\u53D6\u4FEE\u6539\uFF0C\u8BF7\u5148\u62C9\u53D6\u6216\u4EBA\u5DE5\u5904\u7406");
}

// src/recovery.ts
var import_node_crypto2 = require("node:crypto");
var RECOVERY_ROOT = ".feishu-sync/recovery";
async function createRecoverySnapshot(adapter, input) {
  await ensureDirectory(adapter, ".feishu-sync");
  await ensureDirectory(adapter, RECOVERY_ROOT);
  const now = input.now ?? /* @__PURE__ */ new Date();
  const nonce = input.nonce ?? (0, import_node_crypto2.randomUUID)();
  const identity = (0, import_node_crypto2.createHash)("sha256").update(`${input.originalPath}\0${nonce}`).digest("hex").slice(0, 16);
  const timestamp = now.toISOString().replace(/[-:.]/g, "");
  const snapshotPath = `${RECOVERY_ROOT}/${timestamp}-${input.source}-${identity}.json`;
  const snapshot = {
    schemaVersion: 1,
    createdAt: now.toISOString(),
    source: input.source,
    originalPath: input.originalPath,
    content: input.content
  };
  await adapter.write(snapshotPath, JSON.stringify(snapshot, null, 2));
  await rotateSnapshots(adapter, Math.max(1, input.maxSnapshots ?? 20));
  return snapshotPath;
}
async function ensureDirectory(adapter, path3) {
  if (await adapter.exists(path3)) return;
  try {
    await adapter.mkdir(path3);
  } catch (error) {
    if (!await adapter.exists(path3)) throw error;
  }
}
async function rotateSnapshots(adapter, maxSnapshots) {
  try {
    const entries = await adapter.list(RECOVERY_ROOT);
    const files = entries.files.filter((path3) => path3.endsWith(".json")).sort();
    const excess = files.slice(0, Math.max(0, files.length - maxSnapshots));
    await Promise.all(excess.map((path3) => adapter.remove(path3)));
  } catch (error) {
    console.warn("[sync/recovery] snapshot rotation failed:", error);
  }
}

// src/handlers/fetchHandler.ts
function createFetchHandler(deps) {
  return async (ctx) => {
    const req = ctx.body;
    if (!req?.node_token) {
      const e = new Error("node_token is required");
      e.code = "MISSING_TOKEN";
      e.status = 400;
      throw e;
    }
    const { node_token, space_id, dir } = req;
    const settings = deps.settings;
    const targetDir = normalizeVaultDir(dir ?? settings.defaultDir);
    const replacePath = req.replace_path ? normalizeVaultMarkdownPath(req.replace_path) : void 0;
    deps.notice(`\u2B07 \u540C\u6B65\u98DE\u4E66\u6587\u6863 ${node_token.slice(0, 8)}...`);
    const remote = fetchRemoteDocument({
      nodeToken: node_token,
      spaceId: space_id,
      objToken: req.obj_token
    });
    const meta = {
      ...remote.meta,
      ...req.meta ?? {}
    };
    if (Object.keys(meta).length > 0) {
      deps.notice(`\u{1F4CB} \u63D0\u53D6\u5230 ${Object.keys(meta).length} \u4E2A\u5143\u6570\u636E\u5B57\u6BB5`);
    }
    const processedMd = remote.body;
    const objToken = remote.objToken;
    const feishuTitle = remote.title;
    const existingFile = await findUniqueVaultBinding(deps.app, node_token);
    const syncTime = (/* @__PURE__ */ new Date()).toISOString();
    let action;
    let finalPath;
    let encoding;
    if (existingFile) {
      action = "updated";
      const existing = await deps.app.vault.read(existingFile);
      const parsed = parseFile(existing);
      finalPath = existingFile.path;
      const decision = decideThreeWaySync({
        baseHash: parsed.frontmatter.sync_hash,
        localHash: parsed.hash,
        remoteHash: remote.hash
      });
      const execution = planSyncExecution("pull", decision);
      if (execution !== "skip") {
        const merged = mergeFrontmatterForUpdate(
          parsed.frontmatter,
          node_token,
          objToken,
          feishuTitle,
          syncTime,
          meta
        );
        const content = assembleMd(merged, processedMd);
        await createRecoverySnapshot(deps.app.vault.adapter, {
          originalPath: existingFile.path,
          content: existing,
          source: "local"
        });
        await deps.app.vault.modify(existingFile, content);
        deps.notice(`\u270F \u5DF2\u66F4\u65B0 ${existingFile.name}`);
      } else {
        deps.notice(`\u23ED \u65E0\u53D8\u5316 ${existingFile.name}`);
      }
    } else {
      action = "created";
      const filename = makeFilename(feishuTitle, req.filename);
      const relativePath = makePath(targetDir, filename);
      await ensureFolder(deps.app, targetDir);
      const fm = buildInitialFrontmatter(node_token, objToken, feishuTitle, syncTime, meta);
      const content = assembleMd(fm, processedMd);
      const replaceFile = replacePath ? deps.app.vault.getAbstractFileByPath(replacePath) : null;
      const existing = deps.app.vault.getAbstractFileByPath(relativePath);
      if (replaceFile instanceof import_obsidian5.TFile) {
        const replacementContent = await deps.app.vault.read(replaceFile);
        assertReplacementBinding(replacementContent, node_token, replaceFile.path);
        await createRecoverySnapshot(deps.app.vault.adapter, {
          originalPath: replaceFile.path,
          content: replacementContent,
          source: "local"
        });
        await deps.app.vault.modify(replaceFile, content);
        finalPath = replaceFile.path;
        action = "updated";
      } else if (existing instanceof import_obsidian5.TFile) {
        const conflictPath = makePath(targetDir, `${filename.replace(/\.md$/, "")}-${node_token.slice(0, 6)}.md`);
        await deps.app.vault.create(conflictPath, content);
        finalPath = conflictPath;
      } else {
        const created = await deps.app.vault.create(relativePath, content);
        finalPath = created.path;
      }
      deps.notice(`\u2705 \u5DF2\u521B\u5EFA ${filename}`);
      if (settings.autoRename) {
        try {
          encoding = await assignEncoding(deps.app, finalPath, targetDir);
          if (encoding) {
            deps.notice(`\u{1F522} \u7F16\u7801\uFF1A${encoding}`);
          }
        } catch (err) {
          console.warn("[sync/fetch] auto-rename failed:", err);
        }
      }
    }
    return {
      ok: true,
      path: finalPath,
      filename: finalPath.split("/").pop() ?? "",
      action,
      \u7F16\u7801: encoding,
      feishu_title: feishuTitle
    };
  };
}
async function ensureFolder(app, dir) {
  if (!dir || dir === "." || dir === "/") return;
  const existing = app.vault.getAbstractFileByPath(dir);
  if (existing instanceof import_obsidian5.TFolder) return;
  try {
    await app.vault.createFolder(dir);
  } catch {
    const parent = dir.split("/").slice(0, -1).join("/");
    if (parent) await ensureFolder(app, parent);
    try {
      await app.vault.createFolder(dir);
    } catch {
    }
  }
}

// src/handlers/clipHandler.ts
var import_obsidian6 = require("obsidian");
function createClipHandler(deps) {
  return async (ctx) => {
    const req = ctx.body ?? {};
    const title = cleanText(req.title) || "\u7F51\u9875\u526A\u85CF";
    const url = cleanText(req.url);
    const text = cleanText(req.text);
    const rawText = cleanText(req.rawText) || text;
    const bodyMarkdown = cleanText(req.bodyMarkdown);
    const description = cleanText(req.description);
    const sourceKind = cleanText(req.sourceKind) || "generic-page";
    const appendPath = req.appendPath ? normalizeVaultMarkdownPath(req.appendPath) : "";
    if (!url && !text && !bodyMarkdown && !rawText) {
      const e = new Error("url or text is required");
      e.code = "MISSING_CLIP_CONTENT";
      e.status = 400;
      throw e;
    }
    const createdAt = /* @__PURE__ */ new Date();
    const targetDir = normalizeVaultDir(cleanText(req.dir) || deps.settings.defaultDir);
    const meta = normalizeClipMeta(req.meta, {
      title,
      url,
      text: rawText || bodyMarkdown || text,
      description,
      dir: targetDir,
      date: formatDate(createdAt)
    });
    const contentInput = {
      title,
      url,
      text,
      rawText,
      bodyMarkdown,
      description,
      dir: targetDir,
      meta,
      sourceKind,
      date: formatDate(createdAt),
      createdAt: createdAt.toISOString()
    };
    if (appendPath) {
      const target = deps.app.vault.getAbstractFileByPath(appendPath);
      if (!(target instanceof import_obsidian6.TFile)) {
        const e = new Error(`\u8865\u5145\u76EE\u6807\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A${appendPath}`);
        e.code = "APPEND_TARGET_NOT_FOUND";
        e.status = 404;
        throw e;
      }
      const current = await deps.app.vault.read(target);
      const appendix = buildAppendMarkdown(contentInput);
      await deps.app.vault.modify(target, `${current.replace(/\s*$/, "")}

${appendix}
`);
      deps.notice(`\u{1F4DD} \u5DF2\u8865\u5145\u5230 ${appendPath}`);
      return {
        ok: true,
        path: target.path,
        filename: target.name,
        action: "updated"
      };
    }
    await ensureFolder2(deps.app, targetDir);
    const filename = makeFilename(title);
    let finalPath = makePath(targetDir, filename);
    const existing = deps.app.vault.getAbstractFileByPath(finalPath);
    if (existing instanceof import_obsidian6.TFile) {
      finalPath = makePath(targetDir, `${filename.replace(/\.md$/, "")}-${Date.now().toString(36)}.md`);
    }
    const content = buildClipMarkdown(contentInput);
    await deps.app.vault.create(finalPath, content);
    deps.notice(`\u{1F4CE} \u5DF2\u526A\u5B58 ${title}`);
    if (deps.settings.autoRename) {
      try {
        await assignEncoding(deps.app, finalPath, targetDir);
      } catch (err) {
        console.warn("[sync/clip] auto-rename failed:", err);
      }
    }
    return {
      ok: true,
      path: finalPath,
      filename: finalPath.split("/").pop() ?? filename,
      action: "created"
    };
  };
}
function buildClipMarkdown(input) {
  const bodyContent = normalizeMarkdownBody(input.bodyMarkdown || input.rawText || input.text || input.description);
  const body = [
    `# ${input.title}`,
    "",
    input.url ? `> \u6765\u6E90\uFF1A${input.url}` : "",
    `> \u7C7B\u578B\uFF1A${input.sourceKind}`,
    `> \u526A\u5B58\u65F6\u95F4\uFF1A${input.createdAt}`,
    "",
    bodyContent,
    ""
  ].filter((line, index, arr) => line || arr[index - 1] !== "").join("\n");
  return assembleFile(input.meta, body);
}
function buildAppendMarkdown(input) {
  const bodyContent = normalizeMarkdownBody(input.bodyMarkdown || input.rawText || input.text || input.description);
  return [
    `## ${input.title}`,
    "",
    input.url ? `> \u6765\u6E90\uFF1A${input.url}` : "",
    `> \u7C7B\u578B\uFF1A${input.sourceKind}`,
    `> \u8865\u5145\u65F6\u95F4\uFF1A${input.createdAt}`,
    "",
    bodyContent
  ].filter((line, index, arr) => line || arr[index - 1] !== "").join("\n");
}
function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}
function normalizeClipMeta(meta, fallback) {
  const input = meta && typeof meta === "object" && !Array.isArray(meta) ? meta : {};
  const score = normalizeScore(input.\u8BC4\u5206);
  const out = {
    \u6807\u7B7E: normalizeTag(input.\u6807\u7B7E),
    \u7F16\u7801: "",
    \u8F93\u5165: cleanText(input.\u8F93\u5165) || fallback.dir || fallback.url,
    \u65E5\u671F: normalizeDate(input.\u65E5\u671F, fallback.date),
    \u65E5\u671F\u7D22\u5F15: normalizeList(input.\u65E5\u671F\u7D22\u5F15),
    \u5173\u952E\u8BCD: cleanText(input.\u5173\u952E\u8BCD) || draftKeywords(`${fallback.title} ${fallback.description} ${fallback.text}`),
    \u6982\u8FF0: cleanText(input.\u6982\u8FF0) || fallback.description || `\u4ECE\u7F51\u9875\u526A\u5B58\u5E76\u8F6C\u6362\uFF1A${fallback.title}`,
    \u8BC4\u5206: score,
    \u8BC4\u5206_\u663E\u793A: cleanText(input.\u8BC4\u5206_\u663E\u793A) || scoreLabel(score),
    \u7D22\u5F15_\u77E5\u8BC6\u5E93: cleanText(input.\u7D22\u5F15_\u77E5\u8BC6\u5E93),
    \u7D22\u5F15_\u989C\u8272: cleanText(input.\u7D22\u5F15_\u989C\u8272),
    "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988": normalizeList(input["\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988"]),
    \u7D22\u5F15_\u5757: normalizeList(input.\u7D22\u5F15_\u5757),
    \u7D22\u5F15_\u98CE\u9669: normalizeList(input.\u7D22\u5F15_\u98CE\u9669)
  };
  if (!out.\u5173\u952E\u8BCD) out.\u5173\u952E\u8BCD = "\u7F51\u9875\u526A\u5B58";
  if (!out.\u6982\u8FF0) out.\u6982\u8FF0 = `\u7F51\u9875\u526A\u5B58\uFF1A${fallback.title}`;
  return out;
}
function normalizeTag(value) {
  const raw = cleanText(value);
  return raw.match(/^[SXLZQJ]$/) ? raw : raw.match(/([SXLZQJ])(?:_|$)/)?.[1] || "S";
}
function normalizeDate(value, fallback) {
  const raw = cleanText(value).replace(/\//g, "-");
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : fallback;
}
function normalizeScore(value) {
  const raw = cleanText(value);
  const explicit = raw.match(/[1-5]/)?.[0];
  if (explicit) return Number(explicit);
  const stars = Array.from(raw.matchAll(/🌟/g)).length;
  return stars > 0 ? Math.min(stars, 5) : 1;
}
function scoreLabel(score) {
  return ["\u{1F31F}\xB7\u7D20\u6750", "\u{1F31F}\u{1F31F}\xB7\u6574\u7406", "\u{1F31F}\u{1F31F}\u{1F31F}\xB7\u5B9E\u8DF5", "\u{1F31F}\u{1F31F}\u{1F31F}\u{1F31F}\xB7\u901A\u7528", "\u{1F31F}\u{1F31F}\u{1F31F}\u{1F31F}\u{1F31F}\xB7\u4F53\u7CFB"][Math.max(1, Math.min(score, 5)) - 1];
}
function normalizeList(value) {
  const source = Array.isArray(value) ? value : cleanText(value).split(/[\n,，、]/);
  return source.map((item) => cleanText(item)).filter(Boolean);
}
function normalizeMarkdownBody(value) {
  const text = value.trim();
  if (!text) return "\uFF08\u65E0\u53EF\u89C1\u6B63\u6587\uFF0C\u5DF2\u4FDD\u5B58\u9875\u9762\u6807\u9898\u548C\u6765\u6E90\u3002\uFF09";
  return text;
}
function draftKeywords(text) {
  const words = Array.from(new Set(
    text.replace(/[^\p{Script=Han}\p{Letter}\p{Number}\s_-]/gu, " ").split(/\s+/).map((word) => word.trim()).filter((word) => word.length >= 2 && word.length <= 20)
  ));
  return words.slice(0, 6).join("\u3001");
}
async function ensureFolder2(app, dir) {
  if (!dir || dir === "." || dir === "/") return;
  const existing = app.vault.getAbstractFileByPath(dir);
  if (existing instanceof import_obsidian6.TFolder) return;
  const parent = dir.split("/").slice(0, -1).join("/");
  if (parent) await ensureFolder2(app, parent);
  try {
    await app.vault.createFolder(dir);
  } catch {
  }
}

// src/handlers/existsHandler.ts
function createExistsHandler(app) {
  return async (ctx) => {
    const req = ctx.body;
    if (!req?.node_token) {
      const e = new Error("node_token is required");
      e.code = "MISSING_TOKEN";
      e.status = 400;
      throw e;
    }
    const file = await findUniqueVaultBinding(app, req.node_token);
    return {
      ok: true,
      exists: !!file,
      path: file?.path
    };
  };
}

// src/handlers/pushbackHandler.ts
var import_obsidian7 = require("obsidian");
function createPushbackHandler(deps) {
  return async (ctx) => {
    const req = ctx.body;
    let file = null;
    if (req.path) {
      const f = deps.app.vault.getAbstractFileByPath(normalizeVaultMarkdownPath(req.path));
      if (f instanceof import_obsidian7.TFile) file = f;
    } else if (req.node_token) {
      file = await findUniqueVaultBinding(deps.app, req.node_token);
    }
    if (!file) {
      const e = new Error("File not found");
      e.code = "NOT_FOUND";
      e.status = 404;
      throw e;
    }
    const content = await deps.app.vault.read(file);
    const parsed = parseFile(content);
    const feishuDocId = parsed.frontmatter.feishu_doc_id;
    const feishuId = parsed.frontmatter.feishu_id;
    const feishuTitle = parsed.frontmatter.feishu_title;
    let docToken = feishuDocId;
    if (!docToken && feishuId) {
      deps.notice("\u{1F517} \u89E3\u6790\u6587\u6863 token...");
      const info = getWikiNodeInfo(feishuId, deps.settings.spaceId);
      docToken = info?.obj_token;
      if (!docToken) {
        const e = new Error(`\u65E0\u6CD5\u89E3\u6790 obj_token\uFF08node_token=${feishuId.slice(0, 8)}...\uFF0C\u68C0\u67E5 space_id \u8BBE\u7F6E\uFF09`);
        e.code = "TOKEN_RESOLVE_FAILED";
        e.status = 400;
        throw e;
      }
      parsed.frontmatter.feishu_doc_id = docToken;
    }
    if (!docToken) {
      const e = new Error("No feishu binding in frontmatter");
      e.code = "NO_BINDING";
      e.status = 400;
      throw e;
    }
    const title = feishuTitle || file.basename;
    const remote = fetchRemoteDocument({
      nodeToken: feishuId || docToken,
      objToken: docToken,
      spaceId: deps.settings.spaceId
    });
    const decision = decideThreeWaySync({
      baseHash: parsed.frontmatter.sync_hash,
      localHash: parsed.hash,
      remoteHash: remote.hash
    });
    const execution = planSyncExecution("push", decision);
    if (execution === "skip") {
      return {
        ok: true,
        action: "skipped",
        hash: parsed.hash,
        title
      };
    }
    if (execution === "advance") {
      await advanceLocalBaseline(deps, file, content, parsed, title);
      return {
        ok: true,
        action: "skipped",
        hash: parsed.hash,
        title
      };
    }
    deps.notice(`\u2B06 \u56DE\u5199\u98DE\u4E66 ${file.name}...`);
    const finalContent = buildPushbackContent(parsed);
    const recoveryPath = await createRecoverySnapshot(deps.app.vault.adapter, {
      originalPath: file.path,
      content: remote.rawMarkdown,
      source: "remote"
    });
    try {
      overwriteDocXml(docToken, finalContent, title);
    } catch (error) {
      throw new HttpError(
        "REMOTE_WRITE_UNKNOWN",
        `\u8FDC\u7AEF\u56DE\u5199\u7ED3\u679C\u65E0\u6CD5\u786E\u8BA4\uFF0C\u8BF7\u5148\u68C0\u67E5\u98DE\u4E66\u518D\u91CD\u8BD5\uFF1B\u6062\u590D\u526F\u672C\uFF1A${recoveryPath}\uFF1B${error instanceof Error ? error.message : String(error)}`,
        502
      );
    }
    const syncTime = (/* @__PURE__ */ new Date()).toISOString();
    const updatedFm = {
      ...parsed.frontmatter,
      sync_hash: parsed.hash,
      sync_time: syncTime
    };
    const newContent = assembleMd(updatedFm, parsed.body);
    try {
      await deps.app.vault.modify(file, newContent);
    } catch (error) {
      throw new HttpError(
        "REMOTE_WRITE_REPAIR_REQUIRED",
        `\u8FDC\u7AEF\u5DF2\u56DE\u5199\uFF0C\u4F46\u672C\u5730\u57FA\u7EBF\u66F4\u65B0\u5931\u8D25\uFF1B\u6062\u590D\u526F\u672C\uFF1A${recoveryPath}\uFF1B${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
    deps.notice(`\u2705 \u5DF2\u56DE\u5199 ${title}`);
    return {
      ok: true,
      action: "pushed",
      hash: parsed.hash,
      title
    };
  };
}
async function advanceLocalBaseline(deps, file, existingContent, parsed, title) {
  await createRecoverySnapshot(deps.app.vault.adapter, {
    originalPath: file.path,
    content: existingContent,
    source: "local"
  });
  const updated = assembleMd({
    ...parsed.frontmatter,
    sync_hash: parsed.hash,
    sync_time: (/* @__PURE__ */ new Date()).toISOString()
  }, parsed.body);
  await deps.app.vault.modify(file, updated);
  deps.notice(`\u2705 \u5DF2\u786E\u8BA4\u53CC\u7AEF\u5185\u5BB9\u4E00\u81F4\uFF1A${title}`);
}
function buildPushbackContent(parsed) {
  const parts = [];
  const calloutXml = metaToCalloutXml(parsed.frontmatter);
  if (calloutXml) {
    parts.push(calloutXml);
  }
  let body = parsed.body;
  body = feishuProtoToXml(body);
  body = convertOBCalloutsToFeishu(body);
  parts.push(body.trim());
  return parts.filter(Boolean).join("\n\n");
}

// src/commands.ts
var import_obsidian8 = require("obsidian");
function registerCommands(plugin) {
  const { app, settings } = plugin;
  plugin.addCommand({
    id: "pushback-current",
    name: "\u56DE\u5199\u5F53\u524D\u6587\u4EF6\u5230\u98DE\u4E66",
    editorCallback: async () => {
      const file = app.workspace.getActiveFile();
      if (!(file instanceof import_obsidian8.TFile) || !file.path.endsWith(".md")) {
        new import_obsidian8.Notice("\u26A0\uFE0F \u8BF7\u5728 markdown \u6587\u4EF6\u4E2D\u4F7F\u7528\u6B64\u547D\u4EE4");
        return;
      }
      const handler = createPushbackHandler({
        app,
        settings,
        notice: (m) => new import_obsidian8.Notice(m)
      });
      try {
        const key = await plugin.documentCoordinationKey(void 0, file.path);
        const result = await plugin.syncCoordinator.run(key, void 0, () => handler({
          method: "POST",
          url: "/pushback",
          path: "/pushback",
          query: new URLSearchParams(),
          body: { path: file.path },
          token: ""
        }));
        if (result.action === "pushed") {
          new import_obsidian8.Notice(`\u2705 \u5DF2\u56DE\u5199\uFF1A${result.title}`);
        } else {
          new import_obsidian8.Notice("\u23ED \u65E0\u53D8\u5316\uFF0C\u5DF2\u8DF3\u8FC7");
        }
      } catch (err) {
        new import_obsidian8.Notice(`\u274C \u56DE\u5199\u5931\u8D25\uFF1A${err instanceof Error ? err.message : String(err)}`);
      }
    }
  });
  plugin.addCommand({
    id: "pushback-dir",
    name: "\u6279\u91CF\u56DE\u5199\u5F53\u524D\u76EE\u5F55\u5230\u98DE\u4E66",
    callback: async () => {
      const file = app.workspace.getActiveFile();
      if (!file) {
        new import_obsidian8.Notice("\u26A0\uFE0F \u8BF7\u5148\u6253\u5F00\u4E00\u4E2A\u6587\u4EF6\u4EE5\u786E\u5B9A\u76EE\u5F55");
        return;
      }
      const dir = file.parent?.path;
      if (!dir) return;
      const files = app.vault.getMarkdownFiles().filter((f) => f.path.startsWith(dir + "/"));
      let pushed = 0;
      let skipped = 0;
      let failed = 0;
      const handler = createPushbackHandler({
        app,
        settings,
        notice: () => {
        }
      });
      for (const f of files) {
        try {
          const key = await plugin.documentCoordinationKey(void 0, f.path);
          const result = await plugin.syncCoordinator.run(key, void 0, () => handler({
            method: "POST",
            url: "/pushback",
            path: "/pushback",
            query: new URLSearchParams(),
            body: { path: f.path },
            token: ""
          }));
          if (result.action === "pushed") pushed++;
          else skipped++;
        } catch {
          failed++;
        }
      }
      new import_obsidian8.Notice(`\u2B06 \u6279\u91CF\u56DE\u5199\u5B8C\u6210\uFF1A\u63A8\u9001 ${pushed}\uFF0C\u8DF3\u8FC7 ${skipped}\uFF0C\u5931\u8D25 ${failed}`);
    }
  });
  plugin.addCommand({
    id: "assign-encoding-dir",
    name: "\u6279\u91CF\u5206\u914D\u7F16\u7801\uFF08\u5F53\u524D\u76EE\u5F55\uFF09",
    callback: async () => {
      const file = app.workspace.getActiveFile();
      if (!file) {
        new import_obsidian8.Notice("\u26A0\uFE0F \u8BF7\u5148\u6253\u5F00\u4E00\u4E2A\u6587\u4EF6\u4EE5\u786E\u5B9A\u76EE\u5F55");
        return;
      }
      const dir = file.parent?.path;
      if (!dir) return;
      const result = await batchAssignEncoding(app, dir);
      new import_obsidian8.Notice(`\u{1F522} \u7F16\u7801\u5206\u914D\uFF1A${result.assigned}/${result.total}`);
    }
  });
  plugin.addCommand({
    id: "refresh-mapping",
    name: "\u5237\u65B0\u76EE\u5F55\u6620\u5C04\uFF08OB\u2192\u98DE\u4E66\uFF09",
    callback: async () => {
      await refreshMapping(app, settings.spaceId);
    }
  });
  plugin.addCommand({
    id: "show-token",
    name: "\u663E\u793A\u542F\u52A8\u4EE4\u724C\uFF08\u8FDE\u63A5\u6D4F\u89C8\u5668\u6269\u5C55\u7528\uFF09",
    callback: () => {
      const modal = new TokenModal(app, settings.syncToken);
      modal.open();
    }
  });
  plugin.addCommand({
    id: "show-recent",
    name: "\u663E\u793A\u6700\u8FD1\u540C\u6B65\u8BB0\u5F55",
    callback: () => {
      const recent = plugin.state.recentSyncs;
      if (recent.length === 0) {
        new import_obsidian8.Notice("\uFF08\u6682\u65E0\u540C\u6B65\u8BB0\u5F55\uFF09");
        return;
      }
      const lines = recent.slice(0, 10).map(
        (r) => `${r.status === "failed" ? "\u274C" : r.status === "skipped" ? "\u23ED" : "\u2705"} ${r.title || r.kind} \u2192 ${r.path || r.action || ""}`
      );
      const modal = new import_obsidian8.Modal(app);
      modal.titleEl.setText("\u6700\u8FD1\u540C\u6B65\u8BB0\u5F55");
      const pre = modal.contentEl.createEl("pre");
      pre.setText(lines.join("\n"));
      modal.open();
    }
  });
}
var TokenModal = class extends import_obsidian8.Modal {
  constructor(app, token) {
    super(app);
    this.token = token;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "\u542F\u52A8\u4EE4\u724C" });
    contentEl.createEl("p", {
      text: '\u590D\u5236\u6B64\u4EE4\u724C\uFF0C\u7C98\u8D34\u5230\u6D4F\u89C8\u5668\u6269\u5C55\u5F39\u7A97\u7684"Token"\u8F93\u5165\u6846\u3002',
      cls: "setting-item-description"
    });
    const codeEl = contentEl.createEl("code");
    codeEl.setText(this.token);
    codeEl.style.display = "block";
    codeEl.style.padding = "12px";
    codeEl.style.fontFamily = "monospace";
    codeEl.style.wordBreak = "break-all";
    codeEl.style.background = "var(--background-secondary)";
    const btn = contentEl.createEl("button", { text: "\u590D\u5236" });
    btn.onclick = async () => {
      await navigator.clipboard.writeText(this.token);
      new import_obsidian8.Notice("\u2705 \u5DF2\u590D\u5236");
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/fetchEntrypoints.ts
var import_obsidian9 = require("obsidian");
function registerFetchEntrypoints(plugin) {
  plugin.registerObsidianProtocolHandler(OBSIDIAN_LARK_DOC_ACTION, (params) => {
    const parsed = parseObsidianLarkDocParams(params);
    void triggerFetch(plugin, {
      node_token: parsed.node_token || parsed.token,
      obj_token: parsed.obj_token,
      space_id: parsed.space_id,
      title: parsed.title,
      url: parsed.url,
      dir: parsed.dir,
      source: "protocol"
    });
  });
  plugin.addCommand({
    id: "fetch-feishu-doc",
    name: "\u62C9\u53D6\u98DE\u4E66\u6587\u6863",
    callback: () => {
      new FeishuInputModal(plugin.app, async (value) => {
        const parsed = parseUserInput(value);
        await triggerFetch(plugin, {
          ...parsed,
          source: "command"
        });
      }).open();
    }
  });
  plugin.registerEvent(
    plugin.app.vault.on("create", (file) => {
      if (!(file instanceof import_obsidian9.TFile) || file.extension !== "md") return;
      window.setTimeout(() => {
        void handleClipperPlaceholder(plugin, file);
      }, 250);
    })
  );
}
async function triggerFetch(plugin, input) {
  const resolved = normalizeInput(plugin, input);
  if (!resolved.node_token) {
    new import_obsidian9.Notice("\u65E0\u6CD5\u8BC6\u522B\u98DE\u4E66\u6587\u6863 token");
    return;
  }
  const req = {
    node_token: resolved.node_token,
    obj_token: resolved.obj_token,
    space_id: resolved.space_id || plugin.settings.spaceId,
    dir: resolved.dir || plugin.settings.defaultDir,
    filename: resolved.title,
    replace_path: resolved.replace_path
  };
  const run2 = async (dir) => {
    try {
      const handler = createFetchHandler({
        app: plugin.app,
        settings: plugin.settings,
        state: plugin.state,
        notice: (message) => new import_obsidian9.Notice(message)
      });
      const targetDir = normalizeVaultDir(dir || req.dir || plugin.settings.defaultDir);
      const result = await plugin.syncCoordinator.run(`document:${req.node_token}`, void 0, () => plugin.syncCoordinator.run(`directory:${targetDir}`, void 0, () => handler({
        method: "POST",
        url: "/fetch",
        path: "/fetch",
        query: new URLSearchParams(),
        body: { ...req, dir: targetDir },
        token: ""
      })));
      new import_obsidian9.Notice(`${result.action === "created" ? "\u5DF2\u521B\u5EFA" : "\u5DF2\u66F4\u65B0"}\uFF1A${result.path}`);
    } catch (err) {
      new import_obsidian9.Notice(`\u540C\u6B65\u5931\u8D25\uFF1A${err instanceof Error ? err.message : String(err)}`);
    }
  };
  if (input.source === "protocol" && !input.dir) {
    new FolderPickModal(plugin.app, plugin.settings.defaultDir, run2).open();
    return;
  }
  await run2(req.dir);
}
function normalizeInput(plugin, input) {
  if (input.url) {
    const fromUrl = resolveNodeTokenFromUrl(input.url);
    return {
      ...input,
      node_token: input.node_token || fromUrl.node_token || input.obj_token || fromUrl.obj_token,
      obj_token: input.obj_token || fromUrl.obj_token
    };
  }
  return {
    ...input,
    node_token: input.node_token || input.obj_token,
    space_id: input.space_id || plugin.settings.spaceId
  };
}
function parseUserInput(value) {
  const trimmed = value.trim();
  if (/^https?:\/\//.test(trimmed)) {
    const parsed = resolveNodeTokenFromUrl(trimmed);
    return {
      node_token: parsed.node_token || parsed.obj_token,
      obj_token: parsed.obj_token,
      url: trimmed
    };
  }
  const protocolParams = parseObsidianLarkDocParams(trimmed);
  if (protocolParams.token || protocolParams.node_token || protocolParams.obj_token) {
    return {
      node_token: protocolParams.node_token || protocolParams.token || protocolParams.obj_token,
      obj_token: protocolParams.obj_token,
      space_id: protocolParams.space_id,
      title: protocolParams.title,
      url: protocolParams.url,
      dir: protocolParams.dir
    };
  }
  return { node_token: trimmed };
}
async function handleClipperPlaceholder(plugin, file) {
  let content = "";
  try {
    content = await plugin.app.vault.read(file);
  } catch {
    return;
  }
  const url = extractClipperUrl(content);
  if (!url) return;
  const parsed = resolveNodeTokenFromUrl(url);
  const nodeToken = parsed.node_token || parsed.obj_token;
  if (!nodeToken) return;
  await triggerFetch(plugin, {
    node_token: nodeToken,
    obj_token: parsed.obj_token,
    url,
    dir: file.parent?.path || plugin.settings.defaultDir,
    replace_path: file.path,
    source: "clipper"
  });
}
function extractClipperUrl(content) {
  const patterns = [
    /feishu_sync_url:\s*["']?([^\n"']+)/,
    /source:\s*["']?(https?:\/\/[^\n"']*(?:feishu\.cn|larksuite\.com)\/(?:wiki|docx|doc)\/[A-Za-z0-9]+)/,
    /(https?:\/\/[^\s)"']*(?:feishu\.cn|larksuite\.com)\/(?:wiki|docx|doc)\/[A-Za-z0-9]+)/
  ];
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}
var FeishuInputModal = class extends import_obsidian9.Modal {
  constructor(app, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
  }
  onOpen() {
    this.titleEl.setText("\u62C9\u53D6\u98DE\u4E66\u6587\u6863");
    this.inputEl = this.contentEl.createEl("input", {
      type: "text",
      placeholder: "\u7C98\u8D34\u98DE\u4E66\u94FE\u63A5\u3001token \u6216 obsidian://lark-doc \u5730\u5740"
    });
    this.inputEl.style.width = "100%";
    this.inputEl.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      const value = this.inputEl.value.trim();
      if (!value) return;
      this.close();
      void this.onSubmit(value);
    });
    this.inputEl.focus();
  }
  onClose() {
    this.contentEl.empty();
  }
};
var FolderPickModal = class extends import_obsidian9.Modal {
  constructor(app, defaultDir, onSubmit) {
    super(app);
    this.defaultDir = defaultDir;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    this.titleEl.setText("\u9009\u62E9\u540C\u6B65\u76EE\u5F55");
    const select = this.contentEl.createEl("select");
    select.style.width = "100%";
    const folders = getFolders(this.app);
    for (const folder of folders) {
      const option = select.createEl("option", {
        text: folder.path || "/",
        value: folder.path
      });
      option.selected = folder.path === this.defaultDir;
    }
    const row = this.contentEl.createDiv();
    row.style.marginTop = "12px";
    const confirm = row.createEl("button", { text: "\u540C\u6B65" });
    confirm.onclick = () => {
      const dir = select.value || this.defaultDir;
      this.close();
      void this.onSubmit(dir);
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};
function getFolders(app) {
  const folders = app.vault.getAllLoadedFiles().filter((file) => file instanceof import_obsidian9.TFolder).filter((folder) => !folder.path.startsWith(".obsidian") && !folder.path.startsWith(".feishu-sync"));
  return folders.length > 0 ? folders : [app.vault.getRoot()];
}

// src/imageRender.ts
var import_obsidian10 = require("obsidian");
var path2 = __toESM(require("node:path"), 1);
var CACHE_DIR = ".feishu-sync/cache";
function registerImageRenderer(plugin) {
  if (!import_obsidian10.Platform.isDesktopApp) return;
  plugin.registerMarkdownPostProcessor(async (el) => {
    const imgs = el.querySelectorAll("img");
    for (const img of Array.from(imgs)) {
      const src = img.getAttribute("src") || "";
      if (!src.startsWith("feishu://")) continue;
      try {
        const token = validateImageToken(src.slice("feishu://".length));
        const localPath = await resolveImage(plugin, token);
        if (localPath) {
          const vaultBase = plugin.app.vault.adapter.getBasePath?.() ?? "";
          const fullPath = path2.join(vaultBase, localPath);
          img.setAttribute("src", `app://local/${fullPath}`);
        } else {
          img.setAttribute("alt", `[\u98DE\u4E66\u56FE\u7247 ${token.slice(0, 8)} \u52A0\u8F7D\u5931\u8D25]`);
          img.setAttribute("src", "");
        }
      } catch (err) {
        console.warn("[sync/image] render failed:", err);
        img.setAttribute("alt", "[\u98DE\u4E66\u56FE\u7247\u52A0\u8F7D\u5931\u8D25]");
      }
    }
  });
}
var resolving = /* @__PURE__ */ new Map();
async function resolveImage(plugin, token) {
  if (resolving.has(token)) return resolving.get(token);
  const promise = doResolveImage(plugin, token);
  resolving.set(token, promise);
  try {
    return await promise;
  } finally {
    resolving.delete(token);
  }
}
async function doResolveImage(plugin, token) {
  const { adapter } = plugin.app.vault;
  const ext = ".png";
  const cachePath = `${CACHE_DIR}/${token}${ext}`;
  if (await adapter.exists(cachePath)) {
    return cachePath;
  }
  try {
    if (!await adapter.exists(CACHE_DIR)) {
      await adapter.mkdir(CACHE_DIR);
    }
  } catch {
  }
  const vaultBase = adapter.getBasePath?.() ?? process.cwd();
  const localFullPath = path2.join(vaultBase, cachePath);
  try {
    run(["docs", "+media-download", "--token", token, "--output", localFullPath], {
      timeout: 3e4
    });
    return cachePath;
  } catch (err) {
    console.warn("[sync/image] media-download failed:", token, err);
    return null;
  }
}
async function cleanupImageCache(plugin, mode) {
  if (mode === "never") return;
  const { adapter } = plugin.app.vault;
  if (!await adapter.exists(CACHE_DIR)) return;
  const now = Date.now();
  const ttlMs = mode === "daily" ? 24 * 3600 * 1e3 : mode === "weekly" ? 7 * 24 * 3600 * 1e3 : 30 * 24 * 3600 * 1e3;
  let cleaned = 0;
  try {
    const files = await adapter.list(CACHE_DIR);
    for (const f of files.files) {
      try {
        const stat = await adapter.stat(f);
        if (stat?.mtime && now - stat.mtime > ttlMs) {
          await adapter.remove(f);
          cleaned++;
        }
      } catch {
        continue;
      }
    }
  } catch (err) {
    console.warn("[sync/image] cleanup failed:", err);
  }
  if (cleaned > 0) {
    new import_obsidian10.Notice(`\u{1F9F9} \u5DF2\u6E05\u7406 ${cleaned} \u4E2A\u8FC7\u671F\u56FE\u7247\u7F13\u5B58`);
  }
}

// src/systemProperties.ts
var LEGACY_SYSTEM_PROPERTY_KEYS = /* @__PURE__ */ new Set([
  "feishu_id",
  "feishu_doc_id",
  "feishu_title",
  "sync_hash",
  "sync_time"
]);
var SYSTEM_PROPERTY_STYLE_ID = "fstb-system-property-style";
var SYSTEM_PROPERTY_HIDDEN_CLASS = "fstb-system-property-hidden";
var SYSTEM_PROPERTY_BODY_CLASS = "fstb-hide-system-properties";
function isSystemPropertyKey(value) {
  const key = String(value ?? "").trim();
  return key.startsWith("_sys_") || LEGACY_SYSTEM_PROPERTY_KEYS.has(key);
}
var SYSTEM_PROPERTY_CSS = `
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

// src/syncCoordinator.ts
var RequestConflictError = class extends Error {
  constructor() {
    super(...arguments);
    this.code = "REQUEST_ID_CONFLICT";
    this.status = 409;
  }
};
var SyncCoordinator = class {
  constructor(options = {}) {
    this.tails = /* @__PURE__ */ new Map();
    this.inflight = /* @__PURE__ */ new Map();
    this.completed = /* @__PURE__ */ new Map();
    this.maxCompleted = Math.max(1, options.maxCompleted ?? 100);
    this.completedTtlMs = Math.max(1e3, options.completedTtlMs ?? 10 * 6e4);
  }
  get completedCount() {
    this.pruneCompleted();
    return this.completed.size;
  }
  async run(key, requestId, task) {
    const normalizedKey = key.trim();
    const normalizedRequestId = requestId?.trim();
    if (!normalizedKey) throw new Error("Coordinator key is required");
    if (normalizedRequestId && !/^[A-Za-z0-9._:-]{1,128}$/.test(normalizedRequestId)) {
      throw new Error("requestId contains unsupported characters or exceeds 128 characters");
    }
    this.pruneCompleted();
    if (normalizedRequestId) {
      const cached = this.completed.get(normalizedRequestId);
      if (cached) {
        this.assertSameKey(normalizedRequestId, cached.key, normalizedKey);
        return cached.value;
      }
      const active = this.inflight.get(normalizedRequestId);
      if (active) {
        this.assertSameKey(normalizedRequestId, active.key, normalizedKey);
        return active.promise;
      }
    }
    const operation = this.enqueue(normalizedKey, task);
    if (!normalizedRequestId) return operation;
    const tracked = operation.then((value) => {
      this.remember(normalizedRequestId, normalizedKey, value);
      return value;
    }).finally(() => {
      this.inflight.delete(normalizedRequestId);
    });
    this.inflight.set(normalizedRequestId, { key: normalizedKey, promise: tracked });
    return tracked;
  }
  enqueue(key, task) {
    const previous = this.tails.get(key) ?? Promise.resolve();
    let release;
    const slot = new Promise((resolve) => {
      release = resolve;
    });
    const tail = previous.catch(() => {
    }).then(() => slot);
    this.tails.set(key, tail);
    return previous.catch(() => {
    }).then(task).finally(() => {
      release();
      if (this.tails.get(key) === tail) this.tails.delete(key);
    });
  }
  assertSameKey(requestId, existingKey, requestedKey) {
    if (existingKey !== requestedKey) {
      throw new RequestConflictError(`requestId ${requestId} is already bound to another document`);
    }
  }
  remember(requestId, key, value) {
    this.completed.delete(requestId);
    this.completed.set(requestId, { key, value, completedAt: Date.now() });
    while (this.completed.size > this.maxCompleted) {
      const oldest = this.completed.keys().next().value;
      if (!oldest) break;
      this.completed.delete(oldest);
    }
  }
  pruneCompleted() {
    const cutoff = Date.now() - this.completedTtlMs;
    for (const [requestId, entry] of this.completed) {
      if (entry.completedAt >= cutoff) break;
      this.completed.delete(requestId);
    }
  }
};

// src/main.ts
var FeishuSyncPlugin = class extends import_obsidian11.Plugin {
  constructor() {
    super(...arguments);
    this.activitySaveTail = Promise.resolve();
    this.syncCoordinator = new SyncCoordinator();
  }
  async onload() {
    enableCli();
    let shouldSaveSettings = await this.loadSettings();
    this.state = {
      larkCliResolved: "",
      larkCliVersion: "",
      serverRunning: false,
      recentSyncs: normalizeActivity(this.settings.recentActivity)
    };
    if (!this.settings.syncToken) {
      this.settings.syncToken = generateSyncToken();
      shouldSaveSettings = true;
    }
    if (shouldSaveSettings) {
      await this.saveSettings();
    }
    this.applySystemPropertiesVisibility();
    const larkInfo = resolveCli(this.settings.larkCliPath || void 0);
    if (larkInfo) {
      this.state.larkCliResolved = larkInfo.path;
      this.state.larkCliVersion = larkInfo.version;
      process.env.__LARK_CLI_PATH__ = larkInfo.path;
      console.log(`[fs-TB] lark-cli: ${larkInfo.version} @ ${larkInfo.path}`);
    } else {
      console.warn("[fs-TB] lark-cli not found (need >= 1.0.52)");
    }
    this.addSettingTab(new FeishuSyncSettingTab(this.app, this));
    registerCommands(this);
    registerFetchEntrypoints(this);
    registerImageRenderer(this);
    await this.startHttpServer();
    this.addRibbonIcon("refresh-cw", "\u98DE\u4E66\u540C\u6B65", async () => {
      await refreshMapping(this.app, this.settings.spaceId);
    });
    this.app.workspace.onLayoutReady(() => {
      cleanupImageCache(this, this.settings.cacheCleanup).catch(() => {
      });
    });
    console.log(`[fs-TB] ${this.manifest.version} loaded on port ${this.settings.port}`);
  }
  async onunload() {
    disableCli();
    await this.activitySaveTail;
    this.systemPropertyObserver?.disconnect();
    this.systemPropertyObserver = void 0;
    document.body.classList.remove(SYSTEM_PROPERTY_BODY_CLASS);
    document.documentElement.classList.remove(SYSTEM_PROPERTY_BODY_CLASS);
    document.getElementById(SYSTEM_PROPERTY_STYLE_ID)?.remove();
    document.querySelectorAll(`.${SYSTEM_PROPERTY_HIDDEN_CLASS}`).forEach((element) => {
      element.classList.remove(SYSTEM_PROPERTY_HIDDEN_CLASS);
    });
    if (this.stopServer) {
      await this.stopServer();
      this.stopServer = void 0;
    }
    console.log("[fs-TB] unloaded");
  }
  async loadSettings() {
    const migration = migrateSettings(await this.loadData());
    this.settings = migration.settings;
    return migration.changed;
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async documentCoordinationKey(nodeToken, path3) {
    if (nodeToken) return `document:${nodeToken}`;
    if (path3) {
      const normalizedPath = normalizeVaultMarkdownPath(path3);
      const file = this.app.vault.getAbstractFileByPath(normalizedPath);
      if (file instanceof import_obsidian11.TFile) {
        const feishuId = extractFeishuId(await this.app.vault.read(file));
        if (feishuId) return `document:${feishuId}`;
      }
      return `path:${normalizedPath}`;
    }
    return "document:missing";
  }
  applySystemPropertiesVisibility() {
    const enabled = this.settings.hideSystemProperties ?? true;
    document.body.classList.toggle(SYSTEM_PROPERTY_BODY_CLASS, enabled);
    document.documentElement.classList.toggle(SYSTEM_PROPERTY_BODY_CLASS, enabled);
    let styleElement = document.getElementById(SYSTEM_PROPERTY_STYLE_ID);
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = SYSTEM_PROPERTY_STYLE_ID;
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = enabled ? SYSTEM_PROPERTY_CSS : "";
    this.systemPropertyObserver?.disconnect();
    this.systemPropertyObserver = void 0;
    if (!enabled) {
      document.querySelectorAll(`.${SYSTEM_PROPERTY_HIDDEN_CLASS}`).forEach((element) => {
        element.classList.remove(SYSTEM_PROPERTY_HIDDEN_CLASS);
      });
      return;
    }
    this.refreshSystemPropertyDomVisibility();
    this.systemPropertyObserver = new MutationObserver(() => {
      this.refreshSystemPropertyDomVisibility();
    });
    this.systemPropertyObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-property-key", "data-property-name", "value", "title", "aria-label"]
    });
  }
  refreshSystemPropertyDomVisibility() {
    document.querySelectorAll(".metadata-property").forEach((element) => {
      const input = element.querySelector(
        ".metadata-property-key-input, .metadata-property-key input, input"
      );
      const keyNode = element.querySelector(
        ".metadata-property-key, .metadata-property-key-inner, .metadata-property-label"
      );
      const values = [
        element.dataset.propertyKey,
        element.dataset.propertyName,
        input?.value,
        input?.getAttribute("value"),
        input?.getAttribute("aria-label"),
        keyNode?.title,
        keyNode?.textContent
      ];
      const shouldHide = values.some(isSystemPropertyKey);
      element.classList.toggle(SYSTEM_PROPERTY_HIDDEN_CLASS, shouldHide);
    });
  }
  /** 启动 HTTP server，注册所有路由。 */
  async startHttpServer() {
    const routes = /* @__PURE__ */ new Map();
    const deps = {
      validateToken: (token) => token === this.settings.syncToken,
      routes
    };
    routes.set("/status", createStatusHandler(this.manifest.version, this.app.vault.getName(), this.state));
    routes.set("/tree", createTreeHandler(this.app));
    const fetchHandler = createFetchHandler({
      app: this.app,
      settings: this.settings,
      state: this.state,
      notice: (m) => new import_obsidian11.Notice(m)
    });
    routes.set("/fetch", (ctx) => {
      const req = ctx.body;
      const documentKey = `document:${req?.node_token ?? ""}`;
      const directoryKey = `directory:${normalizeVaultDir(req?.dir ?? this.settings.defaultDir)}`;
      return this.withActivity("fetch", () => this.syncCoordinator.run(documentKey, req?.requestId, () => this.syncCoordinator.run(directoryKey, void 0, () => fetchHandler(ctx))));
    });
    const clipHandler = createClipHandler({
      app: this.app,
      settings: this.settings,
      notice: (m) => new import_obsidian11.Notice(m)
    });
    routes.set("/clip", (ctx) => {
      const req = ctx.body;
      const key = req?.appendPath ? `clip:${req.appendPath}` : `clip:${req?.requestId ?? "anonymous"}`;
      return this.withActivity("clip", () => this.syncCoordinator.run(key, req?.requestId, () => clipHandler(ctx)));
    });
    routes.set("/exists", createExistsHandler(this.app));
    const pushbackHandler = createPushbackHandler({
      app: this.app,
      settings: this.settings,
      notice: (m) => new import_obsidian11.Notice(m)
    });
    routes.set("/pushback", async (ctx) => {
      const req = ctx.body;
      const key = await this.documentCoordinationKey(req?.node_token, req?.path);
      return this.withActivity("pushback", () => this.syncCoordinator.run(key, req?.requestId, () => pushbackHandler(ctx)));
    });
    try {
      const { stop } = await startServer(this.settings.port, deps);
      this.stopServer = stop;
      this.state.serverRunning = true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      new import_obsidian11.Notice(`\u274C HTTP server \u542F\u52A8\u5931\u8D25\uFF08\u7AEF\u53E3 ${this.settings.port}\uFF09\uFF1A${msg}`);
      console.error("[fs-TB] server start failed:", err);
    }
  }
  async withActivity(kind, task) {
    try {
      const result = await task();
      const value = result;
      this.recordActivity({
        time: (/* @__PURE__ */ new Date()).toISOString(),
        kind,
        status: value.action === "skipped" ? "skipped" : "succeeded",
        action: value.action,
        title: value.feishu_title ?? value.title,
        path: value.path
      });
      return result;
    } catch (error) {
      this.recordActivity({
        time: (/* @__PURE__ */ new Date()).toISOString(),
        kind,
        status: "failed",
        errorCode: error?.code ?? "INTERNAL"
      });
      throw error;
    }
  }
  recordActivity(record) {
    this.state.recentSyncs = appendActivity(this.state.recentSyncs, record);
    this.settings.recentActivity = this.state.recentSyncs;
    this.activitySaveTail = this.activitySaveTail.then(() => this.saveSettings()).catch((error) => console.warn("[fs-TB] activity persistence failed:", error));
  }
};
var main_default = FeishuSyncPlugin;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FeishuSyncPlugin
});
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 5.2.1 https://github.com/nodeca/js-yaml @license MIT *)
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzTWlncmF0aW9uLnRzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvYWN0aXZpdHkudHMiLCAic3JjL3NldHRpbmdzVGFiLnRzIiwgInNyYy9sYXJrL2NsaS50cyIsICIuLi9zaGFyZWQvc3JjL3R5cGVzLnRzIiwgIi4uL3NoYXJlZC9zcmMvcHJvdG9jb2wudHMiLCAiLi4vc2hhcmVkL3NyYy9oYXNoLnRzIiwgIi4uL3NoYXJlZC9zcmMvZmlsZW5hbWUudHMiLCAiLi4vc2hhcmVkL3NyYy9pbWFnZS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL3N0ci50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9udWxsX2NvcmUudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvbnVsbF9qc29uLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL251bGxfeWFtbDExLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL2Jvb2xfY29yZS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9ib29sX2pzb24udHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvYm9vbF95YW1sMTEudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvaW50X2NvcmUudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvaW50X2pzb24udHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvaW50X3lhbWwxMS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9mbG9hdF9jb3JlLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL2Zsb2F0X2pzb24udHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvZmxvYXRfeWFtbDExLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL21lcmdlLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL2JpbmFyeS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci90aW1lc3RhbXAudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zZXF1ZW5jZS9zZXEudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL2NvbW1vbi9vYmplY3QudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zZXF1ZW5jZS9vbWFwLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2VxdWVuY2UvcGFpcnMudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9tYXBwaW5nL21hcC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL21hcHBpbmcvc2V0LnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9zY2hlbWEudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9tYXBwaW5nL3JlYWxfbWFwLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvbWFwcGluZy9sZWdhY3lfbWFwLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9jb21tb24vc25pcHBldC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvY29tbW9uL2V4Y2VwdGlvbi50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvcGFyc2VyL2V2ZW50cy50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvcGFyc2VyL3BhcnNlcl9zY2FsYXIudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL2NvbW1vbi90YWduYW1lLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9wYXJzZXIvY29uc3RydWN0b3IudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3BhcnNlci9wYXJzZXIudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL2xvYWQudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL2FzdC9ub2Rlcy50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvYXN0L2Zyb21fanMudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL2FzdC92aXNpdC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvYXN0L3ByZXNlbnRlci50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvZHVtcC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvYXN0L2Zyb21fZXZlbnRzLnRzIiwgIi4uL3NoYXJlZC9zcmMveWFtbC50cyIsICIuLi9zaGFyZWQvc3JjL2NhbGxvdXQudHMiLCAic3JjL21hcHBpbmcudHMiLCAic3JjL3NlcnZlci50cyIsICJzcmMvaGFuZGxlcnMvc3RhdHVzSGFuZGxlci50cyIsICJzcmMvaGFuZGxlcnMvdHJlZUhhbmRsZXIudHMiLCAic3JjL2hhbmRsZXJzL2ZldGNoSGFuZGxlci50cyIsICJzcmMvZmlsZWlvL3dyaXRlci50cyIsICJzcmMvYXV0b1JlbmFtZS50cyIsICJzcmMvYmluZGluZ0luZGV4LnRzIiwgInNyYy92YXVsdEJpbmRpbmcudHMiLCAic3JjL3ZhdWx0UGF0aC50cyIsICJzcmMvcmVtb3RlQ2Fub25pY2FsLnRzIiwgInNyYy9yZW1vdGVEb2N1bWVudC50cyIsICJzcmMvc3luY0RlY2lzaW9uLnRzIiwgInNyYy9yZWNvdmVyeS50cyIsICJzcmMvaGFuZGxlcnMvY2xpcEhhbmRsZXIudHMiLCAic3JjL2hhbmRsZXJzL2V4aXN0c0hhbmRsZXIudHMiLCAic3JjL2hhbmRsZXJzL3B1c2hiYWNrSGFuZGxlci50cyIsICJzcmMvY29tbWFuZHMudHMiLCAic3JjL2ZldGNoRW50cnlwb2ludHMudHMiLCAic3JjL2ltYWdlUmVuZGVyLnRzIiwgInNyYy9zeXN0ZW1Qcm9wZXJ0aWVzLnRzIiwgInNyYy9zeW5jQ29vcmRpbmF0b3IudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogT0IgXHU2M0QyXHU0RUY2XHU1MTY1XHU1M0UzXHUzMDAyXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzQuMVx1RkYwOFx1NkEyMVx1NTc1NyBCXHVGRjA5XHUzMDAyXG4gKlxuICogXHU4MDRDXHU4RDIzXHVGRjFBXG4gKiAxLiBcdTUyQTBcdThGN0RcdThCQkVcdTdGNkVcdUZGMDhcdTk5OTZcdTZCMjFcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTBcdTU0MkZcdTUyQThcdTRFRTRcdTcyNENcdUZGMDlcbiAqIDIuIFx1NjNBMlx1NkQ0QiBsYXJrLWNsaVxuICogMy4gXHU1NDJGXHU1MkE4XHU2NzJDXHU1NzMwIEhUVFAgc2VydmVyXHVGRjBDXHU2Q0U4XHU1MThDXHU4REVGXHU3NTMxXG4gKiA0LiBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcdTMwMDFcdThCQkVcdTdGNkVcdTk4NzVcdTMwMDFcdTU2RkVcdTcyNDdcdTZFMzJcdTY3RDNcdTMwMDFcdTUyMjBcdTk2NjRcdTc2RDFcdTU0MkNcbiAqIDUuIFx1NTM3OFx1OEY3RFx1NjVGNlx1NTA1Q1x1NkI2MiBzZXJ2ZXJcbiAqL1xuaW1wb3J0IHsgUGx1Z2luLCBOb3RpY2UsIFRGaWxlIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHtcbiAgdHlwZSBGZWlzaHVTeW5jU2V0dGluZ3MsXG4gIHR5cGUgUGx1Z2luU3RhdGUsXG4gIHR5cGUgUmVjZW50U3luYyxcbn0gZnJvbSAnLi9zZXR0aW5ncy5qcyc7XG5pbXBvcnQgeyBnZW5lcmF0ZVN5bmNUb2tlbiwgbWlncmF0ZVNldHRpbmdzIH0gZnJvbSAnLi9zZXR0aW5nc01pZ3JhdGlvbi5qcyc7XG5pbXBvcnQgeyBGZWlzaHVTeW5jU2V0dGluZ1RhYiB9IGZyb20gJy4vc2V0dGluZ3NUYWIuanMnO1xuaW1wb3J0IHsgc3RhcnRTZXJ2ZXIsIHR5cGUgU2VydmVyRGVwcywgdHlwZSBSb3V0ZUhhbmRsZXIgfSBmcm9tICcuL3NlcnZlci5qcyc7XG5pbXBvcnQgeyBkaXNhYmxlQ2xpLCBlbmFibGVDbGksIHJlc29sdmVDbGkgfSBmcm9tICcuL2xhcmsvY2xpLmpzJztcbmltcG9ydCB7IGNyZWF0ZVN0YXR1c0hhbmRsZXIgfSBmcm9tICcuL2hhbmRsZXJzL3N0YXR1c0hhbmRsZXIuanMnO1xuaW1wb3J0IHsgY3JlYXRlVHJlZUhhbmRsZXIgfSBmcm9tICcuL2hhbmRsZXJzL3RyZWVIYW5kbGVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZUZldGNoSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlcnMvZmV0Y2hIYW5kbGVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZUNsaXBIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9jbGlwSGFuZGxlci5qcyc7XG5pbXBvcnQgeyBjcmVhdGVFeGlzdHNIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9leGlzdHNIYW5kbGVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZVB1c2hiYWNrSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlcnMvcHVzaGJhY2tIYW5kbGVyLmpzJztcbmltcG9ydCB7IHJlZ2lzdGVyQ29tbWFuZHMgfSBmcm9tICcuL2NvbW1hbmRzLmpzJztcbmltcG9ydCB7IHJlZ2lzdGVyRmV0Y2hFbnRyeXBvaW50cyB9IGZyb20gJy4vZmV0Y2hFbnRyeXBvaW50cy5qcyc7XG5pbXBvcnQgeyByZWdpc3RlckltYWdlUmVuZGVyZXIsIGNsZWFudXBJbWFnZUNhY2hlIH0gZnJvbSAnLi9pbWFnZVJlbmRlci5qcyc7XG5pbXBvcnQgeyByZWZyZXNoTWFwcGluZyB9IGZyb20gJy4vbWFwcGluZy5qcyc7XG5pbXBvcnQge1xuICBpc1N5c3RlbVByb3BlcnR5S2V5LFxuICBTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTUyxcbiAgU1lTVEVNX1BST1BFUlRZX0NTUyxcbiAgU1lTVEVNX1BST1BFUlRZX0hJRERFTl9DTEFTUyxcbiAgU1lTVEVNX1BST1BFUlRZX1NUWUxFX0lELFxufSBmcm9tICcuL3N5c3RlbVByb3BlcnRpZXMuanMnO1xuaW1wb3J0IHsgU3luY0Nvb3JkaW5hdG9yIH0gZnJvbSAnLi9zeW5jQ29vcmRpbmF0b3IuanMnO1xuaW1wb3J0IHR5cGUgeyBDbGlwUmVxdWVzdCwgRmV0Y2hSZXF1ZXN0LCBQdXNoYmFja1JlcXVlc3QgfSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHsgZXh0cmFjdEZlaXNodUlkIH0gZnJvbSAnLi9iaW5kaW5nSW5kZXguanMnO1xuaW1wb3J0IHsgbm9ybWFsaXplVmF1bHREaXIsIG5vcm1hbGl6ZVZhdWx0TWFya2Rvd25QYXRoIH0gZnJvbSAnLi92YXVsdFBhdGguanMnO1xuaW1wb3J0IHsgYXBwZW5kQWN0aXZpdHksIG5vcm1hbGl6ZUFjdGl2aXR5LCB0eXBlIEFjdGl2aXR5S2luZCB9IGZyb20gJy4vYWN0aXZpdHkuanMnO1xuXG5leHBvcnQgY2xhc3MgRmVpc2h1U3luY1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIHNldHRpbmdzITogRmVpc2h1U3luY1NldHRpbmdzO1xuICBzdGF0ZSE6IFBsdWdpblN0YXRlO1xuICBwcml2YXRlIHN0b3BTZXJ2ZXI/OiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICBwcml2YXRlIHN5c3RlbVByb3BlcnR5T2JzZXJ2ZXI/OiBNdXRhdGlvbk9ic2VydmVyO1xuICBwcml2YXRlIGFjdGl2aXR5U2F2ZVRhaWw6IFByb21pc2U8dm9pZD4gPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgcmVhZG9ubHkgc3luY0Nvb3JkaW5hdG9yID0gbmV3IFN5bmNDb29yZGluYXRvcigpO1xuXG4gIGFzeW5jIG9ubG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBlbmFibGVDbGkoKTtcbiAgICBsZXQgc2hvdWxkU2F2ZVNldHRpbmdzID0gYXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcblxuICAgIC8vIFx1OEZEMFx1ODg0Q1x1NjVGNlx1NzJCNlx1NjAwMVxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBsYXJrQ2xpUmVzb2x2ZWQ6ICcnLFxuICAgICAgbGFya0NsaVZlcnNpb246ICcnLFxuICAgICAgc2VydmVyUnVubmluZzogZmFsc2UsXG4gICAgICByZWNlbnRTeW5jczogbm9ybWFsaXplQWN0aXZpdHkodGhpcy5zZXR0aW5ncy5yZWNlbnRBY3Rpdml0eSkgYXMgUmVjZW50U3luY1tdLFxuICAgIH07XG5cbiAgICAvLyBcdTk5OTZcdTZCMjFcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTBcdTU0MkZcdTUyQThcdTRFRTRcdTcyNENcbiAgICBpZiAoIXRoaXMuc2V0dGluZ3Muc3luY1Rva2VuKSB7XG4gICAgICB0aGlzLnNldHRpbmdzLnN5bmNUb2tlbiA9IGdlbmVyYXRlU3luY1Rva2VuKCk7XG4gICAgICBzaG91bGRTYXZlU2V0dGluZ3MgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoc2hvdWxkU2F2ZVNldHRpbmdzKSB7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncygpO1xuICAgIH1cbiAgICB0aGlzLmFwcGx5U3lzdGVtUHJvcGVydGllc1Zpc2liaWxpdHkoKTtcblxuICAgIC8vIFx1NjNBMlx1NkQ0QiBsYXJrLWNsaVxuICAgIGNvbnN0IGxhcmtJbmZvID0gcmVzb2x2ZUNsaSh0aGlzLnNldHRpbmdzLmxhcmtDbGlQYXRoIHx8IHVuZGVmaW5lZCk7XG4gICAgaWYgKGxhcmtJbmZvKSB7XG4gICAgICB0aGlzLnN0YXRlLmxhcmtDbGlSZXNvbHZlZCA9IGxhcmtJbmZvLnBhdGg7XG4gICAgICB0aGlzLnN0YXRlLmxhcmtDbGlWZXJzaW9uID0gbGFya0luZm8udmVyc2lvbjtcbiAgICAgIHByb2Nlc3MuZW52Ll9fTEFSS19DTElfUEFUSF9fID0gbGFya0luZm8ucGF0aDtcbiAgICAgIGNvbnNvbGUubG9nKGBbZnMtVEJdIGxhcmstY2xpOiAke2xhcmtJbmZvLnZlcnNpb259IEAgJHtsYXJrSW5mby5wYXRofWApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tmcy1UQl0gbGFyay1jbGkgbm90IGZvdW5kIChuZWVkID49IDEuMC41MiknKTtcbiAgICB9XG5cbiAgICAvLyBcdThCQkVcdTdGNkVcdTk4NzVcbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IEZlaXNodVN5bmNTZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XG5cbiAgICAvLyBcdTU0N0RcdTRFRTRcbiAgICByZWdpc3RlckNvbW1hbmRzKHRoaXMpO1xuICAgIHJlZ2lzdGVyRmV0Y2hFbnRyeXBvaW50cyh0aGlzKTtcblxuICAgIC8vIFx1NTZGRVx1NzI0N1x1NkUzMlx1NjdEM1xuICAgIHJlZ2lzdGVySW1hZ2VSZW5kZXJlcih0aGlzKTtcblxuICAgIC8vIFx1NTQyRlx1NTJBOCBIVFRQIHNlcnZlclxuICAgIGF3YWl0IHRoaXMuc3RhcnRIdHRwU2VydmVyKCk7XG5cbiAgICAvLyByaWJib24gXHU1NkZFXHU2ODA3XG4gICAgdGhpcy5hZGRSaWJib25JY29uKCdyZWZyZXNoLWN3JywgJ1x1OThERVx1NEU2Nlx1NTQwQ1x1NkI2NScsIGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IHJlZnJlc2hNYXBwaW5nKHRoaXMuYXBwLCB0aGlzLnNldHRpbmdzLnNwYWNlSWQpO1xuICAgIH0pO1xuXG4gICAgLy8gXHU1NDJGXHU1MkE4XHU2NUY2XHU2RTA1XHU3NDA2XHU0RTAwXHU2QjIxXHU4RkM3XHU2NzFGXHU3RjEzXHU1QjU4XG4gICAgdGhpcy5hcHAud29ya3NwYWNlLm9uTGF5b3V0UmVhZHkoKCkgPT4ge1xuICAgICAgY2xlYW51cEltYWdlQ2FjaGUodGhpcywgdGhpcy5zZXR0aW5ncy5jYWNoZUNsZWFudXApLmNhdGNoKCgpID0+IHt9KTtcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKGBbZnMtVEJdICR7dGhpcy5tYW5pZmVzdC52ZXJzaW9ufSBsb2FkZWQgb24gcG9ydCAke3RoaXMuc2V0dGluZ3MucG9ydH1gKTtcbiAgfVxuXG4gIGFzeW5jIG9udW5sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGRpc2FibGVDbGkoKTtcbiAgICBhd2FpdCB0aGlzLmFjdGl2aXR5U2F2ZVRhaWw7XG4gICAgdGhpcy5zeXN0ZW1Qcm9wZXJ0eU9ic2VydmVyPy5kaXNjb25uZWN0KCk7XG4gICAgdGhpcy5zeXN0ZW1Qcm9wZXJ0eU9ic2VydmVyID0gdW5kZWZpbmVkO1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZShTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTUyk7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoU1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1MpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFNZU1RFTV9QUk9QRVJUWV9TVFlMRV9JRCk/LnJlbW92ZSgpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYC4ke1NZU1RFTV9QUk9QRVJUWV9ISURERU5fQ0xBU1N9YCkuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFNZU1RFTV9QUk9QRVJUWV9ISURERU5fQ0xBU1MpO1xuICAgIH0pO1xuICAgIGlmICh0aGlzLnN0b3BTZXJ2ZXIpIHtcbiAgICAgIGF3YWl0IHRoaXMuc3RvcFNlcnZlcigpO1xuICAgICAgdGhpcy5zdG9wU2VydmVyID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnW2ZzLVRCXSB1bmxvYWRlZCcpO1xuICB9XG5cbiAgYXN5bmMgbG9hZFNldHRpbmdzKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IG1pZ3JhdGlvbiA9IG1pZ3JhdGVTZXR0aW5ncyhhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuICAgIHRoaXMuc2V0dGluZ3MgPSBtaWdyYXRpb24uc2V0dGluZ3M7XG4gICAgcmV0dXJuIG1pZ3JhdGlvbi5jaGFuZ2VkO1xuICB9XG5cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cblxuICBhc3luYyBkb2N1bWVudENvb3JkaW5hdGlvbktleShub2RlVG9rZW4/OiBzdHJpbmcsIHBhdGg/OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGlmIChub2RlVG9rZW4pIHJldHVybiBgZG9jdW1lbnQ6JHtub2RlVG9rZW59YDtcbiAgICBpZiAocGF0aCkge1xuICAgICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBub3JtYWxpemVWYXVsdE1hcmtkb3duUGF0aChwYXRoKTtcbiAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgobm9ybWFsaXplZFBhdGgpO1xuICAgICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICBjb25zdCBmZWlzaHVJZCA9IGV4dHJhY3RGZWlzaHVJZChhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpKTtcbiAgICAgICAgaWYgKGZlaXNodUlkKSByZXR1cm4gYGRvY3VtZW50OiR7ZmVpc2h1SWR9YDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBgcGF0aDoke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgfVxuICAgIHJldHVybiAnZG9jdW1lbnQ6bWlzc2luZyc7XG4gIH1cblxuICBhcHBseVN5c3RlbVByb3BlcnRpZXNWaXNpYmlsaXR5KCk6IHZvaWQge1xuICAgIGNvbnN0IGVuYWJsZWQgPSB0aGlzLnNldHRpbmdzLmhpZGVTeXN0ZW1Qcm9wZXJ0aWVzID8/IHRydWU7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKFNZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTLCBlbmFibGVkKTtcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTUywgZW5hYmxlZCk7XG5cbiAgICBsZXQgc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoU1lTVEVNX1BST1BFUlRZX1NUWUxFX0lEKTtcbiAgICBpZiAoIXN0eWxlRWxlbWVudCkge1xuICAgICAgc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgIHN0eWxlRWxlbWVudC5pZCA9IFNZU1RFTV9QUk9QRVJUWV9TVFlMRV9JRDtcbiAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gICAgc3R5bGVFbGVtZW50LnRleHRDb250ZW50ID0gZW5hYmxlZCA/IFNZU1RFTV9QUk9QRVJUWV9DU1MgOiAnJztcblxuICAgIHRoaXMuc3lzdGVtUHJvcGVydHlPYnNlcnZlcj8uZGlzY29ubmVjdCgpO1xuICAgIHRoaXMuc3lzdGVtUHJvcGVydHlPYnNlcnZlciA9IHVuZGVmaW5lZDtcbiAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYC4ke1NZU1RFTV9QUk9QRVJUWV9ISURERU5fQ0xBU1N9YCkuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoU1lTVEVNX1BST1BFUlRZX0hJRERFTl9DTEFTUyk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnJlZnJlc2hTeXN0ZW1Qcm9wZXJ0eURvbVZpc2liaWxpdHkoKTtcbiAgICB0aGlzLnN5c3RlbVByb3BlcnR5T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICB0aGlzLnJlZnJlc2hTeXN0ZW1Qcm9wZXJ0eURvbVZpc2liaWxpdHkoKTtcbiAgICB9KTtcbiAgICB0aGlzLnN5c3RlbVByb3BlcnR5T2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydkYXRhLXByb3BlcnR5LWtleScsICdkYXRhLXByb3BlcnR5LW5hbWUnLCAndmFsdWUnLCAndGl0bGUnLCAnYXJpYS1sYWJlbCddLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZWZyZXNoU3lzdGVtUHJvcGVydHlEb21WaXNpYmlsaXR5KCk6IHZvaWQge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcubWV0YWRhdGEtcHJvcGVydHknKS5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICBjb25zdCBpbnB1dCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihcbiAgICAgICAgJy5tZXRhZGF0YS1wcm9wZXJ0eS1rZXktaW5wdXQsIC5tZXRhZGF0YS1wcm9wZXJ0eS1rZXkgaW5wdXQsIGlucHV0JyxcbiAgICAgICk7XG4gICAgICBjb25zdCBrZXlOb2RlID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcbiAgICAgICAgJy5tZXRhZGF0YS1wcm9wZXJ0eS1rZXksIC5tZXRhZGF0YS1wcm9wZXJ0eS1rZXktaW5uZXIsIC5tZXRhZGF0YS1wcm9wZXJ0eS1sYWJlbCcsXG4gICAgICApO1xuICAgICAgY29uc3QgdmFsdWVzID0gW1xuICAgICAgICBlbGVtZW50LmRhdGFzZXQucHJvcGVydHlLZXksXG4gICAgICAgIGVsZW1lbnQuZGF0YXNldC5wcm9wZXJ0eU5hbWUsXG4gICAgICAgIGlucHV0Py52YWx1ZSxcbiAgICAgICAgaW5wdXQ/LmdldEF0dHJpYnV0ZSgndmFsdWUnKSxcbiAgICAgICAgaW5wdXQ/LmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcpLFxuICAgICAgICBrZXlOb2RlPy50aXRsZSxcbiAgICAgICAga2V5Tm9kZT8udGV4dENvbnRlbnQsXG4gICAgICBdO1xuICAgICAgY29uc3Qgc2hvdWxkSGlkZSA9IHZhbHVlcy5zb21lKGlzU3lzdGVtUHJvcGVydHlLZXkpO1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFNZU1RFTV9QUk9QRVJUWV9ISURERU5fQ0xBU1MsIHNob3VsZEhpZGUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFx1NTQyRlx1NTJBOCBIVFRQIHNlcnZlclx1RkYwQ1x1NkNFOFx1NTE4Q1x1NjI0MFx1NjcwOVx1OERFRlx1NzUzMVx1MzAwMiAqL1xuICBwcml2YXRlIGFzeW5jIHN0YXJ0SHR0cFNlcnZlcigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCByb3V0ZXMgPSBuZXcgTWFwPHN0cmluZywgUm91dGVIYW5kbGVyPigpO1xuXG4gICAgY29uc3QgZGVwczogU2VydmVyRGVwcyA9IHtcbiAgICAgIHZhbGlkYXRlVG9rZW46ICh0b2tlbikgPT4gdG9rZW4gPT09IHRoaXMuc2V0dGluZ3Muc3luY1Rva2VuLFxuICAgICAgcm91dGVzLFxuICAgIH07XG5cbiAgICAvLyBcdTZDRThcdTUxOENcdThERUZcdTc1MzFcbiAgICByb3V0ZXMuc2V0KCcvc3RhdHVzJywgY3JlYXRlU3RhdHVzSGFuZGxlcih0aGlzLm1hbmlmZXN0LnZlcnNpb24sIHRoaXMuYXBwLnZhdWx0LmdldE5hbWUoKSwgdGhpcy5zdGF0ZSkpO1xuICAgIHJvdXRlcy5zZXQoJy90cmVlJywgY3JlYXRlVHJlZUhhbmRsZXIodGhpcy5hcHApKTtcbiAgICBjb25zdCBmZXRjaEhhbmRsZXIgPSBjcmVhdGVGZXRjaEhhbmRsZXIoe1xuICAgICAgYXBwOiB0aGlzLmFwcCxcbiAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxuICAgICAgc3RhdGU6IHRoaXMuc3RhdGUsXG4gICAgICBub3RpY2U6IChtKSA9PiBuZXcgTm90aWNlKG0pLFxuICAgIH0pO1xuICAgIHJvdXRlcy5zZXQoJy9mZXRjaCcsIChjdHgpID0+IHtcbiAgICAgIGNvbnN0IHJlcSA9IGN0eC5ib2R5IGFzIEZldGNoUmVxdWVzdDtcbiAgICAgIGNvbnN0IGRvY3VtZW50S2V5ID0gYGRvY3VtZW50OiR7cmVxPy5ub2RlX3Rva2VuID8/ICcnfWA7XG4gICAgICBjb25zdCBkaXJlY3RvcnlLZXkgPSBgZGlyZWN0b3J5OiR7bm9ybWFsaXplVmF1bHREaXIocmVxPy5kaXIgPz8gdGhpcy5zZXR0aW5ncy5kZWZhdWx0RGlyKX1gO1xuICAgICAgcmV0dXJuIHRoaXMud2l0aEFjdGl2aXR5KCdmZXRjaCcsICgpID0+IHRoaXMuc3luY0Nvb3JkaW5hdG9yLnJ1bihkb2N1bWVudEtleSwgcmVxPy5yZXF1ZXN0SWQsICgpID0+XG4gICAgICAgIHRoaXMuc3luY0Nvb3JkaW5hdG9yLnJ1bihkaXJlY3RvcnlLZXksIHVuZGVmaW5lZCwgKCkgPT4gZmV0Y2hIYW5kbGVyKGN0eCkpKSk7XG4gICAgfSk7XG4gICAgY29uc3QgY2xpcEhhbmRsZXIgPSBjcmVhdGVDbGlwSGFuZGxlcih7XG4gICAgICBhcHA6IHRoaXMuYXBwLFxuICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3MsXG4gICAgICBub3RpY2U6IChtKSA9PiBuZXcgTm90aWNlKG0pLFxuICAgIH0pO1xuICAgIHJvdXRlcy5zZXQoJy9jbGlwJywgKGN0eCkgPT4ge1xuICAgICAgY29uc3QgcmVxID0gY3R4LmJvZHkgYXMgQ2xpcFJlcXVlc3Q7XG4gICAgICBjb25zdCBrZXkgPSByZXE/LmFwcGVuZFBhdGggPyBgY2xpcDoke3JlcS5hcHBlbmRQYXRofWAgOiBgY2xpcDoke3JlcT8ucmVxdWVzdElkID8/ICdhbm9ueW1vdXMnfWA7XG4gICAgICByZXR1cm4gdGhpcy53aXRoQWN0aXZpdHkoJ2NsaXAnLCAoKSA9PiB0aGlzLnN5bmNDb29yZGluYXRvci5ydW4oa2V5LCByZXE/LnJlcXVlc3RJZCwgKCkgPT4gY2xpcEhhbmRsZXIoY3R4KSkpO1xuICAgIH0pO1xuICAgIHJvdXRlcy5zZXQoJy9leGlzdHMnLCBjcmVhdGVFeGlzdHNIYW5kbGVyKHRoaXMuYXBwKSk7XG4gICAgY29uc3QgcHVzaGJhY2tIYW5kbGVyID0gY3JlYXRlUHVzaGJhY2tIYW5kbGVyKHtcbiAgICAgIGFwcDogdGhpcy5hcHAsXG4gICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5ncyxcbiAgICAgIG5vdGljZTogKG0pID0+IG5ldyBOb3RpY2UobSksXG4gICAgfSk7XG4gICAgcm91dGVzLnNldCgnL3B1c2hiYWNrJywgYXN5bmMgKGN0eCkgPT4ge1xuICAgICAgY29uc3QgcmVxID0gY3R4LmJvZHkgYXMgUHVzaGJhY2tSZXF1ZXN0O1xuICAgICAgY29uc3Qga2V5ID0gYXdhaXQgdGhpcy5kb2N1bWVudENvb3JkaW5hdGlvbktleShyZXE/Lm5vZGVfdG9rZW4sIHJlcT8ucGF0aCk7XG4gICAgICByZXR1cm4gdGhpcy53aXRoQWN0aXZpdHkoJ3B1c2hiYWNrJywgKCkgPT4gdGhpcy5zeW5jQ29vcmRpbmF0b3IucnVuKGtleSwgcmVxPy5yZXF1ZXN0SWQsICgpID0+IHB1c2hiYWNrSGFuZGxlcihjdHgpKSk7XG4gICAgfSk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdG9wIH0gPSBhd2FpdCBzdGFydFNlcnZlcih0aGlzLnNldHRpbmdzLnBvcnQsIGRlcHMpO1xuICAgICAgdGhpcy5zdG9wU2VydmVyID0gc3RvcDtcbiAgICAgIHRoaXMuc3RhdGUuc2VydmVyUnVubmluZyA9IHRydWU7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zdCBtc2cgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycik7XG4gICAgICBuZXcgTm90aWNlKGBcdTI3NEMgSFRUUCBzZXJ2ZXIgXHU1NDJGXHU1MkE4XHU1OTMxXHU4RDI1XHVGRjA4XHU3QUVGXHU1M0UzICR7dGhpcy5zZXR0aW5ncy5wb3J0fVx1RkYwOVx1RkYxQSR7bXNnfWApO1xuICAgICAgY29uc29sZS5lcnJvcignW2ZzLVRCXSBzZXJ2ZXIgc3RhcnQgZmFpbGVkOicsIGVycik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyB3aXRoQWN0aXZpdHk8VD4oa2luZDogQWN0aXZpdHlLaW5kLCB0YXNrOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRhc2soKTtcbiAgICAgIGNvbnN0IHZhbHVlID0gcmVzdWx0IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgdGhpcy5yZWNvcmRBY3Rpdml0eSh7XG4gICAgICAgIHRpbWU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAga2luZCxcbiAgICAgICAgc3RhdHVzOiB2YWx1ZS5hY3Rpb24gPT09ICdza2lwcGVkJyA/ICdza2lwcGVkJyA6ICdzdWNjZWVkZWQnLFxuICAgICAgICBhY3Rpb246IHZhbHVlLmFjdGlvbixcbiAgICAgICAgdGl0bGU6IHZhbHVlLmZlaXNodV90aXRsZSA/PyB2YWx1ZS50aXRsZSxcbiAgICAgICAgcGF0aDogdmFsdWUucGF0aCxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5yZWNvcmRBY3Rpdml0eSh7XG4gICAgICAgIHRpbWU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAga2luZCxcbiAgICAgICAgc3RhdHVzOiAnZmFpbGVkJyxcbiAgICAgICAgZXJyb3JDb2RlOiAoZXJyb3IgYXMgeyBjb2RlPzogdW5rbm93biB9KT8uY29kZSA/PyAnSU5URVJOQUwnLFxuICAgICAgfSk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlY29yZEFjdGl2aXR5KHJlY29yZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkIHtcbiAgICB0aGlzLnN0YXRlLnJlY2VudFN5bmNzID0gYXBwZW5kQWN0aXZpdHkodGhpcy5zdGF0ZS5yZWNlbnRTeW5jcywgcmVjb3JkKSBhcyBSZWNlbnRTeW5jW107XG4gICAgdGhpcy5zZXR0aW5ncy5yZWNlbnRBY3Rpdml0eSA9IHRoaXMuc3RhdGUucmVjZW50U3luY3M7XG4gICAgdGhpcy5hY3Rpdml0eVNhdmVUYWlsID0gdGhpcy5hY3Rpdml0eVNhdmVUYWlsXG4gICAgICAudGhlbigoKSA9PiB0aGlzLnNhdmVTZXR0aW5ncygpKVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4gY29uc29sZS53YXJuKCdbZnMtVEJdIGFjdGl2aXR5IHBlcnNpc3RlbmNlIGZhaWxlZDonLCBlcnJvcikpO1xuICB9XG59XG5cbi8vIE9ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NTE2NVx1NTNFM1x1RkYxQVx1NUZDNVx1OTg3Qlx1OUVEOFx1OEJBNFx1NUJGQ1x1NTFGQSBQbHVnaW4gXHU1QjUwXHU3QzdCXG5leHBvcnQgZGVmYXVsdCBGZWlzaHVTeW5jUGx1Z2luO1xuIiwgImltcG9ydCB7IHdlYmNyeXB0byBhcyBub2RlV2ViQ3J5cHRvIH0gZnJvbSAnbm9kZTpjcnlwdG8nO1xuXG5pbXBvcnQge1xuICBERUZBVUxUX1NFVFRJTkdTLFxuICB0eXBlIEZlaXNodVN5bmNTZXR0aW5ncyxcbn0gZnJvbSAnLi9zZXR0aW5ncy5qcyc7XG5pbXBvcnQgeyBub3JtYWxpemVBY3Rpdml0eSB9IGZyb20gJy4vYWN0aXZpdHkuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNldHRpbmdzTWlncmF0aW9uUmVzdWx0IHtcbiAgc2V0dGluZ3M6IEZlaXNodVN5bmNTZXR0aW5ncztcbiAgY2hhbmdlZDogYm9vbGVhbjtcbn1cblxudHlwZSBEYXRhUmVjb3JkID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbmNvbnN0IENBQ0hFX0NMRUFOVVBfVkFMVUVTID0gbmV3IFNldChbXG4gICdkYWlseScsXG4gICd3ZWVrbHknLFxuICAnbW9udGhseScsXG4gICduZXZlcicsXG5dKTtcblxuLyoqXG4gKiBcdTVDMDZcdTVGNTNcdTUyNERcdTYyNDFcdTVFNzNcdThCQkVcdTdGNkVcdTYyMTZcdTY1RTdcdTcyNDhcdTVENENcdTU5NTdcdThCQkVcdTdGNkVcdTY1MzZcdTY1NUJcdTRFM0Egc2NoZW1hIHYxXHUzMDAyXG4gKiBcdTUxRkRcdTY1NzBcdTRFMERcdTRGRUVcdTY1MzlcdThGOTNcdTUxNjVcdUZGMENcdTRFNUZcdTRFMERcdThCQjBcdTVGNTVcdTRFRkJcdTRGNTVcdThCQkVcdTdGNkVcdTUwM0NcdTMwMDJcdTY2NkVcdTkwMUEgZ2V0dGVyIFx1NEYxQVx1ODhBQlx1OERGM1x1OEZDN1x1RkYxQlxuICogUHJveHkgdHJhcCBcdTUzRUZcdTgwRkRcdTYyNjdcdTg4NENcdUZGMENcdTRGNDYgdHJhcCBcdTVGMDJcdTVFMzhcdTRGMUFcdTg4QUJcdTYzNTVcdTgzQjdcdTVFNzZcdTVCODlcdTUxNjhcdTU2REVcdTkwMDBcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pZ3JhdGVTZXR0aW5ncyhpbnB1dDogdW5rbm93bik6IFNldHRpbmdzTWlncmF0aW9uUmVzdWx0IHtcbiAgY29uc3Qgc291cmNlID0gY29weU93bkRhdGEoaW5wdXQpO1xuICBjb25zdCBmZWlzaHVTeW5jID0gY29weU93bkRhdGEoc291cmNlPy5mZWlzaHVTeW5jKTtcbiAgY29uc3QgcnVudGltZUxhcmtEb2MgPSBjb3B5T3duRGF0YShzb3VyY2U/Ll9sYXJrRG9jKTtcbiAgY29uc3QgbGVnYWN5TGFya0RvYyA9IGNvcHlPd25EYXRhKHNvdXJjZT8ubGFya0RvYyk7XG4gIGNvbnN0IG1pZ3JhdGVkID0gc291cmNlID8gY29weVJlY29yZChzb3VyY2UpIDoge307XG5cbiAgbWlncmF0ZWQuc2NoZW1hVmVyc2lvbiA9IDE7XG4gIG1pZ3JhdGVkLnBvcnQgPSBmaXJzdFBvcnQoc291cmNlPy5wb3J0LCBmZWlzaHVTeW5jPy5wb3J0KSA/PyBERUZBVUxUX1NFVFRJTkdTLnBvcnQ7XG4gIG1pZ3JhdGVkLnN5bmNUb2tlbiA9IGZpcnN0Tm9uRW1wdHlTdHJpbmcoc291cmNlPy5zeW5jVG9rZW4sIGZlaXNodVN5bmM/LnN5bmNUb2tlbilcbiAgICA/PyBERUZBVUxUX1NFVFRJTkdTLnN5bmNUb2tlbjtcbiAgbWlncmF0ZWQubGFya0NsaVBhdGggPSBmaXJzdE5vbkVtcHR5U3RyaW5nKFxuICAgIHNvdXJjZT8ubGFya0NsaVBhdGgsXG4gICAgcnVudGltZUxhcmtEb2M/LmxhcmtDbGlQYXRoLFxuICAgIGxlZ2FjeUxhcmtEb2M/LmxhcmtDbGlQYXRoLFxuICAgIGZlaXNodVN5bmM/LmxhcmtDbGlQYXRoLFxuICApID8/IERFRkFVTFRfU0VUVElOR1MubGFya0NsaVBhdGg7XG5cbiAgY29uc3QgZGVmYXVsdERpciA9IGZpcnN0Tm9uRW1wdHlTdHJpbmcoXG4gICAgc291cmNlPy5kZWZhdWx0RGlyLFxuICAgIGZlaXNodVN5bmM/LmRlZmF1bHREaXIsXG4gICkgPz8gREVGQVVMVF9TRVRUSU5HUy5kZWZhdWx0RGlyO1xuICBtaWdyYXRlZC5kZWZhdWx0RGlyID0gZGVmYXVsdERpcjtcbiAgbWlncmF0ZWQuZGVmYXVsdE5vdGVGb2xkZXIgPSBmaXJzdE5vbkVtcHR5U3RyaW5nKFxuICAgIHNvdXJjZT8uZGVmYXVsdE5vdGVGb2xkZXIsXG4gICAgcnVudGltZUxhcmtEb2M/LmRlZmF1bHROb3RlRm9sZGVyLFxuICAgIGxlZ2FjeUxhcmtEb2M/LmRlZmF1bHROb3RlRm9sZGVyLFxuICApID8/IERFRkFVTFRfU0VUVElOR1MuZGVmYXVsdE5vdGVGb2xkZXI7XG5cbiAgY29uc3QgbGVnYWN5QXV0b1JlbmFtZSA9IGNvcHlPd25EYXRhKHNvdXJjZT8uYXV0b1JlbmFtZSk7XG4gIGlmIChsZWdhY3lBdXRvUmVuYW1lICYmIHNvdXJjZT8uX2F1dG9SZW5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgIG1pZ3JhdGVkLl9hdXRvUmVuYW1lID0gc291cmNlPy5hdXRvUmVuYW1lO1xuICB9XG4gIG1pZ3JhdGVkLmF1dG9SZW5hbWUgPSBhdXRvbWF0aWNCZWhhdmlvcihcbiAgICBbc291cmNlLCBmZWlzaHVTeW5jXSxcbiAgICAnYXV0b1JlbmFtZScsXG4gICAgREVGQVVMVF9TRVRUSU5HUy5hdXRvUmVuYW1lLFxuICApO1xuICBtaWdyYXRlZC5hdXRvRGVsZXRlUmVnaXN0cnkgPSBhdXRvbWF0aWNCZWhhdmlvcihcbiAgICBbc291cmNlLCBmZWlzaHVTeW5jXSxcbiAgICAnYXV0b0RlbGV0ZVJlZ2lzdHJ5JyxcbiAgICBERUZBVUxUX1NFVFRJTkdTLmF1dG9EZWxldGVSZWdpc3RyeSxcbiAgKTtcbiAgbWlncmF0ZWQuY2FjaGVDbGVhbnVwID0gZmlyc3RDYWNoZUNsZWFudXAoXG4gICAgc291cmNlPy5jYWNoZUNsZWFudXAsXG4gICAgZmVpc2h1U3luYz8uY2FjaGVDbGVhbnVwLFxuICApID8/IERFRkFVTFRfU0VUVElOR1MuY2FjaGVDbGVhbnVwO1xuICBtaWdyYXRlZC5rZWVwRGVjb3JhdGl2ZUltYWdlcyA9IGZpcnN0Qm9vbGVhbihcbiAgICBzb3VyY2U/LmtlZXBEZWNvcmF0aXZlSW1hZ2VzLFxuICAgIGZlaXNodVN5bmM/LmtlZXBEZWNvcmF0aXZlSW1hZ2VzLFxuICApID8/IERFRkFVTFRfU0VUVElOR1Mua2VlcERlY29yYXRpdmVJbWFnZXM7XG4gIG1pZ3JhdGVkLnNwYWNlSWQgPSBmaXJzdE5vbkVtcHR5U3RyaW5nKHNvdXJjZT8uc3BhY2VJZCwgZmVpc2h1U3luYz8uc3BhY2VJZClcbiAgICA/PyBERUZBVUxUX1NFVFRJTkdTLnNwYWNlSWQ7XG4gIG1pZ3JhdGVkLmhpZGVTeXN0ZW1Qcm9wZXJ0aWVzID0gZmlyc3RCb29sZWFuKFxuICAgIHNvdXJjZT8uaGlkZVN5c3RlbVByb3BlcnRpZXMsXG4gICAgZmVpc2h1U3luYz8uaGlkZVN5c3RlbVByb3BlcnRpZXMsXG4gICkgPz8gREVGQVVMVF9TRVRUSU5HUy5oaWRlU3lzdGVtUHJvcGVydGllcztcbiAgY29uc3Qgbm9ybWFsaXplZEFjdGl2aXR5ID0gbm9ybWFsaXplQWN0aXZpdHkoc291cmNlPy5yZWNlbnRBY3Rpdml0eSk7XG4gIG1pZ3JhdGVkLnJlY2VudEFjdGl2aXR5ID0gc2FtZUpzb25EYXRhKHNvdXJjZT8ucmVjZW50QWN0aXZpdHksIG5vcm1hbGl6ZWRBY3Rpdml0eSlcbiAgICA/IHNvdXJjZT8ucmVjZW50QWN0aXZpdHlcbiAgICA6IG5vcm1hbGl6ZWRBY3Rpdml0eTtcblxuICByZXR1cm4ge1xuICAgIHNldHRpbmdzOiBtaWdyYXRlZCBhcyBGZWlzaHVTeW5jU2V0dGluZ3MsXG4gICAgY2hhbmdlZDogIXNhbWVEYXRhKHNvdXJjZSwgbWlncmF0ZWQpLFxuICB9O1xufVxuXG4vKiogXHU3NTFGXHU2MjEwIDMyIFx1NUI1N1x1ODI4Mlx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1x1RkYxQk9ic2lkaWFuIFx1NjVFMCBXZWIgQ3J5cHRvIFx1NTE2OFx1NUM0MFx1OTFDRlx1NjVGNlx1NTZERVx1OTAwMFx1NTIzMCBOb2RlXHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTeW5jVG9rZW4oKTogc3RyaW5nIHtcbiAgY29uc3QgcmFuZG9tU291cmNlID0gZ2xvYmFsVGhpcy5jcnlwdG8gPz8gbm9kZVdlYkNyeXB0byBhcyB1bmtub3duIGFzIENyeXB0bztcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheSgzMik7XG4gIHJhbmRvbVNvdXJjZS5nZXRSYW5kb21WYWx1ZXMoYnl0ZXMpO1xuICByZXR1cm4gQXJyYXkuZnJvbShieXRlcywgKGJ5dGUpID0+IGJ5dGUudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xufVxuXG4vKipcbiAqIFx1NTNFQVx1NTkwRFx1NTIzNlx1ODFFQVx1NjcwOVx1NTNFRlx1Njc5QVx1NEUzRVx1NjU3MFx1NjM2RVx1NUM1RVx1NjAyN1x1RkYwQ1x1NjY2RVx1OTAxQSBnZXR0ZXIgXHU0RTBEXHU0RjFBXHU4OEFCXHU4QkZCXHU1M0Q2XHUzMDAyXG4gKiBQcm94eSBcdTc2ODQgb3duS2V5cy9nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgdHJhcCBcdTRFQ0RcdTUzRUZcdTgwRkRcdTYyNjdcdTg4NENcdUZGMENcdTUxNzZcdTVGMDJcdTVFMzhcdTU3MjhcdTZCNjRcdTYzNTVcdTgzQjdcdTMwMDJcbiAqL1xuZnVuY3Rpb24gY29weU93bkRhdGEodmFsdWU6IHVua25vd24pOiBEYXRhUmVjb3JkIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcgfHwgdmFsdWUgPT09IG51bGwgfHwgQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQ6IERhdGFSZWNvcmQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIGRlc2NyaXB0b3JdIG9mIE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHZhbHVlKSkpIHtcbiAgICAgIGlmIChkZXNjcmlwdG9yLmVudW1lcmFibGUgJiYgJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSB7XG4gICAgICAgIGRlZmluZURhdGEocmVzdWx0LCBrZXksIGRlc2NyaXB0b3IudmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvcHlSZWNvcmQoc291cmNlOiBEYXRhUmVjb3JkKTogRGF0YVJlY29yZCB7XG4gIGNvbnN0IHJlc3VsdDogRGF0YVJlY29yZCA9IHt9O1xuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzb3VyY2UpKSB7XG4gICAgZGVmaW5lRGF0YShyZXN1bHQsIGtleSwgdmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGRlZmluZURhdGEodGFyZ2V0OiBEYXRhUmVjb3JkLCBrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCB7XG4gICAgdmFsdWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBmaXJzdE5vbkVtcHR5U3RyaW5nKC4uLnZhbHVlczogdW5rbm93bltdKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHZhbHVlcy5maW5kKCh2YWx1ZSk6IHZhbHVlIGlzIHN0cmluZyA9PiAoXG4gICAgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS50cmltKCkubGVuZ3RoID4gMFxuICApKTtcbn1cblxuZnVuY3Rpb24gZmlyc3RCb29sZWFuKC4uLnZhbHVlczogdW5rbm93bltdKTogYm9vbGVhbiB8IHVuZGVmaW5lZCB7XG4gIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VCb29sZWFuKHZhbHVlKTtcbiAgICBpZiAocGFyc2VkICE9PSB1bmRlZmluZWQpIHJldHVybiBwYXJzZWQ7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZmlyc3RQb3J0KC4uLnZhbHVlczogdW5rbm93bltdKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICBjb25zdCBjYW5kaWRhdGUgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3QodmFsdWUudHJpbSgpKVxuICAgICAgPyBOdW1iZXIodmFsdWUudHJpbSgpKVxuICAgICAgOiB2YWx1ZTtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgY2FuZGlkYXRlID09PSAnbnVtYmVyJ1xuICAgICAgJiYgTnVtYmVyLmlzSW50ZWdlcihjYW5kaWRhdGUpXG4gICAgICAmJiBjYW5kaWRhdGUgPj0gMVxuICAgICAgJiYgY2FuZGlkYXRlIDw9IDY1XzUzNVxuICAgICkge1xuICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gYXV0b21hdGljQmVoYXZpb3IoXG4gIHNvdXJjZXM6IEFycmF5PERhdGFSZWNvcmQgfCB1bmRlZmluZWQ+LFxuICBrZXk6ICdhdXRvUmVuYW1lJyB8ICdhdXRvRGVsZXRlUmVnaXN0cnknLFxuICBmYWxsYmFjazogYm9vbGVhbixcbik6IGJvb2xlYW4ge1xuICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBzb3VyY2VzKSB7XG4gICAgaWYgKCFzb3VyY2UgfHwgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIGNvbnRpbnVlO1xuICAgIHJldHVybiBwYXJzZUJvb2xlYW4oc291cmNlW2tleV0pID8/IGZhbHNlO1xuICB9XG4gIHJldHVybiBmYWxsYmFjaztcbn1cblxuZnVuY3Rpb24gcGFyc2VCb29sZWFuKHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB8IHVuZGVmaW5lZCB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykgcmV0dXJuIHZhbHVlO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIHVuZGVmaW5lZDtcblxuICBjb25zdCBub3JtYWxpemVkID0gdmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gIGlmIChub3JtYWxpemVkID09PSAndHJ1ZScpIHJldHVybiB0cnVlO1xuICBpZiAobm9ybWFsaXplZCA9PT0gJ2ZhbHNlJykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBmaXJzdENhY2hlQ2xlYW51cCguLi52YWx1ZXM6IHVua25vd25bXSk6IEZlaXNodVN5bmNTZXR0aW5nc1snY2FjaGVDbGVhbnVwJ10gfCB1bmRlZmluZWQge1xuICByZXR1cm4gdmFsdWVzLmZpbmQoKHZhbHVlKTogdmFsdWUgaXMgRmVpc2h1U3luY1NldHRpbmdzWydjYWNoZUNsZWFudXAnXSA9PiAoXG4gICAgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiBDQUNIRV9DTEVBTlVQX1ZBTFVFUy5oYXModmFsdWUpXG4gICkpO1xufVxuXG5mdW5jdGlvbiBzYW1lRGF0YShzb3VyY2U6IERhdGFSZWNvcmQgfCB1bmRlZmluZWQsIG1pZ3JhdGVkOiBEYXRhUmVjb3JkKTogYm9vbGVhbiB7XG4gIGlmICghc291cmNlKSByZXR1cm4gZmFsc2U7XG5cbiAgY29uc3Qgc291cmNlS2V5cyA9IE9iamVjdC5rZXlzKHNvdXJjZSk7XG4gIGNvbnN0IG1pZ3JhdGVkS2V5cyA9IE9iamVjdC5rZXlzKG1pZ3JhdGVkKTtcbiAgcmV0dXJuIHNvdXJjZUtleXMubGVuZ3RoID09PSBtaWdyYXRlZEtleXMubGVuZ3RoXG4gICAgJiYgbWlncmF0ZWRLZXlzLmV2ZXJ5KChrZXkpID0+IChcbiAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSlcbiAgICAgICYmIE9iamVjdC5pcyhzb3VyY2Vba2V5XSwgbWlncmF0ZWRba2V5XSlcbiAgICApKTtcbn1cblxuZnVuY3Rpb24gc2FtZUpzb25EYXRhKGxlZnQ6IHVua25vd24sIHJpZ2h0OiB1bmtub3duKTogYm9vbGVhbiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGxlZnQpID09PSBKU09OLnN0cmluZ2lmeShyaWdodCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIiwgIi8qKlxuICogT0IgXHU2M0QyXHU0RUY2XHU4QkJFXHU3RjZFXHU2M0E1XHU1M0UzICsgXHU5RUQ4XHU4QkE0XHU1MDNDXHUzMDAyXG4gKiBcdTRGOURcdTYzNkVcdTY1QjlcdTY4NDggXHUwMEE3MTBcdUZGMDhTZXR0aW5nc1RhYlx1RkYwOVx1MzAwMlxuICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgRmVpc2h1U3luY1NldHRpbmdzIHtcbiAgLyoqIFx1NjMwMVx1NEU0NVx1NTMxNlx1OEJCRVx1N0Y2RVx1N0VEM1x1Njc4NFx1NzI0OFx1NjcyQ1x1MzAwMiAqL1xuICBzY2hlbWFWZXJzaW9uOiAxO1xuICAvKiogXHU2NzJDXHU1NzMwIEhUVFAgc2VydmVyIFx1N0FFRlx1NTNFM1x1RkYwOFx1OUVEOFx1OEJBNCA0NTY3XHVGRjA5XHUzMDAyICovXG4gIHBvcnQ6IG51bWJlcjtcbiAgLyoqIFx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1x1RkYwODMyIFx1NUI1N1x1ODI4MiBoZXhcdUZGMENcdTk5OTZcdTZCMjFcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTBcdUZGMDlcdTMwMDIgKi9cbiAgc3luY1Rva2VuOiBzdHJpbmc7XG4gIC8qKiBsYXJrLWNsaSBcdThERUZcdTVGODRcdUZGMDhcdTdBN0E9XHU4MUVBXHU1MkE4XHU2M0EyXHU2RDRCXHVGRjA5XHUzMDAyICovXG4gIGxhcmtDbGlQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTlFRDhcdThCQTRcdTg0M0RcdTU3MzBcdTc2RUVcdTVGNTVcdUZGMDhcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHVGRjA5XHUzMDAyICovXG4gIGRlZmF1bHREaXI6IHN0cmluZztcbiAgLyoqIFx1ODFFQVx1NTJBOFx1ODlFNlx1NTNEMSBhdXRvLXJlbmFtZSBcdTdGMTZcdTc4MDFcdTUyMDZcdTkxNERcdTMwMDIgKi9cbiAgYXV0b1JlbmFtZTogYm9vbGVhbjtcbiAgLyoqIFx1ODFFQVx1NTJBOFx1NzY3Qlx1OEJCMFx1NTIyMFx1OTY2NFx1RkYwOFx1NTE5OVx1OThERVx1NEU2Nlx1NTkxQVx1N0VGNFx1ODg2OFx1NjgzQ1x1RkYwOVx1MzAwMiAqL1xuICBhdXRvRGVsZXRlUmVnaXN0cnk6IGJvb2xlYW47XG4gIC8qKiBcdTU2RkVcdTcyNDdcdTdGMTNcdTVCNThcdTZFMDVcdTc0MDZcdTU0NjhcdTY3MUZcdTMwMDIgKi9cbiAgY2FjaGVDbGVhbnVwOiAnZGFpbHknIHwgJ3dlZWtseScgfCAnbW9udGhseScgfCAnbmV2ZXInO1xuICAvKiogXHU0RkREXHU3NTU5XHU4OEM1XHU5OTcwXHU1NkZFXHU3MjQ3XHUzMDAyICovXG4gIGtlZXBEZWNvcmF0aXZlSW1hZ2VzOiBib29sZWFuO1xuICAvKiogXHU5OERFXHU0RTY2XHU3N0U1XHU4QkM2XHU1RTkzIHNwYWNlX2lkXHVGRjA4XHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0XHU3NTI4XHVGRjA5XHUzMDAyICovXG4gIHNwYWNlSWQ6IHN0cmluZztcbiAgLyoqIDMuMi4xIExhcmsgRG9jIFx1NzY4NFx1NTE3Q1x1NUJCOVx1NzZFRVx1NUY1NVx1NUI1N1x1NkJCNVx1MzAwMiAqL1xuICBkZWZhdWx0Tm90ZUZvbGRlcjogc3RyaW5nO1xuICAvKiogXHU2NjJGXHU1NDI2XHU5NjkwXHU4NUNGXHU1NDBDXHU2QjY1XHU0RjdGXHU3NTI4XHU3Njg0XHU3Q0ZCXHU3RURGXHU1QzVFXHU2MDI3XHUzMDAyICovXG4gIGhpZGVTeXN0ZW1Qcm9wZXJ0aWVzOiBib29sZWFuO1xuICAvKiogXHU2NzAwXHU4RkQxXHU2RDNCXHU1MkE4XHVGRjBDXHU0RUM1XHU1MTQzXHU2NTcwXHU2MzZFXHVGRjBDXHU2NzAwXHU1OTFBIDUwIFx1Njc2MVx1MzAwMiAqL1xuICByZWNlbnRBY3Rpdml0eTogUmVjZW50U3luY1tdO1xuICAvKiogXHU1MzQ3XHU3RUE3XHU2NUY2XHU0RkREXHU3NTU5XHU0RUNEXHU4OEFCXHU4RkQwXHU4ODRDXHU3MjQ4XHU0RjdGXHU3NTI4XHU3Njg0XHU2NzJBXHU3N0U1XHU1QjU3XHU2QkI1XHUzMDAyICovXG4gIFtsZWdhY3lLZXk6IHN0cmluZ106IHVua25vd247XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBGZWlzaHVTeW5jU2V0dGluZ3MgPSB7XG4gIHNjaGVtYVZlcnNpb246IDEsXG4gIHBvcnQ6IDQ1NjcsXG4gIHN5bmNUb2tlbjogJycsXG4gIGxhcmtDbGlQYXRoOiAnJyxcbiAgZGVmYXVsdERpcjogJzBcdUZFMEZcdTIwRTNcdThGOTNcdTUxNjUnLFxuICBhdXRvUmVuYW1lOiB0cnVlLFxuICBhdXRvRGVsZXRlUmVnaXN0cnk6IGZhbHNlLFxuICBjYWNoZUNsZWFudXA6ICd3ZWVrbHknLFxuICBrZWVwRGVjb3JhdGl2ZUltYWdlczogdHJ1ZSxcbiAgc3BhY2VJZDogJzc2NTEzMTQxNTAwNjAwNjc4MDMnLFxuICBkZWZhdWx0Tm90ZUZvbGRlcjogJzNcdUZFMEZcdTIwRTNcdTk2NDRcdTRFRjZcdTY1ODdcdTRFRjYvTGFyaycsXG4gIGhpZGVTeXN0ZW1Qcm9wZXJ0aWVzOiB0cnVlLFxuICByZWNlbnRBY3Rpdml0eTogW10sXG59O1xuXG4vKiogXHU2M0QyXHU0RUY2XHU4RkQwXHU4ODRDXHU2NUY2XHU3MkI2XHU2MDAxXHVGRjA4XHU0RTBEXHU2MzAxXHU0RTQ1XHU1MzE2XHVGRjA5XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFBsdWdpblN0YXRlIHtcbiAgLyoqIGxhcmstY2xpIFx1NUI5RVx1OTY0NVx1OERFRlx1NUY4NFx1RkYwOFx1NjNBMlx1NkQ0Qi9cdThCQkVcdTdGNkVcdTU0MEVcdTc2ODRcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMDlcdTMwMDIgKi9cbiAgbGFya0NsaVJlc29sdmVkOiBzdHJpbmc7XG4gIC8qKiBsYXJrLWNsaSBcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMDhcdTU5ODIgXCIxLjAuNTJcIlx1RkYwOVx1MzAwMiAqL1xuICBsYXJrQ2xpVmVyc2lvbjogc3RyaW5nO1xuICAvKiogSFRUUCBzZXJ2ZXIgXHU2NjJGXHU1NDI2XHU2QjYzXHU1NzI4XHU4RkQwXHU4ODRDXHUzMDAyICovXG4gIHNlcnZlclJ1bm5pbmc6IGJvb2xlYW47XG4gIC8qKiBcdTY3MDBcdThGRDFcdTU0MENcdTZCNjVcdThCQjBcdTVGNTVcdUZGMDhcdTUxODVcdTVCNThcdTRFMkRcdUZGMENcdTY3MDBcdTU5MUEgNTAgXHU2NzYxXHVGRjA5XHUzMDAyICovXG4gIHJlY2VudFN5bmNzOiBSZWNlbnRTeW5jW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVjZW50U3luYyB7XG4gIHRpbWU6IHN0cmluZztcbiAga2luZDogJ2ZldGNoJyB8ICdjbGlwJyB8ICdwdXNoYmFjaycgfCAnZGVsZXRpb24nIHwgJ3N5c3RlbSc7XG4gIHN0YXR1czogJ3N1Y2NlZWRlZCcgfCAnZmFpbGVkJyB8ICdza2lwcGVkJztcbiAgdGl0bGU/OiBzdHJpbmc7XG4gIHBhdGg/OiBzdHJpbmc7XG4gIGFjdGlvbj86IHN0cmluZztcbiAgZXJyb3JDb2RlPzogc3RyaW5nO1xufVxuIiwgImV4cG9ydCB0eXBlIEFjdGl2aXR5S2luZCA9ICdmZXRjaCcgfCAnY2xpcCcgfCAncHVzaGJhY2snIHwgJ2RlbGV0aW9uJyB8ICdzeXN0ZW0nO1xuZXhwb3J0IHR5cGUgQWN0aXZpdHlTdGF0dXMgPSAnc3VjY2VlZGVkJyB8ICdmYWlsZWQnIHwgJ3NraXBwZWQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2aXR5UmVjb3JkIHtcbiAgdGltZTogc3RyaW5nO1xuICBraW5kOiBBY3Rpdml0eUtpbmQ7XG4gIHN0YXR1czogQWN0aXZpdHlTdGF0dXM7XG4gIGFjdGlvbj86IHN0cmluZztcbiAgdGl0bGU/OiBzdHJpbmc7XG4gIHBhdGg/OiBzdHJpbmc7XG4gIGVycm9yQ29kZT86IHN0cmluZztcbn1cblxuY29uc3QgTUFYX0FDVElWSVRZID0gNTA7XG5jb25zdCBLSU5EUyA9IG5ldyBTZXQ8QWN0aXZpdHlLaW5kPihbJ2ZldGNoJywgJ2NsaXAnLCAncHVzaGJhY2snLCAnZGVsZXRpb24nLCAnc3lzdGVtJ10pO1xuY29uc3QgU1RBVFVTRVMgPSBuZXcgU2V0PEFjdGl2aXR5U3RhdHVzPihbJ3N1Y2NlZWRlZCcsICdmYWlsZWQnLCAnc2tpcHBlZCddKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGVuZEFjdGl2aXR5KFxuICBjdXJyZW50OiB1bmtub3duLFxuICBpbnB1dDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4pOiBBY3Rpdml0eVJlY29yZFtdIHtcbiAgY29uc3QgcHJldmlvdXMgPSBub3JtYWxpemVBY3Rpdml0eShjdXJyZW50KTtcbiAgY29uc3QgcmVjb3JkID0gbm9ybWFsaXplUmVjb3JkKGlucHV0KTtcbiAgcmV0dXJuIHJlY29yZCA/IFtyZWNvcmQsIC4uLnByZXZpb3VzXS5zbGljZSgwLCBNQVhfQUNUSVZJVFkpIDogcHJldmlvdXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVBY3Rpdml0eShpbnB1dDogdW5rbm93bik6IEFjdGl2aXR5UmVjb3JkW10ge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoaW5wdXQpKSByZXR1cm4gW107XG4gIHJldHVybiBpbnB1dFxuICAgIC5tYXAoKGl0ZW0pID0+IG5vcm1hbGl6ZVJlY29yZChpdGVtKSlcbiAgICAuZmlsdGVyKChpdGVtKTogaXRlbSBpcyBBY3Rpdml0eVJlY29yZCA9PiBpdGVtICE9PSBudWxsKVxuICAgIC5zbGljZSgwLCBNQVhfQUNUSVZJVFkpO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVSZWNvcmQoaW5wdXQ6IHVua25vd24pOiBBY3Rpdml0eVJlY29yZCB8IG51bGwge1xuICBpZiAoIWlucHV0IHx8IHR5cGVvZiBpbnB1dCAhPT0gJ29iamVjdCcpIHJldHVybiBudWxsO1xuICBjb25zdCB2YWx1ZSA9IGlucHV0IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBpZiAoIUtJTkRTLmhhcyh2YWx1ZS5raW5kIGFzIEFjdGl2aXR5S2luZCkgfHwgIVNUQVRVU0VTLmhhcyh2YWx1ZS5zdGF0dXMgYXMgQWN0aXZpdHlTdGF0dXMpKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgdGltZSA9IHR5cGVvZiB2YWx1ZS50aW1lID09PSAnc3RyaW5nJyAmJiBOdW1iZXIuaXNGaW5pdGUoRGF0ZS5wYXJzZSh2YWx1ZS50aW1lKSlcbiAgICA/IHZhbHVlLnRpbWVcbiAgICA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgY29uc3QgcmVjb3JkOiBBY3Rpdml0eVJlY29yZCA9IHtcbiAgICB0aW1lLFxuICAgIGtpbmQ6IHZhbHVlLmtpbmQgYXMgQWN0aXZpdHlLaW5kLFxuICAgIHN0YXR1czogdmFsdWUuc3RhdHVzIGFzIEFjdGl2aXR5U3RhdHVzLFxuICB9O1xuICBhc3NpZ25Cb3VuZGVkU3RyaW5nKHJlY29yZCwgJ2FjdGlvbicsIHZhbHVlLmFjdGlvbiwgNDApO1xuICBhc3NpZ25Cb3VuZGVkU3RyaW5nKHJlY29yZCwgJ3RpdGxlJywgdmFsdWUudGl0bGUsIDE2MCk7XG4gIGFzc2lnbkJvdW5kZWRTdHJpbmcocmVjb3JkLCAncGF0aCcsIHZhbHVlLnBhdGgsIDUwMCk7XG4gIGlmICh0eXBlb2YgdmFsdWUuZXJyb3JDb2RlID09PSAnc3RyaW5nJyAmJiAvXltBLVowLTlfLV17MSw4MH0kLy50ZXN0KHZhbHVlLmVycm9yQ29kZSkpIHtcbiAgICByZWNvcmQuZXJyb3JDb2RlID0gdmFsdWUuZXJyb3JDb2RlO1xuICB9XG4gIHJldHVybiByZWNvcmQ7XG59XG5cbmZ1bmN0aW9uIGFzc2lnbkJvdW5kZWRTdHJpbmcoXG4gIHRhcmdldDogQWN0aXZpdHlSZWNvcmQsXG4gIGtleTogJ2FjdGlvbicgfCAndGl0bGUnIHwgJ3BhdGgnLFxuICB2YWx1ZTogdW5rbm93bixcbiAgbWF4TGVuZ3RoOiBudW1iZXIsXG4pOiB2b2lkIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUudHJpbSgpKSB0YXJnZXRba2V5XSA9IHZhbHVlLnRyaW0oKS5zbGljZSgwLCBtYXhMZW5ndGgpO1xufVxuIiwgIi8qKlxuICogT0IgXHU2M0QyXHU0RUY2XHU4QkJFXHU3RjZFXHU3NTRDXHU5NzYyXHUzMDAyXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzEwXHVGRjA4U2V0dGluZ3NUYWJcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdTdBRUZcdTUzRTNcdTMwMDFcdTU0MkZcdTUyQThcdTRFRTRcdTcyNENcdUZGMDhcdTc1MUZcdTYyMTAvXHU5MUNEXHU3RjZFL1x1NTkwRFx1NTIzNlx1RkYwOVx1MzAwMWxhcmstY2xpIFx1OERFRlx1NUY4NFx1MzAwMVx1OUVEOFx1OEJBNFx1NzZFRVx1NUY1NVx1MzAwMVx1NUYwMFx1NTE3M1x1MzAwMVx1N0YxM1x1NUI1OFx1NTQ2OFx1NjcxRlx1MzAwMlxuICovXG5pbXBvcnQgeyBBcHAsIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcsIE5vdGljZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgRmVpc2h1U3luY1BsdWdpbiB9IGZyb20gJy4vbWFpbi5qcyc7XG5pbXBvcnQgdHlwZSB7IEZlaXNodVN5bmNTZXR0aW5ncyB9IGZyb20gJy4vc2V0dGluZ3MuanMnO1xuaW1wb3J0IHsgZ2VuZXJhdGVTeW5jVG9rZW4gfSBmcm9tICcuL3NldHRpbmdzTWlncmF0aW9uLmpzJztcbmltcG9ydCB7IHJlc29sdmVDbGkgfSBmcm9tICcuL2xhcmsvY2xpLmpzJztcbmltcG9ydCB7IHJlZnJlc2hNYXBwaW5nIH0gZnJvbSAnLi9tYXBwaW5nLmpzJztcblxuZXhwb3J0IGNsYXNzIEZlaXNodVN5bmNTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBGZWlzaHVTeW5jUGx1Z2luKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG5cbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICdcdTk4REVcdTRFNjZcdTU0MENcdTZCNjVcdThCQkVcdTdGNkUnIH0pO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwIFx1OTAxQVx1NEZFMSBcdTI1MDBcdTI1MDBcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTY3MkNcdTU3MzBcdTdBRUZcdTUzRTMnKVxuICAgICAgLnNldERlc2MoJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NjI2OVx1NUM1NVx1OEZERVx1NjNBNSBPQiBcdTYzRDJcdTRFRjZcdTc2ODRcdTdBRUZcdTUzRTNcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkYgT0IgXHU2MjE2XHU5MUNEXHU2NUIwXHU1MkEwXHU4RjdEXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFZhbHVlKFN0cmluZyh0aGlzLnBsdWdpbi5zZXR0aW5ncy5wb3J0KSlcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3J0ID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcbiAgICAgICAgICAgIGlmIChwb3J0ID4gMCAmJiBwb3J0IDwgNjU1MzYpIHtcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MucG9ydCA9IHBvcnQ7XG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgIC8vIFx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1xuICAgIGNvbnN0IHRva2VuU2V0dGluZyA9IG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NTQyRlx1NTJBOFx1NEVFNFx1NzI0QycpXG4gICAgICAuc2V0RGVzYygnXHU2RDRGXHU4OUM4XHU1NjY4XHU2MjY5XHU1QzU1XHU5OTk2XHU2QjIxXHU4RkRFXHU2M0E1XHU5NzAwXHU3Qzk4XHU4RDM0XHU2QjY0XHU0RUU0XHU3MjRDXHUzMDAyXHU3MEI5XHU1MUZCXHU1OTBEXHU1MjM2XHU1NDBFXHU3Qzk4XHU4RDM0XHU1MjMwXHU2MjY5XHU1QzU1XHU1RjM5XHU3QTk3XHUzMDAyJyk7XG5cbiAgICB0b2tlblNldHRpbmcuYWRkVGV4dCgodGV4dCkgPT4ge1xuICAgICAgdGV4dFxuICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY1Rva2VuKVxuICAgICAgICAuc2V0RGlzYWJsZWQodHJ1ZSkgLy8gXHU1M0VBXHU4QkZCXHVGRjBDXHU5MDdGXHU1MTREXHU2MjRCXHU2NTM5XG4gICAgICAgIC5pbnB1dEVsLnN0eWxlLmZvbnRGYW1pbHkgPSAnbW9ub3NwYWNlJztcbiAgICB9KTtcblxuICAgIHRva2VuU2V0dGluZy5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgIGJ0blxuICAgICAgICAuc2V0QnV0dG9uVGV4dCgnXHU1OTBEXHU1MjM2JylcbiAgICAgICAgLnNldFRvb2x0aXAoJ1x1NTkwRFx1NTIzNlx1NEVFNFx1NzI0Q1x1NTIzMFx1NTI2QVx1OEQzNFx1Njc3RicpXG4gICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jVG9rZW4pO1xuICAgICAgICAgIG5ldyBOb3RpY2UoJ1x1MjcwNSBcdTRFRTRcdTcyNENcdTVERjJcdTU5MERcdTUyMzYnKTtcbiAgICAgICAgfSksXG4gICAgKTtcblxuICAgIHRva2VuU2V0dGluZy5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgIGJ0blxuICAgICAgICAuc2V0QnV0dG9uVGV4dCgnXHU5MUNEXHU3RjZFJylcbiAgICAgICAgLnNldFRvb2x0aXAoJ1x1NzUxRlx1NjIxMFx1NjVCMFx1NEVFNFx1NzI0Q1x1RkYwOFx1NjI2OVx1NUM1NVx1OTcwMFx1OTFDRFx1NjVCMFx1N0M5OFx1OEQzNFx1RkYwOScpXG4gICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jVG9rZW4gPSBnZW5lcmF0ZVN5bmNUb2tlbigpO1xuICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xuICAgICAgICAgIG5ldyBOb3RpY2UoJ1x1RDgzRFx1REQwNCBcdTRFRTRcdTcyNENcdTVERjJcdTkxQ0RcdTdGNkUnKTtcbiAgICAgICAgfSksXG4gICAgKTtcblxuICAgIC8vIFx1MjUwMFx1MjUwMCBsYXJrLWNsaSBcdTI1MDBcdTI1MDBcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdsYXJrLWNsaScgfSk7XG5cbiAgICBjb25zdCBsYXJrSW5mbyA9IGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDogYFx1NzJCNlx1NjAwMVx1RkYxQSR7dGhpcy5wbHVnaW4uc3RhdGUubGFya0NsaVJlc29sdmVkID8gJ1x1MjcwNSAnICsgdGhpcy5wbHVnaW4uc3RhdGUubGFya0NsaVZlcnNpb24gOiAnXHUyNzRDIFx1NjcyQVx1NjI3RVx1NTIzMCd9YCxcbiAgICAgIGNsczogJ3NldHRpbmctaXRlbS1kZXNjcmlwdGlvbicsXG4gICAgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdsYXJrLWNsaSBcdThERUZcdTVGODQnKVxuICAgICAgLnNldERlc2MoJ1x1NzU1OVx1N0E3QVx1NTIxOVx1ODFFQVx1NTJBOFx1NjNBMlx1NkQ0Qlx1MzAwMlx1NTk4Mlx1ODFFQVx1NTJBOFx1NjNBMlx1NkQ0Qlx1NTkzMVx1OEQyNVx1RkYwQ1x1OEJGN1x1NjI0Qlx1NTJBOFx1NTg2Qlx1NTE5OVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1MzAwMicpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5sYXJrQ2xpUGF0aClcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ1x1ODFFQVx1NTJBOFx1NjNBMlx1NkQ0QicpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MubGFya0NsaVBhdGggPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKVxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgICBidG5cbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dCgnXHU2RDRCXHU4QkQ1JylcbiAgICAgICAgICAuc2V0VG9vbHRpcCgnXHU5MUNEXHU2NUIwXHU2M0EyXHU2RDRCIGxhcmstY2xpJylcbiAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSByZXNvbHZlQ2xpKHRoaXMucGx1Z2luLnNldHRpbmdzLmxhcmtDbGlQYXRoIHx8IHVuZGVmaW5lZCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnN0YXRlLmxhcmtDbGlSZXNvbHZlZCA9IHJlc3VsdC5wYXRoO1xuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zdGF0ZS5sYXJrQ2xpVmVyc2lvbiA9IHJlc3VsdC52ZXJzaW9uO1xuICAgICAgICAgICAgICBsYXJrSW5mby5zZXRUZXh0KGBcdTcyQjZcdTYwMDFcdUZGMUFcdTI3MDUgJHtyZXN1bHQudmVyc2lvbn1gKTtcbiAgICAgICAgICAgICAgbmV3IE5vdGljZShgXHUyNzA1IFx1NjI3RVx1NTIzMCAke3Jlc3VsdC52ZXJzaW9ufWApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc3RhdGUubGFya0NsaVJlc29sdmVkID0gJyc7XG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnN0YXRlLmxhcmtDbGlWZXJzaW9uID0gJyc7XG4gICAgICAgICAgICAgIGxhcmtJbmZvLnNldFRleHQoJ1x1NzJCNlx1NjAwMVx1RkYxQVx1Mjc0QyBcdTY3MkFcdTYyN0VcdTUyMzAnKTtcbiAgICAgICAgICAgICAgbmV3IE5vdGljZSgnXHUyNzRDIFx1NjcyQVx1NjI3RVx1NTIzMCBsYXJrLWNsaVx1RkYwOFx1OTcwMCBcdTIyNjUgMS4wLjUyXHVGRjA5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwIFx1NTQwQ1x1NkI2NVx1ODg0Q1x1NEUzQSBcdTI1MDBcdTI1MDBcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdcdTU0MENcdTZCNjVcdTg4NENcdTRFM0EnIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU5RUQ4XHU4QkE0XHU4NDNEXHU1NzMwXHU3NkVFXHU1RjU1JylcbiAgICAgIC5zZXREZXNjKCdcdTYyNjlcdTVDNTVcdTY3MkFcdTYzMDdcdTVCOUFcdTc2RUVcdTVGNTVcdTY1RjZcdUZGMENcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjNcdTg0M0RcdTU3MzBcdTUyMzBcdTZCNjRcdTc2RUVcdTVGNTVcdUZGMDhcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHREaXIpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdERpciA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4MUVBXHU1MkE4XHU1MjA2XHU5MTREXHU3RjE2XHU3ODAxJylcbiAgICAgIC5zZXREZXNjKCdcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjNcdTg0M0RcdTU3MzBcdTU0MEVcdTgxRUFcdTUyQThcdTg5RTZcdTUzRDEgYXV0by1yZW5hbWUgXHU3RjE2XHU3ODAxXHU1MjA2XHU5MTREJylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9SZW5hbWUpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b1JlbmFtZSA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU1MjIwXHU5NjY0XHU4MUVBXHU1MkE4XHU3NjdCXHU4QkIwJylcbiAgICAgIC5zZXREZXNjKCdcdTRFQzVcdTc2N0JcdThCQjBcdTVGODVcdTc4NkVcdThCQTRcdTUyMjBcdTk2NjRcdUZGMUJcdTRFMERcdTRGMUFcdTgxRUFcdTUyQThcdTUyMjBcdTk2NjRcdTk4REVcdTRFNjZcdTgyODJcdTcwQjlcdUZGMENcdTlFRDhcdThCQTRcdTUxNzNcdTk1RUQnKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b0RlbGV0ZVJlZ2lzdHJ5KVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9EZWxldGVSZWdpc3RyeSA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU0RkREXHU3NTU5XHU4OEM1XHU5OTcwXHU1NkZFXHU3MjQ3JylcbiAgICAgIC5zZXREZXNjKCdcdTk4REVcdTRFNjZcdTYzOTJcdTcyNDhcdTcyNjlcdTY1OTlcdUZGMDgxMzVcdTdGMTZcdThGOTFcdTU2NjhcdTk4Q0VcdTY4M0NcdTdCNDlcdTdFQUZcdTU2RkVcdTcyNDdcdUZGMDlcdTY2MkZcdTU0MjZcdTg0M0RcdTU3MzBcdTUyMzAgT0InKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mua2VlcERlY29yYXRpdmVJbWFnZXMpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Mua2VlcERlY29yYXRpdmVJbWFnZXMgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1OTY5MFx1ODVDRlx1N0NGQlx1N0VERlx1NUM1RVx1NjAyNycpXG4gICAgICAuc2V0RGVzYygnXHU5NjkwXHU4NUNGIF9zeXNfIFx1NUYwMFx1NTkzNFx1NTQ4Q1x1NjVFN1x1NzI0OFx1OThERVx1NEU2Nlx1NTQwQ1x1NkI2NVx1NUI1N1x1NkJCNVx1RkYxQlx1NUI1N1x1NkJCNVx1NEVDRFx1NEZERFx1NzU1OVx1N0VEOVx1NTQwQ1x1NkI2NVx1OTAzQlx1OEY5MVx1NEY3Rlx1NzUyOCcpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5oaWRlU3lzdGVtUHJvcGVydGllcylcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5oaWRlU3lzdGVtUHJvcGVydGllcyA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5hcHBseVN5c3RlbVByb3BlcnRpZXNWaXNpYmlsaXR5KCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU1NkZFXHU3MjQ3XHU3RjEzXHU1QjU4XHU2RTA1XHU3NDA2XHU1NDY4XHU2NzFGJylcbiAgICAgIC5zZXREZXNjKCdmZWlzaHU6Ly90b2tlbiBcdTk4ODRcdTg5QzhcdTU2RkVcdTcyNDdcdTc2ODRcdTY3MkNcdTU3MzBcdTdGMTNcdTVCNThcdTRGRERcdTc1NTlcdTY1RjZcdTk1N0YnKVxuICAgICAgLmFkZERyb3Bkb3duKChkcm9wZG93bikgPT5cbiAgICAgICAgZHJvcGRvd25cbiAgICAgICAgICAuYWRkT3B0aW9uKCdkYWlseScsICdcdTZCQ0ZcdTU5MjknKVxuICAgICAgICAgIC5hZGRPcHRpb24oJ3dlZWtseScsICdcdTZCQ0ZcdTU0NjgnKVxuICAgICAgICAgIC5hZGRPcHRpb24oJ21vbnRobHknLCAnXHU2QkNGXHU2NzA4JylcbiAgICAgICAgICAuYWRkT3B0aW9uKCduZXZlcicsICdcdTZDMzhcdTRFMEQnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5jYWNoZUNsZWFudXApXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuY2FjaGVDbGVhbnVwID0gdmFsdWUgYXMgRmVpc2h1U3luY1NldHRpbmdzWydjYWNoZUNsZWFudXAnXTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgIC8vIFx1MjUwMFx1MjUwMCBcdTk4REVcdTRFNjZcdTc3RTVcdThCQzZcdTVFOTMgXHUyNTAwXHUyNTAwXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnXHU5OERFXHU0RTY2XHU3N0U1XHU4QkM2XHU1RTkzJyB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NzdFNVx1OEJDNlx1NUU5MyBzcGFjZV9pZCcpXG4gICAgICAuc2V0RGVzYygnXHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0XHU3NTI4XHUzMDAyXHU2NUIwXHU3N0U1XHU4QkM2XHU1RTkzXHU5RUQ4XHU4QkE0IDc2NTEzMTQxNTAwNjAwNjc4MDMnKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc3BhY2VJZClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zcGFjZUlkID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KSxcbiAgICAgIClcbiAgICAgIC5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgICAgYnRuXG4gICAgICAgICAgLnNldEJ1dHRvblRleHQoJ1x1NTIzN1x1NjVCMFx1NjYyMFx1NUMwNCcpXG4gICAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgYXdhaXQgcmVmcmVzaE1hcHBpbmcodGhpcy5hcHAsIHRoaXMucGx1Z2luLnNldHRpbmdzLnNwYWNlSWQpO1xuICAgICAgICAgIH0pLFxuICAgICAgKTtcbiAgfVxufVxuIiwgIi8qKlxuICogbGFyay1jbGkgXHU1QzAxXHU4OEM1XHU1QzQyXHUzMDAyXHU0RjlEXHU2MzZFIGByYy14L3NjcmlwdHMvcmNfZW52LnB5YCArIGAwM19cdTY4M0NcdTVGMEZcdTg5QzRcdTgzMDMubWRgIFx1MDBBN1x1NTM0MS9cdTUzNDFcdTRFMDBcdTMwMDJcbiAqXG4gKiAtIHJlc29sdmVDbGkoKVx1RkYxQVx1NTAxOVx1OTAwOVx1OERFRlx1NUY4NFx1NjNBMlx1NkQ0Qlx1RkYwQ1x1NzI0OFx1NjcyQ1x1NjgyMVx1OUE4QyBcdTIyNjUgMS4wLjUyXG4gKiAtIHJ1bigpXHVGRjFBXHU3RURGXHU0RTAwIHNwYXduU3luYyBcdTUzMDVcdTg4QzVcdUZGMENcdTkxQ0RcdThCRDVcdTMwMDFcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTMwMDFlbW9qaSBcdTZFMDVcdTZEMTdcdTMwMDF+XHU1M0NEXHU4RjZDXHU0RTQ5XHUzMDAxSlNPTiBcdTUzMDVcdTg4QzVcdTg5RTNcdTUzMDVcbiAqIC0gXHU2ODA3XHU5ODk4XHU0RkVFXHU1OTBEXHVGRjFBb3ZlcndyaXRlIFx1NTQwRVx1OEZGRFx1NTJBMCBzdHJfcmVwbGFjZSBcdTRGRUUgPHRpdGxlPlxuICpcbiAqIFx1NTkxQVx1OEJCRVx1NTkwN1x1OTAwMlx1OTE0RFx1NTE3M1x1OTUyRVx1NzBCOVx1RkYxQVxuICogLSBHVUkgXHU1NDJGXHU1MkE4XHU3Njg0IE9ic2lkaWFuIFx1NjJGRlx1NEUwRFx1NTIzMFx1N0VDOFx1N0FFRiBQQVRIXHVGRjA4bnZtL2hvbWVicmV3IFx1NEUwRFx1NTcyOFx1NTE4NVx1RkYwOVx1RkYwQ1x1NjU0NSBzcGF3biBcdTY1RjZcdTZDRThcdTUxNjVcdTU4OUVcdTVGM0EgUEFUSFxuICogLSBudm0gXHU3NkVFXHU1RjU1XHU2MzA5XHU2NTcwXHU1QjU3XHU1RThGXHU1M0Q2IGxhdGVzdFx1RkYwOFx1NUI1N1x1N0IyNlx1NEUzMiBzb3J0IFx1NEYxQVx1OEJBOSB2OSA+IHYxMFx1RkYwOVxuICovXG5pbXBvcnQgeyBleGVjRmlsZVN5bmMsIHR5cGUgRXhlY0ZpbGVTeW5jT3B0aW9uc1dpdGhTdHJpbmdFbmNvZGluZyB9IGZyb20gJ25vZGU6Y2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgKiBhcyBvcyBmcm9tICdub2RlOm9zJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHsgc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMsIHVuZXNjYXBlRmVpc2h1VGlsZGUgfSBmcm9tICdAc3luYy9zaGFyZWQnO1xuXG5jb25zdCBNSU5fVkVSU0lPTiA9IFsxLCAwLCA1Ml07XG5cbi8qKlxuICogXHU2Nzg0XHU5MDIwXHU1ODlFXHU1RjNBIFBBVEhcdUZGMUFcdTU3MjhcdThGREJcdTdBMEJcdTczQjBcdTY3MDkgUEFUSCBcdTUyNERcdThGRkRcdTUyQTAgbnZtL2xhdGVzdC9iaW4gKyBcdTVFMzhcdTg5QzFcdTVCODlcdTg4QzVcdTRGNERcdTMwMDJcbiAqIFx1NzUyOFx1NEU4RSBHVUkgXHU1NDJGXHU1MkE4XHU3Njg0IE9ic2lkaWFuXHVGRjA4UEFUSCBcdTdGM0EgbnZtL2hvbWVicmV3XHVGRjBDXHU1QkZDXHU4MUY0ICMhL3Vzci9iaW4vZW52IG5vZGUgXHU2MjdFXHU0RTBEXHU1MjMwIG5vZGVcdUZGMDlcdTMwMDJcbiAqL1xuZnVuY3Rpb24gYnVpbGRFbmhhbmNlZFBhdGgoKTogc3RyaW5nIHtcbiAgY29uc3QgZXh0cmE6IHN0cmluZ1tdID0gW107XG4gIC8vIG52bSBsYXRlc3Qgbm9kZSBcdTc2ODQgYmluXG4gIGNvbnN0IG52bUJhc2UgPSBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnLm52bS92ZXJzaW9ucy9ub2RlJyk7XG4gIHRyeSB7XG4gICAgY29uc3QgZGlycyA9IGZzLnJlYWRkaXJTeW5jKG52bUJhc2UpO1xuICAgIC8vIFx1NjU3MFx1NUI1N1x1NUU4Rlx1NTNENlx1NjcwMFx1NTkyN1x1NzI0OFx1NjcyQ1x1RkYwOHY5IHZzIHYxMCBcdTVCNTdcdTdCMjZcdTRFMzJcdTYzOTJcdTVFOEZcdTRGMUFcdTk1MTlcdUZGMDlcbiAgICBjb25zdCBsYXRlc3QgPSBkaXJzXG4gICAgICAubWFwKGQgPT4gKHsgbmFtZTogZCwgdmVyOiBwYXJzZUludChkLnJlcGxhY2UoL152LywgJycpLCAxMCkgfSkpXG4gICAgICAuZmlsdGVyKHggPT4gIU51bWJlci5pc05hTih4LnZlcikpXG4gICAgICAuc29ydCgoYSwgYikgPT4gYS52ZXIgLSBiLnZlcilcbiAgICAgIC5wb3AoKTtcbiAgICBpZiAobGF0ZXN0KSBleHRyYS5wdXNoKHBhdGguam9pbihudm1CYXNlLCBsYXRlc3QubmFtZSwgJ2JpbicpKTtcbiAgfSBjYXRjaCB7IC8qIG52bSBcdTY3MkFcdTg4QzUgKi8gfVxuICBleHRyYS5wdXNoKHBhdGguam9pbihvcy5ob21lZGlyKCksICcubG9jYWwnLCAnYmluJykpO1xuICBleHRyYS5wdXNoKCcvb3B0L2hvbWVicmV3L2JpbicpO1xuICBleHRyYS5wdXNoKCcvdXNyL2xvY2FsL2JpbicpO1xuICBjb25zdCBiYXNlID0gcHJvY2Vzcy5lbnYuUEFUSCA/PyAnJztcbiAgcmV0dXJuIFsuLi5leHRyYS5maWx0ZXIocCA9PiAhYmFzZS5zcGxpdChwYXRoLmRlbGltaXRlcikuaW5jbHVkZXMocCkpLCBiYXNlXS5qb2luKHBhdGguZGVsaW1pdGVyKTtcbn1cblxuLyoqIHJ1bigpIFx1NTE3MVx1NzUyOFx1NzY4NFx1NTg5RVx1NUYzQSBQQVRIXHVGRjA4XHU5OTk2XHU2QjIxXHU4OUUzXHU2NzkwXHU1NDBFXHU3RjEzXHU1QjU4XHVGRjA5XHUzMDAyICovXG5sZXQgZW5oYW5jZWRQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5sZXQgY2xpRW5hYmxlZCA9IHRydWU7XG5cbmZ1bmN0aW9uIGdldEVuaGFuY2VkUGF0aCgpOiBzdHJpbmcge1xuICByZXR1cm4gZW5oYW5jZWRQYXRoID8/PSBidWlsZEVuaGFuY2VkUGF0aCgpO1xufVxuXG4vKipcbiAqIFx1NTcyOFx1NTg5RVx1NUYzQSBQQVRIIFx1NEUwQlx1NjdFNVx1NjI3RVx1NTNFRlx1NjI2N1x1ODg0Q1x1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1RkYwOFx1NjZGRlx1NEVFMyBgd2hpY2hgXHVGRjBDXHU5MDdGXHU1MTREIEdVSSBcdThGREJcdTdBMEIgUEFUSCBcdTdGM0FcdTU5MzFcdUZGMDlcdTMwMDJcbiAqIFx1NzUyOCBleGVjRmlsZVN5bmMgXHU0RTBEXHU4RDcwIHNoZWxsXHVGRjBDXHU2NkY0XHU3QTMzXHUzMDAyXG4gKi9cbmZ1bmN0aW9uIHdoaWNoKGNtZDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIC8vIFx1NTE0OFx1OEJENVx1NUY1M1x1NTI0RCBQQVRIXHVGRjA4XHU3RUM4XHU3QUVGXHU1NzNBXHU2NjZGXHVGRjA5XG4gIHRyeSB7XG4gICAgY29uc3QgZm91bmQgPSBleGVjRmlsZVN5bmMoJy91c3IvYmluL3doaWNoJywgW2NtZF0sIHtcbiAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgICB0aW1lb3V0OiAzMDAwLFxuICAgICAgZW52OiB7IC4uLnByb2Nlc3MuZW52IH0sXG4gICAgfSkudHJpbSgpO1xuICAgIGlmIChmb3VuZCkgcmV0dXJuIGZvdW5kO1xuICB9IGNhdGNoIHsgLyogZmFsbCB0aHJvdWdoICovIH1cbiAgLy8gXHU1MThEXHU4QkQ1XHU1ODlFXHU1RjNBIFBBVEhcdUZGMDhHVUkgXHU1NzNBXHU2NjZGXHVGRjA5XG4gIHRyeSB7XG4gICAgY29uc3QgZm91bmQgPSBleGVjRmlsZVN5bmMoJy91c3IvYmluL3doaWNoJywgW2NtZF0sIHtcbiAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgICB0aW1lb3V0OiAzMDAwLFxuICAgICAgZW52OiB7IC4uLnByb2Nlc3MuZW52LCBQQVRIOiBnZXRFbmhhbmNlZFBhdGgoKSB9LFxuICAgIH0pLnRyaW0oKTtcbiAgICByZXR1cm4gZm91bmQgfHwgbnVsbDtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqIFx1NTAxOVx1OTAwOVx1OERFRlx1NUY4NFx1RkYwOFx1NzlGQlx1NjkwRCByY19lbnYucHkgcmVzb2x2ZV9jbGlcdUZGMDlcdTMwMDIgKi9cbmNvbnN0IENMSV9DQU5ESURBVEVTOiAoKCkgPT4gc3RyaW5nIHwgbnVsbClbXSA9IFtcbiAgKCkgPT4gcHJvY2Vzcy5lbnYuTEFSS19DTElfQklOID8/IG51bGwsXG4gICgpID0+IHdoaWNoKCdsYXJrc3VpdGUtY2xpJyksXG4gICgpID0+IHdoaWNoKCdsYXJrLWNsaScpLFxuICAoKSA9PiB7XG4gICAgY29uc3QgbnZtQmFzZSA9IHBhdGguam9pbihvcy5ob21lZGlyKCksICcubnZtL3ZlcnNpb25zL25vZGUnKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGlycyA9IGZzLnJlYWRkaXJTeW5jKG52bUJhc2UpO1xuICAgICAgLy8gXHU2NTcwXHU1QjU3XHU1RThGXHU1M0Q2XHU2NzAwXHU1OTI3XHU3MjQ4XHU2NzJDXHVGRjA4XHU1QjU3XHU3QjI2XHU0RTMyIHNvcnQgXHU0RjFBXHU4QkE5IHY5ID4gdjEwXHVGRjA5XG4gICAgICBjb25zdCBsYXRlc3QgPSBkaXJzXG4gICAgICAgIC5tYXAoZCA9PiAoeyBuYW1lOiBkLCB2ZXI6IHBhcnNlSW50KGQucmVwbGFjZSgvXnYvLCAnJyksIDEwKSB9KSlcbiAgICAgICAgLmZpbHRlcih4ID0+ICFOdW1iZXIuaXNOYU4oeC52ZXIpKVxuICAgICAgICAuc29ydCgoYSwgYikgPT4gYS52ZXIgLSBiLnZlcilcbiAgICAgICAgLnBvcCgpO1xuICAgICAgcmV0dXJuIGxhdGVzdCA/IHBhdGguam9pbihudm1CYXNlLCBsYXRlc3QubmFtZSwgJ2JpbicsICdsYXJrLWNsaScpIDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSxcbiAgKCkgPT4gcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJy5sb2NhbCcsICdiaW4nLCAnbGFyay1jbGknKSxcbiAgKCkgPT4gJy9vcHQvaG9tZWJyZXcvYmluL2xhcmstY2xpJyxcbiAgKCkgPT4gJy91c3IvbG9jYWwvYmluL2xhcmstY2xpJyxcbl07XG5cbi8qKlxuICogXHU2M0EyXHU2RDRCIGxhcmstY2xpIFx1OERFRlx1NUY4NFx1MzAwMlx1NEYxOFx1NTE0OFx1NzUyOFx1OEJCRVx1N0Y2RVx1ODk4Nlx1NzZENlx1RkYwQ1x1NTQyNlx1NTIxOVx1OEQ3MFx1NTAxOVx1OTAwOVx1OERFRlx1NUY4NFx1MzAwMlxuICogQHJldHVybnMgeyBwYXRoLCB2ZXJzaW9uIH0gXHU2MjE2IG51bGxcdUZGMDhcdTY3MkFcdTYyN0VcdTUyMzBcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVDbGkob3ZlcnJpZGVQYXRoPzogc3RyaW5nKTogeyBwYXRoOiBzdHJpbmc7IHZlcnNpb246IHN0cmluZyB9IHwgbnVsbCB7XG4gIGNvbnN0IGNhbmRpZGF0ZXMgPSBvdmVycmlkZVBhdGhcbiAgICA/IFsoKSA9PiBvdmVycmlkZVBhdGhdXG4gICAgOiBDTElfQ0FORElEQVRFUztcblxuICBmb3IgKGNvbnN0IGdldENsaSBvZiBjYW5kaWRhdGVzKSB7XG4gICAgY29uc3QgY2xpID0gZ2V0Q2xpKCk7XG4gICAgaWYgKCFjbGkpIGNvbnRpbnVlO1xuICAgIHRyeSB7XG4gICAgICAvLyBcdTc1MjggZXhlY0ZpbGVTeW5jIFx1NzZGNFx1NjNBNVx1OEREMSBjbGlcdUZGMENcdTZDRThcdTUxNjVcdTU4OUVcdTVGM0EgUEFUSFx1RkYwOFx1ODlFM1x1NTFCMyBHVUkgXHU4RkRCXHU3QTBCIGVudiBub2RlIFx1NjI3RVx1NEUwRFx1NTIzMFx1NzY4NFx1OTVFRVx1OTg5OFx1RkYwOVxuICAgICAgY29uc3QgdmVyID0gZXhlY0ZpbGVTeW5jKGNsaSwgWyctLXZlcnNpb24nXSwge1xuICAgICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgICAgICB0aW1lb3V0OiA1MDAwLFxuICAgICAgICBlbnY6IHsgLi4ucHJvY2Vzcy5lbnYsIFBBVEg6IGdldEVuaGFuY2VkUGF0aCgpIH0sXG4gICAgICB9KS50cmltKCk7XG4gICAgICAvLyBcdTg5RTNcdTY3OTAgXCJsYXJrLWNsaSB2ZXJzaW9uIDEuMC41MlwiXG4gICAgICBjb25zdCBtYXRjaCA9IHZlci5tYXRjaCgvKFxcZCspXFwuKFxcZCspXFwuKFxcZCspLyk7XG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgY29uc3QgbWFqb3IgPSBwYXJzZUludChtYXRjaFsxXSwgMTApO1xuICAgICAgICBjb25zdCBtaW5vciA9IHBhcnNlSW50KG1hdGNoWzJdLCAxMCk7XG4gICAgICAgIGNvbnN0IHBhdGNoID0gcGFyc2VJbnQobWF0Y2hbM10sIDEwKTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIG1ham9yID4gTUlOX1ZFUlNJT05bMF0gfHxcbiAgICAgICAgICAobWFqb3IgPT09IE1JTl9WRVJTSU9OWzBdICYmIG1pbm9yID4gTUlOX1ZFUlNJT05bMV0pIHx8XG4gICAgICAgICAgKG1ham9yID09PSBNSU5fVkVSU0lPTlswXSAmJiBtaW5vciA9PT0gTUlOX1ZFUlNJT05bMV0gJiYgcGF0Y2ggPj0gTUlOX1ZFUlNJT05bMl0pXG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVybiB7IHBhdGg6IGNsaSwgdmVyc2lvbjogdmVyIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIFx1NzI0OFx1NjcyQ1x1ODlFM1x1Njc5MFx1NTkzMVx1OEQyNVx1NEY0Nlx1NjcwOVx1OEY5M1x1NTFGQVx1RkYwQ1x1NEVDRFx1NTNFRlx1NzUyOFxuICAgICAgaWYgKHZlcikgcmV0dXJuIHsgcGF0aDogY2xpLCB2ZXJzaW9uOiB2ZXIgfTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqIHJ1bigpIFx1NjI2N1x1ODg0Q1x1OTAwOVx1OTg3OVx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBSdW5PcHRpb25zIHtcbiAgLyoqIFx1NURFNVx1NEY1Q1x1NzZFRVx1NUY1NVx1RkYwOC0tY29udGVudCBAZmlsZSBcdTc1MjhcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTY1RjZcdTk3MDBcdTg5ODFcdUZGMDlcdTMwMDIgKi9cbiAgY3dkPzogc3RyaW5nO1xuICAvKiogXHU2NzAwXHU1OTI3XHU5MUNEXHU4QkQ1XHU2QjIxXHU2NTcwXHVGRjA4XHU5RUQ4XHU4QkE0IDNcdUZGMDlcdTMwMDIgKi9cbiAgcmV0cmllcz86IG51bWJlcjtcbiAgLyoqIFx1OEQ4NVx1NjVGNiBtc1x1RkYwOFx1OUVEOFx1OEJBNCAzMHNcdUZGMDlcdTMwMDIgKi9cbiAgdGltZW91dD86IG51bWJlcjtcbiAgLyoqIFx1NjcxRlx1NjcxQiBKU09OIFx1OEY5M1x1NTFGQVx1NjVGNiB0cnVlXHVGRjBDXHU4MUVBXHU1MkE4XHU4REYzXHU4RkM3IFwiRm91bmQgWCBub2RlKHMpXCIgXHU1MjREXHU3RjAwXHUzMDAyICovXG4gIGpzb24/OiBib29sZWFuO1xuICAvKiogXHU1MzA1XHU1NDJCXHU5MUNEXHU4QkQ1XHU3QjQ5XHU1Rjg1XHU1NzI4XHU1MTg1XHU3Njg0XHU2MDNCXHU2MjJBXHU2QjYyXHU2NUY2XHU5NUY0XHUzMDAyICovXG4gIHRvdGFsVGltZW91dD86IG51bWJlcjtcbn1cblxuLyoqXG4gKiBcdTYyNjdcdTg4NEMgbGFyay1jbGkgXHU1NDdEXHU0RUU0XHUzMDAyXHU3RURGXHU0RTAwXHU1OTA0XHU3NDA2XHU1REYyXHU3N0U1XHU1NzUxXHUzMDAyXG4gKlxuICogQHBhcmFtIGFyZ3MgbGFyay1jbGkgXHU1QjUwXHU1NDdEXHU0RUU0XHU1M0MyXHU2NTcwXHU2NTcwXHU3RUM0XHVGRjBDXHU1OTgyIFsnZG9jcycsICcrZmV0Y2gnLCAnLS1kb2MnLCB0b2tlbiwgJy0tZG9jLWZvcm1hdCcsICdtYXJrZG93biddXG4gKiBAcGFyYW0gb3B0aW9ucyBcdTkwMDlcdTk4NzlcbiAqIEByZXR1cm5zIHN0ZG91dFx1RkYwOFx1NURGMlx1NkUwNVx1NkQxN1x1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gcnVuKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zOiBSdW5PcHRpb25zID0ge30pOiBzdHJpbmcge1xuICBpZiAoIWNsaUVuYWJsZWQpIHRocm93IE9iamVjdC5hc3NpZ24obmV3IEVycm9yKCdsYXJrLWNsaSBpcyBkaXNhYmxlZCBiZWNhdXNlIHRoZSBwbHVnaW4gaXMgdW5sb2FkaW5nJyksIHsgY29kZTogJ0NMSV9VTkxPQURJTkcnIH0pO1xuICBjb25zdCB7IGN3ZCwgcmV0cmllcyA9IDMsIHRpbWVvdXQgPSAzMDAwMCwgdG90YWxUaW1lb3V0ID0gdGltZW91dCAqIE1hdGgubWF4KDEsIHJldHJpZXMpLCBqc29uID0gZmFsc2UgfSA9IG9wdGlvbnM7XG4gIGNvbnN0IGNsaVBhdGggPSBwcm9jZXNzLmVudi5fX0xBUktfQ0xJX1BBVEhfXyB8fCAnbGFyay1jbGknO1xuICBjb25zdCBkZWFkbGluZSA9IERhdGUubm93KCkgKyBNYXRoLm1heCgxLCB0b3RhbFRpbWVvdXQpO1xuXG4gIGxldCBsYXN0RXJyb3I6IEVycm9yIHwgbnVsbCA9IG51bGw7XG5cbiAgZm9yIChsZXQgYXR0ZW1wdCA9IDE7IGF0dGVtcHQgPD0gcmV0cmllczsgYXR0ZW1wdCsrKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlbWFpbmluZyA9IGRlYWRsaW5lIC0gRGF0ZS5ub3coKTtcbiAgICAgIGlmIChyZW1haW5pbmcgPD0gMCkgdGhyb3cgT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoJ2xhcmstY2xpIHRvdGFsIGRlYWRsaW5lIGV4Y2VlZGVkJyksIHsgY29kZTogJ0NMSV9ERUFETElORScgfSk7XG4gICAgICBjb25zdCBmdWxsQXJncyA9IFsuLi5hcmdzXTtcbiAgICAgIGNvbnN0IGV4ZWNPcHRzOiBFeGVjRmlsZVN5bmNPcHRpb25zV2l0aFN0cmluZ0VuY29kaW5nID0ge1xuICAgICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgICAgICB0aW1lb3V0OiBNYXRoLm1pbih0aW1lb3V0LCByZW1haW5pbmcpLFxuICAgICAgICBtYXhCdWZmZXI6IDEwICogMTAyNCAqIDEwMjQsIC8vIDEwTUJcdUZGMDhcdTU5MjdcdTY1ODdcdTY4NjNcdUZGMDlcbiAgICAgICAgLy8gXHU2Q0U4XHU1MTY1XHU1ODlFXHU1RjNBIFBBVEhcdUZGMUFHVUkgXHU1NDJGXHU1MkE4XHU3Njg0IE9ic2lkaWFuIFx1NjJGRlx1NEUwRFx1NTIzMCBudm0vaG9tZWJyZXdcdUZGMENcdTVCRkNcdTgxRjRcbiAgICAgICAgLy8gYCMhL3Vzci9iaW4vZW52IG5vZGVgIFx1NjI3RVx1NEUwRFx1NTIzMCBub2RlXHVGRjA4Y2xpIFx1NjYyRiBub2RlIFx1ODExQVx1NjcyQ1x1RkYwOVxuICAgICAgICBlbnY6IHsgLi4ucHJvY2Vzcy5lbnYsIFBBVEg6IGdldEVuaGFuY2VkUGF0aCgpIH0sXG4gICAgICB9O1xuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgLS1jb250ZW50IEBmaWxlXHVGRjFBXHU3NTI4XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA4XHU1NzUxXHVGRjFBXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHU4OEFCXHU2MkQyXHVGRjA5XG4gICAgICBjb25zdCBjb250ZW50SWR4ID0gZnVsbEFyZ3MuaW5kZXhPZignLS1jb250ZW50Jyk7XG4gICAgICBpZiAoY29udGVudElkeCAhPT0gLTEgJiYgY29udGVudElkeCArIDEgPCBmdWxsQXJncy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgY29udGVudFZhbCA9IGZ1bGxBcmdzW2NvbnRlbnRJZHggKyAxXTtcbiAgICAgICAgaWYgKGNvbnRlbnRWYWwuc3RhcnRzV2l0aCgnQCcpKSB7XG4gICAgICAgICAgY29uc3QgZmlsZVBhdGggPSBjb250ZW50VmFsLnNsaWNlKDEpO1xuICAgICAgICAgIGNvbnN0IGRpciA9IGN3ZCB8fCBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpO1xuICAgICAgICAgIGNvbnN0IGJhc2VOYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlUGF0aCk7XG4gICAgICAgICAgZnVsbEFyZ3NbY29udGVudElkeCArIDFdID0gYEAuLyR7YmFzZU5hbWV9YDtcbiAgICAgICAgICBleGVjT3B0cy5jd2QgPSBkaXI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoY3dkKSB7XG4gICAgICAgIGV4ZWNPcHRzLmN3ZCA9IGN3ZDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1MTk5XHU1MTY1XHU1MjREIGVtb2ppIFx1NkUwNVx1NkQxN1x1RkYxQVx1NjI2Qlx1NjNDRiBmdWxsQXJncyBcdTRFMkQgLS1jb250ZW50IEBmaWxlIFx1NzY4NFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVxuICAgICAgaWYgKGNvbnRlbnRJZHggIT09IC0xICYmIGNvbnRlbnRJZHggKyAxIDwgZnVsbEFyZ3MubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZnVsbEFyZ3NbY29udGVudElkeCArIDFdLnJlcGxhY2UoL15AXFwuXFwvLywgJycpO1xuICAgICAgICBjb25zdCBleGVjdXRpb25EaXJlY3RvcnkgPSB0eXBlb2YgZXhlY09wdHMuY3dkID09PSAnc3RyaW5nJyA/IGV4ZWNPcHRzLmN3ZCA6IHByb2Nlc3MuY3dkKCk7XG4gICAgICAgIGNvbnN0IGZ1bGxGaWxlUGF0aCA9IHBhdGguam9pbihleGVjdXRpb25EaXJlY3RvcnksIGZpbGVQYXRoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsZXQgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmdWxsRmlsZVBhdGgsICd1dGY4Jyk7XG4gICAgICAgICAgY29udGVudCA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKGNvbnRlbnQpO1xuICAgICAgICAgIC8vIFx1NTNDRFx1OEY2Q1x1NEU0OSBcXH4gXHUyMTkyIH5cdUZGMDhcdTk4REVcdTRFNjZcdThCRkJcdTU2REVcdTY3NjVcdTY1RjZcdThGNkNcdTRFNDlcdTRFODZcdTZDRTJcdTZENkFcdTUzRjdcdUZGMDlcbiAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC9cXFxcfi9nLCAnficpO1xuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbEZpbGVQYXRoLCBjb250ZW50LCAndXRmOCcpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAvLyBcdTY1ODdcdTRFRjZcdThCRkJcdTRFMERcdTUyMzBcdTVDMzFcdThERjNcdThGQzdcdTZFMDVcdTZEMTdcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBcdTc1MjggZXhlY0ZpbGVTeW5jIFx1NzZGNFx1NjNBNVx1NjI2N1x1ODg0Q1x1RkYwQ1x1NEUwRFx1OEQ3MCBzaGVsbFx1RkYwOFx1NTNDMlx1NjU3MFx1NUI4OVx1NTE2OCArIFx1NTg5RVx1NUYzQSBQQVRIIFx1NzUxRlx1NjU0OFx1RkYwOVxuICAgICAgbGV0IHN0ZG91dCA9IGV4ZWNGaWxlU3luYyhjbGlQYXRoLCBmdWxsQXJncywgZXhlY09wdHMpO1xuXG4gICAgICAvLyBcdTU2REVcdThCRkJcdTU0MEVcdTUzQ0RcdThGNkNcdTRFNDlcdUZGMUFcdTk4REVcdTRFNjYgbWQgXHU2MjhBIH4gXHU4RjZDXHU0RTQ5XHU2MjEwIFxcflxuICAgICAgc3Rkb3V0ID0gdW5lc2NhcGVGZWlzaHVUaWxkZShzdGRvdXQpO1xuXG4gICAgICAvLyBcdTg5RTNcdTUzMDUgbGFyay1jbGkgXHU2ODA3XHU1MUM2IEpTT04gXHU1MzA1XHU4OEM1XHVGRjFBe29rLCBpZGVudGl0eSwgZGF0YTp7ZG9jdW1lbnQ6e2NvbnRlbnR9fX0gXHUyMTkyIFx1N0VBRlx1NkI2M1x1NjU4N1xuICAgICAgLy8gZG9jcyArZmV0Y2ggXHU5RUQ4XHU4QkE0IC0tZm9ybWF0IGpzb25cdUZGMENcdTZCNjNcdTY1ODdcdTVENENcdTU3MjggZGF0YS5kb2N1bWVudC5jb250ZW50IFx1OTFDQ1xuICAgICAgc3Rkb3V0ID0gdW53cmFwTGFya0VudmVsb3BlKHN0ZG91dCk7XG5cbiAgICAgIC8vIEpTT04gXHU2QTIxXHU1RjBGXHVGRjFBXHU4REYzXHU4RkM3IFwiRm91bmQgWCBub2RlKHMpXCIgXHU1MjREXHU3RjAwXHVGRjA4XHU1NzUxXHVGRjFBbm9kZS1saXN0IFx1OEY5M1x1NTFGQVx1NTQyQlx1NjVFNVx1NUZEN1x1ODg0Q1x1RkYwOVxuICAgICAgaWYgKGpzb24pIHtcbiAgICAgICAgY29uc3QgYnJhY2VJZHggPSBzdGRvdXQuaW5kZXhPZigneycpO1xuICAgICAgICBpZiAoYnJhY2VJZHggIT09IC0xKSB7XG4gICAgICAgICAgc3Rkb3V0ID0gc3Rkb3V0LnNsaWNlKGJyYWNlSWR4KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3Rkb3V0LnRyaW0oKTtcbiAgICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcbiAgICAgIGxhc3RFcnJvciA9IGVyciBhcyBFcnJvcjtcbiAgICAgIGNvbnN0IGVyck1zZyA9IChlcnIgYXMgRXJyb3IpPy5tZXNzYWdlID8/IFN0cmluZyhlcnIpO1xuXG4gICAgICAvLyA0MjkgXHU5NjUwXHU2RDQxXHU2MjE2XHU3RjUxXHU3RURDXHU5NTE5XHU4QkVGXHVGRjFBXHU5MUNEXHU4QkQ1XHVGRjA4XHU2MzA3XHU2NTcwXHU5MDAwXHU5MDdGXHVGRjA5XG4gICAgICBpZiAoaXNSZXRyeWFibGVDbGlGYWlsdXJlKGVyck1zZykpIHtcbiAgICAgICAgY29uc3QgcmVtYWluaW5nID0gZGVhZGxpbmUgLSBEYXRlLm5vdygpO1xuICAgICAgICBjb25zdCBkZWxheSA9IE1hdGgubWluKDEwMDAgKiBNYXRoLnBvdygyLCBhdHRlbXB0IC0gMSksIDEwMDAwLCBNYXRoLm1heCgwLCByZW1haW5pbmcpKTtcbiAgICAgICAgaWYgKGF0dGVtcHQgPj0gcmV0cmllcyB8fCBkZWxheSA8PSAwKSBicmVhaztcbiAgICAgICAgY29uc29sZS53YXJuKGBbc3luYy9sYXJrXSBhdHRlbXB0ICR7YXR0ZW1wdH0gZmFpbGVkLCByZXRyeWluZyBpbiAke2RlbGF5fW1zOiAke2Vyck1zZ31gKTtcbiAgICAgICAgLy8gXHU0RTBEXHU0RjlEXHU4RDU2IHNoZWxsIFx1NzY4NCBzbGVlcFx1RkYwOEF0b21pY3Mud2FpdCBcdTU0MENcdTZCNjVcdTk2M0JcdTU4NUVcdUZGMDlcbiAgICAgICAgY29uc3QgbXMgPSBkZWxheTtcbiAgICAgICAgY29uc3QgYnVmID0gbmV3IEludDMyQXJyYXkobmV3IFNoYXJlZEFycmF5QnVmZmVyKDQpKTtcbiAgICAgICAgQXRvbWljcy53YWl0KGJ1ZiwgMCwgMCwgbXMpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU5NTE5XHU4QkVGXHU3NkY0XHU2M0E1XHU2MjlCXG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB0aHJvdyBsYXN0RXJyb3IgPz8gbmV3IEVycm9yKCdsYXJrLWNsaSBydW4gZmFpbGVkIHdpdGggdW5rbm93biBlcnJvcicpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzYWJsZUNsaSgpOiB2b2lkIHtcbiAgY2xpRW5hYmxlZCA9IGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5hYmxlQ2xpKCk6IHZvaWQge1xuICBjbGlFbmFibGVkID0gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmV0cnlhYmxlQ2xpRmFpbHVyZShtZXNzYWdlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIG1lc3NhZ2UuaW5jbHVkZXMoJzQyOScpXG4gICAgfHwgbWVzc2FnZS5pbmNsdWRlcygnRVRJTUVET1VUJylcbiAgICB8fCBtZXNzYWdlLmluY2x1ZGVzKCdFQ09OTlJFU0VUJylcbiAgICB8fCBtZXNzYWdlLmluY2x1ZGVzKCdzb2NrZXQgaGFuZyB1cCcpO1xufVxuXG4vKipcbiAqIFx1ODlFM1x1NTMwNSBsYXJrLWNsaSBcdTY4MDdcdTUxQzYgSlNPTiBcdTUzMDVcdTg4QzVcdTMwMDJcbiAqXG4gKiBsYXJrLWNsaSBcdTc2ODQgZG9jcyArZmV0Y2ggXHU3QjQ5XHU1NDdEXHU0RUU0XHU5RUQ4XHU4QkE0IGAtLWZvcm1hdCBqc29uYFx1RkYwQ1x1OEZENFx1NTZERVx1RkYxQVxuICogICB7IFwib2tcIjogdHJ1ZSwgXCJpZGVudGl0eVwiOiBcIi4uLlwiLCBcImRhdGFcIjogeyBcImRvY3VtZW50XCI6IHsgXCJjb250ZW50XCI6IFwiPFx1NzcxRlx1NUI5RVx1NkI2M1x1NjU4Nz5cIiB9IH0sIC4uLiB9XG4gKiBcdTU0MENcdTZCNjVcdTk0RkVcdThERUZcdTk3MDBcdTg5ODFcdTc2ODRcdTY2MkZcdTdFQUZcdTZCNjNcdTY1ODdcdUZGMDhtYXJrZG93bi94bWxcdUZGMDlcdUZGMENcdTRFMERcdTY2MkZcdTY1NzRcdTRFMkEgZW52ZWxvcGVcdTMwMDJcbiAqXG4gKiBcdTUyMjRcdTVCOUFcdUZGMUFzdGRvdXQgXHU5OTk2XHU0RTJBXHU5NzVFXHU3QTdBXHU3NjdEXHU1QjU3XHU3QjI2XHU2NjJGIGB7YFx1RkYwQ1x1NEUxNFx1ODlFM1x1Njc5MFx1NTQwRVx1NTQyQiBvayBcdTVCNTdcdTZCQjUgKyBkYXRhLmRvY3VtZW50LmNvbnRlbnRcdUZGMENcbiAqIFx1NjI0RFx1OEJBNFx1NEUzQVx1NjYyRiBlbnZlbG9wZSBcdTVFNzZcdTg5RTNcdTUzMDVcdUZGMUJcdTU0MjZcdTUyMTlcdTUzOUZcdTY4MzdcdThGRDRcdTU2REVcdUZGMDhcdTRGRERcdTc1NTkgd2lraSArbm9kZS1saXN0IFx1N0I0OVx1N0VBRiBKU09OIFx1NTRDRFx1NUU5NFx1N0VEOSBqc29uIFx1NkEyMVx1NUYwRlx1NTkwNFx1NzQwNlx1RkYwOVx1MzAwMlxuICovXG5mdW5jdGlvbiB1bndyYXBMYXJrRW52ZWxvcGUoc3Rkb3V0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCB0cmltbWVkID0gc3Rkb3V0LnRyaW1TdGFydCgpO1xuICBpZiAoIXRyaW1tZWQuc3RhcnRzV2l0aCgneycpKSByZXR1cm4gc3Rkb3V0O1xuICBsZXQgcGFyc2VkOiB1bmtub3duO1xuICB0cnkge1xuICAgIHBhcnNlZCA9IEpTT04ucGFyc2UodHJpbW1lZCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBzdGRvdXQ7IC8vIFx1NEUwRFx1NjYyRlx1NTQwOFx1NkNENSBKU09OXHVGRjBDXHU1MzlGXHU2ODM3XHU4RkQ0XHU1NkRFXG4gIH1cbiAgY29uc3QgZW52ID0gcGFyc2VkIGFzIHsgb2s/OiB1bmtub3duOyBkYXRhPzogeyBkb2N1bWVudD86IHsgY29udGVudD86IHVua25vd24gfSB9IH07XG4gIC8vIFx1NEVDNVx1NUY1M1x1NjYyRlx1NTQyQiBkb2N1bWVudC5jb250ZW50IFx1NzY4NFx1NjgwN1x1NTFDNiBlbnZlbG9wZSBcdTYyNERcdTg5RTNcdTUzMDVcbiAgaWYgKGVudiAmJiB0eXBlb2YgZW52Lm9rID09PSAnYm9vbGVhbicgJiYgZW52LmRhdGE/LmRvY3VtZW50Py5jb250ZW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBjb250ZW50ID0gZW52LmRhdGEuZG9jdW1lbnQuY29udGVudDtcbiAgICByZXR1cm4gdHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnID8gY29udGVudCA6IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQpO1xuICB9XG4gIHJldHVybiBzdGRvdXQ7XG59XG5cbi8qKlxuICogXHU1NkRFXHU1MTk5XHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzXHVGRjA4bWFya2Rvd24gb3ZlcndyaXRlICsgXHU2ODA3XHU5ODk4XHU0RkVFXHU1OTBEXHVGRjA5XHUzMDAyXG4gKiBcdTRGOURcdTYzNkVcdTVERjJcdTc3RTVcdTU3NTFcdUZGMUFvdmVyd3JpdGUgXHU1NDBFXHU2ODA3XHU5ODk4XHU1M0Q4IFVudGl0bGVkIFx1MjE5MiBcdThGRkRcdTUyQTAgc3RyX3JlcGxhY2UgXHU0RkVFIDx0aXRsZT5cdTMwMDJcbiAqXG4gKiBAcGFyYW0gdG9rZW4gZG9jeCBvYmpfdG9rZW4gXHU2MjE2IG5vZGVfdG9rZW5cbiAqIEBwYXJhbSBjb250ZW50IFx1NkI2M1x1NjU4NyBtYXJrZG93blx1RkYwOFx1NEUwRFx1NTQyQiBmcm9udG1hdHRlclx1RkYwOVxuICogQHBhcmFtIHRpdGxlIFx1NjU4N1x1Njg2M1x1NjgwN1x1OTg5OFx1RkYwOFx1NUUyNiBlbW9qaVx1RkYwOVxuICogQHBhcmFtIGN3ZCBcdTVERTVcdTRGNUNcdTc2RUVcdTVGNTVcdUZGMDhcdTc1MjhcdTRFOEUgQGZpbGUgXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvdmVyd3JpdGVEb2ModG9rZW46IHN0cmluZywgY29udGVudDogc3RyaW5nLCB0aXRsZTogc3RyaW5nLCBfY3dkPzogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IHRtcERpciA9IGZzLm1rZHRlbXBTeW5jKHBhdGguam9pbihvcy50bXBkaXIoKSwgJ2tub3dmbG93LXdyaXRlLScpKTtcbiAgY29uc3QgdG1wRmlsZSA9IHBhdGguam9pbih0bXBEaXIsICdjb250ZW50Lm1kJyk7XG5cbiAgLy8gXHU2RTA1XHU2RDE3XHVGRjFBc3RyaXAgZW1vamkgVlMgKyBcdTUzQ0RcdThGNkNcdTRFNDkgXFx+XG4gIGNvbnN0IGNsZWFuZWQgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhjb250ZW50KTtcblxuICBmcy53cml0ZUZpbGVTeW5jKHRtcEZpbGUsIGNsZWFuZWQsICd1dGY4Jyk7XG5cbiAgdHJ5IHtcbiAgICAvLyBvdmVyd3JpdGVcbiAgICBydW4oWydkb2NzJywgJyt1cGRhdGUnLCAnLS1kb2MnLCB0b2tlbiwgJy0tY29tbWFuZCcsICdvdmVyd3JpdGUnLCAnLS1kb2MtZm9ybWF0JywgJ21hcmtkb3duJywgJy0tY29udGVudCcsICdALi9jb250ZW50Lm1kJ10sIHsgY3dkOiB0bXBEaXIgfSk7XG5cbiAgICAvLyBcdTY4MDdcdTk4OThcdTRGRUVcdTU5MERcdUZGMUFzdHJfcmVwbGFjZSBcdTRGRUUgPHRpdGxlPlxuICAgIGNvbnN0IGNsZWFuVGl0bGUgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyh0aXRsZSk7XG4gICAgcnVuKFtcbiAgICAgICdkb2NzJywgJyt1cGRhdGUnLCAnLS1kb2MnLCB0b2tlbixcbiAgICAgICctLWNvbW1hbmQnLCAnc3RyX3JlcGxhY2UnLFxuICAgICAgJy0tZG9jLWZvcm1hdCcsICdqc29uJyxcbiAgICAgICctLWNvbnRlbnQnLCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHJlcXVlc3Q6IFt7XG4gICAgICAgICAgYmxvY2tfdHlwZTogMSwgLy8gcGFnZVxuICAgICAgICAgIHBhZ2U6IHtcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbe1xuICAgICAgICAgICAgICB0ZXh0X3J1bjogeyBjb250ZW50OiBjbGVhblRpdGxlLCB0ZXh0X2VsZW1lbnRfc3R5bGU6IHsgYm9sZDogdHJ1ZSB9IH1cbiAgICAgICAgICAgIH1dXG4gICAgICAgICAgfVxuICAgICAgICB9XSxcbiAgICAgICAgaW5kZXg6IDAsXG4gICAgICB9KSxcbiAgICBdLCB7IGN3ZDogdG1wRGlyLCB0aW1lb3V0OiAxNTAwMCB9KTtcbiAgfSBmaW5hbGx5IHtcbiAgICAvLyBcdTZFMDVcdTc0MDZcdTRFMzRcdTY1RjZcdTY1ODdcdTRFRjZcbiAgICB0cnkgeyBmcy5ybVN5bmModG1wRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSwgZm9yY2U6IHRydWUgfSk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxuICB9XG59XG5cbi8qKlxuICogXHU1NkRFXHU1MTk5XHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzXHVGRjA4WE1MIFx1NjgzQ1x1NUYwRlx1RkYwQ1x1NTQyQiBjYWxsb3V0IFx1N0NCRVx1Nzg2RVx1NjNBN1x1NTIzNlx1RkYwOVx1MzAwMlxuICogXHU1NDBDXHU2ODM3XHU5NzAwXHU4OTgxXHU2ODA3XHU5ODk4XHU0RkVFXHU1OTBEXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvdmVyd3JpdGVEb2NYbWwodG9rZW46IHN0cmluZywgeG1sQ29udGVudDogc3RyaW5nLCB0aXRsZTogc3RyaW5nLCBfY3dkPzogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IHRtcERpciA9IGZzLm1rZHRlbXBTeW5jKHBhdGguam9pbihvcy50bXBkaXIoKSwgJ2tub3dmbG93LXdyaXRlLScpKTtcbiAgY29uc3QgdG1wRmlsZSA9IHBhdGguam9pbih0bXBEaXIsICdjb250ZW50LnhtbCcpO1xuXG4gIGNvbnN0IGNsZWFuZWQgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyh4bWxDb250ZW50KTtcbiAgZnMud3JpdGVGaWxlU3luYyh0bXBGaWxlLCBjbGVhbmVkLCAndXRmOCcpO1xuXG4gIHRyeSB7XG4gICAgcnVuKFsnZG9jcycsICcrdXBkYXRlJywgJy0tZG9jJywgdG9rZW4sICctLWNvbW1hbmQnLCAnb3ZlcndyaXRlJywgJy0tZG9jLWZvcm1hdCcsICd4bWwnLCAnLS1jb250ZW50JywgJ0AuL2NvbnRlbnQueG1sJ10sIHsgY3dkOiB0bXBEaXIgfSk7XG5cbiAgICAvLyBcdTY4MDdcdTk4OThcdTRGRUVcdTU5MERcbiAgICBjb25zdCBjbGVhblRpdGxlID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnModGl0bGUpO1xuICAgIHJ1bihbXG4gICAgICAnZG9jcycsICcrdXBkYXRlJywgJy0tZG9jJywgdG9rZW4sXG4gICAgICAnLS1jb21tYW5kJywgJ3N0cl9yZXBsYWNlJyxcbiAgICAgICctLWRvYy1mb3JtYXQnLCAnanNvbicsXG4gICAgICAnLS1jb250ZW50JywgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICByZXF1ZXN0OiBbe1xuICAgICAgICAgIGJsb2NrX3R5cGU6IDEsXG4gICAgICAgICAgcGFnZToge1xuICAgICAgICAgICAgZWxlbWVudHM6IFt7XG4gICAgICAgICAgICAgIHRleHRfcnVuOiB7IGNvbnRlbnQ6IGNsZWFuVGl0bGUsIHRleHRfZWxlbWVudF9zdHlsZTogeyBib2xkOiB0cnVlIH0gfVxuICAgICAgICAgICAgfV1cbiAgICAgICAgICB9XG4gICAgICAgIH1dLFxuICAgICAgICBpbmRleDogMCxcbiAgICAgIH0pLFxuICAgIF0sIHsgY3dkOiB0bXBEaXIsIHRpbWVvdXQ6IDE1MDAwIH0pO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7IGZzLnJtU3luYyh0bXBEaXIsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTsgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG4gIH1cbn1cblxuLyoqXG4gKiBcdTRFQ0VcdTk4REVcdTRFNjYgd2lraSBVUkwgXHU4OUUzXHU2NzkwIG5vZGVfdG9rZW5cdTMwMDJcbiAqIFVSTCBcdTVGNjJcdTU5ODJcdUZGMUFodHRwczovL3h4eC5mZWlzaHUuY24vd2lraS9OT0RFX1RPS0VOXHUzMDAxL2RvY3gvT0JKX1RPS0VOIFx1NjIxNiAvZG9jL09CSl9UT0tFTlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZU5vZGVUb2tlbkZyb21VcmwodXJsOiBzdHJpbmcpOiB7IG5vZGVfdG9rZW4/OiBzdHJpbmc7IG9ial90b2tlbj86IHN0cmluZyB9IHtcbiAgLy8gd2lraSBub2RlXG4gIGNvbnN0IHdpa2lNYXRjaCA9IHVybC5tYXRjaCgvXFwvd2lraVxcLyhbQS1aYS16MC05XSspLyk7XG4gIGlmICh3aWtpTWF0Y2gpIHJldHVybiB7IG5vZGVfdG9rZW46IHdpa2lNYXRjaFsxXSB9O1xuXG4gIC8vIGRvY3ggb2JqXG4gIGNvbnN0IGRvY3hNYXRjaCA9IHVybC5tYXRjaCgvXFwvZG9jeFxcLyhbQS1aYS16MC05XSspLyk7XG4gIGlmIChkb2N4TWF0Y2gpIHJldHVybiB7IG9ial90b2tlbjogZG9jeE1hdGNoWzFdIH07XG5cbiAgcmV0dXJuIHt9O1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENiB3aWtpIFx1ODI4Mlx1NzBCOVx1NzY4NCBkb2N4IG9ial90b2tlblx1MzAwMlxuICogYHdpa2kgK25vZGUtZ2V0IC0tbm9kZS10b2tlbiA8dXJsPiAtLXNwYWNlLWlkIDxpZD5gXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRXaWtpTm9kZUluZm8obm9kZVRva2VuOiBzdHJpbmcsIHNwYWNlSWQ6IHN0cmluZyk6IHsgb2JqX3Rva2VuOiBzdHJpbmc7IHRpdGxlOiBzdHJpbmcgfSB8IG51bGwge1xuICB0cnkge1xuICAgIGNvbnN0IG91dHB1dCA9IHJ1bihbXG4gICAgICAnd2lraScsICcrbm9kZS1nZXQnLFxuICAgICAgJy0tbm9kZS10b2tlbicsIG5vZGVUb2tlbixcbiAgICAgICctLXNwYWNlLWlkJywgc3BhY2VJZCxcbiAgICBdLCB7IGpzb246IHRydWUgfSk7XG4gICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2Uob3V0cHV0KTtcbiAgICAvLyBcdTgyODJcdTcwQjlcdTUzRUZcdTgwRkRcdTY3MDkgbm9kZSBcdTYyMTZcdTc2RjRcdTYzQTVcdTY2MkYgb2JqX3Rva2VuXG4gICAgY29uc3Qgb2JqVG9rZW4gPSBkYXRhPy5ub2RlPy5vYmpfdG9rZW4gPz8gZGF0YT8ub2JqX3Rva2VuID8/IGRhdGE/Lm9ial90b2tlbjtcbiAgICBjb25zdCB0aXRsZSA9IGRhdGE/Lm5vZGU/LnRpdGxlID8/IGRhdGE/LnRpdGxlID8/ICcnO1xuICAgIGlmIChvYmpUb2tlbikgcmV0dXJuIHsgb2JqX3Rva2VuOiBvYmpUb2tlbiwgdGl0bGUgfTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS53YXJuKCdbc3luYy9sYXJrXSB3aWtpICtub2RlLWdldCBmYWlsZWQ6JywgZXJyKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1OThERVx1NEU2Nlx1NzdFNVx1OEJDNlx1NUU5M1x1NUI1MFx1ODI4Mlx1NzBCOVx1NTIxN1x1ODg2OFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGlzdFdpa2lDaGlsZHJlbihzcGFjZUlkOiBzdHJpbmcsIHBhcmVudFRva2VuOiBzdHJpbmcpOiBBcnJheTx7IG5vZGVfdG9rZW46IHN0cmluZzsgdGl0bGU6IHN0cmluZzsgb2JqX3Rva2VuOiBzdHJpbmcgfT4ge1xuICB0cnkge1xuICAgIGNvbnN0IG91dHB1dCA9IHJ1bihbXG4gICAgICAnd2lraScsICcrbm9kZS1saXN0JyxcbiAgICAgICctLXNwYWNlLWlkJywgc3BhY2VJZCxcbiAgICAgICctLXBhcmVudC1ub2RlLXRva2VuJywgcGFyZW50VG9rZW4sXG4gICAgXSwgeyBqc29uOiB0cnVlIH0pO1xuICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKG91dHB1dCk7XG4gICAgY29uc3QgaXRlbXMgPSBkYXRhPy5pdGVtcyA/PyBkYXRhPy5ub2RlcyA/PyBbXTtcbiAgICByZXR1cm4gaXRlbXMubWFwKChuOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gKHtcbiAgICAgIG5vZGVfdG9rZW46IG4ubm9kZV90b2tlbiA/PyAnJyxcbiAgICAgIHRpdGxlOiBuLnRpdGxlID8/ICcnLFxuICAgICAgb2JqX3Rva2VuOiBuLm9ial90b2tlbiA/PyAnJyxcbiAgICB9KSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUud2FybignW3N5bmMvbGFya10gd2lraSArbm9kZS1saXN0IGZhaWxlZDonLCBlcnIpO1xuICAgIHJldHVybiBbXTtcbiAgfVxufVxuIiwgIi8qKlxuICogXHU1NDBDXHU2QjY1XHU3RUQxXHU1QjlBICsgWUFNTCBmcm9udG1hdHRlciBcdTY1NzBcdTYzNkVcdTZBMjFcdTU3OEJcdTMwMDJcbiAqXG4gKiBcdTRGOURcdTYzNkVcdUZGMUFgXHU4QkJFXHU4QkExXHU2NUI5XHU2ODQ4LzAyX1lBTUxcdTVCNTdcdTZCQjVcdTg5QzRcdTgzMDMubWRgXHVGRjA4XHU2NzQzXHU1QTAxIHYxXHVGRjA5KyBgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTc1LjFcdTMwMDJcbiAqIFx1OTRDMVx1NUY4Qlx1RkYxQVx1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QVx1N0VDNFx1RkYwOGZlaXNodV8qXHVGRjA5XHU3NTMxXHU2M0QyXHU0RUY2XHU4MUVBXHU1MkE4XHU1MTk5XHVGRjBDXHU3NTI4XHU2MjM3XHU0RTBEXHU1M0VGXHU2MjRCXHU2NTM5XHUzMDAyXG4gKi9cblxuLyoqIFx1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QVx1N0VDNFx1RkYwOFx1NjgzOFx1NUZDM1x1RkYwQ1x1NEUwRFx1NTNFRlx1NjI0Qlx1NjUzOVx1RkYwOVx1MzAwMlx1NUJGOVx1NUU5NCBZQU1MIFx1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QVx1NkJCNVx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBTeW5jQmluZGluZyB7XG4gIC8qKiBcdTk4REVcdTRFNjYgd2lraSBub2RlX3Rva2VuXHVGRjA4XHU1NTJGXHU0RTAwXHU3RUQxXHU1QjlBXHVGRjA5XHUzMDAyICovXG4gIGZlaXNodV9pZDogc3RyaW5nO1xuICAvKiogXHU5OERFXHU0RTY2IGRvY3ggb2JqX3Rva2VuXHVGRjA4XHU1NkRFXHU1MTk5XHU3NTI4XHVGRjA5XHUzMDAyICovXG4gIGZlaXNodV9kb2NfaWQ6IHN0cmluZztcbiAgLyoqIFx1OThERVx1NEU2Nlx1NTM5Rlx1NTlDQlx1NjgwN1x1OTg5OFx1RkYwOFx1NTQyQiBlbW9qaVx1RkYwQ1x1NTZERVx1NTE5OVx1NjVGNlx1NzUyOFx1RkYwOVx1MzAwMiAqL1xuICBmZWlzaHVfdGl0bGU6IHN0cmluZztcbiAgLyoqIFx1NEUwQVx1NkIyMVx1NTQwQ1x1NkI2NVx1NTE4NVx1NUJCOSBoYXNoXHVGRjA4XHU4RjdCXHU2ODM4XHU5QThDXHU3NTI4XHVGRjBDc2hhMjU2IGhleFx1RkYwOVx1MzAwMiAqL1xuICBzeW5jX2hhc2g/OiBzdHJpbmc7XG4gIC8qKiBcdTRFMEFcdTZCMjFcdTU0MENcdTZCNjVcdTY1RjZcdTk1RjRcdUZGMDhJU084NjAxXHVGRjBDXHU1RTI2XHU2NUY2XHU1MzNBXHVGRjA5XHUzMDAyICovXG4gIHN5bmNfdGltZT86IHN0cmluZztcbn1cblxuLyoqIFx1NjgwN1x1N0I3RVx1NUMwMVx1OTVFRFx1Njc5QVx1NEUzRVx1MzAwMlx1NEY5RFx1NjM2RSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3Mi4yXHUzMDAyICovXG5leHBvcnQgdHlwZSBUYWcgPSAnUycgfCAnWCcgfCAnTCcgfCAnWicgfCAnUScgfCAnSic7XG5cbmV4cG9ydCBjb25zdCBUQUdfTkFNRVM6IFJlY29yZDxUYWcsIHN0cmluZz4gPSB7XG4gIFM6ICdcdUQ4M0RcdURDRTVcdTY1MzZcdTk2QzYnLFxuICBYOiAnXHVEODNDXHVERkFGXHU5ODc5XHU3NkVFJyxcbiAgTDogJ1x1RDgzQ1x1REYzM1x1OTg4Nlx1NTdERicsXG4gIFo6ICdcdUQ4M0RcdURDREFcdThENDRcdTZFOTAnLFxuICBROiAnXHVEODNEXHVEQ0ExXHU3MDc1XHU2MTFGJyxcbiAgSjogJ1x1RDgzRFx1REVFMFx1RkUwRlx1NjI4MFx1ODBGRCcsXG59O1xuXG4vKiogXHU3N0U1XHU4QkM2XHU1RTkzXHU1MTQzXHU2NTcwXHU2MzZFXHVGRjA4T0IgXHU3RUY0XHU2MkE0XHVGRjBDXHU1NkRFXHU1MTk5XHU5OERFXHU0RTY2XHU2MjEwIGNhbGxvdXRcdUZGMDlcdTMwMDJcdTRGOURcdTYzNkUgYDAyX1lBTUxcdTVCNTdcdTZCQjVcdTg5QzRcdTgzMDMubWRgXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIEtub3dsZWRnZU1ldGEge1xuICAvKiogXHU2ODA3XHU3QjdFXHVGRjBDXHU1QzAxXHU5NUVEXHU2NzlBXHU0RTNFXHUzMDAyXHU3RjZFXHU0RkUxXHU1RUE2IDwwLjYgXHUyMTkyIFNcdTMwMDIgKi9cbiAgXHU2ODA3XHU3QjdFPzogVGFnO1xuICAvKiogXHU3RjE2XHU3ODAxXHVGRjBDYXV0by1yZW5hbWUgXHU1MjA2XHU5MTREXHVGRjBDXHU2ODNDXHU1RjBGIFlZX01NRERfXHU2ODA3XHU3QjdFX1x1NUU4Rlx1NTNGN1tfXHU1QjUwXHU1RThGXHU1M0Y3XVx1MzAwMiAqL1xuICBcdTdGMTZcdTc4MDE/OiBzdHJpbmc7XG4gIC8qKiBcdThGOTNcdTUxNjVcdTVCOENcdTY1NzRcdThERUZcdTVGODRcdUZGMDhcdTY3MDBcdTZERjFcdTZDRThcdTUxOENcdThERUZcdTVGODRcdUZGMDlcdTMwMDIgKi9cbiAgXHU4RjkzXHU1MTY1Pzogc3RyaW5nO1xuICAvKiogXHU2NUU1XHU2NzFGXHVGRjBDSVNPIFx1NjgzQ1x1NUYwRiBZWVlZLU1NLUREXHUzMDAyICovXG4gIFx1NjVFNVx1NjcxRj86IHN0cmluZztcbiAgLyoqIFx1NjVFNVx1NjcxRlx1N0QyMlx1NUYxNVx1RkYwQ1x1NTNFRlx1OTAwOVx1OTg3OVx1NjU3MFx1N0VDNFx1MzAwMiAqL1xuICBcdTY1RTVcdTY3MUZcdTdEMjJcdTVGMTU/OiBzdHJpbmdbXTtcbiAgLyoqIFx1NTE3M1x1OTUyRVx1OEJDRFx1RkYwQ1x1OTg3Rlx1NTNGN1x1NTIwNlx1OTY5NFx1MzAwMiAqL1xuICBcdTUxNzNcdTk1MkVcdThCQ0Q/OiBzdHJpbmc7XG4gIC8qKiBcdTY5ODJcdThGRjBcdUZGMENcdTdFRDlcdTU0MEVcdTdFRUQgQUkgXHU1RkVCXHU5MDFGXHU4QkM2XHU1MjJCXHU2NTg3XHU2ODYzXHU1MTg1XHU1QkI5XHU3NTI4XHUzMDAyICovXG4gIFx1Njk4Mlx1OEZGMD86IHN0cmluZztcbiAgLyoqIFx1OEJDNFx1NTIwNiAxLTVcdUZGMUJcdTY3MkFcdThCQzRcdTUyMDZcdTY1RjZcdTRGRERcdTc1NTlcdTdBN0FcdTUwM0NcdTRFRTVcdTY2M0VcdTVGMEZcdTUzNjBcdTRGNERcdTMwMDIgKi9cbiAgXHU4QkM0XHU1MjA2PzogbnVtYmVyIHwgJyc7XG4gIC8qKiBcdThCQzRcdTUyMDZcdTY2M0VcdTc5M0FcdTRFMzJcdUZGMENcdTU5ODIgXCJcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdUZGNUNcdTVCOUVcdThERjVcIlx1MzAwMiAqL1xuICBcdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBPzogc3RyaW5nO1xuICAvKiogXHU3RDIyXHU1RjE1X1x1NzdFNVx1OEJDNlx1NUU5M1x1RkYwOFx1NkI2M1x1OEQyMi9cdTUwNEZcdThEMjIvLi4uXHVGRjA5XHUzMDAyICovXG4gIFx1N0QyMlx1NUYxNV9cdTc3RTVcdThCQzZcdTVFOTM/OiBzdHJpbmc7XG4gIC8qKiBcdTdEMjJcdTVGMTVfXHU5ODlDXHU4MjcyXHUzMDAyICovXG4gIFx1N0QyMlx1NUYxNV9cdTk4OUNcdTgyNzI/OiBzdHJpbmc7XG4gIC8qKiBcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OFx1RkYwQ1x1NEUyNFx1N0VDNFx1OTAwOVx1NEUwMFx1RkYwOFx1NjBGM1x1NkNENS9cdTg5QzRcdTUyMTIvXHU2MjY3XHU4ODRDL1x1NTNEN1x1NjMyQi9cdTUxNEJcdTY3MEQgXHUwMEQ3IFx1NTIxRFx1N0EzRi9cdTVCQTFcdTY4MzgvXHU0RkVFXHU2NTM5L1x1NUI4Q1x1NjIxMC9cdTU5MERcdTc2RDhcdUZGMDlcdTMwMDIgKi9cbiAgJ1x1N0QyMlx1NUYxNV9cdTY0Q0RcdTRGNUMmXHU1M0NEXHU5OTg4Jz86IHN0cmluZ1tdO1xuICAvKiogXHU3RDIyXHU1RjE1X1x1NTc1N1x1RkYwQ1x1NTkxQVx1OTAwOVx1RkYwOFx1NTE3N1x1OEM2MS9cdTYyQkRcdThDNjEgXHUwMEQ3IFx1N0I4MFx1NTM1NS9cdTU2RjBcdTk2QkVcdUZGMDlcdTMwMDIgKi9cbiAgXHU3RDIyXHU1RjE1X1x1NTc1Nz86IHN0cmluZ1tdO1xuICAvKiogXHU3RDIyXHU1RjE1X1x1OThDRVx1OTY2OVx1RkYwQ1x1OTZGNlx1NjIxNlx1NTkxQVx1NEUyQVx1MzAwMiAqL1xuICBcdTdEMjJcdTVGMTVfXHU5OENFXHU5NjY5Pzogc3RyaW5nW107XG59XG5cbi8qKiBPQiBcdTY1ODdcdTRFRjZcdTVCOENcdTY1NzQgZnJvbnRtYXR0ZXIgPSBcdTU0MENcdTZCNjVcdTdFRDFcdTVCOUEgKyBcdTc3RTVcdThCQzZcdTVFOTNcdTUxNDNcdTY1NzBcdTYzNkVcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgWUFNTEZyb250bWF0dGVyIGV4dGVuZHMgU3luY0JpbmRpbmcsIEtub3dsZWRnZU1ldGEsIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHt9XG5cbi8qKiBPQlx1MjE5Mlx1OThERVx1NEU2NiBjYWxsb3V0IFx1NUI1N1x1NkJCNVx1NjYyMFx1NUMwNFx1OTg3OVx1MzAwMlx1NEY5RFx1NjM2RSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU0RTk0XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIENhbGxvdXRGaWVsZE1hcCB7XG4gIC8qKiBZQU1MIFx1NUI1N1x1NkJCNVx1NTQwRFx1MzAwMiAqL1xuICBmaWVsZDoga2V5b2YgS25vd2xlZGdlTWV0YTtcbiAgLyoqIGNhbGxvdXQgXHU5MUNDXHU2NjNFXHU3OTNBXHU3Njg0XHU0RTJEXHU2NTg3XHU2ODA3XHU3QjdFXHUzMDAyICovXG4gIGxhYmVsOiBzdHJpbmc7XG4gIC8qKiBlbW9qaVx1RkYwOFx1NEUwRFx1NUUyNiB2YXJpYXRpb24gc2VsZWN0b3JcdUZGMDlcdTMwMDIgKi9cbiAgZW1vamk6IHN0cmluZztcbn1cblxuLyoqXG4gKiBZQU1MIFx1NUI1N1x1NkJCNSBcdTIxOTIgXHU5OERFXHU0RTY2IGNhbGxvdXQgXHU4ODRDXHU2NjIwXHU1QzA0XHUzMDAyXHU0RjlEXHU2MzZFIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTRFOTRcdTMwMDJcbiAqIFx1NkNFOFx1NjEwRiBlbW9qaSBcdTUxNjhcdTkwRThcdTRFMERcdTVFMjYgVStGRTBGXHVGRjA4XHU5OERFXHU0RTY2XHU0RTBEXHU4QkE0IFZTXHVGRjBDXHU4OUMxIDAzIFx1NjU4N1x1Njg2MyBcdTAwQTczLjNcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGNvbnN0IENBTExPVVRfRklFTERfTUFQOiBDYWxsb3V0RmllbGRNYXBbXSA9IFtcbiAgeyBmaWVsZDogJ1x1NjgwN1x1N0I3RScsIGxhYmVsOiAnXHU2ODA3XHU3QjdFJywgZW1vamk6ICdcdUQ4M0NcdURGRjcnIH0sXG4gIHsgZmllbGQ6ICdcdTdGMTZcdTc4MDEnLCBsYWJlbDogJ1x1N0YxNlx1NzgwMScsIGVtb2ppOiAnXHVEODNEXHVERDIyJyB9LFxuICB7IGZpZWxkOiAnXHU4RjkzXHU1MTY1JywgbGFiZWw6ICdcdThGOTNcdTUxNjUnLCBlbW9qaTogJ1x1RDgzRFx1RENFNScgfSxcbiAgeyBmaWVsZDogJ1x1NjVFNVx1NjcxRicsIGxhYmVsOiAnXHU2NUU1XHU2NzFGJywgZW1vamk6ICdcdUQ4M0RcdURDQzUnIH0sXG4gIHsgZmllbGQ6ICdcdTUxNzNcdTk1MkVcdThCQ0QnLCBsYWJlbDogJ1x1NTE3M1x1OTUyRVx1OEJDRCcsIGVtb2ppOiAnXHVEODNEXHVERDExJyB9LFxuICB7IGZpZWxkOiAnXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQScsIGxhYmVsOiAnXHU4QkM0XHU1MjA2JywgZW1vamk6ICdcdTJCNTAnIH0sXG4gIHsgZmllbGQ6ICdcdTdEMjJcdTVGMTVfXHU3N0U1XHU4QkM2XHU1RTkzJywgbGFiZWw6ICdcdTdEMjJcdTVGMTUnLCBlbW9qaTogJ1x1RDgzRFx1RENCMCcgfSxcbl07XG5cbi8qKiBPQlx1MjE5Mlx1OThERVx1NEU2NiBjYWxsb3V0IFx1NjU3NFx1NEY1M1x1OTE0RFx1ODI3Mlx1RkYwOFx1NTQwOFx1NUU3Nlx1NEZFMVx1NjA2Rlx1NTc1N1x1NzUyOFx1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IERPQ19JTkZPX0NBTExPVVQgPSB7XG4gIGVtb2ppOiAnXHVEODNEXHVEQ0NCJyxcbiAgJ2JhY2tncm91bmQtY29sb3InOiAnbGlnaHQtYmx1ZScsXG4gICdib3JkZXItY29sb3InOiAnYmx1ZScsXG59IGFzIGNvbnN0O1xuXG4vKiogXHU5OERFXHU0RTY2IGNhbGxvdXQgXHU4MENDXHU2NjZGXHU4MjcyIFx1MjE5MiBPQiBjYWxsb3V0IFx1N0M3Qlx1NTc4Qlx1MzAwMlx1NEY5RFx1NjM2RSBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTczLjFcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBGRUlTSFVfQkdfVE9fT0JfQ0FMTE9VVDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJ2xpZ2h0LXllbGxvdyc6ICd0aXAnLFxuICAnbWVkaXVtLXJlZCc6ICd3YXJuaW5nJyxcbiAgJ2xpZ2h0LWdyZWVuJzogJ3N1Y2Nlc3MnLFxuICAnbGlnaHQtYmx1ZSc6ICdpbmZvJyxcbiAgJ2xpZ2h0LXB1cnBsZSc6ICdub3RlJyxcbiAgJ2xpZ2h0LWdyYXknOiAncXVvdGUnLFxuICAnbGlnaHQtb3JhbmdlJzogJ2ZhcScsXG59O1xuXG4vKiogT0IgY2FsbG91dCBcdTdDN0JcdTU3OEIgXHUyMTkyIFx1OThERVx1NEU2NiBjYWxsb3V0IFx1OTE0RFx1ODI3Mlx1MzAwMlx1MDBBNzMuMSBcdTUzQ0RcdTU0MTFcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBPQl9DQUxMT1VUX1RPX0ZFSVNIVTogUmVjb3JkPHN0cmluZywgeyBlbW9qaTogc3RyaW5nOyBiZzogc3RyaW5nOyBib3JkZXI6IHN0cmluZyB9PiA9IHtcbiAgdGlwOiB7IGVtb2ppOiAnXHVEODNEXHVEQ0ExJywgYmc6ICdsaWdodC15ZWxsb3cnLCBib3JkZXI6ICd5ZWxsb3cnIH0sXG4gIHdhcm5pbmc6IHsgZW1vamk6ICdcdTI2QTBcdUZFMEYnLCBiZzogJ21lZGl1bS1yZWQnLCBib3JkZXI6ICdyZWQnIH0sXG4gIHN1Y2Nlc3M6IHsgZW1vamk6ICdcdTI3MDUnLCBiZzogJ2xpZ2h0LWdyZWVuJywgYm9yZGVyOiAnZ3JlZW4nIH0sXG4gIGluZm86IHsgZW1vamk6ICdcdTIxMzlcdUZFMEYnLCBiZzogJ2xpZ2h0LWJsdWUnLCBib3JkZXI6ICdibHVlJyB9LFxuICBub3RlOiB7IGVtb2ppOiAnXHVEODNEXHVEQ0REJywgYmc6ICdsaWdodC1wdXJwbGUnLCBib3JkZXI6ICdwdXJwbGUnIH0sXG4gIHF1b3RlOiB7IGVtb2ppOiAnXHVEODNEXHVEQ0FDJywgYmc6ICdsaWdodC1ncmF5JywgYm9yZGVyOiAnZ3JheScgfSxcbiAgZmFxOiB7IGVtb2ppOiAnXHUyNzUzJywgYmc6ICdsaWdodC1vcmFuZ2UnLCBib3JkZXI6ICdvcmFuZ2UnIH0sXG4gIGFic3RyYWN0OiB7IGVtb2ppOiAnXHVEODNEXHVEQ0NCJywgYmc6ICdsaWdodC1ibHVlJywgYm9yZGVyOiAnYmx1ZScgfSxcbn07XG4iLCAiaW1wb3J0IHR5cGUgeyBLbm93bGVkZ2VNZXRhIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5cbi8qKlxuICogbG9jYWxob3N0IEhUVFAgXHU1MzRGXHU4QkFFXHU1OTUxXHU3RUE2XHVGRjA4T0IgXHU2M0QyXHU0RUY2IFx1MjE5NCBcdTZENEZcdTg5QzhcdTU2NjhcdTYyNjlcdTVDNTVcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdTRGOURcdTYzNkVcdUZGMUFgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTc0LjIgKyBcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFcdUZGMDhcdTU4NkJcdTg4NjVcdTY1ODdcdTY4NjNcdTdGM0FcdTUzRTNcdUZGMDlcdTMwMDJcbiAqIFx1OTI3NFx1Njc0M1x1RkYxQVx1NkJDRlx1NEUyQVx1OEJGN1x1NkM0Mlx1NUUyNiBoZWFkZXIgYFgtU3luYy1Ub2tlbjogPFx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Qz5gXHUzMDAyXG4gKiBDT1JTXHVGRjFBT0Igc2VydmVyIFx1NUZDNVx1OTg3Qlx1NjUzRVx1OTAxQSBPUFRJT05TIFx1OTg4NFx1NjhDMFx1RkYwOFx1NjI2OVx1NUM1NVx1NEVDRVx1OThERVx1NEU2Nlx1OTg3NVx1OTc2Mlx1NTNEMVx1OEQ3NyBmZXRjaCBcdTRGMUFcdTg4QUJcdTYyRTZcdUZGMDlcdTMwMDJcbiAqL1xuXG4vKiogXHU5RUQ4XHU4QkE0XHU3QUVGXHU1M0UzXHUzMDAyXHU1M0VGXHU1NzI4IE9CIFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1OTg3NVx1NjUzOVx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUE9SVCA9IDQ1Njc7XG5cbi8qKiBcdTkyNzRcdTY3NDMgaGVhZGVyIFx1NTQwRFx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IFRPS0VOX0hFQURFUiA9ICdYLVN5bmMtVG9rZW4nO1xuXG4vKiogXHU4REU4XHU3QUVGXHU1MzRGXHU4QkFFXHU3MjQ4XHU2NzJDXHVGRjFCXHU0RTBEXHU0RTAwXHU4MUY0XHU2NUY2XHU1MTk5XHU2NENEXHU0RjVDXHU1RkM1XHU5ODdCXHU1OTMxXHU4RDI1XHU1MTczXHU5NUVEXHUzMDAyICovXG5leHBvcnQgY29uc3QgUFJPVE9DT0xfVkVSU0lPTiA9IDE7XG5cbmV4cG9ydCB0eXBlIFN5bmNDYXBhYmlsaXR5ID0gJ3N0YXR1cycgfCAndHJlZScgfCAnZmV0Y2gnIHwgJ2NsaXAnIHwgJ2V4aXN0cycgfCAncHVzaGJhY2snO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByb3RvY29sSW5mbyB7XG4gIHByb3RvY29sVmVyc2lvbjogbnVtYmVyO1xuICBjYXBhYmlsaXRpZXM6IHN0cmluZ1tdO1xuICBjb21wb25lbnRWZXJzaW9uOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvdG9jb2xDb21wYXRpYmlsaXR5IHtcbiAgY29tcGF0aWJsZTogYm9vbGVhbjtcbiAgcmVhc29uPzogc3RyaW5nO1xufVxuXG4vKiogXHU1RjUzXHU1MjREXHU2NzBEXHU1MkExXHU3QUVGXHU1QjlFXHU5NjQ1XHU2M0QwXHU0RjlCXHU3Njg0XHU4MEZEXHU1MjlCXHUzMDAyICovXG5leHBvcnQgY29uc3QgU0VSVkVSX0NBUEFCSUxJVElFUzogcmVhZG9ubHkgU3luY0NhcGFiaWxpdHlbXSA9IFtcbiAgJ3N0YXR1cycsXG4gICd0cmVlJyxcbiAgJ2ZldGNoJyxcbiAgJ2NsaXAnLFxuICAnZXhpc3RzJyxcbiAgJ3B1c2hiYWNrJyxcbl07XG5cbi8qKiBcdTVCOENcdTY1NzRcdTUxOTlcdTUxNjVcdTUzNEZcdThCQUVcdTc2ODRcdTY3MDBcdTRGNEVcdTgwRkRcdTUyOUJcdTk2QzZcdTU0MDhcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBSRVFVSVJFRF9XUklURV9DQVBBQklMSVRJRVM6IHJlYWRvbmx5IFN5bmNDYXBhYmlsaXR5W10gPSBbXG4gICdmZXRjaCcsXG4gICdjbGlwJyxcbiAgJ3B1c2hiYWNrJyxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBldmFsdWF0ZVByb3RvY29sQ29tcGF0aWJpbGl0eShcbiAgaW5mbzogUGFydGlhbDxQcm90b2NvbEluZm8+IHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgcmVxdWlyZWQ6IHJlYWRvbmx5IFN5bmNDYXBhYmlsaXR5W10gPSBSRVFVSVJFRF9XUklURV9DQVBBQklMSVRJRVMsXG4pOiBQcm90b2NvbENvbXBhdGliaWxpdHkge1xuICBpZiAoXG4gICAgIWluZm9cbiAgICB8fCB0eXBlb2YgaW5mby5wcm90b2NvbFZlcnNpb24gIT09ICdudW1iZXInXG4gICAgfHwgIUFycmF5LmlzQXJyYXkoaW5mby5jYXBhYmlsaXRpZXMpXG4gICAgfHwgdHlwZW9mIGluZm8uY29tcG9uZW50VmVyc2lvbiAhPT0gJ3N0cmluZydcbiAgKSB7XG4gICAgcmV0dXJuIHsgY29tcGF0aWJsZTogZmFsc2UsIHJlYXNvbjogJ01pc3NpbmcgcHJvdG9jb2wgbWV0YWRhdGEnIH07XG4gIH1cbiAgaWYgKGluZm8ucHJvdG9jb2xWZXJzaW9uICE9PSBQUk9UT0NPTF9WRVJTSU9OKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbXBhdGlibGU6IGZhbHNlLFxuICAgICAgcmVhc29uOiBgUHJvdG9jb2wgdmVyc2lvbiBtaXNtYXRjaDogYnJvd3Nlcj0ke1BST1RPQ09MX1ZFUlNJT059LCBvYnNpZGlhbj0ke2luZm8ucHJvdG9jb2xWZXJzaW9ufWAsXG4gICAgfTtcbiAgfVxuICBjb25zdCBjYXBhYmlsaXRpZXMgPSBuZXcgU2V0KGluZm8uY2FwYWJpbGl0aWVzKTtcbiAgY29uc3QgbWlzc2luZyA9IHJlcXVpcmVkLmZpbHRlcigoY2FwYWJpbGl0eSkgPT4gIWNhcGFiaWxpdGllcy5oYXMoY2FwYWJpbGl0eSkpO1xuICBpZiAobWlzc2luZy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbXBhdGlibGU6IGZhbHNlLFxuICAgICAgcmVhc29uOiBgTWlzc2luZyByZXF1aXJlZCBjYXBhYmlsaXRpZXM6ICR7bWlzc2luZy5qb2luKCcsICcpfWAsXG4gICAgfTtcbiAgfVxuICByZXR1cm4geyBjb21wYXRpYmxlOiB0cnVlIH07XG59XG5cbi8qKiBcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjMgVVJMIFx1ODlFM1x1Njc5MFx1N0VEM1x1Njc5Q1x1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBGZWlzaHVEb2NSZWYge1xuICAvKiogd2lraSBub2RlX3Rva2VuXHVGRjA4XHU0RjE4XHU1MTQ4XHU3NTI4XHVGRjBDXHU1NTJGXHU0RTAwXHU3RUQxXHU1QjlBXHVGRjA5XHUzMDAyICovXG4gIG5vZGVfdG9rZW4/OiBzdHJpbmc7XG4gIC8qKiBkb2N4IG9ial90b2tlblx1RkYwOFx1NTZERVx1NTE5OVx1NzUyOFx1RkYwOVx1MzAwMiAqL1xuICBvYmpfdG9rZW4/OiBzdHJpbmc7XG4gIC8qKiBzcGFjZV9pZFx1RkYwOFx1OTBFOFx1NTIwNlx1NjRDRFx1NEY1Q1x1OTcwMFx1ODk4MVx1RkYwQ1x1NTNFRlx1OTAwOVx1RkYwOVx1MzAwMiAqL1xuICBzcGFjZV9pZD86IHN0cmluZztcbn1cblxuLyoqIEdFVCAvc3RhdHVzIFx1NTRDRFx1NUU5NFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdGF0dXNSZXNwb25zZSBleHRlbmRzIFByb3RvY29sSW5mbyB7XG4gIG9rOiB0cnVlO1xuICAvKiogXHU2M0QyXHU0RUY2XHU3MjQ4XHU2NzJDXHUzMDAyICovXG4gIHZlcnNpb246IHN0cmluZztcbiAgLyoqIHZhdWx0IFx1NTQwRFx1MzAwMiAqL1xuICB2YXVsdDogc3RyaW5nO1xuICAvKiogbGFyay1jbGkgXHU2NjJGXHU1NDI2XHU1QzMxXHU3RUVBXHUzMDAyICovXG4gIGxhcmtSZWFkeTogYm9vbGVhbjtcbiAgLyoqIGxhcmstY2xpIFx1NzI0OFx1NjcyQ1x1RkYwOFx1NjNBMlx1NkQ0Qlx1NEUwRFx1NTIzMFx1NjVGNlx1NEUzQSBudWxsXHVGRjA5XHUzMDAyICovXG4gIGxhcmtWZXJzaW9uOiBzdHJpbmcgfCBudWxsO1xuICAvKiogXHU2NzAwXHU4RkQxXHU2RDNCXHU1MkE4XHU3Njg0XHU2NUUwXHU2NTRGXHU2MTFGXHU1MTQzXHU2NTcwXHU2MzZFXHU2NDU4XHU4OTgxXHUzMDAyICovXG4gIHJlY2VudEFjdGl2aXR5PzogQXJyYXk8e1xuICAgIHRpbWU6IHN0cmluZztcbiAgICBraW5kOiBzdHJpbmc7XG4gICAgc3RhdHVzOiBzdHJpbmc7XG4gICAgYWN0aW9uPzogc3RyaW5nO1xuICAgIHRpdGxlPzogc3RyaW5nO1xuICAgIHBhdGg/OiBzdHJpbmc7XG4gICAgZXJyb3JDb2RlPzogc3RyaW5nO1xuICB9Pjtcbn1cblxuLyoqIFx1NzZFRVx1NUY1NVx1NjgxMVx1ODI4Mlx1NzBCOVx1RkYwOFx1N0VEOVx1NjI2OVx1NUM1NVx1NzZFRVx1NUY1NVx1NEUwQlx1NjJDOVx1NzUyOFx1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBUcmVlTm9kZSB7XG4gIC8qKiBcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHU3Njg0XHU4REVGXHU1Rjg0XHVGRjBDXHU1OTgyIFwiMFx1RkUwRlx1MjBFM1x1OEY5M1x1NTE2NS9cdUQ4M0RcdURDQTFcdTc4OEVcdTcyNDdcdThGOTNcdTUxNjVcdUZGMDhcdTk1RUFcdTVGRjVcdUZGMDlcIlx1MzAwMiAqL1xuICBwYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTY2M0VcdTc5M0FcdTU0MERcdUZGMDhcdTY3MDBcdTU0MEVcdTRFMDBcdTZCQjVcdUZGMDlcdTMwMDIgKi9cbiAgbGFiZWw6IHN0cmluZztcbiAgLyoqIFx1NkRGMVx1NUVBNlx1RkYwOFx1NjgzOT0wXHVGRjA5XHUzMDAyICovXG4gIGRlcHRoOiBudW1iZXI7XG59XG5cbi8qKiBHRVQgL3RyZWUgXHU1NENEXHU1RTk0XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFRyZWVSZXNwb25zZSB7XG4gIG9rOiB0cnVlO1xuICBkaXJzOiBUcmVlTm9kZVtdO1xufVxuXG4vKiogUE9TVCAvZmV0Y2ggXHU4QkY3XHU2QzQyXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIEZldGNoUmVxdWVzdCB7XG4gIC8qKiBcdTkxQ0RcdThCRDVcdTY1RjZcdTRGRERcdTYzMDFcdTRFMERcdTUzRDhcdTc2ODRcdTVFNDJcdTdCNDlcdThCRjdcdTZDNDIgSURcdTMwMDIgKi9cbiAgcmVxdWVzdElkPzogc3RyaW5nO1xuICAvKiogXHU1RkM1XHU1ODZCXHVGRjFBd2lraSBub2RlX3Rva2VuXHUzMDAyICovXG4gIG5vZGVfdG9rZW46IHN0cmluZztcbiAgLyoqIFx1NTNFRlx1OTAwOVx1RkYxQWRvY3ggb2JqX3Rva2VuXHVGRjA4XHU2NzJBXHU3RUQ5XHU1MjE5XHU2M0QyXHU0RUY2XHU3NTI4IHdpa2kgK25vZGUtZ2V0IFx1ODlFM1x1Njc5MFx1RkYwOVx1MzAwMiAqL1xuICBvYmpfdG9rZW4/OiBzdHJpbmc7XG4gIC8qKiBcdTUzRUZcdTkwMDlcdUZGMUFzcGFjZV9pZFx1MzAwMiAqL1xuICBzcGFjZV9pZD86IHN0cmluZztcbiAgLyoqIFx1ODQzRFx1NTczMFx1NzZFRVx1NUY1NVx1RkYwOFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdUZGMDlcdUZGMENcdTY3MkFcdTdFRDlcdTc1MjhcdThCQkVcdTdGNkVcdTlFRDhcdThCQTRcdTUwM0NcdTMwMDIgKi9cbiAgZGlyPzogc3RyaW5nO1xuICAvKiogXHU4OTg2XHU3NkQ2XHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU0RTBEXHU1NDJCXHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA5XHVGRjBDXHU2NzJBXHU3RUQ5XHU3NTI4XHU5OERFXHU0RTY2XHU2ODA3XHU5ODk4XHU2RTA1XHU2RDE3XHU3RUQzXHU2NzlDXHUzMDAyICovXG4gIGZpbGVuYW1lPzogc3RyaW5nO1xuICAvKiogXHU2RDRGXHU4OUM4XHU1NjY4XHU1NDBDXHU2QjY1XHU1MjREXHU3ODZFXHU4QkE0XHU1NDBFXHU3Njg0IFlBTUwgXHU1MTQzXHU2NTcwXHU2MzZFXHU4OTg2XHU3NkQ2XHVGRjFCXHU0RUM1XHU5NjUwXHU3N0U1XHU4QkM2XHU1RTkzXHU1MTQzXHU2NTcwXHU2MzZFXHU1QjU3XHU2QkI1XHUzMDAyICovXG4gIG1ldGE/OiBQYXJ0aWFsPEtub3dsZWRnZU1ldGE+O1xuICAvKiogT0IgXHU1MTg1XHU5MEU4XHU0RjdGXHU3NTI4XHVGRjFBQ2xpcHBlciBcdTUzNjBcdTRGNERcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdUZGMENcdTU0N0RcdTRFMkRcdTY1RjZcdTUzOUZcdTRGNERcdTg5ODZcdTc2RDZcdTMwMDIgKi9cbiAgcmVwbGFjZV9wYXRoPzogc3RyaW5nO1xufVxuXG4vKiogUE9TVCAvZmV0Y2ggXHU1NENEXHU1RTk0XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIEZldGNoUmVzcG9uc2Uge1xuICBvazogdHJ1ZTtcbiAgLyoqIFx1ODQzRFx1NTczMFx1NUI4Q1x1NjU3NFx1OERFRlx1NUY4NFx1RkYwOFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdUZGMDlcdTMwMDIgKi9cbiAgcGF0aDogc3RyaW5nO1xuICAvKiogXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU1NDJCXHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA5XHUzMDAyICovXG4gIGZpbGVuYW1lOiBzdHJpbmc7XG4gIC8qKiBcdTY3MkNcdTZCMjFcdTY2MkZcdTY1QjBcdTVFRkFcdThGRDhcdTY2MkZcdTY2RjRcdTY1QjBcdTMwMDIgKi9cbiAgYWN0aW9uOiAnY3JlYXRlZCcgfCAndXBkYXRlZCc7XG4gIC8qKiBcdTUyMDZcdTkxNERcdTUyMzBcdTc2ODRcdTdGMTZcdTc4MDFcdUZGMDhhdXRvLXJlbmFtZSBcdTg5RTZcdTUzRDFcdTU0MEVcdUZGMDlcdTMwMDIgKi9cbiAgXHU3RjE2XHU3ODAxPzogc3RyaW5nO1xuICAvKiogXHU5OERFXHU0RTY2XHU1MzlGXHU1OUNCXHU2ODA3XHU5ODk4XHUzMDAyICovXG4gIGZlaXNodV90aXRsZTogc3RyaW5nO1xufVxuXG4vKiogUE9TVCAvY2xpcCBcdThCRjdcdTZDNDJcdUZGMUFcdTRFRkJcdTYxMEZcdTdGNTFcdTk4NzUvXHU1MjEyXHU4QkNEXHU1MjZBXHU1QjU4XHU1MjMwIE9ic2lkaWFuXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIENsaXBSZXF1ZXN0IHtcbiAgLyoqIFx1OTFDRFx1OEJENVx1NjVGNlx1NEZERFx1NjMwMVx1NEUwRFx1NTNEOFx1NzY4NFx1NUU0Mlx1N0I0OVx1OEJGN1x1NkM0MiBJRFx1MzAwMiAqL1xuICByZXF1ZXN0SWQ/OiBzdHJpbmc7XG4gIC8qKiBcdTdGNTFcdTk4NzVcdTY4MDdcdTk4OThcdTMwMDIgKi9cbiAgdGl0bGU/OiBzdHJpbmc7XG4gIC8qKiBcdTY3NjVcdTZFOTAgVVJMXHUzMDAyICovXG4gIHVybD86IHN0cmluZztcbiAgLyoqIFx1Njc2NVx1NkU5MFx1N0M3Qlx1NTc4Qlx1MzAwMiAqL1xuICBzb3VyY2VLaW5kPzogJ2ZlaXNodS1iYXNlJyB8ICdhcnRpY2xlJyB8ICdzZWxlY3Rpb24nIHwgJ2dlbmVyaWMtcGFnZSc7XG4gIC8qKiBcdTkwMDlcdTRFMkRcdTY1ODdcdTY3MkNcdTYyMTZcdTZCNjNcdTY1ODdcdTY0NThcdTg5ODFcdTMwMDIgKi9cbiAgdGV4dD86IHN0cmluZztcbiAgLyoqIEFJIFx1NjIxNlx1ODlDNFx1NTIxOVx1OEY2Q1x1NjM2Mlx1NTQwRVx1NzY4NCBPYnNpZGlhbiBNYXJrZG93biBcdTZCNjNcdTY1ODdcdTMwMDIgKi9cbiAgYm9keU1hcmtkb3duPzogc3RyaW5nO1xuICAvKiogXHU1MzlGXHU1OUNCXHU1M0VGXHU4OUMxXHU2NTg3XHU2NzJDXHUzMDAyICovXG4gIHJhd1RleHQ/OiBzdHJpbmc7XG4gIC8qKiBcdTk4NzVcdTk3NjJcdTYzQ0ZcdThGRjBcdTMwMDIgKi9cbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIC8qKiBcdTg0M0RcdTU3MzBcdTc2RUVcdTVGNTVcdUZGMDhcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHVGRjA5XHUzMDAyXHU2NzJBXHU3RUQ5XHU3NTI4IE9CIFx1NjNEMlx1NEVGNlx1OUVEOFx1OEJBNFx1NzZFRVx1NUY1NVx1MzAwMiAqL1xuICBkaXI/OiBzdHJpbmc7XG4gIC8qKiBcdTUyRkVcdTkwMDlcdTIwMUNcdTg4NjVcdTUxNDVcdTUyMzBcdTVERjJcdTY3MDlcdTY1ODdcdTY4NjNcdTIwMURcdTY1RjZcdUZGMENcdThGRkRcdTUyQTBcdTUyMzBcdThGRDlcdTRFMkFcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHU3Njg0IE1hcmtkb3duIFx1OERFRlx1NUY4NFx1MzAwMiAqL1xuICBhcHBlbmRQYXRoPzogc3RyaW5nO1xuICAvKiogXHU1REYyXHU2MzA5XHU2M0QyXHU0RUY2XHU5ODg0XHU4QkJFXHU1RjUyXHU0RTAwXHU1MzE2XHU3Njg0IFlBTUwgXHU1MTQzXHU2NTcwXHU2MzZFXHUzMDAyICovXG4gIG1ldGE/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuLyoqIFBPU1QgL2NsaXAgXHU1NENEXHU1RTk0XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIENsaXBSZXNwb25zZSB7XG4gIG9rOiB0cnVlO1xuICAvKiogXHU4NDNEXHU1NzMwXHU1QjhDXHU2NTc0XHU4REVGXHU1Rjg0XHVGRjA4XHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1RkYwOVx1MzAwMiAqL1xuICBwYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTU0MkJcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDlcdTMwMDIgKi9cbiAgZmlsZW5hbWU6IHN0cmluZztcbiAgLyoqIFx1NjcyQ1x1NkIyMVx1NjYyRlx1NjVCMFx1NUVGQVx1OEZEOFx1NjYyRlx1NjZGNFx1NjVCMFx1MzAwMiAqL1xuICBhY3Rpb246ICdjcmVhdGVkJyB8ICd1cGRhdGVkJztcbn1cblxuLyoqIFBPU1QgL2V4aXN0cyBcdThCRjdcdTZDNDJcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXhpc3RzUmVxdWVzdCB7XG4gIG5vZGVfdG9rZW46IHN0cmluZztcbn1cblxuLyoqIFBPU1QgL2V4aXN0cyBcdTU0Q0RcdTVFOTRcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXhpc3RzUmVzcG9uc2Uge1xuICBvazogdHJ1ZTtcbiAgZXhpc3RzOiBib29sZWFuO1xuICAvKiogXHU1REYyXHU1QjU4XHU1NzI4XHU2NUY2XHU3RUQ5XHU1MUZBXHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1OERFRlx1NUY4NFx1MzAwMiAqL1xuICBwYXRoPzogc3RyaW5nO1xufVxuXG4vKiogUE9TVCAvcHVzaGJhY2sgXHU4QkY3XHU2QzQyXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFB1c2hiYWNrUmVxdWVzdCB7XG4gIC8qKiBcdTkxQ0RcdThCRDVcdTY1RjZcdTRGRERcdTYzMDFcdTRFMERcdTUzRDhcdTc2ODRcdTVFNDJcdTdCNDlcdThCRjdcdTZDNDIgSURcdTMwMDIgKi9cbiAgcmVxdWVzdElkPzogc3RyaW5nO1xuICAvKiogXHU0RThDXHU5MDA5XHU0RTAwXHVGRjFBXHU2NzJDXHU1NzMwXHU4REVGXHU1Rjg0XHVGRjA4XHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1RkYwOVx1MzAwMiAqL1xuICBwYXRoPzogc3RyaW5nO1xuICAvKiogXHU0RThDXHU5MDA5XHU0RTAwXHVGRjFBbm9kZV90b2tlblx1RkYwOFx1NEVDRVx1N0VEMVx1NUI5QVx1NjI3RVx1NjU4N1x1NEVGNlx1RkYwOVx1MzAwMiAqL1xuICBub2RlX3Rva2VuPzogc3RyaW5nO1xuICAvKiogXHU1RjNBXHU1MjM2XHU1NkRFXHU1MTk5XHVGRjA4XHU1RkZEXHU3NTY1IGhhc2ggXHU0RTAwXHU4MUY0XHU4REYzXHU4RkM3XHVGRjA5XHUzMDAyICovXG4gIGZvcmNlPzogYm9vbGVhbjtcbn1cblxuLyoqIFBPU1QgL3B1c2hiYWNrIFx1NTRDRFx1NUU5NFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdXNoYmFja1Jlc3BvbnNlIHtcbiAgb2s6IHRydWU7XG4gIC8qKiBcdTVCOUVcdTk2NDVcdTU2REVcdTUxOTlcdThGRDhcdTY2MkZcdThERjNcdThGQzdcdUZGMDhoYXNoIFx1NEUwMFx1ODFGNFx1RkYwOVx1MzAwMiAqL1xuICBhY3Rpb246ICdwdXNoZWQnIHwgJ3NraXBwZWQnO1xuICAvKiogXHU2NUIwXHU3Njg0IHN5bmNfaGFzaFx1MzAwMiAqL1xuICBoYXNoPzogc3RyaW5nO1xuICAvKiogXHU1NkRFXHU1MTk5XHU3Njg0XHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzXHU2ODA3XHU5ODk4XHUzMDAyICovXG4gIHRpdGxlPzogc3RyaW5nO1xufVxuXG4vKiogXHU3RURGXHU0RTAwXHU5NTE5XHU4QkVGXHU1NENEXHU1RTk0XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIEVycm9yUmVzcG9uc2Uge1xuICBvazogZmFsc2U7XG4gIC8qKiBcdTY3M0FcdTU2NjhcdTUzRUZcdThCRkJcdTk1MTlcdThCRUZcdTc4MDFcdTMwMDIgKi9cbiAgY29kZTogc3RyaW5nO1xuICAvKiogXHU0RUJBXHU3QzdCXHU1M0VGXHU4QkZCXHU2RDg4XHU2MDZGXHUzMDAyICovXG4gIG1lc3NhZ2U6IHN0cmluZztcbn1cblxuLyoqIFx1NjI0MFx1NjcwOVx1N0FFRlx1NzBCOVx1NUI5QVx1NEU0OVx1RkYwOFx1OERFRlx1NUY4NCArIFx1NjVCOVx1NkNENVx1RkYwOVx1RkYwQ1x1NEY5Qlx1NEUyNFx1N0FFRlx1NUYxNVx1NzUyOFx1OTA3Rlx1NTE0RFx1NjJGQ1x1NTE5OVx1NkYwMlx1NzlGQlx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IEVORFBPSU5UUyA9IHtcbiAgc3RhdHVzOiAnL3N0YXR1cycsXG4gIHRyZWU6ICcvdHJlZScsXG4gIGZldGNoOiAnL2ZldGNoJyxcbiAgY2xpcDogJy9jbGlwJyxcbiAgZXhpc3RzOiAnL2V4aXN0cycsXG4gIHB1c2hiYWNrOiAnL3B1c2hiYWNrJyxcbn0gYXMgY29uc3Q7XG5cbi8qKiBPYnNpZGlhbiBcdTdDRkJcdTdFREZcdTUzNEZcdThCQUVcdUZGMUFcdTZENEZcdTg5QzhcdTU2NjhcdTRFM0JcdTkwMUFcdTkwNTNcdTUyQThcdTRGNUNcdTU0MERcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBPQlNJRElBTl9MQVJLX0RPQ19BQ1RJT04gPSAnbGFyay1kb2MnO1xuXG4vKiogT2JzaWRpYW4gXHU3Q0ZCXHU3RURGXHU1MzRGXHU4QkFFXHVGRjFBXHU2RDRGXHU4OUM4XHU1NjY4XHU0RTNCXHU5MDFBXHU5MDUzIFVSSSBcdTUyNERcdTdGMDBcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBPQlNJRElBTl9MQVJLX0RPQ19VUklfUFJFRklYID0gYG9ic2lkaWFuOi8vJHtPQlNJRElBTl9MQVJLX0RPQ19BQ1RJT059YDtcblxuLyoqIG9ic2lkaWFuOi8vbGFyay1kb2MgXHU1M0MyXHU2NTcwXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIE9ic2lkaWFuTGFya0RvY1BhcmFtcyB7XG4gIC8qKiB2MyBcdTRFM0JcdTkwMUFcdTkwNTNcdTUxN0NcdTVCQjlcdTVCNTdcdTZCQjVcdUZGMENcdTRGMThcdTUxNDhcdTRGMjAgd2lraSBub2RlX3Rva2VuXHUzMDAyICovXG4gIHRva2VuPzogc3RyaW5nO1xuICAvKiogd2lraSBub2RlX3Rva2VuXHUzMDAyICovXG4gIG5vZGVfdG9rZW4/OiBzdHJpbmc7XG4gIC8qKiBkb2N4IG9ial90b2tlblx1MzAwMiAqL1xuICBvYmpfdG9rZW4/OiBzdHJpbmc7XG4gIC8qKiBcdTk4REVcdTRFNjZcdTc3RTVcdThCQzZcdTVFOTMgc3BhY2VfaWRcdTMwMDIgKi9cbiAgc3BhY2VfaWQ/OiBzdHJpbmc7XG4gIC8qKiBcdTk4NzVcdTk3NjJcdTY4MDdcdTk4OThcdTMwMDIgKi9cbiAgdGl0bGU/OiBzdHJpbmc7XG4gIC8qKiBcdTUzOUZcdTU5Q0JcdTk4REVcdTRFNjYgVVJMXHUzMDAyICovXG4gIHVybD86IHN0cmluZztcbiAgLyoqIFx1NTNFRlx1OTAwOVx1NzZFRVx1NjgwN1x1NzZFRVx1NUY1NVx1RkYxQlx1NEUzQVx1N0E3QVx1NjVGNlx1NzUzMSBPQiBcdTdBRUZcdTkwMDlcdTYyRTlcdTYyMTZcdTRGN0ZcdTc1MjhcdTlFRDhcdThCQTRcdTc2RUVcdTVGNTVcdTMwMDIgKi9cbiAgZGlyPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFx1Njc4NFx1OTAyMCBgb2JzaWRpYW46Ly9sYXJrLWRvY2AgVVJJXHUzMDAyXG4gKlxuICogUG9ueXRhaWw6IFx1NzUyOFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NTQ4Q1x1N0NGQlx1N0VERlx1NURGMlx1NjcwOVx1NzY4NFx1ODFFQVx1NUI5QVx1NEU0OVx1NTM0Rlx1OEJBRVx1ODBGRFx1NTI5Qlx1NjI3Rlx1OEY3RFx1NEUzQlx1OTAxQVx1OTA1M1x1RkYwQ1xuICogXHU0RTBEXHU1MThEXHU0RTNBXHUyMDFDXHU3MEI5XHU1MUZCXHU5OERFXHU0RTY2XHU2MzA5XHU5NEFFXHUyMDFEXHU5ODlEXHU1OTE2XHU1M0QxXHU2NjBFXHU0RTAwXHU1OTU3XHU1NDBFXHU1M0YwXHU2RDg4XHU2MDZGXHU1MzRGXHU4QkFFXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZE9ic2lkaWFuTGFya0RvY1VyaShwYXJhbXM6IE9ic2lkaWFuTGFya0RvY1BhcmFtcyk6IHN0cmluZyB7XG4gIGNvbnN0IHRva2VuID0gcGFyYW1zLnRva2VuIHx8IHBhcmFtcy5ub2RlX3Rva2VuIHx8IHBhcmFtcy5vYmpfdG9rZW47XG4gIGNvbnN0IHF1ZXJ5OiBBcnJheTxbc3RyaW5nLCBzdHJpbmcgfCB1bmRlZmluZWRdPiA9IFtcbiAgICBbJ3Rva2VuJywgdG9rZW5dLFxuICAgIFsnbm9kZV90b2tlbicsIHBhcmFtcy5ub2RlX3Rva2VuXSxcbiAgICBbJ29ial90b2tlbicsIHBhcmFtcy5vYmpfdG9rZW5dLFxuICAgIFsnc3BhY2VfaWQnLCBwYXJhbXMuc3BhY2VfaWRdLFxuICAgIFsndGl0bGUnLCBwYXJhbXMudGl0bGVdLFxuICAgIFsndXJsJywgcGFyYW1zLnVybF0sXG4gICAgWydkaXInLCBwYXJhbXMuZGlyXSxcbiAgXTtcbiAgY29uc3QgZW5jb2RlZCA9IHF1ZXJ5XG4gICAgLmZpbHRlcigoWywgdmFsdWVdKSA9PiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSAnJylcbiAgICAubWFwKChba2V5LCB2YWx1ZV0pID0+IGAke2VuY29kZVVSSUNvbXBvbmVudChrZXkpfT0ke2VuY29kZVVSSUNvbXBvbmVudChTdHJpbmcodmFsdWUpKX1gKVxuICAgIC5qb2luKCcmJyk7XG4gIHJldHVybiBlbmNvZGVkID8gYCR7T0JTSURJQU5fTEFSS19ET0NfVVJJX1BSRUZJWH0/JHtlbmNvZGVkfWAgOiBPQlNJRElBTl9MQVJLX0RPQ19VUklfUFJFRklYO1xufVxuXG4vKiogXHU4OUUzXHU2NzkwIGBvYnNpZGlhbjovL2xhcmstZG9jYCBVUkkgXHU2MjE2IE9ic2lkaWFuIHByb3RvY29sIGhhbmRsZXIgcGFyYW1zXHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VPYnNpZGlhbkxhcmtEb2NQYXJhbXMoXG4gIGlucHV0OiBzdHJpbmcgfCBVUkxTZWFyY2hQYXJhbXMgfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCB1bmRlZmluZWQ+LFxuKTogT2JzaWRpYW5MYXJrRG9jUGFyYW1zIHtcbiAgY29uc3Qgc2VhcmNoUGFyYW1zID0gKCgpID0+IHtcbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgcXVlcnkgPSBpbnB1dC5pbmNsdWRlcygnPycpID8gaW5wdXQuc2xpY2UoaW5wdXQuaW5kZXhPZignPycpICsgMSkgOiBpbnB1dDtcbiAgICAgIHJldHVybiBuZXcgVVJMU2VhcmNoUGFyYW1zKHF1ZXJ5KTtcbiAgICB9XG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zKSByZXR1cm4gaW5wdXQ7XG4gICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGlucHV0KSkge1xuICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHBhcmFtcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBwYXJhbXM7XG4gIH0pKCk7XG5cbiAgY29uc3QgZ2V0ID0gKGtleToga2V5b2YgT2JzaWRpYW5MYXJrRG9jUGFyYW1zKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+XG4gICAgc2VhcmNoUGFyYW1zLmdldChrZXkpIHx8IHVuZGVmaW5lZDtcblxuICBjb25zdCBwYXJzZWQ6IE9ic2lkaWFuTGFya0RvY1BhcmFtcyA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBvZiBbJ3Rva2VuJywgJ25vZGVfdG9rZW4nLCAnb2JqX3Rva2VuJywgJ3NwYWNlX2lkJywgJ3RpdGxlJywgJ3VybCcsICdkaXInXSBhcyBjb25zdCkge1xuICAgIGNvbnN0IHZhbHVlID0gZ2V0KGtleSk7XG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHBhcnNlZFtrZXldID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIHBhcnNlZDtcbn1cblxuLyoqIFx1OEZEQlx1NUVBNlx1OTYzNlx1NkJCNVx1RkYwOFx1NjI2OVx1NUM1NVx1NkQ2RVx1NUM0Mlx1NzUyOFx1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IHR5cGUgUHJvZ3Jlc3NTdGFnZSA9XG4gIHwgJ2Nvbm5lY3RpbmcnXG4gIHwgJ2ZldGNoaW5nLW1kJ1xuICB8ICdmZXRjaGluZy14bWwnXG4gIHwgJ3Jld3JpdGluZy1pbWFnZXMnXG4gIHwgJ3dyaXRpbmctZmlsZSdcbiAgfCAnYXNzaWduaW5nLWNvZGUnXG4gIHwgJ2RvbmUnXG4gIHwgJ2Vycm9yJztcbiIsICIvKipcbiAqIFx1NTE4NVx1NUJCOSBoYXNoXHVGRjA4XHU4RjdCXHU2ODM4XHU5QThDXHVGRjA5XHUzMDAyXHU0RjlEXHU2MzZFIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgIFx1MDBBNzYuMiBcdTZCNjVcdTlBQTQgMlx1MzAwMlxuICogXHU3NTI4IHNoYTI1Nlx1RkYwQ1x1NTNFQSBoYXNoIFx1NkI2M1x1NjU4N1x1RkYwOFx1NEUwRFx1NTQyQiBmcm9udG1hdHRlciBcdTc2ODQgc3luY18qIFx1NUI1N1x1NkJCNVx1RkYwQ1x1OTA3Rlx1NTE0RFx1ODFFQVx1NjMwN1x1RkYwOVx1MzAwMlxuICpcbiAqIFx1OERFOFx1NzNBRlx1NTg4M1x1RkYxQVx1NEYxOFx1NTE0OFx1NzUyOCBXZWIgQ3J5cHRvIEFQSVx1RkYwOFx1NkQ0Rlx1ODlDOFx1NTY2OCArIE5vZGUgMTgrIFx1OTBGRFx1NjcwOSBnbG9iYWxUaGlzLmNyeXB0by5zdWJ0bGVcdUZGMDlcdUZGMENcbiAqIGZhbGxiYWNrIFx1NTIzMCBub2RlOmNyeXB0b1x1RkYwOE9CIFx1NjNEMlx1NEVGNiBub2RlIFx1NzNBRlx1NTg4M1x1NEZERFx1OTY2OVx1RkYwOVx1MzAwMlxuICovXG5cbi8qKiBcdTU0MENcdTZCNjVcdTcyNDggc2hhMjU2IGhleFx1RkYwOFx1NEVDNSBOb2RlIFx1NzNBRlx1NTg4M1x1RkYwOVx1MzAwMlx1NkQ0Rlx1ODlDOFx1NTY2OFx1NzUyOCBib2R5SGFzaEFzeW5jXHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gYm9keUhhc2goYm9keTogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gTm9kZSBcdTczQUZcdTU4ODNcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGNyZWF0ZUhhc2ggfSA9IHJlcXVpcmUoJ25vZGU6Y3J5cHRvJykgYXMgdHlwZW9mIGltcG9ydCgnbm9kZTpjcnlwdG8nKTtcbiAgICByZXR1cm4gY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKGJvZHksICd1dGY4JykuZGlnZXN0KCdoZXgnKTtcbiAgfSBjYXRjaCB7XG4gICAgLy8gXHU2RDRGXHU4OUM4XHU1NjY4XHU3M0FGXHU1ODgzXHU2NUUwIHJlcXVpcmVcdUZGMENcdThENzAgYXN5bmMgXHU3MjQ4XHVGRjA4XHU4RkQ5XHU5MUNDXHU1NDBDXHU2QjY1XHU4RkQ0XHU1NkRFIGZhbGxiYWNrXHVGRjBDXHU4QzAzXHU3NTI4XHU2NUI5XHU1RTk0XHU3NTI4IGFzeW5jIFx1NzI0OFx1RkYwOVxuICAgIHJldHVybiBzeW5jRmFsbGJhY2tIYXNoKGJvZHkpO1xuICB9XG59XG5cbi8qKlxuICogXHU1RjAyXHU2QjY1IHNoYTI1NiBoZXhcdUZGMDhcdTZENEZcdTg5QzhcdTU2NjggKyBOb2RlIFx1OTAxQVx1NzUyOFx1RkYwOVx1MzAwMlx1NjNBOFx1ODM1MFx1NEY3Rlx1NzUyOFx1MzAwMlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYm9keUhhc2hBc3luYyhib2R5OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBjcnlwdG8gPSBnbG9iYWxUaGlzLmNyeXB0byBhcyB7IHN1YnRsZT86IHsgZGlnZXN0OiAoYWxnOiBzdHJpbmcsIGRhdGE6IEFycmF5QnVmZmVyKSA9PiBQcm9taXNlPEFycmF5QnVmZmVyPiB9IH07XG4gIGlmIChjcnlwdG8/LnN1YnRsZSkge1xuICAgIGNvbnN0IGJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGlnZXN0KCdTSEEtMjU2JywgbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKGJvZHkpLmJ1ZmZlciBhcyBBcnJheUJ1ZmZlcik7XG4gICAgcmV0dXJuIFsuLi5uZXcgVWludDhBcnJheShidWYpXS5tYXAoKGIpID0+IGIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xuICB9XG4gIHJldHVybiBzeW5jRmFsbGJhY2tIYXNoKGJvZHkpO1xufVxuXG4vKipcbiAqIFx1N0I4MFx1NjYxM1x1NTQwQ1x1NkI2NSBmYWxsYmFja1x1RkYwOFx1OTc1RVx1NTJBMFx1NUJDNlx1N0VBN1x1RkYwQ1x1NEVDNVx1NUY1MyBjcnlwdG8gQVBJIFx1OTBGRFx1NEUwRFx1NTNFRlx1NzUyOFx1NjVGNlx1NzUyOFx1RkYwOVx1MzAwMlxuICogXHU3NTI4IGRqYjIgXHU1M0Q4XHU3OUNEXHVGRjBDXHU0RkREXHU4QkMxXHU0RTAwXHU4MUY0XHU2MDI3XHU1MzczXHU1M0VGXHVGRjA4XHU4RjdCXHU2ODM4XHU5QThDXHU1NzNBXHU2NjZGXHVGRjA5XHUzMDAyXG4gKi9cbmZ1bmN0aW9uIHN5bmNGYWxsYmFja0hhc2goYm9keTogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IGgxID0gMHg4MTFjOWRjNTtcbiAgbGV0IGgyID0gMHgxMDAwMTkzO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGJvZHkubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjID0gYm9keS5jaGFyQ29kZUF0KGkpO1xuICAgIGgxID0gTWF0aC5pbXVsKGgxIF4gYywgMHgwMTAwMDE5Myk7XG4gICAgaDIgPSBNYXRoLmltdWwoaDIgXiAoYyArIDB4OWUzNzc5YjkpLCAweDg1ZWJjYTc3KTtcbiAgfVxuICByZXR1cm4gKGgxID4+PiAwKS50b1N0cmluZygxNikucGFkU3RhcnQoOCwgJzAnKSArIChoMiA+Pj4gMCkudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDgsICcwJykgKyAnX2ZhbGxiYWNrJztcbn1cblxuLyoqXG4gKiBcdTZCRDRcdTVCRjlcdTY2MkZcdTU0MjZcdTUzRDhcdTUzMTZcdTMwMDJcbiAqIEBwYXJhbSBjdXJyZW50IFx1NUY1M1x1NTI0RFx1NkI2M1x1NjU4NyBoYXNoXG4gKiBAcGFyYW0gbGFzdCBcdTRFMEFcdTZCMjFcdTU0MENcdTZCNjVcdTUxOTlcdTUxNjVcdTc2ODQgc3luY19oYXNoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0NoYW5nZWQoY3VycmVudDogc3RyaW5nLCBsYXN0Pzogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmICghbGFzdCkgcmV0dXJuIHRydWU7XG4gIHJldHVybiBjdXJyZW50ICE9PSBsYXN0O1xufVxuIiwgIi8qKlxuICogXHU5OERFXHU0RTY2XHU2ODA3XHU5ODk4IFx1MjE5MiBcdTVCODlcdTUxNjhcdTY1ODdcdTRFRjZcdTU0MERcdTZFMDVcdTZEMTdcdTMwMDJcdTRGOURcdTYzNkUgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3XHU0RThDXHU2QjY1XHU5QUE0IFx1MjQ2MVx1MzAwMlxuICogXHU4REU4XHU1RTczXHU1M0YwXHU5NzVFXHU2Q0Q1XHU1QjU3XHU3QjI2XHVGRjA4V2luZG93cy9tYWNPUy9MaW51eCBcdTVFNzZcdTk2QzZcdUZGMDlcdUZGMUEvIFxcIDogKiA/IFwiIDwgPiB8XG4gKiBcdTRFRTVcdTUzQ0FcdTYzQTdcdTUyMzZcdTVCNTdcdTdCMjZcdTMwMDFcdTk5OTZcdTVDM0VcdTcwQjlcdTUzRjcvXHU3QTdBXHU2ODNDXHVGRjA4V2luZG93cyBcdTc5ODFcdTZCNjJcdUZGMDlcdTMwMDJcbiAqL1xuXG5jb25zdCBJTExFR0FMID0gL1tcXC9cXFxcOio/XCI8PnxdL2c7XG5jb25zdCBDT05UUk9MID0gL1tcXHgwMC1cXHgxZlxceDdmXS9nO1xuXG4vKipcbiAqIFx1NkUwNVx1NkQxN1x1OThERVx1NEU2Nlx1NjgwN1x1OTg5OFx1NEUzQVx1NUI4OVx1NTE2OFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NEUwRFx1NTQyQlx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOVx1MzAwMlxuICogLSBcdTUzQkJcdTk3NUVcdTZDRDVcdTVCNTdcdTdCMjYgXHUyMTkyIFx1NzUyOFx1NEUwQlx1NTIxMlx1N0VCRlx1NjZGRlx1NjM2MlxuICogLSBcdTYyOThcdTUzRTBcdThGREVcdTdFRURcdTdBN0FcdTc2N0RcbiAqIC0gXHU1M0JCXHU5OTk2XHU1QzNFXHU3MEI5XHU1M0Y3L1x1N0E3QVx1NjgzQ1xuICogLSBcdTYyMkFcdTY1QURcdTUyMzAgMTAwIFx1NUI1N1x1N0IyNlx1RkYwOFx1NEZERFx1NzU1OVx1N0YxNlx1NzgwMVx1NTI0RFx1N0YwMFx1N0E3QVx1OTVGNFx1RkYwOVxuICogLSBcdTdBN0FcdTY4MDdcdTk4OThcdTU2REVcdTkwMDBcdTUyMzAgXCJcdTY3MkFcdTU0N0RcdTU0MERcIlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVGaWxlbmFtZSh0aXRsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IHMgPSAodGl0bGUgPz8gJycpLnRyaW0oKTtcbiAgcyA9IHMucmVwbGFjZShJTExFR0FMLCAnXycpLnJlcGxhY2UoQ09OVFJPTCwgJycpO1xuICBzID0gcy5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpO1xuICAvLyBXaW5kb3dzIFx1Nzk4MVx1NkI2Mlx1OTk5Nlx1NUMzRVx1NzBCOVx1NTNGNy9cdTdBN0FcdTY4M0NcbiAgcyA9IHMucmVwbGFjZSgvXltcXC5cXHNdK3xbXFwuXFxzXSskL2csICcnKTtcbiAgaWYgKHMubGVuZ3RoID4gMTAwKSBzID0gcy5zbGljZSgwLCAxMDApLnRyaW0oKTtcbiAgcmV0dXJuIHMgfHwgJ1x1NjcyQVx1NTQ3RFx1NTQwRCc7XG59XG5cbi8qKlxuICogXHU1MkEwIC5tZCBcdTYyNjlcdTVDNTVcdUZGMDhcdTgyRTVcdTVERjJcdTY3MDlcdTVDMzFcdTRFMERcdTkxQ0RcdTU5MERcdTUyQTBcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhNZEV4dChuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpLmVuZHNXaXRoKCcubWQnKSA/IG5hbWUgOiBgJHtuYW1lfS5tZGA7XG59XG5cbi8qKlxuICogXHU2MkZDXHU2M0E1XHU3NkVFXHU1RjU1XHU0RTBFXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU1OTA0XHU3NDA2XHU2NTlDXHU2NzYwXHVGRjA5XHUzMDAyXG4gKiBAcGFyYW0gZGlyIFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdTc2ODRcdTc2RUVcdTVGNTVcdUZGMENcdTU5ODIgXCIwXHVGRTBGXHUyMEUzXHU4RjkzXHU1MTY1L1x1RDgzRFx1RENBMVx1Nzg4RVx1NzI0N1x1OEY5M1x1NTE2NVwiXG4gKiBAcGFyYW0gZmlsZW5hbWUgXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU1NDJCXHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBqb2luUGF0aChkaXI6IHN0cmluZyB8IHVuZGVmaW5lZCwgZmlsZW5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICghZGlyIHx8IGRpciA9PT0gJy4nIHx8IGRpciA9PT0gJy8nKSByZXR1cm4gZmlsZW5hbWU7XG4gIGNvbnN0IGQgPSBkaXIucmVwbGFjZSgvW1xcL1xcXFxdKyQvLCAnJykucmVwbGFjZSgvXltcXC9cXFxcXSsvLCAnJyk7XG4gIHJldHVybiBkID8gYCR7ZH0vJHtmaWxlbmFtZX1gIDogZmlsZW5hbWU7XG59XG4iLCAiLyoqXG4gKiBcdTU2RkVcdTcyNDcgdG9rZW4gXHU1OTA0XHU3NDA2XHUzMDAyXHU0RjlEXHU2MzZFIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgIFx1MDBBNzMuMyArIGAwM19cdTY4M0NcdTVGMEZcdTg5QzRcdTgzMDMubWRgIFx1MDBBN1x1NTE2RFx1MzAwMlxuICpcbiAqIFx1OThERVx1NEU2Nlx1NUJGQ1x1NTFGQVx1NzY4NFx1NTZGRVx1NzI0N1x1OTRGRVx1NjNBNVx1NUY2Mlx1NjAwMVx1RkYxQVxuICogICAtIG1kIFx1NUJGQ1x1NTFGQVx1RkYxQWAhW10oaHR0cHM6Ly9pbnRlcm5hbC1hcGktZHJpdmUtc3RyZWFtLmZlaXNodS5jbi8uLi4vYXV0aGNvZGU9Li4uKWBcdUZGMDhcdTk3MDBcdTc2N0JcdTVGNTVcdTYwMDFcdUZGMEMxaCBcdThGQzdcdTY3MUZcdUZGMDlcbiAqICAgLSB4bWwgXHU1QkZDXHU1MUZBXHVGRjFBYDxpbWcgc3JjPVwiRklMRV9UT0tFTlwiIGhyZWY9XCJhdXRoY29kZV91cmxcIi8+YFx1RkYwOEZJTEVfVE9LRU4gXHU2QzM4XHU0RTQ1XHU0RTBEXHU4RkM3XHU2NzFGXHVGRjA5XG4gKlxuICogT0IgXHU5MUNDXHU3RURGXHU0RTAwXHU1MTk5XHU2MjEwXHVGRjFBYCFbXShmZWlzaHU6Ly9GSUxFX1RPS0VOKWBcbiAqIFx1OTg4NFx1ODlDOFx1NjVGNlx1NzUzMSBPQiBcdTYzRDJcdTRFRjZcdThDMDMgYGxhcmstY2xpIGRvY3MgK21lZGlhLWRvd25sb2FkYCBcdTYzNjJcdTRFMzRcdTY1RjZcdTk0RkVcdTYzQTVcdTMwMDJcbiAqL1xuXG4vKiogT0IgXHU0RkE3XHU1NkZFXHU3MjQ3XHU1RjE1XHU3NTI4XHU1MzRGXHU4QkFFXHU1MjREXHU3RjAwXHUzMDAyICovXG5leHBvcnQgY29uc3QgRkVJU0hVX1BST1RPID0gJ2ZlaXNodTovLyc7XG5cbi8qKiBcdTk4REVcdTRFNjYgaW50ZXJuYWwtYXBpIFx1NTZGRVx1NzI0N1x1NTdERlx1NTQwRFx1RkYwOFx1OEJDNlx1NTIyQlx1OTcwMFx1NzY3Qlx1NUY1NVx1NjAwMVx1NzY4NFx1NEUzNFx1NjVGNlx1OTRGRVx1NjNBNVx1RkYwOVx1MzAwMiAqL1xuY29uc3QgSU5URVJOQUxfQVBJX0hPU1QgPSAnaW50ZXJuYWwtYXBpLWRyaXZlLXN0cmVhbS5mZWlzaHUuY24nO1xuY29uc3QgSU5URVJOQUxfQVBJX0hPU1RfTEFSSyA9ICdpbnRlcm5hbC1hcGktZHJpdmUtc3RyZWFtLmxhcmtzdWl0ZS5jb20nO1xuXG4vKiogZmlsZV90b2tlbiBcdTY4M0NcdTVGMEZcdUZGMUFcdTk4REVcdTRFNjYgdG9rZW4gXHU2NjJGIGJhc2U2Mi1pc2hcdUZGMENcdTk1N0ZcdTVFQTYgfjI4XHUzMDAyICovXG5jb25zdCBUT0tFTl9SRSA9IC9bQS1aYS16MC05XXsyMCx9LztcblxuLyoqXG4gKiBcdTRFQ0VcdTk4REVcdTRFNjYgaW50ZXJuYWwtYXBpIGF1dGhjb2RlIFVSTCBcdTkxQ0NcdTYzRDBcdTUzRDYgZmlsZV90b2tlblx1MzAwMlxuICogVVJMIFx1NUY2Mlx1NTk4MiBgaHR0cHM6Ly9pbnRlcm5hbC1hcGktZHJpdmUtc3RyZWFtLmZlaXNodS5jbi9kcml2ZS1zdHJlYW0vPFRPS0VOPi88ZXh0cmE+P2F1dGhjb2RlPS4uLmBcbiAqIFx1NTNENlx1OERFRlx1NUY4NFx1NkJCNVx1NEUyRFx1NjcwMFx1OTU3Rlx1NzY4NCB0b2tlbi1saWtlIFx1NUI1MFx1NEUzMlx1MzAwMlxuICogQHJldHVybnMgdG9rZW4gXHU2MjE2IG51bGxcdUZGMDhcdTY1RTBcdTZDRDVcdThCQzZcdTUyMkJcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RUb2tlbkZyb21BdXRoY29kZVVybCh1cmw6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBpZiAoIXVybCkgcmV0dXJuIG51bGw7XG4gIGxldCB1OiBVUkw7XG4gIHRyeSB7XG4gICAgdSA9IG5ldyBVUkwodXJsKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgaG9zdCA9IHUuaG9zdG5hbWU7XG4gIGlmIChob3N0ICE9PSBJTlRFUk5BTF9BUElfSE9TVCAmJiBob3N0ICE9PSBJTlRFUk5BTF9BUElfSE9TVF9MQVJLKSByZXR1cm4gbnVsbDtcbiAgY29uc3Qgc2VnbWVudHMgPSB1LnBhdGhuYW1lLnNwbGl0KCcvJykuZmlsdGVyKEJvb2xlYW4pO1xuICBsZXQgYmVzdDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIGZvciAoY29uc3Qgc2VnIG9mIHNlZ21lbnRzKSB7XG4gICAgY29uc3QgbSA9IHNlZy5tYXRjaChUT0tFTl9SRSk7XG4gICAgaWYgKG0gJiYgKCFiZXN0IHx8IG1bMF0ubGVuZ3RoID4gYmVzdC5sZW5ndGgpKSBiZXN0ID0gbVswXTtcbiAgfVxuICByZXR1cm4gYmVzdDtcbn1cblxuLyoqXG4gKiBcdTYyOEEgbWQgXHU2QjYzXHU2NTg3XHU5MUNDXHU3Njg0IGludGVybmFsLWFwaSBhdXRoY29kZSBcdTU2RkVcdTcyNDdcdTk0RkVcdTYzQTVcdTY2RkZcdTYzNjJcdTRFM0EgYGZlaXNodTovL1RPS0VOYFx1MzAwMlxuICogXHU2M0QwXHU0RjlCXHU0RTAwXHU0RTJBIHRva2VuIFx1NjYyMFx1NUMwNFx1ODg2OFx1RkYwOHhtbCBcdTVCRkNcdTUxRkFcdTYyRkZcdTUyMzBcdTc2ODQgc3JjIHRva2VuIFx1MjE5MiBocmVmIFx1NTNFRlx1ODBGRFx1NTQyQlx1NTQwQyB0b2tlblx1RkYwOVx1MzAwMlxuICogXHU1QkY5XHU2MjdFXHU0RTBEXHU1MjMwXHU2NjIwXHU1QzA0XHU3Njg0IGF1dGhjb2RlIFVSTFx1RkYwQ1x1NUMxRFx1OEJENVx1NUMzMVx1NTczMCBleHRyYWN0XHUzMDAyXG4gKlxuICogQHBhcmFtIG1kIFx1NkI2M1x1NjU4NyBtYXJrZG93blxuICogQHBhcmFtIHRva2VuTWFwIHhtbCBcdTVCRkNcdTUxRkFcdTYyRkZcdTUyMzBcdTc2ODQgZmlsZV90b2tlbiBcdTk2QzZcdTU0MDhcdUZGMDhcdTc1MjhcdTRFOEVcdTdDQkVcdTc4NkVcdTUzMzlcdTkxNERcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJld3JpdGVJbWFnZXNUb0ZlaXNodVByb3RvKFxuICBtZDogc3RyaW5nLFxuICB0b2tlbk1hcDogU2V0PHN0cmluZz4gfCBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IFNldCgpLFxuKTogc3RyaW5nIHtcbiAgLy8gXHU1MzM5XHU5MTREICFbYWx0XSh1cmwpIFx1NUY2Mlx1NUYwRlx1NzY4NFx1NTZGRVx1NzI0N1x1RkYwQ3VybCBcdTY2MkYgaW50ZXJuYWwtYXBpIFx1OTRGRVx1NjNBNVxuICBjb25zdCBpbWdSZSA9IC8hXFxbKFteXFxdXSopXFxdXFwoKFteKV0rKVxcKS9nO1xuICByZXR1cm4gbWQucmVwbGFjZShpbWdSZSwgKGZ1bGwsIGFsdDogc3RyaW5nLCB1cmw6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHRyaW1tZWQgPSB1cmwudHJpbSgpLnJlcGxhY2UoL148fD4kL2csICcnKTtcbiAgICAvLyBcdTVERjJcdTdFQ0ZcdTY2MkYgZmVpc2h1Oi8vIFx1NTM0Rlx1OEJBRVx1RkYwQ1x1OERGM1x1OEZDN1xuICAgIGlmICh0cmltbWVkLnN0YXJ0c1dpdGgoRkVJU0hVX1BST1RPKSkgcmV0dXJuIGZ1bGw7XG4gICAgLy8gaW50ZXJuYWwtYXBpIFx1OTRGRVx1NjNBNVx1RkYxQVx1NjNEMCB0b2tlblxuICAgIGlmIChcbiAgICAgIHRyaW1tZWQuaW5jbHVkZXMoSU5URVJOQUxfQVBJX0hPU1QpIHx8XG4gICAgICB0cmltbWVkLmluY2x1ZGVzKElOVEVSTkFMX0FQSV9IT1NUX0xBUkspXG4gICAgKSB7XG4gICAgICBjb25zdCB0b2tlbiA9IHBpY2tFeGFjdFRva2VuKHRva2VuTWFwLCB0cmltbWVkKSA/PyBleHRyYWN0VG9rZW5Gcm9tQXV0aGNvZGVVcmwodHJpbW1lZCkgPz8gcGlja0Zyb21NYXAodG9rZW5NYXApO1xuICAgICAgaWYgKHRva2VuKSByZXR1cm4gYCFbJHthbHR9XSgke0ZFSVNIVV9QUk9UT30ke3Rva2VufSlgO1xuICAgIH1cbiAgICAvLyBcdTY2NkVcdTkwMUFcdTU5MTZcdTk0RkVcdTYyMTYgYmFzZTY0XHVGRjBDXHU1MzlGXHU2ODM3XHU0RkREXHU3NTU5XG4gICAgcmV0dXJuIGZ1bGw7XG4gIH0pO1xufVxuXG4vKiogXHU0RUNFIHRva2VuTWFwIFx1OTFDQ1x1NTNENlx1NEUwMFx1NEUyQVx1RkYwOGZhbGxiYWNrXHVGRjBDXHU3NTI4XHU0RThFXHU5ODdBXHU1RThGXHU1MzM5XHU5MTREXHU1NzNBXHU2NjZGXHVGRjBDXHU4QzAzXHU3NTI4XHU2NUI5XHU1RTk0XHU0RjE4XHU1MTQ4XHU3Q0JFXHU3ODZFXHU1MzM5XHU5MTREXHVGRjA5XHUzMDAyICovXG5mdW5jdGlvbiBwaWNrRnJvbU1hcCh0b2tlbk1hcDogU2V0PHN0cmluZz4gfCBNYXA8c3RyaW5nLCBzdHJpbmc+KTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmICh0b2tlbk1hcCBpbnN0YW5jZW9mIE1hcCkgcmV0dXJuIG51bGw7XG4gIGlmICh0b2tlbk1hcC5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIHRva2VuTWFwLnZhbHVlcygpLm5leHQoKS52YWx1ZSA/PyBudWxsO1xufVxuXG5mdW5jdGlvbiBwaWNrRXhhY3RUb2tlbih0b2tlbk1hcDogU2V0PHN0cmluZz4gfCBNYXA8c3RyaW5nLCBzdHJpbmc+LCB1cmw6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBpZiAoISh0b2tlbk1hcCBpbnN0YW5jZW9mIE1hcCkpIHJldHVybiBudWxsO1xuICByZXR1cm4gdG9rZW5NYXAuZ2V0KHVybCkgPz8gdG9rZW5NYXAuZ2V0KHVybC5yZXBsYWNlKC8mYW1wOy9nLCAnJicpKSA/PyBudWxsO1xufVxuXG4vKipcbiAqIFx1NEVDRSB4bWwgXHU5MUNDXHU2M0QwXHU1M0Q2XHU2MjQwXHU2NzA5IGA8aW1nIHNyYz1cIlRPS0VOXCIgLi4uLz5gIFx1NzY4NCBmaWxlX3Rva2VuXHUzMDAyXG4gKiBcdTk4REVcdTRFNjYgeG1sIFx1NzY4NCBzcmMgXHU3NkY0XHU2M0E1XHU1QzMxXHU2NjJGIGZpbGVfdG9rZW5cdUZGMDhcdTRFMERcdTY2MkYgVVJMXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0SW1nVG9rZW5zRnJvbVhtbCh4bWw6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgY29uc3QgdG9rZW5zID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IGltZ1JlID0gLzxpbWdcXGJbXj5dKlxcYnNyYz1bXCInXShbXlwiJ10rKVtcIiddW14+XSpcXC8/Pi9nO1xuICBsZXQgbTogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcbiAgd2hpbGUgKChtID0gaW1nUmUuZXhlYyh4bWwpKSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IHNyYyA9IG1bMV0udHJpbSgpO1xuICAgIGlmIChzcmMuc3RhcnRzV2l0aChGRUlTSFVfUFJPVE8pKSB7XG4gICAgICB0b2tlbnMuYWRkKHNyYy5zbGljZShGRUlTSFVfUFJPVE8ubGVuZ3RoKSk7XG4gICAgfSBlbHNlIGlmIChUT0tFTl9SRS50ZXN0KHNyYykgJiYgIXNyYy5zdGFydHNXaXRoKCdodHRwJykpIHtcbiAgICAgIHRva2Vucy5hZGQoc3JjKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFsuLi50b2tlbnNdO1xufVxuXG4vKipcbiAqIFx1NEVDRVx1OThERVx1NEU2NiBYTUwgXHU2M0QwXHU1M0Q2IGBocmVmIFx1NEUzNFx1NjVGNlx1NTZGRVx1OTRGRSAtPiBzcmMgZmlsZV90b2tlbmAgXHU2NjIwXHU1QzA0XHUzMDAyXG4gKiBtYXJrZG93biBcdTVCRkNcdTUxRkFcdTUzRUFcdTdFRDlcdTRFMzRcdTY1RjYgYXV0aGNvZGUgVVJMXHVGRjFCWE1MIFx1NzY4NCBzcmMgXHU2MjREXHU2NjJGXHU1M0VGXHU5NTdGXHU2NzFGXHU0RkREXHU1QjU4XHU3Njg0IGZpbGVfdG9rZW5cdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RJbWdUb2tlbk1hcEZyb21YbWwoeG1sOiBzdHJpbmcpOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgY29uc3QgbWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgY29uc3QgaW1nUmUgPSAvPGltZ1xcYltePl0qPi9nO1xuICBsZXQgbTogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcbiAgd2hpbGUgKChtID0gaW1nUmUuZXhlYyh4bWwpKSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IHRhZyA9IG1bMF07XG4gICAgY29uc3Qgc3JjID0gYXR0cih0YWcsICdzcmMnKTtcbiAgICBjb25zdCBocmVmID0gYXR0cih0YWcsICdocmVmJyk7XG4gICAgaWYgKCFzcmMgfHwgIWhyZWYgfHwgc3JjLnN0YXJ0c1dpdGgoJ2h0dHAnKSkgY29udGludWU7XG4gICAgaWYgKCFUT0tFTl9SRS50ZXN0KHNyYykpIGNvbnRpbnVlO1xuICAgIG1hcC5zZXQoZGVjb2RlWG1sQXR0cihocmVmKSwgc3JjKTtcbiAgfVxuICByZXR1cm4gbWFwO1xufVxuXG5mdW5jdGlvbiBhdHRyKHRhZzogc3RyaW5nLCBuYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKGBcXFxcYiR7bmFtZX09W1wiJ10oW15cIiddKylbXCInXWApO1xuICByZXR1cm4gdGFnLm1hdGNoKHJlKT8uWzFdID8/IG51bGw7XG59XG5cbmZ1bmN0aW9uIGRlY29kZVhtbEF0dHIodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB2YWx1ZVxuICAgIC5yZXBsYWNlKC8mYW1wOy9nLCAnJicpXG4gICAgLnJlcGxhY2UoLyZxdW90Oy9nLCAnXCInKVxuICAgIC5yZXBsYWNlKC8mYXBvczsvZywgXCInXCIpXG4gICAgLnJlcGxhY2UoLyZsdDsvZywgJzwnKVxuICAgIC5yZXBsYWNlKC8mZ3Q7L2csICc+Jyk7XG59XG5cbi8qKlxuICogXHU0RUNFIG1kIFx1NkI2M1x1NjU4N1x1OTFDQ1x1NjNEMFx1NTNENlx1NjI0MFx1NjcwOSBmZWlzaHU6Ly9UT0tFTlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEZlaXNodUltYWdlVG9rZW5zKG1kOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IHRva2VucyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCByZSA9IG5ldyBSZWdFeHAoXG4gICAgYCFcXFxcW1teXFxcXF1dKlxcXFxdXFxcXCgke0ZFSVNIVV9QUk9UTy5yZXBsYWNlKCcvJywgJ1xcXFwvJyl9KFtBLVphLXowLTldKylcXFxcKWAsXG4gICAgJ2cnLFxuICApO1xuICBsZXQgbTogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcbiAgd2hpbGUgKChtID0gcmUuZXhlYyhtZCkpICE9PSBudWxsKSB7XG4gICAgdG9rZW5zLmFkZChtWzFdKTtcbiAgfVxuICByZXR1cm4gWy4uLnRva2Vuc107XG59XG5cbi8qKlxuICogXHU2MjhBIE9CIFx1NkI2M1x1NjU4N1x1OTFDQ1x1NzY4NCBgIVtdKGZlaXNodTovL1RPS0VOKWAgXHU4RkQ4XHU1MzlGXHU0RTNBXHU5OERFXHU0RTY2IHhtbCBgPGltZyBzcmM9XCJUT0tFTlwiLz5gXHUzMDAyXG4gKiBcdTc1MjhcdTRFOEUgT0JcdTIxOTJcdTk4REVcdTRFNjZcdTU2REVcdTUxOTlcdUZGMDhtZCBcdTkwRThcdTUyMDZcdTc1MjggbWFya2Rvd25cdUZGMENcdTU2RkVcdTcyNDdcdTk3MDBcdTc1MjggeG1sIFx1NjgwN1x1N0I3RVx1NjI0RFx1ODBGRFx1ODhBQlx1OThERVx1NEU2Nlx1OEJDNlx1NTIyQlx1NEUzQVx1NURGMlx1NjcwOSB0b2tlblx1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmVpc2h1UHJvdG9Ub1htbChtZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgcmUgPSAvIVxcWyhbXlxcXV0qKVxcXVxcKGZlaXNodTpcXC9cXC8oW0EtWmEtejAtOV0rKVxcKS9nO1xuICByZXR1cm4gbWQucmVwbGFjZShyZSwgKF9mdWxsLCBfYWx0OiBzdHJpbmcsIHRva2VuOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gYDxpbWcgc3JjPVwiJHt0b2tlbn1cIi8+YDtcbiAgfSk7XG59XG4iLCAiY29uc3QgTk9UX1JFU09MVkVEOiB1bmlxdWUgc3ltYm9sID0gU3ltYm9sKCdOT1RfUkVTT0xWRUQnKVxuY29uc3QgTUVSR0VfS0VZOiB1bmlxdWUgc3ltYm9sID0gU3ltYm9sKCdNRVJHRV9LRVknKVxuXG50eXBlIFNjYWxhclJlcHJlc2VudCA9IChkYXRhOiBhbnkpID0+IHN0cmluZ1xudHlwZSBTZXF1ZW5jZVJlcHJlc2VudCA9IChkYXRhOiBhbnkpID0+IEFycmF5TGlrZTx1bmtub3duPlxudHlwZSBNYXBwaW5nUmVwcmVzZW50ID0gKGRhdGE6IGFueSkgPT4gTWFwPHVua25vd24sIHVua25vd24+XG5cbnR5cGUgSWRlbnRpZnlGbiA9IChkYXRhOiBhbnkpID0+IGJvb2xlYW5cbnR5cGUgUmVwcmVzZW50VGFnTmFtZUZuID0gKGRhdGE6IGFueSkgPT4gc3RyaW5nXG5cbmludGVyZmFjZSBTY2FsYXJUYWdEZWZpbml0aW9uPFJlc3VsdCA9IHVua25vd24+IHtcbiAgdGFnTmFtZTogc3RyaW5nXG4gIG5vZGVLaW5kOiAnc2NhbGFyJ1xuICBpbXBsaWNpdDogYm9vbGVhblxuICBtYXRjaEJ5VGFnUHJlZml4OiBib29sZWFuXG4gIC8vIFNldCBvZiBgc291cmNlLmNoYXJBdCgwKWAga2V5cyBmb3Igd2hpY2ggYHJlc29sdmVgIG1heSBzdWNjZWVkIChhIHN1cGVyc2V0IG9mXG4gIC8vIHdoYXQgaXQgcmVhbGx5IG1hdGNoZXMpLiBBIGtleSBpcyBlaXRoZXIgYSBzaW5nbGUgY2hhcmFjdGVyIG9yICcnIChlbXB0eVxuICAvLyBzb3VyY2UpLiBgbnVsbGAgbWVhbnMgXCJubyBjb25zdHJhaW50LCBhbHdheXMgdHJ5XCIuIFVzZWQgYnkgdGhlIGNvbXBvc2VyIHRvXG4gIC8vIGRpc3BhdGNoIGltcGxpY2l0IHNjYWxhcnMgYnkgZmlyc3QgY2hhcmFjdGVyIHdpdGhvdXQgcnVubmluZyBldmVyeSByZXNvbHZlci5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiByZWFkb25seSBzdHJpbmdbXSB8IG51bGxcbiAgLy8gYGlzRXhwbGljaXRgIGlzIHRydWUgZm9yIGFuIGV4cGxpY2l0IHRhZyAoYCEhdGFnYCksIGZhbHNlIGZvciBpbXBsaWNpdCBwbGFpblxuICAvLyBzY2FsYXIgcmVzb2x1dGlvbi5cbiAgcmVzb2x2ZTogKHNvdXJjZTogc3RyaW5nLCBpc0V4cGxpY2l0OiBib29sZWFuLCB0YWdOYW1lOiBzdHJpbmcpID0+IFJlc3VsdCB8IHR5cGVvZiBOT1RfUkVTT0xWRURcbiAgaWRlbnRpZnk6IElkZW50aWZ5Rm4gfCBudWxsXG4gIC8vIEEgc2NhbGFyJ3MgcHJpbnRlZCBmb3JtIGlzIHRleHQsIHNvIGByZXByZXNlbnRgIGFsd2F5cyB5aWVsZHMgYSBzdHJpbmcuIFRoZVxuICAvLyBmYWN0b3J5IHN1cHBsaWVzIGEgYFN0cmluZyhkYXRhKWAgZGVmYXVsdCB3aGVuIGEgdGFnIG9taXRzIGl0LlxuICByZXByZXNlbnQ6IFNjYWxhclJlcHJlc2VudFxuICByZXByZXNlbnRUYWdOYW1lOiBSZXByZXNlbnRUYWdOYW1lRm4gfCBudWxsXG59XG5cbmludGVyZmFjZSBTZXF1ZW5jZVRhZ0RlZmluaXRpb248Q2FycmllciA9IHVua25vd24sIFJlc3VsdCA9IENhcnJpZXI+IHtcbiAgdGFnTmFtZTogc3RyaW5nXG4gIG5vZGVLaW5kOiAnc2VxdWVuY2UnXG4gIGltcGxpY2l0OiBmYWxzZVxuICBtYXRjaEJ5VGFnUHJlZml4OiBib29sZWFuXG4gIGNyZWF0ZTogKHRhZ05hbWU6IHN0cmluZykgPT4gQ2FycmllclxuICBhZGRJdGVtOiAoY2FycmllcjogQ2FycmllciwgaXRlbTogdW5rbm93biwgaW5kZXg6IG51bWJlcikgPT4gdm9pZCB8IHN0cmluZ1xuICBmaW5hbGl6ZTogKGNhcnJpZXI6IENhcnJpZXIpID0+IFJlc3VsdFxuICBjYXJyaWVySXNSZXN1bHQ6IGJvb2xlYW5cbiAgaWRlbnRpZnk6IElkZW50aWZ5Rm4gfCBudWxsXG4gIHJlcHJlc2VudDogU2VxdWVuY2VSZXByZXNlbnRcbiAgcmVwcmVzZW50VGFnTmFtZTogUmVwcmVzZW50VGFnTmFtZUZuIHwgbnVsbFxufVxuXG5pbnRlcmZhY2UgTWFwcGluZ1RhZ0RlZmluaXRpb248Q2FycmllciA9IHVua25vd24sIFJlc3VsdCA9IENhcnJpZXI+IHtcbiAgdGFnTmFtZTogc3RyaW5nXG4gIG5vZGVLaW5kOiAnbWFwcGluZydcbiAgaW1wbGljaXQ6IGZhbHNlXG4gIG1hdGNoQnlUYWdQcmVmaXg6IGJvb2xlYW5cbiAgY3JlYXRlOiAodGFnTmFtZTogc3RyaW5nKSA9PiBDYXJyaWVyXG4gIC8vIFdyaXRlcyBhIHBhaXIuIFJldHVybnMgJycgb24gc3VjY2VzcywgYSBub24tZW1wdHkgZXJyb3IgbWVzc2FnZSBvdGhlcndpc2VcbiAgLy8gKGtleSBkb2VzIG5vdCBmaXQgdGhlIHJlcHJlc2VudGF0aW9uLCB2YWx1ZSByZWplY3RlZCwgLi4uKS4gQWx3YXlzIGEgc3RyaW5nXG4gIC8vIHNvIHRoZSBob3QgcGF0aCBuZXZlciBhbGxvY2F0ZXMgYW4gZXhjZXB0aW9uIHdyYXBwZXIuXG4gIGFkZFBhaXI6IChjYXJyaWVyOiBDYXJyaWVyLCBrZXk6IHVua25vd24sIHZhbHVlOiB1bmtub3duKSA9PiBzdHJpbmdcbiAgLy8gUmVhZCBzaWRlLCBtaXJyb3JzIGBNYXBgIOKAlCBkZWZpbmluZyBhIHJlcHJlc2VudGF0aW9uIG1lYW5zIGRlZmluaW5nIGhvdyB0b1xuICAvLyByZWFkIGl0IGJhY2suIGBoYXNgIGlzIHRoZSBob3QgZGVkdXAgcHJvYmUgKG1lbWJlcnNoaXAgd2l0aG91dCBmZXRjaGluZyB0aGVcbiAgLy8gdmFsdWUpOyBga2V5c2AvYGdldGAgYXJlIHVzZWQgb25seSBvbiB0aGUgY29sZCBtZXJnZSBwYXRoIChgPDxgKS5cbiAgaGFzOiAoY2FycmllcjogQ2Fycmllciwga2V5OiB1bmtub3duKSA9PiBib29sZWFuXG4gIGtleXM6IChyZXN1bHQ6IFJlc3VsdCkgPT4gSXRlcmFibGU8dW5rbm93bj5cbiAgZ2V0OiAocmVzdWx0OiBSZXN1bHQsIGtleTogdW5rbm93bikgPT4gdW5rbm93blxuICBmaW5hbGl6ZTogKGNhcnJpZXI6IENhcnJpZXIpID0+IFJlc3VsdFxuICBjYXJyaWVySXNSZXN1bHQ6IGJvb2xlYW5cbiAgaWRlbnRpZnk6IElkZW50aWZ5Rm4gfCBudWxsXG4gIHJlcHJlc2VudDogTWFwcGluZ1JlcHJlc2VudFxuICByZXByZXNlbnRUYWdOYW1lOiBSZXByZXNlbnRUYWdOYW1lRm4gfCBudWxsXG59XG5cbnR5cGUgVGFnRGVmaW5pdGlvbiA9XG4gIHwgU2NhbGFyVGFnRGVmaW5pdGlvbjxhbnk+XG4gIHwgU2VxdWVuY2VUYWdEZWZpbml0aW9uPGFueSwgYW55PlxuICB8IE1hcHBpbmdUYWdEZWZpbml0aW9uPGFueSwgYW55PlxuXG5pbnRlcmZhY2UgU2NhbGFyVGFnT3B0aW9uczxSZXN1bHQ+IHtcbiAgaW1wbGljaXQ/OiBib29sZWFuXG4gIG1hdGNoQnlUYWdQcmVmaXg/OiBib29sZWFuXG4gIGltcGxpY2l0Rmlyc3RDaGFycz86IHJlYWRvbmx5IHN0cmluZ1tdIHwgbnVsbFxuICByZXNvbHZlOiBTY2FsYXJUYWdEZWZpbml0aW9uPFJlc3VsdD5bJ3Jlc29sdmUnXVxuICBpZGVudGlmeT86IFNjYWxhclRhZ0RlZmluaXRpb248UmVzdWx0PlsnaWRlbnRpZnknXVxuICByZXByZXNlbnQ/OiBTY2FsYXJUYWdEZWZpbml0aW9uPFJlc3VsdD5bJ3JlcHJlc2VudCddXG4gIHJlcHJlc2VudFRhZ05hbWU/OiBTY2FsYXJUYWdEZWZpbml0aW9uPFJlc3VsdD5bJ3JlcHJlc2VudFRhZ05hbWUnXVxufVxuXG50eXBlIFJlcHJlc2VudE9wdGlvbnM8Q29udGFpbmVyLCBDYW5vbmljYWwsIFJlcHJlc2VudD4gPVxuICB8IHtcbiAgICAgIGlkZW50aWZ5PzogbnVsbFxuICAgICAgcmVwcmVzZW50PzogUmVwcmVzZW50XG4gICAgICByZXByZXNlbnRUYWdOYW1lPzogUmVwcmVzZW50VGFnTmFtZUZuIHwgbnVsbFxuICAgIH1cbiAgfCAoQ29udGFpbmVyIGV4dGVuZHMgQ2Fub25pY2FsXG4gICAgICA/IHtcbiAgICAgICAgICBpZGVudGlmeT86IElkZW50aWZ5Rm4gfCBudWxsXG4gICAgICAgICAgcmVwcmVzZW50PzogUmVwcmVzZW50XG4gICAgICAgICAgcmVwcmVzZW50VGFnTmFtZT86IFJlcHJlc2VudFRhZ05hbWVGbiB8IG51bGxcbiAgICAgICAgfVxuICAgICAgOiB7XG4gICAgICAgICAgaWRlbnRpZnk6IElkZW50aWZ5Rm5cbiAgICAgICAgICByZXByZXNlbnQ6IFJlcHJlc2VudFxuICAgICAgICAgIHJlcHJlc2VudFRhZ05hbWU/OiBSZXByZXNlbnRUYWdOYW1lRm4gfCBudWxsXG4gICAgICAgIH0pXG5cbnR5cGUgU2VxdWVuY2VUYWdPcHRpb25zPENhcnJpZXIsIFJlc3VsdCA9IENhcnJpZXI+ID0ge1xuICBtYXRjaEJ5VGFnUHJlZml4PzogYm9vbGVhblxuICBjcmVhdGU6IFNlcXVlbmNlVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+WydjcmVhdGUnXVxuICBhZGRJdGVtOiBTZXF1ZW5jZVRhZ0RlZmluaXRpb248Q2FycmllciwgUmVzdWx0PlsnYWRkSXRlbSddXG4gIGZpbmFsaXplPzogU2VxdWVuY2VUYWdEZWZpbml0aW9uPENhcnJpZXIsIFJlc3VsdD5bJ2ZpbmFsaXplJ11cbn0gJiBSZXByZXNlbnRPcHRpb25zPFJlc3VsdCwgQXJyYXlMaWtlPHVua25vd24+LCBTZXF1ZW5jZVJlcHJlc2VudD5cblxudHlwZSBNYXBwaW5nVGFnT3B0aW9uczxDYXJyaWVyLCBSZXN1bHQgPSBDYXJyaWVyPiA9IHtcbiAgbWF0Y2hCeVRhZ1ByZWZpeD86IGJvb2xlYW5cbiAgY3JlYXRlOiBNYXBwaW5nVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+WydjcmVhdGUnXVxuICBhZGRQYWlyOiBNYXBwaW5nVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+WydhZGRQYWlyJ11cbiAgaGFzOiBNYXBwaW5nVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+WydoYXMnXVxuICBrZXlzOiBNYXBwaW5nVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+WydrZXlzJ11cbiAgZ2V0OiBNYXBwaW5nVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+WydnZXQnXVxuICBmaW5hbGl6ZT86IE1hcHBpbmdUYWdEZWZpbml0aW9uPENhcnJpZXIsIFJlc3VsdD5bJ2ZpbmFsaXplJ11cbn0gJiBSZXByZXNlbnRPcHRpb25zPFJlc3VsdCwgTWFwPHVua25vd24sIHVua25vd24+LCBNYXBwaW5nUmVwcmVzZW50PlxuXG5mdW5jdGlvbiBkZWZpbmVTY2FsYXJUYWc8UmVzdWx0PiAodGFnTmFtZTogc3RyaW5nLCBvcHRpb25zOiBTY2FsYXJUYWdPcHRpb25zPFJlc3VsdD4pOiBTY2FsYXJUYWdEZWZpbml0aW9uPFJlc3VsdD4ge1xuICByZXR1cm4ge1xuICAgIHRhZ05hbWUsXG4gICAgbm9kZUtpbmQ6ICdzY2FsYXInLFxuICAgIGltcGxpY2l0OiBvcHRpb25zLmltcGxpY2l0ID8/IGZhbHNlLFxuICAgIG1hdGNoQnlUYWdQcmVmaXg6IG9wdGlvbnMubWF0Y2hCeVRhZ1ByZWZpeCA/PyBmYWxzZSxcbiAgICBpbXBsaWNpdEZpcnN0Q2hhcnM6IG9wdGlvbnMuaW1wbGljaXRGaXJzdENoYXJzID8/IG51bGwsXG4gICAgcmVzb2x2ZTogb3B0aW9ucy5yZXNvbHZlLFxuICAgIGlkZW50aWZ5OiBvcHRpb25zLmlkZW50aWZ5ID8/IG51bGwsXG4gICAgcmVwcmVzZW50OiBvcHRpb25zLnJlcHJlc2VudCA/PyAoZGF0YSA9PiBTdHJpbmcoZGF0YSkpLFxuICAgIHJlcHJlc2VudFRhZ05hbWU6IG9wdGlvbnMucmVwcmVzZW50VGFnTmFtZSA/PyBudWxsXG4gIH1cbn1cblxuZnVuY3Rpb24gZGVmaW5lU2VxdWVuY2VUYWc8Q2FycmllciwgUmVzdWx0ID0gQ2Fycmllcj4gKHRhZ05hbWU6IHN0cmluZywgb3B0aW9uczogU2VxdWVuY2VUYWdPcHRpb25zPENhcnJpZXIsIFJlc3VsdD4pOiBTZXF1ZW5jZVRhZ0RlZmluaXRpb248Q2FycmllciwgUmVzdWx0PiB7XG4gIGNvbnN0IGNhcnJpZXJJc1Jlc3VsdCA9IG9wdGlvbnMuZmluYWxpemUgPT09IHVuZGVmaW5lZFxuXG4gIHJldHVybiB7XG4gICAgdGFnTmFtZSxcbiAgICBub2RlS2luZDogJ3NlcXVlbmNlJyxcbiAgICBpbXBsaWNpdDogZmFsc2UsXG4gICAgbWF0Y2hCeVRhZ1ByZWZpeDogb3B0aW9ucy5tYXRjaEJ5VGFnUHJlZml4ID8/IGZhbHNlLFxuICAgIGNyZWF0ZTogb3B0aW9ucy5jcmVhdGUsXG4gICAgYWRkSXRlbTogb3B0aW9ucy5hZGRJdGVtLFxuICAgIGZpbmFsaXplOiBvcHRpb25zLmZpbmFsaXplID8/IChjYXJyaWVyID0+IGNhcnJpZXIgYXMgdW5rbm93biBhcyBSZXN1bHQpLFxuICAgIGNhcnJpZXJJc1Jlc3VsdCxcbiAgICBpZGVudGlmeTogb3B0aW9ucy5pZGVudGlmeSA/PyBudWxsLFxuICAgIHJlcHJlc2VudDogb3B0aW9ucy5yZXByZXNlbnQgPz8gKGRhdGEgPT4gZGF0YSBhcyBBcnJheUxpa2U8dW5rbm93bj4pLFxuICAgIHJlcHJlc2VudFRhZ05hbWU6IG9wdGlvbnMucmVwcmVzZW50VGFnTmFtZSA/PyBudWxsXG4gIH1cbn1cblxuZnVuY3Rpb24gZGVmaW5lTWFwcGluZ1RhZzxDYXJyaWVyLCBSZXN1bHQgPSBDYXJyaWVyPiAodGFnTmFtZTogc3RyaW5nLCBvcHRpb25zOiBNYXBwaW5nVGFnT3B0aW9uczxDYXJyaWVyLCBSZXN1bHQ+KTogTWFwcGluZ1RhZ0RlZmluaXRpb248Q2FycmllciwgUmVzdWx0PiB7XG4gIGNvbnN0IGNhcnJpZXJJc1Jlc3VsdCA9IG9wdGlvbnMuZmluYWxpemUgPT09IHVuZGVmaW5lZFxuXG4gIHJldHVybiB7XG4gICAgdGFnTmFtZSxcbiAgICBub2RlS2luZDogJ21hcHBpbmcnLFxuICAgIGltcGxpY2l0OiBmYWxzZSxcbiAgICBtYXRjaEJ5VGFnUHJlZml4OiBvcHRpb25zLm1hdGNoQnlUYWdQcmVmaXggPz8gZmFsc2UsXG4gICAgY3JlYXRlOiBvcHRpb25zLmNyZWF0ZSxcbiAgICBhZGRQYWlyOiBvcHRpb25zLmFkZFBhaXIsXG4gICAgaGFzOiBvcHRpb25zLmhhcyxcbiAgICBrZXlzOiBvcHRpb25zLmtleXMsXG4gICAgZ2V0OiBvcHRpb25zLmdldCxcbiAgICBmaW5hbGl6ZTogb3B0aW9ucy5maW5hbGl6ZSA/PyAoY2FycmllciA9PiBjYXJyaWVyIGFzIHVua25vd24gYXMgUmVzdWx0KSxcbiAgICBjYXJyaWVySXNSZXN1bHQsXG4gICAgaWRlbnRpZnk6IG9wdGlvbnMuaWRlbnRpZnkgPz8gbnVsbCxcbiAgICByZXByZXNlbnQ6IG9wdGlvbnMucmVwcmVzZW50ID8/IChkYXRhID0+IGRhdGEgYXMgTWFwPHVua25vd24sIHVua25vd24+KSxcbiAgICByZXByZXNlbnRUYWdOYW1lOiBvcHRpb25zLnJlcHJlc2VudFRhZ05hbWUgPz8gbnVsbFxuICB9XG59XG5cbmV4cG9ydCB7XG4gIE5PVF9SRVNPTFZFRCxcbiAgTUVSR0VfS0VZLFxuICBkZWZpbmVTY2FsYXJUYWcsXG4gIGRlZmluZVNlcXVlbmNlVGFnLFxuICBkZWZpbmVNYXBwaW5nVGFnLFxuXG4gIHR5cGUgU2NhbGFyVGFnRGVmaW5pdGlvbixcbiAgdHlwZSBTZXF1ZW5jZVRhZ0RlZmluaXRpb24sXG4gIHR5cGUgTWFwcGluZ1RhZ0RlZmluaXRpb24sXG4gIHR5cGUgVGFnRGVmaW5pdGlvbixcbiAgdHlwZSBTY2FsYXJUYWdPcHRpb25zLFxuICB0eXBlIFNlcXVlbmNlVGFnT3B0aW9ucyxcbiAgdHlwZSBNYXBwaW5nVGFnT3B0aW9ucyxcbiAgdHlwZSBTY2FsYXJSZXByZXNlbnQsXG4gIHR5cGUgU2VxdWVuY2VSZXByZXNlbnQsXG4gIHR5cGUgTWFwcGluZ1JlcHJlc2VudFxufVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZyB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3Qgc3RyVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpzdHInLCB7XG4gIHJlc29sdmU6IChzb3VyY2UpID0+IHNvdXJjZSxcbiAgaWRlbnRpZnk6IChkYXRhKSA9PiB0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZydcbn0pXG5cbmV4cG9ydCB7IHN0clRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IE5VTExfVkFMVUVTID0gWycnLCAnficsICdudWxsJywgJ051bGwnLCAnTlVMTCddXG5cbmNvbnN0IG51bGxDb3JlVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpudWxsJywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0czogJycgKGVtcHR5KSwgJ34nLCAnbnVsbCcvJ051bGwnLydOVUxMJy5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJycsICd+JywgJ24nLCAnTiddLFxuICByZXNvbHZlOiAoc291cmNlKSA9PiB7XG4gICAgaWYgKE5VTExfVkFMVUVTLmluZGV4T2Yoc291cmNlKSAhPT0gLTEpIHJldHVybiBudWxsXG5cbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH0sXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PiBvYmplY3QgPT09IG51bGwsXG4gIHJlcHJlc2VudDogKCkgPT4gJ251bGwnXG59KVxuXG5leHBvcnQgeyBudWxsQ29yZVRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IG51bGxKc29uVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpudWxsJywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0czogbnVsbC5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJ24nXSxcbiAgcmVzb2x2ZTogKHNvdXJjZSwgaXNFeHBsaWNpdCkgPT4ge1xuICAgIGlmIChzb3VyY2UgPT09ICdudWxsJyB8fCAoaXNFeHBsaWNpdCAmJiBzb3VyY2UgPT09ICcnKSkgcmV0dXJuIG51bGxcblxuICAgIHJldHVybiBOT1RfUkVTT0xWRURcbiAgfSxcbiAgaWRlbnRpZnk6IChvYmplY3QpID0+IG9iamVjdCA9PT0gbnVsbCxcbiAgcmVwcmVzZW50OiAoKSA9PiAnbnVsbCdcbn0pXG5cbmV4cG9ydCB7IG51bGxKc29uVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgTlVMTF9WQUxVRVMgPSBbJycsICd+JywgJ251bGwnLCAnTnVsbCcsICdOVUxMJ11cblxuY29uc3QgbnVsbFlhbWwxMVRhZyA9IGRlZmluZVNjYWxhclRhZygndGFnOnlhbWwub3JnLDIwMDI6bnVsbCcsIHtcbiAgaW1wbGljaXQ6IHRydWUsXG4gIC8vIFN1cGVyc2V0IG9mIHNvdXJjZS5jaGFyQXQoMCkgb3ZlciBhbGwgbWF0Y2hlZCBpbnB1dHM6ICcnIChlbXB0eSksICd+JywgJ251bGwnLydOdWxsJy8nTlVMTCcuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWycnLCAnficsICduJywgJ04nXSxcbiAgcmVzb2x2ZTogKHNvdXJjZSkgPT4ge1xuICAgIGlmIChOVUxMX1ZBTFVFUy5pbmRleE9mKHNvdXJjZSkgIT09IC0xKSByZXR1cm4gbnVsbFxuXG4gICAgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICB9LFxuICBpZGVudGlmeTogKG9iamVjdCkgPT4gb2JqZWN0ID09PSBudWxsLFxuICByZXByZXNlbnQ6ICgpID0+ICdudWxsJ1xufSlcblxuZXhwb3J0IHsgbnVsbFlhbWwxMVRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IFRSVUVfVkFMVUVTID0gWyd0cnVlJywgJ1RydWUnLCAnVFJVRSddXG5jb25zdCBGQUxTRV9WQUxVRVMgPSBbJ2ZhbHNlJywgJ0ZhbHNlJywgJ0ZBTFNFJ11cblxuY29uc3QgYm9vbENvcmVUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOmJvb2wnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBTdXBlcnNldCBvZiBzb3VyY2UuY2hhckF0KDApIG92ZXIgYWxsIG1hdGNoZWQgaW5wdXRzOiB0cnVlL1RydWUvVFJVRSwgZmFsc2UvRmFsc2UvRkFMU0UuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWyd0JywgJ1QnLCAnZicsICdGJ10sXG4gIHJlc29sdmU6IChzb3VyY2UpID0+IHtcbiAgICBpZiAoVFJVRV9WQUxVRVMuaW5kZXhPZihzb3VyY2UpICE9PSAtMSkgcmV0dXJuIHRydWVcbiAgICBpZiAoRkFMU0VfVkFMVUVTLmluZGV4T2Yoc291cmNlKSAhPT0gLTEpIHJldHVybiBmYWxzZVxuXG4gICAgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICB9LFxuICBpZGVudGlmeTogKG9iamVjdCkgPT4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT09ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgcmVwcmVzZW50OiAob2JqZWN0KSA9PiBvYmplY3QgPyAndHJ1ZScgOiAnZmFsc2UnXG59KVxuXG5leHBvcnQgeyBib29sQ29yZVRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IFRSVUVfVkFMVUVTID0gWyd0cnVlJ11cbmNvbnN0IEZBTFNFX1ZBTFVFUyA9IFsnZmFsc2UnXVxuXG5jb25zdCBib29sSnNvblRhZyA9IGRlZmluZVNjYWxhclRhZygndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsIHtcbiAgaW1wbGljaXQ6IHRydWUsXG4gIC8vIFN1cGVyc2V0IG9mIHNvdXJjZS5jaGFyQXQoMCkgb3ZlciBhbGwgbWF0Y2hlZCBpbnB1dHM6IHRydWUsIGZhbHNlLlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IFsndCcsICdmJ10sXG4gIHJlc29sdmU6IChzb3VyY2UpID0+IHtcbiAgICBpZiAoVFJVRV9WQUxVRVMuaW5kZXhPZihzb3VyY2UpICE9PSAtMSkgcmV0dXJuIHRydWVcbiAgICBpZiAoRkFMU0VfVkFMVUVTLmluZGV4T2Yoc291cmNlKSAhPT0gLTEpIHJldHVybiBmYWxzZVxuXG4gICAgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICB9LFxuICBpZGVudGlmeTogKG9iamVjdCkgPT4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT09ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgcmVwcmVzZW50OiAob2JqZWN0KSA9PiBvYmplY3QgPyAndHJ1ZScgOiAnZmFsc2UnXG59KVxuXG5leHBvcnQgeyBib29sSnNvblRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IFRSVUVfVkFMVUVTID0gWyd0cnVlJywgJ1RydWUnLCAnVFJVRScsICd5JywgJ1knLCAneWVzJywgJ1llcycsICdZRVMnLCAnb24nLCAnT24nLCAnT04nXVxuY29uc3QgRkFMU0VfVkFMVUVTID0gWydmYWxzZScsICdGYWxzZScsICdGQUxTRScsICduJywgJ04nLCAnbm8nLCAnTm8nLCAnTk8nLCAnb2ZmJywgJ09mZicsICdPRkYnXVxuXG5jb25zdCBib29sWWFtbDExVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpib29sJywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0cy5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJ3knLCAnWScsICduJywgJ04nLCAndCcsICdUJywgJ2YnLCAnRicsICdvJywgJ08nXSxcbiAgcmVzb2x2ZTogKHNvdXJjZSkgPT4ge1xuICAgIGlmIChUUlVFX1ZBTFVFUy5pbmRleE9mKHNvdXJjZSkgIT09IC0xKSByZXR1cm4gdHJ1ZVxuICAgIGlmIChGQUxTRV9WQUxVRVMuaW5kZXhPZihzb3VyY2UpICE9PSAtMSkgcmV0dXJuIGZhbHNlXG5cbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH0sXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICByZXByZXNlbnQ6IChvYmplY3QpID0+IG9iamVjdCA/ICd0cnVlJyA6ICdmYWxzZSdcbn0pXG5cbmV4cG9ydCB7IGJvb2xZYW1sMTFUYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZywgTk9UX1JFU09MVkVEIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG4vLyBZQU1MIDEuMiBDb3JlIHNjaGVtYSBpbXBsaWNpdCByZXNvbHV0aW9uOlxuLy8gWy0rXT8gWzAtOV0rIHwgMG8gWzAtN10rIHwgMHggWzAtOWEtZkEtRl0rXG5jb25zdCBZQU1MX0lOVEVHRVJfSU1QTElDSVRfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gIC8vIDBvMTIzXG4gICdeKD86MG9bMC03XSsnICtcbiAgLy8gMHgxQVxuICAnfDB4WzAtOWEtZkEtRl0rJyArXG4gIC8vIDEyMzQ1XG4gICd8Wy0rXT9bMC05XSspJCcpXG5cbi8vIEV4cGxpY2l0IGAhIWludGAgdmFsaWRhdGlvbiBpcyBzZXBhcmF0ZSBmcm9tIENvcmUgaW1wbGljaXQgcmVzb2x1dGlvbi5cbmNvbnN0IFlBTUxfSU5URUdFUl9FWFBMSUNJVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgLy8gMGIxMDEwXG4gICdeKD86Wy0rXT8wYlswLTFdKycgK1xuICAvLyAwbzEyM1xuICAnfFstK10/MG9bMC03XSsnICtcbiAgLy8gMHgxQVxuICAnfFstK10/MHhbMC05YS1mQS1GXSsnICtcbiAgLy8gMTIzNDVcbiAgJ3xbLStdP1swLTldKykkJylcblxuZnVuY3Rpb24gcGFyc2VZYW1sSW50ZWdlciAoc291cmNlOiBzdHJpbmcpIHtcbiAgbGV0IHZhbHVlID0gc291cmNlXG4gIGxldCBzaWduID0gMVxuXG4gIGlmICh2YWx1ZVswXSA9PT0gJy0nIHx8IHZhbHVlWzBdID09PSAnKycpIHtcbiAgICBpZiAodmFsdWVbMF0gPT09ICctJykgc2lnbiA9IC0xXG4gICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgxKVxuICB9XG5cbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoJzBiJykpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIDIpXG4gIGlmICh2YWx1ZS5zdGFydHNXaXRoKCcwbycpKSByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCA4KVxuICBpZiAodmFsdWUuc3RhcnRzV2l0aCgnMHgnKSkgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgMTYpXG5cbiAgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZSwgMTApXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sSW50ZWdlciAoc291cmNlOiBzdHJpbmcsIGlzRXhwbGljaXQ6IGJvb2xlYW4pIHtcbiAgaWYgKGlzRXhwbGljaXQpIHtcbiAgICBpZiAoIVlBTUxfSU5URUdFUl9FWFBMSUNJVF9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICB9IGVsc2UgaWYgKCFZQU1MX0lOVEVHRVJfSU1QTElDSVRfUEFUVEVSTi50ZXN0KHNvdXJjZSkpIHtcbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH1cblxuICBjb25zdCByZXN1bHQgPSBwYXJzZVlhbWxJbnRlZ2VyKHNvdXJjZSlcbiAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZShyZXN1bHQpID8gcmVzdWx0IDogTk9UX1JFU09MVkVEXG59XG5cbmNvbnN0IGludENvcmVUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsIHtcbiAgaW1wbGljaXQ6IHRydWUsXG4gIC8vIFN1cGVyc2V0IG9mIHNvdXJjZS5jaGFyQXQoMCkgb3ZlciBhbGwgbWF0Y2hlZCBpbnB1dHM6IG9wdGlvbmFsIHNpZ24gKyBkZWNpbWFsIGRpZ2l0LlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IFsnLScsICcrJywgLi4uJzAxMjM0NTY3ODknXSxcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxJbnRlZ2VyLFxuICBpZGVudGlmeTogKG9iamVjdCkgPT5cbiAgICAvLyBObyBhbmNpZW50IGJveGVkIG51bWJlcnMgc3VwcG9ydFxuICAgIE51bWJlci5pc0ludGVnZXIob2JqZWN0KSAmJlxuICAgIC8vIE5lZ2F0aXZlIHplcm8gPT4gISFmbG9hdFxuICAgICFPYmplY3QuaXMob2JqZWN0LCAtMCkgJiZcbiAgICAvLyBFeHBvbmVudGlhbCBmb3JtID0+ICEhZmxvYXQsIHJvdW5kLXRyaXAgZm9yICEhaW50IDFlMjEgd2lsbCBiZSBicm9rZW5cbiAgICBvYmplY3QudG9TdHJpbmcoMTApLmluZGV4T2YoJ2UnKSA8IDAsXG4gIHJlcHJlc2VudDogKG9iamVjdDogbnVtYmVyKSA9PiBvYmplY3QudG9TdHJpbmcoMTApXG59KVxuXG5leHBvcnQgeyBpbnRDb3JlVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuLy8gWUFNTCAxLjIgSlNPTiBzY2hlbWEgaW1wbGljaXQgcmVzb2x1dGlvbjpcbi8vIC0/ICggMCB8IFsxLTldIFswLTldKiApXG5jb25zdCBZQU1MX0lOVEVHRVJfSU1QTElDSVRfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gICdeLT8oPzowfFsxLTldWzAtOV0qKSQnKVxuXG4vLyBFeHBsaWNpdCBgISFpbnRgIHZhbGlkYXRpb24gaXMgc2VwYXJhdGUgZnJvbSBKU09OIGltcGxpY2l0IHJlc29sdXRpb24uXG5jb25zdCBZQU1MX0lOVEVHRVJfRVhQTElDSVRfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gIC8vIDBiMTAxMFxuICAnXig/OlstK10/MGJbMC0xXSsnICtcbiAgLy8gMG8xMjNcbiAgJ3xbLStdPzBvWzAtN10rJyArXG4gIC8vIDB4MUFcbiAgJ3xbLStdPzB4WzAtOWEtZkEtRl0rJyArXG4gIC8vIDEyMzQ1XG4gICd8Wy0rXT9bMC05XSspJCcpXG5cbmZ1bmN0aW9uIHBhcnNlWWFtbEludGVnZXIgKHNvdXJjZTogc3RyaW5nKSB7XG4gIGxldCB2YWx1ZSA9IHNvdXJjZVxuICBsZXQgc2lnbiA9IDFcblxuICBpZiAodmFsdWVbMF0gPT09ICctJyB8fCB2YWx1ZVswXSA9PT0gJysnKSB7XG4gICAgaWYgKHZhbHVlWzBdID09PSAnLScpIHNpZ24gPSAtMVxuICAgIHZhbHVlID0gdmFsdWUuc2xpY2UoMSlcbiAgfVxuXG4gIGlmICh2YWx1ZS5zdGFydHNXaXRoKCcwYicpKSByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCAyKVxuICBpZiAodmFsdWUuc3RhcnRzV2l0aCgnMG8nKSkgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgOClcbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoJzB4JykpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIDE2KVxuXG4gIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUsIDEwKVxufVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEludGVnZXIgKHNvdXJjZTogc3RyaW5nLCBpc0V4cGxpY2l0OiBib29sZWFuKSB7XG4gIGlmIChpc0V4cGxpY2l0KSB7XG4gICAgaWYgKCFZQU1MX0lOVEVHRVJfRVhQTElDSVRfUEFUVEVSTi50ZXN0KHNvdXJjZSkpIHJldHVybiBOT1RfUkVTT0xWRURcbiAgfSBlbHNlIGlmICghWUFNTF9JTlRFR0VSX0lNUExJQ0lUX1BBVFRFUk4udGVzdChzb3VyY2UpKSB7XG4gICAgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0gcGFyc2VZYW1sSW50ZWdlcihzb3VyY2UpXG4gIHJldHVybiBOdW1iZXIuaXNGaW5pdGUocmVzdWx0KSA/IHJlc3VsdCA6IE5PVF9SRVNPTFZFRFxufVxuXG5jb25zdCBpbnRKc29uVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBTdXBlcnNldCBvZiBzb3VyY2UuY2hhckF0KDApIG92ZXIgYWxsIG1hdGNoZWQgaW5wdXRzOiBvcHRpb25hbCAnLScgb3IgZGlnaXQuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWyctJywgLi4uJzAxMjM0NTY3ODknXSxcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxJbnRlZ2VyLFxuICBpZGVudGlmeTogKG9iamVjdCkgPT5cbiAgICAvLyBObyBhbmNpZW50IGJveGVkIG51bWJlcnMgc3VwcG9ydFxuICAgIE51bWJlci5pc0ludGVnZXIob2JqZWN0KSAmJlxuICAgIC8vIE5lZ2F0aXZlIHplcm8gPT4gISFmbG9hdFxuICAgICFPYmplY3QuaXMob2JqZWN0LCAtMCkgJiZcbiAgICAvLyBFeHBvbmVudGlhbCBmb3JtID0+ICEhZmxvYXQsIHJvdW5kLXRyaXAgZm9yICEhaW50IDFlMjEgd2lsbCBiZSBicm9rZW5cbiAgICBvYmplY3QudG9TdHJpbmcoMTApLmluZGV4T2YoJ2UnKSA8IDAsXG4gIHJlcHJlc2VudDogKG9iamVjdDogbnVtYmVyKSA9PiBvYmplY3QudG9TdHJpbmcoMTApXG59KVxuXG5leHBvcnQgeyBpbnRKc29uVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgWUFNTF9JTlRFR0VSX1BBVFRFUk4gPSBuZXcgUmVnRXhwKFxuICAvLyAwYjEwMTBcbiAgJ14oPzpbLStdPzBiWzAtMV9dKycgK1xuICAvLyAwMTIzXG4gICd8Wy0rXT8wWzAtN19dKycgK1xuICAvLyAweDFBXG4gICd8Wy0rXT8weFswLTlhLWZBLUZfXSsnICtcbiAgLy8gMToyM1xuICAnfFstK10/WzAtOV1bMC05X10qKD86OlswLTVdP1swLTldKSsnICtcbiAgLy8gMTIzNDVcbiAgJ3xbLStdPyg/OjB8WzEtOV1bMC05X10qKSkkJylcblxuZnVuY3Rpb24gcGFyc2VZYW1sSW50ZWdlciAoc291cmNlOiBzdHJpbmcpIHtcbiAgbGV0IHZhbHVlID0gc291cmNlLnJlcGxhY2UoL18vZywgJycpXG4gIGxldCBzaWduID0gMVxuXG4gIGlmICh2YWx1ZVswXSA9PT0gJy0nIHx8IHZhbHVlWzBdID09PSAnKycpIHtcbiAgICBpZiAodmFsdWVbMF0gPT09ICctJykgc2lnbiA9IC0xXG4gICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgxKVxuICB9XG5cbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoJzBiJykpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIDIpXG4gIGlmICh2YWx1ZS5zdGFydHNXaXRoKCcweCcpKSByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCAxNilcblxuICBpZiAodmFsdWUuaW5jbHVkZXMoJzonKSkge1xuICAgIGxldCByZXN1bHQgPSAwXG4gICAgZm9yIChjb25zdCBwYXJ0IG9mIHZhbHVlLnNwbGl0KCc6JykpIHJlc3VsdCA9IHJlc3VsdCAqIDYwICsgTnVtYmVyKHBhcnQpXG4gICAgcmV0dXJuIHNpZ24gKiByZXN1bHRcbiAgfVxuXG4gIGlmICh2YWx1ZSAhPT0gJzAnICYmIHZhbHVlWzBdID09PSAnMCcpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUsIDgpXG5cbiAgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZSwgMTApXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sSW50ZWdlciAoc291cmNlOiBzdHJpbmcpIHtcbiAgaWYgKCFZQU1MX0lOVEVHRVJfUEFUVEVSTi50ZXN0KHNvdXJjZSkpIHJldHVybiBOT1RfUkVTT0xWRURcblxuICBjb25zdCByZXN1bHQgPSBwYXJzZVlhbWxJbnRlZ2VyKHNvdXJjZSlcbiAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZShyZXN1bHQpID8gcmVzdWx0IDogTk9UX1JFU09MVkVEXG59XG5cbmNvbnN0IGludFlhbWwxMVRhZyA9IGRlZmluZVNjYWxhclRhZygndGFnOnlhbWwub3JnLDIwMDI6aW50Jywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0czogb3B0aW9uYWwgc2lnbiArIGRlY2ltYWwgZGlnaXQuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWyctJywgJysnLCAuLi4nMDEyMzQ1Njc4OSddLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbEludGVnZXIsXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PlxuICAgIC8vIE5vIGFuY2llbnQgYm94ZWQgbnVtYmVycyBzdXBwb3J0XG4gICAgTnVtYmVyLmlzSW50ZWdlcihvYmplY3QpICYmXG4gICAgLy8gTmVnYXRpdmUgemVybyA9PiAhIWZsb2F0XG4gICAgIU9iamVjdC5pcyhvYmplY3QsIC0wKSAmJlxuICAgIC8vIEV4cG9uZW50aWFsIGZvcm0gPT4gISFmbG9hdCwgcm91bmQtdHJpcCBmb3IgISFpbnQgMWUyMSB3aWxsIGJlIGJyb2tlblxuICAgIG9iamVjdC50b1N0cmluZygxMCkuaW5kZXhPZignZScpIDwgMCxcbiAgcmVwcmVzZW50OiAob2JqZWN0OiBudW1iZXIpID0+IG9iamVjdC50b1N0cmluZygxMClcbn0pXG5cbmV4cG9ydCB7IGludFlhbWwxMVRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IFlBTUxfRkxPQVRfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gIC8vIDIuNWU0LCAyLjUgYW5kIGludGVnZXJzXG4gICdeKD86Wy0rXT9bMC05XSsoPzpcXFxcLlswLTldKik/KD86W2VFXVstK10/WzAtOV0rKT8nICtcbiAgLy8gLjJlNCwgLjJcbiAgJ3xbLStdP1xcXFwuWzAtOV0rKD86W2VFXVstK10/WzAtOV0rKT8nICtcbiAgLy8gLmluZlxuICAnfFstK10/XFxcXC4oPzppbmZ8SW5mfElORiknICtcbiAgLy8gLm5hblxuICAnfFxcXFwuKD86bmFufE5hTnxOQU4pKSQnKVxuXG5jb25zdCBZQU1MX0ZMT0FUX1NQRUNJQUxfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gICdeKD86JyArXG4gIC8vIC5pbmZcbiAgJ1stK10/XFxcXC4oPzppbmZ8SW5mfElORiknICtcbiAgLy8gLm5hblxuICAnfFxcXFwuKD86bmFufE5hTnxOQU4pKSQnKVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEZsb2F0IChzb3VyY2U6IHN0cmluZykge1xuICBpZiAoIVlBTUxfRkxPQVRfUEFUVEVSTi50ZXN0KHNvdXJjZSkpIHJldHVybiBOT1RfUkVTT0xWRURcblxuICBsZXQgdmFsdWUgPSBzb3VyY2UudG9Mb3dlckNhc2UoKVxuICBjb25zdCBzaWduID0gdmFsdWVbMF0gPT09ICctJyA/IC0xIDogMVxuXG4gIGlmICgnKy0nLmluY2x1ZGVzKHZhbHVlWzBdKSkgdmFsdWUgPSB2YWx1ZS5zbGljZSgxKVxuXG4gIGlmICh2YWx1ZSA9PT0gJy5pbmYnKSByZXR1cm4gc2lnbiA9PT0gMSA/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA6IE51bWJlci5ORUdBVElWRV9JTkZJTklUWVxuICBpZiAodmFsdWUgPT09ICcubmFuJykgcmV0dXJuIE5hTlxuXG4gIGNvbnN0IHJlc3VsdCA9IHNpZ24gKiBwYXJzZUZsb2F0KHZhbHVlKVxuXG4gIGlmIChOdW1iZXIuaXNGaW5pdGUocmVzdWx0KSB8fCBZQU1MX0ZMT0FUX1NQRUNJQUxfUEFUVEVSTi50ZXN0KHNvdXJjZSkpIHJldHVybiByZXN1bHRcbiAgcmV0dXJuIE5PVF9SRVNPTFZFRFxufVxuXG5mdW5jdGlvbiByZXByZXNlbnRZYW1sRmxvYXQgKG9iamVjdDogbnVtYmVyKSB7XG4gIGlmIChpc05hTihvYmplY3QpKSByZXR1cm4gJy5uYW4nXG4gIGlmIChvYmplY3QgPT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkgcmV0dXJuICcuaW5mJ1xuICBpZiAob2JqZWN0ID09PSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpIHJldHVybiAnLS5pbmYnXG4gIGlmIChPYmplY3QuaXMob2JqZWN0LCAtMCkpIHJldHVybiAnLTAuMCdcblxuICBjb25zdCByZXN1bHQgPSBvYmplY3QudG9TdHJpbmcoMTApXG4gIHJldHVybiAvXlstK10/WzAtOV0rZS8udGVzdChyZXN1bHQpID8gcmVzdWx0LnJlcGxhY2UoJ2UnLCAnLmUnKSA6IHJlc3VsdFxufVxuXG5jb25zdCBmbG9hdENvcmVUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0Jywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0czogb3B0aW9uYWwgc2lnbiwgJy4nLCBvciBkaWdpdFxuICAvLyAoJy5pbmYnLycubmFuJyBzdGFydCB3aXRoICcuJykuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWyctJywgJysnLCAnLicsIC4uLicwMTIzNDU2Nzg5J10sXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sRmxvYXQsXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PlxuICAgIC8vIE5vIGFuY2llbnQgYm94ZWQgbnVtYmVycyBzdXBwb3J0XG4gICAgdHlwZW9mIG9iamVjdCA9PT0gJ251bWJlcicgJiZcbiAgICAoXG4gICAgICAvLyBXZSBsYW5kIGhlcmUgYWxsIG51bWJlcnMsIG5vdCBoYW5kbGVkIChkZWNsaW5lZCkgYnkgISFpbnQgYC5pZGVudGlmeWBcbiAgICAgIC8vIFRoZSBzYW1lIGNvbmRpdGlvbiBhcyBmb3IgISFpbnQsIGJ1dCByZXZlcnNlZC5cblxuICAgICAgLy8gRmlsdGVyIG91dCBpbnRlZ2Vycy4uLlxuICAgICAgIU51bWJlci5pc0ludGVnZXIob2JqZWN0KSB8fFxuICAgICAgLy8gYnV0IGFsbG93IG5lZ2F0aXZlIHplcm9cbiAgICAgIE9iamVjdC5pcyhvYmplY3QsIC0wKSB8fFxuICAgICAgLy8gYW5kIGludGVnZXJzIHdpdGggZXhwb25lbnRpYWwgZm9ybVxuICAgICAgb2JqZWN0LnRvU3RyaW5nKDEwKS5pbmRleE9mKCdlJykgPj0gMFxuICAgICksXG4gIHJlcHJlc2VudDogcmVwcmVzZW50WWFtbEZsb2F0XG59KVxuXG5leHBvcnQgeyBmbG9hdENvcmVUYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZywgTk9UX1JFU09MVkVEIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG4vLyBZQU1MIDEuMiBKU09OIHNjaGVtYSBpbXBsaWNpdCByZXNvbHV0aW9uOlxuLy8gLT8gKCAwIHwgWzEtOV0gWzAtOV0qICkgKCBcXC4gWzAtOV0qICk/ICggW2VFXSBbLStdPyBbMC05XSsgKT9cbmNvbnN0IFlBTUxfRkxPQVRfSU1QTElDSVRfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gIC8vIDIuNWU0LCAyLjUgYW5kIGludGVnZXJzXG4gICdeLT8oPzowfFsxLTldWzAtOV0qKSg/OlxcXFwuWzAtOV0qKT8oPzpbZUVdWy0rXT9bMC05XSspPyQnKVxuXG4vLyBFeHBsaWNpdCBgISFmbG9hdGAgdmFsaWRhdGlvbiBpcyBzZXBhcmF0ZSBmcm9tIEpTT04gaW1wbGljaXQgcmVzb2x1dGlvbi5cbmNvbnN0IFlBTUxfRkxPQVRfRVhQTElDSVRfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gIC8vIDIuNWU0LCAyLjUgYW5kIGludGVnZXJzXG4gICdeKD86Wy0rXT9bMC05XSsoPzpcXFxcLlswLTldKik/KD86W2VFXVstK10/WzAtOV0rKT8nICtcbiAgLy8gLjJlNCwgLjJcbiAgJ3xbLStdP1xcXFwuWzAtOV0rKD86W2VFXVstK10/WzAtOV0rKT8nICtcbiAgLy8gLmluZlxuICAnfFstK10/XFxcXC4oPzppbmZ8SW5mfElORiknICtcbiAgLy8gLm5hblxuICAnfFxcXFwuKD86bmFufE5hTnxOQU4pKSQnKVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEZsb2F0IChzb3VyY2U6IHN0cmluZywgaXNFeHBsaWNpdDogYm9vbGVhbikge1xuICBpZiAoaXNFeHBsaWNpdCkge1xuICAgIGlmICghWUFNTF9GTE9BVF9FWFBMSUNJVF9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuXG4gICAgbGV0IHZhbHVlID0gc291cmNlLnRvTG93ZXJDYXNlKClcbiAgICBjb25zdCBzaWduID0gdmFsdWVbMF0gPT09ICctJyA/IC0xIDogMVxuXG4gICAgaWYgKCcrLScuaW5jbHVkZXModmFsdWVbMF0pKSB2YWx1ZSA9IHZhbHVlLnNsaWNlKDEpXG5cbiAgICBpZiAodmFsdWUgPT09ICcuaW5mJykgcmV0dXJuIHNpZ24gPT09IDEgPyBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgOiBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFlcbiAgICBpZiAodmFsdWUgPT09ICcubmFuJykgcmV0dXJuIE5hTlxuXG4gICAgY29uc3QgcmVzdWx0ID0gc2lnbiAqIHBhcnNlRmxvYXQodmFsdWUpXG4gICAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZShyZXN1bHQpID8gcmVzdWx0IDogTk9UX1JFU09MVkVEXG4gIH1cblxuICBpZiAoIVlBTUxfRkxPQVRfSU1QTElDSVRfUEFUVEVSTi50ZXN0KHNvdXJjZSkpIHJldHVybiBOT1RfUkVTT0xWRURcblxuICBjb25zdCByZXN1bHQgPSBOdW1iZXIoc291cmNlKVxuXG4gIGlmIChOdW1iZXIuaXNGaW5pdGUocmVzdWx0KSkgcmV0dXJuIHJlc3VsdFxuICByZXR1cm4gTk9UX1JFU09MVkVEXG59XG5cbmZ1bmN0aW9uIHJlcHJlc2VudFlhbWxGbG9hdCAob2JqZWN0OiBudW1iZXIpIHtcbiAgaWYgKGlzTmFOKG9iamVjdCkpIHJldHVybiAnLm5hbidcbiAgaWYgKG9iamVjdCA9PT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSByZXR1cm4gJy5pbmYnXG4gIGlmIChvYmplY3QgPT09IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSkgcmV0dXJuICctLmluZidcbiAgaWYgKE9iamVjdC5pcyhvYmplY3QsIC0wKSkgcmV0dXJuICctMC4wJ1xuXG4gIGNvbnN0IHJlc3VsdCA9IG9iamVjdC50b1N0cmluZygxMClcbiAgcmV0dXJuIC9eWy0rXT9bMC05XStlLy50ZXN0KHJlc3VsdCkgPyByZXN1bHQucmVwbGFjZSgnZScsICcuZScpIDogcmVzdWx0XG59XG5cbmNvbnN0IGZsb2F0SnNvblRhZyA9IGRlZmluZVNjYWxhclRhZygndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBTdXBlcnNldCBvZiBzb3VyY2UuY2hhckF0KDApIG92ZXIgYWxsIG1hdGNoZWQgaW5wdXRzOiBvcHRpb25hbCAnLScgb3IgZGlnaXQuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWyctJywgLi4uJzAxMjM0NTY3ODknXSxcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxGbG9hdCxcbiAgaWRlbnRpZnk6IChvYmplY3QpID0+XG4gICAgLy8gTm8gYW5jaWVudCBib3hlZCBudW1iZXJzIHN1cHBvcnRcbiAgICB0eXBlb2Ygb2JqZWN0ID09PSAnbnVtYmVyJyAmJlxuICAgIChcbiAgICAgIC8vIFdlIGxhbmQgaGVyZSBhbGwgbnVtYmVycywgbm90IGhhbmRsZWQgKGRlY2xpbmVkKSBieSAhIWludCBgLmlkZW50aWZ5YFxuICAgICAgLy8gVGhlIHNhbWUgY29uZGl0aW9uIGFzIGZvciAhIWludCwgYnV0IHJldmVyc2VkLlxuXG4gICAgICAvLyBGaWx0ZXIgb3V0IGludGVnZXJzLi4uXG4gICAgICAhTnVtYmVyLmlzSW50ZWdlcihvYmplY3QpIHx8XG4gICAgICAvLyBidXQgYWxsb3cgbmVnYXRpdmUgemVyb1xuICAgICAgT2JqZWN0LmlzKG9iamVjdCwgLTApIHx8XG4gICAgICAvLyBhbmQgaW50ZWdlcnMgd2l0aCBleHBvbmVudGlhbCBmb3JtXG4gICAgICBvYmplY3QudG9TdHJpbmcoMTApLmluZGV4T2YoJ2UnKSA+PSAwXG4gICAgKSxcbiAgcmVwcmVzZW50OiByZXByZXNlbnRZYW1sRmxvYXRcbn0pXG5cbmV4cG9ydCB7IGZsb2F0SnNvblRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IFlBTUxfRkxPQVRfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gIC8vIDIuNWU0LCAyLjUgYW5kIGludGVnZXJzXG4gICdeKD86Wy0rXT8oPzooPzpbMC05XVswLTlfXSopP1xcXFwuWzAtOV9dKikoPzpbZUVdWy0rXVswLTldKyk/JyArXG4gIC8vIDE5MDoyMDozMC4xNVxuICAnfFstK10/WzAtOV1bMC05X10qKD86OlswLTVdP1swLTldKStcXFxcLlswLTlfXSonICtcbiAgLy8gLmluZlxuICAnfFstK10/XFxcXC4oPzppbmZ8SW5mfElORiknICtcbiAgLy8gLm5hblxuICAnfFxcXFwuKD86bmFufE5hTnxOQU4pKSQnKVxuXG5jb25zdCBZQU1MX0ZMT0FUX1NQRUNJQUxfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gICdeKD86JyArXG4gIC8vIC5pbmZcbiAgJ1stK10/XFxcXC4oPzppbmZ8SW5mfElORiknICtcbiAgLy8gLm5hblxuICAnfFxcXFwuKD86bmFufE5hTnxOQU4pKSQnKVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEZsb2F0IChzb3VyY2U6IHN0cmluZykge1xuICBpZiAoIVlBTUxfRkxPQVRfUEFUVEVSTi50ZXN0KHNvdXJjZSkpIHJldHVybiBOT1RfUkVTT0xWRURcblxuICBsZXQgdmFsdWUgPSBzb3VyY2UudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9fL2csICcnKVxuICBjb25zdCBzaWduID0gdmFsdWVbMF0gPT09ICctJyA/IC0xIDogMVxuXG4gIGlmICgnKy0nLmluY2x1ZGVzKHZhbHVlWzBdKSkgdmFsdWUgPSB2YWx1ZS5zbGljZSgxKVxuXG4gIGlmICh2YWx1ZSA9PT0gJy5pbmYnKSByZXR1cm4gc2lnbiA9PT0gMSA/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA6IE51bWJlci5ORUdBVElWRV9JTkZJTklUWVxuICBpZiAodmFsdWUgPT09ICcubmFuJykgcmV0dXJuIE5hTlxuXG4gIGxldCByZXN1bHQgPSAwXG5cbiAgaWYgKHZhbHVlLmluY2x1ZGVzKCc6JykpIHtcbiAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdmFsdWUuc3BsaXQoJzonKSkgcmVzdWx0ID0gcmVzdWx0ICogNjAgKyBOdW1iZXIocGFydClcbiAgICByZXN1bHQgKj0gc2lnblxuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9IHNpZ24gKiBwYXJzZUZsb2F0KHZhbHVlKVxuICB9XG5cbiAgaWYgKE51bWJlci5pc0Zpbml0ZShyZXN1bHQpIHx8IFlBTUxfRkxPQVRfU1BFQ0lBTF9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIHJlc3VsdFxuICByZXR1cm4gTk9UX1JFU09MVkVEXG59XG5cbmZ1bmN0aW9uIHJlcHJlc2VudFlhbWxGbG9hdCAob2JqZWN0OiBudW1iZXIpIHtcbiAgaWYgKGlzTmFOKG9iamVjdCkpIHJldHVybiAnLm5hbidcbiAgaWYgKG9iamVjdCA9PT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSByZXR1cm4gJy5pbmYnXG4gIGlmIChvYmplY3QgPT09IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSkgcmV0dXJuICctLmluZidcbiAgaWYgKE9iamVjdC5pcyhvYmplY3QsIC0wKSkgcmV0dXJuICctMC4wJ1xuXG4gIGNvbnN0IHJlc3VsdCA9IG9iamVjdC50b1N0cmluZygxMClcbiAgcmV0dXJuIC9eWy0rXT9bMC05XStlLy50ZXN0KHJlc3VsdCkgPyByZXN1bHQucmVwbGFjZSgnZScsICcuZScpIDogcmVzdWx0XG59XG5cbmNvbnN0IGZsb2F0WWFtbDExVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsIHtcbiAgaW1wbGljaXQ6IHRydWUsXG4gIC8vIFN1cGVyc2V0IG9mIHNvdXJjZS5jaGFyQXQoMCkgb3ZlciBhbGwgbWF0Y2hlZCBpbnB1dHM6IG9wdGlvbmFsIHNpZ24sICcuJywgb3IgZGlnaXRcbiAgLy8gKCcuaW5mJy8nLm5hbicgc3RhcnQgd2l0aCAnLicpLlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IFsnLScsICcrJywgJy4nLCAuLi4nMDEyMzQ1Njc4OSddLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbEZsb2F0LFxuICBpZGVudGlmeTogKG9iamVjdCkgPT5cbiAgICAvLyBObyBhbmNpZW50IGJveGVkIG51bWJlcnMgc3VwcG9ydFxuICAgIHR5cGVvZiBvYmplY3QgPT09ICdudW1iZXInICYmXG4gICAgKFxuICAgICAgLy8gV2UgbGFuZCBoZXJlIGFsbCBudW1iZXJzLCBub3QgaGFuZGxlZCAoZGVjbGluZWQpIGJ5ICEhaW50IGAuaWRlbnRpZnlgXG4gICAgICAvLyBUaGUgc2FtZSBjb25kaXRpb24gYXMgZm9yICEhaW50LCBidXQgcmV2ZXJzZWQuXG5cbiAgICAgIC8vIEZpbHRlciBvdXQgaW50ZWdlcnMuLi5cbiAgICAgICFOdW1iZXIuaXNJbnRlZ2VyKG9iamVjdCkgfHxcbiAgICAgIC8vIGJ1dCBhbGxvdyBuZWdhdGl2ZSB6ZXJvXG4gICAgICBPYmplY3QuaXMob2JqZWN0LCAtMCkgfHxcbiAgICAgIC8vIGFuZCBpbnRlZ2VycyB3aXRoIGV4cG9uZW50aWFsIGZvcm1cbiAgICAgIG9iamVjdC50b1N0cmluZygxMCkuaW5kZXhPZignZScpID49IDBcbiAgICApLFxuICByZXByZXNlbnQ6IHJlcHJlc2VudFlhbWxGbG9hdFxufSlcblxuZXhwb3J0IHsgZmxvYXRZYW1sMTFUYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZywgTUVSR0VfS0VZLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IG1lcmdlVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjptZXJnZScsIHtcbiAgaW1wbGljaXQ6IHRydWUsXG4gIC8vIHNvdXJjZS5jaGFyQXQoMCkgb3ZlciBtYXRjaGVkIGltcGxpY2l0IGlucHV0czogJzwnICgnPDwnKS5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJzwnXSxcbiAgcmVzb2x2ZTogKHNvdXJjZSwgaXNFeHBsaWNpdCkgPT4ge1xuICAgIGlmIChzb3VyY2UgPT09ICc8PCcgfHwgKGlzRXhwbGljaXQgJiYgc291cmNlID09PSAnJykpIHJldHVybiBNRVJHRV9LRVlcbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH1cbn0pXG5cbmV4cG9ydCB7IG1lcmdlVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgQkFTRTY0X1BBVFRFUk4gPSAvXltBLVphLXowLTkrL10qPXswLDJ9JC9cblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxCaW5hcnkgKHNvdXJjZTogc3RyaW5nKSB7XG4gIC8vIFN0cmlwIGFsbG93ZWQgd2hpdGVzcGFjZSBmaXJzdCwgc28gdmFsaWRhdGlvbiBzdGF5cyBhIHBsYWluIGJhc2U2NCBjaGVjay5cbiAgY29uc3QgaW5wdXQgPSBzb3VyY2UucmVwbGFjZSgvXFxzL2csICcnKVxuICBpZiAoaW5wdXQubGVuZ3RoICUgNCAhPT0gMCB8fCAhQkFTRTY0X1BBVFRFUk4udGVzdChpbnB1dCkpIHJldHVybiBOT1RfUkVTT0xWRURcblxuICBjb25zdCBiaW5hcnkgPSBhdG9iKGlucHV0KVxuICBjb25zdCByZXN1bHQgPSBuZXcgVWludDhBcnJheShiaW5hcnkubGVuZ3RoKVxuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYmluYXJ5Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgIHJlc3VsdFtpbmRleF0gPSBiaW5hcnkuY2hhckNvZGVBdChpbmRleClcbiAgfVxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIHJlcHJlc2VudFlhbWxCaW5hcnkgKG9iamVjdDogVWludDhBcnJheSkge1xuICBsZXQgYmluYXJ5ID0gJydcbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9iamVjdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShvYmplY3RbaW5kZXhdKVxuICB9XG4gIHJldHVybiBidG9hKGJpbmFyeSlcbn1cblxuY29uc3QgYmluYXJ5VGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpiaW5hcnknLCB7XG4gIHJlc29sdmU6IHJlc29sdmVZYW1sQmluYXJ5LFxuICBpZGVudGlmeTogKG9iamVjdCkgPT4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT09ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgcmVwcmVzZW50OiByZXByZXNlbnRZYW1sQmluYXJ5XG59KVxuXG5leHBvcnQgeyBiaW5hcnlUYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZywgTk9UX1JFU09MVkVEIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG5jb25zdCBZQU1MX0RBVEVfUkVHRVhQID0gbmV3IFJlZ0V4cChcbiAgJ14oWzAtOV1bMC05XVswLTldWzAtOV0pLShbMC05XVswLTldKS0oWzAtOV1bMC05XSkkJylcblxuY29uc3QgWUFNTF9USU1FU1RBTVBfUkVHRVhQID0gbmV3IFJlZ0V4cChcbiAgJ14oWzAtOV1bMC05XVswLTldWzAtOV0pJyArXG4gICctKFswLTldWzAtOV0/KScgK1xuICAnLShbMC05XVswLTldPyknICtcbiAgJyg/OltUdF18WyBcXFxcdF0rKScgK1xuICAnKFswLTldWzAtOV0/KScgK1xuICAnOihbMC05XVswLTldKScgK1xuICAnOihbMC05XVswLTldKScgK1xuICAnKD86XFxcXC4oWzAtOV0qKSk/JyArXG4gICcoPzpbIFxcXFx0XSooWnwoWy0rXSkoWzAtOV1bMC05XT8pJyArXG4gICcoPzo6KFswLTldWzAtOV0pKT8pKT8kJylcblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxUaW1lc3RhbXAgKHNvdXJjZTogc3RyaW5nKSB7XG4gIGxldCBtYXRjaCA9IFlBTUxfREFURV9SRUdFWFAuZXhlYyhzb3VyY2UpXG4gIGlmIChtYXRjaCA9PT0gbnVsbCkgbWF0Y2ggPSBZQU1MX1RJTUVTVEFNUF9SRUdFWFAuZXhlYyhzb3VyY2UpXG4gIGlmIChtYXRjaCA9PT0gbnVsbCkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuXG4gIGNvbnN0IHllYXIgPSArKG1hdGNoWzFdKVxuICBjb25zdCBtb250aCA9ICsobWF0Y2hbMl0pIC0gMVxuICBjb25zdCBkYXkgPSArKG1hdGNoWzNdKVxuXG4gIC8vIERhdGUtb25seSBmb3JtIChgWVlZWS1NTS1ERGApIGhhcyBubyB0aW1lIGNhcHR1cmVzLlxuICBpZiAoIW1hdGNoWzRdKSB7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKHllYXIsIG1vbnRoLCBkYXkpKVxuICAgIC8vIFJlamVjdCBkYXRlcyB0aGF0IEpTIHdvdWxkIG5vcm1hbGl6ZSwgZS5nLiAyMDIzLTAyLTI5IC0+IDIwMjMtMDMtMDEuXG4gICAgaWYgKGRhdGUuZ2V0VVRDRnVsbFllYXIoKSAhPT0geWVhciB8fCBkYXRlLmdldFVUQ01vbnRoKCkgIT09IG1vbnRoIHx8IGRhdGUuZ2V0VVRDRGF0ZSgpICE9PSBkYXkpIHtcbiAgICAgIHJldHVybiBOT1RfUkVTT0xWRURcbiAgICB9XG4gICAgcmV0dXJuIGRhdGVcbiAgfVxuXG4gIGNvbnN0IGhvdXIgPSArKG1hdGNoWzRdKVxuICBjb25zdCBtaW51dGUgPSArKG1hdGNoWzVdKVxuICBjb25zdCBzZWNvbmQgPSArKG1hdGNoWzZdKVxuICBsZXQgZnJhY3Rpb24gPSAwXG5cbiAgLy8gUmVqZWN0IHRpbWVzIHRoYXQgSlMgd291bGQgbm9ybWFsaXplIGludG8gdGhlIG5leHQgbWludXRlL2hvdXIvZGF5LlxuICBpZiAoaG91ciA+IDIzIHx8IG1pbnV0ZSA+IDU5IHx8IHNlY29uZCA+IDU5KSByZXR1cm4gTk9UX1JFU09MVkVEXG5cbiAgaWYgKG1hdGNoWzddKSB7XG4gICAgbGV0IHZhbHVlID0gbWF0Y2hbN10uc2xpY2UoMCwgMylcbiAgICB3aGlsZSAodmFsdWUubGVuZ3RoIDwgMykgdmFsdWUgKz0gJzAnXG4gICAgZnJhY3Rpb24gPSArdmFsdWVcbiAgfVxuXG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgZnJhY3Rpb24pKVxuXG4gIC8vIFJlamVjdCBpbnZhbGlkIGNhbGVuZGFyIGRhdGVzIGJlZm9yZSBhcHBseWluZyB0aW1lem9uZSBvZmZzZXQuXG4gIGlmIChkYXRlLmdldFVUQ0Z1bGxZZWFyKCkgIT09IHllYXIgfHwgZGF0ZS5nZXRVVENNb250aCgpICE9PSBtb250aCB8fCBkYXRlLmdldFVUQ0RhdGUoKSAhPT0gZGF5KSB7XG4gICAgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICB9XG5cbiAgaWYgKG1hdGNoWzldKSB7XG4gICAgY29uc3Qgb2Zmc2V0SG91ciA9ICsobWF0Y2hbMTBdKVxuICAgIGNvbnN0IG9mZnNldE1pbnV0ZSA9ICsobWF0Y2hbMTFdIHx8IDApXG4gICAgLy8gUmVqZWN0IHRpbWV6b25lIG9mZnNldHMgdGhhdCBKUyBkYXRlIGFyaXRobWV0aWMgd291bGQgb3RoZXJ3aXNlIGFjY2VwdC5cbiAgICBpZiAob2Zmc2V0SG91ciA+IDIzIHx8IG9mZnNldE1pbnV0ZSA+IDU5KSByZXR1cm4gTk9UX1JFU09MVkVEXG5cbiAgICBjb25zdCBvZmZzZXQgPSAob2Zmc2V0SG91ciAqIDYwICsgb2Zmc2V0TWludXRlKSAqIDYwMDAwXG4gICAgZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpIC0gKG1hdGNoWzldID09PSAnLScgPyAtb2Zmc2V0IDogb2Zmc2V0KSlcbiAgfVxuXG4gIHJldHVybiBkYXRlXG59XG5cbmNvbnN0IHRpbWVzdGFtcFRhZyA9IGRlZmluZVNjYWxhclRhZygndGFnOnlhbWwub3JnLDIwMDI6dGltZXN0YW1wJywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gQm90aCBwYXR0ZXJucyBzdGFydCB3aXRoIGEgNC1kaWdpdCB5ZWFyLCBzbyBzb3VyY2UuY2hhckF0KDApIGlzIGFsd2F5cyBhIGRpZ2l0LlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IFsuLi4nMDEyMzQ1Njc4OSddLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbFRpbWVzdGFtcCxcbiAgaWRlbnRpZnk6IChvYmplY3QpID0+IG9iamVjdCBpbnN0YW5jZW9mIERhdGUsXG4gIHJlcHJlc2VudDogKG9iamVjdDogRGF0ZSkgPT4gb2JqZWN0LnRvSVNPU3RyaW5nKClcbn0pXG5cbmV4cG9ydCB7IHRpbWVzdGFtcFRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2VxdWVuY2VUYWcgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IHNlcVRhZyA9IGRlZmluZVNlcXVlbmNlVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpzZXEnLCB7XG4gIGNyZWF0ZTogKCkgPT4gW10gYXMgdW5rbm93bltdLFxuICBhZGRJdGVtOiAoY29udGFpbmVyLCBpdGVtKSA9PiB7XG4gICAgY29udGFpbmVyLnB1c2goaXRlbSlcbiAgfSxcbiAgaWRlbnRpZnk6IEFycmF5LmlzQXJyYXlcbn0pXG5cbmV4cG9ydCB7IHNlcVRhZyB9XG4iLCAiZnVuY3Rpb24gaXNQbGFpbk9iamVjdCAoZGF0YTogdW5rbm93bik6IGJvb2xlYW4ge1xuICBpZiAoZGF0YSA9PT0gbnVsbCB8fCB0eXBlb2YgZGF0YSAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShkYXRhKSkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihkYXRhKVxuICByZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZVxufVxuXG4vLyBQcm9qZWN0IGBvYmplY3RgIG9udG8gYGtleXNgLiBBYnNlbnQga2V5cyBhcmUgc2tpcHBlZCAoc28gdGhlIHJlc3VsdCBjYW4gYmVcbi8vIHNhZmVseSBzcHJlYWQgb3ZlciBkZWZhdWx0cyB3aXRob3V0IGNsb2JiZXJpbmcgdGhlbSB3aXRoIGB1bmRlZmluZWRgKSwgaGVuY2Vcbi8vIHRoZSBgUGFydGlhbGAgcmV0dXJuLlxuZnVuY3Rpb24gcGljazxUIGV4dGVuZHMgb2JqZWN0LCBLIGV4dGVuZHMga2V5b2YgVD4gKG9iamVjdDogVCwga2V5czogcmVhZG9ubHkgS1tdKTogUGFydGlhbDxQaWNrPFQsIEs+PiB7XG4gIGNvbnN0IHJlc3VsdDogUGFydGlhbDxQaWNrPFQsIEs+PiA9IHt9XG4gIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICBpZiAob2JqZWN0W2tleV0gIT09IHVuZGVmaW5lZCkgcmVzdWx0W2tleV0gPSBvYmplY3Rba2V5XVxuICB9XG4gIHJldHVybiByZXN1bHRcbn1cblxuZXhwb3J0IHtcbiAgaXNQbGFpbk9iamVjdCxcbiAgcGlja1xufVxuIiwgImltcG9ydCB7IGRlZmluZVNlcXVlbmNlVGFnIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuaW1wb3J0IHsgaXNQbGFpbk9iamVjdCB9IGZyb20gJy4uLy4uL2NvbW1vbi9vYmplY3QudHMnXG5cbmludGVyZmFjZSBPbWFwQ2FycmllciB7XG4gIGxpc3Q6IHVua25vd25bXVxuICBzZWVuOiBTZXQ8dW5rbm93bj5cbn1cblxuY29uc3Qgb21hcFRhZyA9IGRlZmluZVNlcXVlbmNlVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpvbWFwJywge1xuICBjcmVhdGU6ICgpOiBPbWFwQ2FycmllciA9PiAoeyBsaXN0OiBbXSwgc2VlbjogbmV3IFNldCgpIH0pLFxuICBhZGRJdGVtOiAoY2FycmllciwgaXRlbSkgPT4ge1xuICAgIGxldCBrZXk6IHVua25vd25cblxuICAgIGlmIChpdGVtIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICBpZiAoaXRlbS5zaXplICE9PSAxKSByZXR1cm4gJ2Nhbm5vdCByZXNvbHZlIGFuIG9yZGVyZWQgbWFwIGl0ZW0nXG4gICAgICBrZXkgPSBpdGVtLmtleXMoKS5uZXh0KCkudmFsdWVcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QoaXRlbSkpIHtcbiAgICAgIGNvbnN0IGl0ZW1LZXlzID0gT2JqZWN0LmtleXMoaXRlbSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilcbiAgICAgIGlmIChpdGVtS2V5cy5sZW5ndGggIT09IDEpIHJldHVybiAnY2Fubm90IHJlc29sdmUgYW4gb3JkZXJlZCBtYXAgaXRlbSdcbiAgICAgIGtleSA9IGl0ZW1LZXlzWzBdXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnY2Fubm90IHJlc29sdmUgYW4gb3JkZXJlZCBtYXAgaXRlbSdcbiAgICB9XG5cbiAgICBpZiAoY2Fycmllci5zZWVuLmhhcyhrZXkpKSByZXR1cm4gJ2R1cGxpY2F0ZSBrZXkgaW4gb3JkZXJlZCBtYXAnXG4gICAgY2Fycmllci5zZWVuLmFkZChrZXkpXG4gICAgY2Fycmllci5saXN0LnB1c2goaXRlbSlcbiAgICByZXR1cm4gJydcbiAgfSxcbiAgZmluYWxpemU6IChjYXJyaWVyKTogdW5rbm93bltdID0+IGNhcnJpZXIubGlzdFxufSlcblxuZXhwb3J0IHsgb21hcFRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2VxdWVuY2VUYWcgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbnR5cGUgUGFpciA9IFt1bmtub3duLCB1bmtub3duXVxuXG5jb25zdCBwYWlyc1RhZyA9IGRlZmluZVNlcXVlbmNlVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpwYWlycycsIHtcbiAgY3JlYXRlOiAoKSA9PiBbXSBhcyBQYWlyW10sXG4gIGFkZEl0ZW06IChjb250YWluZXIsIGl0ZW0pID0+IHtcbiAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgaWYgKGl0ZW0uc2l6ZSAhPT0gMSkgcmV0dXJuICdjYW5ub3QgcmVzb2x2ZSBhIHBhaXJzIGl0ZW0nXG5cbiAgICAgIGNvbnRhaW5lci5wdXNoKGl0ZW0uZW50cmllcygpLm5leHQoKS52YWx1ZSEpXG4gICAgICByZXR1cm4gJydcbiAgICB9XG5cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGl0ZW0pICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgcmV0dXJuICdjYW5ub3QgcmVzb2x2ZSBhIHBhaXJzIGl0ZW0nXG4gICAgfVxuXG4gICAgY29uc3Qgb2JqZWN0ID0gaXRlbSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpXG5cbiAgICBpZiAoa2V5cy5sZW5ndGggIT09IDEpIHJldHVybiAnY2Fubm90IHJlc29sdmUgYSBwYWlycyBpdGVtJ1xuXG4gICAgY29udGFpbmVyLnB1c2goW2tleXNbMF0sIG9iamVjdFtrZXlzWzBdXV0gc2F0aXNmaWVzIFBhaXIpXG4gICAgcmV0dXJuICcnXG4gIH1cbn0pXG5cbmV4cG9ydCB7IHBhaXJzVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVNYXBwaW5nVGFnIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuaW1wb3J0IHsgaXNQbGFpbk9iamVjdCB9IGZyb20gJy4uLy4uL2NvbW1vbi9vYmplY3QudHMnXG5cbnR5cGUgU3RyaW5nTWFwcGluZyA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+XG5cbmNvbnN0IG1hcFRhZyA9IGRlZmluZU1hcHBpbmdUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOm1hcCcsIHtcbiAgY3JlYXRlOiAoKTogU3RyaW5nTWFwcGluZyA9PiAoe30pLFxuICBpZGVudGlmeTogaXNQbGFpbk9iamVjdCxcbiAgLy8gRHVtcCBzaWRlOiB3cmFwIHRoZSBwbGFpbiBvYmplY3QgaW50byB0aGUgY2Fub25pY2FsIGBNYXBgIGZvcm0gdGhlIHdyaXRlclxuICAvLyB3YWxrcy4gU2hhbGxvdyDigJQga2V5cy92YWx1ZXMgc3RheSByZWZlcmVuY2VzIHRvIHRoZSBvcmlnaW5hbHMuXG4gIHJlcHJlc2VudDogKG86IFN0cmluZ01hcHBpbmcpID0+IHtcbiAgICBjb25zdCBtYXAgPSBuZXcgTWFwPHN0cmluZywgdW5rbm93bj4oKVxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG8pKSBtYXAuc2V0KGtleSwgb1trZXldKVxuICAgIHJldHVybiBtYXBcbiAgfSxcbiAgYWRkUGFpcjogKGNvbnRhaW5lciwga2V5LCB2YWx1ZSkgPT4ge1xuICAgIGlmIChrZXkgIT09IG51bGwgJiYgdHlwZW9mIGtleSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiAnb2JqZWN0LWJhc2VkIG1hcCBkb2VzIG5vdCBzdXBwb3J0IGNvbXBsZXgga2V5cydcbiAgICB9XG4gICAgY29uc3Qgbm9ybWFsaXplZEtleSA9IFN0cmluZyhrZXkpXG4gICAgaWYgKG5vcm1hbGl6ZWRLZXkgPT09ICdfX3Byb3RvX18nKSB7XG4gICAgICAvLyBEZWZpbmUgYXMgYW4gb3duIGRhdGEgcHJvcGVydHkgc28gYSBsaXRlcmFsIGBfX3Byb3RvX19gIGtleSBzdGF5cyBkYXRhXG4gICAgICAvLyBhbmQgbmV2ZXIgaW52b2tlcyB0aGUgcHJvdG90eXBlIHNldHRlci5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb250YWluZXIsIG5vcm1hbGl6ZWRLZXksIHtcbiAgICAgICAgdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRhaW5lcltub3JtYWxpemVkS2V5XSA9IHZhbHVlXG4gICAgfVxuICAgIHJldHVybiAnJ1xuICB9LFxuICAvLyBoYXNPd24sIG5vdCBgaW5gOiBhIHBsYWluIG9iamVjdCBpbmhlcml0cyBgdG9TdHJpbmdgIGFuZCBmcmllbmRzLlxuICBoYXM6IChjb250YWluZXIsIGtleSkgPT4ge1xuICAgIGlmIChrZXkgIT09IG51bGwgJiYgdHlwZW9mIGtleSA9PT0gJ29iamVjdCcpIHJldHVybiBmYWxzZVxuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY29udGFpbmVyLCBTdHJpbmcoa2V5KSlcbiAgfSxcbiAga2V5czogKGNvbnRhaW5lcikgPT4gT2JqZWN0LmtleXMoY29udGFpbmVyKSxcbiAgZ2V0OiAoY29udGFpbmVyLCBrZXkpID0+IGNvbnRhaW5lcltTdHJpbmcoa2V5KV1cbn0pXG5cbmV4cG9ydCB7IG1hcFRhZywgaXNQbGFpbk9iamVjdCwgdHlwZSBTdHJpbmdNYXBwaW5nIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVNYXBwaW5nVGFnIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG5jb25zdCBzZXRUYWcgPSBkZWZpbmVNYXBwaW5nVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpzZXQnLCB7XG4gIGNyZWF0ZTogKCkgPT4gbmV3IFNldDx1bmtub3duPigpLFxuICBpZGVudGlmeTogKGRhdGEpID0+IGRhdGEgaW5zdGFuY2VvZiBTZXQsXG4gIHJlcHJlc2VudDogKGRhdGE6IFNldDx1bmtub3duPikgPT4ge1xuICAgIGNvbnN0IG1hcCA9IG5ldyBNYXA8dW5rbm93biwgbnVsbD4oKVxuICAgIGZvciAoY29uc3Qga2V5IG9mIGRhdGEpIG1hcC5zZXQoa2V5LCBudWxsKVxuICAgIHJldHVybiBtYXBcbiAgfSxcbiAgYWRkUGFpcjogKGNvbnRhaW5lciwga2V5LCB2YWx1ZSkgPT4ge1xuICAgIGlmICh2YWx1ZSAhPT0gbnVsbCkgcmV0dXJuICdjYW5ub3QgcmVzb2x2ZSBhIHNldCBpdGVtJ1xuICAgIGNvbnRhaW5lci5hZGQoa2V5KVxuICAgIHJldHVybiAnJ1xuICB9LFxuICBoYXM6IChjb250YWluZXIsIGtleSkgPT4gY29udGFpbmVyLmhhcyhrZXkpLFxuICBrZXlzOiAoY29udGFpbmVyKSA9PiBjb250YWluZXIua2V5cygpLFxuICBnZXQ6ICgpID0+IG51bGxcbn0pXG5cbmV4cG9ydCB7IHNldFRhZyB9XG4iLCAiaW1wb3J0IHtcbiAgdHlwZSBNYXBwaW5nVGFnRGVmaW5pdGlvbixcbiAgdHlwZSBTY2FsYXJUYWdEZWZpbml0aW9uLFxuICB0eXBlIFNlcXVlbmNlVGFnRGVmaW5pdGlvbixcbiAgdHlwZSBUYWdEZWZpbml0aW9uXG59IGZyb20gJy4vdGFnLnRzJ1xuaW1wb3J0IHsgc3RyVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL3N0ci50cydcbmltcG9ydCB7IG51bGxDb3JlVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL251bGxfY29yZS50cydcbmltcG9ydCB7IG51bGxKc29uVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL251bGxfanNvbi50cydcbmltcG9ydCB7IG51bGxZYW1sMTFUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvbnVsbF95YW1sMTEudHMnXG5pbXBvcnQgeyBib29sQ29yZVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9ib29sX2NvcmUudHMnXG5pbXBvcnQgeyBib29sSnNvblRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9ib29sX2pzb24udHMnXG5pbXBvcnQgeyBib29sWWFtbDExVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2Jvb2xfeWFtbDExLnRzJ1xuaW1wb3J0IHsgaW50Q29yZVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9pbnRfY29yZS50cydcbmltcG9ydCB7IGludEpzb25UYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvaW50X2pzb24udHMnXG5pbXBvcnQgeyBpbnRZYW1sMTFUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvaW50X3lhbWwxMS50cydcbmltcG9ydCB7IGZsb2F0Q29yZVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9mbG9hdF9jb3JlLnRzJ1xuaW1wb3J0IHsgZmxvYXRKc29uVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2Zsb2F0X2pzb24udHMnXG5pbXBvcnQgeyBmbG9hdFlhbWwxMVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9mbG9hdF95YW1sMTEudHMnXG5pbXBvcnQgeyBtZXJnZVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9tZXJnZS50cydcbmltcG9ydCB7IGJpbmFyeVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9iaW5hcnkudHMnXG5pbXBvcnQgeyB0aW1lc3RhbXBUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvdGltZXN0YW1wLnRzJ1xuaW1wb3J0IHsgc2VxVGFnIH0gZnJvbSAnLi90YWcvc2VxdWVuY2Uvc2VxLnRzJ1xuaW1wb3J0IHsgb21hcFRhZyB9IGZyb20gJy4vdGFnL3NlcXVlbmNlL29tYXAudHMnXG5pbXBvcnQgeyBwYWlyc1RhZyB9IGZyb20gJy4vdGFnL3NlcXVlbmNlL3BhaXJzLnRzJ1xuaW1wb3J0IHsgbWFwVGFnIH0gZnJvbSAnLi90YWcvbWFwcGluZy9tYXAudHMnXG5pbXBvcnQgeyBzZXRUYWcgfSBmcm9tICcuL3RhZy9tYXBwaW5nL3NldC50cydcblxuaW50ZXJmYWNlIFRhZ0RlZmluaXRpb25NYXAge1xuICBzY2FsYXI6IFJlY29yZDxzdHJpbmcsIFNjYWxhclRhZ0RlZmluaXRpb24+XG4gIHNlcXVlbmNlOiBSZWNvcmQ8c3RyaW5nLCBTZXF1ZW5jZVRhZ0RlZmluaXRpb24+XG4gIG1hcHBpbmc6IFJlY29yZDxzdHJpbmcsIE1hcHBpbmdUYWdEZWZpbml0aW9uPlxufVxuXG5pbnRlcmZhY2UgVGFnRGVmaW5pdGlvbkxpc3RNYXAge1xuICBzY2FsYXI6IFNjYWxhclRhZ0RlZmluaXRpb25bXVxuICBzZXF1ZW5jZTogU2VxdWVuY2VUYWdEZWZpbml0aW9uW11cbiAgbWFwcGluZzogTWFwcGluZ1RhZ0RlZmluaXRpb25bXVxufVxuXG5mdW5jdGlvbiBjcmVhdGVUYWdEZWZpbml0aW9uTWFwICgpOiBUYWdEZWZpbml0aW9uTWFwIHtcbiAgcmV0dXJuIHtcbiAgICBzY2FsYXI6IHt9LFxuICAgIHNlcXVlbmNlOiB7fSxcbiAgICBtYXBwaW5nOiB7fVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRhZ0RlZmluaXRpb25MaXN0TWFwICgpOiBUYWdEZWZpbml0aW9uTGlzdE1hcCB7XG4gIHJldHVybiB7XG4gICAgc2NhbGFyOiBbXSxcbiAgICBzZXF1ZW5jZTogW10sXG4gICAgbWFwcGluZzogW11cbiAgfVxufVxuXG5mdW5jdGlvbiBjb21waWxlVGFncyAodGFnczogcmVhZG9ubHkgVGFnRGVmaW5pdGlvbltdKSB7XG4gIGNvbnN0IHJlc3VsdDogVGFnRGVmaW5pdGlvbltdID0gW11cblxuICBmb3IgKGNvbnN0IHRhZyBvZiB0YWdzKSB7XG4gICAgbGV0IGluZGV4ID0gcmVzdWx0Lmxlbmd0aFxuXG4gICAgZm9yIChsZXQgcHJldmlvdXNJbmRleCA9IDA7IHByZXZpb3VzSW5kZXggPCByZXN1bHQubGVuZ3RoOyBwcmV2aW91c0luZGV4KyspIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzID0gcmVzdWx0W3ByZXZpb3VzSW5kZXhdXG5cbiAgICAgIGlmIChwcmV2aW91cy5ub2RlS2luZCA9PT0gdGFnLm5vZGVLaW5kICYmXG4gICAgICAgICAgcHJldmlvdXMudGFnTmFtZSA9PT0gdGFnLnRhZ05hbWUgJiZcbiAgICAgICAgICBwcmV2aW91cy5tYXRjaEJ5VGFnUHJlZml4ID09PSB0YWcubWF0Y2hCeVRhZ1ByZWZpeCkge1xuICAgICAgICBpbmRleCA9IHByZXZpb3VzSW5kZXhcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXN1bHRbaW5kZXhdID0gdGFnXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbmNsYXNzIFNjaGVtYSB7XG4gIHJlYWRvbmx5IHRhZ3M6IHJlYWRvbmx5IFRhZ0RlZmluaXRpb25bXVxuICByZWFkb25seSBpbXBsaWNpdFNjYWxhclRhZ3M6IHJlYWRvbmx5IFNjYWxhclRhZ0RlZmluaXRpb25bXVxuICAvLyBEaXNwYXRjaCBpbXBsaWNpdCBzY2FsYXIgcmVzb2x2ZXJzIGJ5IGBzb3VyY2UuY2hhckF0KDApYC4gRWFjaCBidWNrZXQgaG9sZHMgdGhlXG4gIC8vIHJlc29sdmVycyB0aGF0IG1heSBtYXRjaCB0aGF0IGtleSwgaW4gc2NoZW1hIG9yZGVyOyBhIGtleSBhYnNlbnQgZnJvbSB0aGUgbWFwXG4gIC8vIHVzZXMgYGltcGxpY2l0U2NhbGFyQW55Rmlyc3RDaGFyYCAocmVzb2x2ZXJzIHRoYXQgZGVjbGFyZWQgbm8gZmlyc3QtY2hhclxuICAvLyBjb25zdHJhaW50LCBzbyB0aGV5IGFwcGx5IHRvIGFueSBmaXJzdCBjaGFyYWN0ZXIpLlxuICByZWFkb25seSBpbXBsaWNpdFNjYWxhckJ5Rmlyc3RDaGFyOiBSZWFkb25seU1hcDxzdHJpbmcsIHJlYWRvbmx5IFNjYWxhclRhZ0RlZmluaXRpb25bXT5cbiAgcmVhZG9ubHkgaW1wbGljaXRTY2FsYXJBbnlGaXJzdENoYXI6IHJlYWRvbmx5IFNjYWxhclRhZ0RlZmluaXRpb25bXVxuICAvLyBUaGUgZGVmYXVsdCBzY2FsYXIgdGFnIChgISFzdHJgKSwgcmVzb2x2ZWQgb25jZSBzbyB0aGUgY29tcG9zZXIncyBmYWxsYmFjayBmb3JcbiAgLy8gdW5yZXNvbHZlZCBwbGFpbiBzY2FsYXJzIGF2b2lkcyBhIGtleWVkIGxvb2t1cCBwZXIgc2NhbGFyLlxuICByZWFkb25seSBkZWZhdWx0U2NhbGFyVGFnOiBTY2FsYXJUYWdEZWZpbml0aW9uXG4gIC8vIFRoZSBkZWZhdWx0IGNvbnRhaW5lciB0YWdzIChgISFzZXFgIC8gYCEhbWFwYCksIHVzZWQgYnkgdGhlIGR1bXBlcjogd2hlbiBhXG4gIC8vIHZhbHVlIGlzIGlkZW50aWZpZWQgYnkgaXRzIGRlZmF1bHQgdGFnLCB0aGUgdGFnIGlzIGltcGxpY2l0IGFuZCBub3QgcHJpbnRlZC5cbiAgLy8gVW5kZWZpbmVkIGlmIHRoZSBzY2hlbWEgZG9lcyBub3QgZGVmaW5lIHRoZW0gKHRoZW4gc3VjaCB2YWx1ZXMgY2FuJ3QgYmUgZHVtcGVkKS5cbiAgcmVhZG9ubHkgZGVmYXVsdFNlcXVlbmNlVGFnOiBTZXF1ZW5jZVRhZ0RlZmluaXRpb24gfCB1bmRlZmluZWRcbiAgcmVhZG9ubHkgZGVmYXVsdE1hcHBpbmdUYWc6IE1hcHBpbmdUYWdEZWZpbml0aW9uIHwgdW5kZWZpbmVkXG4gIHJlYWRvbmx5IGV4YWN0OiBUYWdEZWZpbml0aW9uTWFwXG4gIHJlYWRvbmx5IHByZWZpeDogVGFnRGVmaW5pdGlvbkxpc3RNYXBcblxuICBjb25zdHJ1Y3RvciAodGFnczogcmVhZG9ubHkgVGFnRGVmaW5pdGlvbltdKSB7XG4gICAgY29uc3QgY29tcGlsZWRUYWdzID0gY29tcGlsZVRhZ3ModGFncylcbiAgICBjb25zdCBpbXBsaWNpdFNjYWxhclRhZ3M6IFNjYWxhclRhZ0RlZmluaXRpb25bXSA9IFtdXG4gICAgY29uc3QgZXhhY3QgPSBjcmVhdGVUYWdEZWZpbml0aW9uTWFwKClcbiAgICBjb25zdCBwcmVmaXggPSBjcmVhdGVUYWdEZWZpbml0aW9uTGlzdE1hcCgpXG5cbiAgICBmb3IgKGNvbnN0IHRhZyBvZiBjb21waWxlZFRhZ3MpIHtcbiAgICAgIGlmICh0YWcubm9kZUtpbmQgPT09ICdzY2FsYXInICYmIHRhZy5pbXBsaWNpdCkge1xuICAgICAgICBpZiAodGFnLm1hdGNoQnlUYWdQcmVmaXgpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ltcGxpY2l0IHNjYWxhciB0YWdzIGNhbm5vdCBtYXRjaCBieSB0YWcgcHJlZml4JylcbiAgICAgICAgfVxuXG4gICAgICAgIGltcGxpY2l0U2NhbGFyVGFncy5wdXNoKHRhZylcbiAgICAgIH1cblxuICAgICAgc3dpdGNoICh0YWcubm9kZUtpbmQpIHtcbiAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICBpZiAodGFnLm1hdGNoQnlUYWdQcmVmaXgpIHByZWZpeC5zY2FsYXIucHVzaCh0YWcpXG4gICAgICAgICAgZWxzZSBleGFjdC5zY2FsYXJbdGFnLnRhZ05hbWVdID0gdGFnXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnc2VxdWVuY2UnOlxuICAgICAgICAgIGlmICh0YWcubWF0Y2hCeVRhZ1ByZWZpeCkgcHJlZml4LnNlcXVlbmNlLnB1c2godGFnKVxuICAgICAgICAgIGVsc2UgZXhhY3Quc2VxdWVuY2VbdGFnLnRhZ05hbWVdID0gdGFnXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnbWFwcGluZyc6XG4gICAgICAgICAgaWYgKHRhZy5tYXRjaEJ5VGFnUHJlZml4KSBwcmVmaXgubWFwcGluZy5wdXNoKHRhZylcbiAgICAgICAgICBlbHNlIGV4YWN0Lm1hcHBpbmdbdGFnLnRhZ05hbWVdID0gdGFnXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbXBsaWNpdFNjYWxhckFueUZpcnN0Q2hhciA9IGltcGxpY2l0U2NhbGFyVGFncy5maWx0ZXIodGFnID0+IHRhZy5pbXBsaWNpdEZpcnN0Q2hhcnMgPT09IG51bGwpXG5cbiAgICBjb25zdCBrZXlzID0gbmV3IFNldDxzdHJpbmc+KClcbiAgICBmb3IgKGNvbnN0IHRhZyBvZiBpbXBsaWNpdFNjYWxhclRhZ3MpIHtcbiAgICAgIGlmICh0YWcuaW1wbGljaXRGaXJzdENoYXJzICE9PSBudWxsKSB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHRhZy5pbXBsaWNpdEZpcnN0Q2hhcnMpIGtleXMuYWRkKGtleSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbXBsaWNpdFNjYWxhckJ5Rmlyc3RDaGFyID0gbmV3IE1hcDxzdHJpbmcsIFNjYWxhclRhZ0RlZmluaXRpb25bXT4oKVxuICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICAgIGltcGxpY2l0U2NhbGFyQnlGaXJzdENoYXIuc2V0KGtleSwgaW1wbGljaXRTY2FsYXJUYWdzLmZpbHRlcih0YWcgPT5cbiAgICAgICAgdGFnLmltcGxpY2l0Rmlyc3RDaGFycyA9PT0gbnVsbCB8fCB0YWcuaW1wbGljaXRGaXJzdENoYXJzLmluZGV4T2Yoa2V5KSAhPT0gLTEpKVxuICAgIH1cblxuICAgIGNvbnN0IGRlZmF1bHRTY2FsYXJUYWcgPSBleGFjdC5zY2FsYXJbJ3RhZzp5YW1sLm9yZywyMDAyOnN0ciddXG4gICAgaWYgKCFkZWZhdWx0U2NhbGFyVGFnKSB0aHJvdyBuZXcgRXJyb3IoJ3NjaGVtYSBkb2VzIG5vdCBkZWZpbmUgdGhlIGRlZmF1bHQgc2NhbGFyIHRhZyAodGFnOnlhbWwub3JnLDIwMDI6c3RyKScpXG5cbiAgICB0aGlzLnRhZ3MgPSBjb21waWxlZFRhZ3NcbiAgICB0aGlzLmltcGxpY2l0U2NhbGFyVGFncyA9IGltcGxpY2l0U2NhbGFyVGFnc1xuICAgIHRoaXMuaW1wbGljaXRTY2FsYXJCeUZpcnN0Q2hhciA9IGltcGxpY2l0U2NhbGFyQnlGaXJzdENoYXJcbiAgICB0aGlzLmltcGxpY2l0U2NhbGFyQW55Rmlyc3RDaGFyID0gaW1wbGljaXRTY2FsYXJBbnlGaXJzdENoYXJcbiAgICB0aGlzLmRlZmF1bHRTY2FsYXJUYWcgPSBkZWZhdWx0U2NhbGFyVGFnXG4gICAgdGhpcy5kZWZhdWx0U2VxdWVuY2VUYWcgPSBleGFjdC5zZXF1ZW5jZVsndGFnOnlhbWwub3JnLDIwMDI6c2VxJ11cbiAgICB0aGlzLmRlZmF1bHRNYXBwaW5nVGFnID0gZXhhY3QubWFwcGluZ1sndGFnOnlhbWwub3JnLDIwMDI6bWFwJ11cbiAgICB0aGlzLmV4YWN0ID0gZXhhY3RcbiAgICB0aGlzLnByZWZpeCA9IHByZWZpeFxuICB9XG5cbiAgd2l0aFRhZ3MgKC4uLnRhZ3M6IEFycmF5PFRhZ0RlZmluaXRpb24gfCByZWFkb25seSBUYWdEZWZpbml0aW9uW10+KTogU2NoZW1hIHtcbiAgICBsZXQgZmxhdFRhZ3M6IFRhZ0RlZmluaXRpb25bXSA9IFtdXG4gICAgZm9yIChjb25zdCB0YWcgb2YgdGFncykgZmxhdFRhZ3MgPSBmbGF0VGFncy5jb25jYXQodGFnKVxuXG4gICAgcmV0dXJuIG5ldyBTY2hlbWEoWy4uLnRoaXMudGFncywgLi4uZmxhdFRhZ3NdKVxuICB9XG59XG5cbmNvbnN0IEZBSUxTQUZFX1NDSEVNQSA9IG5ldyBTY2hlbWEoW1xuICBzdHJUYWcsXG4gIHNlcVRhZyxcbiAgbWFwVGFnXG5dKVxuXG5jb25zdCBKU09OX1NDSEVNQSA9IG5ldyBTY2hlbWEoW1xuICAuLi5GQUlMU0FGRV9TQ0hFTUEudGFncyxcbiAgbnVsbEpzb25UYWcsXG4gIGJvb2xKc29uVGFnLFxuICBpbnRKc29uVGFnLFxuICBmbG9hdEpzb25UYWdcbl0pXG5cbmNvbnN0IENPUkVfU0NIRU1BID0gbmV3IFNjaGVtYShbXG4gIC4uLkZBSUxTQUZFX1NDSEVNQS50YWdzLFxuICBudWxsQ29yZVRhZyxcbiAgYm9vbENvcmVUYWcsXG4gIGludENvcmVUYWcsXG4gIGZsb2F0Q29yZVRhZ1xuXSlcblxuY29uc3QgWUFNTDExX1NDSEVNQSA9IG5ldyBTY2hlbWEoW1xuICAuLi5GQUlMU0FGRV9TQ0hFTUEudGFncyxcbiAgbnVsbFlhbWwxMVRhZyxcbiAgYm9vbFlhbWwxMVRhZyxcbiAgaW50WWFtbDExVGFnLFxuICBmbG9hdFlhbWwxMVRhZyxcbiAgdGltZXN0YW1wVGFnLFxuICBtZXJnZVRhZyxcbiAgYmluYXJ5VGFnLFxuICBvbWFwVGFnLFxuICBwYWlyc1RhZyxcbiAgc2V0VGFnXG5dKVxuXG5leHBvcnQge1xuICBTY2hlbWEsXG4gIEZBSUxTQUZFX1NDSEVNQSxcbiAgSlNPTl9TQ0hFTUEsXG4gIENPUkVfU0NIRU1BLFxuICBZQU1MMTFfU0NIRU1BLFxuXG4gIHR5cGUgVGFnRGVmaW5pdGlvbk1hcCxcbiAgdHlwZSBUYWdEZWZpbml0aW9uTGlzdE1hcFxufVxuIiwgImltcG9ydCB7IGRlZmluZU1hcHBpbmdUYWcgfSBmcm9tICcuLi8uLi90YWcudHMnXG5pbXBvcnQgeyBpc1BsYWluT2JqZWN0IH0gZnJvbSAnLi4vLi4vY29tbW9uL29iamVjdC50cydcblxudHlwZSBSZWFsTWFwcGluZyA9IE1hcDx1bmtub3duLCB1bmtub3duPlxuXG4vLyBBIG1hcHBpbmcgcmVwcmVzZW50ZWQgYXMgYSByZWFsIGBNYXBgOiBrZXlzIGtlZXAgdGhlaXIgY29uc3RydWN0ZWQgdHlwZSxcbi8vIG5vdGhpbmcgaXMgc3RyaW5naWZpZWQuIERyb3AtaW4gcmVwbGFjZW1lbnQgZm9yIHRoZSBkZWZhdWx0IGAhIW1hcGAgdGFnXG4vLyAoc2FtZSB0YWcgbmFtZSkg4oCUIGBDT1JFX1NDSEVNQS53aXRoVGFncyhyZWFsTWFwVGFnKWAuXG5jb25zdCByZWFsTWFwVGFnID0gZGVmaW5lTWFwcGluZ1RhZygndGFnOnlhbWwub3JnLDIwMDI6bWFwJywge1xuICBjcmVhdGU6ICgpID0+IG5ldyBNYXA8dW5rbm93biwgdW5rbm93bj4oKSxcbiAgYWRkUGFpcjogKGNvbnRhaW5lcjogUmVhbE1hcHBpbmcsIGtleSwgdmFsdWUpID0+IHtcbiAgICBjb250YWluZXIuc2V0KGtleSwgdmFsdWUpXG4gICAgcmV0dXJuICcnXG4gIH0sXG4gIGhhczogKGNvbnRhaW5lcjogUmVhbE1hcHBpbmcsIGtleSkgPT4gY29udGFpbmVyLmhhcyhrZXkpLFxuICBrZXlzOiAoY29udGFpbmVyOiBSZWFsTWFwcGluZykgPT4gY29udGFpbmVyLmtleXMoKSxcbiAgZ2V0OiAoY29udGFpbmVyOiBSZWFsTWFwcGluZywga2V5KSA9PiBjb250YWluZXIuZ2V0KGtleSksXG4gIC8vIER1bXAgc2lkZTogaGFuZGxlIGJvdGggYSByZWFsIGBNYXBgIGFuZCBhIHBsYWluIG9iamVjdCwgc28gdGhpcyB0YWcgZnVsbHlcbiAgLy8gcmVwbGFjZXMgdGhlIGRlZmF1bHQgbWFwIHJlcHJlc2VudGF0aW9uIHdoZW4gZHVtcGluZyB0b28uXG4gIGlkZW50aWZ5OiAoZGF0YSkgPT4gZGF0YSBpbnN0YW5jZW9mIE1hcCB8fCBpc1BsYWluT2JqZWN0KGRhdGEpLFxuICAvLyBEdW1wIHNpZGU6IHRoZSBjYW5vbmljYWwgbWFwcGluZyBmb3JtIGlzIGEgYE1hcGAuIEEgcmVhbCBgTWFwYCBwYXNzZXNcbiAgLy8gdGhyb3VnaCB1bnRvdWNoZWQgKGtleXMga2VlcCB0aGVpciB0eXBlKTsgYSBwbGFpbiBvYmplY3QgaXMgd3JhcHBlZFxuICAvLyBzaGFsbG93bHkuIExvc3NsZXNzIOKAlCBub3RoaW5nIGlzIHN0cmluZ2lmaWVkLlxuICByZXByZXNlbnQ6IChkYXRhKSA9PiB7XG4gICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBNYXApIHJldHVybiBkYXRhXG4gICAgY29uc3QgbWFwID0gbmV3IE1hcDx1bmtub3duLCB1bmtub3duPigpXG4gICAgY29uc3Qgb2JqID0gZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG9iaikpIG1hcC5zZXQoa2V5LCBvYmpba2V5XSlcbiAgICByZXR1cm4gbWFwXG4gIH1cbn0pXG5cbmV4cG9ydCB7IHJlYWxNYXBUYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZU1hcHBpbmdUYWcgfSBmcm9tICcuLi8uLi90YWcudHMnXG5pbXBvcnQgeyBpc1BsYWluT2JqZWN0IH0gZnJvbSAnLi4vLi4vY29tbW9uL29iamVjdC50cydcblxudHlwZSBTdHJpbmdNYXBwaW5nID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj5cblxuLy8gQ29lcmNlIGEgY29uc3RydWN0ZWQga2V5IGludG8gdGhlIHN0cmluZyBpZGVudGl0eSBhIGB7fWAgcmVwcmVzZW50YXRpb24gdXNlcy5cbi8vIFJldHVybnMgbnVsbCBmb3IgYSBuZXN0ZWQgYXJyYXkga2V5IChhbiBhcnJheSBlbGVtZW50IHRoYXQgaXMgaXRzZWxmIGFuXG4vLyBhcnJheSksIHdoaWNoIHdvdWxkIG90aGVyd2lzZSBibG93IHVwIGV4cG9uZW50aWFsbHkgd2hlbiBzdHJpbmdpZmllZCB2aWFcbi8vIGFsaWFzZXMuXG5mdW5jdGlvbiBub3JtYWxpemVLZXkgKGtleTogdW5rbm93bik6IHN0cmluZyB8IG51bGwge1xuICBpZiAoQXJyYXkuaXNBcnJheShrZXkpKSB7XG4gICAgY29uc3QgYXJyYXkgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChrZXkpIGFzIHVua25vd25bXVxuXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGFycmF5Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyYXlbaW5kZXhdKSkgcmV0dXJuIG51bGxcblxuICAgICAgaWYgKHR5cGVvZiBhcnJheVtpbmRleF0gPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFycmF5W2luZGV4XSkgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICAgIGFycmF5W2luZGV4XSA9ICdbb2JqZWN0IE9iamVjdF0nXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFN0cmluZyhhcnJheSlcbiAgfVxuXG4gIGlmICh0eXBlb2Yga2V5ID09PSAnb2JqZWN0JyAmJlxuICAgICAgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGtleSkgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgcmV0dXJuICdbb2JqZWN0IE9iamVjdF0nXG4gIH1cblxuICByZXR1cm4gU3RyaW5nKGtleSlcbn1cblxuY29uc3QgbGVnYWN5TWFwVGFnID0gZGVmaW5lTWFwcGluZ1RhZygndGFnOnlhbWwub3JnLDIwMDI6bWFwJywge1xuICBjcmVhdGU6ICgpOiBTdHJpbmdNYXBwaW5nID0+ICh7fSksXG4gIGlkZW50aWZ5OiBpc1BsYWluT2JqZWN0LFxuICAvLyBEdW1wIHNpZGU6IHdyYXAgdGhlIHBsYWluIG9iamVjdCBpbnRvIHRoZSBjYW5vbmljYWwgYE1hcGAgZm9ybSB0aGUgd3JpdGVyXG4gIC8vIHdhbGtzLiBTaGFsbG93IOKAlCBrZXlzL3ZhbHVlcyBzdGF5IHJlZmVyZW5jZXMgdG8gdGhlIG9yaWdpbmFscy5cbiAgcmVwcmVzZW50OiAobzogU3RyaW5nTWFwcGluZykgPT4ge1xuICAgIGNvbnN0IG1hcCA9IG5ldyBNYXA8c3RyaW5nLCB1bmtub3duPigpXG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMobykpIG1hcC5zZXQoa2V5LCBvW2tleV0pXG4gICAgcmV0dXJuIG1hcFxuICB9LFxuICBhZGRQYWlyOiAoY29udGFpbmVyLCBrZXksIHZhbHVlKSA9PiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZEtleSA9IG5vcm1hbGl6ZUtleShrZXkpXG4gICAgaWYgKG5vcm1hbGl6ZWRLZXkgPT09IG51bGwpIHJldHVybiAnbmVzdGVkIGFycmF5cyBhcmUgbm90IHN1cHBvcnRlZCBpbnNpZGUga2V5cydcbiAgICBpZiAobm9ybWFsaXplZEtleSA9PT0gJ19fcHJvdG9fXycpIHtcbiAgICAgIC8vIERlZmluZSBhcyBhbiBvd24gZGF0YSBwcm9wZXJ0eSBzbyBhIGxpdGVyYWwgYF9fcHJvdG9fX2Aga2V5IHN0YXlzIGRhdGFcbiAgICAgIC8vIGFuZCBuZXZlciBpbnZva2VzIHRoZSBwcm90b3R5cGUgc2V0dGVyLlxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnRhaW5lciwgbm9ybWFsaXplZEtleSwge1xuICAgICAgICB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGFpbmVyW25vcm1hbGl6ZWRLZXldID0gdmFsdWVcbiAgICB9XG4gICAgcmV0dXJuICcnXG4gIH0sXG4gIC8vIGhhc093biwgbm90IGBpbmA6IGEgcGxhaW4gb2JqZWN0IGluaGVyaXRzIGB0b1N0cmluZ2AgYW5kIGZyaWVuZHMuXG4gIGhhczogKGNvbnRhaW5lciwga2V5KSA9PiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZEtleSA9IG5vcm1hbGl6ZUtleShrZXkpXG4gICAgcmV0dXJuIG5vcm1hbGl6ZWRLZXkgIT09IG51bGwgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRhaW5lciwgbm9ybWFsaXplZEtleSlcbiAgfSxcbiAga2V5czogKGNvbnRhaW5lcikgPT4gT2JqZWN0LmtleXMoY29udGFpbmVyKSxcbiAgZ2V0OiAoY29udGFpbmVyLCBrZXkpID0+IGNvbnRhaW5lcltTdHJpbmcoa2V5KV1cbn0pXG5cbmV4cG9ydCB7IGxlZ2FjeU1hcFRhZywgaXNQbGFpbk9iamVjdCwgdHlwZSBTdHJpbmdNYXBwaW5nIH1cbiIsICJleHBvcnQgaW50ZXJmYWNlIFNuaXBwZXRNYXJrIHtcbiAgbmFtZT86IHN0cmluZyB8IG51bGxcbiAgYnVmZmVyOiBzdHJpbmdcbiAgcG9zaXRpb246IG51bWJlclxuICBsaW5lOiBudW1iZXJcbiAgY29sdW1uOiBudW1iZXJcbiAgc25pcHBldD86IHN0cmluZyB8IG51bGxcbn1cblxuaW50ZXJmYWNlIFNuaXBwZXRPcHRpb25zIHtcbiAgbWF4TGVuZ3RoPzogbnVtYmVyXG4gIGluZGVudD86IG51bWJlclxuICBsaW5lc0JlZm9yZT86IG51bWJlclxuICBsaW5lc0FmdGVyPzogbnVtYmVyXG59XG5cbmNvbnN0IERFRkFVTFRfU05JUFBFVF9PUFRJT05TOiBSZXF1aXJlZDxTbmlwcGV0T3B0aW9ucz4gPSB7XG4gIG1heExlbmd0aDogNzksXG4gIGluZGVudDogMSxcbiAgbGluZXNCZWZvcmU6IDMsXG4gIGxpbmVzQWZ0ZXI6IDJcbn1cblxuLy8gZ2V0IHNuaXBwZXQgZm9yIGEgc2luZ2xlIGxpbmUsIHJlc3BlY3RpbmcgbWF4TGVuZ3RoXG5mdW5jdGlvbiBnZXRMaW5lIChidWZmZXI6IHN0cmluZywgbGluZVN0YXJ0OiBudW1iZXIsIGxpbmVFbmQ6IG51bWJlciwgcG9zaXRpb246IG51bWJlciwgbWF4TGluZUxlbmd0aDogbnVtYmVyKSB7XG4gIGxldCBoZWFkID0gJydcbiAgbGV0IHRhaWwgPSAnJ1xuICBjb25zdCBtYXhIYWxmTGVuZ3RoID0gTWF0aC5mbG9vcihtYXhMaW5lTGVuZ3RoIC8gMikgLSAxXG5cbiAgaWYgKHBvc2l0aW9uIC0gbGluZVN0YXJ0ID4gbWF4SGFsZkxlbmd0aCkge1xuICAgIGhlYWQgPSAnIC4uLiAnXG4gICAgbGluZVN0YXJ0ID0gcG9zaXRpb24gLSBtYXhIYWxmTGVuZ3RoICsgaGVhZC5sZW5ndGhcbiAgfVxuXG4gIGlmIChsaW5lRW5kIC0gcG9zaXRpb24gPiBtYXhIYWxmTGVuZ3RoKSB7XG4gICAgdGFpbCA9ICcgLi4uJ1xuICAgIGxpbmVFbmQgPSBwb3NpdGlvbiArIG1heEhhbGZMZW5ndGggLSB0YWlsLmxlbmd0aFxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzdHI6IGhlYWQgKyBidWZmZXIuc2xpY2UobGluZVN0YXJ0LCBsaW5lRW5kKS5yZXBsYWNlKC9cXHQvZywgJ+KGkicpICsgdGFpbCxcbiAgICBwb3M6IHBvc2l0aW9uIC0gbGluZVN0YXJ0ICsgaGVhZC5sZW5ndGggLy8gcmVsYXRpdmUgcG9zaXRpb25cbiAgfVxufVxuXG5mdW5jdGlvbiBwYWRTdGFydCAoc3RyaW5nOiBzdHJpbmcsIG1heDogbnVtYmVyKSB7XG4gIC8vIG1heCgpIHByb3RlY3RzIGZyb20gbmVnYXRpdmEgdmFsdWUsIHRvIGF2b2lkIGV4Y2VwdGlvbi5cbiAgcmV0dXJuICcgJy5yZXBlYXQoTWF0aC5tYXgobWF4IC0gc3RyaW5nLmxlbmd0aCwgMCkpICsgc3RyaW5nXG59XG5cbmZ1bmN0aW9uIG1ha2VTbmlwcGV0IChtYXJrOiBTbmlwcGV0TWFyaywgb3B0aW9ucz86IFNuaXBwZXRPcHRpb25zKSB7XG4gIGlmICghbWFyay5idWZmZXIpIHJldHVybiBudWxsXG5cbiAgY29uc3Qgb3B0cyA9IHsgLi4uREVGQVVMVF9TTklQUEVUX09QVElPTlMsIC4uLm9wdGlvbnMgfVxuXG4gIGNvbnN0IHJlID0gL1xccj9cXG58XFxyfFxcMC9nXG4gIGNvbnN0IGxpbmVTdGFydHMgPSBbMF1cbiAgY29uc3QgbGluZUVuZHM6IG51bWJlcltdID0gW11cbiAgbGV0IG1hdGNoOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsXG4gIGxldCBmb3VuZExpbmVObyA9IC0xXG5cbiAgd2hpbGUgKChtYXRjaCA9IHJlLmV4ZWMobWFyay5idWZmZXIpKSkge1xuICAgIGxpbmVFbmRzLnB1c2gobWF0Y2guaW5kZXgpXG4gICAgbGluZVN0YXJ0cy5wdXNoKG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKVxuXG4gICAgaWYgKG1hcmsucG9zaXRpb24gPD0gbWF0Y2guaW5kZXggJiYgZm91bmRMaW5lTm8gPCAwKSB7XG4gICAgICBmb3VuZExpbmVObyA9IGxpbmVTdGFydHMubGVuZ3RoIC0gMlxuICAgIH1cbiAgfVxuXG4gIGlmIChmb3VuZExpbmVObyA8IDApIGZvdW5kTGluZU5vID0gbGluZVN0YXJ0cy5sZW5ndGggLSAxXG5cbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGNvbnN0IGxpbmVOb0xlbmd0aCA9IE1hdGgubWluKG1hcmsubGluZSArIG9wdHMubGluZXNBZnRlciwgbGluZUVuZHMubGVuZ3RoKS50b1N0cmluZygpLmxlbmd0aFxuICBjb25zdCBtYXhMaW5lTGVuZ3RoID0gb3B0cy5tYXhMZW5ndGggLSAob3B0cy5pbmRlbnQgKyBsaW5lTm9MZW5ndGggKyAzKVxuXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IG9wdHMubGluZXNCZWZvcmU7IGkrKykge1xuICAgIGlmIChmb3VuZExpbmVObyAtIGkgPCAwKSBicmVha1xuICAgIGNvbnN0IGxpbmUgPSBnZXRMaW5lKFxuICAgICAgbWFyay5idWZmZXIsXG4gICAgICBsaW5lU3RhcnRzW2ZvdW5kTGluZU5vIC0gaV0sXG4gICAgICBsaW5lRW5kc1tmb3VuZExpbmVObyAtIGldLFxuICAgICAgbWFyay5wb3NpdGlvbiAtIChsaW5lU3RhcnRzW2ZvdW5kTGluZU5vXSAtIGxpbmVTdGFydHNbZm91bmRMaW5lTm8gLSBpXSksXG4gICAgICBtYXhMaW5lTGVuZ3RoXG4gICAgKVxuICAgIHJlc3VsdCA9IGAkeycgJy5yZXBlYXQob3B0cy5pbmRlbnQpfSR7cGFkU3RhcnQoKG1hcmsubGluZSAtIGkgKyAxKS50b1N0cmluZygpLCBsaW5lTm9MZW5ndGgpfSB8ICR7bGluZS5zdHJ9XFxuJHtyZXN1bHR9YFxuICB9XG5cbiAgY29uc3QgbGluZSA9IGdldExpbmUobWFyay5idWZmZXIsIGxpbmVTdGFydHNbZm91bmRMaW5lTm9dLCBsaW5lRW5kc1tmb3VuZExpbmVOb10sIG1hcmsucG9zaXRpb24sIG1heExpbmVMZW5ndGgpXG4gIHJlc3VsdCArPSBgJHsnICcucmVwZWF0KG9wdHMuaW5kZW50KX0ke3BhZFN0YXJ0KChtYXJrLmxpbmUgKyAxKS50b1N0cmluZygpLCBsaW5lTm9MZW5ndGgpfSB8ICR7bGluZS5zdHJ9XFxuYFxuICByZXN1bHQgKz0gYCR7Jy0nLnJlcGVhdChvcHRzLmluZGVudCArIGxpbmVOb0xlbmd0aCArIDMgKyBsaW5lLnBvcyl9XlxcbmBcblxuICBmb3IgKGxldCBpID0gMTsgaSA8PSBvcHRzLmxpbmVzQWZ0ZXI7IGkrKykge1xuICAgIGlmIChmb3VuZExpbmVObyArIGkgPj0gbGluZUVuZHMubGVuZ3RoKSBicmVha1xuICAgIGNvbnN0IGxpbmUgPSBnZXRMaW5lKFxuICAgICAgbWFyay5idWZmZXIsXG4gICAgICBsaW5lU3RhcnRzW2ZvdW5kTGluZU5vICsgaV0sXG4gICAgICBsaW5lRW5kc1tmb3VuZExpbmVObyArIGldLFxuICAgICAgbWFyay5wb3NpdGlvbiAtIChsaW5lU3RhcnRzW2ZvdW5kTGluZU5vXSAtIGxpbmVTdGFydHNbZm91bmRMaW5lTm8gKyBpXSksXG4gICAgICBtYXhMaW5lTGVuZ3RoXG4gICAgKVxuICAgIHJlc3VsdCArPSBgJHsnICcucmVwZWF0KG9wdHMuaW5kZW50KX0ke3BhZFN0YXJ0KChtYXJrLmxpbmUgKyBpICsgMSkudG9TdHJpbmcoKSwgbGluZU5vTGVuZ3RoKX0gfCAke2xpbmUuc3RyfVxcbmBcbiAgfVxuXG4gIHJldHVybiByZXN1bHQucmVwbGFjZSgvXFxuJC8sICcnKVxufVxuXG5leHBvcnQgZGVmYXVsdCBtYWtlU25pcHBldFxuIiwgImltcG9ydCBtYWtlU25pcHBldCwgeyB0eXBlIFNuaXBwZXRNYXJrIH0gZnJvbSAnLi9zbmlwcGV0LnRzJ1xuXG4vLyBZQU1MIGVycm9yIGNsYXNzLiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg0NTg5ODRcbi8vXG5mdW5jdGlvbiBmb3JtYXRFcnJvciAoZXhjZXB0aW9uOiBZQU1MRXhjZXB0aW9uLCBjb21wYWN0PzogYm9vbGVhbikge1xuICBsZXQgd2hlcmUgPSAnJ1xuXG4gIGlmICghZXhjZXB0aW9uLm1hcmspIHJldHVybiBleGNlcHRpb24ucmVhc29uXG5cbiAgaWYgKGV4Y2VwdGlvbi5tYXJrLm5hbWUpIHtcbiAgICB3aGVyZSArPSBgaW4gXCIke2V4Y2VwdGlvbi5tYXJrLm5hbWV9XCIgYFxuICB9XG5cbiAgd2hlcmUgKz0gYCgke2V4Y2VwdGlvbi5tYXJrLmxpbmUgKyAxfToke2V4Y2VwdGlvbi5tYXJrLmNvbHVtbiArIDF9KWBcblxuICBpZiAoIWNvbXBhY3QgJiYgZXhjZXB0aW9uLm1hcmsuc25pcHBldCkge1xuICAgIHdoZXJlICs9IGBcXG5cXG4ke2V4Y2VwdGlvbi5tYXJrLnNuaXBwZXR9YFxuICB9XG5cbiAgcmV0dXJuIGAke2V4Y2VwdGlvbi5yZWFzb259ICR7d2hlcmV9YFxufVxuXG5jbGFzcyBZQU1MRXhjZXB0aW9uIGV4dGVuZHMgRXJyb3Ige1xuICByZWFzb246IHN0cmluZ1xuICBtYXJrPzogU25pcHBldE1hcmtcblxuICBjb25zdHJ1Y3RvciAocmVhc29uOiBzdHJpbmcsIG1hcms/OiBTbmlwcGV0TWFyaykge1xuICAgIHN1cGVyKClcblxuICAgIHRoaXMubmFtZSA9ICdZQU1MRXhjZXB0aW9uJ1xuICAgIHRoaXMucmVhc29uID0gcmVhc29uXG4gICAgdGhpcy5tYXJrID0gbWFya1xuICAgIHRoaXMubWVzc2FnZSA9IGZvcm1hdEVycm9yKHRoaXMsIGZhbHNlKVxuXG4gICAgLy8gR3VhcmQgZm9yIGFuY2llbnQgYnJvd3NlcnNcbiAgICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICAgIC8vIEluY2x1ZGUgc3RhY2sgdHJhY2UgaW4gZXJyb3Igb2JqZWN0LFxuICAgICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgdGhpcy5jb25zdHJ1Y3RvcilcbiAgICB9XG4gIH1cblxuICB0b1N0cmluZyAoY29tcGFjdD86IGJvb2xlYW4pIHtcbiAgICByZXR1cm4gYCR7dGhpcy5uYW1lfTogJHtmb3JtYXRFcnJvcih0aGlzLCBjb21wYWN0KX1gXG4gIH1cbn1cblxuLy8gQnVpbGQgYSBZQU1MRXhjZXB0aW9uIHdpdGggYSBzb3VyY2Ugc25pcHBldCBhbmQgdGhyb3cgaXQuIGBzb3VyY2VgIGlzIHRoZVxuLy8gcmF3IGlucHV0IHRleHQgKG5vIHBhcnNlciBzZW50aW5lbCk7IGBwb3NpdGlvbmAgaXMgYW4gb2Zmc2V0IGludG8gaXQuXG5mdW5jdGlvbiB0aHJvd0Vycm9yQXQgKHNvdXJjZTogc3RyaW5nLCBwb3NpdGlvbjogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcsIGZpbGVuYW1lID0gJycpOiBuZXZlciB7XG4gIGxldCBsaW5lID0gMFxuICBsZXQgbGluZVN0YXJ0ID0gMFxuXG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NpdGlvbjsgaW5kZXgrKykge1xuICAgIGNvbnN0IGNoID0gc291cmNlLmNoYXJDb2RlQXQoaW5kZXgpXG5cbiAgICBpZiAoY2ggPT09IDB4MEEvKiBMRiAqLykge1xuICAgICAgbGluZSsrXG4gICAgICBsaW5lU3RhcnQgPSBpbmRleCArIDFcbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDBELyogQ1IgKi8pIHtcbiAgICAgIGxpbmUrK1xuICAgICAgaWYgKHNvdXJjZS5jaGFyQ29kZUF0KGluZGV4ICsgMSkgPT09IDB4MEEvKiBMRiAqLykgaW5kZXgrK1xuICAgICAgbGluZVN0YXJ0ID0gaW5kZXggKyAxXG4gICAgfVxuICB9XG5cbiAgY29uc3QgbWFyazogU25pcHBldE1hcmsgPSB7XG4gICAgbmFtZTogZmlsZW5hbWUsXG4gICAgYnVmZmVyOiBzb3VyY2UsXG4gICAgcG9zaXRpb24sXG4gICAgbGluZSxcbiAgICBjb2x1bW46IHBvc2l0aW9uIC0gbGluZVN0YXJ0XG4gIH1cblxuICBtYXJrLnNuaXBwZXQgPSBtYWtlU25pcHBldChtYXJrKVxuICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbihtZXNzYWdlLCBtYXJrKVxufVxuXG5leHBvcnQgeyBZQU1MRXhjZXB0aW9uLCB0aHJvd0Vycm9yQXQgfVxuIiwgImNvbnN0IEVWRU5UX0RPQ1VNRU5UID0gMVxuY29uc3QgRVZFTlRfU0VRVUVOQ0UgPSAyXG5jb25zdCBFVkVOVF9NQVBQSU5HID0gM1xuY29uc3QgRVZFTlRfU0NBTEFSID0gNFxuY29uc3QgRVZFTlRfQUxJQVMgPSA1XG5jb25zdCBFVkVOVF9QT1AgPSA2XG5cbnR5cGUgRXZlbnRUeXBlID1cbiAgdHlwZW9mIEVWRU5UX0RPQ1VNRU5UIHwgdHlwZW9mIEVWRU5UX1NFUVVFTkNFIHwgdHlwZW9mIEVWRU5UX01BUFBJTkcgfFxuICB0eXBlb2YgRVZFTlRfU0NBTEFSIHwgdHlwZW9mIEVWRU5UX0FMSUFTIHwgdHlwZW9mIEVWRU5UX1BPUFxuXG5jb25zdCBTQ0FMQVJfU1RZTEVfUExBSU4gPSAxXG5jb25zdCBTQ0FMQVJfU1RZTEVfU0lOR0xFX1FVT1RFRCA9IDJcbmNvbnN0IFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVEID0gM1xuY29uc3QgU0NBTEFSX1NUWUxFX0xJVEVSQUxfQkxPQ0sgPSA0XG5jb25zdCBTQ0FMQVJfU1RZTEVfRk9MREVEX0JMT0NLID0gNVxuXG50eXBlIFNjYWxhclN0eWxlID1cbiAgdHlwZW9mIFNDQUxBUl9TVFlMRV9QTEFJTiB8IHR5cGVvZiBTQ0FMQVJfU1RZTEVfU0lOR0xFX1FVT1RFRCB8XG4gIHR5cGVvZiBTQ0FMQVJfU1RZTEVfRE9VQkxFX1FVT1RFRCB8IHR5cGVvZiBTQ0FMQVJfU1RZTEVfTElURVJBTF9CTE9DSyB8XG4gIHR5cGVvZiBTQ0FMQVJfU1RZTEVfRk9MREVEX0JMT0NLXG5cbmNvbnN0IENPTExFQ1RJT05fU1RZTEVfQkxPQ0sgPSAxXG5jb25zdCBDT0xMRUNUSU9OX1NUWUxFX0ZMT1cgPSAyXG5cbnR5cGUgQ29sbGVjdGlvblN0eWxlID1cbiAgdHlwZW9mIENPTExFQ1RJT05fU1RZTEVfQkxPQ0sgfCB0eXBlb2YgQ09MTEVDVElPTl9TVFlMRV9GTE9XXG5cbmNvbnN0IENIT01QSU5HX0NMSVAgPSAxXG5jb25zdCBDSE9NUElOR19TVFJJUCA9IDJcbmNvbnN0IENIT01QSU5HX0tFRVAgPSAzXG5cbnR5cGUgQ2hvbXBpbmcgPVxuICB0eXBlb2YgQ0hPTVBJTkdfQ0xJUCB8IHR5cGVvZiBDSE9NUElOR19TVFJJUCB8IHR5cGVvZiBDSE9NUElOR19LRUVQXG5cbnR5cGUgRG9jdW1lbnREaXJlY3RpdmUgPVxuICB7IGtpbmQ6ICd5YW1sJywgdmVyc2lvbjogc3RyaW5nIH0gfFxuICB7IGtpbmQ6ICd0YWcnLCBoYW5kbGU6IHN0cmluZywgcHJlZml4OiBzdHJpbmcgfVxuXG50eXBlIFRhZ0hhbmRsZXJzID0gUmVjb3JkPHN0cmluZywgc3RyaW5nPlxuXG5pbnRlcmZhY2UgRG9jdW1lbnRFdmVudCB7XG4gIHR5cGU6IHR5cGVvZiBFVkVOVF9ET0NVTUVOVFxuICBleHBsaWNpdFN0YXJ0OiBib29sZWFuXG4gIGV4cGxpY2l0RW5kOiBib29sZWFuXG4gIGRpcmVjdGl2ZXM6IERvY3VtZW50RGlyZWN0aXZlW11cbn1cblxuaW50ZXJmYWNlIFNlcXVlbmNlRXZlbnQge1xuICB0eXBlOiB0eXBlb2YgRVZFTlRfU0VRVUVOQ0VcbiAgc3RhcnQ6IG51bWJlclxuICBhbmNob3JTdGFydDogbnVtYmVyXG4gIGFuY2hvckVuZDogbnVtYmVyXG4gIHRhZ1N0YXJ0OiBudW1iZXJcbiAgdGFnRW5kOiBudW1iZXJcbiAgc3R5bGU6IENvbGxlY3Rpb25TdHlsZVxufVxuXG5pbnRlcmZhY2UgTWFwcGluZ0V2ZW50IHtcbiAgdHlwZTogdHlwZW9mIEVWRU5UX01BUFBJTkdcbiAgc3RhcnQ6IG51bWJlclxuICBhbmNob3JTdGFydDogbnVtYmVyXG4gIGFuY2hvckVuZDogbnVtYmVyXG4gIHRhZ1N0YXJ0OiBudW1iZXJcbiAgdGFnRW5kOiBudW1iZXJcbiAgc3R5bGU6IENvbGxlY3Rpb25TdHlsZVxufVxuXG5pbnRlcmZhY2UgU2NhbGFyRXZlbnQge1xuICB0eXBlOiB0eXBlb2YgRVZFTlRfU0NBTEFSXG4gIHZhbHVlU3RhcnQ6IG51bWJlclxuICB2YWx1ZUVuZDogbnVtYmVyXG4gIGFuY2hvclN0YXJ0OiBudW1iZXJcbiAgYW5jaG9yRW5kOiBudW1iZXJcbiAgdGFnU3RhcnQ6IG51bWJlclxuICB0YWdFbmQ6IG51bWJlclxuICBzdHlsZTogU2NhbGFyU3R5bGVcbiAgY2hvbXBpbmc6IENob21waW5nXG4gIGluZGVudDogbnVtYmVyXG4gIGZhc3Q6IGJvb2xlYW5cbn1cblxuaW50ZXJmYWNlIEFsaWFzRXZlbnQge1xuICB0eXBlOiB0eXBlb2YgRVZFTlRfQUxJQVNcbiAgYW5jaG9yU3RhcnQ6IG51bWJlclxuICBhbmNob3JFbmQ6IG51bWJlclxufVxuXG5pbnRlcmZhY2UgUG9wRXZlbnQge1xuICB0eXBlOiB0eXBlb2YgRVZFTlRfUE9QXG59XG5cbnR5cGUgRXZlbnQgPVxuICBEb2N1bWVudEV2ZW50IHxcbiAgU2VxdWVuY2VFdmVudCB8XG4gIE1hcHBpbmdFdmVudCB8XG4gIFNjYWxhckV2ZW50IHxcbiAgQWxpYXNFdmVudCB8XG4gIFBvcEV2ZW50XG5cbmV4cG9ydCB7XG4gIEVWRU5UX0RPQ1VNRU5ULFxuICBFVkVOVF9TRVFVRU5DRSxcbiAgRVZFTlRfTUFQUElORyxcbiAgRVZFTlRfU0NBTEFSLFxuICBFVkVOVF9BTElBUyxcbiAgRVZFTlRfUE9QLFxuXG4gIFNDQUxBUl9TVFlMRV9QTEFJTixcbiAgU0NBTEFSX1NUWUxFX1NJTkdMRV9RVU9URUQsXG4gIFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVELFxuICBTQ0FMQVJfU1RZTEVfTElURVJBTF9CTE9DSyxcbiAgU0NBTEFSX1NUWUxFX0ZPTERFRF9CTE9DSyxcblxuICBDT0xMRUNUSU9OX1NUWUxFX0JMT0NLLFxuICBDT0xMRUNUSU9OX1NUWUxFX0ZMT1csXG5cbiAgQ0hPTVBJTkdfQ0xJUCxcbiAgQ0hPTVBJTkdfU1RSSVAsXG4gIENIT01QSU5HX0tFRVAsXG5cbiAgdHlwZSBFdmVudFR5cGUsXG4gIHR5cGUgU2NhbGFyU3R5bGUsXG4gIHR5cGUgQ29sbGVjdGlvblN0eWxlLFxuXG4gIHR5cGUgQ2hvbXBpbmcsXG4gIHR5cGUgRG9jdW1lbnREaXJlY3RpdmUsXG4gIHR5cGUgVGFnSGFuZGxlcnMsXG4gIHR5cGUgRG9jdW1lbnRFdmVudCxcbiAgdHlwZSBTZXF1ZW5jZUV2ZW50LFxuICB0eXBlIE1hcHBpbmdFdmVudCxcbiAgdHlwZSBTY2FsYXJFdmVudCxcbiAgdHlwZSBBbGlhc0V2ZW50LFxuICB0eXBlIFBvcEV2ZW50LFxuICB0eXBlIEV2ZW50XG59XG4iLCAiaW1wb3J0IHtcbiAgU0NBTEFSX1NUWUxFX1NJTkdMRV9RVU9URUQsXG4gIFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVELFxuICBTQ0FMQVJfU1RZTEVfTElURVJBTF9CTE9DSyxcbiAgU0NBTEFSX1NUWUxFX0ZPTERFRF9CTE9DSyxcbiAgQ0hPTVBJTkdfU1RSSVAsXG4gIENIT01QSU5HX0tFRVAsXG4gIHR5cGUgU2NhbGFyRXZlbnRcbn0gZnJvbSAnLi9ldmVudHMudHMnXG5cbmNvbnN0IE5PX1JBTkdFID0gLTFcblxuLy8gLS0tIGNoYXJhY3RlciBoZWxwZXJzIChtaXJyb3JzIHNyYy9sb2FkZXIudHMsIGtlcHQgc2VsZi1jb250YWluZWQgaGVyZSkgLS0tXG5cbmZ1bmN0aW9uIHNpbXBsZUVzY2FwZVNlcXVlbmNlIChjOiBudW1iZXIpIHtcbiAgc3dpdGNoIChjKSB7XG4gICAgY2FzZSAweDMwLyogMCAqLzogcmV0dXJuICdcXHgwMCdcbiAgICBjYXNlIDB4NjEvKiBhICovOiByZXR1cm4gJ1xceDA3J1xuICAgIGNhc2UgMHg2Mi8qIGIgKi86IHJldHVybiAnXFx4MDgnXG4gICAgY2FzZSAweDc0LyogdCAqLzogcmV0dXJuICdcXHgwOSdcbiAgICBjYXNlIDB4MDkvKiBUYWIgKi86IHJldHVybiAnXFx4MDknXG4gICAgY2FzZSAweDZFLyogbiAqLzogcmV0dXJuICdcXHgwQSdcbiAgICBjYXNlIDB4NzYvKiB2ICovOiByZXR1cm4gJ1xceDBCJ1xuICAgIGNhc2UgMHg2Ni8qIGYgKi86IHJldHVybiAnXFx4MEMnXG4gICAgY2FzZSAweDcyLyogciAqLzogcmV0dXJuICdcXHgwRCdcbiAgICBjYXNlIDB4NjUvKiBlICovOiByZXR1cm4gJ1xceDFCJ1xuICAgIGNhc2UgMHgyMC8qIFNwYWNlICovOiByZXR1cm4gJyAnXG4gICAgY2FzZSAweDIyLyogXCIgKi86IHJldHVybiAnXFx4MjInXG4gICAgY2FzZSAweDJGLyogLyAqLzogcmV0dXJuICcvJ1xuICAgIGNhc2UgMHg1Qy8qIFxcICovOiByZXR1cm4gJ1xceDVDJ1xuICAgIGNhc2UgMHg0RS8qIE4gKi86IHJldHVybiAnXFx4ODUnXG4gICAgY2FzZSAweDVGLyogXyAqLzogcmV0dXJuICdcXHhBMCdcbiAgICBjYXNlIDB4NEMvKiBMICovOiByZXR1cm4gJ1xcdTIwMjgnXG4gICAgY2FzZSAweDUwLyogUCAqLzogcmV0dXJuICdcXHUyMDI5J1xuICAgIGRlZmF1bHQ6IHJldHVybiAnJ1xuICB9XG59XG5cbmNvbnN0IHNpbXBsZUVzY2FwZUNoZWNrID0gbmV3IEFycmF5KDI1NilcbmNvbnN0IHNpbXBsZUVzY2FwZU1hcCA9IG5ldyBBcnJheSgyNTYpXG5mb3IgKGxldCBpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG4gIHNpbXBsZUVzY2FwZUNoZWNrW2ldID0gc2ltcGxlRXNjYXBlU2VxdWVuY2UoaSkgPyAxIDogMFxuICBzaW1wbGVFc2NhcGVNYXBbaV0gPSBzaW1wbGVFc2NhcGVTZXF1ZW5jZShpKVxufVxuXG5mdW5jdGlvbiBjaGFyRnJvbUNvZGVwb2ludCAoYzogbnVtYmVyKSB7XG4gIGlmIChjIDw9IDB4RkZGRikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGMpXG4gIH1cbiAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoXG4gICAgKChjIC0gMHgwMTAwMDApID4+IDEwKSArIDB4RDgwMCxcbiAgICAoKGMgLSAweDAxMDAwMCkgJiAweDAzRkYpICsgMHhEQzAwXG4gIClcbn1cblxuZnVuY3Rpb24gZnJvbUhleENvZGUgKGM6IG51bWJlcikge1xuICBpZiAoYyA+PSAweDMwLyogMCAqLyAmJiBjIDw9IDB4MzkvKiA5ICovKSByZXR1cm4gYyAtIDB4MzBcbiAgY29uc3QgbGMgPSBjIHwgMHgyMFxuICAvLyBEb3VibGUtcXVvdGVkIHNjYWxhciByYW5nZXMgYXJlIHZhbGlkYXRlZCBieSBwYXJzZXIudHMgYmVmb3JlIGNvb2tpbmcuXG4gIHJldHVybiBsYyAtIDB4NjEgKyAxMFxufVxuXG5mdW5jdGlvbiBlc2NhcGVkSGV4TGVuIChjOiBudW1iZXIpIHtcbiAgaWYgKGMgPT09IDB4NzgvKiB4ICovKSByZXR1cm4gMlxuICBpZiAoYyA9PT0gMHg3NS8qIHUgKi8pIHJldHVybiA0XG4gIC8vIERvdWJsZS1xdW90ZWQgc2NhbGFyIHJhbmdlcyBhcmUgdmFsaWRhdGVkIGJ5IHBhcnNlci50cyBiZWZvcmUgY29va2luZy5cbiAgcmV0dXJuIDhcbn1cblxuLy8gLS0tIGxpbmUgZm9sZGluZyBoZWxwZXJzIC0tLVxuXG4vLyBTa2lwIGEgcnVuIG9mIGxpbmUgYnJlYWtzIHBsdXMgdGhlIGxlYWRpbmcgd2hpdGVzcGFjZSBvZiB0aGUgZm9sbG93aW5nXG4vLyBsaW5lcywgcmV0dXJuaW5nIHRoZSBudW1iZXIgb2YgbGluZSBicmVha3MgY29uc3VtZWQgYW5kIHRoZSBuZXcgcG9zaXRpb24uXG5mdW5jdGlvbiBza2lwRm9sZGVkQnJlYWtzIChpbnB1dDogc3RyaW5nLCBwb3NpdGlvbjogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xuICBsZXQgYnJlYWtzID0gMFxuXG4gIHdoaWxlIChwb3NpdGlvbiA8IGVuZCkge1xuICAgIGNvbnN0IGNoID0gaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbilcblxuICAgIGlmIChjaCA9PT0gMHgwQS8qIExGICovKSB7XG4gICAgICBicmVha3MrK1xuICAgICAgcG9zaXRpb24rK1xuICAgIH0gZWxzZSBpZiAoY2ggPT09IDB4MEQvKiBDUiAqLykge1xuICAgICAgYnJlYWtzKytcbiAgICAgIHBvc2l0aW9uKytcbiAgICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSA9PT0gMHgwQS8qIExGICovKSBwb3NpdGlvbisrXG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHgyMC8qIFNwYWNlICovIHx8IGNoID09PSAweDA5LyogVGFiICovKSB7XG4gICAgICBwb3NpdGlvbisrXG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgcG9zaXRpb24sIGJyZWFrcyB9XG59XG5cbi8vIEZvbGRpbmcgb2YgbGluZSBicmVha3MgYmV0d2VlbiBjb250ZW50IGNodW5rczogYSBzaW5nbGUgYnJlYWsgYmVjb21lcyBhXG4vLyBzcGFjZSwgc2V2ZXJhbCBicmVha3MgYmVjb21lIChjb3VudCAtIDEpIG5ld2xpbmVzLlxuZnVuY3Rpb24gZm9sZGVkQnJlYWtzIChjb3VudDogbnVtYmVyKSB7XG4gIGlmIChjb3VudCA9PT0gMSkgcmV0dXJuICcgJ1xuICAvLyBDYWxsZWQgb25seSBhZnRlciBza2lwRm9sZGVkQnJlYWtzKCkgY29uc3VtZWQgYXQgbGVhc3Qgb25lIGxpbmUgYnJlYWsuXG4gIHJldHVybiAnXFxuJy5yZXBlYXQoY291bnQgLSAxKVxufVxuXG4vLyAtLS0gcGVyLXN0eWxlIGV4dHJhY3RvcnMgLS0tXG5cbmZ1bmN0aW9uIGdldFBsYWluVmFsdWUgKGlucHV0OiBzdHJpbmcsIHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XG4gIGxldCByZXN1bHQgPSAnJ1xuICBsZXQgcG9zaXRpb24gPSBzdGFydFxuICBsZXQgY2FwdHVyZVN0YXJ0ID0gc3RhcnRcbiAgbGV0IGNhcHR1cmVFbmQgPSBzdGFydFxuXG4gIHdoaWxlIChwb3NpdGlvbiA8IGVuZCkge1xuICAgIGNvbnN0IGNoID0gaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbilcblxuICAgIGlmIChjaCA9PT0gMHgwQS8qIExGICovIHx8IGNoID09PSAweDBELyogQ1IgKi8pIHtcbiAgICAgIHJlc3VsdCArPSBpbnB1dC5zbGljZShjYXB0dXJlU3RhcnQsIGNhcHR1cmVFbmQpXG4gICAgICBjb25zdCBmb2xkID0gc2tpcEZvbGRlZEJyZWFrcyhpbnB1dCwgcG9zaXRpb24sIGVuZClcbiAgICAgIHJlc3VsdCArPSBmb2xkZWRCcmVha3MoZm9sZC5icmVha3MpXG4gICAgICBwb3NpdGlvbiA9IGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBmb2xkLnBvc2l0aW9uXG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc2l0aW9uKytcbiAgICAgIGlmIChjaCAhPT0gMHgyMC8qIFNwYWNlICovICYmIGNoICE9PSAweDA5LyogVGFiICovKSBjYXB0dXJlRW5kID0gcG9zaXRpb25cbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0ICsgaW5wdXQuc2xpY2UoY2FwdHVyZVN0YXJ0LCBjYXB0dXJlRW5kKVxufVxuXG5mdW5jdGlvbiBnZXRTaW5nbGVRdW90ZWRWYWx1ZSAoaW5wdXQ6IHN0cmluZywgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGxldCBwb3NpdGlvbiA9IHN0YXJ0XG4gIGxldCBjYXB0dXJlU3RhcnQgPSBzdGFydFxuICBsZXQgY2FwdHVyZUVuZCA9IHN0YXJ0XG5cbiAgd2hpbGUgKHBvc2l0aW9uIDwgZW5kKSB7XG4gICAgY29uc3QgY2ggPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSAweDI3LyogJyAqLykge1xuICAgICAgLy8gV2l0aGluIHRoZSBzdG9yZWQgcmFuZ2UgZXZlcnkgcXVvdGUgaXMgcGFydCBvZiBhbiBlc2NhcGVkICcnIHBhaXIuXG4gICAgICByZXN1bHQgKz0gaW5wdXQuc2xpY2UoY2FwdHVyZVN0YXJ0LCBwb3NpdGlvbikgKyBcIidcIlxuICAgICAgcG9zaXRpb24gKz0gMlxuICAgICAgY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IHBvc2l0aW9uXG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHgwQS8qIExGICovIHx8IGNoID09PSAweDBELyogQ1IgKi8pIHtcbiAgICAgIHJlc3VsdCArPSBpbnB1dC5zbGljZShjYXB0dXJlU3RhcnQsIGNhcHR1cmVFbmQpXG4gICAgICBjb25zdCBmb2xkID0gc2tpcEZvbGRlZEJyZWFrcyhpbnB1dCwgcG9zaXRpb24sIGVuZClcbiAgICAgIHJlc3VsdCArPSBmb2xkZWRCcmVha3MoZm9sZC5icmVha3MpXG4gICAgICBwb3NpdGlvbiA9IGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBmb2xkLnBvc2l0aW9uXG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc2l0aW9uKytcbiAgICAgIGlmIChjaCAhPT0gMHgyMC8qIFNwYWNlICovICYmIGNoICE9PSAweDA5LyogVGFiICovKSBjYXB0dXJlRW5kID0gcG9zaXRpb25cbiAgICB9XG4gIH1cblxuICAvLyBXaGl0ZXNwYWNlIHJpZ2h0IGJlZm9yZSB0aGUgY2xvc2luZyBxdW90ZSBpcyBzaWduaWZpY2FudCAoaXQgaXMgb25seVxuICAvLyBzdHJpcHBlZCB3aGVuIGZvbGxvd2VkIGJ5IGEgbGluZSBicmVhaykuXG4gIHJldHVybiByZXN1bHQgKyBpbnB1dC5zbGljZShjYXB0dXJlU3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gZ2V0RG91YmxlUXVvdGVkVmFsdWUgKGlucHV0OiBzdHJpbmcsIHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XG4gIGxldCByZXN1bHQgPSAnJ1xuICBsZXQgcG9zaXRpb24gPSBzdGFydFxuICBsZXQgY2FwdHVyZVN0YXJ0ID0gc3RhcnRcbiAgbGV0IGNhcHR1cmVFbmQgPSBzdGFydFxuXG4gIHdoaWxlIChwb3NpdGlvbiA8IGVuZCkge1xuICAgIGNvbnN0IGNoID0gaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbilcblxuICAgIGlmIChjaCA9PT0gMHg1Qy8qIFxcICovKSB7XG4gICAgICByZXN1bHQgKz0gaW5wdXQuc2xpY2UoY2FwdHVyZVN0YXJ0LCBwb3NpdGlvbilcbiAgICAgIHBvc2l0aW9uKytcbiAgICAgIGNvbnN0IGVzY2FwZWQgPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKVxuXG4gICAgICBpZiAoZXNjYXBlZCA9PT0gMHgwQS8qIExGICovIHx8IGVzY2FwZWQgPT09IDB4MEQvKiBDUiAqLykge1xuICAgICAgICAvLyBFc2NhcGVkIGxpbmUgYnJlYWs6IGEgbGluZSBjb250aW51YXRpb24gdGhhdCBqb2lucyB3aXRoIG5vdGhpbmcuXG4gICAgICAgIHBvc2l0aW9uID0gc2tpcEZvbGRlZEJyZWFrcyhpbnB1dCwgcG9zaXRpb24sIGVuZCkucG9zaXRpb25cbiAgICAgIH0gZWxzZSBpZiAoZXNjYXBlZCA8IDI1NiAmJiBzaW1wbGVFc2NhcGVDaGVja1tlc2NhcGVkXSkge1xuICAgICAgICByZXN1bHQgKz0gc2ltcGxlRXNjYXBlTWFwW2VzY2FwZWRdXG4gICAgICAgIHBvc2l0aW9uKytcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHBhcnNlci50cyBoYXMgYWxyZWFkeSByZWplY3RlZCB1bmtub3duIGVzY2FwZXMgYW5kIGludmFsaWQgaGV4IGRpZ2l0cy5cbiAgICAgICAgbGV0IGhleExlbmd0aCA9IGVzY2FwZWRIZXhMZW4oZXNjYXBlZClcbiAgICAgICAgbGV0IGhleFJlc3VsdCA9IDBcblxuICAgICAgICBmb3IgKDsgaGV4TGVuZ3RoID4gMDsgaGV4TGVuZ3RoLS0pIHtcbiAgICAgICAgICBwb3NpdGlvbisrXG4gICAgICAgICAgY29uc3QgZGlnaXQgPSBmcm9tSGV4Q29kZShpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSlcbiAgICAgICAgICBoZXhSZXN1bHQgPSAoaGV4UmVzdWx0IDw8IDQpICsgZGlnaXRcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdCArPSBjaGFyRnJvbUNvZGVwb2ludChoZXhSZXN1bHQpXG4gICAgICAgIHBvc2l0aW9uKytcbiAgICAgIH1cblxuICAgICAgY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IHBvc2l0aW9uXG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHgwQS8qIExGICovIHx8IGNoID09PSAweDBELyogQ1IgKi8pIHtcbiAgICAgIHJlc3VsdCArPSBpbnB1dC5zbGljZShjYXB0dXJlU3RhcnQsIGNhcHR1cmVFbmQpXG4gICAgICBjb25zdCBmb2xkID0gc2tpcEZvbGRlZEJyZWFrcyhpbnB1dCwgcG9zaXRpb24sIGVuZClcbiAgICAgIHJlc3VsdCArPSBmb2xkZWRCcmVha3MoZm9sZC5icmVha3MpXG4gICAgICBwb3NpdGlvbiA9IGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBmb2xkLnBvc2l0aW9uXG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc2l0aW9uKytcbiAgICAgIGlmIChjaCAhPT0gMHgyMC8qIFNwYWNlICovICYmIGNoICE9PSAweDA5LyogVGFiICovKSBjYXB0dXJlRW5kID0gcG9zaXRpb25cbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0ICsgaW5wdXQuc2xpY2UoY2FwdHVyZVN0YXJ0LCBlbmQpXG59XG5cbmZ1bmN0aW9uIGdldEJsb2NrVmFsdWUgKFxuICBpbnB1dDogc3RyaW5nLFxuICBzdGFydDogbnVtYmVyLFxuICBlbmQ6IG51bWJlcixcbiAgaW5kZW50OiBudW1iZXIsXG4gIGNob21waW5nOiBudW1iZXIsXG4gIGZvbGRlZDogYm9vbGVhblxuKSB7XG4gIGNvbnN0IHRleHRJbmRlbnQgPSBpbmRlbnQgPCAwID8gMCA6IGluZGVudFxuICAvLyBUaGUgcmFuZ2Ugc3RhcnRzIGF0IGNvbHVtbiAwIG9mIHRoZSBmaXJzdCBsaW5lIGFuZCBpbmNsdWRlcyBldmVyeSBsaW5lXG4gIC8vIGJyZWFrLCBpbmNsdWRpbmcgdGhvc2Ugb2YgdHJhaWxpbmcgYmxhbmsgbGluZXMuXG4gIGNvbnN0IHJlZ2lvbiA9IGlucHV0LnNsaWNlKHN0YXJ0LCBlbmQpLnJlcGxhY2UoL1xcclxcbj8vZywgJ1xcbicpXG4gIC8vIEFuIGVtcHR5IHJhbmdlIGlzIGEgYmxvY2sgd2l0aCBubyBsaW5lcyBhdCBhbGwgKGUuZy4gYW4gZW1wdHkgYHwrYCkgYW5kXG4gIC8vIG11c3Qgc3RheSBlbXB0eTsgYSBuYWl2ZSBzcGxpdCB3b3VsZCBpbnZlbnQgYSBwaGFudG9tIGJsYW5rIGxpbmUuIE90aGVyd2lzZVxuICAvLyBhIHRyYWlsaW5nIGxpbmUgYnJlYWsgbGVhdmVzIGEgdHJhaWxpbmcgJycgZnJvbSBzcGxpdCgpIHRoYXQgaXMgbm90IGEgcmVhbFxuICAvLyBsaW5lIChqdXN0IHRoZSB0ZXJtaW5hdG9yIG9mIHRoZSBsYXN0IG9uZSksIHNvIGRyb3AgaXQuIEludGVyaW9yIGJsYW5rXG4gIC8vIGxpbmVzIGFyZSBrZXB0LlxuICBjb25zdCBsaW5lcyA9IHJlZ2lvbiA9PT0gJydcbiAgICA/IFtdXG4gICAgOiAocmVnaW9uLmVuZHNXaXRoKCdcXG4nKSA/IHJlZ2lvbi5zbGljZSgwLCAtMSkgOiByZWdpb24pLnNwbGl0KCdcXG4nKVxuXG4gIGxldCByZXN1bHQgPSAnJ1xuICBsZXQgZGlkUmVhZENvbnRlbnQgPSBmYWxzZVxuICBsZXQgZW1wdHlMaW5lcyA9IDBcbiAgbGV0IGF0TW9yZUluZGVudGVkID0gZmFsc2VcblxuICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAvLyBXaGl0ZXNwYWNlIGJleW9uZCB0aGUgY29udGVudCBpbmRlbnRhdGlvbiBpcyBwYXJ0IG9mIHRoZSBjb250ZW50LCBzbyB0aGVcbiAgICAvLyBpbmRlbnRhdGlvbiBzY2FuIHN0b3BzIGF0IHRleHRJbmRlbnQuIEEgbGluZSBpcyBlbXB0eSBvbmx5IHdoZW4gbm90aGluZ1xuICAgIC8vIHJlbWFpbnMgYWZ0ZXIgdGhlIChjYXBwZWQpIGluZGVudGF0aW9uLlxuICAgIC8vIGluZGVudCA8IDAgbWVhbnMgbm8gY29udGVudCBsaW5lIHdhcyBkZXRlY3RlZCAoYSB3aG9sbHkgYmxhbmsgYmxvY2spLCBzb1xuICAgIC8vIGV2ZXJ5IGxpbmUgaXMgYW4gZW1wdHkgbGluZS5cbiAgICBsZXQgY29sdW1uID0gMFxuICAgIHdoaWxlIChjb2x1bW4gPCB0ZXh0SW5kZW50ICYmIGxpbmUuY2hhckNvZGVBdChjb2x1bW4pID09PSAweDIwLyogU3BhY2UgKi8pIGNvbHVtbisrXG5cbiAgICBpZiAoaW5kZW50IDwgMCB8fCBjb2x1bW4gPj0gbGluZS5sZW5ndGgpIHtcbiAgICAgIGVtcHR5TGluZXMrK1xuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50ID0gbGluZS5zbGljZSh0ZXh0SW5kZW50KVxuICAgIGNvbnN0IGZpcnN0ID0gY29udGVudC5jaGFyQ29kZUF0KDApXG5cbiAgICBpZiAoZm9sZGVkKSB7XG4gICAgICBpZiAoZmlyc3QgPT09IDB4MjAvKiBTcGFjZSAqLyB8fCBmaXJzdCA9PT0gMHgwOS8qIFRhYiAqLykge1xuICAgICAgICAvLyBNb3JlLWluZGVudGVkIGxpbmVzIGFyZSBub3QgZm9sZGVkLlxuICAgICAgICBhdE1vcmVJbmRlbnRlZCA9IHRydWVcbiAgICAgICAgcmVzdWx0ICs9ICdcXG4nLnJlcGVhdChkaWRSZWFkQ29udGVudCA/IDEgKyBlbXB0eUxpbmVzIDogZW1wdHlMaW5lcylcbiAgICAgIH0gZWxzZSBpZiAoYXRNb3JlSW5kZW50ZWQpIHtcbiAgICAgICAgYXRNb3JlSW5kZW50ZWQgPSBmYWxzZVxuICAgICAgICByZXN1bHQgKz0gJ1xcbicucmVwZWF0KGVtcHR5TGluZXMgKyAxKVxuICAgICAgfSBlbHNlIGlmIChlbXB0eUxpbmVzID09PSAwKSB7XG4gICAgICAgIGlmIChkaWRSZWFkQ29udGVudCkgcmVzdWx0ICs9ICcgJ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ICs9ICdcXG4nLnJlcGVhdChlbXB0eUxpbmVzKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgKz0gJ1xcbicucmVwZWF0KGRpZFJlYWRDb250ZW50ID8gMSArIGVtcHR5TGluZXMgOiBlbXB0eUxpbmVzKVxuICAgIH1cblxuICAgIHJlc3VsdCArPSBjb250ZW50XG4gICAgZGlkUmVhZENvbnRlbnQgPSB0cnVlXG4gICAgZW1wdHlMaW5lcyA9IDBcbiAgfVxuXG4gIGlmIChjaG9tcGluZyA9PT0gQ0hPTVBJTkdfS0VFUCkge1xuICAgIHJlc3VsdCArPSAnXFxuJy5yZXBlYXQoZGlkUmVhZENvbnRlbnQgPyAxICsgZW1wdHlMaW5lcyA6IGVtcHR5TGluZXMpXG4gIH0gZWxzZSBpZiAoY2hvbXBpbmcgIT09IENIT01QSU5HX1NUUklQKSB7XG4gICAgaWYgKGRpZFJlYWRDb250ZW50KSByZXN1bHQgKz0gJ1xcbidcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gZ2V0U2NhbGFyVmFsdWUgKGlucHV0OiBzdHJpbmcsIHNjYWxhcjogU2NhbGFyRXZlbnQpOiBzdHJpbmcge1xuICBpZiAoc2NhbGFyLnZhbHVlU3RhcnQgPT09IE5PX1JBTkdFKSByZXR1cm4gJydcblxuICBjb25zdCB7IHZhbHVlU3RhcnQsIHZhbHVlRW5kIH0gPSBzY2FsYXJcblxuICAvLyBGYXN0IHBhdGg6IHRoZSBwYXJzZXIgbWFya2VkIHRoaXMgc2NhbGFyIGFzIGEgdmVyYmF0aW0gc2xpY2Ugb2YgdGhlIGlucHV0XG4gIC8vIChzaW5nbGUtbGluZSBwbGFpbiAvIHF1b3RlZCB3aXRoIG5vIGVzY2FwZXMgb3IgZm9sZGVkIGJyZWFrcyksIHNvIHRoZVxuICAvLyBwZXItc3R5bGUgY2hhciBsb29wIGJlbG93IHdvdWxkIGp1c3QgcmVwcm9kdWNlIHRoZSBzbGljZS5cbiAgaWYgKHNjYWxhci5mYXN0KSByZXR1cm4gaW5wdXQuc2xpY2UodmFsdWVTdGFydCwgdmFsdWVFbmQpXG5cbiAgc3dpdGNoIChzY2FsYXIuc3R5bGUpIHtcbiAgICBjYXNlIFNDQUxBUl9TVFlMRV9TSU5HTEVfUVVPVEVEOlxuICAgICAgcmV0dXJuIGdldFNpbmdsZVF1b3RlZFZhbHVlKGlucHV0LCB2YWx1ZVN0YXJ0LCB2YWx1ZUVuZClcbiAgICBjYXNlIFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVEOlxuICAgICAgcmV0dXJuIGdldERvdWJsZVF1b3RlZFZhbHVlKGlucHV0LCB2YWx1ZVN0YXJ0LCB2YWx1ZUVuZClcbiAgICBjYXNlIFNDQUxBUl9TVFlMRV9MSVRFUkFMX0JMT0NLOlxuICAgICAgcmV0dXJuIGdldEJsb2NrVmFsdWUoaW5wdXQsIHZhbHVlU3RhcnQsIHZhbHVlRW5kLCBzY2FsYXIuaW5kZW50LCBzY2FsYXIuY2hvbXBpbmcsIGZhbHNlKVxuICAgIGNhc2UgU0NBTEFSX1NUWUxFX0ZPTERFRF9CTE9DSzpcbiAgICAgIHJldHVybiBnZXRCbG9ja1ZhbHVlKGlucHV0LCB2YWx1ZVN0YXJ0LCB2YWx1ZUVuZCwgc2NhbGFyLmluZGVudCwgc2NhbGFyLmNob21waW5nLCB0cnVlKVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZ2V0UGxhaW5WYWx1ZShpbnB1dCwgdmFsdWVTdGFydCwgdmFsdWVFbmQpXG4gIH1cbn1cblxuZXhwb3J0IHtcbiAgZ2V0U2NhbGFyVmFsdWVcbn1cbiIsICJjb25zdCBERUZBVUxUX1RBR19IQU5ETEVSUzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgc3RyaW5nPj4gPSB7XG4gICchJzogJyEnLFxuICAnISEnOiAndGFnOnlhbWwub3JnLDIwMDI6J1xufVxuXG5mdW5jdGlvbiB0YWdQZXJjZW50RW5jb2RlIChzb3VyY2U6IHN0cmluZykge1xuICByZXR1cm4gZW5jb2RlVVJJKHNvdXJjZSkucmVwbGFjZSgvIS9nLCAnJTIxJylcbn1cblxuZnVuY3Rpb24gdGFnTmFtZUZ1bGwgKHJhd1RhZzogc3RyaW5nLCB0YWdIYW5kbGVycz86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHN0cmluZz4+KSB7XG4gIGlmIChyYXdUYWcuc3RhcnRzV2l0aCgnITwnKSAmJiByYXdUYWcuZW5kc1dpdGgoJz4nKSkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocmF3VGFnLnNsaWNlKDIsIC0xKSlcbiAgfVxuXG4gIGNvbnN0IGhhbmRsZUVuZCA9IHJhd1RhZy5pbmRleE9mKCchJywgMSlcbiAgY29uc3QgaGFuZGxlID0gaGFuZGxlRW5kID09PSAtMSA/ICchJyA6IHJhd1RhZy5zbGljZSgwLCBoYW5kbGVFbmQgKyAxKVxuICBjb25zdCBwcmVmaXggPSB0YWdIYW5kbGVycz8uW2hhbmRsZV0gPz8gREVGQVVMVF9UQUdfSEFORExFUlNbaGFuZGxlXSA/PyBoYW5kbGVcblxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHByZWZpeCkgKyBkZWNvZGVVUklDb21wb25lbnQocmF3VGFnLnNsaWNlKGhhbmRsZS5sZW5ndGgpKVxufVxuXG5mdW5jdGlvbiB0YWdOYW1lU2hvcnQgKGZ1bGxUYWc6IHN0cmluZykge1xuICBsZXQgdGFnID0gZnVsbFRhZ1xuXG4gIGlmICh0YWcuY2hhckNvZGVBdCgwKSA9PT0gMHgyMSkge1xuICAgIHRhZyA9IHRhZy5zbGljZSgxKVxuICAgIHJldHVybiBgISR7dGFnUGVyY2VudEVuY29kZSh0YWcpfWBcbiAgfVxuXG4gIGlmICh0YWcuc2xpY2UoMCwgMTgpID09PSAndGFnOnlhbWwub3JnLDIwMDI6Jykge1xuICAgIHJldHVybiBgISEke3RhZ1BlcmNlbnRFbmNvZGUodGFnLnNsaWNlKDE4KSl9YFxuICB9XG5cbiAgcmV0dXJuIGAhPCR7dGFnUGVyY2VudEVuY29kZSh0YWcpfT5gXG59XG5cbmV4cG9ydCB7XG4gIHRhZ05hbWVGdWxsLFxuICB0YWdOYW1lU2hvcnRcbn1cbiIsICJpbXBvcnQge1xuICBFVkVOVF9BTElBUyxcbiAgRVZFTlRfRE9DVU1FTlQsXG4gIEVWRU5UX01BUFBJTkcsXG4gIEVWRU5UX1BPUCxcbiAgRVZFTlRfU0NBTEFSLFxuICBFVkVOVF9TRVFVRU5DRSxcbiAgU0NBTEFSX1NUWUxFX1BMQUlOLFxuICB0eXBlIEV2ZW50LFxuICB0eXBlIFRhZ0hhbmRsZXJzLFxuICB0eXBlIE1hcHBpbmdFdmVudCxcbiAgdHlwZSBTY2FsYXJFdmVudCxcbiAgdHlwZSBTZXF1ZW5jZUV2ZW50XG59IGZyb20gJy4vZXZlbnRzLnRzJ1xuaW1wb3J0IHsgZ2V0U2NhbGFyVmFsdWUgfSBmcm9tICcuL3BhcnNlcl9zY2FsYXIudHMnXG5pbXBvcnQgeyBDT1JFX1NDSEVNQSwgdHlwZSBTY2hlbWEgfSBmcm9tICcuLi9zY2hlbWEudHMnXG5pbXBvcnQge1xuICBNRVJHRV9LRVksXG4gIE5PVF9SRVNPTFZFRCxcbiAgdHlwZSBNYXBwaW5nVGFnRGVmaW5pdGlvbixcbiAgdHlwZSBTY2FsYXJUYWdEZWZpbml0aW9uLFxuICB0eXBlIFNlcXVlbmNlVGFnRGVmaW5pdGlvblxufSBmcm9tICcuLi90YWcudHMnXG5pbXBvcnQgeyBZQU1MRXhjZXB0aW9uLCB0aHJvd0Vycm9yQXQgfSBmcm9tICcuLi9jb21tb24vZXhjZXB0aW9uLnRzJ1xuaW1wb3J0IHsgdGFnTmFtZUZ1bGwgfSBmcm9tICcuLi9jb21tb24vdGFnbmFtZS50cydcblxuY29uc3QgTk9fUkFOR0UgPSAtMVxuXG5pbnRlcmZhY2UgRG9jdW1lbnRGcmFtZSB7XG4gIGtpbmQ6ICdkb2N1bWVudCdcbiAgcG9zaXRpb246IG51bWJlclxuICB2YWx1ZTogdW5rbm93blxuICBoYXNWYWx1ZTogYm9vbGVhblxufVxuXG5pbnRlcmZhY2UgU2VxdWVuY2VGcmFtZSB7XG4gIGtpbmQ6ICdzZXF1ZW5jZSdcbiAgcG9zaXRpb246IG51bWJlclxuICB2YWx1ZTogYW55XG4gIHRhZzogU2VxdWVuY2VUYWdEZWZpbml0aW9uPGFueSwgYW55PlxuICBhbmNob3I6IEFuY2hvciB8IG51bGxcbiAgaW5kZXg6IG51bWJlclxuICAvLyBUcnVlIHdoZW4gdGhpcyBzZXF1ZW5jZSBpcyB0aGUgc291cmNlIGxpc3Qgb2YgYSBgPDxgIG1lcmdlIChgPDw6IFsuLi5dYCkuXG4gIC8vIEVhY2ggZWxlbWVudCBpcyB2YWxpZGF0ZWQgYXMgYSBtYXBwaW5nIG9uIGFycml2YWw7IHRoZSBtYXRlcmlhbGl6ZWQgbGlzdCBpc1xuICAvLyB0aGVuIGRlbGl2ZXJlZCB0byB0aGUgdGFyZ2V0IG1hcHBpbmcsIHdoaWNoIGZvbGRzIHRoZSBlbGVtZW50cyBpbi5cbiAgbWVyZ2U6IGJvb2xlYW5cbn1cblxuaW50ZXJmYWNlIE1hcHBpbmdGcmFtZSB7XG4gIGtpbmQ6ICdtYXBwaW5nJ1xuICBwb3NpdGlvbjogbnVtYmVyXG4gIHZhbHVlOiBhbnlcbiAgdGFnOiBNYXBwaW5nVGFnRGVmaW5pdGlvbjxhbnksIGFueT5cbiAgYW5jaG9yOiBBbmNob3IgfCBudWxsXG4gIGtleTogdW5rbm93blxuICBrZXlQb3NpdGlvbjogbnVtYmVyXG4gIGhhc0tleTogYm9vbGVhblxuICAvLyBLZXlzIGJyb3VnaHQgaW4gYnkgYSBtZXJnZSB0aGF0IGFuIGV4cGxpY2l0IHBhaXIgaXMgc3RpbGwgYWxsb3dlZCB0b1xuICAvLyBvdmVycmlkZS4gTGF6aWx5IGFsbG9jYXRlZDogc3RheXMgbnVsbCBmb3IgbWFwcGluZ3Mgd2l0aG91dCBgPDxgLlxuICBvdmVycmlkYWJsZTogU2V0PHVua25vd24+IHwgbnVsbFxufVxuXG50eXBlIEZyYW1lID0gRG9jdW1lbnRGcmFtZSB8IFNlcXVlbmNlRnJhbWUgfCBNYXBwaW5nRnJhbWVcblxudHlwZSBBbnlUYWcgPSBTY2FsYXJUYWdEZWZpbml0aW9uIHwgU2VxdWVuY2VUYWdEZWZpbml0aW9uPGFueSwgYW55PiB8IE1hcHBpbmdUYWdEZWZpbml0aW9uPGFueSwgYW55PlxuXG5pbnRlcmZhY2UgVmFsdWVBbmRUYWcge1xuICB2YWx1ZTogdW5rbm93blxuICB0YWc6IEFueVRhZ1xufVxuXG5pbnRlcmZhY2UgQW5jaG9yIHtcbiAgdmFsdWU6IHVua25vd25cbiAgdGFnOiBBbnlUYWdcbiAgaXNWYWx1ZUZpbmFsOiBib29sZWFuXG59XG5cbmludGVyZmFjZSBDb25zdHJ1Y3Rvck9wdGlvbnMge1xuICBzb3VyY2U6IHN0cmluZ1xuICBmaWxlbmFtZT86IHN0cmluZ1xuICBzY2hlbWE/OiBTY2hlbWFcbiAganNvbj86IGJvb2xlYW5cbiAgbWF4VG90YWxNZXJnZUtleXM/OiBudW1iZXJcbiAgbWF4QWxpYXNlcz86IG51bWJlclxufVxuXG4vLyBgc291cmNlYCBpcyBpbnB1dCBkYXRhLCBub3QgY29uZmlnIOKAlCBzbyBpdCBoYXMgbm8gZGVmYXVsdCBoZXJlLlxuY29uc3QgREVGQVVMVF9DT05TVFJVQ1RPUl9PUFRJT05TOiBSZXF1aXJlZDxPbWl0PENvbnN0cnVjdG9yT3B0aW9ucywgJ3NvdXJjZSc+PiA9IHtcbiAgZmlsZW5hbWU6ICcnLFxuICBzY2hlbWE6IENPUkVfU0NIRU1BLFxuICBqc29uOiBmYWxzZSxcbiAgbWF4VG90YWxNZXJnZUtleXM6IDEwMDAwLFxuICBtYXhBbGlhc2VzOiAtMVxufVxuXG5pbnRlcmZhY2UgQ29uc3RydWN0b3JTdGF0ZSBleHRlbmRzIFJlcXVpcmVkPENvbnN0cnVjdG9yT3B0aW9ucz4ge1xuICBldmVudHM6IEV2ZW50W11cbiAgZG9jdW1lbnRzOiB1bmtub3duW11cbiAgZXZlbnRJbmRleDogbnVtYmVyXG4gIHBvc2l0aW9uOiBudW1iZXJcbiAgZnJhbWVzOiBGcmFtZVtdXG4gIGFuY2hvcnM6IE1hcDxzdHJpbmcsIEFuY2hvcj5cbiAgdGFnSGFuZGxlcnM6IFRhZ0hhbmRsZXJzXG4gIHRvdGFsTWVyZ2VLZXlzOiBudW1iZXJcbiAgYWxpYXNDb3VudDogbnVtYmVyXG59XG5cbmZ1bmN0aW9uIGV2ZW50UG9zaXRpb24gKGV2ZW50OiBFdmVudCkge1xuICBpZiAoJ3RhZ1N0YXJ0JyBpbiBldmVudCAmJiBldmVudC50YWdTdGFydCAhPT0gTk9fUkFOR0UpIHJldHVybiBldmVudC50YWdTdGFydFxuICBpZiAoJ2FuY2hvclN0YXJ0JyBpbiBldmVudCAmJiBldmVudC5hbmNob3JTdGFydCAhPT0gTk9fUkFOR0UpIHJldHVybiBldmVudC5hbmNob3JTdGFydFxuICBpZiAoJ3ZhbHVlU3RhcnQnIGluIGV2ZW50ICYmIGV2ZW50LnZhbHVlU3RhcnQgIT09IE5PX1JBTkdFKSByZXR1cm4gZXZlbnQudmFsdWVTdGFydFxuICBpZiAoJ3N0YXJ0JyBpbiBldmVudCkgcmV0dXJuIGV2ZW50LnN0YXJ0XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIHRocm93RXJyb3IgKHN0YXRlOiBDb25zdHJ1Y3RvclN0YXRlLCBtZXNzYWdlOiBzdHJpbmcpOiBuZXZlciB7XG4gIHRocm93RXJyb3JBdChzdGF0ZS5zb3VyY2UsIHN0YXRlLnBvc2l0aW9uLCBtZXNzYWdlLCBzdGF0ZS5maWxlbmFtZSlcbn1cblxuZnVuY3Rpb24gZmluYWxpemVDb2xsZWN0aW9uIChcbiAgc3RhdGU6IENvbnN0cnVjdG9yU3RhdGUsXG4gIHBvc2l0aW9uOiBudW1iZXIsXG4gIHRhZzogU2VxdWVuY2VUYWdEZWZpbml0aW9uPGFueSwgYW55PiB8IE1hcHBpbmdUYWdEZWZpbml0aW9uPGFueSwgYW55PixcbiAgY2FycmllcjogdW5rbm93blxuKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHRhZy5maW5hbGl6ZShjYXJyaWVyKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFlBTUxFeGNlcHRpb24pIHRocm93IGVycm9yXG4gICAgdGhyb3dFcnJvckF0KFxuICAgICAgc3RhdGUuc291cmNlLFxuICAgICAgcG9zaXRpb24sXG4gICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvciksXG4gICAgICBzdGF0ZS5maWxlbmFtZVxuICAgIClcbiAgfVxufVxuXG5mdW5jdGlvbiBsb29rdXBUYWc8VCBleHRlbmRzIFNjYWxhclRhZ0RlZmluaXRpb24gfCBTZXF1ZW5jZVRhZ0RlZmluaXRpb24gfCBNYXBwaW5nVGFnRGVmaW5pdGlvbj4gKFxuICBleGFjdDogUmVjb3JkPHN0cmluZywgVD4sXG4gIHByZWZpeDogcmVhZG9ubHkgVFtdLFxuICB0YWdOYW1lOiBzdHJpbmdcbik6IFQgfCB1bmRlZmluZWQge1xuICBjb25zdCBleGFjdFRhZyA9IGV4YWN0W3RhZ05hbWVdXG4gIGlmIChleGFjdFRhZykgcmV0dXJuIGV4YWN0VGFnXG5cbiAgZm9yIChjb25zdCB0YWcgb2YgcHJlZml4KSB7XG4gICAgaWYgKHRhZ05hbWUuc3RhcnRzV2l0aCh0YWcudGFnTmFtZSkpIHJldHVybiB0YWdcbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWRcbn1cblxuZnVuY3Rpb24gZmluZEV4cGxpY2l0VGFnPFQgZXh0ZW5kcyBTY2FsYXJUYWdEZWZpbml0aW9uIHwgU2VxdWVuY2VUYWdEZWZpbml0aW9uIHwgTWFwcGluZ1RhZ0RlZmluaXRpb24+IChcbiAgc3RhdGU6IENvbnN0cnVjdG9yU3RhdGUsXG4gIGV4YWN0OiBSZWNvcmQ8c3RyaW5nLCBUPixcbiAgcHJlZml4OiByZWFkb25seSBUW10sXG4gIHRhZ05hbWU6IHN0cmluZyxcbiAgbm9kZUtpbmQ6IFRbJ25vZGVLaW5kJ11cbikge1xuICBjb25zdCB0YWcgPSBsb29rdXBUYWcoZXhhY3QsIHByZWZpeCwgdGFnTmFtZSlcbiAgaWYgKHRhZykgcmV0dXJuIHRhZ1xuXG4gIHRocm93RXJyb3Ioc3RhdGUsIGB1bmtub3duICR7bm9kZUtpbmR9IHRhZyAhPCR7dGFnTmFtZX0+YClcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0U2NhbGFyIChcbiAgc3RhdGU6IENvbnN0cnVjdG9yU3RhdGUsXG4gIGV2ZW50OiBTY2FsYXJFdmVudFxuKTogVmFsdWVBbmRUYWcge1xuICBjb25zdCBzb3VyY2UgPSBnZXRTY2FsYXJWYWx1ZShzdGF0ZS5zb3VyY2UsIGV2ZW50KVxuICBjb25zdCByYXdUYWcgPSBldmVudC50YWdTdGFydCA9PT0gTk9fUkFOR0VcbiAgICA/ICcnXG4gICAgOiBzdGF0ZS5zb3VyY2Uuc2xpY2UoZXZlbnQudGFnU3RhcnQsIGV2ZW50LnRhZ0VuZClcbiAgY29uc3Qgc3RyVGFnID0gc3RhdGUuc2NoZW1hLmRlZmF1bHRTY2FsYXJUYWdcblxuICBpZiAocmF3VGFnICE9PSAnJykge1xuICAgIGlmIChyYXdUYWcgPT09ICchJykgcmV0dXJuIHsgdmFsdWU6IHNvdXJjZSwgdGFnOiBzdHJUYWcgfVxuXG4gICAgY29uc3QgdGFnTmFtZSA9IHRhZ05hbWVGdWxsKHJhd1RhZywgc3RhdGUudGFnSGFuZGxlcnMpXG4gICAgY29uc3Qgc2NhbGFyVGFnID0gbG9va3VwVGFnKHN0YXRlLnNjaGVtYS5leGFjdC5zY2FsYXIsIHN0YXRlLnNjaGVtYS5wcmVmaXguc2NhbGFyLCB0YWdOYW1lKVxuXG4gICAgaWYgKHNjYWxhclRhZykge1xuICAgICAgY29uc3QgcmVzdWx0ID0gc2NhbGFyVGFnLnJlc29sdmUoc291cmNlLCB0cnVlLCB0YWdOYW1lKVxuXG4gICAgICBpZiAocmVzdWx0ID09PSBOT1RfUkVTT0xWRUQpIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgYGNhbm5vdCByZXNvbHZlIGEgbm9kZSB3aXRoICE8JHt0YWdOYW1lfT4gZXhwbGljaXQgdGFnYClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHsgdmFsdWU6IHJlc3VsdCwgdGFnOiBzY2FsYXJUYWcgfVxuICAgIH1cblxuICAgIC8vIEFuIGVtcHR5IG5vZGUgY2FycnlpbmcgYSBjb2xsZWN0aW9uIHRhZyAoZS5nLiBgISFtYXBgLCBgISFzZXFgKSBpcyBlbWl0dGVkXG4gICAgLy8gYnkgdGhlIHBhcnNlciBhcyBhIHNjYWxhciBldmVudCwgc2luY2UgdGhlcmUgaXMgbm8gY29sbGVjdGlvbiBzeW50YXggdG8ga2V5XG4gICAgLy8gb2ZmLiBSZXNvbHZlIGl0IGhlcmUgYnkgdGhlIGV4cGxpY2l0IHRhZydzIGtpbmQgaW50byBhbiBlbXB0eSBjb2xsZWN0aW9uLlxuICAgIGNvbnN0IGNvbGxlY3Rpb25UYWdEZWYgPVxuICAgICAgbG9va3VwVGFnKHN0YXRlLnNjaGVtYS5leGFjdC5tYXBwaW5nLCBzdGF0ZS5zY2hlbWEucHJlZml4Lm1hcHBpbmcsIHRhZ05hbWUpID8/XG4gICAgICBsb29rdXBUYWcoc3RhdGUuc2NoZW1hLmV4YWN0LnNlcXVlbmNlLCBzdGF0ZS5zY2hlbWEucHJlZml4LnNlcXVlbmNlLCB0YWdOYW1lKVxuXG4gICAgaWYgKGNvbGxlY3Rpb25UYWdEZWYpIHtcbiAgICAgIGlmIChzb3VyY2UgIT09ICcnKSB7XG4gICAgICAgIHRocm93RXJyb3Ioc3RhdGUsIGBjYW5ub3QgcmVzb2x2ZSBhIG5vZGUgd2l0aCAhPCR7dGFnTmFtZX0+IGV4cGxpY2l0IHRhZ2ApXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNhcnJpZXIgPSBjb2xsZWN0aW9uVGFnRGVmLmNyZWF0ZSh0YWdOYW1lKVxuICAgICAgY29uc3QgdmFsdWUgPSBjb2xsZWN0aW9uVGFnRGVmLmNhcnJpZXJJc1Jlc3VsdFxuICAgICAgICA/IGNhcnJpZXJcbiAgICAgICAgOiBmaW5hbGl6ZUNvbGxlY3Rpb24oc3RhdGUsIHN0YXRlLnBvc2l0aW9uLCBjb2xsZWN0aW9uVGFnRGVmLCBjYXJyaWVyKVxuICAgICAgcmV0dXJuIHsgdmFsdWUsIHRhZzogY29sbGVjdGlvblRhZ0RlZiB9XG4gICAgfVxuXG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgYHVua25vd24gc2NhbGFyIHRhZyAhPCR7dGFnTmFtZX0+YClcbiAgfVxuXG4gIGlmIChldmVudC5zdHlsZSA9PT0gU0NBTEFSX1NUWUxFX1BMQUlOKSB7XG4gICAgLy8gY2hhckF0KDApIChub3Qgc291cmNlWzBdKSB5aWVsZHMgJycgZm9yIGFuIGVtcHR5IHNvdXJjZSwgd2hpY2ggaXMgdGhlIGtleVxuICAgIC8vIHRoZSBudWxsIHRhZyBkZWNsYXJlczsgc291cmNlWzBdIHdvdWxkIGJlIHVuZGVmaW5lZCBhbmQgbWlzcyB0aGF0IGJ1Y2tldC5cbiAgICBjb25zdCBjYW5kaWRhdGVzID0gc3RhdGUuc2NoZW1hLmltcGxpY2l0U2NhbGFyQnlGaXJzdENoYXIuZ2V0KHNvdXJjZS5jaGFyQXQoMCkpID8/XG4gICAgICBzdGF0ZS5zY2hlbWEuaW1wbGljaXRTY2FsYXJBbnlGaXJzdENoYXJcbiAgICBmb3IgKGNvbnN0IHRhZyBvZiBjYW5kaWRhdGVzKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSB0YWcucmVzb2x2ZShzb3VyY2UsIGZhbHNlLCB0YWcudGFnTmFtZSlcbiAgICAgIGlmIChyZXN1bHQgIT09IE5PVF9SRVNPTFZFRCkgcmV0dXJuIHsgdmFsdWU6IHJlc3VsdCwgdGFnIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4geyB2YWx1ZTogc3RyVGFnLnJlc29sdmUoc291cmNlLCBmYWxzZSwgc3RyVGFnLnRhZ05hbWUpLCB0YWc6IHN0clRhZyB9XG59XG5cbmZ1bmN0aW9uIGNvbGxlY3Rpb25UYWc8VGFnIGV4dGVuZHMgU2VxdWVuY2VUYWdEZWZpbml0aW9uIHwgTWFwcGluZ1RhZ0RlZmluaXRpb24+IChcbiAgc3RhdGU6IENvbnN0cnVjdG9yU3RhdGUsXG4gIGV2ZW50OiBTZXF1ZW5jZUV2ZW50IHwgTWFwcGluZ0V2ZW50LFxuICBleGFjdDogUmVjb3JkPHN0cmluZywgVGFnPixcbiAgcHJlZml4OiByZWFkb25seSBUYWdbXSxcbiAgZGVmYXVsdFRhZ05hbWU6IHN0cmluZyxcbiAgbm9kZUtpbmQ6IFRhZ1snbm9kZUtpbmQnXVxuKSB7XG4gIGNvbnN0IHJhd1RhZyA9IGV2ZW50LnRhZ1N0YXJ0ID09PSBOT19SQU5HRVxuICAgID8gJydcbiAgICA6IHN0YXRlLnNvdXJjZS5zbGljZShldmVudC50YWdTdGFydCwgZXZlbnQudGFnRW5kKVxuICBjb25zdCB0YWdOYW1lID0gcmF3VGFnID09PSAnJyB8fCByYXdUYWcgPT09ICchJ1xuICAgID8gZGVmYXVsdFRhZ05hbWVcbiAgICA6IHRhZ05hbWVGdWxsKHJhd1RhZywgc3RhdGUudGFnSGFuZGxlcnMpXG5cbiAgcmV0dXJuIHtcbiAgICB0YWdOYW1lLFxuICAgIHRhZzogZmluZEV4cGxpY2l0VGFnKHN0YXRlLCBleGFjdCwgcHJlZml4LCB0YWdOYW1lLCBub2RlS2luZClcbiAgfVxufVxuXG4vLyBBIG1lcmdlIHNvdXJjZSBtdXN0IGJlIGEgbWFwcGluZzsgZXZlcnkgbWFwcGluZyB0YWcgZXhwb3NlcyB0aGUgcmVhZCBzaWRlLlxuZnVuY3Rpb24gaXNNYXBwaW5nVGFnICh0YWc6IEFueVRhZyk6IHRhZyBpcyBNYXBwaW5nVGFnRGVmaW5pdGlvbjxhbnksIGFueT4ge1xuICByZXR1cm4gdGFnLm5vZGVLaW5kID09PSAnbWFwcGluZydcbn1cblxuLy8gRm9sZCB0aGUga2V5cyBvZiBvbmUgbWFwcGluZyBzb3VyY2UgaW50byB0aGUgdGFyZ2V0IGZyYW1lLCBob25vcmluZyBtZXJnZVxuLy8gcHJlY2VkZW5jZTogYW4gYWxyZWFkeS1wcmVzZW50IGtleSAoZXhwbGljaXQgb3IgZnJvbSBhbiBlYXJsaWVyIHNvdXJjZSkgd2lucy5cbmZ1bmN0aW9uIG1lcmdlS2V5cyAoc3RhdGU6IENvbnN0cnVjdG9yU3RhdGUsIGZyYW1lOiBNYXBwaW5nRnJhbWUsIHNvdXJjZTogdW5rbm93biwgc291cmNlVGFnOiBNYXBwaW5nVGFnRGVmaW5pdGlvbjxhbnksIGFueT4pIHtcbiAgZm9yIChjb25zdCBzb3VyY2VLZXkgb2Ygc291cmNlVGFnLmtleXMoc291cmNlKSkge1xuICAgIGlmIChzdGF0ZS5tYXhUb3RhbE1lcmdlS2V5cyAhPT0gLTEgJiYgKytzdGF0ZS50b3RhbE1lcmdlS2V5cyA+IHN0YXRlLm1heFRvdGFsTWVyZ2VLZXlzKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCBgbWVyZ2Uga2V5cyBleGNlZWRlZCBtYXhUb3RhbE1lcmdlS2V5cyAoJHtzdGF0ZS5tYXhUb3RhbE1lcmdlS2V5c30pYClcbiAgICB9XG5cbiAgICBpZiAoZnJhbWUudGFnLmhhcyhmcmFtZS52YWx1ZSwgc291cmNlS2V5KSkgY29udGludWVcblxuICAgIGNvbnN0IGVyciA9IGZyYW1lLnRhZy5hZGRQYWlyKGZyYW1lLnZhbHVlLCBzb3VyY2VLZXksIHNvdXJjZVRhZy5nZXQoc291cmNlLCBzb3VyY2VLZXkpKVxuICAgIGlmIChlcnIpIHRocm93RXJyb3Ioc3RhdGUsIGVycilcbiAgICA7KGZyYW1lLm92ZXJyaWRhYmxlID8/PSBuZXcgU2V0KCkpLmFkZChzb3VyY2VLZXkpXG4gIH1cbn1cblxuLy8gVGhlIHZhbHVlIG9mIGEgYDw8YCBrZXk6IGVpdGhlciBhIG1hcHBpbmcgKGZvbGQgaXRzIGtleXMpIG9yIGEgc2VxdWVuY2Ugb2Zcbi8vIG1hcHBpbmdzIChmb2xkIGVhY2gpLiBBIG1lcmdlIHNlcXVlbmNlIGhhcyBhbHJlYWR5IGhhZCBldmVyeSBlbGVtZW50IHZhbGlkYXRlZFxuLy8gYXMgYSBtYXBwaW5nIG9uIGFycml2YWwgKHNlZSBhZGRWYWx1ZSksIGFuZCBpdHMgZWxlbWVudHMgd2VyZSBidWlsdCBieSB0aGVcbi8vIHRhcmdldCdzIG93biBtYXBwaW5nIHRhZywgc28gdGhleSBhcmUgcmVhZCBiYWNrIHdpdGggaXQuXG5mdW5jdGlvbiBtZXJnZVNvdXJjZSAoc3RhdGU6IENvbnN0cnVjdG9yU3RhdGUsIGZyYW1lOiBNYXBwaW5nRnJhbWUsIHNvdXJjZTogdW5rbm93biwgc291cmNlVGFnOiBBbnlUYWcpIHtcbiAgc3RhdGUucG9zaXRpb24gPSBmcmFtZS5rZXlQb3NpdGlvblxuXG4gIGlmIChpc01hcHBpbmdUYWcoc291cmNlVGFnKSkge1xuICAgIG1lcmdlS2V5cyhzdGF0ZSwgZnJhbWUsIHNvdXJjZSwgc291cmNlVGFnKVxuICB9IGVsc2UgaWYgKHNvdXJjZVRhZy5ub2RlS2luZCA9PT0gJ3NlcXVlbmNlJyAmJiBBcnJheS5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygc291cmNlKSB7XG4gICAgICBtZXJnZUtleXMoc3RhdGUsIGZyYW1lLCBlbGVtZW50LCBmcmFtZS50YWcpXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICdjYW5ub3QgbWVyZ2UgbWFwcGluZ3M7IHRoZSBwcm92aWRlZCBzb3VyY2Ugb2JqZWN0IGlzIHVuYWNjZXB0YWJsZScpXG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkTWFwcGluZ1ZhbHVlIChzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSwgZnJhbWU6IE1hcHBpbmdGcmFtZSwga2V5OiB1bmtub3duLCB2YWx1ZTogdW5rbm93biwgdGFnOiBBbnlUYWcpIHtcbiAgc3RhdGUucG9zaXRpb24gPSBmcmFtZS5rZXlQb3NpdGlvblxuXG4gIC8vIGA8PGAgaXMgaW50ZXJjZXB0ZWQgYmVmb3JlIGRlZHVwLCBzbyBhIHJlcGVhdGVkIG1lcmdlIGtleSBpcyBhbGxvd2VkLlxuICBpZiAoa2V5ID09PSBNRVJHRV9LRVkpIHtcbiAgICBtZXJnZVNvdXJjZShzdGF0ZSwgZnJhbWUsIHZhbHVlLCB0YWcpXG4gICAgcmV0dXJuXG4gIH1cblxuICBpZiAoIXN0YXRlLmpzb24gJiYgZnJhbWUudGFnLmhhcyhmcmFtZS52YWx1ZSwga2V5KSAmJiAhZnJhbWUub3ZlcnJpZGFibGU/LmhhcyhrZXkpKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2R1cGxpY2F0ZWQgbWFwcGluZyBrZXknKVxuICB9XG5cbiAgY29uc3QgZXJyID0gZnJhbWUudGFnLmFkZFBhaXIoZnJhbWUudmFsdWUsIGtleSwgdmFsdWUpXG4gIGlmIChlcnIpIHRocm93RXJyb3Ioc3RhdGUsIGVycilcbiAgZnJhbWUub3ZlcnJpZGFibGU/LmRlbGV0ZShrZXkpXG59XG5cbmZ1bmN0aW9uIGFkZFZhbHVlIChzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSwgdmFsdWU6IHVua25vd24sIHRhZzogQW55VGFnKSB7XG4gIGNvbnN0IGZyYW1lID0gc3RhdGUuZnJhbWVzW3N0YXRlLmZyYW1lcy5sZW5ndGggLSAxXSFcblxuICBpZiAoZnJhbWUua2luZCA9PT0gJ2RvY3VtZW50Jykge1xuICAgIGZyYW1lLnZhbHVlID0gdmFsdWVcbiAgICBmcmFtZS5oYXNWYWx1ZSA9IHRydWVcbiAgfSBlbHNlIGlmIChmcmFtZS5raW5kID09PSAnc2VxdWVuY2UnKSB7XG4gICAgaWYgKGZyYW1lLm1lcmdlKSB7XG4gICAgICAvLyBFbGVtZW50IG9mIGEgYDw8OiBbLi4uXWAgbGlzdDogdmFsaWRhdGUgaXQgaXMgYSBtYXBwaW5nLCB0aGVuIGNvbGxlY3RcbiAgICAgIC8vIGl0IGxpa2UgYW55IG90aGVyIGl0ZW0gZm9yIHRoZSB0YXJnZXQgdG8gZm9sZCBpbi5cbiAgICAgIGlmICghaXNNYXBwaW5nVGFnKHRhZykpIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2Nhbm5vdCBtZXJnZSBtYXBwaW5nczsgdGhlIHByb3ZpZGVkIHNvdXJjZSBvYmplY3QgaXMgdW5hY2NlcHRhYmxlJylcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZXJyID0gZnJhbWUudGFnLmFkZEl0ZW0oZnJhbWUudmFsdWUsIHZhbHVlLCBmcmFtZS5pbmRleCsrKVxuICAgIGlmIChlcnIpIHRocm93RXJyb3Ioc3RhdGUsIGVycilcbiAgfSBlbHNlIGlmIChmcmFtZS5oYXNLZXkpIHtcbiAgICBjb25zdCBrZXkgPSBmcmFtZS5rZXlcbiAgICBmcmFtZS5rZXkgPSB1bmRlZmluZWRcbiAgICBmcmFtZS5oYXNLZXkgPSBmYWxzZVxuICAgIGFkZE1hcHBpbmdWYWx1ZShzdGF0ZSwgZnJhbWUsIGtleSwgdmFsdWUsIHRhZylcbiAgfSBlbHNlIHtcbiAgICBmcmFtZS5rZXkgPSB2YWx1ZVxuICAgIGZyYW1lLmtleVBvc2l0aW9uID0gc3RhdGUucG9zaXRpb25cbiAgICBmcmFtZS5oYXNLZXkgPSB0cnVlXG4gIH1cbn1cblxuZnVuY3Rpb24gc3RvcmVBbmNob3IgKFxuICBzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSxcbiAgZXZlbnQ6IFNjYWxhckV2ZW50IHwgU2VxdWVuY2VFdmVudCB8IE1hcHBpbmdFdmVudCxcbiAgdmFsdWU6IHVua25vd24sXG4gIHRhZzogQW55VGFnLFxuICBpc1ZhbHVlRmluYWw6IGJvb2xlYW5cbik6IEFuY2hvciB8IG51bGwge1xuICBpZiAoZXZlbnQuYW5jaG9yU3RhcnQgIT09IE5PX1JBTkdFKSB7XG4gICAgY29uc3QgYW5jaG9yID0ge1xuICAgICAgdmFsdWUsXG4gICAgICB0YWcsXG4gICAgICBpc1ZhbHVlRmluYWxcbiAgICB9XG4gICAgc3RhdGUuYW5jaG9ycy5zZXQoc3RhdGUuc291cmNlLnNsaWNlKGV2ZW50LmFuY2hvclN0YXJ0LCBldmVudC5hbmNob3JFbmQpLCBhbmNob3IpXG4gICAgcmV0dXJuIGFuY2hvclxuICB9XG5cbiAgcmV0dXJuIG51bGxcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0RnJvbUV2ZW50cyAoZXZlbnRzOiBFdmVudFtdLCBvcHRpb25zOiBDb25zdHJ1Y3Rvck9wdGlvbnMpOiB1bmtub3duW10ge1xuICBjb25zdCBzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSA9IHtcbiAgICAuLi5ERUZBVUxUX0NPTlNUUlVDVE9SX09QVElPTlMsXG4gICAgLi4ub3B0aW9ucyxcbiAgICBldmVudHMsXG4gICAgZG9jdW1lbnRzOiBbXSxcbiAgICBldmVudEluZGV4OiAwLFxuICAgIHBvc2l0aW9uOiAwLFxuICAgIGZyYW1lczogW10sXG4gICAgYW5jaG9yczogbmV3IE1hcCgpLFxuICAgIHRhZ0hhbmRsZXJzOiBPYmplY3QuY3JlYXRlKG51bGwpLFxuICAgIHRvdGFsTWVyZ2VLZXlzOiAwLFxuICAgIGFsaWFzQ291bnQ6IDBcbiAgfVxuXG4gIHdoaWxlIChzdGF0ZS5ldmVudEluZGV4IDwgc3RhdGUuZXZlbnRzLmxlbmd0aCkge1xuICAgIGNvbnN0IGV2ZW50ID0gc3RhdGUuZXZlbnRzW3N0YXRlLmV2ZW50SW5kZXgrK11cbiAgICBzdGF0ZS5wb3NpdGlvbiA9IGV2ZW50UG9zaXRpb24oZXZlbnQpXG5cbiAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgIGNhc2UgRVZFTlRfRE9DVU1FTlQ6XG4gICAgICAgIHN0YXRlLmFuY2hvcnMgPSBuZXcgTWFwKClcbiAgICAgICAgc3RhdGUuYWxpYXNDb3VudCA9IDBcbiAgICAgICAgc3RhdGUudGFnSGFuZGxlcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgICAgIGZvciAoY29uc3QgZGlyZWN0aXZlIG9mIGV2ZW50LmRpcmVjdGl2ZXMpIHtcbiAgICAgICAgICBpZiAoZGlyZWN0aXZlLmtpbmQgPT09ICd0YWcnKSBzdGF0ZS50YWdIYW5kbGVyc1tkaXJlY3RpdmUuaGFuZGxlXSA9IGRpcmVjdGl2ZS5wcmVmaXhcbiAgICAgICAgfVxuICAgICAgICBzdGF0ZS5mcmFtZXMucHVzaCh7IGtpbmQ6ICdkb2N1bWVudCcsIHBvc2l0aW9uOiBzdGF0ZS5wb3NpdGlvbiwgdmFsdWU6IHVuZGVmaW5lZCwgaGFzVmFsdWU6IGZhbHNlIH0pXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgRVZFTlRfU0NBTEFSOiB7XG4gICAgICAgIGNvbnN0IHsgdmFsdWUsIHRhZyB9ID0gY29uc3RydWN0U2NhbGFyKHN0YXRlLCBldmVudClcbiAgICAgICAgc3RvcmVBbmNob3Ioc3RhdGUsIGV2ZW50LCB2YWx1ZSwgdGFnLCB0cnVlKVxuICAgICAgICBhZGRWYWx1ZShzdGF0ZSwgdmFsdWUsIHRhZylcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgY2FzZSBFVkVOVF9TRVFVRU5DRToge1xuICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gY29sbGVjdGlvblRhZyhcbiAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgICBldmVudCxcbiAgICAgICAgICBzdGF0ZS5zY2hlbWEuZXhhY3Quc2VxdWVuY2UsXG4gICAgICAgICAgc3RhdGUuc2NoZW1hLnByZWZpeC5zZXF1ZW5jZSxcbiAgICAgICAgICAndGFnOnlhbWwub3JnLDIwMDI6c2VxJyxcbiAgICAgICAgICAnc2VxdWVuY2UnXG4gICAgICAgIClcbiAgICAgICAgY29uc3QgdmFsdWUgPSBkZWZpbml0aW9uLnRhZy5jcmVhdGUoZGVmaW5pdGlvbi50YWdOYW1lKVxuICAgICAgICBjb25zdCBhbmNob3IgPSBzdG9yZUFuY2hvcihzdGF0ZSwgZXZlbnQsIHZhbHVlLCBkZWZpbml0aW9uLnRhZywgZGVmaW5pdGlvbi50YWcuY2FycmllcklzUmVzdWx0KVxuXG4gICAgICAgIC8vIGA8PDogWy4uLl1gIOKAlCB0aGUgcGFyZW50IG1hcHBpbmcgaXMgd2FpdGluZyBvbiBhIG1lcmdlIGtleSwgc28gdGhpc1xuICAgICAgICAvLyBzZXF1ZW5jZSBpcyBhIGxpc3Qgb2YgbWVyZ2Ugc291cmNlczogaXRzIGVsZW1lbnRzIG11c3QgYmUgbWFwcGluZ3MuXG4gICAgICAgIC8vIEl0IGlzIHN0aWxsIGJ1aWx0IGFuZCBkZWxpdmVyZWQgYXMgYSBub3JtYWwgdmFsdWU7IHRoZSB0YXJnZXQgZm9sZHMgaXQuXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHN0YXRlLmZyYW1lc1tzdGF0ZS5mcmFtZXMubGVuZ3RoIC0gMV1cbiAgICAgICAgY29uc3QgbWVyZ2UgPSBwYXJlbnQgIT09IHVuZGVmaW5lZCAmJiBwYXJlbnQua2luZCA9PT0gJ21hcHBpbmcnICYmXG4gICAgICAgICAgcGFyZW50Lmhhc0tleSAmJiBwYXJlbnQua2V5ID09PSBNRVJHRV9LRVlcblxuICAgICAgICBzdGF0ZS5mcmFtZXMucHVzaCh7XG4gICAgICAgICAga2luZDogJ3NlcXVlbmNlJywgcG9zaXRpb246IHN0YXRlLnBvc2l0aW9uLCB2YWx1ZSwgdGFnOiBkZWZpbml0aW9uLnRhZywgYW5jaG9yLCBpbmRleDogMCwgbWVyZ2VcbiAgICAgICAgfSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgY2FzZSBFVkVOVF9NQVBQSU5HOiB7XG4gICAgICAgIGNvbnN0IGRlZmluaXRpb24gPSBjb2xsZWN0aW9uVGFnKFxuICAgICAgICAgIHN0YXRlLFxuICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgIHN0YXRlLnNjaGVtYS5leGFjdC5tYXBwaW5nLFxuICAgICAgICAgIHN0YXRlLnNjaGVtYS5wcmVmaXgubWFwcGluZyxcbiAgICAgICAgICAndGFnOnlhbWwub3JnLDIwMDI6bWFwJyxcbiAgICAgICAgICAnbWFwcGluZydcbiAgICAgICAgKVxuICAgICAgICBjb25zdCB2YWx1ZSA9IGRlZmluaXRpb24udGFnLmNyZWF0ZShkZWZpbml0aW9uLnRhZ05hbWUpXG4gICAgICAgIGNvbnN0IGFuY2hvciA9IHN0b3JlQW5jaG9yKHN0YXRlLCBldmVudCwgdmFsdWUsIGRlZmluaXRpb24udGFnLCBkZWZpbml0aW9uLnRhZy5jYXJyaWVySXNSZXN1bHQpXG4gICAgICAgIHN0YXRlLmZyYW1lcy5wdXNoKHtcbiAgICAgICAgICBraW5kOiAnbWFwcGluZycsXG4gICAgICAgICAgcG9zaXRpb246IHN0YXRlLnBvc2l0aW9uLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIHRhZzogZGVmaW5pdGlvbi50YWcsXG4gICAgICAgICAgYW5jaG9yLFxuICAgICAgICAgIGtleTogdW5kZWZpbmVkLFxuICAgICAgICAgIGtleVBvc2l0aW9uOiBzdGF0ZS5wb3NpdGlvbixcbiAgICAgICAgICBoYXNLZXk6IGZhbHNlLFxuICAgICAgICAgIG92ZXJyaWRhYmxlOiBudWxsXG4gICAgICAgIH0pXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGNhc2UgRVZFTlRfQUxJQVM6IHtcbiAgICAgICAgaWYgKHN0YXRlLm1heEFsaWFzZXMgIT09IC0xICYmICsrc3RhdGUuYWxpYXNDb3VudCA+IHN0YXRlLm1heEFsaWFzZXMpIHtcbiAgICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCBgYWxpYXNlcyBleGNlZWRlZCBtYXhBbGlhc2VzICgke3N0YXRlLm1heEFsaWFzZXN9KWApXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuYW1lID0gc3RhdGUuc291cmNlLnNsaWNlKGV2ZW50LmFuY2hvclN0YXJ0LCBldmVudC5hbmNob3JFbmQpXG4gICAgICAgIGNvbnN0IGFuY2hvciA9IHN0YXRlLmFuY2hvcnMuZ2V0KG5hbWUpXG4gICAgICAgIGlmICghYW5jaG9yKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgYHVuaWRlbnRpZmllZCBhbGlhcyBcIiR7bmFtZX1cImApXG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhbmNob3IuaXNWYWx1ZUZpbmFsKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgYHJlY3Vyc2l2ZSBhbGlhcyBcIiR7bmFtZX1cIiBpcyBub3Qgc3VwcG9ydGVkIGZvciB0YWcgJHthbmNob3IudGFnLnRhZ05hbWV9IGJlY2F1c2UgaXQgdXNlcyBmaW5hbGl6ZSgpYClcbiAgICAgICAgfVxuICAgICAgICBhZGRWYWx1ZShzdGF0ZSwgYW5jaG9yLnZhbHVlLCBhbmNob3IudGFnKVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjYXNlIEVWRU5UX1BPUDoge1xuICAgICAgICBjb25zdCBmcmFtZSA9IHN0YXRlLmZyYW1lcy5wb3AoKSFcblxuICAgICAgICBpZiAoZnJhbWUua2luZCA9PT0gJ2RvY3VtZW50Jykge1xuICAgICAgICAgIHN0YXRlLmRvY3VtZW50cy5wdXNoKGZyYW1lLnZhbHVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gZnJhbWUudGFnLmNhcnJpZXJJc1Jlc3VsdFxuICAgICAgICAgICAgPyBmcmFtZS52YWx1ZVxuICAgICAgICAgICAgOiBmaW5hbGl6ZUNvbGxlY3Rpb24oc3RhdGUsIGZyYW1lLnBvc2l0aW9uLCBmcmFtZS50YWcsIGZyYW1lLnZhbHVlKVxuICAgICAgICAgIGlmIChmcmFtZS5hbmNob3IpIHtcbiAgICAgICAgICAgIGZyYW1lLmFuY2hvci52YWx1ZSA9IHZhbHVlXG4gICAgICAgICAgICBmcmFtZS5hbmNob3IuaXNWYWx1ZUZpbmFsID0gdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgICBhZGRWYWx1ZShzdGF0ZSwgdmFsdWUsIGZyYW1lLnRhZylcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdGF0ZS5kb2N1bWVudHNcbn1cblxuZXhwb3J0IHtcbiAgY29uc3RydWN0RnJvbUV2ZW50cyxcbiAgREVGQVVMVF9DT05TVFJVQ1RPUl9PUFRJT05TLFxuICB0eXBlIENvbnN0cnVjdG9yT3B0aW9uc1xufVxuIiwgImltcG9ydCB7XG4gIEVWRU5UX0RPQ1VNRU5ULFxuICBFVkVOVF9TRVFVRU5DRSxcbiAgRVZFTlRfTUFQUElORyxcbiAgRVZFTlRfU0NBTEFSLFxuICBFVkVOVF9BTElBUyxcbiAgRVZFTlRfUE9QLFxuICBTQ0FMQVJfU1RZTEVfUExBSU4sXG4gIFNDQUxBUl9TVFlMRV9TSU5HTEVfUVVPVEVELFxuICBTQ0FMQVJfU1RZTEVfRE9VQkxFX1FVT1RFRCxcbiAgU0NBTEFSX1NUWUxFX0xJVEVSQUxfQkxPQ0ssXG4gIFNDQUxBUl9TVFlMRV9GT0xERURfQkxPQ0ssXG4gIENPTExFQ1RJT05fU1RZTEVfQkxPQ0ssXG4gIENPTExFQ1RJT05fU1RZTEVfRkxPVyxcbiAgQ0hPTVBJTkdfQ0xJUCxcbiAgQ0hPTVBJTkdfU1RSSVAsXG4gIENIT01QSU5HX0tFRVAsXG4gIHR5cGUgRXZlbnQsXG4gIHR5cGUgU2NhbGFyU3R5bGUsXG4gIHR5cGUgQ29sbGVjdGlvblN0eWxlLFxuICB0eXBlIENob21waW5nLFxuICB0eXBlIERvY3VtZW50RGlyZWN0aXZlLFxuICB0eXBlIFRhZ0hhbmRsZXJzXG59IGZyb20gJy4vZXZlbnRzLnRzJ1xuaW1wb3J0IHsgdGhyb3dFcnJvckF0IH0gZnJvbSAnLi4vY29tbW9uL2V4Y2VwdGlvbi50cydcblxuY29uc3QgTk9fUkFOR0UgPSAtMVxuY29uc3QgSEFTX09XTiA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHlcblxuY29uc3QgQ09OVEVYVF9GTE9XX0lOID0gMVxuY29uc3QgQ09OVEVYVF9GTE9XX09VVCA9IDJcbmNvbnN0IENPTlRFWFRfQkxPQ0tfSU4gPSAzXG5jb25zdCBDT05URVhUX0JMT0NLX09VVCA9IDRcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnRyb2wtcmVnZXhcbmNvbnN0IFBBVFRFUk5fTk9OX1BSSU5UQUJMRSA9IC9bXFx4MDAtXFx4MDhcXHgwQlxceDBDXFx4MEUtXFx4MUZcXHg3Ri1cXHg4NFxceDg2LVxceDlGXFx1RkZGRVxcdUZGRkZdfFtcXHVEODAwLVxcdURCRkZdKD8hW1xcdURDMDAtXFx1REZGRl0pfCg/OlteXFx1RDgwMC1cXHVEQkZGXXxeKVtcXHVEQzAwLVxcdURGRkZdL1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZWxlc3MtZXNjYXBlXG5jb25zdCBQQVRURVJOX0ZMT1dfSU5ESUNBVE9SUyA9IC9bLFxcW1xcXXt9XS9cbi8vIFlBTUwgMS4yLjIsIFs5MV0gYy10YWctaGFuZGxlLlxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZWxlc3MtZXNjYXBlXG5jb25zdCBQQVRURVJOX1RBR19IQU5ETEUgPSAvXig/OiF8ISF8IVswLTlBLVphLXotXSshKSQvXG4vLyBZQU1MIDEuMi4yLCBbMzldIG5zLXVyaS1jaGFyLlxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZWxlc3MtZXNjYXBlXG5jb25zdCBOU19VUklfQ0hBUiA9IFN0cmluZy5yYXdgKD86JVswLTlBLUZhLWZdezJ9fFswLTlBLVphLXpcXC0jOy8/OkAmPSskLF8uIX4qJygpXFxbXFxdXSlgXG4vLyBZQU1MIDEuMi4yLCBbNDBdIG5zLXRhZy1jaGFyID0gbnMtdXJpLWNoYXIgLSBcIiFcIiAtIGMtZmxvdy1pbmRpY2F0b3IuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlbGVzcy1lc2NhcGVcbmNvbnN0IE5TX1RBR19DSEFSID0gU3RyaW5nLnJhd2AoPzolWzAtOUEtRmEtZl17Mn18WzAtOUEtWmEtelxcLSM7Lz86QCY9KyQufionKClfXSlgXG5jb25zdCBQQVRURVJOX1RBR19VUkkgPSBuZXcgUmVnRXhwKGBeKD86JHtOU19VUklfQ0hBUn0pKiRgKVxuLy8gWUFNTCAxLjIuMiwgWzk5XSBjLW5zLXNob3J0aGFuZC10YWcgc3VmZml4IHBhcnQuXG5jb25zdCBQQVRURVJOX1RBR19TVUZGSVggPSBuZXcgUmVnRXhwKGBeKD86JHtOU19UQUdfQ0hBUn0pKyRgKVxuLy8gWUFNTCAxLjIuMiwgWzkzXSBucy10YWctcHJlZml4LlxuY29uc3QgUEFUVEVSTl9UQUdfUFJFRklYID0gbmV3IFJlZ0V4cChgXig/OiEoPzoke05TX1VSSV9DSEFSfSkqfCR7TlNfVEFHX0NIQVJ9KD86JHtOU19VUklfQ0hBUn0pKikkYClcblxudHlwZSBOb2RlQ29udGV4dCA9XG4gIHR5cGVvZiBDT05URVhUX0ZMT1dfSU4gfCB0eXBlb2YgQ09OVEVYVF9GTE9XX09VVCB8XG4gIHR5cGVvZiBDT05URVhUX0JMT0NLX0lOIHwgdHlwZW9mIENPTlRFWFRfQkxPQ0tfT1VUXG5cbmludGVyZmFjZSBOb2RlUHJvcGVydGllcyB7XG4gIGFuY2hvclN0YXJ0OiBudW1iZXJcbiAgYW5jaG9yRW5kOiBudW1iZXJcbiAgdGFnU3RhcnQ6IG51bWJlclxuICB0YWdFbmQ6IG51bWJlclxufVxuXG5pbnRlcmZhY2UgUGFyc2VyU25hcHNob3Qge1xuICBwb3NpdGlvbjogbnVtYmVyXG4gIGxpbmU6IG51bWJlclxuICBsaW5lU3RhcnQ6IG51bWJlclxuICBsaW5lSW5kZW50OiBudW1iZXJcbiAgZmlyc3RUYWJJbkxpbmU6IG51bWJlclxuICBldmVudHNMZW5ndGg6IG51bWJlclxufVxuXG5pbnRlcmZhY2UgUGFyc2VyT3B0aW9ucyB7XG4gIGZpbGVuYW1lPzogc3RyaW5nXG4gIG1heERlcHRoPzogbnVtYmVyXG59XG5cbmNvbnN0IERFRkFVTFRfUEFSU0VSX09QVElPTlM6IFJlcXVpcmVkPFBhcnNlck9wdGlvbnM+ID0ge1xuICBmaWxlbmFtZTogJycsXG4gIG1heERlcHRoOiAxMDBcbn1cblxuaW50ZXJmYWNlIFBhcnNlclN0YXRlIGV4dGVuZHMgUmVxdWlyZWQ8UGFyc2VyT3B0aW9ucz4ge1xuICBpbnB1dDogc3RyaW5nXG4gIGxlbmd0aDogbnVtYmVyXG4gIHBvc2l0aW9uOiBudW1iZXJcbiAgbGluZTogbnVtYmVyXG4gIGxpbmVTdGFydDogbnVtYmVyXG4gIGxpbmVJbmRlbnQ6IG51bWJlclxuICBmaXJzdFRhYkluTGluZTogbnVtYmVyXG4gIGRlcHRoOiBudW1iZXJcbiAgZGlyZWN0aXZlczogRG9jdW1lbnREaXJlY3RpdmVbXVxuICB0YWdIYW5kbGVyczogVGFnSGFuZGxlcnNcbiAgZXZlbnRzOiBFdmVudFtdXG59XG5cbmZ1bmN0aW9uIGFkZERvY3VtZW50RXZlbnQgKFxuICBzdGF0ZTogUGFyc2VyU3RhdGUsXG4gIGV4cGxpY2l0U3RhcnQ6IGJvb2xlYW4sXG4gIGV4cGxpY2l0RW5kOiBib29sZWFuXG4pIHtcbiAgc3RhdGUuZXZlbnRzLnB1c2goe1xuICAgIHR5cGU6IEVWRU5UX0RPQ1VNRU5ULFxuICAgIGV4cGxpY2l0U3RhcnQsXG4gICAgZXhwbGljaXRFbmQsXG4gICAgZGlyZWN0aXZlczogc3RhdGUuZGlyZWN0aXZlc1xuICB9KVxufVxuXG5mdW5jdGlvbiBhZGRTZXF1ZW5jZUV2ZW50IChcbiAgc3RhdGU6IFBhcnNlclN0YXRlLFxuICBzdGFydDogbnVtYmVyLFxuICBhbmNob3JTdGFydDogbnVtYmVyLFxuICBhbmNob3JFbmQ6IG51bWJlcixcbiAgdGFnU3RhcnQ6IG51bWJlcixcbiAgdGFnRW5kOiBudW1iZXIsXG4gIHN0eWxlOiBDb2xsZWN0aW9uU3R5bGVcbikge1xuICBzdGF0ZS5ldmVudHMucHVzaCh7XG4gICAgdHlwZTogRVZFTlRfU0VRVUVOQ0UsXG4gICAgc3RhcnQsXG4gICAgYW5jaG9yU3RhcnQsXG4gICAgYW5jaG9yRW5kLFxuICAgIHRhZ1N0YXJ0LFxuICAgIHRhZ0VuZCxcbiAgICBzdHlsZVxuICB9KVxufVxuXG5mdW5jdGlvbiBhZGRNYXBwaW5nRXZlbnQgKFxuICBzdGF0ZTogUGFyc2VyU3RhdGUsXG4gIHN0YXJ0OiBudW1iZXIsXG4gIGFuY2hvclN0YXJ0OiBudW1iZXIsXG4gIGFuY2hvckVuZDogbnVtYmVyLFxuICB0YWdTdGFydDogbnVtYmVyLFxuICB0YWdFbmQ6IG51bWJlcixcbiAgc3R5bGU6IENvbGxlY3Rpb25TdHlsZVxuKSB7XG4gIHN0YXRlLmV2ZW50cy5wdXNoKHtcbiAgICB0eXBlOiBFVkVOVF9NQVBQSU5HLFxuICAgIHN0YXJ0LFxuICAgIGFuY2hvclN0YXJ0LFxuICAgIGFuY2hvckVuZCxcbiAgICB0YWdTdGFydCxcbiAgICB0YWdFbmQsXG4gICAgc3R5bGVcbiAgfSlcbn1cblxuZnVuY3Rpb24gYWRkU2NhbGFyRXZlbnQgKFxuICBzdGF0ZTogUGFyc2VyU3RhdGUsXG4gIHZhbHVlU3RhcnQ6IG51bWJlcixcbiAgdmFsdWVFbmQ6IG51bWJlcixcbiAgYW5jaG9yU3RhcnQ6IG51bWJlcixcbiAgYW5jaG9yRW5kOiBudW1iZXIsXG4gIHRhZ1N0YXJ0OiBudW1iZXIsXG4gIHRhZ0VuZDogbnVtYmVyLFxuICBzdHlsZTogU2NhbGFyU3R5bGUsXG4gIGNob21waW5nOiBDaG9tcGluZyA9IENIT01QSU5HX0NMSVAsXG4gIGluZGVudCA9IC0xLFxuICBmYXN0ID0gZmFsc2Vcbikge1xuICBzdGF0ZS5ldmVudHMucHVzaCh7XG4gICAgdHlwZTogRVZFTlRfU0NBTEFSLFxuICAgIHZhbHVlU3RhcnQsXG4gICAgdmFsdWVFbmQsXG4gICAgYW5jaG9yU3RhcnQsXG4gICAgYW5jaG9yRW5kLFxuICAgIHRhZ1N0YXJ0LFxuICAgIHRhZ0VuZCxcbiAgICBzdHlsZSxcbiAgICBjaG9tcGluZyxcbiAgICBpbmRlbnQsXG4gICAgZmFzdFxuICB9KVxufVxuXG5mdW5jdGlvbiBhZGRBbGlhc0V2ZW50IChcbiAgc3RhdGU6IFBhcnNlclN0YXRlLFxuICBhbmNob3JTdGFydDogbnVtYmVyLFxuICBhbmNob3JFbmQ6IG51bWJlclxuKSB7XG4gIHN0YXRlLmV2ZW50cy5wdXNoKHtcbiAgICB0eXBlOiBFVkVOVF9BTElBUyxcbiAgICBhbmNob3JTdGFydCxcbiAgICBhbmNob3JFbmRcbiAgfSlcbn1cblxuZnVuY3Rpb24gYWRkUG9wRXZlbnQgKHN0YXRlOiBQYXJzZXJTdGF0ZSkge1xuICBzdGF0ZS5ldmVudHMucHVzaCh7IHR5cGU6IEVWRU5UX1BPUCB9KVxufVxuXG5mdW5jdGlvbiBhZGRFbXB0eVNjYWxhckV2ZW50IChzdGF0ZTogUGFyc2VyU3RhdGUpIHtcbiAgYWRkU2NhbGFyRXZlbnQoXG4gICAgc3RhdGUsXG4gICAgTk9fUkFOR0UsXG4gICAgTk9fUkFOR0UsXG4gICAgTk9fUkFOR0UsXG4gICAgTk9fUkFOR0UsXG4gICAgTk9fUkFOR0UsXG4gICAgTk9fUkFOR0UsXG4gICAgU0NBTEFSX1NUWUxFX1BMQUlOXG4gIClcbn1cblxuZnVuY3Rpb24gZW1wdHlQcm9wZXJ0aWVzICgpOiBOb2RlUHJvcGVydGllcyB7XG4gIHJldHVybiB7XG4gICAgYW5jaG9yU3RhcnQ6IE5PX1JBTkdFLFxuICAgIGFuY2hvckVuZDogTk9fUkFOR0UsXG4gICAgdGFnU3RhcnQ6IE5PX1JBTkdFLFxuICAgIHRhZ0VuZDogTk9fUkFOR0VcbiAgfVxufVxuXG5mdW5jdGlvbiBzbmFwc2hvdFN0YXRlIChzdGF0ZTogUGFyc2VyU3RhdGUpOiBQYXJzZXJTbmFwc2hvdCB7XG4gIHJldHVybiB7XG4gICAgcG9zaXRpb246IHN0YXRlLnBvc2l0aW9uLFxuICAgIGxpbmU6IHN0YXRlLmxpbmUsXG4gICAgbGluZVN0YXJ0OiBzdGF0ZS5saW5lU3RhcnQsXG4gICAgbGluZUluZGVudDogc3RhdGUubGluZUluZGVudCxcbiAgICBmaXJzdFRhYkluTGluZTogc3RhdGUuZmlyc3RUYWJJbkxpbmUsXG4gICAgZXZlbnRzTGVuZ3RoOiBzdGF0ZS5ldmVudHMubGVuZ3RoXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzdG9yZVN0YXRlIChzdGF0ZTogUGFyc2VyU3RhdGUsIHNuYXBzaG90OiBQYXJzZXJTbmFwc2hvdCkge1xuICBzdGF0ZS5wb3NpdGlvbiA9IHNuYXBzaG90LnBvc2l0aW9uXG4gIHN0YXRlLmxpbmUgPSBzbmFwc2hvdC5saW5lXG4gIHN0YXRlLmxpbmVTdGFydCA9IHNuYXBzaG90LmxpbmVTdGFydFxuICBzdGF0ZS5saW5lSW5kZW50ID0gc25hcHNob3QubGluZUluZGVudFxuICBzdGF0ZS5maXJzdFRhYkluTGluZSA9IHNuYXBzaG90LmZpcnN0VGFiSW5MaW5lXG4gIHN0YXRlLmV2ZW50cy5sZW5ndGggPSBzbmFwc2hvdC5ldmVudHNMZW5ndGhcbn1cblxuZnVuY3Rpb24gdGhyb3dFcnJvciAoc3RhdGU6IFBhcnNlclN0YXRlLCBtZXNzYWdlOiBzdHJpbmcpOiBuZXZlciB7XG4gIHRocm93RXJyb3JBdChzdGF0ZS5pbnB1dC5zbGljZSgwLCBzdGF0ZS5sZW5ndGgpLCBzdGF0ZS5wb3NpdGlvbiwgbWVzc2FnZSwgc3RhdGUuZmlsZW5hbWUpXG59XG5cbmZ1bmN0aW9uIGlzRW9sIChjOiBudW1iZXIpIHtcbiAgcmV0dXJuIGMgPT09IDB4MEEvKiBMRiAqLyB8fCBjID09PSAweDBELyogQ1IgKi9cbn1cblxuZnVuY3Rpb24gaXNXaGl0ZVNwYWNlIChjOiBudW1iZXIpIHtcbiAgcmV0dXJuIGMgPT09IDB4MDkvKiBUYWIgKi8gfHwgYyA9PT0gMHgyMC8qIFNwYWNlICovXG59XG5cbmZ1bmN0aW9uIGlzV3NPckVvbCAoYzogbnVtYmVyKSB7XG4gIHJldHVybiBpc1doaXRlU3BhY2UoYykgfHwgaXNFb2woYylcbn1cblxuZnVuY3Rpb24gaXNXc09yRW9sT3JFbmQgKGM6IG51bWJlcikge1xuICByZXR1cm4gYyA9PT0gMCB8fCBpc1dzT3JFb2woYylcbn1cblxuZnVuY3Rpb24gaXNGbG93SW5kaWNhdG9yIChjOiBudW1iZXIpIHtcbiAgcmV0dXJuIGMgPT09IDB4MkMvKiAsICovIHx8XG4gICAgICAgICBjID09PSAweDVCLyogWyAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg1RC8qIF0gKi8gfHxcbiAgICAgICAgIGMgPT09IDB4N0IvKiB7ICovIHx8XG4gICAgICAgICBjID09PSAweDdELyogfSAqL1xufVxuXG5mdW5jdGlvbiBmcm9tRGVjaW1hbENvZGUgKGM6IG51bWJlcikge1xuICByZXR1cm4gYyA+PSAweDMwLyogMCAqLyAmJiBjIDw9IDB4MzkvKiA5ICovID8gYyAtIDB4MzAgOiAtMVxufVxuXG5mdW5jdGlvbiBmcm9tSGV4Q29kZSAoYzogbnVtYmVyKSB7XG4gIGlmIChjID49IDB4MzAvKiAwICovICYmIGMgPD0gMHgzOS8qIDkgKi8pIHJldHVybiBjIC0gMHgzMFxuICBjb25zdCBsYyA9IGMgfCAweDIwXG4gIGlmIChsYyA+PSAweDYxLyogYSAqLyAmJiBsYyA8PSAweDY2LyogZiAqLykgcmV0dXJuIGxjIC0gMHg2MSArIDEwXG4gIHJldHVybiAtMVxufVxuXG5mdW5jdGlvbiBlc2NhcGVkSGV4TGVuIChjOiBudW1iZXIpIHtcbiAgaWYgKGMgPT09IDB4NzgvKiB4ICovKSByZXR1cm4gMlxuICBpZiAoYyA9PT0gMHg3NS8qIHUgKi8pIHJldHVybiA0XG4gIGlmIChjID09PSAweDU1LyogVSAqLykgcmV0dXJuIDhcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gaXNTaW1wbGVFc2NhcGUgKGM6IG51bWJlcikge1xuICByZXR1cm4gYyA9PT0gMHgzMC8qIDAgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NjEvKiBhICovIHx8XG4gICAgICAgICBjID09PSAweDYyLyogYiAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg3NC8qIHQgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4MDkvKiBUYWIgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NkUvKiBuICovIHx8XG4gICAgICAgICBjID09PSAweDc2LyogdiAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg2Ni8qIGYgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NzIvKiByICovIHx8XG4gICAgICAgICBjID09PSAweDY1LyogZSAqLyB8fFxuICAgICAgICAgYyA9PT0gMHgyMC8qIFNwYWNlICovIHx8XG4gICAgICAgICBjID09PSAweDIyLyogXCIgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4MkYvKiAvICovIHx8XG4gICAgICAgICBjID09PSAweDVDLyogXFwgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NEUvKiBOICovIHx8XG4gICAgICAgICBjID09PSAweDVGLyogXyAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg0Qy8qIEwgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NTAvKiBQICovXG59XG5cbi8vIFByZWNvbmRpdGlvbjogc3RhdGUucG9zaXRpb24gcG9pbnRzIGF0IExGIG9yIENSLlxuZnVuY3Rpb24gY29uc3VtZUxpbmVCcmVhayAoc3RhdGU6IFBhcnNlclN0YXRlKSB7XG4gIGNvbnN0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICBpZiAoY2ggPT09IDB4MEEvKiBMRiAqLykge1xuICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgfSBlbHNlIHtcbiAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAweDBBLyogTEYgKi8pIHN0YXRlLnBvc2l0aW9uKytcbiAgfVxuXG4gIHN0YXRlLmxpbmUrK1xuICBzdGF0ZS5saW5lU3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICBzdGF0ZS5saW5lSW5kZW50ID0gMFxuICBzdGF0ZS5maXJzdFRhYkluTGluZSA9IC0xXG59XG5cbmZ1bmN0aW9uIHNraXBTZXBhcmF0aW9uU3BhY2UgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgYWxsb3dDb21tZW50czogYm9vbGVhbikge1xuICBsZXQgbGluZUJyZWFrcyA9IDBcbiAgbGV0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcbiAgbGV0IGhhc1NlcGFyYXRpb24gPSBzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0IHx8XG4gICAgaXNXc09yRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gLSAxKSlcblxuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICB3aGlsZSAoaXNXaGl0ZVNwYWNlKGNoKSkge1xuICAgICAgaGFzU2VwYXJhdGlvbiA9IHRydWVcbiAgICAgIGlmIChjaCA9PT0gMHgwOS8qIFRhYiAqLyAmJiBzdGF0ZS5maXJzdFRhYkluTGluZSA9PT0gLTEpIHtcbiAgICAgICAgc3RhdGUuZmlyc3RUYWJJbkxpbmUgPSBzdGF0ZS5wb3NpdGlvblxuICAgICAgfVxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgfVxuXG4gICAgaWYgKGFsbG93Q29tbWVudHMgJiYgaGFzU2VwYXJhdGlvbiAmJiBjaCA9PT0gMHgyMy8qICMgKi8pIHtcbiAgICAgIGRvIHsgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pIH1cbiAgICAgIHdoaWxlICghaXNFb2woY2gpICYmIGNoICE9PSAwKVxuICAgIH1cblxuICAgIGlmICghaXNFb2woY2gpKSBicmVha1xuXG4gICAgY29uc3VtZUxpbmVCcmVhayhzdGF0ZSlcbiAgICBsaW5lQnJlYWtzKytcbiAgICBoYXNTZXBhcmF0aW9uID0gdHJ1ZVxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIHdoaWxlIChjaCA9PT0gMHgyMC8qIFNwYWNlICovKSB7XG4gICAgICBzdGF0ZS5saW5lSW5kZW50KytcbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBsaW5lQnJlYWtzXG59XG5cbmZ1bmN0aW9uIHRlc3REb2N1bWVudFNlcGFyYXRvciAoc3RhdGU6IFBhcnNlclN0YXRlLCBwb3NpdGlvbiA9IHN0YXRlLnBvc2l0aW9uKSB7XG4gIGNvbnN0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbilcblxuICBpZiAoKGNoID09PSAweDJELyogLSAqLyB8fCBjaCA9PT0gMHgyRS8qIC4gKi8pICYmXG4gICAgICBjaCA9PT0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbiArIDEpICYmXG4gICAgICBjaCA9PT0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbiArIDIpKSB7XG4gICAgY29uc3QgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbiArIDMpXG4gICAgcmV0dXJuIGZvbGxvd2luZyA9PT0gMCB8fCBpc1dzT3JFb2woZm9sbG93aW5nKVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIHNraXBVbnRpbExpbmVFbmQgKHN0YXRlOiBQYXJzZXJTdGF0ZSkge1xuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gIHdoaWxlIChjaCAhPT0gMCAmJiAhaXNFb2woY2gpKSB7XG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tQcmludGFibGUgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcbiAgaWYgKFBBVFRFUk5fTk9OX1BSSU5UQUJMRS50ZXN0KHN0YXRlLmlucHV0LnNsaWNlKHN0YXJ0LCBlbmQpKSkge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICd0aGUgc3RyZWFtIGNvbnRhaW5zIG5vbi1wcmludGFibGUgY2hhcmFjdGVycycpXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVhZFRhZ1Byb3BlcnR5IChzdGF0ZTogUGFyc2VyU3RhdGUsIHByb3BzOiBOb2RlUHJvcGVydGllcywgaW5GbG93OiBib29sZWFuKSB7XG4gIGlmIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMHgyMS8qICEgKi8pIHJldHVybiBmYWxzZVxuICBpZiAocHJvcHMudGFnU3RhcnQgIT09IE5PX1JBTkdFKSB0aHJvd0Vycm9yKHN0YXRlLCAnZHVwbGljYXRpb24gb2YgYSB0YWcgcHJvcGVydHknKVxuXG4gIGNvbnN0IHN0YXJ0ID0gc3RhdGUucG9zaXRpb25cbiAgbGV0IGlzVmVyYmF0aW0gPSBmYWxzZVxuICBsZXQgaXNOYW1lZCA9IGZhbHNlXG4gIGxldCB0YWdIYW5kbGUgPSAnISdcbiAgbGV0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuXG4gIGlmIChjaCA9PT0gMHgzQy8qIDwgKi8pIHtcbiAgICBpc1ZlcmJhdGltID0gdHJ1ZVxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICB9IGVsc2UgaWYgKGNoID09PSAweDIxLyogISAqLykge1xuICAgIGlzTmFtZWQgPSB0cnVlXG4gICAgdGFnSGFuZGxlID0gJyEhJ1xuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICB9XG5cbiAgbGV0IHN1ZmZpeFN0YXJ0ID0gc3RhdGUucG9zaXRpb25cbiAgbGV0IHRhZ05hbWVcblxuICBpZiAoaXNWZXJiYXRpbSkge1xuICAgIHdoaWxlIChjaCAhPT0gMCAmJiBjaCAhPT0gMHgzRS8qID4gKi8pIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICAgIGlmIChjaCAhPT0gMHgzRS8qID4gKi8pIHRocm93RXJyb3Ioc3RhdGUsICd1bmV4cGVjdGVkIGVuZCBvZiB0aGUgc3RyZWFtIHdpdGhpbiBhIHZlcmJhdGltIHRhZycpXG4gICAgdGFnTmFtZSA9IHN0YXRlLmlucHV0LnNsaWNlKHN1ZmZpeFN0YXJ0LCBzdGF0ZS5wb3NpdGlvbilcbiAgICBzdGF0ZS5wb3NpdGlvbisrXG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKGNoICE9PSAwICYmICFpc1dzT3JFb2woY2gpICYmICEoaW5GbG93ICYmIGlzRmxvd0luZGljYXRvcihjaCkpKSB7XG4gICAgICBpZiAoY2ggPT09IDB4MjEvKiAhICovKSB7XG4gICAgICAgIGlmICghaXNOYW1lZCkge1xuICAgICAgICAgIHRhZ0hhbmRsZSA9IHN0YXRlLmlucHV0LnNsaWNlKHN1ZmZpeFN0YXJ0IC0gMSwgc3RhdGUucG9zaXRpb24gKyAxKVxuICAgICAgICAgIGlmICghUEFUVEVSTl9UQUdfSEFORExFLnRlc3QodGFnSGFuZGxlKSkgdGhyb3dFcnJvcihzdGF0ZSwgJ25hbWVkIHRhZyBoYW5kbGUgY2Fubm90IGNvbnRhaW4gc3VjaCBjaGFyYWN0ZXJzJylcbiAgICAgICAgICBpc05hbWVkID0gdHJ1ZVxuICAgICAgICAgIHN1ZmZpeFN0YXJ0ID0gc3RhdGUucG9zaXRpb24gKyAxXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RhZyBzdWZmaXggY2Fubm90IGNvbnRhaW4gZXhjbGFtYXRpb24gbWFya3MnKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICAgIH1cblxuICAgIHRhZ05hbWUgPSBzdGF0ZS5pbnB1dC5zbGljZShzdWZmaXhTdGFydCwgc3RhdGUucG9zaXRpb24pXG4gICAgaWYgKFBBVFRFUk5fRkxPV19JTkRJQ0FUT1JTLnRlc3QodGFnTmFtZSkpIHRocm93RXJyb3Ioc3RhdGUsICd0YWcgc3VmZml4IGNhbm5vdCBjb250YWluIGZsb3cgaW5kaWNhdG9yIGNoYXJhY3RlcnMnKVxuICB9XG5cbiAgaWYgKHRhZ05hbWUgJiYgIShpc1ZlcmJhdGltID8gUEFUVEVSTl9UQUdfVVJJLnRlc3QodGFnTmFtZSkgOiBQQVRURVJOX1RBR19TVUZGSVgudGVzdCh0YWdOYW1lKSkpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCBgdGFnIG5hbWUgY2Fubm90IGNvbnRhaW4gc3VjaCBjaGFyYWN0ZXJzOiAke3RhZ05hbWV9YClcbiAgfVxuICB0cnkge1xuICAgIGRlY29kZVVSSUNvbXBvbmVudCh0YWdOYW1lKVxuICB9IGNhdGNoIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCBgdGFnIG5hbWUgaXMgbWFsZm9ybWVkOiAke3RhZ05hbWV9YClcbiAgfVxuXG4gIGlmICghaXNWZXJiYXRpbSAmJiB0YWdIYW5kbGUgIT09ICchJyAmJiB0YWdIYW5kbGUgIT09ICchIScgJiYgIUhBU19PV04uY2FsbChzdGF0ZS50YWdIYW5kbGVycywgdGFnSGFuZGxlKSkge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsIGB1bmRlY2xhcmVkIHRhZyBoYW5kbGUgXCIke3RhZ0hhbmRsZX1cImApXG4gIH1cblxuICBwcm9wcy50YWdTdGFydCA9IHN0YXJ0XG4gIHByb3BzLnRhZ0VuZCA9IHN0YXRlLnBvc2l0aW9uXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHJlYWRBbmNob3JQcm9wZXJ0eSAoc3RhdGU6IFBhcnNlclN0YXRlLCBwcm9wczogTm9kZVByb3BlcnRpZXMpIHtcbiAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAweDI2LyogJiAqLykgcmV0dXJuIGZhbHNlXG4gIGlmIChwcm9wcy5hbmNob3JTdGFydCAhPT0gTk9fUkFOR0UpIHRocm93RXJyb3Ioc3RhdGUsICdkdXBsaWNhdGlvbiBvZiBhbiBhbmNob3IgcHJvcGVydHknKVxuXG4gIHN0YXRlLnBvc2l0aW9uKytcbiAgY29uc3Qgc3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCAmJiAhaXNXc09yRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSAmJiAhaXNGbG93SW5kaWNhdG9yKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkge1xuICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgfVxuXG4gIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhcnQpIHRocm93RXJyb3Ioc3RhdGUsICduYW1lIG9mIGFuIGFuY2hvciBub2RlIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgY2hhcmFjdGVyJylcblxuICBwcm9wcy5hbmNob3JTdGFydCA9IHN0YXJ0XG4gIHByb3BzLmFuY2hvckVuZCA9IHN0YXRlLnBvc2l0aW9uXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHJlYWRBbGlhcyAoc3RhdGU6IFBhcnNlclN0YXRlLCBwcm9wczogTm9kZVByb3BlcnRpZXMpIHtcbiAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAweDJBLyogKiAqLykgcmV0dXJuIGZhbHNlXG4gIGlmIChwcm9wcy5hbmNob3JTdGFydCAhPT0gTk9fUkFOR0UgfHwgcHJvcHMudGFnU3RhcnQgIT09IE5PX1JBTkdFKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2FsaWFzIG5vZGUgc2hvdWxkIG5vdCBoYXZlIGFueSBwcm9wZXJ0aWVzJylcbiAgfVxuXG4gIHN0YXRlLnBvc2l0aW9uKytcbiAgY29uc3Qgc3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCAmJiAhaXNXc09yRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSAmJiAhaXNGbG93SW5kaWNhdG9yKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkge1xuICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgfVxuXG4gIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhcnQpIHRocm93RXJyb3Ioc3RhdGUsICduYW1lIG9mIGFuIGFsaWFzIG5vZGUgbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBjaGFyYWN0ZXInKVxuXG4gIGFkZEFsaWFzRXZlbnQoc3RhdGUsIHN0YXJ0LCBzdGF0ZS5wb3NpdGlvbilcbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gcmVhZEZsb3dTY2FsYXJCcmVhayAoc3RhdGU6IFBhcnNlclN0YXRlLCBub2RlSW5kZW50OiBudW1iZXIpIHtcbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgZmFsc2UpXG5cbiAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPCBub2RlSW5kZW50KSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2RlZmljaWVudCBpbmRlbnRhdGlvbicpXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVhZFNpbmdsZVF1b3RlZFNjYWxhciAoc3RhdGU6IFBhcnNlclN0YXRlLCBub2RlSW5kZW50OiBudW1iZXIsIHByb3BzOiBOb2RlUHJvcGVydGllcykge1xuICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgIT09IDB4MjcvKiAnICovKSByZXR1cm4gZmFsc2VcblxuICBzdGF0ZS5wb3NpdGlvbisrXG4gIGNvbnN0IHN0YXJ0ID0gc3RhdGUucG9zaXRpb25cbiAgLy8gQSBzaW5nbGUtcXVvdGVkIHNjYWxhciBpcyBzbGljZWFibGUgdmVyYmF0aW0gd2hlbiBpdCBoYXMgbm8gJycgZXNjYXBlIHBhaXJzXG4gIC8vIGFuZCBubyBmb2xkZWQgbGluZSBicmVha3MgKHNlZSBnZXRTY2FsYXJWYWx1ZSBmYXN0IHBhdGgpLlxuICBsZXQgc2ltcGxlID0gdHJ1ZVxuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCkge1xuICAgIGNvbnN0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIGlmIChjaCA9PT0gMHgyNy8qICcgKi8pIHtcbiAgICAgIGlmIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSkgPT09IDB4MjcvKiAnICovKSB7XG4gICAgICAgIHNpbXBsZSA9IGZhbHNlXG4gICAgICAgIHN0YXRlLnBvc2l0aW9uICs9IDJcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgY29uc3QgZW5kID0gc3RhdGUucG9zaXRpb25cbiAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgIGFkZFNjYWxhckV2ZW50KHN0YXRlLCBzdGFydCwgZW5kLCBwcm9wcy5hbmNob3JTdGFydCwgcHJvcHMuYW5jaG9yRW5kLCBwcm9wcy50YWdTdGFydCwgcHJvcHMudGFnRW5kLCBTQ0FMQVJfU1RZTEVfU0lOR0xFX1FVT1RFRCwgQ0hPTVBJTkdfQ0xJUCwgLTEsIHNpbXBsZSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKGlzRW9sKGNoKSkge1xuICAgICAgc2ltcGxlID0gZmFsc2VcbiAgICAgIHJlYWRGbG93U2NhbGFyQnJlYWsoc3RhdGUsIG5vZGVJbmRlbnQpXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd1bmV4cGVjdGVkIGVuZCBvZiB0aGUgZG9jdW1lbnQgd2l0aGluIGEgc2luZ2xlIHF1b3RlZCBzY2FsYXInKVxuICAgIH0gZWxzZSBpZiAoY2ggIT09IDB4MDkvKiBUYWIgKi8gJiYgY2ggPCAweDIwKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZXhwZWN0ZWQgdmFsaWQgSlNPTiBjaGFyYWN0ZXInKVxuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgfVxuICB9XG5cbiAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuZXhwZWN0ZWQgZW5kIG9mIHRoZSBzdHJlYW0gd2l0aGluIGEgc2luZ2xlIHF1b3RlZCBzY2FsYXInKVxufVxuXG5mdW5jdGlvbiByZWFkRG91YmxlUXVvdGVkU2NhbGFyIChzdGF0ZTogUGFyc2VyU3RhdGUsIG5vZGVJbmRlbnQ6IG51bWJlciwgcHJvcHM6IE5vZGVQcm9wZXJ0aWVzKSB7XG4gIGlmIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMHgyMi8qIFwiICovKSByZXR1cm4gZmFsc2VcblxuICBzdGF0ZS5wb3NpdGlvbisrXG4gIGNvbnN0IHN0YXJ0ID0gc3RhdGUucG9zaXRpb25cbiAgLy8gQSBkb3VibGUtcXVvdGVkIHNjYWxhciBpcyBzbGljZWFibGUgdmVyYmF0aW0gd2hlbiBpdCBoYXMgbm8gXFwgZXNjYXBlcyBhbmRcbiAgLy8gbm8gZm9sZGVkIGxpbmUgYnJlYWtzIChzZWUgZ2V0U2NhbGFyVmFsdWUgZmFzdCBwYXRoKS5cbiAgbGV0IHNpbXBsZSA9IHRydWVcblxuICB3aGlsZSAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgIT09IDApIHtcbiAgICBjb25zdCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgICBpZiAoY2ggPT09IDB4MjIvKiBcIiAqLykge1xuICAgICAgY29uc3QgZW5kID0gc3RhdGUucG9zaXRpb25cbiAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgIGFkZFNjYWxhckV2ZW50KHN0YXRlLCBzdGFydCwgZW5kLCBwcm9wcy5hbmNob3JTdGFydCwgcHJvcHMuYW5jaG9yRW5kLCBwcm9wcy50YWdTdGFydCwgcHJvcHMudGFnRW5kLCBTQ0FMQVJfU1RZTEVfRE9VQkxFX1FVT1RFRCwgQ0hPTVBJTkdfQ0xJUCwgLTEsIHNpbXBsZSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKGNoID09PSAweDVDLyogXFwgKi8pIHtcbiAgICAgIHNpbXBsZSA9IGZhbHNlXG4gICAgICBjb25zdCBlc2NhcGVkID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuXG4gICAgICBpZiAoaXNFb2woZXNjYXBlZCkpIHtcbiAgICAgICAgcmVhZEZsb3dTY2FsYXJCcmVhayhzdGF0ZSwgbm9kZUluZGVudClcbiAgICAgIH0gZWxzZSBpZiAoaXNTaW1wbGVFc2NhcGUoZXNjYXBlZCkpIHtcbiAgICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGhleExlbmd0aCA9IGVzY2FwZWRIZXhMZW4oZXNjYXBlZClcblxuICAgICAgICBpZiAoaGV4TGVuZ3RoID09PSAwKSB0aHJvd0Vycm9yKHN0YXRlLCAndW5rbm93biBlc2NhcGUgc2VxdWVuY2UnKVxuXG4gICAgICAgIHdoaWxlIChoZXhMZW5ndGgtLSA+IDApIHtcbiAgICAgICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgICAgICAgaWYgKGZyb21IZXhDb2RlKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSA8IDApIHtcbiAgICAgICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdleHBlY3RlZCBoZXhhZGVjaW1hbCBjaGFyYWN0ZXInKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc0VvbChjaCkpIHtcbiAgICAgIHNpbXBsZSA9IGZhbHNlXG4gICAgICByZWFkRmxvd1NjYWxhckJyZWFrKHN0YXRlLCBub2RlSW5kZW50KVxuICAgIH0gZWxzZSBpZiAoc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUpKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndW5leHBlY3RlZCBlbmQgb2YgdGhlIGRvY3VtZW50IHdpdGhpbiBhIGRvdWJsZSBxdW90ZWQgc2NhbGFyJylcbiAgICB9IGVsc2UgaWYgKGNoICE9PSAweDA5LyogVGFiICovICYmIGNoIDwgMHgyMCkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2V4cGVjdGVkIHZhbGlkIEpTT04gY2hhcmFjdGVyJylcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgIH1cbiAgfVxuXG4gIHRocm93RXJyb3Ioc3RhdGUsICd1bmV4cGVjdGVkIGVuZCBvZiB0aGUgc3RyZWFtIHdpdGhpbiBhIGRvdWJsZSBxdW90ZWQgc2NhbGFyJylcbn1cblxuZnVuY3Rpb24gcmVhZEJsb2NrU2NhbGFyIChzdGF0ZTogUGFyc2VyU3RhdGUsIHBhcmVudEluZGVudDogbnVtYmVyLCBwcm9wczogTm9kZVByb3BlcnRpZXMpIHtcbiAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICBsZXQgY2hvbXBpbmc6IENob21waW5nID0gQ0hPTVBJTkdfQ0xJUFxuICBsZXQgaW5kZW50ID0gLTFcbiAgbGV0IGRldGVjdGVkSW5kZW50ID0gZmFsc2VcblxuICBpZiAoY2ggIT09IDB4N0MvKiB8ICovICYmIGNoICE9PSAweDNFLyogPiAqLykgcmV0dXJuIGZhbHNlXG5cbiAgY29uc3Qgc3R5bGUgPSBjaCA9PT0gMHg3Qy8qIHwgKi8gPyBTQ0FMQVJfU1RZTEVfTElURVJBTF9CTE9DSyA6IFNDQUxBUl9TVFlMRV9GT0xERURfQkxPQ0tcbiAgc3RhdGUucG9zaXRpb24rK1xuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCkge1xuICAgIGNvbnN0IGN1cnJlbnQgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICAgIGNvbnN0IGRpZ2l0ID0gZnJvbURlY2ltYWxDb2RlKGN1cnJlbnQpXG5cbiAgICBpZiAoY3VycmVudCA9PT0gMHgyQi8qICsgKi8gfHwgY3VycmVudCA9PT0gMHgyRC8qIC0gKi8pIHtcbiAgICAgIGlmIChjaG9tcGluZyAhPT0gQ0hPTVBJTkdfQ0xJUCkgdGhyb3dFcnJvcihzdGF0ZSwgJ3JlcGVhdCBvZiBhIGNob21waW5nIG1vZGUgaWRlbnRpZmllcicpXG4gICAgICBjaG9tcGluZyA9IGN1cnJlbnQgPT09IDB4MkIvKiArICovID8gQ0hPTVBJTkdfS0VFUCA6IENIT01QSU5HX1NUUklQXG4gICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgfSBlbHNlIGlmIChkaWdpdCA+PSAwKSB7XG4gICAgICBpZiAoZGlnaXQgPT09IDApIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2JhZCBleHBsaWNpdCBpbmRlbnRhdGlvbiB3aWR0aCBvZiBhIGJsb2NrIHNjYWxhcjsgaXQgY2Fubm90IGJlIGxlc3MgdGhhbiBvbmUnKVxuICAgICAgfVxuICAgICAgaWYgKGRldGVjdGVkSW5kZW50KSB0aHJvd0Vycm9yKHN0YXRlLCAncmVwZWF0IG9mIGFuIGluZGVudGF0aW9uIHdpZHRoIGlkZW50aWZpZXInKVxuICAgICAgaW5kZW50ID0gcGFyZW50SW5kZW50ICsgZGlnaXQgLSAxXG4gICAgICBkZXRlY3RlZEluZGVudCA9IHRydWVcbiAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBsZXQgaGFkV2hpdGVzcGFjZSA9IGZhbHNlXG4gIHdoaWxlIChpc1doaXRlU3BhY2Uoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpKSB7XG4gICAgaGFkV2hpdGVzcGFjZSA9IHRydWVcbiAgICBzdGF0ZS5wb3NpdGlvbisrXG4gIH1cbiAgaWYgKGhhZFdoaXRlc3BhY2UgJiYgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MjMvKiAjICovKSBza2lwVW50aWxMaW5lRW5kKHN0YXRlKVxuXG4gIGlmIChpc0VvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSkpIHtcbiAgICBjb25zdW1lTGluZUJyZWFrKHN0YXRlKVxuICB9IGVsc2UgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2EgbGluZSBicmVhayBpcyBleHBlY3RlZCcpXG4gIH1cblxuICBsZXQgY29udGVudEluZGVudCA9IGRldGVjdGVkSW5kZW50ID8gaW5kZW50IDogLTFcbiAgbGV0IG1heExlYWRpbmdJbmRlbnQgPSAwXG4gIGNvbnN0IHZhbHVlU3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICBsZXQgdmFsdWVFbmQgPSBzdGF0ZS5wb3NpdGlvblxuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCkge1xuICAgIGNvbnN0IGxpbmVQb3NpdGlvbiA9IHN0YXRlLnBvc2l0aW9uXG4gICAgbGV0IGNvbHVtbiA9IDBcblxuICAgIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KGxpbmVQb3NpdGlvbiArIGNvbHVtbikgPT09IDB4MjAvKiBTcGFjZSAqLykgY29sdW1uKytcblxuICAgIGNvbnN0IGZpcnN0ID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChsaW5lUG9zaXRpb24gKyBjb2x1bW4pXG4gICAgaWYgKGZpcnN0ID09PSAwKSB7XG4gICAgICAvLyBFbmQgb2YgaW5wdXQgYWN0cyBhcyBhIGxpbmUgdGVybWluYXRvciwgYnV0IHRoZXJlIGlzIG5vIGxpbmUgYnJlYWsgdG9cbiAgICAgIC8vIGluY2x1ZGUgaGVyZS4gQSBmaW5hbCBhbGwtc3BhY2VzIGxpbmUgc3RpbGwgY291bnRzOiB3aGVuIHRoZSBibG9jayBoYXMgYVxuICAgICAgLy8gY29udGVudCBpbmRlbnQsIHRoZSBzcGFjZXMgYmV5b25kIGl0IGFyZSByZWFsIGNvbnRlbnQ7IGluIGEgd2hvbGx5IGJsYW5rXG4gICAgICAvLyBibG9jayAoY29udGVudEluZGVudCA8IDApIHRoZSBzcGFjZXMgZm9ybSBhIGJsYW5rIGxpbmUgdGhhdCBjaG9tcGluZyBtdXN0XG4gICAgICAvLyBzZWUsIGV4YWN0bHkgYXMgaXQgd291bGQgaWYgdGhlIGxpbmUgZW5kZWQgd2l0aCBhIGJyZWFrLiBDYXB0dXJlIHRoZSBsaW5lXG4gICAgICAvLyBpbiBib3RoIGNhc2VzOyBvdGhlcndpc2UgdGhlIGJsb2NrIGVuZHMgYXQgdGhlIHN0YXJ0IG9mIHRoaXMgZW1wdHkgbGluZS5cbiAgICAgIGlmIChjb250ZW50SW5kZW50ID49IDApIHtcbiAgICAgICAgaWYgKGNvbHVtbiA+IGNvbnRlbnRJbmRlbnQpIHZhbHVlRW5kID0gbGluZVBvc2l0aW9uICsgY29sdW1uXG4gICAgICB9IGVsc2UgaWYgKGNvbHVtbiA+IDApIHtcbiAgICAgICAgdmFsdWVFbmQgPSBsaW5lUG9zaXRpb24gKyBjb2x1bW5cbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgfVxuICAgIGlmIChsaW5lUG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUsIGxpbmVQb3NpdGlvbikpIGJyZWFrXG5cbiAgICBpZiAoIWRldGVjdGVkSW5kZW50ICYmIGNvbnRlbnRJbmRlbnQgPT09IC0xICYmIGlzRW9sKGZpcnN0KSkge1xuICAgICAgbWF4TGVhZGluZ0luZGVudCA9IE1hdGgubWF4KG1heExlYWRpbmdJbmRlbnQsIGNvbHVtbilcbiAgICB9XG5cbiAgICBpZiAoIWRldGVjdGVkSW5kZW50ICYmIGNvbnRlbnRJbmRlbnQgPT09IC0xICYmICFpc0VvbChmaXJzdCkpIHtcbiAgICAgIGlmIChmaXJzdCA9PT0gMHgwOS8qIFRhYiAqLyAmJiBjb2x1bW4gPCBwYXJlbnRJbmRlbnQpIHtcbiAgICAgICAgc3RhdGUucG9zaXRpb24gPSBsaW5lUG9zaXRpb24gKyBjb2x1bW5cbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RhYiBjaGFyYWN0ZXJzIG11c3Qgbm90IGJlIHVzZWQgaW4gaW5kZW50YXRpb24nKVxuICAgICAgfVxuICAgICAgaWYgKGNvbHVtbiA8IG1heExlYWRpbmdJbmRlbnQpIHtcbiAgICAgICAgc3RhdGUucG9zaXRpb24gPSBsaW5lUG9zaXRpb24gKyBjb2x1bW5cbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2JhZCBpbmRlbnRhdGlvbiBvZiBhIG1hcHBpbmcgZW50cnknKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb250ZW50SW5kZW50ID09PSAtMSAmJiBmaXJzdCAhPT0gMCAmJiAhaXNFb2woZmlyc3QpICYmIGNvbHVtbiA8IHBhcmVudEluZGVudCkge1xuICAgICAgc3RhdGUubGluZUluZGVudCA9IGNvbHVtblxuICAgICAgc3RhdGUucG9zaXRpb24gPSBsaW5lUG9zaXRpb24gKyBjb2x1bW5cbiAgICAgIGJyZWFrXG4gICAgfVxuXG4gICAgaWYgKCFkZXRlY3RlZEluZGVudCAmJiBmaXJzdCAhPT0gMCAmJiAhaXNFb2woZmlyc3QpICYmIGNvbnRlbnRJbmRlbnQgPT09IC0xKSB7XG4gICAgICBjb250ZW50SW5kZW50ID0gY29sdW1uXG4gICAgfVxuXG4gICAgY29uc3QgcmVxdWlyZWRJbmRlbnQgPSBjb250ZW50SW5kZW50ID09PSAtMSA/IHBhcmVudEluZGVudCArIDEgOiBjb250ZW50SW5kZW50XG4gICAgaWYgKGZpcnN0ICE9PSAwICYmICFpc0VvbChmaXJzdCkgJiYgY29sdW1uIDwgcmVxdWlyZWRJbmRlbnQpIHtcbiAgICAgIHN0YXRlLmxpbmVJbmRlbnQgPSBjb2x1bW5cbiAgICAgIHN0YXRlLnBvc2l0aW9uID0gbGluZVBvc2l0aW9uICsgY29sdW1uXG4gICAgICBicmVha1xuICAgIH1cblxuICAgIHNraXBVbnRpbExpbmVFbmQoc3RhdGUpXG4gICAgdmFsdWVFbmQgPSBzdGF0ZS5wb3NpdGlvblxuICAgIGlmIChpc0VvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSkpIHtcbiAgICAgIGNvbnN1bWVMaW5lQnJlYWsoc3RhdGUpXG4gICAgICAvLyBJbmNsdWRlIHRoZSBsaW5lIGJyZWFrIGluIHRoZSByYW5nZSBzbyB0cmFpbGluZyBibGFuayBsaW5lcyBhcmVcbiAgICAgIC8vIHByZXNlcnZlZC4gVGhpcyBpcyB3aGF0IGxldHMgY29vayB0ZWxsIGFwYXJ0IGFuIGVtcHR5IGB8K2AgKHJhbmdlIFwiXCIsXG4gICAgICAvLyB2YWx1ZSBcIlwiKSBmcm9tIGEgYHwrYCB3aXRoIG9uZSBibGFuayBsaW5lIChyYW5nZSBcIlxcblwiLCB2YWx1ZSBcIlxcblwiKS5cbiAgICAgIC8vIERlLWluZGVudCBhbmQgY2hvbXBpbmcgYXJlIGFwcGxpZWQgbGF0ZXIgaW4gZ2V0U2NhbGFyVmFsdWUuXG4gICAgICB2YWx1ZUVuZCA9IHN0YXRlLnBvc2l0aW9uXG4gICAgfVxuICB9XG5cbiAgY2hlY2tQcmludGFibGUoc3RhdGUsIHZhbHVlU3RhcnQsIHZhbHVlRW5kKVxuICBhZGRTY2FsYXJFdmVudChcbiAgICBzdGF0ZSxcbiAgICB2YWx1ZVN0YXJ0LFxuICAgIHZhbHVlRW5kLFxuICAgIHByb3BzLmFuY2hvclN0YXJ0LFxuICAgIHByb3BzLmFuY2hvckVuZCxcbiAgICBwcm9wcy50YWdTdGFydCxcbiAgICBwcm9wcy50YWdFbmQsXG4gICAgc3R5bGUsXG4gICAgY2hvbXBpbmcsXG4gICAgY29udGVudEluZGVudFxuICApXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIGNhblN0YXJ0UGxhaW5TY2FsYXIgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgbm9kZUNvbnRleHQ6IE5vZGVDb250ZXh0KSB7XG4gIGNvbnN0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcbiAgY29uc3QgaW5GbG93ID0gbm9kZUNvbnRleHQgPT09IENPTlRFWFRfRkxPV19JTlxuXG4gIGlmIChjaCA9PT0gMCB8fFxuICAgICAgaXNXc09yRW9sKGNoKSB8fFxuICAgICAgY2ggPT09IDB4MjMvKiAjICovIHx8XG4gICAgICBjaCA9PT0gMHgyNi8qICYgKi8gfHxcbiAgICAgIGNoID09PSAweDJBLyogKiAqLyB8fFxuICAgICAgY2ggPT09IDB4MjEvKiAhICovIHx8XG4gICAgICBjaCA9PT0gMHg3Qy8qIHwgKi8gfHxcbiAgICAgIGNoID09PSAweDNFLyogPiAqLyB8fFxuICAgICAgY2ggPT09IDB4MjcvKiAnICovIHx8XG4gICAgICBjaCA9PT0gMHgyMi8qIFwiICovIHx8XG4gICAgICBjaCA9PT0gMHgyNS8qICUgKi8gfHxcbiAgICAgIGNoID09PSAweDQwLyogQCAqLyB8fFxuICAgICAgY2ggPT09IDB4NjAvKiBgICovIHx8XG4gICAgICAoaW5GbG93ICYmIGlzRmxvd0luZGljYXRvcihjaCkpKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoY2ggPT09IDB4M0YvKiA/ICovIHx8IGNoID09PSAweDJELyogLSAqLykge1xuICAgIGNvbnN0IGZvbGxvd2luZyA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKVxuICAgIGlmIChpc1dzT3JFb2xPckVuZChmb2xsb3dpbmcpIHx8IChpbkZsb3cgJiYgaXNGbG93SW5kaWNhdG9yKGZvbGxvd2luZykpKSByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHJlYWRQbGFpblNjYWxhciAoc3RhdGU6IFBhcnNlclN0YXRlLCBub2RlSW5kZW50OiBudW1iZXIsIG5vZGVDb250ZXh0OiBOb2RlQ29udGV4dCwgcHJvcHM6IE5vZGVQcm9wZXJ0aWVzKSB7XG4gIGlmICghY2FuU3RhcnRQbGFpblNjYWxhcihzdGF0ZSwgbm9kZUNvbnRleHQpKSByZXR1cm4gZmFsc2VcblxuICBjb25zdCBzdGFydCA9IHN0YXRlLnBvc2l0aW9uXG4gIGxldCBlbmQgPSBzdGF0ZS5wb3NpdGlvblxuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICBjb25zdCBpbkZsb3cgPSBub2RlQ29udGV4dCA9PT0gQ09OVEVYVF9GTE9XX0lOXG4gIC8vIEEgc2luZ2xlLWxpbmUgcGxhaW4gc2NhbGFyIGlzIHNsaWNlYWJsZSB2ZXJiYXRpbTogdGhlIHBhcnNlciBhbHJlYWR5IHRyaW1zXG4gIC8vIHRyYWlsaW5nIHdoaXRlc3BhY2UgZnJvbSB0aGUgcmFuZ2UsIHNvIG5vIGZvbGRpbmcgaXMgbmVlZGVkIChzZWVcbiAgLy8gZ2V0U2NhbGFyVmFsdWUgZmFzdCBwYXRoKS4gRm9sZGVkIGxpbmUgYnJlYWtzIG1ha2UgaXQgbm9uLXNpbXBsZS5cbiAgbGV0IG11bHRpbGluZSA9IGZhbHNlXG5cbiAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgaWYgKHN0YXRlLnBvc2l0aW9uID09PSBzdGF0ZS5saW5lU3RhcnQgJiYgdGVzdERvY3VtZW50U2VwYXJhdG9yKHN0YXRlKSkgYnJlYWtcblxuICAgIGlmIChjaCA9PT0gMHgzQS8qIDogKi8pIHtcbiAgICAgIGNvbnN0IGZvbGxvd2luZyA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKVxuICAgICAgaWYgKGlzV3NPckVvbE9yRW5kKGZvbGxvd2luZykgfHwgKGluRmxvdyAmJiBpc0Zsb3dJbmRpY2F0b3IoZm9sbG93aW5nKSkpIGJyZWFrXG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHgyMy8qICMgKi8pIHtcbiAgICAgIGNvbnN0IHByZWNlZGluZyA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gLSAxKVxuICAgICAgaWYgKGlzV3NPckVvbChwcmVjZWRpbmcpKSBicmVha1xuICAgIH0gZWxzZSBpZiAoaW5GbG93ICYmIGlzRmxvd0luZGljYXRvcihjaCkpIHtcbiAgICAgIGJyZWFrXG4gICAgfSBlbHNlIGlmIChpc0VvbChjaCkpIHtcbiAgICAgIGNvbnN0IHNhdmVkUG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvblxuICAgICAgY29uc3Qgc2F2ZWRMaW5lID0gc3RhdGUubGluZVxuICAgICAgY29uc3Qgc2F2ZWRMaW5lU3RhcnQgPSBzdGF0ZS5saW5lU3RhcnRcbiAgICAgIGNvbnN0IHNhdmVkTGluZUluZGVudCA9IHN0YXRlLmxpbmVJbmRlbnRcblxuICAgICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgZmFsc2UpXG5cbiAgICAgIGlmIChzdGF0ZS5saW5lSW5kZW50ID49IG5vZGVJbmRlbnQpIHtcbiAgICAgICAgbXVsdGlsaW5lID0gdHJ1ZVxuICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHN0YXRlLnBvc2l0aW9uID0gc2F2ZWRQb3NpdGlvblxuICAgICAgc3RhdGUubGluZSA9IHNhdmVkTGluZVxuICAgICAgc3RhdGUubGluZVN0YXJ0ID0gc2F2ZWRMaW5lU3RhcnRcbiAgICAgIHN0YXRlLmxpbmVJbmRlbnQgPSBzYXZlZExpbmVJbmRlbnRcbiAgICAgIGJyZWFrXG4gICAgfVxuXG4gICAgaWYgKCFpc1doaXRlU3BhY2UoY2gpKSBlbmQgPSBzdGF0ZS5wb3NpdGlvbiArIDFcbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgfVxuXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm4gZmFsc2VcblxuICBjaGVja1ByaW50YWJsZShzdGF0ZSwgc3RhcnQsIGVuZClcbiAgYWRkU2NhbGFyRXZlbnQoc3RhdGUsIHN0YXJ0LCBlbmQsIHByb3BzLmFuY2hvclN0YXJ0LCBwcm9wcy5hbmNob3JFbmQsIHByb3BzLnRhZ1N0YXJ0LCBwcm9wcy50YWdFbmQsIFNDQUxBUl9TVFlMRV9QTEFJTiwgQ0hPTVBJTkdfQ0xJUCwgLTEsICFtdWx0aWxpbmUpXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIGZpbmRCbG9ja01hcHBpbmdDb2xvbiAoc3RhdGU6IFBhcnNlclN0YXRlKSB7XG4gIGxldCBwb3NpdGlvbiA9IHN0YXRlLnBvc2l0aW9uXG4gIGxldCBmbG93TGV2ZWwgPSAwXG5cbiAgd2hpbGUgKHBvc2l0aW9uIDwgc3RhdGUubGVuZ3RoKSB7XG4gICAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKVxuXG4gICAgaWYgKGlzRW9sKGNoKSkgcmV0dXJuIC0xXG4gICAgaWYgKGNoID09PSAweDIzLyogIyAqLyAmJiBpc1dzT3JFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbiAtIDEpKSkgcmV0dXJuIC0xXG5cbiAgICBpZiAoKGNoID09PSAweDJBLyogKiAqLyB8fCBjaCA9PT0gMHgyNi8qICYgKi8pICYmIHBvc2l0aW9uID09PSBzdGF0ZS5wb3NpdGlvbikge1xuICAgICAgZG8geyBwb3NpdGlvbisrIH1cbiAgICAgIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSAhPT0gMCAmJlxuICAgICAgICAgICAgICFpc1dzT3JFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbikpICYmXG4gICAgICAgICAgICAgIWlzRmxvd0luZGljYXRvcihzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSkpXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIGlmIChjaCA9PT0gMHg1Qi8qIFsgKi8gfHwgY2ggPT09IDB4N0IvKiB7ICovKSB7XG4gICAgICBmbG93TGV2ZWwrK1xuICAgIH0gZWxzZSBpZiAoY2ggPT09IDB4NUQvKiBdICovIHx8IGNoID09PSAweDdELyogfSAqLykge1xuICAgICAgaWYgKGZsb3dMZXZlbCA+IDApIGZsb3dMZXZlbC0tXG4gICAgfSBlbHNlIGlmIChmbG93TGV2ZWwgPT09IDAgJiYgY2ggPT09IDB4M0EvKiA6ICovICYmIGlzV3NPckVvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uICsgMSkpKSB7XG4gICAgICByZXR1cm4gcG9zaXRpb25cbiAgICB9XG5cbiAgICBpZiAoKGZsb3dMZXZlbCA+IDAgfHwgcG9zaXRpb24gPT09IHN0YXRlLnBvc2l0aW9uKSAmJlxuICAgICAgICAoY2ggPT09IDB4MjcvKiAnICovIHx8IGNoID09PSAweDIyLyogXCIgKi8pKSB7XG4gICAgICBjb25zdCBxdW90ZSA9IGNoXG4gICAgICBwb3NpdGlvbisrXG5cbiAgICAgIHdoaWxlIChwb3NpdGlvbiA8IHN0YXRlLmxlbmd0aCAmJiBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSAhPT0gcXVvdGUpIHtcbiAgICAgICAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pID09PSAweDVDLyogXFwgKi8gJiYgcXVvdGUgPT09IDB4MjIvKiBcIiAqLykgcG9zaXRpb24rK1xuICAgICAgICBwb3NpdGlvbisrXG4gICAgICB9XG4gICAgfVxuXG4gICAgcG9zaXRpb24rK1xuICB9XG5cbiAgcmV0dXJuIC0xXG59XG5cbmZ1bmN0aW9uIHNraXBGbG93U2VwYXJhdGlvblNwYWNlIChzdGF0ZTogUGFyc2VyU3RhdGUsIG5vZGVJbmRlbnQ6IG51bWJlcikge1xuICBjb25zdCBzdGFydExpbmUgPSBzdGF0ZS5saW5lXG4gIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUpXG5cbiAgaWYgKChzdGF0ZS5saW5lID4gc3RhcnRMaW5lICYmIHN0YXRlLmxpbmVJbmRlbnQgPCBub2RlSW5kZW50KSB8fFxuICAgICAgKHN0YXRlLmZpcnN0VGFiSW5MaW5lICE9PSAtMSAmJiBzdGF0ZS5saW5lSW5kZW50IDwgbm9kZUluZGVudCkpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZGVmaWNpZW50IGluZGVudGF0aW9uJylcbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkRmxvd0NvbGxlY3Rpb24gKHN0YXRlOiBQYXJzZXJTdGF0ZSwgbm9kZUluZGVudDogbnVtYmVyLCBwcm9wczogTm9kZVByb3BlcnRpZXMpIHtcbiAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICBjb25zdCBpc01hcHBpbmcgPSBjaCA9PT0gMHg3Qi8qIHsgKi9cbiAgY29uc3Qgc3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICBsZXQgcmVhZE5leHQgPSB0cnVlXG5cbiAgaWYgKGNoICE9PSAweDVCLyogWyAqLyAmJiBjaCAhPT0gMHg3Qi8qIHsgKi8pIHJldHVybiBmYWxzZVxuXG4gIGNvbnN0IHRlcm1pbmF0b3IgPSBpc01hcHBpbmcgPyAweDdELyogfSAqLyA6IDB4NUQvKiBdICovXG5cbiAgaWYgKGlzTWFwcGluZykge1xuICAgIGFkZE1hcHBpbmdFdmVudChzdGF0ZSwgc3RhcnQsIHByb3BzLmFuY2hvclN0YXJ0LCBwcm9wcy5hbmNob3JFbmQsIHByb3BzLnRhZ1N0YXJ0LCBwcm9wcy50YWdFbmQsIENPTExFQ1RJT05fU1RZTEVfRkxPVylcbiAgfSBlbHNlIHtcbiAgICBhZGRTZXF1ZW5jZUV2ZW50KHN0YXRlLCBzdGFydCwgcHJvcHMuYW5jaG9yU3RhcnQsIHByb3BzLmFuY2hvckVuZCwgcHJvcHMudGFnU3RhcnQsIHByb3BzLnRhZ0VuZCwgQ09MTEVDVElPTl9TVFlMRV9GTE9XKVxuICB9XG5cbiAgc3RhdGUucG9zaXRpb24rK1xuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCkge1xuICAgIHNraXBGbG93U2VwYXJhdGlvblNwYWNlKHN0YXRlLCBub2RlSW5kZW50KVxuXG4gICAgbGV0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIGlmIChjaCA9PT0gdGVybWluYXRvcikge1xuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgYWRkUG9wRXZlbnQoc3RhdGUpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSBpZiAoIXJlYWROZXh0KSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnbWlzc2VkIGNvbW1hIGJldHdlZW4gZmxvdyBjb2xsZWN0aW9uIGVudHJpZXMnKVxuICAgIH0gZWxzZSBpZiAoY2ggPT09IDB4MkMvKiAsICovKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCBcImV4cGVjdGVkIHRoZSBub2RlIGNvbnRlbnQsIGJ1dCBmb3VuZCAnLCdcIilcbiAgICB9XG5cbiAgICBsZXQgaXNQYWlyID0gZmFsc2VcbiAgICBsZXQgaXNFeHBsaWNpdFBhaXIgPSBmYWxzZVxuXG4gICAgaWYgKGNoID09PSAweDNGLyogPyAqLyAmJiBpc1dzT3JFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpKSkge1xuICAgICAgaXNQYWlyID0gaXNFeHBsaWNpdFBhaXIgPSB0cnVlXG4gICAgICBzdGF0ZS5wb3NpdGlvbiArPSAxXG4gICAgICBza2lwRmxvd1NlcGFyYXRpb25TcGFjZShzdGF0ZSwgbm9kZUluZGVudClcbiAgICB9XG5cbiAgICBjb25zdCBlbnRyeUxpbmUgPSBzdGF0ZS5saW5lXG4gICAgY29uc3QgZW50cnlTdGFydCA9IHNuYXBzaG90U3RhdGUoc3RhdGUpXG5cbiAgICBjb25zdCBrZXlXYXNSZWFkID0gcGFyc2VOb2RlKHN0YXRlLCBub2RlSW5kZW50LCBDT05URVhUX0ZMT1dfSU4sIGZhbHNlLCB0cnVlKVxuICAgIHNraXBGbG93U2VwYXJhdGlvblNwYWNlKHN0YXRlLCBub2RlSW5kZW50KVxuXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgaWYgKChpc01hcHBpbmcgfHwgaXNFeHBsaWNpdFBhaXIgfHwgc3RhdGUubGluZSA9PT0gZW50cnlMaW5lKSAmJiBjaCA9PT0gMHgzQS8qIDogKi8pIHtcbiAgICAgIGlzUGFpciA9IHRydWVcbiAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgIHNraXBGbG93U2VwYXJhdGlvblNwYWNlKHN0YXRlLCBub2RlSW5kZW50KVxuICAgICAgaWYgKCFpc01hcHBpbmcpIHtcbiAgICAgICAgcmVzdG9yZVN0YXRlKHN0YXRlLCBlbnRyeVN0YXJ0KVxuICAgICAgICBhZGRNYXBwaW5nRXZlbnQoc3RhdGUsIGVudHJ5U3RhcnQucG9zaXRpb24sIE5PX1JBTkdFLCBOT19SQU5HRSwgTk9fUkFOR0UsIE5PX1JBTkdFLCBDT0xMRUNUSU9OX1NUWUxFX0ZMT1cpXG4gICAgICAgIGlmICghcGFyc2VOb2RlKHN0YXRlLCBub2RlSW5kZW50LCBDT05URVhUX0ZMT1dfSU4sIGZhbHNlLCB0cnVlKSkge1xuICAgICAgICAgIGFkZEVtcHR5U2NhbGFyRXZlbnQoc3RhdGUpXG4gICAgICAgIH1cbiAgICAgICAgc2tpcEZsb3dTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIG5vZGVJbmRlbnQpXG4gICAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgICAgc2tpcEZsb3dTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIG5vZGVJbmRlbnQpXG4gICAgICB9IGVsc2UgaWYgKCFrZXlXYXNSZWFkKSB7XG4gICAgICAgIGFkZEVtcHR5U2NhbGFyRXZlbnQoc3RhdGUpXG4gICAgICB9XG4gICAgICBpZiAoIXBhcnNlTm9kZShzdGF0ZSwgbm9kZUluZGVudCwgQ09OVEVYVF9GTE9XX0lOLCBmYWxzZSwgdHJ1ZSkpIHtcbiAgICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICAgIH1cbiAgICAgIHNraXBGbG93U2VwYXJhdGlvblNwYWNlKHN0YXRlLCBub2RlSW5kZW50KVxuICAgICAgaWYgKCFpc01hcHBpbmcpIGFkZFBvcEV2ZW50KHN0YXRlKVxuICAgIH0gZWxzZSBpZiAoaXNNYXBwaW5nICYmIGlzUGFpcikge1xuICAgICAgaWYgKCFrZXlXYXNSZWFkKSBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICB9IGVsc2UgaWYgKGlzTWFwcGluZykge1xuICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICB9IGVsc2UgaWYgKGlzUGFpcikge1xuICAgICAgcmVzdG9yZVN0YXRlKHN0YXRlLCBlbnRyeVN0YXJ0KVxuICAgICAgYWRkTWFwcGluZ0V2ZW50KHN0YXRlLCBlbnRyeVN0YXJ0LnBvc2l0aW9uLCBOT19SQU5HRSwgTk9fUkFOR0UsIE5PX1JBTkdFLCBOT19SQU5HRSwgQ09MTEVDVElPTl9TVFlMRV9GTE9XKVxuICAgICAgcGFyc2VOb2RlKHN0YXRlLCBub2RlSW5kZW50LCBDT05URVhUX0ZMT1dfSU4sIGZhbHNlLCB0cnVlKVxuICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICAgIGFkZFBvcEV2ZW50KHN0YXRlKVxuICAgIH1cblxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIGlmIChjaCA9PT0gMHgyQy8qICwgKi8pIHtcbiAgICAgIHJlYWROZXh0ID0gdHJ1ZVxuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgIH0gZWxzZSB7XG4gICAgICByZWFkTmV4dCA9IGZhbHNlXG4gICAgfVxuICB9XG5cbiAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuZXhwZWN0ZWQgZW5kIG9mIHRoZSBzdHJlYW0gd2l0aGluIGEgZmxvdyBjb2xsZWN0aW9uJylcbn1cblxuZnVuY3Rpb24gcmVhZEJsb2NrU2VxdWVuY2UgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgbm9kZUluZGVudDogbnVtYmVyLCBwcm9wczogTm9kZVByb3BlcnRpZXMpIHtcbiAgaWYgKHN0YXRlLmZpcnN0VGFiSW5MaW5lICE9PSAtMSB8fCBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMHgyRC8qIC0gKi8gfHwgIWlzV3NPckVvbE9yRW5kKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKSkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGFkZFNlcXVlbmNlRXZlbnQoc3RhdGUsIHN0YXRlLnBvc2l0aW9uLCBwcm9wcy5hbmNob3JTdGFydCwgcHJvcHMuYW5jaG9yRW5kLCBwcm9wcy50YWdTdGFydCwgcHJvcHMudGFnRW5kLCBDT0xMRUNUSU9OX1NUWUxFX0JMT0NLKVxuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gMHgyRC8qIC0gKi8gJiYgaXNXc09yRW9sT3JFbmQoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpKSkge1xuICAgIGlmIChzdGF0ZS5maXJzdFRhYkluTGluZSAhPT0gLTEpIHtcbiAgICAgIHN0YXRlLnBvc2l0aW9uID0gc3RhdGUuZmlyc3RUYWJJbkxpbmVcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd0YWIgY2hhcmFjdGVycyBtdXN0IG5vdCBiZSB1c2VkIGluIGluZGVudGF0aW9uJylcbiAgICB9XG5cbiAgICBjb25zdCBlbnRyeUxpbmUgPSBzdGF0ZS5saW5lXG4gICAgc3RhdGUucG9zaXRpb24rK1xuXG4gICAgY29uc3QgaGFkQnJlYWsgPSBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKSA+IDBcbiAgICBpZiAoc3RhdGUuZmlyc3RUYWJJbkxpbmUgIT09IC0xICYmXG4gICAgICAgIHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAweDJELyogLSAqLyAmJlxuICAgICAgICBpc1dzT3JFb2xPckVuZChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSkpKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnYmFkIGluZGVudGF0aW9uIG9mIGEgc2VxdWVuY2UgZW50cnknKVxuICAgIH1cblxuICAgIGlmIChoYWRCcmVhayAmJiBzdGF0ZS5saW5lSW5kZW50IDw9IG5vZGVJbmRlbnQpIHtcbiAgICAgIGFkZEVtcHR5U2NhbGFyRXZlbnQoc3RhdGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnNlTm9kZShzdGF0ZSwgbm9kZUluZGVudCwgQ09OVEVYVF9CTE9DS19JTiwgZmFsc2UsIHRydWUpXG4gICAgfVxuXG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSlcblxuICAgIGlmIChzdGF0ZS5saW5lSW5kZW50IDwgbm9kZUluZGVudCB8fCBzdGF0ZS5wb3NpdGlvbiA+PSBzdGF0ZS5sZW5ndGgpIGJyZWFrXG4gICAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPiBub2RlSW5kZW50KSB0aHJvd0Vycm9yKHN0YXRlLCAnYmFkIGluZGVudGF0aW9uIG9mIGEgc2VxdWVuY2UgZW50cnknKVxuICAgIGlmIChzdGF0ZS5saW5lID09PSBlbnRyeUxpbmUgJiZcbiAgICAgICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MkQvKiAtICovICYmXG4gICAgICAgIGlzV3NPckVvbE9yRW5kKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdiYWQgaW5kZW50YXRpb24gb2YgYSBzZXF1ZW5jZSBlbnRyeScpXG4gICAgfVxuICB9XG5cbiAgYWRkUG9wRXZlbnQoc3RhdGUpXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHJlYWRCbG9ja01hcHBpbmcgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgbm9kZUluZGVudDogbnVtYmVyLCBmbG93SW5kZW50OiBudW1iZXIsIHByb3BzOiBOb2RlUHJvcGVydGllcykge1xuICBsZXQgYXRFeHBsaWNpdEtleSA9IGZhbHNlXG4gIGxldCBkZXRlY3RlZCA9IGZhbHNlXG4gIGxldCBtYXBwaW5nT3BlbmVkID0gZmFsc2VcbiAgbGV0IHBlbmRpbmdFeHBsaWNpdEtleSA9IGZhbHNlXG5cbiAgaWYgKHN0YXRlLmZpcnN0VGFiSW5MaW5lICE9PSAtMSkgcmV0dXJuIGZhbHNlXG5cbiAgbGV0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICBpZiAoIWF0RXhwbGljaXRLZXkgJiYgc3RhdGUuZmlyc3RUYWJJbkxpbmUgIT09IC0xKSB7XG4gICAgICBzdGF0ZS5wb3NpdGlvbiA9IHN0YXRlLmZpcnN0VGFiSW5MaW5lXG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndGFiIGNoYXJhY3RlcnMgbXVzdCBub3QgYmUgdXNlZCBpbiBpbmRlbnRhdGlvbicpXG4gICAgfVxuXG4gICAgY29uc3QgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpXG4gICAgY29uc3QgZW50cnlMaW5lID0gc3RhdGUubGluZVxuXG4gICAgaWYgKChjaCA9PT0gMHgzRi8qID8gKi8gfHwgY2ggPT09IDB4M0EvKiA6ICovKSAmJiBpc1dzT3JFb2xPckVuZChmb2xsb3dpbmcpKSB7XG4gICAgICBpZiAoIW1hcHBpbmdPcGVuZWQpIHtcbiAgICAgICAgYWRkTWFwcGluZ0V2ZW50KHN0YXRlLCBzdGF0ZS5wb3NpdGlvbiwgcHJvcHMuYW5jaG9yU3RhcnQsIHByb3BzLmFuY2hvckVuZCwgcHJvcHMudGFnU3RhcnQsIHByb3BzLnRhZ0VuZCwgQ09MTEVDVElPTl9TVFlMRV9CTE9DSylcbiAgICAgICAgbWFwcGluZ09wZW5lZCA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKGNoID09PSAweDNGLyogPyAqLykge1xuICAgICAgICBpZiAoYXRFeHBsaWNpdEtleSkgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICAgICAgZGV0ZWN0ZWQgPSB0cnVlXG4gICAgICAgIGF0RXhwbGljaXRLZXkgPSB0cnVlXG4gICAgICB9IGVsc2UgaWYgKGF0RXhwbGljaXRLZXkpIHtcbiAgICAgICAgYXRFeHBsaWNpdEtleSA9IGZhbHNlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICAgICAgICBkZXRlY3RlZCA9IHRydWVcbiAgICAgICAgYXRFeHBsaWNpdEtleSA9IGZhbHNlXG4gICAgICB9XG5cbiAgICAgIHN0YXRlLnBvc2l0aW9uICs9IDFcbiAgICAgIHBlbmRpbmdFeHBsaWNpdEtleSA9IHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQW4gZXhwbGljaXQga2V5IGF3YWl0aW5nIGl0cyB2YWx1ZSwgZm9sbG93ZWQgYnkgYW4gaW1wbGljaXQga2V5LCBtZWFuc1xuICAgICAgLy8gdGhlIGV4cGxpY2l0IGtleSdzIHZhbHVlIGlzIGVtcHR5LiBFbWl0IGl0IG5vdyAoYXBwZW5kLW9ubHkpIHNvIGl0IGlzXG4gICAgICAvLyBvcmRlcmVkIGJlZm9yZSB0aGUgaW1wbGljaXQga2V5IG5vZGUgcmVhZCBqdXN0IGJlbG93LlxuICAgICAgaWYgKGF0RXhwbGljaXRLZXkpIHtcbiAgICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICAgICAgYXRFeHBsaWNpdEtleSA9IGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGJlZm9yZUtleSA9IHNuYXBzaG90U3RhdGUoc3RhdGUpXG5cbiAgICAgIGlmICghcGFyc2VOb2RlKHN0YXRlLCBmbG93SW5kZW50LCBDT05URVhUX0ZMT1dfT1VULCBmYWxzZSwgdHJ1ZSkpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlLmxpbmUgPT09IGVudHJ5TGluZSkge1xuICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgICAgICAgd2hpbGUgKGlzV2hpdGVTcGFjZShjaCkpIHtcbiAgICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaCA9PT0gMHgzQS8qIDogKi8pIHtcbiAgICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcblxuICAgICAgICAgIGlmICghaXNXc09yRW9sT3JFbmQoY2gpKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnYSB3aGl0ZXNwYWNlIGNoYXJhY3RlciBpcyBleHBlY3RlZCBhZnRlciB0aGUga2V5LXZhbHVlIHNlcGFyYXRvciB3aXRoaW4gYSBibG9jayBtYXBwaW5nJylcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIW1hcHBpbmdPcGVuZWQpIHtcbiAgICAgICAgICAgIHJlc3RvcmVTdGF0ZShzdGF0ZSwgYmVmb3JlS2V5KVxuICAgICAgICAgICAgYWRkTWFwcGluZ0V2ZW50KHN0YXRlLCBiZWZvcmVLZXkucG9zaXRpb24sIHByb3BzLmFuY2hvclN0YXJ0LCBwcm9wcy5hbmNob3JFbmQsIHByb3BzLnRhZ1N0YXJ0LCBwcm9wcy50YWdFbmQsIENPTExFQ1RJT05fU1RZTEVfQkxPQ0spXG4gICAgICAgICAgICBtYXBwaW5nT3BlbmVkID0gdHJ1ZVxuICAgICAgICAgICAgLy8gVGhlIGtleSwgdGhlIGA6YCBhbmQgdGhlIHNwYWNlIGFmdGVyIGl0IHdlcmUgYWxyZWFkeSB2YWxpZGF0ZWRcbiAgICAgICAgICAgIC8vIGFib3ZlLCBiZWZvcmUgdGhlIHJvbGxiYWNrLiBSZS1yZWFkaW5nIHRoZSBzYW1lIGlucHV0IGNhbm5vdFxuICAgICAgICAgICAgLy8gZmFpbCwgc28ganVzdCBjb25zdW1lIGl0IGFnYWluIHdpdGhvdXQgZXJyb3IgY2hlY2tzLlxuICAgICAgICAgICAgcGFyc2VOb2RlKHN0YXRlLCBmbG93SW5kZW50LCBDT05URVhUX0ZMT1dfT1VULCBmYWxzZSwgdHJ1ZSlcblxuICAgICAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICAgICAgICAgICAgd2hpbGUgKGlzV2hpdGVTcGFjZShjaCkpIHtcbiAgICAgICAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkZXRlY3RlZCA9IHRydWVcbiAgICAgICAgICBhdEV4cGxpY2l0S2V5ID0gZmFsc2VcbiAgICAgICAgICBwZW5kaW5nRXhwbGljaXRLZXkgPSBmYWxzZVxuICAgICAgICB9IGVsc2UgaWYgKGRldGVjdGVkKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJleHBlY3RlZCAnOicgYWZ0ZXIgYSBtYXBwaW5nIGtleVwiKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE5vdCBhIG1hcHBpbmcuIElmIG91dGVyIHByb3BlcnRpZXMgYXJlIHBlbmRpbmcsIHJvbGwgYmFjayBzbyB0aGVcbiAgICAgICAgICAvLyBjYWxsZXIgcmUtcmVhZHMgdGhpcyBub2RlIHdpdGggdGhlbSBhdHRhY2hlZCAoZXZlbnRzIGFyZSBhcHBlbmQtb25seSkuXG4gICAgICAgICAgaWYgKHByb3BzLmFuY2hvclN0YXJ0ICE9PSBOT19SQU5HRSB8fCBwcm9wcy50YWdTdGFydCAhPT0gTk9fUkFOR0UpIHtcbiAgICAgICAgICAgIHJlc3RvcmVTdGF0ZShzdGF0ZSwgYmVmb3JlS2V5KVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZGV0ZWN0ZWQpIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2NhbiBub3QgcmVhZCBhIGJsb2NrIG1hcHBpbmcgZW50cnk7IGEgbXVsdGlsaW5lIGtleSBtYXkgbm90IGJlIGFuIGltcGxpY2l0IGtleScpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocHJvcHMuYW5jaG9yU3RhcnQgIT09IE5PX1JBTkdFIHx8IHByb3BzLnRhZ1N0YXJ0ICE9PSBOT19SQU5HRSkge1xuICAgICAgICAgIHJlc3RvcmVTdGF0ZShzdGF0ZSwgYmVmb3JlS2V5KVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBhcnNlTm9kZShzdGF0ZSwgbm9kZUluZGVudCwgQ09OVEVYVF9CTE9DS19PVVQsIHRydWUsIHBlbmRpbmdFeHBsaWNpdEtleSkpIHtcbiAgICAgIHBlbmRpbmdFeHBsaWNpdEtleSA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKCFhdEV4cGxpY2l0S2V5KSB7XG4gICAgICBpZiAocGVuZGluZ0V4cGxpY2l0S2V5KSB7XG4gICAgICAgIGFkZEVtcHR5U2NhbGFyRXZlbnQoc3RhdGUpXG4gICAgICAgIHBlbmRpbmdFeHBsaWNpdEtleSA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSlcbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgICBpZiAoKHN0YXRlLmxpbmUgPT09IGVudHJ5TGluZSB8fCBzdGF0ZS5saW5lSW5kZW50ID4gbm9kZUluZGVudCkgJiYgY2ggIT09IDApIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdiYWQgaW5kZW50YXRpb24gb2YgYSBtYXBwaW5nIGVudHJ5JylcbiAgICB9IGVsc2UgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPCBub2RlSW5kZW50KSB7XG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICghZGV0ZWN0ZWQpIHJldHVybiBmYWxzZVxuICBpZiAoYXRFeHBsaWNpdEtleSkgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgaWYgKG1hcHBpbmdPcGVuZWQpIGFkZFBvcEV2ZW50KHN0YXRlKVxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiBwYXJzZU5vZGUgKFxuICBzdGF0ZTogUGFyc2VyU3RhdGUsXG4gIHBhcmVudEluZGVudDogbnVtYmVyLFxuICBub2RlQ29udGV4dDogTm9kZUNvbnRleHQsXG4gIGFsbG93VG9TZWVrOiBib29sZWFuLFxuICBhbGxvd0NvbXBhY3Q6IGJvb2xlYW4sXG4gIGFsbG93UHJvcGVydHlNYXBwaW5nID0gdHJ1ZVxuKTogYm9vbGVhbiB7XG4gIGlmIChzdGF0ZS5kZXB0aCA+PSBzdGF0ZS5tYXhEZXB0aCkge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsIGBuZXN0aW5nIGV4Y2VlZGVkIG1heERlcHRoICgke3N0YXRlLm1heERlcHRofSlgKVxuICB9XG5cbiAgc3RhdGUuZGVwdGgrK1xuXG4gIGxldCBpbmRlbnRTdGF0dXMgPSAxXG4gIGxldCBhdE5ld0xpbmUgPSBmYWxzZVxuICBsZXQgaGFzQ29udGVudCA9IGZhbHNlXG4gIGxldCBwcm9wZXJ0eVN0YXJ0OiBQYXJzZXJTbmFwc2hvdCB8IG51bGwgPSBudWxsXG4gIGNvbnN0IHByb3BzID0gZW1wdHlQcm9wZXJ0aWVzKClcblxuICBsZXQgYWxsb3dCbG9ja1NjYWxhcnMgPSBub2RlQ29udGV4dCA9PT0gQ09OVEVYVF9CTE9DS19PVVQgfHwgbm9kZUNvbnRleHQgPT09IENPTlRFWFRfQkxPQ0tfSU5cbiAgbGV0IGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9IGFsbG93QmxvY2tTY2FsYXJzXG4gIGNvbnN0IGFsbG93QmxvY2tTdHlsZXMgPSBhbGxvd0Jsb2NrU2NhbGFyc1xuXG4gIGlmIChhbGxvd1RvU2VlayAmJiBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKSkge1xuICAgIGF0TmV3TGluZSA9IHRydWVcblxuICAgIGlmIChzdGF0ZS5saW5lSW5kZW50ID4gcGFyZW50SW5kZW50KSB7XG4gICAgICBpbmRlbnRTdGF0dXMgPSAxXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5saW5lSW5kZW50ID09PSBwYXJlbnRJbmRlbnQpIHtcbiAgICAgIGluZGVudFN0YXR1cyA9IDBcbiAgICB9IGVsc2Uge1xuICAgICAgaW5kZW50U3RhdHVzID0gLTFcbiAgICB9XG4gIH1cblxuICBpZiAoc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUpKSB7XG4gICAgc3RhdGUuZGVwdGgtLVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaWYgKGluZGVudFN0YXR1cyA9PT0gMSkge1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBjb25zdCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG4gICAgICBjb25zdCBwcm9wZXJ0eVN0YXRlID0gc25hcHNob3RTdGF0ZShzdGF0ZSlcblxuICAgICAgaWYgKGF0TmV3TGluZSAmJlxuICAgICAgICAgIGluZGVudFN0YXR1cyAhPT0gMSAmJlxuICAgICAgICAgIChjaCA9PT0gMHgyMS8qICEgKi8gfHwgY2ggPT09IDB4MjYvKiAmICovKSkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBpZiAoYXROZXdMaW5lICYmXG4gICAgICAgICAgYWxsb3dCbG9ja1N0eWxlcyAmJlxuICAgICAgICAgIChwcm9wcy50YWdTdGFydCAhPT0gTk9fUkFOR0UgfHwgcHJvcHMuYW5jaG9yU3RhcnQgIT09IE5PX1JBTkdFKSAmJlxuICAgICAgICAgIChjaCA9PT0gMHgyMS8qICEgKi8gfHwgY2ggPT09IDB4MjYvKiAmICovKSkge1xuICAgICAgICBjb25zdCBmYWxsYmFja1N0YXRlID0gc25hcHNob3RTdGF0ZShzdGF0ZSlcbiAgICAgICAgY29uc3QgZmxvd0luZGVudCA9IHBhcmVudEluZGVudCArIDFcbiAgICAgICAgY29uc3QgbWFwcGluZ0luZGVudCA9IHN0YXRlLnBvc2l0aW9uIC0gc3RhdGUubGluZVN0YXJ0XG5cbiAgICAgICAgaWYgKHJlYWRCbG9ja01hcHBpbmcoc3RhdGUsIG1hcHBpbmdJbmRlbnQsIGZsb3dJbmRlbnQsIHByb3BzKSAmJlxuICAgICAgICAgICAgc3RhdGUuZXZlbnRzW2ZhbGxiYWNrU3RhdGUuZXZlbnRzTGVuZ3RoXT8udHlwZSA9PT0gRVZFTlRfTUFQUElORykge1xuICAgICAgICAgIHN0YXRlLmRlcHRoLS1cbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzdG9yZVN0YXRlKHN0YXRlLCBmYWxsYmFja1N0YXRlKVxuICAgICAgfVxuXG4gICAgICBpZiAoYXROZXdMaW5lICYmXG4gICAgICAgICAgKChjaCA9PT0gMHgyMS8qICEgKi8gJiYgcHJvcHMudGFnU3RhcnQgIT09IE5PX1JBTkdFKSB8fFxuICAgICAgICAgICAoY2ggPT09IDB4MjYvKiAmICovICYmIHByb3BzLmFuY2hvclN0YXJ0ICE9PSBOT19SQU5HRSkpKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGlmICghcmVhZFRhZ1Byb3BlcnR5KHN0YXRlLCBwcm9wcywgbm9kZUNvbnRleHQgPT09IENPTlRFWFRfRkxPV19JTikgJiYgIXJlYWRBbmNob3JQcm9wZXJ0eShzdGF0ZSwgcHJvcHMpKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9wZXJ0eVN0YXJ0ID09PSBudWxsKSBwcm9wZXJ0eVN0YXJ0ID0gcHJvcGVydHlTdGF0ZVxuXG4gICAgICBpZiAoc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSkpIHtcbiAgICAgICAgYXROZXdMaW5lID0gdHJ1ZVxuICAgICAgICBhbGxvd0Jsb2NrQ29sbGVjdGlvbnMgPSBhbGxvd0Jsb2NrU3R5bGVzXG5cbiAgICAgICAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPiBwYXJlbnRJbmRlbnQpIHtcbiAgICAgICAgICBpbmRlbnRTdGF0dXMgPSAxXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUubGluZUluZGVudCA9PT0gcGFyZW50SW5kZW50KSB7XG4gICAgICAgICAgaW5kZW50U3RhdHVzID0gMFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluZGVudFN0YXR1cyA9IC0xXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGFsbG93QmxvY2tDb2xsZWN0aW9ucykge1xuICAgIGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9IGF0TmV3TGluZSB8fCBhbGxvd0NvbXBhY3RcbiAgfVxuXG4gIGlmIChpbmRlbnRTdGF0dXMgPT09IDEgfHwgbm9kZUNvbnRleHQgPT09IENPTlRFWFRfQkxPQ0tfT1VUKSB7XG4gICAgY29uc3QgZmxvd0luZGVudCA9IG5vZGVDb250ZXh0ID09PSBDT05URVhUX0ZMT1dfSU4gfHwgbm9kZUNvbnRleHQgPT09IENPTlRFWFRfRkxPV19PVVRcbiAgICAgID8gcGFyZW50SW5kZW50XG4gICAgICA6IHBhcmVudEluZGVudCArIDFcbiAgICBjb25zdCBibG9ja0luZGVudCA9IHN0YXRlLnBvc2l0aW9uIC0gc3RhdGUubGluZVN0YXJ0XG5cbiAgICBpZiAoaW5kZW50U3RhdHVzID09PSAxKSB7XG4gICAgICBpZiAoKGFsbG93QmxvY2tDb2xsZWN0aW9ucyAmJlxuICAgICAgICAgIChyZWFkQmxvY2tTZXF1ZW5jZShzdGF0ZSwgYmxvY2tJbmRlbnQsIHByb3BzKSB8fFxuICAgICAgICAgICByZWFkQmxvY2tNYXBwaW5nKHN0YXRlLCBibG9ja0luZGVudCwgZmxvd0luZGVudCwgcHJvcHMpKSkgfHxcbiAgICAgICAgICByZWFkRmxvd0NvbGxlY3Rpb24oc3RhdGUsIGZsb3dJbmRlbnQsIHByb3BzKSkge1xuICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgICAgIGlmIChwcm9wZXJ0eVN0YXJ0ICE9PSBudWxsICYmIGFsbG93UHJvcGVydHlNYXBwaW5nICYmIGFsbG93QmxvY2tTdHlsZXMgJiYgIWFsbG93QmxvY2tDb2xsZWN0aW9ucyAmJlxuICAgICAgICAgICAgY2ggIT09IDB4N0MvKiB8ICovICYmIGNoICE9PSAweDNFLyogPiAqLykge1xuICAgICAgICAgIGNvbnN0IGZhbGxiYWNrU3RhdGUgPSBzbmFwc2hvdFN0YXRlKHN0YXRlKVxuICAgICAgICAgIGNvbnN0IHByb3BlcnR5SW5kZW50ID0gcHJvcGVydHlTdGFydC5wb3NpdGlvbiAtIHByb3BlcnR5U3RhcnQubGluZVN0YXJ0XG5cbiAgICAgICAgICByZXN0b3JlU3RhdGUoc3RhdGUsIHByb3BlcnR5U3RhcnQpXG5cbiAgICAgICAgICBpZiAocmVhZEJsb2NrTWFwcGluZyhzdGF0ZSwgcHJvcGVydHlJbmRlbnQsIGZsb3dJbmRlbnQsIGVtcHR5UHJvcGVydGllcygpKSAmJlxuICAgICAgICAgICAgICBzdGF0ZS5ldmVudHNbZmFsbGJhY2tTdGF0ZS5ldmVudHNMZW5ndGhdPy50eXBlID09PSBFVkVOVF9NQVBQSU5HKSB7XG4gICAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN0b3JlU3RhdGUoc3RhdGUsIGZhbGxiYWNrU3RhdGUpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFoYXNDb250ZW50ICYmXG4gICAgICAgICAgICAoKGFsbG93QmxvY2tTY2FsYXJzICYmIHJlYWRCbG9ja1NjYWxhcihzdGF0ZSwgZmxvd0luZGVudCwgcHJvcHMpKSB8fFxuICAgICAgICAgICAgIHJlYWRTaW5nbGVRdW90ZWRTY2FsYXIoc3RhdGUsIGZsb3dJbmRlbnQsIHByb3BzKSB8fFxuICAgICAgICAgICAgIHJlYWREb3VibGVRdW90ZWRTY2FsYXIoc3RhdGUsIGZsb3dJbmRlbnQsIHByb3BzKSB8fFxuICAgICAgICAgICAgIHJlYWRBbGlhcyhzdGF0ZSwgcHJvcHMpIHx8XG4gICAgICAgICAgICAgcmVhZFBsYWluU2NhbGFyKHN0YXRlLCBmbG93SW5kZW50LCBub2RlQ29udGV4dCwgcHJvcHMpKSkge1xuICAgICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGluZGVudFN0YXR1cyA9PT0gMCkge1xuICAgICAgaGFzQ29udGVudCA9IGFsbG93QmxvY2tDb2xsZWN0aW9ucyAmJiByZWFkQmxvY2tTZXF1ZW5jZShzdGF0ZSwgYmxvY2tJbmRlbnQsIHByb3BzKVxuICAgIH1cbiAgfVxuXG4gIGFsbG93QmxvY2tTY2FsYXJzID0gYWxsb3dCbG9ja1NjYWxhcnMgJiYgIWhhc0NvbnRlbnRcblxuICBpZiAoIWhhc0NvbnRlbnQgJiYgKHByb3BzLmFuY2hvclN0YXJ0ICE9PSBOT19SQU5HRSB8fCBwcm9wcy50YWdTdGFydCAhPT0gTk9fUkFOR0UgfHwgYWxsb3dCbG9ja1NjYWxhcnMpKSB7XG4gICAgYWRkU2NhbGFyRXZlbnQoXG4gICAgICBzdGF0ZSxcbiAgICAgIE5PX1JBTkdFLFxuICAgICAgTk9fUkFOR0UsXG4gICAgICBwcm9wcy5hbmNob3JTdGFydCxcbiAgICAgIHByb3BzLmFuY2hvckVuZCxcbiAgICAgIHByb3BzLnRhZ1N0YXJ0LFxuICAgICAgcHJvcHMudGFnRW5kLFxuICAgICAgU0NBTEFSX1NUWUxFX1BMQUlOXG4gICAgKVxuICAgIGhhc0NvbnRlbnQgPSB0cnVlXG4gIH1cblxuICBzdGF0ZS5kZXB0aC0tXG4gIHJldHVybiBoYXNDb250ZW50IHx8IHByb3BzLmFuY2hvclN0YXJ0ICE9PSBOT19SQU5HRSB8fCBwcm9wcy50YWdTdGFydCAhPT0gTk9fUkFOR0Vcbn1cblxuZnVuY3Rpb24gcmVhZERpcmVjdGl2ZSAoc3RhdGU6IFBhcnNlclN0YXRlKSB7XG4gIGlmIChzdGF0ZS5saW5lSW5kZW50ID4gMCB8fCBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMHgyNS8qICUgKi8pIHJldHVybiBmYWxzZVxuXG4gIHN0YXRlLnBvc2l0aW9uKytcbiAgY29uc3QgbmFtZVN0YXJ0ID0gc3RhdGUucG9zaXRpb25cblxuICB3aGlsZSAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgIT09IDAgJiYgIWlzV3NPckVvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSkpIHN0YXRlLnBvc2l0aW9uKytcblxuICBjb25zdCBuYW1lID0gc3RhdGUuaW5wdXQuc2xpY2UobmFtZVN0YXJ0LCBzdGF0ZS5wb3NpdGlvbilcbiAgY29uc3QgYXJnczogc3RyaW5nW10gPSBbXVxuXG4gIGlmIChuYW1lLmxlbmd0aCA9PT0gMCkgdGhyb3dFcnJvcihzdGF0ZSwgJ2RpcmVjdGl2ZSBuYW1lIG11c3Qgbm90IGJlIGxlc3MgdGhhbiBvbmUgY2hhcmFjdGVyIGluIGxlbmd0aCcpXG5cbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwICYmICFpc0VvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSkpIHtcbiAgICB3aGlsZSAoaXNXaGl0ZVNwYWNlKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkgc3RhdGUucG9zaXRpb24rK1xuICAgIGlmIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gMHgyMy8qICMgKi8gfHwgaXNFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpIHx8IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAwKSBicmVha1xuXG4gICAgY29uc3Qgc3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICAgIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCAmJiAhaXNXc09yRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkgc3RhdGUucG9zaXRpb24rK1xuICAgIGFyZ3MucHVzaChzdGF0ZS5pbnB1dC5zbGljZShzdGFydCwgc3RhdGUucG9zaXRpb24pKVxuICB9XG5cbiAgaWYgKGlzRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkgY29uc3VtZUxpbmVCcmVhayhzdGF0ZSlcblxuICBpZiAobmFtZSA9PT0gJ1lBTUwnKSB7XG4gICAgaWYgKHN0YXRlLmRpcmVjdGl2ZXMuc29tZShkaXJlY3RpdmUgPT4gZGlyZWN0aXZlLmtpbmQgPT09ICd5YW1sJykpIHRocm93RXJyb3Ioc3RhdGUsICdkdXBsaWNhdGlvbiBvZiAlWUFNTCBkaXJlY3RpdmUnKVxuICAgIGlmIChhcmdzLmxlbmd0aCAhPT0gMSkgdGhyb3dFcnJvcihzdGF0ZSwgJ1lBTUwgZGlyZWN0aXZlIGFjY2VwdHMgZXhhY3RseSBvbmUgYXJndW1lbnQnKVxuXG4gICAgY29uc3QgbWF0Y2ggPSAvXihbMC05XSspXFwuKFswLTldKykkLy5leGVjKGFyZ3NbMF0pXG4gICAgaWYgKG1hdGNoID09PSBudWxsKSB0aHJvd0Vycm9yKHN0YXRlLCAnaWxsLWZvcm1lZCBhcmd1bWVudCBvZiB0aGUgWUFNTCBkaXJlY3RpdmUnKVxuICAgIGlmIChwYXJzZUludChtYXRjaFsxXSwgMTApICE9PSAxKSB0aHJvd0Vycm9yKHN0YXRlLCAndW5hY2NlcHRhYmxlIFlBTUwgdmVyc2lvbiBvZiB0aGUgZG9jdW1lbnQnKVxuXG4gICAgc3RhdGUuZGlyZWN0aXZlcy5wdXNoKHsga2luZDogJ3lhbWwnLCB2ZXJzaW9uOiBhcmdzWzBdIH0pXG4gIH0gZWxzZSBpZiAobmFtZSA9PT0gJ1RBRycpIHtcbiAgICBpZiAoYXJncy5sZW5ndGggIT09IDIpIHRocm93RXJyb3Ioc3RhdGUsICdUQUcgZGlyZWN0aXZlIGFjY2VwdHMgZXhhY3RseSB0d28gYXJndW1lbnRzJylcblxuICAgIGNvbnN0IFtoYW5kbGUsIHByZWZpeF0gPSBhcmdzXG4gICAgaWYgKCFQQVRURVJOX1RBR19IQU5ETEUudGVzdChoYW5kbGUpKSB0aHJvd0Vycm9yKHN0YXRlLCAnaWxsLWZvcm1lZCB0YWcgaGFuZGxlIChmaXJzdCBhcmd1bWVudCkgb2YgdGhlIFRBRyBkaXJlY3RpdmUnKVxuICAgIGlmIChIQVNfT1dOLmNhbGwoc3RhdGUudGFnSGFuZGxlcnMsIGhhbmRsZSkpIHRocm93RXJyb3Ioc3RhdGUsIGB0aGVyZSBpcyBhIHByZXZpb3VzbHkgZGVjbGFyZWQgc3VmZml4IGZvciBcIiR7aGFuZGxlfVwiIHRhZyBoYW5kbGVgKVxuICAgIGlmICghUEFUVEVSTl9UQUdfUFJFRklYLnRlc3QocHJlZml4KSkgdGhyb3dFcnJvcihzdGF0ZSwgJ2lsbC1mb3JtZWQgdGFnIHByZWZpeCAoc2Vjb25kIGFyZ3VtZW50KSBvZiB0aGUgVEFHIGRpcmVjdGl2ZScpXG4gICAgdHJ5IHtcbiAgICAgIGRlY29kZVVSSUNvbXBvbmVudChwcmVmaXgpXG4gICAgfSBjYXRjaCB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCBgdGFnIHByZWZpeCBpcyBtYWxmb3JtZWQ6ICR7cHJlZml4fWApXG4gICAgfVxuXG4gICAgc3RhdGUudGFnSGFuZGxlcnNbaGFuZGxlXSA9IHByZWZpeFxuICAgIHN0YXRlLmRpcmVjdGl2ZXMucHVzaCh7IGtpbmQ6ICd0YWcnLCBoYW5kbGUsIHByZWZpeCB9KVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gcmVhZERvY3VtZW50IChzdGF0ZTogUGFyc2VyU3RhdGUpIHtcbiAgc3RhdGUuZGlyZWN0aXZlcyA9IFtdXG4gIHN0YXRlLnRhZ0hhbmRsZXJzID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICBsZXQgaGFzRGlyZWN0aXZlcyA9IGZhbHNlXG5cbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSlcblxuICB3aGlsZSAocmVhZERpcmVjdGl2ZShzdGF0ZSkpIHtcbiAgICBoYXNEaXJlY3RpdmVzID0gdHJ1ZVxuICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUpXG4gIH1cblxuICBsZXQgZXhwbGljaXRTdGFydCA9IGZhbHNlXG4gIGxldCBleHBsaWNpdEVuZCA9IGZhbHNlXG4gIGxldCBhbGxvd0NvbXBhY3QgPSB0cnVlXG5cbiAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPT09IDAgJiZcbiAgICAgIHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAweDJELyogLSAqLyAmJlxuICAgICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpID09PSAweDJELyogLSAqLyAmJlxuICAgICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDIpID09PSAweDJELyogLSAqLyAmJlxuICAgICAgaXNXc09yRW9sT3JFbmQoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDMpKSkge1xuICAgIGV4cGxpY2l0U3RhcnQgPSB0cnVlXG4gICAgY29uc3QgbWFya2VyTGluZSA9IHN0YXRlLmxpbmVcbiAgICBzdGF0ZS5wb3NpdGlvbiArPSAzXG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSlcbiAgICBhbGxvd0NvbXBhY3QgPSBzdGF0ZS5saW5lID4gbWFya2VyTGluZVxuICB9IGVsc2UgaWYgKGhhc0RpcmVjdGl2ZXMpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZGlyZWN0aXZlcyBlbmQgbWFyayBpcyBleHBlY3RlZCcpXG4gIH1cblxuICBjb25zdCBkb2N1bWVudEV2ZW50SW5kZXggPSBzdGF0ZS5ldmVudHMubGVuZ3RoXG4gIGlmICghZXhwbGljaXRTdGFydCAmJlxuICAgICAgc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJlxuICAgICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MkUvKiAuICovICYmXG4gICAgICB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUpKSB7XG4gICAgc3RhdGUucG9zaXRpb24gKz0gM1xuICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUpXG4gICAgcmV0dXJuXG4gIH1cblxuICBhZGREb2N1bWVudEV2ZW50KHN0YXRlLCBleHBsaWNpdFN0YXJ0LCBmYWxzZSlcbiAgaWYgKCFwYXJzZU5vZGUoc3RhdGUsIHN0YXRlLmxpbmVJbmRlbnQgLSAxLCBDT05URVhUX0JMT0NLX09VVCwgZmFsc2UsIGFsbG93Q29tcGFjdCwgYWxsb3dDb21wYWN0KSkge1xuICAgIGFkZEVtcHR5U2NhbGFyRXZlbnQoc3RhdGUpXG4gIH1cbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSlcblxuICBpZiAoc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUpKSB7XG4gICAgZXhwbGljaXRFbmQgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gMHgyRS8qIC4gKi9cbiAgICBpZiAoZXhwbGljaXRFbmQpIHtcbiAgICAgIGNvbnN0IG1hcmtlckxpbmUgPSBzdGF0ZS5saW5lXG4gICAgICBzdGF0ZS5wb3NpdGlvbiArPSAzXG4gICAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKVxuICAgICAgaWYgKHN0YXRlLmxpbmUgPT09IG1hcmtlckxpbmUgJiYgc3RhdGUucG9zaXRpb24gPCBzdGF0ZS5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2VuZCBvZiB0aGUgc3RyZWFtIG9yIGEgZG9jdW1lbnQgc2VwYXJhdG9yIGlzIGV4cGVjdGVkJylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBkb2N1bWVudEV2ZW50ID0gc3RhdGUuZXZlbnRzW2RvY3VtZW50RXZlbnRJbmRleF1cbiAgaWYgKGRvY3VtZW50RXZlbnQ/LnR5cGUgPT09IEVWRU5UX0RPQ1VNRU5UKSBkb2N1bWVudEV2ZW50LmV4cGxpY2l0RW5kID0gZXhwbGljaXRFbmRcblxuICBhZGRQb3BFdmVudChzdGF0ZSlcblxuICBpZiAoIWV4cGxpY2l0RW5kICYmXG4gICAgICBzdGF0ZS5wb3NpdGlvbiA8IHN0YXRlLmxlbmd0aCAmJlxuICAgICAgIShzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSkpKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2VuZCBvZiB0aGUgc3RyZWFtIG9yIGEgZG9jdW1lbnQgc2VwYXJhdG9yIGlzIGV4cGVjdGVkJylcbiAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZUV2ZW50cyAoaW5wdXQ6IHN0cmluZywgb3B0aW9uczogUGFyc2VyT3B0aW9ucyk6IEV2ZW50W10ge1xuICBjb25zdCBsZW5ndGggPSBpbnB1dC5sZW5ndGhcbiAgY29uc3Qgc3RhdGU6IFBhcnNlclN0YXRlID0ge1xuICAgIC4uLkRFRkFVTFRfUEFSU0VSX09QVElPTlMsXG4gICAgLi4ub3B0aW9ucyxcbiAgICBpbnB1dDogYCR7aW5wdXR9XFwwYCxcbiAgICBsZW5ndGgsXG4gICAgcG9zaXRpb246IDAsXG4gICAgbGluZTogMCxcbiAgICBsaW5lU3RhcnQ6IDAsXG4gICAgbGluZUluZGVudDogMCxcbiAgICBmaXJzdFRhYkluTGluZTogLTEsXG4gICAgZGVwdGg6IDAsXG4gICAgZGlyZWN0aXZlczogW10sXG4gICAgdGFnSGFuZGxlcnM6IE9iamVjdC5jcmVhdGUobnVsbCksXG4gICAgZXZlbnRzOiBbXVxuICB9XG5cbiAgY29uc3QgbnVsbHBvcyA9IGlucHV0LmluZGV4T2YoJ1xcMCcpXG4gIGlmIChudWxscG9zICE9PSAtMSkgdGhyb3dFcnJvckF0KGlucHV0LCBudWxscG9zLCAnbnVsbCBieXRlIGlzIG5vdCBhbGxvd2VkIGluIGlucHV0Jywgc3RhdGUuZmlsZW5hbWUpXG5cbiAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAweEZFRkYpIHN0YXRlLnBvc2l0aW9uKytcblxuICB3aGlsZSAoc3RhdGUucG9zaXRpb24gPCBzdGF0ZS5sZW5ndGgpIHtcbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKVxuICAgIGlmIChzdGF0ZS5wb3NpdGlvbiA+PSBzdGF0ZS5sZW5ndGgpIGJyZWFrXG4gICAgY29uc3QgZG9jdW1lbnRTdGFydCA9IHN0YXRlLnBvc2l0aW9uXG4gICAgcmVhZERvY3VtZW50KHN0YXRlKVxuICAgIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gZG9jdW1lbnRTdGFydCkge1xuICAgICAgLy8gSW50ZXJuYWwgcHJvZ3Jlc3MgZ3VhcmQ6IGlmIHJlYWREb2N1bWVudCgpIGV2ZXIgcmV0dXJucyB3aXRob3V0XG4gICAgICAvLyBjb25zdW1pbmcgaW5wdXQsIHN0b3AgaGVyZSBpbnN0ZWFkIG9mIGxvb3BpbmcgZm9yZXZlci5cbiAgICAgIC8qIGM4IGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnY2FuIG5vdCByZWFkIGEgZG9jdW1lbnQnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdGF0ZS5ldmVudHNcbn1cblxuZXhwb3J0IHtcbiAgcGFyc2VFdmVudHMsXG4gIERFRkFVTFRfUEFSU0VSX09QVElPTlMsXG4gIHR5cGUgUGFyc2VyT3B0aW9uc1xufVxuIiwgImltcG9ydCB7IFlBTUxFeGNlcHRpb24gfSBmcm9tICcuL2NvbW1vbi9leGNlcHRpb24udHMnXG5pbXBvcnQgeyBwaWNrIH0gZnJvbSAnLi9jb21tb24vb2JqZWN0LnRzJ1xuaW1wb3J0IHtcbiAgY29uc3RydWN0RnJvbUV2ZW50cyxcbiAgREVGQVVMVF9DT05TVFJVQ1RPUl9PUFRJT05TLFxuICB0eXBlIENvbnN0cnVjdG9yT3B0aW9uc1xufSBmcm9tICcuL3BhcnNlci9jb25zdHJ1Y3Rvci50cydcbmltcG9ydCB7XG4gIHBhcnNlRXZlbnRzLFxuICBERUZBVUxUX1BBUlNFUl9PUFRJT05TLFxuICB0eXBlIFBhcnNlck9wdGlvbnNcbn0gZnJvbSAnLi9wYXJzZXIvcGFyc2VyLnRzJ1xuXG4vLyBgc291cmNlYCBpcyBzdXBwbGllZCBieSBgbG9hZERvY3VtZW50c2AgaXRzZWxmLCBub3QgYnkgdGhlIHB1YmxpYyBjYWxsZXIuXG5pbnRlcmZhY2UgTG9hZE9wdGlvbnMgZXh0ZW5kcyBQYXJzZXJPcHRpb25zLCBPbWl0PENvbnN0cnVjdG9yT3B0aW9ucywgJ3NvdXJjZSc+IHt9XG5cbnR5cGUgTG9hZEFsbEl0ZXJhdG9yID0gKGRvY3VtZW50OiB1bmtub3duKSA9PiB2b2lkXG5cbmNvbnN0IERFRkFVTFRfTE9BRF9PUFRJT05TOiBSZXF1aXJlZDxMb2FkT3B0aW9ucz4gPSB7XG4gIC4uLkRFRkFVTFRfUEFSU0VSX09QVElPTlMsXG4gIC4uLkRFRkFVTFRfQ09OU1RSVUNUT1JfT1BUSU9OU1xufVxuXG5mdW5jdGlvbiBsb2FkRG9jdW1lbnRzIChpbnB1dDogc3RyaW5nLCBvcHRpb25zOiBMb2FkT3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IG9wdHMgPSB7IC4uLkRFRkFVTFRfTE9BRF9PUFRJT05TLCAuLi5vcHRpb25zIH1cbiAgY29uc3Qgc291cmNlID0gU3RyaW5nKGlucHV0KVxuXG4gIGNvbnN0IFBBUlNFUl9PUFRfS0VZUyA9IE9iamVjdC5rZXlzKERFRkFVTFRfUEFSU0VSX09QVElPTlMpIGFzXG4gICAgKGtleW9mIHR5cGVvZiBERUZBVUxUX1BBUlNFUl9PUFRJT05TKVtdXG4gIGNvbnN0IENPTlNUUlVDVE9SX09QVF9LRVlTID0gT2JqZWN0LmtleXMoREVGQVVMVF9DT05TVFJVQ1RPUl9PUFRJT05TKSBhc1xuICAgIChrZXlvZiB0eXBlb2YgREVGQVVMVF9DT05TVFJVQ1RPUl9PUFRJT05TKVtdXG5cbiAgY29uc3QgZXZlbnRzID0gcGFyc2VFdmVudHMoc291cmNlLCBwaWNrKG9wdHMsIFBBUlNFUl9PUFRfS0VZUykpXG4gIHJldHVybiBjb25zdHJ1Y3RGcm9tRXZlbnRzKGV2ZW50cywgeyAuLi5waWNrKG9wdHMsIENPTlNUUlVDVE9SX09QVF9LRVlTKSwgc291cmNlIH0pXG59XG5cbi8vIFNpZ25hdHVyZXMgd2l0aCBpdGVyYXRvciBhcmUgZGVwcmVjYXRlZC4gV2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZXh0IHZlcnNpb25zLlxuZnVuY3Rpb24gbG9hZEFsbCAoaW5wdXQ6IHN0cmluZywgb3B0aW9ucz86IExvYWRPcHRpb25zKTogdW5rbm93bltdXG5mdW5jdGlvbiBsb2FkQWxsIChpbnB1dDogc3RyaW5nLCBpdGVyYXRvcjogbnVsbCwgb3B0aW9ucz86IExvYWRPcHRpb25zKTogdW5rbm93bltdXG5mdW5jdGlvbiBsb2FkQWxsIChpbnB1dDogc3RyaW5nLCBpdGVyYXRvcjogTG9hZEFsbEl0ZXJhdG9yLCBvcHRpb25zPzogTG9hZE9wdGlvbnMpOiB2b2lkXG5mdW5jdGlvbiBsb2FkQWxsIChcbiAgaW5wdXQ6IHN0cmluZyxcbiAgaXRlcmF0b3JPck9wdGlvbnM/OiBMb2FkQWxsSXRlcmF0b3IgfCBMb2FkT3B0aW9ucyB8IG51bGwsXG4gIG9wdGlvbnM/OiBMb2FkT3B0aW9uc1xuKSB7XG4gIGxldCBpdGVyYXRvcjogTG9hZEFsbEl0ZXJhdG9yIHwgbnVsbCA9IG51bGxcblxuICBpZiAodHlwZW9mIGl0ZXJhdG9yT3JPcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaXRlcmF0b3IgPSBpdGVyYXRvck9yT3B0aW9uc1xuICB9IGVsc2UgaWYgKGl0ZXJhdG9yT3JPcHRpb25zICE9PSBudWxsICYmIHR5cGVvZiBpdGVyYXRvck9yT3B0aW9ucyA9PT0gJ29iamVjdCcpIHtcbiAgICBvcHRpb25zID0gaXRlcmF0b3JPck9wdGlvbnNcbiAgfVxuXG4gIGNvbnN0IGRvY3VtZW50cyA9IGxvYWREb2N1bWVudHMoaW5wdXQsIG9wdGlvbnMpXG5cbiAgaWYgKGl0ZXJhdG9yID09PSBudWxsKSByZXR1cm4gZG9jdW1lbnRzXG4gIGZvciAoY29uc3QgZG9jdW1lbnQgb2YgZG9jdW1lbnRzKSBpdGVyYXRvcihkb2N1bWVudClcbn1cblxuZnVuY3Rpb24gbG9hZCAoaW5wdXQ6IHN0cmluZywgb3B0aW9ucz86IExvYWRPcHRpb25zKSB7XG4gIGNvbnN0IGRvY3VtZW50cyA9IGxvYWREb2N1bWVudHMoaW5wdXQsIG9wdGlvbnMpXG5cbiAgaWYgKGRvY3VtZW50cy5sZW5ndGggPT09IDApIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKCdleHBlY3RlZCBhIGRvY3VtZW50LCBidXQgdGhlIGlucHV0IGlzIGVtcHR5JylcbiAgaWYgKGRvY3VtZW50cy5sZW5ndGggPT09IDEpIHJldHVybiBkb2N1bWVudHNbMF1cblxuICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignZXhwZWN0ZWQgYSBzaW5nbGUgZG9jdW1lbnQgaW4gdGhlIHN0cmVhbSwgYnV0IGZvdW5kIG1vcmUnKVxufVxuXG5leHBvcnQge1xuICBsb2FkLFxuICBsb2FkQWxsLFxuICB0eXBlIExvYWRPcHRpb25zXG59XG4iLCAiLy8gUGxhaW4tb2JqZWN0IGRpc2NyaW1pbmF0ZWQgdW5pb24gc2hhcmVkIGJ5IHRoZSBkdW1wZXIgKGJ1aWx0IGJ5IGBqc1RvQXN0YCxcbi8vIHJlbmRlcmVkIGJ5IHRoZSBwcmVzZW50ZXIpIGFuZCwgbGF0ZXIsIGJ5IGxvYWQuIEJlaGF2aW91ciBsaXZlcyBpbiB0aGUgd2Fsa2Vycyxcbi8vIG5vdCBvbiB0aGUgbm9kZXMuXG5cbmltcG9ydCB7IHR5cGUgRG9jdW1lbnREaXJlY3RpdmUgfSBmcm9tICcuLi9wYXJzZXIvZXZlbnRzLnRzJ1xuXG5jbGFzcyBTdHlsZSB7XG4gIHRhZ2dlZCA9IGZhbHNlXG4gIGZsb3cgPSBmYWxzZVxuICBzaW5nbGVRdW90ZWQgPSBmYWxzZVxuICBkb3VibGVRdW90ZWQgPSBmYWxzZVxuICBsaXRlcmFsID0gZmFsc2VcbiAgZm9sZGVkID0gZmFsc2Vcbn1cblxuaW50ZXJmYWNlIE5vZGVCYXNlIHtcbiAgLy8gWUFNTCB0YWcuIFVudGFnZ2VkIG5vZGVzIGNhcnJ5IHRoZSBzZW1hbnRpYyByZXNvbHZlZCB0YWc7IHRhZ2dlZCBub2RlcyBjYXJyeVxuICAvLyB0aGUgcHJpbnRhYmxlL3ZlcmJhdGltIHRhZyBzcGVsbGluZy5cbiAgdGFnOiBzdHJpbmdcbiAgc3R5bGU6IFN0eWxlXG4gIGFuY2hvcj86IHN0cmluZ1xuXG4gIC8vIFJlc2VydmVkIGZvciB0aGUgZm9ybWF0dGluZyBsYXllcjsgbm90IHBvcHVsYXRlZCBieSB0aGUgZHVtcGVyIHlldC5cbiAgY29tbWVudEJlZm9yZT86IHN0cmluZ1xuICBjb21tZW50Pzogc3RyaW5nXG4gIGNvbW1lbnRBZnRlcj86IHN0cmluZ1xuICBibGFua0JlZm9yZT86IG51bWJlclxufVxuXG5pbnRlcmZhY2UgU2NhbGFyTm9kZSBleHRlbmRzIE5vZGVCYXNlIHtcbiAga2luZDogJ3NjYWxhcidcbiAgdmFsdWU6IHN0cmluZ1xufVxuXG5pbnRlcmZhY2UgU2VxdWVuY2VOb2RlIGV4dGVuZHMgTm9kZUJhc2Uge1xuICBraW5kOiAnc2VxdWVuY2UnXG4gIGl0ZW1zOiBOb2RlW11cbn1cblxuaW50ZXJmYWNlIE1hcHBpbmdOb2RlIGV4dGVuZHMgTm9kZUJhc2Uge1xuICBraW5kOiAnbWFwcGluZydcbiAgaXRlbXM6IEFycmF5PHsga2V5OiBOb2RlLCB2YWx1ZTogTm9kZSB9PlxufVxuXG5pbnRlcmZhY2UgQWxpYXNOb2RlIGV4dGVuZHMgTm9kZUJhc2Uge1xuICBraW5kOiAnYWxpYXMnXG4gIC8vIFRoZSBhbmNob3IgbmFtZSB0aGlzIGFsaWFzIHBvaW50cyBhdCAoYCpuYW1lYCkuXG4gIGFuY2hvcjogc3RyaW5nXG59XG5cbnR5cGUgTm9kZSA9IFNjYWxhck5vZGUgfCBTZXF1ZW5jZU5vZGUgfCBNYXBwaW5nTm9kZSB8IEFsaWFzTm9kZVxuXG4vLyBUaGUgbGF5ZXIgYWJvdmUgYE5vZGVgOiBlYWNoIGRvY3VtZW50IHdyYXBzIG9uZSBjb250ZW50IG5vZGUgcGx1cyBpdHMgb3duXG4vLyBtYXJrZXJzL2RpcmVjdGl2ZXMuIE5vdCBhIG1lbWJlciBvZiBgTm9kZWAg4oCUIHRoZSBmaWVsZHMgZGlmZmVyLiBEb2N1bWVudFxuLy8gZGlyZWN0aXZlcyBhcmUgb3JkZXJlZCBwcmVzZW50YXRpb24gZGF0YS5cbmludGVyZmFjZSBEb2N1bWVudCB7XG4gIGNvbnRlbnRzOiBOb2RlIHwgbnVsbCAgICAgICAgICAgIC8vIG51bGwgPSBlbXB0eSBkb2N1bWVudFxuICBleHBsaWNpdFN0YXJ0PzogYm9vbGVhbiAgICAgICAgICAvLyBwcmludCAnLS0tJ1xuICBleHBsaWNpdEVuZD86IGJvb2xlYW4gICAgICAgICAgICAvLyBwcmludCAnLi4uJ1xuICBkaXJlY3RpdmVzOiBEb2N1bWVudERpcmVjdGl2ZVtdXG59XG5cbmV4cG9ydCB7XG4gIFN0eWxlLFxuXG4gIHR5cGUgTm9kZSxcbiAgdHlwZSBEb2N1bWVudCxcbiAgdHlwZSBOb2RlQmFzZSxcbiAgdHlwZSBTY2FsYXJOb2RlLFxuICB0eXBlIFNlcXVlbmNlTm9kZSxcbiAgdHlwZSBNYXBwaW5nTm9kZSxcbiAgdHlwZSBBbGlhc05vZGVcbn1cbiIsICIvLyBKUyB2YWx1ZSBncmFwaCDihpIgQVNULiBLbm93cyB0YWdzIChgaWRlbnRpZnlgIC8gYHJlcHJlc2VudGApLiBBIHNpbmdsZVxuLy8gaWRlbnRpdHktYE1hcGAgd2FsayBoYW5kbGVzIGRlZHVwOiBhIHJlcGVhdCBvY2N1cnJlbmNlIG9mIGFuIG9iamVjdCAoaW5jbHVkaW5nXG4vLyBhIGN5Y2xlKSBiZWNvbWVzIGFuIGBhbGlhc2AsIGFuZCB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBnZXRzIGFuIGBhbmNob3JgLlxuXG5pbXBvcnQgeyBZQU1MRXhjZXB0aW9uIH0gZnJvbSAnLi4vY29tbW9uL2V4Y2VwdGlvbi50cydcbmltcG9ydCB7IHR5cGUgU2NoZW1hIH0gZnJvbSAnLi4vc2NoZW1hLnRzJ1xuaW1wb3J0IHsgdHlwZSBUYWdEZWZpbml0aW9uIH0gZnJvbSAnLi4vdGFnLnRzJ1xuaW1wb3J0IHsgdGFnTmFtZVNob3J0IH0gZnJvbSAnLi4vY29tbW9uL3RhZ25hbWUudHMnXG5pbXBvcnQge1xuICBTdHlsZSxcbiAgdHlwZSBEb2N1bWVudCxcbiAgdHlwZSBOb2RlLFxuICB0eXBlIFNjYWxhck5vZGUsXG4gIHR5cGUgU2VxdWVuY2VOb2RlLFxuICB0eXBlIE1hcHBpbmdOb2RlXG59IGZyb20gJy4vbm9kZXMudHMnXG5cbmludGVyZmFjZSBGcm9tSnNPcHRpb25zIHtcbiAgbm9SZWZzPzogYm9vbGVhblxuICBza2lwSW52YWxpZD86IGJvb2xlYW5cbn1cblxuLy8gQSBtYXRjaCBjYW5kaWRhdGUuIGBpbXBsaWNpdFRhZ2AgbWVhbnMgdGhlIHRhZyBpcyBub3QgcHJpbnRlZCAoaW1wbGljaXRcbi8vIHNjYWxhcnMgYW5kIHRoZSBkZWZhdWx0IHN0ci9zZXEvbWFwIHRhZ3MpLlxuaW50ZXJmYWNlIFJlcHJlc2VudFR5cGUge1xuICB0YWc6IFRhZ0RlZmluaXRpb25cbiAgaW1wbGljaXRUYWc6IGJvb2xlYW5cbn1cblxuLy8gUmV0dXJuZWQgYnkgYGJ1aWxkYCB3aGVuIG5vIHRhZyBtYXRjaGVkLlxuY29uc3QgSU5WQUxJRCA9IFN5bWJvbCgnSU5WQUxJRCcpXG5cbmludGVyZmFjZSBGcm9tSnNTdGF0ZSB7XG4gIHJlcHJlc2VudFR5cGVzOiBSZXByZXNlbnRUeXBlW11cbiAgbm9SZWZzOiBib29sZWFuXG4gIHNraXBJbnZhbGlkOiBib29sZWFuXG5cbiAgLy8gQWxyZWFkeS1idWlsdCBjb2xsZWN0aW9uIHZhbHVlcyDihpIgdGhlaXIgbm9kZSwgZm9yIGFuY2hvci9hbGlhcyBkZWR1cC5cbiAgcmVmczogTWFwPHVua25vd24sIE5vZGU+XG4gIHJlZkNvdW50ZXI6IG51bWJlclxufVxuXG5mdW5jdGlvbiBidWlsZFJlcHJlc2VudFR5cGVzIChzY2hlbWE6IFNjaGVtYSk6IFJlcHJlc2VudFR5cGVbXSB7XG4gIGNvbnN0IGRlZmF1bHRUYWdzID0gbmV3IFNldDxUYWdEZWZpbml0aW9uPihbXG4gICAgc2NoZW1hLmRlZmF1bHRTY2FsYXJUYWcsXG4gICAgc2NoZW1hLmRlZmF1bHRTZXF1ZW5jZVRhZyxcbiAgICBzY2hlbWEuZGVmYXVsdE1hcHBpbmdUYWdcbiAgXS5maWx0ZXIoKHQpOiB0IGlzIFRhZ0RlZmluaXRpb24gPT4gdCAhPT0gdW5kZWZpbmVkKSlcblxuICAvLyBEZWZhdWx0IGNvbnRhaW5lci9zdHIgdGFncyBnbyBsYXN0IHNvIGEgbW9yZSBzcGVjaWZpYyB0YWcgaWRlbnRpZnlpbmcgdGhlXG4gIC8vIHNhbWUgSlMgdmFsdWUgKGUuZy4gYSBjdXN0b20gdGFnIG9uIGEgcGxhaW4gb2JqZWN0KSB3aW5zLlxuICBjb25zdCBpbXBsaWNpdFNjYWxhcnMgPSBzY2hlbWEuaW1wbGljaXRTY2FsYXJUYWdzXG4gIGNvbnN0IGV4cGxpY2l0VGFncyA9IHNjaGVtYS50YWdzLmZpbHRlcih0ID0+XG4gICAgISh0Lm5vZGVLaW5kID09PSAnc2NhbGFyJyAmJiB0LmltcGxpY2l0KSAmJiAhZGVmYXVsdFRhZ3MuaGFzKHQpKVxuICBjb25zdCBkZWZhdWx0VGFnc0xhc3QgPSBzY2hlbWEudGFncy5maWx0ZXIodCA9PiBkZWZhdWx0VGFncy5oYXModCkpXG5cbiAgcmV0dXJuIFtcbiAgICAuLi5pbXBsaWNpdFNjYWxhcnMubWFwKHRhZyA9PiAoeyB0YWcsIGltcGxpY2l0VGFnOiB0cnVlIH0pKSxcbiAgICAuLi5leHBsaWNpdFRhZ3MubWFwKHRhZyA9PiAoeyB0YWcsIGltcGxpY2l0VGFnOiBmYWxzZSB9KSksXG4gICAgLi4uZGVmYXVsdFRhZ3NMYXN0Lm1hcCh0YWcgPT4gKHsgdGFnLCBpbXBsaWNpdFRhZzogdHJ1ZSB9KSlcbiAgXVxufVxuXG4vLyBGaXJzdCB0YWcgd2hvc2UgYGlkZW50aWZ5YCBhY2NlcHRzIGBvYmplY3RgLlxuZnVuY3Rpb24gbWF0Y2hUYWcgKHN0YXRlOiBGcm9tSnNTdGF0ZSwgb2JqZWN0OiB1bmtub3duKTogeyB0YWc6IFRhZ0RlZmluaXRpb24sIHRhZ05hbWU6IHN0cmluZywgaW1wbGljaXRUYWc6IGJvb2xlYW4gfSB8IG51bGwge1xuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IHN0YXRlLnJlcHJlc2VudFR5cGVzLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCB7IHRhZywgaW1wbGljaXRUYWcgfSA9IHN0YXRlLnJlcHJlc2VudFR5cGVzW2luZGV4XVxuXG4gICAgaWYgKHRhZy5pZGVudGlmeSAmJiB0YWcuaWRlbnRpZnkob2JqZWN0KSkge1xuICAgICAgbGV0IHRhZ05hbWU6IHN0cmluZ1xuICAgICAgaWYgKHRhZy5tYXRjaEJ5VGFnUHJlZml4ICYmIHRhZy5yZXByZXNlbnRUYWdOYW1lKSB7XG4gICAgICAgIHRhZ05hbWUgPSB0YWcucmVwcmVzZW50VGFnTmFtZShvYmplY3QpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0YWdOYW1lID0gdGFnLnRhZ05hbWVcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IHRhZywgdGFnTmFtZSwgaW1wbGljaXRUYWcgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsXG59XG5cbi8vIEJ1aWxkIGEgbm9kZSBmb3IgYG9iamVjdGAsIG9yIElOVkFMSUQgd2hlbiBubyB0YWcgbWF0Y2hlcy4gYHVuZGVmaW5lZGAgbmV2ZXJcbi8vIHRocm93cyAoY2FsbGVyIGRlY2lkZXM6IG51bGwgaW4gYSBzZXF1ZW5jZSwgc2tpcCBpbiBhIG1hcHBpbmcsICcnIGF0IHJvb3QpO1xuLy8gYW55IG90aGVyIHVucmVwcmVzZW50YWJsZSB2YWx1ZSB0aHJvd3MgdW5sZXNzIGBza2lwSW52YWxpZGAuXG5mdW5jdGlvbiBidWlsZCAoc3RhdGU6IEZyb21Kc1N0YXRlLCBvYmplY3Q6IHVua25vd24pOiBOb2RlIHwgdHlwZW9mIElOVkFMSUQge1xuICBpZiAoIXN0YXRlLm5vUmVmcyAmJiBvYmplY3QgIT09IG51bGwgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcpIHtcbiAgICBjb25zdCBleGlzdGluZyA9IHN0YXRlLnJlZnMuZ2V0KG9iamVjdClcbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgIGlmIChleGlzdGluZy5hbmNob3IgPT09IHVuZGVmaW5lZCkgZXhpc3RpbmcuYW5jaG9yID0gYHJlZl8ke3N0YXRlLnJlZkNvdW50ZXIrK31gXG4gICAgICByZXR1cm4geyBraW5kOiAnYWxpYXMnLCB0YWc6ICcnLCBzdHlsZTogbmV3IFN0eWxlKCksIGFuY2hvcjogZXhpc3RpbmcuYW5jaG9yIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBtYXRjaGVkID0gbWF0Y2hUYWcoc3RhdGUsIG9iamVjdClcblxuICBpZiAoIW1hdGNoZWQpIHtcbiAgICBpZiAob2JqZWN0ID09PSB1bmRlZmluZWQpIHJldHVybiBJTlZBTElEXG4gICAgaWYgKHN0YXRlLnNraXBJbnZhbGlkKSByZXR1cm4gSU5WQUxJRFxuICAgIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKGB1bmFjY2VwdGFibGUga2luZCBvZiBhbiBvYmplY3QgdG8gZHVtcCAke09iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpfWApXG4gIH1cblxuICBjb25zdCB7IHRhZywgdGFnTmFtZSwgaW1wbGljaXRUYWcgfSA9IG1hdGNoZWRcbiAgY29uc3Qgbm9kZVRhZ05hbWUgPSBpbXBsaWNpdFRhZyA/IHRhZ05hbWUgOiB0YWdOYW1lU2hvcnQodGFnTmFtZSlcblxuICBpZiAodGFnLm5vZGVLaW5kID09PSAnc2NhbGFyJykge1xuICAgIGNvbnN0IHN0eWxlID0gbmV3IFN0eWxlKClcbiAgICBzdHlsZS50YWdnZWQgPSAhaW1wbGljaXRUYWdcbiAgICBjb25zdCBub2RlOiBTY2FsYXJOb2RlID0ge1xuICAgICAga2luZDogJ3NjYWxhcicsXG4gICAgICB0YWc6IG5vZGVUYWdOYW1lLFxuICAgICAgc3R5bGUsXG4gICAgICB2YWx1ZTogdGFnLnJlcHJlc2VudChvYmplY3QpXG4gICAgfVxuICAgIHJldHVybiBub2RlXG4gIH1cblxuICBpZiAodGFnLm5vZGVLaW5kID09PSAnc2VxdWVuY2UnKSB7XG4gICAgY29uc3QgY29udGFpbmVyID0gdGFnLnJlcHJlc2VudChvYmplY3QpXG4gICAgY29uc3Qgc3R5bGUgPSBuZXcgU3R5bGUoKVxuICAgIHN0eWxlLnRhZ2dlZCA9ICFpbXBsaWNpdFRhZ1xuICAgIGNvbnN0IG5vZGU6IFNlcXVlbmNlTm9kZSA9IHsga2luZDogJ3NlcXVlbmNlJywgdGFnOiBub2RlVGFnTmFtZSwgc3R5bGUsIGl0ZW1zOiBbXSB9XG4gICAgaWYgKCFzdGF0ZS5ub1JlZnMpIHN0YXRlLnJlZnMuc2V0KG9iamVjdCwgbm9kZSlcblxuICAgIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gY29udGFpbmVyLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICAgIGxldCBpdGVtID0gYnVpbGQoc3RhdGUsIGNvbnRhaW5lcltpbmRleF0pXG4gICAgICAvLyBBbiBpbnZhbGlkIGVsZW1lbnQgYmVjb21lcyBudWxsOyBhIHN0aWxsLWludmFsaWQgbnVsbCB0aGVuIHNraXBzL3Rocm93cy5cbiAgICAgIGlmIChpdGVtID09PSBJTlZBTElEICYmIGNvbnRhaW5lcltpbmRleF0gPT09IHVuZGVmaW5lZCkgaXRlbSA9IGJ1aWxkKHN0YXRlLCBudWxsKVxuICAgICAgaWYgKGl0ZW0gPT09IElOVkFMSUQpIGNvbnRpbnVlXG4gICAgICBub2RlLml0ZW1zLnB1c2goaXRlbSlcbiAgICB9XG4gICAgcmV0dXJuIG5vZGVcbiAgfVxuXG4gIC8vIG1hcHBpbmcg4oCUIHRoZSBjYW5vbmljYWwgZm9ybSBpcyBhbHdheXMgYSBgTWFwYC5cbiAgY29uc3QgbWFwID0gdGFnLnJlcHJlc2VudChvYmplY3QpXG4gIGNvbnN0IHN0eWxlID0gbmV3IFN0eWxlKClcbiAgc3R5bGUudGFnZ2VkID0gIWltcGxpY2l0VGFnXG4gIGNvbnN0IG5vZGU6IE1hcHBpbmdOb2RlID0geyBraW5kOiAnbWFwcGluZycsIHRhZzogbm9kZVRhZ05hbWUsIHN0eWxlLCBpdGVtczogW10gfVxuICBpZiAoIXN0YXRlLm5vUmVmcykgc3RhdGUucmVmcy5zZXQob2JqZWN0LCBub2RlKVxuXG4gIGZvciAoY29uc3QgW29iamVjdEtleSwgb2JqZWN0VmFsdWVdIG9mIG1hcCkge1xuICAgIGNvbnN0IGtleSA9IGJ1aWxkKHN0YXRlLCBvYmplY3RLZXkpXG4gICAgaWYgKGtleSA9PT0gSU5WQUxJRCkgY29udGludWUgLy8gaW52YWxpZCBrZXkgc2tpcHMgdGhlIHBhaXJcbiAgICBjb25zdCB2YWx1ZSA9IGJ1aWxkKHN0YXRlLCBvYmplY3RWYWx1ZSlcbiAgICBpZiAodmFsdWUgPT09IElOVkFMSUQpIGNvbnRpbnVlIC8vIGludmFsaWQgdmFsdWUgc2tpcHMgdGhlIHBhaXJcbiAgICBub2RlLml0ZW1zLnB1c2goeyBrZXksIHZhbHVlIH0pXG4gIH1cbiAgcmV0dXJuIG5vZGVcbn1cblxuLy8gQSBKUyB2YWx1ZSBpcyBvbmUgWUFNTCBkb2N1bWVudC4gQW4gdW5yZXByZXNlbnRhYmxlIHJvb3QgYmVjb21lcyBhbiBlbXB0eVxuLy8gZG9jdW1lbnQsIHdoaWNoIHRoZSBwcmVzZW50ZXIgcmVuZGVycyBhcyBhbiBlbXB0eSBzdHJpbmcuXG5mdW5jdGlvbiBqc1RvQXN0IChpbnB1dDogdW5rbm93biwgc2NoZW1hOiBTY2hlbWEsIG9wdGlvbnM6IEZyb21Kc09wdGlvbnMgPSB7fSk6IERvY3VtZW50W10ge1xuICBjb25zdCBzdGF0ZTogRnJvbUpzU3RhdGUgPSB7XG4gICAgcmVwcmVzZW50VHlwZXM6IGJ1aWxkUmVwcmVzZW50VHlwZXMoc2NoZW1hKSxcbiAgICBub1JlZnM6IG9wdGlvbnMubm9SZWZzID8/IGZhbHNlLFxuICAgIHNraXBJbnZhbGlkOiBvcHRpb25zLnNraXBJbnZhbGlkID8/IGZhbHNlLFxuICAgIHJlZnM6IG5ldyBNYXAoKSxcbiAgICByZWZDb3VudGVyOiAwXG4gIH1cblxuICBjb25zdCByb290ID0gYnVpbGQoc3RhdGUsIGlucHV0KVxuICByZXR1cm4gW3sgY29udGVudHM6IHJvb3QgPT09IElOVkFMSUQgPyBudWxsIDogcm9vdCwgZGlyZWN0aXZlczogW10gfV1cbn1cblxuZXhwb3J0IHtcbiAganNUb0FzdCxcbiAgdHlwZSBGcm9tSnNPcHRpb25zXG59XG4iLCAiLy8gRGVwdGgtZmlyc3QgQVNUIHRyYXZlcnNhbC4gTWlycm9ycyB0aGUgYGtpbmRgIHdhbGsgb2YgdGhlIHByZXNlbnRlciBhbmQgdGhlXG4vLyBgZnJvbV8qYCBidWlsZGVycywgYnV0IHN0YXlzIHJlYWQtb3JpZW50ZWQ6IG5vZGVzIGFyZSBwbGFpbiBvYmplY3RzLCBzbyBhXG4vLyB2aXNpdG9yIG11dGF0ZXMgdGhlbSBpbiBwbGFjZS4gQ29udHJvbCBzaWduYWxzIGxldCBpdCBwcnVuZSBvciBzdG9wIHRoZSB3YWxrLlxuXG5pbXBvcnQge1xuICB0eXBlIE5vZGUsXG4gIHR5cGUgRG9jdW1lbnRcbn0gZnJvbSAnLi9ub2Rlcy50cydcblxuLy8gUmV0dXJuZWQgYnkgYSB2aXNpdG9yIHRvIGNvbnRyb2wgdGhlIHdhbGs7IGFueXRoaW5nIGVsc2UgKGluY2wuIGB1bmRlZmluZWRgKVxuLy8gZGVzY2VuZHMgYXMgdXN1YWwuXG5jb25zdCBWSVNJVF9CUkVBSyA9IFN5bWJvbCgndmlzaXQ6YnJlYWsnKSAvLyBzdG9wIHRoZSB3aG9sZSB0cmF2ZXJzYWxcbmNvbnN0IFZJU0lUX1NLSVAgPSBTeW1ib2woJ3Zpc2l0OnNraXAnKSAgIC8vIGRvbid0IGRlc2NlbmQgaW50byB0aGlzIG5vZGUncyBjaGlsZHJlblxuXG50eXBlIFZpc2l0Q29udHJvbCA9IHR5cGVvZiBWSVNJVF9CUkVBSyB8IHR5cGVvZiBWSVNJVF9TS0lQIHwgdW5kZWZpbmVkIHwgdm9pZFxuXG4vLyBUcmF2ZXJzYWwtZGVyaXZlZCBwb3NpdGlvbiBvZiB0aGUgY3VycmVudCBub2RlLiBLZXB0IG9mZiB0aGUgbm9kZSBpdHNlbGY6IGFcbi8vIG5vZGUgbWF5IHNpdCBpbiBzZXZlcmFsIHBsYWNlcyAoYWxpYXMvZGVkdXAgcmV1c2UpLCBzbyBkZXB0aC9yb2xlIGJlbG9uZyB0b1xuLy8gdGhlIHdhbGssIG5vdCB0aGUgbm9kZS4gYHBhcmVudC5raW5kYCArIGBpc0tleWAgcGluIHRoZSBleGFjdCBzbG90LlxuaW50ZXJmYWNlIFZpc2l0Q29udGV4dCB7XG4gIGRlcHRoOiBudW1iZXIgICAgICAgIC8vIDAgPSBkb2N1bWVudCBjb250ZW50IHJvb3RcbiAgcGFyZW50OiBOb2RlIHwgbnVsbCAgLy8gZW5jbG9zaW5nIHNlcXVlbmNlL21hcHBpbmcsIG51bGwgYXQgdGhlIHJvb3RcbiAgaXNLZXk6IGJvb2xlYW4gICAgICAgLy8gbm9kZSBzaXRzIGluIGEgbWFwcGluZyBrZXkgcG9zaXRpb25cbn1cblxudHlwZSBWaXNpdG9yID0gKG5vZGU6IE5vZGUsIGN0eDogVmlzaXRDb250ZXh0KSA9PiBWaXNpdENvbnRyb2xcblxuLy8gUmV0dXJucyBgdHJ1ZWAgb25jZSBgVklTSVRfQlJFQUtgIHdhcyBzZWVuLCBzbyBjYWxsZXJzIGNhbiB1bndpbmQgdGhlIHdhbGsuXG5mdW5jdGlvbiB2aXNpdE5vZGUgKG5vZGU6IE5vZGUsIHZpc2l0b3I6IFZpc2l0b3IsIGN0eDogVmlzaXRDb250ZXh0KTogYm9vbGVhbiB7XG4gIGNvbnN0IGNvbnRyb2wgPSB2aXNpdG9yKG5vZGUsIGN0eClcbiAgaWYgKGNvbnRyb2wgPT09IFZJU0lUX0JSRUFLKSByZXR1cm4gdHJ1ZVxuICBpZiAoY29udHJvbCA9PT0gVklTSVRfU0tJUCkgcmV0dXJuIGZhbHNlXG5cbiAgY29uc3QgZGVwdGggPSBjdHguZGVwdGggKyAxXG5cbiAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICBjYXNlICdzZXF1ZW5jZSc6XG4gICAgICBmb3IgKGNvbnN0IGl0ZW0gb2Ygbm9kZS5pdGVtcykge1xuICAgICAgICBpZiAodmlzaXROb2RlKGl0ZW0sIHZpc2l0b3IsIHsgZGVwdGgsIHBhcmVudDogbm9kZSwgaXNLZXk6IGZhbHNlIH0pKSByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdtYXBwaW5nJzpcbiAgICAgIGZvciAoY29uc3QgeyBrZXksIHZhbHVlIH0gb2Ygbm9kZS5pdGVtcykge1xuICAgICAgICBpZiAodmlzaXROb2RlKGtleSwgdmlzaXRvciwgeyBkZXB0aCwgcGFyZW50OiBub2RlLCBpc0tleTogdHJ1ZSB9KSkgcmV0dXJuIHRydWVcbiAgICAgICAgaWYgKHZpc2l0Tm9kZSh2YWx1ZSwgdmlzaXRvciwgeyBkZXB0aCwgcGFyZW50OiBub2RlLCBpc0tleTogZmFsc2UgfSkpIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBicmVha1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8vIFdhbGsgZXZlcnkgbm9kZSBpbiB0aGUgZG9jdW1lbnRzLCBjYWxsaW5nIGB2aXNpdG9yYCBvbmNlIHBlciBub2RlIChwcmUtb3JkZXIpLlxuZnVuY3Rpb24gdmlzaXQgKGRvY3VtZW50czogRG9jdW1lbnRbXSwgdmlzaXRvcjogVmlzaXRvcik6IHZvaWQge1xuICBmb3IgKGNvbnN0IGRvYyBvZiBkb2N1bWVudHMpIHtcbiAgICBpZiAoZG9jLmNvbnRlbnRzICYmIHZpc2l0Tm9kZShkb2MuY29udGVudHMsIHZpc2l0b3IsIHsgZGVwdGg6IDAsIHBhcmVudDogbnVsbCwgaXNLZXk6IGZhbHNlIH0pKSByZXR1cm5cbiAgfVxufVxuXG5leHBvcnQge1xuICB2aXNpdCxcbiAgVklTSVRfQlJFQUssXG4gIFZJU0lUX1NLSVAsXG4gIHR5cGUgVmlzaXRvcixcbiAgdHlwZSBWaXNpdENvbnRleHRcbn1cbiIsICIvLyBBU1Qg4oaSIHRleHQuIFdhbGtzIHRoZSBub2RlIGBraW5kYDsgdGhlIHNjYWxhciBtYWNoaW5lcnkgKHN0eWxlIHNlbGVjdGlvbixcbi8vIHF1b3RpbmcsIGZvbGRpbmcpIGlzIGRyaXZlbiBieSBub2RlIHRleHQsIG5vdCBieSBzbmlmZmluZyBhIEpTIHZhbHVlLlxuXG5pbXBvcnQgeyBZQU1MRXhjZXB0aW9uIH0gZnJvbSAnLi4vY29tbW9uL2V4Y2VwdGlvbi50cydcbmltcG9ydCB7IHRhZ05hbWVTaG9ydCB9IGZyb20gJy4uL2NvbW1vbi90YWduYW1lLnRzJ1xuaW1wb3J0IHsgdHlwZSBTY2hlbWEgfSBmcm9tICcuLi9zY2hlbWEudHMnXG5pbXBvcnQgeyBOT1RfUkVTT0xWRUQsIHR5cGUgU2NhbGFyVGFnRGVmaW5pdGlvbiB9IGZyb20gJy4uL3RhZy50cydcbmltcG9ydCB7XG4gIHR5cGUgTm9kZSxcbiAgdHlwZSBEb2N1bWVudCxcbiAgdHlwZSBTY2FsYXJOb2RlLFxuICB0eXBlIFNlcXVlbmNlTm9kZSxcbiAgdHlwZSBNYXBwaW5nTm9kZVxufSBmcm9tICcuL25vZGVzLnRzJ1xuXG5jb25zdCBDSEFSX0JPTSA9IDB4RkVGRlxuY29uc3QgQ0hBUl9UQUIgPSAweDA5IC8qIFRhYiAqL1xuY29uc3QgQ0hBUl9MSU5FX0ZFRUQgPSAweDBBIC8qIExGICovXG5jb25zdCBDSEFSX0NBUlJJQUdFX1JFVFVSTiA9IDB4MEQgLyogQ1IgKi9cbmNvbnN0IENIQVJfU1BBQ0UgPSAweDIwIC8qIFNwYWNlICovXG5jb25zdCBDSEFSX0VYQ0xBTUFUSU9OID0gMHgyMSAvKiAhICovXG5jb25zdCBDSEFSX0RPVUJMRV9RVU9URSA9IDB4MjIgLyogXCIgKi9cbmNvbnN0IENIQVJfU0hBUlAgPSAweDIzIC8qICMgKi9cbmNvbnN0IENIQVJfUEVSQ0VOVCA9IDB4MjUgLyogJSAqL1xuY29uc3QgQ0hBUl9BTVBFUlNBTkQgPSAweDI2IC8qICYgKi9cbmNvbnN0IENIQVJfU0lOR0xFX1FVT1RFID0gMHgyNyAvKiAnICovXG5jb25zdCBDSEFSX0FTVEVSSVNLID0gMHgyQSAvKiAqICovXG5jb25zdCBDSEFSX0NPTU1BID0gMHgyQyAvKiAsICovXG5jb25zdCBDSEFSX01JTlVTID0gMHgyRCAvKiAtICovXG5jb25zdCBDSEFSX0NPTE9OID0gMHgzQSAvKiA6ICovXG5jb25zdCBDSEFSX0VRVUFMUyA9IDB4M0QgLyogPSAqL1xuY29uc3QgQ0hBUl9HUkVBVEVSX1RIQU4gPSAweDNFIC8qID4gKi9cbmNvbnN0IENIQVJfUVVFU1RJT04gPSAweDNGIC8qID8gKi9cbmNvbnN0IENIQVJfQ09NTUVSQ0lBTF9BVCA9IDB4NDAgLyogQCAqL1xuY29uc3QgQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VUID0gMHg1QiAvKiBbICovXG5jb25zdCBDSEFSX1JJR0hUX1NRVUFSRV9CUkFDS0VUID0gMHg1RCAvKiBdICovXG5jb25zdCBDSEFSX0dSQVZFX0FDQ0VOVCA9IDB4NjAgLyogYCAqL1xuY29uc3QgQ0hBUl9MRUZUX0NVUkxZX0JSQUNLRVQgPSAweDdCIC8qIHsgKi9cbmNvbnN0IENIQVJfVkVSVElDQUxfTElORSA9IDB4N0MgLyogfCAqL1xuY29uc3QgQ0hBUl9SSUdIVF9DVVJMWV9CUkFDS0VUID0gMHg3RCAvKiB9ICovXG5cbmNvbnN0IEVTQ0FQRV9TRVFVRU5DRVM6IFJlY29yZDxudW1iZXIsIHN0cmluZz4gPSB7fVxuXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MDBdID0gJ1xcXFwwJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDA3XSA9ICdcXFxcYSdcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwOF0gPSAnXFxcXGInXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MDldID0gJ1xcXFx0J1xuRVNDQVBFX1NFUVVFTkNFU1sweDBBXSA9ICdcXFxcbidcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwQl0gPSAnXFxcXHYnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MENdID0gJ1xcXFxmJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDBEXSA9ICdcXFxccidcbkVTQ0FQRV9TRVFVRU5DRVNbMHgxQl0gPSAnXFxcXGUnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MjJdID0gJ1xcXFxcIidcbkVTQ0FQRV9TRVFVRU5DRVNbMHg1Q10gPSAnXFxcXFxcXFwnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4ODVdID0gJ1xcXFxOJ1xuRVNDQVBFX1NFUVVFTkNFU1sweEEwXSA9ICdcXFxcXydcbkVTQ0FQRV9TRVFVRU5DRVNbMHgyMDI4XSA9ICdcXFxcTCdcbkVTQ0FQRV9TRVFVRU5DRVNbMHgyMDI5XSA9ICdcXFxcUCdcblxuaW50ZXJmYWNlIFByZXNlbnRlck9wdGlvbnMge1xuICBzY2hlbWE6IFNjaGVtYVxuICBpbmRlbnQ/OiBudW1iZXJcbiAgc2VxTm9JbmRlbnQ/OiBib29sZWFuXG4gIHNlcUlubGluZUZpcnN0PzogYm9vbGVhblxuICBzb3J0S2V5cz86IGJvb2xlYW4gfCAoKGE6IGFueSwgYjogYW55KSA9PiBudW1iZXIpXG4gIGxpbmVXaWR0aD86IG51bWJlclxuICBmbG93QnJhY2tldFBhZGRpbmc/OiBib29sZWFuXG4gIGZsb3dTa2lwQ29tbWFTcGFjZT86IGJvb2xlYW5cbiAgZmxvd1NraXBDb2xvblNwYWNlPzogYm9vbGVhblxuICBxdW90ZUZsb3dLZXlzPzogYm9vbGVhblxuICBxdW90ZVN0eWxlPzogJ3NpbmdsZScgfCAnZG91YmxlJ1xuICBmb3JjZVF1b3Rlcz86IGJvb2xlYW5cbiAgdGFnQmVmb3JlQW5jaG9yPzogYm9vbGVhblxufVxuXG5jb25zdCBERUZBVUxUX1BSRVNFTlRFUl9PUFRJT05TOiBSZXF1aXJlZDxPbWl0PFByZXNlbnRlck9wdGlvbnMsICdzY2hlbWEnPj4gPSB7XG4gIGluZGVudDogMixcbiAgc2VxTm9JbmRlbnQ6IGZhbHNlLFxuICBzZXFJbmxpbmVGaXJzdDogdHJ1ZSxcbiAgc29ydEtleXM6IGZhbHNlLFxuICBsaW5lV2lkdGg6IDgwLFxuICBmbG93QnJhY2tldFBhZGRpbmc6IGZhbHNlLFxuICBmbG93U2tpcENvbW1hU3BhY2U6IGZhbHNlLFxuICBmbG93U2tpcENvbG9uU3BhY2U6IGZhbHNlLFxuICBxdW90ZUZsb3dLZXlzOiBmYWxzZSxcbiAgcXVvdGVTdHlsZTogJ3NpbmdsZScsXG4gIGZvcmNlUXVvdGVzOiBmYWxzZSxcbiAgdGFnQmVmb3JlQW5jaG9yOiBmYWxzZVxufVxuXG5pbnRlcmZhY2UgUHJlc2VudGVyU3RhdGUgZXh0ZW5kcyBSZXF1aXJlZDxQcmVzZW50ZXJPcHRpb25zPiB7XG4gIGRlZmF1bHRTY2FsYXJUYWdOYW1lOiBzdHJpbmdcbiAgaW1wbGljaXRSZXNvbHZlcnM6IHJlYWRvbmx5IFNjYWxhclRhZ0RlZmluaXRpb25bXVxufVxuXG5mdW5jdGlvbiBub2RlVGFnU2hvcnQgKG5vZGU6IE5vZGUpIHtcbiAgcmV0dXJuIG5vZGUuc3R5bGUudGFnZ2VkID8gbm9kZS50YWcgOiB0YWdOYW1lU2hvcnQobm9kZS50YWcpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVByZXNlbnRlclN0YXRlIChvcHRpb25zOiBQcmVzZW50ZXJPcHRpb25zKTogUHJlc2VudGVyU3RhdGUge1xuICBjb25zdCBvcHRzID0ge1xuICAgIC4uLkRFRkFVTFRfUFJFU0VOVEVSX09QVElPTlMsXG4gICAgLi4ub3B0aW9uc1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5vcHRzLFxuICAgIGRlZmF1bHRTY2FsYXJUYWdOYW1lOiBvcHRzLnNjaGVtYS5kZWZhdWx0U2NhbGFyVGFnLnRhZ05hbWUsXG4gICAgaW1wbGljaXRSZXNvbHZlcnM6IG9wdHMuc2NoZW1hLmltcGxpY2l0U2NhbGFyVGFnc1xuICB9XG59XG5cbmZ1bmN0aW9uIGVuY29kZU5vblByaW50YWJsZSAoY2hhcmFjdGVyOiBudW1iZXIpIHtcbiAgLy8gWUFNTCBub24tcHJpbnRhYmxlIGNvZGUgcG9pbnRzIGFyZSBhbGwgaW4gQk1QIChtYXggRkZGRik7XG4gIC8vIGFzdHJhbCBjb2RlIHBvaW50cyBhcmUgcHJpbnRhYmxlIGFuZCBjYW4ndCBjb21lIGhlcmUuXG4gIGNvbnN0IHN0cmluZyA9IGNoYXJhY3Rlci50b1N0cmluZygxNikudG9VcHBlckNhc2UoKVxuICBjb25zdCBoYW5kbGUgPSBjaGFyYWN0ZXIgPD0gMHhGRiA/ICd4JyA6ICd1J1xuICBjb25zdCBsZW5ndGggPSBjaGFyYWN0ZXIgPD0gMHhGRiA/IDIgOiA0XG5cbiAgcmV0dXJuIGBcXFxcJHtoYW5kbGV9JHsnMCcucmVwZWF0KGxlbmd0aCAtIHN0cmluZy5sZW5ndGgpfSR7c3RyaW5nfWBcbn1cblxuLy8gSW5kZW50cyBldmVyeSBsaW5lIGluIGEgc3RyaW5nLiBFbXB0eSBsaW5lcyAoXFxuIG9ubHkpIGFyZSBub3QgaW5kZW50ZWQuXG5mdW5jdGlvbiBpbmRlbnRTdHJpbmcgKHN0cmluZzogc3RyaW5nLCBzcGFjZXM6IG51bWJlcikge1xuICBjb25zdCBpbmQgPSAnICcucmVwZWF0KHNwYWNlcylcbiAgbGV0IHBvc2l0aW9uID0gMFxuICBsZXQgcmVzdWx0ID0gJydcbiAgY29uc3QgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aFxuXG4gIHdoaWxlIChwb3NpdGlvbiA8IGxlbmd0aCkge1xuICAgIGxldCBsaW5lXG4gICAgY29uc3QgbmV4dCA9IHN0cmluZy5pbmRleE9mKCdcXG4nLCBwb3NpdGlvbilcbiAgICBpZiAobmV4dCA9PT0gLTEpIHtcbiAgICAgIGxpbmUgPSBzdHJpbmcuc2xpY2UocG9zaXRpb24pXG4gICAgICBwb3NpdGlvbiA9IGxlbmd0aFxuICAgIH0gZWxzZSB7XG4gICAgICBsaW5lID0gc3RyaW5nLnNsaWNlKHBvc2l0aW9uLCBuZXh0ICsgMSlcbiAgICAgIHBvc2l0aW9uID0gbmV4dCArIDFcbiAgICB9XG5cbiAgICBpZiAobGluZS5sZW5ndGggJiYgbGluZSAhPT0gJ1xcbicpIHJlc3VsdCArPSBpbmRcblxuICAgIHJlc3VsdCArPSBsaW5lXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlTmV4dExpbmUgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgbGV2ZWw6IG51bWJlcikge1xuICByZXR1cm4gYFxcbiR7JyAnLnJlcGVhdChzdGF0ZS5pbmRlbnQgKiBsZXZlbCl9YFxufVxuXG4vLyBJbmRlbnRhdGlvbi93aWR0aCBudW1iZXJzIHRoYXQgZ292ZXJuIGhvdyBhIHNjYWxhciBsYXlzIG91dCBhdCBgbGV2ZWxgLlxuLy8gU2NhbGFyLW9ubHk6IGNvbGxlY3Rpb25zIGNvbXB1dGUgdGhlaXIgb3duIGluZGVudCB2aWEgYGdlbmVyYXRlTmV4dExpbmVgLlxuLy8gICBpbmRlbnQgICAgICAtIHNwYWNlcyBwcmVwZW5kZWQgdG8gdGhlIHNjYWxhcidzIGNvbnRlbnQgKGJsb2NrIHN0eWxlcylcbi8vICAgYmxvY2tJbmRlbnQgLSB0aGUgYmxvY2sgaW5kZW50YXRpb24gaW5kaWNhdG9yIGRpZ2l0IChgfDJgIC8gYD4yYCk7IGF0IHRoZVxuLy8gICAgICAgICAgICAgICAgIGRvY3VtZW50IHJvb3QgKGxldmVsIDApIGl0IGlzIG9uZSBncmVhdGVyIHRoYW4gdGhlIHNwYWNlcyB3ZVxuLy8gICAgICAgICAgICAgICAgIGFjdHVhbGx5IHByZXBlbmQgKHJlYWRlciBhcHBsaWVzIGl0IHJlbGF0aXZlIHRvIHBhcmVudCBuID0gLTEpXG4vLyAgIGxpbmVXaWR0aCAgIC0gZm9sZCB3aWR0aCBhdCB0aGlzIGRlcHRoLCBzaHJpbmtpbmcgbW9ub3RvbmljYWxseSB0b3dhcmRcbi8vICAgICAgICAgICAgICAgICBtaW4oc3RhdGUubGluZVdpZHRoLCA0MCkgYXMgaW5kZW50YXRpb24gZGVlcGVuczsgLTEgPSBubyBsaW1pdFxuZnVuY3Rpb24gc2NhbGFyTGF5b3V0IChzdGF0ZTogUHJlc2VudGVyU3RhdGUsIGxldmVsOiBudW1iZXIpIHtcbiAgY29uc3QgaW5kZW50ID0gc3RhdGUuaW5kZW50ICogTWF0aC5tYXgoMSwgbGV2ZWwpIC8vIG5vIDAtaW5kZW50IHNjYWxhcnNcbiAgY29uc3QgYmxvY2tJbmRlbnQgPSBsZXZlbCA9PT0gMCA/IHN0YXRlLmluZGVudCArIDEgOiBzdGF0ZS5pbmRlbnRcbiAgY29uc3QgbGluZVdpZHRoID0gKHN0YXRlLmxpbmVXaWR0aCA9PT0gLTEpXG4gICAgPyAtMVxuICAgIDogTWF0aC5tYXgoTWF0aC5taW4oc3RhdGUubGluZVdpZHRoLCA0MCksIHN0YXRlLmxpbmVXaWR0aCAtIGluZGVudClcblxuICByZXR1cm4geyBpbmRlbnQsIGJsb2NrSW5kZW50LCBsaW5lV2lkdGggfVxufVxuXG5mdW5jdGlvbiByZXNvbHZlSW1wbGljaXRUYWcgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgc3RyOiBzdHJpbmcpIHtcbiAgZm9yIChsZXQgaW5kZXggPSAwLCBsZW5ndGggPSBzdGF0ZS5pbXBsaWNpdFJlc29sdmVycy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgY29uc3QgdGFnRGVmaW5pdGlvbiA9IHN0YXRlLmltcGxpY2l0UmVzb2x2ZXJzW2luZGV4XVxuXG4gICAgaWYgKHRhZ0RlZmluaXRpb24ucmVzb2x2ZShzdHIsIGZhbHNlLCB0YWdEZWZpbml0aW9uLnRhZ05hbWUpICE9PSBOT1RfUkVTT0xWRUQpIHtcbiAgICAgIHJldHVybiB0YWdEZWZpbml0aW9uLnRhZ05hbWVcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc3RhdGUuZGVmYXVsdFNjYWxhclRhZ05hbWVcbn1cblxuLy8gWzMzXSBzLXdoaXRlIDo6PSBzLXNwYWNlIHwgcy10YWJcbmZ1bmN0aW9uIGlzV2hpdGVzcGFjZSAoYzogbnVtYmVyKSB7XG4gIHJldHVybiBjID09PSBDSEFSX1NQQUNFIHx8IGMgPT09IENIQVJfVEFCXG59XG5cbi8vIE1pcnJvcnMgcGFyc2VyLnRlc3REb2N1bWVudFNlcGFyYXRvcigpOiBgLS0tYCBhbmQgYC4uLmAgYXJlIGRvY3VtZW50XG4vLyBtYXJrZXJzIHdoZW4gZm9sbG93ZWQgYnkgc2VwYXJhdGlvbiB3aGl0ZXNwYWNlLCBhIGxpbmUgYnJlYWssIG9yIEVPRi5cbmZ1bmN0aW9uIHN0YXJ0c1dpdGhEb2N1bWVudFNlcGFyYXRvciAoc3RyaW5nOiBzdHJpbmcpIHtcbiAgY29uc3QgbWFya2VyID0gc3RyaW5nLmNoYXJDb2RlQXQoMClcblxuICBpZiAoKG1hcmtlciAhPT0gQ0hBUl9NSU5VUyAmJiBtYXJrZXIgIT09IDB4MkUvKiAuICovKSB8fFxuICAgICAgc3RyaW5nLmNoYXJDb2RlQXQoMSkgIT09IG1hcmtlciB8fCBzdHJpbmcuY2hhckNvZGVBdCgyKSAhPT0gbWFya2VyKSByZXR1cm4gZmFsc2VcblxuICBpZiAoc3RyaW5nLmxlbmd0aCA9PT0gMykgcmV0dXJuIHRydWVcblxuICBjb25zdCBmb2xsb3dpbmcgPSBzdHJpbmcuY2hhckNvZGVBdCgzKVxuICByZXR1cm4gaXNXaGl0ZXNwYWNlKGZvbGxvd2luZykgfHxcbiAgICBmb2xsb3dpbmcgPT09IENIQVJfQ0FSUklBR0VfUkVUVVJOIHx8IGZvbGxvd2luZyA9PT0gQ0hBUl9MSU5FX0ZFRURcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBjaGFyYWN0ZXIgY2FuIGJlIHByaW50ZWQgd2l0aG91dCBlc2NhcGluZy5cbi8vIEZyb20gWUFNTCAxLjI6IFwiYW55IGFsbG93ZWQgY2hhcmFjdGVycyBrbm93biB0byBiZSBub24tcHJpbnRhYmxlXG4vLyBzaG91bGQgYWxzbyBiZSBlc2NhcGVkLiBbSG93ZXZlcixdIFRoaXMgaXNu4oCZdCBtYW5kYXRvcnlcIlxuLy8gRGVyaXZlZCBmcm9tIG5iLWNoYXIgLSBcXHQgLSAjeDg1IC0gI3hBMCAtICN4MjAyOCAtICN4MjAyOS5cbmZ1bmN0aW9uIGlzUHJpbnRhYmxlIChjOiBudW1iZXIpIHtcbiAgcmV0dXJuIChjID49IDB4MDAwMjAgJiYgYyA8PSAweDAwMDA3RSkgfHxcbiAgICAoKGMgPj0gMHgwMDBBMSAmJiBjIDw9IDB4MDBEN0ZGKSAmJiBjICE9PSAweDIwMjggJiYgYyAhPT0gMHgyMDI5KSB8fFxuICAgICgoYyA+PSAweDBFMDAwICYmIGMgPD0gMHgwMEZGRkQpICYmIGMgIT09IENIQVJfQk9NKSB8fFxuICAgIChjID49IDB4MTAwMDAgJiYgYyA8PSAweDEwRkZGRilcbn1cblxuLy8gWzM0XSBucy1jaGFyIDo6PSBuYi1jaGFyIC0gcy13aGl0ZVxuLy8gWzI3XSBuYi1jaGFyIDo6PSBjLXByaW50YWJsZSAtIGItY2hhciAtIGMtYnl0ZS1vcmRlci1tYXJrXG4vLyBbMjZdIGItY2hhciAgOjo9IGItbGluZS1mZWVkIHwgYi1jYXJyaWFnZS1yZXR1cm5cbi8vIEluY2x1ZGluZyBzLXdoaXRlIChmb3Igc29tZSByZWFzb24sIGV4YW1wbGVzIGRvZXNuJ3QgbWF0Y2ggc3BlY3MgaW4gdGhpcyBhc3BlY3QpXG4vLyBucy1jaGFyIDo6PSBjLXByaW50YWJsZSAtIGItbGluZS1mZWVkIC0gYi1jYXJyaWFnZS1yZXR1cm4gLSBjLWJ5dGUtb3JkZXItbWFya1xuZnVuY3Rpb24gaXNOc0NoYXJPcldoaXRlc3BhY2UgKGM6IG51bWJlcikge1xuICByZXR1cm4gaXNQcmludGFibGUoYykgJiZcbiAgICBjICE9PSBDSEFSX0JPTSAmJlxuICAgIC8vIC0gYi1jaGFyXG4gICAgYyAhPT0gQ0hBUl9DQVJSSUFHRV9SRVRVUk4gJiZcbiAgICBjICE9PSBDSEFSX0xJTkVfRkVFRFxufVxuXG4vLyBbMTI3XSAgbnMtcGxhaW4tc2FmZShjKSA6Oj0gYyA9IGZsb3ctb3V0ICDih5IgbnMtcGxhaW4tc2FmZS1vdXRcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjID0gZmxvdy1pbiAgIOKHkiBucy1wbGFpbi1zYWZlLWluXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYyA9IGJsb2NrLWtleSDih5IgbnMtcGxhaW4tc2FmZS1vdXRcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjID0gZmxvdy1rZXkgIOKHkiBucy1wbGFpbi1zYWZlLWluXG4vLyBbMTI4XSBucy1wbGFpbi1zYWZlLW91dCA6Oj0gbnMtY2hhclxuLy8gWzEyOV0gIG5zLXBsYWluLXNhZmUtaW4gOjo9IG5zLWNoYXIgLSBjLWZsb3ctaW5kaWNhdG9yXG4vLyBbMTMwXSAgbnMtcGxhaW4tY2hhcihjKSA6Oj0gICggbnMtcGxhaW4tc2FmZShjKSAtIOKAnDrigJ0gLSDigJwj4oCdIClcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgKCAvKiBBbiBucy1jaGFyIHByZWNlZGluZyAqLyDigJwj4oCdIClcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgKCDigJw64oCdIC8qIEZvbGxvd2VkIGJ5IGFuIG5zLXBsYWluLXNhZmUoYykgKi8gKVxuLy8gYHByZXZgIGlzIHRoZSBwcmV2aW91cyBjb2RlIHBvaW50LCBvciAtMSB3aGVuIGBjYCBpcyB0aGUgZmlyc3QgY2hhcmFjdGVyXG4vLyAobm8gcHJlY2VkaW5nIGNoYXJhY3RlcikuIC0xIGlzIG5vdCBhIHZhbGlkIGNvZGUgcG9pbnQsIHNvIGl0IGNhbiBuZXZlclxuLy8gY29sbGlkZSB3aXRoIGEgcmVhbCBvbmUgYW5kIHNhZmVseSBkaXNhYmxlcyB0aGUgcHJldi1kZXBlbmRlbnQgY2FzZXMgYmVsb3cuXG5mdW5jdGlvbiBpc1BsYWluU2FmZSAoYzogbnVtYmVyLCBwcmV2OiBudW1iZXIsIGluYmxvY2s6IGJvb2xlYW4pIHtcbiAgY29uc3QgY0lzTnNDaGFyT3JXaGl0ZXNwYWNlID0gaXNOc0NoYXJPcldoaXRlc3BhY2UoYylcbiAgY29uc3QgY0lzTnNDaGFyID0gY0lzTnNDaGFyT3JXaGl0ZXNwYWNlICYmICFpc1doaXRlc3BhY2UoYylcbiAgcmV0dXJuIChcbiAgICAoXG4gICAgICAvLyBucy1wbGFpbi1zYWZlXG4gICAgICBpbmJsb2NrIC8vIGMgPSBmbG93LWluXG4gICAgICAgID8gY0lzTnNDaGFyT3JXaGl0ZXNwYWNlXG4gICAgICAgIDogY0lzTnNDaGFyT3JXaGl0ZXNwYWNlICYmXG4gICAgICAgICAgLy8gLSBjLWZsb3ctaW5kaWNhdG9yXG4gICAgICAgICAgYyAhPT0gQ0hBUl9DT01NQSAmJlxuICAgICAgICAgIGMgIT09IENIQVJfTEVGVF9TUVVBUkVfQlJBQ0tFVCAmJlxuICAgICAgICAgIGMgIT09IENIQVJfUklHSFRfU1FVQVJFX0JSQUNLRVQgJiZcbiAgICAgICAgICBjICE9PSBDSEFSX0xFRlRfQ1VSTFlfQlJBQ0tFVCAmJlxuICAgICAgICAgIGMgIT09IENIQVJfUklHSFRfQ1VSTFlfQlJBQ0tFVFxuICAgICkgJiZcbiAgICAvLyBucy1wbGFpbi1jaGFyXG4gICAgYyAhPT0gQ0hBUl9TSEFSUCAmJiAvLyBmYWxzZSBvbiAnIydcbiAgICAhKHByZXYgPT09IENIQVJfQ09MT04gJiYgIWNJc05zQ2hhcilcbiAgKSB8fCAvLyBmYWxzZSBvbiAnOiAnXG4gIChpc05zQ2hhck9yV2hpdGVzcGFjZShwcmV2KSAmJiAhaXNXaGl0ZXNwYWNlKHByZXYpICYmIGMgPT09IENIQVJfU0hBUlApIHx8IC8vIGNoYW5nZSB0byB0cnVlIG9uICdbXiBdIydcbiAgKHByZXYgPT09IENIQVJfQ09MT04gJiYgY0lzTnNDaGFyKSAvLyBjaGFuZ2UgdG8gdHJ1ZSBvbiAnOlteIF0nXG59XG5cbi8vIFNpbXBsaWZpZWQgdGVzdCBmb3IgdmFsdWVzIGFsbG93ZWQgYXMgdGhlIGZpcnN0IGNoYXJhY3RlciBpbiBwbGFpbiBzdHlsZS5cbmZ1bmN0aW9uIGlzUGxhaW5TYWZlRmlyc3QgKGM6IG51bWJlcikge1xuICAvLyBVc2VzIGEgc3Vic2V0IG9mIG5zLWNoYXIgLSBjLWluZGljYXRvclxuICAvLyB3aGVyZSBucy1jaGFyID0gbmItY2hhciAtIHMtd2hpdGUuXG4gIC8vIE5vIHN1cHBvcnQgb2YgKCAoIOKAnD/igJ0gfCDigJw64oCdIHwg4oCcLeKAnSApIC8qIEZvbGxvd2VkIGJ5IGFuIG5zLXBsYWluLXNhZmUoYykpICovICkgcGFydFxuICByZXR1cm4gaXNQcmludGFibGUoYykgJiZcbiAgICBjICE9PSBDSEFSX0JPTSAmJlxuICAgICFpc1doaXRlc3BhY2UoYykgJiYgLy8gLSBzLXdoaXRlXG4gICAgLy8gLSAoYy1pbmRpY2F0b3IgOjo9XG4gICAgLy8g4oCcLeKAnSB8IOKAnD/igJ0gfCDigJw64oCdIHwg4oCcLOKAnSB8IOKAnFvigJ0gfCDigJxd4oCdIHwg4oCce+KAnSB8IOKAnH3igJ1cbiAgICBjICE9PSBDSEFSX01JTlVTICYmXG4gICAgYyAhPT0gQ0hBUl9RVUVTVElPTiAmJlxuICAgIGMgIT09IENIQVJfQ09MT04gJiZcbiAgICBjICE9PSBDSEFSX0NPTU1BICYmXG4gICAgYyAhPT0gQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VUICYmXG4gICAgYyAhPT0gQ0hBUl9SSUdIVF9TUVVBUkVfQlJBQ0tFVCAmJlxuICAgIGMgIT09IENIQVJfTEVGVF9DVVJMWV9CUkFDS0VUICYmXG4gICAgYyAhPT0gQ0hBUl9SSUdIVF9DVVJMWV9CUkFDS0VUICYmXG4gICAgLy8gfCDigJwj4oCdIHwg4oCcJuKAnSB8IOKAnCrigJ0gfCDigJwh4oCdIHwg4oCcfOKAnSB8IOKAnD3igJ0gfCDigJw+4oCdIHwg4oCcJ+KAnSB8IOKAnFwi4oCdXG4gICAgYyAhPT0gQ0hBUl9TSEFSUCAmJlxuICAgIGMgIT09IENIQVJfQU1QRVJTQU5EICYmXG4gICAgYyAhPT0gQ0hBUl9BU1RFUklTSyAmJlxuICAgIGMgIT09IENIQVJfRVhDTEFNQVRJT04gJiZcbiAgICBjICE9PSBDSEFSX1ZFUlRJQ0FMX0xJTkUgJiZcbiAgICBjICE9PSBDSEFSX0VRVUFMUyAmJlxuICAgIGMgIT09IENIQVJfR1JFQVRFUl9USEFOICYmXG4gICAgYyAhPT0gQ0hBUl9TSU5HTEVfUVVPVEUgJiZcbiAgICBjICE9PSBDSEFSX0RPVUJMRV9RVU9URSAmJlxuICAgIC8vIHwg4oCcJeKAnSB8IOKAnEDigJ0gfCDigJxg4oCdKVxuICAgIGMgIT09IENIQVJfUEVSQ0VOVCAmJlxuICAgIGMgIT09IENIQVJfQ09NTUVSQ0lBTF9BVCAmJlxuICAgIGMgIT09IENIQVJfR1JBVkVfQUNDRU5UXG59XG5cbmZ1bmN0aW9uIGlzUGxhaW5TYWZlQXRTdGFydCAoc3RyaW5nOiBzdHJpbmcsIGluYmxvY2s6IGJvb2xlYW4pIHtcbiAgY29uc3QgZmlyc3QgPSBjb2RlUG9pbnRBdChzdHJpbmcsIDApXG5cbiAgaWYgKGlzUGxhaW5TYWZlRmlyc3QoZmlyc3QpKSByZXR1cm4gdHJ1ZVxuXG4gIGlmIChcbiAgICBzdHJpbmcubGVuZ3RoID4gMSAmJlxuICAgIChmaXJzdCA9PT0gQ0hBUl9NSU5VUyB8fCBmaXJzdCA9PT0gQ0hBUl9RVUVTVElPTiB8fCBmaXJzdCA9PT0gQ0hBUl9DT0xPTilcbiAgKSB7XG4gICAgY29uc3Qgc2Vjb25kID0gY29kZVBvaW50QXQoc3RyaW5nLCAxKVxuXG4gICAgLy8gVGhlIHJlbGF4ZWQgaXNQbGFpblNhZmUoKSBhY2NlcHRzIHdoaXRlc3BhY2UgaW5zaWRlIGEgc2NhbGFyLCBidXQgdGhlXG4gICAgLy8gaW5kaWNhdG9yIGV4Y2VwdGlvbiBpbiBucy1wbGFpbi1maXJzdCByZXF1aXJlcyBhbiBucy1wbGFpbi1zYWZlXG4gICAgLy8gKm5vbi1zcGFjZSogY2hhcmFjdGVyLiBPdGhlcndpc2UgYC0gdmFsdWVgIGFuZCBgPyB2YWx1ZWAgc3RhcnQgYmxvY2tcbiAgICAvLyBjb2xsZWN0aW9ucyBpbnN0ZWFkIG9mIHBsYWluIHNjYWxhcnMuXG4gICAgcmV0dXJuICFpc1doaXRlc3BhY2Uoc2Vjb25kKSAmJiBpc1BsYWluU2FmZShzZWNvbmQsIGZpcnN0LCBpbmJsb2NrKVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8vIFNpbXBsaWZpZWQgdGVzdCBmb3IgdmFsdWVzIGFsbG93ZWQgYXMgdGhlIGxhc3QgY2hhcmFjdGVyIGluIHBsYWluIHN0eWxlLlxuZnVuY3Rpb24gaXNQbGFpblNhZmVMYXN0IChjOiBudW1iZXIpIHtcbiAgLy8ganVzdCBub3Qgd2hpdGVzcGFjZSBvciBjb2xvbiwgaXQgd2lsbCBiZSBjaGVja2VkIHRvIGJlIHBsYWluIGNoYXJhY3RlciBsYXRlclxuICByZXR1cm4gIWlzV2hpdGVzcGFjZShjKSAmJiBjICE9PSBDSEFSX0NPTE9OXG59XG5cbi8vIFNhbWUgYXMgJ3N0cmluZycuY29kZVBvaW50QXQocG9zKSwgYnV0IHdvcmtzIGluIG9sZGVyIGJyb3dzZXJzLlxuZnVuY3Rpb24gY29kZVBvaW50QXQgKHN0cmluZzogc3RyaW5nLCBwb3M6IG51bWJlcikge1xuICBjb25zdCBmaXJzdCA9IHN0cmluZy5jaGFyQ29kZUF0KHBvcylcbiAgbGV0IHNlY29uZFxuXG4gIGlmIChmaXJzdCA+PSAweEQ4MDAgJiYgZmlyc3QgPD0gMHhEQkZGICYmIHBvcyArIDEgPCBzdHJpbmcubGVuZ3RoKSB7XG4gICAgc2Vjb25kID0gc3RyaW5nLmNoYXJDb2RlQXQocG9zICsgMSlcbiAgICBpZiAoc2Vjb25kID49IDB4REMwMCAmJiBzZWNvbmQgPD0gMHhERkZGKSB7XG4gICAgICAvLyBodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZyNzdXJyb2dhdGUtZm9ybXVsYWVcbiAgICAgIHJldHVybiAoZmlyc3QgLSAweEQ4MDApICogMHg0MDAgKyBzZWNvbmQgLSAweERDMDAgKyAweDEwMDAwXG4gICAgfVxuICB9XG4gIHJldHVybiBmaXJzdFxufVxuXG5mdW5jdGlvbiBuZWVkSW5kZW50SW5kaWNhdG9yIChzdHJpbmc6IHN0cmluZykge1xuICBjb25zdCBsZWFkaW5nU3BhY2VSZSA9IC9eXFxuKiAvXG4gIHJldHVybiBsZWFkaW5nU3BhY2VSZS50ZXN0KHN0cmluZylcbn1cblxuY29uc3QgU1RZTEVfUExBSU4gPSAxXG5jb25zdCBTVFlMRV9TSU5HTEUgPSAyXG5jb25zdCBTVFlMRV9MSVRFUkFMID0gM1xuY29uc3QgU1RZTEVfRk9MREVEID0gNFxuY29uc3QgU1RZTEVfRE9VQkxFID0gNVxuXG50eXBlIFNjYWxhclN0eWxlSWQgPVxuICB0eXBlb2YgU1RZTEVfUExBSU4gfFxuICB0eXBlb2YgU1RZTEVfU0lOR0xFIHxcbiAgdHlwZW9mIFNUWUxFX0xJVEVSQUwgfFxuICB0eXBlb2YgU1RZTEVfRk9MREVEIHxcbiAgdHlwZW9mIFNUWUxFX0RPVUJMRVxuXG4vLyBEZXRlcm1pbmVzIHdoaWNoIHNjYWxhciBzdHlsZXMgYXJlIHBvc3NpYmxlIGFuZCByZXR1cm5zIHRoZSBwcmVmZXJyZWQgc3R5bGUuXG4vLyBsaW5lV2lkdGggPSAtMSA9PiBubyBsaW1pdC5cbi8vIFByZS1jb25kaXRpb25zOiBzdHIubGVuZ3RoID4gMC5cbi8vIFBvc3QtY29uZGl0aW9uczpcbi8vICAgIFNUWUxFX1BMQUlOIG9yIFNUWUxFX1NJTkdMRSA9PiBubyBcXG4gYXJlIGluIHRoZSBzdHJpbmcuXG4vLyAgICBTVFlMRV9MSVRFUkFMID0+IG5vIGxpbmVzIGFyZSBzdWl0YWJsZSBmb3IgZm9sZGluZyAob3IgbGluZVdpZHRoIGlzIC0xKS5cbi8vICAgIFNUWUxFX0ZPTERFRCA9PiBhIGxpbmUgPiBsaW5lV2lkdGggYW5kIGNhbiBiZSBmb2xkZWQgKGFuZCBsaW5lV2lkdGggIT0gLTEpLlxuZnVuY3Rpb24gY2hvb3NlU2NhbGFyU3R5bGUgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgc3RyaW5nOiBzdHJpbmcsIGxheW91dDogUmV0dXJuVHlwZTx0eXBlb2Ygc2NhbGFyTGF5b3V0PixcbiAgc2luZ2xlTGluZU9ubHk6IGJvb2xlYW4sIGZvcmNlUXVvdGU6IGJvb2xlYW4sIGluYmxvY2s6IGJvb2xlYW4pOiBTY2FsYXJTdHlsZUlkIHtcbiAgY29uc3QgeyBibG9ja0luZGVudCwgbGluZVdpZHRoIH0gPSBsYXlvdXRcbiAgbGV0IGlcbiAgbGV0IGNoYXIgPSAwXG4gIGxldCBwcmV2Q2hhciA9IC0xIC8vIC0xID0gbm8gcHJldmlvdXMgY2hhcmFjdGVyIHlldCAoc2VlIGlzUGxhaW5TYWZlKVxuICBsZXQgaGFzTGluZUJyZWFrID0gZmFsc2VcbiAgbGV0IGhhc0ZvbGRhYmxlTGluZSA9IGZhbHNlIC8vIG9ubHkgY2hlY2tlZCBpZiBzaG91bGRUcmFja1dpZHRoXG4gIGNvbnN0IHNob3VsZFRyYWNrV2lkdGggPSBsaW5lV2lkdGggIT09IC0xXG4gIGxldCBwcmV2aW91c0xpbmVCcmVhayA9IC0xIC8vIGNvdW50IHRoZSBmaXJzdCBsaW5lIGNvcnJlY3RseVxuICAvLyBEb2N1bWVudCBtYXJrZXJzIGFyZSByZWNvZ25pemVkIGFzIHdob2xlIHRva2VucyBhdCB0aGUgc3RhcnQgb2YgYSBsaW5lLFxuICAvLyBzbyBjaGFyYWN0ZXItbGV2ZWwgcGxhaW4tc2NhbGFyIGNoZWNrcyBhbG9uZSBjYW5ub3QgcmVqZWN0IHRoZW0uXG4gIGxldCBwbGFpbiA9ICFzdGFydHNXaXRoRG9jdW1lbnRTZXBhcmF0b3Ioc3RyaW5nKSAmJlxuICAgIGlzUGxhaW5TYWZlQXRTdGFydChzdHJpbmcsIGluYmxvY2spICYmXG4gICAgaXNQbGFpblNhZmVMYXN0KGNvZGVQb2ludEF0KHN0cmluZywgc3RyaW5nLmxlbmd0aCAtIDEpKVxuXG4gIGlmIChzaW5nbGVMaW5lT25seSB8fCBmb3JjZVF1b3RlKSB7XG4gICAgLy8gQ2FzZTogbm8gYmxvY2sgc3R5bGVzLlxuICAgIC8vIENoZWNrIGZvciBkaXNhbGxvd2VkIGNoYXJhY3RlcnMgdG8gcnVsZSBvdXQgcGxhaW4gYW5kIHNpbmdsZS5cbiAgICBmb3IgKGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgY2hhciA+PSAweDEwMDAwID8gaSArPSAyIDogaSsrKSB7XG4gICAgICBjaGFyID0gY29kZVBvaW50QXQoc3RyaW5nLCBpKVxuICAgICAgaWYgKCFpc1ByaW50YWJsZShjaGFyKSkge1xuICAgICAgICByZXR1cm4gU1RZTEVfRE9VQkxFXG4gICAgICB9XG4gICAgICBwbGFpbiA9IHBsYWluICYmIGlzUGxhaW5TYWZlKGNoYXIsIHByZXZDaGFyLCBpbmJsb2NrKVxuICAgICAgcHJldkNoYXIgPSBjaGFyXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIENhc2U6IGJsb2NrIHN0eWxlcyBwZXJtaXR0ZWQuXG4gICAgZm9yIChpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGNoYXIgPj0gMHgxMDAwMCA/IGkgKz0gMiA6IGkrKykge1xuICAgICAgY2hhciA9IGNvZGVQb2ludEF0KHN0cmluZywgaSlcbiAgICAgIGlmIChjaGFyID09PSBDSEFSX0xJTkVfRkVFRCkge1xuICAgICAgICBoYXNMaW5lQnJlYWsgPSB0cnVlXG4gICAgICAgIC8vIENoZWNrIGlmIGFueSBsaW5lIGNhbiBiZSBmb2xkZWQuXG4gICAgICAgIGlmIChzaG91bGRUcmFja1dpZHRoKSB7XG4gICAgICAgICAgaGFzRm9sZGFibGVMaW5lID0gaGFzRm9sZGFibGVMaW5lIHx8XG4gICAgICAgICAgICAvLyBGb2xkYWJsZSBsaW5lID0gdG9vIGxvbmcsIGFuZCBub3QgbW9yZS1pbmRlbnRlZC5cbiAgICAgICAgICAgIChpIC0gcHJldmlvdXNMaW5lQnJlYWsgLSAxID4gbGluZVdpZHRoICYmXG4gICAgICAgICAgICAgc3RyaW5nW3ByZXZpb3VzTGluZUJyZWFrICsgMV0gIT09ICcgJylcbiAgICAgICAgICBwcmV2aW91c0xpbmVCcmVhayA9IGlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghaXNQcmludGFibGUoY2hhcikpIHtcbiAgICAgICAgcmV0dXJuIFNUWUxFX0RPVUJMRVxuICAgICAgfVxuICAgICAgcGxhaW4gPSBwbGFpbiAmJiBpc1BsYWluU2FmZShjaGFyLCBwcmV2Q2hhciwgaW5ibG9jaylcbiAgICAgIHByZXZDaGFyID0gY2hhclxuICAgIH1cbiAgICAvLyBpbiBjYXNlIHRoZSBlbmQgaXMgbWlzc2luZyBhIFxcblxuICAgIGhhc0ZvbGRhYmxlTGluZSA9IGhhc0ZvbGRhYmxlTGluZSB8fCAoc2hvdWxkVHJhY2tXaWR0aCAmJlxuICAgICAgKGkgLSBwcmV2aW91c0xpbmVCcmVhayAtIDEgPiBsaW5lV2lkdGggJiZcbiAgICAgICBzdHJpbmdbcHJldmlvdXNMaW5lQnJlYWsgKyAxXSAhPT0gJyAnKSlcbiAgfVxuICAvLyBBbHRob3VnaCBldmVyeSBzdHlsZSBjYW4gcmVwcmVzZW50IFxcbiB3aXRob3V0IGVzY2FwaW5nLCBwcmVmZXIgYmxvY2sgc3R5bGVzXG4gIC8vIGZvciBtdWx0aWxpbmUsIHNpbmNlIHRoZXkncmUgbW9yZSByZWFkYWJsZSBhbmQgdGhleSBkb24ndCBhZGQgZW1wdHkgbGluZXMuXG4gIC8vIEFsc28gcHJlZmVyIGZvbGRpbmcgYSBzdXBlci1sb25nIGxpbmUuXG4gIGlmICghaGFzTGluZUJyZWFrICYmICFoYXNGb2xkYWJsZUxpbmUpIHtcbiAgICAvLyBTeW50YWN0aWMgdmVyZGljdCBvbmx5OiB3aGV0aGVyIHRoZSBiYXJlIHRleHQgcm91bmQtdHJpcHMgdG8gdGhlIG5vZGUnc1xuICAgIC8vIHRhZyBpcyBhIHNlbWFudGljIGNoZWNrIHRoZSBjYWxsZXIgYXBwbGllcyAoc2VlIHJlc29sdmVTY2FsYXJTdHlsZSkuXG4gICAgaWYgKHBsYWluICYmICFmb3JjZVF1b3RlKSByZXR1cm4gU1RZTEVfUExBSU5cbiAgICByZXR1cm4gc3RhdGUucXVvdGVTdHlsZSA9PT0gJ2RvdWJsZScgPyBTVFlMRV9ET1VCTEUgOiBTVFlMRV9TSU5HTEVcbiAgfVxuICAvLyBFZGdlIGNhc2U6IGJsb2NrIGluZGVudGF0aW9uIGluZGljYXRvciBjYW4gb25seSBoYXZlIG9uZSBkaWdpdC5cbiAgaWYgKGJsb2NrSW5kZW50ID4gOSAmJiBuZWVkSW5kZW50SW5kaWNhdG9yKHN0cmluZykpIHtcbiAgICByZXR1cm4gU1RZTEVfRE9VQkxFXG4gIH1cbiAgLy8gQXQgdGhpcyBwb2ludCB3ZSBrbm93IGJsb2NrIHN0eWxlcyBhcmUgdmFsaWQuXG4gIC8vIFByZWZlciBsaXRlcmFsIHN0eWxlIHVubGVzcyB3ZSB3YW50IHRvIGZvbGQuXG4gIHJldHVybiBoYXNGb2xkYWJsZUxpbmUgPyBTVFlMRV9GT0xERUQgOiBTVFlMRV9MSVRFUkFMXG59XG5cbi8vIFJlbmRlcnMgYHN0cmluZ2AgaW4gdGhlIGdpdmVuIG51bWVyaWMgc3R5bGUgd2l0aCB0aGUgZ2l2ZW4gbGF5b3V0LlxuLy8gTkIuIFdlIGRyb3AgdGhlIGxhc3QgdHJhaWxpbmcgbmV3bGluZSAoaWYgYW55KSBvZiBhIHJldHVybmVkIGJsb2NrIHNjYWxhclxuLy8gIHNpbmNlIHRoZSBkdW1wZXIgYWRkcyBpdHMgb3duIG5ld2xpbmUuIFRoaXMgYWx3YXlzIHdvcmtzOlxuLy8gICAg4oCiIE5vIGVuZGluZyBuZXdsaW5lID0+IHVuYWZmZWN0ZWQ7IGFscmVhZHkgdXNpbmcgc3RyaXAgXCItXCIgY2hvbXBpbmcuXG4vLyAgICDigKIgRW5kaW5nIG5ld2xpbmUgICAgPT4gcmVtb3ZlZCB0aGVuIHJlc3RvcmVkLlxuLy8gIEltcG9ydGFudGx5LCB0aGlzIGtlZXBzIHRoZSBcIitcIiBjaG9tcCBpbmRpY2F0b3IgZnJvbSBnYWluaW5nIGFuIGV4dHJhIGxpbmUuXG5mdW5jdGlvbiByZW5kZXJTY2FsYXJTdHlsZSAoc3RyaW5nOiBzdHJpbmcsIHN0eWxlOiBTY2FsYXJTdHlsZUlkLCBsYXlvdXQ6IFJldHVyblR5cGU8dHlwZW9mIHNjYWxhckxheW91dD4pIHtcbiAgY29uc3QgeyBpbmRlbnQsIGJsb2NrSW5kZW50LCBsaW5lV2lkdGggfSA9IGxheW91dFxuXG4gIHN3aXRjaCAoc3R5bGUpIHtcbiAgICBjYXNlIFNUWUxFX1BMQUlOOlxuICAgICAgcmV0dXJuIGVuY29kZUZsb3dCcmVha3Moc3RyaW5nLCBpbmRlbnQpXG4gICAgY2FzZSBTVFlMRV9TSU5HTEU6XG4gICAgICByZXR1cm4gYCcke2VuY29kZUZsb3dCcmVha3Moc3RyaW5nLCBpbmRlbnQpLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYFxuICAgIGNhc2UgU1RZTEVfTElURVJBTDpcbiAgICAgIHJldHVybiAnfCcgKyBibG9ja0hlYWRlcihzdHJpbmcsIGJsb2NrSW5kZW50KSArXG4gICAgICAgIGRyb3BFbmRpbmdOZXdsaW5lKGluZGVudFN0cmluZyhzdHJpbmcsIGluZGVudCkpXG4gICAgY2FzZSBTVFlMRV9GT0xERUQ6XG4gICAgICByZXR1cm4gJz4nICsgYmxvY2tIZWFkZXIoc3RyaW5nLCBibG9ja0luZGVudCkgK1xuICAgICAgICBkcm9wRW5kaW5nTmV3bGluZShpbmRlbnRTdHJpbmcoZm9sZEJsb2NrU2NhbGFyKHN0cmluZywgbGluZVdpZHRoKSwgaW5kZW50KSlcbiAgICBjYXNlIFNUWUxFX0RPVUJMRTpcbiAgICAgIHJldHVybiBgXCIke2VzY2FwZVN0cmluZyhzdHJpbmcpfVwiYFxuICB9XG59XG5cbi8vIFBpY2tzIHRoZSBzY2FsYXIgc3R5bGUgZm9yIGBub2RlYDogYSBzdHlsZSBoaW50IGNhcnJpZWQgb24gdGhlIG5vZGUgd2lucyxcbi8vIG90aGVyd2lzZSB0aGUgc3R5bGUgY2hvc2VuIGJ5IHRoZSBtYWNoaW5lcnkuIFJldHVybnMgYSBudW1lcmljIFNUWUxFXyouXG5mdW5jdGlvbiByZXNvbHZlU2NhbGFyU3R5bGUgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgbm9kZTogU2NhbGFyTm9kZSxcbiAgbGF5b3V0OiBSZXR1cm5UeXBlPHR5cGVvZiBzY2FsYXJMYXlvdXQ+LCBpc2tleTogYm9vbGVhbiwgaW5ibG9jazogYm9vbGVhbik6IFNjYWxhclN0eWxlSWQge1xuICAvLyBXaXRob3V0IGtub3dpbmcgaWYga2V5cyBhcmUgaW1wbGljaXQvZXhwbGljaXQsIGFzc3VtZSBpbXBsaWNpdCBmb3Igc2FmZXR5LlxuICBjb25zdCBzaW5nbGVMaW5lT25seSA9IGlza2V5IHx8ICFpbmJsb2NrXG5cbiAgLy8gU3R5bGUgaGludHMgY2FycmllZCBvbiB0aGUgbm9kZSB0YWtlIHByZWNlZGVuY2UuIFRoZXkgd2VyZSB2YWxpZCBpbiB0aGVpclxuICAvLyBvcmlnaW5hbCBjb250ZXh0OyBvbmx5IGEgcGFyZW50IGNoYW5nZSBjYW4gYnJlYWsgdGhlbSwgYW5kIG9ubHkgYmxvY2tcbiAgLy8gc3R5bGVzIGluIGEgc2luZ2xlLWxpbmUgY29udGV4dCDigJQgcXVvdGVkIHN0eWxlcyBzdXJ2aXZlIGFueSBjb250ZXh0LiBBXG4gIC8vIHJlamVjdGVkIGJsb2NrIGhpbnQgZmFsbHMgdGhyb3VnaCB0byBzZWxlY3Rpb24gYnkgY29udGVudCBiZWxvdy5cbiAgaWYgKG5vZGUuc3R5bGUuc2luZ2xlUXVvdGVkKSByZXR1cm4gU1RZTEVfU0lOR0xFXG4gIGlmIChub2RlLnN0eWxlLmRvdWJsZVF1b3RlZCkgcmV0dXJuIFNUWUxFX0RPVUJMRVxuICBpZiAoIXNpbmdsZUxpbmVPbmx5KSB7XG4gICAgaWYgKG5vZGUuc3R5bGUubGl0ZXJhbCkgcmV0dXJuIFNUWUxFX0xJVEVSQUxcbiAgICBpZiAobm9kZS5zdHlsZS5mb2xkZWQpIHJldHVybiBTVFlMRV9GT0xERURcbiAgfVxuXG4gIGNvbnN0IHN0cmluZyA9IG5vZGUudmFsdWVcblxuICBpZiAoc3RyaW5nLmxlbmd0aCA9PT0gMCkge1xuICAgIC8vIEFuIGVtcHR5IHNjYWxhciBpcyBzYWZlIHdoZW4gaXRzIHRhZyBpcyBleHBsaWNpdCBvciByZXNvbHZlcyBiYWNrIHRvIHRoZVxuICAgIC8vIG5vZGUgdGFnIChub3RhYmx5LCB0aGUgZGVmYXVsdCBudWxsIHJlcHJlc2VudGF0aW9uKS4gQSByZWFsIGVtcHR5IHN0cmluZ1xuICAgIC8vIGRvZXMgbmVpdGhlciBhbmQgdGhlcmVmb3JlIHJlbWFpbnMgcXVvdGVkLlxuICAgIGlmIChub2RlLnN0eWxlLnRhZ2dlZCB8fCByZXNvbHZlSW1wbGljaXRUYWcoc3RhdGUsIHN0cmluZykgPT09IG5vZGUudGFnKSByZXR1cm4gU1RZTEVfUExBSU5cbiAgICByZXR1cm4gc3RhdGUucXVvdGVTdHlsZSA9PT0gJ2RvdWJsZScgPyBTVFlMRV9ET1VCTEUgOiBTVFlMRV9TSU5HTEVcbiAgfVxuXG4gIC8vIHY0J3MgZm9yY2VRdW90ZXMgZGVsaWJlcmF0ZWx5IGV4Y2x1ZGVkIGtleXMuIEtleXMgYXJlIHN0aWxsIHF1b3RlZCB3aGVuXG4gIC8vIHN5bnRheCBvciB0YWcgcmVzb2x1dGlvbiByZXF1aXJlcyBpdCwgdXNpbmcgcXVvdGVTdHlsZSBhcyB0aGUgcHJlZmVyZW5jZS5cbiAgY29uc3Qgc3R5bGUgPSBjaG9vc2VTY2FsYXJTdHlsZShcbiAgICBzdGF0ZSwgc3RyaW5nLCBsYXlvdXQsIHNpbmdsZUxpbmVPbmx5LCBzdGF0ZS5mb3JjZVF1b3RlcyAmJiAhaXNrZXksIGluYmxvY2spXG5cbiAgLy8gUGxhaW4gd3JpdGVzIG5vIHRhZywgc28gaXQgcm91bmQtdHJpcHMgb25seSBpZiB0aGUgYmFyZSB0ZXh0IHJlc29sdmVzIGJhY2tcbiAgLy8gdG8gdGhlIG5vZGUncyB0YWcgKG9yIHRoZSB0YWcgZ2V0cyBwcmludGVkIGV4cGxpY2l0bHkpLiBFbHNlIGRvd25ncmFkZS5cbiAgLy8gRG93bmdyYWRlIHRvIHRoZSBwcmVmZXJyZWQgcXVvdGUgc3R5bGUgaGVyZS5cbiAgaWYgKHN0eWxlID09PSBTVFlMRV9QTEFJTiAmJiAhbm9kZS5zdHlsZS50YWdnZWQgJiYgcmVzb2x2ZUltcGxpY2l0VGFnKHN0YXRlLCBzdHJpbmcpICE9PSBub2RlLnRhZykge1xuICAgIHJldHVybiBzdGF0ZS5xdW90ZVN0eWxlID09PSAnZG91YmxlJyA/IFNUWUxFX0RPVUJMRSA6IFNUWUxFX1NJTkdMRVxuICB9XG4gIHJldHVybiBzdHlsZVxufVxuXG4vLyBQcmUtY29uZGl0aW9uczogc3RyaW5nIGlzIHZhbGlkIGZvciBhIGJsb2NrIHNjYWxhciwgMSA8PSBpbmRlbnRQZXJMZXZlbCA8PSA5LlxuZnVuY3Rpb24gYmxvY2tIZWFkZXIgKHN0cmluZzogc3RyaW5nLCBpbmRlbnRQZXJMZXZlbDogbnVtYmVyKSB7XG4gIGNvbnN0IGluZGVudEluZGljYXRvciA9IG5lZWRJbmRlbnRJbmRpY2F0b3Ioc3RyaW5nKSA/IFN0cmluZyhpbmRlbnRQZXJMZXZlbCkgOiAnJ1xuXG4gIC8vIG5vdGUgdGhlIHNwZWNpYWwgY2FzZTogdGhlIHN0cmluZyAnXFxuJyBjb3VudHMgYXMgYSBcInRyYWlsaW5nXCIgZW1wdHkgbGluZS5cbiAgY29uc3QgY2xpcCA9IHN0cmluZ1tzdHJpbmcubGVuZ3RoIC0gMV0gPT09ICdcXG4nXG4gIGNvbnN0IGtlZXAgPSBjbGlwICYmIChzdHJpbmdbc3RyaW5nLmxlbmd0aCAtIDJdID09PSAnXFxuJyB8fCBzdHJpbmcgPT09ICdcXG4nKVxuICBjb25zdCBjaG9tcCA9IGtlZXAgPyAnKycgOiAoY2xpcCA/ICcnIDogJy0nKVxuXG4gIHJldHVybiBgJHtpbmRlbnRJbmRpY2F0b3J9JHtjaG9tcH1cXG5gXG59XG5cbi8vIEZsb3cgc2NhbGFycyAocGxhaW4sIHNpbmdsZS1xdW90ZWQpIGZvbGQgbGluZSBicmVha3M6IGEgcnVuIG9mIGsgc291cmNlIGxpbmVcbi8vIGJyZWFrcyByZXBhcnNlcyB0byBrLTEgbGl0ZXJhbCBgXFxuYC4gU28gYSBzaW5nbGUgYnJlYWsgaXMganVzdCBsaW5lLXdyYXBwaW5nXG4vLyAoZm9sZHMgYmFjayB0byBhIHNwYWNlKSwgd2hpbGUgYSBsaXRlcmFsIGBcXG5gIGluIHRoZSB2YWx1ZSBtdXN0IGJlIGVtaXR0ZWQgYXNcbi8vIGEgYmxhbmsgbGluZSAodHdvIGJyZWFrcykuIEVuY29kZSBlYWNoIHJ1biBvZiBwIGxpdGVyYWwgYFxcbmAgYXMgcCsxIGJyZWFrcyBhbmRcbi8vIGluZGVudCB0aGUgZm9sbG93aW5nIGNvbnRlbnQgbGluZSBzbyB0aGUgY29udGludWF0aW9uIGlzbid0IHJlYWQgYXMgYSBuZXcgbm9kZVxuLy8gKGEgYmFyZSBicmVhayB3b3VsZCB5aWVsZCBpbnZhbGlkIFwiZGVmaWNpZW50IGluZGVudGF0aW9uXCIgb3V0cHV0KS5cbi8vIGBmb2xkQmxvY2tTY2FsYXJgIGNhbid0IGJlIHJldXNlZCBoZXJlOiBpdCB0cmVhdHMgYSBsZWFkaW5nIHNwYWNlIGFzIGFcbi8vIFwibW9yZS1pbmRlbnRlZFwiIGxpbmUgYW5kIHN1cHByZXNzZXMgdGhlIGRvdWJsaW5nLCB3aGljaCBhIGZsb3cgc2NhbGFyIG11c3Qgbm90LlxuZnVuY3Rpb24gZW5jb2RlRmxvd0JyZWFrcyAoc3RyaW5nOiBzdHJpbmcsIGluZGVudDogbnVtYmVyKSB7XG4gIGxldCBuZXh0TEYgPSBzdHJpbmcuaW5kZXhPZignXFxuJylcbiAgaWYgKG5leHRMRiA9PT0gLTEpIHJldHVybiBzdHJpbmdcblxuICBjb25zdCBwYWQgPSAnICcucmVwZWF0KGluZGVudClcbiAgbGV0IHJlc3VsdCA9IHN0cmluZy5zbGljZSgwLCBuZXh0TEYpIC8vIGZpcnN0IGxpbmUgZm9sbG93cyB0aGUgcXVvdGUsIG5vIGluZGVudFxuXG4gIGNvbnN0IGxpbmVSZSA9IC8oXFxuKykoW15cXG5dKikvZ1xuICBsaW5lUmUubGFzdEluZGV4ID0gbmV4dExGXG4gIGxldCBtYXRjaFxuICB3aGlsZSAoKG1hdGNoID0gbGluZVJlLmV4ZWMoc3RyaW5nKSkpIHtcbiAgICBjb25zdCBicmVha3MgPSBtYXRjaFsxXS5sZW5ndGhcbiAgICBjb25zdCBsaW5lID0gbWF0Y2hbMl1cbiAgICAvLyBsaW5lID09PSAnJyBvbmx5IGF0IHRoZSBlbmQgKHRoZSBncmVlZHkgXFxuKyBsZWF2ZXMgbm8gZW1wdHkgbGluZSBtaWQtc3RyaW5nKTtcbiAgICAvLyBwYWQgaXQgc28gdGhlIGNsb3NpbmcgcXVvdGUgY2FycmllcyBpbmRlbnQgaW5zdGVhZCBvZiBzaXR0aW5nIGF0IGNvbHVtbiAwLlxuICAgIHJlc3VsdCArPSAnXFxuJy5yZXBlYXQoYnJlYWtzICsgMSkgKyBwYWQgKyBsaW5lXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbi8vIFN0cmlwcyBvbmUgdHJhaWxpbmcgbmV3bGluZSBmcm9tIGEgYmxvY2sgc2NhbGFyOiB0aGUgZHVtcGVyIGFkZHMgaXRzIG93bixcbi8vIHNvIHdpdGhvdXQgdGhpcyBhIFwiK1wiIChrZWVwKSBjaG9tcCB3b3VsZCBnYWluIGFuIGV4dHJhIGJsYW5rIGxpbmUuXG5mdW5jdGlvbiBkcm9wRW5kaW5nTmV3bGluZSAoc3RyaW5nOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZ1tzdHJpbmcubGVuZ3RoIC0gMV0gPT09ICdcXG4nID8gc3RyaW5nLnNsaWNlKDAsIC0xKSA6IHN0cmluZ1xufVxuXG4vLyBOb3RlOiBhIGxvbmcgbGluZSB3aXRob3V0IGEgc3VpdGFibGUgYnJlYWsgcG9pbnQgd2lsbCBleGNlZWQgdGhlIHdpZHRoIGxpbWl0LlxuLy8gUHJlLWNvbmRpdGlvbnM6IGV2ZXJ5IGNoYXIgaW4gc3RyIGlzUHJpbnRhYmxlLCBzdHIubGVuZ3RoID4gMCwgd2lkdGggPiAwLlxuZnVuY3Rpb24gZm9sZEJsb2NrU2NhbGFyIChzdHJpbmc6IHN0cmluZywgd2lkdGg6IG51bWJlcikge1xuICAvLyBJbiBmb2xkZWQgc3R5bGUsICRrJCBjb25zZWN1dGl2ZSBuZXdsaW5lcyBvdXRwdXQgYXMgJGsrMSQgbmV3bGluZXPigJRcbiAgLy8gdW5sZXNzIHRoZXkncmUgYmVmb3JlIG9yIGFmdGVyIGEgbW9yZS1pbmRlbnRlZCBsaW5lLCBvciBhdCB0aGUgdmVyeVxuICAvLyBiZWdpbm5pbmcgb3IgZW5kLCBpbiB3aGljaCBjYXNlICRrJCBtYXBzIHRvICRrJC5cbiAgLy8gVGhlcmVmb3JlLCBwYXJzZSBlYWNoIGNodW5rIGFzIG5ld2xpbmUocykgZm9sbG93ZWQgYnkgYSBjb250ZW50IGxpbmUuXG4gIGNvbnN0IGxpbmVSZSA9IC8oXFxuKykoW15cXG5dKikvZ1xuXG4gIC8vIGZpcnN0IGxpbmUgKHBvc3NpYmx5IGFuIGVtcHR5IGxpbmUpXG4gIGxldCBuZXh0TEYgPSBzdHJpbmcuaW5kZXhPZignXFxuJylcbiAgaWYgKG5leHRMRiA9PT0gLTEpIG5leHRMRiA9IHN0cmluZy5sZW5ndGhcbiAgbGluZVJlLmxhc3RJbmRleCA9IG5leHRMRlxuICBsZXQgcmVzdWx0ID0gZm9sZExpbmUoc3RyaW5nLnNsaWNlKDAsIG5leHRMRiksIHdpZHRoKVxuICAvLyBJZiB3ZSBoYXZlbid0IHJlYWNoZWQgdGhlIGZpcnN0IGNvbnRlbnQgbGluZSB5ZXQsIGRvbid0IGFkZCBhbiBleHRyYSBcXG4uXG4gIGxldCBwcmV2TW9yZUluZGVudGVkID0gc3RyaW5nWzBdID09PSAnXFxuJyB8fCBzdHJpbmdbMF0gPT09ICcgJ1xuICBsZXQgbW9yZUluZGVudGVkXG5cbiAgLy8gcmVzdCBvZiB0aGUgbGluZXNcbiAgbGV0IG1hdGNoXG4gIHdoaWxlICgobWF0Y2ggPSBsaW5lUmUuZXhlYyhzdHJpbmcpKSkge1xuICAgIGNvbnN0IHByZWZpeCA9IG1hdGNoWzFdXG4gICAgY29uc3QgbGluZSA9IG1hdGNoWzJdXG5cbiAgICBtb3JlSW5kZW50ZWQgPSAobGluZVswXSA9PT0gJyAnKVxuICAgIHJlc3VsdCArPSBwcmVmaXggK1xuICAgICAgKCghcHJldk1vcmVJbmRlbnRlZCAmJiAhbW9yZUluZGVudGVkICYmIGxpbmUgIT09ICcnKSA/ICdcXG4nIDogJycpICtcbiAgICAgIGZvbGRMaW5lKGxpbmUsIHdpZHRoKVxuICAgIHByZXZNb3JlSW5kZW50ZWQgPSBtb3JlSW5kZW50ZWRcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuLy8gR3JlZWR5IGxpbmUgYnJlYWtpbmcuXG4vLyBQaWNrcyB0aGUgbG9uZ2VzdCBsaW5lIHVuZGVyIHRoZSBsaW1pdCBlYWNoIHRpbWUsXG4vLyBvdGhlcndpc2Ugc2V0dGxlcyBmb3IgdGhlIHNob3J0ZXN0IGxpbmUgb3ZlciB0aGUgbGltaXQuXG4vLyBOQi4gTW9yZS1pbmRlbnRlZCBsaW5lcyAqY2Fubm90KiBiZSBmb2xkZWQsIGFzIHRoYXQgd291bGQgYWRkIGFuIGV4dHJhIFxcbi5cbmZ1bmN0aW9uIGZvbGRMaW5lIChsaW5lOiBzdHJpbmcsIHdpZHRoOiBudW1iZXIpIHtcbiAgaWYgKGxpbmUgPT09ICcnIHx8IGxpbmVbMF0gPT09ICcgJykgcmV0dXJuIGxpbmVcblxuICAvLyBTaW5jZSBhIG1vcmUtaW5kZW50ZWQgbGluZSBhZGRzIGEgXFxuLCBicmVha3MgY2FuJ3QgYmUgZm9sbG93ZWQgYnkgYSBzcGFjZS5cbiAgY29uc3QgYnJlYWtSZSA9IC8gW14gXS9nIC8vIG5vdGU6IHRoZSBtYXRjaCBpbmRleCB3aWxsIGFsd2F5cyBiZSA8PSBsZW5ndGgtMi5cbiAgbGV0IG1hdGNoXG4gIC8vIHN0YXJ0IGlzIGFuIGluY2x1c2l2ZSBpbmRleC4gZW5kLCBjdXJyLCBhbmQgbmV4dCBhcmUgZXhjbHVzaXZlLlxuICBsZXQgc3RhcnQgPSAwXG4gIGxldCBlbmRcbiAgbGV0IGN1cnIgPSAwXG4gIGxldCBuZXh0ID0gMFxuICBsZXQgcmVzdWx0ID0gJydcblxuICAvLyBJbnZhcmlhbnRzOiAwIDw9IHN0YXJ0IDw9IGxlbmd0aC0xLlxuICAvLyAgIDAgPD0gY3VyciA8PSBuZXh0IDw9IG1heCgwLCBsZW5ndGgtMikuIGN1cnIgLSBzdGFydCA8PSB3aWR0aC5cbiAgLy8gSW5zaWRlIHRoZSBsb29wOlxuICAvLyAgIEEgbWF0Y2ggaW1wbGllcyBsZW5ndGggPj0gMiwgc28gY3VyciBhbmQgbmV4dCBhcmUgPD0gbGVuZ3RoLTIuXG4gIHdoaWxlICgobWF0Y2ggPSBicmVha1JlLmV4ZWMobGluZSkpKSB7XG4gICAgbmV4dCA9IG1hdGNoLmluZGV4XG4gICAgLy8gbWFpbnRhaW4gaW52YXJpYW50OiBjdXJyIC0gc3RhcnQgPD0gd2lkdGhcbiAgICBpZiAobmV4dCAtIHN0YXJ0ID4gd2lkdGgpIHtcbiAgICAgIGVuZCA9IChjdXJyID4gc3RhcnQpID8gY3VyciA6IG5leHQgLy8gZGVyaXZlIGVuZCA8PSBsZW5ndGgtMlxuICAgICAgcmVzdWx0ICs9IGBcXG4ke2xpbmUuc2xpY2Uoc3RhcnQsIGVuZCl9YFxuICAgICAgLy8gc2tpcCB0aGUgc3BhY2UgdGhhdCB3YXMgb3V0cHV0IGFzIFxcblxuICAgICAgc3RhcnQgPSBlbmQgKyAxICAgICAgICAgICAgICAgICAgICAvLyBkZXJpdmUgc3RhcnQgPD0gbGVuZ3RoLTFcbiAgICB9XG4gICAgY3VyciA9IG5leHRcbiAgfVxuXG4gIC8vIEJ5IHRoZSBpbnZhcmlhbnRzLCBzdGFydCA8PSBsZW5ndGgtMSwgc28gdGhlcmUgaXMgc29tZXRoaW5nIGxlZnQgb3Zlci5cbiAgLy8gSXQgaXMgZWl0aGVyIHRoZSB3aG9sZSBzdHJpbmcgb3IgYSBwYXJ0IHN0YXJ0aW5nIGZyb20gbm9uLXdoaXRlc3BhY2UuXG4gIHJlc3VsdCArPSAnXFxuJ1xuICAvLyBJbnNlcnQgYSBicmVhayBpZiB0aGUgcmVtYWluZGVyIGlzIHRvbyBsb25nIGFuZCB0aGVyZSBpcyBhIGJyZWFrIGF2YWlsYWJsZS5cbiAgaWYgKGxpbmUubGVuZ3RoIC0gc3RhcnQgPiB3aWR0aCAmJiBjdXJyID4gc3RhcnQpIHtcbiAgICByZXN1bHQgKz0gYCR7bGluZS5zbGljZShzdGFydCwgY3Vycil9XFxuJHtsaW5lLnNsaWNlKGN1cnIgKyAxKX1gXG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ICs9IGxpbmUuc2xpY2Uoc3RhcnQpXG4gIH1cblxuICByZXR1cm4gcmVzdWx0LnNsaWNlKDEpIC8vIGRyb3AgZXh0cmEgXFxuIGpvaW5lclxufVxuXG5mdW5jdGlvbiBlc2NhcGVTdHJpbmcgKHN0cmluZzogc3RyaW5nKSB7XG4gIGxldCByZXN1bHQgPSAnJ1xuICBsZXQgY2hhciA9IDBcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGNoYXIgPj0gMHgxMDAwMCA/IGkgKz0gMiA6IGkrKykge1xuICAgIGNoYXIgPSBjb2RlUG9pbnRBdChzdHJpbmcsIGkpXG4gICAgY29uc3QgZXNjYXBlU2VxID0gRVNDQVBFX1NFUVVFTkNFU1tjaGFyXVxuXG4gICAgaWYgKGVzY2FwZVNlcSkge1xuICAgICAgcmVzdWx0ICs9IGVzY2FwZVNlcVxuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICBpZiAoaXNQcmludGFibGUoY2hhcikpIHtcbiAgICAgIHJlc3VsdCArPSBzdHJpbmdbaV1cbiAgICAgIGlmIChjaGFyID49IDB4MTAwMDApIHJlc3VsdCArPSBzdHJpbmdbaSArIDFdXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIHJlc3VsdCArPSBlbmNvZGVOb25QcmludGFibGUoY2hhcilcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG93U2VxdWVuY2UgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgbGV2ZWw6IG51bWJlciwgbm9kZTogU2VxdWVuY2VOb2RlKSB7XG4gIGxldCByZXN1bHQgPSAnJ1xuXG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gbm9kZS5pdGVtcy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgY29uc3QgaXRlbSA9IHdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwsIG5vZGUuaXRlbXNbaW5kZXhdLCB7fSlcbiAgICBpZiAocmVzdWx0ICE9PSAnJykgcmVzdWx0ICs9IGAsJHshc3RhdGUuZmxvd1NraXBDb21tYVNwYWNlID8gJyAnIDogJyd9YFxuICAgIHJlc3VsdCArPSBpdGVtXG4gIH1cblxuICBjb25zdCBwYWQgPSBzdGF0ZS5mbG93QnJhY2tldFBhZGRpbmcgJiYgcmVzdWx0ICE9PSAnJyA/ICcgJyA6ICcnXG4gIHJldHVybiBgWyR7cGFkfSR7cmVzdWx0fSR7cGFkfV1gXG59XG5cbmZ1bmN0aW9uIHdyaXRlQmxvY2tTZXF1ZW5jZSAoc3RhdGU6IFByZXNlbnRlclN0YXRlLCBsZXZlbDogbnVtYmVyLCBub2RlOiBTZXF1ZW5jZU5vZGUsIGNvbXBhY3Q6IGJvb2xlYW4pIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG5cbiAgZm9yIChsZXQgaW5kZXggPSAwLCBsZW5ndGggPSBub2RlLml0ZW1zLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCBpdGVtID0gd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCArIDEsIG5vZGUuaXRlbXNbaW5kZXhdLFxuICAgICAgeyBibG9jazogdHJ1ZSwgY29tcGFjdDogc3RhdGUuc2VxSW5saW5lRmlyc3QsIGlzYmxvY2tzZXE6IHRydWUgfSlcblxuICAgIGlmICghY29tcGFjdCB8fCByZXN1bHQgIT09ICcnKSB7XG4gICAgICByZXN1bHQgKz0gZ2VuZXJhdGVOZXh0TGluZShzdGF0ZSwgbGV2ZWwpXG4gICAgfVxuXG4gICAgLy8gTm8gdHJhaWxpbmcgc3BhY2Ugd2hlbiB0aGUgdmFsdWUgcmVuZGVycyBlbXB0eSAoZS5nLiBudWxsIOKGkiAnJykuXG4gICAgaWYgKGl0ZW0gPT09ICcnIHx8IENIQVJfTElORV9GRUVEID09PSBpdGVtLmNoYXJDb2RlQXQoMCkpIHtcbiAgICAgIHJlc3VsdCArPSAnLSdcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ICs9ICctICdcbiAgICB9XG5cbiAgICByZXN1bHQgKz0gaXRlbVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb3dNYXBwaW5nIChzdGF0ZTogUHJlc2VudGVyU3RhdGUsIGxldmVsOiBudW1iZXIsIG5vZGU6IE1hcHBpbmdOb2RlKSB7XG4gIGxldCByZXN1bHQgPSAnJ1xuICBjb25zdCBpdGVtcyA9IHNvcnRNYXBwaW5nSXRlbXMoc3RhdGUsIG5vZGUuaXRlbXMpXG5cbiAgZm9yIChjb25zdCB7IGtleSwgdmFsdWUgfSBvZiBpdGVtcykge1xuICAgIGxldCBwYWlyQnVmZmVyID0gJydcbiAgICBpZiAocmVzdWx0ICE9PSAnJykgcGFpckJ1ZmZlciArPSBgLCR7IXN0YXRlLmZsb3dTa2lwQ29tbWFTcGFjZSA/ICcgJyA6ICcnfWBcblxuICAgIGNvbnN0IGtleVRleHQgPSB3cml0ZU5vZGUoc3RhdGUsIGxldmVsLCBrZXksIHsgaXNrZXk6IHRydWUgfSlcbiAgICBjb25zdCBleHBsaWNpdFBhaXIgPSBrZXlUZXh0Lmxlbmd0aCA+IDEwMjRcblxuICAgIGlmIChleHBsaWNpdFBhaXIpIHtcbiAgICAgIHBhaXJCdWZmZXIgKz0gJz8gJ1xuICAgIH0gZWxzZSBpZiAoc3RhdGUucXVvdGVGbG93S2V5cykge1xuICAgICAgcGFpckJ1ZmZlciArPSAnXCInXG4gICAgfVxuXG4gICAgY29uc3QgdmFsdWVUZXh0ID0gd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCwgdmFsdWUsIHt9KVxuICAgIC8vIE5vIHNlcGFyYXRpbmcgc3BhY2Ugd2hlbiB0aGUgdmFsdWUgcmVuZGVycyBlbXB0eSAoZS5nLiBudWxsIOKGkiAnJykuXG4gICAgY29uc3Qgc2VwID0gc3RhdGUuZmxvd1NraXBDb2xvblNwYWNlIHx8IHZhbHVlVGV4dCA9PT0gJycgPyAnJyA6ICcgJ1xuXG4gICAgcGFpckJ1ZmZlciArPSBgJHtrZXlUZXh0fSR7c3RhdGUucXVvdGVGbG93S2V5cyAmJiAhZXhwbGljaXRQYWlyID8gJ1wiJyA6ICcnfToke3NlcH0ke3ZhbHVlVGV4dH1gXG5cbiAgICByZXN1bHQgKz0gcGFpckJ1ZmZlclxuICB9XG5cbiAgY29uc3QgcGFkID0gc3RhdGUuZmxvd0JyYWNrZXRQYWRkaW5nICYmIHJlc3VsdCAhPT0gJycgPyAnICcgOiAnJ1xuICByZXR1cm4gYHske3BhZH0ke3Jlc3VsdH0ke3BhZH19YFxufVxuXG4vLyBBIHNjYWxhciBrZXkgc29ydHMgYnkgaXRzIHRleHQ7IHRoZSBkZWZhdWx0IHNvcnQgYW5kIGEgY3VzdG9tIGNvbXBhcmF0b3IgYm90aFxuLy8gc2VlIHRoYXQsIG1hdGNoaW5nIHRoZSBvcmlnaW5hbCBrZXlzLWFycmF5IHNvcnQuXG5mdW5jdGlvbiBzb3J0S2V5VmFsdWUgKGtleTogTm9kZSk6IGFueSB7XG4gIHJldHVybiBrZXkua2luZCA9PT0gJ3NjYWxhcicgPyBrZXkudmFsdWUgOiBrZXlcbn1cblxuZnVuY3Rpb24gc29ydE1hcHBpbmdJdGVtcyAoc3RhdGU6IFByZXNlbnRlclN0YXRlLCBpdGVtczogTWFwcGluZ05vZGVbJ2l0ZW1zJ10pIHtcbiAgaWYgKCFzdGF0ZS5zb3J0S2V5cykgcmV0dXJuIGl0ZW1zXG5cbiAgY29uc3QgY29weSA9IGl0ZW1zLnNsaWNlKClcblxuICBpZiAoc3RhdGUuc29ydEtleXMgPT09IHRydWUpIHtcbiAgICBjb3B5LnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIGNvbnN0IHggPSBzb3J0S2V5VmFsdWUoYS5rZXkpXG4gICAgICBjb25zdCB5ID0gc29ydEtleVZhbHVlKGIua2V5KVxuICAgICAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgICAgIGlmICh4ID4geSkgcmV0dXJuIDFcbiAgICAgIHJldHVybiAwXG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBmbiA9IHN0YXRlLnNvcnRLZXlzXG4gICAgY29weS5zb3J0KChhLCBiKSA9PiBmbihzb3J0S2V5VmFsdWUoYS5rZXkpLCBzb3J0S2V5VmFsdWUoYi5rZXkpKSlcbiAgfVxuXG4gIHJldHVybiBjb3B5XG59XG5cbmZ1bmN0aW9uIHdyaXRlQmxvY2tNYXBwaW5nIChzdGF0ZTogUHJlc2VudGVyU3RhdGUsIGxldmVsOiBudW1iZXIsIG5vZGU6IE1hcHBpbmdOb2RlLCBjb21wYWN0OiBib29sZWFuKSB7XG4gIGxldCByZXN1bHQgPSAnJ1xuICBjb25zdCBpdGVtcyA9IHNvcnRNYXBwaW5nSXRlbXMoc3RhdGUsIG5vZGUuaXRlbXMpXG5cbiAgZm9yIChsZXQgaW5kZXggPSAwLCBsZW5ndGggPSBpdGVtcy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgbGV0IHBhaXJCdWZmZXIgPSAnJ1xuXG4gICAgaWYgKCFjb21wYWN0IHx8IHJlc3VsdCAhPT0gJycpIHtcbiAgICAgIHBhaXJCdWZmZXIgKz0gZ2VuZXJhdGVOZXh0TGluZShzdGF0ZSwgbGV2ZWwpXG4gICAgfVxuXG4gICAgY29uc3QgeyBrZXksIHZhbHVlIH0gPSBpdGVtc1tpbmRleF1cblxuICAgIC8vIEEgYmxvY2sga2V5IOKAlCBhIGJsb2NrIGNvbGxlY3Rpb24gKG1hcHBpbmcvc2VxdWVuY2UpIG9yIGEgYmxvY2sgc2NhbGFyXG4gICAgLy8gKGxpdGVyYWwvZm9sZGVkKSDigJQgY2FuJ3Qgc2l0IG9uIGEgYGtleTpgIGxpbmUsIHNvIGl0J3Mgd3JpdHRlbiB3aXRoIGJsb2NrXG4gICAgLy8gY29udGV4dCBhbmQgdGhlIHBhaXIgdGFrZXMgdGhlIGV4cGxpY2l0IGA/IGtleSAvIDogdmFsdWVgIGZvcm0uIEEgc2ltcGxlXG4gICAgLy8gc2NhbGFyIGtleSBzdGF5cyBpbmxpbmUgKGZsb3ctdnMtYmxvY2sgaXMgaW52aXNpYmxlIHRoZXJlKS5cbiAgICBjb25zdCBrZXlJc0Jsb2NrID1cbiAgICAgICgoa2V5LmtpbmQgPT09ICdtYXBwaW5nJyB8fCBrZXkua2luZCA9PT0gJ3NlcXVlbmNlJykgJiZcbiAgICAgICAgIWtleS5zdHlsZS5mbG93ICYmIGtleS5pdGVtcy5sZW5ndGggIT09IDApIHx8XG4gICAgICAoa2V5LmtpbmQgPT09ICdzY2FsYXInICYmIChrZXkuc3R5bGUubGl0ZXJhbCB8fCBrZXkuc3R5bGUuZm9sZGVkKSlcblxuICAgIC8vIFRoZSBgP2AvYDpgIGluZGljYXRvcnMgc2hpZnQgY29udGVudCByaWdodCBsaWtlIGEgYC1gLCBzbyBhIGJsb2NrIGtleSBvclxuICAgIC8vIHZhbHVlIHRoYXQgc3RheXMgb24gdGhlIGluZGljYXRvciBsaW5lIGtlZXBzIGl0cyBpbmRlbnRhdGlvbiB1bmRlclxuICAgIC8vIHNlcU5vSW5kZW50IChgaXNibG9ja3NlcWApLiBPbmUgdGhhdCBkcm9wcyB0byBpdHMgb3duIGxpbmUgKHRhZy9hbmNob3IpXG4gICAgLy8gY29sbGFwc2VzIHRvIHRoZSBwYXJlbnQgaW5kZW50LCBzbyBsZWF2ZSB0aGUgZmxhZyBvZmYgdGhlcmUuXG4gICAgY29uc3Qga2V5VGV4dCA9IGtleUlzQmxvY2tcbiAgICAgID8gd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCArIDEsIGtleSxcbiAgICAgICAgeyBibG9jazogdHJ1ZSwgY29tcGFjdDogdHJ1ZSwgaXNibG9ja3NlcTogIWNhbm5vdEJlQ29tcGFjdChzdGF0ZSwga2V5LCBsZXZlbCArIDEpIH0pXG4gICAgICA6IHdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwgKyAxLCBrZXksIHsgYmxvY2s6IHRydWUsIGNvbXBhY3Q6IHRydWUsIGlza2V5OiB0cnVlIH0pXG5cbiAgICAvLyBCbG9jayBrZXksIG92ZXItbG9uZyBrZXksIG9yIG11bHRpbGluZSBzY2FsYXIga2V5IGZvcmNlcyBleHBsaWNpdCBmb3JtLlxuICAgIC8vIE11bHRpbGluZSBpc24ndCBhIHNwZWMgcmVxdWlyZW1lbnQg4oCUIGp1c3QgbWF0Y2hlcyBweXlhbWwncyBzaW1wbGUta2V5IHJ1bGUuXG4gICAgY29uc3Qga2V5SGFzTGluZUJyZWFrID0ga2V5LmtpbmQgPT09ICdzY2FsYXInICYmIGtleS52YWx1ZS5pbmRleE9mKCdcXG4nKSAhPT0gLTFcbiAgICBjb25zdCBleHBsaWNpdFBhaXIgPSBrZXlJc0Jsb2NrIHx8IGtleUhhc0xpbmVCcmVhayB8fCBrZXlUZXh0Lmxlbmd0aCA+IDEwMjRcblxuICAgIGlmIChleHBsaWNpdFBhaXIpIHtcbiAgICAgIGlmIChrZXlUZXh0ICYmIENIQVJfTElORV9GRUVEID09PSBrZXlUZXh0LmNoYXJDb2RlQXQoMCkpIHtcbiAgICAgICAgcGFpckJ1ZmZlciArPSAnPydcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhaXJCdWZmZXIgKz0gJz8gJ1xuICAgICAgfVxuICAgIH1cblxuICAgIHBhaXJCdWZmZXIgKz0ga2V5VGV4dFxuXG4gICAgaWYgKGV4cGxpY2l0UGFpcikge1xuICAgICAgcGFpckJ1ZmZlciArPSBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlLCBsZXZlbClcbiAgICB9XG5cbiAgICBjb25zdCB2YWx1ZVRleHQgPSB3cml0ZU5vZGUoc3RhdGUsIGxldmVsICsgMSwgdmFsdWUsXG4gICAgICB7IGJsb2NrOiB0cnVlLCBjb21wYWN0OiBleHBsaWNpdFBhaXIsIGlzYmxvY2tzZXE6IGV4cGxpY2l0UGFpciAmJiAhY2Fubm90QmVDb21wYWN0KHN0YXRlLCB2YWx1ZSwgbGV2ZWwgKyAxKSB9KVxuXG4gICAgLy8gS2VlcCBhIHNwYWNlIGJlZm9yZSB0aGUgY29sb24gd2hlbiB0aGUga2V5IHRleHQgZW5kcyBpbiBhIGxlYWRpbmdcbiAgICAvLyBwcm9wZXJ0eSByYXRoZXIgdGhhbiBzY2FsYXIgY29udGVudCwgc28gdGhlIGNvbG9uIGNhbid0IGJlIHJlYWQgYXMgcGFydFxuICAgIC8vIG9mIGl0LiBUd28gY2FzZXM6IGFuIGlubGluZSBhbGlhcyBrZXkgKGAqYiA6IHZgKSwgYW5kIGFuIGVtcHR5IHNjYWxhciBrZXlcbiAgICAvLyB3aG9zZSB3aG9sZSB0ZXh0IGlzIGl0cyBhbmNob3IvdGFnIChgJmEgOmAsIGAhIXN0ciA6YCkg4oCUIHdpdGhvdXQgdGhlXG4gICAgLy8gc3BhY2UgYCZhOmAgcmVwYXJzZXMgYXMgYW4gYW5jaG9yZWQgdmFsdWUsIGRyb3BwaW5nIHRoZSBudWxsIGtleS5cbiAgICBjb25zdCBrZXlJc0JhcmVQcm9wcyA9IGtleS5raW5kID09PSAnc2NhbGFyJyAmJiBrZXkudmFsdWUgPT09ICcnICYmXG4gICAgICBrZXlUZXh0ICE9PSAnJyAmJlxuICAgICAga2V5VGV4dC5jaGFyQ29kZUF0KGtleVRleHQubGVuZ3RoIC0gMSkgIT09IENIQVJfU0lOR0xFX1FVT1RFICYmXG4gICAgICBrZXlUZXh0LmNoYXJDb2RlQXQoa2V5VGV4dC5sZW5ndGggLSAxKSAhPT0gQ0hBUl9ET1VCTEVfUVVPVEVcbiAgICBjb25zdCBrZXlDb2xvblNlcCA9ICFleHBsaWNpdFBhaXIgJiYgKGtleS5raW5kID09PSAnYWxpYXMnIHx8IGtleUlzQmFyZVByb3BzKSA/ICcgJyA6ICcnXG5cbiAgICAvLyBObyB0cmFpbGluZyBzcGFjZSB3aGVuIHRoZSB2YWx1ZSByZW5kZXJzIGVtcHR5IChlLmcuIG51bGwg4oaSICcnKS5cbiAgICBpZiAodmFsdWVUZXh0ID09PSAnJyB8fCBDSEFSX0xJTkVfRkVFRCA9PT0gdmFsdWVUZXh0LmNoYXJDb2RlQXQoMCkpIHtcbiAgICAgIHBhaXJCdWZmZXIgKz0gYCR7a2V5Q29sb25TZXB9OmBcbiAgICB9IGVsc2Uge1xuICAgICAgcGFpckJ1ZmZlciArPSBgJHtrZXlDb2xvblNlcH06IGBcbiAgICB9XG5cbiAgICBwYWlyQnVmZmVyICs9IHZhbHVlVGV4dFxuXG4gICAgcmVzdWx0ICs9IHBhaXJCdWZmZXJcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuLy8gV2hlcmUgYSBub2RlIHNpdHMgcmVsYXRpdmUgdG8gaXRzIHBhcmVudCDigJQgZHJpdmVzIGxheW91dC9zdHlsZSBkZWNpc2lvbnMuXG4vLyBBbGwgZmxhZ3MgZGVmYXVsdCB0byBmYWxzZSAodGhlIGZsb3ctY29udGV4dCwgbm9uLWtleSwgbm9uLWNvbXBhY3QgY2FzZSkuXG5pbnRlcmZhY2UgTm9kZUNvbnRleHQge1xuICBibG9jaz86IGJvb2xlYW4gICAgICAvLyBibG9jayBjb250ZXh0ICh2cyBmbG93KTsgcHJvcGFnYXRlcyBkb3dud2FyZFxuICBjb21wYWN0PzogYm9vbGVhbiAgICAvLyBtYXkgc3RhcnQgb24gdGhlIGN1cnJlbnQgbGluZSAobm8gbGVhZGluZyBuZXdsaW5lKVxuICBpc2tleT86IGJvb2xlYW4gICAgICAvLyBub2RlIGlzIGEgbWFwcGluZyBrZXlcbiAgaXNibG9ja3NlcT86IGJvb2xlYW4gLy8gY29udGVudCBmb2xsb3dzIGFuIGluZGljYXRvciAoYC1gLCBvciBgP2AvYDpgIGluIGFuXG4gICAgICAgICAgICAgICAgICAgICAgIC8vIGV4cGxpY2l0IHBhaXIpIHRoYXQgYWxyZWFkeSBzaGlmdGVkIGl0IHJpZ2h0OyBrZWVwc1xuICAgICAgICAgICAgICAgICAgICAgICAvLyBpdHMgaW5kZW50YXRpb24gdW5kZXIgc2VxTm9JbmRlbnRcbn1cblxuLy8gQSBub2RlIGNhbid0IHNpdCBjb21wYWN0IG9uIGl0cyBwYXJlbnQncyBpbmRpY2F0b3IgKGAtYC9gP2AvYDpgKSBsaW5lIHdoZW4gaXRcbi8vIGNhcnJpZXMgbGVhZGluZyBwcm9wcyAodGFnL2FuY2hvcikgdGhhdCB3b3VsZCBjb2xsaWRlIHdpdGggdGhlIGluZGljYXRvciwgb3Jcbi8vIHdoZW4gdGhlIGluZGVudCBzdGVwIGlzIHRvbyBuYXJyb3cgZm9yIHRoZSAyLWNoYXIgaW5kaWNhdG9yLiBTdWNoIGEgbm9kZSBkcm9wc1xuLy8gdG8gaXRzIG93biBsaW5lOyBhIGJsb2NrIGNvbGxlY3Rpb24gdGhhdCBkb2VzIHNvIGFsc28gY29sbGFwc2VzIGl0cyBzZXFOb0luZGVudFxuLy8gaW5kZW50YXRpb24gYmFjayB0byB0aGUgcGFyZW50LlxuZnVuY3Rpb24gY2Fubm90QmVDb21wYWN0IChzdGF0ZTogUHJlc2VudGVyU3RhdGUsIG5vZGU6IE5vZGUsIGxldmVsOiBudW1iZXIpIHtcbiAgcmV0dXJuIG5vZGUuc3R5bGUudGFnZ2VkIHx8IG5vZGUuYW5jaG9yICE9PSB1bmRlZmluZWQgfHwgKHN0YXRlLmluZGVudCA8IDIgJiYgbGV2ZWwgPiAwKVxufVxuXG5mdW5jdGlvbiB3cml0ZU5vZGUgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgbGV2ZWw6IG51bWJlciwgbm9kZTogTm9kZSwgY3R4OiBOb2RlQ29udGV4dCk6IHN0cmluZyB7XG4gIGlmIChub2RlLmtpbmQgPT09ICdhbGlhcycpIHJldHVybiBgKiR7bm9kZS5hbmNob3J9YFxuXG4gIGNvbnN0IHsgYmxvY2sgPSBmYWxzZSwgaXNrZXkgPSBmYWxzZSwgaXNibG9ja3NlcSA9IGZhbHNlIH0gPSBjdHhcbiAgbGV0IGNvbXBhY3QgPSBjdHguY29tcGFjdCA/PyBmYWxzZVxuXG4gIGNvbnN0IGhhc0FuY2hvciA9IG5vZGUuYW5jaG9yICE9PSB1bmRlZmluZWRcblxuICBpZiAoY2Fubm90QmVDb21wYWN0KHN0YXRlLCBub2RlLCBsZXZlbCkpIHtcbiAgICBjb21wYWN0ID0gZmFsc2VcbiAgfVxuXG4gIGxldCBib2R5OiBzdHJpbmdcbiAgbGV0IHNob3VsZFByaW50VGFnID0gbm9kZS5zdHlsZS50YWdnZWRcbiAgY29uc3QgdXNlQmxvY2tDb2xsZWN0aW9uID0gYmxvY2sgJiZcbiAgICAobm9kZS5raW5kID09PSAnbWFwcGluZycgfHwgbm9kZS5raW5kID09PSAnc2VxdWVuY2UnKSAmJlxuICAgICFub2RlLnN0eWxlLmZsb3cgJiYgbm9kZS5pdGVtcy5sZW5ndGggIT09IDBcblxuICBpZiAobm9kZS5raW5kID09PSAnbWFwcGluZycpIHtcbiAgICBpZiAodXNlQmxvY2tDb2xsZWN0aW9uKSB7XG4gICAgICBib2R5ID0gd3JpdGVCbG9ja01hcHBpbmcoc3RhdGUsIGxldmVsLCBub2RlLCBjb21wYWN0KVxuICAgIH0gZWxzZSB7XG4gICAgICBib2R5ID0gd3JpdGVGbG93TWFwcGluZyhzdGF0ZSwgbGV2ZWwsIG5vZGUpXG4gICAgfVxuICB9IGVsc2UgaWYgKG5vZGUua2luZCA9PT0gJ3NlcXVlbmNlJykge1xuICAgIGlmICh1c2VCbG9ja0NvbGxlY3Rpb24pIHtcbiAgICAgIGlmIChzdGF0ZS5zZXFOb0luZGVudCAmJiAhaXNibG9ja3NlcSAmJiBsZXZlbCA+IDApIHtcbiAgICAgICAgYm9keSA9IHdyaXRlQmxvY2tTZXF1ZW5jZShzdGF0ZSwgbGV2ZWwgLSAxLCBub2RlLCBjb21wYWN0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYm9keSA9IHdyaXRlQmxvY2tTZXF1ZW5jZShzdGF0ZSwgbGV2ZWwsIG5vZGUsIGNvbXBhY3QpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGJvZHkgPSB3cml0ZUZsb3dTZXF1ZW5jZShzdGF0ZSwgbGV2ZWwsIG5vZGUpXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGxheW91dCA9IHNjYWxhckxheW91dChzdGF0ZSwgbGV2ZWwpXG4gICAgY29uc3Qgc3R5bGUgPSByZXNvbHZlU2NhbGFyU3R5bGUoc3RhdGUsIG5vZGUsIGxheW91dCwgaXNrZXksIGJsb2NrKVxuICAgIGJvZHkgPSByZW5kZXJTY2FsYXJTdHlsZShub2RlLnZhbHVlLCBzdHlsZSwgbGF5b3V0KVxuICAgIHNob3VsZFByaW50VGFnID0gbm9kZS5zdHlsZS50YWdnZWQgfHwgKHN0eWxlICE9PSBTVFlMRV9QTEFJTiAmJiBub2RlLnRhZyAhPT0gc3RhdGUuZGVmYXVsdFNjYWxhclRhZ05hbWUpXG4gIH1cblxuICAvLyBBbiBpbmRpY2F0b3IgcGx1cyBpdHMgbWFuZGF0b3J5IHNlcGFyYXRvciBvY2N1cGllcyAyIGNvbHVtbnMuIEZvciB3aWRlclxuICAvLyBpbmRlbnRhdGlvbiwgcGFkIGEgY29tcGFjdCBibG9jayBjb2xsZWN0aW9uIHNvIGl0cyBmaXJzdCBpdGVtIHN0YXJ0cyBhdFxuICAvLyB0aGUgc2FtZSBjb2x1bW4gYXMgdGhlIGZvbGxvd2luZyBpdGVtcy5cbiAgaWYgKHVzZUJsb2NrQ29sbGVjdGlvbiAmJiBjb21wYWN0ICYmIGxldmVsID4gMCAmJiBzdGF0ZS5pbmRlbnQgPiAyKSB7XG4gICAgYm9keSA9IGAkeycgJy5yZXBlYXQoc3RhdGUuaW5kZW50IC0gMil9JHtib2R5fWBcbiAgfVxuXG4gIGlmIChzaG91bGRQcmludFRhZyB8fCBoYXNBbmNob3IpIHtcbiAgICBjb25zdCBwcm9wczogc3RyaW5nW10gPSBbXVxuICAgIGNvbnN0IHRhZyA9IHNob3VsZFByaW50VGFnID8gbm9kZVRhZ1Nob3J0KG5vZGUpIDogbnVsbFxuICAgIGNvbnN0IGFuY2hvciA9IGhhc0FuY2hvciA/IGAmJHtub2RlLmFuY2hvcn1gIDogbnVsbFxuXG4gICAgaWYgKHN0YXRlLnRhZ0JlZm9yZUFuY2hvcikge1xuICAgICAgaWYgKHRhZyAhPT0gbnVsbCkgcHJvcHMucHVzaCh0YWcpXG4gICAgICBpZiAoYW5jaG9yICE9PSBudWxsKSBwcm9wcy5wdXNoKGFuY2hvcilcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGFuY2hvciAhPT0gbnVsbCkgcHJvcHMucHVzaChhbmNob3IpXG4gICAgICBpZiAodGFnICE9PSBudWxsKSBwcm9wcy5wdXNoKHRhZylcbiAgICB9XG5cbiAgICAvLyBObyBzZXBhcmF0b3Igd2hlbiB0aGUgYm9keSBpcyBlbXB0eSAoZS5nLiBgJmFuY2hvcmAgb24gYSBudWxsIG5vZGUpIG9yXG4gICAgLy8gYWxyZWFkeSBzdGFydHMgb24gaXRzIG93biBsaW5lLlxuICAgIGNvbnN0IHNlcCA9IGJvZHkgPT09ICcnIHx8IGJvZHkuY2hhckNvZGVBdCgwKSA9PT0gQ0hBUl9MSU5FX0ZFRUQgPyAnJyA6ICcgJ1xuICAgIGJvZHkgPSBgJHtwcm9wcy5qb2luKCcgJyl9JHtzZXB9JHtib2R5fWBcbiAgfVxuXG4gIHJldHVybiBib2R5XG59XG5cbi8vIEEgYmFyZSAodW50YWdnZWQsIHVuYW5jaG9yZWQpIG5vbi1lbXB0eSBibG9jayBjb2xsZWN0aW9uOiB3cml0ZU5vZGUgcmVuZGVycyBpdFxuLy8gaW4gY29tcGFjdCBmb3JtIHdpdGggaXRzIGZpcnN0IGl0ZW0gb24gdGhlIG9wZW5pbmcgbGluZS4gVGhhdCB3b3JrcyBtaWQtc3RyZWFtLFxuLy8gYnV0IHJpZ2h0IGFmdGVyIGEgYC0tLWAgdGhlIGZpcnN0IGl0ZW0gbXVzdCBkcm9wIHRvIHRoZSBuZXh0IGxpbmUuIEEgdGFnL2FuY2hvclxuLy8gYWxyZWFkeSBmb3JjZXMgdGhlIGJvZHkgb250byBpdHMgb3duIGxpbmUsIHNvIHRob3NlIHN0YXkgb24gdGhlIGAtLS1gIGxpbmUuXG5mdW5jdGlvbiByb290U3RhcnRzT3duTGluZSAobm9kZTogTm9kZSkge1xuICByZXR1cm4gKG5vZGUua2luZCA9PT0gJ3NlcXVlbmNlJyB8fCBub2RlLmtpbmQgPT09ICdtYXBwaW5nJykgJiZcbiAgICAhbm9kZS5zdHlsZS5mbG93ICYmXG4gICAgbm9kZS5pdGVtcy5sZW5ndGggIT09IDAgJiZcbiAgICAhbm9kZS5zdHlsZS50YWdnZWQgJiZcbiAgICBub2RlLmFuY2hvciA9PT0gdW5kZWZpbmVkXG59XG5cbi8vIEEgZG9jdW1lbnQgd2hvc2Ugc2VyaWFsaXphdGlvbiBlbmRzIHdpdGggYSBrZWVwLWNob21wZWQgKGArYCkgYmxvY2sgc2NhbGFyIGlzXG4vLyBvcGVuLWVuZGVkOiB0aGUgdHJhaWxpbmcgYmxhbmsgbGluZShzKSB3b3VsZCBvdGhlcndpc2UgYmUgYW1iaWd1b3VzLCBzbyBpdFxuLy8gbmVlZHMgYSBgLi4uYCB0ZXJtaW5hdG9yLiBNaXJyb3JzIHRoZSBrZWVwIHRlc3QgaW4gYGJsb2NrSGVhZGVyYC5cbmZ1bmN0aW9uIGlzT3BlbkVuZGVkIChub2RlOiBOb2RlKSB7XG4gIC8vIERlc2NlbmQgdG8gdGhlIGxhc3QgbGVhZiwgYWx3YXlzIHRha2luZyB0aGUgbGFzdCBpdGVtIG9mIGEgYmxvY2sgY29sbGVjdGlvblxuICAvLyAoYSBmbG93IGNvbGxlY3Rpb24gcmVuZGVycyBvbiBvbmUgbGluZSwgc28gaXQgZW5kcyB0aGUgZG9jdW1lbnQgaXRzZWxmKS5cbiAgbGV0IGxlYWYgPSBub2RlXG4gIHdoaWxlICgobGVhZi5raW5kID09PSAnc2VxdWVuY2UnIHx8IGxlYWYua2luZCA9PT0gJ21hcHBpbmcnKSAmJlxuICAgICFsZWFmLnN0eWxlLmZsb3cgJiYgbGVhZi5pdGVtcy5sZW5ndGggIT09IDApIHtcbiAgICBsZWFmID0gbGVhZi5raW5kID09PSAnc2VxdWVuY2UnXG4gICAgICA/IGxlYWYuaXRlbXNbbGVhZi5pdGVtcy5sZW5ndGggLSAxXVxuICAgICAgOiBsZWFmLml0ZW1zW2xlYWYuaXRlbXMubGVuZ3RoIC0gMV0udmFsdWVcbiAgfVxuXG4gIGlmIChsZWFmLmtpbmQgIT09ICdzY2FsYXInIHx8ICEobGVhZi5zdHlsZS5saXRlcmFsIHx8IGxlYWYuc3R5bGUuZm9sZGVkKSkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGxlYWZcbiAgLy8gS2VlcCBjaG9tcGluZzogZW5kcyBpbiBhIGJsYW5rIGxpbmUgKGBcXG5cXG5gKSBvciBpcyBhIGxvbmUgYFxcbmAuXG4gIHJldHVybiB2YWx1ZS5lbmRzV2l0aCgnXFxuXFxuJykgfHwgdmFsdWUgPT09ICdcXG4nXG59XG5cbmZ1bmN0aW9uIHdyaXRlRG9jdW1lbnREaXJlY3RpdmVzIChkb2M6IERvY3VtZW50KSB7XG4gIGxldCByZXN1bHQgPSAnJ1xuXG4gIGZvciAoY29uc3QgZGlyZWN0aXZlIG9mIGRvYy5kaXJlY3RpdmVzKSB7XG4gICAgaWYgKGRpcmVjdGl2ZS5raW5kID09PSAneWFtbCcpIHtcbiAgICAgIHJlc3VsdCArPSBgJVlBTUwgJHtkaXJlY3RpdmUudmVyc2lvbn1cXG5gXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIGNvbnN0IHsgaGFuZGxlLCBwcmVmaXggfSA9IGRpcmVjdGl2ZVxuICAgIHJlc3VsdCArPSBgJVRBRyAke2hhbmRsZX0gJHtwcmVmaXh9XFxuYFxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG4vLyBEb2N1bWVudHMg4oaSIHRleHQsIGluY2x1ZGluZyB0aGUgdHJhaWxpbmcgbmV3bGluZS5cbmZ1bmN0aW9uIHByZXNlbnQgKGRvY3VtZW50czogRG9jdW1lbnRbXSwgb3B0aW9uczogUHJlc2VudGVyT3B0aW9ucyk6IHN0cmluZyB7XG4gIGNvbnN0IHN0YXRlID0gY3JlYXRlUHJlc2VudGVyU3RhdGUob3B0aW9ucylcbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGxldCBwcmV2aW91c0VuZGVkID0gZmFsc2VcblxuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZG9jdW1lbnRzLmxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGNvbnN0IGRvYyA9IGRvY3VtZW50c1tpbmRleF1cbiAgICBjb25zdCBkaXJlY3RpdmVzID0gd3JpdGVEb2N1bWVudERpcmVjdGl2ZXMoZG9jKVxuICAgIGNvbnN0IGhhc0RpcmVjdGl2ZXMgPSBkaXJlY3RpdmVzICE9PSAnJ1xuICAgIGNvbnN0IG1hcmtlciA9IGRvYy5leHBsaWNpdFN0YXJ0IHx8IGhhc0RpcmVjdGl2ZXMgfHwgKGluZGV4ID4gMCAmJiAhcHJldmlvdXNFbmRlZClcblxuICAgIHJlc3VsdCArPSBkaXJlY3RpdmVzXG5cbiAgICBpZiAoZG9jLmNvbnRlbnRzID09PSBudWxsKSB7XG4gICAgICBpZiAobWFya2VyKSByZXN1bHQgKz0gJy0tLVxcbidcbiAgICB9IGVsc2UgaWYgKG1hcmtlcikge1xuICAgICAgY29uc3QgYm9keSA9IHdyaXRlTm9kZShzdGF0ZSwgMCwgZG9jLmNvbnRlbnRzLCB7IGJsb2NrOiB0cnVlLCBjb21wYWN0OiB0cnVlIH0pXG4gICAgICAvLyBDb250ZW50IHNoYXJlcyB0aGUgYC0tLWAgbGluZSwgZXhjZXB0OiBhbiBlbXB0eSByZW5kZXIgKG5vIHNlcGFyYXRvciBhdFxuICAgICAgLy8gYWxsKSwgYSBiYXJlIGJsb2NrIGNvbGxlY3Rpb24gKHdyYXBzIHRvIHRoZSBuZXh0IGxpbmUpLCBvciBkaXJlY3RpdmVzXG4gICAgICAvLyBmb3JjaW5nIGAtLS1gIG9udG8gaXRzIG93biBsaW5lLlxuICAgICAgY29uc3Qgc2VwID0gYm9keSA9PT0gJycgPyAnJyA6IChoYXNEaXJlY3RpdmVzIHx8IHJvb3RTdGFydHNPd25MaW5lKGRvYy5jb250ZW50cykgPyAnXFxuJyA6ICcgJylcbiAgICAgIHJlc3VsdCArPSBgLS0tJHtzZXB9JHtib2R5fVxcbmBcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ICs9IHdyaXRlTm9kZShzdGF0ZSwgMCwgZG9jLmNvbnRlbnRzLCB7IGJsb2NrOiB0cnVlLCBjb21wYWN0OiB0cnVlIH0pICsgJ1xcbidcbiAgICB9XG5cbiAgICBwcmV2aW91c0VuZGVkID0gZG9jLmV4cGxpY2l0RW5kIHx8IChkb2MuY29udGVudHMgIT09IG51bGwgJiYgaXNPcGVuRW5kZWQoZG9jLmNvbnRlbnRzKSlcbiAgICBpZiAocHJldmlvdXNFbmRlZCkge1xuICAgICAgcmVzdWx0ICs9ICcuLi5cXG4nXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5leHBvcnQge1xuICBERUZBVUxUX1BSRVNFTlRFUl9PUFRJT05TLFxuICBwcmVzZW50LFxuICB0eXBlIFByZXNlbnRlck9wdGlvbnNcbn1cbiIsICJpbXBvcnQgeyBZQU1MMTFfU0NIRU1BLCB0eXBlIFNjaGVtYSB9IGZyb20gJy4vc2NoZW1hLnRzJ1xuaW1wb3J0IHsganNUb0FzdCB9IGZyb20gJy4vYXN0L2Zyb21fanMudHMnXG5pbXBvcnQgeyB2aXNpdCwgVklTSVRfU0tJUCB9IGZyb20gJy4vYXN0L3Zpc2l0LnRzJ1xuaW1wb3J0IHsgdHlwZSBEb2N1bWVudCB9IGZyb20gJy4vYXN0L25vZGVzLnRzJ1xuaW1wb3J0IHtcbiAgREVGQVVMVF9QUkVTRU5URVJfT1BUSU9OUyxcbiAgcHJlc2VudCxcbiAgdHlwZSBQcmVzZW50ZXJPcHRpb25zXG59IGZyb20gJy4vYXN0L3ByZXNlbnRlci50cydcbmltcG9ydCB7IHBpY2sgfSBmcm9tICcuL2NvbW1vbi9vYmplY3QudHMnXG5pbXBvcnQgeyBOT1RfUkVTT0xWRUQgfSBmcm9tICcuL3RhZy50cydcbmltcG9ydCB7IGludENvcmVUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvaW50X2NvcmUudHMnXG5pbXBvcnQgeyBpbnRZYW1sMTFUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvaW50X3lhbWwxMS50cydcbmltcG9ydCB7IGZsb2F0Q29yZVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9mbG9hdF9jb3JlLnRzJ1xuaW1wb3J0IHsgZmxvYXRZYW1sMTFUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvZmxvYXRfeWFtbDExLnRzJ1xuXG5pbnRlcmZhY2UgRHVtcE9wdGlvbnMgZXh0ZW5kcyBPbWl0PFByZXNlbnRlck9wdGlvbnMsICdzY2hlbWEnPiB7XG4gIHNjaGVtYT86IFNjaGVtYVxuICBza2lwSW52YWxpZD86IGJvb2xlYW5cbiAgbm9SZWZzPzogYm9vbGVhblxuICBmbG93TGV2ZWw/OiBudW1iZXJcbiAgdHJhbnNmb3JtPzogKGRvY3VtZW50czogRG9jdW1lbnRbXSkgPT4gdm9pZFxufVxuXG4vLyBZQU1MIDEuMSBtaXNzZXMgWUFNTCAxLjIgYDBvLi4uYCBpbnRzIGFuZCBleHBvbmVudC1vbmx5IGZsb2F0cy5cbi8vIENvbWJpbmUgcmVzb2x2ZXJzIHNvIGFsbCBwb3NzaWJsZSBjb2xsaXNpb25zIGFyZSBxdW90ZWQuXG5jb25zdCBERUZBVUxUX0RVTVBfU0NIRU1BID0gWUFNTDExX1NDSEVNQS53aXRoVGFncyhcbiAge1xuICAgIC4uLmludFlhbWwxMVRhZyxcbiAgICByZXNvbHZlOiAoc291cmNlLCBpc0V4cGxpY2l0LCB0YWdOYW1lKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBpbnRZYW1sMTFUYWcucmVzb2x2ZShzb3VyY2UsIGlzRXhwbGljaXQsIHRhZ05hbWUpXG4gICAgICByZXR1cm4gcmVzdWx0ID09PSBOT1RfUkVTT0xWRUQgPyBpbnRDb3JlVGFnLnJlc29sdmUoc291cmNlLCBpc0V4cGxpY2l0LCB0YWdOYW1lKSA6IHJlc3VsdFxuICAgIH1cbiAgfSxcbiAge1xuICAgIC4uLmZsb2F0WWFtbDExVGFnLFxuICAgIHJlc29sdmU6IChzb3VyY2UsIGlzRXhwbGljaXQsIHRhZ05hbWUpID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGZsb2F0WWFtbDExVGFnLnJlc29sdmUoc291cmNlLCBpc0V4cGxpY2l0LCB0YWdOYW1lKVxuICAgICAgcmV0dXJuIHJlc3VsdCA9PT0gTk9UX1JFU09MVkVEID8gZmxvYXRDb3JlVGFnLnJlc29sdmUoc291cmNlLCBpc0V4cGxpY2l0LCB0YWdOYW1lKSA6IHJlc3VsdFxuICAgIH1cbiAgfVxuKVxuXG5jb25zdCBERUZBVUxUX0RVTVBfT1BUSU9OUzogUmVxdWlyZWQ8RHVtcE9wdGlvbnM+ID0ge1xuICAuLi5ERUZBVUxUX1BSRVNFTlRFUl9PUFRJT05TLFxuICBzY2hlbWE6IERFRkFVTFRfRFVNUF9TQ0hFTUEsXG4gIHNraXBJbnZhbGlkOiBmYWxzZSxcbiAgbm9SZWZzOiBmYWxzZSxcbiAgZmxvd0xldmVsOiAtMSxcbiAgdHJhbnNmb3JtOiAoKSA9PiB7fVxufVxuXG4vLyBPcHRpb25zIHRoYXQgbmVlZCB0aGUgSlMgdmFsdWUgKHRhZ3MsIGZvcm1hdCwgZGVkdXApIGdvIHRvIGBqc1RvQXN0YDsgcHVyZWx5XG4vLyBwcmVzZW50YXRpb25hbCBvbmVzIGdvIHRvIGBwcmVzZW50YC5cbmZ1bmN0aW9uIGR1bXAgKGlucHV0OiBhbnksIG9wdGlvbnM6IER1bXBPcHRpb25zID0ge30pIHtcbiAgY29uc3Qgb3B0cyA9IHsgLi4uREVGQVVMVF9EVU1QX09QVElPTlMsIC4uLm9wdGlvbnMgfVxuXG4gIGNvbnN0IGRvY3VtZW50cyA9IGpzVG9Bc3QoaW5wdXQsIG9wdHMuc2NoZW1hLCB7XG4gICAgbm9SZWZzOiBvcHRzLm5vUmVmcyxcbiAgICBza2lwSW52YWxpZDogb3B0cy5za2lwSW52YWxpZFxuICB9KVxuXG4gIC8vIGZsb3dMZXZlbDogZXZlcnkgbm9kZSBhdCB0aGlzIGRlcHRoIHN3aXRjaGVzIHRvIGZsb3c7IHRoZSBwcmVzZW50ZXIgZm9yY2VzXG4gIC8vIGV2ZXJ5dGhpbmcgYmVsb3cgaW50byBmbG93IHRvbywgc28gdGhlIHdhbGsgc3RvcHMgdGhlcmUuXG4gIGlmIChvcHRzLmZsb3dMZXZlbCA+PSAwKSB7XG4gICAgdmlzaXQoZG9jdW1lbnRzLCAobm9kZSwgY3R4KSA9PiB7XG4gICAgICBpZiAoY3R4LmRlcHRoIDwgb3B0cy5mbG93TGV2ZWwpIHJldHVyblxuICAgICAgbm9kZS5zdHlsZS5mbG93ID0gdHJ1ZVxuICAgICAgcmV0dXJuIFZJU0lUX1NLSVBcbiAgICB9KVxuICB9XG5cbiAgb3B0cy50cmFuc2Zvcm0oZG9jdW1lbnRzKVxuXG4gIGNvbnN0IFBSRVNFTlRFUl9PUFRfS0VZUyA9IE9iamVjdC5rZXlzKERFRkFVTFRfUFJFU0VOVEVSX09QVElPTlMpIGFzXG4gICAgKGtleW9mIHR5cGVvZiBERUZBVUxUX1BSRVNFTlRFUl9PUFRJT05TKVtdXG5cbiAgcmV0dXJuIHByZXNlbnQoZG9jdW1lbnRzLCB7IC4uLnBpY2sob3B0cywgUFJFU0VOVEVSX09QVF9LRVlTKSwgc2NoZW1hOiBvcHRzLnNjaGVtYSB9KVxufVxuXG5leHBvcnQge1xuICBkdW1wLFxuXG4gIHR5cGUgRHVtcE9wdGlvbnNcbn1cbiIsICIvLyBQYXJzZXIgZXZlbnRzIOKGkiBBU1QuIFRoZSBzZWNvbmQgZW50cnkgaW50byB0aGUgQVNUIHdvcmxkICh0aGUgZmlyc3QgYmVpbmdcbi8vIGBqc1RvQXN0YCk6IGluc3RlYWQgb2YgYnVpbGRpbmcgSlMgdmFsdWVzIGxpa2UgdGhlIGNvbnN0cnVjdG9yLCBpdCBtaXJyb3JzIHRoZVxuLy8gc2FtZSBkb2N1bWVudC9zZXF1ZW5jZS9tYXBwaW5nIGZyYW1lIHdhbGsgYW5kIGVtaXRzIGBOb2RlYHMgdGhhdCBrZWVwIHRoZVxuLy8gb3JpZ2luYWwgc3R5bGVzLCB0YWdzIGFuZCBhbmNob3JzLCBzbyBwYXJzZWQgWUFNTCBjYW4gYmUgcmUtZHVtcGVkIGZhaXRoZnVsbHkuXG5cbmltcG9ydCB7XG4gIEVWRU5UX0FMSUFTLFxuICBFVkVOVF9ET0NVTUVOVCxcbiAgRVZFTlRfTUFQUElORyxcbiAgRVZFTlRfUE9QLFxuICBFVkVOVF9TQ0FMQVIsXG4gIEVWRU5UX1NFUVVFTkNFLFxuICBTQ0FMQVJfU1RZTEVfUExBSU4sXG4gIFNDQUxBUl9TVFlMRV9TSU5HTEVfUVVPVEVELFxuICBTQ0FMQVJfU1RZTEVfRE9VQkxFX1FVT1RFRCxcbiAgU0NBTEFSX1NUWUxFX0xJVEVSQUxfQkxPQ0ssXG4gIFNDQUxBUl9TVFlMRV9GT0xERURfQkxPQ0ssXG4gIENPTExFQ1RJT05fU1RZTEVfRkxPVyxcbiAgdHlwZSBFdmVudCxcbiAgdHlwZSBNYXBwaW5nRXZlbnQsXG4gIHR5cGUgU2NhbGFyRXZlbnQsXG4gIHR5cGUgU2VxdWVuY2VFdmVudFxufSBmcm9tICcuLi9wYXJzZXIvZXZlbnRzLnRzJ1xuaW1wb3J0IHsgZ2V0U2NhbGFyVmFsdWUgfSBmcm9tICcuLi9wYXJzZXIvcGFyc2VyX3NjYWxhci50cydcbmltcG9ydCB7IHR5cGUgU2NoZW1hIH0gZnJvbSAnLi4vc2NoZW1hLnRzJ1xuaW1wb3J0IHsgTk9UX1JFU09MVkVEIH0gZnJvbSAnLi4vdGFnLnRzJ1xuaW1wb3J0IHtcbiAgU3R5bGUsXG4gIHR5cGUgTm9kZSxcbiAgdHlwZSBEb2N1bWVudCxcbiAgdHlwZSBTY2FsYXJOb2RlLFxuICB0eXBlIFNlcXVlbmNlTm9kZSxcbiAgdHlwZSBNYXBwaW5nTm9kZSxcbiAgdHlwZSBBbGlhc05vZGVcbn0gZnJvbSAnLi9ub2Rlcy50cydcblxuY29uc3QgTk9fUkFOR0UgPSAtMVxuXG5pbnRlcmZhY2UgRG9jdW1lbnRGcmFtZSB7XG4gIGtpbmQ6ICdkb2N1bWVudCdcbiAgZG9jOiBEb2N1bWVudFxufVxuXG5pbnRlcmZhY2UgU2VxdWVuY2VGcmFtZSB7XG4gIGtpbmQ6ICdzZXF1ZW5jZSdcbiAgbm9kZTogU2VxdWVuY2VOb2RlXG59XG5cbmludGVyZmFjZSBNYXBwaW5nRnJhbWUge1xuICBraW5kOiAnbWFwcGluZydcbiAgbm9kZTogTWFwcGluZ05vZGVcbiAga2V5OiBOb2RlIHwgbnVsbFxufVxuXG50eXBlIEZyYW1lID0gRG9jdW1lbnRGcmFtZSB8IFNlcXVlbmNlRnJhbWUgfCBNYXBwaW5nRnJhbWVcblxuaW50ZXJmYWNlIEZyb21FdmVudHNPcHRpb25zIHtcbiAgc291cmNlOiBzdHJpbmdcbiAgc2NoZW1hOiBTY2hlbWFcbn1cblxuaW50ZXJmYWNlIEZyb21FdmVudHNTdGF0ZSB7XG4gIHNvdXJjZTogc3RyaW5nXG4gIHNjaGVtYTogU2NoZW1hXG4gIGV2ZW50SW5kZXg6IG51bWJlclxuICBwb3NpdGlvbjogbnVtYmVyXG4gIGZyYW1lczogRnJhbWVbXVxuICBkb2N1bWVudHM6IERvY3VtZW50W11cbn1cblxuZnVuY3Rpb24gZXZlbnRQb3NpdGlvbiAoZXZlbnQ6IEV2ZW50KSB7XG4gIGlmICgndGFnU3RhcnQnIGluIGV2ZW50ICYmIGV2ZW50LnRhZ1N0YXJ0ICE9PSBOT19SQU5HRSkgcmV0dXJuIGV2ZW50LnRhZ1N0YXJ0XG4gIGlmICgnYW5jaG9yU3RhcnQnIGluIGV2ZW50ICYmIGV2ZW50LmFuY2hvclN0YXJ0ICE9PSBOT19SQU5HRSkgcmV0dXJuIGV2ZW50LmFuY2hvclN0YXJ0XG4gIGlmICgndmFsdWVTdGFydCcgaW4gZXZlbnQgJiYgZXZlbnQudmFsdWVTdGFydCAhPT0gTk9fUkFOR0UpIHJldHVybiBldmVudC52YWx1ZVN0YXJ0XG4gIGlmICgnc3RhcnQnIGluIGV2ZW50KSByZXR1cm4gZXZlbnQuc3RhcnRcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gcmF3VGFnIChzdGF0ZTogRnJvbUV2ZW50c1N0YXRlLCBldmVudDogU2NhbGFyRXZlbnQgfCBTZXF1ZW5jZUV2ZW50IHwgTWFwcGluZ0V2ZW50KSB7XG4gIHJldHVybiBldmVudC50YWdTdGFydCA9PT0gTk9fUkFOR0VcbiAgICA/ICcnXG4gICAgOiBzdGF0ZS5zb3VyY2Uuc2xpY2UoZXZlbnQudGFnU3RhcnQsIGV2ZW50LnRhZ0VuZClcbn1cblxuZnVuY3Rpb24gYW5jaG9yTmFtZSAoc3RhdGU6IEZyb21FdmVudHNTdGF0ZSwgZXZlbnQ6IFNjYWxhckV2ZW50IHwgU2VxdWVuY2VFdmVudCB8IE1hcHBpbmdFdmVudCkge1xuICByZXR1cm4gZXZlbnQuYW5jaG9yU3RhcnQgPT09IE5PX1JBTkdFXG4gICAgPyB1bmRlZmluZWRcbiAgICA6IHN0YXRlLnNvdXJjZS5zbGljZShldmVudC5hbmNob3JTdGFydCwgZXZlbnQuYW5jaG9yRW5kKVxufVxuXG4vLyBUYWcgbmFtZSBjYXJyaWVkIGJ5IGFuIGVtcHR5L3BsYWluIHNjYWxhciB3aXRoIG5vIGV4cGxpY2l0IHRhZzogdGhlIGZpcnN0XG4vLyBpbXBsaWNpdCBzY2FsYXIgcmVzb2x2ZXIgdGhhdCBhY2NlcHRzIHRoZSB0ZXh0LCBmYWxsaW5nIGJhY2sgdG8gc3RyLiBNaXJyb3JzXG4vLyB0aGUgaW1wbGljaXQgYnJhbmNoIG9mIGBjb25zdHJ1Y3RTY2FsYXJgLCBidXQgd2Ugb25seSB3YW50IHRoZSB0YWcgbmFtZS5cbmZ1bmN0aW9uIGltcGxpY2l0U2NhbGFyVGFnTmFtZSAoc3RhdGU6IEZyb21FdmVudHNTdGF0ZSwgc291cmNlOiBzdHJpbmcpIHtcbiAgY29uc3QgeyBzY2hlbWEgfSA9IHN0YXRlXG4gIGNvbnN0IGNhbmRpZGF0ZXMgPSBzY2hlbWEuaW1wbGljaXRTY2FsYXJCeUZpcnN0Q2hhci5nZXQoc291cmNlLmNoYXJBdCgwKSkgPz9cbiAgICBzY2hlbWEuaW1wbGljaXRTY2FsYXJBbnlGaXJzdENoYXJcbiAgZm9yIChjb25zdCB0YWcgb2YgY2FuZGlkYXRlcykge1xuICAgIGlmICh0YWcucmVzb2x2ZShzb3VyY2UsIGZhbHNlLCB0YWcudGFnTmFtZSkgIT09IE5PVF9SRVNPTFZFRCkgcmV0dXJuIHRhZy50YWdOYW1lXG4gIH1cbiAgcmV0dXJuIHNjaGVtYS5kZWZhdWx0U2NhbGFyVGFnLnRhZ05hbWVcbn1cblxuZnVuY3Rpb24gYnVpbGRTY2FsYXIgKHN0YXRlOiBGcm9tRXZlbnRzU3RhdGUsIGV2ZW50OiBTY2FsYXJFdmVudCk6IFNjYWxhck5vZGUge1xuICBjb25zdCB2YWx1ZSA9IGdldFNjYWxhclZhbHVlKHN0YXRlLnNvdXJjZSwgZXZlbnQpXG4gIGNvbnN0IHJhdyA9IHJhd1RhZyhzdGF0ZSwgZXZlbnQpXG4gIGNvbnN0IHN0eWxlID0gbmV3IFN0eWxlKClcblxuICBzd2l0Y2ggKGV2ZW50LnN0eWxlKSB7XG4gICAgY2FzZSBTQ0FMQVJfU1RZTEVfU0lOR0xFX1FVT1RFRDogc3R5bGUuc2luZ2xlUXVvdGVkID0gdHJ1ZTsgYnJlYWtcbiAgICBjYXNlIFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVEOiBzdHlsZS5kb3VibGVRdW90ZWQgPSB0cnVlOyBicmVha1xuICAgIGNhc2UgU0NBTEFSX1NUWUxFX0xJVEVSQUxfQkxPQ0s6IHN0eWxlLmxpdGVyYWwgPSB0cnVlOyBicmVha1xuICAgIGNhc2UgU0NBTEFSX1NUWUxFX0ZPTERFRF9CTE9DSzogc3R5bGUuZm9sZGVkID0gdHJ1ZTsgYnJlYWtcbiAgfVxuXG4gIGxldCB0YWc6IHN0cmluZ1xuICBpZiAocmF3ICE9PSAnJykge1xuICAgIHN0eWxlLnRhZ2dlZCA9IHRydWVcbiAgICB0YWcgPSByYXdcbiAgfSBlbHNlIGlmIChldmVudC5zdHlsZSA9PT0gU0NBTEFSX1NUWUxFX1BMQUlOKSB7XG4gICAgdGFnID0gaW1wbGljaXRTY2FsYXJUYWdOYW1lKHN0YXRlLCB2YWx1ZSlcbiAgfSBlbHNlIHtcbiAgICB0YWcgPSBzdGF0ZS5zY2hlbWEuZGVmYXVsdFNjYWxhclRhZy50YWdOYW1lXG4gIH1cblxuICByZXR1cm4geyBraW5kOiAnc2NhbGFyJywgdGFnLCBzdHlsZSwgYW5jaG9yOiBhbmNob3JOYW1lKHN0YXRlLCBldmVudCksIHZhbHVlIH1cbn1cblxuZnVuY3Rpb24gYnVpbGRDb2xsZWN0aW9uIChcbiAgc3RhdGU6IEZyb21FdmVudHNTdGF0ZSxcbiAgZXZlbnQ6IFNlcXVlbmNlRXZlbnQgfCBNYXBwaW5nRXZlbnQsXG4gIGRlZmF1bHRUYWdOYW1lOiBzdHJpbmdcbik6IHsgdGFnOiBzdHJpbmcsIHN0eWxlOiBTdHlsZSwgYW5jaG9yPzogc3RyaW5nIH0ge1xuICBjb25zdCByYXcgPSByYXdUYWcoc3RhdGUsIGV2ZW50KVxuICBjb25zdCBzdHlsZSA9IG5ldyBTdHlsZSgpXG4gIGlmIChldmVudC5zdHlsZSA9PT0gQ09MTEVDVElPTl9TVFlMRV9GTE9XKSBzdHlsZS5mbG93ID0gdHJ1ZVxuXG4gIGxldCB0YWc6IHN0cmluZ1xuICBpZiAocmF3ID09PSAnJykge1xuICAgIHRhZyA9IGRlZmF1bHRUYWdOYW1lXG4gIH0gZWxzZSB7XG4gICAgdGFnID0gcmF3XG4gICAgc3R5bGUudGFnZ2VkID0gdHJ1ZVxuICB9XG5cbiAgcmV0dXJuIHsgdGFnLCBzdHlsZSwgYW5jaG9yOiBhbmNob3JOYW1lKHN0YXRlLCBldmVudCkgfVxufVxuXG5mdW5jdGlvbiBhZGROb2RlIChzdGF0ZTogRnJvbUV2ZW50c1N0YXRlLCBub2RlOiBOb2RlKSB7XG4gIGNvbnN0IGZyYW1lID0gc3RhdGUuZnJhbWVzW3N0YXRlLmZyYW1lcy5sZW5ndGggLSAxXVxuXG4gIGlmIChmcmFtZS5raW5kID09PSAnZG9jdW1lbnQnKSB7XG4gICAgZnJhbWUuZG9jLmNvbnRlbnRzID0gbm9kZVxuICB9IGVsc2UgaWYgKGZyYW1lLmtpbmQgPT09ICdzZXF1ZW5jZScpIHtcbiAgICBmcmFtZS5ub2RlLml0ZW1zLnB1c2gobm9kZSlcbiAgfSBlbHNlIGlmIChmcmFtZS5rZXkpIHtcbiAgICBmcmFtZS5ub2RlLml0ZW1zLnB1c2goeyBrZXk6IGZyYW1lLmtleSwgdmFsdWU6IG5vZGUgfSlcbiAgICBmcmFtZS5rZXkgPSBudWxsXG4gIH0gZWxzZSB7XG4gICAgZnJhbWUua2V5ID0gbm9kZVxuICB9XG59XG5cbmZ1bmN0aW9uIGV2ZW50c1RvQXN0IChldmVudHM6IEV2ZW50W10sIG9wdGlvbnM6IEZyb21FdmVudHNPcHRpb25zKTogRG9jdW1lbnRbXSB7XG4gIGNvbnN0IHN0YXRlOiBGcm9tRXZlbnRzU3RhdGUgPSB7XG4gICAgc291cmNlOiBvcHRpb25zLnNvdXJjZSxcbiAgICBzY2hlbWE6IG9wdGlvbnMuc2NoZW1hLFxuICAgIGV2ZW50SW5kZXg6IDAsXG4gICAgcG9zaXRpb246IDAsXG4gICAgZnJhbWVzOiBbXSxcbiAgICBkb2N1bWVudHM6IFtdXG4gIH1cblxuICB3aGlsZSAoc3RhdGUuZXZlbnRJbmRleCA8IGV2ZW50cy5sZW5ndGgpIHtcbiAgICBjb25zdCBldmVudCA9IGV2ZW50c1tzdGF0ZS5ldmVudEluZGV4KytdXG4gICAgc3RhdGUucG9zaXRpb24gPSBldmVudFBvc2l0aW9uKGV2ZW50KVxuXG4gICAgc3dpdGNoIChldmVudC50eXBlKSB7XG4gICAgICBjYXNlIEVWRU5UX0RPQ1VNRU5UOiB7XG4gICAgICAgIGNvbnN0IGRvYzogRG9jdW1lbnQgPSB7XG4gICAgICAgICAgY29udGVudHM6IG51bGwsXG4gICAgICAgICAgZXhwbGljaXRTdGFydDogZXZlbnQuZXhwbGljaXRTdGFydCxcbiAgICAgICAgICBleHBsaWNpdEVuZDogZXZlbnQuZXhwbGljaXRFbmQsXG4gICAgICAgICAgZGlyZWN0aXZlczogZXZlbnQuZGlyZWN0aXZlc1xuICAgICAgICB9XG4gICAgICAgIHN0YXRlLmZyYW1lcy5wdXNoKHsga2luZDogJ2RvY3VtZW50JywgZG9jIH0pXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGNhc2UgRVZFTlRfU0NBTEFSOlxuICAgICAgICBhZGROb2RlKHN0YXRlLCBidWlsZFNjYWxhcihzdGF0ZSwgZXZlbnQpKVxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlIEVWRU5UX1NFUVVFTkNFOiB7XG4gICAgICAgIGNvbnN0IHsgdGFnLCBzdHlsZSwgYW5jaG9yIH0gPSBidWlsZENvbGxlY3Rpb24oc3RhdGUsIGV2ZW50LCAndGFnOnlhbWwub3JnLDIwMDI6c2VxJylcbiAgICAgICAgY29uc3Qgbm9kZTogU2VxdWVuY2VOb2RlID0geyBraW5kOiAnc2VxdWVuY2UnLCB0YWcsIHN0eWxlLCBhbmNob3IsIGl0ZW1zOiBbXSB9XG4gICAgICAgIHN0YXRlLmZyYW1lcy5wdXNoKHsga2luZDogJ3NlcXVlbmNlJywgbm9kZSB9KVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjYXNlIEVWRU5UX01BUFBJTkc6IHtcbiAgICAgICAgY29uc3QgeyB0YWcsIHN0eWxlLCBhbmNob3IgfSA9IGJ1aWxkQ29sbGVjdGlvbihzdGF0ZSwgZXZlbnQsICd0YWc6eWFtbC5vcmcsMjAwMjptYXAnKVxuICAgICAgICBjb25zdCBub2RlOiBNYXBwaW5nTm9kZSA9IHsga2luZDogJ21hcHBpbmcnLCB0YWcsIHN0eWxlLCBhbmNob3IsIGl0ZW1zOiBbXSB9XG4gICAgICAgIHN0YXRlLmZyYW1lcy5wdXNoKHsga2luZDogJ21hcHBpbmcnLCBub2RlLCBrZXk6IG51bGwgfSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgY2FzZSBFVkVOVF9BTElBUzoge1xuICAgICAgICBjb25zdCBuYW1lID0gc3RhdGUuc291cmNlLnNsaWNlKGV2ZW50LmFuY2hvclN0YXJ0LCBldmVudC5hbmNob3JFbmQpXG4gICAgICAgIGNvbnN0IG5vZGU6IEFsaWFzTm9kZSA9IHsga2luZDogJ2FsaWFzJywgdGFnOiAnJywgc3R5bGU6IG5ldyBTdHlsZSgpLCBhbmNob3I6IG5hbWUgfVxuICAgICAgICBhZGROb2RlKHN0YXRlLCBub2RlKVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjYXNlIEVWRU5UX1BPUDoge1xuICAgICAgICBjb25zdCBmcmFtZSA9IHN0YXRlLmZyYW1lcy5wb3AoKSFcbiAgICAgICAgaWYgKGZyYW1lLmtpbmQgPT09ICdkb2N1bWVudCcpIHtcbiAgICAgICAgICBzdGF0ZS5kb2N1bWVudHMucHVzaChmcmFtZS5kb2MpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWRkTm9kZShzdGF0ZSwgZnJhbWUubm9kZSlcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdGF0ZS5kb2N1bWVudHNcbn1cblxuZXhwb3J0IHtcbiAgZXZlbnRzVG9Bc3QsXG4gIHR5cGUgRnJvbUV2ZW50c09wdGlvbnNcbn1cbiIsICIvKipcbiAqIFlBTUwgZnJvbnRtYXR0ZXIgXHU4OUUzXHU2NzkwL1x1NUU4Rlx1NTIxN1x1NTMxNlx1MzAwMlx1NEY5RFx1NjM2RSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGBcdTMwMDJcbiAqXG4gKiAtIFx1NzUyOCBqcy15YW1sIFx1NTkwNFx1NzQwNlx1NEUyRFx1NjU4N1x1NUI1N1x1NkJCNVx1NTQwRFx1RkYwOGpzLXlhbWwgXHU1MzlGXHU3NTFGXHU2NTJGXHU2MzAxIFVuaWNvZGUga2V5XHVGRjA5XG4gKiAtIFx1ODlFM1x1Njc5MFx1NjVGNlx1NEZERFx1NzU1OVx1NkNFOFx1OTFDQVx1OTg3QVx1NUU4Rlx1RkYwOGpzLXlhbWwgXHU0RTBEXHU0RkREXHU3NTU5XHVGRjBDXHU0RjQ2XHU2MjExXHU0RUVDXHU3NTI4XHU1NkZBXHU1QjlBXHU1QjU3XHU2QkI1XHU2NjIwXHU1QzA0XHU5MUNEXHU1RUZBXHVGRjA5XG4gKiAtIFx1NUU4Rlx1NTIxN1x1NTMxNlx1NjVGNlx1NjMwOVx1ODlDNFx1ODMwM1x1OTg3QVx1NUU4Rlx1OEY5M1x1NTFGQVx1RkYwOFx1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QVx1MjE5Mlx1NjgwN1x1N0I3RVx1MjE5Mlx1N0YxNlx1NzgwMVx1MjE5Mlx1OEY5M1x1NTE2NVx1MjE5Mlx1NjVFNVx1NjcxRlx1MjE5Mlx1NTE3M1x1OTUyRVx1OEJDRFx1MjE5Mlx1OEJDNFx1NTIwNlx1MjE5Mlx1N0QyMlx1NUYxNVx1RkYwOVxuICovXG5pbXBvcnQgKiBhcyBZQU1MIGZyb20gJ2pzLXlhbWwnO1xuXG4vKiogZnJvbnRtYXR0ZXIgXHU1MjA2XHU5Njk0XHU3QjI2XHUzMDAyICovXG5jb25zdCBGTV9ERUxJTUlURVIgPSAnLS0tJztcblxuLyoqIGZyb250bWF0dGVyIFx1OEY5M1x1NTFGQVx1NjVGNlx1NzY4NFx1NUI1N1x1NkJCNVx1OTg3QVx1NUU4Rlx1MzAwMlx1NEY5RFx1NjM2RSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU0RTAwXHU2QTIxXHU2NzdGXHUzMDAyICovXG5jb25zdCBGSUVMRF9PUkRFUjogKGtleW9mIGltcG9ydCgnLi90eXBlcycpLllBTUxGcm9udG1hdHRlcilbXSA9IFtcbiAgJ2ZlaXNodV9pZCcsXG4gICdmZWlzaHVfZG9jX2lkJyxcbiAgJ2ZlaXNodV90aXRsZScsXG4gICdzeW5jX2hhc2gnLFxuICAnc3luY190aW1lJyxcbiAgJ1x1NjgwN1x1N0I3RScsXG4gICdcdTdGMTZcdTc4MDEnLFxuICAnXHU4RjkzXHU1MTY1JyxcbiAgJ1x1NjVFNVx1NjcxRicsXG4gICdcdTY1RTVcdTY3MUZcdTdEMjJcdTVGMTUnLFxuICAnXHU1MTczXHU5NTJFXHU4QkNEJyxcbiAgJ1x1Njk4Mlx1OEZGMCcsXG4gICdcdThCQzRcdTUyMDYnLFxuICAnXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQScsXG4gICdcdTdEMjJcdTVGMTVfXHU3N0U1XHU4QkM2XHU1RTkzJyxcbiAgJ1x1N0QyMlx1NUYxNV9cdTk4OUNcdTgyNzInLFxuICAnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnLFxuICAnXHU3RDIyXHU1RjE1X1x1NTc1NycsXG4gICdcdTdEMjJcdTVGMTVfXHU5OENFXHU5NjY5Jyxcbl07XG5cbi8qKiBcdTdBN0FcdTUwM0NcdThERjNcdThGQzdcdTk2QzZcdTU0MDhcdUZGMUFcdTRFQzVcdThERjNcdThGQzdcdTY3MkFcdThCQkVcdTdGNkVcdUZGMUJcdTdBN0FcdTVCNTdcdTdCMjZcdTRFMzIvXHU3QTdBXHU2NTcwXHU3RUM0XHU3NTI4XHU0RThFXHU4OUM0XHU4MzAzXHU1QjU3XHU2QkI1XHU1MzYwXHU0RjREXHUzMDAyICovXG5mdW5jdGlvbiBpc0VtcHR5KHY6IHVua25vd24pOiBib29sZWFuIHtcbiAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFx1NUMwNiBmcm9udG1hdHRlciBcdTVCRjlcdThDNjFcdTVFOEZcdTUyMTdcdTUzMTZcdTRFM0EgWUFNTCBcdTVCNTdcdTdCMjZcdTRFMzJcdUZGMDhcdTU0MkIgYC0tLWAgXHU1MjA2XHU5Njk0XHU3QjI2XHVGRjA5XHUzMDAyXG4gKiBcdTYzMDlcdTg5QzRcdTgzMDNcdTk4N0FcdTVFOEZcdThGOTNcdTUxRkFcdUZGMENcdThERjNcdThGQzdcdTdBN0FcdTUwM0NcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZUZyb250bWF0dGVyKGZtOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHN0cmluZyB7XG4gIGNvbnN0IG9yZGVyZWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG4gIGZvciAoY29uc3Qga2V5IG9mIEZJRUxEX09SREVSKSB7XG4gICAgaWYgKCFpc0VtcHR5KGZtW2tleV0pKSB7XG4gICAgICBvcmRlcmVkW2tleSBhcyBzdHJpbmddID0gZm1ba2V5XTtcbiAgICB9XG4gIH1cbiAgLy8gXHU2NTM2XHU1QzNFXHVGRjFBXHU1M0VGXHU4MEZEXHU2NzA5XHU1OTFBXHU0RjU5XHU1QjU3XHU2QkI1XHU0RTBEXHU1NzI4IEZJRUxEX09SREVSIFx1OTFDQ1x1RkYwOFx1NTQxMVx1NTQwRVx1NTE3Q1x1NUJCOVx1RkYwOVxuICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhmbSkpIHtcbiAgICBpZiAoIShrIGluIG9yZGVyZWQpICYmICFpc0VtcHR5KHYpKSB7XG4gICAgICBvcmRlcmVkW2tdID0gdjtcbiAgICB9XG4gIH1cbiAgY29uc3QgeWFtbFN0ciA9IFlBTUwuZHVtcChvcmRlcmVkLCB7XG4gICAgbGluZVdpZHRoOiAtMSwgICAgICAgICAgIC8vIFx1NEUwRFx1NjI5OFx1ODg0Q1x1RkYwOFx1ODg2OFx1NjgzQ1x1N0I0OVx1OTU3Rlx1ODg0Q1x1NEUwRFx1NzgzNFx1NTc0Rlx1RkYwOVxuICAgIHF1b3RlU3R5bGU6ICdkb3VibGUnLCAgICAvLyBcdTVCNTdcdTdCMjZcdTRFMzJcdTc1MjhcdTUzQ0NcdTVGMTVcdTUzRjdcdUZGMDhcdTRGRERcdTc1NTkgZW1vamlcdUZGMDlcbiAgICBmb3JjZVF1b3RlczogZmFsc2UsXG4gICAgc29ydEtleXM6IGZhbHNlLCAgICAgICAgIC8vIFx1NjIxMVx1NEVFQ1x1ODFFQVx1NURGMVx1NjNBN1x1NTIzNlx1OTg3QVx1NUU4RlxuICB9KSBhcyBzdHJpbmc7XG4gIHJldHVybiBgJHtGTV9ERUxJTUlURVJ9XFxuJHt5YW1sU3RyfSR7Rk1fREVMSU1JVEVSfWA7XG59XG5cbi8qKlxuICogXHU0RUNFIG1kIFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVx1ODlFM1x1Njc5MCBmcm9udG1hdHRlclx1MzAwMlxuICogQHBhcmFtIGNvbnRlbnQgXHU1QjhDXHU2NTc0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XG4gKiBAcmV0dXJucyB7IGZyb250bWF0dGVyLCBib2R5IH1cdUZGMENmcm9udG1hdHRlciBcdTRFM0EgbnVsbCBcdTg4NjhcdTc5M0FcdTY1RTAgZnJvbnRtYXR0ZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRnJvbnRtYXR0ZXIoY29udGVudDogc3RyaW5nKToge1xuICBmcm9udG1hdHRlcjogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsO1xuICBib2R5OiBzdHJpbmc7XG59IHtcbiAgY29uc3Qgb2Zmc2V0ID0gY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweGZlZmYgPyAxIDogMDtcbiAgaWYgKCFjb250ZW50LnN0YXJ0c1dpdGgoRk1fREVMSU1JVEVSLCBvZmZzZXQpKSB7XG4gICAgcmV0dXJuIHsgZnJvbnRtYXR0ZXI6IG51bGwsIGJvZHk6IGNvbnRlbnQgfTtcbiAgfVxuXG4gIGNvbnN0IHJlc3QgPSBjb250ZW50LnNsaWNlKG9mZnNldCArIEZNX0RFTElNSVRFUi5sZW5ndGgpO1xuICBjb25zdCBtYXRjaCA9IHJlc3QubWF0Y2goL15cXHI/XFxuKFtcXHNcXFNdKj8pXFxyP1xcbi0tLVsgXFx0XSooPzpcXHI/XFxufCQpLyk7XG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm4geyBmcm9udG1hdHRlcjogbnVsbCwgYm9keTogY29udGVudCB9O1xuICB9XG5cbiAgY29uc3QgeWFtbEJsb2NrID0gbWF0Y2hbMV07XG4gIGNvbnN0IGJvZHlTdGFydCA9IG9mZnNldCArIEZNX0RFTElNSVRFUi5sZW5ndGggKyBtYXRjaFswXS5sZW5ndGg7XG4gIGNvbnN0IGJvZHkgPSBjb250ZW50LnNsaWNlKGJvZHlTdGFydCkucmVwbGFjZSgvXig/Olxccj9cXG4pKy8sICcnKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBmbSA9IFlBTUwubG9hZCh5YW1sQmxvY2spIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIHJldHVybiB7IGZyb250bWF0dGVyOiBmbSA/PyB7fSwgYm9keSB9O1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gWUFNTCBcdTg5RTNcdTY3OTBcdTU5MzFcdThEMjVcdUZGMUFcdTg5QzZcdTRFM0FcdTY1RTAgZnJvbnRtYXR0ZXJcbiAgICBjb25zb2xlLndhcm4oJ1tzeW5jL3NoYXJlZF0gZnJvbnRtYXR0ZXIgcGFyc2UgZmFpbGVkOicsIGUpO1xuICAgIHJldHVybiB7IGZyb250bWF0dGVyOiBudWxsLCBib2R5OiBjb250ZW50IH07XG4gIH1cbn1cblxuLyoqXG4gKiBcdTVDMDYgZnJvbnRtYXR0ZXIgKyBib2R5IFx1NjJGQ1x1NjIxMFx1NUI4Q1x1NjU3NFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZW1ibGVGaWxlKFxuICBmbTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4gIGJvZHk6IHN0cmluZyxcbik6IHN0cmluZyB7XG4gIHJldHVybiBgJHtzZXJpYWxpemVGcm9udG1hdHRlcihmbSl9XFxuXFxuJHtib2R5fWA7XG59XG4iLCAiLyoqXG4gKiBZQU1MIFx1MjE5NCBcdTk4REVcdTRFNjYgY2FsbG91dCBcdTUzQ0NcdTU0MTFcdThGNkNcdTYzNjJcdTMwMDJcbiAqXG4gKiBcdTRGOURcdTYzNkVcdUZGMUFcbiAqIC0gYDAzX1x1OThERVx1NEU2Nlx1NjU4N1x1Njg2M1x1NjgzQ1x1NUYwRlx1ODlDNFx1ODMwM1x1NEUwRU9CXHU2NjIwXHU1QzA0Lm1kYCBcdTAwQTdcdTRFMDlcdUZGMDhjYWxsb3V0IFx1OTg5Q1x1ODI3Mlx1NjYyMFx1NUMwNFx1RkYwOVxuICogLSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU0RTk0XHVGRjA4WUFNTFx1MjE5MmNhbGxvdXQgXHU2NjIwXHU1QzA0XHU4ODY4XHVGRjA5XG4gKiAtIFx1MDBBN1x1NTZEQlx1RkYwOFx1NTQwOFx1NUU3Nlx1NEZFMVx1NjA2Rlx1NTc1N1x1OEJCRVx1OEJBMVx1RkYxQVx1NjI0MFx1NjcwOVx1NUI1N1x1NkJCNVx1OEZEQlx1NEUwMFx1NEUyQSBjYWxsb3V0XHVGRjA5XG4gKlxuICogXHU1REYyXHU3N0U1XHU1NzUxXHVGRjA4MDMgXHU2NTg3XHU2ODYzIFx1MDBBN1x1NTM0MSArIFx1MDBBNzMuM1x1RkYwOVx1RkYxQVxuICogLSBlbW9qaSBcdTVFMjYgVStGRTBGIHZhcmlhdGlvbiBzZWxlY3RvciBcdTk4REVcdTRFNjZcdTRFMERcdThCQTQgXHUyMTkyIFx1NTE5OVx1NTE2NVx1NTI0RCBzdHJpcFxuICogLSBgfmAgXHU4OEFCXHU5OERFXHU0RTY2XHU4RjZDXHU0RTQ5XHU2MjEwIGBcXH5gIFx1MjE5MiBcdTU2REVcdThCRkJcdTY1RjZcdTUzQ0RcdThGNkNcdTRFNDlcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IEtub3dsZWRnZU1ldGEsIFRhZyB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHtcbiAgQ0FMTE9VVF9GSUVMRF9NQVAsXG4gIFRBR19OQU1FUyxcbiAgRE9DX0lORk9fQ0FMTE9VVCxcbiAgT0JfQ0FMTE9VVF9UT19GRUlTSFUsXG4gIEZFSVNIVV9CR19UT19PQl9DQUxMT1VULFxufSBmcm9tICcuL3R5cGVzLmpzJztcblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIGVtb2ppIFx1NkUwNVx1NkQxNyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqIFx1NzlGQlx1OTY2NCBlbW9qaSBcdTc2ODQgVStGRTBGIHZhcmlhdGlvbiBzZWxlY3Rvclx1MzAwMlx1OThERVx1NEU2Nlx1NEUwRFx1OEJBNFx1NUUyNiBWUyBcdTc2ODQgZW1vamlcdUZGMDgwMyBcdTY1ODdcdTY4NjMgXHUwMEE3My4zXHVGRjA5XHUzMDAyICovXG5jb25zdCBWU19SRSA9IC9cXHVGRTBGL2d1O1xuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMoczogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHMucmVwbGFjZShWU19SRSwgJycpO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU2Q0UyXHU2RDZBXHU1M0Y3XHU4RjZDXHU0RTQ5IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKiogXHU5OERFXHU0RTY2IG1kIFx1NjI4QSBgfmAgXHU4RjZDXHU0RTQ5XHU2MjEwIGBcXH5gXHVGRjBDXHU1NkRFXHU4QkZCXHU2NUY2XHU1M0NEXHU1NDExXHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gdW5lc2NhcGVGZWlzaHVUaWxkZShzOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcy5yZXBsYWNlKC9cXFxcfi9nLCAnficpO1xufVxuXG4vKiogXHU1MTk5XHU1MTY1XHU5OERFXHU0RTY2XHU1MjREXHU1M0NEXHU4RjZDXHU0RTQ5XHVGRjA4XHU1OTgyXHU2NzlDXHU3NTI4XHU2MjM3XHU2MEYzXHU3NTI4IGB+YCBcdTUyMjBcdTk2NjRcdTdFQkZcdUZGMDlcdTMwMDJcdTk4REVcdTRFNjYgbWQgXHU5MUNDIGB+fn50ZXh0fn5+YCBcdTY2MkZcdTUyMjBcdTk2NjRcdTdFQkZcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVGZWlzaHVUaWxkZShzOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBcdTRFMERcdTRFM0JcdTUyQThcdThGNkNcdTRFNDlcdUZGMENcdTRGRERcdTYzMDFcdTUzOUZcdTY4MzdcdTMwMDJcdTRFQzVcdTU3Mjggb3ZlcndyaXRlIFx1NTczQVx1NjY2Rlx1Nzg2RVx1OEJBNFx1OTcwMFx1ODk4MVx1NjVGNlx1NjI0Qlx1NTJBOFx1NTkwNFx1NzQwNlx1MzAwMlxuICByZXR1cm4gcztcbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIFx1NjgwN1x1N0I3RVx1NTAzQ1x1NjgzQ1x1NUYwRlx1NTMxNiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuZnVuY3Rpb24gZm9ybWF0VGFnVmFsdWUodGFnOiBUYWcgfCB1bmRlZmluZWQpOiBzdHJpbmcge1xuICBpZiAoIXRhZykgcmV0dXJuICcnO1xuICByZXR1cm4gYCR7VEFHX05BTUVTW3RhZ119ICR7dGFnfWA7XG59XG5cbmZ1bmN0aW9uIHBhcnNlVGFnVmFsdWUodmFsdWU6IHN0cmluZyk6IFRhZyB8IG51bGwge1xuICBjb25zdCBub3JtYWxpemVkID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnModmFsdWUpLnRyaW0oKTtcbiAgY29uc3QgZGlyZWN0ID0gbm9ybWFsaXplZC5tYXRjaCgvKD86XnxcXHMpKFtTWExaUUpdKSg/Olxcc3wkKS8pO1xuICBjb25zdCBjb21wYWN0ID0gbm9ybWFsaXplZC5tYXRjaCgvW1NYTFpRSl0vKTtcbiAgY29uc3QgdGFnID0gKGRpcmVjdD8uWzFdID8/IGNvbXBhY3Q/LlswXSkgYXMgVGFnIHwgdW5kZWZpbmVkO1xuICByZXR1cm4gdGFnICYmIFsnUycsICdYJywgJ0wnLCAnWicsICdRJywgJ0onXS5pbmNsdWRlcyh0YWcpID8gdGFnIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gbWFwRmVpc2h1QmdUb09iVHlwZShiZ0NvbG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIWJnQ29sb3IpIHJldHVybiAndGlwJztcbiAgaWYgKEZFSVNIVV9CR19UT19PQl9DQUxMT1VUW2JnQ29sb3JdKSByZXR1cm4gRkVJU0hVX0JHX1RPX09CX0NBTExPVVRbYmdDb2xvcl07XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBiZ0NvbG9yLnJlcGxhY2UoL1xccysvZywgJycpLnRvTG93ZXJDYXNlKCk7XG4gIGNvbnN0IHJnYk1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAncmdiKDI1NSwyNDUsMjM1KSc6ICd0aXAnLFxuICAgICdyZ2IoMjU0LDIxMiwxNjQpJzogJ3RpcCcsXG4gICAgJ3JnYmEoMjU1LDI0NiwxMjIsMC44KSc6ICd0aXAnLFxuICAgICdyZ2IoMjU1LDI0MCwyNDApJzogJ3dhcm5pbmcnLFxuICAgICdyZ2IoMjQyLDI0MywyNDUpJzogJ3F1b3RlJyxcbiAgICAncmdiKDI0MCwyNDQsMjU1KSc6ICdpbmZvJyxcbiAgICAncmdiKDI0MCwyNTMsMjQ0KSc6ICdzdWNjZXNzJyxcbiAgfTtcbiAgcmV0dXJuIHJnYk1hcFtub3JtYWxpemVkXSA/PyAnYWJzdHJhY3QnO1xufVxuXG5mdW5jdGlvbiBodG1sQmxvY2tUb1RleHRMaW5lcyhodG1sOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBibG9ja1JlID0gLzwoPzpwfGxpKVxcYltePl0qPihbXFxzXFxTXSo/KTxcXC8oPzpwfGxpKT4vZztcbiAgbGV0IG06IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG4gIHdoaWxlICgobSA9IGJsb2NrUmUuZXhlYyhodG1sKSkgIT09IG51bGwpIHtcbiAgICBjb25zdCB0ZXh0ID0gaHRtbFRvUGxhaW5UZXh0KG1bMV0pO1xuICAgIGlmICh0ZXh0KSBsaW5lcy5wdXNoKC4uLnRleHQuc3BsaXQoJ1xcbicpLm1hcChsaW5lID0+IGxpbmUudHJpbSgpKS5maWx0ZXIoQm9vbGVhbikpO1xuICB9XG4gIGlmIChsaW5lcy5sZW5ndGggPiAwKSByZXR1cm4gbGluZXM7XG4gIGNvbnN0IGZhbGxiYWNrID0gaHRtbFRvUGxhaW5UZXh0KGh0bWwpO1xuICByZXR1cm4gZmFsbGJhY2sgPyBmYWxsYmFjay5zcGxpdCgnXFxuJykubWFwKGxpbmUgPT4gbGluZS50cmltKCkpLmZpbHRlcihCb29sZWFuKSA6IFtdO1xufVxuXG5mdW5jdGlvbiBodG1sVG9QbGFpblRleHQoaHRtbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGh0bWxcbiAgICAucmVwbGFjZSgvPGJyXFxzKlxcLz8+L2csICdcXG4nKVxuICAgIC5yZXBsYWNlKC88W14+XSs+L2csICcnKVxuICAgIC5yZXBsYWNlKC8mbHQ7L2csICc8JylcbiAgICAucmVwbGFjZSgvJmd0Oy9nLCAnPicpXG4gICAgLnJlcGxhY2UoLyZhbXA7L2csICcmJylcbiAgICAucmVwbGFjZSgvJnF1b3Q7L2csICdcIicpXG4gICAgLnJlcGxhY2UoLyZhcG9zOy9nLCBcIidcIilcbiAgICAudHJpbSgpO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgT0JcdTIxOTJcdTk4REVcdTRFNjZcdUZGMUFZQU1MXHUyMTkyXHU1NDA4XHU1RTc2XHU0RkUxXHU2MDZGIGNhbGxvdXQgWE1MIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKipcbiAqIFx1NUMwNiBPQiBcdTc2ODQgWUFNTCBcdTUxNDNcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVcdTZFMzJcdTY3RDNcdTRFM0FcdTk4REVcdTRFNjZcdTU0MDhcdTVFNzZcdTRGRTFcdTYwNkYgY2FsbG91dCBYTUxcdTMwMDJcbiAqIFx1NEY5RFx1NjM2RSBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTU2REJcdUZGMDhcdTU0MDhcdTVFNzZcdThGREJcdTRFMDBcdTRFMkEgY2FsbG91dCBcdTlBRDhcdTRFQUVcdTU3NTdcdUZGMDlcdTMwMDJcbiAqXG4gKiBAcGFyYW0gbWV0YSBcdTc3RTVcdThCQzZcdTVFOTNcdTUxNDNcdTY1NzBcdTYzNkVcbiAqIEByZXR1cm5zIGNhbGxvdXQgWE1MIFx1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOFx1NTQyQiBzdHJpcCBWU1x1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gbWV0YVRvQ2FsbG91dFhtbChtZXRhOiBLbm93bGVkZ2VNZXRhKTogc3RyaW5nIHtcbiAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW107XG5cbiAgZm9yIChjb25zdCBpdGVtIG9mIENBTExPVVRfRklFTERfTUFQKSB7XG4gICAgY29uc3QgcmF3ID0gbWV0YVtpdGVtLmZpZWxkXTtcbiAgICBpZiAocmF3ID09PSB1bmRlZmluZWQgfHwgcmF3ID09PSBudWxsIHx8IHJhdyA9PT0gJycgfHwgKEFycmF5LmlzQXJyYXkocmF3KSAmJiByYXcubGVuZ3RoID09PSAwKSkgY29udGludWU7XG5cbiAgICBsZXQgdmFsdWU6IHN0cmluZztcbiAgICBpZiAoaXRlbS5maWVsZCA9PT0gJ1x1NjgwN1x1N0I3RScpIHtcbiAgICAgIHZhbHVlID0gZm9ybWF0VGFnVmFsdWUocmF3IGFzIFRhZyB8IHVuZGVmaW5lZCk7XG4gICAgfSBlbHNlIGlmIChpdGVtLmZpZWxkID09PSAnXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQScpIHtcbiAgICAgIHZhbHVlID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMoU3RyaW5nKHJhdykpO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyYXcpKSB7XG4gICAgICB2YWx1ZSA9IChyYXcgYXMgc3RyaW5nW10pLmpvaW4oJyBcdTAwQjcgJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMoU3RyaW5nKHJhdykpO1xuICAgIH1cbiAgICBpZiAoIXZhbHVlKSBjb250aW51ZTtcblxuICAgIGxpbmVzLnB1c2goYDxsaT48Yj4ke2l0ZW0ubGFiZWx9PC9iPlx1RkYxQSR7dmFsdWV9PC9saT5gKTtcbiAgfVxuXG4gIGlmIChsaW5lcy5sZW5ndGggPT09IDApIHJldHVybiAnJztcblxuICBjb25zdCB7IGVtb2ppLCAuLi5hdHRycyB9ID0gRE9DX0lORk9fQ0FMTE9VVDtcbiAgY29uc3QgYXR0clN0ciA9IE9iamVjdC5lbnRyaWVzKGF0dHJzKVxuICAgIC5tYXAoKFtrLCB2XSkgPT4gYCR7a309XCIke3Z9XCJgKVxuICAgIC5qb2luKCcgJyk7XG4gIGNvbnN0IGNsZWFuRW1vamkgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhlbW9qaSk7XG5cbiAgcmV0dXJuIFtcbiAgICBgPGNhbGxvdXQgZW1vamk9XCIke2NsZWFuRW1vaml9XCIgJHthdHRyU3RyfT5gLFxuICAgIGA8cD48Yj5cdTY1ODdcdTY4NjNcdTRGRTFcdTYwNkY8L2I+PC9wPmAsXG4gICAgYDx1bD5gLFxuICAgIC4uLmxpbmVzLFxuICAgIGA8L3VsPmAsXG4gICAgYDwvY2FsbG91dD5gLFxuICAgICcnLFxuICBdLmpvaW4oJ1xcbicpO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU5OERFXHU0RTY2XHUyMTkyT0JcdUZGMUFcdTg5RTNcdTY3OTBcdTU0MDhcdTVFNzZcdTRGRTFcdTYwNkYgY2FsbG91dCBcdTIxOTIgWUFNTCBcdTVCNTdcdTZCQjUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKlxuICogXHU0RUNFXHU5OERFXHU0RTY2IFhNTCBcdTc2ODRcdTU5MzRcdTkwRThcdTRGRTFcdTYwNkYgY2FsbG91dCBcdTRFMkRcdTg5RTNcdTY3OTBcdTUxRkEgWUFNTCBcdTVCNTdcdTZCQjVcdTUwM0NcdTMwMDJcbiAqIFx1NEY5RFx1NjM2RSBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTU2REJcdUZGMUFgPGxpPjxiPlx1NUI1N1x1NkJCNVx1NTQwRDwvYj5cdUZGMUFcdTUwM0M8L2xpPmAgXHU2ODNDXHU1RjBGXHUzMDAyXG4gKlxuICogQHBhcmFtIHhtbCBcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjMgWE1MIFx1NzI0N1x1NkJCNVxuICogQHJldHVybnMgXHU4OUUzXHU2NzkwXHU1MjMwXHU3Njg0XHU1MTQzXHU2NTcwXHU2MzZFXHU1QjU3XHU2QkI1XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxsb3V0WG1sVG9NZXRhKHhtbDogc3RyaW5nKTogUGFydGlhbDxLbm93bGVkZ2VNZXRhPiB7XG4gIGNvbnN0IHJlc3VsdDogUGFydGlhbDxLbm93bGVkZ2VNZXRhPiA9IHt9O1xuXG4gIC8vIFx1NjI3RVwiXHU2NTg3XHU2ODYzXHU0RkUxXHU2MDZGXCJjYWxsb3V0XG4gIGNvbnN0IGNhbGxvdXRSZSA9IC88Y2FsbG91dFxcYltePl0qPlxccyo8cD48Yj5cdTY1ODdcdTY4NjNcdTRGRTFcdTYwNkY8XFwvYj48XFwvcD5cXHMqPHVsPihbXFxzXFxTXSo/KTxcXC91bD5cXHMqPFxcL2NhbGxvdXQ+LztcbiAgY29uc3QgY2FsbG91dE1hdGNoID0geG1sLm1hdGNoKGNhbGxvdXRSZSk7XG4gIGlmICghY2FsbG91dE1hdGNoKSByZXR1cm4gcmVzdWx0O1xuXG4gIGNvbnN0IHVsQ29udGVudCA9IGNhbGxvdXRNYXRjaFsxXTtcbiAgY29uc3QgbGlSZSA9IC88bGk+PGI+KFtePF0rKTxcXC9iPltcdUZGMUE6XSguKz8pPFxcL2xpPi9nO1xuICBsZXQgbTogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcblxuICB3aGlsZSAoKG0gPSBsaVJlLmV4ZWModWxDb250ZW50KSkgIT09IG51bGwpIHtcbiAgICBjb25zdCBsYWJlbCA9IG1bMV0udHJpbSgpO1xuICAgIGNvbnN0IHZhbHVlID0gdW5lc2NhcGVGZWlzaHVUaWxkZShtWzJdLnRyaW0oKSk7XG5cbiAgICAvLyBcdTY4MzlcdTYzNkVcdTY4MDdcdTdCN0VcdTU0MERcdTY2MjBcdTVDMDRcdTUyMzBcdTVCNTdcdTZCQjVcbiAgICBpZiAobGFiZWwgPT09ICdcdTY4MDdcdTdCN0UnKSB7XG4gICAgICBjb25zdCB0YWcgPSBwYXJzZVRhZ1ZhbHVlKHZhbHVlKTtcbiAgICAgIGlmICh0YWcpIHJlc3VsdC5cdTY4MDdcdTdCN0UgPSB0YWc7XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1N0YxNlx1NzgwMScpIHtcbiAgICAgIHJlc3VsdC5cdTdGMTZcdTc4MDEgPSB2YWx1ZS5yZXBsYWNlKC9eXHVEODNEXHVERDIyXFxzKi8sICcnKS50cmltKCk7XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1OEY5M1x1NTE2NScpIHtcbiAgICAgIHJlc3VsdC5cdThGOTNcdTUxNjUgPSB2YWx1ZS5yZXBsYWNlKC9eXHVEODNEXHVEQ0U1XFxzKi8sICcnKS50cmltKCk7XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1NjVFNVx1NjcxRicpIHtcbiAgICAgIHJlc3VsdC5cdTY1RTVcdTY3MUYgPSB2YWx1ZS5yZXBsYWNlKC9eXHVEODNEXHVEQ0M1XFxzKi8sICcnKS50cmltKCk7XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1NTE3M1x1OTUyRVx1OEJDRCcpIHtcbiAgICAgIHJlc3VsdC5cdTUxNzNcdTk1MkVcdThCQ0QgPSB2YWx1ZS5yZXBsYWNlKC9eXHVEODNEXHVERDExXFxzKi8sICcnKS50cmltKCk7XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1OEJDNFx1NTIwNicpIHtcbiAgICAgIC8vIFx1NjNEMFx1NTNENlx1OEJDNFx1NTIwNlx1NjYzRVx1NzkzQVx1NEUzMlx1RkYwOFx1NTk4MiBcIlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RkY1Q1x1NUI5RVx1OERGNVwiXHVGRjA5XG4gICAgICByZXN1bHQuXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQSA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKHZhbHVlKTtcbiAgICAgIC8vIFx1NUMxRFx1OEJENVx1NjNEMFx1NTNENlx1NjU3MFx1NUI1N1xuICAgICAgY29uc3Qgc3RhckNvdW50ID0gKHZhbHVlLm1hdGNoKC9cdUQ4M0NcdURGMUYvZykgfHwgW10pLmxlbmd0aDtcbiAgICAgIGlmIChzdGFyQ291bnQgPj0gMSAmJiBzdGFyQ291bnQgPD0gNSkge1xuICAgICAgICByZXN1bHQuXHU4QkM0XHU1MjA2ID0gc3RhckNvdW50O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobGFiZWwgPT09ICdcdTdEMjJcdTVGMTUnKSB7XG4gICAgICAvLyBcdTdEMjJcdTVGMTVcdTY2MkZcdTU5MUFcdTdFRjRcdTVFQTZcdTU0MDhcdTVFNzZcdTY2M0VcdTc5M0FcdUZGMDhcdUQ4M0RcdURDQjBcdTZCNjNcdThEMjIgXHUwMEI3IFx1RDgzRFx1REQzNVx1NURFNVx1NEY1QyBcdTAwQjcgLi4uXHVGRjA5XG4gICAgICAvLyBcdTk3MDBcdTg5ODFcdThGREJcdTRFMDBcdTZCNjVcdTYyQzZcdTUyMDZcdTU0MDRcdTdFRjRcdTVFQTZcbiAgICAgIHBhcnNlSW5kZXhGaWVsZCh2YWx1ZSwgcmVzdWx0KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFx1ODlFM1x1Njc5MFx1N0QyMlx1NUYxNVx1NTQwOFx1NUU3Nlx1NUI1N1x1NkJCNSBcIlx1RDgzRFx1RENCMFx1NkI2M1x1OEQyMiBcdTAwQjcgXHVEODNEXHVERDM1XHU1REU1XHU0RjVDIFx1MDBCNyBcdTI3MDVcdTVCOENcdTYyMTAgXHUwMEI3IFx1RDgzQ1x1REZBRlx1NTE3N1x1OEM2MSBcdTAwQjcgXHUyNzA1XHU3QjgwXHU1MzU1IFx1MDBCNyBcdTI3NjRcdUZFMEZcdTUwNjVcdTVFQjdcIlxuICogXHU1NkRFXHU1NDA0XHU3RDIyXHU1RjE1XHU1QjUwXHU1QjU3XHU2QkI1XHUzMDAyXG4gKi9cbmZ1bmN0aW9uIHBhcnNlSW5kZXhGaWVsZCh2YWx1ZTogc3RyaW5nLCByZXN1bHQ6IFBhcnRpYWw8S25vd2xlZGdlTWV0YT4pOiB2b2lkIHtcbiAgY29uc3QgcGFydHMgPSB2YWx1ZS5zcGxpdCgvW1x1MDBCN1xcbl0vKS5tYXAocyA9PiBzLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pO1xuICBmb3IgKGNvbnN0IHBhcnQgb2YgcGFydHMpIHtcbiAgICBjb25zdCBjbGVhbmVkID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMocGFydCk7XG4gICAgLy8gXHU3N0U1XHU4QkM2XHU1RTkzXHU3RUY0XHU1RUE2XG4gICAgZm9yIChjb25zdCBrdyBvZiBbJ1x1NkI2M1x1OEQyMicsICdcdTUwNEZcdThEMjInLCAnXHU2QjYzXHU1MzcwJywgJ1x1NTA0Rlx1NTM3MCcsICdcdTZCNjNcdTVCQUInLCAnXHU0RjI0XHU1Qjk4J10pIHtcbiAgICAgIGlmIChjbGVhbmVkLmluY2x1ZGVzKGt3KSkgeyByZXN1bHQuXHU3RDIyXHU1RjE1X1x1NzdFNVx1OEJDNlx1NUU5MyA9IGt3OyBicmVhazsgfVxuICAgIH1cbiAgICAvLyBcdTk4OUNcdTgyNzJcdTdFRjRcdTVFQTZcbiAgICBmb3IgKGNvbnN0IGt3IG9mIFsnXHU3NzYxXHU3NzIwJywgJ1x1NURFNVx1NEY1QycsICdcdTc1MUZcdTZEM0InLCAnXHU1QTMxXHU0RTUwJywgJ1x1NzkzRVx1NEVBNCcsICdcdTVCNjZcdTRFNjAnLCAnXHU4RkQwXHU1MkE4J10pIHtcbiAgICAgIGlmIChjbGVhbmVkLmluY2x1ZGVzKGt3KSkgeyByZXN1bHQuXHU3RDIyXHU1RjE1X1x1OTg5Q1x1ODI3MiA9IGNsZWFuZWQ7IGJyZWFrOyB9XG4gICAgfVxuICAgIC8vIFx1NjRDRFx1NEY1Q1x1N0VGNFx1NUVBNlxuICAgIGZvciAoY29uc3Qga3cgb2YgWydcdTYwRjNcdTZDRDUnLCAnXHU4OUM0XHU1MjEyJywgJ1x1NjI2N1x1ODg0QycsICdcdTUzRDdcdTYzMkInLCAnXHU1MTRCXHU2NzBEJywgJ1x1NTIxRFx1N0EzRicsICdcdTVCQTFcdTY4MzgnLCAnXHU0RkVFXHU2NTM5JywgJ1x1NUI4Q1x1NjIxMCcsICdcdTU5MERcdTc2RDgnXSkge1xuICAgICAgaWYgKGNsZWFuZWQuaW5jbHVkZXMoa3cpKSB7XG4gICAgICAgIHJlc3VsdFsnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnXSA9IHJlc3VsdFsnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnXSA/PyBbXTtcbiAgICAgICAgaWYgKCFyZXN1bHRbJ1x1N0QyMlx1NUYxNV9cdTY0Q0RcdTRGNUMmXHU1M0NEXHU5OTg4J10uaW5jbHVkZXMoa3cpKSByZXN1bHRbJ1x1N0QyMlx1NUYxNV9cdTY0Q0RcdTRGNUMmXHU1M0NEXHU5OTg4J10ucHVzaChrdyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBcdTU3NTdcdTdFRjRcdTVFQTZcdUZGMDhcdTU5MUFcdTkwMDlcdUZGMDlcbiAgICBmb3IgKGNvbnN0IGt3IG9mIFsnXHU2MkJEXHU4QzYxJywgJ1x1NTE3N1x1OEM2MScsICdcdTdCODBcdTUzNTUnLCAnXHU1NkYwXHU5NkJFJ10pIHtcbiAgICAgIGlmIChjbGVhbmVkLmluY2x1ZGVzKGt3KSAmJiBrdyAhPT0gY2xlYW5lZCkge1xuICAgICAgICByZXN1bHQuXHU3RDIyXHU1RjE1X1x1NTc1NyA9IHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU1NzU3ID8/IFtdO1xuICAgICAgICBpZiAoIXJlc3VsdC5cdTdEMjJcdTVGMTVfXHU1NzU3LmluY2x1ZGVzKGt3KSkgcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTU3NTcucHVzaChrdyk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFx1OThDRVx1OTY2OVx1N0VGNFx1NUVBNlx1RkYwOFx1NTkxQVx1OTAwOVx1RkYwOVxuICAgIGZvciAoY29uc3Qga3cgb2YgWydcdTg4NENcdTRFM0EnLCAnXHU3QkExXHU3NDA2JywgJ1x1NTA2NVx1NUVCNycsICdcdTc3RTVcdThCQzYnLCAnXHU3OTNFXHU0RUE0JywgJ1x1NUJCNlx1NUVBRCcsICdcdTc5M0VcdTRGMUEnLCAnXHU2MTBGXHU1OTE2J10pIHtcbiAgICAgIGlmIChjbGVhbmVkLmluY2x1ZGVzKGt3KSAmJiBrdyAhPT0gY2xlYW5lZCkge1xuICAgICAgICByZXN1bHQuXHU3RDIyXHU1RjE1X1x1OThDRVx1OTY2OSA9IHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU5OENFXHU5NjY5ID8/IFtdO1xuICAgICAgICBpZiAoIXJlc3VsdC5cdTdEMjJcdTVGMTVfXHU5OENFXHU5NjY5LmluY2x1ZGVzKGt3KSkgcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2NjkucHVzaChrdyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTZCNjNcdTY1ODcgY2FsbG91dCBcdTUzQ0NcdTU0MTFcdThGNkNcdTYzNjIgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKlxuICogXHU5OERFXHU0RTY2XHU2QjYzXHU2NTg3IGNhbGxvdXQgWE1MIFx1MjE5MiBPQiBgPiBbIXR5cGVdYCBjYWxsb3V0XHUzMDAyXG4gKiBcdTRGOURcdTYzNkUgYDAzX1x1NjgzQ1x1NUYwRlx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3My4xXHUzMDAyXG4gKlxuICogXHU4RjkzXHU1MTY1XHU1MzU1XHU0RTJBIGA8Y2FsbG91dCAuLi4+Y29udGVudDwvY2FsbG91dD5gIFx1NTc1N1x1RkYwQ1x1OEY5M1x1NTFGQSBPQiBtYXJrZG93biBjYWxsb3V0XHUzMDAyXG4gKiBcdTU5MUFcdTRFMkEgY2FsbG91dCBcdTU3NTdcdTc1MzFcdThDMDNcdTc1MjhcdTY1QjlcdTYyQzZcdTUyMDZcdTU0MEVcdTkwMTBcdTRFMkFcdThDMDNcdTc1MjhcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZlaXNodUNhbGxvdXRUb09CKHhtbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gXHU2M0QwXHU1M0Q2XHU1QzVFXHU2MDI3XG4gIGNvbnN0IG9wZW5NYXRjaCA9IHhtbC5tYXRjaCgvPGNhbGxvdXRcXGIoW14+XSopPi8pO1xuICBpZiAoIW9wZW5NYXRjaCkgcmV0dXJuIHhtbDtcblxuICBjb25zdCBhdHRycyA9IG9wZW5NYXRjaFsxXTtcbiAgbGV0IGVtb2ppID0gJyc7XG4gIGxldCBiZ0NvbG9yID0gJyc7XG5cbiAgY29uc3QgZW1vamlNYXRjaCA9IGF0dHJzLm1hdGNoKC9lbW9qaT1bXCInXShbXlwiJ10rKVtcIiddLyk7XG4gIGlmIChlbW9qaU1hdGNoKSBlbW9qaSA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKGVtb2ppTWF0Y2hbMV0pO1xuXG4gIGNvbnN0IGJnTWF0Y2ggPSBhdHRycy5tYXRjaCgvYmFja2dyb3VuZC1jb2xvcj1bXCInXShbXlwiJ10rKVtcIiddLyk7XG4gIGlmIChiZ01hdGNoKSBiZ0NvbG9yID0gYmdNYXRjaFsxXTtcblxuICAvLyBcdTYzRDBcdTUzRDZcdTUxODVcdTVCQjlcdUZGMDhcdTUzQkJcdTYzODkgb3Blbi9jbG9zZSB0YWdcdUZGMDlcbiAgY29uc3QgY29udGVudCA9IHhtbFxuICAgIC5yZXBsYWNlKC88Y2FsbG91dFxcYltePl0qPi8sICcnKVxuICAgIC5yZXBsYWNlKC88XFwvY2FsbG91dD4vLCAnJylcbiAgICAudHJpbSgpO1xuXG4gIC8vIFx1NjYyMFx1NUMwNCBjYWxsb3V0IFx1N0M3Qlx1NTc4QlxuICBjb25zdCBvYlR5cGUgPSBtYXBGZWlzaHVCZ1RvT2JUeXBlKGJnQ29sb3IpO1xuICBjb25zdCBsaW5lcyA9IGh0bWxCbG9ja1RvVGV4dExpbmVzKGNvbnRlbnQpO1xuICBjb25zdCB0aXRsZSA9IGA+IFshJHtvYlR5cGV9XSR7ZW1vamkgPyBgICR7ZW1vaml9YCA6ICcnfWA7XG5cbiAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRpdGxlO1xuICByZXR1cm4gW3RpdGxlLCAuLi5saW5lcy5tYXAobGluZSA9PiBgPiAke2xpbmV9YCldLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIFx1NjI3OVx1OTFDRlx1NUMwNlx1OThERVx1NEU2NiBYTUwgXHU5MUNDXHU3Njg0XHU2MjQwXHU2NzA5IGNhbGxvdXQgXHU1NzU3XHU4RjZDXHU2MzYyXHU0RTNBIE9CIGNhbGxvdXRcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRGZWlzaHVDYWxsb3V0c1RvT0IoeG1sOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBjYWxsb3V0UmUgPSAvPGNhbGxvdXRcXGJbXj5dKj5bXFxzXFxTXSo/PFxcL2NhbGxvdXQ+L2c7XG4gIHJldHVybiB4bWwucmVwbGFjZShjYWxsb3V0UmUsIChtYXRjaCkgPT4gZmVpc2h1Q2FsbG91dFRvT0IobWF0Y2gpKTtcbn1cblxuLyoqXG4gKiBPQiBgPiBbIXR5cGVdYCBjYWxsb3V0IFx1MjE5MiBcdTk4REVcdTRFNjYgY2FsbG91dCBYTUxcdTMwMDJcbiAqIFx1NEY5RFx1NjM2RSBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTczLjJcdTMwMDJcbiAqXG4gKiBcdThGOTNcdTUxNjVcdTUzNTVcdTRFMkEgT0IgY2FsbG91dCBcdTU3NTdcdUZGMDhcdTU0MkIgYD4gWyF0eXBlXWAgXHU5OTk2XHU4ODRDICsgXHU1QjUwXHU4ODRDXHVGRjA5XHUzMDAyXG4gKiBcdTU5MUFcdTRFMkEgY2FsbG91dCBcdTc1MzFcdThDMDNcdTc1MjhcdTY1QjlcdTYyQzZcdTUyMDZcdTU0MEVcdTkwMTBcdTRFMkFcdThDMDNcdTc1MjhcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9iQ2FsbG91dFRvRmVpc2h1KG1kOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBsaW5lcyA9IG1kLnNwbGl0KCdcXG4nKS5tYXAobCA9PiBsLnJlcGxhY2UoL14+XFxzPy8sICcnKSk7XG4gIGlmIChsaW5lcy5sZW5ndGggPT09IDApIHJldHVybiBtZDtcblxuICAvLyBcdTg5RTNcdTY3OTBcdTk5OTZcdTg4NEMgYD4gWyF0eXBlXWBcbiAgY29uc3QgaGVhZGVyTWF0Y2ggPSBsaW5lc1swXS5tYXRjaCgvXFxbIShcXHcrKVxcXVxccyooLiopLyk7XG4gIGlmICghaGVhZGVyTWF0Y2gpIHJldHVybiBtZDtcblxuICBjb25zdCBvYlR5cGUgPSBoZWFkZXJNYXRjaFsxXTtcbiAgbGV0IHJlc3QgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhoZWFkZXJNYXRjaFsyXSA/PyAnJykudHJpbSgpO1xuICBjb25zdCBmZWlzaHUgPSBPQl9DQUxMT1VUX1RPX0ZFSVNIVVtvYlR5cGVdO1xuXG4gIGxldCBlbW9qaSA9IGZlaXNodT8uZW1vamkgPz8gJ1x1RDgzRFx1RENBMSc7XG4gIGxldCBiZyA9IGZlaXNodT8uYmcgPz8gJ2xpZ2h0LWJsdWUnO1xuICBsZXQgYm9yZGVyID0gZmVpc2h1Py5ib3JkZXIgPz8gJ2JsdWUnO1xuXG4gIC8vIFx1NUMxRFx1OEJENVx1NEVDRVx1OTk5Nlx1ODg0Q1x1NTI2OVx1NEY1OVx1NTE4NVx1NUJCOVx1NjNEMFx1NTNENlx1NzUyOFx1NjIzN1x1NTE5OVx1NzY4NCBlbW9qaVx1RkYwQ1x1NUU3Nlx1NEVDRVx1NkI2M1x1NjU4N1x1NEUyRFx1NzlGQlx1OTY2NFx1MzAwMlxuICBjb25zdCBlbW9qaU1hdGNoID0gcmVzdC5tYXRjaCgvXihcXHB7RXh0ZW5kZWRfUGljdG9ncmFwaGljfSlcXHMqL3UpO1xuICBpZiAoZW1vamlNYXRjaCkge1xuICAgIGVtb2ppID0gZW1vamlNYXRjaFsxXTtcbiAgICByZXN0ID0gcmVzdC5zbGljZShlbW9qaU1hdGNoWzBdLmxlbmd0aCkudHJpbVN0YXJ0KCk7XG4gIH1cblxuICAvLyBcdTUxODVcdTVCQjlcdUZGMDhcdTk5OTZcdTg4NENcdTUzQkJcdTYzODkgZW1vamkgKyBcdTU0MEVcdTdFRURcdTVCNTBcdTg4NENcdUZGMDlcbiAgY29uc3QgYm9keUxpbmVzID0gbGluZXMuc2xpY2UoMSk7XG4gIGlmIChyZXN0KSB7XG4gICAgYm9keUxpbmVzLnVuc2hpZnQocmVzdCk7XG4gIH1cbiAgY29uc3QgY29udGVudEh0bWwgPSBib2R5TGluZXNcbiAgICAuZmlsdGVyKGwgPT4gbC50cmltKCkpXG4gICAgLm1hcChsID0+IGA8cD4ke2x9PC9wPmApXG4gICAgLmpvaW4oJ1xcbicpO1xuXG4gIHJldHVybiBbXG4gICAgYDxjYWxsb3V0IGVtb2ppPVwiJHtlbW9qaX1cIiBiYWNrZ3JvdW5kLWNvbG9yPVwiJHtiZ31cIiBib3JkZXItY29sb3I9XCIke2JvcmRlcn1cIj5gLFxuICAgIGNvbnRlbnRIdG1sLFxuICAgIGA8L2NhbGxvdXQ+YCxcbiAgXS5qb2luKCdcXG4nKTtcbn1cblxuLyoqXG4gKiBcdTYyNzlcdTkxQ0ZcdTVDMDYgT0IgbWQgXHU5MUNDXHU3Njg0XHU2MjQwXHU2NzA5IGA+IFshdHlwZV1gIGNhbGxvdXQgXHU4RjZDXHU2MzYyXHU0RTNBXHU5OERFXHU0RTY2IFhNTCBjYWxsb3V0XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0T0JDYWxsb3V0c1RvRmVpc2h1KG1kOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBcdTUzMzlcdTkxNERcdThGREVcdTdFRURcdTc2ODQgY2FsbG91dCBcdTU3NTdcdUZGMDhcdTRFRTUgPiBbISBcdTVGMDBcdTU5MzRcdTc2ODRcdTg4NENcdUZGMENcdTc2RjRcdTUyMzBcdTk3NUUgPiBcdTYyMTZcdTdBN0FcdTg4NENcdUZGMDlcbiAgY29uc3QgY2FsbG91dFJlID0gLyg/Ol4+IFxcWyFcXHcrXFxdLipcXG4oPzpePi4qXFxuPykqKS9nbTtcbiAgcmV0dXJuIG1kLnJlcGxhY2UoY2FsbG91dFJlLCAobWF0Y2gpID0+IG9iQ2FsbG91dFRvRmVpc2h1KG1hdGNoKSk7XG59XG4iLCAiLyoqXG4gKiBcdTc2RUVcdTVGNTVcdTY2MjBcdTVDMDRcdTYzQThcdTVCRkNcdTMwMDJcdTRGOURcdTYzNkUgYDAxX09CXHUyMTk0XHU5OERFXHU0RTY2XHU1QkY5XHU2QkQ0XHU2MkE1XHU1NDRBLm1kYCArIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgIFx1MDBBN1x1NEUwM1x1MzAwMlxuICpcbiAqIE9CIDI1IFx1NEUyQVx1NjgzOVx1NzZFRVx1NUY1NSBcdTIxOTIgXHU5OERFXHU0RTY2IDUgXHU0RTJBXHU5ODc2XHU3RUE3XHU4MjgyXHU3MEI5XHU3Njg0XHU2NjIwXHU1QzA0XHU4OUM0XHU1MjE5XHVGRjFBXG4gKiAgIDBcdUZFMEZcdTIwRTNcdThGOTNcdTUxNjUgLyBTIFx1MjE5MiBcdTk4REVcdTRFNjZcIlx1OEY5M1x1NTE2NVwiXG4gKiAgIDFcdUZFMEZcdTIwRTNcdThGOTNcdTUxRkEgLyBYIFx1MjE5MiBcdTk4REVcdTRFNjZcIlx1OEY5M1x1NTFGQVwiXG4gKiAgIDJcdUZFMEZcdTIwRTNcdUQ4M0RcdUREQzNcdTc3RTVcdThCQzZcdTZDNjAgLyBaIC8gTCAvIEogLyBRIFx1MjE5MiBcdTk4REVcdTRFNjZcIlx1NzdFNVx1OEJDNlx1NkM2MFwiXG4gKiAgIFx1RDgzRVx1REVBN1x1NUJGQ1x1NUYxNSBcdTIxOTIgXHU5OERFXHU0RTY2XCJcdTVCRkNcdTVGMTVcIlxuICogICAzXHVGRTBGXHUyMEUzXHU5NjQ0XHU0RUY2XHU2NTg3XHU0RUY2IFx1MjE5MiBcdTk4REVcdTRFNjZcIlx1OTY0NFx1NEVGNlwiXHVGRjA4XHU3Mjc5XHU2QjhBXHVGRjBDXHU5NzVFXHU2NTg3XHU2ODYzXHVGRjA5XG4gKlxuICogXHU2M0E4XHU1QkZDXHU3RUQzXHU2NzlDXHU3RjEzXHU1QjU4XHU1MjMwIGAuZmVpc2h1LXN5bmMvbWFwcGluZy5qc29uYFx1RkYwQ1x1NEUwRFx1Nzg2Q1x1N0YxNlx1NzgwMVx1MzAwMlxuICovXG5pbXBvcnQgeyBOb3RpY2UsIFRGb2xkZXIsIHR5cGUgQXBwIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgbGlzdFdpa2lDaGlsZHJlbiB9IGZyb20gJy4vbGFyay9jbGkuanMnO1xuXG5jb25zdCBNQVBQSU5HX0ZJTEUgPSAnLmZlaXNodS1zeW5jL21hcHBpbmcuanNvbic7XG5cbi8qKiBcdTUzNTVcdTY3NjFcdTY2MjBcdTVDMDRcdUZGMUFPQiBcdThERUZcdTVGODQgXHUyMTkyIFx1OThERVx1NEU2Nlx1ODI4Mlx1NzBCOVx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBEaXJNYXBwaW5nIHtcbiAgLyoqIE9CIFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NTk4MiBcIjBcdUZFMEZcdTIwRTNcdThGOTNcdTUxNjUvXHVEODNEXHVEQ0ExXHU3ODhFXHU3MjQ3XHU4RjkzXHU1MTY1XHVGRjA4XHU5NUVBXHU1RkY1XHVGRjA5XCJcdTMwMDIgKi9cbiAgb2JQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTk4REVcdTRFNjYgbm9kZV90b2tlblx1MzAwMiAqL1xuICBmZWlzaHVOb2RlVG9rZW46IHN0cmluZztcbiAgLyoqIFx1OThERVx1NEU2Nlx1ODI4Mlx1NzBCOVx1NjgwN1x1OTg5OFx1MzAwMiAqL1xuICBmZWlzaHVUaXRsZTogc3RyaW5nO1xufVxuXG4vKiogXHU2NjIwXHU1QzA0XHU3RjEzXHU1QjU4XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIE1hcHBpbmdDYWNoZSB7XG4gIC8qKiBcdTc1MUZcdTYyMTBcdTY1RjZcdTk1RjRcdTMwMDIgKi9cbiAgZ2VuZXJhdGVkQXQ6IHN0cmluZztcbiAgLyoqIHNwYWNlX2lkXHUzMDAyICovXG4gIHNwYWNlSWQ6IHN0cmluZztcbiAgLyoqIFx1OTg3Nlx1N0VBN1x1ODI4Mlx1NzBCOVx1MzAwMiAqL1xuICB0b3BOb2RlczogQXJyYXk8eyB0b2tlbjogc3RyaW5nOyB0aXRsZTogc3RyaW5nIH0+O1xuICAvKiogXHU4QkU2XHU3RUM2XHU2NjIwXHU1QzA0XHUzMDAyICovXG4gIG1hcHBpbmdzOiBEaXJNYXBwaW5nW107XG59XG5cbi8qKiBPQiBcdTY4MzlcdTc2RUVcdTVGNTUgZW1vamkgXHUyMTkyIFx1OThERVx1NEU2Nlx1OTg3Nlx1N0VBN1x1ODI4Mlx1NzBCOVx1NjgwN1x1OTg5OFx1RkYwOFx1NEY5RFx1NjM2RSAwMSBcdTVCRjlcdTZCRDRcdTYyQTVcdTU0NEFcdUZGMDlcdTMwMDIgKi9cbmNvbnN0IFJPT1RfRElSX1RPX0ZFSVNIVTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJzBcdUZFMEZcdTIwRTNcdThGOTNcdTUxNjUnOiAnXHU4RjkzXHU1MTY1JyxcbiAgJzFcdUZFMEZcdTIwRTNcdThGOTNcdTUxRkEnOiAnXHU4RjkzXHU1MUZBJyxcbiAgJzJcdUZFMEZcdTIwRTNcdUQ4M0RcdUREQzNcdTc3RTVcdThCQzZcdTZDNjAnOiAnXHU3N0U1XHU4QkM2XHU2QzYwJyxcbiAgJzNcdUZFMEZcdTIwRTNcdTk2NDRcdTRFRjZcdTY1ODdcdTRFRjYnOiAnXHU5NjQ0XHU0RUY2JyxcbiAgJ1x1RDgzRVx1REVBN1x1NUJGQ1x1NUYxNSc6ICdcdTVCRkNcdTVGMTUnLFxufTtcblxuLyoqXG4gKiBcdTYzQThcdTVCRkNcdTVFNzZcdTdGMTNcdTVCNThcdTc2RUVcdTVGNTVcdTY2MjBcdTVDMDRcdTMwMDJcbiAqIDEuIFx1NjJDOVx1OThERVx1NEU2Nlx1OTg3Nlx1N0VBN1x1ODI4Mlx1NzBCOVx1NTIxN1x1ODg2OFxuICogMi4gXHU2MzA5IGVtb2ppIFx1ODlDNFx1NTIxOVx1NTMzOVx1OTE0RCBPQiBcdTY4MzlcdTc2RUVcdTVGNTUgXHUyMTkyIFx1OThERVx1NEU2Nlx1OTg3Nlx1N0VBN1xuICogMy4gXHU5MDEyXHU1RjUyXHU1MzM5XHU5MTREXHU1QjUwXHU3NkVFXHU1RjU1XHVGRjA4XHU2MzA5XHU2ODA3XHU5ODk4XHU2QTIxXHU3Q0NBXHU1MzM5XHU5MTREXHVGRjA5XG4gKiA0LiBcdTUxOTlcdTUxNjUgLmZlaXNodS1zeW5jL21hcHBpbmcuanNvblxuICpcbiAqIEByZXR1cm5zIFx1NjNBOFx1NUJGQ1x1NzY4NFx1NjYyMFx1NUMwNFx1NjU3MFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVmcmVzaE1hcHBpbmcoYXBwOiBBcHAsIHNwYWNlSWQ6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gIGlmICghc3BhY2VJZCkge1xuICAgIG5ldyBOb3RpY2UoJ1x1MjZBMFx1RkUwRiBcdTY3MkFcdTkxNERcdTdGNkUgc3BhY2VfaWRcdUZGMENcdThCRjdcdTU3MjhcdThCQkVcdTdGNkVcdTk4NzVcdTU4NkJcdTUxOTknKTtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIG5ldyBOb3RpY2UoJ1x1RDgzRFx1REQwNCBcdTYzQThcdTVCRkNcdTc2RUVcdTVGNTVcdTY2MjBcdTVDMDQuLi4nKTtcblxuICAvLyBcdTYyQzkgNSBcdTRFMkFcdTk4NzZcdTdFQTdcdTgyODJcdTcwQjlcbiAgY29uc3QgdG9wTm9kZXMgPSBsaXN0V2lraUNoaWxkcmVuKHNwYWNlSWQsICcnKTtcbiAgaWYgKHRvcE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIG5ldyBOb3RpY2UoJ1x1MjZBMFx1RkUwRiBcdTYyQzlcdTRFMERcdTUyMzBcdTk4REVcdTRFNjZcdTk4NzZcdTdFQTdcdTgyODJcdTcwQjlcdUZGMENcdThCRjdcdTY4QzBcdTY3RTUgc3BhY2VfaWQgXHU1NDhDIGxhcmstY2xpIFx1NzY3Qlx1NUY1NVx1NjAwMScpO1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgY29uc3QgbWFwcGluZ3M6IERpck1hcHBpbmdbXSA9IFtdO1xuXG4gIC8vIFx1OTg3Nlx1N0VBN1x1NTMzOVx1OTE0RFxuICBmb3IgKGNvbnN0IFtvYlJvb3QsIGZlaXNodVRpdGxlXSBvZiBPYmplY3QuZW50cmllcyhST09UX0RJUl9UT19GRUlTSFUpKSB7XG4gICAgY29uc3QgbWF0Y2hlZCA9IHRvcE5vZGVzLmZpbmQobiA9PiBuLnRpdGxlLmluY2x1ZGVzKGZlaXNodVRpdGxlKSB8fCBmZWlzaHVUaXRsZS5pbmNsdWRlcyhuLnRpdGxlKSk7XG4gICAgaWYgKG1hdGNoZWQpIHtcbiAgICAgIG1hcHBpbmdzLnB1c2goe1xuICAgICAgICBvYlBhdGg6IG9iUm9vdCxcbiAgICAgICAgZmVpc2h1Tm9kZVRva2VuOiBtYXRjaGVkLm5vZGVfdG9rZW4sXG4gICAgICAgIGZlaXNodVRpdGxlOiBtYXRjaGVkLnRpdGxlLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gXHU5MDEyXHU1RjUyXHU1MzM5XHU5MTREXHU1QjUwXHU3NkVFXHU1RjU1XHVGRjA4XHU0RTAwXHU3RUE3XHU1MzczXHU1M0VGXHVGRjBDXHU5MDdGXHU1MTREXHU4RkM3XHU2REYxXHVGRjA5XG4gIGNvbnN0IHJvb3QgPSBhcHAudmF1bHQuZ2V0Um9vdCgpO1xuICBmb3IgKGNvbnN0IGNoaWxkIG9mIHJvb3QuY2hpbGRyZW4pIHtcbiAgICBpZiAoIShjaGlsZCBpbnN0YW5jZW9mIFRGb2xkZXIpKSBjb250aW51ZTtcbiAgICBpZiAoIWNoaWxkLm5hbWUgfHwgY2hpbGQubmFtZS5zdGFydHNXaXRoKCcuJykpIGNvbnRpbnVlO1xuICAgIGlmICghY2hpbGQuY2hpbGRyZW4ubGVuZ3RoKSBjb250aW51ZTtcbiAgICAvLyBcdTYyN0VcdTUyMzBcdThGRDlcdTRFMkFcdTY4MzlcdTc2ODRcdTk4REVcdTRFNjYgdG9rZW5cbiAgICBjb25zdCByb290TWFwcGluZyA9IG1hcHBpbmdzLmZpbmQobSA9PiBtLm9iUGF0aCA9PT0gY2hpbGQubmFtZSk7XG4gICAgaWYgKCFyb290TWFwcGluZykgY29udGludWU7XG5cbiAgICAvLyBcdTYyQzlcdTk4REVcdTRFNjZcdTVCNTBcdTgyODJcdTcwQjlcbiAgICBjb25zdCBmZWlzaHVDaGlsZHJlbiA9IGxpc3RXaWtpQ2hpbGRyZW4oc3BhY2VJZCwgcm9vdE1hcHBpbmcuZmVpc2h1Tm9kZVRva2VuKTtcbiAgICBmb3IgKGNvbnN0IG9iU3ViIG9mIGNoaWxkLmNoaWxkcmVuKSB7XG4gICAgICBpZiAoIW9iU3ViLm5hbWUgfHwgb2JTdWIubmFtZS5zdGFydHNXaXRoKCcuJykpIGNvbnRpbnVlO1xuICAgICAgLy8gXHU2QTIxXHU3Q0NBXHU1MzM5XHU5MTREXHVGRjA4XHU1M0JCXHU2Mzg5XHU3RjE2XHU3ODAxXHU1MjREXHU3RjAwXHU1NDBFXHU2QkQ0XHU4RjgzXHVGRjA5XG4gICAgICBjb25zdCBjbGVhbk9iTmFtZSA9IG9iU3ViLm5hbWUucmVwbGFjZSgvXlxcZHsyfV9cXGR7NH1fW1NYWkxRSl1cXGQrXFxzKi8sICcnKTtcbiAgICAgIGNvbnN0IG1hdGNoZWQgPSBmZWlzaHVDaGlsZHJlbi5maW5kKFxuICAgICAgICBuID0+IG4udGl0bGUuaW5jbHVkZXMoY2xlYW5PYk5hbWUpIHx8IGNsZWFuT2JOYW1lLmluY2x1ZGVzKG4udGl0bGUpLFxuICAgICAgKTtcbiAgICAgIGlmIChtYXRjaGVkKSB7XG4gICAgICAgIG1hcHBpbmdzLnB1c2goe1xuICAgICAgICAgIG9iUGF0aDogYCR7Y2hpbGQubmFtZX0vJHtvYlN1Yi5uYW1lfWAsXG4gICAgICAgICAgZmVpc2h1Tm9kZVRva2VuOiBtYXRjaGVkLm5vZGVfdG9rZW4sXG4gICAgICAgICAgZmVpc2h1VGl0bGU6IG1hdGNoZWQudGl0bGUsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFx1NTE5OVx1N0YxM1x1NUI1OFxuICBjb25zdCBjYWNoZTogTWFwcGluZ0NhY2hlID0ge1xuICAgIGdlbmVyYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgc3BhY2VJZCxcbiAgICB0b3BOb2RlczogdG9wTm9kZXMubWFwKG4gPT4gKHsgdG9rZW46IG4ubm9kZV90b2tlbiwgdGl0bGU6IG4udGl0bGUgfSkpLFxuICAgIG1hcHBpbmdzLFxuICB9O1xuXG4gIGF3YWl0IGVuc3VyZUNvbmZpZ0RpcihhcHApO1xuICBhd2FpdCBhcHAudmF1bHQuYWRhcHRlci53cml0ZShNQVBQSU5HX0ZJTEUsIEpTT04uc3RyaW5naWZ5KGNhY2hlLCBudWxsLCAyKSk7XG5cbiAgbmV3IE5vdGljZShgXHUyNzA1IFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1NURGMlx1NjZGNFx1NjVCMFx1RkYwOCR7bWFwcGluZ3MubGVuZ3RofSBcdTY3NjFcdUZGMDlgKTtcbiAgcmV0dXJuIG1hcHBpbmdzLmxlbmd0aDtcbn1cblxuLyoqXG4gKiBcdThCRkJcdTY2MjBcdTVDMDRcdTdGMTNcdTVCNThcdTMwMDJcdTY1RTBcdTdGMTNcdTVCNThcdThGRDRcdTU2REUgbnVsbFx1MzAwMlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZE1hcHBpbmcoYXBwOiBBcHApOiBQcm9taXNlPE1hcHBpbmdDYWNoZSB8IG51bGw+IHtcbiAgdHJ5IHtcbiAgICBpZiAoIShhd2FpdCBhcHAudmF1bHQuYWRhcHRlci5leGlzdHMoTUFQUElOR19GSUxFKSkpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IHJhdyA9IGF3YWl0IGFwcC52YXVsdC5hZGFwdGVyLnJlYWQoTUFQUElOR19GSUxFKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShyYXcpIGFzIE1hcHBpbmdDYWNoZTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS53YXJuKCdbc3luYy9tYXBwaW5nXSBsb2FkIGZhaWxlZDonLCBlcnIpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogXHU2N0U1IE9CIFx1OERFRlx1NUY4NFx1NUJGOVx1NUU5NFx1NzY4NFx1OThERVx1NEU2Nlx1ODI4Mlx1NzBCOSB0b2tlblx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9va3VwRmVpc2h1Tm9kZShjYWNoZTogTWFwcGluZ0NhY2hlLCBvYlBhdGg6IHN0cmluZyk6IERpck1hcHBpbmcgfCBudWxsIHtcbiAgLy8gXHU3Q0JFXHU3ODZFXHU1MzM5XHU5MTREXG4gIGNvbnN0IGV4YWN0ID0gY2FjaGUubWFwcGluZ3MuZmluZChtID0+IG0ub2JQYXRoID09PSBvYlBhdGgpO1xuICBpZiAoZXhhY3QpIHJldHVybiBleGFjdDtcblxuICAvLyBcdTUyNERcdTdGMDBcdTUzMzlcdTkxNERcdUZGMDhcdTUzRDZcdTY3MDBcdTk1N0ZcdTUzMzlcdTkxNERcdUZGMDlcbiAgbGV0IGJlc3Q6IERpck1hcHBpbmcgfCBudWxsID0gbnVsbDtcbiAgZm9yIChjb25zdCBtIG9mIGNhY2hlLm1hcHBpbmdzKSB7XG4gICAgaWYgKG9iUGF0aC5zdGFydHNXaXRoKG0ub2JQYXRoICsgJy8nKSB8fCBvYlBhdGguc3RhcnRzV2l0aChtLm9iUGF0aCkpIHtcbiAgICAgIGlmICghYmVzdCB8fCBtLm9iUGF0aC5sZW5ndGggPiBiZXN0Lm9iUGF0aC5sZW5ndGgpIGJlc3QgPSBtO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYmVzdDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZW5zdXJlQ29uZmlnRGlyKGFwcDogQXBwKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGRpciA9ICcuZmVpc2h1LXN5bmMnO1xuICBpZiAoIShhd2FpdCBhcHAudmF1bHQuYWRhcHRlci5leGlzdHMoZGlyKSkpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIoZGlyKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8qIGlnbm9yZSAqL1xuICAgIH1cbiAgfVxufVxuIiwgIi8qKlxuICogXHU2NzJDXHU1NzMwIEhUVFAgc2VydmVyXHUzMDAyXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzJcdUZGMDhsb2NhbGhvc3QgSFRUUCBcdTUzNEZcdThCQUVcdUZGMDlcdTMwMDJcbiAqXG4gKiAtIFx1NzUyOCBub2RlOmh0dHAgXHU4RDc3IHNlcnZlclx1RkYwOE9CIFx1NjNEMlx1NEVGNiBpc0Rlc2t0b3BPbmx5XHVGRjBDXHU1M0VGXHU3NTI4IG5vZGUgXHU1MTg1XHU3RjZFXHU2QTIxXHU1NzU3XHVGRjA5XG4gKiAtIFx1N0FFRlx1NTNFM1x1NTNFRlx1OTE0RFx1N0Y2RVx1RkYwOFx1OUVEOFx1OEJBNCA0NTY3XHVGRjA5XG4gKiAtIFx1OTI3NFx1Njc0M1x1RkYxQVx1NkJDRlx1NEUyQVx1OEJGN1x1NkM0Mlx1NjgyMVx1OUE4QyBYLVN5bmMtVG9rZW4gaGVhZGVyXG4gKiAtIENPUlNcdUZGMUFcdTY1M0VcdTkwMUEgT1BUSU9OUyBcdTk4ODRcdTY4QzBcdUZGMDhcdTYyNjlcdTVDNTVcdTRFQ0VcdTk4REVcdTRFNjZcdTk4NzVcdTk3NjIgZmV0Y2ggXHU0RjFBXHU4OEFCXHU2MkU2XHVGRjA5XG4gKiAtIFx1OERFRlx1NzUzMVx1NTIwNlx1NTNEMVx1NTIzMCBoYW5kbGVyc1xuICovXG5pbXBvcnQgKiBhcyBodHRwIGZyb20gJ25vZGU6aHR0cCc7XG5pbXBvcnQgeyBUT0tFTl9IRUFERVIgfSBmcm9tICdAc3luYy9zaGFyZWQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlcnZlckRlcHMge1xuICAvKiogXHU2ODIxXHU5QThDIHRva2VuIFx1NjYyRlx1NTQyNlx1NTMzOVx1OTE0RFx1MzAwMiAqL1xuICB2YWxpZGF0ZVRva2VuOiAodG9rZW46IHN0cmluZykgPT4gYm9vbGVhbjtcbiAgLyoqIFx1OERFRlx1NzUzMVx1NTkwNFx1NzQwNlx1NTY2OFx1NjYyMFx1NUMwNFx1MzAwMiAqL1xuICByb3V0ZXM6IE1hcDxzdHJpbmcsIFJvdXRlSGFuZGxlcj47XG4gIG1heEJvZHlCeXRlcz86IG51bWJlcjtcbiAgYm9keVRpbWVvdXRNcz86IG51bWJlcjtcbiAgaGFuZGxlclRpbWVvdXRNcz86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0Q29udGV4dCB7XG4gIG1ldGhvZDogc3RyaW5nO1xuICB1cmw6IHN0cmluZztcbiAgLyoqIFx1ODlFM1x1Njc5MFx1NTQwRVx1NzY4NCBwYXRoXHVGRjA4XHU0RTBEXHU1NDJCIHF1ZXJ5XHVGRjA5XHUzMDAyICovXG4gIHBhdGg6IHN0cmluZztcbiAgLyoqIHF1ZXJ5IFx1NTNDMlx1NjU3MFx1MzAwMiAqL1xuICBxdWVyeTogVVJMU2VhcmNoUGFyYW1zO1xuICAvKiogXHU4QkY3XHU2QzQyXHU0RjUzXHVGRjA4UE9TVC9QVVQgXHU2MjREXHU2NzA5XHVGRjBDXHU1REYyIHBhcnNlIEpTT05cdUZGMDlcdTMwMDIgKi9cbiAgYm9keT86IHVua25vd247XG4gIC8qKiBcdTUzOUZcdTU5Q0IgdG9rZW5cdTMwMDIgKi9cbiAgdG9rZW46IHN0cmluZztcbiAgLyoqIFx1NjNEMlx1NEVGNlx1NTM3OFx1OEY3RFx1NjIxNlx1OEJGN1x1NkM0Mlx1OEQ4NVx1NjVGNlx1NjVGNlx1NTNENlx1NkQ4OFx1NEUwQlx1NkUzOFx1NURFNVx1NEY1Q1x1MzAwMiAqL1xuICBzaWduYWw/OiBBYm9ydFNpZ25hbDtcbn1cblxuZXhwb3J0IHR5cGUgUm91dGVIYW5kbGVyID0gKGN0eDogUmVxdWVzdENvbnRleHQpID0+IFByb21pc2U8dW5rbm93bj4gfCB1bmtub3duO1xuXG4vKiogSlNPTiBcdTU0Q0RcdTVFOTRcdTVERTVcdTUxNzdcdTMwMDIgKi9cbmZ1bmN0aW9uIGpzb24ocmVzOiBodHRwLlNlcnZlclJlc3BvbnNlLCBzdGF0dXM6IG51bWJlciwgZGF0YTogdW5rbm93bik6IHZvaWQge1xuICBjb25zdCBib2R5ID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gIHJlcy53cml0ZUhlYWQoc3RhdHVzLCB7XG4gICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04JyxcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogYCR7VE9LRU5fSEVBREVSfSwgQ29udGVudC1UeXBlYCxcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsIFBPU1QsIE9QVElPTlMnLFxuICAgICdDb250ZW50LUxlbmd0aCc6IEJ1ZmZlci5ieXRlTGVuZ3RoKGJvZHkpLFxuICB9KTtcbiAgcmVzLmVuZChib2R5KTtcbn1cblxuLyoqXG4gKiBcdTU0MkZcdTUyQTggSFRUUCBzZXJ2ZXJcdTMwMDJcbiAqIEByZXR1cm5zIHN0b3AoKSBcdTUxRkRcdTY1NzBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0U2VydmVyKFxuICBwb3J0OiBudW1iZXIsXG4gIGRlcHM6IFNlcnZlckRlcHMsXG4pOiBQcm9taXNlPHsgcG9ydDogbnVtYmVyOyBzdG9wOiAoKSA9PiBQcm9taXNlPHZvaWQ+IH0+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcigocmVxLCByZXMpID0+IHtcbiAgICAgIGhhbmRsZVJlcXVlc3QocmVxLCByZXMsIHBvcnQsIGRlcHMpLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICBpZiAocmVzLmhlYWRlcnNTZW50IHx8IHJlcy5kZXN0cm95ZWQpIHJldHVybjtcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZUh0dHBFcnJvcihlcnJvcik7XG4gICAgICAgIGpzb24ocmVzLCBub3JtYWxpemVkLnN0YXR1cywgeyBvazogZmFsc2UsIGNvZGU6IG5vcm1hbGl6ZWQuY29kZSwgbWVzc2FnZTogbm9ybWFsaXplZC5tZXNzYWdlIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJ2ZXIub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICBzZXJ2ZXIubGlzdGVuKHBvcnQsICcxMjcuMC4wLjEnLCAoKSA9PiB7XG4gICAgICBjb25zdCBhZGRyZXNzID0gc2VydmVyLmFkZHJlc3MoKTtcbiAgICAgIGNvbnN0IGFjdHVhbFBvcnQgPSB0eXBlb2YgYWRkcmVzcyA9PT0gJ29iamVjdCcgJiYgYWRkcmVzcyA/IGFkZHJlc3MucG9ydCA6IHBvcnQ7XG4gICAgICBjb25zb2xlLmxvZyhgW3N5bmMvc2VydmVyXSBsaXN0ZW5pbmcgb24gaHR0cDovLzEyNy4wLjAuMToke2FjdHVhbFBvcnR9YCk7XG4gICAgICByZXNvbHZlKHtcbiAgICAgICAgcG9ydDogYWN0dWFsUG9ydCxcbiAgICAgICAgc3RvcDogKCkgPT4gbmV3IFByb21pc2UoKGRvbmUpID0+IHtcbiAgICAgICAgICBzZXJ2ZXIuY2xvc2VBbGxDb25uZWN0aW9ucz8uKCk7XG4gICAgICAgICAgc2VydmVyLmNsb3NlKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbc3luYy9zZXJ2ZXJdIHN0b3BwZWQnKTtcbiAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSksXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlcXVlc3QoXG4gIHJlcTogaHR0cC5JbmNvbWluZ01lc3NhZ2UsXG4gIHJlczogaHR0cC5TZXJ2ZXJSZXNwb25zZSxcbiAgcG9ydDogbnVtYmVyLFxuICBkZXBzOiBTZXJ2ZXJEZXBzLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAvLyBDT1JTIFx1OTg4NFx1NjhDMFxuICAgICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgICByZXMud3JpdGVIZWFkKDIwNCwge1xuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiBgJHtUT0tFTl9IRUFERVJ9LCBDb250ZW50LVR5cGVgLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCwgUE9TVCwgT1BUSU9OUycsXG4gICAgICAgIH0pO1xuICAgICAgICByZXMuZW5kKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZnVsbFVybCA9IHJlcS51cmwgPz8gJy8nO1xuICAgICAgY29uc3QgdXJsT2JqID0gbmV3IFVSTChmdWxsVXJsLCBgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9YCk7XG4gICAgICBjb25zdCBjdHhQYXRoID0gdXJsT2JqLnBhdGhuYW1lO1xuICAgICAgY29uc3QgaGFuZGxlciA9IGRlcHMucm91dGVzLmdldChjdHhQYXRoKTtcbiAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICBqc29uKHJlcywgNDA0LCB7IG9rOiBmYWxzZSwgY29kZTogJ05PVF9GT1VORCcsIG1lc3NhZ2U6IGBVbmtub3duIHBhdGg6ICR7Y3R4UGF0aH1gIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRva2VuID0gcmVxLmhlYWRlcnNbVE9LRU5fSEVBREVSLnRvTG93ZXJDYXNlKCldIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgIGlmICghZGVwcy52YWxpZGF0ZVRva2VuKHRva2VuID8/ICcnKSkge1xuICAgICAgICBqc29uKHJlcywgNDAxLCB7IG9rOiBmYWxzZSwgY29kZTogJ1VOQVVUSE9SSVpFRCcsIG1lc3NhZ2U6ICdJbnZhbGlkIG9yIG1pc3NpbmcgWC1TeW5jLVRva2VuJyB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBleHBlY3RlZE1ldGhvZCA9IGN0eFBhdGggPT09ICcvc3RhdHVzJyB8fCBjdHhQYXRoID09PSAnL3RyZWUnID8gJ0dFVCcgOiAnUE9TVCc7XG4gICAgICBpZiAocmVxLm1ldGhvZCAhPT0gZXhwZWN0ZWRNZXRob2QpIHtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWxsb3cnLCBleHBlY3RlZE1ldGhvZCk7XG4gICAgICAgIGpzb24ocmVzLCA0MDUsIHsgb2s6IGZhbHNlLCBjb2RlOiAnTUVUSE9EX05PVF9BTExPV0VEJywgbWVzc2FnZTogYCR7Y3R4UGF0aH0gcmVxdWlyZXMgJHtleHBlY3RlZE1ldGhvZH1gIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCBib2R5OiB1bmtub3duO1xuICAgICAgaWYgKGV4cGVjdGVkTWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICAgICAgYm9keSA9IGF3YWl0IHJlYWRKc29uQm9keShyZXEsIGRlcHMubWF4Qm9keUJ5dGVzID8/IDEwMjQgKiAxMDI0LCBkZXBzLmJvZHlUaW1lb3V0TXMgPz8gMTBfMDAwKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgIGNvbnN0IHRpbWVvdXRNcyA9IE1hdGgubWF4KDEsIGRlcHMuaGFuZGxlclRpbWVvdXRNcyA/PyAxMjBfMDAwKTtcbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBleHBlY3RlZE1ldGhvZCA9PT0gJ0dFVCdcbiAgICAgICAgPyBzZXRUaW1lb3V0KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSwgdGltZW91dE1zKVxuICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXJSZXN1bHQgPSBQcm9taXNlLnJlc29sdmUoaGFuZGxlcih7XG4gICAgICAgICAgbWV0aG9kOiByZXEubWV0aG9kID8/ICdHRVQnLFxuICAgICAgICAgIHVybDogZnVsbFVybCxcbiAgICAgICAgICBwYXRoOiBjdHhQYXRoLFxuICAgICAgICAgIHF1ZXJ5OiB1cmxPYmouc2VhcmNoUGFyYW1zLFxuICAgICAgICAgIGJvZHksXG4gICAgICAgICAgdG9rZW46IHRva2VuID8/ICcnLFxuICAgICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICAgIH0pKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZXhwZWN0ZWRNZXRob2QgPT09ICdHRVQnXG4gICAgICAgICAgPyBhd2FpdCBQcm9taXNlLnJhY2UoW2hhbmRsZXJSZXN1bHQsIG5ldyBQcm9taXNlPG5ldmVyPigoX3Jlc29sdmUsIHJlamVjdFRpbWVvdXQpID0+IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgKCkgPT4ge1xuICAgICAgICAgICAgICByZWplY3RUaW1lb3V0KG5ldyBIdHRwRXJyb3IoJ1JFUVVFU1RfVElNRU9VVCcsICdSZXF1ZXN0IHRpbWVkIG91dCcsIDUwNCkpO1xuICAgICAgICAgICAgfSwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICAgIH0pXSlcbiAgICAgICAgICA6IGF3YWl0IGhhbmRsZXJSZXN1bHQ7XG4gICAgICAgIGpzb24ocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZUh0dHBFcnJvcihlcnIpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbc3luYy9zZXJ2ZXJdIGhhbmRsZXIgZXJyb3I6JywgZXJyKTtcbiAgICAgICAganNvbihyZXMsIG5vcm1hbGl6ZWQuc3RhdHVzLCB7IG9rOiBmYWxzZSwgY29kZTogbm9ybWFsaXplZC5jb2RlLCBtZXNzYWdlOiBub3JtYWxpemVkLm1lc3NhZ2UgfSk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAodGltZW91dCkgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiByZWFkSnNvbkJvZHkoXG4gIHJlcTogaHR0cC5JbmNvbWluZ01lc3NhZ2UsXG4gIG1heEJvZHlCeXRlczogbnVtYmVyLFxuICB0aW1lb3V0TXM6IG51bWJlcixcbik6IFByb21pc2U8dW5rbm93bj4ge1xuICBjb25zdCBkZWNsYXJlZExlbmd0aCA9IE51bWJlcihyZXEuaGVhZGVyc1snY29udGVudC1sZW5ndGgnXSA/PyAwKTtcbiAgaWYgKE51bWJlci5pc0Zpbml0ZShkZWNsYXJlZExlbmd0aCkgJiYgZGVjbGFyZWRMZW5ndGggPiBtYXhCb2R5Qnl0ZXMpIHtcbiAgICByZXEucmVzdW1lKCk7XG4gICAgdGhyb3cgbmV3IEh0dHBFcnJvcignQk9EWV9UT09fTEFSR0UnLCAnUmVxdWVzdCBib2R5IGlzIHRvbyBsYXJnZScsIDQxMyk7XG4gIH1cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBjaHVua3M6IEJ1ZmZlcltdID0gW107XG4gICAgbGV0IHJlY2VpdmVkID0gMDtcbiAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiBmaW5pc2gobmV3IEh0dHBFcnJvcignQk9EWV9USU1FT1VUJywgJ1JlcXVlc3QgYm9keSB0aW1lZCBvdXQnLCA0MDgpKSwgdGltZW91dE1zKTtcbiAgICBjb25zdCBmaW5pc2ggPSAoZXJyb3I/OiBFcnJvciwgdmFsdWU/OiB1bmtub3duKTogdm9pZCA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICByZXEucmVtb3ZlTGlzdGVuZXIoJ2RhdGEnLCBvbkRhdGEpO1xuICAgICAgcmVxLnJlbW92ZUxpc3RlbmVyKCdlbmQnLCBvbkVuZCk7XG4gICAgICByZXEucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgb25FcnJvcik7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgcmVxLnJlc3VtZSgpO1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfSBlbHNlIHJlc29sdmUodmFsdWUpO1xuICAgIH07XG4gICAgY29uc3Qgb25EYXRhID0gKGNodW5rOiBCdWZmZXIpOiB2b2lkID0+IHtcbiAgICAgIHJlY2VpdmVkICs9IGNodW5rLmxlbmd0aDtcbiAgICAgIGlmIChyZWNlaXZlZCA+IG1heEJvZHlCeXRlcykge1xuICAgICAgICBmaW5pc2gobmV3IEh0dHBFcnJvcignQk9EWV9UT09fTEFSR0UnLCAnUmVxdWVzdCBib2R5IGlzIHRvbyBsYXJnZScsIDQxMykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjaHVua3MucHVzaChCdWZmZXIuZnJvbShjaHVuaykpO1xuICAgIH07XG4gICAgY29uc3Qgb25FbmQgPSAoKTogdm9pZCA9PiB7XG4gICAgICBjb25zdCByYXcgPSBCdWZmZXIuY29uY2F0KGNodW5rcykudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgIGlmICghcmF3KSByZXR1cm4gZmluaXNoKHVuZGVmaW5lZCwgdW5kZWZpbmVkKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZpbmlzaCh1bmRlZmluZWQsIEpTT04ucGFyc2UocmF3KSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgZmluaXNoKG5ldyBIdHRwRXJyb3IoJ0JBRF9KU09OJywgJ0ludmFsaWQgSlNPTiBib2R5JywgNDAwKSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBvbkVycm9yID0gKGVycm9yOiBFcnJvcik6IHZvaWQgPT4gZmluaXNoKGVycm9yKTtcbiAgICByZXEub24oJ2RhdGEnLCBvbkRhdGEpO1xuICAgIHJlcS5vbignZW5kJywgb25FbmQpO1xuICAgIHJlcS5vbignZXJyb3InLCBvbkVycm9yKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUh0dHBFcnJvcihlcnJvcjogdW5rbm93bik6IHsgY29kZTogc3RyaW5nOyBzdGF0dXM6IG51bWJlcjsgbWVzc2FnZTogc3RyaW5nIH0ge1xuICByZXR1cm4ge1xuICAgIGNvZGU6IHR5cGVvZiAoZXJyb3IgYXMgeyBjb2RlPzogdW5rbm93biB9KT8uY29kZSA9PT0gJ3N0cmluZycgPyAoZXJyb3IgYXMgeyBjb2RlOiBzdHJpbmcgfSkuY29kZSA6ICdJTlRFUk5BTCcsXG4gICAgc3RhdHVzOiB0eXBlb2YgKGVycm9yIGFzIHsgc3RhdHVzPzogdW5rbm93biB9KT8uc3RhdHVzID09PSAnbnVtYmVyJyA/IChlcnJvciBhcyB7IHN0YXR1czogbnVtYmVyIH0pLnN0YXR1cyA6IDUwMCxcbiAgICBtZXNzYWdlOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvciksXG4gIH07XG59XG5cbi8qKiBcdTY3ODRcdTkwMjBcdTk1MTlcdThCRUZcdUZGMDhcdTVFMjYgY29kZS9zdGF0dXNcdUZGMDlcdTMwMDIgKi9cbmV4cG9ydCBjbGFzcyBIdHRwRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvZGU6IHN0cmluZztcbiAgc3RhdHVzOiBudW1iZXI7XG4gIGNvbnN0cnVjdG9yKGNvZGU6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nLCBzdGF0dXMgPSA0MDApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLmNvZGUgPSBjb2RlO1xuICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICB9XG59XG4iLCAiLyoqXG4gKiBHRVQgL3N0YXR1cyBcdTIwMTQgXHU2M0UxXHU2MjRCL1x1NTA2NVx1NUVCN1x1NjhDMFx1NjdFNVx1MzAwMlxuICovXG5pbXBvcnQge1xuICBQUk9UT0NPTF9WRVJTSU9OLFxuICBTRVJWRVJfQ0FQQUJJTElUSUVTLFxuICB0eXBlIFN0YXR1c1Jlc3BvbnNlLFxufSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5TdGF0ZSB9IGZyb20gJy4uL3NldHRpbmdzLmpzJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhdHVzSGFuZGxlcihwbHVnaW5WZXJzaW9uOiBzdHJpbmcsIHZhdWx0TmFtZTogc3RyaW5nLCBzdGF0ZTogUGx1Z2luU3RhdGUpIHtcbiAgcmV0dXJuIGFzeW5jIChfY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8U3RhdHVzUmVzcG9uc2U+ID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgb2s6IHRydWUsXG4gICAgICB2ZXJzaW9uOiBwbHVnaW5WZXJzaW9uLFxuICAgICAgY29tcG9uZW50VmVyc2lvbjogcGx1Z2luVmVyc2lvbixcbiAgICAgIHByb3RvY29sVmVyc2lvbjogUFJPVE9DT0xfVkVSU0lPTixcbiAgICAgIGNhcGFiaWxpdGllczogWy4uLlNFUlZFUl9DQVBBQklMSVRJRVNdLFxuICAgICAgdmF1bHQ6IHZhdWx0TmFtZSxcbiAgICAgIGxhcmtSZWFkeTogISFzdGF0ZS5sYXJrQ2xpUmVzb2x2ZWQsXG4gICAgICBsYXJrVmVyc2lvbjogc3RhdGUubGFya0NsaVZlcnNpb24gfHwgbnVsbCxcbiAgICAgIHJlY2VudEFjdGl2aXR5OiBzdGF0ZS5yZWNlbnRTeW5jcy5zbGljZSgwLCAxMCksXG4gICAgfTtcbiAgfTtcbn1cbiIsICIvKipcbiAqIEdFVCAvdHJlZSBcdTIwMTQgXHU4RkQ0XHU1NkRFIHZhdWx0IFx1NzZFRVx1NUY1NVx1NjgxMVx1RkYwOFx1N0VEOVx1NjI2OVx1NUM1NVx1NzZFRVx1NUY1NVx1NEUwQlx1NjJDOVx1NzUyOFx1RkYwOVx1MzAwMlxuICpcbiAqIFx1NEYxOFx1NTMxNlx1RkYxQVxuICogLSBcdTUxODVcdTVCNThcdTdGMTNcdTVCNThcdUZGMDg1IFx1NzlEMiBUVExcdUZGMDlcdUZGMENcdTkwN0ZcdTUxNERcdTZCQ0ZcdTZCMjFcdThCRjdcdTZDNDJcdTkwNERcdTUzODZcdTUxNjggdmF1bHRcbiAqIC0gXHU2NTJGXHU2MzAxIG1heERlcHRoIFx1NTNDMlx1NjU3MFx1RkYwOHF1ZXJ5IHN0cmluZ1x1RkYwOVx1RkYwQ1x1OUVEOFx1OEJBNFx1OEZENFx1NTZERVx1OEY4M1x1NUI4Q1x1NjU3NFx1NzZFRVx1NUY1NVx1NjgxMVxuICogLSBcdTY1MkZcdTYzMDEgcHJlZml4IFx1NTNDMlx1NjU3MFx1RkYwQ1x1NUM1NVx1NUYwMFx1NjMwN1x1NUI5QVx1NUI1MFx1NjgxMVxuICovXG5pbXBvcnQgdHlwZSB7IFRyZWVSZXNwb25zZSwgVHJlZU5vZGUgfSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHsgdHlwZSBBcHAsIFRGb2xkZXIgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IFJlcXVlc3RDb250ZXh0IH0gZnJvbSAnLi4vc2VydmVyLmpzJztcblxuY29uc3QgRVhDTFVERSA9IG5ldyBTZXQoW1xuICAnXHU2M0QyXHU0RUY2JyxcbiAgJ3NjcmlwdHMnLFxuICAnLm9ic2lkaWFuJyxcbiAgJy50cmFzaCcsXG4gICcuZmVpc2h1LXN5bmMnLFxuICAnbm9kZV9tb2R1bGVzJyxcbl0pO1xuXG4vKiogXHU3RjEzXHU1QjU4ICovXG5sZXQgY2FjaGVEaXJzOiBUcmVlTm9kZVtdID0gW107XG5sZXQgY2FjaGVUaW1lID0gMDtcbmNvbnN0IENBQ0hFX1RUTCA9IDVfMDAwOyAvLyA1IFx1NzlEMlxuXG5mdW5jdGlvbiBidWlsZEZ1bGxUcmVlKGFwcDogQXBwKTogVHJlZU5vZGVbXSB7XG4gIGNvbnN0IHJvb3QgPSBhcHAudmF1bHQuZ2V0Um9vdCgpO1xuICBjb25zdCBkaXJzOiBUcmVlTm9kZVtdID0gW107XG5cbiAgY29uc3Qgd2FsayA9IChmb2xkZXI6IFRGb2xkZXIsIGRlcHRoOiBudW1iZXIpID0+IHtcbiAgICBpZiAoZGVwdGggPiAwKSB7XG4gICAgICBjb25zdCBuYW1lID0gZm9sZGVyLm5hbWU7XG4gICAgICBpZiAoRVhDTFVERS5oYXMobmFtZSkgfHwgbmFtZS5zdGFydHNXaXRoKCcuJykpIHJldHVybjtcbiAgICAgIGRpcnMucHVzaCh7IHBhdGg6IGZvbGRlci5wYXRoLCBsYWJlbDogbmFtZSwgZGVwdGggfSk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZm9sZGVyLmNoaWxkcmVuKSB7XG4gICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBURm9sZGVyKSB3YWxrKGNoaWxkLCBkZXB0aCArIDEpO1xuICAgIH1cbiAgfTtcblxuICB3YWxrKHJvb3QsIDApO1xuXG4gIGRpcnMuc29ydCgoYSwgYikgPT4gYS5wYXRoLmxvY2FsZUNvbXBhcmUoYi5wYXRoLCAnemgnKSk7XG5cbiAgcmV0dXJuIGRpcnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUcmVlSGFuZGxlcihhcHA6IEFwcCkge1xuICByZXR1cm4gYXN5bmMgKGN0eDogUmVxdWVzdENvbnRleHQpOiBQcm9taXNlPFRyZWVSZXNwb25zZT4gPT4ge1xuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgY29uc3QgbWF4RGVwdGggPSBwYXJzZUludChjdHgucXVlcnkuZ2V0KCdtYXhEZXB0aCcpIHx8ICcxMicsIDEwKTtcbiAgICBjb25zdCBwcmVmaXggPSBjdHgucXVlcnkuZ2V0KCdwcmVmaXgnKSB8fCAnJztcblxuICAgIC8vIFx1NTIzN1x1NjVCMFx1N0YxM1x1NUI1OFxuICAgIGlmIChub3cgLSBjYWNoZVRpbWUgPiBDQUNIRV9UVEwgfHwgY2FjaGVEaXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY2FjaGVEaXJzID0gYnVpbGRGdWxsVHJlZShhcHApO1xuICAgICAgY2FjaGVUaW1lID0gbm93O1xuICAgIH1cblxuICAgIGxldCBkaXJzID0gY2FjaGVEaXJzO1xuXG4gICAgLy8gcHJlZml4IFx1N0I1Qlx1OTAwOVx1RkYxQVx1NTNFQVx1OEZENFx1NTZERSBwcmVmaXgvIFx1NEUwQlx1NzY4NFx1NUI1MFx1ODI4Mlx1NzBCOVx1RkYwOGRlcHRoIFx1NEVDRSBwcmVmaXggXHU0RTBCXHU0RTAwXHU3RUE3XHU1RjAwXHU1OUNCXHVGRjA5XG4gICAgaWYgKHByZWZpeCkge1xuICAgICAgY29uc3QgcHJlZml4RGVwdGggPSBwcmVmaXguc3BsaXQoJy8nKS5sZW5ndGggKyAxO1xuICAgICAgZGlycyA9IGRpcnMuZmlsdGVyKGQgPT4gZC5wYXRoLnN0YXJ0c1dpdGgocHJlZml4ICsgJy8nKSAmJiBkLmRlcHRoIDw9IHByZWZpeERlcHRoICsgMSk7XG4gICAgICAvLyBcdTkxQ0RcdTY1QjBcdThCQTFcdTdCOTdcdTc2RjhcdTVCRjlcdTZERjFcdTVFQTZcbiAgICAgIGRpcnMgPSBkaXJzLm1hcChkID0+ICh7XG4gICAgICAgIC4uLmQsXG4gICAgICAgIGRlcHRoOiBkLmRlcHRoIC0gcHJlZml4RGVwdGggKyAyLFxuICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBcdTYzMDkgbWF4RGVwdGggXHU2MjJBXHU2NUFEXG4gICAgICBkaXJzID0gZGlycy5maWx0ZXIoZCA9PiBkLmRlcHRoIDw9IG1heERlcHRoKTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBvazogdHJ1ZSwgZGlycyB9O1xuICB9O1xufVxuXG4vKiogXHU1QkZDXHU1MUZBXHU1MjM3XHU2NUIwXHU3RjEzXHU1QjU4XHVGRjA4XHU2NTg3XHU0RUY2XHU2NENEXHU0RjVDXHU1NDBFXHU4QzAzXHU3NTI4XHVGRjA5XHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gaW52YWxpZGF0ZVRyZWVDYWNoZSgpOiB2b2lkIHtcbiAgY2FjaGVEaXJzID0gW107XG4gIGNhY2hlVGltZSA9IDA7XG59XG4iLCAiLyoqXG4gKiBQT1NUIC9mZXRjaCBcdTIwMTQgXHU5OERFXHU0RTY2XHUyMTkyT0IgXHU4NDNEXHU1NzMwXHU0RTNCXHU5NEZFXHU4REVGXHUzMDAyXG4gKlxuICogXHU0RjlEXHU2MzZFIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgIFx1MDBBNzYuMVx1RkYxQVxuICogMS4gbGFyay1jbGkgZG9jcyArZmV0Y2ggLS1kb2MtZm9ybWF0IG1hcmtkb3duIFx1MjE5MiBcdTZCNjNcdTY1ODcgbWRcbiAqIDIuIGxhcmstY2xpIGRvY3MgK2ZldGNoIC0tZG9jLWZvcm1hdCB4bWwgLS1kZXRhaWwgd2l0aC1pZHMgXHUyMTkyIGZpbGVfdG9rZW4gXHU1MjE3XHU4ODY4ICsgY2FsbG91dCBcdTk4OUNcdTgyNzIgKyBkb2N4IG9ial90b2tlblxuICogMy4gXHU1NkZFXHU3MjQ3IGF1dGhjb2RlIFVSTCBcdTIxOTIgZmVpc2h1Oi8vVE9LRU5cbiAqIDQuIGV4aXN0cyBcdTY4QzBcdTY3RTVcdUZGMUFcdTVERjJcdTY3MDlcdTU0MEMgZmVpc2h1X2lkIFx1MjE5MiBcdTY2RjRcdTY1QjBcdTUyMDZcdTY1MkZcdUZGMUJcdTY1RTAgXHUyMTkyIFx1NjVCMFx1NUVGQVxuICogNS4gXHU3RUM0XHU4OEM1IFlBTUxcdUZGMDhmZWlzaHVfaWQvZmVpc2h1X2RvY19pZC9mZWlzaHVfdGl0bGUvc3luY190aW1lXHVGRjA5KyBcdTZCNjNcdTY1ODdcbiAqIDYuIFx1NjU4N1x1NEVGNlx1NTQwRCA9IFx1NUI4OVx1NTE2OFx1NkUwNVx1NkQxNyhmZWlzaHVfdGl0bGUpXHVGRjBDXHU1MTk5XHU1MTY1IGRpclxuICogNy4gYXV0by1yZW5hbWUgXHU4OUU2XHU1M0QxXHU3RjE2XHU3ODAxIFx1MjE5MiBcdTUxOTlcdTU2REVcdTY1ODdcdTRFRjZcdTU0MEQgKyBZQU1MIFx1N0YxNlx1NzgwMVxuICogOC4gXHU4QkExXHU3Qjk3IHN5bmNfaGFzaFx1RkYwQ1x1NTE5OSBzeW5jX3RpbWVcbiAqIDkuIFx1OEZENFx1NTZERVx1ODQzRFx1NTczMFx1OERFRlx1NUY4NFxuICovXG5pbXBvcnQgdHlwZSB7IEZldGNoUmVxdWVzdCwgRmV0Y2hSZXNwb25zZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQgeyBBcHAsIFRGaWxlLCBURm9sZGVyIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBSZXF1ZXN0Q29udGV4dCB9IGZyb20gJy4uL3NlcnZlci5qcyc7XG5pbXBvcnQgdHlwZSB7IEZlaXNodVN5bmNTZXR0aW5ncywgUGx1Z2luU3RhdGUgfSBmcm9tICcuLi9zZXR0aW5ncy5qcyc7XG5pbXBvcnQge1xuICBwYXJzZUZpbGUsXG4gIGJ1aWxkSW5pdGlhbEZyb250bWF0dGVyLFxuICBtZXJnZUZyb250bWF0dGVyRm9yVXBkYXRlLFxuICBhc3NlbWJsZU1kLFxuICBtYWtlRmlsZW5hbWUsXG4gIG1ha2VQYXRoLFxufSBmcm9tICcuLi9maWxlaW8vd3JpdGVyLmpzJztcbmltcG9ydCB7IGFzc2lnbkVuY29kaW5nIH0gZnJvbSAnLi4vYXV0b1JlbmFtZS5qcyc7XG5pbXBvcnQgeyBmaW5kVW5pcXVlVmF1bHRCaW5kaW5nIH0gZnJvbSAnLi4vdmF1bHRCaW5kaW5nLmpzJztcbmltcG9ydCB7IG5vcm1hbGl6ZVZhdWx0RGlyLCBub3JtYWxpemVWYXVsdE1hcmtkb3duUGF0aCB9IGZyb20gJy4uL3ZhdWx0UGF0aC5qcyc7XG5pbXBvcnQgeyBhc3NlcnRSZXBsYWNlbWVudEJpbmRpbmcgfSBmcm9tICcuLi9iaW5kaW5nSW5kZXguanMnO1xuaW1wb3J0IHsgZmV0Y2hSZW1vdGVEb2N1bWVudCB9IGZyb20gJy4uL3JlbW90ZURvY3VtZW50LmpzJztcbmltcG9ydCB7IGRlY2lkZVRocmVlV2F5U3luYywgcGxhblN5bmNFeGVjdXRpb24gfSBmcm9tICcuLi9zeW5jRGVjaXNpb24uanMnO1xuaW1wb3J0IHsgY3JlYXRlUmVjb3ZlcnlTbmFwc2hvdCB9IGZyb20gJy4uL3JlY292ZXJ5LmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBGZXRjaERlcHMge1xuICBhcHA6IEFwcDtcbiAgc2V0dGluZ3M6IEZlaXNodVN5bmNTZXR0aW5ncztcbiAgc3RhdGU6IFBsdWdpblN0YXRlO1xuICBub3RpY2U6IChtc2c6IHN0cmluZykgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZldGNoSGFuZGxlcihkZXBzOiBGZXRjaERlcHMpIHtcbiAgcmV0dXJuIGFzeW5jIChjdHg6IFJlcXVlc3RDb250ZXh0KTogUHJvbWlzZTxGZXRjaFJlc3BvbnNlPiA9PiB7XG4gICAgY29uc3QgcmVxID0gY3R4LmJvZHkgYXMgRmV0Y2hSZXF1ZXN0O1xuICAgIGlmICghcmVxPy5ub2RlX3Rva2VuKSB7XG4gICAgICBjb25zdCBlID0gbmV3IEVycm9yKCdub2RlX3Rva2VuIGlzIHJlcXVpcmVkJykgYXMgRXJyb3IgJiB7IGNvZGU6IHN0cmluZzsgc3RhdHVzOiBudW1iZXIgfTtcbiAgICAgIGUuY29kZSA9ICdNSVNTSU5HX1RPS0VOJztcbiAgICAgIGUuc3RhdHVzID0gNDAwO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICBjb25zdCB7IG5vZGVfdG9rZW4sIHNwYWNlX2lkLCBkaXIgfSA9IHJlcTtcbiAgICBjb25zdCBzZXR0aW5ncyA9IGRlcHMuc2V0dGluZ3M7XG4gICAgY29uc3QgdGFyZ2V0RGlyID0gbm9ybWFsaXplVmF1bHREaXIoZGlyID8/IHNldHRpbmdzLmRlZmF1bHREaXIpO1xuICAgIGNvbnN0IHJlcGxhY2VQYXRoID0gcmVxLnJlcGxhY2VfcGF0aFxuICAgICAgPyBub3JtYWxpemVWYXVsdE1hcmtkb3duUGF0aChyZXEucmVwbGFjZV9wYXRoKVxuICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICBkZXBzLm5vdGljZShgXHUyQjA3IFx1NTQwQ1x1NkI2NVx1OThERVx1NEU2Nlx1NjU4N1x1Njg2MyAke25vZGVfdG9rZW4uc2xpY2UoMCwgOCl9Li4uYCk7XG5cbiAgICBjb25zdCByZW1vdGUgPSBmZXRjaFJlbW90ZURvY3VtZW50KHtcbiAgICAgIG5vZGVUb2tlbjogbm9kZV90b2tlbixcbiAgICAgIHNwYWNlSWQ6IHNwYWNlX2lkLFxuICAgICAgb2JqVG9rZW46IHJlcS5vYmpfdG9rZW4sXG4gICAgfSk7XG5cbiAgICAvLyBcdTZCNjVcdTlBQTQgMi41XHVGRjFBXHU0RUNFXHU5OERFXHU0RTY2XHU1OTM0XHU5MEU4IGNhbGxvdXQgXHU4OUUzXHU2NzkwXHU1MTQzXHU2NTcwXHU2MzZFXHVGRjA4XHU2ODA3XHU3QjdFL1x1N0YxNlx1NzgwMS9cdThGOTNcdTUxNjUvXHU2NUU1XHU2NzFGL1x1NTE3M1x1OTUyRVx1OEJDRC9cdThCQzRcdTUyMDYvXHU3RDIyXHU1RjE1XHVGRjA5XG4gICAgLy8gXHU4RkQ5XHU0RTlCXHU1QjU3XHU2QkI1XHU0RjFBXHU1MTk5XHU4RkRCIFlBTUwgZnJvbnRtYXR0ZXJcdUZGMUJcdTZCNjNcdTY1ODcgY2FsbG91dCBcdTRGRERcdTc1NTlcdTRFMERcdTUyQThcdUZGMDhcdTZCNjVcdTlBQTQgMy41IFx1OEY2QyBPQiBjYWxsb3V0XHVGRjA5XG4gICAgY29uc3QgbWV0YSA9IHtcbiAgICAgIC4uLnJlbW90ZS5tZXRhLFxuICAgICAgLi4uKHJlcS5tZXRhID8/IHt9KSxcbiAgICB9O1xuICAgIGlmIChPYmplY3Qua2V5cyhtZXRhKS5sZW5ndGggPiAwKSB7XG4gICAgICBkZXBzLm5vdGljZShgXHVEODNEXHVEQ0NCIFx1NjNEMFx1NTNENlx1NTIzMCAke09iamVjdC5rZXlzKG1ldGEpLmxlbmd0aH0gXHU0RTJBXHU1MTQzXHU2NTcwXHU2MzZFXHU1QjU3XHU2QkI1YCk7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvY2Vzc2VkTWQgPSByZW1vdGUuYm9keTtcbiAgICBjb25zdCBvYmpUb2tlbiA9IHJlbW90ZS5vYmpUb2tlbjtcbiAgICBjb25zdCBmZWlzaHVUaXRsZSA9IHJlbW90ZS50aXRsZTtcblxuICAgIC8vIFx1NkI2NVx1OUFBNCA0XHVGRjFBZXhpc3RzIFx1NjhDMFx1NjdFNVxuICAgIGNvbnN0IGV4aXN0aW5nRmlsZSA9IGF3YWl0IGZpbmRVbmlxdWVWYXVsdEJpbmRpbmcoZGVwcy5hcHAsIG5vZGVfdG9rZW4pO1xuICAgIGNvbnN0IHN5bmNUaW1lID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgIGxldCBhY3Rpb246ICdjcmVhdGVkJyB8ICd1cGRhdGVkJztcbiAgICBsZXQgZmluYWxQYXRoOiBzdHJpbmc7XG4gICAgbGV0IGVuY29kaW5nOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICBpZiAoZXhpc3RpbmdGaWxlKSB7XG4gICAgICAvLyBcdTY2RjRcdTY1QjBcdTUyMDZcdTY1MkZcdUZGMUFcdTRGRERcdTc1NTlcdTc1MjhcdTYyMzdcdTY1MzlcdTc2ODRcdTUxNDNcdTY1NzBcdTYzNkVcdUZGMENcdTUzRUFcdTUyMzdcdTZCNjNcdTY1ODcgKyBcdTdFRDFcdTVCOUFcdTVCNTdcdTZCQjVcbiAgICAgIGFjdGlvbiA9ICd1cGRhdGVkJztcbiAgICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgZGVwcy5hcHAudmF1bHQucmVhZChleGlzdGluZ0ZpbGUpO1xuICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VGaWxlKGV4aXN0aW5nKTtcbiAgICAgIGZpbmFsUGF0aCA9IGV4aXN0aW5nRmlsZS5wYXRoO1xuICAgICAgY29uc3QgZGVjaXNpb24gPSBkZWNpZGVUaHJlZVdheVN5bmMoe1xuICAgICAgICBiYXNlSGFzaDogcGFyc2VkLmZyb250bWF0dGVyLnN5bmNfaGFzaCBhcyBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgICAgIGxvY2FsSGFzaDogcGFyc2VkLmhhc2gsXG4gICAgICAgIHJlbW90ZUhhc2g6IHJlbW90ZS5oYXNoLFxuICAgICAgfSk7XG4gICAgICBjb25zdCBleGVjdXRpb24gPSBwbGFuU3luY0V4ZWN1dGlvbigncHVsbCcsIGRlY2lzaW9uKTtcbiAgICAgIGlmIChleGVjdXRpb24gIT09ICdza2lwJykge1xuICAgICAgICBjb25zdCBtZXJnZWQgPSBtZXJnZUZyb250bWF0dGVyRm9yVXBkYXRlKFxuICAgICAgICAgIHBhcnNlZC5mcm9udG1hdHRlcixcbiAgICAgICAgICBub2RlX3Rva2VuLFxuICAgICAgICAgIG9ialRva2VuLFxuICAgICAgICAgIGZlaXNodVRpdGxlLFxuICAgICAgICAgIHN5bmNUaW1lLFxuICAgICAgICAgIG1ldGEsXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhc3NlbWJsZU1kKG1lcmdlZCwgcHJvY2Vzc2VkTWQpO1xuICAgICAgICBhd2FpdCBjcmVhdGVSZWNvdmVyeVNuYXBzaG90KGRlcHMuYXBwLnZhdWx0LmFkYXB0ZXIsIHtcbiAgICAgICAgICBvcmlnaW5hbFBhdGg6IGV4aXN0aW5nRmlsZS5wYXRoLFxuICAgICAgICAgIGNvbnRlbnQ6IGV4aXN0aW5nLFxuICAgICAgICAgIHNvdXJjZTogJ2xvY2FsJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IGRlcHMuYXBwLnZhdWx0Lm1vZGlmeShleGlzdGluZ0ZpbGUsIGNvbnRlbnQpO1xuICAgICAgICBkZXBzLm5vdGljZShgXHUyNzBGIFx1NURGMlx1NjZGNFx1NjVCMCAke2V4aXN0aW5nRmlsZS5uYW1lfWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVwcy5ub3RpY2UoYFx1MjNFRCBcdTY1RTBcdTUzRDhcdTUzMTYgJHtleGlzdGluZ0ZpbGUubmFtZX1gKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gXHU2NUIwXHU1RUZBXHU1MjA2XHU2NTJGXG4gICAgICBhY3Rpb24gPSAnY3JlYXRlZCc7XG4gICAgICBjb25zdCBmaWxlbmFtZSA9IG1ha2VGaWxlbmFtZShmZWlzaHVUaXRsZSwgcmVxLmZpbGVuYW1lKTtcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IG1ha2VQYXRoKHRhcmdldERpciwgZmlsZW5hbWUpO1xuXG4gICAgICAvLyBcdTc4NkVcdTRGRERcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjhcbiAgICAgIGF3YWl0IGVuc3VyZUZvbGRlcihkZXBzLmFwcCwgdGFyZ2V0RGlyKTtcblxuICAgICAgY29uc3QgZm0gPSBidWlsZEluaXRpYWxGcm9udG1hdHRlcihub2RlX3Rva2VuLCBvYmpUb2tlbiwgZmVpc2h1VGl0bGUsIHN5bmNUaW1lLCBtZXRhKTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhc3NlbWJsZU1kKGZtLCBwcm9jZXNzZWRNZCk7XG5cbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjU4N1x1NEVGNlx1NjYyRlx1NTQyNlx1NURGMlx1NUI1OFx1NTcyOFx1RkYwOFx1NTQwQ1x1NTQwRFx1NEUwRFx1NTQwQyBmZWlzaHVfaWRcdUZGMDlcbiAgICAgIGNvbnN0IHJlcGxhY2VGaWxlID0gcmVwbGFjZVBhdGhcbiAgICAgICAgPyBkZXBzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocmVwbGFjZVBhdGgpXG4gICAgICAgIDogbnVsbDtcbiAgICAgIGNvbnN0IGV4aXN0aW5nID0gZGVwcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHJlbGF0aXZlUGF0aCk7XG4gICAgICBpZiAocmVwbGFjZUZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICBjb25zdCByZXBsYWNlbWVudENvbnRlbnQgPSBhd2FpdCBkZXBzLmFwcC52YXVsdC5yZWFkKHJlcGxhY2VGaWxlKTtcbiAgICAgICAgYXNzZXJ0UmVwbGFjZW1lbnRCaW5kaW5nKHJlcGxhY2VtZW50Q29udGVudCwgbm9kZV90b2tlbiwgcmVwbGFjZUZpbGUucGF0aCk7XG4gICAgICAgIGF3YWl0IGNyZWF0ZVJlY292ZXJ5U25hcHNob3QoZGVwcy5hcHAudmF1bHQuYWRhcHRlciwge1xuICAgICAgICAgIG9yaWdpbmFsUGF0aDogcmVwbGFjZUZpbGUucGF0aCxcbiAgICAgICAgICBjb250ZW50OiByZXBsYWNlbWVudENvbnRlbnQsXG4gICAgICAgICAgc291cmNlOiAnbG9jYWwnLFxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgZGVwcy5hcHAudmF1bHQubW9kaWZ5KHJlcGxhY2VGaWxlLCBjb250ZW50KTtcbiAgICAgICAgZmluYWxQYXRoID0gcmVwbGFjZUZpbGUucGF0aDtcbiAgICAgICAgYWN0aW9uID0gJ3VwZGF0ZWQnO1xuICAgICAgfSBlbHNlIGlmIChleGlzdGluZyBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgIC8vIFx1NTQwQ1x1NTQwRFx1NTFCMlx1N0E4MVx1RkYxQVx1NTJBMFx1NTQwRVx1N0YwMFxuICAgICAgICBjb25zdCBjb25mbGljdFBhdGggPSBtYWtlUGF0aCh0YXJnZXREaXIsIGAke2ZpbGVuYW1lLnJlcGxhY2UoL1xcLm1kJC8sICcnKX0tJHtub2RlX3Rva2VuLnNsaWNlKDAsIDYpfS5tZGApO1xuICAgICAgICBhd2FpdCBkZXBzLmFwcC52YXVsdC5jcmVhdGUoY29uZmxpY3RQYXRoLCBjb250ZW50KTtcbiAgICAgICAgZmluYWxQYXRoID0gY29uZmxpY3RQYXRoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgY3JlYXRlZCA9IGF3YWl0IGRlcHMuYXBwLnZhdWx0LmNyZWF0ZShyZWxhdGl2ZVBhdGgsIGNvbnRlbnQpO1xuICAgICAgICBmaW5hbFBhdGggPSBjcmVhdGVkLnBhdGg7XG4gICAgICB9XG5cbiAgICAgIGRlcHMubm90aWNlKGBcdTI3MDUgXHU1REYyXHU1MjFCXHU1RUZBICR7ZmlsZW5hbWV9YCk7XG5cbiAgICAgIC8vIFx1NkI2NVx1OUFBNCA3XHVGRjFBYXV0by1yZW5hbWUgXHU3RjE2XHU3ODAxXHU1MjA2XHU5MTREXG4gICAgICBpZiAoc2V0dGluZ3MuYXV0b1JlbmFtZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGVuY29kaW5nID0gYXdhaXQgYXNzaWduRW5jb2RpbmcoZGVwcy5hcHAsIGZpbmFsUGF0aCwgdGFyZ2V0RGlyKTtcbiAgICAgICAgICBpZiAoZW5jb2RpbmcpIHtcbiAgICAgICAgICAgIGRlcHMubm90aWNlKGBcdUQ4M0RcdUREMjIgXHU3RjE2XHU3ODAxXHVGRjFBJHtlbmNvZGluZ31gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGNvbnNvbGUud2FybignW3N5bmMvZmV0Y2hdIGF1dG8tcmVuYW1lIGZhaWxlZDonLCBlcnIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG9rOiB0cnVlLFxuICAgICAgcGF0aDogZmluYWxQYXRoLFxuICAgICAgZmlsZW5hbWU6IGZpbmFsUGF0aC5zcGxpdCgnLycpLnBvcCgpID8/ICcnLFxuICAgICAgYWN0aW9uLFxuICAgICAgXHU3RjE2XHU3ODAxOiBlbmNvZGluZyxcbiAgICAgIGZlaXNodV90aXRsZTogZmVpc2h1VGl0bGUsXG4gICAgfTtcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTc4NkVcdTRGRERcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjhcdUZGMDhcdTkwMTJcdTVGNTJcdTUyMUJcdTVFRkFcdUZGMDlcdTMwMDJcbiAqL1xuYXN5bmMgZnVuY3Rpb24gZW5zdXJlRm9sZGVyKGFwcDogQXBwLCBkaXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICBpZiAoIWRpciB8fCBkaXIgPT09ICcuJyB8fCBkaXIgPT09ICcvJykgcmV0dXJuO1xuICBjb25zdCBleGlzdGluZyA9IGFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZGlyKTtcbiAgaWYgKGV4aXN0aW5nIGluc3RhbmNlb2YgVEZvbGRlcikgcmV0dXJuO1xuICB0cnkge1xuICAgIGF3YWl0IGFwcC52YXVsdC5jcmVhdGVGb2xkZXIoZGlyKTtcbiAgfSBjYXRjaCB7XG4gICAgLy8gXHU1M0VGXHU4MEZEXHU3MjM2XHU3NkVFXHU1RjU1XHU0RTVGXHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU5MDEyXHU1RjUyXG4gICAgY29uc3QgcGFyZW50ID0gZGlyLnNwbGl0KCcvJykuc2xpY2UoMCwgLTEpLmpvaW4oJy8nKTtcbiAgICBpZiAocGFyZW50KSBhd2FpdCBlbnN1cmVGb2xkZXIoYXBwLCBwYXJlbnQpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBhcHAudmF1bHQuY3JlYXRlRm9sZGVyKGRpcik7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBcdTVERjJcdTVCNThcdTU3MjhcdTYyMTZcdTUxNzZcdTRFRDZcdTk1MTlcdThCRUZcdUZGMENcdTVGRkRcdTc1NjVcbiAgICB9XG4gIH1cbn1cbiIsICIvKipcbiAqIFx1NjU4N1x1NEVGNiBJT1x1RkYxQVx1OEJGQlx1NTE5OSB2YXVsdCBcdTRFMkRcdTc2ODQgLm1kIFx1NjU4N1x1NEVGNlx1MzAwMlxuICogXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzZcdUZGMDhcdTUxNzNcdTk1MkVcdTZENDFcdTdBMEJcdUZGMDkrIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYFx1MzAwMlxuICpcbiAqIC0gcmVhZGVyXHVGRjFBXHU4OUUzXHU2NzkwIGZyb250bWF0dGVyICsgYm9keVx1RkYwQ1x1OEJBMVx1N0I5NyBoYXNoXHVGRjBDXHU2QkQ0XHU1QkY5IHN5bmNfaGFzaFxuICogLSB3cml0ZXJcdUZGMUFcdTdFQzRcdTg4QzUgWUFNTCArIGJvZHlcdUZGMENcdTUxOTlcdTY1ODdcdTRFRjZcbiAqL1xuaW1wb3J0IHtcbiAgcGFyc2VGcm9udG1hdHRlcixcbiAgYXNzZW1ibGVGaWxlLFxuICBib2R5SGFzaCxcbiAgaXNDaGFuZ2VkLFxuICBzYW5pdGl6ZUZpbGVuYW1lLFxuICB3aXRoTWRFeHQsXG4gIGpvaW5QYXRoLFxuICByZXdyaXRlSW1hZ2VzVG9GZWlzaHVQcm90byxcbiAgdHlwZSBZQU1MRnJvbnRtYXR0ZXIsXG59IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5cbi8qKiBcdThCRkJcdTY1ODdcdTRFRjZcdTdFRDNcdTY3OUNcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkRmlsZSB7XG4gIC8qKiBcdTVCOENcdTY1NzRcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcdTMwMDIgKi9cbiAgY29udGVudDogc3RyaW5nO1xuICAvKiogZnJvbnRtYXR0ZXJcdUZGMDhcdTY1RTBcdTUyMTlcdTRFM0FcdTdBN0FcdTVCRjlcdThDNjFcdUZGMDlcdTMwMDIgKi9cbiAgZnJvbnRtYXR0ZXI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAvKiogXHU2QjYzXHU2NTg3XHVGRjA4XHU0RTBEXHU1NDJCIGZyb250bWF0dGVyXHVGRjA5XHUzMDAyICovXG4gIGJvZHk6IHN0cmluZztcbiAgLyoqIFx1NkI2M1x1NjU4NyBoYXNoXHVGRjA4c2hhMjU2IGhleFx1RkYwOVx1MzAwMiAqL1xuICBoYXNoOiBzdHJpbmc7XG59XG5cbi8qKlxuICogXHU0RUNFXHU1QjhDXHU2NTc0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XHU4OUUzXHU2NzkwXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUZpbGUoY29udGVudDogc3RyaW5nKTogUGFyc2VkRmlsZSB7XG4gIGNvbnN0IHsgZnJvbnRtYXR0ZXIsIGJvZHkgfSA9IHBhcnNlRnJvbnRtYXR0ZXIoY29udGVudCk7XG4gIGNvbnN0IGhhc2ggPSBib2R5SGFzaChib2R5KTtcbiAgcmV0dXJuIHtcbiAgICBjb250ZW50LFxuICAgIGZyb250bWF0dGVyOiBmcm9udG1hdHRlciA/PyB7fSxcbiAgICBib2R5LFxuICAgIGhhc2gsXG4gIH07XG59XG5cbi8qKlxuICogXHU2OEMwXHU2RDRCXHU1MTg1XHU1QkI5XHU2NjJGXHU1NDI2XHU3NkY4XHU1QkY5XHU0RTBBXHU2QjIxXHU1NDBDXHU2QjY1XHU1M0QxXHU3NTFGXHU1M0Q4XHU1MzE2XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNDb250ZW50Q2hhbmdlZChwYXJzZWQ6IFBhcnNlZEZpbGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzQ2hhbmdlZChwYXJzZWQuaGFzaCwgcGFyc2VkLmZyb250bWF0dGVyLnN5bmNfaGFzaCBhcyBzdHJpbmcgfCB1bmRlZmluZWQpO1xufVxuXG4vKipcbiAqIFx1N0VDNFx1ODhDNVx1NjVCMFx1NjU4N1x1NEVGNlx1NzY4NCBmcm9udG1hdHRlclx1RkYwOFx1OThERVx1NEU2Nlx1MjE5Mk9CIFx1OTk5Nlx1NkIyMVx1ODQzRFx1NTczMFx1RkYwOVx1MzAwMlxuICogQHBhcmFtIG1ldGEgXHU0RUNFXHU5OERFXHU0RTY2IGNhbGxvdXQgXHU4OUUzXHU2NzkwXHU1MUZBXHU3Njg0XHU1MTQzXHU2NTcwXHU2MzZFXHVGRjA4XHU2ODA3XHU3QjdFL1x1N0YxNlx1NzgwMS9cdThGOTNcdTUxNjUvXHU2NUU1XHU2NzFGL1x1NTE3M1x1OTUyRVx1OEJDRC9cdThCQzRcdTUyMDYvXHU3RDIyXHU1RjE1XHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEluaXRpYWxGcm9udG1hdHRlcihcbiAgZmVpc2h1SWQ6IHN0cmluZyxcbiAgZmVpc2h1RG9jSWQ6IHN0cmluZyxcbiAgZmVpc2h1VGl0bGU6IHN0cmluZyxcbiAgc3luY1RpbWU6IHN0cmluZyxcbiAgbWV0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogWUFNTEZyb250bWF0dGVyIHtcbiAgcmV0dXJuIHtcbiAgICBmZWlzaHVfaWQ6IGZlaXNodUlkLFxuICAgIGZlaXNodV9kb2NfaWQ6IGZlaXNodURvY0lkLFxuICAgIGZlaXNodV90aXRsZTogZmVpc2h1VGl0bGUsXG4gICAgc3luY190aW1lOiBzeW5jVGltZSxcbiAgICAvLyBcdTk4REVcdTRFNjYgY2FsbG91dCBcdTUxNDNcdTY1NzBcdTYzNkVcdUZGMDhcdTdBN0FcdTUwM0NcdTVCNTdcdTZCQjVcdTRFMERcdTUxOTlcdTUxNjVcdUZGMENcdTRGRERcdTYzMDEgWUFNTCBcdTVFNzJcdTUxQzBcdUZGMDlcbiAgICAuLi4obWV0YSAmJiBzdHJpcEVtcHR5KG1ldGEpKSxcbiAgICAvLyBzeW5jX2hhc2ggXHU1NzI4XHU1MTk5XHU1MTY1XHU2NUY2XHU3NTMxIHdyaXRlciBcdThCQTFcdTdCOTdcdTU4NkJcdTUxNjVcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTU0MDhcdTVFNzZcdTY2RjRcdTY1QjBcdTVERjJcdTY3MDlcdTY1ODdcdTRFRjZcdTc2ODQgZnJvbnRtYXR0ZXJcdUZGMDhcdTRGRERcdTc1NTlcdTc1MjhcdTYyMzdcdTY1MzlcdTc2ODRcdTUxNDNcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVcdUZGMDlcdTMwMDJcbiAqIFx1NTNFQVx1NTIzN1x1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QVx1N0VDNFx1RkYwOGZlaXNodV8qIC8gc3luY18qXHVGRjA5XHVGRjBDXHU0RkREXHU3NTU5IFx1NjgwN1x1N0I3RS9cdTdGMTZcdTc4MDEvXHU4RjkzXHU1MTY1L1x1NjVFNVx1NjcxRi9cdTUxNzNcdTk1MkVcdThCQ0QvXHU4QkM0XHU1MjA2L1x1N0QyMlx1NUYxNSBcdTdCNDlcdTc1MjhcdTYyMzdcdTVCNTdcdTZCQjVcdTMwMDJcbiAqXG4gKiBcdTZDRThcdTYxMEZcdUZGMUFcdTVERjJcdTY3MDlcdTVCNTdcdTZCQjVcdTRGMThcdTUxNDhcdUZGMDhcdTc1MjhcdTYyMzdcdTU3MjggT0IgXHU5MUNDXHU2NTM5XHU4RkM3XHU3Njg0XHVGRjA5XHVGRjBDXHU5OERFXHU0RTY2XHU0RkE3IGNhbGxvdXQgXHU1MTQzXHU2NTcwXHU2MzZFXHU0RUM1XHU1NzI4XHU1QjU3XHU2QkI1XHU3RjNBXHU1OTMxXHU2NUY2XHU4ODY1XHU5RjUwXHUzMDAyXG4gKiBcdThGRDlcdTY4MzdcdTkwN0ZcdTUxNERcdTk4REVcdTRFNjZcdTRGQTdcdTc2ODRcdTY1RTcgY2FsbG91dCBcdTg5ODZcdTc2RDYgT0IgXHU5MUNDXHU3Njg0XHU2NzAwXHU2NUIwXHU2NTc0XHU3NDA2XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUZyb250bWF0dGVyRm9yVXBkYXRlKFxuICBleGlzdGluZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4gIGZlaXNodUlkOiBzdHJpbmcsXG4gIGZlaXNodURvY0lkOiBzdHJpbmcsXG4gIGZlaXNodVRpdGxlOiBzdHJpbmcsXG4gIHN5bmNUaW1lOiBzdHJpbmcsXG4gIG1ldGE/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFlBTUxGcm9udG1hdHRlciB7XG4gIHJldHVybiB7XG4gICAgLy8gXHU1REYyXHU2NzA5XHU1QjU3XHU2QkI1XHU0RjE4XHU1MTQ4XHVGRjA4XHU3NTI4XHU2MjM3XHU2NTM5XHU4RkM3XHU3Njg0XHVGRjA5XHVGRjBDXHU5OERFXHU0RTY2IGNhbGxvdXQgXHU1MTQzXHU2NTcwXHU2MzZFXHU1M0VBXHU4ODY1XHU3RjNBXHU1OTMxXG4gICAgLi4uKG1ldGEgJiYgc3RyaXBFbXB0eShtZXRhKSksXG4gICAgLi4uZXhpc3RpbmcsXG4gICAgZmVpc2h1X2lkOiBmZWlzaHVJZCxcbiAgICBmZWlzaHVfZG9jX2lkOiBmZWlzaHVEb2NJZCxcbiAgICBmZWlzaHVfdGl0bGU6IGZlaXNodVRpdGxlLFxuICAgIHN5bmNfdGltZTogc3luY1RpbWUsXG4gIH0gYXMgWUFNTEZyb250bWF0dGVyO1xufVxuXG4vKiogXHU3OUZCXHU5NjY0XHU1MDNDXHU0RTNBXHU3QTdBXHVGRjA4dW5kZWZpbmVkL251bGwvJycvXHU3QTdBXHU2NTcwXHU3RUM0XHVGRjA5XHU3Njg0XHU1QjU3XHU2QkI1XHVGRjBDXHU5MDdGXHU1MTREXHU2QzYxXHU2N0QzIFlBTUxcdTMwMDIgKi9cbmZ1bmN0aW9uIHN0cmlwRW1wdHkob2JqOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSBudWxsIHx8IHYgPT09ICcnKSBjb250aW51ZTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2KSAmJiB2Lmxlbmd0aCA9PT0gMCkgY29udGludWU7XG4gICAgb3V0W2tdID0gdjtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFx1N0VDNFx1ODhDNVx1NjcwMFx1N0VDOFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVx1RkYwOFlBTUwgKyBcdTZCNjNcdTY1ODcgKyBoYXNoXHVGRjA5XHUzMDAyXG4gKiBAcGFyYW0gZnJvbnRtYXR0ZXIgXHU1NDBDXHU2QjY1XHU3RUQxXHU1QjlBICsgXHU3NTI4XHU2MjM3XHU1MTQzXHU2NTcwXHU2MzZFXG4gKiBAcGFyYW0gYm9keSBcdTZCNjNcdTY1ODcgbWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VtYmxlTWQoZnJvbnRtYXR0ZXI6IFlBTUxGcm9udG1hdHRlciwgYm9keTogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gXHU4QkExXHU3Qjk3XHU1RTc2XHU1MTk5XHU1MTY1IHN5bmNfaGFzaFxuICBjb25zdCBoYXNoID0gYm9keUhhc2goYm9keSk7XG4gIGNvbnN0IGZtV2l0aEhhc2g6IFlBTUxGcm9udG1hdHRlciA9IHtcbiAgICAuLi5mcm9udG1hdHRlcixcbiAgICBzeW5jX2hhc2g6IGhhc2gsXG4gIH07XG4gIHJldHVybiBhc3NlbWJsZUZpbGUoZm1XaXRoSGFzaCwgYm9keSk7XG59XG5cbi8qKlxuICogXHU2MjhBXHU5OERFXHU0RTY2XHU1QkZDXHU1MUZBXHU3Njg0IG1kIFx1NTkwNFx1NzQwNlx1NEUzQSBPQiBcdTZCNjNcdTY1ODdcdTMwMDJcbiAqIC0gXHU1NkZFXHU3MjQ3IGF1dGhjb2RlIFVSTCBcdTIxOTIgZmVpc2h1Oi8vVE9LRU5cbiAqIC0gXHU2ODA3XHU5ODk4XHU4ODRDXHU1M0JCXHU2Mzg5XHVGRjA4XHU2ODA3XHU5ODk4XHU1REYyXHU1NzI4IGZyb250bWF0dGVyLmZlaXNodV90aXRsZVx1RkYwQ09CIFx1OTFDQyBIMSBcdTRGRERcdTc1NTlcdTRGNDZcdTk4REVcdTRFNjZcdTRGQTdcdTc1MzEgb2JqIFx1NTkwNFx1NzQwNlx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0ZlaXNodU1kKG1kOiBzdHJpbmcsIGltZ1Rva2VuczogU2V0PHN0cmluZz4pOiBzdHJpbmcge1xuICByZXR1cm4gcmV3cml0ZUltYWdlc1RvRmVpc2h1UHJvdG8obWQsIGltZ1Rva2Vucyk7XG59XG5cbi8qKlxuICogXHU3NTFGXHU2MjEwXHU4NDNEXHU1NzMwXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU1Qjg5XHU1MTY4XHU2RTA1XHU2RDE3XHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlRmlsZW5hbWUoZmVpc2h1VGl0bGU6IHN0cmluZywgb3ZlcnJpZGU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBuYW1lID0gb3ZlcnJpZGUgPyBzYW5pdGl6ZUZpbGVuYW1lKG92ZXJyaWRlKSA6IHNhbml0aXplRmlsZW5hbWUoZmVpc2h1VGl0bGUpO1xuICByZXR1cm4gd2l0aE1kRXh0KG5hbWUpO1xufVxuXG4vKipcbiAqIFx1NjJGQ1x1NjNBNVx1ODQzRFx1NTczMFx1OERFRlx1NUY4NFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZVBhdGgoZGlyOiBzdHJpbmcgfCB1bmRlZmluZWQsIGZpbGVuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gam9pblBhdGgoZGlyLCBmaWxlbmFtZSk7XG59XG4iLCAiLyoqXG4gKiBhdXRvLXJlbmFtZSBcdTdGMTZcdTc4MDFcdTUyMDZcdTkxNERcdTMwMDJcdTRGOURcdTYzNkUgYDI2XzA1MDlfU18wOF9hNGIxMCBcdTRFMDlcdTc5Q0RcdTdGMTZcdTc4MDFcdTZBMjFcdTVGMEZcdTVCOUVcdTczQjBcdThCRjRcdTY2MEUubWRgXG4gKiArIGBcdTc3RTVcdThCQzZcdTVFOTNcdTgxRUFcdTUyQThcdTYyNTNcdTY4MDdcdTUzNEZcdThCQUVcdThGQjlcdTc1NEMubWRgICsgYDAyX1lBTUxcdTVCNTdcdTZCQjVcdTg5QzRcdTgzMDMubWRgIFx1MDBBNzIuM1x1MzAwMlxuICpcbiAqIFx1N0YxNlx1NzgwMVx1NjgzQ1x1NUYwRlx1RkYxQVlZX01NRERfXHU2ODA3XHU3QjdFX1x1NUU4Rlx1NTNGN1tfXHU1QjUwXHU1RThGXHU1M0Y3XVxuICogICAtIFx1NjU4N1x1NEVGNlx1RkYxQVx1ODIxMlx1NUM1NVx1NTc4QiBTXzAxXHVGRjA4XHU2ODA3XHU3QjdFX1x1NUU4Rlx1NTNGNyBcdTc1MjhcdTRFMEJcdTUyMTJcdTdFQkZcdUZGMDlcbiAqICAgLSBcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMUFcdTdEMjdcdTUxRDFcdTU3OEIgUzAxXHVGRjA4XHU2ODA3XHU3QjdFXHU1RThGXHU1M0Y3IFx1NjVFMFx1NEUwQlx1NTIxMlx1N0VCRlx1RkYwOVxuICpcbiAqIFx1NjgwN1x1N0I3RVx1NEY1M1x1N0NGQlx1RkYwODYgXHU3QzdCXHVGRjBDXHU1NDJCXHU4ODY1XHU1MTY4XHU3Njg0IFEgXHU3MDc1XHU2QzE0XHVGRjA5XHVGRjFBXG4gKiAgIFM9XHU2NTM2XHU5NkM2ICBYPVx1OTg3OVx1NzZFRSAgTD1cdTk4ODZcdTU3REYgIFo9XHU4RDQ0XHU2RTkwICBRPVx1NzA3NVx1NjExRiAgSj1cdTYyODBcdTgwRkRcbiAqXG4gKiBcdTg5RTZcdTUzRDFcdUZGMUFmZXRjaCBcdTg0M0RcdTU3MzBcdTU0MEVcdTMwMDFcdTUzRjNcdTk1MkVcdTgzRENcdTUzNTVcdTMwMDFyaWJib24gXHU2Mjc5XHU5MUNGXHUzMDAyXG4gKi9cbmltcG9ydCB7IFRGaWxlLCBURm9sZGVyLCB0eXBlIEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IHBhcnNlRnJvbnRtYXR0ZXIsIGFzc2VtYmxlRmlsZSwgdHlwZSBUYWcgfSBmcm9tICdAc3luYy9zaGFyZWQnO1xuXG4vKiogXHU2ODA3XHU3QjdFIFx1MjE5MiBcdTc2RUVcdTVGNTVcdTY2MjBcdTVDMDRcdUZGMDhcdTRGOURcdTYzNkUgMDFfXHU1QkY5XHU2QkQ0XHU2MkE1XHU1NDRBLm1kIFx1NzY4NFx1NzZFRVx1NUY1NVx1OERFRlx1NzUzMVx1ODlDNFx1NTIxOVx1RkYwOVx1MzAwMiAqL1xuY29uc3QgVEFHX0JZX0RJUl9ISU5UOiBSZWNvcmQ8c3RyaW5nLCBUYWc+ID0ge1xuICAnMFx1RkUwRlx1MjBFM1x1OEY5M1x1NTE2NSc6ICdTJyxcbiAgJzFcdUZFMEZcdTIwRTNcdThGOTNcdTUxRkEnOiAnWCcsXG4gICcyXHVGRTBGXHUyMEUzXHVEODNEXHVEREMzXHU3N0U1XHU4QkM2XHU2QzYwJzogJ1onLFxufTtcblxuLyoqIFx1N0YxNlx1NzgwMVx1NkI2M1x1NTIxOVx1RkYxQVlZX01NRERfVF9OTltfYU5dXHUzMDAyICovXG5jb25zdCBDT0RFX1JFID0gL14oXFxkezJ9KV8oXFxkezR9KV8oW1NYU0xaUUpdKV8oXFxkKykoPzpfKFthLXpdXFxkKykpPyQvO1xuXG4vKipcbiAqIFx1NEVDRVx1NjU4N1x1NEVGNlx1NjI0MFx1NTcyOFx1NzZFRVx1NUY1NVx1NjNBOFx1NUJGQ1x1NjgwN1x1N0I3RVx1MzAwMlxuICogXHU0RjE4XHU1MTQ4XHU3RUE3XHVGRjFBWUFNTCBcdTY4MDdcdTdCN0VcdTVCNTdcdTZCQjUgPiBcdTc2RUVcdTVGNTVcdTUyNERcdTdGMDAgPiBcdTlFRDhcdThCQTQgU1x1MzAwMlxuICovXG5mdW5jdGlvbiBpbmZlclRhZyhkaXI6IHN0cmluZywgZXhpc3RpbmdUYWc/OiBUYWcpOiBUYWcge1xuICBpZiAoZXhpc3RpbmdUYWcgJiYgWydTJywgJ1gnLCAnTCcsICdaJywgJ1EnLCAnSiddLmluY2x1ZGVzKGV4aXN0aW5nVGFnKSkge1xuICAgIHJldHVybiBleGlzdGluZ1RhZztcbiAgfVxuICBmb3IgKGNvbnN0IFtkaXJIaW50LCB0YWddIG9mIE9iamVjdC5lbnRyaWVzKFRBR19CWV9ESVJfSElOVCkpIHtcbiAgICBpZiAoZGlyLnN0YXJ0c1dpdGgoZGlySGludCkpIHJldHVybiB0YWc7XG4gIH1cbiAgLy8gXHU3N0U1XHU4QkM2XHU2QzYwXHU0RTBCXHU3Njg0XHU1QjUwXHU3NkVFXHU1RjU1XHU1M0VGXHU4MEZEXHU4RkRCXHU0RTAwXHU2QjY1XHU3RUM2XHU1MjA2XG4gIGlmIChkaXIuaW5jbHVkZXMoJ1x1NzdFNVx1OEJDNlx1NkM2MCcpIHx8IGRpci5pbmNsdWRlcygnXHVEODNEXHVEREMzJykpIHtcbiAgICAvLyBcdThENDRcdTZFOTBcdTdDN0JcdTlFRDhcdThCQTQgWlx1RkYwQ1x1NTNFRlx1ODhBQlx1NzZFRVx1NUY1NVx1NTQwRFx1ODk4Nlx1NzZENlxuICAgIGlmIChkaXIuaW5jbHVkZXMoJ0wnKSB8fCBkaXIuaW5jbHVkZXMoJ1x1OTg4Nlx1NTdERicpKSByZXR1cm4gJ0wnO1xuICAgIGlmIChkaXIuaW5jbHVkZXMoJ1EnKSB8fCBkaXIuaW5jbHVkZXMoJ1x1NzA3NVx1NjExRicpKSByZXR1cm4gJ1EnO1xuICAgIGlmIChkaXIuaW5jbHVkZXMoJ0onKSB8fCBkaXIuaW5jbHVkZXMoJ1x1NjI4MFx1ODBGRCcpKSByZXR1cm4gJ0onO1xuICAgIHJldHVybiAnWic7XG4gIH1cbiAgaWYgKGRpci5pbmNsdWRlcygnXHU4RjkzXHU1MUZBJykgfHwgZGlyLmluY2x1ZGVzKCcxXHVGRTBGXHUyMEUzJykpIHJldHVybiAnWCc7XG4gIGlmIChkaXIuaW5jbHVkZXMoJ1x1OEY5M1x1NTE2NScpIHx8IGRpci5pbmNsdWRlcygnMFx1RkUwRlx1MjBFMycpKSByZXR1cm4gJ1MnO1xuICByZXR1cm4gJ1MnO1xufVxuXG4vKipcbiAqIFx1NjI2Qlx1NjNDRlx1NTQwQ1x1NzZFRVx1NUY1NVx1NEUwQlx1NTQwQ1x1NjgwN1x1N0I3RVx1NzY4NFx1NjcwMFx1NTkyN1x1NUU4Rlx1NTNGN1x1RkYwQ1x1NTIwNlx1OTE0RFx1NjVCMFx1NUU4Rlx1NTNGN1x1MzAwMlxuICovXG5hc3luYyBmdW5jdGlvbiBuZXh0U2VxdWVuY2UoYXBwOiBBcHAsIGRpcjogc3RyaW5nLCB0YWc6IFRhZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gIGNvbnN0IGZvbGRlciA9IGFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZGlyKTtcbiAgaWYgKCEoZm9sZGVyIGluc3RhbmNlb2YgVEZvbGRlcikpIHJldHVybiAxO1xuXG4gIGxldCBtYXhTZXEgPSAwO1xuICBmb3IgKGNvbnN0IGNoaWxkIG9mIGZvbGRlci5jaGlsZHJlbikge1xuICAgIGlmICghKGNoaWxkIGluc3RhbmNlb2YgVEZpbGUpIHx8ICFjaGlsZC5uYW1lLmVuZHNXaXRoKCcubWQnKSkgY29udGludWU7XG4gICAgY29uc3QgbWF0Y2ggPSBjaGlsZC5uYW1lLm1hdGNoKENPREVfUkUpO1xuICAgIGlmIChtYXRjaCAmJiBtYXRjaFszXSA9PT0gdGFnKSB7XG4gICAgICBjb25zdCBzZXEgPSBwYXJzZUludChtYXRjaFs0XSwgMTApO1xuICAgICAgaWYgKHNlcSA+IG1heFNlcSkgbWF4U2VxID0gc2VxO1xuICAgIH1cbiAgICAvLyBcdTRFNUZcdTUzMzlcdTkxNERcdTY1RTBcdTUyNERcdTdGMDBcdTRGNDZcdTY3MDkgWUFNTCBcdTdGMTZcdTc4MDFcdTc2ODRcdTYwQzVcdTUxQjVcbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgYXBwLnZhdWx0LnJlYWQoY2hpbGQpO1xuICAgICAgICBjb25zdCB7IGZyb250bWF0dGVyIH0gPSBwYXJzZUZyb250bWF0dGVyKGNvbnRlbnQpO1xuICAgICAgICBjb25zdCBlbmMgPSBmcm9udG1hdHRlcj8uXHU3RjE2XHU3ODAxIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKGVuYykge1xuICAgICAgICAgIGNvbnN0IGVuY01hdGNoID0gZW5jLm1hdGNoKENPREVfUkUpO1xuICAgICAgICAgIGlmIChlbmNNYXRjaCAmJiBlbmNNYXRjaFszXSA9PT0gdGFnKSB7XG4gICAgICAgICAgICBjb25zdCBzZXEgPSBwYXJzZUludChlbmNNYXRjaFs0XSwgMTApO1xuICAgICAgICAgICAgaWYgKHNlcSA+IG1heFNlcSkgbWF4U2VxID0gc2VxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbWF4U2VxICsgMTtcbn1cblxuLyoqXG4gKiBcdTRFM0FcdTY1ODdcdTRFRjZcdTUyMDZcdTkxNERcdTdGMTZcdTc4MDFcdTMwMDJcbiAqIC0gXHU3NTFGXHU2MjEwIFlZX01NRERfVF9OTiBcdTY4M0NcdTVGMEZcbiAqIC0gXHU5MUNEXHU1NDdEXHU1NDBEXHU2NTg3XHU0RUY2XHVGRjA4XHU1MkEwXHU3RjE2XHU3ODAxXHU1MjREXHU3RjAwXHVGRjA5XG4gKiAtIFx1NTE5OVx1NTZERSBZQU1MIFx1N0YxNlx1NzgwMVx1NUI1N1x1NkJCNVxuICpcbiAqIEByZXR1cm5zIFx1NTIwNlx1OTE0RFx1NTIzMFx1NzY4NFx1N0YxNlx1NzgwMVx1NEUzMlx1RkYwQ1x1NTk4MiBcIjI2XzA2MTVfU18wMVwiXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhc3NpZ25FbmNvZGluZyhcbiAgYXBwOiBBcHAsXG4gIGZpbGVQYXRoOiBzdHJpbmcsXG4gIGRpcjogc3RyaW5nLFxuKTogUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQ+IHtcbiAgY29uc3QgZmlsZSA9IGFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZmlsZVBhdGgpO1xuICBpZiAoIShmaWxlIGluc3RhbmNlb2YgVEZpbGUpKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBhcHAudmF1bHQucmVhZChmaWxlKTtcbiAgY29uc3QgeyBmcm9udG1hdHRlciwgYm9keSB9ID0gcGFyc2VGcm9udG1hdHRlcihjb250ZW50KTtcbiAgY29uc3QgZm0gPSBmcm9udG1hdHRlciA/PyB7fTtcblxuICAvLyBcdTVERjJcdTY3MDlcdTdGMTZcdTc4MDFcdTVDMzFcdThERjNcdThGQzdcbiAgaWYgKGZtLlx1N0YxNlx1NzgwMSAmJiBDT0RFX1JFLnRlc3QoZm0uXHU3RjE2XHU3ODAxIGFzIHN0cmluZykpIHtcbiAgICByZXR1cm4gZm0uXHU3RjE2XHU3ODAxIGFzIHN0cmluZztcbiAgfVxuXG4gIC8vIFx1NjNBOFx1NUJGQ1x1NjgwN1x1N0I3RSArIFx1NUU4Rlx1NTNGN1xuICBjb25zdCB0YWcgPSBpbmZlclRhZyhkaXIsIGZtLlx1NjgwN1x1N0I3RSBhcyBUYWcgfCB1bmRlZmluZWQpO1xuICBjb25zdCBzZXEgPSBhd2FpdCBuZXh0U2VxdWVuY2UoYXBwLCBkaXIsIHRhZyk7XG5cbiAgLy8gXHU3NTFGXHU2MjEwXHU3RjE2XHU3ODAxXG4gIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gIGNvbnN0IHl5ID0gU3RyaW5nKG5vdy5nZXRGdWxsWWVhcigpKS5zbGljZSgyKTtcbiAgY29uc3QgbW1kZCA9IGAke1N0cmluZyhub3cuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyl9JHtTdHJpbmcobm93LmdldERhdGUoKSkucGFkU3RhcnQoMiwgJzAnKX1gO1xuICBjb25zdCBjb2RlID0gYCR7eXl9XyR7bW1kZH1fJHt0YWd9XyR7U3RyaW5nKHNlcSkucGFkU3RhcnQoMiwgJzAnKX1gO1xuXG4gIC8vIFx1NTE5OVx1NTZERSBZQU1MXG4gIGNvbnN0IG5ld0ZtID0geyAuLi5mbSwgXHU2ODA3XHU3QjdFOiB0YWcsIFx1N0YxNlx1NzgwMTogY29kZSB9O1xuICBjb25zdCBuZXdDb250ZW50ID0gYXNzZW1ibGVGaWxlKG5ld0ZtLCBib2R5KTtcbiAgYXdhaXQgYXBwLnZhdWx0Lm1vZGlmeShmaWxlLCBuZXdDb250ZW50KTtcblxuICAvLyBcdTkxQ0RcdTU0N0RcdTU0MERcdTY1ODdcdTRFRjZcdUZGMDhcdTUyQTBcdTdGMTZcdTc4MDFcdTUyNERcdTdGMDBcdUZGMDlcbiAgY29uc3QgZXh0ID0gZmlsZS5leHRlbnNpb247XG4gIGNvbnN0IG9sZE5hbWUgPSBmaWxlLmJhc2VuYW1lO1xuICBjb25zdCBuZXdOYW1lID0gYCR7Y29kZX0gJHtvbGROYW1lfWA7XG4gIGNvbnN0IG5ld1BhdGggPSBmaWxlUGF0aC5yZXBsYWNlKC9bXi9dKyQvLCBgJHtuZXdOYW1lfS4ke2V4dH1gKTtcbiAgaWYgKG5ld1BhdGggIT09IGZpbGVQYXRoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGFwcC52YXVsdC5yZW5hbWUoZmlsZSwgbmV3UGF0aCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2F1dG9SZW5hbWVdIHJlbmFtZSBmYWlsZWQ6JywgZXJyKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29kZTtcbn1cblxuLyoqXG4gKiBcdTYyNzlcdTkxQ0ZcdTUyMDZcdTkxNERcdTdGMTZcdTc4MDFcdUZGMDhyaWJib24gXHU4OUU2XHU1M0QxXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBiYXRjaEFzc2lnbkVuY29kaW5nKGFwcDogQXBwLCBkaXI6IHN0cmluZyk6IFByb21pc2U8eyB0b3RhbDogbnVtYmVyOyBhc3NpZ25lZDogbnVtYmVyIH0+IHtcbiAgY29uc3QgZm9sZGVyID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChkaXIpO1xuICBpZiAoIShmb2xkZXIgaW5zdGFuY2VvZiBURm9sZGVyKSkgcmV0dXJuIHsgdG90YWw6IDAsIGFzc2lnbmVkOiAwIH07XG5cbiAgbGV0IGFzc2lnbmVkID0gMDtcbiAgbGV0IHRvdGFsID0gMDtcbiAgZm9yIChjb25zdCBjaGlsZCBvZiBmb2xkZXIuY2hpbGRyZW4pIHtcbiAgICBpZiAoIShjaGlsZCBpbnN0YW5jZW9mIFRGaWxlKSB8fCAhY2hpbGQubmFtZS5lbmRzV2l0aCgnLm1kJykpIGNvbnRpbnVlO1xuICAgIHRvdGFsKys7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFzc2lnbkVuY29kaW5nKGFwcCwgY2hpbGQucGF0aCwgZGlyKTtcbiAgICAgIGlmIChyZXN1bHQpIGFzc2lnbmVkKys7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFtzeW5jL2F1dG9SZW5hbWVdIGJhdGNoIGZhaWxlZCBmb3IgJHtjaGlsZC5wYXRofTpgLCBlcnIpO1xuICAgIH1cbiAgfVxuICByZXR1cm4geyB0b3RhbCwgYXNzaWduZWQgfTtcbn1cblxuLyoqXG4gKiBcdTg5RTNcdTc4MDFcdUZGMUFcdTRFQ0VcdTY1ODdcdTRFRjZcdTU0MERcdTYyMTYgWUFNTCBcdTYzRDBcdTUzRDZcdTdGMTZcdTc4MDFcdTRGRTFcdTYwNkZcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZUNvZGUoY29kZTogc3RyaW5nKToge1xuICB5eTogc3RyaW5nO1xuICBtbWRkOiBzdHJpbmc7XG4gIHRhZzogVGFnO1xuICBzZXE6IG51bWJlcjtcbiAgc3ViPzogc3RyaW5nO1xufSB8IG51bGwge1xuICBjb25zdCBtYXRjaCA9IGNvZGUubWF0Y2goQ09ERV9SRSk7XG4gIGlmICghbWF0Y2gpIHJldHVybiBudWxsO1xuICByZXR1cm4ge1xuICAgIHl5OiBtYXRjaFsxXSxcbiAgICBtbWRkOiBtYXRjaFsyXSxcbiAgICB0YWc6IG1hdGNoWzNdIGFzIFRhZyxcbiAgICBzZXE6IHBhcnNlSW50KG1hdGNoWzRdLCAxMCksXG4gICAgc3ViOiBtYXRjaFs1XSxcbiAgfTtcbn1cbiIsICJleHBvcnQgaW50ZXJmYWNlIEJpbmRpbmdFbnRyeSB7XG4gIHBhdGg6IHN0cmluZztcbiAgY29udGVudDogc3RyaW5nO1xufVxuXG5jbGFzcyBCaW5kaW5nQ29uZmxpY3RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29kZSA9ICdCSU5ESU5HX0NPTkZMSUNUJztcbiAgc3RhdHVzID0gNDA5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEZlaXNodUlkKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCBub3JtYWxpemVkID0gY29udGVudC5yZXBsYWNlKC9eXFx1RkVGRi8sICcnKS5yZXBsYWNlKC9cXHJcXG4/L2csICdcXG4nKTtcbiAgY29uc3QgZnJvbnRtYXR0ZXIgPSBub3JtYWxpemVkLm1hdGNoKC9eLS0tWyBcXHRdKlxcbihbXFxzXFxTXSo/KVxcbi0tLSg/OlxcbnwkKS8pPy5bMV07XG4gIGlmICghZnJvbnRtYXR0ZXIpIHJldHVybiBudWxsO1xuICBjb25zdCBtYXRjaCA9IGZyb250bWF0dGVyLm1hdGNoKC9eZmVpc2h1X2lkWyBcXHRdKjpbIFxcdF0qKD86XCIoW0EtWmEtejAtOV8tXSspXCJ8JyhbQS1aYS16MC05Xy1dKyknfChbQS1aYS16MC05Xy1dKykpWyBcXHRdKiQvbSk7XG4gIHJldHVybiBtYXRjaD8uWzFdID8/IG1hdGNoPy5bMl0gPz8gbWF0Y2g/LlszXSA/PyBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZFVuaXF1ZUJpbmRpbmc8VCBleHRlbmRzIEJpbmRpbmdFbnRyeT4oZmVpc2h1SWQ6IHN0cmluZywgZW50cmllczogcmVhZG9ubHkgVFtdKTogVCB8IG51bGwge1xuICBjb25zdCBtYXRjaGVzID0gZW50cmllcy5maWx0ZXIoKGVudHJ5KSA9PiB7XG4gICAgY29uc3Qgcm9vdCA9IGVudHJ5LnBhdGguc3BsaXQoJy8nKVswXS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChyb290ID09PSAnLm9ic2lkaWFuJyB8fCByb290ID09PSAnLmZlaXNodS1zeW5jJykgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBleHRyYWN0RmVpc2h1SWQoZW50cnkuY29udGVudCkgPT09IGZlaXNodUlkO1xuICB9KTtcbiAgaWYgKG1hdGNoZXMubGVuZ3RoID4gMSkge1xuICAgIGNvbnN0IHBhdGhzID0gbWF0Y2hlcy5tYXAoKGVudHJ5KSA9PiBlbnRyeS5wYXRoKS5zb3J0KCk7XG4gICAgdGhyb3cgbmV3IEJpbmRpbmdDb25mbGljdEVycm9yKGBNdWx0aXBsZSBsb2NhbCBmaWxlcyBiaW5kIGZlaXNodV9pZCAke2ZlaXNodUlkfTogJHtwYXRocy5qb2luKCcsICcpfWApO1xuICB9XG4gIHJldHVybiBtYXRjaGVzWzBdID8/IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRSZXBsYWNlbWVudEJpbmRpbmcoY29udGVudDogc3RyaW5nLCBleHBlY3RlZEZlaXNodUlkOiBzdHJpbmcsIHBhdGg6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBleGlzdGluZ0ZlaXNodUlkID0gZXh0cmFjdEZlaXNodUlkKGNvbnRlbnQpO1xuICBpZiAoZXhpc3RpbmdGZWlzaHVJZCAmJiBleGlzdGluZ0ZlaXNodUlkICE9PSBleHBlY3RlZEZlaXNodUlkKSB7XG4gICAgY29uc3QgZXJyb3IgPSBuZXcgQmluZGluZ0NvbmZsaWN0RXJyb3IoXG4gICAgICBgUmVmdXNpbmcgdG8gcmVwbGFjZSAke3BhdGh9OyBpdCBpcyBib3VuZCB0byBhbm90aGVyIGZlaXNodV9pZGAsXG4gICAgKTtcbiAgICBlcnJvci5jb2RlID0gJ1JFUExBQ0VNRU5UX0JJTkRJTkdfQ09ORkxJQ1QnO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgVEZpbGUsIHR5cGUgQXBwIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgZmluZFVuaXF1ZUJpbmRpbmcgfSBmcm9tICcuL2JpbmRpbmdJbmRleC5qcyc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kVW5pcXVlVmF1bHRCaW5kaW5nKGFwcDogQXBwLCBmZWlzaHVJZDogc3RyaW5nKTogUHJvbWlzZTxURmlsZSB8IG51bGw+IHtcbiAgY29uc3QgZW50cmllczogQXJyYXk8eyBwYXRoOiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZzsgZmlsZTogVEZpbGUgfT4gPSBbXTtcbiAgZm9yIChjb25zdCBmaWxlIG9mIGFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCkpIHtcbiAgICBjb25zdCByb290ID0gZmlsZS5wYXRoLnNwbGl0KCcvJylbMF0udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAocm9vdCA9PT0gJy5vYnNpZGlhbicgfHwgcm9vdCA9PT0gJy5mZWlzaHUtc3luYycpIGNvbnRpbnVlO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gICAgICBpZiAoY29udGVudC5pbmNsdWRlcygnZmVpc2h1X2lkOicpKSBlbnRyaWVzLnB1c2goeyBwYXRoOiBmaWxlLnBhdGgsIGNvbnRlbnQsIGZpbGUgfSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZpbmRVbmlxdWVCaW5kaW5nKGZlaXNodUlkLCBlbnRyaWVzKT8uZmlsZSA/PyBudWxsO1xufVxuIiwgImNvbnN0IE1BWF9QQVRIX0JZVEVTID0gMTAyNDtcbmNvbnN0IE1BWF9TRUdNRU5UX0JZVEVTID0gMjU1O1xuY29uc3QgSU5URVJOQUxfUk9PVFMgPSBuZXcgU2V0KFsnLm9ic2lkaWFuJywgJy5mZWlzaHUtc3luYyddKTtcblxuY2xhc3MgVmFsaWRhdGlvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb2RlOiBzdHJpbmc7XG4gIHN0YXR1cyA9IDQwMDtcblxuICBjb25zdHJ1Y3Rvcihjb2RlOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMuY29kZSA9IGNvZGU7XG4gIH1cbn1cblxuZnVuY3Rpb24gdW5zYWZlUGF0aChtZXNzYWdlOiBzdHJpbmcpOiBuZXZlciB7XG4gIHRocm93IG5ldyBWYWxpZGF0aW9uRXJyb3IoJ1VOU0FGRV9WQVVMVF9QQVRIJywgbWVzc2FnZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVWYXVsdERpcih2YWx1ZTogdW5rbm93bik6IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB1bnNhZmVQYXRoKCdWYXVsdCBwYXRoIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgY29uc3QgcmF3ID0gdmFsdWUudHJpbSgpO1xuICBpZiAoIXJhdykgcmV0dXJuICcnO1xuICBpZiAocmF3LmluY2x1ZGVzKCdcXDAnKSkgdW5zYWZlUGF0aCgnVmF1bHQgcGF0aCBjb250YWlucyBOVUwnKTtcbiAgaWYgKC9eKD86XFwvfFxcXFx8W0EtWmEtel06KS8udGVzdChyYXcpKSB1bnNhZmVQYXRoKCdBYnNvbHV0ZSBWYXVsdCBwYXRocyBhcmUgbm90IGFsbG93ZWQnKTtcbiAgaWYgKC9cXFxcLy50ZXN0KHJhdykpIHVuc2FmZVBhdGgoJ0JhY2tzbGFzaCBzZXBhcmF0b3JzIGFyZSBub3QgYWxsb3dlZCcpO1xuICBpZiAoLyUoPzoyZnw1Y3wwMCkvaS50ZXN0KHJhdykpIHVuc2FmZVBhdGgoJ0VuY29kZWQgc2VwYXJhdG9ycyBhbmQgTlVMIGFyZSBub3QgYWxsb3dlZCcpO1xuXG4gIGxldCBkZWNvZGVkOiBzdHJpbmc7XG4gIHRyeSB7XG4gICAgZGVjb2RlZCA9IGRlY29kZVVSSUNvbXBvbmVudChyYXcpO1xuICB9IGNhdGNoIHtcbiAgICB1bnNhZmVQYXRoKCdWYXVsdCBwYXRoIGNvbnRhaW5zIG1hbGZvcm1lZCBwZXJjZW50IGVuY29kaW5nJyk7XG4gIH1cbiAgaWYgKGRlY29kZWQuaW5jbHVkZXMoJ1xcMCcpIHx8IGRlY29kZWQuaW5jbHVkZXMoJ1xcXFwnKSkgdW5zYWZlUGF0aCgnRGVjb2RlZCBWYXVsdCBwYXRoIGlzIHVuc2FmZScpO1xuXG4gIGNvbnN0IHdpdGhvdXRUcmFpbGluZ1NsYXNoID0gcmF3LnJlcGxhY2UoL1xcLyskLywgJycpO1xuICBjb25zdCBkZWNvZGVkV2l0aG91dFRyYWlsaW5nU2xhc2ggPSBkZWNvZGVkLnJlcGxhY2UoL1xcLyskLywgJycpO1xuICBjb25zdCByYXdTZWdtZW50cyA9IHdpdGhvdXRUcmFpbGluZ1NsYXNoLnNwbGl0KCcvJyk7XG4gIGNvbnN0IGRlY29kZWRTZWdtZW50cyA9IGRlY29kZWRXaXRob3V0VHJhaWxpbmdTbGFzaC5zcGxpdCgnLycpO1xuICBpZiAocmF3U2VnbWVudHMubGVuZ3RoICE9PSBkZWNvZGVkU2VnbWVudHMubGVuZ3RoKSB1bnNhZmVQYXRoKCdFbmNvZGVkIHBhdGggc2VwYXJhdG9ycyBhcmUgbm90IGFsbG93ZWQnKTtcbiAgaWYgKGRlY29kZWRTZWdtZW50cy5zb21lKChzZWdtZW50KSA9PiAhc2VnbWVudCB8fCBzZWdtZW50ID09PSAnLicgfHwgc2VnbWVudCA9PT0gJy4uJykpIHtcbiAgICB1bnNhZmVQYXRoKCdFbXB0eSBhbmQgdHJhdmVyc2FsIHBhdGggc2VnbWVudHMgYXJlIG5vdCBhbGxvd2VkJyk7XG4gIH1cblxuICBjb25zdCBub3JtYWxpemVkU2VnbWVudHMgPSByYXdTZWdtZW50cy5tYXAoKHNlZ21lbnQpID0+IHNlZ21lbnQudHJpbSgpKTtcbiAgaWYgKG5vcm1hbGl6ZWRTZWdtZW50cy5zb21lKChzZWdtZW50KSA9PiAhc2VnbWVudCkpIHVuc2FmZVBhdGgoJ0VtcHR5IHBhdGggc2VnbWVudHMgYXJlIG5vdCBhbGxvd2VkJyk7XG4gIGlmIChJTlRFUk5BTF9ST09UUy5oYXMoZGVjb2RlZFNlZ21lbnRzWzBdLnRyaW0oKS50b0xvd2VyQ2FzZSgpKSkge1xuICAgIHVuc2FmZVBhdGgoJ0ludGVybmFsIHBsdWdpbiBwYXRocyBhcmUgbm90IHdyaXRhYmxlJyk7XG4gIH1cbiAgZm9yIChjb25zdCBzZWdtZW50IG9mIG5vcm1hbGl6ZWRTZWdtZW50cykge1xuICAgIGlmIChCdWZmZXIuYnl0ZUxlbmd0aChzZWdtZW50LCAndXRmOCcpID4gTUFYX1NFR01FTlRfQllURVMpIHtcbiAgICAgIHVuc2FmZVBhdGgoJ1ZhdWx0IHBhdGggc2VnbWVudCBpcyB0b28gbG9uZycpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVkU2VnbWVudHMuam9pbignLycpO1xuICBpZiAoQnVmZmVyLmJ5dGVMZW5ndGgobm9ybWFsaXplZCwgJ3V0ZjgnKSA+IE1BWF9QQVRIX0JZVEVTKSB1bnNhZmVQYXRoKCdWYXVsdCBwYXRoIGlzIHRvbyBsb25nJyk7XG4gIHJldHVybiBub3JtYWxpemVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplVmF1bHRNYXJrZG93blBhdGgodmFsdWU6IHVua25vd24pOiBzdHJpbmcge1xuICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplVmF1bHREaXIodmFsdWUpO1xuICBpZiAoIW5vcm1hbGl6ZWQgfHwgIS9cXC5tZCQvaS50ZXN0KG5vcm1hbGl6ZWQpKSB7XG4gICAgdW5zYWZlUGF0aCgnVmF1bHQgZmlsZSBwYXRoIG11c3QgZW5kIGluIC5tZCcpO1xuICB9XG4gIHJldHVybiBub3JtYWxpemVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVJbWFnZVRva2VuKHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgfHwgIS9eW0EtWmEtejAtOV8tXXsxLDI1Nn0kLy50ZXN0KHZhbHVlKSkge1xuICAgIHRocm93IG5ldyBWYWxpZGF0aW9uRXJyb3IoJ1VOU0FGRV9JTUFHRV9UT0tFTicsICdJbWFnZSB0b2tlbiBpcyBub3QgYSBzYWZlIG9wYXF1ZSBpZGVudGlmaWVyJyk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuIiwgImltcG9ydCB7XG4gIGJvZHlIYXNoLFxuICBjYWxsb3V0WG1sVG9NZXRhLFxuICBjb252ZXJ0RmVpc2h1Q2FsbG91dHNUb09CLFxuICBleHRyYWN0SW1nVG9rZW5zRnJvbVhtbCxcbiAgcmV3cml0ZUltYWdlc1RvRmVpc2h1UHJvdG8sXG59IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVtb3RlRG9jdW1lbnQge1xuICByYXdNYXJrZG93bjogc3RyaW5nO1xuICBib2R5OiBzdHJpbmc7XG4gIGhhc2g6IHN0cmluZztcbiAgdGl0bGU6IHN0cmluZztcbiAgb2JqVG9rZW46IHN0cmluZztcbiAgbWV0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJlbW90ZURvY3VtZW50KFxuICByYXdNYXJrZG93bjogc3RyaW5nLFxuICB4bWw6IHN0cmluZyxcbiAgbm9kZVRva2VuOiBzdHJpbmcsXG4gIG9ialRva2VuID0gJycsXG4pOiBSZW1vdGVEb2N1bWVudCB7XG4gIGNvbnN0IHJlc29sdmVkT2JqVG9rZW4gPSBvYmpUb2tlblxuICAgIHx8IHhtbC5tYXRjaCgvPHRpdGxlW14+XSpcXGJpZD1cIihbQS1aYS16MC05Xy1dKylcIi8pPy5bMV1cbiAgICB8fCAnJztcbiAgY29uc3QgaW1hZ2VUb2tlbnMgPSBuZXcgU2V0KGV4dHJhY3RJbWdUb2tlbnNGcm9tWG1sKHhtbCkpO1xuICBsZXQgYm9keSA9IHJld3JpdGVJbWFnZXNUb0ZlaXNodVByb3RvKHJhd01hcmtkb3duLCBpbWFnZVRva2Vucyk7XG4gIGlmICh4bWwpIGJvZHkgPSBjb252ZXJ0RmVpc2h1Q2FsbG91dHNUb09CKGJvZHkpO1xuICBjb25zdCB0aXRsZSA9IGJvZHkubWF0Y2goL14jXFxzKyguKykkL20pPy5bMV0/LnRyaW0oKSA/PyBub2RlVG9rZW47XG5cbiAgcmV0dXJuIHtcbiAgICByYXdNYXJrZG93bixcbiAgICBib2R5LFxuICAgIGhhc2g6IGJvZHlIYXNoKGJvZHkpLFxuICAgIHRpdGxlLFxuICAgIG9ialRva2VuOiByZXNvbHZlZE9ialRva2VuLFxuICAgIG1ldGE6IHhtbCA/IGNhbGxvdXRYbWxUb01ldGEoeG1sKSA6IHt9LFxuICB9O1xufVxuIiwgImltcG9ydCB7IHJ1biwgZ2V0V2lraU5vZGVJbmZvIH0gZnJvbSAnLi9sYXJrL2NsaS5qcyc7XG5pbXBvcnQgeyBidWlsZFJlbW90ZURvY3VtZW50LCB0eXBlIFJlbW90ZURvY3VtZW50IH0gZnJvbSAnLi9yZW1vdGVDYW5vbmljYWwuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2hSZW1vdGVEb2N1bWVudChpbnB1dDoge1xuICBub2RlVG9rZW46IHN0cmluZztcbiAgc3BhY2VJZD86IHN0cmluZztcbiAgb2JqVG9rZW4/OiBzdHJpbmc7XG59KTogUmVtb3RlRG9jdW1lbnQge1xuICBsZXQgcmVzb2x2ZWRPYmpUb2tlbiA9IGlucHV0Lm9ialRva2VuID8/ICcnO1xuICBsZXQgd2lraUluZm86IFJldHVyblR5cGU8dHlwZW9mIGdldFdpa2lOb2RlSW5mbz4gfCBudWxsID0gbnVsbDtcbiAgbGV0IHJhd01hcmtkb3duOiBzdHJpbmc7XG4gIHRyeSB7XG4gICAgcmF3TWFya2Rvd24gPSBmZXRjaEZvcm1hdChpbnB1dC5ub2RlVG9rZW4sICdtYXJrZG93bicpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHdpa2lJbmZvID0gaW5wdXQuc3BhY2VJZCA/IGdldFdpa2lOb2RlSW5mbyhpbnB1dC5ub2RlVG9rZW4sIGlucHV0LnNwYWNlSWQpIDogbnVsbDtcbiAgICByZXNvbHZlZE9ialRva2VuIHx8PSB3aWtpSW5mbz8ub2JqX3Rva2VuID8/ICcnO1xuICAgIGlmICghcmVzb2x2ZWRPYmpUb2tlbikgdGhyb3cgZXJyb3I7XG4gICAgcmF3TWFya2Rvd24gPSBmZXRjaEZvcm1hdChyZXNvbHZlZE9ialRva2VuLCAnbWFya2Rvd24nKTtcbiAgfVxuXG4gIGxldCB4bWwgPSAnJztcbiAgdHJ5IHtcbiAgICB4bWwgPSBmZXRjaEZvcm1hdChpbnB1dC5ub2RlVG9rZW4sICd4bWwnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoIXJlc29sdmVkT2JqVG9rZW4gJiYgaW5wdXQuc3BhY2VJZCkge1xuICAgICAgd2lraUluZm8gPz89IGdldFdpa2lOb2RlSW5mbyhpbnB1dC5ub2RlVG9rZW4sIGlucHV0LnNwYWNlSWQpO1xuICAgICAgcmVzb2x2ZWRPYmpUb2tlbiA9IHdpa2lJbmZvPy5vYmpfdG9rZW4gPz8gJyc7XG4gICAgfVxuICAgIGlmIChyZXNvbHZlZE9ialRva2VuICYmIHJlc29sdmVkT2JqVG9rZW4gIT09IGlucHV0Lm5vZGVUb2tlbikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgeG1sID0gZmV0Y2hGb3JtYXQocmVzb2x2ZWRPYmpUb2tlbiwgJ3htbCcpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIGNvbnNvbGUud2FybignW3N5bmMvcmVtb3RlXSB4bWwgZmV0Y2ggZmFpbGVkOyBpbWFnZSBhbmQgY2FsbG91dCBtZXRhZGF0YSBtYXkgYmUgaW5jb21wbGV0ZTonLCBlcnJvcik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybignW3N5bmMvcmVtb3RlXSB4bWwgZmV0Y2ggZmFpbGVkOyBpbWFnZSBhbmQgY2FsbG91dCBtZXRhZGF0YSBtYXkgYmUgaW5jb21wbGV0ZTonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1aWxkUmVtb3RlRG9jdW1lbnQocmF3TWFya2Rvd24sIHhtbCwgaW5wdXQubm9kZVRva2VuLCByZXNvbHZlZE9ialRva2VuKTtcbn1cblxuZnVuY3Rpb24gZmV0Y2hGb3JtYXQodG9rZW46IHN0cmluZywgZm9ybWF0OiAnbWFya2Rvd24nIHwgJ3htbCcpOiBzdHJpbmcge1xuICBjb25zdCBhcmdzID0gWydkb2NzJywgJytmZXRjaCcsICctLWRvYycsIHRva2VuLCAnLS1kb2MtZm9ybWF0JywgZm9ybWF0XTtcbiAgaWYgKGZvcm1hdCA9PT0gJ3htbCcpIGFyZ3MucHVzaCgnLS1kZXRhaWwnLCAnd2l0aC1pZHMnKTtcbiAgcmV0dXJuIHJ1bihhcmdzLCB7IHRpbWVvdXQ6IDYwXzAwMCB9KTtcbn1cbiIsICJleHBvcnQgaW50ZXJmYWNlIFRocmVlV2F5U3luY0lucHV0IHtcbiAgYmFzZUhhc2g/OiBzdHJpbmc7XG4gIGxvY2FsSGFzaDogc3RyaW5nO1xuICByZW1vdGVIYXNoOiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIFRocmVlV2F5U3luY0RlY2lzaW9uID1cbiAgfCB7IGFjdGlvbjogJ3BhdXNlJzsgcmVhc29uOiAnTUlTU0lOR19CQVNFJyB9XG4gIHwgeyBhY3Rpb246ICdjb25mbGljdCc7IHJlYXNvbjogJ0JPVEhfQ0hBTkdFRCcgfVxuICB8IHsgYWN0aW9uOiAncHVsbCcgfCAncHVzaCcgfCAnY29udmVyZ2VkJyB8ICd1bmNoYW5nZWQnIH07XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWNpZGVUaHJlZVdheVN5bmMoaW5wdXQ6IFRocmVlV2F5U3luY0lucHV0KTogVGhyZWVXYXlTeW5jRGVjaXNpb24ge1xuICBjb25zdCBiYXNlSGFzaCA9IGlucHV0LmJhc2VIYXNoPy50cmltKCk7XG4gIGlmICghYmFzZUhhc2gpIHJldHVybiB7IGFjdGlvbjogJ3BhdXNlJywgcmVhc29uOiAnTUlTU0lOR19CQVNFJyB9O1xuXG4gIGNvbnN0IGxvY2FsQ2hhbmdlZCA9IGlucHV0LmxvY2FsSGFzaCAhPT0gYmFzZUhhc2g7XG4gIGNvbnN0IHJlbW90ZUNoYW5nZWQgPSBpbnB1dC5yZW1vdGVIYXNoICE9PSBiYXNlSGFzaDtcbiAgaWYgKCFsb2NhbENoYW5nZWQgJiYgIXJlbW90ZUNoYW5nZWQpIHJldHVybiB7IGFjdGlvbjogJ3VuY2hhbmdlZCcgfTtcbiAgaWYgKGlucHV0LmxvY2FsSGFzaCA9PT0gaW5wdXQucmVtb3RlSGFzaCkgcmV0dXJuIHsgYWN0aW9uOiAnY29udmVyZ2VkJyB9O1xuICBpZiAoIWxvY2FsQ2hhbmdlZCAmJiByZW1vdGVDaGFuZ2VkKSByZXR1cm4geyBhY3Rpb246ICdwdWxsJyB9O1xuICBpZiAobG9jYWxDaGFuZ2VkICYmICFyZW1vdGVDaGFuZ2VkKSByZXR1cm4geyBhY3Rpb246ICdwdXNoJyB9O1xuICByZXR1cm4geyBhY3Rpb246ICdjb25mbGljdCcsIHJlYXNvbjogJ0JPVEhfQ0hBTkdFRCcgfTtcbn1cblxuZXhwb3J0IHR5cGUgU3luY0V4ZWN1dGlvbiA9ICd3cml0ZScgfCAnc2tpcCcgfCAnYWR2YW5jZSc7XG5cbmNsYXNzIFN5bmNEZWNpc2lvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb2RlOiBzdHJpbmc7XG4gIHN0YXR1cyA9IDQwOTtcblxuICBjb25zdHJ1Y3Rvcihjb2RlOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMuY29kZSA9IGNvZGU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYW5TeW5jRXhlY3V0aW9uKFxuICBpbnRlbnQ6ICdwdWxsJyB8ICdwdXNoJyxcbiAgZGVjaXNpb246IFRocmVlV2F5U3luY0RlY2lzaW9uLFxuKTogU3luY0V4ZWN1dGlvbiB7XG4gIGlmIChkZWNpc2lvbi5hY3Rpb24gPT09ICdwYXVzZScpIHtcbiAgICB0aHJvdyBuZXcgU3luY0RlY2lzaW9uRXJyb3IoJ01JU1NJTkdfU1lOQ19CQVNFJywgJ1x1N0YzQVx1NUMxMVx1NTNFRlx1OTc2MFx1NTQwQ1x1NkI2NVx1NTdGQVx1N0VCRlx1RkYwQ1x1NURGMlx1NjY4Mlx1NTA1Q1x1ODk4Nlx1NzZENicpO1xuICB9XG4gIGlmIChkZWNpc2lvbi5hY3Rpb24gPT09ICdjb25mbGljdCcpIHtcbiAgICB0aHJvdyBuZXcgU3luY0RlY2lzaW9uRXJyb3IoJ1NZTkNfQ09ORkxJQ1QnLCAnXHU2NzJDXHU1NzMwXHU1NDhDXHU5OERFXHU0RTY2XHU5MEZEXHU1REYyXHU0RkVFXHU2NTM5XHVGRjBDXHU1REYyXHU2NjgyXHU1MDVDXHU4OTg2XHU3NkQ2Jyk7XG4gIH1cbiAgaWYgKGRlY2lzaW9uLmFjdGlvbiA9PT0gJ3VuY2hhbmdlZCcpIHJldHVybiAnc2tpcCc7XG4gIGlmIChkZWNpc2lvbi5hY3Rpb24gPT09ICdjb252ZXJnZWQnKSByZXR1cm4gJ2FkdmFuY2UnO1xuICBpZiAoZGVjaXNpb24uYWN0aW9uID09PSBpbnRlbnQpIHJldHVybiAnd3JpdGUnO1xuICBpZiAoaW50ZW50ID09PSAncHVsbCcpIHtcbiAgICB0aHJvdyBuZXcgU3luY0RlY2lzaW9uRXJyb3IoJ0xPQ0FMX0NIQU5HRVNfUEVORElORycsICdcdTY3MkNcdTU3MzBcdTY3MDlcdTY3MkFcdTU2REVcdTUxOTlcdTRGRUVcdTY1MzlcdUZGMENcdThCRjdcdTUxNDhcdTU2REVcdTUxOTlcdTYyMTZcdTRFQkFcdTVERTVcdTU5MDRcdTc0MDYnKTtcbiAgfVxuICB0aHJvdyBuZXcgU3luY0RlY2lzaW9uRXJyb3IoJ1JFTU9URV9DSEFOR0VTX1BFTkRJTkcnLCAnXHU5OERFXHU0RTY2XHU2NzA5XHU2NzJBXHU2MkM5XHU1M0Q2XHU0RkVFXHU2NTM5XHVGRjBDXHU4QkY3XHU1MTQ4XHU2MkM5XHU1M0Q2XHU2MjE2XHU0RUJBXHU1REU1XHU1OTA0XHU3NDA2Jyk7XG59XG4iLCAiaW1wb3J0IHsgY3JlYXRlSGFzaCwgcmFuZG9tVVVJRCB9IGZyb20gJ25vZGU6Y3J5cHRvJztcblxuY29uc3QgUkVDT1ZFUllfUk9PVCA9ICcuZmVpc2h1LXN5bmMvcmVjb3ZlcnknO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlY292ZXJ5QWRhcHRlciB7XG4gIGV4aXN0cyhwYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+O1xuICBta2RpcihwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+O1xuICB3cml0ZShwYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD47XG4gIGxpc3QocGF0aDogc3RyaW5nKTogUHJvbWlzZTx7IGZpbGVzOiBzdHJpbmdbXTsgZm9sZGVyczogc3RyaW5nW10gfT47XG4gIHJlbW92ZShwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlY292ZXJ5U25hcHNob3RJbnB1dCB7XG4gIG9yaWdpbmFsUGF0aDogc3RyaW5nO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHNvdXJjZTogJ2xvY2FsJyB8ICdyZW1vdGUnO1xuICBub3c/OiBEYXRlO1xuICBub25jZT86IHN0cmluZztcbiAgbWF4U25hcHNob3RzPzogbnVtYmVyO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlUmVjb3ZlcnlTbmFwc2hvdChcbiAgYWRhcHRlcjogUmVjb3ZlcnlBZGFwdGVyLFxuICBpbnB1dDogUmVjb3ZlcnlTbmFwc2hvdElucHV0LFxuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgYXdhaXQgZW5zdXJlRGlyZWN0b3J5KGFkYXB0ZXIsICcuZmVpc2h1LXN5bmMnKTtcbiAgYXdhaXQgZW5zdXJlRGlyZWN0b3J5KGFkYXB0ZXIsIFJFQ09WRVJZX1JPT1QpO1xuXG4gIGNvbnN0IG5vdyA9IGlucHV0Lm5vdyA/PyBuZXcgRGF0ZSgpO1xuICBjb25zdCBub25jZSA9IGlucHV0Lm5vbmNlID8/IHJhbmRvbVVVSUQoKTtcbiAgY29uc3QgaWRlbnRpdHkgPSBjcmVhdGVIYXNoKCdzaGEyNTYnKVxuICAgIC51cGRhdGUoYCR7aW5wdXQub3JpZ2luYWxQYXRofVxcMCR7bm9uY2V9YClcbiAgICAuZGlnZXN0KCdoZXgnKVxuICAgIC5zbGljZSgwLCAxNik7XG4gIGNvbnN0IHRpbWVzdGFtcCA9IG5vdy50b0lTT1N0cmluZygpLnJlcGxhY2UoL1stOi5dL2csICcnKTtcbiAgY29uc3Qgc25hcHNob3RQYXRoID0gYCR7UkVDT1ZFUllfUk9PVH0vJHt0aW1lc3RhbXB9LSR7aW5wdXQuc291cmNlfS0ke2lkZW50aXR5fS5qc29uYDtcbiAgY29uc3Qgc25hcHNob3QgPSB7XG4gICAgc2NoZW1hVmVyc2lvbjogMSxcbiAgICBjcmVhdGVkQXQ6IG5vdy50b0lTT1N0cmluZygpLFxuICAgIHNvdXJjZTogaW5wdXQuc291cmNlLFxuICAgIG9yaWdpbmFsUGF0aDogaW5wdXQub3JpZ2luYWxQYXRoLFxuICAgIGNvbnRlbnQ6IGlucHV0LmNvbnRlbnQsXG4gIH07XG5cbiAgYXdhaXQgYWRhcHRlci53cml0ZShzbmFwc2hvdFBhdGgsIEpTT04uc3RyaW5naWZ5KHNuYXBzaG90LCBudWxsLCAyKSk7XG4gIGF3YWl0IHJvdGF0ZVNuYXBzaG90cyhhZGFwdGVyLCBNYXRoLm1heCgxLCBpbnB1dC5tYXhTbmFwc2hvdHMgPz8gMjApKTtcbiAgcmV0dXJuIHNuYXBzaG90UGF0aDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZW5zdXJlRGlyZWN0b3J5KGFkYXB0ZXI6IFJlY292ZXJ5QWRhcHRlciwgcGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmIChhd2FpdCBhZGFwdGVyLmV4aXN0cyhwYXRoKSkgcmV0dXJuO1xuICB0cnkge1xuICAgIGF3YWl0IGFkYXB0ZXIubWtkaXIocGF0aCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKCEoYXdhaXQgYWRhcHRlci5leGlzdHMocGF0aCkpKSB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiByb3RhdGVTbmFwc2hvdHMoYWRhcHRlcjogUmVjb3ZlcnlBZGFwdGVyLCBtYXhTbmFwc2hvdHM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICB0cnkge1xuICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBhZGFwdGVyLmxpc3QoUkVDT1ZFUllfUk9PVCk7XG4gICAgY29uc3QgZmlsZXMgPSBlbnRyaWVzLmZpbGVzXG4gICAgICAuZmlsdGVyKChwYXRoKSA9PiBwYXRoLmVuZHNXaXRoKCcuanNvbicpKVxuICAgICAgLnNvcnQoKTtcbiAgICBjb25zdCBleGNlc3MgPSBmaWxlcy5zbGljZSgwLCBNYXRoLm1heCgwLCBmaWxlcy5sZW5ndGggLSBtYXhTbmFwc2hvdHMpKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChleGNlc3MubWFwKChwYXRoKSA9PiBhZGFwdGVyLnJlbW92ZShwYXRoKSkpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUud2FybignW3N5bmMvcmVjb3ZlcnldIHNuYXBzaG90IHJvdGF0aW9uIGZhaWxlZDonLCBlcnJvcik7XG4gIH1cbn1cbiIsICIvKipcbiAqIFBPU1QgL2NsaXAgXHUyMDE0IFx1NEVGQlx1NjEwRlx1N0Y1MVx1OTg3NS9cdTUyMTJcdThCQ0RcdTUyNkFcdTVCNThcdTUyMzAgT2JzaWRpYW5cdTMwMDJcbiAqXG4gKiBNVlAgXHU1MUIzXHU3QjU2XHVGRjFBXG4gKiAtIFx1NEUwRFx1N0VEMVx1NUI5QSBmZWlzaHVfaWRcdUZGMENcdTkwN0ZcdTUxNERcdTYyOEFcdTY2NkVcdTkwMUFcdTdGNTFcdTk4NzVcdTRGMkFcdTg4QzVcdTYyMTBcdTk4REVcdTRFNjZcdTU0MENcdTZCNjVcdTY1ODdcdTRFRjZcdTMwMDJcbiAqIC0gXHU1MTk5XHU1MTY1XHU2M0QyXHU0RUY2XHU5RUQ4XHU4QkE0XHU3NkVFXHU1RjU1XHU2MjE2XHU4QkY3XHU2QzQyXHU0RjIwXHU1MTY1XHU3NkVFXHU1RjU1XHUzMDAyXG4gKiAtIFx1NEY3Rlx1NzUyOFx1NzdFNVx1OEJDNlx1NUU5M1x1NUI1N1x1NkJCNVx1OTg4NFx1OEJCRVx1NTg2Qlx1NTE0NVx1NTdGQVx1Nzg0MCBZQU1MXHVGRjBDXHU3RjE2XHU3ODAxXHU0RUNEXHU0RUE0XHU3RUQ5IGF1dG8tcmVuYW1lXHUzMDAyXG4gKi9cbmltcG9ydCB7IGFzc2VtYmxlRmlsZSwgdHlwZSBDbGlwUmVxdWVzdCwgdHlwZSBDbGlwUmVzcG9uc2UgfSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHsgQXBwLCBURmlsZSwgVEZvbGRlciB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuaW1wb3J0IHR5cGUgeyBGZWlzaHVTeW5jU2V0dGluZ3MgfSBmcm9tICcuLi9zZXR0aW5ncy5qcyc7XG5pbXBvcnQgeyBtYWtlRmlsZW5hbWUsIG1ha2VQYXRoIH0gZnJvbSAnLi4vZmlsZWlvL3dyaXRlci5qcyc7XG5pbXBvcnQgeyBhc3NpZ25FbmNvZGluZyB9IGZyb20gJy4uL2F1dG9SZW5hbWUuanMnO1xuaW1wb3J0IHsgbm9ybWFsaXplVmF1bHREaXIsIG5vcm1hbGl6ZVZhdWx0TWFya2Rvd25QYXRoIH0gZnJvbSAnLi4vdmF1bHRQYXRoLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBDbGlwRGVwcyB7XG4gIGFwcDogQXBwO1xuICBzZXR0aW5nczogRmVpc2h1U3luY1NldHRpbmdzO1xuICBub3RpY2U6IChtc2c6IHN0cmluZykgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNsaXBIYW5kbGVyKGRlcHM6IENsaXBEZXBzKSB7XG4gIHJldHVybiBhc3luYyAoY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8Q2xpcFJlc3BvbnNlPiA9PiB7XG4gICAgY29uc3QgcmVxID0gKGN0eC5ib2R5ID8/IHt9KSBhcyBDbGlwUmVxdWVzdDtcbiAgICBjb25zdCB0aXRsZSA9IGNsZWFuVGV4dChyZXEudGl0bGUpIHx8ICdcdTdGNTFcdTk4NzVcdTUyNkFcdTg1Q0YnO1xuICAgIGNvbnN0IHVybCA9IGNsZWFuVGV4dChyZXEudXJsKTtcbiAgICBjb25zdCB0ZXh0ID0gY2xlYW5UZXh0KHJlcS50ZXh0KTtcbiAgICBjb25zdCByYXdUZXh0ID0gY2xlYW5UZXh0KHJlcS5yYXdUZXh0KSB8fCB0ZXh0O1xuICAgIGNvbnN0IGJvZHlNYXJrZG93biA9IGNsZWFuVGV4dChyZXEuYm9keU1hcmtkb3duKTtcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGNsZWFuVGV4dChyZXEuZGVzY3JpcHRpb24pO1xuICAgIGNvbnN0IHNvdXJjZUtpbmQgPSBjbGVhblRleHQocmVxLnNvdXJjZUtpbmQpIHx8ICdnZW5lcmljLXBhZ2UnO1xuICAgIGNvbnN0IGFwcGVuZFBhdGggPSByZXEuYXBwZW5kUGF0aCA/IG5vcm1hbGl6ZVZhdWx0TWFya2Rvd25QYXRoKHJlcS5hcHBlbmRQYXRoKSA6ICcnO1xuICAgIGlmICghdXJsICYmICF0ZXh0ICYmICFib2R5TWFya2Rvd24gJiYgIXJhd1RleHQpIHtcbiAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoJ3VybCBvciB0ZXh0IGlzIHJlcXVpcmVkJykgYXMgRXJyb3IgJiB7IGNvZGU6IHN0cmluZzsgc3RhdHVzOiBudW1iZXIgfTtcbiAgICAgIGUuY29kZSA9ICdNSVNTSU5HX0NMSVBfQ09OVEVOVCc7XG4gICAgICBlLnN0YXR1cyA9IDQwMDtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRlZEF0ID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCB0YXJnZXREaXIgPSBub3JtYWxpemVWYXVsdERpcihjbGVhblRleHQocmVxLmRpcikgfHwgZGVwcy5zZXR0aW5ncy5kZWZhdWx0RGlyKTtcbiAgICBjb25zdCBtZXRhID0gbm9ybWFsaXplQ2xpcE1ldGEocmVxLm1ldGEsIHtcbiAgICAgIHRpdGxlLFxuICAgICAgdXJsLFxuICAgICAgdGV4dDogcmF3VGV4dCB8fCBib2R5TWFya2Rvd24gfHwgdGV4dCxcbiAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgZGlyOiB0YXJnZXREaXIsXG4gICAgICBkYXRlOiBmb3JtYXREYXRlKGNyZWF0ZWRBdCksXG4gICAgfSk7XG5cbiAgICBjb25zdCBjb250ZW50SW5wdXQgPSB7XG4gICAgICB0aXRsZSxcbiAgICAgIHVybCxcbiAgICAgIHRleHQsXG4gICAgICByYXdUZXh0LFxuICAgICAgYm9keU1hcmtkb3duLFxuICAgICAgZGVzY3JpcHRpb24sXG4gICAgICBkaXI6IHRhcmdldERpcixcbiAgICAgIG1ldGEsXG4gICAgICBzb3VyY2VLaW5kLFxuICAgICAgZGF0ZTogZm9ybWF0RGF0ZShjcmVhdGVkQXQpLFxuICAgICAgY3JlYXRlZEF0OiBjcmVhdGVkQXQudG9JU09TdHJpbmcoKSxcbiAgICB9O1xuXG4gICAgaWYgKGFwcGVuZFBhdGgpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGRlcHMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChhcHBlbmRQYXRoKTtcbiAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIFRGaWxlKSkge1xuICAgICAgICBjb25zdCBlID0gbmV3IEVycm9yKGBcdTg4NjVcdTUxNDVcdTc2RUVcdTY4MDdcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUEke2FwcGVuZFBhdGh9YCkgYXMgRXJyb3IgJiB7IGNvZGU6IHN0cmluZzsgc3RhdHVzOiBudW1iZXIgfTtcbiAgICAgICAgZS5jb2RlID0gJ0FQUEVORF9UQVJHRVRfTk9UX0ZPVU5EJztcbiAgICAgICAgZS5zdGF0dXMgPSA0MDQ7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgICBjb25zdCBjdXJyZW50ID0gYXdhaXQgZGVwcy5hcHAudmF1bHQucmVhZCh0YXJnZXQpO1xuICAgICAgY29uc3QgYXBwZW5kaXggPSBidWlsZEFwcGVuZE1hcmtkb3duKGNvbnRlbnRJbnB1dCk7XG4gICAgICBhd2FpdCBkZXBzLmFwcC52YXVsdC5tb2RpZnkodGFyZ2V0LCBgJHtjdXJyZW50LnJlcGxhY2UoL1xccyokLywgJycpfVxcblxcbiR7YXBwZW5kaXh9XFxuYCk7XG4gICAgICBkZXBzLm5vdGljZShgXHVEODNEXHVEQ0REIFx1NURGMlx1ODg2NVx1NTE0NVx1NTIzMCAke2FwcGVuZFBhdGh9YCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgcGF0aDogdGFyZ2V0LnBhdGgsXG4gICAgICAgIGZpbGVuYW1lOiB0YXJnZXQubmFtZSxcbiAgICAgICAgYWN0aW9uOiAndXBkYXRlZCcsXG4gICAgICB9O1xuICAgIH1cblxuICAgIGF3YWl0IGVuc3VyZUZvbGRlcihkZXBzLmFwcCwgdGFyZ2V0RGlyKTtcblxuICAgIGNvbnN0IGZpbGVuYW1lID0gbWFrZUZpbGVuYW1lKHRpdGxlKTtcbiAgICBsZXQgZmluYWxQYXRoID0gbWFrZVBhdGgodGFyZ2V0RGlyLCBmaWxlbmFtZSk7XG4gICAgY29uc3QgZXhpc3RpbmcgPSBkZXBzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZmluYWxQYXRoKTtcbiAgICBpZiAoZXhpc3RpbmcgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgZmluYWxQYXRoID0gbWFrZVBhdGgodGFyZ2V0RGlyLCBgJHtmaWxlbmFtZS5yZXBsYWNlKC9cXC5tZCQvLCAnJyl9LSR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9Lm1kYCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudCA9IGJ1aWxkQ2xpcE1hcmtkb3duKGNvbnRlbnRJbnB1dCk7XG5cbiAgICBhd2FpdCBkZXBzLmFwcC52YXVsdC5jcmVhdGUoZmluYWxQYXRoLCBjb250ZW50KTtcbiAgICBkZXBzLm5vdGljZShgXHVEODNEXHVEQ0NFIFx1NURGMlx1NTI2QVx1NUI1OCAke3RpdGxlfWApO1xuXG4gICAgaWYgKGRlcHMuc2V0dGluZ3MuYXV0b1JlbmFtZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgYXNzaWduRW5jb2RpbmcoZGVwcy5hcHAsIGZpbmFsUGF0aCwgdGFyZ2V0RGlyKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2NsaXBdIGF1dG8tcmVuYW1lIGZhaWxlZDonLCBlcnIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBvazogdHJ1ZSxcbiAgICAgIHBhdGg6IGZpbmFsUGF0aCxcbiAgICAgIGZpbGVuYW1lOiBmaW5hbFBhdGguc3BsaXQoJy8nKS5wb3AoKSA/PyBmaWxlbmFtZSxcbiAgICAgIGFjdGlvbjogJ2NyZWF0ZWQnLFxuICAgIH07XG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQ2xpcE1hcmtkb3duKGlucHV0OiB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIHJhd1RleHQ6IHN0cmluZztcbiAgYm9keU1hcmtkb3duOiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIGRpcjogc3RyaW5nO1xuICBtZXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgc291cmNlS2luZDogc3RyaW5nO1xuICBkYXRlOiBzdHJpbmc7XG4gIGNyZWF0ZWRBdDogc3RyaW5nO1xufSk6IHN0cmluZyB7XG4gIGNvbnN0IGJvZHlDb250ZW50ID0gbm9ybWFsaXplTWFya2Rvd25Cb2R5KGlucHV0LmJvZHlNYXJrZG93biB8fCBpbnB1dC5yYXdUZXh0IHx8IGlucHV0LnRleHQgfHwgaW5wdXQuZGVzY3JpcHRpb24pO1xuICBjb25zdCBib2R5ID0gW1xuICAgIGAjICR7aW5wdXQudGl0bGV9YCxcbiAgICAnJyxcbiAgICBpbnB1dC51cmwgPyBgPiBcdTY3NjVcdTZFOTBcdUZGMUEke2lucHV0LnVybH1gIDogJycsXG4gICAgYD4gXHU3QzdCXHU1NzhCXHVGRjFBJHtpbnB1dC5zb3VyY2VLaW5kfWAsXG4gICAgYD4gXHU1MjZBXHU1QjU4XHU2NUY2XHU5NUY0XHVGRjFBJHtpbnB1dC5jcmVhdGVkQXR9YCxcbiAgICAnJyxcbiAgICBib2R5Q29udGVudCxcbiAgICAnJyxcbiAgXS5maWx0ZXIoKGxpbmUsIGluZGV4LCBhcnIpID0+IGxpbmUgfHwgYXJyW2luZGV4IC0gMV0gIT09ICcnKS5qb2luKCdcXG4nKTtcblxuICByZXR1cm4gYXNzZW1ibGVGaWxlKGlucHV0Lm1ldGEsIGJvZHkpO1xufVxuXG5mdW5jdGlvbiBidWlsZEFwcGVuZE1hcmtkb3duKGlucHV0OiB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIHJhd1RleHQ6IHN0cmluZztcbiAgYm9keU1hcmtkb3duOiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIHNvdXJjZUtpbmQ6IHN0cmluZztcbiAgY3JlYXRlZEF0OiBzdHJpbmc7XG59KTogc3RyaW5nIHtcbiAgY29uc3QgYm9keUNvbnRlbnQgPSBub3JtYWxpemVNYXJrZG93bkJvZHkoaW5wdXQuYm9keU1hcmtkb3duIHx8IGlucHV0LnJhd1RleHQgfHwgaW5wdXQudGV4dCB8fCBpbnB1dC5kZXNjcmlwdGlvbik7XG4gIHJldHVybiBbXG4gICAgYCMjICR7aW5wdXQudGl0bGV9YCxcbiAgICAnJyxcbiAgICBpbnB1dC51cmwgPyBgPiBcdTY3NjVcdTZFOTBcdUZGMUEke2lucHV0LnVybH1gIDogJycsXG4gICAgYD4gXHU3QzdCXHU1NzhCXHVGRjFBJHtpbnB1dC5zb3VyY2VLaW5kfWAsXG4gICAgYD4gXHU4ODY1XHU1MTQ1XHU2NUY2XHU5NUY0XHVGRjFBJHtpbnB1dC5jcmVhdGVkQXR9YCxcbiAgICAnJyxcbiAgICBib2R5Q29udGVudCxcbiAgXS5maWx0ZXIoKGxpbmUsIGluZGV4LCBhcnIpID0+IGxpbmUgfHwgYXJyW2luZGV4IC0gMV0gIT09ICcnKS5qb2luKCdcXG4nKTtcbn1cblxuZnVuY3Rpb24gY2xlYW5UZXh0KHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZS50cmltKCkgOiAnJztcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF0ZShkYXRlOiBEYXRlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGRhdGUudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCk7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUNsaXBNZXRhKG1ldGE6IHVua25vd24sIGZhbGxiYWNrOiB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIGRpcjogc3RyaW5nO1xuICBkYXRlOiBzdHJpbmc7XG59KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICBjb25zdCBpbnB1dCA9IG1ldGEgJiYgdHlwZW9mIG1ldGEgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KG1ldGEpID8gbWV0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA6IHt9O1xuICBjb25zdCBzY29yZSA9IG5vcm1hbGl6ZVNjb3JlKGlucHV0Llx1OEJDNFx1NTIwNik7XG4gIGNvbnN0IG91dDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7XG4gICAgXHU2ODA3XHU3QjdFOiBub3JtYWxpemVUYWcoaW5wdXQuXHU2ODA3XHU3QjdFKSxcbiAgICBcdTdGMTZcdTc4MDE6ICcnLFxuICAgIFx1OEY5M1x1NTE2NTogY2xlYW5UZXh0KGlucHV0Llx1OEY5M1x1NTE2NSkgfHwgZmFsbGJhY2suZGlyIHx8IGZhbGxiYWNrLnVybCxcbiAgICBcdTY1RTVcdTY3MUY6IG5vcm1hbGl6ZURhdGUoaW5wdXQuXHU2NUU1XHU2NzFGLCBmYWxsYmFjay5kYXRlKSxcbiAgICBcdTY1RTVcdTY3MUZcdTdEMjJcdTVGMTU6IG5vcm1hbGl6ZUxpc3QoaW5wdXQuXHU2NUU1XHU2NzFGXHU3RDIyXHU1RjE1KSxcbiAgICBcdTUxNzNcdTk1MkVcdThCQ0Q6IGNsZWFuVGV4dChpbnB1dC5cdTUxNzNcdTk1MkVcdThCQ0QpIHx8IGRyYWZ0S2V5d29yZHMoYCR7ZmFsbGJhY2sudGl0bGV9ICR7ZmFsbGJhY2suZGVzY3JpcHRpb259ICR7ZmFsbGJhY2sudGV4dH1gKSxcbiAgICBcdTY5ODJcdThGRjA6IGNsZWFuVGV4dChpbnB1dC5cdTY5ODJcdThGRjApIHx8IGZhbGxiYWNrLmRlc2NyaXB0aW9uIHx8IGBcdTRFQ0VcdTdGNTFcdTk4NzVcdTUyNkFcdTVCNThcdTVFNzZcdThGNkNcdTYzNjJcdUZGMUEke2ZhbGxiYWNrLnRpdGxlfWAsXG4gICAgXHU4QkM0XHU1MjA2OiBzY29yZSxcbiAgICBcdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBOiBjbGVhblRleHQoaW5wdXQuXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQSkgfHwgc2NvcmVMYWJlbChzY29yZSksXG4gICAgXHU3RDIyXHU1RjE1X1x1NzdFNVx1OEJDNlx1NUU5MzogY2xlYW5UZXh0KGlucHV0Llx1N0QyMlx1NUYxNV9cdTc3RTVcdThCQzZcdTVFOTMpLFxuICAgIFx1N0QyMlx1NUYxNV9cdTk4OUNcdTgyNzI6IGNsZWFuVGV4dChpbnB1dC5cdTdEMjJcdTVGMTVfXHU5ODlDXHU4MjcyKSxcbiAgICAnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnOiBub3JtYWxpemVMaXN0KGlucHV0WydcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OCddKSxcbiAgICBcdTdEMjJcdTVGMTVfXHU1NzU3OiBub3JtYWxpemVMaXN0KGlucHV0Llx1N0QyMlx1NUYxNV9cdTU3NTcpLFxuICAgIFx1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2Njk6IG5vcm1hbGl6ZUxpc3QoaW5wdXQuXHU3RDIyXHU1RjE1X1x1OThDRVx1OTY2OSksXG4gIH07XG4gIGlmICghb3V0Llx1NTE3M1x1OTUyRVx1OEJDRCkgb3V0Llx1NTE3M1x1OTUyRVx1OEJDRCA9ICdcdTdGNTFcdTk4NzVcdTUyNkFcdTVCNTgnO1xuICBpZiAoIW91dC5cdTY5ODJcdThGRjApIG91dC5cdTY5ODJcdThGRjAgPSBgXHU3RjUxXHU5ODc1XHU1MjZBXHU1QjU4XHVGRjFBJHtmYWxsYmFjay50aXRsZX1gO1xuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVUYWcodmFsdWU6IHVua25vd24pOiBzdHJpbmcge1xuICBjb25zdCByYXcgPSBjbGVhblRleHQodmFsdWUpO1xuICByZXR1cm4gcmF3Lm1hdGNoKC9eW1NYTFpRSl0kLykgPyByYXcgOiByYXcubWF0Y2goLyhbU1hMWlFKXSkoPzpffCQpLyk/LlsxXSB8fCAnUyc7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZURhdGUodmFsdWU6IHVua25vd24sIGZhbGxiYWNrOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCByYXcgPSBjbGVhblRleHQodmFsdWUpLnJlcGxhY2UoL1xcLy9nLCAnLScpO1xuICByZXR1cm4gL15cXGR7NH0tXFxkezJ9LVxcZHsyfSQvLnRlc3QocmF3KSA/IHJhdyA6IGZhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVTY29yZSh2YWx1ZTogdW5rbm93bik6IG51bWJlciB7XG4gIGNvbnN0IHJhdyA9IGNsZWFuVGV4dCh2YWx1ZSk7XG4gIGNvbnN0IGV4cGxpY2l0ID0gcmF3Lm1hdGNoKC9bMS01XS8pPy5bMF07XG4gIGlmIChleHBsaWNpdCkgcmV0dXJuIE51bWJlcihleHBsaWNpdCk7XG4gIGNvbnN0IHN0YXJzID0gQXJyYXkuZnJvbShyYXcubWF0Y2hBbGwoL1x1RDgzQ1x1REYxRi9nKSkubGVuZ3RoO1xuICByZXR1cm4gc3RhcnMgPiAwID8gTWF0aC5taW4oc3RhcnMsIDUpIDogMTtcbn1cblxuZnVuY3Rpb24gc2NvcmVMYWJlbChzY29yZTogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIFsnXHVEODNDXHVERjFGXHUwMEI3XHU3RDIwXHU2NzUwJywgJ1x1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1MDBCN1x1NjU3NFx1NzQwNicsICdcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdTAwQjdcdTVCOUVcdThERjUnLCAnXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHUwMEI3XHU5MDFBXHU3NTI4JywgJ1x1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1MDBCN1x1NEY1M1x1N0NGQiddW01hdGgubWF4KDEsIE1hdGgubWluKHNjb3JlLCA1KSkgLSAxXTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplTGlzdCh2YWx1ZTogdW5rbm93bik6IHN0cmluZ1tdIHtcbiAgY29uc3Qgc291cmNlID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IGNsZWFuVGV4dCh2YWx1ZSkuc3BsaXQoL1tcXG4sXHVGRjBDXHUzMDAxXS8pO1xuICByZXR1cm4gc291cmNlLm1hcCgoaXRlbSkgPT4gY2xlYW5UZXh0KGl0ZW0pKS5maWx0ZXIoQm9vbGVhbik7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZU1hcmtkb3duQm9keSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgdGV4dCA9IHZhbHVlLnRyaW0oKTtcbiAgaWYgKCF0ZXh0KSByZXR1cm4gJ1x1RkYwOFx1NjVFMFx1NTNFRlx1ODlDMVx1NkI2M1x1NjU4N1x1RkYwQ1x1NURGMlx1NEZERFx1NUI1OFx1OTg3NVx1OTc2Mlx1NjgwN1x1OTg5OFx1NTQ4Q1x1Njc2NVx1NkU5MFx1MzAwMlx1RkYwOSc7XG4gIHJldHVybiB0ZXh0O1xufVxuXG5mdW5jdGlvbiBkcmFmdEtleXdvcmRzKHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHdvcmRzID0gQXJyYXkuZnJvbShuZXcgU2V0KFxuICAgIHRleHRcbiAgICAgIC5yZXBsYWNlKC9bXlxccHtTY3JpcHQ9SGFufVxccHtMZXR0ZXJ9XFxwe051bWJlcn1cXHNfLV0vZ3UsICcgJylcbiAgICAgIC5zcGxpdCgvXFxzKy8pXG4gICAgICAubWFwKCh3b3JkKSA9PiB3b3JkLnRyaW0oKSlcbiAgICAgIC5maWx0ZXIoKHdvcmQpID0+IHdvcmQubGVuZ3RoID49IDIgJiYgd29yZC5sZW5ndGggPD0gMjApLFxuICApKTtcbiAgcmV0dXJuIHdvcmRzLnNsaWNlKDAsIDYpLmpvaW4oJ1x1MzAwMScpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBlbnN1cmVGb2xkZXIoYXBwOiBBcHAsIGRpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmICghZGlyIHx8IGRpciA9PT0gJy4nIHx8IGRpciA9PT0gJy8nKSByZXR1cm47XG4gIGNvbnN0IGV4aXN0aW5nID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChkaXIpO1xuICBpZiAoZXhpc3RpbmcgaW5zdGFuY2VvZiBURm9sZGVyKSByZXR1cm47XG4gIGNvbnN0IHBhcmVudCA9IGRpci5zcGxpdCgnLycpLnNsaWNlKDAsIC0xKS5qb2luKCcvJyk7XG4gIGlmIChwYXJlbnQpIGF3YWl0IGVuc3VyZUZvbGRlcihhcHAsIHBhcmVudCk7XG4gIHRyeSB7XG4gICAgYXdhaXQgYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihkaXIpO1xuICB9IGNhdGNoIHtcbiAgICAvLyBcdTVERjJcdTVCNThcdTU3MjhcdTYyMTZcdTc1MzFcdTUxNzZcdTRFRDZcdTZENDFcdTdBMEJcdTUyMUFcdTUyMUJcdTVFRkFcdTY1RjZcdTVGRkRcdTc1NjVcdTMwMDJcbiAgfVxufVxuIiwgIi8qKlxuICogUE9TVCAvZXhpc3RzIFx1MjAxNCBcdTY4QzBcdTY3RTUgbm9kZV90b2tlbiBcdTY2MkZcdTU0MjZcdTVERjJcdTU0MENcdTZCNjVcdThGQzdcdTMwMDJcbiAqL1xuaW1wb3J0IHR5cGUgeyBFeGlzdHNSZXF1ZXN0LCBFeGlzdHNSZXNwb25zZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQgdHlwZSB7IEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuaW1wb3J0IHsgZmluZFVuaXF1ZVZhdWx0QmluZGluZyB9IGZyb20gJy4uL3ZhdWx0QmluZGluZy5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFeGlzdHNIYW5kbGVyKGFwcDogQXBwKSB7XG4gIHJldHVybiBhc3luYyAoY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8RXhpc3RzUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCByZXEgPSBjdHguYm9keSBhcyBFeGlzdHNSZXF1ZXN0O1xuICAgIGlmICghcmVxPy5ub2RlX3Rva2VuKSB7XG4gICAgICBjb25zdCBlID0gbmV3IEVycm9yKCdub2RlX3Rva2VuIGlzIHJlcXVpcmVkJykgYXMgRXJyb3IgJiB7IGNvZGU6IHN0cmluZzsgc3RhdHVzOiBudW1iZXIgfTtcbiAgICAgIGUuY29kZSA9ICdNSVNTSU5HX1RPS0VOJztcbiAgICAgIGUuc3RhdHVzID0gNDAwO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlID0gYXdhaXQgZmluZFVuaXF1ZVZhdWx0QmluZGluZyhhcHAsIHJlcS5ub2RlX3Rva2VuKTtcbiAgICByZXR1cm4ge1xuICAgICAgb2s6IHRydWUsXG4gICAgICBleGlzdHM6ICEhZmlsZSxcbiAgICAgIHBhdGg6IGZpbGU/LnBhdGgsXG4gICAgfTtcbiAgfTtcbn1cbiIsICIvKipcbiAqIFBPU1QgL3B1c2hiYWNrIFx1MjAxNCBPQlx1MjE5Mlx1OThERVx1NEU2Nlx1NTZERVx1NTE5OVx1MzAwMlxuICpcbiAqIFx1NEY5RFx1NjM2RSBgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTc2LjJcdUZGMUFcbiAqIDEuIFx1OEJGQiAubWQgXHU3Njg0IFlBTUxcdUZGMENcdTYyRkYgZmVpc2h1X2RvY19pZCArIHN5bmNfaGFzaFxuICogMi4gXHU4QkExXHU3Qjk3XHU1RjUzXHU1MjREXHU1MTg1XHU1QkI5IGhhc2hcdUZGMENcdTZCRDRcdTVCRjkgc3luY19oYXNoXG4gKiAgICBcdTI1MUMgXHU0RTAwXHU4MUY0IFx1MjE5MiBcdThERjNcdThGQzdcdUZGMDhcdTY1RTBcdTUzRDhcdTUzMTZcdUZGMDlcbiAqICAgIFx1MjUxNCBcdTRFMERcdTRFMDBcdTgxRjQgXHUyMTkyIFx1N0VFN1x1N0VFRFxuICogMy4gXHU4OUUzXHU2NzkwXHU2QjYzXHU2NTg3IG1kICsgWUFNTFxuICogNC4gWUFNTCBcdTVCNTdcdTZCQjUgXHUyMTkyIGNhbGxvdXQgWE1MIFx1NzI0N1x1NkJCNVx1RkYwOFx1NjU4N1x1Njg2M1x1NTkzNFx1RkYwOVxuICogNS4gXHU1NkZFXHU3MjQ3IGZlaXNodTovL3Rva2VuIFx1MjE5MiBcdTk4REVcdTRFNjYgPGltZyBzcmM9XCJUT0tFTlwiLz5cbiAqIDYuIFx1N0VDNFx1ODhDNVx1NjcwMFx1N0VDOFx1NTE4NVx1NUJCOSA9IFtjYWxsb3V0IFhNTF0gKyBbXHU2QjYzXHU2NTg3IG1kXVxuICogNy4gXHU4QzAzIGxhcmstY2xpIGRvY3MgK3VwZGF0ZSBvdmVyd3JpdGVcdUZGMDhYTUwgXHU2ODNDXHU1RjBGXHVGRjA5XG4gKiA4LiBcdTY4MDdcdTk4OThcdTU0MENcdTZCNjVcdUZGMDhcdTVERjJcdTU3Mjggb3ZlcndyaXRlIFx1NjVGNlx1NEZFRVx1NTkwRFx1RkYwOVxuICogOS4gXHU2NkY0XHU2NUIwIHN5bmNfaGFzaCArIHN5bmNfdGltZVxuICovXG5pbXBvcnQgdHlwZSB7IFB1c2hiYWNrUmVxdWVzdCwgUHVzaGJhY2tSZXNwb25zZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQge1xuICBtZXRhVG9DYWxsb3V0WG1sLFxuICBmZWlzaHVQcm90b1RvWG1sLFxuICBjb252ZXJ0T0JDYWxsb3V0c1RvRmVpc2h1LFxuICB0eXBlIFlBTUxGcm9udG1hdHRlcixcbn0gZnJvbSAnQHN5bmMvc2hhcmVkJztcbmltcG9ydCB7IFRGaWxlLCB0eXBlIEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEh0dHBFcnJvciwgdHlwZSBSZXF1ZXN0Q29udGV4dCB9IGZyb20gJy4uL3NlcnZlci5qcyc7XG5pbXBvcnQgdHlwZSB7IEZlaXNodVN5bmNTZXR0aW5ncyB9IGZyb20gJy4uL3NldHRpbmdzLmpzJztcbmltcG9ydCB7IG92ZXJ3cml0ZURvY1htbCwgZ2V0V2lraU5vZGVJbmZvIH0gZnJvbSAnLi4vbGFyay9jbGkuanMnO1xuaW1wb3J0IHsgcGFyc2VGaWxlLCBhc3NlbWJsZU1kIH0gZnJvbSAnLi4vZmlsZWlvL3dyaXRlci5qcyc7XG5pbXBvcnQgeyBmaW5kVW5pcXVlVmF1bHRCaW5kaW5nIH0gZnJvbSAnLi4vdmF1bHRCaW5kaW5nLmpzJztcbmltcG9ydCB7IG5vcm1hbGl6ZVZhdWx0TWFya2Rvd25QYXRoIH0gZnJvbSAnLi4vdmF1bHRQYXRoLmpzJztcbmltcG9ydCB7IGZldGNoUmVtb3RlRG9jdW1lbnQgfSBmcm9tICcuLi9yZW1vdGVEb2N1bWVudC5qcyc7XG5pbXBvcnQgeyBkZWNpZGVUaHJlZVdheVN5bmMsIHBsYW5TeW5jRXhlY3V0aW9uIH0gZnJvbSAnLi4vc3luY0RlY2lzaW9uLmpzJztcbmltcG9ydCB7IGNyZWF0ZVJlY292ZXJ5U25hcHNob3QgfSBmcm9tICcuLi9yZWNvdmVyeS5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHVzaGJhY2tEZXBzIHtcbiAgYXBwOiBBcHA7XG4gIHNldHRpbmdzOiBGZWlzaHVTeW5jU2V0dGluZ3M7XG4gIG5vdGljZTogKG1zZzogc3RyaW5nKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHVzaGJhY2tIYW5kbGVyKGRlcHM6IFB1c2hiYWNrRGVwcykge1xuICByZXR1cm4gYXN5bmMgKGN0eDogUmVxdWVzdENvbnRleHQpOiBQcm9taXNlPFB1c2hiYWNrUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCByZXEgPSBjdHguYm9keSBhcyBQdXNoYmFja1JlcXVlc3Q7XG5cbiAgICAvLyBcdTVCOUFcdTRGNERcdTY1ODdcdTRFRjZcbiAgICBsZXQgZmlsZTogVEZpbGUgfCBudWxsID0gbnVsbDtcbiAgICBpZiAocmVxLnBhdGgpIHtcbiAgICAgIGNvbnN0IGYgPSBkZXBzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgobm9ybWFsaXplVmF1bHRNYXJrZG93blBhdGgocmVxLnBhdGgpKTtcbiAgICAgIGlmIChmIGluc3RhbmNlb2YgVEZpbGUpIGZpbGUgPSBmO1xuICAgIH0gZWxzZSBpZiAocmVxLm5vZGVfdG9rZW4pIHtcbiAgICAgIGZpbGUgPSBhd2FpdCBmaW5kVW5pcXVlVmF1bHRCaW5kaW5nKGRlcHMuYXBwLCByZXEubm9kZV90b2tlbik7XG4gICAgfVxuXG4gICAgaWYgKCFmaWxlKSB7XG4gICAgICBjb25zdCBlID0gbmV3IEVycm9yKCdGaWxlIG5vdCBmb3VuZCcpIGFzIEVycm9yICYgeyBjb2RlOiBzdHJpbmc7IHN0YXR1czogbnVtYmVyIH07XG4gICAgICBlLmNvZGUgPSAnTk9UX0ZPVU5EJztcbiAgICAgIGUuc3RhdHVzID0gNDA0O1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgZGVwcy5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUZpbGUoY29udGVudCk7XG5cbiAgICBjb25zdCBmZWlzaHVEb2NJZCA9IHBhcnNlZC5mcm9udG1hdHRlci5mZWlzaHVfZG9jX2lkIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBmZWlzaHVJZCA9IHBhcnNlZC5mcm9udG1hdHRlci5mZWlzaHVfaWQgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGZlaXNodVRpdGxlID0gcGFyc2VkLmZyb250bWF0dGVyLmZlaXNodV90aXRsZSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAvLyBcdTg5RTNcdTY3OTBcdTU2REVcdTUxOTlcdTc1MjhcdTc2ODQgZG9jVG9rZW5cdUZGMDhcdTVGQzVcdTk4N0JcdTY2MkYgZG9jeCBvYmpfdG9rZW5cdUZGMENub2RlX3Rva2VuIFx1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NzUyOFx1NEU4RSBkb2NzICt1cGRhdGVcdUZGMDlcbiAgICBsZXQgZG9jVG9rZW4gPSBmZWlzaHVEb2NJZDtcbiAgICBpZiAoIWRvY1Rva2VuICYmIGZlaXNodUlkKSB7XG4gICAgICAvLyBmZWlzaHVfZG9jX2lkIFx1N0YzQVx1NTkzMVx1RkYxQVx1NzUyOCB3aWtpICtub2RlLWdldCBcdTYyOEEgbm9kZV90b2tlbiBcdTg5RTNcdTY3OTBcdTYyMTAgb2JqX3Rva2VuXG4gICAgICBkZXBzLm5vdGljZSgnXHVEODNEXHVERDE3IFx1ODlFM1x1Njc5MFx1NjU4N1x1Njg2MyB0b2tlbi4uLicpO1xuICAgICAgY29uc3QgaW5mbyA9IGdldFdpa2lOb2RlSW5mbyhmZWlzaHVJZCwgZGVwcy5zZXR0aW5ncy5zcGFjZUlkKTtcbiAgICAgIGRvY1Rva2VuID0gaW5mbz8ub2JqX3Rva2VuO1xuICAgICAgaWYgKCFkb2NUb2tlbikge1xuICAgICAgICBjb25zdCBlID0gbmV3IEVycm9yKGBcdTY1RTBcdTZDRDVcdTg5RTNcdTY3OTAgb2JqX3Rva2VuXHVGRjA4bm9kZV90b2tlbj0ke2ZlaXNodUlkLnNsaWNlKDAsIDgpfS4uLlx1RkYwQ1x1NjhDMFx1NjdFNSBzcGFjZV9pZCBcdThCQkVcdTdGNkVcdUZGMDlgKSBhcyBFcnJvciAmIHsgY29kZTogc3RyaW5nOyBzdGF0dXM6IG51bWJlciB9O1xuICAgICAgICBlLmNvZGUgPSAnVE9LRU5fUkVTT0xWRV9GQUlMRUQnO1xuICAgICAgICBlLnN0YXR1cyA9IDQwMDtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICAgIC8vIFx1NTZERVx1NTE5OSBmZWlzaHVfZG9jX2lkIFx1OEZEQiBmcm9udG1hdHRlclx1RkYwOFx1NEUwQlx1NkIyMVx1NEUwRFx1NzUyOFx1NTE4RFx1ODlFM1x1Njc5MFx1RkYwOVxuICAgICAgcGFyc2VkLmZyb250bWF0dGVyLmZlaXNodV9kb2NfaWQgPSBkb2NUb2tlbjtcbiAgICB9XG4gICAgaWYgKCFkb2NUb2tlbikge1xuICAgICAgY29uc3QgZSA9IG5ldyBFcnJvcignTm8gZmVpc2h1IGJpbmRpbmcgaW4gZnJvbnRtYXR0ZXInKSBhcyBFcnJvciAmIHsgY29kZTogc3RyaW5nOyBzdGF0dXM6IG51bWJlciB9O1xuICAgICAgZS5jb2RlID0gJ05PX0JJTkRJTkcnO1xuICAgICAgZS5zdGF0dXMgPSA0MDA7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgICBjb25zdCB0aXRsZSA9IGZlaXNodVRpdGxlIHx8IGZpbGUuYmFzZW5hbWU7XG4gICAgY29uc3QgcmVtb3RlID0gZmV0Y2hSZW1vdGVEb2N1bWVudCh7XG4gICAgICBub2RlVG9rZW46IGZlaXNodUlkIHx8IGRvY1Rva2VuLFxuICAgICAgb2JqVG9rZW46IGRvY1Rva2VuLFxuICAgICAgc3BhY2VJZDogZGVwcy5zZXR0aW5ncy5zcGFjZUlkLFxuICAgIH0pO1xuICAgIGNvbnN0IGRlY2lzaW9uID0gZGVjaWRlVGhyZWVXYXlTeW5jKHtcbiAgICAgIGJhc2VIYXNoOiBwYXJzZWQuZnJvbnRtYXR0ZXIuc3luY19oYXNoIGFzIHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICAgIGxvY2FsSGFzaDogcGFyc2VkLmhhc2gsXG4gICAgICByZW1vdGVIYXNoOiByZW1vdGUuaGFzaCxcbiAgICB9KTtcbiAgICBjb25zdCBleGVjdXRpb24gPSBwbGFuU3luY0V4ZWN1dGlvbigncHVzaCcsIGRlY2lzaW9uKTtcbiAgICBpZiAoZXhlY3V0aW9uID09PSAnc2tpcCcpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9rOiB0cnVlLFxuICAgICAgICBhY3Rpb246ICdza2lwcGVkJyxcbiAgICAgICAgaGFzaDogcGFyc2VkLmhhc2gsXG4gICAgICAgIHRpdGxlLFxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKGV4ZWN1dGlvbiA9PT0gJ2FkdmFuY2UnKSB7XG4gICAgICBhd2FpdCBhZHZhbmNlTG9jYWxCYXNlbGluZShkZXBzLCBmaWxlLCBjb250ZW50LCBwYXJzZWQsIHRpdGxlKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9rOiB0cnVlLFxuICAgICAgICBhY3Rpb246ICdza2lwcGVkJyxcbiAgICAgICAgaGFzaDogcGFyc2VkLmhhc2gsXG4gICAgICAgIHRpdGxlLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBkZXBzLm5vdGljZShgXHUyQjA2IFx1NTZERVx1NTE5OVx1OThERVx1NEU2NiAke2ZpbGUubmFtZX0uLi5gKTtcblxuICAgIC8vIFx1NkI2NVx1OUFBNCAzLTZcdUZGMUFcdTdFQzRcdTg4QzVcdTY3MDBcdTdFQzggWE1MIFx1NTE4NVx1NUJCOVxuICAgIGNvbnN0IGZpbmFsQ29udGVudCA9IGJ1aWxkUHVzaGJhY2tDb250ZW50KHBhcnNlZCk7XG5cbiAgICAvLyBcdTZCNjVcdTlBQTQgNy04XHVGRjFBXHU1MTQ4XHU0RkREXHU3NTU5XHU4RkRDXHU3QUVGXHU2MDYyXHU1OTBEXHU1MjZGXHU2NzJDXHVGRjBDXHU1MThEIG92ZXJ3cml0ZSArIFx1NjgwN1x1OTg5OFx1NEZFRVx1NTkwRFxuICAgIGNvbnN0IHJlY292ZXJ5UGF0aCA9IGF3YWl0IGNyZWF0ZVJlY292ZXJ5U25hcHNob3QoZGVwcy5hcHAudmF1bHQuYWRhcHRlciwge1xuICAgICAgb3JpZ2luYWxQYXRoOiBmaWxlLnBhdGgsXG4gICAgICBjb250ZW50OiByZW1vdGUucmF3TWFya2Rvd24sXG4gICAgICBzb3VyY2U6ICdyZW1vdGUnLFxuICAgIH0pO1xuICAgIHRyeSB7XG4gICAgICBvdmVyd3JpdGVEb2NYbWwoZG9jVG9rZW4sIGZpbmFsQ29udGVudCwgdGl0bGUpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgSHR0cEVycm9yKFxuICAgICAgICAnUkVNT1RFX1dSSVRFX1VOS05PV04nLFxuICAgICAgICBgXHU4RkRDXHU3QUVGXHU1NkRFXHU1MTk5XHU3RUQzXHU2NzlDXHU2NUUwXHU2Q0Q1XHU3ODZFXHU4QkE0XHVGRjBDXHU4QkY3XHU1MTQ4XHU2OEMwXHU2N0U1XHU5OERFXHU0RTY2XHU1MThEXHU5MUNEXHU4QkQ1XHVGRjFCXHU2MDYyXHU1OTBEXHU1MjZGXHU2NzJDXHVGRjFBJHtyZWNvdmVyeVBhdGh9XHVGRjFCJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCxcbiAgICAgICAgNTAyLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBcdTZCNjVcdTlBQTQgOVx1RkYxQVx1NjZGNFx1NjVCMCBzeW5jX2hhc2ggKyBzeW5jX3RpbWVcbiAgICBjb25zdCBzeW5jVGltZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICBjb25zdCB1cGRhdGVkRm0gPSB7XG4gICAgICAuLi5wYXJzZWQuZnJvbnRtYXR0ZXIsXG4gICAgICBzeW5jX2hhc2g6IHBhcnNlZC5oYXNoLFxuICAgICAgc3luY190aW1lOiBzeW5jVGltZSxcbiAgICB9O1xuICAgIGNvbnN0IG5ld0NvbnRlbnQgPSBhc3NlbWJsZU1kKHVwZGF0ZWRGbSBhcyBuZXZlciwgcGFyc2VkLmJvZHkpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBkZXBzLmFwcC52YXVsdC5tb2RpZnkoZmlsZSwgbmV3Q29udGVudCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBIdHRwRXJyb3IoXG4gICAgICAgICdSRU1PVEVfV1JJVEVfUkVQQUlSX1JFUVVJUkVEJyxcbiAgICAgICAgYFx1OEZEQ1x1N0FFRlx1NURGMlx1NTZERVx1NTE5OVx1RkYwQ1x1NEY0Nlx1NjcyQ1x1NTczMFx1NTdGQVx1N0VCRlx1NjZGNFx1NjVCMFx1NTkzMVx1OEQyNVx1RkYxQlx1NjA2Mlx1NTkwRFx1NTI2Rlx1NjcyQ1x1RkYxQSR7cmVjb3ZlcnlQYXRofVx1RkYxQiR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWAsXG4gICAgICAgIDUwMCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZGVwcy5ub3RpY2UoYFx1MjcwNSBcdTVERjJcdTU2REVcdTUxOTkgJHt0aXRsZX1gKTtcblxuICAgIHJldHVybiB7XG4gICAgICBvazogdHJ1ZSxcbiAgICAgIGFjdGlvbjogJ3B1c2hlZCcsXG4gICAgICBoYXNoOiBwYXJzZWQuaGFzaCxcbiAgICAgIHRpdGxlLFxuICAgIH07XG4gIH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFkdmFuY2VMb2NhbEJhc2VsaW5lKFxuICBkZXBzOiBQdXNoYmFja0RlcHMsXG4gIGZpbGU6IFRGaWxlLFxuICBleGlzdGluZ0NvbnRlbnQ6IHN0cmluZyxcbiAgcGFyc2VkOiBSZXR1cm5UeXBlPHR5cGVvZiBwYXJzZUZpbGU+LFxuICB0aXRsZTogc3RyaW5nLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGF3YWl0IGNyZWF0ZVJlY292ZXJ5U25hcHNob3QoZGVwcy5hcHAudmF1bHQuYWRhcHRlciwge1xuICAgIG9yaWdpbmFsUGF0aDogZmlsZS5wYXRoLFxuICAgIGNvbnRlbnQ6IGV4aXN0aW5nQ29udGVudCxcbiAgICBzb3VyY2U6ICdsb2NhbCcsXG4gIH0pO1xuICBjb25zdCB1cGRhdGVkID0gYXNzZW1ibGVNZCh7XG4gICAgLi4ucGFyc2VkLmZyb250bWF0dGVyLFxuICAgIHN5bmNfaGFzaDogcGFyc2VkLmhhc2gsXG4gICAgc3luY190aW1lOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gIH0gYXMgWUFNTEZyb250bWF0dGVyLCBwYXJzZWQuYm9keSk7XG4gIGF3YWl0IGRlcHMuYXBwLnZhdWx0Lm1vZGlmeShmaWxlLCB1cGRhdGVkKTtcbiAgZGVwcy5ub3RpY2UoYFx1MjcwNSBcdTVERjJcdTc4NkVcdThCQTRcdTUzQ0NcdTdBRUZcdTUxODVcdTVCQjlcdTRFMDBcdTgxRjRcdUZGMUEke3RpdGxlfWApO1xufVxuXG4vKipcbiAqIFx1N0VDNFx1ODhDNVx1NTZERVx1NTE5OVx1OThERVx1NEU2Nlx1NzY4NFx1NjcwMFx1N0VDOFx1NTE4NVx1NUJCOVx1RkYwOFhNTCBcdTY4M0NcdTVGMEZcdUZGMDlcdTMwMDJcbiAqID0gW1lBTUwgY2FsbG91dCBcdTRGRTFcdTYwNkZcdTU3NTddICsgW1x1NkI2M1x1NjU4N1x1RkYwOFx1NTZGRVx1NzI0N1x1OEY2QyBYTUxcdTMwMDFPQiBjYWxsb3V0IFx1OEY2QyBYTUxcdUZGMDldXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkUHVzaGJhY2tDb250ZW50KHBhcnNlZDogUmV0dXJuVHlwZTx0eXBlb2YgcGFyc2VGaWxlPik6IHN0cmluZyB7XG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8vIDEuIFlBTUwgXHU1MTQzXHU2NTcwXHU2MzZFIFx1MjE5MiBjYWxsb3V0IFx1NEZFMVx1NjA2Rlx1NTc1N1xuICBjb25zdCBjYWxsb3V0WG1sID0gbWV0YVRvQ2FsbG91dFhtbChwYXJzZWQuZnJvbnRtYXR0ZXIpO1xuICBpZiAoY2FsbG91dFhtbCkge1xuICAgIHBhcnRzLnB1c2goY2FsbG91dFhtbCk7XG4gIH1cblxuICAvLyAyLiBcdTZCNjNcdTY1ODdcdTU5MDRcdTc0MDZcbiAgbGV0IGJvZHkgPSBwYXJzZWQuYm9keTtcblxuICAvLyAyYS4gXHU1NkZFXHU3MjQ3IGZlaXNodTovL3Rva2VuIFx1MjE5MiA8aW1nIHNyYz1cIlRPS0VOXCIvPlxuICBib2R5ID0gZmVpc2h1UHJvdG9Ub1htbChib2R5KTtcblxuICAvLyAyYi4gT0IgY2FsbG91dCA+IFshdHlwZV0gXHUyMTkyIFx1OThERVx1NEU2NiBjYWxsb3V0IFhNTFxuICBib2R5ID0gY29udmVydE9CQ2FsbG91dHNUb0ZlaXNodShib2R5KTtcblxuICBwYXJ0cy5wdXNoKGJvZHkudHJpbSgpKTtcblxuICByZXR1cm4gcGFydHMuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcblxcbicpO1xufVxuIiwgIi8qKlxuICogXHU1NDdEXHU0RUU0XHU2ODBGXHU1NDdEXHU0RUU0XHUzMDAyXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzEwICsgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGBcdTMwMDJcbiAqXG4gKiAtIFx1NTZERVx1NTE5OVx1NUY1M1x1NTI0RFx1NjU4N1x1NEVGNlx1NTIzMFx1OThERVx1NEU2NlxuICogLSBcdTYyNzlcdTkxQ0ZcdTU2REVcdTUxOTlcdTVGNTNcdTUyNERcdTc2RUVcdTVGNTVcbiAqIC0gXHU1MjM3XHU2NUIwXHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0XG4gKiAtIFx1NjI3OVx1OTFDRlx1NkUwNVx1NzQwNlx1NURGMlx1NTIyMFx1OTY2NFxuICogLSBcdTY2M0VcdTc5M0EvXHU1OTBEXHU1MjM2XHU1NDJGXHU1MkE4XHU0RUU0XHU3MjRDXG4gKiAtIFx1OTFDRFx1NjVCMFx1NTJBMFx1OEY3RFx1NjNEMlx1NEVGNlx1RkYwOFx1OTFDRFx1NTQyRiBIVFRQIHNlcnZlclx1RkYwOVxuICovXG5pbXBvcnQgeyBOb3RpY2UsIE1vZGFsLCBURmlsZSwgdHlwZSBBcHAgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IEZlaXNodVN5bmNQbHVnaW4gfSBmcm9tICcuL21haW4uanMnO1xuaW1wb3J0IHsgcmVmcmVzaE1hcHBpbmcgfSBmcm9tICcuL21hcHBpbmcuanMnO1xuaW1wb3J0IHsgY3JlYXRlUHVzaGJhY2tIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9wdXNoYmFja0hhbmRsZXIuanMnO1xuaW1wb3J0IHsgYmF0Y2hBc3NpZ25FbmNvZGluZyB9IGZyb20gJy4vYXV0b1JlbmFtZS5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckNvbW1hbmRzKHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbik6IHZvaWQge1xuICBjb25zdCB7IGFwcCwgc2V0dGluZ3MgfSA9IHBsdWdpbjtcblxuICAvLyBcdTU2REVcdTUxOTlcdTVGNTNcdTUyNERcdTY1ODdcdTRFRjZcdTUyMzBcdTk4REVcdTRFNjZcbiAgcGx1Z2luLmFkZENvbW1hbmQoe1xuICAgIGlkOiAncHVzaGJhY2stY3VycmVudCcsXG4gICAgbmFtZTogJ1x1NTZERVx1NTE5OVx1NUY1M1x1NTI0RFx1NjU4N1x1NEVGNlx1NTIzMFx1OThERVx1NEU2NicsXG4gICAgZWRpdG9yQ2FsbGJhY2s6IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbGUgPSBhcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgICAgIGlmICghKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkgfHwgIWZpbGUucGF0aC5lbmRzV2l0aCgnLm1kJykpIHtcbiAgICAgICAgbmV3IE5vdGljZSgnXHUyNkEwXHVGRTBGIFx1OEJGN1x1NTcyOCBtYXJrZG93biBcdTY1ODdcdTRFRjZcdTRFMkRcdTRGN0ZcdTc1MjhcdTZCNjRcdTU0N0RcdTRFRTQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBoYW5kbGVyID0gY3JlYXRlUHVzaGJhY2tIYW5kbGVyKHtcbiAgICAgICAgYXBwLFxuICAgICAgICBzZXR0aW5ncyxcbiAgICAgICAgbm90aWNlOiAobSkgPT4gbmV3IE5vdGljZShtKSxcbiAgICAgIH0pO1xuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBwbHVnaW4uZG9jdW1lbnRDb29yZGluYXRpb25LZXkodW5kZWZpbmVkLCBmaWxlLnBhdGgpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwbHVnaW4uc3luY0Nvb3JkaW5hdG9yLnJ1bihrZXksIHVuZGVmaW5lZCwgKCkgPT4gaGFuZGxlcih7XG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgdXJsOiAnL3B1c2hiYWNrJyxcbiAgICAgICAgICBwYXRoOiAnL3B1c2hiYWNrJyxcbiAgICAgICAgICBxdWVyeTogbmV3IFVSTFNlYXJjaFBhcmFtcygpLFxuICAgICAgICAgIGJvZHk6IHsgcGF0aDogZmlsZS5wYXRoIH0sXG4gICAgICAgICAgdG9rZW46ICcnLFxuICAgICAgICB9KSk7XG4gICAgICAgIGlmIChyZXN1bHQuYWN0aW9uID09PSAncHVzaGVkJykge1xuICAgICAgICAgIG5ldyBOb3RpY2UoYFx1MjcwNSBcdTVERjJcdTU2REVcdTUxOTlcdUZGMUEke3Jlc3VsdC50aXRsZX1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXcgTm90aWNlKCdcdTIzRUQgXHU2NUUwXHU1M0Q4XHU1MzE2XHVGRjBDXHU1REYyXHU4REYzXHU4RkM3Jyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBuZXcgTm90aWNlKGBcdTI3NEMgXHU1NkRFXHU1MTk5XHU1OTMxXHU4RDI1XHVGRjFBJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycil9YCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gXHU2Mjc5XHU5MUNGXHU1NkRFXHU1MTk5XHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogJ3B1c2hiYWNrLWRpcicsXG4gICAgbmFtZTogJ1x1NjI3OVx1OTFDRlx1NTZERVx1NTE5OVx1NUY1M1x1NTI0RFx1NzZFRVx1NUY1NVx1NTIzMFx1OThERVx1NEU2NicsXG4gICAgY2FsbGJhY2s6IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbGUgPSBhcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgICAgIGlmICghZmlsZSkge1xuICAgICAgICBuZXcgTm90aWNlKCdcdTI2QTBcdUZFMEYgXHU4QkY3XHU1MTQ4XHU2MjUzXHU1RjAwXHU0RTAwXHU0RTJBXHU2NTg3XHU0RUY2XHU0RUU1XHU3ODZFXHU1QjlBXHU3NkVFXHU1RjU1Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRpciA9IGZpbGUucGFyZW50Py5wYXRoO1xuICAgICAgaWYgKCFkaXIpIHJldHVybjtcblxuICAgICAgY29uc3QgZmlsZXMgPSBhcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpLmZpbHRlcihmID0+IGYucGF0aC5zdGFydHNXaXRoKGRpciArICcvJykpO1xuICAgICAgbGV0IHB1c2hlZCA9IDA7XG4gICAgICBsZXQgc2tpcHBlZCA9IDA7XG4gICAgICBsZXQgZmFpbGVkID0gMDtcblxuICAgICAgY29uc3QgaGFuZGxlciA9IGNyZWF0ZVB1c2hiYWNrSGFuZGxlcih7XG4gICAgICAgIGFwcCxcbiAgICAgICAgc2V0dGluZ3MsXG4gICAgICAgIG5vdGljZTogKCkgPT4ge30sXG4gICAgICB9KTtcblxuICAgICAgZm9yIChjb25zdCBmIG9mIGZpbGVzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgcGx1Z2luLmRvY3VtZW50Q29vcmRpbmF0aW9uS2V5KHVuZGVmaW5lZCwgZi5wYXRoKTtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwbHVnaW4uc3luY0Nvb3JkaW5hdG9yLnJ1bihrZXksIHVuZGVmaW5lZCwgKCkgPT4gaGFuZGxlcih7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIHVybDogJy9wdXNoYmFjaycsXG4gICAgICAgICAgICBwYXRoOiAnL3B1c2hiYWNrJyxcbiAgICAgICAgICAgIHF1ZXJ5OiBuZXcgVVJMU2VhcmNoUGFyYW1zKCksXG4gICAgICAgICAgICBib2R5OiB7IHBhdGg6IGYucGF0aCB9LFxuICAgICAgICAgICAgdG9rZW46ICcnLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBpZiAocmVzdWx0LmFjdGlvbiA9PT0gJ3B1c2hlZCcpIHB1c2hlZCsrO1xuICAgICAgICAgIGVsc2Ugc2tpcHBlZCsrO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICBmYWlsZWQrKztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBuZXcgTm90aWNlKGBcdTJCMDYgXHU2Mjc5XHU5MUNGXHU1NkRFXHU1MTk5XHU1QjhDXHU2MjEwXHVGRjFBXHU2M0E4XHU5MDAxICR7cHVzaGVkfVx1RkYwQ1x1OERGM1x1OEZDNyAke3NraXBwZWR9XHVGRjBDXHU1OTMxXHU4RDI1ICR7ZmFpbGVkfWApO1xuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFx1NjI3OVx1OTFDRlx1NTIwNlx1OTE0RFx1N0YxNlx1NzgwMVx1RkYwOFx1NUY1M1x1NTI0RFx1NzZFRVx1NUY1NVx1RkYwOVxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6ICdhc3NpZ24tZW5jb2RpbmctZGlyJyxcbiAgICBuYW1lOiAnXHU2Mjc5XHU5MUNGXHU1MjA2XHU5MTREXHU3RjE2XHU3ODAxXHVGRjA4XHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XHVGRjA5JyxcbiAgICBjYWxsYmFjazogYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZSA9IGFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuICAgICAgaWYgKCFmaWxlKSB7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1MjZBMFx1RkUwRiBcdThCRjdcdTUxNDhcdTYyNTNcdTVGMDBcdTRFMDBcdTRFMkFcdTY1ODdcdTRFRjZcdTRFRTVcdTc4NkVcdTVCOUFcdTc2RUVcdTVGNTUnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgZGlyID0gZmlsZS5wYXJlbnQ/LnBhdGg7XG4gICAgICBpZiAoIWRpcikgcmV0dXJuO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBiYXRjaEFzc2lnbkVuY29kaW5nKGFwcCwgZGlyKTtcbiAgICAgIG5ldyBOb3RpY2UoYFx1RDgzRFx1REQyMiBcdTdGMTZcdTc4MDFcdTUyMDZcdTkxNERcdUZGMUEke3Jlc3VsdC5hc3NpZ25lZH0vJHtyZXN1bHQudG90YWx9YCk7XG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gXHU1MjM3XHU2NUIwXHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0XG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogJ3JlZnJlc2gtbWFwcGluZycsXG4gICAgbmFtZTogJ1x1NTIzN1x1NjVCMFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1RkYwOE9CXHUyMTkyXHU5OERFXHU0RTY2XHVGRjA5JyxcbiAgICBjYWxsYmFjazogYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgcmVmcmVzaE1hcHBpbmcoYXBwLCBzZXR0aW5ncy5zcGFjZUlkKTtcbiAgICB9LFxuICB9KTtcblxuICAvLyBcdTY2M0VcdTc5M0FcdTU0MkZcdTUyQThcdTRFRTRcdTcyNENcbiAgcGx1Z2luLmFkZENvbW1hbmQoe1xuICAgIGlkOiAnc2hvdy10b2tlbicsXG4gICAgbmFtZTogJ1x1NjYzRVx1NzkzQVx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1x1RkYwOFx1OEZERVx1NjNBNVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NjI2OVx1NUM1NVx1NzUyOFx1RkYwOScsXG4gICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgIGNvbnN0IG1vZGFsID0gbmV3IFRva2VuTW9kYWwoYXBwLCBzZXR0aW5ncy5zeW5jVG9rZW4pO1xuICAgICAgbW9kYWwub3BlbigpO1xuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFx1NjYzRVx1NzkzQVx1NjcwMFx1OEZEMVx1NTQwQ1x1NkI2NVx1OEJCMFx1NUY1NVxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6ICdzaG93LXJlY2VudCcsXG4gICAgbmFtZTogJ1x1NjYzRVx1NzkzQVx1NjcwMFx1OEZEMVx1NTQwQ1x1NkI2NVx1OEJCMFx1NUY1NScsXG4gICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgIGNvbnN0IHJlY2VudCA9IHBsdWdpbi5zdGF0ZS5yZWNlbnRTeW5jcztcbiAgICAgIGlmIChyZWNlbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1RkYwOFx1NjY4Mlx1NjVFMFx1NTQwQ1x1NkI2NVx1OEJCMFx1NUY1NVx1RkYwOScpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBsaW5lcyA9IHJlY2VudC5zbGljZSgwLCAxMCkubWFwKFxuICAgICAgICByID0+IGAke3Iuc3RhdHVzID09PSAnZmFpbGVkJyA/ICdcdTI3NEMnIDogci5zdGF0dXMgPT09ICdza2lwcGVkJyA/ICdcdTIzRUQnIDogJ1x1MjcwNSd9ICR7ci50aXRsZSB8fCByLmtpbmR9IFx1MjE5MiAke3IucGF0aCB8fCByLmFjdGlvbiB8fCAnJ31gLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IG1vZGFsID0gbmV3IE1vZGFsKGFwcCk7XG4gICAgICBtb2RhbC50aXRsZUVsLnNldFRleHQoJ1x1NjcwMFx1OEZEMVx1NTQwQ1x1NkI2NVx1OEJCMFx1NUY1NScpO1xuICAgICAgY29uc3QgcHJlID0gbW9kYWwuY29udGVudEVsLmNyZWF0ZUVsKCdwcmUnKTtcbiAgICAgIHByZS5zZXRUZXh0KGxpbmVzLmpvaW4oJ1xcbicpKTtcbiAgICAgIG1vZGFsLm9wZW4oKTtcbiAgICB9LFxuICB9KTtcbn1cblxuLyoqIFx1NEVFNFx1NzI0Q1x1NUM1NVx1NzkzQSBNb2RhbFx1MzAwMiAqL1xuY2xhc3MgVG9rZW5Nb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgdG9rZW46IHN0cmluZykge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBvbk9wZW4oKTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG4gICAgY29udGVudEVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1x1NTQyRlx1NTJBOFx1NEVFNFx1NzI0QycgfSk7XG4gICAgY29udGVudEVsLmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDogJ1x1NTkwRFx1NTIzNlx1NkI2NFx1NEVFNFx1NzI0Q1x1RkYwQ1x1N0M5OFx1OEQzNFx1NTIzMFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NjI2OVx1NUM1NVx1NUYzOVx1N0E5N1x1NzY4NFwiVG9rZW5cIlx1OEY5M1x1NTE2NVx1Njg0Nlx1MzAwMicsXG4gICAgICBjbHM6ICdzZXR0aW5nLWl0ZW0tZGVzY3JpcHRpb24nLFxuICAgIH0pO1xuICAgIGNvbnN0IGNvZGVFbCA9IGNvbnRlbnRFbC5jcmVhdGVFbCgnY29kZScpO1xuICAgIGNvZGVFbC5zZXRUZXh0KHRoaXMudG9rZW4pO1xuICAgIGNvZGVFbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBjb2RlRWwuc3R5bGUucGFkZGluZyA9ICcxMnB4JztcbiAgICBjb2RlRWwuc3R5bGUuZm9udEZhbWlseSA9ICdtb25vc3BhY2UnO1xuICAgIGNvZGVFbC5zdHlsZS53b3JkQnJlYWsgPSAnYnJlYWstYWxsJztcbiAgICBjb2RlRWwuc3R5bGUuYmFja2dyb3VuZCA9ICd2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSknO1xuXG4gICAgY29uc3QgYnRuID0gY29udGVudEVsLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdcdTU5MERcdTUyMzYnIH0pO1xuICAgIGJ0bi5vbmNsaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGhpcy50b2tlbik7XG4gICAgICBuZXcgTm90aWNlKCdcdTI3MDUgXHU1REYyXHU1OTBEXHU1MjM2Jyk7XG4gICAgfTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IE1vZGFsLCBOb3RpY2UsIFRGaWxlLCBURm9sZGVyLCB0eXBlIEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7XG4gIE9CU0lESUFOX0xBUktfRE9DX0FDVElPTixcbiAgcGFyc2VPYnNpZGlhbkxhcmtEb2NQYXJhbXMsXG4gIHR5cGUgRmV0Y2hSZXF1ZXN0LFxufSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHR5cGUgeyBGZWlzaHVTeW5jUGx1Z2luIH0gZnJvbSAnLi9tYWluLmpzJztcbmltcG9ydCB7IGNyZWF0ZUZldGNoSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlcnMvZmV0Y2hIYW5kbGVyLmpzJztcbmltcG9ydCB7IHJlc29sdmVOb2RlVG9rZW5Gcm9tVXJsIH0gZnJvbSAnLi9sYXJrL2NsaS5qcyc7XG5pbXBvcnQgeyBub3JtYWxpemVWYXVsdERpciB9IGZyb20gJy4vdmF1bHRQYXRoLmpzJztcblxudHlwZSBUcmlnZ2VyU291cmNlID0gJ3Byb3RvY29sJyB8ICdjb21tYW5kJyB8ICdjbGlwcGVyJztcblxuaW50ZXJmYWNlIFRyaWdnZXJJbnB1dCB7XG4gIG5vZGVfdG9rZW4/OiBzdHJpbmc7XG4gIG9ial90b2tlbj86IHN0cmluZztcbiAgc3BhY2VfaWQ/OiBzdHJpbmc7XG4gIHRpdGxlPzogc3RyaW5nO1xuICB1cmw/OiBzdHJpbmc7XG4gIGRpcj86IHN0cmluZztcbiAgcmVwbGFjZV9wYXRoPzogc3RyaW5nO1xuICBzb3VyY2U6IFRyaWdnZXJTb3VyY2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckZldGNoRW50cnlwb2ludHMocGx1Z2luOiBGZWlzaHVTeW5jUGx1Z2luKTogdm9pZCB7XG4gIHBsdWdpbi5yZWdpc3Rlck9ic2lkaWFuUHJvdG9jb2xIYW5kbGVyKE9CU0lESUFOX0xBUktfRE9DX0FDVElPTiwgKHBhcmFtcykgPT4ge1xuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlT2JzaWRpYW5MYXJrRG9jUGFyYW1zKHBhcmFtcyk7XG4gICAgdm9pZCB0cmlnZ2VyRmV0Y2gocGx1Z2luLCB7XG4gICAgICBub2RlX3Rva2VuOiBwYXJzZWQubm9kZV90b2tlbiB8fCBwYXJzZWQudG9rZW4sXG4gICAgICBvYmpfdG9rZW46IHBhcnNlZC5vYmpfdG9rZW4sXG4gICAgICBzcGFjZV9pZDogcGFyc2VkLnNwYWNlX2lkLFxuICAgICAgdGl0bGU6IHBhcnNlZC50aXRsZSxcbiAgICAgIHVybDogcGFyc2VkLnVybCxcbiAgICAgIGRpcjogcGFyc2VkLmRpcixcbiAgICAgIHNvdXJjZTogJ3Byb3RvY29sJyxcbiAgICB9KTtcbiAgfSk7XG5cbiAgcGx1Z2luLmFkZENvbW1hbmQoe1xuICAgIGlkOiAnZmV0Y2gtZmVpc2h1LWRvYycsXG4gICAgbmFtZTogJ1x1NjJDOVx1NTNENlx1OThERVx1NEU2Nlx1NjU4N1x1Njg2MycsXG4gICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgIG5ldyBGZWlzaHVJbnB1dE1vZGFsKHBsdWdpbi5hcHAsIGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBwYXJzZVVzZXJJbnB1dCh2YWx1ZSk7XG4gICAgICAgIGF3YWl0IHRyaWdnZXJGZXRjaChwbHVnaW4sIHtcbiAgICAgICAgICAuLi5wYXJzZWQsXG4gICAgICAgICAgc291cmNlOiAnY29tbWFuZCcsXG4gICAgICAgIH0pO1xuICAgICAgfSkub3BlbigpO1xuICAgIH0sXG4gIH0pO1xuXG4gIHBsdWdpbi5yZWdpc3RlckV2ZW50KFxuICAgIHBsdWdpbi5hcHAudmF1bHQub24oJ2NyZWF0ZScsIChmaWxlKSA9PiB7XG4gICAgICBpZiAoIShmaWxlIGluc3RhbmNlb2YgVEZpbGUpIHx8IGZpbGUuZXh0ZW5zaW9uICE9PSAnbWQnKSByZXR1cm47XG4gICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHZvaWQgaGFuZGxlQ2xpcHBlclBsYWNlaG9sZGVyKHBsdWdpbiwgZmlsZSk7XG4gICAgICB9LCAyNTApO1xuICAgIH0pLFxuICApO1xufVxuXG5hc3luYyBmdW5jdGlvbiB0cmlnZ2VyRmV0Y2gocGx1Z2luOiBGZWlzaHVTeW5jUGx1Z2luLCBpbnB1dDogVHJpZ2dlcklucHV0KTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHJlc29sdmVkID0gbm9ybWFsaXplSW5wdXQocGx1Z2luLCBpbnB1dCk7XG4gIGlmICghcmVzb2x2ZWQubm9kZV90b2tlbikge1xuICAgIG5ldyBOb3RpY2UoJ1x1NjVFMFx1NkNENVx1OEJDNlx1NTIyQlx1OThERVx1NEU2Nlx1NjU4N1x1Njg2MyB0b2tlbicpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHJlcTogRmV0Y2hSZXF1ZXN0ID0ge1xuICAgIG5vZGVfdG9rZW46IHJlc29sdmVkLm5vZGVfdG9rZW4sXG4gICAgb2JqX3Rva2VuOiByZXNvbHZlZC5vYmpfdG9rZW4sXG4gICAgc3BhY2VfaWQ6IHJlc29sdmVkLnNwYWNlX2lkIHx8IHBsdWdpbi5zZXR0aW5ncy5zcGFjZUlkLFxuICAgIGRpcjogcmVzb2x2ZWQuZGlyIHx8IHBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0RGlyLFxuICAgIGZpbGVuYW1lOiByZXNvbHZlZC50aXRsZSxcbiAgICByZXBsYWNlX3BhdGg6IHJlc29sdmVkLnJlcGxhY2VfcGF0aCxcbiAgfTtcblxuICBjb25zdCBydW4gPSBhc3luYyAoZGlyPzogc3RyaW5nKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBjcmVhdGVGZXRjaEhhbmRsZXIoe1xuICAgICAgICBhcHA6IHBsdWdpbi5hcHAsXG4gICAgICAgIHNldHRpbmdzOiBwbHVnaW4uc2V0dGluZ3MsXG4gICAgICAgIHN0YXRlOiBwbHVnaW4uc3RhdGUsXG4gICAgICAgIG5vdGljZTogKG1lc3NhZ2UpID0+IG5ldyBOb3RpY2UobWVzc2FnZSksXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHRhcmdldERpciA9IG5vcm1hbGl6ZVZhdWx0RGlyKGRpciB8fCByZXEuZGlyIHx8IHBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0RGlyKTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBsdWdpbi5zeW5jQ29vcmRpbmF0b3IucnVuKGBkb2N1bWVudDoke3JlcS5ub2RlX3Rva2VufWAsIHVuZGVmaW5lZCwgKCkgPT5cbiAgICAgICAgcGx1Z2luLnN5bmNDb29yZGluYXRvci5ydW4oYGRpcmVjdG9yeToke3RhcmdldERpcn1gLCB1bmRlZmluZWQsICgpID0+IGhhbmRsZXIoe1xuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgIHVybDogJy9mZXRjaCcsXG4gICAgICAgICAgcGF0aDogJy9mZXRjaCcsXG4gICAgICAgICAgcXVlcnk6IG5ldyBVUkxTZWFyY2hQYXJhbXMoKSxcbiAgICAgICAgICBib2R5OiB7IC4uLnJlcSwgZGlyOiB0YXJnZXREaXIgfSxcbiAgICAgICAgICB0b2tlbjogJycsXG4gICAgICAgIH0pKSk7XG4gICAgICBuZXcgTm90aWNlKGAke3Jlc3VsdC5hY3Rpb24gPT09ICdjcmVhdGVkJyA/ICdcdTVERjJcdTUyMUJcdTVFRkEnIDogJ1x1NURGMlx1NjZGNFx1NjVCMCd9XHVGRjFBJHtyZXN1bHQucGF0aH1gKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIG5ldyBOb3RpY2UoYFx1NTQwQ1x1NkI2NVx1NTkzMVx1OEQyNVx1RkYxQSR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpfWApO1xuICAgIH1cbiAgfTtcblxuICBpZiAoaW5wdXQuc291cmNlID09PSAncHJvdG9jb2wnICYmICFpbnB1dC5kaXIpIHtcbiAgICBuZXcgRm9sZGVyUGlja01vZGFsKHBsdWdpbi5hcHAsIHBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0RGlyLCBydW4pLm9wZW4oKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBhd2FpdCBydW4ocmVxLmRpcik7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUlucHV0KHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbiwgaW5wdXQ6IFRyaWdnZXJJbnB1dCk6IFRyaWdnZXJJbnB1dCB7XG4gIGlmIChpbnB1dC51cmwpIHtcbiAgICBjb25zdCBmcm9tVXJsID0gcmVzb2x2ZU5vZGVUb2tlbkZyb21VcmwoaW5wdXQudXJsKTtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uaW5wdXQsXG4gICAgICBub2RlX3Rva2VuOiBpbnB1dC5ub2RlX3Rva2VuIHx8IGZyb21Vcmwubm9kZV90b2tlbiB8fCBpbnB1dC5vYmpfdG9rZW4gfHwgZnJvbVVybC5vYmpfdG9rZW4sXG4gICAgICBvYmpfdG9rZW46IGlucHV0Lm9ial90b2tlbiB8fCBmcm9tVXJsLm9ial90b2tlbixcbiAgICB9O1xuICB9XG4gIHJldHVybiB7XG4gICAgLi4uaW5wdXQsXG4gICAgbm9kZV90b2tlbjogaW5wdXQubm9kZV90b2tlbiB8fCBpbnB1dC5vYmpfdG9rZW4sXG4gICAgc3BhY2VfaWQ6IGlucHV0LnNwYWNlX2lkIHx8IHBsdWdpbi5zZXR0aW5ncy5zcGFjZUlkLFxuICB9O1xufVxuXG5mdW5jdGlvbiBwYXJzZVVzZXJJbnB1dCh2YWx1ZTogc3RyaW5nKTogT21pdDxUcmlnZ2VySW5wdXQsICdzb3VyY2UnPiB7XG4gIGNvbnN0IHRyaW1tZWQgPSB2YWx1ZS50cmltKCk7XG4gIGlmICgvXmh0dHBzPzpcXC9cXC8vLnRlc3QodHJpbW1lZCkpIHtcbiAgICBjb25zdCBwYXJzZWQgPSByZXNvbHZlTm9kZVRva2VuRnJvbVVybCh0cmltbWVkKTtcbiAgICByZXR1cm4ge1xuICAgICAgbm9kZV90b2tlbjogcGFyc2VkLm5vZGVfdG9rZW4gfHwgcGFyc2VkLm9ial90b2tlbixcbiAgICAgIG9ial90b2tlbjogcGFyc2VkLm9ial90b2tlbixcbiAgICAgIHVybDogdHJpbW1lZCxcbiAgICB9O1xuICB9XG4gIGNvbnN0IHByb3RvY29sUGFyYW1zID0gcGFyc2VPYnNpZGlhbkxhcmtEb2NQYXJhbXModHJpbW1lZCk7XG4gIGlmIChwcm90b2NvbFBhcmFtcy50b2tlbiB8fCBwcm90b2NvbFBhcmFtcy5ub2RlX3Rva2VuIHx8IHByb3RvY29sUGFyYW1zLm9ial90b2tlbikge1xuICAgIHJldHVybiB7XG4gICAgICBub2RlX3Rva2VuOiBwcm90b2NvbFBhcmFtcy5ub2RlX3Rva2VuIHx8IHByb3RvY29sUGFyYW1zLnRva2VuIHx8IHByb3RvY29sUGFyYW1zLm9ial90b2tlbixcbiAgICAgIG9ial90b2tlbjogcHJvdG9jb2xQYXJhbXMub2JqX3Rva2VuLFxuICAgICAgc3BhY2VfaWQ6IHByb3RvY29sUGFyYW1zLnNwYWNlX2lkLFxuICAgICAgdGl0bGU6IHByb3RvY29sUGFyYW1zLnRpdGxlLFxuICAgICAgdXJsOiBwcm90b2NvbFBhcmFtcy51cmwsXG4gICAgICBkaXI6IHByb3RvY29sUGFyYW1zLmRpcixcbiAgICB9O1xuICB9XG4gIHJldHVybiB7IG5vZGVfdG9rZW46IHRyaW1tZWQgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2xpcHBlclBsYWNlaG9sZGVyKHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbiwgZmlsZTogVEZpbGUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgbGV0IGNvbnRlbnQgPSAnJztcbiAgdHJ5IHtcbiAgICBjb250ZW50ID0gYXdhaXQgcGx1Z2luLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB1cmwgPSBleHRyYWN0Q2xpcHBlclVybChjb250ZW50KTtcbiAgaWYgKCF1cmwpIHJldHVybjtcbiAgY29uc3QgcGFyc2VkID0gcmVzb2x2ZU5vZGVUb2tlbkZyb21VcmwodXJsKTtcbiAgY29uc3Qgbm9kZVRva2VuID0gcGFyc2VkLm5vZGVfdG9rZW4gfHwgcGFyc2VkLm9ial90b2tlbjtcbiAgaWYgKCFub2RlVG9rZW4pIHJldHVybjtcblxuICBhd2FpdCB0cmlnZ2VyRmV0Y2gocGx1Z2luLCB7XG4gICAgbm9kZV90b2tlbjogbm9kZVRva2VuLFxuICAgIG9ial90b2tlbjogcGFyc2VkLm9ial90b2tlbixcbiAgICB1cmwsXG4gICAgZGlyOiBmaWxlLnBhcmVudD8ucGF0aCB8fCBwbHVnaW4uc2V0dGluZ3MuZGVmYXVsdERpcixcbiAgICByZXBsYWNlX3BhdGg6IGZpbGUucGF0aCxcbiAgICBzb3VyY2U6ICdjbGlwcGVyJyxcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RDbGlwcGVyVXJsKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCBwYXR0ZXJucyA9IFtcbiAgICAvZmVpc2h1X3N5bmNfdXJsOlxccypbXCInXT8oW15cXG5cIiddKykvLFxuICAgIC9zb3VyY2U6XFxzKltcIiddPyhodHRwcz86XFwvXFwvW15cXG5cIiddKig/OmZlaXNodVxcLmNufGxhcmtzdWl0ZVxcLmNvbSlcXC8oPzp3aWtpfGRvY3h8ZG9jKVxcL1tBLVphLXowLTldKykvLFxuICAgIC8oaHR0cHM/OlxcL1xcL1teXFxzKVwiJ10qKD86ZmVpc2h1XFwuY258bGFya3N1aXRlXFwuY29tKVxcLyg/Ondpa2l8ZG9jeHxkb2MpXFwvW0EtWmEtejAtOV0rKS8sXG4gIF07XG4gIGZvciAoY29uc3QgcGF0dGVybiBvZiBwYXR0ZXJucykge1xuICAgIGNvbnN0IG1hdGNoID0gY29udGVudC5tYXRjaChwYXR0ZXJuKTtcbiAgICBpZiAobWF0Y2g/LlsxXSkgcmV0dXJuIG1hdGNoWzFdLnRyaW0oKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuY2xhc3MgRmVpc2h1SW5wdXRNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBpbnB1dEVsITogSFRNTElucHV0RWxlbWVudDtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJpdmF0ZSBvblN1Ym1pdDogKHZhbHVlOiBzdHJpbmcpID0+IFByb21pc2U8dm9pZD4pIHtcbiAgICBzdXBlcihhcHApO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIHRoaXMudGl0bGVFbC5zZXRUZXh0KCdcdTYyQzlcdTUzRDZcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjMnKTtcbiAgICB0aGlzLmlucHV0RWwgPSB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbCgnaW5wdXQnLCB7XG4gICAgICB0eXBlOiAndGV4dCcsXG4gICAgICBwbGFjZWhvbGRlcjogJ1x1N0M5OFx1OEQzNFx1OThERVx1NEU2Nlx1OTRGRVx1NjNBNVx1MzAwMXRva2VuIFx1NjIxNiBvYnNpZGlhbjovL2xhcmstZG9jIFx1NTczMFx1NTc0MCcsXG4gICAgfSk7XG4gICAgdGhpcy5pbnB1dEVsLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgIHRoaXMuaW5wdXRFbC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ICE9PSAnRW50ZXInKSByZXR1cm47XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmlucHV0RWwudmFsdWUudHJpbSgpO1xuICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgdm9pZCB0aGlzLm9uU3VibWl0KHZhbHVlKTtcbiAgICB9KTtcbiAgICB0aGlzLmlucHV0RWwuZm9jdXMoKTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxufVxuXG5jbGFzcyBGb2xkZXJQaWNrTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIGFwcDogQXBwLFxuICAgIHByaXZhdGUgZGVmYXVsdERpcjogc3RyaW5nLFxuICAgIHByaXZhdGUgb25TdWJtaXQ6IChkaXI6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPixcbiAgKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgfVxuXG4gIG9uT3BlbigpOiB2b2lkIHtcbiAgICB0aGlzLnRpdGxlRWwuc2V0VGV4dCgnXHU5MDA5XHU2MkU5XHU1NDBDXHU2QjY1XHU3NkVFXHU1RjU1Jyk7XG4gICAgY29uc3Qgc2VsZWN0ID0gdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ3NlbGVjdCcpO1xuICAgIHNlbGVjdC5zdHlsZS53aWR0aCA9ICcxMDAlJztcblxuICAgIGNvbnN0IGZvbGRlcnMgPSBnZXRGb2xkZXJzKHRoaXMuYXBwKTtcbiAgICBmb3IgKGNvbnN0IGZvbGRlciBvZiBmb2xkZXJzKSB7XG4gICAgICBjb25zdCBvcHRpb24gPSBzZWxlY3QuY3JlYXRlRWwoJ29wdGlvbicsIHtcbiAgICAgICAgdGV4dDogZm9sZGVyLnBhdGggfHwgJy8nLFxuICAgICAgICB2YWx1ZTogZm9sZGVyLnBhdGgsXG4gICAgICB9KTtcbiAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IGZvbGRlci5wYXRoID09PSB0aGlzLmRlZmF1bHREaXI7XG4gICAgfVxuXG4gICAgY29uc3Qgcm93ID0gdGhpcy5jb250ZW50RWwuY3JlYXRlRGl2KCk7XG4gICAgcm93LnN0eWxlLm1hcmdpblRvcCA9ICcxMnB4JztcbiAgICBjb25zdCBjb25maXJtID0gcm93LmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdcdTU0MENcdTZCNjUnIH0pO1xuICAgIGNvbmZpcm0ub25jbGljayA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGRpciA9IHNlbGVjdC52YWx1ZSB8fCB0aGlzLmRlZmF1bHREaXI7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB2b2lkIHRoaXMub25TdWJtaXQoZGlyKTtcbiAgICB9O1xuICB9XG5cbiAgb25DbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldEZvbGRlcnMoYXBwOiBBcHApOiBURm9sZGVyW10ge1xuICBjb25zdCBmb2xkZXJzID0gYXBwLnZhdWx0XG4gICAgLmdldEFsbExvYWRlZEZpbGVzKClcbiAgICAuZmlsdGVyKChmaWxlKTogZmlsZSBpcyBURm9sZGVyID0+IGZpbGUgaW5zdGFuY2VvZiBURm9sZGVyKVxuICAgIC5maWx0ZXIoKGZvbGRlcikgPT4gIWZvbGRlci5wYXRoLnN0YXJ0c1dpdGgoJy5vYnNpZGlhbicpICYmICFmb2xkZXIucGF0aC5zdGFydHNXaXRoKCcuZmVpc2h1LXN5bmMnKSk7XG4gIHJldHVybiBmb2xkZXJzLmxlbmd0aCA+IDAgPyBmb2xkZXJzIDogW2FwcC52YXVsdC5nZXRSb290KCldO1xufVxuIiwgIi8qKlxuICogXHU1NkZFXHU3MjQ3XHU5ODg0XHU4OUM4XHU2RTMyXHU2N0QzXHUzMDAyXHU0RjlEXHU2MzZFIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgIFx1MDBBNzMuMyArIGAwM19cdTY4M0NcdTVGMEZcdTg5QzRcdTgzMDMubWRgIFx1MDBBN1x1NTE2RFx1MzAwMlxuICpcbiAqIE9CIG1kIFx1OTFDQ1x1NTZGRVx1NzI0N1x1NTE5OVx1NjIxMCBgIVtdKGZlaXNodTovL0ZJTEVfVE9LRU4pYFx1RkYwQ1x1NkUzMlx1NjdEM1x1NjVGNlx1OEMwMyBsYXJrLWNsaSBcdTYzNjJcdTRFMzRcdTY1RjZcdTk0RkVcdTYzQTVcdTMwMDJcbiAqIFx1NUUyNiBMUlUgXHU3RjEzXHU1QjU4XHVGRjA4XHU5MDdGXHU1MTREXHU2QkNGXHU2QjIxXHU2RTMyXHU2N0QzXHU5MEZEXHU0RTBCXHU4RjdEXHVGRjA5XHVGRjBDXHU3RjEzXHU1QjU4XHU3NkVFXHU1RjU1XHU1NzI4IHZhdWx0IFx1NEUwQiBgLmZlaXNodS1zeW5jL2NhY2hlL2BcdTMwMDJcbiAqL1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBOb3RpY2UsIFBsYXRmb3JtIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgcnVuIH0gZnJvbSAnLi9sYXJrL2NsaS5qcyc7XG5pbXBvcnQgeyB2YWxpZGF0ZUltYWdlVG9rZW4gfSBmcm9tICcuL3ZhdWx0UGF0aC5qcyc7XG5cbmNvbnN0IENBQ0hFX0RJUiA9ICcuZmVpc2h1LXN5bmMvY2FjaGUnO1xuXG4vKipcbiAqIFx1NkNFOFx1NTE4Q1x1NTZGRVx1NzI0N1x1NkUzMlx1NjdEM1x1NTkwNFx1NzQwNlx1NTY2OFx1MzAwMlxuICogXHU2MkU2XHU2MjJBXHU2RTMyXHU2N0QzXHU1NDBFXHU3Njg0IDxpbWcgc3JjPVwiZmVpc2h1Oi8vVE9LRU5cIj5cdUZGMENcdTYzNjJcdTYyMTAgbGFyay1jbGkgXHU0RTBCXHU4RjdEXHU3Njg0XHU2NzJDXHU1NzMwXHU0RTM0XHU2NUY2XHU2NTg3XHU0RUY2XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckltYWdlUmVuZGVyZXIocGx1Z2luOiBQbHVnaW4pOiB2b2lkIHtcbiAgaWYgKCFQbGF0Zm9ybS5pc0Rlc2t0b3BBcHApIHJldHVybjtcblxuICBwbHVnaW4ucmVnaXN0ZXJNYXJrZG93blBvc3RQcm9jZXNzb3IoYXN5bmMgKGVsKSA9PiB7XG4gICAgY29uc3QgaW1ncyA9IGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2ltZycpO1xuICAgIGZvciAoY29uc3QgaW1nIG9mIEFycmF5LmZyb20oaW1ncykpIHtcbiAgICAgIGNvbnN0IHNyYyA9IGltZy5nZXRBdHRyaWJ1dGUoJ3NyYycpIHx8ICcnO1xuICAgICAgaWYgKCFzcmMuc3RhcnRzV2l0aCgnZmVpc2h1Oi8vJykpIGNvbnRpbnVlO1xuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB0b2tlbiA9IHZhbGlkYXRlSW1hZ2VUb2tlbihzcmMuc2xpY2UoJ2ZlaXNodTovLycubGVuZ3RoKSk7XG4gICAgICAgIGNvbnN0IGxvY2FsUGF0aCA9IGF3YWl0IHJlc29sdmVJbWFnZShwbHVnaW4sIHRva2VuKTtcbiAgICAgICAgaWYgKGxvY2FsUGF0aCkge1xuICAgICAgICAgIC8vIFx1NzUyOCB2YXVsdDovLyBcdTk0RkVcdTYzQTVcdTYyMTYgYXBwOi8vbG9jYWwvIFx1OTRGRVx1NjNBNVxuICAgICAgICAgIGNvbnN0IHZhdWx0QmFzZSA9IChcbiAgICAgICAgICAgIHBsdWdpbi5hcHAudmF1bHQuYWRhcHRlciBhcyB0eXBlb2YgcGx1Z2luLmFwcC52YXVsdC5hZGFwdGVyICYgeyBnZXRCYXNlUGF0aD86ICgpID0+IHN0cmluZyB9XG4gICAgICAgICAgKS5nZXRCYXNlUGF0aD8uKCkgPz8gJyc7XG4gICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4odmF1bHRCYXNlLCBsb2NhbFBhdGgpO1xuICAgICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoJ3NyYycsIGBhcHA6Ly9sb2NhbC8ke2Z1bGxQYXRofWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoJ2FsdCcsIGBbXHU5OERFXHU0RTY2XHU1NkZFXHU3MjQ3ICR7dG9rZW4uc2xpY2UoMCwgOCl9IFx1NTJBMFx1OEY3RFx1NTkzMVx1OEQyNV1gKTtcbiAgICAgICAgICBpbWcuc2V0QXR0cmlidXRlKCdzcmMnLCAnJyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2ltYWdlXSByZW5kZXIgZmFpbGVkOicsIGVycik7XG4gICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoJ2FsdCcsICdbXHU5OERFXHU0RTY2XHU1NkZFXHU3MjQ3XHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1XScpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogXHU4OUUzXHU2NzkwXHU1MzU1XHU0RTJBXHU5OERFXHU0RTY2XHU1NkZFXHU3MjQ3IHRva2VuIFx1MjE5MiBcdTY3MkNcdTU3MzBcdTdGMTNcdTVCNThcdThERUZcdTVGODRcdTMwMDJcbiAqIFx1NTQ3RFx1NEUyRFx1N0YxM1x1NUI1OFx1NzZGNFx1NjNBNVx1OEZENFx1NTZERVx1RkYwQ1x1NTQyNlx1NTIxOVx1OEMwMyBsYXJrLWNsaSBkb2NzICttZWRpYS1kb3dubG9hZCBcdTRFMEJcdThGN0RcdTMwMDJcbiAqL1xuY29uc3QgcmVzb2x2aW5nID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2U8c3RyaW5nIHwgbnVsbD4+KCk7XG5cbmFzeW5jIGZ1bmN0aW9uIHJlc29sdmVJbWFnZShwbHVnaW46IFBsdWdpbiwgdG9rZW46IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAvLyBcdTVFNzZcdTUzRDFcdTUzQkJcdTkxQ0RcdUZGMDhcdTU0MENcdTRFMDAgdG9rZW4gXHU1OTFBXHU0RTJBIGltZyBcdTU0MENcdTY1RjZcdTZFMzJcdTY3RDNcdTUzRUFcdTRFMEJcdThGN0RcdTRFMDBcdTZCMjFcdUZGMDlcbiAgaWYgKHJlc29sdmluZy5oYXModG9rZW4pKSByZXR1cm4gcmVzb2x2aW5nLmdldCh0b2tlbikhO1xuXG4gIGNvbnN0IHByb21pc2UgPSBkb1Jlc29sdmVJbWFnZShwbHVnaW4sIHRva2VuKTtcbiAgcmVzb2x2aW5nLnNldCh0b2tlbiwgcHJvbWlzZSk7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGF3YWl0IHByb21pc2U7XG4gIH0gZmluYWxseSB7XG4gICAgcmVzb2x2aW5nLmRlbGV0ZSh0b2tlbik7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZG9SZXNvbHZlSW1hZ2UocGx1Z2luOiBQbHVnaW4sIHRva2VuOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgY29uc3QgeyBhZGFwdGVyIH0gPSBwbHVnaW4uYXBwLnZhdWx0O1xuICBjb25zdCBleHQgPSAnLnBuZyc7IC8vIFx1OThERVx1NEU2Nlx1NTZGRVx1NzI0N1x1OUVEOFx1OEJBNCBwbmdcdUZGMENcdTY1RTBcdTZDRDVcdTk4ODRcdTc3RTVcdTY4M0NcdTVGMEZcdUZGMENcdTdFREZcdTRFMDAgcG5nXG4gIGNvbnN0IGNhY2hlUGF0aCA9IGAke0NBQ0hFX0RJUn0vJHt0b2tlbn0ke2V4dH1gO1xuXG4gIC8vIFx1NTQ3RFx1NEUyRFx1N0YxM1x1NUI1OFxuICBpZiAoYXdhaXQgYWRhcHRlci5leGlzdHMoY2FjaGVQYXRoKSkge1xuICAgIHJldHVybiBjYWNoZVBhdGg7XG4gIH1cblxuICAvLyBcdTc4NkVcdTRGRERcdTdGMTNcdTVCNThcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjhcbiAgdHJ5IHtcbiAgICBpZiAoIShhd2FpdCBhZGFwdGVyLmV4aXN0cyhDQUNIRV9ESVIpKSkge1xuICAgICAgYXdhaXQgYWRhcHRlci5ta2RpcihDQUNIRV9ESVIpO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgLyogaWdub3JlICovXG4gIH1cblxuICAvLyBcdTRFMEJcdThGN0RcdTUyMzBcdTRFMzRcdTY1RjZcdTY3MkNcdTU3MzBcdThERUZcdTVGODRcdUZGMDhsYXJrLWNsaSBcdTk3MDBcdTg5ODFcdTY3MkNcdTU3MzBcdTY1ODdcdTRFRjZcdTdDRkJcdTdFREZcdThERUZcdTVGODRcdUZGMDlcbiAgY29uc3QgdmF1bHRCYXNlID0gKGFkYXB0ZXIgYXMgeyBnZXRCYXNlUGF0aD86ICgpID0+IHN0cmluZyB9KS5nZXRCYXNlUGF0aD8uKCkgPz8gcHJvY2Vzcy5jd2QoKTtcbiAgY29uc3QgbG9jYWxGdWxsUGF0aCA9IHBhdGguam9pbih2YXVsdEJhc2UsIGNhY2hlUGF0aCk7XG5cbiAgdHJ5IHtcbiAgICBydW4oWydkb2NzJywgJyttZWRpYS1kb3dubG9hZCcsICctLXRva2VuJywgdG9rZW4sICctLW91dHB1dCcsIGxvY2FsRnVsbFBhdGhdLCB7XG4gICAgICB0aW1lb3V0OiAzMDAwMCxcbiAgICB9KTtcbiAgICByZXR1cm4gY2FjaGVQYXRoO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2ltYWdlXSBtZWRpYS1kb3dubG9hZCBmYWlsZWQ6JywgdG9rZW4sIGVycik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTZFMDVcdTc0MDZcdThGQzdcdTY3MUZcdTdGMTNcdTVCNThcdTMwMDJcdTRGOURcdTYzNkVcdThCQkVcdTdGNkUgY2FjaGVDbGVhbnVwIFx1NTQ2OFx1NjcxRlx1MzAwMlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYW51cEltYWdlQ2FjaGUocGx1Z2luOiBQbHVnaW4sIG1vZGU6ICdkYWlseScgfCAnd2Vla2x5JyB8ICdtb250aGx5JyB8ICduZXZlcicpOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKG1vZGUgPT09ICduZXZlcicpIHJldHVybjtcblxuICBjb25zdCB7IGFkYXB0ZXIgfSA9IHBsdWdpbi5hcHAudmF1bHQ7XG4gIGlmICghKGF3YWl0IGFkYXB0ZXIuZXhpc3RzKENBQ0hFX0RJUikpKSByZXR1cm47XG5cbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgY29uc3QgdHRsTXMgPVxuICAgIG1vZGUgPT09ICdkYWlseScgPyAyNCAqIDM2MDAgKiAxMDAwIDpcbiAgICBtb2RlID09PSAnd2Vla2x5JyA/IDcgKiAyNCAqIDM2MDAgKiAxMDAwIDpcbiAgICAzMCAqIDI0ICogMzYwMCAqIDEwMDA7XG5cbiAgbGV0IGNsZWFuZWQgPSAwO1xuICB0cnkge1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgYWRhcHRlci5saXN0KENBQ0hFX0RJUik7XG4gICAgZm9yIChjb25zdCBmIG9mIGZpbGVzLmZpbGVzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzdGF0ID0gYXdhaXQgYWRhcHRlci5zdGF0KGYpO1xuICAgICAgICBpZiAoc3RhdD8ubXRpbWUgJiYgbm93IC0gc3RhdC5tdGltZSA+IHR0bE1zKSB7XG4gICAgICAgICAgYXdhaXQgYWRhcHRlci5yZW1vdmUoZik7XG4gICAgICAgICAgY2xlYW5lZCsrO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2ltYWdlXSBjbGVhbnVwIGZhaWxlZDonLCBlcnIpO1xuICB9XG5cbiAgaWYgKGNsZWFuZWQgPiAwKSB7XG4gICAgbmV3IE5vdGljZShgXHVEODNFXHVEREY5IFx1NURGMlx1NkUwNVx1NzQwNiAke2NsZWFuZWR9IFx1NEUyQVx1OEZDN1x1NjcxRlx1NTZGRVx1NzI0N1x1N0YxM1x1NUI1OGApO1xuICB9XG59XG4iLCAiY29uc3QgTEVHQUNZX1NZU1RFTV9QUk9QRVJUWV9LRVlTID0gbmV3IFNldChbXG4gICdmZWlzaHVfaWQnLFxuICAnZmVpc2h1X2RvY19pZCcsXG4gICdmZWlzaHVfdGl0bGUnLFxuICAnc3luY19oYXNoJyxcbiAgJ3N5bmNfdGltZScsXG5dKTtcblxuZXhwb3J0IGNvbnN0IFNZU1RFTV9QUk9QRVJUWV9TVFlMRV9JRCA9ICdmc3RiLXN5c3RlbS1wcm9wZXJ0eS1zdHlsZSc7XG5leHBvcnQgY29uc3QgU1lTVEVNX1BST1BFUlRZX0hJRERFTl9DTEFTUyA9ICdmc3RiLXN5c3RlbS1wcm9wZXJ0eS1oaWRkZW4nO1xuZXhwb3J0IGNvbnN0IFNZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTID0gJ2ZzdGItaGlkZS1zeXN0ZW0tcHJvcGVydGllcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N5c3RlbVByb3BlcnR5S2V5KHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGNvbnN0IGtleSA9IFN0cmluZyh2YWx1ZSA/PyAnJykudHJpbSgpO1xuICByZXR1cm4ga2V5LnN0YXJ0c1dpdGgoJ19zeXNfJykgfHwgTEVHQUNZX1NZU1RFTV9QUk9QRVJUWV9LRVlTLmhhcyhrZXkpO1xufVxuXG5leHBvcnQgY29uc3QgU1lTVEVNX1BST1BFUlRZX0NTUyA9IGBcbmJvZHkuJHtTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTU30gLm1ldGFkYXRhLXByb3BlcnR5W2RhdGEtcHJvcGVydHkta2V5Xj1cIl9zeXNfXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHlbZGF0YS1wcm9wZXJ0eS1uYW1lXj1cIl9zeXNfXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHlbZGF0YS1wcm9wZXJ0eS1rZXk9XCJmZWlzaHVfaWRcIl0sXG5ib2R5LiR7U1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1N9IC5tZXRhZGF0YS1wcm9wZXJ0eVtkYXRhLXByb3BlcnR5LWtleT1cImZlaXNodV9kb2NfaWRcIl0sXG5ib2R5LiR7U1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1N9IC5tZXRhZGF0YS1wcm9wZXJ0eVtkYXRhLXByb3BlcnR5LWtleT1cImZlaXNodV90aXRsZVwiXSxcbmJvZHkuJHtTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTU30gLm1ldGFkYXRhLXByb3BlcnR5W2RhdGEtcHJvcGVydHkta2V5PVwic3luY19oYXNoXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHlbZGF0YS1wcm9wZXJ0eS1rZXk9XCJzeW5jX3RpbWVcIl0sXG5ib2R5LiR7U1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1N9IC5tZXRhZGF0YS1wcm9wZXJ0eVtkYXRhLXByb3BlcnR5LW5hbWU9XCJmZWlzaHVfaWRcIl0sXG5ib2R5LiR7U1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1N9IC5tZXRhZGF0YS1wcm9wZXJ0eVtkYXRhLXByb3BlcnR5LW5hbWU9XCJmZWlzaHVfZG9jX2lkXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHlbZGF0YS1wcm9wZXJ0eS1uYW1lPVwiZmVpc2h1X3RpdGxlXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHlbZGF0YS1wcm9wZXJ0eS1uYW1lPVwic3luY19oYXNoXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHlbZGF0YS1wcm9wZXJ0eS1uYW1lPVwic3luY190aW1lXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHk6aGFzKC5tZXRhZGF0YS1wcm9wZXJ0eS1rZXktaW5wdXRbdmFsdWVePVwiX3N5c19cIl0pLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHk6aGFzKC5tZXRhZGF0YS1wcm9wZXJ0eS1rZXktaW5wdXRbYXJpYS1sYWJlbF49XCJfc3lzX1wiXSksXG5ib2R5LiR7U1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1N9IC5tZXRhZGF0YS1wcm9wZXJ0eTpoYXMoLm1ldGFkYXRhLXByb3BlcnR5LWtleSBpbnB1dFt2YWx1ZV49XCJfc3lzX1wiXSksXG5ib2R5LiR7U1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1N9IC5tZXRhZGF0YS1wcm9wZXJ0eTpoYXMoLm1ldGFkYXRhLXByb3BlcnR5LWtleSBzcGFuW3RpdGxlXj1cIl9zeXNfXCJdKSxcbmJvZHkuJHtTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTU30gLm1ldGFkYXRhLXByb3BlcnR5OmhhcygubWV0YWRhdGEtcHJvcGVydHkta2V5LWlubmVyW3RpdGxlXj1cIl9zeXNfXCJdKSB7XG4gIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDtcbn1cbi4ke1NZU1RFTV9QUk9QRVJUWV9ISURERU5fQ0xBU1N9IHtcbiAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50O1xufVxuYDtcbiIsICJpbnRlcmZhY2UgQ29vcmRpbmF0b3JPcHRpb25zIHtcbiAgbWF4Q29tcGxldGVkPzogbnVtYmVyO1xuICBjb21wbGV0ZWRUdGxNcz86IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIENhY2hlZFJlc3VsdCB7XG4gIGtleTogc3RyaW5nO1xuICB2YWx1ZTogdW5rbm93bjtcbiAgY29tcGxldGVkQXQ6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIEluZmxpZ2h0UmVzdWx0IHtcbiAga2V5OiBzdHJpbmc7XG4gIHByb21pc2U6IFByb21pc2U8dW5rbm93bj47XG59XG5cbmNsYXNzIFJlcXVlc3RDb25mbGljdEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb2RlID0gJ1JFUVVFU1RfSURfQ09ORkxJQ1QnO1xuICBzdGF0dXMgPSA0MDk7XG59XG5cbmV4cG9ydCBjbGFzcyBTeW5jQ29vcmRpbmF0b3Ige1xuICBwcml2YXRlIHJlYWRvbmx5IG1heENvbXBsZXRlZDogbnVtYmVyO1xuICBwcml2YXRlIHJlYWRvbmx5IGNvbXBsZXRlZFR0bE1zOiBudW1iZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgdGFpbHMgPSBuZXcgTWFwPHN0cmluZywgUHJvbWlzZTx2b2lkPj4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBpbmZsaWdodCA9IG5ldyBNYXA8c3RyaW5nLCBJbmZsaWdodFJlc3VsdD4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBjb21wbGV0ZWQgPSBuZXcgTWFwPHN0cmluZywgQ2FjaGVkUmVzdWx0PigpO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IENvb3JkaW5hdG9yT3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5tYXhDb21wbGV0ZWQgPSBNYXRoLm1heCgxLCBvcHRpb25zLm1heENvbXBsZXRlZCA/PyAxMDApO1xuICAgIHRoaXMuY29tcGxldGVkVHRsTXMgPSBNYXRoLm1heCgxXzAwMCwgb3B0aW9ucy5jb21wbGV0ZWRUdGxNcyA/PyAxMCAqIDYwXzAwMCk7XG4gIH1cblxuICBnZXQgY29tcGxldGVkQ291bnQoKTogbnVtYmVyIHtcbiAgICB0aGlzLnBydW5lQ29tcGxldGVkKCk7XG4gICAgcmV0dXJuIHRoaXMuY29tcGxldGVkLnNpemU7XG4gIH1cblxuICBhc3luYyBydW48VD4oa2V5OiBzdHJpbmcsIHJlcXVlc3RJZDogc3RyaW5nIHwgdW5kZWZpbmVkLCB0YXNrOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZEtleSA9IGtleS50cmltKCk7XG4gICAgY29uc3Qgbm9ybWFsaXplZFJlcXVlc3RJZCA9IHJlcXVlc3RJZD8udHJpbSgpO1xuICAgIGlmICghbm9ybWFsaXplZEtleSkgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRvciBrZXkgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAobm9ybWFsaXplZFJlcXVlc3RJZCAmJiAhL15bQS1aYS16MC05Ll86LV17MSwxMjh9JC8udGVzdChub3JtYWxpemVkUmVxdWVzdElkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdyZXF1ZXN0SWQgY29udGFpbnMgdW5zdXBwb3J0ZWQgY2hhcmFjdGVycyBvciBleGNlZWRzIDEyOCBjaGFyYWN0ZXJzJyk7XG4gICAgfVxuXG4gICAgdGhpcy5wcnVuZUNvbXBsZXRlZCgpO1xuICAgIGlmIChub3JtYWxpemVkUmVxdWVzdElkKSB7XG4gICAgICBjb25zdCBjYWNoZWQgPSB0aGlzLmNvbXBsZXRlZC5nZXQobm9ybWFsaXplZFJlcXVlc3RJZCk7XG4gICAgICBpZiAoY2FjaGVkKSB7XG4gICAgICAgIHRoaXMuYXNzZXJ0U2FtZUtleShub3JtYWxpemVkUmVxdWVzdElkLCBjYWNoZWQua2V5LCBub3JtYWxpemVkS2V5KTtcbiAgICAgICAgcmV0dXJuIGNhY2hlZC52YWx1ZSBhcyBUO1xuICAgICAgfVxuICAgICAgY29uc3QgYWN0aXZlID0gdGhpcy5pbmZsaWdodC5nZXQobm9ybWFsaXplZFJlcXVlc3RJZCk7XG4gICAgICBpZiAoYWN0aXZlKSB7XG4gICAgICAgIHRoaXMuYXNzZXJ0U2FtZUtleShub3JtYWxpemVkUmVxdWVzdElkLCBhY3RpdmUua2V5LCBub3JtYWxpemVkS2V5KTtcbiAgICAgICAgcmV0dXJuIGFjdGl2ZS5wcm9taXNlIGFzIFByb21pc2U8VD47XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgb3BlcmF0aW9uID0gdGhpcy5lbnF1ZXVlKG5vcm1hbGl6ZWRLZXksIHRhc2spO1xuICAgIGlmICghbm9ybWFsaXplZFJlcXVlc3RJZCkgcmV0dXJuIG9wZXJhdGlvbjtcblxuICAgIGNvbnN0IHRyYWNrZWQgPSBvcGVyYXRpb24udGhlbigodmFsdWUpID0+IHtcbiAgICAgIHRoaXMucmVtZW1iZXIobm9ybWFsaXplZFJlcXVlc3RJZCwgbm9ybWFsaXplZEtleSwgdmFsdWUpO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgdGhpcy5pbmZsaWdodC5kZWxldGUobm9ybWFsaXplZFJlcXVlc3RJZCk7XG4gICAgfSk7XG4gICAgdGhpcy5pbmZsaWdodC5zZXQobm9ybWFsaXplZFJlcXVlc3RJZCwgeyBrZXk6IG5vcm1hbGl6ZWRLZXksIHByb21pc2U6IHRyYWNrZWQgfSk7XG4gICAgcmV0dXJuIHRyYWNrZWQ7XG4gIH1cblxuICBwcml2YXRlIGVucXVldWU8VD4oa2V5OiBzdHJpbmcsIHRhc2s6ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBwcmV2aW91cyA9IHRoaXMudGFpbHMuZ2V0KGtleSkgPz8gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgbGV0IHJlbGVhc2UhOiAoKSA9PiB2b2lkO1xuICAgIGNvbnN0IHNsb3QgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgcmVsZWFzZSA9IHJlc29sdmU7XG4gICAgfSk7XG4gICAgY29uc3QgdGFpbCA9IHByZXZpb3VzLmNhdGNoKCgpID0+IHt9KS50aGVuKCgpID0+IHNsb3QpO1xuICAgIHRoaXMudGFpbHMuc2V0KGtleSwgdGFpbCk7XG5cbiAgICByZXR1cm4gcHJldmlvdXMuY2F0Y2goKCkgPT4ge30pLnRoZW4odGFzaykuZmluYWxseSgoKSA9PiB7XG4gICAgICByZWxlYXNlKCk7XG4gICAgICBpZiAodGhpcy50YWlscy5nZXQoa2V5KSA9PT0gdGFpbCkgdGhpcy50YWlscy5kZWxldGUoa2V5KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXNzZXJ0U2FtZUtleShyZXF1ZXN0SWQ6IHN0cmluZywgZXhpc3RpbmdLZXk6IHN0cmluZywgcmVxdWVzdGVkS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoZXhpc3RpbmdLZXkgIT09IHJlcXVlc3RlZEtleSkge1xuICAgICAgdGhyb3cgbmV3IFJlcXVlc3RDb25mbGljdEVycm9yKGByZXF1ZXN0SWQgJHtyZXF1ZXN0SWR9IGlzIGFscmVhZHkgYm91bmQgdG8gYW5vdGhlciBkb2N1bWVudGApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVtZW1iZXIocmVxdWVzdElkOiBzdHJpbmcsIGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMuY29tcGxldGVkLmRlbGV0ZShyZXF1ZXN0SWQpO1xuICAgIHRoaXMuY29tcGxldGVkLnNldChyZXF1ZXN0SWQsIHsga2V5LCB2YWx1ZSwgY29tcGxldGVkQXQ6IERhdGUubm93KCkgfSk7XG4gICAgd2hpbGUgKHRoaXMuY29tcGxldGVkLnNpemUgPiB0aGlzLm1heENvbXBsZXRlZCkge1xuICAgICAgY29uc3Qgb2xkZXN0ID0gdGhpcy5jb21wbGV0ZWQua2V5cygpLm5leHQoKS52YWx1ZSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgICBpZiAoIW9sZGVzdCkgYnJlYWs7XG4gICAgICB0aGlzLmNvbXBsZXRlZC5kZWxldGUob2xkZXN0KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBydW5lQ29tcGxldGVkKCk6IHZvaWQge1xuICAgIGNvbnN0IGN1dG9mZiA9IERhdGUubm93KCkgLSB0aGlzLmNvbXBsZXRlZFR0bE1zO1xuICAgIGZvciAoY29uc3QgW3JlcXVlc3RJZCwgZW50cnldIG9mIHRoaXMuY29tcGxldGVkKSB7XG4gICAgICBpZiAoZW50cnkuY29tcGxldGVkQXQgPj0gY3V0b2ZmKSBicmVhaztcbiAgICAgIHRoaXMuY29tcGxldGVkLmRlbGV0ZShyZXF1ZXN0SWQpO1xuICAgIH1cbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFVQSxJQUFBQSxvQkFBc0M7OztBQ1Z0Qyx5QkFBMkM7OztBQ29DcEMsSUFBTSxtQkFBdUM7QUFBQSxFQUNsRCxlQUFlO0FBQUEsRUFDZixNQUFNO0FBQUEsRUFDTixXQUFXO0FBQUEsRUFDWCxhQUFhO0FBQUEsRUFDYixZQUFZO0FBQUEsRUFDWixZQUFZO0FBQUEsRUFDWixvQkFBb0I7QUFBQSxFQUNwQixjQUFjO0FBQUEsRUFDZCxzQkFBc0I7QUFBQSxFQUN0QixTQUFTO0FBQUEsRUFDVCxtQkFBbUI7QUFBQSxFQUNuQixzQkFBc0I7QUFBQSxFQUN0QixnQkFBZ0IsQ0FBQztBQUNuQjs7O0FDckNBLElBQU0sZUFBZTtBQUNyQixJQUFNLFFBQVEsb0JBQUksSUFBa0IsQ0FBQyxTQUFTLFFBQVEsWUFBWSxZQUFZLFFBQVEsQ0FBQztBQUN2RixJQUFNLFdBQVcsb0JBQUksSUFBb0IsQ0FBQyxhQUFhLFVBQVUsU0FBUyxDQUFDO0FBRXBF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U0FBUyxPQUFPO0FBQ2QsV0FBSyxlQUFlO0FBQUEsUUFDbEIsT0FBTSxvQkFBSSxLQUFLLEdBQUUsWUFBWTtBQUFBLFFBQzdCO0FBQUEsUUFDQSxRQUFRO0FBQUEsUUFDUixXQUFZLE9BQThCLFFBQVE7QUFBQSxNQUNwRCxDQUFDO0FBQ0QsWUFBTTtBQUFBLElBQ1I7QUFBQSxFQUNGO0FBQUEsRUFFUSxlQUFlLFFBQXVDO0FBQzVELFNBQUssTUFBTSxjQUFjLGVBQWUsS0FBSyxNQUFNLGFBQWEsTUFBTTtBQUN0RSxTQUFLLFNBQVMsaUJBQWlCLEtBQUssTUFBTTtBQUMxQyxTQUFLLG1CQUFtQixLQUFLLGlCQUMxQixLQUFLLE1BQU0sS0FBSyxhQUFhLENBQUMsRUFDOUIsTUFBTSxDQUFDLFVBQVUsUUFBUSxLQUFLLHdDQUF3QyxLQUFLLENBQUM7QUFBQSxFQUNqRjtBQUNGO0FBR0EsSUFBTyxlQUFROyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iLCAibm9kZVdlYkNyeXB0byIsICJpbXBvcnRfb2JzaWRpYW4iLCAiY3JlYXRlSGFzaCIsICJyZXN1bHQiLCAiZGF0ZSIsICJTY2hlbWEiLCAibGluZSIsICJzdHJUYWciLCAiY2giLCAic3R5bGUiLCAibm9kZSIsICJqc29uIiwgInVud3JhcExhcmtFbnZlbG9wZSIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJwYXRoIiwgImltcG9ydF9ub2RlX2NyeXB0byIsICJwYXRoIiwgImltcG9ydF9vYnNpZGlhbiIsICJlbnN1cmVGb2xkZXIiLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAicnVuIiwgImltcG9ydF9vYnNpZGlhbiIsICJwYXRoIiwgInBhdGgiXQp9Cg==
