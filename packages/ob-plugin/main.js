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
  autoDeleteRegistry: true,
  cacheCleanup: "weekly",
  keepDecorativeImages: true,
  spaceId: "7651314150060067803",
  defaultNoteFolder: "3\uFE0F\u20E3\u9644\u4EF6\u6587\u4EF6/Lark",
  hideSystemProperties: true
};

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
    const { createHash } = require("node:crypto");
    return createHash("sha256").update(body, "utf8").digest("hex");
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
function isChanged(current, last) {
  if (!last)
    return true;
  return current !== last;
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
  const { cwd, retries = 3, timeout = 3e4, json: json2 = false } = options;
  const cliPath = process.env.__LARK_CLI_PATH__ || "lark-cli";
  let lastError = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const fullArgs = [...args];
      const execOpts = {
        encoding: "utf8",
        timeout,
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
      if (errMsg.includes("429") || errMsg.includes("ETIMEDOUT") || errMsg.includes("ECONNRESET") || errMsg.includes("socket hang up")) {
        const delay = Math.min(1e3 * Math.pow(2, attempt - 1), 1e4);
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
function overwriteDocXml(token, xmlContent, title, cwd) {
  const tmpDir = cwd || process.cwd();
  const tmpFile = path.join(tmpDir, "./.feishu-sync-temp.xml");
  const cleaned = stripVariationSelectors(xmlContent);
  fs.writeFileSync(tmpFile, cleaned, "utf8");
  try {
    run(["docs", "+update", "--doc", token, "--command", "overwrite", "--doc-format", "xml", "--content", `@./.feishu-sync-temp.xml`], { cwd: tmpDir });
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
      fs.unlinkSync(tmpFile);
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
    new import_obsidian2.Setting(containerEl).setName("\u5220\u9664\u81EA\u52A8\u767B\u8BB0").setDesc("\u5220\u9664\u542B feishu_id \u7684\u6587\u4EF6\u65F6\uFF0C\u81EA\u52A8\u767B\u8BB0\u5230\u98DE\u4E66\u591A\u7EF4\u8868\u683C").addToggle(
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
    const server = http.createServer(async (req, res) => {
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
      let body;
      if (req.method === "POST" || req.method === "PUT") {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const raw = Buffer.concat(chunks).toString("utf8");
        if (raw) {
          try {
            body = JSON.parse(raw);
          } catch {
            json(res, 400, { ok: false, code: "BAD_JSON", message: "Invalid JSON body" });
            return;
          }
        }
      }
      const token = req.headers[TOKEN_HEADER.toLowerCase()];
      if (ctxPath !== "/status" && !deps.validateToken(token ?? "")) {
        json(res, 401, { ok: false, code: "UNAUTHORIZED", message: "Invalid or missing X-Sync-Token" });
        return;
      }
      const handler = deps.routes.get(ctxPath);
      if (!handler) {
        json(res, 404, { ok: false, code: "NOT_FOUND", message: `Unknown path: ${ctxPath}` });
        return;
      }
      try {
        const result = await handler({
          method: req.method ?? "GET",
          url: fullUrl,
          path: ctxPath,
          query: urlObj.searchParams,
          body,
          token: token ?? ""
        });
        json(res, 200, result);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const code = err?.code ?? "INTERNAL";
        const status = err?.status ?? 500;
        console.error("[sync/server] handler error:", err);
        json(res, status, { ok: false, code, message });
      }
    });
    server.on("error", (err) => {
      reject(err);
    });
    server.listen(port, "127.0.0.1", () => {
      console.log(`[sync/server] listening on http://127.0.0.1:${port}`);
      resolve({
        stop: () => new Promise((res) => {
          server.close(() => {
            console.log(`[sync/server] stopped`);
            res();
          });
        })
      });
    });
  });
}

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
      larkVersion: state.larkCliVersion || null
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
function processFeishuMd(md, imgTokens) {
  return rewriteImagesToFeishuProto(md, imgTokens);
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
    let md;
    try {
      md = run(
        ["docs", "+fetch", "--doc", node_token, "--doc-format", "markdown"],
        { timeout: 6e4 }
      );
    } catch (err) {
      const info = space_id ? getWikiNodeInfo(node_token, space_id) : null;
      if (info?.obj_token) {
        md = run(
          ["docs", "+fetch", "--doc", info.obj_token, "--doc-format", "markdown"],
          { timeout: 6e4 }
        );
      } else {
        throw err;
      }
    }
    let xml = "";
    let objToken = req.obj_token ?? "";
    try {
      xml = run(
        ["docs", "+fetch", "--doc", node_token, "--doc-format", "xml", "--detail", "with-ids"],
        { timeout: 6e4 }
      );
      if (!objToken) {
        const titleIdMatch = xml.match(/<title[^>]*\bid="([A-Za-z0-9]+)"/);
        if (titleIdMatch) objToken = titleIdMatch[1];
      }
    } catch (err) {
      console.warn("[sync/fetch] xml fetch failed (image tokens may be missing):", err);
    }
    const meta = {
      ...xml ? calloutXmlToMeta(xml) : {},
      ...req.meta ?? {}
    };
    if (Object.keys(meta).length > 0) {
      deps.notice(`\u{1F4CB} \u63D0\u53D6\u5230 ${Object.keys(meta).length} \u4E2A\u5143\u6570\u636E\u5B57\u6BB5`);
    }
    const imgTokens = new Set(extractImgTokensFromXml(xml));
    let processedMd = processFeishuMd(md, imgTokens);
    if (xml) {
      processedMd = convertFeishuCalloutsToOB(processedMd);
    }
    const titleMatch = processedMd.match(/^#\s+(.+)$/m);
    let feishuTitle = titleMatch?.[1]?.trim() ?? node_token;
    const existingFile = await findUniqueVaultBinding(deps.app, node_token);
    const syncTime = (/* @__PURE__ */ new Date()).toISOString();
    let action;
    let finalPath;
    let encoding;
    if (existingFile) {
      action = "updated";
      const existing = await deps.app.vault.read(existingFile);
      const parsed = parseFile(existing);
      const merged = mergeFrontmatterForUpdate(
        parsed.frontmatter,
        node_token,
        objToken,
        feishuTitle,
        syncTime,
        meta
      );
      const content = assembleMd(merged, processedMd);
      await deps.app.vault.modify(existingFile, content);
      finalPath = existingFile.path;
      deps.notice(`\u270F \u5DF2\u66F4\u65B0 ${existingFile.name}`);
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
    deps.state.recentSyncs.unshift({
      time: syncTime,
      node_token,
      title: feishuTitle,
      path: finalPath,
      action
    });
    if (deps.state.recentSyncs.length > 50) {
      deps.state.recentSyncs = deps.state.recentSyncs.slice(0, 50);
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
    if (!req.force && !isChanged(parsed.hash, parsed.frontmatter.sync_hash)) {
      return {
        ok: true,
        action: "skipped",
        hash: parsed.hash,
        title
      };
    }
    deps.notice(`\u2B06 \u56DE\u5199\u98DE\u4E66 ${file.name}...`);
    const finalContent = buildPushbackContent(parsed);
    overwriteDocXml(docToken, finalContent, title);
    const syncTime = (/* @__PURE__ */ new Date()).toISOString();
    const updatedFm = {
      ...parsed.frontmatter,
      sync_hash: parsed.hash,
      sync_time: syncTime
    };
    const newContent = assembleMd(updatedFm, parsed.body);
    await deps.app.vault.modify(file, newContent);
    deps.notice(`\u2705 \u5DF2\u56DE\u5199 ${title}`);
    return {
      ok: true,
      action: "pushed",
      hash: parsed.hash,
      title
    };
  };
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
        (r) => `${r.action === "created" ? "\u2795" : r.action === "updated" ? "\u270F" : "\u274C"} ${r.title} \u2192 ${r.path}`
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
    this.syncCoordinator = new SyncCoordinator();
  }
  async onload() {
    let shouldSaveSettings = await this.loadSettings();
    this.state = {
      larkCliResolved: "",
      larkCliVersion: "",
      serverRunning: false,
      recentSyncs: []
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
      return this.syncCoordinator.run(documentKey, req?.requestId, () => this.syncCoordinator.run(directoryKey, void 0, () => fetchHandler(ctx)));
    });
    const clipHandler = createClipHandler({
      app: this.app,
      settings: this.settings,
      notice: (m) => new import_obsidian11.Notice(m)
    });
    routes.set("/clip", (ctx) => {
      const req = ctx.body;
      const key = req?.appendPath ? `clip:${req.appendPath}` : `clip:${req?.requestId ?? "anonymous"}`;
      return this.syncCoordinator.run(key, req?.requestId, () => clipHandler(ctx));
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
      return this.syncCoordinator.run(key, req?.requestId, () => pushbackHandler(ctx));
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzTWlncmF0aW9uLnRzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvc2V0dGluZ3NUYWIudHMiLCAic3JjL2xhcmsvY2xpLnRzIiwgIi4uL3NoYXJlZC9zcmMvdHlwZXMudHMiLCAiLi4vc2hhcmVkL3NyYy9wcm90b2NvbC50cyIsICIuLi9zaGFyZWQvc3JjL2hhc2gudHMiLCAiLi4vc2hhcmVkL3NyYy9maWxlbmFtZS50cyIsICIuLi9zaGFyZWQvc3JjL2ltYWdlLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvc3RyLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL251bGxfY29yZS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9udWxsX2pzb24udHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvbnVsbF95YW1sMTEudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvYm9vbF9jb3JlLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL2Jvb2xfanNvbi50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9ib29sX3lhbWwxMS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9pbnRfY29yZS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9pbnRfanNvbi50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9pbnRfeWFtbDExLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL2Zsb2F0X2NvcmUudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvZmxvYXRfanNvbi50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9mbG9hdF95YW1sMTEudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvbWVyZ2UudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvYmluYXJ5LnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL3RpbWVzdGFtcC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NlcXVlbmNlL3NlcS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvY29tbW9uL29iamVjdC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NlcXVlbmNlL29tYXAudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zZXF1ZW5jZS9wYWlycy50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL21hcHBpbmcvbWFwLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvbWFwcGluZy9zZXQudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3NjaGVtYS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL21hcHBpbmcvcmVhbF9tYXAudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9tYXBwaW5nL2xlZ2FjeV9tYXAudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL2NvbW1vbi9zbmlwcGV0LnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9jb21tb24vZXhjZXB0aW9uLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9wYXJzZXIvZXZlbnRzLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9wYXJzZXIvcGFyc2VyX3NjYWxhci50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvY29tbW9uL3RhZ25hbWUudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3BhcnNlci9jb25zdHJ1Y3Rvci50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvcGFyc2VyL3BhcnNlci50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvbG9hZC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvYXN0L25vZGVzLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9hc3QvZnJvbV9qcy50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvYXN0L3Zpc2l0LnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9hc3QvcHJlc2VudGVyLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9kdW1wLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9hc3QvZnJvbV9ldmVudHMudHMiLCAiLi4vc2hhcmVkL3NyYy95YW1sLnRzIiwgIi4uL3NoYXJlZC9zcmMvY2FsbG91dC50cyIsICJzcmMvbWFwcGluZy50cyIsICJzcmMvc2VydmVyLnRzIiwgInNyYy9oYW5kbGVycy9zdGF0dXNIYW5kbGVyLnRzIiwgInNyYy9oYW5kbGVycy90cmVlSGFuZGxlci50cyIsICJzcmMvaGFuZGxlcnMvZmV0Y2hIYW5kbGVyLnRzIiwgInNyYy9maWxlaW8vd3JpdGVyLnRzIiwgInNyYy9hdXRvUmVuYW1lLnRzIiwgInNyYy9iaW5kaW5nSW5kZXgudHMiLCAic3JjL3ZhdWx0QmluZGluZy50cyIsICJzcmMvdmF1bHRQYXRoLnRzIiwgInNyYy9oYW5kbGVycy9jbGlwSGFuZGxlci50cyIsICJzcmMvaGFuZGxlcnMvZXhpc3RzSGFuZGxlci50cyIsICJzcmMvaGFuZGxlcnMvcHVzaGJhY2tIYW5kbGVyLnRzIiwgInNyYy9jb21tYW5kcy50cyIsICJzcmMvZmV0Y2hFbnRyeXBvaW50cy50cyIsICJzcmMvaW1hZ2VSZW5kZXIudHMiLCAic3JjL3N5c3RlbVByb3BlcnRpZXMudHMiLCAic3JjL3N5bmNDb29yZGluYXRvci50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBPQiBcdTYzRDJcdTRFRjZcdTUxNjVcdTUzRTNcdTMwMDJcdTRGOURcdTYzNkVcdTY1QjlcdTY4NDggXHUwMEE3NC4xXHVGRjA4XHU2QTIxXHU1NzU3IEJcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdTgwNENcdThEMjNcdUZGMUFcbiAqIDEuIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RVx1RkYwOFx1OTk5Nlx1NkIyMVx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMFx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1x1RkYwOVxuICogMi4gXHU2M0EyXHU2RDRCIGxhcmstY2xpXG4gKiAzLiBcdTU0MkZcdTUyQThcdTY3MkNcdTU3MzAgSFRUUCBzZXJ2ZXJcdUZGMENcdTZDRThcdTUxOENcdThERUZcdTc1MzFcbiAqIDQuIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFx1MzAwMVx1OEJCRVx1N0Y2RVx1OTg3NVx1MzAwMVx1NTZGRVx1NzI0N1x1NkUzMlx1NjdEM1x1MzAwMVx1NTIyMFx1OTY2NFx1NzZEMVx1NTQyQ1xuICogNS4gXHU1Mzc4XHU4RjdEXHU2NUY2XHU1MDVDXHU2QjYyIHNlcnZlclxuICovXG5pbXBvcnQgeyBQbHVnaW4sIE5vdGljZSwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQge1xuICB0eXBlIEZlaXNodVN5bmNTZXR0aW5ncyxcbiAgdHlwZSBQbHVnaW5TdGF0ZSxcbiAgdHlwZSBSZWNlbnRTeW5jLFxufSBmcm9tICcuL3NldHRpbmdzLmpzJztcbmltcG9ydCB7IGdlbmVyYXRlU3luY1Rva2VuLCBtaWdyYXRlU2V0dGluZ3MgfSBmcm9tICcuL3NldHRpbmdzTWlncmF0aW9uLmpzJztcbmltcG9ydCB7IEZlaXNodVN5bmNTZXR0aW5nVGFiIH0gZnJvbSAnLi9zZXR0aW5nc1RhYi5qcyc7XG5pbXBvcnQgeyBzdGFydFNlcnZlciwgdHlwZSBTZXJ2ZXJEZXBzLCB0eXBlIFJvdXRlSGFuZGxlciB9IGZyb20gJy4vc2VydmVyLmpzJztcbmltcG9ydCB7IHJlc29sdmVDbGkgfSBmcm9tICcuL2xhcmsvY2xpLmpzJztcbmltcG9ydCB7IGNyZWF0ZVN0YXR1c0hhbmRsZXIgfSBmcm9tICcuL2hhbmRsZXJzL3N0YXR1c0hhbmRsZXIuanMnO1xuaW1wb3J0IHsgY3JlYXRlVHJlZUhhbmRsZXIgfSBmcm9tICcuL2hhbmRsZXJzL3RyZWVIYW5kbGVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZUZldGNoSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlcnMvZmV0Y2hIYW5kbGVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZUNsaXBIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9jbGlwSGFuZGxlci5qcyc7XG5pbXBvcnQgeyBjcmVhdGVFeGlzdHNIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9leGlzdHNIYW5kbGVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZVB1c2hiYWNrSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlcnMvcHVzaGJhY2tIYW5kbGVyLmpzJztcbmltcG9ydCB7IHJlZ2lzdGVyQ29tbWFuZHMgfSBmcm9tICcuL2NvbW1hbmRzLmpzJztcbmltcG9ydCB7IHJlZ2lzdGVyRmV0Y2hFbnRyeXBvaW50cyB9IGZyb20gJy4vZmV0Y2hFbnRyeXBvaW50cy5qcyc7XG5pbXBvcnQgeyByZWdpc3RlckltYWdlUmVuZGVyZXIsIGNsZWFudXBJbWFnZUNhY2hlIH0gZnJvbSAnLi9pbWFnZVJlbmRlci5qcyc7XG5pbXBvcnQgeyByZWZyZXNoTWFwcGluZyB9IGZyb20gJy4vbWFwcGluZy5qcyc7XG5pbXBvcnQge1xuICBpc1N5c3RlbVByb3BlcnR5S2V5LFxuICBTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTUyxcbiAgU1lTVEVNX1BST1BFUlRZX0NTUyxcbiAgU1lTVEVNX1BST1BFUlRZX0hJRERFTl9DTEFTUyxcbiAgU1lTVEVNX1BST1BFUlRZX1NUWUxFX0lELFxufSBmcm9tICcuL3N5c3RlbVByb3BlcnRpZXMuanMnO1xuaW1wb3J0IHsgU3luY0Nvb3JkaW5hdG9yIH0gZnJvbSAnLi9zeW5jQ29vcmRpbmF0b3IuanMnO1xuaW1wb3J0IHR5cGUgeyBDbGlwUmVxdWVzdCwgRmV0Y2hSZXF1ZXN0LCBQdXNoYmFja1JlcXVlc3QgfSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHsgZXh0cmFjdEZlaXNodUlkIH0gZnJvbSAnLi9iaW5kaW5nSW5kZXguanMnO1xuaW1wb3J0IHsgbm9ybWFsaXplVmF1bHREaXIsIG5vcm1hbGl6ZVZhdWx0TWFya2Rvd25QYXRoIH0gZnJvbSAnLi92YXVsdFBhdGguanMnO1xuXG5leHBvcnQgY2xhc3MgRmVpc2h1U3luY1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIHNldHRpbmdzITogRmVpc2h1U3luY1NldHRpbmdzO1xuICBzdGF0ZSE6IFBsdWdpblN0YXRlO1xuICBwcml2YXRlIHN0b3BTZXJ2ZXI/OiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICBwcml2YXRlIHN5c3RlbVByb3BlcnR5T2JzZXJ2ZXI/OiBNdXRhdGlvbk9ic2VydmVyO1xuICByZWFkb25seSBzeW5jQ29vcmRpbmF0b3IgPSBuZXcgU3luY0Nvb3JkaW5hdG9yKCk7XG5cbiAgYXN5bmMgb25sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBzaG91bGRTYXZlU2V0dGluZ3MgPSBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXG4gICAgLy8gXHU4RkQwXHU4ODRDXHU2NUY2XHU3MkI2XHU2MDAxXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGxhcmtDbGlSZXNvbHZlZDogJycsXG4gICAgICBsYXJrQ2xpVmVyc2lvbjogJycsXG4gICAgICBzZXJ2ZXJSdW5uaW5nOiBmYWxzZSxcbiAgICAgIHJlY2VudFN5bmNzOiBbXSBhcyBSZWNlbnRTeW5jW10sXG4gICAgfTtcblxuICAgIC8vIFx1OTk5Nlx1NkIyMVx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMFx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1xuICAgIGlmICghdGhpcy5zZXR0aW5ncy5zeW5jVG9rZW4pIHtcbiAgICAgIHRoaXMuc2V0dGluZ3Muc3luY1Rva2VuID0gZ2VuZXJhdGVTeW5jVG9rZW4oKTtcbiAgICAgIHNob3VsZFNhdmVTZXR0aW5ncyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChzaG91bGRTYXZlU2V0dGluZ3MpIHtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKCk7XG4gICAgfVxuICAgIHRoaXMuYXBwbHlTeXN0ZW1Qcm9wZXJ0aWVzVmlzaWJpbGl0eSgpO1xuXG4gICAgLy8gXHU2M0EyXHU2RDRCIGxhcmstY2xpXG4gICAgY29uc3QgbGFya0luZm8gPSByZXNvbHZlQ2xpKHRoaXMuc2V0dGluZ3MubGFya0NsaVBhdGggfHwgdW5kZWZpbmVkKTtcbiAgICBpZiAobGFya0luZm8pIHtcbiAgICAgIHRoaXMuc3RhdGUubGFya0NsaVJlc29sdmVkID0gbGFya0luZm8ucGF0aDtcbiAgICAgIHRoaXMuc3RhdGUubGFya0NsaVZlcnNpb24gPSBsYXJrSW5mby52ZXJzaW9uO1xuICAgICAgcHJvY2Vzcy5lbnYuX19MQVJLX0NMSV9QQVRIX18gPSBsYXJrSW5mby5wYXRoO1xuICAgICAgY29uc29sZS5sb2coYFtmcy1UQl0gbGFyay1jbGk6ICR7bGFya0luZm8udmVyc2lvbn0gQCAke2xhcmtJbmZvLnBhdGh9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybignW2ZzLVRCXSBsYXJrLWNsaSBub3QgZm91bmQgKG5lZWQgPj0gMS4wLjUyKScpO1xuICAgIH1cblxuICAgIC8vIFx1OEJCRVx1N0Y2RVx1OTg3NVxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgRmVpc2h1U3luY1NldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcblxuICAgIC8vIFx1NTQ3RFx1NEVFNFxuICAgIHJlZ2lzdGVyQ29tbWFuZHModGhpcyk7XG4gICAgcmVnaXN0ZXJGZXRjaEVudHJ5cG9pbnRzKHRoaXMpO1xuXG4gICAgLy8gXHU1NkZFXHU3MjQ3XHU2RTMyXHU2N0QzXG4gICAgcmVnaXN0ZXJJbWFnZVJlbmRlcmVyKHRoaXMpO1xuXG4gICAgLy8gXHU1NDJGXHU1MkE4IEhUVFAgc2VydmVyXG4gICAgYXdhaXQgdGhpcy5zdGFydEh0dHBTZXJ2ZXIoKTtcblxuICAgIC8vIHJpYmJvbiBcdTU2RkVcdTY4MDdcbiAgICB0aGlzLmFkZFJpYmJvbkljb24oJ3JlZnJlc2gtY3cnLCAnXHU5OERFXHU0RTY2XHU1NDBDXHU2QjY1JywgYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgcmVmcmVzaE1hcHBpbmcodGhpcy5hcHAsIHRoaXMuc2V0dGluZ3Muc3BhY2VJZCk7XG4gICAgfSk7XG5cbiAgICAvLyBcdTU0MkZcdTUyQThcdTY1RjZcdTZFMDVcdTc0MDZcdTRFMDBcdTZCMjFcdThGQzdcdTY3MUZcdTdGMTNcdTVCNThcbiAgICB0aGlzLmFwcC53b3Jrc3BhY2Uub25MYXlvdXRSZWFkeSgoKSA9PiB7XG4gICAgICBjbGVhbnVwSW1hZ2VDYWNoZSh0aGlzLCB0aGlzLnNldHRpbmdzLmNhY2hlQ2xlYW51cCkuY2F0Y2goKCkgPT4ge30pO1xuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coYFtmcy1UQl0gJHt0aGlzLm1hbmlmZXN0LnZlcnNpb259IGxvYWRlZCBvbiBwb3J0ICR7dGhpcy5zZXR0aW5ncy5wb3J0fWApO1xuICB9XG5cbiAgYXN5bmMgb251bmxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5zeXN0ZW1Qcm9wZXJ0eU9ic2VydmVyPy5kaXNjb25uZWN0KCk7XG4gICAgdGhpcy5zeXN0ZW1Qcm9wZXJ0eU9ic2VydmVyID0gdW5kZWZpbmVkO1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZShTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTUyk7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoU1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1MpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFNZU1RFTV9QUk9QRVJUWV9TVFlMRV9JRCk/LnJlbW92ZSgpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYC4ke1NZU1RFTV9QUk9QRVJUWV9ISURERU5fQ0xBU1N9YCkuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFNZU1RFTV9QUk9QRVJUWV9ISURERU5fQ0xBU1MpO1xuICAgIH0pO1xuICAgIGlmICh0aGlzLnN0b3BTZXJ2ZXIpIHtcbiAgICAgIGF3YWl0IHRoaXMuc3RvcFNlcnZlcigpO1xuICAgICAgdGhpcy5zdG9wU2VydmVyID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnW2ZzLVRCXSB1bmxvYWRlZCcpO1xuICB9XG5cbiAgYXN5bmMgbG9hZFNldHRpbmdzKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IG1pZ3JhdGlvbiA9IG1pZ3JhdGVTZXR0aW5ncyhhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuICAgIHRoaXMuc2V0dGluZ3MgPSBtaWdyYXRpb24uc2V0dGluZ3M7XG4gICAgcmV0dXJuIG1pZ3JhdGlvbi5jaGFuZ2VkO1xuICB9XG5cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cblxuICBhc3luYyBkb2N1bWVudENvb3JkaW5hdGlvbktleShub2RlVG9rZW4/OiBzdHJpbmcsIHBhdGg/OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGlmIChub2RlVG9rZW4pIHJldHVybiBgZG9jdW1lbnQ6JHtub2RlVG9rZW59YDtcbiAgICBpZiAocGF0aCkge1xuICAgICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBub3JtYWxpemVWYXVsdE1hcmtkb3duUGF0aChwYXRoKTtcbiAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgobm9ybWFsaXplZFBhdGgpO1xuICAgICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICBjb25zdCBmZWlzaHVJZCA9IGV4dHJhY3RGZWlzaHVJZChhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpKTtcbiAgICAgICAgaWYgKGZlaXNodUlkKSByZXR1cm4gYGRvY3VtZW50OiR7ZmVpc2h1SWR9YDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBgcGF0aDoke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgfVxuICAgIHJldHVybiAnZG9jdW1lbnQ6bWlzc2luZyc7XG4gIH1cblxuICBhcHBseVN5c3RlbVByb3BlcnRpZXNWaXNpYmlsaXR5KCk6IHZvaWQge1xuICAgIGNvbnN0IGVuYWJsZWQgPSB0aGlzLnNldHRpbmdzLmhpZGVTeXN0ZW1Qcm9wZXJ0aWVzID8/IHRydWU7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKFNZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTLCBlbmFibGVkKTtcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTUywgZW5hYmxlZCk7XG5cbiAgICBsZXQgc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoU1lTVEVNX1BST1BFUlRZX1NUWUxFX0lEKTtcbiAgICBpZiAoIXN0eWxlRWxlbWVudCkge1xuICAgICAgc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgIHN0eWxlRWxlbWVudC5pZCA9IFNZU1RFTV9QUk9QRVJUWV9TVFlMRV9JRDtcbiAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gICAgc3R5bGVFbGVtZW50LnRleHRDb250ZW50ID0gZW5hYmxlZCA/IFNZU1RFTV9QUk9QRVJUWV9DU1MgOiAnJztcblxuICAgIHRoaXMuc3lzdGVtUHJvcGVydHlPYnNlcnZlcj8uZGlzY29ubmVjdCgpO1xuICAgIHRoaXMuc3lzdGVtUHJvcGVydHlPYnNlcnZlciA9IHVuZGVmaW5lZDtcbiAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYC4ke1NZU1RFTV9QUk9QRVJUWV9ISURERU5fQ0xBU1N9YCkuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoU1lTVEVNX1BST1BFUlRZX0hJRERFTl9DTEFTUyk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnJlZnJlc2hTeXN0ZW1Qcm9wZXJ0eURvbVZpc2liaWxpdHkoKTtcbiAgICB0aGlzLnN5c3RlbVByb3BlcnR5T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICB0aGlzLnJlZnJlc2hTeXN0ZW1Qcm9wZXJ0eURvbVZpc2liaWxpdHkoKTtcbiAgICB9KTtcbiAgICB0aGlzLnN5c3RlbVByb3BlcnR5T2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydkYXRhLXByb3BlcnR5LWtleScsICdkYXRhLXByb3BlcnR5LW5hbWUnLCAndmFsdWUnLCAndGl0bGUnLCAnYXJpYS1sYWJlbCddLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZWZyZXNoU3lzdGVtUHJvcGVydHlEb21WaXNpYmlsaXR5KCk6IHZvaWQge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcubWV0YWRhdGEtcHJvcGVydHknKS5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICBjb25zdCBpbnB1dCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihcbiAgICAgICAgJy5tZXRhZGF0YS1wcm9wZXJ0eS1rZXktaW5wdXQsIC5tZXRhZGF0YS1wcm9wZXJ0eS1rZXkgaW5wdXQsIGlucHV0JyxcbiAgICAgICk7XG4gICAgICBjb25zdCBrZXlOb2RlID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcbiAgICAgICAgJy5tZXRhZGF0YS1wcm9wZXJ0eS1rZXksIC5tZXRhZGF0YS1wcm9wZXJ0eS1rZXktaW5uZXIsIC5tZXRhZGF0YS1wcm9wZXJ0eS1sYWJlbCcsXG4gICAgICApO1xuICAgICAgY29uc3QgdmFsdWVzID0gW1xuICAgICAgICBlbGVtZW50LmRhdGFzZXQucHJvcGVydHlLZXksXG4gICAgICAgIGVsZW1lbnQuZGF0YXNldC5wcm9wZXJ0eU5hbWUsXG4gICAgICAgIGlucHV0Py52YWx1ZSxcbiAgICAgICAgaW5wdXQ/LmdldEF0dHJpYnV0ZSgndmFsdWUnKSxcbiAgICAgICAgaW5wdXQ/LmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcpLFxuICAgICAgICBrZXlOb2RlPy50aXRsZSxcbiAgICAgICAga2V5Tm9kZT8udGV4dENvbnRlbnQsXG4gICAgICBdO1xuICAgICAgY29uc3Qgc2hvdWxkSGlkZSA9IHZhbHVlcy5zb21lKGlzU3lzdGVtUHJvcGVydHlLZXkpO1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFNZU1RFTV9QUk9QRVJUWV9ISURERU5fQ0xBU1MsIHNob3VsZEhpZGUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFx1NTQyRlx1NTJBOCBIVFRQIHNlcnZlclx1RkYwQ1x1NkNFOFx1NTE4Q1x1NjI0MFx1NjcwOVx1OERFRlx1NzUzMVx1MzAwMiAqL1xuICBwcml2YXRlIGFzeW5jIHN0YXJ0SHR0cFNlcnZlcigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCByb3V0ZXMgPSBuZXcgTWFwPHN0cmluZywgUm91dGVIYW5kbGVyPigpO1xuXG4gICAgY29uc3QgZGVwczogU2VydmVyRGVwcyA9IHtcbiAgICAgIHZhbGlkYXRlVG9rZW46ICh0b2tlbikgPT4gdG9rZW4gPT09IHRoaXMuc2V0dGluZ3Muc3luY1Rva2VuLFxuICAgICAgcm91dGVzLFxuICAgIH07XG5cbiAgICAvLyBcdTZDRThcdTUxOENcdThERUZcdTc1MzFcbiAgICByb3V0ZXMuc2V0KCcvc3RhdHVzJywgY3JlYXRlU3RhdHVzSGFuZGxlcih0aGlzLm1hbmlmZXN0LnZlcnNpb24sIHRoaXMuYXBwLnZhdWx0LmdldE5hbWUoKSwgdGhpcy5zdGF0ZSkpO1xuICAgIHJvdXRlcy5zZXQoJy90cmVlJywgY3JlYXRlVHJlZUhhbmRsZXIodGhpcy5hcHApKTtcbiAgICBjb25zdCBmZXRjaEhhbmRsZXIgPSBjcmVhdGVGZXRjaEhhbmRsZXIoe1xuICAgICAgYXBwOiB0aGlzLmFwcCxcbiAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxuICAgICAgc3RhdGU6IHRoaXMuc3RhdGUsXG4gICAgICBub3RpY2U6IChtKSA9PiBuZXcgTm90aWNlKG0pLFxuICAgIH0pO1xuICAgIHJvdXRlcy5zZXQoJy9mZXRjaCcsIChjdHgpID0+IHtcbiAgICAgIGNvbnN0IHJlcSA9IGN0eC5ib2R5IGFzIEZldGNoUmVxdWVzdDtcbiAgICAgIGNvbnN0IGRvY3VtZW50S2V5ID0gYGRvY3VtZW50OiR7cmVxPy5ub2RlX3Rva2VuID8/ICcnfWA7XG4gICAgICBjb25zdCBkaXJlY3RvcnlLZXkgPSBgZGlyZWN0b3J5OiR7bm9ybWFsaXplVmF1bHREaXIocmVxPy5kaXIgPz8gdGhpcy5zZXR0aW5ncy5kZWZhdWx0RGlyKX1gO1xuICAgICAgcmV0dXJuIHRoaXMuc3luY0Nvb3JkaW5hdG9yLnJ1bihkb2N1bWVudEtleSwgcmVxPy5yZXF1ZXN0SWQsICgpID0+XG4gICAgICAgIHRoaXMuc3luY0Nvb3JkaW5hdG9yLnJ1bihkaXJlY3RvcnlLZXksIHVuZGVmaW5lZCwgKCkgPT4gZmV0Y2hIYW5kbGVyKGN0eCkpKTtcbiAgICB9KTtcbiAgICBjb25zdCBjbGlwSGFuZGxlciA9IGNyZWF0ZUNsaXBIYW5kbGVyKHtcbiAgICAgIGFwcDogdGhpcy5hcHAsXG4gICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5ncyxcbiAgICAgIG5vdGljZTogKG0pID0+IG5ldyBOb3RpY2UobSksXG4gICAgfSk7XG4gICAgcm91dGVzLnNldCgnL2NsaXAnLCAoY3R4KSA9PiB7XG4gICAgICBjb25zdCByZXEgPSBjdHguYm9keSBhcyBDbGlwUmVxdWVzdDtcbiAgICAgIGNvbnN0IGtleSA9IHJlcT8uYXBwZW5kUGF0aCA/IGBjbGlwOiR7cmVxLmFwcGVuZFBhdGh9YCA6IGBjbGlwOiR7cmVxPy5yZXF1ZXN0SWQgPz8gJ2Fub255bW91cyd9YDtcbiAgICAgIHJldHVybiB0aGlzLnN5bmNDb29yZGluYXRvci5ydW4oa2V5LCByZXE/LnJlcXVlc3RJZCwgKCkgPT4gY2xpcEhhbmRsZXIoY3R4KSk7XG4gICAgfSk7XG4gICAgcm91dGVzLnNldCgnL2V4aXN0cycsIGNyZWF0ZUV4aXN0c0hhbmRsZXIodGhpcy5hcHApKTtcbiAgICBjb25zdCBwdXNoYmFja0hhbmRsZXIgPSBjcmVhdGVQdXNoYmFja0hhbmRsZXIoe1xuICAgICAgYXBwOiB0aGlzLmFwcCxcbiAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxuICAgICAgbm90aWNlOiAobSkgPT4gbmV3IE5vdGljZShtKSxcbiAgICB9KTtcbiAgICByb3V0ZXMuc2V0KCcvcHVzaGJhY2snLCBhc3luYyAoY3R4KSA9PiB7XG4gICAgICBjb25zdCByZXEgPSBjdHguYm9keSBhcyBQdXNoYmFja1JlcXVlc3Q7XG4gICAgICBjb25zdCBrZXkgPSBhd2FpdCB0aGlzLmRvY3VtZW50Q29vcmRpbmF0aW9uS2V5KHJlcT8ubm9kZV90b2tlbiwgcmVxPy5wYXRoKTtcbiAgICAgIHJldHVybiB0aGlzLnN5bmNDb29yZGluYXRvci5ydW4oa2V5LCByZXE/LnJlcXVlc3RJZCwgKCkgPT4gcHVzaGJhY2tIYW5kbGVyKGN0eCkpO1xuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3RvcCB9ID0gYXdhaXQgc3RhcnRTZXJ2ZXIodGhpcy5zZXR0aW5ncy5wb3J0LCBkZXBzKTtcbiAgICAgIHRoaXMuc3RvcFNlcnZlciA9IHN0b3A7XG4gICAgICB0aGlzLnN0YXRlLnNlcnZlclJ1bm5pbmcgPSB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc3QgbXNnID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpO1xuICAgICAgbmV3IE5vdGljZShgXHUyNzRDIEhUVFAgc2VydmVyIFx1NTQyRlx1NTJBOFx1NTkzMVx1OEQyNVx1RkYwOFx1N0FFRlx1NTNFMyAke3RoaXMuc2V0dGluZ3MucG9ydH1cdUZGMDlcdUZGMUEke21zZ31gKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tmcy1UQl0gc2VydmVyIHN0YXJ0IGZhaWxlZDonLCBlcnIpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBPYnNpZGlhbiBcdTYzRDJcdTRFRjZcdTUxNjVcdTUzRTNcdUZGMUFcdTVGQzVcdTk4N0JcdTlFRDhcdThCQTRcdTVCRkNcdTUxRkEgUGx1Z2luIFx1NUI1MFx1N0M3QlxuZXhwb3J0IGRlZmF1bHQgRmVpc2h1U3luY1BsdWdpbjtcbiIsICJpbXBvcnQgeyB3ZWJjcnlwdG8gYXMgbm9kZVdlYkNyeXB0byB9IGZyb20gJ25vZGU6Y3J5cHRvJztcblxuaW1wb3J0IHtcbiAgREVGQVVMVF9TRVRUSU5HUyxcbiAgdHlwZSBGZWlzaHVTeW5jU2V0dGluZ3MsXG59IGZyb20gJy4vc2V0dGluZ3MuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNldHRpbmdzTWlncmF0aW9uUmVzdWx0IHtcbiAgc2V0dGluZ3M6IEZlaXNodVN5bmNTZXR0aW5ncztcbiAgY2hhbmdlZDogYm9vbGVhbjtcbn1cblxudHlwZSBEYXRhUmVjb3JkID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbmNvbnN0IENBQ0hFX0NMRUFOVVBfVkFMVUVTID0gbmV3IFNldChbXG4gICdkYWlseScsXG4gICd3ZWVrbHknLFxuICAnbW9udGhseScsXG4gICduZXZlcicsXG5dKTtcblxuLyoqXG4gKiBcdTVDMDZcdTVGNTNcdTUyNERcdTYyNDFcdTVFNzNcdThCQkVcdTdGNkVcdTYyMTZcdTY1RTdcdTcyNDhcdTVENENcdTU5NTdcdThCQkVcdTdGNkVcdTY1MzZcdTY1NUJcdTRFM0Egc2NoZW1hIHYxXHUzMDAyXG4gKiBcdTUxRkRcdTY1NzBcdTRFMERcdTRGRUVcdTY1MzlcdThGOTNcdTUxNjVcdUZGMENcdTRFNUZcdTRFMERcdThCQjBcdTVGNTVcdTRFRkJcdTRGNTVcdThCQkVcdTdGNkVcdTUwM0NcdTMwMDJcdTY2NkVcdTkwMUEgZ2V0dGVyIFx1NEYxQVx1ODhBQlx1OERGM1x1OEZDN1x1RkYxQlxuICogUHJveHkgdHJhcCBcdTUzRUZcdTgwRkRcdTYyNjdcdTg4NENcdUZGMENcdTRGNDYgdHJhcCBcdTVGMDJcdTVFMzhcdTRGMUFcdTg4QUJcdTYzNTVcdTgzQjdcdTVFNzZcdTVCODlcdTUxNjhcdTU2REVcdTkwMDBcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pZ3JhdGVTZXR0aW5ncyhpbnB1dDogdW5rbm93bik6IFNldHRpbmdzTWlncmF0aW9uUmVzdWx0IHtcbiAgY29uc3Qgc291cmNlID0gY29weU93bkRhdGEoaW5wdXQpO1xuICBjb25zdCBmZWlzaHVTeW5jID0gY29weU93bkRhdGEoc291cmNlPy5mZWlzaHVTeW5jKTtcbiAgY29uc3QgcnVudGltZUxhcmtEb2MgPSBjb3B5T3duRGF0YShzb3VyY2U/Ll9sYXJrRG9jKTtcbiAgY29uc3QgbGVnYWN5TGFya0RvYyA9IGNvcHlPd25EYXRhKHNvdXJjZT8ubGFya0RvYyk7XG4gIGNvbnN0IG1pZ3JhdGVkID0gc291cmNlID8gY29weVJlY29yZChzb3VyY2UpIDoge307XG5cbiAgbWlncmF0ZWQuc2NoZW1hVmVyc2lvbiA9IDE7XG4gIG1pZ3JhdGVkLnBvcnQgPSBmaXJzdFBvcnQoc291cmNlPy5wb3J0LCBmZWlzaHVTeW5jPy5wb3J0KSA/PyBERUZBVUxUX1NFVFRJTkdTLnBvcnQ7XG4gIG1pZ3JhdGVkLnN5bmNUb2tlbiA9IGZpcnN0Tm9uRW1wdHlTdHJpbmcoc291cmNlPy5zeW5jVG9rZW4sIGZlaXNodVN5bmM/LnN5bmNUb2tlbilcbiAgICA/PyBERUZBVUxUX1NFVFRJTkdTLnN5bmNUb2tlbjtcbiAgbWlncmF0ZWQubGFya0NsaVBhdGggPSBmaXJzdE5vbkVtcHR5U3RyaW5nKFxuICAgIHNvdXJjZT8ubGFya0NsaVBhdGgsXG4gICAgcnVudGltZUxhcmtEb2M/LmxhcmtDbGlQYXRoLFxuICAgIGxlZ2FjeUxhcmtEb2M/LmxhcmtDbGlQYXRoLFxuICAgIGZlaXNodVN5bmM/LmxhcmtDbGlQYXRoLFxuICApID8/IERFRkFVTFRfU0VUVElOR1MubGFya0NsaVBhdGg7XG5cbiAgY29uc3QgZGVmYXVsdERpciA9IGZpcnN0Tm9uRW1wdHlTdHJpbmcoXG4gICAgc291cmNlPy5kZWZhdWx0RGlyLFxuICAgIGZlaXNodVN5bmM/LmRlZmF1bHREaXIsXG4gICkgPz8gREVGQVVMVF9TRVRUSU5HUy5kZWZhdWx0RGlyO1xuICBtaWdyYXRlZC5kZWZhdWx0RGlyID0gZGVmYXVsdERpcjtcbiAgbWlncmF0ZWQuZGVmYXVsdE5vdGVGb2xkZXIgPSBmaXJzdE5vbkVtcHR5U3RyaW5nKFxuICAgIHNvdXJjZT8uZGVmYXVsdE5vdGVGb2xkZXIsXG4gICAgcnVudGltZUxhcmtEb2M/LmRlZmF1bHROb3RlRm9sZGVyLFxuICAgIGxlZ2FjeUxhcmtEb2M/LmRlZmF1bHROb3RlRm9sZGVyLFxuICApID8/IERFRkFVTFRfU0VUVElOR1MuZGVmYXVsdE5vdGVGb2xkZXI7XG5cbiAgY29uc3QgbGVnYWN5QXV0b1JlbmFtZSA9IGNvcHlPd25EYXRhKHNvdXJjZT8uYXV0b1JlbmFtZSk7XG4gIGlmIChsZWdhY3lBdXRvUmVuYW1lICYmIHNvdXJjZT8uX2F1dG9SZW5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgIG1pZ3JhdGVkLl9hdXRvUmVuYW1lID0gc291cmNlPy5hdXRvUmVuYW1lO1xuICB9XG4gIG1pZ3JhdGVkLmF1dG9SZW5hbWUgPSBhdXRvbWF0aWNCZWhhdmlvcihcbiAgICBbc291cmNlLCBmZWlzaHVTeW5jXSxcbiAgICAnYXV0b1JlbmFtZScsXG4gICAgREVGQVVMVF9TRVRUSU5HUy5hdXRvUmVuYW1lLFxuICApO1xuICBtaWdyYXRlZC5hdXRvRGVsZXRlUmVnaXN0cnkgPSBhdXRvbWF0aWNCZWhhdmlvcihcbiAgICBbc291cmNlLCBmZWlzaHVTeW5jXSxcbiAgICAnYXV0b0RlbGV0ZVJlZ2lzdHJ5JyxcbiAgICBERUZBVUxUX1NFVFRJTkdTLmF1dG9EZWxldGVSZWdpc3RyeSxcbiAgKTtcbiAgbWlncmF0ZWQuY2FjaGVDbGVhbnVwID0gZmlyc3RDYWNoZUNsZWFudXAoXG4gICAgc291cmNlPy5jYWNoZUNsZWFudXAsXG4gICAgZmVpc2h1U3luYz8uY2FjaGVDbGVhbnVwLFxuICApID8/IERFRkFVTFRfU0VUVElOR1MuY2FjaGVDbGVhbnVwO1xuICBtaWdyYXRlZC5rZWVwRGVjb3JhdGl2ZUltYWdlcyA9IGZpcnN0Qm9vbGVhbihcbiAgICBzb3VyY2U/LmtlZXBEZWNvcmF0aXZlSW1hZ2VzLFxuICAgIGZlaXNodVN5bmM/LmtlZXBEZWNvcmF0aXZlSW1hZ2VzLFxuICApID8/IERFRkFVTFRfU0VUVElOR1Mua2VlcERlY29yYXRpdmVJbWFnZXM7XG4gIG1pZ3JhdGVkLnNwYWNlSWQgPSBmaXJzdE5vbkVtcHR5U3RyaW5nKHNvdXJjZT8uc3BhY2VJZCwgZmVpc2h1U3luYz8uc3BhY2VJZClcbiAgICA/PyBERUZBVUxUX1NFVFRJTkdTLnNwYWNlSWQ7XG4gIG1pZ3JhdGVkLmhpZGVTeXN0ZW1Qcm9wZXJ0aWVzID0gZmlyc3RCb29sZWFuKFxuICAgIHNvdXJjZT8uaGlkZVN5c3RlbVByb3BlcnRpZXMsXG4gICAgZmVpc2h1U3luYz8uaGlkZVN5c3RlbVByb3BlcnRpZXMsXG4gICkgPz8gREVGQVVMVF9TRVRUSU5HUy5oaWRlU3lzdGVtUHJvcGVydGllcztcblxuICByZXR1cm4ge1xuICAgIHNldHRpbmdzOiBtaWdyYXRlZCBhcyBGZWlzaHVTeW5jU2V0dGluZ3MsXG4gICAgY2hhbmdlZDogIXNhbWVEYXRhKHNvdXJjZSwgbWlncmF0ZWQpLFxuICB9O1xufVxuXG4vKiogXHU3NTFGXHU2MjEwIDMyIFx1NUI1N1x1ODI4Mlx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1x1RkYxQk9ic2lkaWFuIFx1NjVFMCBXZWIgQ3J5cHRvIFx1NTE2OFx1NUM0MFx1OTFDRlx1NjVGNlx1NTZERVx1OTAwMFx1NTIzMCBOb2RlXHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTeW5jVG9rZW4oKTogc3RyaW5nIHtcbiAgY29uc3QgcmFuZG9tU291cmNlID0gZ2xvYmFsVGhpcy5jcnlwdG8gPz8gbm9kZVdlYkNyeXB0byBhcyB1bmtub3duIGFzIENyeXB0bztcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheSgzMik7XG4gIHJhbmRvbVNvdXJjZS5nZXRSYW5kb21WYWx1ZXMoYnl0ZXMpO1xuICByZXR1cm4gQXJyYXkuZnJvbShieXRlcywgKGJ5dGUpID0+IGJ5dGUudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xufVxuXG4vKipcbiAqIFx1NTNFQVx1NTkwRFx1NTIzNlx1ODFFQVx1NjcwOVx1NTNFRlx1Njc5QVx1NEUzRVx1NjU3MFx1NjM2RVx1NUM1RVx1NjAyN1x1RkYwQ1x1NjY2RVx1OTAxQSBnZXR0ZXIgXHU0RTBEXHU0RjFBXHU4OEFCXHU4QkZCXHU1M0Q2XHUzMDAyXG4gKiBQcm94eSBcdTc2ODQgb3duS2V5cy9nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgdHJhcCBcdTRFQ0RcdTUzRUZcdTgwRkRcdTYyNjdcdTg4NENcdUZGMENcdTUxNzZcdTVGMDJcdTVFMzhcdTU3MjhcdTZCNjRcdTYzNTVcdTgzQjdcdTMwMDJcbiAqL1xuZnVuY3Rpb24gY29weU93bkRhdGEodmFsdWU6IHVua25vd24pOiBEYXRhUmVjb3JkIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcgfHwgdmFsdWUgPT09IG51bGwgfHwgQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQ6IERhdGFSZWNvcmQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIGRlc2NyaXB0b3JdIG9mIE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHZhbHVlKSkpIHtcbiAgICAgIGlmIChkZXNjcmlwdG9yLmVudW1lcmFibGUgJiYgJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSB7XG4gICAgICAgIGRlZmluZURhdGEocmVzdWx0LCBrZXksIGRlc2NyaXB0b3IudmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvcHlSZWNvcmQoc291cmNlOiBEYXRhUmVjb3JkKTogRGF0YVJlY29yZCB7XG4gIGNvbnN0IHJlc3VsdDogRGF0YVJlY29yZCA9IHt9O1xuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzb3VyY2UpKSB7XG4gICAgZGVmaW5lRGF0YShyZXN1bHQsIGtleSwgdmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGRlZmluZURhdGEodGFyZ2V0OiBEYXRhUmVjb3JkLCBrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCB7XG4gICAgdmFsdWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBmaXJzdE5vbkVtcHR5U3RyaW5nKC4uLnZhbHVlczogdW5rbm93bltdKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHZhbHVlcy5maW5kKCh2YWx1ZSk6IHZhbHVlIGlzIHN0cmluZyA9PiAoXG4gICAgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS50cmltKCkubGVuZ3RoID4gMFxuICApKTtcbn1cblxuZnVuY3Rpb24gZmlyc3RCb29sZWFuKC4uLnZhbHVlczogdW5rbm93bltdKTogYm9vbGVhbiB8IHVuZGVmaW5lZCB7XG4gIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VCb29sZWFuKHZhbHVlKTtcbiAgICBpZiAocGFyc2VkICE9PSB1bmRlZmluZWQpIHJldHVybiBwYXJzZWQ7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZmlyc3RQb3J0KC4uLnZhbHVlczogdW5rbm93bltdKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICBjb25zdCBjYW5kaWRhdGUgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3QodmFsdWUudHJpbSgpKVxuICAgICAgPyBOdW1iZXIodmFsdWUudHJpbSgpKVxuICAgICAgOiB2YWx1ZTtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgY2FuZGlkYXRlID09PSAnbnVtYmVyJ1xuICAgICAgJiYgTnVtYmVyLmlzSW50ZWdlcihjYW5kaWRhdGUpXG4gICAgICAmJiBjYW5kaWRhdGUgPj0gMVxuICAgICAgJiYgY2FuZGlkYXRlIDw9IDY1XzUzNVxuICAgICkge1xuICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gYXV0b21hdGljQmVoYXZpb3IoXG4gIHNvdXJjZXM6IEFycmF5PERhdGFSZWNvcmQgfCB1bmRlZmluZWQ+LFxuICBrZXk6ICdhdXRvUmVuYW1lJyB8ICdhdXRvRGVsZXRlUmVnaXN0cnknLFxuICBmYWxsYmFjazogYm9vbGVhbixcbik6IGJvb2xlYW4ge1xuICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBzb3VyY2VzKSB7XG4gICAgaWYgKCFzb3VyY2UgfHwgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIGNvbnRpbnVlO1xuICAgIHJldHVybiBwYXJzZUJvb2xlYW4oc291cmNlW2tleV0pID8/IGZhbHNlO1xuICB9XG4gIHJldHVybiBmYWxsYmFjaztcbn1cblxuZnVuY3Rpb24gcGFyc2VCb29sZWFuKHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB8IHVuZGVmaW5lZCB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykgcmV0dXJuIHZhbHVlO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIHVuZGVmaW5lZDtcblxuICBjb25zdCBub3JtYWxpemVkID0gdmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gIGlmIChub3JtYWxpemVkID09PSAndHJ1ZScpIHJldHVybiB0cnVlO1xuICBpZiAobm9ybWFsaXplZCA9PT0gJ2ZhbHNlJykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBmaXJzdENhY2hlQ2xlYW51cCguLi52YWx1ZXM6IHVua25vd25bXSk6IEZlaXNodVN5bmNTZXR0aW5nc1snY2FjaGVDbGVhbnVwJ10gfCB1bmRlZmluZWQge1xuICByZXR1cm4gdmFsdWVzLmZpbmQoKHZhbHVlKTogdmFsdWUgaXMgRmVpc2h1U3luY1NldHRpbmdzWydjYWNoZUNsZWFudXAnXSA9PiAoXG4gICAgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiBDQUNIRV9DTEVBTlVQX1ZBTFVFUy5oYXModmFsdWUpXG4gICkpO1xufVxuXG5mdW5jdGlvbiBzYW1lRGF0YShzb3VyY2U6IERhdGFSZWNvcmQgfCB1bmRlZmluZWQsIG1pZ3JhdGVkOiBEYXRhUmVjb3JkKTogYm9vbGVhbiB7XG4gIGlmICghc291cmNlKSByZXR1cm4gZmFsc2U7XG5cbiAgY29uc3Qgc291cmNlS2V5cyA9IE9iamVjdC5rZXlzKHNvdXJjZSk7XG4gIGNvbnN0IG1pZ3JhdGVkS2V5cyA9IE9iamVjdC5rZXlzKG1pZ3JhdGVkKTtcbiAgcmV0dXJuIHNvdXJjZUtleXMubGVuZ3RoID09PSBtaWdyYXRlZEtleXMubGVuZ3RoXG4gICAgJiYgbWlncmF0ZWRLZXlzLmV2ZXJ5KChrZXkpID0+IChcbiAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSlcbiAgICAgICYmIE9iamVjdC5pcyhzb3VyY2Vba2V5XSwgbWlncmF0ZWRba2V5XSlcbiAgICApKTtcbn1cbiIsICIvKipcbiAqIE9CIFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1NjNBNVx1NTNFMyArIFx1OUVEOFx1OEJBNFx1NTAzQ1x1MzAwMlxuICogXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzEwXHVGRjA4U2V0dGluZ3NUYWJcdUZGMDlcdTMwMDJcbiAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIEZlaXNodVN5bmNTZXR0aW5ncyB7XG4gIC8qKiBcdTYzMDFcdTRFNDVcdTUzMTZcdThCQkVcdTdGNkVcdTdFRDNcdTY3ODRcdTcyNDhcdTY3MkNcdTMwMDIgKi9cbiAgc2NoZW1hVmVyc2lvbjogMTtcbiAgLyoqIFx1NjcyQ1x1NTczMCBIVFRQIHNlcnZlciBcdTdBRUZcdTUzRTNcdUZGMDhcdTlFRDhcdThCQTQgNDU2N1x1RkYwOVx1MzAwMiAqL1xuICBwb3J0OiBudW1iZXI7XG4gIC8qKiBcdTU0MkZcdTUyQThcdTRFRTRcdTcyNENcdUZGMDgzMiBcdTVCNTdcdTgyODIgaGV4XHVGRjBDXHU5OTk2XHU2QjIxXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXHVGRjA5XHUzMDAyICovXG4gIHN5bmNUb2tlbjogc3RyaW5nO1xuICAvKiogbGFyay1jbGkgXHU4REVGXHU1Rjg0XHVGRjA4XHU3QTdBPVx1ODFFQVx1NTJBOFx1NjNBMlx1NkQ0Qlx1RkYwOVx1MzAwMiAqL1xuICBsYXJrQ2xpUGF0aDogc3RyaW5nO1xuICAvKiogXHU5RUQ4XHU4QkE0XHU4NDNEXHU1NzMwXHU3NkVFXHU1RjU1XHVGRjA4XHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1RkYwOVx1MzAwMiAqL1xuICBkZWZhdWx0RGlyOiBzdHJpbmc7XG4gIC8qKiBcdTgxRUFcdTUyQThcdTg5RTZcdTUzRDEgYXV0by1yZW5hbWUgXHU3RjE2XHU3ODAxXHU1MjA2XHU5MTREXHUzMDAyICovXG4gIGF1dG9SZW5hbWU6IGJvb2xlYW47XG4gIC8qKiBcdTgxRUFcdTUyQThcdTc2N0JcdThCQjBcdTUyMjBcdTk2NjRcdUZGMDhcdTUxOTlcdTk4REVcdTRFNjZcdTU5MUFcdTdFRjRcdTg4NjhcdTY4M0NcdUZGMDlcdTMwMDIgKi9cbiAgYXV0b0RlbGV0ZVJlZ2lzdHJ5OiBib29sZWFuO1xuICAvKiogXHU1NkZFXHU3MjQ3XHU3RjEzXHU1QjU4XHU2RTA1XHU3NDA2XHU1NDY4XHU2NzFGXHUzMDAyICovXG4gIGNhY2hlQ2xlYW51cDogJ2RhaWx5JyB8ICd3ZWVrbHknIHwgJ21vbnRobHknIHwgJ25ldmVyJztcbiAgLyoqIFx1NEZERFx1NzU1OVx1ODhDNVx1OTk3MFx1NTZGRVx1NzI0N1x1MzAwMiAqL1xuICBrZWVwRGVjb3JhdGl2ZUltYWdlczogYm9vbGVhbjtcbiAgLyoqIFx1OThERVx1NEU2Nlx1NzdFNVx1OEJDNlx1NUU5MyBzcGFjZV9pZFx1RkYwOFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1NzUyOFx1RkYwOVx1MzAwMiAqL1xuICBzcGFjZUlkOiBzdHJpbmc7XG4gIC8qKiAzLjIuMSBMYXJrIERvYyBcdTc2ODRcdTUxN0NcdTVCQjlcdTc2RUVcdTVGNTVcdTVCNTdcdTZCQjVcdTMwMDIgKi9cbiAgZGVmYXVsdE5vdGVGb2xkZXI6IHN0cmluZztcbiAgLyoqIFx1NjYyRlx1NTQyNlx1OTY5MFx1ODVDRlx1NTQwQ1x1NkI2NVx1NEY3Rlx1NzUyOFx1NzY4NFx1N0NGQlx1N0VERlx1NUM1RVx1NjAyN1x1MzAwMiAqL1xuICBoaWRlU3lzdGVtUHJvcGVydGllczogYm9vbGVhbjtcbiAgLyoqIFx1NTM0N1x1N0VBN1x1NjVGNlx1NEZERFx1NzU1OVx1NEVDRFx1ODhBQlx1OEZEMFx1ODg0Q1x1NzI0OFx1NEY3Rlx1NzUyOFx1NzY4NFx1NjcyQVx1NzdFNVx1NUI1N1x1NkJCNVx1MzAwMiAqL1xuICBbbGVnYWN5S2V5OiBzdHJpbmddOiB1bmtub3duO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogRmVpc2h1U3luY1NldHRpbmdzID0ge1xuICBzY2hlbWFWZXJzaW9uOiAxLFxuICBwb3J0OiA0NTY3LFxuICBzeW5jVG9rZW46ICcnLFxuICBsYXJrQ2xpUGF0aDogJycsXG4gIGRlZmF1bHREaXI6ICcwXHVGRTBGXHUyMEUzXHU4RjkzXHU1MTY1JyxcbiAgYXV0b1JlbmFtZTogdHJ1ZSxcbiAgYXV0b0RlbGV0ZVJlZ2lzdHJ5OiB0cnVlLFxuICBjYWNoZUNsZWFudXA6ICd3ZWVrbHknLFxuICBrZWVwRGVjb3JhdGl2ZUltYWdlczogdHJ1ZSxcbiAgc3BhY2VJZDogJzc2NTEzMTQxNTAwNjAwNjc4MDMnLFxuICBkZWZhdWx0Tm90ZUZvbGRlcjogJzNcdUZFMEZcdTIwRTNcdTk2NDRcdTRFRjZcdTY1ODdcdTRFRjYvTGFyaycsXG4gIGhpZGVTeXN0ZW1Qcm9wZXJ0aWVzOiB0cnVlLFxufTtcblxuLyoqIFx1NjNEMlx1NEVGNlx1OEZEMFx1ODg0Q1x1NjVGNlx1NzJCNlx1NjAwMVx1RkYwOFx1NEUwRFx1NjMwMVx1NEU0NVx1NTMxNlx1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBQbHVnaW5TdGF0ZSB7XG4gIC8qKiBsYXJrLWNsaSBcdTVCOUVcdTk2NDVcdThERUZcdTVGODRcdUZGMDhcdTYzQTJcdTZENEIvXHU4QkJFXHU3RjZFXHU1NDBFXHU3Njg0XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA5XHUzMDAyICovXG4gIGxhcmtDbGlSZXNvbHZlZDogc3RyaW5nO1xuICAvKiogbGFyay1jbGkgXHU3MjQ4XHU2NzJDXHU1M0Y3XHVGRjA4XHU1OTgyIFwiMS4wLjUyXCJcdUZGMDlcdTMwMDIgKi9cbiAgbGFya0NsaVZlcnNpb246IHN0cmluZztcbiAgLyoqIEhUVFAgc2VydmVyIFx1NjYyRlx1NTQyNlx1NkI2M1x1NTcyOFx1OEZEMFx1ODg0Q1x1MzAwMiAqL1xuICBzZXJ2ZXJSdW5uaW5nOiBib29sZWFuO1xuICAvKiogXHU2NzAwXHU4RkQxXHU1NDBDXHU2QjY1XHU4QkIwXHU1RjU1XHVGRjA4XHU1MTg1XHU1QjU4XHU0RTJEXHVGRjBDXHU2NzAwXHU1OTFBIDUwIFx1Njc2MVx1RkYwOVx1MzAwMiAqL1xuICByZWNlbnRTeW5jczogUmVjZW50U3luY1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlY2VudFN5bmMge1xuICB0aW1lOiBzdHJpbmc7XG4gIG5vZGVfdG9rZW46IHN0cmluZztcbiAgdGl0bGU6IHN0cmluZztcbiAgcGF0aDogc3RyaW5nO1xuICBhY3Rpb246ICdjcmVhdGVkJyB8ICd1cGRhdGVkJyB8ICdlcnJvcic7XG4gIGVycm9yPzogc3RyaW5nO1xufVxuIiwgIi8qKlxuICogT0IgXHU2M0QyXHU0RUY2XHU4QkJFXHU3RjZFXHU3NTRDXHU5NzYyXHUzMDAyXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzEwXHVGRjA4U2V0dGluZ3NUYWJcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdTdBRUZcdTUzRTNcdTMwMDFcdTU0MkZcdTUyQThcdTRFRTRcdTcyNENcdUZGMDhcdTc1MUZcdTYyMTAvXHU5MUNEXHU3RjZFL1x1NTkwRFx1NTIzNlx1RkYwOVx1MzAwMWxhcmstY2xpIFx1OERFRlx1NUY4NFx1MzAwMVx1OUVEOFx1OEJBNFx1NzZFRVx1NUY1NVx1MzAwMVx1NUYwMFx1NTE3M1x1MzAwMVx1N0YxM1x1NUI1OFx1NTQ2OFx1NjcxRlx1MzAwMlxuICovXG5pbXBvcnQgeyBBcHAsIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcsIE5vdGljZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgRmVpc2h1U3luY1BsdWdpbiB9IGZyb20gJy4vbWFpbi5qcyc7XG5pbXBvcnQgdHlwZSB7IEZlaXNodVN5bmNTZXR0aW5ncyB9IGZyb20gJy4vc2V0dGluZ3MuanMnO1xuaW1wb3J0IHsgZ2VuZXJhdGVTeW5jVG9rZW4gfSBmcm9tICcuL3NldHRpbmdzTWlncmF0aW9uLmpzJztcbmltcG9ydCB7IHJlc29sdmVDbGkgfSBmcm9tICcuL2xhcmsvY2xpLmpzJztcbmltcG9ydCB7IHJlZnJlc2hNYXBwaW5nIH0gZnJvbSAnLi9tYXBwaW5nLmpzJztcblxuZXhwb3J0IGNsYXNzIEZlaXNodVN5bmNTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBGZWlzaHVTeW5jUGx1Z2luKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG5cbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICdcdTk4REVcdTRFNjZcdTU0MENcdTZCNjVcdThCQkVcdTdGNkUnIH0pO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwIFx1OTAxQVx1NEZFMSBcdTI1MDBcdTI1MDBcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTY3MkNcdTU3MzBcdTdBRUZcdTUzRTMnKVxuICAgICAgLnNldERlc2MoJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NjI2OVx1NUM1NVx1OEZERVx1NjNBNSBPQiBcdTYzRDJcdTRFRjZcdTc2ODRcdTdBRUZcdTUzRTNcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkYgT0IgXHU2MjE2XHU5MUNEXHU2NUIwXHU1MkEwXHU4RjdEXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFZhbHVlKFN0cmluZyh0aGlzLnBsdWdpbi5zZXR0aW5ncy5wb3J0KSlcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3J0ID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcbiAgICAgICAgICAgIGlmIChwb3J0ID4gMCAmJiBwb3J0IDwgNjU1MzYpIHtcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MucG9ydCA9IHBvcnQ7XG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgIC8vIFx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1xuICAgIGNvbnN0IHRva2VuU2V0dGluZyA9IG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NTQyRlx1NTJBOFx1NEVFNFx1NzI0QycpXG4gICAgICAuc2V0RGVzYygnXHU2RDRGXHU4OUM4XHU1NjY4XHU2MjY5XHU1QzU1XHU5OTk2XHU2QjIxXHU4RkRFXHU2M0E1XHU5NzAwXHU3Qzk4XHU4RDM0XHU2QjY0XHU0RUU0XHU3MjRDXHUzMDAyXHU3MEI5XHU1MUZCXHU1OTBEXHU1MjM2XHU1NDBFXHU3Qzk4XHU4RDM0XHU1MjMwXHU2MjY5XHU1QzU1XHU1RjM5XHU3QTk3XHUzMDAyJyk7XG5cbiAgICB0b2tlblNldHRpbmcuYWRkVGV4dCgodGV4dCkgPT4ge1xuICAgICAgdGV4dFxuICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY1Rva2VuKVxuICAgICAgICAuc2V0RGlzYWJsZWQodHJ1ZSkgLy8gXHU1M0VBXHU4QkZCXHVGRjBDXHU5MDdGXHU1MTREXHU2MjRCXHU2NTM5XG4gICAgICAgIC5pbnB1dEVsLnN0eWxlLmZvbnRGYW1pbHkgPSAnbW9ub3NwYWNlJztcbiAgICB9KTtcblxuICAgIHRva2VuU2V0dGluZy5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgIGJ0blxuICAgICAgICAuc2V0QnV0dG9uVGV4dCgnXHU1OTBEXHU1MjM2JylcbiAgICAgICAgLnNldFRvb2x0aXAoJ1x1NTkwRFx1NTIzNlx1NEVFNFx1NzI0Q1x1NTIzMFx1NTI2QVx1OEQzNFx1Njc3RicpXG4gICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jVG9rZW4pO1xuICAgICAgICAgIG5ldyBOb3RpY2UoJ1x1MjcwNSBcdTRFRTRcdTcyNENcdTVERjJcdTU5MERcdTUyMzYnKTtcbiAgICAgICAgfSksXG4gICAgKTtcblxuICAgIHRva2VuU2V0dGluZy5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgIGJ0blxuICAgICAgICAuc2V0QnV0dG9uVGV4dCgnXHU5MUNEXHU3RjZFJylcbiAgICAgICAgLnNldFRvb2x0aXAoJ1x1NzUxRlx1NjIxMFx1NjVCMFx1NEVFNFx1NzI0Q1x1RkYwOFx1NjI2OVx1NUM1NVx1OTcwMFx1OTFDRFx1NjVCMFx1N0M5OFx1OEQzNFx1RkYwOScpXG4gICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jVG9rZW4gPSBnZW5lcmF0ZVN5bmNUb2tlbigpO1xuICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xuICAgICAgICAgIG5ldyBOb3RpY2UoJ1x1RDgzRFx1REQwNCBcdTRFRTRcdTcyNENcdTVERjJcdTkxQ0RcdTdGNkUnKTtcbiAgICAgICAgfSksXG4gICAgKTtcblxuICAgIC8vIFx1MjUwMFx1MjUwMCBsYXJrLWNsaSBcdTI1MDBcdTI1MDBcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdsYXJrLWNsaScgfSk7XG5cbiAgICBjb25zdCBsYXJrSW5mbyA9IGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDogYFx1NzJCNlx1NjAwMVx1RkYxQSR7dGhpcy5wbHVnaW4uc3RhdGUubGFya0NsaVJlc29sdmVkID8gJ1x1MjcwNSAnICsgdGhpcy5wbHVnaW4uc3RhdGUubGFya0NsaVZlcnNpb24gOiAnXHUyNzRDIFx1NjcyQVx1NjI3RVx1NTIzMCd9YCxcbiAgICAgIGNsczogJ3NldHRpbmctaXRlbS1kZXNjcmlwdGlvbicsXG4gICAgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdsYXJrLWNsaSBcdThERUZcdTVGODQnKVxuICAgICAgLnNldERlc2MoJ1x1NzU1OVx1N0E3QVx1NTIxOVx1ODFFQVx1NTJBOFx1NjNBMlx1NkQ0Qlx1MzAwMlx1NTk4Mlx1ODFFQVx1NTJBOFx1NjNBMlx1NkQ0Qlx1NTkzMVx1OEQyNVx1RkYwQ1x1OEJGN1x1NjI0Qlx1NTJBOFx1NTg2Qlx1NTE5OVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1MzAwMicpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5sYXJrQ2xpUGF0aClcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ1x1ODFFQVx1NTJBOFx1NjNBMlx1NkQ0QicpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MubGFya0NsaVBhdGggPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKVxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgICBidG5cbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dCgnXHU2RDRCXHU4QkQ1JylcbiAgICAgICAgICAuc2V0VG9vbHRpcCgnXHU5MUNEXHU2NUIwXHU2M0EyXHU2RDRCIGxhcmstY2xpJylcbiAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSByZXNvbHZlQ2xpKHRoaXMucGx1Z2luLnNldHRpbmdzLmxhcmtDbGlQYXRoIHx8IHVuZGVmaW5lZCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnN0YXRlLmxhcmtDbGlSZXNvbHZlZCA9IHJlc3VsdC5wYXRoO1xuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zdGF0ZS5sYXJrQ2xpVmVyc2lvbiA9IHJlc3VsdC52ZXJzaW9uO1xuICAgICAgICAgICAgICBsYXJrSW5mby5zZXRUZXh0KGBcdTcyQjZcdTYwMDFcdUZGMUFcdTI3MDUgJHtyZXN1bHQudmVyc2lvbn1gKTtcbiAgICAgICAgICAgICAgbmV3IE5vdGljZShgXHUyNzA1IFx1NjI3RVx1NTIzMCAke3Jlc3VsdC52ZXJzaW9ufWApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc3RhdGUubGFya0NsaVJlc29sdmVkID0gJyc7XG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnN0YXRlLmxhcmtDbGlWZXJzaW9uID0gJyc7XG4gICAgICAgICAgICAgIGxhcmtJbmZvLnNldFRleHQoJ1x1NzJCNlx1NjAwMVx1RkYxQVx1Mjc0QyBcdTY3MkFcdTYyN0VcdTUyMzAnKTtcbiAgICAgICAgICAgICAgbmV3IE5vdGljZSgnXHUyNzRDIFx1NjcyQVx1NjI3RVx1NTIzMCBsYXJrLWNsaVx1RkYwOFx1OTcwMCBcdTIyNjUgMS4wLjUyXHVGRjA5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwIFx1NTQwQ1x1NkI2NVx1ODg0Q1x1NEUzQSBcdTI1MDBcdTI1MDBcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdcdTU0MENcdTZCNjVcdTg4NENcdTRFM0EnIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU5RUQ4XHU4QkE0XHU4NDNEXHU1NzMwXHU3NkVFXHU1RjU1JylcbiAgICAgIC5zZXREZXNjKCdcdTYyNjlcdTVDNTVcdTY3MkFcdTYzMDdcdTVCOUFcdTc2RUVcdTVGNTVcdTY1RjZcdUZGMENcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjNcdTg0M0RcdTU3MzBcdTUyMzBcdTZCNjRcdTc2RUVcdTVGNTVcdUZGMDhcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHREaXIpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdERpciA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4MUVBXHU1MkE4XHU1MjA2XHU5MTREXHU3RjE2XHU3ODAxJylcbiAgICAgIC5zZXREZXNjKCdcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjNcdTg0M0RcdTU3MzBcdTU0MEVcdTgxRUFcdTUyQThcdTg5RTZcdTUzRDEgYXV0by1yZW5hbWUgXHU3RjE2XHU3ODAxXHU1MjA2XHU5MTREJylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9SZW5hbWUpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b1JlbmFtZSA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU1MjIwXHU5NjY0XHU4MUVBXHU1MkE4XHU3NjdCXHU4QkIwJylcbiAgICAgIC5zZXREZXNjKCdcdTUyMjBcdTk2NjRcdTU0MkIgZmVpc2h1X2lkIFx1NzY4NFx1NjU4N1x1NEVGNlx1NjVGNlx1RkYwQ1x1ODFFQVx1NTJBOFx1NzY3Qlx1OEJCMFx1NTIzMFx1OThERVx1NEU2Nlx1NTkxQVx1N0VGNFx1ODg2OFx1NjgzQycpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdXRvRGVsZXRlUmVnaXN0cnkpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b0RlbGV0ZVJlZ2lzdHJ5ID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTRGRERcdTc1NTlcdTg4QzVcdTk5NzBcdTU2RkVcdTcyNDcnKVxuICAgICAgLnNldERlc2MoJ1x1OThERVx1NEU2Nlx1NjM5Mlx1NzI0OFx1NzI2OVx1NjU5OVx1RkYwODEzNVx1N0YxNlx1OEY5MVx1NTY2OFx1OThDRVx1NjgzQ1x1N0I0OVx1N0VBRlx1NTZGRVx1NzI0N1x1RkYwOVx1NjYyRlx1NTQyNlx1ODQzRFx1NTczMFx1NTIzMCBPQicpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5rZWVwRGVjb3JhdGl2ZUltYWdlcylcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5rZWVwRGVjb3JhdGl2ZUltYWdlcyA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU5NjkwXHU4NUNGXHU3Q0ZCXHU3RURGXHU1QzVFXHU2MDI3JylcbiAgICAgIC5zZXREZXNjKCdcdTk2OTBcdTg1Q0YgX3N5c18gXHU1RjAwXHU1OTM0XHU1NDhDXHU2NUU3XHU3MjQ4XHU5OERFXHU0RTY2XHU1NDBDXHU2QjY1XHU1QjU3XHU2QkI1XHVGRjFCXHU1QjU3XHU2QkI1XHU0RUNEXHU0RkREXHU3NTU5XHU3RUQ5XHU1NDBDXHU2QjY1XHU5MDNCXHU4RjkxXHU0RjdGXHU3NTI4JylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmhpZGVTeXN0ZW1Qcm9wZXJ0aWVzKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmhpZGVTeXN0ZW1Qcm9wZXJ0aWVzID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLmFwcGx5U3lzdGVtUHJvcGVydGllc1Zpc2liaWxpdHkoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTU2RkVcdTcyNDdcdTdGMTNcdTVCNThcdTZFMDVcdTc0MDZcdTU0NjhcdTY3MUYnKVxuICAgICAgLnNldERlc2MoJ2ZlaXNodTovL3Rva2VuIFx1OTg4NFx1ODlDOFx1NTZGRVx1NzI0N1x1NzY4NFx1NjcyQ1x1NTczMFx1N0YxM1x1NUI1OFx1NEZERFx1NzU1OVx1NjVGNlx1OTU3RicpXG4gICAgICAuYWRkRHJvcGRvd24oKGRyb3Bkb3duKSA9PlxuICAgICAgICBkcm9wZG93blxuICAgICAgICAgIC5hZGRPcHRpb24oJ2RhaWx5JywgJ1x1NkJDRlx1NTkyOScpXG4gICAgICAgICAgLmFkZE9wdGlvbignd2Vla2x5JywgJ1x1NkJDRlx1NTQ2OCcpXG4gICAgICAgICAgLmFkZE9wdGlvbignbW9udGhseScsICdcdTZCQ0ZcdTY3MDgnKVxuICAgICAgICAgIC5hZGRPcHRpb24oJ25ldmVyJywgJ1x1NkMzOFx1NEUwRCcpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmNhY2hlQ2xlYW51cClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jYWNoZUNsZWFudXAgPSB2YWx1ZSBhcyBGZWlzaHVTeW5jU2V0dGluZ3NbJ2NhY2hlQ2xlYW51cCddO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwIFx1OThERVx1NEU2Nlx1NzdFNVx1OEJDNlx1NUU5MyBcdTI1MDBcdTI1MDBcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdcdTk4REVcdTRFNjZcdTc3RTVcdThCQzZcdTVFOTMnIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU3N0U1XHU4QkM2XHU1RTkzIHNwYWNlX2lkJylcbiAgICAgIC5zZXREZXNjKCdcdTc2RUVcdTVGNTVcdTY2MjBcdTVDMDRcdTc1MjhcdTMwMDJcdTY1QjBcdTc3RTVcdThCQzZcdTVFOTNcdTlFRDhcdThCQTQgNzY1MTMxNDE1MDA2MDA2NzgwMycpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zcGFjZUlkKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnNwYWNlSWQgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKVxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgICBidG5cbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dCgnXHU1MjM3XHU2NUIwXHU2NjIwXHU1QzA0JylcbiAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCByZWZyZXNoTWFwcGluZyh0aGlzLmFwcCwgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc3BhY2VJZCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuICB9XG59XG4iLCAiLyoqXG4gKiBsYXJrLWNsaSBcdTVDMDFcdTg4QzVcdTVDNDJcdTMwMDJcdTRGOURcdTYzNkUgYHJjLXgvc2NyaXB0cy9yY19lbnYucHlgICsgYDAzX1x1NjgzQ1x1NUYwRlx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU1MzQxL1x1NTM0MVx1NEUwMFx1MzAwMlxuICpcbiAqIC0gcmVzb2x2ZUNsaSgpXHVGRjFBXHU1MDE5XHU5MDA5XHU4REVGXHU1Rjg0XHU2M0EyXHU2RDRCXHVGRjBDXHU3MjQ4XHU2NzJDXHU2ODIxXHU5QThDIFx1MjI2NSAxLjAuNTJcbiAqIC0gcnVuKClcdUZGMUFcdTdFREZcdTRFMDAgc3Bhd25TeW5jIFx1NTMwNVx1ODhDNVx1RkYwQ1x1OTFDRFx1OEJENVx1MzAwMVx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1MzAwMWVtb2ppIFx1NkUwNVx1NkQxN1x1MzAwMX5cdTUzQ0RcdThGNkNcdTRFNDlcdTMwMDFKU09OIFx1NTMwNVx1ODhDNVx1ODlFM1x1NTMwNVxuICogLSBcdTY4MDdcdTk4OThcdTRGRUVcdTU5MERcdUZGMUFvdmVyd3JpdGUgXHU1NDBFXHU4RkZEXHU1MkEwIHN0cl9yZXBsYWNlIFx1NEZFRSA8dGl0bGU+XG4gKlxuICogXHU1OTFBXHU4QkJFXHU1OTA3XHU5MDAyXHU5MTREXHU1MTczXHU5NTJFXHU3MEI5XHVGRjFBXG4gKiAtIEdVSSBcdTU0MkZcdTUyQThcdTc2ODQgT2JzaWRpYW4gXHU2MkZGXHU0RTBEXHU1MjMwXHU3RUM4XHU3QUVGIFBBVEhcdUZGMDhudm0vaG9tZWJyZXcgXHU0RTBEXHU1NzI4XHU1MTg1XHVGRjA5XHVGRjBDXHU2NTQ1IHNwYXduIFx1NjVGNlx1NkNFOFx1NTE2NVx1NTg5RVx1NUYzQSBQQVRIXG4gKiAtIG52bSBcdTc2RUVcdTVGNTVcdTYzMDlcdTY1NzBcdTVCNTdcdTVFOEZcdTUzRDYgbGF0ZXN0XHVGRjA4XHU1QjU3XHU3QjI2XHU0RTMyIHNvcnQgXHU0RjFBXHU4QkE5IHY5ID4gdjEwXHVGRjA5XG4gKi9cbmltcG9ydCB7IGV4ZWNGaWxlU3luYywgdHlwZSBFeGVjRmlsZVN5bmNPcHRpb25zV2l0aFN0cmluZ0VuY29kaW5nIH0gZnJvbSAnbm9kZTpjaGlsZF9wcm9jZXNzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ25vZGU6b3MnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycywgdW5lc2NhcGVGZWlzaHVUaWxkZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5cbmNvbnN0IE1JTl9WRVJTSU9OID0gWzEsIDAsIDUyXTtcblxuLyoqXG4gKiBcdTY3ODRcdTkwMjBcdTU4OUVcdTVGM0EgUEFUSFx1RkYxQVx1NTcyOFx1OEZEQlx1N0EwQlx1NzNCMFx1NjcwOSBQQVRIIFx1NTI0RFx1OEZGRFx1NTJBMCBudm0vbGF0ZXN0L2JpbiArIFx1NUUzOFx1ODlDMVx1NUI4OVx1ODhDNVx1NEY0RFx1MzAwMlxuICogXHU3NTI4XHU0RThFIEdVSSBcdTU0MkZcdTUyQThcdTc2ODQgT2JzaWRpYW5cdUZGMDhQQVRIIFx1N0YzQSBudm0vaG9tZWJyZXdcdUZGMENcdTVCRkNcdTgxRjQgIyEvdXNyL2Jpbi9lbnYgbm9kZSBcdTYyN0VcdTRFMERcdTUyMzAgbm9kZVx1RkYwOVx1MzAwMlxuICovXG5mdW5jdGlvbiBidWlsZEVuaGFuY2VkUGF0aCgpOiBzdHJpbmcge1xuICBjb25zdCBleHRyYTogc3RyaW5nW10gPSBbXTtcbiAgLy8gbnZtIGxhdGVzdCBub2RlIFx1NzY4NCBiaW5cbiAgY29uc3QgbnZtQmFzZSA9IHBhdGguam9pbihvcy5ob21lZGlyKCksICcubnZtL3ZlcnNpb25zL25vZGUnKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBkaXJzID0gZnMucmVhZGRpclN5bmMobnZtQmFzZSk7XG4gICAgLy8gXHU2NTcwXHU1QjU3XHU1RThGXHU1M0Q2XHU2NzAwXHU1OTI3XHU3MjQ4XHU2NzJDXHVGRjA4djkgdnMgdjEwIFx1NUI1N1x1N0IyNlx1NEUzMlx1NjM5Mlx1NUU4Rlx1NEYxQVx1OTUxOVx1RkYwOVxuICAgIGNvbnN0IGxhdGVzdCA9IGRpcnNcbiAgICAgIC5tYXAoZCA9PiAoeyBuYW1lOiBkLCB2ZXI6IHBhcnNlSW50KGQucmVwbGFjZSgvXnYvLCAnJyksIDEwKSB9KSlcbiAgICAgIC5maWx0ZXIoeCA9PiAhTnVtYmVyLmlzTmFOKHgudmVyKSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBhLnZlciAtIGIudmVyKVxuICAgICAgLnBvcCgpO1xuICAgIGlmIChsYXRlc3QpIGV4dHJhLnB1c2gocGF0aC5qb2luKG52bUJhc2UsIGxhdGVzdC5uYW1lLCAnYmluJykpO1xuICB9IGNhdGNoIHsgLyogbnZtIFx1NjcyQVx1ODhDNSAqLyB9XG4gIGV4dHJhLnB1c2gocGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJy5sb2NhbCcsICdiaW4nKSk7XG4gIGV4dHJhLnB1c2goJy9vcHQvaG9tZWJyZXcvYmluJyk7XG4gIGV4dHJhLnB1c2goJy91c3IvbG9jYWwvYmluJyk7XG4gIGNvbnN0IGJhc2UgPSBwcm9jZXNzLmVudi5QQVRIID8/ICcnO1xuICByZXR1cm4gWy4uLmV4dHJhLmZpbHRlcihwID0+ICFiYXNlLnNwbGl0KHBhdGguZGVsaW1pdGVyKS5pbmNsdWRlcyhwKSksIGJhc2VdLmpvaW4ocGF0aC5kZWxpbWl0ZXIpO1xufVxuXG4vKiogcnVuKCkgXHU1MTcxXHU3NTI4XHU3Njg0XHU1ODlFXHU1RjNBIFBBVEhcdUZGMDhcdTk5OTZcdTZCMjFcdTg5RTNcdTY3OTBcdTU0MEVcdTdGMTNcdTVCNThcdUZGMDlcdTMwMDIgKi9cbmxldCBlbmhhbmNlZFBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gZ2V0RW5oYW5jZWRQYXRoKCk6IHN0cmluZyB7XG4gIHJldHVybiBlbmhhbmNlZFBhdGggPz89IGJ1aWxkRW5oYW5jZWRQYXRoKCk7XG59XG5cbi8qKlxuICogXHU1NzI4XHU1ODlFXHU1RjNBIFBBVEggXHU0RTBCXHU2N0U1XHU2MjdFXHU1M0VGXHU2MjY3XHU4ODRDXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHVGRjA4XHU2NkZGXHU0RUUzIGB3aGljaGBcdUZGMENcdTkwN0ZcdTUxNEQgR1VJIFx1OEZEQlx1N0EwQiBQQVRIIFx1N0YzQVx1NTkzMVx1RkYwOVx1MzAwMlxuICogXHU3NTI4IGV4ZWNGaWxlU3luYyBcdTRFMERcdThENzAgc2hlbGxcdUZGMENcdTY2RjRcdTdBMzNcdTMwMDJcbiAqL1xuZnVuY3Rpb24gd2hpY2goY21kOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgLy8gXHU1MTQ4XHU4QkQ1XHU1RjUzXHU1MjREIFBBVEhcdUZGMDhcdTdFQzhcdTdBRUZcdTU3M0FcdTY2NkZcdUZGMDlcbiAgdHJ5IHtcbiAgICBjb25zdCBmb3VuZCA9IGV4ZWNGaWxlU3luYygnL3Vzci9iaW4vd2hpY2gnLCBbY21kXSwge1xuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICAgIHRpbWVvdXQ6IDMwMDAsXG4gICAgICBlbnY6IHsgLi4ucHJvY2Vzcy5lbnYgfSxcbiAgICB9KS50cmltKCk7XG4gICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmQ7XG4gIH0gY2F0Y2ggeyAvKiBmYWxsIHRocm91Z2ggKi8gfVxuICAvLyBcdTUxOERcdThCRDVcdTU4OUVcdTVGM0EgUEFUSFx1RkYwOEdVSSBcdTU3M0FcdTY2NkZcdUZGMDlcbiAgdHJ5IHtcbiAgICBjb25zdCBmb3VuZCA9IGV4ZWNGaWxlU3luYygnL3Vzci9iaW4vd2hpY2gnLCBbY21kXSwge1xuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICAgIHRpbWVvdXQ6IDMwMDAsXG4gICAgICBlbnY6IHsgLi4ucHJvY2Vzcy5lbnYsIFBBVEg6IGdldEVuaGFuY2VkUGF0aCgpIH0sXG4gICAgfSkudHJpbSgpO1xuICAgIHJldHVybiBmb3VuZCB8fCBudWxsO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKiogXHU1MDE5XHU5MDA5XHU4REVGXHU1Rjg0XHVGRjA4XHU3OUZCXHU2OTBEIHJjX2Vudi5weSByZXNvbHZlX2NsaVx1RkYwOVx1MzAwMiAqL1xuY29uc3QgQ0xJX0NBTkRJREFURVM6ICgoKSA9PiBzdHJpbmcgfCBudWxsKVtdID0gW1xuICAoKSA9PiBwcm9jZXNzLmVudi5MQVJLX0NMSV9CSU4gPz8gbnVsbCxcbiAgKCkgPT4gd2hpY2goJ2xhcmtzdWl0ZS1jbGknKSxcbiAgKCkgPT4gd2hpY2goJ2xhcmstY2xpJyksXG4gICgpID0+IHtcbiAgICBjb25zdCBudm1CYXNlID0gcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJy5udm0vdmVyc2lvbnMvbm9kZScpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkaXJzID0gZnMucmVhZGRpclN5bmMobnZtQmFzZSk7XG4gICAgICAvLyBcdTY1NzBcdTVCNTdcdTVFOEZcdTUzRDZcdTY3MDBcdTU5MjdcdTcyNDhcdTY3MkNcdUZGMDhcdTVCNTdcdTdCMjZcdTRFMzIgc29ydCBcdTRGMUFcdThCQTkgdjkgPiB2MTBcdUZGMDlcbiAgICAgIGNvbnN0IGxhdGVzdCA9IGRpcnNcbiAgICAgICAgLm1hcChkID0+ICh7IG5hbWU6IGQsIHZlcjogcGFyc2VJbnQoZC5yZXBsYWNlKC9edi8sICcnKSwgMTApIH0pKVxuICAgICAgICAuZmlsdGVyKHggPT4gIU51bWJlci5pc05hTih4LnZlcikpXG4gICAgICAgIC5zb3J0KChhLCBiKSA9PiBhLnZlciAtIGIudmVyKVxuICAgICAgICAucG9wKCk7XG4gICAgICByZXR1cm4gbGF0ZXN0ID8gcGF0aC5qb2luKG52bUJhc2UsIGxhdGVzdC5uYW1lLCAnYmluJywgJ2xhcmstY2xpJykgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9LFxuICAoKSA9PiBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnLmxvY2FsJywgJ2JpbicsICdsYXJrLWNsaScpLFxuICAoKSA9PiAnL29wdC9ob21lYnJldy9iaW4vbGFyay1jbGknLFxuICAoKSA9PiAnL3Vzci9sb2NhbC9iaW4vbGFyay1jbGknLFxuXTtcblxuLyoqXG4gKiBcdTYzQTJcdTZENEIgbGFyay1jbGkgXHU4REVGXHU1Rjg0XHUzMDAyXHU0RjE4XHU1MTQ4XHU3NTI4XHU4QkJFXHU3RjZFXHU4OTg2XHU3NkQ2XHVGRjBDXHU1NDI2XHU1MjE5XHU4RDcwXHU1MDE5XHU5MDA5XHU4REVGXHU1Rjg0XHUzMDAyXG4gKiBAcmV0dXJucyB7IHBhdGgsIHZlcnNpb24gfSBcdTYyMTYgbnVsbFx1RkYwOFx1NjcyQVx1NjI3RVx1NTIzMFx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUNsaShvdmVycmlkZVBhdGg/OiBzdHJpbmcpOiB7IHBhdGg6IHN0cmluZzsgdmVyc2lvbjogc3RyaW5nIH0gfCBudWxsIHtcbiAgY29uc3QgY2FuZGlkYXRlcyA9IG92ZXJyaWRlUGF0aFxuICAgID8gWygpID0+IG92ZXJyaWRlUGF0aF1cbiAgICA6IENMSV9DQU5ESURBVEVTO1xuXG4gIGZvciAoY29uc3QgZ2V0Q2xpIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICBjb25zdCBjbGkgPSBnZXRDbGkoKTtcbiAgICBpZiAoIWNsaSkgY29udGludWU7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFx1NzUyOCBleGVjRmlsZVN5bmMgXHU3NkY0XHU2M0E1XHU4REQxIGNsaVx1RkYwQ1x1NkNFOFx1NTE2NVx1NTg5RVx1NUYzQSBQQVRIXHVGRjA4XHU4OUUzXHU1MUIzIEdVSSBcdThGREJcdTdBMEIgZW52IG5vZGUgXHU2MjdFXHU0RTBEXHU1MjMwXHU3Njg0XHU5NUVFXHU5ODk4XHVGRjA5XG4gICAgICBjb25zdCB2ZXIgPSBleGVjRmlsZVN5bmMoY2xpLCBbJy0tdmVyc2lvbiddLCB7XG4gICAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgICAgIHRpbWVvdXQ6IDUwMDAsXG4gICAgICAgIGVudjogeyAuLi5wcm9jZXNzLmVudiwgUEFUSDogZ2V0RW5oYW5jZWRQYXRoKCkgfSxcbiAgICAgIH0pLnRyaW0oKTtcbiAgICAgIC8vIFx1ODlFM1x1Njc5MCBcImxhcmstY2xpIHZlcnNpb24gMS4wLjUyXCJcbiAgICAgIGNvbnN0IG1hdGNoID0gdmVyLm1hdGNoKC8oXFxkKylcXC4oXFxkKylcXC4oXFxkKykvKTtcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICBjb25zdCBtYWpvciA9IHBhcnNlSW50KG1hdGNoWzFdLCAxMCk7XG4gICAgICAgIGNvbnN0IG1pbm9yID0gcGFyc2VJbnQobWF0Y2hbMl0sIDEwKTtcbiAgICAgICAgY29uc3QgcGF0Y2ggPSBwYXJzZUludChtYXRjaFszXSwgMTApO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgbWFqb3IgPiBNSU5fVkVSU0lPTlswXSB8fFxuICAgICAgICAgIChtYWpvciA9PT0gTUlOX1ZFUlNJT05bMF0gJiYgbWlub3IgPiBNSU5fVkVSU0lPTlsxXSkgfHxcbiAgICAgICAgICAobWFqb3IgPT09IE1JTl9WRVJTSU9OWzBdICYmIG1pbm9yID09PSBNSU5fVkVSU0lPTlsxXSAmJiBwYXRjaCA+PSBNSU5fVkVSU0lPTlsyXSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIHsgcGF0aDogY2xpLCB2ZXJzaW9uOiB2ZXIgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gXHU3MjQ4XHU2NzJDXHU4OUUzXHU2NzkwXHU1OTMxXHU4RDI1XHU0RjQ2XHU2NzA5XHU4RjkzXHU1MUZBXHVGRjBDXHU0RUNEXHU1M0VGXHU3NTI4XG4gICAgICBpZiAodmVyKSByZXR1cm4geyBwYXRoOiBjbGksIHZlcnNpb246IHZlciB9O1xuICAgIH0gY2F0Y2gge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKiogcnVuKCkgXHU2MjY3XHU4ODRDXHU5MDA5XHU5ODc5XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFJ1bk9wdGlvbnMge1xuICAvKiogXHU1REU1XHU0RjVDXHU3NkVFXHU1RjU1XHVGRjA4LS1jb250ZW50IEBmaWxlIFx1NzUyOFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1NjVGNlx1OTcwMFx1ODk4MVx1RkYwOVx1MzAwMiAqL1xuICBjd2Q/OiBzdHJpbmc7XG4gIC8qKiBcdTY3MDBcdTU5MjdcdTkxQ0RcdThCRDVcdTZCMjFcdTY1NzBcdUZGMDhcdTlFRDhcdThCQTQgM1x1RkYwOVx1MzAwMiAqL1xuICByZXRyaWVzPzogbnVtYmVyO1xuICAvKiogXHU4RDg1XHU2NUY2IG1zXHVGRjA4XHU5RUQ4XHU4QkE0IDMwc1x1RkYwOVx1MzAwMiAqL1xuICB0aW1lb3V0PzogbnVtYmVyO1xuICAvKiogXHU2NzFGXHU2NzFCIEpTT04gXHU4RjkzXHU1MUZBXHU2NUY2IHRydWVcdUZGMENcdTgxRUFcdTUyQThcdThERjNcdThGQzcgXCJGb3VuZCBYIG5vZGUocylcIiBcdTUyNERcdTdGMDBcdTMwMDIgKi9cbiAganNvbj86IGJvb2xlYW47XG59XG5cbi8qKlxuICogXHU2MjY3XHU4ODRDIGxhcmstY2xpIFx1NTQ3RFx1NEVFNFx1MzAwMlx1N0VERlx1NEUwMFx1NTkwNFx1NzQwNlx1NURGMlx1NzdFNVx1NTc1MVx1MzAwMlxuICpcbiAqIEBwYXJhbSBhcmdzIGxhcmstY2xpIFx1NUI1MFx1NTQ3RFx1NEVFNFx1NTNDMlx1NjU3MFx1NjU3MFx1N0VDNFx1RkYwQ1x1NTk4MiBbJ2RvY3MnLCAnK2ZldGNoJywgJy0tZG9jJywgdG9rZW4sICctLWRvYy1mb3JtYXQnLCAnbWFya2Rvd24nXVxuICogQHBhcmFtIG9wdGlvbnMgXHU5MDA5XHU5ODc5XG4gKiBAcmV0dXJucyBzdGRvdXRcdUZGMDhcdTVERjJcdTZFMDVcdTZEMTdcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJ1bihhcmdzOiBzdHJpbmdbXSwgb3B0aW9uczogUnVuT3B0aW9ucyA9IHt9KTogc3RyaW5nIHtcbiAgY29uc3QgeyBjd2QsIHJldHJpZXMgPSAzLCB0aW1lb3V0ID0gMzAwMDAsIGpzb24gPSBmYWxzZSB9ID0gb3B0aW9ucztcbiAgY29uc3QgY2xpUGF0aCA9IHByb2Nlc3MuZW52Ll9fTEFSS19DTElfUEFUSF9fIHx8ICdsYXJrLWNsaSc7XG5cbiAgbGV0IGxhc3RFcnJvcjogRXJyb3IgfCBudWxsID0gbnVsbDtcblxuICBmb3IgKGxldCBhdHRlbXB0ID0gMTsgYXR0ZW1wdCA8PSByZXRyaWVzOyBhdHRlbXB0KyspIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZnVsbEFyZ3MgPSBbLi4uYXJnc107XG4gICAgICBjb25zdCBleGVjT3B0czogRXhlY0ZpbGVTeW5jT3B0aW9uc1dpdGhTdHJpbmdFbmNvZGluZyA9IHtcbiAgICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICAgICAgdGltZW91dCxcbiAgICAgICAgbWF4QnVmZmVyOiAxMCAqIDEwMjQgKiAxMDI0LCAvLyAxME1CXHVGRjA4XHU1OTI3XHU2NTg3XHU2ODYzXHVGRjA5XG4gICAgICAgIC8vIFx1NkNFOFx1NTE2NVx1NTg5RVx1NUYzQSBQQVRIXHVGRjFBR1VJIFx1NTQyRlx1NTJBOFx1NzY4NCBPYnNpZGlhbiBcdTYyRkZcdTRFMERcdTUyMzAgbnZtL2hvbWVicmV3XHVGRjBDXHU1QkZDXHU4MUY0XG4gICAgICAgIC8vIGAjIS91c3IvYmluL2VudiBub2RlYCBcdTYyN0VcdTRFMERcdTUyMzAgbm9kZVx1RkYwOGNsaSBcdTY2MkYgbm9kZSBcdTgxMUFcdTY3MkNcdUZGMDlcbiAgICAgICAgZW52OiB7IC4uLnByb2Nlc3MuZW52LCBQQVRIOiBnZXRFbmhhbmNlZFBhdGgoKSB9LFxuICAgICAgfTtcblxuICAgICAgLy8gXHU1OTA0XHU3NDA2IC0tY29udGVudCBAZmlsZVx1RkYxQVx1NzUyOFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOFx1NTc1MVx1RkYxQVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1ODhBQlx1NjJEMlx1RkYwOVxuICAgICAgY29uc3QgY29udGVudElkeCA9IGZ1bGxBcmdzLmluZGV4T2YoJy0tY29udGVudCcpO1xuICAgICAgaWYgKGNvbnRlbnRJZHggIT09IC0xICYmIGNvbnRlbnRJZHggKyAxIDwgZnVsbEFyZ3MubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRWYWwgPSBmdWxsQXJnc1tjb250ZW50SWR4ICsgMV07XG4gICAgICAgIGlmIChjb250ZW50VmFsLnN0YXJ0c1dpdGgoJ0AnKSkge1xuICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gY29udGVudFZhbC5zbGljZSgxKTtcbiAgICAgICAgICBjb25zdCBkaXIgPSBjd2QgfHwgcGF0aC5kaXJuYW1lKGZpbGVQYXRoKTtcbiAgICAgICAgICBjb25zdCBiYXNlTmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpO1xuICAgICAgICAgIGZ1bGxBcmdzW2NvbnRlbnRJZHggKyAxXSA9IGBALi8ke2Jhc2VOYW1lfWA7XG4gICAgICAgICAgZXhlY09wdHMuY3dkID0gZGlyO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGN3ZCkge1xuICAgICAgICBleGVjT3B0cy5jd2QgPSBjd2Q7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTE5OVx1NTE2NVx1NTI0RCBlbW9qaSBcdTZFMDVcdTZEMTdcdUZGMUFcdTYyNkJcdTYzQ0YgZnVsbEFyZ3MgXHU0RTJEIC0tY29udGVudCBAZmlsZSBcdTc2ODRcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcbiAgICAgIGlmIChjb250ZW50SWR4ICE9PSAtMSAmJiBjb250ZW50SWR4ICsgMSA8IGZ1bGxBcmdzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGZ1bGxBcmdzW2NvbnRlbnRJZHggKyAxXS5yZXBsYWNlKC9eQFxcLlxcLy8sICcnKTtcbiAgICAgICAgY29uc3QgZXhlY3V0aW9uRGlyZWN0b3J5ID0gdHlwZW9mIGV4ZWNPcHRzLmN3ZCA9PT0gJ3N0cmluZycgPyBleGVjT3B0cy5jd2QgOiBwcm9jZXNzLmN3ZCgpO1xuICAgICAgICBjb25zdCBmdWxsRmlsZVBhdGggPSBwYXRoLmpvaW4oZXhlY3V0aW9uRGlyZWN0b3J5LCBmaWxlUGF0aCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbGV0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbEZpbGVQYXRoLCAndXRmOCcpO1xuICAgICAgICAgIGNvbnRlbnQgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhjb250ZW50KTtcbiAgICAgICAgICAvLyBcdTUzQ0RcdThGNkNcdTRFNDkgXFx+IFx1MjE5MiB+XHVGRjA4XHU5OERFXHU0RTY2XHU4QkZCXHU1NkRFXHU2NzY1XHU2NUY2XHU4RjZDXHU0RTQ5XHU0RTg2XHU2Q0UyXHU2RDZBXHU1M0Y3XHVGRjA5XG4gICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvXFxcXH4vZywgJ34nKTtcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZ1bGxGaWxlUGF0aCwgY29udGVudCwgJ3V0ZjgnKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgLy8gXHU2NTg3XHU0RUY2XHU4QkZCXHU0RTBEXHU1MjMwXHU1QzMxXHU4REYzXHU4RkM3XHU2RTA1XHU2RDE3XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gXHU3NTI4IGV4ZWNGaWxlU3luYyBcdTc2RjRcdTYzQTVcdTYyNjdcdTg4NENcdUZGMENcdTRFMERcdThENzAgc2hlbGxcdUZGMDhcdTUzQzJcdTY1NzBcdTVCODlcdTUxNjggKyBcdTU4OUVcdTVGM0EgUEFUSCBcdTc1MUZcdTY1NDhcdUZGMDlcbiAgICAgIGxldCBzdGRvdXQgPSBleGVjRmlsZVN5bmMoY2xpUGF0aCwgZnVsbEFyZ3MsIGV4ZWNPcHRzKTtcblxuICAgICAgLy8gXHU1NkRFXHU4QkZCXHU1NDBFXHU1M0NEXHU4RjZDXHU0RTQ5XHVGRjFBXHU5OERFXHU0RTY2IG1kIFx1NjI4QSB+IFx1OEY2Q1x1NEU0OVx1NjIxMCBcXH5cbiAgICAgIHN0ZG91dCA9IHVuZXNjYXBlRmVpc2h1VGlsZGUoc3Rkb3V0KTtcblxuICAgICAgLy8gXHU4OUUzXHU1MzA1IGxhcmstY2xpIFx1NjgwN1x1NTFDNiBKU09OIFx1NTMwNVx1ODhDNVx1RkYxQXtvaywgaWRlbnRpdHksIGRhdGE6e2RvY3VtZW50Ontjb250ZW50fX19IFx1MjE5MiBcdTdFQUZcdTZCNjNcdTY1ODdcbiAgICAgIC8vIGRvY3MgK2ZldGNoIFx1OUVEOFx1OEJBNCAtLWZvcm1hdCBqc29uXHVGRjBDXHU2QjYzXHU2NTg3XHU1RDRDXHU1NzI4IGRhdGEuZG9jdW1lbnQuY29udGVudCBcdTkxQ0NcbiAgICAgIHN0ZG91dCA9IHVud3JhcExhcmtFbnZlbG9wZShzdGRvdXQpO1xuXG4gICAgICAvLyBKU09OIFx1NkEyMVx1NUYwRlx1RkYxQVx1OERGM1x1OEZDNyBcIkZvdW5kIFggbm9kZShzKVwiIFx1NTI0RFx1N0YwMFx1RkYwOFx1NTc1MVx1RkYxQW5vZGUtbGlzdCBcdThGOTNcdTUxRkFcdTU0MkJcdTY1RTVcdTVGRDdcdTg4NENcdUZGMDlcbiAgICAgIGlmIChqc29uKSB7XG4gICAgICAgIGNvbnN0IGJyYWNlSWR4ID0gc3Rkb3V0LmluZGV4T2YoJ3snKTtcbiAgICAgICAgaWYgKGJyYWNlSWR4ICE9PSAtMSkge1xuICAgICAgICAgIHN0ZG91dCA9IHN0ZG91dC5zbGljZShicmFjZUlkeCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0ZG91dC50cmltKCk7XG4gICAgfSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XG4gICAgICBsYXN0RXJyb3IgPSBlcnIgYXMgRXJyb3I7XG4gICAgICBjb25zdCBlcnJNc2cgPSAoZXJyIGFzIEVycm9yKT8ubWVzc2FnZSA/PyBTdHJpbmcoZXJyKTtcblxuICAgICAgLy8gNDI5IFx1OTY1MFx1NkQ0MVx1NjIxNlx1N0Y1MVx1N0VEQ1x1OTUxOVx1OEJFRlx1RkYxQVx1OTFDRFx1OEJENVx1RkYwOFx1NjMwN1x1NjU3MFx1OTAwMFx1OTA3Rlx1RkYwOVxuICAgICAgaWYgKFxuICAgICAgICBlcnJNc2cuaW5jbHVkZXMoJzQyOScpIHx8XG4gICAgICAgIGVyck1zZy5pbmNsdWRlcygnRVRJTUVET1VUJykgfHxcbiAgICAgICAgZXJyTXNnLmluY2x1ZGVzKCdFQ09OTlJFU0VUJykgfHxcbiAgICAgICAgZXJyTXNnLmluY2x1ZGVzKCdzb2NrZXQgaGFuZyB1cCcpXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgZGVsYXkgPSBNYXRoLm1pbigxMDAwICogTWF0aC5wb3coMiwgYXR0ZW1wdCAtIDEpLCAxMDAwMCk7XG4gICAgICAgIGNvbnNvbGUud2FybihgW3N5bmMvbGFya10gYXR0ZW1wdCAke2F0dGVtcHR9IGZhaWxlZCwgcmV0cnlpbmcgaW4gJHtkZWxheX1tczogJHtlcnJNc2d9YCk7XG4gICAgICAgIC8vIFx1NEUwRFx1NEY5RFx1OEQ1NiBzaGVsbCBcdTc2ODQgc2xlZXBcdUZGMDhBdG9taWNzLndhaXQgXHU1NDBDXHU2QjY1XHU5NjNCXHU1ODVFXHVGRjA5XG4gICAgICAgIGNvbnN0IG1zID0gZGVsYXk7XG4gICAgICAgIGNvbnN0IGJ1ZiA9IG5ldyBJbnQzMkFycmF5KG5ldyBTaGFyZWRBcnJheUJ1ZmZlcig0KSk7XG4gICAgICAgIEF0b21pY3Mud2FpdChidWYsIDAsIDAsIG1zKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTE3Nlx1NEVENlx1OTUxOVx1OEJFRlx1NzZGNFx1NjNBNVx1NjI5QlxuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdGhyb3cgbGFzdEVycm9yID8/IG5ldyBFcnJvcignbGFyay1jbGkgcnVuIGZhaWxlZCB3aXRoIHVua25vd24gZXJyb3InKTtcbn1cblxuLyoqXG4gKiBcdTg5RTNcdTUzMDUgbGFyay1jbGkgXHU2ODA3XHU1MUM2IEpTT04gXHU1MzA1XHU4OEM1XHUzMDAyXG4gKlxuICogbGFyay1jbGkgXHU3Njg0IGRvY3MgK2ZldGNoIFx1N0I0OVx1NTQ3RFx1NEVFNFx1OUVEOFx1OEJBNCBgLS1mb3JtYXQganNvbmBcdUZGMENcdThGRDRcdTU2REVcdUZGMUFcbiAqICAgeyBcIm9rXCI6IHRydWUsIFwiaWRlbnRpdHlcIjogXCIuLi5cIiwgXCJkYXRhXCI6IHsgXCJkb2N1bWVudFwiOiB7IFwiY29udGVudFwiOiBcIjxcdTc3MUZcdTVCOUVcdTZCNjNcdTY1ODc+XCIgfSB9LCAuLi4gfVxuICogXHU1NDBDXHU2QjY1XHU5NEZFXHU4REVGXHU5NzAwXHU4OTgxXHU3Njg0XHU2NjJGXHU3RUFGXHU2QjYzXHU2NTg3XHVGRjA4bWFya2Rvd24veG1sXHVGRjA5XHVGRjBDXHU0RTBEXHU2NjJGXHU2NTc0XHU0RTJBIGVudmVsb3BlXHUzMDAyXG4gKlxuICogXHU1MjI0XHU1QjlBXHVGRjFBc3Rkb3V0IFx1OTk5Nlx1NEUyQVx1OTc1RVx1N0E3QVx1NzY3RFx1NUI1N1x1N0IyNlx1NjYyRiBge2BcdUZGMENcdTRFMTRcdTg5RTNcdTY3OTBcdTU0MEVcdTU0MkIgb2sgXHU1QjU3XHU2QkI1ICsgZGF0YS5kb2N1bWVudC5jb250ZW50XHVGRjBDXG4gKiBcdTYyNERcdThCQTRcdTRFM0FcdTY2MkYgZW52ZWxvcGUgXHU1RTc2XHU4OUUzXHU1MzA1XHVGRjFCXHU1NDI2XHU1MjE5XHU1MzlGXHU2ODM3XHU4RkQ0XHU1NkRFXHVGRjA4XHU0RkREXHU3NTU5IHdpa2kgK25vZGUtbGlzdCBcdTdCNDlcdTdFQUYgSlNPTiBcdTU0Q0RcdTVFOTRcdTdFRDkganNvbiBcdTZBMjFcdTVGMEZcdTU5MDRcdTc0MDZcdUZGMDlcdTMwMDJcbiAqL1xuZnVuY3Rpb24gdW53cmFwTGFya0VudmVsb3BlKHN0ZG91dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgdHJpbW1lZCA9IHN0ZG91dC50cmltU3RhcnQoKTtcbiAgaWYgKCF0cmltbWVkLnN0YXJ0c1dpdGgoJ3snKSkgcmV0dXJuIHN0ZG91dDtcbiAgbGV0IHBhcnNlZDogdW5rbm93bjtcbiAgdHJ5IHtcbiAgICBwYXJzZWQgPSBKU09OLnBhcnNlKHRyaW1tZWQpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gc3Rkb3V0OyAvLyBcdTRFMERcdTY2MkZcdTU0MDhcdTZDRDUgSlNPTlx1RkYwQ1x1NTM5Rlx1NjgzN1x1OEZENFx1NTZERVxuICB9XG4gIGNvbnN0IGVudiA9IHBhcnNlZCBhcyB7IG9rPzogdW5rbm93bjsgZGF0YT86IHsgZG9jdW1lbnQ/OiB7IGNvbnRlbnQ/OiB1bmtub3duIH0gfSB9O1xuICAvLyBcdTRFQzVcdTVGNTNcdTY2MkZcdTU0MkIgZG9jdW1lbnQuY29udGVudCBcdTc2ODRcdTY4MDdcdTUxQzYgZW52ZWxvcGUgXHU2MjREXHU4OUUzXHU1MzA1XG4gIGlmIChlbnYgJiYgdHlwZW9mIGVudi5vayA9PT0gJ2Jvb2xlYW4nICYmIGVudi5kYXRhPy5kb2N1bWVudD8uY29udGVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgY29udGVudCA9IGVudi5kYXRhLmRvY3VtZW50LmNvbnRlbnQ7XG4gICAgcmV0dXJuIHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJyA/IGNvbnRlbnQgOiBKU09OLnN0cmluZ2lmeShjb250ZW50KTtcbiAgfVxuICByZXR1cm4gc3Rkb3V0O1xufVxuXG4vKipcbiAqIFx1NTZERVx1NTE5OVx1OThERVx1NEU2Nlx1NjU4N1x1Njg2M1x1RkYwOG1hcmtkb3duIG92ZXJ3cml0ZSArIFx1NjgwN1x1OTg5OFx1NEZFRVx1NTkwRFx1RkYwOVx1MzAwMlxuICogXHU0RjlEXHU2MzZFXHU1REYyXHU3N0U1XHU1NzUxXHVGRjFBb3ZlcndyaXRlIFx1NTQwRVx1NjgwN1x1OTg5OFx1NTNEOCBVbnRpdGxlZCBcdTIxOTIgXHU4RkZEXHU1MkEwIHN0cl9yZXBsYWNlIFx1NEZFRSA8dGl0bGU+XHUzMDAyXG4gKlxuICogQHBhcmFtIHRva2VuIGRvY3ggb2JqX3Rva2VuIFx1NjIxNiBub2RlX3Rva2VuXG4gKiBAcGFyYW0gY29udGVudCBcdTZCNjNcdTY1ODcgbWFya2Rvd25cdUZGMDhcdTRFMERcdTU0MkIgZnJvbnRtYXR0ZXJcdUZGMDlcbiAqIEBwYXJhbSB0aXRsZSBcdTY1ODdcdTY4NjNcdTY4MDdcdTk4OThcdUZGMDhcdTVFMjYgZW1vamlcdUZGMDlcbiAqIEBwYXJhbSBjd2QgXHU1REU1XHU0RjVDXHU3NkVFXHU1RjU1XHVGRjA4XHU3NTI4XHU0RThFIEBmaWxlIFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gb3ZlcndyaXRlRG9jKHRva2VuOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZywgdGl0bGU6IHN0cmluZywgY3dkPzogc3RyaW5nKTogdm9pZCB7XG4gIC8vIFx1NTE5OVx1NEUzNFx1NjVGNlx1NjU4N1x1NEVGNlx1RkYwOG92ZXJ3cml0ZSBcdTk3MDBcdTg5ODFcdTc1MjggQGZpbGVcdUZGMDlcbiAgY29uc3QgdG1wRGlyID0gY3dkIHx8IHByb2Nlc3MuY3dkKCk7XG4gIGNvbnN0IHRtcEZpbGUgPSBwYXRoLmpvaW4odG1wRGlyLCAnLi8uZmVpc2h1LXN5bmMtdGVtcC5tZCcpO1xuXG4gIC8vIFx1NkUwNVx1NkQxN1x1RkYxQXN0cmlwIGVtb2ppIFZTICsgXHU1M0NEXHU4RjZDXHU0RTQ5IFxcflxuICBjb25zdCBjbGVhbmVkID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMoY29udGVudCk7XG5cbiAgZnMud3JpdGVGaWxlU3luYyh0bXBGaWxlLCBjbGVhbmVkLCAndXRmOCcpO1xuXG4gIHRyeSB7XG4gICAgLy8gb3ZlcndyaXRlXG4gICAgcnVuKFsnZG9jcycsICcrdXBkYXRlJywgJy0tZG9jJywgdG9rZW4sICctLWNvbW1hbmQnLCAnb3ZlcndyaXRlJywgJy0tZG9jLWZvcm1hdCcsICdtYXJrZG93bicsICctLWNvbnRlbnQnLCBgQC4vLmZlaXNodS1zeW5jLXRlbXAubWRgXSwgeyBjd2Q6IHRtcERpciB9KTtcblxuICAgIC8vIFx1NjgwN1x1OTg5OFx1NEZFRVx1NTkwRFx1RkYxQXN0cl9yZXBsYWNlIFx1NEZFRSA8dGl0bGU+XG4gICAgY29uc3QgY2xlYW5UaXRsZSA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKHRpdGxlKTtcbiAgICBydW4oW1xuICAgICAgJ2RvY3MnLCAnK3VwZGF0ZScsICctLWRvYycsIHRva2VuLFxuICAgICAgJy0tY29tbWFuZCcsICdzdHJfcmVwbGFjZScsXG4gICAgICAnLS1kb2MtZm9ybWF0JywgJ2pzb24nLFxuICAgICAgJy0tY29udGVudCcsIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgcmVxdWVzdDogW3tcbiAgICAgICAgICBibG9ja190eXBlOiAxLCAvLyBwYWdlXG4gICAgICAgICAgcGFnZToge1xuICAgICAgICAgICAgZWxlbWVudHM6IFt7XG4gICAgICAgICAgICAgIHRleHRfcnVuOiB7IGNvbnRlbnQ6IGNsZWFuVGl0bGUsIHRleHRfZWxlbWVudF9zdHlsZTogeyBib2xkOiB0cnVlIH0gfVxuICAgICAgICAgICAgfV1cbiAgICAgICAgICB9XG4gICAgICAgIH1dLFxuICAgICAgICBpbmRleDogMCxcbiAgICAgIH0pLFxuICAgIF0sIHsgY3dkOiB0bXBEaXIsIHRpbWVvdXQ6IDE1MDAwIH0pO1xuICB9IGZpbmFsbHkge1xuICAgIC8vIFx1NkUwNVx1NzQwNlx1NEUzNFx1NjVGNlx1NjU4N1x1NEVGNlxuICAgIHRyeSB7IGZzLnVubGlua1N5bmModG1wRmlsZSk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxuICB9XG59XG5cbi8qKlxuICogXHU1NkRFXHU1MTk5XHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzXHVGRjA4WE1MIFx1NjgzQ1x1NUYwRlx1RkYwQ1x1NTQyQiBjYWxsb3V0IFx1N0NCRVx1Nzg2RVx1NjNBN1x1NTIzNlx1RkYwOVx1MzAwMlxuICogXHU1NDBDXHU2ODM3XHU5NzAwXHU4OTgxXHU2ODA3XHU5ODk4XHU0RkVFXHU1OTBEXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvdmVyd3JpdGVEb2NYbWwodG9rZW46IHN0cmluZywgeG1sQ29udGVudDogc3RyaW5nLCB0aXRsZTogc3RyaW5nLCBjd2Q/OiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgdG1wRGlyID0gY3dkIHx8IHByb2Nlc3MuY3dkKCk7XG4gIGNvbnN0IHRtcEZpbGUgPSBwYXRoLmpvaW4odG1wRGlyLCAnLi8uZmVpc2h1LXN5bmMtdGVtcC54bWwnKTtcblxuICBjb25zdCBjbGVhbmVkID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMoeG1sQ29udGVudCk7XG4gIGZzLndyaXRlRmlsZVN5bmModG1wRmlsZSwgY2xlYW5lZCwgJ3V0ZjgnKTtcblxuICB0cnkge1xuICAgIHJ1bihbJ2RvY3MnLCAnK3VwZGF0ZScsICctLWRvYycsIHRva2VuLCAnLS1jb21tYW5kJywgJ292ZXJ3cml0ZScsICctLWRvYy1mb3JtYXQnLCAneG1sJywgJy0tY29udGVudCcsIGBALi8uZmVpc2h1LXN5bmMtdGVtcC54bWxgXSwgeyBjd2Q6IHRtcERpciB9KTtcblxuICAgIC8vIFx1NjgwN1x1OTg5OFx1NEZFRVx1NTkwRFxuICAgIGNvbnN0IGNsZWFuVGl0bGUgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyh0aXRsZSk7XG4gICAgcnVuKFtcbiAgICAgICdkb2NzJywgJyt1cGRhdGUnLCAnLS1kb2MnLCB0b2tlbixcbiAgICAgICctLWNvbW1hbmQnLCAnc3RyX3JlcGxhY2UnLFxuICAgICAgJy0tZG9jLWZvcm1hdCcsICdqc29uJyxcbiAgICAgICctLWNvbnRlbnQnLCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHJlcXVlc3Q6IFt7XG4gICAgICAgICAgYmxvY2tfdHlwZTogMSxcbiAgICAgICAgICBwYWdlOiB7XG4gICAgICAgICAgICBlbGVtZW50czogW3tcbiAgICAgICAgICAgICAgdGV4dF9ydW46IHsgY29udGVudDogY2xlYW5UaXRsZSwgdGV4dF9lbGVtZW50X3N0eWxlOiB7IGJvbGQ6IHRydWUgfSB9XG4gICAgICAgICAgICB9XVxuICAgICAgICAgIH1cbiAgICAgICAgfV0sXG4gICAgICAgIGluZGV4OiAwLFxuICAgICAgfSksXG4gICAgXSwgeyBjd2Q6IHRtcERpciwgdGltZW91dDogMTUwMDAgfSk7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHsgZnMudW5saW5rU3luYyh0bXBGaWxlKTsgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG4gIH1cbn1cblxuLyoqXG4gKiBcdTRFQ0VcdTk4REVcdTRFNjYgd2lraSBVUkwgXHU4OUUzXHU2NzkwIG5vZGVfdG9rZW5cdTMwMDJcbiAqIFVSTCBcdTVGNjJcdTU5ODJcdUZGMUFodHRwczovL3h4eC5mZWlzaHUuY24vd2lraS9OT0RFX1RPS0VOXHUzMDAxL2RvY3gvT0JKX1RPS0VOIFx1NjIxNiAvZG9jL09CSl9UT0tFTlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZU5vZGVUb2tlbkZyb21VcmwodXJsOiBzdHJpbmcpOiB7IG5vZGVfdG9rZW4/OiBzdHJpbmc7IG9ial90b2tlbj86IHN0cmluZyB9IHtcbiAgLy8gd2lraSBub2RlXG4gIGNvbnN0IHdpa2lNYXRjaCA9IHVybC5tYXRjaCgvXFwvd2lraVxcLyhbQS1aYS16MC05XSspLyk7XG4gIGlmICh3aWtpTWF0Y2gpIHJldHVybiB7IG5vZGVfdG9rZW46IHdpa2lNYXRjaFsxXSB9O1xuXG4gIC8vIGRvY3ggb2JqXG4gIGNvbnN0IGRvY3hNYXRjaCA9IHVybC5tYXRjaCgvXFwvZG9jeFxcLyhbQS1aYS16MC05XSspLyk7XG4gIGlmIChkb2N4TWF0Y2gpIHJldHVybiB7IG9ial90b2tlbjogZG9jeE1hdGNoWzFdIH07XG5cbiAgcmV0dXJuIHt9O1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENiB3aWtpIFx1ODI4Mlx1NzBCOVx1NzY4NCBkb2N4IG9ial90b2tlblx1MzAwMlxuICogYHdpa2kgK25vZGUtZ2V0IC0tbm9kZS10b2tlbiA8dXJsPiAtLXNwYWNlLWlkIDxpZD5gXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRXaWtpTm9kZUluZm8obm9kZVRva2VuOiBzdHJpbmcsIHNwYWNlSWQ6IHN0cmluZyk6IHsgb2JqX3Rva2VuOiBzdHJpbmc7IHRpdGxlOiBzdHJpbmcgfSB8IG51bGwge1xuICB0cnkge1xuICAgIGNvbnN0IG91dHB1dCA9IHJ1bihbXG4gICAgICAnd2lraScsICcrbm9kZS1nZXQnLFxuICAgICAgJy0tbm9kZS10b2tlbicsIG5vZGVUb2tlbixcbiAgICAgICctLXNwYWNlLWlkJywgc3BhY2VJZCxcbiAgICBdLCB7IGpzb246IHRydWUgfSk7XG4gICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2Uob3V0cHV0KTtcbiAgICAvLyBcdTgyODJcdTcwQjlcdTUzRUZcdTgwRkRcdTY3MDkgbm9kZSBcdTYyMTZcdTc2RjRcdTYzQTVcdTY2MkYgb2JqX3Rva2VuXG4gICAgY29uc3Qgb2JqVG9rZW4gPSBkYXRhPy5ub2RlPy5vYmpfdG9rZW4gPz8gZGF0YT8ub2JqX3Rva2VuID8/IGRhdGE/Lm9ial90b2tlbjtcbiAgICBjb25zdCB0aXRsZSA9IGRhdGE/Lm5vZGU/LnRpdGxlID8/IGRhdGE/LnRpdGxlID8/ICcnO1xuICAgIGlmIChvYmpUb2tlbikgcmV0dXJuIHsgb2JqX3Rva2VuOiBvYmpUb2tlbiwgdGl0bGUgfTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS53YXJuKCdbc3luYy9sYXJrXSB3aWtpICtub2RlLWdldCBmYWlsZWQ6JywgZXJyKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1OThERVx1NEU2Nlx1NzdFNVx1OEJDNlx1NUU5M1x1NUI1MFx1ODI4Mlx1NzBCOVx1NTIxN1x1ODg2OFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGlzdFdpa2lDaGlsZHJlbihzcGFjZUlkOiBzdHJpbmcsIHBhcmVudFRva2VuOiBzdHJpbmcpOiBBcnJheTx7IG5vZGVfdG9rZW46IHN0cmluZzsgdGl0bGU6IHN0cmluZzsgb2JqX3Rva2VuOiBzdHJpbmcgfT4ge1xuICB0cnkge1xuICAgIGNvbnN0IG91dHB1dCA9IHJ1bihbXG4gICAgICAnd2lraScsICcrbm9kZS1saXN0JyxcbiAgICAgICctLXNwYWNlLWlkJywgc3BhY2VJZCxcbiAgICAgICctLXBhcmVudC1ub2RlLXRva2VuJywgcGFyZW50VG9rZW4sXG4gICAgXSwgeyBqc29uOiB0cnVlIH0pO1xuICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKG91dHB1dCk7XG4gICAgY29uc3QgaXRlbXMgPSBkYXRhPy5pdGVtcyA/PyBkYXRhPy5ub2RlcyA/PyBbXTtcbiAgICByZXR1cm4gaXRlbXMubWFwKChuOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gKHtcbiAgICAgIG5vZGVfdG9rZW46IG4ubm9kZV90b2tlbiA/PyAnJyxcbiAgICAgIHRpdGxlOiBuLnRpdGxlID8/ICcnLFxuICAgICAgb2JqX3Rva2VuOiBuLm9ial90b2tlbiA/PyAnJyxcbiAgICB9KSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUud2FybignW3N5bmMvbGFya10gd2lraSArbm9kZS1saXN0IGZhaWxlZDonLCBlcnIpO1xuICAgIHJldHVybiBbXTtcbiAgfVxufVxuIiwgIi8qKlxuICogXHU1NDBDXHU2QjY1XHU3RUQxXHU1QjlBICsgWUFNTCBmcm9udG1hdHRlciBcdTY1NzBcdTYzNkVcdTZBMjFcdTU3OEJcdTMwMDJcbiAqXG4gKiBcdTRGOURcdTYzNkVcdUZGMUFgXHU4QkJFXHU4QkExXHU2NUI5XHU2ODQ4LzAyX1lBTUxcdTVCNTdcdTZCQjVcdTg5QzRcdTgzMDMubWRgXHVGRjA4XHU2NzQzXHU1QTAxIHYxXHVGRjA5KyBgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTc1LjFcdTMwMDJcbiAqIFx1OTRDMVx1NUY4Qlx1RkYxQVx1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QVx1N0VDNFx1RkYwOGZlaXNodV8qXHVGRjA5XHU3NTMxXHU2M0QyXHU0RUY2XHU4MUVBXHU1MkE4XHU1MTk5XHVGRjBDXHU3NTI4XHU2MjM3XHU0RTBEXHU1M0VGXHU2MjRCXHU2NTM5XHUzMDAyXG4gKi9cblxuLyoqIFx1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QVx1N0VDNFx1RkYwOFx1NjgzOFx1NUZDM1x1RkYwQ1x1NEUwRFx1NTNFRlx1NjI0Qlx1NjUzOVx1RkYwOVx1MzAwMlx1NUJGOVx1NUU5NCBZQU1MIFx1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QVx1NkJCNVx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBTeW5jQmluZGluZyB7XG4gIC8qKiBcdTk4REVcdTRFNjYgd2lraSBub2RlX3Rva2VuXHVGRjA4XHU1NTJGXHU0RTAwXHU3RUQxXHU1QjlBXHVGRjA5XHUzMDAyICovXG4gIGZlaXNodV9pZDogc3RyaW5nO1xuICAvKiogXHU5OERFXHU0RTY2IGRvY3ggb2JqX3Rva2VuXHVGRjA4XHU1NkRFXHU1MTk5XHU3NTI4XHVGRjA5XHUzMDAyICovXG4gIGZlaXNodV9kb2NfaWQ6IHN0cmluZztcbiAgLyoqIFx1OThERVx1NEU2Nlx1NTM5Rlx1NTlDQlx1NjgwN1x1OTg5OFx1RkYwOFx1NTQyQiBlbW9qaVx1RkYwQ1x1NTZERVx1NTE5OVx1NjVGNlx1NzUyOFx1RkYwOVx1MzAwMiAqL1xuICBmZWlzaHVfdGl0bGU6IHN0cmluZztcbiAgLyoqIFx1NEUwQVx1NkIyMVx1NTQwQ1x1NkI2NVx1NTE4NVx1NUJCOSBoYXNoXHVGRjA4XHU4RjdCXHU2ODM4XHU5QThDXHU3NTI4XHVGRjBDc2hhMjU2IGhleFx1RkYwOVx1MzAwMiAqL1xuICBzeW5jX2hhc2g/OiBzdHJpbmc7XG4gIC8qKiBcdTRFMEFcdTZCMjFcdTU0MENcdTZCNjVcdTY1RjZcdTk1RjRcdUZGMDhJU084NjAxXHVGRjBDXHU1RTI2XHU2NUY2XHU1MzNBXHVGRjA5XHUzMDAyICovXG4gIHN5bmNfdGltZT86IHN0cmluZztcbn1cblxuLyoqIFx1NjgwN1x1N0I3RVx1NUMwMVx1OTVFRFx1Njc5QVx1NEUzRVx1MzAwMlx1NEY5RFx1NjM2RSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3Mi4yXHUzMDAyICovXG5leHBvcnQgdHlwZSBUYWcgPSAnUycgfCAnWCcgfCAnTCcgfCAnWicgfCAnUScgfCAnSic7XG5cbmV4cG9ydCBjb25zdCBUQUdfTkFNRVM6IFJlY29yZDxUYWcsIHN0cmluZz4gPSB7XG4gIFM6ICdcdUQ4M0RcdURDRTVcdTY1MzZcdTk2QzYnLFxuICBYOiAnXHVEODNDXHVERkFGXHU5ODc5XHU3NkVFJyxcbiAgTDogJ1x1RDgzQ1x1REYzM1x1OTg4Nlx1NTdERicsXG4gIFo6ICdcdUQ4M0RcdURDREFcdThENDRcdTZFOTAnLFxuICBROiAnXHVEODNEXHVEQ0ExXHU3MDc1XHU2MTFGJyxcbiAgSjogJ1x1RDgzRFx1REVFMFx1RkUwRlx1NjI4MFx1ODBGRCcsXG59O1xuXG4vKiogXHU3N0U1XHU4QkM2XHU1RTkzXHU1MTQzXHU2NTcwXHU2MzZFXHVGRjA4T0IgXHU3RUY0XHU2MkE0XHVGRjBDXHU1NkRFXHU1MTk5XHU5OERFXHU0RTY2XHU2MjEwIGNhbGxvdXRcdUZGMDlcdTMwMDJcdTRGOURcdTYzNkUgYDAyX1lBTUxcdTVCNTdcdTZCQjVcdTg5QzRcdTgzMDMubWRgXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIEtub3dsZWRnZU1ldGEge1xuICAvKiogXHU2ODA3XHU3QjdFXHVGRjBDXHU1QzAxXHU5NUVEXHU2NzlBXHU0RTNFXHUzMDAyXHU3RjZFXHU0RkUxXHU1RUE2IDwwLjYgXHUyMTkyIFNcdTMwMDIgKi9cbiAgXHU2ODA3XHU3QjdFPzogVGFnO1xuICAvKiogXHU3RjE2XHU3ODAxXHVGRjBDYXV0by1yZW5hbWUgXHU1MjA2XHU5MTREXHVGRjBDXHU2ODNDXHU1RjBGIFlZX01NRERfXHU2ODA3XHU3QjdFX1x1NUU4Rlx1NTNGN1tfXHU1QjUwXHU1RThGXHU1M0Y3XVx1MzAwMiAqL1xuICBcdTdGMTZcdTc4MDE/OiBzdHJpbmc7XG4gIC8qKiBcdThGOTNcdTUxNjVcdTVCOENcdTY1NzRcdThERUZcdTVGODRcdUZGMDhcdTY3MDBcdTZERjFcdTZDRThcdTUxOENcdThERUZcdTVGODRcdUZGMDlcdTMwMDIgKi9cbiAgXHU4RjkzXHU1MTY1Pzogc3RyaW5nO1xuICAvKiogXHU2NUU1XHU2NzFGXHVGRjBDSVNPIFx1NjgzQ1x1NUYwRiBZWVlZLU1NLUREXHUzMDAyICovXG4gIFx1NjVFNVx1NjcxRj86IHN0cmluZztcbiAgLyoqIFx1NjVFNVx1NjcxRlx1N0QyMlx1NUYxNVx1RkYwQ1x1NTNFRlx1OTAwOVx1OTg3OVx1NjU3MFx1N0VDNFx1MzAwMiAqL1xuICBcdTY1RTVcdTY3MUZcdTdEMjJcdTVGMTU/OiBzdHJpbmdbXTtcbiAgLyoqIFx1NTE3M1x1OTUyRVx1OEJDRFx1RkYwQ1x1OTg3Rlx1NTNGN1x1NTIwNlx1OTY5NFx1MzAwMiAqL1xuICBcdTUxNzNcdTk1MkVcdThCQ0Q/OiBzdHJpbmc7XG4gIC8qKiBcdTY5ODJcdThGRjBcdUZGMENcdTdFRDlcdTU0MEVcdTdFRUQgQUkgXHU1RkVCXHU5MDFGXHU4QkM2XHU1MjJCXHU2NTg3XHU2ODYzXHU1MTg1XHU1QkI5XHU3NTI4XHUzMDAyICovXG4gIFx1Njk4Mlx1OEZGMD86IHN0cmluZztcbiAgLyoqIFx1OEJDNFx1NTIwNiAxLTVcdUZGMUJcdTY3MkFcdThCQzRcdTUyMDZcdTY1RjZcdTRGRERcdTc1NTlcdTdBN0FcdTUwM0NcdTRFRTVcdTY2M0VcdTVGMEZcdTUzNjBcdTRGNERcdTMwMDIgKi9cbiAgXHU4QkM0XHU1MjA2PzogbnVtYmVyIHwgJyc7XG4gIC8qKiBcdThCQzRcdTUyMDZcdTY2M0VcdTc5M0FcdTRFMzJcdUZGMENcdTU5ODIgXCJcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdUZGNUNcdTVCOUVcdThERjVcIlx1MzAwMiAqL1xuICBcdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBPzogc3RyaW5nO1xuICAvKiogXHU3RDIyXHU1RjE1X1x1NzdFNVx1OEJDNlx1NUU5M1x1RkYwOFx1NkI2M1x1OEQyMi9cdTUwNEZcdThEMjIvLi4uXHVGRjA5XHUzMDAyICovXG4gIFx1N0QyMlx1NUYxNV9cdTc3RTVcdThCQzZcdTVFOTM/OiBzdHJpbmc7XG4gIC8qKiBcdTdEMjJcdTVGMTVfXHU5ODlDXHU4MjcyXHUzMDAyICovXG4gIFx1N0QyMlx1NUYxNV9cdTk4OUNcdTgyNzI/OiBzdHJpbmc7XG4gIC8qKiBcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OFx1RkYwQ1x1NEUyNFx1N0VDNFx1OTAwOVx1NEUwMFx1RkYwOFx1NjBGM1x1NkNENS9cdTg5QzRcdTUyMTIvXHU2MjY3XHU4ODRDL1x1NTNEN1x1NjMyQi9cdTUxNEJcdTY3MEQgXHUwMEQ3IFx1NTIxRFx1N0EzRi9cdTVCQTFcdTY4MzgvXHU0RkVFXHU2NTM5L1x1NUI4Q1x1NjIxMC9cdTU5MERcdTc2RDhcdUZGMDlcdTMwMDIgKi9cbiAgJ1x1N0QyMlx1NUYxNV9cdTY0Q0RcdTRGNUMmXHU1M0NEXHU5OTg4Jz86IHN0cmluZ1tdO1xuICAvKiogXHU3RDIyXHU1RjE1X1x1NTc1N1x1RkYwQ1x1NTkxQVx1OTAwOVx1RkYwOFx1NTE3N1x1OEM2MS9cdTYyQkRcdThDNjEgXHUwMEQ3IFx1N0I4MFx1NTM1NS9cdTU2RjBcdTk2QkVcdUZGMDlcdTMwMDIgKi9cbiAgXHU3RDIyXHU1RjE1X1x1NTc1Nz86IHN0cmluZ1tdO1xuICAvKiogXHU3RDIyXHU1RjE1X1x1OThDRVx1OTY2OVx1RkYwQ1x1OTZGNlx1NjIxNlx1NTkxQVx1NEUyQVx1MzAwMiAqL1xuICBcdTdEMjJcdTVGMTVfXHU5OENFXHU5NjY5Pzogc3RyaW5nW107XG59XG5cbi8qKiBPQiBcdTY1ODdcdTRFRjZcdTVCOENcdTY1NzQgZnJvbnRtYXR0ZXIgPSBcdTU0MENcdTZCNjVcdTdFRDFcdTVCOUEgKyBcdTc3RTVcdThCQzZcdTVFOTNcdTUxNDNcdTY1NzBcdTYzNkVcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgWUFNTEZyb250bWF0dGVyIGV4dGVuZHMgU3luY0JpbmRpbmcsIEtub3dsZWRnZU1ldGEsIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHt9XG5cbi8qKiBPQlx1MjE5Mlx1OThERVx1NEU2NiBjYWxsb3V0IFx1NUI1N1x1NkJCNVx1NjYyMFx1NUMwNFx1OTg3OVx1MzAwMlx1NEY5RFx1NjM2RSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU0RTk0XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIENhbGxvdXRGaWVsZE1hcCB7XG4gIC8qKiBZQU1MIFx1NUI1N1x1NkJCNVx1NTQwRFx1MzAwMiAqL1xuICBmaWVsZDoga2V5b2YgS25vd2xlZGdlTWV0YTtcbiAgLyoqIGNhbGxvdXQgXHU5MUNDXHU2NjNFXHU3OTNBXHU3Njg0XHU0RTJEXHU2NTg3XHU2ODA3XHU3QjdFXHUzMDAyICovXG4gIGxhYmVsOiBzdHJpbmc7XG4gIC8qKiBlbW9qaVx1RkYwOFx1NEUwRFx1NUUyNiB2YXJpYXRpb24gc2VsZWN0b3JcdUZGMDlcdTMwMDIgKi9cbiAgZW1vamk6IHN0cmluZztcbn1cblxuLyoqXG4gKiBZQU1MIFx1NUI1N1x1NkJCNSBcdTIxOTIgXHU5OERFXHU0RTY2IGNhbGxvdXQgXHU4ODRDXHU2NjIwXHU1QzA0XHUzMDAyXHU0RjlEXHU2MzZFIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTRFOTRcdTMwMDJcbiAqIFx1NkNFOFx1NjEwRiBlbW9qaSBcdTUxNjhcdTkwRThcdTRFMERcdTVFMjYgVStGRTBGXHVGRjA4XHU5OERFXHU0RTY2XHU0RTBEXHU4QkE0IFZTXHVGRjBDXHU4OUMxIDAzIFx1NjU4N1x1Njg2MyBcdTAwQTczLjNcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGNvbnN0IENBTExPVVRfRklFTERfTUFQOiBDYWxsb3V0RmllbGRNYXBbXSA9IFtcbiAgeyBmaWVsZDogJ1x1NjgwN1x1N0I3RScsIGxhYmVsOiAnXHU2ODA3XHU3QjdFJywgZW1vamk6ICdcdUQ4M0NcdURGRjcnIH0sXG4gIHsgZmllbGQ6ICdcdTdGMTZcdTc4MDEnLCBsYWJlbDogJ1x1N0YxNlx1NzgwMScsIGVtb2ppOiAnXHVEODNEXHVERDIyJyB9LFxuICB7IGZpZWxkOiAnXHU4RjkzXHU1MTY1JywgbGFiZWw6ICdcdThGOTNcdTUxNjUnLCBlbW9qaTogJ1x1RDgzRFx1RENFNScgfSxcbiAgeyBmaWVsZDogJ1x1NjVFNVx1NjcxRicsIGxhYmVsOiAnXHU2NUU1XHU2NzFGJywgZW1vamk6ICdcdUQ4M0RcdURDQzUnIH0sXG4gIHsgZmllbGQ6ICdcdTUxNzNcdTk1MkVcdThCQ0QnLCBsYWJlbDogJ1x1NTE3M1x1OTUyRVx1OEJDRCcsIGVtb2ppOiAnXHVEODNEXHVERDExJyB9LFxuICB7IGZpZWxkOiAnXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQScsIGxhYmVsOiAnXHU4QkM0XHU1MjA2JywgZW1vamk6ICdcdTJCNTAnIH0sXG4gIHsgZmllbGQ6ICdcdTdEMjJcdTVGMTVfXHU3N0U1XHU4QkM2XHU1RTkzJywgbGFiZWw6ICdcdTdEMjJcdTVGMTUnLCBlbW9qaTogJ1x1RDgzRFx1RENCMCcgfSxcbl07XG5cbi8qKiBPQlx1MjE5Mlx1OThERVx1NEU2NiBjYWxsb3V0IFx1NjU3NFx1NEY1M1x1OTE0RFx1ODI3Mlx1RkYwOFx1NTQwOFx1NUU3Nlx1NEZFMVx1NjA2Rlx1NTc1N1x1NzUyOFx1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IERPQ19JTkZPX0NBTExPVVQgPSB7XG4gIGVtb2ppOiAnXHVEODNEXHVEQ0NCJyxcbiAgJ2JhY2tncm91bmQtY29sb3InOiAnbGlnaHQtYmx1ZScsXG4gICdib3JkZXItY29sb3InOiAnYmx1ZScsXG59IGFzIGNvbnN0O1xuXG4vKiogXHU5OERFXHU0RTY2IGNhbGxvdXQgXHU4MENDXHU2NjZGXHU4MjcyIFx1MjE5MiBPQiBjYWxsb3V0IFx1N0M3Qlx1NTc4Qlx1MzAwMlx1NEY5RFx1NjM2RSBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTczLjFcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBGRUlTSFVfQkdfVE9fT0JfQ0FMTE9VVDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJ2xpZ2h0LXllbGxvdyc6ICd0aXAnLFxuICAnbWVkaXVtLXJlZCc6ICd3YXJuaW5nJyxcbiAgJ2xpZ2h0LWdyZWVuJzogJ3N1Y2Nlc3MnLFxuICAnbGlnaHQtYmx1ZSc6ICdpbmZvJyxcbiAgJ2xpZ2h0LXB1cnBsZSc6ICdub3RlJyxcbiAgJ2xpZ2h0LWdyYXknOiAncXVvdGUnLFxuICAnbGlnaHQtb3JhbmdlJzogJ2ZhcScsXG59O1xuXG4vKiogT0IgY2FsbG91dCBcdTdDN0JcdTU3OEIgXHUyMTkyIFx1OThERVx1NEU2NiBjYWxsb3V0IFx1OTE0RFx1ODI3Mlx1MzAwMlx1MDBBNzMuMSBcdTUzQ0RcdTU0MTFcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBPQl9DQUxMT1VUX1RPX0ZFSVNIVTogUmVjb3JkPHN0cmluZywgeyBlbW9qaTogc3RyaW5nOyBiZzogc3RyaW5nOyBib3JkZXI6IHN0cmluZyB9PiA9IHtcbiAgdGlwOiB7IGVtb2ppOiAnXHVEODNEXHVEQ0ExJywgYmc6ICdsaWdodC15ZWxsb3cnLCBib3JkZXI6ICd5ZWxsb3cnIH0sXG4gIHdhcm5pbmc6IHsgZW1vamk6ICdcdTI2QTBcdUZFMEYnLCBiZzogJ21lZGl1bS1yZWQnLCBib3JkZXI6ICdyZWQnIH0sXG4gIHN1Y2Nlc3M6IHsgZW1vamk6ICdcdTI3MDUnLCBiZzogJ2xpZ2h0LWdyZWVuJywgYm9yZGVyOiAnZ3JlZW4nIH0sXG4gIGluZm86IHsgZW1vamk6ICdcdTIxMzlcdUZFMEYnLCBiZzogJ2xpZ2h0LWJsdWUnLCBib3JkZXI6ICdibHVlJyB9LFxuICBub3RlOiB7IGVtb2ppOiAnXHVEODNEXHVEQ0REJywgYmc6ICdsaWdodC1wdXJwbGUnLCBib3JkZXI6ICdwdXJwbGUnIH0sXG4gIHF1b3RlOiB7IGVtb2ppOiAnXHVEODNEXHVEQ0FDJywgYmc6ICdsaWdodC1ncmF5JywgYm9yZGVyOiAnZ3JheScgfSxcbiAgZmFxOiB7IGVtb2ppOiAnXHUyNzUzJywgYmc6ICdsaWdodC1vcmFuZ2UnLCBib3JkZXI6ICdvcmFuZ2UnIH0sXG4gIGFic3RyYWN0OiB7IGVtb2ppOiAnXHVEODNEXHVEQ0NCJywgYmc6ICdsaWdodC1ibHVlJywgYm9yZGVyOiAnYmx1ZScgfSxcbn07XG4iLCAiaW1wb3J0IHR5cGUgeyBLbm93bGVkZ2VNZXRhIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5cbi8qKlxuICogbG9jYWxob3N0IEhUVFAgXHU1MzRGXHU4QkFFXHU1OTUxXHU3RUE2XHVGRjA4T0IgXHU2M0QyXHU0RUY2IFx1MjE5NCBcdTZENEZcdTg5QzhcdTU2NjhcdTYyNjlcdTVDNTVcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdTRGOURcdTYzNkVcdUZGMUFgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTc0LjIgKyBcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFcdUZGMDhcdTU4NkJcdTg4NjVcdTY1ODdcdTY4NjNcdTdGM0FcdTUzRTNcdUZGMDlcdTMwMDJcbiAqIFx1OTI3NFx1Njc0M1x1RkYxQVx1NkJDRlx1NEUyQVx1OEJGN1x1NkM0Mlx1NUUyNiBoZWFkZXIgYFgtU3luYy1Ub2tlbjogPFx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Qz5gXHUzMDAyXG4gKiBDT1JTXHVGRjFBT0Igc2VydmVyIFx1NUZDNVx1OTg3Qlx1NjUzRVx1OTAxQSBPUFRJT05TIFx1OTg4NFx1NjhDMFx1RkYwOFx1NjI2OVx1NUM1NVx1NEVDRVx1OThERVx1NEU2Nlx1OTg3NVx1OTc2Mlx1NTNEMVx1OEQ3NyBmZXRjaCBcdTRGMUFcdTg4QUJcdTYyRTZcdUZGMDlcdTMwMDJcbiAqL1xuXG4vKiogXHU5RUQ4XHU4QkE0XHU3QUVGXHU1M0UzXHUzMDAyXHU1M0VGXHU1NzI4IE9CIFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1OTg3NVx1NjUzOVx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUE9SVCA9IDQ1Njc7XG5cbi8qKiBcdTkyNzRcdTY3NDMgaGVhZGVyIFx1NTQwRFx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IFRPS0VOX0hFQURFUiA9ICdYLVN5bmMtVG9rZW4nO1xuXG4vKiogXHU4REU4XHU3QUVGXHU1MzRGXHU4QkFFXHU3MjQ4XHU2NzJDXHVGRjFCXHU0RTBEXHU0RTAwXHU4MUY0XHU2NUY2XHU1MTk5XHU2NENEXHU0RjVDXHU1RkM1XHU5ODdCXHU1OTMxXHU4RDI1XHU1MTczXHU5NUVEXHUzMDAyICovXG5leHBvcnQgY29uc3QgUFJPVE9DT0xfVkVSU0lPTiA9IDE7XG5cbmV4cG9ydCB0eXBlIFN5bmNDYXBhYmlsaXR5ID0gJ3N0YXR1cycgfCAndHJlZScgfCAnZmV0Y2gnIHwgJ2NsaXAnIHwgJ2V4aXN0cycgfCAncHVzaGJhY2snO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByb3RvY29sSW5mbyB7XG4gIHByb3RvY29sVmVyc2lvbjogbnVtYmVyO1xuICBjYXBhYmlsaXRpZXM6IHN0cmluZ1tdO1xuICBjb21wb25lbnRWZXJzaW9uOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvdG9jb2xDb21wYXRpYmlsaXR5IHtcbiAgY29tcGF0aWJsZTogYm9vbGVhbjtcbiAgcmVhc29uPzogc3RyaW5nO1xufVxuXG4vKiogXHU1RjUzXHU1MjREXHU2NzBEXHU1MkExXHU3QUVGXHU1QjlFXHU5NjQ1XHU2M0QwXHU0RjlCXHU3Njg0XHU4MEZEXHU1MjlCXHUzMDAyICovXG5leHBvcnQgY29uc3QgU0VSVkVSX0NBUEFCSUxJVElFUzogcmVhZG9ubHkgU3luY0NhcGFiaWxpdHlbXSA9IFtcbiAgJ3N0YXR1cycsXG4gICd0cmVlJyxcbiAgJ2ZldGNoJyxcbiAgJ2NsaXAnLFxuICAnZXhpc3RzJyxcbiAgJ3B1c2hiYWNrJyxcbl07XG5cbi8qKiBcdTVCOENcdTY1NzRcdTUxOTlcdTUxNjVcdTUzNEZcdThCQUVcdTc2ODRcdTY3MDBcdTRGNEVcdTgwRkRcdTUyOUJcdTk2QzZcdTU0MDhcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBSRVFVSVJFRF9XUklURV9DQVBBQklMSVRJRVM6IHJlYWRvbmx5IFN5bmNDYXBhYmlsaXR5W10gPSBbXG4gICdmZXRjaCcsXG4gICdjbGlwJyxcbiAgJ3B1c2hiYWNrJyxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBldmFsdWF0ZVByb3RvY29sQ29tcGF0aWJpbGl0eShcbiAgaW5mbzogUGFydGlhbDxQcm90b2NvbEluZm8+IHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgcmVxdWlyZWQ6IHJlYWRvbmx5IFN5bmNDYXBhYmlsaXR5W10gPSBSRVFVSVJFRF9XUklURV9DQVBBQklMSVRJRVMsXG4pOiBQcm90b2NvbENvbXBhdGliaWxpdHkge1xuICBpZiAoXG4gICAgIWluZm9cbiAgICB8fCB0eXBlb2YgaW5mby5wcm90b2NvbFZlcnNpb24gIT09ICdudW1iZXInXG4gICAgfHwgIUFycmF5LmlzQXJyYXkoaW5mby5jYXBhYmlsaXRpZXMpXG4gICAgfHwgdHlwZW9mIGluZm8uY29tcG9uZW50VmVyc2lvbiAhPT0gJ3N0cmluZydcbiAgKSB7XG4gICAgcmV0dXJuIHsgY29tcGF0aWJsZTogZmFsc2UsIHJlYXNvbjogJ01pc3NpbmcgcHJvdG9jb2wgbWV0YWRhdGEnIH07XG4gIH1cbiAgaWYgKGluZm8ucHJvdG9jb2xWZXJzaW9uICE9PSBQUk9UT0NPTF9WRVJTSU9OKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbXBhdGlibGU6IGZhbHNlLFxuICAgICAgcmVhc29uOiBgUHJvdG9jb2wgdmVyc2lvbiBtaXNtYXRjaDogYnJvd3Nlcj0ke1BST1RPQ09MX1ZFUlNJT059LCBvYnNpZGlhbj0ke2luZm8ucHJvdG9jb2xWZXJzaW9ufWAsXG4gICAgfTtcbiAgfVxuICBjb25zdCBjYXBhYmlsaXRpZXMgPSBuZXcgU2V0KGluZm8uY2FwYWJpbGl0aWVzKTtcbiAgY29uc3QgbWlzc2luZyA9IHJlcXVpcmVkLmZpbHRlcigoY2FwYWJpbGl0eSkgPT4gIWNhcGFiaWxpdGllcy5oYXMoY2FwYWJpbGl0eSkpO1xuICBpZiAobWlzc2luZy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbXBhdGlibGU6IGZhbHNlLFxuICAgICAgcmVhc29uOiBgTWlzc2luZyByZXF1aXJlZCBjYXBhYmlsaXRpZXM6ICR7bWlzc2luZy5qb2luKCcsICcpfWAsXG4gICAgfTtcbiAgfVxuICByZXR1cm4geyBjb21wYXRpYmxlOiB0cnVlIH07XG59XG5cbi8qKiBcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjMgVVJMIFx1ODlFM1x1Njc5MFx1N0VEM1x1Njc5Q1x1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBGZWlzaHVEb2NSZWYge1xuICAvKiogd2lraSBub2RlX3Rva2VuXHVGRjA4XHU0RjE4XHU1MTQ4XHU3NTI4XHVGRjBDXHU1NTJGXHU0RTAwXHU3RUQxXHU1QjlBXHVGRjA5XHUzMDAyICovXG4gIG5vZGVfdG9rZW4/OiBzdHJpbmc7XG4gIC8qKiBkb2N4IG9ial90b2tlblx1RkYwOFx1NTZERVx1NTE5OVx1NzUyOFx1RkYwOVx1MzAwMiAqL1xuICBvYmpfdG9rZW4/OiBzdHJpbmc7XG4gIC8qKiBzcGFjZV9pZFx1RkYwOFx1OTBFOFx1NTIwNlx1NjRDRFx1NEY1Q1x1OTcwMFx1ODk4MVx1RkYwQ1x1NTNFRlx1OTAwOVx1RkYwOVx1MzAwMiAqL1xuICBzcGFjZV9pZD86IHN0cmluZztcbn1cblxuLyoqIEdFVCAvc3RhdHVzIFx1NTRDRFx1NUU5NFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdGF0dXNSZXNwb25zZSBleHRlbmRzIFByb3RvY29sSW5mbyB7XG4gIG9rOiB0cnVlO1xuICAvKiogXHU2M0QyXHU0RUY2XHU3MjQ4XHU2NzJDXHUzMDAyICovXG4gIHZlcnNpb246IHN0cmluZztcbiAgLyoqIHZhdWx0IFx1NTQwRFx1MzAwMiAqL1xuICB2YXVsdDogc3RyaW5nO1xuICAvKiogbGFyay1jbGkgXHU2NjJGXHU1NDI2XHU1QzMxXHU3RUVBXHUzMDAyICovXG4gIGxhcmtSZWFkeTogYm9vbGVhbjtcbiAgLyoqIGxhcmstY2xpIFx1NzI0OFx1NjcyQ1x1RkYwOFx1NjNBMlx1NkQ0Qlx1NEUwRFx1NTIzMFx1NjVGNlx1NEUzQSBudWxsXHVGRjA5XHUzMDAyICovXG4gIGxhcmtWZXJzaW9uOiBzdHJpbmcgfCBudWxsO1xufVxuXG4vKiogXHU3NkVFXHU1RjU1XHU2ODExXHU4MjgyXHU3MEI5XHVGRjA4XHU3RUQ5XHU2MjY5XHU1QzU1XHU3NkVFXHU1RjU1XHU0RTBCXHU2MkM5XHU3NTI4XHVGRjA5XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFRyZWVOb2RlIHtcbiAgLyoqIFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdTc2ODRcdThERUZcdTVGODRcdUZGMENcdTU5ODIgXCIwXHVGRTBGXHUyMEUzXHU4RjkzXHU1MTY1L1x1RDgzRFx1RENBMVx1Nzg4RVx1NzI0N1x1OEY5M1x1NTE2NVx1RkYwOFx1OTVFQVx1NUZGNVx1RkYwOVwiXHUzMDAyICovXG4gIHBhdGg6IHN0cmluZztcbiAgLyoqIFx1NjYzRVx1NzkzQVx1NTQwRFx1RkYwOFx1NjcwMFx1NTQwRVx1NEUwMFx1NkJCNVx1RkYwOVx1MzAwMiAqL1xuICBsYWJlbDogc3RyaW5nO1xuICAvKiogXHU2REYxXHU1RUE2XHVGRjA4XHU2ODM5PTBcdUZGMDlcdTMwMDIgKi9cbiAgZGVwdGg6IG51bWJlcjtcbn1cblxuLyoqIEdFVCAvdHJlZSBcdTU0Q0RcdTVFOTRcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHJlZVJlc3BvbnNlIHtcbiAgb2s6IHRydWU7XG4gIGRpcnM6IFRyZWVOb2RlW107XG59XG5cbi8qKiBQT1NUIC9mZXRjaCBcdThCRjdcdTZDNDJcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmV0Y2hSZXF1ZXN0IHtcbiAgLyoqIFx1OTFDRFx1OEJENVx1NjVGNlx1NEZERFx1NjMwMVx1NEUwRFx1NTNEOFx1NzY4NFx1NUU0Mlx1N0I0OVx1OEJGN1x1NkM0MiBJRFx1MzAwMiAqL1xuICByZXF1ZXN0SWQ/OiBzdHJpbmc7XG4gIC8qKiBcdTVGQzVcdTU4NkJcdUZGMUF3aWtpIG5vZGVfdG9rZW5cdTMwMDIgKi9cbiAgbm9kZV90b2tlbjogc3RyaW5nO1xuICAvKiogXHU1M0VGXHU5MDA5XHVGRjFBZG9jeCBvYmpfdG9rZW5cdUZGMDhcdTY3MkFcdTdFRDlcdTUyMTlcdTYzRDJcdTRFRjZcdTc1Mjggd2lraSArbm9kZS1nZXQgXHU4OUUzXHU2NzkwXHVGRjA5XHUzMDAyICovXG4gIG9ial90b2tlbj86IHN0cmluZztcbiAgLyoqIFx1NTNFRlx1OTAwOVx1RkYxQXNwYWNlX2lkXHUzMDAyICovXG4gIHNwYWNlX2lkPzogc3RyaW5nO1xuICAvKiogXHU4NDNEXHU1NzMwXHU3NkVFXHU1RjU1XHVGRjA4XHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1RkYwOVx1RkYwQ1x1NjcyQVx1N0VEOVx1NzUyOFx1OEJCRVx1N0Y2RVx1OUVEOFx1OEJBNFx1NTAzQ1x1MzAwMiAqL1xuICBkaXI/OiBzdHJpbmc7XG4gIC8qKiBcdTg5ODZcdTc2RDZcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTRFMERcdTU0MkJcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDlcdUZGMENcdTY3MkFcdTdFRDlcdTc1MjhcdTk4REVcdTRFNjZcdTY4MDdcdTk4OThcdTZFMDVcdTZEMTdcdTdFRDNcdTY3OUNcdTMwMDIgKi9cbiAgZmlsZW5hbWU/OiBzdHJpbmc7XG4gIC8qKiBcdTZENEZcdTg5QzhcdTU2NjhcdTU0MENcdTZCNjVcdTUyNERcdTc4NkVcdThCQTRcdTU0MEVcdTc2ODQgWUFNTCBcdTUxNDNcdTY1NzBcdTYzNkVcdTg5ODZcdTc2RDZcdUZGMUJcdTRFQzVcdTk2NTBcdTc3RTVcdThCQzZcdTVFOTNcdTUxNDNcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVcdTMwMDIgKi9cbiAgbWV0YT86IFBhcnRpYWw8S25vd2xlZGdlTWV0YT47XG4gIC8qKiBPQiBcdTUxODVcdTkwRThcdTRGN0ZcdTc1MjhcdUZGMUFDbGlwcGVyIFx1NTM2MFx1NEY0RFx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1RkYwQ1x1NTQ3RFx1NEUyRFx1NjVGNlx1NTM5Rlx1NEY0RFx1ODk4Nlx1NzZENlx1MzAwMiAqL1xuICByZXBsYWNlX3BhdGg/OiBzdHJpbmc7XG59XG5cbi8qKiBQT1NUIC9mZXRjaCBcdTU0Q0RcdTVFOTRcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmV0Y2hSZXNwb25zZSB7XG4gIG9rOiB0cnVlO1xuICAvKiogXHU4NDNEXHU1NzMwXHU1QjhDXHU2NTc0XHU4REVGXHU1Rjg0XHVGRjA4XHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1RkYwOVx1MzAwMiAqL1xuICBwYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTU0MkJcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDlcdTMwMDIgKi9cbiAgZmlsZW5hbWU6IHN0cmluZztcbiAgLyoqIFx1NjcyQ1x1NkIyMVx1NjYyRlx1NjVCMFx1NUVGQVx1OEZEOFx1NjYyRlx1NjZGNFx1NjVCMFx1MzAwMiAqL1xuICBhY3Rpb246ICdjcmVhdGVkJyB8ICd1cGRhdGVkJztcbiAgLyoqIFx1NTIwNlx1OTE0RFx1NTIzMFx1NzY4NFx1N0YxNlx1NzgwMVx1RkYwOGF1dG8tcmVuYW1lIFx1ODlFNlx1NTNEMVx1NTQwRVx1RkYwOVx1MzAwMiAqL1xuICBcdTdGMTZcdTc4MDE/OiBzdHJpbmc7XG4gIC8qKiBcdTk4REVcdTRFNjZcdTUzOUZcdTU5Q0JcdTY4MDdcdTk4OThcdTMwMDIgKi9cbiAgZmVpc2h1X3RpdGxlOiBzdHJpbmc7XG59XG5cbi8qKiBQT1NUIC9jbGlwIFx1OEJGN1x1NkM0Mlx1RkYxQVx1NEVGQlx1NjEwRlx1N0Y1MVx1OTg3NS9cdTUyMTJcdThCQ0RcdTUyNkFcdTVCNThcdTUyMzAgT2JzaWRpYW5cdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2xpcFJlcXVlc3Qge1xuICAvKiogXHU5MUNEXHU4QkQ1XHU2NUY2XHU0RkREXHU2MzAxXHU0RTBEXHU1M0Q4XHU3Njg0XHU1RTQyXHU3QjQ5XHU4QkY3XHU2QzQyIElEXHUzMDAyICovXG4gIHJlcXVlc3RJZD86IHN0cmluZztcbiAgLyoqIFx1N0Y1MVx1OTg3NVx1NjgwN1x1OTg5OFx1MzAwMiAqL1xuICB0aXRsZT86IHN0cmluZztcbiAgLyoqIFx1Njc2NVx1NkU5MCBVUkxcdTMwMDIgKi9cbiAgdXJsPzogc3RyaW5nO1xuICAvKiogXHU2NzY1XHU2RTkwXHU3QzdCXHU1NzhCXHUzMDAyICovXG4gIHNvdXJjZUtpbmQ/OiAnZmVpc2h1LWJhc2UnIHwgJ2FydGljbGUnIHwgJ3NlbGVjdGlvbicgfCAnZ2VuZXJpYy1wYWdlJztcbiAgLyoqIFx1OTAwOVx1NEUyRFx1NjU4N1x1NjcyQ1x1NjIxNlx1NkI2M1x1NjU4N1x1NjQ1OFx1ODk4MVx1MzAwMiAqL1xuICB0ZXh0Pzogc3RyaW5nO1xuICAvKiogQUkgXHU2MjE2XHU4OUM0XHU1MjE5XHU4RjZDXHU2MzYyXHU1NDBFXHU3Njg0IE9ic2lkaWFuIE1hcmtkb3duIFx1NkI2M1x1NjU4N1x1MzAwMiAqL1xuICBib2R5TWFya2Rvd24/OiBzdHJpbmc7XG4gIC8qKiBcdTUzOUZcdTU5Q0JcdTUzRUZcdTg5QzFcdTY1ODdcdTY3MkNcdTMwMDIgKi9cbiAgcmF3VGV4dD86IHN0cmluZztcbiAgLyoqIFx1OTg3NVx1OTc2Mlx1NjNDRlx1OEZGMFx1MzAwMiAqL1xuICBkZXNjcmlwdGlvbj86IHN0cmluZztcbiAgLyoqIFx1ODQzRFx1NTczMFx1NzZFRVx1NUY1NVx1RkYwOFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdUZGMDlcdTMwMDJcdTY3MkFcdTdFRDlcdTc1MjggT0IgXHU2M0QyXHU0RUY2XHU5RUQ4XHU4QkE0XHU3NkVFXHU1RjU1XHUzMDAyICovXG4gIGRpcj86IHN0cmluZztcbiAgLyoqIFx1NTJGRVx1OTAwOVx1MjAxQ1x1ODg2NVx1NTE0NVx1NTIzMFx1NURGMlx1NjcwOVx1NjU4N1x1Njg2M1x1MjAxRFx1NjVGNlx1RkYwQ1x1OEZGRFx1NTJBMFx1NTIzMFx1OEZEOVx1NEUyQVx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdTc2ODQgTWFya2Rvd24gXHU4REVGXHU1Rjg0XHUzMDAyICovXG4gIGFwcGVuZFBhdGg/OiBzdHJpbmc7XG4gIC8qKiBcdTVERjJcdTYzMDlcdTYzRDJcdTRFRjZcdTk4ODRcdThCQkVcdTVGNTJcdTRFMDBcdTUzMTZcdTc2ODQgWUFNTCBcdTUxNDNcdTY1NzBcdTYzNkVcdTMwMDIgKi9cbiAgbWV0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG4vKiogUE9TVCAvY2xpcCBcdTU0Q0RcdTVFOTRcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2xpcFJlc3BvbnNlIHtcbiAgb2s6IHRydWU7XG4gIC8qKiBcdTg0M0RcdTU3MzBcdTVCOENcdTY1NzRcdThERUZcdTVGODRcdUZGMDhcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHVGRjA5XHUzMDAyICovXG4gIHBhdGg6IHN0cmluZztcbiAgLyoqIFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NTQyQlx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOVx1MzAwMiAqL1xuICBmaWxlbmFtZTogc3RyaW5nO1xuICAvKiogXHU2NzJDXHU2QjIxXHU2NjJGXHU2NUIwXHU1RUZBXHU4RkQ4XHU2NjJGXHU2NkY0XHU2NUIwXHUzMDAyICovXG4gIGFjdGlvbjogJ2NyZWF0ZWQnIHwgJ3VwZGF0ZWQnO1xufVxuXG4vKiogUE9TVCAvZXhpc3RzIFx1OEJGN1x1NkM0Mlx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeGlzdHNSZXF1ZXN0IHtcbiAgbm9kZV90b2tlbjogc3RyaW5nO1xufVxuXG4vKiogUE9TVCAvZXhpc3RzIFx1NTRDRFx1NUU5NFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeGlzdHNSZXNwb25zZSB7XG4gIG9rOiB0cnVlO1xuICBleGlzdHM6IGJvb2xlYW47XG4gIC8qKiBcdTVERjJcdTVCNThcdTU3MjhcdTY1RjZcdTdFRDlcdTUxRkFcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHU4REVGXHU1Rjg0XHUzMDAyICovXG4gIHBhdGg/OiBzdHJpbmc7XG59XG5cbi8qKiBQT1NUIC9wdXNoYmFjayBcdThCRjdcdTZDNDJcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVzaGJhY2tSZXF1ZXN0IHtcbiAgLyoqIFx1OTFDRFx1OEJENVx1NjVGNlx1NEZERFx1NjMwMVx1NEUwRFx1NTNEOFx1NzY4NFx1NUU0Mlx1N0I0OVx1OEJGN1x1NkM0MiBJRFx1MzAwMiAqL1xuICByZXF1ZXN0SWQ/OiBzdHJpbmc7XG4gIC8qKiBcdTRFOENcdTkwMDlcdTRFMDBcdUZGMUFcdTY3MkNcdTU3MzBcdThERUZcdTVGODRcdUZGMDhcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHVGRjA5XHUzMDAyICovXG4gIHBhdGg/OiBzdHJpbmc7XG4gIC8qKiBcdTRFOENcdTkwMDlcdTRFMDBcdUZGMUFub2RlX3Rva2VuXHVGRjA4XHU0RUNFXHU3RUQxXHU1QjlBXHU2MjdFXHU2NTg3XHU0RUY2XHVGRjA5XHUzMDAyICovXG4gIG5vZGVfdG9rZW4/OiBzdHJpbmc7XG4gIC8qKiBcdTVGM0FcdTUyMzZcdTU2REVcdTUxOTlcdUZGMDhcdTVGRkRcdTc1NjUgaGFzaCBcdTRFMDBcdTgxRjRcdThERjNcdThGQzdcdUZGMDlcdTMwMDIgKi9cbiAgZm9yY2U/OiBib29sZWFuO1xufVxuXG4vKiogUE9TVCAvcHVzaGJhY2sgXHU1NENEXHU1RTk0XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFB1c2hiYWNrUmVzcG9uc2Uge1xuICBvazogdHJ1ZTtcbiAgLyoqIFx1NUI5RVx1OTY0NVx1NTZERVx1NTE5OVx1OEZEOFx1NjYyRlx1OERGM1x1OEZDN1x1RkYwOGhhc2ggXHU0RTAwXHU4MUY0XHVGRjA5XHUzMDAyICovXG4gIGFjdGlvbjogJ3B1c2hlZCcgfCAnc2tpcHBlZCc7XG4gIC8qKiBcdTY1QjBcdTc2ODQgc3luY19oYXNoXHUzMDAyICovXG4gIGhhc2g/OiBzdHJpbmc7XG4gIC8qKiBcdTU2REVcdTUxOTlcdTc2ODRcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjNcdTY4MDdcdTk4OThcdTMwMDIgKi9cbiAgdGl0bGU/OiBzdHJpbmc7XG59XG5cbi8qKiBcdTdFREZcdTRFMDBcdTk1MTlcdThCRUZcdTU0Q0RcdTVFOTRcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXJyb3JSZXNwb25zZSB7XG4gIG9rOiBmYWxzZTtcbiAgLyoqIFx1NjczQVx1NTY2OFx1NTNFRlx1OEJGQlx1OTUxOVx1OEJFRlx1NzgwMVx1MzAwMiAqL1xuICBjb2RlOiBzdHJpbmc7XG4gIC8qKiBcdTRFQkFcdTdDN0JcdTUzRUZcdThCRkJcdTZEODhcdTYwNkZcdTMwMDIgKi9cbiAgbWVzc2FnZTogc3RyaW5nO1xufVxuXG4vKiogXHU2MjQwXHU2NzA5XHU3QUVGXHU3MEI5XHU1QjlBXHU0RTQ5XHVGRjA4XHU4REVGXHU1Rjg0ICsgXHU2NUI5XHU2Q0Q1XHVGRjA5XHVGRjBDXHU0RjlCXHU0RTI0XHU3QUVGXHU1RjE1XHU3NTI4XHU5MDdGXHU1MTREXHU2MkZDXHU1MTk5XHU2RjAyXHU3OUZCXHUzMDAyICovXG5leHBvcnQgY29uc3QgRU5EUE9JTlRTID0ge1xuICBzdGF0dXM6ICcvc3RhdHVzJyxcbiAgdHJlZTogJy90cmVlJyxcbiAgZmV0Y2g6ICcvZmV0Y2gnLFxuICBjbGlwOiAnL2NsaXAnLFxuICBleGlzdHM6ICcvZXhpc3RzJyxcbiAgcHVzaGJhY2s6ICcvcHVzaGJhY2snLFxufSBhcyBjb25zdDtcblxuLyoqIE9ic2lkaWFuIFx1N0NGQlx1N0VERlx1NTM0Rlx1OEJBRVx1RkYxQVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NEUzQlx1OTAxQVx1OTA1M1x1NTJBOFx1NEY1Q1x1NTQwRFx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IE9CU0lESUFOX0xBUktfRE9DX0FDVElPTiA9ICdsYXJrLWRvYyc7XG5cbi8qKiBPYnNpZGlhbiBcdTdDRkJcdTdFREZcdTUzNEZcdThCQUVcdUZGMUFcdTZENEZcdTg5QzhcdTU2NjhcdTRFM0JcdTkwMUFcdTkwNTMgVVJJIFx1NTI0RFx1N0YwMFx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IE9CU0lESUFOX0xBUktfRE9DX1VSSV9QUkVGSVggPSBgb2JzaWRpYW46Ly8ke09CU0lESUFOX0xBUktfRE9DX0FDVElPTn1gO1xuXG4vKiogb2JzaWRpYW46Ly9sYXJrLWRvYyBcdTUzQzJcdTY1NzBcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgT2JzaWRpYW5MYXJrRG9jUGFyYW1zIHtcbiAgLyoqIHYzIFx1NEUzQlx1OTAxQVx1OTA1M1x1NTE3Q1x1NUJCOVx1NUI1N1x1NkJCNVx1RkYwQ1x1NEYxOFx1NTE0OFx1NEYyMCB3aWtpIG5vZGVfdG9rZW5cdTMwMDIgKi9cbiAgdG9rZW4/OiBzdHJpbmc7XG4gIC8qKiB3aWtpIG5vZGVfdG9rZW5cdTMwMDIgKi9cbiAgbm9kZV90b2tlbj86IHN0cmluZztcbiAgLyoqIGRvY3ggb2JqX3Rva2VuXHUzMDAyICovXG4gIG9ial90b2tlbj86IHN0cmluZztcbiAgLyoqIFx1OThERVx1NEU2Nlx1NzdFNVx1OEJDNlx1NUU5MyBzcGFjZV9pZFx1MzAwMiAqL1xuICBzcGFjZV9pZD86IHN0cmluZztcbiAgLyoqIFx1OTg3NVx1OTc2Mlx1NjgwN1x1OTg5OFx1MzAwMiAqL1xuICB0aXRsZT86IHN0cmluZztcbiAgLyoqIFx1NTM5Rlx1NTlDQlx1OThERVx1NEU2NiBVUkxcdTMwMDIgKi9cbiAgdXJsPzogc3RyaW5nO1xuICAvKiogXHU1M0VGXHU5MDA5XHU3NkVFXHU2ODA3XHU3NkVFXHU1RjU1XHVGRjFCXHU0RTNBXHU3QTdBXHU2NUY2XHU3NTMxIE9CIFx1N0FFRlx1OTAwOVx1NjJFOVx1NjIxNlx1NEY3Rlx1NzUyOFx1OUVEOFx1OEJBNFx1NzZFRVx1NUY1NVx1MzAwMiAqL1xuICBkaXI/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogXHU2Nzg0XHU5MDIwIGBvYnNpZGlhbjovL2xhcmstZG9jYCBVUklcdTMwMDJcbiAqXG4gKiBQb255dGFpbDogXHU3NTI4XHU2RDRGXHU4OUM4XHU1NjY4XHU1NDhDXHU3Q0ZCXHU3RURGXHU1REYyXHU2NzA5XHU3Njg0XHU4MUVBXHU1QjlBXHU0RTQ5XHU1MzRGXHU4QkFFXHU4MEZEXHU1MjlCXHU2MjdGXHU4RjdEXHU0RTNCXHU5MDFBXHU5MDUzXHVGRjBDXG4gKiBcdTRFMERcdTUxOERcdTRFM0FcdTIwMUNcdTcwQjlcdTUxRkJcdTk4REVcdTRFNjZcdTYzMDlcdTk0QUVcdTIwMURcdTk4OURcdTU5MTZcdTUzRDFcdTY2MEVcdTRFMDBcdTU5NTdcdTU0MEVcdTUzRjBcdTZEODhcdTYwNkZcdTUzNEZcdThCQUVcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkT2JzaWRpYW5MYXJrRG9jVXJpKHBhcmFtczogT2JzaWRpYW5MYXJrRG9jUGFyYW1zKTogc3RyaW5nIHtcbiAgY29uc3QgdG9rZW4gPSBwYXJhbXMudG9rZW4gfHwgcGFyYW1zLm5vZGVfdG9rZW4gfHwgcGFyYW1zLm9ial90b2tlbjtcbiAgY29uc3QgcXVlcnk6IEFycmF5PFtzdHJpbmcsIHN0cmluZyB8IHVuZGVmaW5lZF0+ID0gW1xuICAgIFsndG9rZW4nLCB0b2tlbl0sXG4gICAgWydub2RlX3Rva2VuJywgcGFyYW1zLm5vZGVfdG9rZW5dLFxuICAgIFsnb2JqX3Rva2VuJywgcGFyYW1zLm9ial90b2tlbl0sXG4gICAgWydzcGFjZV9pZCcsIHBhcmFtcy5zcGFjZV9pZF0sXG4gICAgWyd0aXRsZScsIHBhcmFtcy50aXRsZV0sXG4gICAgWyd1cmwnLCBwYXJhbXMudXJsXSxcbiAgICBbJ2RpcicsIHBhcmFtcy5kaXJdLFxuICBdO1xuICBjb25zdCBlbmNvZGVkID0gcXVlcnlcbiAgICAuZmlsdGVyKChbLCB2YWx1ZV0pID0+IHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09ICcnKVxuICAgIC5tYXAoKFtrZXksIHZhbHVlXSkgPT4gYCR7ZW5jb2RlVVJJQ29tcG9uZW50KGtleSl9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyh2YWx1ZSkpfWApXG4gICAgLmpvaW4oJyYnKTtcbiAgcmV0dXJuIGVuY29kZWQgPyBgJHtPQlNJRElBTl9MQVJLX0RPQ19VUklfUFJFRklYfT8ke2VuY29kZWR9YCA6IE9CU0lESUFOX0xBUktfRE9DX1VSSV9QUkVGSVg7XG59XG5cbi8qKiBcdTg5RTNcdTY3OTAgYG9ic2lkaWFuOi8vbGFyay1kb2NgIFVSSSBcdTYyMTYgT2JzaWRpYW4gcHJvdG9jb2wgaGFuZGxlciBwYXJhbXNcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU9ic2lkaWFuTGFya0RvY1BhcmFtcyhcbiAgaW5wdXQ6IHN0cmluZyB8IFVSTFNlYXJjaFBhcmFtcyB8IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IHVuZGVmaW5lZD4sXG4pOiBPYnNpZGlhbkxhcmtEb2NQYXJhbXMge1xuICBjb25zdCBzZWFyY2hQYXJhbXMgPSAoKCkgPT4ge1xuICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBxdWVyeSA9IGlucHV0LmluY2x1ZGVzKCc/JykgPyBpbnB1dC5zbGljZShpbnB1dC5pbmRleE9mKCc/JykgKyAxKSA6IGlucHV0O1xuICAgICAgcmV0dXJuIG5ldyBVUkxTZWFyY2hQYXJhbXMocXVlcnkpO1xuICAgIH1cbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXMpIHJldHVybiBpbnB1dDtcbiAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKCk7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoaW5wdXQpKSB7XG4gICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkgcGFyYW1zLnNldChrZXksIHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcmFtcztcbiAgfSkoKTtcblxuICBjb25zdCBnZXQgPSAoa2V5OiBrZXlvZiBPYnNpZGlhbkxhcmtEb2NQYXJhbXMpOiBzdHJpbmcgfCB1bmRlZmluZWQgPT5cbiAgICBzZWFyY2hQYXJhbXMuZ2V0KGtleSkgfHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHBhcnNlZDogT2JzaWRpYW5MYXJrRG9jUGFyYW1zID0ge307XG4gIGZvciAoY29uc3Qga2V5IG9mIFsndG9rZW4nLCAnbm9kZV90b2tlbicsICdvYmpfdG9rZW4nLCAnc3BhY2VfaWQnLCAndGl0bGUnLCAndXJsJywgJ2RpciddIGFzIGNvbnN0KSB7XG4gICAgY29uc3QgdmFsdWUgPSBnZXQoa2V5KTtcbiAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkgcGFyc2VkW2tleV0gPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gcGFyc2VkO1xufVxuXG4vKiogXHU4RkRCXHU1RUE2XHU5NjM2XHU2QkI1XHVGRjA4XHU2MjY5XHU1QzU1XHU2RDZFXHU1QzQyXHU3NTI4XHVGRjA5XHUzMDAyICovXG5leHBvcnQgdHlwZSBQcm9ncmVzc1N0YWdlID1cbiAgfCAnY29ubmVjdGluZydcbiAgfCAnZmV0Y2hpbmctbWQnXG4gIHwgJ2ZldGNoaW5nLXhtbCdcbiAgfCAncmV3cml0aW5nLWltYWdlcydcbiAgfCAnd3JpdGluZy1maWxlJ1xuICB8ICdhc3NpZ25pbmctY29kZSdcbiAgfCAnZG9uZSdcbiAgfCAnZXJyb3InO1xuIiwgIi8qKlxuICogXHU1MTg1XHU1QkI5IGhhc2hcdUZGMDhcdThGN0JcdTY4MzhcdTlBOENcdUZGMDlcdTMwMDJcdTRGOURcdTYzNkUgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3Ni4yIFx1NkI2NVx1OUFBNCAyXHUzMDAyXG4gKiBcdTc1Mjggc2hhMjU2XHVGRjBDXHU1M0VBIGhhc2ggXHU2QjYzXHU2NTg3XHVGRjA4XHU0RTBEXHU1NDJCIGZyb250bWF0dGVyIFx1NzY4NCBzeW5jXyogXHU1QjU3XHU2QkI1XHVGRjBDXHU5MDdGXHU1MTREXHU4MUVBXHU2MzA3XHVGRjA5XHUzMDAyXG4gKlxuICogXHU4REU4XHU3M0FGXHU1ODgzXHVGRjFBXHU0RjE4XHU1MTQ4XHU3NTI4IFdlYiBDcnlwdG8gQVBJXHVGRjA4XHU2RDRGXHU4OUM4XHU1NjY4ICsgTm9kZSAxOCsgXHU5MEZEXHU2NzA5IGdsb2JhbFRoaXMuY3J5cHRvLnN1YnRsZVx1RkYwOVx1RkYwQ1xuICogZmFsbGJhY2sgXHU1MjMwIG5vZGU6Y3J5cHRvXHVGRjA4T0IgXHU2M0QyXHU0RUY2IG5vZGUgXHU3M0FGXHU1ODgzXHU0RkREXHU5NjY5XHVGRjA5XHUzMDAyXG4gKi9cblxuLyoqIFx1NTQwQ1x1NkI2NVx1NzI0OCBzaGEyNTYgaGV4XHVGRjA4XHU0RUM1IE5vZGUgXHU3M0FGXHU1ODgzXHVGRjA5XHUzMDAyXHU2RDRGXHU4OUM4XHU1NjY4XHU3NTI4IGJvZHlIYXNoQXN5bmNcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBib2R5SGFzaChib2R5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBOb2RlIFx1NzNBRlx1NTg4M1xuICB0cnkge1xuICAgIGNvbnN0IHsgY3JlYXRlSGFzaCB9ID0gcmVxdWlyZSgnbm9kZTpjcnlwdG8nKSBhcyB0eXBlb2YgaW1wb3J0KCdub2RlOmNyeXB0bycpO1xuICAgIHJldHVybiBjcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUoYm9keSwgJ3V0ZjgnKS5kaWdlc3QoJ2hleCcpO1xuICB9IGNhdGNoIHtcbiAgICAvLyBcdTZENEZcdTg5QzhcdTU2NjhcdTczQUZcdTU4ODNcdTY1RTAgcmVxdWlyZVx1RkYwQ1x1OEQ3MCBhc3luYyBcdTcyNDhcdUZGMDhcdThGRDlcdTkxQ0NcdTU0MENcdTZCNjVcdThGRDRcdTU2REUgZmFsbGJhY2tcdUZGMENcdThDMDNcdTc1MjhcdTY1QjlcdTVFOTRcdTc1MjggYXN5bmMgXHU3MjQ4XHVGRjA5XG4gICAgcmV0dXJuIHN5bmNGYWxsYmFja0hhc2goYm9keSk7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTVGMDJcdTZCNjUgc2hhMjU2IGhleFx1RkYwOFx1NkQ0Rlx1ODlDOFx1NTY2OCArIE5vZGUgXHU5MDFBXHU3NTI4XHVGRjA5XHUzMDAyXHU2M0E4XHU4MzUwXHU0RjdGXHU3NTI4XHUzMDAyXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBib2R5SGFzaEFzeW5jKGJvZHk6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IGNyeXB0byA9IGdsb2JhbFRoaXMuY3J5cHRvIGFzIHsgc3VidGxlPzogeyBkaWdlc3Q6IChhbGc6IHN0cmluZywgZGF0YTogQXJyYXlCdWZmZXIpID0+IFByb21pc2U8QXJyYXlCdWZmZXI+IH0gfTtcbiAgaWYgKGNyeXB0bz8uc3VidGxlKSB7XG4gICAgY29uc3QgYnVmID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kaWdlc3QoJ1NIQS0yNTYnLCBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoYm9keSkuYnVmZmVyIGFzIEFycmF5QnVmZmVyKTtcbiAgICByZXR1cm4gWy4uLm5ldyBVaW50OEFycmF5KGJ1ZildLm1hcCgoYikgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XG4gIH1cbiAgcmV0dXJuIHN5bmNGYWxsYmFja0hhc2goYm9keSk7XG59XG5cbi8qKlxuICogXHU3QjgwXHU2NjEzXHU1NDBDXHU2QjY1IGZhbGxiYWNrXHVGRjA4XHU5NzVFXHU1MkEwXHU1QkM2XHU3RUE3XHVGRjBDXHU0RUM1XHU1RjUzIGNyeXB0byBBUEkgXHU5MEZEXHU0RTBEXHU1M0VGXHU3NTI4XHU2NUY2XHU3NTI4XHVGRjA5XHUzMDAyXG4gKiBcdTc1MjggZGpiMiBcdTUzRDhcdTc5Q0RcdUZGMENcdTRGRERcdThCQzFcdTRFMDBcdTgxRjRcdTYwMjdcdTUzNzNcdTUzRUZcdUZGMDhcdThGN0JcdTY4MzhcdTlBOENcdTU3M0FcdTY2NkZcdUZGMDlcdTMwMDJcbiAqL1xuZnVuY3Rpb24gc3luY0ZhbGxiYWNrSGFzaChib2R5OiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgaDEgPSAweDgxMWM5ZGM1O1xuICBsZXQgaDIgPSAweDEwMDAxOTM7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYm9keS5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGMgPSBib2R5LmNoYXJDb2RlQXQoaSk7XG4gICAgaDEgPSBNYXRoLmltdWwoaDEgXiBjLCAweDAxMDAwMTkzKTtcbiAgICBoMiA9IE1hdGguaW11bChoMiBeIChjICsgMHg5ZTM3NzliOSksIDB4ODVlYmNhNzcpO1xuICB9XG4gIHJldHVybiAoaDEgPj4+IDApLnRvU3RyaW5nKDE2KS5wYWRTdGFydCg4LCAnMCcpICsgKGgyID4+PiAwKS50b1N0cmluZygxNikucGFkU3RhcnQoOCwgJzAnKSArICdfZmFsbGJhY2snO1xufVxuXG4vKipcbiAqIFx1NkJENFx1NUJGOVx1NjYyRlx1NTQyNlx1NTNEOFx1NTMxNlx1MzAwMlxuICogQHBhcmFtIGN1cnJlbnQgXHU1RjUzXHU1MjREXHU2QjYzXHU2NTg3IGhhc2hcbiAqIEBwYXJhbSBsYXN0IFx1NEUwQVx1NkIyMVx1NTQwQ1x1NkI2NVx1NTE5OVx1NTE2NVx1NzY4NCBzeW5jX2hhc2hcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2hhbmdlZChjdXJyZW50OiBzdHJpbmcsIGxhc3Q/OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCFsYXN0KSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGN1cnJlbnQgIT09IGxhc3Q7XG59XG4iLCAiLyoqXG4gKiBcdTk4REVcdTRFNjZcdTY4MDdcdTk4OTggXHUyMTkyIFx1NUI4OVx1NTE2OFx1NjU4N1x1NEVGNlx1NTQwRFx1NkUwNVx1NkQxN1x1MzAwMlx1NEY5RFx1NjM2RSBgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTdcdTRFOENcdTZCNjVcdTlBQTQgXHUyNDYxXHUzMDAyXG4gKiBcdThERThcdTVFNzNcdTUzRjBcdTk3NUVcdTZDRDVcdTVCNTdcdTdCMjZcdUZGMDhXaW5kb3dzL21hY09TL0xpbnV4IFx1NUU3Nlx1OTZDNlx1RkYwOVx1RkYxQS8gXFwgOiAqID8gXCIgPCA+IHxcbiAqIFx1NEVFNVx1NTNDQVx1NjNBN1x1NTIzNlx1NUI1N1x1N0IyNlx1MzAwMVx1OTk5Nlx1NUMzRVx1NzBCOVx1NTNGNy9cdTdBN0FcdTY4M0NcdUZGMDhXaW5kb3dzIFx1Nzk4MVx1NkI2Mlx1RkYwOVx1MzAwMlxuICovXG5cbmNvbnN0IElMTEVHQUwgPSAvW1xcL1xcXFw6Kj9cIjw+fF0vZztcbmNvbnN0IENPTlRST0wgPSAvW1xceDAwLVxceDFmXFx4N2ZdL2c7XG5cbi8qKlxuICogXHU2RTA1XHU2RDE3XHU5OERFXHU0RTY2XHU2ODA3XHU5ODk4XHU0RTNBXHU1Qjg5XHU1MTY4XHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU0RTBEXHU1NDJCXHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA5XHUzMDAyXG4gKiAtIFx1NTNCQlx1OTc1RVx1NkNENVx1NUI1N1x1N0IyNiBcdTIxOTIgXHU3NTI4XHU0RTBCXHU1MjEyXHU3RUJGXHU2NkZGXHU2MzYyXG4gKiAtIFx1NjI5OFx1NTNFMFx1OEZERVx1N0VFRFx1N0E3QVx1NzY3RFxuICogLSBcdTUzQkJcdTk5OTZcdTVDM0VcdTcwQjlcdTUzRjcvXHU3QTdBXHU2ODNDXG4gKiAtIFx1NjIyQVx1NjVBRFx1NTIzMCAxMDAgXHU1QjU3XHU3QjI2XHVGRjA4XHU0RkREXHU3NTU5XHU3RjE2XHU3ODAxXHU1MjREXHU3RjAwXHU3QTdBXHU5NUY0XHVGRjA5XG4gKiAtIFx1N0E3QVx1NjgwN1x1OTg5OFx1NTZERVx1OTAwMFx1NTIzMCBcIlx1NjcyQVx1NTQ3RFx1NTQwRFwiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUZpbGVuYW1lKHRpdGxlOiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgcyA9ICh0aXRsZSA/PyAnJykudHJpbSgpO1xuICBzID0gcy5yZXBsYWNlKElMTEVHQUwsICdfJykucmVwbGFjZShDT05UUk9MLCAnJyk7XG4gIHMgPSBzLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKCk7XG4gIC8vIFdpbmRvd3MgXHU3OTgxXHU2QjYyXHU5OTk2XHU1QzNFXHU3MEI5XHU1M0Y3L1x1N0E3QVx1NjgzQ1xuICBzID0gcy5yZXBsYWNlKC9eW1xcLlxcc10rfFtcXC5cXHNdKyQvZywgJycpO1xuICBpZiAocy5sZW5ndGggPiAxMDApIHMgPSBzLnNsaWNlKDAsIDEwMCkudHJpbSgpO1xuICByZXR1cm4gcyB8fCAnXHU2NzJBXHU1NDdEXHU1NDBEJztcbn1cblxuLyoqXG4gKiBcdTUyQTAgLm1kIFx1NjI2OVx1NUM1NVx1RkYwOFx1ODJFNVx1NURGMlx1NjcwOVx1NUMzMVx1NEUwRFx1OTFDRFx1NTkwRFx1NTJBMFx1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aE1kRXh0KG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKCkuZW5kc1dpdGgoJy5tZCcpID8gbmFtZSA6IGAke25hbWV9Lm1kYDtcbn1cblxuLyoqXG4gKiBcdTYyRkNcdTYzQTVcdTc2RUVcdTVGNTVcdTRFMEVcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTU5MDRcdTc0MDZcdTY1OUNcdTY3NjBcdUZGMDlcdTMwMDJcbiAqIEBwYXJhbSBkaXIgXHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1NzY4NFx1NzZFRVx1NUY1NVx1RkYwQ1x1NTk4MiBcIjBcdUZFMEZcdTIwRTNcdThGOTNcdTUxNjUvXHVEODNEXHVEQ0ExXHU3ODhFXHU3MjQ3XHU4RjkzXHU1MTY1XCJcbiAqIEBwYXJhbSBmaWxlbmFtZSBcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTU0MkJcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGpvaW5QYXRoKGRpcjogc3RyaW5nIHwgdW5kZWZpbmVkLCBmaWxlbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKCFkaXIgfHwgZGlyID09PSAnLicgfHwgZGlyID09PSAnLycpIHJldHVybiBmaWxlbmFtZTtcbiAgY29uc3QgZCA9IGRpci5yZXBsYWNlKC9bXFwvXFxcXF0rJC8sICcnKS5yZXBsYWNlKC9eW1xcL1xcXFxdKy8sICcnKTtcbiAgcmV0dXJuIGQgPyBgJHtkfS8ke2ZpbGVuYW1lfWAgOiBmaWxlbmFtZTtcbn1cbiIsICIvKipcbiAqIFx1NTZGRVx1NzI0NyB0b2tlbiBcdTU5MDRcdTc0MDZcdTMwMDJcdTRGOURcdTYzNkUgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3My4zICsgYDAzX1x1NjgzQ1x1NUYwRlx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU1MTZEXHUzMDAyXG4gKlxuICogXHU5OERFXHU0RTY2XHU1QkZDXHU1MUZBXHU3Njg0XHU1NkZFXHU3MjQ3XHU5NEZFXHU2M0E1XHU1RjYyXHU2MDAxXHVGRjFBXG4gKiAgIC0gbWQgXHU1QkZDXHU1MUZBXHVGRjFBYCFbXShodHRwczovL2ludGVybmFsLWFwaS1kcml2ZS1zdHJlYW0uZmVpc2h1LmNuLy4uLi9hdXRoY29kZT0uLi4pYFx1RkYwOFx1OTcwMFx1NzY3Qlx1NUY1NVx1NjAwMVx1RkYwQzFoIFx1OEZDN1x1NjcxRlx1RkYwOVxuICogICAtIHhtbCBcdTVCRkNcdTUxRkFcdUZGMUFgPGltZyBzcmM9XCJGSUxFX1RPS0VOXCIgaHJlZj1cImF1dGhjb2RlX3VybFwiLz5gXHVGRjA4RklMRV9UT0tFTiBcdTZDMzhcdTRFNDVcdTRFMERcdThGQzdcdTY3MUZcdUZGMDlcbiAqXG4gKiBPQiBcdTkxQ0NcdTdFREZcdTRFMDBcdTUxOTlcdTYyMTBcdUZGMUFgIVtdKGZlaXNodTovL0ZJTEVfVE9LRU4pYFxuICogXHU5ODg0XHU4OUM4XHU2NUY2XHU3NTMxIE9CIFx1NjNEMlx1NEVGNlx1OEMwMyBgbGFyay1jbGkgZG9jcyArbWVkaWEtZG93bmxvYWRgIFx1NjM2Mlx1NEUzNFx1NjVGNlx1OTRGRVx1NjNBNVx1MzAwMlxuICovXG5cbi8qKiBPQiBcdTRGQTdcdTU2RkVcdTcyNDdcdTVGMTVcdTc1MjhcdTUzNEZcdThCQUVcdTUyNERcdTdGMDBcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBGRUlTSFVfUFJPVE8gPSAnZmVpc2h1Oi8vJztcblxuLyoqIFx1OThERVx1NEU2NiBpbnRlcm5hbC1hcGkgXHU1NkZFXHU3MjQ3XHU1N0RGXHU1NDBEXHVGRjA4XHU4QkM2XHU1MjJCXHU5NzAwXHU3NjdCXHU1RjU1XHU2MDAxXHU3Njg0XHU0RTM0XHU2NUY2XHU5NEZFXHU2M0E1XHVGRjA5XHUzMDAyICovXG5jb25zdCBJTlRFUk5BTF9BUElfSE9TVCA9ICdpbnRlcm5hbC1hcGktZHJpdmUtc3RyZWFtLmZlaXNodS5jbic7XG5jb25zdCBJTlRFUk5BTF9BUElfSE9TVF9MQVJLID0gJ2ludGVybmFsLWFwaS1kcml2ZS1zdHJlYW0ubGFya3N1aXRlLmNvbSc7XG5cbi8qKiBmaWxlX3Rva2VuIFx1NjgzQ1x1NUYwRlx1RkYxQVx1OThERVx1NEU2NiB0b2tlbiBcdTY2MkYgYmFzZTYyLWlzaFx1RkYwQ1x1OTU3Rlx1NUVBNiB+MjhcdTMwMDIgKi9cbmNvbnN0IFRPS0VOX1JFID0gL1tBLVphLXowLTldezIwLH0vO1xuXG4vKipcbiAqIFx1NEVDRVx1OThERVx1NEU2NiBpbnRlcm5hbC1hcGkgYXV0aGNvZGUgVVJMIFx1OTFDQ1x1NjNEMFx1NTNENiBmaWxlX3Rva2VuXHUzMDAyXG4gKiBVUkwgXHU1RjYyXHU1OTgyIGBodHRwczovL2ludGVybmFsLWFwaS1kcml2ZS1zdHJlYW0uZmVpc2h1LmNuL2RyaXZlLXN0cmVhbS88VE9LRU4+LzxleHRyYT4/YXV0aGNvZGU9Li4uYFxuICogXHU1M0Q2XHU4REVGXHU1Rjg0XHU2QkI1XHU0RTJEXHU2NzAwXHU5NTdGXHU3Njg0IHRva2VuLWxpa2UgXHU1QjUwXHU0RTMyXHUzMDAyXG4gKiBAcmV0dXJucyB0b2tlbiBcdTYyMTYgbnVsbFx1RkYwOFx1NjVFMFx1NkNENVx1OEJDNlx1NTIyQlx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFRva2VuRnJvbUF1dGhjb2RlVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmICghdXJsKSByZXR1cm4gbnVsbDtcbiAgbGV0IHU6IFVSTDtcbiAgdHJ5IHtcbiAgICB1ID0gbmV3IFVSTCh1cmwpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBob3N0ID0gdS5ob3N0bmFtZTtcbiAgaWYgKGhvc3QgIT09IElOVEVSTkFMX0FQSV9IT1NUICYmIGhvc3QgIT09IElOVEVSTkFMX0FQSV9IT1NUX0xBUkspIHJldHVybiBudWxsO1xuICBjb25zdCBzZWdtZW50cyA9IHUucGF0aG5hbWUuc3BsaXQoJy8nKS5maWx0ZXIoQm9vbGVhbik7XG4gIGxldCBiZXN0OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgZm9yIChjb25zdCBzZWcgb2Ygc2VnbWVudHMpIHtcbiAgICBjb25zdCBtID0gc2VnLm1hdGNoKFRPS0VOX1JFKTtcbiAgICBpZiAobSAmJiAoIWJlc3QgfHwgbVswXS5sZW5ndGggPiBiZXN0Lmxlbmd0aCkpIGJlc3QgPSBtWzBdO1xuICB9XG4gIHJldHVybiBiZXN0O1xufVxuXG4vKipcbiAqIFx1NjI4QSBtZCBcdTZCNjNcdTY1ODdcdTkxQ0NcdTc2ODQgaW50ZXJuYWwtYXBpIGF1dGhjb2RlIFx1NTZGRVx1NzI0N1x1OTRGRVx1NjNBNVx1NjZGRlx1NjM2Mlx1NEUzQSBgZmVpc2h1Oi8vVE9LRU5gXHUzMDAyXG4gKiBcdTYzRDBcdTRGOUJcdTRFMDBcdTRFMkEgdG9rZW4gXHU2NjIwXHU1QzA0XHU4ODY4XHVGRjA4eG1sIFx1NUJGQ1x1NTFGQVx1NjJGRlx1NTIzMFx1NzY4NCBzcmMgdG9rZW4gXHUyMTkyIGhyZWYgXHU1M0VGXHU4MEZEXHU1NDJCXHU1NDBDIHRva2VuXHVGRjA5XHUzMDAyXG4gKiBcdTVCRjlcdTYyN0VcdTRFMERcdTUyMzBcdTY2MjBcdTVDMDRcdTc2ODQgYXV0aGNvZGUgVVJMXHVGRjBDXHU1QzFEXHU4QkQ1XHU1QzMxXHU1NzMwIGV4dHJhY3RcdTMwMDJcbiAqXG4gKiBAcGFyYW0gbWQgXHU2QjYzXHU2NTg3IG1hcmtkb3duXG4gKiBAcGFyYW0gdG9rZW5NYXAgeG1sIFx1NUJGQ1x1NTFGQVx1NjJGRlx1NTIzMFx1NzY4NCBmaWxlX3Rva2VuIFx1OTZDNlx1NTQwOFx1RkYwOFx1NzUyOFx1NEU4RVx1N0NCRVx1Nzg2RVx1NTMzOVx1OTE0RFx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmV3cml0ZUltYWdlc1RvRmVpc2h1UHJvdG8oXG4gIG1kOiBzdHJpbmcsXG4gIHRva2VuTWFwOiBTZXQ8c3RyaW5nPiB8IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgU2V0KCksXG4pOiBzdHJpbmcge1xuICAvLyBcdTUzMzlcdTkxNEQgIVthbHRdKHVybCkgXHU1RjYyXHU1RjBGXHU3Njg0XHU1NkZFXHU3MjQ3XHVGRjBDdXJsIFx1NjYyRiBpbnRlcm5hbC1hcGkgXHU5NEZFXHU2M0E1XG4gIGNvbnN0IGltZ1JlID0gLyFcXFsoW15cXF1dKilcXF1cXCgoW14pXSspXFwpL2c7XG4gIHJldHVybiBtZC5yZXBsYWNlKGltZ1JlLCAoZnVsbCwgYWx0OiBzdHJpbmcsIHVybDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgdHJpbW1lZCA9IHVybC50cmltKCkucmVwbGFjZSgvXjx8PiQvZywgJycpO1xuICAgIC8vIFx1NURGMlx1N0VDRlx1NjYyRiBmZWlzaHU6Ly8gXHU1MzRGXHU4QkFFXHVGRjBDXHU4REYzXHU4RkM3XG4gICAgaWYgKHRyaW1tZWQuc3RhcnRzV2l0aChGRUlTSFVfUFJPVE8pKSByZXR1cm4gZnVsbDtcbiAgICAvLyBpbnRlcm5hbC1hcGkgXHU5NEZFXHU2M0E1XHVGRjFBXHU2M0QwIHRva2VuXG4gICAgaWYgKFxuICAgICAgdHJpbW1lZC5pbmNsdWRlcyhJTlRFUk5BTF9BUElfSE9TVCkgfHxcbiAgICAgIHRyaW1tZWQuaW5jbHVkZXMoSU5URVJOQUxfQVBJX0hPU1RfTEFSSylcbiAgICApIHtcbiAgICAgIGNvbnN0IHRva2VuID0gcGlja0V4YWN0VG9rZW4odG9rZW5NYXAsIHRyaW1tZWQpID8/IGV4dHJhY3RUb2tlbkZyb21BdXRoY29kZVVybCh0cmltbWVkKSA/PyBwaWNrRnJvbU1hcCh0b2tlbk1hcCk7XG4gICAgICBpZiAodG9rZW4pIHJldHVybiBgIVske2FsdH1dKCR7RkVJU0hVX1BST1RPfSR7dG9rZW59KWA7XG4gICAgfVxuICAgIC8vIFx1NjY2RVx1OTAxQVx1NTkxNlx1OTRGRVx1NjIxNiBiYXNlNjRcdUZGMENcdTUzOUZcdTY4MzdcdTRGRERcdTc1NTlcbiAgICByZXR1cm4gZnVsbDtcbiAgfSk7XG59XG5cbi8qKiBcdTRFQ0UgdG9rZW5NYXAgXHU5MUNDXHU1M0Q2XHU0RTAwXHU0RTJBXHVGRjA4ZmFsbGJhY2tcdUZGMENcdTc1MjhcdTRFOEVcdTk4N0FcdTVFOEZcdTUzMzlcdTkxNERcdTU3M0FcdTY2NkZcdUZGMENcdThDMDNcdTc1MjhcdTY1QjlcdTVFOTRcdTRGMThcdTUxNDhcdTdDQkVcdTc4NkVcdTUzMzlcdTkxNERcdUZGMDlcdTMwMDIgKi9cbmZ1bmN0aW9uIHBpY2tGcm9tTWFwKHRva2VuTWFwOiBTZXQ8c3RyaW5nPiB8IE1hcDxzdHJpbmcsIHN0cmluZz4pOiBzdHJpbmcgfCBudWxsIHtcbiAgaWYgKHRva2VuTWFwIGluc3RhbmNlb2YgTWFwKSByZXR1cm4gbnVsbDtcbiAgaWYgKHRva2VuTWFwLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuICByZXR1cm4gdG9rZW5NYXAudmFsdWVzKCkubmV4dCgpLnZhbHVlID8/IG51bGw7XG59XG5cbmZ1bmN0aW9uIHBpY2tFeGFjdFRva2VuKHRva2VuTWFwOiBTZXQ8c3RyaW5nPiB8IE1hcDxzdHJpbmcsIHN0cmluZz4sIHVybDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmICghKHRva2VuTWFwIGluc3RhbmNlb2YgTWFwKSkgcmV0dXJuIG51bGw7XG4gIHJldHVybiB0b2tlbk1hcC5nZXQodXJsKSA/PyB0b2tlbk1hcC5nZXQodXJsLnJlcGxhY2UoLyZhbXA7L2csICcmJykpID8/IG51bGw7XG59XG5cbi8qKlxuICogXHU0RUNFIHhtbCBcdTkxQ0NcdTYzRDBcdTUzRDZcdTYyNDBcdTY3MDkgYDxpbWcgc3JjPVwiVE9LRU5cIiAuLi4vPmAgXHU3Njg0IGZpbGVfdG9rZW5cdTMwMDJcbiAqIFx1OThERVx1NEU2NiB4bWwgXHU3Njg0IHNyYyBcdTc2RjRcdTYzQTVcdTVDMzFcdTY2MkYgZmlsZV90b2tlblx1RkYwOFx1NEUwRFx1NjYyRiBVUkxcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RJbWdUb2tlbnNGcm9tWG1sKHhtbDogc3RyaW5nKTogc3RyaW5nW10ge1xuICBjb25zdCB0b2tlbnMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgaW1nUmUgPSAvPGltZ1xcYltePl0qXFxic3JjPVtcIiddKFteXCInXSspW1wiJ11bXj5dKlxcLz8+L2c7XG4gIGxldCBtOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuICB3aGlsZSAoKG0gPSBpbWdSZS5leGVjKHhtbCkpICE9PSBudWxsKSB7XG4gICAgY29uc3Qgc3JjID0gbVsxXS50cmltKCk7XG4gICAgaWYgKHNyYy5zdGFydHNXaXRoKEZFSVNIVV9QUk9UTykpIHtcbiAgICAgIHRva2Vucy5hZGQoc3JjLnNsaWNlKEZFSVNIVV9QUk9UTy5sZW5ndGgpKTtcbiAgICB9IGVsc2UgaWYgKFRPS0VOX1JFLnRlc3Qoc3JjKSAmJiAhc3JjLnN0YXJ0c1dpdGgoJ2h0dHAnKSkge1xuICAgICAgdG9rZW5zLmFkZChzcmMpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gWy4uLnRva2Vuc107XG59XG5cbi8qKlxuICogXHU0RUNFXHU5OERFXHU0RTY2IFhNTCBcdTYzRDBcdTUzRDYgYGhyZWYgXHU0RTM0XHU2NUY2XHU1NkZFXHU5NEZFIC0+IHNyYyBmaWxlX3Rva2VuYCBcdTY2MjBcdTVDMDRcdTMwMDJcbiAqIG1hcmtkb3duIFx1NUJGQ1x1NTFGQVx1NTNFQVx1N0VEOVx1NEUzNFx1NjVGNiBhdXRoY29kZSBVUkxcdUZGMUJYTUwgXHU3Njg0IHNyYyBcdTYyNERcdTY2MkZcdTUzRUZcdTk1N0ZcdTY3MUZcdTRGRERcdTVCNThcdTc2ODQgZmlsZV90b2tlblx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEltZ1Rva2VuTWFwRnJvbVhtbCh4bWw6IHN0cmluZyk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICBjb25zdCBtYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICBjb25zdCBpbWdSZSA9IC88aW1nXFxiW14+XSo+L2c7XG4gIGxldCBtOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuICB3aGlsZSAoKG0gPSBpbWdSZS5leGVjKHhtbCkpICE9PSBudWxsKSB7XG4gICAgY29uc3QgdGFnID0gbVswXTtcbiAgICBjb25zdCBzcmMgPSBhdHRyKHRhZywgJ3NyYycpO1xuICAgIGNvbnN0IGhyZWYgPSBhdHRyKHRhZywgJ2hyZWYnKTtcbiAgICBpZiAoIXNyYyB8fCAhaHJlZiB8fCBzcmMuc3RhcnRzV2l0aCgnaHR0cCcpKSBjb250aW51ZTtcbiAgICBpZiAoIVRPS0VOX1JFLnRlc3Qoc3JjKSkgY29udGludWU7XG4gICAgbWFwLnNldChkZWNvZGVYbWxBdHRyKGhyZWYpLCBzcmMpO1xuICB9XG4gIHJldHVybiBtYXA7XG59XG5cbmZ1bmN0aW9uIGF0dHIodGFnOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCByZSA9IG5ldyBSZWdFeHAoYFxcXFxiJHtuYW1lfT1bXCInXShbXlwiJ10rKVtcIiddYCk7XG4gIHJldHVybiB0YWcubWF0Y2gocmUpPy5bMV0gPz8gbnVsbDtcbn1cblxuZnVuY3Rpb24gZGVjb2RlWG1sQXR0cih2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHZhbHVlXG4gICAgLnJlcGxhY2UoLyZhbXA7L2csICcmJylcbiAgICAucmVwbGFjZSgvJnF1b3Q7L2csICdcIicpXG4gICAgLnJlcGxhY2UoLyZhcG9zOy9nLCBcIidcIilcbiAgICAucmVwbGFjZSgvJmx0Oy9nLCAnPCcpXG4gICAgLnJlcGxhY2UoLyZndDsvZywgJz4nKTtcbn1cblxuLyoqXG4gKiBcdTRFQ0UgbWQgXHU2QjYzXHU2NTg3XHU5MUNDXHU2M0QwXHU1M0Q2XHU2MjQwXHU2NzA5IGZlaXNodTovL1RPS0VOXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0RmVpc2h1SW1hZ2VUb2tlbnMobWQ6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgY29uc3QgdG9rZW5zID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChcbiAgICBgIVxcXFxbW15cXFxcXV0qXFxcXF1cXFxcKCR7RkVJU0hVX1BST1RPLnJlcGxhY2UoJy8nLCAnXFxcXC8nKX0oW0EtWmEtejAtOV0rKVxcXFwpYCxcbiAgICAnZycsXG4gICk7XG4gIGxldCBtOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuICB3aGlsZSAoKG0gPSByZS5leGVjKG1kKSkgIT09IG51bGwpIHtcbiAgICB0b2tlbnMuYWRkKG1bMV0pO1xuICB9XG4gIHJldHVybiBbLi4udG9rZW5zXTtcbn1cblxuLyoqXG4gKiBcdTYyOEEgT0IgXHU2QjYzXHU2NTg3XHU5MUNDXHU3Njg0IGAhW10oZmVpc2h1Oi8vVE9LRU4pYCBcdThGRDhcdTUzOUZcdTRFM0FcdTk4REVcdTRFNjYgeG1sIGA8aW1nIHNyYz1cIlRPS0VOXCIvPmBcdTMwMDJcbiAqIFx1NzUyOFx1NEU4RSBPQlx1MjE5Mlx1OThERVx1NEU2Nlx1NTZERVx1NTE5OVx1RkYwOG1kIFx1OTBFOFx1NTIwNlx1NzUyOCBtYXJrZG93blx1RkYwQ1x1NTZGRVx1NzI0N1x1OTcwMFx1NzUyOCB4bWwgXHU2ODA3XHU3QjdFXHU2MjREXHU4MEZEXHU4OEFCXHU5OERFXHU0RTY2XHU4QkM2XHU1MjJCXHU0RTNBXHU1REYyXHU2NzA5IHRva2VuXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmZWlzaHVQcm90b1RvWG1sKG1kOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCByZSA9IC8hXFxbKFteXFxdXSopXFxdXFwoZmVpc2h1OlxcL1xcLyhbQS1aYS16MC05XSspXFwpL2c7XG4gIHJldHVybiBtZC5yZXBsYWNlKHJlLCAoX2Z1bGwsIF9hbHQ6IHN0cmluZywgdG9rZW46IHN0cmluZykgPT4ge1xuICAgIHJldHVybiBgPGltZyBzcmM9XCIke3Rva2VufVwiLz5gO1xuICB9KTtcbn1cbiIsICJjb25zdCBOT1RfUkVTT0xWRUQ6IHVuaXF1ZSBzeW1ib2wgPSBTeW1ib2woJ05PVF9SRVNPTFZFRCcpXG5jb25zdCBNRVJHRV9LRVk6IHVuaXF1ZSBzeW1ib2wgPSBTeW1ib2woJ01FUkdFX0tFWScpXG5cbnR5cGUgU2NhbGFyUmVwcmVzZW50ID0gKGRhdGE6IGFueSkgPT4gc3RyaW5nXG50eXBlIFNlcXVlbmNlUmVwcmVzZW50ID0gKGRhdGE6IGFueSkgPT4gQXJyYXlMaWtlPHVua25vd24+XG50eXBlIE1hcHBpbmdSZXByZXNlbnQgPSAoZGF0YTogYW55KSA9PiBNYXA8dW5rbm93biwgdW5rbm93bj5cblxudHlwZSBJZGVudGlmeUZuID0gKGRhdGE6IGFueSkgPT4gYm9vbGVhblxudHlwZSBSZXByZXNlbnRUYWdOYW1lRm4gPSAoZGF0YTogYW55KSA9PiBzdHJpbmdcblxuaW50ZXJmYWNlIFNjYWxhclRhZ0RlZmluaXRpb248UmVzdWx0ID0gdW5rbm93bj4ge1xuICB0YWdOYW1lOiBzdHJpbmdcbiAgbm9kZUtpbmQ6ICdzY2FsYXInXG4gIGltcGxpY2l0OiBib29sZWFuXG4gIG1hdGNoQnlUYWdQcmVmaXg6IGJvb2xlYW5cbiAgLy8gU2V0IG9mIGBzb3VyY2UuY2hhckF0KDApYCBrZXlzIGZvciB3aGljaCBgcmVzb2x2ZWAgbWF5IHN1Y2NlZWQgKGEgc3VwZXJzZXQgb2ZcbiAgLy8gd2hhdCBpdCByZWFsbHkgbWF0Y2hlcykuIEEga2V5IGlzIGVpdGhlciBhIHNpbmdsZSBjaGFyYWN0ZXIgb3IgJycgKGVtcHR5XG4gIC8vIHNvdXJjZSkuIGBudWxsYCBtZWFucyBcIm5vIGNvbnN0cmFpbnQsIGFsd2F5cyB0cnlcIi4gVXNlZCBieSB0aGUgY29tcG9zZXIgdG9cbiAgLy8gZGlzcGF0Y2ggaW1wbGljaXQgc2NhbGFycyBieSBmaXJzdCBjaGFyYWN0ZXIgd2l0aG91dCBydW5uaW5nIGV2ZXJ5IHJlc29sdmVyLlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IHJlYWRvbmx5IHN0cmluZ1tdIHwgbnVsbFxuICAvLyBgaXNFeHBsaWNpdGAgaXMgdHJ1ZSBmb3IgYW4gZXhwbGljaXQgdGFnIChgISF0YWdgKSwgZmFsc2UgZm9yIGltcGxpY2l0IHBsYWluXG4gIC8vIHNjYWxhciByZXNvbHV0aW9uLlxuICByZXNvbHZlOiAoc291cmNlOiBzdHJpbmcsIGlzRXhwbGljaXQ6IGJvb2xlYW4sIHRhZ05hbWU6IHN0cmluZykgPT4gUmVzdWx0IHwgdHlwZW9mIE5PVF9SRVNPTFZFRFxuICBpZGVudGlmeTogSWRlbnRpZnlGbiB8IG51bGxcbiAgLy8gQSBzY2FsYXIncyBwcmludGVkIGZvcm0gaXMgdGV4dCwgc28gYHJlcHJlc2VudGAgYWx3YXlzIHlpZWxkcyBhIHN0cmluZy4gVGhlXG4gIC8vIGZhY3Rvcnkgc3VwcGxpZXMgYSBgU3RyaW5nKGRhdGEpYCBkZWZhdWx0IHdoZW4gYSB0YWcgb21pdHMgaXQuXG4gIHJlcHJlc2VudDogU2NhbGFyUmVwcmVzZW50XG4gIHJlcHJlc2VudFRhZ05hbWU6IFJlcHJlc2VudFRhZ05hbWVGbiB8IG51bGxcbn1cblxuaW50ZXJmYWNlIFNlcXVlbmNlVGFnRGVmaW5pdGlvbjxDYXJyaWVyID0gdW5rbm93biwgUmVzdWx0ID0gQ2Fycmllcj4ge1xuICB0YWdOYW1lOiBzdHJpbmdcbiAgbm9kZUtpbmQ6ICdzZXF1ZW5jZSdcbiAgaW1wbGljaXQ6IGZhbHNlXG4gIG1hdGNoQnlUYWdQcmVmaXg6IGJvb2xlYW5cbiAgY3JlYXRlOiAodGFnTmFtZTogc3RyaW5nKSA9PiBDYXJyaWVyXG4gIGFkZEl0ZW06IChjYXJyaWVyOiBDYXJyaWVyLCBpdGVtOiB1bmtub3duLCBpbmRleDogbnVtYmVyKSA9PiB2b2lkIHwgc3RyaW5nXG4gIGZpbmFsaXplOiAoY2FycmllcjogQ2FycmllcikgPT4gUmVzdWx0XG4gIGNhcnJpZXJJc1Jlc3VsdDogYm9vbGVhblxuICBpZGVudGlmeTogSWRlbnRpZnlGbiB8IG51bGxcbiAgcmVwcmVzZW50OiBTZXF1ZW5jZVJlcHJlc2VudFxuICByZXByZXNlbnRUYWdOYW1lOiBSZXByZXNlbnRUYWdOYW1lRm4gfCBudWxsXG59XG5cbmludGVyZmFjZSBNYXBwaW5nVGFnRGVmaW5pdGlvbjxDYXJyaWVyID0gdW5rbm93biwgUmVzdWx0ID0gQ2Fycmllcj4ge1xuICB0YWdOYW1lOiBzdHJpbmdcbiAgbm9kZUtpbmQ6ICdtYXBwaW5nJ1xuICBpbXBsaWNpdDogZmFsc2VcbiAgbWF0Y2hCeVRhZ1ByZWZpeDogYm9vbGVhblxuICBjcmVhdGU6ICh0YWdOYW1lOiBzdHJpbmcpID0+IENhcnJpZXJcbiAgLy8gV3JpdGVzIGEgcGFpci4gUmV0dXJucyAnJyBvbiBzdWNjZXNzLCBhIG5vbi1lbXB0eSBlcnJvciBtZXNzYWdlIG90aGVyd2lzZVxuICAvLyAoa2V5IGRvZXMgbm90IGZpdCB0aGUgcmVwcmVzZW50YXRpb24sIHZhbHVlIHJlamVjdGVkLCAuLi4pLiBBbHdheXMgYSBzdHJpbmdcbiAgLy8gc28gdGhlIGhvdCBwYXRoIG5ldmVyIGFsbG9jYXRlcyBhbiBleGNlcHRpb24gd3JhcHBlci5cbiAgYWRkUGFpcjogKGNhcnJpZXI6IENhcnJpZXIsIGtleTogdW5rbm93biwgdmFsdWU6IHVua25vd24pID0+IHN0cmluZ1xuICAvLyBSZWFkIHNpZGUsIG1pcnJvcnMgYE1hcGAg4oCUIGRlZmluaW5nIGEgcmVwcmVzZW50YXRpb24gbWVhbnMgZGVmaW5pbmcgaG93IHRvXG4gIC8vIHJlYWQgaXQgYmFjay4gYGhhc2AgaXMgdGhlIGhvdCBkZWR1cCBwcm9iZSAobWVtYmVyc2hpcCB3aXRob3V0IGZldGNoaW5nIHRoZVxuICAvLyB2YWx1ZSk7IGBrZXlzYC9gZ2V0YCBhcmUgdXNlZCBvbmx5IG9uIHRoZSBjb2xkIG1lcmdlIHBhdGggKGA8PGApLlxuICBoYXM6IChjYXJyaWVyOiBDYXJyaWVyLCBrZXk6IHVua25vd24pID0+IGJvb2xlYW5cbiAga2V5czogKHJlc3VsdDogUmVzdWx0KSA9PiBJdGVyYWJsZTx1bmtub3duPlxuICBnZXQ6IChyZXN1bHQ6IFJlc3VsdCwga2V5OiB1bmtub3duKSA9PiB1bmtub3duXG4gIGZpbmFsaXplOiAoY2FycmllcjogQ2FycmllcikgPT4gUmVzdWx0XG4gIGNhcnJpZXJJc1Jlc3VsdDogYm9vbGVhblxuICBpZGVudGlmeTogSWRlbnRpZnlGbiB8IG51bGxcbiAgcmVwcmVzZW50OiBNYXBwaW5nUmVwcmVzZW50XG4gIHJlcHJlc2VudFRhZ05hbWU6IFJlcHJlc2VudFRhZ05hbWVGbiB8IG51bGxcbn1cblxudHlwZSBUYWdEZWZpbml0aW9uID1cbiAgfCBTY2FsYXJUYWdEZWZpbml0aW9uPGFueT5cbiAgfCBTZXF1ZW5jZVRhZ0RlZmluaXRpb248YW55LCBhbnk+XG4gIHwgTWFwcGluZ1RhZ0RlZmluaXRpb248YW55LCBhbnk+XG5cbmludGVyZmFjZSBTY2FsYXJUYWdPcHRpb25zPFJlc3VsdD4ge1xuICBpbXBsaWNpdD86IGJvb2xlYW5cbiAgbWF0Y2hCeVRhZ1ByZWZpeD86IGJvb2xlYW5cbiAgaW1wbGljaXRGaXJzdENoYXJzPzogcmVhZG9ubHkgc3RyaW5nW10gfCBudWxsXG4gIHJlc29sdmU6IFNjYWxhclRhZ0RlZmluaXRpb248UmVzdWx0PlsncmVzb2x2ZSddXG4gIGlkZW50aWZ5PzogU2NhbGFyVGFnRGVmaW5pdGlvbjxSZXN1bHQ+WydpZGVudGlmeSddXG4gIHJlcHJlc2VudD86IFNjYWxhclRhZ0RlZmluaXRpb248UmVzdWx0PlsncmVwcmVzZW50J11cbiAgcmVwcmVzZW50VGFnTmFtZT86IFNjYWxhclRhZ0RlZmluaXRpb248UmVzdWx0PlsncmVwcmVzZW50VGFnTmFtZSddXG59XG5cbnR5cGUgUmVwcmVzZW50T3B0aW9uczxDb250YWluZXIsIENhbm9uaWNhbCwgUmVwcmVzZW50PiA9XG4gIHwge1xuICAgICAgaWRlbnRpZnk/OiBudWxsXG4gICAgICByZXByZXNlbnQ/OiBSZXByZXNlbnRcbiAgICAgIHJlcHJlc2VudFRhZ05hbWU/OiBSZXByZXNlbnRUYWdOYW1lRm4gfCBudWxsXG4gICAgfVxuICB8IChDb250YWluZXIgZXh0ZW5kcyBDYW5vbmljYWxcbiAgICAgID8ge1xuICAgICAgICAgIGlkZW50aWZ5PzogSWRlbnRpZnlGbiB8IG51bGxcbiAgICAgICAgICByZXByZXNlbnQ/OiBSZXByZXNlbnRcbiAgICAgICAgICByZXByZXNlbnRUYWdOYW1lPzogUmVwcmVzZW50VGFnTmFtZUZuIHwgbnVsbFxuICAgICAgICB9XG4gICAgICA6IHtcbiAgICAgICAgICBpZGVudGlmeTogSWRlbnRpZnlGblxuICAgICAgICAgIHJlcHJlc2VudDogUmVwcmVzZW50XG4gICAgICAgICAgcmVwcmVzZW50VGFnTmFtZT86IFJlcHJlc2VudFRhZ05hbWVGbiB8IG51bGxcbiAgICAgICAgfSlcblxudHlwZSBTZXF1ZW5jZVRhZ09wdGlvbnM8Q2FycmllciwgUmVzdWx0ID0gQ2Fycmllcj4gPSB7XG4gIG1hdGNoQnlUYWdQcmVmaXg/OiBib29sZWFuXG4gIGNyZWF0ZTogU2VxdWVuY2VUYWdEZWZpbml0aW9uPENhcnJpZXIsIFJlc3VsdD5bJ2NyZWF0ZSddXG4gIGFkZEl0ZW06IFNlcXVlbmNlVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+WydhZGRJdGVtJ11cbiAgZmluYWxpemU/OiBTZXF1ZW5jZVRhZ0RlZmluaXRpb248Q2FycmllciwgUmVzdWx0PlsnZmluYWxpemUnXVxufSAmIFJlcHJlc2VudE9wdGlvbnM8UmVzdWx0LCBBcnJheUxpa2U8dW5rbm93bj4sIFNlcXVlbmNlUmVwcmVzZW50PlxuXG50eXBlIE1hcHBpbmdUYWdPcHRpb25zPENhcnJpZXIsIFJlc3VsdCA9IENhcnJpZXI+ID0ge1xuICBtYXRjaEJ5VGFnUHJlZml4PzogYm9vbGVhblxuICBjcmVhdGU6IE1hcHBpbmdUYWdEZWZpbml0aW9uPENhcnJpZXIsIFJlc3VsdD5bJ2NyZWF0ZSddXG4gIGFkZFBhaXI6IE1hcHBpbmdUYWdEZWZpbml0aW9uPENhcnJpZXIsIFJlc3VsdD5bJ2FkZFBhaXInXVxuICBoYXM6IE1hcHBpbmdUYWdEZWZpbml0aW9uPENhcnJpZXIsIFJlc3VsdD5bJ2hhcyddXG4gIGtleXM6IE1hcHBpbmdUYWdEZWZpbml0aW9uPENhcnJpZXIsIFJlc3VsdD5bJ2tleXMnXVxuICBnZXQ6IE1hcHBpbmdUYWdEZWZpbml0aW9uPENhcnJpZXIsIFJlc3VsdD5bJ2dldCddXG4gIGZpbmFsaXplPzogTWFwcGluZ1RhZ0RlZmluaXRpb248Q2FycmllciwgUmVzdWx0PlsnZmluYWxpemUnXVxufSAmIFJlcHJlc2VudE9wdGlvbnM8UmVzdWx0LCBNYXA8dW5rbm93biwgdW5rbm93bj4sIE1hcHBpbmdSZXByZXNlbnQ+XG5cbmZ1bmN0aW9uIGRlZmluZVNjYWxhclRhZzxSZXN1bHQ+ICh0YWdOYW1lOiBzdHJpbmcsIG9wdGlvbnM6IFNjYWxhclRhZ09wdGlvbnM8UmVzdWx0Pik6IFNjYWxhclRhZ0RlZmluaXRpb248UmVzdWx0PiB7XG4gIHJldHVybiB7XG4gICAgdGFnTmFtZSxcbiAgICBub2RlS2luZDogJ3NjYWxhcicsXG4gICAgaW1wbGljaXQ6IG9wdGlvbnMuaW1wbGljaXQgPz8gZmFsc2UsXG4gICAgbWF0Y2hCeVRhZ1ByZWZpeDogb3B0aW9ucy5tYXRjaEJ5VGFnUHJlZml4ID8/IGZhbHNlLFxuICAgIGltcGxpY2l0Rmlyc3RDaGFyczogb3B0aW9ucy5pbXBsaWNpdEZpcnN0Q2hhcnMgPz8gbnVsbCxcbiAgICByZXNvbHZlOiBvcHRpb25zLnJlc29sdmUsXG4gICAgaWRlbnRpZnk6IG9wdGlvbnMuaWRlbnRpZnkgPz8gbnVsbCxcbiAgICByZXByZXNlbnQ6IG9wdGlvbnMucmVwcmVzZW50ID8/IChkYXRhID0+IFN0cmluZyhkYXRhKSksXG4gICAgcmVwcmVzZW50VGFnTmFtZTogb3B0aW9ucy5yZXByZXNlbnRUYWdOYW1lID8/IG51bGxcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWZpbmVTZXF1ZW5jZVRhZzxDYXJyaWVyLCBSZXN1bHQgPSBDYXJyaWVyPiAodGFnTmFtZTogc3RyaW5nLCBvcHRpb25zOiBTZXF1ZW5jZVRhZ09wdGlvbnM8Q2FycmllciwgUmVzdWx0Pik6IFNlcXVlbmNlVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+IHtcbiAgY29uc3QgY2FycmllcklzUmVzdWx0ID0gb3B0aW9ucy5maW5hbGl6ZSA9PT0gdW5kZWZpbmVkXG5cbiAgcmV0dXJuIHtcbiAgICB0YWdOYW1lLFxuICAgIG5vZGVLaW5kOiAnc2VxdWVuY2UnLFxuICAgIGltcGxpY2l0OiBmYWxzZSxcbiAgICBtYXRjaEJ5VGFnUHJlZml4OiBvcHRpb25zLm1hdGNoQnlUYWdQcmVmaXggPz8gZmFsc2UsXG4gICAgY3JlYXRlOiBvcHRpb25zLmNyZWF0ZSxcbiAgICBhZGRJdGVtOiBvcHRpb25zLmFkZEl0ZW0sXG4gICAgZmluYWxpemU6IG9wdGlvbnMuZmluYWxpemUgPz8gKGNhcnJpZXIgPT4gY2FycmllciBhcyB1bmtub3duIGFzIFJlc3VsdCksXG4gICAgY2FycmllcklzUmVzdWx0LFxuICAgIGlkZW50aWZ5OiBvcHRpb25zLmlkZW50aWZ5ID8/IG51bGwsXG4gICAgcmVwcmVzZW50OiBvcHRpb25zLnJlcHJlc2VudCA/PyAoZGF0YSA9PiBkYXRhIGFzIEFycmF5TGlrZTx1bmtub3duPiksXG4gICAgcmVwcmVzZW50VGFnTmFtZTogb3B0aW9ucy5yZXByZXNlbnRUYWdOYW1lID8/IG51bGxcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWZpbmVNYXBwaW5nVGFnPENhcnJpZXIsIFJlc3VsdCA9IENhcnJpZXI+ICh0YWdOYW1lOiBzdHJpbmcsIG9wdGlvbnM6IE1hcHBpbmdUYWdPcHRpb25zPENhcnJpZXIsIFJlc3VsdD4pOiBNYXBwaW5nVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+IHtcbiAgY29uc3QgY2FycmllcklzUmVzdWx0ID0gb3B0aW9ucy5maW5hbGl6ZSA9PT0gdW5kZWZpbmVkXG5cbiAgcmV0dXJuIHtcbiAgICB0YWdOYW1lLFxuICAgIG5vZGVLaW5kOiAnbWFwcGluZycsXG4gICAgaW1wbGljaXQ6IGZhbHNlLFxuICAgIG1hdGNoQnlUYWdQcmVmaXg6IG9wdGlvbnMubWF0Y2hCeVRhZ1ByZWZpeCA/PyBmYWxzZSxcbiAgICBjcmVhdGU6IG9wdGlvbnMuY3JlYXRlLFxuICAgIGFkZFBhaXI6IG9wdGlvbnMuYWRkUGFpcixcbiAgICBoYXM6IG9wdGlvbnMuaGFzLFxuICAgIGtleXM6IG9wdGlvbnMua2V5cyxcbiAgICBnZXQ6IG9wdGlvbnMuZ2V0LFxuICAgIGZpbmFsaXplOiBvcHRpb25zLmZpbmFsaXplID8/IChjYXJyaWVyID0+IGNhcnJpZXIgYXMgdW5rbm93biBhcyBSZXN1bHQpLFxuICAgIGNhcnJpZXJJc1Jlc3VsdCxcbiAgICBpZGVudGlmeTogb3B0aW9ucy5pZGVudGlmeSA/PyBudWxsLFxuICAgIHJlcHJlc2VudDogb3B0aW9ucy5yZXByZXNlbnQgPz8gKGRhdGEgPT4gZGF0YSBhcyBNYXA8dW5rbm93biwgdW5rbm93bj4pLFxuICAgIHJlcHJlc2VudFRhZ05hbWU6IG9wdGlvbnMucmVwcmVzZW50VGFnTmFtZSA/PyBudWxsXG4gIH1cbn1cblxuZXhwb3J0IHtcbiAgTk9UX1JFU09MVkVELFxuICBNRVJHRV9LRVksXG4gIGRlZmluZVNjYWxhclRhZyxcbiAgZGVmaW5lU2VxdWVuY2VUYWcsXG4gIGRlZmluZU1hcHBpbmdUYWcsXG5cbiAgdHlwZSBTY2FsYXJUYWdEZWZpbml0aW9uLFxuICB0eXBlIFNlcXVlbmNlVGFnRGVmaW5pdGlvbixcbiAgdHlwZSBNYXBwaW5nVGFnRGVmaW5pdGlvbixcbiAgdHlwZSBUYWdEZWZpbml0aW9uLFxuICB0eXBlIFNjYWxhclRhZ09wdGlvbnMsXG4gIHR5cGUgU2VxdWVuY2VUYWdPcHRpb25zLFxuICB0eXBlIE1hcHBpbmdUYWdPcHRpb25zLFxuICB0eXBlIFNjYWxhclJlcHJlc2VudCxcbiAgdHlwZSBTZXF1ZW5jZVJlcHJlc2VudCxcbiAgdHlwZSBNYXBwaW5nUmVwcmVzZW50XG59XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG5jb25zdCBzdHJUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOnN0cicsIHtcbiAgcmVzb2x2ZTogKHNvdXJjZSkgPT4gc291cmNlLFxuICBpZGVudGlmeTogKGRhdGEpID0+IHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJ1xufSlcblxuZXhwb3J0IHsgc3RyVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgTlVMTF9WQUxVRVMgPSBbJycsICd+JywgJ251bGwnLCAnTnVsbCcsICdOVUxMJ11cblxuY29uc3QgbnVsbENvcmVUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOm51bGwnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBTdXBlcnNldCBvZiBzb3VyY2UuY2hhckF0KDApIG92ZXIgYWxsIG1hdGNoZWQgaW5wdXRzOiAnJyAoZW1wdHkpLCAnficsICdudWxsJy8nTnVsbCcvJ05VTEwnLlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IFsnJywgJ34nLCAnbicsICdOJ10sXG4gIHJlc29sdmU6IChzb3VyY2UpID0+IHtcbiAgICBpZiAoTlVMTF9WQUxVRVMuaW5kZXhPZihzb3VyY2UpICE9PSAtMSkgcmV0dXJuIG51bGxcblxuICAgIHJldHVybiBOT1RfUkVTT0xWRURcbiAgfSxcbiAgaWRlbnRpZnk6IChvYmplY3QpID0+IG9iamVjdCA9PT0gbnVsbCxcbiAgcmVwcmVzZW50OiAoKSA9PiAnbnVsbCdcbn0pXG5cbmV4cG9ydCB7IG51bGxDb3JlVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgbnVsbEpzb25UYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOm51bGwnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBTdXBlcnNldCBvZiBzb3VyY2UuY2hhckF0KDApIG92ZXIgYWxsIG1hdGNoZWQgaW5wdXRzOiBudWxsLlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IFsnbiddLFxuICByZXNvbHZlOiAoc291cmNlLCBpc0V4cGxpY2l0KSA9PiB7XG4gICAgaWYgKHNvdXJjZSA9PT0gJ251bGwnIHx8IChpc0V4cGxpY2l0ICYmIHNvdXJjZSA9PT0gJycpKSByZXR1cm4gbnVsbFxuXG4gICAgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICB9LFxuICBpZGVudGlmeTogKG9iamVjdCkgPT4gb2JqZWN0ID09PSBudWxsLFxuICByZXByZXNlbnQ6ICgpID0+ICdudWxsJ1xufSlcblxuZXhwb3J0IHsgbnVsbEpzb25UYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZywgTk9UX1JFU09MVkVEIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG5jb25zdCBOVUxMX1ZBTFVFUyA9IFsnJywgJ34nLCAnbnVsbCcsICdOdWxsJywgJ05VTEwnXVxuXG5jb25zdCBudWxsWWFtbDExVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpudWxsJywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0czogJycgKGVtcHR5KSwgJ34nLCAnbnVsbCcvJ051bGwnLydOVUxMJy5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJycsICd+JywgJ24nLCAnTiddLFxuICByZXNvbHZlOiAoc291cmNlKSA9PiB7XG4gICAgaWYgKE5VTExfVkFMVUVTLmluZGV4T2Yoc291cmNlKSAhPT0gLTEpIHJldHVybiBudWxsXG5cbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH0sXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PiBvYmplY3QgPT09IG51bGwsXG4gIHJlcHJlc2VudDogKCkgPT4gJ251bGwnXG59KVxuXG5leHBvcnQgeyBudWxsWWFtbDExVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgVFJVRV9WQUxVRVMgPSBbJ3RydWUnLCAnVHJ1ZScsICdUUlVFJ11cbmNvbnN0IEZBTFNFX1ZBTFVFUyA9IFsnZmFsc2UnLCAnRmFsc2UnLCAnRkFMU0UnXVxuXG5jb25zdCBib29sQ29yZVRhZyA9IGRlZmluZVNjYWxhclRhZygndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsIHtcbiAgaW1wbGljaXQ6IHRydWUsXG4gIC8vIFN1cGVyc2V0IG9mIHNvdXJjZS5jaGFyQXQoMCkgb3ZlciBhbGwgbWF0Y2hlZCBpbnB1dHM6IHRydWUvVHJ1ZS9UUlVFLCBmYWxzZS9GYWxzZS9GQUxTRS5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJ3QnLCAnVCcsICdmJywgJ0YnXSxcbiAgcmVzb2x2ZTogKHNvdXJjZSkgPT4ge1xuICAgIGlmIChUUlVFX1ZBTFVFUy5pbmRleE9mKHNvdXJjZSkgIT09IC0xKSByZXR1cm4gdHJ1ZVxuICAgIGlmIChGQUxTRV9WQUxVRVMuaW5kZXhPZihzb3VyY2UpICE9PSAtMSkgcmV0dXJuIGZhbHNlXG5cbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH0sXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICByZXByZXNlbnQ6IChvYmplY3QpID0+IG9iamVjdCA/ICd0cnVlJyA6ICdmYWxzZSdcbn0pXG5cbmV4cG9ydCB7IGJvb2xDb3JlVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgVFJVRV9WQUxVRVMgPSBbJ3RydWUnXVxuY29uc3QgRkFMU0VfVkFMVUVTID0gWydmYWxzZSddXG5cbmNvbnN0IGJvb2xKc29uVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpib29sJywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0czogdHJ1ZSwgZmFsc2UuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWyd0JywgJ2YnXSxcbiAgcmVzb2x2ZTogKHNvdXJjZSkgPT4ge1xuICAgIGlmIChUUlVFX1ZBTFVFUy5pbmRleE9mKHNvdXJjZSkgIT09IC0xKSByZXR1cm4gdHJ1ZVxuICAgIGlmIChGQUxTRV9WQUxVRVMuaW5kZXhPZihzb3VyY2UpICE9PSAtMSkgcmV0dXJuIGZhbHNlXG5cbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH0sXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICByZXByZXNlbnQ6IChvYmplY3QpID0+IG9iamVjdCA/ICd0cnVlJyA6ICdmYWxzZSdcbn0pXG5cbmV4cG9ydCB7IGJvb2xKc29uVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgVFJVRV9WQUxVRVMgPSBbJ3RydWUnLCAnVHJ1ZScsICdUUlVFJywgJ3knLCAnWScsICd5ZXMnLCAnWWVzJywgJ1lFUycsICdvbicsICdPbicsICdPTiddXG5jb25zdCBGQUxTRV9WQUxVRVMgPSBbJ2ZhbHNlJywgJ0ZhbHNlJywgJ0ZBTFNFJywgJ24nLCAnTicsICdubycsICdObycsICdOTycsICdvZmYnLCAnT2ZmJywgJ09GRiddXG5cbmNvbnN0IGJvb2xZYW1sMTFUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOmJvb2wnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBTdXBlcnNldCBvZiBzb3VyY2UuY2hhckF0KDApIG92ZXIgYWxsIG1hdGNoZWQgaW5wdXRzLlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IFsneScsICdZJywgJ24nLCAnTicsICd0JywgJ1QnLCAnZicsICdGJywgJ28nLCAnTyddLFxuICByZXNvbHZlOiAoc291cmNlKSA9PiB7XG4gICAgaWYgKFRSVUVfVkFMVUVTLmluZGV4T2Yoc291cmNlKSAhPT0gLTEpIHJldHVybiB0cnVlXG4gICAgaWYgKEZBTFNFX1ZBTFVFUy5pbmRleE9mKHNvdXJjZSkgIT09IC0xKSByZXR1cm4gZmFsc2VcblxuICAgIHJldHVybiBOT1RfUkVTT0xWRURcbiAgfSxcbiAgaWRlbnRpZnk6IChvYmplY3QpID0+IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09PSAnW29iamVjdCBCb29sZWFuXScsXG4gIHJlcHJlc2VudDogKG9iamVjdCkgPT4gb2JqZWN0ID8gJ3RydWUnIDogJ2ZhbHNlJ1xufSlcblxuZXhwb3J0IHsgYm9vbFlhbWwxMVRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbi8vIFlBTUwgMS4yIENvcmUgc2NoZW1hIGltcGxpY2l0IHJlc29sdXRpb246XG4vLyBbLStdPyBbMC05XSsgfCAwbyBbMC03XSsgfCAweCBbMC05YS1mQS1GXStcbmNvbnN0IFlBTUxfSU5URUdFUl9JTVBMSUNJVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgLy8gMG8xMjNcbiAgJ14oPzowb1swLTddKycgK1xuICAvLyAweDFBXG4gICd8MHhbMC05YS1mQS1GXSsnICtcbiAgLy8gMTIzNDVcbiAgJ3xbLStdP1swLTldKykkJylcblxuLy8gRXhwbGljaXQgYCEhaW50YCB2YWxpZGF0aW9uIGlzIHNlcGFyYXRlIGZyb20gQ29yZSBpbXBsaWNpdCByZXNvbHV0aW9uLlxuY29uc3QgWUFNTF9JTlRFR0VSX0VYUExJQ0lUX1BBVFRFUk4gPSBuZXcgUmVnRXhwKFxuICAvLyAwYjEwMTBcbiAgJ14oPzpbLStdPzBiWzAtMV0rJyArXG4gIC8vIDBvMTIzXG4gICd8Wy0rXT8wb1swLTddKycgK1xuICAvLyAweDFBXG4gICd8Wy0rXT8weFswLTlhLWZBLUZdKycgK1xuICAvLyAxMjM0NVxuICAnfFstK10/WzAtOV0rKSQnKVxuXG5mdW5jdGlvbiBwYXJzZVlhbWxJbnRlZ2VyIChzb3VyY2U6IHN0cmluZykge1xuICBsZXQgdmFsdWUgPSBzb3VyY2VcbiAgbGV0IHNpZ24gPSAxXG5cbiAgaWYgKHZhbHVlWzBdID09PSAnLScgfHwgdmFsdWVbMF0gPT09ICcrJykge1xuICAgIGlmICh2YWx1ZVswXSA9PT0gJy0nKSBzaWduID0gLTFcbiAgICB2YWx1ZSA9IHZhbHVlLnNsaWNlKDEpXG4gIH1cblxuICBpZiAodmFsdWUuc3RhcnRzV2l0aCgnMGInKSkgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgMilcbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoJzBvJykpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIDgpXG4gIGlmICh2YWx1ZS5zdGFydHNXaXRoKCcweCcpKSByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCAxNilcblxuICByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLCAxMClcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxJbnRlZ2VyIChzb3VyY2U6IHN0cmluZywgaXNFeHBsaWNpdDogYm9vbGVhbikge1xuICBpZiAoaXNFeHBsaWNpdCkge1xuICAgIGlmICghWUFNTF9JTlRFR0VSX0VYUExJQ0lUX1BBVFRFUk4udGVzdChzb3VyY2UpKSByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH0gZWxzZSBpZiAoIVlBTUxfSU5URUdFUl9JTVBMSUNJVF9QQVRURVJOLnRlc3Qoc291cmNlKSkge1xuICAgIHJldHVybiBOT1RfUkVTT0xWRURcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdCA9IHBhcnNlWWFtbEludGVnZXIoc291cmNlKVxuICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHJlc3VsdCkgPyByZXN1bHQgOiBOT1RfUkVTT0xWRURcbn1cblxuY29uc3QgaW50Q29yZVRhZyA9IGRlZmluZVNjYWxhclRhZygndGFnOnlhbWwub3JnLDIwMDI6aW50Jywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0czogb3B0aW9uYWwgc2lnbiArIGRlY2ltYWwgZGlnaXQuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWyctJywgJysnLCAuLi4nMDEyMzQ1Njc4OSddLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbEludGVnZXIsXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PlxuICAgIC8vIE5vIGFuY2llbnQgYm94ZWQgbnVtYmVycyBzdXBwb3J0XG4gICAgTnVtYmVyLmlzSW50ZWdlcihvYmplY3QpICYmXG4gICAgLy8gTmVnYXRpdmUgemVybyA9PiAhIWZsb2F0XG4gICAgIU9iamVjdC5pcyhvYmplY3QsIC0wKSAmJlxuICAgIC8vIEV4cG9uZW50aWFsIGZvcm0gPT4gISFmbG9hdCwgcm91bmQtdHJpcCBmb3IgISFpbnQgMWUyMSB3aWxsIGJlIGJyb2tlblxuICAgIG9iamVjdC50b1N0cmluZygxMCkuaW5kZXhPZignZScpIDwgMCxcbiAgcmVwcmVzZW50OiAob2JqZWN0OiBudW1iZXIpID0+IG9iamVjdC50b1N0cmluZygxMClcbn0pXG5cbmV4cG9ydCB7IGludENvcmVUYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZywgTk9UX1JFU09MVkVEIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG4vLyBZQU1MIDEuMiBKU09OIHNjaGVtYSBpbXBsaWNpdCByZXNvbHV0aW9uOlxuLy8gLT8gKCAwIHwgWzEtOV0gWzAtOV0qIClcbmNvbnN0IFlBTUxfSU5URUdFUl9JTVBMSUNJVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgJ14tPyg/OjB8WzEtOV1bMC05XSopJCcpXG5cbi8vIEV4cGxpY2l0IGAhIWludGAgdmFsaWRhdGlvbiBpcyBzZXBhcmF0ZSBmcm9tIEpTT04gaW1wbGljaXQgcmVzb2x1dGlvbi5cbmNvbnN0IFlBTUxfSU5URUdFUl9FWFBMSUNJVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgLy8gMGIxMDEwXG4gICdeKD86Wy0rXT8wYlswLTFdKycgK1xuICAvLyAwbzEyM1xuICAnfFstK10/MG9bMC03XSsnICtcbiAgLy8gMHgxQVxuICAnfFstK10/MHhbMC05YS1mQS1GXSsnICtcbiAgLy8gMTIzNDVcbiAgJ3xbLStdP1swLTldKykkJylcblxuZnVuY3Rpb24gcGFyc2VZYW1sSW50ZWdlciAoc291cmNlOiBzdHJpbmcpIHtcbiAgbGV0IHZhbHVlID0gc291cmNlXG4gIGxldCBzaWduID0gMVxuXG4gIGlmICh2YWx1ZVswXSA9PT0gJy0nIHx8IHZhbHVlWzBdID09PSAnKycpIHtcbiAgICBpZiAodmFsdWVbMF0gPT09ICctJykgc2lnbiA9IC0xXG4gICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgxKVxuICB9XG5cbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoJzBiJykpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIDIpXG4gIGlmICh2YWx1ZS5zdGFydHNXaXRoKCcwbycpKSByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCA4KVxuICBpZiAodmFsdWUuc3RhcnRzV2l0aCgnMHgnKSkgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgMTYpXG5cbiAgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZSwgMTApXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sSW50ZWdlciAoc291cmNlOiBzdHJpbmcsIGlzRXhwbGljaXQ6IGJvb2xlYW4pIHtcbiAgaWYgKGlzRXhwbGljaXQpIHtcbiAgICBpZiAoIVlBTUxfSU5URUdFUl9FWFBMSUNJVF9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICB9IGVsc2UgaWYgKCFZQU1MX0lOVEVHRVJfSU1QTElDSVRfUEFUVEVSTi50ZXN0KHNvdXJjZSkpIHtcbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH1cblxuICBjb25zdCByZXN1bHQgPSBwYXJzZVlhbWxJbnRlZ2VyKHNvdXJjZSlcbiAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZShyZXN1bHQpID8gcmVzdWx0IDogTk9UX1JFU09MVkVEXG59XG5cbmNvbnN0IGludEpzb25UYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsIHtcbiAgaW1wbGljaXQ6IHRydWUsXG4gIC8vIFN1cGVyc2V0IG9mIHNvdXJjZS5jaGFyQXQoMCkgb3ZlciBhbGwgbWF0Y2hlZCBpbnB1dHM6IG9wdGlvbmFsICctJyBvciBkaWdpdC5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJy0nLCAuLi4nMDEyMzQ1Njc4OSddLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbEludGVnZXIsXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PlxuICAgIC8vIE5vIGFuY2llbnQgYm94ZWQgbnVtYmVycyBzdXBwb3J0XG4gICAgTnVtYmVyLmlzSW50ZWdlcihvYmplY3QpICYmXG4gICAgLy8gTmVnYXRpdmUgemVybyA9PiAhIWZsb2F0XG4gICAgIU9iamVjdC5pcyhvYmplY3QsIC0wKSAmJlxuICAgIC8vIEV4cG9uZW50aWFsIGZvcm0gPT4gISFmbG9hdCwgcm91bmQtdHJpcCBmb3IgISFpbnQgMWUyMSB3aWxsIGJlIGJyb2tlblxuICAgIG9iamVjdC50b1N0cmluZygxMCkuaW5kZXhPZignZScpIDwgMCxcbiAgcmVwcmVzZW50OiAob2JqZWN0OiBudW1iZXIpID0+IG9iamVjdC50b1N0cmluZygxMClcbn0pXG5cbmV4cG9ydCB7IGludEpzb25UYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZywgTk9UX1JFU09MVkVEIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG5jb25zdCBZQU1MX0lOVEVHRVJfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gIC8vIDBiMTAxMFxuICAnXig/OlstK10/MGJbMC0xX10rJyArXG4gIC8vIDAxMjNcbiAgJ3xbLStdPzBbMC03X10rJyArXG4gIC8vIDB4MUFcbiAgJ3xbLStdPzB4WzAtOWEtZkEtRl9dKycgK1xuICAvLyAxOjIzXG4gICd8Wy0rXT9bMC05XVswLTlfXSooPzo6WzAtNV0/WzAtOV0pKycgK1xuICAvLyAxMjM0NVxuICAnfFstK10/KD86MHxbMS05XVswLTlfXSopKSQnKVxuXG5mdW5jdGlvbiBwYXJzZVlhbWxJbnRlZ2VyIChzb3VyY2U6IHN0cmluZykge1xuICBsZXQgdmFsdWUgPSBzb3VyY2UucmVwbGFjZSgvXy9nLCAnJylcbiAgbGV0IHNpZ24gPSAxXG5cbiAgaWYgKHZhbHVlWzBdID09PSAnLScgfHwgdmFsdWVbMF0gPT09ICcrJykge1xuICAgIGlmICh2YWx1ZVswXSA9PT0gJy0nKSBzaWduID0gLTFcbiAgICB2YWx1ZSA9IHZhbHVlLnNsaWNlKDEpXG4gIH1cblxuICBpZiAodmFsdWUuc3RhcnRzV2l0aCgnMGInKSkgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgMilcbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoJzB4JykpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIDE2KVxuXG4gIGlmICh2YWx1ZS5pbmNsdWRlcygnOicpKSB7XG4gICAgbGV0IHJlc3VsdCA9IDBcbiAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdmFsdWUuc3BsaXQoJzonKSkgcmVzdWx0ID0gcmVzdWx0ICogNjAgKyBOdW1iZXIocGFydClcbiAgICByZXR1cm4gc2lnbiAqIHJlc3VsdFxuICB9XG5cbiAgaWYgKHZhbHVlICE9PSAnMCcgJiYgdmFsdWVbMF0gPT09ICcwJykgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZSwgOClcblxuICByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLCAxMClcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxJbnRlZ2VyIChzb3VyY2U6IHN0cmluZykge1xuICBpZiAoIVlBTUxfSU5URUdFUl9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuXG4gIGNvbnN0IHJlc3VsdCA9IHBhcnNlWWFtbEludGVnZXIoc291cmNlKVxuICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHJlc3VsdCkgPyByZXN1bHQgOiBOT1RfUkVTT0xWRURcbn1cblxuY29uc3QgaW50WWFtbDExVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBTdXBlcnNldCBvZiBzb3VyY2UuY2hhckF0KDApIG92ZXIgYWxsIG1hdGNoZWQgaW5wdXRzOiBvcHRpb25hbCBzaWduICsgZGVjaW1hbCBkaWdpdC5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJy0nLCAnKycsIC4uLicwMTIzNDU2Nzg5J10sXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sSW50ZWdlcixcbiAgaWRlbnRpZnk6IChvYmplY3QpID0+XG4gICAgLy8gTm8gYW5jaWVudCBib3hlZCBudW1iZXJzIHN1cHBvcnRcbiAgICBOdW1iZXIuaXNJbnRlZ2VyKG9iamVjdCkgJiZcbiAgICAvLyBOZWdhdGl2ZSB6ZXJvID0+ICEhZmxvYXRcbiAgICAhT2JqZWN0LmlzKG9iamVjdCwgLTApICYmXG4gICAgLy8gRXhwb25lbnRpYWwgZm9ybSA9PiAhIWZsb2F0LCByb3VuZC10cmlwIGZvciAhIWludCAxZTIxIHdpbGwgYmUgYnJva2VuXG4gICAgb2JqZWN0LnRvU3RyaW5nKDEwKS5pbmRleE9mKCdlJykgPCAwLFxuICByZXByZXNlbnQ6IChvYmplY3Q6IG51bWJlcikgPT4gb2JqZWN0LnRvU3RyaW5nKDEwKVxufSlcblxuZXhwb3J0IHsgaW50WWFtbDExVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgWUFNTF9GTE9BVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgLy8gMi41ZTQsIDIuNSBhbmQgaW50ZWdlcnNcbiAgJ14oPzpbLStdP1swLTldKyg/OlxcXFwuWzAtOV0qKT8oPzpbZUVdWy0rXT9bMC05XSspPycgK1xuICAvLyAuMmU0LCAuMlxuICAnfFstK10/XFxcXC5bMC05XSsoPzpbZUVdWy0rXT9bMC05XSspPycgK1xuICAvLyAuaW5mXG4gICd8Wy0rXT9cXFxcLig/OmluZnxJbmZ8SU5GKScgK1xuICAvLyAubmFuXG4gICd8XFxcXC4oPzpuYW58TmFOfE5BTikpJCcpXG5cbmNvbnN0IFlBTUxfRkxPQVRfU1BFQ0lBTF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgJ14oPzonICtcbiAgLy8gLmluZlxuICAnWy0rXT9cXFxcLig/OmluZnxJbmZ8SU5GKScgK1xuICAvLyAubmFuXG4gICd8XFxcXC4oPzpuYW58TmFOfE5BTikpJCcpXG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sRmxvYXQgKHNvdXJjZTogc3RyaW5nKSB7XG4gIGlmICghWUFNTF9GTE9BVF9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuXG4gIGxldCB2YWx1ZSA9IHNvdXJjZS50b0xvd2VyQ2FzZSgpXG4gIGNvbnN0IHNpZ24gPSB2YWx1ZVswXSA9PT0gJy0nID8gLTEgOiAxXG5cbiAgaWYgKCcrLScuaW5jbHVkZXModmFsdWVbMF0pKSB2YWx1ZSA9IHZhbHVlLnNsaWNlKDEpXG5cbiAgaWYgKHZhbHVlID09PSAnLmluZicpIHJldHVybiBzaWduID09PSAxID8gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZIDogTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZXG4gIGlmICh2YWx1ZSA9PT0gJy5uYW4nKSByZXR1cm4gTmFOXG5cbiAgY29uc3QgcmVzdWx0ID0gc2lnbiAqIHBhcnNlRmxvYXQodmFsdWUpXG5cbiAgaWYgKE51bWJlci5pc0Zpbml0ZShyZXN1bHQpIHx8IFlBTUxfRkxPQVRfU1BFQ0lBTF9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIHJlc3VsdFxuICByZXR1cm4gTk9UX1JFU09MVkVEXG59XG5cbmZ1bmN0aW9uIHJlcHJlc2VudFlhbWxGbG9hdCAob2JqZWN0OiBudW1iZXIpIHtcbiAgaWYgKGlzTmFOKG9iamVjdCkpIHJldHVybiAnLm5hbidcbiAgaWYgKG9iamVjdCA9PT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSByZXR1cm4gJy5pbmYnXG4gIGlmIChvYmplY3QgPT09IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSkgcmV0dXJuICctLmluZidcbiAgaWYgKE9iamVjdC5pcyhvYmplY3QsIC0wKSkgcmV0dXJuICctMC4wJ1xuXG4gIGNvbnN0IHJlc3VsdCA9IG9iamVjdC50b1N0cmluZygxMClcbiAgcmV0dXJuIC9eWy0rXT9bMC05XStlLy50ZXN0KHJlc3VsdCkgPyByZXN1bHQucmVwbGFjZSgnZScsICcuZScpIDogcmVzdWx0XG59XG5cbmNvbnN0IGZsb2F0Q29yZVRhZyA9IGRlZmluZVNjYWxhclRhZygndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBTdXBlcnNldCBvZiBzb3VyY2UuY2hhckF0KDApIG92ZXIgYWxsIG1hdGNoZWQgaW5wdXRzOiBvcHRpb25hbCBzaWduLCAnLicsIG9yIGRpZ2l0XG4gIC8vICgnLmluZicvJy5uYW4nIHN0YXJ0IHdpdGggJy4nKS5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJy0nLCAnKycsICcuJywgLi4uJzAxMjM0NTY3ODknXSxcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxGbG9hdCxcbiAgaWRlbnRpZnk6IChvYmplY3QpID0+XG4gICAgLy8gTm8gYW5jaWVudCBib3hlZCBudW1iZXJzIHN1cHBvcnRcbiAgICB0eXBlb2Ygb2JqZWN0ID09PSAnbnVtYmVyJyAmJlxuICAgIChcbiAgICAgIC8vIFdlIGxhbmQgaGVyZSBhbGwgbnVtYmVycywgbm90IGhhbmRsZWQgKGRlY2xpbmVkKSBieSAhIWludCBgLmlkZW50aWZ5YFxuICAgICAgLy8gVGhlIHNhbWUgY29uZGl0aW9uIGFzIGZvciAhIWludCwgYnV0IHJldmVyc2VkLlxuXG4gICAgICAvLyBGaWx0ZXIgb3V0IGludGVnZXJzLi4uXG4gICAgICAhTnVtYmVyLmlzSW50ZWdlcihvYmplY3QpIHx8XG4gICAgICAvLyBidXQgYWxsb3cgbmVnYXRpdmUgemVyb1xuICAgICAgT2JqZWN0LmlzKG9iamVjdCwgLTApIHx8XG4gICAgICAvLyBhbmQgaW50ZWdlcnMgd2l0aCBleHBvbmVudGlhbCBmb3JtXG4gICAgICBvYmplY3QudG9TdHJpbmcoMTApLmluZGV4T2YoJ2UnKSA+PSAwXG4gICAgKSxcbiAgcmVwcmVzZW50OiByZXByZXNlbnRZYW1sRmxvYXRcbn0pXG5cbmV4cG9ydCB7IGZsb2F0Q29yZVRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbi8vIFlBTUwgMS4yIEpTT04gc2NoZW1hIGltcGxpY2l0IHJlc29sdXRpb246XG4vLyAtPyAoIDAgfCBbMS05XSBbMC05XSogKSAoIFxcLiBbMC05XSogKT8gKCBbZUVdIFstK10/IFswLTldKyApP1xuY29uc3QgWUFNTF9GTE9BVF9JTVBMSUNJVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgLy8gMi41ZTQsIDIuNSBhbmQgaW50ZWdlcnNcbiAgJ14tPyg/OjB8WzEtOV1bMC05XSopKD86XFxcXC5bMC05XSopPyg/OltlRV1bLStdP1swLTldKyk/JCcpXG5cbi8vIEV4cGxpY2l0IGAhIWZsb2F0YCB2YWxpZGF0aW9uIGlzIHNlcGFyYXRlIGZyb20gSlNPTiBpbXBsaWNpdCByZXNvbHV0aW9uLlxuY29uc3QgWUFNTF9GTE9BVF9FWFBMSUNJVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgLy8gMi41ZTQsIDIuNSBhbmQgaW50ZWdlcnNcbiAgJ14oPzpbLStdP1swLTldKyg/OlxcXFwuWzAtOV0qKT8oPzpbZUVdWy0rXT9bMC05XSspPycgK1xuICAvLyAuMmU0LCAuMlxuICAnfFstK10/XFxcXC5bMC05XSsoPzpbZUVdWy0rXT9bMC05XSspPycgK1xuICAvLyAuaW5mXG4gICd8Wy0rXT9cXFxcLig/OmluZnxJbmZ8SU5GKScgK1xuICAvLyAubmFuXG4gICd8XFxcXC4oPzpuYW58TmFOfE5BTikpJCcpXG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sRmxvYXQgKHNvdXJjZTogc3RyaW5nLCBpc0V4cGxpY2l0OiBib29sZWFuKSB7XG4gIGlmIChpc0V4cGxpY2l0KSB7XG4gICAgaWYgKCFZQU1MX0ZMT0FUX0VYUExJQ0lUX1BBVFRFUk4udGVzdChzb3VyY2UpKSByZXR1cm4gTk9UX1JFU09MVkVEXG5cbiAgICBsZXQgdmFsdWUgPSBzb3VyY2UudG9Mb3dlckNhc2UoKVxuICAgIGNvbnN0IHNpZ24gPSB2YWx1ZVswXSA9PT0gJy0nID8gLTEgOiAxXG5cbiAgICBpZiAoJystJy5pbmNsdWRlcyh2YWx1ZVswXSkpIHZhbHVlID0gdmFsdWUuc2xpY2UoMSlcblxuICAgIGlmICh2YWx1ZSA9PT0gJy5pbmYnKSByZXR1cm4gc2lnbiA9PT0gMSA/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA6IE51bWJlci5ORUdBVElWRV9JTkZJTklUWVxuICAgIGlmICh2YWx1ZSA9PT0gJy5uYW4nKSByZXR1cm4gTmFOXG5cbiAgICBjb25zdCByZXN1bHQgPSBzaWduICogcGFyc2VGbG9hdCh2YWx1ZSlcbiAgICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHJlc3VsdCkgPyByZXN1bHQgOiBOT1RfUkVTT0xWRURcbiAgfVxuXG4gIGlmICghWUFNTF9GTE9BVF9JTVBMSUNJVF9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuXG4gIGNvbnN0IHJlc3VsdCA9IE51bWJlcihzb3VyY2UpXG5cbiAgaWYgKE51bWJlci5pc0Zpbml0ZShyZXN1bHQpKSByZXR1cm4gcmVzdWx0XG4gIHJldHVybiBOT1RfUkVTT0xWRURcbn1cblxuZnVuY3Rpb24gcmVwcmVzZW50WWFtbEZsb2F0IChvYmplY3Q6IG51bWJlcikge1xuICBpZiAoaXNOYU4ob2JqZWN0KSkgcmV0dXJuICcubmFuJ1xuICBpZiAob2JqZWN0ID09PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpIHJldHVybiAnLmluZidcbiAgaWYgKG9iamVjdCA9PT0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKSByZXR1cm4gJy0uaW5mJ1xuICBpZiAoT2JqZWN0LmlzKG9iamVjdCwgLTApKSByZXR1cm4gJy0wLjAnXG5cbiAgY29uc3QgcmVzdWx0ID0gb2JqZWN0LnRvU3RyaW5nKDEwKVxuICByZXR1cm4gL15bLStdP1swLTldK2UvLnRlc3QocmVzdWx0KSA/IHJlc3VsdC5yZXBsYWNlKCdlJywgJy5lJykgOiByZXN1bHRcbn1cblxuY29uc3QgZmxvYXRKc29uVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsIHtcbiAgaW1wbGljaXQ6IHRydWUsXG4gIC8vIFN1cGVyc2V0IG9mIHNvdXJjZS5jaGFyQXQoMCkgb3ZlciBhbGwgbWF0Y2hlZCBpbnB1dHM6IG9wdGlvbmFsICctJyBvciBkaWdpdC5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJy0nLCAuLi4nMDEyMzQ1Njc4OSddLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbEZsb2F0LFxuICBpZGVudGlmeTogKG9iamVjdCkgPT5cbiAgICAvLyBObyBhbmNpZW50IGJveGVkIG51bWJlcnMgc3VwcG9ydFxuICAgIHR5cGVvZiBvYmplY3QgPT09ICdudW1iZXInICYmXG4gICAgKFxuICAgICAgLy8gV2UgbGFuZCBoZXJlIGFsbCBudW1iZXJzLCBub3QgaGFuZGxlZCAoZGVjbGluZWQpIGJ5ICEhaW50IGAuaWRlbnRpZnlgXG4gICAgICAvLyBUaGUgc2FtZSBjb25kaXRpb24gYXMgZm9yICEhaW50LCBidXQgcmV2ZXJzZWQuXG5cbiAgICAgIC8vIEZpbHRlciBvdXQgaW50ZWdlcnMuLi5cbiAgICAgICFOdW1iZXIuaXNJbnRlZ2VyKG9iamVjdCkgfHxcbiAgICAgIC8vIGJ1dCBhbGxvdyBuZWdhdGl2ZSB6ZXJvXG4gICAgICBPYmplY3QuaXMob2JqZWN0LCAtMCkgfHxcbiAgICAgIC8vIGFuZCBpbnRlZ2VycyB3aXRoIGV4cG9uZW50aWFsIGZvcm1cbiAgICAgIG9iamVjdC50b1N0cmluZygxMCkuaW5kZXhPZignZScpID49IDBcbiAgICApLFxuICByZXByZXNlbnQ6IHJlcHJlc2VudFlhbWxGbG9hdFxufSlcblxuZXhwb3J0IHsgZmxvYXRKc29uVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgWUFNTF9GTE9BVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgLy8gMi41ZTQsIDIuNSBhbmQgaW50ZWdlcnNcbiAgJ14oPzpbLStdPyg/Oig/OlswLTldWzAtOV9dKik/XFxcXC5bMC05X10qKSg/OltlRV1bLStdWzAtOV0rKT8nICtcbiAgLy8gMTkwOjIwOjMwLjE1XG4gICd8Wy0rXT9bMC05XVswLTlfXSooPzo6WzAtNV0/WzAtOV0pK1xcXFwuWzAtOV9dKicgK1xuICAvLyAuaW5mXG4gICd8Wy0rXT9cXFxcLig/OmluZnxJbmZ8SU5GKScgK1xuICAvLyAubmFuXG4gICd8XFxcXC4oPzpuYW58TmFOfE5BTikpJCcpXG5cbmNvbnN0IFlBTUxfRkxPQVRfU1BFQ0lBTF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgJ14oPzonICtcbiAgLy8gLmluZlxuICAnWy0rXT9cXFxcLig/OmluZnxJbmZ8SU5GKScgK1xuICAvLyAubmFuXG4gICd8XFxcXC4oPzpuYW58TmFOfE5BTikpJCcpXG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sRmxvYXQgKHNvdXJjZTogc3RyaW5nKSB7XG4gIGlmICghWUFNTF9GTE9BVF9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuXG4gIGxldCB2YWx1ZSA9IHNvdXJjZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL18vZywgJycpXG4gIGNvbnN0IHNpZ24gPSB2YWx1ZVswXSA9PT0gJy0nID8gLTEgOiAxXG5cbiAgaWYgKCcrLScuaW5jbHVkZXModmFsdWVbMF0pKSB2YWx1ZSA9IHZhbHVlLnNsaWNlKDEpXG5cbiAgaWYgKHZhbHVlID09PSAnLmluZicpIHJldHVybiBzaWduID09PSAxID8gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZIDogTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZXG4gIGlmICh2YWx1ZSA9PT0gJy5uYW4nKSByZXR1cm4gTmFOXG5cbiAgbGV0IHJlc3VsdCA9IDBcblxuICBpZiAodmFsdWUuaW5jbHVkZXMoJzonKSkge1xuICAgIGZvciAoY29uc3QgcGFydCBvZiB2YWx1ZS5zcGxpdCgnOicpKSByZXN1bHQgPSByZXN1bHQgKiA2MCArIE51bWJlcihwYXJ0KVxuICAgIHJlc3VsdCAqPSBzaWduXG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gc2lnbiAqIHBhcnNlRmxvYXQodmFsdWUpXG4gIH1cblxuICBpZiAoTnVtYmVyLmlzRmluaXRlKHJlc3VsdCkgfHwgWUFNTF9GTE9BVF9TUEVDSUFMX1BBVFRFUk4udGVzdChzb3VyY2UpKSByZXR1cm4gcmVzdWx0XG4gIHJldHVybiBOT1RfUkVTT0xWRURcbn1cblxuZnVuY3Rpb24gcmVwcmVzZW50WWFtbEZsb2F0IChvYmplY3Q6IG51bWJlcikge1xuICBpZiAoaXNOYU4ob2JqZWN0KSkgcmV0dXJuICcubmFuJ1xuICBpZiAob2JqZWN0ID09PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpIHJldHVybiAnLmluZidcbiAgaWYgKG9iamVjdCA9PT0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKSByZXR1cm4gJy0uaW5mJ1xuICBpZiAoT2JqZWN0LmlzKG9iamVjdCwgLTApKSByZXR1cm4gJy0wLjAnXG5cbiAgY29uc3QgcmVzdWx0ID0gb2JqZWN0LnRvU3RyaW5nKDEwKVxuICByZXR1cm4gL15bLStdP1swLTldK2UvLnRlc3QocmVzdWx0KSA/IHJlc3VsdC5yZXBsYWNlKCdlJywgJy5lJykgOiByZXN1bHRcbn1cblxuY29uc3QgZmxvYXRZYW1sMTFUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0Jywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0czogb3B0aW9uYWwgc2lnbiwgJy4nLCBvciBkaWdpdFxuICAvLyAoJy5pbmYnLycubmFuJyBzdGFydCB3aXRoICcuJykuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWyctJywgJysnLCAnLicsIC4uLicwMTIzNDU2Nzg5J10sXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sRmxvYXQsXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PlxuICAgIC8vIE5vIGFuY2llbnQgYm94ZWQgbnVtYmVycyBzdXBwb3J0XG4gICAgdHlwZW9mIG9iamVjdCA9PT0gJ251bWJlcicgJiZcbiAgICAoXG4gICAgICAvLyBXZSBsYW5kIGhlcmUgYWxsIG51bWJlcnMsIG5vdCBoYW5kbGVkIChkZWNsaW5lZCkgYnkgISFpbnQgYC5pZGVudGlmeWBcbiAgICAgIC8vIFRoZSBzYW1lIGNvbmRpdGlvbiBhcyBmb3IgISFpbnQsIGJ1dCByZXZlcnNlZC5cblxuICAgICAgLy8gRmlsdGVyIG91dCBpbnRlZ2Vycy4uLlxuICAgICAgIU51bWJlci5pc0ludGVnZXIob2JqZWN0KSB8fFxuICAgICAgLy8gYnV0IGFsbG93IG5lZ2F0aXZlIHplcm9cbiAgICAgIE9iamVjdC5pcyhvYmplY3QsIC0wKSB8fFxuICAgICAgLy8gYW5kIGludGVnZXJzIHdpdGggZXhwb25lbnRpYWwgZm9ybVxuICAgICAgb2JqZWN0LnRvU3RyaW5nKDEwKS5pbmRleE9mKCdlJykgPj0gMFxuICAgICksXG4gIHJlcHJlc2VudDogcmVwcmVzZW50WWFtbEZsb2F0XG59KVxuXG5leHBvcnQgeyBmbG9hdFlhbWwxMVRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBNRVJHRV9LRVksIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgbWVyZ2VUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOm1lcmdlJywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gc291cmNlLmNoYXJBdCgwKSBvdmVyIG1hdGNoZWQgaW1wbGljaXQgaW5wdXRzOiAnPCcgKCc8PCcpLlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IFsnPCddLFxuICByZXNvbHZlOiAoc291cmNlLCBpc0V4cGxpY2l0KSA9PiB7XG4gICAgaWYgKHNvdXJjZSA9PT0gJzw8JyB8fCAoaXNFeHBsaWNpdCAmJiBzb3VyY2UgPT09ICcnKSkgcmV0dXJuIE1FUkdFX0tFWVxuICAgIHJldHVybiBOT1RfUkVTT0xWRURcbiAgfVxufSlcblxuZXhwb3J0IHsgbWVyZ2VUYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZywgTk9UX1JFU09MVkVEIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG5jb25zdCBCQVNFNjRfUEFUVEVSTiA9IC9eW0EtWmEtejAtOSsvXSo9ezAsMn0kL1xuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEJpbmFyeSAoc291cmNlOiBzdHJpbmcpIHtcbiAgLy8gU3RyaXAgYWxsb3dlZCB3aGl0ZXNwYWNlIGZpcnN0LCBzbyB2YWxpZGF0aW9uIHN0YXlzIGEgcGxhaW4gYmFzZTY0IGNoZWNrLlxuICBjb25zdCBpbnB1dCA9IHNvdXJjZS5yZXBsYWNlKC9cXHMvZywgJycpXG4gIGlmIChpbnB1dC5sZW5ndGggJSA0ICE9PSAwIHx8ICFCQVNFNjRfUEFUVEVSTi50ZXN0KGlucHV0KSkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuXG4gIGNvbnN0IGJpbmFyeSA9IGF0b2IoaW5wdXQpXG4gIGNvbnN0IHJlc3VsdCA9IG5ldyBVaW50OEFycmF5KGJpbmFyeS5sZW5ndGgpXG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBiaW5hcnkubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGJpbmFyeS5jaGFyQ29kZUF0KGluZGV4KVxuICB9XG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gcmVwcmVzZW50WWFtbEJpbmFyeSAob2JqZWN0OiBVaW50OEFycmF5KSB7XG4gIGxldCBiaW5hcnkgPSAnJ1xuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgb2JqZWN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKG9iamVjdFtpbmRleF0pXG4gIH1cbiAgcmV0dXJuIGJ0b2EoYmluYXJ5KVxufVxuXG5jb25zdCBiaW5hcnlUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOmJpbmFyeScsIHtcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxCaW5hcnksXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICByZXByZXNlbnQ6IHJlcHJlc2VudFlhbWxCaW5hcnlcbn0pXG5cbmV4cG9ydCB7IGJpbmFyeVRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IFlBTUxfREFURV9SRUdFWFAgPSBuZXcgUmVnRXhwKFxuICAnXihbMC05XVswLTldWzAtOV1bMC05XSktKFswLTldWzAtOV0pLShbMC05XVswLTldKSQnKVxuXG5jb25zdCBZQU1MX1RJTUVTVEFNUF9SRUdFWFAgPSBuZXcgUmVnRXhwKFxuICAnXihbMC05XVswLTldWzAtOV1bMC05XSknICtcbiAgJy0oWzAtOV1bMC05XT8pJyArXG4gICctKFswLTldWzAtOV0/KScgK1xuICAnKD86W1R0XXxbIFxcXFx0XSspJyArXG4gICcoWzAtOV1bMC05XT8pJyArXG4gICc6KFswLTldWzAtOV0pJyArXG4gICc6KFswLTldWzAtOV0pJyArXG4gICcoPzpcXFxcLihbMC05XSopKT8nICtcbiAgJyg/OlsgXFxcXHRdKihafChbLStdKShbMC05XVswLTldPyknICtcbiAgJyg/OjooWzAtOV1bMC05XSkpPykpPyQnKVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbFRpbWVzdGFtcCAoc291cmNlOiBzdHJpbmcpIHtcbiAgbGV0IG1hdGNoID0gWUFNTF9EQVRFX1JFR0VYUC5leGVjKHNvdXJjZSlcbiAgaWYgKG1hdGNoID09PSBudWxsKSBtYXRjaCA9IFlBTUxfVElNRVNUQU1QX1JFR0VYUC5leGVjKHNvdXJjZSlcbiAgaWYgKG1hdGNoID09PSBudWxsKSByZXR1cm4gTk9UX1JFU09MVkVEXG5cbiAgY29uc3QgeWVhciA9ICsobWF0Y2hbMV0pXG4gIGNvbnN0IG1vbnRoID0gKyhtYXRjaFsyXSkgLSAxXG4gIGNvbnN0IGRheSA9ICsobWF0Y2hbM10pXG5cbiAgLy8gRGF0ZS1vbmx5IGZvcm0gKGBZWVlZLU1NLUREYCkgaGFzIG5vIHRpbWUgY2FwdHVyZXMuXG4gIGlmICghbWF0Y2hbNF0pIHtcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoRGF0ZS5VVEMoeWVhciwgbW9udGgsIGRheSkpXG4gICAgLy8gUmVqZWN0IGRhdGVzIHRoYXQgSlMgd291bGQgbm9ybWFsaXplLCBlLmcuIDIwMjMtMDItMjkgLT4gMjAyMy0wMy0wMS5cbiAgICBpZiAoZGF0ZS5nZXRVVENGdWxsWWVhcigpICE9PSB5ZWFyIHx8IGRhdGUuZ2V0VVRDTW9udGgoKSAhPT0gbW9udGggfHwgZGF0ZS5nZXRVVENEYXRlKCkgIT09IGRheSkge1xuICAgICAgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICAgIH1cbiAgICByZXR1cm4gZGF0ZVxuICB9XG5cbiAgY29uc3QgaG91ciA9ICsobWF0Y2hbNF0pXG4gIGNvbnN0IG1pbnV0ZSA9ICsobWF0Y2hbNV0pXG4gIGNvbnN0IHNlY29uZCA9ICsobWF0Y2hbNl0pXG4gIGxldCBmcmFjdGlvbiA9IDBcblxuICAvLyBSZWplY3QgdGltZXMgdGhhdCBKUyB3b3VsZCBub3JtYWxpemUgaW50byB0aGUgbmV4dCBtaW51dGUvaG91ci9kYXkuXG4gIGlmIChob3VyID4gMjMgfHwgbWludXRlID4gNTkgfHwgc2Vjb25kID4gNTkpIHJldHVybiBOT1RfUkVTT0xWRURcblxuICBpZiAobWF0Y2hbN10pIHtcbiAgICBsZXQgdmFsdWUgPSBtYXRjaFs3XS5zbGljZSgwLCAzKVxuICAgIHdoaWxlICh2YWx1ZS5sZW5ndGggPCAzKSB2YWx1ZSArPSAnMCdcbiAgICBmcmFjdGlvbiA9ICt2YWx1ZVxuICB9XG5cbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBmcmFjdGlvbikpXG5cbiAgLy8gUmVqZWN0IGludmFsaWQgY2FsZW5kYXIgZGF0ZXMgYmVmb3JlIGFwcGx5aW5nIHRpbWV6b25lIG9mZnNldC5cbiAgaWYgKGRhdGUuZ2V0VVRDRnVsbFllYXIoKSAhPT0geWVhciB8fCBkYXRlLmdldFVUQ01vbnRoKCkgIT09IG1vbnRoIHx8IGRhdGUuZ2V0VVRDRGF0ZSgpICE9PSBkYXkpIHtcbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH1cblxuICBpZiAobWF0Y2hbOV0pIHtcbiAgICBjb25zdCBvZmZzZXRIb3VyID0gKyhtYXRjaFsxMF0pXG4gICAgY29uc3Qgb2Zmc2V0TWludXRlID0gKyhtYXRjaFsxMV0gfHwgMClcbiAgICAvLyBSZWplY3QgdGltZXpvbmUgb2Zmc2V0cyB0aGF0IEpTIGRhdGUgYXJpdGhtZXRpYyB3b3VsZCBvdGhlcndpc2UgYWNjZXB0LlxuICAgIGlmIChvZmZzZXRIb3VyID4gMjMgfHwgb2Zmc2V0TWludXRlID4gNTkpIHJldHVybiBOT1RfUkVTT0xWRURcblxuICAgIGNvbnN0IG9mZnNldCA9IChvZmZzZXRIb3VyICogNjAgKyBvZmZzZXRNaW51dGUpICogNjAwMDBcbiAgICBkYXRlLnNldFRpbWUoZGF0ZS5nZXRUaW1lKCkgLSAobWF0Y2hbOV0gPT09ICctJyA/IC1vZmZzZXQgOiBvZmZzZXQpKVxuICB9XG5cbiAgcmV0dXJuIGRhdGVcbn1cblxuY29uc3QgdGltZXN0YW1wVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjp0aW1lc3RhbXAnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBCb3RoIHBhdHRlcm5zIHN0YXJ0IHdpdGggYSA0LWRpZ2l0IHllYXIsIHNvIHNvdXJjZS5jaGFyQXQoMCkgaXMgYWx3YXlzIGEgZGlnaXQuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWy4uLicwMTIzNDU2Nzg5J10sXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sVGltZXN0YW1wLFxuICBpZGVudGlmeTogKG9iamVjdCkgPT4gb2JqZWN0IGluc3RhbmNlb2YgRGF0ZSxcbiAgcmVwcmVzZW50OiAob2JqZWN0OiBEYXRlKSA9PiBvYmplY3QudG9JU09TdHJpbmcoKVxufSlcblxuZXhwb3J0IHsgdGltZXN0YW1wVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTZXF1ZW5jZVRhZyB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3Qgc2VxVGFnID0gZGVmaW5lU2VxdWVuY2VUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOnNlcScsIHtcbiAgY3JlYXRlOiAoKSA9PiBbXSBhcyB1bmtub3duW10sXG4gIGFkZEl0ZW06IChjb250YWluZXIsIGl0ZW0pID0+IHtcbiAgICBjb250YWluZXIucHVzaChpdGVtKVxuICB9LFxuICBpZGVudGlmeTogQXJyYXkuaXNBcnJheVxufSlcblxuZXhwb3J0IHsgc2VxVGFnIH1cbiIsICJmdW5jdGlvbiBpc1BsYWluT2JqZWN0IChkYXRhOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGlmIChkYXRhID09PSBudWxsIHx8IHR5cGVvZiBkYXRhICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KGRhdGEpKSByZXR1cm4gZmFsc2VcbiAgY29uc3QgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGRhdGEpXG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlXG59XG5cbi8vIFByb2plY3QgYG9iamVjdGAgb250byBga2V5c2AuIEFic2VudCBrZXlzIGFyZSBza2lwcGVkIChzbyB0aGUgcmVzdWx0IGNhbiBiZVxuLy8gc2FmZWx5IHNwcmVhZCBvdmVyIGRlZmF1bHRzIHdpdGhvdXQgY2xvYmJlcmluZyB0aGVtIHdpdGggYHVuZGVmaW5lZGApLCBoZW5jZVxuLy8gdGhlIGBQYXJ0aWFsYCByZXR1cm4uXG5mdW5jdGlvbiBwaWNrPFQgZXh0ZW5kcyBvYmplY3QsIEsgZXh0ZW5kcyBrZXlvZiBUPiAob2JqZWN0OiBULCBrZXlzOiByZWFkb25seSBLW10pOiBQYXJ0aWFsPFBpY2s8VCwgSz4+IHtcbiAgY29uc3QgcmVzdWx0OiBQYXJ0aWFsPFBpY2s8VCwgSz4+ID0ge31cbiAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgIGlmIChvYmplY3Rba2V5XSAhPT0gdW5kZWZpbmVkKSByZXN1bHRba2V5XSA9IG9iamVjdFtrZXldXG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5leHBvcnQge1xuICBpc1BsYWluT2JqZWN0LFxuICBwaWNrXG59XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2VxdWVuY2VUYWcgfSBmcm9tICcuLi8uLi90YWcudHMnXG5pbXBvcnQgeyBpc1BsYWluT2JqZWN0IH0gZnJvbSAnLi4vLi4vY29tbW9uL29iamVjdC50cydcblxuaW50ZXJmYWNlIE9tYXBDYXJyaWVyIHtcbiAgbGlzdDogdW5rbm93bltdXG4gIHNlZW46IFNldDx1bmtub3duPlxufVxuXG5jb25zdCBvbWFwVGFnID0gZGVmaW5lU2VxdWVuY2VUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOm9tYXAnLCB7XG4gIGNyZWF0ZTogKCk6IE9tYXBDYXJyaWVyID0+ICh7IGxpc3Q6IFtdLCBzZWVuOiBuZXcgU2V0KCkgfSksXG4gIGFkZEl0ZW06IChjYXJyaWVyLCBpdGVtKSA9PiB7XG4gICAgbGV0IGtleTogdW5rbm93blxuXG4gICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgIGlmIChpdGVtLnNpemUgIT09IDEpIHJldHVybiAnY2Fubm90IHJlc29sdmUgYW4gb3JkZXJlZCBtYXAgaXRlbSdcbiAgICAgIGtleSA9IGl0ZW0ua2V5cygpLm5leHQoKS52YWx1ZVxuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdChpdGVtKSkge1xuICAgICAgY29uc3QgaXRlbUtleXMgPSBPYmplY3Qua2V5cyhpdGVtIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVxuICAgICAgaWYgKGl0ZW1LZXlzLmxlbmd0aCAhPT0gMSkgcmV0dXJuICdjYW5ub3QgcmVzb2x2ZSBhbiBvcmRlcmVkIG1hcCBpdGVtJ1xuICAgICAga2V5ID0gaXRlbUtleXNbMF1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdjYW5ub3QgcmVzb2x2ZSBhbiBvcmRlcmVkIG1hcCBpdGVtJ1xuICAgIH1cblxuICAgIGlmIChjYXJyaWVyLnNlZW4uaGFzKGtleSkpIHJldHVybiAnZHVwbGljYXRlIGtleSBpbiBvcmRlcmVkIG1hcCdcbiAgICBjYXJyaWVyLnNlZW4uYWRkKGtleSlcbiAgICBjYXJyaWVyLmxpc3QucHVzaChpdGVtKVxuICAgIHJldHVybiAnJ1xuICB9LFxuICBmaW5hbGl6ZTogKGNhcnJpZXIpOiB1bmtub3duW10gPT4gY2Fycmllci5saXN0XG59KVxuXG5leHBvcnQgeyBvbWFwVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTZXF1ZW5jZVRhZyB9IGZyb20gJy4uLy4uL3RhZy50cydcblxudHlwZSBQYWlyID0gW3Vua25vd24sIHVua25vd25dXG5cbmNvbnN0IHBhaXJzVGFnID0gZGVmaW5lU2VxdWVuY2VUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOnBhaXJzJywge1xuICBjcmVhdGU6ICgpID0+IFtdIGFzIFBhaXJbXSxcbiAgYWRkSXRlbTogKGNvbnRhaW5lciwgaXRlbSkgPT4ge1xuICAgIGlmIChpdGVtIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICBpZiAoaXRlbS5zaXplICE9PSAxKSByZXR1cm4gJ2Nhbm5vdCByZXNvbHZlIGEgcGFpcnMgaXRlbSdcblxuICAgICAgY29udGFpbmVyLnB1c2goaXRlbS5lbnRyaWVzKCkubmV4dCgpLnZhbHVlISlcbiAgICAgIHJldHVybiAnJ1xuICAgIH1cblxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaXRlbSkgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICByZXR1cm4gJ2Nhbm5vdCByZXNvbHZlIGEgcGFpcnMgaXRlbSdcbiAgICB9XG5cbiAgICBjb25zdCBvYmplY3QgPSBpdGVtIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdClcblxuICAgIGlmIChrZXlzLmxlbmd0aCAhPT0gMSkgcmV0dXJuICdjYW5ub3QgcmVzb2x2ZSBhIHBhaXJzIGl0ZW0nXG5cbiAgICBjb250YWluZXIucHVzaChba2V5c1swXSwgb2JqZWN0W2tleXNbMF1dXSBzYXRpc2ZpZXMgUGFpcilcbiAgICByZXR1cm4gJydcbiAgfVxufSlcblxuZXhwb3J0IHsgcGFpcnNUYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZU1hcHBpbmdUYWcgfSBmcm9tICcuLi8uLi90YWcudHMnXG5pbXBvcnQgeyBpc1BsYWluT2JqZWN0IH0gZnJvbSAnLi4vLi4vY29tbW9uL29iamVjdC50cydcblxudHlwZSBTdHJpbmdNYXBwaW5nID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj5cblxuY29uc3QgbWFwVGFnID0gZGVmaW5lTWFwcGluZ1RhZygndGFnOnlhbWwub3JnLDIwMDI6bWFwJywge1xuICBjcmVhdGU6ICgpOiBTdHJpbmdNYXBwaW5nID0+ICh7fSksXG4gIGlkZW50aWZ5OiBpc1BsYWluT2JqZWN0LFxuICAvLyBEdW1wIHNpZGU6IHdyYXAgdGhlIHBsYWluIG9iamVjdCBpbnRvIHRoZSBjYW5vbmljYWwgYE1hcGAgZm9ybSB0aGUgd3JpdGVyXG4gIC8vIHdhbGtzLiBTaGFsbG93IOKAlCBrZXlzL3ZhbHVlcyBzdGF5IHJlZmVyZW5jZXMgdG8gdGhlIG9yaWdpbmFscy5cbiAgcmVwcmVzZW50OiAobzogU3RyaW5nTWFwcGluZykgPT4ge1xuICAgIGNvbnN0IG1hcCA9IG5ldyBNYXA8c3RyaW5nLCB1bmtub3duPigpXG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMobykpIG1hcC5zZXQoa2V5LCBvW2tleV0pXG4gICAgcmV0dXJuIG1hcFxuICB9LFxuICBhZGRQYWlyOiAoY29udGFpbmVyLCBrZXksIHZhbHVlKSA9PiB7XG4gICAgaWYgKGtleSAhPT0gbnVsbCAmJiB0eXBlb2Yga2V5ID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuICdvYmplY3QtYmFzZWQgbWFwIGRvZXMgbm90IHN1cHBvcnQgY29tcGxleCBrZXlzJ1xuICAgIH1cbiAgICBjb25zdCBub3JtYWxpemVkS2V5ID0gU3RyaW5nKGtleSlcbiAgICBpZiAobm9ybWFsaXplZEtleSA9PT0gJ19fcHJvdG9fXycpIHtcbiAgICAgIC8vIERlZmluZSBhcyBhbiBvd24gZGF0YSBwcm9wZXJ0eSBzbyBhIGxpdGVyYWwgYF9fcHJvdG9fX2Aga2V5IHN0YXlzIGRhdGFcbiAgICAgIC8vIGFuZCBuZXZlciBpbnZva2VzIHRoZSBwcm90b3R5cGUgc2V0dGVyLlxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnRhaW5lciwgbm9ybWFsaXplZEtleSwge1xuICAgICAgICB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGFpbmVyW25vcm1hbGl6ZWRLZXldID0gdmFsdWVcbiAgICB9XG4gICAgcmV0dXJuICcnXG4gIH0sXG4gIC8vIGhhc093biwgbm90IGBpbmA6IGEgcGxhaW4gb2JqZWN0IGluaGVyaXRzIGB0b1N0cmluZ2AgYW5kIGZyaWVuZHMuXG4gIGhhczogKGNvbnRhaW5lciwga2V5KSA9PiB7XG4gICAgaWYgKGtleSAhPT0gbnVsbCAmJiB0eXBlb2Yga2V5ID09PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjb250YWluZXIsIFN0cmluZyhrZXkpKVxuICB9LFxuICBrZXlzOiAoY29udGFpbmVyKSA9PiBPYmplY3Qua2V5cyhjb250YWluZXIpLFxuICBnZXQ6IChjb250YWluZXIsIGtleSkgPT4gY29udGFpbmVyW1N0cmluZyhrZXkpXVxufSlcblxuZXhwb3J0IHsgbWFwVGFnLCBpc1BsYWluT2JqZWN0LCB0eXBlIFN0cmluZ01hcHBpbmcgfVxuIiwgImltcG9ydCB7IGRlZmluZU1hcHBpbmdUYWcgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IHNldFRhZyA9IGRlZmluZU1hcHBpbmdUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOnNldCcsIHtcbiAgY3JlYXRlOiAoKSA9PiBuZXcgU2V0PHVua25vd24+KCksXG4gIGlkZW50aWZ5OiAoZGF0YSkgPT4gZGF0YSBpbnN0YW5jZW9mIFNldCxcbiAgcmVwcmVzZW50OiAoZGF0YTogU2V0PHVua25vd24+KSA9PiB7XG4gICAgY29uc3QgbWFwID0gbmV3IE1hcDx1bmtub3duLCBudWxsPigpXG4gICAgZm9yIChjb25zdCBrZXkgb2YgZGF0YSkgbWFwLnNldChrZXksIG51bGwpXG4gICAgcmV0dXJuIG1hcFxuICB9LFxuICBhZGRQYWlyOiAoY29udGFpbmVyLCBrZXksIHZhbHVlKSA9PiB7XG4gICAgaWYgKHZhbHVlICE9PSBudWxsKSByZXR1cm4gJ2Nhbm5vdCByZXNvbHZlIGEgc2V0IGl0ZW0nXG4gICAgY29udGFpbmVyLmFkZChrZXkpXG4gICAgcmV0dXJuICcnXG4gIH0sXG4gIGhhczogKGNvbnRhaW5lciwga2V5KSA9PiBjb250YWluZXIuaGFzKGtleSksXG4gIGtleXM6IChjb250YWluZXIpID0+IGNvbnRhaW5lci5rZXlzKCksXG4gIGdldDogKCkgPT4gbnVsbFxufSlcblxuZXhwb3J0IHsgc2V0VGFnIH1cbiIsICJpbXBvcnQge1xuICB0eXBlIE1hcHBpbmdUYWdEZWZpbml0aW9uLFxuICB0eXBlIFNjYWxhclRhZ0RlZmluaXRpb24sXG4gIHR5cGUgU2VxdWVuY2VUYWdEZWZpbml0aW9uLFxuICB0eXBlIFRhZ0RlZmluaXRpb25cbn0gZnJvbSAnLi90YWcudHMnXG5pbXBvcnQgeyBzdHJUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvc3RyLnRzJ1xuaW1wb3J0IHsgbnVsbENvcmVUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvbnVsbF9jb3JlLnRzJ1xuaW1wb3J0IHsgbnVsbEpzb25UYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvbnVsbF9qc29uLnRzJ1xuaW1wb3J0IHsgbnVsbFlhbWwxMVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9udWxsX3lhbWwxMS50cydcbmltcG9ydCB7IGJvb2xDb3JlVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2Jvb2xfY29yZS50cydcbmltcG9ydCB7IGJvb2xKc29uVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2Jvb2xfanNvbi50cydcbmltcG9ydCB7IGJvb2xZYW1sMTFUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvYm9vbF95YW1sMTEudHMnXG5pbXBvcnQgeyBpbnRDb3JlVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2ludF9jb3JlLnRzJ1xuaW1wb3J0IHsgaW50SnNvblRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9pbnRfanNvbi50cydcbmltcG9ydCB7IGludFlhbWwxMVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9pbnRfeWFtbDExLnRzJ1xuaW1wb3J0IHsgZmxvYXRDb3JlVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2Zsb2F0X2NvcmUudHMnXG5pbXBvcnQgeyBmbG9hdEpzb25UYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvZmxvYXRfanNvbi50cydcbmltcG9ydCB7IGZsb2F0WWFtbDExVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2Zsb2F0X3lhbWwxMS50cydcbmltcG9ydCB7IG1lcmdlVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL21lcmdlLnRzJ1xuaW1wb3J0IHsgYmluYXJ5VGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2JpbmFyeS50cydcbmltcG9ydCB7IHRpbWVzdGFtcFRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci90aW1lc3RhbXAudHMnXG5pbXBvcnQgeyBzZXFUYWcgfSBmcm9tICcuL3RhZy9zZXF1ZW5jZS9zZXEudHMnXG5pbXBvcnQgeyBvbWFwVGFnIH0gZnJvbSAnLi90YWcvc2VxdWVuY2Uvb21hcC50cydcbmltcG9ydCB7IHBhaXJzVGFnIH0gZnJvbSAnLi90YWcvc2VxdWVuY2UvcGFpcnMudHMnXG5pbXBvcnQgeyBtYXBUYWcgfSBmcm9tICcuL3RhZy9tYXBwaW5nL21hcC50cydcbmltcG9ydCB7IHNldFRhZyB9IGZyb20gJy4vdGFnL21hcHBpbmcvc2V0LnRzJ1xuXG5pbnRlcmZhY2UgVGFnRGVmaW5pdGlvbk1hcCB7XG4gIHNjYWxhcjogUmVjb3JkPHN0cmluZywgU2NhbGFyVGFnRGVmaW5pdGlvbj5cbiAgc2VxdWVuY2U6IFJlY29yZDxzdHJpbmcsIFNlcXVlbmNlVGFnRGVmaW5pdGlvbj5cbiAgbWFwcGluZzogUmVjb3JkPHN0cmluZywgTWFwcGluZ1RhZ0RlZmluaXRpb24+XG59XG5cbmludGVyZmFjZSBUYWdEZWZpbml0aW9uTGlzdE1hcCB7XG4gIHNjYWxhcjogU2NhbGFyVGFnRGVmaW5pdGlvbltdXG4gIHNlcXVlbmNlOiBTZXF1ZW5jZVRhZ0RlZmluaXRpb25bXVxuICBtYXBwaW5nOiBNYXBwaW5nVGFnRGVmaW5pdGlvbltdXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRhZ0RlZmluaXRpb25NYXAgKCk6IFRhZ0RlZmluaXRpb25NYXAge1xuICByZXR1cm4ge1xuICAgIHNjYWxhcjoge30sXG4gICAgc2VxdWVuY2U6IHt9LFxuICAgIG1hcHBpbmc6IHt9XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlVGFnRGVmaW5pdGlvbkxpc3RNYXAgKCk6IFRhZ0RlZmluaXRpb25MaXN0TWFwIHtcbiAgcmV0dXJuIHtcbiAgICBzY2FsYXI6IFtdLFxuICAgIHNlcXVlbmNlOiBbXSxcbiAgICBtYXBwaW5nOiBbXVxuICB9XG59XG5cbmZ1bmN0aW9uIGNvbXBpbGVUYWdzICh0YWdzOiByZWFkb25seSBUYWdEZWZpbml0aW9uW10pIHtcbiAgY29uc3QgcmVzdWx0OiBUYWdEZWZpbml0aW9uW10gPSBbXVxuXG4gIGZvciAoY29uc3QgdGFnIG9mIHRhZ3MpIHtcbiAgICBsZXQgaW5kZXggPSByZXN1bHQubGVuZ3RoXG5cbiAgICBmb3IgKGxldCBwcmV2aW91c0luZGV4ID0gMDsgcHJldmlvdXNJbmRleCA8IHJlc3VsdC5sZW5ndGg7IHByZXZpb3VzSW5kZXgrKykge1xuICAgICAgY29uc3QgcHJldmlvdXMgPSByZXN1bHRbcHJldmlvdXNJbmRleF1cblxuICAgICAgaWYgKHByZXZpb3VzLm5vZGVLaW5kID09PSB0YWcubm9kZUtpbmQgJiZcbiAgICAgICAgICBwcmV2aW91cy50YWdOYW1lID09PSB0YWcudGFnTmFtZSAmJlxuICAgICAgICAgIHByZXZpb3VzLm1hdGNoQnlUYWdQcmVmaXggPT09IHRhZy5tYXRjaEJ5VGFnUHJlZml4KSB7XG4gICAgICAgIGluZGV4ID0gcHJldmlvdXNJbmRleFxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlc3VsdFtpbmRleF0gPSB0YWdcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuY2xhc3MgU2NoZW1hIHtcbiAgcmVhZG9ubHkgdGFnczogcmVhZG9ubHkgVGFnRGVmaW5pdGlvbltdXG4gIHJlYWRvbmx5IGltcGxpY2l0U2NhbGFyVGFnczogcmVhZG9ubHkgU2NhbGFyVGFnRGVmaW5pdGlvbltdXG4gIC8vIERpc3BhdGNoIGltcGxpY2l0IHNjYWxhciByZXNvbHZlcnMgYnkgYHNvdXJjZS5jaGFyQXQoMClgLiBFYWNoIGJ1Y2tldCBob2xkcyB0aGVcbiAgLy8gcmVzb2x2ZXJzIHRoYXQgbWF5IG1hdGNoIHRoYXQga2V5LCBpbiBzY2hlbWEgb3JkZXI7IGEga2V5IGFic2VudCBmcm9tIHRoZSBtYXBcbiAgLy8gdXNlcyBgaW1wbGljaXRTY2FsYXJBbnlGaXJzdENoYXJgIChyZXNvbHZlcnMgdGhhdCBkZWNsYXJlZCBubyBmaXJzdC1jaGFyXG4gIC8vIGNvbnN0cmFpbnQsIHNvIHRoZXkgYXBwbHkgdG8gYW55IGZpcnN0IGNoYXJhY3RlcikuXG4gIHJlYWRvbmx5IGltcGxpY2l0U2NhbGFyQnlGaXJzdENoYXI6IFJlYWRvbmx5TWFwPHN0cmluZywgcmVhZG9ubHkgU2NhbGFyVGFnRGVmaW5pdGlvbltdPlxuICByZWFkb25seSBpbXBsaWNpdFNjYWxhckFueUZpcnN0Q2hhcjogcmVhZG9ubHkgU2NhbGFyVGFnRGVmaW5pdGlvbltdXG4gIC8vIFRoZSBkZWZhdWx0IHNjYWxhciB0YWcgKGAhIXN0cmApLCByZXNvbHZlZCBvbmNlIHNvIHRoZSBjb21wb3NlcidzIGZhbGxiYWNrIGZvclxuICAvLyB1bnJlc29sdmVkIHBsYWluIHNjYWxhcnMgYXZvaWRzIGEga2V5ZWQgbG9va3VwIHBlciBzY2FsYXIuXG4gIHJlYWRvbmx5IGRlZmF1bHRTY2FsYXJUYWc6IFNjYWxhclRhZ0RlZmluaXRpb25cbiAgLy8gVGhlIGRlZmF1bHQgY29udGFpbmVyIHRhZ3MgKGAhIXNlcWAgLyBgISFtYXBgKSwgdXNlZCBieSB0aGUgZHVtcGVyOiB3aGVuIGFcbiAgLy8gdmFsdWUgaXMgaWRlbnRpZmllZCBieSBpdHMgZGVmYXVsdCB0YWcsIHRoZSB0YWcgaXMgaW1wbGljaXQgYW5kIG5vdCBwcmludGVkLlxuICAvLyBVbmRlZmluZWQgaWYgdGhlIHNjaGVtYSBkb2VzIG5vdCBkZWZpbmUgdGhlbSAodGhlbiBzdWNoIHZhbHVlcyBjYW4ndCBiZSBkdW1wZWQpLlxuICByZWFkb25seSBkZWZhdWx0U2VxdWVuY2VUYWc6IFNlcXVlbmNlVGFnRGVmaW5pdGlvbiB8IHVuZGVmaW5lZFxuICByZWFkb25seSBkZWZhdWx0TWFwcGluZ1RhZzogTWFwcGluZ1RhZ0RlZmluaXRpb24gfCB1bmRlZmluZWRcbiAgcmVhZG9ubHkgZXhhY3Q6IFRhZ0RlZmluaXRpb25NYXBcbiAgcmVhZG9ubHkgcHJlZml4OiBUYWdEZWZpbml0aW9uTGlzdE1hcFxuXG4gIGNvbnN0cnVjdG9yICh0YWdzOiByZWFkb25seSBUYWdEZWZpbml0aW9uW10pIHtcbiAgICBjb25zdCBjb21waWxlZFRhZ3MgPSBjb21waWxlVGFncyh0YWdzKVxuICAgIGNvbnN0IGltcGxpY2l0U2NhbGFyVGFnczogU2NhbGFyVGFnRGVmaW5pdGlvbltdID0gW11cbiAgICBjb25zdCBleGFjdCA9IGNyZWF0ZVRhZ0RlZmluaXRpb25NYXAoKVxuICAgIGNvbnN0IHByZWZpeCA9IGNyZWF0ZVRhZ0RlZmluaXRpb25MaXN0TWFwKClcblxuICAgIGZvciAoY29uc3QgdGFnIG9mIGNvbXBpbGVkVGFncykge1xuICAgICAgaWYgKHRhZy5ub2RlS2luZCA9PT0gJ3NjYWxhcicgJiYgdGFnLmltcGxpY2l0KSB7XG4gICAgICAgIGlmICh0YWcubWF0Y2hCeVRhZ1ByZWZpeCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW1wbGljaXQgc2NhbGFyIHRhZ3MgY2Fubm90IG1hdGNoIGJ5IHRhZyBwcmVmaXgnKVxuICAgICAgICB9XG5cbiAgICAgICAgaW1wbGljaXRTY2FsYXJUYWdzLnB1c2godGFnKVxuICAgICAgfVxuXG4gICAgICBzd2l0Y2ggKHRhZy5ub2RlS2luZCkge1xuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgIGlmICh0YWcubWF0Y2hCeVRhZ1ByZWZpeCkgcHJlZml4LnNjYWxhci5wdXNoKHRhZylcbiAgICAgICAgICBlbHNlIGV4YWN0LnNjYWxhclt0YWcudGFnTmFtZV0gPSB0YWdcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdzZXF1ZW5jZSc6XG4gICAgICAgICAgaWYgKHRhZy5tYXRjaEJ5VGFnUHJlZml4KSBwcmVmaXguc2VxdWVuY2UucHVzaCh0YWcpXG4gICAgICAgICAgZWxzZSBleGFjdC5zZXF1ZW5jZVt0YWcudGFnTmFtZV0gPSB0YWdcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdtYXBwaW5nJzpcbiAgICAgICAgICBpZiAodGFnLm1hdGNoQnlUYWdQcmVmaXgpIHByZWZpeC5tYXBwaW5nLnB1c2godGFnKVxuICAgICAgICAgIGVsc2UgZXhhY3QubWFwcGluZ1t0YWcudGFnTmFtZV0gPSB0YWdcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGltcGxpY2l0U2NhbGFyQW55Rmlyc3RDaGFyID0gaW1wbGljaXRTY2FsYXJUYWdzLmZpbHRlcih0YWcgPT4gdGFnLmltcGxpY2l0Rmlyc3RDaGFycyA9PT0gbnVsbClcblxuICAgIGNvbnN0IGtleXMgPSBuZXcgU2V0PHN0cmluZz4oKVxuICAgIGZvciAoY29uc3QgdGFnIG9mIGltcGxpY2l0U2NhbGFyVGFncykge1xuICAgICAgaWYgKHRhZy5pbXBsaWNpdEZpcnN0Q2hhcnMgIT09IG51bGwpIHtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdGFnLmltcGxpY2l0Rmlyc3RDaGFycykga2V5cy5hZGQoa2V5KVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGltcGxpY2l0U2NhbGFyQnlGaXJzdENoYXIgPSBuZXcgTWFwPHN0cmluZywgU2NhbGFyVGFnRGVmaW5pdGlvbltdPigpXG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgICAgaW1wbGljaXRTY2FsYXJCeUZpcnN0Q2hhci5zZXQoa2V5LCBpbXBsaWNpdFNjYWxhclRhZ3MuZmlsdGVyKHRhZyA9PlxuICAgICAgICB0YWcuaW1wbGljaXRGaXJzdENoYXJzID09PSBudWxsIHx8IHRhZy5pbXBsaWNpdEZpcnN0Q2hhcnMuaW5kZXhPZihrZXkpICE9PSAtMSkpXG4gICAgfVxuXG4gICAgY29uc3QgZGVmYXVsdFNjYWxhclRhZyA9IGV4YWN0LnNjYWxhclsndGFnOnlhbWwub3JnLDIwMDI6c3RyJ11cbiAgICBpZiAoIWRlZmF1bHRTY2FsYXJUYWcpIHRocm93IG5ldyBFcnJvcignc2NoZW1hIGRvZXMgbm90IGRlZmluZSB0aGUgZGVmYXVsdCBzY2FsYXIgdGFnICh0YWc6eWFtbC5vcmcsMjAwMjpzdHIpJylcblxuICAgIHRoaXMudGFncyA9IGNvbXBpbGVkVGFnc1xuICAgIHRoaXMuaW1wbGljaXRTY2FsYXJUYWdzID0gaW1wbGljaXRTY2FsYXJUYWdzXG4gICAgdGhpcy5pbXBsaWNpdFNjYWxhckJ5Rmlyc3RDaGFyID0gaW1wbGljaXRTY2FsYXJCeUZpcnN0Q2hhclxuICAgIHRoaXMuaW1wbGljaXRTY2FsYXJBbnlGaXJzdENoYXIgPSBpbXBsaWNpdFNjYWxhckFueUZpcnN0Q2hhclxuICAgIHRoaXMuZGVmYXVsdFNjYWxhclRhZyA9IGRlZmF1bHRTY2FsYXJUYWdcbiAgICB0aGlzLmRlZmF1bHRTZXF1ZW5jZVRhZyA9IGV4YWN0LnNlcXVlbmNlWyd0YWc6eWFtbC5vcmcsMjAwMjpzZXEnXVxuICAgIHRoaXMuZGVmYXVsdE1hcHBpbmdUYWcgPSBleGFjdC5tYXBwaW5nWyd0YWc6eWFtbC5vcmcsMjAwMjptYXAnXVxuICAgIHRoaXMuZXhhY3QgPSBleGFjdFxuICAgIHRoaXMucHJlZml4ID0gcHJlZml4XG4gIH1cblxuICB3aXRoVGFncyAoLi4udGFnczogQXJyYXk8VGFnRGVmaW5pdGlvbiB8IHJlYWRvbmx5IFRhZ0RlZmluaXRpb25bXT4pOiBTY2hlbWEge1xuICAgIGxldCBmbGF0VGFnczogVGFnRGVmaW5pdGlvbltdID0gW11cbiAgICBmb3IgKGNvbnN0IHRhZyBvZiB0YWdzKSBmbGF0VGFncyA9IGZsYXRUYWdzLmNvbmNhdCh0YWcpXG5cbiAgICByZXR1cm4gbmV3IFNjaGVtYShbLi4udGhpcy50YWdzLCAuLi5mbGF0VGFnc10pXG4gIH1cbn1cblxuY29uc3QgRkFJTFNBRkVfU0NIRU1BID0gbmV3IFNjaGVtYShbXG4gIHN0clRhZyxcbiAgc2VxVGFnLFxuICBtYXBUYWdcbl0pXG5cbmNvbnN0IEpTT05fU0NIRU1BID0gbmV3IFNjaGVtYShbXG4gIC4uLkZBSUxTQUZFX1NDSEVNQS50YWdzLFxuICBudWxsSnNvblRhZyxcbiAgYm9vbEpzb25UYWcsXG4gIGludEpzb25UYWcsXG4gIGZsb2F0SnNvblRhZ1xuXSlcblxuY29uc3QgQ09SRV9TQ0hFTUEgPSBuZXcgU2NoZW1hKFtcbiAgLi4uRkFJTFNBRkVfU0NIRU1BLnRhZ3MsXG4gIG51bGxDb3JlVGFnLFxuICBib29sQ29yZVRhZyxcbiAgaW50Q29yZVRhZyxcbiAgZmxvYXRDb3JlVGFnXG5dKVxuXG5jb25zdCBZQU1MMTFfU0NIRU1BID0gbmV3IFNjaGVtYShbXG4gIC4uLkZBSUxTQUZFX1NDSEVNQS50YWdzLFxuICBudWxsWWFtbDExVGFnLFxuICBib29sWWFtbDExVGFnLFxuICBpbnRZYW1sMTFUYWcsXG4gIGZsb2F0WWFtbDExVGFnLFxuICB0aW1lc3RhbXBUYWcsXG4gIG1lcmdlVGFnLFxuICBiaW5hcnlUYWcsXG4gIG9tYXBUYWcsXG4gIHBhaXJzVGFnLFxuICBzZXRUYWdcbl0pXG5cbmV4cG9ydCB7XG4gIFNjaGVtYSxcbiAgRkFJTFNBRkVfU0NIRU1BLFxuICBKU09OX1NDSEVNQSxcbiAgQ09SRV9TQ0hFTUEsXG4gIFlBTUwxMV9TQ0hFTUEsXG5cbiAgdHlwZSBUYWdEZWZpbml0aW9uTWFwLFxuICB0eXBlIFRhZ0RlZmluaXRpb25MaXN0TWFwXG59XG4iLCAiaW1wb3J0IHsgZGVmaW5lTWFwcGluZ1RhZyB9IGZyb20gJy4uLy4uL3RhZy50cydcbmltcG9ydCB7IGlzUGxhaW5PYmplY3QgfSBmcm9tICcuLi8uLi9jb21tb24vb2JqZWN0LnRzJ1xuXG50eXBlIFJlYWxNYXBwaW5nID0gTWFwPHVua25vd24sIHVua25vd24+XG5cbi8vIEEgbWFwcGluZyByZXByZXNlbnRlZCBhcyBhIHJlYWwgYE1hcGA6IGtleXMga2VlcCB0aGVpciBjb25zdHJ1Y3RlZCB0eXBlLFxuLy8gbm90aGluZyBpcyBzdHJpbmdpZmllZC4gRHJvcC1pbiByZXBsYWNlbWVudCBmb3IgdGhlIGRlZmF1bHQgYCEhbWFwYCB0YWdcbi8vIChzYW1lIHRhZyBuYW1lKSDigJQgYENPUkVfU0NIRU1BLndpdGhUYWdzKHJlYWxNYXBUYWcpYC5cbmNvbnN0IHJlYWxNYXBUYWcgPSBkZWZpbmVNYXBwaW5nVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjptYXAnLCB7XG4gIGNyZWF0ZTogKCkgPT4gbmV3IE1hcDx1bmtub3duLCB1bmtub3duPigpLFxuICBhZGRQYWlyOiAoY29udGFpbmVyOiBSZWFsTWFwcGluZywga2V5LCB2YWx1ZSkgPT4ge1xuICAgIGNvbnRhaW5lci5zZXQoa2V5LCB2YWx1ZSlcbiAgICByZXR1cm4gJydcbiAgfSxcbiAgaGFzOiAoY29udGFpbmVyOiBSZWFsTWFwcGluZywga2V5KSA9PiBjb250YWluZXIuaGFzKGtleSksXG4gIGtleXM6IChjb250YWluZXI6IFJlYWxNYXBwaW5nKSA9PiBjb250YWluZXIua2V5cygpLFxuICBnZXQ6IChjb250YWluZXI6IFJlYWxNYXBwaW5nLCBrZXkpID0+IGNvbnRhaW5lci5nZXQoa2V5KSxcbiAgLy8gRHVtcCBzaWRlOiBoYW5kbGUgYm90aCBhIHJlYWwgYE1hcGAgYW5kIGEgcGxhaW4gb2JqZWN0LCBzbyB0aGlzIHRhZyBmdWxseVxuICAvLyByZXBsYWNlcyB0aGUgZGVmYXVsdCBtYXAgcmVwcmVzZW50YXRpb24gd2hlbiBkdW1waW5nIHRvby5cbiAgaWRlbnRpZnk6IChkYXRhKSA9PiBkYXRhIGluc3RhbmNlb2YgTWFwIHx8IGlzUGxhaW5PYmplY3QoZGF0YSksXG4gIC8vIER1bXAgc2lkZTogdGhlIGNhbm9uaWNhbCBtYXBwaW5nIGZvcm0gaXMgYSBgTWFwYC4gQSByZWFsIGBNYXBgIHBhc3Nlc1xuICAvLyB0aHJvdWdoIHVudG91Y2hlZCAoa2V5cyBrZWVwIHRoZWlyIHR5cGUpOyBhIHBsYWluIG9iamVjdCBpcyB3cmFwcGVkXG4gIC8vIHNoYWxsb3dseS4gTG9zc2xlc3Mg4oCUIG5vdGhpbmcgaXMgc3RyaW5naWZpZWQuXG4gIHJlcHJlc2VudDogKGRhdGEpID0+IHtcbiAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIE1hcCkgcmV0dXJuIGRhdGFcbiAgICBjb25zdCBtYXAgPSBuZXcgTWFwPHVua25vd24sIHVua25vd24+KClcbiAgICBjb25zdCBvYmogPSBkYXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMob2JqKSkgbWFwLnNldChrZXksIG9ialtrZXldKVxuICAgIHJldHVybiBtYXBcbiAgfVxufSlcblxuZXhwb3J0IHsgcmVhbE1hcFRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lTWFwcGluZ1RhZyB9IGZyb20gJy4uLy4uL3RhZy50cydcbmltcG9ydCB7IGlzUGxhaW5PYmplY3QgfSBmcm9tICcuLi8uLi9jb21tb24vb2JqZWN0LnRzJ1xuXG50eXBlIFN0cmluZ01hcHBpbmcgPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuXG4vLyBDb2VyY2UgYSBjb25zdHJ1Y3RlZCBrZXkgaW50byB0aGUgc3RyaW5nIGlkZW50aXR5IGEgYHt9YCByZXByZXNlbnRhdGlvbiB1c2VzLlxuLy8gUmV0dXJucyBudWxsIGZvciBhIG5lc3RlZCBhcnJheSBrZXkgKGFuIGFycmF5IGVsZW1lbnQgdGhhdCBpcyBpdHNlbGYgYW5cbi8vIGFycmF5KSwgd2hpY2ggd291bGQgb3RoZXJ3aXNlIGJsb3cgdXAgZXhwb25lbnRpYWxseSB3aGVuIHN0cmluZ2lmaWVkIHZpYVxuLy8gYWxpYXNlcy5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUtleSAoa2V5OiB1bmtub3duKTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmIChBcnJheS5pc0FycmF5KGtleSkpIHtcbiAgICBjb25zdCBhcnJheSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGtleSkgYXMgdW5rbm93bltdXG5cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXJyYXkubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShhcnJheVtpbmRleF0pKSByZXR1cm4gbnVsbFxuXG4gICAgICBpZiAodHlwZW9mIGFycmF5W2luZGV4XSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJyYXlbaW5kZXhdKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgYXJyYXlbaW5kZXhdID0gJ1tvYmplY3QgT2JqZWN0XSdcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gU3RyaW5nKGFycmF5KVxuICB9XG5cbiAgaWYgKHR5cGVvZiBrZXkgPT09ICdvYmplY3QnICYmXG4gICAgICBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoa2V5KSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gJ1tvYmplY3QgT2JqZWN0XSdcbiAgfVxuXG4gIHJldHVybiBTdHJpbmcoa2V5KVxufVxuXG5jb25zdCBsZWdhY3lNYXBUYWcgPSBkZWZpbmVNYXBwaW5nVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjptYXAnLCB7XG4gIGNyZWF0ZTogKCk6IFN0cmluZ01hcHBpbmcgPT4gKHt9KSxcbiAgaWRlbnRpZnk6IGlzUGxhaW5PYmplY3QsXG4gIC8vIER1bXAgc2lkZTogd3JhcCB0aGUgcGxhaW4gb2JqZWN0IGludG8gdGhlIGNhbm9uaWNhbCBgTWFwYCBmb3JtIHRoZSB3cml0ZXJcbiAgLy8gd2Fsa3MuIFNoYWxsb3cg4oCUIGtleXMvdmFsdWVzIHN0YXkgcmVmZXJlbmNlcyB0byB0aGUgb3JpZ2luYWxzLlxuICByZXByZXNlbnQ6IChvOiBTdHJpbmdNYXBwaW5nKSA9PiB7XG4gICAgY29uc3QgbWFwID0gbmV3IE1hcDxzdHJpbmcsIHVua25vd24+KClcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvKSkgbWFwLnNldChrZXksIG9ba2V5XSlcbiAgICByZXR1cm4gbWFwXG4gIH0sXG4gIGFkZFBhaXI6IChjb250YWluZXIsIGtleSwgdmFsdWUpID0+IHtcbiAgICBjb25zdCBub3JtYWxpemVkS2V5ID0gbm9ybWFsaXplS2V5KGtleSlcbiAgICBpZiAobm9ybWFsaXplZEtleSA9PT0gbnVsbCkgcmV0dXJuICduZXN0ZWQgYXJyYXlzIGFyZSBub3Qgc3VwcG9ydGVkIGluc2lkZSBrZXlzJ1xuICAgIGlmIChub3JtYWxpemVkS2V5ID09PSAnX19wcm90b19fJykge1xuICAgICAgLy8gRGVmaW5lIGFzIGFuIG93biBkYXRhIHByb3BlcnR5IHNvIGEgbGl0ZXJhbCBgX19wcm90b19fYCBrZXkgc3RheXMgZGF0YVxuICAgICAgLy8gYW5kIG5ldmVyIGludm9rZXMgdGhlIHByb3RvdHlwZSBzZXR0ZXIuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29udGFpbmVyLCBub3JtYWxpemVkS2V5LCB7XG4gICAgICAgIHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXJbbm9ybWFsaXplZEtleV0gPSB2YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gJydcbiAgfSxcbiAgLy8gaGFzT3duLCBub3QgYGluYDogYSBwbGFpbiBvYmplY3QgaW5oZXJpdHMgYHRvU3RyaW5nYCBhbmQgZnJpZW5kcy5cbiAgaGFzOiAoY29udGFpbmVyLCBrZXkpID0+IHtcbiAgICBjb25zdCBub3JtYWxpemVkS2V5ID0gbm9ybWFsaXplS2V5KGtleSlcbiAgICByZXR1cm4gbm9ybWFsaXplZEtleSAhPT0gbnVsbCAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY29udGFpbmVyLCBub3JtYWxpemVkS2V5KVxuICB9LFxuICBrZXlzOiAoY29udGFpbmVyKSA9PiBPYmplY3Qua2V5cyhjb250YWluZXIpLFxuICBnZXQ6IChjb250YWluZXIsIGtleSkgPT4gY29udGFpbmVyW1N0cmluZyhrZXkpXVxufSlcblxuZXhwb3J0IHsgbGVnYWN5TWFwVGFnLCBpc1BsYWluT2JqZWN0LCB0eXBlIFN0cmluZ01hcHBpbmcgfVxuIiwgImV4cG9ydCBpbnRlcmZhY2UgU25pcHBldE1hcmsge1xuICBuYW1lPzogc3RyaW5nIHwgbnVsbFxuICBidWZmZXI6IHN0cmluZ1xuICBwb3NpdGlvbjogbnVtYmVyXG4gIGxpbmU6IG51bWJlclxuICBjb2x1bW46IG51bWJlclxuICBzbmlwcGV0Pzogc3RyaW5nIHwgbnVsbFxufVxuXG5pbnRlcmZhY2UgU25pcHBldE9wdGlvbnMge1xuICBtYXhMZW5ndGg/OiBudW1iZXJcbiAgaW5kZW50PzogbnVtYmVyXG4gIGxpbmVzQmVmb3JlPzogbnVtYmVyXG4gIGxpbmVzQWZ0ZXI/OiBudW1iZXJcbn1cblxuY29uc3QgREVGQVVMVF9TTklQUEVUX09QVElPTlM6IFJlcXVpcmVkPFNuaXBwZXRPcHRpb25zPiA9IHtcbiAgbWF4TGVuZ3RoOiA3OSxcbiAgaW5kZW50OiAxLFxuICBsaW5lc0JlZm9yZTogMyxcbiAgbGluZXNBZnRlcjogMlxufVxuXG4vLyBnZXQgc25pcHBldCBmb3IgYSBzaW5nbGUgbGluZSwgcmVzcGVjdGluZyBtYXhMZW5ndGhcbmZ1bmN0aW9uIGdldExpbmUgKGJ1ZmZlcjogc3RyaW5nLCBsaW5lU3RhcnQ6IG51bWJlciwgbGluZUVuZDogbnVtYmVyLCBwb3NpdGlvbjogbnVtYmVyLCBtYXhMaW5lTGVuZ3RoOiBudW1iZXIpIHtcbiAgbGV0IGhlYWQgPSAnJ1xuICBsZXQgdGFpbCA9ICcnXG4gIGNvbnN0IG1heEhhbGZMZW5ndGggPSBNYXRoLmZsb29yKG1heExpbmVMZW5ndGggLyAyKSAtIDFcblxuICBpZiAocG9zaXRpb24gLSBsaW5lU3RhcnQgPiBtYXhIYWxmTGVuZ3RoKSB7XG4gICAgaGVhZCA9ICcgLi4uICdcbiAgICBsaW5lU3RhcnQgPSBwb3NpdGlvbiAtIG1heEhhbGZMZW5ndGggKyBoZWFkLmxlbmd0aFxuICB9XG5cbiAgaWYgKGxpbmVFbmQgLSBwb3NpdGlvbiA+IG1heEhhbGZMZW5ndGgpIHtcbiAgICB0YWlsID0gJyAuLi4nXG4gICAgbGluZUVuZCA9IHBvc2l0aW9uICsgbWF4SGFsZkxlbmd0aCAtIHRhaWwubGVuZ3RoXG4gIH1cblxuICByZXR1cm4ge1xuICAgIHN0cjogaGVhZCArIGJ1ZmZlci5zbGljZShsaW5lU3RhcnQsIGxpbmVFbmQpLnJlcGxhY2UoL1xcdC9nLCAn4oaSJykgKyB0YWlsLFxuICAgIHBvczogcG9zaXRpb24gLSBsaW5lU3RhcnQgKyBoZWFkLmxlbmd0aCAvLyByZWxhdGl2ZSBwb3NpdGlvblxuICB9XG59XG5cbmZ1bmN0aW9uIHBhZFN0YXJ0IChzdHJpbmc6IHN0cmluZywgbWF4OiBudW1iZXIpIHtcbiAgLy8gbWF4KCkgcHJvdGVjdHMgZnJvbSBuZWdhdGl2YSB2YWx1ZSwgdG8gYXZvaWQgZXhjZXB0aW9uLlxuICByZXR1cm4gJyAnLnJlcGVhdChNYXRoLm1heChtYXggLSBzdHJpbmcubGVuZ3RoLCAwKSkgKyBzdHJpbmdcbn1cblxuZnVuY3Rpb24gbWFrZVNuaXBwZXQgKG1hcms6IFNuaXBwZXRNYXJrLCBvcHRpb25zPzogU25pcHBldE9wdGlvbnMpIHtcbiAgaWYgKCFtYXJrLmJ1ZmZlcikgcmV0dXJuIG51bGxcblxuICBjb25zdCBvcHRzID0geyAuLi5ERUZBVUxUX1NOSVBQRVRfT1BUSU9OUywgLi4ub3B0aW9ucyB9XG5cbiAgY29uc3QgcmUgPSAvXFxyP1xcbnxcXHJ8XFwwL2dcbiAgY29uc3QgbGluZVN0YXJ0cyA9IFswXVxuICBjb25zdCBsaW5lRW5kczogbnVtYmVyW10gPSBbXVxuICBsZXQgbWF0Y2g6IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGxcbiAgbGV0IGZvdW5kTGluZU5vID0gLTFcblxuICB3aGlsZSAoKG1hdGNoID0gcmUuZXhlYyhtYXJrLmJ1ZmZlcikpKSB7XG4gICAgbGluZUVuZHMucHVzaChtYXRjaC5pbmRleClcbiAgICBsaW5lU3RhcnRzLnB1c2gobWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGgpXG5cbiAgICBpZiAobWFyay5wb3NpdGlvbiA8PSBtYXRjaC5pbmRleCAmJiBmb3VuZExpbmVObyA8IDApIHtcbiAgICAgIGZvdW5kTGluZU5vID0gbGluZVN0YXJ0cy5sZW5ndGggLSAyXG4gICAgfVxuICB9XG5cbiAgaWYgKGZvdW5kTGluZU5vIDwgMCkgZm91bmRMaW5lTm8gPSBsaW5lU3RhcnRzLmxlbmd0aCAtIDFcblxuICBsZXQgcmVzdWx0ID0gJydcbiAgY29uc3QgbGluZU5vTGVuZ3RoID0gTWF0aC5taW4obWFyay5saW5lICsgb3B0cy5saW5lc0FmdGVyLCBsaW5lRW5kcy5sZW5ndGgpLnRvU3RyaW5nKCkubGVuZ3RoXG4gIGNvbnN0IG1heExpbmVMZW5ndGggPSBvcHRzLm1heExlbmd0aCAtIChvcHRzLmluZGVudCArIGxpbmVOb0xlbmd0aCArIDMpXG5cbiAgZm9yIChsZXQgaSA9IDE7IGkgPD0gb3B0cy5saW5lc0JlZm9yZTsgaSsrKSB7XG4gICAgaWYgKGZvdW5kTGluZU5vIC0gaSA8IDApIGJyZWFrXG4gICAgY29uc3QgbGluZSA9IGdldExpbmUoXG4gICAgICBtYXJrLmJ1ZmZlcixcbiAgICAgIGxpbmVTdGFydHNbZm91bmRMaW5lTm8gLSBpXSxcbiAgICAgIGxpbmVFbmRzW2ZvdW5kTGluZU5vIC0gaV0sXG4gICAgICBtYXJrLnBvc2l0aW9uIC0gKGxpbmVTdGFydHNbZm91bmRMaW5lTm9dIC0gbGluZVN0YXJ0c1tmb3VuZExpbmVObyAtIGldKSxcbiAgICAgIG1heExpbmVMZW5ndGhcbiAgICApXG4gICAgcmVzdWx0ID0gYCR7JyAnLnJlcGVhdChvcHRzLmluZGVudCl9JHtwYWRTdGFydCgobWFyay5saW5lIC0gaSArIDEpLnRvU3RyaW5nKCksIGxpbmVOb0xlbmd0aCl9IHwgJHtsaW5lLnN0cn1cXG4ke3Jlc3VsdH1gXG4gIH1cblxuICBjb25zdCBsaW5lID0gZ2V0TGluZShtYXJrLmJ1ZmZlciwgbGluZVN0YXJ0c1tmb3VuZExpbmVOb10sIGxpbmVFbmRzW2ZvdW5kTGluZU5vXSwgbWFyay5wb3NpdGlvbiwgbWF4TGluZUxlbmd0aClcbiAgcmVzdWx0ICs9IGAkeycgJy5yZXBlYXQob3B0cy5pbmRlbnQpfSR7cGFkU3RhcnQoKG1hcmsubGluZSArIDEpLnRvU3RyaW5nKCksIGxpbmVOb0xlbmd0aCl9IHwgJHtsaW5lLnN0cn1cXG5gXG4gIHJlc3VsdCArPSBgJHsnLScucmVwZWF0KG9wdHMuaW5kZW50ICsgbGluZU5vTGVuZ3RoICsgMyArIGxpbmUucG9zKX1eXFxuYFxuXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IG9wdHMubGluZXNBZnRlcjsgaSsrKSB7XG4gICAgaWYgKGZvdW5kTGluZU5vICsgaSA+PSBsaW5lRW5kcy5sZW5ndGgpIGJyZWFrXG4gICAgY29uc3QgbGluZSA9IGdldExpbmUoXG4gICAgICBtYXJrLmJ1ZmZlcixcbiAgICAgIGxpbmVTdGFydHNbZm91bmRMaW5lTm8gKyBpXSxcbiAgICAgIGxpbmVFbmRzW2ZvdW5kTGluZU5vICsgaV0sXG4gICAgICBtYXJrLnBvc2l0aW9uIC0gKGxpbmVTdGFydHNbZm91bmRMaW5lTm9dIC0gbGluZVN0YXJ0c1tmb3VuZExpbmVObyArIGldKSxcbiAgICAgIG1heExpbmVMZW5ndGhcbiAgICApXG4gICAgcmVzdWx0ICs9IGAkeycgJy5yZXBlYXQob3B0cy5pbmRlbnQpfSR7cGFkU3RhcnQoKG1hcmsubGluZSArIGkgKyAxKS50b1N0cmluZygpLCBsaW5lTm9MZW5ndGgpfSB8ICR7bGluZS5zdHJ9XFxuYFxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdC5yZXBsYWNlKC9cXG4kLywgJycpXG59XG5cbmV4cG9ydCBkZWZhdWx0IG1ha2VTbmlwcGV0XG4iLCAiaW1wb3J0IG1ha2VTbmlwcGV0LCB7IHR5cGUgU25pcHBldE1hcmsgfSBmcm9tICcuL3NuaXBwZXQudHMnXG5cbi8vIFlBTUwgZXJyb3IgY2xhc3MuIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODQ1ODk4NFxuLy9cbmZ1bmN0aW9uIGZvcm1hdEVycm9yIChleGNlcHRpb246IFlBTUxFeGNlcHRpb24sIGNvbXBhY3Q/OiBib29sZWFuKSB7XG4gIGxldCB3aGVyZSA9ICcnXG5cbiAgaWYgKCFleGNlcHRpb24ubWFyaykgcmV0dXJuIGV4Y2VwdGlvbi5yZWFzb25cblxuICBpZiAoZXhjZXB0aW9uLm1hcmsubmFtZSkge1xuICAgIHdoZXJlICs9IGBpbiBcIiR7ZXhjZXB0aW9uLm1hcmsubmFtZX1cIiBgXG4gIH1cblxuICB3aGVyZSArPSBgKCR7ZXhjZXB0aW9uLm1hcmsubGluZSArIDF9OiR7ZXhjZXB0aW9uLm1hcmsuY29sdW1uICsgMX0pYFxuXG4gIGlmICghY29tcGFjdCAmJiBleGNlcHRpb24ubWFyay5zbmlwcGV0KSB7XG4gICAgd2hlcmUgKz0gYFxcblxcbiR7ZXhjZXB0aW9uLm1hcmsuc25pcHBldH1gXG4gIH1cblxuICByZXR1cm4gYCR7ZXhjZXB0aW9uLnJlYXNvbn0gJHt3aGVyZX1gXG59XG5cbmNsYXNzIFlBTUxFeGNlcHRpb24gZXh0ZW5kcyBFcnJvciB7XG4gIHJlYXNvbjogc3RyaW5nXG4gIG1hcms/OiBTbmlwcGV0TWFya1xuXG4gIGNvbnN0cnVjdG9yIChyZWFzb246IHN0cmluZywgbWFyaz86IFNuaXBwZXRNYXJrKSB7XG4gICAgc3VwZXIoKVxuXG4gICAgdGhpcy5uYW1lID0gJ1lBTUxFeGNlcHRpb24nXG4gICAgdGhpcy5yZWFzb24gPSByZWFzb25cbiAgICB0aGlzLm1hcmsgPSBtYXJrXG4gICAgdGhpcy5tZXNzYWdlID0gZm9ybWF0RXJyb3IodGhpcywgZmFsc2UpXG5cbiAgICAvLyBHdWFyZCBmb3IgYW5jaWVudCBicm93c2Vyc1xuICAgIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuICAgICAgLy8gSW5jbHVkZSBzdGFjayB0cmFjZSBpbiBlcnJvciBvYmplY3QsXG4gICAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCB0aGlzLmNvbnN0cnVjdG9yKVxuICAgIH1cbiAgfVxuXG4gIHRvU3RyaW5nIChjb21wYWN0PzogYm9vbGVhbikge1xuICAgIHJldHVybiBgJHt0aGlzLm5hbWV9OiAke2Zvcm1hdEVycm9yKHRoaXMsIGNvbXBhY3QpfWBcbiAgfVxufVxuXG4vLyBCdWlsZCBhIFlBTUxFeGNlcHRpb24gd2l0aCBhIHNvdXJjZSBzbmlwcGV0IGFuZCB0aHJvdyBpdC4gYHNvdXJjZWAgaXMgdGhlXG4vLyByYXcgaW5wdXQgdGV4dCAobm8gcGFyc2VyIHNlbnRpbmVsKTsgYHBvc2l0aW9uYCBpcyBhbiBvZmZzZXQgaW50byBpdC5cbmZ1bmN0aW9uIHRocm93RXJyb3JBdCAoc291cmNlOiBzdHJpbmcsIHBvc2l0aW9uOiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZywgZmlsZW5hbWUgPSAnJyk6IG5ldmVyIHtcbiAgbGV0IGxpbmUgPSAwXG4gIGxldCBsaW5lU3RhcnQgPSAwXG5cbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHBvc2l0aW9uOyBpbmRleCsrKSB7XG4gICAgY29uc3QgY2ggPSBzb3VyY2UuY2hhckNvZGVBdChpbmRleClcblxuICAgIGlmIChjaCA9PT0gMHgwQS8qIExGICovKSB7XG4gICAgICBsaW5lKytcbiAgICAgIGxpbmVTdGFydCA9IGluZGV4ICsgMVxuICAgIH0gZWxzZSBpZiAoY2ggPT09IDB4MEQvKiBDUiAqLykge1xuICAgICAgbGluZSsrXG4gICAgICBpZiAoc291cmNlLmNoYXJDb2RlQXQoaW5kZXggKyAxKSA9PT0gMHgwQS8qIExGICovKSBpbmRleCsrXG4gICAgICBsaW5lU3RhcnQgPSBpbmRleCArIDFcbiAgICB9XG4gIH1cblxuICBjb25zdCBtYXJrOiBTbmlwcGV0TWFyayA9IHtcbiAgICBuYW1lOiBmaWxlbmFtZSxcbiAgICBidWZmZXI6IHNvdXJjZSxcbiAgICBwb3NpdGlvbixcbiAgICBsaW5lLFxuICAgIGNvbHVtbjogcG9zaXRpb24gLSBsaW5lU3RhcnRcbiAgfVxuXG4gIG1hcmsuc25pcHBldCA9IG1ha2VTbmlwcGV0KG1hcmspXG4gIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKG1lc3NhZ2UsIG1hcmspXG59XG5cbmV4cG9ydCB7IFlBTUxFeGNlcHRpb24sIHRocm93RXJyb3JBdCB9XG4iLCAiY29uc3QgRVZFTlRfRE9DVU1FTlQgPSAxXG5jb25zdCBFVkVOVF9TRVFVRU5DRSA9IDJcbmNvbnN0IEVWRU5UX01BUFBJTkcgPSAzXG5jb25zdCBFVkVOVF9TQ0FMQVIgPSA0XG5jb25zdCBFVkVOVF9BTElBUyA9IDVcbmNvbnN0IEVWRU5UX1BPUCA9IDZcblxudHlwZSBFdmVudFR5cGUgPVxuICB0eXBlb2YgRVZFTlRfRE9DVU1FTlQgfCB0eXBlb2YgRVZFTlRfU0VRVUVOQ0UgfCB0eXBlb2YgRVZFTlRfTUFQUElORyB8XG4gIHR5cGVvZiBFVkVOVF9TQ0FMQVIgfCB0eXBlb2YgRVZFTlRfQUxJQVMgfCB0eXBlb2YgRVZFTlRfUE9QXG5cbmNvbnN0IFNDQUxBUl9TVFlMRV9QTEFJTiA9IDFcbmNvbnN0IFNDQUxBUl9TVFlMRV9TSU5HTEVfUVVPVEVEID0gMlxuY29uc3QgU0NBTEFSX1NUWUxFX0RPVUJMRV9RVU9URUQgPSAzXG5jb25zdCBTQ0FMQVJfU1RZTEVfTElURVJBTF9CTE9DSyA9IDRcbmNvbnN0IFNDQUxBUl9TVFlMRV9GT0xERURfQkxPQ0sgPSA1XG5cbnR5cGUgU2NhbGFyU3R5bGUgPVxuICB0eXBlb2YgU0NBTEFSX1NUWUxFX1BMQUlOIHwgdHlwZW9mIFNDQUxBUl9TVFlMRV9TSU5HTEVfUVVPVEVEIHxcbiAgdHlwZW9mIFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVEIHwgdHlwZW9mIFNDQUxBUl9TVFlMRV9MSVRFUkFMX0JMT0NLIHxcbiAgdHlwZW9mIFNDQUxBUl9TVFlMRV9GT0xERURfQkxPQ0tcblxuY29uc3QgQ09MTEVDVElPTl9TVFlMRV9CTE9DSyA9IDFcbmNvbnN0IENPTExFQ1RJT05fU1RZTEVfRkxPVyA9IDJcblxudHlwZSBDb2xsZWN0aW9uU3R5bGUgPVxuICB0eXBlb2YgQ09MTEVDVElPTl9TVFlMRV9CTE9DSyB8IHR5cGVvZiBDT0xMRUNUSU9OX1NUWUxFX0ZMT1dcblxuY29uc3QgQ0hPTVBJTkdfQ0xJUCA9IDFcbmNvbnN0IENIT01QSU5HX1NUUklQID0gMlxuY29uc3QgQ0hPTVBJTkdfS0VFUCA9IDNcblxudHlwZSBDaG9tcGluZyA9XG4gIHR5cGVvZiBDSE9NUElOR19DTElQIHwgdHlwZW9mIENIT01QSU5HX1NUUklQIHwgdHlwZW9mIENIT01QSU5HX0tFRVBcblxudHlwZSBEb2N1bWVudERpcmVjdGl2ZSA9XG4gIHsga2luZDogJ3lhbWwnLCB2ZXJzaW9uOiBzdHJpbmcgfSB8XG4gIHsga2luZDogJ3RhZycsIGhhbmRsZTogc3RyaW5nLCBwcmVmaXg6IHN0cmluZyB9XG5cbnR5cGUgVGFnSGFuZGxlcnMgPSBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+XG5cbmludGVyZmFjZSBEb2N1bWVudEV2ZW50IHtcbiAgdHlwZTogdHlwZW9mIEVWRU5UX0RPQ1VNRU5UXG4gIGV4cGxpY2l0U3RhcnQ6IGJvb2xlYW5cbiAgZXhwbGljaXRFbmQ6IGJvb2xlYW5cbiAgZGlyZWN0aXZlczogRG9jdW1lbnREaXJlY3RpdmVbXVxufVxuXG5pbnRlcmZhY2UgU2VxdWVuY2VFdmVudCB7XG4gIHR5cGU6IHR5cGVvZiBFVkVOVF9TRVFVRU5DRVxuICBzdGFydDogbnVtYmVyXG4gIGFuY2hvclN0YXJ0OiBudW1iZXJcbiAgYW5jaG9yRW5kOiBudW1iZXJcbiAgdGFnU3RhcnQ6IG51bWJlclxuICB0YWdFbmQ6IG51bWJlclxuICBzdHlsZTogQ29sbGVjdGlvblN0eWxlXG59XG5cbmludGVyZmFjZSBNYXBwaW5nRXZlbnQge1xuICB0eXBlOiB0eXBlb2YgRVZFTlRfTUFQUElOR1xuICBzdGFydDogbnVtYmVyXG4gIGFuY2hvclN0YXJ0OiBudW1iZXJcbiAgYW5jaG9yRW5kOiBudW1iZXJcbiAgdGFnU3RhcnQ6IG51bWJlclxuICB0YWdFbmQ6IG51bWJlclxuICBzdHlsZTogQ29sbGVjdGlvblN0eWxlXG59XG5cbmludGVyZmFjZSBTY2FsYXJFdmVudCB7XG4gIHR5cGU6IHR5cGVvZiBFVkVOVF9TQ0FMQVJcbiAgdmFsdWVTdGFydDogbnVtYmVyXG4gIHZhbHVlRW5kOiBudW1iZXJcbiAgYW5jaG9yU3RhcnQ6IG51bWJlclxuICBhbmNob3JFbmQ6IG51bWJlclxuICB0YWdTdGFydDogbnVtYmVyXG4gIHRhZ0VuZDogbnVtYmVyXG4gIHN0eWxlOiBTY2FsYXJTdHlsZVxuICBjaG9tcGluZzogQ2hvbXBpbmdcbiAgaW5kZW50OiBudW1iZXJcbiAgZmFzdDogYm9vbGVhblxufVxuXG5pbnRlcmZhY2UgQWxpYXNFdmVudCB7XG4gIHR5cGU6IHR5cGVvZiBFVkVOVF9BTElBU1xuICBhbmNob3JTdGFydDogbnVtYmVyXG4gIGFuY2hvckVuZDogbnVtYmVyXG59XG5cbmludGVyZmFjZSBQb3BFdmVudCB7XG4gIHR5cGU6IHR5cGVvZiBFVkVOVF9QT1Bcbn1cblxudHlwZSBFdmVudCA9XG4gIERvY3VtZW50RXZlbnQgfFxuICBTZXF1ZW5jZUV2ZW50IHxcbiAgTWFwcGluZ0V2ZW50IHxcbiAgU2NhbGFyRXZlbnQgfFxuICBBbGlhc0V2ZW50IHxcbiAgUG9wRXZlbnRcblxuZXhwb3J0IHtcbiAgRVZFTlRfRE9DVU1FTlQsXG4gIEVWRU5UX1NFUVVFTkNFLFxuICBFVkVOVF9NQVBQSU5HLFxuICBFVkVOVF9TQ0FMQVIsXG4gIEVWRU5UX0FMSUFTLFxuICBFVkVOVF9QT1AsXG5cbiAgU0NBTEFSX1NUWUxFX1BMQUlOLFxuICBTQ0FMQVJfU1RZTEVfU0lOR0xFX1FVT1RFRCxcbiAgU0NBTEFSX1NUWUxFX0RPVUJMRV9RVU9URUQsXG4gIFNDQUxBUl9TVFlMRV9MSVRFUkFMX0JMT0NLLFxuICBTQ0FMQVJfU1RZTEVfRk9MREVEX0JMT0NLLFxuXG4gIENPTExFQ1RJT05fU1RZTEVfQkxPQ0ssXG4gIENPTExFQ1RJT05fU1RZTEVfRkxPVyxcblxuICBDSE9NUElOR19DTElQLFxuICBDSE9NUElOR19TVFJJUCxcbiAgQ0hPTVBJTkdfS0VFUCxcblxuICB0eXBlIEV2ZW50VHlwZSxcbiAgdHlwZSBTY2FsYXJTdHlsZSxcbiAgdHlwZSBDb2xsZWN0aW9uU3R5bGUsXG5cbiAgdHlwZSBDaG9tcGluZyxcbiAgdHlwZSBEb2N1bWVudERpcmVjdGl2ZSxcbiAgdHlwZSBUYWdIYW5kbGVycyxcbiAgdHlwZSBEb2N1bWVudEV2ZW50LFxuICB0eXBlIFNlcXVlbmNlRXZlbnQsXG4gIHR5cGUgTWFwcGluZ0V2ZW50LFxuICB0eXBlIFNjYWxhckV2ZW50LFxuICB0eXBlIEFsaWFzRXZlbnQsXG4gIHR5cGUgUG9wRXZlbnQsXG4gIHR5cGUgRXZlbnRcbn1cbiIsICJpbXBvcnQge1xuICBTQ0FMQVJfU1RZTEVfU0lOR0xFX1FVT1RFRCxcbiAgU0NBTEFSX1NUWUxFX0RPVUJMRV9RVU9URUQsXG4gIFNDQUxBUl9TVFlMRV9MSVRFUkFMX0JMT0NLLFxuICBTQ0FMQVJfU1RZTEVfRk9MREVEX0JMT0NLLFxuICBDSE9NUElOR19TVFJJUCxcbiAgQ0hPTVBJTkdfS0VFUCxcbiAgdHlwZSBTY2FsYXJFdmVudFxufSBmcm9tICcuL2V2ZW50cy50cydcblxuY29uc3QgTk9fUkFOR0UgPSAtMVxuXG4vLyAtLS0gY2hhcmFjdGVyIGhlbHBlcnMgKG1pcnJvcnMgc3JjL2xvYWRlci50cywga2VwdCBzZWxmLWNvbnRhaW5lZCBoZXJlKSAtLS1cblxuZnVuY3Rpb24gc2ltcGxlRXNjYXBlU2VxdWVuY2UgKGM6IG51bWJlcikge1xuICBzd2l0Y2ggKGMpIHtcbiAgICBjYXNlIDB4MzAvKiAwICovOiByZXR1cm4gJ1xceDAwJ1xuICAgIGNhc2UgMHg2MS8qIGEgKi86IHJldHVybiAnXFx4MDcnXG4gICAgY2FzZSAweDYyLyogYiAqLzogcmV0dXJuICdcXHgwOCdcbiAgICBjYXNlIDB4NzQvKiB0ICovOiByZXR1cm4gJ1xceDA5J1xuICAgIGNhc2UgMHgwOS8qIFRhYiAqLzogcmV0dXJuICdcXHgwOSdcbiAgICBjYXNlIDB4NkUvKiBuICovOiByZXR1cm4gJ1xceDBBJ1xuICAgIGNhc2UgMHg3Ni8qIHYgKi86IHJldHVybiAnXFx4MEInXG4gICAgY2FzZSAweDY2LyogZiAqLzogcmV0dXJuICdcXHgwQydcbiAgICBjYXNlIDB4NzIvKiByICovOiByZXR1cm4gJ1xceDBEJ1xuICAgIGNhc2UgMHg2NS8qIGUgKi86IHJldHVybiAnXFx4MUInXG4gICAgY2FzZSAweDIwLyogU3BhY2UgKi86IHJldHVybiAnICdcbiAgICBjYXNlIDB4MjIvKiBcIiAqLzogcmV0dXJuICdcXHgyMidcbiAgICBjYXNlIDB4MkYvKiAvICovOiByZXR1cm4gJy8nXG4gICAgY2FzZSAweDVDLyogXFwgKi86IHJldHVybiAnXFx4NUMnXG4gICAgY2FzZSAweDRFLyogTiAqLzogcmV0dXJuICdcXHg4NSdcbiAgICBjYXNlIDB4NUYvKiBfICovOiByZXR1cm4gJ1xceEEwJ1xuICAgIGNhc2UgMHg0Qy8qIEwgKi86IHJldHVybiAnXFx1MjAyOCdcbiAgICBjYXNlIDB4NTAvKiBQICovOiByZXR1cm4gJ1xcdTIwMjknXG4gICAgZGVmYXVsdDogcmV0dXJuICcnXG4gIH1cbn1cblxuY29uc3Qgc2ltcGxlRXNjYXBlQ2hlY2sgPSBuZXcgQXJyYXkoMjU2KVxuY29uc3Qgc2ltcGxlRXNjYXBlTWFwID0gbmV3IEFycmF5KDI1NilcbmZvciAobGV0IGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgc2ltcGxlRXNjYXBlQ2hlY2tbaV0gPSBzaW1wbGVFc2NhcGVTZXF1ZW5jZShpKSA/IDEgOiAwXG4gIHNpbXBsZUVzY2FwZU1hcFtpXSA9IHNpbXBsZUVzY2FwZVNlcXVlbmNlKGkpXG59XG5cbmZ1bmN0aW9uIGNoYXJGcm9tQ29kZXBvaW50IChjOiBudW1iZXIpIHtcbiAgaWYgKGMgPD0gMHhGRkZGKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoYylcbiAgfVxuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShcbiAgICAoKGMgLSAweDAxMDAwMCkgPj4gMTApICsgMHhEODAwLFxuICAgICgoYyAtIDB4MDEwMDAwKSAmIDB4MDNGRikgKyAweERDMDBcbiAgKVxufVxuXG5mdW5jdGlvbiBmcm9tSGV4Q29kZSAoYzogbnVtYmVyKSB7XG4gIGlmIChjID49IDB4MzAvKiAwICovICYmIGMgPD0gMHgzOS8qIDkgKi8pIHJldHVybiBjIC0gMHgzMFxuICBjb25zdCBsYyA9IGMgfCAweDIwXG4gIC8vIERvdWJsZS1xdW90ZWQgc2NhbGFyIHJhbmdlcyBhcmUgdmFsaWRhdGVkIGJ5IHBhcnNlci50cyBiZWZvcmUgY29va2luZy5cbiAgcmV0dXJuIGxjIC0gMHg2MSArIDEwXG59XG5cbmZ1bmN0aW9uIGVzY2FwZWRIZXhMZW4gKGM6IG51bWJlcikge1xuICBpZiAoYyA9PT0gMHg3OC8qIHggKi8pIHJldHVybiAyXG4gIGlmIChjID09PSAweDc1LyogdSAqLykgcmV0dXJuIDRcbiAgLy8gRG91YmxlLXF1b3RlZCBzY2FsYXIgcmFuZ2VzIGFyZSB2YWxpZGF0ZWQgYnkgcGFyc2VyLnRzIGJlZm9yZSBjb29raW5nLlxuICByZXR1cm4gOFxufVxuXG4vLyAtLS0gbGluZSBmb2xkaW5nIGhlbHBlcnMgLS0tXG5cbi8vIFNraXAgYSBydW4gb2YgbGluZSBicmVha3MgcGx1cyB0aGUgbGVhZGluZyB3aGl0ZXNwYWNlIG9mIHRoZSBmb2xsb3dpbmdcbi8vIGxpbmVzLCByZXR1cm5pbmcgdGhlIG51bWJlciBvZiBsaW5lIGJyZWFrcyBjb25zdW1lZCBhbmQgdGhlIG5ldyBwb3NpdGlvbi5cbmZ1bmN0aW9uIHNraXBGb2xkZWRCcmVha3MgKGlucHV0OiBzdHJpbmcsIHBvc2l0aW9uOiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XG4gIGxldCBicmVha3MgPSAwXG5cbiAgd2hpbGUgKHBvc2l0aW9uIDwgZW5kKSB7XG4gICAgY29uc3QgY2ggPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSAweDBBLyogTEYgKi8pIHtcbiAgICAgIGJyZWFrcysrXG4gICAgICBwb3NpdGlvbisrXG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHgwRC8qIENSICovKSB7XG4gICAgICBicmVha3MrK1xuICAgICAgcG9zaXRpb24rK1xuICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pID09PSAweDBBLyogTEYgKi8pIHBvc2l0aW9uKytcbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDIwLyogU3BhY2UgKi8gfHwgY2ggPT09IDB4MDkvKiBUYWIgKi8pIHtcbiAgICAgIHBvc2l0aW9uKytcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyBwb3NpdGlvbiwgYnJlYWtzIH1cbn1cblxuLy8gRm9sZGluZyBvZiBsaW5lIGJyZWFrcyBiZXR3ZWVuIGNvbnRlbnQgY2h1bmtzOiBhIHNpbmdsZSBicmVhayBiZWNvbWVzIGFcbi8vIHNwYWNlLCBzZXZlcmFsIGJyZWFrcyBiZWNvbWUgKGNvdW50IC0gMSkgbmV3bGluZXMuXG5mdW5jdGlvbiBmb2xkZWRCcmVha3MgKGNvdW50OiBudW1iZXIpIHtcbiAgaWYgKGNvdW50ID09PSAxKSByZXR1cm4gJyAnXG4gIC8vIENhbGxlZCBvbmx5IGFmdGVyIHNraXBGb2xkZWRCcmVha3MoKSBjb25zdW1lZCBhdCBsZWFzdCBvbmUgbGluZSBicmVhay5cbiAgcmV0dXJuICdcXG4nLnJlcGVhdChjb3VudCAtIDEpXG59XG5cbi8vIC0tLSBwZXItc3R5bGUgZXh0cmFjdG9ycyAtLS1cblxuZnVuY3Rpb24gZ2V0UGxhaW5WYWx1ZSAoaW5wdXQ6IHN0cmluZywgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGxldCBwb3NpdGlvbiA9IHN0YXJ0XG4gIGxldCBjYXB0dXJlU3RhcnQgPSBzdGFydFxuICBsZXQgY2FwdHVyZUVuZCA9IHN0YXJ0XG5cbiAgd2hpbGUgKHBvc2l0aW9uIDwgZW5kKSB7XG4gICAgY29uc3QgY2ggPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSAweDBBLyogTEYgKi8gfHwgY2ggPT09IDB4MEQvKiBDUiAqLykge1xuICAgICAgcmVzdWx0ICs9IGlucHV0LnNsaWNlKGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZClcbiAgICAgIGNvbnN0IGZvbGQgPSBza2lwRm9sZGVkQnJlYWtzKGlucHV0LCBwb3NpdGlvbiwgZW5kKVxuICAgICAgcmVzdWx0ICs9IGZvbGRlZEJyZWFrcyhmb2xkLmJyZWFrcylcbiAgICAgIHBvc2l0aW9uID0gY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IGZvbGQucG9zaXRpb25cbiAgICB9IGVsc2Uge1xuICAgICAgcG9zaXRpb24rK1xuICAgICAgaWYgKGNoICE9PSAweDIwLyogU3BhY2UgKi8gJiYgY2ggIT09IDB4MDkvKiBUYWIgKi8pIGNhcHR1cmVFbmQgPSBwb3NpdGlvblxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQgKyBpbnB1dC5zbGljZShjYXB0dXJlU3RhcnQsIGNhcHR1cmVFbmQpXG59XG5cbmZ1bmN0aW9uIGdldFNpbmdsZVF1b3RlZFZhbHVlIChpbnB1dDogc3RyaW5nLCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xuICBsZXQgcmVzdWx0ID0gJydcbiAgbGV0IHBvc2l0aW9uID0gc3RhcnRcbiAgbGV0IGNhcHR1cmVTdGFydCA9IHN0YXJ0XG4gIGxldCBjYXB0dXJlRW5kID0gc3RhcnRcblxuICB3aGlsZSAocG9zaXRpb24gPCBlbmQpIHtcbiAgICBjb25zdCBjaCA9IGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pXG5cbiAgICBpZiAoY2ggPT09IDB4MjcvKiAnICovKSB7XG4gICAgICAvLyBXaXRoaW4gdGhlIHN0b3JlZCByYW5nZSBldmVyeSBxdW90ZSBpcyBwYXJ0IG9mIGFuIGVzY2FwZWQgJycgcGFpci5cbiAgICAgIHJlc3VsdCArPSBpbnB1dC5zbGljZShjYXB0dXJlU3RhcnQsIHBvc2l0aW9uKSArIFwiJ1wiXG4gICAgICBwb3NpdGlvbiArPSAyXG4gICAgICBjYXB0dXJlU3RhcnQgPSBjYXB0dXJlRW5kID0gcG9zaXRpb25cbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDBBLyogTEYgKi8gfHwgY2ggPT09IDB4MEQvKiBDUiAqLykge1xuICAgICAgcmVzdWx0ICs9IGlucHV0LnNsaWNlKGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZClcbiAgICAgIGNvbnN0IGZvbGQgPSBza2lwRm9sZGVkQnJlYWtzKGlucHV0LCBwb3NpdGlvbiwgZW5kKVxuICAgICAgcmVzdWx0ICs9IGZvbGRlZEJyZWFrcyhmb2xkLmJyZWFrcylcbiAgICAgIHBvc2l0aW9uID0gY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IGZvbGQucG9zaXRpb25cbiAgICB9IGVsc2Uge1xuICAgICAgcG9zaXRpb24rK1xuICAgICAgaWYgKGNoICE9PSAweDIwLyogU3BhY2UgKi8gJiYgY2ggIT09IDB4MDkvKiBUYWIgKi8pIGNhcHR1cmVFbmQgPSBwb3NpdGlvblxuICAgIH1cbiAgfVxuXG4gIC8vIFdoaXRlc3BhY2UgcmlnaHQgYmVmb3JlIHRoZSBjbG9zaW5nIHF1b3RlIGlzIHNpZ25pZmljYW50IChpdCBpcyBvbmx5XG4gIC8vIHN0cmlwcGVkIHdoZW4gZm9sbG93ZWQgYnkgYSBsaW5lIGJyZWFrKS5cbiAgcmV0dXJuIHJlc3VsdCArIGlucHV0LnNsaWNlKGNhcHR1cmVTdGFydCwgZW5kKVxufVxuXG5mdW5jdGlvbiBnZXREb3VibGVRdW90ZWRWYWx1ZSAoaW5wdXQ6IHN0cmluZywgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGxldCBwb3NpdGlvbiA9IHN0YXJ0XG4gIGxldCBjYXB0dXJlU3RhcnQgPSBzdGFydFxuICBsZXQgY2FwdHVyZUVuZCA9IHN0YXJ0XG5cbiAgd2hpbGUgKHBvc2l0aW9uIDwgZW5kKSB7XG4gICAgY29uc3QgY2ggPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSAweDVDLyogXFwgKi8pIHtcbiAgICAgIHJlc3VsdCArPSBpbnB1dC5zbGljZShjYXB0dXJlU3RhcnQsIHBvc2l0aW9uKVxuICAgICAgcG9zaXRpb24rK1xuICAgICAgY29uc3QgZXNjYXBlZCA9IGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pXG5cbiAgICAgIGlmIChlc2NhcGVkID09PSAweDBBLyogTEYgKi8gfHwgZXNjYXBlZCA9PT0gMHgwRC8qIENSICovKSB7XG4gICAgICAgIC8vIEVzY2FwZWQgbGluZSBicmVhazogYSBsaW5lIGNvbnRpbnVhdGlvbiB0aGF0IGpvaW5zIHdpdGggbm90aGluZy5cbiAgICAgICAgcG9zaXRpb24gPSBza2lwRm9sZGVkQnJlYWtzKGlucHV0LCBwb3NpdGlvbiwgZW5kKS5wb3NpdGlvblxuICAgICAgfSBlbHNlIGlmIChlc2NhcGVkIDwgMjU2ICYmIHNpbXBsZUVzY2FwZUNoZWNrW2VzY2FwZWRdKSB7XG4gICAgICAgIHJlc3VsdCArPSBzaW1wbGVFc2NhcGVNYXBbZXNjYXBlZF1cbiAgICAgICAgcG9zaXRpb24rK1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcGFyc2VyLnRzIGhhcyBhbHJlYWR5IHJlamVjdGVkIHVua25vd24gZXNjYXBlcyBhbmQgaW52YWxpZCBoZXggZGlnaXRzLlxuICAgICAgICBsZXQgaGV4TGVuZ3RoID0gZXNjYXBlZEhleExlbihlc2NhcGVkKVxuICAgICAgICBsZXQgaGV4UmVzdWx0ID0gMFxuXG4gICAgICAgIGZvciAoOyBoZXhMZW5ndGggPiAwOyBoZXhMZW5ndGgtLSkge1xuICAgICAgICAgIHBvc2l0aW9uKytcbiAgICAgICAgICBjb25zdCBkaWdpdCA9IGZyb21IZXhDb2RlKGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pKVxuICAgICAgICAgIGhleFJlc3VsdCA9IChoZXhSZXN1bHQgPDwgNCkgKyBkaWdpdFxuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0ICs9IGNoYXJGcm9tQ29kZXBvaW50KGhleFJlc3VsdClcbiAgICAgICAgcG9zaXRpb24rK1xuICAgICAgfVxuXG4gICAgICBjYXB0dXJlU3RhcnQgPSBjYXB0dXJlRW5kID0gcG9zaXRpb25cbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDBBLyogTEYgKi8gfHwgY2ggPT09IDB4MEQvKiBDUiAqLykge1xuICAgICAgcmVzdWx0ICs9IGlucHV0LnNsaWNlKGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZClcbiAgICAgIGNvbnN0IGZvbGQgPSBza2lwRm9sZGVkQnJlYWtzKGlucHV0LCBwb3NpdGlvbiwgZW5kKVxuICAgICAgcmVzdWx0ICs9IGZvbGRlZEJyZWFrcyhmb2xkLmJyZWFrcylcbiAgICAgIHBvc2l0aW9uID0gY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IGZvbGQucG9zaXRpb25cbiAgICB9IGVsc2Uge1xuICAgICAgcG9zaXRpb24rK1xuICAgICAgaWYgKGNoICE9PSAweDIwLyogU3BhY2UgKi8gJiYgY2ggIT09IDB4MDkvKiBUYWIgKi8pIGNhcHR1cmVFbmQgPSBwb3NpdGlvblxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQgKyBpbnB1dC5zbGljZShjYXB0dXJlU3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gZ2V0QmxvY2tWYWx1ZSAoXG4gIGlucHV0OiBzdHJpbmcsXG4gIHN0YXJ0OiBudW1iZXIsXG4gIGVuZDogbnVtYmVyLFxuICBpbmRlbnQ6IG51bWJlcixcbiAgY2hvbXBpbmc6IG51bWJlcixcbiAgZm9sZGVkOiBib29sZWFuXG4pIHtcbiAgY29uc3QgdGV4dEluZGVudCA9IGluZGVudCA8IDAgPyAwIDogaW5kZW50XG4gIC8vIFRoZSByYW5nZSBzdGFydHMgYXQgY29sdW1uIDAgb2YgdGhlIGZpcnN0IGxpbmUgYW5kIGluY2x1ZGVzIGV2ZXJ5IGxpbmVcbiAgLy8gYnJlYWssIGluY2x1ZGluZyB0aG9zZSBvZiB0cmFpbGluZyBibGFuayBsaW5lcy5cbiAgY29uc3QgcmVnaW9uID0gaW5wdXQuc2xpY2Uoc3RhcnQsIGVuZCkucmVwbGFjZSgvXFxyXFxuPy9nLCAnXFxuJylcbiAgLy8gQW4gZW1wdHkgcmFuZ2UgaXMgYSBibG9jayB3aXRoIG5vIGxpbmVzIGF0IGFsbCAoZS5nLiBhbiBlbXB0eSBgfCtgKSBhbmRcbiAgLy8gbXVzdCBzdGF5IGVtcHR5OyBhIG5haXZlIHNwbGl0IHdvdWxkIGludmVudCBhIHBoYW50b20gYmxhbmsgbGluZS4gT3RoZXJ3aXNlXG4gIC8vIGEgdHJhaWxpbmcgbGluZSBicmVhayBsZWF2ZXMgYSB0cmFpbGluZyAnJyBmcm9tIHNwbGl0KCkgdGhhdCBpcyBub3QgYSByZWFsXG4gIC8vIGxpbmUgKGp1c3QgdGhlIHRlcm1pbmF0b3Igb2YgdGhlIGxhc3Qgb25lKSwgc28gZHJvcCBpdC4gSW50ZXJpb3IgYmxhbmtcbiAgLy8gbGluZXMgYXJlIGtlcHQuXG4gIGNvbnN0IGxpbmVzID0gcmVnaW9uID09PSAnJ1xuICAgID8gW11cbiAgICA6IChyZWdpb24uZW5kc1dpdGgoJ1xcbicpID8gcmVnaW9uLnNsaWNlKDAsIC0xKSA6IHJlZ2lvbikuc3BsaXQoJ1xcbicpXG5cbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGxldCBkaWRSZWFkQ29udGVudCA9IGZhbHNlXG4gIGxldCBlbXB0eUxpbmVzID0gMFxuICBsZXQgYXRNb3JlSW5kZW50ZWQgPSBmYWxzZVxuXG4gIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgIC8vIFdoaXRlc3BhY2UgYmV5b25kIHRoZSBjb250ZW50IGluZGVudGF0aW9uIGlzIHBhcnQgb2YgdGhlIGNvbnRlbnQsIHNvIHRoZVxuICAgIC8vIGluZGVudGF0aW9uIHNjYW4gc3RvcHMgYXQgdGV4dEluZGVudC4gQSBsaW5lIGlzIGVtcHR5IG9ubHkgd2hlbiBub3RoaW5nXG4gICAgLy8gcmVtYWlucyBhZnRlciB0aGUgKGNhcHBlZCkgaW5kZW50YXRpb24uXG4gICAgLy8gaW5kZW50IDwgMCBtZWFucyBubyBjb250ZW50IGxpbmUgd2FzIGRldGVjdGVkIChhIHdob2xseSBibGFuayBibG9jayksIHNvXG4gICAgLy8gZXZlcnkgbGluZSBpcyBhbiBlbXB0eSBsaW5lLlxuICAgIGxldCBjb2x1bW4gPSAwXG4gICAgd2hpbGUgKGNvbHVtbiA8IHRleHRJbmRlbnQgJiYgbGluZS5jaGFyQ29kZUF0KGNvbHVtbikgPT09IDB4MjAvKiBTcGFjZSAqLykgY29sdW1uKytcblxuICAgIGlmIChpbmRlbnQgPCAwIHx8IGNvbHVtbiA+PSBsaW5lLmxlbmd0aCkge1xuICAgICAgZW1wdHlMaW5lcysrXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIGNvbnN0IGNvbnRlbnQgPSBsaW5lLnNsaWNlKHRleHRJbmRlbnQpXG4gICAgY29uc3QgZmlyc3QgPSBjb250ZW50LmNoYXJDb2RlQXQoMClcblxuICAgIGlmIChmb2xkZWQpIHtcbiAgICAgIGlmIChmaXJzdCA9PT0gMHgyMC8qIFNwYWNlICovIHx8IGZpcnN0ID09PSAweDA5LyogVGFiICovKSB7XG4gICAgICAgIC8vIE1vcmUtaW5kZW50ZWQgbGluZXMgYXJlIG5vdCBmb2xkZWQuXG4gICAgICAgIGF0TW9yZUluZGVudGVkID0gdHJ1ZVxuICAgICAgICByZXN1bHQgKz0gJ1xcbicucmVwZWF0KGRpZFJlYWRDb250ZW50ID8gMSArIGVtcHR5TGluZXMgOiBlbXB0eUxpbmVzKVxuICAgICAgfSBlbHNlIGlmIChhdE1vcmVJbmRlbnRlZCkge1xuICAgICAgICBhdE1vcmVJbmRlbnRlZCA9IGZhbHNlXG4gICAgICAgIHJlc3VsdCArPSAnXFxuJy5yZXBlYXQoZW1wdHlMaW5lcyArIDEpXG4gICAgICB9IGVsc2UgaWYgKGVtcHR5TGluZXMgPT09IDApIHtcbiAgICAgICAgaWYgKGRpZFJlYWRDb250ZW50KSByZXN1bHQgKz0gJyAnXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgKz0gJ1xcbicucmVwZWF0KGVtcHR5TGluZXMpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCArPSAnXFxuJy5yZXBlYXQoZGlkUmVhZENvbnRlbnQgPyAxICsgZW1wdHlMaW5lcyA6IGVtcHR5TGluZXMpXG4gICAgfVxuXG4gICAgcmVzdWx0ICs9IGNvbnRlbnRcbiAgICBkaWRSZWFkQ29udGVudCA9IHRydWVcbiAgICBlbXB0eUxpbmVzID0gMFxuICB9XG5cbiAgaWYgKGNob21waW5nID09PSBDSE9NUElOR19LRUVQKSB7XG4gICAgcmVzdWx0ICs9ICdcXG4nLnJlcGVhdChkaWRSZWFkQ29udGVudCA/IDEgKyBlbXB0eUxpbmVzIDogZW1wdHlMaW5lcylcbiAgfSBlbHNlIGlmIChjaG9tcGluZyAhPT0gQ0hPTVBJTkdfU1RSSVApIHtcbiAgICBpZiAoZGlkUmVhZENvbnRlbnQpIHJlc3VsdCArPSAnXFxuJ1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiBnZXRTY2FsYXJWYWx1ZSAoaW5wdXQ6IHN0cmluZywgc2NhbGFyOiBTY2FsYXJFdmVudCk6IHN0cmluZyB7XG4gIGlmIChzY2FsYXIudmFsdWVTdGFydCA9PT0gTk9fUkFOR0UpIHJldHVybiAnJ1xuXG4gIGNvbnN0IHsgdmFsdWVTdGFydCwgdmFsdWVFbmQgfSA9IHNjYWxhclxuXG4gIC8vIEZhc3QgcGF0aDogdGhlIHBhcnNlciBtYXJrZWQgdGhpcyBzY2FsYXIgYXMgYSB2ZXJiYXRpbSBzbGljZSBvZiB0aGUgaW5wdXRcbiAgLy8gKHNpbmdsZS1saW5lIHBsYWluIC8gcXVvdGVkIHdpdGggbm8gZXNjYXBlcyBvciBmb2xkZWQgYnJlYWtzKSwgc28gdGhlXG4gIC8vIHBlci1zdHlsZSBjaGFyIGxvb3AgYmVsb3cgd291bGQganVzdCByZXByb2R1Y2UgdGhlIHNsaWNlLlxuICBpZiAoc2NhbGFyLmZhc3QpIHJldHVybiBpbnB1dC5zbGljZSh2YWx1ZVN0YXJ0LCB2YWx1ZUVuZClcblxuICBzd2l0Y2ggKHNjYWxhci5zdHlsZSkge1xuICAgIGNhc2UgU0NBTEFSX1NUWUxFX1NJTkdMRV9RVU9URUQ6XG4gICAgICByZXR1cm4gZ2V0U2luZ2xlUXVvdGVkVmFsdWUoaW5wdXQsIHZhbHVlU3RhcnQsIHZhbHVlRW5kKVxuICAgIGNhc2UgU0NBTEFSX1NUWUxFX0RPVUJMRV9RVU9URUQ6XG4gICAgICByZXR1cm4gZ2V0RG91YmxlUXVvdGVkVmFsdWUoaW5wdXQsIHZhbHVlU3RhcnQsIHZhbHVlRW5kKVxuICAgIGNhc2UgU0NBTEFSX1NUWUxFX0xJVEVSQUxfQkxPQ0s6XG4gICAgICByZXR1cm4gZ2V0QmxvY2tWYWx1ZShpbnB1dCwgdmFsdWVTdGFydCwgdmFsdWVFbmQsIHNjYWxhci5pbmRlbnQsIHNjYWxhci5jaG9tcGluZywgZmFsc2UpXG4gICAgY2FzZSBTQ0FMQVJfU1RZTEVfRk9MREVEX0JMT0NLOlxuICAgICAgcmV0dXJuIGdldEJsb2NrVmFsdWUoaW5wdXQsIHZhbHVlU3RhcnQsIHZhbHVlRW5kLCBzY2FsYXIuaW5kZW50LCBzY2FsYXIuY2hvbXBpbmcsIHRydWUpXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBnZXRQbGFpblZhbHVlKGlucHV0LCB2YWx1ZVN0YXJ0LCB2YWx1ZUVuZClcbiAgfVxufVxuXG5leHBvcnQge1xuICBnZXRTY2FsYXJWYWx1ZVxufVxuIiwgImNvbnN0IERFRkFVTFRfVEFHX0hBTkRMRVJTOiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PiA9IHtcbiAgJyEnOiAnIScsXG4gICchISc6ICd0YWc6eWFtbC5vcmcsMjAwMjonXG59XG5cbmZ1bmN0aW9uIHRhZ1BlcmNlbnRFbmNvZGUgKHNvdXJjZTogc3RyaW5nKSB7XG4gIHJldHVybiBlbmNvZGVVUkkoc291cmNlKS5yZXBsYWNlKC8hL2csICclMjEnKVxufVxuXG5mdW5jdGlvbiB0YWdOYW1lRnVsbCAocmF3VGFnOiBzdHJpbmcsIHRhZ0hhbmRsZXJzPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgc3RyaW5nPj4pIHtcbiAgaWYgKHJhd1RhZy5zdGFydHNXaXRoKCchPCcpICYmIHJhd1RhZy5lbmRzV2l0aCgnPicpKSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyYXdUYWcuc2xpY2UoMiwgLTEpKVxuICB9XG5cbiAgY29uc3QgaGFuZGxlRW5kID0gcmF3VGFnLmluZGV4T2YoJyEnLCAxKVxuICBjb25zdCBoYW5kbGUgPSBoYW5kbGVFbmQgPT09IC0xID8gJyEnIDogcmF3VGFnLnNsaWNlKDAsIGhhbmRsZUVuZCArIDEpXG4gIGNvbnN0IHByZWZpeCA9IHRhZ0hhbmRsZXJzPy5baGFuZGxlXSA/PyBERUZBVUxUX1RBR19IQU5ETEVSU1toYW5kbGVdID8/IGhhbmRsZVxuXG4gIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocHJlZml4KSArIGRlY29kZVVSSUNvbXBvbmVudChyYXdUYWcuc2xpY2UoaGFuZGxlLmxlbmd0aCkpXG59XG5cbmZ1bmN0aW9uIHRhZ05hbWVTaG9ydCAoZnVsbFRhZzogc3RyaW5nKSB7XG4gIGxldCB0YWcgPSBmdWxsVGFnXG5cbiAgaWYgKHRhZy5jaGFyQ29kZUF0KDApID09PSAweDIxKSB7XG4gICAgdGFnID0gdGFnLnNsaWNlKDEpXG4gICAgcmV0dXJuIGAhJHt0YWdQZXJjZW50RW5jb2RlKHRhZyl9YFxuICB9XG5cbiAgaWYgKHRhZy5zbGljZSgwLCAxOCkgPT09ICd0YWc6eWFtbC5vcmcsMjAwMjonKSB7XG4gICAgcmV0dXJuIGAhISR7dGFnUGVyY2VudEVuY29kZSh0YWcuc2xpY2UoMTgpKX1gXG4gIH1cblxuICByZXR1cm4gYCE8JHt0YWdQZXJjZW50RW5jb2RlKHRhZyl9PmBcbn1cblxuZXhwb3J0IHtcbiAgdGFnTmFtZUZ1bGwsXG4gIHRhZ05hbWVTaG9ydFxufVxuIiwgImltcG9ydCB7XG4gIEVWRU5UX0FMSUFTLFxuICBFVkVOVF9ET0NVTUVOVCxcbiAgRVZFTlRfTUFQUElORyxcbiAgRVZFTlRfUE9QLFxuICBFVkVOVF9TQ0FMQVIsXG4gIEVWRU5UX1NFUVVFTkNFLFxuICBTQ0FMQVJfU1RZTEVfUExBSU4sXG4gIHR5cGUgRXZlbnQsXG4gIHR5cGUgVGFnSGFuZGxlcnMsXG4gIHR5cGUgTWFwcGluZ0V2ZW50LFxuICB0eXBlIFNjYWxhckV2ZW50LFxuICB0eXBlIFNlcXVlbmNlRXZlbnRcbn0gZnJvbSAnLi9ldmVudHMudHMnXG5pbXBvcnQgeyBnZXRTY2FsYXJWYWx1ZSB9IGZyb20gJy4vcGFyc2VyX3NjYWxhci50cydcbmltcG9ydCB7IENPUkVfU0NIRU1BLCB0eXBlIFNjaGVtYSB9IGZyb20gJy4uL3NjaGVtYS50cydcbmltcG9ydCB7XG4gIE1FUkdFX0tFWSxcbiAgTk9UX1JFU09MVkVELFxuICB0eXBlIE1hcHBpbmdUYWdEZWZpbml0aW9uLFxuICB0eXBlIFNjYWxhclRhZ0RlZmluaXRpb24sXG4gIHR5cGUgU2VxdWVuY2VUYWdEZWZpbml0aW9uXG59IGZyb20gJy4uL3RhZy50cydcbmltcG9ydCB7IFlBTUxFeGNlcHRpb24sIHRocm93RXJyb3JBdCB9IGZyb20gJy4uL2NvbW1vbi9leGNlcHRpb24udHMnXG5pbXBvcnQgeyB0YWdOYW1lRnVsbCB9IGZyb20gJy4uL2NvbW1vbi90YWduYW1lLnRzJ1xuXG5jb25zdCBOT19SQU5HRSA9IC0xXG5cbmludGVyZmFjZSBEb2N1bWVudEZyYW1lIHtcbiAga2luZDogJ2RvY3VtZW50J1xuICBwb3NpdGlvbjogbnVtYmVyXG4gIHZhbHVlOiB1bmtub3duXG4gIGhhc1ZhbHVlOiBib29sZWFuXG59XG5cbmludGVyZmFjZSBTZXF1ZW5jZUZyYW1lIHtcbiAga2luZDogJ3NlcXVlbmNlJ1xuICBwb3NpdGlvbjogbnVtYmVyXG4gIHZhbHVlOiBhbnlcbiAgdGFnOiBTZXF1ZW5jZVRhZ0RlZmluaXRpb248YW55LCBhbnk+XG4gIGFuY2hvcjogQW5jaG9yIHwgbnVsbFxuICBpbmRleDogbnVtYmVyXG4gIC8vIFRydWUgd2hlbiB0aGlzIHNlcXVlbmNlIGlzIHRoZSBzb3VyY2UgbGlzdCBvZiBhIGA8PGAgbWVyZ2UgKGA8PDogWy4uLl1gKS5cbiAgLy8gRWFjaCBlbGVtZW50IGlzIHZhbGlkYXRlZCBhcyBhIG1hcHBpbmcgb24gYXJyaXZhbDsgdGhlIG1hdGVyaWFsaXplZCBsaXN0IGlzXG4gIC8vIHRoZW4gZGVsaXZlcmVkIHRvIHRoZSB0YXJnZXQgbWFwcGluZywgd2hpY2ggZm9sZHMgdGhlIGVsZW1lbnRzIGluLlxuICBtZXJnZTogYm9vbGVhblxufVxuXG5pbnRlcmZhY2UgTWFwcGluZ0ZyYW1lIHtcbiAga2luZDogJ21hcHBpbmcnXG4gIHBvc2l0aW9uOiBudW1iZXJcbiAgdmFsdWU6IGFueVxuICB0YWc6IE1hcHBpbmdUYWdEZWZpbml0aW9uPGFueSwgYW55PlxuICBhbmNob3I6IEFuY2hvciB8IG51bGxcbiAga2V5OiB1bmtub3duXG4gIGtleVBvc2l0aW9uOiBudW1iZXJcbiAgaGFzS2V5OiBib29sZWFuXG4gIC8vIEtleXMgYnJvdWdodCBpbiBieSBhIG1lcmdlIHRoYXQgYW4gZXhwbGljaXQgcGFpciBpcyBzdGlsbCBhbGxvd2VkIHRvXG4gIC8vIG92ZXJyaWRlLiBMYXppbHkgYWxsb2NhdGVkOiBzdGF5cyBudWxsIGZvciBtYXBwaW5ncyB3aXRob3V0IGA8PGAuXG4gIG92ZXJyaWRhYmxlOiBTZXQ8dW5rbm93bj4gfCBudWxsXG59XG5cbnR5cGUgRnJhbWUgPSBEb2N1bWVudEZyYW1lIHwgU2VxdWVuY2VGcmFtZSB8IE1hcHBpbmdGcmFtZVxuXG50eXBlIEFueVRhZyA9IFNjYWxhclRhZ0RlZmluaXRpb24gfCBTZXF1ZW5jZVRhZ0RlZmluaXRpb248YW55LCBhbnk+IHwgTWFwcGluZ1RhZ0RlZmluaXRpb248YW55LCBhbnk+XG5cbmludGVyZmFjZSBWYWx1ZUFuZFRhZyB7XG4gIHZhbHVlOiB1bmtub3duXG4gIHRhZzogQW55VGFnXG59XG5cbmludGVyZmFjZSBBbmNob3Ige1xuICB2YWx1ZTogdW5rbm93blxuICB0YWc6IEFueVRhZ1xuICBpc1ZhbHVlRmluYWw6IGJvb2xlYW5cbn1cblxuaW50ZXJmYWNlIENvbnN0cnVjdG9yT3B0aW9ucyB7XG4gIHNvdXJjZTogc3RyaW5nXG4gIGZpbGVuYW1lPzogc3RyaW5nXG4gIHNjaGVtYT86IFNjaGVtYVxuICBqc29uPzogYm9vbGVhblxuICBtYXhUb3RhbE1lcmdlS2V5cz86IG51bWJlclxuICBtYXhBbGlhc2VzPzogbnVtYmVyXG59XG5cbi8vIGBzb3VyY2VgIGlzIGlucHV0IGRhdGEsIG5vdCBjb25maWcg4oCUIHNvIGl0IGhhcyBubyBkZWZhdWx0IGhlcmUuXG5jb25zdCBERUZBVUxUX0NPTlNUUlVDVE9SX09QVElPTlM6IFJlcXVpcmVkPE9taXQ8Q29uc3RydWN0b3JPcHRpb25zLCAnc291cmNlJz4+ID0ge1xuICBmaWxlbmFtZTogJycsXG4gIHNjaGVtYTogQ09SRV9TQ0hFTUEsXG4gIGpzb246IGZhbHNlLFxuICBtYXhUb3RhbE1lcmdlS2V5czogMTAwMDAsXG4gIG1heEFsaWFzZXM6IC0xXG59XG5cbmludGVyZmFjZSBDb25zdHJ1Y3RvclN0YXRlIGV4dGVuZHMgUmVxdWlyZWQ8Q29uc3RydWN0b3JPcHRpb25zPiB7XG4gIGV2ZW50czogRXZlbnRbXVxuICBkb2N1bWVudHM6IHVua25vd25bXVxuICBldmVudEluZGV4OiBudW1iZXJcbiAgcG9zaXRpb246IG51bWJlclxuICBmcmFtZXM6IEZyYW1lW11cbiAgYW5jaG9yczogTWFwPHN0cmluZywgQW5jaG9yPlxuICB0YWdIYW5kbGVyczogVGFnSGFuZGxlcnNcbiAgdG90YWxNZXJnZUtleXM6IG51bWJlclxuICBhbGlhc0NvdW50OiBudW1iZXJcbn1cblxuZnVuY3Rpb24gZXZlbnRQb3NpdGlvbiAoZXZlbnQ6IEV2ZW50KSB7XG4gIGlmICgndGFnU3RhcnQnIGluIGV2ZW50ICYmIGV2ZW50LnRhZ1N0YXJ0ICE9PSBOT19SQU5HRSkgcmV0dXJuIGV2ZW50LnRhZ1N0YXJ0XG4gIGlmICgnYW5jaG9yU3RhcnQnIGluIGV2ZW50ICYmIGV2ZW50LmFuY2hvclN0YXJ0ICE9PSBOT19SQU5HRSkgcmV0dXJuIGV2ZW50LmFuY2hvclN0YXJ0XG4gIGlmICgndmFsdWVTdGFydCcgaW4gZXZlbnQgJiYgZXZlbnQudmFsdWVTdGFydCAhPT0gTk9fUkFOR0UpIHJldHVybiBldmVudC52YWx1ZVN0YXJ0XG4gIGlmICgnc3RhcnQnIGluIGV2ZW50KSByZXR1cm4gZXZlbnQuc3RhcnRcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gdGhyb3dFcnJvciAoc3RhdGU6IENvbnN0cnVjdG9yU3RhdGUsIG1lc3NhZ2U6IHN0cmluZyk6IG5ldmVyIHtcbiAgdGhyb3dFcnJvckF0KHN0YXRlLnNvdXJjZSwgc3RhdGUucG9zaXRpb24sIG1lc3NhZ2UsIHN0YXRlLmZpbGVuYW1lKVxufVxuXG5mdW5jdGlvbiBmaW5hbGl6ZUNvbGxlY3Rpb24gKFxuICBzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSxcbiAgcG9zaXRpb246IG51bWJlcixcbiAgdGFnOiBTZXF1ZW5jZVRhZ0RlZmluaXRpb248YW55LCBhbnk+IHwgTWFwcGluZ1RhZ0RlZmluaXRpb248YW55LCBhbnk+LFxuICBjYXJyaWVyOiB1bmtub3duXG4pIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gdGFnLmZpbmFsaXplKGNhcnJpZXIpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgWUFNTEV4Y2VwdGlvbikgdGhyb3cgZXJyb3JcbiAgICB0aHJvd0Vycm9yQXQoXG4gICAgICBzdGF0ZS5zb3VyY2UsXG4gICAgICBwb3NpdGlvbixcbiAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSxcbiAgICAgIHN0YXRlLmZpbGVuYW1lXG4gICAgKVxuICB9XG59XG5cbmZ1bmN0aW9uIGxvb2t1cFRhZzxUIGV4dGVuZHMgU2NhbGFyVGFnRGVmaW5pdGlvbiB8IFNlcXVlbmNlVGFnRGVmaW5pdGlvbiB8IE1hcHBpbmdUYWdEZWZpbml0aW9uPiAoXG4gIGV4YWN0OiBSZWNvcmQ8c3RyaW5nLCBUPixcbiAgcHJlZml4OiByZWFkb25seSBUW10sXG4gIHRhZ05hbWU6IHN0cmluZ1xuKTogVCB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGV4YWN0VGFnID0gZXhhY3RbdGFnTmFtZV1cbiAgaWYgKGV4YWN0VGFnKSByZXR1cm4gZXhhY3RUYWdcblxuICBmb3IgKGNvbnN0IHRhZyBvZiBwcmVmaXgpIHtcbiAgICBpZiAodGFnTmFtZS5zdGFydHNXaXRoKHRhZy50YWdOYW1lKSkgcmV0dXJuIHRhZ1xuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZFxufVxuXG5mdW5jdGlvbiBmaW5kRXhwbGljaXRUYWc8VCBleHRlbmRzIFNjYWxhclRhZ0RlZmluaXRpb24gfCBTZXF1ZW5jZVRhZ0RlZmluaXRpb24gfCBNYXBwaW5nVGFnRGVmaW5pdGlvbj4gKFxuICBzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSxcbiAgZXhhY3Q6IFJlY29yZDxzdHJpbmcsIFQ+LFxuICBwcmVmaXg6IHJlYWRvbmx5IFRbXSxcbiAgdGFnTmFtZTogc3RyaW5nLFxuICBub2RlS2luZDogVFsnbm9kZUtpbmQnXVxuKSB7XG4gIGNvbnN0IHRhZyA9IGxvb2t1cFRhZyhleGFjdCwgcHJlZml4LCB0YWdOYW1lKVxuICBpZiAodGFnKSByZXR1cm4gdGFnXG5cbiAgdGhyb3dFcnJvcihzdGF0ZSwgYHVua25vd24gJHtub2RlS2luZH0gdGFnICE8JHt0YWdOYW1lfT5gKVxufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RTY2FsYXIgKFxuICBzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSxcbiAgZXZlbnQ6IFNjYWxhckV2ZW50XG4pOiBWYWx1ZUFuZFRhZyB7XG4gIGNvbnN0IHNvdXJjZSA9IGdldFNjYWxhclZhbHVlKHN0YXRlLnNvdXJjZSwgZXZlbnQpXG4gIGNvbnN0IHJhd1RhZyA9IGV2ZW50LnRhZ1N0YXJ0ID09PSBOT19SQU5HRVxuICAgID8gJydcbiAgICA6IHN0YXRlLnNvdXJjZS5zbGljZShldmVudC50YWdTdGFydCwgZXZlbnQudGFnRW5kKVxuICBjb25zdCBzdHJUYWcgPSBzdGF0ZS5zY2hlbWEuZGVmYXVsdFNjYWxhclRhZ1xuXG4gIGlmIChyYXdUYWcgIT09ICcnKSB7XG4gICAgaWYgKHJhd1RhZyA9PT0gJyEnKSByZXR1cm4geyB2YWx1ZTogc291cmNlLCB0YWc6IHN0clRhZyB9XG5cbiAgICBjb25zdCB0YWdOYW1lID0gdGFnTmFtZUZ1bGwocmF3VGFnLCBzdGF0ZS50YWdIYW5kbGVycylcbiAgICBjb25zdCBzY2FsYXJUYWcgPSBsb29rdXBUYWcoc3RhdGUuc2NoZW1hLmV4YWN0LnNjYWxhciwgc3RhdGUuc2NoZW1hLnByZWZpeC5zY2FsYXIsIHRhZ05hbWUpXG5cbiAgICBpZiAoc2NhbGFyVGFnKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBzY2FsYXJUYWcucmVzb2x2ZShzb3VyY2UsIHRydWUsIHRhZ05hbWUpXG5cbiAgICAgIGlmIChyZXN1bHQgPT09IE5PVF9SRVNPTFZFRCkge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCBgY2Fubm90IHJlc29sdmUgYSBub2RlIHdpdGggITwke3RhZ05hbWV9PiBleHBsaWNpdCB0YWdgKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4geyB2YWx1ZTogcmVzdWx0LCB0YWc6IHNjYWxhclRhZyB9XG4gICAgfVxuXG4gICAgLy8gQW4gZW1wdHkgbm9kZSBjYXJyeWluZyBhIGNvbGxlY3Rpb24gdGFnIChlLmcuIGAhIW1hcGAsIGAhIXNlcWApIGlzIGVtaXR0ZWRcbiAgICAvLyBieSB0aGUgcGFyc2VyIGFzIGEgc2NhbGFyIGV2ZW50LCBzaW5jZSB0aGVyZSBpcyBubyBjb2xsZWN0aW9uIHN5bnRheCB0byBrZXlcbiAgICAvLyBvZmYuIFJlc29sdmUgaXQgaGVyZSBieSB0aGUgZXhwbGljaXQgdGFnJ3Mga2luZCBpbnRvIGFuIGVtcHR5IGNvbGxlY3Rpb24uXG4gICAgY29uc3QgY29sbGVjdGlvblRhZ0RlZiA9XG4gICAgICBsb29rdXBUYWcoc3RhdGUuc2NoZW1hLmV4YWN0Lm1hcHBpbmcsIHN0YXRlLnNjaGVtYS5wcmVmaXgubWFwcGluZywgdGFnTmFtZSkgPz9cbiAgICAgIGxvb2t1cFRhZyhzdGF0ZS5zY2hlbWEuZXhhY3Quc2VxdWVuY2UsIHN0YXRlLnNjaGVtYS5wcmVmaXguc2VxdWVuY2UsIHRhZ05hbWUpXG5cbiAgICBpZiAoY29sbGVjdGlvblRhZ0RlZikge1xuICAgICAgaWYgKHNvdXJjZSAhPT0gJycpIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgYGNhbm5vdCByZXNvbHZlIGEgbm9kZSB3aXRoICE8JHt0YWdOYW1lfT4gZXhwbGljaXQgdGFnYClcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2FycmllciA9IGNvbGxlY3Rpb25UYWdEZWYuY3JlYXRlKHRhZ05hbWUpXG4gICAgICBjb25zdCB2YWx1ZSA9IGNvbGxlY3Rpb25UYWdEZWYuY2FycmllcklzUmVzdWx0XG4gICAgICAgID8gY2FycmllclxuICAgICAgICA6IGZpbmFsaXplQ29sbGVjdGlvbihzdGF0ZSwgc3RhdGUucG9zaXRpb24sIGNvbGxlY3Rpb25UYWdEZWYsIGNhcnJpZXIpXG4gICAgICByZXR1cm4geyB2YWx1ZSwgdGFnOiBjb2xsZWN0aW9uVGFnRGVmIH1cbiAgICB9XG5cbiAgICB0aHJvd0Vycm9yKHN0YXRlLCBgdW5rbm93biBzY2FsYXIgdGFnICE8JHt0YWdOYW1lfT5gKVxuICB9XG5cbiAgaWYgKGV2ZW50LnN0eWxlID09PSBTQ0FMQVJfU1RZTEVfUExBSU4pIHtcbiAgICAvLyBjaGFyQXQoMCkgKG5vdCBzb3VyY2VbMF0pIHlpZWxkcyAnJyBmb3IgYW4gZW1wdHkgc291cmNlLCB3aGljaCBpcyB0aGUga2V5XG4gICAgLy8gdGhlIG51bGwgdGFnIGRlY2xhcmVzOyBzb3VyY2VbMF0gd291bGQgYmUgdW5kZWZpbmVkIGFuZCBtaXNzIHRoYXQgYnVja2V0LlxuICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBzdGF0ZS5zY2hlbWEuaW1wbGljaXRTY2FsYXJCeUZpcnN0Q2hhci5nZXQoc291cmNlLmNoYXJBdCgwKSkgPz9cbiAgICAgIHN0YXRlLnNjaGVtYS5pbXBsaWNpdFNjYWxhckFueUZpcnN0Q2hhclxuICAgIGZvciAoY29uc3QgdGFnIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHRhZy5yZXNvbHZlKHNvdXJjZSwgZmFsc2UsIHRhZy50YWdOYW1lKVxuICAgICAgaWYgKHJlc3VsdCAhPT0gTk9UX1JFU09MVkVEKSByZXR1cm4geyB2YWx1ZTogcmVzdWx0LCB0YWcgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IHZhbHVlOiBzdHJUYWcucmVzb2x2ZShzb3VyY2UsIGZhbHNlLCBzdHJUYWcudGFnTmFtZSksIHRhZzogc3RyVGFnIH1cbn1cblxuZnVuY3Rpb24gY29sbGVjdGlvblRhZzxUYWcgZXh0ZW5kcyBTZXF1ZW5jZVRhZ0RlZmluaXRpb24gfCBNYXBwaW5nVGFnRGVmaW5pdGlvbj4gKFxuICBzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSxcbiAgZXZlbnQ6IFNlcXVlbmNlRXZlbnQgfCBNYXBwaW5nRXZlbnQsXG4gIGV4YWN0OiBSZWNvcmQ8c3RyaW5nLCBUYWc+LFxuICBwcmVmaXg6IHJlYWRvbmx5IFRhZ1tdLFxuICBkZWZhdWx0VGFnTmFtZTogc3RyaW5nLFxuICBub2RlS2luZDogVGFnWydub2RlS2luZCddXG4pIHtcbiAgY29uc3QgcmF3VGFnID0gZXZlbnQudGFnU3RhcnQgPT09IE5PX1JBTkdFXG4gICAgPyAnJ1xuICAgIDogc3RhdGUuc291cmNlLnNsaWNlKGV2ZW50LnRhZ1N0YXJ0LCBldmVudC50YWdFbmQpXG4gIGNvbnN0IHRhZ05hbWUgPSByYXdUYWcgPT09ICcnIHx8IHJhd1RhZyA9PT0gJyEnXG4gICAgPyBkZWZhdWx0VGFnTmFtZVxuICAgIDogdGFnTmFtZUZ1bGwocmF3VGFnLCBzdGF0ZS50YWdIYW5kbGVycylcblxuICByZXR1cm4ge1xuICAgIHRhZ05hbWUsXG4gICAgdGFnOiBmaW5kRXhwbGljaXRUYWcoc3RhdGUsIGV4YWN0LCBwcmVmaXgsIHRhZ05hbWUsIG5vZGVLaW5kKVxuICB9XG59XG5cbi8vIEEgbWVyZ2Ugc291cmNlIG11c3QgYmUgYSBtYXBwaW5nOyBldmVyeSBtYXBwaW5nIHRhZyBleHBvc2VzIHRoZSByZWFkIHNpZGUuXG5mdW5jdGlvbiBpc01hcHBpbmdUYWcgKHRhZzogQW55VGFnKTogdGFnIGlzIE1hcHBpbmdUYWdEZWZpbml0aW9uPGFueSwgYW55PiB7XG4gIHJldHVybiB0YWcubm9kZUtpbmQgPT09ICdtYXBwaW5nJ1xufVxuXG4vLyBGb2xkIHRoZSBrZXlzIG9mIG9uZSBtYXBwaW5nIHNvdXJjZSBpbnRvIHRoZSB0YXJnZXQgZnJhbWUsIGhvbm9yaW5nIG1lcmdlXG4vLyBwcmVjZWRlbmNlOiBhbiBhbHJlYWR5LXByZXNlbnQga2V5IChleHBsaWNpdCBvciBmcm9tIGFuIGVhcmxpZXIgc291cmNlKSB3aW5zLlxuZnVuY3Rpb24gbWVyZ2VLZXlzIChzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSwgZnJhbWU6IE1hcHBpbmdGcmFtZSwgc291cmNlOiB1bmtub3duLCBzb3VyY2VUYWc6IE1hcHBpbmdUYWdEZWZpbml0aW9uPGFueSwgYW55Pikge1xuICBmb3IgKGNvbnN0IHNvdXJjZUtleSBvZiBzb3VyY2VUYWcua2V5cyhzb3VyY2UpKSB7XG4gICAgaWYgKHN0YXRlLm1heFRvdGFsTWVyZ2VLZXlzICE9PSAtMSAmJiArK3N0YXRlLnRvdGFsTWVyZ2VLZXlzID4gc3RhdGUubWF4VG90YWxNZXJnZUtleXMpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsIGBtZXJnZSBrZXlzIGV4Y2VlZGVkIG1heFRvdGFsTWVyZ2VLZXlzICgke3N0YXRlLm1heFRvdGFsTWVyZ2VLZXlzfSlgKVxuICAgIH1cblxuICAgIGlmIChmcmFtZS50YWcuaGFzKGZyYW1lLnZhbHVlLCBzb3VyY2VLZXkpKSBjb250aW51ZVxuXG4gICAgY29uc3QgZXJyID0gZnJhbWUudGFnLmFkZFBhaXIoZnJhbWUudmFsdWUsIHNvdXJjZUtleSwgc291cmNlVGFnLmdldChzb3VyY2UsIHNvdXJjZUtleSkpXG4gICAgaWYgKGVycikgdGhyb3dFcnJvcihzdGF0ZSwgZXJyKVxuICAgIDsoZnJhbWUub3ZlcnJpZGFibGUgPz89IG5ldyBTZXQoKSkuYWRkKHNvdXJjZUtleSlcbiAgfVxufVxuXG4vLyBUaGUgdmFsdWUgb2YgYSBgPDxgIGtleTogZWl0aGVyIGEgbWFwcGluZyAoZm9sZCBpdHMga2V5cykgb3IgYSBzZXF1ZW5jZSBvZlxuLy8gbWFwcGluZ3MgKGZvbGQgZWFjaCkuIEEgbWVyZ2Ugc2VxdWVuY2UgaGFzIGFscmVhZHkgaGFkIGV2ZXJ5IGVsZW1lbnQgdmFsaWRhdGVkXG4vLyBhcyBhIG1hcHBpbmcgb24gYXJyaXZhbCAoc2VlIGFkZFZhbHVlKSwgYW5kIGl0cyBlbGVtZW50cyB3ZXJlIGJ1aWx0IGJ5IHRoZVxuLy8gdGFyZ2V0J3Mgb3duIG1hcHBpbmcgdGFnLCBzbyB0aGV5IGFyZSByZWFkIGJhY2sgd2l0aCBpdC5cbmZ1bmN0aW9uIG1lcmdlU291cmNlIChzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSwgZnJhbWU6IE1hcHBpbmdGcmFtZSwgc291cmNlOiB1bmtub3duLCBzb3VyY2VUYWc6IEFueVRhZykge1xuICBzdGF0ZS5wb3NpdGlvbiA9IGZyYW1lLmtleVBvc2l0aW9uXG5cbiAgaWYgKGlzTWFwcGluZ1RhZyhzb3VyY2VUYWcpKSB7XG4gICAgbWVyZ2VLZXlzKHN0YXRlLCBmcmFtZSwgc291cmNlLCBzb3VyY2VUYWcpXG4gIH0gZWxzZSBpZiAoc291cmNlVGFnLm5vZGVLaW5kID09PSAnc2VxdWVuY2UnICYmIEFycmF5LmlzQXJyYXkoc291cmNlKSkge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzb3VyY2UpIHtcbiAgICAgIG1lcmdlS2V5cyhzdGF0ZSwgZnJhbWUsIGVsZW1lbnQsIGZyYW1lLnRhZylcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2Nhbm5vdCBtZXJnZSBtYXBwaW5nczsgdGhlIHByb3ZpZGVkIHNvdXJjZSBvYmplY3QgaXMgdW5hY2NlcHRhYmxlJylcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRNYXBwaW5nVmFsdWUgKHN0YXRlOiBDb25zdHJ1Y3RvclN0YXRlLCBmcmFtZTogTWFwcGluZ0ZyYW1lLCBrZXk6IHVua25vd24sIHZhbHVlOiB1bmtub3duLCB0YWc6IEFueVRhZykge1xuICBzdGF0ZS5wb3NpdGlvbiA9IGZyYW1lLmtleVBvc2l0aW9uXG5cbiAgLy8gYDw8YCBpcyBpbnRlcmNlcHRlZCBiZWZvcmUgZGVkdXAsIHNvIGEgcmVwZWF0ZWQgbWVyZ2Uga2V5IGlzIGFsbG93ZWQuXG4gIGlmIChrZXkgPT09IE1FUkdFX0tFWSkge1xuICAgIG1lcmdlU291cmNlKHN0YXRlLCBmcmFtZSwgdmFsdWUsIHRhZylcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmICghc3RhdGUuanNvbiAmJiBmcmFtZS50YWcuaGFzKGZyYW1lLnZhbHVlLCBrZXkpICYmICFmcmFtZS5vdmVycmlkYWJsZT8uaGFzKGtleSkpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZHVwbGljYXRlZCBtYXBwaW5nIGtleScpXG4gIH1cblxuICBjb25zdCBlcnIgPSBmcmFtZS50YWcuYWRkUGFpcihmcmFtZS52YWx1ZSwga2V5LCB2YWx1ZSlcbiAgaWYgKGVycikgdGhyb3dFcnJvcihzdGF0ZSwgZXJyKVxuICBmcmFtZS5vdmVycmlkYWJsZT8uZGVsZXRlKGtleSlcbn1cblxuZnVuY3Rpb24gYWRkVmFsdWUgKHN0YXRlOiBDb25zdHJ1Y3RvclN0YXRlLCB2YWx1ZTogdW5rbm93biwgdGFnOiBBbnlUYWcpIHtcbiAgY29uc3QgZnJhbWUgPSBzdGF0ZS5mcmFtZXNbc3RhdGUuZnJhbWVzLmxlbmd0aCAtIDFdIVxuXG4gIGlmIChmcmFtZS5raW5kID09PSAnZG9jdW1lbnQnKSB7XG4gICAgZnJhbWUudmFsdWUgPSB2YWx1ZVxuICAgIGZyYW1lLmhhc1ZhbHVlID0gdHJ1ZVxuICB9IGVsc2UgaWYgKGZyYW1lLmtpbmQgPT09ICdzZXF1ZW5jZScpIHtcbiAgICBpZiAoZnJhbWUubWVyZ2UpIHtcbiAgICAgIC8vIEVsZW1lbnQgb2YgYSBgPDw6IFsuLi5dYCBsaXN0OiB2YWxpZGF0ZSBpdCBpcyBhIG1hcHBpbmcsIHRoZW4gY29sbGVjdFxuICAgICAgLy8gaXQgbGlrZSBhbnkgb3RoZXIgaXRlbSBmb3IgdGhlIHRhcmdldCB0byBmb2xkIGluLlxuICAgICAgaWYgKCFpc01hcHBpbmdUYWcodGFnKSkge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnY2Fubm90IG1lcmdlIG1hcHBpbmdzOyB0aGUgcHJvdmlkZWQgc291cmNlIG9iamVjdCBpcyB1bmFjY2VwdGFibGUnKVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBlcnIgPSBmcmFtZS50YWcuYWRkSXRlbShmcmFtZS52YWx1ZSwgdmFsdWUsIGZyYW1lLmluZGV4KyspXG4gICAgaWYgKGVycikgdGhyb3dFcnJvcihzdGF0ZSwgZXJyKVxuICB9IGVsc2UgaWYgKGZyYW1lLmhhc0tleSkge1xuICAgIGNvbnN0IGtleSA9IGZyYW1lLmtleVxuICAgIGZyYW1lLmtleSA9IHVuZGVmaW5lZFxuICAgIGZyYW1lLmhhc0tleSA9IGZhbHNlXG4gICAgYWRkTWFwcGluZ1ZhbHVlKHN0YXRlLCBmcmFtZSwga2V5LCB2YWx1ZSwgdGFnKVxuICB9IGVsc2Uge1xuICAgIGZyYW1lLmtleSA9IHZhbHVlXG4gICAgZnJhbWUua2V5UG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvblxuICAgIGZyYW1lLmhhc0tleSA9IHRydWVcbiAgfVxufVxuXG5mdW5jdGlvbiBzdG9yZUFuY2hvciAoXG4gIHN0YXRlOiBDb25zdHJ1Y3RvclN0YXRlLFxuICBldmVudDogU2NhbGFyRXZlbnQgfCBTZXF1ZW5jZUV2ZW50IHwgTWFwcGluZ0V2ZW50LFxuICB2YWx1ZTogdW5rbm93bixcbiAgdGFnOiBBbnlUYWcsXG4gIGlzVmFsdWVGaW5hbDogYm9vbGVhblxuKTogQW5jaG9yIHwgbnVsbCB7XG4gIGlmIChldmVudC5hbmNob3JTdGFydCAhPT0gTk9fUkFOR0UpIHtcbiAgICBjb25zdCBhbmNob3IgPSB7XG4gICAgICB2YWx1ZSxcbiAgICAgIHRhZyxcbiAgICAgIGlzVmFsdWVGaW5hbFxuICAgIH1cbiAgICBzdGF0ZS5hbmNob3JzLnNldChzdGF0ZS5zb3VyY2Uuc2xpY2UoZXZlbnQuYW5jaG9yU3RhcnQsIGV2ZW50LmFuY2hvckVuZCksIGFuY2hvcilcbiAgICByZXR1cm4gYW5jaG9yXG4gIH1cblxuICByZXR1cm4gbnVsbFxufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RGcm9tRXZlbnRzIChldmVudHM6IEV2ZW50W10sIG9wdGlvbnM6IENvbnN0cnVjdG9yT3B0aW9ucyk6IHVua25vd25bXSB7XG4gIGNvbnN0IHN0YXRlOiBDb25zdHJ1Y3RvclN0YXRlID0ge1xuICAgIC4uLkRFRkFVTFRfQ09OU1RSVUNUT1JfT1BUSU9OUyxcbiAgICAuLi5vcHRpb25zLFxuICAgIGV2ZW50cyxcbiAgICBkb2N1bWVudHM6IFtdLFxuICAgIGV2ZW50SW5kZXg6IDAsXG4gICAgcG9zaXRpb246IDAsXG4gICAgZnJhbWVzOiBbXSxcbiAgICBhbmNob3JzOiBuZXcgTWFwKCksXG4gICAgdGFnSGFuZGxlcnM6IE9iamVjdC5jcmVhdGUobnVsbCksXG4gICAgdG90YWxNZXJnZUtleXM6IDAsXG4gICAgYWxpYXNDb3VudDogMFxuICB9XG5cbiAgd2hpbGUgKHN0YXRlLmV2ZW50SW5kZXggPCBzdGF0ZS5ldmVudHMubGVuZ3RoKSB7XG4gICAgY29uc3QgZXZlbnQgPSBzdGF0ZS5ldmVudHNbc3RhdGUuZXZlbnRJbmRleCsrXVxuICAgIHN0YXRlLnBvc2l0aW9uID0gZXZlbnRQb3NpdGlvbihldmVudClcblxuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgICAgY2FzZSBFVkVOVF9ET0NVTUVOVDpcbiAgICAgICAgc3RhdGUuYW5jaG9ycyA9IG5ldyBNYXAoKVxuICAgICAgICBzdGF0ZS5hbGlhc0NvdW50ID0gMFxuICAgICAgICBzdGF0ZS50YWdIYW5kbGVycyA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgICAgICAgZm9yIChjb25zdCBkaXJlY3RpdmUgb2YgZXZlbnQuZGlyZWN0aXZlcykge1xuICAgICAgICAgIGlmIChkaXJlY3RpdmUua2luZCA9PT0gJ3RhZycpIHN0YXRlLnRhZ0hhbmRsZXJzW2RpcmVjdGl2ZS5oYW5kbGVdID0gZGlyZWN0aXZlLnByZWZpeFxuICAgICAgICB9XG4gICAgICAgIHN0YXRlLmZyYW1lcy5wdXNoKHsga2luZDogJ2RvY3VtZW50JywgcG9zaXRpb246IHN0YXRlLnBvc2l0aW9uLCB2YWx1ZTogdW5kZWZpbmVkLCBoYXNWYWx1ZTogZmFsc2UgfSlcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSBFVkVOVF9TQ0FMQVI6IHtcbiAgICAgICAgY29uc3QgeyB2YWx1ZSwgdGFnIH0gPSBjb25zdHJ1Y3RTY2FsYXIoc3RhdGUsIGV2ZW50KVxuICAgICAgICBzdG9yZUFuY2hvcihzdGF0ZSwgZXZlbnQsIHZhbHVlLCB0YWcsIHRydWUpXG4gICAgICAgIGFkZFZhbHVlKHN0YXRlLCB2YWx1ZSwgdGFnKVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjYXNlIEVWRU5UX1NFUVVFTkNFOiB7XG4gICAgICAgIGNvbnN0IGRlZmluaXRpb24gPSBjb2xsZWN0aW9uVGFnKFxuICAgICAgICAgIHN0YXRlLFxuICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgIHN0YXRlLnNjaGVtYS5leGFjdC5zZXF1ZW5jZSxcbiAgICAgICAgICBzdGF0ZS5zY2hlbWEucHJlZml4LnNlcXVlbmNlLFxuICAgICAgICAgICd0YWc6eWFtbC5vcmcsMjAwMjpzZXEnLFxuICAgICAgICAgICdzZXF1ZW5jZSdcbiAgICAgICAgKVxuICAgICAgICBjb25zdCB2YWx1ZSA9IGRlZmluaXRpb24udGFnLmNyZWF0ZShkZWZpbml0aW9uLnRhZ05hbWUpXG4gICAgICAgIGNvbnN0IGFuY2hvciA9IHN0b3JlQW5jaG9yKHN0YXRlLCBldmVudCwgdmFsdWUsIGRlZmluaXRpb24udGFnLCBkZWZpbml0aW9uLnRhZy5jYXJyaWVySXNSZXN1bHQpXG5cbiAgICAgICAgLy8gYDw8OiBbLi4uXWAg4oCUIHRoZSBwYXJlbnQgbWFwcGluZyBpcyB3YWl0aW5nIG9uIGEgbWVyZ2Uga2V5LCBzbyB0aGlzXG4gICAgICAgIC8vIHNlcXVlbmNlIGlzIGEgbGlzdCBvZiBtZXJnZSBzb3VyY2VzOiBpdHMgZWxlbWVudHMgbXVzdCBiZSBtYXBwaW5ncy5cbiAgICAgICAgLy8gSXQgaXMgc3RpbGwgYnVpbHQgYW5kIGRlbGl2ZXJlZCBhcyBhIG5vcm1hbCB2YWx1ZTsgdGhlIHRhcmdldCBmb2xkcyBpdC5cbiAgICAgICAgY29uc3QgcGFyZW50ID0gc3RhdGUuZnJhbWVzW3N0YXRlLmZyYW1lcy5sZW5ndGggLSAxXVxuICAgICAgICBjb25zdCBtZXJnZSA9IHBhcmVudCAhPT0gdW5kZWZpbmVkICYmIHBhcmVudC5raW5kID09PSAnbWFwcGluZycgJiZcbiAgICAgICAgICBwYXJlbnQuaGFzS2V5ICYmIHBhcmVudC5rZXkgPT09IE1FUkdFX0tFWVxuXG4gICAgICAgIHN0YXRlLmZyYW1lcy5wdXNoKHtcbiAgICAgICAgICBraW5kOiAnc2VxdWVuY2UnLCBwb3NpdGlvbjogc3RhdGUucG9zaXRpb24sIHZhbHVlLCB0YWc6IGRlZmluaXRpb24udGFnLCBhbmNob3IsIGluZGV4OiAwLCBtZXJnZVxuICAgICAgICB9KVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjYXNlIEVWRU5UX01BUFBJTkc6IHtcbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGNvbGxlY3Rpb25UYWcoXG4gICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgc3RhdGUuc2NoZW1hLmV4YWN0Lm1hcHBpbmcsXG4gICAgICAgICAgc3RhdGUuc2NoZW1hLnByZWZpeC5tYXBwaW5nLFxuICAgICAgICAgICd0YWc6eWFtbC5vcmcsMjAwMjptYXAnLFxuICAgICAgICAgICdtYXBwaW5nJ1xuICAgICAgICApXG4gICAgICAgIGNvbnN0IHZhbHVlID0gZGVmaW5pdGlvbi50YWcuY3JlYXRlKGRlZmluaXRpb24udGFnTmFtZSlcbiAgICAgICAgY29uc3QgYW5jaG9yID0gc3RvcmVBbmNob3Ioc3RhdGUsIGV2ZW50LCB2YWx1ZSwgZGVmaW5pdGlvbi50YWcsIGRlZmluaXRpb24udGFnLmNhcnJpZXJJc1Jlc3VsdClcbiAgICAgICAgc3RhdGUuZnJhbWVzLnB1c2goe1xuICAgICAgICAgIGtpbmQ6ICdtYXBwaW5nJyxcbiAgICAgICAgICBwb3NpdGlvbjogc3RhdGUucG9zaXRpb24sXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgdGFnOiBkZWZpbml0aW9uLnRhZyxcbiAgICAgICAgICBhbmNob3IsXG4gICAgICAgICAga2V5OiB1bmRlZmluZWQsXG4gICAgICAgICAga2V5UG9zaXRpb246IHN0YXRlLnBvc2l0aW9uLFxuICAgICAgICAgIGhhc0tleTogZmFsc2UsXG4gICAgICAgICAgb3ZlcnJpZGFibGU6IG51bGxcbiAgICAgICAgfSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgY2FzZSBFVkVOVF9BTElBUzoge1xuICAgICAgICBpZiAoc3RhdGUubWF4QWxpYXNlcyAhPT0gLTEgJiYgKytzdGF0ZS5hbGlhc0NvdW50ID4gc3RhdGUubWF4QWxpYXNlcykge1xuICAgICAgICAgIHRocm93RXJyb3Ioc3RhdGUsIGBhbGlhc2VzIGV4Y2VlZGVkIG1heEFsaWFzZXMgKCR7c3RhdGUubWF4QWxpYXNlc30pYClcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5hbWUgPSBzdGF0ZS5zb3VyY2Uuc2xpY2UoZXZlbnQuYW5jaG9yU3RhcnQsIGV2ZW50LmFuY2hvckVuZClcbiAgICAgICAgY29uc3QgYW5jaG9yID0gc3RhdGUuYW5jaG9ycy5nZXQobmFtZSlcbiAgICAgICAgaWYgKCFhbmNob3IpIHtcbiAgICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCBgdW5pZGVudGlmaWVkIGFsaWFzIFwiJHtuYW1lfVwiYClcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWFuY2hvci5pc1ZhbHVlRmluYWwpIHtcbiAgICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCBgcmVjdXJzaXZlIGFsaWFzIFwiJHtuYW1lfVwiIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIHRhZyAke2FuY2hvci50YWcudGFnTmFtZX0gYmVjYXVzZSBpdCB1c2VzIGZpbmFsaXplKClgKVxuICAgICAgICB9XG4gICAgICAgIGFkZFZhbHVlKHN0YXRlLCBhbmNob3IudmFsdWUsIGFuY2hvci50YWcpXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGNhc2UgRVZFTlRfUE9QOiB7XG4gICAgICAgIGNvbnN0IGZyYW1lID0gc3RhdGUuZnJhbWVzLnBvcCgpIVxuXG4gICAgICAgIGlmIChmcmFtZS5raW5kID09PSAnZG9jdW1lbnQnKSB7XG4gICAgICAgICAgc3RhdGUuZG9jdW1lbnRzLnB1c2goZnJhbWUudmFsdWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBmcmFtZS50YWcuY2FycmllcklzUmVzdWx0XG4gICAgICAgICAgICA/IGZyYW1lLnZhbHVlXG4gICAgICAgICAgICA6IGZpbmFsaXplQ29sbGVjdGlvbihzdGF0ZSwgZnJhbWUucG9zaXRpb24sIGZyYW1lLnRhZywgZnJhbWUudmFsdWUpXG4gICAgICAgICAgaWYgKGZyYW1lLmFuY2hvcikge1xuICAgICAgICAgICAgZnJhbWUuYW5jaG9yLnZhbHVlID0gdmFsdWVcbiAgICAgICAgICAgIGZyYW1lLmFuY2hvci5pc1ZhbHVlRmluYWwgPSB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICAgIGFkZFZhbHVlKHN0YXRlLCB2YWx1ZSwgZnJhbWUudGFnKVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0YXRlLmRvY3VtZW50c1xufVxuXG5leHBvcnQge1xuICBjb25zdHJ1Y3RGcm9tRXZlbnRzLFxuICBERUZBVUxUX0NPTlNUUlVDVE9SX09QVElPTlMsXG4gIHR5cGUgQ29uc3RydWN0b3JPcHRpb25zXG59XG4iLCAiaW1wb3J0IHtcbiAgRVZFTlRfRE9DVU1FTlQsXG4gIEVWRU5UX1NFUVVFTkNFLFxuICBFVkVOVF9NQVBQSU5HLFxuICBFVkVOVF9TQ0FMQVIsXG4gIEVWRU5UX0FMSUFTLFxuICBFVkVOVF9QT1AsXG4gIFNDQUxBUl9TVFlMRV9QTEFJTixcbiAgU0NBTEFSX1NUWUxFX1NJTkdMRV9RVU9URUQsXG4gIFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVELFxuICBTQ0FMQVJfU1RZTEVfTElURVJBTF9CTE9DSyxcbiAgU0NBTEFSX1NUWUxFX0ZPTERFRF9CTE9DSyxcbiAgQ09MTEVDVElPTl9TVFlMRV9CTE9DSyxcbiAgQ09MTEVDVElPTl9TVFlMRV9GTE9XLFxuICBDSE9NUElOR19DTElQLFxuICBDSE9NUElOR19TVFJJUCxcbiAgQ0hPTVBJTkdfS0VFUCxcbiAgdHlwZSBFdmVudCxcbiAgdHlwZSBTY2FsYXJTdHlsZSxcbiAgdHlwZSBDb2xsZWN0aW9uU3R5bGUsXG4gIHR5cGUgQ2hvbXBpbmcsXG4gIHR5cGUgRG9jdW1lbnREaXJlY3RpdmUsXG4gIHR5cGUgVGFnSGFuZGxlcnNcbn0gZnJvbSAnLi9ldmVudHMudHMnXG5pbXBvcnQgeyB0aHJvd0Vycm9yQXQgfSBmcm9tICcuLi9jb21tb24vZXhjZXB0aW9uLnRzJ1xuXG5jb25zdCBOT19SQU5HRSA9IC0xXG5jb25zdCBIQVNfT1dOID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuXG5jb25zdCBDT05URVhUX0ZMT1dfSU4gPSAxXG5jb25zdCBDT05URVhUX0ZMT1dfT1VUID0gMlxuY29uc3QgQ09OVEVYVF9CTE9DS19JTiA9IDNcbmNvbnN0IENPTlRFWFRfQkxPQ0tfT1VUID0gNFxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29udHJvbC1yZWdleFxuY29uc3QgUEFUVEVSTl9OT05fUFJJTlRBQkxFID0gL1tcXHgwMC1cXHgwOFxceDBCXFx4MENcXHgwRS1cXHgxRlxceDdGLVxceDg0XFx4ODYtXFx4OUZcXHVGRkZFXFx1RkZGRl18W1xcdUQ4MDAtXFx1REJGRl0oPyFbXFx1REMwMC1cXHVERkZGXSl8KD86W15cXHVEODAwLVxcdURCRkZdfF4pW1xcdURDMDAtXFx1REZGRl0vXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlbGVzcy1lc2NhcGVcbmNvbnN0IFBBVFRFUk5fRkxPV19JTkRJQ0FUT1JTID0gL1ssXFxbXFxde31dL1xuLy8gWUFNTCAxLjIuMiwgWzkxXSBjLXRhZy1oYW5kbGUuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlbGVzcy1lc2NhcGVcbmNvbnN0IFBBVFRFUk5fVEFHX0hBTkRMRSA9IC9eKD86IXwhIXwhWzAtOUEtWmEtei1dKyEpJC9cbi8vIFlBTUwgMS4yLjIsIFszOV0gbnMtdXJpLWNoYXIuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlbGVzcy1lc2NhcGVcbmNvbnN0IE5TX1VSSV9DSEFSID0gU3RyaW5nLnJhd2AoPzolWzAtOUEtRmEtZl17Mn18WzAtOUEtWmEtelxcLSM7Lz86QCY9KyQsXy4hfionKClcXFtcXF1dKWBcbi8vIFlBTUwgMS4yLjIsIFs0MF0gbnMtdGFnLWNoYXIgPSBucy11cmktY2hhciAtIFwiIVwiIC0gYy1mbG93LWluZGljYXRvci5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2VsZXNzLWVzY2FwZVxuY29uc3QgTlNfVEFHX0NIQVIgPSBTdHJpbmcucmF3YCg/OiVbMC05QS1GYS1mXXsyfXxbMC05QS1aYS16XFwtIzsvPzpAJj0rJC5+KicoKV9dKWBcbmNvbnN0IFBBVFRFUk5fVEFHX1VSSSA9IG5ldyBSZWdFeHAoYF4oPzoke05TX1VSSV9DSEFSfSkqJGApXG4vLyBZQU1MIDEuMi4yLCBbOTldIGMtbnMtc2hvcnRoYW5kLXRhZyBzdWZmaXggcGFydC5cbmNvbnN0IFBBVFRFUk5fVEFHX1NVRkZJWCA9IG5ldyBSZWdFeHAoYF4oPzoke05TX1RBR19DSEFSfSkrJGApXG4vLyBZQU1MIDEuMi4yLCBbOTNdIG5zLXRhZy1wcmVmaXguXG5jb25zdCBQQVRURVJOX1RBR19QUkVGSVggPSBuZXcgUmVnRXhwKGBeKD86ISg/OiR7TlNfVVJJX0NIQVJ9KSp8JHtOU19UQUdfQ0hBUn0oPzoke05TX1VSSV9DSEFSfSkqKSRgKVxuXG50eXBlIE5vZGVDb250ZXh0ID1cbiAgdHlwZW9mIENPTlRFWFRfRkxPV19JTiB8IHR5cGVvZiBDT05URVhUX0ZMT1dfT1VUIHxcbiAgdHlwZW9mIENPTlRFWFRfQkxPQ0tfSU4gfCB0eXBlb2YgQ09OVEVYVF9CTE9DS19PVVRcblxuaW50ZXJmYWNlIE5vZGVQcm9wZXJ0aWVzIHtcbiAgYW5jaG9yU3RhcnQ6IG51bWJlclxuICBhbmNob3JFbmQ6IG51bWJlclxuICB0YWdTdGFydDogbnVtYmVyXG4gIHRhZ0VuZDogbnVtYmVyXG59XG5cbmludGVyZmFjZSBQYXJzZXJTbmFwc2hvdCB7XG4gIHBvc2l0aW9uOiBudW1iZXJcbiAgbGluZTogbnVtYmVyXG4gIGxpbmVTdGFydDogbnVtYmVyXG4gIGxpbmVJbmRlbnQ6IG51bWJlclxuICBmaXJzdFRhYkluTGluZTogbnVtYmVyXG4gIGV2ZW50c0xlbmd0aDogbnVtYmVyXG59XG5cbmludGVyZmFjZSBQYXJzZXJPcHRpb25zIHtcbiAgZmlsZW5hbWU/OiBzdHJpbmdcbiAgbWF4RGVwdGg/OiBudW1iZXJcbn1cblxuY29uc3QgREVGQVVMVF9QQVJTRVJfT1BUSU9OUzogUmVxdWlyZWQ8UGFyc2VyT3B0aW9ucz4gPSB7XG4gIGZpbGVuYW1lOiAnJyxcbiAgbWF4RGVwdGg6IDEwMFxufVxuXG5pbnRlcmZhY2UgUGFyc2VyU3RhdGUgZXh0ZW5kcyBSZXF1aXJlZDxQYXJzZXJPcHRpb25zPiB7XG4gIGlucHV0OiBzdHJpbmdcbiAgbGVuZ3RoOiBudW1iZXJcbiAgcG9zaXRpb246IG51bWJlclxuICBsaW5lOiBudW1iZXJcbiAgbGluZVN0YXJ0OiBudW1iZXJcbiAgbGluZUluZGVudDogbnVtYmVyXG4gIGZpcnN0VGFiSW5MaW5lOiBudW1iZXJcbiAgZGVwdGg6IG51bWJlclxuICBkaXJlY3RpdmVzOiBEb2N1bWVudERpcmVjdGl2ZVtdXG4gIHRhZ0hhbmRsZXJzOiBUYWdIYW5kbGVyc1xuICBldmVudHM6IEV2ZW50W11cbn1cblxuZnVuY3Rpb24gYWRkRG9jdW1lbnRFdmVudCAoXG4gIHN0YXRlOiBQYXJzZXJTdGF0ZSxcbiAgZXhwbGljaXRTdGFydDogYm9vbGVhbixcbiAgZXhwbGljaXRFbmQ6IGJvb2xlYW5cbikge1xuICBzdGF0ZS5ldmVudHMucHVzaCh7XG4gICAgdHlwZTogRVZFTlRfRE9DVU1FTlQsXG4gICAgZXhwbGljaXRTdGFydCxcbiAgICBleHBsaWNpdEVuZCxcbiAgICBkaXJlY3RpdmVzOiBzdGF0ZS5kaXJlY3RpdmVzXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGFkZFNlcXVlbmNlRXZlbnQgKFxuICBzdGF0ZTogUGFyc2VyU3RhdGUsXG4gIHN0YXJ0OiBudW1iZXIsXG4gIGFuY2hvclN0YXJ0OiBudW1iZXIsXG4gIGFuY2hvckVuZDogbnVtYmVyLFxuICB0YWdTdGFydDogbnVtYmVyLFxuICB0YWdFbmQ6IG51bWJlcixcbiAgc3R5bGU6IENvbGxlY3Rpb25TdHlsZVxuKSB7XG4gIHN0YXRlLmV2ZW50cy5wdXNoKHtcbiAgICB0eXBlOiBFVkVOVF9TRVFVRU5DRSxcbiAgICBzdGFydCxcbiAgICBhbmNob3JTdGFydCxcbiAgICBhbmNob3JFbmQsXG4gICAgdGFnU3RhcnQsXG4gICAgdGFnRW5kLFxuICAgIHN0eWxlXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGFkZE1hcHBpbmdFdmVudCAoXG4gIHN0YXRlOiBQYXJzZXJTdGF0ZSxcbiAgc3RhcnQ6IG51bWJlcixcbiAgYW5jaG9yU3RhcnQ6IG51bWJlcixcbiAgYW5jaG9yRW5kOiBudW1iZXIsXG4gIHRhZ1N0YXJ0OiBudW1iZXIsXG4gIHRhZ0VuZDogbnVtYmVyLFxuICBzdHlsZTogQ29sbGVjdGlvblN0eWxlXG4pIHtcbiAgc3RhdGUuZXZlbnRzLnB1c2goe1xuICAgIHR5cGU6IEVWRU5UX01BUFBJTkcsXG4gICAgc3RhcnQsXG4gICAgYW5jaG9yU3RhcnQsXG4gICAgYW5jaG9yRW5kLFxuICAgIHRhZ1N0YXJ0LFxuICAgIHRhZ0VuZCxcbiAgICBzdHlsZVxuICB9KVxufVxuXG5mdW5jdGlvbiBhZGRTY2FsYXJFdmVudCAoXG4gIHN0YXRlOiBQYXJzZXJTdGF0ZSxcbiAgdmFsdWVTdGFydDogbnVtYmVyLFxuICB2YWx1ZUVuZDogbnVtYmVyLFxuICBhbmNob3JTdGFydDogbnVtYmVyLFxuICBhbmNob3JFbmQ6IG51bWJlcixcbiAgdGFnU3RhcnQ6IG51bWJlcixcbiAgdGFnRW5kOiBudW1iZXIsXG4gIHN0eWxlOiBTY2FsYXJTdHlsZSxcbiAgY2hvbXBpbmc6IENob21waW5nID0gQ0hPTVBJTkdfQ0xJUCxcbiAgaW5kZW50ID0gLTEsXG4gIGZhc3QgPSBmYWxzZVxuKSB7XG4gIHN0YXRlLmV2ZW50cy5wdXNoKHtcbiAgICB0eXBlOiBFVkVOVF9TQ0FMQVIsXG4gICAgdmFsdWVTdGFydCxcbiAgICB2YWx1ZUVuZCxcbiAgICBhbmNob3JTdGFydCxcbiAgICBhbmNob3JFbmQsXG4gICAgdGFnU3RhcnQsXG4gICAgdGFnRW5kLFxuICAgIHN0eWxlLFxuICAgIGNob21waW5nLFxuICAgIGluZGVudCxcbiAgICBmYXN0XG4gIH0pXG59XG5cbmZ1bmN0aW9uIGFkZEFsaWFzRXZlbnQgKFxuICBzdGF0ZTogUGFyc2VyU3RhdGUsXG4gIGFuY2hvclN0YXJ0OiBudW1iZXIsXG4gIGFuY2hvckVuZDogbnVtYmVyXG4pIHtcbiAgc3RhdGUuZXZlbnRzLnB1c2goe1xuICAgIHR5cGU6IEVWRU5UX0FMSUFTLFxuICAgIGFuY2hvclN0YXJ0LFxuICAgIGFuY2hvckVuZFxuICB9KVxufVxuXG5mdW5jdGlvbiBhZGRQb3BFdmVudCAoc3RhdGU6IFBhcnNlclN0YXRlKSB7XG4gIHN0YXRlLmV2ZW50cy5wdXNoKHsgdHlwZTogRVZFTlRfUE9QIH0pXG59XG5cbmZ1bmN0aW9uIGFkZEVtcHR5U2NhbGFyRXZlbnQgKHN0YXRlOiBQYXJzZXJTdGF0ZSkge1xuICBhZGRTY2FsYXJFdmVudChcbiAgICBzdGF0ZSxcbiAgICBOT19SQU5HRSxcbiAgICBOT19SQU5HRSxcbiAgICBOT19SQU5HRSxcbiAgICBOT19SQU5HRSxcbiAgICBOT19SQU5HRSxcbiAgICBOT19SQU5HRSxcbiAgICBTQ0FMQVJfU1RZTEVfUExBSU5cbiAgKVxufVxuXG5mdW5jdGlvbiBlbXB0eVByb3BlcnRpZXMgKCk6IE5vZGVQcm9wZXJ0aWVzIHtcbiAgcmV0dXJuIHtcbiAgICBhbmNob3JTdGFydDogTk9fUkFOR0UsXG4gICAgYW5jaG9yRW5kOiBOT19SQU5HRSxcbiAgICB0YWdTdGFydDogTk9fUkFOR0UsXG4gICAgdGFnRW5kOiBOT19SQU5HRVxuICB9XG59XG5cbmZ1bmN0aW9uIHNuYXBzaG90U3RhdGUgKHN0YXRlOiBQYXJzZXJTdGF0ZSk6IFBhcnNlclNuYXBzaG90IHtcbiAgcmV0dXJuIHtcbiAgICBwb3NpdGlvbjogc3RhdGUucG9zaXRpb24sXG4gICAgbGluZTogc3RhdGUubGluZSxcbiAgICBsaW5lU3RhcnQ6IHN0YXRlLmxpbmVTdGFydCxcbiAgICBsaW5lSW5kZW50OiBzdGF0ZS5saW5lSW5kZW50LFxuICAgIGZpcnN0VGFiSW5MaW5lOiBzdGF0ZS5maXJzdFRhYkluTGluZSxcbiAgICBldmVudHNMZW5ndGg6IHN0YXRlLmV2ZW50cy5sZW5ndGhcbiAgfVxufVxuXG5mdW5jdGlvbiByZXN0b3JlU3RhdGUgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgc25hcHNob3Q6IFBhcnNlclNuYXBzaG90KSB7XG4gIHN0YXRlLnBvc2l0aW9uID0gc25hcHNob3QucG9zaXRpb25cbiAgc3RhdGUubGluZSA9IHNuYXBzaG90LmxpbmVcbiAgc3RhdGUubGluZVN0YXJ0ID0gc25hcHNob3QubGluZVN0YXJ0XG4gIHN0YXRlLmxpbmVJbmRlbnQgPSBzbmFwc2hvdC5saW5lSW5kZW50XG4gIHN0YXRlLmZpcnN0VGFiSW5MaW5lID0gc25hcHNob3QuZmlyc3RUYWJJbkxpbmVcbiAgc3RhdGUuZXZlbnRzLmxlbmd0aCA9IHNuYXBzaG90LmV2ZW50c0xlbmd0aFxufVxuXG5mdW5jdGlvbiB0aHJvd0Vycm9yIChzdGF0ZTogUGFyc2VyU3RhdGUsIG1lc3NhZ2U6IHN0cmluZyk6IG5ldmVyIHtcbiAgdGhyb3dFcnJvckF0KHN0YXRlLmlucHV0LnNsaWNlKDAsIHN0YXRlLmxlbmd0aCksIHN0YXRlLnBvc2l0aW9uLCBtZXNzYWdlLCBzdGF0ZS5maWxlbmFtZSlcbn1cblxuZnVuY3Rpb24gaXNFb2wgKGM6IG51bWJlcikge1xuICByZXR1cm4gYyA9PT0gMHgwQS8qIExGICovIHx8IGMgPT09IDB4MEQvKiBDUiAqL1xufVxuXG5mdW5jdGlvbiBpc1doaXRlU3BhY2UgKGM6IG51bWJlcikge1xuICByZXR1cm4gYyA9PT0gMHgwOS8qIFRhYiAqLyB8fCBjID09PSAweDIwLyogU3BhY2UgKi9cbn1cblxuZnVuY3Rpb24gaXNXc09yRW9sIChjOiBudW1iZXIpIHtcbiAgcmV0dXJuIGlzV2hpdGVTcGFjZShjKSB8fCBpc0VvbChjKVxufVxuXG5mdW5jdGlvbiBpc1dzT3JFb2xPckVuZCAoYzogbnVtYmVyKSB7XG4gIHJldHVybiBjID09PSAwIHx8IGlzV3NPckVvbChjKVxufVxuXG5mdW5jdGlvbiBpc0Zsb3dJbmRpY2F0b3IgKGM6IG51bWJlcikge1xuICByZXR1cm4gYyA9PT0gMHgyQy8qICwgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NUIvKiBbICovIHx8XG4gICAgICAgICBjID09PSAweDVELyogXSAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg3Qi8qIHsgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4N0QvKiB9ICovXG59XG5cbmZ1bmN0aW9uIGZyb21EZWNpbWFsQ29kZSAoYzogbnVtYmVyKSB7XG4gIHJldHVybiBjID49IDB4MzAvKiAwICovICYmIGMgPD0gMHgzOS8qIDkgKi8gPyBjIC0gMHgzMCA6IC0xXG59XG5cbmZ1bmN0aW9uIGZyb21IZXhDb2RlIChjOiBudW1iZXIpIHtcbiAgaWYgKGMgPj0gMHgzMC8qIDAgKi8gJiYgYyA8PSAweDM5LyogOSAqLykgcmV0dXJuIGMgLSAweDMwXG4gIGNvbnN0IGxjID0gYyB8IDB4MjBcbiAgaWYgKGxjID49IDB4NjEvKiBhICovICYmIGxjIDw9IDB4NjYvKiBmICovKSByZXR1cm4gbGMgLSAweDYxICsgMTBcbiAgcmV0dXJuIC0xXG59XG5cbmZ1bmN0aW9uIGVzY2FwZWRIZXhMZW4gKGM6IG51bWJlcikge1xuICBpZiAoYyA9PT0gMHg3OC8qIHggKi8pIHJldHVybiAyXG4gIGlmIChjID09PSAweDc1LyogdSAqLykgcmV0dXJuIDRcbiAgaWYgKGMgPT09IDB4NTUvKiBVICovKSByZXR1cm4gOFxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBpc1NpbXBsZUVzY2FwZSAoYzogbnVtYmVyKSB7XG4gIHJldHVybiBjID09PSAweDMwLyogMCAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg2MS8qIGEgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NjIvKiBiICovIHx8XG4gICAgICAgICBjID09PSAweDc0LyogdCAqLyB8fFxuICAgICAgICAgYyA9PT0gMHgwOS8qIFRhYiAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg2RS8qIG4gKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NzYvKiB2ICovIHx8XG4gICAgICAgICBjID09PSAweDY2LyogZiAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg3Mi8qIHIgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NjUvKiBlICovIHx8XG4gICAgICAgICBjID09PSAweDIwLyogU3BhY2UgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4MjIvKiBcIiAqLyB8fFxuICAgICAgICAgYyA9PT0gMHgyRi8qIC8gKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NUMvKiBcXCAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg0RS8qIE4gKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NUYvKiBfICovIHx8XG4gICAgICAgICBjID09PSAweDRDLyogTCAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg1MC8qIFAgKi9cbn1cblxuLy8gUHJlY29uZGl0aW9uOiBzdGF0ZS5wb3NpdGlvbiBwb2ludHMgYXQgTEYgb3IgQ1IuXG5mdW5jdGlvbiBjb25zdW1lTGluZUJyZWFrIChzdGF0ZTogUGFyc2VyU3RhdGUpIHtcbiAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gIGlmIChjaCA9PT0gMHgwQS8qIExGICovKSB7XG4gICAgc3RhdGUucG9zaXRpb24rK1xuICB9IGVsc2Uge1xuICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MEEvKiBMRiAqLykgc3RhdGUucG9zaXRpb24rK1xuICB9XG5cbiAgc3RhdGUubGluZSsrXG4gIHN0YXRlLmxpbmVTdGFydCA9IHN0YXRlLnBvc2l0aW9uXG4gIHN0YXRlLmxpbmVJbmRlbnQgPSAwXG4gIHN0YXRlLmZpcnN0VGFiSW5MaW5lID0gLTFcbn1cblxuZnVuY3Rpb24gc2tpcFNlcGFyYXRpb25TcGFjZSAoc3RhdGU6IFBhcnNlclN0YXRlLCBhbGxvd0NvbW1lbnRzOiBib29sZWFuKSB7XG4gIGxldCBsaW5lQnJlYWtzID0gMFxuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICBsZXQgaGFzU2VwYXJhdGlvbiA9IHN0YXRlLnBvc2l0aW9uID09PSBzdGF0ZS5saW5lU3RhcnQgfHxcbiAgICBpc1dzT3JFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiAtIDEpKVxuXG4gIHdoaWxlIChjaCAhPT0gMCkge1xuICAgIHdoaWxlIChpc1doaXRlU3BhY2UoY2gpKSB7XG4gICAgICBoYXNTZXBhcmF0aW9uID0gdHJ1ZVxuICAgICAgaWYgKGNoID09PSAweDA5LyogVGFiICovICYmIHN0YXRlLmZpcnN0VGFiSW5MaW5lID09PSAtMSkge1xuICAgICAgICBzdGF0ZS5maXJzdFRhYkluTGluZSA9IHN0YXRlLnBvc2l0aW9uXG4gICAgICB9XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgICB9XG5cbiAgICBpZiAoYWxsb3dDb21tZW50cyAmJiBoYXNTZXBhcmF0aW9uICYmIGNoID09PSAweDIzLyogIyAqLykge1xuICAgICAgZG8geyBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbikgfVxuICAgICAgd2hpbGUgKCFpc0VvbChjaCkgJiYgY2ggIT09IDApXG4gICAgfVxuXG4gICAgaWYgKCFpc0VvbChjaCkpIGJyZWFrXG5cbiAgICBjb25zdW1lTGluZUJyZWFrKHN0YXRlKVxuICAgIGxpbmVCcmVha3MrK1xuICAgIGhhc1NlcGFyYXRpb24gPSB0cnVlXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgd2hpbGUgKGNoID09PSAweDIwLyogU3BhY2UgKi8pIHtcbiAgICAgIHN0YXRlLmxpbmVJbmRlbnQrK1xuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGxpbmVCcmVha3Ncbn1cblxuZnVuY3Rpb24gdGVzdERvY3VtZW50U2VwYXJhdG9yIChzdGF0ZTogUGFyc2VyU3RhdGUsIHBvc2l0aW9uID0gc3RhdGUucG9zaXRpb24pIHtcbiAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKVxuXG4gIGlmICgoY2ggPT09IDB4MkQvKiAtICovIHx8IGNoID09PSAweDJFLyogLiAqLykgJiZcbiAgICAgIGNoID09PSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uICsgMSkgJiZcbiAgICAgIGNoID09PSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uICsgMikpIHtcbiAgICBjb25zdCBmb2xsb3dpbmcgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uICsgMylcbiAgICByZXR1cm4gZm9sbG93aW5nID09PSAwIHx8IGlzV3NPckVvbChmb2xsb3dpbmcpXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gc2tpcFVudGlsTGluZUVuZCAoc3RhdGU6IFBhcnNlclN0YXRlKSB7XG4gIGxldCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgd2hpbGUgKGNoICE9PSAwICYmICFpc0VvbChjaCkpIHtcbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja1ByaW50YWJsZSAoc3RhdGU6IFBhcnNlclN0YXRlLCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xuICBpZiAoUEFUVEVSTl9OT05fUFJJTlRBQkxFLnRlc3Qoc3RhdGUuaW5wdXQuc2xpY2Uoc3RhcnQsIGVuZCkpKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RoZSBzdHJlYW0gY29udGFpbnMgbm9uLXByaW50YWJsZSBjaGFyYWN0ZXJzJylcbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkVGFnUHJvcGVydHkgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgcHJvcHM6IE5vZGVQcm9wZXJ0aWVzLCBpbkZsb3c6IGJvb2xlYW4pIHtcbiAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAweDIxLyogISAqLykgcmV0dXJuIGZhbHNlXG4gIGlmIChwcm9wcy50YWdTdGFydCAhPT0gTk9fUkFOR0UpIHRocm93RXJyb3Ioc3RhdGUsICdkdXBsaWNhdGlvbiBvZiBhIHRhZyBwcm9wZXJ0eScpXG5cbiAgY29uc3Qgc3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICBsZXQgaXNWZXJiYXRpbSA9IGZhbHNlXG4gIGxldCBpc05hbWVkID0gZmFsc2VcbiAgbGV0IHRhZ0hhbmRsZSA9ICchJ1xuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG5cbiAgaWYgKGNoID09PSAweDNDLyogPCAqLykge1xuICAgIGlzVmVyYmF0aW0gPSB0cnVlXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gIH0gZWxzZSBpZiAoY2ggPT09IDB4MjEvKiAhICovKSB7XG4gICAgaXNOYW1lZCA9IHRydWVcbiAgICB0YWdIYW5kbGUgPSAnISEnXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gIH1cblxuICBsZXQgc3VmZml4U3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICBsZXQgdGFnTmFtZVxuXG4gIGlmIChpc1ZlcmJhdGltKSB7XG4gICAgd2hpbGUgKGNoICE9PSAwICYmIGNoICE9PSAweDNFLyogPiAqLykgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgaWYgKGNoICE9PSAweDNFLyogPiAqLykgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuZXhwZWN0ZWQgZW5kIG9mIHRoZSBzdHJlYW0gd2l0aGluIGEgdmVyYmF0aW0gdGFnJylcbiAgICB0YWdOYW1lID0gc3RhdGUuaW5wdXQuc2xpY2Uoc3VmZml4U3RhcnQsIHN0YXRlLnBvc2l0aW9uKVxuICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoY2ggIT09IDAgJiYgIWlzV3NPckVvbChjaCkgJiYgIShpbkZsb3cgJiYgaXNGbG93SW5kaWNhdG9yKGNoKSkpIHtcbiAgICAgIGlmIChjaCA9PT0gMHgyMS8qICEgKi8pIHtcbiAgICAgICAgaWYgKCFpc05hbWVkKSB7XG4gICAgICAgICAgdGFnSGFuZGxlID0gc3RhdGUuaW5wdXQuc2xpY2Uoc3VmZml4U3RhcnQgLSAxLCBzdGF0ZS5wb3NpdGlvbiArIDEpXG4gICAgICAgICAgaWYgKCFQQVRURVJOX1RBR19IQU5ETEUudGVzdCh0YWdIYW5kbGUpKSB0aHJvd0Vycm9yKHN0YXRlLCAnbmFtZWQgdGFnIGhhbmRsZSBjYW5ub3QgY29udGFpbiBzdWNoIGNoYXJhY3RlcnMnKVxuICAgICAgICAgIGlzTmFtZWQgPSB0cnVlXG4gICAgICAgICAgc3VmZml4U3RhcnQgPSBzdGF0ZS5wb3NpdGlvbiArIDFcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndGFnIHN1ZmZpeCBjYW5ub3QgY29udGFpbiBleGNsYW1hdGlvbiBtYXJrcycpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgfVxuXG4gICAgdGFnTmFtZSA9IHN0YXRlLmlucHV0LnNsaWNlKHN1ZmZpeFN0YXJ0LCBzdGF0ZS5wb3NpdGlvbilcbiAgICBpZiAoUEFUVEVSTl9GTE9XX0lORElDQVRPUlMudGVzdCh0YWdOYW1lKSkgdGhyb3dFcnJvcihzdGF0ZSwgJ3RhZyBzdWZmaXggY2Fubm90IGNvbnRhaW4gZmxvdyBpbmRpY2F0b3IgY2hhcmFjdGVycycpXG4gIH1cblxuICBpZiAodGFnTmFtZSAmJiAhKGlzVmVyYmF0aW0gPyBQQVRURVJOX1RBR19VUkkudGVzdCh0YWdOYW1lKSA6IFBBVFRFUk5fVEFHX1NVRkZJWC50ZXN0KHRhZ05hbWUpKSkge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsIGB0YWcgbmFtZSBjYW5ub3QgY29udGFpbiBzdWNoIGNoYXJhY3RlcnM6ICR7dGFnTmFtZX1gKVxuICB9XG4gIHRyeSB7XG4gICAgZGVjb2RlVVJJQ29tcG9uZW50KHRhZ05hbWUpXG4gIH0gY2F0Y2gge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsIGB0YWcgbmFtZSBpcyBtYWxmb3JtZWQ6ICR7dGFnTmFtZX1gKVxuICB9XG5cbiAgaWYgKCFpc1ZlcmJhdGltICYmIHRhZ0hhbmRsZSAhPT0gJyEnICYmIHRhZ0hhbmRsZSAhPT0gJyEhJyAmJiAhSEFTX09XTi5jYWxsKHN0YXRlLnRhZ0hhbmRsZXJzLCB0YWdIYW5kbGUpKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgYHVuZGVjbGFyZWQgdGFnIGhhbmRsZSBcIiR7dGFnSGFuZGxlfVwiYClcbiAgfVxuXG4gIHByb3BzLnRhZ1N0YXJ0ID0gc3RhcnRcbiAgcHJvcHMudGFnRW5kID0gc3RhdGUucG9zaXRpb25cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gcmVhZEFuY2hvclByb3BlcnR5IChzdGF0ZTogUGFyc2VyU3RhdGUsIHByb3BzOiBOb2RlUHJvcGVydGllcykge1xuICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgIT09IDB4MjYvKiAmICovKSByZXR1cm4gZmFsc2VcbiAgaWYgKHByb3BzLmFuY2hvclN0YXJ0ICE9PSBOT19SQU5HRSkgdGhyb3dFcnJvcihzdGF0ZSwgJ2R1cGxpY2F0aW9uIG9mIGFuIGFuY2hvciBwcm9wZXJ0eScpXG5cbiAgc3RhdGUucG9zaXRpb24rK1xuICBjb25zdCBzdGFydCA9IHN0YXRlLnBvc2l0aW9uXG5cbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwICYmICFpc1dzT3JFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpICYmICFpc0Zsb3dJbmRpY2F0b3Ioc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpKSB7XG4gICAgc3RhdGUucG9zaXRpb24rK1xuICB9XG5cbiAgaWYgKHN0YXRlLnBvc2l0aW9uID09PSBzdGFydCkgdGhyb3dFcnJvcihzdGF0ZSwgJ25hbWUgb2YgYW4gYW5jaG9yIG5vZGUgbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBjaGFyYWN0ZXInKVxuXG4gIHByb3BzLmFuY2hvclN0YXJ0ID0gc3RhcnRcbiAgcHJvcHMuYW5jaG9yRW5kID0gc3RhdGUucG9zaXRpb25cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gcmVhZEFsaWFzIChzdGF0ZTogUGFyc2VyU3RhdGUsIHByb3BzOiBOb2RlUHJvcGVydGllcykge1xuICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgIT09IDB4MkEvKiAqICovKSByZXR1cm4gZmFsc2VcbiAgaWYgKHByb3BzLmFuY2hvclN0YXJ0ICE9PSBOT19SQU5HRSB8fCBwcm9wcy50YWdTdGFydCAhPT0gTk9fUkFOR0UpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnYWxpYXMgbm9kZSBzaG91bGQgbm90IGhhdmUgYW55IHByb3BlcnRpZXMnKVxuICB9XG5cbiAgc3RhdGUucG9zaXRpb24rK1xuICBjb25zdCBzdGFydCA9IHN0YXRlLnBvc2l0aW9uXG5cbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwICYmICFpc1dzT3JFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpICYmICFpc0Zsb3dJbmRpY2F0b3Ioc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpKSB7XG4gICAgc3RhdGUucG9zaXRpb24rK1xuICB9XG5cbiAgaWYgKHN0YXRlLnBvc2l0aW9uID09PSBzdGFydCkgdGhyb3dFcnJvcihzdGF0ZSwgJ25hbWUgb2YgYW4gYWxpYXMgbm9kZSBtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIGNoYXJhY3RlcicpXG5cbiAgYWRkQWxpYXNFdmVudChzdGF0ZSwgc3RhcnQsIHN0YXRlLnBvc2l0aW9uKVxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiByZWFkRmxvd1NjYWxhckJyZWFrIChzdGF0ZTogUGFyc2VyU3RhdGUsIG5vZGVJbmRlbnQ6IG51bWJlcikge1xuICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCBmYWxzZSlcblxuICBpZiAoc3RhdGUubGluZUluZGVudCA8IG5vZGVJbmRlbnQpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZGVmaWNpZW50IGluZGVudGF0aW9uJylcbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkU2luZ2xlUXVvdGVkU2NhbGFyIChzdGF0ZTogUGFyc2VyU3RhdGUsIG5vZGVJbmRlbnQ6IG51bWJlciwgcHJvcHM6IE5vZGVQcm9wZXJ0aWVzKSB7XG4gIGlmIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMHgyNy8qICcgKi8pIHJldHVybiBmYWxzZVxuXG4gIHN0YXRlLnBvc2l0aW9uKytcbiAgY29uc3Qgc3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICAvLyBBIHNpbmdsZS1xdW90ZWQgc2NhbGFyIGlzIHNsaWNlYWJsZSB2ZXJiYXRpbSB3aGVuIGl0IGhhcyBubyAnJyBlc2NhcGUgcGFpcnNcbiAgLy8gYW5kIG5vIGZvbGRlZCBsaW5lIGJyZWFrcyAoc2VlIGdldFNjYWxhclZhbHVlIGZhc3QgcGF0aCkuXG4gIGxldCBzaW1wbGUgPSB0cnVlXG5cbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwKSB7XG4gICAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSAweDI3LyogJyAqLykge1xuICAgICAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKSA9PT0gMHgyNy8qICcgKi8pIHtcbiAgICAgICAgc2ltcGxlID0gZmFsc2VcbiAgICAgICAgc3RhdGUucG9zaXRpb24gKz0gMlxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjb25zdCBlbmQgPSBzdGF0ZS5wb3NpdGlvblxuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgYWRkU2NhbGFyRXZlbnQoc3RhdGUsIHN0YXJ0LCBlbmQsIHByb3BzLmFuY2hvclN0YXJ0LCBwcm9wcy5hbmNob3JFbmQsIHByb3BzLnRhZ1N0YXJ0LCBwcm9wcy50YWdFbmQsIFNDQUxBUl9TVFlMRV9TSU5HTEVfUVVPVEVELCBDSE9NUElOR19DTElQLCAtMSwgc2ltcGxlKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAoaXNFb2woY2gpKSB7XG4gICAgICBzaW1wbGUgPSBmYWxzZVxuICAgICAgcmVhZEZsb3dTY2FsYXJCcmVhayhzdGF0ZSwgbm9kZUluZGVudClcbiAgICB9IGVsc2UgaWYgKHN0YXRlLnBvc2l0aW9uID09PSBzdGF0ZS5saW5lU3RhcnQgJiYgdGVzdERvY3VtZW50U2VwYXJhdG9yKHN0YXRlKSkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuZXhwZWN0ZWQgZW5kIG9mIHRoZSBkb2N1bWVudCB3aXRoaW4gYSBzaW5nbGUgcXVvdGVkIHNjYWxhcicpXG4gICAgfSBlbHNlIGlmIChjaCAhPT0gMHgwOS8qIFRhYiAqLyAmJiBjaCA8IDB4MjApIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdleHBlY3RlZCB2YWxpZCBKU09OIGNoYXJhY3RlcicpXG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICB9XG4gIH1cblxuICB0aHJvd0Vycm9yKHN0YXRlLCAndW5leHBlY3RlZCBlbmQgb2YgdGhlIHN0cmVhbSB3aXRoaW4gYSBzaW5nbGUgcXVvdGVkIHNjYWxhcicpXG59XG5cbmZ1bmN0aW9uIHJlYWREb3VibGVRdW90ZWRTY2FsYXIgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgbm9kZUluZGVudDogbnVtYmVyLCBwcm9wczogTm9kZVByb3BlcnRpZXMpIHtcbiAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAweDIyLyogXCIgKi8pIHJldHVybiBmYWxzZVxuXG4gIHN0YXRlLnBvc2l0aW9uKytcbiAgY29uc3Qgc3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICAvLyBBIGRvdWJsZS1xdW90ZWQgc2NhbGFyIGlzIHNsaWNlYWJsZSB2ZXJiYXRpbSB3aGVuIGl0IGhhcyBubyBcXCBlc2NhcGVzIGFuZFxuICAvLyBubyBmb2xkZWQgbGluZSBicmVha3MgKHNlZSBnZXRTY2FsYXJWYWx1ZSBmYXN0IHBhdGgpLlxuICBsZXQgc2ltcGxlID0gdHJ1ZVxuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCkge1xuICAgIGNvbnN0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIGlmIChjaCA9PT0gMHgyMi8qIFwiICovKSB7XG4gICAgICBjb25zdCBlbmQgPSBzdGF0ZS5wb3NpdGlvblxuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgYWRkU2NhbGFyRXZlbnQoc3RhdGUsIHN0YXJ0LCBlbmQsIHByb3BzLmFuY2hvclN0YXJ0LCBwcm9wcy5hbmNob3JFbmQsIHByb3BzLnRhZ1N0YXJ0LCBwcm9wcy50YWdFbmQsIFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVELCBDSE9NUElOR19DTElQLCAtMSwgc2ltcGxlKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAoY2ggPT09IDB4NUMvKiBcXCAqLykge1xuICAgICAgc2ltcGxlID0gZmFsc2VcbiAgICAgIGNvbnN0IGVzY2FwZWQgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG5cbiAgICAgIGlmIChpc0VvbChlc2NhcGVkKSkge1xuICAgICAgICByZWFkRmxvd1NjYWxhckJyZWFrKHN0YXRlLCBub2RlSW5kZW50KVxuICAgICAgfSBlbHNlIGlmIChpc1NpbXBsZUVzY2FwZShlc2NhcGVkKSkge1xuICAgICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgaGV4TGVuZ3RoID0gZXNjYXBlZEhleExlbihlc2NhcGVkKVxuXG4gICAgICAgIGlmIChoZXhMZW5ndGggPT09IDApIHRocm93RXJyb3Ioc3RhdGUsICd1bmtub3duIGVzY2FwZSBzZXF1ZW5jZScpXG5cbiAgICAgICAgd2hpbGUgKGhleExlbmd0aC0tID4gMCkge1xuICAgICAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgICAgICBpZiAoZnJvbUhleENvZGUoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpIDwgMCkge1xuICAgICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2V4cGVjdGVkIGhleGFkZWNpbWFsIGNoYXJhY3RlcicpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzRW9sKGNoKSkge1xuICAgICAgc2ltcGxlID0gZmFsc2VcbiAgICAgIHJlYWRGbG93U2NhbGFyQnJlYWsoc3RhdGUsIG5vZGVJbmRlbnQpXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd1bmV4cGVjdGVkIGVuZCBvZiB0aGUgZG9jdW1lbnQgd2l0aGluIGEgZG91YmxlIHF1b3RlZCBzY2FsYXInKVxuICAgIH0gZWxzZSBpZiAoY2ggIT09IDB4MDkvKiBUYWIgKi8gJiYgY2ggPCAweDIwKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZXhwZWN0ZWQgdmFsaWQgSlNPTiBjaGFyYWN0ZXInKVxuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgfVxuICB9XG5cbiAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuZXhwZWN0ZWQgZW5kIG9mIHRoZSBzdHJlYW0gd2l0aGluIGEgZG91YmxlIHF1b3RlZCBzY2FsYXInKVxufVxuXG5mdW5jdGlvbiByZWFkQmxvY2tTY2FsYXIgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgcGFyZW50SW5kZW50OiBudW1iZXIsIHByb3BzOiBOb2RlUHJvcGVydGllcykge1xuICBjb25zdCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG4gIGxldCBjaG9tcGluZzogQ2hvbXBpbmcgPSBDSE9NUElOR19DTElQXG4gIGxldCBpbmRlbnQgPSAtMVxuICBsZXQgZGV0ZWN0ZWRJbmRlbnQgPSBmYWxzZVxuXG4gIGlmIChjaCAhPT0gMHg3Qy8qIHwgKi8gJiYgY2ggIT09IDB4M0UvKiA+ICovKSByZXR1cm4gZmFsc2VcblxuICBjb25zdCBzdHlsZSA9IGNoID09PSAweDdDLyogfCAqLyA/IFNDQUxBUl9TVFlMRV9MSVRFUkFMX0JMT0NLIDogU0NBTEFSX1NUWUxFX0ZPTERFRF9CTE9DS1xuICBzdGF0ZS5wb3NpdGlvbisrXG5cbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwKSB7XG4gICAgY29uc3QgY3VycmVudCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG4gICAgY29uc3QgZGlnaXQgPSBmcm9tRGVjaW1hbENvZGUoY3VycmVudClcblxuICAgIGlmIChjdXJyZW50ID09PSAweDJCLyogKyAqLyB8fCBjdXJyZW50ID09PSAweDJELyogLSAqLykge1xuICAgICAgaWYgKGNob21waW5nICE9PSBDSE9NUElOR19DTElQKSB0aHJvd0Vycm9yKHN0YXRlLCAncmVwZWF0IG9mIGEgY2hvbXBpbmcgbW9kZSBpZGVudGlmaWVyJylcbiAgICAgIGNob21waW5nID0gY3VycmVudCA9PT0gMHgyQi8qICsgKi8gPyBDSE9NUElOR19LRUVQIDogQ0hPTVBJTkdfU1RSSVBcbiAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICB9IGVsc2UgaWYgKGRpZ2l0ID49IDApIHtcbiAgICAgIGlmIChkaWdpdCA9PT0gMCkge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnYmFkIGV4cGxpY2l0IGluZGVudGF0aW9uIHdpZHRoIG9mIGEgYmxvY2sgc2NhbGFyOyBpdCBjYW5ub3QgYmUgbGVzcyB0aGFuIG9uZScpXG4gICAgICB9XG4gICAgICBpZiAoZGV0ZWN0ZWRJbmRlbnQpIHRocm93RXJyb3Ioc3RhdGUsICdyZXBlYXQgb2YgYW4gaW5kZW50YXRpb24gd2lkdGggaWRlbnRpZmllcicpXG4gICAgICBpbmRlbnQgPSBwYXJlbnRJbmRlbnQgKyBkaWdpdCAtIDFcbiAgICAgIGRldGVjdGVkSW5kZW50ID0gdHJ1ZVxuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGxldCBoYWRXaGl0ZXNwYWNlID0gZmFsc2VcbiAgd2hpbGUgKGlzV2hpdGVTcGFjZShzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSkpIHtcbiAgICBoYWRXaGl0ZXNwYWNlID0gdHJ1ZVxuICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgfVxuICBpZiAoaGFkV2hpdGVzcGFjZSAmJiBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gMHgyMy8qICMgKi8pIHNraXBVbnRpbExpbmVFbmQoc3RhdGUpXG5cbiAgaWYgKGlzRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkge1xuICAgIGNvbnN1bWVMaW5lQnJlYWsoc3RhdGUpXG4gIH0gZWxzZSBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgIT09IDApIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnYSBsaW5lIGJyZWFrIGlzIGV4cGVjdGVkJylcbiAgfVxuXG4gIGxldCBjb250ZW50SW5kZW50ID0gZGV0ZWN0ZWRJbmRlbnQgPyBpbmRlbnQgOiAtMVxuICBsZXQgbWF4TGVhZGluZ0luZGVudCA9IDBcbiAgY29uc3QgdmFsdWVTdGFydCA9IHN0YXRlLnBvc2l0aW9uXG4gIGxldCB2YWx1ZUVuZCA9IHN0YXRlLnBvc2l0aW9uXG5cbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwKSB7XG4gICAgY29uc3QgbGluZVBvc2l0aW9uID0gc3RhdGUucG9zaXRpb25cbiAgICBsZXQgY29sdW1uID0gMFxuXG4gICAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQobGluZVBvc2l0aW9uICsgY29sdW1uKSA9PT0gMHgyMC8qIFNwYWNlICovKSBjb2x1bW4rK1xuXG4gICAgY29uc3QgZmlyc3QgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KGxpbmVQb3NpdGlvbiArIGNvbHVtbilcbiAgICBpZiAoZmlyc3QgPT09IDApIHtcbiAgICAgIC8vIEVuZCBvZiBpbnB1dCBhY3RzIGFzIGEgbGluZSB0ZXJtaW5hdG9yLCBidXQgdGhlcmUgaXMgbm8gbGluZSBicmVhayB0b1xuICAgICAgLy8gaW5jbHVkZSBoZXJlLiBBIGZpbmFsIGFsbC1zcGFjZXMgbGluZSBzdGlsbCBjb3VudHM6IHdoZW4gdGhlIGJsb2NrIGhhcyBhXG4gICAgICAvLyBjb250ZW50IGluZGVudCwgdGhlIHNwYWNlcyBiZXlvbmQgaXQgYXJlIHJlYWwgY29udGVudDsgaW4gYSB3aG9sbHkgYmxhbmtcbiAgICAgIC8vIGJsb2NrIChjb250ZW50SW5kZW50IDwgMCkgdGhlIHNwYWNlcyBmb3JtIGEgYmxhbmsgbGluZSB0aGF0IGNob21waW5nIG11c3RcbiAgICAgIC8vIHNlZSwgZXhhY3RseSBhcyBpdCB3b3VsZCBpZiB0aGUgbGluZSBlbmRlZCB3aXRoIGEgYnJlYWsuIENhcHR1cmUgdGhlIGxpbmVcbiAgICAgIC8vIGluIGJvdGggY2FzZXM7IG90aGVyd2lzZSB0aGUgYmxvY2sgZW5kcyBhdCB0aGUgc3RhcnQgb2YgdGhpcyBlbXB0eSBsaW5lLlxuICAgICAgaWYgKGNvbnRlbnRJbmRlbnQgPj0gMCkge1xuICAgICAgICBpZiAoY29sdW1uID4gY29udGVudEluZGVudCkgdmFsdWVFbmQgPSBsaW5lUG9zaXRpb24gKyBjb2x1bW5cbiAgICAgIH0gZWxzZSBpZiAoY29sdW1uID4gMCkge1xuICAgICAgICB2YWx1ZUVuZCA9IGxpbmVQb3NpdGlvbiArIGNvbHVtblxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICB9XG4gICAgaWYgKGxpbmVQb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSwgbGluZVBvc2l0aW9uKSkgYnJlYWtcblxuICAgIGlmICghZGV0ZWN0ZWRJbmRlbnQgJiYgY29udGVudEluZGVudCA9PT0gLTEgJiYgaXNFb2woZmlyc3QpKSB7XG4gICAgICBtYXhMZWFkaW5nSW5kZW50ID0gTWF0aC5tYXgobWF4TGVhZGluZ0luZGVudCwgY29sdW1uKVxuICAgIH1cblxuICAgIGlmICghZGV0ZWN0ZWRJbmRlbnQgJiYgY29udGVudEluZGVudCA9PT0gLTEgJiYgIWlzRW9sKGZpcnN0KSkge1xuICAgICAgaWYgKGZpcnN0ID09PSAweDA5LyogVGFiICovICYmIGNvbHVtbiA8IHBhcmVudEluZGVudCkge1xuICAgICAgICBzdGF0ZS5wb3NpdGlvbiA9IGxpbmVQb3NpdGlvbiArIGNvbHVtblxuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndGFiIGNoYXJhY3RlcnMgbXVzdCBub3QgYmUgdXNlZCBpbiBpbmRlbnRhdGlvbicpXG4gICAgICB9XG4gICAgICBpZiAoY29sdW1uIDwgbWF4TGVhZGluZ0luZGVudCkge1xuICAgICAgICBzdGF0ZS5wb3NpdGlvbiA9IGxpbmVQb3NpdGlvbiArIGNvbHVtblxuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnYmFkIGluZGVudGF0aW9uIG9mIGEgbWFwcGluZyBlbnRyeScpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvbnRlbnRJbmRlbnQgPT09IC0xICYmIGZpcnN0ICE9PSAwICYmICFpc0VvbChmaXJzdCkgJiYgY29sdW1uIDwgcGFyZW50SW5kZW50KSB7XG4gICAgICBzdGF0ZS5saW5lSW5kZW50ID0gY29sdW1uXG4gICAgICBzdGF0ZS5wb3NpdGlvbiA9IGxpbmVQb3NpdGlvbiArIGNvbHVtblxuICAgICAgYnJlYWtcbiAgICB9XG5cbiAgICBpZiAoIWRldGVjdGVkSW5kZW50ICYmIGZpcnN0ICE9PSAwICYmICFpc0VvbChmaXJzdCkgJiYgY29udGVudEluZGVudCA9PT0gLTEpIHtcbiAgICAgIGNvbnRlbnRJbmRlbnQgPSBjb2x1bW5cbiAgICB9XG5cbiAgICBjb25zdCByZXF1aXJlZEluZGVudCA9IGNvbnRlbnRJbmRlbnQgPT09IC0xID8gcGFyZW50SW5kZW50ICsgMSA6IGNvbnRlbnRJbmRlbnRcbiAgICBpZiAoZmlyc3QgIT09IDAgJiYgIWlzRW9sKGZpcnN0KSAmJiBjb2x1bW4gPCByZXF1aXJlZEluZGVudCkge1xuICAgICAgc3RhdGUubGluZUluZGVudCA9IGNvbHVtblxuICAgICAgc3RhdGUucG9zaXRpb24gPSBsaW5lUG9zaXRpb24gKyBjb2x1bW5cbiAgICAgIGJyZWFrXG4gICAgfVxuXG4gICAgc2tpcFVudGlsTGluZUVuZChzdGF0ZSlcbiAgICB2YWx1ZUVuZCA9IHN0YXRlLnBvc2l0aW9uXG4gICAgaWYgKGlzRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkge1xuICAgICAgY29uc3VtZUxpbmVCcmVhayhzdGF0ZSlcbiAgICAgIC8vIEluY2x1ZGUgdGhlIGxpbmUgYnJlYWsgaW4gdGhlIHJhbmdlIHNvIHRyYWlsaW5nIGJsYW5rIGxpbmVzIGFyZVxuICAgICAgLy8gcHJlc2VydmVkLiBUaGlzIGlzIHdoYXQgbGV0cyBjb29rIHRlbGwgYXBhcnQgYW4gZW1wdHkgYHwrYCAocmFuZ2UgXCJcIixcbiAgICAgIC8vIHZhbHVlIFwiXCIpIGZyb20gYSBgfCtgIHdpdGggb25lIGJsYW5rIGxpbmUgKHJhbmdlIFwiXFxuXCIsIHZhbHVlIFwiXFxuXCIpLlxuICAgICAgLy8gRGUtaW5kZW50IGFuZCBjaG9tcGluZyBhcmUgYXBwbGllZCBsYXRlciBpbiBnZXRTY2FsYXJWYWx1ZS5cbiAgICAgIHZhbHVlRW5kID0gc3RhdGUucG9zaXRpb25cbiAgICB9XG4gIH1cblxuICBjaGVja1ByaW50YWJsZShzdGF0ZSwgdmFsdWVTdGFydCwgdmFsdWVFbmQpXG4gIGFkZFNjYWxhckV2ZW50KFxuICAgIHN0YXRlLFxuICAgIHZhbHVlU3RhcnQsXG4gICAgdmFsdWVFbmQsXG4gICAgcHJvcHMuYW5jaG9yU3RhcnQsXG4gICAgcHJvcHMuYW5jaG9yRW5kLFxuICAgIHByb3BzLnRhZ1N0YXJ0LFxuICAgIHByb3BzLnRhZ0VuZCxcbiAgICBzdHlsZSxcbiAgICBjaG9tcGluZyxcbiAgICBjb250ZW50SW5kZW50XG4gIClcbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gY2FuU3RhcnRQbGFpblNjYWxhciAoc3RhdGU6IFBhcnNlclN0YXRlLCBub2RlQ29udGV4dDogTm9kZUNvbnRleHQpIHtcbiAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICBjb25zdCBpbkZsb3cgPSBub2RlQ29udGV4dCA9PT0gQ09OVEVYVF9GTE9XX0lOXG5cbiAgaWYgKGNoID09PSAwIHx8XG4gICAgICBpc1dzT3JFb2woY2gpIHx8XG4gICAgICBjaCA9PT0gMHgyMy8qICMgKi8gfHxcbiAgICAgIGNoID09PSAweDI2LyogJiAqLyB8fFxuICAgICAgY2ggPT09IDB4MkEvKiAqICovIHx8XG4gICAgICBjaCA9PT0gMHgyMS8qICEgKi8gfHxcbiAgICAgIGNoID09PSAweDdDLyogfCAqLyB8fFxuICAgICAgY2ggPT09IDB4M0UvKiA+ICovIHx8XG4gICAgICBjaCA9PT0gMHgyNy8qICcgKi8gfHxcbiAgICAgIGNoID09PSAweDIyLyogXCIgKi8gfHxcbiAgICAgIGNoID09PSAweDI1LyogJSAqLyB8fFxuICAgICAgY2ggPT09IDB4NDAvKiBAICovIHx8XG4gICAgICBjaCA9PT0gMHg2MC8qIGAgKi8gfHxcbiAgICAgIChpbkZsb3cgJiYgaXNGbG93SW5kaWNhdG9yKGNoKSkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmIChjaCA9PT0gMHgzRi8qID8gKi8gfHwgY2ggPT09IDB4MkQvKiAtICovKSB7XG4gICAgY29uc3QgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpXG4gICAgaWYgKGlzV3NPckVvbE9yRW5kKGZvbGxvd2luZykgfHwgKGluRmxvdyAmJiBpc0Zsb3dJbmRpY2F0b3IoZm9sbG93aW5nKSkpIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gcmVhZFBsYWluU2NhbGFyIChzdGF0ZTogUGFyc2VyU3RhdGUsIG5vZGVJbmRlbnQ6IG51bWJlciwgbm9kZUNvbnRleHQ6IE5vZGVDb250ZXh0LCBwcm9wczogTm9kZVByb3BlcnRpZXMpIHtcbiAgaWYgKCFjYW5TdGFydFBsYWluU2NhbGFyKHN0YXRlLCBub2RlQ29udGV4dCkpIHJldHVybiBmYWxzZVxuXG4gIGNvbnN0IHN0YXJ0ID0gc3RhdGUucG9zaXRpb25cbiAgbGV0IGVuZCA9IHN0YXRlLnBvc2l0aW9uXG4gIGxldCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG4gIGNvbnN0IGluRmxvdyA9IG5vZGVDb250ZXh0ID09PSBDT05URVhUX0ZMT1dfSU5cbiAgLy8gQSBzaW5nbGUtbGluZSBwbGFpbiBzY2FsYXIgaXMgc2xpY2VhYmxlIHZlcmJhdGltOiB0aGUgcGFyc2VyIGFscmVhZHkgdHJpbXNcbiAgLy8gdHJhaWxpbmcgd2hpdGVzcGFjZSBmcm9tIHRoZSByYW5nZSwgc28gbm8gZm9sZGluZyBpcyBuZWVkZWQgKHNlZVxuICAvLyBnZXRTY2FsYXJWYWx1ZSBmYXN0IHBhdGgpLiBGb2xkZWQgbGluZSBicmVha3MgbWFrZSBpdCBub24tc2ltcGxlLlxuICBsZXQgbXVsdGlsaW5lID0gZmFsc2VcblxuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICBpZiAoc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUpKSBicmVha1xuXG4gICAgaWYgKGNoID09PSAweDNBLyogOiAqLykge1xuICAgICAgY29uc3QgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpXG4gICAgICBpZiAoaXNXc09yRW9sT3JFbmQoZm9sbG93aW5nKSB8fCAoaW5GbG93ICYmIGlzRmxvd0luZGljYXRvcihmb2xsb3dpbmcpKSkgYnJlYWtcbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDIzLyogIyAqLykge1xuICAgICAgY29uc3QgcHJlY2VkaW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiAtIDEpXG4gICAgICBpZiAoaXNXc09yRW9sKHByZWNlZGluZykpIGJyZWFrXG4gICAgfSBlbHNlIGlmIChpbkZsb3cgJiYgaXNGbG93SW5kaWNhdG9yKGNoKSkge1xuICAgICAgYnJlYWtcbiAgICB9IGVsc2UgaWYgKGlzRW9sKGNoKSkge1xuICAgICAgY29uc3Qgc2F2ZWRQb3NpdGlvbiA9IHN0YXRlLnBvc2l0aW9uXG4gICAgICBjb25zdCBzYXZlZExpbmUgPSBzdGF0ZS5saW5lXG4gICAgICBjb25zdCBzYXZlZExpbmVTdGFydCA9IHN0YXRlLmxpbmVTdGFydFxuICAgICAgY29uc3Qgc2F2ZWRMaW5lSW5kZW50ID0gc3RhdGUubGluZUluZGVudFxuXG4gICAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCBmYWxzZSlcblxuICAgICAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPj0gbm9kZUluZGVudCkge1xuICAgICAgICBtdWx0aWxpbmUgPSB0cnVlXG4gICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgc3RhdGUucG9zaXRpb24gPSBzYXZlZFBvc2l0aW9uXG4gICAgICBzdGF0ZS5saW5lID0gc2F2ZWRMaW5lXG4gICAgICBzdGF0ZS5saW5lU3RhcnQgPSBzYXZlZExpbmVTdGFydFxuICAgICAgc3RhdGUubGluZUluZGVudCA9IHNhdmVkTGluZUluZGVudFxuICAgICAgYnJlYWtcbiAgICB9XG5cbiAgICBpZiAoIWlzV2hpdGVTcGFjZShjaCkpIGVuZCA9IHN0YXRlLnBvc2l0aW9uICsgMVxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICB9XG5cbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVybiBmYWxzZVxuXG4gIGNoZWNrUHJpbnRhYmxlKHN0YXRlLCBzdGFydCwgZW5kKVxuICBhZGRTY2FsYXJFdmVudChzdGF0ZSwgc3RhcnQsIGVuZCwgcHJvcHMuYW5jaG9yU3RhcnQsIHByb3BzLmFuY2hvckVuZCwgcHJvcHMudGFnU3RhcnQsIHByb3BzLnRhZ0VuZCwgU0NBTEFSX1NUWUxFX1BMQUlOLCBDSE9NUElOR19DTElQLCAtMSwgIW11bHRpbGluZSlcbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gZmluZEJsb2NrTWFwcGluZ0NvbG9uIChzdGF0ZTogUGFyc2VyU3RhdGUpIHtcbiAgbGV0IHBvc2l0aW9uID0gc3RhdGUucG9zaXRpb25cbiAgbGV0IGZsb3dMZXZlbCA9IDBcblxuICB3aGlsZSAocG9zaXRpb24gPCBzdGF0ZS5sZW5ndGgpIHtcbiAgICBjb25zdCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pXG5cbiAgICBpZiAoaXNFb2woY2gpKSByZXR1cm4gLTFcbiAgICBpZiAoY2ggPT09IDB4MjMvKiAjICovICYmIGlzV3NPckVvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uIC0gMSkpKSByZXR1cm4gLTFcblxuICAgIGlmICgoY2ggPT09IDB4MkEvKiAqICovIHx8IGNoID09PSAweDI2LyogJiAqLykgJiYgcG9zaXRpb24gPT09IHN0YXRlLnBvc2l0aW9uKSB7XG4gICAgICBkbyB7IHBvc2l0aW9uKysgfVxuICAgICAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pICE9PSAwICYmXG4gICAgICAgICAgICAgIWlzV3NPckVvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSkgJiZcbiAgICAgICAgICAgICAhaXNGbG93SW5kaWNhdG9yKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pKSlcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgaWYgKGNoID09PSAweDVCLyogWyAqLyB8fCBjaCA9PT0gMHg3Qi8qIHsgKi8pIHtcbiAgICAgIGZsb3dMZXZlbCsrXG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHg1RC8qIF0gKi8gfHwgY2ggPT09IDB4N0QvKiB9ICovKSB7XG4gICAgICBpZiAoZmxvd0xldmVsID4gMCkgZmxvd0xldmVsLS1cbiAgICB9IGVsc2UgaWYgKGZsb3dMZXZlbCA9PT0gMCAmJiBjaCA9PT0gMHgzQS8qIDogKi8gJiYgaXNXc09yRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24gKyAxKSkpIHtcbiAgICAgIHJldHVybiBwb3NpdGlvblxuICAgIH1cblxuICAgIGlmICgoZmxvd0xldmVsID4gMCB8fCBwb3NpdGlvbiA9PT0gc3RhdGUucG9zaXRpb24pICYmXG4gICAgICAgIChjaCA9PT0gMHgyNy8qICcgKi8gfHwgY2ggPT09IDB4MjIvKiBcIiAqLykpIHtcbiAgICAgIGNvbnN0IHF1b3RlID0gY2hcbiAgICAgIHBvc2l0aW9uKytcblxuICAgICAgd2hpbGUgKHBvc2l0aW9uIDwgc3RhdGUubGVuZ3RoICYmIHN0YXRlLmlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pICE9PSBxdW90ZSkge1xuICAgICAgICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbikgPT09IDB4NUMvKiBcXCAqLyAmJiBxdW90ZSA9PT0gMHgyMi8qIFwiICovKSBwb3NpdGlvbisrXG4gICAgICAgIHBvc2l0aW9uKytcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwb3NpdGlvbisrXG4gIH1cblxuICByZXR1cm4gLTFcbn1cblxuZnVuY3Rpb24gc2tpcEZsb3dTZXBhcmF0aW9uU3BhY2UgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgbm9kZUluZGVudDogbnVtYmVyKSB7XG4gIGNvbnN0IHN0YXJ0TGluZSA9IHN0YXRlLmxpbmVcbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSlcblxuICBpZiAoKHN0YXRlLmxpbmUgPiBzdGFydExpbmUgJiYgc3RhdGUubGluZUluZGVudCA8IG5vZGVJbmRlbnQpIHx8XG4gICAgICAoc3RhdGUuZmlyc3RUYWJJbkxpbmUgIT09IC0xICYmIHN0YXRlLmxpbmVJbmRlbnQgPCBub2RlSW5kZW50KSkge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICdkZWZpY2llbnQgaW5kZW50YXRpb24nKVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlYWRGbG93Q29sbGVjdGlvbiAoc3RhdGU6IFBhcnNlclN0YXRlLCBub2RlSW5kZW50OiBudW1iZXIsIHByb3BzOiBOb2RlUHJvcGVydGllcykge1xuICBjb25zdCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG4gIGNvbnN0IGlzTWFwcGluZyA9IGNoID09PSAweDdCLyogeyAqL1xuICBjb25zdCBzdGFydCA9IHN0YXRlLnBvc2l0aW9uXG4gIGxldCByZWFkTmV4dCA9IHRydWVcblxuICBpZiAoY2ggIT09IDB4NUIvKiBbICovICYmIGNoICE9PSAweDdCLyogeyAqLykgcmV0dXJuIGZhbHNlXG5cbiAgY29uc3QgdGVybWluYXRvciA9IGlzTWFwcGluZyA/IDB4N0QvKiB9ICovIDogMHg1RC8qIF0gKi9cblxuICBpZiAoaXNNYXBwaW5nKSB7XG4gICAgYWRkTWFwcGluZ0V2ZW50KHN0YXRlLCBzdGFydCwgcHJvcHMuYW5jaG9yU3RhcnQsIHByb3BzLmFuY2hvckVuZCwgcHJvcHMudGFnU3RhcnQsIHByb3BzLnRhZ0VuZCwgQ09MTEVDVElPTl9TVFlMRV9GTE9XKVxuICB9IGVsc2Uge1xuICAgIGFkZFNlcXVlbmNlRXZlbnQoc3RhdGUsIHN0YXJ0LCBwcm9wcy5hbmNob3JTdGFydCwgcHJvcHMuYW5jaG9yRW5kLCBwcm9wcy50YWdTdGFydCwgcHJvcHMudGFnRW5kLCBDT0xMRUNUSU9OX1NUWUxFX0ZMT1cpXG4gIH1cblxuICBzdGF0ZS5wb3NpdGlvbisrXG5cbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwKSB7XG4gICAgc2tpcEZsb3dTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIG5vZGVJbmRlbnQpXG5cbiAgICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSB0ZXJtaW5hdG9yKSB7XG4gICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgICBhZGRQb3BFdmVudChzdGF0ZSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIGlmICghcmVhZE5leHQpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdtaXNzZWQgY29tbWEgYmV0d2VlbiBmbG93IGNvbGxlY3Rpb24gZW50cmllcycpXG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHgyQy8qICwgKi8pIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsIFwiZXhwZWN0ZWQgdGhlIG5vZGUgY29udGVudCwgYnV0IGZvdW5kICcsJ1wiKVxuICAgIH1cblxuICAgIGxldCBpc1BhaXIgPSBmYWxzZVxuICAgIGxldCBpc0V4cGxpY2l0UGFpciA9IGZhbHNlXG5cbiAgICBpZiAoY2ggPT09IDB4M0YvKiA/ICovICYmIGlzV3NPckVvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSkpKSB7XG4gICAgICBpc1BhaXIgPSBpc0V4cGxpY2l0UGFpciA9IHRydWVcbiAgICAgIHN0YXRlLnBvc2l0aW9uICs9IDFcbiAgICAgIHNraXBGbG93U2VwYXJhdGlvblNwYWNlKHN0YXRlLCBub2RlSW5kZW50KVxuICAgIH1cblxuICAgIGNvbnN0IGVudHJ5TGluZSA9IHN0YXRlLmxpbmVcbiAgICBjb25zdCBlbnRyeVN0YXJ0ID0gc25hcHNob3RTdGF0ZShzdGF0ZSlcblxuICAgIGNvbnN0IGtleVdhc1JlYWQgPSBwYXJzZU5vZGUoc3RhdGUsIG5vZGVJbmRlbnQsIENPTlRFWFRfRkxPV19JTiwgZmFsc2UsIHRydWUpXG4gICAgc2tpcEZsb3dTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIG5vZGVJbmRlbnQpXG5cbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgICBpZiAoKGlzTWFwcGluZyB8fCBpc0V4cGxpY2l0UGFpciB8fCBzdGF0ZS5saW5lID09PSBlbnRyeUxpbmUpICYmIGNoID09PSAweDNBLyogOiAqLykge1xuICAgICAgaXNQYWlyID0gdHJ1ZVxuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgc2tpcEZsb3dTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIG5vZGVJbmRlbnQpXG4gICAgICBpZiAoIWlzTWFwcGluZykge1xuICAgICAgICByZXN0b3JlU3RhdGUoc3RhdGUsIGVudHJ5U3RhcnQpXG4gICAgICAgIGFkZE1hcHBpbmdFdmVudChzdGF0ZSwgZW50cnlTdGFydC5wb3NpdGlvbiwgTk9fUkFOR0UsIE5PX1JBTkdFLCBOT19SQU5HRSwgTk9fUkFOR0UsIENPTExFQ1RJT05fU1RZTEVfRkxPVylcbiAgICAgICAgaWYgKCFwYXJzZU5vZGUoc3RhdGUsIG5vZGVJbmRlbnQsIENPTlRFWFRfRkxPV19JTiwgZmFsc2UsIHRydWUpKSB7XG4gICAgICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICAgICAgfVxuICAgICAgICBza2lwRmxvd1NlcGFyYXRpb25TcGFjZShzdGF0ZSwgbm9kZUluZGVudClcbiAgICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgICBza2lwRmxvd1NlcGFyYXRpb25TcGFjZShzdGF0ZSwgbm9kZUluZGVudClcbiAgICAgIH0gZWxzZSBpZiAoIWtleVdhc1JlYWQpIHtcbiAgICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICAgIH1cbiAgICAgIGlmICghcGFyc2VOb2RlKHN0YXRlLCBub2RlSW5kZW50LCBDT05URVhUX0ZMT1dfSU4sIGZhbHNlLCB0cnVlKSkge1xuICAgICAgICBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICAgICAgfVxuICAgICAgc2tpcEZsb3dTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIG5vZGVJbmRlbnQpXG4gICAgICBpZiAoIWlzTWFwcGluZykgYWRkUG9wRXZlbnQoc3RhdGUpXG4gICAgfSBlbHNlIGlmIChpc01hcHBpbmcgJiYgaXNQYWlyKSB7XG4gICAgICBpZiAoIWtleVdhc1JlYWQpIGFkZEVtcHR5U2NhbGFyRXZlbnQoc3RhdGUpXG4gICAgICBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICAgIH0gZWxzZSBpZiAoaXNNYXBwaW5nKSB7XG4gICAgICBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICAgIH0gZWxzZSBpZiAoaXNQYWlyKSB7XG4gICAgICByZXN0b3JlU3RhdGUoc3RhdGUsIGVudHJ5U3RhcnQpXG4gICAgICBhZGRNYXBwaW5nRXZlbnQoc3RhdGUsIGVudHJ5U3RhcnQucG9zaXRpb24sIE5PX1JBTkdFLCBOT19SQU5HRSwgTk9fUkFOR0UsIE5PX1JBTkdFLCBDT0xMRUNUSU9OX1NUWUxFX0ZMT1cpXG4gICAgICBwYXJzZU5vZGUoc3RhdGUsIG5vZGVJbmRlbnQsIENPTlRFWFRfRkxPV19JTiwgZmFsc2UsIHRydWUpXG4gICAgICBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICAgICAgYWRkUG9wRXZlbnQoc3RhdGUpXG4gICAgfVxuXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSAweDJDLyogLCAqLykge1xuICAgICAgcmVhZE5leHQgPSB0cnVlXG4gICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlYWROZXh0ID0gZmFsc2VcbiAgICB9XG4gIH1cblxuICB0aHJvd0Vycm9yKHN0YXRlLCAndW5leHBlY3RlZCBlbmQgb2YgdGhlIHN0cmVhbSB3aXRoaW4gYSBmbG93IGNvbGxlY3Rpb24nKVxufVxuXG5mdW5jdGlvbiByZWFkQmxvY2tTZXF1ZW5jZSAoc3RhdGU6IFBhcnNlclN0YXRlLCBub2RlSW5kZW50OiBudW1iZXIsIHByb3BzOiBOb2RlUHJvcGVydGllcykge1xuICBpZiAoc3RhdGUuZmlyc3RUYWJJbkxpbmUgIT09IC0xIHx8IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAweDJELyogLSAqLyB8fCAhaXNXc09yRW9sT3JFbmQoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgYWRkU2VxdWVuY2VFdmVudChzdGF0ZSwgc3RhdGUucG9zaXRpb24sIHByb3BzLmFuY2hvclN0YXJ0LCBwcm9wcy5hbmNob3JFbmQsIHByb3BzLnRhZ1N0YXJ0LCBwcm9wcy50YWdFbmQsIENPTExFQ1RJT05fU1RZTEVfQkxPQ0spXG5cbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAweDJELyogLSAqLyAmJiBpc1dzT3JFb2xPckVuZChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSkpKSB7XG4gICAgaWYgKHN0YXRlLmZpcnN0VGFiSW5MaW5lICE9PSAtMSkge1xuICAgICAgc3RhdGUucG9zaXRpb24gPSBzdGF0ZS5maXJzdFRhYkluTGluZVxuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RhYiBjaGFyYWN0ZXJzIG11c3Qgbm90IGJlIHVzZWQgaW4gaW5kZW50YXRpb24nKVxuICAgIH1cblxuICAgIGNvbnN0IGVudHJ5TGluZSA9IHN0YXRlLmxpbmVcbiAgICBzdGF0ZS5wb3NpdGlvbisrXG5cbiAgICBjb25zdCBoYWRCcmVhayA9IHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUpID4gMFxuICAgIGlmIChzdGF0ZS5maXJzdFRhYkluTGluZSAhPT0gLTEgJiZcbiAgICAgICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MkQvKiAtICovICYmXG4gICAgICAgIGlzV3NPckVvbE9yRW5kKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdiYWQgaW5kZW50YXRpb24gb2YgYSBzZXF1ZW5jZSBlbnRyeScpXG4gICAgfVxuXG4gICAgaWYgKGhhZEJyZWFrICYmIHN0YXRlLmxpbmVJbmRlbnQgPD0gbm9kZUluZGVudCkge1xuICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyc2VOb2RlKHN0YXRlLCBub2RlSW5kZW50LCBDT05URVhUX0JMT0NLX0lOLCBmYWxzZSwgdHJ1ZSlcbiAgICB9XG5cbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKVxuXG4gICAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPCBub2RlSW5kZW50IHx8IHN0YXRlLnBvc2l0aW9uID49IHN0YXRlLmxlbmd0aCkgYnJlYWtcbiAgICBpZiAoc3RhdGUubGluZUluZGVudCA+IG5vZGVJbmRlbnQpIHRocm93RXJyb3Ioc3RhdGUsICdiYWQgaW5kZW50YXRpb24gb2YgYSBzZXF1ZW5jZSBlbnRyeScpXG4gICAgaWYgKHN0YXRlLmxpbmUgPT09IGVudHJ5TGluZSAmJlxuICAgICAgICBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gMHgyRC8qIC0gKi8gJiZcbiAgICAgICAgaXNXc09yRW9sT3JFbmQoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpKSkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2JhZCBpbmRlbnRhdGlvbiBvZiBhIHNlcXVlbmNlIGVudHJ5JylcbiAgICB9XG4gIH1cblxuICBhZGRQb3BFdmVudChzdGF0ZSlcbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gcmVhZEJsb2NrTWFwcGluZyAoc3RhdGU6IFBhcnNlclN0YXRlLCBub2RlSW5kZW50OiBudW1iZXIsIGZsb3dJbmRlbnQ6IG51bWJlciwgcHJvcHM6IE5vZGVQcm9wZXJ0aWVzKSB7XG4gIGxldCBhdEV4cGxpY2l0S2V5ID0gZmFsc2VcbiAgbGV0IGRldGVjdGVkID0gZmFsc2VcbiAgbGV0IG1hcHBpbmdPcGVuZWQgPSBmYWxzZVxuICBsZXQgcGVuZGluZ0V4cGxpY2l0S2V5ID0gZmFsc2VcblxuICBpZiAoc3RhdGUuZmlyc3RUYWJJbkxpbmUgIT09IC0xKSByZXR1cm4gZmFsc2VcblxuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gIHdoaWxlIChjaCAhPT0gMCkge1xuICAgIGlmICghYXRFeHBsaWNpdEtleSAmJiBzdGF0ZS5maXJzdFRhYkluTGluZSAhPT0gLTEpIHtcbiAgICAgIHN0YXRlLnBvc2l0aW9uID0gc3RhdGUuZmlyc3RUYWJJbkxpbmVcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd0YWIgY2hhcmFjdGVycyBtdXN0IG5vdCBiZSB1c2VkIGluIGluZGVudGF0aW9uJylcbiAgICB9XG5cbiAgICBjb25zdCBmb2xsb3dpbmcgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSlcbiAgICBjb25zdCBlbnRyeUxpbmUgPSBzdGF0ZS5saW5lXG5cbiAgICBpZiAoKGNoID09PSAweDNGLyogPyAqLyB8fCBjaCA9PT0gMHgzQS8qIDogKi8pICYmIGlzV3NPckVvbE9yRW5kKGZvbGxvd2luZykpIHtcbiAgICAgIGlmICghbWFwcGluZ09wZW5lZCkge1xuICAgICAgICBhZGRNYXBwaW5nRXZlbnQoc3RhdGUsIHN0YXRlLnBvc2l0aW9uLCBwcm9wcy5hbmNob3JTdGFydCwgcHJvcHMuYW5jaG9yRW5kLCBwcm9wcy50YWdTdGFydCwgcHJvcHMudGFnRW5kLCBDT0xMRUNUSU9OX1NUWUxFX0JMT0NLKVxuICAgICAgICBtYXBwaW5nT3BlbmVkID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoY2ggPT09IDB4M0YvKiA/ICovKSB7XG4gICAgICAgIGlmIChhdEV4cGxpY2l0S2V5KSBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICAgICAgICBkZXRlY3RlZCA9IHRydWVcbiAgICAgICAgYXRFeHBsaWNpdEtleSA9IHRydWVcbiAgICAgIH0gZWxzZSBpZiAoYXRFeHBsaWNpdEtleSkge1xuICAgICAgICBhdEV4cGxpY2l0S2V5ID0gZmFsc2VcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFkZEVtcHR5U2NhbGFyRXZlbnQoc3RhdGUpXG4gICAgICAgIGRldGVjdGVkID0gdHJ1ZVxuICAgICAgICBhdEV4cGxpY2l0S2V5ID0gZmFsc2VcbiAgICAgIH1cblxuICAgICAgc3RhdGUucG9zaXRpb24gKz0gMVxuICAgICAgcGVuZGluZ0V4cGxpY2l0S2V5ID0gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBbiBleHBsaWNpdCBrZXkgYXdhaXRpbmcgaXRzIHZhbHVlLCBmb2xsb3dlZCBieSBhbiBpbXBsaWNpdCBrZXksIG1lYW5zXG4gICAgICAvLyB0aGUgZXhwbGljaXQga2V5J3MgdmFsdWUgaXMgZW1wdHkuIEVtaXQgaXQgbm93IChhcHBlbmQtb25seSkgc28gaXQgaXNcbiAgICAgIC8vIG9yZGVyZWQgYmVmb3JlIHRoZSBpbXBsaWNpdCBrZXkgbm9kZSByZWFkIGp1c3QgYmVsb3cuXG4gICAgICBpZiAoYXRFeHBsaWNpdEtleSkge1xuICAgICAgICBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICAgICAgICBhdEV4cGxpY2l0S2V5ID0gZmFsc2VcbiAgICAgIH1cblxuICAgICAgY29uc3QgYmVmb3JlS2V5ID0gc25hcHNob3RTdGF0ZShzdGF0ZSlcblxuICAgICAgaWYgKCFwYXJzZU5vZGUoc3RhdGUsIGZsb3dJbmRlbnQsIENPTlRFWFRfRkxPV19PVVQsIGZhbHNlLCB0cnVlKSkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUubGluZSA9PT0gZW50cnlMaW5lKSB7XG4gICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgICAgICB3aGlsZSAoaXNXaGl0ZVNwYWNlKGNoKSkge1xuICAgICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNoID09PSAweDNBLyogOiAqLykge1xuICAgICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuXG4gICAgICAgICAgaWYgKCFpc1dzT3JFb2xPckVuZChjaCkpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdhIHdoaXRlc3BhY2UgY2hhcmFjdGVyIGlzIGV4cGVjdGVkIGFmdGVyIHRoZSBrZXktdmFsdWUgc2VwYXJhdG9yIHdpdGhpbiBhIGJsb2NrIG1hcHBpbmcnKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghbWFwcGluZ09wZW5lZCkge1xuICAgICAgICAgICAgcmVzdG9yZVN0YXRlKHN0YXRlLCBiZWZvcmVLZXkpXG4gICAgICAgICAgICBhZGRNYXBwaW5nRXZlbnQoc3RhdGUsIGJlZm9yZUtleS5wb3NpdGlvbiwgcHJvcHMuYW5jaG9yU3RhcnQsIHByb3BzLmFuY2hvckVuZCwgcHJvcHMudGFnU3RhcnQsIHByb3BzLnRhZ0VuZCwgQ09MTEVDVElPTl9TVFlMRV9CTE9DSylcbiAgICAgICAgICAgIG1hcHBpbmdPcGVuZWQgPSB0cnVlXG4gICAgICAgICAgICAvLyBUaGUga2V5LCB0aGUgYDpgIGFuZCB0aGUgc3BhY2UgYWZ0ZXIgaXQgd2VyZSBhbHJlYWR5IHZhbGlkYXRlZFxuICAgICAgICAgICAgLy8gYWJvdmUsIGJlZm9yZSB0aGUgcm9sbGJhY2suIFJlLXJlYWRpbmcgdGhlIHNhbWUgaW5wdXQgY2Fubm90XG4gICAgICAgICAgICAvLyBmYWlsLCBzbyBqdXN0IGNvbnN1bWUgaXQgYWdhaW4gd2l0aG91dCBlcnJvciBjaGVja3MuXG4gICAgICAgICAgICBwYXJzZU5vZGUoc3RhdGUsIGZsb3dJbmRlbnQsIENPTlRFWFRfRkxPV19PVVQsIGZhbHNlLCB0cnVlKVxuXG4gICAgICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG4gICAgICAgICAgICB3aGlsZSAoaXNXaGl0ZVNwYWNlKGNoKSkge1xuICAgICAgICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRldGVjdGVkID0gdHJ1ZVxuICAgICAgICAgIGF0RXhwbGljaXRLZXkgPSBmYWxzZVxuICAgICAgICAgIHBlbmRpbmdFeHBsaWNpdEtleSA9IGZhbHNlXG4gICAgICAgIH0gZWxzZSBpZiAoZGV0ZWN0ZWQpIHtcbiAgICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCBcImV4cGVjdGVkICc6JyBhZnRlciBhIG1hcHBpbmcga2V5XCIpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTm90IGEgbWFwcGluZy4gSWYgb3V0ZXIgcHJvcGVydGllcyBhcmUgcGVuZGluZywgcm9sbCBiYWNrIHNvIHRoZVxuICAgICAgICAgIC8vIGNhbGxlciByZS1yZWFkcyB0aGlzIG5vZGUgd2l0aCB0aGVtIGF0dGFjaGVkIChldmVudHMgYXJlIGFwcGVuZC1vbmx5KS5cbiAgICAgICAgICBpZiAocHJvcHMuYW5jaG9yU3RhcnQgIT09IE5PX1JBTkdFIHx8IHByb3BzLnRhZ1N0YXJ0ICE9PSBOT19SQU5HRSkge1xuICAgICAgICAgICAgcmVzdG9yZVN0YXRlKHN0YXRlLCBiZWZvcmVLZXkpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChkZXRlY3RlZCkge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnY2FuIG5vdCByZWFkIGEgYmxvY2sgbWFwcGluZyBlbnRyeTsgYSBtdWx0aWxpbmUga2V5IG1heSBub3QgYmUgYW4gaW1wbGljaXQga2V5JylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChwcm9wcy5hbmNob3JTdGFydCAhPT0gTk9fUkFOR0UgfHwgcHJvcHMudGFnU3RhcnQgIT09IE5PX1JBTkdFKSB7XG4gICAgICAgICAgcmVzdG9yZVN0YXRlKHN0YXRlLCBiZWZvcmVLZXkpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocGFyc2VOb2RlKHN0YXRlLCBub2RlSW5kZW50LCBDT05URVhUX0JMT0NLX09VVCwgdHJ1ZSwgcGVuZGluZ0V4cGxpY2l0S2V5KSkge1xuICAgICAgcGVuZGluZ0V4cGxpY2l0S2V5ID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoIWF0RXhwbGljaXRLZXkpIHtcbiAgICAgIGlmIChwZW5kaW5nRXhwbGljaXRLZXkpIHtcbiAgICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICAgICAgcGVuZGluZ0V4cGxpY2l0S2V5ID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKVxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIGlmICgoc3RhdGUubGluZSA9PT0gZW50cnlMaW5lIHx8IHN0YXRlLmxpbmVJbmRlbnQgPiBub2RlSW5kZW50KSAmJiBjaCAhPT0gMCkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2JhZCBpbmRlbnRhdGlvbiBvZiBhIG1hcHBpbmcgZW50cnknKVxuICAgIH0gZWxzZSBpZiAoc3RhdGUubGluZUluZGVudCA8IG5vZGVJbmRlbnQpIHtcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKCFkZXRlY3RlZCkgcmV0dXJuIGZhbHNlXG4gIGlmIChhdEV4cGxpY2l0S2V5KSBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICBpZiAobWFwcGluZ09wZW5lZCkgYWRkUG9wRXZlbnQoc3RhdGUpXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHBhcnNlTm9kZSAoXG4gIHN0YXRlOiBQYXJzZXJTdGF0ZSxcbiAgcGFyZW50SW5kZW50OiBudW1iZXIsXG4gIG5vZGVDb250ZXh0OiBOb2RlQ29udGV4dCxcbiAgYWxsb3dUb1NlZWs6IGJvb2xlYW4sXG4gIGFsbG93Q29tcGFjdDogYm9vbGVhbixcbiAgYWxsb3dQcm9wZXJ0eU1hcHBpbmcgPSB0cnVlXG4pOiBib29sZWFuIHtcbiAgaWYgKHN0YXRlLmRlcHRoID49IHN0YXRlLm1heERlcHRoKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgYG5lc3RpbmcgZXhjZWVkZWQgbWF4RGVwdGggKCR7c3RhdGUubWF4RGVwdGh9KWApXG4gIH1cblxuICBzdGF0ZS5kZXB0aCsrXG5cbiAgbGV0IGluZGVudFN0YXR1cyA9IDFcbiAgbGV0IGF0TmV3TGluZSA9IGZhbHNlXG4gIGxldCBoYXNDb250ZW50ID0gZmFsc2VcbiAgbGV0IHByb3BlcnR5U3RhcnQ6IFBhcnNlclNuYXBzaG90IHwgbnVsbCA9IG51bGxcbiAgY29uc3QgcHJvcHMgPSBlbXB0eVByb3BlcnRpZXMoKVxuXG4gIGxldCBhbGxvd0Jsb2NrU2NhbGFycyA9IG5vZGVDb250ZXh0ID09PSBDT05URVhUX0JMT0NLX09VVCB8fCBub2RlQ29udGV4dCA9PT0gQ09OVEVYVF9CTE9DS19JTlxuICBsZXQgYWxsb3dCbG9ja0NvbGxlY3Rpb25zID0gYWxsb3dCbG9ja1NjYWxhcnNcbiAgY29uc3QgYWxsb3dCbG9ja1N0eWxlcyA9IGFsbG93QmxvY2tTY2FsYXJzXG5cbiAgaWYgKGFsbG93VG9TZWVrICYmIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUpKSB7XG4gICAgYXROZXdMaW5lID0gdHJ1ZVxuXG4gICAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPiBwYXJlbnRJbmRlbnQpIHtcbiAgICAgIGluZGVudFN0YXR1cyA9IDFcbiAgICB9IGVsc2UgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPT09IHBhcmVudEluZGVudCkge1xuICAgICAgaW5kZW50U3RhdHVzID0gMFxuICAgIH0gZWxzZSB7XG4gICAgICBpbmRlbnRTdGF0dXMgPSAtMVxuICAgIH1cbiAgfVxuXG4gIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSkpIHtcbiAgICBzdGF0ZS5kZXB0aC0tXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoaW5kZW50U3RhdHVzID09PSAxKSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGNvbnN0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcbiAgICAgIGNvbnN0IHByb3BlcnR5U3RhdGUgPSBzbmFwc2hvdFN0YXRlKHN0YXRlKVxuXG4gICAgICBpZiAoYXROZXdMaW5lICYmXG4gICAgICAgICAgaW5kZW50U3RhdHVzICE9PSAxICYmXG4gICAgICAgICAgKGNoID09PSAweDIxLyogISAqLyB8fCBjaCA9PT0gMHgyNi8qICYgKi8pKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGlmIChhdE5ld0xpbmUgJiZcbiAgICAgICAgICBhbGxvd0Jsb2NrU3R5bGVzICYmXG4gICAgICAgICAgKHByb3BzLnRhZ1N0YXJ0ICE9PSBOT19SQU5HRSB8fCBwcm9wcy5hbmNob3JTdGFydCAhPT0gTk9fUkFOR0UpICYmXG4gICAgICAgICAgKGNoID09PSAweDIxLyogISAqLyB8fCBjaCA9PT0gMHgyNi8qICYgKi8pKSB7XG4gICAgICAgIGNvbnN0IGZhbGxiYWNrU3RhdGUgPSBzbmFwc2hvdFN0YXRlKHN0YXRlKVxuICAgICAgICBjb25zdCBmbG93SW5kZW50ID0gcGFyZW50SW5kZW50ICsgMVxuICAgICAgICBjb25zdCBtYXBwaW5nSW5kZW50ID0gc3RhdGUucG9zaXRpb24gLSBzdGF0ZS5saW5lU3RhcnRcblxuICAgICAgICBpZiAocmVhZEJsb2NrTWFwcGluZyhzdGF0ZSwgbWFwcGluZ0luZGVudCwgZmxvd0luZGVudCwgcHJvcHMpICYmXG4gICAgICAgICAgICBzdGF0ZS5ldmVudHNbZmFsbGJhY2tTdGF0ZS5ldmVudHNMZW5ndGhdPy50eXBlID09PSBFVkVOVF9NQVBQSU5HKSB7XG4gICAgICAgICAgc3RhdGUuZGVwdGgtLVxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cblxuICAgICAgICByZXN0b3JlU3RhdGUoc3RhdGUsIGZhbGxiYWNrU3RhdGUpXG4gICAgICB9XG5cbiAgICAgIGlmIChhdE5ld0xpbmUgJiZcbiAgICAgICAgICAoKGNoID09PSAweDIxLyogISAqLyAmJiBwcm9wcy50YWdTdGFydCAhPT0gTk9fUkFOR0UpIHx8XG4gICAgICAgICAgIChjaCA9PT0gMHgyNi8qICYgKi8gJiYgcHJvcHMuYW5jaG9yU3RhcnQgIT09IE5PX1JBTkdFKSkpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgaWYgKCFyZWFkVGFnUHJvcGVydHkoc3RhdGUsIHByb3BzLCBub2RlQ29udGV4dCA9PT0gQ09OVEVYVF9GTE9XX0lOKSAmJiAhcmVhZEFuY2hvclByb3BlcnR5KHN0YXRlLCBwcm9wcykpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgaWYgKHByb3BlcnR5U3RhcnQgPT09IG51bGwpIHByb3BlcnR5U3RhcnQgPSBwcm9wZXJ0eVN0YXRlXG5cbiAgICAgIGlmIChza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKSkge1xuICAgICAgICBhdE5ld0xpbmUgPSB0cnVlXG4gICAgICAgIGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9IGFsbG93QmxvY2tTdHlsZXNcblxuICAgICAgICBpZiAoc3RhdGUubGluZUluZGVudCA+IHBhcmVudEluZGVudCkge1xuICAgICAgICAgIGluZGVudFN0YXR1cyA9IDFcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZS5saW5lSW5kZW50ID09PSBwYXJlbnRJbmRlbnQpIHtcbiAgICAgICAgICBpbmRlbnRTdGF0dXMgPSAwXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW5kZW50U3RhdHVzID0gLTFcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWxsb3dCbG9ja0NvbGxlY3Rpb25zID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoYWxsb3dCbG9ja0NvbGxlY3Rpb25zKSB7XG4gICAgYWxsb3dCbG9ja0NvbGxlY3Rpb25zID0gYXROZXdMaW5lIHx8IGFsbG93Q29tcGFjdFxuICB9XG5cbiAgaWYgKGluZGVudFN0YXR1cyA9PT0gMSB8fCBub2RlQ29udGV4dCA9PT0gQ09OVEVYVF9CTE9DS19PVVQpIHtcbiAgICBjb25zdCBmbG93SW5kZW50ID0gbm9kZUNvbnRleHQgPT09IENPTlRFWFRfRkxPV19JTiB8fCBub2RlQ29udGV4dCA9PT0gQ09OVEVYVF9GTE9XX09VVFxuICAgICAgPyBwYXJlbnRJbmRlbnRcbiAgICAgIDogcGFyZW50SW5kZW50ICsgMVxuICAgIGNvbnN0IGJsb2NrSW5kZW50ID0gc3RhdGUucG9zaXRpb24gLSBzdGF0ZS5saW5lU3RhcnRcblxuICAgIGlmIChpbmRlbnRTdGF0dXMgPT09IDEpIHtcbiAgICAgIGlmICgoYWxsb3dCbG9ja0NvbGxlY3Rpb25zICYmXG4gICAgICAgICAgKHJlYWRCbG9ja1NlcXVlbmNlKHN0YXRlLCBibG9ja0luZGVudCwgcHJvcHMpIHx8XG4gICAgICAgICAgIHJlYWRCbG9ja01hcHBpbmcoc3RhdGUsIGJsb2NrSW5kZW50LCBmbG93SW5kZW50LCBwcm9wcykpKSB8fFxuICAgICAgICAgIHJlYWRGbG93Q29sbGVjdGlvbihzdGF0ZSwgZmxvd0luZGVudCwgcHJvcHMpKSB7XG4gICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgICAgICAgaWYgKHByb3BlcnR5U3RhcnQgIT09IG51bGwgJiYgYWxsb3dQcm9wZXJ0eU1hcHBpbmcgJiYgYWxsb3dCbG9ja1N0eWxlcyAmJiAhYWxsb3dCbG9ja0NvbGxlY3Rpb25zICYmXG4gICAgICAgICAgICBjaCAhPT0gMHg3Qy8qIHwgKi8gJiYgY2ggIT09IDB4M0UvKiA+ICovKSB7XG4gICAgICAgICAgY29uc3QgZmFsbGJhY2tTdGF0ZSA9IHNuYXBzaG90U3RhdGUoc3RhdGUpXG4gICAgICAgICAgY29uc3QgcHJvcGVydHlJbmRlbnQgPSBwcm9wZXJ0eVN0YXJ0LnBvc2l0aW9uIC0gcHJvcGVydHlTdGFydC5saW5lU3RhcnRcblxuICAgICAgICAgIHJlc3RvcmVTdGF0ZShzdGF0ZSwgcHJvcGVydHlTdGFydClcblxuICAgICAgICAgIGlmIChyZWFkQmxvY2tNYXBwaW5nKHN0YXRlLCBwcm9wZXJ0eUluZGVudCwgZmxvd0luZGVudCwgZW1wdHlQcm9wZXJ0aWVzKCkpICYmXG4gICAgICAgICAgICAgIHN0YXRlLmV2ZW50c1tmYWxsYmFja1N0YXRlLmV2ZW50c0xlbmd0aF0/LnR5cGUgPT09IEVWRU5UX01BUFBJTkcpIHtcbiAgICAgICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3RvcmVTdGF0ZShzdGF0ZSwgZmFsbGJhY2tTdGF0ZSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWhhc0NvbnRlbnQgJiZcbiAgICAgICAgICAgICgoYWxsb3dCbG9ja1NjYWxhcnMgJiYgcmVhZEJsb2NrU2NhbGFyKHN0YXRlLCBmbG93SW5kZW50LCBwcm9wcykpIHx8XG4gICAgICAgICAgICAgcmVhZFNpbmdsZVF1b3RlZFNjYWxhcihzdGF0ZSwgZmxvd0luZGVudCwgcHJvcHMpIHx8XG4gICAgICAgICAgICAgcmVhZERvdWJsZVF1b3RlZFNjYWxhcihzdGF0ZSwgZmxvd0luZGVudCwgcHJvcHMpIHx8XG4gICAgICAgICAgICAgcmVhZEFsaWFzKHN0YXRlLCBwcm9wcykgfHxcbiAgICAgICAgICAgICByZWFkUGxhaW5TY2FsYXIoc3RhdGUsIGZsb3dJbmRlbnQsIG5vZGVDb250ZXh0LCBwcm9wcykpKSB7XG4gICAgICAgICAgaGFzQ29udGVudCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaW5kZW50U3RhdHVzID09PSAwKSB7XG4gICAgICBoYXNDb250ZW50ID0gYWxsb3dCbG9ja0NvbGxlY3Rpb25zICYmIHJlYWRCbG9ja1NlcXVlbmNlKHN0YXRlLCBibG9ja0luZGVudCwgcHJvcHMpXG4gICAgfVxuICB9XG5cbiAgYWxsb3dCbG9ja1NjYWxhcnMgPSBhbGxvd0Jsb2NrU2NhbGFycyAmJiAhaGFzQ29udGVudFxuXG4gIGlmICghaGFzQ29udGVudCAmJiAocHJvcHMuYW5jaG9yU3RhcnQgIT09IE5PX1JBTkdFIHx8IHByb3BzLnRhZ1N0YXJ0ICE9PSBOT19SQU5HRSB8fCBhbGxvd0Jsb2NrU2NhbGFycykpIHtcbiAgICBhZGRTY2FsYXJFdmVudChcbiAgICAgIHN0YXRlLFxuICAgICAgTk9fUkFOR0UsXG4gICAgICBOT19SQU5HRSxcbiAgICAgIHByb3BzLmFuY2hvclN0YXJ0LFxuICAgICAgcHJvcHMuYW5jaG9yRW5kLFxuICAgICAgcHJvcHMudGFnU3RhcnQsXG4gICAgICBwcm9wcy50YWdFbmQsXG4gICAgICBTQ0FMQVJfU1RZTEVfUExBSU5cbiAgICApXG4gICAgaGFzQ29udGVudCA9IHRydWVcbiAgfVxuXG4gIHN0YXRlLmRlcHRoLS1cbiAgcmV0dXJuIGhhc0NvbnRlbnQgfHwgcHJvcHMuYW5jaG9yU3RhcnQgIT09IE5PX1JBTkdFIHx8IHByb3BzLnRhZ1N0YXJ0ICE9PSBOT19SQU5HRVxufVxuXG5mdW5jdGlvbiByZWFkRGlyZWN0aXZlIChzdGF0ZTogUGFyc2VyU3RhdGUpIHtcbiAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPiAwIHx8IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAweDI1LyogJSAqLykgcmV0dXJuIGZhbHNlXG5cbiAgc3RhdGUucG9zaXRpb24rK1xuICBjb25zdCBuYW1lU3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCAmJiAhaXNXc09yRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkgc3RhdGUucG9zaXRpb24rK1xuXG4gIGNvbnN0IG5hbWUgPSBzdGF0ZS5pbnB1dC5zbGljZShuYW1lU3RhcnQsIHN0YXRlLnBvc2l0aW9uKVxuICBjb25zdCBhcmdzOiBzdHJpbmdbXSA9IFtdXG5cbiAgaWYgKG5hbWUubGVuZ3RoID09PSAwKSB0aHJvd0Vycm9yKHN0YXRlLCAnZGlyZWN0aXZlIG5hbWUgbXVzdCBub3QgYmUgbGVzcyB0aGFuIG9uZSBjaGFyYWN0ZXIgaW4gbGVuZ3RoJylcblxuICB3aGlsZSAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgIT09IDAgJiYgIWlzRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkge1xuICAgIHdoaWxlIChpc1doaXRlU3BhY2Uoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpKSBzdGF0ZS5wb3NpdGlvbisrXG4gICAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAweDIzLyogIyAqLyB8fCBpc0VvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSkgfHwgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDApIGJyZWFrXG5cbiAgICBjb25zdCBzdGFydCA9IHN0YXRlLnBvc2l0aW9uXG4gICAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwICYmICFpc1dzT3JFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpKSBzdGF0ZS5wb3NpdGlvbisrXG4gICAgYXJncy5wdXNoKHN0YXRlLmlucHV0LnNsaWNlKHN0YXJ0LCBzdGF0ZS5wb3NpdGlvbikpXG4gIH1cblxuICBpZiAoaXNFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpKSBjb25zdW1lTGluZUJyZWFrKHN0YXRlKVxuXG4gIGlmIChuYW1lID09PSAnWUFNTCcpIHtcbiAgICBpZiAoc3RhdGUuZGlyZWN0aXZlcy5zb21lKGRpcmVjdGl2ZSA9PiBkaXJlY3RpdmUua2luZCA9PT0gJ3lhbWwnKSkgdGhyb3dFcnJvcihzdGF0ZSwgJ2R1cGxpY2F0aW9uIG9mICVZQU1MIGRpcmVjdGl2ZScpXG4gICAgaWYgKGFyZ3MubGVuZ3RoICE9PSAxKSB0aHJvd0Vycm9yKHN0YXRlLCAnWUFNTCBkaXJlY3RpdmUgYWNjZXB0cyBleGFjdGx5IG9uZSBhcmd1bWVudCcpXG5cbiAgICBjb25zdCBtYXRjaCA9IC9eKFswLTldKylcXC4oWzAtOV0rKSQvLmV4ZWMoYXJnc1swXSlcbiAgICBpZiAobWF0Y2ggPT09IG51bGwpIHRocm93RXJyb3Ioc3RhdGUsICdpbGwtZm9ybWVkIGFyZ3VtZW50IG9mIHRoZSBZQU1MIGRpcmVjdGl2ZScpXG4gICAgaWYgKHBhcnNlSW50KG1hdGNoWzFdLCAxMCkgIT09IDEpIHRocm93RXJyb3Ioc3RhdGUsICd1bmFjY2VwdGFibGUgWUFNTCB2ZXJzaW9uIG9mIHRoZSBkb2N1bWVudCcpXG5cbiAgICBzdGF0ZS5kaXJlY3RpdmVzLnB1c2goeyBraW5kOiAneWFtbCcsIHZlcnNpb246IGFyZ3NbMF0gfSlcbiAgfSBlbHNlIGlmIChuYW1lID09PSAnVEFHJykge1xuICAgIGlmIChhcmdzLmxlbmd0aCAhPT0gMikgdGhyb3dFcnJvcihzdGF0ZSwgJ1RBRyBkaXJlY3RpdmUgYWNjZXB0cyBleGFjdGx5IHR3byBhcmd1bWVudHMnKVxuXG4gICAgY29uc3QgW2hhbmRsZSwgcHJlZml4XSA9IGFyZ3NcbiAgICBpZiAoIVBBVFRFUk5fVEFHX0hBTkRMRS50ZXN0KGhhbmRsZSkpIHRocm93RXJyb3Ioc3RhdGUsICdpbGwtZm9ybWVkIHRhZyBoYW5kbGUgKGZpcnN0IGFyZ3VtZW50KSBvZiB0aGUgVEFHIGRpcmVjdGl2ZScpXG4gICAgaWYgKEhBU19PV04uY2FsbChzdGF0ZS50YWdIYW5kbGVycywgaGFuZGxlKSkgdGhyb3dFcnJvcihzdGF0ZSwgYHRoZXJlIGlzIGEgcHJldmlvdXNseSBkZWNsYXJlZCBzdWZmaXggZm9yIFwiJHtoYW5kbGV9XCIgdGFnIGhhbmRsZWApXG4gICAgaWYgKCFQQVRURVJOX1RBR19QUkVGSVgudGVzdChwcmVmaXgpKSB0aHJvd0Vycm9yKHN0YXRlLCAnaWxsLWZvcm1lZCB0YWcgcHJlZml4IChzZWNvbmQgYXJndW1lbnQpIG9mIHRoZSBUQUcgZGlyZWN0aXZlJylcbiAgICB0cnkge1xuICAgICAgZGVjb2RlVVJJQ29tcG9uZW50KHByZWZpeClcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsIGB0YWcgcHJlZml4IGlzIG1hbGZvcm1lZDogJHtwcmVmaXh9YClcbiAgICB9XG5cbiAgICBzdGF0ZS50YWdIYW5kbGVyc1toYW5kbGVdID0gcHJlZml4XG4gICAgc3RhdGUuZGlyZWN0aXZlcy5wdXNoKHsga2luZDogJ3RhZycsIGhhbmRsZSwgcHJlZml4IH0pXG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiByZWFkRG9jdW1lbnQgKHN0YXRlOiBQYXJzZXJTdGF0ZSkge1xuICBzdGF0ZS5kaXJlY3RpdmVzID0gW11cbiAgc3RhdGUudGFnSGFuZGxlcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIGxldCBoYXNEaXJlY3RpdmVzID0gZmFsc2VcblxuICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKVxuXG4gIHdoaWxlIChyZWFkRGlyZWN0aXZlKHN0YXRlKSkge1xuICAgIGhhc0RpcmVjdGl2ZXMgPSB0cnVlXG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSlcbiAgfVxuXG4gIGxldCBleHBsaWNpdFN0YXJ0ID0gZmFsc2VcbiAgbGV0IGV4cGxpY2l0RW5kID0gZmFsc2VcbiAgbGV0IGFsbG93Q29tcGFjdCA9IHRydWVcblxuICBpZiAoc3RhdGUubGluZUluZGVudCA9PT0gMCAmJlxuICAgICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MkQvKiAtICovICYmXG4gICAgICBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSkgPT09IDB4MkQvKiAtICovICYmXG4gICAgICBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMikgPT09IDB4MkQvKiAtICovICYmXG4gICAgICBpc1dzT3JFb2xPckVuZChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMykpKSB7XG4gICAgZXhwbGljaXRTdGFydCA9IHRydWVcbiAgICBjb25zdCBtYXJrZXJMaW5lID0gc3RhdGUubGluZVxuICAgIHN0YXRlLnBvc2l0aW9uICs9IDNcbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKVxuICAgIGFsbG93Q29tcGFjdCA9IHN0YXRlLmxpbmUgPiBtYXJrZXJMaW5lXG4gIH0gZWxzZSBpZiAoaGFzRGlyZWN0aXZlcykge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICdkaXJlY3RpdmVzIGVuZCBtYXJrIGlzIGV4cGVjdGVkJylcbiAgfVxuXG4gIGNvbnN0IGRvY3VtZW50RXZlbnRJbmRleCA9IHN0YXRlLmV2ZW50cy5sZW5ndGhcbiAgaWYgKCFleHBsaWNpdFN0YXJ0ICYmXG4gICAgICBzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmXG4gICAgICBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gMHgyRS8qIC4gKi8gJiZcbiAgICAgIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSkpIHtcbiAgICBzdGF0ZS5wb3NpdGlvbiArPSAzXG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGFkZERvY3VtZW50RXZlbnQoc3RhdGUsIGV4cGxpY2l0U3RhcnQsIGZhbHNlKVxuICBpZiAoIXBhcnNlTm9kZShzdGF0ZSwgc3RhdGUubGluZUluZGVudCAtIDEsIENPTlRFWFRfQkxPQ0tfT1VULCBmYWxzZSwgYWxsb3dDb21wYWN0LCBhbGxvd0NvbXBhY3QpKSB7XG4gICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgfVxuICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKVxuXG4gIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSkpIHtcbiAgICBleHBsaWNpdEVuZCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAweDJFLyogLiAqL1xuICAgIGlmIChleHBsaWNpdEVuZCkge1xuICAgICAgY29uc3QgbWFya2VyTGluZSA9IHN0YXRlLmxpbmVcbiAgICAgIHN0YXRlLnBvc2l0aW9uICs9IDNcbiAgICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUpXG4gICAgICBpZiAoc3RhdGUubGluZSA9PT0gbWFya2VyTGluZSAmJiBzdGF0ZS5wb3NpdGlvbiA8IHN0YXRlLmxlbmd0aCkge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZW5kIG9mIHRoZSBzdHJlYW0gb3IgYSBkb2N1bWVudCBzZXBhcmF0b3IgaXMgZXhwZWN0ZWQnKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGRvY3VtZW50RXZlbnQgPSBzdGF0ZS5ldmVudHNbZG9jdW1lbnRFdmVudEluZGV4XVxuICBpZiAoZG9jdW1lbnRFdmVudD8udHlwZSA9PT0gRVZFTlRfRE9DVU1FTlQpIGRvY3VtZW50RXZlbnQuZXhwbGljaXRFbmQgPSBleHBsaWNpdEVuZFxuXG4gIGFkZFBvcEV2ZW50KHN0YXRlKVxuXG4gIGlmICghZXhwbGljaXRFbmQgJiZcbiAgICAgIHN0YXRlLnBvc2l0aW9uIDwgc3RhdGUubGVuZ3RoICYmXG4gICAgICAhKHN0YXRlLnBvc2l0aW9uID09PSBzdGF0ZS5saW5lU3RhcnQgJiYgdGVzdERvY3VtZW50U2VwYXJhdG9yKHN0YXRlKSkpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZW5kIG9mIHRoZSBzdHJlYW0gb3IgYSBkb2N1bWVudCBzZXBhcmF0b3IgaXMgZXhwZWN0ZWQnKVxuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlRXZlbnRzIChpbnB1dDogc3RyaW5nLCBvcHRpb25zOiBQYXJzZXJPcHRpb25zKTogRXZlbnRbXSB7XG4gIGNvbnN0IGxlbmd0aCA9IGlucHV0Lmxlbmd0aFxuICBjb25zdCBzdGF0ZTogUGFyc2VyU3RhdGUgPSB7XG4gICAgLi4uREVGQVVMVF9QQVJTRVJfT1BUSU9OUyxcbiAgICAuLi5vcHRpb25zLFxuICAgIGlucHV0OiBgJHtpbnB1dH1cXDBgLFxuICAgIGxlbmd0aCxcbiAgICBwb3NpdGlvbjogMCxcbiAgICBsaW5lOiAwLFxuICAgIGxpbmVTdGFydDogMCxcbiAgICBsaW5lSW5kZW50OiAwLFxuICAgIGZpcnN0VGFiSW5MaW5lOiAtMSxcbiAgICBkZXB0aDogMCxcbiAgICBkaXJlY3RpdmVzOiBbXSxcbiAgICB0YWdIYW5kbGVyczogT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICBldmVudHM6IFtdXG4gIH1cblxuICBjb25zdCBudWxscG9zID0gaW5wdXQuaW5kZXhPZignXFwwJylcbiAgaWYgKG51bGxwb3MgIT09IC0xKSB0aHJvd0Vycm9yQXQoaW5wdXQsIG51bGxwb3MsICdudWxsIGJ5dGUgaXMgbm90IGFsbG93ZWQgaW4gaW5wdXQnLCBzdGF0ZS5maWxlbmFtZSlcblxuICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4RkVGRikgc3RhdGUucG9zaXRpb24rK1xuXG4gIHdoaWxlIChzdGF0ZS5wb3NpdGlvbiA8IHN0YXRlLmxlbmd0aCkge1xuICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUpXG4gICAgaWYgKHN0YXRlLnBvc2l0aW9uID49IHN0YXRlLmxlbmd0aCkgYnJlYWtcbiAgICBjb25zdCBkb2N1bWVudFN0YXJ0ID0gc3RhdGUucG9zaXRpb25cbiAgICByZWFkRG9jdW1lbnQoc3RhdGUpXG4gICAgaWYgKHN0YXRlLnBvc2l0aW9uID09PSBkb2N1bWVudFN0YXJ0KSB7XG4gICAgICAvLyBJbnRlcm5hbCBwcm9ncmVzcyBndWFyZDogaWYgcmVhZERvY3VtZW50KCkgZXZlciByZXR1cm5zIHdpdGhvdXRcbiAgICAgIC8vIGNvbnN1bWluZyBpbnB1dCwgc3RvcCBoZXJlIGluc3RlYWQgb2YgbG9vcGluZyBmb3JldmVyLlxuICAgICAgLyogYzggaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdjYW4gbm90IHJlYWQgYSBkb2N1bWVudCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0YXRlLmV2ZW50c1xufVxuXG5leHBvcnQge1xuICBwYXJzZUV2ZW50cyxcbiAgREVGQVVMVF9QQVJTRVJfT1BUSU9OUyxcbiAgdHlwZSBQYXJzZXJPcHRpb25zXG59XG4iLCAiaW1wb3J0IHsgWUFNTEV4Y2VwdGlvbiB9IGZyb20gJy4vY29tbW9uL2V4Y2VwdGlvbi50cydcbmltcG9ydCB7IHBpY2sgfSBmcm9tICcuL2NvbW1vbi9vYmplY3QudHMnXG5pbXBvcnQge1xuICBjb25zdHJ1Y3RGcm9tRXZlbnRzLFxuICBERUZBVUxUX0NPTlNUUlVDVE9SX09QVElPTlMsXG4gIHR5cGUgQ29uc3RydWN0b3JPcHRpb25zXG59IGZyb20gJy4vcGFyc2VyL2NvbnN0cnVjdG9yLnRzJ1xuaW1wb3J0IHtcbiAgcGFyc2VFdmVudHMsXG4gIERFRkFVTFRfUEFSU0VSX09QVElPTlMsXG4gIHR5cGUgUGFyc2VyT3B0aW9uc1xufSBmcm9tICcuL3BhcnNlci9wYXJzZXIudHMnXG5cbi8vIGBzb3VyY2VgIGlzIHN1cHBsaWVkIGJ5IGBsb2FkRG9jdW1lbnRzYCBpdHNlbGYsIG5vdCBieSB0aGUgcHVibGljIGNhbGxlci5cbmludGVyZmFjZSBMb2FkT3B0aW9ucyBleHRlbmRzIFBhcnNlck9wdGlvbnMsIE9taXQ8Q29uc3RydWN0b3JPcHRpb25zLCAnc291cmNlJz4ge31cblxudHlwZSBMb2FkQWxsSXRlcmF0b3IgPSAoZG9jdW1lbnQ6IHVua25vd24pID0+IHZvaWRcblxuY29uc3QgREVGQVVMVF9MT0FEX09QVElPTlM6IFJlcXVpcmVkPExvYWRPcHRpb25zPiA9IHtcbiAgLi4uREVGQVVMVF9QQVJTRVJfT1BUSU9OUyxcbiAgLi4uREVGQVVMVF9DT05TVFJVQ1RPUl9PUFRJT05TXG59XG5cbmZ1bmN0aW9uIGxvYWREb2N1bWVudHMgKGlucHV0OiBzdHJpbmcsIG9wdGlvbnM6IExvYWRPcHRpb25zID0ge30pIHtcbiAgY29uc3Qgb3B0cyA9IHsgLi4uREVGQVVMVF9MT0FEX09QVElPTlMsIC4uLm9wdGlvbnMgfVxuICBjb25zdCBzb3VyY2UgPSBTdHJpbmcoaW5wdXQpXG5cbiAgY29uc3QgUEFSU0VSX09QVF9LRVlTID0gT2JqZWN0LmtleXMoREVGQVVMVF9QQVJTRVJfT1BUSU9OUykgYXNcbiAgICAoa2V5b2YgdHlwZW9mIERFRkFVTFRfUEFSU0VSX09QVElPTlMpW11cbiAgY29uc3QgQ09OU1RSVUNUT1JfT1BUX0tFWVMgPSBPYmplY3Qua2V5cyhERUZBVUxUX0NPTlNUUlVDVE9SX09QVElPTlMpIGFzXG4gICAgKGtleW9mIHR5cGVvZiBERUZBVUxUX0NPTlNUUlVDVE9SX09QVElPTlMpW11cblxuICBjb25zdCBldmVudHMgPSBwYXJzZUV2ZW50cyhzb3VyY2UsIHBpY2sob3B0cywgUEFSU0VSX09QVF9LRVlTKSlcbiAgcmV0dXJuIGNvbnN0cnVjdEZyb21FdmVudHMoZXZlbnRzLCB7IC4uLnBpY2sob3B0cywgQ09OU1RSVUNUT1JfT1BUX0tFWVMpLCBzb3VyY2UgfSlcbn1cblxuLy8gU2lnbmF0dXJlcyB3aXRoIGl0ZXJhdG9yIGFyZSBkZXByZWNhdGVkLiBXaWxsIGJlIHJlbW92ZWQgaW4gdGhlIG5leHQgdmVyc2lvbnMuXG5mdW5jdGlvbiBsb2FkQWxsIChpbnB1dDogc3RyaW5nLCBvcHRpb25zPzogTG9hZE9wdGlvbnMpOiB1bmtub3duW11cbmZ1bmN0aW9uIGxvYWRBbGwgKGlucHV0OiBzdHJpbmcsIGl0ZXJhdG9yOiBudWxsLCBvcHRpb25zPzogTG9hZE9wdGlvbnMpOiB1bmtub3duW11cbmZ1bmN0aW9uIGxvYWRBbGwgKGlucHV0OiBzdHJpbmcsIGl0ZXJhdG9yOiBMb2FkQWxsSXRlcmF0b3IsIG9wdGlvbnM/OiBMb2FkT3B0aW9ucyk6IHZvaWRcbmZ1bmN0aW9uIGxvYWRBbGwgKFxuICBpbnB1dDogc3RyaW5nLFxuICBpdGVyYXRvck9yT3B0aW9ucz86IExvYWRBbGxJdGVyYXRvciB8IExvYWRPcHRpb25zIHwgbnVsbCxcbiAgb3B0aW9ucz86IExvYWRPcHRpb25zXG4pIHtcbiAgbGV0IGl0ZXJhdG9yOiBMb2FkQWxsSXRlcmF0b3IgfCBudWxsID0gbnVsbFxuXG4gIGlmICh0eXBlb2YgaXRlcmF0b3JPck9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBpdGVyYXRvciA9IGl0ZXJhdG9yT3JPcHRpb25zXG4gIH0gZWxzZSBpZiAoaXRlcmF0b3JPck9wdGlvbnMgIT09IG51bGwgJiYgdHlwZW9mIGl0ZXJhdG9yT3JPcHRpb25zID09PSAnb2JqZWN0Jykge1xuICAgIG9wdGlvbnMgPSBpdGVyYXRvck9yT3B0aW9uc1xuICB9XG5cbiAgY29uc3QgZG9jdW1lbnRzID0gbG9hZERvY3VtZW50cyhpbnB1dCwgb3B0aW9ucylcblxuICBpZiAoaXRlcmF0b3IgPT09IG51bGwpIHJldHVybiBkb2N1bWVudHNcbiAgZm9yIChjb25zdCBkb2N1bWVudCBvZiBkb2N1bWVudHMpIGl0ZXJhdG9yKGRvY3VtZW50KVxufVxuXG5mdW5jdGlvbiBsb2FkIChpbnB1dDogc3RyaW5nLCBvcHRpb25zPzogTG9hZE9wdGlvbnMpIHtcbiAgY29uc3QgZG9jdW1lbnRzID0gbG9hZERvY3VtZW50cyhpbnB1dCwgb3B0aW9ucylcblxuICBpZiAoZG9jdW1lbnRzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IFlBTUxFeGNlcHRpb24oJ2V4cGVjdGVkIGEgZG9jdW1lbnQsIGJ1dCB0aGUgaW5wdXQgaXMgZW1wdHknKVxuICBpZiAoZG9jdW1lbnRzLmxlbmd0aCA9PT0gMSkgcmV0dXJuIGRvY3VtZW50c1swXVxuXG4gIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKCdleHBlY3RlZCBhIHNpbmdsZSBkb2N1bWVudCBpbiB0aGUgc3RyZWFtLCBidXQgZm91bmQgbW9yZScpXG59XG5cbmV4cG9ydCB7XG4gIGxvYWQsXG4gIGxvYWRBbGwsXG4gIHR5cGUgTG9hZE9wdGlvbnNcbn1cbiIsICIvLyBQbGFpbi1vYmplY3QgZGlzY3JpbWluYXRlZCB1bmlvbiBzaGFyZWQgYnkgdGhlIGR1bXBlciAoYnVpbHQgYnkgYGpzVG9Bc3RgLFxuLy8gcmVuZGVyZWQgYnkgdGhlIHByZXNlbnRlcikgYW5kLCBsYXRlciwgYnkgbG9hZC4gQmVoYXZpb3VyIGxpdmVzIGluIHRoZSB3YWxrZXJzLFxuLy8gbm90IG9uIHRoZSBub2Rlcy5cblxuaW1wb3J0IHsgdHlwZSBEb2N1bWVudERpcmVjdGl2ZSB9IGZyb20gJy4uL3BhcnNlci9ldmVudHMudHMnXG5cbmNsYXNzIFN0eWxlIHtcbiAgdGFnZ2VkID0gZmFsc2VcbiAgZmxvdyA9IGZhbHNlXG4gIHNpbmdsZVF1b3RlZCA9IGZhbHNlXG4gIGRvdWJsZVF1b3RlZCA9IGZhbHNlXG4gIGxpdGVyYWwgPSBmYWxzZVxuICBmb2xkZWQgPSBmYWxzZVxufVxuXG5pbnRlcmZhY2UgTm9kZUJhc2Uge1xuICAvLyBZQU1MIHRhZy4gVW50YWdnZWQgbm9kZXMgY2FycnkgdGhlIHNlbWFudGljIHJlc29sdmVkIHRhZzsgdGFnZ2VkIG5vZGVzIGNhcnJ5XG4gIC8vIHRoZSBwcmludGFibGUvdmVyYmF0aW0gdGFnIHNwZWxsaW5nLlxuICB0YWc6IHN0cmluZ1xuICBzdHlsZTogU3R5bGVcbiAgYW5jaG9yPzogc3RyaW5nXG5cbiAgLy8gUmVzZXJ2ZWQgZm9yIHRoZSBmb3JtYXR0aW5nIGxheWVyOyBub3QgcG9wdWxhdGVkIGJ5IHRoZSBkdW1wZXIgeWV0LlxuICBjb21tZW50QmVmb3JlPzogc3RyaW5nXG4gIGNvbW1lbnQ/OiBzdHJpbmdcbiAgY29tbWVudEFmdGVyPzogc3RyaW5nXG4gIGJsYW5rQmVmb3JlPzogbnVtYmVyXG59XG5cbmludGVyZmFjZSBTY2FsYXJOb2RlIGV4dGVuZHMgTm9kZUJhc2Uge1xuICBraW5kOiAnc2NhbGFyJ1xuICB2YWx1ZTogc3RyaW5nXG59XG5cbmludGVyZmFjZSBTZXF1ZW5jZU5vZGUgZXh0ZW5kcyBOb2RlQmFzZSB7XG4gIGtpbmQ6ICdzZXF1ZW5jZSdcbiAgaXRlbXM6IE5vZGVbXVxufVxuXG5pbnRlcmZhY2UgTWFwcGluZ05vZGUgZXh0ZW5kcyBOb2RlQmFzZSB7XG4gIGtpbmQ6ICdtYXBwaW5nJ1xuICBpdGVtczogQXJyYXk8eyBrZXk6IE5vZGUsIHZhbHVlOiBOb2RlIH0+XG59XG5cbmludGVyZmFjZSBBbGlhc05vZGUgZXh0ZW5kcyBOb2RlQmFzZSB7XG4gIGtpbmQ6ICdhbGlhcydcbiAgLy8gVGhlIGFuY2hvciBuYW1lIHRoaXMgYWxpYXMgcG9pbnRzIGF0IChgKm5hbWVgKS5cbiAgYW5jaG9yOiBzdHJpbmdcbn1cblxudHlwZSBOb2RlID0gU2NhbGFyTm9kZSB8IFNlcXVlbmNlTm9kZSB8IE1hcHBpbmdOb2RlIHwgQWxpYXNOb2RlXG5cbi8vIFRoZSBsYXllciBhYm92ZSBgTm9kZWA6IGVhY2ggZG9jdW1lbnQgd3JhcHMgb25lIGNvbnRlbnQgbm9kZSBwbHVzIGl0cyBvd25cbi8vIG1hcmtlcnMvZGlyZWN0aXZlcy4gTm90IGEgbWVtYmVyIG9mIGBOb2RlYCDigJQgdGhlIGZpZWxkcyBkaWZmZXIuIERvY3VtZW50XG4vLyBkaXJlY3RpdmVzIGFyZSBvcmRlcmVkIHByZXNlbnRhdGlvbiBkYXRhLlxuaW50ZXJmYWNlIERvY3VtZW50IHtcbiAgY29udGVudHM6IE5vZGUgfCBudWxsICAgICAgICAgICAgLy8gbnVsbCA9IGVtcHR5IGRvY3VtZW50XG4gIGV4cGxpY2l0U3RhcnQ/OiBib29sZWFuICAgICAgICAgIC8vIHByaW50ICctLS0nXG4gIGV4cGxpY2l0RW5kPzogYm9vbGVhbiAgICAgICAgICAgIC8vIHByaW50ICcuLi4nXG4gIGRpcmVjdGl2ZXM6IERvY3VtZW50RGlyZWN0aXZlW11cbn1cblxuZXhwb3J0IHtcbiAgU3R5bGUsXG5cbiAgdHlwZSBOb2RlLFxuICB0eXBlIERvY3VtZW50LFxuICB0eXBlIE5vZGVCYXNlLFxuICB0eXBlIFNjYWxhck5vZGUsXG4gIHR5cGUgU2VxdWVuY2VOb2RlLFxuICB0eXBlIE1hcHBpbmdOb2RlLFxuICB0eXBlIEFsaWFzTm9kZVxufVxuIiwgIi8vIEpTIHZhbHVlIGdyYXBoIOKGkiBBU1QuIEtub3dzIHRhZ3MgKGBpZGVudGlmeWAgLyBgcmVwcmVzZW50YCkuIEEgc2luZ2xlXG4vLyBpZGVudGl0eS1gTWFwYCB3YWxrIGhhbmRsZXMgZGVkdXA6IGEgcmVwZWF0IG9jY3VycmVuY2Ugb2YgYW4gb2JqZWN0IChpbmNsdWRpbmdcbi8vIGEgY3ljbGUpIGJlY29tZXMgYW4gYGFsaWFzYCwgYW5kIHRoZSBmaXJzdCBvY2N1cnJlbmNlIGdldHMgYW4gYGFuY2hvcmAuXG5cbmltcG9ydCB7IFlBTUxFeGNlcHRpb24gfSBmcm9tICcuLi9jb21tb24vZXhjZXB0aW9uLnRzJ1xuaW1wb3J0IHsgdHlwZSBTY2hlbWEgfSBmcm9tICcuLi9zY2hlbWEudHMnXG5pbXBvcnQgeyB0eXBlIFRhZ0RlZmluaXRpb24gfSBmcm9tICcuLi90YWcudHMnXG5pbXBvcnQgeyB0YWdOYW1lU2hvcnQgfSBmcm9tICcuLi9jb21tb24vdGFnbmFtZS50cydcbmltcG9ydCB7XG4gIFN0eWxlLFxuICB0eXBlIERvY3VtZW50LFxuICB0eXBlIE5vZGUsXG4gIHR5cGUgU2NhbGFyTm9kZSxcbiAgdHlwZSBTZXF1ZW5jZU5vZGUsXG4gIHR5cGUgTWFwcGluZ05vZGVcbn0gZnJvbSAnLi9ub2Rlcy50cydcblxuaW50ZXJmYWNlIEZyb21Kc09wdGlvbnMge1xuICBub1JlZnM/OiBib29sZWFuXG4gIHNraXBJbnZhbGlkPzogYm9vbGVhblxufVxuXG4vLyBBIG1hdGNoIGNhbmRpZGF0ZS4gYGltcGxpY2l0VGFnYCBtZWFucyB0aGUgdGFnIGlzIG5vdCBwcmludGVkIChpbXBsaWNpdFxuLy8gc2NhbGFycyBhbmQgdGhlIGRlZmF1bHQgc3RyL3NlcS9tYXAgdGFncykuXG5pbnRlcmZhY2UgUmVwcmVzZW50VHlwZSB7XG4gIHRhZzogVGFnRGVmaW5pdGlvblxuICBpbXBsaWNpdFRhZzogYm9vbGVhblxufVxuXG4vLyBSZXR1cm5lZCBieSBgYnVpbGRgIHdoZW4gbm8gdGFnIG1hdGNoZWQuXG5jb25zdCBJTlZBTElEID0gU3ltYm9sKCdJTlZBTElEJylcblxuaW50ZXJmYWNlIEZyb21Kc1N0YXRlIHtcbiAgcmVwcmVzZW50VHlwZXM6IFJlcHJlc2VudFR5cGVbXVxuICBub1JlZnM6IGJvb2xlYW5cbiAgc2tpcEludmFsaWQ6IGJvb2xlYW5cblxuICAvLyBBbHJlYWR5LWJ1aWx0IGNvbGxlY3Rpb24gdmFsdWVzIOKGkiB0aGVpciBub2RlLCBmb3IgYW5jaG9yL2FsaWFzIGRlZHVwLlxuICByZWZzOiBNYXA8dW5rbm93biwgTm9kZT5cbiAgcmVmQ291bnRlcjogbnVtYmVyXG59XG5cbmZ1bmN0aW9uIGJ1aWxkUmVwcmVzZW50VHlwZXMgKHNjaGVtYTogU2NoZW1hKTogUmVwcmVzZW50VHlwZVtdIHtcbiAgY29uc3QgZGVmYXVsdFRhZ3MgPSBuZXcgU2V0PFRhZ0RlZmluaXRpb24+KFtcbiAgICBzY2hlbWEuZGVmYXVsdFNjYWxhclRhZyxcbiAgICBzY2hlbWEuZGVmYXVsdFNlcXVlbmNlVGFnLFxuICAgIHNjaGVtYS5kZWZhdWx0TWFwcGluZ1RhZ1xuICBdLmZpbHRlcigodCk6IHQgaXMgVGFnRGVmaW5pdGlvbiA9PiB0ICE9PSB1bmRlZmluZWQpKVxuXG4gIC8vIERlZmF1bHQgY29udGFpbmVyL3N0ciB0YWdzIGdvIGxhc3Qgc28gYSBtb3JlIHNwZWNpZmljIHRhZyBpZGVudGlmeWluZyB0aGVcbiAgLy8gc2FtZSBKUyB2YWx1ZSAoZS5nLiBhIGN1c3RvbSB0YWcgb24gYSBwbGFpbiBvYmplY3QpIHdpbnMuXG4gIGNvbnN0IGltcGxpY2l0U2NhbGFycyA9IHNjaGVtYS5pbXBsaWNpdFNjYWxhclRhZ3NcbiAgY29uc3QgZXhwbGljaXRUYWdzID0gc2NoZW1hLnRhZ3MuZmlsdGVyKHQgPT5cbiAgICAhKHQubm9kZUtpbmQgPT09ICdzY2FsYXInICYmIHQuaW1wbGljaXQpICYmICFkZWZhdWx0VGFncy5oYXModCkpXG4gIGNvbnN0IGRlZmF1bHRUYWdzTGFzdCA9IHNjaGVtYS50YWdzLmZpbHRlcih0ID0+IGRlZmF1bHRUYWdzLmhhcyh0KSlcblxuICByZXR1cm4gW1xuICAgIC4uLmltcGxpY2l0U2NhbGFycy5tYXAodGFnID0+ICh7IHRhZywgaW1wbGljaXRUYWc6IHRydWUgfSkpLFxuICAgIC4uLmV4cGxpY2l0VGFncy5tYXAodGFnID0+ICh7IHRhZywgaW1wbGljaXRUYWc6IGZhbHNlIH0pKSxcbiAgICAuLi5kZWZhdWx0VGFnc0xhc3QubWFwKHRhZyA9PiAoeyB0YWcsIGltcGxpY2l0VGFnOiB0cnVlIH0pKVxuICBdXG59XG5cbi8vIEZpcnN0IHRhZyB3aG9zZSBgaWRlbnRpZnlgIGFjY2VwdHMgYG9iamVjdGAuXG5mdW5jdGlvbiBtYXRjaFRhZyAoc3RhdGU6IEZyb21Kc1N0YXRlLCBvYmplY3Q6IHVua25vd24pOiB7IHRhZzogVGFnRGVmaW5pdGlvbiwgdGFnTmFtZTogc3RyaW5nLCBpbXBsaWNpdFRhZzogYm9vbGVhbiB9IHwgbnVsbCB7XG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gc3RhdGUucmVwcmVzZW50VHlwZXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGNvbnN0IHsgdGFnLCBpbXBsaWNpdFRhZyB9ID0gc3RhdGUucmVwcmVzZW50VHlwZXNbaW5kZXhdXG5cbiAgICBpZiAodGFnLmlkZW50aWZ5ICYmIHRhZy5pZGVudGlmeShvYmplY3QpKSB7XG4gICAgICBsZXQgdGFnTmFtZTogc3RyaW5nXG4gICAgICBpZiAodGFnLm1hdGNoQnlUYWdQcmVmaXggJiYgdGFnLnJlcHJlc2VudFRhZ05hbWUpIHtcbiAgICAgICAgdGFnTmFtZSA9IHRhZy5yZXByZXNlbnRUYWdOYW1lKG9iamVjdClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRhZ05hbWUgPSB0YWcudGFnTmFtZVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgdGFnLCB0YWdOYW1lLCBpbXBsaWNpdFRhZyB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGxcbn1cblxuLy8gQnVpbGQgYSBub2RlIGZvciBgb2JqZWN0YCwgb3IgSU5WQUxJRCB3aGVuIG5vIHRhZyBtYXRjaGVzLiBgdW5kZWZpbmVkYCBuZXZlclxuLy8gdGhyb3dzIChjYWxsZXIgZGVjaWRlczogbnVsbCBpbiBhIHNlcXVlbmNlLCBza2lwIGluIGEgbWFwcGluZywgJycgYXQgcm9vdCk7XG4vLyBhbnkgb3RoZXIgdW5yZXByZXNlbnRhYmxlIHZhbHVlIHRocm93cyB1bmxlc3MgYHNraXBJbnZhbGlkYC5cbmZ1bmN0aW9uIGJ1aWxkIChzdGF0ZTogRnJvbUpzU3RhdGUsIG9iamVjdDogdW5rbm93bik6IE5vZGUgfCB0eXBlb2YgSU5WQUxJRCB7XG4gIGlmICghc3RhdGUubm9SZWZzICYmIG9iamVjdCAhPT0gbnVsbCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0Jykge1xuICAgIGNvbnN0IGV4aXN0aW5nID0gc3RhdGUucmVmcy5nZXQob2JqZWN0KVxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgaWYgKGV4aXN0aW5nLmFuY2hvciA9PT0gdW5kZWZpbmVkKSBleGlzdGluZy5hbmNob3IgPSBgcmVmXyR7c3RhdGUucmVmQ291bnRlcisrfWBcbiAgICAgIHJldHVybiB7IGtpbmQ6ICdhbGlhcycsIHRhZzogJycsIHN0eWxlOiBuZXcgU3R5bGUoKSwgYW5jaG9yOiBleGlzdGluZy5hbmNob3IgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG1hdGNoZWQgPSBtYXRjaFRhZyhzdGF0ZSwgb2JqZWN0KVxuXG4gIGlmICghbWF0Y2hlZCkge1xuICAgIGlmIChvYmplY3QgPT09IHVuZGVmaW5lZCkgcmV0dXJuIElOVkFMSURcbiAgICBpZiAoc3RhdGUuc2tpcEludmFsaWQpIHJldHVybiBJTlZBTElEXG4gICAgdGhyb3cgbmV3IFlBTUxFeGNlcHRpb24oYHVuYWNjZXB0YWJsZSBraW5kIG9mIGFuIG9iamVjdCB0byBkdW1wICR7T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCl9YClcbiAgfVxuXG4gIGNvbnN0IHsgdGFnLCB0YWdOYW1lLCBpbXBsaWNpdFRhZyB9ID0gbWF0Y2hlZFxuICBjb25zdCBub2RlVGFnTmFtZSA9IGltcGxpY2l0VGFnID8gdGFnTmFtZSA6IHRhZ05hbWVTaG9ydCh0YWdOYW1lKVxuXG4gIGlmICh0YWcubm9kZUtpbmQgPT09ICdzY2FsYXInKSB7XG4gICAgY29uc3Qgc3R5bGUgPSBuZXcgU3R5bGUoKVxuICAgIHN0eWxlLnRhZ2dlZCA9ICFpbXBsaWNpdFRhZ1xuICAgIGNvbnN0IG5vZGU6IFNjYWxhck5vZGUgPSB7XG4gICAgICBraW5kOiAnc2NhbGFyJyxcbiAgICAgIHRhZzogbm9kZVRhZ05hbWUsXG4gICAgICBzdHlsZSxcbiAgICAgIHZhbHVlOiB0YWcucmVwcmVzZW50KG9iamVjdClcbiAgICB9XG4gICAgcmV0dXJuIG5vZGVcbiAgfVxuXG4gIGlmICh0YWcubm9kZUtpbmQgPT09ICdzZXF1ZW5jZScpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSB0YWcucmVwcmVzZW50KG9iamVjdClcbiAgICBjb25zdCBzdHlsZSA9IG5ldyBTdHlsZSgpXG4gICAgc3R5bGUudGFnZ2VkID0gIWltcGxpY2l0VGFnXG4gICAgY29uc3Qgbm9kZTogU2VxdWVuY2VOb2RlID0geyBraW5kOiAnc2VxdWVuY2UnLCB0YWc6IG5vZGVUYWdOYW1lLCBzdHlsZSwgaXRlbXM6IFtdIH1cbiAgICBpZiAoIXN0YXRlLm5vUmVmcykgc3RhdGUucmVmcy5zZXQob2JqZWN0LCBub2RlKVxuXG4gICAgZm9yIChsZXQgaW5kZXggPSAwLCBsZW5ndGggPSBjb250YWluZXIubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgICAgbGV0IGl0ZW0gPSBidWlsZChzdGF0ZSwgY29udGFpbmVyW2luZGV4XSlcbiAgICAgIC8vIEFuIGludmFsaWQgZWxlbWVudCBiZWNvbWVzIG51bGw7IGEgc3RpbGwtaW52YWxpZCBudWxsIHRoZW4gc2tpcHMvdGhyb3dzLlxuICAgICAgaWYgKGl0ZW0gPT09IElOVkFMSUQgJiYgY29udGFpbmVyW2luZGV4XSA9PT0gdW5kZWZpbmVkKSBpdGVtID0gYnVpbGQoc3RhdGUsIG51bGwpXG4gICAgICBpZiAoaXRlbSA9PT0gSU5WQUxJRCkgY29udGludWVcbiAgICAgIG5vZGUuaXRlbXMucHVzaChpdGVtKVxuICAgIH1cbiAgICByZXR1cm4gbm9kZVxuICB9XG5cbiAgLy8gbWFwcGluZyDigJQgdGhlIGNhbm9uaWNhbCBmb3JtIGlzIGFsd2F5cyBhIGBNYXBgLlxuICBjb25zdCBtYXAgPSB0YWcucmVwcmVzZW50KG9iamVjdClcbiAgY29uc3Qgc3R5bGUgPSBuZXcgU3R5bGUoKVxuICBzdHlsZS50YWdnZWQgPSAhaW1wbGljaXRUYWdcbiAgY29uc3Qgbm9kZTogTWFwcGluZ05vZGUgPSB7IGtpbmQ6ICdtYXBwaW5nJywgdGFnOiBub2RlVGFnTmFtZSwgc3R5bGUsIGl0ZW1zOiBbXSB9XG4gIGlmICghc3RhdGUubm9SZWZzKSBzdGF0ZS5yZWZzLnNldChvYmplY3QsIG5vZGUpXG5cbiAgZm9yIChjb25zdCBbb2JqZWN0S2V5LCBvYmplY3RWYWx1ZV0gb2YgbWFwKSB7XG4gICAgY29uc3Qga2V5ID0gYnVpbGQoc3RhdGUsIG9iamVjdEtleSlcbiAgICBpZiAoa2V5ID09PSBJTlZBTElEKSBjb250aW51ZSAvLyBpbnZhbGlkIGtleSBza2lwcyB0aGUgcGFpclxuICAgIGNvbnN0IHZhbHVlID0gYnVpbGQoc3RhdGUsIG9iamVjdFZhbHVlKVxuICAgIGlmICh2YWx1ZSA9PT0gSU5WQUxJRCkgY29udGludWUgLy8gaW52YWxpZCB2YWx1ZSBza2lwcyB0aGUgcGFpclxuICAgIG5vZGUuaXRlbXMucHVzaCh7IGtleSwgdmFsdWUgfSlcbiAgfVxuICByZXR1cm4gbm9kZVxufVxuXG4vLyBBIEpTIHZhbHVlIGlzIG9uZSBZQU1MIGRvY3VtZW50LiBBbiB1bnJlcHJlc2VudGFibGUgcm9vdCBiZWNvbWVzIGFuIGVtcHR5XG4vLyBkb2N1bWVudCwgd2hpY2ggdGhlIHByZXNlbnRlciByZW5kZXJzIGFzIGFuIGVtcHR5IHN0cmluZy5cbmZ1bmN0aW9uIGpzVG9Bc3QgKGlucHV0OiB1bmtub3duLCBzY2hlbWE6IFNjaGVtYSwgb3B0aW9uczogRnJvbUpzT3B0aW9ucyA9IHt9KTogRG9jdW1lbnRbXSB7XG4gIGNvbnN0IHN0YXRlOiBGcm9tSnNTdGF0ZSA9IHtcbiAgICByZXByZXNlbnRUeXBlczogYnVpbGRSZXByZXNlbnRUeXBlcyhzY2hlbWEpLFxuICAgIG5vUmVmczogb3B0aW9ucy5ub1JlZnMgPz8gZmFsc2UsXG4gICAgc2tpcEludmFsaWQ6IG9wdGlvbnMuc2tpcEludmFsaWQgPz8gZmFsc2UsXG4gICAgcmVmczogbmV3IE1hcCgpLFxuICAgIHJlZkNvdW50ZXI6IDBcbiAgfVxuXG4gIGNvbnN0IHJvb3QgPSBidWlsZChzdGF0ZSwgaW5wdXQpXG4gIHJldHVybiBbeyBjb250ZW50czogcm9vdCA9PT0gSU5WQUxJRCA/IG51bGwgOiByb290LCBkaXJlY3RpdmVzOiBbXSB9XVxufVxuXG5leHBvcnQge1xuICBqc1RvQXN0LFxuICB0eXBlIEZyb21Kc09wdGlvbnNcbn1cbiIsICIvLyBEZXB0aC1maXJzdCBBU1QgdHJhdmVyc2FsLiBNaXJyb3JzIHRoZSBga2luZGAgd2FsayBvZiB0aGUgcHJlc2VudGVyIGFuZCB0aGVcbi8vIGBmcm9tXypgIGJ1aWxkZXJzLCBidXQgc3RheXMgcmVhZC1vcmllbnRlZDogbm9kZXMgYXJlIHBsYWluIG9iamVjdHMsIHNvIGFcbi8vIHZpc2l0b3IgbXV0YXRlcyB0aGVtIGluIHBsYWNlLiBDb250cm9sIHNpZ25hbHMgbGV0IGl0IHBydW5lIG9yIHN0b3AgdGhlIHdhbGsuXG5cbmltcG9ydCB7XG4gIHR5cGUgTm9kZSxcbiAgdHlwZSBEb2N1bWVudFxufSBmcm9tICcuL25vZGVzLnRzJ1xuXG4vLyBSZXR1cm5lZCBieSBhIHZpc2l0b3IgdG8gY29udHJvbCB0aGUgd2FsazsgYW55dGhpbmcgZWxzZSAoaW5jbC4gYHVuZGVmaW5lZGApXG4vLyBkZXNjZW5kcyBhcyB1c3VhbC5cbmNvbnN0IFZJU0lUX0JSRUFLID0gU3ltYm9sKCd2aXNpdDpicmVhaycpIC8vIHN0b3AgdGhlIHdob2xlIHRyYXZlcnNhbFxuY29uc3QgVklTSVRfU0tJUCA9IFN5bWJvbCgndmlzaXQ6c2tpcCcpICAgLy8gZG9uJ3QgZGVzY2VuZCBpbnRvIHRoaXMgbm9kZSdzIGNoaWxkcmVuXG5cbnR5cGUgVmlzaXRDb250cm9sID0gdHlwZW9mIFZJU0lUX0JSRUFLIHwgdHlwZW9mIFZJU0lUX1NLSVAgfCB1bmRlZmluZWQgfCB2b2lkXG5cbi8vIFRyYXZlcnNhbC1kZXJpdmVkIHBvc2l0aW9uIG9mIHRoZSBjdXJyZW50IG5vZGUuIEtlcHQgb2ZmIHRoZSBub2RlIGl0c2VsZjogYVxuLy8gbm9kZSBtYXkgc2l0IGluIHNldmVyYWwgcGxhY2VzIChhbGlhcy9kZWR1cCByZXVzZSksIHNvIGRlcHRoL3JvbGUgYmVsb25nIHRvXG4vLyB0aGUgd2Fsaywgbm90IHRoZSBub2RlLiBgcGFyZW50LmtpbmRgICsgYGlzS2V5YCBwaW4gdGhlIGV4YWN0IHNsb3QuXG5pbnRlcmZhY2UgVmlzaXRDb250ZXh0IHtcbiAgZGVwdGg6IG51bWJlciAgICAgICAgLy8gMCA9IGRvY3VtZW50IGNvbnRlbnQgcm9vdFxuICBwYXJlbnQ6IE5vZGUgfCBudWxsICAvLyBlbmNsb3Npbmcgc2VxdWVuY2UvbWFwcGluZywgbnVsbCBhdCB0aGUgcm9vdFxuICBpc0tleTogYm9vbGVhbiAgICAgICAvLyBub2RlIHNpdHMgaW4gYSBtYXBwaW5nIGtleSBwb3NpdGlvblxufVxuXG50eXBlIFZpc2l0b3IgPSAobm9kZTogTm9kZSwgY3R4OiBWaXNpdENvbnRleHQpID0+IFZpc2l0Q29udHJvbFxuXG4vLyBSZXR1cm5zIGB0cnVlYCBvbmNlIGBWSVNJVF9CUkVBS2Agd2FzIHNlZW4sIHNvIGNhbGxlcnMgY2FuIHVud2luZCB0aGUgd2Fsay5cbmZ1bmN0aW9uIHZpc2l0Tm9kZSAobm9kZTogTm9kZSwgdmlzaXRvcjogVmlzaXRvciwgY3R4OiBWaXNpdENvbnRleHQpOiBib29sZWFuIHtcbiAgY29uc3QgY29udHJvbCA9IHZpc2l0b3Iobm9kZSwgY3R4KVxuICBpZiAoY29udHJvbCA9PT0gVklTSVRfQlJFQUspIHJldHVybiB0cnVlXG4gIGlmIChjb250cm9sID09PSBWSVNJVF9TS0lQKSByZXR1cm4gZmFsc2VcblxuICBjb25zdCBkZXB0aCA9IGN0eC5kZXB0aCArIDFcblxuICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgIGNhc2UgJ3NlcXVlbmNlJzpcbiAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBub2RlLml0ZW1zKSB7XG4gICAgICAgIGlmICh2aXNpdE5vZGUoaXRlbSwgdmlzaXRvciwgeyBkZXB0aCwgcGFyZW50OiBub2RlLCBpc0tleTogZmFsc2UgfSkpIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgJ21hcHBpbmcnOlxuICAgICAgZm9yIChjb25zdCB7IGtleSwgdmFsdWUgfSBvZiBub2RlLml0ZW1zKSB7XG4gICAgICAgIGlmICh2aXNpdE5vZGUoa2V5LCB2aXNpdG9yLCB7IGRlcHRoLCBwYXJlbnQ6IG5vZGUsIGlzS2V5OiB0cnVlIH0pKSByZXR1cm4gdHJ1ZVxuICAgICAgICBpZiAodmlzaXROb2RlKHZhbHVlLCB2aXNpdG9yLCB7IGRlcHRoLCBwYXJlbnQ6IG5vZGUsIGlzS2V5OiBmYWxzZSB9KSkgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuLy8gV2FsayBldmVyeSBub2RlIGluIHRoZSBkb2N1bWVudHMsIGNhbGxpbmcgYHZpc2l0b3JgIG9uY2UgcGVyIG5vZGUgKHByZS1vcmRlcikuXG5mdW5jdGlvbiB2aXNpdCAoZG9jdW1lbnRzOiBEb2N1bWVudFtdLCB2aXNpdG9yOiBWaXNpdG9yKTogdm9pZCB7XG4gIGZvciAoY29uc3QgZG9jIG9mIGRvY3VtZW50cykge1xuICAgIGlmIChkb2MuY29udGVudHMgJiYgdmlzaXROb2RlKGRvYy5jb250ZW50cywgdmlzaXRvciwgeyBkZXB0aDogMCwgcGFyZW50OiBudWxsLCBpc0tleTogZmFsc2UgfSkpIHJldHVyblxuICB9XG59XG5cbmV4cG9ydCB7XG4gIHZpc2l0LFxuICBWSVNJVF9CUkVBSyxcbiAgVklTSVRfU0tJUCxcbiAgdHlwZSBWaXNpdG9yLFxuICB0eXBlIFZpc2l0Q29udGV4dFxufVxuIiwgIi8vIEFTVCDihpIgdGV4dC4gV2Fsa3MgdGhlIG5vZGUgYGtpbmRgOyB0aGUgc2NhbGFyIG1hY2hpbmVyeSAoc3R5bGUgc2VsZWN0aW9uLFxuLy8gcXVvdGluZywgZm9sZGluZykgaXMgZHJpdmVuIGJ5IG5vZGUgdGV4dCwgbm90IGJ5IHNuaWZmaW5nIGEgSlMgdmFsdWUuXG5cbmltcG9ydCB7IFlBTUxFeGNlcHRpb24gfSBmcm9tICcuLi9jb21tb24vZXhjZXB0aW9uLnRzJ1xuaW1wb3J0IHsgdGFnTmFtZVNob3J0IH0gZnJvbSAnLi4vY29tbW9uL3RhZ25hbWUudHMnXG5pbXBvcnQgeyB0eXBlIFNjaGVtYSB9IGZyb20gJy4uL3NjaGVtYS50cydcbmltcG9ydCB7IE5PVF9SRVNPTFZFRCwgdHlwZSBTY2FsYXJUYWdEZWZpbml0aW9uIH0gZnJvbSAnLi4vdGFnLnRzJ1xuaW1wb3J0IHtcbiAgdHlwZSBOb2RlLFxuICB0eXBlIERvY3VtZW50LFxuICB0eXBlIFNjYWxhck5vZGUsXG4gIHR5cGUgU2VxdWVuY2VOb2RlLFxuICB0eXBlIE1hcHBpbmdOb2RlXG59IGZyb20gJy4vbm9kZXMudHMnXG5cbmNvbnN0IENIQVJfQk9NID0gMHhGRUZGXG5jb25zdCBDSEFSX1RBQiA9IDB4MDkgLyogVGFiICovXG5jb25zdCBDSEFSX0xJTkVfRkVFRCA9IDB4MEEgLyogTEYgKi9cbmNvbnN0IENIQVJfQ0FSUklBR0VfUkVUVVJOID0gMHgwRCAvKiBDUiAqL1xuY29uc3QgQ0hBUl9TUEFDRSA9IDB4MjAgLyogU3BhY2UgKi9cbmNvbnN0IENIQVJfRVhDTEFNQVRJT04gPSAweDIxIC8qICEgKi9cbmNvbnN0IENIQVJfRE9VQkxFX1FVT1RFID0gMHgyMiAvKiBcIiAqL1xuY29uc3QgQ0hBUl9TSEFSUCA9IDB4MjMgLyogIyAqL1xuY29uc3QgQ0hBUl9QRVJDRU5UID0gMHgyNSAvKiAlICovXG5jb25zdCBDSEFSX0FNUEVSU0FORCA9IDB4MjYgLyogJiAqL1xuY29uc3QgQ0hBUl9TSU5HTEVfUVVPVEUgPSAweDI3IC8qICcgKi9cbmNvbnN0IENIQVJfQVNURVJJU0sgPSAweDJBIC8qICogKi9cbmNvbnN0IENIQVJfQ09NTUEgPSAweDJDIC8qICwgKi9cbmNvbnN0IENIQVJfTUlOVVMgPSAweDJEIC8qIC0gKi9cbmNvbnN0IENIQVJfQ09MT04gPSAweDNBIC8qIDogKi9cbmNvbnN0IENIQVJfRVFVQUxTID0gMHgzRCAvKiA9ICovXG5jb25zdCBDSEFSX0dSRUFURVJfVEhBTiA9IDB4M0UgLyogPiAqL1xuY29uc3QgQ0hBUl9RVUVTVElPTiA9IDB4M0YgLyogPyAqL1xuY29uc3QgQ0hBUl9DT01NRVJDSUFMX0FUID0gMHg0MCAvKiBAICovXG5jb25zdCBDSEFSX0xFRlRfU1FVQVJFX0JSQUNLRVQgPSAweDVCIC8qIFsgKi9cbmNvbnN0IENIQVJfUklHSFRfU1FVQVJFX0JSQUNLRVQgPSAweDVEIC8qIF0gKi9cbmNvbnN0IENIQVJfR1JBVkVfQUNDRU5UID0gMHg2MCAvKiBgICovXG5jb25zdCBDSEFSX0xFRlRfQ1VSTFlfQlJBQ0tFVCA9IDB4N0IgLyogeyAqL1xuY29uc3QgQ0hBUl9WRVJUSUNBTF9MSU5FID0gMHg3QyAvKiB8ICovXG5jb25zdCBDSEFSX1JJR0hUX0NVUkxZX0JSQUNLRVQgPSAweDdEIC8qIH0gKi9cblxuY29uc3QgRVNDQVBFX1NFUVVFTkNFUzogUmVjb3JkPG51bWJlciwgc3RyaW5nPiA9IHt9XG5cbkVTQ0FQRV9TRVFVRU5DRVNbMHgwMF0gPSAnXFxcXDAnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MDddID0gJ1xcXFxhJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDA4XSA9ICdcXFxcYidcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwOV0gPSAnXFxcXHQnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MEFdID0gJ1xcXFxuJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDBCXSA9ICdcXFxcdidcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwQ10gPSAnXFxcXGYnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MERdID0gJ1xcXFxyJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDFCXSA9ICdcXFxcZSdcbkVTQ0FQRV9TRVFVRU5DRVNbMHgyMl0gPSAnXFxcXFwiJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDVDXSA9ICdcXFxcXFxcXCdcbkVTQ0FQRV9TRVFVRU5DRVNbMHg4NV0gPSAnXFxcXE4nXG5FU0NBUEVfU0VRVUVOQ0VTWzB4QTBdID0gJ1xcXFxfJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDIwMjhdID0gJ1xcXFxMJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDIwMjldID0gJ1xcXFxQJ1xuXG5pbnRlcmZhY2UgUHJlc2VudGVyT3B0aW9ucyB7XG4gIHNjaGVtYTogU2NoZW1hXG4gIGluZGVudD86IG51bWJlclxuICBzZXFOb0luZGVudD86IGJvb2xlYW5cbiAgc2VxSW5saW5lRmlyc3Q/OiBib29sZWFuXG4gIHNvcnRLZXlzPzogYm9vbGVhbiB8ICgoYTogYW55LCBiOiBhbnkpID0+IG51bWJlcilcbiAgbGluZVdpZHRoPzogbnVtYmVyXG4gIGZsb3dCcmFja2V0UGFkZGluZz86IGJvb2xlYW5cbiAgZmxvd1NraXBDb21tYVNwYWNlPzogYm9vbGVhblxuICBmbG93U2tpcENvbG9uU3BhY2U/OiBib29sZWFuXG4gIHF1b3RlRmxvd0tleXM/OiBib29sZWFuXG4gIHF1b3RlU3R5bGU/OiAnc2luZ2xlJyB8ICdkb3VibGUnXG4gIGZvcmNlUXVvdGVzPzogYm9vbGVhblxuICB0YWdCZWZvcmVBbmNob3I/OiBib29sZWFuXG59XG5cbmNvbnN0IERFRkFVTFRfUFJFU0VOVEVSX09QVElPTlM6IFJlcXVpcmVkPE9taXQ8UHJlc2VudGVyT3B0aW9ucywgJ3NjaGVtYSc+PiA9IHtcbiAgaW5kZW50OiAyLFxuICBzZXFOb0luZGVudDogZmFsc2UsXG4gIHNlcUlubGluZUZpcnN0OiB0cnVlLFxuICBzb3J0S2V5czogZmFsc2UsXG4gIGxpbmVXaWR0aDogODAsXG4gIGZsb3dCcmFja2V0UGFkZGluZzogZmFsc2UsXG4gIGZsb3dTa2lwQ29tbWFTcGFjZTogZmFsc2UsXG4gIGZsb3dTa2lwQ29sb25TcGFjZTogZmFsc2UsXG4gIHF1b3RlRmxvd0tleXM6IGZhbHNlLFxuICBxdW90ZVN0eWxlOiAnc2luZ2xlJyxcbiAgZm9yY2VRdW90ZXM6IGZhbHNlLFxuICB0YWdCZWZvcmVBbmNob3I6IGZhbHNlXG59XG5cbmludGVyZmFjZSBQcmVzZW50ZXJTdGF0ZSBleHRlbmRzIFJlcXVpcmVkPFByZXNlbnRlck9wdGlvbnM+IHtcbiAgZGVmYXVsdFNjYWxhclRhZ05hbWU6IHN0cmluZ1xuICBpbXBsaWNpdFJlc29sdmVyczogcmVhZG9ubHkgU2NhbGFyVGFnRGVmaW5pdGlvbltdXG59XG5cbmZ1bmN0aW9uIG5vZGVUYWdTaG9ydCAobm9kZTogTm9kZSkge1xuICByZXR1cm4gbm9kZS5zdHlsZS50YWdnZWQgPyBub2RlLnRhZyA6IHRhZ05hbWVTaG9ydChub2RlLnRhZylcbn1cblxuZnVuY3Rpb24gY3JlYXRlUHJlc2VudGVyU3RhdGUgKG9wdGlvbnM6IFByZXNlbnRlck9wdGlvbnMpOiBQcmVzZW50ZXJTdGF0ZSB7XG4gIGNvbnN0IG9wdHMgPSB7XG4gICAgLi4uREVGQVVMVF9QUkVTRU5URVJfT1BUSU9OUyxcbiAgICAuLi5vcHRpb25zXG4gIH1cblxuICByZXR1cm4ge1xuICAgIC4uLm9wdHMsXG4gICAgZGVmYXVsdFNjYWxhclRhZ05hbWU6IG9wdHMuc2NoZW1hLmRlZmF1bHRTY2FsYXJUYWcudGFnTmFtZSxcbiAgICBpbXBsaWNpdFJlc29sdmVyczogb3B0cy5zY2hlbWEuaW1wbGljaXRTY2FsYXJUYWdzXG4gIH1cbn1cblxuZnVuY3Rpb24gZW5jb2RlTm9uUHJpbnRhYmxlIChjaGFyYWN0ZXI6IG51bWJlcikge1xuICAvLyBZQU1MIG5vbi1wcmludGFibGUgY29kZSBwb2ludHMgYXJlIGFsbCBpbiBCTVAgKG1heCBGRkZGKTtcbiAgLy8gYXN0cmFsIGNvZGUgcG9pbnRzIGFyZSBwcmludGFibGUgYW5kIGNhbid0IGNvbWUgaGVyZS5cbiAgY29uc3Qgc3RyaW5nID0gY2hhcmFjdGVyLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpXG4gIGNvbnN0IGhhbmRsZSA9IGNoYXJhY3RlciA8PSAweEZGID8gJ3gnIDogJ3UnXG4gIGNvbnN0IGxlbmd0aCA9IGNoYXJhY3RlciA8PSAweEZGID8gMiA6IDRcblxuICByZXR1cm4gYFxcXFwke2hhbmRsZX0keycwJy5yZXBlYXQobGVuZ3RoIC0gc3RyaW5nLmxlbmd0aCl9JHtzdHJpbmd9YFxufVxuXG4vLyBJbmRlbnRzIGV2ZXJ5IGxpbmUgaW4gYSBzdHJpbmcuIEVtcHR5IGxpbmVzIChcXG4gb25seSkgYXJlIG5vdCBpbmRlbnRlZC5cbmZ1bmN0aW9uIGluZGVudFN0cmluZyAoc3RyaW5nOiBzdHJpbmcsIHNwYWNlczogbnVtYmVyKSB7XG4gIGNvbnN0IGluZCA9ICcgJy5yZXBlYXQoc3BhY2VzKVxuICBsZXQgcG9zaXRpb24gPSAwXG4gIGxldCByZXN1bHQgPSAnJ1xuICBjb25zdCBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG5cbiAgd2hpbGUgKHBvc2l0aW9uIDwgbGVuZ3RoKSB7XG4gICAgbGV0IGxpbmVcbiAgICBjb25zdCBuZXh0ID0gc3RyaW5nLmluZGV4T2YoJ1xcbicsIHBvc2l0aW9uKVxuICAgIGlmIChuZXh0ID09PSAtMSkge1xuICAgICAgbGluZSA9IHN0cmluZy5zbGljZShwb3NpdGlvbilcbiAgICAgIHBvc2l0aW9uID0gbGVuZ3RoXG4gICAgfSBlbHNlIHtcbiAgICAgIGxpbmUgPSBzdHJpbmcuc2xpY2UocG9zaXRpb24sIG5leHQgKyAxKVxuICAgICAgcG9zaXRpb24gPSBuZXh0ICsgMVxuICAgIH1cblxuICAgIGlmIChsaW5lLmxlbmd0aCAmJiBsaW5lICE9PSAnXFxuJykgcmVzdWx0ICs9IGluZFxuXG4gICAgcmVzdWx0ICs9IGxpbmVcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVOZXh0TGluZSAoc3RhdGU6IFByZXNlbnRlclN0YXRlLCBsZXZlbDogbnVtYmVyKSB7XG4gIHJldHVybiBgXFxuJHsnICcucmVwZWF0KHN0YXRlLmluZGVudCAqIGxldmVsKX1gXG59XG5cbi8vIEluZGVudGF0aW9uL3dpZHRoIG51bWJlcnMgdGhhdCBnb3Zlcm4gaG93IGEgc2NhbGFyIGxheXMgb3V0IGF0IGBsZXZlbGAuXG4vLyBTY2FsYXItb25seTogY29sbGVjdGlvbnMgY29tcHV0ZSB0aGVpciBvd24gaW5kZW50IHZpYSBgZ2VuZXJhdGVOZXh0TGluZWAuXG4vLyAgIGluZGVudCAgICAgIC0gc3BhY2VzIHByZXBlbmRlZCB0byB0aGUgc2NhbGFyJ3MgY29udGVudCAoYmxvY2sgc3R5bGVzKVxuLy8gICBibG9ja0luZGVudCAtIHRoZSBibG9jayBpbmRlbnRhdGlvbiBpbmRpY2F0b3IgZGlnaXQgKGB8MmAgLyBgPjJgKTsgYXQgdGhlXG4vLyAgICAgICAgICAgICAgICAgZG9jdW1lbnQgcm9vdCAobGV2ZWwgMCkgaXQgaXMgb25lIGdyZWF0ZXIgdGhhbiB0aGUgc3BhY2VzIHdlXG4vLyAgICAgICAgICAgICAgICAgYWN0dWFsbHkgcHJlcGVuZCAocmVhZGVyIGFwcGxpZXMgaXQgcmVsYXRpdmUgdG8gcGFyZW50IG4gPSAtMSlcbi8vICAgbGluZVdpZHRoICAgLSBmb2xkIHdpZHRoIGF0IHRoaXMgZGVwdGgsIHNocmlua2luZyBtb25vdG9uaWNhbGx5IHRvd2FyZFxuLy8gICAgICAgICAgICAgICAgIG1pbihzdGF0ZS5saW5lV2lkdGgsIDQwKSBhcyBpbmRlbnRhdGlvbiBkZWVwZW5zOyAtMSA9IG5vIGxpbWl0XG5mdW5jdGlvbiBzY2FsYXJMYXlvdXQgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgbGV2ZWw6IG51bWJlcikge1xuICBjb25zdCBpbmRlbnQgPSBzdGF0ZS5pbmRlbnQgKiBNYXRoLm1heCgxLCBsZXZlbCkgLy8gbm8gMC1pbmRlbnQgc2NhbGFyc1xuICBjb25zdCBibG9ja0luZGVudCA9IGxldmVsID09PSAwID8gc3RhdGUuaW5kZW50ICsgMSA6IHN0YXRlLmluZGVudFxuICBjb25zdCBsaW5lV2lkdGggPSAoc3RhdGUubGluZVdpZHRoID09PSAtMSlcbiAgICA/IC0xXG4gICAgOiBNYXRoLm1heChNYXRoLm1pbihzdGF0ZS5saW5lV2lkdGgsIDQwKSwgc3RhdGUubGluZVdpZHRoIC0gaW5kZW50KVxuXG4gIHJldHVybiB7IGluZGVudCwgYmxvY2tJbmRlbnQsIGxpbmVXaWR0aCB9XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVJbXBsaWNpdFRhZyAoc3RhdGU6IFByZXNlbnRlclN0YXRlLCBzdHI6IHN0cmluZykge1xuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IHN0YXRlLmltcGxpY2l0UmVzb2x2ZXJzLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCB0YWdEZWZpbml0aW9uID0gc3RhdGUuaW1wbGljaXRSZXNvbHZlcnNbaW5kZXhdXG5cbiAgICBpZiAodGFnRGVmaW5pdGlvbi5yZXNvbHZlKHN0ciwgZmFsc2UsIHRhZ0RlZmluaXRpb24udGFnTmFtZSkgIT09IE5PVF9SRVNPTFZFRCkge1xuICAgICAgcmV0dXJuIHRhZ0RlZmluaXRpb24udGFnTmFtZVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdGF0ZS5kZWZhdWx0U2NhbGFyVGFnTmFtZVxufVxuXG4vLyBbMzNdIHMtd2hpdGUgOjo9IHMtc3BhY2UgfCBzLXRhYlxuZnVuY3Rpb24gaXNXaGl0ZXNwYWNlIChjOiBudW1iZXIpIHtcbiAgcmV0dXJuIGMgPT09IENIQVJfU1BBQ0UgfHwgYyA9PT0gQ0hBUl9UQUJcbn1cblxuLy8gTWlycm9ycyBwYXJzZXIudGVzdERvY3VtZW50U2VwYXJhdG9yKCk6IGAtLS1gIGFuZCBgLi4uYCBhcmUgZG9jdW1lbnRcbi8vIG1hcmtlcnMgd2hlbiBmb2xsb3dlZCBieSBzZXBhcmF0aW9uIHdoaXRlc3BhY2UsIGEgbGluZSBicmVhaywgb3IgRU9GLlxuZnVuY3Rpb24gc3RhcnRzV2l0aERvY3VtZW50U2VwYXJhdG9yIChzdHJpbmc6IHN0cmluZykge1xuICBjb25zdCBtYXJrZXIgPSBzdHJpbmcuY2hhckNvZGVBdCgwKVxuXG4gIGlmICgobWFya2VyICE9PSBDSEFSX01JTlVTICYmIG1hcmtlciAhPT0gMHgyRS8qIC4gKi8pIHx8XG4gICAgICBzdHJpbmcuY2hhckNvZGVBdCgxKSAhPT0gbWFya2VyIHx8IHN0cmluZy5jaGFyQ29kZUF0KDIpICE9PSBtYXJrZXIpIHJldHVybiBmYWxzZVxuXG4gIGlmIChzdHJpbmcubGVuZ3RoID09PSAzKSByZXR1cm4gdHJ1ZVxuXG4gIGNvbnN0IGZvbGxvd2luZyA9IHN0cmluZy5jaGFyQ29kZUF0KDMpXG4gIHJldHVybiBpc1doaXRlc3BhY2UoZm9sbG93aW5nKSB8fFxuICAgIGZvbGxvd2luZyA9PT0gQ0hBUl9DQVJSSUFHRV9SRVRVUk4gfHwgZm9sbG93aW5nID09PSBDSEFSX0xJTkVfRkVFRFxufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIGNoYXJhY3RlciBjYW4gYmUgcHJpbnRlZCB3aXRob3V0IGVzY2FwaW5nLlxuLy8gRnJvbSBZQU1MIDEuMjogXCJhbnkgYWxsb3dlZCBjaGFyYWN0ZXJzIGtub3duIHRvIGJlIG5vbi1wcmludGFibGVcbi8vIHNob3VsZCBhbHNvIGJlIGVzY2FwZWQuIFtIb3dldmVyLF0gVGhpcyBpc27igJl0IG1hbmRhdG9yeVwiXG4vLyBEZXJpdmVkIGZyb20gbmItY2hhciAtIFxcdCAtICN4ODUgLSAjeEEwIC0gI3gyMDI4IC0gI3gyMDI5LlxuZnVuY3Rpb24gaXNQcmludGFibGUgKGM6IG51bWJlcikge1xuICByZXR1cm4gKGMgPj0gMHgwMDAyMCAmJiBjIDw9IDB4MDAwMDdFKSB8fFxuICAgICgoYyA+PSAweDAwMEExICYmIGMgPD0gMHgwMEQ3RkYpICYmIGMgIT09IDB4MjAyOCAmJiBjICE9PSAweDIwMjkpIHx8XG4gICAgKChjID49IDB4MEUwMDAgJiYgYyA8PSAweDAwRkZGRCkgJiYgYyAhPT0gQ0hBUl9CT00pIHx8XG4gICAgKGMgPj0gMHgxMDAwMCAmJiBjIDw9IDB4MTBGRkZGKVxufVxuXG4vLyBbMzRdIG5zLWNoYXIgOjo9IG5iLWNoYXIgLSBzLXdoaXRlXG4vLyBbMjddIG5iLWNoYXIgOjo9IGMtcHJpbnRhYmxlIC0gYi1jaGFyIC0gYy1ieXRlLW9yZGVyLW1hcmtcbi8vIFsyNl0gYi1jaGFyICA6Oj0gYi1saW5lLWZlZWQgfCBiLWNhcnJpYWdlLXJldHVyblxuLy8gSW5jbHVkaW5nIHMtd2hpdGUgKGZvciBzb21lIHJlYXNvbiwgZXhhbXBsZXMgZG9lc24ndCBtYXRjaCBzcGVjcyBpbiB0aGlzIGFzcGVjdClcbi8vIG5zLWNoYXIgOjo9IGMtcHJpbnRhYmxlIC0gYi1saW5lLWZlZWQgLSBiLWNhcnJpYWdlLXJldHVybiAtIGMtYnl0ZS1vcmRlci1tYXJrXG5mdW5jdGlvbiBpc05zQ2hhck9yV2hpdGVzcGFjZSAoYzogbnVtYmVyKSB7XG4gIHJldHVybiBpc1ByaW50YWJsZShjKSAmJlxuICAgIGMgIT09IENIQVJfQk9NICYmXG4gICAgLy8gLSBiLWNoYXJcbiAgICBjICE9PSBDSEFSX0NBUlJJQUdFX1JFVFVSTiAmJlxuICAgIGMgIT09IENIQVJfTElORV9GRUVEXG59XG5cbi8vIFsxMjddICBucy1wbGFpbi1zYWZlKGMpIDo6PSBjID0gZmxvdy1vdXQgIOKHkiBucy1wbGFpbi1zYWZlLW91dFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBmbG93LWluICAg4oeSIG5zLXBsYWluLXNhZmUtaW5cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjID0gYmxvY2sta2V5IOKHkiBucy1wbGFpbi1zYWZlLW91dFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBmbG93LWtleSAg4oeSIG5zLXBsYWluLXNhZmUtaW5cbi8vIFsxMjhdIG5zLXBsYWluLXNhZmUtb3V0IDo6PSBucy1jaGFyXG4vLyBbMTI5XSAgbnMtcGxhaW4tc2FmZS1pbiA6Oj0gbnMtY2hhciAtIGMtZmxvdy1pbmRpY2F0b3Jcbi8vIFsxMzBdICBucy1wbGFpbi1jaGFyKGMpIDo6PSAgKCBucy1wbGFpbi1zYWZlKGMpIC0g4oCcOuKAnSAtIOKAnCPigJ0gKVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAoIC8qIEFuIG5zLWNoYXIgcHJlY2VkaW5nICovIOKAnCPigJ0gKVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAoIOKAnDrigJ0gLyogRm9sbG93ZWQgYnkgYW4gbnMtcGxhaW4tc2FmZShjKSAqLyApXG4vLyBgcHJldmAgaXMgdGhlIHByZXZpb3VzIGNvZGUgcG9pbnQsIG9yIC0xIHdoZW4gYGNgIGlzIHRoZSBmaXJzdCBjaGFyYWN0ZXJcbi8vIChubyBwcmVjZWRpbmcgY2hhcmFjdGVyKS4gLTEgaXMgbm90IGEgdmFsaWQgY29kZSBwb2ludCwgc28gaXQgY2FuIG5ldmVyXG4vLyBjb2xsaWRlIHdpdGggYSByZWFsIG9uZSBhbmQgc2FmZWx5IGRpc2FibGVzIHRoZSBwcmV2LWRlcGVuZGVudCBjYXNlcyBiZWxvdy5cbmZ1bmN0aW9uIGlzUGxhaW5TYWZlIChjOiBudW1iZXIsIHByZXY6IG51bWJlciwgaW5ibG9jazogYm9vbGVhbikge1xuICBjb25zdCBjSXNOc0NoYXJPcldoaXRlc3BhY2UgPSBpc05zQ2hhck9yV2hpdGVzcGFjZShjKVxuICBjb25zdCBjSXNOc0NoYXIgPSBjSXNOc0NoYXJPcldoaXRlc3BhY2UgJiYgIWlzV2hpdGVzcGFjZShjKVxuICByZXR1cm4gKFxuICAgIChcbiAgICAgIC8vIG5zLXBsYWluLXNhZmVcbiAgICAgIGluYmxvY2sgLy8gYyA9IGZsb3ctaW5cbiAgICAgICAgPyBjSXNOc0NoYXJPcldoaXRlc3BhY2VcbiAgICAgICAgOiBjSXNOc0NoYXJPcldoaXRlc3BhY2UgJiZcbiAgICAgICAgICAvLyAtIGMtZmxvdy1pbmRpY2F0b3JcbiAgICAgICAgICBjICE9PSBDSEFSX0NPTU1BICYmXG4gICAgICAgICAgYyAhPT0gQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VUICYmXG4gICAgICAgICAgYyAhPT0gQ0hBUl9SSUdIVF9TUVVBUkVfQlJBQ0tFVCAmJlxuICAgICAgICAgIGMgIT09IENIQVJfTEVGVF9DVVJMWV9CUkFDS0VUICYmXG4gICAgICAgICAgYyAhPT0gQ0hBUl9SSUdIVF9DVVJMWV9CUkFDS0VUXG4gICAgKSAmJlxuICAgIC8vIG5zLXBsYWluLWNoYXJcbiAgICBjICE9PSBDSEFSX1NIQVJQICYmIC8vIGZhbHNlIG9uICcjJ1xuICAgICEocHJldiA9PT0gQ0hBUl9DT0xPTiAmJiAhY0lzTnNDaGFyKVxuICApIHx8IC8vIGZhbHNlIG9uICc6ICdcbiAgKGlzTnNDaGFyT3JXaGl0ZXNwYWNlKHByZXYpICYmICFpc1doaXRlc3BhY2UocHJldikgJiYgYyA9PT0gQ0hBUl9TSEFSUCkgfHwgLy8gY2hhbmdlIHRvIHRydWUgb24gJ1teIF0jJ1xuICAocHJldiA9PT0gQ0hBUl9DT0xPTiAmJiBjSXNOc0NoYXIpIC8vIGNoYW5nZSB0byB0cnVlIG9uICc6W14gXSdcbn1cblxuLy8gU2ltcGxpZmllZCB0ZXN0IGZvciB2YWx1ZXMgYWxsb3dlZCBhcyB0aGUgZmlyc3QgY2hhcmFjdGVyIGluIHBsYWluIHN0eWxlLlxuZnVuY3Rpb24gaXNQbGFpblNhZmVGaXJzdCAoYzogbnVtYmVyKSB7XG4gIC8vIFVzZXMgYSBzdWJzZXQgb2YgbnMtY2hhciAtIGMtaW5kaWNhdG9yXG4gIC8vIHdoZXJlIG5zLWNoYXIgPSBuYi1jaGFyIC0gcy13aGl0ZS5cbiAgLy8gTm8gc3VwcG9ydCBvZiAoICgg4oCcP+KAnSB8IOKAnDrigJ0gfCDigJwt4oCdICkgLyogRm9sbG93ZWQgYnkgYW4gbnMtcGxhaW4tc2FmZShjKSkgKi8gKSBwYXJ0XG4gIHJldHVybiBpc1ByaW50YWJsZShjKSAmJlxuICAgIGMgIT09IENIQVJfQk9NICYmXG4gICAgIWlzV2hpdGVzcGFjZShjKSAmJiAvLyAtIHMtd2hpdGVcbiAgICAvLyAtIChjLWluZGljYXRvciA6Oj1cbiAgICAvLyDigJwt4oCdIHwg4oCcP+KAnSB8IOKAnDrigJ0gfCDigJws4oCdIHwg4oCcW+KAnSB8IOKAnF3igJ0gfCDigJx74oCdIHwg4oCcfeKAnVxuICAgIGMgIT09IENIQVJfTUlOVVMgJiZcbiAgICBjICE9PSBDSEFSX1FVRVNUSU9OICYmXG4gICAgYyAhPT0gQ0hBUl9DT0xPTiAmJlxuICAgIGMgIT09IENIQVJfQ09NTUEgJiZcbiAgICBjICE9PSBDSEFSX0xFRlRfU1FVQVJFX0JSQUNLRVQgJiZcbiAgICBjICE9PSBDSEFSX1JJR0hUX1NRVUFSRV9CUkFDS0VUICYmXG4gICAgYyAhPT0gQ0hBUl9MRUZUX0NVUkxZX0JSQUNLRVQgJiZcbiAgICBjICE9PSBDSEFSX1JJR0hUX0NVUkxZX0JSQUNLRVQgJiZcbiAgICAvLyB8IOKAnCPigJ0gfCDigJwm4oCdIHwg4oCcKuKAnSB8IOKAnCHigJ0gfCDigJx84oCdIHwg4oCcPeKAnSB8IOKAnD7igJ0gfCDigJwn4oCdIHwg4oCcXCLigJ1cbiAgICBjICE9PSBDSEFSX1NIQVJQICYmXG4gICAgYyAhPT0gQ0hBUl9BTVBFUlNBTkQgJiZcbiAgICBjICE9PSBDSEFSX0FTVEVSSVNLICYmXG4gICAgYyAhPT0gQ0hBUl9FWENMQU1BVElPTiAmJlxuICAgIGMgIT09IENIQVJfVkVSVElDQUxfTElORSAmJlxuICAgIGMgIT09IENIQVJfRVFVQUxTICYmXG4gICAgYyAhPT0gQ0hBUl9HUkVBVEVSX1RIQU4gJiZcbiAgICBjICE9PSBDSEFSX1NJTkdMRV9RVU9URSAmJlxuICAgIGMgIT09IENIQVJfRE9VQkxFX1FVT1RFICYmXG4gICAgLy8gfCDigJwl4oCdIHwg4oCcQOKAnSB8IOKAnGDigJ0pXG4gICAgYyAhPT0gQ0hBUl9QRVJDRU5UICYmXG4gICAgYyAhPT0gQ0hBUl9DT01NRVJDSUFMX0FUICYmXG4gICAgYyAhPT0gQ0hBUl9HUkFWRV9BQ0NFTlRcbn1cblxuZnVuY3Rpb24gaXNQbGFpblNhZmVBdFN0YXJ0IChzdHJpbmc6IHN0cmluZywgaW5ibG9jazogYm9vbGVhbikge1xuICBjb25zdCBmaXJzdCA9IGNvZGVQb2ludEF0KHN0cmluZywgMClcblxuICBpZiAoaXNQbGFpblNhZmVGaXJzdChmaXJzdCkpIHJldHVybiB0cnVlXG5cbiAgaWYgKFxuICAgIHN0cmluZy5sZW5ndGggPiAxICYmXG4gICAgKGZpcnN0ID09PSBDSEFSX01JTlVTIHx8IGZpcnN0ID09PSBDSEFSX1FVRVNUSU9OIHx8IGZpcnN0ID09PSBDSEFSX0NPTE9OKVxuICApIHtcbiAgICBjb25zdCBzZWNvbmQgPSBjb2RlUG9pbnRBdChzdHJpbmcsIDEpXG5cbiAgICAvLyBUaGUgcmVsYXhlZCBpc1BsYWluU2FmZSgpIGFjY2VwdHMgd2hpdGVzcGFjZSBpbnNpZGUgYSBzY2FsYXIsIGJ1dCB0aGVcbiAgICAvLyBpbmRpY2F0b3IgZXhjZXB0aW9uIGluIG5zLXBsYWluLWZpcnN0IHJlcXVpcmVzIGFuIG5zLXBsYWluLXNhZmVcbiAgICAvLyAqbm9uLXNwYWNlKiBjaGFyYWN0ZXIuIE90aGVyd2lzZSBgLSB2YWx1ZWAgYW5kIGA/IHZhbHVlYCBzdGFydCBibG9ja1xuICAgIC8vIGNvbGxlY3Rpb25zIGluc3RlYWQgb2YgcGxhaW4gc2NhbGFycy5cbiAgICByZXR1cm4gIWlzV2hpdGVzcGFjZShzZWNvbmQpICYmIGlzUGxhaW5TYWZlKHNlY29uZCwgZmlyc3QsIGluYmxvY2spXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuLy8gU2ltcGxpZmllZCB0ZXN0IGZvciB2YWx1ZXMgYWxsb3dlZCBhcyB0aGUgbGFzdCBjaGFyYWN0ZXIgaW4gcGxhaW4gc3R5bGUuXG5mdW5jdGlvbiBpc1BsYWluU2FmZUxhc3QgKGM6IG51bWJlcikge1xuICAvLyBqdXN0IG5vdCB3aGl0ZXNwYWNlIG9yIGNvbG9uLCBpdCB3aWxsIGJlIGNoZWNrZWQgdG8gYmUgcGxhaW4gY2hhcmFjdGVyIGxhdGVyXG4gIHJldHVybiAhaXNXaGl0ZXNwYWNlKGMpICYmIGMgIT09IENIQVJfQ09MT05cbn1cblxuLy8gU2FtZSBhcyAnc3RyaW5nJy5jb2RlUG9pbnRBdChwb3MpLCBidXQgd29ya3MgaW4gb2xkZXIgYnJvd3NlcnMuXG5mdW5jdGlvbiBjb2RlUG9pbnRBdCAoc3RyaW5nOiBzdHJpbmcsIHBvczogbnVtYmVyKSB7XG4gIGNvbnN0IGZpcnN0ID0gc3RyaW5nLmNoYXJDb2RlQXQocG9zKVxuICBsZXQgc2Vjb25kXG5cbiAgaWYgKGZpcnN0ID49IDB4RDgwMCAmJiBmaXJzdCA8PSAweERCRkYgJiYgcG9zICsgMSA8IHN0cmluZy5sZW5ndGgpIHtcbiAgICBzZWNvbmQgPSBzdHJpbmcuY2hhckNvZGVBdChwb3MgKyAxKVxuICAgIGlmIChzZWNvbmQgPj0gMHhEQzAwICYmIHNlY29uZCA8PSAweERGRkYpIHtcbiAgICAgIC8vIGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nI3N1cnJvZ2F0ZS1mb3JtdWxhZVxuICAgICAgcmV0dXJuIChmaXJzdCAtIDB4RDgwMCkgKiAweDQwMCArIHNlY29uZCAtIDB4REMwMCArIDB4MTAwMDBcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZpcnN0XG59XG5cbmZ1bmN0aW9uIG5lZWRJbmRlbnRJbmRpY2F0b3IgKHN0cmluZzogc3RyaW5nKSB7XG4gIGNvbnN0IGxlYWRpbmdTcGFjZVJlID0gL15cXG4qIC9cbiAgcmV0dXJuIGxlYWRpbmdTcGFjZVJlLnRlc3Qoc3RyaW5nKVxufVxuXG5jb25zdCBTVFlMRV9QTEFJTiA9IDFcbmNvbnN0IFNUWUxFX1NJTkdMRSA9IDJcbmNvbnN0IFNUWUxFX0xJVEVSQUwgPSAzXG5jb25zdCBTVFlMRV9GT0xERUQgPSA0XG5jb25zdCBTVFlMRV9ET1VCTEUgPSA1XG5cbnR5cGUgU2NhbGFyU3R5bGVJZCA9XG4gIHR5cGVvZiBTVFlMRV9QTEFJTiB8XG4gIHR5cGVvZiBTVFlMRV9TSU5HTEUgfFxuICB0eXBlb2YgU1RZTEVfTElURVJBTCB8XG4gIHR5cGVvZiBTVFlMRV9GT0xERUQgfFxuICB0eXBlb2YgU1RZTEVfRE9VQkxFXG5cbi8vIERldGVybWluZXMgd2hpY2ggc2NhbGFyIHN0eWxlcyBhcmUgcG9zc2libGUgYW5kIHJldHVybnMgdGhlIHByZWZlcnJlZCBzdHlsZS5cbi8vIGxpbmVXaWR0aCA9IC0xID0+IG5vIGxpbWl0LlxuLy8gUHJlLWNvbmRpdGlvbnM6IHN0ci5sZW5ndGggPiAwLlxuLy8gUG9zdC1jb25kaXRpb25zOlxuLy8gICAgU1RZTEVfUExBSU4gb3IgU1RZTEVfU0lOR0xFID0+IG5vIFxcbiBhcmUgaW4gdGhlIHN0cmluZy5cbi8vICAgIFNUWUxFX0xJVEVSQUwgPT4gbm8gbGluZXMgYXJlIHN1aXRhYmxlIGZvciBmb2xkaW5nIChvciBsaW5lV2lkdGggaXMgLTEpLlxuLy8gICAgU1RZTEVfRk9MREVEID0+IGEgbGluZSA+IGxpbmVXaWR0aCBhbmQgY2FuIGJlIGZvbGRlZCAoYW5kIGxpbmVXaWR0aCAhPSAtMSkuXG5mdW5jdGlvbiBjaG9vc2VTY2FsYXJTdHlsZSAoc3RhdGU6IFByZXNlbnRlclN0YXRlLCBzdHJpbmc6IHN0cmluZywgbGF5b3V0OiBSZXR1cm5UeXBlPHR5cGVvZiBzY2FsYXJMYXlvdXQ+LFxuICBzaW5nbGVMaW5lT25seTogYm9vbGVhbiwgZm9yY2VRdW90ZTogYm9vbGVhbiwgaW5ibG9jazogYm9vbGVhbik6IFNjYWxhclN0eWxlSWQge1xuICBjb25zdCB7IGJsb2NrSW5kZW50LCBsaW5lV2lkdGggfSA9IGxheW91dFxuICBsZXQgaVxuICBsZXQgY2hhciA9IDBcbiAgbGV0IHByZXZDaGFyID0gLTEgLy8gLTEgPSBubyBwcmV2aW91cyBjaGFyYWN0ZXIgeWV0IChzZWUgaXNQbGFpblNhZmUpXG4gIGxldCBoYXNMaW5lQnJlYWsgPSBmYWxzZVxuICBsZXQgaGFzRm9sZGFibGVMaW5lID0gZmFsc2UgLy8gb25seSBjaGVja2VkIGlmIHNob3VsZFRyYWNrV2lkdGhcbiAgY29uc3Qgc2hvdWxkVHJhY2tXaWR0aCA9IGxpbmVXaWR0aCAhPT0gLTFcbiAgbGV0IHByZXZpb3VzTGluZUJyZWFrID0gLTEgLy8gY291bnQgdGhlIGZpcnN0IGxpbmUgY29ycmVjdGx5XG4gIC8vIERvY3VtZW50IG1hcmtlcnMgYXJlIHJlY29nbml6ZWQgYXMgd2hvbGUgdG9rZW5zIGF0IHRoZSBzdGFydCBvZiBhIGxpbmUsXG4gIC8vIHNvIGNoYXJhY3Rlci1sZXZlbCBwbGFpbi1zY2FsYXIgY2hlY2tzIGFsb25lIGNhbm5vdCByZWplY3QgdGhlbS5cbiAgbGV0IHBsYWluID0gIXN0YXJ0c1dpdGhEb2N1bWVudFNlcGFyYXRvcihzdHJpbmcpICYmXG4gICAgaXNQbGFpblNhZmVBdFN0YXJ0KHN0cmluZywgaW5ibG9jaykgJiZcbiAgICBpc1BsYWluU2FmZUxhc3QoY29kZVBvaW50QXQoc3RyaW5nLCBzdHJpbmcubGVuZ3RoIC0gMSkpXG5cbiAgaWYgKHNpbmdsZUxpbmVPbmx5IHx8IGZvcmNlUXVvdGUpIHtcbiAgICAvLyBDYXNlOiBubyBibG9jayBzdHlsZXMuXG4gICAgLy8gQ2hlY2sgZm9yIGRpc2FsbG93ZWQgY2hhcmFjdGVycyB0byBydWxlIG91dCBwbGFpbiBhbmQgc2luZ2xlLlxuICAgIGZvciAoaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBjaGFyID49IDB4MTAwMDAgPyBpICs9IDIgOiBpKyspIHtcbiAgICAgIGNoYXIgPSBjb2RlUG9pbnRBdChzdHJpbmcsIGkpXG4gICAgICBpZiAoIWlzUHJpbnRhYmxlKGNoYXIpKSB7XG4gICAgICAgIHJldHVybiBTVFlMRV9ET1VCTEVcbiAgICAgIH1cbiAgICAgIHBsYWluID0gcGxhaW4gJiYgaXNQbGFpblNhZmUoY2hhciwgcHJldkNoYXIsIGluYmxvY2spXG4gICAgICBwcmV2Q2hhciA9IGNoYXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gQ2FzZTogYmxvY2sgc3R5bGVzIHBlcm1pdHRlZC5cbiAgICBmb3IgKGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgY2hhciA+PSAweDEwMDAwID8gaSArPSAyIDogaSsrKSB7XG4gICAgICBjaGFyID0gY29kZVBvaW50QXQoc3RyaW5nLCBpKVxuICAgICAgaWYgKGNoYXIgPT09IENIQVJfTElORV9GRUVEKSB7XG4gICAgICAgIGhhc0xpbmVCcmVhayA9IHRydWVcbiAgICAgICAgLy8gQ2hlY2sgaWYgYW55IGxpbmUgY2FuIGJlIGZvbGRlZC5cbiAgICAgICAgaWYgKHNob3VsZFRyYWNrV2lkdGgpIHtcbiAgICAgICAgICBoYXNGb2xkYWJsZUxpbmUgPSBoYXNGb2xkYWJsZUxpbmUgfHxcbiAgICAgICAgICAgIC8vIEZvbGRhYmxlIGxpbmUgPSB0b28gbG9uZywgYW5kIG5vdCBtb3JlLWluZGVudGVkLlxuICAgICAgICAgICAgKGkgLSBwcmV2aW91c0xpbmVCcmVhayAtIDEgPiBsaW5lV2lkdGggJiZcbiAgICAgICAgICAgICBzdHJpbmdbcHJldmlvdXNMaW5lQnJlYWsgKyAxXSAhPT0gJyAnKVxuICAgICAgICAgIHByZXZpb3VzTGluZUJyZWFrID0gaVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFpc1ByaW50YWJsZShjaGFyKSkge1xuICAgICAgICByZXR1cm4gU1RZTEVfRE9VQkxFXG4gICAgICB9XG4gICAgICBwbGFpbiA9IHBsYWluICYmIGlzUGxhaW5TYWZlKGNoYXIsIHByZXZDaGFyLCBpbmJsb2NrKVxuICAgICAgcHJldkNoYXIgPSBjaGFyXG4gICAgfVxuICAgIC8vIGluIGNhc2UgdGhlIGVuZCBpcyBtaXNzaW5nIGEgXFxuXG4gICAgaGFzRm9sZGFibGVMaW5lID0gaGFzRm9sZGFibGVMaW5lIHx8IChzaG91bGRUcmFja1dpZHRoICYmXG4gICAgICAoaSAtIHByZXZpb3VzTGluZUJyZWFrIC0gMSA+IGxpbmVXaWR0aCAmJlxuICAgICAgIHN0cmluZ1twcmV2aW91c0xpbmVCcmVhayArIDFdICE9PSAnICcpKVxuICB9XG4gIC8vIEFsdGhvdWdoIGV2ZXJ5IHN0eWxlIGNhbiByZXByZXNlbnQgXFxuIHdpdGhvdXQgZXNjYXBpbmcsIHByZWZlciBibG9jayBzdHlsZXNcbiAgLy8gZm9yIG11bHRpbGluZSwgc2luY2UgdGhleSdyZSBtb3JlIHJlYWRhYmxlIGFuZCB0aGV5IGRvbid0IGFkZCBlbXB0eSBsaW5lcy5cbiAgLy8gQWxzbyBwcmVmZXIgZm9sZGluZyBhIHN1cGVyLWxvbmcgbGluZS5cbiAgaWYgKCFoYXNMaW5lQnJlYWsgJiYgIWhhc0ZvbGRhYmxlTGluZSkge1xuICAgIC8vIFN5bnRhY3RpYyB2ZXJkaWN0IG9ubHk6IHdoZXRoZXIgdGhlIGJhcmUgdGV4dCByb3VuZC10cmlwcyB0byB0aGUgbm9kZSdzXG4gICAgLy8gdGFnIGlzIGEgc2VtYW50aWMgY2hlY2sgdGhlIGNhbGxlciBhcHBsaWVzIChzZWUgcmVzb2x2ZVNjYWxhclN0eWxlKS5cbiAgICBpZiAocGxhaW4gJiYgIWZvcmNlUXVvdGUpIHJldHVybiBTVFlMRV9QTEFJTlxuICAgIHJldHVybiBzdGF0ZS5xdW90ZVN0eWxlID09PSAnZG91YmxlJyA/IFNUWUxFX0RPVUJMRSA6IFNUWUxFX1NJTkdMRVxuICB9XG4gIC8vIEVkZ2UgY2FzZTogYmxvY2sgaW5kZW50YXRpb24gaW5kaWNhdG9yIGNhbiBvbmx5IGhhdmUgb25lIGRpZ2l0LlxuICBpZiAoYmxvY2tJbmRlbnQgPiA5ICYmIG5lZWRJbmRlbnRJbmRpY2F0b3Ioc3RyaW5nKSkge1xuICAgIHJldHVybiBTVFlMRV9ET1VCTEVcbiAgfVxuICAvLyBBdCB0aGlzIHBvaW50IHdlIGtub3cgYmxvY2sgc3R5bGVzIGFyZSB2YWxpZC5cbiAgLy8gUHJlZmVyIGxpdGVyYWwgc3R5bGUgdW5sZXNzIHdlIHdhbnQgdG8gZm9sZC5cbiAgcmV0dXJuIGhhc0ZvbGRhYmxlTGluZSA/IFNUWUxFX0ZPTERFRCA6IFNUWUxFX0xJVEVSQUxcbn1cblxuLy8gUmVuZGVycyBgc3RyaW5nYCBpbiB0aGUgZ2l2ZW4gbnVtZXJpYyBzdHlsZSB3aXRoIHRoZSBnaXZlbiBsYXlvdXQuXG4vLyBOQi4gV2UgZHJvcCB0aGUgbGFzdCB0cmFpbGluZyBuZXdsaW5lIChpZiBhbnkpIG9mIGEgcmV0dXJuZWQgYmxvY2sgc2NhbGFyXG4vLyAgc2luY2UgdGhlIGR1bXBlciBhZGRzIGl0cyBvd24gbmV3bGluZS4gVGhpcyBhbHdheXMgd29ya3M6XG4vLyAgICDigKIgTm8gZW5kaW5nIG5ld2xpbmUgPT4gdW5hZmZlY3RlZDsgYWxyZWFkeSB1c2luZyBzdHJpcCBcIi1cIiBjaG9tcGluZy5cbi8vICAgIOKAoiBFbmRpbmcgbmV3bGluZSAgICA9PiByZW1vdmVkIHRoZW4gcmVzdG9yZWQuXG4vLyAgSW1wb3J0YW50bHksIHRoaXMga2VlcHMgdGhlIFwiK1wiIGNob21wIGluZGljYXRvciBmcm9tIGdhaW5pbmcgYW4gZXh0cmEgbGluZS5cbmZ1bmN0aW9uIHJlbmRlclNjYWxhclN0eWxlIChzdHJpbmc6IHN0cmluZywgc3R5bGU6IFNjYWxhclN0eWxlSWQsIGxheW91dDogUmV0dXJuVHlwZTx0eXBlb2Ygc2NhbGFyTGF5b3V0Pikge1xuICBjb25zdCB7IGluZGVudCwgYmxvY2tJbmRlbnQsIGxpbmVXaWR0aCB9ID0gbGF5b3V0XG5cbiAgc3dpdGNoIChzdHlsZSkge1xuICAgIGNhc2UgU1RZTEVfUExBSU46XG4gICAgICByZXR1cm4gZW5jb2RlRmxvd0JyZWFrcyhzdHJpbmcsIGluZGVudClcbiAgICBjYXNlIFNUWUxFX1NJTkdMRTpcbiAgICAgIHJldHVybiBgJyR7ZW5jb2RlRmxvd0JyZWFrcyhzdHJpbmcsIGluZGVudCkucmVwbGFjZSgvJy9nLCBcIicnXCIpfSdgXG4gICAgY2FzZSBTVFlMRV9MSVRFUkFMOlxuICAgICAgcmV0dXJuICd8JyArIGJsb2NrSGVhZGVyKHN0cmluZywgYmxvY2tJbmRlbnQpICtcbiAgICAgICAgZHJvcEVuZGluZ05ld2xpbmUoaW5kZW50U3RyaW5nKHN0cmluZywgaW5kZW50KSlcbiAgICBjYXNlIFNUWUxFX0ZPTERFRDpcbiAgICAgIHJldHVybiAnPicgKyBibG9ja0hlYWRlcihzdHJpbmcsIGJsb2NrSW5kZW50KSArXG4gICAgICAgIGRyb3BFbmRpbmdOZXdsaW5lKGluZGVudFN0cmluZyhmb2xkQmxvY2tTY2FsYXIoc3RyaW5nLCBsaW5lV2lkdGgpLCBpbmRlbnQpKVxuICAgIGNhc2UgU1RZTEVfRE9VQkxFOlxuICAgICAgcmV0dXJuIGBcIiR7ZXNjYXBlU3RyaW5nKHN0cmluZyl9XCJgXG4gIH1cbn1cblxuLy8gUGlja3MgdGhlIHNjYWxhciBzdHlsZSBmb3IgYG5vZGVgOiBhIHN0eWxlIGhpbnQgY2FycmllZCBvbiB0aGUgbm9kZSB3aW5zLFxuLy8gb3RoZXJ3aXNlIHRoZSBzdHlsZSBjaG9zZW4gYnkgdGhlIG1hY2hpbmVyeS4gUmV0dXJucyBhIG51bWVyaWMgU1RZTEVfKi5cbmZ1bmN0aW9uIHJlc29sdmVTY2FsYXJTdHlsZSAoc3RhdGU6IFByZXNlbnRlclN0YXRlLCBub2RlOiBTY2FsYXJOb2RlLFxuICBsYXlvdXQ6IFJldHVyblR5cGU8dHlwZW9mIHNjYWxhckxheW91dD4sIGlza2V5OiBib29sZWFuLCBpbmJsb2NrOiBib29sZWFuKTogU2NhbGFyU3R5bGVJZCB7XG4gIC8vIFdpdGhvdXQga25vd2luZyBpZiBrZXlzIGFyZSBpbXBsaWNpdC9leHBsaWNpdCwgYXNzdW1lIGltcGxpY2l0IGZvciBzYWZldHkuXG4gIGNvbnN0IHNpbmdsZUxpbmVPbmx5ID0gaXNrZXkgfHwgIWluYmxvY2tcblxuICAvLyBTdHlsZSBoaW50cyBjYXJyaWVkIG9uIHRoZSBub2RlIHRha2UgcHJlY2VkZW5jZS4gVGhleSB3ZXJlIHZhbGlkIGluIHRoZWlyXG4gIC8vIG9yaWdpbmFsIGNvbnRleHQ7IG9ubHkgYSBwYXJlbnQgY2hhbmdlIGNhbiBicmVhayB0aGVtLCBhbmQgb25seSBibG9ja1xuICAvLyBzdHlsZXMgaW4gYSBzaW5nbGUtbGluZSBjb250ZXh0IOKAlCBxdW90ZWQgc3R5bGVzIHN1cnZpdmUgYW55IGNvbnRleHQuIEFcbiAgLy8gcmVqZWN0ZWQgYmxvY2sgaGludCBmYWxscyB0aHJvdWdoIHRvIHNlbGVjdGlvbiBieSBjb250ZW50IGJlbG93LlxuICBpZiAobm9kZS5zdHlsZS5zaW5nbGVRdW90ZWQpIHJldHVybiBTVFlMRV9TSU5HTEVcbiAgaWYgKG5vZGUuc3R5bGUuZG91YmxlUXVvdGVkKSByZXR1cm4gU1RZTEVfRE9VQkxFXG4gIGlmICghc2luZ2xlTGluZU9ubHkpIHtcbiAgICBpZiAobm9kZS5zdHlsZS5saXRlcmFsKSByZXR1cm4gU1RZTEVfTElURVJBTFxuICAgIGlmIChub2RlLnN0eWxlLmZvbGRlZCkgcmV0dXJuIFNUWUxFX0ZPTERFRFxuICB9XG5cbiAgY29uc3Qgc3RyaW5nID0gbm9kZS52YWx1ZVxuXG4gIGlmIChzdHJpbmcubGVuZ3RoID09PSAwKSB7XG4gICAgLy8gQW4gZW1wdHkgc2NhbGFyIGlzIHNhZmUgd2hlbiBpdHMgdGFnIGlzIGV4cGxpY2l0IG9yIHJlc29sdmVzIGJhY2sgdG8gdGhlXG4gICAgLy8gbm9kZSB0YWcgKG5vdGFibHksIHRoZSBkZWZhdWx0IG51bGwgcmVwcmVzZW50YXRpb24pLiBBIHJlYWwgZW1wdHkgc3RyaW5nXG4gICAgLy8gZG9lcyBuZWl0aGVyIGFuZCB0aGVyZWZvcmUgcmVtYWlucyBxdW90ZWQuXG4gICAgaWYgKG5vZGUuc3R5bGUudGFnZ2VkIHx8IHJlc29sdmVJbXBsaWNpdFRhZyhzdGF0ZSwgc3RyaW5nKSA9PT0gbm9kZS50YWcpIHJldHVybiBTVFlMRV9QTEFJTlxuICAgIHJldHVybiBzdGF0ZS5xdW90ZVN0eWxlID09PSAnZG91YmxlJyA/IFNUWUxFX0RPVUJMRSA6IFNUWUxFX1NJTkdMRVxuICB9XG5cbiAgLy8gdjQncyBmb3JjZVF1b3RlcyBkZWxpYmVyYXRlbHkgZXhjbHVkZWQga2V5cy4gS2V5cyBhcmUgc3RpbGwgcXVvdGVkIHdoZW5cbiAgLy8gc3ludGF4IG9yIHRhZyByZXNvbHV0aW9uIHJlcXVpcmVzIGl0LCB1c2luZyBxdW90ZVN0eWxlIGFzIHRoZSBwcmVmZXJlbmNlLlxuICBjb25zdCBzdHlsZSA9IGNob29zZVNjYWxhclN0eWxlKFxuICAgIHN0YXRlLCBzdHJpbmcsIGxheW91dCwgc2luZ2xlTGluZU9ubHksIHN0YXRlLmZvcmNlUXVvdGVzICYmICFpc2tleSwgaW5ibG9jaylcblxuICAvLyBQbGFpbiB3cml0ZXMgbm8gdGFnLCBzbyBpdCByb3VuZC10cmlwcyBvbmx5IGlmIHRoZSBiYXJlIHRleHQgcmVzb2x2ZXMgYmFja1xuICAvLyB0byB0aGUgbm9kZSdzIHRhZyAob3IgdGhlIHRhZyBnZXRzIHByaW50ZWQgZXhwbGljaXRseSkuIEVsc2UgZG93bmdyYWRlLlxuICAvLyBEb3duZ3JhZGUgdG8gdGhlIHByZWZlcnJlZCBxdW90ZSBzdHlsZSBoZXJlLlxuICBpZiAoc3R5bGUgPT09IFNUWUxFX1BMQUlOICYmICFub2RlLnN0eWxlLnRhZ2dlZCAmJiByZXNvbHZlSW1wbGljaXRUYWcoc3RhdGUsIHN0cmluZykgIT09IG5vZGUudGFnKSB7XG4gICAgcmV0dXJuIHN0YXRlLnF1b3RlU3R5bGUgPT09ICdkb3VibGUnID8gU1RZTEVfRE9VQkxFIDogU1RZTEVfU0lOR0xFXG4gIH1cbiAgcmV0dXJuIHN0eWxlXG59XG5cbi8vIFByZS1jb25kaXRpb25zOiBzdHJpbmcgaXMgdmFsaWQgZm9yIGEgYmxvY2sgc2NhbGFyLCAxIDw9IGluZGVudFBlckxldmVsIDw9IDkuXG5mdW5jdGlvbiBibG9ja0hlYWRlciAoc3RyaW5nOiBzdHJpbmcsIGluZGVudFBlckxldmVsOiBudW1iZXIpIHtcbiAgY29uc3QgaW5kZW50SW5kaWNhdG9yID0gbmVlZEluZGVudEluZGljYXRvcihzdHJpbmcpID8gU3RyaW5nKGluZGVudFBlckxldmVsKSA6ICcnXG5cbiAgLy8gbm90ZSB0aGUgc3BlY2lhbCBjYXNlOiB0aGUgc3RyaW5nICdcXG4nIGNvdW50cyBhcyBhIFwidHJhaWxpbmdcIiBlbXB0eSBsaW5lLlxuICBjb25zdCBjbGlwID0gc3RyaW5nW3N0cmluZy5sZW5ndGggLSAxXSA9PT0gJ1xcbidcbiAgY29uc3Qga2VlcCA9IGNsaXAgJiYgKHN0cmluZ1tzdHJpbmcubGVuZ3RoIC0gMl0gPT09ICdcXG4nIHx8IHN0cmluZyA9PT0gJ1xcbicpXG4gIGNvbnN0IGNob21wID0ga2VlcCA/ICcrJyA6IChjbGlwID8gJycgOiAnLScpXG5cbiAgcmV0dXJuIGAke2luZGVudEluZGljYXRvcn0ke2Nob21wfVxcbmBcbn1cblxuLy8gRmxvdyBzY2FsYXJzIChwbGFpbiwgc2luZ2xlLXF1b3RlZCkgZm9sZCBsaW5lIGJyZWFrczogYSBydW4gb2YgayBzb3VyY2UgbGluZVxuLy8gYnJlYWtzIHJlcGFyc2VzIHRvIGstMSBsaXRlcmFsIGBcXG5gLiBTbyBhIHNpbmdsZSBicmVhayBpcyBqdXN0IGxpbmUtd3JhcHBpbmdcbi8vIChmb2xkcyBiYWNrIHRvIGEgc3BhY2UpLCB3aGlsZSBhIGxpdGVyYWwgYFxcbmAgaW4gdGhlIHZhbHVlIG11c3QgYmUgZW1pdHRlZCBhc1xuLy8gYSBibGFuayBsaW5lICh0d28gYnJlYWtzKS4gRW5jb2RlIGVhY2ggcnVuIG9mIHAgbGl0ZXJhbCBgXFxuYCBhcyBwKzEgYnJlYWtzIGFuZFxuLy8gaW5kZW50IHRoZSBmb2xsb3dpbmcgY29udGVudCBsaW5lIHNvIHRoZSBjb250aW51YXRpb24gaXNuJ3QgcmVhZCBhcyBhIG5ldyBub2RlXG4vLyAoYSBiYXJlIGJyZWFrIHdvdWxkIHlpZWxkIGludmFsaWQgXCJkZWZpY2llbnQgaW5kZW50YXRpb25cIiBvdXRwdXQpLlxuLy8gYGZvbGRCbG9ja1NjYWxhcmAgY2FuJ3QgYmUgcmV1c2VkIGhlcmU6IGl0IHRyZWF0cyBhIGxlYWRpbmcgc3BhY2UgYXMgYVxuLy8gXCJtb3JlLWluZGVudGVkXCIgbGluZSBhbmQgc3VwcHJlc3NlcyB0aGUgZG91YmxpbmcsIHdoaWNoIGEgZmxvdyBzY2FsYXIgbXVzdCBub3QuXG5mdW5jdGlvbiBlbmNvZGVGbG93QnJlYWtzIChzdHJpbmc6IHN0cmluZywgaW5kZW50OiBudW1iZXIpIHtcbiAgbGV0IG5leHRMRiA9IHN0cmluZy5pbmRleE9mKCdcXG4nKVxuICBpZiAobmV4dExGID09PSAtMSkgcmV0dXJuIHN0cmluZ1xuXG4gIGNvbnN0IHBhZCA9ICcgJy5yZXBlYXQoaW5kZW50KVxuICBsZXQgcmVzdWx0ID0gc3RyaW5nLnNsaWNlKDAsIG5leHRMRikgLy8gZmlyc3QgbGluZSBmb2xsb3dzIHRoZSBxdW90ZSwgbm8gaW5kZW50XG5cbiAgY29uc3QgbGluZVJlID0gLyhcXG4rKShbXlxcbl0qKS9nXG4gIGxpbmVSZS5sYXN0SW5kZXggPSBuZXh0TEZcbiAgbGV0IG1hdGNoXG4gIHdoaWxlICgobWF0Y2ggPSBsaW5lUmUuZXhlYyhzdHJpbmcpKSkge1xuICAgIGNvbnN0IGJyZWFrcyA9IG1hdGNoWzFdLmxlbmd0aFxuICAgIGNvbnN0IGxpbmUgPSBtYXRjaFsyXVxuICAgIC8vIGxpbmUgPT09ICcnIG9ubHkgYXQgdGhlIGVuZCAodGhlIGdyZWVkeSBcXG4rIGxlYXZlcyBubyBlbXB0eSBsaW5lIG1pZC1zdHJpbmcpO1xuICAgIC8vIHBhZCBpdCBzbyB0aGUgY2xvc2luZyBxdW90ZSBjYXJyaWVzIGluZGVudCBpbnN0ZWFkIG9mIHNpdHRpbmcgYXQgY29sdW1uIDAuXG4gICAgcmVzdWx0ICs9ICdcXG4nLnJlcGVhdChicmVha3MgKyAxKSArIHBhZCArIGxpbmVcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuLy8gU3RyaXBzIG9uZSB0cmFpbGluZyBuZXdsaW5lIGZyb20gYSBibG9jayBzY2FsYXI6IHRoZSBkdW1wZXIgYWRkcyBpdHMgb3duLFxuLy8gc28gd2l0aG91dCB0aGlzIGEgXCIrXCIgKGtlZXApIGNob21wIHdvdWxkIGdhaW4gYW4gZXh0cmEgYmxhbmsgbGluZS5cbmZ1bmN0aW9uIGRyb3BFbmRpbmdOZXdsaW5lIChzdHJpbmc6IHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nW3N0cmluZy5sZW5ndGggLSAxXSA9PT0gJ1xcbicgPyBzdHJpbmcuc2xpY2UoMCwgLTEpIDogc3RyaW5nXG59XG5cbi8vIE5vdGU6IGEgbG9uZyBsaW5lIHdpdGhvdXQgYSBzdWl0YWJsZSBicmVhayBwb2ludCB3aWxsIGV4Y2VlZCB0aGUgd2lkdGggbGltaXQuXG4vLyBQcmUtY29uZGl0aW9uczogZXZlcnkgY2hhciBpbiBzdHIgaXNQcmludGFibGUsIHN0ci5sZW5ndGggPiAwLCB3aWR0aCA+IDAuXG5mdW5jdGlvbiBmb2xkQmxvY2tTY2FsYXIgKHN0cmluZzogc3RyaW5nLCB3aWR0aDogbnVtYmVyKSB7XG4gIC8vIEluIGZvbGRlZCBzdHlsZSwgJGskIGNvbnNlY3V0aXZlIG5ld2xpbmVzIG91dHB1dCBhcyAkaysxJCBuZXdsaW5lc+KAlFxuICAvLyB1bmxlc3MgdGhleSdyZSBiZWZvcmUgb3IgYWZ0ZXIgYSBtb3JlLWluZGVudGVkIGxpbmUsIG9yIGF0IHRoZSB2ZXJ5XG4gIC8vIGJlZ2lubmluZyBvciBlbmQsIGluIHdoaWNoIGNhc2UgJGskIG1hcHMgdG8gJGskLlxuICAvLyBUaGVyZWZvcmUsIHBhcnNlIGVhY2ggY2h1bmsgYXMgbmV3bGluZShzKSBmb2xsb3dlZCBieSBhIGNvbnRlbnQgbGluZS5cbiAgY29uc3QgbGluZVJlID0gLyhcXG4rKShbXlxcbl0qKS9nXG5cbiAgLy8gZmlyc3QgbGluZSAocG9zc2libHkgYW4gZW1wdHkgbGluZSlcbiAgbGV0IG5leHRMRiA9IHN0cmluZy5pbmRleE9mKCdcXG4nKVxuICBpZiAobmV4dExGID09PSAtMSkgbmV4dExGID0gc3RyaW5nLmxlbmd0aFxuICBsaW5lUmUubGFzdEluZGV4ID0gbmV4dExGXG4gIGxldCByZXN1bHQgPSBmb2xkTGluZShzdHJpbmcuc2xpY2UoMCwgbmV4dExGKSwgd2lkdGgpXG4gIC8vIElmIHdlIGhhdmVuJ3QgcmVhY2hlZCB0aGUgZmlyc3QgY29udGVudCBsaW5lIHlldCwgZG9uJ3QgYWRkIGFuIGV4dHJhIFxcbi5cbiAgbGV0IHByZXZNb3JlSW5kZW50ZWQgPSBzdHJpbmdbMF0gPT09ICdcXG4nIHx8IHN0cmluZ1swXSA9PT0gJyAnXG4gIGxldCBtb3JlSW5kZW50ZWRcblxuICAvLyByZXN0IG9mIHRoZSBsaW5lc1xuICBsZXQgbWF0Y2hcbiAgd2hpbGUgKChtYXRjaCA9IGxpbmVSZS5leGVjKHN0cmluZykpKSB7XG4gICAgY29uc3QgcHJlZml4ID0gbWF0Y2hbMV1cbiAgICBjb25zdCBsaW5lID0gbWF0Y2hbMl1cblxuICAgIG1vcmVJbmRlbnRlZCA9IChsaW5lWzBdID09PSAnICcpXG4gICAgcmVzdWx0ICs9IHByZWZpeCArXG4gICAgICAoKCFwcmV2TW9yZUluZGVudGVkICYmICFtb3JlSW5kZW50ZWQgJiYgbGluZSAhPT0gJycpID8gJ1xcbicgOiAnJykgK1xuICAgICAgZm9sZExpbmUobGluZSwgd2lkdGgpXG4gICAgcHJldk1vcmVJbmRlbnRlZCA9IG1vcmVJbmRlbnRlZFxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG4vLyBHcmVlZHkgbGluZSBicmVha2luZy5cbi8vIFBpY2tzIHRoZSBsb25nZXN0IGxpbmUgdW5kZXIgdGhlIGxpbWl0IGVhY2ggdGltZSxcbi8vIG90aGVyd2lzZSBzZXR0bGVzIGZvciB0aGUgc2hvcnRlc3QgbGluZSBvdmVyIHRoZSBsaW1pdC5cbi8vIE5CLiBNb3JlLWluZGVudGVkIGxpbmVzICpjYW5ub3QqIGJlIGZvbGRlZCwgYXMgdGhhdCB3b3VsZCBhZGQgYW4gZXh0cmEgXFxuLlxuZnVuY3Rpb24gZm9sZExpbmUgKGxpbmU6IHN0cmluZywgd2lkdGg6IG51bWJlcikge1xuICBpZiAobGluZSA9PT0gJycgfHwgbGluZVswXSA9PT0gJyAnKSByZXR1cm4gbGluZVxuXG4gIC8vIFNpbmNlIGEgbW9yZS1pbmRlbnRlZCBsaW5lIGFkZHMgYSBcXG4sIGJyZWFrcyBjYW4ndCBiZSBmb2xsb3dlZCBieSBhIHNwYWNlLlxuICBjb25zdCBicmVha1JlID0gLyBbXiBdL2cgLy8gbm90ZTogdGhlIG1hdGNoIGluZGV4IHdpbGwgYWx3YXlzIGJlIDw9IGxlbmd0aC0yLlxuICBsZXQgbWF0Y2hcbiAgLy8gc3RhcnQgaXMgYW4gaW5jbHVzaXZlIGluZGV4LiBlbmQsIGN1cnIsIGFuZCBuZXh0IGFyZSBleGNsdXNpdmUuXG4gIGxldCBzdGFydCA9IDBcbiAgbGV0IGVuZFxuICBsZXQgY3VyciA9IDBcbiAgbGV0IG5leHQgPSAwXG4gIGxldCByZXN1bHQgPSAnJ1xuXG4gIC8vIEludmFyaWFudHM6IDAgPD0gc3RhcnQgPD0gbGVuZ3RoLTEuXG4gIC8vICAgMCA8PSBjdXJyIDw9IG5leHQgPD0gbWF4KDAsIGxlbmd0aC0yKS4gY3VyciAtIHN0YXJ0IDw9IHdpZHRoLlxuICAvLyBJbnNpZGUgdGhlIGxvb3A6XG4gIC8vICAgQSBtYXRjaCBpbXBsaWVzIGxlbmd0aCA+PSAyLCBzbyBjdXJyIGFuZCBuZXh0IGFyZSA8PSBsZW5ndGgtMi5cbiAgd2hpbGUgKChtYXRjaCA9IGJyZWFrUmUuZXhlYyhsaW5lKSkpIHtcbiAgICBuZXh0ID0gbWF0Y2guaW5kZXhcbiAgICAvLyBtYWludGFpbiBpbnZhcmlhbnQ6IGN1cnIgLSBzdGFydCA8PSB3aWR0aFxuICAgIGlmIChuZXh0IC0gc3RhcnQgPiB3aWR0aCkge1xuICAgICAgZW5kID0gKGN1cnIgPiBzdGFydCkgPyBjdXJyIDogbmV4dCAvLyBkZXJpdmUgZW5kIDw9IGxlbmd0aC0yXG4gICAgICByZXN1bHQgKz0gYFxcbiR7bGluZS5zbGljZShzdGFydCwgZW5kKX1gXG4gICAgICAvLyBza2lwIHRoZSBzcGFjZSB0aGF0IHdhcyBvdXRwdXQgYXMgXFxuXG4gICAgICBzdGFydCA9IGVuZCArIDEgICAgICAgICAgICAgICAgICAgIC8vIGRlcml2ZSBzdGFydCA8PSBsZW5ndGgtMVxuICAgIH1cbiAgICBjdXJyID0gbmV4dFxuICB9XG5cbiAgLy8gQnkgdGhlIGludmFyaWFudHMsIHN0YXJ0IDw9IGxlbmd0aC0xLCBzbyB0aGVyZSBpcyBzb21ldGhpbmcgbGVmdCBvdmVyLlxuICAvLyBJdCBpcyBlaXRoZXIgdGhlIHdob2xlIHN0cmluZyBvciBhIHBhcnQgc3RhcnRpbmcgZnJvbSBub24td2hpdGVzcGFjZS5cbiAgcmVzdWx0ICs9ICdcXG4nXG4gIC8vIEluc2VydCBhIGJyZWFrIGlmIHRoZSByZW1haW5kZXIgaXMgdG9vIGxvbmcgYW5kIHRoZXJlIGlzIGEgYnJlYWsgYXZhaWxhYmxlLlxuICBpZiAobGluZS5sZW5ndGggLSBzdGFydCA+IHdpZHRoICYmIGN1cnIgPiBzdGFydCkge1xuICAgIHJlc3VsdCArPSBgJHtsaW5lLnNsaWNlKHN0YXJ0LCBjdXJyKX1cXG4ke2xpbmUuc2xpY2UoY3VyciArIDEpfWBcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgKz0gbGluZS5zbGljZShzdGFydClcbiAgfVxuXG4gIHJldHVybiByZXN1bHQuc2xpY2UoMSkgLy8gZHJvcCBleHRyYSBcXG4gam9pbmVyXG59XG5cbmZ1bmN0aW9uIGVzY2FwZVN0cmluZyAoc3RyaW5nOiBzdHJpbmcpIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGxldCBjaGFyID0gMFxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgY2hhciA+PSAweDEwMDAwID8gaSArPSAyIDogaSsrKSB7XG4gICAgY2hhciA9IGNvZGVQb2ludEF0KHN0cmluZywgaSlcbiAgICBjb25zdCBlc2NhcGVTZXEgPSBFU0NBUEVfU0VRVUVOQ0VTW2NoYXJdXG5cbiAgICBpZiAoZXNjYXBlU2VxKSB7XG4gICAgICByZXN1bHQgKz0gZXNjYXBlU2VxXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIGlmIChpc1ByaW50YWJsZShjaGFyKSkge1xuICAgICAgcmVzdWx0ICs9IHN0cmluZ1tpXVxuICAgICAgaWYgKGNoYXIgPj0gMHgxMDAwMCkgcmVzdWx0ICs9IHN0cmluZ1tpICsgMV1cbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgcmVzdWx0ICs9IGVuY29kZU5vblByaW50YWJsZShjaGFyKVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb3dTZXF1ZW5jZSAoc3RhdGU6IFByZXNlbnRlclN0YXRlLCBsZXZlbDogbnVtYmVyLCBub2RlOiBTZXF1ZW5jZU5vZGUpIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG5cbiAgZm9yIChsZXQgaW5kZXggPSAwLCBsZW5ndGggPSBub2RlLml0ZW1zLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCBpdGVtID0gd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCwgbm9kZS5pdGVtc1tpbmRleF0sIHt9KVxuICAgIGlmIChyZXN1bHQgIT09ICcnKSByZXN1bHQgKz0gYCwkeyFzdGF0ZS5mbG93U2tpcENvbW1hU3BhY2UgPyAnICcgOiAnJ31gXG4gICAgcmVzdWx0ICs9IGl0ZW1cbiAgfVxuXG4gIGNvbnN0IHBhZCA9IHN0YXRlLmZsb3dCcmFja2V0UGFkZGluZyAmJiByZXN1bHQgIT09ICcnID8gJyAnIDogJydcbiAgcmV0dXJuIGBbJHtwYWR9JHtyZXN1bHR9JHtwYWR9XWBcbn1cblxuZnVuY3Rpb24gd3JpdGVCbG9ja1NlcXVlbmNlIChzdGF0ZTogUHJlc2VudGVyU3RhdGUsIGxldmVsOiBudW1iZXIsIG5vZGU6IFNlcXVlbmNlTm9kZSwgY29tcGFjdDogYm9vbGVhbikge1xuICBsZXQgcmVzdWx0ID0gJydcblxuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IG5vZGUuaXRlbXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGNvbnN0IGl0ZW0gPSB3cml0ZU5vZGUoc3RhdGUsIGxldmVsICsgMSwgbm9kZS5pdGVtc1tpbmRleF0sXG4gICAgICB7IGJsb2NrOiB0cnVlLCBjb21wYWN0OiBzdGF0ZS5zZXFJbmxpbmVGaXJzdCwgaXNibG9ja3NlcTogdHJ1ZSB9KVxuXG4gICAgaWYgKCFjb21wYWN0IHx8IHJlc3VsdCAhPT0gJycpIHtcbiAgICAgIHJlc3VsdCArPSBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlLCBsZXZlbClcbiAgICB9XG5cbiAgICAvLyBObyB0cmFpbGluZyBzcGFjZSB3aGVuIHRoZSB2YWx1ZSByZW5kZXJzIGVtcHR5IChlLmcuIG51bGwg4oaSICcnKS5cbiAgICBpZiAoaXRlbSA9PT0gJycgfHwgQ0hBUl9MSU5FX0ZFRUQgPT09IGl0ZW0uY2hhckNvZGVBdCgwKSkge1xuICAgICAgcmVzdWx0ICs9ICctJ1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgKz0gJy0gJ1xuICAgIH1cblxuICAgIHJlc3VsdCArPSBpdGVtXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIHdyaXRlRmxvd01hcHBpbmcgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgbGV2ZWw6IG51bWJlciwgbm9kZTogTWFwcGluZ05vZGUpIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGNvbnN0IGl0ZW1zID0gc29ydE1hcHBpbmdJdGVtcyhzdGF0ZSwgbm9kZS5pdGVtcylcblxuICBmb3IgKGNvbnN0IHsga2V5LCB2YWx1ZSB9IG9mIGl0ZW1zKSB7XG4gICAgbGV0IHBhaXJCdWZmZXIgPSAnJ1xuICAgIGlmIChyZXN1bHQgIT09ICcnKSBwYWlyQnVmZmVyICs9IGAsJHshc3RhdGUuZmxvd1NraXBDb21tYVNwYWNlID8gJyAnIDogJyd9YFxuXG4gICAgY29uc3Qga2V5VGV4dCA9IHdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwsIGtleSwgeyBpc2tleTogdHJ1ZSB9KVxuICAgIGNvbnN0IGV4cGxpY2l0UGFpciA9IGtleVRleHQubGVuZ3RoID4gMTAyNFxuXG4gICAgaWYgKGV4cGxpY2l0UGFpcikge1xuICAgICAgcGFpckJ1ZmZlciArPSAnPyAnXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5xdW90ZUZsb3dLZXlzKSB7XG4gICAgICBwYWlyQnVmZmVyICs9ICdcIidcbiAgICB9XG5cbiAgICBjb25zdCB2YWx1ZVRleHQgPSB3cml0ZU5vZGUoc3RhdGUsIGxldmVsLCB2YWx1ZSwge30pXG4gICAgLy8gTm8gc2VwYXJhdGluZyBzcGFjZSB3aGVuIHRoZSB2YWx1ZSByZW5kZXJzIGVtcHR5IChlLmcuIG51bGwg4oaSICcnKS5cbiAgICBjb25zdCBzZXAgPSBzdGF0ZS5mbG93U2tpcENvbG9uU3BhY2UgfHwgdmFsdWVUZXh0ID09PSAnJyA/ICcnIDogJyAnXG5cbiAgICBwYWlyQnVmZmVyICs9IGAke2tleVRleHR9JHtzdGF0ZS5xdW90ZUZsb3dLZXlzICYmICFleHBsaWNpdFBhaXIgPyAnXCInIDogJyd9OiR7c2VwfSR7dmFsdWVUZXh0fWBcblxuICAgIHJlc3VsdCArPSBwYWlyQnVmZmVyXG4gIH1cblxuICBjb25zdCBwYWQgPSBzdGF0ZS5mbG93QnJhY2tldFBhZGRpbmcgJiYgcmVzdWx0ICE9PSAnJyA/ICcgJyA6ICcnXG4gIHJldHVybiBgeyR7cGFkfSR7cmVzdWx0fSR7cGFkfX1gXG59XG5cbi8vIEEgc2NhbGFyIGtleSBzb3J0cyBieSBpdHMgdGV4dDsgdGhlIGRlZmF1bHQgc29ydCBhbmQgYSBjdXN0b20gY29tcGFyYXRvciBib3RoXG4vLyBzZWUgdGhhdCwgbWF0Y2hpbmcgdGhlIG9yaWdpbmFsIGtleXMtYXJyYXkgc29ydC5cbmZ1bmN0aW9uIHNvcnRLZXlWYWx1ZSAoa2V5OiBOb2RlKTogYW55IHtcbiAgcmV0dXJuIGtleS5raW5kID09PSAnc2NhbGFyJyA/IGtleS52YWx1ZSA6IGtleVxufVxuXG5mdW5jdGlvbiBzb3J0TWFwcGluZ0l0ZW1zIChzdGF0ZTogUHJlc2VudGVyU3RhdGUsIGl0ZW1zOiBNYXBwaW5nTm9kZVsnaXRlbXMnXSkge1xuICBpZiAoIXN0YXRlLnNvcnRLZXlzKSByZXR1cm4gaXRlbXNcblxuICBjb25zdCBjb3B5ID0gaXRlbXMuc2xpY2UoKVxuXG4gIGlmIChzdGF0ZS5zb3J0S2V5cyA9PT0gdHJ1ZSkge1xuICAgIGNvcHkuc29ydCgoYSwgYikgPT4ge1xuICAgICAgY29uc3QgeCA9IHNvcnRLZXlWYWx1ZShhLmtleSlcbiAgICAgIGNvbnN0IHkgPSBzb3J0S2V5VmFsdWUoYi5rZXkpXG4gICAgICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICAgICAgaWYgKHggPiB5KSByZXR1cm4gMVxuICAgICAgcmV0dXJuIDBcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGZuID0gc3RhdGUuc29ydEtleXNcbiAgICBjb3B5LnNvcnQoKGEsIGIpID0+IGZuKHNvcnRLZXlWYWx1ZShhLmtleSksIHNvcnRLZXlWYWx1ZShiLmtleSkpKVxuICB9XG5cbiAgcmV0dXJuIGNvcHlcbn1cblxuZnVuY3Rpb24gd3JpdGVCbG9ja01hcHBpbmcgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgbGV2ZWw6IG51bWJlciwgbm9kZTogTWFwcGluZ05vZGUsIGNvbXBhY3Q6IGJvb2xlYW4pIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGNvbnN0IGl0ZW1zID0gc29ydE1hcHBpbmdJdGVtcyhzdGF0ZSwgbm9kZS5pdGVtcylcblxuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IGl0ZW1zLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBsZXQgcGFpckJ1ZmZlciA9ICcnXG5cbiAgICBpZiAoIWNvbXBhY3QgfHwgcmVzdWx0ICE9PSAnJykge1xuICAgICAgcGFpckJ1ZmZlciArPSBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlLCBsZXZlbClcbiAgICB9XG5cbiAgICBjb25zdCB7IGtleSwgdmFsdWUgfSA9IGl0ZW1zW2luZGV4XVxuXG4gICAgLy8gQSBibG9jayBrZXkg4oCUIGEgYmxvY2sgY29sbGVjdGlvbiAobWFwcGluZy9zZXF1ZW5jZSkgb3IgYSBibG9jayBzY2FsYXJcbiAgICAvLyAobGl0ZXJhbC9mb2xkZWQpIOKAlCBjYW4ndCBzaXQgb24gYSBga2V5OmAgbGluZSwgc28gaXQncyB3cml0dGVuIHdpdGggYmxvY2tcbiAgICAvLyBjb250ZXh0IGFuZCB0aGUgcGFpciB0YWtlcyB0aGUgZXhwbGljaXQgYD8ga2V5IC8gOiB2YWx1ZWAgZm9ybS4gQSBzaW1wbGVcbiAgICAvLyBzY2FsYXIga2V5IHN0YXlzIGlubGluZSAoZmxvdy12cy1ibG9jayBpcyBpbnZpc2libGUgdGhlcmUpLlxuICAgIGNvbnN0IGtleUlzQmxvY2sgPVxuICAgICAgKChrZXkua2luZCA9PT0gJ21hcHBpbmcnIHx8IGtleS5raW5kID09PSAnc2VxdWVuY2UnKSAmJlxuICAgICAgICAha2V5LnN0eWxlLmZsb3cgJiYga2V5Lml0ZW1zLmxlbmd0aCAhPT0gMCkgfHxcbiAgICAgIChrZXkua2luZCA9PT0gJ3NjYWxhcicgJiYgKGtleS5zdHlsZS5saXRlcmFsIHx8IGtleS5zdHlsZS5mb2xkZWQpKVxuXG4gICAgLy8gVGhlIGA/YC9gOmAgaW5kaWNhdG9ycyBzaGlmdCBjb250ZW50IHJpZ2h0IGxpa2UgYSBgLWAsIHNvIGEgYmxvY2sga2V5IG9yXG4gICAgLy8gdmFsdWUgdGhhdCBzdGF5cyBvbiB0aGUgaW5kaWNhdG9yIGxpbmUga2VlcHMgaXRzIGluZGVudGF0aW9uIHVuZGVyXG4gICAgLy8gc2VxTm9JbmRlbnQgKGBpc2Jsb2Nrc2VxYCkuIE9uZSB0aGF0IGRyb3BzIHRvIGl0cyBvd24gbGluZSAodGFnL2FuY2hvcilcbiAgICAvLyBjb2xsYXBzZXMgdG8gdGhlIHBhcmVudCBpbmRlbnQsIHNvIGxlYXZlIHRoZSBmbGFnIG9mZiB0aGVyZS5cbiAgICBjb25zdCBrZXlUZXh0ID0ga2V5SXNCbG9ja1xuICAgICAgPyB3cml0ZU5vZGUoc3RhdGUsIGxldmVsICsgMSwga2V5LFxuICAgICAgICB7IGJsb2NrOiB0cnVlLCBjb21wYWN0OiB0cnVlLCBpc2Jsb2Nrc2VxOiAhY2Fubm90QmVDb21wYWN0KHN0YXRlLCBrZXksIGxldmVsICsgMSkgfSlcbiAgICAgIDogd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCArIDEsIGtleSwgeyBibG9jazogdHJ1ZSwgY29tcGFjdDogdHJ1ZSwgaXNrZXk6IHRydWUgfSlcblxuICAgIC8vIEJsb2NrIGtleSwgb3Zlci1sb25nIGtleSwgb3IgbXVsdGlsaW5lIHNjYWxhciBrZXkgZm9yY2VzIGV4cGxpY2l0IGZvcm0uXG4gICAgLy8gTXVsdGlsaW5lIGlzbid0IGEgc3BlYyByZXF1aXJlbWVudCDigJQganVzdCBtYXRjaGVzIHB5eWFtbCdzIHNpbXBsZS1rZXkgcnVsZS5cbiAgICBjb25zdCBrZXlIYXNMaW5lQnJlYWsgPSBrZXkua2luZCA9PT0gJ3NjYWxhcicgJiYga2V5LnZhbHVlLmluZGV4T2YoJ1xcbicpICE9PSAtMVxuICAgIGNvbnN0IGV4cGxpY2l0UGFpciA9IGtleUlzQmxvY2sgfHwga2V5SGFzTGluZUJyZWFrIHx8IGtleVRleHQubGVuZ3RoID4gMTAyNFxuXG4gICAgaWYgKGV4cGxpY2l0UGFpcikge1xuICAgICAgaWYgKGtleVRleHQgJiYgQ0hBUl9MSU5FX0ZFRUQgPT09IGtleVRleHQuY2hhckNvZGVBdCgwKSkge1xuICAgICAgICBwYWlyQnVmZmVyICs9ICc/J1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFpckJ1ZmZlciArPSAnPyAnXG4gICAgICB9XG4gICAgfVxuXG4gICAgcGFpckJ1ZmZlciArPSBrZXlUZXh0XG5cbiAgICBpZiAoZXhwbGljaXRQYWlyKSB7XG4gICAgICBwYWlyQnVmZmVyICs9IGdlbmVyYXRlTmV4dExpbmUoc3RhdGUsIGxldmVsKVxuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlVGV4dCA9IHdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwgKyAxLCB2YWx1ZSxcbiAgICAgIHsgYmxvY2s6IHRydWUsIGNvbXBhY3Q6IGV4cGxpY2l0UGFpciwgaXNibG9ja3NlcTogZXhwbGljaXRQYWlyICYmICFjYW5ub3RCZUNvbXBhY3Qoc3RhdGUsIHZhbHVlLCBsZXZlbCArIDEpIH0pXG5cbiAgICAvLyBLZWVwIGEgc3BhY2UgYmVmb3JlIHRoZSBjb2xvbiB3aGVuIHRoZSBrZXkgdGV4dCBlbmRzIGluIGEgbGVhZGluZ1xuICAgIC8vIHByb3BlcnR5IHJhdGhlciB0aGFuIHNjYWxhciBjb250ZW50LCBzbyB0aGUgY29sb24gY2FuJ3QgYmUgcmVhZCBhcyBwYXJ0XG4gICAgLy8gb2YgaXQuIFR3byBjYXNlczogYW4gaW5saW5lIGFsaWFzIGtleSAoYCpiIDogdmApLCBhbmQgYW4gZW1wdHkgc2NhbGFyIGtleVxuICAgIC8vIHdob3NlIHdob2xlIHRleHQgaXMgaXRzIGFuY2hvci90YWcgKGAmYSA6YCwgYCEhc3RyIDpgKSDigJQgd2l0aG91dCB0aGVcbiAgICAvLyBzcGFjZSBgJmE6YCByZXBhcnNlcyBhcyBhbiBhbmNob3JlZCB2YWx1ZSwgZHJvcHBpbmcgdGhlIG51bGwga2V5LlxuICAgIGNvbnN0IGtleUlzQmFyZVByb3BzID0ga2V5LmtpbmQgPT09ICdzY2FsYXInICYmIGtleS52YWx1ZSA9PT0gJycgJiZcbiAgICAgIGtleVRleHQgIT09ICcnICYmXG4gICAgICBrZXlUZXh0LmNoYXJDb2RlQXQoa2V5VGV4dC5sZW5ndGggLSAxKSAhPT0gQ0hBUl9TSU5HTEVfUVVPVEUgJiZcbiAgICAgIGtleVRleHQuY2hhckNvZGVBdChrZXlUZXh0Lmxlbmd0aCAtIDEpICE9PSBDSEFSX0RPVUJMRV9RVU9URVxuICAgIGNvbnN0IGtleUNvbG9uU2VwID0gIWV4cGxpY2l0UGFpciAmJiAoa2V5LmtpbmQgPT09ICdhbGlhcycgfHwga2V5SXNCYXJlUHJvcHMpID8gJyAnIDogJydcblxuICAgIC8vIE5vIHRyYWlsaW5nIHNwYWNlIHdoZW4gdGhlIHZhbHVlIHJlbmRlcnMgZW1wdHkgKGUuZy4gbnVsbCDihpIgJycpLlxuICAgIGlmICh2YWx1ZVRleHQgPT09ICcnIHx8IENIQVJfTElORV9GRUVEID09PSB2YWx1ZVRleHQuY2hhckNvZGVBdCgwKSkge1xuICAgICAgcGFpckJ1ZmZlciArPSBgJHtrZXlDb2xvblNlcH06YFxuICAgIH0gZWxzZSB7XG4gICAgICBwYWlyQnVmZmVyICs9IGAke2tleUNvbG9uU2VwfTogYFxuICAgIH1cblxuICAgIHBhaXJCdWZmZXIgKz0gdmFsdWVUZXh0XG5cbiAgICByZXN1bHQgKz0gcGFpckJ1ZmZlclxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG4vLyBXaGVyZSBhIG5vZGUgc2l0cyByZWxhdGl2ZSB0byBpdHMgcGFyZW50IOKAlCBkcml2ZXMgbGF5b3V0L3N0eWxlIGRlY2lzaW9ucy5cbi8vIEFsbCBmbGFncyBkZWZhdWx0IHRvIGZhbHNlICh0aGUgZmxvdy1jb250ZXh0LCBub24ta2V5LCBub24tY29tcGFjdCBjYXNlKS5cbmludGVyZmFjZSBOb2RlQ29udGV4dCB7XG4gIGJsb2NrPzogYm9vbGVhbiAgICAgIC8vIGJsb2NrIGNvbnRleHQgKHZzIGZsb3cpOyBwcm9wYWdhdGVzIGRvd253YXJkXG4gIGNvbXBhY3Q/OiBib29sZWFuICAgIC8vIG1heSBzdGFydCBvbiB0aGUgY3VycmVudCBsaW5lIChubyBsZWFkaW5nIG5ld2xpbmUpXG4gIGlza2V5PzogYm9vbGVhbiAgICAgIC8vIG5vZGUgaXMgYSBtYXBwaW5nIGtleVxuICBpc2Jsb2Nrc2VxPzogYm9vbGVhbiAvLyBjb250ZW50IGZvbGxvd3MgYW4gaW5kaWNhdG9yIChgLWAsIG9yIGA/YC9gOmAgaW4gYW5cbiAgICAgICAgICAgICAgICAgICAgICAgLy8gZXhwbGljaXQgcGFpcikgdGhhdCBhbHJlYWR5IHNoaWZ0ZWQgaXQgcmlnaHQ7IGtlZXBzXG4gICAgICAgICAgICAgICAgICAgICAgIC8vIGl0cyBpbmRlbnRhdGlvbiB1bmRlciBzZXFOb0luZGVudFxufVxuXG4vLyBBIG5vZGUgY2FuJ3Qgc2l0IGNvbXBhY3Qgb24gaXRzIHBhcmVudCdzIGluZGljYXRvciAoYC1gL2A/YC9gOmApIGxpbmUgd2hlbiBpdFxuLy8gY2FycmllcyBsZWFkaW5nIHByb3BzICh0YWcvYW5jaG9yKSB0aGF0IHdvdWxkIGNvbGxpZGUgd2l0aCB0aGUgaW5kaWNhdG9yLCBvclxuLy8gd2hlbiB0aGUgaW5kZW50IHN0ZXAgaXMgdG9vIG5hcnJvdyBmb3IgdGhlIDItY2hhciBpbmRpY2F0b3IuIFN1Y2ggYSBub2RlIGRyb3BzXG4vLyB0byBpdHMgb3duIGxpbmU7IGEgYmxvY2sgY29sbGVjdGlvbiB0aGF0IGRvZXMgc28gYWxzbyBjb2xsYXBzZXMgaXRzIHNlcU5vSW5kZW50XG4vLyBpbmRlbnRhdGlvbiBiYWNrIHRvIHRoZSBwYXJlbnQuXG5mdW5jdGlvbiBjYW5ub3RCZUNvbXBhY3QgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgbm9kZTogTm9kZSwgbGV2ZWw6IG51bWJlcikge1xuICByZXR1cm4gbm9kZS5zdHlsZS50YWdnZWQgfHwgbm9kZS5hbmNob3IgIT09IHVuZGVmaW5lZCB8fCAoc3RhdGUuaW5kZW50IDwgMiAmJiBsZXZlbCA+IDApXG59XG5cbmZ1bmN0aW9uIHdyaXRlTm9kZSAoc3RhdGU6IFByZXNlbnRlclN0YXRlLCBsZXZlbDogbnVtYmVyLCBub2RlOiBOb2RlLCBjdHg6IE5vZGVDb250ZXh0KTogc3RyaW5nIHtcbiAgaWYgKG5vZGUua2luZCA9PT0gJ2FsaWFzJykgcmV0dXJuIGAqJHtub2RlLmFuY2hvcn1gXG5cbiAgY29uc3QgeyBibG9jayA9IGZhbHNlLCBpc2tleSA9IGZhbHNlLCBpc2Jsb2Nrc2VxID0gZmFsc2UgfSA9IGN0eFxuICBsZXQgY29tcGFjdCA9IGN0eC5jb21wYWN0ID8/IGZhbHNlXG5cbiAgY29uc3QgaGFzQW5jaG9yID0gbm9kZS5hbmNob3IgIT09IHVuZGVmaW5lZFxuXG4gIGlmIChjYW5ub3RCZUNvbXBhY3Qoc3RhdGUsIG5vZGUsIGxldmVsKSkge1xuICAgIGNvbXBhY3QgPSBmYWxzZVxuICB9XG5cbiAgbGV0IGJvZHk6IHN0cmluZ1xuICBsZXQgc2hvdWxkUHJpbnRUYWcgPSBub2RlLnN0eWxlLnRhZ2dlZFxuICBjb25zdCB1c2VCbG9ja0NvbGxlY3Rpb24gPSBibG9jayAmJlxuICAgIChub2RlLmtpbmQgPT09ICdtYXBwaW5nJyB8fCBub2RlLmtpbmQgPT09ICdzZXF1ZW5jZScpICYmXG4gICAgIW5vZGUuc3R5bGUuZmxvdyAmJiBub2RlLml0ZW1zLmxlbmd0aCAhPT0gMFxuXG4gIGlmIChub2RlLmtpbmQgPT09ICdtYXBwaW5nJykge1xuICAgIGlmICh1c2VCbG9ja0NvbGxlY3Rpb24pIHtcbiAgICAgIGJvZHkgPSB3cml0ZUJsb2NrTWFwcGluZyhzdGF0ZSwgbGV2ZWwsIG5vZGUsIGNvbXBhY3QpXG4gICAgfSBlbHNlIHtcbiAgICAgIGJvZHkgPSB3cml0ZUZsb3dNYXBwaW5nKHN0YXRlLCBsZXZlbCwgbm9kZSlcbiAgICB9XG4gIH0gZWxzZSBpZiAobm9kZS5raW5kID09PSAnc2VxdWVuY2UnKSB7XG4gICAgaWYgKHVzZUJsb2NrQ29sbGVjdGlvbikge1xuICAgICAgaWYgKHN0YXRlLnNlcU5vSW5kZW50ICYmICFpc2Jsb2Nrc2VxICYmIGxldmVsID4gMCkge1xuICAgICAgICBib2R5ID0gd3JpdGVCbG9ja1NlcXVlbmNlKHN0YXRlLCBsZXZlbCAtIDEsIG5vZGUsIGNvbXBhY3QpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBib2R5ID0gd3JpdGVCbG9ja1NlcXVlbmNlKHN0YXRlLCBsZXZlbCwgbm9kZSwgY29tcGFjdClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYm9keSA9IHdyaXRlRmxvd1NlcXVlbmNlKHN0YXRlLCBsZXZlbCwgbm9kZSlcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgbGF5b3V0ID0gc2NhbGFyTGF5b3V0KHN0YXRlLCBsZXZlbClcbiAgICBjb25zdCBzdHlsZSA9IHJlc29sdmVTY2FsYXJTdHlsZShzdGF0ZSwgbm9kZSwgbGF5b3V0LCBpc2tleSwgYmxvY2spXG4gICAgYm9keSA9IHJlbmRlclNjYWxhclN0eWxlKG5vZGUudmFsdWUsIHN0eWxlLCBsYXlvdXQpXG4gICAgc2hvdWxkUHJpbnRUYWcgPSBub2RlLnN0eWxlLnRhZ2dlZCB8fCAoc3R5bGUgIT09IFNUWUxFX1BMQUlOICYmIG5vZGUudGFnICE9PSBzdGF0ZS5kZWZhdWx0U2NhbGFyVGFnTmFtZSlcbiAgfVxuXG4gIC8vIEFuIGluZGljYXRvciBwbHVzIGl0cyBtYW5kYXRvcnkgc2VwYXJhdG9yIG9jY3VwaWVzIDIgY29sdW1ucy4gRm9yIHdpZGVyXG4gIC8vIGluZGVudGF0aW9uLCBwYWQgYSBjb21wYWN0IGJsb2NrIGNvbGxlY3Rpb24gc28gaXRzIGZpcnN0IGl0ZW0gc3RhcnRzIGF0XG4gIC8vIHRoZSBzYW1lIGNvbHVtbiBhcyB0aGUgZm9sbG93aW5nIGl0ZW1zLlxuICBpZiAodXNlQmxvY2tDb2xsZWN0aW9uICYmIGNvbXBhY3QgJiYgbGV2ZWwgPiAwICYmIHN0YXRlLmluZGVudCA+IDIpIHtcbiAgICBib2R5ID0gYCR7JyAnLnJlcGVhdChzdGF0ZS5pbmRlbnQgLSAyKX0ke2JvZHl9YFxuICB9XG5cbiAgaWYgKHNob3VsZFByaW50VGFnIHx8IGhhc0FuY2hvcikge1xuICAgIGNvbnN0IHByb3BzOiBzdHJpbmdbXSA9IFtdXG4gICAgY29uc3QgdGFnID0gc2hvdWxkUHJpbnRUYWcgPyBub2RlVGFnU2hvcnQobm9kZSkgOiBudWxsXG4gICAgY29uc3QgYW5jaG9yID0gaGFzQW5jaG9yID8gYCYke25vZGUuYW5jaG9yfWAgOiBudWxsXG5cbiAgICBpZiAoc3RhdGUudGFnQmVmb3JlQW5jaG9yKSB7XG4gICAgICBpZiAodGFnICE9PSBudWxsKSBwcm9wcy5wdXNoKHRhZylcbiAgICAgIGlmIChhbmNob3IgIT09IG51bGwpIHByb3BzLnB1c2goYW5jaG9yKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoYW5jaG9yICE9PSBudWxsKSBwcm9wcy5wdXNoKGFuY2hvcilcbiAgICAgIGlmICh0YWcgIT09IG51bGwpIHByb3BzLnB1c2godGFnKVxuICAgIH1cblxuICAgIC8vIE5vIHNlcGFyYXRvciB3aGVuIHRoZSBib2R5IGlzIGVtcHR5IChlLmcuIGAmYW5jaG9yYCBvbiBhIG51bGwgbm9kZSkgb3JcbiAgICAvLyBhbHJlYWR5IHN0YXJ0cyBvbiBpdHMgb3duIGxpbmUuXG4gICAgY29uc3Qgc2VwID0gYm9keSA9PT0gJycgfHwgYm9keS5jaGFyQ29kZUF0KDApID09PSBDSEFSX0xJTkVfRkVFRCA/ICcnIDogJyAnXG4gICAgYm9keSA9IGAke3Byb3BzLmpvaW4oJyAnKX0ke3NlcH0ke2JvZHl9YFxuICB9XG5cbiAgcmV0dXJuIGJvZHlcbn1cblxuLy8gQSBiYXJlICh1bnRhZ2dlZCwgdW5hbmNob3JlZCkgbm9uLWVtcHR5IGJsb2NrIGNvbGxlY3Rpb246IHdyaXRlTm9kZSByZW5kZXJzIGl0XG4vLyBpbiBjb21wYWN0IGZvcm0gd2l0aCBpdHMgZmlyc3QgaXRlbSBvbiB0aGUgb3BlbmluZyBsaW5lLiBUaGF0IHdvcmtzIG1pZC1zdHJlYW0sXG4vLyBidXQgcmlnaHQgYWZ0ZXIgYSBgLS0tYCB0aGUgZmlyc3QgaXRlbSBtdXN0IGRyb3AgdG8gdGhlIG5leHQgbGluZS4gQSB0YWcvYW5jaG9yXG4vLyBhbHJlYWR5IGZvcmNlcyB0aGUgYm9keSBvbnRvIGl0cyBvd24gbGluZSwgc28gdGhvc2Ugc3RheSBvbiB0aGUgYC0tLWAgbGluZS5cbmZ1bmN0aW9uIHJvb3RTdGFydHNPd25MaW5lIChub2RlOiBOb2RlKSB7XG4gIHJldHVybiAobm9kZS5raW5kID09PSAnc2VxdWVuY2UnIHx8IG5vZGUua2luZCA9PT0gJ21hcHBpbmcnKSAmJlxuICAgICFub2RlLnN0eWxlLmZsb3cgJiZcbiAgICBub2RlLml0ZW1zLmxlbmd0aCAhPT0gMCAmJlxuICAgICFub2RlLnN0eWxlLnRhZ2dlZCAmJlxuICAgIG5vZGUuYW5jaG9yID09PSB1bmRlZmluZWRcbn1cblxuLy8gQSBkb2N1bWVudCB3aG9zZSBzZXJpYWxpemF0aW9uIGVuZHMgd2l0aCBhIGtlZXAtY2hvbXBlZCAoYCtgKSBibG9jayBzY2FsYXIgaXNcbi8vIG9wZW4tZW5kZWQ6IHRoZSB0cmFpbGluZyBibGFuayBsaW5lKHMpIHdvdWxkIG90aGVyd2lzZSBiZSBhbWJpZ3VvdXMsIHNvIGl0XG4vLyBuZWVkcyBhIGAuLi5gIHRlcm1pbmF0b3IuIE1pcnJvcnMgdGhlIGtlZXAgdGVzdCBpbiBgYmxvY2tIZWFkZXJgLlxuZnVuY3Rpb24gaXNPcGVuRW5kZWQgKG5vZGU6IE5vZGUpIHtcbiAgLy8gRGVzY2VuZCB0byB0aGUgbGFzdCBsZWFmLCBhbHdheXMgdGFraW5nIHRoZSBsYXN0IGl0ZW0gb2YgYSBibG9jayBjb2xsZWN0aW9uXG4gIC8vIChhIGZsb3cgY29sbGVjdGlvbiByZW5kZXJzIG9uIG9uZSBsaW5lLCBzbyBpdCBlbmRzIHRoZSBkb2N1bWVudCBpdHNlbGYpLlxuICBsZXQgbGVhZiA9IG5vZGVcbiAgd2hpbGUgKChsZWFmLmtpbmQgPT09ICdzZXF1ZW5jZScgfHwgbGVhZi5raW5kID09PSAnbWFwcGluZycpICYmXG4gICAgIWxlYWYuc3R5bGUuZmxvdyAmJiBsZWFmLml0ZW1zLmxlbmd0aCAhPT0gMCkge1xuICAgIGxlYWYgPSBsZWFmLmtpbmQgPT09ICdzZXF1ZW5jZSdcbiAgICAgID8gbGVhZi5pdGVtc1tsZWFmLml0ZW1zLmxlbmd0aCAtIDFdXG4gICAgICA6IGxlYWYuaXRlbXNbbGVhZi5pdGVtcy5sZW5ndGggLSAxXS52YWx1ZVxuICB9XG5cbiAgaWYgKGxlYWYua2luZCAhPT0gJ3NjYWxhcicgfHwgIShsZWFmLnN0eWxlLmxpdGVyYWwgfHwgbGVhZi5zdHlsZS5mb2xkZWQpKSByZXR1cm4gZmFsc2VcbiAgY29uc3QgeyB2YWx1ZSB9ID0gbGVhZlxuICAvLyBLZWVwIGNob21waW5nOiBlbmRzIGluIGEgYmxhbmsgbGluZSAoYFxcblxcbmApIG9yIGlzIGEgbG9uZSBgXFxuYC5cbiAgcmV0dXJuIHZhbHVlLmVuZHNXaXRoKCdcXG5cXG4nKSB8fCB2YWx1ZSA9PT0gJ1xcbidcbn1cblxuZnVuY3Rpb24gd3JpdGVEb2N1bWVudERpcmVjdGl2ZXMgKGRvYzogRG9jdW1lbnQpIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG5cbiAgZm9yIChjb25zdCBkaXJlY3RpdmUgb2YgZG9jLmRpcmVjdGl2ZXMpIHtcbiAgICBpZiAoZGlyZWN0aXZlLmtpbmQgPT09ICd5YW1sJykge1xuICAgICAgcmVzdWx0ICs9IGAlWUFNTCAke2RpcmVjdGl2ZS52ZXJzaW9ufVxcbmBcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgY29uc3QgeyBoYW5kbGUsIHByZWZpeCB9ID0gZGlyZWN0aXZlXG4gICAgcmVzdWx0ICs9IGAlVEFHICR7aGFuZGxlfSAke3ByZWZpeH1cXG5gXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbi8vIERvY3VtZW50cyDihpIgdGV4dCwgaW5jbHVkaW5nIHRoZSB0cmFpbGluZyBuZXdsaW5lLlxuZnVuY3Rpb24gcHJlc2VudCAoZG9jdW1lbnRzOiBEb2N1bWVudFtdLCBvcHRpb25zOiBQcmVzZW50ZXJPcHRpb25zKTogc3RyaW5nIHtcbiAgY29uc3Qgc3RhdGUgPSBjcmVhdGVQcmVzZW50ZXJTdGF0ZShvcHRpb25zKVxuICBsZXQgcmVzdWx0ID0gJydcbiAgbGV0IHByZXZpb3VzRW5kZWQgPSBmYWxzZVxuXG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBkb2N1bWVudHMubGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgY29uc3QgZG9jID0gZG9jdW1lbnRzW2luZGV4XVxuICAgIGNvbnN0IGRpcmVjdGl2ZXMgPSB3cml0ZURvY3VtZW50RGlyZWN0aXZlcyhkb2MpXG4gICAgY29uc3QgaGFzRGlyZWN0aXZlcyA9IGRpcmVjdGl2ZXMgIT09ICcnXG4gICAgY29uc3QgbWFya2VyID0gZG9jLmV4cGxpY2l0U3RhcnQgfHwgaGFzRGlyZWN0aXZlcyB8fCAoaW5kZXggPiAwICYmICFwcmV2aW91c0VuZGVkKVxuXG4gICAgcmVzdWx0ICs9IGRpcmVjdGl2ZXNcblxuICAgIGlmIChkb2MuY29udGVudHMgPT09IG51bGwpIHtcbiAgICAgIGlmIChtYXJrZXIpIHJlc3VsdCArPSAnLS0tXFxuJ1xuICAgIH0gZWxzZSBpZiAobWFya2VyKSB7XG4gICAgICBjb25zdCBib2R5ID0gd3JpdGVOb2RlKHN0YXRlLCAwLCBkb2MuY29udGVudHMsIHsgYmxvY2s6IHRydWUsIGNvbXBhY3Q6IHRydWUgfSlcbiAgICAgIC8vIENvbnRlbnQgc2hhcmVzIHRoZSBgLS0tYCBsaW5lLCBleGNlcHQ6IGFuIGVtcHR5IHJlbmRlciAobm8gc2VwYXJhdG9yIGF0XG4gICAgICAvLyBhbGwpLCBhIGJhcmUgYmxvY2sgY29sbGVjdGlvbiAod3JhcHMgdG8gdGhlIG5leHQgbGluZSksIG9yIGRpcmVjdGl2ZXNcbiAgICAgIC8vIGZvcmNpbmcgYC0tLWAgb250byBpdHMgb3duIGxpbmUuXG4gICAgICBjb25zdCBzZXAgPSBib2R5ID09PSAnJyA/ICcnIDogKGhhc0RpcmVjdGl2ZXMgfHwgcm9vdFN0YXJ0c093bkxpbmUoZG9jLmNvbnRlbnRzKSA/ICdcXG4nIDogJyAnKVxuICAgICAgcmVzdWx0ICs9IGAtLS0ke3NlcH0ke2JvZHl9XFxuYFxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgKz0gd3JpdGVOb2RlKHN0YXRlLCAwLCBkb2MuY29udGVudHMsIHsgYmxvY2s6IHRydWUsIGNvbXBhY3Q6IHRydWUgfSkgKyAnXFxuJ1xuICAgIH1cblxuICAgIHByZXZpb3VzRW5kZWQgPSBkb2MuZXhwbGljaXRFbmQgfHwgKGRvYy5jb250ZW50cyAhPT0gbnVsbCAmJiBpc09wZW5FbmRlZChkb2MuY29udGVudHMpKVxuICAgIGlmIChwcmV2aW91c0VuZGVkKSB7XG4gICAgICByZXN1bHQgKz0gJy4uLlxcbidcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbmV4cG9ydCB7XG4gIERFRkFVTFRfUFJFU0VOVEVSX09QVElPTlMsXG4gIHByZXNlbnQsXG4gIHR5cGUgUHJlc2VudGVyT3B0aW9uc1xufVxuIiwgImltcG9ydCB7IFlBTUwxMV9TQ0hFTUEsIHR5cGUgU2NoZW1hIH0gZnJvbSAnLi9zY2hlbWEudHMnXG5pbXBvcnQgeyBqc1RvQXN0IH0gZnJvbSAnLi9hc3QvZnJvbV9qcy50cydcbmltcG9ydCB7IHZpc2l0LCBWSVNJVF9TS0lQIH0gZnJvbSAnLi9hc3QvdmlzaXQudHMnXG5pbXBvcnQgeyB0eXBlIERvY3VtZW50IH0gZnJvbSAnLi9hc3Qvbm9kZXMudHMnXG5pbXBvcnQge1xuICBERUZBVUxUX1BSRVNFTlRFUl9PUFRJT05TLFxuICBwcmVzZW50LFxuICB0eXBlIFByZXNlbnRlck9wdGlvbnNcbn0gZnJvbSAnLi9hc3QvcHJlc2VudGVyLnRzJ1xuaW1wb3J0IHsgcGljayB9IGZyb20gJy4vY29tbW9uL29iamVjdC50cydcbmltcG9ydCB7IE5PVF9SRVNPTFZFRCB9IGZyb20gJy4vdGFnLnRzJ1xuaW1wb3J0IHsgaW50Q29yZVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9pbnRfY29yZS50cydcbmltcG9ydCB7IGludFlhbWwxMVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9pbnRfeWFtbDExLnRzJ1xuaW1wb3J0IHsgZmxvYXRDb3JlVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2Zsb2F0X2NvcmUudHMnXG5pbXBvcnQgeyBmbG9hdFlhbWwxMVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9mbG9hdF95YW1sMTEudHMnXG5cbmludGVyZmFjZSBEdW1wT3B0aW9ucyBleHRlbmRzIE9taXQ8UHJlc2VudGVyT3B0aW9ucywgJ3NjaGVtYSc+IHtcbiAgc2NoZW1hPzogU2NoZW1hXG4gIHNraXBJbnZhbGlkPzogYm9vbGVhblxuICBub1JlZnM/OiBib29sZWFuXG4gIGZsb3dMZXZlbD86IG51bWJlclxuICB0cmFuc2Zvcm0/OiAoZG9jdW1lbnRzOiBEb2N1bWVudFtdKSA9PiB2b2lkXG59XG5cbi8vIFlBTUwgMS4xIG1pc3NlcyBZQU1MIDEuMiBgMG8uLi5gIGludHMgYW5kIGV4cG9uZW50LW9ubHkgZmxvYXRzLlxuLy8gQ29tYmluZSByZXNvbHZlcnMgc28gYWxsIHBvc3NpYmxlIGNvbGxpc2lvbnMgYXJlIHF1b3RlZC5cbmNvbnN0IERFRkFVTFRfRFVNUF9TQ0hFTUEgPSBZQU1MMTFfU0NIRU1BLndpdGhUYWdzKFxuICB7XG4gICAgLi4uaW50WWFtbDExVGFnLFxuICAgIHJlc29sdmU6IChzb3VyY2UsIGlzRXhwbGljaXQsIHRhZ05hbWUpID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGludFlhbWwxMVRhZy5yZXNvbHZlKHNvdXJjZSwgaXNFeHBsaWNpdCwgdGFnTmFtZSlcbiAgICAgIHJldHVybiByZXN1bHQgPT09IE5PVF9SRVNPTFZFRCA/IGludENvcmVUYWcucmVzb2x2ZShzb3VyY2UsIGlzRXhwbGljaXQsIHRhZ05hbWUpIDogcmVzdWx0XG4gICAgfVxuICB9LFxuICB7XG4gICAgLi4uZmxvYXRZYW1sMTFUYWcsXG4gICAgcmVzb2x2ZTogKHNvdXJjZSwgaXNFeHBsaWNpdCwgdGFnTmFtZSkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gZmxvYXRZYW1sMTFUYWcucmVzb2x2ZShzb3VyY2UsIGlzRXhwbGljaXQsIHRhZ05hbWUpXG4gICAgICByZXR1cm4gcmVzdWx0ID09PSBOT1RfUkVTT0xWRUQgPyBmbG9hdENvcmVUYWcucmVzb2x2ZShzb3VyY2UsIGlzRXhwbGljaXQsIHRhZ05hbWUpIDogcmVzdWx0XG4gICAgfVxuICB9XG4pXG5cbmNvbnN0IERFRkFVTFRfRFVNUF9PUFRJT05TOiBSZXF1aXJlZDxEdW1wT3B0aW9ucz4gPSB7XG4gIC4uLkRFRkFVTFRfUFJFU0VOVEVSX09QVElPTlMsXG4gIHNjaGVtYTogREVGQVVMVF9EVU1QX1NDSEVNQSxcbiAgc2tpcEludmFsaWQ6IGZhbHNlLFxuICBub1JlZnM6IGZhbHNlLFxuICBmbG93TGV2ZWw6IC0xLFxuICB0cmFuc2Zvcm06ICgpID0+IHt9XG59XG5cbi8vIE9wdGlvbnMgdGhhdCBuZWVkIHRoZSBKUyB2YWx1ZSAodGFncywgZm9ybWF0LCBkZWR1cCkgZ28gdG8gYGpzVG9Bc3RgOyBwdXJlbHlcbi8vIHByZXNlbnRhdGlvbmFsIG9uZXMgZ28gdG8gYHByZXNlbnRgLlxuZnVuY3Rpb24gZHVtcCAoaW5wdXQ6IGFueSwgb3B0aW9uczogRHVtcE9wdGlvbnMgPSB7fSkge1xuICBjb25zdCBvcHRzID0geyAuLi5ERUZBVUxUX0RVTVBfT1BUSU9OUywgLi4ub3B0aW9ucyB9XG5cbiAgY29uc3QgZG9jdW1lbnRzID0ganNUb0FzdChpbnB1dCwgb3B0cy5zY2hlbWEsIHtcbiAgICBub1JlZnM6IG9wdHMubm9SZWZzLFxuICAgIHNraXBJbnZhbGlkOiBvcHRzLnNraXBJbnZhbGlkXG4gIH0pXG5cbiAgLy8gZmxvd0xldmVsOiBldmVyeSBub2RlIGF0IHRoaXMgZGVwdGggc3dpdGNoZXMgdG8gZmxvdzsgdGhlIHByZXNlbnRlciBmb3JjZXNcbiAgLy8gZXZlcnl0aGluZyBiZWxvdyBpbnRvIGZsb3cgdG9vLCBzbyB0aGUgd2FsayBzdG9wcyB0aGVyZS5cbiAgaWYgKG9wdHMuZmxvd0xldmVsID49IDApIHtcbiAgICB2aXNpdChkb2N1bWVudHMsIChub2RlLCBjdHgpID0+IHtcbiAgICAgIGlmIChjdHguZGVwdGggPCBvcHRzLmZsb3dMZXZlbCkgcmV0dXJuXG4gICAgICBub2RlLnN0eWxlLmZsb3cgPSB0cnVlXG4gICAgICByZXR1cm4gVklTSVRfU0tJUFxuICAgIH0pXG4gIH1cblxuICBvcHRzLnRyYW5zZm9ybShkb2N1bWVudHMpXG5cbiAgY29uc3QgUFJFU0VOVEVSX09QVF9LRVlTID0gT2JqZWN0LmtleXMoREVGQVVMVF9QUkVTRU5URVJfT1BUSU9OUykgYXNcbiAgICAoa2V5b2YgdHlwZW9mIERFRkFVTFRfUFJFU0VOVEVSX09QVElPTlMpW11cblxuICByZXR1cm4gcHJlc2VudChkb2N1bWVudHMsIHsgLi4ucGljayhvcHRzLCBQUkVTRU5URVJfT1BUX0tFWVMpLCBzY2hlbWE6IG9wdHMuc2NoZW1hIH0pXG59XG5cbmV4cG9ydCB7XG4gIGR1bXAsXG5cbiAgdHlwZSBEdW1wT3B0aW9uc1xufVxuIiwgIi8vIFBhcnNlciBldmVudHMg4oaSIEFTVC4gVGhlIHNlY29uZCBlbnRyeSBpbnRvIHRoZSBBU1Qgd29ybGQgKHRoZSBmaXJzdCBiZWluZ1xuLy8gYGpzVG9Bc3RgKTogaW5zdGVhZCBvZiBidWlsZGluZyBKUyB2YWx1ZXMgbGlrZSB0aGUgY29uc3RydWN0b3IsIGl0IG1pcnJvcnMgdGhlXG4vLyBzYW1lIGRvY3VtZW50L3NlcXVlbmNlL21hcHBpbmcgZnJhbWUgd2FsayBhbmQgZW1pdHMgYE5vZGVgcyB0aGF0IGtlZXAgdGhlXG4vLyBvcmlnaW5hbCBzdHlsZXMsIHRhZ3MgYW5kIGFuY2hvcnMsIHNvIHBhcnNlZCBZQU1MIGNhbiBiZSByZS1kdW1wZWQgZmFpdGhmdWxseS5cblxuaW1wb3J0IHtcbiAgRVZFTlRfQUxJQVMsXG4gIEVWRU5UX0RPQ1VNRU5ULFxuICBFVkVOVF9NQVBQSU5HLFxuICBFVkVOVF9QT1AsXG4gIEVWRU5UX1NDQUxBUixcbiAgRVZFTlRfU0VRVUVOQ0UsXG4gIFNDQUxBUl9TVFlMRV9QTEFJTixcbiAgU0NBTEFSX1NUWUxFX1NJTkdMRV9RVU9URUQsXG4gIFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVELFxuICBTQ0FMQVJfU1RZTEVfTElURVJBTF9CTE9DSyxcbiAgU0NBTEFSX1NUWUxFX0ZPTERFRF9CTE9DSyxcbiAgQ09MTEVDVElPTl9TVFlMRV9GTE9XLFxuICB0eXBlIEV2ZW50LFxuICB0eXBlIE1hcHBpbmdFdmVudCxcbiAgdHlwZSBTY2FsYXJFdmVudCxcbiAgdHlwZSBTZXF1ZW5jZUV2ZW50XG59IGZyb20gJy4uL3BhcnNlci9ldmVudHMudHMnXG5pbXBvcnQgeyBnZXRTY2FsYXJWYWx1ZSB9IGZyb20gJy4uL3BhcnNlci9wYXJzZXJfc2NhbGFyLnRzJ1xuaW1wb3J0IHsgdHlwZSBTY2hlbWEgfSBmcm9tICcuLi9zY2hlbWEudHMnXG5pbXBvcnQgeyBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi90YWcudHMnXG5pbXBvcnQge1xuICBTdHlsZSxcbiAgdHlwZSBOb2RlLFxuICB0eXBlIERvY3VtZW50LFxuICB0eXBlIFNjYWxhck5vZGUsXG4gIHR5cGUgU2VxdWVuY2VOb2RlLFxuICB0eXBlIE1hcHBpbmdOb2RlLFxuICB0eXBlIEFsaWFzTm9kZVxufSBmcm9tICcuL25vZGVzLnRzJ1xuXG5jb25zdCBOT19SQU5HRSA9IC0xXG5cbmludGVyZmFjZSBEb2N1bWVudEZyYW1lIHtcbiAga2luZDogJ2RvY3VtZW50J1xuICBkb2M6IERvY3VtZW50XG59XG5cbmludGVyZmFjZSBTZXF1ZW5jZUZyYW1lIHtcbiAga2luZDogJ3NlcXVlbmNlJ1xuICBub2RlOiBTZXF1ZW5jZU5vZGVcbn1cblxuaW50ZXJmYWNlIE1hcHBpbmdGcmFtZSB7XG4gIGtpbmQ6ICdtYXBwaW5nJ1xuICBub2RlOiBNYXBwaW5nTm9kZVxuICBrZXk6IE5vZGUgfCBudWxsXG59XG5cbnR5cGUgRnJhbWUgPSBEb2N1bWVudEZyYW1lIHwgU2VxdWVuY2VGcmFtZSB8IE1hcHBpbmdGcmFtZVxuXG5pbnRlcmZhY2UgRnJvbUV2ZW50c09wdGlvbnMge1xuICBzb3VyY2U6IHN0cmluZ1xuICBzY2hlbWE6IFNjaGVtYVxufVxuXG5pbnRlcmZhY2UgRnJvbUV2ZW50c1N0YXRlIHtcbiAgc291cmNlOiBzdHJpbmdcbiAgc2NoZW1hOiBTY2hlbWFcbiAgZXZlbnRJbmRleDogbnVtYmVyXG4gIHBvc2l0aW9uOiBudW1iZXJcbiAgZnJhbWVzOiBGcmFtZVtdXG4gIGRvY3VtZW50czogRG9jdW1lbnRbXVxufVxuXG5mdW5jdGlvbiBldmVudFBvc2l0aW9uIChldmVudDogRXZlbnQpIHtcbiAgaWYgKCd0YWdTdGFydCcgaW4gZXZlbnQgJiYgZXZlbnQudGFnU3RhcnQgIT09IE5PX1JBTkdFKSByZXR1cm4gZXZlbnQudGFnU3RhcnRcbiAgaWYgKCdhbmNob3JTdGFydCcgaW4gZXZlbnQgJiYgZXZlbnQuYW5jaG9yU3RhcnQgIT09IE5PX1JBTkdFKSByZXR1cm4gZXZlbnQuYW5jaG9yU3RhcnRcbiAgaWYgKCd2YWx1ZVN0YXJ0JyBpbiBldmVudCAmJiBldmVudC52YWx1ZVN0YXJ0ICE9PSBOT19SQU5HRSkgcmV0dXJuIGV2ZW50LnZhbHVlU3RhcnRcbiAgaWYgKCdzdGFydCcgaW4gZXZlbnQpIHJldHVybiBldmVudC5zdGFydFxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiByYXdUYWcgKHN0YXRlOiBGcm9tRXZlbnRzU3RhdGUsIGV2ZW50OiBTY2FsYXJFdmVudCB8IFNlcXVlbmNlRXZlbnQgfCBNYXBwaW5nRXZlbnQpIHtcbiAgcmV0dXJuIGV2ZW50LnRhZ1N0YXJ0ID09PSBOT19SQU5HRVxuICAgID8gJydcbiAgICA6IHN0YXRlLnNvdXJjZS5zbGljZShldmVudC50YWdTdGFydCwgZXZlbnQudGFnRW5kKVxufVxuXG5mdW5jdGlvbiBhbmNob3JOYW1lIChzdGF0ZTogRnJvbUV2ZW50c1N0YXRlLCBldmVudDogU2NhbGFyRXZlbnQgfCBTZXF1ZW5jZUV2ZW50IHwgTWFwcGluZ0V2ZW50KSB7XG4gIHJldHVybiBldmVudC5hbmNob3JTdGFydCA9PT0gTk9fUkFOR0VcbiAgICA/IHVuZGVmaW5lZFxuICAgIDogc3RhdGUuc291cmNlLnNsaWNlKGV2ZW50LmFuY2hvclN0YXJ0LCBldmVudC5hbmNob3JFbmQpXG59XG5cbi8vIFRhZyBuYW1lIGNhcnJpZWQgYnkgYW4gZW1wdHkvcGxhaW4gc2NhbGFyIHdpdGggbm8gZXhwbGljaXQgdGFnOiB0aGUgZmlyc3Rcbi8vIGltcGxpY2l0IHNjYWxhciByZXNvbHZlciB0aGF0IGFjY2VwdHMgdGhlIHRleHQsIGZhbGxpbmcgYmFjayB0byBzdHIuIE1pcnJvcnNcbi8vIHRoZSBpbXBsaWNpdCBicmFuY2ggb2YgYGNvbnN0cnVjdFNjYWxhcmAsIGJ1dCB3ZSBvbmx5IHdhbnQgdGhlIHRhZyBuYW1lLlxuZnVuY3Rpb24gaW1wbGljaXRTY2FsYXJUYWdOYW1lIChzdGF0ZTogRnJvbUV2ZW50c1N0YXRlLCBzb3VyY2U6IHN0cmluZykge1xuICBjb25zdCB7IHNjaGVtYSB9ID0gc3RhdGVcbiAgY29uc3QgY2FuZGlkYXRlcyA9IHNjaGVtYS5pbXBsaWNpdFNjYWxhckJ5Rmlyc3RDaGFyLmdldChzb3VyY2UuY2hhckF0KDApKSA/P1xuICAgIHNjaGVtYS5pbXBsaWNpdFNjYWxhckFueUZpcnN0Q2hhclxuICBmb3IgKGNvbnN0IHRhZyBvZiBjYW5kaWRhdGVzKSB7XG4gICAgaWYgKHRhZy5yZXNvbHZlKHNvdXJjZSwgZmFsc2UsIHRhZy50YWdOYW1lKSAhPT0gTk9UX1JFU09MVkVEKSByZXR1cm4gdGFnLnRhZ05hbWVcbiAgfVxuICByZXR1cm4gc2NoZW1hLmRlZmF1bHRTY2FsYXJUYWcudGFnTmFtZVxufVxuXG5mdW5jdGlvbiBidWlsZFNjYWxhciAoc3RhdGU6IEZyb21FdmVudHNTdGF0ZSwgZXZlbnQ6IFNjYWxhckV2ZW50KTogU2NhbGFyTm9kZSB7XG4gIGNvbnN0IHZhbHVlID0gZ2V0U2NhbGFyVmFsdWUoc3RhdGUuc291cmNlLCBldmVudClcbiAgY29uc3QgcmF3ID0gcmF3VGFnKHN0YXRlLCBldmVudClcbiAgY29uc3Qgc3R5bGUgPSBuZXcgU3R5bGUoKVxuXG4gIHN3aXRjaCAoZXZlbnQuc3R5bGUpIHtcbiAgICBjYXNlIFNDQUxBUl9TVFlMRV9TSU5HTEVfUVVPVEVEOiBzdHlsZS5zaW5nbGVRdW90ZWQgPSB0cnVlOyBicmVha1xuICAgIGNhc2UgU0NBTEFSX1NUWUxFX0RPVUJMRV9RVU9URUQ6IHN0eWxlLmRvdWJsZVF1b3RlZCA9IHRydWU7IGJyZWFrXG4gICAgY2FzZSBTQ0FMQVJfU1RZTEVfTElURVJBTF9CTE9DSzogc3R5bGUubGl0ZXJhbCA9IHRydWU7IGJyZWFrXG4gICAgY2FzZSBTQ0FMQVJfU1RZTEVfRk9MREVEX0JMT0NLOiBzdHlsZS5mb2xkZWQgPSB0cnVlOyBicmVha1xuICB9XG5cbiAgbGV0IHRhZzogc3RyaW5nXG4gIGlmIChyYXcgIT09ICcnKSB7XG4gICAgc3R5bGUudGFnZ2VkID0gdHJ1ZVxuICAgIHRhZyA9IHJhd1xuICB9IGVsc2UgaWYgKGV2ZW50LnN0eWxlID09PSBTQ0FMQVJfU1RZTEVfUExBSU4pIHtcbiAgICB0YWcgPSBpbXBsaWNpdFNjYWxhclRhZ05hbWUoc3RhdGUsIHZhbHVlKVxuICB9IGVsc2Uge1xuICAgIHRhZyA9IHN0YXRlLnNjaGVtYS5kZWZhdWx0U2NhbGFyVGFnLnRhZ05hbWVcbiAgfVxuXG4gIHJldHVybiB7IGtpbmQ6ICdzY2FsYXInLCB0YWcsIHN0eWxlLCBhbmNob3I6IGFuY2hvck5hbWUoc3RhdGUsIGV2ZW50KSwgdmFsdWUgfVxufVxuXG5mdW5jdGlvbiBidWlsZENvbGxlY3Rpb24gKFxuICBzdGF0ZTogRnJvbUV2ZW50c1N0YXRlLFxuICBldmVudDogU2VxdWVuY2VFdmVudCB8IE1hcHBpbmdFdmVudCxcbiAgZGVmYXVsdFRhZ05hbWU6IHN0cmluZ1xuKTogeyB0YWc6IHN0cmluZywgc3R5bGU6IFN0eWxlLCBhbmNob3I/OiBzdHJpbmcgfSB7XG4gIGNvbnN0IHJhdyA9IHJhd1RhZyhzdGF0ZSwgZXZlbnQpXG4gIGNvbnN0IHN0eWxlID0gbmV3IFN0eWxlKClcbiAgaWYgKGV2ZW50LnN0eWxlID09PSBDT0xMRUNUSU9OX1NUWUxFX0ZMT1cpIHN0eWxlLmZsb3cgPSB0cnVlXG5cbiAgbGV0IHRhZzogc3RyaW5nXG4gIGlmIChyYXcgPT09ICcnKSB7XG4gICAgdGFnID0gZGVmYXVsdFRhZ05hbWVcbiAgfSBlbHNlIHtcbiAgICB0YWcgPSByYXdcbiAgICBzdHlsZS50YWdnZWQgPSB0cnVlXG4gIH1cblxuICByZXR1cm4geyB0YWcsIHN0eWxlLCBhbmNob3I6IGFuY2hvck5hbWUoc3RhdGUsIGV2ZW50KSB9XG59XG5cbmZ1bmN0aW9uIGFkZE5vZGUgKHN0YXRlOiBGcm9tRXZlbnRzU3RhdGUsIG5vZGU6IE5vZGUpIHtcbiAgY29uc3QgZnJhbWUgPSBzdGF0ZS5mcmFtZXNbc3RhdGUuZnJhbWVzLmxlbmd0aCAtIDFdXG5cbiAgaWYgKGZyYW1lLmtpbmQgPT09ICdkb2N1bWVudCcpIHtcbiAgICBmcmFtZS5kb2MuY29udGVudHMgPSBub2RlXG4gIH0gZWxzZSBpZiAoZnJhbWUua2luZCA9PT0gJ3NlcXVlbmNlJykge1xuICAgIGZyYW1lLm5vZGUuaXRlbXMucHVzaChub2RlKVxuICB9IGVsc2UgaWYgKGZyYW1lLmtleSkge1xuICAgIGZyYW1lLm5vZGUuaXRlbXMucHVzaCh7IGtleTogZnJhbWUua2V5LCB2YWx1ZTogbm9kZSB9KVxuICAgIGZyYW1lLmtleSA9IG51bGxcbiAgfSBlbHNlIHtcbiAgICBmcmFtZS5rZXkgPSBub2RlXG4gIH1cbn1cblxuZnVuY3Rpb24gZXZlbnRzVG9Bc3QgKGV2ZW50czogRXZlbnRbXSwgb3B0aW9uczogRnJvbUV2ZW50c09wdGlvbnMpOiBEb2N1bWVudFtdIHtcbiAgY29uc3Qgc3RhdGU6IEZyb21FdmVudHNTdGF0ZSA9IHtcbiAgICBzb3VyY2U6IG9wdGlvbnMuc291cmNlLFxuICAgIHNjaGVtYTogb3B0aW9ucy5zY2hlbWEsXG4gICAgZXZlbnRJbmRleDogMCxcbiAgICBwb3NpdGlvbjogMCxcbiAgICBmcmFtZXM6IFtdLFxuICAgIGRvY3VtZW50czogW11cbiAgfVxuXG4gIHdoaWxlIChzdGF0ZS5ldmVudEluZGV4IDwgZXZlbnRzLmxlbmd0aCkge1xuICAgIGNvbnN0IGV2ZW50ID0gZXZlbnRzW3N0YXRlLmV2ZW50SW5kZXgrK11cbiAgICBzdGF0ZS5wb3NpdGlvbiA9IGV2ZW50UG9zaXRpb24oZXZlbnQpXG5cbiAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgIGNhc2UgRVZFTlRfRE9DVU1FTlQ6IHtcbiAgICAgICAgY29uc3QgZG9jOiBEb2N1bWVudCA9IHtcbiAgICAgICAgICBjb250ZW50czogbnVsbCxcbiAgICAgICAgICBleHBsaWNpdFN0YXJ0OiBldmVudC5leHBsaWNpdFN0YXJ0LFxuICAgICAgICAgIGV4cGxpY2l0RW5kOiBldmVudC5leHBsaWNpdEVuZCxcbiAgICAgICAgICBkaXJlY3RpdmVzOiBldmVudC5kaXJlY3RpdmVzXG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUuZnJhbWVzLnB1c2goeyBraW5kOiAnZG9jdW1lbnQnLCBkb2MgfSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgY2FzZSBFVkVOVF9TQ0FMQVI6XG4gICAgICAgIGFkZE5vZGUoc3RhdGUsIGJ1aWxkU2NhbGFyKHN0YXRlLCBldmVudCkpXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgRVZFTlRfU0VRVUVOQ0U6IHtcbiAgICAgICAgY29uc3QgeyB0YWcsIHN0eWxlLCBhbmNob3IgfSA9IGJ1aWxkQ29sbGVjdGlvbihzdGF0ZSwgZXZlbnQsICd0YWc6eWFtbC5vcmcsMjAwMjpzZXEnKVxuICAgICAgICBjb25zdCBub2RlOiBTZXF1ZW5jZU5vZGUgPSB7IGtpbmQ6ICdzZXF1ZW5jZScsIHRhZywgc3R5bGUsIGFuY2hvciwgaXRlbXM6IFtdIH1cbiAgICAgICAgc3RhdGUuZnJhbWVzLnB1c2goeyBraW5kOiAnc2VxdWVuY2UnLCBub2RlIH0pXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGNhc2UgRVZFTlRfTUFQUElORzoge1xuICAgICAgICBjb25zdCB7IHRhZywgc3R5bGUsIGFuY2hvciB9ID0gYnVpbGRDb2xsZWN0aW9uKHN0YXRlLCBldmVudCwgJ3RhZzp5YW1sLm9yZywyMDAyOm1hcCcpXG4gICAgICAgIGNvbnN0IG5vZGU6IE1hcHBpbmdOb2RlID0geyBraW5kOiAnbWFwcGluZycsIHRhZywgc3R5bGUsIGFuY2hvciwgaXRlbXM6IFtdIH1cbiAgICAgICAgc3RhdGUuZnJhbWVzLnB1c2goeyBraW5kOiAnbWFwcGluZycsIG5vZGUsIGtleTogbnVsbCB9KVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjYXNlIEVWRU5UX0FMSUFTOiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBzdGF0ZS5zb3VyY2Uuc2xpY2UoZXZlbnQuYW5jaG9yU3RhcnQsIGV2ZW50LmFuY2hvckVuZClcbiAgICAgICAgY29uc3Qgbm9kZTogQWxpYXNOb2RlID0geyBraW5kOiAnYWxpYXMnLCB0YWc6ICcnLCBzdHlsZTogbmV3IFN0eWxlKCksIGFuY2hvcjogbmFtZSB9XG4gICAgICAgIGFkZE5vZGUoc3RhdGUsIG5vZGUpXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGNhc2UgRVZFTlRfUE9QOiB7XG4gICAgICAgIGNvbnN0IGZyYW1lID0gc3RhdGUuZnJhbWVzLnBvcCgpIVxuICAgICAgICBpZiAoZnJhbWUua2luZCA9PT0gJ2RvY3VtZW50Jykge1xuICAgICAgICAgIHN0YXRlLmRvY3VtZW50cy5wdXNoKGZyYW1lLmRvYylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhZGROb2RlKHN0YXRlLCBmcmFtZS5ub2RlKVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0YXRlLmRvY3VtZW50c1xufVxuXG5leHBvcnQge1xuICBldmVudHNUb0FzdCxcbiAgdHlwZSBGcm9tRXZlbnRzT3B0aW9uc1xufVxuIiwgIi8qKlxuICogWUFNTCBmcm9udG1hdHRlciBcdTg5RTNcdTY3OTAvXHU1RThGXHU1MjE3XHU1MzE2XHUzMDAyXHU0RjlEXHU2MzZFIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYFx1MzAwMlxuICpcbiAqIC0gXHU3NTI4IGpzLXlhbWwgXHU1OTA0XHU3NDA2XHU0RTJEXHU2NTg3XHU1QjU3XHU2QkI1XHU1NDBEXHVGRjA4anMteWFtbCBcdTUzOUZcdTc1MUZcdTY1MkZcdTYzMDEgVW5pY29kZSBrZXlcdUZGMDlcbiAqIC0gXHU4OUUzXHU2NzkwXHU2NUY2XHU0RkREXHU3NTU5XHU2Q0U4XHU5MUNBXHU5ODdBXHU1RThGXHVGRjA4anMteWFtbCBcdTRFMERcdTRGRERcdTc1NTlcdUZGMENcdTRGNDZcdTYyMTFcdTRFRUNcdTc1MjhcdTU2RkFcdTVCOUFcdTVCNTdcdTZCQjVcdTY2MjBcdTVDMDRcdTkxQ0RcdTVFRkFcdUZGMDlcbiAqIC0gXHU1RThGXHU1MjE3XHU1MzE2XHU2NUY2XHU2MzA5XHU4OUM0XHU4MzAzXHU5ODdBXHU1RThGXHU4RjkzXHU1MUZBXHVGRjA4XHU1NDBDXHU2QjY1XHU3RUQxXHU1QjlBXHUyMTkyXHU2ODA3XHU3QjdFXHUyMTkyXHU3RjE2XHU3ODAxXHUyMTkyXHU4RjkzXHU1MTY1XHUyMTkyXHU2NUU1XHU2NzFGXHUyMTkyXHU1MTczXHU5NTJFXHU4QkNEXHUyMTkyXHU4QkM0XHU1MjA2XHUyMTkyXHU3RDIyXHU1RjE1XHVGRjA5XG4gKi9cbmltcG9ydCAqIGFzIFlBTUwgZnJvbSAnanMteWFtbCc7XG5cbi8qKiBmcm9udG1hdHRlciBcdTUyMDZcdTk2OTRcdTdCMjZcdTMwMDIgKi9cbmNvbnN0IEZNX0RFTElNSVRFUiA9ICctLS0nO1xuXG4vKiogZnJvbnRtYXR0ZXIgXHU4RjkzXHU1MUZBXHU2NUY2XHU3Njg0XHU1QjU3XHU2QkI1XHU5ODdBXHU1RThGXHUzMDAyXHU0RjlEXHU2MzZFIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTRFMDBcdTZBMjFcdTY3N0ZcdTMwMDIgKi9cbmNvbnN0IEZJRUxEX09SREVSOiAoa2V5b2YgaW1wb3J0KCcuL3R5cGVzJykuWUFNTEZyb250bWF0dGVyKVtdID0gW1xuICAnZmVpc2h1X2lkJyxcbiAgJ2ZlaXNodV9kb2NfaWQnLFxuICAnZmVpc2h1X3RpdGxlJyxcbiAgJ3N5bmNfaGFzaCcsXG4gICdzeW5jX3RpbWUnLFxuICAnXHU2ODA3XHU3QjdFJyxcbiAgJ1x1N0YxNlx1NzgwMScsXG4gICdcdThGOTNcdTUxNjUnLFxuICAnXHU2NUU1XHU2NzFGJyxcbiAgJ1x1NjVFNVx1NjcxRlx1N0QyMlx1NUYxNScsXG4gICdcdTUxNzNcdTk1MkVcdThCQ0QnLFxuICAnXHU2OTgyXHU4RkYwJyxcbiAgJ1x1OEJDNFx1NTIwNicsXG4gICdcdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBJyxcbiAgJ1x1N0QyMlx1NUYxNV9cdTc3RTVcdThCQzZcdTVFOTMnLFxuICAnXHU3RDIyXHU1RjE1X1x1OTg5Q1x1ODI3MicsXG4gICdcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OCcsXG4gICdcdTdEMjJcdTVGMTVfXHU1NzU3JyxcbiAgJ1x1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2NjknLFxuXTtcblxuLyoqIFx1N0E3QVx1NTAzQ1x1OERGM1x1OEZDN1x1OTZDNlx1NTQwOFx1RkYxQVx1NEVDNVx1OERGM1x1OEZDN1x1NjcyQVx1OEJCRVx1N0Y2RVx1RkYxQlx1N0E3QVx1NUI1N1x1N0IyNlx1NEUzMi9cdTdBN0FcdTY1NzBcdTdFQzRcdTc1MjhcdTRFOEVcdTg5QzRcdTgzMDNcdTVCNTdcdTZCQjVcdTUzNjBcdTRGNERcdTMwMDIgKi9cbmZ1bmN0aW9uIGlzRW1wdHkodjogdW5rbm93bik6IGJvb2xlYW4ge1xuICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IG51bGwpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogXHU1QzA2IGZyb250bWF0dGVyIFx1NUJGOVx1OEM2MVx1NUU4Rlx1NTIxN1x1NTMxNlx1NEUzQSBZQU1MIFx1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOFx1NTQyQiBgLS0tYCBcdTUyMDZcdTk2OTRcdTdCMjZcdUZGMDlcdTMwMDJcbiAqIFx1NjMwOVx1ODlDNFx1ODMwM1x1OTg3QVx1NUU4Rlx1OEY5M1x1NTFGQVx1RkYwQ1x1OERGM1x1OEZDN1x1N0E3QVx1NTAzQ1x1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplRnJvbnRtYXR0ZXIoZm06IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogc3RyaW5nIHtcbiAgY29uc3Qgb3JkZXJlZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcbiAgZm9yIChjb25zdCBrZXkgb2YgRklFTERfT1JERVIpIHtcbiAgICBpZiAoIWlzRW1wdHkoZm1ba2V5XSkpIHtcbiAgICAgIG9yZGVyZWRba2V5IGFzIHN0cmluZ10gPSBmbVtrZXldO1xuICAgIH1cbiAgfVxuICAvLyBcdTY1MzZcdTVDM0VcdUZGMUFcdTUzRUZcdTgwRkRcdTY3MDlcdTU5MUFcdTRGNTlcdTVCNTdcdTZCQjVcdTRFMERcdTU3MjggRklFTERfT1JERVIgXHU5MUNDXHVGRjA4XHU1NDExXHU1NDBFXHU1MTdDXHU1QkI5XHVGRjA5XG4gIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKGZtKSkge1xuICAgIGlmICghKGsgaW4gb3JkZXJlZCkgJiYgIWlzRW1wdHkodikpIHtcbiAgICAgIG9yZGVyZWRba10gPSB2O1xuICAgIH1cbiAgfVxuICBjb25zdCB5YW1sU3RyID0gWUFNTC5kdW1wKG9yZGVyZWQsIHtcbiAgICBsaW5lV2lkdGg6IC0xLCAgICAgICAgICAgLy8gXHU0RTBEXHU2Mjk4XHU4ODRDXHVGRjA4XHU4ODY4XHU2ODNDXHU3QjQ5XHU5NTdGXHU4ODRDXHU0RTBEXHU3ODM0XHU1NzRGXHVGRjA5XG4gICAgcXVvdGVTdHlsZTogJ2RvdWJsZScsICAgIC8vIFx1NUI1N1x1N0IyNlx1NEUzMlx1NzUyOFx1NTNDQ1x1NUYxNVx1NTNGN1x1RkYwOFx1NEZERFx1NzU1OSBlbW9qaVx1RkYwOVxuICAgIGZvcmNlUXVvdGVzOiBmYWxzZSxcbiAgICBzb3J0S2V5czogZmFsc2UsICAgICAgICAgLy8gXHU2MjExXHU0RUVDXHU4MUVBXHU1REYxXHU2M0E3XHU1MjM2XHU5ODdBXHU1RThGXG4gIH0pIGFzIHN0cmluZztcbiAgcmV0dXJuIGAke0ZNX0RFTElNSVRFUn1cXG4ke3lhbWxTdHJ9JHtGTV9ERUxJTUlURVJ9YDtcbn1cblxuLyoqXG4gKiBcdTRFQ0UgbWQgXHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XHU4OUUzXHU2NzkwIGZyb250bWF0dGVyXHUzMDAyXG4gKiBAcGFyYW0gY29udGVudCBcdTVCOENcdTY1NzRcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcbiAqIEByZXR1cm5zIHsgZnJvbnRtYXR0ZXIsIGJvZHkgfVx1RkYwQ2Zyb250bWF0dGVyIFx1NEUzQSBudWxsIFx1ODg2OFx1NzkzQVx1NjVFMCBmcm9udG1hdHRlclxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGcm9udG1hdHRlcihjb250ZW50OiBzdHJpbmcpOiB7XG4gIGZyb250bWF0dGVyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gIGJvZHk6IHN0cmluZztcbn0ge1xuICBjb25zdCBvZmZzZXQgPSBjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4ZmVmZiA/IDEgOiAwO1xuICBpZiAoIWNvbnRlbnQuc3RhcnRzV2l0aChGTV9ERUxJTUlURVIsIG9mZnNldCkpIHtcbiAgICByZXR1cm4geyBmcm9udG1hdHRlcjogbnVsbCwgYm9keTogY29udGVudCB9O1xuICB9XG5cbiAgY29uc3QgcmVzdCA9IGNvbnRlbnQuc2xpY2Uob2Zmc2V0ICsgRk1fREVMSU1JVEVSLmxlbmd0aCk7XG4gIGNvbnN0IG1hdGNoID0gcmVzdC5tYXRjaCgvXlxccj9cXG4oW1xcc1xcU10qPylcXHI/XFxuLS0tWyBcXHRdKig/Olxccj9cXG58JCkvKTtcbiAgaWYgKCFtYXRjaCkge1xuICAgIHJldHVybiB7IGZyb250bWF0dGVyOiBudWxsLCBib2R5OiBjb250ZW50IH07XG4gIH1cblxuICBjb25zdCB5YW1sQmxvY2sgPSBtYXRjaFsxXTtcbiAgY29uc3QgYm9keVN0YXJ0ID0gb2Zmc2V0ICsgRk1fREVMSU1JVEVSLmxlbmd0aCArIG1hdGNoWzBdLmxlbmd0aDtcbiAgY29uc3QgYm9keSA9IGNvbnRlbnQuc2xpY2UoYm9keVN0YXJ0KS5yZXBsYWNlKC9eKD86XFxyP1xcbikrLywgJycpO1xuICB0cnkge1xuICAgIGNvbnN0IGZtID0gWUFNTC5sb2FkKHlhbWxCbG9jaykgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgcmV0dXJuIHsgZnJvbnRtYXR0ZXI6IGZtID8/IHt9LCBib2R5IH07XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBZQU1MIFx1ODlFM1x1Njc5MFx1NTkzMVx1OEQyNVx1RkYxQVx1ODlDNlx1NEUzQVx1NjVFMCBmcm9udG1hdHRlclxuICAgIGNvbnNvbGUud2FybignW3N5bmMvc2hhcmVkXSBmcm9udG1hdHRlciBwYXJzZSBmYWlsZWQ6JywgZSk7XG4gICAgcmV0dXJuIHsgZnJvbnRtYXR0ZXI6IG51bGwsIGJvZHk6IGNvbnRlbnQgfTtcbiAgfVxufVxuXG4vKipcbiAqIFx1NUMwNiBmcm9udG1hdHRlciArIGJvZHkgXHU2MkZDXHU2MjEwXHU1QjhDXHU2NTc0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlbWJsZUZpbGUoXG4gIGZtOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbiAgYm9keTogc3RyaW5nLFxuKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3NlcmlhbGl6ZUZyb250bWF0dGVyKGZtKX1cXG5cXG4ke2JvZHl9YDtcbn1cbiIsICIvKipcbiAqIFlBTUwgXHUyMTk0IFx1OThERVx1NEU2NiBjYWxsb3V0IFx1NTNDQ1x1NTQxMVx1OEY2Q1x1NjM2Mlx1MzAwMlxuICpcbiAqIFx1NEY5RFx1NjM2RVx1RkYxQVxuICogLSBgMDNfXHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzXHU0RTBFT0JcdTY2MjBcdTVDMDQubWRgIFx1MDBBN1x1NEUwOVx1RkYwOGNhbGxvdXQgXHU5ODlDXHU4MjcyXHU2NjIwXHU1QzA0XHVGRjA5XG4gKiAtIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTRFOTRcdUZGMDhZQU1MXHUyMTkyY2FsbG91dCBcdTY2MjBcdTVDMDRcdTg4NjhcdUZGMDlcbiAqIC0gXHUwMEE3XHU1NkRCXHVGRjA4XHU1NDA4XHU1RTc2XHU0RkUxXHU2MDZGXHU1NzU3XHU4QkJFXHU4QkExXHVGRjFBXHU2MjQwXHU2NzA5XHU1QjU3XHU2QkI1XHU4RkRCXHU0RTAwXHU0RTJBIGNhbGxvdXRcdUZGMDlcbiAqXG4gKiBcdTVERjJcdTc3RTVcdTU3NTFcdUZGMDgwMyBcdTY1ODdcdTY4NjMgXHUwMEE3XHU1MzQxICsgXHUwMEE3My4zXHVGRjA5XHVGRjFBXG4gKiAtIGVtb2ppIFx1NUUyNiBVK0ZFMEYgdmFyaWF0aW9uIHNlbGVjdG9yIFx1OThERVx1NEU2Nlx1NEUwRFx1OEJBNCBcdTIxOTIgXHU1MTk5XHU1MTY1XHU1MjREIHN0cmlwXG4gKiAtIGB+YCBcdTg4QUJcdTk4REVcdTRFNjZcdThGNkNcdTRFNDlcdTYyMTAgYFxcfmAgXHUyMTkyIFx1NTZERVx1OEJGQlx1NjVGNlx1NTNDRFx1OEY2Q1x1NEU0OVxuICovXG5cbmltcG9ydCB0eXBlIHsgS25vd2xlZGdlTWV0YSwgVGFnIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQge1xuICBDQUxMT1VUX0ZJRUxEX01BUCxcbiAgVEFHX05BTUVTLFxuICBET0NfSU5GT19DQUxMT1VULFxuICBPQl9DQUxMT1VUX1RPX0ZFSVNIVSxcbiAgRkVJU0hVX0JHX1RPX09CX0NBTExPVVQsXG59IGZyb20gJy4vdHlwZXMuanMnO1xuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgZW1vamkgXHU2RTA1XHU2RDE3IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKiogXHU3OUZCXHU5NjY0IGVtb2ppIFx1NzY4NCBVK0ZFMEYgdmFyaWF0aW9uIHNlbGVjdG9yXHUzMDAyXHU5OERFXHU0RTY2XHU0RTBEXHU4QkE0XHU1RTI2IFZTIFx1NzY4NCBlbW9qaVx1RkYwODAzIFx1NjU4N1x1Njg2MyBcdTAwQTczLjNcdUZGMDlcdTMwMDIgKi9cbmNvbnN0IFZTX1JFID0gL1xcdUZFMEYvZ3U7XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhzOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcy5yZXBsYWNlKFZTX1JFLCAnJyk7XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTZDRTJcdTZENkFcdTUzRjdcdThGNkNcdTRFNDkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKiBcdTk4REVcdTRFNjYgbWQgXHU2MjhBIGB+YCBcdThGNkNcdTRFNDlcdTYyMTAgYFxcfmBcdUZGMENcdTU2REVcdThCRkJcdTY1RjZcdTUzQ0RcdTU0MTFcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiB1bmVzY2FwZUZlaXNodVRpbGRlKHM6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzLnJlcGxhY2UoL1xcXFx+L2csICd+Jyk7XG59XG5cbi8qKiBcdTUxOTlcdTUxNjVcdTk4REVcdTRFNjZcdTUyNERcdTUzQ0RcdThGNkNcdTRFNDlcdUZGMDhcdTU5ODJcdTY3OUNcdTc1MjhcdTYyMzdcdTYwRjNcdTc1MjggYH5gIFx1NTIyMFx1OTY2NFx1N0VCRlx1RkYwOVx1MzAwMlx1OThERVx1NEU2NiBtZCBcdTkxQ0MgYH5+fnRleHR+fn5gIFx1NjYyRlx1NTIyMFx1OTY2NFx1N0VCRlx1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVzY2FwZUZlaXNodVRpbGRlKHM6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIFx1NEUwRFx1NEUzQlx1NTJBOFx1OEY2Q1x1NEU0OVx1RkYwQ1x1NEZERFx1NjMwMVx1NTM5Rlx1NjgzN1x1MzAwMlx1NEVDNVx1NTcyOCBvdmVyd3JpdGUgXHU1NzNBXHU2NjZGXHU3ODZFXHU4QkE0XHU5NzAwXHU4OTgxXHU2NUY2XHU2MjRCXHU1MkE4XHU1OTA0XHU3NDA2XHUzMDAyXG4gIHJldHVybiBzO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU2ODA3XHU3QjdFXHU1MDNDXHU2ODNDXHU1RjBGXHU1MzE2IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG5mdW5jdGlvbiBmb3JtYXRUYWdWYWx1ZSh0YWc6IFRhZyB8IHVuZGVmaW5lZCk6IHN0cmluZyB7XG4gIGlmICghdGFnKSByZXR1cm4gJyc7XG4gIHJldHVybiBgJHtUQUdfTkFNRVNbdGFnXX0gJHt0YWd9YDtcbn1cblxuZnVuY3Rpb24gcGFyc2VUYWdWYWx1ZSh2YWx1ZTogc3RyaW5nKTogVGFnIHwgbnVsbCB7XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyh2YWx1ZSkudHJpbSgpO1xuICBjb25zdCBkaXJlY3QgPSBub3JtYWxpemVkLm1hdGNoKC8oPzpefFxccykoW1NYTFpRSl0pKD86XFxzfCQpLyk7XG4gIGNvbnN0IGNvbXBhY3QgPSBub3JtYWxpemVkLm1hdGNoKC9bU1hMWlFKXS8pO1xuICBjb25zdCB0YWcgPSAoZGlyZWN0Py5bMV0gPz8gY29tcGFjdD8uWzBdKSBhcyBUYWcgfCB1bmRlZmluZWQ7XG4gIHJldHVybiB0YWcgJiYgWydTJywgJ1gnLCAnTCcsICdaJywgJ1EnLCAnSiddLmluY2x1ZGVzKHRhZykgPyB0YWcgOiBudWxsO1xufVxuXG5mdW5jdGlvbiBtYXBGZWlzaHVCZ1RvT2JUeXBlKGJnQ29sb3I6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICghYmdDb2xvcikgcmV0dXJuICd0aXAnO1xuICBpZiAoRkVJU0hVX0JHX1RPX09CX0NBTExPVVRbYmdDb2xvcl0pIHJldHVybiBGRUlTSFVfQkdfVE9fT0JfQ0FMTE9VVFtiZ0NvbG9yXTtcbiAgY29uc3Qgbm9ybWFsaXplZCA9IGJnQ29sb3IucmVwbGFjZSgvXFxzKy9nLCAnJykudG9Mb3dlckNhc2UoKTtcbiAgY29uc3QgcmdiTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICdyZ2IoMjU1LDI0NSwyMzUpJzogJ3RpcCcsXG4gICAgJ3JnYigyNTQsMjEyLDE2NCknOiAndGlwJyxcbiAgICAncmdiYSgyNTUsMjQ2LDEyMiwwLjgpJzogJ3RpcCcsXG4gICAgJ3JnYigyNTUsMjQwLDI0MCknOiAnd2FybmluZycsXG4gICAgJ3JnYigyNDIsMjQzLDI0NSknOiAncXVvdGUnLFxuICAgICdyZ2IoMjQwLDI0NCwyNTUpJzogJ2luZm8nLFxuICAgICdyZ2IoMjQwLDI1MywyNDQpJzogJ3N1Y2Nlc3MnLFxuICB9O1xuICByZXR1cm4gcmdiTWFwW25vcm1hbGl6ZWRdID8/ICdhYnN0cmFjdCc7XG59XG5cbmZ1bmN0aW9uIGh0bWxCbG9ja1RvVGV4dExpbmVzKGh0bWw6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IGJsb2NrUmUgPSAvPCg/OnB8bGkpXFxiW14+XSo+KFtcXHNcXFNdKj8pPFxcLyg/OnB8bGkpPi9nO1xuICBsZXQgbTogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcbiAgd2hpbGUgKChtID0gYmxvY2tSZS5leGVjKGh0bWwpKSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IHRleHQgPSBodG1sVG9QbGFpblRleHQobVsxXSk7XG4gICAgaWYgKHRleHQpIGxpbmVzLnB1c2goLi4udGV4dC5zcGxpdCgnXFxuJykubWFwKGxpbmUgPT4gbGluZS50cmltKCkpLmZpbHRlcihCb29sZWFuKSk7XG4gIH1cbiAgaWYgKGxpbmVzLmxlbmd0aCA+IDApIHJldHVybiBsaW5lcztcbiAgY29uc3QgZmFsbGJhY2sgPSBodG1sVG9QbGFpblRleHQoaHRtbCk7XG4gIHJldHVybiBmYWxsYmFjayA/IGZhbGxiYWNrLnNwbGl0KCdcXG4nKS5tYXAobGluZSA9PiBsaW5lLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pIDogW107XG59XG5cbmZ1bmN0aW9uIGh0bWxUb1BsYWluVGV4dChodG1sOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gaHRtbFxuICAgIC5yZXBsYWNlKC88YnJcXHMqXFwvPz4vZywgJ1xcbicpXG4gICAgLnJlcGxhY2UoLzxbXj5dKz4vZywgJycpXG4gICAgLnJlcGxhY2UoLyZsdDsvZywgJzwnKVxuICAgIC5yZXBsYWNlKC8mZ3Q7L2csICc+JylcbiAgICAucmVwbGFjZSgvJmFtcDsvZywgJyYnKVxuICAgIC5yZXBsYWNlKC8mcXVvdDsvZywgJ1wiJylcbiAgICAucmVwbGFjZSgvJmFwb3M7L2csIFwiJ1wiKVxuICAgIC50cmltKCk7XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBPQlx1MjE5Mlx1OThERVx1NEU2Nlx1RkYxQVlBTUxcdTIxOTJcdTU0MDhcdTVFNzZcdTRGRTFcdTYwNkYgY2FsbG91dCBYTUwgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKlxuICogXHU1QzA2IE9CIFx1NzY4NCBZQU1MIFx1NTE0M1x1NjU3MFx1NjM2RVx1NUI1N1x1NkJCNVx1NkUzMlx1NjdEM1x1NEUzQVx1OThERVx1NEU2Nlx1NTQwOFx1NUU3Nlx1NEZFMVx1NjA2RiBjYWxsb3V0IFhNTFx1MzAwMlxuICogXHU0RjlEXHU2MzZFIGAwM19cdTY4M0NcdTVGMEZcdTg5QzRcdTgzMDMubWRgIFx1MDBBN1x1NTZEQlx1RkYwOFx1NTQwOFx1NUU3Nlx1OEZEQlx1NEUwMFx1NEUyQSBjYWxsb3V0IFx1OUFEOFx1NEVBRVx1NTc1N1x1RkYwOVx1MzAwMlxuICpcbiAqIEBwYXJhbSBtZXRhIFx1NzdFNVx1OEJDNlx1NUU5M1x1NTE0M1x1NjU3MFx1NjM2RVxuICogQHJldHVybnMgY2FsbG91dCBYTUwgXHU1QjU3XHU3QjI2XHU0RTMyXHVGRjA4XHU1NDJCIHN0cmlwIFZTXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXRhVG9DYWxsb3V0WG1sKG1ldGE6IEtub3dsZWRnZU1ldGEpOiBzdHJpbmcge1xuICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXTtcblxuICBmb3IgKGNvbnN0IGl0ZW0gb2YgQ0FMTE9VVF9GSUVMRF9NQVApIHtcbiAgICBjb25zdCByYXcgPSBtZXRhW2l0ZW0uZmllbGRdO1xuICAgIGlmIChyYXcgPT09IHVuZGVmaW5lZCB8fCByYXcgPT09IG51bGwgfHwgcmF3ID09PSAnJyB8fCAoQXJyYXkuaXNBcnJheShyYXcpICYmIHJhdy5sZW5ndGggPT09IDApKSBjb250aW51ZTtcblxuICAgIGxldCB2YWx1ZTogc3RyaW5nO1xuICAgIGlmIChpdGVtLmZpZWxkID09PSAnXHU2ODA3XHU3QjdFJykge1xuICAgICAgdmFsdWUgPSBmb3JtYXRUYWdWYWx1ZShyYXcgYXMgVGFnIHwgdW5kZWZpbmVkKTtcbiAgICB9IGVsc2UgaWYgKGl0ZW0uZmllbGQgPT09ICdcdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBJykge1xuICAgICAgdmFsdWUgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhTdHJpbmcocmF3KSk7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJhdykpIHtcbiAgICAgIHZhbHVlID0gKHJhdyBhcyBzdHJpbmdbXSkuam9pbignIFx1MDBCNyAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhTdHJpbmcocmF3KSk7XG4gICAgfVxuICAgIGlmICghdmFsdWUpIGNvbnRpbnVlO1xuXG4gICAgbGluZXMucHVzaChgPGxpPjxiPiR7aXRlbS5sYWJlbH08L2I+XHVGRjFBJHt2YWx1ZX08L2xpPmApO1xuICB9XG5cbiAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcnO1xuXG4gIGNvbnN0IHsgZW1vamksIC4uLmF0dHJzIH0gPSBET0NfSU5GT19DQUxMT1VUO1xuICBjb25zdCBhdHRyU3RyID0gT2JqZWN0LmVudHJpZXMoYXR0cnMpXG4gICAgLm1hcCgoW2ssIHZdKSA9PiBgJHtrfT1cIiR7dn1cImApXG4gICAgLmpvaW4oJyAnKTtcbiAgY29uc3QgY2xlYW5FbW9qaSA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKGVtb2ppKTtcblxuICByZXR1cm4gW1xuICAgIGA8Y2FsbG91dCBlbW9qaT1cIiR7Y2xlYW5FbW9qaX1cIiAke2F0dHJTdHJ9PmAsXG4gICAgYDxwPjxiPlx1NjU4N1x1Njg2M1x1NEZFMVx1NjA2RjwvYj48L3A+YCxcbiAgICBgPHVsPmAsXG4gICAgLi4ubGluZXMsXG4gICAgYDwvdWw+YCxcbiAgICBgPC9jYWxsb3V0PmAsXG4gICAgJycsXG4gIF0uam9pbignXFxuJyk7XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTk4REVcdTRFNjZcdTIxOTJPQlx1RkYxQVx1ODlFM1x1Njc5MFx1NTQwOFx1NUU3Nlx1NEZFMVx1NjA2RiBjYWxsb3V0IFx1MjE5MiBZQU1MIFx1NUI1N1x1NkJCNSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBcdTRFQ0VcdTk4REVcdTRFNjYgWE1MIFx1NzY4NFx1NTkzNFx1OTBFOFx1NEZFMVx1NjA2RiBjYWxsb3V0IFx1NEUyRFx1ODlFM1x1Njc5MFx1NTFGQSBZQU1MIFx1NUI1N1x1NkJCNVx1NTAzQ1x1MzAwMlxuICogXHU0RjlEXHU2MzZFIGAwM19cdTY4M0NcdTVGMEZcdTg5QzRcdTgzMDMubWRgIFx1MDBBN1x1NTZEQlx1RkYxQWA8bGk+PGI+XHU1QjU3XHU2QkI1XHU1NDBEPC9iPlx1RkYxQVx1NTAzQzwvbGk+YCBcdTY4M0NcdTVGMEZcdTMwMDJcbiAqXG4gKiBAcGFyYW0geG1sIFx1OThERVx1NEU2Nlx1NjU4N1x1Njg2MyBYTUwgXHU3MjQ3XHU2QkI1XG4gKiBAcmV0dXJucyBcdTg5RTNcdTY3OTBcdTUyMzBcdTc2ODRcdTUxNDNcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGxvdXRYbWxUb01ldGEoeG1sOiBzdHJpbmcpOiBQYXJ0aWFsPEtub3dsZWRnZU1ldGE+IHtcbiAgY29uc3QgcmVzdWx0OiBQYXJ0aWFsPEtub3dsZWRnZU1ldGE+ID0ge307XG5cbiAgLy8gXHU2MjdFXCJcdTY1ODdcdTY4NjNcdTRGRTFcdTYwNkZcImNhbGxvdXRcbiAgY29uc3QgY2FsbG91dFJlID0gLzxjYWxsb3V0XFxiW14+XSo+XFxzKjxwPjxiPlx1NjU4N1x1Njg2M1x1NEZFMVx1NjA2RjxcXC9iPjxcXC9wPlxccyo8dWw+KFtcXHNcXFNdKj8pPFxcL3VsPlxccyo8XFwvY2FsbG91dD4vO1xuICBjb25zdCBjYWxsb3V0TWF0Y2ggPSB4bWwubWF0Y2goY2FsbG91dFJlKTtcbiAgaWYgKCFjYWxsb3V0TWF0Y2gpIHJldHVybiByZXN1bHQ7XG5cbiAgY29uc3QgdWxDb250ZW50ID0gY2FsbG91dE1hdGNoWzFdO1xuICBjb25zdCBsaVJlID0gLzxsaT48Yj4oW148XSspPFxcL2I+W1x1RkYxQTpdKC4rPyk8XFwvbGk+L2c7XG4gIGxldCBtOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuXG4gIHdoaWxlICgobSA9IGxpUmUuZXhlYyh1bENvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGxhYmVsID0gbVsxXS50cmltKCk7XG4gICAgY29uc3QgdmFsdWUgPSB1bmVzY2FwZUZlaXNodVRpbGRlKG1bMl0udHJpbSgpKTtcblxuICAgIC8vIFx1NjgzOVx1NjM2RVx1NjgwN1x1N0I3RVx1NTQwRFx1NjYyMFx1NUMwNFx1NTIzMFx1NUI1N1x1NkJCNVxuICAgIGlmIChsYWJlbCA9PT0gJ1x1NjgwN1x1N0I3RScpIHtcbiAgICAgIGNvbnN0IHRhZyA9IHBhcnNlVGFnVmFsdWUodmFsdWUpO1xuICAgICAgaWYgKHRhZykgcmVzdWx0Llx1NjgwN1x1N0I3RSA9IHRhZztcbiAgICB9IGVsc2UgaWYgKGxhYmVsID09PSAnXHU3RjE2XHU3ODAxJykge1xuICAgICAgcmVzdWx0Llx1N0YxNlx1NzgwMSA9IHZhbHVlLnJlcGxhY2UoL15cdUQ4M0RcdUREMjJcXHMqLywgJycpLnRyaW0oKTtcbiAgICB9IGVsc2UgaWYgKGxhYmVsID09PSAnXHU4RjkzXHU1MTY1Jykge1xuICAgICAgcmVzdWx0Llx1OEY5M1x1NTE2NSA9IHZhbHVlLnJlcGxhY2UoL15cdUQ4M0RcdURDRTVcXHMqLywgJycpLnRyaW0oKTtcbiAgICB9IGVsc2UgaWYgKGxhYmVsID09PSAnXHU2NUU1XHU2NzFGJykge1xuICAgICAgcmVzdWx0Llx1NjVFNVx1NjcxRiA9IHZhbHVlLnJlcGxhY2UoL15cdUQ4M0RcdURDQzVcXHMqLywgJycpLnRyaW0oKTtcbiAgICB9IGVsc2UgaWYgKGxhYmVsID09PSAnXHU1MTczXHU5NTJFXHU4QkNEJykge1xuICAgICAgcmVzdWx0Llx1NTE3M1x1OTUyRVx1OEJDRCA9IHZhbHVlLnJlcGxhY2UoL15cdUQ4M0RcdUREMTFcXHMqLywgJycpLnRyaW0oKTtcbiAgICB9IGVsc2UgaWYgKGxhYmVsID09PSAnXHU4QkM0XHU1MjA2Jykge1xuICAgICAgLy8gXHU2M0QwXHU1M0Q2XHU4QkM0XHU1MjA2XHU2NjNFXHU3OTNBXHU0RTMyXHVGRjA4XHU1OTgyIFwiXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVGRjVDXHU1QjlFXHU4REY1XCJcdUZGMDlcbiAgICAgIHJlc3VsdC5cdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnModmFsdWUpO1xuICAgICAgLy8gXHU1QzFEXHU4QkQ1XHU2M0QwXHU1M0Q2XHU2NTcwXHU1QjU3XG4gICAgICBjb25zdCBzdGFyQ291bnQgPSAodmFsdWUubWF0Y2goL1x1RDgzQ1x1REYxRi9nKSB8fCBbXSkubGVuZ3RoO1xuICAgICAgaWYgKHN0YXJDb3VudCA+PSAxICYmIHN0YXJDb3VudCA8PSA1KSB7XG4gICAgICAgIHJlc3VsdC5cdThCQzRcdTUyMDYgPSBzdGFyQ291bnQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1N0QyMlx1NUYxNScpIHtcbiAgICAgIC8vIFx1N0QyMlx1NUYxNVx1NjYyRlx1NTkxQVx1N0VGNFx1NUVBNlx1NTQwOFx1NUU3Nlx1NjYzRVx1NzkzQVx1RkYwOFx1RDgzRFx1RENCMFx1NkI2M1x1OEQyMiBcdTAwQjcgXHVEODNEXHVERDM1XHU1REU1XHU0RjVDIFx1MDBCNyAuLi5cdUZGMDlcbiAgICAgIC8vIFx1OTcwMFx1ODk4MVx1OEZEQlx1NEUwMFx1NkI2NVx1NjJDNlx1NTIwNlx1NTQwNFx1N0VGNFx1NUVBNlxuICAgICAgcGFyc2VJbmRleEZpZWxkKHZhbHVlLCByZXN1bHQpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogXHU4OUUzXHU2NzkwXHU3RDIyXHU1RjE1XHU1NDA4XHU1RTc2XHU1QjU3XHU2QkI1IFwiXHVEODNEXHVEQ0IwXHU2QjYzXHU4RDIyIFx1MDBCNyBcdUQ4M0RcdUREMzVcdTVERTVcdTRGNUMgXHUwMEI3IFx1MjcwNVx1NUI4Q1x1NjIxMCBcdTAwQjcgXHVEODNDXHVERkFGXHU1MTc3XHU4QzYxIFx1MDBCNyBcdTI3MDVcdTdCODBcdTUzNTUgXHUwMEI3IFx1Mjc2NFx1RkUwRlx1NTA2NVx1NUVCN1wiXG4gKiBcdTU2REVcdTU0MDRcdTdEMjJcdTVGMTVcdTVCNTBcdTVCNTdcdTZCQjVcdTMwMDJcbiAqL1xuZnVuY3Rpb24gcGFyc2VJbmRleEZpZWxkKHZhbHVlOiBzdHJpbmcsIHJlc3VsdDogUGFydGlhbDxLbm93bGVkZ2VNZXRhPik6IHZvaWQge1xuICBjb25zdCBwYXJ0cyA9IHZhbHVlLnNwbGl0KC9bXHUwMEI3XFxuXS8pLm1hcChzID0+IHMudHJpbSgpKS5maWx0ZXIoQm9vbGVhbik7XG4gIGZvciAoY29uc3QgcGFydCBvZiBwYXJ0cykge1xuICAgIGNvbnN0IGNsZWFuZWQgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhwYXJ0KTtcbiAgICAvLyBcdTc3RTVcdThCQzZcdTVFOTNcdTdFRjRcdTVFQTZcbiAgICBmb3IgKGNvbnN0IGt3IG9mIFsnXHU2QjYzXHU4RDIyJywgJ1x1NTA0Rlx1OEQyMicsICdcdTZCNjNcdTUzNzAnLCAnXHU1MDRGXHU1MzcwJywgJ1x1NkI2M1x1NUJBQicsICdcdTRGMjRcdTVCOTgnXSkge1xuICAgICAgaWYgKGNsZWFuZWQuaW5jbHVkZXMoa3cpKSB7IHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU3N0U1XHU4QkM2XHU1RTkzID0ga3c7IGJyZWFrOyB9XG4gICAgfVxuICAgIC8vIFx1OTg5Q1x1ODI3Mlx1N0VGNFx1NUVBNlxuICAgIGZvciAoY29uc3Qga3cgb2YgWydcdTc3NjFcdTc3MjAnLCAnXHU1REU1XHU0RjVDJywgJ1x1NzUxRlx1NkQzQicsICdcdTVBMzFcdTRFNTAnLCAnXHU3OTNFXHU0RUE0JywgJ1x1NUI2Nlx1NEU2MCcsICdcdThGRDBcdTUyQTgnXSkge1xuICAgICAgaWYgKGNsZWFuZWQuaW5jbHVkZXMoa3cpKSB7IHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU5ODlDXHU4MjcyID0gY2xlYW5lZDsgYnJlYWs7IH1cbiAgICB9XG4gICAgLy8gXHU2NENEXHU0RjVDXHU3RUY0XHU1RUE2XG4gICAgZm9yIChjb25zdCBrdyBvZiBbJ1x1NjBGM1x1NkNENScsICdcdTg5QzRcdTUyMTInLCAnXHU2MjY3XHU4ODRDJywgJ1x1NTNEN1x1NjMyQicsICdcdTUxNEJcdTY3MEQnLCAnXHU1MjFEXHU3QTNGJywgJ1x1NUJBMVx1NjgzOCcsICdcdTRGRUVcdTY1MzknLCAnXHU1QjhDXHU2MjEwJywgJ1x1NTkwRFx1NzZEOCddKSB7XG4gICAgICBpZiAoY2xlYW5lZC5pbmNsdWRlcyhrdykpIHtcbiAgICAgICAgcmVzdWx0WydcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OCddID0gcmVzdWx0WydcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OCddID8/IFtdO1xuICAgICAgICBpZiAoIXJlc3VsdFsnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnXS5pbmNsdWRlcyhrdykpIHJlc3VsdFsnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnXS5wdXNoKGt3KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFx1NTc1N1x1N0VGNFx1NUVBNlx1RkYwOFx1NTkxQVx1OTAwOVx1RkYwOVxuICAgIGZvciAoY29uc3Qga3cgb2YgWydcdTYyQkRcdThDNjEnLCAnXHU1MTc3XHU4QzYxJywgJ1x1N0I4MFx1NTM1NScsICdcdTU2RjBcdTk2QkUnXSkge1xuICAgICAgaWYgKGNsZWFuZWQuaW5jbHVkZXMoa3cpICYmIGt3ICE9PSBjbGVhbmVkKSB7XG4gICAgICAgIHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU1NzU3ID0gcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTU3NTcgPz8gW107XG4gICAgICAgIGlmICghcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTU3NTcuaW5jbHVkZXMoa3cpKSByZXN1bHQuXHU3RDIyXHU1RjE1X1x1NTc1Ny5wdXNoKGt3KTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gXHU5OENFXHU5NjY5XHU3RUY0XHU1RUE2XHVGRjA4XHU1OTFBXHU5MDA5XHVGRjA5XG4gICAgZm9yIChjb25zdCBrdyBvZiBbJ1x1ODg0Q1x1NEUzQScsICdcdTdCQTFcdTc0MDYnLCAnXHU1MDY1XHU1RUI3JywgJ1x1NzdFNVx1OEJDNicsICdcdTc5M0VcdTRFQTQnLCAnXHU1QkI2XHU1RUFEJywgJ1x1NzkzRVx1NEYxQScsICdcdTYxMEZcdTU5MTYnXSkge1xuICAgICAgaWYgKGNsZWFuZWQuaW5jbHVkZXMoa3cpICYmIGt3ICE9PSBjbGVhbmVkKSB7XG4gICAgICAgIHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU5OENFXHU5NjY5ID0gcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2NjkgPz8gW107XG4gICAgICAgIGlmICghcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2NjkuaW5jbHVkZXMoa3cpKSByZXN1bHQuXHU3RDIyXHU1RjE1X1x1OThDRVx1OTY2OS5wdXNoKGt3KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIFx1NkI2M1x1NjU4NyBjYWxsb3V0IFx1NTNDQ1x1NTQxMVx1OEY2Q1x1NjM2MiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBcdTk4REVcdTRFNjZcdTZCNjNcdTY1ODcgY2FsbG91dCBYTUwgXHUyMTkyIE9CIGA+IFshdHlwZV1gIGNhbGxvdXRcdTMwMDJcbiAqIFx1NEY5RFx1NjM2RSBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTczLjFcdTMwMDJcbiAqXG4gKiBcdThGOTNcdTUxNjVcdTUzNTVcdTRFMkEgYDxjYWxsb3V0IC4uLj5jb250ZW50PC9jYWxsb3V0PmAgXHU1NzU3XHVGRjBDXHU4RjkzXHU1MUZBIE9CIG1hcmtkb3duIGNhbGxvdXRcdTMwMDJcbiAqIFx1NTkxQVx1NEUyQSBjYWxsb3V0IFx1NTc1N1x1NzUzMVx1OEMwM1x1NzUyOFx1NjVCOVx1NjJDNlx1NTIwNlx1NTQwRVx1OTAxMFx1NEUyQVx1OEMwM1x1NzUyOFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmVpc2h1Q2FsbG91dFRvT0IoeG1sOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBcdTYzRDBcdTUzRDZcdTVDNUVcdTYwMjdcbiAgY29uc3Qgb3Blbk1hdGNoID0geG1sLm1hdGNoKC88Y2FsbG91dFxcYihbXj5dKik+Lyk7XG4gIGlmICghb3Blbk1hdGNoKSByZXR1cm4geG1sO1xuXG4gIGNvbnN0IGF0dHJzID0gb3Blbk1hdGNoWzFdO1xuICBsZXQgZW1vamkgPSAnJztcbiAgbGV0IGJnQ29sb3IgPSAnJztcblxuICBjb25zdCBlbW9qaU1hdGNoID0gYXR0cnMubWF0Y2goL2Vtb2ppPVtcIiddKFteXCInXSspW1wiJ10vKTtcbiAgaWYgKGVtb2ppTWF0Y2gpIGVtb2ppID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMoZW1vamlNYXRjaFsxXSk7XG5cbiAgY29uc3QgYmdNYXRjaCA9IGF0dHJzLm1hdGNoKC9iYWNrZ3JvdW5kLWNvbG9yPVtcIiddKFteXCInXSspW1wiJ10vKTtcbiAgaWYgKGJnTWF0Y2gpIGJnQ29sb3IgPSBiZ01hdGNoWzFdO1xuXG4gIC8vIFx1NjNEMFx1NTNENlx1NTE4NVx1NUJCOVx1RkYwOFx1NTNCQlx1NjM4OSBvcGVuL2Nsb3NlIHRhZ1x1RkYwOVxuICBjb25zdCBjb250ZW50ID0geG1sXG4gICAgLnJlcGxhY2UoLzxjYWxsb3V0XFxiW14+XSo+LywgJycpXG4gICAgLnJlcGxhY2UoLzxcXC9jYWxsb3V0Pi8sICcnKVxuICAgIC50cmltKCk7XG5cbiAgLy8gXHU2NjIwXHU1QzA0IGNhbGxvdXQgXHU3QzdCXHU1NzhCXG4gIGNvbnN0IG9iVHlwZSA9IG1hcEZlaXNodUJnVG9PYlR5cGUoYmdDb2xvcik7XG4gIGNvbnN0IGxpbmVzID0gaHRtbEJsb2NrVG9UZXh0TGluZXMoY29udGVudCk7XG4gIGNvbnN0IHRpdGxlID0gYD4gWyEke29iVHlwZX1dJHtlbW9qaSA/IGAgJHtlbW9qaX1gIDogJyd9YDtcblxuICBpZiAobGluZXMubGVuZ3RoID09PSAwKSByZXR1cm4gdGl0bGU7XG4gIHJldHVybiBbdGl0bGUsIC4uLmxpbmVzLm1hcChsaW5lID0+IGA+ICR7bGluZX1gKV0uam9pbignXFxuJyk7XG59XG5cbi8qKlxuICogXHU2Mjc5XHU5MUNGXHU1QzA2XHU5OERFXHU0RTY2IFhNTCBcdTkxQ0NcdTc2ODRcdTYyNDBcdTY3MDkgY2FsbG91dCBcdTU3NTdcdThGNkNcdTYzNjJcdTRFM0EgT0IgY2FsbG91dFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydEZlaXNodUNhbGxvdXRzVG9PQih4bWw6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGNhbGxvdXRSZSA9IC88Y2FsbG91dFxcYltePl0qPltcXHNcXFNdKj88XFwvY2FsbG91dD4vZztcbiAgcmV0dXJuIHhtbC5yZXBsYWNlKGNhbGxvdXRSZSwgKG1hdGNoKSA9PiBmZWlzaHVDYWxsb3V0VG9PQihtYXRjaCkpO1xufVxuXG4vKipcbiAqIE9CIGA+IFshdHlwZV1gIGNhbGxvdXQgXHUyMTkyIFx1OThERVx1NEU2NiBjYWxsb3V0IFhNTFx1MzAwMlxuICogXHU0RjlEXHU2MzZFIGAwM19cdTY4M0NcdTVGMEZcdTg5QzRcdTgzMDMubWRgIFx1MDBBNzMuMlx1MzAwMlxuICpcbiAqIFx1OEY5M1x1NTE2NVx1NTM1NVx1NEUyQSBPQiBjYWxsb3V0IFx1NTc1N1x1RkYwOFx1NTQyQiBgPiBbIXR5cGVdYCBcdTk5OTZcdTg4NEMgKyBcdTVCNTBcdTg4NENcdUZGMDlcdTMwMDJcbiAqIFx1NTkxQVx1NEUyQSBjYWxsb3V0IFx1NzUzMVx1OEMwM1x1NzUyOFx1NjVCOVx1NjJDNlx1NTIwNlx1NTQwRVx1OTAxMFx1NEUyQVx1OEMwM1x1NzUyOFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gb2JDYWxsb3V0VG9GZWlzaHUobWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGxpbmVzID0gbWQuc3BsaXQoJ1xcbicpLm1hcChsID0+IGwucmVwbGFjZSgvXj5cXHM/LywgJycpKTtcbiAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG1kO1xuXG4gIC8vIFx1ODlFM1x1Njc5MFx1OTk5Nlx1ODg0QyBgPiBbIXR5cGVdYFxuICBjb25zdCBoZWFkZXJNYXRjaCA9IGxpbmVzWzBdLm1hdGNoKC9cXFshKFxcdyspXFxdXFxzKiguKikvKTtcbiAgaWYgKCFoZWFkZXJNYXRjaCkgcmV0dXJuIG1kO1xuXG4gIGNvbnN0IG9iVHlwZSA9IGhlYWRlck1hdGNoWzFdO1xuICBsZXQgcmVzdCA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKGhlYWRlck1hdGNoWzJdID8/ICcnKS50cmltKCk7XG4gIGNvbnN0IGZlaXNodSA9IE9CX0NBTExPVVRfVE9fRkVJU0hVW29iVHlwZV07XG5cbiAgbGV0IGVtb2ppID0gZmVpc2h1Py5lbW9qaSA/PyAnXHVEODNEXHVEQ0ExJztcbiAgbGV0IGJnID0gZmVpc2h1Py5iZyA/PyAnbGlnaHQtYmx1ZSc7XG4gIGxldCBib3JkZXIgPSBmZWlzaHU/LmJvcmRlciA/PyAnYmx1ZSc7XG5cbiAgLy8gXHU1QzFEXHU4QkQ1XHU0RUNFXHU5OTk2XHU4ODRDXHU1MjY5XHU0RjU5XHU1MTg1XHU1QkI5XHU2M0QwXHU1M0Q2XHU3NTI4XHU2MjM3XHU1MTk5XHU3Njg0IGVtb2ppXHVGRjBDXHU1RTc2XHU0RUNFXHU2QjYzXHU2NTg3XHU0RTJEXHU3OUZCXHU5NjY0XHUzMDAyXG4gIGNvbnN0IGVtb2ppTWF0Y2ggPSByZXN0Lm1hdGNoKC9eKFxccHtFeHRlbmRlZF9QaWN0b2dyYXBoaWN9KVxccyovdSk7XG4gIGlmIChlbW9qaU1hdGNoKSB7XG4gICAgZW1vamkgPSBlbW9qaU1hdGNoWzFdO1xuICAgIHJlc3QgPSByZXN0LnNsaWNlKGVtb2ppTWF0Y2hbMF0ubGVuZ3RoKS50cmltU3RhcnQoKTtcbiAgfVxuXG4gIC8vIFx1NTE4NVx1NUJCOVx1RkYwOFx1OTk5Nlx1ODg0Q1x1NTNCQlx1NjM4OSBlbW9qaSArIFx1NTQwRVx1N0VFRFx1NUI1MFx1ODg0Q1x1RkYwOVxuICBjb25zdCBib2R5TGluZXMgPSBsaW5lcy5zbGljZSgxKTtcbiAgaWYgKHJlc3QpIHtcbiAgICBib2R5TGluZXMudW5zaGlmdChyZXN0KTtcbiAgfVxuICBjb25zdCBjb250ZW50SHRtbCA9IGJvZHlMaW5lc1xuICAgIC5maWx0ZXIobCA9PiBsLnRyaW0oKSlcbiAgICAubWFwKGwgPT4gYDxwPiR7bH08L3A+YClcbiAgICAuam9pbignXFxuJyk7XG5cbiAgcmV0dXJuIFtcbiAgICBgPGNhbGxvdXQgZW1vamk9XCIke2Vtb2ppfVwiIGJhY2tncm91bmQtY29sb3I9XCIke2JnfVwiIGJvcmRlci1jb2xvcj1cIiR7Ym9yZGVyfVwiPmAsXG4gICAgY29udGVudEh0bWwsXG4gICAgYDwvY2FsbG91dD5gLFxuICBdLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIFx1NjI3OVx1OTFDRlx1NUMwNiBPQiBtZCBcdTkxQ0NcdTc2ODRcdTYyNDBcdTY3MDkgYD4gWyF0eXBlXWAgY2FsbG91dCBcdThGNkNcdTYzNjJcdTRFM0FcdTk4REVcdTRFNjYgWE1MIGNhbGxvdXRcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRPQkNhbGxvdXRzVG9GZWlzaHUobWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIFx1NTMzOVx1OTE0RFx1OEZERVx1N0VFRFx1NzY4NCBjYWxsb3V0IFx1NTc1N1x1RkYwOFx1NEVFNSA+IFshIFx1NUYwMFx1NTkzNFx1NzY4NFx1ODg0Q1x1RkYwQ1x1NzZGNFx1NTIzMFx1OTc1RSA+IFx1NjIxNlx1N0E3QVx1ODg0Q1x1RkYwOVxuICBjb25zdCBjYWxsb3V0UmUgPSAvKD86Xj4gXFxbIVxcdytcXF0uKlxcbig/Ol4+LipcXG4/KSopL2dtO1xuICByZXR1cm4gbWQucmVwbGFjZShjYWxsb3V0UmUsIChtYXRjaCkgPT4gb2JDYWxsb3V0VG9GZWlzaHUobWF0Y2gpKTtcbn1cbiIsICIvKipcbiAqIFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1NjNBOFx1NUJGQ1x1MzAwMlx1NEY5RFx1NjM2RSBgMDFfT0JcdTIxOTRcdTk4REVcdTRFNjZcdTVCRjlcdTZCRDRcdTYyQTVcdTU0NEEubWRgICsgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3XHU0RTAzXHUzMDAyXG4gKlxuICogT0IgMjUgXHU0RTJBXHU2ODM5XHU3NkVFXHU1RjU1IFx1MjE5MiBcdTk4REVcdTRFNjYgNSBcdTRFMkFcdTk4NzZcdTdFQTdcdTgyODJcdTcwQjlcdTc2ODRcdTY2MjBcdTVDMDRcdTg5QzRcdTUyMTlcdUZGMUFcbiAqICAgMFx1RkUwRlx1MjBFM1x1OEY5M1x1NTE2NSAvIFMgXHUyMTkyIFx1OThERVx1NEU2NlwiXHU4RjkzXHU1MTY1XCJcbiAqICAgMVx1RkUwRlx1MjBFM1x1OEY5M1x1NTFGQSAvIFggXHUyMTkyIFx1OThERVx1NEU2NlwiXHU4RjkzXHU1MUZBXCJcbiAqICAgMlx1RkUwRlx1MjBFM1x1RDgzRFx1RERDM1x1NzdFNVx1OEJDNlx1NkM2MCAvIFogLyBMIC8gSiAvIFEgXHUyMTkyIFx1OThERVx1NEU2NlwiXHU3N0U1XHU4QkM2XHU2QzYwXCJcbiAqICAgXHVEODNFXHVERUE3XHU1QkZDXHU1RjE1IFx1MjE5MiBcdTk4REVcdTRFNjZcIlx1NUJGQ1x1NUYxNVwiXG4gKiAgIDNcdUZFMEZcdTIwRTNcdTk2NDRcdTRFRjZcdTY1ODdcdTRFRjYgXHUyMTkyIFx1OThERVx1NEU2NlwiXHU5NjQ0XHU0RUY2XCJcdUZGMDhcdTcyNzlcdTZCOEFcdUZGMENcdTk3NUVcdTY1ODdcdTY4NjNcdUZGMDlcbiAqXG4gKiBcdTYzQThcdTVCRkNcdTdFRDNcdTY3OUNcdTdGMTNcdTVCNThcdTUyMzAgYC5mZWlzaHUtc3luYy9tYXBwaW5nLmpzb25gXHVGRjBDXHU0RTBEXHU3ODZDXHU3RjE2XHU3ODAxXHUzMDAyXG4gKi9cbmltcG9ydCB7IE5vdGljZSwgVEZvbGRlciwgdHlwZSBBcHAgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBsaXN0V2lraUNoaWxkcmVuIH0gZnJvbSAnLi9sYXJrL2NsaS5qcyc7XG5cbmNvbnN0IE1BUFBJTkdfRklMRSA9ICcuZmVpc2h1LXN5bmMvbWFwcGluZy5qc29uJztcblxuLyoqIFx1NTM1NVx1Njc2MVx1NjYyMFx1NUMwNFx1RkYxQU9CIFx1OERFRlx1NUY4NCBcdTIxOTIgXHU5OERFXHU0RTY2XHU4MjgyXHU3MEI5XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIERpck1hcHBpbmcge1xuICAvKiogT0IgXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU1OTgyIFwiMFx1RkUwRlx1MjBFM1x1OEY5M1x1NTE2NS9cdUQ4M0RcdURDQTFcdTc4OEVcdTcyNDdcdThGOTNcdTUxNjVcdUZGMDhcdTk1RUFcdTVGRjVcdUZGMDlcIlx1MzAwMiAqL1xuICBvYlBhdGg6IHN0cmluZztcbiAgLyoqIFx1OThERVx1NEU2NiBub2RlX3Rva2VuXHUzMDAyICovXG4gIGZlaXNodU5vZGVUb2tlbjogc3RyaW5nO1xuICAvKiogXHU5OERFXHU0RTY2XHU4MjgyXHU3MEI5XHU2ODA3XHU5ODk4XHUzMDAyICovXG4gIGZlaXNodVRpdGxlOiBzdHJpbmc7XG59XG5cbi8qKiBcdTY2MjBcdTVDMDRcdTdGMTNcdTVCNThcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWFwcGluZ0NhY2hlIHtcbiAgLyoqIFx1NzUxRlx1NjIxMFx1NjVGNlx1OTVGNFx1MzAwMiAqL1xuICBnZW5lcmF0ZWRBdDogc3RyaW5nO1xuICAvKiogc3BhY2VfaWRcdTMwMDIgKi9cbiAgc3BhY2VJZDogc3RyaW5nO1xuICAvKiogXHU5ODc2XHU3RUE3XHU4MjgyXHU3MEI5XHUzMDAyICovXG4gIHRvcE5vZGVzOiBBcnJheTx7IHRva2VuOiBzdHJpbmc7IHRpdGxlOiBzdHJpbmcgfT47XG4gIC8qKiBcdThCRTZcdTdFQzZcdTY2MjBcdTVDMDRcdTMwMDIgKi9cbiAgbWFwcGluZ3M6IERpck1hcHBpbmdbXTtcbn1cblxuLyoqIE9CIFx1NjgzOVx1NzZFRVx1NUY1NSBlbW9qaSBcdTIxOTIgXHU5OERFXHU0RTY2XHU5ODc2XHU3RUE3XHU4MjgyXHU3MEI5XHU2ODA3XHU5ODk4XHVGRjA4XHU0RjlEXHU2MzZFIDAxIFx1NUJGOVx1NkJENFx1NjJBNVx1NTQ0QVx1RkYwOVx1MzAwMiAqL1xuY29uc3QgUk9PVF9ESVJfVE9fRkVJU0hVOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAnMFx1RkUwRlx1MjBFM1x1OEY5M1x1NTE2NSc6ICdcdThGOTNcdTUxNjUnLFxuICAnMVx1RkUwRlx1MjBFM1x1OEY5M1x1NTFGQSc6ICdcdThGOTNcdTUxRkEnLFxuICAnMlx1RkUwRlx1MjBFM1x1RDgzRFx1RERDM1x1NzdFNVx1OEJDNlx1NkM2MCc6ICdcdTc3RTVcdThCQzZcdTZDNjAnLFxuICAnM1x1RkUwRlx1MjBFM1x1OTY0NFx1NEVGNlx1NjU4N1x1NEVGNic6ICdcdTk2NDRcdTRFRjYnLFxuICAnXHVEODNFXHVERUE3XHU1QkZDXHU1RjE1JzogJ1x1NUJGQ1x1NUYxNScsXG59O1xuXG4vKipcbiAqIFx1NjNBOFx1NUJGQ1x1NUU3Nlx1N0YxM1x1NUI1OFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1MzAwMlxuICogMS4gXHU2MkM5XHU5OERFXHU0RTY2XHU5ODc2XHU3RUE3XHU4MjgyXHU3MEI5XHU1MjE3XHU4ODY4XG4gKiAyLiBcdTYzMDkgZW1vamkgXHU4OUM0XHU1MjE5XHU1MzM5XHU5MTREIE9CIFx1NjgzOVx1NzZFRVx1NUY1NSBcdTIxOTIgXHU5OERFXHU0RTY2XHU5ODc2XHU3RUE3XG4gKiAzLiBcdTkwMTJcdTVGNTJcdTUzMzlcdTkxNERcdTVCNTBcdTc2RUVcdTVGNTVcdUZGMDhcdTYzMDlcdTY4MDdcdTk4OThcdTZBMjFcdTdDQ0FcdTUzMzlcdTkxNERcdUZGMDlcbiAqIDQuIFx1NTE5OVx1NTE2NSAuZmVpc2h1LXN5bmMvbWFwcGluZy5qc29uXG4gKlxuICogQHJldHVybnMgXHU2M0E4XHU1QkZDXHU3Njg0XHU2NjIwXHU1QzA0XHU2NTcwXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWZyZXNoTWFwcGluZyhhcHA6IEFwcCwgc3BhY2VJZDogc3RyaW5nKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgaWYgKCFzcGFjZUlkKSB7XG4gICAgbmV3IE5vdGljZSgnXHUyNkEwXHVGRTBGIFx1NjcyQVx1OTE0RFx1N0Y2RSBzcGFjZV9pZFx1RkYwQ1x1OEJGN1x1NTcyOFx1OEJCRVx1N0Y2RVx1OTg3NVx1NTg2Qlx1NTE5OScpO1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgbmV3IE5vdGljZSgnXHVEODNEXHVERDA0IFx1NjNBOFx1NUJGQ1x1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNC4uLicpO1xuXG4gIC8vIFx1NjJDOSA1IFx1NEUyQVx1OTg3Nlx1N0VBN1x1ODI4Mlx1NzBCOVxuICBjb25zdCB0b3BOb2RlcyA9IGxpc3RXaWtpQ2hpbGRyZW4oc3BhY2VJZCwgJycpO1xuICBpZiAodG9wTm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgbmV3IE5vdGljZSgnXHUyNkEwXHVGRTBGIFx1NjJDOVx1NEUwRFx1NTIzMFx1OThERVx1NEU2Nlx1OTg3Nlx1N0VBN1x1ODI4Mlx1NzBCOVx1RkYwQ1x1OEJGN1x1NjhDMFx1NjdFNSBzcGFjZV9pZCBcdTU0OEMgbGFyay1jbGkgXHU3NjdCXHU1RjU1XHU2MDAxJyk7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBjb25zdCBtYXBwaW5nczogRGlyTWFwcGluZ1tdID0gW107XG5cbiAgLy8gXHU5ODc2XHU3RUE3XHU1MzM5XHU5MTREXG4gIGZvciAoY29uc3QgW29iUm9vdCwgZmVpc2h1VGl0bGVdIG9mIE9iamVjdC5lbnRyaWVzKFJPT1RfRElSX1RPX0ZFSVNIVSkpIHtcbiAgICBjb25zdCBtYXRjaGVkID0gdG9wTm9kZXMuZmluZChuID0+IG4udGl0bGUuaW5jbHVkZXMoZmVpc2h1VGl0bGUpIHx8IGZlaXNodVRpdGxlLmluY2x1ZGVzKG4udGl0bGUpKTtcbiAgICBpZiAobWF0Y2hlZCkge1xuICAgICAgbWFwcGluZ3MucHVzaCh7XG4gICAgICAgIG9iUGF0aDogb2JSb290LFxuICAgICAgICBmZWlzaHVOb2RlVG9rZW46IG1hdGNoZWQubm9kZV90b2tlbixcbiAgICAgICAgZmVpc2h1VGl0bGU6IG1hdGNoZWQudGl0bGUsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBcdTkwMTJcdTVGNTJcdTUzMzlcdTkxNERcdTVCNTBcdTc2RUVcdTVGNTVcdUZGMDhcdTRFMDBcdTdFQTdcdTUzNzNcdTUzRUZcdUZGMENcdTkwN0ZcdTUxNERcdThGQzdcdTZERjFcdUZGMDlcbiAgY29uc3Qgcm9vdCA9IGFwcC52YXVsdC5nZXRSb290KCk7XG4gIGZvciAoY29uc3QgY2hpbGQgb2Ygcm9vdC5jaGlsZHJlbikge1xuICAgIGlmICghKGNoaWxkIGluc3RhbmNlb2YgVEZvbGRlcikpIGNvbnRpbnVlO1xuICAgIGlmICghY2hpbGQubmFtZSB8fCBjaGlsZC5uYW1lLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgaWYgKCFjaGlsZC5jaGlsZHJlbi5sZW5ndGgpIGNvbnRpbnVlO1xuICAgIC8vIFx1NjI3RVx1NTIzMFx1OEZEOVx1NEUyQVx1NjgzOVx1NzY4NFx1OThERVx1NEU2NiB0b2tlblxuICAgIGNvbnN0IHJvb3RNYXBwaW5nID0gbWFwcGluZ3MuZmluZChtID0+IG0ub2JQYXRoID09PSBjaGlsZC5uYW1lKTtcbiAgICBpZiAoIXJvb3RNYXBwaW5nKSBjb250aW51ZTtcblxuICAgIC8vIFx1NjJDOVx1OThERVx1NEU2Nlx1NUI1MFx1ODI4Mlx1NzBCOVxuICAgIGNvbnN0IGZlaXNodUNoaWxkcmVuID0gbGlzdFdpa2lDaGlsZHJlbihzcGFjZUlkLCByb290TWFwcGluZy5mZWlzaHVOb2RlVG9rZW4pO1xuICAgIGZvciAoY29uc3Qgb2JTdWIgb2YgY2hpbGQuY2hpbGRyZW4pIHtcbiAgICAgIGlmICghb2JTdWIubmFtZSB8fCBvYlN1Yi5uYW1lLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAvLyBcdTZBMjFcdTdDQ0FcdTUzMzlcdTkxNERcdUZGMDhcdTUzQkJcdTYzODlcdTdGMTZcdTc4MDFcdTUyNERcdTdGMDBcdTU0MEVcdTZCRDRcdThGODNcdUZGMDlcbiAgICAgIGNvbnN0IGNsZWFuT2JOYW1lID0gb2JTdWIubmFtZS5yZXBsYWNlKC9eXFxkezJ9X1xcZHs0fV9bU1haTFFKXVxcZCtcXHMqLywgJycpO1xuICAgICAgY29uc3QgbWF0Y2hlZCA9IGZlaXNodUNoaWxkcmVuLmZpbmQoXG4gICAgICAgIG4gPT4gbi50aXRsZS5pbmNsdWRlcyhjbGVhbk9iTmFtZSkgfHwgY2xlYW5PYk5hbWUuaW5jbHVkZXMobi50aXRsZSksXG4gICAgICApO1xuICAgICAgaWYgKG1hdGNoZWQpIHtcbiAgICAgICAgbWFwcGluZ3MucHVzaCh7XG4gICAgICAgICAgb2JQYXRoOiBgJHtjaGlsZC5uYW1lfS8ke29iU3ViLm5hbWV9YCxcbiAgICAgICAgICBmZWlzaHVOb2RlVG9rZW46IG1hdGNoZWQubm9kZV90b2tlbixcbiAgICAgICAgICBmZWlzaHVUaXRsZTogbWF0Y2hlZC50aXRsZSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gXHU1MTk5XHU3RjEzXHU1QjU4XG4gIGNvbnN0IGNhY2hlOiBNYXBwaW5nQ2FjaGUgPSB7XG4gICAgZ2VuZXJhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICBzcGFjZUlkLFxuICAgIHRvcE5vZGVzOiB0b3BOb2Rlcy5tYXAobiA9PiAoeyB0b2tlbjogbi5ub2RlX3Rva2VuLCB0aXRsZTogbi50aXRsZSB9KSksXG4gICAgbWFwcGluZ3MsXG4gIH07XG5cbiAgYXdhaXQgZW5zdXJlQ29uZmlnRGlyKGFwcCk7XG4gIGF3YWl0IGFwcC52YXVsdC5hZGFwdGVyLndyaXRlKE1BUFBJTkdfRklMRSwgSlNPTi5zdHJpbmdpZnkoY2FjaGUsIG51bGwsIDIpKTtcblxuICBuZXcgTm90aWNlKGBcdTI3MDUgXHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0XHU1REYyXHU2NkY0XHU2NUIwXHVGRjA4JHttYXBwaW5ncy5sZW5ndGh9IFx1Njc2MVx1RkYwOWApO1xuICByZXR1cm4gbWFwcGluZ3MubGVuZ3RoO1xufVxuXG4vKipcbiAqIFx1OEJGQlx1NjYyMFx1NUMwNFx1N0YxM1x1NUI1OFx1MzAwMlx1NjVFMFx1N0YxM1x1NUI1OFx1OEZENFx1NTZERSBudWxsXHUzMDAyXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkTWFwcGluZyhhcHA6IEFwcCk6IFByb21pc2U8TWFwcGluZ0NhY2hlIHwgbnVsbD4ge1xuICB0cnkge1xuICAgIGlmICghKGF3YWl0IGFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhNQVBQSU5HX0ZJTEUpKSkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgcmF3ID0gYXdhaXQgYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChNQVBQSU5HX0ZJTEUpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKHJhdykgYXMgTWFwcGluZ0NhY2hlO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tzeW5jL21hcHBpbmddIGxvYWQgZmFpbGVkOicsIGVycik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTY3RTUgT0IgXHU4REVGXHU1Rjg0XHU1QkY5XHU1RTk0XHU3Njg0XHU5OERFXHU0RTY2XHU4MjgyXHU3MEI5IHRva2VuXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb29rdXBGZWlzaHVOb2RlKGNhY2hlOiBNYXBwaW5nQ2FjaGUsIG9iUGF0aDogc3RyaW5nKTogRGlyTWFwcGluZyB8IG51bGwge1xuICAvLyBcdTdDQkVcdTc4NkVcdTUzMzlcdTkxNERcbiAgY29uc3QgZXhhY3QgPSBjYWNoZS5tYXBwaW5ncy5maW5kKG0gPT4gbS5vYlBhdGggPT09IG9iUGF0aCk7XG4gIGlmIChleGFjdCkgcmV0dXJuIGV4YWN0O1xuXG4gIC8vIFx1NTI0RFx1N0YwMFx1NTMzOVx1OTE0RFx1RkYwOFx1NTNENlx1NjcwMFx1OTU3Rlx1NTMzOVx1OTE0RFx1RkYwOVxuICBsZXQgYmVzdDogRGlyTWFwcGluZyB8IG51bGwgPSBudWxsO1xuICBmb3IgKGNvbnN0IG0gb2YgY2FjaGUubWFwcGluZ3MpIHtcbiAgICBpZiAob2JQYXRoLnN0YXJ0c1dpdGgobS5vYlBhdGggKyAnLycpIHx8IG9iUGF0aC5zdGFydHNXaXRoKG0ub2JQYXRoKSkge1xuICAgICAgaWYgKCFiZXN0IHx8IG0ub2JQYXRoLmxlbmd0aCA+IGJlc3Qub2JQYXRoLmxlbmd0aCkgYmVzdCA9IG07XG4gICAgfVxuICB9XG4gIHJldHVybiBiZXN0O1xufVxuXG5hc3luYyBmdW5jdGlvbiBlbnN1cmVDb25maWdEaXIoYXBwOiBBcHApOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgZGlyID0gJy5mZWlzaHUtc3luYyc7XG4gIGlmICghKGF3YWl0IGFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhkaXIpKSkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBhcHAudmF1bHQuYWRhcHRlci5ta2RpcihkaXIpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLyogaWdub3JlICovXG4gICAgfVxuICB9XG59XG4iLCAiLyoqXG4gKiBcdTY3MkNcdTU3MzAgSFRUUCBzZXJ2ZXJcdTMwMDJcdTRGOURcdTYzNkVcdTY1QjlcdTY4NDggXHUwMEE3Mlx1RkYwOGxvY2FsaG9zdCBIVFRQIFx1NTM0Rlx1OEJBRVx1RkYwOVx1MzAwMlxuICpcbiAqIC0gXHU3NTI4IG5vZGU6aHR0cCBcdThENzcgc2VydmVyXHVGRjA4T0IgXHU2M0QyXHU0RUY2IGlzRGVza3RvcE9ubHlcdUZGMENcdTUzRUZcdTc1Mjggbm9kZSBcdTUxODVcdTdGNkVcdTZBMjFcdTU3NTdcdUZGMDlcbiAqIC0gXHU3QUVGXHU1M0UzXHU1M0VGXHU5MTREXHU3RjZFXHVGRjA4XHU5RUQ4XHU4QkE0IDQ1NjdcdUZGMDlcbiAqIC0gXHU5Mjc0XHU2NzQzXHVGRjFBXHU2QkNGXHU0RTJBXHU4QkY3XHU2QzQyXHU2ODIxXHU5QThDIFgtU3luYy1Ub2tlbiBoZWFkZXJcbiAqIC0gQ09SU1x1RkYxQVx1NjUzRVx1OTAxQSBPUFRJT05TIFx1OTg4NFx1NjhDMFx1RkYwOFx1NjI2OVx1NUM1NVx1NEVDRVx1OThERVx1NEU2Nlx1OTg3NVx1OTc2MiBmZXRjaCBcdTRGMUFcdTg4QUJcdTYyRTZcdUZGMDlcbiAqIC0gXHU4REVGXHU3NTMxXHU1MjA2XHU1M0QxXHU1MjMwIGhhbmRsZXJzXG4gKi9cbmltcG9ydCAqIGFzIGh0dHAgZnJvbSAnbm9kZTpodHRwJztcbmltcG9ydCB7IFRPS0VOX0hFQURFUiB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VydmVyRGVwcyB7XG4gIC8qKiBcdTY4MjFcdTlBOEMgdG9rZW4gXHU2NjJGXHU1NDI2XHU1MzM5XHU5MTREXHUzMDAyICovXG4gIHZhbGlkYXRlVG9rZW46ICh0b2tlbjogc3RyaW5nKSA9PiBib29sZWFuO1xuICAvKiogXHU4REVGXHU3NTMxXHU1OTA0XHU3NDA2XHU1NjY4XHU2NjIwXHU1QzA0XHUzMDAyICovXG4gIHJvdXRlczogTWFwPHN0cmluZywgUm91dGVIYW5kbGVyPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0Q29udGV4dCB7XG4gIG1ldGhvZDogc3RyaW5nO1xuICB1cmw6IHN0cmluZztcbiAgLyoqIFx1ODlFM1x1Njc5MFx1NTQwRVx1NzY4NCBwYXRoXHVGRjA4XHU0RTBEXHU1NDJCIHF1ZXJ5XHVGRjA5XHUzMDAyICovXG4gIHBhdGg6IHN0cmluZztcbiAgLyoqIHF1ZXJ5IFx1NTNDMlx1NjU3MFx1MzAwMiAqL1xuICBxdWVyeTogVVJMU2VhcmNoUGFyYW1zO1xuICAvKiogXHU4QkY3XHU2QzQyXHU0RjUzXHVGRjA4UE9TVC9QVVQgXHU2MjREXHU2NzA5XHVGRjBDXHU1REYyIHBhcnNlIEpTT05cdUZGMDlcdTMwMDIgKi9cbiAgYm9keT86IHVua25vd247XG4gIC8qKiBcdTUzOUZcdTU5Q0IgdG9rZW5cdTMwMDIgKi9cbiAgdG9rZW46IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgUm91dGVIYW5kbGVyID0gKGN0eDogUmVxdWVzdENvbnRleHQpID0+IFByb21pc2U8dW5rbm93bj4gfCB1bmtub3duO1xuXG4vKiogSlNPTiBcdTU0Q0RcdTVFOTRcdTVERTVcdTUxNzdcdTMwMDIgKi9cbmZ1bmN0aW9uIGpzb24ocmVzOiBodHRwLlNlcnZlclJlc3BvbnNlLCBzdGF0dXM6IG51bWJlciwgZGF0YTogdW5rbm93bik6IHZvaWQge1xuICBjb25zdCBib2R5ID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gIHJlcy53cml0ZUhlYWQoc3RhdHVzLCB7XG4gICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04JyxcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogYCR7VE9LRU5fSEVBREVSfSwgQ29udGVudC1UeXBlYCxcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsIFBPU1QsIE9QVElPTlMnLFxuICAgICdDb250ZW50LUxlbmd0aCc6IEJ1ZmZlci5ieXRlTGVuZ3RoKGJvZHkpLFxuICB9KTtcbiAgcmVzLmVuZChib2R5KTtcbn1cblxuLyoqXG4gKiBcdTU0MkZcdTUyQTggSFRUUCBzZXJ2ZXJcdTMwMDJcbiAqIEByZXR1cm5zIHN0b3AoKSBcdTUxRkRcdTY1NzBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0U2VydmVyKHBvcnQ6IG51bWJlciwgZGVwczogU2VydmVyRGVwcyk6IFByb21pc2U8eyBzdG9wOiAoKSA9PiBQcm9taXNlPHZvaWQ+IH0+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcihhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgIC8vIENPUlMgXHU5ODg0XHU2OEMwXG4gICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoMjA0LCB7XG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6IGAke1RPS0VOX0hFQURFUn0sIENvbnRlbnQtVHlwZWAsXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULCBQT1NULCBPUFRJT05TJyxcbiAgICAgICAgfSk7XG4gICAgICAgIHJlcy5lbmQoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTg5RTNcdTY3OTAgVVJMXG4gICAgICBjb25zdCBmdWxsVXJsID0gcmVxLnVybCA/PyAnLyc7XG4gICAgICBjb25zdCB1cmxPYmogPSBuZXcgVVJMKGZ1bGxVcmwsIGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH1gKTtcbiAgICAgIGNvbnN0IGN0eFBhdGggPSB1cmxPYmoucGF0aG5hbWU7XG5cbiAgICAgIC8vIFx1OEJGQlx1NTNENiBib2R5XHVGRjA4UE9TVC9QVVRcdUZGMDlcbiAgICAgIGxldCBib2R5OiB1bmtub3duO1xuICAgICAgaWYgKHJlcS5tZXRob2QgPT09ICdQT1NUJyB8fCByZXEubWV0aG9kID09PSAnUFVUJykge1xuICAgICAgICBjb25zdCBjaHVua3M6IEJ1ZmZlcltdID0gW107XG4gICAgICAgIGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2YgcmVxKSB7XG4gICAgICAgICAgY2h1bmtzLnB1c2goY2h1bmsgYXMgQnVmZmVyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByYXcgPSBCdWZmZXIuY29uY2F0KGNodW5rcykudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgaWYgKHJhdykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBib2R5ID0gSlNPTi5wYXJzZShyYXcpO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAganNvbihyZXMsIDQwMCwgeyBvazogZmFsc2UsIGNvZGU6ICdCQURfSlNPTicsIG1lc3NhZ2U6ICdJbnZhbGlkIEpTT04gYm9keScgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFx1OTI3NFx1Njc0M1x1RkYwOC9zdGF0dXMgXHU1MTQxXHU4QkI4XHU2NUUwIHRva2VuIFx1NjNBMlx1NkQ0Qlx1RkYwQ1x1NEY0Nlx1NUI5RVx1OTY0NVx1NjNFMVx1NjI0Qlx1OTcwMFx1ODk4MVx1RkYwOVxuICAgICAgY29uc3QgdG9rZW4gPSByZXEuaGVhZGVyc1tUT0tFTl9IRUFERVIudG9Mb3dlckNhc2UoKV0gYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgaWYgKGN0eFBhdGggIT09ICcvc3RhdHVzJyAmJiAhZGVwcy52YWxpZGF0ZVRva2VuKHRva2VuID8/ICcnKSkge1xuICAgICAgICBqc29uKHJlcywgNDAxLCB7IG9rOiBmYWxzZSwgY29kZTogJ1VOQVVUSE9SSVpFRCcsIG1lc3NhZ2U6ICdJbnZhbGlkIG9yIG1pc3NpbmcgWC1TeW5jLVRva2VuJyB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdThERUZcdTc1MzFcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBkZXBzLnJvdXRlcy5nZXQoY3R4UGF0aCk7XG4gICAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgICAganNvbihyZXMsIDQwNCwgeyBvazogZmFsc2UsIGNvZGU6ICdOT1RfRk9VTkQnLCBtZXNzYWdlOiBgVW5rbm93biBwYXRoOiAke2N0eFBhdGh9YCB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBoYW5kbGVyKHtcbiAgICAgICAgICBtZXRob2Q6IHJlcS5tZXRob2QgPz8gJ0dFVCcsXG4gICAgICAgICAgdXJsOiBmdWxsVXJsLFxuICAgICAgICAgIHBhdGg6IGN0eFBhdGgsXG4gICAgICAgICAgcXVlcnk6IHVybE9iai5zZWFyY2hQYXJhbXMsXG4gICAgICAgICAgYm9keSxcbiAgICAgICAgICB0b2tlbjogdG9rZW4gPz8gJycsXG4gICAgICAgIH0pO1xuICAgICAgICBqc29uKHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgfSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycik7XG4gICAgICAgIGNvbnN0IGNvZGUgPSAoZXJyIGFzIHsgY29kZT86IHN0cmluZyB9KT8uY29kZSA/PyAnSU5URVJOQUwnO1xuICAgICAgICBjb25zdCBzdGF0dXMgPSAoZXJyIGFzIHsgc3RhdHVzPzogbnVtYmVyIH0pPy5zdGF0dXMgPz8gNTAwO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbc3luYy9zZXJ2ZXJdIGhhbmRsZXIgZXJyb3I6JywgZXJyKTtcbiAgICAgICAganNvbihyZXMsIHN0YXR1cywgeyBvazogZmFsc2UsIGNvZGUsIG1lc3NhZ2UgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBzZXJ2ZXIub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgcmVqZWN0KGVycik7XG4gICAgfSk7XG5cbiAgICBzZXJ2ZXIubGlzdGVuKHBvcnQsICcxMjcuMC4wLjEnLCAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhgW3N5bmMvc2VydmVyXSBsaXN0ZW5pbmcgb24gaHR0cDovLzEyNy4wLjAuMToke3BvcnR9YCk7XG4gICAgICByZXNvbHZlKHtcbiAgICAgICAgc3RvcDogKCkgPT5cbiAgICAgICAgICBuZXcgUHJvbWlzZSgocmVzKSA9PiB7XG4gICAgICAgICAgICBzZXJ2ZXIuY2xvc2UoKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW3N5bmMvc2VydmVyXSBzdG9wcGVkYCk7XG4gICAgICAgICAgICAgIHJlcygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSksXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKiBcdTY3ODRcdTkwMjBcdTk1MTlcdThCRUZcdUZGMDhcdTVFMjYgY29kZS9zdGF0dXNcdUZGMDlcdTMwMDIgKi9cbmV4cG9ydCBjbGFzcyBIdHRwRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvZGU6IHN0cmluZztcbiAgc3RhdHVzOiBudW1iZXI7XG4gIGNvbnN0cnVjdG9yKGNvZGU6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nLCBzdGF0dXMgPSA0MDApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLmNvZGUgPSBjb2RlO1xuICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICB9XG59XG4iLCAiLyoqXG4gKiBHRVQgL3N0YXR1cyBcdTIwMTQgXHU2M0UxXHU2MjRCL1x1NTA2NVx1NUVCN1x1NjhDMFx1NjdFNVx1MzAwMlxuICovXG5pbXBvcnQge1xuICBQUk9UT0NPTF9WRVJTSU9OLFxuICBTRVJWRVJfQ0FQQUJJTElUSUVTLFxuICB0eXBlIFN0YXR1c1Jlc3BvbnNlLFxufSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5TdGF0ZSB9IGZyb20gJy4uL3NldHRpbmdzLmpzJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhdHVzSGFuZGxlcihwbHVnaW5WZXJzaW9uOiBzdHJpbmcsIHZhdWx0TmFtZTogc3RyaW5nLCBzdGF0ZTogUGx1Z2luU3RhdGUpIHtcbiAgcmV0dXJuIGFzeW5jIChfY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8U3RhdHVzUmVzcG9uc2U+ID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgb2s6IHRydWUsXG4gICAgICB2ZXJzaW9uOiBwbHVnaW5WZXJzaW9uLFxuICAgICAgY29tcG9uZW50VmVyc2lvbjogcGx1Z2luVmVyc2lvbixcbiAgICAgIHByb3RvY29sVmVyc2lvbjogUFJPVE9DT0xfVkVSU0lPTixcbiAgICAgIGNhcGFiaWxpdGllczogWy4uLlNFUlZFUl9DQVBBQklMSVRJRVNdLFxuICAgICAgdmF1bHQ6IHZhdWx0TmFtZSxcbiAgICAgIGxhcmtSZWFkeTogISFzdGF0ZS5sYXJrQ2xpUmVzb2x2ZWQsXG4gICAgICBsYXJrVmVyc2lvbjogc3RhdGUubGFya0NsaVZlcnNpb24gfHwgbnVsbCxcbiAgICB9O1xuICB9O1xufVxuIiwgIi8qKlxuICogR0VUIC90cmVlIFx1MjAxNCBcdThGRDRcdTU2REUgdmF1bHQgXHU3NkVFXHU1RjU1XHU2ODExXHVGRjA4XHU3RUQ5XHU2MjY5XHU1QzU1XHU3NkVFXHU1RjU1XHU0RTBCXHU2MkM5XHU3NTI4XHVGRjA5XHUzMDAyXG4gKlxuICogXHU0RjE4XHU1MzE2XHVGRjFBXG4gKiAtIFx1NTE4NVx1NUI1OFx1N0YxM1x1NUI1OFx1RkYwODUgXHU3OUQyIFRUTFx1RkYwOVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NkJDRlx1NkIyMVx1OEJGN1x1NkM0Mlx1OTA0RFx1NTM4Nlx1NTE2OCB2YXVsdFxuICogLSBcdTY1MkZcdTYzMDEgbWF4RGVwdGggXHU1M0MyXHU2NTcwXHVGRjA4cXVlcnkgc3RyaW5nXHVGRjA5XHVGRjBDXHU5RUQ4XHU4QkE0XHU4RkQ0XHU1NkRFXHU4RjgzXHU1QjhDXHU2NTc0XHU3NkVFXHU1RjU1XHU2ODExXG4gKiAtIFx1NjUyRlx1NjMwMSBwcmVmaXggXHU1M0MyXHU2NTcwXHVGRjBDXHU1QzU1XHU1RjAwXHU2MzA3XHU1QjlBXHU1QjUwXHU2ODExXG4gKi9cbmltcG9ydCB0eXBlIHsgVHJlZVJlc3BvbnNlLCBUcmVlTm9kZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQgeyB0eXBlIEFwcCwgVEZvbGRlciB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuXG5jb25zdCBFWENMVURFID0gbmV3IFNldChbXG4gICdcdTYzRDJcdTRFRjYnLFxuICAnc2NyaXB0cycsXG4gICcub2JzaWRpYW4nLFxuICAnLnRyYXNoJyxcbiAgJy5mZWlzaHUtc3luYycsXG4gICdub2RlX21vZHVsZXMnLFxuXSk7XG5cbi8qKiBcdTdGMTNcdTVCNTggKi9cbmxldCBjYWNoZURpcnM6IFRyZWVOb2RlW10gPSBbXTtcbmxldCBjYWNoZVRpbWUgPSAwO1xuY29uc3QgQ0FDSEVfVFRMID0gNV8wMDA7IC8vIDUgXHU3OUQyXG5cbmZ1bmN0aW9uIGJ1aWxkRnVsbFRyZWUoYXBwOiBBcHApOiBUcmVlTm9kZVtdIHtcbiAgY29uc3Qgcm9vdCA9IGFwcC52YXVsdC5nZXRSb290KCk7XG4gIGNvbnN0IGRpcnM6IFRyZWVOb2RlW10gPSBbXTtcblxuICBjb25zdCB3YWxrID0gKGZvbGRlcjogVEZvbGRlciwgZGVwdGg6IG51bWJlcikgPT4ge1xuICAgIGlmIChkZXB0aCA+IDApIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBmb2xkZXIubmFtZTtcbiAgICAgIGlmIChFWENMVURFLmhhcyhuYW1lKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJy4nKSkgcmV0dXJuO1xuICAgICAgZGlycy5wdXNoKHsgcGF0aDogZm9sZGVyLnBhdGgsIGxhYmVsOiBuYW1lLCBkZXB0aCB9KTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBmb2xkZXIuY2hpbGRyZW4pIHtcbiAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIFRGb2xkZXIpIHdhbGsoY2hpbGQsIGRlcHRoICsgMSk7XG4gICAgfVxuICB9O1xuXG4gIHdhbGsocm9vdCwgMCk7XG5cbiAgZGlycy5zb3J0KChhLCBiKSA9PiBhLnBhdGgubG9jYWxlQ29tcGFyZShiLnBhdGgsICd6aCcpKTtcblxuICByZXR1cm4gZGlycztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyZWVIYW5kbGVyKGFwcDogQXBwKSB7XG4gIHJldHVybiBhc3luYyAoY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8VHJlZVJlc3BvbnNlPiA9PiB7XG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBtYXhEZXB0aCA9IHBhcnNlSW50KGN0eC5xdWVyeS5nZXQoJ21heERlcHRoJykgfHwgJzEyJywgMTApO1xuICAgIGNvbnN0IHByZWZpeCA9IGN0eC5xdWVyeS5nZXQoJ3ByZWZpeCcpIHx8ICcnO1xuXG4gICAgLy8gXHU1MjM3XHU2NUIwXHU3RjEzXHU1QjU4XG4gICAgaWYgKG5vdyAtIGNhY2hlVGltZSA+IENBQ0hFX1RUTCB8fCBjYWNoZURpcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjYWNoZURpcnMgPSBidWlsZEZ1bGxUcmVlKGFwcCk7XG4gICAgICBjYWNoZVRpbWUgPSBub3c7XG4gICAgfVxuXG4gICAgbGV0IGRpcnMgPSBjYWNoZURpcnM7XG5cbiAgICAvLyBwcmVmaXggXHU3QjVCXHU5MDA5XHVGRjFBXHU1M0VBXHU4RkQ0XHU1NkRFIHByZWZpeC8gXHU0RTBCXHU3Njg0XHU1QjUwXHU4MjgyXHU3MEI5XHVGRjA4ZGVwdGggXHU0RUNFIHByZWZpeCBcdTRFMEJcdTRFMDBcdTdFQTdcdTVGMDBcdTU5Q0JcdUZGMDlcbiAgICBpZiAocHJlZml4KSB7XG4gICAgICBjb25zdCBwcmVmaXhEZXB0aCA9IHByZWZpeC5zcGxpdCgnLycpLmxlbmd0aCArIDE7XG4gICAgICBkaXJzID0gZGlycy5maWx0ZXIoZCA9PiBkLnBhdGguc3RhcnRzV2l0aChwcmVmaXggKyAnLycpICYmIGQuZGVwdGggPD0gcHJlZml4RGVwdGggKyAxKTtcbiAgICAgIC8vIFx1OTFDRFx1NjVCMFx1OEJBMVx1N0I5N1x1NzZGOFx1NUJGOVx1NkRGMVx1NUVBNlxuICAgICAgZGlycyA9IGRpcnMubWFwKGQgPT4gKHtcbiAgICAgICAgLi4uZCxcbiAgICAgICAgZGVwdGg6IGQuZGVwdGggLSBwcmVmaXhEZXB0aCArIDIsXG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFx1NjMwOSBtYXhEZXB0aCBcdTYyMkFcdTY1QURcbiAgICAgIGRpcnMgPSBkaXJzLmZpbHRlcihkID0+IGQuZGVwdGggPD0gbWF4RGVwdGgpO1xuICAgIH1cblxuICAgIHJldHVybiB7IG9rOiB0cnVlLCBkaXJzIH07XG4gIH07XG59XG5cbi8qKiBcdTVCRkNcdTUxRkFcdTUyMzdcdTY1QjBcdTdGMTNcdTVCNThcdUZGMDhcdTY1ODdcdTRFRjZcdTY0Q0RcdTRGNUNcdTU0MEVcdThDMDNcdTc1MjhcdUZGMDlcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZhbGlkYXRlVHJlZUNhY2hlKCk6IHZvaWQge1xuICBjYWNoZURpcnMgPSBbXTtcbiAgY2FjaGVUaW1lID0gMDtcbn1cbiIsICIvKipcbiAqIFBPU1QgL2ZldGNoIFx1MjAxNCBcdTk4REVcdTRFNjZcdTIxOTJPQiBcdTg0M0RcdTU3MzBcdTRFM0JcdTk0RkVcdThERUZcdTMwMDJcbiAqXG4gKiBcdTRGOURcdTYzNkUgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3Ni4xXHVGRjFBXG4gKiAxLiBsYXJrLWNsaSBkb2NzICtmZXRjaCAtLWRvYy1mb3JtYXQgbWFya2Rvd24gXHUyMTkyIFx1NkI2M1x1NjU4NyBtZFxuICogMi4gbGFyay1jbGkgZG9jcyArZmV0Y2ggLS1kb2MtZm9ybWF0IHhtbCAtLWRldGFpbCB3aXRoLWlkcyBcdTIxOTIgZmlsZV90b2tlbiBcdTUyMTdcdTg4NjggKyBjYWxsb3V0IFx1OTg5Q1x1ODI3MiArIGRvY3ggb2JqX3Rva2VuXG4gKiAzLiBcdTU2RkVcdTcyNDcgYXV0aGNvZGUgVVJMIFx1MjE5MiBmZWlzaHU6Ly9UT0tFTlxuICogNC4gZXhpc3RzIFx1NjhDMFx1NjdFNVx1RkYxQVx1NURGMlx1NjcwOVx1NTQwQyBmZWlzaHVfaWQgXHUyMTkyIFx1NjZGNFx1NjVCMFx1NTIwNlx1NjUyRlx1RkYxQlx1NjVFMCBcdTIxOTIgXHU2NUIwXHU1RUZBXG4gKiA1LiBcdTdFQzRcdTg4QzUgWUFNTFx1RkYwOGZlaXNodV9pZC9mZWlzaHVfZG9jX2lkL2ZlaXNodV90aXRsZS9zeW5jX3RpbWVcdUZGMDkrIFx1NkI2M1x1NjU4N1xuICogNi4gXHU2NTg3XHU0RUY2XHU1NDBEID0gXHU1Qjg5XHU1MTY4XHU2RTA1XHU2RDE3KGZlaXNodV90aXRsZSlcdUZGMENcdTUxOTlcdTUxNjUgZGlyXG4gKiA3LiBhdXRvLXJlbmFtZSBcdTg5RTZcdTUzRDFcdTdGMTZcdTc4MDEgXHUyMTkyIFx1NTE5OVx1NTZERVx1NjU4N1x1NEVGNlx1NTQwRCArIFlBTUwgXHU3RjE2XHU3ODAxXG4gKiA4LiBcdThCQTFcdTdCOTcgc3luY19oYXNoXHVGRjBDXHU1MTk5IHN5bmNfdGltZVxuICogOS4gXHU4RkQ0XHU1NkRFXHU4NDNEXHU1NzMwXHU4REVGXHU1Rjg0XG4gKi9cbmltcG9ydCB0eXBlIHsgRmV0Y2hSZXF1ZXN0LCBGZXRjaFJlc3BvbnNlIH0gZnJvbSAnQHN5bmMvc2hhcmVkJztcbmltcG9ydCB7IEFwcCwgVEZpbGUsIFRGb2xkZXIgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IFJlcXVlc3RDb250ZXh0IH0gZnJvbSAnLi4vc2VydmVyLmpzJztcbmltcG9ydCB0eXBlIHsgRmVpc2h1U3luY1NldHRpbmdzLCBQbHVnaW5TdGF0ZSB9IGZyb20gJy4uL3NldHRpbmdzLmpzJztcbmltcG9ydCB7IHJ1biwgZ2V0V2lraU5vZGVJbmZvIH0gZnJvbSAnLi4vbGFyay9jbGkuanMnO1xuaW1wb3J0IHtcbiAgZXh0cmFjdEltZ1Rva2Vuc0Zyb21YbWwsXG4gIGNvbnZlcnRGZWlzaHVDYWxsb3V0c1RvT0IsXG4gIGNhbGxvdXRYbWxUb01ldGEsXG59IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQge1xuICBwYXJzZUZpbGUsXG4gIGJ1aWxkSW5pdGlhbEZyb250bWF0dGVyLFxuICBtZXJnZUZyb250bWF0dGVyRm9yVXBkYXRlLFxuICBhc3NlbWJsZU1kLFxuICBwcm9jZXNzRmVpc2h1TWQsXG4gIG1ha2VGaWxlbmFtZSxcbiAgbWFrZVBhdGgsXG59IGZyb20gJy4uL2ZpbGVpby93cml0ZXIuanMnO1xuaW1wb3J0IHsgYXNzaWduRW5jb2RpbmcgfSBmcm9tICcuLi9hdXRvUmVuYW1lLmpzJztcbmltcG9ydCB7IGZpbmRVbmlxdWVWYXVsdEJpbmRpbmcgfSBmcm9tICcuLi92YXVsdEJpbmRpbmcuanMnO1xuaW1wb3J0IHsgbm9ybWFsaXplVmF1bHREaXIsIG5vcm1hbGl6ZVZhdWx0TWFya2Rvd25QYXRoIH0gZnJvbSAnLi4vdmF1bHRQYXRoLmpzJztcbmltcG9ydCB7IGFzc2VydFJlcGxhY2VtZW50QmluZGluZyB9IGZyb20gJy4uL2JpbmRpbmdJbmRleC5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmV0Y2hEZXBzIHtcbiAgYXBwOiBBcHA7XG4gIHNldHRpbmdzOiBGZWlzaHVTeW5jU2V0dGluZ3M7XG4gIHN0YXRlOiBQbHVnaW5TdGF0ZTtcbiAgbm90aWNlOiAobXNnOiBzdHJpbmcpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGZXRjaEhhbmRsZXIoZGVwczogRmV0Y2hEZXBzKSB7XG4gIHJldHVybiBhc3luYyAoY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8RmV0Y2hSZXNwb25zZT4gPT4ge1xuICAgIGNvbnN0IHJlcSA9IGN0eC5ib2R5IGFzIEZldGNoUmVxdWVzdDtcbiAgICBpZiAoIXJlcT8ubm9kZV90b2tlbikge1xuICAgICAgY29uc3QgZSA9IG5ldyBFcnJvcignbm9kZV90b2tlbiBpcyByZXF1aXJlZCcpIGFzIEVycm9yICYgeyBjb2RlOiBzdHJpbmc7IHN0YXR1czogbnVtYmVyIH07XG4gICAgICBlLmNvZGUgPSAnTUlTU0lOR19UT0tFTic7XG4gICAgICBlLnN0YXR1cyA9IDQwMDtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgY29uc3QgeyBub2RlX3Rva2VuLCBzcGFjZV9pZCwgZGlyIH0gPSByZXE7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBkZXBzLnNldHRpbmdzO1xuICAgIGNvbnN0IHRhcmdldERpciA9IG5vcm1hbGl6ZVZhdWx0RGlyKGRpciA/PyBzZXR0aW5ncy5kZWZhdWx0RGlyKTtcbiAgICBjb25zdCByZXBsYWNlUGF0aCA9IHJlcS5yZXBsYWNlX3BhdGhcbiAgICAgID8gbm9ybWFsaXplVmF1bHRNYXJrZG93blBhdGgocmVxLnJlcGxhY2VfcGF0aClcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgZGVwcy5ub3RpY2UoYFx1MkIwNyBcdTU0MENcdTZCNjVcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjMgJHtub2RlX3Rva2VuLnNsaWNlKDAsIDgpfS4uLmApO1xuXG4gICAgLy8gXHU2QjY1XHU5QUE0IDFcdUZGMUFcdTYyRkZcdTZCNjNcdTY1ODcgbWRcbiAgICBsZXQgbWQ6IHN0cmluZztcbiAgICB0cnkge1xuICAgICAgbWQgPSBydW4oXG4gICAgICAgIFsnZG9jcycsICcrZmV0Y2gnLCAnLS1kb2MnLCBub2RlX3Rva2VuLCAnLS1kb2MtZm9ybWF0JywgJ21hcmtkb3duJ10sXG4gICAgICAgIHsgdGltZW91dDogNjAwMDAgfSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAvLyBub2RlX3Rva2VuIFx1NTNFRlx1ODBGRFx1NjYyRiB3aWtpIG5vZGVcdUZGMENcdTk3MDBcdTUxNDhcdTg5RTNcdTY3OTBcdTRFM0Egb2JqX3Rva2VuXG4gICAgICBjb25zdCBpbmZvID0gc3BhY2VfaWQgPyBnZXRXaWtpTm9kZUluZm8obm9kZV90b2tlbiwgc3BhY2VfaWQpIDogbnVsbDtcbiAgICAgIGlmIChpbmZvPy5vYmpfdG9rZW4pIHtcbiAgICAgICAgbWQgPSBydW4oXG4gICAgICAgICAgWydkb2NzJywgJytmZXRjaCcsICctLWRvYycsIGluZm8ub2JqX3Rva2VuLCAnLS1kb2MtZm9ybWF0JywgJ21hcmtkb3duJ10sXG4gICAgICAgICAgeyB0aW1lb3V0OiA2MDAwMCB9LFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFx1NkI2NVx1OUFBNCAyXHVGRjFBXHU2MkZGIFhNTFx1RkYwOFx1NTZGRVx1NzI0NyB0b2tlbiArIGNhbGxvdXQgXHU5ODlDXHU4MjcyICsgZG9jeCBvYmpfdG9rZW5cdUZGMDlcbiAgICBsZXQgeG1sID0gJyc7XG4gICAgbGV0IG9ialRva2VuID0gcmVxLm9ial90b2tlbiA/PyAnJztcbiAgICB0cnkge1xuICAgICAgeG1sID0gcnVuKFxuICAgICAgICBbJ2RvY3MnLCAnK2ZldGNoJywgJy0tZG9jJywgbm9kZV90b2tlbiwgJy0tZG9jLWZvcm1hdCcsICd4bWwnLCAnLS1kZXRhaWwnLCAnd2l0aC1pZHMnXSxcbiAgICAgICAgeyB0aW1lb3V0OiA2MDAwMCB9LFxuICAgICAgKTtcbiAgICAgIGlmICghb2JqVG9rZW4pIHtcbiAgICAgICAgLy8gb2JqX3Rva2VuIFx1NTcyOCBYTUwgXHU3Njg0IDx0aXRsZSBpZD1cIi4uLlwiPiBcdTVDNUVcdTYwMjdcdTkxQ0NcdUZGMDhcdTg5RTNcdTUzMDVcdTU0MEVcdTc2ODRcdTdFQUYgWE1MIFx1NkNBMVx1NjcwOVx1NjYzRVx1NUYwRiBvYmpfdG9rZW4gXHU1QjU3XHU2QkI1XHVGRjA5XG4gICAgICAgIGNvbnN0IHRpdGxlSWRNYXRjaCA9IHhtbC5tYXRjaCgvPHRpdGxlW14+XSpcXGJpZD1cIihbQS1aYS16MC05XSspXCIvKTtcbiAgICAgICAgaWYgKHRpdGxlSWRNYXRjaCkgb2JqVG9rZW4gPSB0aXRsZUlkTWF0Y2hbMV07XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2ZldGNoXSB4bWwgZmV0Y2ggZmFpbGVkIChpbWFnZSB0b2tlbnMgbWF5IGJlIG1pc3NpbmcpOicsIGVycik7XG4gICAgfVxuXG4gICAgLy8gXHU2QjY1XHU5QUE0IDIuNVx1RkYxQVx1NEVDRVx1OThERVx1NEU2Nlx1NTkzNFx1OTBFOCBjYWxsb3V0IFx1ODlFM1x1Njc5MFx1NTE0M1x1NjU3MFx1NjM2RVx1RkYwOFx1NjgwN1x1N0I3RS9cdTdGMTZcdTc4MDEvXHU4RjkzXHU1MTY1L1x1NjVFNVx1NjcxRi9cdTUxNzNcdTk1MkVcdThCQ0QvXHU4QkM0XHU1MjA2L1x1N0QyMlx1NUYxNVx1RkYwOVxuICAgIC8vIFx1OEZEOVx1NEU5Qlx1NUI1N1x1NkJCNVx1NEYxQVx1NTE5OVx1OEZEQiBZQU1MIGZyb250bWF0dGVyXHVGRjFCXHU2QjYzXHU2NTg3IGNhbGxvdXQgXHU0RkREXHU3NTU5XHU0RTBEXHU1MkE4XHVGRjA4XHU2QjY1XHU5QUE0IDMuNSBcdThGNkMgT0IgY2FsbG91dFx1RkYwOVxuICAgIGNvbnN0IG1ldGEgPSB7XG4gICAgICAuLi4oeG1sID8gY2FsbG91dFhtbFRvTWV0YSh4bWwpIDoge30pLFxuICAgICAgLi4uKHJlcS5tZXRhID8/IHt9KSxcbiAgICB9O1xuICAgIGlmIChPYmplY3Qua2V5cyhtZXRhKS5sZW5ndGggPiAwKSB7XG4gICAgICBkZXBzLm5vdGljZShgXHVEODNEXHVEQ0NCIFx1NjNEMFx1NTNENlx1NTIzMCAke09iamVjdC5rZXlzKG1ldGEpLmxlbmd0aH0gXHU0RTJBXHU1MTQzXHU2NTcwXHU2MzZFXHU1QjU3XHU2QkI1YCk7XG4gICAgfVxuXG4gICAgLy8gXHU2QjY1XHU5QUE0IDNcdUZGMUFcdTU2RkVcdTcyNDcgdG9rZW4gXHUyMTkyIGZlaXNodTovLyBcdTUzNEZcdThCQUVcbiAgICBjb25zdCBpbWdUb2tlbnMgPSBuZXcgU2V0KGV4dHJhY3RJbWdUb2tlbnNGcm9tWG1sKHhtbCkpO1xuICAgIGxldCBwcm9jZXNzZWRNZCA9IHByb2Nlc3NGZWlzaHVNZChtZCwgaW1nVG9rZW5zKTtcblxuICAgIC8vIFx1NkI2NVx1OUFBNCAzLjVcdUZGMUFcdTk4REVcdTRFNjZcdTZCNjNcdTY1ODcgY2FsbG91dCBYTUwgXHUyMTkyIE9CIGNhbGxvdXRcbiAgICBpZiAoeG1sKSB7XG4gICAgICBwcm9jZXNzZWRNZCA9IGNvbnZlcnRGZWlzaHVDYWxsb3V0c1RvT0IocHJvY2Vzc2VkTWQpO1xuICAgIH1cblxuICAgIC8vIFx1NjNEMFx1NTNENlx1OThERVx1NEU2Nlx1NjgwN1x1OTg5OFx1RkYwOG1kIFx1N0IyQ1x1NEUwMFx1NEUyQSBIMVx1RkYwQ1x1NjIxNiBmYWxsYmFjayBcdTUyMzAgbm9kZSBcdTRGRTFcdTYwNkZcdUZGMDlcbiAgICBjb25zdCB0aXRsZU1hdGNoID0gcHJvY2Vzc2VkTWQubWF0Y2goL14jXFxzKyguKykkL20pO1xuICAgIGxldCBmZWlzaHVUaXRsZSA9IHRpdGxlTWF0Y2g/LlsxXT8udHJpbSgpID8/IG5vZGVfdG9rZW47XG4gICAgLy8gXHU1OTgyXHU2NzlDIG1kIFx1OTFDQ1x1NjcwOSBIMVx1RkYwQ1x1NEVDRVx1NkI2M1x1NjU4N1x1NTNCQlx1NjM4OVx1RkYwOE9CIFx1NjU4N1x1NEVGNiBIMSBcdTRGRERcdTc1NTlcdUZGMENcdTRGNDZcdTkwN0ZcdTUxNERcdTkxQ0RcdTU5MERcdTIwMTRcdTIwMTRcdThGRDlcdTkxQ0NcdTRGRERcdTc1NTkgSDEgXHU0RjVDXHU0RTNBXHU2QjYzXHU2NTg3XHU5OTk2XHU4ODRDXHVGRjA5XG4gICAgLy8gXHU1MUIzXHU3QjU2XHVGRjFBXHU0RkREXHU3NTU5IEgxXHVGRjBDXHU1NkUwXHU0RTNBIE9CIFx1NzY4NFx1NjU4N1x1NEVGNlx1NTQwRFx1NTQ4QyBIMSBcdTUzRUZcdTRFRTVcdTRFMERcdTU0MENcblxuICAgIC8vIFx1NkI2NVx1OUFBNCA0XHVGRjFBZXhpc3RzIFx1NjhDMFx1NjdFNVxuICAgIGNvbnN0IGV4aXN0aW5nRmlsZSA9IGF3YWl0IGZpbmRVbmlxdWVWYXVsdEJpbmRpbmcoZGVwcy5hcHAsIG5vZGVfdG9rZW4pO1xuICAgIGNvbnN0IHN5bmNUaW1lID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgIGxldCBhY3Rpb246ICdjcmVhdGVkJyB8ICd1cGRhdGVkJztcbiAgICBsZXQgZmluYWxQYXRoOiBzdHJpbmc7XG4gICAgbGV0IGVuY29kaW5nOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICBpZiAoZXhpc3RpbmdGaWxlKSB7XG4gICAgICAvLyBcdTY2RjRcdTY1QjBcdTUyMDZcdTY1MkZcdUZGMUFcdTRGRERcdTc1NTlcdTc1MjhcdTYyMzdcdTY1MzlcdTc2ODRcdTUxNDNcdTY1NzBcdTYzNkVcdUZGMENcdTUzRUFcdTUyMzdcdTZCNjNcdTY1ODcgKyBcdTdFRDFcdTVCOUFcdTVCNTdcdTZCQjVcbiAgICAgIGFjdGlvbiA9ICd1cGRhdGVkJztcbiAgICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgZGVwcy5hcHAudmF1bHQucmVhZChleGlzdGluZ0ZpbGUpO1xuICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VGaWxlKGV4aXN0aW5nKTtcbiAgICAgIGNvbnN0IG1lcmdlZCA9IG1lcmdlRnJvbnRtYXR0ZXJGb3JVcGRhdGUoXG4gICAgICAgIHBhcnNlZC5mcm9udG1hdHRlcixcbiAgICAgICAgbm9kZV90b2tlbixcbiAgICAgICAgb2JqVG9rZW4sXG4gICAgICAgIGZlaXNodVRpdGxlLFxuICAgICAgICBzeW5jVGltZSxcbiAgICAgICAgbWV0YSxcbiAgICAgICk7XG4gICAgICBjb25zdCBjb250ZW50ID0gYXNzZW1ibGVNZChtZXJnZWQsIHByb2Nlc3NlZE1kKTtcbiAgICAgIGF3YWl0IGRlcHMuYXBwLnZhdWx0Lm1vZGlmeShleGlzdGluZ0ZpbGUsIGNvbnRlbnQpO1xuICAgICAgZmluYWxQYXRoID0gZXhpc3RpbmdGaWxlLnBhdGg7XG4gICAgICBkZXBzLm5vdGljZShgXHUyNzBGIFx1NURGMlx1NjZGNFx1NjVCMCAke2V4aXN0aW5nRmlsZS5uYW1lfWApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBcdTY1QjBcdTVFRkFcdTUyMDZcdTY1MkZcbiAgICAgIGFjdGlvbiA9ICdjcmVhdGVkJztcbiAgICAgIGNvbnN0IGZpbGVuYW1lID0gbWFrZUZpbGVuYW1lKGZlaXNodVRpdGxlLCByZXEuZmlsZW5hbWUpO1xuICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gbWFrZVBhdGgodGFyZ2V0RGlyLCBmaWxlbmFtZSk7XG5cbiAgICAgIC8vIFx1Nzg2RVx1NEZERFx1NzZFRVx1NUY1NVx1NUI1OFx1NTcyOFxuICAgICAgYXdhaXQgZW5zdXJlRm9sZGVyKGRlcHMuYXBwLCB0YXJnZXREaXIpO1xuXG4gICAgICBjb25zdCBmbSA9IGJ1aWxkSW5pdGlhbEZyb250bWF0dGVyKG5vZGVfdG9rZW4sIG9ialRva2VuLCBmZWlzaHVUaXRsZSwgc3luY1RpbWUsIG1ldGEpO1xuICAgICAgY29uc3QgY29udGVudCA9IGFzc2VtYmxlTWQoZm0sIHByb2Nlc3NlZE1kKTtcblxuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NTg3XHU0RUY2XHU2NjJGXHU1NDI2XHU1REYyXHU1QjU4XHU1NzI4XHVGRjA4XHU1NDBDXHU1NDBEXHU0RTBEXHU1NDBDIGZlaXNodV9pZFx1RkYwOVxuICAgICAgY29uc3QgcmVwbGFjZUZpbGUgPSByZXBsYWNlUGF0aFxuICAgICAgICA/IGRlcHMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChyZXBsYWNlUGF0aClcbiAgICAgICAgOiBudWxsO1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBkZXBzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocmVsYXRpdmVQYXRoKTtcbiAgICAgIGlmIChyZXBsYWNlRmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgIGNvbnN0IHJlcGxhY2VtZW50Q29udGVudCA9IGF3YWl0IGRlcHMuYXBwLnZhdWx0LnJlYWQocmVwbGFjZUZpbGUpO1xuICAgICAgICBhc3NlcnRSZXBsYWNlbWVudEJpbmRpbmcocmVwbGFjZW1lbnRDb250ZW50LCBub2RlX3Rva2VuLCByZXBsYWNlRmlsZS5wYXRoKTtcbiAgICAgICAgYXdhaXQgZGVwcy5hcHAudmF1bHQubW9kaWZ5KHJlcGxhY2VGaWxlLCBjb250ZW50KTtcbiAgICAgICAgZmluYWxQYXRoID0gcmVwbGFjZUZpbGUucGF0aDtcbiAgICAgICAgYWN0aW9uID0gJ3VwZGF0ZWQnO1xuICAgICAgfSBlbHNlIGlmIChleGlzdGluZyBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgIC8vIFx1NTQwQ1x1NTQwRFx1NTFCMlx1N0E4MVx1RkYxQVx1NTJBMFx1NTQwRVx1N0YwMFxuICAgICAgICBjb25zdCBjb25mbGljdFBhdGggPSBtYWtlUGF0aCh0YXJnZXREaXIsIGAke2ZpbGVuYW1lLnJlcGxhY2UoL1xcLm1kJC8sICcnKX0tJHtub2RlX3Rva2VuLnNsaWNlKDAsIDYpfS5tZGApO1xuICAgICAgICBhd2FpdCBkZXBzLmFwcC52YXVsdC5jcmVhdGUoY29uZmxpY3RQYXRoLCBjb250ZW50KTtcbiAgICAgICAgZmluYWxQYXRoID0gY29uZmxpY3RQYXRoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgY3JlYXRlZCA9IGF3YWl0IGRlcHMuYXBwLnZhdWx0LmNyZWF0ZShyZWxhdGl2ZVBhdGgsIGNvbnRlbnQpO1xuICAgICAgICBmaW5hbFBhdGggPSBjcmVhdGVkLnBhdGg7XG4gICAgICB9XG5cbiAgICAgIGRlcHMubm90aWNlKGBcdTI3MDUgXHU1REYyXHU1MjFCXHU1RUZBICR7ZmlsZW5hbWV9YCk7XG5cbiAgICAgIC8vIFx1NkI2NVx1OUFBNCA3XHVGRjFBYXV0by1yZW5hbWUgXHU3RjE2XHU3ODAxXHU1MjA2XHU5MTREXG4gICAgICBpZiAoc2V0dGluZ3MuYXV0b1JlbmFtZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGVuY29kaW5nID0gYXdhaXQgYXNzaWduRW5jb2RpbmcoZGVwcy5hcHAsIGZpbmFsUGF0aCwgdGFyZ2V0RGlyKTtcbiAgICAgICAgICBpZiAoZW5jb2RpbmcpIHtcbiAgICAgICAgICAgIGRlcHMubm90aWNlKGBcdUQ4M0RcdUREMjIgXHU3RjE2XHU3ODAxXHVGRjFBJHtlbmNvZGluZ31gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGNvbnNvbGUud2FybignW3N5bmMvZmV0Y2hdIGF1dG8tcmVuYW1lIGZhaWxlZDonLCBlcnIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gXHU4QkIwXHU1RjU1XHU2NzAwXHU4RkQxXHU1NDBDXHU2QjY1XG4gICAgZGVwcy5zdGF0ZS5yZWNlbnRTeW5jcy51bnNoaWZ0KHtcbiAgICAgIHRpbWU6IHN5bmNUaW1lLFxuICAgICAgbm9kZV90b2tlbixcbiAgICAgIHRpdGxlOiBmZWlzaHVUaXRsZSxcbiAgICAgIHBhdGg6IGZpbmFsUGF0aCxcbiAgICAgIGFjdGlvbixcbiAgICB9KTtcbiAgICBpZiAoZGVwcy5zdGF0ZS5yZWNlbnRTeW5jcy5sZW5ndGggPiA1MCkge1xuICAgICAgZGVwcy5zdGF0ZS5yZWNlbnRTeW5jcyA9IGRlcHMuc3RhdGUucmVjZW50U3luY3Muc2xpY2UoMCwgNTApO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBvazogdHJ1ZSxcbiAgICAgIHBhdGg6IGZpbmFsUGF0aCxcbiAgICAgIGZpbGVuYW1lOiBmaW5hbFBhdGguc3BsaXQoJy8nKS5wb3AoKSA/PyAnJyxcbiAgICAgIGFjdGlvbixcbiAgICAgIFx1N0YxNlx1NzgwMTogZW5jb2RpbmcsXG4gICAgICBmZWlzaHVfdGl0bGU6IGZlaXNodVRpdGxlLFxuICAgIH07XG4gIH07XG59XG5cbi8qKlxuICogXHU3ODZFXHU0RkREXHU3NkVFXHU1RjU1XHU1QjU4XHU1NzI4XHVGRjA4XHU5MDEyXHU1RjUyXHU1MjFCXHU1RUZBXHVGRjA5XHUzMDAyXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGVuc3VyZUZvbGRlcihhcHA6IEFwcCwgZGlyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKCFkaXIgfHwgZGlyID09PSAnLicgfHwgZGlyID09PSAnLycpIHJldHVybjtcbiAgY29uc3QgZXhpc3RpbmcgPSBhcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGRpcik7XG4gIGlmIChleGlzdGluZyBpbnN0YW5jZW9mIFRGb2xkZXIpIHJldHVybjtcbiAgdHJ5IHtcbiAgICBhd2FpdCBhcHAudmF1bHQuY3JlYXRlRm9sZGVyKGRpcik7XG4gIH0gY2F0Y2gge1xuICAgIC8vIFx1NTNFRlx1ODBGRFx1NzIzNlx1NzZFRVx1NUY1NVx1NEU1Rlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1OTAxMlx1NUY1MlxuICAgIGNvbnN0IHBhcmVudCA9IGRpci5zcGxpdCgnLycpLnNsaWNlKDAsIC0xKS5qb2luKCcvJyk7XG4gICAgaWYgKHBhcmVudCkgYXdhaXQgZW5zdXJlRm9sZGVyKGFwcCwgcGFyZW50KTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihkaXIpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gXHU1REYyXHU1QjU4XHU1NzI4XHU2MjE2XHU1MTc2XHU0RUQ2XHU5NTE5XHU4QkVGXHVGRjBDXHU1RkZEXHU3NTY1XG4gICAgfVxuICB9XG59XG4iLCAiLyoqXG4gKiBcdTY1ODdcdTRFRjYgSU9cdUZGMUFcdThCRkJcdTUxOTkgdmF1bHQgXHU0RTJEXHU3Njg0IC5tZCBcdTY1ODdcdTRFRjZcdTMwMDJcbiAqIFx1NEY5RFx1NjM2RVx1NjVCOVx1Njg0OCBcdTAwQTc2XHVGRjA4XHU1MTczXHU5NTJFXHU2RDQxXHU3QTBCXHVGRjA5KyBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGBcdTMwMDJcbiAqXG4gKiAtIHJlYWRlclx1RkYxQVx1ODlFM1x1Njc5MCBmcm9udG1hdHRlciArIGJvZHlcdUZGMENcdThCQTFcdTdCOTcgaGFzaFx1RkYwQ1x1NkJENFx1NUJGOSBzeW5jX2hhc2hcbiAqIC0gd3JpdGVyXHVGRjFBXHU3RUM0XHU4OEM1IFlBTUwgKyBib2R5XHVGRjBDXHU1MTk5XHU2NTg3XHU0RUY2XG4gKi9cbmltcG9ydCB7XG4gIHBhcnNlRnJvbnRtYXR0ZXIsXG4gIGFzc2VtYmxlRmlsZSxcbiAgYm9keUhhc2gsXG4gIGlzQ2hhbmdlZCxcbiAgc2FuaXRpemVGaWxlbmFtZSxcbiAgd2l0aE1kRXh0LFxuICBqb2luUGF0aCxcbiAgcmV3cml0ZUltYWdlc1RvRmVpc2h1UHJvdG8sXG4gIHR5cGUgWUFNTEZyb250bWF0dGVyLFxufSBmcm9tICdAc3luYy9zaGFyZWQnO1xuXG4vKiogXHU4QkZCXHU2NTg3XHU0RUY2XHU3RUQzXHU2NzlDXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFBhcnNlZEZpbGUge1xuICAvKiogXHU1QjhDXHU2NTc0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XHUzMDAyICovXG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgLyoqIGZyb250bWF0dGVyXHVGRjA4XHU2NUUwXHU1MjE5XHU0RTNBXHU3QTdBXHU1QkY5XHU4QzYxXHVGRjA5XHUzMDAyICovXG4gIGZyb250bWF0dGVyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgLyoqIFx1NkI2M1x1NjU4N1x1RkYwOFx1NEUwRFx1NTQyQiBmcm9udG1hdHRlclx1RkYwOVx1MzAwMiAqL1xuICBib2R5OiBzdHJpbmc7XG4gIC8qKiBcdTZCNjNcdTY1ODcgaGFzaFx1RkYwOHNoYTI1NiBoZXhcdUZGMDlcdTMwMDIgKi9cbiAgaGFzaDogc3RyaW5nO1xufVxuXG4vKipcbiAqIFx1NEVDRVx1NUI4Q1x1NjU3NFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVx1ODlFM1x1Njc5MFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGaWxlKGNvbnRlbnQ6IHN0cmluZyk6IFBhcnNlZEZpbGUge1xuICBjb25zdCB7IGZyb250bWF0dGVyLCBib2R5IH0gPSBwYXJzZUZyb250bWF0dGVyKGNvbnRlbnQpO1xuICBjb25zdCBoYXNoID0gYm9keUhhc2goYm9keSk7XG4gIHJldHVybiB7XG4gICAgY29udGVudCxcbiAgICBmcm9udG1hdHRlcjogZnJvbnRtYXR0ZXIgPz8ge30sXG4gICAgYm9keSxcbiAgICBoYXNoLFxuICB9O1xufVxuXG4vKipcbiAqIFx1NjhDMFx1NkQ0Qlx1NTE4NVx1NUJCOVx1NjYyRlx1NTQyNlx1NzZGOFx1NUJGOVx1NEUwQVx1NkIyMVx1NTQwQ1x1NkI2NVx1NTNEMVx1NzUxRlx1NTNEOFx1NTMxNlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzQ29udGVudENoYW5nZWQocGFyc2VkOiBQYXJzZWRGaWxlKTogYm9vbGVhbiB7XG4gIHJldHVybiBpc0NoYW5nZWQocGFyc2VkLmhhc2gsIHBhcnNlZC5mcm9udG1hdHRlci5zeW5jX2hhc2ggYXMgc3RyaW5nIHwgdW5kZWZpbmVkKTtcbn1cblxuLyoqXG4gKiBcdTdFQzRcdTg4QzVcdTY1QjBcdTY1ODdcdTRFRjZcdTc2ODQgZnJvbnRtYXR0ZXJcdUZGMDhcdTk4REVcdTRFNjZcdTIxOTJPQiBcdTk5OTZcdTZCMjFcdTg0M0RcdTU3MzBcdUZGMDlcdTMwMDJcbiAqIEBwYXJhbSBtZXRhIFx1NEVDRVx1OThERVx1NEU2NiBjYWxsb3V0IFx1ODlFM1x1Njc5MFx1NTFGQVx1NzY4NFx1NTE0M1x1NjU3MFx1NjM2RVx1RkYwOFx1NjgwN1x1N0I3RS9cdTdGMTZcdTc4MDEvXHU4RjkzXHU1MTY1L1x1NjVFNVx1NjcxRi9cdTUxNzNcdTk1MkVcdThCQ0QvXHU4QkM0XHU1MjA2L1x1N0QyMlx1NUYxNVx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRJbml0aWFsRnJvbnRtYXR0ZXIoXG4gIGZlaXNodUlkOiBzdHJpbmcsXG4gIGZlaXNodURvY0lkOiBzdHJpbmcsXG4gIGZlaXNodVRpdGxlOiBzdHJpbmcsXG4gIHN5bmNUaW1lOiBzdHJpbmcsXG4gIG1ldGE/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFlBTUxGcm9udG1hdHRlciB7XG4gIHJldHVybiB7XG4gICAgZmVpc2h1X2lkOiBmZWlzaHVJZCxcbiAgICBmZWlzaHVfZG9jX2lkOiBmZWlzaHVEb2NJZCxcbiAgICBmZWlzaHVfdGl0bGU6IGZlaXNodVRpdGxlLFxuICAgIHN5bmNfdGltZTogc3luY1RpbWUsXG4gICAgLy8gXHU5OERFXHU0RTY2IGNhbGxvdXQgXHU1MTQzXHU2NTcwXHU2MzZFXHVGRjA4XHU3QTdBXHU1MDNDXHU1QjU3XHU2QkI1XHU0RTBEXHU1MTk5XHU1MTY1XHVGRjBDXHU0RkREXHU2MzAxIFlBTUwgXHU1RTcyXHU1MUMwXHVGRjA5XG4gICAgLi4uKG1ldGEgJiYgc3RyaXBFbXB0eShtZXRhKSksXG4gICAgLy8gc3luY19oYXNoIFx1NTcyOFx1NTE5OVx1NTE2NVx1NjVGNlx1NzUzMSB3cml0ZXIgXHU4QkExXHU3Qjk3XHU1ODZCXHU1MTY1XG4gIH07XG59XG5cbi8qKlxuICogXHU1NDA4XHU1RTc2XHU2NkY0XHU2NUIwXHU1REYyXHU2NzA5XHU2NTg3XHU0RUY2XHU3Njg0IGZyb250bWF0dGVyXHVGRjA4XHU0RkREXHU3NTU5XHU3NTI4XHU2MjM3XHU2NTM5XHU3Njg0XHU1MTQzXHU2NTcwXHU2MzZFXHU1QjU3XHU2QkI1XHVGRjA5XHUzMDAyXG4gKiBcdTUzRUFcdTUyMzdcdTU0MENcdTZCNjVcdTdFRDFcdTVCOUFcdTdFQzRcdUZGMDhmZWlzaHVfKiAvIHN5bmNfKlx1RkYwOVx1RkYwQ1x1NEZERFx1NzU1OSBcdTY4MDdcdTdCN0UvXHU3RjE2XHU3ODAxL1x1OEY5M1x1NTE2NS9cdTY1RTVcdTY3MUYvXHU1MTczXHU5NTJFXHU4QkNEL1x1OEJDNFx1NTIwNi9cdTdEMjJcdTVGMTUgXHU3QjQ5XHU3NTI4XHU2MjM3XHU1QjU3XHU2QkI1XHUzMDAyXG4gKlxuICogXHU2Q0U4XHU2MTBGXHVGRjFBXHU1REYyXHU2NzA5XHU1QjU3XHU2QkI1XHU0RjE4XHU1MTQ4XHVGRjA4XHU3NTI4XHU2MjM3XHU1NzI4IE9CIFx1OTFDQ1x1NjUzOVx1OEZDN1x1NzY4NFx1RkYwOVx1RkYwQ1x1OThERVx1NEU2Nlx1NEZBNyBjYWxsb3V0IFx1NTE0M1x1NjU3MFx1NjM2RVx1NEVDNVx1NTcyOFx1NUI1N1x1NkJCNVx1N0YzQVx1NTkzMVx1NjVGNlx1ODg2NVx1OUY1MFx1MzAwMlxuICogXHU4RkQ5XHU2ODM3XHU5MDdGXHU1MTREXHU5OERFXHU0RTY2XHU0RkE3XHU3Njg0XHU2NUU3IGNhbGxvdXQgXHU4OTg2XHU3NkQ2IE9CIFx1OTFDQ1x1NzY4NFx1NjcwMFx1NjVCMFx1NjU3NFx1NzQwNlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VGcm9udG1hdHRlckZvclVwZGF0ZShcbiAgZXhpc3Rpbmc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuICBmZWlzaHVJZDogc3RyaW5nLFxuICBmZWlzaHVEb2NJZDogc3RyaW5nLFxuICBmZWlzaHVUaXRsZTogc3RyaW5nLFxuICBzeW5jVGltZTogc3RyaW5nLFxuICBtZXRhPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4pOiBZQU1MRnJvbnRtYXR0ZXIge1xuICByZXR1cm4ge1xuICAgIC8vIFx1NURGMlx1NjcwOVx1NUI1N1x1NkJCNVx1NEYxOFx1NTE0OFx1RkYwOFx1NzUyOFx1NjIzN1x1NjUzOVx1OEZDN1x1NzY4NFx1RkYwOVx1RkYwQ1x1OThERVx1NEU2NiBjYWxsb3V0IFx1NTE0M1x1NjU3MFx1NjM2RVx1NTNFQVx1ODg2NVx1N0YzQVx1NTkzMVxuICAgIC4uLihtZXRhICYmIHN0cmlwRW1wdHkobWV0YSkpLFxuICAgIC4uLmV4aXN0aW5nLFxuICAgIGZlaXNodV9pZDogZmVpc2h1SWQsXG4gICAgZmVpc2h1X2RvY19pZDogZmVpc2h1RG9jSWQsXG4gICAgZmVpc2h1X3RpdGxlOiBmZWlzaHVUaXRsZSxcbiAgICBzeW5jX3RpbWU6IHN5bmNUaW1lLFxuICB9IGFzIFlBTUxGcm9udG1hdHRlcjtcbn1cblxuLyoqIFx1NzlGQlx1OTY2NFx1NTAzQ1x1NEUzQVx1N0E3QVx1RkYwOHVuZGVmaW5lZC9udWxsLycnL1x1N0E3QVx1NjU3MFx1N0VDNFx1RkYwOVx1NzY4NFx1NUI1N1x1NkJCNVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NkM2MVx1NjdEMyBZQU1MXHUzMDAyICovXG5mdW5jdGlvbiBzdHJpcEVtcHR5KG9iajogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gIGNvbnN0IG91dDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcbiAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMob2JqKSkge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gbnVsbCB8fCB2ID09PSAnJykgY29udGludWU7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodikgJiYgdi5sZW5ndGggPT09IDApIGNvbnRpbnVlO1xuICAgIG91dFtrXSA9IHY7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBcdTdFQzRcdTg4QzVcdTY3MDBcdTdFQzhcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcdUZGMDhZQU1MICsgXHU2QjYzXHU2NTg3ICsgaGFzaFx1RkYwOVx1MzAwMlxuICogQHBhcmFtIGZyb250bWF0dGVyIFx1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QSArIFx1NzUyOFx1NjIzN1x1NTE0M1x1NjU3MFx1NjM2RVxuICogQHBhcmFtIGJvZHkgXHU2QjYzXHU2NTg3IG1kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlbWJsZU1kKGZyb250bWF0dGVyOiBZQU1MRnJvbnRtYXR0ZXIsIGJvZHk6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIFx1OEJBMVx1N0I5N1x1NUU3Nlx1NTE5OVx1NTE2NSBzeW5jX2hhc2hcbiAgY29uc3QgaGFzaCA9IGJvZHlIYXNoKGJvZHkpO1xuICBjb25zdCBmbVdpdGhIYXNoOiBZQU1MRnJvbnRtYXR0ZXIgPSB7XG4gICAgLi4uZnJvbnRtYXR0ZXIsXG4gICAgc3luY19oYXNoOiBoYXNoLFxuICB9O1xuICByZXR1cm4gYXNzZW1ibGVGaWxlKGZtV2l0aEhhc2gsIGJvZHkpO1xufVxuXG4vKipcbiAqIFx1NjI4QVx1OThERVx1NEU2Nlx1NUJGQ1x1NTFGQVx1NzY4NCBtZCBcdTU5MDRcdTc0MDZcdTRFM0EgT0IgXHU2QjYzXHU2NTg3XHUzMDAyXG4gKiAtIFx1NTZGRVx1NzI0NyBhdXRoY29kZSBVUkwgXHUyMTkyIGZlaXNodTovL1RPS0VOXG4gKiAtIFx1NjgwN1x1OTg5OFx1ODg0Q1x1NTNCQlx1NjM4OVx1RkYwOFx1NjgwN1x1OTg5OFx1NURGMlx1NTcyOCBmcm9udG1hdHRlci5mZWlzaHVfdGl0bGVcdUZGMENPQiBcdTkxQ0MgSDEgXHU0RkREXHU3NTU5XHU0RjQ2XHU5OERFXHU0RTY2XHU0RkE3XHU3NTMxIG9iaiBcdTU5MDRcdTc0MDZcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NGZWlzaHVNZChtZDogc3RyaW5nLCBpbWdUb2tlbnM6IFNldDxzdHJpbmc+KTogc3RyaW5nIHtcbiAgcmV0dXJuIHJld3JpdGVJbWFnZXNUb0ZlaXNodVByb3RvKG1kLCBpbWdUb2tlbnMpO1xufVxuXG4vKipcbiAqIFx1NzUxRlx1NjIxMFx1ODQzRFx1NTczMFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NUI4OVx1NTE2OFx1NkUwNVx1NkQxN1x1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUZpbGVuYW1lKGZlaXNodVRpdGxlOiBzdHJpbmcsIG92ZXJyaWRlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbmFtZSA9IG92ZXJyaWRlID8gc2FuaXRpemVGaWxlbmFtZShvdmVycmlkZSkgOiBzYW5pdGl6ZUZpbGVuYW1lKGZlaXNodVRpdGxlKTtcbiAgcmV0dXJuIHdpdGhNZEV4dChuYW1lKTtcbn1cblxuLyoqXG4gKiBcdTYyRkNcdTYzQTVcdTg0M0RcdTU3MzBcdThERUZcdTVGODRcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1ha2VQYXRoKGRpcjogc3RyaW5nIHwgdW5kZWZpbmVkLCBmaWxlbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGpvaW5QYXRoKGRpciwgZmlsZW5hbWUpO1xufVxuIiwgIi8qKlxuICogYXV0by1yZW5hbWUgXHU3RjE2XHU3ODAxXHU1MjA2XHU5MTREXHUzMDAyXHU0RjlEXHU2MzZFIGAyNl8wNTA5X1NfMDhfYTRiMTAgXHU0RTA5XHU3OUNEXHU3RjE2XHU3ODAxXHU2QTIxXHU1RjBGXHU1QjlFXHU3M0IwXHU4QkY0XHU2NjBFLm1kYFxuICogKyBgXHU3N0U1XHU4QkM2XHU1RTkzXHU4MUVBXHU1MkE4XHU2MjUzXHU2ODA3XHU1MzRGXHU4QkFFXHU4RkI5XHU3NTRDLm1kYCArIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYCBcdTAwQTcyLjNcdTMwMDJcbiAqXG4gKiBcdTdGMTZcdTc4MDFcdTY4M0NcdTVGMEZcdUZGMUFZWV9NTUREX1x1NjgwN1x1N0I3RV9cdTVFOEZcdTUzRjdbX1x1NUI1MFx1NUU4Rlx1NTNGN11cbiAqICAgLSBcdTY1ODdcdTRFRjZcdUZGMUFcdTgyMTJcdTVDNTVcdTU3OEIgU18wMVx1RkYwOFx1NjgwN1x1N0I3RV9cdTVFOEZcdTUzRjcgXHU3NTI4XHU0RTBCXHU1MjEyXHU3RUJGXHVGRjA5XG4gKiAgIC0gXHU2NTg3XHU0RUY2XHU1OTM5XHVGRjFBXHU3RDI3XHU1MUQxXHU1NzhCIFMwMVx1RkYwOFx1NjgwN1x1N0I3RVx1NUU4Rlx1NTNGNyBcdTY1RTBcdTRFMEJcdTUyMTJcdTdFQkZcdUZGMDlcbiAqXG4gKiBcdTY4MDdcdTdCN0VcdTRGNTNcdTdDRkJcdUZGMDg2IFx1N0M3Qlx1RkYwQ1x1NTQyQlx1ODg2NVx1NTE2OFx1NzY4NCBRIFx1NzA3NVx1NkMxNFx1RkYwOVx1RkYxQVxuICogICBTPVx1NjUzNlx1OTZDNiAgWD1cdTk4NzlcdTc2RUUgIEw9XHU5ODg2XHU1N0RGICBaPVx1OEQ0NFx1NkU5MCAgUT1cdTcwNzVcdTYxMUYgIEo9XHU2MjgwXHU4MEZEXG4gKlxuICogXHU4OUU2XHU1M0QxXHVGRjFBZmV0Y2ggXHU4NDNEXHU1NzMwXHU1NDBFXHUzMDAxXHU1M0YzXHU5NTJFXHU4M0RDXHU1MzU1XHUzMDAxcmliYm9uIFx1NjI3OVx1OTFDRlx1MzAwMlxuICovXG5pbXBvcnQgeyBURmlsZSwgVEZvbGRlciwgdHlwZSBBcHAgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBwYXJzZUZyb250bWF0dGVyLCBhc3NlbWJsZUZpbGUsIHR5cGUgVGFnIH0gZnJvbSAnQHN5bmMvc2hhcmVkJztcblxuLyoqIFx1NjgwN1x1N0I3RSBcdTIxOTIgXHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0XHVGRjA4XHU0RjlEXHU2MzZFIDAxX1x1NUJGOVx1NkJENFx1NjJBNVx1NTQ0QS5tZCBcdTc2ODRcdTc2RUVcdTVGNTVcdThERUZcdTc1MzFcdTg5QzRcdTUyMTlcdUZGMDlcdTMwMDIgKi9cbmNvbnN0IFRBR19CWV9ESVJfSElOVDogUmVjb3JkPHN0cmluZywgVGFnPiA9IHtcbiAgJzBcdUZFMEZcdTIwRTNcdThGOTNcdTUxNjUnOiAnUycsXG4gICcxXHVGRTBGXHUyMEUzXHU4RjkzXHU1MUZBJzogJ1gnLFxuICAnMlx1RkUwRlx1MjBFM1x1RDgzRFx1RERDM1x1NzdFNVx1OEJDNlx1NkM2MCc6ICdaJyxcbn07XG5cbi8qKiBcdTdGMTZcdTc4MDFcdTZCNjNcdTUyMTlcdUZGMUFZWV9NTUREX1RfTk5bX2FOXVx1MzAwMiAqL1xuY29uc3QgQ09ERV9SRSA9IC9eKFxcZHsyfSlfKFxcZHs0fSlfKFtTWFNMWlFKXSlfKFxcZCspKD86XyhbYS16XVxcZCspKT8kLztcblxuLyoqXG4gKiBcdTRFQ0VcdTY1ODdcdTRFRjZcdTYyNDBcdTU3MjhcdTc2RUVcdTVGNTVcdTYzQThcdTVCRkNcdTY4MDdcdTdCN0VcdTMwMDJcbiAqIFx1NEYxOFx1NTE0OFx1N0VBN1x1RkYxQVlBTUwgXHU2ODA3XHU3QjdFXHU1QjU3XHU2QkI1ID4gXHU3NkVFXHU1RjU1XHU1MjREXHU3RjAwID4gXHU5RUQ4XHU4QkE0IFNcdTMwMDJcbiAqL1xuZnVuY3Rpb24gaW5mZXJUYWcoZGlyOiBzdHJpbmcsIGV4aXN0aW5nVGFnPzogVGFnKTogVGFnIHtcbiAgaWYgKGV4aXN0aW5nVGFnICYmIFsnUycsICdYJywgJ0wnLCAnWicsICdRJywgJ0onXS5pbmNsdWRlcyhleGlzdGluZ1RhZykpIHtcbiAgICByZXR1cm4gZXhpc3RpbmdUYWc7XG4gIH1cbiAgZm9yIChjb25zdCBbZGlySGludCwgdGFnXSBvZiBPYmplY3QuZW50cmllcyhUQUdfQllfRElSX0hJTlQpKSB7XG4gICAgaWYgKGRpci5zdGFydHNXaXRoKGRpckhpbnQpKSByZXR1cm4gdGFnO1xuICB9XG4gIC8vIFx1NzdFNVx1OEJDNlx1NkM2MFx1NEUwQlx1NzY4NFx1NUI1MFx1NzZFRVx1NUY1NVx1NTNFRlx1ODBGRFx1OEZEQlx1NEUwMFx1NkI2NVx1N0VDNlx1NTIwNlxuICBpZiAoZGlyLmluY2x1ZGVzKCdcdTc3RTVcdThCQzZcdTZDNjAnKSB8fCBkaXIuaW5jbHVkZXMoJ1x1RDgzRFx1RERDMycpKSB7XG4gICAgLy8gXHU4RDQ0XHU2RTkwXHU3QzdCXHU5RUQ4XHU4QkE0IFpcdUZGMENcdTUzRUZcdTg4QUJcdTc2RUVcdTVGNTVcdTU0MERcdTg5ODZcdTc2RDZcbiAgICBpZiAoZGlyLmluY2x1ZGVzKCdMJykgfHwgZGlyLmluY2x1ZGVzKCdcdTk4ODZcdTU3REYnKSkgcmV0dXJuICdMJztcbiAgICBpZiAoZGlyLmluY2x1ZGVzKCdRJykgfHwgZGlyLmluY2x1ZGVzKCdcdTcwNzVcdTYxMUYnKSkgcmV0dXJuICdRJztcbiAgICBpZiAoZGlyLmluY2x1ZGVzKCdKJykgfHwgZGlyLmluY2x1ZGVzKCdcdTYyODBcdTgwRkQnKSkgcmV0dXJuICdKJztcbiAgICByZXR1cm4gJ1onO1xuICB9XG4gIGlmIChkaXIuaW5jbHVkZXMoJ1x1OEY5M1x1NTFGQScpIHx8IGRpci5pbmNsdWRlcygnMVx1RkUwRlx1MjBFMycpKSByZXR1cm4gJ1gnO1xuICBpZiAoZGlyLmluY2x1ZGVzKCdcdThGOTNcdTUxNjUnKSB8fCBkaXIuaW5jbHVkZXMoJzBcdUZFMEZcdTIwRTMnKSkgcmV0dXJuICdTJztcbiAgcmV0dXJuICdTJztcbn1cblxuLyoqXG4gKiBcdTYyNkJcdTYzQ0ZcdTU0MENcdTc2RUVcdTVGNTVcdTRFMEJcdTU0MENcdTY4MDdcdTdCN0VcdTc2ODRcdTY3MDBcdTU5MjdcdTVFOEZcdTUzRjdcdUZGMENcdTUyMDZcdTkxNERcdTY1QjBcdTVFOEZcdTUzRjdcdTMwMDJcbiAqL1xuYXN5bmMgZnVuY3Rpb24gbmV4dFNlcXVlbmNlKGFwcDogQXBwLCBkaXI6IHN0cmluZywgdGFnOiBUYWcpOiBQcm9taXNlPG51bWJlcj4ge1xuICBjb25zdCBmb2xkZXIgPSBhcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGRpcik7XG4gIGlmICghKGZvbGRlciBpbnN0YW5jZW9mIFRGb2xkZXIpKSByZXR1cm4gMTtcblxuICBsZXQgbWF4U2VxID0gMDtcbiAgZm9yIChjb25zdCBjaGlsZCBvZiBmb2xkZXIuY2hpbGRyZW4pIHtcbiAgICBpZiAoIShjaGlsZCBpbnN0YW5jZW9mIFRGaWxlKSB8fCAhY2hpbGQubmFtZS5lbmRzV2l0aCgnLm1kJykpIGNvbnRpbnVlO1xuICAgIGNvbnN0IG1hdGNoID0gY2hpbGQubmFtZS5tYXRjaChDT0RFX1JFKTtcbiAgICBpZiAobWF0Y2ggJiYgbWF0Y2hbM10gPT09IHRhZykge1xuICAgICAgY29uc3Qgc2VxID0gcGFyc2VJbnQobWF0Y2hbNF0sIDEwKTtcbiAgICAgIGlmIChzZXEgPiBtYXhTZXEpIG1heFNlcSA9IHNlcTtcbiAgICB9XG4gICAgLy8gXHU0RTVGXHU1MzM5XHU5MTREXHU2NUUwXHU1MjREXHU3RjAwXHU0RjQ2XHU2NzA5IFlBTUwgXHU3RjE2XHU3ODAxXHU3Njg0XHU2MEM1XHU1MUI1XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGFwcC52YXVsdC5yZWFkKGNoaWxkKTtcbiAgICAgICAgY29uc3QgeyBmcm9udG1hdHRlciB9ID0gcGFyc2VGcm9udG1hdHRlcihjb250ZW50KTtcbiAgICAgICAgY29uc3QgZW5jID0gZnJvbnRtYXR0ZXI/Llx1N0YxNlx1NzgwMSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChlbmMpIHtcbiAgICAgICAgICBjb25zdCBlbmNNYXRjaCA9IGVuYy5tYXRjaChDT0RFX1JFKTtcbiAgICAgICAgICBpZiAoZW5jTWF0Y2ggJiYgZW5jTWF0Y2hbM10gPT09IHRhZykge1xuICAgICAgICAgICAgY29uc3Qgc2VxID0gcGFyc2VJbnQoZW5jTWF0Y2hbNF0sIDEwKTtcbiAgICAgICAgICAgIGlmIChzZXEgPiBtYXhTZXEpIG1heFNlcSA9IHNlcTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1heFNlcSArIDE7XG59XG5cbi8qKlxuICogXHU0RTNBXHU2NTg3XHU0RUY2XHU1MjA2XHU5MTREXHU3RjE2XHU3ODAxXHUzMDAyXG4gKiAtIFx1NzUxRlx1NjIxMCBZWV9NTUREX1RfTk4gXHU2ODNDXHU1RjBGXG4gKiAtIFx1OTFDRFx1NTQ3RFx1NTQwRFx1NjU4N1x1NEVGNlx1RkYwOFx1NTJBMFx1N0YxNlx1NzgwMVx1NTI0RFx1N0YwMFx1RkYwOVxuICogLSBcdTUxOTlcdTU2REUgWUFNTCBcdTdGMTZcdTc4MDFcdTVCNTdcdTZCQjVcbiAqXG4gKiBAcmV0dXJucyBcdTUyMDZcdTkxNERcdTUyMzBcdTc2ODRcdTdGMTZcdTc4MDFcdTRFMzJcdUZGMENcdTU5ODIgXCIyNl8wNjE1X1NfMDFcIlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXNzaWduRW5jb2RpbmcoXG4gIGFwcDogQXBwLFxuICBmaWxlUGF0aDogc3RyaW5nLFxuICBkaXI6IHN0cmluZyxcbik6IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPiB7XG4gIGNvbnN0IGZpbGUgPSBhcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGZpbGVQYXRoKTtcbiAgaWYgKCEoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuICBjb25zdCBjb250ZW50ID0gYXdhaXQgYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gIGNvbnN0IHsgZnJvbnRtYXR0ZXIsIGJvZHkgfSA9IHBhcnNlRnJvbnRtYXR0ZXIoY29udGVudCk7XG4gIGNvbnN0IGZtID0gZnJvbnRtYXR0ZXIgPz8ge307XG5cbiAgLy8gXHU1REYyXHU2NzA5XHU3RjE2XHU3ODAxXHU1QzMxXHU4REYzXHU4RkM3XG4gIGlmIChmbS5cdTdGMTZcdTc4MDEgJiYgQ09ERV9SRS50ZXN0KGZtLlx1N0YxNlx1NzgwMSBhcyBzdHJpbmcpKSB7XG4gICAgcmV0dXJuIGZtLlx1N0YxNlx1NzgwMSBhcyBzdHJpbmc7XG4gIH1cblxuICAvLyBcdTYzQThcdTVCRkNcdTY4MDdcdTdCN0UgKyBcdTVFOEZcdTUzRjdcbiAgY29uc3QgdGFnID0gaW5mZXJUYWcoZGlyLCBmbS5cdTY4MDdcdTdCN0UgYXMgVGFnIHwgdW5kZWZpbmVkKTtcbiAgY29uc3Qgc2VxID0gYXdhaXQgbmV4dFNlcXVlbmNlKGFwcCwgZGlyLCB0YWcpO1xuXG4gIC8vIFx1NzUxRlx1NjIxMFx1N0YxNlx1NzgwMVxuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICBjb25zdCB5eSA9IFN0cmluZyhub3cuZ2V0RnVsbFllYXIoKSkuc2xpY2UoMik7XG4gIGNvbnN0IG1tZGQgPSBgJHtTdHJpbmcobm93LmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCAnMCcpfSR7U3RyaW5nKG5vdy5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsICcwJyl9YDtcbiAgY29uc3QgY29kZSA9IGAke3l5fV8ke21tZGR9XyR7dGFnfV8ke1N0cmluZyhzZXEpLnBhZFN0YXJ0KDIsICcwJyl9YDtcblxuICAvLyBcdTUxOTlcdTU2REUgWUFNTFxuICBjb25zdCBuZXdGbSA9IHsgLi4uZm0sIFx1NjgwN1x1N0I3RTogdGFnLCBcdTdGMTZcdTc4MDE6IGNvZGUgfTtcbiAgY29uc3QgbmV3Q29udGVudCA9IGFzc2VtYmxlRmlsZShuZXdGbSwgYm9keSk7XG4gIGF3YWl0IGFwcC52YXVsdC5tb2RpZnkoZmlsZSwgbmV3Q29udGVudCk7XG5cbiAgLy8gXHU5MUNEXHU1NDdEXHU1NDBEXHU2NTg3XHU0RUY2XHVGRjA4XHU1MkEwXHU3RjE2XHU3ODAxXHU1MjREXHU3RjAwXHVGRjA5XG4gIGNvbnN0IGV4dCA9IGZpbGUuZXh0ZW5zaW9uO1xuICBjb25zdCBvbGROYW1lID0gZmlsZS5iYXNlbmFtZTtcbiAgY29uc3QgbmV3TmFtZSA9IGAke2NvZGV9ICR7b2xkTmFtZX1gO1xuICBjb25zdCBuZXdQYXRoID0gZmlsZVBhdGgucmVwbGFjZSgvW14vXSskLywgYCR7bmV3TmFtZX0uJHtleHR9YCk7XG4gIGlmIChuZXdQYXRoICE9PSBmaWxlUGF0aCkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBhcHAudmF1bHQucmVuYW1lKGZpbGUsIG5ld1BhdGgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS53YXJuKCdbc3luYy9hdXRvUmVuYW1lXSByZW5hbWUgZmFpbGVkOicsIGVycik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvZGU7XG59XG5cbi8qKlxuICogXHU2Mjc5XHU5MUNGXHU1MjA2XHU5MTREXHU3RjE2XHU3ODAxXHVGRjA4cmliYm9uIFx1ODlFNlx1NTNEMVx1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYmF0Y2hBc3NpZ25FbmNvZGluZyhhcHA6IEFwcCwgZGlyOiBzdHJpbmcpOiBQcm9taXNlPHsgdG90YWw6IG51bWJlcjsgYXNzaWduZWQ6IG51bWJlciB9PiB7XG4gIGNvbnN0IGZvbGRlciA9IGFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZGlyKTtcbiAgaWYgKCEoZm9sZGVyIGluc3RhbmNlb2YgVEZvbGRlcikpIHJldHVybiB7IHRvdGFsOiAwLCBhc3NpZ25lZDogMCB9O1xuXG4gIGxldCBhc3NpZ25lZCA9IDA7XG4gIGxldCB0b3RhbCA9IDA7XG4gIGZvciAoY29uc3QgY2hpbGQgb2YgZm9sZGVyLmNoaWxkcmVuKSB7XG4gICAgaWYgKCEoY2hpbGQgaW5zdGFuY2VvZiBURmlsZSkgfHwgIWNoaWxkLm5hbWUuZW5kc1dpdGgoJy5tZCcpKSBjb250aW51ZTtcbiAgICB0b3RhbCsrO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhc3NpZ25FbmNvZGluZyhhcHAsIGNoaWxkLnBhdGgsIGRpcik7XG4gICAgICBpZiAocmVzdWx0KSBhc3NpZ25lZCsrO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS53YXJuKGBbc3luYy9hdXRvUmVuYW1lXSBiYXRjaCBmYWlsZWQgZm9yICR7Y2hpbGQucGF0aH06YCwgZXJyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHsgdG90YWwsIGFzc2lnbmVkIH07XG59XG5cbi8qKlxuICogXHU4OUUzXHU3ODAxXHVGRjFBXHU0RUNFXHU2NTg3XHU0RUY2XHU1NDBEXHU2MjE2IFlBTUwgXHU2M0QwXHU1M0Q2XHU3RjE2XHU3ODAxXHU0RkUxXHU2MDZGXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVDb2RlKGNvZGU6IHN0cmluZyk6IHtcbiAgeXk6IHN0cmluZztcbiAgbW1kZDogc3RyaW5nO1xuICB0YWc6IFRhZztcbiAgc2VxOiBudW1iZXI7XG4gIHN1Yj86IHN0cmluZztcbn0gfCBudWxsIHtcbiAgY29uc3QgbWF0Y2ggPSBjb2RlLm1hdGNoKENPREVfUkUpO1xuICBpZiAoIW1hdGNoKSByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIHtcbiAgICB5eTogbWF0Y2hbMV0sXG4gICAgbW1kZDogbWF0Y2hbMl0sXG4gICAgdGFnOiBtYXRjaFszXSBhcyBUYWcsXG4gICAgc2VxOiBwYXJzZUludChtYXRjaFs0XSwgMTApLFxuICAgIHN1YjogbWF0Y2hbNV0sXG4gIH07XG59XG4iLCAiZXhwb3J0IGludGVyZmFjZSBCaW5kaW5nRW50cnkge1xuICBwYXRoOiBzdHJpbmc7XG4gIGNvbnRlbnQ6IHN0cmluZztcbn1cblxuY2xhc3MgQmluZGluZ0NvbmZsaWN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvZGUgPSAnQklORElOR19DT05GTElDVCc7XG4gIHN0YXR1cyA9IDQwOTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RGZWlzaHVJZChjb250ZW50OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3Qgbm9ybWFsaXplZCA9IGNvbnRlbnQucmVwbGFjZSgvXlxcdUZFRkYvLCAnJykucmVwbGFjZSgvXFxyXFxuPy9nLCAnXFxuJyk7XG4gIGNvbnN0IGZyb250bWF0dGVyID0gbm9ybWFsaXplZC5tYXRjaCgvXi0tLVsgXFx0XSpcXG4oW1xcc1xcU10qPylcXG4tLS0oPzpcXG58JCkvKT8uWzFdO1xuICBpZiAoIWZyb250bWF0dGVyKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgbWF0Y2ggPSBmcm9udG1hdHRlci5tYXRjaCgvXmZlaXNodV9pZFsgXFx0XSo6WyBcXHRdKig/OlwiKFtBLVphLXowLTlfLV0rKVwifCcoW0EtWmEtejAtOV8tXSspJ3woW0EtWmEtejAtOV8tXSspKVsgXFx0XSokL20pO1xuICByZXR1cm4gbWF0Y2g/LlsxXSA/PyBtYXRjaD8uWzJdID8/IG1hdGNoPy5bM10gPz8gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRVbmlxdWVCaW5kaW5nPFQgZXh0ZW5kcyBCaW5kaW5nRW50cnk+KGZlaXNodUlkOiBzdHJpbmcsIGVudHJpZXM6IHJlYWRvbmx5IFRbXSk6IFQgfCBudWxsIHtcbiAgY29uc3QgbWF0Y2hlcyA9IGVudHJpZXMuZmlsdGVyKChlbnRyeSkgPT4ge1xuICAgIGNvbnN0IHJvb3QgPSBlbnRyeS5wYXRoLnNwbGl0KCcvJylbMF0udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAocm9vdCA9PT0gJy5vYnNpZGlhbicgfHwgcm9vdCA9PT0gJy5mZWlzaHUtc3luYycpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gZXh0cmFjdEZlaXNodUlkKGVudHJ5LmNvbnRlbnQpID09PSBmZWlzaHVJZDtcbiAgfSk7XG4gIGlmIChtYXRjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICBjb25zdCBwYXRocyA9IG1hdGNoZXMubWFwKChlbnRyeSkgPT4gZW50cnkucGF0aCkuc29ydCgpO1xuICAgIHRocm93IG5ldyBCaW5kaW5nQ29uZmxpY3RFcnJvcihgTXVsdGlwbGUgbG9jYWwgZmlsZXMgYmluZCBmZWlzaHVfaWQgJHtmZWlzaHVJZH06ICR7cGF0aHMuam9pbignLCAnKX1gKTtcbiAgfVxuICByZXR1cm4gbWF0Y2hlc1swXSA/PyBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0UmVwbGFjZW1lbnRCaW5kaW5nKGNvbnRlbnQ6IHN0cmluZywgZXhwZWN0ZWRGZWlzaHVJZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgZXhpc3RpbmdGZWlzaHVJZCA9IGV4dHJhY3RGZWlzaHVJZChjb250ZW50KTtcbiAgaWYgKGV4aXN0aW5nRmVpc2h1SWQgJiYgZXhpc3RpbmdGZWlzaHVJZCAhPT0gZXhwZWN0ZWRGZWlzaHVJZCkge1xuICAgIGNvbnN0IGVycm9yID0gbmV3IEJpbmRpbmdDb25mbGljdEVycm9yKFxuICAgICAgYFJlZnVzaW5nIHRvIHJlcGxhY2UgJHtwYXRofTsgaXQgaXMgYm91bmQgdG8gYW5vdGhlciBmZWlzaHVfaWRgLFxuICAgICk7XG4gICAgZXJyb3IuY29kZSA9ICdSRVBMQUNFTUVOVF9CSU5ESU5HX0NPTkZMSUNUJztcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuIiwgImltcG9ydCB7IFRGaWxlLCB0eXBlIEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IGZpbmRVbmlxdWVCaW5kaW5nIH0gZnJvbSAnLi9iaW5kaW5nSW5kZXguanMnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmluZFVuaXF1ZVZhdWx0QmluZGluZyhhcHA6IEFwcCwgZmVpc2h1SWQ6IHN0cmluZyk6IFByb21pc2U8VEZpbGUgfCBudWxsPiB7XG4gIGNvbnN0IGVudHJpZXM6IEFycmF5PHsgcGF0aDogc3RyaW5nOyBjb250ZW50OiBzdHJpbmc7IGZpbGU6IFRGaWxlIH0+ID0gW107XG4gIGZvciAoY29uc3QgZmlsZSBvZiBhcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpKSB7XG4gICAgY29uc3Qgcm9vdCA9IGZpbGUucGF0aC5zcGxpdCgnLycpWzBdLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKHJvb3QgPT09ICcub2JzaWRpYW4nIHx8IHJvb3QgPT09ICcuZmVpc2h1LXN5bmMnKSBjb250aW51ZTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgaWYgKGNvbnRlbnQuaW5jbHVkZXMoJ2ZlaXNodV9pZDonKSkgZW50cmllcy5wdXNoKHsgcGF0aDogZmlsZS5wYXRoLCBjb250ZW50LCBmaWxlIH0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmaW5kVW5pcXVlQmluZGluZyhmZWlzaHVJZCwgZW50cmllcyk/LmZpbGUgPz8gbnVsbDtcbn1cbiIsICJjb25zdCBNQVhfUEFUSF9CWVRFUyA9IDEwMjQ7XG5jb25zdCBNQVhfU0VHTUVOVF9CWVRFUyA9IDI1NTtcbmNvbnN0IElOVEVSTkFMX1JPT1RTID0gbmV3IFNldChbJy5vYnNpZGlhbicsICcuZmVpc2h1LXN5bmMnXSk7XG5cbmNsYXNzIFZhbGlkYXRpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29kZTogc3RyaW5nO1xuICBzdGF0dXMgPSA0MDA7XG5cbiAgY29uc3RydWN0b3IoY29kZTogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLmNvZGUgPSBjb2RlO1xuICB9XG59XG5cbmZ1bmN0aW9uIHVuc2FmZVBhdGgobWVzc2FnZTogc3RyaW5nKTogbmV2ZXIge1xuICB0aHJvdyBuZXcgVmFsaWRhdGlvbkVycm9yKCdVTlNBRkVfVkFVTFRfUEFUSCcsIG1lc3NhZ2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplVmF1bHREaXIodmFsdWU6IHVua25vd24pOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgdW5zYWZlUGF0aCgnVmF1bHQgcGF0aCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gIGNvbnN0IHJhdyA9IHZhbHVlLnRyaW0oKTtcbiAgaWYgKCFyYXcpIHJldHVybiAnJztcbiAgaWYgKHJhdy5pbmNsdWRlcygnXFwwJykpIHVuc2FmZVBhdGgoJ1ZhdWx0IHBhdGggY29udGFpbnMgTlVMJyk7XG4gIGlmICgvXig/OlxcL3xcXFxcfFtBLVphLXpdOikvLnRlc3QocmF3KSkgdW5zYWZlUGF0aCgnQWJzb2x1dGUgVmF1bHQgcGF0aHMgYXJlIG5vdCBhbGxvd2VkJyk7XG4gIGlmICgvXFxcXC8udGVzdChyYXcpKSB1bnNhZmVQYXRoKCdCYWNrc2xhc2ggc2VwYXJhdG9ycyBhcmUgbm90IGFsbG93ZWQnKTtcbiAgaWYgKC8lKD86MmZ8NWN8MDApL2kudGVzdChyYXcpKSB1bnNhZmVQYXRoKCdFbmNvZGVkIHNlcGFyYXRvcnMgYW5kIE5VTCBhcmUgbm90IGFsbG93ZWQnKTtcblxuICBsZXQgZGVjb2RlZDogc3RyaW5nO1xuICB0cnkge1xuICAgIGRlY29kZWQgPSBkZWNvZGVVUklDb21wb25lbnQocmF3KTtcbiAgfSBjYXRjaCB7XG4gICAgdW5zYWZlUGF0aCgnVmF1bHQgcGF0aCBjb250YWlucyBtYWxmb3JtZWQgcGVyY2VudCBlbmNvZGluZycpO1xuICB9XG4gIGlmIChkZWNvZGVkLmluY2x1ZGVzKCdcXDAnKSB8fCBkZWNvZGVkLmluY2x1ZGVzKCdcXFxcJykpIHVuc2FmZVBhdGgoJ0RlY29kZWQgVmF1bHQgcGF0aCBpcyB1bnNhZmUnKTtcblxuICBjb25zdCB3aXRob3V0VHJhaWxpbmdTbGFzaCA9IHJhdy5yZXBsYWNlKC9cXC8rJC8sICcnKTtcbiAgY29uc3QgZGVjb2RlZFdpdGhvdXRUcmFpbGluZ1NsYXNoID0gZGVjb2RlZC5yZXBsYWNlKC9cXC8rJC8sICcnKTtcbiAgY29uc3QgcmF3U2VnbWVudHMgPSB3aXRob3V0VHJhaWxpbmdTbGFzaC5zcGxpdCgnLycpO1xuICBjb25zdCBkZWNvZGVkU2VnbWVudHMgPSBkZWNvZGVkV2l0aG91dFRyYWlsaW5nU2xhc2guc3BsaXQoJy8nKTtcbiAgaWYgKHJhd1NlZ21lbnRzLmxlbmd0aCAhPT0gZGVjb2RlZFNlZ21lbnRzLmxlbmd0aCkgdW5zYWZlUGF0aCgnRW5jb2RlZCBwYXRoIHNlcGFyYXRvcnMgYXJlIG5vdCBhbGxvd2VkJyk7XG4gIGlmIChkZWNvZGVkU2VnbWVudHMuc29tZSgoc2VnbWVudCkgPT4gIXNlZ21lbnQgfHwgc2VnbWVudCA9PT0gJy4nIHx8IHNlZ21lbnQgPT09ICcuLicpKSB7XG4gICAgdW5zYWZlUGF0aCgnRW1wdHkgYW5kIHRyYXZlcnNhbCBwYXRoIHNlZ21lbnRzIGFyZSBub3QgYWxsb3dlZCcpO1xuICB9XG5cbiAgY29uc3Qgbm9ybWFsaXplZFNlZ21lbnRzID0gcmF3U2VnbWVudHMubWFwKChzZWdtZW50KSA9PiBzZWdtZW50LnRyaW0oKSk7XG4gIGlmIChub3JtYWxpemVkU2VnbWVudHMuc29tZSgoc2VnbWVudCkgPT4gIXNlZ21lbnQpKSB1bnNhZmVQYXRoKCdFbXB0eSBwYXRoIHNlZ21lbnRzIGFyZSBub3QgYWxsb3dlZCcpO1xuICBpZiAoSU5URVJOQUxfUk9PVFMuaGFzKGRlY29kZWRTZWdtZW50c1swXS50cmltKCkudG9Mb3dlckNhc2UoKSkpIHtcbiAgICB1bnNhZmVQYXRoKCdJbnRlcm5hbCBwbHVnaW4gcGF0aHMgYXJlIG5vdCB3cml0YWJsZScpO1xuICB9XG4gIGZvciAoY29uc3Qgc2VnbWVudCBvZiBub3JtYWxpemVkU2VnbWVudHMpIHtcbiAgICBpZiAoQnVmZmVyLmJ5dGVMZW5ndGgoc2VnbWVudCwgJ3V0ZjgnKSA+IE1BWF9TRUdNRU5UX0JZVEVTKSB7XG4gICAgICB1bnNhZmVQYXRoKCdWYXVsdCBwYXRoIHNlZ21lbnQgaXMgdG9vIGxvbmcnKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplZFNlZ21lbnRzLmpvaW4oJy8nKTtcbiAgaWYgKEJ1ZmZlci5ieXRlTGVuZ3RoKG5vcm1hbGl6ZWQsICd1dGY4JykgPiBNQVhfUEFUSF9CWVRFUykgdW5zYWZlUGF0aCgnVmF1bHQgcGF0aCBpcyB0b28gbG9uZycpO1xuICByZXR1cm4gbm9ybWFsaXplZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVZhdWx0TWFya2Rvd25QYXRoKHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHtcbiAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZVZhdWx0RGlyKHZhbHVlKTtcbiAgaWYgKCFub3JtYWxpemVkIHx8ICEvXFwubWQkL2kudGVzdChub3JtYWxpemVkKSkge1xuICAgIHVuc2FmZVBhdGgoJ1ZhdWx0IGZpbGUgcGF0aCBtdXN0IGVuZCBpbiAubWQnKTtcbiAgfVxuICByZXR1cm4gbm9ybWFsaXplZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlSW1hZ2VUb2tlbih2YWx1ZTogdW5rbm93bik6IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnIHx8ICEvXltBLVphLXowLTlfLV17MSwyNTZ9JC8udGVzdCh2YWx1ZSkpIHtcbiAgICB0aHJvdyBuZXcgVmFsaWRhdGlvbkVycm9yKCdVTlNBRkVfSU1BR0VfVE9LRU4nLCAnSW1hZ2UgdG9rZW4gaXMgbm90IGEgc2FmZSBvcGFxdWUgaWRlbnRpZmllcicpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cbiIsICIvKipcbiAqIFBPU1QgL2NsaXAgXHUyMDE0IFx1NEVGQlx1NjEwRlx1N0Y1MVx1OTg3NS9cdTUyMTJcdThCQ0RcdTUyNkFcdTVCNThcdTUyMzAgT2JzaWRpYW5cdTMwMDJcbiAqXG4gKiBNVlAgXHU1MUIzXHU3QjU2XHVGRjFBXG4gKiAtIFx1NEUwRFx1N0VEMVx1NUI5QSBmZWlzaHVfaWRcdUZGMENcdTkwN0ZcdTUxNERcdTYyOEFcdTY2NkVcdTkwMUFcdTdGNTFcdTk4NzVcdTRGMkFcdTg4QzVcdTYyMTBcdTk4REVcdTRFNjZcdTU0MENcdTZCNjVcdTY1ODdcdTRFRjZcdTMwMDJcbiAqIC0gXHU1MTk5XHU1MTY1XHU2M0QyXHU0RUY2XHU5RUQ4XHU4QkE0XHU3NkVFXHU1RjU1XHU2MjE2XHU4QkY3XHU2QzQyXHU0RjIwXHU1MTY1XHU3NkVFXHU1RjU1XHUzMDAyXG4gKiAtIFx1NEY3Rlx1NzUyOFx1NzdFNVx1OEJDNlx1NUU5M1x1NUI1N1x1NkJCNVx1OTg4NFx1OEJCRVx1NTg2Qlx1NTE0NVx1NTdGQVx1Nzg0MCBZQU1MXHVGRjBDXHU3RjE2XHU3ODAxXHU0RUNEXHU0RUE0XHU3RUQ5IGF1dG8tcmVuYW1lXHUzMDAyXG4gKi9cbmltcG9ydCB7IGFzc2VtYmxlRmlsZSwgdHlwZSBDbGlwUmVxdWVzdCwgdHlwZSBDbGlwUmVzcG9uc2UgfSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHsgQXBwLCBURmlsZSwgVEZvbGRlciB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuaW1wb3J0IHR5cGUgeyBGZWlzaHVTeW5jU2V0dGluZ3MgfSBmcm9tICcuLi9zZXR0aW5ncy5qcyc7XG5pbXBvcnQgeyBtYWtlRmlsZW5hbWUsIG1ha2VQYXRoIH0gZnJvbSAnLi4vZmlsZWlvL3dyaXRlci5qcyc7XG5pbXBvcnQgeyBhc3NpZ25FbmNvZGluZyB9IGZyb20gJy4uL2F1dG9SZW5hbWUuanMnO1xuaW1wb3J0IHsgbm9ybWFsaXplVmF1bHREaXIsIG5vcm1hbGl6ZVZhdWx0TWFya2Rvd25QYXRoIH0gZnJvbSAnLi4vdmF1bHRQYXRoLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBDbGlwRGVwcyB7XG4gIGFwcDogQXBwO1xuICBzZXR0aW5nczogRmVpc2h1U3luY1NldHRpbmdzO1xuICBub3RpY2U6IChtc2c6IHN0cmluZykgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNsaXBIYW5kbGVyKGRlcHM6IENsaXBEZXBzKSB7XG4gIHJldHVybiBhc3luYyAoY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8Q2xpcFJlc3BvbnNlPiA9PiB7XG4gICAgY29uc3QgcmVxID0gKGN0eC5ib2R5ID8/IHt9KSBhcyBDbGlwUmVxdWVzdDtcbiAgICBjb25zdCB0aXRsZSA9IGNsZWFuVGV4dChyZXEudGl0bGUpIHx8ICdcdTdGNTFcdTk4NzVcdTUyNkFcdTg1Q0YnO1xuICAgIGNvbnN0IHVybCA9IGNsZWFuVGV4dChyZXEudXJsKTtcbiAgICBjb25zdCB0ZXh0ID0gY2xlYW5UZXh0KHJlcS50ZXh0KTtcbiAgICBjb25zdCByYXdUZXh0ID0gY2xlYW5UZXh0KHJlcS5yYXdUZXh0KSB8fCB0ZXh0O1xuICAgIGNvbnN0IGJvZHlNYXJrZG93biA9IGNsZWFuVGV4dChyZXEuYm9keU1hcmtkb3duKTtcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGNsZWFuVGV4dChyZXEuZGVzY3JpcHRpb24pO1xuICAgIGNvbnN0IHNvdXJjZUtpbmQgPSBjbGVhblRleHQocmVxLnNvdXJjZUtpbmQpIHx8ICdnZW5lcmljLXBhZ2UnO1xuICAgIGNvbnN0IGFwcGVuZFBhdGggPSByZXEuYXBwZW5kUGF0aCA/IG5vcm1hbGl6ZVZhdWx0TWFya2Rvd25QYXRoKHJlcS5hcHBlbmRQYXRoKSA6ICcnO1xuICAgIGlmICghdXJsICYmICF0ZXh0ICYmICFib2R5TWFya2Rvd24gJiYgIXJhd1RleHQpIHtcbiAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoJ3VybCBvciB0ZXh0IGlzIHJlcXVpcmVkJykgYXMgRXJyb3IgJiB7IGNvZGU6IHN0cmluZzsgc3RhdHVzOiBudW1iZXIgfTtcbiAgICAgIGUuY29kZSA9ICdNSVNTSU5HX0NMSVBfQ09OVEVOVCc7XG4gICAgICBlLnN0YXR1cyA9IDQwMDtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRlZEF0ID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCB0YXJnZXREaXIgPSBub3JtYWxpemVWYXVsdERpcihjbGVhblRleHQocmVxLmRpcikgfHwgZGVwcy5zZXR0aW5ncy5kZWZhdWx0RGlyKTtcbiAgICBjb25zdCBtZXRhID0gbm9ybWFsaXplQ2xpcE1ldGEocmVxLm1ldGEsIHtcbiAgICAgIHRpdGxlLFxuICAgICAgdXJsLFxuICAgICAgdGV4dDogcmF3VGV4dCB8fCBib2R5TWFya2Rvd24gfHwgdGV4dCxcbiAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgZGlyOiB0YXJnZXREaXIsXG4gICAgICBkYXRlOiBmb3JtYXREYXRlKGNyZWF0ZWRBdCksXG4gICAgfSk7XG5cbiAgICBjb25zdCBjb250ZW50SW5wdXQgPSB7XG4gICAgICB0aXRsZSxcbiAgICAgIHVybCxcbiAgICAgIHRleHQsXG4gICAgICByYXdUZXh0LFxuICAgICAgYm9keU1hcmtkb3duLFxuICAgICAgZGVzY3JpcHRpb24sXG4gICAgICBkaXI6IHRhcmdldERpcixcbiAgICAgIG1ldGEsXG4gICAgICBzb3VyY2VLaW5kLFxuICAgICAgZGF0ZTogZm9ybWF0RGF0ZShjcmVhdGVkQXQpLFxuICAgICAgY3JlYXRlZEF0OiBjcmVhdGVkQXQudG9JU09TdHJpbmcoKSxcbiAgICB9O1xuXG4gICAgaWYgKGFwcGVuZFBhdGgpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGRlcHMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChhcHBlbmRQYXRoKTtcbiAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIFRGaWxlKSkge1xuICAgICAgICBjb25zdCBlID0gbmV3IEVycm9yKGBcdTg4NjVcdTUxNDVcdTc2RUVcdTY4MDdcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUEke2FwcGVuZFBhdGh9YCkgYXMgRXJyb3IgJiB7IGNvZGU6IHN0cmluZzsgc3RhdHVzOiBudW1iZXIgfTtcbiAgICAgICAgZS5jb2RlID0gJ0FQUEVORF9UQVJHRVRfTk9UX0ZPVU5EJztcbiAgICAgICAgZS5zdGF0dXMgPSA0MDQ7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgICBjb25zdCBjdXJyZW50ID0gYXdhaXQgZGVwcy5hcHAudmF1bHQucmVhZCh0YXJnZXQpO1xuICAgICAgY29uc3QgYXBwZW5kaXggPSBidWlsZEFwcGVuZE1hcmtkb3duKGNvbnRlbnRJbnB1dCk7XG4gICAgICBhd2FpdCBkZXBzLmFwcC52YXVsdC5tb2RpZnkodGFyZ2V0LCBgJHtjdXJyZW50LnJlcGxhY2UoL1xccyokLywgJycpfVxcblxcbiR7YXBwZW5kaXh9XFxuYCk7XG4gICAgICBkZXBzLm5vdGljZShgXHVEODNEXHVEQ0REIFx1NURGMlx1ODg2NVx1NTE0NVx1NTIzMCAke2FwcGVuZFBhdGh9YCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgcGF0aDogdGFyZ2V0LnBhdGgsXG4gICAgICAgIGZpbGVuYW1lOiB0YXJnZXQubmFtZSxcbiAgICAgICAgYWN0aW9uOiAndXBkYXRlZCcsXG4gICAgICB9O1xuICAgIH1cblxuICAgIGF3YWl0IGVuc3VyZUZvbGRlcihkZXBzLmFwcCwgdGFyZ2V0RGlyKTtcblxuICAgIGNvbnN0IGZpbGVuYW1lID0gbWFrZUZpbGVuYW1lKHRpdGxlKTtcbiAgICBsZXQgZmluYWxQYXRoID0gbWFrZVBhdGgodGFyZ2V0RGlyLCBmaWxlbmFtZSk7XG4gICAgY29uc3QgZXhpc3RpbmcgPSBkZXBzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZmluYWxQYXRoKTtcbiAgICBpZiAoZXhpc3RpbmcgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgZmluYWxQYXRoID0gbWFrZVBhdGgodGFyZ2V0RGlyLCBgJHtmaWxlbmFtZS5yZXBsYWNlKC9cXC5tZCQvLCAnJyl9LSR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9Lm1kYCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudCA9IGJ1aWxkQ2xpcE1hcmtkb3duKGNvbnRlbnRJbnB1dCk7XG5cbiAgICBhd2FpdCBkZXBzLmFwcC52YXVsdC5jcmVhdGUoZmluYWxQYXRoLCBjb250ZW50KTtcbiAgICBkZXBzLm5vdGljZShgXHVEODNEXHVEQ0NFIFx1NURGMlx1NTI2QVx1NUI1OCAke3RpdGxlfWApO1xuXG4gICAgaWYgKGRlcHMuc2V0dGluZ3MuYXV0b1JlbmFtZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgYXNzaWduRW5jb2RpbmcoZGVwcy5hcHAsIGZpbmFsUGF0aCwgdGFyZ2V0RGlyKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2NsaXBdIGF1dG8tcmVuYW1lIGZhaWxlZDonLCBlcnIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBvazogdHJ1ZSxcbiAgICAgIHBhdGg6IGZpbmFsUGF0aCxcbiAgICAgIGZpbGVuYW1lOiBmaW5hbFBhdGguc3BsaXQoJy8nKS5wb3AoKSA/PyBmaWxlbmFtZSxcbiAgICAgIGFjdGlvbjogJ2NyZWF0ZWQnLFxuICAgIH07XG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQ2xpcE1hcmtkb3duKGlucHV0OiB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIHJhd1RleHQ6IHN0cmluZztcbiAgYm9keU1hcmtkb3duOiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIGRpcjogc3RyaW5nO1xuICBtZXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgc291cmNlS2luZDogc3RyaW5nO1xuICBkYXRlOiBzdHJpbmc7XG4gIGNyZWF0ZWRBdDogc3RyaW5nO1xufSk6IHN0cmluZyB7XG4gIGNvbnN0IGJvZHlDb250ZW50ID0gbm9ybWFsaXplTWFya2Rvd25Cb2R5KGlucHV0LmJvZHlNYXJrZG93biB8fCBpbnB1dC5yYXdUZXh0IHx8IGlucHV0LnRleHQgfHwgaW5wdXQuZGVzY3JpcHRpb24pO1xuICBjb25zdCBib2R5ID0gW1xuICAgIGAjICR7aW5wdXQudGl0bGV9YCxcbiAgICAnJyxcbiAgICBpbnB1dC51cmwgPyBgPiBcdTY3NjVcdTZFOTBcdUZGMUEke2lucHV0LnVybH1gIDogJycsXG4gICAgYD4gXHU3QzdCXHU1NzhCXHVGRjFBJHtpbnB1dC5zb3VyY2VLaW5kfWAsXG4gICAgYD4gXHU1MjZBXHU1QjU4XHU2NUY2XHU5NUY0XHVGRjFBJHtpbnB1dC5jcmVhdGVkQXR9YCxcbiAgICAnJyxcbiAgICBib2R5Q29udGVudCxcbiAgICAnJyxcbiAgXS5maWx0ZXIoKGxpbmUsIGluZGV4LCBhcnIpID0+IGxpbmUgfHwgYXJyW2luZGV4IC0gMV0gIT09ICcnKS5qb2luKCdcXG4nKTtcblxuICByZXR1cm4gYXNzZW1ibGVGaWxlKGlucHV0Lm1ldGEsIGJvZHkpO1xufVxuXG5mdW5jdGlvbiBidWlsZEFwcGVuZE1hcmtkb3duKGlucHV0OiB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIHJhd1RleHQ6IHN0cmluZztcbiAgYm9keU1hcmtkb3duOiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIHNvdXJjZUtpbmQ6IHN0cmluZztcbiAgY3JlYXRlZEF0OiBzdHJpbmc7XG59KTogc3RyaW5nIHtcbiAgY29uc3QgYm9keUNvbnRlbnQgPSBub3JtYWxpemVNYXJrZG93bkJvZHkoaW5wdXQuYm9keU1hcmtkb3duIHx8IGlucHV0LnJhd1RleHQgfHwgaW5wdXQudGV4dCB8fCBpbnB1dC5kZXNjcmlwdGlvbik7XG4gIHJldHVybiBbXG4gICAgYCMjICR7aW5wdXQudGl0bGV9YCxcbiAgICAnJyxcbiAgICBpbnB1dC51cmwgPyBgPiBcdTY3NjVcdTZFOTBcdUZGMUEke2lucHV0LnVybH1gIDogJycsXG4gICAgYD4gXHU3QzdCXHU1NzhCXHVGRjFBJHtpbnB1dC5zb3VyY2VLaW5kfWAsXG4gICAgYD4gXHU4ODY1XHU1MTQ1XHU2NUY2XHU5NUY0XHVGRjFBJHtpbnB1dC5jcmVhdGVkQXR9YCxcbiAgICAnJyxcbiAgICBib2R5Q29udGVudCxcbiAgXS5maWx0ZXIoKGxpbmUsIGluZGV4LCBhcnIpID0+IGxpbmUgfHwgYXJyW2luZGV4IC0gMV0gIT09ICcnKS5qb2luKCdcXG4nKTtcbn1cblxuZnVuY3Rpb24gY2xlYW5UZXh0KHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZS50cmltKCkgOiAnJztcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF0ZShkYXRlOiBEYXRlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGRhdGUudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCk7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUNsaXBNZXRhKG1ldGE6IHVua25vd24sIGZhbGxiYWNrOiB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIGRpcjogc3RyaW5nO1xuICBkYXRlOiBzdHJpbmc7XG59KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICBjb25zdCBpbnB1dCA9IG1ldGEgJiYgdHlwZW9mIG1ldGEgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KG1ldGEpID8gbWV0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA6IHt9O1xuICBjb25zdCBzY29yZSA9IG5vcm1hbGl6ZVNjb3JlKGlucHV0Llx1OEJDNFx1NTIwNik7XG4gIGNvbnN0IG91dDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7XG4gICAgXHU2ODA3XHU3QjdFOiBub3JtYWxpemVUYWcoaW5wdXQuXHU2ODA3XHU3QjdFKSxcbiAgICBcdTdGMTZcdTc4MDE6ICcnLFxuICAgIFx1OEY5M1x1NTE2NTogY2xlYW5UZXh0KGlucHV0Llx1OEY5M1x1NTE2NSkgfHwgZmFsbGJhY2suZGlyIHx8IGZhbGxiYWNrLnVybCxcbiAgICBcdTY1RTVcdTY3MUY6IG5vcm1hbGl6ZURhdGUoaW5wdXQuXHU2NUU1XHU2NzFGLCBmYWxsYmFjay5kYXRlKSxcbiAgICBcdTY1RTVcdTY3MUZcdTdEMjJcdTVGMTU6IG5vcm1hbGl6ZUxpc3QoaW5wdXQuXHU2NUU1XHU2NzFGXHU3RDIyXHU1RjE1KSxcbiAgICBcdTUxNzNcdTk1MkVcdThCQ0Q6IGNsZWFuVGV4dChpbnB1dC5cdTUxNzNcdTk1MkVcdThCQ0QpIHx8IGRyYWZ0S2V5d29yZHMoYCR7ZmFsbGJhY2sudGl0bGV9ICR7ZmFsbGJhY2suZGVzY3JpcHRpb259ICR7ZmFsbGJhY2sudGV4dH1gKSxcbiAgICBcdTY5ODJcdThGRjA6IGNsZWFuVGV4dChpbnB1dC5cdTY5ODJcdThGRjApIHx8IGZhbGxiYWNrLmRlc2NyaXB0aW9uIHx8IGBcdTRFQ0VcdTdGNTFcdTk4NzVcdTUyNkFcdTVCNThcdTVFNzZcdThGNkNcdTYzNjJcdUZGMUEke2ZhbGxiYWNrLnRpdGxlfWAsXG4gICAgXHU4QkM0XHU1MjA2OiBzY29yZSxcbiAgICBcdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBOiBjbGVhblRleHQoaW5wdXQuXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQSkgfHwgc2NvcmVMYWJlbChzY29yZSksXG4gICAgXHU3RDIyXHU1RjE1X1x1NzdFNVx1OEJDNlx1NUU5MzogY2xlYW5UZXh0KGlucHV0Llx1N0QyMlx1NUYxNV9cdTc3RTVcdThCQzZcdTVFOTMpLFxuICAgIFx1N0QyMlx1NUYxNV9cdTk4OUNcdTgyNzI6IGNsZWFuVGV4dChpbnB1dC5cdTdEMjJcdTVGMTVfXHU5ODlDXHU4MjcyKSxcbiAgICAnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnOiBub3JtYWxpemVMaXN0KGlucHV0WydcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OCddKSxcbiAgICBcdTdEMjJcdTVGMTVfXHU1NzU3OiBub3JtYWxpemVMaXN0KGlucHV0Llx1N0QyMlx1NUYxNV9cdTU3NTcpLFxuICAgIFx1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2Njk6IG5vcm1hbGl6ZUxpc3QoaW5wdXQuXHU3RDIyXHU1RjE1X1x1OThDRVx1OTY2OSksXG4gIH07XG4gIGlmICghb3V0Llx1NTE3M1x1OTUyRVx1OEJDRCkgb3V0Llx1NTE3M1x1OTUyRVx1OEJDRCA9ICdcdTdGNTFcdTk4NzVcdTUyNkFcdTVCNTgnO1xuICBpZiAoIW91dC5cdTY5ODJcdThGRjApIG91dC5cdTY5ODJcdThGRjAgPSBgXHU3RjUxXHU5ODc1XHU1MjZBXHU1QjU4XHVGRjFBJHtmYWxsYmFjay50aXRsZX1gO1xuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVUYWcodmFsdWU6IHVua25vd24pOiBzdHJpbmcge1xuICBjb25zdCByYXcgPSBjbGVhblRleHQodmFsdWUpO1xuICByZXR1cm4gcmF3Lm1hdGNoKC9eW1NYTFpRSl0kLykgPyByYXcgOiByYXcubWF0Y2goLyhbU1hMWlFKXSkoPzpffCQpLyk/LlsxXSB8fCAnUyc7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZURhdGUodmFsdWU6IHVua25vd24sIGZhbGxiYWNrOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCByYXcgPSBjbGVhblRleHQodmFsdWUpLnJlcGxhY2UoL1xcLy9nLCAnLScpO1xuICByZXR1cm4gL15cXGR7NH0tXFxkezJ9LVxcZHsyfSQvLnRlc3QocmF3KSA/IHJhdyA6IGZhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVTY29yZSh2YWx1ZTogdW5rbm93bik6IG51bWJlciB7XG4gIGNvbnN0IHJhdyA9IGNsZWFuVGV4dCh2YWx1ZSk7XG4gIGNvbnN0IGV4cGxpY2l0ID0gcmF3Lm1hdGNoKC9bMS01XS8pPy5bMF07XG4gIGlmIChleHBsaWNpdCkgcmV0dXJuIE51bWJlcihleHBsaWNpdCk7XG4gIGNvbnN0IHN0YXJzID0gQXJyYXkuZnJvbShyYXcubWF0Y2hBbGwoL1x1RDgzQ1x1REYxRi9nKSkubGVuZ3RoO1xuICByZXR1cm4gc3RhcnMgPiAwID8gTWF0aC5taW4oc3RhcnMsIDUpIDogMTtcbn1cblxuZnVuY3Rpb24gc2NvcmVMYWJlbChzY29yZTogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIFsnXHVEODNDXHVERjFGXHUwMEI3XHU3RDIwXHU2NzUwJywgJ1x1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1MDBCN1x1NjU3NFx1NzQwNicsICdcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdTAwQjdcdTVCOUVcdThERjUnLCAnXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHUwMEI3XHU5MDFBXHU3NTI4JywgJ1x1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1MDBCN1x1NEY1M1x1N0NGQiddW01hdGgubWF4KDEsIE1hdGgubWluKHNjb3JlLCA1KSkgLSAxXTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplTGlzdCh2YWx1ZTogdW5rbm93bik6IHN0cmluZ1tdIHtcbiAgY29uc3Qgc291cmNlID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IGNsZWFuVGV4dCh2YWx1ZSkuc3BsaXQoL1tcXG4sXHVGRjBDXHUzMDAxXS8pO1xuICByZXR1cm4gc291cmNlLm1hcCgoaXRlbSkgPT4gY2xlYW5UZXh0KGl0ZW0pKS5maWx0ZXIoQm9vbGVhbik7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZU1hcmtkb3duQm9keSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgdGV4dCA9IHZhbHVlLnRyaW0oKTtcbiAgaWYgKCF0ZXh0KSByZXR1cm4gJ1x1RkYwOFx1NjVFMFx1NTNFRlx1ODlDMVx1NkI2M1x1NjU4N1x1RkYwQ1x1NURGMlx1NEZERFx1NUI1OFx1OTg3NVx1OTc2Mlx1NjgwN1x1OTg5OFx1NTQ4Q1x1Njc2NVx1NkU5MFx1MzAwMlx1RkYwOSc7XG4gIHJldHVybiB0ZXh0O1xufVxuXG5mdW5jdGlvbiBkcmFmdEtleXdvcmRzKHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHdvcmRzID0gQXJyYXkuZnJvbShuZXcgU2V0KFxuICAgIHRleHRcbiAgICAgIC5yZXBsYWNlKC9bXlxccHtTY3JpcHQ9SGFufVxccHtMZXR0ZXJ9XFxwe051bWJlcn1cXHNfLV0vZ3UsICcgJylcbiAgICAgIC5zcGxpdCgvXFxzKy8pXG4gICAgICAubWFwKCh3b3JkKSA9PiB3b3JkLnRyaW0oKSlcbiAgICAgIC5maWx0ZXIoKHdvcmQpID0+IHdvcmQubGVuZ3RoID49IDIgJiYgd29yZC5sZW5ndGggPD0gMjApLFxuICApKTtcbiAgcmV0dXJuIHdvcmRzLnNsaWNlKDAsIDYpLmpvaW4oJ1x1MzAwMScpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBlbnN1cmVGb2xkZXIoYXBwOiBBcHAsIGRpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmICghZGlyIHx8IGRpciA9PT0gJy4nIHx8IGRpciA9PT0gJy8nKSByZXR1cm47XG4gIGNvbnN0IGV4aXN0aW5nID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChkaXIpO1xuICBpZiAoZXhpc3RpbmcgaW5zdGFuY2VvZiBURm9sZGVyKSByZXR1cm47XG4gIGNvbnN0IHBhcmVudCA9IGRpci5zcGxpdCgnLycpLnNsaWNlKDAsIC0xKS5qb2luKCcvJyk7XG4gIGlmIChwYXJlbnQpIGF3YWl0IGVuc3VyZUZvbGRlcihhcHAsIHBhcmVudCk7XG4gIHRyeSB7XG4gICAgYXdhaXQgYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihkaXIpO1xuICB9IGNhdGNoIHtcbiAgICAvLyBcdTVERjJcdTVCNThcdTU3MjhcdTYyMTZcdTc1MzFcdTUxNzZcdTRFRDZcdTZENDFcdTdBMEJcdTUyMUFcdTUyMUJcdTVFRkFcdTY1RjZcdTVGRkRcdTc1NjVcdTMwMDJcbiAgfVxufVxuIiwgIi8qKlxuICogUE9TVCAvZXhpc3RzIFx1MjAxNCBcdTY4QzBcdTY3RTUgbm9kZV90b2tlbiBcdTY2MkZcdTU0MjZcdTVERjJcdTU0MENcdTZCNjVcdThGQzdcdTMwMDJcbiAqL1xuaW1wb3J0IHR5cGUgeyBFeGlzdHNSZXF1ZXN0LCBFeGlzdHNSZXNwb25zZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQgdHlwZSB7IEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuaW1wb3J0IHsgZmluZFVuaXF1ZVZhdWx0QmluZGluZyB9IGZyb20gJy4uL3ZhdWx0QmluZGluZy5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFeGlzdHNIYW5kbGVyKGFwcDogQXBwKSB7XG4gIHJldHVybiBhc3luYyAoY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8RXhpc3RzUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCByZXEgPSBjdHguYm9keSBhcyBFeGlzdHNSZXF1ZXN0O1xuICAgIGlmICghcmVxPy5ub2RlX3Rva2VuKSB7XG4gICAgICBjb25zdCBlID0gbmV3IEVycm9yKCdub2RlX3Rva2VuIGlzIHJlcXVpcmVkJykgYXMgRXJyb3IgJiB7IGNvZGU6IHN0cmluZzsgc3RhdHVzOiBudW1iZXIgfTtcbiAgICAgIGUuY29kZSA9ICdNSVNTSU5HX1RPS0VOJztcbiAgICAgIGUuc3RhdHVzID0gNDAwO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlID0gYXdhaXQgZmluZFVuaXF1ZVZhdWx0QmluZGluZyhhcHAsIHJlcS5ub2RlX3Rva2VuKTtcbiAgICByZXR1cm4ge1xuICAgICAgb2s6IHRydWUsXG4gICAgICBleGlzdHM6ICEhZmlsZSxcbiAgICAgIHBhdGg6IGZpbGU/LnBhdGgsXG4gICAgfTtcbiAgfTtcbn1cbiIsICIvKipcbiAqIFBPU1QgL3B1c2hiYWNrIFx1MjAxNCBPQlx1MjE5Mlx1OThERVx1NEU2Nlx1NTZERVx1NTE5OVx1MzAwMlxuICpcbiAqIFx1NEY5RFx1NjM2RSBgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTc2LjJcdUZGMUFcbiAqIDEuIFx1OEJGQiAubWQgXHU3Njg0IFlBTUxcdUZGMENcdTYyRkYgZmVpc2h1X2RvY19pZCArIHN5bmNfaGFzaFxuICogMi4gXHU4QkExXHU3Qjk3XHU1RjUzXHU1MjREXHU1MTg1XHU1QkI5IGhhc2hcdUZGMENcdTZCRDRcdTVCRjkgc3luY19oYXNoXG4gKiAgICBcdTI1MUMgXHU0RTAwXHU4MUY0IFx1MjE5MiBcdThERjNcdThGQzdcdUZGMDhcdTY1RTBcdTUzRDhcdTUzMTZcdUZGMDlcbiAqICAgIFx1MjUxNCBcdTRFMERcdTRFMDBcdTgxRjQgXHUyMTkyIFx1N0VFN1x1N0VFRFxuICogMy4gXHU4OUUzXHU2NzkwXHU2QjYzXHU2NTg3IG1kICsgWUFNTFxuICogNC4gWUFNTCBcdTVCNTdcdTZCQjUgXHUyMTkyIGNhbGxvdXQgWE1MIFx1NzI0N1x1NkJCNVx1RkYwOFx1NjU4N1x1Njg2M1x1NTkzNFx1RkYwOVxuICogNS4gXHU1NkZFXHU3MjQ3IGZlaXNodTovL3Rva2VuIFx1MjE5MiBcdTk4REVcdTRFNjYgPGltZyBzcmM9XCJUT0tFTlwiLz5cbiAqIDYuIFx1N0VDNFx1ODhDNVx1NjcwMFx1N0VDOFx1NTE4NVx1NUJCOSA9IFtjYWxsb3V0IFhNTF0gKyBbXHU2QjYzXHU2NTg3IG1kXVxuICogNy4gXHU4QzAzIGxhcmstY2xpIGRvY3MgK3VwZGF0ZSBvdmVyd3JpdGVcdUZGMDhYTUwgXHU2ODNDXHU1RjBGXHVGRjA5XG4gKiA4LiBcdTY4MDdcdTk4OThcdTU0MENcdTZCNjVcdUZGMDhcdTVERjJcdTU3Mjggb3ZlcndyaXRlIFx1NjVGNlx1NEZFRVx1NTkwRFx1RkYwOVxuICogOS4gXHU2NkY0XHU2NUIwIHN5bmNfaGFzaCArIHN5bmNfdGltZVxuICovXG5pbXBvcnQgdHlwZSB7IFB1c2hiYWNrUmVxdWVzdCwgUHVzaGJhY2tSZXNwb25zZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQge1xuICBtZXRhVG9DYWxsb3V0WG1sLFxuICBmZWlzaHVQcm90b1RvWG1sLFxuICBjb252ZXJ0T0JDYWxsb3V0c1RvRmVpc2h1LFxuICBpc0NoYW5nZWQsXG59IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQgeyBURmlsZSwgdHlwZSBBcHAgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IFJlcXVlc3RDb250ZXh0IH0gZnJvbSAnLi4vc2VydmVyLmpzJztcbmltcG9ydCB0eXBlIHsgRmVpc2h1U3luY1NldHRpbmdzIH0gZnJvbSAnLi4vc2V0dGluZ3MuanMnO1xuaW1wb3J0IHsgb3ZlcndyaXRlRG9jWG1sLCBnZXRXaWtpTm9kZUluZm8gfSBmcm9tICcuLi9sYXJrL2NsaS5qcyc7XG5pbXBvcnQgeyBwYXJzZUZpbGUsIGFzc2VtYmxlTWQgfSBmcm9tICcuLi9maWxlaW8vd3JpdGVyLmpzJztcbmltcG9ydCB7IGZpbmRVbmlxdWVWYXVsdEJpbmRpbmcgfSBmcm9tICcuLi92YXVsdEJpbmRpbmcuanMnO1xuaW1wb3J0IHsgbm9ybWFsaXplVmF1bHRNYXJrZG93blBhdGggfSBmcm9tICcuLi92YXVsdFBhdGguanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFB1c2hiYWNrRGVwcyB7XG4gIGFwcDogQXBwO1xuICBzZXR0aW5nczogRmVpc2h1U3luY1NldHRpbmdzO1xuICBub3RpY2U6IChtc2c6IHN0cmluZykgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVB1c2hiYWNrSGFuZGxlcihkZXBzOiBQdXNoYmFja0RlcHMpIHtcbiAgcmV0dXJuIGFzeW5jIChjdHg6IFJlcXVlc3RDb250ZXh0KTogUHJvbWlzZTxQdXNoYmFja1Jlc3BvbnNlPiA9PiB7XG4gICAgY29uc3QgcmVxID0gY3R4LmJvZHkgYXMgUHVzaGJhY2tSZXF1ZXN0O1xuXG4gICAgLy8gXHU1QjlBXHU0RjREXHU2NTg3XHU0RUY2XG4gICAgbGV0IGZpbGU6IFRGaWxlIHwgbnVsbCA9IG51bGw7XG4gICAgaWYgKHJlcS5wYXRoKSB7XG4gICAgICBjb25zdCBmID0gZGVwcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKG5vcm1hbGl6ZVZhdWx0TWFya2Rvd25QYXRoKHJlcS5wYXRoKSk7XG4gICAgICBpZiAoZiBpbnN0YW5jZW9mIFRGaWxlKSBmaWxlID0gZjtcbiAgICB9IGVsc2UgaWYgKHJlcS5ub2RlX3Rva2VuKSB7XG4gICAgICBmaWxlID0gYXdhaXQgZmluZFVuaXF1ZVZhdWx0QmluZGluZyhkZXBzLmFwcCwgcmVxLm5vZGVfdG9rZW4pO1xuICAgIH1cblxuICAgIGlmICghZmlsZSkge1xuICAgICAgY29uc3QgZSA9IG5ldyBFcnJvcignRmlsZSBub3QgZm91bmQnKSBhcyBFcnJvciAmIHsgY29kZTogc3RyaW5nOyBzdGF0dXM6IG51bWJlciB9O1xuICAgICAgZS5jb2RlID0gJ05PVF9GT1VORCc7XG4gICAgICBlLnN0YXR1cyA9IDQwNDtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudCA9IGF3YWl0IGRlcHMuYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VGaWxlKGNvbnRlbnQpO1xuXG4gICAgY29uc3QgZmVpc2h1RG9jSWQgPSBwYXJzZWQuZnJvbnRtYXR0ZXIuZmVpc2h1X2RvY19pZCBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgZmVpc2h1SWQgPSBwYXJzZWQuZnJvbnRtYXR0ZXIuZmVpc2h1X2lkIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBmZWlzaHVUaXRsZSA9IHBhcnNlZC5mcm9udG1hdHRlci5mZWlzaHVfdGl0bGUgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgLy8gXHU4OUUzXHU2NzkwXHU1NkRFXHU1MTk5XHU3NTI4XHU3Njg0IGRvY1Rva2VuXHVGRjA4XHU1RkM1XHU5ODdCXHU2NjJGIGRvY3ggb2JqX3Rva2VuXHVGRjBDbm9kZV90b2tlbiBcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTc1MjhcdTRFOEUgZG9jcyArdXBkYXRlXHVGRjA5XG4gICAgbGV0IGRvY1Rva2VuID0gZmVpc2h1RG9jSWQ7XG4gICAgaWYgKCFkb2NUb2tlbiAmJiBmZWlzaHVJZCkge1xuICAgICAgLy8gZmVpc2h1X2RvY19pZCBcdTdGM0FcdTU5MzFcdUZGMUFcdTc1Mjggd2lraSArbm9kZS1nZXQgXHU2MjhBIG5vZGVfdG9rZW4gXHU4OUUzXHU2NzkwXHU2MjEwIG9ial90b2tlblxuICAgICAgZGVwcy5ub3RpY2UoJ1x1RDgzRFx1REQxNyBcdTg5RTNcdTY3OTBcdTY1ODdcdTY4NjMgdG9rZW4uLi4nKTtcbiAgICAgIGNvbnN0IGluZm8gPSBnZXRXaWtpTm9kZUluZm8oZmVpc2h1SWQsIGRlcHMuc2V0dGluZ3Muc3BhY2VJZCk7XG4gICAgICBkb2NUb2tlbiA9IGluZm8/Lm9ial90b2tlbjtcbiAgICAgIGlmICghZG9jVG9rZW4pIHtcbiAgICAgICAgY29uc3QgZSA9IG5ldyBFcnJvcihgXHU2NUUwXHU2Q0Q1XHU4OUUzXHU2NzkwIG9ial90b2tlblx1RkYwOG5vZGVfdG9rZW49JHtmZWlzaHVJZC5zbGljZSgwLCA4KX0uLi5cdUZGMENcdTY4QzBcdTY3RTUgc3BhY2VfaWQgXHU4QkJFXHU3RjZFXHVGRjA5YCkgYXMgRXJyb3IgJiB7IGNvZGU6IHN0cmluZzsgc3RhdHVzOiBudW1iZXIgfTtcbiAgICAgICAgZS5jb2RlID0gJ1RPS0VOX1JFU09MVkVfRkFJTEVEJztcbiAgICAgICAgZS5zdGF0dXMgPSA0MDA7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgICAvLyBcdTU2REVcdTUxOTkgZmVpc2h1X2RvY19pZCBcdThGREIgZnJvbnRtYXR0ZXJcdUZGMDhcdTRFMEJcdTZCMjFcdTRFMERcdTc1MjhcdTUxOERcdTg5RTNcdTY3OTBcdUZGMDlcbiAgICAgIHBhcnNlZC5mcm9udG1hdHRlci5mZWlzaHVfZG9jX2lkID0gZG9jVG9rZW47XG4gICAgfVxuICAgIGlmICghZG9jVG9rZW4pIHtcbiAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoJ05vIGZlaXNodSBiaW5kaW5nIGluIGZyb250bWF0dGVyJykgYXMgRXJyb3IgJiB7IGNvZGU6IHN0cmluZzsgc3RhdHVzOiBudW1iZXIgfTtcbiAgICAgIGUuY29kZSA9ICdOT19CSU5ESU5HJztcbiAgICAgIGUuc3RhdHVzID0gNDAwO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgY29uc3QgdGl0bGUgPSBmZWlzaHVUaXRsZSB8fCBmaWxlLmJhc2VuYW1lO1xuXG4gICAgLy8gXHU2QjY1XHU5QUE0IDJcdUZGMUFoYXNoIFx1NkJENFx1NUJGOVxuICAgIGlmICghcmVxLmZvcmNlICYmICFpc0NoYW5nZWQocGFyc2VkLmhhc2gsIHBhcnNlZC5mcm9udG1hdHRlci5zeW5jX2hhc2ggYXMgc3RyaW5nIHwgdW5kZWZpbmVkKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb2s6IHRydWUsXG4gICAgICAgIGFjdGlvbjogJ3NraXBwZWQnLFxuICAgICAgICBoYXNoOiBwYXJzZWQuaGFzaCxcbiAgICAgICAgdGl0bGUsXG4gICAgICB9O1xuICAgIH1cblxuICAgIGRlcHMubm90aWNlKGBcdTJCMDYgXHU1NkRFXHU1MTk5XHU5OERFXHU0RTY2ICR7ZmlsZS5uYW1lfS4uLmApO1xuXG4gICAgLy8gXHU2QjY1XHU5QUE0IDMtNlx1RkYxQVx1N0VDNFx1ODhDNVx1NjcwMFx1N0VDOCBYTUwgXHU1MTg1XHU1QkI5XG4gICAgY29uc3QgZmluYWxDb250ZW50ID0gYnVpbGRQdXNoYmFja0NvbnRlbnQocGFyc2VkKTtcblxuICAgIC8vIFx1NkI2NVx1OUFBNCA3LThcdUZGMUFvdmVyd3JpdGUgKyBcdTY4MDdcdTk4OThcdTRGRUVcdTU5MERcbiAgICBvdmVyd3JpdGVEb2NYbWwoZG9jVG9rZW4sIGZpbmFsQ29udGVudCwgdGl0bGUpO1xuXG4gICAgLy8gXHU2QjY1XHU5QUE0IDlcdUZGMUFcdTY2RjRcdTY1QjAgc3luY19oYXNoICsgc3luY190aW1lXG4gICAgY29uc3Qgc3luY1RpbWUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgY29uc3QgdXBkYXRlZEZtID0ge1xuICAgICAgLi4ucGFyc2VkLmZyb250bWF0dGVyLFxuICAgICAgc3luY19oYXNoOiBwYXJzZWQuaGFzaCxcbiAgICAgIHN5bmNfdGltZTogc3luY1RpbWUsXG4gICAgfTtcbiAgICBjb25zdCBuZXdDb250ZW50ID0gYXNzZW1ibGVNZCh1cGRhdGVkRm0gYXMgbmV2ZXIsIHBhcnNlZC5ib2R5KTtcbiAgICBhd2FpdCBkZXBzLmFwcC52YXVsdC5tb2RpZnkoZmlsZSwgbmV3Q29udGVudCk7XG5cbiAgICBkZXBzLm5vdGljZShgXHUyNzA1IFx1NURGMlx1NTZERVx1NTE5OSAke3RpdGxlfWApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG9rOiB0cnVlLFxuICAgICAgYWN0aW9uOiAncHVzaGVkJyxcbiAgICAgIGhhc2g6IHBhcnNlZC5oYXNoLFxuICAgICAgdGl0bGUsXG4gICAgfTtcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTdFQzRcdTg4QzVcdTU2REVcdTUxOTlcdTk4REVcdTRFNjZcdTc2ODRcdTY3MDBcdTdFQzhcdTUxODVcdTVCQjlcdUZGMDhYTUwgXHU2ODNDXHU1RjBGXHVGRjA5XHUzMDAyXG4gKiA9IFtZQU1MIGNhbGxvdXQgXHU0RkUxXHU2MDZGXHU1NzU3XSArIFtcdTZCNjNcdTY1ODdcdUZGMDhcdTU2RkVcdTcyNDdcdThGNkMgWE1MXHUzMDAxT0IgY2FsbG91dCBcdThGNkMgWE1MXHVGRjA5XVxuICovXG5mdW5jdGlvbiBidWlsZFB1c2hiYWNrQ29udGVudChwYXJzZWQ6IFJldHVyblR5cGU8dHlwZW9mIHBhcnNlRmlsZT4pOiBzdHJpbmcge1xuICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcblxuICAvLyAxLiBZQU1MIFx1NTE0M1x1NjU3MFx1NjM2RSBcdTIxOTIgY2FsbG91dCBcdTRGRTFcdTYwNkZcdTU3NTdcbiAgY29uc3QgY2FsbG91dFhtbCA9IG1ldGFUb0NhbGxvdXRYbWwocGFyc2VkLmZyb250bWF0dGVyKTtcbiAgaWYgKGNhbGxvdXRYbWwpIHtcbiAgICBwYXJ0cy5wdXNoKGNhbGxvdXRYbWwpO1xuICB9XG5cbiAgLy8gMi4gXHU2QjYzXHU2NTg3XHU1OTA0XHU3NDA2XG4gIGxldCBib2R5ID0gcGFyc2VkLmJvZHk7XG5cbiAgLy8gMmEuIFx1NTZGRVx1NzI0NyBmZWlzaHU6Ly90b2tlbiBcdTIxOTIgPGltZyBzcmM9XCJUT0tFTlwiLz5cbiAgYm9keSA9IGZlaXNodVByb3RvVG9YbWwoYm9keSk7XG5cbiAgLy8gMmIuIE9CIGNhbGxvdXQgPiBbIXR5cGVdIFx1MjE5MiBcdTk4REVcdTRFNjYgY2FsbG91dCBYTUxcbiAgYm9keSA9IGNvbnZlcnRPQkNhbGxvdXRzVG9GZWlzaHUoYm9keSk7XG5cbiAgcGFydHMucHVzaChib2R5LnRyaW0oKSk7XG5cbiAgcmV0dXJuIHBhcnRzLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbn1cbiIsICIvKipcbiAqIFx1NTQ3RFx1NEVFNFx1NjgwRlx1NTQ3RFx1NEVFNFx1MzAwMlx1NEY5RFx1NjM2RVx1NjVCOVx1Njg0OCBcdTAwQTcxMCArIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgXHUzMDAyXG4gKlxuICogLSBcdTU2REVcdTUxOTlcdTVGNTNcdTUyNERcdTY1ODdcdTRFRjZcdTUyMzBcdTk4REVcdTRFNjZcbiAqIC0gXHU2Mjc5XHU5MUNGXHU1NkRFXHU1MTk5XHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XG4gKiAtIFx1NTIzN1x1NjVCMFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFxuICogLSBcdTYyNzlcdTkxQ0ZcdTZFMDVcdTc0MDZcdTVERjJcdTUyMjBcdTk2NjRcbiAqIC0gXHU2NjNFXHU3OTNBL1x1NTkwRFx1NTIzNlx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1xuICogLSBcdTkxQ0RcdTY1QjBcdTUyQTBcdThGN0RcdTYzRDJcdTRFRjZcdUZGMDhcdTkxQ0RcdTU0MkYgSFRUUCBzZXJ2ZXJcdUZGMDlcbiAqL1xuaW1wb3J0IHsgTm90aWNlLCBNb2RhbCwgVEZpbGUsIHR5cGUgQXBwIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBGZWlzaHVTeW5jUGx1Z2luIH0gZnJvbSAnLi9tYWluLmpzJztcbmltcG9ydCB7IHJlZnJlc2hNYXBwaW5nIH0gZnJvbSAnLi9tYXBwaW5nLmpzJztcbmltcG9ydCB7IGNyZWF0ZVB1c2hiYWNrSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlcnMvcHVzaGJhY2tIYW5kbGVyLmpzJztcbmltcG9ydCB7IGJhdGNoQXNzaWduRW5jb2RpbmcgfSBmcm9tICcuL2F1dG9SZW5hbWUuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJDb21tYW5kcyhwbHVnaW46IEZlaXNodVN5bmNQbHVnaW4pOiB2b2lkIHtcbiAgY29uc3QgeyBhcHAsIHNldHRpbmdzIH0gPSBwbHVnaW47XG5cbiAgLy8gXHU1NkRFXHU1MTk5XHU1RjUzXHU1MjREXHU2NTg3XHU0RUY2XHU1MjMwXHU5OERFXHU0RTY2XG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogJ3B1c2hiYWNrLWN1cnJlbnQnLFxuICAgIG5hbWU6ICdcdTU2REVcdTUxOTlcdTVGNTNcdTUyNERcdTY1ODdcdTRFRjZcdTUyMzBcdTk4REVcdTRFNjYnLFxuICAgIGVkaXRvckNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlID0gYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gICAgICBpZiAoIShmaWxlIGluc3RhbmNlb2YgVEZpbGUpIHx8ICFmaWxlLnBhdGguZW5kc1dpdGgoJy5tZCcpKSB7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1MjZBMFx1RkUwRiBcdThCRjdcdTU3MjggbWFya2Rvd24gXHU2NTg3XHU0RUY2XHU0RTJEXHU0RjdGXHU3NTI4XHU2QjY0XHU1NDdEXHU0RUU0Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaGFuZGxlciA9IGNyZWF0ZVB1c2hiYWNrSGFuZGxlcih7XG4gICAgICAgIGFwcCxcbiAgICAgICAgc2V0dGluZ3MsXG4gICAgICAgIG5vdGljZTogKG0pID0+IG5ldyBOb3RpY2UobSksXG4gICAgICB9KTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgcGx1Z2luLmRvY3VtZW50Q29vcmRpbmF0aW9uS2V5KHVuZGVmaW5lZCwgZmlsZS5wYXRoKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcGx1Z2luLnN5bmNDb29yZGluYXRvci5ydW4oa2V5LCB1bmRlZmluZWQsICgpID0+IGhhbmRsZXIoe1xuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgIHVybDogJy9wdXNoYmFjaycsXG4gICAgICAgICAgcGF0aDogJy9wdXNoYmFjaycsXG4gICAgICAgICAgcXVlcnk6IG5ldyBVUkxTZWFyY2hQYXJhbXMoKSxcbiAgICAgICAgICBib2R5OiB7IHBhdGg6IGZpbGUucGF0aCB9LFxuICAgICAgICAgIHRva2VuOiAnJyxcbiAgICAgICAgfSkpO1xuICAgICAgICBpZiAocmVzdWx0LmFjdGlvbiA9PT0gJ3B1c2hlZCcpIHtcbiAgICAgICAgICBuZXcgTm90aWNlKGBcdTI3MDUgXHU1REYyXHU1NkRFXHU1MTk5XHVGRjFBJHtyZXN1bHQudGl0bGV9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3IE5vdGljZSgnXHUyM0VEIFx1NjVFMFx1NTNEOFx1NTMxNlx1RkYwQ1x1NURGMlx1OERGM1x1OEZDNycpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgbmV3IE5vdGljZShgXHUyNzRDIFx1NTZERVx1NTE5OVx1NTkzMVx1OEQyNVx1RkYxQSR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpfWApO1xuICAgICAgfVxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFx1NjI3OVx1OTFDRlx1NTZERVx1NTE5OVx1NUY1M1x1NTI0RFx1NzZFRVx1NUY1NVxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6ICdwdXNoYmFjay1kaXInLFxuICAgIG5hbWU6ICdcdTYyNzlcdTkxQ0ZcdTU2REVcdTUxOTlcdTVGNTNcdTUyNERcdTc2RUVcdTVGNTVcdTUyMzBcdTk4REVcdTRFNjYnLFxuICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlID0gYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gICAgICBpZiAoIWZpbGUpIHtcbiAgICAgICAgbmV3IE5vdGljZSgnXHUyNkEwXHVGRTBGIFx1OEJGN1x1NTE0OFx1NjI1M1x1NUYwMFx1NEUwMFx1NEUyQVx1NjU4N1x1NEVGNlx1NEVFNVx1Nzg2RVx1NUI5QVx1NzZFRVx1NUY1NScpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBkaXIgPSBmaWxlLnBhcmVudD8ucGF0aDtcbiAgICAgIGlmICghZGlyKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IGZpbGVzID0gYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKS5maWx0ZXIoZiA9PiBmLnBhdGguc3RhcnRzV2l0aChkaXIgKyAnLycpKTtcbiAgICAgIGxldCBwdXNoZWQgPSAwO1xuICAgICAgbGV0IHNraXBwZWQgPSAwO1xuICAgICAgbGV0IGZhaWxlZCA9IDA7XG5cbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBjcmVhdGVQdXNoYmFja0hhbmRsZXIoe1xuICAgICAgICBhcHAsXG4gICAgICAgIHNldHRpbmdzLFxuICAgICAgICBub3RpY2U6ICgpID0+IHt9LFxuICAgICAgfSk7XG5cbiAgICAgIGZvciAoY29uc3QgZiBvZiBmaWxlcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IHBsdWdpbi5kb2N1bWVudENvb3JkaW5hdGlvbktleSh1bmRlZmluZWQsIGYucGF0aCk7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcGx1Z2luLnN5bmNDb29yZGluYXRvci5ydW4oa2V5LCB1bmRlZmluZWQsICgpID0+IGhhbmRsZXIoe1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6ICcvcHVzaGJhY2snLFxuICAgICAgICAgICAgcGF0aDogJy9wdXNoYmFjaycsXG4gICAgICAgICAgICBxdWVyeTogbmV3IFVSTFNlYXJjaFBhcmFtcygpLFxuICAgICAgICAgICAgYm9keTogeyBwYXRoOiBmLnBhdGggfSxcbiAgICAgICAgICAgIHRva2VuOiAnJyxcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgaWYgKHJlc3VsdC5hY3Rpb24gPT09ICdwdXNoZWQnKSBwdXNoZWQrKztcbiAgICAgICAgICBlbHNlIHNraXBwZWQrKztcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgZmFpbGVkKys7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbmV3IE5vdGljZShgXHUyQjA2IFx1NjI3OVx1OTFDRlx1NTZERVx1NTE5OVx1NUI4Q1x1NjIxMFx1RkYxQVx1NjNBOFx1OTAwMSAke3B1c2hlZH1cdUZGMENcdThERjNcdThGQzcgJHtza2lwcGVkfVx1RkYwQ1x1NTkzMVx1OEQyNSAke2ZhaWxlZH1gKTtcbiAgICB9LFxuICB9KTtcblxuICAvLyBcdTYyNzlcdTkxQ0ZcdTUyMDZcdTkxNERcdTdGMTZcdTc4MDFcdUZGMDhcdTVGNTNcdTUyNERcdTc2RUVcdTVGNTVcdUZGMDlcbiAgcGx1Z2luLmFkZENvbW1hbmQoe1xuICAgIGlkOiAnYXNzaWduLWVuY29kaW5nLWRpcicsXG4gICAgbmFtZTogJ1x1NjI3OVx1OTFDRlx1NTIwNlx1OTE0RFx1N0YxNlx1NzgwMVx1RkYwOFx1NUY1M1x1NTI0RFx1NzZFRVx1NUY1NVx1RkYwOScsXG4gICAgY2FsbGJhY2s6IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbGUgPSBhcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgICAgIGlmICghZmlsZSkge1xuICAgICAgICBuZXcgTm90aWNlKCdcdTI2QTBcdUZFMEYgXHU4QkY3XHU1MTQ4XHU2MjUzXHU1RjAwXHU0RTAwXHU0RTJBXHU2NTg3XHU0RUY2XHU0RUU1XHU3ODZFXHU1QjlBXHU3NkVFXHU1RjU1Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRpciA9IGZpbGUucGFyZW50Py5wYXRoO1xuICAgICAgaWYgKCFkaXIpIHJldHVybjtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYmF0Y2hBc3NpZ25FbmNvZGluZyhhcHAsIGRpcik7XG4gICAgICBuZXcgTm90aWNlKGBcdUQ4M0RcdUREMjIgXHU3RjE2XHU3ODAxXHU1MjA2XHU5MTREXHVGRjFBJHtyZXN1bHQuYXNzaWduZWR9LyR7cmVzdWx0LnRvdGFsfWApO1xuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFx1NTIzN1x1NjVCMFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6ICdyZWZyZXNoLW1hcHBpbmcnLFxuICAgIG5hbWU6ICdcdTUyMzdcdTY1QjBcdTc2RUVcdTVGNTVcdTY2MjBcdTVDMDRcdUZGMDhPQlx1MjE5Mlx1OThERVx1NEU2Nlx1RkYwOScsXG4gICAgY2FsbGJhY2s6IGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IHJlZnJlc2hNYXBwaW5nKGFwcCwgc2V0dGluZ3Muc3BhY2VJZCk7XG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gXHU2NjNFXHU3OTNBXHU1NDJGXHU1MkE4XHU0RUU0XHU3MjRDXG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogJ3Nob3ctdG9rZW4nLFxuICAgIG5hbWU6ICdcdTY2M0VcdTc5M0FcdTU0MkZcdTUyQThcdTRFRTRcdTcyNENcdUZGMDhcdThGREVcdTYzQTVcdTZENEZcdTg5QzhcdTU2NjhcdTYyNjlcdTVDNTVcdTc1MjhcdUZGMDknLFxuICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICBjb25zdCBtb2RhbCA9IG5ldyBUb2tlbk1vZGFsKGFwcCwgc2V0dGluZ3Muc3luY1Rva2VuKTtcbiAgICAgIG1vZGFsLm9wZW4oKTtcbiAgICB9LFxuICB9KTtcblxuICAvLyBcdTY2M0VcdTc5M0FcdTY3MDBcdThGRDFcdTU0MENcdTZCNjVcdThCQjBcdTVGNTVcbiAgcGx1Z2luLmFkZENvbW1hbmQoe1xuICAgIGlkOiAnc2hvdy1yZWNlbnQnLFxuICAgIG5hbWU6ICdcdTY2M0VcdTc5M0FcdTY3MDBcdThGRDFcdTU0MENcdTZCNjVcdThCQjBcdTVGNTUnLFxuICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICBjb25zdCByZWNlbnQgPSBwbHVnaW4uc3RhdGUucmVjZW50U3luY3M7XG4gICAgICBpZiAocmVjZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBuZXcgTm90aWNlKCdcdUZGMDhcdTY2ODJcdTY1RTBcdTU0MENcdTZCNjVcdThCQjBcdTVGNTVcdUZGMDknKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgbGluZXMgPSByZWNlbnQuc2xpY2UoMCwgMTApLm1hcChcbiAgICAgICAgciA9PiBgJHtyLmFjdGlvbiA9PT0gJ2NyZWF0ZWQnID8gJ1x1Mjc5NScgOiByLmFjdGlvbiA9PT0gJ3VwZGF0ZWQnID8gJ1x1MjcwRicgOiAnXHUyNzRDJ30gJHtyLnRpdGxlfSBcdTIxOTIgJHtyLnBhdGh9YCxcbiAgICAgICk7XG4gICAgICBjb25zdCBtb2RhbCA9IG5ldyBNb2RhbChhcHApO1xuICAgICAgbW9kYWwudGl0bGVFbC5zZXRUZXh0KCdcdTY3MDBcdThGRDFcdTU0MENcdTZCNjVcdThCQjBcdTVGNTUnKTtcbiAgICAgIGNvbnN0IHByZSA9IG1vZGFsLmNvbnRlbnRFbC5jcmVhdGVFbCgncHJlJyk7XG4gICAgICBwcmUuc2V0VGV4dChsaW5lcy5qb2luKCdcXG4nKSk7XG4gICAgICBtb2RhbC5vcGVuKCk7XG4gICAgfSxcbiAgfSk7XG59XG5cbi8qKiBcdTRFRTRcdTcyNENcdTVDNTVcdTc5M0EgTW9kYWxcdTMwMDIgKi9cbmNsYXNzIFRva2VuTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIHRva2VuOiBzdHJpbmcpIHtcbiAgICBzdXBlcihhcHApO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuICAgIGNvbnRlbnRFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdcdTU0MkZcdTUyQThcdTRFRTRcdTcyNEMnIH0pO1xuICAgIGNvbnRlbnRFbC5jcmVhdGVFbCgncCcsIHtcbiAgICAgIHRleHQ6ICdcdTU5MERcdTUyMzZcdTZCNjRcdTRFRTRcdTcyNENcdUZGMENcdTdDOThcdThEMzRcdTUyMzBcdTZENEZcdTg5QzhcdTU2NjhcdTYyNjlcdTVDNTVcdTVGMzlcdTdBOTdcdTc2ODRcIlRva2VuXCJcdThGOTNcdTUxNjVcdTY4NDZcdTMwMDInLFxuICAgICAgY2xzOiAnc2V0dGluZy1pdGVtLWRlc2NyaXB0aW9uJyxcbiAgICB9KTtcbiAgICBjb25zdCBjb2RlRWwgPSBjb250ZW50RWwuY3JlYXRlRWwoJ2NvZGUnKTtcbiAgICBjb2RlRWwuc2V0VGV4dCh0aGlzLnRva2VuKTtcbiAgICBjb2RlRWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgY29kZUVsLnN0eWxlLnBhZGRpbmcgPSAnMTJweCc7XG4gICAgY29kZUVsLnN0eWxlLmZvbnRGYW1pbHkgPSAnbW9ub3NwYWNlJztcbiAgICBjb2RlRWwuc3R5bGUud29yZEJyZWFrID0gJ2JyZWFrLWFsbCc7XG4gICAgY29kZUVsLnN0eWxlLmJhY2tncm91bmQgPSAndmFyKC0tYmFja2dyb3VuZC1zZWNvbmRhcnkpJztcblxuICAgIGNvbnN0IGJ0biA9IGNvbnRlbnRFbC5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnXHU1OTBEXHU1MjM2JyB9KTtcbiAgICBidG4ub25jbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRoaXMudG9rZW4pO1xuICAgICAgbmV3IE5vdGljZSgnXHUyNzA1IFx1NURGMlx1NTkwRFx1NTIzNicpO1xuICAgIH07XG4gIH1cblxuICBvbkNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBNb2RhbCwgTm90aWNlLCBURmlsZSwgVEZvbGRlciwgdHlwZSBBcHAgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQge1xuICBPQlNJRElBTl9MQVJLX0RPQ19BQ1RJT04sXG4gIHBhcnNlT2JzaWRpYW5MYXJrRG9jUGFyYW1zLFxuICB0eXBlIEZldGNoUmVxdWVzdCxcbn0gZnJvbSAnQHN5bmMvc2hhcmVkJztcbmltcG9ydCB0eXBlIHsgRmVpc2h1U3luY1BsdWdpbiB9IGZyb20gJy4vbWFpbi5qcyc7XG5pbXBvcnQgeyBjcmVhdGVGZXRjaEhhbmRsZXIgfSBmcm9tICcuL2hhbmRsZXJzL2ZldGNoSGFuZGxlci5qcyc7XG5pbXBvcnQgeyByZXNvbHZlTm9kZVRva2VuRnJvbVVybCB9IGZyb20gJy4vbGFyay9jbGkuanMnO1xuaW1wb3J0IHsgbm9ybWFsaXplVmF1bHREaXIgfSBmcm9tICcuL3ZhdWx0UGF0aC5qcyc7XG5cbnR5cGUgVHJpZ2dlclNvdXJjZSA9ICdwcm90b2NvbCcgfCAnY29tbWFuZCcgfCAnY2xpcHBlcic7XG5cbmludGVyZmFjZSBUcmlnZ2VySW5wdXQge1xuICBub2RlX3Rva2VuPzogc3RyaW5nO1xuICBvYmpfdG9rZW4/OiBzdHJpbmc7XG4gIHNwYWNlX2lkPzogc3RyaW5nO1xuICB0aXRsZT86IHN0cmluZztcbiAgdXJsPzogc3RyaW5nO1xuICBkaXI/OiBzdHJpbmc7XG4gIHJlcGxhY2VfcGF0aD86IHN0cmluZztcbiAgc291cmNlOiBUcmlnZ2VyU291cmNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJGZXRjaEVudHJ5cG9pbnRzKHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbik6IHZvaWQge1xuICBwbHVnaW4ucmVnaXN0ZXJPYnNpZGlhblByb3RvY29sSGFuZGxlcihPQlNJRElBTl9MQVJLX0RPQ19BQ1RJT04sIChwYXJhbXMpID0+IHtcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZU9ic2lkaWFuTGFya0RvY1BhcmFtcyhwYXJhbXMpO1xuICAgIHZvaWQgdHJpZ2dlckZldGNoKHBsdWdpbiwge1xuICAgICAgbm9kZV90b2tlbjogcGFyc2VkLm5vZGVfdG9rZW4gfHwgcGFyc2VkLnRva2VuLFxuICAgICAgb2JqX3Rva2VuOiBwYXJzZWQub2JqX3Rva2VuLFxuICAgICAgc3BhY2VfaWQ6IHBhcnNlZC5zcGFjZV9pZCxcbiAgICAgIHRpdGxlOiBwYXJzZWQudGl0bGUsXG4gICAgICB1cmw6IHBhcnNlZC51cmwsXG4gICAgICBkaXI6IHBhcnNlZC5kaXIsXG4gICAgICBzb3VyY2U6ICdwcm90b2NvbCcsXG4gICAgfSk7XG4gIH0pO1xuXG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogJ2ZldGNoLWZlaXNodS1kb2MnLFxuICAgIG5hbWU6ICdcdTYyQzlcdTUzRDZcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjMnLFxuICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICBuZXcgRmVpc2h1SW5wdXRNb2RhbChwbHVnaW4uYXBwLCBhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VVc2VySW5wdXQodmFsdWUpO1xuICAgICAgICBhd2FpdCB0cmlnZ2VyRmV0Y2gocGx1Z2luLCB7XG4gICAgICAgICAgLi4ucGFyc2VkLFxuICAgICAgICAgIHNvdXJjZTogJ2NvbW1hbmQnLFxuICAgICAgICB9KTtcbiAgICAgIH0pLm9wZW4oKTtcbiAgICB9LFxuICB9KTtcblxuICBwbHVnaW4ucmVnaXN0ZXJFdmVudChcbiAgICBwbHVnaW4uYXBwLnZhdWx0Lm9uKCdjcmVhdGUnLCAoZmlsZSkgPT4ge1xuICAgICAgaWYgKCEoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB8fCBmaWxlLmV4dGVuc2lvbiAhPT0gJ21kJykgcmV0dXJuO1xuICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB2b2lkIGhhbmRsZUNsaXBwZXJQbGFjZWhvbGRlcihwbHVnaW4sIGZpbGUpO1xuICAgICAgfSwgMjUwKTtcbiAgICB9KSxcbiAgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdHJpZ2dlckZldGNoKHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbiwgaW5wdXQ6IFRyaWdnZXJJbnB1dCk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCByZXNvbHZlZCA9IG5vcm1hbGl6ZUlucHV0KHBsdWdpbiwgaW5wdXQpO1xuICBpZiAoIXJlc29sdmVkLm5vZGVfdG9rZW4pIHtcbiAgICBuZXcgTm90aWNlKCdcdTY1RTBcdTZDRDVcdThCQzZcdTUyMkJcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjMgdG9rZW4nKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCByZXE6IEZldGNoUmVxdWVzdCA9IHtcbiAgICBub2RlX3Rva2VuOiByZXNvbHZlZC5ub2RlX3Rva2VuLFxuICAgIG9ial90b2tlbjogcmVzb2x2ZWQub2JqX3Rva2VuLFxuICAgIHNwYWNlX2lkOiByZXNvbHZlZC5zcGFjZV9pZCB8fCBwbHVnaW4uc2V0dGluZ3Muc3BhY2VJZCxcbiAgICBkaXI6IHJlc29sdmVkLmRpciB8fCBwbHVnaW4uc2V0dGluZ3MuZGVmYXVsdERpcixcbiAgICBmaWxlbmFtZTogcmVzb2x2ZWQudGl0bGUsXG4gICAgcmVwbGFjZV9wYXRoOiByZXNvbHZlZC5yZXBsYWNlX3BhdGgsXG4gIH07XG5cbiAgY29uc3QgcnVuID0gYXN5bmMgKGRpcj86IHN0cmluZykgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gY3JlYXRlRmV0Y2hIYW5kbGVyKHtcbiAgICAgICAgYXBwOiBwbHVnaW4uYXBwLFxuICAgICAgICBzZXR0aW5nczogcGx1Z2luLnNldHRpbmdzLFxuICAgICAgICBzdGF0ZTogcGx1Z2luLnN0YXRlLFxuICAgICAgICBub3RpY2U6IChtZXNzYWdlKSA9PiBuZXcgTm90aWNlKG1lc3NhZ2UpLFxuICAgICAgfSk7XG4gICAgICBjb25zdCB0YXJnZXREaXIgPSBub3JtYWxpemVWYXVsdERpcihkaXIgfHwgcmVxLmRpciB8fCBwbHVnaW4uc2V0dGluZ3MuZGVmYXVsdERpcik7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwbHVnaW4uc3luY0Nvb3JkaW5hdG9yLnJ1bihgZG9jdW1lbnQ6JHtyZXEubm9kZV90b2tlbn1gLCB1bmRlZmluZWQsICgpID0+XG4gICAgICAgIHBsdWdpbi5zeW5jQ29vcmRpbmF0b3IucnVuKGBkaXJlY3Rvcnk6JHt0YXJnZXREaXJ9YCwgdW5kZWZpbmVkLCAoKSA9PiBoYW5kbGVyKHtcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICB1cmw6ICcvZmV0Y2gnLFxuICAgICAgICAgIHBhdGg6ICcvZmV0Y2gnLFxuICAgICAgICAgIHF1ZXJ5OiBuZXcgVVJMU2VhcmNoUGFyYW1zKCksXG4gICAgICAgICAgYm9keTogeyAuLi5yZXEsIGRpcjogdGFyZ2V0RGlyIH0sXG4gICAgICAgICAgdG9rZW46ICcnLFxuICAgICAgICB9KSkpO1xuICAgICAgbmV3IE5vdGljZShgJHtyZXN1bHQuYWN0aW9uID09PSAnY3JlYXRlZCcgPyAnXHU1REYyXHU1MjFCXHU1RUZBJyA6ICdcdTVERjJcdTY2RjRcdTY1QjAnfVx1RkYxQSR7cmVzdWx0LnBhdGh9YCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBuZXcgTm90aWNlKGBcdTU0MENcdTZCNjVcdTU5MzFcdThEMjVcdUZGMUEke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKX1gKTtcbiAgICB9XG4gIH07XG5cbiAgaWYgKGlucHV0LnNvdXJjZSA9PT0gJ3Byb3RvY29sJyAmJiAhaW5wdXQuZGlyKSB7XG4gICAgbmV3IEZvbGRlclBpY2tNb2RhbChwbHVnaW4uYXBwLCBwbHVnaW4uc2V0dGluZ3MuZGVmYXVsdERpciwgcnVuKS5vcGVuKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgYXdhaXQgcnVuKHJlcS5kaXIpO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVJbnB1dChwbHVnaW46IEZlaXNodVN5bmNQbHVnaW4sIGlucHV0OiBUcmlnZ2VySW5wdXQpOiBUcmlnZ2VySW5wdXQge1xuICBpZiAoaW5wdXQudXJsKSB7XG4gICAgY29uc3QgZnJvbVVybCA9IHJlc29sdmVOb2RlVG9rZW5Gcm9tVXJsKGlucHV0LnVybCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmlucHV0LFxuICAgICAgbm9kZV90b2tlbjogaW5wdXQubm9kZV90b2tlbiB8fCBmcm9tVXJsLm5vZGVfdG9rZW4gfHwgaW5wdXQub2JqX3Rva2VuIHx8IGZyb21Vcmwub2JqX3Rva2VuLFxuICAgICAgb2JqX3Rva2VuOiBpbnB1dC5vYmpfdG9rZW4gfHwgZnJvbVVybC5vYmpfdG9rZW4sXG4gICAgfTtcbiAgfVxuICByZXR1cm4ge1xuICAgIC4uLmlucHV0LFxuICAgIG5vZGVfdG9rZW46IGlucHV0Lm5vZGVfdG9rZW4gfHwgaW5wdXQub2JqX3Rva2VuLFxuICAgIHNwYWNlX2lkOiBpbnB1dC5zcGFjZV9pZCB8fCBwbHVnaW4uc2V0dGluZ3Muc3BhY2VJZCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gcGFyc2VVc2VySW5wdXQodmFsdWU6IHN0cmluZyk6IE9taXQ8VHJpZ2dlcklucHV0LCAnc291cmNlJz4ge1xuICBjb25zdCB0cmltbWVkID0gdmFsdWUudHJpbSgpO1xuICBpZiAoL15odHRwcz86XFwvXFwvLy50ZXN0KHRyaW1tZWQpKSB7XG4gICAgY29uc3QgcGFyc2VkID0gcmVzb2x2ZU5vZGVUb2tlbkZyb21VcmwodHJpbW1lZCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5vZGVfdG9rZW46IHBhcnNlZC5ub2RlX3Rva2VuIHx8IHBhcnNlZC5vYmpfdG9rZW4sXG4gICAgICBvYmpfdG9rZW46IHBhcnNlZC5vYmpfdG9rZW4sXG4gICAgICB1cmw6IHRyaW1tZWQsXG4gICAgfTtcbiAgfVxuICBjb25zdCBwcm90b2NvbFBhcmFtcyA9IHBhcnNlT2JzaWRpYW5MYXJrRG9jUGFyYW1zKHRyaW1tZWQpO1xuICBpZiAocHJvdG9jb2xQYXJhbXMudG9rZW4gfHwgcHJvdG9jb2xQYXJhbXMubm9kZV90b2tlbiB8fCBwcm90b2NvbFBhcmFtcy5vYmpfdG9rZW4pIHtcbiAgICByZXR1cm4ge1xuICAgICAgbm9kZV90b2tlbjogcHJvdG9jb2xQYXJhbXMubm9kZV90b2tlbiB8fCBwcm90b2NvbFBhcmFtcy50b2tlbiB8fCBwcm90b2NvbFBhcmFtcy5vYmpfdG9rZW4sXG4gICAgICBvYmpfdG9rZW46IHByb3RvY29sUGFyYW1zLm9ial90b2tlbixcbiAgICAgIHNwYWNlX2lkOiBwcm90b2NvbFBhcmFtcy5zcGFjZV9pZCxcbiAgICAgIHRpdGxlOiBwcm90b2NvbFBhcmFtcy50aXRsZSxcbiAgICAgIHVybDogcHJvdG9jb2xQYXJhbXMudXJsLFxuICAgICAgZGlyOiBwcm90b2NvbFBhcmFtcy5kaXIsXG4gICAgfTtcbiAgfVxuICByZXR1cm4geyBub2RlX3Rva2VuOiB0cmltbWVkIH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNsaXBwZXJQbGFjZWhvbGRlcihwbHVnaW46IEZlaXNodVN5bmNQbHVnaW4sIGZpbGU6IFRGaWxlKTogUHJvbWlzZTx2b2lkPiB7XG4gIGxldCBjb250ZW50ID0gJyc7XG4gIHRyeSB7XG4gICAgY29udGVudCA9IGF3YWl0IHBsdWdpbi5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgdXJsID0gZXh0cmFjdENsaXBwZXJVcmwoY29udGVudCk7XG4gIGlmICghdXJsKSByZXR1cm47XG4gIGNvbnN0IHBhcnNlZCA9IHJlc29sdmVOb2RlVG9rZW5Gcm9tVXJsKHVybCk7XG4gIGNvbnN0IG5vZGVUb2tlbiA9IHBhcnNlZC5ub2RlX3Rva2VuIHx8IHBhcnNlZC5vYmpfdG9rZW47XG4gIGlmICghbm9kZVRva2VuKSByZXR1cm47XG5cbiAgYXdhaXQgdHJpZ2dlckZldGNoKHBsdWdpbiwge1xuICAgIG5vZGVfdG9rZW46IG5vZGVUb2tlbixcbiAgICBvYmpfdG9rZW46IHBhcnNlZC5vYmpfdG9rZW4sXG4gICAgdXJsLFxuICAgIGRpcjogZmlsZS5wYXJlbnQ/LnBhdGggfHwgcGx1Z2luLnNldHRpbmdzLmRlZmF1bHREaXIsXG4gICAgcmVwbGFjZV9wYXRoOiBmaWxlLnBhdGgsXG4gICAgc291cmNlOiAnY2xpcHBlcicsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0Q2xpcHBlclVybChjb250ZW50OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3QgcGF0dGVybnMgPSBbXG4gICAgL2ZlaXNodV9zeW5jX3VybDpcXHMqW1wiJ10/KFteXFxuXCInXSspLyxcbiAgICAvc291cmNlOlxccypbXCInXT8oaHR0cHM/OlxcL1xcL1teXFxuXCInXSooPzpmZWlzaHVcXC5jbnxsYXJrc3VpdGVcXC5jb20pXFwvKD86d2lraXxkb2N4fGRvYylcXC9bQS1aYS16MC05XSspLyxcbiAgICAvKGh0dHBzPzpcXC9cXC9bXlxccylcIiddKig/OmZlaXNodVxcLmNufGxhcmtzdWl0ZVxcLmNvbSlcXC8oPzp3aWtpfGRvY3h8ZG9jKVxcL1tBLVphLXowLTldKykvLFxuICBdO1xuICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgcGF0dGVybnMpIHtcbiAgICBjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2gocGF0dGVybik7XG4gICAgaWYgKG1hdGNoPy5bMV0pIHJldHVybiBtYXRjaFsxXS50cmltKCk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmNsYXNzIEZlaXNodUlucHV0TW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIHByaXZhdGUgaW5wdXRFbCE6IEhUTUxJbnB1dEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgb25TdWJtaXQ6ICh2YWx1ZTogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+KSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgfVxuXG4gIG9uT3BlbigpOiB2b2lkIHtcbiAgICB0aGlzLnRpdGxlRWwuc2V0VGV4dCgnXHU2MkM5XHU1M0Q2XHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzJyk7XG4gICAgdGhpcy5pbnB1dEVsID0gdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ2lucHV0Jywge1xuICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgcGxhY2Vob2xkZXI6ICdcdTdDOThcdThEMzRcdTk4REVcdTRFNjZcdTk0RkVcdTYzQTVcdTMwMDF0b2tlbiBcdTYyMTYgb2JzaWRpYW46Ly9sYXJrLWRvYyBcdTU3MzBcdTU3NDAnLFxuICAgIH0pO1xuICAgIHRoaXMuaW5wdXRFbC5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICB0aGlzLmlucHV0RWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmtleSAhPT0gJ0VudGVyJykgcmV0dXJuO1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5pbnB1dEVsLnZhbHVlLnRyaW0oKTtcbiAgICAgIGlmICghdmFsdWUpIHJldHVybjtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIHZvaWQgdGhpcy5vblN1Ym1pdCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgdGhpcy5pbnB1dEVsLmZvY3VzKCk7XG4gIH1cblxuICBvbkNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gIH1cbn1cblxuY2xhc3MgRm9sZGVyUGlja01vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBjb25zdHJ1Y3RvcihcbiAgICBhcHA6IEFwcCxcbiAgICBwcml2YXRlIGRlZmF1bHREaXI6IHN0cmluZyxcbiAgICBwcml2YXRlIG9uU3VibWl0OiAoZGlyOiBzdHJpbmcpID0+IFByb21pc2U8dm9pZD4sXG4gICkge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBvbk9wZW4oKTogdm9pZCB7XG4gICAgdGhpcy50aXRsZUVsLnNldFRleHQoJ1x1OTAwOVx1NjJFOVx1NTQwQ1x1NkI2NVx1NzZFRVx1NUY1NScpO1xuICAgIGNvbnN0IHNlbGVjdCA9IHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdzZWxlY3QnKTtcbiAgICBzZWxlY3Quc3R5bGUud2lkdGggPSAnMTAwJSc7XG5cbiAgICBjb25zdCBmb2xkZXJzID0gZ2V0Rm9sZGVycyh0aGlzLmFwcCk7XG4gICAgZm9yIChjb25zdCBmb2xkZXIgb2YgZm9sZGVycykge1xuICAgICAgY29uc3Qgb3B0aW9uID0gc2VsZWN0LmNyZWF0ZUVsKCdvcHRpb24nLCB7XG4gICAgICAgIHRleHQ6IGZvbGRlci5wYXRoIHx8ICcvJyxcbiAgICAgICAgdmFsdWU6IGZvbGRlci5wYXRoLFxuICAgICAgfSk7XG4gICAgICBvcHRpb24uc2VsZWN0ZWQgPSBmb2xkZXIucGF0aCA9PT0gdGhpcy5kZWZhdWx0RGlyO1xuICAgIH1cblxuICAgIGNvbnN0IHJvdyA9IHRoaXMuY29udGVudEVsLmNyZWF0ZURpdigpO1xuICAgIHJvdy5zdHlsZS5tYXJnaW5Ub3AgPSAnMTJweCc7XG4gICAgY29uc3QgY29uZmlybSA9IHJvdy5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnXHU1NDBDXHU2QjY1JyB9KTtcbiAgICBjb25maXJtLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICBjb25zdCBkaXIgPSBzZWxlY3QudmFsdWUgfHwgdGhpcy5kZWZhdWx0RGlyO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgdm9pZCB0aGlzLm9uU3VibWl0KGRpcik7XG4gICAgfTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRGb2xkZXJzKGFwcDogQXBwKTogVEZvbGRlcltdIHtcbiAgY29uc3QgZm9sZGVycyA9IGFwcC52YXVsdFxuICAgIC5nZXRBbGxMb2FkZWRGaWxlcygpXG4gICAgLmZpbHRlcigoZmlsZSk6IGZpbGUgaXMgVEZvbGRlciA9PiBmaWxlIGluc3RhbmNlb2YgVEZvbGRlcilcbiAgICAuZmlsdGVyKChmb2xkZXIpID0+ICFmb2xkZXIucGF0aC5zdGFydHNXaXRoKCcub2JzaWRpYW4nKSAmJiAhZm9sZGVyLnBhdGguc3RhcnRzV2l0aCgnLmZlaXNodS1zeW5jJykpO1xuICByZXR1cm4gZm9sZGVycy5sZW5ndGggPiAwID8gZm9sZGVycyA6IFthcHAudmF1bHQuZ2V0Um9vdCgpXTtcbn1cbiIsICIvKipcbiAqIFx1NTZGRVx1NzI0N1x1OTg4NFx1ODlDOFx1NkUzMlx1NjdEM1x1MzAwMlx1NEY5RFx1NjM2RSBgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTczLjMgKyBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTUxNkRcdTMwMDJcbiAqXG4gKiBPQiBtZCBcdTkxQ0NcdTU2RkVcdTcyNDdcdTUxOTlcdTYyMTAgYCFbXShmZWlzaHU6Ly9GSUxFX1RPS0VOKWBcdUZGMENcdTZFMzJcdTY3RDNcdTY1RjZcdThDMDMgbGFyay1jbGkgXHU2MzYyXHU0RTM0XHU2NUY2XHU5NEZFXHU2M0E1XHUzMDAyXG4gKiBcdTVFMjYgTFJVIFx1N0YxM1x1NUI1OFx1RkYwOFx1OTA3Rlx1NTE0RFx1NkJDRlx1NkIyMVx1NkUzMlx1NjdEM1x1OTBGRFx1NEUwQlx1OEY3RFx1RkYwOVx1RkYwQ1x1N0YxM1x1NUI1OFx1NzZFRVx1NUY1NVx1NTcyOCB2YXVsdCBcdTRFMEIgYC5mZWlzaHUtc3luYy9jYWNoZS9gXHUzMDAyXG4gKi9cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgTm90aWNlLCBQbGF0Zm9ybSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7IHJ1biB9IGZyb20gJy4vbGFyay9jbGkuanMnO1xuaW1wb3J0IHsgdmFsaWRhdGVJbWFnZVRva2VuIH0gZnJvbSAnLi92YXVsdFBhdGguanMnO1xuXG5jb25zdCBDQUNIRV9ESVIgPSAnLmZlaXNodS1zeW5jL2NhY2hlJztcblxuLyoqXG4gKiBcdTZDRThcdTUxOENcdTU2RkVcdTcyNDdcdTZFMzJcdTY3RDNcdTU5MDRcdTc0MDZcdTU2NjhcdTMwMDJcbiAqIFx1NjJFNlx1NjIyQVx1NkUzMlx1NjdEM1x1NTQwRVx1NzY4NCA8aW1nIHNyYz1cImZlaXNodTovL1RPS0VOXCI+XHVGRjBDXHU2MzYyXHU2MjEwIGxhcmstY2xpIFx1NEUwQlx1OEY3RFx1NzY4NFx1NjcyQ1x1NTczMFx1NEUzNFx1NjVGNlx1NjU4N1x1NEVGNlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJJbWFnZVJlbmRlcmVyKHBsdWdpbjogUGx1Z2luKTogdm9pZCB7XG4gIGlmICghUGxhdGZvcm0uaXNEZXNrdG9wQXBwKSByZXR1cm47XG5cbiAgcGx1Z2luLnJlZ2lzdGVyTWFya2Rvd25Qb3N0UHJvY2Vzc29yKGFzeW5jIChlbCkgPT4ge1xuICAgIGNvbnN0IGltZ3MgPSBlbC5xdWVyeVNlbGVjdG9yQWxsKCdpbWcnKTtcbiAgICBmb3IgKGNvbnN0IGltZyBvZiBBcnJheS5mcm9tKGltZ3MpKSB7XG4gICAgICBjb25zdCBzcmMgPSBpbWcuZ2V0QXR0cmlidXRlKCdzcmMnKSB8fCAnJztcbiAgICAgIGlmICghc3JjLnN0YXJ0c1dpdGgoJ2ZlaXNodTovLycpKSBjb250aW51ZTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSB2YWxpZGF0ZUltYWdlVG9rZW4oc3JjLnNsaWNlKCdmZWlzaHU6Ly8nLmxlbmd0aCkpO1xuICAgICAgICBjb25zdCBsb2NhbFBhdGggPSBhd2FpdCByZXNvbHZlSW1hZ2UocGx1Z2luLCB0b2tlbik7XG4gICAgICAgIGlmIChsb2NhbFBhdGgpIHtcbiAgICAgICAgICAvLyBcdTc1MjggdmF1bHQ6Ly8gXHU5NEZFXHU2M0E1XHU2MjE2IGFwcDovL2xvY2FsLyBcdTk0RkVcdTYzQTVcbiAgICAgICAgICBjb25zdCB2YXVsdEJhc2UgPSAoXG4gICAgICAgICAgICBwbHVnaW4uYXBwLnZhdWx0LmFkYXB0ZXIgYXMgdHlwZW9mIHBsdWdpbi5hcHAudmF1bHQuYWRhcHRlciAmIHsgZ2V0QmFzZVBhdGg/OiAoKSA9PiBzdHJpbmcgfVxuICAgICAgICAgICkuZ2V0QmFzZVBhdGg/LigpID8/ICcnO1xuICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKHZhdWx0QmFzZSwgbG9jYWxQYXRoKTtcbiAgICAgICAgICBpbWcuc2V0QXR0cmlidXRlKCdzcmMnLCBgYXBwOi8vbG9jYWwvJHtmdWxsUGF0aH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbWcuc2V0QXR0cmlidXRlKCdhbHQnLCBgW1x1OThERVx1NEU2Nlx1NTZGRVx1NzI0NyAke3Rva2VuLnNsaWNlKDAsIDgpfSBcdTUyQTBcdThGN0RcdTU5MzFcdThEMjVdYCk7XG4gICAgICAgICAgaW1nLnNldEF0dHJpYnV0ZSgnc3JjJywgJycpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbc3luYy9pbWFnZV0gcmVuZGVyIGZhaWxlZDonLCBlcnIpO1xuICAgICAgICBpbWcuc2V0QXR0cmlidXRlKCdhbHQnLCAnW1x1OThERVx1NEU2Nlx1NTZGRVx1NzI0N1x1NTJBMFx1OEY3RFx1NTkzMVx1OEQyNV0nKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFx1ODlFM1x1Njc5MFx1NTM1NVx1NEUyQVx1OThERVx1NEU2Nlx1NTZGRVx1NzI0NyB0b2tlbiBcdTIxOTIgXHU2NzJDXHU1NzMwXHU3RjEzXHU1QjU4XHU4REVGXHU1Rjg0XHUzMDAyXG4gKiBcdTU0N0RcdTRFMkRcdTdGMTNcdTVCNThcdTc2RjRcdTYzQTVcdThGRDRcdTU2REVcdUZGMENcdTU0MjZcdTUyMTlcdThDMDMgbGFyay1jbGkgZG9jcyArbWVkaWEtZG93bmxvYWQgXHU0RTBCXHU4RjdEXHUzMDAyXG4gKi9cbmNvbnN0IHJlc29sdmluZyA9IG5ldyBNYXA8c3RyaW5nLCBQcm9taXNlPHN0cmluZyB8IG51bGw+PigpO1xuXG5hc3luYyBmdW5jdGlvbiByZXNvbHZlSW1hZ2UocGx1Z2luOiBQbHVnaW4sIHRva2VuOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgLy8gXHU1RTc2XHU1M0QxXHU1M0JCXHU5MUNEXHVGRjA4XHU1NDBDXHU0RTAwIHRva2VuIFx1NTkxQVx1NEUyQSBpbWcgXHU1NDBDXHU2NUY2XHU2RTMyXHU2N0QzXHU1M0VBXHU0RTBCXHU4RjdEXHU0RTAwXHU2QjIxXHVGRjA5XG4gIGlmIChyZXNvbHZpbmcuaGFzKHRva2VuKSkgcmV0dXJuIHJlc29sdmluZy5nZXQodG9rZW4pITtcblxuICBjb25zdCBwcm9taXNlID0gZG9SZXNvbHZlSW1hZ2UocGx1Z2luLCB0b2tlbik7XG4gIHJlc29sdmluZy5zZXQodG9rZW4sIHByb21pc2UpO1xuICB0cnkge1xuICAgIHJldHVybiBhd2FpdCBwcm9taXNlO1xuICB9IGZpbmFsbHkge1xuICAgIHJlc29sdmluZy5kZWxldGUodG9rZW4pO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRvUmVzb2x2ZUltYWdlKHBsdWdpbjogUGx1Z2luLCB0b2tlbjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gIGNvbnN0IHsgYWRhcHRlciB9ID0gcGx1Z2luLmFwcC52YXVsdDtcbiAgY29uc3QgZXh0ID0gJy5wbmcnOyAvLyBcdTk4REVcdTRFNjZcdTU2RkVcdTcyNDdcdTlFRDhcdThCQTQgcG5nXHVGRjBDXHU2NUUwXHU2Q0Q1XHU5ODg0XHU3N0U1XHU2ODNDXHU1RjBGXHVGRjBDXHU3RURGXHU0RTAwIHBuZ1xuICBjb25zdCBjYWNoZVBhdGggPSBgJHtDQUNIRV9ESVJ9LyR7dG9rZW59JHtleHR9YDtcblxuICAvLyBcdTU0N0RcdTRFMkRcdTdGMTNcdTVCNThcbiAgaWYgKGF3YWl0IGFkYXB0ZXIuZXhpc3RzKGNhY2hlUGF0aCkpIHtcbiAgICByZXR1cm4gY2FjaGVQYXRoO1xuICB9XG5cbiAgLy8gXHU3ODZFXHU0RkREXHU3RjEzXHU1QjU4XHU3NkVFXHU1RjU1XHU1QjU4XHU1NzI4XG4gIHRyeSB7XG4gICAgaWYgKCEoYXdhaXQgYWRhcHRlci5leGlzdHMoQ0FDSEVfRElSKSkpIHtcbiAgICAgIGF3YWl0IGFkYXB0ZXIubWtkaXIoQ0FDSEVfRElSKTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIC8qIGlnbm9yZSAqL1xuICB9XG5cbiAgLy8gXHU0RTBCXHU4RjdEXHU1MjMwXHU0RTM0XHU2NUY2XHU2NzJDXHU1NzMwXHU4REVGXHU1Rjg0XHVGRjA4bGFyay1jbGkgXHU5NzAwXHU4OTgxXHU2NzJDXHU1NzMwXHU2NTg3XHU0RUY2XHU3Q0ZCXHU3RURGXHU4REVGXHU1Rjg0XHVGRjA5XG4gIGNvbnN0IHZhdWx0QmFzZSA9IChhZGFwdGVyIGFzIHsgZ2V0QmFzZVBhdGg/OiAoKSA9PiBzdHJpbmcgfSkuZ2V0QmFzZVBhdGg/LigpID8/IHByb2Nlc3MuY3dkKCk7XG4gIGNvbnN0IGxvY2FsRnVsbFBhdGggPSBwYXRoLmpvaW4odmF1bHRCYXNlLCBjYWNoZVBhdGgpO1xuXG4gIHRyeSB7XG4gICAgcnVuKFsnZG9jcycsICcrbWVkaWEtZG93bmxvYWQnLCAnLS10b2tlbicsIHRva2VuLCAnLS1vdXRwdXQnLCBsb2NhbEZ1bGxQYXRoXSwge1xuICAgICAgdGltZW91dDogMzAwMDAsXG4gICAgfSk7XG4gICAgcmV0dXJuIGNhY2hlUGF0aDtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS53YXJuKCdbc3luYy9pbWFnZV0gbWVkaWEtZG93bmxvYWQgZmFpbGVkOicsIHRva2VuLCBlcnIpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogXHU2RTA1XHU3NDA2XHU4RkM3XHU2NzFGXHU3RjEzXHU1QjU4XHUzMDAyXHU0RjlEXHU2MzZFXHU4QkJFXHU3RjZFIGNhY2hlQ2xlYW51cCBcdTU0NjhcdTY3MUZcdTMwMDJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFudXBJbWFnZUNhY2hlKHBsdWdpbjogUGx1Z2luLCBtb2RlOiAnZGFpbHknIHwgJ3dlZWtseScgfCAnbW9udGhseScgfCAnbmV2ZXInKTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmIChtb2RlID09PSAnbmV2ZXInKSByZXR1cm47XG5cbiAgY29uc3QgeyBhZGFwdGVyIH0gPSBwbHVnaW4uYXBwLnZhdWx0O1xuICBpZiAoIShhd2FpdCBhZGFwdGVyLmV4aXN0cyhDQUNIRV9ESVIpKSkgcmV0dXJuO1xuXG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gIGNvbnN0IHR0bE1zID1cbiAgICBtb2RlID09PSAnZGFpbHknID8gMjQgKiAzNjAwICogMTAwMCA6XG4gICAgbW9kZSA9PT0gJ3dlZWtseScgPyA3ICogMjQgKiAzNjAwICogMTAwMCA6XG4gICAgMzAgKiAyNCAqIDM2MDAgKiAxMDAwO1xuXG4gIGxldCBjbGVhbmVkID0gMDtcbiAgdHJ5IHtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IGFkYXB0ZXIubGlzdChDQUNIRV9ESVIpO1xuICAgIGZvciAoY29uc3QgZiBvZiBmaWxlcy5maWxlcykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3RhdCA9IGF3YWl0IGFkYXB0ZXIuc3RhdChmKTtcbiAgICAgICAgaWYgKHN0YXQ/Lm10aW1lICYmIG5vdyAtIHN0YXQubXRpbWUgPiB0dGxNcykge1xuICAgICAgICAgIGF3YWl0IGFkYXB0ZXIucmVtb3ZlKGYpO1xuICAgICAgICAgIGNsZWFuZWQrKztcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS53YXJuKCdbc3luYy9pbWFnZV0gY2xlYW51cCBmYWlsZWQ6JywgZXJyKTtcbiAgfVxuXG4gIGlmIChjbGVhbmVkID4gMCkge1xuICAgIG5ldyBOb3RpY2UoYFx1RDgzRVx1RERGOSBcdTVERjJcdTZFMDVcdTc0MDYgJHtjbGVhbmVkfSBcdTRFMkFcdThGQzdcdTY3MUZcdTU2RkVcdTcyNDdcdTdGMTNcdTVCNThgKTtcbiAgfVxufVxuIiwgImNvbnN0IExFR0FDWV9TWVNURU1fUFJPUEVSVFlfS0VZUyA9IG5ldyBTZXQoW1xuICAnZmVpc2h1X2lkJyxcbiAgJ2ZlaXNodV9kb2NfaWQnLFxuICAnZmVpc2h1X3RpdGxlJyxcbiAgJ3N5bmNfaGFzaCcsXG4gICdzeW5jX3RpbWUnLFxuXSk7XG5cbmV4cG9ydCBjb25zdCBTWVNURU1fUFJPUEVSVFlfU1RZTEVfSUQgPSAnZnN0Yi1zeXN0ZW0tcHJvcGVydHktc3R5bGUnO1xuZXhwb3J0IGNvbnN0IFNZU1RFTV9QUk9QRVJUWV9ISURERU5fQ0xBU1MgPSAnZnN0Yi1zeXN0ZW0tcHJvcGVydHktaGlkZGVuJztcbmV4cG9ydCBjb25zdCBTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTUyA9ICdmc3RiLWhpZGUtc3lzdGVtLXByb3BlcnRpZXMnO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNTeXN0ZW1Qcm9wZXJ0eUtleSh2YWx1ZTogdW5rbm93bik6IGJvb2xlYW4ge1xuICBjb25zdCBrZXkgPSBTdHJpbmcodmFsdWUgPz8gJycpLnRyaW0oKTtcbiAgcmV0dXJuIGtleS5zdGFydHNXaXRoKCdfc3lzXycpIHx8IExFR0FDWV9TWVNURU1fUFJPUEVSVFlfS0VZUy5oYXMoa2V5KTtcbn1cblxuZXhwb3J0IGNvbnN0IFNZU1RFTV9QUk9QRVJUWV9DU1MgPSBgXG5ib2R5LiR7U1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1N9IC5tZXRhZGF0YS1wcm9wZXJ0eVtkYXRhLXByb3BlcnR5LWtleV49XCJfc3lzX1wiXSxcbmJvZHkuJHtTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTU30gLm1ldGFkYXRhLXByb3BlcnR5W2RhdGEtcHJvcGVydHktbmFtZV49XCJfc3lzX1wiXSxcbmJvZHkuJHtTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTU30gLm1ldGFkYXRhLXByb3BlcnR5W2RhdGEtcHJvcGVydHkta2V5PVwiZmVpc2h1X2lkXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHlbZGF0YS1wcm9wZXJ0eS1rZXk9XCJmZWlzaHVfZG9jX2lkXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHlbZGF0YS1wcm9wZXJ0eS1rZXk9XCJmZWlzaHVfdGl0bGVcIl0sXG5ib2R5LiR7U1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1N9IC5tZXRhZGF0YS1wcm9wZXJ0eVtkYXRhLXByb3BlcnR5LWtleT1cInN5bmNfaGFzaFwiXSxcbmJvZHkuJHtTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTU30gLm1ldGFkYXRhLXByb3BlcnR5W2RhdGEtcHJvcGVydHkta2V5PVwic3luY190aW1lXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHlbZGF0YS1wcm9wZXJ0eS1uYW1lPVwiZmVpc2h1X2lkXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHlbZGF0YS1wcm9wZXJ0eS1uYW1lPVwiZmVpc2h1X2RvY19pZFwiXSxcbmJvZHkuJHtTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTU30gLm1ldGFkYXRhLXByb3BlcnR5W2RhdGEtcHJvcGVydHktbmFtZT1cImZlaXNodV90aXRsZVwiXSxcbmJvZHkuJHtTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTU30gLm1ldGFkYXRhLXByb3BlcnR5W2RhdGEtcHJvcGVydHktbmFtZT1cInN5bmNfaGFzaFwiXSxcbmJvZHkuJHtTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTU30gLm1ldGFkYXRhLXByb3BlcnR5W2RhdGEtcHJvcGVydHktbmFtZT1cInN5bmNfdGltZVwiXSxcbmJvZHkuJHtTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTU30gLm1ldGFkYXRhLXByb3BlcnR5OmhhcygubWV0YWRhdGEtcHJvcGVydHkta2V5LWlucHV0W3ZhbHVlXj1cIl9zeXNfXCJdKSxcbmJvZHkuJHtTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTU30gLm1ldGFkYXRhLXByb3BlcnR5OmhhcygubWV0YWRhdGEtcHJvcGVydHkta2V5LWlucHV0W2FyaWEtbGFiZWxePVwiX3N5c19cIl0pLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHk6aGFzKC5tZXRhZGF0YS1wcm9wZXJ0eS1rZXkgaW5wdXRbdmFsdWVePVwiX3N5c19cIl0pLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHk6aGFzKC5tZXRhZGF0YS1wcm9wZXJ0eS1rZXkgc3Bhblt0aXRsZV49XCJfc3lzX1wiXSksXG5ib2R5LiR7U1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1N9IC5tZXRhZGF0YS1wcm9wZXJ0eTpoYXMoLm1ldGFkYXRhLXByb3BlcnR5LWtleS1pbm5lclt0aXRsZV49XCJfc3lzX1wiXSkge1xuICBkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7XG59XG4uJHtTWVNURU1fUFJPUEVSVFlfSElEREVOX0NMQVNTfSB7XG4gIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDtcbn1cbmA7XG4iLCAiaW50ZXJmYWNlIENvb3JkaW5hdG9yT3B0aW9ucyB7XG4gIG1heENvbXBsZXRlZD86IG51bWJlcjtcbiAgY29tcGxldGVkVHRsTXM/OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBDYWNoZWRSZXN1bHQge1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHVua25vd247XG4gIGNvbXBsZXRlZEF0OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBJbmZsaWdodFJlc3VsdCB7XG4gIGtleTogc3RyaW5nO1xuICBwcm9taXNlOiBQcm9taXNlPHVua25vd24+O1xufVxuXG5jbGFzcyBSZXF1ZXN0Q29uZmxpY3RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29kZSA9ICdSRVFVRVNUX0lEX0NPTkZMSUNUJztcbiAgc3RhdHVzID0gNDA5O1xufVxuXG5leHBvcnQgY2xhc3MgU3luY0Nvb3JkaW5hdG9yIHtcbiAgcHJpdmF0ZSByZWFkb25seSBtYXhDb21wbGV0ZWQ6IG51bWJlcjtcbiAgcHJpdmF0ZSByZWFkb25seSBjb21wbGV0ZWRUdGxNczogbnVtYmVyO1xuICBwcml2YXRlIHJlYWRvbmx5IHRhaWxzID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2U8dm9pZD4+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgaW5mbGlnaHQgPSBuZXcgTWFwPHN0cmluZywgSW5mbGlnaHRSZXN1bHQ+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgY29tcGxldGVkID0gbmV3IE1hcDxzdHJpbmcsIENhY2hlZFJlc3VsdD4oKTtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBDb29yZGluYXRvck9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMubWF4Q29tcGxldGVkID0gTWF0aC5tYXgoMSwgb3B0aW9ucy5tYXhDb21wbGV0ZWQgPz8gMTAwKTtcbiAgICB0aGlzLmNvbXBsZXRlZFR0bE1zID0gTWF0aC5tYXgoMV8wMDAsIG9wdGlvbnMuY29tcGxldGVkVHRsTXMgPz8gMTAgKiA2MF8wMDApO1xuICB9XG5cbiAgZ2V0IGNvbXBsZXRlZENvdW50KCk6IG51bWJlciB7XG4gICAgdGhpcy5wcnVuZUNvbXBsZXRlZCgpO1xuICAgIHJldHVybiB0aGlzLmNvbXBsZXRlZC5zaXplO1xuICB9XG5cbiAgYXN5bmMgcnVuPFQ+KGtleTogc3RyaW5nLCByZXF1ZXN0SWQ6IHN0cmluZyB8IHVuZGVmaW5lZCwgdGFzazogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRLZXkgPSBrZXkudHJpbSgpO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRSZXF1ZXN0SWQgPSByZXF1ZXN0SWQ/LnRyaW0oKTtcbiAgICBpZiAoIW5vcm1hbGl6ZWRLZXkpIHRocm93IG5ldyBFcnJvcignQ29vcmRpbmF0b3Iga2V5IGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKG5vcm1hbGl6ZWRSZXF1ZXN0SWQgJiYgIS9eW0EtWmEtejAtOS5fOi1dezEsMTI4fSQvLnRlc3Qobm9ybWFsaXplZFJlcXVlc3RJZCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigncmVxdWVzdElkIGNvbnRhaW5zIHVuc3VwcG9ydGVkIGNoYXJhY3RlcnMgb3IgZXhjZWVkcyAxMjggY2hhcmFjdGVycycpO1xuICAgIH1cblxuICAgIHRoaXMucHJ1bmVDb21wbGV0ZWQoKTtcbiAgICBpZiAobm9ybWFsaXplZFJlcXVlc3RJZCkge1xuICAgICAgY29uc3QgY2FjaGVkID0gdGhpcy5jb21wbGV0ZWQuZ2V0KG5vcm1hbGl6ZWRSZXF1ZXN0SWQpO1xuICAgICAgaWYgKGNhY2hlZCkge1xuICAgICAgICB0aGlzLmFzc2VydFNhbWVLZXkobm9ybWFsaXplZFJlcXVlc3RJZCwgY2FjaGVkLmtleSwgbm9ybWFsaXplZEtleSk7XG4gICAgICAgIHJldHVybiBjYWNoZWQudmFsdWUgYXMgVDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFjdGl2ZSA9IHRoaXMuaW5mbGlnaHQuZ2V0KG5vcm1hbGl6ZWRSZXF1ZXN0SWQpO1xuICAgICAgaWYgKGFjdGl2ZSkge1xuICAgICAgICB0aGlzLmFzc2VydFNhbWVLZXkobm9ybWFsaXplZFJlcXVlc3RJZCwgYWN0aXZlLmtleSwgbm9ybWFsaXplZEtleSk7XG4gICAgICAgIHJldHVybiBhY3RpdmUucHJvbWlzZSBhcyBQcm9taXNlPFQ+O1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IG9wZXJhdGlvbiA9IHRoaXMuZW5xdWV1ZShub3JtYWxpemVkS2V5LCB0YXNrKTtcbiAgICBpZiAoIW5vcm1hbGl6ZWRSZXF1ZXN0SWQpIHJldHVybiBvcGVyYXRpb247XG5cbiAgICBjb25zdCB0cmFja2VkID0gb3BlcmF0aW9uLnRoZW4oKHZhbHVlKSA9PiB7XG4gICAgICB0aGlzLnJlbWVtYmVyKG5vcm1hbGl6ZWRSZXF1ZXN0SWQsIG5vcm1hbGl6ZWRLZXksIHZhbHVlKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgIHRoaXMuaW5mbGlnaHQuZGVsZXRlKG5vcm1hbGl6ZWRSZXF1ZXN0SWQpO1xuICAgIH0pO1xuICAgIHRoaXMuaW5mbGlnaHQuc2V0KG5vcm1hbGl6ZWRSZXF1ZXN0SWQsIHsga2V5OiBub3JtYWxpemVkS2V5LCBwcm9taXNlOiB0cmFja2VkIH0pO1xuICAgIHJldHVybiB0cmFja2VkO1xuICB9XG5cbiAgcHJpdmF0ZSBlbnF1ZXVlPFQ+KGtleTogc3RyaW5nLCB0YXNrOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgcHJldmlvdXMgPSB0aGlzLnRhaWxzLmdldChrZXkpID8/IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIGxldCByZWxlYXNlITogKCkgPT4gdm9pZDtcbiAgICBjb25zdCBzbG90ID0gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgIHJlbGVhc2UgPSByZXNvbHZlO1xuICAgIH0pO1xuICAgIGNvbnN0IHRhaWwgPSBwcmV2aW91cy5jYXRjaCgoKSA9PiB7fSkudGhlbigoKSA9PiBzbG90KTtcbiAgICB0aGlzLnRhaWxzLnNldChrZXksIHRhaWwpO1xuXG4gICAgcmV0dXJuIHByZXZpb3VzLmNhdGNoKCgpID0+IHt9KS50aGVuKHRhc2spLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgcmVsZWFzZSgpO1xuICAgICAgaWYgKHRoaXMudGFpbHMuZ2V0KGtleSkgPT09IHRhaWwpIHRoaXMudGFpbHMuZGVsZXRlKGtleSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzc2VydFNhbWVLZXkocmVxdWVzdElkOiBzdHJpbmcsIGV4aXN0aW5nS2V5OiBzdHJpbmcsIHJlcXVlc3RlZEtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKGV4aXN0aW5nS2V5ICE9PSByZXF1ZXN0ZWRLZXkpIHtcbiAgICAgIHRocm93IG5ldyBSZXF1ZXN0Q29uZmxpY3RFcnJvcihgcmVxdWVzdElkICR7cmVxdWVzdElkfSBpcyBhbHJlYWR5IGJvdW5kIHRvIGFub3RoZXIgZG9jdW1lbnRgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbWVtYmVyKHJlcXVlc3RJZDogc3RyaW5nLCBrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLmNvbXBsZXRlZC5kZWxldGUocmVxdWVzdElkKTtcbiAgICB0aGlzLmNvbXBsZXRlZC5zZXQocmVxdWVzdElkLCB7IGtleSwgdmFsdWUsIGNvbXBsZXRlZEF0OiBEYXRlLm5vdygpIH0pO1xuICAgIHdoaWxlICh0aGlzLmNvbXBsZXRlZC5zaXplID4gdGhpcy5tYXhDb21wbGV0ZWQpIHtcbiAgICAgIGNvbnN0IG9sZGVzdCA9IHRoaXMuY29tcGxldGVkLmtleXMoKS5uZXh0KCkudmFsdWUgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgaWYgKCFvbGRlc3QpIGJyZWFrO1xuICAgICAgdGhpcy5jb21wbGV0ZWQuZGVsZXRlKG9sZGVzdCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwcnVuZUNvbXBsZXRlZCgpOiB2b2lkIHtcbiAgICBjb25zdCBjdXRvZmYgPSBEYXRlLm5vdygpIC0gdGhpcy5jb21wbGV0ZWRUdGxNcztcbiAgICBmb3IgKGNvbnN0IFtyZXF1ZXN0SWQsIGVudHJ5XSBvZiB0aGlzLmNvbXBsZXRlZCkge1xuICAgICAgaWYgKGVudHJ5LmNvbXBsZXRlZEF0ID49IGN1dG9mZikgYnJlYWs7XG4gICAgICB0aGlzLmNvbXBsZXRlZC5kZWxldGUocmVxdWVzdElkKTtcbiAgICB9XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBVUEsSUFBQUEsb0JBQXNDOzs7QUNWdEMseUJBQTJDOzs7QUNrQ3BDLElBQU0sbUJBQXVDO0FBQUEsRUFDbEQsZUFBZTtBQUFBLEVBQ2YsTUFBTTtBQUFBLEVBQ04sV0FBVztBQUFBLEVBQ1gsYUFBYTtBQUFBLEVBQ2IsWUFBWTtBQUFBLEVBQ1osWUFBWTtBQUFBLEVBQ1osb0JBQW9CO0FBQUEsRUFDcEIsY0FBYztBQUFBLEVBQ2Qsc0JBQXNCO0FBQUEsRUFDdEIsU0FBUztBQUFBLEVBQ1QsbUJBQW1CO0FBQUEsRUFDbkIsc0JBQXNCO0FBQ3hCOzs7QURqQ0EsSUFBTSx1QkFBdUIsb0JBQUksSUFBSTtBQUFBLEVBQ25DO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQU9NLFNBQVMsZ0JBQWdCLE9BQXlDO0FBQ3ZFLFFBQU0sU0FBUyxZQUFZLEtBQUs7QUFDaEMsUUFBTSxhQUFhLFlBQVksUUFBUSxVQUFVO0FBQ2pELFFBQU0saUJBQWlCLFlBQVksUUFBUSxRQUFRO0FBQ25ELFFBQU0sZ0JBQWdCLFlBQVksUUFBUSxPQUFPO0FBQ2pELFFBQU0sV0FBVyxTQUFTLFdBQVcsTUFBTSxJ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QUMsTUFBTSxJQUFJLHlCQUFPLENBQUM7QUFBQSxJQUM3QixDQUFDO0FBQ0QsV0FBTyxJQUFJLGFBQWEsT0FBTyxRQUFRO0FBQ3JDLFlBQU0sTUFBTSxJQUFJO0FBQ2hCLFlBQU0sTUFBTSxNQUFNLEtBQUssd0JBQXdCLEtBQUssWUFBWSxLQUFLLElBQUk7QUFDekUsYUFBTyxLQUFLLGdCQUFnQixJQUFJLEtBQUssS0FBSyxXQUFXLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQztBQUFBLElBQ2pGLENBQUM7QUFFRCxRQUFJO0FBQ0YsWUFBTSxFQUFFLEtBQUssSUFBSSxNQUFNLFlBQVksS0FBSyxTQUFTLE1BQU0sSUFBSTtBQUMzRCxXQUFLLGFBQWE7QUFDbEIsV0FBSyxNQUFNLGdCQUFnQjtBQUFBLElBQzdCLFNBQVMsS0FBSztBQUNaLFlBQU0sTUFBTSxlQUFlLFFBQVEsSUFBSSxVQUFVLE9BQU8sR0FBRztBQUMzRCxVQUFJLHlCQUFPLGlFQUF5QixLQUFLLFNBQVMsSUFBSSxlQUFLLEdBQUcsRUFBRTtBQUNoRSxjQUFRLE1BQU0sZ0NBQWdDLEdBQUc7QUFBQSxJQUNuRDtBQUFBLEVBQ0Y7QUFDRjtBQUdBLElBQU8sZUFBUTsiLAogICJuYW1lcyI6IFsiaW1wb3J0X29ic2lkaWFuIiwgIm5vZGVXZWJDcnlwdG8iLCAiaW1wb3J0X29ic2lkaWFuIiwgInJlc3VsdCIsICJkYXRlIiwgIlNjaGVtYSIsICJsaW5lIiwgInN0clRhZyIsICJjaCIsICJzdHlsZSIsICJub2RlIiwgImpzb24iLCAidW53cmFwTGFya0VudmVsb3BlIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgInBhdGgiLCAiaW1wb3J0X29ic2lkaWFuIiwgImVuc3VyZUZvbGRlciIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJydW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgInBhdGgiLCAicGF0aCJdCn0K
