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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzTWlncmF0aW9uLnRzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvc2V0dGluZ3NUYWIudHMiLCAic3JjL2xhcmsvY2xpLnRzIiwgIi4uL3NoYXJlZC9zcmMvdHlwZXMudHMiLCAiLi4vc2hhcmVkL3NyYy9wcm90b2NvbC50cyIsICIuLi9zaGFyZWQvc3JjL2hhc2gudHMiLCAiLi4vc2hhcmVkL3NyYy9maWxlbmFtZS50cyIsICIuLi9zaGFyZWQvc3JjL2ltYWdlLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvc3RyLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL251bGxfY29yZS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9udWxsX2pzb24udHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvbnVsbF95YW1sMTEudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvYm9vbF9jb3JlLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL2Jvb2xfanNvbi50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9ib29sX3lhbWwxMS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9pbnRfY29yZS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9pbnRfanNvbi50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9pbnRfeWFtbDExLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL2Zsb2F0X2NvcmUudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvZmxvYXRfanNvbi50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9mbG9hdF95YW1sMTEudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvbWVyZ2UudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvYmluYXJ5LnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL3RpbWVzdGFtcC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NlcXVlbmNlL3NlcS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvY29tbW9uL29iamVjdC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NlcXVlbmNlL29tYXAudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zZXF1ZW5jZS9wYWlycy50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL21hcHBpbmcvbWFwLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvbWFwcGluZy9zZXQudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3NjaGVtYS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL21hcHBpbmcvcmVhbF9tYXAudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9tYXBwaW5nL2xlZ2FjeV9tYXAudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL2NvbW1vbi9zbmlwcGV0LnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9jb21tb24vZXhjZXB0aW9uLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9wYXJzZXIvZXZlbnRzLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9wYXJzZXIvcGFyc2VyX3NjYWxhci50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvY29tbW9uL3RhZ25hbWUudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3BhcnNlci9jb25zdHJ1Y3Rvci50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvcGFyc2VyL3BhcnNlci50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvbG9hZC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvYXN0L25vZGVzLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9hc3QvZnJvbV9qcy50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvYXN0L3Zpc2l0LnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9hc3QvcHJlc2VudGVyLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9kdW1wLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9hc3QvZnJvbV9ldmVudHMudHMiLCAiLi4vc2hhcmVkL3NyYy95YW1sLnRzIiwgIi4uL3NoYXJlZC9zcmMvY2FsbG91dC50cyIsICJzcmMvbWFwcGluZy50cyIsICJzcmMvc2VydmVyLnRzIiwgInNyYy9oYW5kbGVycy9zdGF0dXNIYW5kbGVyLnRzIiwgInNyYy9oYW5kbGVycy90cmVlSGFuZGxlci50cyIsICJzcmMvaGFuZGxlcnMvZmV0Y2hIYW5kbGVyLnRzIiwgInNyYy9maWxlaW8vd3JpdGVyLnRzIiwgInNyYy9hdXRvUmVuYW1lLnRzIiwgInNyYy9iaW5kaW5nSW5kZXgudHMiLCAic3JjL3ZhdWx0QmluZGluZy50cyIsICJzcmMvdmF1bHRQYXRoLnRzIiwgInNyYy9yZW1vdGVDYW5vbmljYWwudHMiLCAic3JjL3JlbW90ZURvY3VtZW50LnRzIiwgInNyYy9zeW5jRGVjaXNpb24udHMiLCAic3JjL3JlY292ZXJ5LnRzIiwgInNyYy9oYW5kbGVycy9jbGlwSGFuZGxlci50cyIsICJzcmMvaGFuZGxlcnMvZXhpc3RzSGFuZGxlci50cyIsICJzcmMvaGFuZGxlcnMvcHVzaGJhY2tIYW5kbGVyLnRzIiwgInNyYy9jb21tYW5kcy50cyIsICJzcmMvZmV0Y2hFbnRyeXBvaW50cy50cyIsICJzcmMvaW1hZ2VSZW5kZXIudHMiLCAic3JjL3N5c3RlbVByb3BlcnRpZXMudHMiLCAic3JjL3N5bmNDb29yZGluYXRvci50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBPQiBcdTYzRDJcdTRFRjZcdTUxNjVcdTUzRTNcdTMwMDJcdTRGOURcdTYzNkVcdTY1QjlcdTY4NDggXHUwMEE3NC4xXHVGRjA4XHU2QTIxXHU1NzU3IEJcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdTgwNENcdThEMjNcdUZGMUFcbiAqIDEuIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RVx1RkYwOFx1OTk5Nlx1NkIyMVx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMFx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1x1RkYwOVxuICogMi4gXHU2M0EyXHU2RDRCIGxhcmstY2xpXG4gKiAzLiBcdTU0MkZcdTUyQThcdTY3MkNcdTU3MzAgSFRUUCBzZXJ2ZXJcdUZGMENcdTZDRThcdTUxOENcdThERUZcdTc1MzFcbiAqIDQuIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFx1MzAwMVx1OEJCRVx1N0Y2RVx1OTg3NVx1MzAwMVx1NTZGRVx1NzI0N1x1NkUzMlx1NjdEM1x1MzAwMVx1NTIyMFx1OTY2NFx1NzZEMVx1NTQyQ1xuICogNS4gXHU1Mzc4XHU4RjdEXHU2NUY2XHU1MDVDXHU2QjYyIHNlcnZlclxuICovXG5pbXBvcnQgeyBQbHVnaW4sIE5vdGljZSwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQge1xuICB0eXBlIEZlaXNodVN5bmNTZXR0aW5ncyxcbiAgdHlwZSBQbHVnaW5TdGF0ZSxcbiAgdHlwZSBSZWNlbnRTeW5jLFxufSBmcm9tICcuL3NldHRpbmdzLmpzJztcbmltcG9ydCB7IGdlbmVyYXRlU3luY1Rva2VuLCBtaWdyYXRlU2V0dGluZ3MgfSBmcm9tICcuL3NldHRpbmdzTWlncmF0aW9uLmpzJztcbmltcG9ydCB7IEZlaXNodVN5bmNTZXR0aW5nVGFiIH0gZnJvbSAnLi9zZXR0aW5nc1RhYi5qcyc7XG5pbXBvcnQgeyBzdGFydFNlcnZlciwgdHlwZSBTZXJ2ZXJEZXBzLCB0eXBlIFJvdXRlSGFuZGxlciB9IGZyb20gJy4vc2VydmVyLmpzJztcbmltcG9ydCB7IHJlc29sdmVDbGkgfSBmcm9tICcuL2xhcmsvY2xpLmpzJztcbmltcG9ydCB7IGNyZWF0ZVN0YXR1c0hhbmRsZXIgfSBmcm9tICcuL2hhbmRsZXJzL3N0YXR1c0hhbmRsZXIuanMnO1xuaW1wb3J0IHsgY3JlYXRlVHJlZUhhbmRsZXIgfSBmcm9tICcuL2hhbmRsZXJzL3RyZWVIYW5kbGVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZUZldGNoSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlcnMvZmV0Y2hIYW5kbGVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZUNsaXBIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9jbGlwSGFuZGxlci5qcyc7XG5pbXBvcnQgeyBjcmVhdGVFeGlzdHNIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9leGlzdHNIYW5kbGVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZVB1c2hiYWNrSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlcnMvcHVzaGJhY2tIYW5kbGVyLmpzJztcbmltcG9ydCB7IHJlZ2lzdGVyQ29tbWFuZHMgfSBmcm9tICcuL2NvbW1hbmRzLmpzJztcbmltcG9ydCB7IHJlZ2lzdGVyRmV0Y2hFbnRyeXBvaW50cyB9IGZyb20gJy4vZmV0Y2hFbnRyeXBvaW50cy5qcyc7XG5pbXBvcnQgeyByZWdpc3RlckltYWdlUmVuZGVyZXIsIGNsZWFudXBJbWFnZUNhY2hlIH0gZnJvbSAnLi9pbWFnZVJlbmRlci5qcyc7XG5pbXBvcnQgeyByZWZyZXNoTWFwcGluZyB9IGZyb20gJy4vbWFwcGluZy5qcyc7XG5pbXBvcnQge1xuICBpc1N5c3RlbVByb3BlcnR5S2V5LFxuICBTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTUyxcbiAgU1lTVEVNX1BST1BFUlRZX0NTUyxcbiAgU1lTVEVNX1BST1BFUlRZX0hJRERFTl9DTEFTUyxcbiAgU1lTVEVNX1BST1BFUlRZX1NUWUxFX0lELFxufSBmcm9tICcuL3N5c3RlbVByb3BlcnRpZXMuanMnO1xuaW1wb3J0IHsgU3luY0Nvb3JkaW5hdG9yIH0gZnJvbSAnLi9zeW5jQ29vcmRpbmF0b3IuanMnO1xuaW1wb3J0IHR5cGUgeyBDbGlwUmVxdWVzdCwgRmV0Y2hSZXF1ZXN0LCBQdXNoYmFja1JlcXVlc3QgfSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHsgZXh0cmFjdEZlaXNodUlkIH0gZnJvbSAnLi9iaW5kaW5nSW5kZXguanMnO1xuaW1wb3J0IHsgbm9ybWFsaXplVmF1bHREaXIsIG5vcm1hbGl6ZVZhdWx0TWFya2Rvd25QYXRoIH0gZnJvbSAnLi92YXVsdFBhdGguanMnO1xuXG5leHBvcnQgY2xhc3MgRmVpc2h1U3luY1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIHNldHRpbmdzITogRmVpc2h1U3luY1NldHRpbmdzO1xuICBzdGF0ZSE6IFBsdWdpblN0YXRlO1xuICBwcml2YXRlIHN0b3BTZXJ2ZXI/OiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICBwcml2YXRlIHN5c3RlbVByb3BlcnR5T2JzZXJ2ZXI/OiBNdXRhdGlvbk9ic2VydmVyO1xuICByZWFkb25seSBzeW5jQ29vcmRpbmF0b3IgPSBuZXcgU3luY0Nvb3JkaW5hdG9yKCk7XG5cbiAgYXN5bmMgb25sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBzaG91bGRTYXZlU2V0dGluZ3MgPSBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXG4gICAgLy8gXHU4RkQwXHU4ODRDXHU2NUY2XHU3MkI2XHU2MDAxXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGxhcmtDbGlSZXNvbHZlZDogJycsXG4gICAgICBsYXJrQ2xpVmVyc2lvbjogJycsXG4gICAgICBzZXJ2ZXJSdW5uaW5nOiBmYWxzZSxcbiAgICAgIHJlY2VudFN5bmNzOiBbXSBhcyBSZWNlbnRTeW5jW10sXG4gICAgfTtcblxuICAgIC8vIFx1OTk5Nlx1NkIyMVx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMFx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1xuICAgIGlmICghdGhpcy5zZXR0aW5ncy5zeW5jVG9rZW4pIHtcbiAgICAgIHRoaXMuc2V0dGluZ3Muc3luY1Rva2VuID0gZ2VuZXJhdGVTeW5jVG9rZW4oKTtcbiAgICAgIHNob3VsZFNhdmVTZXR0aW5ncyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChzaG91bGRTYXZlU2V0dGluZ3MpIHtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKCk7XG4gICAgfVxuICAgIHRoaXMuYXBwbHlTeXN0ZW1Qcm9wZXJ0aWVzVmlzaWJpbGl0eSgpO1xuXG4gICAgLy8gXHU2M0EyXHU2RDRCIGxhcmstY2xpXG4gICAgY29uc3QgbGFya0luZm8gPSByZXNvbHZlQ2xpKHRoaXMuc2V0dGluZ3MubGFya0NsaVBhdGggfHwgdW5kZWZpbmVkKTtcbiAgICBpZiAobGFya0luZm8pIHtcbiAgICAgIHRoaXMuc3RhdGUubGFya0NsaVJlc29sdmVkID0gbGFya0luZm8ucGF0aDtcbiAgICAgIHRoaXMuc3RhdGUubGFya0NsaVZlcnNpb24gPSBsYXJrSW5mby52ZXJzaW9uO1xuICAgICAgcHJvY2Vzcy5lbnYuX19MQVJLX0NMSV9QQVRIX18gPSBsYXJrSW5mby5wYXRoO1xuICAgICAgY29uc29sZS5sb2coYFtmcy1UQl0gbGFyay1jbGk6ICR7bGFya0luZm8udmVyc2lvbn0gQCAke2xhcmtJbmZvLnBhdGh9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybignW2ZzLVRCXSBsYXJrLWNsaSBub3QgZm91bmQgKG5lZWQgPj0gMS4wLjUyKScpO1xuICAgIH1cblxuICAgIC8vIFx1OEJCRVx1N0Y2RVx1OTg3NVxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgRmVpc2h1U3luY1NldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcblxuICAgIC8vIFx1NTQ3RFx1NEVFNFxuICAgIHJlZ2lzdGVyQ29tbWFuZHModGhpcyk7XG4gICAgcmVnaXN0ZXJGZXRjaEVudHJ5cG9pbnRzKHRoaXMpO1xuXG4gICAgLy8gXHU1NkZFXHU3MjQ3XHU2RTMyXHU2N0QzXG4gICAgcmVnaXN0ZXJJbWFnZVJlbmRlcmVyKHRoaXMpO1xuXG4gICAgLy8gXHU1NDJGXHU1MkE4IEhUVFAgc2VydmVyXG4gICAgYXdhaXQgdGhpcy5zdGFydEh0dHBTZXJ2ZXIoKTtcblxuICAgIC8vIHJpYmJvbiBcdTU2RkVcdTY4MDdcbiAgICB0aGlzLmFkZFJpYmJvbkljb24oJ3JlZnJlc2gtY3cnLCAnXHU5OERFXHU0RTY2XHU1NDBDXHU2QjY1JywgYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgcmVmcmVzaE1hcHBpbmcodGhpcy5hcHAsIHRoaXMuc2V0dGluZ3Muc3BhY2VJZCk7XG4gICAgfSk7XG5cbiAgICAvLyBcdTU0MkZcdTUyQThcdTY1RjZcdTZFMDVcdTc0MDZcdTRFMDBcdTZCMjFcdThGQzdcdTY3MUZcdTdGMTNcdTVCNThcbiAgICB0aGlzLmFwcC53b3Jrc3BhY2Uub25MYXlvdXRSZWFkeSgoKSA9PiB7XG4gICAgICBjbGVhbnVwSW1hZ2VDYWNoZSh0aGlzLCB0aGlzLnNldHRpbmdzLmNhY2hlQ2xlYW51cCkuY2F0Y2goKCkgPT4ge30pO1xuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coYFtmcy1UQl0gJHt0aGlzLm1hbmlmZXN0LnZlcnNpb259IGxvYWRlZCBvbiBwb3J0ICR7dGhpcy5zZXR0aW5ncy5wb3J0fWApO1xuICB9XG5cbiAgYXN5bmMgb251bmxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5zeXN0ZW1Qcm9wZXJ0eU9ic2VydmVyPy5kaXNjb25uZWN0KCk7XG4gICAgdGhpcy5zeXN0ZW1Qcm9wZXJ0eU9ic2VydmVyID0gdW5kZWZpbmVkO1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZShTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTUyk7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoU1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1MpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFNZU1RFTV9QUk9QRVJUWV9TVFlMRV9JRCk/LnJlbW92ZSgpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYC4ke1NZU1RFTV9QUk9QRVJUWV9ISURERU5fQ0xBU1N9YCkuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFNZU1RFTV9QUk9QRVJUWV9ISURERU5fQ0xBU1MpO1xuICAgIH0pO1xuICAgIGlmICh0aGlzLnN0b3BTZXJ2ZXIpIHtcbiAgICAgIGF3YWl0IHRoaXMuc3RvcFNlcnZlcigpO1xuICAgICAgdGhpcy5zdG9wU2VydmVyID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnW2ZzLVRCXSB1bmxvYWRlZCcpO1xuICB9XG5cbiAgYXN5bmMgbG9hZFNldHRpbmdzKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IG1pZ3JhdGlvbiA9IG1pZ3JhdGVTZXR0aW5ncyhhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuICAgIHRoaXMuc2V0dGluZ3MgPSBtaWdyYXRpb24uc2V0dGluZ3M7XG4gICAgcmV0dXJuIG1pZ3JhdGlvbi5jaGFuZ2VkO1xuICB9XG5cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cblxuICBhc3luYyBkb2N1bWVudENvb3JkaW5hdGlvbktleShub2RlVG9rZW4/OiBzdHJpbmcsIHBhdGg/OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGlmIChub2RlVG9rZW4pIHJldHVybiBgZG9jdW1lbnQ6JHtub2RlVG9rZW59YDtcbiAgICBpZiAocGF0aCkge1xuICAgICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBub3JtYWxpemVWYXVsdE1hcmtkb3duUGF0aChwYXRoKTtcbiAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgobm9ybWFsaXplZFBhdGgpO1xuICAgICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICBjb25zdCBmZWlzaHVJZCA9IGV4dHJhY3RGZWlzaHVJZChhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpKTtcbiAgICAgICAgaWYgKGZlaXNodUlkKSByZXR1cm4gYGRvY3VtZW50OiR7ZmVpc2h1SWR9YDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBgcGF0aDoke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgfVxuICAgIHJldHVybiAnZG9jdW1lbnQ6bWlzc2luZyc7XG4gIH1cblxuICBhcHBseVN5c3RlbVByb3BlcnRpZXNWaXNpYmlsaXR5KCk6IHZvaWQge1xuICAgIGNvbnN0IGVuYWJsZWQgPSB0aGlzLnNldHRpbmdzLmhpZGVTeXN0ZW1Qcm9wZXJ0aWVzID8/IHRydWU7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKFNZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTLCBlbmFibGVkKTtcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTUywgZW5hYmxlZCk7XG5cbiAgICBsZXQgc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoU1lTVEVNX1BST1BFUlRZX1NUWUxFX0lEKTtcbiAgICBpZiAoIXN0eWxlRWxlbWVudCkge1xuICAgICAgc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgIHN0eWxlRWxlbWVudC5pZCA9IFNZU1RFTV9QUk9QRVJUWV9TVFlMRV9JRDtcbiAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gICAgc3R5bGVFbGVtZW50LnRleHRDb250ZW50ID0gZW5hYmxlZCA/IFNZU1RFTV9QUk9QRVJUWV9DU1MgOiAnJztcblxuICAgIHRoaXMuc3lzdGVtUHJvcGVydHlPYnNlcnZlcj8uZGlzY29ubmVjdCgpO1xuICAgIHRoaXMuc3lzdGVtUHJvcGVydHlPYnNlcnZlciA9IHVuZGVmaW5lZDtcbiAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYC4ke1NZU1RFTV9QUk9QRVJUWV9ISURERU5fQ0xBU1N9YCkuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoU1lTVEVNX1BST1BFUlRZX0hJRERFTl9DTEFTUyk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnJlZnJlc2hTeXN0ZW1Qcm9wZXJ0eURvbVZpc2liaWxpdHkoKTtcbiAgICB0aGlzLnN5c3RlbVByb3BlcnR5T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICB0aGlzLnJlZnJlc2hTeXN0ZW1Qcm9wZXJ0eURvbVZpc2liaWxpdHkoKTtcbiAgICB9KTtcbiAgICB0aGlzLnN5c3RlbVByb3BlcnR5T2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydkYXRhLXByb3BlcnR5LWtleScsICdkYXRhLXByb3BlcnR5LW5hbWUnLCAndmFsdWUnLCAndGl0bGUnLCAnYXJpYS1sYWJlbCddLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZWZyZXNoU3lzdGVtUHJvcGVydHlEb21WaXNpYmlsaXR5KCk6IHZvaWQge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KCcubWV0YWRhdGEtcHJvcGVydHknKS5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICBjb25zdCBpbnB1dCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihcbiAgICAgICAgJy5tZXRhZGF0YS1wcm9wZXJ0eS1rZXktaW5wdXQsIC5tZXRhZGF0YS1wcm9wZXJ0eS1rZXkgaW5wdXQsIGlucHV0JyxcbiAgICAgICk7XG4gICAgICBjb25zdCBrZXlOb2RlID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcbiAgICAgICAgJy5tZXRhZGF0YS1wcm9wZXJ0eS1rZXksIC5tZXRhZGF0YS1wcm9wZXJ0eS1rZXktaW5uZXIsIC5tZXRhZGF0YS1wcm9wZXJ0eS1sYWJlbCcsXG4gICAgICApO1xuICAgICAgY29uc3QgdmFsdWVzID0gW1xuICAgICAgICBlbGVtZW50LmRhdGFzZXQucHJvcGVydHlLZXksXG4gICAgICAgIGVsZW1lbnQuZGF0YXNldC5wcm9wZXJ0eU5hbWUsXG4gICAgICAgIGlucHV0Py52YWx1ZSxcbiAgICAgICAgaW5wdXQ/LmdldEF0dHJpYnV0ZSgndmFsdWUnKSxcbiAgICAgICAgaW5wdXQ/LmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcpLFxuICAgICAgICBrZXlOb2RlPy50aXRsZSxcbiAgICAgICAga2V5Tm9kZT8udGV4dENvbnRlbnQsXG4gICAgICBdO1xuICAgICAgY29uc3Qgc2hvdWxkSGlkZSA9IHZhbHVlcy5zb21lKGlzU3lzdGVtUHJvcGVydHlLZXkpO1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFNZU1RFTV9QUk9QRVJUWV9ISURERU5fQ0xBU1MsIHNob3VsZEhpZGUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFx1NTQyRlx1NTJBOCBIVFRQIHNlcnZlclx1RkYwQ1x1NkNFOFx1NTE4Q1x1NjI0MFx1NjcwOVx1OERFRlx1NzUzMVx1MzAwMiAqL1xuICBwcml2YXRlIGFzeW5jIHN0YXJ0SHR0cFNlcnZlcigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCByb3V0ZXMgPSBuZXcgTWFwPHN0cmluZywgUm91dGVIYW5kbGVyPigpO1xuXG4gICAgY29uc3QgZGVwczogU2VydmVyRGVwcyA9IHtcbiAgICAgIHZhbGlkYXRlVG9rZW46ICh0b2tlbikgPT4gdG9rZW4gPT09IHRoaXMuc2V0dGluZ3Muc3luY1Rva2VuLFxuICAgICAgcm91dGVzLFxuICAgIH07XG5cbiAgICAvLyBcdTZDRThcdTUxOENcdThERUZcdTc1MzFcbiAgICByb3V0ZXMuc2V0KCcvc3RhdHVzJywgY3JlYXRlU3RhdHVzSGFuZGxlcih0aGlzLm1hbmlmZXN0LnZlcnNpb24sIHRoaXMuYXBwLnZhdWx0LmdldE5hbWUoKSwgdGhpcy5zdGF0ZSkpO1xuICAgIHJvdXRlcy5zZXQoJy90cmVlJywgY3JlYXRlVHJlZUhhbmRsZXIodGhpcy5hcHApKTtcbiAgICBjb25zdCBmZXRjaEhhbmRsZXIgPSBjcmVhdGVGZXRjaEhhbmRsZXIoe1xuICAgICAgYXBwOiB0aGlzLmFwcCxcbiAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxuICAgICAgc3RhdGU6IHRoaXMuc3RhdGUsXG4gICAgICBub3RpY2U6IChtKSA9PiBuZXcgTm90aWNlKG0pLFxuICAgIH0pO1xuICAgIHJvdXRlcy5zZXQoJy9mZXRjaCcsIChjdHgpID0+IHtcbiAgICAgIGNvbnN0IHJlcSA9IGN0eC5ib2R5IGFzIEZldGNoUmVxdWVzdDtcbiAgICAgIGNvbnN0IGRvY3VtZW50S2V5ID0gYGRvY3VtZW50OiR7cmVxPy5ub2RlX3Rva2VuID8/ICcnfWA7XG4gICAgICBjb25zdCBkaXJlY3RvcnlLZXkgPSBgZGlyZWN0b3J5OiR7bm9ybWFsaXplVmF1bHREaXIocmVxPy5kaXIgPz8gdGhpcy5zZXR0aW5ncy5kZWZhdWx0RGlyKX1gO1xuICAgICAgcmV0dXJuIHRoaXMuc3luY0Nvb3JkaW5hdG9yLnJ1bihkb2N1bWVudEtleSwgcmVxPy5yZXF1ZXN0SWQsICgpID0+XG4gICAgICAgIHRoaXMuc3luY0Nvb3JkaW5hdG9yLnJ1bihkaXJlY3RvcnlLZXksIHVuZGVmaW5lZCwgKCkgPT4gZmV0Y2hIYW5kbGVyKGN0eCkpKTtcbiAgICB9KTtcbiAgICBjb25zdCBjbGlwSGFuZGxlciA9IGNyZWF0ZUNsaXBIYW5kbGVyKHtcbiAgICAgIGFwcDogdGhpcy5hcHAsXG4gICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5ncyxcbiAgICAgIG5vdGljZTogKG0pID0+IG5ldyBOb3RpY2UobSksXG4gICAgfSk7XG4gICAgcm91dGVzLnNldCgnL2NsaXAnLCAoY3R4KSA9PiB7XG4gICAgICBjb25zdCByZXEgPSBjdHguYm9keSBhcyBDbGlwUmVxdWVzdDtcbiAgICAgIGNvbnN0IGtleSA9IHJlcT8uYXBwZW5kUGF0aCA/IGBjbGlwOiR7cmVxLmFwcGVuZFBhdGh9YCA6IGBjbGlwOiR7cmVxPy5yZXF1ZXN0SWQgPz8gJ2Fub255bW91cyd9YDtcbiAgICAgIHJldHVybiB0aGlzLnN5bmNDb29yZGluYXRvci5ydW4oa2V5LCByZXE/LnJlcXVlc3RJZCwgKCkgPT4gY2xpcEhhbmRsZXIoY3R4KSk7XG4gICAgfSk7XG4gICAgcm91dGVzLnNldCgnL2V4aXN0cycsIGNyZWF0ZUV4aXN0c0hhbmRsZXIodGhpcy5hcHApKTtcbiAgICBjb25zdCBwdXNoYmFja0hhbmRsZXIgPSBjcmVhdGVQdXNoYmFja0hhbmRsZXIoe1xuICAgICAgYXBwOiB0aGlzLmFwcCxcbiAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxuICAgICAgbm90aWNlOiAobSkgPT4gbmV3IE5vdGljZShtKSxcbiAgICB9KTtcbiAgICByb3V0ZXMuc2V0KCcvcHVzaGJhY2snLCBhc3luYyAoY3R4KSA9PiB7XG4gICAgICBjb25zdCByZXEgPSBjdHguYm9keSBhcyBQdXNoYmFja1JlcXVlc3Q7XG4gICAgICBjb25zdCBrZXkgPSBhd2FpdCB0aGlzLmRvY3VtZW50Q29vcmRpbmF0aW9uS2V5KHJlcT8ubm9kZV90b2tlbiwgcmVxPy5wYXRoKTtcbiAgICAgIHJldHVybiB0aGlzLnN5bmNDb29yZGluYXRvci5ydW4oa2V5LCByZXE/LnJlcXVlc3RJZCwgKCkgPT4gcHVzaGJhY2tIYW5kbGVyKGN0eCkpO1xuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgc3RvcCB9ID0gYXdhaXQgc3RhcnRTZXJ2ZXIodGhpcy5zZXR0aW5ncy5wb3J0LCBkZXBzKTtcbiAgICAgIHRoaXMuc3RvcFNlcnZlciA9IHN0b3A7XG4gICAgICB0aGlzLnN0YXRlLnNlcnZlclJ1bm5pbmcgPSB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc3QgbXNnID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpO1xuICAgICAgbmV3IE5vdGljZShgXHUyNzRDIEhUVFAgc2VydmVyIFx1NTQyRlx1NTJBOFx1NTkzMVx1OEQyNVx1RkYwOFx1N0FFRlx1NTNFMyAke3RoaXMuc2V0dGluZ3MucG9ydH1cdUZGMDlcdUZGMUEke21zZ31gKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tmcy1UQl0gc2VydmVyIHN0YXJ0IGZhaWxlZDonLCBlcnIpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBPYnNpZGlhbiBcdTYzRDJcdTRFRjZcdTUxNjVcdTUzRTNcdUZGMUFcdTVGQzVcdTk4N0JcdTlFRDhcdThCQTRcdTVCRkNcdTUxRkEgUGx1Z2luIFx1NUI1MFx1N0M3QlxuZXhwb3J0IGRlZmF1bHQgRmVpc2h1U3luY1BsdWdpbjtcbiIsICJpbXBvcnQgeyB3ZWJjcnlwdG8gYXMgbm9kZVdlYkNyeXB0byB9IGZyb20gJ25vZGU6Y3J5cHRvJztcblxuaW1wb3J0IHtcbiAgREVGQVVMVF9TRVRUSU5HUyxcbiAgdHlwZSBGZWlzaHVTeW5jU2V0dGluZ3MsXG59IGZyb20gJy4vc2V0dGluZ3MuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNldHRpbmdzTWlncmF0aW9uUmVzdWx0IHtcbiAgc2V0dGluZ3M6IEZlaXNodVN5bmNTZXR0aW5ncztcbiAgY2hhbmdlZDogYm9vbGVhbjtcbn1cblxudHlwZSBEYXRhUmVjb3JkID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbmNvbnN0IENBQ0hFX0NMRUFOVVBfVkFMVUVTID0gbmV3IFNldChbXG4gICdkYWlseScsXG4gICd3ZWVrbHknLFxuICAnbW9udGhseScsXG4gICduZXZlcicsXG5dKTtcblxuLyoqXG4gKiBcdTVDMDZcdTVGNTNcdTUyNERcdTYyNDFcdTVFNzNcdThCQkVcdTdGNkVcdTYyMTZcdTY1RTdcdTcyNDhcdTVENENcdTU5NTdcdThCQkVcdTdGNkVcdTY1MzZcdTY1NUJcdTRFM0Egc2NoZW1hIHYxXHUzMDAyXG4gKiBcdTUxRkRcdTY1NzBcdTRFMERcdTRGRUVcdTY1MzlcdThGOTNcdTUxNjVcdUZGMENcdTRFNUZcdTRFMERcdThCQjBcdTVGNTVcdTRFRkJcdTRGNTVcdThCQkVcdTdGNkVcdTUwM0NcdTMwMDJcdTY2NkVcdTkwMUEgZ2V0dGVyIFx1NEYxQVx1ODhBQlx1OERGM1x1OEZDN1x1RkYxQlxuICogUHJveHkgdHJhcCBcdTUzRUZcdTgwRkRcdTYyNjdcdTg4NENcdUZGMENcdTRGNDYgdHJhcCBcdTVGMDJcdTVFMzhcdTRGMUFcdTg4QUJcdTYzNTVcdTgzQjdcdTVFNzZcdTVCODlcdTUxNjhcdTU2REVcdTkwMDBcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pZ3JhdGVTZXR0aW5ncyhpbnB1dDogdW5rbm93bik6IFNldHRpbmdzTWlncmF0aW9uUmVzdWx0IHtcbiAgY29uc3Qgc291cmNlID0gY29weU93bkRhdGEoaW5wdXQpO1xuICBjb25zdCBmZWlzaHVTeW5jID0gY29weU93bkRhdGEoc291cmNlPy5mZWlzaHVTeW5jKTtcbiAgY29uc3QgcnVudGltZUxhcmtEb2MgPSBjb3B5T3duRGF0YShzb3VyY2U/Ll9sYXJrRG9jKTtcbiAgY29uc3QgbGVnYWN5TGFya0RvYyA9IGNvcHlPd25EYXRhKHNvdXJjZT8ubGFya0RvYyk7XG4gIGNvbnN0IG1pZ3JhdGVkID0gc291cmNlID8gY29weVJlY29yZChzb3VyY2UpIDoge307XG5cbiAgbWlncmF0ZWQuc2NoZW1hVmVyc2lvbiA9IDE7XG4gIG1pZ3JhdGVkLnBvcnQgPSBmaXJzdFBvcnQoc291cmNlPy5wb3J0LCBmZWlzaHVTeW5jPy5wb3J0KSA/PyBERUZBVUxUX1NFVFRJTkdTLnBvcnQ7XG4gIG1pZ3JhdGVkLnN5bmNUb2tlbiA9IGZpcnN0Tm9uRW1wdHlTdHJpbmcoc291cmNlPy5zeW5jVG9rZW4sIGZlaXNodVN5bmM/LnN5bmNUb2tlbilcbiAgICA/PyBERUZBVUxUX1NFVFRJTkdTLnN5bmNUb2tlbjtcbiAgbWlncmF0ZWQubGFya0NsaVBhdGggPSBmaXJzdE5vbkVtcHR5U3RyaW5nKFxuICAgIHNvdXJjZT8ubGFya0NsaVBhdGgsXG4gICAgcnVudGltZUxhcmtEb2M/LmxhcmtDbGlQYXRoLFxuICAgIGxlZ2FjeUxhcmtEb2M/LmxhcmtDbGlQYXRoLFxuICAgIGZlaXNodVN5bmM/LmxhcmtDbGlQYXRoLFxuICApID8/IERFRkFVTFRfU0VUVElOR1MubGFya0NsaVBhdGg7XG5cbiAgY29uc3QgZGVmYXVsdERpciA9IGZpcnN0Tm9uRW1wdHlTdHJpbmcoXG4gICAgc291cmNlPy5kZWZhdWx0RGlyLFxuICAgIGZlaXNodVN5bmM/LmRlZmF1bHREaXIsXG4gICkgPz8gREVGQVVMVF9TRVRUSU5HUy5kZWZhdWx0RGlyO1xuICBtaWdyYXRlZC5kZWZhdWx0RGlyID0gZGVmYXVsdERpcjtcbiAgbWlncmF0ZWQuZGVmYXVsdE5vdGVGb2xkZXIgPSBmaXJzdE5vbkVtcHR5U3RyaW5nKFxuICAgIHNvdXJjZT8uZGVmYXVsdE5vdGVGb2xkZXIsXG4gICAgcnVudGltZUxhcmtEb2M/LmRlZmF1bHROb3RlRm9sZGVyLFxuICAgIGxlZ2FjeUxhcmtEb2M/LmRlZmF1bHROb3RlRm9sZGVyLFxuICApID8/IERFRkFVTFRfU0VUVElOR1MuZGVmYXVsdE5vdGVGb2xkZXI7XG5cbiAgY29uc3QgbGVnYWN5QXV0b1JlbmFtZSA9IGNvcHlPd25EYXRhKHNvdXJjZT8uYXV0b1JlbmFtZSk7XG4gIGlmIChsZWdhY3lBdXRvUmVuYW1lICYmIHNvdXJjZT8uX2F1dG9SZW5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgIG1pZ3JhdGVkLl9hdXRvUmVuYW1lID0gc291cmNlPy5hdXRvUmVuYW1lO1xuICB9XG4gIG1pZ3JhdGVkLmF1dG9SZW5hbWUgPSBhdXRvbWF0aWNCZWhhdmlvcihcbiAgICBbc291cmNlLCBmZWlzaHVTeW5jXSxcbiAgICAnYXV0b1JlbmFtZScsXG4gICAgREVGQVVMVF9TRVRUSU5HUy5hdXRvUmVuYW1lLFxuICApO1xuICBtaWdyYXRlZC5hdXRvRGVsZXRlUmVnaXN0cnkgPSBhdXRvbWF0aWNCZWhhdmlvcihcbiAgICBbc291cmNlLCBmZWlzaHVTeW5jXSxcbiAgICAnYXV0b0RlbGV0ZVJlZ2lzdHJ5JyxcbiAgICBERUZBVUxUX1NFVFRJTkdTLmF1dG9EZWxldGVSZWdpc3RyeSxcbiAgKTtcbiAgbWlncmF0ZWQuY2FjaGVDbGVhbnVwID0gZmlyc3RDYWNoZUNsZWFudXAoXG4gICAgc291cmNlPy5jYWNoZUNsZWFudXAsXG4gICAgZmVpc2h1U3luYz8uY2FjaGVDbGVhbnVwLFxuICApID8/IERFRkFVTFRfU0VUVElOR1MuY2FjaGVDbGVhbnVwO1xuICBtaWdyYXRlZC5rZWVwRGVjb3JhdGl2ZUltYWdlcyA9IGZpcnN0Qm9vbGVhbihcbiAgICBzb3VyY2U/LmtlZXBEZWNvcmF0aXZlSW1hZ2VzLFxuICAgIGZlaXNodVN5bmM/LmtlZXBEZWNvcmF0aXZlSW1hZ2VzLFxuICApID8/IERFRkFVTFRfU0VUVElOR1Mua2VlcERlY29yYXRpdmVJbWFnZXM7XG4gIG1pZ3JhdGVkLnNwYWNlSWQgPSBmaXJzdE5vbkVtcHR5U3RyaW5nKHNvdXJjZT8uc3BhY2VJZCwgZmVpc2h1U3luYz8uc3BhY2VJZClcbiAgICA/PyBERUZBVUxUX1NFVFRJTkdTLnNwYWNlSWQ7XG4gIG1pZ3JhdGVkLmhpZGVTeXN0ZW1Qcm9wZXJ0aWVzID0gZmlyc3RCb29sZWFuKFxuICAgIHNvdXJjZT8uaGlkZVN5c3RlbVByb3BlcnRpZXMsXG4gICAgZmVpc2h1U3luYz8uaGlkZVN5c3RlbVByb3BlcnRpZXMsXG4gICkgPz8gREVGQVVMVF9TRVRUSU5HUy5oaWRlU3lzdGVtUHJvcGVydGllcztcblxuICByZXR1cm4ge1xuICAgIHNldHRpbmdzOiBtaWdyYXRlZCBhcyBGZWlzaHVTeW5jU2V0dGluZ3MsXG4gICAgY2hhbmdlZDogIXNhbWVEYXRhKHNvdXJjZSwgbWlncmF0ZWQpLFxuICB9O1xufVxuXG4vKiogXHU3NTFGXHU2MjEwIDMyIFx1NUI1N1x1ODI4Mlx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1x1RkYxQk9ic2lkaWFuIFx1NjVFMCBXZWIgQ3J5cHRvIFx1NTE2OFx1NUM0MFx1OTFDRlx1NjVGNlx1NTZERVx1OTAwMFx1NTIzMCBOb2RlXHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTeW5jVG9rZW4oKTogc3RyaW5nIHtcbiAgY29uc3QgcmFuZG9tU291cmNlID0gZ2xvYmFsVGhpcy5jcnlwdG8gPz8gbm9kZVdlYkNyeXB0byBhcyB1bmtub3duIGFzIENyeXB0bztcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheSgzMik7XG4gIHJhbmRvbVNvdXJjZS5nZXRSYW5kb21WYWx1ZXMoYnl0ZXMpO1xuICByZXR1cm4gQXJyYXkuZnJvbShieXRlcywgKGJ5dGUpID0+IGJ5dGUudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xufVxuXG4vKipcbiAqIFx1NTNFQVx1NTkwRFx1NTIzNlx1ODFFQVx1NjcwOVx1NTNFRlx1Njc5QVx1NEUzRVx1NjU3MFx1NjM2RVx1NUM1RVx1NjAyN1x1RkYwQ1x1NjY2RVx1OTAxQSBnZXR0ZXIgXHU0RTBEXHU0RjFBXHU4OEFCXHU4QkZCXHU1M0Q2XHUzMDAyXG4gKiBQcm94eSBcdTc2ODQgb3duS2V5cy9nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgdHJhcCBcdTRFQ0RcdTUzRUZcdTgwRkRcdTYyNjdcdTg4NENcdUZGMENcdTUxNzZcdTVGMDJcdTVFMzhcdTU3MjhcdTZCNjRcdTYzNTVcdTgzQjdcdTMwMDJcbiAqL1xuZnVuY3Rpb24gY29weU93bkRhdGEodmFsdWU6IHVua25vd24pOiBEYXRhUmVjb3JkIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcgfHwgdmFsdWUgPT09IG51bGwgfHwgQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQ6IERhdGFSZWNvcmQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIGRlc2NyaXB0b3JdIG9mIE9iamVjdC5lbnRyaWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHZhbHVlKSkpIHtcbiAgICAgIGlmIChkZXNjcmlwdG9yLmVudW1lcmFibGUgJiYgJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSB7XG4gICAgICAgIGRlZmluZURhdGEocmVzdWx0LCBrZXksIGRlc2NyaXB0b3IudmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvcHlSZWNvcmQoc291cmNlOiBEYXRhUmVjb3JkKTogRGF0YVJlY29yZCB7XG4gIGNvbnN0IHJlc3VsdDogRGF0YVJlY29yZCA9IHt9O1xuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzb3VyY2UpKSB7XG4gICAgZGVmaW5lRGF0YShyZXN1bHQsIGtleSwgdmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGRlZmluZURhdGEodGFyZ2V0OiBEYXRhUmVjb3JkLCBrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCB7XG4gICAgdmFsdWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBmaXJzdE5vbkVtcHR5U3RyaW5nKC4uLnZhbHVlczogdW5rbm93bltdKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHZhbHVlcy5maW5kKCh2YWx1ZSk6IHZhbHVlIGlzIHN0cmluZyA9PiAoXG4gICAgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS50cmltKCkubGVuZ3RoID4gMFxuICApKTtcbn1cblxuZnVuY3Rpb24gZmlyc3RCb29sZWFuKC4uLnZhbHVlczogdW5rbm93bltdKTogYm9vbGVhbiB8IHVuZGVmaW5lZCB7XG4gIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VCb29sZWFuKHZhbHVlKTtcbiAgICBpZiAocGFyc2VkICE9PSB1bmRlZmluZWQpIHJldHVybiBwYXJzZWQ7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZmlyc3RQb3J0KC4uLnZhbHVlczogdW5rbm93bltdKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICBjb25zdCBjYW5kaWRhdGUgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3QodmFsdWUudHJpbSgpKVxuICAgICAgPyBOdW1iZXIodmFsdWUudHJpbSgpKVxuICAgICAgOiB2YWx1ZTtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgY2FuZGlkYXRlID09PSAnbnVtYmVyJ1xuICAgICAgJiYgTnVtYmVyLmlzSW50ZWdlcihjYW5kaWRhdGUpXG4gICAgICAmJiBjYW5kaWRhdGUgPj0gMVxuICAgICAgJiYgY2FuZGlkYXRlIDw9IDY1XzUzNVxuICAgICkge1xuICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gYXV0b21hdGljQmVoYXZpb3IoXG4gIHNvdXJjZXM6IEFycmF5PERhdGFSZWNvcmQgfCB1bmRlZmluZWQ+LFxuICBrZXk6ICdhdXRvUmVuYW1lJyB8ICdhdXRvRGVsZXRlUmVnaXN0cnknLFxuICBmYWxsYmFjazogYm9vbGVhbixcbik6IGJvb2xlYW4ge1xuICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBzb3VyY2VzKSB7XG4gICAgaWYgKCFzb3VyY2UgfHwgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIGNvbnRpbnVlO1xuICAgIHJldHVybiBwYXJzZUJvb2xlYW4oc291cmNlW2tleV0pID8/IGZhbHNlO1xuICB9XG4gIHJldHVybiBmYWxsYmFjaztcbn1cblxuZnVuY3Rpb24gcGFyc2VCb29sZWFuKHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB8IHVuZGVmaW5lZCB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykgcmV0dXJuIHZhbHVlO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIHVuZGVmaW5lZDtcblxuICBjb25zdCBub3JtYWxpemVkID0gdmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gIGlmIChub3JtYWxpemVkID09PSAndHJ1ZScpIHJldHVybiB0cnVlO1xuICBpZiAobm9ybWFsaXplZCA9PT0gJ2ZhbHNlJykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBmaXJzdENhY2hlQ2xlYW51cCguLi52YWx1ZXM6IHVua25vd25bXSk6IEZlaXNodVN5bmNTZXR0aW5nc1snY2FjaGVDbGVhbnVwJ10gfCB1bmRlZmluZWQge1xuICByZXR1cm4gdmFsdWVzLmZpbmQoKHZhbHVlKTogdmFsdWUgaXMgRmVpc2h1U3luY1NldHRpbmdzWydjYWNoZUNsZWFudXAnXSA9PiAoXG4gICAgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiBDQUNIRV9DTEVBTlVQX1ZBTFVFUy5oYXModmFsdWUpXG4gICkpO1xufVxuXG5mdW5jdGlvbiBzYW1lRGF0YShzb3VyY2U6IERhdGFSZWNvcmQgfCB1bmRlZmluZWQsIG1pZ3JhdGVkOiBEYXRhUmVjb3JkKTogYm9vbGVhbiB7XG4gIGlmICghc291cmNlKSByZXR1cm4gZmFsc2U7XG5cbiAgY29uc3Qgc291cmNlS2V5cyA9IE9iamVjdC5rZXlzKHNvdXJjZSk7XG4gIGNvbnN0IG1pZ3JhdGVkS2V5cyA9IE9iamVjdC5rZXlzKG1pZ3JhdGVkKTtcbiAgcmV0dXJuIHNvdXJjZUtleXMubGVuZ3RoID09PSBtaWdyYXRlZEtleXMubGVuZ3RoXG4gICAgJiYgbWlncmF0ZWRLZXlzLmV2ZXJ5KChrZXkpID0+IChcbiAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSlcbiAgICAgICYmIE9iamVjdC5pcyhzb3VyY2Vba2V5XSwgbWlncmF0ZWRba2V5XSlcbiAgICApKTtcbn1cbiIsICIvKipcbiAqIE9CIFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1NjNBNVx1NTNFMyArIFx1OUVEOFx1OEJBNFx1NTAzQ1x1MzAwMlxuICogXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzEwXHVGRjA4U2V0dGluZ3NUYWJcdUZGMDlcdTMwMDJcbiAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIEZlaXNodVN5bmNTZXR0aW5ncyB7XG4gIC8qKiBcdTYzMDFcdTRFNDVcdTUzMTZcdThCQkVcdTdGNkVcdTdFRDNcdTY3ODRcdTcyNDhcdTY3MkNcdTMwMDIgKi9cbiAgc2NoZW1hVmVyc2lvbjogMTtcbiAgLyoqIFx1NjcyQ1x1NTczMCBIVFRQIHNlcnZlciBcdTdBRUZcdTUzRTNcdUZGMDhcdTlFRDhcdThCQTQgNDU2N1x1RkYwOVx1MzAwMiAqL1xuICBwb3J0OiBudW1iZXI7XG4gIC8qKiBcdTU0MkZcdTUyQThcdTRFRTRcdTcyNENcdUZGMDgzMiBcdTVCNTdcdTgyODIgaGV4XHVGRjBDXHU5OTk2XHU2QjIxXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXHVGRjA5XHUzMDAyICovXG4gIHN5bmNUb2tlbjogc3RyaW5nO1xuICAvKiogbGFyay1jbGkgXHU4REVGXHU1Rjg0XHVGRjA4XHU3QTdBPVx1ODFFQVx1NTJBOFx1NjNBMlx1NkQ0Qlx1RkYwOVx1MzAwMiAqL1xuICBsYXJrQ2xpUGF0aDogc3RyaW5nO1xuICAvKiogXHU5RUQ4XHU4QkE0XHU4NDNEXHU1NzMwXHU3NkVFXHU1RjU1XHVGRjA4XHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1RkYwOVx1MzAwMiAqL1xuICBkZWZhdWx0RGlyOiBzdHJpbmc7XG4gIC8qKiBcdTgxRUFcdTUyQThcdTg5RTZcdTUzRDEgYXV0by1yZW5hbWUgXHU3RjE2XHU3ODAxXHU1MjA2XHU5MTREXHUzMDAyICovXG4gIGF1dG9SZW5hbWU6IGJvb2xlYW47XG4gIC8qKiBcdTgxRUFcdTUyQThcdTc2N0JcdThCQjBcdTUyMjBcdTk2NjRcdUZGMDhcdTUxOTlcdTk4REVcdTRFNjZcdTU5MUFcdTdFRjRcdTg4NjhcdTY4M0NcdUZGMDlcdTMwMDIgKi9cbiAgYXV0b0RlbGV0ZVJlZ2lzdHJ5OiBib29sZWFuO1xuICAvKiogXHU1NkZFXHU3MjQ3XHU3RjEzXHU1QjU4XHU2RTA1XHU3NDA2XHU1NDY4XHU2NzFGXHUzMDAyICovXG4gIGNhY2hlQ2xlYW51cDogJ2RhaWx5JyB8ICd3ZWVrbHknIHwgJ21vbnRobHknIHwgJ25ldmVyJztcbiAgLyoqIFx1NEZERFx1NzU1OVx1ODhDNVx1OTk3MFx1NTZGRVx1NzI0N1x1MzAwMiAqL1xuICBrZWVwRGVjb3JhdGl2ZUltYWdlczogYm9vbGVhbjtcbiAgLyoqIFx1OThERVx1NEU2Nlx1NzdFNVx1OEJDNlx1NUU5MyBzcGFjZV9pZFx1RkYwOFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1NzUyOFx1RkYwOVx1MzAwMiAqL1xuICBzcGFjZUlkOiBzdHJpbmc7XG4gIC8qKiAzLjIuMSBMYXJrIERvYyBcdTc2ODRcdTUxN0NcdTVCQjlcdTc2RUVcdTVGNTVcdTVCNTdcdTZCQjVcdTMwMDIgKi9cbiAgZGVmYXVsdE5vdGVGb2xkZXI6IHN0cmluZztcbiAgLyoqIFx1NjYyRlx1NTQyNlx1OTY5MFx1ODVDRlx1NTQwQ1x1NkI2NVx1NEY3Rlx1NzUyOFx1NzY4NFx1N0NGQlx1N0VERlx1NUM1RVx1NjAyN1x1MzAwMiAqL1xuICBoaWRlU3lzdGVtUHJvcGVydGllczogYm9vbGVhbjtcbiAgLyoqIFx1NTM0N1x1N0VBN1x1NjVGNlx1NEZERFx1NzU1OVx1NEVDRFx1ODhBQlx1OEZEMFx1ODg0Q1x1NzI0OFx1NEY3Rlx1NzUyOFx1NzY4NFx1NjcyQVx1NzdFNVx1NUI1N1x1NkJCNVx1MzAwMiAqL1xuICBbbGVnYWN5S2V5OiBzdHJpbmddOiB1bmtub3duO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogRmVpc2h1U3luY1NldHRpbmdzID0ge1xuICBzY2hlbWFWZXJzaW9uOiAxLFxuICBwb3J0OiA0NTY3LFxuICBzeW5jVG9rZW46ICcnLFxuICBsYXJrQ2xpUGF0aDogJycsXG4gIGRlZmF1bHREaXI6ICcwXHVGRTBGXHUyMEUzXHU4RjkzXHU1MTY1JyxcbiAgYXV0b1JlbmFtZTogdHJ1ZSxcbiAgYXV0b0RlbGV0ZVJlZ2lzdHJ5OiB0cnVlLFxuICBjYWNoZUNsZWFudXA6ICd3ZWVrbHknLFxuICBrZWVwRGVjb3JhdGl2ZUltYWdlczogdHJ1ZSxcbiAgc3BhY2VJZDogJzc2NTEzMTQxNTAwNjAwNjc4MDMnLFxuICBkZWZhdWx0Tm90ZUZvbGRlcjogJzNcdUZFMEZcdTIwRTNcdTk2NDRcdTRFRjZcdTY1ODdcdTRFRjYvTGFyaycsXG4gIGhpZGVTeXN0ZW1Qcm9wZXJ0aWVzOiB0cnVlLFxufTtcblxuLyoqIFx1NjNEMlx1NEVGNlx1OEZEMFx1ODg0Q1x1NjVGNlx1NzJCNlx1NjAwMVx1RkYwOFx1NEUwRFx1NjMwMVx1NEU0NVx1NTMxNlx1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBQbHVnaW5TdGF0ZSB7XG4gIC8qKiBsYXJrLWNsaSBcdTVCOUVcdTk2NDVcdThERUZcdTVGODRcdUZGMDhcdTYzQTJcdTZENEIvXHU4QkJFXHU3RjZFXHU1NDBFXHU3Njg0XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA5XHUzMDAyICovXG4gIGxhcmtDbGlSZXNvbHZlZDogc3RyaW5nO1xuICAvKiogbGFyay1jbGkgXHU3MjQ4XHU2NzJDXHU1M0Y3XHVGRjA4XHU1OTgyIFwiMS4wLjUyXCJcdUZGMDlcdTMwMDIgKi9cbiAgbGFya0NsaVZlcnNpb246IHN0cmluZztcbiAgLyoqIEhUVFAgc2VydmVyIFx1NjYyRlx1NTQyNlx1NkI2M1x1NTcyOFx1OEZEMFx1ODg0Q1x1MzAwMiAqL1xuICBzZXJ2ZXJSdW5uaW5nOiBib29sZWFuO1xuICAvKiogXHU2NzAwXHU4RkQxXHU1NDBDXHU2QjY1XHU4QkIwXHU1RjU1XHVGRjA4XHU1MTg1XHU1QjU4XHU0RTJEXHVGRjBDXHU2NzAwXHU1OTFBIDUwIFx1Njc2MVx1RkYwOVx1MzAwMiAqL1xuICByZWNlbnRTeW5jczogUmVjZW50U3luY1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlY2VudFN5bmMge1xuICB0aW1lOiBzdHJpbmc7XG4gIG5vZGVfdG9rZW46IHN0cmluZztcbiAgdGl0bGU6IHN0cmluZztcbiAgcGF0aDogc3RyaW5nO1xuICBhY3Rpb246ICdjcmVhdGVkJyB8ICd1cGRhdGVkJyB8ICdlcnJvcic7XG4gIGVycm9yPzogc3RyaW5nO1xufVxuIiwgIi8qKlxuICogT0IgXHU2M0QyXHU0RUY2XHU4QkJFXHU3RjZFXHU3NTRDXHU5NzYyXHUzMDAyXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzEwXHVGRjA4U2V0dGluZ3NUYWJcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdTdBRUZcdTUzRTNcdTMwMDFcdTU0MkZcdTUyQThcdTRFRTRcdTcyNENcdUZGMDhcdTc1MUZcdTYyMTAvXHU5MUNEXHU3RjZFL1x1NTkwRFx1NTIzNlx1RkYwOVx1MzAwMWxhcmstY2xpIFx1OERFRlx1NUY4NFx1MzAwMVx1OUVEOFx1OEJBNFx1NzZFRVx1NUY1NVx1MzAwMVx1NUYwMFx1NTE3M1x1MzAwMVx1N0YxM1x1NUI1OFx1NTQ2OFx1NjcxRlx1MzAwMlxuICovXG5pbXBvcnQgeyBBcHAsIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcsIE5vdGljZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgRmVpc2h1U3luY1BsdWdpbiB9IGZyb20gJy4vbWFpbi5qcyc7XG5pbXBvcnQgdHlwZSB7IEZlaXNodVN5bmNTZXR0aW5ncyB9IGZyb20gJy4vc2V0dGluZ3MuanMnO1xuaW1wb3J0IHsgZ2VuZXJhdGVTeW5jVG9rZW4gfSBmcm9tICcuL3NldHRpbmdzTWlncmF0aW9uLmpzJztcbmltcG9ydCB7IHJlc29sdmVDbGkgfSBmcm9tICcuL2xhcmsvY2xpLmpzJztcbmltcG9ydCB7IHJlZnJlc2hNYXBwaW5nIH0gZnJvbSAnLi9tYXBwaW5nLmpzJztcblxuZXhwb3J0IGNsYXNzIEZlaXNodVN5bmNTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBGZWlzaHVTeW5jUGx1Z2luKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG5cbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICdcdTk4REVcdTRFNjZcdTU0MENcdTZCNjVcdThCQkVcdTdGNkUnIH0pO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwIFx1OTAxQVx1NEZFMSBcdTI1MDBcdTI1MDBcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTY3MkNcdTU3MzBcdTdBRUZcdTUzRTMnKVxuICAgICAgLnNldERlc2MoJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NjI2OVx1NUM1NVx1OEZERVx1NjNBNSBPQiBcdTYzRDJcdTRFRjZcdTc2ODRcdTdBRUZcdTUzRTNcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkYgT0IgXHU2MjE2XHU5MUNEXHU2NUIwXHU1MkEwXHU4RjdEXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFZhbHVlKFN0cmluZyh0aGlzLnBsdWdpbi5zZXR0aW5ncy5wb3J0KSlcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3J0ID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcbiAgICAgICAgICAgIGlmIChwb3J0ID4gMCAmJiBwb3J0IDwgNjU1MzYpIHtcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MucG9ydCA9IHBvcnQ7XG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgIC8vIFx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1xuICAgIGNvbnN0IHRva2VuU2V0dGluZyA9IG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NTQyRlx1NTJBOFx1NEVFNFx1NzI0QycpXG4gICAgICAuc2V0RGVzYygnXHU2RDRGXHU4OUM4XHU1NjY4XHU2MjY5XHU1QzU1XHU5OTk2XHU2QjIxXHU4RkRFXHU2M0E1XHU5NzAwXHU3Qzk4XHU4RDM0XHU2QjY0XHU0RUU0XHU3MjRDXHUzMDAyXHU3MEI5XHU1MUZCXHU1OTBEXHU1MjM2XHU1NDBFXHU3Qzk4XHU4RDM0XHU1MjMwXHU2MjY5XHU1QzU1XHU1RjM5XHU3QTk3XHUzMDAyJyk7XG5cbiAgICB0b2tlblNldHRpbmcuYWRkVGV4dCgodGV4dCkgPT4ge1xuICAgICAgdGV4dFxuICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY1Rva2VuKVxuICAgICAgICAuc2V0RGlzYWJsZWQodHJ1ZSkgLy8gXHU1M0VBXHU4QkZCXHVGRjBDXHU5MDdGXHU1MTREXHU2MjRCXHU2NTM5XG4gICAgICAgIC5pbnB1dEVsLnN0eWxlLmZvbnRGYW1pbHkgPSAnbW9ub3NwYWNlJztcbiAgICB9KTtcblxuICAgIHRva2VuU2V0dGluZy5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgIGJ0blxuICAgICAgICAuc2V0QnV0dG9uVGV4dCgnXHU1OTBEXHU1MjM2JylcbiAgICAgICAgLnNldFRvb2x0aXAoJ1x1NTkwRFx1NTIzNlx1NEVFNFx1NzI0Q1x1NTIzMFx1NTI2QVx1OEQzNFx1Njc3RicpXG4gICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jVG9rZW4pO1xuICAgICAgICAgIG5ldyBOb3RpY2UoJ1x1MjcwNSBcdTRFRTRcdTcyNENcdTVERjJcdTU5MERcdTUyMzYnKTtcbiAgICAgICAgfSksXG4gICAgKTtcblxuICAgIHRva2VuU2V0dGluZy5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgIGJ0blxuICAgICAgICAuc2V0QnV0dG9uVGV4dCgnXHU5MUNEXHU3RjZFJylcbiAgICAgICAgLnNldFRvb2x0aXAoJ1x1NzUxRlx1NjIxMFx1NjVCMFx1NEVFNFx1NzI0Q1x1RkYwOFx1NjI2OVx1NUM1NVx1OTcwMFx1OTFDRFx1NjVCMFx1N0M5OFx1OEQzNFx1RkYwOScpXG4gICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jVG9rZW4gPSBnZW5lcmF0ZVN5bmNUb2tlbigpO1xuICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xuICAgICAgICAgIG5ldyBOb3RpY2UoJ1x1RDgzRFx1REQwNCBcdTRFRTRcdTcyNENcdTVERjJcdTkxQ0RcdTdGNkUnKTtcbiAgICAgICAgfSksXG4gICAgKTtcblxuICAgIC8vIFx1MjUwMFx1MjUwMCBsYXJrLWNsaSBcdTI1MDBcdTI1MDBcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdsYXJrLWNsaScgfSk7XG5cbiAgICBjb25zdCBsYXJrSW5mbyA9IGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDogYFx1NzJCNlx1NjAwMVx1RkYxQSR7dGhpcy5wbHVnaW4uc3RhdGUubGFya0NsaVJlc29sdmVkID8gJ1x1MjcwNSAnICsgdGhpcy5wbHVnaW4uc3RhdGUubGFya0NsaVZlcnNpb24gOiAnXHUyNzRDIFx1NjcyQVx1NjI3RVx1NTIzMCd9YCxcbiAgICAgIGNsczogJ3NldHRpbmctaXRlbS1kZXNjcmlwdGlvbicsXG4gICAgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdsYXJrLWNsaSBcdThERUZcdTVGODQnKVxuICAgICAgLnNldERlc2MoJ1x1NzU1OVx1N0E3QVx1NTIxOVx1ODFFQVx1NTJBOFx1NjNBMlx1NkQ0Qlx1MzAwMlx1NTk4Mlx1ODFFQVx1NTJBOFx1NjNBMlx1NkQ0Qlx1NTkzMVx1OEQyNVx1RkYwQ1x1OEJGN1x1NjI0Qlx1NTJBOFx1NTg2Qlx1NTE5OVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1MzAwMicpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5sYXJrQ2xpUGF0aClcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ1x1ODFFQVx1NTJBOFx1NjNBMlx1NkQ0QicpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MubGFya0NsaVBhdGggPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKVxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgICBidG5cbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dCgnXHU2RDRCXHU4QkQ1JylcbiAgICAgICAgICAuc2V0VG9vbHRpcCgnXHU5MUNEXHU2NUIwXHU2M0EyXHU2RDRCIGxhcmstY2xpJylcbiAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSByZXNvbHZlQ2xpKHRoaXMucGx1Z2luLnNldHRpbmdzLmxhcmtDbGlQYXRoIHx8IHVuZGVmaW5lZCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnN0YXRlLmxhcmtDbGlSZXNvbHZlZCA9IHJlc3VsdC5wYXRoO1xuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zdGF0ZS5sYXJrQ2xpVmVyc2lvbiA9IHJlc3VsdC52ZXJzaW9uO1xuICAgICAgICAgICAgICBsYXJrSW5mby5zZXRUZXh0KGBcdTcyQjZcdTYwMDFcdUZGMUFcdTI3MDUgJHtyZXN1bHQudmVyc2lvbn1gKTtcbiAgICAgICAgICAgICAgbmV3IE5vdGljZShgXHUyNzA1IFx1NjI3RVx1NTIzMCAke3Jlc3VsdC52ZXJzaW9ufWApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc3RhdGUubGFya0NsaVJlc29sdmVkID0gJyc7XG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnN0YXRlLmxhcmtDbGlWZXJzaW9uID0gJyc7XG4gICAgICAgICAgICAgIGxhcmtJbmZvLnNldFRleHQoJ1x1NzJCNlx1NjAwMVx1RkYxQVx1Mjc0QyBcdTY3MkFcdTYyN0VcdTUyMzAnKTtcbiAgICAgICAgICAgICAgbmV3IE5vdGljZSgnXHUyNzRDIFx1NjcyQVx1NjI3RVx1NTIzMCBsYXJrLWNsaVx1RkYwOFx1OTcwMCBcdTIyNjUgMS4wLjUyXHVGRjA5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwIFx1NTQwQ1x1NkI2NVx1ODg0Q1x1NEUzQSBcdTI1MDBcdTI1MDBcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdcdTU0MENcdTZCNjVcdTg4NENcdTRFM0EnIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU5RUQ4XHU4QkE0XHU4NDNEXHU1NzMwXHU3NkVFXHU1RjU1JylcbiAgICAgIC5zZXREZXNjKCdcdTYyNjlcdTVDNTVcdTY3MkFcdTYzMDdcdTVCOUFcdTc2RUVcdTVGNTVcdTY1RjZcdUZGMENcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjNcdTg0M0RcdTU3MzBcdTUyMzBcdTZCNjRcdTc2RUVcdTVGNTVcdUZGMDhcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHREaXIpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdERpciA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4MUVBXHU1MkE4XHU1MjA2XHU5MTREXHU3RjE2XHU3ODAxJylcbiAgICAgIC5zZXREZXNjKCdcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjNcdTg0M0RcdTU3MzBcdTU0MEVcdTgxRUFcdTUyQThcdTg5RTZcdTUzRDEgYXV0by1yZW5hbWUgXHU3RjE2XHU3ODAxXHU1MjA2XHU5MTREJylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9SZW5hbWUpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b1JlbmFtZSA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU1MjIwXHU5NjY0XHU4MUVBXHU1MkE4XHU3NjdCXHU4QkIwJylcbiAgICAgIC5zZXREZXNjKCdcdTUyMjBcdTk2NjRcdTU0MkIgZmVpc2h1X2lkIFx1NzY4NFx1NjU4N1x1NEVGNlx1NjVGNlx1RkYwQ1x1ODFFQVx1NTJBOFx1NzY3Qlx1OEJCMFx1NTIzMFx1OThERVx1NEU2Nlx1NTkxQVx1N0VGNFx1ODg2OFx1NjgzQycpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdXRvRGVsZXRlUmVnaXN0cnkpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b0RlbGV0ZVJlZ2lzdHJ5ID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTRGRERcdTc1NTlcdTg4QzVcdTk5NzBcdTU2RkVcdTcyNDcnKVxuICAgICAgLnNldERlc2MoJ1x1OThERVx1NEU2Nlx1NjM5Mlx1NzI0OFx1NzI2OVx1NjU5OVx1RkYwODEzNVx1N0YxNlx1OEY5MVx1NTY2OFx1OThDRVx1NjgzQ1x1N0I0OVx1N0VBRlx1NTZGRVx1NzI0N1x1RkYwOVx1NjYyRlx1NTQyNlx1ODQzRFx1NTczMFx1NTIzMCBPQicpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5rZWVwRGVjb3JhdGl2ZUltYWdlcylcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5rZWVwRGVjb3JhdGl2ZUltYWdlcyA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU5NjkwXHU4NUNGXHU3Q0ZCXHU3RURGXHU1QzVFXHU2MDI3JylcbiAgICAgIC5zZXREZXNjKCdcdTk2OTBcdTg1Q0YgX3N5c18gXHU1RjAwXHU1OTM0XHU1NDhDXHU2NUU3XHU3MjQ4XHU5OERFXHU0RTY2XHU1NDBDXHU2QjY1XHU1QjU3XHU2QkI1XHVGRjFCXHU1QjU3XHU2QkI1XHU0RUNEXHU0RkREXHU3NTU5XHU3RUQ5XHU1NDBDXHU2QjY1XHU5MDNCXHU4RjkxXHU0RjdGXHU3NTI4JylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmhpZGVTeXN0ZW1Qcm9wZXJ0aWVzKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmhpZGVTeXN0ZW1Qcm9wZXJ0aWVzID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLmFwcGx5U3lzdGVtUHJvcGVydGllc1Zpc2liaWxpdHkoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTU2RkVcdTcyNDdcdTdGMTNcdTVCNThcdTZFMDVcdTc0MDZcdTU0NjhcdTY3MUYnKVxuICAgICAgLnNldERlc2MoJ2ZlaXNodTovL3Rva2VuIFx1OTg4NFx1ODlDOFx1NTZGRVx1NzI0N1x1NzY4NFx1NjcyQ1x1NTczMFx1N0YxM1x1NUI1OFx1NEZERFx1NzU1OVx1NjVGNlx1OTU3RicpXG4gICAgICAuYWRkRHJvcGRvd24oKGRyb3Bkb3duKSA9PlxuICAgICAgICBkcm9wZG93blxuICAgICAgICAgIC5hZGRPcHRpb24oJ2RhaWx5JywgJ1x1NkJDRlx1NTkyOScpXG4gICAgICAgICAgLmFkZE9wdGlvbignd2Vla2x5JywgJ1x1NkJDRlx1NTQ2OCcpXG4gICAgICAgICAgLmFkZE9wdGlvbignbW9udGhseScsICdcdTZCQ0ZcdTY3MDgnKVxuICAgICAgICAgIC5hZGRPcHRpb24oJ25ldmVyJywgJ1x1NkMzOFx1NEUwRCcpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmNhY2hlQ2xlYW51cClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jYWNoZUNsZWFudXAgPSB2YWx1ZSBhcyBGZWlzaHVTeW5jU2V0dGluZ3NbJ2NhY2hlQ2xlYW51cCddO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwIFx1OThERVx1NEU2Nlx1NzdFNVx1OEJDNlx1NUU5MyBcdTI1MDBcdTI1MDBcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdcdTk4REVcdTRFNjZcdTc3RTVcdThCQzZcdTVFOTMnIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU3N0U1XHU4QkM2XHU1RTkzIHNwYWNlX2lkJylcbiAgICAgIC5zZXREZXNjKCdcdTc2RUVcdTVGNTVcdTY2MjBcdTVDMDRcdTc1MjhcdTMwMDJcdTY1QjBcdTc3RTVcdThCQzZcdTVFOTNcdTlFRDhcdThCQTQgNzY1MTMxNDE1MDA2MDA2NzgwMycpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zcGFjZUlkKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnNwYWNlSWQgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKVxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgICBidG5cbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dCgnXHU1MjM3XHU2NUIwXHU2NjIwXHU1QzA0JylcbiAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCByZWZyZXNoTWFwcGluZyh0aGlzLmFwcCwgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc3BhY2VJZCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuICB9XG59XG4iLCAiLyoqXG4gKiBsYXJrLWNsaSBcdTVDMDFcdTg4QzVcdTVDNDJcdTMwMDJcdTRGOURcdTYzNkUgYHJjLXgvc2NyaXB0cy9yY19lbnYucHlgICsgYDAzX1x1NjgzQ1x1NUYwRlx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU1MzQxL1x1NTM0MVx1NEUwMFx1MzAwMlxuICpcbiAqIC0gcmVzb2x2ZUNsaSgpXHVGRjFBXHU1MDE5XHU5MDA5XHU4REVGXHU1Rjg0XHU2M0EyXHU2RDRCXHVGRjBDXHU3MjQ4XHU2NzJDXHU2ODIxXHU5QThDIFx1MjI2NSAxLjAuNTJcbiAqIC0gcnVuKClcdUZGMUFcdTdFREZcdTRFMDAgc3Bhd25TeW5jIFx1NTMwNVx1ODhDNVx1RkYwQ1x1OTFDRFx1OEJENVx1MzAwMVx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1MzAwMWVtb2ppIFx1NkUwNVx1NkQxN1x1MzAwMX5cdTUzQ0RcdThGNkNcdTRFNDlcdTMwMDFKU09OIFx1NTMwNVx1ODhDNVx1ODlFM1x1NTMwNVxuICogLSBcdTY4MDdcdTk4OThcdTRGRUVcdTU5MERcdUZGMUFvdmVyd3JpdGUgXHU1NDBFXHU4RkZEXHU1MkEwIHN0cl9yZXBsYWNlIFx1NEZFRSA8dGl0bGU+XG4gKlxuICogXHU1OTFBXHU4QkJFXHU1OTA3XHU5MDAyXHU5MTREXHU1MTczXHU5NTJFXHU3MEI5XHVGRjFBXG4gKiAtIEdVSSBcdTU0MkZcdTUyQThcdTc2ODQgT2JzaWRpYW4gXHU2MkZGXHU0RTBEXHU1MjMwXHU3RUM4XHU3QUVGIFBBVEhcdUZGMDhudm0vaG9tZWJyZXcgXHU0RTBEXHU1NzI4XHU1MTg1XHVGRjA5XHVGRjBDXHU2NTQ1IHNwYXduIFx1NjVGNlx1NkNFOFx1NTE2NVx1NTg5RVx1NUYzQSBQQVRIXG4gKiAtIG52bSBcdTc2RUVcdTVGNTVcdTYzMDlcdTY1NzBcdTVCNTdcdTVFOEZcdTUzRDYgbGF0ZXN0XHVGRjA4XHU1QjU3XHU3QjI2XHU0RTMyIHNvcnQgXHU0RjFBXHU4QkE5IHY5ID4gdjEwXHVGRjA5XG4gKi9cbmltcG9ydCB7IGV4ZWNGaWxlU3luYywgdHlwZSBFeGVjRmlsZVN5bmNPcHRpb25zV2l0aFN0cmluZ0VuY29kaW5nIH0gZnJvbSAnbm9kZTpjaGlsZF9wcm9jZXNzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ25vZGU6b3MnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycywgdW5lc2NhcGVGZWlzaHVUaWxkZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5cbmNvbnN0IE1JTl9WRVJTSU9OID0gWzEsIDAsIDUyXTtcblxuLyoqXG4gKiBcdTY3ODRcdTkwMjBcdTU4OUVcdTVGM0EgUEFUSFx1RkYxQVx1NTcyOFx1OEZEQlx1N0EwQlx1NzNCMFx1NjcwOSBQQVRIIFx1NTI0RFx1OEZGRFx1NTJBMCBudm0vbGF0ZXN0L2JpbiArIFx1NUUzOFx1ODlDMVx1NUI4OVx1ODhDNVx1NEY0RFx1MzAwMlxuICogXHU3NTI4XHU0RThFIEdVSSBcdTU0MkZcdTUyQThcdTc2ODQgT2JzaWRpYW5cdUZGMDhQQVRIIFx1N0YzQSBudm0vaG9tZWJyZXdcdUZGMENcdTVCRkNcdTgxRjQgIyEvdXNyL2Jpbi9lbnYgbm9kZSBcdTYyN0VcdTRFMERcdTUyMzAgbm9kZVx1RkYwOVx1MzAwMlxuICovXG5mdW5jdGlvbiBidWlsZEVuaGFuY2VkUGF0aCgpOiBzdHJpbmcge1xuICBjb25zdCBleHRyYTogc3RyaW5nW10gPSBbXTtcbiAgLy8gbnZtIGxhdGVzdCBub2RlIFx1NzY4NCBiaW5cbiAgY29uc3QgbnZtQmFzZSA9IHBhdGguam9pbihvcy5ob21lZGlyKCksICcubnZtL3ZlcnNpb25zL25vZGUnKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBkaXJzID0gZnMucmVhZGRpclN5bmMobnZtQmFzZSk7XG4gICAgLy8gXHU2NTcwXHU1QjU3XHU1RThGXHU1M0Q2XHU2NzAwXHU1OTI3XHU3MjQ4XHU2NzJDXHVGRjA4djkgdnMgdjEwIFx1NUI1N1x1N0IyNlx1NEUzMlx1NjM5Mlx1NUU4Rlx1NEYxQVx1OTUxOVx1RkYwOVxuICAgIGNvbnN0IGxhdGVzdCA9IGRpcnNcbiAgICAgIC5tYXAoZCA9PiAoeyBuYW1lOiBkLCB2ZXI6IHBhcnNlSW50KGQucmVwbGFjZSgvXnYvLCAnJyksIDEwKSB9KSlcbiAgICAgIC5maWx0ZXIoeCA9PiAhTnVtYmVyLmlzTmFOKHgudmVyKSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBhLnZlciAtIGIudmVyKVxuICAgICAgLnBvcCgpO1xuICAgIGlmIChsYXRlc3QpIGV4dHJhLnB1c2gocGF0aC5qb2luKG52bUJhc2UsIGxhdGVzdC5uYW1lLCAnYmluJykpO1xuICB9IGNhdGNoIHsgLyogbnZtIFx1NjcyQVx1ODhDNSAqLyB9XG4gIGV4dHJhLnB1c2gocGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJy5sb2NhbCcsICdiaW4nKSk7XG4gIGV4dHJhLnB1c2goJy9vcHQvaG9tZWJyZXcvYmluJyk7XG4gIGV4dHJhLnB1c2goJy91c3IvbG9jYWwvYmluJyk7XG4gIGNvbnN0IGJhc2UgPSBwcm9jZXNzLmVudi5QQVRIID8/ICcnO1xuICByZXR1cm4gWy4uLmV4dHJhLmZpbHRlcihwID0+ICFiYXNlLnNwbGl0KHBhdGguZGVsaW1pdGVyKS5pbmNsdWRlcyhwKSksIGJhc2VdLmpvaW4ocGF0aC5kZWxpbWl0ZXIpO1xufVxuXG4vKiogcnVuKCkgXHU1MTcxXHU3NTI4XHU3Njg0XHU1ODlFXHU1RjNBIFBBVEhcdUZGMDhcdTk5OTZcdTZCMjFcdTg5RTNcdTY3OTBcdTU0MEVcdTdGMTNcdTVCNThcdUZGMDlcdTMwMDIgKi9cbmxldCBlbmhhbmNlZFBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gZ2V0RW5oYW5jZWRQYXRoKCk6IHN0cmluZyB7XG4gIHJldHVybiBlbmhhbmNlZFBhdGggPz89IGJ1aWxkRW5oYW5jZWRQYXRoKCk7XG59XG5cbi8qKlxuICogXHU1NzI4XHU1ODlFXHU1RjNBIFBBVEggXHU0RTBCXHU2N0U1XHU2MjdFXHU1M0VGXHU2MjY3XHU4ODRDXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHVGRjA4XHU2NkZGXHU0RUUzIGB3aGljaGBcdUZGMENcdTkwN0ZcdTUxNEQgR1VJIFx1OEZEQlx1N0EwQiBQQVRIIFx1N0YzQVx1NTkzMVx1RkYwOVx1MzAwMlxuICogXHU3NTI4IGV4ZWNGaWxlU3luYyBcdTRFMERcdThENzAgc2hlbGxcdUZGMENcdTY2RjRcdTdBMzNcdTMwMDJcbiAqL1xuZnVuY3Rpb24gd2hpY2goY21kOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgLy8gXHU1MTQ4XHU4QkQ1XHU1RjUzXHU1MjREIFBBVEhcdUZGMDhcdTdFQzhcdTdBRUZcdTU3M0FcdTY2NkZcdUZGMDlcbiAgdHJ5IHtcbiAgICBjb25zdCBmb3VuZCA9IGV4ZWNGaWxlU3luYygnL3Vzci9iaW4vd2hpY2gnLCBbY21kXSwge1xuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICAgIHRpbWVvdXQ6IDMwMDAsXG4gICAgICBlbnY6IHsgLi4ucHJvY2Vzcy5lbnYgfSxcbiAgICB9KS50cmltKCk7XG4gICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmQ7XG4gIH0gY2F0Y2ggeyAvKiBmYWxsIHRocm91Z2ggKi8gfVxuICAvLyBcdTUxOERcdThCRDVcdTU4OUVcdTVGM0EgUEFUSFx1RkYwOEdVSSBcdTU3M0FcdTY2NkZcdUZGMDlcbiAgdHJ5IHtcbiAgICBjb25zdCBmb3VuZCA9IGV4ZWNGaWxlU3luYygnL3Vzci9iaW4vd2hpY2gnLCBbY21kXSwge1xuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICAgIHRpbWVvdXQ6IDMwMDAsXG4gICAgICBlbnY6IHsgLi4ucHJvY2Vzcy5lbnYsIFBBVEg6IGdldEVuaGFuY2VkUGF0aCgpIH0sXG4gICAgfSkudHJpbSgpO1xuICAgIHJldHVybiBmb3VuZCB8fCBudWxsO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKiogXHU1MDE5XHU5MDA5XHU4REVGXHU1Rjg0XHVGRjA4XHU3OUZCXHU2OTBEIHJjX2Vudi5weSByZXNvbHZlX2NsaVx1RkYwOVx1MzAwMiAqL1xuY29uc3QgQ0xJX0NBTkRJREFURVM6ICgoKSA9PiBzdHJpbmcgfCBudWxsKVtdID0gW1xuICAoKSA9PiBwcm9jZXNzLmVudi5MQVJLX0NMSV9CSU4gPz8gbnVsbCxcbiAgKCkgPT4gd2hpY2goJ2xhcmtzdWl0ZS1jbGknKSxcbiAgKCkgPT4gd2hpY2goJ2xhcmstY2xpJyksXG4gICgpID0+IHtcbiAgICBjb25zdCBudm1CYXNlID0gcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJy5udm0vdmVyc2lvbnMvbm9kZScpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkaXJzID0gZnMucmVhZGRpclN5bmMobnZtQmFzZSk7XG4gICAgICAvLyBcdTY1NzBcdTVCNTdcdTVFOEZcdTUzRDZcdTY3MDBcdTU5MjdcdTcyNDhcdTY3MkNcdUZGMDhcdTVCNTdcdTdCMjZcdTRFMzIgc29ydCBcdTRGMUFcdThCQTkgdjkgPiB2MTBcdUZGMDlcbiAgICAgIGNvbnN0IGxhdGVzdCA9IGRpcnNcbiAgICAgICAgLm1hcChkID0+ICh7IG5hbWU6IGQsIHZlcjogcGFyc2VJbnQoZC5yZXBsYWNlKC9edi8sICcnKSwgMTApIH0pKVxuICAgICAgICAuZmlsdGVyKHggPT4gIU51bWJlci5pc05hTih4LnZlcikpXG4gICAgICAgIC5zb3J0KChhLCBiKSA9PiBhLnZlciAtIGIudmVyKVxuICAgICAgICAucG9wKCk7XG4gICAgICByZXR1cm4gbGF0ZXN0ID8gcGF0aC5qb2luKG52bUJhc2UsIGxhdGVzdC5uYW1lLCAnYmluJywgJ2xhcmstY2xpJykgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9LFxuICAoKSA9PiBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnLmxvY2FsJywgJ2JpbicsICdsYXJrLWNsaScpLFxuICAoKSA9PiAnL29wdC9ob21lYnJldy9iaW4vbGFyay1jbGknLFxuICAoKSA9PiAnL3Vzci9sb2NhbC9iaW4vbGFyay1jbGknLFxuXTtcblxuLyoqXG4gKiBcdTYzQTJcdTZENEIgbGFyay1jbGkgXHU4REVGXHU1Rjg0XHUzMDAyXHU0RjE4XHU1MTQ4XHU3NTI4XHU4QkJFXHU3RjZFXHU4OTg2XHU3NkQ2XHVGRjBDXHU1NDI2XHU1MjE5XHU4RDcwXHU1MDE5XHU5MDA5XHU4REVGXHU1Rjg0XHUzMDAyXG4gKiBAcmV0dXJucyB7IHBhdGgsIHZlcnNpb24gfSBcdTYyMTYgbnVsbFx1RkYwOFx1NjcyQVx1NjI3RVx1NTIzMFx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUNsaShvdmVycmlkZVBhdGg/OiBzdHJpbmcpOiB7IHBhdGg6IHN0cmluZzsgdmVyc2lvbjogc3RyaW5nIH0gfCBudWxsIHtcbiAgY29uc3QgY2FuZGlkYXRlcyA9IG92ZXJyaWRlUGF0aFxuICAgID8gWygpID0+IG92ZXJyaWRlUGF0aF1cbiAgICA6IENMSV9DQU5ESURBVEVTO1xuXG4gIGZvciAoY29uc3QgZ2V0Q2xpIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICBjb25zdCBjbGkgPSBnZXRDbGkoKTtcbiAgICBpZiAoIWNsaSkgY29udGludWU7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFx1NzUyOCBleGVjRmlsZVN5bmMgXHU3NkY0XHU2M0E1XHU4REQxIGNsaVx1RkYwQ1x1NkNFOFx1NTE2NVx1NTg5RVx1NUYzQSBQQVRIXHVGRjA4XHU4OUUzXHU1MUIzIEdVSSBcdThGREJcdTdBMEIgZW52IG5vZGUgXHU2MjdFXHU0RTBEXHU1MjMwXHU3Njg0XHU5NUVFXHU5ODk4XHVGRjA5XG4gICAgICBjb25zdCB2ZXIgPSBleGVjRmlsZVN5bmMoY2xpLCBbJy0tdmVyc2lvbiddLCB7XG4gICAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgICAgIHRpbWVvdXQ6IDUwMDAsXG4gICAgICAgIGVudjogeyAuLi5wcm9jZXNzLmVudiwgUEFUSDogZ2V0RW5oYW5jZWRQYXRoKCkgfSxcbiAgICAgIH0pLnRyaW0oKTtcbiAgICAgIC8vIFx1ODlFM1x1Njc5MCBcImxhcmstY2xpIHZlcnNpb24gMS4wLjUyXCJcbiAgICAgIGNvbnN0IG1hdGNoID0gdmVyLm1hdGNoKC8oXFxkKylcXC4oXFxkKylcXC4oXFxkKykvKTtcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICBjb25zdCBtYWpvciA9IHBhcnNlSW50KG1hdGNoWzFdLCAxMCk7XG4gICAgICAgIGNvbnN0IG1pbm9yID0gcGFyc2VJbnQobWF0Y2hbMl0sIDEwKTtcbiAgICAgICAgY29uc3QgcGF0Y2ggPSBwYXJzZUludChtYXRjaFszXSwgMTApO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgbWFqb3IgPiBNSU5fVkVSU0lPTlswXSB8fFxuICAgICAgICAgIChtYWpvciA9PT0gTUlOX1ZFUlNJT05bMF0gJiYgbWlub3IgPiBNSU5fVkVSU0lPTlsxXSkgfHxcbiAgICAgICAgICAobWFqb3IgPT09IE1JTl9WRVJTSU9OWzBdICYmIG1pbm9yID09PSBNSU5fVkVSU0lPTlsxXSAmJiBwYXRjaCA+PSBNSU5fVkVSU0lPTlsyXSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIHsgcGF0aDogY2xpLCB2ZXJzaW9uOiB2ZXIgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gXHU3MjQ4XHU2NzJDXHU4OUUzXHU2NzkwXHU1OTMxXHU4RDI1XHU0RjQ2XHU2NzA5XHU4RjkzXHU1MUZBXHVGRjBDXHU0RUNEXHU1M0VGXHU3NTI4XG4gICAgICBpZiAodmVyKSByZXR1cm4geyBwYXRoOiBjbGksIHZlcnNpb246IHZlciB9O1xuICAgIH0gY2F0Y2gge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKiogcnVuKCkgXHU2MjY3XHU4ODRDXHU5MDA5XHU5ODc5XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFJ1bk9wdGlvbnMge1xuICAvKiogXHU1REU1XHU0RjVDXHU3NkVFXHU1RjU1XHVGRjA4LS1jb250ZW50IEBmaWxlIFx1NzUyOFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1NjVGNlx1OTcwMFx1ODk4MVx1RkYwOVx1MzAwMiAqL1xuICBjd2Q/OiBzdHJpbmc7XG4gIC8qKiBcdTY3MDBcdTU5MjdcdTkxQ0RcdThCRDVcdTZCMjFcdTY1NzBcdUZGMDhcdTlFRDhcdThCQTQgM1x1RkYwOVx1MzAwMiAqL1xuICByZXRyaWVzPzogbnVtYmVyO1xuICAvKiogXHU4RDg1XHU2NUY2IG1zXHVGRjA4XHU5RUQ4XHU4QkE0IDMwc1x1RkYwOVx1MzAwMiAqL1xuICB0aW1lb3V0PzogbnVtYmVyO1xuICAvKiogXHU2NzFGXHU2NzFCIEpTT04gXHU4RjkzXHU1MUZBXHU2NUY2IHRydWVcdUZGMENcdTgxRUFcdTUyQThcdThERjNcdThGQzcgXCJGb3VuZCBYIG5vZGUocylcIiBcdTUyNERcdTdGMDBcdTMwMDIgKi9cbiAganNvbj86IGJvb2xlYW47XG59XG5cbi8qKlxuICogXHU2MjY3XHU4ODRDIGxhcmstY2xpIFx1NTQ3RFx1NEVFNFx1MzAwMlx1N0VERlx1NEUwMFx1NTkwNFx1NzQwNlx1NURGMlx1NzdFNVx1NTc1MVx1MzAwMlxuICpcbiAqIEBwYXJhbSBhcmdzIGxhcmstY2xpIFx1NUI1MFx1NTQ3RFx1NEVFNFx1NTNDMlx1NjU3MFx1NjU3MFx1N0VDNFx1RkYwQ1x1NTk4MiBbJ2RvY3MnLCAnK2ZldGNoJywgJy0tZG9jJywgdG9rZW4sICctLWRvYy1mb3JtYXQnLCAnbWFya2Rvd24nXVxuICogQHBhcmFtIG9wdGlvbnMgXHU5MDA5XHU5ODc5XG4gKiBAcmV0dXJucyBzdGRvdXRcdUZGMDhcdTVERjJcdTZFMDVcdTZEMTdcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJ1bihhcmdzOiBzdHJpbmdbXSwgb3B0aW9uczogUnVuT3B0aW9ucyA9IHt9KTogc3RyaW5nIHtcbiAgY29uc3QgeyBjd2QsIHJldHJpZXMgPSAzLCB0aW1lb3V0ID0gMzAwMDAsIGpzb24gPSBmYWxzZSB9ID0gb3B0aW9ucztcbiAgY29uc3QgY2xpUGF0aCA9IHByb2Nlc3MuZW52Ll9fTEFSS19DTElfUEFUSF9fIHx8ICdsYXJrLWNsaSc7XG5cbiAgbGV0IGxhc3RFcnJvcjogRXJyb3IgfCBudWxsID0gbnVsbDtcblxuICBmb3IgKGxldCBhdHRlbXB0ID0gMTsgYXR0ZW1wdCA8PSByZXRyaWVzOyBhdHRlbXB0KyspIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZnVsbEFyZ3MgPSBbLi4uYXJnc107XG4gICAgICBjb25zdCBleGVjT3B0czogRXhlY0ZpbGVTeW5jT3B0aW9uc1dpdGhTdHJpbmdFbmNvZGluZyA9IHtcbiAgICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICAgICAgdGltZW91dCxcbiAgICAgICAgbWF4QnVmZmVyOiAxMCAqIDEwMjQgKiAxMDI0LCAvLyAxME1CXHVGRjA4XHU1OTI3XHU2NTg3XHU2ODYzXHVGRjA5XG4gICAgICAgIC8vIFx1NkNFOFx1NTE2NVx1NTg5RVx1NUYzQSBQQVRIXHVGRjFBR1VJIFx1NTQyRlx1NTJBOFx1NzY4NCBPYnNpZGlhbiBcdTYyRkZcdTRFMERcdTUyMzAgbnZtL2hvbWVicmV3XHVGRjBDXHU1QkZDXHU4MUY0XG4gICAgICAgIC8vIGAjIS91c3IvYmluL2VudiBub2RlYCBcdTYyN0VcdTRFMERcdTUyMzAgbm9kZVx1RkYwOGNsaSBcdTY2MkYgbm9kZSBcdTgxMUFcdTY3MkNcdUZGMDlcbiAgICAgICAgZW52OiB7IC4uLnByb2Nlc3MuZW52LCBQQVRIOiBnZXRFbmhhbmNlZFBhdGgoKSB9LFxuICAgICAgfTtcblxuICAgICAgLy8gXHU1OTA0XHU3NDA2IC0tY29udGVudCBAZmlsZVx1RkYxQVx1NzUyOFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOFx1NTc1MVx1RkYxQVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1ODhBQlx1NjJEMlx1RkYwOVxuICAgICAgY29uc3QgY29udGVudElkeCA9IGZ1bGxBcmdzLmluZGV4T2YoJy0tY29udGVudCcpO1xuICAgICAgaWYgKGNvbnRlbnRJZHggIT09IC0xICYmIGNvbnRlbnRJZHggKyAxIDwgZnVsbEFyZ3MubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRWYWwgPSBmdWxsQXJnc1tjb250ZW50SWR4ICsgMV07XG4gICAgICAgIGlmIChjb250ZW50VmFsLnN0YXJ0c1dpdGgoJ0AnKSkge1xuICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gY29udGVudFZhbC5zbGljZSgxKTtcbiAgICAgICAgICBjb25zdCBkaXIgPSBjd2QgfHwgcGF0aC5kaXJuYW1lKGZpbGVQYXRoKTtcbiAgICAgICAgICBjb25zdCBiYXNlTmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpO1xuICAgICAgICAgIGZ1bGxBcmdzW2NvbnRlbnRJZHggKyAxXSA9IGBALi8ke2Jhc2VOYW1lfWA7XG4gICAgICAgICAgZXhlY09wdHMuY3dkID0gZGlyO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGN3ZCkge1xuICAgICAgICBleGVjT3B0cy5jd2QgPSBjd2Q7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTE5OVx1NTE2NVx1NTI0RCBlbW9qaSBcdTZFMDVcdTZEMTdcdUZGMUFcdTYyNkJcdTYzQ0YgZnVsbEFyZ3MgXHU0RTJEIC0tY29udGVudCBAZmlsZSBcdTc2ODRcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcbiAgICAgIGlmIChjb250ZW50SWR4ICE9PSAtMSAmJiBjb250ZW50SWR4ICsgMSA8IGZ1bGxBcmdzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGZ1bGxBcmdzW2NvbnRlbnRJZHggKyAxXS5yZXBsYWNlKC9eQFxcLlxcLy8sICcnKTtcbiAgICAgICAgY29uc3QgZXhlY3V0aW9uRGlyZWN0b3J5ID0gdHlwZW9mIGV4ZWNPcHRzLmN3ZCA9PT0gJ3N0cmluZycgPyBleGVjT3B0cy5jd2QgOiBwcm9jZXNzLmN3ZCgpO1xuICAgICAgICBjb25zdCBmdWxsRmlsZVBhdGggPSBwYXRoLmpvaW4oZXhlY3V0aW9uRGlyZWN0b3J5LCBmaWxlUGF0aCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbGV0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbEZpbGVQYXRoLCAndXRmOCcpO1xuICAgICAgICAgIGNvbnRlbnQgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhjb250ZW50KTtcbiAgICAgICAgICAvLyBcdTUzQ0RcdThGNkNcdTRFNDkgXFx+IFx1MjE5MiB+XHVGRjA4XHU5OERFXHU0RTY2XHU4QkZCXHU1NkRFXHU2NzY1XHU2NUY2XHU4RjZDXHU0RTQ5XHU0RTg2XHU2Q0UyXHU2RDZBXHU1M0Y3XHVGRjA5XG4gICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvXFxcXH4vZywgJ34nKTtcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZ1bGxGaWxlUGF0aCwgY29udGVudCwgJ3V0ZjgnKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgLy8gXHU2NTg3XHU0RUY2XHU4QkZCXHU0RTBEXHU1MjMwXHU1QzMxXHU4REYzXHU4RkM3XHU2RTA1XHU2RDE3XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gXHU3NTI4IGV4ZWNGaWxlU3luYyBcdTc2RjRcdTYzQTVcdTYyNjdcdTg4NENcdUZGMENcdTRFMERcdThENzAgc2hlbGxcdUZGMDhcdTUzQzJcdTY1NzBcdTVCODlcdTUxNjggKyBcdTU4OUVcdTVGM0EgUEFUSCBcdTc1MUZcdTY1NDhcdUZGMDlcbiAgICAgIGxldCBzdGRvdXQgPSBleGVjRmlsZVN5bmMoY2xpUGF0aCwgZnVsbEFyZ3MsIGV4ZWNPcHRzKTtcblxuICAgICAgLy8gXHU1NkRFXHU4QkZCXHU1NDBFXHU1M0NEXHU4RjZDXHU0RTQ5XHVGRjFBXHU5OERFXHU0RTY2IG1kIFx1NjI4QSB+IFx1OEY2Q1x1NEU0OVx1NjIxMCBcXH5cbiAgICAgIHN0ZG91dCA9IHVuZXNjYXBlRmVpc2h1VGlsZGUoc3Rkb3V0KTtcblxuICAgICAgLy8gXHU4OUUzXHU1MzA1IGxhcmstY2xpIFx1NjgwN1x1NTFDNiBKU09OIFx1NTMwNVx1ODhDNVx1RkYxQXtvaywgaWRlbnRpdHksIGRhdGE6e2RvY3VtZW50Ontjb250ZW50fX19IFx1MjE5MiBcdTdFQUZcdTZCNjNcdTY1ODdcbiAgICAgIC8vIGRvY3MgK2ZldGNoIFx1OUVEOFx1OEJBNCAtLWZvcm1hdCBqc29uXHVGRjBDXHU2QjYzXHU2NTg3XHU1RDRDXHU1NzI4IGRhdGEuZG9jdW1lbnQuY29udGVudCBcdTkxQ0NcbiAgICAgIHN0ZG91dCA9IHVud3JhcExhcmtFbnZlbG9wZShzdGRvdXQpO1xuXG4gICAgICAvLyBKU09OIFx1NkEyMVx1NUYwRlx1RkYxQVx1OERGM1x1OEZDNyBcIkZvdW5kIFggbm9kZShzKVwiIFx1NTI0RFx1N0YwMFx1RkYwOFx1NTc1MVx1RkYxQW5vZGUtbGlzdCBcdThGOTNcdTUxRkFcdTU0MkJcdTY1RTVcdTVGRDdcdTg4NENcdUZGMDlcbiAgICAgIGlmIChqc29uKSB7XG4gICAgICAgIGNvbnN0IGJyYWNlSWR4ID0gc3Rkb3V0LmluZGV4T2YoJ3snKTtcbiAgICAgICAgaWYgKGJyYWNlSWR4ICE9PSAtMSkge1xuICAgICAgICAgIHN0ZG91dCA9IHN0ZG91dC5zbGljZShicmFjZUlkeCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0ZG91dC50cmltKCk7XG4gICAgfSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XG4gICAgICBsYXN0RXJyb3IgPSBlcnIgYXMgRXJyb3I7XG4gICAgICBjb25zdCBlcnJNc2cgPSAoZXJyIGFzIEVycm9yKT8ubWVzc2FnZSA/PyBTdHJpbmcoZXJyKTtcblxuICAgICAgLy8gNDI5IFx1OTY1MFx1NkQ0MVx1NjIxNlx1N0Y1MVx1N0VEQ1x1OTUxOVx1OEJFRlx1RkYxQVx1OTFDRFx1OEJENVx1RkYwOFx1NjMwN1x1NjU3MFx1OTAwMFx1OTA3Rlx1RkYwOVxuICAgICAgaWYgKFxuICAgICAgICBlcnJNc2cuaW5jbHVkZXMoJzQyOScpIHx8XG4gICAgICAgIGVyck1zZy5pbmNsdWRlcygnRVRJTUVET1VUJykgfHxcbiAgICAgICAgZXJyTXNnLmluY2x1ZGVzKCdFQ09OTlJFU0VUJykgfHxcbiAgICAgICAgZXJyTXNnLmluY2x1ZGVzKCdzb2NrZXQgaGFuZyB1cCcpXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgZGVsYXkgPSBNYXRoLm1pbigxMDAwICogTWF0aC5wb3coMiwgYXR0ZW1wdCAtIDEpLCAxMDAwMCk7XG4gICAgICAgIGNvbnNvbGUud2FybihgW3N5bmMvbGFya10gYXR0ZW1wdCAke2F0dGVtcHR9IGZhaWxlZCwgcmV0cnlpbmcgaW4gJHtkZWxheX1tczogJHtlcnJNc2d9YCk7XG4gICAgICAgIC8vIFx1NEUwRFx1NEY5RFx1OEQ1NiBzaGVsbCBcdTc2ODQgc2xlZXBcdUZGMDhBdG9taWNzLndhaXQgXHU1NDBDXHU2QjY1XHU5NjNCXHU1ODVFXHVGRjA5XG4gICAgICAgIGNvbnN0IG1zID0gZGVsYXk7XG4gICAgICAgIGNvbnN0IGJ1ZiA9IG5ldyBJbnQzMkFycmF5KG5ldyBTaGFyZWRBcnJheUJ1ZmZlcig0KSk7XG4gICAgICAgIEF0b21pY3Mud2FpdChidWYsIDAsIDAsIG1zKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTE3Nlx1NEVENlx1OTUxOVx1OEJFRlx1NzZGNFx1NjNBNVx1NjI5QlxuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdGhyb3cgbGFzdEVycm9yID8/IG5ldyBFcnJvcignbGFyay1jbGkgcnVuIGZhaWxlZCB3aXRoIHVua25vd24gZXJyb3InKTtcbn1cblxuLyoqXG4gKiBcdTg5RTNcdTUzMDUgbGFyay1jbGkgXHU2ODA3XHU1MUM2IEpTT04gXHU1MzA1XHU4OEM1XHUzMDAyXG4gKlxuICogbGFyay1jbGkgXHU3Njg0IGRvY3MgK2ZldGNoIFx1N0I0OVx1NTQ3RFx1NEVFNFx1OUVEOFx1OEJBNCBgLS1mb3JtYXQganNvbmBcdUZGMENcdThGRDRcdTU2REVcdUZGMUFcbiAqICAgeyBcIm9rXCI6IHRydWUsIFwiaWRlbnRpdHlcIjogXCIuLi5cIiwgXCJkYXRhXCI6IHsgXCJkb2N1bWVudFwiOiB7IFwiY29udGVudFwiOiBcIjxcdTc3MUZcdTVCOUVcdTZCNjNcdTY1ODc+XCIgfSB9LCAuLi4gfVxuICogXHU1NDBDXHU2QjY1XHU5NEZFXHU4REVGXHU5NzAwXHU4OTgxXHU3Njg0XHU2NjJGXHU3RUFGXHU2QjYzXHU2NTg3XHVGRjA4bWFya2Rvd24veG1sXHVGRjA5XHVGRjBDXHU0RTBEXHU2NjJGXHU2NTc0XHU0RTJBIGVudmVsb3BlXHUzMDAyXG4gKlxuICogXHU1MjI0XHU1QjlBXHVGRjFBc3Rkb3V0IFx1OTk5Nlx1NEUyQVx1OTc1RVx1N0E3QVx1NzY3RFx1NUI1N1x1N0IyNlx1NjYyRiBge2BcdUZGMENcdTRFMTRcdTg5RTNcdTY3OTBcdTU0MEVcdTU0MkIgb2sgXHU1QjU3XHU2QkI1ICsgZGF0YS5kb2N1bWVudC5jb250ZW50XHVGRjBDXG4gKiBcdTYyNERcdThCQTRcdTRFM0FcdTY2MkYgZW52ZWxvcGUgXHU1RTc2XHU4OUUzXHU1MzA1XHVGRjFCXHU1NDI2XHU1MjE5XHU1MzlGXHU2ODM3XHU4RkQ0XHU1NkRFXHVGRjA4XHU0RkREXHU3NTU5IHdpa2kgK25vZGUtbGlzdCBcdTdCNDlcdTdFQUYgSlNPTiBcdTU0Q0RcdTVFOTRcdTdFRDkganNvbiBcdTZBMjFcdTVGMEZcdTU5MDRcdTc0MDZcdUZGMDlcdTMwMDJcbiAqL1xuZnVuY3Rpb24gdW53cmFwTGFya0VudmVsb3BlKHN0ZG91dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgdHJpbW1lZCA9IHN0ZG91dC50cmltU3RhcnQoKTtcbiAgaWYgKCF0cmltbWVkLnN0YXJ0c1dpdGgoJ3snKSkgcmV0dXJuIHN0ZG91dDtcbiAgbGV0IHBhcnNlZDogdW5rbm93bjtcbiAgdHJ5IHtcbiAgICBwYXJzZWQgPSBKU09OLnBhcnNlKHRyaW1tZWQpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gc3Rkb3V0OyAvLyBcdTRFMERcdTY2MkZcdTU0MDhcdTZDRDUgSlNPTlx1RkYwQ1x1NTM5Rlx1NjgzN1x1OEZENFx1NTZERVxuICB9XG4gIGNvbnN0IGVudiA9IHBhcnNlZCBhcyB7IG9rPzogdW5rbm93bjsgZGF0YT86IHsgZG9jdW1lbnQ/OiB7IGNvbnRlbnQ/OiB1bmtub3duIH0gfSB9O1xuICAvLyBcdTRFQzVcdTVGNTNcdTY2MkZcdTU0MkIgZG9jdW1lbnQuY29udGVudCBcdTc2ODRcdTY4MDdcdTUxQzYgZW52ZWxvcGUgXHU2MjREXHU4OUUzXHU1MzA1XG4gIGlmIChlbnYgJiYgdHlwZW9mIGVudi5vayA9PT0gJ2Jvb2xlYW4nICYmIGVudi5kYXRhPy5kb2N1bWVudD8uY29udGVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgY29udGVudCA9IGVudi5kYXRhLmRvY3VtZW50LmNvbnRlbnQ7XG4gICAgcmV0dXJuIHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJyA/IGNvbnRlbnQgOiBKU09OLnN0cmluZ2lmeShjb250ZW50KTtcbiAgfVxuICByZXR1cm4gc3Rkb3V0O1xufVxuXG4vKipcbiAqIFx1NTZERVx1NTE5OVx1OThERVx1NEU2Nlx1NjU4N1x1Njg2M1x1RkYwOG1hcmtkb3duIG92ZXJ3cml0ZSArIFx1NjgwN1x1OTg5OFx1NEZFRVx1NTkwRFx1RkYwOVx1MzAwMlxuICogXHU0RjlEXHU2MzZFXHU1REYyXHU3N0U1XHU1NzUxXHVGRjFBb3ZlcndyaXRlIFx1NTQwRVx1NjgwN1x1OTg5OFx1NTNEOCBVbnRpdGxlZCBcdTIxOTIgXHU4RkZEXHU1MkEwIHN0cl9yZXBsYWNlIFx1NEZFRSA8dGl0bGU+XHUzMDAyXG4gKlxuICogQHBhcmFtIHRva2VuIGRvY3ggb2JqX3Rva2VuIFx1NjIxNiBub2RlX3Rva2VuXG4gKiBAcGFyYW0gY29udGVudCBcdTZCNjNcdTY1ODcgbWFya2Rvd25cdUZGMDhcdTRFMERcdTU0MkIgZnJvbnRtYXR0ZXJcdUZGMDlcbiAqIEBwYXJhbSB0aXRsZSBcdTY1ODdcdTY4NjNcdTY4MDdcdTk4OThcdUZGMDhcdTVFMjYgZW1vamlcdUZGMDlcbiAqIEBwYXJhbSBjd2QgXHU1REU1XHU0RjVDXHU3NkVFXHU1RjU1XHVGRjA4XHU3NTI4XHU0RThFIEBmaWxlIFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gb3ZlcndyaXRlRG9jKHRva2VuOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZywgdGl0bGU6IHN0cmluZywgY3dkPzogc3RyaW5nKTogdm9pZCB7XG4gIC8vIFx1NTE5OVx1NEUzNFx1NjVGNlx1NjU4N1x1NEVGNlx1RkYwOG92ZXJ3cml0ZSBcdTk3MDBcdTg5ODFcdTc1MjggQGZpbGVcdUZGMDlcbiAgY29uc3QgdG1wRGlyID0gY3dkIHx8IHByb2Nlc3MuY3dkKCk7XG4gIGNvbnN0IHRtcEZpbGUgPSBwYXRoLmpvaW4odG1wRGlyLCAnLi8uZmVpc2h1LXN5bmMtdGVtcC5tZCcpO1xuXG4gIC8vIFx1NkUwNVx1NkQxN1x1RkYxQXN0cmlwIGVtb2ppIFZTICsgXHU1M0NEXHU4RjZDXHU0RTQ5IFxcflxuICBjb25zdCBjbGVhbmVkID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMoY29udGVudCk7XG5cbiAgZnMud3JpdGVGaWxlU3luYyh0bXBGaWxlLCBjbGVhbmVkLCAndXRmOCcpO1xuXG4gIHRyeSB7XG4gICAgLy8gb3ZlcndyaXRlXG4gICAgcnVuKFsnZG9jcycsICcrdXBkYXRlJywgJy0tZG9jJywgdG9rZW4sICctLWNvbW1hbmQnLCAnb3ZlcndyaXRlJywgJy0tZG9jLWZvcm1hdCcsICdtYXJrZG93bicsICctLWNvbnRlbnQnLCBgQC4vLmZlaXNodS1zeW5jLXRlbXAubWRgXSwgeyBjd2Q6IHRtcERpciB9KTtcblxuICAgIC8vIFx1NjgwN1x1OTg5OFx1NEZFRVx1NTkwRFx1RkYxQXN0cl9yZXBsYWNlIFx1NEZFRSA8dGl0bGU+XG4gICAgY29uc3QgY2xlYW5UaXRsZSA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKHRpdGxlKTtcbiAgICBydW4oW1xuICAgICAgJ2RvY3MnLCAnK3VwZGF0ZScsICctLWRvYycsIHRva2VuLFxuICAgICAgJy0tY29tbWFuZCcsICdzdHJfcmVwbGFjZScsXG4gICAgICAnLS1kb2MtZm9ybWF0JywgJ2pzb24nLFxuICAgICAgJy0tY29udGVudCcsIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgcmVxdWVzdDogW3tcbiAgICAgICAgICBibG9ja190eXBlOiAxLCAvLyBwYWdlXG4gICAgICAgICAgcGFnZToge1xuICAgICAgICAgICAgZWxlbWVudHM6IFt7XG4gICAgICAgICAgICAgIHRleHRfcnVuOiB7IGNvbnRlbnQ6IGNsZWFuVGl0bGUsIHRleHRfZWxlbWVudF9zdHlsZTogeyBib2xkOiB0cnVlIH0gfVxuICAgICAgICAgICAgfV1cbiAgICAgICAgICB9XG4gICAgICAgIH1dLFxuICAgICAgICBpbmRleDogMCxcbiAgICAgIH0pLFxuICAgIF0sIHsgY3dkOiB0bXBEaXIsIHRpbWVvdXQ6IDE1MDAwIH0pO1xuICB9IGZpbmFsbHkge1xuICAgIC8vIFx1NkUwNVx1NzQwNlx1NEUzNFx1NjVGNlx1NjU4N1x1NEVGNlxuICAgIHRyeSB7IGZzLnVubGlua1N5bmModG1wRmlsZSk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxuICB9XG59XG5cbi8qKlxuICogXHU1NkRFXHU1MTk5XHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzXHVGRjA4WE1MIFx1NjgzQ1x1NUYwRlx1RkYwQ1x1NTQyQiBjYWxsb3V0IFx1N0NCRVx1Nzg2RVx1NjNBN1x1NTIzNlx1RkYwOVx1MzAwMlxuICogXHU1NDBDXHU2ODM3XHU5NzAwXHU4OTgxXHU2ODA3XHU5ODk4XHU0RkVFXHU1OTBEXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvdmVyd3JpdGVEb2NYbWwodG9rZW46IHN0cmluZywgeG1sQ29udGVudDogc3RyaW5nLCB0aXRsZTogc3RyaW5nLCBjd2Q/OiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgdG1wRGlyID0gY3dkIHx8IHByb2Nlc3MuY3dkKCk7XG4gIGNvbnN0IHRtcEZpbGUgPSBwYXRoLmpvaW4odG1wRGlyLCAnLi8uZmVpc2h1LXN5bmMtdGVtcC54bWwnKTtcblxuICBjb25zdCBjbGVhbmVkID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMoeG1sQ29udGVudCk7XG4gIGZzLndyaXRlRmlsZVN5bmModG1wRmlsZSwgY2xlYW5lZCwgJ3V0ZjgnKTtcblxuICB0cnkge1xuICAgIHJ1bihbJ2RvY3MnLCAnK3VwZGF0ZScsICctLWRvYycsIHRva2VuLCAnLS1jb21tYW5kJywgJ292ZXJ3cml0ZScsICctLWRvYy1mb3JtYXQnLCAneG1sJywgJy0tY29udGVudCcsIGBALi8uZmVpc2h1LXN5bmMtdGVtcC54bWxgXSwgeyBjd2Q6IHRtcERpciB9KTtcblxuICAgIC8vIFx1NjgwN1x1OTg5OFx1NEZFRVx1NTkwRFxuICAgIGNvbnN0IGNsZWFuVGl0bGUgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyh0aXRsZSk7XG4gICAgcnVuKFtcbiAgICAgICdkb2NzJywgJyt1cGRhdGUnLCAnLS1kb2MnLCB0b2tlbixcbiAgICAgICctLWNvbW1hbmQnLCAnc3RyX3JlcGxhY2UnLFxuICAgICAgJy0tZG9jLWZvcm1hdCcsICdqc29uJyxcbiAgICAgICctLWNvbnRlbnQnLCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHJlcXVlc3Q6IFt7XG4gICAgICAgICAgYmxvY2tfdHlwZTogMSxcbiAgICAgICAgICBwYWdlOiB7XG4gICAgICAgICAgICBlbGVtZW50czogW3tcbiAgICAgICAgICAgICAgdGV4dF9ydW46IHsgY29udGVudDogY2xlYW5UaXRsZSwgdGV4dF9lbGVtZW50X3N0eWxlOiB7IGJvbGQ6IHRydWUgfSB9XG4gICAgICAgICAgICB9XVxuICAgICAgICAgIH1cbiAgICAgICAgfV0sXG4gICAgICAgIGluZGV4OiAwLFxuICAgICAgfSksXG4gICAgXSwgeyBjd2Q6IHRtcERpciwgdGltZW91dDogMTUwMDAgfSk7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHsgZnMudW5saW5rU3luYyh0bXBGaWxlKTsgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG4gIH1cbn1cblxuLyoqXG4gKiBcdTRFQ0VcdTk4REVcdTRFNjYgd2lraSBVUkwgXHU4OUUzXHU2NzkwIG5vZGVfdG9rZW5cdTMwMDJcbiAqIFVSTCBcdTVGNjJcdTU5ODJcdUZGMUFodHRwczovL3h4eC5mZWlzaHUuY24vd2lraS9OT0RFX1RPS0VOXHUzMDAxL2RvY3gvT0JKX1RPS0VOIFx1NjIxNiAvZG9jL09CSl9UT0tFTlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZU5vZGVUb2tlbkZyb21VcmwodXJsOiBzdHJpbmcpOiB7IG5vZGVfdG9rZW4/OiBzdHJpbmc7IG9ial90b2tlbj86IHN0cmluZyB9IHtcbiAgLy8gd2lraSBub2RlXG4gIGNvbnN0IHdpa2lNYXRjaCA9IHVybC5tYXRjaCgvXFwvd2lraVxcLyhbQS1aYS16MC05XSspLyk7XG4gIGlmICh3aWtpTWF0Y2gpIHJldHVybiB7IG5vZGVfdG9rZW46IHdpa2lNYXRjaFsxXSB9O1xuXG4gIC8vIGRvY3ggb2JqXG4gIGNvbnN0IGRvY3hNYXRjaCA9IHVybC5tYXRjaCgvXFwvZG9jeFxcLyhbQS1aYS16MC05XSspLyk7XG4gIGlmIChkb2N4TWF0Y2gpIHJldHVybiB7IG9ial90b2tlbjogZG9jeE1hdGNoWzFdIH07XG5cbiAgcmV0dXJuIHt9O1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENiB3aWtpIFx1ODI4Mlx1NzBCOVx1NzY4NCBkb2N4IG9ial90b2tlblx1MzAwMlxuICogYHdpa2kgK25vZGUtZ2V0IC0tbm9kZS10b2tlbiA8dXJsPiAtLXNwYWNlLWlkIDxpZD5gXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRXaWtpTm9kZUluZm8obm9kZVRva2VuOiBzdHJpbmcsIHNwYWNlSWQ6IHN0cmluZyk6IHsgb2JqX3Rva2VuOiBzdHJpbmc7IHRpdGxlOiBzdHJpbmcgfSB8IG51bGwge1xuICB0cnkge1xuICAgIGNvbnN0IG91dHB1dCA9IHJ1bihbXG4gICAgICAnd2lraScsICcrbm9kZS1nZXQnLFxuICAgICAgJy0tbm9kZS10b2tlbicsIG5vZGVUb2tlbixcbiAgICAgICctLXNwYWNlLWlkJywgc3BhY2VJZCxcbiAgICBdLCB7IGpzb246IHRydWUgfSk7XG4gICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2Uob3V0cHV0KTtcbiAgICAvLyBcdTgyODJcdTcwQjlcdTUzRUZcdTgwRkRcdTY3MDkgbm9kZSBcdTYyMTZcdTc2RjRcdTYzQTVcdTY2MkYgb2JqX3Rva2VuXG4gICAgY29uc3Qgb2JqVG9rZW4gPSBkYXRhPy5ub2RlPy5vYmpfdG9rZW4gPz8gZGF0YT8ub2JqX3Rva2VuID8/IGRhdGE/Lm9ial90b2tlbjtcbiAgICBjb25zdCB0aXRsZSA9IGRhdGE/Lm5vZGU/LnRpdGxlID8/IGRhdGE/LnRpdGxlID8/ICcnO1xuICAgIGlmIChvYmpUb2tlbikgcmV0dXJuIHsgb2JqX3Rva2VuOiBvYmpUb2tlbiwgdGl0bGUgfTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS53YXJuKCdbc3luYy9sYXJrXSB3aWtpICtub2RlLWdldCBmYWlsZWQ6JywgZXJyKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1OThERVx1NEU2Nlx1NzdFNVx1OEJDNlx1NUU5M1x1NUI1MFx1ODI4Mlx1NzBCOVx1NTIxN1x1ODg2OFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGlzdFdpa2lDaGlsZHJlbihzcGFjZUlkOiBzdHJpbmcsIHBhcmVudFRva2VuOiBzdHJpbmcpOiBBcnJheTx7IG5vZGVfdG9rZW46IHN0cmluZzsgdGl0bGU6IHN0cmluZzsgb2JqX3Rva2VuOiBzdHJpbmcgfT4ge1xuICB0cnkge1xuICAgIGNvbnN0IG91dHB1dCA9IHJ1bihbXG4gICAgICAnd2lraScsICcrbm9kZS1saXN0JyxcbiAgICAgICctLXNwYWNlLWlkJywgc3BhY2VJZCxcbiAgICAgICctLXBhcmVudC1ub2RlLXRva2VuJywgcGFyZW50VG9rZW4sXG4gICAgXSwgeyBqc29uOiB0cnVlIH0pO1xuICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKG91dHB1dCk7XG4gICAgY29uc3QgaXRlbXMgPSBkYXRhPy5pdGVtcyA/PyBkYXRhPy5ub2RlcyA/PyBbXTtcbiAgICByZXR1cm4gaXRlbXMubWFwKChuOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gKHtcbiAgICAgIG5vZGVfdG9rZW46IG4ubm9kZV90b2tlbiA/PyAnJyxcbiAgICAgIHRpdGxlOiBuLnRpdGxlID8/ICcnLFxuICAgICAgb2JqX3Rva2VuOiBuLm9ial90b2tlbiA/PyAnJyxcbiAgICB9KSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUud2FybignW3N5bmMvbGFya10gd2lraSArbm9kZS1saXN0IGZhaWxlZDonLCBlcnIpO1xuICAgIHJldHVybiBbXTtcbiAgfVxufVxuIiwgIi8qKlxuICogXHU1NDBDXHU2QjY1XHU3RUQxXHU1QjlBICsgWUFNTCBmcm9udG1hdHRlciBcdTY1NzBcdTYzNkVcdTZBMjFcdTU3OEJcdTMwMDJcbiAqXG4gKiBcdTRGOURcdTYzNkVcdUZGMUFgXHU4QkJFXHU4QkExXHU2NUI5XHU2ODQ4LzAyX1lBTUxcdTVCNTdcdTZCQjVcdTg5QzRcdTgzMDMubWRgXHVGRjA4XHU2NzQzXHU1QTAxIHYxXHVGRjA5KyBgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTc1LjFcdTMwMDJcbiAqIFx1OTRDMVx1NUY4Qlx1RkYxQVx1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QVx1N0VDNFx1RkYwOGZlaXNodV8qXHVGRjA5XHU3NTMxXHU2M0QyXHU0RUY2XHU4MUVBXHU1MkE4XHU1MTk5XHVGRjBDXHU3NTI4XHU2MjM3XHU0RTBEXHU1M0VGXHU2MjRCXHU2NTM5XHUzMDAyXG4gKi9cblxuLyoqIFx1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QVx1N0VDNFx1RkYwOFx1NjgzOFx1NUZDM1x1RkYwQ1x1NEUwRFx1NTNFRlx1NjI0Qlx1NjUzOVx1RkYwOVx1MzAwMlx1NUJGOVx1NUU5NCBZQU1MIFx1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QVx1NkJCNVx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBTeW5jQmluZGluZyB7XG4gIC8qKiBcdTk4REVcdTRFNjYgd2lraSBub2RlX3Rva2VuXHVGRjA4XHU1NTJGXHU0RTAwXHU3RUQxXHU1QjlBXHVGRjA5XHUzMDAyICovXG4gIGZlaXNodV9pZDogc3RyaW5nO1xuICAvKiogXHU5OERFXHU0RTY2IGRvY3ggb2JqX3Rva2VuXHVGRjA4XHU1NkRFXHU1MTk5XHU3NTI4XHVGRjA5XHUzMDAyICovXG4gIGZlaXNodV9kb2NfaWQ6IHN0cmluZztcbiAgLyoqIFx1OThERVx1NEU2Nlx1NTM5Rlx1NTlDQlx1NjgwN1x1OTg5OFx1RkYwOFx1NTQyQiBlbW9qaVx1RkYwQ1x1NTZERVx1NTE5OVx1NjVGNlx1NzUyOFx1RkYwOVx1MzAwMiAqL1xuICBmZWlzaHVfdGl0bGU6IHN0cmluZztcbiAgLyoqIFx1NEUwQVx1NkIyMVx1NTQwQ1x1NkI2NVx1NTE4NVx1NUJCOSBoYXNoXHVGRjA4XHU4RjdCXHU2ODM4XHU5QThDXHU3NTI4XHVGRjBDc2hhMjU2IGhleFx1RkYwOVx1MzAwMiAqL1xuICBzeW5jX2hhc2g/OiBzdHJpbmc7XG4gIC8qKiBcdTRFMEFcdTZCMjFcdTU0MENcdTZCNjVcdTY1RjZcdTk1RjRcdUZGMDhJU084NjAxXHVGRjBDXHU1RTI2XHU2NUY2XHU1MzNBXHVGRjA5XHUzMDAyICovXG4gIHN5bmNfdGltZT86IHN0cmluZztcbn1cblxuLyoqIFx1NjgwN1x1N0I3RVx1NUMwMVx1OTVFRFx1Njc5QVx1NEUzRVx1MzAwMlx1NEY5RFx1NjM2RSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3Mi4yXHUzMDAyICovXG5leHBvcnQgdHlwZSBUYWcgPSAnUycgfCAnWCcgfCAnTCcgfCAnWicgfCAnUScgfCAnSic7XG5cbmV4cG9ydCBjb25zdCBUQUdfTkFNRVM6IFJlY29yZDxUYWcsIHN0cmluZz4gPSB7XG4gIFM6ICdcdUQ4M0RcdURDRTVcdTY1MzZcdTk2QzYnLFxuICBYOiAnXHVEODNDXHVERkFGXHU5ODc5XHU3NkVFJyxcbiAgTDogJ1x1RDgzQ1x1REYzM1x1OTg4Nlx1NTdERicsXG4gIFo6ICdcdUQ4M0RcdURDREFcdThENDRcdTZFOTAnLFxuICBROiAnXHVEODNEXHVEQ0ExXHU3MDc1XHU2MTFGJyxcbiAgSjogJ1x1RDgzRFx1REVFMFx1RkUwRlx1NjI4MFx1ODBGRCcsXG59O1xuXG4vKiogXHU3N0U1XHU4QkM2XHU1RTkzXHU1MTQzXHU2NTcwXHU2MzZFXHVGRjA4T0IgXHU3RUY0XHU2MkE0XHVGRjBDXHU1NkRFXHU1MTk5XHU5OERFXHU0RTY2XHU2MjEwIGNhbGxvdXRcdUZGMDlcdTMwMDJcdTRGOURcdTYzNkUgYDAyX1lBTUxcdTVCNTdcdTZCQjVcdTg5QzRcdTgzMDMubWRgXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIEtub3dsZWRnZU1ldGEge1xuICAvKiogXHU2ODA3XHU3QjdFXHVGRjBDXHU1QzAxXHU5NUVEXHU2NzlBXHU0RTNFXHUzMDAyXHU3RjZFXHU0RkUxXHU1RUE2IDwwLjYgXHUyMTkyIFNcdTMwMDIgKi9cbiAgXHU2ODA3XHU3QjdFPzogVGFnO1xuICAvKiogXHU3RjE2XHU3ODAxXHVGRjBDYXV0by1yZW5hbWUgXHU1MjA2XHU5MTREXHVGRjBDXHU2ODNDXHU1RjBGIFlZX01NRERfXHU2ODA3XHU3QjdFX1x1NUU4Rlx1NTNGN1tfXHU1QjUwXHU1RThGXHU1M0Y3XVx1MzAwMiAqL1xuICBcdTdGMTZcdTc4MDE/OiBzdHJpbmc7XG4gIC8qKiBcdThGOTNcdTUxNjVcdTVCOENcdTY1NzRcdThERUZcdTVGODRcdUZGMDhcdTY3MDBcdTZERjFcdTZDRThcdTUxOENcdThERUZcdTVGODRcdUZGMDlcdTMwMDIgKi9cbiAgXHU4RjkzXHU1MTY1Pzogc3RyaW5nO1xuICAvKiogXHU2NUU1XHU2NzFGXHVGRjBDSVNPIFx1NjgzQ1x1NUYwRiBZWVlZLU1NLUREXHUzMDAyICovXG4gIFx1NjVFNVx1NjcxRj86IHN0cmluZztcbiAgLyoqIFx1NjVFNVx1NjcxRlx1N0QyMlx1NUYxNVx1RkYwQ1x1NTNFRlx1OTAwOVx1OTg3OVx1NjU3MFx1N0VDNFx1MzAwMiAqL1xuICBcdTY1RTVcdTY3MUZcdTdEMjJcdTVGMTU/OiBzdHJpbmdbXTtcbiAgLyoqIFx1NTE3M1x1OTUyRVx1OEJDRFx1RkYwQ1x1OTg3Rlx1NTNGN1x1NTIwNlx1OTY5NFx1MzAwMiAqL1xuICBcdTUxNzNcdTk1MkVcdThCQ0Q/OiBzdHJpbmc7XG4gIC8qKiBcdTY5ODJcdThGRjBcdUZGMENcdTdFRDlcdTU0MEVcdTdFRUQgQUkgXHU1RkVCXHU5MDFGXHU4QkM2XHU1MjJCXHU2NTg3XHU2ODYzXHU1MTg1XHU1QkI5XHU3NTI4XHUzMDAyICovXG4gIFx1Njk4Mlx1OEZGMD86IHN0cmluZztcbiAgLyoqIFx1OEJDNFx1NTIwNiAxLTVcdUZGMUJcdTY3MkFcdThCQzRcdTUyMDZcdTY1RjZcdTRGRERcdTc1NTlcdTdBN0FcdTUwM0NcdTRFRTVcdTY2M0VcdTVGMEZcdTUzNjBcdTRGNERcdTMwMDIgKi9cbiAgXHU4QkM0XHU1MjA2PzogbnVtYmVyIHwgJyc7XG4gIC8qKiBcdThCQzRcdTUyMDZcdTY2M0VcdTc5M0FcdTRFMzJcdUZGMENcdTU5ODIgXCJcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdUZGNUNcdTVCOUVcdThERjVcIlx1MzAwMiAqL1xuICBcdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBPzogc3RyaW5nO1xuICAvKiogXHU3RDIyXHU1RjE1X1x1NzdFNVx1OEJDNlx1NUU5M1x1RkYwOFx1NkI2M1x1OEQyMi9cdTUwNEZcdThEMjIvLi4uXHVGRjA5XHUzMDAyICovXG4gIFx1N0QyMlx1NUYxNV9cdTc3RTVcdThCQzZcdTVFOTM/OiBzdHJpbmc7XG4gIC8qKiBcdTdEMjJcdTVGMTVfXHU5ODlDXHU4MjcyXHUzMDAyICovXG4gIFx1N0QyMlx1NUYxNV9cdTk4OUNcdTgyNzI/OiBzdHJpbmc7XG4gIC8qKiBcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OFx1RkYwQ1x1NEUyNFx1N0VDNFx1OTAwOVx1NEUwMFx1RkYwOFx1NjBGM1x1NkNENS9cdTg5QzRcdTUyMTIvXHU2MjY3XHU4ODRDL1x1NTNEN1x1NjMyQi9cdTUxNEJcdTY3MEQgXHUwMEQ3IFx1NTIxRFx1N0EzRi9cdTVCQTFcdTY4MzgvXHU0RkVFXHU2NTM5L1x1NUI4Q1x1NjIxMC9cdTU5MERcdTc2RDhcdUZGMDlcdTMwMDIgKi9cbiAgJ1x1N0QyMlx1NUYxNV9cdTY0Q0RcdTRGNUMmXHU1M0NEXHU5OTg4Jz86IHN0cmluZ1tdO1xuICAvKiogXHU3RDIyXHU1RjE1X1x1NTc1N1x1RkYwQ1x1NTkxQVx1OTAwOVx1RkYwOFx1NTE3N1x1OEM2MS9cdTYyQkRcdThDNjEgXHUwMEQ3IFx1N0I4MFx1NTM1NS9cdTU2RjBcdTk2QkVcdUZGMDlcdTMwMDIgKi9cbiAgXHU3RDIyXHU1RjE1X1x1NTc1Nz86IHN0cmluZ1tdO1xuICAvKiogXHU3RDIyXHU1RjE1X1x1OThDRVx1OTY2OVx1RkYwQ1x1OTZGNlx1NjIxNlx1NTkxQVx1NEUyQVx1MzAwMiAqL1xuICBcdTdEMjJcdTVGMTVfXHU5OENFXHU5NjY5Pzogc3RyaW5nW107XG59XG5cbi8qKiBPQiBcdTY1ODdcdTRFRjZcdTVCOENcdTY1NzQgZnJvbnRtYXR0ZXIgPSBcdTU0MENcdTZCNjVcdTdFRDFcdTVCOUEgKyBcdTc3RTVcdThCQzZcdTVFOTNcdTUxNDNcdTY1NzBcdTYzNkVcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgWUFNTEZyb250bWF0dGVyIGV4dGVuZHMgU3luY0JpbmRpbmcsIEtub3dsZWRnZU1ldGEsIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHt9XG5cbi8qKiBPQlx1MjE5Mlx1OThERVx1NEU2NiBjYWxsb3V0IFx1NUI1N1x1NkJCNVx1NjYyMFx1NUMwNFx1OTg3OVx1MzAwMlx1NEY5RFx1NjM2RSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU0RTk0XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIENhbGxvdXRGaWVsZE1hcCB7XG4gIC8qKiBZQU1MIFx1NUI1N1x1NkJCNVx1NTQwRFx1MzAwMiAqL1xuICBmaWVsZDoga2V5b2YgS25vd2xlZGdlTWV0YTtcbiAgLyoqIGNhbGxvdXQgXHU5MUNDXHU2NjNFXHU3OTNBXHU3Njg0XHU0RTJEXHU2NTg3XHU2ODA3XHU3QjdFXHUzMDAyICovXG4gIGxhYmVsOiBzdHJpbmc7XG4gIC8qKiBlbW9qaVx1RkYwOFx1NEUwRFx1NUUyNiB2YXJpYXRpb24gc2VsZWN0b3JcdUZGMDlcdTMwMDIgKi9cbiAgZW1vamk6IHN0cmluZztcbn1cblxuLyoqXG4gKiBZQU1MIFx1NUI1N1x1NkJCNSBcdTIxOTIgXHU5OERFXHU0RTY2IGNhbGxvdXQgXHU4ODRDXHU2NjIwXHU1QzA0XHUzMDAyXHU0RjlEXHU2MzZFIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTRFOTRcdTMwMDJcbiAqIFx1NkNFOFx1NjEwRiBlbW9qaSBcdTUxNjhcdTkwRThcdTRFMERcdTVFMjYgVStGRTBGXHVGRjA4XHU5OERFXHU0RTY2XHU0RTBEXHU4QkE0IFZTXHVGRjBDXHU4OUMxIDAzIFx1NjU4N1x1Njg2MyBcdTAwQTczLjNcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGNvbnN0IENBTExPVVRfRklFTERfTUFQOiBDYWxsb3V0RmllbGRNYXBbXSA9IFtcbiAgeyBmaWVsZDogJ1x1NjgwN1x1N0I3RScsIGxhYmVsOiAnXHU2ODA3XHU3QjdFJywgZW1vamk6ICdcdUQ4M0NcdURGRjcnIH0sXG4gIHsgZmllbGQ6ICdcdTdGMTZcdTc4MDEnLCBsYWJlbDogJ1x1N0YxNlx1NzgwMScsIGVtb2ppOiAnXHVEODNEXHVERDIyJyB9LFxuICB7IGZpZWxkOiAnXHU4RjkzXHU1MTY1JywgbGFiZWw6ICdcdThGOTNcdTUxNjUnLCBlbW9qaTogJ1x1RDgzRFx1RENFNScgfSxcbiAgeyBmaWVsZDogJ1x1NjVFNVx1NjcxRicsIGxhYmVsOiAnXHU2NUU1XHU2NzFGJywgZW1vamk6ICdcdUQ4M0RcdURDQzUnIH0sXG4gIHsgZmllbGQ6ICdcdTUxNzNcdTk1MkVcdThCQ0QnLCBsYWJlbDogJ1x1NTE3M1x1OTUyRVx1OEJDRCcsIGVtb2ppOiAnXHVEODNEXHVERDExJyB9LFxuICB7IGZpZWxkOiAnXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQScsIGxhYmVsOiAnXHU4QkM0XHU1MjA2JywgZW1vamk6ICdcdTJCNTAnIH0sXG4gIHsgZmllbGQ6ICdcdTdEMjJcdTVGMTVfXHU3N0U1XHU4QkM2XHU1RTkzJywgbGFiZWw6ICdcdTdEMjJcdTVGMTUnLCBlbW9qaTogJ1x1RDgzRFx1RENCMCcgfSxcbl07XG5cbi8qKiBPQlx1MjE5Mlx1OThERVx1NEU2NiBjYWxsb3V0IFx1NjU3NFx1NEY1M1x1OTE0RFx1ODI3Mlx1RkYwOFx1NTQwOFx1NUU3Nlx1NEZFMVx1NjA2Rlx1NTc1N1x1NzUyOFx1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IERPQ19JTkZPX0NBTExPVVQgPSB7XG4gIGVtb2ppOiAnXHVEODNEXHVEQ0NCJyxcbiAgJ2JhY2tncm91bmQtY29sb3InOiAnbGlnaHQtYmx1ZScsXG4gICdib3JkZXItY29sb3InOiAnYmx1ZScsXG59IGFzIGNvbnN0O1xuXG4vKiogXHU5OERFXHU0RTY2IGNhbGxvdXQgXHU4MENDXHU2NjZGXHU4MjcyIFx1MjE5MiBPQiBjYWxsb3V0IFx1N0M3Qlx1NTc4Qlx1MzAwMlx1NEY5RFx1NjM2RSBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTczLjFcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBGRUlTSFVfQkdfVE9fT0JfQ0FMTE9VVDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJ2xpZ2h0LXllbGxvdyc6ICd0aXAnLFxuICAnbWVkaXVtLXJlZCc6ICd3YXJuaW5nJyxcbiAgJ2xpZ2h0LWdyZWVuJzogJ3N1Y2Nlc3MnLFxuICAnbGlnaHQtYmx1ZSc6ICdpbmZvJyxcbiAgJ2xpZ2h0LXB1cnBsZSc6ICdub3RlJyxcbiAgJ2xpZ2h0LWdyYXknOiAncXVvdGUnLFxuICAnbGlnaHQtb3JhbmdlJzogJ2ZhcScsXG59O1xuXG4vKiogT0IgY2FsbG91dCBcdTdDN0JcdTU3OEIgXHUyMTkyIFx1OThERVx1NEU2NiBjYWxsb3V0IFx1OTE0RFx1ODI3Mlx1MzAwMlx1MDBBNzMuMSBcdTUzQ0RcdTU0MTFcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBPQl9DQUxMT1VUX1RPX0ZFSVNIVTogUmVjb3JkPHN0cmluZywgeyBlbW9qaTogc3RyaW5nOyBiZzogc3RyaW5nOyBib3JkZXI6IHN0cmluZyB9PiA9IHtcbiAgdGlwOiB7IGVtb2ppOiAnXHVEODNEXHVEQ0ExJywgYmc6ICdsaWdodC15ZWxsb3cnLCBib3JkZXI6ICd5ZWxsb3cnIH0sXG4gIHdhcm5pbmc6IHsgZW1vamk6ICdcdTI2QTBcdUZFMEYnLCBiZzogJ21lZGl1bS1yZWQnLCBib3JkZXI6ICdyZWQnIH0sXG4gIHN1Y2Nlc3M6IHsgZW1vamk6ICdcdTI3MDUnLCBiZzogJ2xpZ2h0LWdyZWVuJywgYm9yZGVyOiAnZ3JlZW4nIH0sXG4gIGluZm86IHsgZW1vamk6ICdcdTIxMzlcdUZFMEYnLCBiZzogJ2xpZ2h0LWJsdWUnLCBib3JkZXI6ICdibHVlJyB9LFxuICBub3RlOiB7IGVtb2ppOiAnXHVEODNEXHVEQ0REJywgYmc6ICdsaWdodC1wdXJwbGUnLCBib3JkZXI6ICdwdXJwbGUnIH0sXG4gIHF1b3RlOiB7IGVtb2ppOiAnXHVEODNEXHVEQ0FDJywgYmc6ICdsaWdodC1ncmF5JywgYm9yZGVyOiAnZ3JheScgfSxcbiAgZmFxOiB7IGVtb2ppOiAnXHUyNzUzJywgYmc6ICdsaWdodC1vcmFuZ2UnLCBib3JkZXI6ICdvcmFuZ2UnIH0sXG4gIGFic3RyYWN0OiB7IGVtb2ppOiAnXHVEODNEXHVEQ0NCJywgYmc6ICdsaWdodC1ibHVlJywgYm9yZGVyOiAnYmx1ZScgfSxcbn07XG4iLCAiaW1wb3J0IHR5cGUgeyBLbm93bGVkZ2VNZXRhIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5cbi8qKlxuICogbG9jYWxob3N0IEhUVFAgXHU1MzRGXHU4QkFFXHU1OTUxXHU3RUE2XHVGRjA4T0IgXHU2M0QyXHU0RUY2IFx1MjE5NCBcdTZENEZcdTg5QzhcdTU2NjhcdTYyNjlcdTVDNTVcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdTRGOURcdTYzNkVcdUZGMUFgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTc0LjIgKyBcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFcdUZGMDhcdTU4NkJcdTg4NjVcdTY1ODdcdTY4NjNcdTdGM0FcdTUzRTNcdUZGMDlcdTMwMDJcbiAqIFx1OTI3NFx1Njc0M1x1RkYxQVx1NkJDRlx1NEUyQVx1OEJGN1x1NkM0Mlx1NUUyNiBoZWFkZXIgYFgtU3luYy1Ub2tlbjogPFx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Qz5gXHUzMDAyXG4gKiBDT1JTXHVGRjFBT0Igc2VydmVyIFx1NUZDNVx1OTg3Qlx1NjUzRVx1OTAxQSBPUFRJT05TIFx1OTg4NFx1NjhDMFx1RkYwOFx1NjI2OVx1NUM1NVx1NEVDRVx1OThERVx1NEU2Nlx1OTg3NVx1OTc2Mlx1NTNEMVx1OEQ3NyBmZXRjaCBcdTRGMUFcdTg4QUJcdTYyRTZcdUZGMDlcdTMwMDJcbiAqL1xuXG4vKiogXHU5RUQ4XHU4QkE0XHU3QUVGXHU1M0UzXHUzMDAyXHU1M0VGXHU1NzI4IE9CIFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1OTg3NVx1NjUzOVx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUE9SVCA9IDQ1Njc7XG5cbi8qKiBcdTkyNzRcdTY3NDMgaGVhZGVyIFx1NTQwRFx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IFRPS0VOX0hFQURFUiA9ICdYLVN5bmMtVG9rZW4nO1xuXG4vKiogXHU4REU4XHU3QUVGXHU1MzRGXHU4QkFFXHU3MjQ4XHU2NzJDXHVGRjFCXHU0RTBEXHU0RTAwXHU4MUY0XHU2NUY2XHU1MTk5XHU2NENEXHU0RjVDXHU1RkM1XHU5ODdCXHU1OTMxXHU4RDI1XHU1MTczXHU5NUVEXHUzMDAyICovXG5leHBvcnQgY29uc3QgUFJPVE9DT0xfVkVSU0lPTiA9IDE7XG5cbmV4cG9ydCB0eXBlIFN5bmNDYXBhYmlsaXR5ID0gJ3N0YXR1cycgfCAndHJlZScgfCAnZmV0Y2gnIHwgJ2NsaXAnIHwgJ2V4aXN0cycgfCAncHVzaGJhY2snO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByb3RvY29sSW5mbyB7XG4gIHByb3RvY29sVmVyc2lvbjogbnVtYmVyO1xuICBjYXBhYmlsaXRpZXM6IHN0cmluZ1tdO1xuICBjb21wb25lbnRWZXJzaW9uOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvdG9jb2xDb21wYXRpYmlsaXR5IHtcbiAgY29tcGF0aWJsZTogYm9vbGVhbjtcbiAgcmVhc29uPzogc3RyaW5nO1xufVxuXG4vKiogXHU1RjUzXHU1MjREXHU2NzBEXHU1MkExXHU3QUVGXHU1QjlFXHU5NjQ1XHU2M0QwXHU0RjlCXHU3Njg0XHU4MEZEXHU1MjlCXHUzMDAyICovXG5leHBvcnQgY29uc3QgU0VSVkVSX0NBUEFCSUxJVElFUzogcmVhZG9ubHkgU3luY0NhcGFiaWxpdHlbXSA9IFtcbiAgJ3N0YXR1cycsXG4gICd0cmVlJyxcbiAgJ2ZldGNoJyxcbiAgJ2NsaXAnLFxuICAnZXhpc3RzJyxcbiAgJ3B1c2hiYWNrJyxcbl07XG5cbi8qKiBcdTVCOENcdTY1NzRcdTUxOTlcdTUxNjVcdTUzNEZcdThCQUVcdTc2ODRcdTY3MDBcdTRGNEVcdTgwRkRcdTUyOUJcdTk2QzZcdTU0MDhcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBSRVFVSVJFRF9XUklURV9DQVBBQklMSVRJRVM6IHJlYWRvbmx5IFN5bmNDYXBhYmlsaXR5W10gPSBbXG4gICdmZXRjaCcsXG4gICdjbGlwJyxcbiAgJ3B1c2hiYWNrJyxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBldmFsdWF0ZVByb3RvY29sQ29tcGF0aWJpbGl0eShcbiAgaW5mbzogUGFydGlhbDxQcm90b2NvbEluZm8+IHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgcmVxdWlyZWQ6IHJlYWRvbmx5IFN5bmNDYXBhYmlsaXR5W10gPSBSRVFVSVJFRF9XUklURV9DQVBBQklMSVRJRVMsXG4pOiBQcm90b2NvbENvbXBhdGliaWxpdHkge1xuICBpZiAoXG4gICAgIWluZm9cbiAgICB8fCB0eXBlb2YgaW5mby5wcm90b2NvbFZlcnNpb24gIT09ICdudW1iZXInXG4gICAgfHwgIUFycmF5LmlzQXJyYXkoaW5mby5jYXBhYmlsaXRpZXMpXG4gICAgfHwgdHlwZW9mIGluZm8uY29tcG9uZW50VmVyc2lvbiAhPT0gJ3N0cmluZydcbiAgKSB7XG4gICAgcmV0dXJuIHsgY29tcGF0aWJsZTogZmFsc2UsIHJlYXNvbjogJ01pc3NpbmcgcHJvdG9jb2wgbWV0YWRhdGEnIH07XG4gIH1cbiAgaWYgKGluZm8ucHJvdG9jb2xWZXJzaW9uICE9PSBQUk9UT0NPTF9WRVJTSU9OKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbXBhdGlibGU6IGZhbHNlLFxuICAgICAgcmVhc29uOiBgUHJvdG9jb2wgdmVyc2lvbiBtaXNtYXRjaDogYnJvd3Nlcj0ke1BST1RPQ09MX1ZFUlNJT059LCBvYnNpZGlhbj0ke2luZm8ucHJvdG9jb2xWZXJzaW9ufWAsXG4gICAgfTtcbiAgfVxuICBjb25zdCBjYXBhYmlsaXRpZXMgPSBuZXcgU2V0KGluZm8uY2FwYWJpbGl0aWVzKTtcbiAgY29uc3QgbWlzc2luZyA9IHJlcXVpcmVkLmZpbHRlcigoY2FwYWJpbGl0eSkgPT4gIWNhcGFiaWxpdGllcy5oYXMoY2FwYWJpbGl0eSkpO1xuICBpZiAobWlzc2luZy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbXBhdGlibGU6IGZhbHNlLFxuICAgICAgcmVhc29uOiBgTWlzc2luZyByZXF1aXJlZCBjYXBhYmlsaXRpZXM6ICR7bWlzc2luZy5qb2luKCcsICcpfWAsXG4gICAgfTtcbiAgfVxuICByZXR1cm4geyBjb21wYXRpYmxlOiB0cnVlIH07XG59XG5cbi8qKiBcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjMgVVJMIFx1ODlFM1x1Njc5MFx1N0VEM1x1Njc5Q1x1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBGZWlzaHVEb2NSZWYge1xuICAvKiogd2lraSBub2RlX3Rva2VuXHVGRjA4XHU0RjE4XHU1MTQ4XHU3NTI4XHVGRjBDXHU1NTJGXHU0RTAwXHU3RUQxXHU1QjlBXHVGRjA5XHUzMDAyICovXG4gIG5vZGVfdG9rZW4/OiBzdHJpbmc7XG4gIC8qKiBkb2N4IG9ial90b2tlblx1RkYwOFx1NTZERVx1NTE5OVx1NzUyOFx1RkYwOVx1MzAwMiAqL1xuICBvYmpfdG9rZW4/OiBzdHJpbmc7XG4gIC8qKiBzcGFjZV9pZFx1RkYwOFx1OTBFOFx1NTIwNlx1NjRDRFx1NEY1Q1x1OTcwMFx1ODk4MVx1RkYwQ1x1NTNFRlx1OTAwOVx1RkYwOVx1MzAwMiAqL1xuICBzcGFjZV9pZD86IHN0cmluZztcbn1cblxuLyoqIEdFVCAvc3RhdHVzIFx1NTRDRFx1NUU5NFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdGF0dXNSZXNwb25zZSBleHRlbmRzIFByb3RvY29sSW5mbyB7XG4gIG9rOiB0cnVlO1xuICAvKiogXHU2M0QyXHU0RUY2XHU3MjQ4XHU2NzJDXHUzMDAyICovXG4gIHZlcnNpb246IHN0cmluZztcbiAgLyoqIHZhdWx0IFx1NTQwRFx1MzAwMiAqL1xuICB2YXVsdDogc3RyaW5nO1xuICAvKiogbGFyay1jbGkgXHU2NjJGXHU1NDI2XHU1QzMxXHU3RUVBXHUzMDAyICovXG4gIGxhcmtSZWFkeTogYm9vbGVhbjtcbiAgLyoqIGxhcmstY2xpIFx1NzI0OFx1NjcyQ1x1RkYwOFx1NjNBMlx1NkQ0Qlx1NEUwRFx1NTIzMFx1NjVGNlx1NEUzQSBudWxsXHVGRjA5XHUzMDAyICovXG4gIGxhcmtWZXJzaW9uOiBzdHJpbmcgfCBudWxsO1xufVxuXG4vKiogXHU3NkVFXHU1RjU1XHU2ODExXHU4MjgyXHU3MEI5XHVGRjA4XHU3RUQ5XHU2MjY5XHU1QzU1XHU3NkVFXHU1RjU1XHU0RTBCXHU2MkM5XHU3NTI4XHVGRjA5XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFRyZWVOb2RlIHtcbiAgLyoqIFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdTc2ODRcdThERUZcdTVGODRcdUZGMENcdTU5ODIgXCIwXHVGRTBGXHUyMEUzXHU4RjkzXHU1MTY1L1x1RDgzRFx1RENBMVx1Nzg4RVx1NzI0N1x1OEY5M1x1NTE2NVx1RkYwOFx1OTVFQVx1NUZGNVx1RkYwOVwiXHUzMDAyICovXG4gIHBhdGg6IHN0cmluZztcbiAgLyoqIFx1NjYzRVx1NzkzQVx1NTQwRFx1RkYwOFx1NjcwMFx1NTQwRVx1NEUwMFx1NkJCNVx1RkYwOVx1MzAwMiAqL1xuICBsYWJlbDogc3RyaW5nO1xuICAvKiogXHU2REYxXHU1RUE2XHVGRjA4XHU2ODM5PTBcdUZGMDlcdTMwMDIgKi9cbiAgZGVwdGg6IG51bWJlcjtcbn1cblxuLyoqIEdFVCAvdHJlZSBcdTU0Q0RcdTVFOTRcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHJlZVJlc3BvbnNlIHtcbiAgb2s6IHRydWU7XG4gIGRpcnM6IFRyZWVOb2RlW107XG59XG5cbi8qKiBQT1NUIC9mZXRjaCBcdThCRjdcdTZDNDJcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmV0Y2hSZXF1ZXN0IHtcbiAgLyoqIFx1OTFDRFx1OEJENVx1NjVGNlx1NEZERFx1NjMwMVx1NEUwRFx1NTNEOFx1NzY4NFx1NUU0Mlx1N0I0OVx1OEJGN1x1NkM0MiBJRFx1MzAwMiAqL1xuICByZXF1ZXN0SWQ/OiBzdHJpbmc7XG4gIC8qKiBcdTVGQzVcdTU4NkJcdUZGMUF3aWtpIG5vZGVfdG9rZW5cdTMwMDIgKi9cbiAgbm9kZV90b2tlbjogc3RyaW5nO1xuICAvKiogXHU1M0VGXHU5MDA5XHVGRjFBZG9jeCBvYmpfdG9rZW5cdUZGMDhcdTY3MkFcdTdFRDlcdTUyMTlcdTYzRDJcdTRFRjZcdTc1Mjggd2lraSArbm9kZS1nZXQgXHU4OUUzXHU2NzkwXHVGRjA5XHUzMDAyICovXG4gIG9ial90b2tlbj86IHN0cmluZztcbiAgLyoqIFx1NTNFRlx1OTAwOVx1RkYxQXNwYWNlX2lkXHUzMDAyICovXG4gIHNwYWNlX2lkPzogc3RyaW5nO1xuICAvKiogXHU4NDNEXHU1NzMwXHU3NkVFXHU1RjU1XHVGRjA4XHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1RkYwOVx1RkYwQ1x1NjcyQVx1N0VEOVx1NzUyOFx1OEJCRVx1N0Y2RVx1OUVEOFx1OEJBNFx1NTAzQ1x1MzAwMiAqL1xuICBkaXI/OiBzdHJpbmc7XG4gIC8qKiBcdTg5ODZcdTc2RDZcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTRFMERcdTU0MkJcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDlcdUZGMENcdTY3MkFcdTdFRDlcdTc1MjhcdTk4REVcdTRFNjZcdTY4MDdcdTk4OThcdTZFMDVcdTZEMTdcdTdFRDNcdTY3OUNcdTMwMDIgKi9cbiAgZmlsZW5hbWU/OiBzdHJpbmc7XG4gIC8qKiBcdTZENEZcdTg5QzhcdTU2NjhcdTU0MENcdTZCNjVcdTUyNERcdTc4NkVcdThCQTRcdTU0MEVcdTc2ODQgWUFNTCBcdTUxNDNcdTY1NzBcdTYzNkVcdTg5ODZcdTc2RDZcdUZGMUJcdTRFQzVcdTk2NTBcdTc3RTVcdThCQzZcdTVFOTNcdTUxNDNcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVcdTMwMDIgKi9cbiAgbWV0YT86IFBhcnRpYWw8S25vd2xlZGdlTWV0YT47XG4gIC8qKiBPQiBcdTUxODVcdTkwRThcdTRGN0ZcdTc1MjhcdUZGMUFDbGlwcGVyIFx1NTM2MFx1NEY0RFx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1RkYwQ1x1NTQ3RFx1NEUyRFx1NjVGNlx1NTM5Rlx1NEY0RFx1ODk4Nlx1NzZENlx1MzAwMiAqL1xuICByZXBsYWNlX3BhdGg/OiBzdHJpbmc7XG59XG5cbi8qKiBQT1NUIC9mZXRjaCBcdTU0Q0RcdTVFOTRcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmV0Y2hSZXNwb25zZSB7XG4gIG9rOiB0cnVlO1xuICAvKiogXHU4NDNEXHU1NzMwXHU1QjhDXHU2NTc0XHU4REVGXHU1Rjg0XHVGRjA4XHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1RkYwOVx1MzAwMiAqL1xuICBwYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTU0MkJcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDlcdTMwMDIgKi9cbiAgZmlsZW5hbWU6IHN0cmluZztcbiAgLyoqIFx1NjcyQ1x1NkIyMVx1NjYyRlx1NjVCMFx1NUVGQVx1OEZEOFx1NjYyRlx1NjZGNFx1NjVCMFx1MzAwMiAqL1xuICBhY3Rpb246ICdjcmVhdGVkJyB8ICd1cGRhdGVkJztcbiAgLyoqIFx1NTIwNlx1OTE0RFx1NTIzMFx1NzY4NFx1N0YxNlx1NzgwMVx1RkYwOGF1dG8tcmVuYW1lIFx1ODlFNlx1NTNEMVx1NTQwRVx1RkYwOVx1MzAwMiAqL1xuICBcdTdGMTZcdTc4MDE/OiBzdHJpbmc7XG4gIC8qKiBcdTk4REVcdTRFNjZcdTUzOUZcdTU5Q0JcdTY4MDdcdTk4OThcdTMwMDIgKi9cbiAgZmVpc2h1X3RpdGxlOiBzdHJpbmc7XG59XG5cbi8qKiBQT1NUIC9jbGlwIFx1OEJGN1x1NkM0Mlx1RkYxQVx1NEVGQlx1NjEwRlx1N0Y1MVx1OTg3NS9cdTUyMTJcdThCQ0RcdTUyNkFcdTVCNThcdTUyMzAgT2JzaWRpYW5cdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2xpcFJlcXVlc3Qge1xuICAvKiogXHU5MUNEXHU4QkQ1XHU2NUY2XHU0RkREXHU2MzAxXHU0RTBEXHU1M0Q4XHU3Njg0XHU1RTQyXHU3QjQ5XHU4QkY3XHU2QzQyIElEXHUzMDAyICovXG4gIHJlcXVlc3RJZD86IHN0cmluZztcbiAgLyoqIFx1N0Y1MVx1OTg3NVx1NjgwN1x1OTg5OFx1MzAwMiAqL1xuICB0aXRsZT86IHN0cmluZztcbiAgLyoqIFx1Njc2NVx1NkU5MCBVUkxcdTMwMDIgKi9cbiAgdXJsPzogc3RyaW5nO1xuICAvKiogXHU2NzY1XHU2RTkwXHU3QzdCXHU1NzhCXHUzMDAyICovXG4gIHNvdXJjZUtpbmQ/OiAnZmVpc2h1LWJhc2UnIHwgJ2FydGljbGUnIHwgJ3NlbGVjdGlvbicgfCAnZ2VuZXJpYy1wYWdlJztcbiAgLyoqIFx1OTAwOVx1NEUyRFx1NjU4N1x1NjcyQ1x1NjIxNlx1NkI2M1x1NjU4N1x1NjQ1OFx1ODk4MVx1MzAwMiAqL1xuICB0ZXh0Pzogc3RyaW5nO1xuICAvKiogQUkgXHU2MjE2XHU4OUM0XHU1MjE5XHU4RjZDXHU2MzYyXHU1NDBFXHU3Njg0IE9ic2lkaWFuIE1hcmtkb3duIFx1NkI2M1x1NjU4N1x1MzAwMiAqL1xuICBib2R5TWFya2Rvd24/OiBzdHJpbmc7XG4gIC8qKiBcdTUzOUZcdTU5Q0JcdTUzRUZcdTg5QzFcdTY1ODdcdTY3MkNcdTMwMDIgKi9cbiAgcmF3VGV4dD86IHN0cmluZztcbiAgLyoqIFx1OTg3NVx1OTc2Mlx1NjNDRlx1OEZGMFx1MzAwMiAqL1xuICBkZXNjcmlwdGlvbj86IHN0cmluZztcbiAgLyoqIFx1ODQzRFx1NTczMFx1NzZFRVx1NUY1NVx1RkYwOFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdUZGMDlcdTMwMDJcdTY3MkFcdTdFRDlcdTc1MjggT0IgXHU2M0QyXHU0RUY2XHU5RUQ4XHU4QkE0XHU3NkVFXHU1RjU1XHUzMDAyICovXG4gIGRpcj86IHN0cmluZztcbiAgLyoqIFx1NTJGRVx1OTAwOVx1MjAxQ1x1ODg2NVx1NTE0NVx1NTIzMFx1NURGMlx1NjcwOVx1NjU4N1x1Njg2M1x1MjAxRFx1NjVGNlx1RkYwQ1x1OEZGRFx1NTJBMFx1NTIzMFx1OEZEOVx1NEUyQVx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdTc2ODQgTWFya2Rvd24gXHU4REVGXHU1Rjg0XHUzMDAyICovXG4gIGFwcGVuZFBhdGg/OiBzdHJpbmc7XG4gIC8qKiBcdTVERjJcdTYzMDlcdTYzRDJcdTRFRjZcdTk4ODRcdThCQkVcdTVGNTJcdTRFMDBcdTUzMTZcdTc2ODQgWUFNTCBcdTUxNDNcdTY1NzBcdTYzNkVcdTMwMDIgKi9cbiAgbWV0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG4vKiogUE9TVCAvY2xpcCBcdTU0Q0RcdTVFOTRcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2xpcFJlc3BvbnNlIHtcbiAgb2s6IHRydWU7XG4gIC8qKiBcdTg0M0RcdTU3MzBcdTVCOENcdTY1NzRcdThERUZcdTVGODRcdUZGMDhcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHVGRjA5XHUzMDAyICovXG4gIHBhdGg6IHN0cmluZztcbiAgLyoqIFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NTQyQlx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOVx1MzAwMiAqL1xuICBmaWxlbmFtZTogc3RyaW5nO1xuICAvKiogXHU2NzJDXHU2QjIxXHU2NjJGXHU2NUIwXHU1RUZBXHU4RkQ4XHU2NjJGXHU2NkY0XHU2NUIwXHUzMDAyICovXG4gIGFjdGlvbjogJ2NyZWF0ZWQnIHwgJ3VwZGF0ZWQnO1xufVxuXG4vKiogUE9TVCAvZXhpc3RzIFx1OEJGN1x1NkM0Mlx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeGlzdHNSZXF1ZXN0IHtcbiAgbm9kZV90b2tlbjogc3RyaW5nO1xufVxuXG4vKiogUE9TVCAvZXhpc3RzIFx1NTRDRFx1NUU5NFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeGlzdHNSZXNwb25zZSB7XG4gIG9rOiB0cnVlO1xuICBleGlzdHM6IGJvb2xlYW47XG4gIC8qKiBcdTVERjJcdTVCNThcdTU3MjhcdTY1RjZcdTdFRDlcdTUxRkFcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHU4REVGXHU1Rjg0XHUzMDAyICovXG4gIHBhdGg/OiBzdHJpbmc7XG59XG5cbi8qKiBQT1NUIC9wdXNoYmFjayBcdThCRjdcdTZDNDJcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVzaGJhY2tSZXF1ZXN0IHtcbiAgLyoqIFx1OTFDRFx1OEJENVx1NjVGNlx1NEZERFx1NjMwMVx1NEUwRFx1NTNEOFx1NzY4NFx1NUU0Mlx1N0I0OVx1OEJGN1x1NkM0MiBJRFx1MzAwMiAqL1xuICByZXF1ZXN0SWQ/OiBzdHJpbmc7XG4gIC8qKiBcdTRFOENcdTkwMDlcdTRFMDBcdUZGMUFcdTY3MkNcdTU3MzBcdThERUZcdTVGODRcdUZGMDhcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHVGRjA5XHUzMDAyICovXG4gIHBhdGg/OiBzdHJpbmc7XG4gIC8qKiBcdTRFOENcdTkwMDlcdTRFMDBcdUZGMUFub2RlX3Rva2VuXHVGRjA4XHU0RUNFXHU3RUQxXHU1QjlBXHU2MjdFXHU2NTg3XHU0RUY2XHVGRjA5XHUzMDAyICovXG4gIG5vZGVfdG9rZW4/OiBzdHJpbmc7XG4gIC8qKiBcdTVGM0FcdTUyMzZcdTU2REVcdTUxOTlcdUZGMDhcdTVGRkRcdTc1NjUgaGFzaCBcdTRFMDBcdTgxRjRcdThERjNcdThGQzdcdUZGMDlcdTMwMDIgKi9cbiAgZm9yY2U/OiBib29sZWFuO1xufVxuXG4vKiogUE9TVCAvcHVzaGJhY2sgXHU1NENEXHU1RTk0XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFB1c2hiYWNrUmVzcG9uc2Uge1xuICBvazogdHJ1ZTtcbiAgLyoqIFx1NUI5RVx1OTY0NVx1NTZERVx1NTE5OVx1OEZEOFx1NjYyRlx1OERGM1x1OEZDN1x1RkYwOGhhc2ggXHU0RTAwXHU4MUY0XHVGRjA5XHUzMDAyICovXG4gIGFjdGlvbjogJ3B1c2hlZCcgfCAnc2tpcHBlZCc7XG4gIC8qKiBcdTY1QjBcdTc2ODQgc3luY19oYXNoXHUzMDAyICovXG4gIGhhc2g/OiBzdHJpbmc7XG4gIC8qKiBcdTU2REVcdTUxOTlcdTc2ODRcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjNcdTY4MDdcdTk4OThcdTMwMDIgKi9cbiAgdGl0bGU/OiBzdHJpbmc7XG59XG5cbi8qKiBcdTdFREZcdTRFMDBcdTk1MTlcdThCRUZcdTU0Q0RcdTVFOTRcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXJyb3JSZXNwb25zZSB7XG4gIG9rOiBmYWxzZTtcbiAgLyoqIFx1NjczQVx1NTY2OFx1NTNFRlx1OEJGQlx1OTUxOVx1OEJFRlx1NzgwMVx1MzAwMiAqL1xuICBjb2RlOiBzdHJpbmc7XG4gIC8qKiBcdTRFQkFcdTdDN0JcdTUzRUZcdThCRkJcdTZEODhcdTYwNkZcdTMwMDIgKi9cbiAgbWVzc2FnZTogc3RyaW5nO1xufVxuXG4vKiogXHU2MjQwXHU2NzA5XHU3QUVGXHU3MEI5XHU1QjlBXHU0RTQ5XHVGRjA4XHU4REVGXHU1Rjg0ICsgXHU2NUI5XHU2Q0Q1XHVGRjA5XHVGRjBDXHU0RjlCXHU0RTI0XHU3QUVGXHU1RjE1XHU3NTI4XHU5MDdGXHU1MTREXHU2MkZDXHU1MTk5XHU2RjAyXHU3OUZCXHUzMDAyICovXG5leHBvcnQgY29uc3QgRU5EUE9JTlRTID0ge1xuICBzdGF0dXM6ICcvc3RhdHVzJyxcbiAgdHJlZTogJy90cmVlJyxcbiAgZmV0Y2g6ICcvZmV0Y2gnLFxuICBjbGlwOiAnL2NsaXAnLFxuICBleGlzdHM6ICcvZXhpc3RzJyxcbiAgcHVzaGJhY2s6ICcvcHVzaGJhY2snLFxufSBhcyBjb25zdDtcblxuLyoqIE9ic2lkaWFuIFx1N0NGQlx1N0VERlx1NTM0Rlx1OEJBRVx1RkYxQVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NEUzQlx1OTAxQVx1OTA1M1x1NTJBOFx1NEY1Q1x1NTQwRFx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IE9CU0lESUFOX0xBUktfRE9DX0FDVElPTiA9ICdsYXJrLWRvYyc7XG5cbi8qKiBPYnNpZGlhbiBcdTdDRkJcdTdFREZcdTUzNEZcdThCQUVcdUZGMUFcdTZENEZcdTg5QzhcdTU2NjhcdTRFM0JcdTkwMUFcdTkwNTMgVVJJIFx1NTI0RFx1N0YwMFx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IE9CU0lESUFOX0xBUktfRE9DX1VSSV9QUkVGSVggPSBgb2JzaWRpYW46Ly8ke09CU0lESUFOX0xBUktfRE9DX0FDVElPTn1gO1xuXG4vKiogb2JzaWRpYW46Ly9sYXJrLWRvYyBcdTUzQzJcdTY1NzBcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgT2JzaWRpYW5MYXJrRG9jUGFyYW1zIHtcbiAgLyoqIHYzIFx1NEUzQlx1OTAxQVx1OTA1M1x1NTE3Q1x1NUJCOVx1NUI1N1x1NkJCNVx1RkYwQ1x1NEYxOFx1NTE0OFx1NEYyMCB3aWtpIG5vZGVfdG9rZW5cdTMwMDIgKi9cbiAgdG9rZW4/OiBzdHJpbmc7XG4gIC8qKiB3aWtpIG5vZGVfdG9rZW5cdTMwMDIgKi9cbiAgbm9kZV90b2tlbj86IHN0cmluZztcbiAgLyoqIGRvY3ggb2JqX3Rva2VuXHUzMDAyICovXG4gIG9ial90b2tlbj86IHN0cmluZztcbiAgLyoqIFx1OThERVx1NEU2Nlx1NzdFNVx1OEJDNlx1NUU5MyBzcGFjZV9pZFx1MzAwMiAqL1xuICBzcGFjZV9pZD86IHN0cmluZztcbiAgLyoqIFx1OTg3NVx1OTc2Mlx1NjgwN1x1OTg5OFx1MzAwMiAqL1xuICB0aXRsZT86IHN0cmluZztcbiAgLyoqIFx1NTM5Rlx1NTlDQlx1OThERVx1NEU2NiBVUkxcdTMwMDIgKi9cbiAgdXJsPzogc3RyaW5nO1xuICAvKiogXHU1M0VGXHU5MDA5XHU3NkVFXHU2ODA3XHU3NkVFXHU1RjU1XHVGRjFCXHU0RTNBXHU3QTdBXHU2NUY2XHU3NTMxIE9CIFx1N0FFRlx1OTAwOVx1NjJFOVx1NjIxNlx1NEY3Rlx1NzUyOFx1OUVEOFx1OEJBNFx1NzZFRVx1NUY1NVx1MzAwMiAqL1xuICBkaXI/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogXHU2Nzg0XHU5MDIwIGBvYnNpZGlhbjovL2xhcmstZG9jYCBVUklcdTMwMDJcbiAqXG4gKiBQb255dGFpbDogXHU3NTI4XHU2RDRGXHU4OUM4XHU1NjY4XHU1NDhDXHU3Q0ZCXHU3RURGXHU1REYyXHU2NzA5XHU3Njg0XHU4MUVBXHU1QjlBXHU0RTQ5XHU1MzRGXHU4QkFFXHU4MEZEXHU1MjlCXHU2MjdGXHU4RjdEXHU0RTNCXHU5MDFBXHU5MDUzXHVGRjBDXG4gKiBcdTRFMERcdTUxOERcdTRFM0FcdTIwMUNcdTcwQjlcdTUxRkJcdTk4REVcdTRFNjZcdTYzMDlcdTk0QUVcdTIwMURcdTk4OURcdTU5MTZcdTUzRDFcdTY2MEVcdTRFMDBcdTU5NTdcdTU0MEVcdTUzRjBcdTZEODhcdTYwNkZcdTUzNEZcdThCQUVcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkT2JzaWRpYW5MYXJrRG9jVXJpKHBhcmFtczogT2JzaWRpYW5MYXJrRG9jUGFyYW1zKTogc3RyaW5nIHtcbiAgY29uc3QgdG9rZW4gPSBwYXJhbXMudG9rZW4gfHwgcGFyYW1zLm5vZGVfdG9rZW4gfHwgcGFyYW1zLm9ial90b2tlbjtcbiAgY29uc3QgcXVlcnk6IEFycmF5PFtzdHJpbmcsIHN0cmluZyB8IHVuZGVmaW5lZF0+ID0gW1xuICAgIFsndG9rZW4nLCB0b2tlbl0sXG4gICAgWydub2RlX3Rva2VuJywgcGFyYW1zLm5vZGVfdG9rZW5dLFxuICAgIFsnb2JqX3Rva2VuJywgcGFyYW1zLm9ial90b2tlbl0sXG4gICAgWydzcGFjZV9pZCcsIHBhcmFtcy5zcGFjZV9pZF0sXG4gICAgWyd0aXRsZScsIHBhcmFtcy50aXRsZV0sXG4gICAgWyd1cmwnLCBwYXJhbXMudXJsXSxcbiAgICBbJ2RpcicsIHBhcmFtcy5kaXJdLFxuICBdO1xuICBjb25zdCBlbmNvZGVkID0gcXVlcnlcbiAgICAuZmlsdGVyKChbLCB2YWx1ZV0pID0+IHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09ICcnKVxuICAgIC5tYXAoKFtrZXksIHZhbHVlXSkgPT4gYCR7ZW5jb2RlVVJJQ29tcG9uZW50KGtleSl9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyh2YWx1ZSkpfWApXG4gICAgLmpvaW4oJyYnKTtcbiAgcmV0dXJuIGVuY29kZWQgPyBgJHtPQlNJRElBTl9MQVJLX0RPQ19VUklfUFJFRklYfT8ke2VuY29kZWR9YCA6IE9CU0lESUFOX0xBUktfRE9DX1VSSV9QUkVGSVg7XG59XG5cbi8qKiBcdTg5RTNcdTY3OTAgYG9ic2lkaWFuOi8vbGFyay1kb2NgIFVSSSBcdTYyMTYgT2JzaWRpYW4gcHJvdG9jb2wgaGFuZGxlciBwYXJhbXNcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU9ic2lkaWFuTGFya0RvY1BhcmFtcyhcbiAgaW5wdXQ6IHN0cmluZyB8IFVSTFNlYXJjaFBhcmFtcyB8IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IHVuZGVmaW5lZD4sXG4pOiBPYnNpZGlhbkxhcmtEb2NQYXJhbXMge1xuICBjb25zdCBzZWFyY2hQYXJhbXMgPSAoKCkgPT4ge1xuICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBxdWVyeSA9IGlucHV0LmluY2x1ZGVzKCc/JykgPyBpbnB1dC5zbGljZShpbnB1dC5pbmRleE9mKCc/JykgKyAxKSA6IGlucHV0O1xuICAgICAgcmV0dXJuIG5ldyBVUkxTZWFyY2hQYXJhbXMocXVlcnkpO1xuICAgIH1cbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXMpIHJldHVybiBpbnB1dDtcbiAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKCk7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoaW5wdXQpKSB7XG4gICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkgcGFyYW1zLnNldChrZXksIHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcmFtcztcbiAgfSkoKTtcblxuICBjb25zdCBnZXQgPSAoa2V5OiBrZXlvZiBPYnNpZGlhbkxhcmtEb2NQYXJhbXMpOiBzdHJpbmcgfCB1bmRlZmluZWQgPT5cbiAgICBzZWFyY2hQYXJhbXMuZ2V0KGtleSkgfHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHBhcnNlZDogT2JzaWRpYW5MYXJrRG9jUGFyYW1zID0ge307XG4gIGZvciAoY29uc3Qga2V5IG9mIFsndG9rZW4nLCAnbm9kZV90b2tlbicsICdvYmpfdG9rZW4nLCAnc3BhY2VfaWQnLCAndGl0bGUnLCAndXJsJywgJ2RpciddIGFzIGNvbnN0KSB7XG4gICAgY29uc3QgdmFsdWUgPSBnZXQoa2V5KTtcbiAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkgcGFyc2VkW2tleV0gPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gcGFyc2VkO1xufVxuXG4vKiogXHU4RkRCXHU1RUE2XHU5NjM2XHU2QkI1XHVGRjA4XHU2MjY5XHU1QzU1XHU2RDZFXHU1QzQyXHU3NTI4XHVGRjA5XHUzMDAyICovXG5leHBvcnQgdHlwZSBQcm9ncmVzc1N0YWdlID1cbiAgfCAnY29ubmVjdGluZydcbiAgfCAnZmV0Y2hpbmctbWQnXG4gIHwgJ2ZldGNoaW5nLXhtbCdcbiAgfCAncmV3cml0aW5nLWltYWdlcydcbiAgfCAnd3JpdGluZy1maWxlJ1xuICB8ICdhc3NpZ25pbmctY29kZSdcbiAgfCAnZG9uZSdcbiAgfCAnZXJyb3InO1xuIiwgIi8qKlxuICogXHU1MTg1XHU1QkI5IGhhc2hcdUZGMDhcdThGN0JcdTY4MzhcdTlBOENcdUZGMDlcdTMwMDJcdTRGOURcdTYzNkUgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3Ni4yIFx1NkI2NVx1OUFBNCAyXHUzMDAyXG4gKiBcdTc1Mjggc2hhMjU2XHVGRjBDXHU1M0VBIGhhc2ggXHU2QjYzXHU2NTg3XHVGRjA4XHU0RTBEXHU1NDJCIGZyb250bWF0dGVyIFx1NzY4NCBzeW5jXyogXHU1QjU3XHU2QkI1XHVGRjBDXHU5MDdGXHU1MTREXHU4MUVBXHU2MzA3XHVGRjA5XHUzMDAyXG4gKlxuICogXHU4REU4XHU3M0FGXHU1ODgzXHVGRjFBXHU0RjE4XHU1MTQ4XHU3NTI4IFdlYiBDcnlwdG8gQVBJXHVGRjA4XHU2RDRGXHU4OUM4XHU1NjY4ICsgTm9kZSAxOCsgXHU5MEZEXHU2NzA5IGdsb2JhbFRoaXMuY3J5cHRvLnN1YnRsZVx1RkYwOVx1RkYwQ1xuICogZmFsbGJhY2sgXHU1MjMwIG5vZGU6Y3J5cHRvXHVGRjA4T0IgXHU2M0QyXHU0RUY2IG5vZGUgXHU3M0FGXHU1ODgzXHU0RkREXHU5NjY5XHVGRjA5XHUzMDAyXG4gKi9cblxuLyoqIFx1NTQwQ1x1NkI2NVx1NzI0OCBzaGEyNTYgaGV4XHVGRjA4XHU0RUM1IE5vZGUgXHU3M0FGXHU1ODgzXHVGRjA5XHUzMDAyXHU2RDRGXHU4OUM4XHU1NjY4XHU3NTI4IGJvZHlIYXNoQXN5bmNcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBib2R5SGFzaChib2R5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBOb2RlIFx1NzNBRlx1NTg4M1xuICB0cnkge1xuICAgIGNvbnN0IHsgY3JlYXRlSGFzaCB9ID0gcmVxdWlyZSgnbm9kZTpjcnlwdG8nKSBhcyB0eXBlb2YgaW1wb3J0KCdub2RlOmNyeXB0bycpO1xuICAgIHJldHVybiBjcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUoYm9keSwgJ3V0ZjgnKS5kaWdlc3QoJ2hleCcpO1xuICB9IGNhdGNoIHtcbiAgICAvLyBcdTZENEZcdTg5QzhcdTU2NjhcdTczQUZcdTU4ODNcdTY1RTAgcmVxdWlyZVx1RkYwQ1x1OEQ3MCBhc3luYyBcdTcyNDhcdUZGMDhcdThGRDlcdTkxQ0NcdTU0MENcdTZCNjVcdThGRDRcdTU2REUgZmFsbGJhY2tcdUZGMENcdThDMDNcdTc1MjhcdTY1QjlcdTVFOTRcdTc1MjggYXN5bmMgXHU3MjQ4XHVGRjA5XG4gICAgcmV0dXJuIHN5bmNGYWxsYmFja0hhc2goYm9keSk7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTVGMDJcdTZCNjUgc2hhMjU2IGhleFx1RkYwOFx1NkQ0Rlx1ODlDOFx1NTY2OCArIE5vZGUgXHU5MDFBXHU3NTI4XHVGRjA5XHUzMDAyXHU2M0E4XHU4MzUwXHU0RjdGXHU3NTI4XHUzMDAyXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBib2R5SGFzaEFzeW5jKGJvZHk6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IGNyeXB0byA9IGdsb2JhbFRoaXMuY3J5cHRvIGFzIHsgc3VidGxlPzogeyBkaWdlc3Q6IChhbGc6IHN0cmluZywgZGF0YTogQXJyYXlCdWZmZXIpID0+IFByb21pc2U8QXJyYXlCdWZmZXI+IH0gfTtcbiAgaWYgKGNyeXB0bz8uc3VidGxlKSB7XG4gICAgY29uc3QgYnVmID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kaWdlc3QoJ1NIQS0yNTYnLCBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoYm9keSkuYnVmZmVyIGFzIEFycmF5QnVmZmVyKTtcbiAgICByZXR1cm4gWy4uLm5ldyBVaW50OEFycmF5KGJ1ZildLm1hcCgoYikgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XG4gIH1cbiAgcmV0dXJuIHN5bmNGYWxsYmFja0hhc2goYm9keSk7XG59XG5cbi8qKlxuICogXHU3QjgwXHU2NjEzXHU1NDBDXHU2QjY1IGZhbGxiYWNrXHVGRjA4XHU5NzVFXHU1MkEwXHU1QkM2XHU3RUE3XHVGRjBDXHU0RUM1XHU1RjUzIGNyeXB0byBBUEkgXHU5MEZEXHU0RTBEXHU1M0VGXHU3NTI4XHU2NUY2XHU3NTI4XHVGRjA5XHUzMDAyXG4gKiBcdTc1MjggZGpiMiBcdTUzRDhcdTc5Q0RcdUZGMENcdTRGRERcdThCQzFcdTRFMDBcdTgxRjRcdTYwMjdcdTUzNzNcdTUzRUZcdUZGMDhcdThGN0JcdTY4MzhcdTlBOENcdTU3M0FcdTY2NkZcdUZGMDlcdTMwMDJcbiAqL1xuZnVuY3Rpb24gc3luY0ZhbGxiYWNrSGFzaChib2R5OiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgaDEgPSAweDgxMWM5ZGM1O1xuICBsZXQgaDIgPSAweDEwMDAxOTM7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYm9keS5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGMgPSBib2R5LmNoYXJDb2RlQXQoaSk7XG4gICAgaDEgPSBNYXRoLmltdWwoaDEgXiBjLCAweDAxMDAwMTkzKTtcbiAgICBoMiA9IE1hdGguaW11bChoMiBeIChjICsgMHg5ZTM3NzliOSksIDB4ODVlYmNhNzcpO1xuICB9XG4gIHJldHVybiAoaDEgPj4+IDApLnRvU3RyaW5nKDE2KS5wYWRTdGFydCg4LCAnMCcpICsgKGgyID4+PiAwKS50b1N0cmluZygxNikucGFkU3RhcnQoOCwgJzAnKSArICdfZmFsbGJhY2snO1xufVxuXG4vKipcbiAqIFx1NkJENFx1NUJGOVx1NjYyRlx1NTQyNlx1NTNEOFx1NTMxNlx1MzAwMlxuICogQHBhcmFtIGN1cnJlbnQgXHU1RjUzXHU1MjREXHU2QjYzXHU2NTg3IGhhc2hcbiAqIEBwYXJhbSBsYXN0IFx1NEUwQVx1NkIyMVx1NTQwQ1x1NkI2NVx1NTE5OVx1NTE2NVx1NzY4NCBzeW5jX2hhc2hcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2hhbmdlZChjdXJyZW50OiBzdHJpbmcsIGxhc3Q/OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCFsYXN0KSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGN1cnJlbnQgIT09IGxhc3Q7XG59XG4iLCAiLyoqXG4gKiBcdTk4REVcdTRFNjZcdTY4MDdcdTk4OTggXHUyMTkyIFx1NUI4OVx1NTE2OFx1NjU4N1x1NEVGNlx1NTQwRFx1NkUwNVx1NkQxN1x1MzAwMlx1NEY5RFx1NjM2RSBgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTdcdTRFOENcdTZCNjVcdTlBQTQgXHUyNDYxXHUzMDAyXG4gKiBcdThERThcdTVFNzNcdTUzRjBcdTk3NUVcdTZDRDVcdTVCNTdcdTdCMjZcdUZGMDhXaW5kb3dzL21hY09TL0xpbnV4IFx1NUU3Nlx1OTZDNlx1RkYwOVx1RkYxQS8gXFwgOiAqID8gXCIgPCA+IHxcbiAqIFx1NEVFNVx1NTNDQVx1NjNBN1x1NTIzNlx1NUI1N1x1N0IyNlx1MzAwMVx1OTk5Nlx1NUMzRVx1NzBCOVx1NTNGNy9cdTdBN0FcdTY4M0NcdUZGMDhXaW5kb3dzIFx1Nzk4MVx1NkI2Mlx1RkYwOVx1MzAwMlxuICovXG5cbmNvbnN0IElMTEVHQUwgPSAvW1xcL1xcXFw6Kj9cIjw+fF0vZztcbmNvbnN0IENPTlRST0wgPSAvW1xceDAwLVxceDFmXFx4N2ZdL2c7XG5cbi8qKlxuICogXHU2RTA1XHU2RDE3XHU5OERFXHU0RTY2XHU2ODA3XHU5ODk4XHU0RTNBXHU1Qjg5XHU1MTY4XHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU0RTBEXHU1NDJCXHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA5XHUzMDAyXG4gKiAtIFx1NTNCQlx1OTc1RVx1NkNENVx1NUI1N1x1N0IyNiBcdTIxOTIgXHU3NTI4XHU0RTBCXHU1MjEyXHU3RUJGXHU2NkZGXHU2MzYyXG4gKiAtIFx1NjI5OFx1NTNFMFx1OEZERVx1N0VFRFx1N0E3QVx1NzY3RFxuICogLSBcdTUzQkJcdTk5OTZcdTVDM0VcdTcwQjlcdTUzRjcvXHU3QTdBXHU2ODNDXG4gKiAtIFx1NjIyQVx1NjVBRFx1NTIzMCAxMDAgXHU1QjU3XHU3QjI2XHVGRjA4XHU0RkREXHU3NTU5XHU3RjE2XHU3ODAxXHU1MjREXHU3RjAwXHU3QTdBXHU5NUY0XHVGRjA5XG4gKiAtIFx1N0E3QVx1NjgwN1x1OTg5OFx1NTZERVx1OTAwMFx1NTIzMCBcIlx1NjcyQVx1NTQ3RFx1NTQwRFwiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUZpbGVuYW1lKHRpdGxlOiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgcyA9ICh0aXRsZSA/PyAnJykudHJpbSgpO1xuICBzID0gcy5yZXBsYWNlKElMTEVHQUwsICdfJykucmVwbGFjZShDT05UUk9MLCAnJyk7XG4gIHMgPSBzLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKCk7XG4gIC8vIFdpbmRvd3MgXHU3OTgxXHU2QjYyXHU5OTk2XHU1QzNFXHU3MEI5XHU1M0Y3L1x1N0E3QVx1NjgzQ1xuICBzID0gcy5yZXBsYWNlKC9eW1xcLlxcc10rfFtcXC5cXHNdKyQvZywgJycpO1xuICBpZiAocy5sZW5ndGggPiAxMDApIHMgPSBzLnNsaWNlKDAsIDEwMCkudHJpbSgpO1xuICByZXR1cm4gcyB8fCAnXHU2NzJBXHU1NDdEXHU1NDBEJztcbn1cblxuLyoqXG4gKiBcdTUyQTAgLm1kIFx1NjI2OVx1NUM1NVx1RkYwOFx1ODJFNVx1NURGMlx1NjcwOVx1NUMzMVx1NEUwRFx1OTFDRFx1NTkwRFx1NTJBMFx1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aE1kRXh0KG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKCkuZW5kc1dpdGgoJy5tZCcpID8gbmFtZSA6IGAke25hbWV9Lm1kYDtcbn1cblxuLyoqXG4gKiBcdTYyRkNcdTYzQTVcdTc2RUVcdTVGNTVcdTRFMEVcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTU5MDRcdTc0MDZcdTY1OUNcdTY3NjBcdUZGMDlcdTMwMDJcbiAqIEBwYXJhbSBkaXIgXHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1NzY4NFx1NzZFRVx1NUY1NVx1RkYwQ1x1NTk4MiBcIjBcdUZFMEZcdTIwRTNcdThGOTNcdTUxNjUvXHVEODNEXHVEQ0ExXHU3ODhFXHU3MjQ3XHU4RjkzXHU1MTY1XCJcbiAqIEBwYXJhbSBmaWxlbmFtZSBcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTU0MkJcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGpvaW5QYXRoKGRpcjogc3RyaW5nIHwgdW5kZWZpbmVkLCBmaWxlbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKCFkaXIgfHwgZGlyID09PSAnLicgfHwgZGlyID09PSAnLycpIHJldHVybiBmaWxlbmFtZTtcbiAgY29uc3QgZCA9IGRpci5yZXBsYWNlKC9bXFwvXFxcXF0rJC8sICcnKS5yZXBsYWNlKC9eW1xcL1xcXFxdKy8sICcnKTtcbiAgcmV0dXJuIGQgPyBgJHtkfS8ke2ZpbGVuYW1lfWAgOiBmaWxlbmFtZTtcbn1cbiIsICIvKipcbiAqIFx1NTZGRVx1NzI0NyB0b2tlbiBcdTU5MDRcdTc0MDZcdTMwMDJcdTRGOURcdTYzNkUgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3My4zICsgYDAzX1x1NjgzQ1x1NUYwRlx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU1MTZEXHUzMDAyXG4gKlxuICogXHU5OERFXHU0RTY2XHU1QkZDXHU1MUZBXHU3Njg0XHU1NkZFXHU3MjQ3XHU5NEZFXHU2M0E1XHU1RjYyXHU2MDAxXHVGRjFBXG4gKiAgIC0gbWQgXHU1QkZDXHU1MUZBXHVGRjFBYCFbXShodHRwczovL2ludGVybmFsLWFwaS1kcml2ZS1zdHJlYW0uZmVpc2h1LmNuLy4uLi9hdXRoY29kZT0uLi4pYFx1RkYwOFx1OTcwMFx1NzY3Qlx1NUY1NVx1NjAwMVx1RkYwQzFoIFx1OEZDN1x1NjcxRlx1RkYwOVxuICogICAtIHhtbCBcdTVCRkNcdTUxRkFcdUZGMUFgPGltZyBzcmM9XCJGSUxFX1RPS0VOXCIgaHJlZj1cImF1dGhjb2RlX3VybFwiLz5gXHVGRjA4RklMRV9UT0tFTiBcdTZDMzhcdTRFNDVcdTRFMERcdThGQzdcdTY3MUZcdUZGMDlcbiAqXG4gKiBPQiBcdTkxQ0NcdTdFREZcdTRFMDBcdTUxOTlcdTYyMTBcdUZGMUFgIVtdKGZlaXNodTovL0ZJTEVfVE9LRU4pYFxuICogXHU5ODg0XHU4OUM4XHU2NUY2XHU3NTMxIE9CIFx1NjNEMlx1NEVGNlx1OEMwMyBgbGFyay1jbGkgZG9jcyArbWVkaWEtZG93bmxvYWRgIFx1NjM2Mlx1NEUzNFx1NjVGNlx1OTRGRVx1NjNBNVx1MzAwMlxuICovXG5cbi8qKiBPQiBcdTRGQTdcdTU2RkVcdTcyNDdcdTVGMTVcdTc1MjhcdTUzNEZcdThCQUVcdTUyNERcdTdGMDBcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBGRUlTSFVfUFJPVE8gPSAnZmVpc2h1Oi8vJztcblxuLyoqIFx1OThERVx1NEU2NiBpbnRlcm5hbC1hcGkgXHU1NkZFXHU3MjQ3XHU1N0RGXHU1NDBEXHVGRjA4XHU4QkM2XHU1MjJCXHU5NzAwXHU3NjdCXHU1RjU1XHU2MDAxXHU3Njg0XHU0RTM0XHU2NUY2XHU5NEZFXHU2M0E1XHVGRjA5XHUzMDAyICovXG5jb25zdCBJTlRFUk5BTF9BUElfSE9TVCA9ICdpbnRlcm5hbC1hcGktZHJpdmUtc3RyZWFtLmZlaXNodS5jbic7XG5jb25zdCBJTlRFUk5BTF9BUElfSE9TVF9MQVJLID0gJ2ludGVybmFsLWFwaS1kcml2ZS1zdHJlYW0ubGFya3N1aXRlLmNvbSc7XG5cbi8qKiBmaWxlX3Rva2VuIFx1NjgzQ1x1NUYwRlx1RkYxQVx1OThERVx1NEU2NiB0b2tlbiBcdTY2MkYgYmFzZTYyLWlzaFx1RkYwQ1x1OTU3Rlx1NUVBNiB+MjhcdTMwMDIgKi9cbmNvbnN0IFRPS0VOX1JFID0gL1tBLVphLXowLTldezIwLH0vO1xuXG4vKipcbiAqIFx1NEVDRVx1OThERVx1NEU2NiBpbnRlcm5hbC1hcGkgYXV0aGNvZGUgVVJMIFx1OTFDQ1x1NjNEMFx1NTNENiBmaWxlX3Rva2VuXHUzMDAyXG4gKiBVUkwgXHU1RjYyXHU1OTgyIGBodHRwczovL2ludGVybmFsLWFwaS1kcml2ZS1zdHJlYW0uZmVpc2h1LmNuL2RyaXZlLXN0cmVhbS88VE9LRU4+LzxleHRyYT4/YXV0aGNvZGU9Li4uYFxuICogXHU1M0Q2XHU4REVGXHU1Rjg0XHU2QkI1XHU0RTJEXHU2NzAwXHU5NTdGXHU3Njg0IHRva2VuLWxpa2UgXHU1QjUwXHU0RTMyXHUzMDAyXG4gKiBAcmV0dXJucyB0b2tlbiBcdTYyMTYgbnVsbFx1RkYwOFx1NjVFMFx1NkNENVx1OEJDNlx1NTIyQlx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFRva2VuRnJvbUF1dGhjb2RlVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmICghdXJsKSByZXR1cm4gbnVsbDtcbiAgbGV0IHU6IFVSTDtcbiAgdHJ5IHtcbiAgICB1ID0gbmV3IFVSTCh1cmwpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBob3N0ID0gdS5ob3N0bmFtZTtcbiAgaWYgKGhvc3QgIT09IElOVEVSTkFMX0FQSV9IT1NUICYmIGhvc3QgIT09IElOVEVSTkFMX0FQSV9IT1NUX0xBUkspIHJldHVybiBudWxsO1xuICBjb25zdCBzZWdtZW50cyA9IHUucGF0aG5hbWUuc3BsaXQoJy8nKS5maWx0ZXIoQm9vbGVhbik7XG4gIGxldCBiZXN0OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgZm9yIChjb25zdCBzZWcgb2Ygc2VnbWVudHMpIHtcbiAgICBjb25zdCBtID0gc2VnLm1hdGNoKFRPS0VOX1JFKTtcbiAgICBpZiAobSAmJiAoIWJlc3QgfHwgbVswXS5sZW5ndGggPiBiZXN0Lmxlbmd0aCkpIGJlc3QgPSBtWzBdO1xuICB9XG4gIHJldHVybiBiZXN0O1xufVxuXG4vKipcbiAqIFx1NjI4QSBtZCBcdTZCNjNcdTY1ODdcdTkxQ0NcdTc2ODQgaW50ZXJuYWwtYXBpIGF1dGhjb2RlIFx1NTZGRVx1NzI0N1x1OTRGRVx1NjNBNVx1NjZGRlx1NjM2Mlx1NEUzQSBgZmVpc2h1Oi8vVE9LRU5gXHUzMDAyXG4gKiBcdTYzRDBcdTRGOUJcdTRFMDBcdTRFMkEgdG9rZW4gXHU2NjIwXHU1QzA0XHU4ODY4XHVGRjA4eG1sIFx1NUJGQ1x1NTFGQVx1NjJGRlx1NTIzMFx1NzY4NCBzcmMgdG9rZW4gXHUyMTkyIGhyZWYgXHU1M0VGXHU4MEZEXHU1NDJCXHU1NDBDIHRva2VuXHVGRjA5XHUzMDAyXG4gKiBcdTVCRjlcdTYyN0VcdTRFMERcdTUyMzBcdTY2MjBcdTVDMDRcdTc2ODQgYXV0aGNvZGUgVVJMXHVGRjBDXHU1QzFEXHU4QkQ1XHU1QzMxXHU1NzMwIGV4dHJhY3RcdTMwMDJcbiAqXG4gKiBAcGFyYW0gbWQgXHU2QjYzXHU2NTg3IG1hcmtkb3duXG4gKiBAcGFyYW0gdG9rZW5NYXAgeG1sIFx1NUJGQ1x1NTFGQVx1NjJGRlx1NTIzMFx1NzY4NCBmaWxlX3Rva2VuIFx1OTZDNlx1NTQwOFx1RkYwOFx1NzUyOFx1NEU4RVx1N0NCRVx1Nzg2RVx1NTMzOVx1OTE0RFx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmV3cml0ZUltYWdlc1RvRmVpc2h1UHJvdG8oXG4gIG1kOiBzdHJpbmcsXG4gIHRva2VuTWFwOiBTZXQ8c3RyaW5nPiB8IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgU2V0KCksXG4pOiBzdHJpbmcge1xuICAvLyBcdTUzMzlcdTkxNEQgIVthbHRdKHVybCkgXHU1RjYyXHU1RjBGXHU3Njg0XHU1NkZFXHU3MjQ3XHVGRjBDdXJsIFx1NjYyRiBpbnRlcm5hbC1hcGkgXHU5NEZFXHU2M0E1XG4gIGNvbnN0IGltZ1JlID0gLyFcXFsoW15cXF1dKilcXF1cXCgoW14pXSspXFwpL2c7XG4gIHJldHVybiBtZC5yZXBsYWNlKGltZ1JlLCAoZnVsbCwgYWx0OiBzdHJpbmcsIHVybDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgdHJpbW1lZCA9IHVybC50cmltKCkucmVwbGFjZSgvXjx8PiQvZywgJycpO1xuICAgIC8vIFx1NURGMlx1N0VDRlx1NjYyRiBmZWlzaHU6Ly8gXHU1MzRGXHU4QkFFXHVGRjBDXHU4REYzXHU4RkM3XG4gICAgaWYgKHRyaW1tZWQuc3RhcnRzV2l0aChGRUlTSFVfUFJPVE8pKSByZXR1cm4gZnVsbDtcbiAgICAvLyBpbnRlcm5hbC1hcGkgXHU5NEZFXHU2M0E1XHVGRjFBXHU2M0QwIHRva2VuXG4gICAgaWYgKFxuICAgICAgdHJpbW1lZC5pbmNsdWRlcyhJTlRFUk5BTF9BUElfSE9TVCkgfHxcbiAgICAgIHRyaW1tZWQuaW5jbHVkZXMoSU5URVJOQUxfQVBJX0hPU1RfTEFSSylcbiAgICApIHtcbiAgICAgIGNvbnN0IHRva2VuID0gcGlja0V4YWN0VG9rZW4odG9rZW5NYXAsIHRyaW1tZWQpID8/IGV4dHJhY3RUb2tlbkZyb21BdXRoY29kZVVybCh0cmltbWVkKSA/PyBwaWNrRnJvbU1hcCh0b2tlbk1hcCk7XG4gICAgICBpZiAodG9rZW4pIHJldHVybiBgIVske2FsdH1dKCR7RkVJU0hVX1BST1RPfSR7dG9rZW59KWA7XG4gICAgfVxuICAgIC8vIFx1NjY2RVx1OTAxQVx1NTkxNlx1OTRGRVx1NjIxNiBiYXNlNjRcdUZGMENcdTUzOUZcdTY4MzdcdTRGRERcdTc1NTlcbiAgICByZXR1cm4gZnVsbDtcbiAgfSk7XG59XG5cbi8qKiBcdTRFQ0UgdG9rZW5NYXAgXHU5MUNDXHU1M0Q2XHU0RTAwXHU0RTJBXHVGRjA4ZmFsbGJhY2tcdUZGMENcdTc1MjhcdTRFOEVcdTk4N0FcdTVFOEZcdTUzMzlcdTkxNERcdTU3M0FcdTY2NkZcdUZGMENcdThDMDNcdTc1MjhcdTY1QjlcdTVFOTRcdTRGMThcdTUxNDhcdTdDQkVcdTc4NkVcdTUzMzlcdTkxNERcdUZGMDlcdTMwMDIgKi9cbmZ1bmN0aW9uIHBpY2tGcm9tTWFwKHRva2VuTWFwOiBTZXQ8c3RyaW5nPiB8IE1hcDxzdHJpbmcsIHN0cmluZz4pOiBzdHJpbmcgfCBudWxsIHtcbiAgaWYgKHRva2VuTWFwIGluc3RhbmNlb2YgTWFwKSByZXR1cm4gbnVsbDtcbiAgaWYgKHRva2VuTWFwLnNpemUgPT09IDApIHJldHVybiBudWxsO1xuICByZXR1cm4gdG9rZW5NYXAudmFsdWVzKCkubmV4dCgpLnZhbHVlID8/IG51bGw7XG59XG5cbmZ1bmN0aW9uIHBpY2tFeGFjdFRva2VuKHRva2VuTWFwOiBTZXQ8c3RyaW5nPiB8IE1hcDxzdHJpbmcsIHN0cmluZz4sIHVybDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmICghKHRva2VuTWFwIGluc3RhbmNlb2YgTWFwKSkgcmV0dXJuIG51bGw7XG4gIHJldHVybiB0b2tlbk1hcC5nZXQodXJsKSA/PyB0b2tlbk1hcC5nZXQodXJsLnJlcGxhY2UoLyZhbXA7L2csICcmJykpID8/IG51bGw7XG59XG5cbi8qKlxuICogXHU0RUNFIHhtbCBcdTkxQ0NcdTYzRDBcdTUzRDZcdTYyNDBcdTY3MDkgYDxpbWcgc3JjPVwiVE9LRU5cIiAuLi4vPmAgXHU3Njg0IGZpbGVfdG9rZW5cdTMwMDJcbiAqIFx1OThERVx1NEU2NiB4bWwgXHU3Njg0IHNyYyBcdTc2RjRcdTYzQTVcdTVDMzFcdTY2MkYgZmlsZV90b2tlblx1RkYwOFx1NEUwRFx1NjYyRiBVUkxcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RJbWdUb2tlbnNGcm9tWG1sKHhtbDogc3RyaW5nKTogc3RyaW5nW10ge1xuICBjb25zdCB0b2tlbnMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgaW1nUmUgPSAvPGltZ1xcYltePl0qXFxic3JjPVtcIiddKFteXCInXSspW1wiJ11bXj5dKlxcLz8+L2c7XG4gIGxldCBtOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuICB3aGlsZSAoKG0gPSBpbWdSZS5leGVjKHhtbCkpICE9PSBudWxsKSB7XG4gICAgY29uc3Qgc3JjID0gbVsxXS50cmltKCk7XG4gICAgaWYgKHNyYy5zdGFydHNXaXRoKEZFSVNIVV9QUk9UTykpIHtcbiAgICAgIHRva2Vucy5hZGQoc3JjLnNsaWNlKEZFSVNIVV9QUk9UTy5sZW5ndGgpKTtcbiAgICB9IGVsc2UgaWYgKFRPS0VOX1JFLnRlc3Qoc3JjKSAmJiAhc3JjLnN0YXJ0c1dpdGgoJ2h0dHAnKSkge1xuICAgICAgdG9rZW5zLmFkZChzcmMpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gWy4uLnRva2Vuc107XG59XG5cbi8qKlxuICogXHU0RUNFXHU5OERFXHU0RTY2IFhNTCBcdTYzRDBcdTUzRDYgYGhyZWYgXHU0RTM0XHU2NUY2XHU1NkZFXHU5NEZFIC0+IHNyYyBmaWxlX3Rva2VuYCBcdTY2MjBcdTVDMDRcdTMwMDJcbiAqIG1hcmtkb3duIFx1NUJGQ1x1NTFGQVx1NTNFQVx1N0VEOVx1NEUzNFx1NjVGNiBhdXRoY29kZSBVUkxcdUZGMUJYTUwgXHU3Njg0IHNyYyBcdTYyNERcdTY2MkZcdTUzRUZcdTk1N0ZcdTY3MUZcdTRGRERcdTVCNThcdTc2ODQgZmlsZV90b2tlblx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEltZ1Rva2VuTWFwRnJvbVhtbCh4bWw6IHN0cmluZyk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICBjb25zdCBtYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICBjb25zdCBpbWdSZSA9IC88aW1nXFxiW14+XSo+L2c7XG4gIGxldCBtOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuICB3aGlsZSAoKG0gPSBpbWdSZS5leGVjKHhtbCkpICE9PSBudWxsKSB7XG4gICAgY29uc3QgdGFnID0gbVswXTtcbiAgICBjb25zdCBzcmMgPSBhdHRyKHRhZywgJ3NyYycpO1xuICAgIGNvbnN0IGhyZWYgPSBhdHRyKHRhZywgJ2hyZWYnKTtcbiAgICBpZiAoIXNyYyB8fCAhaHJlZiB8fCBzcmMuc3RhcnRzV2l0aCgnaHR0cCcpKSBjb250aW51ZTtcbiAgICBpZiAoIVRPS0VOX1JFLnRlc3Qoc3JjKSkgY29udGludWU7XG4gICAgbWFwLnNldChkZWNvZGVYbWxBdHRyKGhyZWYpLCBzcmMpO1xuICB9XG4gIHJldHVybiBtYXA7XG59XG5cbmZ1bmN0aW9uIGF0dHIodGFnOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCByZSA9IG5ldyBSZWdFeHAoYFxcXFxiJHtuYW1lfT1bXCInXShbXlwiJ10rKVtcIiddYCk7XG4gIHJldHVybiB0YWcubWF0Y2gocmUpPy5bMV0gPz8gbnVsbDtcbn1cblxuZnVuY3Rpb24gZGVjb2RlWG1sQXR0cih2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHZhbHVlXG4gICAgLnJlcGxhY2UoLyZhbXA7L2csICcmJylcbiAgICAucmVwbGFjZSgvJnF1b3Q7L2csICdcIicpXG4gICAgLnJlcGxhY2UoLyZhcG9zOy9nLCBcIidcIilcbiAgICAucmVwbGFjZSgvJmx0Oy9nLCAnPCcpXG4gICAgLnJlcGxhY2UoLyZndDsvZywgJz4nKTtcbn1cblxuLyoqXG4gKiBcdTRFQ0UgbWQgXHU2QjYzXHU2NTg3XHU5MUNDXHU2M0QwXHU1M0Q2XHU2MjQwXHU2NzA5IGZlaXNodTovL1RPS0VOXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0RmVpc2h1SW1hZ2VUb2tlbnMobWQ6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgY29uc3QgdG9rZW5zID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChcbiAgICBgIVxcXFxbW15cXFxcXV0qXFxcXF1cXFxcKCR7RkVJU0hVX1BST1RPLnJlcGxhY2UoJy8nLCAnXFxcXC8nKX0oW0EtWmEtejAtOV0rKVxcXFwpYCxcbiAgICAnZycsXG4gICk7XG4gIGxldCBtOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuICB3aGlsZSAoKG0gPSByZS5leGVjKG1kKSkgIT09IG51bGwpIHtcbiAgICB0b2tlbnMuYWRkKG1bMV0pO1xuICB9XG4gIHJldHVybiBbLi4udG9rZW5zXTtcbn1cblxuLyoqXG4gKiBcdTYyOEEgT0IgXHU2QjYzXHU2NTg3XHU5MUNDXHU3Njg0IGAhW10oZmVpc2h1Oi8vVE9LRU4pYCBcdThGRDhcdTUzOUZcdTRFM0FcdTk4REVcdTRFNjYgeG1sIGA8aW1nIHNyYz1cIlRPS0VOXCIvPmBcdTMwMDJcbiAqIFx1NzUyOFx1NEU4RSBPQlx1MjE5Mlx1OThERVx1NEU2Nlx1NTZERVx1NTE5OVx1RkYwOG1kIFx1OTBFOFx1NTIwNlx1NzUyOCBtYXJrZG93blx1RkYwQ1x1NTZGRVx1NzI0N1x1OTcwMFx1NzUyOCB4bWwgXHU2ODA3XHU3QjdFXHU2MjREXHU4MEZEXHU4OEFCXHU5OERFXHU0RTY2XHU4QkM2XHU1MjJCXHU0RTNBXHU1REYyXHU2NzA5IHRva2VuXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmZWlzaHVQcm90b1RvWG1sKG1kOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCByZSA9IC8hXFxbKFteXFxdXSopXFxdXFwoZmVpc2h1OlxcL1xcLyhbQS1aYS16MC05XSspXFwpL2c7XG4gIHJldHVybiBtZC5yZXBsYWNlKHJlLCAoX2Z1bGwsIF9hbHQ6IHN0cmluZywgdG9rZW46IHN0cmluZykgPT4ge1xuICAgIHJldHVybiBgPGltZyBzcmM9XCIke3Rva2VufVwiLz5gO1xuICB9KTtcbn1cbiIsICJjb25zdCBOT1RfUkVTT0xWRUQ6IHVuaXF1ZSBzeW1ib2wgPSBTeW1ib2woJ05PVF9SRVNPTFZFRCcpXG5jb25zdCBNRVJHRV9LRVk6IHVuaXF1ZSBzeW1ib2wgPSBTeW1ib2woJ01FUkdFX0tFWScpXG5cbnR5cGUgU2NhbGFyUmVwcmVzZW50ID0gKGRhdGE6IGFueSkgPT4gc3RyaW5nXG50eXBlIFNlcXVlbmNlUmVwcmVzZW50ID0gKGRhdGE6IGFueSkgPT4gQXJyYXlMaWtlPHVua25vd24+XG50eXBlIE1hcHBpbmdSZXByZXNlbnQgPSAoZGF0YTogYW55KSA9PiBNYXA8dW5rbm93biwgdW5rbm93bj5cblxudHlwZSBJZGVudGlmeUZuID0gKGRhdGE6IGFueSkgPT4gYm9vbGVhblxudHlwZSBSZXByZXNlbnRUYWdOYW1lRm4gPSAoZGF0YTogYW55KSA9PiBzdHJpbmdcblxuaW50ZXJmYWNlIFNjYWxhclRhZ0RlZmluaXRpb248UmVzdWx0ID0gdW5rbm93bj4ge1xuICB0YWdOYW1lOiBzdHJpbmdcbiAgbm9kZUtpbmQ6ICdzY2FsYXInXG4gIGltcGxpY2l0OiBib29sZWFuXG4gIG1hdGNoQnlUYWdQcmVmaXg6IGJvb2xlYW5cbiAgLy8gU2V0IG9mIGBzb3VyY2UuY2hhckF0KDApYCBrZXlzIGZvciB3aGljaCBgcmVzb2x2ZWAgbWF5IHN1Y2NlZWQgKGEgc3VwZXJzZXQgb2ZcbiAgLy8gd2hhdCBpdCByZWFsbHkgbWF0Y2hlcykuIEEga2V5IGlzIGVpdGhlciBhIHNpbmdsZSBjaGFyYWN0ZXIgb3IgJycgKGVtcHR5XG4gIC8vIHNvdXJjZSkuIGBudWxsYCBtZWFucyBcIm5vIGNvbnN0cmFpbnQsIGFsd2F5cyB0cnlcIi4gVXNlZCBieSB0aGUgY29tcG9zZXIgdG9cbiAgLy8gZGlzcGF0Y2ggaW1wbGljaXQgc2NhbGFycyBieSBmaXJzdCBjaGFyYWN0ZXIgd2l0aG91dCBydW5uaW5nIGV2ZXJ5IHJlc29sdmVyLlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IHJlYWRvbmx5IHN0cmluZ1tdIHwgbnVsbFxuICAvLyBgaXNFeHBsaWNpdGAgaXMgdHJ1ZSBmb3IgYW4gZXhwbGljaXQgdGFnIChgISF0YWdgKSwgZmFsc2UgZm9yIGltcGxpY2l0IHBsYWluXG4gIC8vIHNjYWxhciByZXNvbHV0aW9uLlxuICByZXNvbHZlOiAoc291cmNlOiBzdHJpbmcsIGlzRXhwbGljaXQ6IGJvb2xlYW4sIHRhZ05hbWU6IHN0cmluZykgPT4gUmVzdWx0IHwgdHlwZW9mIE5PVF9SRVNPTFZFRFxuICBpZGVudGlmeTogSWRlbnRpZnlGbiB8IG51bGxcbiAgLy8gQSBzY2FsYXIncyBwcmludGVkIGZvcm0gaXMgdGV4dCwgc28gYHJlcHJlc2VudGAgYWx3YXlzIHlpZWxkcyBhIHN0cmluZy4gVGhlXG4gIC8vIGZhY3Rvcnkgc3VwcGxpZXMgYSBgU3RyaW5nKGRhdGEpYCBkZWZhdWx0IHdoZW4gYSB0YWcgb21pdHMgaXQuXG4gIHJlcHJlc2VudDogU2NhbGFyUmVwcmVzZW50XG4gIHJlcHJlc2VudFRhZ05hbWU6IFJlcHJlc2VudFRhZ05hbWVGbiB8IG51bGxcbn1cblxuaW50ZXJmYWNlIFNlcXVlbmNlVGFnRGVmaW5pdGlvbjxDYXJyaWVyID0gdW5rbm93biwgUmVzdWx0ID0gQ2Fycmllcj4ge1xuICB0YWdOYW1lOiBzdHJpbmdcbiAgbm9kZUtpbmQ6ICdzZXF1ZW5jZSdcbiAgaW1wbGljaXQ6IGZhbHNlXG4gIG1hdGNoQnlUYWdQcmVmaXg6IGJvb2xlYW5cbiAgY3JlYXRlOiAodGFnTmFtZTogc3RyaW5nKSA9PiBDYXJyaWVyXG4gIGFkZEl0ZW06IChjYXJyaWVyOiBDYXJyaWVyLCBpdGVtOiB1bmtub3duLCBpbmRleDogbnVtYmVyKSA9PiB2b2lkIHwgc3RyaW5nXG4gIGZpbmFsaXplOiAoY2FycmllcjogQ2FycmllcikgPT4gUmVzdWx0XG4gIGNhcnJpZXJJc1Jlc3VsdDogYm9vbGVhblxuICBpZGVudGlmeTogSWRlbnRpZnlGbiB8IG51bGxcbiAgcmVwcmVzZW50OiBTZXF1ZW5jZVJlcHJlc2VudFxuICByZXByZXNlbnRUYWdOYW1lOiBSZXByZXNlbnRUYWdOYW1lRm4gfCBudWxsXG59XG5cbmludGVyZmFjZSBNYXBwaW5nVGFnRGVmaW5pdGlvbjxDYXJyaWVyID0gdW5rbm93biwgUmVzdWx0ID0gQ2Fycmllcj4ge1xuICB0YWdOYW1lOiBzdHJpbmdcbiAgbm9kZUtpbmQ6ICdtYXBwaW5nJ1xuICBpbXBsaWNpdDogZmFsc2VcbiAgbWF0Y2hCeVRhZ1ByZWZpeDogYm9vbGVhblxuICBjcmVhdGU6ICh0YWdOYW1lOiBzdHJpbmcpID0+IENhcnJpZXJcbiAgLy8gV3JpdGVzIGEgcGFpci4gUmV0dXJucyAnJyBvbiBzdWNjZXNzLCBhIG5vbi1lbXB0eSBlcnJvciBtZXNzYWdlIG90aGVyd2lzZVxuICAvLyAoa2V5IGRvZXMgbm90IGZpdCB0aGUgcmVwcmVzZW50YXRpb24sIHZhbHVlIHJlamVjdGVkLCAuLi4pLiBBbHdheXMgYSBzdHJpbmdcbiAgLy8gc28gdGhlIGhvdCBwYXRoIG5ldmVyIGFsbG9jYXRlcyBhbiBleGNlcHRpb24gd3JhcHBlci5cbiAgYWRkUGFpcjogKGNhcnJpZXI6IENhcnJpZXIsIGtleTogdW5rbm93biwgdmFsdWU6IHVua25vd24pID0+IHN0cmluZ1xuICAvLyBSZWFkIHNpZGUsIG1pcnJvcnMgYE1hcGAg4oCUIGRlZmluaW5nIGEgcmVwcmVzZW50YXRpb24gbWVhbnMgZGVmaW5pbmcgaG93IHRvXG4gIC8vIHJlYWQgaXQgYmFjay4gYGhhc2AgaXMgdGhlIGhvdCBkZWR1cCBwcm9iZSAobWVtYmVyc2hpcCB3aXRob3V0IGZldGNoaW5nIHRoZVxuICAvLyB2YWx1ZSk7IGBrZXlzYC9gZ2V0YCBhcmUgdXNlZCBvbmx5IG9uIHRoZSBjb2xkIG1lcmdlIHBhdGggKGA8PGApLlxuICBoYXM6IChjYXJyaWVyOiBDYXJyaWVyLCBrZXk6IHVua25vd24pID0+IGJvb2xlYW5cbiAga2V5czogKHJlc3VsdDogUmVzdWx0KSA9PiBJdGVyYWJsZTx1bmtub3duPlxuICBnZXQ6IChyZXN1bHQ6IFJlc3VsdCwga2V5OiB1bmtub3duKSA9PiB1bmtub3duXG4gIGZpbmFsaXplOiAoY2FycmllcjogQ2FycmllcikgPT4gUmVzdWx0XG4gIGNhcnJpZXJJc1Jlc3VsdDogYm9vbGVhblxuICBpZGVudGlmeTogSWRlbnRpZnlGbiB8IG51bGxcbiAgcmVwcmVzZW50OiBNYXBwaW5nUmVwcmVzZW50XG4gIHJlcHJlc2VudFRhZ05hbWU6IFJlcHJlc2VudFRhZ05hbWVGbiB8IG51bGxcbn1cblxudHlwZSBUYWdEZWZpbml0aW9uID1cbiAgfCBTY2FsYXJUYWdEZWZpbml0aW9uPGFueT5cbiAgfCBTZXF1ZW5jZVRhZ0RlZmluaXRpb248YW55LCBhbnk+XG4gIHwgTWFwcGluZ1RhZ0RlZmluaXRpb248YW55LCBhbnk+XG5cbmludGVyZmFjZSBTY2FsYXJUYWdPcHRpb25zPFJlc3VsdD4ge1xuICBpbXBsaWNpdD86IGJvb2xlYW5cbiAgbWF0Y2hCeVRhZ1ByZWZpeD86IGJvb2xlYW5cbiAgaW1wbGljaXRGaXJzdENoYXJzPzogcmVhZG9ubHkgc3RyaW5nW10gfCBudWxsXG4gIHJlc29sdmU6IFNjYWxhclRhZ0RlZmluaXRpb248UmVzdWx0PlsncmVzb2x2ZSddXG4gIGlkZW50aWZ5PzogU2NhbGFyVGFnRGVmaW5pdGlvbjxSZXN1bHQ+WydpZGVudGlmeSddXG4gIHJlcHJlc2VudD86IFNjYWxhclRhZ0RlZmluaXRpb248UmVzdWx0PlsncmVwcmVzZW50J11cbiAgcmVwcmVzZW50VGFnTmFtZT86IFNjYWxhclRhZ0RlZmluaXRpb248UmVzdWx0PlsncmVwcmVzZW50VGFnTmFtZSddXG59XG5cbnR5cGUgUmVwcmVzZW50T3B0aW9uczxDb250YWluZXIsIENhbm9uaWNhbCwgUmVwcmVzZW50PiA9XG4gIHwge1xuICAgICAgaWRlbnRpZnk/OiBudWxsXG4gICAgICByZXByZXNlbnQ/OiBSZXByZXNlbnRcbiAgICAgIHJlcHJlc2VudFRhZ05hbWU/OiBSZXByZXNlbnRUYWdOYW1lRm4gfCBudWxsXG4gICAgfVxuICB8IChDb250YWluZXIgZXh0ZW5kcyBDYW5vbmljYWxcbiAgICAgID8ge1xuICAgICAgICAgIGlkZW50aWZ5PzogSWRlbnRpZnlGbiB8IG51bGxcbiAgICAgICAgICByZXByZXNlbnQ/OiBSZXByZXNlbnRcbiAgICAgICAgICByZXByZXNlbnRUYWdOYW1lPzogUmVwcmVzZW50VGFnTmFtZUZuIHwgbnVsbFxuICAgICAgICB9XG4gICAgICA6IHtcbiAgICAgICAgICBpZGVudGlmeTogSWRlbnRpZnlGblxuICAgICAgICAgIHJlcHJlc2VudDogUmVwcmVzZW50XG4gICAgICAgICAgcmVwcmVzZW50VGFnTmFtZT86IFJlcHJlc2VudFRhZ05hbWVGbiB8IG51bGxcbiAgICAgICAgfSlcblxudHlwZSBTZXF1ZW5jZVRhZ09wdGlvbnM8Q2FycmllciwgUmVzdWx0ID0gQ2Fycmllcj4gPSB7XG4gIG1hdGNoQnlUYWdQcmVmaXg/OiBib29sZWFuXG4gIGNyZWF0ZTogU2VxdWVuY2VUYWdEZWZpbml0aW9uPENhcnJpZXIsIFJlc3VsdD5bJ2NyZWF0ZSddXG4gIGFkZEl0ZW06IFNlcXVlbmNlVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+WydhZGRJdGVtJ11cbiAgZmluYWxpemU/OiBTZXF1ZW5jZVRhZ0RlZmluaXRpb248Q2FycmllciwgUmVzdWx0PlsnZmluYWxpemUnXVxufSAmIFJlcHJlc2VudE9wdGlvbnM8UmVzdWx0LCBBcnJheUxpa2U8dW5rbm93bj4sIFNlcXVlbmNlUmVwcmVzZW50PlxuXG50eXBlIE1hcHBpbmdUYWdPcHRpb25zPENhcnJpZXIsIFJlc3VsdCA9IENhcnJpZXI+ID0ge1xuICBtYXRjaEJ5VGFnUHJlZml4PzogYm9vbGVhblxuICBjcmVhdGU6IE1hcHBpbmdUYWdEZWZpbml0aW9uPENhcnJpZXIsIFJlc3VsdD5bJ2NyZWF0ZSddXG4gIGFkZFBhaXI6IE1hcHBpbmdUYWdEZWZpbml0aW9uPENhcnJpZXIsIFJlc3VsdD5bJ2FkZFBhaXInXVxuICBoYXM6IE1hcHBpbmdUYWdEZWZpbml0aW9uPENhcnJpZXIsIFJlc3VsdD5bJ2hhcyddXG4gIGtleXM6IE1hcHBpbmdUYWdEZWZpbml0aW9uPENhcnJpZXIsIFJlc3VsdD5bJ2tleXMnXVxuICBnZXQ6IE1hcHBpbmdUYWdEZWZpbml0aW9uPENhcnJpZXIsIFJlc3VsdD5bJ2dldCddXG4gIGZpbmFsaXplPzogTWFwcGluZ1RhZ0RlZmluaXRpb248Q2FycmllciwgUmVzdWx0PlsnZmluYWxpemUnXVxufSAmIFJlcHJlc2VudE9wdGlvbnM8UmVzdWx0LCBNYXA8dW5rbm93biwgdW5rbm93bj4sIE1hcHBpbmdSZXByZXNlbnQ+XG5cbmZ1bmN0aW9uIGRlZmluZVNjYWxhclRhZzxSZXN1bHQ+ICh0YWdOYW1lOiBzdHJpbmcsIG9wdGlvbnM6IFNjYWxhclRhZ09wdGlvbnM8UmVzdWx0Pik6IFNjYWxhclRhZ0RlZmluaXRpb248UmVzdWx0PiB7XG4gIHJldHVybiB7XG4gICAgdGFnTmFtZSxcbiAgICBub2RlS2luZDogJ3NjYWxhcicsXG4gICAgaW1wbGljaXQ6IG9wdGlvbnMuaW1wbGljaXQgPz8gZmFsc2UsXG4gICAgbWF0Y2hCeVRhZ1ByZWZpeDogb3B0aW9ucy5tYXRjaEJ5VGFnUHJlZml4ID8/IGZhbHNlLFxuICAgIGltcGxpY2l0Rmlyc3RDaGFyczogb3B0aW9ucy5pbXBsaWNpdEZpcnN0Q2hhcnMgPz8gbnVsbCxcbiAgICByZXNvbHZlOiBvcHRpb25zLnJlc29sdmUsXG4gICAgaWRlbnRpZnk6IG9wdGlvbnMuaWRlbnRpZnkgPz8gbnVsbCxcbiAgICByZXByZXNlbnQ6IG9wdGlvbnMucmVwcmVzZW50ID8/IChkYXRhID0+IFN0cmluZyhkYXRhKSksXG4gICAgcmVwcmVzZW50VGFnTmFtZTogb3B0aW9ucy5yZXByZXNlbnRUYWdOYW1lID8/IG51bGxcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWZpbmVTZXF1ZW5jZVRhZzxDYXJyaWVyLCBSZXN1bHQgPSBDYXJyaWVyPiAodGFnTmFtZTogc3RyaW5nLCBvcHRpb25zOiBTZXF1ZW5jZVRhZ09wdGlvbnM8Q2FycmllciwgUmVzdWx0Pik6IFNlcXVlbmNlVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+IHtcbiAgY29uc3QgY2FycmllcklzUmVzdWx0ID0gb3B0aW9ucy5maW5hbGl6ZSA9PT0gdW5kZWZpbmVkXG5cbiAgcmV0dXJuIHtcbiAgICB0YWdOYW1lLFxuICAgIG5vZGVLaW5kOiAnc2VxdWVuY2UnLFxuICAgIGltcGxpY2l0OiBmYWxzZSxcbiAgICBtYXRjaEJ5VGFnUHJlZml4OiBvcHRpb25zLm1hdGNoQnlUYWdQcmVmaXggPz8gZmFsc2UsXG4gICAgY3JlYXRlOiBvcHRpb25zLmNyZWF0ZSxcbiAgICBhZGRJdGVtOiBvcHRpb25zLmFkZEl0ZW0sXG4gICAgZmluYWxpemU6IG9wdGlvbnMuZmluYWxpemUgPz8gKGNhcnJpZXIgPT4gY2FycmllciBhcyB1bmtub3duIGFzIFJlc3VsdCksXG4gICAgY2FycmllcklzUmVzdWx0LFxuICAgIGlkZW50aWZ5OiBvcHRpb25zLmlkZW50aWZ5ID8/IG51bGwsXG4gICAgcmVwcmVzZW50OiBvcHRpb25zLnJlcHJlc2VudCA/PyAoZGF0YSA9PiBkYXRhIGFzIEFycmF5TGlrZTx1bmtub3duPiksXG4gICAgcmVwcmVzZW50VGFnTmFtZTogb3B0aW9ucy5yZXByZXNlbnRUYWdOYW1lID8/IG51bGxcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWZpbmVNYXBwaW5nVGFnPENhcnJpZXIsIFJlc3VsdCA9IENhcnJpZXI+ICh0YWdOYW1lOiBzdHJpbmcsIG9wdGlvbnM6IE1hcHBpbmdUYWdPcHRpb25zPENhcnJpZXIsIFJlc3VsdD4pOiBNYXBwaW5nVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+IHtcbiAgY29uc3QgY2FycmllcklzUmVzdWx0ID0gb3B0aW9ucy5maW5hbGl6ZSA9PT0gdW5kZWZpbmVkXG5cbiAgcmV0dXJuIHtcbiAgICB0YWdOYW1lLFxuICAgIG5vZGVLaW5kOiAnbWFwcGluZycsXG4gICAgaW1wbGljaXQ6IGZhbHNlLFxuICAgIG1hdGNoQnlUYWdQcmVmaXg6IG9wdGlvbnMubWF0Y2hCeVRhZ1ByZWZpeCA/PyBmYWxzZSxcbiAgICBjcmVhdGU6IG9wdGlvbnMuY3JlYXRlLFxuICAgIGFkZFBhaXI6IG9wdGlvbnMuYWRkUGFpcixcbiAgICBoYXM6IG9wdGlvbnMuaGFzLFxuICAgIGtleXM6IG9wdGlvbnMua2V5cyxcbiAgICBnZXQ6IG9wdGlvbnMuZ2V0LFxuICAgIGZpbmFsaXplOiBvcHRpb25zLmZpbmFsaXplID8/IChjYXJyaWVyID0+IGNhcnJpZXIgYXMgdW5rbm93biBhcyBSZXN1bHQpLFxuICAgIGNhcnJpZXJJc1Jlc3VsdCxcbiAgICBpZGVudGlmeTogb3B0aW9ucy5pZGVudGlmeSA/PyBudWxsLFxuICAgIHJlcHJlc2VudDogb3B0aW9ucy5yZXByZXNlbnQgPz8gKGRhdGEgPT4gZGF0YSBhcyBNYXA8dW5rbm93biwgdW5rbm93bj4pLFxuICAgIHJlcHJlc2VudFRhZ05hbWU6IG9wdGlvbnMucmVwcmVzZW50VGFnTmFtZSA/PyBudWxsXG4gIH1cbn1cblxuZXhwb3J0IHtcbiAgTk9UX1JFU09MVkVELFxuICBNRVJHRV9LRVksXG4gIGRlZmluZVNjYWxhclRhZyxcbiAgZGVmaW5lU2VxdWVuY2VUYWcsXG4gIGRlZmluZU1hcHBpbmdUYWcsXG5cbiAgdHlwZSBTY2FsYXJUYWdEZWZpbml0aW9uLFxuICB0eXBlIFNlcXVlbmNlVGFnRGVmaW5pdGlvbixcbiAgdHlwZSBNYXBwaW5nVGFnRGVmaW5pdGlvbixcbiAgdHlwZSBUYWdEZWZpbml0aW9uLFxuICB0eXBlIFNjYWxhclRhZ09wdGlvbnMsXG4gIHR5cGUgU2VxdWVuY2VUYWdPcHRpb25zLFxuICB0eXBlIE1hcHBpbmdUYWdPcHRpb25zLFxuICB0eXBlIFNjYWxhclJlcHJlc2VudCxcbiAgdHlwZSBTZXF1ZW5jZVJlcHJlc2VudCxcbiAgdHlwZSBNYXBwaW5nUmVwcmVzZW50XG59XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG5jb25zdCBzdHJUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOnN0cicsIHtcbiAgcmVzb2x2ZTogKHNvdXJjZSkgPT4gc291cmNlLFxuICBpZGVudGlmeTogKGRhdGEpID0+IHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJ1xufSlcblxuZXhwb3J0IHsgc3RyVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgTlVMTF9WQUxVRVMgPSBbJycsICd+JywgJ251bGwnLCAnTnVsbCcsICdOVUxMJ11cblxuY29uc3QgbnVsbENvcmVUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOm51bGwnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBTdXBlcnNldCBvZiBzb3VyY2UuY2hhckF0KDApIG92ZXIgYWxsIG1hdGNoZWQgaW5wdXRzOiAnJyAoZW1wdHkpLCAnficsICdudWxsJy8nTnVsbCcvJ05VTEwnLlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IFsnJywgJ34nLCAnbicsICdOJ10sXG4gIHJlc29sdmU6IChzb3VyY2UpID0+IHtcbiAgICBpZiAoTlVMTF9WQUxVRVMuaW5kZXhPZihzb3VyY2UpICE9PSAtMSkgcmV0dXJuIG51bGxcblxuICAgIHJldHVybiBOT1RfUkVTT0xWRURcbiAgfSxcbiAgaWRlbnRpZnk6IChvYmplY3QpID0+IG9iamVjdCA9PT0gbnVsbCxcbiAgcmVwcmVzZW50OiAoKSA9PiAnbnVsbCdcbn0pXG5cbmV4cG9ydCB7IG51bGxDb3JlVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgbnVsbEpzb25UYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOm51bGwnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBTdXBlcnNldCBvZiBzb3VyY2UuY2hhckF0KDApIG92ZXIgYWxsIG1hdGNoZWQgaW5wdXRzOiBudWxsLlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IFsnbiddLFxuICByZXNvbHZlOiAoc291cmNlLCBpc0V4cGxpY2l0KSA9PiB7XG4gICAgaWYgKHNvdXJjZSA9PT0gJ251bGwnIHx8IChpc0V4cGxpY2l0ICYmIHNvdXJjZSA9PT0gJycpKSByZXR1cm4gbnVsbFxuXG4gICAgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICB9LFxuICBpZGVudGlmeTogKG9iamVjdCkgPT4gb2JqZWN0ID09PSBudWxsLFxuICByZXByZXNlbnQ6ICgpID0+ICdudWxsJ1xufSlcblxuZXhwb3J0IHsgbnVsbEpzb25UYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZywgTk9UX1JFU09MVkVEIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG5jb25zdCBOVUxMX1ZBTFVFUyA9IFsnJywgJ34nLCAnbnVsbCcsICdOdWxsJywgJ05VTEwnXVxuXG5jb25zdCBudWxsWWFtbDExVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpudWxsJywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0czogJycgKGVtcHR5KSwgJ34nLCAnbnVsbCcvJ051bGwnLydOVUxMJy5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJycsICd+JywgJ24nLCAnTiddLFxuICByZXNvbHZlOiAoc291cmNlKSA9PiB7XG4gICAgaWYgKE5VTExfVkFMVUVTLmluZGV4T2Yoc291cmNlKSAhPT0gLTEpIHJldHVybiBudWxsXG5cbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH0sXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PiBvYmplY3QgPT09IG51bGwsXG4gIHJlcHJlc2VudDogKCkgPT4gJ251bGwnXG59KVxuXG5leHBvcnQgeyBudWxsWWFtbDExVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgVFJVRV9WQUxVRVMgPSBbJ3RydWUnLCAnVHJ1ZScsICdUUlVFJ11cbmNvbnN0IEZBTFNFX1ZBTFVFUyA9IFsnZmFsc2UnLCAnRmFsc2UnLCAnRkFMU0UnXVxuXG5jb25zdCBib29sQ29yZVRhZyA9IGRlZmluZVNjYWxhclRhZygndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsIHtcbiAgaW1wbGljaXQ6IHRydWUsXG4gIC8vIFN1cGVyc2V0IG9mIHNvdXJjZS5jaGFyQXQoMCkgb3ZlciBhbGwgbWF0Y2hlZCBpbnB1dHM6IHRydWUvVHJ1ZS9UUlVFLCBmYWxzZS9GYWxzZS9GQUxTRS5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJ3QnLCAnVCcsICdmJywgJ0YnXSxcbiAgcmVzb2x2ZTogKHNvdXJjZSkgPT4ge1xuICAgIGlmIChUUlVFX1ZBTFVFUy5pbmRleE9mKHNvdXJjZSkgIT09IC0xKSByZXR1cm4gdHJ1ZVxuICAgIGlmIChGQUxTRV9WQUxVRVMuaW5kZXhPZihzb3VyY2UpICE9PSAtMSkgcmV0dXJuIGZhbHNlXG5cbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH0sXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICByZXByZXNlbnQ6IChvYmplY3QpID0+IG9iamVjdCA/ICd0cnVlJyA6ICdmYWxzZSdcbn0pXG5cbmV4cG9ydCB7IGJvb2xDb3JlVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgVFJVRV9WQUxVRVMgPSBbJ3RydWUnXVxuY29uc3QgRkFMU0VfVkFMVUVTID0gWydmYWxzZSddXG5cbmNvbnN0IGJvb2xKc29uVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpib29sJywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0czogdHJ1ZSwgZmFsc2UuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWyd0JywgJ2YnXSxcbiAgcmVzb2x2ZTogKHNvdXJjZSkgPT4ge1xuICAgIGlmIChUUlVFX1ZBTFVFUy5pbmRleE9mKHNvdXJjZSkgIT09IC0xKSByZXR1cm4gdHJ1ZVxuICAgIGlmIChGQUxTRV9WQUxVRVMuaW5kZXhPZihzb3VyY2UpICE9PSAtMSkgcmV0dXJuIGZhbHNlXG5cbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH0sXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICByZXByZXNlbnQ6IChvYmplY3QpID0+IG9iamVjdCA/ICd0cnVlJyA6ICdmYWxzZSdcbn0pXG5cbmV4cG9ydCB7IGJvb2xKc29uVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgVFJVRV9WQUxVRVMgPSBbJ3RydWUnLCAnVHJ1ZScsICdUUlVFJywgJ3knLCAnWScsICd5ZXMnLCAnWWVzJywgJ1lFUycsICdvbicsICdPbicsICdPTiddXG5jb25zdCBGQUxTRV9WQUxVRVMgPSBbJ2ZhbHNlJywgJ0ZhbHNlJywgJ0ZBTFNFJywgJ24nLCAnTicsICdubycsICdObycsICdOTycsICdvZmYnLCAnT2ZmJywgJ09GRiddXG5cbmNvbnN0IGJvb2xZYW1sMTFUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOmJvb2wnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBTdXBlcnNldCBvZiBzb3VyY2UuY2hhckF0KDApIG92ZXIgYWxsIG1hdGNoZWQgaW5wdXRzLlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IFsneScsICdZJywgJ24nLCAnTicsICd0JywgJ1QnLCAnZicsICdGJywgJ28nLCAnTyddLFxuICByZXNvbHZlOiAoc291cmNlKSA9PiB7XG4gICAgaWYgKFRSVUVfVkFMVUVTLmluZGV4T2Yoc291cmNlKSAhPT0gLTEpIHJldHVybiB0cnVlXG4gICAgaWYgKEZBTFNFX1ZBTFVFUy5pbmRleE9mKHNvdXJjZSkgIT09IC0xKSByZXR1cm4gZmFsc2VcblxuICAgIHJldHVybiBOT1RfUkVTT0xWRURcbiAgfSxcbiAgaWRlbnRpZnk6IChvYmplY3QpID0+IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09PSAnW29iamVjdCBCb29sZWFuXScsXG4gIHJlcHJlc2VudDogKG9iamVjdCkgPT4gb2JqZWN0ID8gJ3RydWUnIDogJ2ZhbHNlJ1xufSlcblxuZXhwb3J0IHsgYm9vbFlhbWwxMVRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbi8vIFlBTUwgMS4yIENvcmUgc2NoZW1hIGltcGxpY2l0IHJlc29sdXRpb246XG4vLyBbLStdPyBbMC05XSsgfCAwbyBbMC03XSsgfCAweCBbMC05YS1mQS1GXStcbmNvbnN0IFlBTUxfSU5URUdFUl9JTVBMSUNJVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgLy8gMG8xMjNcbiAgJ14oPzowb1swLTddKycgK1xuICAvLyAweDFBXG4gICd8MHhbMC05YS1mQS1GXSsnICtcbiAgLy8gMTIzNDVcbiAgJ3xbLStdP1swLTldKykkJylcblxuLy8gRXhwbGljaXQgYCEhaW50YCB2YWxpZGF0aW9uIGlzIHNlcGFyYXRlIGZyb20gQ29yZSBpbXBsaWNpdCByZXNvbHV0aW9uLlxuY29uc3QgWUFNTF9JTlRFR0VSX0VYUExJQ0lUX1BBVFRFUk4gPSBuZXcgUmVnRXhwKFxuICAvLyAwYjEwMTBcbiAgJ14oPzpbLStdPzBiWzAtMV0rJyArXG4gIC8vIDBvMTIzXG4gICd8Wy0rXT8wb1swLTddKycgK1xuICAvLyAweDFBXG4gICd8Wy0rXT8weFswLTlhLWZBLUZdKycgK1xuICAvLyAxMjM0NVxuICAnfFstK10/WzAtOV0rKSQnKVxuXG5mdW5jdGlvbiBwYXJzZVlhbWxJbnRlZ2VyIChzb3VyY2U6IHN0cmluZykge1xuICBsZXQgdmFsdWUgPSBzb3VyY2VcbiAgbGV0IHNpZ24gPSAxXG5cbiAgaWYgKHZhbHVlWzBdID09PSAnLScgfHwgdmFsdWVbMF0gPT09ICcrJykge1xuICAgIGlmICh2YWx1ZVswXSA9PT0gJy0nKSBzaWduID0gLTFcbiAgICB2YWx1ZSA9IHZhbHVlLnNsaWNlKDEpXG4gIH1cblxuICBpZiAodmFsdWUuc3RhcnRzV2l0aCgnMGInKSkgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgMilcbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoJzBvJykpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIDgpXG4gIGlmICh2YWx1ZS5zdGFydHNXaXRoKCcweCcpKSByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCAxNilcblxuICByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLCAxMClcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxJbnRlZ2VyIChzb3VyY2U6IHN0cmluZywgaXNFeHBsaWNpdDogYm9vbGVhbikge1xuICBpZiAoaXNFeHBsaWNpdCkge1xuICAgIGlmICghWUFNTF9JTlRFR0VSX0VYUExJQ0lUX1BBVFRFUk4udGVzdChzb3VyY2UpKSByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH0gZWxzZSBpZiAoIVlBTUxfSU5URUdFUl9JTVBMSUNJVF9QQVRURVJOLnRlc3Qoc291cmNlKSkge1xuICAgIHJldHVybiBOT1RfUkVTT0xWRURcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdCA9IHBhcnNlWWFtbEludGVnZXIoc291cmNlKVxuICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHJlc3VsdCkgPyByZXN1bHQgOiBOT1RfUkVTT0xWRURcbn1cblxuY29uc3QgaW50Q29yZVRhZyA9IGRlZmluZVNjYWxhclRhZygndGFnOnlhbWwub3JnLDIwMDI6aW50Jywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0czogb3B0aW9uYWwgc2lnbiArIGRlY2ltYWwgZGlnaXQuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWyctJywgJysnLCAuLi4nMDEyMzQ1Njc4OSddLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbEludGVnZXIsXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PlxuICAgIC8vIE5vIGFuY2llbnQgYm94ZWQgbnVtYmVycyBzdXBwb3J0XG4gICAgTnVtYmVyLmlzSW50ZWdlcihvYmplY3QpICYmXG4gICAgLy8gTmVnYXRpdmUgemVybyA9PiAhIWZsb2F0XG4gICAgIU9iamVjdC5pcyhvYmplY3QsIC0wKSAmJlxuICAgIC8vIEV4cG9uZW50aWFsIGZvcm0gPT4gISFmbG9hdCwgcm91bmQtdHJpcCBmb3IgISFpbnQgMWUyMSB3aWxsIGJlIGJyb2tlblxuICAgIG9iamVjdC50b1N0cmluZygxMCkuaW5kZXhPZignZScpIDwgMCxcbiAgcmVwcmVzZW50OiAob2JqZWN0OiBudW1iZXIpID0+IG9iamVjdC50b1N0cmluZygxMClcbn0pXG5cbmV4cG9ydCB7IGludENvcmVUYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZywgTk9UX1JFU09MVkVEIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG4vLyBZQU1MIDEuMiBKU09OIHNjaGVtYSBpbXBsaWNpdCByZXNvbHV0aW9uOlxuLy8gLT8gKCAwIHwgWzEtOV0gWzAtOV0qIClcbmNvbnN0IFlBTUxfSU5URUdFUl9JTVBMSUNJVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgJ14tPyg/OjB8WzEtOV1bMC05XSopJCcpXG5cbi8vIEV4cGxpY2l0IGAhIWludGAgdmFsaWRhdGlvbiBpcyBzZXBhcmF0ZSBmcm9tIEpTT04gaW1wbGljaXQgcmVzb2x1dGlvbi5cbmNvbnN0IFlBTUxfSU5URUdFUl9FWFBMSUNJVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgLy8gMGIxMDEwXG4gICdeKD86Wy0rXT8wYlswLTFdKycgK1xuICAvLyAwbzEyM1xuICAnfFstK10/MG9bMC03XSsnICtcbiAgLy8gMHgxQVxuICAnfFstK10/MHhbMC05YS1mQS1GXSsnICtcbiAgLy8gMTIzNDVcbiAgJ3xbLStdP1swLTldKykkJylcblxuZnVuY3Rpb24gcGFyc2VZYW1sSW50ZWdlciAoc291cmNlOiBzdHJpbmcpIHtcbiAgbGV0IHZhbHVlID0gc291cmNlXG4gIGxldCBzaWduID0gMVxuXG4gIGlmICh2YWx1ZVswXSA9PT0gJy0nIHx8IHZhbHVlWzBdID09PSAnKycpIHtcbiAgICBpZiAodmFsdWVbMF0gPT09ICctJykgc2lnbiA9IC0xXG4gICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgxKVxuICB9XG5cbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoJzBiJykpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIDIpXG4gIGlmICh2YWx1ZS5zdGFydHNXaXRoKCcwbycpKSByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCA4KVxuICBpZiAodmFsdWUuc3RhcnRzV2l0aCgnMHgnKSkgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgMTYpXG5cbiAgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZSwgMTApXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sSW50ZWdlciAoc291cmNlOiBzdHJpbmcsIGlzRXhwbGljaXQ6IGJvb2xlYW4pIHtcbiAgaWYgKGlzRXhwbGljaXQpIHtcbiAgICBpZiAoIVlBTUxfSU5URUdFUl9FWFBMSUNJVF9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICB9IGVsc2UgaWYgKCFZQU1MX0lOVEVHRVJfSU1QTElDSVRfUEFUVEVSTi50ZXN0KHNvdXJjZSkpIHtcbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH1cblxuICBjb25zdCByZXN1bHQgPSBwYXJzZVlhbWxJbnRlZ2VyKHNvdXJjZSlcbiAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZShyZXN1bHQpID8gcmVzdWx0IDogTk9UX1JFU09MVkVEXG59XG5cbmNvbnN0IGludEpzb25UYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsIHtcbiAgaW1wbGljaXQ6IHRydWUsXG4gIC8vIFN1cGVyc2V0IG9mIHNvdXJjZS5jaGFyQXQoMCkgb3ZlciBhbGwgbWF0Y2hlZCBpbnB1dHM6IG9wdGlvbmFsICctJyBvciBkaWdpdC5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJy0nLCAuLi4nMDEyMzQ1Njc4OSddLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbEludGVnZXIsXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PlxuICAgIC8vIE5vIGFuY2llbnQgYm94ZWQgbnVtYmVycyBzdXBwb3J0XG4gICAgTnVtYmVyLmlzSW50ZWdlcihvYmplY3QpICYmXG4gICAgLy8gTmVnYXRpdmUgemVybyA9PiAhIWZsb2F0XG4gICAgIU9iamVjdC5pcyhvYmplY3QsIC0wKSAmJlxuICAgIC8vIEV4cG9uZW50aWFsIGZvcm0gPT4gISFmbG9hdCwgcm91bmQtdHJpcCBmb3IgISFpbnQgMWUyMSB3aWxsIGJlIGJyb2tlblxuICAgIG9iamVjdC50b1N0cmluZygxMCkuaW5kZXhPZignZScpIDwgMCxcbiAgcmVwcmVzZW50OiAob2JqZWN0OiBudW1iZXIpID0+IG9iamVjdC50b1N0cmluZygxMClcbn0pXG5cbmV4cG9ydCB7IGludEpzb25UYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZywgTk9UX1JFU09MVkVEIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG5jb25zdCBZQU1MX0lOVEVHRVJfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gIC8vIDBiMTAxMFxuICAnXig/OlstK10/MGJbMC0xX10rJyArXG4gIC8vIDAxMjNcbiAgJ3xbLStdPzBbMC03X10rJyArXG4gIC8vIDB4MUFcbiAgJ3xbLStdPzB4WzAtOWEtZkEtRl9dKycgK1xuICAvLyAxOjIzXG4gICd8Wy0rXT9bMC05XVswLTlfXSooPzo6WzAtNV0/WzAtOV0pKycgK1xuICAvLyAxMjM0NVxuICAnfFstK10/KD86MHxbMS05XVswLTlfXSopKSQnKVxuXG5mdW5jdGlvbiBwYXJzZVlhbWxJbnRlZ2VyIChzb3VyY2U6IHN0cmluZykge1xuICBsZXQgdmFsdWUgPSBzb3VyY2UucmVwbGFjZSgvXy9nLCAnJylcbiAgbGV0IHNpZ24gPSAxXG5cbiAgaWYgKHZhbHVlWzBdID09PSAnLScgfHwgdmFsdWVbMF0gPT09ICcrJykge1xuICAgIGlmICh2YWx1ZVswXSA9PT0gJy0nKSBzaWduID0gLTFcbiAgICB2YWx1ZSA9IHZhbHVlLnNsaWNlKDEpXG4gIH1cblxuICBpZiAodmFsdWUuc3RhcnRzV2l0aCgnMGInKSkgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgMilcbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoJzB4JykpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIDE2KVxuXG4gIGlmICh2YWx1ZS5pbmNsdWRlcygnOicpKSB7XG4gICAgbGV0IHJlc3VsdCA9IDBcbiAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdmFsdWUuc3BsaXQoJzonKSkgcmVzdWx0ID0gcmVzdWx0ICogNjAgKyBOdW1iZXIocGFydClcbiAgICByZXR1cm4gc2lnbiAqIHJlc3VsdFxuICB9XG5cbiAgaWYgKHZhbHVlICE9PSAnMCcgJiYgdmFsdWVbMF0gPT09ICcwJykgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZSwgOClcblxuICByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLCAxMClcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxJbnRlZ2VyIChzb3VyY2U6IHN0cmluZykge1xuICBpZiAoIVlBTUxfSU5URUdFUl9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuXG4gIGNvbnN0IHJlc3VsdCA9IHBhcnNlWWFtbEludGVnZXIoc291cmNlKVxuICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHJlc3VsdCkgPyByZXN1bHQgOiBOT1RfUkVTT0xWRURcbn1cblxuY29uc3QgaW50WWFtbDExVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBTdXBlcnNldCBvZiBzb3VyY2UuY2hhckF0KDApIG92ZXIgYWxsIG1hdGNoZWQgaW5wdXRzOiBvcHRpb25hbCBzaWduICsgZGVjaW1hbCBkaWdpdC5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJy0nLCAnKycsIC4uLicwMTIzNDU2Nzg5J10sXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sSW50ZWdlcixcbiAgaWRlbnRpZnk6IChvYmplY3QpID0+XG4gICAgLy8gTm8gYW5jaWVudCBib3hlZCBudW1iZXJzIHN1cHBvcnRcbiAgICBOdW1iZXIuaXNJbnRlZ2VyKG9iamVjdCkgJiZcbiAgICAvLyBOZWdhdGl2ZSB6ZXJvID0+ICEhZmxvYXRcbiAgICAhT2JqZWN0LmlzKG9iamVjdCwgLTApICYmXG4gICAgLy8gRXhwb25lbnRpYWwgZm9ybSA9PiAhIWZsb2F0LCByb3VuZC10cmlwIGZvciAhIWludCAxZTIxIHdpbGwgYmUgYnJva2VuXG4gICAgb2JqZWN0LnRvU3RyaW5nKDEwKS5pbmRleE9mKCdlJykgPCAwLFxuICByZXByZXNlbnQ6IChvYmplY3Q6IG51bWJlcikgPT4gb2JqZWN0LnRvU3RyaW5nKDEwKVxufSlcblxuZXhwb3J0IHsgaW50WWFtbDExVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgWUFNTF9GTE9BVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgLy8gMi41ZTQsIDIuNSBhbmQgaW50ZWdlcnNcbiAgJ14oPzpbLStdP1swLTldKyg/OlxcXFwuWzAtOV0qKT8oPzpbZUVdWy0rXT9bMC05XSspPycgK1xuICAvLyAuMmU0LCAuMlxuICAnfFstK10/XFxcXC5bMC05XSsoPzpbZUVdWy0rXT9bMC05XSspPycgK1xuICAvLyAuaW5mXG4gICd8Wy0rXT9cXFxcLig/OmluZnxJbmZ8SU5GKScgK1xuICAvLyAubmFuXG4gICd8XFxcXC4oPzpuYW58TmFOfE5BTikpJCcpXG5cbmNvbnN0IFlBTUxfRkxPQVRfU1BFQ0lBTF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgJ14oPzonICtcbiAgLy8gLmluZlxuICAnWy0rXT9cXFxcLig/OmluZnxJbmZ8SU5GKScgK1xuICAvLyAubmFuXG4gICd8XFxcXC4oPzpuYW58TmFOfE5BTikpJCcpXG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sRmxvYXQgKHNvdXJjZTogc3RyaW5nKSB7XG4gIGlmICghWUFNTF9GTE9BVF9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuXG4gIGxldCB2YWx1ZSA9IHNvdXJjZS50b0xvd2VyQ2FzZSgpXG4gIGNvbnN0IHNpZ24gPSB2YWx1ZVswXSA9PT0gJy0nID8gLTEgOiAxXG5cbiAgaWYgKCcrLScuaW5jbHVkZXModmFsdWVbMF0pKSB2YWx1ZSA9IHZhbHVlLnNsaWNlKDEpXG5cbiAgaWYgKHZhbHVlID09PSAnLmluZicpIHJldHVybiBzaWduID09PSAxID8gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZIDogTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZXG4gIGlmICh2YWx1ZSA9PT0gJy5uYW4nKSByZXR1cm4gTmFOXG5cbiAgY29uc3QgcmVzdWx0ID0gc2lnbiAqIHBhcnNlRmxvYXQodmFsdWUpXG5cbiAgaWYgKE51bWJlci5pc0Zpbml0ZShyZXN1bHQpIHx8IFlBTUxfRkxPQVRfU1BFQ0lBTF9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIHJlc3VsdFxuICByZXR1cm4gTk9UX1JFU09MVkVEXG59XG5cbmZ1bmN0aW9uIHJlcHJlc2VudFlhbWxGbG9hdCAob2JqZWN0OiBudW1iZXIpIHtcbiAgaWYgKGlzTmFOKG9iamVjdCkpIHJldHVybiAnLm5hbidcbiAgaWYgKG9iamVjdCA9PT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSByZXR1cm4gJy5pbmYnXG4gIGlmIChvYmplY3QgPT09IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSkgcmV0dXJuICctLmluZidcbiAgaWYgKE9iamVjdC5pcyhvYmplY3QsIC0wKSkgcmV0dXJuICctMC4wJ1xuXG4gIGNvbnN0IHJlc3VsdCA9IG9iamVjdC50b1N0cmluZygxMClcbiAgcmV0dXJuIC9eWy0rXT9bMC05XStlLy50ZXN0KHJlc3VsdCkgPyByZXN1bHQucmVwbGFjZSgnZScsICcuZScpIDogcmVzdWx0XG59XG5cbmNvbnN0IGZsb2F0Q29yZVRhZyA9IGRlZmluZVNjYWxhclRhZygndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBTdXBlcnNldCBvZiBzb3VyY2UuY2hhckF0KDApIG92ZXIgYWxsIG1hdGNoZWQgaW5wdXRzOiBvcHRpb25hbCBzaWduLCAnLicsIG9yIGRpZ2l0XG4gIC8vICgnLmluZicvJy5uYW4nIHN0YXJ0IHdpdGggJy4nKS5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJy0nLCAnKycsICcuJywgLi4uJzAxMjM0NTY3ODknXSxcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxGbG9hdCxcbiAgaWRlbnRpZnk6IChvYmplY3QpID0+XG4gICAgLy8gTm8gYW5jaWVudCBib3hlZCBudW1iZXJzIHN1cHBvcnRcbiAgICB0eXBlb2Ygb2JqZWN0ID09PSAnbnVtYmVyJyAmJlxuICAgIChcbiAgICAgIC8vIFdlIGxhbmQgaGVyZSBhbGwgbnVtYmVycywgbm90IGhhbmRsZWQgKGRlY2xpbmVkKSBieSAhIWludCBgLmlkZW50aWZ5YFxuICAgICAgLy8gVGhlIHNhbWUgY29uZGl0aW9uIGFzIGZvciAhIWludCwgYnV0IHJldmVyc2VkLlxuXG4gICAgICAvLyBGaWx0ZXIgb3V0IGludGVnZXJzLi4uXG4gICAgICAhTnVtYmVyLmlzSW50ZWdlcihvYmplY3QpIHx8XG4gICAgICAvLyBidXQgYWxsb3cgbmVnYXRpdmUgemVyb1xuICAgICAgT2JqZWN0LmlzKG9iamVjdCwgLTApIHx8XG4gICAgICAvLyBhbmQgaW50ZWdlcnMgd2l0aCBleHBvbmVudGlhbCBmb3JtXG4gICAgICBvYmplY3QudG9TdHJpbmcoMTApLmluZGV4T2YoJ2UnKSA+PSAwXG4gICAgKSxcbiAgcmVwcmVzZW50OiByZXByZXNlbnRZYW1sRmxvYXRcbn0pXG5cbmV4cG9ydCB7IGZsb2F0Q29yZVRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbi8vIFlBTUwgMS4yIEpTT04gc2NoZW1hIGltcGxpY2l0IHJlc29sdXRpb246XG4vLyAtPyAoIDAgfCBbMS05XSBbMC05XSogKSAoIFxcLiBbMC05XSogKT8gKCBbZUVdIFstK10/IFswLTldKyApP1xuY29uc3QgWUFNTF9GTE9BVF9JTVBMSUNJVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgLy8gMi41ZTQsIDIuNSBhbmQgaW50ZWdlcnNcbiAgJ14tPyg/OjB8WzEtOV1bMC05XSopKD86XFxcXC5bMC05XSopPyg/OltlRV1bLStdP1swLTldKyk/JCcpXG5cbi8vIEV4cGxpY2l0IGAhIWZsb2F0YCB2YWxpZGF0aW9uIGlzIHNlcGFyYXRlIGZyb20gSlNPTiBpbXBsaWNpdCByZXNvbHV0aW9uLlxuY29uc3QgWUFNTF9GTE9BVF9FWFBMSUNJVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgLy8gMi41ZTQsIDIuNSBhbmQgaW50ZWdlcnNcbiAgJ14oPzpbLStdP1swLTldKyg/OlxcXFwuWzAtOV0qKT8oPzpbZUVdWy0rXT9bMC05XSspPycgK1xuICAvLyAuMmU0LCAuMlxuICAnfFstK10/XFxcXC5bMC05XSsoPzpbZUVdWy0rXT9bMC05XSspPycgK1xuICAvLyAuaW5mXG4gICd8Wy0rXT9cXFxcLig/OmluZnxJbmZ8SU5GKScgK1xuICAvLyAubmFuXG4gICd8XFxcXC4oPzpuYW58TmFOfE5BTikpJCcpXG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sRmxvYXQgKHNvdXJjZTogc3RyaW5nLCBpc0V4cGxpY2l0OiBib29sZWFuKSB7XG4gIGlmIChpc0V4cGxpY2l0KSB7XG4gICAgaWYgKCFZQU1MX0ZMT0FUX0VYUExJQ0lUX1BBVFRFUk4udGVzdChzb3VyY2UpKSByZXR1cm4gTk9UX1JFU09MVkVEXG5cbiAgICBsZXQgdmFsdWUgPSBzb3VyY2UudG9Mb3dlckNhc2UoKVxuICAgIGNvbnN0IHNpZ24gPSB2YWx1ZVswXSA9PT0gJy0nID8gLTEgOiAxXG5cbiAgICBpZiAoJystJy5pbmNsdWRlcyh2YWx1ZVswXSkpIHZhbHVlID0gdmFsdWUuc2xpY2UoMSlcblxuICAgIGlmICh2YWx1ZSA9PT0gJy5pbmYnKSByZXR1cm4gc2lnbiA9PT0gMSA/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA6IE51bWJlci5ORUdBVElWRV9JTkZJTklUWVxuICAgIGlmICh2YWx1ZSA9PT0gJy5uYW4nKSByZXR1cm4gTmFOXG5cbiAgICBjb25zdCByZXN1bHQgPSBzaWduICogcGFyc2VGbG9hdCh2YWx1ZSlcbiAgICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHJlc3VsdCkgPyByZXN1bHQgOiBOT1RfUkVTT0xWRURcbiAgfVxuXG4gIGlmICghWUFNTF9GTE9BVF9JTVBMSUNJVF9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuXG4gIGNvbnN0IHJlc3VsdCA9IE51bWJlcihzb3VyY2UpXG5cbiAgaWYgKE51bWJlci5pc0Zpbml0ZShyZXN1bHQpKSByZXR1cm4gcmVzdWx0XG4gIHJldHVybiBOT1RfUkVTT0xWRURcbn1cblxuZnVuY3Rpb24gcmVwcmVzZW50WWFtbEZsb2F0IChvYmplY3Q6IG51bWJlcikge1xuICBpZiAoaXNOYU4ob2JqZWN0KSkgcmV0dXJuICcubmFuJ1xuICBpZiAob2JqZWN0ID09PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpIHJldHVybiAnLmluZidcbiAgaWYgKG9iamVjdCA9PT0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKSByZXR1cm4gJy0uaW5mJ1xuICBpZiAoT2JqZWN0LmlzKG9iamVjdCwgLTApKSByZXR1cm4gJy0wLjAnXG5cbiAgY29uc3QgcmVzdWx0ID0gb2JqZWN0LnRvU3RyaW5nKDEwKVxuICByZXR1cm4gL15bLStdP1swLTldK2UvLnRlc3QocmVzdWx0KSA/IHJlc3VsdC5yZXBsYWNlKCdlJywgJy5lJykgOiByZXN1bHRcbn1cblxuY29uc3QgZmxvYXRKc29uVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsIHtcbiAgaW1wbGljaXQ6IHRydWUsXG4gIC8vIFN1cGVyc2V0IG9mIHNvdXJjZS5jaGFyQXQoMCkgb3ZlciBhbGwgbWF0Y2hlZCBpbnB1dHM6IG9wdGlvbmFsICctJyBvciBkaWdpdC5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJy0nLCAuLi4nMDEyMzQ1Njc4OSddLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbEZsb2F0LFxuICBpZGVudGlmeTogKG9iamVjdCkgPT5cbiAgICAvLyBObyBhbmNpZW50IGJveGVkIG51bWJlcnMgc3VwcG9ydFxuICAgIHR5cGVvZiBvYmplY3QgPT09ICdudW1iZXInICYmXG4gICAgKFxuICAgICAgLy8gV2UgbGFuZCBoZXJlIGFsbCBudW1iZXJzLCBub3QgaGFuZGxlZCAoZGVjbGluZWQpIGJ5ICEhaW50IGAuaWRlbnRpZnlgXG4gICAgICAvLyBUaGUgc2FtZSBjb25kaXRpb24gYXMgZm9yICEhaW50LCBidXQgcmV2ZXJzZWQuXG5cbiAgICAgIC8vIEZpbHRlciBvdXQgaW50ZWdlcnMuLi5cbiAgICAgICFOdW1iZXIuaXNJbnRlZ2VyKG9iamVjdCkgfHxcbiAgICAgIC8vIGJ1dCBhbGxvdyBuZWdhdGl2ZSB6ZXJvXG4gICAgICBPYmplY3QuaXMob2JqZWN0LCAtMCkgfHxcbiAgICAgIC8vIGFuZCBpbnRlZ2VycyB3aXRoIGV4cG9uZW50aWFsIGZvcm1cbiAgICAgIG9iamVjdC50b1N0cmluZygxMCkuaW5kZXhPZignZScpID49IDBcbiAgICApLFxuICByZXByZXNlbnQ6IHJlcHJlc2VudFlhbWxGbG9hdFxufSlcblxuZXhwb3J0IHsgZmxvYXRKc29uVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgWUFNTF9GTE9BVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgLy8gMi41ZTQsIDIuNSBhbmQgaW50ZWdlcnNcbiAgJ14oPzpbLStdPyg/Oig/OlswLTldWzAtOV9dKik/XFxcXC5bMC05X10qKSg/OltlRV1bLStdWzAtOV0rKT8nICtcbiAgLy8gMTkwOjIwOjMwLjE1XG4gICd8Wy0rXT9bMC05XVswLTlfXSooPzo6WzAtNV0/WzAtOV0pK1xcXFwuWzAtOV9dKicgK1xuICAvLyAuaW5mXG4gICd8Wy0rXT9cXFxcLig/OmluZnxJbmZ8SU5GKScgK1xuICAvLyAubmFuXG4gICd8XFxcXC4oPzpuYW58TmFOfE5BTikpJCcpXG5cbmNvbnN0IFlBTUxfRkxPQVRfU1BFQ0lBTF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgJ14oPzonICtcbiAgLy8gLmluZlxuICAnWy0rXT9cXFxcLig/OmluZnxJbmZ8SU5GKScgK1xuICAvLyAubmFuXG4gICd8XFxcXC4oPzpuYW58TmFOfE5BTikpJCcpXG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sRmxvYXQgKHNvdXJjZTogc3RyaW5nKSB7XG4gIGlmICghWUFNTF9GTE9BVF9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuXG4gIGxldCB2YWx1ZSA9IHNvdXJjZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL18vZywgJycpXG4gIGNvbnN0IHNpZ24gPSB2YWx1ZVswXSA9PT0gJy0nID8gLTEgOiAxXG5cbiAgaWYgKCcrLScuaW5jbHVkZXModmFsdWVbMF0pKSB2YWx1ZSA9IHZhbHVlLnNsaWNlKDEpXG5cbiAgaWYgKHZhbHVlID09PSAnLmluZicpIHJldHVybiBzaWduID09PSAxID8gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZIDogTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZXG4gIGlmICh2YWx1ZSA9PT0gJy5uYW4nKSByZXR1cm4gTmFOXG5cbiAgbGV0IHJlc3VsdCA9IDBcblxuICBpZiAodmFsdWUuaW5jbHVkZXMoJzonKSkge1xuICAgIGZvciAoY29uc3QgcGFydCBvZiB2YWx1ZS5zcGxpdCgnOicpKSByZXN1bHQgPSByZXN1bHQgKiA2MCArIE51bWJlcihwYXJ0KVxuICAgIHJlc3VsdCAqPSBzaWduXG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gc2lnbiAqIHBhcnNlRmxvYXQodmFsdWUpXG4gIH1cblxuICBpZiAoTnVtYmVyLmlzRmluaXRlKHJlc3VsdCkgfHwgWUFNTF9GTE9BVF9TUEVDSUFMX1BBVFRFUk4udGVzdChzb3VyY2UpKSByZXR1cm4gcmVzdWx0XG4gIHJldHVybiBOT1RfUkVTT0xWRURcbn1cblxuZnVuY3Rpb24gcmVwcmVzZW50WWFtbEZsb2F0IChvYmplY3Q6IG51bWJlcikge1xuICBpZiAoaXNOYU4ob2JqZWN0KSkgcmV0dXJuICcubmFuJ1xuICBpZiAob2JqZWN0ID09PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpIHJldHVybiAnLmluZidcbiAgaWYgKG9iamVjdCA9PT0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKSByZXR1cm4gJy0uaW5mJ1xuICBpZiAoT2JqZWN0LmlzKG9iamVjdCwgLTApKSByZXR1cm4gJy0wLjAnXG5cbiAgY29uc3QgcmVzdWx0ID0gb2JqZWN0LnRvU3RyaW5nKDEwKVxuICByZXR1cm4gL15bLStdP1swLTldK2UvLnRlc3QocmVzdWx0KSA/IHJlc3VsdC5yZXBsYWNlKCdlJywgJy5lJykgOiByZXN1bHRcbn1cblxuY29uc3QgZmxvYXRZYW1sMTFUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0Jywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0czogb3B0aW9uYWwgc2lnbiwgJy4nLCBvciBkaWdpdFxuICAvLyAoJy5pbmYnLycubmFuJyBzdGFydCB3aXRoICcuJykuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWyctJywgJysnLCAnLicsIC4uLicwMTIzNDU2Nzg5J10sXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sRmxvYXQsXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PlxuICAgIC8vIE5vIGFuY2llbnQgYm94ZWQgbnVtYmVycyBzdXBwb3J0XG4gICAgdHlwZW9mIG9iamVjdCA9PT0gJ251bWJlcicgJiZcbiAgICAoXG4gICAgICAvLyBXZSBsYW5kIGhlcmUgYWxsIG51bWJlcnMsIG5vdCBoYW5kbGVkIChkZWNsaW5lZCkgYnkgISFpbnQgYC5pZGVudGlmeWBcbiAgICAgIC8vIFRoZSBzYW1lIGNvbmRpdGlvbiBhcyBmb3IgISFpbnQsIGJ1dCByZXZlcnNlZC5cblxuICAgICAgLy8gRmlsdGVyIG91dCBpbnRlZ2Vycy4uLlxuICAgICAgIU51bWJlci5pc0ludGVnZXIob2JqZWN0KSB8fFxuICAgICAgLy8gYnV0IGFsbG93IG5lZ2F0aXZlIHplcm9cbiAgICAgIE9iamVjdC5pcyhvYmplY3QsIC0wKSB8fFxuICAgICAgLy8gYW5kIGludGVnZXJzIHdpdGggZXhwb25lbnRpYWwgZm9ybVxuICAgICAgb2JqZWN0LnRvU3RyaW5nKDEwKS5pbmRleE9mKCdlJykgPj0gMFxuICAgICksXG4gIHJlcHJlc2VudDogcmVwcmVzZW50WWFtbEZsb2F0XG59KVxuXG5leHBvcnQgeyBmbG9hdFlhbWwxMVRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBNRVJHRV9LRVksIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgbWVyZ2VUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOm1lcmdlJywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gc291cmNlLmNoYXJBdCgwKSBvdmVyIG1hdGNoZWQgaW1wbGljaXQgaW5wdXRzOiAnPCcgKCc8PCcpLlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IFsnPCddLFxuICByZXNvbHZlOiAoc291cmNlLCBpc0V4cGxpY2l0KSA9PiB7XG4gICAgaWYgKHNvdXJjZSA9PT0gJzw8JyB8fCAoaXNFeHBsaWNpdCAmJiBzb3VyY2UgPT09ICcnKSkgcmV0dXJuIE1FUkdFX0tFWVxuICAgIHJldHVybiBOT1RfUkVTT0xWRURcbiAgfVxufSlcblxuZXhwb3J0IHsgbWVyZ2VUYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZywgTk9UX1JFU09MVkVEIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG5jb25zdCBCQVNFNjRfUEFUVEVSTiA9IC9eW0EtWmEtejAtOSsvXSo9ezAsMn0kL1xuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEJpbmFyeSAoc291cmNlOiBzdHJpbmcpIHtcbiAgLy8gU3RyaXAgYWxsb3dlZCB3aGl0ZXNwYWNlIGZpcnN0LCBzbyB2YWxpZGF0aW9uIHN0YXlzIGEgcGxhaW4gYmFzZTY0IGNoZWNrLlxuICBjb25zdCBpbnB1dCA9IHNvdXJjZS5yZXBsYWNlKC9cXHMvZywgJycpXG4gIGlmIChpbnB1dC5sZW5ndGggJSA0ICE9PSAwIHx8ICFCQVNFNjRfUEFUVEVSTi50ZXN0KGlucHV0KSkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuXG4gIGNvbnN0IGJpbmFyeSA9IGF0b2IoaW5wdXQpXG4gIGNvbnN0IHJlc3VsdCA9IG5ldyBVaW50OEFycmF5KGJpbmFyeS5sZW5ndGgpXG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBiaW5hcnkubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGJpbmFyeS5jaGFyQ29kZUF0KGluZGV4KVxuICB9XG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gcmVwcmVzZW50WWFtbEJpbmFyeSAob2JqZWN0OiBVaW50OEFycmF5KSB7XG4gIGxldCBiaW5hcnkgPSAnJ1xuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgb2JqZWN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKG9iamVjdFtpbmRleF0pXG4gIH1cbiAgcmV0dXJuIGJ0b2EoYmluYXJ5KVxufVxuXG5jb25zdCBiaW5hcnlUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOmJpbmFyeScsIHtcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxCaW5hcnksXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICByZXByZXNlbnQ6IHJlcHJlc2VudFlhbWxCaW5hcnlcbn0pXG5cbmV4cG9ydCB7IGJpbmFyeVRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IFlBTUxfREFURV9SRUdFWFAgPSBuZXcgUmVnRXhwKFxuICAnXihbMC05XVswLTldWzAtOV1bMC05XSktKFswLTldWzAtOV0pLShbMC05XVswLTldKSQnKVxuXG5jb25zdCBZQU1MX1RJTUVTVEFNUF9SRUdFWFAgPSBuZXcgUmVnRXhwKFxuICAnXihbMC05XVswLTldWzAtOV1bMC05XSknICtcbiAgJy0oWzAtOV1bMC05XT8pJyArXG4gICctKFswLTldWzAtOV0/KScgK1xuICAnKD86W1R0XXxbIFxcXFx0XSspJyArXG4gICcoWzAtOV1bMC05XT8pJyArXG4gICc6KFswLTldWzAtOV0pJyArXG4gICc6KFswLTldWzAtOV0pJyArXG4gICcoPzpcXFxcLihbMC05XSopKT8nICtcbiAgJyg/OlsgXFxcXHRdKihafChbLStdKShbMC05XVswLTldPyknICtcbiAgJyg/OjooWzAtOV1bMC05XSkpPykpPyQnKVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbFRpbWVzdGFtcCAoc291cmNlOiBzdHJpbmcpIHtcbiAgbGV0IG1hdGNoID0gWUFNTF9EQVRFX1JFR0VYUC5leGVjKHNvdXJjZSlcbiAgaWYgKG1hdGNoID09PSBudWxsKSBtYXRjaCA9IFlBTUxfVElNRVNUQU1QX1JFR0VYUC5leGVjKHNvdXJjZSlcbiAgaWYgKG1hdGNoID09PSBudWxsKSByZXR1cm4gTk9UX1JFU09MVkVEXG5cbiAgY29uc3QgeWVhciA9ICsobWF0Y2hbMV0pXG4gIGNvbnN0IG1vbnRoID0gKyhtYXRjaFsyXSkgLSAxXG4gIGNvbnN0IGRheSA9ICsobWF0Y2hbM10pXG5cbiAgLy8gRGF0ZS1vbmx5IGZvcm0gKGBZWVlZLU1NLUREYCkgaGFzIG5vIHRpbWUgY2FwdHVyZXMuXG4gIGlmICghbWF0Y2hbNF0pIHtcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoRGF0ZS5VVEMoeWVhciwgbW9udGgsIGRheSkpXG4gICAgLy8gUmVqZWN0IGRhdGVzIHRoYXQgSlMgd291bGQgbm9ybWFsaXplLCBlLmcuIDIwMjMtMDItMjkgLT4gMjAyMy0wMy0wMS5cbiAgICBpZiAoZGF0ZS5nZXRVVENGdWxsWWVhcigpICE9PSB5ZWFyIHx8IGRhdGUuZ2V0VVRDTW9udGgoKSAhPT0gbW9udGggfHwgZGF0ZS5nZXRVVENEYXRlKCkgIT09IGRheSkge1xuICAgICAgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICAgIH1cbiAgICByZXR1cm4gZGF0ZVxuICB9XG5cbiAgY29uc3QgaG91ciA9ICsobWF0Y2hbNF0pXG4gIGNvbnN0IG1pbnV0ZSA9ICsobWF0Y2hbNV0pXG4gIGNvbnN0IHNlY29uZCA9ICsobWF0Y2hbNl0pXG4gIGxldCBmcmFjdGlvbiA9IDBcblxuICAvLyBSZWplY3QgdGltZXMgdGhhdCBKUyB3b3VsZCBub3JtYWxpemUgaW50byB0aGUgbmV4dCBtaW51dGUvaG91ci9kYXkuXG4gIGlmIChob3VyID4gMjMgfHwgbWludXRlID4gNTkgfHwgc2Vjb25kID4gNTkpIHJldHVybiBOT1RfUkVTT0xWRURcblxuICBpZiAobWF0Y2hbN10pIHtcbiAgICBsZXQgdmFsdWUgPSBtYXRjaFs3XS5zbGljZSgwLCAzKVxuICAgIHdoaWxlICh2YWx1ZS5sZW5ndGggPCAzKSB2YWx1ZSArPSAnMCdcbiAgICBmcmFjdGlvbiA9ICt2YWx1ZVxuICB9XG5cbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBmcmFjdGlvbikpXG5cbiAgLy8gUmVqZWN0IGludmFsaWQgY2FsZW5kYXIgZGF0ZXMgYmVmb3JlIGFwcGx5aW5nIHRpbWV6b25lIG9mZnNldC5cbiAgaWYgKGRhdGUuZ2V0VVRDRnVsbFllYXIoKSAhPT0geWVhciB8fCBkYXRlLmdldFVUQ01vbnRoKCkgIT09IG1vbnRoIHx8IGRhdGUuZ2V0VVRDRGF0ZSgpICE9PSBkYXkpIHtcbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH1cblxuICBpZiAobWF0Y2hbOV0pIHtcbiAgICBjb25zdCBvZmZzZXRIb3VyID0gKyhtYXRjaFsxMF0pXG4gICAgY29uc3Qgb2Zmc2V0TWludXRlID0gKyhtYXRjaFsxMV0gfHwgMClcbiAgICAvLyBSZWplY3QgdGltZXpvbmUgb2Zmc2V0cyB0aGF0IEpTIGRhdGUgYXJpdGhtZXRpYyB3b3VsZCBvdGhlcndpc2UgYWNjZXB0LlxuICAgIGlmIChvZmZzZXRIb3VyID4gMjMgfHwgb2Zmc2V0TWludXRlID4gNTkpIHJldHVybiBOT1RfUkVTT0xWRURcblxuICAgIGNvbnN0IG9mZnNldCA9IChvZmZzZXRIb3VyICogNjAgKyBvZmZzZXRNaW51dGUpICogNjAwMDBcbiAgICBkYXRlLnNldFRpbWUoZGF0ZS5nZXRUaW1lKCkgLSAobWF0Y2hbOV0gPT09ICctJyA/IC1vZmZzZXQgOiBvZmZzZXQpKVxuICB9XG5cbiAgcmV0dXJuIGRhdGVcbn1cblxuY29uc3QgdGltZXN0YW1wVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjp0aW1lc3RhbXAnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBCb3RoIHBhdHRlcm5zIHN0YXJ0IHdpdGggYSA0LWRpZ2l0IHllYXIsIHNvIHNvdXJjZS5jaGFyQXQoMCkgaXMgYWx3YXlzIGEgZGlnaXQuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWy4uLicwMTIzNDU2Nzg5J10sXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sVGltZXN0YW1wLFxuICBpZGVudGlmeTogKG9iamVjdCkgPT4gb2JqZWN0IGluc3RhbmNlb2YgRGF0ZSxcbiAgcmVwcmVzZW50OiAob2JqZWN0OiBEYXRlKSA9PiBvYmplY3QudG9JU09TdHJpbmcoKVxufSlcblxuZXhwb3J0IHsgdGltZXN0YW1wVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTZXF1ZW5jZVRhZyB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3Qgc2VxVGFnID0gZGVmaW5lU2VxdWVuY2VUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOnNlcScsIHtcbiAgY3JlYXRlOiAoKSA9PiBbXSBhcyB1bmtub3duW10sXG4gIGFkZEl0ZW06IChjb250YWluZXIsIGl0ZW0pID0+IHtcbiAgICBjb250YWluZXIucHVzaChpdGVtKVxuICB9LFxuICBpZGVudGlmeTogQXJyYXkuaXNBcnJheVxufSlcblxuZXhwb3J0IHsgc2VxVGFnIH1cbiIsICJmdW5jdGlvbiBpc1BsYWluT2JqZWN0IChkYXRhOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGlmIChkYXRhID09PSBudWxsIHx8IHR5cGVvZiBkYXRhICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KGRhdGEpKSByZXR1cm4gZmFsc2VcbiAgY29uc3QgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGRhdGEpXG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlXG59XG5cbi8vIFByb2plY3QgYG9iamVjdGAgb250byBga2V5c2AuIEFic2VudCBrZXlzIGFyZSBza2lwcGVkIChzbyB0aGUgcmVzdWx0IGNhbiBiZVxuLy8gc2FmZWx5IHNwcmVhZCBvdmVyIGRlZmF1bHRzIHdpdGhvdXQgY2xvYmJlcmluZyB0aGVtIHdpdGggYHVuZGVmaW5lZGApLCBoZW5jZVxuLy8gdGhlIGBQYXJ0aWFsYCByZXR1cm4uXG5mdW5jdGlvbiBwaWNrPFQgZXh0ZW5kcyBvYmplY3QsIEsgZXh0ZW5kcyBrZXlvZiBUPiAob2JqZWN0OiBULCBrZXlzOiByZWFkb25seSBLW10pOiBQYXJ0aWFsPFBpY2s8VCwgSz4+IHtcbiAgY29uc3QgcmVzdWx0OiBQYXJ0aWFsPFBpY2s8VCwgSz4+ID0ge31cbiAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgIGlmIChvYmplY3Rba2V5XSAhPT0gdW5kZWZpbmVkKSByZXN1bHRba2V5XSA9IG9iamVjdFtrZXldXG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5leHBvcnQge1xuICBpc1BsYWluT2JqZWN0LFxuICBwaWNrXG59XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2VxdWVuY2VUYWcgfSBmcm9tICcuLi8uLi90YWcudHMnXG5pbXBvcnQgeyBpc1BsYWluT2JqZWN0IH0gZnJvbSAnLi4vLi4vY29tbW9uL29iamVjdC50cydcblxuaW50ZXJmYWNlIE9tYXBDYXJyaWVyIHtcbiAgbGlzdDogdW5rbm93bltdXG4gIHNlZW46IFNldDx1bmtub3duPlxufVxuXG5jb25zdCBvbWFwVGFnID0gZGVmaW5lU2VxdWVuY2VUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOm9tYXAnLCB7XG4gIGNyZWF0ZTogKCk6IE9tYXBDYXJyaWVyID0+ICh7IGxpc3Q6IFtdLCBzZWVuOiBuZXcgU2V0KCkgfSksXG4gIGFkZEl0ZW06IChjYXJyaWVyLCBpdGVtKSA9PiB7XG4gICAgbGV0IGtleTogdW5rbm93blxuXG4gICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgIGlmIChpdGVtLnNpemUgIT09IDEpIHJldHVybiAnY2Fubm90IHJlc29sdmUgYW4gb3JkZXJlZCBtYXAgaXRlbSdcbiAgICAgIGtleSA9IGl0ZW0ua2V5cygpLm5leHQoKS52YWx1ZVxuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdChpdGVtKSkge1xuICAgICAgY29uc3QgaXRlbUtleXMgPSBPYmplY3Qua2V5cyhpdGVtIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVxuICAgICAgaWYgKGl0ZW1LZXlzLmxlbmd0aCAhPT0gMSkgcmV0dXJuICdjYW5ub3QgcmVzb2x2ZSBhbiBvcmRlcmVkIG1hcCBpdGVtJ1xuICAgICAga2V5ID0gaXRlbUtleXNbMF1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdjYW5ub3QgcmVzb2x2ZSBhbiBvcmRlcmVkIG1hcCBpdGVtJ1xuICAgIH1cblxuICAgIGlmIChjYXJyaWVyLnNlZW4uaGFzKGtleSkpIHJldHVybiAnZHVwbGljYXRlIGtleSBpbiBvcmRlcmVkIG1hcCdcbiAgICBjYXJyaWVyLnNlZW4uYWRkKGtleSlcbiAgICBjYXJyaWVyLmxpc3QucHVzaChpdGVtKVxuICAgIHJldHVybiAnJ1xuICB9LFxuICBmaW5hbGl6ZTogKGNhcnJpZXIpOiB1bmtub3duW10gPT4gY2Fycmllci5saXN0XG59KVxuXG5leHBvcnQgeyBvbWFwVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTZXF1ZW5jZVRhZyB9IGZyb20gJy4uLy4uL3RhZy50cydcblxudHlwZSBQYWlyID0gW3Vua25vd24sIHVua25vd25dXG5cbmNvbnN0IHBhaXJzVGFnID0gZGVmaW5lU2VxdWVuY2VUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOnBhaXJzJywge1xuICBjcmVhdGU6ICgpID0+IFtdIGFzIFBhaXJbXSxcbiAgYWRkSXRlbTogKGNvbnRhaW5lciwgaXRlbSkgPT4ge1xuICAgIGlmIChpdGVtIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICBpZiAoaXRlbS5zaXplICE9PSAxKSByZXR1cm4gJ2Nhbm5vdCByZXNvbHZlIGEgcGFpcnMgaXRlbSdcblxuICAgICAgY29udGFpbmVyLnB1c2goaXRlbS5lbnRyaWVzKCkubmV4dCgpLnZhbHVlISlcbiAgICAgIHJldHVybiAnJ1xuICAgIH1cblxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaXRlbSkgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICByZXR1cm4gJ2Nhbm5vdCByZXNvbHZlIGEgcGFpcnMgaXRlbSdcbiAgICB9XG5cbiAgICBjb25zdCBvYmplY3QgPSBpdGVtIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdClcblxuICAgIGlmIChrZXlzLmxlbmd0aCAhPT0gMSkgcmV0dXJuICdjYW5ub3QgcmVzb2x2ZSBhIHBhaXJzIGl0ZW0nXG5cbiAgICBjb250YWluZXIucHVzaChba2V5c1swXSwgb2JqZWN0W2tleXNbMF1dXSBzYXRpc2ZpZXMgUGFpcilcbiAgICByZXR1cm4gJydcbiAgfVxufSlcblxuZXhwb3J0IHsgcGFpcnNUYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZU1hcHBpbmdUYWcgfSBmcm9tICcuLi8uLi90YWcudHMnXG5pbXBvcnQgeyBpc1BsYWluT2JqZWN0IH0gZnJvbSAnLi4vLi4vY29tbW9uL29iamVjdC50cydcblxudHlwZSBTdHJpbmdNYXBwaW5nID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj5cblxuY29uc3QgbWFwVGFnID0gZGVmaW5lTWFwcGluZ1RhZygndGFnOnlhbWwub3JnLDIwMDI6bWFwJywge1xuICBjcmVhdGU6ICgpOiBTdHJpbmdNYXBwaW5nID0+ICh7fSksXG4gIGlkZW50aWZ5OiBpc1BsYWluT2JqZWN0LFxuICAvLyBEdW1wIHNpZGU6IHdyYXAgdGhlIHBsYWluIG9iamVjdCBpbnRvIHRoZSBjYW5vbmljYWwgYE1hcGAgZm9ybSB0aGUgd3JpdGVyXG4gIC8vIHdhbGtzLiBTaGFsbG93IOKAlCBrZXlzL3ZhbHVlcyBzdGF5IHJlZmVyZW5jZXMgdG8gdGhlIG9yaWdpbmFscy5cbiAgcmVwcmVzZW50OiAobzogU3RyaW5nTWFwcGluZykgPT4ge1xuICAgIGNvbnN0IG1hcCA9IG5ldyBNYXA8c3RyaW5nLCB1bmtub3duPigpXG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMobykpIG1hcC5zZXQoa2V5LCBvW2tleV0pXG4gICAgcmV0dXJuIG1hcFxuICB9LFxuICBhZGRQYWlyOiAoY29udGFpbmVyLCBrZXksIHZhbHVlKSA9PiB7XG4gICAgaWYgKGtleSAhPT0gbnVsbCAmJiB0eXBlb2Yga2V5ID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuICdvYmplY3QtYmFzZWQgbWFwIGRvZXMgbm90IHN1cHBvcnQgY29tcGxleCBrZXlzJ1xuICAgIH1cbiAgICBjb25zdCBub3JtYWxpemVkS2V5ID0gU3RyaW5nKGtleSlcbiAgICBpZiAobm9ybWFsaXplZEtleSA9PT0gJ19fcHJvdG9fXycpIHtcbiAgICAgIC8vIERlZmluZSBhcyBhbiBvd24gZGF0YSBwcm9wZXJ0eSBzbyBhIGxpdGVyYWwgYF9fcHJvdG9fX2Aga2V5IHN0YXlzIGRhdGFcbiAgICAgIC8vIGFuZCBuZXZlciBpbnZva2VzIHRoZSBwcm90b3R5cGUgc2V0dGVyLlxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnRhaW5lciwgbm9ybWFsaXplZEtleSwge1xuICAgICAgICB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGFpbmVyW25vcm1hbGl6ZWRLZXldID0gdmFsdWVcbiAgICB9XG4gICAgcmV0dXJuICcnXG4gIH0sXG4gIC8vIGhhc093biwgbm90IGBpbmA6IGEgcGxhaW4gb2JqZWN0IGluaGVyaXRzIGB0b1N0cmluZ2AgYW5kIGZyaWVuZHMuXG4gIGhhczogKGNvbnRhaW5lciwga2V5KSA9PiB7XG4gICAgaWYgKGtleSAhPT0gbnVsbCAmJiB0eXBlb2Yga2V5ID09PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjb250YWluZXIsIFN0cmluZyhrZXkpKVxuICB9LFxuICBrZXlzOiAoY29udGFpbmVyKSA9PiBPYmplY3Qua2V5cyhjb250YWluZXIpLFxuICBnZXQ6IChjb250YWluZXIsIGtleSkgPT4gY29udGFpbmVyW1N0cmluZyhrZXkpXVxufSlcblxuZXhwb3J0IHsgbWFwVGFnLCBpc1BsYWluT2JqZWN0LCB0eXBlIFN0cmluZ01hcHBpbmcgfVxuIiwgImltcG9ydCB7IGRlZmluZU1hcHBpbmdUYWcgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IHNldFRhZyA9IGRlZmluZU1hcHBpbmdUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOnNldCcsIHtcbiAgY3JlYXRlOiAoKSA9PiBuZXcgU2V0PHVua25vd24+KCksXG4gIGlkZW50aWZ5OiAoZGF0YSkgPT4gZGF0YSBpbnN0YW5jZW9mIFNldCxcbiAgcmVwcmVzZW50OiAoZGF0YTogU2V0PHVua25vd24+KSA9PiB7XG4gICAgY29uc3QgbWFwID0gbmV3IE1hcDx1bmtub3duLCBudWxsPigpXG4gICAgZm9yIChjb25zdCBrZXkgb2YgZGF0YSkgbWFwLnNldChrZXksIG51bGwpXG4gICAgcmV0dXJuIG1hcFxuICB9LFxuICBhZGRQYWlyOiAoY29udGFpbmVyLCBrZXksIHZhbHVlKSA9PiB7XG4gICAgaWYgKHZhbHVlICE9PSBudWxsKSByZXR1cm4gJ2Nhbm5vdCByZXNvbHZlIGEgc2V0IGl0ZW0nXG4gICAgY29udGFpbmVyLmFkZChrZXkpXG4gICAgcmV0dXJuICcnXG4gIH0sXG4gIGhhczogKGNvbnRhaW5lciwga2V5KSA9PiBjb250YWluZXIuaGFzKGtleSksXG4gIGtleXM6IChjb250YWluZXIpID0+IGNvbnRhaW5lci5rZXlzKCksXG4gIGdldDogKCkgPT4gbnVsbFxufSlcblxuZXhwb3J0IHsgc2V0VGFnIH1cbiIsICJpbXBvcnQge1xuICB0eXBlIE1hcHBpbmdUYWdEZWZpbml0aW9uLFxuICB0eXBlIFNjYWxhclRhZ0RlZmluaXRpb24sXG4gIHR5cGUgU2VxdWVuY2VUYWdEZWZpbml0aW9uLFxuICB0eXBlIFRhZ0RlZmluaXRpb25cbn0gZnJvbSAnLi90YWcudHMnXG5pbXBvcnQgeyBzdHJUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvc3RyLnRzJ1xuaW1wb3J0IHsgbnVsbENvcmVUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvbnVsbF9jb3JlLnRzJ1xuaW1wb3J0IHsgbnVsbEpzb25UYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvbnVsbF9qc29uLnRzJ1xuaW1wb3J0IHsgbnVsbFlhbWwxMVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9udWxsX3lhbWwxMS50cydcbmltcG9ydCB7IGJvb2xDb3JlVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2Jvb2xfY29yZS50cydcbmltcG9ydCB7IGJvb2xKc29uVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2Jvb2xfanNvbi50cydcbmltcG9ydCB7IGJvb2xZYW1sMTFUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvYm9vbF95YW1sMTEudHMnXG5pbXBvcnQgeyBpbnRDb3JlVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2ludF9jb3JlLnRzJ1xuaW1wb3J0IHsgaW50SnNvblRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9pbnRfanNvbi50cydcbmltcG9ydCB7IGludFlhbWwxMVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9pbnRfeWFtbDExLnRzJ1xuaW1wb3J0IHsgZmxvYXRDb3JlVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2Zsb2F0X2NvcmUudHMnXG5pbXBvcnQgeyBmbG9hdEpzb25UYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvZmxvYXRfanNvbi50cydcbmltcG9ydCB7IGZsb2F0WWFtbDExVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2Zsb2F0X3lhbWwxMS50cydcbmltcG9ydCB7IG1lcmdlVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL21lcmdlLnRzJ1xuaW1wb3J0IHsgYmluYXJ5VGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2JpbmFyeS50cydcbmltcG9ydCB7IHRpbWVzdGFtcFRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci90aW1lc3RhbXAudHMnXG5pbXBvcnQgeyBzZXFUYWcgfSBmcm9tICcuL3RhZy9zZXF1ZW5jZS9zZXEudHMnXG5pbXBvcnQgeyBvbWFwVGFnIH0gZnJvbSAnLi90YWcvc2VxdWVuY2Uvb21hcC50cydcbmltcG9ydCB7IHBhaXJzVGFnIH0gZnJvbSAnLi90YWcvc2VxdWVuY2UvcGFpcnMudHMnXG5pbXBvcnQgeyBtYXBUYWcgfSBmcm9tICcuL3RhZy9tYXBwaW5nL21hcC50cydcbmltcG9ydCB7IHNldFRhZyB9IGZyb20gJy4vdGFnL21hcHBpbmcvc2V0LnRzJ1xuXG5pbnRlcmZhY2UgVGFnRGVmaW5pdGlvbk1hcCB7XG4gIHNjYWxhcjogUmVjb3JkPHN0cmluZywgU2NhbGFyVGFnRGVmaW5pdGlvbj5cbiAgc2VxdWVuY2U6IFJlY29yZDxzdHJpbmcsIFNlcXVlbmNlVGFnRGVmaW5pdGlvbj5cbiAgbWFwcGluZzogUmVjb3JkPHN0cmluZywgTWFwcGluZ1RhZ0RlZmluaXRpb24+XG59XG5cbmludGVyZmFjZSBUYWdEZWZpbml0aW9uTGlzdE1hcCB7XG4gIHNjYWxhcjogU2NhbGFyVGFnRGVmaW5pdGlvbltdXG4gIHNlcXVlbmNlOiBTZXF1ZW5jZVRhZ0RlZmluaXRpb25bXVxuICBtYXBwaW5nOiBNYXBwaW5nVGFnRGVmaW5pdGlvbltdXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRhZ0RlZmluaXRpb25NYXAgKCk6IFRhZ0RlZmluaXRpb25NYXAge1xuICByZXR1cm4ge1xuICAgIHNjYWxhcjoge30sXG4gICAgc2VxdWVuY2U6IHt9LFxuICAgIG1hcHBpbmc6IHt9XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlVGFnRGVmaW5pdGlvbkxpc3RNYXAgKCk6IFRhZ0RlZmluaXRpb25MaXN0TWFwIHtcbiAgcmV0dXJuIHtcbiAgICBzY2FsYXI6IFtdLFxuICAgIHNlcXVlbmNlOiBbXSxcbiAgICBtYXBwaW5nOiBbXVxuICB9XG59XG5cbmZ1bmN0aW9uIGNvbXBpbGVUYWdzICh0YWdzOiByZWFkb25seSBUYWdEZWZpbml0aW9uW10pIHtcbiAgY29uc3QgcmVzdWx0OiBUYWdEZWZpbml0aW9uW10gPSBbXVxuXG4gIGZvciAoY29uc3QgdGFnIG9mIHRhZ3MpIHtcbiAgICBsZXQgaW5kZXggPSByZXN1bHQubGVuZ3RoXG5cbiAgICBmb3IgKGxldCBwcmV2aW91c0luZGV4ID0gMDsgcHJldmlvdXNJbmRleCA8IHJlc3VsdC5sZW5ndGg7IHByZXZpb3VzSW5kZXgrKykge1xuICAgICAgY29uc3QgcHJldmlvdXMgPSByZXN1bHRbcHJldmlvdXNJbmRleF1cblxuICAgICAgaWYgKHByZXZpb3VzLm5vZGVLaW5kID09PSB0YWcubm9kZUtpbmQgJiZcbiAgICAgICAgICBwcmV2aW91cy50YWdOYW1lID09PSB0YWcudGFnTmFtZSAmJlxuICAgICAgICAgIHByZXZpb3VzLm1hdGNoQnlUYWdQcmVmaXggPT09IHRhZy5tYXRjaEJ5VGFnUHJlZml4KSB7XG4gICAgICAgIGluZGV4ID0gcHJldmlvdXNJbmRleFxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlc3VsdFtpbmRleF0gPSB0YWdcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuY2xhc3MgU2NoZW1hIHtcbiAgcmVhZG9ubHkgdGFnczogcmVhZG9ubHkgVGFnRGVmaW5pdGlvbltdXG4gIHJlYWRvbmx5IGltcGxpY2l0U2NhbGFyVGFnczogcmVhZG9ubHkgU2NhbGFyVGFnRGVmaW5pdGlvbltdXG4gIC8vIERpc3BhdGNoIGltcGxpY2l0IHNjYWxhciByZXNvbHZlcnMgYnkgYHNvdXJjZS5jaGFyQXQoMClgLiBFYWNoIGJ1Y2tldCBob2xkcyB0aGVcbiAgLy8gcmVzb2x2ZXJzIHRoYXQgbWF5IG1hdGNoIHRoYXQga2V5LCBpbiBzY2hlbWEgb3JkZXI7IGEga2V5IGFic2VudCBmcm9tIHRoZSBtYXBcbiAgLy8gdXNlcyBgaW1wbGljaXRTY2FsYXJBbnlGaXJzdENoYXJgIChyZXNvbHZlcnMgdGhhdCBkZWNsYXJlZCBubyBmaXJzdC1jaGFyXG4gIC8vIGNvbnN0cmFpbnQsIHNvIHRoZXkgYXBwbHkgdG8gYW55IGZpcnN0IGNoYXJhY3RlcikuXG4gIHJlYWRvbmx5IGltcGxpY2l0U2NhbGFyQnlGaXJzdENoYXI6IFJlYWRvbmx5TWFwPHN0cmluZywgcmVhZG9ubHkgU2NhbGFyVGFnRGVmaW5pdGlvbltdPlxuICByZWFkb25seSBpbXBsaWNpdFNjYWxhckFueUZpcnN0Q2hhcjogcmVhZG9ubHkgU2NhbGFyVGFnRGVmaW5pdGlvbltdXG4gIC8vIFRoZSBkZWZhdWx0IHNjYWxhciB0YWcgKGAhIXN0cmApLCByZXNvbHZlZCBvbmNlIHNvIHRoZSBjb21wb3NlcidzIGZhbGxiYWNrIGZvclxuICAvLyB1bnJlc29sdmVkIHBsYWluIHNjYWxhcnMgYXZvaWRzIGEga2V5ZWQgbG9va3VwIHBlciBzY2FsYXIuXG4gIHJlYWRvbmx5IGRlZmF1bHRTY2FsYXJUYWc6IFNjYWxhclRhZ0RlZmluaXRpb25cbiAgLy8gVGhlIGRlZmF1bHQgY29udGFpbmVyIHRhZ3MgKGAhIXNlcWAgLyBgISFtYXBgKSwgdXNlZCBieSB0aGUgZHVtcGVyOiB3aGVuIGFcbiAgLy8gdmFsdWUgaXMgaWRlbnRpZmllZCBieSBpdHMgZGVmYXVsdCB0YWcsIHRoZSB0YWcgaXMgaW1wbGljaXQgYW5kIG5vdCBwcmludGVkLlxuICAvLyBVbmRlZmluZWQgaWYgdGhlIHNjaGVtYSBkb2VzIG5vdCBkZWZpbmUgdGhlbSAodGhlbiBzdWNoIHZhbHVlcyBjYW4ndCBiZSBkdW1wZWQpLlxuICByZWFkb25seSBkZWZhdWx0U2VxdWVuY2VUYWc6IFNlcXVlbmNlVGFnRGVmaW5pdGlvbiB8IHVuZGVmaW5lZFxuICByZWFkb25seSBkZWZhdWx0TWFwcGluZ1RhZzogTWFwcGluZ1RhZ0RlZmluaXRpb24gfCB1bmRlZmluZWRcbiAgcmVhZG9ubHkgZXhhY3Q6IFRhZ0RlZmluaXRpb25NYXBcbiAgcmVhZG9ubHkgcHJlZml4OiBUYWdEZWZpbml0aW9uTGlzdE1hcFxuXG4gIGNvbnN0cnVjdG9yICh0YWdzOiByZWFkb25seSBUYWdEZWZpbml0aW9uW10pIHtcbiAgICBjb25zdCBjb21waWxlZFRhZ3MgPSBjb21waWxlVGFncyh0YWdzKVxuICAgIGNvbnN0IGltcGxpY2l0U2NhbGFyVGFnczogU2NhbGFyVGFnRGVmaW5pdGlvbltdID0gW11cbiAgICBjb25zdCBleGFjdCA9IGNyZWF0ZVRhZ0RlZmluaXRpb25NYXAoKVxuICAgIGNvbnN0IHByZWZpeCA9IGNyZWF0ZVRhZ0RlZmluaXRpb25MaXN0TWFwKClcblxuICAgIGZvciAoY29uc3QgdGFnIG9mIGNvbXBpbGVkVGFncykge1xuICAgICAgaWYgKHRhZy5ub2RlS2luZCA9PT0gJ3NjYWxhcicgJiYgdGFnLmltcGxpY2l0KSB7XG4gICAgICAgIGlmICh0YWcubWF0Y2hCeVRhZ1ByZWZpeCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW1wbGljaXQgc2NhbGFyIHRhZ3MgY2Fubm90IG1hdGNoIGJ5IHRhZyBwcmVmaXgnKVxuICAgICAgICB9XG5cbiAgICAgICAgaW1wbGljaXRTY2FsYXJUYWdzLnB1c2godGFnKVxuICAgICAgfVxuXG4gICAgICBzd2l0Y2ggKHRhZy5ub2RlS2luZCkge1xuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgIGlmICh0YWcubWF0Y2hCeVRhZ1ByZWZpeCkgcHJlZml4LnNjYWxhci5wdXNoKHRhZylcbiAgICAgICAgICBlbHNlIGV4YWN0LnNjYWxhclt0YWcudGFnTmFtZV0gPSB0YWdcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdzZXF1ZW5jZSc6XG4gICAgICAgICAgaWYgKHRhZy5tYXRjaEJ5VGFnUHJlZml4KSBwcmVmaXguc2VxdWVuY2UucHVzaCh0YWcpXG4gICAgICAgICAgZWxzZSBleGFjdC5zZXF1ZW5jZVt0YWcudGFnTmFtZV0gPSB0YWdcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdtYXBwaW5nJzpcbiAgICAgICAgICBpZiAodGFnLm1hdGNoQnlUYWdQcmVmaXgpIHByZWZpeC5tYXBwaW5nLnB1c2godGFnKVxuICAgICAgICAgIGVsc2UgZXhhY3QubWFwcGluZ1t0YWcudGFnTmFtZV0gPSB0YWdcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGltcGxpY2l0U2NhbGFyQW55Rmlyc3RDaGFyID0gaW1wbGljaXRTY2FsYXJUYWdzLmZpbHRlcih0YWcgPT4gdGFnLmltcGxpY2l0Rmlyc3RDaGFycyA9PT0gbnVsbClcblxuICAgIGNvbnN0IGtleXMgPSBuZXcgU2V0PHN0cmluZz4oKVxuICAgIGZvciAoY29uc3QgdGFnIG9mIGltcGxpY2l0U2NhbGFyVGFncykge1xuICAgICAgaWYgKHRhZy5pbXBsaWNpdEZpcnN0Q2hhcnMgIT09IG51bGwpIHtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdGFnLmltcGxpY2l0Rmlyc3RDaGFycykga2V5cy5hZGQoa2V5KVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGltcGxpY2l0U2NhbGFyQnlGaXJzdENoYXIgPSBuZXcgTWFwPHN0cmluZywgU2NhbGFyVGFnRGVmaW5pdGlvbltdPigpXG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgICAgaW1wbGljaXRTY2FsYXJCeUZpcnN0Q2hhci5zZXQoa2V5LCBpbXBsaWNpdFNjYWxhclRhZ3MuZmlsdGVyKHRhZyA9PlxuICAgICAgICB0YWcuaW1wbGljaXRGaXJzdENoYXJzID09PSBudWxsIHx8IHRhZy5pbXBsaWNpdEZpcnN0Q2hhcnMuaW5kZXhPZihrZXkpICE9PSAtMSkpXG4gICAgfVxuXG4gICAgY29uc3QgZGVmYXVsdFNjYWxhclRhZyA9IGV4YWN0LnNjYWxhclsndGFnOnlhbWwub3JnLDIwMDI6c3RyJ11cbiAgICBpZiAoIWRlZmF1bHRTY2FsYXJUYWcpIHRocm93IG5ldyBFcnJvcignc2NoZW1hIGRvZXMgbm90IGRlZmluZSB0aGUgZGVmYXVsdCBzY2FsYXIgdGFnICh0YWc6eWFtbC5vcmcsMjAwMjpzdHIpJylcblxuICAgIHRoaXMudGFncyA9IGNvbXBpbGVkVGFnc1xuICAgIHRoaXMuaW1wbGljaXRTY2FsYXJUYWdzID0gaW1wbGljaXRTY2FsYXJUYWdzXG4gICAgdGhpcy5pbXBsaWNpdFNjYWxhckJ5Rmlyc3RDaGFyID0gaW1wbGljaXRTY2FsYXJCeUZpcnN0Q2hhclxuICAgIHRoaXMuaW1wbGljaXRTY2FsYXJBbnlGaXJzdENoYXIgPSBpbXBsaWNpdFNjYWxhckFueUZpcnN0Q2hhclxuICAgIHRoaXMuZGVmYXVsdFNjYWxhclRhZyA9IGRlZmF1bHRTY2FsYXJUYWdcbiAgICB0aGlzLmRlZmF1bHRTZXF1ZW5jZVRhZyA9IGV4YWN0LnNlcXVlbmNlWyd0YWc6eWFtbC5vcmcsMjAwMjpzZXEnXVxuICAgIHRoaXMuZGVmYXVsdE1hcHBpbmdUYWcgPSBleGFjdC5tYXBwaW5nWyd0YWc6eWFtbC5vcmcsMjAwMjptYXAnXVxuICAgIHRoaXMuZXhhY3QgPSBleGFjdFxuICAgIHRoaXMucHJlZml4ID0gcHJlZml4XG4gIH1cblxuICB3aXRoVGFncyAoLi4udGFnczogQXJyYXk8VGFnRGVmaW5pdGlvbiB8IHJlYWRvbmx5IFRhZ0RlZmluaXRpb25bXT4pOiBTY2hlbWEge1xuICAgIGxldCBmbGF0VGFnczogVGFnRGVmaW5pdGlvbltdID0gW11cbiAgICBmb3IgKGNvbnN0IHRhZyBvZiB0YWdzKSBmbGF0VGFncyA9IGZsYXRUYWdzLmNvbmNhdCh0YWcpXG5cbiAgICByZXR1cm4gbmV3IFNjaGVtYShbLi4udGhpcy50YWdzLCAuLi5mbGF0VGFnc10pXG4gIH1cbn1cblxuY29uc3QgRkFJTFNBRkVfU0NIRU1BID0gbmV3IFNjaGVtYShbXG4gIHN0clRhZyxcbiAgc2VxVGFnLFxuICBtYXBUYWdcbl0pXG5cbmNvbnN0IEpTT05fU0NIRU1BID0gbmV3IFNjaGVtYShbXG4gIC4uLkZBSUxTQUZFX1NDSEVNQS50YWdzLFxuICBudWxsSnNvblRhZyxcbiAgYm9vbEpzb25UYWcsXG4gIGludEpzb25UYWcsXG4gIGZsb2F0SnNvblRhZ1xuXSlcblxuY29uc3QgQ09SRV9TQ0hFTUEgPSBuZXcgU2NoZW1hKFtcbiAgLi4uRkFJTFNBRkVfU0NIRU1BLnRhZ3MsXG4gIG51bGxDb3JlVGFnLFxuICBib29sQ29yZVRhZyxcbiAgaW50Q29yZVRhZyxcbiAgZmxvYXRDb3JlVGFnXG5dKVxuXG5jb25zdCBZQU1MMTFfU0NIRU1BID0gbmV3IFNjaGVtYShbXG4gIC4uLkZBSUxTQUZFX1NDSEVNQS50YWdzLFxuICBudWxsWWFtbDExVGFnLFxuICBib29sWWFtbDExVGFnLFxuICBpbnRZYW1sMTFUYWcsXG4gIGZsb2F0WWFtbDExVGFnLFxuICB0aW1lc3RhbXBUYWcsXG4gIG1lcmdlVGFnLFxuICBiaW5hcnlUYWcsXG4gIG9tYXBUYWcsXG4gIHBhaXJzVGFnLFxuICBzZXRUYWdcbl0pXG5cbmV4cG9ydCB7XG4gIFNjaGVtYSxcbiAgRkFJTFNBRkVfU0NIRU1BLFxuICBKU09OX1NDSEVNQSxcbiAgQ09SRV9TQ0hFTUEsXG4gIFlBTUwxMV9TQ0hFTUEsXG5cbiAgdHlwZSBUYWdEZWZpbml0aW9uTWFwLFxuICB0eXBlIFRhZ0RlZmluaXRpb25MaXN0TWFwXG59XG4iLCAiaW1wb3J0IHsgZGVmaW5lTWFwcGluZ1RhZyB9IGZyb20gJy4uLy4uL3RhZy50cydcbmltcG9ydCB7IGlzUGxhaW5PYmplY3QgfSBmcm9tICcuLi8uLi9jb21tb24vb2JqZWN0LnRzJ1xuXG50eXBlIFJlYWxNYXBwaW5nID0gTWFwPHVua25vd24sIHVua25vd24+XG5cbi8vIEEgbWFwcGluZyByZXByZXNlbnRlZCBhcyBhIHJlYWwgYE1hcGA6IGtleXMga2VlcCB0aGVpciBjb25zdHJ1Y3RlZCB0eXBlLFxuLy8gbm90aGluZyBpcyBzdHJpbmdpZmllZC4gRHJvcC1pbiByZXBsYWNlbWVudCBmb3IgdGhlIGRlZmF1bHQgYCEhbWFwYCB0YWdcbi8vIChzYW1lIHRhZyBuYW1lKSDigJQgYENPUkVfU0NIRU1BLndpdGhUYWdzKHJlYWxNYXBUYWcpYC5cbmNvbnN0IHJlYWxNYXBUYWcgPSBkZWZpbmVNYXBwaW5nVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjptYXAnLCB7XG4gIGNyZWF0ZTogKCkgPT4gbmV3IE1hcDx1bmtub3duLCB1bmtub3duPigpLFxuICBhZGRQYWlyOiAoY29udGFpbmVyOiBSZWFsTWFwcGluZywga2V5LCB2YWx1ZSkgPT4ge1xuICAgIGNvbnRhaW5lci5zZXQoa2V5LCB2YWx1ZSlcbiAgICByZXR1cm4gJydcbiAgfSxcbiAgaGFzOiAoY29udGFpbmVyOiBSZWFsTWFwcGluZywga2V5KSA9PiBjb250YWluZXIuaGFzKGtleSksXG4gIGtleXM6IChjb250YWluZXI6IFJlYWxNYXBwaW5nKSA9PiBjb250YWluZXIua2V5cygpLFxuICBnZXQ6IChjb250YWluZXI6IFJlYWxNYXBwaW5nLCBrZXkpID0+IGNvbnRhaW5lci5nZXQoa2V5KSxcbiAgLy8gRHVtcCBzaWRlOiBoYW5kbGUgYm90aCBhIHJlYWwgYE1hcGAgYW5kIGEgcGxhaW4gb2JqZWN0LCBzbyB0aGlzIHRhZyBmdWxseVxuICAvLyByZXBsYWNlcyB0aGUgZGVmYXVsdCBtYXAgcmVwcmVzZW50YXRpb24gd2hlbiBkdW1waW5nIHRvby5cbiAgaWRlbnRpZnk6IChkYXRhKSA9PiBkYXRhIGluc3RhbmNlb2YgTWFwIHx8IGlzUGxhaW5PYmplY3QoZGF0YSksXG4gIC8vIER1bXAgc2lkZTogdGhlIGNhbm9uaWNhbCBtYXBwaW5nIGZvcm0gaXMgYSBgTWFwYC4gQSByZWFsIGBNYXBgIHBhc3Nlc1xuICAvLyB0aHJvdWdoIHVudG91Y2hlZCAoa2V5cyBrZWVwIHRoZWlyIHR5cGUpOyBhIHBsYWluIG9iamVjdCBpcyB3cmFwcGVkXG4gIC8vIHNoYWxsb3dseS4gTG9zc2xlc3Mg4oCUIG5vdGhpbmcgaXMgc3RyaW5naWZpZWQuXG4gIHJlcHJlc2VudDogKGRhdGEpID0+IHtcbiAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIE1hcCkgcmV0dXJuIGRhdGFcbiAgICBjb25zdCBtYXAgPSBuZXcgTWFwPHVua25vd24sIHVua25vd24+KClcbiAgICBjb25zdCBvYmogPSBkYXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMob2JqKSkgbWFwLnNldChrZXksIG9ialtrZXldKVxuICAgIHJldHVybiBtYXBcbiAgfVxufSlcblxuZXhwb3J0IHsgcmVhbE1hcFRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lTWFwcGluZ1RhZyB9IGZyb20gJy4uLy4uL3RhZy50cydcbmltcG9ydCB7IGlzUGxhaW5PYmplY3QgfSBmcm9tICcuLi8uLi9jb21tb24vb2JqZWN0LnRzJ1xuXG50eXBlIFN0cmluZ01hcHBpbmcgPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuXG4vLyBDb2VyY2UgYSBjb25zdHJ1Y3RlZCBrZXkgaW50byB0aGUgc3RyaW5nIGlkZW50aXR5IGEgYHt9YCByZXByZXNlbnRhdGlvbiB1c2VzLlxuLy8gUmV0dXJucyBudWxsIGZvciBhIG5lc3RlZCBhcnJheSBrZXkgKGFuIGFycmF5IGVsZW1lbnQgdGhhdCBpcyBpdHNlbGYgYW5cbi8vIGFycmF5KSwgd2hpY2ggd291bGQgb3RoZXJ3aXNlIGJsb3cgdXAgZXhwb25lbnRpYWxseSB3aGVuIHN0cmluZ2lmaWVkIHZpYVxuLy8gYWxpYXNlcy5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUtleSAoa2V5OiB1bmtub3duKTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmIChBcnJheS5pc0FycmF5KGtleSkpIHtcbiAgICBjb25zdCBhcnJheSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGtleSkgYXMgdW5rbm93bltdXG5cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXJyYXkubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShhcnJheVtpbmRleF0pKSByZXR1cm4gbnVsbFxuXG4gICAgICBpZiAodHlwZW9mIGFycmF5W2luZGV4XSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJyYXlbaW5kZXhdKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgYXJyYXlbaW5kZXhdID0gJ1tvYmplY3QgT2JqZWN0XSdcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gU3RyaW5nKGFycmF5KVxuICB9XG5cbiAgaWYgKHR5cGVvZiBrZXkgPT09ICdvYmplY3QnICYmXG4gICAgICBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoa2V5KSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gJ1tvYmplY3QgT2JqZWN0XSdcbiAgfVxuXG4gIHJldHVybiBTdHJpbmcoa2V5KVxufVxuXG5jb25zdCBsZWdhY3lNYXBUYWcgPSBkZWZpbmVNYXBwaW5nVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjptYXAnLCB7XG4gIGNyZWF0ZTogKCk6IFN0cmluZ01hcHBpbmcgPT4gKHt9KSxcbiAgaWRlbnRpZnk6IGlzUGxhaW5PYmplY3QsXG4gIC8vIER1bXAgc2lkZTogd3JhcCB0aGUgcGxhaW4gb2JqZWN0IGludG8gdGhlIGNhbm9uaWNhbCBgTWFwYCBmb3JtIHRoZSB3cml0ZXJcbiAgLy8gd2Fsa3MuIFNoYWxsb3cg4oCUIGtleXMvdmFsdWVzIHN0YXkgcmVmZXJlbmNlcyB0byB0aGUgb3JpZ2luYWxzLlxuICByZXByZXNlbnQ6IChvOiBTdHJpbmdNYXBwaW5nKSA9PiB7XG4gICAgY29uc3QgbWFwID0gbmV3IE1hcDxzdHJpbmcsIHVua25vd24+KClcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvKSkgbWFwLnNldChrZXksIG9ba2V5XSlcbiAgICByZXR1cm4gbWFwXG4gIH0sXG4gIGFkZFBhaXI6IChjb250YWluZXIsIGtleSwgdmFsdWUpID0+IHtcbiAgICBjb25zdCBub3JtYWxpemVkS2V5ID0gbm9ybWFsaXplS2V5KGtleSlcbiAgICBpZiAobm9ybWFsaXplZEtleSA9PT0gbnVsbCkgcmV0dXJuICduZXN0ZWQgYXJyYXlzIGFyZSBub3Qgc3VwcG9ydGVkIGluc2lkZSBrZXlzJ1xuICAgIGlmIChub3JtYWxpemVkS2V5ID09PSAnX19wcm90b19fJykge1xuICAgICAgLy8gRGVmaW5lIGFzIGFuIG93biBkYXRhIHByb3BlcnR5IHNvIGEgbGl0ZXJhbCBgX19wcm90b19fYCBrZXkgc3RheXMgZGF0YVxuICAgICAgLy8gYW5kIG5ldmVyIGludm9rZXMgdGhlIHByb3RvdHlwZSBzZXR0ZXIuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29udGFpbmVyLCBub3JtYWxpemVkS2V5LCB7XG4gICAgICAgIHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXJbbm9ybWFsaXplZEtleV0gPSB2YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gJydcbiAgfSxcbiAgLy8gaGFzT3duLCBub3QgYGluYDogYSBwbGFpbiBvYmplY3QgaW5oZXJpdHMgYHRvU3RyaW5nYCBhbmQgZnJpZW5kcy5cbiAgaGFzOiAoY29udGFpbmVyLCBrZXkpID0+IHtcbiAgICBjb25zdCBub3JtYWxpemVkS2V5ID0gbm9ybWFsaXplS2V5KGtleSlcbiAgICByZXR1cm4gbm9ybWFsaXplZEtleSAhPT0gbnVsbCAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY29udGFpbmVyLCBub3JtYWxpemVkS2V5KVxuICB9LFxuICBrZXlzOiAoY29udGFpbmVyKSA9PiBPYmplY3Qua2V5cyhjb250YWluZXIpLFxuICBnZXQ6IChjb250YWluZXIsIGtleSkgPT4gY29udGFpbmVyW1N0cmluZyhrZXkpXVxufSlcblxuZXhwb3J0IHsgbGVnYWN5TWFwVGFnLCBpc1BsYWluT2JqZWN0LCB0eXBlIFN0cmluZ01hcHBpbmcgfVxuIiwgImV4cG9ydCBpbnRlcmZhY2UgU25pcHBldE1hcmsge1xuICBuYW1lPzogc3RyaW5nIHwgbnVsbFxuICBidWZmZXI6IHN0cmluZ1xuICBwb3NpdGlvbjogbnVtYmVyXG4gIGxpbmU6IG51bWJlclxuICBjb2x1bW46IG51bWJlclxuICBzbmlwcGV0Pzogc3RyaW5nIHwgbnVsbFxufVxuXG5pbnRlcmZhY2UgU25pcHBldE9wdGlvbnMge1xuICBtYXhMZW5ndGg/OiBudW1iZXJcbiAgaW5kZW50PzogbnVtYmVyXG4gIGxpbmVzQmVmb3JlPzogbnVtYmVyXG4gIGxpbmVzQWZ0ZXI/OiBudW1iZXJcbn1cblxuY29uc3QgREVGQVVMVF9TTklQUEVUX09QVElPTlM6IFJlcXVpcmVkPFNuaXBwZXRPcHRpb25zPiA9IHtcbiAgbWF4TGVuZ3RoOiA3OSxcbiAgaW5kZW50OiAxLFxuICBsaW5lc0JlZm9yZTogMyxcbiAgbGluZXNBZnRlcjogMlxufVxuXG4vLyBnZXQgc25pcHBldCBmb3IgYSBzaW5nbGUgbGluZSwgcmVzcGVjdGluZyBtYXhMZW5ndGhcbmZ1bmN0aW9uIGdldExpbmUgKGJ1ZmZlcjogc3RyaW5nLCBsaW5lU3RhcnQ6IG51bWJlciwgbGluZUVuZDogbnVtYmVyLCBwb3NpdGlvbjogbnVtYmVyLCBtYXhMaW5lTGVuZ3RoOiBudW1iZXIpIHtcbiAgbGV0IGhlYWQgPSAnJ1xuICBsZXQgdGFpbCA9ICcnXG4gIGNvbnN0IG1heEhhbGZMZW5ndGggPSBNYXRoLmZsb29yKG1heExpbmVMZW5ndGggLyAyKSAtIDFcblxuICBpZiAocG9zaXRpb24gLSBsaW5lU3RhcnQgPiBtYXhIYWxmTGVuZ3RoKSB7XG4gICAgaGVhZCA9ICcgLi4uICdcbiAgICBsaW5lU3RhcnQgPSBwb3NpdGlvbiAtIG1heEhhbGZMZW5ndGggKyBoZWFkLmxlbmd0aFxuICB9XG5cbiAgaWYgKGxpbmVFbmQgLSBwb3NpdGlvbiA+IG1heEhhbGZMZW5ndGgpIHtcbiAgICB0YWlsID0gJyAuLi4nXG4gICAgbGluZUVuZCA9IHBvc2l0aW9uICsgbWF4SGFsZkxlbmd0aCAtIHRhaWwubGVuZ3RoXG4gIH1cblxuICByZXR1cm4ge1xuICAgIHN0cjogaGVhZCArIGJ1ZmZlci5zbGljZShsaW5lU3RhcnQsIGxpbmVFbmQpLnJlcGxhY2UoL1xcdC9nLCAn4oaSJykgKyB0YWlsLFxuICAgIHBvczogcG9zaXRpb24gLSBsaW5lU3RhcnQgKyBoZWFkLmxlbmd0aCAvLyByZWxhdGl2ZSBwb3NpdGlvblxuICB9XG59XG5cbmZ1bmN0aW9uIHBhZFN0YXJ0IChzdHJpbmc6IHN0cmluZywgbWF4OiBudW1iZXIpIHtcbiAgLy8gbWF4KCkgcHJvdGVjdHMgZnJvbSBuZWdhdGl2YSB2YWx1ZSwgdG8gYXZvaWQgZXhjZXB0aW9uLlxuICByZXR1cm4gJyAnLnJlcGVhdChNYXRoLm1heChtYXggLSBzdHJpbmcubGVuZ3RoLCAwKSkgKyBzdHJpbmdcbn1cblxuZnVuY3Rpb24gbWFrZVNuaXBwZXQgKG1hcms6IFNuaXBwZXRNYXJrLCBvcHRpb25zPzogU25pcHBldE9wdGlvbnMpIHtcbiAgaWYgKCFtYXJrLmJ1ZmZlcikgcmV0dXJuIG51bGxcblxuICBjb25zdCBvcHRzID0geyAuLi5ERUZBVUxUX1NOSVBQRVRfT1BUSU9OUywgLi4ub3B0aW9ucyB9XG5cbiAgY29uc3QgcmUgPSAvXFxyP1xcbnxcXHJ8XFwwL2dcbiAgY29uc3QgbGluZVN0YXJ0cyA9IFswXVxuICBjb25zdCBsaW5lRW5kczogbnVtYmVyW10gPSBbXVxuICBsZXQgbWF0Y2g6IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGxcbiAgbGV0IGZvdW5kTGluZU5vID0gLTFcblxuICB3aGlsZSAoKG1hdGNoID0gcmUuZXhlYyhtYXJrLmJ1ZmZlcikpKSB7XG4gICAgbGluZUVuZHMucHVzaChtYXRjaC5pbmRleClcbiAgICBsaW5lU3RhcnRzLnB1c2gobWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGgpXG5cbiAgICBpZiAobWFyay5wb3NpdGlvbiA8PSBtYXRjaC5pbmRleCAmJiBmb3VuZExpbmVObyA8IDApIHtcbiAgICAgIGZvdW5kTGluZU5vID0gbGluZVN0YXJ0cy5sZW5ndGggLSAyXG4gICAgfVxuICB9XG5cbiAgaWYgKGZvdW5kTGluZU5vIDwgMCkgZm91bmRMaW5lTm8gPSBsaW5lU3RhcnRzLmxlbmd0aCAtIDFcblxuICBsZXQgcmVzdWx0ID0gJydcbiAgY29uc3QgbGluZU5vTGVuZ3RoID0gTWF0aC5taW4obWFyay5saW5lICsgb3B0cy5saW5lc0FmdGVyLCBsaW5lRW5kcy5sZW5ndGgpLnRvU3RyaW5nKCkubGVuZ3RoXG4gIGNvbnN0IG1heExpbmVMZW5ndGggPSBvcHRzLm1heExlbmd0aCAtIChvcHRzLmluZGVudCArIGxpbmVOb0xlbmd0aCArIDMpXG5cbiAgZm9yIChsZXQgaSA9IDE7IGkgPD0gb3B0cy5saW5lc0JlZm9yZTsgaSsrKSB7XG4gICAgaWYgKGZvdW5kTGluZU5vIC0gaSA8IDApIGJyZWFrXG4gICAgY29uc3QgbGluZSA9IGdldExpbmUoXG4gICAgICBtYXJrLmJ1ZmZlcixcbiAgICAgIGxpbmVTdGFydHNbZm91bmRMaW5lTm8gLSBpXSxcbiAgICAgIGxpbmVFbmRzW2ZvdW5kTGluZU5vIC0gaV0sXG4gICAgICBtYXJrLnBvc2l0aW9uIC0gKGxpbmVTdGFydHNbZm91bmRMaW5lTm9dIC0gbGluZVN0YXJ0c1tmb3VuZExpbmVObyAtIGldKSxcbiAgICAgIG1heExpbmVMZW5ndGhcbiAgICApXG4gICAgcmVzdWx0ID0gYCR7JyAnLnJlcGVhdChvcHRzLmluZGVudCl9JHtwYWRTdGFydCgobWFyay5saW5lIC0gaSArIDEpLnRvU3RyaW5nKCksIGxpbmVOb0xlbmd0aCl9IHwgJHtsaW5lLnN0cn1cXG4ke3Jlc3VsdH1gXG4gIH1cblxuICBjb25zdCBsaW5lID0gZ2V0TGluZShtYXJrLmJ1ZmZlciwgbGluZVN0YXJ0c1tmb3VuZExpbmVOb10sIGxpbmVFbmRzW2ZvdW5kTGluZU5vXSwgbWFyay5wb3NpdGlvbiwgbWF4TGluZUxlbmd0aClcbiAgcmVzdWx0ICs9IGAkeycgJy5yZXBlYXQob3B0cy5pbmRlbnQpfSR7cGFkU3RhcnQoKG1hcmsubGluZSArIDEpLnRvU3RyaW5nKCksIGxpbmVOb0xlbmd0aCl9IHwgJHtsaW5lLnN0cn1cXG5gXG4gIHJlc3VsdCArPSBgJHsnLScucmVwZWF0KG9wdHMuaW5kZW50ICsgbGluZU5vTGVuZ3RoICsgMyArIGxpbmUucG9zKX1eXFxuYFxuXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IG9wdHMubGluZXNBZnRlcjsgaSsrKSB7XG4gICAgaWYgKGZvdW5kTGluZU5vICsgaSA+PSBsaW5lRW5kcy5sZW5ndGgpIGJyZWFrXG4gICAgY29uc3QgbGluZSA9IGdldExpbmUoXG4gICAgICBtYXJrLmJ1ZmZlcixcbiAgICAgIGxpbmVTdGFydHNbZm91bmRMaW5lTm8gKyBpXSxcbiAgICAgIGxpbmVFbmRzW2ZvdW5kTGluZU5vICsgaV0sXG4gICAgICBtYXJrLnBvc2l0aW9uIC0gKGxpbmVTdGFydHNbZm91bmRMaW5lTm9dIC0gbGluZVN0YXJ0c1tmb3VuZExpbmVObyArIGldKSxcbiAgICAgIG1heExpbmVMZW5ndGhcbiAgICApXG4gICAgcmVzdWx0ICs9IGAkeycgJy5yZXBlYXQob3B0cy5pbmRlbnQpfSR7cGFkU3RhcnQoKG1hcmsubGluZSArIGkgKyAxKS50b1N0cmluZygpLCBsaW5lTm9MZW5ndGgpfSB8ICR7bGluZS5zdHJ9XFxuYFxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdC5yZXBsYWNlKC9cXG4kLywgJycpXG59XG5cbmV4cG9ydCBkZWZhdWx0IG1ha2VTbmlwcGV0XG4iLCAiaW1wb3J0IG1ha2VTbmlwcGV0LCB7IHR5cGUgU25pcHBldE1hcmsgfSBmcm9tICcuL3NuaXBwZXQudHMnXG5cbi8vIFlBTUwgZXJyb3IgY2xhc3MuIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODQ1ODk4NFxuLy9cbmZ1bmN0aW9uIGZvcm1hdEVycm9yIChleGNlcHRpb246IFlBTUxFeGNlcHRpb24sIGNvbXBhY3Q/OiBib29sZWFuKSB7XG4gIGxldCB3aGVyZSA9ICcnXG5cbiAgaWYgKCFleGNlcHRpb24ubWFyaykgcmV0dXJuIGV4Y2VwdGlvbi5yZWFzb25cblxuICBpZiAoZXhjZXB0aW9uLm1hcmsubmFtZSkge1xuICAgIHdoZXJlICs9IGBpbiBcIiR7ZXhjZXB0aW9uLm1hcmsubmFtZX1cIiBgXG4gIH1cblxuICB3aGVyZSArPSBgKCR7ZXhjZXB0aW9uLm1hcmsubGluZSArIDF9OiR7ZXhjZXB0aW9uLm1hcmsuY29sdW1uICsgMX0pYFxuXG4gIGlmICghY29tcGFjdCAmJiBleGNlcHRpb24ubWFyay5zbmlwcGV0KSB7XG4gICAgd2hlcmUgKz0gYFxcblxcbiR7ZXhjZXB0aW9uLm1hcmsuc25pcHBldH1gXG4gIH1cblxuICByZXR1cm4gYCR7ZXhjZXB0aW9uLnJlYXNvbn0gJHt3aGVyZX1gXG59XG5cbmNsYXNzIFlBTUxFeGNlcHRpb24gZXh0ZW5kcyBFcnJvciB7XG4gIHJlYXNvbjogc3RyaW5nXG4gIG1hcms/OiBTbmlwcGV0TWFya1xuXG4gIGNvbnN0cnVjdG9yIChyZWFzb246IHN0cmluZywgbWFyaz86IFNuaXBwZXRNYXJrKSB7XG4gICAgc3VwZXIoKVxuXG4gICAgdGhpcy5uYW1lID0gJ1lBTUxFeGNlcHRpb24nXG4gICAgdGhpcy5yZWFzb24gPSByZWFzb25cbiAgICB0aGlzLm1hcmsgPSBtYXJrXG4gICAgdGhpcy5tZXNzYWdlID0gZm9ybWF0RXJyb3IodGhpcywgZmFsc2UpXG5cbiAgICAvLyBHdWFyZCBmb3IgYW5jaWVudCBicm93c2Vyc1xuICAgIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuICAgICAgLy8gSW5jbHVkZSBzdGFjayB0cmFjZSBpbiBlcnJvciBvYmplY3QsXG4gICAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCB0aGlzLmNvbnN0cnVjdG9yKVxuICAgIH1cbiAgfVxuXG4gIHRvU3RyaW5nIChjb21wYWN0PzogYm9vbGVhbikge1xuICAgIHJldHVybiBgJHt0aGlzLm5hbWV9OiAke2Zvcm1hdEVycm9yKHRoaXMsIGNvbXBhY3QpfWBcbiAgfVxufVxuXG4vLyBCdWlsZCBhIFlBTUxFeGNlcHRpb24gd2l0aCBhIHNvdXJjZSBzbmlwcGV0IGFuZCB0aHJvdyBpdC4gYHNvdXJjZWAgaXMgdGhlXG4vLyByYXcgaW5wdXQgdGV4dCAobm8gcGFyc2VyIHNlbnRpbmVsKTsgYHBvc2l0aW9uYCBpcyBhbiBvZmZzZXQgaW50byBpdC5cbmZ1bmN0aW9uIHRocm93RXJyb3JBdCAoc291cmNlOiBzdHJpbmcsIHBvc2l0aW9uOiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZywgZmlsZW5hbWUgPSAnJyk6IG5ldmVyIHtcbiAgbGV0IGxpbmUgPSAwXG4gIGxldCBsaW5lU3RhcnQgPSAwXG5cbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHBvc2l0aW9uOyBpbmRleCsrKSB7XG4gICAgY29uc3QgY2ggPSBzb3VyY2UuY2hhckNvZGVBdChpbmRleClcblxuICAgIGlmIChjaCA9PT0gMHgwQS8qIExGICovKSB7XG4gICAgICBsaW5lKytcbiAgICAgIGxpbmVTdGFydCA9IGluZGV4ICsgMVxuICAgIH0gZWxzZSBpZiAoY2ggPT09IDB4MEQvKiBDUiAqLykge1xuICAgICAgbGluZSsrXG4gICAgICBpZiAoc291cmNlLmNoYXJDb2RlQXQoaW5kZXggKyAxKSA9PT0gMHgwQS8qIExGICovKSBpbmRleCsrXG4gICAgICBsaW5lU3RhcnQgPSBpbmRleCArIDFcbiAgICB9XG4gIH1cblxuICBjb25zdCBtYXJrOiBTbmlwcGV0TWFyayA9IHtcbiAgICBuYW1lOiBmaWxlbmFtZSxcbiAgICBidWZmZXI6IHNvdXJjZSxcbiAgICBwb3NpdGlvbixcbiAgICBsaW5lLFxuICAgIGNvbHVtbjogcG9zaXRpb24gLSBsaW5lU3RhcnRcbiAgfVxuXG4gIG1hcmsuc25pcHBldCA9IG1ha2VTbmlwcGV0KG1hcmspXG4gIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKG1lc3NhZ2UsIG1hcmspXG59XG5cbmV4cG9ydCB7IFlBTUxFeGNlcHRpb24sIHRocm93RXJyb3JBdCB9XG4iLCAiY29uc3QgRVZFTlRfRE9DVU1FTlQgPSAxXG5jb25zdCBFVkVOVF9TRVFVRU5DRSA9IDJcbmNvbnN0IEVWRU5UX01BUFBJTkcgPSAzXG5jb25zdCBFVkVOVF9TQ0FMQVIgPSA0XG5jb25zdCBFVkVOVF9BTElBUyA9IDVcbmNvbnN0IEVWRU5UX1BPUCA9IDZcblxudHlwZSBFdmVudFR5cGUgPVxuICB0eXBlb2YgRVZFTlRfRE9DVU1FTlQgfCB0eXBlb2YgRVZFTlRfU0VRVUVOQ0UgfCB0eXBlb2YgRVZFTlRfTUFQUElORyB8XG4gIHR5cGVvZiBFVkVOVF9TQ0FMQVIgfCB0eXBlb2YgRVZFTlRfQUxJQVMgfCB0eXBlb2YgRVZFTlRfUE9QXG5cbmNvbnN0IFNDQUxBUl9TVFlMRV9QTEFJTiA9IDFcbmNvbnN0IFNDQUxBUl9TVFlMRV9TSU5HTEVfUVVPVEVEID0gMlxuY29uc3QgU0NBTEFSX1NUWUxFX0RPVUJMRV9RVU9URUQgPSAzXG5jb25zdCBTQ0FMQVJfU1RZTEVfTElURVJBTF9CTE9DSyA9IDRcbmNvbnN0IFNDQUxBUl9TVFlMRV9GT0xERURfQkxPQ0sgPSA1XG5cbnR5cGUgU2NhbGFyU3R5bGUgPVxuICB0eXBlb2YgU0NBTEFSX1NUWUxFX1BMQUlOIHwgdHlwZW9mIFNDQUxBUl9TVFlMRV9TSU5HTEVfUVVPVEVEIHxcbiAgdHlwZW9mIFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVEIHwgdHlwZW9mIFNDQUxBUl9TVFlMRV9MSVRFUkFMX0JMT0NLIHxcbiAgdHlwZW9mIFNDQUxBUl9TVFlMRV9GT0xERURfQkxPQ0tcblxuY29uc3QgQ09MTEVDVElPTl9TVFlMRV9CTE9DSyA9IDFcbmNvbnN0IENPTExFQ1RJT05fU1RZTEVfRkxPVyA9IDJcblxudHlwZSBDb2xsZWN0aW9uU3R5bGUgPVxuICB0eXBlb2YgQ09MTEVDVElPTl9TVFlMRV9CTE9DSyB8IHR5cGVvZiBDT0xMRUNUSU9OX1NUWUxFX0ZMT1dcblxuY29uc3QgQ0hPTVBJTkdfQ0xJUCA9IDFcbmNvbnN0IENIT01QSU5HX1NUUklQID0gMlxuY29uc3QgQ0hPTVBJTkdfS0VFUCA9IDNcblxudHlwZSBDaG9tcGluZyA9XG4gIHR5cGVvZiBDSE9NUElOR19DTElQIHwgdHlwZW9mIENIT01QSU5HX1NUUklQIHwgdHlwZW9mIENIT01QSU5HX0tFRVBcblxudHlwZSBEb2N1bWVudERpcmVjdGl2ZSA9XG4gIHsga2luZDogJ3lhbWwnLCB2ZXJzaW9uOiBzdHJpbmcgfSB8XG4gIHsga2luZDogJ3RhZycsIGhhbmRsZTogc3RyaW5nLCBwcmVmaXg6IHN0cmluZyB9XG5cbnR5cGUgVGFnSGFuZGxlcnMgPSBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+XG5cbmludGVyZmFjZSBEb2N1bWVudEV2ZW50IHtcbiAgdHlwZTogdHlwZW9mIEVWRU5UX0RPQ1VNRU5UXG4gIGV4cGxpY2l0U3RhcnQ6IGJvb2xlYW5cbiAgZXhwbGljaXRFbmQ6IGJvb2xlYW5cbiAgZGlyZWN0aXZlczogRG9jdW1lbnREaXJlY3RpdmVbXVxufVxuXG5pbnRlcmZhY2UgU2VxdWVuY2VFdmVudCB7XG4gIHR5cGU6IHR5cGVvZiBFVkVOVF9TRVFVRU5DRVxuICBzdGFydDogbnVtYmVyXG4gIGFuY2hvclN0YXJ0OiBudW1iZXJcbiAgYW5jaG9yRW5kOiBudW1iZXJcbiAgdGFnU3RhcnQ6IG51bWJlclxuICB0YWdFbmQ6IG51bWJlclxuICBzdHlsZTogQ29sbGVjdGlvblN0eWxlXG59XG5cbmludGVyZmFjZSBNYXBwaW5nRXZlbnQge1xuICB0eXBlOiB0eXBlb2YgRVZFTlRfTUFQUElOR1xuICBzdGFydDogbnVtYmVyXG4gIGFuY2hvclN0YXJ0OiBudW1iZXJcbiAgYW5jaG9yRW5kOiBudW1iZXJcbiAgdGFnU3RhcnQ6IG51bWJlclxuICB0YWdFbmQ6IG51bWJlclxuICBzdHlsZTogQ29sbGVjdGlvblN0eWxlXG59XG5cbmludGVyZmFjZSBTY2FsYXJFdmVudCB7XG4gIHR5cGU6IHR5cGVvZiBFVkVOVF9TQ0FMQVJcbiAgdmFsdWVTdGFydDogbnVtYmVyXG4gIHZhbHVlRW5kOiBudW1iZXJcbiAgYW5jaG9yU3RhcnQ6IG51bWJlclxuICBhbmNob3JFbmQ6IG51bWJlclxuICB0YWdTdGFydDogbnVtYmVyXG4gIHRhZ0VuZDogbnVtYmVyXG4gIHN0eWxlOiBTY2FsYXJTdHlsZVxuICBjaG9tcGluZzogQ2hvbXBpbmdcbiAgaW5kZW50OiBudW1iZXJcbiAgZmFzdDogYm9vbGVhblxufVxuXG5pbnRlcmZhY2UgQWxpYXNFdmVudCB7XG4gIHR5cGU6IHR5cGVvZiBFVkVOVF9BTElBU1xuICBhbmNob3JTdGFydDogbnVtYmVyXG4gIGFuY2hvckVuZDogbnVtYmVyXG59XG5cbmludGVyZmFjZSBQb3BFdmVudCB7XG4gIHR5cGU6IHR5cGVvZiBFVkVOVF9QT1Bcbn1cblxudHlwZSBFdmVudCA9XG4gIERvY3VtZW50RXZlbnQgfFxuICBTZXF1ZW5jZUV2ZW50IHxcbiAgTWFwcGluZ0V2ZW50IHxcbiAgU2NhbGFyRXZlbnQgfFxuICBBbGlhc0V2ZW50IHxcbiAgUG9wRXZlbnRcblxuZXhwb3J0IHtcbiAgRVZFTlRfRE9DVU1FTlQsXG4gIEVWRU5UX1NFUVVFTkNFLFxuICBFVkVOVF9NQVBQSU5HLFxuICBFVkVOVF9TQ0FMQVIsXG4gIEVWRU5UX0FMSUFTLFxuICBFVkVOVF9QT1AsXG5cbiAgU0NBTEFSX1NUWUxFX1BMQUlOLFxuICBTQ0FMQVJfU1RZTEVfU0lOR0xFX1FVT1RFRCxcbiAgU0NBTEFSX1NUWUxFX0RPVUJMRV9RVU9URUQsXG4gIFNDQUxBUl9TVFlMRV9MSVRFUkFMX0JMT0NLLFxuICBTQ0FMQVJfU1RZTEVfRk9MREVEX0JMT0NLLFxuXG4gIENPTExFQ1RJT05fU1RZTEVfQkxPQ0ssXG4gIENPTExFQ1RJT05fU1RZTEVfRkxPVyxcblxuICBDSE9NUElOR19DTElQLFxuICBDSE9NUElOR19TVFJJUCxcbiAgQ0hPTVBJTkdfS0VFUCxcblxuICB0eXBlIEV2ZW50VHlwZSxcbiAgdHlwZSBTY2FsYXJTdHlsZSxcbiAgdHlwZSBDb2xsZWN0aW9uU3R5bGUsXG5cbiAgdHlwZSBDaG9tcGluZyxcbiAgdHlwZSBEb2N1bWVudERpcmVjdGl2ZSxcbiAgdHlwZSBUYWdIYW5kbGVycyxcbiAgdHlwZSBEb2N1bWVudEV2ZW50LFxuICB0eXBlIFNlcXVlbmNlRXZlbnQsXG4gIHR5cGUgTWFwcGluZ0V2ZW50LFxuICB0eXBlIFNjYWxhckV2ZW50LFxuICB0eXBlIEFsaWFzRXZlbnQsXG4gIHR5cGUgUG9wRXZlbnQsXG4gIHR5cGUgRXZlbnRcbn1cbiIsICJpbXBvcnQge1xuICBTQ0FMQVJfU1RZTEVfU0lOR0xFX1FVT1RFRCxcbiAgU0NBTEFSX1NUWUxFX0RPVUJMRV9RVU9URUQsXG4gIFNDQUxBUl9TVFlMRV9MSVRFUkFMX0JMT0NLLFxuICBTQ0FMQVJfU1RZTEVfRk9MREVEX0JMT0NLLFxuICBDSE9NUElOR19TVFJJUCxcbiAgQ0hPTVBJTkdfS0VFUCxcbiAgdHlwZSBTY2FsYXJFdmVudFxufSBmcm9tICcuL2V2ZW50cy50cydcblxuY29uc3QgTk9fUkFOR0UgPSAtMVxuXG4vLyAtLS0gY2hhcmFjdGVyIGhlbHBlcnMgKG1pcnJvcnMgc3JjL2xvYWRlci50cywga2VwdCBzZWxmLWNvbnRhaW5lZCBoZXJlKSAtLS1cblxuZnVuY3Rpb24gc2ltcGxlRXNjYXBlU2VxdWVuY2UgKGM6IG51bWJlcikge1xuICBzd2l0Y2ggKGMpIHtcbiAgICBjYXNlIDB4MzAvKiAwICovOiByZXR1cm4gJ1xceDAwJ1xuICAgIGNhc2UgMHg2MS8qIGEgKi86IHJldHVybiAnXFx4MDcnXG4gICAgY2FzZSAweDYyLyogYiAqLzogcmV0dXJuICdcXHgwOCdcbiAgICBjYXNlIDB4NzQvKiB0ICovOiByZXR1cm4gJ1xceDA5J1xuICAgIGNhc2UgMHgwOS8qIFRhYiAqLzogcmV0dXJuICdcXHgwOSdcbiAgICBjYXNlIDB4NkUvKiBuICovOiByZXR1cm4gJ1xceDBBJ1xuICAgIGNhc2UgMHg3Ni8qIHYgKi86IHJldHVybiAnXFx4MEInXG4gICAgY2FzZSAweDY2LyogZiAqLzogcmV0dXJuICdcXHgwQydcbiAgICBjYXNlIDB4NzIvKiByICovOiByZXR1cm4gJ1xceDBEJ1xuICAgIGNhc2UgMHg2NS8qIGUgKi86IHJldHVybiAnXFx4MUInXG4gICAgY2FzZSAweDIwLyogU3BhY2UgKi86IHJldHVybiAnICdcbiAgICBjYXNlIDB4MjIvKiBcIiAqLzogcmV0dXJuICdcXHgyMidcbiAgICBjYXNlIDB4MkYvKiAvICovOiByZXR1cm4gJy8nXG4gICAgY2FzZSAweDVDLyogXFwgKi86IHJldHVybiAnXFx4NUMnXG4gICAgY2FzZSAweDRFLyogTiAqLzogcmV0dXJuICdcXHg4NSdcbiAgICBjYXNlIDB4NUYvKiBfICovOiByZXR1cm4gJ1xceEEwJ1xuICAgIGNhc2UgMHg0Qy8qIEwgKi86IHJldHVybiAnXFx1MjAyOCdcbiAgICBjYXNlIDB4NTAvKiBQICovOiByZXR1cm4gJ1xcdTIwMjknXG4gICAgZGVmYXVsdDogcmV0dXJuICcnXG4gIH1cbn1cblxuY29uc3Qgc2ltcGxlRXNjYXBlQ2hlY2sgPSBuZXcgQXJyYXkoMjU2KVxuY29uc3Qgc2ltcGxlRXNjYXBlTWFwID0gbmV3IEFycmF5KDI1NilcbmZvciAobGV0IGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgc2ltcGxlRXNjYXBlQ2hlY2tbaV0gPSBzaW1wbGVFc2NhcGVTZXF1ZW5jZShpKSA/IDEgOiAwXG4gIHNpbXBsZUVzY2FwZU1hcFtpXSA9IHNpbXBsZUVzY2FwZVNlcXVlbmNlKGkpXG59XG5cbmZ1bmN0aW9uIGNoYXJGcm9tQ29kZXBvaW50IChjOiBudW1iZXIpIHtcbiAgaWYgKGMgPD0gMHhGRkZGKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoYylcbiAgfVxuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShcbiAgICAoKGMgLSAweDAxMDAwMCkgPj4gMTApICsgMHhEODAwLFxuICAgICgoYyAtIDB4MDEwMDAwKSAmIDB4MDNGRikgKyAweERDMDBcbiAgKVxufVxuXG5mdW5jdGlvbiBmcm9tSGV4Q29kZSAoYzogbnVtYmVyKSB7XG4gIGlmIChjID49IDB4MzAvKiAwICovICYmIGMgPD0gMHgzOS8qIDkgKi8pIHJldHVybiBjIC0gMHgzMFxuICBjb25zdCBsYyA9IGMgfCAweDIwXG4gIC8vIERvdWJsZS1xdW90ZWQgc2NhbGFyIHJhbmdlcyBhcmUgdmFsaWRhdGVkIGJ5IHBhcnNlci50cyBiZWZvcmUgY29va2luZy5cbiAgcmV0dXJuIGxjIC0gMHg2MSArIDEwXG59XG5cbmZ1bmN0aW9uIGVzY2FwZWRIZXhMZW4gKGM6IG51bWJlcikge1xuICBpZiAoYyA9PT0gMHg3OC8qIHggKi8pIHJldHVybiAyXG4gIGlmIChjID09PSAweDc1LyogdSAqLykgcmV0dXJuIDRcbiAgLy8gRG91YmxlLXF1b3RlZCBzY2FsYXIgcmFuZ2VzIGFyZSB2YWxpZGF0ZWQgYnkgcGFyc2VyLnRzIGJlZm9yZSBjb29raW5nLlxuICByZXR1cm4gOFxufVxuXG4vLyAtLS0gbGluZSBmb2xkaW5nIGhlbHBlcnMgLS0tXG5cbi8vIFNraXAgYSBydW4gb2YgbGluZSBicmVha3MgcGx1cyB0aGUgbGVhZGluZyB3aGl0ZXNwYWNlIG9mIHRoZSBmb2xsb3dpbmdcbi8vIGxpbmVzLCByZXR1cm5pbmcgdGhlIG51bWJlciBvZiBsaW5lIGJyZWFrcyBjb25zdW1lZCBhbmQgdGhlIG5ldyBwb3NpdGlvbi5cbmZ1bmN0aW9uIHNraXBGb2xkZWRCcmVha3MgKGlucHV0OiBzdHJpbmcsIHBvc2l0aW9uOiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XG4gIGxldCBicmVha3MgPSAwXG5cbiAgd2hpbGUgKHBvc2l0aW9uIDwgZW5kKSB7XG4gICAgY29uc3QgY2ggPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSAweDBBLyogTEYgKi8pIHtcbiAgICAgIGJyZWFrcysrXG4gICAgICBwb3NpdGlvbisrXG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHgwRC8qIENSICovKSB7XG4gICAgICBicmVha3MrK1xuICAgICAgcG9zaXRpb24rK1xuICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pID09PSAweDBBLyogTEYgKi8pIHBvc2l0aW9uKytcbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDIwLyogU3BhY2UgKi8gfHwgY2ggPT09IDB4MDkvKiBUYWIgKi8pIHtcbiAgICAgIHBvc2l0aW9uKytcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyBwb3NpdGlvbiwgYnJlYWtzIH1cbn1cblxuLy8gRm9sZGluZyBvZiBsaW5lIGJyZWFrcyBiZXR3ZWVuIGNvbnRlbnQgY2h1bmtzOiBhIHNpbmdsZSBicmVhayBiZWNvbWVzIGFcbi8vIHNwYWNlLCBzZXZlcmFsIGJyZWFrcyBiZWNvbWUgKGNvdW50IC0gMSkgbmV3bGluZXMuXG5mdW5jdGlvbiBmb2xkZWRCcmVha3MgKGNvdW50OiBudW1iZXIpIHtcbiAgaWYgKGNvdW50ID09PSAxKSByZXR1cm4gJyAnXG4gIC8vIENhbGxlZCBvbmx5IGFmdGVyIHNraXBGb2xkZWRCcmVha3MoKSBjb25zdW1lZCBhdCBsZWFzdCBvbmUgbGluZSBicmVhay5cbiAgcmV0dXJuICdcXG4nLnJlcGVhdChjb3VudCAtIDEpXG59XG5cbi8vIC0tLSBwZXItc3R5bGUgZXh0cmFjdG9ycyAtLS1cblxuZnVuY3Rpb24gZ2V0UGxhaW5WYWx1ZSAoaW5wdXQ6IHN0cmluZywgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGxldCBwb3NpdGlvbiA9IHN0YXJ0XG4gIGxldCBjYXB0dXJlU3RhcnQgPSBzdGFydFxuICBsZXQgY2FwdHVyZUVuZCA9IHN0YXJ0XG5cbiAgd2hpbGUgKHBvc2l0aW9uIDwgZW5kKSB7XG4gICAgY29uc3QgY2ggPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSAweDBBLyogTEYgKi8gfHwgY2ggPT09IDB4MEQvKiBDUiAqLykge1xuICAgICAgcmVzdWx0ICs9IGlucHV0LnNsaWNlKGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZClcbiAgICAgIGNvbnN0IGZvbGQgPSBza2lwRm9sZGVkQnJlYWtzKGlucHV0LCBwb3NpdGlvbiwgZW5kKVxuICAgICAgcmVzdWx0ICs9IGZvbGRlZEJyZWFrcyhmb2xkLmJyZWFrcylcbiAgICAgIHBvc2l0aW9uID0gY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IGZvbGQucG9zaXRpb25cbiAgICB9IGVsc2Uge1xuICAgICAgcG9zaXRpb24rK1xuICAgICAgaWYgKGNoICE9PSAweDIwLyogU3BhY2UgKi8gJiYgY2ggIT09IDB4MDkvKiBUYWIgKi8pIGNhcHR1cmVFbmQgPSBwb3NpdGlvblxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQgKyBpbnB1dC5zbGljZShjYXB0dXJlU3RhcnQsIGNhcHR1cmVFbmQpXG59XG5cbmZ1bmN0aW9uIGdldFNpbmdsZVF1b3RlZFZhbHVlIChpbnB1dDogc3RyaW5nLCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xuICBsZXQgcmVzdWx0ID0gJydcbiAgbGV0IHBvc2l0aW9uID0gc3RhcnRcbiAgbGV0IGNhcHR1cmVTdGFydCA9IHN0YXJ0XG4gIGxldCBjYXB0dXJlRW5kID0gc3RhcnRcblxuICB3aGlsZSAocG9zaXRpb24gPCBlbmQpIHtcbiAgICBjb25zdCBjaCA9IGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pXG5cbiAgICBpZiAoY2ggPT09IDB4MjcvKiAnICovKSB7XG4gICAgICAvLyBXaXRoaW4gdGhlIHN0b3JlZCByYW5nZSBldmVyeSBxdW90ZSBpcyBwYXJ0IG9mIGFuIGVzY2FwZWQgJycgcGFpci5cbiAgICAgIHJlc3VsdCArPSBpbnB1dC5zbGljZShjYXB0dXJlU3RhcnQsIHBvc2l0aW9uKSArIFwiJ1wiXG4gICAgICBwb3NpdGlvbiArPSAyXG4gICAgICBjYXB0dXJlU3RhcnQgPSBjYXB0dXJlRW5kID0gcG9zaXRpb25cbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDBBLyogTEYgKi8gfHwgY2ggPT09IDB4MEQvKiBDUiAqLykge1xuICAgICAgcmVzdWx0ICs9IGlucHV0LnNsaWNlKGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZClcbiAgICAgIGNvbnN0IGZvbGQgPSBza2lwRm9sZGVkQnJlYWtzKGlucHV0LCBwb3NpdGlvbiwgZW5kKVxuICAgICAgcmVzdWx0ICs9IGZvbGRlZEJyZWFrcyhmb2xkLmJyZWFrcylcbiAgICAgIHBvc2l0aW9uID0gY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IGZvbGQucG9zaXRpb25cbiAgICB9IGVsc2Uge1xuICAgICAgcG9zaXRpb24rK1xuICAgICAgaWYgKGNoICE9PSAweDIwLyogU3BhY2UgKi8gJiYgY2ggIT09IDB4MDkvKiBUYWIgKi8pIGNhcHR1cmVFbmQgPSBwb3NpdGlvblxuICAgIH1cbiAgfVxuXG4gIC8vIFdoaXRlc3BhY2UgcmlnaHQgYmVmb3JlIHRoZSBjbG9zaW5nIHF1b3RlIGlzIHNpZ25pZmljYW50IChpdCBpcyBvbmx5XG4gIC8vIHN0cmlwcGVkIHdoZW4gZm9sbG93ZWQgYnkgYSBsaW5lIGJyZWFrKS5cbiAgcmV0dXJuIHJlc3VsdCArIGlucHV0LnNsaWNlKGNhcHR1cmVTdGFydCwgZW5kKVxufVxuXG5mdW5jdGlvbiBnZXREb3VibGVRdW90ZWRWYWx1ZSAoaW5wdXQ6IHN0cmluZywgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGxldCBwb3NpdGlvbiA9IHN0YXJ0XG4gIGxldCBjYXB0dXJlU3RhcnQgPSBzdGFydFxuICBsZXQgY2FwdHVyZUVuZCA9IHN0YXJ0XG5cbiAgd2hpbGUgKHBvc2l0aW9uIDwgZW5kKSB7XG4gICAgY29uc3QgY2ggPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSAweDVDLyogXFwgKi8pIHtcbiAgICAgIHJlc3VsdCArPSBpbnB1dC5zbGljZShjYXB0dXJlU3RhcnQsIHBvc2l0aW9uKVxuICAgICAgcG9zaXRpb24rK1xuICAgICAgY29uc3QgZXNjYXBlZCA9IGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pXG5cbiAgICAgIGlmIChlc2NhcGVkID09PSAweDBBLyogTEYgKi8gfHwgZXNjYXBlZCA9PT0gMHgwRC8qIENSICovKSB7XG4gICAgICAgIC8vIEVzY2FwZWQgbGluZSBicmVhazogYSBsaW5lIGNvbnRpbnVhdGlvbiB0aGF0IGpvaW5zIHdpdGggbm90aGluZy5cbiAgICAgICAgcG9zaXRpb24gPSBza2lwRm9sZGVkQnJlYWtzKGlucHV0LCBwb3NpdGlvbiwgZW5kKS5wb3NpdGlvblxuICAgICAgfSBlbHNlIGlmIChlc2NhcGVkIDwgMjU2ICYmIHNpbXBsZUVzY2FwZUNoZWNrW2VzY2FwZWRdKSB7XG4gICAgICAgIHJlc3VsdCArPSBzaW1wbGVFc2NhcGVNYXBbZXNjYXBlZF1cbiAgICAgICAgcG9zaXRpb24rK1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcGFyc2VyLnRzIGhhcyBhbHJlYWR5IHJlamVjdGVkIHVua25vd24gZXNjYXBlcyBhbmQgaW52YWxpZCBoZXggZGlnaXRzLlxuICAgICAgICBsZXQgaGV4TGVuZ3RoID0gZXNjYXBlZEhleExlbihlc2NhcGVkKVxuICAgICAgICBsZXQgaGV4UmVzdWx0ID0gMFxuXG4gICAgICAgIGZvciAoOyBoZXhMZW5ndGggPiAwOyBoZXhMZW5ndGgtLSkge1xuICAgICAgICAgIHBvc2l0aW9uKytcbiAgICAgICAgICBjb25zdCBkaWdpdCA9IGZyb21IZXhDb2RlKGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pKVxuICAgICAgICAgIGhleFJlc3VsdCA9IChoZXhSZXN1bHQgPDwgNCkgKyBkaWdpdFxuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0ICs9IGNoYXJGcm9tQ29kZXBvaW50KGhleFJlc3VsdClcbiAgICAgICAgcG9zaXRpb24rK1xuICAgICAgfVxuXG4gICAgICBjYXB0dXJlU3RhcnQgPSBjYXB0dXJlRW5kID0gcG9zaXRpb25cbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDBBLyogTEYgKi8gfHwgY2ggPT09IDB4MEQvKiBDUiAqLykge1xuICAgICAgcmVzdWx0ICs9IGlucHV0LnNsaWNlKGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZClcbiAgICAgIGNvbnN0IGZvbGQgPSBza2lwRm9sZGVkQnJlYWtzKGlucHV0LCBwb3NpdGlvbiwgZW5kKVxuICAgICAgcmVzdWx0ICs9IGZvbGRlZEJyZWFrcyhmb2xkLmJyZWFrcylcbiAgICAgIHBvc2l0aW9uID0gY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IGZvbGQucG9zaXRpb25cbiAgICB9IGVsc2Uge1xuICAgICAgcG9zaXRpb24rK1xuICAgICAgaWYgKGNoICE9PSAweDIwLyogU3BhY2UgKi8gJiYgY2ggIT09IDB4MDkvKiBUYWIgKi8pIGNhcHR1cmVFbmQgPSBwb3NpdGlvblxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQgKyBpbnB1dC5zbGljZShjYXB0dXJlU3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gZ2V0QmxvY2tWYWx1ZSAoXG4gIGlucHV0OiBzdHJpbmcsXG4gIHN0YXJ0OiBudW1iZXIsXG4gIGVuZDogbnVtYmVyLFxuICBpbmRlbnQ6IG51bWJlcixcbiAgY2hvbXBpbmc6IG51bWJlcixcbiAgZm9sZGVkOiBib29sZWFuXG4pIHtcbiAgY29uc3QgdGV4dEluZGVudCA9IGluZGVudCA8IDAgPyAwIDogaW5kZW50XG4gIC8vIFRoZSByYW5nZSBzdGFydHMgYXQgY29sdW1uIDAgb2YgdGhlIGZpcnN0IGxpbmUgYW5kIGluY2x1ZGVzIGV2ZXJ5IGxpbmVcbiAgLy8gYnJlYWssIGluY2x1ZGluZyB0aG9zZSBvZiB0cmFpbGluZyBibGFuayBsaW5lcy5cbiAgY29uc3QgcmVnaW9uID0gaW5wdXQuc2xpY2Uoc3RhcnQsIGVuZCkucmVwbGFjZSgvXFxyXFxuPy9nLCAnXFxuJylcbiAgLy8gQW4gZW1wdHkgcmFuZ2UgaXMgYSBibG9jayB3aXRoIG5vIGxpbmVzIGF0IGFsbCAoZS5nLiBhbiBlbXB0eSBgfCtgKSBhbmRcbiAgLy8gbXVzdCBzdGF5IGVtcHR5OyBhIG5haXZlIHNwbGl0IHdvdWxkIGludmVudCBhIHBoYW50b20gYmxhbmsgbGluZS4gT3RoZXJ3aXNlXG4gIC8vIGEgdHJhaWxpbmcgbGluZSBicmVhayBsZWF2ZXMgYSB0cmFpbGluZyAnJyBmcm9tIHNwbGl0KCkgdGhhdCBpcyBub3QgYSByZWFsXG4gIC8vIGxpbmUgKGp1c3QgdGhlIHRlcm1pbmF0b3Igb2YgdGhlIGxhc3Qgb25lKSwgc28gZHJvcCBpdC4gSW50ZXJpb3IgYmxhbmtcbiAgLy8gbGluZXMgYXJlIGtlcHQuXG4gIGNvbnN0IGxpbmVzID0gcmVnaW9uID09PSAnJ1xuICAgID8gW11cbiAgICA6IChyZWdpb24uZW5kc1dpdGgoJ1xcbicpID8gcmVnaW9uLnNsaWNlKDAsIC0xKSA6IHJlZ2lvbikuc3BsaXQoJ1xcbicpXG5cbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGxldCBkaWRSZWFkQ29udGVudCA9IGZhbHNlXG4gIGxldCBlbXB0eUxpbmVzID0gMFxuICBsZXQgYXRNb3JlSW5kZW50ZWQgPSBmYWxzZVxuXG4gIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgIC8vIFdoaXRlc3BhY2UgYmV5b25kIHRoZSBjb250ZW50IGluZGVudGF0aW9uIGlzIHBhcnQgb2YgdGhlIGNvbnRlbnQsIHNvIHRoZVxuICAgIC8vIGluZGVudGF0aW9uIHNjYW4gc3RvcHMgYXQgdGV4dEluZGVudC4gQSBsaW5lIGlzIGVtcHR5IG9ubHkgd2hlbiBub3RoaW5nXG4gICAgLy8gcmVtYWlucyBhZnRlciB0aGUgKGNhcHBlZCkgaW5kZW50YXRpb24uXG4gICAgLy8gaW5kZW50IDwgMCBtZWFucyBubyBjb250ZW50IGxpbmUgd2FzIGRldGVjdGVkIChhIHdob2xseSBibGFuayBibG9jayksIHNvXG4gICAgLy8gZXZlcnkgbGluZSBpcyBhbiBlbXB0eSBsaW5lLlxuICAgIGxldCBjb2x1bW4gPSAwXG4gICAgd2hpbGUgKGNvbHVtbiA8IHRleHRJbmRlbnQgJiYgbGluZS5jaGFyQ29kZUF0KGNvbHVtbikgPT09IDB4MjAvKiBTcGFjZSAqLykgY29sdW1uKytcblxuICAgIGlmIChpbmRlbnQgPCAwIHx8IGNvbHVtbiA+PSBsaW5lLmxlbmd0aCkge1xuICAgICAgZW1wdHlMaW5lcysrXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIGNvbnN0IGNvbnRlbnQgPSBsaW5lLnNsaWNlKHRleHRJbmRlbnQpXG4gICAgY29uc3QgZmlyc3QgPSBjb250ZW50LmNoYXJDb2RlQXQoMClcblxuICAgIGlmIChmb2xkZWQpIHtcbiAgICAgIGlmIChmaXJzdCA9PT0gMHgyMC8qIFNwYWNlICovIHx8IGZpcnN0ID09PSAweDA5LyogVGFiICovKSB7XG4gICAgICAgIC8vIE1vcmUtaW5kZW50ZWQgbGluZXMgYXJlIG5vdCBmb2xkZWQuXG4gICAgICAgIGF0TW9yZUluZGVudGVkID0gdHJ1ZVxuICAgICAgICByZXN1bHQgKz0gJ1xcbicucmVwZWF0KGRpZFJlYWRDb250ZW50ID8gMSArIGVtcHR5TGluZXMgOiBlbXB0eUxpbmVzKVxuICAgICAgfSBlbHNlIGlmIChhdE1vcmVJbmRlbnRlZCkge1xuICAgICAgICBhdE1vcmVJbmRlbnRlZCA9IGZhbHNlXG4gICAgICAgIHJlc3VsdCArPSAnXFxuJy5yZXBlYXQoZW1wdHlMaW5lcyArIDEpXG4gICAgICB9IGVsc2UgaWYgKGVtcHR5TGluZXMgPT09IDApIHtcbiAgICAgICAgaWYgKGRpZFJlYWRDb250ZW50KSByZXN1bHQgKz0gJyAnXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgKz0gJ1xcbicucmVwZWF0KGVtcHR5TGluZXMpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCArPSAnXFxuJy5yZXBlYXQoZGlkUmVhZENvbnRlbnQgPyAxICsgZW1wdHlMaW5lcyA6IGVtcHR5TGluZXMpXG4gICAgfVxuXG4gICAgcmVzdWx0ICs9IGNvbnRlbnRcbiAgICBkaWRSZWFkQ29udGVudCA9IHRydWVcbiAgICBlbXB0eUxpbmVzID0gMFxuICB9XG5cbiAgaWYgKGNob21waW5nID09PSBDSE9NUElOR19LRUVQKSB7XG4gICAgcmVzdWx0ICs9ICdcXG4nLnJlcGVhdChkaWRSZWFkQ29udGVudCA/IDEgKyBlbXB0eUxpbmVzIDogZW1wdHlMaW5lcylcbiAgfSBlbHNlIGlmIChjaG9tcGluZyAhPT0gQ0hPTVBJTkdfU1RSSVApIHtcbiAgICBpZiAoZGlkUmVhZENvbnRlbnQpIHJlc3VsdCArPSAnXFxuJ1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiBnZXRTY2FsYXJWYWx1ZSAoaW5wdXQ6IHN0cmluZywgc2NhbGFyOiBTY2FsYXJFdmVudCk6IHN0cmluZyB7XG4gIGlmIChzY2FsYXIudmFsdWVTdGFydCA9PT0gTk9fUkFOR0UpIHJldHVybiAnJ1xuXG4gIGNvbnN0IHsgdmFsdWVTdGFydCwgdmFsdWVFbmQgfSA9IHNjYWxhclxuXG4gIC8vIEZhc3QgcGF0aDogdGhlIHBhcnNlciBtYXJrZWQgdGhpcyBzY2FsYXIgYXMgYSB2ZXJiYXRpbSBzbGljZSBvZiB0aGUgaW5wdXRcbiAgLy8gKHNpbmdsZS1saW5lIHBsYWluIC8gcXVvdGVkIHdpdGggbm8gZXNjYXBlcyBvciBmb2xkZWQgYnJlYWtzKSwgc28gdGhlXG4gIC8vIHBlci1zdHlsZSBjaGFyIGxvb3AgYmVsb3cgd291bGQganVzdCByZXByb2R1Y2UgdGhlIHNsaWNlLlxuICBpZiAoc2NhbGFyLmZhc3QpIHJldHVybiBpbnB1dC5zbGljZSh2YWx1ZVN0YXJ0LCB2YWx1ZUVuZClcblxuICBzd2l0Y2ggKHNjYWxhci5zdHlsZSkge1xuICAgIGNhc2UgU0NBTEFSX1NUWUxFX1NJTkdMRV9RVU9URUQ6XG4gICAgICByZXR1cm4gZ2V0U2luZ2xlUXVvdGVkVmFsdWUoaW5wdXQsIHZhbHVlU3RhcnQsIHZhbHVlRW5kKVxuICAgIGNhc2UgU0NBTEFSX1NUWUxFX0RPVUJMRV9RVU9URUQ6XG4gICAgICByZXR1cm4gZ2V0RG91YmxlUXVvdGVkVmFsdWUoaW5wdXQsIHZhbHVlU3RhcnQsIHZhbHVlRW5kKVxuICAgIGNhc2UgU0NBTEFSX1NUWUxFX0xJVEVSQUxfQkxPQ0s6XG4gICAgICByZXR1cm4gZ2V0QmxvY2tWYWx1ZShpbnB1dCwgdmFsdWVTdGFydCwgdmFsdWVFbmQsIHNjYWxhci5pbmRlbnQsIHNjYWxhci5jaG9tcGluZywgZmFsc2UpXG4gICAgY2FzZSBTQ0FMQVJfU1RZTEVfRk9MREVEX0JMT0NLOlxuICAgICAgcmV0dXJuIGdldEJsb2NrVmFsdWUoaW5wdXQsIHZhbHVlU3RhcnQsIHZhbHVlRW5kLCBzY2FsYXIuaW5kZW50LCBzY2FsYXIuY2hvbXBpbmcsIHRydWUpXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBnZXRQbGFpblZhbHVlKGlucHV0LCB2YWx1ZVN0YXJ0LCB2YWx1ZUVuZClcbiAgfVxufVxuXG5leHBvcnQge1xuICBnZXRTY2FsYXJWYWx1ZVxufVxuIiwgImNvbnN0IERFRkFVTFRfVEFHX0hBTkRMRVJTOiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PiA9IHtcbiAgJyEnOiAnIScsXG4gICchISc6ICd0YWc6eWFtbC5vcmcsMjAwMjonXG59XG5cbmZ1bmN0aW9uIHRhZ1BlcmNlbnRFbmNvZGUgKHNvdXJjZTogc3RyaW5nKSB7XG4gIHJldHVybiBlbmNvZGVVUkkoc291cmNlKS5yZXBsYWNlKC8hL2csICclMjEnKVxufVxuXG5mdW5jdGlvbiB0YWdOYW1lRnVsbCAocmF3VGFnOiBzdHJpbmcsIHRhZ0hhbmRsZXJzPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgc3RyaW5nPj4pIHtcbiAgaWYgKHJhd1RhZy5zdGFydHNXaXRoKCchPCcpICYmIHJhd1RhZy5lbmRzV2l0aCgnPicpKSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyYXdUYWcuc2xpY2UoMiwgLTEpKVxuICB9XG5cbiAgY29uc3QgaGFuZGxlRW5kID0gcmF3VGFnLmluZGV4T2YoJyEnLCAxKVxuICBjb25zdCBoYW5kbGUgPSBoYW5kbGVFbmQgPT09IC0xID8gJyEnIDogcmF3VGFnLnNsaWNlKDAsIGhhbmRsZUVuZCArIDEpXG4gIGNvbnN0IHByZWZpeCA9IHRhZ0hhbmRsZXJzPy5baGFuZGxlXSA/PyBERUZBVUxUX1RBR19IQU5ETEVSU1toYW5kbGVdID8/IGhhbmRsZVxuXG4gIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocHJlZml4KSArIGRlY29kZVVSSUNvbXBvbmVudChyYXdUYWcuc2xpY2UoaGFuZGxlLmxlbmd0aCkpXG59XG5cbmZ1bmN0aW9uIHRhZ05hbWVTaG9ydCAoZnVsbFRhZzogc3RyaW5nKSB7XG4gIGxldCB0YWcgPSBmdWxsVGFnXG5cbiAgaWYgKHRhZy5jaGFyQ29kZUF0KDApID09PSAweDIxKSB7XG4gICAgdGFnID0gdGFnLnNsaWNlKDEpXG4gICAgcmV0dXJuIGAhJHt0YWdQZXJjZW50RW5jb2RlKHRhZyl9YFxuICB9XG5cbiAgaWYgKHRhZy5zbGljZSgwLCAxOCkgPT09ICd0YWc6eWFtbC5vcmcsMjAwMjonKSB7XG4gICAgcmV0dXJuIGAhISR7dGFnUGVyY2VudEVuY29kZSh0YWcuc2xpY2UoMTgpKX1gXG4gIH1cblxuICByZXR1cm4gYCE8JHt0YWdQZXJjZW50RW5jb2RlKHRhZyl9PmBcbn1cblxuZXhwb3J0IHtcbiAgdGFnTmFtZUZ1bGwsXG4gIHRhZ05hbWVTaG9ydFxufVxuIiwgImltcG9ydCB7XG4gIEVWRU5UX0FMSUFTLFxuICBFVkVOVF9ET0NVTUVOVCxcbiAgRVZFTlRfTUFQUElORyxcbiAgRVZFTlRfUE9QLFxuICBFVkVOVF9TQ0FMQVIsXG4gIEVWRU5UX1NFUVVFTkNFLFxuICBTQ0FMQVJfU1RZTEVfUExBSU4sXG4gIHR5cGUgRXZlbnQsXG4gIHR5cGUgVGFnSGFuZGxlcnMsXG4gIHR5cGUgTWFwcGluZ0V2ZW50LFxuICB0eXBlIFNjYWxhckV2ZW50LFxuICB0eXBlIFNlcXVlbmNlRXZlbnRcbn0gZnJvbSAnLi9ldmVudHMudHMnXG5pbXBvcnQgeyBnZXRTY2FsYXJWYWx1ZSB9IGZyb20gJy4vcGFyc2VyX3NjYWxhci50cydcbmltcG9ydCB7IENPUkVfU0NIRU1BLCB0eXBlIFNjaGVtYSB9IGZyb20gJy4uL3NjaGVtYS50cydcbmltcG9ydCB7XG4gIE1FUkdFX0tFWSxcbiAgTk9UX1JFU09MVkVELFxuICB0eXBlIE1hcHBpbmdUYWdEZWZpbml0aW9uLFxuICB0eXBlIFNjYWxhclRhZ0RlZmluaXRpb24sXG4gIHR5cGUgU2VxdWVuY2VUYWdEZWZpbml0aW9uXG59IGZyb20gJy4uL3RhZy50cydcbmltcG9ydCB7IFlBTUxFeGNlcHRpb24sIHRocm93RXJyb3JBdCB9IGZyb20gJy4uL2NvbW1vbi9leGNlcHRpb24udHMnXG5pbXBvcnQgeyB0YWdOYW1lRnVsbCB9IGZyb20gJy4uL2NvbW1vbi90YWduYW1lLnRzJ1xuXG5jb25zdCBOT19SQU5HRSA9IC0xXG5cbmludGVyZmFjZSBEb2N1bWVudEZyYW1lIHtcbiAga2luZDogJ2RvY3VtZW50J1xuICBwb3NpdGlvbjogbnVtYmVyXG4gIHZhbHVlOiB1bmtub3duXG4gIGhhc1ZhbHVlOiBib29sZWFuXG59XG5cbmludGVyZmFjZSBTZXF1ZW5jZUZyYW1lIHtcbiAga2luZDogJ3NlcXVlbmNlJ1xuICBwb3NpdGlvbjogbnVtYmVyXG4gIHZhbHVlOiBhbnlcbiAgdGFnOiBTZXF1ZW5jZVRhZ0RlZmluaXRpb248YW55LCBhbnk+XG4gIGFuY2hvcjogQW5jaG9yIHwgbnVsbFxuICBpbmRleDogbnVtYmVyXG4gIC8vIFRydWUgd2hlbiB0aGlzIHNlcXVlbmNlIGlzIHRoZSBzb3VyY2UgbGlzdCBvZiBhIGA8PGAgbWVyZ2UgKGA8PDogWy4uLl1gKS5cbiAgLy8gRWFjaCBlbGVtZW50IGlzIHZhbGlkYXRlZCBhcyBhIG1hcHBpbmcgb24gYXJyaXZhbDsgdGhlIG1hdGVyaWFsaXplZCBsaXN0IGlzXG4gIC8vIHRoZW4gZGVsaXZlcmVkIHRvIHRoZSB0YXJnZXQgbWFwcGluZywgd2hpY2ggZm9sZHMgdGhlIGVsZW1lbnRzIGluLlxuICBtZXJnZTogYm9vbGVhblxufVxuXG5pbnRlcmZhY2UgTWFwcGluZ0ZyYW1lIHtcbiAga2luZDogJ21hcHBpbmcnXG4gIHBvc2l0aW9uOiBudW1iZXJcbiAgdmFsdWU6IGFueVxuICB0YWc6IE1hcHBpbmdUYWdEZWZpbml0aW9uPGFueSwgYW55PlxuICBhbmNob3I6IEFuY2hvciB8IG51bGxcbiAga2V5OiB1bmtub3duXG4gIGtleVBvc2l0aW9uOiBudW1iZXJcbiAgaGFzS2V5OiBib29sZWFuXG4gIC8vIEtleXMgYnJvdWdodCBpbiBieSBhIG1lcmdlIHRoYXQgYW4gZXhwbGljaXQgcGFpciBpcyBzdGlsbCBhbGxvd2VkIHRvXG4gIC8vIG92ZXJyaWRlLiBMYXppbHkgYWxsb2NhdGVkOiBzdGF5cyBudWxsIGZvciBtYXBwaW5ncyB3aXRob3V0IGA8PGAuXG4gIG92ZXJyaWRhYmxlOiBTZXQ8dW5rbm93bj4gfCBudWxsXG59XG5cbnR5cGUgRnJhbWUgPSBEb2N1bWVudEZyYW1lIHwgU2VxdWVuY2VGcmFtZSB8IE1hcHBpbmdGcmFtZVxuXG50eXBlIEFueVRhZyA9IFNjYWxhclRhZ0RlZmluaXRpb24gfCBTZXF1ZW5jZVRhZ0RlZmluaXRpb248YW55LCBhbnk+IHwgTWFwcGluZ1RhZ0RlZmluaXRpb248YW55LCBhbnk+XG5cbmludGVyZmFjZSBWYWx1ZUFuZFRhZyB7XG4gIHZhbHVlOiB1bmtub3duXG4gIHRhZzogQW55VGFnXG59XG5cbmludGVyZmFjZSBBbmNob3Ige1xuICB2YWx1ZTogdW5rbm93blxuICB0YWc6IEFueVRhZ1xuICBpc1ZhbHVlRmluYWw6IGJvb2xlYW5cbn1cblxuaW50ZXJmYWNlIENvbnN0cnVjdG9yT3B0aW9ucyB7XG4gIHNvdXJjZTogc3RyaW5nXG4gIGZpbGVuYW1lPzogc3RyaW5nXG4gIHNjaGVtYT86IFNjaGVtYVxuICBqc29uPzogYm9vbGVhblxuICBtYXhUb3RhbE1lcmdlS2V5cz86IG51bWJlclxuICBtYXhBbGlhc2VzPzogbnVtYmVyXG59XG5cbi8vIGBzb3VyY2VgIGlzIGlucHV0IGRhdGEsIG5vdCBjb25maWcg4oCUIHNvIGl0IGhhcyBubyBkZWZhdWx0IGhlcmUuXG5jb25zdCBERUZBVUxUX0NPTlNUUlVDVE9SX09QVElPTlM6IFJlcXVpcmVkPE9taXQ8Q29uc3RydWN0b3JPcHRpb25zLCAnc291cmNlJz4+ID0ge1xuICBmaWxlbmFtZTogJycsXG4gIHNjaGVtYTogQ09SRV9TQ0hFTUEsXG4gIGpzb246IGZhbHNlLFxuICBtYXhUb3RhbE1lcmdlS2V5czogMTAwMDAsXG4gIG1heEFsaWFzZXM6IC0xXG59XG5cbmludGVyZmFjZSBDb25zdHJ1Y3RvclN0YXRlIGV4dGVuZHMgUmVxdWlyZWQ8Q29uc3RydWN0b3JPcHRpb25zPiB7XG4gIGV2ZW50czogRXZlbnRbXVxuICBkb2N1bWVudHM6IHVua25vd25bXVxuICBldmVudEluZGV4OiBudW1iZXJcbiAgcG9zaXRpb246IG51bWJlclxuICBmcmFtZXM6IEZyYW1lW11cbiAgYW5jaG9yczogTWFwPHN0cmluZywgQW5jaG9yPlxuICB0YWdIYW5kbGVyczogVGFnSGFuZGxlcnNcbiAgdG90YWxNZXJnZUtleXM6IG51bWJlclxuICBhbGlhc0NvdW50OiBudW1iZXJcbn1cblxuZnVuY3Rpb24gZXZlbnRQb3NpdGlvbiAoZXZlbnQ6IEV2ZW50KSB7XG4gIGlmICgndGFnU3RhcnQnIGluIGV2ZW50ICYmIGV2ZW50LnRhZ1N0YXJ0ICE9PSBOT19SQU5HRSkgcmV0dXJuIGV2ZW50LnRhZ1N0YXJ0XG4gIGlmICgnYW5jaG9yU3RhcnQnIGluIGV2ZW50ICYmIGV2ZW50LmFuY2hvclN0YXJ0ICE9PSBOT19SQU5HRSkgcmV0dXJuIGV2ZW50LmFuY2hvclN0YXJ0XG4gIGlmICgndmFsdWVTdGFydCcgaW4gZXZlbnQgJiYgZXZlbnQudmFsdWVTdGFydCAhPT0gTk9fUkFOR0UpIHJldHVybiBldmVudC52YWx1ZVN0YXJ0XG4gIGlmICgnc3RhcnQnIGluIGV2ZW50KSByZXR1cm4gZXZlbnQuc3RhcnRcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gdGhyb3dFcnJvciAoc3RhdGU6IENvbnN0cnVjdG9yU3RhdGUsIG1lc3NhZ2U6IHN0cmluZyk6IG5ldmVyIHtcbiAgdGhyb3dFcnJvckF0KHN0YXRlLnNvdXJjZSwgc3RhdGUucG9zaXRpb24sIG1lc3NhZ2UsIHN0YXRlLmZpbGVuYW1lKVxufVxuXG5mdW5jdGlvbiBmaW5hbGl6ZUNvbGxlY3Rpb24gKFxuICBzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSxcbiAgcG9zaXRpb246IG51bWJlcixcbiAgdGFnOiBTZXF1ZW5jZVRhZ0RlZmluaXRpb248YW55LCBhbnk+IHwgTWFwcGluZ1RhZ0RlZmluaXRpb248YW55LCBhbnk+LFxuICBjYXJyaWVyOiB1bmtub3duXG4pIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gdGFnLmZpbmFsaXplKGNhcnJpZXIpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgWUFNTEV4Y2VwdGlvbikgdGhyb3cgZXJyb3JcbiAgICB0aHJvd0Vycm9yQXQoXG4gICAgICBzdGF0ZS5zb3VyY2UsXG4gICAgICBwb3NpdGlvbixcbiAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSxcbiAgICAgIHN0YXRlLmZpbGVuYW1lXG4gICAgKVxuICB9XG59XG5cbmZ1bmN0aW9uIGxvb2t1cFRhZzxUIGV4dGVuZHMgU2NhbGFyVGFnRGVmaW5pdGlvbiB8IFNlcXVlbmNlVGFnRGVmaW5pdGlvbiB8IE1hcHBpbmdUYWdEZWZpbml0aW9uPiAoXG4gIGV4YWN0OiBSZWNvcmQ8c3RyaW5nLCBUPixcbiAgcHJlZml4OiByZWFkb25seSBUW10sXG4gIHRhZ05hbWU6IHN0cmluZ1xuKTogVCB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGV4YWN0VGFnID0gZXhhY3RbdGFnTmFtZV1cbiAgaWYgKGV4YWN0VGFnKSByZXR1cm4gZXhhY3RUYWdcblxuICBmb3IgKGNvbnN0IHRhZyBvZiBwcmVmaXgpIHtcbiAgICBpZiAodGFnTmFtZS5zdGFydHNXaXRoKHRhZy50YWdOYW1lKSkgcmV0dXJuIHRhZ1xuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZFxufVxuXG5mdW5jdGlvbiBmaW5kRXhwbGljaXRUYWc8VCBleHRlbmRzIFNjYWxhclRhZ0RlZmluaXRpb24gfCBTZXF1ZW5jZVRhZ0RlZmluaXRpb24gfCBNYXBwaW5nVGFnRGVmaW5pdGlvbj4gKFxuICBzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSxcbiAgZXhhY3Q6IFJlY29yZDxzdHJpbmcsIFQ+LFxuICBwcmVmaXg6IHJlYWRvbmx5IFRbXSxcbiAgdGFnTmFtZTogc3RyaW5nLFxuICBub2RlS2luZDogVFsnbm9kZUtpbmQnXVxuKSB7XG4gIGNvbnN0IHRhZyA9IGxvb2t1cFRhZyhleGFjdCwgcHJlZml4LCB0YWdOYW1lKVxuICBpZiAodGFnKSByZXR1cm4gdGFnXG5cbiAgdGhyb3dFcnJvcihzdGF0ZSwgYHVua25vd24gJHtub2RlS2luZH0gdGFnICE8JHt0YWdOYW1lfT5gKVxufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RTY2FsYXIgKFxuICBzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSxcbiAgZXZlbnQ6IFNjYWxhckV2ZW50XG4pOiBWYWx1ZUFuZFRhZyB7XG4gIGNvbnN0IHNvdXJjZSA9IGdldFNjYWxhclZhbHVlKHN0YXRlLnNvdXJjZSwgZXZlbnQpXG4gIGNvbnN0IHJhd1RhZyA9IGV2ZW50LnRhZ1N0YXJ0ID09PSBOT19SQU5HRVxuICAgID8gJydcbiAgICA6IHN0YXRlLnNvdXJjZS5zbGljZShldmVudC50YWdTdGFydCwgZXZlbnQudGFnRW5kKVxuICBjb25zdCBzdHJUYWcgPSBzdGF0ZS5zY2hlbWEuZGVmYXVsdFNjYWxhclRhZ1xuXG4gIGlmIChyYXdUYWcgIT09ICcnKSB7XG4gICAgaWYgKHJhd1RhZyA9PT0gJyEnKSByZXR1cm4geyB2YWx1ZTogc291cmNlLCB0YWc6IHN0clRhZyB9XG5cbiAgICBjb25zdCB0YWdOYW1lID0gdGFnTmFtZUZ1bGwocmF3VGFnLCBzdGF0ZS50YWdIYW5kbGVycylcbiAgICBjb25zdCBzY2FsYXJUYWcgPSBsb29rdXBUYWcoc3RhdGUuc2NoZW1hLmV4YWN0LnNjYWxhciwgc3RhdGUuc2NoZW1hLnByZWZpeC5zY2FsYXIsIHRhZ05hbWUpXG5cbiAgICBpZiAoc2NhbGFyVGFnKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBzY2FsYXJUYWcucmVzb2x2ZShzb3VyY2UsIHRydWUsIHRhZ05hbWUpXG5cbiAgICAgIGlmIChyZXN1bHQgPT09IE5PVF9SRVNPTFZFRCkge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCBgY2Fubm90IHJlc29sdmUgYSBub2RlIHdpdGggITwke3RhZ05hbWV9PiBleHBsaWNpdCB0YWdgKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4geyB2YWx1ZTogcmVzdWx0LCB0YWc6IHNjYWxhclRhZyB9XG4gICAgfVxuXG4gICAgLy8gQW4gZW1wdHkgbm9kZSBjYXJyeWluZyBhIGNvbGxlY3Rpb24gdGFnIChlLmcuIGAhIW1hcGAsIGAhIXNlcWApIGlzIGVtaXR0ZWRcbiAgICAvLyBieSB0aGUgcGFyc2VyIGFzIGEgc2NhbGFyIGV2ZW50LCBzaW5jZSB0aGVyZSBpcyBubyBjb2xsZWN0aW9uIHN5bnRheCB0byBrZXlcbiAgICAvLyBvZmYuIFJlc29sdmUgaXQgaGVyZSBieSB0aGUgZXhwbGljaXQgdGFnJ3Mga2luZCBpbnRvIGFuIGVtcHR5IGNvbGxlY3Rpb24uXG4gICAgY29uc3QgY29sbGVjdGlvblRhZ0RlZiA9XG4gICAgICBsb29rdXBUYWcoc3RhdGUuc2NoZW1hLmV4YWN0Lm1hcHBpbmcsIHN0YXRlLnNjaGVtYS5wcmVmaXgubWFwcGluZywgdGFnTmFtZSkgPz9cbiAgICAgIGxvb2t1cFRhZyhzdGF0ZS5zY2hlbWEuZXhhY3Quc2VxdWVuY2UsIHN0YXRlLnNjaGVtYS5wcmVmaXguc2VxdWVuY2UsIHRhZ05hbWUpXG5cbiAgICBpZiAoY29sbGVjdGlvblRhZ0RlZikge1xuICAgICAgaWYgKHNvdXJjZSAhPT0gJycpIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgYGNhbm5vdCByZXNvbHZlIGEgbm9kZSB3aXRoICE8JHt0YWdOYW1lfT4gZXhwbGljaXQgdGFnYClcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2FycmllciA9IGNvbGxlY3Rpb25UYWdEZWYuY3JlYXRlKHRhZ05hbWUpXG4gICAgICBjb25zdCB2YWx1ZSA9IGNvbGxlY3Rpb25UYWdEZWYuY2FycmllcklzUmVzdWx0XG4gICAgICAgID8gY2FycmllclxuICAgICAgICA6IGZpbmFsaXplQ29sbGVjdGlvbihzdGF0ZSwgc3RhdGUucG9zaXRpb24sIGNvbGxlY3Rpb25UYWdEZWYsIGNhcnJpZXIpXG4gICAgICByZXR1cm4geyB2YWx1ZSwgdGFnOiBjb2xsZWN0aW9uVGFnRGVmIH1cbiAgICB9XG5cbiAgICB0aHJvd0Vycm9yKHN0YXRlLCBgdW5rbm93biBzY2FsYXIgdGFnICE8JHt0YWdOYW1lfT5gKVxuICB9XG5cbiAgaWYgKGV2ZW50LnN0eWxlID09PSBTQ0FMQVJfU1RZTEVfUExBSU4pIHtcbiAgICAvLyBjaGFyQXQoMCkgKG5vdCBzb3VyY2VbMF0pIHlpZWxkcyAnJyBmb3IgYW4gZW1wdHkgc291cmNlLCB3aGljaCBpcyB0aGUga2V5XG4gICAgLy8gdGhlIG51bGwgdGFnIGRlY2xhcmVzOyBzb3VyY2VbMF0gd291bGQgYmUgdW5kZWZpbmVkIGFuZCBtaXNzIHRoYXQgYnVja2V0LlxuICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBzdGF0ZS5zY2hlbWEuaW1wbGljaXRTY2FsYXJCeUZpcnN0Q2hhci5nZXQoc291cmNlLmNoYXJBdCgwKSkgPz9cbiAgICAgIHN0YXRlLnNjaGVtYS5pbXBsaWNpdFNjYWxhckFueUZpcnN0Q2hhclxuICAgIGZvciAoY29uc3QgdGFnIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHRhZy5yZXNvbHZlKHNvdXJjZSwgZmFsc2UsIHRhZy50YWdOYW1lKVxuICAgICAgaWYgKHJlc3VsdCAhPT0gTk9UX1JFU09MVkVEKSByZXR1cm4geyB2YWx1ZTogcmVzdWx0LCB0YWcgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IHZhbHVlOiBzdHJUYWcucmVzb2x2ZShzb3VyY2UsIGZhbHNlLCBzdHJUYWcudGFnTmFtZSksIHRhZzogc3RyVGFnIH1cbn1cblxuZnVuY3Rpb24gY29sbGVjdGlvblRhZzxUYWcgZXh0ZW5kcyBTZXF1ZW5jZVRhZ0RlZmluaXRpb24gfCBNYXBwaW5nVGFnRGVmaW5pdGlvbj4gKFxuICBzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSxcbiAgZXZlbnQ6IFNlcXVlbmNlRXZlbnQgfCBNYXBwaW5nRXZlbnQsXG4gIGV4YWN0OiBSZWNvcmQ8c3RyaW5nLCBUYWc+LFxuICBwcmVmaXg6IHJlYWRvbmx5IFRhZ1tdLFxuICBkZWZhdWx0VGFnTmFtZTogc3RyaW5nLFxuICBub2RlS2luZDogVGFnWydub2RlS2luZCddXG4pIHtcbiAgY29uc3QgcmF3VGFnID0gZXZlbnQudGFnU3RhcnQgPT09IE5PX1JBTkdFXG4gICAgPyAnJ1xuICAgIDogc3RhdGUuc291cmNlLnNsaWNlKGV2ZW50LnRhZ1N0YXJ0LCBldmVudC50YWdFbmQpXG4gIGNvbnN0IHRhZ05hbWUgPSByYXdUYWcgPT09ICcnIHx8IHJhd1RhZyA9PT0gJyEnXG4gICAgPyBkZWZhdWx0VGFnTmFtZVxuICAgIDogdGFnTmFtZUZ1bGwocmF3VGFnLCBzdGF0ZS50YWdIYW5kbGVycylcblxuICByZXR1cm4ge1xuICAgIHRhZ05hbWUsXG4gICAgdGFnOiBmaW5kRXhwbGljaXRUYWcoc3RhdGUsIGV4YWN0LCBwcmVmaXgsIHRhZ05hbWUsIG5vZGVLaW5kKVxuICB9XG59XG5cbi8vIEEgbWVyZ2Ugc291cmNlIG11c3QgYmUgYSBtYXBwaW5nOyBldmVyeSBtYXBwaW5nIHRhZyBleHBvc2VzIHRoZSByZWFkIHNpZGUuXG5mdW5jdGlvbiBpc01hcHBpbmdUYWcgKHRhZzogQW55VGFnKTogdGFnIGlzIE1hcHBpbmdUYWdEZWZpbml0aW9uPGFueSwgYW55PiB7XG4gIHJldHVybiB0YWcubm9kZUtpbmQgPT09ICdtYXBwaW5nJ1xufVxuXG4vLyBGb2xkIHRoZSBrZXlzIG9mIG9uZSBtYXBwaW5nIHNvdXJjZSBpbnRvIHRoZSB0YXJnZXQgZnJhbWUsIGhvbm9yaW5nIG1lcmdlXG4vLyBwcmVjZWRlbmNlOiBhbiBhbHJlYWR5LXByZXNlbnQga2V5IChleHBsaWNpdCBvciBmcm9tIGFuIGVhcmxpZXIgc291cmNlKSB3aW5zLlxuZnVuY3Rpb24gbWVyZ2VLZXlzIChzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSwgZnJhbWU6IE1hcHBpbmdGcmFtZSwgc291cmNlOiB1bmtub3duLCBzb3VyY2VUYWc6IE1hcHBpbmdUYWdEZWZpbml0aW9uPGFueSwgYW55Pikge1xuICBmb3IgKGNvbnN0IHNvdXJjZUtleSBvZiBzb3VyY2VUYWcua2V5cyhzb3VyY2UpKSB7XG4gICAgaWYgKHN0YXRlLm1heFRvdGFsTWVyZ2VLZXlzICE9PSAtMSAmJiArK3N0YXRlLnRvdGFsTWVyZ2VLZXlzID4gc3RhdGUubWF4VG90YWxNZXJnZUtleXMpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsIGBtZXJnZSBrZXlzIGV4Y2VlZGVkIG1heFRvdGFsTWVyZ2VLZXlzICgke3N0YXRlLm1heFRvdGFsTWVyZ2VLZXlzfSlgKVxuICAgIH1cblxuICAgIGlmIChmcmFtZS50YWcuaGFzKGZyYW1lLnZhbHVlLCBzb3VyY2VLZXkpKSBjb250aW51ZVxuXG4gICAgY29uc3QgZXJyID0gZnJhbWUudGFnLmFkZFBhaXIoZnJhbWUudmFsdWUsIHNvdXJjZUtleSwgc291cmNlVGFnLmdldChzb3VyY2UsIHNvdXJjZUtleSkpXG4gICAgaWYgKGVycikgdGhyb3dFcnJvcihzdGF0ZSwgZXJyKVxuICAgIDsoZnJhbWUub3ZlcnJpZGFibGUgPz89IG5ldyBTZXQoKSkuYWRkKHNvdXJjZUtleSlcbiAgfVxufVxuXG4vLyBUaGUgdmFsdWUgb2YgYSBgPDxgIGtleTogZWl0aGVyIGEgbWFwcGluZyAoZm9sZCBpdHMga2V5cykgb3IgYSBzZXF1ZW5jZSBvZlxuLy8gbWFwcGluZ3MgKGZvbGQgZWFjaCkuIEEgbWVyZ2Ugc2VxdWVuY2UgaGFzIGFscmVhZHkgaGFkIGV2ZXJ5IGVsZW1lbnQgdmFsaWRhdGVkXG4vLyBhcyBhIG1hcHBpbmcgb24gYXJyaXZhbCAoc2VlIGFkZFZhbHVlKSwgYW5kIGl0cyBlbGVtZW50cyB3ZXJlIGJ1aWx0IGJ5IHRoZVxuLy8gdGFyZ2V0J3Mgb3duIG1hcHBpbmcgdGFnLCBzbyB0aGV5IGFyZSByZWFkIGJhY2sgd2l0aCBpdC5cbmZ1bmN0aW9uIG1lcmdlU291cmNlIChzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSwgZnJhbWU6IE1hcHBpbmdGcmFtZSwgc291cmNlOiB1bmtub3duLCBzb3VyY2VUYWc6IEFueVRhZykge1xuICBzdGF0ZS5wb3NpdGlvbiA9IGZyYW1lLmtleVBvc2l0aW9uXG5cbiAgaWYgKGlzTWFwcGluZ1RhZyhzb3VyY2VUYWcpKSB7XG4gICAgbWVyZ2VLZXlzKHN0YXRlLCBmcmFtZSwgc291cmNlLCBzb3VyY2VUYWcpXG4gIH0gZWxzZSBpZiAoc291cmNlVGFnLm5vZGVLaW5kID09PSAnc2VxdWVuY2UnICYmIEFycmF5LmlzQXJyYXkoc291cmNlKSkge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzb3VyY2UpIHtcbiAgICAgIG1lcmdlS2V5cyhzdGF0ZSwgZnJhbWUsIGVsZW1lbnQsIGZyYW1lLnRhZylcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2Nhbm5vdCBtZXJnZSBtYXBwaW5nczsgdGhlIHByb3ZpZGVkIHNvdXJjZSBvYmplY3QgaXMgdW5hY2NlcHRhYmxlJylcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRNYXBwaW5nVmFsdWUgKHN0YXRlOiBDb25zdHJ1Y3RvclN0YXRlLCBmcmFtZTogTWFwcGluZ0ZyYW1lLCBrZXk6IHVua25vd24sIHZhbHVlOiB1bmtub3duLCB0YWc6IEFueVRhZykge1xuICBzdGF0ZS5wb3NpdGlvbiA9IGZyYW1lLmtleVBvc2l0aW9uXG5cbiAgLy8gYDw8YCBpcyBpbnRlcmNlcHRlZCBiZWZvcmUgZGVkdXAsIHNvIGEgcmVwZWF0ZWQgbWVyZ2Uga2V5IGlzIGFsbG93ZWQuXG4gIGlmIChrZXkgPT09IE1FUkdFX0tFWSkge1xuICAgIG1lcmdlU291cmNlKHN0YXRlLCBmcmFtZSwgdmFsdWUsIHRhZylcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmICghc3RhdGUuanNvbiAmJiBmcmFtZS50YWcuaGFzKGZyYW1lLnZhbHVlLCBrZXkpICYmICFmcmFtZS5vdmVycmlkYWJsZT8uaGFzKGtleSkpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZHVwbGljYXRlZCBtYXBwaW5nIGtleScpXG4gIH1cblxuICBjb25zdCBlcnIgPSBmcmFtZS50YWcuYWRkUGFpcihmcmFtZS52YWx1ZSwga2V5LCB2YWx1ZSlcbiAgaWYgKGVycikgdGhyb3dFcnJvcihzdGF0ZSwgZXJyKVxuICBmcmFtZS5vdmVycmlkYWJsZT8uZGVsZXRlKGtleSlcbn1cblxuZnVuY3Rpb24gYWRkVmFsdWUgKHN0YXRlOiBDb25zdHJ1Y3RvclN0YXRlLCB2YWx1ZTogdW5rbm93biwgdGFnOiBBbnlUYWcpIHtcbiAgY29uc3QgZnJhbWUgPSBzdGF0ZS5mcmFtZXNbc3RhdGUuZnJhbWVzLmxlbmd0aCAtIDFdIVxuXG4gIGlmIChmcmFtZS5raW5kID09PSAnZG9jdW1lbnQnKSB7XG4gICAgZnJhbWUudmFsdWUgPSB2YWx1ZVxuICAgIGZyYW1lLmhhc1ZhbHVlID0gdHJ1ZVxuICB9IGVsc2UgaWYgKGZyYW1lLmtpbmQgPT09ICdzZXF1ZW5jZScpIHtcbiAgICBpZiAoZnJhbWUubWVyZ2UpIHtcbiAgICAgIC8vIEVsZW1lbnQgb2YgYSBgPDw6IFsuLi5dYCBsaXN0OiB2YWxpZGF0ZSBpdCBpcyBhIG1hcHBpbmcsIHRoZW4gY29sbGVjdFxuICAgICAgLy8gaXQgbGlrZSBhbnkgb3RoZXIgaXRlbSBmb3IgdGhlIHRhcmdldCB0byBmb2xkIGluLlxuICAgICAgaWYgKCFpc01hcHBpbmdUYWcodGFnKSkge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnY2Fubm90IG1lcmdlIG1hcHBpbmdzOyB0aGUgcHJvdmlkZWQgc291cmNlIG9iamVjdCBpcyB1bmFjY2VwdGFibGUnKVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBlcnIgPSBmcmFtZS50YWcuYWRkSXRlbShmcmFtZS52YWx1ZSwgdmFsdWUsIGZyYW1lLmluZGV4KyspXG4gICAgaWYgKGVycikgdGhyb3dFcnJvcihzdGF0ZSwgZXJyKVxuICB9IGVsc2UgaWYgKGZyYW1lLmhhc0tleSkge1xuICAgIGNvbnN0IGtleSA9IGZyYW1lLmtleVxuICAgIGZyYW1lLmtleSA9IHVuZGVmaW5lZFxuICAgIGZyYW1lLmhhc0tleSA9IGZhbHNlXG4gICAgYWRkTWFwcGluZ1ZhbHVlKHN0YXRlLCBmcmFtZSwga2V5LCB2YWx1ZSwgdGFnKVxuICB9IGVsc2Uge1xuICAgIGZyYW1lLmtleSA9IHZhbHVlXG4gICAgZnJhbWUua2V5UG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvblxuICAgIGZyYW1lLmhhc0tleSA9IHRydWVcbiAgfVxufVxuXG5mdW5jdGlvbiBzdG9yZUFuY2hvciAoXG4gIHN0YXRlOiBDb25zdHJ1Y3RvclN0YXRlLFxuICBldmVudDogU2NhbGFyRXZlbnQgfCBTZXF1ZW5jZUV2ZW50IHwgTWFwcGluZ0V2ZW50LFxuICB2YWx1ZTogdW5rbm93bixcbiAgdGFnOiBBbnlUYWcsXG4gIGlzVmFsdWVGaW5hbDogYm9vbGVhblxuKTogQW5jaG9yIHwgbnVsbCB7XG4gIGlmIChldmVudC5hbmNob3JTdGFydCAhPT0gTk9fUkFOR0UpIHtcbiAgICBjb25zdCBhbmNob3IgPSB7XG4gICAgICB2YWx1ZSxcbiAgICAgIHRhZyxcbiAgICAgIGlzVmFsdWVGaW5hbFxuICAgIH1cbiAgICBzdGF0ZS5hbmNob3JzLnNldChzdGF0ZS5zb3VyY2Uuc2xpY2UoZXZlbnQuYW5jaG9yU3RhcnQsIGV2ZW50LmFuY2hvckVuZCksIGFuY2hvcilcbiAgICByZXR1cm4gYW5jaG9yXG4gIH1cblxuICByZXR1cm4gbnVsbFxufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RGcm9tRXZlbnRzIChldmVudHM6IEV2ZW50W10sIG9wdGlvbnM6IENvbnN0cnVjdG9yT3B0aW9ucyk6IHVua25vd25bXSB7XG4gIGNvbnN0IHN0YXRlOiBDb25zdHJ1Y3RvclN0YXRlID0ge1xuICAgIC4uLkRFRkFVTFRfQ09OU1RSVUNUT1JfT1BUSU9OUyxcbiAgICAuLi5vcHRpb25zLFxuICAgIGV2ZW50cyxcbiAgICBkb2N1bWVudHM6IFtdLFxuICAgIGV2ZW50SW5kZXg6IDAsXG4gICAgcG9zaXRpb246IDAsXG4gICAgZnJhbWVzOiBbXSxcbiAgICBhbmNob3JzOiBuZXcgTWFwKCksXG4gICAgdGFnSGFuZGxlcnM6IE9iamVjdC5jcmVhdGUobnVsbCksXG4gICAgdG90YWxNZXJnZUtleXM6IDAsXG4gICAgYWxpYXNDb3VudDogMFxuICB9XG5cbiAgd2hpbGUgKHN0YXRlLmV2ZW50SW5kZXggPCBzdGF0ZS5ldmVudHMubGVuZ3RoKSB7XG4gICAgY29uc3QgZXZlbnQgPSBzdGF0ZS5ldmVudHNbc3RhdGUuZXZlbnRJbmRleCsrXVxuICAgIHN0YXRlLnBvc2l0aW9uID0gZXZlbnRQb3NpdGlvbihldmVudClcblxuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgICAgY2FzZSBFVkVOVF9ET0NVTUVOVDpcbiAgICAgICAgc3RhdGUuYW5jaG9ycyA9IG5ldyBNYXAoKVxuICAgICAgICBzdGF0ZS5hbGlhc0NvdW50ID0gMFxuICAgICAgICBzdGF0ZS50YWdIYW5kbGVycyA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgICAgICAgZm9yIChjb25zdCBkaXJlY3RpdmUgb2YgZXZlbnQuZGlyZWN0aXZlcykge1xuICAgICAgICAgIGlmIChkaXJlY3RpdmUua2luZCA9PT0gJ3RhZycpIHN0YXRlLnRhZ0hhbmRsZXJzW2RpcmVjdGl2ZS5oYW5kbGVdID0gZGlyZWN0aXZlLnByZWZpeFxuICAgICAgICB9XG4gICAgICAgIHN0YXRlLmZyYW1lcy5wdXNoKHsga2luZDogJ2RvY3VtZW50JywgcG9zaXRpb246IHN0YXRlLnBvc2l0aW9uLCB2YWx1ZTogdW5kZWZpbmVkLCBoYXNWYWx1ZTogZmFsc2UgfSlcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSBFVkVOVF9TQ0FMQVI6IHtcbiAgICAgICAgY29uc3QgeyB2YWx1ZSwgdGFnIH0gPSBjb25zdHJ1Y3RTY2FsYXIoc3RhdGUsIGV2ZW50KVxuICAgICAgICBzdG9yZUFuY2hvcihzdGF0ZSwgZXZlbnQsIHZhbHVlLCB0YWcsIHRydWUpXG4gICAgICAgIGFkZFZhbHVlKHN0YXRlLCB2YWx1ZSwgdGFnKVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjYXNlIEVWRU5UX1NFUVVFTkNFOiB7XG4gICAgICAgIGNvbnN0IGRlZmluaXRpb24gPSBjb2xsZWN0aW9uVGFnKFxuICAgICAgICAgIHN0YXRlLFxuICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgIHN0YXRlLnNjaGVtYS5leGFjdC5zZXF1ZW5jZSxcbiAgICAgICAgICBzdGF0ZS5zY2hlbWEucHJlZml4LnNlcXVlbmNlLFxuICAgICAgICAgICd0YWc6eWFtbC5vcmcsMjAwMjpzZXEnLFxuICAgICAgICAgICdzZXF1ZW5jZSdcbiAgICAgICAgKVxuICAgICAgICBjb25zdCB2YWx1ZSA9IGRlZmluaXRpb24udGFnLmNyZWF0ZShkZWZpbml0aW9uLnRhZ05hbWUpXG4gICAgICAgIGNvbnN0IGFuY2hvciA9IHN0b3JlQW5jaG9yKHN0YXRlLCBldmVudCwgdmFsdWUsIGRlZmluaXRpb24udGFnLCBkZWZpbml0aW9uLnRhZy5jYXJyaWVySXNSZXN1bHQpXG5cbiAgICAgICAgLy8gYDw8OiBbLi4uXWAg4oCUIHRoZSBwYXJlbnQgbWFwcGluZyBpcyB3YWl0aW5nIG9uIGEgbWVyZ2Uga2V5LCBzbyB0aGlzXG4gICAgICAgIC8vIHNlcXVlbmNlIGlzIGEgbGlzdCBvZiBtZXJnZSBzb3VyY2VzOiBpdHMgZWxlbWVudHMgbXVzdCBiZSBtYXBwaW5ncy5cbiAgICAgICAgLy8gSXQgaXMgc3RpbGwgYnVpbHQgYW5kIGRlbGl2ZXJlZCBhcyBhIG5vcm1hbCB2YWx1ZTsgdGhlIHRhcmdldCBmb2xkcyBpdC5cbiAgICAgICAgY29uc3QgcGFyZW50ID0gc3RhdGUuZnJhbWVzW3N0YXRlLmZyYW1lcy5sZW5ndGggLSAxXVxuICAgICAgICBjb25zdCBtZXJnZSA9IHBhcmVudCAhPT0gdW5kZWZpbmVkICYmIHBhcmVudC5raW5kID09PSAnbWFwcGluZycgJiZcbiAgICAgICAgICBwYXJlbnQuaGFzS2V5ICYmIHBhcmVudC5rZXkgPT09IE1FUkdFX0tFWVxuXG4gICAgICAgIHN0YXRlLmZyYW1lcy5wdXNoKHtcbiAgICAgICAgICBraW5kOiAnc2VxdWVuY2UnLCBwb3NpdGlvbjogc3RhdGUucG9zaXRpb24sIHZhbHVlLCB0YWc6IGRlZmluaXRpb24udGFnLCBhbmNob3IsIGluZGV4OiAwLCBtZXJnZVxuICAgICAgICB9KVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjYXNlIEVWRU5UX01BUFBJTkc6IHtcbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGNvbGxlY3Rpb25UYWcoXG4gICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgc3RhdGUuc2NoZW1hLmV4YWN0Lm1hcHBpbmcsXG4gICAgICAgICAgc3RhdGUuc2NoZW1hLnByZWZpeC5tYXBwaW5nLFxuICAgICAgICAgICd0YWc6eWFtbC5vcmcsMjAwMjptYXAnLFxuICAgICAgICAgICdtYXBwaW5nJ1xuICAgICAgICApXG4gICAgICAgIGNvbnN0IHZhbHVlID0gZGVmaW5pdGlvbi50YWcuY3JlYXRlKGRlZmluaXRpb24udGFnTmFtZSlcbiAgICAgICAgY29uc3QgYW5jaG9yID0gc3RvcmVBbmNob3Ioc3RhdGUsIGV2ZW50LCB2YWx1ZSwgZGVmaW5pdGlvbi50YWcsIGRlZmluaXRpb24udGFnLmNhcnJpZXJJc1Jlc3VsdClcbiAgICAgICAgc3RhdGUuZnJhbWVzLnB1c2goe1xuICAgICAgICAgIGtpbmQ6ICdtYXBwaW5nJyxcbiAgICAgICAgICBwb3NpdGlvbjogc3RhdGUucG9zaXRpb24sXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgdGFnOiBkZWZpbml0aW9uLnRhZyxcbiAgICAgICAgICBhbmNob3IsXG4gICAgICAgICAga2V5OiB1bmRlZmluZWQsXG4gICAgICAgICAga2V5UG9zaXRpb246IHN0YXRlLnBvc2l0aW9uLFxuICAgICAgICAgIGhhc0tleTogZmFsc2UsXG4gICAgICAgICAgb3ZlcnJpZGFibGU6IG51bGxcbiAgICAgICAgfSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgY2FzZSBFVkVOVF9BTElBUzoge1xuICAgICAgICBpZiAoc3RhdGUubWF4QWxpYXNlcyAhPT0gLTEgJiYgKytzdGF0ZS5hbGlhc0NvdW50ID4gc3RhdGUubWF4QWxpYXNlcykge1xuICAgICAgICAgIHRocm93RXJyb3Ioc3RhdGUsIGBhbGlhc2VzIGV4Y2VlZGVkIG1heEFsaWFzZXMgKCR7c3RhdGUubWF4QWxpYXNlc30pYClcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5hbWUgPSBzdGF0ZS5zb3VyY2Uuc2xpY2UoZXZlbnQuYW5jaG9yU3RhcnQsIGV2ZW50LmFuY2hvckVuZClcbiAgICAgICAgY29uc3QgYW5jaG9yID0gc3RhdGUuYW5jaG9ycy5nZXQobmFtZSlcbiAgICAgICAgaWYgKCFhbmNob3IpIHtcbiAgICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCBgdW5pZGVudGlmaWVkIGFsaWFzIFwiJHtuYW1lfVwiYClcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWFuY2hvci5pc1ZhbHVlRmluYWwpIHtcbiAgICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCBgcmVjdXJzaXZlIGFsaWFzIFwiJHtuYW1lfVwiIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIHRhZyAke2FuY2hvci50YWcudGFnTmFtZX0gYmVjYXVzZSBpdCB1c2VzIGZpbmFsaXplKClgKVxuICAgICAgICB9XG4gICAgICAgIGFkZFZhbHVlKHN0YXRlLCBhbmNob3IudmFsdWUsIGFuY2hvci50YWcpXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGNhc2UgRVZFTlRfUE9QOiB7XG4gICAgICAgIGNvbnN0IGZyYW1lID0gc3RhdGUuZnJhbWVzLnBvcCgpIVxuXG4gICAgICAgIGlmIChmcmFtZS5raW5kID09PSAnZG9jdW1lbnQnKSB7XG4gICAgICAgICAgc3RhdGUuZG9jdW1lbnRzLnB1c2goZnJhbWUudmFsdWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBmcmFtZS50YWcuY2FycmllcklzUmVzdWx0XG4gICAgICAgICAgICA/IGZyYW1lLnZhbHVlXG4gICAgICAgICAgICA6IGZpbmFsaXplQ29sbGVjdGlvbihzdGF0ZSwgZnJhbWUucG9zaXRpb24sIGZyYW1lLnRhZywgZnJhbWUudmFsdWUpXG4gICAgICAgICAgaWYgKGZyYW1lLmFuY2hvcikge1xuICAgICAgICAgICAgZnJhbWUuYW5jaG9yLnZhbHVlID0gdmFsdWVcbiAgICAgICAgICAgIGZyYW1lLmFuY2hvci5pc1ZhbHVlRmluYWwgPSB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICAgIGFkZFZhbHVlKHN0YXRlLCB2YWx1ZSwgZnJhbWUudGFnKVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0YXRlLmRvY3VtZW50c1xufVxuXG5leHBvcnQge1xuICBjb25zdHJ1Y3RGcm9tRXZlbnRzLFxuICBERUZBVUxUX0NPTlNUUlVDVE9SX09QVElPTlMsXG4gIHR5cGUgQ29uc3RydWN0b3JPcHRpb25zXG59XG4iLCAiaW1wb3J0IHtcbiAgRVZFTlRfRE9DVU1FTlQsXG4gIEVWRU5UX1NFUVVFTkNFLFxuICBFVkVOVF9NQVBQSU5HLFxuICBFVkVOVF9TQ0FMQVIsXG4gIEVWRU5UX0FMSUFTLFxuICBFVkVOVF9QT1AsXG4gIFNDQUxBUl9TVFlMRV9QTEFJTixcbiAgU0NBTEFSX1NUWUxFX1NJTkdMRV9RVU9URUQsXG4gIFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVELFxuICBTQ0FMQVJfU1RZTEVfTElURVJBTF9CTE9DSyxcbiAgU0NBTEFSX1NUWUxFX0ZPTERFRF9CTE9DSyxcbiAgQ09MTEVDVElPTl9TVFlMRV9CTE9DSyxcbiAgQ09MTEVDVElPTl9TVFlMRV9GTE9XLFxuICBDSE9NUElOR19DTElQLFxuICBDSE9NUElOR19TVFJJUCxcbiAgQ0hPTVBJTkdfS0VFUCxcbiAgdHlwZSBFdmVudCxcbiAgdHlwZSBTY2FsYXJTdHlsZSxcbiAgdHlwZSBDb2xsZWN0aW9uU3R5bGUsXG4gIHR5cGUgQ2hvbXBpbmcsXG4gIHR5cGUgRG9jdW1lbnREaXJlY3RpdmUsXG4gIHR5cGUgVGFnSGFuZGxlcnNcbn0gZnJvbSAnLi9ldmVudHMudHMnXG5pbXBvcnQgeyB0aHJvd0Vycm9yQXQgfSBmcm9tICcuLi9jb21tb24vZXhjZXB0aW9uLnRzJ1xuXG5jb25zdCBOT19SQU5HRSA9IC0xXG5jb25zdCBIQVNfT1dOID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuXG5jb25zdCBDT05URVhUX0ZMT1dfSU4gPSAxXG5jb25zdCBDT05URVhUX0ZMT1dfT1VUID0gMlxuY29uc3QgQ09OVEVYVF9CTE9DS19JTiA9IDNcbmNvbnN0IENPTlRFWFRfQkxPQ0tfT1VUID0gNFxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29udHJvbC1yZWdleFxuY29uc3QgUEFUVEVSTl9OT05fUFJJTlRBQkxFID0gL1tcXHgwMC1cXHgwOFxceDBCXFx4MENcXHgwRS1cXHgxRlxceDdGLVxceDg0XFx4ODYtXFx4OUZcXHVGRkZFXFx1RkZGRl18W1xcdUQ4MDAtXFx1REJGRl0oPyFbXFx1REMwMC1cXHVERkZGXSl8KD86W15cXHVEODAwLVxcdURCRkZdfF4pW1xcdURDMDAtXFx1REZGRl0vXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlbGVzcy1lc2NhcGVcbmNvbnN0IFBBVFRFUk5fRkxPV19JTkRJQ0FUT1JTID0gL1ssXFxbXFxde31dL1xuLy8gWUFNTCAxLjIuMiwgWzkxXSBjLXRhZy1oYW5kbGUuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlbGVzcy1lc2NhcGVcbmNvbnN0IFBBVFRFUk5fVEFHX0hBTkRMRSA9IC9eKD86IXwhIXwhWzAtOUEtWmEtei1dKyEpJC9cbi8vIFlBTUwgMS4yLjIsIFszOV0gbnMtdXJpLWNoYXIuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlbGVzcy1lc2NhcGVcbmNvbnN0IE5TX1VSSV9DSEFSID0gU3RyaW5nLnJhd2AoPzolWzAtOUEtRmEtZl17Mn18WzAtOUEtWmEtelxcLSM7Lz86QCY9KyQsXy4hfionKClcXFtcXF1dKWBcbi8vIFlBTUwgMS4yLjIsIFs0MF0gbnMtdGFnLWNoYXIgPSBucy11cmktY2hhciAtIFwiIVwiIC0gYy1mbG93LWluZGljYXRvci5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2VsZXNzLWVzY2FwZVxuY29uc3QgTlNfVEFHX0NIQVIgPSBTdHJpbmcucmF3YCg/OiVbMC05QS1GYS1mXXsyfXxbMC05QS1aYS16XFwtIzsvPzpAJj0rJC5+KicoKV9dKWBcbmNvbnN0IFBBVFRFUk5fVEFHX1VSSSA9IG5ldyBSZWdFeHAoYF4oPzoke05TX1VSSV9DSEFSfSkqJGApXG4vLyBZQU1MIDEuMi4yLCBbOTldIGMtbnMtc2hvcnRoYW5kLXRhZyBzdWZmaXggcGFydC5cbmNvbnN0IFBBVFRFUk5fVEFHX1NVRkZJWCA9IG5ldyBSZWdFeHAoYF4oPzoke05TX1RBR19DSEFSfSkrJGApXG4vLyBZQU1MIDEuMi4yLCBbOTNdIG5zLXRhZy1wcmVmaXguXG5jb25zdCBQQVRURVJOX1RBR19QUkVGSVggPSBuZXcgUmVnRXhwKGBeKD86ISg/OiR7TlNfVVJJX0NIQVJ9KSp8JHtOU19UQUdfQ0hBUn0oPzoke05TX1VSSV9DSEFSfSkqKSRgKVxuXG50eXBlIE5vZGVDb250ZXh0ID1cbiAgdHlwZW9mIENPTlRFWFRfRkxPV19JTiB8IHR5cGVvZiBDT05URVhUX0ZMT1dfT1VUIHxcbiAgdHlwZW9mIENPTlRFWFRfQkxPQ0tfSU4gfCB0eXBlb2YgQ09OVEVYVF9CTE9DS19PVVRcblxuaW50ZXJmYWNlIE5vZGVQcm9wZXJ0aWVzIHtcbiAgYW5jaG9yU3RhcnQ6IG51bWJlclxuICBhbmNob3JFbmQ6IG51bWJlclxuICB0YWdTdGFydDogbnVtYmVyXG4gIHRhZ0VuZDogbnVtYmVyXG59XG5cbmludGVyZmFjZSBQYXJzZXJTbmFwc2hvdCB7XG4gIHBvc2l0aW9uOiBudW1iZXJcbiAgbGluZTogbnVtYmVyXG4gIGxpbmVTdGFydDogbnVtYmVyXG4gIGxpbmVJbmRlbnQ6IG51bWJlclxuICBmaXJzdFRhYkluTGluZTogbnVtYmVyXG4gIGV2ZW50c0xlbmd0aDogbnVtYmVyXG59XG5cbmludGVyZmFjZSBQYXJzZXJPcHRpb25zIHtcbiAgZmlsZW5hbWU/OiBzdHJpbmdcbiAgbWF4RGVwdGg/OiBudW1iZXJcbn1cblxuY29uc3QgREVGQVVMVF9QQVJTRVJfT1BUSU9OUzogUmVxdWlyZWQ8UGFyc2VyT3B0aW9ucz4gPSB7XG4gIGZpbGVuYW1lOiAnJyxcbiAgbWF4RGVwdGg6IDEwMFxufVxuXG5pbnRlcmZhY2UgUGFyc2VyU3RhdGUgZXh0ZW5kcyBSZXF1aXJlZDxQYXJzZXJPcHRpb25zPiB7XG4gIGlucHV0OiBzdHJpbmdcbiAgbGVuZ3RoOiBudW1iZXJcbiAgcG9zaXRpb246IG51bWJlclxuICBsaW5lOiBudW1iZXJcbiAgbGluZVN0YXJ0OiBudW1iZXJcbiAgbGluZUluZGVudDogbnVtYmVyXG4gIGZpcnN0VGFiSW5MaW5lOiBudW1iZXJcbiAgZGVwdGg6IG51bWJlclxuICBkaXJlY3RpdmVzOiBEb2N1bWVudERpcmVjdGl2ZVtdXG4gIHRhZ0hhbmRsZXJzOiBUYWdIYW5kbGVyc1xuICBldmVudHM6IEV2ZW50W11cbn1cblxuZnVuY3Rpb24gYWRkRG9jdW1lbnRFdmVudCAoXG4gIHN0YXRlOiBQYXJzZXJTdGF0ZSxcbiAgZXhwbGljaXRTdGFydDogYm9vbGVhbixcbiAgZXhwbGljaXRFbmQ6IGJvb2xlYW5cbikge1xuICBzdGF0ZS5ldmVudHMucHVzaCh7XG4gICAgdHlwZTogRVZFTlRfRE9DVU1FTlQsXG4gICAgZXhwbGljaXRTdGFydCxcbiAgICBleHBsaWNpdEVuZCxcbiAgICBkaXJlY3RpdmVzOiBzdGF0ZS5kaXJlY3RpdmVzXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGFkZFNlcXVlbmNlRXZlbnQgKFxuICBzdGF0ZTogUGFyc2VyU3RhdGUsXG4gIHN0YXJ0OiBudW1iZXIsXG4gIGFuY2hvclN0YXJ0OiBudW1iZXIsXG4gIGFuY2hvckVuZDogbnVtYmVyLFxuICB0YWdTdGFydDogbnVtYmVyLFxuICB0YWdFbmQ6IG51bWJlcixcbiAgc3R5bGU6IENvbGxlY3Rpb25TdHlsZVxuKSB7XG4gIHN0YXRlLmV2ZW50cy5wdXNoKHtcbiAgICB0eXBlOiBFVkVOVF9TRVFVRU5DRSxcbiAgICBzdGFydCxcbiAgICBhbmNob3JTdGFydCxcbiAgICBhbmNob3JFbmQsXG4gICAgdGFnU3RhcnQsXG4gICAgdGFnRW5kLFxuICAgIHN0eWxlXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGFkZE1hcHBpbmdFdmVudCAoXG4gIHN0YXRlOiBQYXJzZXJTdGF0ZSxcbiAgc3RhcnQ6IG51bWJlcixcbiAgYW5jaG9yU3RhcnQ6IG51bWJlcixcbiAgYW5jaG9yRW5kOiBudW1iZXIsXG4gIHRhZ1N0YXJ0OiBudW1iZXIsXG4gIHRhZ0VuZDogbnVtYmVyLFxuICBzdHlsZTogQ29sbGVjdGlvblN0eWxlXG4pIHtcbiAgc3RhdGUuZXZlbnRzLnB1c2goe1xuICAgIHR5cGU6IEVWRU5UX01BUFBJTkcsXG4gICAgc3RhcnQsXG4gICAgYW5jaG9yU3RhcnQsXG4gICAgYW5jaG9yRW5kLFxuICAgIHRhZ1N0YXJ0LFxuICAgIHRhZ0VuZCxcbiAgICBzdHlsZVxuICB9KVxufVxuXG5mdW5jdGlvbiBhZGRTY2FsYXJFdmVudCAoXG4gIHN0YXRlOiBQYXJzZXJTdGF0ZSxcbiAgdmFsdWVTdGFydDogbnVtYmVyLFxuICB2YWx1ZUVuZDogbnVtYmVyLFxuICBhbmNob3JTdGFydDogbnVtYmVyLFxuICBhbmNob3JFbmQ6IG51bWJlcixcbiAgdGFnU3RhcnQ6IG51bWJlcixcbiAgdGFnRW5kOiBudW1iZXIsXG4gIHN0eWxlOiBTY2FsYXJTdHlsZSxcbiAgY2hvbXBpbmc6IENob21waW5nID0gQ0hPTVBJTkdfQ0xJUCxcbiAgaW5kZW50ID0gLTEsXG4gIGZhc3QgPSBmYWxzZVxuKSB7XG4gIHN0YXRlLmV2ZW50cy5wdXNoKHtcbiAgICB0eXBlOiBFVkVOVF9TQ0FMQVIsXG4gICAgdmFsdWVTdGFydCxcbiAgICB2YWx1ZUVuZCxcbiAgICBhbmNob3JTdGFydCxcbiAgICBhbmNob3JFbmQsXG4gICAgdGFnU3RhcnQsXG4gICAgdGFnRW5kLFxuICAgIHN0eWxlLFxuICAgIGNob21waW5nLFxuICAgIGluZGVudCxcbiAgICBmYXN0XG4gIH0pXG59XG5cbmZ1bmN0aW9uIGFkZEFsaWFzRXZlbnQgKFxuICBzdGF0ZTogUGFyc2VyU3RhdGUsXG4gIGFuY2hvclN0YXJ0OiBudW1iZXIsXG4gIGFuY2hvckVuZDogbnVtYmVyXG4pIHtcbiAgc3RhdGUuZXZlbnRzLnB1c2goe1xuICAgIHR5cGU6IEVWRU5UX0FMSUFTLFxuICAgIGFuY2hvclN0YXJ0LFxuICAgIGFuY2hvckVuZFxuICB9KVxufVxuXG5mdW5jdGlvbiBhZGRQb3BFdmVudCAoc3RhdGU6IFBhcnNlclN0YXRlKSB7XG4gIHN0YXRlLmV2ZW50cy5wdXNoKHsgdHlwZTogRVZFTlRfUE9QIH0pXG59XG5cbmZ1bmN0aW9uIGFkZEVtcHR5U2NhbGFyRXZlbnQgKHN0YXRlOiBQYXJzZXJTdGF0ZSkge1xuICBhZGRTY2FsYXJFdmVudChcbiAgICBzdGF0ZSxcbiAgICBOT19SQU5HRSxcbiAgICBOT19SQU5HRSxcbiAgICBOT19SQU5HRSxcbiAgICBOT19SQU5HRSxcbiAgICBOT19SQU5HRSxcbiAgICBOT19SQU5HRSxcbiAgICBTQ0FMQVJfU1RZTEVfUExBSU5cbiAgKVxufVxuXG5mdW5jdGlvbiBlbXB0eVByb3BlcnRpZXMgKCk6IE5vZGVQcm9wZXJ0aWVzIHtcbiAgcmV0dXJuIHtcbiAgICBhbmNob3JTdGFydDogTk9fUkFOR0UsXG4gICAgYW5jaG9yRW5kOiBOT19SQU5HRSxcbiAgICB0YWdTdGFydDogTk9fUkFOR0UsXG4gICAgdGFnRW5kOiBOT19SQU5HRVxuICB9XG59XG5cbmZ1bmN0aW9uIHNuYXBzaG90U3RhdGUgKHN0YXRlOiBQYXJzZXJTdGF0ZSk6IFBhcnNlclNuYXBzaG90IHtcbiAgcmV0dXJuIHtcbiAgICBwb3NpdGlvbjogc3RhdGUucG9zaXRpb24sXG4gICAgbGluZTogc3RhdGUubGluZSxcbiAgICBsaW5lU3RhcnQ6IHN0YXRlLmxpbmVTdGFydCxcbiAgICBsaW5lSW5kZW50OiBzdGF0ZS5saW5lSW5kZW50LFxuICAgIGZpcnN0VGFiSW5MaW5lOiBzdGF0ZS5maXJzdFRhYkluTGluZSxcbiAgICBldmVudHNMZW5ndGg6IHN0YXRlLmV2ZW50cy5sZW5ndGhcbiAgfVxufVxuXG5mdW5jdGlvbiByZXN0b3JlU3RhdGUgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgc25hcHNob3Q6IFBhcnNlclNuYXBzaG90KSB7XG4gIHN0YXRlLnBvc2l0aW9uID0gc25hcHNob3QucG9zaXRpb25cbiAgc3RhdGUubGluZSA9IHNuYXBzaG90LmxpbmVcbiAgc3RhdGUubGluZVN0YXJ0ID0gc25hcHNob3QubGluZVN0YXJ0XG4gIHN0YXRlLmxpbmVJbmRlbnQgPSBzbmFwc2hvdC5saW5lSW5kZW50XG4gIHN0YXRlLmZpcnN0VGFiSW5MaW5lID0gc25hcHNob3QuZmlyc3RUYWJJbkxpbmVcbiAgc3RhdGUuZXZlbnRzLmxlbmd0aCA9IHNuYXBzaG90LmV2ZW50c0xlbmd0aFxufVxuXG5mdW5jdGlvbiB0aHJvd0Vycm9yIChzdGF0ZTogUGFyc2VyU3RhdGUsIG1lc3NhZ2U6IHN0cmluZyk6IG5ldmVyIHtcbiAgdGhyb3dFcnJvckF0KHN0YXRlLmlucHV0LnNsaWNlKDAsIHN0YXRlLmxlbmd0aCksIHN0YXRlLnBvc2l0aW9uLCBtZXNzYWdlLCBzdGF0ZS5maWxlbmFtZSlcbn1cblxuZnVuY3Rpb24gaXNFb2wgKGM6IG51bWJlcikge1xuICByZXR1cm4gYyA9PT0gMHgwQS8qIExGICovIHx8IGMgPT09IDB4MEQvKiBDUiAqL1xufVxuXG5mdW5jdGlvbiBpc1doaXRlU3BhY2UgKGM6IG51bWJlcikge1xuICByZXR1cm4gYyA9PT0gMHgwOS8qIFRhYiAqLyB8fCBjID09PSAweDIwLyogU3BhY2UgKi9cbn1cblxuZnVuY3Rpb24gaXNXc09yRW9sIChjOiBudW1iZXIpIHtcbiAgcmV0dXJuIGlzV2hpdGVTcGFjZShjKSB8fCBpc0VvbChjKVxufVxuXG5mdW5jdGlvbiBpc1dzT3JFb2xPckVuZCAoYzogbnVtYmVyKSB7XG4gIHJldHVybiBjID09PSAwIHx8IGlzV3NPckVvbChjKVxufVxuXG5mdW5jdGlvbiBpc0Zsb3dJbmRpY2F0b3IgKGM6IG51bWJlcikge1xuICByZXR1cm4gYyA9PT0gMHgyQy8qICwgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NUIvKiBbICovIHx8XG4gICAgICAgICBjID09PSAweDVELyogXSAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg3Qi8qIHsgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4N0QvKiB9ICovXG59XG5cbmZ1bmN0aW9uIGZyb21EZWNpbWFsQ29kZSAoYzogbnVtYmVyKSB7XG4gIHJldHVybiBjID49IDB4MzAvKiAwICovICYmIGMgPD0gMHgzOS8qIDkgKi8gPyBjIC0gMHgzMCA6IC0xXG59XG5cbmZ1bmN0aW9uIGZyb21IZXhDb2RlIChjOiBudW1iZXIpIHtcbiAgaWYgKGMgPj0gMHgzMC8qIDAgKi8gJiYgYyA8PSAweDM5LyogOSAqLykgcmV0dXJuIGMgLSAweDMwXG4gIGNvbnN0IGxjID0gYyB8IDB4MjBcbiAgaWYgKGxjID49IDB4NjEvKiBhICovICYmIGxjIDw9IDB4NjYvKiBmICovKSByZXR1cm4gbGMgLSAweDYxICsgMTBcbiAgcmV0dXJuIC0xXG59XG5cbmZ1bmN0aW9uIGVzY2FwZWRIZXhMZW4gKGM6IG51bWJlcikge1xuICBpZiAoYyA9PT0gMHg3OC8qIHggKi8pIHJldHVybiAyXG4gIGlmIChjID09PSAweDc1LyogdSAqLykgcmV0dXJuIDRcbiAgaWYgKGMgPT09IDB4NTUvKiBVICovKSByZXR1cm4gOFxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBpc1NpbXBsZUVzY2FwZSAoYzogbnVtYmVyKSB7XG4gIHJldHVybiBjID09PSAweDMwLyogMCAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg2MS8qIGEgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NjIvKiBiICovIHx8XG4gICAgICAgICBjID09PSAweDc0LyogdCAqLyB8fFxuICAgICAgICAgYyA9PT0gMHgwOS8qIFRhYiAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg2RS8qIG4gKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NzYvKiB2ICovIHx8XG4gICAgICAgICBjID09PSAweDY2LyogZiAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg3Mi8qIHIgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NjUvKiBlICovIHx8XG4gICAgICAgICBjID09PSAweDIwLyogU3BhY2UgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4MjIvKiBcIiAqLyB8fFxuICAgICAgICAgYyA9PT0gMHgyRi8qIC8gKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NUMvKiBcXCAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg0RS8qIE4gKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NUYvKiBfICovIHx8XG4gICAgICAgICBjID09PSAweDRDLyogTCAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg1MC8qIFAgKi9cbn1cblxuLy8gUHJlY29uZGl0aW9uOiBzdGF0ZS5wb3NpdGlvbiBwb2ludHMgYXQgTEYgb3IgQ1IuXG5mdW5jdGlvbiBjb25zdW1lTGluZUJyZWFrIChzdGF0ZTogUGFyc2VyU3RhdGUpIHtcbiAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gIGlmIChjaCA9PT0gMHgwQS8qIExGICovKSB7XG4gICAgc3RhdGUucG9zaXRpb24rK1xuICB9IGVsc2Uge1xuICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MEEvKiBMRiAqLykgc3RhdGUucG9zaXRpb24rK1xuICB9XG5cbiAgc3RhdGUubGluZSsrXG4gIHN0YXRlLmxpbmVTdGFydCA9IHN0YXRlLnBvc2l0aW9uXG4gIHN0YXRlLmxpbmVJbmRlbnQgPSAwXG4gIHN0YXRlLmZpcnN0VGFiSW5MaW5lID0gLTFcbn1cblxuZnVuY3Rpb24gc2tpcFNlcGFyYXRpb25TcGFjZSAoc3RhdGU6IFBhcnNlclN0YXRlLCBhbGxvd0NvbW1lbnRzOiBib29sZWFuKSB7XG4gIGxldCBsaW5lQnJlYWtzID0gMFxuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICBsZXQgaGFzU2VwYXJhdGlvbiA9IHN0YXRlLnBvc2l0aW9uID09PSBzdGF0ZS5saW5lU3RhcnQgfHxcbiAgICBpc1dzT3JFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiAtIDEpKVxuXG4gIHdoaWxlIChjaCAhPT0gMCkge1xuICAgIHdoaWxlIChpc1doaXRlU3BhY2UoY2gpKSB7XG4gICAgICBoYXNTZXBhcmF0aW9uID0gdHJ1ZVxuICAgICAgaWYgKGNoID09PSAweDA5LyogVGFiICovICYmIHN0YXRlLmZpcnN0VGFiSW5MaW5lID09PSAtMSkge1xuICAgICAgICBzdGF0ZS5maXJzdFRhYkluTGluZSA9IHN0YXRlLnBvc2l0aW9uXG4gICAgICB9XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgICB9XG5cbiAgICBpZiAoYWxsb3dDb21tZW50cyAmJiBoYXNTZXBhcmF0aW9uICYmIGNoID09PSAweDIzLyogIyAqLykge1xuICAgICAgZG8geyBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbikgfVxuICAgICAgd2hpbGUgKCFpc0VvbChjaCkgJiYgY2ggIT09IDApXG4gICAgfVxuXG4gICAgaWYgKCFpc0VvbChjaCkpIGJyZWFrXG5cbiAgICBjb25zdW1lTGluZUJyZWFrKHN0YXRlKVxuICAgIGxpbmVCcmVha3MrK1xuICAgIGhhc1NlcGFyYXRpb24gPSB0cnVlXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgd2hpbGUgKGNoID09PSAweDIwLyogU3BhY2UgKi8pIHtcbiAgICAgIHN0YXRlLmxpbmVJbmRlbnQrK1xuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGxpbmVCcmVha3Ncbn1cblxuZnVuY3Rpb24gdGVzdERvY3VtZW50U2VwYXJhdG9yIChzdGF0ZTogUGFyc2VyU3RhdGUsIHBvc2l0aW9uID0gc3RhdGUucG9zaXRpb24pIHtcbiAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKVxuXG4gIGlmICgoY2ggPT09IDB4MkQvKiAtICovIHx8IGNoID09PSAweDJFLyogLiAqLykgJiZcbiAgICAgIGNoID09PSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uICsgMSkgJiZcbiAgICAgIGNoID09PSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uICsgMikpIHtcbiAgICBjb25zdCBmb2xsb3dpbmcgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uICsgMylcbiAgICByZXR1cm4gZm9sbG93aW5nID09PSAwIHx8IGlzV3NPckVvbChmb2xsb3dpbmcpXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gc2tpcFVudGlsTGluZUVuZCAoc3RhdGU6IFBhcnNlclN0YXRlKSB7XG4gIGxldCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgd2hpbGUgKGNoICE9PSAwICYmICFpc0VvbChjaCkpIHtcbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja1ByaW50YWJsZSAoc3RhdGU6IFBhcnNlclN0YXRlLCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xuICBpZiAoUEFUVEVSTl9OT05fUFJJTlRBQkxFLnRlc3Qoc3RhdGUuaW5wdXQuc2xpY2Uoc3RhcnQsIGVuZCkpKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RoZSBzdHJlYW0gY29udGFpbnMgbm9uLXByaW50YWJsZSBjaGFyYWN0ZXJzJylcbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkVGFnUHJvcGVydHkgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgcHJvcHM6IE5vZGVQcm9wZXJ0aWVzLCBpbkZsb3c6IGJvb2xlYW4pIHtcbiAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAweDIxLyogISAqLykgcmV0dXJuIGZhbHNlXG4gIGlmIChwcm9wcy50YWdTdGFydCAhPT0gTk9fUkFOR0UpIHRocm93RXJyb3Ioc3RhdGUsICdkdXBsaWNhdGlvbiBvZiBhIHRhZyBwcm9wZXJ0eScpXG5cbiAgY29uc3Qgc3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICBsZXQgaXNWZXJiYXRpbSA9IGZhbHNlXG4gIGxldCBpc05hbWVkID0gZmFsc2VcbiAgbGV0IHRhZ0hhbmRsZSA9ICchJ1xuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG5cbiAgaWYgKGNoID09PSAweDNDLyogPCAqLykge1xuICAgIGlzVmVyYmF0aW0gPSB0cnVlXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gIH0gZWxzZSBpZiAoY2ggPT09IDB4MjEvKiAhICovKSB7XG4gICAgaXNOYW1lZCA9IHRydWVcbiAgICB0YWdIYW5kbGUgPSAnISEnXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gIH1cblxuICBsZXQgc3VmZml4U3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICBsZXQgdGFnTmFtZVxuXG4gIGlmIChpc1ZlcmJhdGltKSB7XG4gICAgd2hpbGUgKGNoICE9PSAwICYmIGNoICE9PSAweDNFLyogPiAqLykgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgaWYgKGNoICE9PSAweDNFLyogPiAqLykgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuZXhwZWN0ZWQgZW5kIG9mIHRoZSBzdHJlYW0gd2l0aGluIGEgdmVyYmF0aW0gdGFnJylcbiAgICB0YWdOYW1lID0gc3RhdGUuaW5wdXQuc2xpY2Uoc3VmZml4U3RhcnQsIHN0YXRlLnBvc2l0aW9uKVxuICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoY2ggIT09IDAgJiYgIWlzV3NPckVvbChjaCkgJiYgIShpbkZsb3cgJiYgaXNGbG93SW5kaWNhdG9yKGNoKSkpIHtcbiAgICAgIGlmIChjaCA9PT0gMHgyMS8qICEgKi8pIHtcbiAgICAgICAgaWYgKCFpc05hbWVkKSB7XG4gICAgICAgICAgdGFnSGFuZGxlID0gc3RhdGUuaW5wdXQuc2xpY2Uoc3VmZml4U3RhcnQgLSAxLCBzdGF0ZS5wb3NpdGlvbiArIDEpXG4gICAgICAgICAgaWYgKCFQQVRURVJOX1RBR19IQU5ETEUudGVzdCh0YWdIYW5kbGUpKSB0aHJvd0Vycm9yKHN0YXRlLCAnbmFtZWQgdGFnIGhhbmRsZSBjYW5ub3QgY29udGFpbiBzdWNoIGNoYXJhY3RlcnMnKVxuICAgICAgICAgIGlzTmFtZWQgPSB0cnVlXG4gICAgICAgICAgc3VmZml4U3RhcnQgPSBzdGF0ZS5wb3NpdGlvbiArIDFcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndGFnIHN1ZmZpeCBjYW5ub3QgY29udGFpbiBleGNsYW1hdGlvbiBtYXJrcycpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgfVxuXG4gICAgdGFnTmFtZSA9IHN0YXRlLmlucHV0LnNsaWNlKHN1ZmZpeFN0YXJ0LCBzdGF0ZS5wb3NpdGlvbilcbiAgICBpZiAoUEFUVEVSTl9GTE9XX0lORElDQVRPUlMudGVzdCh0YWdOYW1lKSkgdGhyb3dFcnJvcihzdGF0ZSwgJ3RhZyBzdWZmaXggY2Fubm90IGNvbnRhaW4gZmxvdyBpbmRpY2F0b3IgY2hhcmFjdGVycycpXG4gIH1cblxuICBpZiAodGFnTmFtZSAmJiAhKGlzVmVyYmF0aW0gPyBQQVRURVJOX1RBR19VUkkudGVzdCh0YWdOYW1lKSA6IFBBVFRFUk5fVEFHX1NVRkZJWC50ZXN0KHRhZ05hbWUpKSkge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsIGB0YWcgbmFtZSBjYW5ub3QgY29udGFpbiBzdWNoIGNoYXJhY3RlcnM6ICR7dGFnTmFtZX1gKVxuICB9XG4gIHRyeSB7XG4gICAgZGVjb2RlVVJJQ29tcG9uZW50KHRhZ05hbWUpXG4gIH0gY2F0Y2gge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsIGB0YWcgbmFtZSBpcyBtYWxmb3JtZWQ6ICR7dGFnTmFtZX1gKVxuICB9XG5cbiAgaWYgKCFpc1ZlcmJhdGltICYmIHRhZ0hhbmRsZSAhPT0gJyEnICYmIHRhZ0hhbmRsZSAhPT0gJyEhJyAmJiAhSEFTX09XTi5jYWxsKHN0YXRlLnRhZ0hhbmRsZXJzLCB0YWdIYW5kbGUpKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgYHVuZGVjbGFyZWQgdGFnIGhhbmRsZSBcIiR7dGFnSGFuZGxlfVwiYClcbiAgfVxuXG4gIHByb3BzLnRhZ1N0YXJ0ID0gc3RhcnRcbiAgcHJvcHMudGFnRW5kID0gc3RhdGUucG9zaXRpb25cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gcmVhZEFuY2hvclByb3BlcnR5IChzdGF0ZTogUGFyc2VyU3RhdGUsIHByb3BzOiBOb2RlUHJvcGVydGllcykge1xuICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgIT09IDB4MjYvKiAmICovKSByZXR1cm4gZmFsc2VcbiAgaWYgKHByb3BzLmFuY2hvclN0YXJ0ICE9PSBOT19SQU5HRSkgdGhyb3dFcnJvcihzdGF0ZSwgJ2R1cGxpY2F0aW9uIG9mIGFuIGFuY2hvciBwcm9wZXJ0eScpXG5cbiAgc3RhdGUucG9zaXRpb24rK1xuICBjb25zdCBzdGFydCA9IHN0YXRlLnBvc2l0aW9uXG5cbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwICYmICFpc1dzT3JFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpICYmICFpc0Zsb3dJbmRpY2F0b3Ioc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpKSB7XG4gICAgc3RhdGUucG9zaXRpb24rK1xuICB9XG5cbiAgaWYgKHN0YXRlLnBvc2l0aW9uID09PSBzdGFydCkgdGhyb3dFcnJvcihzdGF0ZSwgJ25hbWUgb2YgYW4gYW5jaG9yIG5vZGUgbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBjaGFyYWN0ZXInKVxuXG4gIHByb3BzLmFuY2hvclN0YXJ0ID0gc3RhcnRcbiAgcHJvcHMuYW5jaG9yRW5kID0gc3RhdGUucG9zaXRpb25cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gcmVhZEFsaWFzIChzdGF0ZTogUGFyc2VyU3RhdGUsIHByb3BzOiBOb2RlUHJvcGVydGllcykge1xuICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgIT09IDB4MkEvKiAqICovKSByZXR1cm4gZmFsc2VcbiAgaWYgKHByb3BzLmFuY2hvclN0YXJ0ICE9PSBOT19SQU5HRSB8fCBwcm9wcy50YWdTdGFydCAhPT0gTk9fUkFOR0UpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnYWxpYXMgbm9kZSBzaG91bGQgbm90IGhhdmUgYW55IHByb3BlcnRpZXMnKVxuICB9XG5cbiAgc3RhdGUucG9zaXRpb24rK1xuICBjb25zdCBzdGFydCA9IHN0YXRlLnBvc2l0aW9uXG5cbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwICYmICFpc1dzT3JFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpICYmICFpc0Zsb3dJbmRpY2F0b3Ioc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpKSB7XG4gICAgc3RhdGUucG9zaXRpb24rK1xuICB9XG5cbiAgaWYgKHN0YXRlLnBvc2l0aW9uID09PSBzdGFydCkgdGhyb3dFcnJvcihzdGF0ZSwgJ25hbWUgb2YgYW4gYWxpYXMgbm9kZSBtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIGNoYXJhY3RlcicpXG5cbiAgYWRkQWxpYXNFdmVudChzdGF0ZSwgc3RhcnQsIHN0YXRlLnBvc2l0aW9uKVxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiByZWFkRmxvd1NjYWxhckJyZWFrIChzdGF0ZTogUGFyc2VyU3RhdGUsIG5vZGVJbmRlbnQ6IG51bWJlcikge1xuICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCBmYWxzZSlcblxuICBpZiAoc3RhdGUubGluZUluZGVudCA8IG5vZGVJbmRlbnQpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZGVmaWNpZW50IGluZGVudGF0aW9uJylcbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkU2luZ2xlUXVvdGVkU2NhbGFyIChzdGF0ZTogUGFyc2VyU3RhdGUsIG5vZGVJbmRlbnQ6IG51bWJlciwgcHJvcHM6IE5vZGVQcm9wZXJ0aWVzKSB7XG4gIGlmIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMHgyNy8qICcgKi8pIHJldHVybiBmYWxzZVxuXG4gIHN0YXRlLnBvc2l0aW9uKytcbiAgY29uc3Qgc3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICAvLyBBIHNpbmdsZS1xdW90ZWQgc2NhbGFyIGlzIHNsaWNlYWJsZSB2ZXJiYXRpbSB3aGVuIGl0IGhhcyBubyAnJyBlc2NhcGUgcGFpcnNcbiAgLy8gYW5kIG5vIGZvbGRlZCBsaW5lIGJyZWFrcyAoc2VlIGdldFNjYWxhclZhbHVlIGZhc3QgcGF0aCkuXG4gIGxldCBzaW1wbGUgPSB0cnVlXG5cbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwKSB7XG4gICAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSAweDI3LyogJyAqLykge1xuICAgICAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKSA9PT0gMHgyNy8qICcgKi8pIHtcbiAgICAgICAgc2ltcGxlID0gZmFsc2VcbiAgICAgICAgc3RhdGUucG9zaXRpb24gKz0gMlxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjb25zdCBlbmQgPSBzdGF0ZS5wb3NpdGlvblxuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgYWRkU2NhbGFyRXZlbnQoc3RhdGUsIHN0YXJ0LCBlbmQsIHByb3BzLmFuY2hvclN0YXJ0LCBwcm9wcy5hbmNob3JFbmQsIHByb3BzLnRhZ1N0YXJ0LCBwcm9wcy50YWdFbmQsIFNDQUxBUl9TVFlMRV9TSU5HTEVfUVVPVEVELCBDSE9NUElOR19DTElQLCAtMSwgc2ltcGxlKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAoaXNFb2woY2gpKSB7XG4gICAgICBzaW1wbGUgPSBmYWxzZVxuICAgICAgcmVhZEZsb3dTY2FsYXJCcmVhayhzdGF0ZSwgbm9kZUluZGVudClcbiAgICB9IGVsc2UgaWYgKHN0YXRlLnBvc2l0aW9uID09PSBzdGF0ZS5saW5lU3RhcnQgJiYgdGVzdERvY3VtZW50U2VwYXJhdG9yKHN0YXRlKSkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuZXhwZWN0ZWQgZW5kIG9mIHRoZSBkb2N1bWVudCB3aXRoaW4gYSBzaW5nbGUgcXVvdGVkIHNjYWxhcicpXG4gICAgfSBlbHNlIGlmIChjaCAhPT0gMHgwOS8qIFRhYiAqLyAmJiBjaCA8IDB4MjApIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdleHBlY3RlZCB2YWxpZCBKU09OIGNoYXJhY3RlcicpXG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICB9XG4gIH1cblxuICB0aHJvd0Vycm9yKHN0YXRlLCAndW5leHBlY3RlZCBlbmQgb2YgdGhlIHN0cmVhbSB3aXRoaW4gYSBzaW5nbGUgcXVvdGVkIHNjYWxhcicpXG59XG5cbmZ1bmN0aW9uIHJlYWREb3VibGVRdW90ZWRTY2FsYXIgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgbm9kZUluZGVudDogbnVtYmVyLCBwcm9wczogTm9kZVByb3BlcnRpZXMpIHtcbiAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAweDIyLyogXCIgKi8pIHJldHVybiBmYWxzZVxuXG4gIHN0YXRlLnBvc2l0aW9uKytcbiAgY29uc3Qgc3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICAvLyBBIGRvdWJsZS1xdW90ZWQgc2NhbGFyIGlzIHNsaWNlYWJsZSB2ZXJiYXRpbSB3aGVuIGl0IGhhcyBubyBcXCBlc2NhcGVzIGFuZFxuICAvLyBubyBmb2xkZWQgbGluZSBicmVha3MgKHNlZSBnZXRTY2FsYXJWYWx1ZSBmYXN0IHBhdGgpLlxuICBsZXQgc2ltcGxlID0gdHJ1ZVxuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCkge1xuICAgIGNvbnN0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIGlmIChjaCA9PT0gMHgyMi8qIFwiICovKSB7XG4gICAgICBjb25zdCBlbmQgPSBzdGF0ZS5wb3NpdGlvblxuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgYWRkU2NhbGFyRXZlbnQoc3RhdGUsIHN0YXJ0LCBlbmQsIHByb3BzLmFuY2hvclN0YXJ0LCBwcm9wcy5hbmNob3JFbmQsIHByb3BzLnRhZ1N0YXJ0LCBwcm9wcy50YWdFbmQsIFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVELCBDSE9NUElOR19DTElQLCAtMSwgc2ltcGxlKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAoY2ggPT09IDB4NUMvKiBcXCAqLykge1xuICAgICAgc2ltcGxlID0gZmFsc2VcbiAgICAgIGNvbnN0IGVzY2FwZWQgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG5cbiAgICAgIGlmIChpc0VvbChlc2NhcGVkKSkge1xuICAgICAgICByZWFkRmxvd1NjYWxhckJyZWFrKHN0YXRlLCBub2RlSW5kZW50KVxuICAgICAgfSBlbHNlIGlmIChpc1NpbXBsZUVzY2FwZShlc2NhcGVkKSkge1xuICAgICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgaGV4TGVuZ3RoID0gZXNjYXBlZEhleExlbihlc2NhcGVkKVxuXG4gICAgICAgIGlmIChoZXhMZW5ndGggPT09IDApIHRocm93RXJyb3Ioc3RhdGUsICd1bmtub3duIGVzY2FwZSBzZXF1ZW5jZScpXG5cbiAgICAgICAgd2hpbGUgKGhleExlbmd0aC0tID4gMCkge1xuICAgICAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgICAgICBpZiAoZnJvbUhleENvZGUoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpIDwgMCkge1xuICAgICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2V4cGVjdGVkIGhleGFkZWNpbWFsIGNoYXJhY3RlcicpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzRW9sKGNoKSkge1xuICAgICAgc2ltcGxlID0gZmFsc2VcbiAgICAgIHJlYWRGbG93U2NhbGFyQnJlYWsoc3RhdGUsIG5vZGVJbmRlbnQpXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd1bmV4cGVjdGVkIGVuZCBvZiB0aGUgZG9jdW1lbnQgd2l0aGluIGEgZG91YmxlIHF1b3RlZCBzY2FsYXInKVxuICAgIH0gZWxzZSBpZiAoY2ggIT09IDB4MDkvKiBUYWIgKi8gJiYgY2ggPCAweDIwKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZXhwZWN0ZWQgdmFsaWQgSlNPTiBjaGFyYWN0ZXInKVxuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgfVxuICB9XG5cbiAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuZXhwZWN0ZWQgZW5kIG9mIHRoZSBzdHJlYW0gd2l0aGluIGEgZG91YmxlIHF1b3RlZCBzY2FsYXInKVxufVxuXG5mdW5jdGlvbiByZWFkQmxvY2tTY2FsYXIgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgcGFyZW50SW5kZW50OiBudW1iZXIsIHByb3BzOiBOb2RlUHJvcGVydGllcykge1xuICBjb25zdCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG4gIGxldCBjaG9tcGluZzogQ2hvbXBpbmcgPSBDSE9NUElOR19DTElQXG4gIGxldCBpbmRlbnQgPSAtMVxuICBsZXQgZGV0ZWN0ZWRJbmRlbnQgPSBmYWxzZVxuXG4gIGlmIChjaCAhPT0gMHg3Qy8qIHwgKi8gJiYgY2ggIT09IDB4M0UvKiA+ICovKSByZXR1cm4gZmFsc2VcblxuICBjb25zdCBzdHlsZSA9IGNoID09PSAweDdDLyogfCAqLyA/IFNDQUxBUl9TVFlMRV9MSVRFUkFMX0JMT0NLIDogU0NBTEFSX1NUWUxFX0ZPTERFRF9CTE9DS1xuICBzdGF0ZS5wb3NpdGlvbisrXG5cbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwKSB7XG4gICAgY29uc3QgY3VycmVudCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG4gICAgY29uc3QgZGlnaXQgPSBmcm9tRGVjaW1hbENvZGUoY3VycmVudClcblxuICAgIGlmIChjdXJyZW50ID09PSAweDJCLyogKyAqLyB8fCBjdXJyZW50ID09PSAweDJELyogLSAqLykge1xuICAgICAgaWYgKGNob21waW5nICE9PSBDSE9NUElOR19DTElQKSB0aHJvd0Vycm9yKHN0YXRlLCAncmVwZWF0IG9mIGEgY2hvbXBpbmcgbW9kZSBpZGVudGlmaWVyJylcbiAgICAgIGNob21waW5nID0gY3VycmVudCA9PT0gMHgyQi8qICsgKi8gPyBDSE9NUElOR19LRUVQIDogQ0hPTVBJTkdfU1RSSVBcbiAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICB9IGVsc2UgaWYgKGRpZ2l0ID49IDApIHtcbiAgICAgIGlmIChkaWdpdCA9PT0gMCkge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnYmFkIGV4cGxpY2l0IGluZGVudGF0aW9uIHdpZHRoIG9mIGEgYmxvY2sgc2NhbGFyOyBpdCBjYW5ub3QgYmUgbGVzcyB0aGFuIG9uZScpXG4gICAgICB9XG4gICAgICBpZiAoZGV0ZWN0ZWRJbmRlbnQpIHRocm93RXJyb3Ioc3RhdGUsICdyZXBlYXQgb2YgYW4gaW5kZW50YXRpb24gd2lkdGggaWRlbnRpZmllcicpXG4gICAgICBpbmRlbnQgPSBwYXJlbnRJbmRlbnQgKyBkaWdpdCAtIDFcbiAgICAgIGRldGVjdGVkSW5kZW50ID0gdHJ1ZVxuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGxldCBoYWRXaGl0ZXNwYWNlID0gZmFsc2VcbiAgd2hpbGUgKGlzV2hpdGVTcGFjZShzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSkpIHtcbiAgICBoYWRXaGl0ZXNwYWNlID0gdHJ1ZVxuICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgfVxuICBpZiAoaGFkV2hpdGVzcGFjZSAmJiBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gMHgyMy8qICMgKi8pIHNraXBVbnRpbExpbmVFbmQoc3RhdGUpXG5cbiAgaWYgKGlzRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkge1xuICAgIGNvbnN1bWVMaW5lQnJlYWsoc3RhdGUpXG4gIH0gZWxzZSBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgIT09IDApIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnYSBsaW5lIGJyZWFrIGlzIGV4cGVjdGVkJylcbiAgfVxuXG4gIGxldCBjb250ZW50SW5kZW50ID0gZGV0ZWN0ZWRJbmRlbnQgPyBpbmRlbnQgOiAtMVxuICBsZXQgbWF4TGVhZGluZ0luZGVudCA9IDBcbiAgY29uc3QgdmFsdWVTdGFydCA9IHN0YXRlLnBvc2l0aW9uXG4gIGxldCB2YWx1ZUVuZCA9IHN0YXRlLnBvc2l0aW9uXG5cbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwKSB7XG4gICAgY29uc3QgbGluZVBvc2l0aW9uID0gc3RhdGUucG9zaXRpb25cbiAgICBsZXQgY29sdW1uID0gMFxuXG4gICAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQobGluZVBvc2l0aW9uICsgY29sdW1uKSA9PT0gMHgyMC8qIFNwYWNlICovKSBjb2x1bW4rK1xuXG4gICAgY29uc3QgZmlyc3QgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KGxpbmVQb3NpdGlvbiArIGNvbHVtbilcbiAgICBpZiAoZmlyc3QgPT09IDApIHtcbiAgICAgIC8vIEVuZCBvZiBpbnB1dCBhY3RzIGFzIGEgbGluZSB0ZXJtaW5hdG9yLCBidXQgdGhlcmUgaXMgbm8gbGluZSBicmVhayB0b1xuICAgICAgLy8gaW5jbHVkZSBoZXJlLiBBIGZpbmFsIGFsbC1zcGFjZXMgbGluZSBzdGlsbCBjb3VudHM6IHdoZW4gdGhlIGJsb2NrIGhhcyBhXG4gICAgICAvLyBjb250ZW50IGluZGVudCwgdGhlIHNwYWNlcyBiZXlvbmQgaXQgYXJlIHJlYWwgY29udGVudDsgaW4gYSB3aG9sbHkgYmxhbmtcbiAgICAgIC8vIGJsb2NrIChjb250ZW50SW5kZW50IDwgMCkgdGhlIHNwYWNlcyBmb3JtIGEgYmxhbmsgbGluZSB0aGF0IGNob21waW5nIG11c3RcbiAgICAgIC8vIHNlZSwgZXhhY3RseSBhcyBpdCB3b3VsZCBpZiB0aGUgbGluZSBlbmRlZCB3aXRoIGEgYnJlYWsuIENhcHR1cmUgdGhlIGxpbmVcbiAgICAgIC8vIGluIGJvdGggY2FzZXM7IG90aGVyd2lzZSB0aGUgYmxvY2sgZW5kcyBhdCB0aGUgc3RhcnQgb2YgdGhpcyBlbXB0eSBsaW5lLlxuICAgICAgaWYgKGNvbnRlbnRJbmRlbnQgPj0gMCkge1xuICAgICAgICBpZiAoY29sdW1uID4gY29udGVudEluZGVudCkgdmFsdWVFbmQgPSBsaW5lUG9zaXRpb24gKyBjb2x1bW5cbiAgICAgIH0gZWxzZSBpZiAoY29sdW1uID4gMCkge1xuICAgICAgICB2YWx1ZUVuZCA9IGxpbmVQb3NpdGlvbiArIGNvbHVtblxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICB9XG4gICAgaWYgKGxpbmVQb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSwgbGluZVBvc2l0aW9uKSkgYnJlYWtcblxuICAgIGlmICghZGV0ZWN0ZWRJbmRlbnQgJiYgY29udGVudEluZGVudCA9PT0gLTEgJiYgaXNFb2woZmlyc3QpKSB7XG4gICAgICBtYXhMZWFkaW5nSW5kZW50ID0gTWF0aC5tYXgobWF4TGVhZGluZ0luZGVudCwgY29sdW1uKVxuICAgIH1cblxuICAgIGlmICghZGV0ZWN0ZWRJbmRlbnQgJiYgY29udGVudEluZGVudCA9PT0gLTEgJiYgIWlzRW9sKGZpcnN0KSkge1xuICAgICAgaWYgKGZpcnN0ID09PSAweDA5LyogVGFiICovICYmIGNvbHVtbiA8IHBhcmVudEluZGVudCkge1xuICAgICAgICBzdGF0ZS5wb3NpdGlvbiA9IGxpbmVQb3NpdGlvbiArIGNvbHVtblxuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndGFiIGNoYXJhY3RlcnMgbXVzdCBub3QgYmUgdXNlZCBpbiBpbmRlbnRhdGlvbicpXG4gICAgICB9XG4gICAgICBpZiAoY29sdW1uIDwgbWF4TGVhZGluZ0luZGVudCkge1xuICAgICAgICBzdGF0ZS5wb3NpdGlvbiA9IGxpbmVQb3NpdGlvbiArIGNvbHVtblxuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnYmFkIGluZGVudGF0aW9uIG9mIGEgbWFwcGluZyBlbnRyeScpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvbnRlbnRJbmRlbnQgPT09IC0xICYmIGZpcnN0ICE9PSAwICYmICFpc0VvbChmaXJzdCkgJiYgY29sdW1uIDwgcGFyZW50SW5kZW50KSB7XG4gICAgICBzdGF0ZS5saW5lSW5kZW50ID0gY29sdW1uXG4gICAgICBzdGF0ZS5wb3NpdGlvbiA9IGxpbmVQb3NpdGlvbiArIGNvbHVtblxuICAgICAgYnJlYWtcbiAgICB9XG5cbiAgICBpZiAoIWRldGVjdGVkSW5kZW50ICYmIGZpcnN0ICE9PSAwICYmICFpc0VvbChmaXJzdCkgJiYgY29udGVudEluZGVudCA9PT0gLTEpIHtcbiAgICAgIGNvbnRlbnRJbmRlbnQgPSBjb2x1bW5cbiAgICB9XG5cbiAgICBjb25zdCByZXF1aXJlZEluZGVudCA9IGNvbnRlbnRJbmRlbnQgPT09IC0xID8gcGFyZW50SW5kZW50ICsgMSA6IGNvbnRlbnRJbmRlbnRcbiAgICBpZiAoZmlyc3QgIT09IDAgJiYgIWlzRW9sKGZpcnN0KSAmJiBjb2x1bW4gPCByZXF1aXJlZEluZGVudCkge1xuICAgICAgc3RhdGUubGluZUluZGVudCA9IGNvbHVtblxuICAgICAgc3RhdGUucG9zaXRpb24gPSBsaW5lUG9zaXRpb24gKyBjb2x1bW5cbiAgICAgIGJyZWFrXG4gICAgfVxuXG4gICAgc2tpcFVudGlsTGluZUVuZChzdGF0ZSlcbiAgICB2YWx1ZUVuZCA9IHN0YXRlLnBvc2l0aW9uXG4gICAgaWYgKGlzRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkge1xuICAgICAgY29uc3VtZUxpbmVCcmVhayhzdGF0ZSlcbiAgICAgIC8vIEluY2x1ZGUgdGhlIGxpbmUgYnJlYWsgaW4gdGhlIHJhbmdlIHNvIHRyYWlsaW5nIGJsYW5rIGxpbmVzIGFyZVxuICAgICAgLy8gcHJlc2VydmVkLiBUaGlzIGlzIHdoYXQgbGV0cyBjb29rIHRlbGwgYXBhcnQgYW4gZW1wdHkgYHwrYCAocmFuZ2UgXCJcIixcbiAgICAgIC8vIHZhbHVlIFwiXCIpIGZyb20gYSBgfCtgIHdpdGggb25lIGJsYW5rIGxpbmUgKHJhbmdlIFwiXFxuXCIsIHZhbHVlIFwiXFxuXCIpLlxuICAgICAgLy8gRGUtaW5kZW50IGFuZCBjaG9tcGluZyBhcmUgYXBwbGllZCBsYXRlciBpbiBnZXRTY2FsYXJWYWx1ZS5cbiAgICAgIHZhbHVlRW5kID0gc3RhdGUucG9zaXRpb25cbiAgICB9XG4gIH1cblxuICBjaGVja1ByaW50YWJsZShzdGF0ZSwgdmFsdWVTdGFydCwgdmFsdWVFbmQpXG4gIGFkZFNjYWxhckV2ZW50KFxuICAgIHN0YXRlLFxuICAgIHZhbHVlU3RhcnQsXG4gICAgdmFsdWVFbmQsXG4gICAgcHJvcHMuYW5jaG9yU3RhcnQsXG4gICAgcHJvcHMuYW5jaG9yRW5kLFxuICAgIHByb3BzLnRhZ1N0YXJ0LFxuICAgIHByb3BzLnRhZ0VuZCxcbiAgICBzdHlsZSxcbiAgICBjaG9tcGluZyxcbiAgICBjb250ZW50SW5kZW50XG4gIClcbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gY2FuU3RhcnRQbGFpblNjYWxhciAoc3RhdGU6IFBhcnNlclN0YXRlLCBub2RlQ29udGV4dDogTm9kZUNvbnRleHQpIHtcbiAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICBjb25zdCBpbkZsb3cgPSBub2RlQ29udGV4dCA9PT0gQ09OVEVYVF9GTE9XX0lOXG5cbiAgaWYgKGNoID09PSAwIHx8XG4gICAgICBpc1dzT3JFb2woY2gpIHx8XG4gICAgICBjaCA9PT0gMHgyMy8qICMgKi8gfHxcbiAgICAgIGNoID09PSAweDI2LyogJiAqLyB8fFxuICAgICAgY2ggPT09IDB4MkEvKiAqICovIHx8XG4gICAgICBjaCA9PT0gMHgyMS8qICEgKi8gfHxcbiAgICAgIGNoID09PSAweDdDLyogfCAqLyB8fFxuICAgICAgY2ggPT09IDB4M0UvKiA+ICovIHx8XG4gICAgICBjaCA9PT0gMHgyNy8qICcgKi8gfHxcbiAgICAgIGNoID09PSAweDIyLyogXCIgKi8gfHxcbiAgICAgIGNoID09PSAweDI1LyogJSAqLyB8fFxuICAgICAgY2ggPT09IDB4NDAvKiBAICovIHx8XG4gICAgICBjaCA9PT0gMHg2MC8qIGAgKi8gfHxcbiAgICAgIChpbkZsb3cgJiYgaXNGbG93SW5kaWNhdG9yKGNoKSkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmIChjaCA9PT0gMHgzRi8qID8gKi8gfHwgY2ggPT09IDB4MkQvKiAtICovKSB7XG4gICAgY29uc3QgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpXG4gICAgaWYgKGlzV3NPckVvbE9yRW5kKGZvbGxvd2luZykgfHwgKGluRmxvdyAmJiBpc0Zsb3dJbmRpY2F0b3IoZm9sbG93aW5nKSkpIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gcmVhZFBsYWluU2NhbGFyIChzdGF0ZTogUGFyc2VyU3RhdGUsIG5vZGVJbmRlbnQ6IG51bWJlciwgbm9kZUNvbnRleHQ6IE5vZGVDb250ZXh0LCBwcm9wczogTm9kZVByb3BlcnRpZXMpIHtcbiAgaWYgKCFjYW5TdGFydFBsYWluU2NhbGFyKHN0YXRlLCBub2RlQ29udGV4dCkpIHJldHVybiBmYWxzZVxuXG4gIGNvbnN0IHN0YXJ0ID0gc3RhdGUucG9zaXRpb25cbiAgbGV0IGVuZCA9IHN0YXRlLnBvc2l0aW9uXG4gIGxldCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG4gIGNvbnN0IGluRmxvdyA9IG5vZGVDb250ZXh0ID09PSBDT05URVhUX0ZMT1dfSU5cbiAgLy8gQSBzaW5nbGUtbGluZSBwbGFpbiBzY2FsYXIgaXMgc2xpY2VhYmxlIHZlcmJhdGltOiB0aGUgcGFyc2VyIGFscmVhZHkgdHJpbXNcbiAgLy8gdHJhaWxpbmcgd2hpdGVzcGFjZSBmcm9tIHRoZSByYW5nZSwgc28gbm8gZm9sZGluZyBpcyBuZWVkZWQgKHNlZVxuICAvLyBnZXRTY2FsYXJWYWx1ZSBmYXN0IHBhdGgpLiBGb2xkZWQgbGluZSBicmVha3MgbWFrZSBpdCBub24tc2ltcGxlLlxuICBsZXQgbXVsdGlsaW5lID0gZmFsc2VcblxuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICBpZiAoc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUpKSBicmVha1xuXG4gICAgaWYgKGNoID09PSAweDNBLyogOiAqLykge1xuICAgICAgY29uc3QgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpXG4gICAgICBpZiAoaXNXc09yRW9sT3JFbmQoZm9sbG93aW5nKSB8fCAoaW5GbG93ICYmIGlzRmxvd0luZGljYXRvcihmb2xsb3dpbmcpKSkgYnJlYWtcbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDIzLyogIyAqLykge1xuICAgICAgY29uc3QgcHJlY2VkaW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiAtIDEpXG4gICAgICBpZiAoaXNXc09yRW9sKHByZWNlZGluZykpIGJyZWFrXG4gICAgfSBlbHNlIGlmIChpbkZsb3cgJiYgaXNGbG93SW5kaWNhdG9yKGNoKSkge1xuICAgICAgYnJlYWtcbiAgICB9IGVsc2UgaWYgKGlzRW9sKGNoKSkge1xuICAgICAgY29uc3Qgc2F2ZWRQb3NpdGlvbiA9IHN0YXRlLnBvc2l0aW9uXG4gICAgICBjb25zdCBzYXZlZExpbmUgPSBzdGF0ZS5saW5lXG4gICAgICBjb25zdCBzYXZlZExpbmVTdGFydCA9IHN0YXRlLmxpbmVTdGFydFxuICAgICAgY29uc3Qgc2F2ZWRMaW5lSW5kZW50ID0gc3RhdGUubGluZUluZGVudFxuXG4gICAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCBmYWxzZSlcblxuICAgICAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPj0gbm9kZUluZGVudCkge1xuICAgICAgICBtdWx0aWxpbmUgPSB0cnVlXG4gICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgc3RhdGUucG9zaXRpb24gPSBzYXZlZFBvc2l0aW9uXG4gICAgICBzdGF0ZS5saW5lID0gc2F2ZWRMaW5lXG4gICAgICBzdGF0ZS5saW5lU3RhcnQgPSBzYXZlZExpbmVTdGFydFxuICAgICAgc3RhdGUubGluZUluZGVudCA9IHNhdmVkTGluZUluZGVudFxuICAgICAgYnJlYWtcbiAgICB9XG5cbiAgICBpZiAoIWlzV2hpdGVTcGFjZShjaCkpIGVuZCA9IHN0YXRlLnBvc2l0aW9uICsgMVxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICB9XG5cbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVybiBmYWxzZVxuXG4gIGNoZWNrUHJpbnRhYmxlKHN0YXRlLCBzdGFydCwgZW5kKVxuICBhZGRTY2FsYXJFdmVudChzdGF0ZSwgc3RhcnQsIGVuZCwgcHJvcHMuYW5jaG9yU3RhcnQsIHByb3BzLmFuY2hvckVuZCwgcHJvcHMudGFnU3RhcnQsIHByb3BzLnRhZ0VuZCwgU0NBTEFSX1NUWUxFX1BMQUlOLCBDSE9NUElOR19DTElQLCAtMSwgIW11bHRpbGluZSlcbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gZmluZEJsb2NrTWFwcGluZ0NvbG9uIChzdGF0ZTogUGFyc2VyU3RhdGUpIHtcbiAgbGV0IHBvc2l0aW9uID0gc3RhdGUucG9zaXRpb25cbiAgbGV0IGZsb3dMZXZlbCA9IDBcblxuICB3aGlsZSAocG9zaXRpb24gPCBzdGF0ZS5sZW5ndGgpIHtcbiAgICBjb25zdCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pXG5cbiAgICBpZiAoaXNFb2woY2gpKSByZXR1cm4gLTFcbiAgICBpZiAoY2ggPT09IDB4MjMvKiAjICovICYmIGlzV3NPckVvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uIC0gMSkpKSByZXR1cm4gLTFcblxuICAgIGlmICgoY2ggPT09IDB4MkEvKiAqICovIHx8IGNoID09PSAweDI2LyogJiAqLykgJiYgcG9zaXRpb24gPT09IHN0YXRlLnBvc2l0aW9uKSB7XG4gICAgICBkbyB7IHBvc2l0aW9uKysgfVxuICAgICAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pICE9PSAwICYmXG4gICAgICAgICAgICAgIWlzV3NPckVvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSkgJiZcbiAgICAgICAgICAgICAhaXNGbG93SW5kaWNhdG9yKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pKSlcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgaWYgKGNoID09PSAweDVCLyogWyAqLyB8fCBjaCA9PT0gMHg3Qi8qIHsgKi8pIHtcbiAgICAgIGZsb3dMZXZlbCsrXG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHg1RC8qIF0gKi8gfHwgY2ggPT09IDB4N0QvKiB9ICovKSB7XG4gICAgICBpZiAoZmxvd0xldmVsID4gMCkgZmxvd0xldmVsLS1cbiAgICB9IGVsc2UgaWYgKGZsb3dMZXZlbCA9PT0gMCAmJiBjaCA9PT0gMHgzQS8qIDogKi8gJiYgaXNXc09yRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24gKyAxKSkpIHtcbiAgICAgIHJldHVybiBwb3NpdGlvblxuICAgIH1cblxuICAgIGlmICgoZmxvd0xldmVsID4gMCB8fCBwb3NpdGlvbiA9PT0gc3RhdGUucG9zaXRpb24pICYmXG4gICAgICAgIChjaCA9PT0gMHgyNy8qICcgKi8gfHwgY2ggPT09IDB4MjIvKiBcIiAqLykpIHtcbiAgICAgIGNvbnN0IHF1b3RlID0gY2hcbiAgICAgIHBvc2l0aW9uKytcblxuICAgICAgd2hpbGUgKHBvc2l0aW9uIDwgc3RhdGUubGVuZ3RoICYmIHN0YXRlLmlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pICE9PSBxdW90ZSkge1xuICAgICAgICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbikgPT09IDB4NUMvKiBcXCAqLyAmJiBxdW90ZSA9PT0gMHgyMi8qIFwiICovKSBwb3NpdGlvbisrXG4gICAgICAgIHBvc2l0aW9uKytcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwb3NpdGlvbisrXG4gIH1cblxuICByZXR1cm4gLTFcbn1cblxuZnVuY3Rpb24gc2tpcEZsb3dTZXBhcmF0aW9uU3BhY2UgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgbm9kZUluZGVudDogbnVtYmVyKSB7XG4gIGNvbnN0IHN0YXJ0TGluZSA9IHN0YXRlLmxpbmVcbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSlcblxuICBpZiAoKHN0YXRlLmxpbmUgPiBzdGFydExpbmUgJiYgc3RhdGUubGluZUluZGVudCA8IG5vZGVJbmRlbnQpIHx8XG4gICAgICAoc3RhdGUuZmlyc3RUYWJJbkxpbmUgIT09IC0xICYmIHN0YXRlLmxpbmVJbmRlbnQgPCBub2RlSW5kZW50KSkge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICdkZWZpY2llbnQgaW5kZW50YXRpb24nKVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlYWRGbG93Q29sbGVjdGlvbiAoc3RhdGU6IFBhcnNlclN0YXRlLCBub2RlSW5kZW50OiBudW1iZXIsIHByb3BzOiBOb2RlUHJvcGVydGllcykge1xuICBjb25zdCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG4gIGNvbnN0IGlzTWFwcGluZyA9IGNoID09PSAweDdCLyogeyAqL1xuICBjb25zdCBzdGFydCA9IHN0YXRlLnBvc2l0aW9uXG4gIGxldCByZWFkTmV4dCA9IHRydWVcblxuICBpZiAoY2ggIT09IDB4NUIvKiBbICovICYmIGNoICE9PSAweDdCLyogeyAqLykgcmV0dXJuIGZhbHNlXG5cbiAgY29uc3QgdGVybWluYXRvciA9IGlzTWFwcGluZyA/IDB4N0QvKiB9ICovIDogMHg1RC8qIF0gKi9cblxuICBpZiAoaXNNYXBwaW5nKSB7XG4gICAgYWRkTWFwcGluZ0V2ZW50KHN0YXRlLCBzdGFydCwgcHJvcHMuYW5jaG9yU3RhcnQsIHByb3BzLmFuY2hvckVuZCwgcHJvcHMudGFnU3RhcnQsIHByb3BzLnRhZ0VuZCwgQ09MTEVDVElPTl9TVFlMRV9GTE9XKVxuICB9IGVsc2Uge1xuICAgIGFkZFNlcXVlbmNlRXZlbnQoc3RhdGUsIHN0YXJ0LCBwcm9wcy5hbmNob3JTdGFydCwgcHJvcHMuYW5jaG9yRW5kLCBwcm9wcy50YWdTdGFydCwgcHJvcHMudGFnRW5kLCBDT0xMRUNUSU9OX1NUWUxFX0ZMT1cpXG4gIH1cblxuICBzdGF0ZS5wb3NpdGlvbisrXG5cbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwKSB7XG4gICAgc2tpcEZsb3dTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIG5vZGVJbmRlbnQpXG5cbiAgICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSB0ZXJtaW5hdG9yKSB7XG4gICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgICBhZGRQb3BFdmVudChzdGF0ZSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIGlmICghcmVhZE5leHQpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdtaXNzZWQgY29tbWEgYmV0d2VlbiBmbG93IGNvbGxlY3Rpb24gZW50cmllcycpXG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHgyQy8qICwgKi8pIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsIFwiZXhwZWN0ZWQgdGhlIG5vZGUgY29udGVudCwgYnV0IGZvdW5kICcsJ1wiKVxuICAgIH1cblxuICAgIGxldCBpc1BhaXIgPSBmYWxzZVxuICAgIGxldCBpc0V4cGxpY2l0UGFpciA9IGZhbHNlXG5cbiAgICBpZiAoY2ggPT09IDB4M0YvKiA/ICovICYmIGlzV3NPckVvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSkpKSB7XG4gICAgICBpc1BhaXIgPSBpc0V4cGxpY2l0UGFpciA9IHRydWVcbiAgICAgIHN0YXRlLnBvc2l0aW9uICs9IDFcbiAgICAgIHNraXBGbG93U2VwYXJhdGlvblNwYWNlKHN0YXRlLCBub2RlSW5kZW50KVxuICAgIH1cblxuICAgIGNvbnN0IGVudHJ5TGluZSA9IHN0YXRlLmxpbmVcbiAgICBjb25zdCBlbnRyeVN0YXJ0ID0gc25hcHNob3RTdGF0ZShzdGF0ZSlcblxuICAgIGNvbnN0IGtleVdhc1JlYWQgPSBwYXJzZU5vZGUoc3RhdGUsIG5vZGVJbmRlbnQsIENPTlRFWFRfRkxPV19JTiwgZmFsc2UsIHRydWUpXG4gICAgc2tpcEZsb3dTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIG5vZGVJbmRlbnQpXG5cbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgICBpZiAoKGlzTWFwcGluZyB8fCBpc0V4cGxpY2l0UGFpciB8fCBzdGF0ZS5saW5lID09PSBlbnRyeUxpbmUpICYmIGNoID09PSAweDNBLyogOiAqLykge1xuICAgICAgaXNQYWlyID0gdHJ1ZVxuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgc2tpcEZsb3dTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIG5vZGVJbmRlbnQpXG4gICAgICBpZiAoIWlzTWFwcGluZykge1xuICAgICAgICByZXN0b3JlU3RhdGUoc3RhdGUsIGVudHJ5U3RhcnQpXG4gICAgICAgIGFkZE1hcHBpbmdFdmVudChzdGF0ZSwgZW50cnlTdGFydC5wb3NpdGlvbiwgTk9fUkFOR0UsIE5PX1JBTkdFLCBOT19SQU5HRSwgTk9fUkFOR0UsIENPTExFQ1RJT05fU1RZTEVfRkxPVylcbiAgICAgICAgaWYgKCFwYXJzZU5vZGUoc3RhdGUsIG5vZGVJbmRlbnQsIENPTlRFWFRfRkxPV19JTiwgZmFsc2UsIHRydWUpKSB7XG4gICAgICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICAgICAgfVxuICAgICAgICBza2lwRmxvd1NlcGFyYXRpb25TcGFjZShzdGF0ZSwgbm9kZUluZGVudClcbiAgICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgICBza2lwRmxvd1NlcGFyYXRpb25TcGFjZShzdGF0ZSwgbm9kZUluZGVudClcbiAgICAgIH0gZWxzZSBpZiAoIWtleVdhc1JlYWQpIHtcbiAgICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICAgIH1cbiAgICAgIGlmICghcGFyc2VOb2RlKHN0YXRlLCBub2RlSW5kZW50LCBDT05URVhUX0ZMT1dfSU4sIGZhbHNlLCB0cnVlKSkge1xuICAgICAgICBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICAgICAgfVxuICAgICAgc2tpcEZsb3dTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIG5vZGVJbmRlbnQpXG4gICAgICBpZiAoIWlzTWFwcGluZykgYWRkUG9wRXZlbnQoc3RhdGUpXG4gICAgfSBlbHNlIGlmIChpc01hcHBpbmcgJiYgaXNQYWlyKSB7XG4gICAgICBpZiAoIWtleVdhc1JlYWQpIGFkZEVtcHR5U2NhbGFyRXZlbnQoc3RhdGUpXG4gICAgICBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICAgIH0gZWxzZSBpZiAoaXNNYXBwaW5nKSB7XG4gICAgICBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICAgIH0gZWxzZSBpZiAoaXNQYWlyKSB7XG4gICAgICByZXN0b3JlU3RhdGUoc3RhdGUsIGVudHJ5U3RhcnQpXG4gICAgICBhZGRNYXBwaW5nRXZlbnQoc3RhdGUsIGVudHJ5U3RhcnQucG9zaXRpb24sIE5PX1JBTkdFLCBOT19SQU5HRSwgTk9fUkFOR0UsIE5PX1JBTkdFLCBDT0xMRUNUSU9OX1NUWUxFX0ZMT1cpXG4gICAgICBwYXJzZU5vZGUoc3RhdGUsIG5vZGVJbmRlbnQsIENPTlRFWFRfRkxPV19JTiwgZmFsc2UsIHRydWUpXG4gICAgICBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICAgICAgYWRkUG9wRXZlbnQoc3RhdGUpXG4gICAgfVxuXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSAweDJDLyogLCAqLykge1xuICAgICAgcmVhZE5leHQgPSB0cnVlXG4gICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlYWROZXh0ID0gZmFsc2VcbiAgICB9XG4gIH1cblxuICB0aHJvd0Vycm9yKHN0YXRlLCAndW5leHBlY3RlZCBlbmQgb2YgdGhlIHN0cmVhbSB3aXRoaW4gYSBmbG93IGNvbGxlY3Rpb24nKVxufVxuXG5mdW5jdGlvbiByZWFkQmxvY2tTZXF1ZW5jZSAoc3RhdGU6IFBhcnNlclN0YXRlLCBub2RlSW5kZW50OiBudW1iZXIsIHByb3BzOiBOb2RlUHJvcGVydGllcykge1xuICBpZiAoc3RhdGUuZmlyc3RUYWJJbkxpbmUgIT09IC0xIHx8IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAweDJELyogLSAqLyB8fCAhaXNXc09yRW9sT3JFbmQoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgYWRkU2VxdWVuY2VFdmVudChzdGF0ZSwgc3RhdGUucG9zaXRpb24sIHByb3BzLmFuY2hvclN0YXJ0LCBwcm9wcy5hbmNob3JFbmQsIHByb3BzLnRhZ1N0YXJ0LCBwcm9wcy50YWdFbmQsIENPTExFQ1RJT05fU1RZTEVfQkxPQ0spXG5cbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAweDJELyogLSAqLyAmJiBpc1dzT3JFb2xPckVuZChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSkpKSB7XG4gICAgaWYgKHN0YXRlLmZpcnN0VGFiSW5MaW5lICE9PSAtMSkge1xuICAgICAgc3RhdGUucG9zaXRpb24gPSBzdGF0ZS5maXJzdFRhYkluTGluZVxuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RhYiBjaGFyYWN0ZXJzIG11c3Qgbm90IGJlIHVzZWQgaW4gaW5kZW50YXRpb24nKVxuICAgIH1cblxuICAgIGNvbnN0IGVudHJ5TGluZSA9IHN0YXRlLmxpbmVcbiAgICBzdGF0ZS5wb3NpdGlvbisrXG5cbiAgICBjb25zdCBoYWRCcmVhayA9IHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUpID4gMFxuICAgIGlmIChzdGF0ZS5maXJzdFRhYkluTGluZSAhPT0gLTEgJiZcbiAgICAgICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MkQvKiAtICovICYmXG4gICAgICAgIGlzV3NPckVvbE9yRW5kKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdiYWQgaW5kZW50YXRpb24gb2YgYSBzZXF1ZW5jZSBlbnRyeScpXG4gICAgfVxuXG4gICAgaWYgKGhhZEJyZWFrICYmIHN0YXRlLmxpbmVJbmRlbnQgPD0gbm9kZUluZGVudCkge1xuICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyc2VOb2RlKHN0YXRlLCBub2RlSW5kZW50LCBDT05URVhUX0JMT0NLX0lOLCBmYWxzZSwgdHJ1ZSlcbiAgICB9XG5cbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKVxuXG4gICAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPCBub2RlSW5kZW50IHx8IHN0YXRlLnBvc2l0aW9uID49IHN0YXRlLmxlbmd0aCkgYnJlYWtcbiAgICBpZiAoc3RhdGUubGluZUluZGVudCA+IG5vZGVJbmRlbnQpIHRocm93RXJyb3Ioc3RhdGUsICdiYWQgaW5kZW50YXRpb24gb2YgYSBzZXF1ZW5jZSBlbnRyeScpXG4gICAgaWYgKHN0YXRlLmxpbmUgPT09IGVudHJ5TGluZSAmJlxuICAgICAgICBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gMHgyRC8qIC0gKi8gJiZcbiAgICAgICAgaXNXc09yRW9sT3JFbmQoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpKSkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2JhZCBpbmRlbnRhdGlvbiBvZiBhIHNlcXVlbmNlIGVudHJ5JylcbiAgICB9XG4gIH1cblxuICBhZGRQb3BFdmVudChzdGF0ZSlcbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gcmVhZEJsb2NrTWFwcGluZyAoc3RhdGU6IFBhcnNlclN0YXRlLCBub2RlSW5kZW50OiBudW1iZXIsIGZsb3dJbmRlbnQ6IG51bWJlciwgcHJvcHM6IE5vZGVQcm9wZXJ0aWVzKSB7XG4gIGxldCBhdEV4cGxpY2l0S2V5ID0gZmFsc2VcbiAgbGV0IGRldGVjdGVkID0gZmFsc2VcbiAgbGV0IG1hcHBpbmdPcGVuZWQgPSBmYWxzZVxuICBsZXQgcGVuZGluZ0V4cGxpY2l0S2V5ID0gZmFsc2VcblxuICBpZiAoc3RhdGUuZmlyc3RUYWJJbkxpbmUgIT09IC0xKSByZXR1cm4gZmFsc2VcblxuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gIHdoaWxlIChjaCAhPT0gMCkge1xuICAgIGlmICghYXRFeHBsaWNpdEtleSAmJiBzdGF0ZS5maXJzdFRhYkluTGluZSAhPT0gLTEpIHtcbiAgICAgIHN0YXRlLnBvc2l0aW9uID0gc3RhdGUuZmlyc3RUYWJJbkxpbmVcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd0YWIgY2hhcmFjdGVycyBtdXN0IG5vdCBiZSB1c2VkIGluIGluZGVudGF0aW9uJylcbiAgICB9XG5cbiAgICBjb25zdCBmb2xsb3dpbmcgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSlcbiAgICBjb25zdCBlbnRyeUxpbmUgPSBzdGF0ZS5saW5lXG5cbiAgICBpZiAoKGNoID09PSAweDNGLyogPyAqLyB8fCBjaCA9PT0gMHgzQS8qIDogKi8pICYmIGlzV3NPckVvbE9yRW5kKGZvbGxvd2luZykpIHtcbiAgICAgIGlmICghbWFwcGluZ09wZW5lZCkge1xuICAgICAgICBhZGRNYXBwaW5nRXZlbnQoc3RhdGUsIHN0YXRlLnBvc2l0aW9uLCBwcm9wcy5hbmNob3JTdGFydCwgcHJvcHMuYW5jaG9yRW5kLCBwcm9wcy50YWdTdGFydCwgcHJvcHMudGFnRW5kLCBDT0xMRUNUSU9OX1NUWUxFX0JMT0NLKVxuICAgICAgICBtYXBwaW5nT3BlbmVkID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoY2ggPT09IDB4M0YvKiA/ICovKSB7XG4gICAgICAgIGlmIChhdEV4cGxpY2l0S2V5KSBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICAgICAgICBkZXRlY3RlZCA9IHRydWVcbiAgICAgICAgYXRFeHBsaWNpdEtleSA9IHRydWVcbiAgICAgIH0gZWxzZSBpZiAoYXRFeHBsaWNpdEtleSkge1xuICAgICAgICBhdEV4cGxpY2l0S2V5ID0gZmFsc2VcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFkZEVtcHR5U2NhbGFyRXZlbnQoc3RhdGUpXG4gICAgICAgIGRldGVjdGVkID0gdHJ1ZVxuICAgICAgICBhdEV4cGxpY2l0S2V5ID0gZmFsc2VcbiAgICAgIH1cblxuICAgICAgc3RhdGUucG9zaXRpb24gKz0gMVxuICAgICAgcGVuZGluZ0V4cGxpY2l0S2V5ID0gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBbiBleHBsaWNpdCBrZXkgYXdhaXRpbmcgaXRzIHZhbHVlLCBmb2xsb3dlZCBieSBhbiBpbXBsaWNpdCBrZXksIG1lYW5zXG4gICAgICAvLyB0aGUgZXhwbGljaXQga2V5J3MgdmFsdWUgaXMgZW1wdHkuIEVtaXQgaXQgbm93IChhcHBlbmQtb25seSkgc28gaXQgaXNcbiAgICAgIC8vIG9yZGVyZWQgYmVmb3JlIHRoZSBpbXBsaWNpdCBrZXkgbm9kZSByZWFkIGp1c3QgYmVsb3cuXG4gICAgICBpZiAoYXRFeHBsaWNpdEtleSkge1xuICAgICAgICBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICAgICAgICBhdEV4cGxpY2l0S2V5ID0gZmFsc2VcbiAgICAgIH1cblxuICAgICAgY29uc3QgYmVmb3JlS2V5ID0gc25hcHNob3RTdGF0ZShzdGF0ZSlcblxuICAgICAgaWYgKCFwYXJzZU5vZGUoc3RhdGUsIGZsb3dJbmRlbnQsIENPTlRFWFRfRkxPV19PVVQsIGZhbHNlLCB0cnVlKSkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUubGluZSA9PT0gZW50cnlMaW5lKSB7XG4gICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgICAgICB3aGlsZSAoaXNXaGl0ZVNwYWNlKGNoKSkge1xuICAgICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNoID09PSAweDNBLyogOiAqLykge1xuICAgICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuXG4gICAgICAgICAgaWYgKCFpc1dzT3JFb2xPckVuZChjaCkpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdhIHdoaXRlc3BhY2UgY2hhcmFjdGVyIGlzIGV4cGVjdGVkIGFmdGVyIHRoZSBrZXktdmFsdWUgc2VwYXJhdG9yIHdpdGhpbiBhIGJsb2NrIG1hcHBpbmcnKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghbWFwcGluZ09wZW5lZCkge1xuICAgICAgICAgICAgcmVzdG9yZVN0YXRlKHN0YXRlLCBiZWZvcmVLZXkpXG4gICAgICAgICAgICBhZGRNYXBwaW5nRXZlbnQoc3RhdGUsIGJlZm9yZUtleS5wb3NpdGlvbiwgcHJvcHMuYW5jaG9yU3RhcnQsIHByb3BzLmFuY2hvckVuZCwgcHJvcHMudGFnU3RhcnQsIHByb3BzLnRhZ0VuZCwgQ09MTEVDVElPTl9TVFlMRV9CTE9DSylcbiAgICAgICAgICAgIG1hcHBpbmdPcGVuZWQgPSB0cnVlXG4gICAgICAgICAgICAvLyBUaGUga2V5LCB0aGUgYDpgIGFuZCB0aGUgc3BhY2UgYWZ0ZXIgaXQgd2VyZSBhbHJlYWR5IHZhbGlkYXRlZFxuICAgICAgICAgICAgLy8gYWJvdmUsIGJlZm9yZSB0aGUgcm9sbGJhY2suIFJlLXJlYWRpbmcgdGhlIHNhbWUgaW5wdXQgY2Fubm90XG4gICAgICAgICAgICAvLyBmYWlsLCBzbyBqdXN0IGNvbnN1bWUgaXQgYWdhaW4gd2l0aG91dCBlcnJvciBjaGVja3MuXG4gICAgICAgICAgICBwYXJzZU5vZGUoc3RhdGUsIGZsb3dJbmRlbnQsIENPTlRFWFRfRkxPV19PVVQsIGZhbHNlLCB0cnVlKVxuXG4gICAgICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG4gICAgICAgICAgICB3aGlsZSAoaXNXaGl0ZVNwYWNlKGNoKSkge1xuICAgICAgICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRldGVjdGVkID0gdHJ1ZVxuICAgICAgICAgIGF0RXhwbGljaXRLZXkgPSBmYWxzZVxuICAgICAgICAgIHBlbmRpbmdFeHBsaWNpdEtleSA9IGZhbHNlXG4gICAgICAgIH0gZWxzZSBpZiAoZGV0ZWN0ZWQpIHtcbiAgICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCBcImV4cGVjdGVkICc6JyBhZnRlciBhIG1hcHBpbmcga2V5XCIpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTm90IGEgbWFwcGluZy4gSWYgb3V0ZXIgcHJvcGVydGllcyBhcmUgcGVuZGluZywgcm9sbCBiYWNrIHNvIHRoZVxuICAgICAgICAgIC8vIGNhbGxlciByZS1yZWFkcyB0aGlzIG5vZGUgd2l0aCB0aGVtIGF0dGFjaGVkIChldmVudHMgYXJlIGFwcGVuZC1vbmx5KS5cbiAgICAgICAgICBpZiAocHJvcHMuYW5jaG9yU3RhcnQgIT09IE5PX1JBTkdFIHx8IHByb3BzLnRhZ1N0YXJ0ICE9PSBOT19SQU5HRSkge1xuICAgICAgICAgICAgcmVzdG9yZVN0YXRlKHN0YXRlLCBiZWZvcmVLZXkpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChkZXRlY3RlZCkge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnY2FuIG5vdCByZWFkIGEgYmxvY2sgbWFwcGluZyBlbnRyeTsgYSBtdWx0aWxpbmUga2V5IG1heSBub3QgYmUgYW4gaW1wbGljaXQga2V5JylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChwcm9wcy5hbmNob3JTdGFydCAhPT0gTk9fUkFOR0UgfHwgcHJvcHMudGFnU3RhcnQgIT09IE5PX1JBTkdFKSB7XG4gICAgICAgICAgcmVzdG9yZVN0YXRlKHN0YXRlLCBiZWZvcmVLZXkpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocGFyc2VOb2RlKHN0YXRlLCBub2RlSW5kZW50LCBDT05URVhUX0JMT0NLX09VVCwgdHJ1ZSwgcGVuZGluZ0V4cGxpY2l0S2V5KSkge1xuICAgICAgcGVuZGluZ0V4cGxpY2l0S2V5ID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoIWF0RXhwbGljaXRLZXkpIHtcbiAgICAgIGlmIChwZW5kaW5nRXhwbGljaXRLZXkpIHtcbiAgICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICAgICAgcGVuZGluZ0V4cGxpY2l0S2V5ID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKVxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIGlmICgoc3RhdGUubGluZSA9PT0gZW50cnlMaW5lIHx8IHN0YXRlLmxpbmVJbmRlbnQgPiBub2RlSW5kZW50KSAmJiBjaCAhPT0gMCkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2JhZCBpbmRlbnRhdGlvbiBvZiBhIG1hcHBpbmcgZW50cnknKVxuICAgIH0gZWxzZSBpZiAoc3RhdGUubGluZUluZGVudCA8IG5vZGVJbmRlbnQpIHtcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKCFkZXRlY3RlZCkgcmV0dXJuIGZhbHNlXG4gIGlmIChhdEV4cGxpY2l0S2V5KSBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICBpZiAobWFwcGluZ09wZW5lZCkgYWRkUG9wRXZlbnQoc3RhdGUpXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHBhcnNlTm9kZSAoXG4gIHN0YXRlOiBQYXJzZXJTdGF0ZSxcbiAgcGFyZW50SW5kZW50OiBudW1iZXIsXG4gIG5vZGVDb250ZXh0OiBOb2RlQ29udGV4dCxcbiAgYWxsb3dUb1NlZWs6IGJvb2xlYW4sXG4gIGFsbG93Q29tcGFjdDogYm9vbGVhbixcbiAgYWxsb3dQcm9wZXJ0eU1hcHBpbmcgPSB0cnVlXG4pOiBib29sZWFuIHtcbiAgaWYgKHN0YXRlLmRlcHRoID49IHN0YXRlLm1heERlcHRoKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgYG5lc3RpbmcgZXhjZWVkZWQgbWF4RGVwdGggKCR7c3RhdGUubWF4RGVwdGh9KWApXG4gIH1cblxuICBzdGF0ZS5kZXB0aCsrXG5cbiAgbGV0IGluZGVudFN0YXR1cyA9IDFcbiAgbGV0IGF0TmV3TGluZSA9IGZhbHNlXG4gIGxldCBoYXNDb250ZW50ID0gZmFsc2VcbiAgbGV0IHByb3BlcnR5U3RhcnQ6IFBhcnNlclNuYXBzaG90IHwgbnVsbCA9IG51bGxcbiAgY29uc3QgcHJvcHMgPSBlbXB0eVByb3BlcnRpZXMoKVxuXG4gIGxldCBhbGxvd0Jsb2NrU2NhbGFycyA9IG5vZGVDb250ZXh0ID09PSBDT05URVhUX0JMT0NLX09VVCB8fCBub2RlQ29udGV4dCA9PT0gQ09OVEVYVF9CTE9DS19JTlxuICBsZXQgYWxsb3dCbG9ja0NvbGxlY3Rpb25zID0gYWxsb3dCbG9ja1NjYWxhcnNcbiAgY29uc3QgYWxsb3dCbG9ja1N0eWxlcyA9IGFsbG93QmxvY2tTY2FsYXJzXG5cbiAgaWYgKGFsbG93VG9TZWVrICYmIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUpKSB7XG4gICAgYXROZXdMaW5lID0gdHJ1ZVxuXG4gICAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPiBwYXJlbnRJbmRlbnQpIHtcbiAgICAgIGluZGVudFN0YXR1cyA9IDFcbiAgICB9IGVsc2UgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPT09IHBhcmVudEluZGVudCkge1xuICAgICAgaW5kZW50U3RhdHVzID0gMFxuICAgIH0gZWxzZSB7XG4gICAgICBpbmRlbnRTdGF0dXMgPSAtMVxuICAgIH1cbiAgfVxuXG4gIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSkpIHtcbiAgICBzdGF0ZS5kZXB0aC0tXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoaW5kZW50U3RhdHVzID09PSAxKSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGNvbnN0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcbiAgICAgIGNvbnN0IHByb3BlcnR5U3RhdGUgPSBzbmFwc2hvdFN0YXRlKHN0YXRlKVxuXG4gICAgICBpZiAoYXROZXdMaW5lICYmXG4gICAgICAgICAgaW5kZW50U3RhdHVzICE9PSAxICYmXG4gICAgICAgICAgKGNoID09PSAweDIxLyogISAqLyB8fCBjaCA9PT0gMHgyNi8qICYgKi8pKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGlmIChhdE5ld0xpbmUgJiZcbiAgICAgICAgICBhbGxvd0Jsb2NrU3R5bGVzICYmXG4gICAgICAgICAgKHByb3BzLnRhZ1N0YXJ0ICE9PSBOT19SQU5HRSB8fCBwcm9wcy5hbmNob3JTdGFydCAhPT0gTk9fUkFOR0UpICYmXG4gICAgICAgICAgKGNoID09PSAweDIxLyogISAqLyB8fCBjaCA9PT0gMHgyNi8qICYgKi8pKSB7XG4gICAgICAgIGNvbnN0IGZhbGxiYWNrU3RhdGUgPSBzbmFwc2hvdFN0YXRlKHN0YXRlKVxuICAgICAgICBjb25zdCBmbG93SW5kZW50ID0gcGFyZW50SW5kZW50ICsgMVxuICAgICAgICBjb25zdCBtYXBwaW5nSW5kZW50ID0gc3RhdGUucG9zaXRpb24gLSBzdGF0ZS5saW5lU3RhcnRcblxuICAgICAgICBpZiAocmVhZEJsb2NrTWFwcGluZyhzdGF0ZSwgbWFwcGluZ0luZGVudCwgZmxvd0luZGVudCwgcHJvcHMpICYmXG4gICAgICAgICAgICBzdGF0ZS5ldmVudHNbZmFsbGJhY2tTdGF0ZS5ldmVudHNMZW5ndGhdPy50eXBlID09PSBFVkVOVF9NQVBQSU5HKSB7XG4gICAgICAgICAgc3RhdGUuZGVwdGgtLVxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cblxuICAgICAgICByZXN0b3JlU3RhdGUoc3RhdGUsIGZhbGxiYWNrU3RhdGUpXG4gICAgICB9XG5cbiAgICAgIGlmIChhdE5ld0xpbmUgJiZcbiAgICAgICAgICAoKGNoID09PSAweDIxLyogISAqLyAmJiBwcm9wcy50YWdTdGFydCAhPT0gTk9fUkFOR0UpIHx8XG4gICAgICAgICAgIChjaCA9PT0gMHgyNi8qICYgKi8gJiYgcHJvcHMuYW5jaG9yU3RhcnQgIT09IE5PX1JBTkdFKSkpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgaWYgKCFyZWFkVGFnUHJvcGVydHkoc3RhdGUsIHByb3BzLCBub2RlQ29udGV4dCA9PT0gQ09OVEVYVF9GTE9XX0lOKSAmJiAhcmVhZEFuY2hvclByb3BlcnR5KHN0YXRlLCBwcm9wcykpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgaWYgKHByb3BlcnR5U3RhcnQgPT09IG51bGwpIHByb3BlcnR5U3RhcnQgPSBwcm9wZXJ0eVN0YXRlXG5cbiAgICAgIGlmIChza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKSkge1xuICAgICAgICBhdE5ld0xpbmUgPSB0cnVlXG4gICAgICAgIGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9IGFsbG93QmxvY2tTdHlsZXNcblxuICAgICAgICBpZiAoc3RhdGUubGluZUluZGVudCA+IHBhcmVudEluZGVudCkge1xuICAgICAgICAgIGluZGVudFN0YXR1cyA9IDFcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZS5saW5lSW5kZW50ID09PSBwYXJlbnRJbmRlbnQpIHtcbiAgICAgICAgICBpbmRlbnRTdGF0dXMgPSAwXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW5kZW50U3RhdHVzID0gLTFcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWxsb3dCbG9ja0NvbGxlY3Rpb25zID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoYWxsb3dCbG9ja0NvbGxlY3Rpb25zKSB7XG4gICAgYWxsb3dCbG9ja0NvbGxlY3Rpb25zID0gYXROZXdMaW5lIHx8IGFsbG93Q29tcGFjdFxuICB9XG5cbiAgaWYgKGluZGVudFN0YXR1cyA9PT0gMSB8fCBub2RlQ29udGV4dCA9PT0gQ09OVEVYVF9CTE9DS19PVVQpIHtcbiAgICBjb25zdCBmbG93SW5kZW50ID0gbm9kZUNvbnRleHQgPT09IENPTlRFWFRfRkxPV19JTiB8fCBub2RlQ29udGV4dCA9PT0gQ09OVEVYVF9GTE9XX09VVFxuICAgICAgPyBwYXJlbnRJbmRlbnRcbiAgICAgIDogcGFyZW50SW5kZW50ICsgMVxuICAgIGNvbnN0IGJsb2NrSW5kZW50ID0gc3RhdGUucG9zaXRpb24gLSBzdGF0ZS5saW5lU3RhcnRcblxuICAgIGlmIChpbmRlbnRTdGF0dXMgPT09IDEpIHtcbiAgICAgIGlmICgoYWxsb3dCbG9ja0NvbGxlY3Rpb25zICYmXG4gICAgICAgICAgKHJlYWRCbG9ja1NlcXVlbmNlKHN0YXRlLCBibG9ja0luZGVudCwgcHJvcHMpIHx8XG4gICAgICAgICAgIHJlYWRCbG9ja01hcHBpbmcoc3RhdGUsIGJsb2NrSW5kZW50LCBmbG93SW5kZW50LCBwcm9wcykpKSB8fFxuICAgICAgICAgIHJlYWRGbG93Q29sbGVjdGlvbihzdGF0ZSwgZmxvd0luZGVudCwgcHJvcHMpKSB7XG4gICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgICAgICAgaWYgKHByb3BlcnR5U3RhcnQgIT09IG51bGwgJiYgYWxsb3dQcm9wZXJ0eU1hcHBpbmcgJiYgYWxsb3dCbG9ja1N0eWxlcyAmJiAhYWxsb3dCbG9ja0NvbGxlY3Rpb25zICYmXG4gICAgICAgICAgICBjaCAhPT0gMHg3Qy8qIHwgKi8gJiYgY2ggIT09IDB4M0UvKiA+ICovKSB7XG4gICAgICAgICAgY29uc3QgZmFsbGJhY2tTdGF0ZSA9IHNuYXBzaG90U3RhdGUoc3RhdGUpXG4gICAgICAgICAgY29uc3QgcHJvcGVydHlJbmRlbnQgPSBwcm9wZXJ0eVN0YXJ0LnBvc2l0aW9uIC0gcHJvcGVydHlTdGFydC5saW5lU3RhcnRcblxuICAgICAgICAgIHJlc3RvcmVTdGF0ZShzdGF0ZSwgcHJvcGVydHlTdGFydClcblxuICAgICAgICAgIGlmIChyZWFkQmxvY2tNYXBwaW5nKHN0YXRlLCBwcm9wZXJ0eUluZGVudCwgZmxvd0luZGVudCwgZW1wdHlQcm9wZXJ0aWVzKCkpICYmXG4gICAgICAgICAgICAgIHN0YXRlLmV2ZW50c1tmYWxsYmFja1N0YXRlLmV2ZW50c0xlbmd0aF0/LnR5cGUgPT09IEVWRU5UX01BUFBJTkcpIHtcbiAgICAgICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3RvcmVTdGF0ZShzdGF0ZSwgZmFsbGJhY2tTdGF0ZSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWhhc0NvbnRlbnQgJiZcbiAgICAgICAgICAgICgoYWxsb3dCbG9ja1NjYWxhcnMgJiYgcmVhZEJsb2NrU2NhbGFyKHN0YXRlLCBmbG93SW5kZW50LCBwcm9wcykpIHx8XG4gICAgICAgICAgICAgcmVhZFNpbmdsZVF1b3RlZFNjYWxhcihzdGF0ZSwgZmxvd0luZGVudCwgcHJvcHMpIHx8XG4gICAgICAgICAgICAgcmVhZERvdWJsZVF1b3RlZFNjYWxhcihzdGF0ZSwgZmxvd0luZGVudCwgcHJvcHMpIHx8XG4gICAgICAgICAgICAgcmVhZEFsaWFzKHN0YXRlLCBwcm9wcykgfHxcbiAgICAgICAgICAgICByZWFkUGxhaW5TY2FsYXIoc3RhdGUsIGZsb3dJbmRlbnQsIG5vZGVDb250ZXh0LCBwcm9wcykpKSB7XG4gICAgICAgICAgaGFzQ29udGVudCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaW5kZW50U3RhdHVzID09PSAwKSB7XG4gICAgICBoYXNDb250ZW50ID0gYWxsb3dCbG9ja0NvbGxlY3Rpb25zICYmIHJlYWRCbG9ja1NlcXVlbmNlKHN0YXRlLCBibG9ja0luZGVudCwgcHJvcHMpXG4gICAgfVxuICB9XG5cbiAgYWxsb3dCbG9ja1NjYWxhcnMgPSBhbGxvd0Jsb2NrU2NhbGFycyAmJiAhaGFzQ29udGVudFxuXG4gIGlmICghaGFzQ29udGVudCAmJiAocHJvcHMuYW5jaG9yU3RhcnQgIT09IE5PX1JBTkdFIHx8IHByb3BzLnRhZ1N0YXJ0ICE9PSBOT19SQU5HRSB8fCBhbGxvd0Jsb2NrU2NhbGFycykpIHtcbiAgICBhZGRTY2FsYXJFdmVudChcbiAgICAgIHN0YXRlLFxuICAgICAgTk9fUkFOR0UsXG4gICAgICBOT19SQU5HRSxcbiAgICAgIHByb3BzLmFuY2hvclN0YXJ0LFxuICAgICAgcHJvcHMuYW5jaG9yRW5kLFxuICAgICAgcHJvcHMudGFnU3RhcnQsXG4gICAgICBwcm9wcy50YWdFbmQsXG4gICAgICBTQ0FMQVJfU1RZTEVfUExBSU5cbiAgICApXG4gICAgaGFzQ29udGVudCA9IHRydWVcbiAgfVxuXG4gIHN0YXRlLmRlcHRoLS1cbiAgcmV0dXJuIGhhc0NvbnRlbnQgfHwgcHJvcHMuYW5jaG9yU3RhcnQgIT09IE5PX1JBTkdFIHx8IHByb3BzLnRhZ1N0YXJ0ICE9PSBOT19SQU5HRVxufVxuXG5mdW5jdGlvbiByZWFkRGlyZWN0aXZlIChzdGF0ZTogUGFyc2VyU3RhdGUpIHtcbiAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPiAwIHx8IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAweDI1LyogJSAqLykgcmV0dXJuIGZhbHNlXG5cbiAgc3RhdGUucG9zaXRpb24rK1xuICBjb25zdCBuYW1lU3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCAmJiAhaXNXc09yRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkgc3RhdGUucG9zaXRpb24rK1xuXG4gIGNvbnN0IG5hbWUgPSBzdGF0ZS5pbnB1dC5zbGljZShuYW1lU3RhcnQsIHN0YXRlLnBvc2l0aW9uKVxuICBjb25zdCBhcmdzOiBzdHJpbmdbXSA9IFtdXG5cbiAgaWYgKG5hbWUubGVuZ3RoID09PSAwKSB0aHJvd0Vycm9yKHN0YXRlLCAnZGlyZWN0aXZlIG5hbWUgbXVzdCBub3QgYmUgbGVzcyB0aGFuIG9uZSBjaGFyYWN0ZXIgaW4gbGVuZ3RoJylcblxuICB3aGlsZSAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgIT09IDAgJiYgIWlzRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkge1xuICAgIHdoaWxlIChpc1doaXRlU3BhY2Uoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpKSBzdGF0ZS5wb3NpdGlvbisrXG4gICAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAweDIzLyogIyAqLyB8fCBpc0VvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSkgfHwgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDApIGJyZWFrXG5cbiAgICBjb25zdCBzdGFydCA9IHN0YXRlLnBvc2l0aW9uXG4gICAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwICYmICFpc1dzT3JFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpKSBzdGF0ZS5wb3NpdGlvbisrXG4gICAgYXJncy5wdXNoKHN0YXRlLmlucHV0LnNsaWNlKHN0YXJ0LCBzdGF0ZS5wb3NpdGlvbikpXG4gIH1cblxuICBpZiAoaXNFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpKSBjb25zdW1lTGluZUJyZWFrKHN0YXRlKVxuXG4gIGlmIChuYW1lID09PSAnWUFNTCcpIHtcbiAgICBpZiAoc3RhdGUuZGlyZWN0aXZlcy5zb21lKGRpcmVjdGl2ZSA9PiBkaXJlY3RpdmUua2luZCA9PT0gJ3lhbWwnKSkgdGhyb3dFcnJvcihzdGF0ZSwgJ2R1cGxpY2F0aW9uIG9mICVZQU1MIGRpcmVjdGl2ZScpXG4gICAgaWYgKGFyZ3MubGVuZ3RoICE9PSAxKSB0aHJvd0Vycm9yKHN0YXRlLCAnWUFNTCBkaXJlY3RpdmUgYWNjZXB0cyBleGFjdGx5IG9uZSBhcmd1bWVudCcpXG5cbiAgICBjb25zdCBtYXRjaCA9IC9eKFswLTldKylcXC4oWzAtOV0rKSQvLmV4ZWMoYXJnc1swXSlcbiAgICBpZiAobWF0Y2ggPT09IG51bGwpIHRocm93RXJyb3Ioc3RhdGUsICdpbGwtZm9ybWVkIGFyZ3VtZW50IG9mIHRoZSBZQU1MIGRpcmVjdGl2ZScpXG4gICAgaWYgKHBhcnNlSW50KG1hdGNoWzFdLCAxMCkgIT09IDEpIHRocm93RXJyb3Ioc3RhdGUsICd1bmFjY2VwdGFibGUgWUFNTCB2ZXJzaW9uIG9mIHRoZSBkb2N1bWVudCcpXG5cbiAgICBzdGF0ZS5kaXJlY3RpdmVzLnB1c2goeyBraW5kOiAneWFtbCcsIHZlcnNpb246IGFyZ3NbMF0gfSlcbiAgfSBlbHNlIGlmIChuYW1lID09PSAnVEFHJykge1xuICAgIGlmIChhcmdzLmxlbmd0aCAhPT0gMikgdGhyb3dFcnJvcihzdGF0ZSwgJ1RBRyBkaXJlY3RpdmUgYWNjZXB0cyBleGFjdGx5IHR3byBhcmd1bWVudHMnKVxuXG4gICAgY29uc3QgW2hhbmRsZSwgcHJlZml4XSA9IGFyZ3NcbiAgICBpZiAoIVBBVFRFUk5fVEFHX0hBTkRMRS50ZXN0KGhhbmRsZSkpIHRocm93RXJyb3Ioc3RhdGUsICdpbGwtZm9ybWVkIHRhZyBoYW5kbGUgKGZpcnN0IGFyZ3VtZW50KSBvZiB0aGUgVEFHIGRpcmVjdGl2ZScpXG4gICAgaWYgKEhBU19PV04uY2FsbChzdGF0ZS50YWdIYW5kbGVycywgaGFuZGxlKSkgdGhyb3dFcnJvcihzdGF0ZSwgYHRoZXJlIGlzIGEgcHJldmlvdXNseSBkZWNsYXJlZCBzdWZmaXggZm9yIFwiJHtoYW5kbGV9XCIgdGFnIGhhbmRsZWApXG4gICAgaWYgKCFQQVRURVJOX1RBR19QUkVGSVgudGVzdChwcmVmaXgpKSB0aHJvd0Vycm9yKHN0YXRlLCAnaWxsLWZvcm1lZCB0YWcgcHJlZml4IChzZWNvbmQgYXJndW1lbnQpIG9mIHRoZSBUQUcgZGlyZWN0aXZlJylcbiAgICB0cnkge1xuICAgICAgZGVjb2RlVVJJQ29tcG9uZW50KHByZWZpeClcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsIGB0YWcgcHJlZml4IGlzIG1hbGZvcm1lZDogJHtwcmVmaXh9YClcbiAgICB9XG5cbiAgICBzdGF0ZS50YWdIYW5kbGVyc1toYW5kbGVdID0gcHJlZml4XG4gICAgc3RhdGUuZGlyZWN0aXZlcy5wdXNoKHsga2luZDogJ3RhZycsIGhhbmRsZSwgcHJlZml4IH0pXG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiByZWFkRG9jdW1lbnQgKHN0YXRlOiBQYXJzZXJTdGF0ZSkge1xuICBzdGF0ZS5kaXJlY3RpdmVzID0gW11cbiAgc3RhdGUudGFnSGFuZGxlcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIGxldCBoYXNEaXJlY3RpdmVzID0gZmFsc2VcblxuICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKVxuXG4gIHdoaWxlIChyZWFkRGlyZWN0aXZlKHN0YXRlKSkge1xuICAgIGhhc0RpcmVjdGl2ZXMgPSB0cnVlXG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSlcbiAgfVxuXG4gIGxldCBleHBsaWNpdFN0YXJ0ID0gZmFsc2VcbiAgbGV0IGV4cGxpY2l0RW5kID0gZmFsc2VcbiAgbGV0IGFsbG93Q29tcGFjdCA9IHRydWVcblxuICBpZiAoc3RhdGUubGluZUluZGVudCA9PT0gMCAmJlxuICAgICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MkQvKiAtICovICYmXG4gICAgICBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSkgPT09IDB4MkQvKiAtICovICYmXG4gICAgICBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMikgPT09IDB4MkQvKiAtICovICYmXG4gICAgICBpc1dzT3JFb2xPckVuZChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMykpKSB7XG4gICAgZXhwbGljaXRTdGFydCA9IHRydWVcbiAgICBjb25zdCBtYXJrZXJMaW5lID0gc3RhdGUubGluZVxuICAgIHN0YXRlLnBvc2l0aW9uICs9IDNcbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKVxuICAgIGFsbG93Q29tcGFjdCA9IHN0YXRlLmxpbmUgPiBtYXJrZXJMaW5lXG4gIH0gZWxzZSBpZiAoaGFzRGlyZWN0aXZlcykge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICdkaXJlY3RpdmVzIGVuZCBtYXJrIGlzIGV4cGVjdGVkJylcbiAgfVxuXG4gIGNvbnN0IGRvY3VtZW50RXZlbnRJbmRleCA9IHN0YXRlLmV2ZW50cy5sZW5ndGhcbiAgaWYgKCFleHBsaWNpdFN0YXJ0ICYmXG4gICAgICBzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmXG4gICAgICBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gMHgyRS8qIC4gKi8gJiZcbiAgICAgIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSkpIHtcbiAgICBzdGF0ZS5wb3NpdGlvbiArPSAzXG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGFkZERvY3VtZW50RXZlbnQoc3RhdGUsIGV4cGxpY2l0U3RhcnQsIGZhbHNlKVxuICBpZiAoIXBhcnNlTm9kZShzdGF0ZSwgc3RhdGUubGluZUluZGVudCAtIDEsIENPTlRFWFRfQkxPQ0tfT1VULCBmYWxzZSwgYWxsb3dDb21wYWN0LCBhbGxvd0NvbXBhY3QpKSB7XG4gICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgfVxuICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKVxuXG4gIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSkpIHtcbiAgICBleHBsaWNpdEVuZCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAweDJFLyogLiAqL1xuICAgIGlmIChleHBsaWNpdEVuZCkge1xuICAgICAgY29uc3QgbWFya2VyTGluZSA9IHN0YXRlLmxpbmVcbiAgICAgIHN0YXRlLnBvc2l0aW9uICs9IDNcbiAgICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUpXG4gICAgICBpZiAoc3RhdGUubGluZSA9PT0gbWFya2VyTGluZSAmJiBzdGF0ZS5wb3NpdGlvbiA8IHN0YXRlLmxlbmd0aCkge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZW5kIG9mIHRoZSBzdHJlYW0gb3IgYSBkb2N1bWVudCBzZXBhcmF0b3IgaXMgZXhwZWN0ZWQnKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGRvY3VtZW50RXZlbnQgPSBzdGF0ZS5ldmVudHNbZG9jdW1lbnRFdmVudEluZGV4XVxuICBpZiAoZG9jdW1lbnRFdmVudD8udHlwZSA9PT0gRVZFTlRfRE9DVU1FTlQpIGRvY3VtZW50RXZlbnQuZXhwbGljaXRFbmQgPSBleHBsaWNpdEVuZFxuXG4gIGFkZFBvcEV2ZW50KHN0YXRlKVxuXG4gIGlmICghZXhwbGljaXRFbmQgJiZcbiAgICAgIHN0YXRlLnBvc2l0aW9uIDwgc3RhdGUubGVuZ3RoICYmXG4gICAgICAhKHN0YXRlLnBvc2l0aW9uID09PSBzdGF0ZS5saW5lU3RhcnQgJiYgdGVzdERvY3VtZW50U2VwYXJhdG9yKHN0YXRlKSkpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZW5kIG9mIHRoZSBzdHJlYW0gb3IgYSBkb2N1bWVudCBzZXBhcmF0b3IgaXMgZXhwZWN0ZWQnKVxuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlRXZlbnRzIChpbnB1dDogc3RyaW5nLCBvcHRpb25zOiBQYXJzZXJPcHRpb25zKTogRXZlbnRbXSB7XG4gIGNvbnN0IGxlbmd0aCA9IGlucHV0Lmxlbmd0aFxuICBjb25zdCBzdGF0ZTogUGFyc2VyU3RhdGUgPSB7XG4gICAgLi4uREVGQVVMVF9QQVJTRVJfT1BUSU9OUyxcbiAgICAuLi5vcHRpb25zLFxuICAgIGlucHV0OiBgJHtpbnB1dH1cXDBgLFxuICAgIGxlbmd0aCxcbiAgICBwb3NpdGlvbjogMCxcbiAgICBsaW5lOiAwLFxuICAgIGxpbmVTdGFydDogMCxcbiAgICBsaW5lSW5kZW50OiAwLFxuICAgIGZpcnN0VGFiSW5MaW5lOiAtMSxcbiAgICBkZXB0aDogMCxcbiAgICBkaXJlY3RpdmVzOiBbXSxcbiAgICB0YWdIYW5kbGVyczogT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICBldmVudHM6IFtdXG4gIH1cblxuICBjb25zdCBudWxscG9zID0gaW5wdXQuaW5kZXhPZignXFwwJylcbiAgaWYgKG51bGxwb3MgIT09IC0xKSB0aHJvd0Vycm9yQXQoaW5wdXQsIG51bGxwb3MsICdudWxsIGJ5dGUgaXMgbm90IGFsbG93ZWQgaW4gaW5wdXQnLCBzdGF0ZS5maWxlbmFtZSlcblxuICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4RkVGRikgc3RhdGUucG9zaXRpb24rK1xuXG4gIHdoaWxlIChzdGF0ZS5wb3NpdGlvbiA8IHN0YXRlLmxlbmd0aCkge1xuICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUpXG4gICAgaWYgKHN0YXRlLnBvc2l0aW9uID49IHN0YXRlLmxlbmd0aCkgYnJlYWtcbiAgICBjb25zdCBkb2N1bWVudFN0YXJ0ID0gc3RhdGUucG9zaXRpb25cbiAgICByZWFkRG9jdW1lbnQoc3RhdGUpXG4gICAgaWYgKHN0YXRlLnBvc2l0aW9uID09PSBkb2N1bWVudFN0YXJ0KSB7XG4gICAgICAvLyBJbnRlcm5hbCBwcm9ncmVzcyBndWFyZDogaWYgcmVhZERvY3VtZW50KCkgZXZlciByZXR1cm5zIHdpdGhvdXRcbiAgICAgIC8vIGNvbnN1bWluZyBpbnB1dCwgc3RvcCBoZXJlIGluc3RlYWQgb2YgbG9vcGluZyBmb3JldmVyLlxuICAgICAgLyogYzggaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdjYW4gbm90IHJlYWQgYSBkb2N1bWVudCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0YXRlLmV2ZW50c1xufVxuXG5leHBvcnQge1xuICBwYXJzZUV2ZW50cyxcbiAgREVGQVVMVF9QQVJTRVJfT1BUSU9OUyxcbiAgdHlwZSBQYXJzZXJPcHRpb25zXG59XG4iLCAiaW1wb3J0IHsgWUFNTEV4Y2VwdGlvbiB9IGZyb20gJy4vY29tbW9uL2V4Y2VwdGlvbi50cydcbmltcG9ydCB7IHBpY2sgfSBmcm9tICcuL2NvbW1vbi9vYmplY3QudHMnXG5pbXBvcnQge1xuICBjb25zdHJ1Y3RGcm9tRXZlbnRzLFxuICBERUZBVUxUX0NPTlNUUlVDVE9SX09QVElPTlMsXG4gIHR5cGUgQ29uc3RydWN0b3JPcHRpb25zXG59IGZyb20gJy4vcGFyc2VyL2NvbnN0cnVjdG9yLnRzJ1xuaW1wb3J0IHtcbiAgcGFyc2VFdmVudHMsXG4gIERFRkFVTFRfUEFSU0VSX09QVElPTlMsXG4gIHR5cGUgUGFyc2VyT3B0aW9uc1xufSBmcm9tICcuL3BhcnNlci9wYXJzZXIudHMnXG5cbi8vIGBzb3VyY2VgIGlzIHN1cHBsaWVkIGJ5IGBsb2FkRG9jdW1lbnRzYCBpdHNlbGYsIG5vdCBieSB0aGUgcHVibGljIGNhbGxlci5cbmludGVyZmFjZSBMb2FkT3B0aW9ucyBleHRlbmRzIFBhcnNlck9wdGlvbnMsIE9taXQ8Q29uc3RydWN0b3JPcHRpb25zLCAnc291cmNlJz4ge31cblxudHlwZSBMb2FkQWxsSXRlcmF0b3IgPSAoZG9jdW1lbnQ6IHVua25vd24pID0+IHZvaWRcblxuY29uc3QgREVGQVVMVF9MT0FEX09QVElPTlM6IFJlcXVpcmVkPExvYWRPcHRpb25zPiA9IHtcbiAgLi4uREVGQVVMVF9QQVJTRVJfT1BUSU9OUyxcbiAgLi4uREVGQVVMVF9DT05TVFJVQ1RPUl9PUFRJT05TXG59XG5cbmZ1bmN0aW9uIGxvYWREb2N1bWVudHMgKGlucHV0OiBzdHJpbmcsIG9wdGlvbnM6IExvYWRPcHRpb25zID0ge30pIHtcbiAgY29uc3Qgb3B0cyA9IHsgLi4uREVGQVVMVF9MT0FEX09QVElPTlMsIC4uLm9wdGlvbnMgfVxuICBjb25zdCBzb3VyY2UgPSBTdHJpbmcoaW5wdXQpXG5cbiAgY29uc3QgUEFSU0VSX09QVF9LRVlTID0gT2JqZWN0LmtleXMoREVGQVVMVF9QQVJTRVJfT1BUSU9OUykgYXNcbiAgICAoa2V5b2YgdHlwZW9mIERFRkFVTFRfUEFSU0VSX09QVElPTlMpW11cbiAgY29uc3QgQ09OU1RSVUNUT1JfT1BUX0tFWVMgPSBPYmplY3Qua2V5cyhERUZBVUxUX0NPTlNUUlVDVE9SX09QVElPTlMpIGFzXG4gICAgKGtleW9mIHR5cGVvZiBERUZBVUxUX0NPTlNUUlVDVE9SX09QVElPTlMpW11cblxuICBjb25zdCBldmVudHMgPSBwYXJzZUV2ZW50cyhzb3VyY2UsIHBpY2sob3B0cywgUEFSU0VSX09QVF9LRVlTKSlcbiAgcmV0dXJuIGNvbnN0cnVjdEZyb21FdmVudHMoZXZlbnRzLCB7IC4uLnBpY2sob3B0cywgQ09OU1RSVUNUT1JfT1BUX0tFWVMpLCBzb3VyY2UgfSlcbn1cblxuLy8gU2lnbmF0dXJlcyB3aXRoIGl0ZXJhdG9yIGFyZSBkZXByZWNhdGVkLiBXaWxsIGJlIHJlbW92ZWQgaW4gdGhlIG5leHQgdmVyc2lvbnMuXG5mdW5jdGlvbiBsb2FkQWxsIChpbnB1dDogc3RyaW5nLCBvcHRpb25zPzogTG9hZE9wdGlvbnMpOiB1bmtub3duW11cbmZ1bmN0aW9uIGxvYWRBbGwgKGlucHV0OiBzdHJpbmcsIGl0ZXJhdG9yOiBudWxsLCBvcHRpb25zPzogTG9hZE9wdGlvbnMpOiB1bmtub3duW11cbmZ1bmN0aW9uIGxvYWRBbGwgKGlucHV0OiBzdHJpbmcsIGl0ZXJhdG9yOiBMb2FkQWxsSXRlcmF0b3IsIG9wdGlvbnM/OiBMb2FkT3B0aW9ucyk6IHZvaWRcbmZ1bmN0aW9uIGxvYWRBbGwgKFxuICBpbnB1dDogc3RyaW5nLFxuICBpdGVyYXRvck9yT3B0aW9ucz86IExvYWRBbGxJdGVyYXRvciB8IExvYWRPcHRpb25zIHwgbnVsbCxcbiAgb3B0aW9ucz86IExvYWRPcHRpb25zXG4pIHtcbiAgbGV0IGl0ZXJhdG9yOiBMb2FkQWxsSXRlcmF0b3IgfCBudWxsID0gbnVsbFxuXG4gIGlmICh0eXBlb2YgaXRlcmF0b3JPck9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBpdGVyYXRvciA9IGl0ZXJhdG9yT3JPcHRpb25zXG4gIH0gZWxzZSBpZiAoaXRlcmF0b3JPck9wdGlvbnMgIT09IG51bGwgJiYgdHlwZW9mIGl0ZXJhdG9yT3JPcHRpb25zID09PSAnb2JqZWN0Jykge1xuICAgIG9wdGlvbnMgPSBpdGVyYXRvck9yT3B0aW9uc1xuICB9XG5cbiAgY29uc3QgZG9jdW1lbnRzID0gbG9hZERvY3VtZW50cyhpbnB1dCwgb3B0aW9ucylcblxuICBpZiAoaXRlcmF0b3IgPT09IG51bGwpIHJldHVybiBkb2N1bWVudHNcbiAgZm9yIChjb25zdCBkb2N1bWVudCBvZiBkb2N1bWVudHMpIGl0ZXJhdG9yKGRvY3VtZW50KVxufVxuXG5mdW5jdGlvbiBsb2FkIChpbnB1dDogc3RyaW5nLCBvcHRpb25zPzogTG9hZE9wdGlvbnMpIHtcbiAgY29uc3QgZG9jdW1lbnRzID0gbG9hZERvY3VtZW50cyhpbnB1dCwgb3B0aW9ucylcblxuICBpZiAoZG9jdW1lbnRzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IFlBTUxFeGNlcHRpb24oJ2V4cGVjdGVkIGEgZG9jdW1lbnQsIGJ1dCB0aGUgaW5wdXQgaXMgZW1wdHknKVxuICBpZiAoZG9jdW1lbnRzLmxlbmd0aCA9PT0gMSkgcmV0dXJuIGRvY3VtZW50c1swXVxuXG4gIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKCdleHBlY3RlZCBhIHNpbmdsZSBkb2N1bWVudCBpbiB0aGUgc3RyZWFtLCBidXQgZm91bmQgbW9yZScpXG59XG5cbmV4cG9ydCB7XG4gIGxvYWQsXG4gIGxvYWRBbGwsXG4gIHR5cGUgTG9hZE9wdGlvbnNcbn1cbiIsICIvLyBQbGFpbi1vYmplY3QgZGlzY3JpbWluYXRlZCB1bmlvbiBzaGFyZWQgYnkgdGhlIGR1bXBlciAoYnVpbHQgYnkgYGpzVG9Bc3RgLFxuLy8gcmVuZGVyZWQgYnkgdGhlIHByZXNlbnRlcikgYW5kLCBsYXRlciwgYnkgbG9hZC4gQmVoYXZpb3VyIGxpdmVzIGluIHRoZSB3YWxrZXJzLFxuLy8gbm90IG9uIHRoZSBub2Rlcy5cblxuaW1wb3J0IHsgdHlwZSBEb2N1bWVudERpcmVjdGl2ZSB9IGZyb20gJy4uL3BhcnNlci9ldmVudHMudHMnXG5cbmNsYXNzIFN0eWxlIHtcbiAgdGFnZ2VkID0gZmFsc2VcbiAgZmxvdyA9IGZhbHNlXG4gIHNpbmdsZVF1b3RlZCA9IGZhbHNlXG4gIGRvdWJsZVF1b3RlZCA9IGZhbHNlXG4gIGxpdGVyYWwgPSBmYWxzZVxuICBmb2xkZWQgPSBmYWxzZVxufVxuXG5pbnRlcmZhY2UgTm9kZUJhc2Uge1xuICAvLyBZQU1MIHRhZy4gVW50YWdnZWQgbm9kZXMgY2FycnkgdGhlIHNlbWFudGljIHJlc29sdmVkIHRhZzsgdGFnZ2VkIG5vZGVzIGNhcnJ5XG4gIC8vIHRoZSBwcmludGFibGUvdmVyYmF0aW0gdGFnIHNwZWxsaW5nLlxuICB0YWc6IHN0cmluZ1xuICBzdHlsZTogU3R5bGVcbiAgYW5jaG9yPzogc3RyaW5nXG5cbiAgLy8gUmVzZXJ2ZWQgZm9yIHRoZSBmb3JtYXR0aW5nIGxheWVyOyBub3QgcG9wdWxhdGVkIGJ5IHRoZSBkdW1wZXIgeWV0LlxuICBjb21tZW50QmVmb3JlPzogc3RyaW5nXG4gIGNvbW1lbnQ/OiBzdHJpbmdcbiAgY29tbWVudEFmdGVyPzogc3RyaW5nXG4gIGJsYW5rQmVmb3JlPzogbnVtYmVyXG59XG5cbmludGVyZmFjZSBTY2FsYXJOb2RlIGV4dGVuZHMgTm9kZUJhc2Uge1xuICBraW5kOiAnc2NhbGFyJ1xuICB2YWx1ZTogc3RyaW5nXG59XG5cbmludGVyZmFjZSBTZXF1ZW5jZU5vZGUgZXh0ZW5kcyBOb2RlQmFzZSB7XG4gIGtpbmQ6ICdzZXF1ZW5jZSdcbiAgaXRlbXM6IE5vZGVbXVxufVxuXG5pbnRlcmZhY2UgTWFwcGluZ05vZGUgZXh0ZW5kcyBOb2RlQmFzZSB7XG4gIGtpbmQ6ICdtYXBwaW5nJ1xuICBpdGVtczogQXJyYXk8eyBrZXk6IE5vZGUsIHZhbHVlOiBOb2RlIH0+XG59XG5cbmludGVyZmFjZSBBbGlhc05vZGUgZXh0ZW5kcyBOb2RlQmFzZSB7XG4gIGtpbmQ6ICdhbGlhcydcbiAgLy8gVGhlIGFuY2hvciBuYW1lIHRoaXMgYWxpYXMgcG9pbnRzIGF0IChgKm5hbWVgKS5cbiAgYW5jaG9yOiBzdHJpbmdcbn1cblxudHlwZSBOb2RlID0gU2NhbGFyTm9kZSB8IFNlcXVlbmNlTm9kZSB8IE1hcHBpbmdOb2RlIHwgQWxpYXNOb2RlXG5cbi8vIFRoZSBsYXllciBhYm92ZSBgTm9kZWA6IGVhY2ggZG9jdW1lbnQgd3JhcHMgb25lIGNvbnRlbnQgbm9kZSBwbHVzIGl0cyBvd25cbi8vIG1hcmtlcnMvZGlyZWN0aXZlcy4gTm90IGEgbWVtYmVyIG9mIGBOb2RlYCDigJQgdGhlIGZpZWxkcyBkaWZmZXIuIERvY3VtZW50XG4vLyBkaXJlY3RpdmVzIGFyZSBvcmRlcmVkIHByZXNlbnRhdGlvbiBkYXRhLlxuaW50ZXJmYWNlIERvY3VtZW50IHtcbiAgY29udGVudHM6IE5vZGUgfCBudWxsICAgICAgICAgICAgLy8gbnVsbCA9IGVtcHR5IGRvY3VtZW50XG4gIGV4cGxpY2l0U3RhcnQ/OiBib29sZWFuICAgICAgICAgIC8vIHByaW50ICctLS0nXG4gIGV4cGxpY2l0RW5kPzogYm9vbGVhbiAgICAgICAgICAgIC8vIHByaW50ICcuLi4nXG4gIGRpcmVjdGl2ZXM6IERvY3VtZW50RGlyZWN0aXZlW11cbn1cblxuZXhwb3J0IHtcbiAgU3R5bGUsXG5cbiAgdHlwZSBOb2RlLFxuICB0eXBlIERvY3VtZW50LFxuICB0eXBlIE5vZGVCYXNlLFxuICB0eXBlIFNjYWxhck5vZGUsXG4gIHR5cGUgU2VxdWVuY2VOb2RlLFxuICB0eXBlIE1hcHBpbmdOb2RlLFxuICB0eXBlIEFsaWFzTm9kZVxufVxuIiwgIi8vIEpTIHZhbHVlIGdyYXBoIOKGkiBBU1QuIEtub3dzIHRhZ3MgKGBpZGVudGlmeWAgLyBgcmVwcmVzZW50YCkuIEEgc2luZ2xlXG4vLyBpZGVudGl0eS1gTWFwYCB3YWxrIGhhbmRsZXMgZGVkdXA6IGEgcmVwZWF0IG9jY3VycmVuY2Ugb2YgYW4gb2JqZWN0IChpbmNsdWRpbmdcbi8vIGEgY3ljbGUpIGJlY29tZXMgYW4gYGFsaWFzYCwgYW5kIHRoZSBmaXJzdCBvY2N1cnJlbmNlIGdldHMgYW4gYGFuY2hvcmAuXG5cbmltcG9ydCB7IFlBTUxFeGNlcHRpb24gfSBmcm9tICcuLi9jb21tb24vZXhjZXB0aW9uLnRzJ1xuaW1wb3J0IHsgdHlwZSBTY2hlbWEgfSBmcm9tICcuLi9zY2hlbWEudHMnXG5pbXBvcnQgeyB0eXBlIFRhZ0RlZmluaXRpb24gfSBmcm9tICcuLi90YWcudHMnXG5pbXBvcnQgeyB0YWdOYW1lU2hvcnQgfSBmcm9tICcuLi9jb21tb24vdGFnbmFtZS50cydcbmltcG9ydCB7XG4gIFN0eWxlLFxuICB0eXBlIERvY3VtZW50LFxuICB0eXBlIE5vZGUsXG4gIHR5cGUgU2NhbGFyTm9kZSxcbiAgdHlwZSBTZXF1ZW5jZU5vZGUsXG4gIHR5cGUgTWFwcGluZ05vZGVcbn0gZnJvbSAnLi9ub2Rlcy50cydcblxuaW50ZXJmYWNlIEZyb21Kc09wdGlvbnMge1xuICBub1JlZnM/OiBib29sZWFuXG4gIHNraXBJbnZhbGlkPzogYm9vbGVhblxufVxuXG4vLyBBIG1hdGNoIGNhbmRpZGF0ZS4gYGltcGxpY2l0VGFnYCBtZWFucyB0aGUgdGFnIGlzIG5vdCBwcmludGVkIChpbXBsaWNpdFxuLy8gc2NhbGFycyBhbmQgdGhlIGRlZmF1bHQgc3RyL3NlcS9tYXAgdGFncykuXG5pbnRlcmZhY2UgUmVwcmVzZW50VHlwZSB7XG4gIHRhZzogVGFnRGVmaW5pdGlvblxuICBpbXBsaWNpdFRhZzogYm9vbGVhblxufVxuXG4vLyBSZXR1cm5lZCBieSBgYnVpbGRgIHdoZW4gbm8gdGFnIG1hdGNoZWQuXG5jb25zdCBJTlZBTElEID0gU3ltYm9sKCdJTlZBTElEJylcblxuaW50ZXJmYWNlIEZyb21Kc1N0YXRlIHtcbiAgcmVwcmVzZW50VHlwZXM6IFJlcHJlc2VudFR5cGVbXVxuICBub1JlZnM6IGJvb2xlYW5cbiAgc2tpcEludmFsaWQ6IGJvb2xlYW5cblxuICAvLyBBbHJlYWR5LWJ1aWx0IGNvbGxlY3Rpb24gdmFsdWVzIOKGkiB0aGVpciBub2RlLCBmb3IgYW5jaG9yL2FsaWFzIGRlZHVwLlxuICByZWZzOiBNYXA8dW5rbm93biwgTm9kZT5cbiAgcmVmQ291bnRlcjogbnVtYmVyXG59XG5cbmZ1bmN0aW9uIGJ1aWxkUmVwcmVzZW50VHlwZXMgKHNjaGVtYTogU2NoZW1hKTogUmVwcmVzZW50VHlwZVtdIHtcbiAgY29uc3QgZGVmYXVsdFRhZ3MgPSBuZXcgU2V0PFRhZ0RlZmluaXRpb24+KFtcbiAgICBzY2hlbWEuZGVmYXVsdFNjYWxhclRhZyxcbiAgICBzY2hlbWEuZGVmYXVsdFNlcXVlbmNlVGFnLFxuICAgIHNjaGVtYS5kZWZhdWx0TWFwcGluZ1RhZ1xuICBdLmZpbHRlcigodCk6IHQgaXMgVGFnRGVmaW5pdGlvbiA9PiB0ICE9PSB1bmRlZmluZWQpKVxuXG4gIC8vIERlZmF1bHQgY29udGFpbmVyL3N0ciB0YWdzIGdvIGxhc3Qgc28gYSBtb3JlIHNwZWNpZmljIHRhZyBpZGVudGlmeWluZyB0aGVcbiAgLy8gc2FtZSBKUyB2YWx1ZSAoZS5nLiBhIGN1c3RvbSB0YWcgb24gYSBwbGFpbiBvYmplY3QpIHdpbnMuXG4gIGNvbnN0IGltcGxpY2l0U2NhbGFycyA9IHNjaGVtYS5pbXBsaWNpdFNjYWxhclRhZ3NcbiAgY29uc3QgZXhwbGljaXRUYWdzID0gc2NoZW1hLnRhZ3MuZmlsdGVyKHQgPT5cbiAgICAhKHQubm9kZUtpbmQgPT09ICdzY2FsYXInICYmIHQuaW1wbGljaXQpICYmICFkZWZhdWx0VGFncy5oYXModCkpXG4gIGNvbnN0IGRlZmF1bHRUYWdzTGFzdCA9IHNjaGVtYS50YWdzLmZpbHRlcih0ID0+IGRlZmF1bHRUYWdzLmhhcyh0KSlcblxuICByZXR1cm4gW1xuICAgIC4uLmltcGxpY2l0U2NhbGFycy5tYXAodGFnID0+ICh7IHRhZywgaW1wbGljaXRUYWc6IHRydWUgfSkpLFxuICAgIC4uLmV4cGxpY2l0VGFncy5tYXAodGFnID0+ICh7IHRhZywgaW1wbGljaXRUYWc6IGZhbHNlIH0pKSxcbiAgICAuLi5kZWZhdWx0VGFnc0xhc3QubWFwKHRhZyA9PiAoeyB0YWcsIGltcGxpY2l0VGFnOiB0cnVlIH0pKVxuICBdXG59XG5cbi8vIEZpcnN0IHRhZyB3aG9zZSBgaWRlbnRpZnlgIGFjY2VwdHMgYG9iamVjdGAuXG5mdW5jdGlvbiBtYXRjaFRhZyAoc3RhdGU6IEZyb21Kc1N0YXRlLCBvYmplY3Q6IHVua25vd24pOiB7IHRhZzogVGFnRGVmaW5pdGlvbiwgdGFnTmFtZTogc3RyaW5nLCBpbXBsaWNpdFRhZzogYm9vbGVhbiB9IHwgbnVsbCB7XG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gc3RhdGUucmVwcmVzZW50VHlwZXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGNvbnN0IHsgdGFnLCBpbXBsaWNpdFRhZyB9ID0gc3RhdGUucmVwcmVzZW50VHlwZXNbaW5kZXhdXG5cbiAgICBpZiAodGFnLmlkZW50aWZ5ICYmIHRhZy5pZGVudGlmeShvYmplY3QpKSB7XG4gICAgICBsZXQgdGFnTmFtZTogc3RyaW5nXG4gICAgICBpZiAodGFnLm1hdGNoQnlUYWdQcmVmaXggJiYgdGFnLnJlcHJlc2VudFRhZ05hbWUpIHtcbiAgICAgICAgdGFnTmFtZSA9IHRhZy5yZXByZXNlbnRUYWdOYW1lKG9iamVjdClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRhZ05hbWUgPSB0YWcudGFnTmFtZVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgdGFnLCB0YWdOYW1lLCBpbXBsaWNpdFRhZyB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGxcbn1cblxuLy8gQnVpbGQgYSBub2RlIGZvciBgb2JqZWN0YCwgb3IgSU5WQUxJRCB3aGVuIG5vIHRhZyBtYXRjaGVzLiBgdW5kZWZpbmVkYCBuZXZlclxuLy8gdGhyb3dzIChjYWxsZXIgZGVjaWRlczogbnVsbCBpbiBhIHNlcXVlbmNlLCBza2lwIGluIGEgbWFwcGluZywgJycgYXQgcm9vdCk7XG4vLyBhbnkgb3RoZXIgdW5yZXByZXNlbnRhYmxlIHZhbHVlIHRocm93cyB1bmxlc3MgYHNraXBJbnZhbGlkYC5cbmZ1bmN0aW9uIGJ1aWxkIChzdGF0ZTogRnJvbUpzU3RhdGUsIG9iamVjdDogdW5rbm93bik6IE5vZGUgfCB0eXBlb2YgSU5WQUxJRCB7XG4gIGlmICghc3RhdGUubm9SZWZzICYmIG9iamVjdCAhPT0gbnVsbCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0Jykge1xuICAgIGNvbnN0IGV4aXN0aW5nID0gc3RhdGUucmVmcy5nZXQob2JqZWN0KVxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgaWYgKGV4aXN0aW5nLmFuY2hvciA9PT0gdW5kZWZpbmVkKSBleGlzdGluZy5hbmNob3IgPSBgcmVmXyR7c3RhdGUucmVmQ291bnRlcisrfWBcbiAgICAgIHJldHVybiB7IGtpbmQ6ICdhbGlhcycsIHRhZzogJycsIHN0eWxlOiBuZXcgU3R5bGUoKSwgYW5jaG9yOiBleGlzdGluZy5hbmNob3IgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG1hdGNoZWQgPSBtYXRjaFRhZyhzdGF0ZSwgb2JqZWN0KVxuXG4gIGlmICghbWF0Y2hlZCkge1xuICAgIGlmIChvYmplY3QgPT09IHVuZGVmaW5lZCkgcmV0dXJuIElOVkFMSURcbiAgICBpZiAoc3RhdGUuc2tpcEludmFsaWQpIHJldHVybiBJTlZBTElEXG4gICAgdGhyb3cgbmV3IFlBTUxFeGNlcHRpb24oYHVuYWNjZXB0YWJsZSBraW5kIG9mIGFuIG9iamVjdCB0byBkdW1wICR7T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCl9YClcbiAgfVxuXG4gIGNvbnN0IHsgdGFnLCB0YWdOYW1lLCBpbXBsaWNpdFRhZyB9ID0gbWF0Y2hlZFxuICBjb25zdCBub2RlVGFnTmFtZSA9IGltcGxpY2l0VGFnID8gdGFnTmFtZSA6IHRhZ05hbWVTaG9ydCh0YWdOYW1lKVxuXG4gIGlmICh0YWcubm9kZUtpbmQgPT09ICdzY2FsYXInKSB7XG4gICAgY29uc3Qgc3R5bGUgPSBuZXcgU3R5bGUoKVxuICAgIHN0eWxlLnRhZ2dlZCA9ICFpbXBsaWNpdFRhZ1xuICAgIGNvbnN0IG5vZGU6IFNjYWxhck5vZGUgPSB7XG4gICAgICBraW5kOiAnc2NhbGFyJyxcbiAgICAgIHRhZzogbm9kZVRhZ05hbWUsXG4gICAgICBzdHlsZSxcbiAgICAgIHZhbHVlOiB0YWcucmVwcmVzZW50KG9iamVjdClcbiAgICB9XG4gICAgcmV0dXJuIG5vZGVcbiAgfVxuXG4gIGlmICh0YWcubm9kZUtpbmQgPT09ICdzZXF1ZW5jZScpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSB0YWcucmVwcmVzZW50KG9iamVjdClcbiAgICBjb25zdCBzdHlsZSA9IG5ldyBTdHlsZSgpXG4gICAgc3R5bGUudGFnZ2VkID0gIWltcGxpY2l0VGFnXG4gICAgY29uc3Qgbm9kZTogU2VxdWVuY2VOb2RlID0geyBraW5kOiAnc2VxdWVuY2UnLCB0YWc6IG5vZGVUYWdOYW1lLCBzdHlsZSwgaXRlbXM6IFtdIH1cbiAgICBpZiAoIXN0YXRlLm5vUmVmcykgc3RhdGUucmVmcy5zZXQob2JqZWN0LCBub2RlKVxuXG4gICAgZm9yIChsZXQgaW5kZXggPSAwLCBsZW5ndGggPSBjb250YWluZXIubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgICAgbGV0IGl0ZW0gPSBidWlsZChzdGF0ZSwgY29udGFpbmVyW2luZGV4XSlcbiAgICAgIC8vIEFuIGludmFsaWQgZWxlbWVudCBiZWNvbWVzIG51bGw7IGEgc3RpbGwtaW52YWxpZCBudWxsIHRoZW4gc2tpcHMvdGhyb3dzLlxuICAgICAgaWYgKGl0ZW0gPT09IElOVkFMSUQgJiYgY29udGFpbmVyW2luZGV4XSA9PT0gdW5kZWZpbmVkKSBpdGVtID0gYnVpbGQoc3RhdGUsIG51bGwpXG4gICAgICBpZiAoaXRlbSA9PT0gSU5WQUxJRCkgY29udGludWVcbiAgICAgIG5vZGUuaXRlbXMucHVzaChpdGVtKVxuICAgIH1cbiAgICByZXR1cm4gbm9kZVxuICB9XG5cbiAgLy8gbWFwcGluZyDigJQgdGhlIGNhbm9uaWNhbCBmb3JtIGlzIGFsd2F5cyBhIGBNYXBgLlxuICBjb25zdCBtYXAgPSB0YWcucmVwcmVzZW50KG9iamVjdClcbiAgY29uc3Qgc3R5bGUgPSBuZXcgU3R5bGUoKVxuICBzdHlsZS50YWdnZWQgPSAhaW1wbGljaXRUYWdcbiAgY29uc3Qgbm9kZTogTWFwcGluZ05vZGUgPSB7IGtpbmQ6ICdtYXBwaW5nJywgdGFnOiBub2RlVGFnTmFtZSwgc3R5bGUsIGl0ZW1zOiBbXSB9XG4gIGlmICghc3RhdGUubm9SZWZzKSBzdGF0ZS5yZWZzLnNldChvYmplY3QsIG5vZGUpXG5cbiAgZm9yIChjb25zdCBbb2JqZWN0S2V5LCBvYmplY3RWYWx1ZV0gb2YgbWFwKSB7XG4gICAgY29uc3Qga2V5ID0gYnVpbGQoc3RhdGUsIG9iamVjdEtleSlcbiAgICBpZiAoa2V5ID09PSBJTlZBTElEKSBjb250aW51ZSAvLyBpbnZhbGlkIGtleSBza2lwcyB0aGUgcGFpclxuICAgIGNvbnN0IHZhbHVlID0gYnVpbGQoc3RhdGUsIG9iamVjdFZhbHVlKVxuICAgIGlmICh2YWx1ZSA9PT0gSU5WQUxJRCkgY29udGludWUgLy8gaW52YWxpZCB2YWx1ZSBza2lwcyB0aGUgcGFpclxuICAgIG5vZGUuaXRlbXMucHVzaCh7IGtleSwgdmFsdWUgfSlcbiAgfVxuICByZXR1cm4gbm9kZVxufVxuXG4vLyBBIEpTIHZhbHVlIGlzIG9uZSBZQU1MIGRvY3VtZW50LiBBbiB1bnJlcHJlc2VudGFibGUgcm9vdCBiZWNvbWVzIGFuIGVtcHR5XG4vLyBkb2N1bWVudCwgd2hpY2ggdGhlIHByZXNlbnRlciByZW5kZXJzIGFzIGFuIGVtcHR5IHN0cmluZy5cbmZ1bmN0aW9uIGpzVG9Bc3QgKGlucHV0OiB1bmtub3duLCBzY2hlbWE6IFNjaGVtYSwgb3B0aW9uczogRnJvbUpzT3B0aW9ucyA9IHt9KTogRG9jdW1lbnRbXSB7XG4gIGNvbnN0IHN0YXRlOiBGcm9tSnNTdGF0ZSA9IHtcbiAgICByZXByZXNlbnRUeXBlczogYnVpbGRSZXByZXNlbnRUeXBlcyhzY2hlbWEpLFxuICAgIG5vUmVmczogb3B0aW9ucy5ub1JlZnMgPz8gZmFsc2UsXG4gICAgc2tpcEludmFsaWQ6IG9wdGlvbnMuc2tpcEludmFsaWQgPz8gZmFsc2UsXG4gICAgcmVmczogbmV3IE1hcCgpLFxuICAgIHJlZkNvdW50ZXI6IDBcbiAgfVxuXG4gIGNvbnN0IHJvb3QgPSBidWlsZChzdGF0ZSwgaW5wdXQpXG4gIHJldHVybiBbeyBjb250ZW50czogcm9vdCA9PT0gSU5WQUxJRCA/IG51bGwgOiByb290LCBkaXJlY3RpdmVzOiBbXSB9XVxufVxuXG5leHBvcnQge1xuICBqc1RvQXN0LFxuICB0eXBlIEZyb21Kc09wdGlvbnNcbn1cbiIsICIvLyBEZXB0aC1maXJzdCBBU1QgdHJhdmVyc2FsLiBNaXJyb3JzIHRoZSBga2luZGAgd2FsayBvZiB0aGUgcHJlc2VudGVyIGFuZCB0aGVcbi8vIGBmcm9tXypgIGJ1aWxkZXJzLCBidXQgc3RheXMgcmVhZC1vcmllbnRlZDogbm9kZXMgYXJlIHBsYWluIG9iamVjdHMsIHNvIGFcbi8vIHZpc2l0b3IgbXV0YXRlcyB0aGVtIGluIHBsYWNlLiBDb250cm9sIHNpZ25hbHMgbGV0IGl0IHBydW5lIG9yIHN0b3AgdGhlIHdhbGsuXG5cbmltcG9ydCB7XG4gIHR5cGUgTm9kZSxcbiAgdHlwZSBEb2N1bWVudFxufSBmcm9tICcuL25vZGVzLnRzJ1xuXG4vLyBSZXR1cm5lZCBieSBhIHZpc2l0b3IgdG8gY29udHJvbCB0aGUgd2FsazsgYW55dGhpbmcgZWxzZSAoaW5jbC4gYHVuZGVmaW5lZGApXG4vLyBkZXNjZW5kcyBhcyB1c3VhbC5cbmNvbnN0IFZJU0lUX0JSRUFLID0gU3ltYm9sKCd2aXNpdDpicmVhaycpIC8vIHN0b3AgdGhlIHdob2xlIHRyYXZlcnNhbFxuY29uc3QgVklTSVRfU0tJUCA9IFN5bWJvbCgndmlzaXQ6c2tpcCcpICAgLy8gZG9uJ3QgZGVzY2VuZCBpbnRvIHRoaXMgbm9kZSdzIGNoaWxkcmVuXG5cbnR5cGUgVmlzaXRDb250cm9sID0gdHlwZW9mIFZJU0lUX0JSRUFLIHwgdHlwZW9mIFZJU0lUX1NLSVAgfCB1bmRlZmluZWQgfCB2b2lkXG5cbi8vIFRyYXZlcnNhbC1kZXJpdmVkIHBvc2l0aW9uIG9mIHRoZSBjdXJyZW50IG5vZGUuIEtlcHQgb2ZmIHRoZSBub2RlIGl0c2VsZjogYVxuLy8gbm9kZSBtYXkgc2l0IGluIHNldmVyYWwgcGxhY2VzIChhbGlhcy9kZWR1cCByZXVzZSksIHNvIGRlcHRoL3JvbGUgYmVsb25nIHRvXG4vLyB0aGUgd2Fsaywgbm90IHRoZSBub2RlLiBgcGFyZW50LmtpbmRgICsgYGlzS2V5YCBwaW4gdGhlIGV4YWN0IHNsb3QuXG5pbnRlcmZhY2UgVmlzaXRDb250ZXh0IHtcbiAgZGVwdGg6IG51bWJlciAgICAgICAgLy8gMCA9IGRvY3VtZW50IGNvbnRlbnQgcm9vdFxuICBwYXJlbnQ6IE5vZGUgfCBudWxsICAvLyBlbmNsb3Npbmcgc2VxdWVuY2UvbWFwcGluZywgbnVsbCBhdCB0aGUgcm9vdFxuICBpc0tleTogYm9vbGVhbiAgICAgICAvLyBub2RlIHNpdHMgaW4gYSBtYXBwaW5nIGtleSBwb3NpdGlvblxufVxuXG50eXBlIFZpc2l0b3IgPSAobm9kZTogTm9kZSwgY3R4OiBWaXNpdENvbnRleHQpID0+IFZpc2l0Q29udHJvbFxuXG4vLyBSZXR1cm5zIGB0cnVlYCBvbmNlIGBWSVNJVF9CUkVBS2Agd2FzIHNlZW4sIHNvIGNhbGxlcnMgY2FuIHVud2luZCB0aGUgd2Fsay5cbmZ1bmN0aW9uIHZpc2l0Tm9kZSAobm9kZTogTm9kZSwgdmlzaXRvcjogVmlzaXRvciwgY3R4OiBWaXNpdENvbnRleHQpOiBib29sZWFuIHtcbiAgY29uc3QgY29udHJvbCA9IHZpc2l0b3Iobm9kZSwgY3R4KVxuICBpZiAoY29udHJvbCA9PT0gVklTSVRfQlJFQUspIHJldHVybiB0cnVlXG4gIGlmIChjb250cm9sID09PSBWSVNJVF9TS0lQKSByZXR1cm4gZmFsc2VcblxuICBjb25zdCBkZXB0aCA9IGN0eC5kZXB0aCArIDFcblxuICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgIGNhc2UgJ3NlcXVlbmNlJzpcbiAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBub2RlLml0ZW1zKSB7XG4gICAgICAgIGlmICh2aXNpdE5vZGUoaXRlbSwgdmlzaXRvciwgeyBkZXB0aCwgcGFyZW50OiBub2RlLCBpc0tleTogZmFsc2UgfSkpIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgJ21hcHBpbmcnOlxuICAgICAgZm9yIChjb25zdCB7IGtleSwgdmFsdWUgfSBvZiBub2RlLml0ZW1zKSB7XG4gICAgICAgIGlmICh2aXNpdE5vZGUoa2V5LCB2aXNpdG9yLCB7IGRlcHRoLCBwYXJlbnQ6IG5vZGUsIGlzS2V5OiB0cnVlIH0pKSByZXR1cm4gdHJ1ZVxuICAgICAgICBpZiAodmlzaXROb2RlKHZhbHVlLCB2aXNpdG9yLCB7IGRlcHRoLCBwYXJlbnQ6IG5vZGUsIGlzS2V5OiBmYWxzZSB9KSkgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuLy8gV2FsayBldmVyeSBub2RlIGluIHRoZSBkb2N1bWVudHMsIGNhbGxpbmcgYHZpc2l0b3JgIG9uY2UgcGVyIG5vZGUgKHByZS1vcmRlcikuXG5mdW5jdGlvbiB2aXNpdCAoZG9jdW1lbnRzOiBEb2N1bWVudFtdLCB2aXNpdG9yOiBWaXNpdG9yKTogdm9pZCB7XG4gIGZvciAoY29uc3QgZG9jIG9mIGRvY3VtZW50cykge1xuICAgIGlmIChkb2MuY29udGVudHMgJiYgdmlzaXROb2RlKGRvYy5jb250ZW50cywgdmlzaXRvciwgeyBkZXB0aDogMCwgcGFyZW50OiBudWxsLCBpc0tleTogZmFsc2UgfSkpIHJldHVyblxuICB9XG59XG5cbmV4cG9ydCB7XG4gIHZpc2l0LFxuICBWSVNJVF9CUkVBSyxcbiAgVklTSVRfU0tJUCxcbiAgdHlwZSBWaXNpdG9yLFxuICB0eXBlIFZpc2l0Q29udGV4dFxufVxuIiwgIi8vIEFTVCDihpIgdGV4dC4gV2Fsa3MgdGhlIG5vZGUgYGtpbmRgOyB0aGUgc2NhbGFyIG1hY2hpbmVyeSAoc3R5bGUgc2VsZWN0aW9uLFxuLy8gcXVvdGluZywgZm9sZGluZykgaXMgZHJpdmVuIGJ5IG5vZGUgdGV4dCwgbm90IGJ5IHNuaWZmaW5nIGEgSlMgdmFsdWUuXG5cbmltcG9ydCB7IFlBTUxFeGNlcHRpb24gfSBmcm9tICcuLi9jb21tb24vZXhjZXB0aW9uLnRzJ1xuaW1wb3J0IHsgdGFnTmFtZVNob3J0IH0gZnJvbSAnLi4vY29tbW9uL3RhZ25hbWUudHMnXG5pbXBvcnQgeyB0eXBlIFNjaGVtYSB9IGZyb20gJy4uL3NjaGVtYS50cydcbmltcG9ydCB7IE5PVF9SRVNPTFZFRCwgdHlwZSBTY2FsYXJUYWdEZWZpbml0aW9uIH0gZnJvbSAnLi4vdGFnLnRzJ1xuaW1wb3J0IHtcbiAgdHlwZSBOb2RlLFxuICB0eXBlIERvY3VtZW50LFxuICB0eXBlIFNjYWxhck5vZGUsXG4gIHR5cGUgU2VxdWVuY2VOb2RlLFxuICB0eXBlIE1hcHBpbmdOb2RlXG59IGZyb20gJy4vbm9kZXMudHMnXG5cbmNvbnN0IENIQVJfQk9NID0gMHhGRUZGXG5jb25zdCBDSEFSX1RBQiA9IDB4MDkgLyogVGFiICovXG5jb25zdCBDSEFSX0xJTkVfRkVFRCA9IDB4MEEgLyogTEYgKi9cbmNvbnN0IENIQVJfQ0FSUklBR0VfUkVUVVJOID0gMHgwRCAvKiBDUiAqL1xuY29uc3QgQ0hBUl9TUEFDRSA9IDB4MjAgLyogU3BhY2UgKi9cbmNvbnN0IENIQVJfRVhDTEFNQVRJT04gPSAweDIxIC8qICEgKi9cbmNvbnN0IENIQVJfRE9VQkxFX1FVT1RFID0gMHgyMiAvKiBcIiAqL1xuY29uc3QgQ0hBUl9TSEFSUCA9IDB4MjMgLyogIyAqL1xuY29uc3QgQ0hBUl9QRVJDRU5UID0gMHgyNSAvKiAlICovXG5jb25zdCBDSEFSX0FNUEVSU0FORCA9IDB4MjYgLyogJiAqL1xuY29uc3QgQ0hBUl9TSU5HTEVfUVVPVEUgPSAweDI3IC8qICcgKi9cbmNvbnN0IENIQVJfQVNURVJJU0sgPSAweDJBIC8qICogKi9cbmNvbnN0IENIQVJfQ09NTUEgPSAweDJDIC8qICwgKi9cbmNvbnN0IENIQVJfTUlOVVMgPSAweDJEIC8qIC0gKi9cbmNvbnN0IENIQVJfQ09MT04gPSAweDNBIC8qIDogKi9cbmNvbnN0IENIQVJfRVFVQUxTID0gMHgzRCAvKiA9ICovXG5jb25zdCBDSEFSX0dSRUFURVJfVEhBTiA9IDB4M0UgLyogPiAqL1xuY29uc3QgQ0hBUl9RVUVTVElPTiA9IDB4M0YgLyogPyAqL1xuY29uc3QgQ0hBUl9DT01NRVJDSUFMX0FUID0gMHg0MCAvKiBAICovXG5jb25zdCBDSEFSX0xFRlRfU1FVQVJFX0JSQUNLRVQgPSAweDVCIC8qIFsgKi9cbmNvbnN0IENIQVJfUklHSFRfU1FVQVJFX0JSQUNLRVQgPSAweDVEIC8qIF0gKi9cbmNvbnN0IENIQVJfR1JBVkVfQUNDRU5UID0gMHg2MCAvKiBgICovXG5jb25zdCBDSEFSX0xFRlRfQ1VSTFlfQlJBQ0tFVCA9IDB4N0IgLyogeyAqL1xuY29uc3QgQ0hBUl9WRVJUSUNBTF9MSU5FID0gMHg3QyAvKiB8ICovXG5jb25zdCBDSEFSX1JJR0hUX0NVUkxZX0JSQUNLRVQgPSAweDdEIC8qIH0gKi9cblxuY29uc3QgRVNDQVBFX1NFUVVFTkNFUzogUmVjb3JkPG51bWJlciwgc3RyaW5nPiA9IHt9XG5cbkVTQ0FQRV9TRVFVRU5DRVNbMHgwMF0gPSAnXFxcXDAnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MDddID0gJ1xcXFxhJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDA4XSA9ICdcXFxcYidcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwOV0gPSAnXFxcXHQnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MEFdID0gJ1xcXFxuJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDBCXSA9ICdcXFxcdidcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwQ10gPSAnXFxcXGYnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MERdID0gJ1xcXFxyJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDFCXSA9ICdcXFxcZSdcbkVTQ0FQRV9TRVFVRU5DRVNbMHgyMl0gPSAnXFxcXFwiJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDVDXSA9ICdcXFxcXFxcXCdcbkVTQ0FQRV9TRVFVRU5DRVNbMHg4NV0gPSAnXFxcXE4nXG5FU0NBUEVfU0VRVUVOQ0VTWzB4QTBdID0gJ1xcXFxfJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDIwMjhdID0gJ1xcXFxMJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDIwMjldID0gJ1xcXFxQJ1xuXG5pbnRlcmZhY2UgUHJlc2VudGVyT3B0aW9ucyB7XG4gIHNjaGVtYTogU2NoZW1hXG4gIGluZGVudD86IG51bWJlclxuICBzZXFOb0luZGVudD86IGJvb2xlYW5cbiAgc2VxSW5saW5lRmlyc3Q/OiBib29sZWFuXG4gIHNvcnRLZXlzPzogYm9vbGVhbiB8ICgoYTogYW55LCBiOiBhbnkpID0+IG51bWJlcilcbiAgbGluZVdpZHRoPzogbnVtYmVyXG4gIGZsb3dCcmFja2V0UGFkZGluZz86IGJvb2xlYW5cbiAgZmxvd1NraXBDb21tYVNwYWNlPzogYm9vbGVhblxuICBmbG93U2tpcENvbG9uU3BhY2U/OiBib29sZWFuXG4gIHF1b3RlRmxvd0tleXM/OiBib29sZWFuXG4gIHF1b3RlU3R5bGU/OiAnc2luZ2xlJyB8ICdkb3VibGUnXG4gIGZvcmNlUXVvdGVzPzogYm9vbGVhblxuICB0YWdCZWZvcmVBbmNob3I/OiBib29sZWFuXG59XG5cbmNvbnN0IERFRkFVTFRfUFJFU0VOVEVSX09QVElPTlM6IFJlcXVpcmVkPE9taXQ8UHJlc2VudGVyT3B0aW9ucywgJ3NjaGVtYSc+PiA9IHtcbiAgaW5kZW50OiAyLFxuICBzZXFOb0luZGVudDogZmFsc2UsXG4gIHNlcUlubGluZUZpcnN0OiB0cnVlLFxuICBzb3J0S2V5czogZmFsc2UsXG4gIGxpbmVXaWR0aDogODAsXG4gIGZsb3dCcmFja2V0UGFkZGluZzogZmFsc2UsXG4gIGZsb3dTa2lwQ29tbWFTcGFjZTogZmFsc2UsXG4gIGZsb3dTa2lwQ29sb25TcGFjZTogZmFsc2UsXG4gIHF1b3RlRmxvd0tleXM6IGZhbHNlLFxuICBxdW90ZVN0eWxlOiAnc2luZ2xlJyxcbiAgZm9yY2VRdW90ZXM6IGZhbHNlLFxuICB0YWdCZWZvcmVBbmNob3I6IGZhbHNlXG59XG5cbmludGVyZmFjZSBQcmVzZW50ZXJTdGF0ZSBleHRlbmRzIFJlcXVpcmVkPFByZXNlbnRlck9wdGlvbnM+IHtcbiAgZGVmYXVsdFNjYWxhclRhZ05hbWU6IHN0cmluZ1xuICBpbXBsaWNpdFJlc29sdmVyczogcmVhZG9ubHkgU2NhbGFyVGFnRGVmaW5pdGlvbltdXG59XG5cbmZ1bmN0aW9uIG5vZGVUYWdTaG9ydCAobm9kZTogTm9kZSkge1xuICByZXR1cm4gbm9kZS5zdHlsZS50YWdnZWQgPyBub2RlLnRhZyA6IHRhZ05hbWVTaG9ydChub2RlLnRhZylcbn1cblxuZnVuY3Rpb24gY3JlYXRlUHJlc2VudGVyU3RhdGUgKG9wdGlvbnM6IFByZXNlbnRlck9wdGlvbnMpOiBQcmVzZW50ZXJTdGF0ZSB7XG4gIGNvbnN0IG9wdHMgPSB7XG4gICAgLi4uREVGQVVMVF9QUkVTRU5URVJfT1BUSU9OUyxcbiAgICAuLi5vcHRpb25zXG4gIH1cblxuICByZXR1cm4ge1xuICAgIC4uLm9wdHMsXG4gICAgZGVmYXVsdFNjYWxhclRhZ05hbWU6IG9wdHMuc2NoZW1hLmRlZmF1bHRTY2FsYXJUYWcudGFnTmFtZSxcbiAgICBpbXBsaWNpdFJlc29sdmVyczogb3B0cy5zY2hlbWEuaW1wbGljaXRTY2FsYXJUYWdzXG4gIH1cbn1cblxuZnVuY3Rpb24gZW5jb2RlTm9uUHJpbnRhYmxlIChjaGFyYWN0ZXI6IG51bWJlcikge1xuICAvLyBZQU1MIG5vbi1wcmludGFibGUgY29kZSBwb2ludHMgYXJlIGFsbCBpbiBCTVAgKG1heCBGRkZGKTtcbiAgLy8gYXN0cmFsIGNvZGUgcG9pbnRzIGFyZSBwcmludGFibGUgYW5kIGNhbid0IGNvbWUgaGVyZS5cbiAgY29uc3Qgc3RyaW5nID0gY2hhcmFjdGVyLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpXG4gIGNvbnN0IGhhbmRsZSA9IGNoYXJhY3RlciA8PSAweEZGID8gJ3gnIDogJ3UnXG4gIGNvbnN0IGxlbmd0aCA9IGNoYXJhY3RlciA8PSAweEZGID8gMiA6IDRcblxuICByZXR1cm4gYFxcXFwke2hhbmRsZX0keycwJy5yZXBlYXQobGVuZ3RoIC0gc3RyaW5nLmxlbmd0aCl9JHtzdHJpbmd9YFxufVxuXG4vLyBJbmRlbnRzIGV2ZXJ5IGxpbmUgaW4gYSBzdHJpbmcuIEVtcHR5IGxpbmVzIChcXG4gb25seSkgYXJlIG5vdCBpbmRlbnRlZC5cbmZ1bmN0aW9uIGluZGVudFN0cmluZyAoc3RyaW5nOiBzdHJpbmcsIHNwYWNlczogbnVtYmVyKSB7XG4gIGNvbnN0IGluZCA9ICcgJy5yZXBlYXQoc3BhY2VzKVxuICBsZXQgcG9zaXRpb24gPSAwXG4gIGxldCByZXN1bHQgPSAnJ1xuICBjb25zdCBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG5cbiAgd2hpbGUgKHBvc2l0aW9uIDwgbGVuZ3RoKSB7XG4gICAgbGV0IGxpbmVcbiAgICBjb25zdCBuZXh0ID0gc3RyaW5nLmluZGV4T2YoJ1xcbicsIHBvc2l0aW9uKVxuICAgIGlmIChuZXh0ID09PSAtMSkge1xuICAgICAgbGluZSA9IHN0cmluZy5zbGljZShwb3NpdGlvbilcbiAgICAgIHBvc2l0aW9uID0gbGVuZ3RoXG4gICAgfSBlbHNlIHtcbiAgICAgIGxpbmUgPSBzdHJpbmcuc2xpY2UocG9zaXRpb24sIG5leHQgKyAxKVxuICAgICAgcG9zaXRpb24gPSBuZXh0ICsgMVxuICAgIH1cblxuICAgIGlmIChsaW5lLmxlbmd0aCAmJiBsaW5lICE9PSAnXFxuJykgcmVzdWx0ICs9IGluZFxuXG4gICAgcmVzdWx0ICs9IGxpbmVcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVOZXh0TGluZSAoc3RhdGU6IFByZXNlbnRlclN0YXRlLCBsZXZlbDogbnVtYmVyKSB7XG4gIHJldHVybiBgXFxuJHsnICcucmVwZWF0KHN0YXRlLmluZGVudCAqIGxldmVsKX1gXG59XG5cbi8vIEluZGVudGF0aW9uL3dpZHRoIG51bWJlcnMgdGhhdCBnb3Zlcm4gaG93IGEgc2NhbGFyIGxheXMgb3V0IGF0IGBsZXZlbGAuXG4vLyBTY2FsYXItb25seTogY29sbGVjdGlvbnMgY29tcHV0ZSB0aGVpciBvd24gaW5kZW50IHZpYSBgZ2VuZXJhdGVOZXh0TGluZWAuXG4vLyAgIGluZGVudCAgICAgIC0gc3BhY2VzIHByZXBlbmRlZCB0byB0aGUgc2NhbGFyJ3MgY29udGVudCAoYmxvY2sgc3R5bGVzKVxuLy8gICBibG9ja0luZGVudCAtIHRoZSBibG9jayBpbmRlbnRhdGlvbiBpbmRpY2F0b3IgZGlnaXQgKGB8MmAgLyBgPjJgKTsgYXQgdGhlXG4vLyAgICAgICAgICAgICAgICAgZG9jdW1lbnQgcm9vdCAobGV2ZWwgMCkgaXQgaXMgb25lIGdyZWF0ZXIgdGhhbiB0aGUgc3BhY2VzIHdlXG4vLyAgICAgICAgICAgICAgICAgYWN0dWFsbHkgcHJlcGVuZCAocmVhZGVyIGFwcGxpZXMgaXQgcmVsYXRpdmUgdG8gcGFyZW50IG4gPSAtMSlcbi8vICAgbGluZVdpZHRoICAgLSBmb2xkIHdpZHRoIGF0IHRoaXMgZGVwdGgsIHNocmlua2luZyBtb25vdG9uaWNhbGx5IHRvd2FyZFxuLy8gICAgICAgICAgICAgICAgIG1pbihzdGF0ZS5saW5lV2lkdGgsIDQwKSBhcyBpbmRlbnRhdGlvbiBkZWVwZW5zOyAtMSA9IG5vIGxpbWl0XG5mdW5jdGlvbiBzY2FsYXJMYXlvdXQgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgbGV2ZWw6IG51bWJlcikge1xuICBjb25zdCBpbmRlbnQgPSBzdGF0ZS5pbmRlbnQgKiBNYXRoLm1heCgxLCBsZXZlbCkgLy8gbm8gMC1pbmRlbnQgc2NhbGFyc1xuICBjb25zdCBibG9ja0luZGVudCA9IGxldmVsID09PSAwID8gc3RhdGUuaW5kZW50ICsgMSA6IHN0YXRlLmluZGVudFxuICBjb25zdCBsaW5lV2lkdGggPSAoc3RhdGUubGluZVdpZHRoID09PSAtMSlcbiAgICA/IC0xXG4gICAgOiBNYXRoLm1heChNYXRoLm1pbihzdGF0ZS5saW5lV2lkdGgsIDQwKSwgc3RhdGUubGluZVdpZHRoIC0gaW5kZW50KVxuXG4gIHJldHVybiB7IGluZGVudCwgYmxvY2tJbmRlbnQsIGxpbmVXaWR0aCB9XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVJbXBsaWNpdFRhZyAoc3RhdGU6IFByZXNlbnRlclN0YXRlLCBzdHI6IHN0cmluZykge1xuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IHN0YXRlLmltcGxpY2l0UmVzb2x2ZXJzLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCB0YWdEZWZpbml0aW9uID0gc3RhdGUuaW1wbGljaXRSZXNvbHZlcnNbaW5kZXhdXG5cbiAgICBpZiAodGFnRGVmaW5pdGlvbi5yZXNvbHZlKHN0ciwgZmFsc2UsIHRhZ0RlZmluaXRpb24udGFnTmFtZSkgIT09IE5PVF9SRVNPTFZFRCkge1xuICAgICAgcmV0dXJuIHRhZ0RlZmluaXRpb24udGFnTmFtZVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdGF0ZS5kZWZhdWx0U2NhbGFyVGFnTmFtZVxufVxuXG4vLyBbMzNdIHMtd2hpdGUgOjo9IHMtc3BhY2UgfCBzLXRhYlxuZnVuY3Rpb24gaXNXaGl0ZXNwYWNlIChjOiBudW1iZXIpIHtcbiAgcmV0dXJuIGMgPT09IENIQVJfU1BBQ0UgfHwgYyA9PT0gQ0hBUl9UQUJcbn1cblxuLy8gTWlycm9ycyBwYXJzZXIudGVzdERvY3VtZW50U2VwYXJhdG9yKCk6IGAtLS1gIGFuZCBgLi4uYCBhcmUgZG9jdW1lbnRcbi8vIG1hcmtlcnMgd2hlbiBmb2xsb3dlZCBieSBzZXBhcmF0aW9uIHdoaXRlc3BhY2UsIGEgbGluZSBicmVhaywgb3IgRU9GLlxuZnVuY3Rpb24gc3RhcnRzV2l0aERvY3VtZW50U2VwYXJhdG9yIChzdHJpbmc6IHN0cmluZykge1xuICBjb25zdCBtYXJrZXIgPSBzdHJpbmcuY2hhckNvZGVBdCgwKVxuXG4gIGlmICgobWFya2VyICE9PSBDSEFSX01JTlVTICYmIG1hcmtlciAhPT0gMHgyRS8qIC4gKi8pIHx8XG4gICAgICBzdHJpbmcuY2hhckNvZGVBdCgxKSAhPT0gbWFya2VyIHx8IHN0cmluZy5jaGFyQ29kZUF0KDIpICE9PSBtYXJrZXIpIHJldHVybiBmYWxzZVxuXG4gIGlmIChzdHJpbmcubGVuZ3RoID09PSAzKSByZXR1cm4gdHJ1ZVxuXG4gIGNvbnN0IGZvbGxvd2luZyA9IHN0cmluZy5jaGFyQ29kZUF0KDMpXG4gIHJldHVybiBpc1doaXRlc3BhY2UoZm9sbG93aW5nKSB8fFxuICAgIGZvbGxvd2luZyA9PT0gQ0hBUl9DQVJSSUFHRV9SRVRVUk4gfHwgZm9sbG93aW5nID09PSBDSEFSX0xJTkVfRkVFRFxufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIGNoYXJhY3RlciBjYW4gYmUgcHJpbnRlZCB3aXRob3V0IGVzY2FwaW5nLlxuLy8gRnJvbSBZQU1MIDEuMjogXCJhbnkgYWxsb3dlZCBjaGFyYWN0ZXJzIGtub3duIHRvIGJlIG5vbi1wcmludGFibGVcbi8vIHNob3VsZCBhbHNvIGJlIGVzY2FwZWQuIFtIb3dldmVyLF0gVGhpcyBpc27igJl0IG1hbmRhdG9yeVwiXG4vLyBEZXJpdmVkIGZyb20gbmItY2hhciAtIFxcdCAtICN4ODUgLSAjeEEwIC0gI3gyMDI4IC0gI3gyMDI5LlxuZnVuY3Rpb24gaXNQcmludGFibGUgKGM6IG51bWJlcikge1xuICByZXR1cm4gKGMgPj0gMHgwMDAyMCAmJiBjIDw9IDB4MDAwMDdFKSB8fFxuICAgICgoYyA+PSAweDAwMEExICYmIGMgPD0gMHgwMEQ3RkYpICYmIGMgIT09IDB4MjAyOCAmJiBjICE9PSAweDIwMjkpIHx8XG4gICAgKChjID49IDB4MEUwMDAgJiYgYyA8PSAweDAwRkZGRCkgJiYgYyAhPT0gQ0hBUl9CT00pIHx8XG4gICAgKGMgPj0gMHgxMDAwMCAmJiBjIDw9IDB4MTBGRkZGKVxufVxuXG4vLyBbMzRdIG5zLWNoYXIgOjo9IG5iLWNoYXIgLSBzLXdoaXRlXG4vLyBbMjddIG5iLWNoYXIgOjo9IGMtcHJpbnRhYmxlIC0gYi1jaGFyIC0gYy1ieXRlLW9yZGVyLW1hcmtcbi8vIFsyNl0gYi1jaGFyICA6Oj0gYi1saW5lLWZlZWQgfCBiLWNhcnJpYWdlLXJldHVyblxuLy8gSW5jbHVkaW5nIHMtd2hpdGUgKGZvciBzb21lIHJlYXNvbiwgZXhhbXBsZXMgZG9lc24ndCBtYXRjaCBzcGVjcyBpbiB0aGlzIGFzcGVjdClcbi8vIG5zLWNoYXIgOjo9IGMtcHJpbnRhYmxlIC0gYi1saW5lLWZlZWQgLSBiLWNhcnJpYWdlLXJldHVybiAtIGMtYnl0ZS1vcmRlci1tYXJrXG5mdW5jdGlvbiBpc05zQ2hhck9yV2hpdGVzcGFjZSAoYzogbnVtYmVyKSB7XG4gIHJldHVybiBpc1ByaW50YWJsZShjKSAmJlxuICAgIGMgIT09IENIQVJfQk9NICYmXG4gICAgLy8gLSBiLWNoYXJcbiAgICBjICE9PSBDSEFSX0NBUlJJQUdFX1JFVFVSTiAmJlxuICAgIGMgIT09IENIQVJfTElORV9GRUVEXG59XG5cbi8vIFsxMjddICBucy1wbGFpbi1zYWZlKGMpIDo6PSBjID0gZmxvdy1vdXQgIOKHkiBucy1wbGFpbi1zYWZlLW91dFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBmbG93LWluICAg4oeSIG5zLXBsYWluLXNhZmUtaW5cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjID0gYmxvY2sta2V5IOKHkiBucy1wbGFpbi1zYWZlLW91dFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBmbG93LWtleSAg4oeSIG5zLXBsYWluLXNhZmUtaW5cbi8vIFsxMjhdIG5zLXBsYWluLXNhZmUtb3V0IDo6PSBucy1jaGFyXG4vLyBbMTI5XSAgbnMtcGxhaW4tc2FmZS1pbiA6Oj0gbnMtY2hhciAtIGMtZmxvdy1pbmRpY2F0b3Jcbi8vIFsxMzBdICBucy1wbGFpbi1jaGFyKGMpIDo6PSAgKCBucy1wbGFpbi1zYWZlKGMpIC0g4oCcOuKAnSAtIOKAnCPigJ0gKVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAoIC8qIEFuIG5zLWNoYXIgcHJlY2VkaW5nICovIOKAnCPigJ0gKVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAoIOKAnDrigJ0gLyogRm9sbG93ZWQgYnkgYW4gbnMtcGxhaW4tc2FmZShjKSAqLyApXG4vLyBgcHJldmAgaXMgdGhlIHByZXZpb3VzIGNvZGUgcG9pbnQsIG9yIC0xIHdoZW4gYGNgIGlzIHRoZSBmaXJzdCBjaGFyYWN0ZXJcbi8vIChubyBwcmVjZWRpbmcgY2hhcmFjdGVyKS4gLTEgaXMgbm90IGEgdmFsaWQgY29kZSBwb2ludCwgc28gaXQgY2FuIG5ldmVyXG4vLyBjb2xsaWRlIHdpdGggYSByZWFsIG9uZSBhbmQgc2FmZWx5IGRpc2FibGVzIHRoZSBwcmV2LWRlcGVuZGVudCBjYXNlcyBiZWxvdy5cbmZ1bmN0aW9uIGlzUGxhaW5TYWZlIChjOiBudW1iZXIsIHByZXY6IG51bWJlciwgaW5ibG9jazogYm9vbGVhbikge1xuICBjb25zdCBjSXNOc0NoYXJPcldoaXRlc3BhY2UgPSBpc05zQ2hhck9yV2hpdGVzcGFjZShjKVxuICBjb25zdCBjSXNOc0NoYXIgPSBjSXNOc0NoYXJPcldoaXRlc3BhY2UgJiYgIWlzV2hpdGVzcGFjZShjKVxuICByZXR1cm4gKFxuICAgIChcbiAgICAgIC8vIG5zLXBsYWluLXNhZmVcbiAgICAgIGluYmxvY2sgLy8gYyA9IGZsb3ctaW5cbiAgICAgICAgPyBjSXNOc0NoYXJPcldoaXRlc3BhY2VcbiAgICAgICAgOiBjSXNOc0NoYXJPcldoaXRlc3BhY2UgJiZcbiAgICAgICAgICAvLyAtIGMtZmxvdy1pbmRpY2F0b3JcbiAgICAgICAgICBjICE9PSBDSEFSX0NPTU1BICYmXG4gICAgICAgICAgYyAhPT0gQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VUICYmXG4gICAgICAgICAgYyAhPT0gQ0hBUl9SSUdIVF9TUVVBUkVfQlJBQ0tFVCAmJlxuICAgICAgICAgIGMgIT09IENIQVJfTEVGVF9DVVJMWV9CUkFDS0VUICYmXG4gICAgICAgICAgYyAhPT0gQ0hBUl9SSUdIVF9DVVJMWV9CUkFDS0VUXG4gICAgKSAmJlxuICAgIC8vIG5zLXBsYWluLWNoYXJcbiAgICBjICE9PSBDSEFSX1NIQVJQICYmIC8vIGZhbHNlIG9uICcjJ1xuICAgICEocHJldiA9PT0gQ0hBUl9DT0xPTiAmJiAhY0lzTnNDaGFyKVxuICApIHx8IC8vIGZhbHNlIG9uICc6ICdcbiAgKGlzTnNDaGFyT3JXaGl0ZXNwYWNlKHByZXYpICYmICFpc1doaXRlc3BhY2UocHJldikgJiYgYyA9PT0gQ0hBUl9TSEFSUCkgfHwgLy8gY2hhbmdlIHRvIHRydWUgb24gJ1teIF0jJ1xuICAocHJldiA9PT0gQ0hBUl9DT0xPTiAmJiBjSXNOc0NoYXIpIC8vIGNoYW5nZSB0byB0cnVlIG9uICc6W14gXSdcbn1cblxuLy8gU2ltcGxpZmllZCB0ZXN0IGZvciB2YWx1ZXMgYWxsb3dlZCBhcyB0aGUgZmlyc3QgY2hhcmFjdGVyIGluIHBsYWluIHN0eWxlLlxuZnVuY3Rpb24gaXNQbGFpblNhZmVGaXJzdCAoYzogbnVtYmVyKSB7XG4gIC8vIFVzZXMgYSBzdWJzZXQgb2YgbnMtY2hhciAtIGMtaW5kaWNhdG9yXG4gIC8vIHdoZXJlIG5zLWNoYXIgPSBuYi1jaGFyIC0gcy13aGl0ZS5cbiAgLy8gTm8gc3VwcG9ydCBvZiAoICgg4oCcP+KAnSB8IOKAnDrigJ0gfCDigJwt4oCdICkgLyogRm9sbG93ZWQgYnkgYW4gbnMtcGxhaW4tc2FmZShjKSkgKi8gKSBwYXJ0XG4gIHJldHVybiBpc1ByaW50YWJsZShjKSAmJlxuICAgIGMgIT09IENIQVJfQk9NICYmXG4gICAgIWlzV2hpdGVzcGFjZShjKSAmJiAvLyAtIHMtd2hpdGVcbiAgICAvLyAtIChjLWluZGljYXRvciA6Oj1cbiAgICAvLyDigJwt4oCdIHwg4oCcP+KAnSB8IOKAnDrigJ0gfCDigJws4oCdIHwg4oCcW+KAnSB8IOKAnF3igJ0gfCDigJx74oCdIHwg4oCcfeKAnVxuICAgIGMgIT09IENIQVJfTUlOVVMgJiZcbiAgICBjICE9PSBDSEFSX1FVRVNUSU9OICYmXG4gICAgYyAhPT0gQ0hBUl9DT0xPTiAmJlxuICAgIGMgIT09IENIQVJfQ09NTUEgJiZcbiAgICBjICE9PSBDSEFSX0xFRlRfU1FVQVJFX0JSQUNLRVQgJiZcbiAgICBjICE9PSBDSEFSX1JJR0hUX1NRVUFSRV9CUkFDS0VUICYmXG4gICAgYyAhPT0gQ0hBUl9MRUZUX0NVUkxZX0JSQUNLRVQgJiZcbiAgICBjICE9PSBDSEFSX1JJR0hUX0NVUkxZX0JSQUNLRVQgJiZcbiAgICAvLyB8IOKAnCPigJ0gfCDigJwm4oCdIHwg4oCcKuKAnSB8IOKAnCHigJ0gfCDigJx84oCdIHwg4oCcPeKAnSB8IOKAnD7igJ0gfCDigJwn4oCdIHwg4oCcXCLigJ1cbiAgICBjICE9PSBDSEFSX1NIQVJQICYmXG4gICAgYyAhPT0gQ0hBUl9BTVBFUlNBTkQgJiZcbiAgICBjICE9PSBDSEFSX0FTVEVSSVNLICYmXG4gICAgYyAhPT0gQ0hBUl9FWENMQU1BVElPTiAmJlxuICAgIGMgIT09IENIQVJfVkVSVElDQUxfTElORSAmJlxuICAgIGMgIT09IENIQVJfRVFVQUxTICYmXG4gICAgYyAhPT0gQ0hBUl9HUkVBVEVSX1RIQU4gJiZcbiAgICBjICE9PSBDSEFSX1NJTkdMRV9RVU9URSAmJlxuICAgIGMgIT09IENIQVJfRE9VQkxFX1FVT1RFICYmXG4gICAgLy8gfCDigJwl4oCdIHwg4oCcQOKAnSB8IOKAnGDigJ0pXG4gICAgYyAhPT0gQ0hBUl9QRVJDRU5UICYmXG4gICAgYyAhPT0gQ0hBUl9DT01NRVJDSUFMX0FUICYmXG4gICAgYyAhPT0gQ0hBUl9HUkFWRV9BQ0NFTlRcbn1cblxuZnVuY3Rpb24gaXNQbGFpblNhZmVBdFN0YXJ0IChzdHJpbmc6IHN0cmluZywgaW5ibG9jazogYm9vbGVhbikge1xuICBjb25zdCBmaXJzdCA9IGNvZGVQb2ludEF0KHN0cmluZywgMClcblxuICBpZiAoaXNQbGFpblNhZmVGaXJzdChmaXJzdCkpIHJldHVybiB0cnVlXG5cbiAgaWYgKFxuICAgIHN0cmluZy5sZW5ndGggPiAxICYmXG4gICAgKGZpcnN0ID09PSBDSEFSX01JTlVTIHx8IGZpcnN0ID09PSBDSEFSX1FVRVNUSU9OIHx8IGZpcnN0ID09PSBDSEFSX0NPTE9OKVxuICApIHtcbiAgICBjb25zdCBzZWNvbmQgPSBjb2RlUG9pbnRBdChzdHJpbmcsIDEpXG5cbiAgICAvLyBUaGUgcmVsYXhlZCBpc1BsYWluU2FmZSgpIGFjY2VwdHMgd2hpdGVzcGFjZSBpbnNpZGUgYSBzY2FsYXIsIGJ1dCB0aGVcbiAgICAvLyBpbmRpY2F0b3IgZXhjZXB0aW9uIGluIG5zLXBsYWluLWZpcnN0IHJlcXVpcmVzIGFuIG5zLXBsYWluLXNhZmVcbiAgICAvLyAqbm9uLXNwYWNlKiBjaGFyYWN0ZXIuIE90aGVyd2lzZSBgLSB2YWx1ZWAgYW5kIGA/IHZhbHVlYCBzdGFydCBibG9ja1xuICAgIC8vIGNvbGxlY3Rpb25zIGluc3RlYWQgb2YgcGxhaW4gc2NhbGFycy5cbiAgICByZXR1cm4gIWlzV2hpdGVzcGFjZShzZWNvbmQpICYmIGlzUGxhaW5TYWZlKHNlY29uZCwgZmlyc3QsIGluYmxvY2spXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuLy8gU2ltcGxpZmllZCB0ZXN0IGZvciB2YWx1ZXMgYWxsb3dlZCBhcyB0aGUgbGFzdCBjaGFyYWN0ZXIgaW4gcGxhaW4gc3R5bGUuXG5mdW5jdGlvbiBpc1BsYWluU2FmZUxhc3QgKGM6IG51bWJlcikge1xuICAvLyBqdXN0IG5vdCB3aGl0ZXNwYWNlIG9yIGNvbG9uLCBpdCB3aWxsIGJlIGNoZWNrZWQgdG8gYmUgcGxhaW4gY2hhcmFjdGVyIGxhdGVyXG4gIHJldHVybiAhaXNXaGl0ZXNwYWNlKGMpICYmIGMgIT09IENIQVJfQ09MT05cbn1cblxuLy8gU2FtZSBhcyAnc3RyaW5nJy5jb2RlUG9pbnRBdChwb3MpLCBidXQgd29ya3MgaW4gb2xkZXIgYnJvd3NlcnMuXG5mdW5jdGlvbiBjb2RlUG9pbnRBdCAoc3RyaW5nOiBzdHJpbmcsIHBvczogbnVtYmVyKSB7XG4gIGNvbnN0IGZpcnN0ID0gc3RyaW5nLmNoYXJDb2RlQXQocG9zKVxuICBsZXQgc2Vjb25kXG5cbiAgaWYgKGZpcnN0ID49IDB4RDgwMCAmJiBmaXJzdCA8PSAweERCRkYgJiYgcG9zICsgMSA8IHN0cmluZy5sZW5ndGgpIHtcbiAgICBzZWNvbmQgPSBzdHJpbmcuY2hhckNvZGVBdChwb3MgKyAxKVxuICAgIGlmIChzZWNvbmQgPj0gMHhEQzAwICYmIHNlY29uZCA8PSAweERGRkYpIHtcbiAgICAgIC8vIGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nI3N1cnJvZ2F0ZS1mb3JtdWxhZVxuICAgICAgcmV0dXJuIChmaXJzdCAtIDB4RDgwMCkgKiAweDQwMCArIHNlY29uZCAtIDB4REMwMCArIDB4MTAwMDBcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZpcnN0XG59XG5cbmZ1bmN0aW9uIG5lZWRJbmRlbnRJbmRpY2F0b3IgKHN0cmluZzogc3RyaW5nKSB7XG4gIGNvbnN0IGxlYWRpbmdTcGFjZVJlID0gL15cXG4qIC9cbiAgcmV0dXJuIGxlYWRpbmdTcGFjZVJlLnRlc3Qoc3RyaW5nKVxufVxuXG5jb25zdCBTVFlMRV9QTEFJTiA9IDFcbmNvbnN0IFNUWUxFX1NJTkdMRSA9IDJcbmNvbnN0IFNUWUxFX0xJVEVSQUwgPSAzXG5jb25zdCBTVFlMRV9GT0xERUQgPSA0XG5jb25zdCBTVFlMRV9ET1VCTEUgPSA1XG5cbnR5cGUgU2NhbGFyU3R5bGVJZCA9XG4gIHR5cGVvZiBTVFlMRV9QTEFJTiB8XG4gIHR5cGVvZiBTVFlMRV9TSU5HTEUgfFxuICB0eXBlb2YgU1RZTEVfTElURVJBTCB8XG4gIHR5cGVvZiBTVFlMRV9GT0xERUQgfFxuICB0eXBlb2YgU1RZTEVfRE9VQkxFXG5cbi8vIERldGVybWluZXMgd2hpY2ggc2NhbGFyIHN0eWxlcyBhcmUgcG9zc2libGUgYW5kIHJldHVybnMgdGhlIHByZWZlcnJlZCBzdHlsZS5cbi8vIGxpbmVXaWR0aCA9IC0xID0+IG5vIGxpbWl0LlxuLy8gUHJlLWNvbmRpdGlvbnM6IHN0ci5sZW5ndGggPiAwLlxuLy8gUG9zdC1jb25kaXRpb25zOlxuLy8gICAgU1RZTEVfUExBSU4gb3IgU1RZTEVfU0lOR0xFID0+IG5vIFxcbiBhcmUgaW4gdGhlIHN0cmluZy5cbi8vICAgIFNUWUxFX0xJVEVSQUwgPT4gbm8gbGluZXMgYXJlIHN1aXRhYmxlIGZvciBmb2xkaW5nIChvciBsaW5lV2lkdGggaXMgLTEpLlxuLy8gICAgU1RZTEVfRk9MREVEID0+IGEgbGluZSA+IGxpbmVXaWR0aCBhbmQgY2FuIGJlIGZvbGRlZCAoYW5kIGxpbmVXaWR0aCAhPSAtMSkuXG5mdW5jdGlvbiBjaG9vc2VTY2FsYXJTdHlsZSAoc3RhdGU6IFByZXNlbnRlclN0YXRlLCBzdHJpbmc6IHN0cmluZywgbGF5b3V0OiBSZXR1cm5UeXBlPHR5cGVvZiBzY2FsYXJMYXlvdXQ+LFxuICBzaW5nbGVMaW5lT25seTogYm9vbGVhbiwgZm9yY2VRdW90ZTogYm9vbGVhbiwgaW5ibG9jazogYm9vbGVhbik6IFNjYWxhclN0eWxlSWQge1xuICBjb25zdCB7IGJsb2NrSW5kZW50LCBsaW5lV2lkdGggfSA9IGxheW91dFxuICBsZXQgaVxuICBsZXQgY2hhciA9IDBcbiAgbGV0IHByZXZDaGFyID0gLTEgLy8gLTEgPSBubyBwcmV2aW91cyBjaGFyYWN0ZXIgeWV0IChzZWUgaXNQbGFpblNhZmUpXG4gIGxldCBoYXNMaW5lQnJlYWsgPSBmYWxzZVxuICBsZXQgaGFzRm9sZGFibGVMaW5lID0gZmFsc2UgLy8gb25seSBjaGVja2VkIGlmIHNob3VsZFRyYWNrV2lkdGhcbiAgY29uc3Qgc2hvdWxkVHJhY2tXaWR0aCA9IGxpbmVXaWR0aCAhPT0gLTFcbiAgbGV0IHByZXZpb3VzTGluZUJyZWFrID0gLTEgLy8gY291bnQgdGhlIGZpcnN0IGxpbmUgY29ycmVjdGx5XG4gIC8vIERvY3VtZW50IG1hcmtlcnMgYXJlIHJlY29nbml6ZWQgYXMgd2hvbGUgdG9rZW5zIGF0IHRoZSBzdGFydCBvZiBhIGxpbmUsXG4gIC8vIHNvIGNoYXJhY3Rlci1sZXZlbCBwbGFpbi1zY2FsYXIgY2hlY2tzIGFsb25lIGNhbm5vdCByZWplY3QgdGhlbS5cbiAgbGV0IHBsYWluID0gIXN0YXJ0c1dpdGhEb2N1bWVudFNlcGFyYXRvcihzdHJpbmcpICYmXG4gICAgaXNQbGFpblNhZmVBdFN0YXJ0KHN0cmluZywgaW5ibG9jaykgJiZcbiAgICBpc1BsYWluU2FmZUxhc3QoY29kZVBvaW50QXQoc3RyaW5nLCBzdHJpbmcubGVuZ3RoIC0gMSkpXG5cbiAgaWYgKHNpbmdsZUxpbmVPbmx5IHx8IGZvcmNlUXVvdGUpIHtcbiAgICAvLyBDYXNlOiBubyBibG9jayBzdHlsZXMuXG4gICAgLy8gQ2hlY2sgZm9yIGRpc2FsbG93ZWQgY2hhcmFjdGVycyB0byBydWxlIG91dCBwbGFpbiBhbmQgc2luZ2xlLlxuICAgIGZvciAoaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBjaGFyID49IDB4MTAwMDAgPyBpICs9IDIgOiBpKyspIHtcbiAgICAgIGNoYXIgPSBjb2RlUG9pbnRBdChzdHJpbmcsIGkpXG4gICAgICBpZiAoIWlzUHJpbnRhYmxlKGNoYXIpKSB7XG4gICAgICAgIHJldHVybiBTVFlMRV9ET1VCTEVcbiAgICAgIH1cbiAgICAgIHBsYWluID0gcGxhaW4gJiYgaXNQbGFpblNhZmUoY2hhciwgcHJldkNoYXIsIGluYmxvY2spXG4gICAgICBwcmV2Q2hhciA9IGNoYXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gQ2FzZTogYmxvY2sgc3R5bGVzIHBlcm1pdHRlZC5cbiAgICBmb3IgKGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgY2hhciA+PSAweDEwMDAwID8gaSArPSAyIDogaSsrKSB7XG4gICAgICBjaGFyID0gY29kZVBvaW50QXQoc3RyaW5nLCBpKVxuICAgICAgaWYgKGNoYXIgPT09IENIQVJfTElORV9GRUVEKSB7XG4gICAgICAgIGhhc0xpbmVCcmVhayA9IHRydWVcbiAgICAgICAgLy8gQ2hlY2sgaWYgYW55IGxpbmUgY2FuIGJlIGZvbGRlZC5cbiAgICAgICAgaWYgKHNob3VsZFRyYWNrV2lkdGgpIHtcbiAgICAgICAgICBoYXNGb2xkYWJsZUxpbmUgPSBoYXNGb2xkYWJsZUxpbmUgfHxcbiAgICAgICAgICAgIC8vIEZvbGRhYmxlIGxpbmUgPSB0b28gbG9uZywgYW5kIG5vdCBtb3JlLWluZGVudGVkLlxuICAgICAgICAgICAgKGkgLSBwcmV2aW91c0xpbmVCcmVhayAtIDEgPiBsaW5lV2lkdGggJiZcbiAgICAgICAgICAgICBzdHJpbmdbcHJldmlvdXNMaW5lQnJlYWsgKyAxXSAhPT0gJyAnKVxuICAgICAgICAgIHByZXZpb3VzTGluZUJyZWFrID0gaVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFpc1ByaW50YWJsZShjaGFyKSkge1xuICAgICAgICByZXR1cm4gU1RZTEVfRE9VQkxFXG4gICAgICB9XG4gICAgICBwbGFpbiA9IHBsYWluICYmIGlzUGxhaW5TYWZlKGNoYXIsIHByZXZDaGFyLCBpbmJsb2NrKVxuICAgICAgcHJldkNoYXIgPSBjaGFyXG4gICAgfVxuICAgIC8vIGluIGNhc2UgdGhlIGVuZCBpcyBtaXNzaW5nIGEgXFxuXG4gICAgaGFzRm9sZGFibGVMaW5lID0gaGFzRm9sZGFibGVMaW5lIHx8IChzaG91bGRUcmFja1dpZHRoICYmXG4gICAgICAoaSAtIHByZXZpb3VzTGluZUJyZWFrIC0gMSA+IGxpbmVXaWR0aCAmJlxuICAgICAgIHN0cmluZ1twcmV2aW91c0xpbmVCcmVhayArIDFdICE9PSAnICcpKVxuICB9XG4gIC8vIEFsdGhvdWdoIGV2ZXJ5IHN0eWxlIGNhbiByZXByZXNlbnQgXFxuIHdpdGhvdXQgZXNjYXBpbmcsIHByZWZlciBibG9jayBzdHlsZXNcbiAgLy8gZm9yIG11bHRpbGluZSwgc2luY2UgdGhleSdyZSBtb3JlIHJlYWRhYmxlIGFuZCB0aGV5IGRvbid0IGFkZCBlbXB0eSBsaW5lcy5cbiAgLy8gQWxzbyBwcmVmZXIgZm9sZGluZyBhIHN1cGVyLWxvbmcgbGluZS5cbiAgaWYgKCFoYXNMaW5lQnJlYWsgJiYgIWhhc0ZvbGRhYmxlTGluZSkge1xuICAgIC8vIFN5bnRhY3RpYyB2ZXJkaWN0IG9ubHk6IHdoZXRoZXIgdGhlIGJhcmUgdGV4dCByb3VuZC10cmlwcyB0byB0aGUgbm9kZSdzXG4gICAgLy8gdGFnIGlzIGEgc2VtYW50aWMgY2hlY2sgdGhlIGNhbGxlciBhcHBsaWVzIChzZWUgcmVzb2x2ZVNjYWxhclN0eWxlKS5cbiAgICBpZiAocGxhaW4gJiYgIWZvcmNlUXVvdGUpIHJldHVybiBTVFlMRV9QTEFJTlxuICAgIHJldHVybiBzdGF0ZS5xdW90ZVN0eWxlID09PSAnZG91YmxlJyA/IFNUWUxFX0RPVUJMRSA6IFNUWUxFX1NJTkdMRVxuICB9XG4gIC8vIEVkZ2UgY2FzZTogYmxvY2sgaW5kZW50YXRpb24gaW5kaWNhdG9yIGNhbiBvbmx5IGhhdmUgb25lIGRpZ2l0LlxuICBpZiAoYmxvY2tJbmRlbnQgPiA5ICYmIG5lZWRJbmRlbnRJbmRpY2F0b3Ioc3RyaW5nKSkge1xuICAgIHJldHVybiBTVFlMRV9ET1VCTEVcbiAgfVxuICAvLyBBdCB0aGlzIHBvaW50IHdlIGtub3cgYmxvY2sgc3R5bGVzIGFyZSB2YWxpZC5cbiAgLy8gUHJlZmVyIGxpdGVyYWwgc3R5bGUgdW5sZXNzIHdlIHdhbnQgdG8gZm9sZC5cbiAgcmV0dXJuIGhhc0ZvbGRhYmxlTGluZSA/IFNUWUxFX0ZPTERFRCA6IFNUWUxFX0xJVEVSQUxcbn1cblxuLy8gUmVuZGVycyBgc3RyaW5nYCBpbiB0aGUgZ2l2ZW4gbnVtZXJpYyBzdHlsZSB3aXRoIHRoZSBnaXZlbiBsYXlvdXQuXG4vLyBOQi4gV2UgZHJvcCB0aGUgbGFzdCB0cmFpbGluZyBuZXdsaW5lIChpZiBhbnkpIG9mIGEgcmV0dXJuZWQgYmxvY2sgc2NhbGFyXG4vLyAgc2luY2UgdGhlIGR1bXBlciBhZGRzIGl0cyBvd24gbmV3bGluZS4gVGhpcyBhbHdheXMgd29ya3M6XG4vLyAgICDigKIgTm8gZW5kaW5nIG5ld2xpbmUgPT4gdW5hZmZlY3RlZDsgYWxyZWFkeSB1c2luZyBzdHJpcCBcIi1cIiBjaG9tcGluZy5cbi8vICAgIOKAoiBFbmRpbmcgbmV3bGluZSAgICA9PiByZW1vdmVkIHRoZW4gcmVzdG9yZWQuXG4vLyAgSW1wb3J0YW50bHksIHRoaXMga2VlcHMgdGhlIFwiK1wiIGNob21wIGluZGljYXRvciBmcm9tIGdhaW5pbmcgYW4gZXh0cmEgbGluZS5cbmZ1bmN0aW9uIHJlbmRlclNjYWxhclN0eWxlIChzdHJpbmc6IHN0cmluZywgc3R5bGU6IFNjYWxhclN0eWxlSWQsIGxheW91dDogUmV0dXJuVHlwZTx0eXBlb2Ygc2NhbGFyTGF5b3V0Pikge1xuICBjb25zdCB7IGluZGVudCwgYmxvY2tJbmRlbnQsIGxpbmVXaWR0aCB9ID0gbGF5b3V0XG5cbiAgc3dpdGNoIChzdHlsZSkge1xuICAgIGNhc2UgU1RZTEVfUExBSU46XG4gICAgICByZXR1cm4gZW5jb2RlRmxvd0JyZWFrcyhzdHJpbmcsIGluZGVudClcbiAgICBjYXNlIFNUWUxFX1NJTkdMRTpcbiAgICAgIHJldHVybiBgJyR7ZW5jb2RlRmxvd0JyZWFrcyhzdHJpbmcsIGluZGVudCkucmVwbGFjZSgvJy9nLCBcIicnXCIpfSdgXG4gICAgY2FzZSBTVFlMRV9MSVRFUkFMOlxuICAgICAgcmV0dXJuICd8JyArIGJsb2NrSGVhZGVyKHN0cmluZywgYmxvY2tJbmRlbnQpICtcbiAgICAgICAgZHJvcEVuZGluZ05ld2xpbmUoaW5kZW50U3RyaW5nKHN0cmluZywgaW5kZW50KSlcbiAgICBjYXNlIFNUWUxFX0ZPTERFRDpcbiAgICAgIHJldHVybiAnPicgKyBibG9ja0hlYWRlcihzdHJpbmcsIGJsb2NrSW5kZW50KSArXG4gICAgICAgIGRyb3BFbmRpbmdOZXdsaW5lKGluZGVudFN0cmluZyhmb2xkQmxvY2tTY2FsYXIoc3RyaW5nLCBsaW5lV2lkdGgpLCBpbmRlbnQpKVxuICAgIGNhc2UgU1RZTEVfRE9VQkxFOlxuICAgICAgcmV0dXJuIGBcIiR7ZXNjYXBlU3RyaW5nKHN0cmluZyl9XCJgXG4gIH1cbn1cblxuLy8gUGlja3MgdGhlIHNjYWxhciBzdHlsZSBmb3IgYG5vZGVgOiBhIHN0eWxlIGhpbnQgY2FycmllZCBvbiB0aGUgbm9kZSB3aW5zLFxuLy8gb3RoZXJ3aXNlIHRoZSBzdHlsZSBjaG9zZW4gYnkgdGhlIG1hY2hpbmVyeS4gUmV0dXJucyBhIG51bWVyaWMgU1RZTEVfKi5cbmZ1bmN0aW9uIHJlc29sdmVTY2FsYXJTdHlsZSAoc3RhdGU6IFByZXNlbnRlclN0YXRlLCBub2RlOiBTY2FsYXJOb2RlLFxuICBsYXlvdXQ6IFJldHVyblR5cGU8dHlwZW9mIHNjYWxhckxheW91dD4sIGlza2V5OiBib29sZWFuLCBpbmJsb2NrOiBib29sZWFuKTogU2NhbGFyU3R5bGVJZCB7XG4gIC8vIFdpdGhvdXQga25vd2luZyBpZiBrZXlzIGFyZSBpbXBsaWNpdC9leHBsaWNpdCwgYXNzdW1lIGltcGxpY2l0IGZvciBzYWZldHkuXG4gIGNvbnN0IHNpbmdsZUxpbmVPbmx5ID0gaXNrZXkgfHwgIWluYmxvY2tcblxuICAvLyBTdHlsZSBoaW50cyBjYXJyaWVkIG9uIHRoZSBub2RlIHRha2UgcHJlY2VkZW5jZS4gVGhleSB3ZXJlIHZhbGlkIGluIHRoZWlyXG4gIC8vIG9yaWdpbmFsIGNvbnRleHQ7IG9ubHkgYSBwYXJlbnQgY2hhbmdlIGNhbiBicmVhayB0aGVtLCBhbmQgb25seSBibG9ja1xuICAvLyBzdHlsZXMgaW4gYSBzaW5nbGUtbGluZSBjb250ZXh0IOKAlCBxdW90ZWQgc3R5bGVzIHN1cnZpdmUgYW55IGNvbnRleHQuIEFcbiAgLy8gcmVqZWN0ZWQgYmxvY2sgaGludCBmYWxscyB0aHJvdWdoIHRvIHNlbGVjdGlvbiBieSBjb250ZW50IGJlbG93LlxuICBpZiAobm9kZS5zdHlsZS5zaW5nbGVRdW90ZWQpIHJldHVybiBTVFlMRV9TSU5HTEVcbiAgaWYgKG5vZGUuc3R5bGUuZG91YmxlUXVvdGVkKSByZXR1cm4gU1RZTEVfRE9VQkxFXG4gIGlmICghc2luZ2xlTGluZU9ubHkpIHtcbiAgICBpZiAobm9kZS5zdHlsZS5saXRlcmFsKSByZXR1cm4gU1RZTEVfTElURVJBTFxuICAgIGlmIChub2RlLnN0eWxlLmZvbGRlZCkgcmV0dXJuIFNUWUxFX0ZPTERFRFxuICB9XG5cbiAgY29uc3Qgc3RyaW5nID0gbm9kZS52YWx1ZVxuXG4gIGlmIChzdHJpbmcubGVuZ3RoID09PSAwKSB7XG4gICAgLy8gQW4gZW1wdHkgc2NhbGFyIGlzIHNhZmUgd2hlbiBpdHMgdGFnIGlzIGV4cGxpY2l0IG9yIHJlc29sdmVzIGJhY2sgdG8gdGhlXG4gICAgLy8gbm9kZSB0YWcgKG5vdGFibHksIHRoZSBkZWZhdWx0IG51bGwgcmVwcmVzZW50YXRpb24pLiBBIHJlYWwgZW1wdHkgc3RyaW5nXG4gICAgLy8gZG9lcyBuZWl0aGVyIGFuZCB0aGVyZWZvcmUgcmVtYWlucyBxdW90ZWQuXG4gICAgaWYgKG5vZGUuc3R5bGUudGFnZ2VkIHx8IHJlc29sdmVJbXBsaWNpdFRhZyhzdGF0ZSwgc3RyaW5nKSA9PT0gbm9kZS50YWcpIHJldHVybiBTVFlMRV9QTEFJTlxuICAgIHJldHVybiBzdGF0ZS5xdW90ZVN0eWxlID09PSAnZG91YmxlJyA/IFNUWUxFX0RPVUJMRSA6IFNUWUxFX1NJTkdMRVxuICB9XG5cbiAgLy8gdjQncyBmb3JjZVF1b3RlcyBkZWxpYmVyYXRlbHkgZXhjbHVkZWQga2V5cy4gS2V5cyBhcmUgc3RpbGwgcXVvdGVkIHdoZW5cbiAgLy8gc3ludGF4IG9yIHRhZyByZXNvbHV0aW9uIHJlcXVpcmVzIGl0LCB1c2luZyBxdW90ZVN0eWxlIGFzIHRoZSBwcmVmZXJlbmNlLlxuICBjb25zdCBzdHlsZSA9IGNob29zZVNjYWxhclN0eWxlKFxuICAgIHN0YXRlLCBzdHJpbmcsIGxheW91dCwgc2luZ2xlTGluZU9ubHksIHN0YXRlLmZvcmNlUXVvdGVzICYmICFpc2tleSwgaW5ibG9jaylcblxuICAvLyBQbGFpbiB3cml0ZXMgbm8gdGFnLCBzbyBpdCByb3VuZC10cmlwcyBvbmx5IGlmIHRoZSBiYXJlIHRleHQgcmVzb2x2ZXMgYmFja1xuICAvLyB0byB0aGUgbm9kZSdzIHRhZyAob3IgdGhlIHRhZyBnZXRzIHByaW50ZWQgZXhwbGljaXRseSkuIEVsc2UgZG93bmdyYWRlLlxuICAvLyBEb3duZ3JhZGUgdG8gdGhlIHByZWZlcnJlZCBxdW90ZSBzdHlsZSBoZXJlLlxuICBpZiAoc3R5bGUgPT09IFNUWUxFX1BMQUlOICYmICFub2RlLnN0eWxlLnRhZ2dlZCAmJiByZXNvbHZlSW1wbGljaXRUYWcoc3RhdGUsIHN0cmluZykgIT09IG5vZGUudGFnKSB7XG4gICAgcmV0dXJuIHN0YXRlLnF1b3RlU3R5bGUgPT09ICdkb3VibGUnID8gU1RZTEVfRE9VQkxFIDogU1RZTEVfU0lOR0xFXG4gIH1cbiAgcmV0dXJuIHN0eWxlXG59XG5cbi8vIFByZS1jb25kaXRpb25zOiBzdHJpbmcgaXMgdmFsaWQgZm9yIGEgYmxvY2sgc2NhbGFyLCAxIDw9IGluZGVudFBlckxldmVsIDw9IDkuXG5mdW5jdGlvbiBibG9ja0hlYWRlciAoc3RyaW5nOiBzdHJpbmcsIGluZGVudFBlckxldmVsOiBudW1iZXIpIHtcbiAgY29uc3QgaW5kZW50SW5kaWNhdG9yID0gbmVlZEluZGVudEluZGljYXRvcihzdHJpbmcpID8gU3RyaW5nKGluZGVudFBlckxldmVsKSA6ICcnXG5cbiAgLy8gbm90ZSB0aGUgc3BlY2lhbCBjYXNlOiB0aGUgc3RyaW5nICdcXG4nIGNvdW50cyBhcyBhIFwidHJhaWxpbmdcIiBlbXB0eSBsaW5lLlxuICBjb25zdCBjbGlwID0gc3RyaW5nW3N0cmluZy5sZW5ndGggLSAxXSA9PT0gJ1xcbidcbiAgY29uc3Qga2VlcCA9IGNsaXAgJiYgKHN0cmluZ1tzdHJpbmcubGVuZ3RoIC0gMl0gPT09ICdcXG4nIHx8IHN0cmluZyA9PT0gJ1xcbicpXG4gIGNvbnN0IGNob21wID0ga2VlcCA/ICcrJyA6IChjbGlwID8gJycgOiAnLScpXG5cbiAgcmV0dXJuIGAke2luZGVudEluZGljYXRvcn0ke2Nob21wfVxcbmBcbn1cblxuLy8gRmxvdyBzY2FsYXJzIChwbGFpbiwgc2luZ2xlLXF1b3RlZCkgZm9sZCBsaW5lIGJyZWFrczogYSBydW4gb2YgayBzb3VyY2UgbGluZVxuLy8gYnJlYWtzIHJlcGFyc2VzIHRvIGstMSBsaXRlcmFsIGBcXG5gLiBTbyBhIHNpbmdsZSBicmVhayBpcyBqdXN0IGxpbmUtd3JhcHBpbmdcbi8vIChmb2xkcyBiYWNrIHRvIGEgc3BhY2UpLCB3aGlsZSBhIGxpdGVyYWwgYFxcbmAgaW4gdGhlIHZhbHVlIG11c3QgYmUgZW1pdHRlZCBhc1xuLy8gYSBibGFuayBsaW5lICh0d28gYnJlYWtzKS4gRW5jb2RlIGVhY2ggcnVuIG9mIHAgbGl0ZXJhbCBgXFxuYCBhcyBwKzEgYnJlYWtzIGFuZFxuLy8gaW5kZW50IHRoZSBmb2xsb3dpbmcgY29udGVudCBsaW5lIHNvIHRoZSBjb250aW51YXRpb24gaXNuJ3QgcmVhZCBhcyBhIG5ldyBub2RlXG4vLyAoYSBiYXJlIGJyZWFrIHdvdWxkIHlpZWxkIGludmFsaWQgXCJkZWZpY2llbnQgaW5kZW50YXRpb25cIiBvdXRwdXQpLlxuLy8gYGZvbGRCbG9ja1NjYWxhcmAgY2FuJ3QgYmUgcmV1c2VkIGhlcmU6IGl0IHRyZWF0cyBhIGxlYWRpbmcgc3BhY2UgYXMgYVxuLy8gXCJtb3JlLWluZGVudGVkXCIgbGluZSBhbmQgc3VwcHJlc3NlcyB0aGUgZG91YmxpbmcsIHdoaWNoIGEgZmxvdyBzY2FsYXIgbXVzdCBub3QuXG5mdW5jdGlvbiBlbmNvZGVGbG93QnJlYWtzIChzdHJpbmc6IHN0cmluZywgaW5kZW50OiBudW1iZXIpIHtcbiAgbGV0IG5leHRMRiA9IHN0cmluZy5pbmRleE9mKCdcXG4nKVxuICBpZiAobmV4dExGID09PSAtMSkgcmV0dXJuIHN0cmluZ1xuXG4gIGNvbnN0IHBhZCA9ICcgJy5yZXBlYXQoaW5kZW50KVxuICBsZXQgcmVzdWx0ID0gc3RyaW5nLnNsaWNlKDAsIG5leHRMRikgLy8gZmlyc3QgbGluZSBmb2xsb3dzIHRoZSBxdW90ZSwgbm8gaW5kZW50XG5cbiAgY29uc3QgbGluZVJlID0gLyhcXG4rKShbXlxcbl0qKS9nXG4gIGxpbmVSZS5sYXN0SW5kZXggPSBuZXh0TEZcbiAgbGV0IG1hdGNoXG4gIHdoaWxlICgobWF0Y2ggPSBsaW5lUmUuZXhlYyhzdHJpbmcpKSkge1xuICAgIGNvbnN0IGJyZWFrcyA9IG1hdGNoWzFdLmxlbmd0aFxuICAgIGNvbnN0IGxpbmUgPSBtYXRjaFsyXVxuICAgIC8vIGxpbmUgPT09ICcnIG9ubHkgYXQgdGhlIGVuZCAodGhlIGdyZWVkeSBcXG4rIGxlYXZlcyBubyBlbXB0eSBsaW5lIG1pZC1zdHJpbmcpO1xuICAgIC8vIHBhZCBpdCBzbyB0aGUgY2xvc2luZyBxdW90ZSBjYXJyaWVzIGluZGVudCBpbnN0ZWFkIG9mIHNpdHRpbmcgYXQgY29sdW1uIDAuXG4gICAgcmVzdWx0ICs9ICdcXG4nLnJlcGVhdChicmVha3MgKyAxKSArIHBhZCArIGxpbmVcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuLy8gU3RyaXBzIG9uZSB0cmFpbGluZyBuZXdsaW5lIGZyb20gYSBibG9jayBzY2FsYXI6IHRoZSBkdW1wZXIgYWRkcyBpdHMgb3duLFxuLy8gc28gd2l0aG91dCB0aGlzIGEgXCIrXCIgKGtlZXApIGNob21wIHdvdWxkIGdhaW4gYW4gZXh0cmEgYmxhbmsgbGluZS5cbmZ1bmN0aW9uIGRyb3BFbmRpbmdOZXdsaW5lIChzdHJpbmc6IHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nW3N0cmluZy5sZW5ndGggLSAxXSA9PT0gJ1xcbicgPyBzdHJpbmcuc2xpY2UoMCwgLTEpIDogc3RyaW5nXG59XG5cbi8vIE5vdGU6IGEgbG9uZyBsaW5lIHdpdGhvdXQgYSBzdWl0YWJsZSBicmVhayBwb2ludCB3aWxsIGV4Y2VlZCB0aGUgd2lkdGggbGltaXQuXG4vLyBQcmUtY29uZGl0aW9uczogZXZlcnkgY2hhciBpbiBzdHIgaXNQcmludGFibGUsIHN0ci5sZW5ndGggPiAwLCB3aWR0aCA+IDAuXG5mdW5jdGlvbiBmb2xkQmxvY2tTY2FsYXIgKHN0cmluZzogc3RyaW5nLCB3aWR0aDogbnVtYmVyKSB7XG4gIC8vIEluIGZvbGRlZCBzdHlsZSwgJGskIGNvbnNlY3V0aXZlIG5ld2xpbmVzIG91dHB1dCBhcyAkaysxJCBuZXdsaW5lc+KAlFxuICAvLyB1bmxlc3MgdGhleSdyZSBiZWZvcmUgb3IgYWZ0ZXIgYSBtb3JlLWluZGVudGVkIGxpbmUsIG9yIGF0IHRoZSB2ZXJ5XG4gIC8vIGJlZ2lubmluZyBvciBlbmQsIGluIHdoaWNoIGNhc2UgJGskIG1hcHMgdG8gJGskLlxuICAvLyBUaGVyZWZvcmUsIHBhcnNlIGVhY2ggY2h1bmsgYXMgbmV3bGluZShzKSBmb2xsb3dlZCBieSBhIGNvbnRlbnQgbGluZS5cbiAgY29uc3QgbGluZVJlID0gLyhcXG4rKShbXlxcbl0qKS9nXG5cbiAgLy8gZmlyc3QgbGluZSAocG9zc2libHkgYW4gZW1wdHkgbGluZSlcbiAgbGV0IG5leHRMRiA9IHN0cmluZy5pbmRleE9mKCdcXG4nKVxuICBpZiAobmV4dExGID09PSAtMSkgbmV4dExGID0gc3RyaW5nLmxlbmd0aFxuICBsaW5lUmUubGFzdEluZGV4ID0gbmV4dExGXG4gIGxldCByZXN1bHQgPSBmb2xkTGluZShzdHJpbmcuc2xpY2UoMCwgbmV4dExGKSwgd2lkdGgpXG4gIC8vIElmIHdlIGhhdmVuJ3QgcmVhY2hlZCB0aGUgZmlyc3QgY29udGVudCBsaW5lIHlldCwgZG9uJ3QgYWRkIGFuIGV4dHJhIFxcbi5cbiAgbGV0IHByZXZNb3JlSW5kZW50ZWQgPSBzdHJpbmdbMF0gPT09ICdcXG4nIHx8IHN0cmluZ1swXSA9PT0gJyAnXG4gIGxldCBtb3JlSW5kZW50ZWRcblxuICAvLyByZXN0IG9mIHRoZSBsaW5lc1xuICBsZXQgbWF0Y2hcbiAgd2hpbGUgKChtYXRjaCA9IGxpbmVSZS5leGVjKHN0cmluZykpKSB7XG4gICAgY29uc3QgcHJlZml4ID0gbWF0Y2hbMV1cbiAgICBjb25zdCBsaW5lID0gbWF0Y2hbMl1cblxuICAgIG1vcmVJbmRlbnRlZCA9IChsaW5lWzBdID09PSAnICcpXG4gICAgcmVzdWx0ICs9IHByZWZpeCArXG4gICAgICAoKCFwcmV2TW9yZUluZGVudGVkICYmICFtb3JlSW5kZW50ZWQgJiYgbGluZSAhPT0gJycpID8gJ1xcbicgOiAnJykgK1xuICAgICAgZm9sZExpbmUobGluZSwgd2lkdGgpXG4gICAgcHJldk1vcmVJbmRlbnRlZCA9IG1vcmVJbmRlbnRlZFxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG4vLyBHcmVlZHkgbGluZSBicmVha2luZy5cbi8vIFBpY2tzIHRoZSBsb25nZXN0IGxpbmUgdW5kZXIgdGhlIGxpbWl0IGVhY2ggdGltZSxcbi8vIG90aGVyd2lzZSBzZXR0bGVzIGZvciB0aGUgc2hvcnRlc3QgbGluZSBvdmVyIHRoZSBsaW1pdC5cbi8vIE5CLiBNb3JlLWluZGVudGVkIGxpbmVzICpjYW5ub3QqIGJlIGZvbGRlZCwgYXMgdGhhdCB3b3VsZCBhZGQgYW4gZXh0cmEgXFxuLlxuZnVuY3Rpb24gZm9sZExpbmUgKGxpbmU6IHN0cmluZywgd2lkdGg6IG51bWJlcikge1xuICBpZiAobGluZSA9PT0gJycgfHwgbGluZVswXSA9PT0gJyAnKSByZXR1cm4gbGluZVxuXG4gIC8vIFNpbmNlIGEgbW9yZS1pbmRlbnRlZCBsaW5lIGFkZHMgYSBcXG4sIGJyZWFrcyBjYW4ndCBiZSBmb2xsb3dlZCBieSBhIHNwYWNlLlxuICBjb25zdCBicmVha1JlID0gLyBbXiBdL2cgLy8gbm90ZTogdGhlIG1hdGNoIGluZGV4IHdpbGwgYWx3YXlzIGJlIDw9IGxlbmd0aC0yLlxuICBsZXQgbWF0Y2hcbiAgLy8gc3RhcnQgaXMgYW4gaW5jbHVzaXZlIGluZGV4LiBlbmQsIGN1cnIsIGFuZCBuZXh0IGFyZSBleGNsdXNpdmUuXG4gIGxldCBzdGFydCA9IDBcbiAgbGV0IGVuZFxuICBsZXQgY3VyciA9IDBcbiAgbGV0IG5leHQgPSAwXG4gIGxldCByZXN1bHQgPSAnJ1xuXG4gIC8vIEludmFyaWFudHM6IDAgPD0gc3RhcnQgPD0gbGVuZ3RoLTEuXG4gIC8vICAgMCA8PSBjdXJyIDw9IG5leHQgPD0gbWF4KDAsIGxlbmd0aC0yKS4gY3VyciAtIHN0YXJ0IDw9IHdpZHRoLlxuICAvLyBJbnNpZGUgdGhlIGxvb3A6XG4gIC8vICAgQSBtYXRjaCBpbXBsaWVzIGxlbmd0aCA+PSAyLCBzbyBjdXJyIGFuZCBuZXh0IGFyZSA8PSBsZW5ndGgtMi5cbiAgd2hpbGUgKChtYXRjaCA9IGJyZWFrUmUuZXhlYyhsaW5lKSkpIHtcbiAgICBuZXh0ID0gbWF0Y2guaW5kZXhcbiAgICAvLyBtYWludGFpbiBpbnZhcmlhbnQ6IGN1cnIgLSBzdGFydCA8PSB3aWR0aFxuICAgIGlmIChuZXh0IC0gc3RhcnQgPiB3aWR0aCkge1xuICAgICAgZW5kID0gKGN1cnIgPiBzdGFydCkgPyBjdXJyIDogbmV4dCAvLyBkZXJpdmUgZW5kIDw9IGxlbmd0aC0yXG4gICAgICByZXN1bHQgKz0gYFxcbiR7bGluZS5zbGljZShzdGFydCwgZW5kKX1gXG4gICAgICAvLyBza2lwIHRoZSBzcGFjZSB0aGF0IHdhcyBvdXRwdXQgYXMgXFxuXG4gICAgICBzdGFydCA9IGVuZCArIDEgICAgICAgICAgICAgICAgICAgIC8vIGRlcml2ZSBzdGFydCA8PSBsZW5ndGgtMVxuICAgIH1cbiAgICBjdXJyID0gbmV4dFxuICB9XG5cbiAgLy8gQnkgdGhlIGludmFyaWFudHMsIHN0YXJ0IDw9IGxlbmd0aC0xLCBzbyB0aGVyZSBpcyBzb21ldGhpbmcgbGVmdCBvdmVyLlxuICAvLyBJdCBpcyBlaXRoZXIgdGhlIHdob2xlIHN0cmluZyBvciBhIHBhcnQgc3RhcnRpbmcgZnJvbSBub24td2hpdGVzcGFjZS5cbiAgcmVzdWx0ICs9ICdcXG4nXG4gIC8vIEluc2VydCBhIGJyZWFrIGlmIHRoZSByZW1haW5kZXIgaXMgdG9vIGxvbmcgYW5kIHRoZXJlIGlzIGEgYnJlYWsgYXZhaWxhYmxlLlxuICBpZiAobGluZS5sZW5ndGggLSBzdGFydCA+IHdpZHRoICYmIGN1cnIgPiBzdGFydCkge1xuICAgIHJlc3VsdCArPSBgJHtsaW5lLnNsaWNlKHN0YXJ0LCBjdXJyKX1cXG4ke2xpbmUuc2xpY2UoY3VyciArIDEpfWBcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgKz0gbGluZS5zbGljZShzdGFydClcbiAgfVxuXG4gIHJldHVybiByZXN1bHQuc2xpY2UoMSkgLy8gZHJvcCBleHRyYSBcXG4gam9pbmVyXG59XG5cbmZ1bmN0aW9uIGVzY2FwZVN0cmluZyAoc3RyaW5nOiBzdHJpbmcpIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGxldCBjaGFyID0gMFxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgY2hhciA+PSAweDEwMDAwID8gaSArPSAyIDogaSsrKSB7XG4gICAgY2hhciA9IGNvZGVQb2ludEF0KHN0cmluZywgaSlcbiAgICBjb25zdCBlc2NhcGVTZXEgPSBFU0NBUEVfU0VRVUVOQ0VTW2NoYXJdXG5cbiAgICBpZiAoZXNjYXBlU2VxKSB7XG4gICAgICByZXN1bHQgKz0gZXNjYXBlU2VxXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIGlmIChpc1ByaW50YWJsZShjaGFyKSkge1xuICAgICAgcmVzdWx0ICs9IHN0cmluZ1tpXVxuICAgICAgaWYgKGNoYXIgPj0gMHgxMDAwMCkgcmVzdWx0ICs9IHN0cmluZ1tpICsgMV1cbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgcmVzdWx0ICs9IGVuY29kZU5vblByaW50YWJsZShjaGFyKVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb3dTZXF1ZW5jZSAoc3RhdGU6IFByZXNlbnRlclN0YXRlLCBsZXZlbDogbnVtYmVyLCBub2RlOiBTZXF1ZW5jZU5vZGUpIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG5cbiAgZm9yIChsZXQgaW5kZXggPSAwLCBsZW5ndGggPSBub2RlLml0ZW1zLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCBpdGVtID0gd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCwgbm9kZS5pdGVtc1tpbmRleF0sIHt9KVxuICAgIGlmIChyZXN1bHQgIT09ICcnKSByZXN1bHQgKz0gYCwkeyFzdGF0ZS5mbG93U2tpcENvbW1hU3BhY2UgPyAnICcgOiAnJ31gXG4gICAgcmVzdWx0ICs9IGl0ZW1cbiAgfVxuXG4gIGNvbnN0IHBhZCA9IHN0YXRlLmZsb3dCcmFja2V0UGFkZGluZyAmJiByZXN1bHQgIT09ICcnID8gJyAnIDogJydcbiAgcmV0dXJuIGBbJHtwYWR9JHtyZXN1bHR9JHtwYWR9XWBcbn1cblxuZnVuY3Rpb24gd3JpdGVCbG9ja1NlcXVlbmNlIChzdGF0ZTogUHJlc2VudGVyU3RhdGUsIGxldmVsOiBudW1iZXIsIG5vZGU6IFNlcXVlbmNlTm9kZSwgY29tcGFjdDogYm9vbGVhbikge1xuICBsZXQgcmVzdWx0ID0gJydcblxuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IG5vZGUuaXRlbXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGNvbnN0IGl0ZW0gPSB3cml0ZU5vZGUoc3RhdGUsIGxldmVsICsgMSwgbm9kZS5pdGVtc1tpbmRleF0sXG4gICAgICB7IGJsb2NrOiB0cnVlLCBjb21wYWN0OiBzdGF0ZS5zZXFJbmxpbmVGaXJzdCwgaXNibG9ja3NlcTogdHJ1ZSB9KVxuXG4gICAgaWYgKCFjb21wYWN0IHx8IHJlc3VsdCAhPT0gJycpIHtcbiAgICAgIHJlc3VsdCArPSBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlLCBsZXZlbClcbiAgICB9XG5cbiAgICAvLyBObyB0cmFpbGluZyBzcGFjZSB3aGVuIHRoZSB2YWx1ZSByZW5kZXJzIGVtcHR5IChlLmcuIG51bGwg4oaSICcnKS5cbiAgICBpZiAoaXRlbSA9PT0gJycgfHwgQ0hBUl9MSU5FX0ZFRUQgPT09IGl0ZW0uY2hhckNvZGVBdCgwKSkge1xuICAgICAgcmVzdWx0ICs9ICctJ1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgKz0gJy0gJ1xuICAgIH1cblxuICAgIHJlc3VsdCArPSBpdGVtXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIHdyaXRlRmxvd01hcHBpbmcgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgbGV2ZWw6IG51bWJlciwgbm9kZTogTWFwcGluZ05vZGUpIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGNvbnN0IGl0ZW1zID0gc29ydE1hcHBpbmdJdGVtcyhzdGF0ZSwgbm9kZS5pdGVtcylcblxuICBmb3IgKGNvbnN0IHsga2V5LCB2YWx1ZSB9IG9mIGl0ZW1zKSB7XG4gICAgbGV0IHBhaXJCdWZmZXIgPSAnJ1xuICAgIGlmIChyZXN1bHQgIT09ICcnKSBwYWlyQnVmZmVyICs9IGAsJHshc3RhdGUuZmxvd1NraXBDb21tYVNwYWNlID8gJyAnIDogJyd9YFxuXG4gICAgY29uc3Qga2V5VGV4dCA9IHdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwsIGtleSwgeyBpc2tleTogdHJ1ZSB9KVxuICAgIGNvbnN0IGV4cGxpY2l0UGFpciA9IGtleVRleHQubGVuZ3RoID4gMTAyNFxuXG4gICAgaWYgKGV4cGxpY2l0UGFpcikge1xuICAgICAgcGFpckJ1ZmZlciArPSAnPyAnXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5xdW90ZUZsb3dLZXlzKSB7XG4gICAgICBwYWlyQnVmZmVyICs9ICdcIidcbiAgICB9XG5cbiAgICBjb25zdCB2YWx1ZVRleHQgPSB3cml0ZU5vZGUoc3RhdGUsIGxldmVsLCB2YWx1ZSwge30pXG4gICAgLy8gTm8gc2VwYXJhdGluZyBzcGFjZSB3aGVuIHRoZSB2YWx1ZSByZW5kZXJzIGVtcHR5IChlLmcuIG51bGwg4oaSICcnKS5cbiAgICBjb25zdCBzZXAgPSBzdGF0ZS5mbG93U2tpcENvbG9uU3BhY2UgfHwgdmFsdWVUZXh0ID09PSAnJyA/ICcnIDogJyAnXG5cbiAgICBwYWlyQnVmZmVyICs9IGAke2tleVRleHR9JHtzdGF0ZS5xdW90ZUZsb3dLZXlzICYmICFleHBsaWNpdFBhaXIgPyAnXCInIDogJyd9OiR7c2VwfSR7dmFsdWVUZXh0fWBcblxuICAgIHJlc3VsdCArPSBwYWlyQnVmZmVyXG4gIH1cblxuICBjb25zdCBwYWQgPSBzdGF0ZS5mbG93QnJhY2tldFBhZGRpbmcgJiYgcmVzdWx0ICE9PSAnJyA/ICcgJyA6ICcnXG4gIHJldHVybiBgeyR7cGFkfSR7cmVzdWx0fSR7cGFkfX1gXG59XG5cbi8vIEEgc2NhbGFyIGtleSBzb3J0cyBieSBpdHMgdGV4dDsgdGhlIGRlZmF1bHQgc29ydCBhbmQgYSBjdXN0b20gY29tcGFyYXRvciBib3RoXG4vLyBzZWUgdGhhdCwgbWF0Y2hpbmcgdGhlIG9yaWdpbmFsIGtleXMtYXJyYXkgc29ydC5cbmZ1bmN0aW9uIHNvcnRLZXlWYWx1ZSAoa2V5OiBOb2RlKTogYW55IHtcbiAgcmV0dXJuIGtleS5raW5kID09PSAnc2NhbGFyJyA/IGtleS52YWx1ZSA6IGtleVxufVxuXG5mdW5jdGlvbiBzb3J0TWFwcGluZ0l0ZW1zIChzdGF0ZTogUHJlc2VudGVyU3RhdGUsIGl0ZW1zOiBNYXBwaW5nTm9kZVsnaXRlbXMnXSkge1xuICBpZiAoIXN0YXRlLnNvcnRLZXlzKSByZXR1cm4gaXRlbXNcblxuICBjb25zdCBjb3B5ID0gaXRlbXMuc2xpY2UoKVxuXG4gIGlmIChzdGF0ZS5zb3J0S2V5cyA9PT0gdHJ1ZSkge1xuICAgIGNvcHkuc29ydCgoYSwgYikgPT4ge1xuICAgICAgY29uc3QgeCA9IHNvcnRLZXlWYWx1ZShhLmtleSlcbiAgICAgIGNvbnN0IHkgPSBzb3J0S2V5VmFsdWUoYi5rZXkpXG4gICAgICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICAgICAgaWYgKHggPiB5KSByZXR1cm4gMVxuICAgICAgcmV0dXJuIDBcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGZuID0gc3RhdGUuc29ydEtleXNcbiAgICBjb3B5LnNvcnQoKGEsIGIpID0+IGZuKHNvcnRLZXlWYWx1ZShhLmtleSksIHNvcnRLZXlWYWx1ZShiLmtleSkpKVxuICB9XG5cbiAgcmV0dXJuIGNvcHlcbn1cblxuZnVuY3Rpb24gd3JpdGVCbG9ja01hcHBpbmcgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgbGV2ZWw6IG51bWJlciwgbm9kZTogTWFwcGluZ05vZGUsIGNvbXBhY3Q6IGJvb2xlYW4pIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGNvbnN0IGl0ZW1zID0gc29ydE1hcHBpbmdJdGVtcyhzdGF0ZSwgbm9kZS5pdGVtcylcblxuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IGl0ZW1zLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBsZXQgcGFpckJ1ZmZlciA9ICcnXG5cbiAgICBpZiAoIWNvbXBhY3QgfHwgcmVzdWx0ICE9PSAnJykge1xuICAgICAgcGFpckJ1ZmZlciArPSBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlLCBsZXZlbClcbiAgICB9XG5cbiAgICBjb25zdCB7IGtleSwgdmFsdWUgfSA9IGl0ZW1zW2luZGV4XVxuXG4gICAgLy8gQSBibG9jayBrZXkg4oCUIGEgYmxvY2sgY29sbGVjdGlvbiAobWFwcGluZy9zZXF1ZW5jZSkgb3IgYSBibG9jayBzY2FsYXJcbiAgICAvLyAobGl0ZXJhbC9mb2xkZWQpIOKAlCBjYW4ndCBzaXQgb24gYSBga2V5OmAgbGluZSwgc28gaXQncyB3cml0dGVuIHdpdGggYmxvY2tcbiAgICAvLyBjb250ZXh0IGFuZCB0aGUgcGFpciB0YWtlcyB0aGUgZXhwbGljaXQgYD8ga2V5IC8gOiB2YWx1ZWAgZm9ybS4gQSBzaW1wbGVcbiAgICAvLyBzY2FsYXIga2V5IHN0YXlzIGlubGluZSAoZmxvdy12cy1ibG9jayBpcyBpbnZpc2libGUgdGhlcmUpLlxuICAgIGNvbnN0IGtleUlzQmxvY2sgPVxuICAgICAgKChrZXkua2luZCA9PT0gJ21hcHBpbmcnIHx8IGtleS5raW5kID09PSAnc2VxdWVuY2UnKSAmJlxuICAgICAgICAha2V5LnN0eWxlLmZsb3cgJiYga2V5Lml0ZW1zLmxlbmd0aCAhPT0gMCkgfHxcbiAgICAgIChrZXkua2luZCA9PT0gJ3NjYWxhcicgJiYgKGtleS5zdHlsZS5saXRlcmFsIHx8IGtleS5zdHlsZS5mb2xkZWQpKVxuXG4gICAgLy8gVGhlIGA/YC9gOmAgaW5kaWNhdG9ycyBzaGlmdCBjb250ZW50IHJpZ2h0IGxpa2UgYSBgLWAsIHNvIGEgYmxvY2sga2V5IG9yXG4gICAgLy8gdmFsdWUgdGhhdCBzdGF5cyBvbiB0aGUgaW5kaWNhdG9yIGxpbmUga2VlcHMgaXRzIGluZGVudGF0aW9uIHVuZGVyXG4gICAgLy8gc2VxTm9JbmRlbnQgKGBpc2Jsb2Nrc2VxYCkuIE9uZSB0aGF0IGRyb3BzIHRvIGl0cyBvd24gbGluZSAodGFnL2FuY2hvcilcbiAgICAvLyBjb2xsYXBzZXMgdG8gdGhlIHBhcmVudCBpbmRlbnQsIHNvIGxlYXZlIHRoZSBmbGFnIG9mZiB0aGVyZS5cbiAgICBjb25zdCBrZXlUZXh0ID0ga2V5SXNCbG9ja1xuICAgICAgPyB3cml0ZU5vZGUoc3RhdGUsIGxldmVsICsgMSwga2V5LFxuICAgICAgICB7IGJsb2NrOiB0cnVlLCBjb21wYWN0OiB0cnVlLCBpc2Jsb2Nrc2VxOiAhY2Fubm90QmVDb21wYWN0KHN0YXRlLCBrZXksIGxldmVsICsgMSkgfSlcbiAgICAgIDogd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCArIDEsIGtleSwgeyBibG9jazogdHJ1ZSwgY29tcGFjdDogdHJ1ZSwgaXNrZXk6IHRydWUgfSlcblxuICAgIC8vIEJsb2NrIGtleSwgb3Zlci1sb25nIGtleSwgb3IgbXVsdGlsaW5lIHNjYWxhciBrZXkgZm9yY2VzIGV4cGxpY2l0IGZvcm0uXG4gICAgLy8gTXVsdGlsaW5lIGlzbid0IGEgc3BlYyByZXF1aXJlbWVudCDigJQganVzdCBtYXRjaGVzIHB5eWFtbCdzIHNpbXBsZS1rZXkgcnVsZS5cbiAgICBjb25zdCBrZXlIYXNMaW5lQnJlYWsgPSBrZXkua2luZCA9PT0gJ3NjYWxhcicgJiYga2V5LnZhbHVlLmluZGV4T2YoJ1xcbicpICE9PSAtMVxuICAgIGNvbnN0IGV4cGxpY2l0UGFpciA9IGtleUlzQmxvY2sgfHwga2V5SGFzTGluZUJyZWFrIHx8IGtleVRleHQubGVuZ3RoID4gMTAyNFxuXG4gICAgaWYgKGV4cGxpY2l0UGFpcikge1xuICAgICAgaWYgKGtleVRleHQgJiYgQ0hBUl9MSU5FX0ZFRUQgPT09IGtleVRleHQuY2hhckNvZGVBdCgwKSkge1xuICAgICAgICBwYWlyQnVmZmVyICs9ICc/J1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFpckJ1ZmZlciArPSAnPyAnXG4gICAgICB9XG4gICAgfVxuXG4gICAgcGFpckJ1ZmZlciArPSBrZXlUZXh0XG5cbiAgICBpZiAoZXhwbGljaXRQYWlyKSB7XG4gICAgICBwYWlyQnVmZmVyICs9IGdlbmVyYXRlTmV4dExpbmUoc3RhdGUsIGxldmVsKVxuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlVGV4dCA9IHdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwgKyAxLCB2YWx1ZSxcbiAgICAgIHsgYmxvY2s6IHRydWUsIGNvbXBhY3Q6IGV4cGxpY2l0UGFpciwgaXNibG9ja3NlcTogZXhwbGljaXRQYWlyICYmICFjYW5ub3RCZUNvbXBhY3Qoc3RhdGUsIHZhbHVlLCBsZXZlbCArIDEpIH0pXG5cbiAgICAvLyBLZWVwIGEgc3BhY2UgYmVmb3JlIHRoZSBjb2xvbiB3aGVuIHRoZSBrZXkgdGV4dCBlbmRzIGluIGEgbGVhZGluZ1xuICAgIC8vIHByb3BlcnR5IHJhdGhlciB0aGFuIHNjYWxhciBjb250ZW50LCBzbyB0aGUgY29sb24gY2FuJ3QgYmUgcmVhZCBhcyBwYXJ0XG4gICAgLy8gb2YgaXQuIFR3byBjYXNlczogYW4gaW5saW5lIGFsaWFzIGtleSAoYCpiIDogdmApLCBhbmQgYW4gZW1wdHkgc2NhbGFyIGtleVxuICAgIC8vIHdob3NlIHdob2xlIHRleHQgaXMgaXRzIGFuY2hvci90YWcgKGAmYSA6YCwgYCEhc3RyIDpgKSDigJQgd2l0aG91dCB0aGVcbiAgICAvLyBzcGFjZSBgJmE6YCByZXBhcnNlcyBhcyBhbiBhbmNob3JlZCB2YWx1ZSwgZHJvcHBpbmcgdGhlIG51bGwga2V5LlxuICAgIGNvbnN0IGtleUlzQmFyZVByb3BzID0ga2V5LmtpbmQgPT09ICdzY2FsYXInICYmIGtleS52YWx1ZSA9PT0gJycgJiZcbiAgICAgIGtleVRleHQgIT09ICcnICYmXG4gICAgICBrZXlUZXh0LmNoYXJDb2RlQXQoa2V5VGV4dC5sZW5ndGggLSAxKSAhPT0gQ0hBUl9TSU5HTEVfUVVPVEUgJiZcbiAgICAgIGtleVRleHQuY2hhckNvZGVBdChrZXlUZXh0Lmxlbmd0aCAtIDEpICE9PSBDSEFSX0RPVUJMRV9RVU9URVxuICAgIGNvbnN0IGtleUNvbG9uU2VwID0gIWV4cGxpY2l0UGFpciAmJiAoa2V5LmtpbmQgPT09ICdhbGlhcycgfHwga2V5SXNCYXJlUHJvcHMpID8gJyAnIDogJydcblxuICAgIC8vIE5vIHRyYWlsaW5nIHNwYWNlIHdoZW4gdGhlIHZhbHVlIHJlbmRlcnMgZW1wdHkgKGUuZy4gbnVsbCDihpIgJycpLlxuICAgIGlmICh2YWx1ZVRleHQgPT09ICcnIHx8IENIQVJfTElORV9GRUVEID09PSB2YWx1ZVRleHQuY2hhckNvZGVBdCgwKSkge1xuICAgICAgcGFpckJ1ZmZlciArPSBgJHtrZXlDb2xvblNlcH06YFxuICAgIH0gZWxzZSB7XG4gICAgICBwYWlyQnVmZmVyICs9IGAke2tleUNvbG9uU2VwfTogYFxuICAgIH1cblxuICAgIHBhaXJCdWZmZXIgKz0gdmFsdWVUZXh0XG5cbiAgICByZXN1bHQgKz0gcGFpckJ1ZmZlclxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG4vLyBXaGVyZSBhIG5vZGUgc2l0cyByZWxhdGl2ZSB0byBpdHMgcGFyZW50IOKAlCBkcml2ZXMgbGF5b3V0L3N0eWxlIGRlY2lzaW9ucy5cbi8vIEFsbCBmbGFncyBkZWZhdWx0IHRvIGZhbHNlICh0aGUgZmxvdy1jb250ZXh0LCBub24ta2V5LCBub24tY29tcGFjdCBjYXNlKS5cbmludGVyZmFjZSBOb2RlQ29udGV4dCB7XG4gIGJsb2NrPzogYm9vbGVhbiAgICAgIC8vIGJsb2NrIGNvbnRleHQgKHZzIGZsb3cpOyBwcm9wYWdhdGVzIGRvd253YXJkXG4gIGNvbXBhY3Q/OiBib29sZWFuICAgIC8vIG1heSBzdGFydCBvbiB0aGUgY3VycmVudCBsaW5lIChubyBsZWFkaW5nIG5ld2xpbmUpXG4gIGlza2V5PzogYm9vbGVhbiAgICAgIC8vIG5vZGUgaXMgYSBtYXBwaW5nIGtleVxuICBpc2Jsb2Nrc2VxPzogYm9vbGVhbiAvLyBjb250ZW50IGZvbGxvd3MgYW4gaW5kaWNhdG9yIChgLWAsIG9yIGA/YC9gOmAgaW4gYW5cbiAgICAgICAgICAgICAgICAgICAgICAgLy8gZXhwbGljaXQgcGFpcikgdGhhdCBhbHJlYWR5IHNoaWZ0ZWQgaXQgcmlnaHQ7IGtlZXBzXG4gICAgICAgICAgICAgICAgICAgICAgIC8vIGl0cyBpbmRlbnRhdGlvbiB1bmRlciBzZXFOb0luZGVudFxufVxuXG4vLyBBIG5vZGUgY2FuJ3Qgc2l0IGNvbXBhY3Qgb24gaXRzIHBhcmVudCdzIGluZGljYXRvciAoYC1gL2A/YC9gOmApIGxpbmUgd2hlbiBpdFxuLy8gY2FycmllcyBsZWFkaW5nIHByb3BzICh0YWcvYW5jaG9yKSB0aGF0IHdvdWxkIGNvbGxpZGUgd2l0aCB0aGUgaW5kaWNhdG9yLCBvclxuLy8gd2hlbiB0aGUgaW5kZW50IHN0ZXAgaXMgdG9vIG5hcnJvdyBmb3IgdGhlIDItY2hhciBpbmRpY2F0b3IuIFN1Y2ggYSBub2RlIGRyb3BzXG4vLyB0byBpdHMgb3duIGxpbmU7IGEgYmxvY2sgY29sbGVjdGlvbiB0aGF0IGRvZXMgc28gYWxzbyBjb2xsYXBzZXMgaXRzIHNlcU5vSW5kZW50XG4vLyBpbmRlbnRhdGlvbiBiYWNrIHRvIHRoZSBwYXJlbnQuXG5mdW5jdGlvbiBjYW5ub3RCZUNvbXBhY3QgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgbm9kZTogTm9kZSwgbGV2ZWw6IG51bWJlcikge1xuICByZXR1cm4gbm9kZS5zdHlsZS50YWdnZWQgfHwgbm9kZS5hbmNob3IgIT09IHVuZGVmaW5lZCB8fCAoc3RhdGUuaW5kZW50IDwgMiAmJiBsZXZlbCA+IDApXG59XG5cbmZ1bmN0aW9uIHdyaXRlTm9kZSAoc3RhdGU6IFByZXNlbnRlclN0YXRlLCBsZXZlbDogbnVtYmVyLCBub2RlOiBOb2RlLCBjdHg6IE5vZGVDb250ZXh0KTogc3RyaW5nIHtcbiAgaWYgKG5vZGUua2luZCA9PT0gJ2FsaWFzJykgcmV0dXJuIGAqJHtub2RlLmFuY2hvcn1gXG5cbiAgY29uc3QgeyBibG9jayA9IGZhbHNlLCBpc2tleSA9IGZhbHNlLCBpc2Jsb2Nrc2VxID0gZmFsc2UgfSA9IGN0eFxuICBsZXQgY29tcGFjdCA9IGN0eC5jb21wYWN0ID8/IGZhbHNlXG5cbiAgY29uc3QgaGFzQW5jaG9yID0gbm9kZS5hbmNob3IgIT09IHVuZGVmaW5lZFxuXG4gIGlmIChjYW5ub3RCZUNvbXBhY3Qoc3RhdGUsIG5vZGUsIGxldmVsKSkge1xuICAgIGNvbXBhY3QgPSBmYWxzZVxuICB9XG5cbiAgbGV0IGJvZHk6IHN0cmluZ1xuICBsZXQgc2hvdWxkUHJpbnRUYWcgPSBub2RlLnN0eWxlLnRhZ2dlZFxuICBjb25zdCB1c2VCbG9ja0NvbGxlY3Rpb24gPSBibG9jayAmJlxuICAgIChub2RlLmtpbmQgPT09ICdtYXBwaW5nJyB8fCBub2RlLmtpbmQgPT09ICdzZXF1ZW5jZScpICYmXG4gICAgIW5vZGUuc3R5bGUuZmxvdyAmJiBub2RlLml0ZW1zLmxlbmd0aCAhPT0gMFxuXG4gIGlmIChub2RlLmtpbmQgPT09ICdtYXBwaW5nJykge1xuICAgIGlmICh1c2VCbG9ja0NvbGxlY3Rpb24pIHtcbiAgICAgIGJvZHkgPSB3cml0ZUJsb2NrTWFwcGluZyhzdGF0ZSwgbGV2ZWwsIG5vZGUsIGNvbXBhY3QpXG4gICAgfSBlbHNlIHtcbiAgICAgIGJvZHkgPSB3cml0ZUZsb3dNYXBwaW5nKHN0YXRlLCBsZXZlbCwgbm9kZSlcbiAgICB9XG4gIH0gZWxzZSBpZiAobm9kZS5raW5kID09PSAnc2VxdWVuY2UnKSB7XG4gICAgaWYgKHVzZUJsb2NrQ29sbGVjdGlvbikge1xuICAgICAgaWYgKHN0YXRlLnNlcU5vSW5kZW50ICYmICFpc2Jsb2Nrc2VxICYmIGxldmVsID4gMCkge1xuICAgICAgICBib2R5ID0gd3JpdGVCbG9ja1NlcXVlbmNlKHN0YXRlLCBsZXZlbCAtIDEsIG5vZGUsIGNvbXBhY3QpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBib2R5ID0gd3JpdGVCbG9ja1NlcXVlbmNlKHN0YXRlLCBsZXZlbCwgbm9kZSwgY29tcGFjdClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYm9keSA9IHdyaXRlRmxvd1NlcXVlbmNlKHN0YXRlLCBsZXZlbCwgbm9kZSlcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgbGF5b3V0ID0gc2NhbGFyTGF5b3V0KHN0YXRlLCBsZXZlbClcbiAgICBjb25zdCBzdHlsZSA9IHJlc29sdmVTY2FsYXJTdHlsZShzdGF0ZSwgbm9kZSwgbGF5b3V0LCBpc2tleSwgYmxvY2spXG4gICAgYm9keSA9IHJlbmRlclNjYWxhclN0eWxlKG5vZGUudmFsdWUsIHN0eWxlLCBsYXlvdXQpXG4gICAgc2hvdWxkUHJpbnRUYWcgPSBub2RlLnN0eWxlLnRhZ2dlZCB8fCAoc3R5bGUgIT09IFNUWUxFX1BMQUlOICYmIG5vZGUudGFnICE9PSBzdGF0ZS5kZWZhdWx0U2NhbGFyVGFnTmFtZSlcbiAgfVxuXG4gIC8vIEFuIGluZGljYXRvciBwbHVzIGl0cyBtYW5kYXRvcnkgc2VwYXJhdG9yIG9jY3VwaWVzIDIgY29sdW1ucy4gRm9yIHdpZGVyXG4gIC8vIGluZGVudGF0aW9uLCBwYWQgYSBjb21wYWN0IGJsb2NrIGNvbGxlY3Rpb24gc28gaXRzIGZpcnN0IGl0ZW0gc3RhcnRzIGF0XG4gIC8vIHRoZSBzYW1lIGNvbHVtbiBhcyB0aGUgZm9sbG93aW5nIGl0ZW1zLlxuICBpZiAodXNlQmxvY2tDb2xsZWN0aW9uICYmIGNvbXBhY3QgJiYgbGV2ZWwgPiAwICYmIHN0YXRlLmluZGVudCA+IDIpIHtcbiAgICBib2R5ID0gYCR7JyAnLnJlcGVhdChzdGF0ZS5pbmRlbnQgLSAyKX0ke2JvZHl9YFxuICB9XG5cbiAgaWYgKHNob3VsZFByaW50VGFnIHx8IGhhc0FuY2hvcikge1xuICAgIGNvbnN0IHByb3BzOiBzdHJpbmdbXSA9IFtdXG4gICAgY29uc3QgdGFnID0gc2hvdWxkUHJpbnRUYWcgPyBub2RlVGFnU2hvcnQobm9kZSkgOiBudWxsXG4gICAgY29uc3QgYW5jaG9yID0gaGFzQW5jaG9yID8gYCYke25vZGUuYW5jaG9yfWAgOiBudWxsXG5cbiAgICBpZiAoc3RhdGUudGFnQmVmb3JlQW5jaG9yKSB7XG4gICAgICBpZiAodGFnICE9PSBudWxsKSBwcm9wcy5wdXNoKHRhZylcbiAgICAgIGlmIChhbmNob3IgIT09IG51bGwpIHByb3BzLnB1c2goYW5jaG9yKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoYW5jaG9yICE9PSBudWxsKSBwcm9wcy5wdXNoKGFuY2hvcilcbiAgICAgIGlmICh0YWcgIT09IG51bGwpIHByb3BzLnB1c2godGFnKVxuICAgIH1cblxuICAgIC8vIE5vIHNlcGFyYXRvciB3aGVuIHRoZSBib2R5IGlzIGVtcHR5IChlLmcuIGAmYW5jaG9yYCBvbiBhIG51bGwgbm9kZSkgb3JcbiAgICAvLyBhbHJlYWR5IHN0YXJ0cyBvbiBpdHMgb3duIGxpbmUuXG4gICAgY29uc3Qgc2VwID0gYm9keSA9PT0gJycgfHwgYm9keS5jaGFyQ29kZUF0KDApID09PSBDSEFSX0xJTkVfRkVFRCA/ICcnIDogJyAnXG4gICAgYm9keSA9IGAke3Byb3BzLmpvaW4oJyAnKX0ke3NlcH0ke2JvZHl9YFxuICB9XG5cbiAgcmV0dXJuIGJvZHlcbn1cblxuLy8gQSBiYXJlICh1bnRhZ2dlZCwgdW5hbmNob3JlZCkgbm9uLWVtcHR5IGJsb2NrIGNvbGxlY3Rpb246IHdyaXRlTm9kZSByZW5kZXJzIGl0XG4vLyBpbiBjb21wYWN0IGZvcm0gd2l0aCBpdHMgZmlyc3QgaXRlbSBvbiB0aGUgb3BlbmluZyBsaW5lLiBUaGF0IHdvcmtzIG1pZC1zdHJlYW0sXG4vLyBidXQgcmlnaHQgYWZ0ZXIgYSBgLS0tYCB0aGUgZmlyc3QgaXRlbSBtdXN0IGRyb3AgdG8gdGhlIG5leHQgbGluZS4gQSB0YWcvYW5jaG9yXG4vLyBhbHJlYWR5IGZvcmNlcyB0aGUgYm9keSBvbnRvIGl0cyBvd24gbGluZSwgc28gdGhvc2Ugc3RheSBvbiB0aGUgYC0tLWAgbGluZS5cbmZ1bmN0aW9uIHJvb3RTdGFydHNPd25MaW5lIChub2RlOiBOb2RlKSB7XG4gIHJldHVybiAobm9kZS5raW5kID09PSAnc2VxdWVuY2UnIHx8IG5vZGUua2luZCA9PT0gJ21hcHBpbmcnKSAmJlxuICAgICFub2RlLnN0eWxlLmZsb3cgJiZcbiAgICBub2RlLml0ZW1zLmxlbmd0aCAhPT0gMCAmJlxuICAgICFub2RlLnN0eWxlLnRhZ2dlZCAmJlxuICAgIG5vZGUuYW5jaG9yID09PSB1bmRlZmluZWRcbn1cblxuLy8gQSBkb2N1bWVudCB3aG9zZSBzZXJpYWxpemF0aW9uIGVuZHMgd2l0aCBhIGtlZXAtY2hvbXBlZCAoYCtgKSBibG9jayBzY2FsYXIgaXNcbi8vIG9wZW4tZW5kZWQ6IHRoZSB0cmFpbGluZyBibGFuayBsaW5lKHMpIHdvdWxkIG90aGVyd2lzZSBiZSBhbWJpZ3VvdXMsIHNvIGl0XG4vLyBuZWVkcyBhIGAuLi5gIHRlcm1pbmF0b3IuIE1pcnJvcnMgdGhlIGtlZXAgdGVzdCBpbiBgYmxvY2tIZWFkZXJgLlxuZnVuY3Rpb24gaXNPcGVuRW5kZWQgKG5vZGU6IE5vZGUpIHtcbiAgLy8gRGVzY2VuZCB0byB0aGUgbGFzdCBsZWFmLCBhbHdheXMgdGFraW5nIHRoZSBsYXN0IGl0ZW0gb2YgYSBibG9jayBjb2xsZWN0aW9uXG4gIC8vIChhIGZsb3cgY29sbGVjdGlvbiByZW5kZXJzIG9uIG9uZSBsaW5lLCBzbyBpdCBlbmRzIHRoZSBkb2N1bWVudCBpdHNlbGYpLlxuICBsZXQgbGVhZiA9IG5vZGVcbiAgd2hpbGUgKChsZWFmLmtpbmQgPT09ICdzZXF1ZW5jZScgfHwgbGVhZi5raW5kID09PSAnbWFwcGluZycpICYmXG4gICAgIWxlYWYuc3R5bGUuZmxvdyAmJiBsZWFmLml0ZW1zLmxlbmd0aCAhPT0gMCkge1xuICAgIGxlYWYgPSBsZWFmLmtpbmQgPT09ICdzZXF1ZW5jZSdcbiAgICAgID8gbGVhZi5pdGVtc1tsZWFmLml0ZW1zLmxlbmd0aCAtIDFdXG4gICAgICA6IGxlYWYuaXRlbXNbbGVhZi5pdGVtcy5sZW5ndGggLSAxXS52YWx1ZVxuICB9XG5cbiAgaWYgKGxlYWYua2luZCAhPT0gJ3NjYWxhcicgfHwgIShsZWFmLnN0eWxlLmxpdGVyYWwgfHwgbGVhZi5zdHlsZS5mb2xkZWQpKSByZXR1cm4gZmFsc2VcbiAgY29uc3QgeyB2YWx1ZSB9ID0gbGVhZlxuICAvLyBLZWVwIGNob21waW5nOiBlbmRzIGluIGEgYmxhbmsgbGluZSAoYFxcblxcbmApIG9yIGlzIGEgbG9uZSBgXFxuYC5cbiAgcmV0dXJuIHZhbHVlLmVuZHNXaXRoKCdcXG5cXG4nKSB8fCB2YWx1ZSA9PT0gJ1xcbidcbn1cblxuZnVuY3Rpb24gd3JpdGVEb2N1bWVudERpcmVjdGl2ZXMgKGRvYzogRG9jdW1lbnQpIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG5cbiAgZm9yIChjb25zdCBkaXJlY3RpdmUgb2YgZG9jLmRpcmVjdGl2ZXMpIHtcbiAgICBpZiAoZGlyZWN0aXZlLmtpbmQgPT09ICd5YW1sJykge1xuICAgICAgcmVzdWx0ICs9IGAlWUFNTCAke2RpcmVjdGl2ZS52ZXJzaW9ufVxcbmBcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgY29uc3QgeyBoYW5kbGUsIHByZWZpeCB9ID0gZGlyZWN0aXZlXG4gICAgcmVzdWx0ICs9IGAlVEFHICR7aGFuZGxlfSAke3ByZWZpeH1cXG5gXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbi8vIERvY3VtZW50cyDihpIgdGV4dCwgaW5jbHVkaW5nIHRoZSB0cmFpbGluZyBuZXdsaW5lLlxuZnVuY3Rpb24gcHJlc2VudCAoZG9jdW1lbnRzOiBEb2N1bWVudFtdLCBvcHRpb25zOiBQcmVzZW50ZXJPcHRpb25zKTogc3RyaW5nIHtcbiAgY29uc3Qgc3RhdGUgPSBjcmVhdGVQcmVzZW50ZXJTdGF0ZShvcHRpb25zKVxuICBsZXQgcmVzdWx0ID0gJydcbiAgbGV0IHByZXZpb3VzRW5kZWQgPSBmYWxzZVxuXG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBkb2N1bWVudHMubGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgY29uc3QgZG9jID0gZG9jdW1lbnRzW2luZGV4XVxuICAgIGNvbnN0IGRpcmVjdGl2ZXMgPSB3cml0ZURvY3VtZW50RGlyZWN0aXZlcyhkb2MpXG4gICAgY29uc3QgaGFzRGlyZWN0aXZlcyA9IGRpcmVjdGl2ZXMgIT09ICcnXG4gICAgY29uc3QgbWFya2VyID0gZG9jLmV4cGxpY2l0U3RhcnQgfHwgaGFzRGlyZWN0aXZlcyB8fCAoaW5kZXggPiAwICYmICFwcmV2aW91c0VuZGVkKVxuXG4gICAgcmVzdWx0ICs9IGRpcmVjdGl2ZXNcblxuICAgIGlmIChkb2MuY29udGVudHMgPT09IG51bGwpIHtcbiAgICAgIGlmIChtYXJrZXIpIHJlc3VsdCArPSAnLS0tXFxuJ1xuICAgIH0gZWxzZSBpZiAobWFya2VyKSB7XG4gICAgICBjb25zdCBib2R5ID0gd3JpdGVOb2RlKHN0YXRlLCAwLCBkb2MuY29udGVudHMsIHsgYmxvY2s6IHRydWUsIGNvbXBhY3Q6IHRydWUgfSlcbiAgICAgIC8vIENvbnRlbnQgc2hhcmVzIHRoZSBgLS0tYCBsaW5lLCBleGNlcHQ6IGFuIGVtcHR5IHJlbmRlciAobm8gc2VwYXJhdG9yIGF0XG4gICAgICAvLyBhbGwpLCBhIGJhcmUgYmxvY2sgY29sbGVjdGlvbiAod3JhcHMgdG8gdGhlIG5leHQgbGluZSksIG9yIGRpcmVjdGl2ZXNcbiAgICAgIC8vIGZvcmNpbmcgYC0tLWAgb250byBpdHMgb3duIGxpbmUuXG4gICAgICBjb25zdCBzZXAgPSBib2R5ID09PSAnJyA/ICcnIDogKGhhc0RpcmVjdGl2ZXMgfHwgcm9vdFN0YXJ0c093bkxpbmUoZG9jLmNvbnRlbnRzKSA/ICdcXG4nIDogJyAnKVxuICAgICAgcmVzdWx0ICs9IGAtLS0ke3NlcH0ke2JvZHl9XFxuYFxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgKz0gd3JpdGVOb2RlKHN0YXRlLCAwLCBkb2MuY29udGVudHMsIHsgYmxvY2s6IHRydWUsIGNvbXBhY3Q6IHRydWUgfSkgKyAnXFxuJ1xuICAgIH1cblxuICAgIHByZXZpb3VzRW5kZWQgPSBkb2MuZXhwbGljaXRFbmQgfHwgKGRvYy5jb250ZW50cyAhPT0gbnVsbCAmJiBpc09wZW5FbmRlZChkb2MuY29udGVudHMpKVxuICAgIGlmIChwcmV2aW91c0VuZGVkKSB7XG4gICAgICByZXN1bHQgKz0gJy4uLlxcbidcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbmV4cG9ydCB7XG4gIERFRkFVTFRfUFJFU0VOVEVSX09QVElPTlMsXG4gIHByZXNlbnQsXG4gIHR5cGUgUHJlc2VudGVyT3B0aW9uc1xufVxuIiwgImltcG9ydCB7IFlBTUwxMV9TQ0hFTUEsIHR5cGUgU2NoZW1hIH0gZnJvbSAnLi9zY2hlbWEudHMnXG5pbXBvcnQgeyBqc1RvQXN0IH0gZnJvbSAnLi9hc3QvZnJvbV9qcy50cydcbmltcG9ydCB7IHZpc2l0LCBWSVNJVF9TS0lQIH0gZnJvbSAnLi9hc3QvdmlzaXQudHMnXG5pbXBvcnQgeyB0eXBlIERvY3VtZW50IH0gZnJvbSAnLi9hc3Qvbm9kZXMudHMnXG5pbXBvcnQge1xuICBERUZBVUxUX1BSRVNFTlRFUl9PUFRJT05TLFxuICBwcmVzZW50LFxuICB0eXBlIFByZXNlbnRlck9wdGlvbnNcbn0gZnJvbSAnLi9hc3QvcHJlc2VudGVyLnRzJ1xuaW1wb3J0IHsgcGljayB9IGZyb20gJy4vY29tbW9uL29iamVjdC50cydcbmltcG9ydCB7IE5PVF9SRVNPTFZFRCB9IGZyb20gJy4vdGFnLnRzJ1xuaW1wb3J0IHsgaW50Q29yZVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9pbnRfY29yZS50cydcbmltcG9ydCB7IGludFlhbWwxMVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9pbnRfeWFtbDExLnRzJ1xuaW1wb3J0IHsgZmxvYXRDb3JlVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2Zsb2F0X2NvcmUudHMnXG5pbXBvcnQgeyBmbG9hdFlhbWwxMVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9mbG9hdF95YW1sMTEudHMnXG5cbmludGVyZmFjZSBEdW1wT3B0aW9ucyBleHRlbmRzIE9taXQ8UHJlc2VudGVyT3B0aW9ucywgJ3NjaGVtYSc+IHtcbiAgc2NoZW1hPzogU2NoZW1hXG4gIHNraXBJbnZhbGlkPzogYm9vbGVhblxuICBub1JlZnM/OiBib29sZWFuXG4gIGZsb3dMZXZlbD86IG51bWJlclxuICB0cmFuc2Zvcm0/OiAoZG9jdW1lbnRzOiBEb2N1bWVudFtdKSA9PiB2b2lkXG59XG5cbi8vIFlBTUwgMS4xIG1pc3NlcyBZQU1MIDEuMiBgMG8uLi5gIGludHMgYW5kIGV4cG9uZW50LW9ubHkgZmxvYXRzLlxuLy8gQ29tYmluZSByZXNvbHZlcnMgc28gYWxsIHBvc3NpYmxlIGNvbGxpc2lvbnMgYXJlIHF1b3RlZC5cbmNvbnN0IERFRkFVTFRfRFVNUF9TQ0hFTUEgPSBZQU1MMTFfU0NIRU1BLndpdGhUYWdzKFxuICB7XG4gICAgLi4uaW50WWFtbDExVGFnLFxuICAgIHJlc29sdmU6IChzb3VyY2UsIGlzRXhwbGljaXQsIHRhZ05hbWUpID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGludFlhbWwxMVRhZy5yZXNvbHZlKHNvdXJjZSwgaXNFeHBsaWNpdCwgdGFnTmFtZSlcbiAgICAgIHJldHVybiByZXN1bHQgPT09IE5PVF9SRVNPTFZFRCA/IGludENvcmVUYWcucmVzb2x2ZShzb3VyY2UsIGlzRXhwbGljaXQsIHRhZ05hbWUpIDogcmVzdWx0XG4gICAgfVxuICB9LFxuICB7XG4gICAgLi4uZmxvYXRZYW1sMTFUYWcsXG4gICAgcmVzb2x2ZTogKHNvdXJjZSwgaXNFeHBsaWNpdCwgdGFnTmFtZSkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gZmxvYXRZYW1sMTFUYWcucmVzb2x2ZShzb3VyY2UsIGlzRXhwbGljaXQsIHRhZ05hbWUpXG4gICAgICByZXR1cm4gcmVzdWx0ID09PSBOT1RfUkVTT0xWRUQgPyBmbG9hdENvcmVUYWcucmVzb2x2ZShzb3VyY2UsIGlzRXhwbGljaXQsIHRhZ05hbWUpIDogcmVzdWx0XG4gICAgfVxuICB9XG4pXG5cbmNvbnN0IERFRkFVTFRfRFVNUF9PUFRJT05TOiBSZXF1aXJlZDxEdW1wT3B0aW9ucz4gPSB7XG4gIC4uLkRFRkFVTFRfUFJFU0VOVEVSX09QVElPTlMsXG4gIHNjaGVtYTogREVGQVVMVF9EVU1QX1NDSEVNQSxcbiAgc2tpcEludmFsaWQ6IGZhbHNlLFxuICBub1JlZnM6IGZhbHNlLFxuICBmbG93TGV2ZWw6IC0xLFxuICB0cmFuc2Zvcm06ICgpID0+IHt9XG59XG5cbi8vIE9wdGlvbnMgdGhhdCBuZWVkIHRoZSBKUyB2YWx1ZSAodGFncywgZm9ybWF0LCBkZWR1cCkgZ28gdG8gYGpzVG9Bc3RgOyBwdXJlbHlcbi8vIHByZXNlbnRhdGlvbmFsIG9uZXMgZ28gdG8gYHByZXNlbnRgLlxuZnVuY3Rpb24gZHVtcCAoaW5wdXQ6IGFueSwgb3B0aW9uczogRHVtcE9wdGlvbnMgPSB7fSkge1xuICBjb25zdCBvcHRzID0geyAuLi5ERUZBVUxUX0RVTVBfT1BUSU9OUywgLi4ub3B0aW9ucyB9XG5cbiAgY29uc3QgZG9jdW1lbnRzID0ganNUb0FzdChpbnB1dCwgb3B0cy5zY2hlbWEsIHtcbiAgICBub1JlZnM6IG9wdHMubm9SZWZzLFxuICAgIHNraXBJbnZhbGlkOiBvcHRzLnNraXBJbnZhbGlkXG4gIH0pXG5cbiAgLy8gZmxvd0xldmVsOiBldmVyeSBub2RlIGF0IHRoaXMgZGVwdGggc3dpdGNoZXMgdG8gZmxvdzsgdGhlIHByZXNlbnRlciBmb3JjZXNcbiAgLy8gZXZlcnl0aGluZyBiZWxvdyBpbnRvIGZsb3cgdG9vLCBzbyB0aGUgd2FsayBzdG9wcyB0aGVyZS5cbiAgaWYgKG9wdHMuZmxvd0xldmVsID49IDApIHtcbiAgICB2aXNpdChkb2N1bWVudHMsIChub2RlLCBjdHgpID0+IHtcbiAgICAgIGlmIChjdHguZGVwdGggPCBvcHRzLmZsb3dMZXZlbCkgcmV0dXJuXG4gICAgICBub2RlLnN0eWxlLmZsb3cgPSB0cnVlXG4gICAgICByZXR1cm4gVklTSVRfU0tJUFxuICAgIH0pXG4gIH1cblxuICBvcHRzLnRyYW5zZm9ybShkb2N1bWVudHMpXG5cbiAgY29uc3QgUFJFU0VOVEVSX09QVF9LRVlTID0gT2JqZWN0LmtleXMoREVGQVVMVF9QUkVTRU5URVJfT1BUSU9OUykgYXNcbiAgICAoa2V5b2YgdHlwZW9mIERFRkFVTFRfUFJFU0VOVEVSX09QVElPTlMpW11cblxuICByZXR1cm4gcHJlc2VudChkb2N1bWVudHMsIHsgLi4ucGljayhvcHRzLCBQUkVTRU5URVJfT1BUX0tFWVMpLCBzY2hlbWE6IG9wdHMuc2NoZW1hIH0pXG59XG5cbmV4cG9ydCB7XG4gIGR1bXAsXG5cbiAgdHlwZSBEdW1wT3B0aW9uc1xufVxuIiwgIi8vIFBhcnNlciBldmVudHMg4oaSIEFTVC4gVGhlIHNlY29uZCBlbnRyeSBpbnRvIHRoZSBBU1Qgd29ybGQgKHRoZSBmaXJzdCBiZWluZ1xuLy8gYGpzVG9Bc3RgKTogaW5zdGVhZCBvZiBidWlsZGluZyBKUyB2YWx1ZXMgbGlrZSB0aGUgY29uc3RydWN0b3IsIGl0IG1pcnJvcnMgdGhlXG4vLyBzYW1lIGRvY3VtZW50L3NlcXVlbmNlL21hcHBpbmcgZnJhbWUgd2FsayBhbmQgZW1pdHMgYE5vZGVgcyB0aGF0IGtlZXAgdGhlXG4vLyBvcmlnaW5hbCBzdHlsZXMsIHRhZ3MgYW5kIGFuY2hvcnMsIHNvIHBhcnNlZCBZQU1MIGNhbiBiZSByZS1kdW1wZWQgZmFpdGhmdWxseS5cblxuaW1wb3J0IHtcbiAgRVZFTlRfQUxJQVMsXG4gIEVWRU5UX0RPQ1VNRU5ULFxuICBFVkVOVF9NQVBQSU5HLFxuICBFVkVOVF9QT1AsXG4gIEVWRU5UX1NDQUxBUixcbiAgRVZFTlRfU0VRVUVOQ0UsXG4gIFNDQUxBUl9TVFlMRV9QTEFJTixcbiAgU0NBTEFSX1NUWUxFX1NJTkdMRV9RVU9URUQsXG4gIFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVELFxuICBTQ0FMQVJfU1RZTEVfTElURVJBTF9CTE9DSyxcbiAgU0NBTEFSX1NUWUxFX0ZPTERFRF9CTE9DSyxcbiAgQ09MTEVDVElPTl9TVFlMRV9GTE9XLFxuICB0eXBlIEV2ZW50LFxuICB0eXBlIE1hcHBpbmdFdmVudCxcbiAgdHlwZSBTY2FsYXJFdmVudCxcbiAgdHlwZSBTZXF1ZW5jZUV2ZW50XG59IGZyb20gJy4uL3BhcnNlci9ldmVudHMudHMnXG5pbXBvcnQgeyBnZXRTY2FsYXJWYWx1ZSB9IGZyb20gJy4uL3BhcnNlci9wYXJzZXJfc2NhbGFyLnRzJ1xuaW1wb3J0IHsgdHlwZSBTY2hlbWEgfSBmcm9tICcuLi9zY2hlbWEudHMnXG5pbXBvcnQgeyBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi90YWcudHMnXG5pbXBvcnQge1xuICBTdHlsZSxcbiAgdHlwZSBOb2RlLFxuICB0eXBlIERvY3VtZW50LFxuICB0eXBlIFNjYWxhck5vZGUsXG4gIHR5cGUgU2VxdWVuY2VOb2RlLFxuICB0eXBlIE1hcHBpbmdOb2RlLFxuICB0eXBlIEFsaWFzTm9kZVxufSBmcm9tICcuL25vZGVzLnRzJ1xuXG5jb25zdCBOT19SQU5HRSA9IC0xXG5cbmludGVyZmFjZSBEb2N1bWVudEZyYW1lIHtcbiAga2luZDogJ2RvY3VtZW50J1xuICBkb2M6IERvY3VtZW50XG59XG5cbmludGVyZmFjZSBTZXF1ZW5jZUZyYW1lIHtcbiAga2luZDogJ3NlcXVlbmNlJ1xuICBub2RlOiBTZXF1ZW5jZU5vZGVcbn1cblxuaW50ZXJmYWNlIE1hcHBpbmdGcmFtZSB7XG4gIGtpbmQ6ICdtYXBwaW5nJ1xuICBub2RlOiBNYXBwaW5nTm9kZVxuICBrZXk6IE5vZGUgfCBudWxsXG59XG5cbnR5cGUgRnJhbWUgPSBEb2N1bWVudEZyYW1lIHwgU2VxdWVuY2VGcmFtZSB8IE1hcHBpbmdGcmFtZVxuXG5pbnRlcmZhY2UgRnJvbUV2ZW50c09wdGlvbnMge1xuICBzb3VyY2U6IHN0cmluZ1xuICBzY2hlbWE6IFNjaGVtYVxufVxuXG5pbnRlcmZhY2UgRnJvbUV2ZW50c1N0YXRlIHtcbiAgc291cmNlOiBzdHJpbmdcbiAgc2NoZW1hOiBTY2hlbWFcbiAgZXZlbnRJbmRleDogbnVtYmVyXG4gIHBvc2l0aW9uOiBudW1iZXJcbiAgZnJhbWVzOiBGcmFtZVtdXG4gIGRvY3VtZW50czogRG9jdW1lbnRbXVxufVxuXG5mdW5jdGlvbiBldmVudFBvc2l0aW9uIChldmVudDogRXZlbnQpIHtcbiAgaWYgKCd0YWdTdGFydCcgaW4gZXZlbnQgJiYgZXZlbnQudGFnU3RhcnQgIT09IE5PX1JBTkdFKSByZXR1cm4gZXZlbnQudGFnU3RhcnRcbiAgaWYgKCdhbmNob3JTdGFydCcgaW4gZXZlbnQgJiYgZXZlbnQuYW5jaG9yU3RhcnQgIT09IE5PX1JBTkdFKSByZXR1cm4gZXZlbnQuYW5jaG9yU3RhcnRcbiAgaWYgKCd2YWx1ZVN0YXJ0JyBpbiBldmVudCAmJiBldmVudC52YWx1ZVN0YXJ0ICE9PSBOT19SQU5HRSkgcmV0dXJuIGV2ZW50LnZhbHVlU3RhcnRcbiAgaWYgKCdzdGFydCcgaW4gZXZlbnQpIHJldHVybiBldmVudC5zdGFydFxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiByYXdUYWcgKHN0YXRlOiBGcm9tRXZlbnRzU3RhdGUsIGV2ZW50OiBTY2FsYXJFdmVudCB8IFNlcXVlbmNlRXZlbnQgfCBNYXBwaW5nRXZlbnQpIHtcbiAgcmV0dXJuIGV2ZW50LnRhZ1N0YXJ0ID09PSBOT19SQU5HRVxuICAgID8gJydcbiAgICA6IHN0YXRlLnNvdXJjZS5zbGljZShldmVudC50YWdTdGFydCwgZXZlbnQudGFnRW5kKVxufVxuXG5mdW5jdGlvbiBhbmNob3JOYW1lIChzdGF0ZTogRnJvbUV2ZW50c1N0YXRlLCBldmVudDogU2NhbGFyRXZlbnQgfCBTZXF1ZW5jZUV2ZW50IHwgTWFwcGluZ0V2ZW50KSB7XG4gIHJldHVybiBldmVudC5hbmNob3JTdGFydCA9PT0gTk9fUkFOR0VcbiAgICA/IHVuZGVmaW5lZFxuICAgIDogc3RhdGUuc291cmNlLnNsaWNlKGV2ZW50LmFuY2hvclN0YXJ0LCBldmVudC5hbmNob3JFbmQpXG59XG5cbi8vIFRhZyBuYW1lIGNhcnJpZWQgYnkgYW4gZW1wdHkvcGxhaW4gc2NhbGFyIHdpdGggbm8gZXhwbGljaXQgdGFnOiB0aGUgZmlyc3Rcbi8vIGltcGxpY2l0IHNjYWxhciByZXNvbHZlciB0aGF0IGFjY2VwdHMgdGhlIHRleHQsIGZhbGxpbmcgYmFjayB0byBzdHIuIE1pcnJvcnNcbi8vIHRoZSBpbXBsaWNpdCBicmFuY2ggb2YgYGNvbnN0cnVjdFNjYWxhcmAsIGJ1dCB3ZSBvbmx5IHdhbnQgdGhlIHRhZyBuYW1lLlxuZnVuY3Rpb24gaW1wbGljaXRTY2FsYXJUYWdOYW1lIChzdGF0ZTogRnJvbUV2ZW50c1N0YXRlLCBzb3VyY2U6IHN0cmluZykge1xuICBjb25zdCB7IHNjaGVtYSB9ID0gc3RhdGVcbiAgY29uc3QgY2FuZGlkYXRlcyA9IHNjaGVtYS5pbXBsaWNpdFNjYWxhckJ5Rmlyc3RDaGFyLmdldChzb3VyY2UuY2hhckF0KDApKSA/P1xuICAgIHNjaGVtYS5pbXBsaWNpdFNjYWxhckFueUZpcnN0Q2hhclxuICBmb3IgKGNvbnN0IHRhZyBvZiBjYW5kaWRhdGVzKSB7XG4gICAgaWYgKHRhZy5yZXNvbHZlKHNvdXJjZSwgZmFsc2UsIHRhZy50YWdOYW1lKSAhPT0gTk9UX1JFU09MVkVEKSByZXR1cm4gdGFnLnRhZ05hbWVcbiAgfVxuICByZXR1cm4gc2NoZW1hLmRlZmF1bHRTY2FsYXJUYWcudGFnTmFtZVxufVxuXG5mdW5jdGlvbiBidWlsZFNjYWxhciAoc3RhdGU6IEZyb21FdmVudHNTdGF0ZSwgZXZlbnQ6IFNjYWxhckV2ZW50KTogU2NhbGFyTm9kZSB7XG4gIGNvbnN0IHZhbHVlID0gZ2V0U2NhbGFyVmFsdWUoc3RhdGUuc291cmNlLCBldmVudClcbiAgY29uc3QgcmF3ID0gcmF3VGFnKHN0YXRlLCBldmVudClcbiAgY29uc3Qgc3R5bGUgPSBuZXcgU3R5bGUoKVxuXG4gIHN3aXRjaCAoZXZlbnQuc3R5bGUpIHtcbiAgICBjYXNlIFNDQUxBUl9TVFlMRV9TSU5HTEVfUVVPVEVEOiBzdHlsZS5zaW5nbGVRdW90ZWQgPSB0cnVlOyBicmVha1xuICAgIGNhc2UgU0NBTEFSX1NUWUxFX0RPVUJMRV9RVU9URUQ6IHN0eWxlLmRvdWJsZVF1b3RlZCA9IHRydWU7IGJyZWFrXG4gICAgY2FzZSBTQ0FMQVJfU1RZTEVfTElURVJBTF9CTE9DSzogc3R5bGUubGl0ZXJhbCA9IHRydWU7IGJyZWFrXG4gICAgY2FzZSBTQ0FMQVJfU1RZTEVfRk9MREVEX0JMT0NLOiBzdHlsZS5mb2xkZWQgPSB0cnVlOyBicmVha1xuICB9XG5cbiAgbGV0IHRhZzogc3RyaW5nXG4gIGlmIChyYXcgIT09ICcnKSB7XG4gICAgc3R5bGUudGFnZ2VkID0gdHJ1ZVxuICAgIHRhZyA9IHJhd1xuICB9IGVsc2UgaWYgKGV2ZW50LnN0eWxlID09PSBTQ0FMQVJfU1RZTEVfUExBSU4pIHtcbiAgICB0YWcgPSBpbXBsaWNpdFNjYWxhclRhZ05hbWUoc3RhdGUsIHZhbHVlKVxuICB9IGVsc2Uge1xuICAgIHRhZyA9IHN0YXRlLnNjaGVtYS5kZWZhdWx0U2NhbGFyVGFnLnRhZ05hbWVcbiAgfVxuXG4gIHJldHVybiB7IGtpbmQ6ICdzY2FsYXInLCB0YWcsIHN0eWxlLCBhbmNob3I6IGFuY2hvck5hbWUoc3RhdGUsIGV2ZW50KSwgdmFsdWUgfVxufVxuXG5mdW5jdGlvbiBidWlsZENvbGxlY3Rpb24gKFxuICBzdGF0ZTogRnJvbUV2ZW50c1N0YXRlLFxuICBldmVudDogU2VxdWVuY2VFdmVudCB8IE1hcHBpbmdFdmVudCxcbiAgZGVmYXVsdFRhZ05hbWU6IHN0cmluZ1xuKTogeyB0YWc6IHN0cmluZywgc3R5bGU6IFN0eWxlLCBhbmNob3I/OiBzdHJpbmcgfSB7XG4gIGNvbnN0IHJhdyA9IHJhd1RhZyhzdGF0ZSwgZXZlbnQpXG4gIGNvbnN0IHN0eWxlID0gbmV3IFN0eWxlKClcbiAgaWYgKGV2ZW50LnN0eWxlID09PSBDT0xMRUNUSU9OX1NUWUxFX0ZMT1cpIHN0eWxlLmZsb3cgPSB0cnVlXG5cbiAgbGV0IHRhZzogc3RyaW5nXG4gIGlmIChyYXcgPT09ICcnKSB7XG4gICAgdGFnID0gZGVmYXVsdFRhZ05hbWVcbiAgfSBlbHNlIHtcbiAgICB0YWcgPSByYXdcbiAgICBzdHlsZS50YWdnZWQgPSB0cnVlXG4gIH1cblxuICByZXR1cm4geyB0YWcsIHN0eWxlLCBhbmNob3I6IGFuY2hvck5hbWUoc3RhdGUsIGV2ZW50KSB9XG59XG5cbmZ1bmN0aW9uIGFkZE5vZGUgKHN0YXRlOiBGcm9tRXZlbnRzU3RhdGUsIG5vZGU6IE5vZGUpIHtcbiAgY29uc3QgZnJhbWUgPSBzdGF0ZS5mcmFtZXNbc3RhdGUuZnJhbWVzLmxlbmd0aCAtIDFdXG5cbiAgaWYgKGZyYW1lLmtpbmQgPT09ICdkb2N1bWVudCcpIHtcbiAgICBmcmFtZS5kb2MuY29udGVudHMgPSBub2RlXG4gIH0gZWxzZSBpZiAoZnJhbWUua2luZCA9PT0gJ3NlcXVlbmNlJykge1xuICAgIGZyYW1lLm5vZGUuaXRlbXMucHVzaChub2RlKVxuICB9IGVsc2UgaWYgKGZyYW1lLmtleSkge1xuICAgIGZyYW1lLm5vZGUuaXRlbXMucHVzaCh7IGtleTogZnJhbWUua2V5LCB2YWx1ZTogbm9kZSB9KVxuICAgIGZyYW1lLmtleSA9IG51bGxcbiAgfSBlbHNlIHtcbiAgICBmcmFtZS5rZXkgPSBub2RlXG4gIH1cbn1cblxuZnVuY3Rpb24gZXZlbnRzVG9Bc3QgKGV2ZW50czogRXZlbnRbXSwgb3B0aW9uczogRnJvbUV2ZW50c09wdGlvbnMpOiBEb2N1bWVudFtdIHtcbiAgY29uc3Qgc3RhdGU6IEZyb21FdmVudHNTdGF0ZSA9IHtcbiAgICBzb3VyY2U6IG9wdGlvbnMuc291cmNlLFxuICAgIHNjaGVtYTogb3B0aW9ucy5zY2hlbWEsXG4gICAgZXZlbnRJbmRleDogMCxcbiAgICBwb3NpdGlvbjogMCxcbiAgICBmcmFtZXM6IFtdLFxuICAgIGRvY3VtZW50czogW11cbiAgfVxuXG4gIHdoaWxlIChzdGF0ZS5ldmVudEluZGV4IDwgZXZlbnRzLmxlbmd0aCkge1xuICAgIGNvbnN0IGV2ZW50ID0gZXZlbnRzW3N0YXRlLmV2ZW50SW5kZXgrK11cbiAgICBzdGF0ZS5wb3NpdGlvbiA9IGV2ZW50UG9zaXRpb24oZXZlbnQpXG5cbiAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgIGNhc2UgRVZFTlRfRE9DVU1FTlQ6IHtcbiAgICAgICAgY29uc3QgZG9jOiBEb2N1bWVudCA9IHtcbiAgICAgICAgICBjb250ZW50czogbnVsbCxcbiAgICAgICAgICBleHBsaWNpdFN0YXJ0OiBldmVudC5leHBsaWNpdFN0YXJ0LFxuICAgICAgICAgIGV4cGxpY2l0RW5kOiBldmVudC5leHBsaWNpdEVuZCxcbiAgICAgICAgICBkaXJlY3RpdmVzOiBldmVudC5kaXJlY3RpdmVzXG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUuZnJhbWVzLnB1c2goeyBraW5kOiAnZG9jdW1lbnQnLCBkb2MgfSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgY2FzZSBFVkVOVF9TQ0FMQVI6XG4gICAgICAgIGFkZE5vZGUoc3RhdGUsIGJ1aWxkU2NhbGFyKHN0YXRlLCBldmVudCkpXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgRVZFTlRfU0VRVUVOQ0U6IHtcbiAgICAgICAgY29uc3QgeyB0YWcsIHN0eWxlLCBhbmNob3IgfSA9IGJ1aWxkQ29sbGVjdGlvbihzdGF0ZSwgZXZlbnQsICd0YWc6eWFtbC5vcmcsMjAwMjpzZXEnKVxuICAgICAgICBjb25zdCBub2RlOiBTZXF1ZW5jZU5vZGUgPSB7IGtpbmQ6ICdzZXF1ZW5jZScsIHRhZywgc3R5bGUsIGFuY2hvciwgaXRlbXM6IFtdIH1cbiAgICAgICAgc3RhdGUuZnJhbWVzLnB1c2goeyBraW5kOiAnc2VxdWVuY2UnLCBub2RlIH0pXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGNhc2UgRVZFTlRfTUFQUElORzoge1xuICAgICAgICBjb25zdCB7IHRhZywgc3R5bGUsIGFuY2hvciB9ID0gYnVpbGRDb2xsZWN0aW9uKHN0YXRlLCBldmVudCwgJ3RhZzp5YW1sLm9yZywyMDAyOm1hcCcpXG4gICAgICAgIGNvbnN0IG5vZGU6IE1hcHBpbmdOb2RlID0geyBraW5kOiAnbWFwcGluZycsIHRhZywgc3R5bGUsIGFuY2hvciwgaXRlbXM6IFtdIH1cbiAgICAgICAgc3RhdGUuZnJhbWVzLnB1c2goeyBraW5kOiAnbWFwcGluZycsIG5vZGUsIGtleTogbnVsbCB9KVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjYXNlIEVWRU5UX0FMSUFTOiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBzdGF0ZS5zb3VyY2Uuc2xpY2UoZXZlbnQuYW5jaG9yU3RhcnQsIGV2ZW50LmFuY2hvckVuZClcbiAgICAgICAgY29uc3Qgbm9kZTogQWxpYXNOb2RlID0geyBraW5kOiAnYWxpYXMnLCB0YWc6ICcnLCBzdHlsZTogbmV3IFN0eWxlKCksIGFuY2hvcjogbmFtZSB9XG4gICAgICAgIGFkZE5vZGUoc3RhdGUsIG5vZGUpXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGNhc2UgRVZFTlRfUE9QOiB7XG4gICAgICAgIGNvbnN0IGZyYW1lID0gc3RhdGUuZnJhbWVzLnBvcCgpIVxuICAgICAgICBpZiAoZnJhbWUua2luZCA9PT0gJ2RvY3VtZW50Jykge1xuICAgICAgICAgIHN0YXRlLmRvY3VtZW50cy5wdXNoKGZyYW1lLmRvYylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhZGROb2RlKHN0YXRlLCBmcmFtZS5ub2RlKVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0YXRlLmRvY3VtZW50c1xufVxuXG5leHBvcnQge1xuICBldmVudHNUb0FzdCxcbiAgdHlwZSBGcm9tRXZlbnRzT3B0aW9uc1xufVxuIiwgIi8qKlxuICogWUFNTCBmcm9udG1hdHRlciBcdTg5RTNcdTY3OTAvXHU1RThGXHU1MjE3XHU1MzE2XHUzMDAyXHU0RjlEXHU2MzZFIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYFx1MzAwMlxuICpcbiAqIC0gXHU3NTI4IGpzLXlhbWwgXHU1OTA0XHU3NDA2XHU0RTJEXHU2NTg3XHU1QjU3XHU2QkI1XHU1NDBEXHVGRjA4anMteWFtbCBcdTUzOUZcdTc1MUZcdTY1MkZcdTYzMDEgVW5pY29kZSBrZXlcdUZGMDlcbiAqIC0gXHU4OUUzXHU2NzkwXHU2NUY2XHU0RkREXHU3NTU5XHU2Q0U4XHU5MUNBXHU5ODdBXHU1RThGXHVGRjA4anMteWFtbCBcdTRFMERcdTRGRERcdTc1NTlcdUZGMENcdTRGNDZcdTYyMTFcdTRFRUNcdTc1MjhcdTU2RkFcdTVCOUFcdTVCNTdcdTZCQjVcdTY2MjBcdTVDMDRcdTkxQ0RcdTVFRkFcdUZGMDlcbiAqIC0gXHU1RThGXHU1MjE3XHU1MzE2XHU2NUY2XHU2MzA5XHU4OUM0XHU4MzAzXHU5ODdBXHU1RThGXHU4RjkzXHU1MUZBXHVGRjA4XHU1NDBDXHU2QjY1XHU3RUQxXHU1QjlBXHUyMTkyXHU2ODA3XHU3QjdFXHUyMTkyXHU3RjE2XHU3ODAxXHUyMTkyXHU4RjkzXHU1MTY1XHUyMTkyXHU2NUU1XHU2NzFGXHUyMTkyXHU1MTczXHU5NTJFXHU4QkNEXHUyMTkyXHU4QkM0XHU1MjA2XHUyMTkyXHU3RDIyXHU1RjE1XHVGRjA5XG4gKi9cbmltcG9ydCAqIGFzIFlBTUwgZnJvbSAnanMteWFtbCc7XG5cbi8qKiBmcm9udG1hdHRlciBcdTUyMDZcdTk2OTRcdTdCMjZcdTMwMDIgKi9cbmNvbnN0IEZNX0RFTElNSVRFUiA9ICctLS0nO1xuXG4vKiogZnJvbnRtYXR0ZXIgXHU4RjkzXHU1MUZBXHU2NUY2XHU3Njg0XHU1QjU3XHU2QkI1XHU5ODdBXHU1RThGXHUzMDAyXHU0RjlEXHU2MzZFIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTRFMDBcdTZBMjFcdTY3N0ZcdTMwMDIgKi9cbmNvbnN0IEZJRUxEX09SREVSOiAoa2V5b2YgaW1wb3J0KCcuL3R5cGVzJykuWUFNTEZyb250bWF0dGVyKVtdID0gW1xuICAnZmVpc2h1X2lkJyxcbiAgJ2ZlaXNodV9kb2NfaWQnLFxuICAnZmVpc2h1X3RpdGxlJyxcbiAgJ3N5bmNfaGFzaCcsXG4gICdzeW5jX3RpbWUnLFxuICAnXHU2ODA3XHU3QjdFJyxcbiAgJ1x1N0YxNlx1NzgwMScsXG4gICdcdThGOTNcdTUxNjUnLFxuICAnXHU2NUU1XHU2NzFGJyxcbiAgJ1x1NjVFNVx1NjcxRlx1N0QyMlx1NUYxNScsXG4gICdcdTUxNzNcdTk1MkVcdThCQ0QnLFxuICAnXHU2OTgyXHU4RkYwJyxcbiAgJ1x1OEJDNFx1NTIwNicsXG4gICdcdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBJyxcbiAgJ1x1N0QyMlx1NUYxNV9cdTc3RTVcdThCQzZcdTVFOTMnLFxuICAnXHU3RDIyXHU1RjE1X1x1OTg5Q1x1ODI3MicsXG4gICdcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OCcsXG4gICdcdTdEMjJcdTVGMTVfXHU1NzU3JyxcbiAgJ1x1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2NjknLFxuXTtcblxuLyoqIFx1N0E3QVx1NTAzQ1x1OERGM1x1OEZDN1x1OTZDNlx1NTQwOFx1RkYxQVx1NEVDNVx1OERGM1x1OEZDN1x1NjcyQVx1OEJCRVx1N0Y2RVx1RkYxQlx1N0E3QVx1NUI1N1x1N0IyNlx1NEUzMi9cdTdBN0FcdTY1NzBcdTdFQzRcdTc1MjhcdTRFOEVcdTg5QzRcdTgzMDNcdTVCNTdcdTZCQjVcdTUzNjBcdTRGNERcdTMwMDIgKi9cbmZ1bmN0aW9uIGlzRW1wdHkodjogdW5rbm93bik6IGJvb2xlYW4ge1xuICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IG51bGwpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogXHU1QzA2IGZyb250bWF0dGVyIFx1NUJGOVx1OEM2MVx1NUU4Rlx1NTIxN1x1NTMxNlx1NEUzQSBZQU1MIFx1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOFx1NTQyQiBgLS0tYCBcdTUyMDZcdTk2OTRcdTdCMjZcdUZGMDlcdTMwMDJcbiAqIFx1NjMwOVx1ODlDNFx1ODMwM1x1OTg3QVx1NUU4Rlx1OEY5M1x1NTFGQVx1RkYwQ1x1OERGM1x1OEZDN1x1N0E3QVx1NTAzQ1x1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplRnJvbnRtYXR0ZXIoZm06IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogc3RyaW5nIHtcbiAgY29uc3Qgb3JkZXJlZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcbiAgZm9yIChjb25zdCBrZXkgb2YgRklFTERfT1JERVIpIHtcbiAgICBpZiAoIWlzRW1wdHkoZm1ba2V5XSkpIHtcbiAgICAgIG9yZGVyZWRba2V5IGFzIHN0cmluZ10gPSBmbVtrZXldO1xuICAgIH1cbiAgfVxuICAvLyBcdTY1MzZcdTVDM0VcdUZGMUFcdTUzRUZcdTgwRkRcdTY3MDlcdTU5MUFcdTRGNTlcdTVCNTdcdTZCQjVcdTRFMERcdTU3MjggRklFTERfT1JERVIgXHU5MUNDXHVGRjA4XHU1NDExXHU1NDBFXHU1MTdDXHU1QkI5XHVGRjA5XG4gIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKGZtKSkge1xuICAgIGlmICghKGsgaW4gb3JkZXJlZCkgJiYgIWlzRW1wdHkodikpIHtcbiAgICAgIG9yZGVyZWRba10gPSB2O1xuICAgIH1cbiAgfVxuICBjb25zdCB5YW1sU3RyID0gWUFNTC5kdW1wKG9yZGVyZWQsIHtcbiAgICBsaW5lV2lkdGg6IC0xLCAgICAgICAgICAgLy8gXHU0RTBEXHU2Mjk4XHU4ODRDXHVGRjA4XHU4ODY4XHU2ODNDXHU3QjQ5XHU5NTdGXHU4ODRDXHU0RTBEXHU3ODM0XHU1NzRGXHVGRjA5XG4gICAgcXVvdGVTdHlsZTogJ2RvdWJsZScsICAgIC8vIFx1NUI1N1x1N0IyNlx1NEUzMlx1NzUyOFx1NTNDQ1x1NUYxNVx1NTNGN1x1RkYwOFx1NEZERFx1NzU1OSBlbW9qaVx1RkYwOVxuICAgIGZvcmNlUXVvdGVzOiBmYWxzZSxcbiAgICBzb3J0S2V5czogZmFsc2UsICAgICAgICAgLy8gXHU2MjExXHU0RUVDXHU4MUVBXHU1REYxXHU2M0E3XHU1MjM2XHU5ODdBXHU1RThGXG4gIH0pIGFzIHN0cmluZztcbiAgcmV0dXJuIGAke0ZNX0RFTElNSVRFUn1cXG4ke3lhbWxTdHJ9JHtGTV9ERUxJTUlURVJ9YDtcbn1cblxuLyoqXG4gKiBcdTRFQ0UgbWQgXHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XHU4OUUzXHU2NzkwIGZyb250bWF0dGVyXHUzMDAyXG4gKiBAcGFyYW0gY29udGVudCBcdTVCOENcdTY1NzRcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcbiAqIEByZXR1cm5zIHsgZnJvbnRtYXR0ZXIsIGJvZHkgfVx1RkYwQ2Zyb250bWF0dGVyIFx1NEUzQSBudWxsIFx1ODg2OFx1NzkzQVx1NjVFMCBmcm9udG1hdHRlclxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGcm9udG1hdHRlcihjb250ZW50OiBzdHJpbmcpOiB7XG4gIGZyb250bWF0dGVyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gIGJvZHk6IHN0cmluZztcbn0ge1xuICBjb25zdCBvZmZzZXQgPSBjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4ZmVmZiA/IDEgOiAwO1xuICBpZiAoIWNvbnRlbnQuc3RhcnRzV2l0aChGTV9ERUxJTUlURVIsIG9mZnNldCkpIHtcbiAgICByZXR1cm4geyBmcm9udG1hdHRlcjogbnVsbCwgYm9keTogY29udGVudCB9O1xuICB9XG5cbiAgY29uc3QgcmVzdCA9IGNvbnRlbnQuc2xpY2Uob2Zmc2V0ICsgRk1fREVMSU1JVEVSLmxlbmd0aCk7XG4gIGNvbnN0IG1hdGNoID0gcmVzdC5tYXRjaCgvXlxccj9cXG4oW1xcc1xcU10qPylcXHI/XFxuLS0tWyBcXHRdKig/Olxccj9cXG58JCkvKTtcbiAgaWYgKCFtYXRjaCkge1xuICAgIHJldHVybiB7IGZyb250bWF0dGVyOiBudWxsLCBib2R5OiBjb250ZW50IH07XG4gIH1cblxuICBjb25zdCB5YW1sQmxvY2sgPSBtYXRjaFsxXTtcbiAgY29uc3QgYm9keVN0YXJ0ID0gb2Zmc2V0ICsgRk1fREVMSU1JVEVSLmxlbmd0aCArIG1hdGNoWzBdLmxlbmd0aDtcbiAgY29uc3QgYm9keSA9IGNvbnRlbnQuc2xpY2UoYm9keVN0YXJ0KS5yZXBsYWNlKC9eKD86XFxyP1xcbikrLywgJycpO1xuICB0cnkge1xuICAgIGNvbnN0IGZtID0gWUFNTC5sb2FkKHlhbWxCbG9jaykgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgcmV0dXJuIHsgZnJvbnRtYXR0ZXI6IGZtID8/IHt9LCBib2R5IH07XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBZQU1MIFx1ODlFM1x1Njc5MFx1NTkzMVx1OEQyNVx1RkYxQVx1ODlDNlx1NEUzQVx1NjVFMCBmcm9udG1hdHRlclxuICAgIGNvbnNvbGUud2FybignW3N5bmMvc2hhcmVkXSBmcm9udG1hdHRlciBwYXJzZSBmYWlsZWQ6JywgZSk7XG4gICAgcmV0dXJuIHsgZnJvbnRtYXR0ZXI6IG51bGwsIGJvZHk6IGNvbnRlbnQgfTtcbiAgfVxufVxuXG4vKipcbiAqIFx1NUMwNiBmcm9udG1hdHRlciArIGJvZHkgXHU2MkZDXHU2MjEwXHU1QjhDXHU2NTc0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlbWJsZUZpbGUoXG4gIGZtOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbiAgYm9keTogc3RyaW5nLFxuKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3NlcmlhbGl6ZUZyb250bWF0dGVyKGZtKX1cXG5cXG4ke2JvZHl9YDtcbn1cbiIsICIvKipcbiAqIFlBTUwgXHUyMTk0IFx1OThERVx1NEU2NiBjYWxsb3V0IFx1NTNDQ1x1NTQxMVx1OEY2Q1x1NjM2Mlx1MzAwMlxuICpcbiAqIFx1NEY5RFx1NjM2RVx1RkYxQVxuICogLSBgMDNfXHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzXHU0RTBFT0JcdTY2MjBcdTVDMDQubWRgIFx1MDBBN1x1NEUwOVx1RkYwOGNhbGxvdXQgXHU5ODlDXHU4MjcyXHU2NjIwXHU1QzA0XHVGRjA5XG4gKiAtIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTRFOTRcdUZGMDhZQU1MXHUyMTkyY2FsbG91dCBcdTY2MjBcdTVDMDRcdTg4NjhcdUZGMDlcbiAqIC0gXHUwMEE3XHU1NkRCXHVGRjA4XHU1NDA4XHU1RTc2XHU0RkUxXHU2MDZGXHU1NzU3XHU4QkJFXHU4QkExXHVGRjFBXHU2MjQwXHU2NzA5XHU1QjU3XHU2QkI1XHU4RkRCXHU0RTAwXHU0RTJBIGNhbGxvdXRcdUZGMDlcbiAqXG4gKiBcdTVERjJcdTc3RTVcdTU3NTFcdUZGMDgwMyBcdTY1ODdcdTY4NjMgXHUwMEE3XHU1MzQxICsgXHUwMEE3My4zXHVGRjA5XHVGRjFBXG4gKiAtIGVtb2ppIFx1NUUyNiBVK0ZFMEYgdmFyaWF0aW9uIHNlbGVjdG9yIFx1OThERVx1NEU2Nlx1NEUwRFx1OEJBNCBcdTIxOTIgXHU1MTk5XHU1MTY1XHU1MjREIHN0cmlwXG4gKiAtIGB+YCBcdTg4QUJcdTk4REVcdTRFNjZcdThGNkNcdTRFNDlcdTYyMTAgYFxcfmAgXHUyMTkyIFx1NTZERVx1OEJGQlx1NjVGNlx1NTNDRFx1OEY2Q1x1NEU0OVxuICovXG5cbmltcG9ydCB0eXBlIHsgS25vd2xlZGdlTWV0YSwgVGFnIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQge1xuICBDQUxMT1VUX0ZJRUxEX01BUCxcbiAgVEFHX05BTUVTLFxuICBET0NfSU5GT19DQUxMT1VULFxuICBPQl9DQUxMT1VUX1RPX0ZFSVNIVSxcbiAgRkVJU0hVX0JHX1RPX09CX0NBTExPVVQsXG59IGZyb20gJy4vdHlwZXMuanMnO1xuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgZW1vamkgXHU2RTA1XHU2RDE3IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKiogXHU3OUZCXHU5NjY0IGVtb2ppIFx1NzY4NCBVK0ZFMEYgdmFyaWF0aW9uIHNlbGVjdG9yXHUzMDAyXHU5OERFXHU0RTY2XHU0RTBEXHU4QkE0XHU1RTI2IFZTIFx1NzY4NCBlbW9qaVx1RkYwODAzIFx1NjU4N1x1Njg2MyBcdTAwQTczLjNcdUZGMDlcdTMwMDIgKi9cbmNvbnN0IFZTX1JFID0gL1xcdUZFMEYvZ3U7XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhzOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcy5yZXBsYWNlKFZTX1JFLCAnJyk7XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTZDRTJcdTZENkFcdTUzRjdcdThGNkNcdTRFNDkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKiBcdTk4REVcdTRFNjYgbWQgXHU2MjhBIGB+YCBcdThGNkNcdTRFNDlcdTYyMTAgYFxcfmBcdUZGMENcdTU2REVcdThCRkJcdTY1RjZcdTUzQ0RcdTU0MTFcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiB1bmVzY2FwZUZlaXNodVRpbGRlKHM6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzLnJlcGxhY2UoL1xcXFx+L2csICd+Jyk7XG59XG5cbi8qKiBcdTUxOTlcdTUxNjVcdTk4REVcdTRFNjZcdTUyNERcdTUzQ0RcdThGNkNcdTRFNDlcdUZGMDhcdTU5ODJcdTY3OUNcdTc1MjhcdTYyMzdcdTYwRjNcdTc1MjggYH5gIFx1NTIyMFx1OTY2NFx1N0VCRlx1RkYwOVx1MzAwMlx1OThERVx1NEU2NiBtZCBcdTkxQ0MgYH5+fnRleHR+fn5gIFx1NjYyRlx1NTIyMFx1OTY2NFx1N0VCRlx1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVzY2FwZUZlaXNodVRpbGRlKHM6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIFx1NEUwRFx1NEUzQlx1NTJBOFx1OEY2Q1x1NEU0OVx1RkYwQ1x1NEZERFx1NjMwMVx1NTM5Rlx1NjgzN1x1MzAwMlx1NEVDNVx1NTcyOCBvdmVyd3JpdGUgXHU1NzNBXHU2NjZGXHU3ODZFXHU4QkE0XHU5NzAwXHU4OTgxXHU2NUY2XHU2MjRCXHU1MkE4XHU1OTA0XHU3NDA2XHUzMDAyXG4gIHJldHVybiBzO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU2ODA3XHU3QjdFXHU1MDNDXHU2ODNDXHU1RjBGXHU1MzE2IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG5mdW5jdGlvbiBmb3JtYXRUYWdWYWx1ZSh0YWc6IFRhZyB8IHVuZGVmaW5lZCk6IHN0cmluZyB7XG4gIGlmICghdGFnKSByZXR1cm4gJyc7XG4gIHJldHVybiBgJHtUQUdfTkFNRVNbdGFnXX0gJHt0YWd9YDtcbn1cblxuZnVuY3Rpb24gcGFyc2VUYWdWYWx1ZSh2YWx1ZTogc3RyaW5nKTogVGFnIHwgbnVsbCB7XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyh2YWx1ZSkudHJpbSgpO1xuICBjb25zdCBkaXJlY3QgPSBub3JtYWxpemVkLm1hdGNoKC8oPzpefFxccykoW1NYTFpRSl0pKD86XFxzfCQpLyk7XG4gIGNvbnN0IGNvbXBhY3QgPSBub3JtYWxpemVkLm1hdGNoKC9bU1hMWlFKXS8pO1xuICBjb25zdCB0YWcgPSAoZGlyZWN0Py5bMV0gPz8gY29tcGFjdD8uWzBdKSBhcyBUYWcgfCB1bmRlZmluZWQ7XG4gIHJldHVybiB0YWcgJiYgWydTJywgJ1gnLCAnTCcsICdaJywgJ1EnLCAnSiddLmluY2x1ZGVzKHRhZykgPyB0YWcgOiBudWxsO1xufVxuXG5mdW5jdGlvbiBtYXBGZWlzaHVCZ1RvT2JUeXBlKGJnQ29sb3I6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICghYmdDb2xvcikgcmV0dXJuICd0aXAnO1xuICBpZiAoRkVJU0hVX0JHX1RPX09CX0NBTExPVVRbYmdDb2xvcl0pIHJldHVybiBGRUlTSFVfQkdfVE9fT0JfQ0FMTE9VVFtiZ0NvbG9yXTtcbiAgY29uc3Qgbm9ybWFsaXplZCA9IGJnQ29sb3IucmVwbGFjZSgvXFxzKy9nLCAnJykudG9Mb3dlckNhc2UoKTtcbiAgY29uc3QgcmdiTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICdyZ2IoMjU1LDI0NSwyMzUpJzogJ3RpcCcsXG4gICAgJ3JnYigyNTQsMjEyLDE2NCknOiAndGlwJyxcbiAgICAncmdiYSgyNTUsMjQ2LDEyMiwwLjgpJzogJ3RpcCcsXG4gICAgJ3JnYigyNTUsMjQwLDI0MCknOiAnd2FybmluZycsXG4gICAgJ3JnYigyNDIsMjQzLDI0NSknOiAncXVvdGUnLFxuICAgICdyZ2IoMjQwLDI0NCwyNTUpJzogJ2luZm8nLFxuICAgICdyZ2IoMjQwLDI1MywyNDQpJzogJ3N1Y2Nlc3MnLFxuICB9O1xuICByZXR1cm4gcmdiTWFwW25vcm1hbGl6ZWRdID8/ICdhYnN0cmFjdCc7XG59XG5cbmZ1bmN0aW9uIGh0bWxCbG9ja1RvVGV4dExpbmVzKGh0bWw6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IGJsb2NrUmUgPSAvPCg/OnB8bGkpXFxiW14+XSo+KFtcXHNcXFNdKj8pPFxcLyg/OnB8bGkpPi9nO1xuICBsZXQgbTogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcbiAgd2hpbGUgKChtID0gYmxvY2tSZS5leGVjKGh0bWwpKSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IHRleHQgPSBodG1sVG9QbGFpblRleHQobVsxXSk7XG4gICAgaWYgKHRleHQpIGxpbmVzLnB1c2goLi4udGV4dC5zcGxpdCgnXFxuJykubWFwKGxpbmUgPT4gbGluZS50cmltKCkpLmZpbHRlcihCb29sZWFuKSk7XG4gIH1cbiAgaWYgKGxpbmVzLmxlbmd0aCA+IDApIHJldHVybiBsaW5lcztcbiAgY29uc3QgZmFsbGJhY2sgPSBodG1sVG9QbGFpblRleHQoaHRtbCk7XG4gIHJldHVybiBmYWxsYmFjayA/IGZhbGxiYWNrLnNwbGl0KCdcXG4nKS5tYXAobGluZSA9PiBsaW5lLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pIDogW107XG59XG5cbmZ1bmN0aW9uIGh0bWxUb1BsYWluVGV4dChodG1sOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gaHRtbFxuICAgIC5yZXBsYWNlKC88YnJcXHMqXFwvPz4vZywgJ1xcbicpXG4gICAgLnJlcGxhY2UoLzxbXj5dKz4vZywgJycpXG4gICAgLnJlcGxhY2UoLyZsdDsvZywgJzwnKVxuICAgIC5yZXBsYWNlKC8mZ3Q7L2csICc+JylcbiAgICAucmVwbGFjZSgvJmFtcDsvZywgJyYnKVxuICAgIC5yZXBsYWNlKC8mcXVvdDsvZywgJ1wiJylcbiAgICAucmVwbGFjZSgvJmFwb3M7L2csIFwiJ1wiKVxuICAgIC50cmltKCk7XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBPQlx1MjE5Mlx1OThERVx1NEU2Nlx1RkYxQVlBTUxcdTIxOTJcdTU0MDhcdTVFNzZcdTRGRTFcdTYwNkYgY2FsbG91dCBYTUwgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKlxuICogXHU1QzA2IE9CIFx1NzY4NCBZQU1MIFx1NTE0M1x1NjU3MFx1NjM2RVx1NUI1N1x1NkJCNVx1NkUzMlx1NjdEM1x1NEUzQVx1OThERVx1NEU2Nlx1NTQwOFx1NUU3Nlx1NEZFMVx1NjA2RiBjYWxsb3V0IFhNTFx1MzAwMlxuICogXHU0RjlEXHU2MzZFIGAwM19cdTY4M0NcdTVGMEZcdTg5QzRcdTgzMDMubWRgIFx1MDBBN1x1NTZEQlx1RkYwOFx1NTQwOFx1NUU3Nlx1OEZEQlx1NEUwMFx1NEUyQSBjYWxsb3V0IFx1OUFEOFx1NEVBRVx1NTc1N1x1RkYwOVx1MzAwMlxuICpcbiAqIEBwYXJhbSBtZXRhIFx1NzdFNVx1OEJDNlx1NUU5M1x1NTE0M1x1NjU3MFx1NjM2RVxuICogQHJldHVybnMgY2FsbG91dCBYTUwgXHU1QjU3XHU3QjI2XHU0RTMyXHVGRjA4XHU1NDJCIHN0cmlwIFZTXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXRhVG9DYWxsb3V0WG1sKG1ldGE6IEtub3dsZWRnZU1ldGEpOiBzdHJpbmcge1xuICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXTtcblxuICBmb3IgKGNvbnN0IGl0ZW0gb2YgQ0FMTE9VVF9GSUVMRF9NQVApIHtcbiAgICBjb25zdCByYXcgPSBtZXRhW2l0ZW0uZmllbGRdO1xuICAgIGlmIChyYXcgPT09IHVuZGVmaW5lZCB8fCByYXcgPT09IG51bGwgfHwgcmF3ID09PSAnJyB8fCAoQXJyYXkuaXNBcnJheShyYXcpICYmIHJhdy5sZW5ndGggPT09IDApKSBjb250aW51ZTtcblxuICAgIGxldCB2YWx1ZTogc3RyaW5nO1xuICAgIGlmIChpdGVtLmZpZWxkID09PSAnXHU2ODA3XHU3QjdFJykge1xuICAgICAgdmFsdWUgPSBmb3JtYXRUYWdWYWx1ZShyYXcgYXMgVGFnIHwgdW5kZWZpbmVkKTtcbiAgICB9IGVsc2UgaWYgKGl0ZW0uZmllbGQgPT09ICdcdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBJykge1xuICAgICAgdmFsdWUgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhTdHJpbmcocmF3KSk7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJhdykpIHtcbiAgICAgIHZhbHVlID0gKHJhdyBhcyBzdHJpbmdbXSkuam9pbignIFx1MDBCNyAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhTdHJpbmcocmF3KSk7XG4gICAgfVxuICAgIGlmICghdmFsdWUpIGNvbnRpbnVlO1xuXG4gICAgbGluZXMucHVzaChgPGxpPjxiPiR7aXRlbS5sYWJlbH08L2I+XHVGRjFBJHt2YWx1ZX08L2xpPmApO1xuICB9XG5cbiAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcnO1xuXG4gIGNvbnN0IHsgZW1vamksIC4uLmF0dHJzIH0gPSBET0NfSU5GT19DQUxMT1VUO1xuICBjb25zdCBhdHRyU3RyID0gT2JqZWN0LmVudHJpZXMoYXR0cnMpXG4gICAgLm1hcCgoW2ssIHZdKSA9PiBgJHtrfT1cIiR7dn1cImApXG4gICAgLmpvaW4oJyAnKTtcbiAgY29uc3QgY2xlYW5FbW9qaSA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKGVtb2ppKTtcblxuICByZXR1cm4gW1xuICAgIGA8Y2FsbG91dCBlbW9qaT1cIiR7Y2xlYW5FbW9qaX1cIiAke2F0dHJTdHJ9PmAsXG4gICAgYDxwPjxiPlx1NjU4N1x1Njg2M1x1NEZFMVx1NjA2RjwvYj48L3A+YCxcbiAgICBgPHVsPmAsXG4gICAgLi4ubGluZXMsXG4gICAgYDwvdWw+YCxcbiAgICBgPC9jYWxsb3V0PmAsXG4gICAgJycsXG4gIF0uam9pbignXFxuJyk7XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTk4REVcdTRFNjZcdTIxOTJPQlx1RkYxQVx1ODlFM1x1Njc5MFx1NTQwOFx1NUU3Nlx1NEZFMVx1NjA2RiBjYWxsb3V0IFx1MjE5MiBZQU1MIFx1NUI1N1x1NkJCNSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBcdTRFQ0VcdTk4REVcdTRFNjYgWE1MIFx1NzY4NFx1NTkzNFx1OTBFOFx1NEZFMVx1NjA2RiBjYWxsb3V0IFx1NEUyRFx1ODlFM1x1Njc5MFx1NTFGQSBZQU1MIFx1NUI1N1x1NkJCNVx1NTAzQ1x1MzAwMlxuICogXHU0RjlEXHU2MzZFIGAwM19cdTY4M0NcdTVGMEZcdTg5QzRcdTgzMDMubWRgIFx1MDBBN1x1NTZEQlx1RkYxQWA8bGk+PGI+XHU1QjU3XHU2QkI1XHU1NDBEPC9iPlx1RkYxQVx1NTAzQzwvbGk+YCBcdTY4M0NcdTVGMEZcdTMwMDJcbiAqXG4gKiBAcGFyYW0geG1sIFx1OThERVx1NEU2Nlx1NjU4N1x1Njg2MyBYTUwgXHU3MjQ3XHU2QkI1XG4gKiBAcmV0dXJucyBcdTg5RTNcdTY3OTBcdTUyMzBcdTc2ODRcdTUxNDNcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGxvdXRYbWxUb01ldGEoeG1sOiBzdHJpbmcpOiBQYXJ0aWFsPEtub3dsZWRnZU1ldGE+IHtcbiAgY29uc3QgcmVzdWx0OiBQYXJ0aWFsPEtub3dsZWRnZU1ldGE+ID0ge307XG5cbiAgLy8gXHU2MjdFXCJcdTY1ODdcdTY4NjNcdTRGRTFcdTYwNkZcImNhbGxvdXRcbiAgY29uc3QgY2FsbG91dFJlID0gLzxjYWxsb3V0XFxiW14+XSo+XFxzKjxwPjxiPlx1NjU4N1x1Njg2M1x1NEZFMVx1NjA2RjxcXC9iPjxcXC9wPlxccyo8dWw+KFtcXHNcXFNdKj8pPFxcL3VsPlxccyo8XFwvY2FsbG91dD4vO1xuICBjb25zdCBjYWxsb3V0TWF0Y2ggPSB4bWwubWF0Y2goY2FsbG91dFJlKTtcbiAgaWYgKCFjYWxsb3V0TWF0Y2gpIHJldHVybiByZXN1bHQ7XG5cbiAgY29uc3QgdWxDb250ZW50ID0gY2FsbG91dE1hdGNoWzFdO1xuICBjb25zdCBsaVJlID0gLzxsaT48Yj4oW148XSspPFxcL2I+W1x1RkYxQTpdKC4rPyk8XFwvbGk+L2c7XG4gIGxldCBtOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuXG4gIHdoaWxlICgobSA9IGxpUmUuZXhlYyh1bENvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGxhYmVsID0gbVsxXS50cmltKCk7XG4gICAgY29uc3QgdmFsdWUgPSB1bmVzY2FwZUZlaXNodVRpbGRlKG1bMl0udHJpbSgpKTtcblxuICAgIC8vIFx1NjgzOVx1NjM2RVx1NjgwN1x1N0I3RVx1NTQwRFx1NjYyMFx1NUMwNFx1NTIzMFx1NUI1N1x1NkJCNVxuICAgIGlmIChsYWJlbCA9PT0gJ1x1NjgwN1x1N0I3RScpIHtcbiAgICAgIGNvbnN0IHRhZyA9IHBhcnNlVGFnVmFsdWUodmFsdWUpO1xuICAgICAgaWYgKHRhZykgcmVzdWx0Llx1NjgwN1x1N0I3RSA9IHRhZztcbiAgICB9IGVsc2UgaWYgKGxhYmVsID09PSAnXHU3RjE2XHU3ODAxJykge1xuICAgICAgcmVzdWx0Llx1N0YxNlx1NzgwMSA9IHZhbHVlLnJlcGxhY2UoL15cdUQ4M0RcdUREMjJcXHMqLywgJycpLnRyaW0oKTtcbiAgICB9IGVsc2UgaWYgKGxhYmVsID09PSAnXHU4RjkzXHU1MTY1Jykge1xuICAgICAgcmVzdWx0Llx1OEY5M1x1NTE2NSA9IHZhbHVlLnJlcGxhY2UoL15cdUQ4M0RcdURDRTVcXHMqLywgJycpLnRyaW0oKTtcbiAgICB9IGVsc2UgaWYgKGxhYmVsID09PSAnXHU2NUU1XHU2NzFGJykge1xuICAgICAgcmVzdWx0Llx1NjVFNVx1NjcxRiA9IHZhbHVlLnJlcGxhY2UoL15cdUQ4M0RcdURDQzVcXHMqLywgJycpLnRyaW0oKTtcbiAgICB9IGVsc2UgaWYgKGxhYmVsID09PSAnXHU1MTczXHU5NTJFXHU4QkNEJykge1xuICAgICAgcmVzdWx0Llx1NTE3M1x1OTUyRVx1OEJDRCA9IHZhbHVlLnJlcGxhY2UoL15cdUQ4M0RcdUREMTFcXHMqLywgJycpLnRyaW0oKTtcbiAgICB9IGVsc2UgaWYgKGxhYmVsID09PSAnXHU4QkM0XHU1MjA2Jykge1xuICAgICAgLy8gXHU2M0QwXHU1M0Q2XHU4QkM0XHU1MjA2XHU2NjNFXHU3OTNBXHU0RTMyXHVGRjA4XHU1OTgyIFwiXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVGRjVDXHU1QjlFXHU4REY1XCJcdUZGMDlcbiAgICAgIHJlc3VsdC5cdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnModmFsdWUpO1xuICAgICAgLy8gXHU1QzFEXHU4QkQ1XHU2M0QwXHU1M0Q2XHU2NTcwXHU1QjU3XG4gICAgICBjb25zdCBzdGFyQ291bnQgPSAodmFsdWUubWF0Y2goL1x1RDgzQ1x1REYxRi9nKSB8fCBbXSkubGVuZ3RoO1xuICAgICAgaWYgKHN0YXJDb3VudCA+PSAxICYmIHN0YXJDb3VudCA8PSA1KSB7XG4gICAgICAgIHJlc3VsdC5cdThCQzRcdTUyMDYgPSBzdGFyQ291bnQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1N0QyMlx1NUYxNScpIHtcbiAgICAgIC8vIFx1N0QyMlx1NUYxNVx1NjYyRlx1NTkxQVx1N0VGNFx1NUVBNlx1NTQwOFx1NUU3Nlx1NjYzRVx1NzkzQVx1RkYwOFx1RDgzRFx1RENCMFx1NkI2M1x1OEQyMiBcdTAwQjcgXHVEODNEXHVERDM1XHU1REU1XHU0RjVDIFx1MDBCNyAuLi5cdUZGMDlcbiAgICAgIC8vIFx1OTcwMFx1ODk4MVx1OEZEQlx1NEUwMFx1NkI2NVx1NjJDNlx1NTIwNlx1NTQwNFx1N0VGNFx1NUVBNlxuICAgICAgcGFyc2VJbmRleEZpZWxkKHZhbHVlLCByZXN1bHQpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogXHU4OUUzXHU2NzkwXHU3RDIyXHU1RjE1XHU1NDA4XHU1RTc2XHU1QjU3XHU2QkI1IFwiXHVEODNEXHVEQ0IwXHU2QjYzXHU4RDIyIFx1MDBCNyBcdUQ4M0RcdUREMzVcdTVERTVcdTRGNUMgXHUwMEI3IFx1MjcwNVx1NUI4Q1x1NjIxMCBcdTAwQjcgXHVEODNDXHVERkFGXHU1MTc3XHU4QzYxIFx1MDBCNyBcdTI3MDVcdTdCODBcdTUzNTUgXHUwMEI3IFx1Mjc2NFx1RkUwRlx1NTA2NVx1NUVCN1wiXG4gKiBcdTU2REVcdTU0MDRcdTdEMjJcdTVGMTVcdTVCNTBcdTVCNTdcdTZCQjVcdTMwMDJcbiAqL1xuZnVuY3Rpb24gcGFyc2VJbmRleEZpZWxkKHZhbHVlOiBzdHJpbmcsIHJlc3VsdDogUGFydGlhbDxLbm93bGVkZ2VNZXRhPik6IHZvaWQge1xuICBjb25zdCBwYXJ0cyA9IHZhbHVlLnNwbGl0KC9bXHUwMEI3XFxuXS8pLm1hcChzID0+IHMudHJpbSgpKS5maWx0ZXIoQm9vbGVhbik7XG4gIGZvciAoY29uc3QgcGFydCBvZiBwYXJ0cykge1xuICAgIGNvbnN0IGNsZWFuZWQgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhwYXJ0KTtcbiAgICAvLyBcdTc3RTVcdThCQzZcdTVFOTNcdTdFRjRcdTVFQTZcbiAgICBmb3IgKGNvbnN0IGt3IG9mIFsnXHU2QjYzXHU4RDIyJywgJ1x1NTA0Rlx1OEQyMicsICdcdTZCNjNcdTUzNzAnLCAnXHU1MDRGXHU1MzcwJywgJ1x1NkI2M1x1NUJBQicsICdcdTRGMjRcdTVCOTgnXSkge1xuICAgICAgaWYgKGNsZWFuZWQuaW5jbHVkZXMoa3cpKSB7IHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU3N0U1XHU4QkM2XHU1RTkzID0ga3c7IGJyZWFrOyB9XG4gICAgfVxuICAgIC8vIFx1OTg5Q1x1ODI3Mlx1N0VGNFx1NUVBNlxuICAgIGZvciAoY29uc3Qga3cgb2YgWydcdTc3NjFcdTc3MjAnLCAnXHU1REU1XHU0RjVDJywgJ1x1NzUxRlx1NkQzQicsICdcdTVBMzFcdTRFNTAnLCAnXHU3OTNFXHU0RUE0JywgJ1x1NUI2Nlx1NEU2MCcsICdcdThGRDBcdTUyQTgnXSkge1xuICAgICAgaWYgKGNsZWFuZWQuaW5jbHVkZXMoa3cpKSB7IHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU5ODlDXHU4MjcyID0gY2xlYW5lZDsgYnJlYWs7IH1cbiAgICB9XG4gICAgLy8gXHU2NENEXHU0RjVDXHU3RUY0XHU1RUE2XG4gICAgZm9yIChjb25zdCBrdyBvZiBbJ1x1NjBGM1x1NkNENScsICdcdTg5QzRcdTUyMTInLCAnXHU2MjY3XHU4ODRDJywgJ1x1NTNEN1x1NjMyQicsICdcdTUxNEJcdTY3MEQnLCAnXHU1MjFEXHU3QTNGJywgJ1x1NUJBMVx1NjgzOCcsICdcdTRGRUVcdTY1MzknLCAnXHU1QjhDXHU2MjEwJywgJ1x1NTkwRFx1NzZEOCddKSB7XG4gICAgICBpZiAoY2xlYW5lZC5pbmNsdWRlcyhrdykpIHtcbiAgICAgICAgcmVzdWx0WydcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OCddID0gcmVzdWx0WydcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OCddID8/IFtdO1xuICAgICAgICBpZiAoIXJlc3VsdFsnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnXS5pbmNsdWRlcyhrdykpIHJlc3VsdFsnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnXS5wdXNoKGt3KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFx1NTc1N1x1N0VGNFx1NUVBNlx1RkYwOFx1NTkxQVx1OTAwOVx1RkYwOVxuICAgIGZvciAoY29uc3Qga3cgb2YgWydcdTYyQkRcdThDNjEnLCAnXHU1MTc3XHU4QzYxJywgJ1x1N0I4MFx1NTM1NScsICdcdTU2RjBcdTk2QkUnXSkge1xuICAgICAgaWYgKGNsZWFuZWQuaW5jbHVkZXMoa3cpICYmIGt3ICE9PSBjbGVhbmVkKSB7XG4gICAgICAgIHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU1NzU3ID0gcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTU3NTcgPz8gW107XG4gICAgICAgIGlmICghcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTU3NTcuaW5jbHVkZXMoa3cpKSByZXN1bHQuXHU3RDIyXHU1RjE1X1x1NTc1Ny5wdXNoKGt3KTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gXHU5OENFXHU5NjY5XHU3RUY0XHU1RUE2XHVGRjA4XHU1OTFBXHU5MDA5XHVGRjA5XG4gICAgZm9yIChjb25zdCBrdyBvZiBbJ1x1ODg0Q1x1NEUzQScsICdcdTdCQTFcdTc0MDYnLCAnXHU1MDY1XHU1RUI3JywgJ1x1NzdFNVx1OEJDNicsICdcdTc5M0VcdTRFQTQnLCAnXHU1QkI2XHU1RUFEJywgJ1x1NzkzRVx1NEYxQScsICdcdTYxMEZcdTU5MTYnXSkge1xuICAgICAgaWYgKGNsZWFuZWQuaW5jbHVkZXMoa3cpICYmIGt3ICE9PSBjbGVhbmVkKSB7XG4gICAgICAgIHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU5OENFXHU5NjY5ID0gcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2NjkgPz8gW107XG4gICAgICAgIGlmICghcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2NjkuaW5jbHVkZXMoa3cpKSByZXN1bHQuXHU3RDIyXHU1RjE1X1x1OThDRVx1OTY2OS5wdXNoKGt3KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIFx1NkI2M1x1NjU4NyBjYWxsb3V0IFx1NTNDQ1x1NTQxMVx1OEY2Q1x1NjM2MiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBcdTk4REVcdTRFNjZcdTZCNjNcdTY1ODcgY2FsbG91dCBYTUwgXHUyMTkyIE9CIGA+IFshdHlwZV1gIGNhbGxvdXRcdTMwMDJcbiAqIFx1NEY5RFx1NjM2RSBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTczLjFcdTMwMDJcbiAqXG4gKiBcdThGOTNcdTUxNjVcdTUzNTVcdTRFMkEgYDxjYWxsb3V0IC4uLj5jb250ZW50PC9jYWxsb3V0PmAgXHU1NzU3XHVGRjBDXHU4RjkzXHU1MUZBIE9CIG1hcmtkb3duIGNhbGxvdXRcdTMwMDJcbiAqIFx1NTkxQVx1NEUyQSBjYWxsb3V0IFx1NTc1N1x1NzUzMVx1OEMwM1x1NzUyOFx1NjVCOVx1NjJDNlx1NTIwNlx1NTQwRVx1OTAxMFx1NEUyQVx1OEMwM1x1NzUyOFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmVpc2h1Q2FsbG91dFRvT0IoeG1sOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBcdTYzRDBcdTUzRDZcdTVDNUVcdTYwMjdcbiAgY29uc3Qgb3Blbk1hdGNoID0geG1sLm1hdGNoKC88Y2FsbG91dFxcYihbXj5dKik+Lyk7XG4gIGlmICghb3Blbk1hdGNoKSByZXR1cm4geG1sO1xuXG4gIGNvbnN0IGF0dHJzID0gb3Blbk1hdGNoWzFdO1xuICBsZXQgZW1vamkgPSAnJztcbiAgbGV0IGJnQ29sb3IgPSAnJztcblxuICBjb25zdCBlbW9qaU1hdGNoID0gYXR0cnMubWF0Y2goL2Vtb2ppPVtcIiddKFteXCInXSspW1wiJ10vKTtcbiAgaWYgKGVtb2ppTWF0Y2gpIGVtb2ppID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMoZW1vamlNYXRjaFsxXSk7XG5cbiAgY29uc3QgYmdNYXRjaCA9IGF0dHJzLm1hdGNoKC9iYWNrZ3JvdW5kLWNvbG9yPVtcIiddKFteXCInXSspW1wiJ10vKTtcbiAgaWYgKGJnTWF0Y2gpIGJnQ29sb3IgPSBiZ01hdGNoWzFdO1xuXG4gIC8vIFx1NjNEMFx1NTNENlx1NTE4NVx1NUJCOVx1RkYwOFx1NTNCQlx1NjM4OSBvcGVuL2Nsb3NlIHRhZ1x1RkYwOVxuICBjb25zdCBjb250ZW50ID0geG1sXG4gICAgLnJlcGxhY2UoLzxjYWxsb3V0XFxiW14+XSo+LywgJycpXG4gICAgLnJlcGxhY2UoLzxcXC9jYWxsb3V0Pi8sICcnKVxuICAgIC50cmltKCk7XG5cbiAgLy8gXHU2NjIwXHU1QzA0IGNhbGxvdXQgXHU3QzdCXHU1NzhCXG4gIGNvbnN0IG9iVHlwZSA9IG1hcEZlaXNodUJnVG9PYlR5cGUoYmdDb2xvcik7XG4gIGNvbnN0IGxpbmVzID0gaHRtbEJsb2NrVG9UZXh0TGluZXMoY29udGVudCk7XG4gIGNvbnN0IHRpdGxlID0gYD4gWyEke29iVHlwZX1dJHtlbW9qaSA/IGAgJHtlbW9qaX1gIDogJyd9YDtcblxuICBpZiAobGluZXMubGVuZ3RoID09PSAwKSByZXR1cm4gdGl0bGU7XG4gIHJldHVybiBbdGl0bGUsIC4uLmxpbmVzLm1hcChsaW5lID0+IGA+ICR7bGluZX1gKV0uam9pbignXFxuJyk7XG59XG5cbi8qKlxuICogXHU2Mjc5XHU5MUNGXHU1QzA2XHU5OERFXHU0RTY2IFhNTCBcdTkxQ0NcdTc2ODRcdTYyNDBcdTY3MDkgY2FsbG91dCBcdTU3NTdcdThGNkNcdTYzNjJcdTRFM0EgT0IgY2FsbG91dFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydEZlaXNodUNhbGxvdXRzVG9PQih4bWw6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGNhbGxvdXRSZSA9IC88Y2FsbG91dFxcYltePl0qPltcXHNcXFNdKj88XFwvY2FsbG91dD4vZztcbiAgcmV0dXJuIHhtbC5yZXBsYWNlKGNhbGxvdXRSZSwgKG1hdGNoKSA9PiBmZWlzaHVDYWxsb3V0VG9PQihtYXRjaCkpO1xufVxuXG4vKipcbiAqIE9CIGA+IFshdHlwZV1gIGNhbGxvdXQgXHUyMTkyIFx1OThERVx1NEU2NiBjYWxsb3V0IFhNTFx1MzAwMlxuICogXHU0RjlEXHU2MzZFIGAwM19cdTY4M0NcdTVGMEZcdTg5QzRcdTgzMDMubWRgIFx1MDBBNzMuMlx1MzAwMlxuICpcbiAqIFx1OEY5M1x1NTE2NVx1NTM1NVx1NEUyQSBPQiBjYWxsb3V0IFx1NTc1N1x1RkYwOFx1NTQyQiBgPiBbIXR5cGVdYCBcdTk5OTZcdTg4NEMgKyBcdTVCNTBcdTg4NENcdUZGMDlcdTMwMDJcbiAqIFx1NTkxQVx1NEUyQSBjYWxsb3V0IFx1NzUzMVx1OEMwM1x1NzUyOFx1NjVCOVx1NjJDNlx1NTIwNlx1NTQwRVx1OTAxMFx1NEUyQVx1OEMwM1x1NzUyOFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gb2JDYWxsb3V0VG9GZWlzaHUobWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGxpbmVzID0gbWQuc3BsaXQoJ1xcbicpLm1hcChsID0+IGwucmVwbGFjZSgvXj5cXHM/LywgJycpKTtcbiAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG1kO1xuXG4gIC8vIFx1ODlFM1x1Njc5MFx1OTk5Nlx1ODg0QyBgPiBbIXR5cGVdYFxuICBjb25zdCBoZWFkZXJNYXRjaCA9IGxpbmVzWzBdLm1hdGNoKC9cXFshKFxcdyspXFxdXFxzKiguKikvKTtcbiAgaWYgKCFoZWFkZXJNYXRjaCkgcmV0dXJuIG1kO1xuXG4gIGNvbnN0IG9iVHlwZSA9IGhlYWRlck1hdGNoWzFdO1xuICBsZXQgcmVzdCA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKGhlYWRlck1hdGNoWzJdID8/ICcnKS50cmltKCk7XG4gIGNvbnN0IGZlaXNodSA9IE9CX0NBTExPVVRfVE9fRkVJU0hVW29iVHlwZV07XG5cbiAgbGV0IGVtb2ppID0gZmVpc2h1Py5lbW9qaSA/PyAnXHVEODNEXHVEQ0ExJztcbiAgbGV0IGJnID0gZmVpc2h1Py5iZyA/PyAnbGlnaHQtYmx1ZSc7XG4gIGxldCBib3JkZXIgPSBmZWlzaHU/LmJvcmRlciA/PyAnYmx1ZSc7XG5cbiAgLy8gXHU1QzFEXHU4QkQ1XHU0RUNFXHU5OTk2XHU4ODRDXHU1MjY5XHU0RjU5XHU1MTg1XHU1QkI5XHU2M0QwXHU1M0Q2XHU3NTI4XHU2MjM3XHU1MTk5XHU3Njg0IGVtb2ppXHVGRjBDXHU1RTc2XHU0RUNFXHU2QjYzXHU2NTg3XHU0RTJEXHU3OUZCXHU5NjY0XHUzMDAyXG4gIGNvbnN0IGVtb2ppTWF0Y2ggPSByZXN0Lm1hdGNoKC9eKFxccHtFeHRlbmRlZF9QaWN0b2dyYXBoaWN9KVxccyovdSk7XG4gIGlmIChlbW9qaU1hdGNoKSB7XG4gICAgZW1vamkgPSBlbW9qaU1hdGNoWzFdO1xuICAgIHJlc3QgPSByZXN0LnNsaWNlKGVtb2ppTWF0Y2hbMF0ubGVuZ3RoKS50cmltU3RhcnQoKTtcbiAgfVxuXG4gIC8vIFx1NTE4NVx1NUJCOVx1RkYwOFx1OTk5Nlx1ODg0Q1x1NTNCQlx1NjM4OSBlbW9qaSArIFx1NTQwRVx1N0VFRFx1NUI1MFx1ODg0Q1x1RkYwOVxuICBjb25zdCBib2R5TGluZXMgPSBsaW5lcy5zbGljZSgxKTtcbiAgaWYgKHJlc3QpIHtcbiAgICBib2R5TGluZXMudW5zaGlmdChyZXN0KTtcbiAgfVxuICBjb25zdCBjb250ZW50SHRtbCA9IGJvZHlMaW5lc1xuICAgIC5maWx0ZXIobCA9PiBsLnRyaW0oKSlcbiAgICAubWFwKGwgPT4gYDxwPiR7bH08L3A+YClcbiAgICAuam9pbignXFxuJyk7XG5cbiAgcmV0dXJuIFtcbiAgICBgPGNhbGxvdXQgZW1vamk9XCIke2Vtb2ppfVwiIGJhY2tncm91bmQtY29sb3I9XCIke2JnfVwiIGJvcmRlci1jb2xvcj1cIiR7Ym9yZGVyfVwiPmAsXG4gICAgY29udGVudEh0bWwsXG4gICAgYDwvY2FsbG91dD5gLFxuICBdLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIFx1NjI3OVx1OTFDRlx1NUMwNiBPQiBtZCBcdTkxQ0NcdTc2ODRcdTYyNDBcdTY3MDkgYD4gWyF0eXBlXWAgY2FsbG91dCBcdThGNkNcdTYzNjJcdTRFM0FcdTk4REVcdTRFNjYgWE1MIGNhbGxvdXRcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRPQkNhbGxvdXRzVG9GZWlzaHUobWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIFx1NTMzOVx1OTE0RFx1OEZERVx1N0VFRFx1NzY4NCBjYWxsb3V0IFx1NTc1N1x1RkYwOFx1NEVFNSA+IFshIFx1NUYwMFx1NTkzNFx1NzY4NFx1ODg0Q1x1RkYwQ1x1NzZGNFx1NTIzMFx1OTc1RSA+IFx1NjIxNlx1N0E3QVx1ODg0Q1x1RkYwOVxuICBjb25zdCBjYWxsb3V0UmUgPSAvKD86Xj4gXFxbIVxcdytcXF0uKlxcbig/Ol4+LipcXG4/KSopL2dtO1xuICByZXR1cm4gbWQucmVwbGFjZShjYWxsb3V0UmUsIChtYXRjaCkgPT4gb2JDYWxsb3V0VG9GZWlzaHUobWF0Y2gpKTtcbn1cbiIsICIvKipcbiAqIFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1NjNBOFx1NUJGQ1x1MzAwMlx1NEY5RFx1NjM2RSBgMDFfT0JcdTIxOTRcdTk4REVcdTRFNjZcdTVCRjlcdTZCRDRcdTYyQTVcdTU0NEEubWRgICsgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3XHU0RTAzXHUzMDAyXG4gKlxuICogT0IgMjUgXHU0RTJBXHU2ODM5XHU3NkVFXHU1RjU1IFx1MjE5MiBcdTk4REVcdTRFNjYgNSBcdTRFMkFcdTk4NzZcdTdFQTdcdTgyODJcdTcwQjlcdTc2ODRcdTY2MjBcdTVDMDRcdTg5QzRcdTUyMTlcdUZGMUFcbiAqICAgMFx1RkUwRlx1MjBFM1x1OEY5M1x1NTE2NSAvIFMgXHUyMTkyIFx1OThERVx1NEU2NlwiXHU4RjkzXHU1MTY1XCJcbiAqICAgMVx1RkUwRlx1MjBFM1x1OEY5M1x1NTFGQSAvIFggXHUyMTkyIFx1OThERVx1NEU2NlwiXHU4RjkzXHU1MUZBXCJcbiAqICAgMlx1RkUwRlx1MjBFM1x1RDgzRFx1RERDM1x1NzdFNVx1OEJDNlx1NkM2MCAvIFogLyBMIC8gSiAvIFEgXHUyMTkyIFx1OThERVx1NEU2NlwiXHU3N0U1XHU4QkM2XHU2QzYwXCJcbiAqICAgXHVEODNFXHVERUE3XHU1QkZDXHU1RjE1IFx1MjE5MiBcdTk4REVcdTRFNjZcIlx1NUJGQ1x1NUYxNVwiXG4gKiAgIDNcdUZFMEZcdTIwRTNcdTk2NDRcdTRFRjZcdTY1ODdcdTRFRjYgXHUyMTkyIFx1OThERVx1NEU2NlwiXHU5NjQ0XHU0RUY2XCJcdUZGMDhcdTcyNzlcdTZCOEFcdUZGMENcdTk3NUVcdTY1ODdcdTY4NjNcdUZGMDlcbiAqXG4gKiBcdTYzQThcdTVCRkNcdTdFRDNcdTY3OUNcdTdGMTNcdTVCNThcdTUyMzAgYC5mZWlzaHUtc3luYy9tYXBwaW5nLmpzb25gXHVGRjBDXHU0RTBEXHU3ODZDXHU3RjE2XHU3ODAxXHUzMDAyXG4gKi9cbmltcG9ydCB7IE5vdGljZSwgVEZvbGRlciwgdHlwZSBBcHAgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBsaXN0V2lraUNoaWxkcmVuIH0gZnJvbSAnLi9sYXJrL2NsaS5qcyc7XG5cbmNvbnN0IE1BUFBJTkdfRklMRSA9ICcuZmVpc2h1LXN5bmMvbWFwcGluZy5qc29uJztcblxuLyoqIFx1NTM1NVx1Njc2MVx1NjYyMFx1NUMwNFx1RkYxQU9CIFx1OERFRlx1NUY4NCBcdTIxOTIgXHU5OERFXHU0RTY2XHU4MjgyXHU3MEI5XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIERpck1hcHBpbmcge1xuICAvKiogT0IgXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU1OTgyIFwiMFx1RkUwRlx1MjBFM1x1OEY5M1x1NTE2NS9cdUQ4M0RcdURDQTFcdTc4OEVcdTcyNDdcdThGOTNcdTUxNjVcdUZGMDhcdTk1RUFcdTVGRjVcdUZGMDlcIlx1MzAwMiAqL1xuICBvYlBhdGg6IHN0cmluZztcbiAgLyoqIFx1OThERVx1NEU2NiBub2RlX3Rva2VuXHUzMDAyICovXG4gIGZlaXNodU5vZGVUb2tlbjogc3RyaW5nO1xuICAvKiogXHU5OERFXHU0RTY2XHU4MjgyXHU3MEI5XHU2ODA3XHU5ODk4XHUzMDAyICovXG4gIGZlaXNodVRpdGxlOiBzdHJpbmc7XG59XG5cbi8qKiBcdTY2MjBcdTVDMDRcdTdGMTNcdTVCNThcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWFwcGluZ0NhY2hlIHtcbiAgLyoqIFx1NzUxRlx1NjIxMFx1NjVGNlx1OTVGNFx1MzAwMiAqL1xuICBnZW5lcmF0ZWRBdDogc3RyaW5nO1xuICAvKiogc3BhY2VfaWRcdTMwMDIgKi9cbiAgc3BhY2VJZDogc3RyaW5nO1xuICAvKiogXHU5ODc2XHU3RUE3XHU4MjgyXHU3MEI5XHUzMDAyICovXG4gIHRvcE5vZGVzOiBBcnJheTx7IHRva2VuOiBzdHJpbmc7IHRpdGxlOiBzdHJpbmcgfT47XG4gIC8qKiBcdThCRTZcdTdFQzZcdTY2MjBcdTVDMDRcdTMwMDIgKi9cbiAgbWFwcGluZ3M6IERpck1hcHBpbmdbXTtcbn1cblxuLyoqIE9CIFx1NjgzOVx1NzZFRVx1NUY1NSBlbW9qaSBcdTIxOTIgXHU5OERFXHU0RTY2XHU5ODc2XHU3RUE3XHU4MjgyXHU3MEI5XHU2ODA3XHU5ODk4XHVGRjA4XHU0RjlEXHU2MzZFIDAxIFx1NUJGOVx1NkJENFx1NjJBNVx1NTQ0QVx1RkYwOVx1MzAwMiAqL1xuY29uc3QgUk9PVF9ESVJfVE9fRkVJU0hVOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAnMFx1RkUwRlx1MjBFM1x1OEY5M1x1NTE2NSc6ICdcdThGOTNcdTUxNjUnLFxuICAnMVx1RkUwRlx1MjBFM1x1OEY5M1x1NTFGQSc6ICdcdThGOTNcdTUxRkEnLFxuICAnMlx1RkUwRlx1MjBFM1x1RDgzRFx1RERDM1x1NzdFNVx1OEJDNlx1NkM2MCc6ICdcdTc3RTVcdThCQzZcdTZDNjAnLFxuICAnM1x1RkUwRlx1MjBFM1x1OTY0NFx1NEVGNlx1NjU4N1x1NEVGNic6ICdcdTk2NDRcdTRFRjYnLFxuICAnXHVEODNFXHVERUE3XHU1QkZDXHU1RjE1JzogJ1x1NUJGQ1x1NUYxNScsXG59O1xuXG4vKipcbiAqIFx1NjNBOFx1NUJGQ1x1NUU3Nlx1N0YxM1x1NUI1OFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1MzAwMlxuICogMS4gXHU2MkM5XHU5OERFXHU0RTY2XHU5ODc2XHU3RUE3XHU4MjgyXHU3MEI5XHU1MjE3XHU4ODY4XG4gKiAyLiBcdTYzMDkgZW1vamkgXHU4OUM0XHU1MjE5XHU1MzM5XHU5MTREIE9CIFx1NjgzOVx1NzZFRVx1NUY1NSBcdTIxOTIgXHU5OERFXHU0RTY2XHU5ODc2XHU3RUE3XG4gKiAzLiBcdTkwMTJcdTVGNTJcdTUzMzlcdTkxNERcdTVCNTBcdTc2RUVcdTVGNTVcdUZGMDhcdTYzMDlcdTY4MDdcdTk4OThcdTZBMjFcdTdDQ0FcdTUzMzlcdTkxNERcdUZGMDlcbiAqIDQuIFx1NTE5OVx1NTE2NSAuZmVpc2h1LXN5bmMvbWFwcGluZy5qc29uXG4gKlxuICogQHJldHVybnMgXHU2M0E4XHU1QkZDXHU3Njg0XHU2NjIwXHU1QzA0XHU2NTcwXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWZyZXNoTWFwcGluZyhhcHA6IEFwcCwgc3BhY2VJZDogc3RyaW5nKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgaWYgKCFzcGFjZUlkKSB7XG4gICAgbmV3IE5vdGljZSgnXHUyNkEwXHVGRTBGIFx1NjcyQVx1OTE0RFx1N0Y2RSBzcGFjZV9pZFx1RkYwQ1x1OEJGN1x1NTcyOFx1OEJCRVx1N0Y2RVx1OTg3NVx1NTg2Qlx1NTE5OScpO1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgbmV3IE5vdGljZSgnXHVEODNEXHVERDA0IFx1NjNBOFx1NUJGQ1x1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNC4uLicpO1xuXG4gIC8vIFx1NjJDOSA1IFx1NEUyQVx1OTg3Nlx1N0VBN1x1ODI4Mlx1NzBCOVxuICBjb25zdCB0b3BOb2RlcyA9IGxpc3RXaWtpQ2hpbGRyZW4oc3BhY2VJZCwgJycpO1xuICBpZiAodG9wTm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgbmV3IE5vdGljZSgnXHUyNkEwXHVGRTBGIFx1NjJDOVx1NEUwRFx1NTIzMFx1OThERVx1NEU2Nlx1OTg3Nlx1N0VBN1x1ODI4Mlx1NzBCOVx1RkYwQ1x1OEJGN1x1NjhDMFx1NjdFNSBzcGFjZV9pZCBcdTU0OEMgbGFyay1jbGkgXHU3NjdCXHU1RjU1XHU2MDAxJyk7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBjb25zdCBtYXBwaW5nczogRGlyTWFwcGluZ1tdID0gW107XG5cbiAgLy8gXHU5ODc2XHU3RUE3XHU1MzM5XHU5MTREXG4gIGZvciAoY29uc3QgW29iUm9vdCwgZmVpc2h1VGl0bGVdIG9mIE9iamVjdC5lbnRyaWVzKFJPT1RfRElSX1RPX0ZFSVNIVSkpIHtcbiAgICBjb25zdCBtYXRjaGVkID0gdG9wTm9kZXMuZmluZChuID0+IG4udGl0bGUuaW5jbHVkZXMoZmVpc2h1VGl0bGUpIHx8IGZlaXNodVRpdGxlLmluY2x1ZGVzKG4udGl0bGUpKTtcbiAgICBpZiAobWF0Y2hlZCkge1xuICAgICAgbWFwcGluZ3MucHVzaCh7XG4gICAgICAgIG9iUGF0aDogb2JSb290LFxuICAgICAgICBmZWlzaHVOb2RlVG9rZW46IG1hdGNoZWQubm9kZV90b2tlbixcbiAgICAgICAgZmVpc2h1VGl0bGU6IG1hdGNoZWQudGl0bGUsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBcdTkwMTJcdTVGNTJcdTUzMzlcdTkxNERcdTVCNTBcdTc2RUVcdTVGNTVcdUZGMDhcdTRFMDBcdTdFQTdcdTUzNzNcdTUzRUZcdUZGMENcdTkwN0ZcdTUxNERcdThGQzdcdTZERjFcdUZGMDlcbiAgY29uc3Qgcm9vdCA9IGFwcC52YXVsdC5nZXRSb290KCk7XG4gIGZvciAoY29uc3QgY2hpbGQgb2Ygcm9vdC5jaGlsZHJlbikge1xuICAgIGlmICghKGNoaWxkIGluc3RhbmNlb2YgVEZvbGRlcikpIGNvbnRpbnVlO1xuICAgIGlmICghY2hpbGQubmFtZSB8fCBjaGlsZC5uYW1lLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgaWYgKCFjaGlsZC5jaGlsZHJlbi5sZW5ndGgpIGNvbnRpbnVlO1xuICAgIC8vIFx1NjI3RVx1NTIzMFx1OEZEOVx1NEUyQVx1NjgzOVx1NzY4NFx1OThERVx1NEU2NiB0b2tlblxuICAgIGNvbnN0IHJvb3RNYXBwaW5nID0gbWFwcGluZ3MuZmluZChtID0+IG0ub2JQYXRoID09PSBjaGlsZC5uYW1lKTtcbiAgICBpZiAoIXJvb3RNYXBwaW5nKSBjb250aW51ZTtcblxuICAgIC8vIFx1NjJDOVx1OThERVx1NEU2Nlx1NUI1MFx1ODI4Mlx1NzBCOVxuICAgIGNvbnN0IGZlaXNodUNoaWxkcmVuID0gbGlzdFdpa2lDaGlsZHJlbihzcGFjZUlkLCByb290TWFwcGluZy5mZWlzaHVOb2RlVG9rZW4pO1xuICAgIGZvciAoY29uc3Qgb2JTdWIgb2YgY2hpbGQuY2hpbGRyZW4pIHtcbiAgICAgIGlmICghb2JTdWIubmFtZSB8fCBvYlN1Yi5uYW1lLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAvLyBcdTZBMjFcdTdDQ0FcdTUzMzlcdTkxNERcdUZGMDhcdTUzQkJcdTYzODlcdTdGMTZcdTc4MDFcdTUyNERcdTdGMDBcdTU0MEVcdTZCRDRcdThGODNcdUZGMDlcbiAgICAgIGNvbnN0IGNsZWFuT2JOYW1lID0gb2JTdWIubmFtZS5yZXBsYWNlKC9eXFxkezJ9X1xcZHs0fV9bU1haTFFKXVxcZCtcXHMqLywgJycpO1xuICAgICAgY29uc3QgbWF0Y2hlZCA9IGZlaXNodUNoaWxkcmVuLmZpbmQoXG4gICAgICAgIG4gPT4gbi50aXRsZS5pbmNsdWRlcyhjbGVhbk9iTmFtZSkgfHwgY2xlYW5PYk5hbWUuaW5jbHVkZXMobi50aXRsZSksXG4gICAgICApO1xuICAgICAgaWYgKG1hdGNoZWQpIHtcbiAgICAgICAgbWFwcGluZ3MucHVzaCh7XG4gICAgICAgICAgb2JQYXRoOiBgJHtjaGlsZC5uYW1lfS8ke29iU3ViLm5hbWV9YCxcbiAgICAgICAgICBmZWlzaHVOb2RlVG9rZW46IG1hdGNoZWQubm9kZV90b2tlbixcbiAgICAgICAgICBmZWlzaHVUaXRsZTogbWF0Y2hlZC50aXRsZSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gXHU1MTk5XHU3RjEzXHU1QjU4XG4gIGNvbnN0IGNhY2hlOiBNYXBwaW5nQ2FjaGUgPSB7XG4gICAgZ2VuZXJhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICBzcGFjZUlkLFxuICAgIHRvcE5vZGVzOiB0b3BOb2Rlcy5tYXAobiA9PiAoeyB0b2tlbjogbi5ub2RlX3Rva2VuLCB0aXRsZTogbi50aXRsZSB9KSksXG4gICAgbWFwcGluZ3MsXG4gIH07XG5cbiAgYXdhaXQgZW5zdXJlQ29uZmlnRGlyKGFwcCk7XG4gIGF3YWl0IGFwcC52YXVsdC5hZGFwdGVyLndyaXRlKE1BUFBJTkdfRklMRSwgSlNPTi5zdHJpbmdpZnkoY2FjaGUsIG51bGwsIDIpKTtcblxuICBuZXcgTm90aWNlKGBcdTI3MDUgXHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0XHU1REYyXHU2NkY0XHU2NUIwXHVGRjA4JHttYXBwaW5ncy5sZW5ndGh9IFx1Njc2MVx1RkYwOWApO1xuICByZXR1cm4gbWFwcGluZ3MubGVuZ3RoO1xufVxuXG4vKipcbiAqIFx1OEJGQlx1NjYyMFx1NUMwNFx1N0YxM1x1NUI1OFx1MzAwMlx1NjVFMFx1N0YxM1x1NUI1OFx1OEZENFx1NTZERSBudWxsXHUzMDAyXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkTWFwcGluZyhhcHA6IEFwcCk6IFByb21pc2U8TWFwcGluZ0NhY2hlIHwgbnVsbD4ge1xuICB0cnkge1xuICAgIGlmICghKGF3YWl0IGFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhNQVBQSU5HX0ZJTEUpKSkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgcmF3ID0gYXdhaXQgYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChNQVBQSU5HX0ZJTEUpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKHJhdykgYXMgTWFwcGluZ0NhY2hlO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tzeW5jL21hcHBpbmddIGxvYWQgZmFpbGVkOicsIGVycik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTY3RTUgT0IgXHU4REVGXHU1Rjg0XHU1QkY5XHU1RTk0XHU3Njg0XHU5OERFXHU0RTY2XHU4MjgyXHU3MEI5IHRva2VuXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb29rdXBGZWlzaHVOb2RlKGNhY2hlOiBNYXBwaW5nQ2FjaGUsIG9iUGF0aDogc3RyaW5nKTogRGlyTWFwcGluZyB8IG51bGwge1xuICAvLyBcdTdDQkVcdTc4NkVcdTUzMzlcdTkxNERcbiAgY29uc3QgZXhhY3QgPSBjYWNoZS5tYXBwaW5ncy5maW5kKG0gPT4gbS5vYlBhdGggPT09IG9iUGF0aCk7XG4gIGlmIChleGFjdCkgcmV0dXJuIGV4YWN0O1xuXG4gIC8vIFx1NTI0RFx1N0YwMFx1NTMzOVx1OTE0RFx1RkYwOFx1NTNENlx1NjcwMFx1OTU3Rlx1NTMzOVx1OTE0RFx1RkYwOVxuICBsZXQgYmVzdDogRGlyTWFwcGluZyB8IG51bGwgPSBudWxsO1xuICBmb3IgKGNvbnN0IG0gb2YgY2FjaGUubWFwcGluZ3MpIHtcbiAgICBpZiAob2JQYXRoLnN0YXJ0c1dpdGgobS5vYlBhdGggKyAnLycpIHx8IG9iUGF0aC5zdGFydHNXaXRoKG0ub2JQYXRoKSkge1xuICAgICAgaWYgKCFiZXN0IHx8IG0ub2JQYXRoLmxlbmd0aCA+IGJlc3Qub2JQYXRoLmxlbmd0aCkgYmVzdCA9IG07XG4gICAgfVxuICB9XG4gIHJldHVybiBiZXN0O1xufVxuXG5hc3luYyBmdW5jdGlvbiBlbnN1cmVDb25maWdEaXIoYXBwOiBBcHApOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgZGlyID0gJy5mZWlzaHUtc3luYyc7XG4gIGlmICghKGF3YWl0IGFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhkaXIpKSkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBhcHAudmF1bHQuYWRhcHRlci5ta2RpcihkaXIpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLyogaWdub3JlICovXG4gICAgfVxuICB9XG59XG4iLCAiLyoqXG4gKiBcdTY3MkNcdTU3MzAgSFRUUCBzZXJ2ZXJcdTMwMDJcdTRGOURcdTYzNkVcdTY1QjlcdTY4NDggXHUwMEE3Mlx1RkYwOGxvY2FsaG9zdCBIVFRQIFx1NTM0Rlx1OEJBRVx1RkYwOVx1MzAwMlxuICpcbiAqIC0gXHU3NTI4IG5vZGU6aHR0cCBcdThENzcgc2VydmVyXHVGRjA4T0IgXHU2M0QyXHU0RUY2IGlzRGVza3RvcE9ubHlcdUZGMENcdTUzRUZcdTc1Mjggbm9kZSBcdTUxODVcdTdGNkVcdTZBMjFcdTU3NTdcdUZGMDlcbiAqIC0gXHU3QUVGXHU1M0UzXHU1M0VGXHU5MTREXHU3RjZFXHVGRjA4XHU5RUQ4XHU4QkE0IDQ1NjdcdUZGMDlcbiAqIC0gXHU5Mjc0XHU2NzQzXHVGRjFBXHU2QkNGXHU0RTJBXHU4QkY3XHU2QzQyXHU2ODIxXHU5QThDIFgtU3luYy1Ub2tlbiBoZWFkZXJcbiAqIC0gQ09SU1x1RkYxQVx1NjUzRVx1OTAxQSBPUFRJT05TIFx1OTg4NFx1NjhDMFx1RkYwOFx1NjI2OVx1NUM1NVx1NEVDRVx1OThERVx1NEU2Nlx1OTg3NVx1OTc2MiBmZXRjaCBcdTRGMUFcdTg4QUJcdTYyRTZcdUZGMDlcbiAqIC0gXHU4REVGXHU3NTMxXHU1MjA2XHU1M0QxXHU1MjMwIGhhbmRsZXJzXG4gKi9cbmltcG9ydCAqIGFzIGh0dHAgZnJvbSAnbm9kZTpodHRwJztcbmltcG9ydCB7IFRPS0VOX0hFQURFUiB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VydmVyRGVwcyB7XG4gIC8qKiBcdTY4MjFcdTlBOEMgdG9rZW4gXHU2NjJGXHU1NDI2XHU1MzM5XHU5MTREXHUzMDAyICovXG4gIHZhbGlkYXRlVG9rZW46ICh0b2tlbjogc3RyaW5nKSA9PiBib29sZWFuO1xuICAvKiogXHU4REVGXHU3NTMxXHU1OTA0XHU3NDA2XHU1NjY4XHU2NjIwXHU1QzA0XHUzMDAyICovXG4gIHJvdXRlczogTWFwPHN0cmluZywgUm91dGVIYW5kbGVyPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0Q29udGV4dCB7XG4gIG1ldGhvZDogc3RyaW5nO1xuICB1cmw6IHN0cmluZztcbiAgLyoqIFx1ODlFM1x1Njc5MFx1NTQwRVx1NzY4NCBwYXRoXHVGRjA4XHU0RTBEXHU1NDJCIHF1ZXJ5XHVGRjA5XHUzMDAyICovXG4gIHBhdGg6IHN0cmluZztcbiAgLyoqIHF1ZXJ5IFx1NTNDMlx1NjU3MFx1MzAwMiAqL1xuICBxdWVyeTogVVJMU2VhcmNoUGFyYW1zO1xuICAvKiogXHU4QkY3XHU2QzQyXHU0RjUzXHVGRjA4UE9TVC9QVVQgXHU2MjREXHU2NzA5XHVGRjBDXHU1REYyIHBhcnNlIEpTT05cdUZGMDlcdTMwMDIgKi9cbiAgYm9keT86IHVua25vd247XG4gIC8qKiBcdTUzOUZcdTU5Q0IgdG9rZW5cdTMwMDIgKi9cbiAgdG9rZW46IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgUm91dGVIYW5kbGVyID0gKGN0eDogUmVxdWVzdENvbnRleHQpID0+IFByb21pc2U8dW5rbm93bj4gfCB1bmtub3duO1xuXG4vKiogSlNPTiBcdTU0Q0RcdTVFOTRcdTVERTVcdTUxNzdcdTMwMDIgKi9cbmZ1bmN0aW9uIGpzb24ocmVzOiBodHRwLlNlcnZlclJlc3BvbnNlLCBzdGF0dXM6IG51bWJlciwgZGF0YTogdW5rbm93bik6IHZvaWQge1xuICBjb25zdCBib2R5ID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gIHJlcy53cml0ZUhlYWQoc3RhdHVzLCB7XG4gICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04JyxcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogYCR7VE9LRU5fSEVBREVSfSwgQ29udGVudC1UeXBlYCxcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsIFBPU1QsIE9QVElPTlMnLFxuICAgICdDb250ZW50LUxlbmd0aCc6IEJ1ZmZlci5ieXRlTGVuZ3RoKGJvZHkpLFxuICB9KTtcbiAgcmVzLmVuZChib2R5KTtcbn1cblxuLyoqXG4gKiBcdTU0MkZcdTUyQTggSFRUUCBzZXJ2ZXJcdTMwMDJcbiAqIEByZXR1cm5zIHN0b3AoKSBcdTUxRkRcdTY1NzBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0U2VydmVyKHBvcnQ6IG51bWJlciwgZGVwczogU2VydmVyRGVwcyk6IFByb21pc2U8eyBzdG9wOiAoKSA9PiBQcm9taXNlPHZvaWQ+IH0+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcihhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgIC8vIENPUlMgXHU5ODg0XHU2OEMwXG4gICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgICAgIHJlcy53cml0ZUhlYWQoMjA0LCB7XG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6IGAke1RPS0VOX0hFQURFUn0sIENvbnRlbnQtVHlwZWAsXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULCBQT1NULCBPUFRJT05TJyxcbiAgICAgICAgfSk7XG4gICAgICAgIHJlcy5lbmQoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTg5RTNcdTY3OTAgVVJMXG4gICAgICBjb25zdCBmdWxsVXJsID0gcmVxLnVybCA/PyAnLyc7XG4gICAgICBjb25zdCB1cmxPYmogPSBuZXcgVVJMKGZ1bGxVcmwsIGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH1gKTtcbiAgICAgIGNvbnN0IGN0eFBhdGggPSB1cmxPYmoucGF0aG5hbWU7XG5cbiAgICAgIC8vIFx1OEJGQlx1NTNENiBib2R5XHVGRjA4UE9TVC9QVVRcdUZGMDlcbiAgICAgIGxldCBib2R5OiB1bmtub3duO1xuICAgICAgaWYgKHJlcS5tZXRob2QgPT09ICdQT1NUJyB8fCByZXEubWV0aG9kID09PSAnUFVUJykge1xuICAgICAgICBjb25zdCBjaHVua3M6IEJ1ZmZlcltdID0gW107XG4gICAgICAgIGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2YgcmVxKSB7XG4gICAgICAgICAgY2h1bmtzLnB1c2goY2h1bmsgYXMgQnVmZmVyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByYXcgPSBCdWZmZXIuY29uY2F0KGNodW5rcykudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgaWYgKHJhdykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBib2R5ID0gSlNPTi5wYXJzZShyYXcpO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAganNvbihyZXMsIDQwMCwgeyBvazogZmFsc2UsIGNvZGU6ICdCQURfSlNPTicsIG1lc3NhZ2U6ICdJbnZhbGlkIEpTT04gYm9keScgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFx1OTI3NFx1Njc0M1x1RkYwOC9zdGF0dXMgXHU1MTQxXHU4QkI4XHU2NUUwIHRva2VuIFx1NjNBMlx1NkQ0Qlx1RkYwQ1x1NEY0Nlx1NUI5RVx1OTY0NVx1NjNFMVx1NjI0Qlx1OTcwMFx1ODk4MVx1RkYwOVxuICAgICAgY29uc3QgdG9rZW4gPSByZXEuaGVhZGVyc1tUT0tFTl9IRUFERVIudG9Mb3dlckNhc2UoKV0gYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgaWYgKGN0eFBhdGggIT09ICcvc3RhdHVzJyAmJiAhZGVwcy52YWxpZGF0ZVRva2VuKHRva2VuID8/ICcnKSkge1xuICAgICAgICBqc29uKHJlcywgNDAxLCB7IG9rOiBmYWxzZSwgY29kZTogJ1VOQVVUSE9SSVpFRCcsIG1lc3NhZ2U6ICdJbnZhbGlkIG9yIG1pc3NpbmcgWC1TeW5jLVRva2VuJyB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdThERUZcdTc1MzFcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBkZXBzLnJvdXRlcy5nZXQoY3R4UGF0aCk7XG4gICAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgICAganNvbihyZXMsIDQwNCwgeyBvazogZmFsc2UsIGNvZGU6ICdOT1RfRk9VTkQnLCBtZXNzYWdlOiBgVW5rbm93biBwYXRoOiAke2N0eFBhdGh9YCB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBoYW5kbGVyKHtcbiAgICAgICAgICBtZXRob2Q6IHJlcS5tZXRob2QgPz8gJ0dFVCcsXG4gICAgICAgICAgdXJsOiBmdWxsVXJsLFxuICAgICAgICAgIHBhdGg6IGN0eFBhdGgsXG4gICAgICAgICAgcXVlcnk6IHVybE9iai5zZWFyY2hQYXJhbXMsXG4gICAgICAgICAgYm9keSxcbiAgICAgICAgICB0b2tlbjogdG9rZW4gPz8gJycsXG4gICAgICAgIH0pO1xuICAgICAgICBqc29uKHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgfSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycik7XG4gICAgICAgIGNvbnN0IGNvZGUgPSAoZXJyIGFzIHsgY29kZT86IHN0cmluZyB9KT8uY29kZSA/PyAnSU5URVJOQUwnO1xuICAgICAgICBjb25zdCBzdGF0dXMgPSAoZXJyIGFzIHsgc3RhdHVzPzogbnVtYmVyIH0pPy5zdGF0dXMgPz8gNTAwO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbc3luYy9zZXJ2ZXJdIGhhbmRsZXIgZXJyb3I6JywgZXJyKTtcbiAgICAgICAganNvbihyZXMsIHN0YXR1cywgeyBvazogZmFsc2UsIGNvZGUsIG1lc3NhZ2UgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBzZXJ2ZXIub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgcmVqZWN0KGVycik7XG4gICAgfSk7XG5cbiAgICBzZXJ2ZXIubGlzdGVuKHBvcnQsICcxMjcuMC4wLjEnLCAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhgW3N5bmMvc2VydmVyXSBsaXN0ZW5pbmcgb24gaHR0cDovLzEyNy4wLjAuMToke3BvcnR9YCk7XG4gICAgICByZXNvbHZlKHtcbiAgICAgICAgc3RvcDogKCkgPT5cbiAgICAgICAgICBuZXcgUHJvbWlzZSgocmVzKSA9PiB7XG4gICAgICAgICAgICBzZXJ2ZXIuY2xvc2UoKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW3N5bmMvc2VydmVyXSBzdG9wcGVkYCk7XG4gICAgICAgICAgICAgIHJlcygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSksXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKiBcdTY3ODRcdTkwMjBcdTk1MTlcdThCRUZcdUZGMDhcdTVFMjYgY29kZS9zdGF0dXNcdUZGMDlcdTMwMDIgKi9cbmV4cG9ydCBjbGFzcyBIdHRwRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvZGU6IHN0cmluZztcbiAgc3RhdHVzOiBudW1iZXI7XG4gIGNvbnN0cnVjdG9yKGNvZGU6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nLCBzdGF0dXMgPSA0MDApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLmNvZGUgPSBjb2RlO1xuICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICB9XG59XG4iLCAiLyoqXG4gKiBHRVQgL3N0YXR1cyBcdTIwMTQgXHU2M0UxXHU2MjRCL1x1NTA2NVx1NUVCN1x1NjhDMFx1NjdFNVx1MzAwMlxuICovXG5pbXBvcnQge1xuICBQUk9UT0NPTF9WRVJTSU9OLFxuICBTRVJWRVJfQ0FQQUJJTElUSUVTLFxuICB0eXBlIFN0YXR1c1Jlc3BvbnNlLFxufSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5TdGF0ZSB9IGZyb20gJy4uL3NldHRpbmdzLmpzJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhdHVzSGFuZGxlcihwbHVnaW5WZXJzaW9uOiBzdHJpbmcsIHZhdWx0TmFtZTogc3RyaW5nLCBzdGF0ZTogUGx1Z2luU3RhdGUpIHtcbiAgcmV0dXJuIGFzeW5jIChfY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8U3RhdHVzUmVzcG9uc2U+ID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgb2s6IHRydWUsXG4gICAgICB2ZXJzaW9uOiBwbHVnaW5WZXJzaW9uLFxuICAgICAgY29tcG9uZW50VmVyc2lvbjogcGx1Z2luVmVyc2lvbixcbiAgICAgIHByb3RvY29sVmVyc2lvbjogUFJPVE9DT0xfVkVSU0lPTixcbiAgICAgIGNhcGFiaWxpdGllczogWy4uLlNFUlZFUl9DQVBBQklMSVRJRVNdLFxuICAgICAgdmF1bHQ6IHZhdWx0TmFtZSxcbiAgICAgIGxhcmtSZWFkeTogISFzdGF0ZS5sYXJrQ2xpUmVzb2x2ZWQsXG4gICAgICBsYXJrVmVyc2lvbjogc3RhdGUubGFya0NsaVZlcnNpb24gfHwgbnVsbCxcbiAgICB9O1xuICB9O1xufVxuIiwgIi8qKlxuICogR0VUIC90cmVlIFx1MjAxNCBcdThGRDRcdTU2REUgdmF1bHQgXHU3NkVFXHU1RjU1XHU2ODExXHVGRjA4XHU3RUQ5XHU2MjY5XHU1QzU1XHU3NkVFXHU1RjU1XHU0RTBCXHU2MkM5XHU3NTI4XHVGRjA5XHUzMDAyXG4gKlxuICogXHU0RjE4XHU1MzE2XHVGRjFBXG4gKiAtIFx1NTE4NVx1NUI1OFx1N0YxM1x1NUI1OFx1RkYwODUgXHU3OUQyIFRUTFx1RkYwOVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NkJDRlx1NkIyMVx1OEJGN1x1NkM0Mlx1OTA0RFx1NTM4Nlx1NTE2OCB2YXVsdFxuICogLSBcdTY1MkZcdTYzMDEgbWF4RGVwdGggXHU1M0MyXHU2NTcwXHVGRjA4cXVlcnkgc3RyaW5nXHVGRjA5XHVGRjBDXHU5RUQ4XHU4QkE0XHU4RkQ0XHU1NkRFXHU4RjgzXHU1QjhDXHU2NTc0XHU3NkVFXHU1RjU1XHU2ODExXG4gKiAtIFx1NjUyRlx1NjMwMSBwcmVmaXggXHU1M0MyXHU2NTcwXHVGRjBDXHU1QzU1XHU1RjAwXHU2MzA3XHU1QjlBXHU1QjUwXHU2ODExXG4gKi9cbmltcG9ydCB0eXBlIHsgVHJlZVJlc3BvbnNlLCBUcmVlTm9kZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQgeyB0eXBlIEFwcCwgVEZvbGRlciB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuXG5jb25zdCBFWENMVURFID0gbmV3IFNldChbXG4gICdcdTYzRDJcdTRFRjYnLFxuICAnc2NyaXB0cycsXG4gICcub2JzaWRpYW4nLFxuICAnLnRyYXNoJyxcbiAgJy5mZWlzaHUtc3luYycsXG4gICdub2RlX21vZHVsZXMnLFxuXSk7XG5cbi8qKiBcdTdGMTNcdTVCNTggKi9cbmxldCBjYWNoZURpcnM6IFRyZWVOb2RlW10gPSBbXTtcbmxldCBjYWNoZVRpbWUgPSAwO1xuY29uc3QgQ0FDSEVfVFRMID0gNV8wMDA7IC8vIDUgXHU3OUQyXG5cbmZ1bmN0aW9uIGJ1aWxkRnVsbFRyZWUoYXBwOiBBcHApOiBUcmVlTm9kZVtdIHtcbiAgY29uc3Qgcm9vdCA9IGFwcC52YXVsdC5nZXRSb290KCk7XG4gIGNvbnN0IGRpcnM6IFRyZWVOb2RlW10gPSBbXTtcblxuICBjb25zdCB3YWxrID0gKGZvbGRlcjogVEZvbGRlciwgZGVwdGg6IG51bWJlcikgPT4ge1xuICAgIGlmIChkZXB0aCA+IDApIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBmb2xkZXIubmFtZTtcbiAgICAgIGlmIChFWENMVURFLmhhcyhuYW1lKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJy4nKSkgcmV0dXJuO1xuICAgICAgZGlycy5wdXNoKHsgcGF0aDogZm9sZGVyLnBhdGgsIGxhYmVsOiBuYW1lLCBkZXB0aCB9KTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBmb2xkZXIuY2hpbGRyZW4pIHtcbiAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIFRGb2xkZXIpIHdhbGsoY2hpbGQsIGRlcHRoICsgMSk7XG4gICAgfVxuICB9O1xuXG4gIHdhbGsocm9vdCwgMCk7XG5cbiAgZGlycy5zb3J0KChhLCBiKSA9PiBhLnBhdGgubG9jYWxlQ29tcGFyZShiLnBhdGgsICd6aCcpKTtcblxuICByZXR1cm4gZGlycztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyZWVIYW5kbGVyKGFwcDogQXBwKSB7XG4gIHJldHVybiBhc3luYyAoY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8VHJlZVJlc3BvbnNlPiA9PiB7XG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBtYXhEZXB0aCA9IHBhcnNlSW50KGN0eC5xdWVyeS5nZXQoJ21heERlcHRoJykgfHwgJzEyJywgMTApO1xuICAgIGNvbnN0IHByZWZpeCA9IGN0eC5xdWVyeS5nZXQoJ3ByZWZpeCcpIHx8ICcnO1xuXG4gICAgLy8gXHU1MjM3XHU2NUIwXHU3RjEzXHU1QjU4XG4gICAgaWYgKG5vdyAtIGNhY2hlVGltZSA+IENBQ0hFX1RUTCB8fCBjYWNoZURpcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjYWNoZURpcnMgPSBidWlsZEZ1bGxUcmVlKGFwcCk7XG4gICAgICBjYWNoZVRpbWUgPSBub3c7XG4gICAgfVxuXG4gICAgbGV0IGRpcnMgPSBjYWNoZURpcnM7XG5cbiAgICAvLyBwcmVmaXggXHU3QjVCXHU5MDA5XHVGRjFBXHU1M0VBXHU4RkQ0XHU1NkRFIHByZWZpeC8gXHU0RTBCXHU3Njg0XHU1QjUwXHU4MjgyXHU3MEI5XHVGRjA4ZGVwdGggXHU0RUNFIHByZWZpeCBcdTRFMEJcdTRFMDBcdTdFQTdcdTVGMDBcdTU5Q0JcdUZGMDlcbiAgICBpZiAocHJlZml4KSB7XG4gICAgICBjb25zdCBwcmVmaXhEZXB0aCA9IHByZWZpeC5zcGxpdCgnLycpLmxlbmd0aCArIDE7XG4gICAgICBkaXJzID0gZGlycy5maWx0ZXIoZCA9PiBkLnBhdGguc3RhcnRzV2l0aChwcmVmaXggKyAnLycpICYmIGQuZGVwdGggPD0gcHJlZml4RGVwdGggKyAxKTtcbiAgICAgIC8vIFx1OTFDRFx1NjVCMFx1OEJBMVx1N0I5N1x1NzZGOFx1NUJGOVx1NkRGMVx1NUVBNlxuICAgICAgZGlycyA9IGRpcnMubWFwKGQgPT4gKHtcbiAgICAgICAgLi4uZCxcbiAgICAgICAgZGVwdGg6IGQuZGVwdGggLSBwcmVmaXhEZXB0aCArIDIsXG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFx1NjMwOSBtYXhEZXB0aCBcdTYyMkFcdTY1QURcbiAgICAgIGRpcnMgPSBkaXJzLmZpbHRlcihkID0+IGQuZGVwdGggPD0gbWF4RGVwdGgpO1xuICAgIH1cblxuICAgIHJldHVybiB7IG9rOiB0cnVlLCBkaXJzIH07XG4gIH07XG59XG5cbi8qKiBcdTVCRkNcdTUxRkFcdTUyMzdcdTY1QjBcdTdGMTNcdTVCNThcdUZGMDhcdTY1ODdcdTRFRjZcdTY0Q0RcdTRGNUNcdTU0MEVcdThDMDNcdTc1MjhcdUZGMDlcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZhbGlkYXRlVHJlZUNhY2hlKCk6IHZvaWQge1xuICBjYWNoZURpcnMgPSBbXTtcbiAgY2FjaGVUaW1lID0gMDtcbn1cbiIsICIvKipcbiAqIFBPU1QgL2ZldGNoIFx1MjAxNCBcdTk4REVcdTRFNjZcdTIxOTJPQiBcdTg0M0RcdTU3MzBcdTRFM0JcdTk0RkVcdThERUZcdTMwMDJcbiAqXG4gKiBcdTRGOURcdTYzNkUgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3Ni4xXHVGRjFBXG4gKiAxLiBsYXJrLWNsaSBkb2NzICtmZXRjaCAtLWRvYy1mb3JtYXQgbWFya2Rvd24gXHUyMTkyIFx1NkI2M1x1NjU4NyBtZFxuICogMi4gbGFyay1jbGkgZG9jcyArZmV0Y2ggLS1kb2MtZm9ybWF0IHhtbCAtLWRldGFpbCB3aXRoLWlkcyBcdTIxOTIgZmlsZV90b2tlbiBcdTUyMTdcdTg4NjggKyBjYWxsb3V0IFx1OTg5Q1x1ODI3MiArIGRvY3ggb2JqX3Rva2VuXG4gKiAzLiBcdTU2RkVcdTcyNDcgYXV0aGNvZGUgVVJMIFx1MjE5MiBmZWlzaHU6Ly9UT0tFTlxuICogNC4gZXhpc3RzIFx1NjhDMFx1NjdFNVx1RkYxQVx1NURGMlx1NjcwOVx1NTQwQyBmZWlzaHVfaWQgXHUyMTkyIFx1NjZGNFx1NjVCMFx1NTIwNlx1NjUyRlx1RkYxQlx1NjVFMCBcdTIxOTIgXHU2NUIwXHU1RUZBXG4gKiA1LiBcdTdFQzRcdTg4QzUgWUFNTFx1RkYwOGZlaXNodV9pZC9mZWlzaHVfZG9jX2lkL2ZlaXNodV90aXRsZS9zeW5jX3RpbWVcdUZGMDkrIFx1NkI2M1x1NjU4N1xuICogNi4gXHU2NTg3XHU0RUY2XHU1NDBEID0gXHU1Qjg5XHU1MTY4XHU2RTA1XHU2RDE3KGZlaXNodV90aXRsZSlcdUZGMENcdTUxOTlcdTUxNjUgZGlyXG4gKiA3LiBhdXRvLXJlbmFtZSBcdTg5RTZcdTUzRDFcdTdGMTZcdTc4MDEgXHUyMTkyIFx1NTE5OVx1NTZERVx1NjU4N1x1NEVGNlx1NTQwRCArIFlBTUwgXHU3RjE2XHU3ODAxXG4gKiA4LiBcdThCQTFcdTdCOTcgc3luY19oYXNoXHVGRjBDXHU1MTk5IHN5bmNfdGltZVxuICogOS4gXHU4RkQ0XHU1NkRFXHU4NDNEXHU1NzMwXHU4REVGXHU1Rjg0XG4gKi9cbmltcG9ydCB0eXBlIHsgRmV0Y2hSZXF1ZXN0LCBGZXRjaFJlc3BvbnNlIH0gZnJvbSAnQHN5bmMvc2hhcmVkJztcbmltcG9ydCB7IEFwcCwgVEZpbGUsIFRGb2xkZXIgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IFJlcXVlc3RDb250ZXh0IH0gZnJvbSAnLi4vc2VydmVyLmpzJztcbmltcG9ydCB0eXBlIHsgRmVpc2h1U3luY1NldHRpbmdzLCBQbHVnaW5TdGF0ZSB9IGZyb20gJy4uL3NldHRpbmdzLmpzJztcbmltcG9ydCB7XG4gIHBhcnNlRmlsZSxcbiAgYnVpbGRJbml0aWFsRnJvbnRtYXR0ZXIsXG4gIG1lcmdlRnJvbnRtYXR0ZXJGb3JVcGRhdGUsXG4gIGFzc2VtYmxlTWQsXG4gIG1ha2VGaWxlbmFtZSxcbiAgbWFrZVBhdGgsXG59IGZyb20gJy4uL2ZpbGVpby93cml0ZXIuanMnO1xuaW1wb3J0IHsgYXNzaWduRW5jb2RpbmcgfSBmcm9tICcuLi9hdXRvUmVuYW1lLmpzJztcbmltcG9ydCB7IGZpbmRVbmlxdWVWYXVsdEJpbmRpbmcgfSBmcm9tICcuLi92YXVsdEJpbmRpbmcuanMnO1xuaW1wb3J0IHsgbm9ybWFsaXplVmF1bHREaXIsIG5vcm1hbGl6ZVZhdWx0TWFya2Rvd25QYXRoIH0gZnJvbSAnLi4vdmF1bHRQYXRoLmpzJztcbmltcG9ydCB7IGFzc2VydFJlcGxhY2VtZW50QmluZGluZyB9IGZyb20gJy4uL2JpbmRpbmdJbmRleC5qcyc7XG5pbXBvcnQgeyBmZXRjaFJlbW90ZURvY3VtZW50IH0gZnJvbSAnLi4vcmVtb3RlRG9jdW1lbnQuanMnO1xuaW1wb3J0IHsgZGVjaWRlVGhyZWVXYXlTeW5jLCBwbGFuU3luY0V4ZWN1dGlvbiB9IGZyb20gJy4uL3N5bmNEZWNpc2lvbi5qcyc7XG5pbXBvcnQgeyBjcmVhdGVSZWNvdmVyeVNuYXBzaG90IH0gZnJvbSAnLi4vcmVjb3ZlcnkuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZldGNoRGVwcyB7XG4gIGFwcDogQXBwO1xuICBzZXR0aW5nczogRmVpc2h1U3luY1NldHRpbmdzO1xuICBzdGF0ZTogUGx1Z2luU3RhdGU7XG4gIG5vdGljZTogKG1zZzogc3RyaW5nKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRmV0Y2hIYW5kbGVyKGRlcHM6IEZldGNoRGVwcykge1xuICByZXR1cm4gYXN5bmMgKGN0eDogUmVxdWVzdENvbnRleHQpOiBQcm9taXNlPEZldGNoUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCByZXEgPSBjdHguYm9keSBhcyBGZXRjaFJlcXVlc3Q7XG4gICAgaWYgKCFyZXE/Lm5vZGVfdG9rZW4pIHtcbiAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoJ25vZGVfdG9rZW4gaXMgcmVxdWlyZWQnKSBhcyBFcnJvciAmIHsgY29kZTogc3RyaW5nOyBzdGF0dXM6IG51bWJlciB9O1xuICAgICAgZS5jb2RlID0gJ01JU1NJTkdfVE9LRU4nO1xuICAgICAgZS5zdGF0dXMgPSA0MDA7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIGNvbnN0IHsgbm9kZV90b2tlbiwgc3BhY2VfaWQsIGRpciB9ID0gcmVxO1xuICAgIGNvbnN0IHNldHRpbmdzID0gZGVwcy5zZXR0aW5ncztcbiAgICBjb25zdCB0YXJnZXREaXIgPSBub3JtYWxpemVWYXVsdERpcihkaXIgPz8gc2V0dGluZ3MuZGVmYXVsdERpcik7XG4gICAgY29uc3QgcmVwbGFjZVBhdGggPSByZXEucmVwbGFjZV9wYXRoXG4gICAgICA/IG5vcm1hbGl6ZVZhdWx0TWFya2Rvd25QYXRoKHJlcS5yZXBsYWNlX3BhdGgpXG4gICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGRlcHMubm90aWNlKGBcdTJCMDcgXHU1NDBDXHU2QjY1XHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzICR7bm9kZV90b2tlbi5zbGljZSgwLCA4KX0uLi5gKTtcblxuICAgIGNvbnN0IHJlbW90ZSA9IGZldGNoUmVtb3RlRG9jdW1lbnQoe1xuICAgICAgbm9kZVRva2VuOiBub2RlX3Rva2VuLFxuICAgICAgc3BhY2VJZDogc3BhY2VfaWQsXG4gICAgICBvYmpUb2tlbjogcmVxLm9ial90b2tlbixcbiAgICB9KTtcblxuICAgIC8vIFx1NkI2NVx1OUFBNCAyLjVcdUZGMUFcdTRFQ0VcdTk4REVcdTRFNjZcdTU5MzRcdTkwRTggY2FsbG91dCBcdTg5RTNcdTY3OTBcdTUxNDNcdTY1NzBcdTYzNkVcdUZGMDhcdTY4MDdcdTdCN0UvXHU3RjE2XHU3ODAxL1x1OEY5M1x1NTE2NS9cdTY1RTVcdTY3MUYvXHU1MTczXHU5NTJFXHU4QkNEL1x1OEJDNFx1NTIwNi9cdTdEMjJcdTVGMTVcdUZGMDlcbiAgICAvLyBcdThGRDlcdTRFOUJcdTVCNTdcdTZCQjVcdTRGMUFcdTUxOTlcdThGREIgWUFNTCBmcm9udG1hdHRlclx1RkYxQlx1NkI2M1x1NjU4NyBjYWxsb3V0IFx1NEZERFx1NzU1OVx1NEUwRFx1NTJBOFx1RkYwOFx1NkI2NVx1OUFBNCAzLjUgXHU4RjZDIE9CIGNhbGxvdXRcdUZGMDlcbiAgICBjb25zdCBtZXRhID0ge1xuICAgICAgLi4ucmVtb3RlLm1ldGEsXG4gICAgICAuLi4ocmVxLm1ldGEgPz8ge30pLFxuICAgIH07XG4gICAgaWYgKE9iamVjdC5rZXlzKG1ldGEpLmxlbmd0aCA+IDApIHtcbiAgICAgIGRlcHMubm90aWNlKGBcdUQ4M0RcdURDQ0IgXHU2M0QwXHU1M0Q2XHU1MjMwICR7T2JqZWN0LmtleXMobWV0YSkubGVuZ3RofSBcdTRFMkFcdTUxNDNcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVgKTtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9jZXNzZWRNZCA9IHJlbW90ZS5ib2R5O1xuICAgIGNvbnN0IG9ialRva2VuID0gcmVtb3RlLm9ialRva2VuO1xuICAgIGNvbnN0IGZlaXNodVRpdGxlID0gcmVtb3RlLnRpdGxlO1xuXG4gICAgLy8gXHU2QjY1XHU5QUE0IDRcdUZGMUFleGlzdHMgXHU2OEMwXHU2N0U1XG4gICAgY29uc3QgZXhpc3RpbmdGaWxlID0gYXdhaXQgZmluZFVuaXF1ZVZhdWx0QmluZGluZyhkZXBzLmFwcCwgbm9kZV90b2tlbik7XG4gICAgY29uc3Qgc3luY1RpbWUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgbGV0IGFjdGlvbjogJ2NyZWF0ZWQnIHwgJ3VwZGF0ZWQnO1xuICAgIGxldCBmaW5hbFBhdGg6IHN0cmluZztcbiAgICBsZXQgZW5jb2Rpbmc6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgIGlmIChleGlzdGluZ0ZpbGUpIHtcbiAgICAgIC8vIFx1NjZGNFx1NjVCMFx1NTIwNlx1NjUyRlx1RkYxQVx1NEZERFx1NzU1OVx1NzUyOFx1NjIzN1x1NjUzOVx1NzY4NFx1NTE0M1x1NjU3MFx1NjM2RVx1RkYwQ1x1NTNFQVx1NTIzN1x1NkI2M1x1NjU4NyArIFx1N0VEMVx1NUI5QVx1NUI1N1x1NkJCNVxuICAgICAgYWN0aW9uID0gJ3VwZGF0ZWQnO1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBkZXBzLmFwcC52YXVsdC5yZWFkKGV4aXN0aW5nRmlsZSk7XG4gICAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUZpbGUoZXhpc3RpbmcpO1xuICAgICAgZmluYWxQYXRoID0gZXhpc3RpbmdGaWxlLnBhdGg7XG4gICAgICBjb25zdCBkZWNpc2lvbiA9IGRlY2lkZVRocmVlV2F5U3luYyh7XG4gICAgICAgIGJhc2VIYXNoOiBwYXJzZWQuZnJvbnRtYXR0ZXIuc3luY19oYXNoIGFzIHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICAgICAgbG9jYWxIYXNoOiBwYXJzZWQuaGFzaCxcbiAgICAgICAgcmVtb3RlSGFzaDogcmVtb3RlLmhhc2gsXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGV4ZWN1dGlvbiA9IHBsYW5TeW5jRXhlY3V0aW9uKCdwdWxsJywgZGVjaXNpb24pO1xuICAgICAgaWYgKGV4ZWN1dGlvbiAhPT0gJ3NraXAnKSB7XG4gICAgICAgIGNvbnN0IG1lcmdlZCA9IG1lcmdlRnJvbnRtYXR0ZXJGb3JVcGRhdGUoXG4gICAgICAgICAgcGFyc2VkLmZyb250bWF0dGVyLFxuICAgICAgICAgIG5vZGVfdG9rZW4sXG4gICAgICAgICAgb2JqVG9rZW4sXG4gICAgICAgICAgZmVpc2h1VGl0bGUsXG4gICAgICAgICAgc3luY1RpbWUsXG4gICAgICAgICAgbWV0YSxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGFzc2VtYmxlTWQobWVyZ2VkLCBwcm9jZXNzZWRNZCk7XG4gICAgICAgIGF3YWl0IGNyZWF0ZVJlY292ZXJ5U25hcHNob3QoZGVwcy5hcHAudmF1bHQuYWRhcHRlciwge1xuICAgICAgICAgIG9yaWdpbmFsUGF0aDogZXhpc3RpbmdGaWxlLnBhdGgsXG4gICAgICAgICAgY29udGVudDogZXhpc3RpbmcsXG4gICAgICAgICAgc291cmNlOiAnbG9jYWwnLFxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgZGVwcy5hcHAudmF1bHQubW9kaWZ5KGV4aXN0aW5nRmlsZSwgY29udGVudCk7XG4gICAgICAgIGRlcHMubm90aWNlKGBcdTI3MEYgXHU1REYyXHU2NkY0XHU2NUIwICR7ZXhpc3RpbmdGaWxlLm5hbWV9YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZXBzLm5vdGljZShgXHUyM0VEIFx1NjVFMFx1NTNEOFx1NTMxNiAke2V4aXN0aW5nRmlsZS5uYW1lfWApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBcdTY1QjBcdTVFRkFcdTUyMDZcdTY1MkZcbiAgICAgIGFjdGlvbiA9ICdjcmVhdGVkJztcbiAgICAgIGNvbnN0IGZpbGVuYW1lID0gbWFrZUZpbGVuYW1lKGZlaXNodVRpdGxlLCByZXEuZmlsZW5hbWUpO1xuICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gbWFrZVBhdGgodGFyZ2V0RGlyLCBmaWxlbmFtZSk7XG5cbiAgICAgIC8vIFx1Nzg2RVx1NEZERFx1NzZFRVx1NUY1NVx1NUI1OFx1NTcyOFxuICAgICAgYXdhaXQgZW5zdXJlRm9sZGVyKGRlcHMuYXBwLCB0YXJnZXREaXIpO1xuXG4gICAgICBjb25zdCBmbSA9IGJ1aWxkSW5pdGlhbEZyb250bWF0dGVyKG5vZGVfdG9rZW4sIG9ialRva2VuLCBmZWlzaHVUaXRsZSwgc3luY1RpbWUsIG1ldGEpO1xuICAgICAgY29uc3QgY29udGVudCA9IGFzc2VtYmxlTWQoZm0sIHByb2Nlc3NlZE1kKTtcblxuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NTg3XHU0RUY2XHU2NjJGXHU1NDI2XHU1REYyXHU1QjU4XHU1NzI4XHVGRjA4XHU1NDBDXHU1NDBEXHU0RTBEXHU1NDBDIGZlaXNodV9pZFx1RkYwOVxuICAgICAgY29uc3QgcmVwbGFjZUZpbGUgPSByZXBsYWNlUGF0aFxuICAgICAgICA/IGRlcHMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChyZXBsYWNlUGF0aClcbiAgICAgICAgOiBudWxsO1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBkZXBzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocmVsYXRpdmVQYXRoKTtcbiAgICAgIGlmIChyZXBsYWNlRmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgIGNvbnN0IHJlcGxhY2VtZW50Q29udGVudCA9IGF3YWl0IGRlcHMuYXBwLnZhdWx0LnJlYWQocmVwbGFjZUZpbGUpO1xuICAgICAgICBhc3NlcnRSZXBsYWNlbWVudEJpbmRpbmcocmVwbGFjZW1lbnRDb250ZW50LCBub2RlX3Rva2VuLCByZXBsYWNlRmlsZS5wYXRoKTtcbiAgICAgICAgYXdhaXQgY3JlYXRlUmVjb3ZlcnlTbmFwc2hvdChkZXBzLmFwcC52YXVsdC5hZGFwdGVyLCB7XG4gICAgICAgICAgb3JpZ2luYWxQYXRoOiByZXBsYWNlRmlsZS5wYXRoLFxuICAgICAgICAgIGNvbnRlbnQ6IHJlcGxhY2VtZW50Q29udGVudCxcbiAgICAgICAgICBzb3VyY2U6ICdsb2NhbCcsXG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBkZXBzLmFwcC52YXVsdC5tb2RpZnkocmVwbGFjZUZpbGUsIGNvbnRlbnQpO1xuICAgICAgICBmaW5hbFBhdGggPSByZXBsYWNlRmlsZS5wYXRoO1xuICAgICAgICBhY3Rpb24gPSAndXBkYXRlZCc7XG4gICAgICB9IGVsc2UgaWYgKGV4aXN0aW5nIGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgICAgLy8gXHU1NDBDXHU1NDBEXHU1MUIyXHU3QTgxXHVGRjFBXHU1MkEwXHU1NDBFXHU3RjAwXG4gICAgICAgIGNvbnN0IGNvbmZsaWN0UGF0aCA9IG1ha2VQYXRoKHRhcmdldERpciwgYCR7ZmlsZW5hbWUucmVwbGFjZSgvXFwubWQkLywgJycpfS0ke25vZGVfdG9rZW4uc2xpY2UoMCwgNil9Lm1kYCk7XG4gICAgICAgIGF3YWl0IGRlcHMuYXBwLnZhdWx0LmNyZWF0ZShjb25mbGljdFBhdGgsIGNvbnRlbnQpO1xuICAgICAgICBmaW5hbFBhdGggPSBjb25mbGljdFBhdGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBjcmVhdGVkID0gYXdhaXQgZGVwcy5hcHAudmF1bHQuY3JlYXRlKHJlbGF0aXZlUGF0aCwgY29udGVudCk7XG4gICAgICAgIGZpbmFsUGF0aCA9IGNyZWF0ZWQucGF0aDtcbiAgICAgIH1cblxuICAgICAgZGVwcy5ub3RpY2UoYFx1MjcwNSBcdTVERjJcdTUyMUJcdTVFRkEgJHtmaWxlbmFtZX1gKTtcblxuICAgICAgLy8gXHU2QjY1XHU5QUE0IDdcdUZGMUFhdXRvLXJlbmFtZSBcdTdGMTZcdTc4MDFcdTUyMDZcdTkxNERcbiAgICAgIGlmIChzZXR0aW5ncy5hdXRvUmVuYW1lKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZW5jb2RpbmcgPSBhd2FpdCBhc3NpZ25FbmNvZGluZyhkZXBzLmFwcCwgZmluYWxQYXRoLCB0YXJnZXREaXIpO1xuICAgICAgICAgIGlmIChlbmNvZGluZykge1xuICAgICAgICAgICAgZGVwcy5ub3RpY2UoYFx1RDgzRFx1REQyMiBcdTdGMTZcdTc4MDFcdUZGMUEke2VuY29kaW5nfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdbc3luYy9mZXRjaF0gYXV0by1yZW5hbWUgZmFpbGVkOicsIGVycik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBcdThCQjBcdTVGNTVcdTY3MDBcdThGRDFcdTU0MENcdTZCNjVcbiAgICBkZXBzLnN0YXRlLnJlY2VudFN5bmNzLnVuc2hpZnQoe1xuICAgICAgdGltZTogc3luY1RpbWUsXG4gICAgICBub2RlX3Rva2VuLFxuICAgICAgdGl0bGU6IGZlaXNodVRpdGxlLFxuICAgICAgcGF0aDogZmluYWxQYXRoLFxuICAgICAgYWN0aW9uLFxuICAgIH0pO1xuICAgIGlmIChkZXBzLnN0YXRlLnJlY2VudFN5bmNzLmxlbmd0aCA+IDUwKSB7XG4gICAgICBkZXBzLnN0YXRlLnJlY2VudFN5bmNzID0gZGVwcy5zdGF0ZS5yZWNlbnRTeW5jcy5zbGljZSgwLCA1MCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG9rOiB0cnVlLFxuICAgICAgcGF0aDogZmluYWxQYXRoLFxuICAgICAgZmlsZW5hbWU6IGZpbmFsUGF0aC5zcGxpdCgnLycpLnBvcCgpID8/ICcnLFxuICAgICAgYWN0aW9uLFxuICAgICAgXHU3RjE2XHU3ODAxOiBlbmNvZGluZyxcbiAgICAgIGZlaXNodV90aXRsZTogZmVpc2h1VGl0bGUsXG4gICAgfTtcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTc4NkVcdTRGRERcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjhcdUZGMDhcdTkwMTJcdTVGNTJcdTUyMUJcdTVFRkFcdUZGMDlcdTMwMDJcbiAqL1xuYXN5bmMgZnVuY3Rpb24gZW5zdXJlRm9sZGVyKGFwcDogQXBwLCBkaXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICBpZiAoIWRpciB8fCBkaXIgPT09ICcuJyB8fCBkaXIgPT09ICcvJykgcmV0dXJuO1xuICBjb25zdCBleGlzdGluZyA9IGFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZGlyKTtcbiAgaWYgKGV4aXN0aW5nIGluc3RhbmNlb2YgVEZvbGRlcikgcmV0dXJuO1xuICB0cnkge1xuICAgIGF3YWl0IGFwcC52YXVsdC5jcmVhdGVGb2xkZXIoZGlyKTtcbiAgfSBjYXRjaCB7XG4gICAgLy8gXHU1M0VGXHU4MEZEXHU3MjM2XHU3NkVFXHU1RjU1XHU0RTVGXHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU5MDEyXHU1RjUyXG4gICAgY29uc3QgcGFyZW50ID0gZGlyLnNwbGl0KCcvJykuc2xpY2UoMCwgLTEpLmpvaW4oJy8nKTtcbiAgICBpZiAocGFyZW50KSBhd2FpdCBlbnN1cmVGb2xkZXIoYXBwLCBwYXJlbnQpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBhcHAudmF1bHQuY3JlYXRlRm9sZGVyKGRpcik7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBcdTVERjJcdTVCNThcdTU3MjhcdTYyMTZcdTUxNzZcdTRFRDZcdTk1MTlcdThCRUZcdUZGMENcdTVGRkRcdTc1NjVcbiAgICB9XG4gIH1cbn1cbiIsICIvKipcbiAqIFx1NjU4N1x1NEVGNiBJT1x1RkYxQVx1OEJGQlx1NTE5OSB2YXVsdCBcdTRFMkRcdTc2ODQgLm1kIFx1NjU4N1x1NEVGNlx1MzAwMlxuICogXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzZcdUZGMDhcdTUxNzNcdTk1MkVcdTZENDFcdTdBMEJcdUZGMDkrIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYFx1MzAwMlxuICpcbiAqIC0gcmVhZGVyXHVGRjFBXHU4OUUzXHU2NzkwIGZyb250bWF0dGVyICsgYm9keVx1RkYwQ1x1OEJBMVx1N0I5NyBoYXNoXHVGRjBDXHU2QkQ0XHU1QkY5IHN5bmNfaGFzaFxuICogLSB3cml0ZXJcdUZGMUFcdTdFQzRcdTg4QzUgWUFNTCArIGJvZHlcdUZGMENcdTUxOTlcdTY1ODdcdTRFRjZcbiAqL1xuaW1wb3J0IHtcbiAgcGFyc2VGcm9udG1hdHRlcixcbiAgYXNzZW1ibGVGaWxlLFxuICBib2R5SGFzaCxcbiAgaXNDaGFuZ2VkLFxuICBzYW5pdGl6ZUZpbGVuYW1lLFxuICB3aXRoTWRFeHQsXG4gIGpvaW5QYXRoLFxuICByZXdyaXRlSW1hZ2VzVG9GZWlzaHVQcm90byxcbiAgdHlwZSBZQU1MRnJvbnRtYXR0ZXIsXG59IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5cbi8qKiBcdThCRkJcdTY1ODdcdTRFRjZcdTdFRDNcdTY3OUNcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkRmlsZSB7XG4gIC8qKiBcdTVCOENcdTY1NzRcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcdTMwMDIgKi9cbiAgY29udGVudDogc3RyaW5nO1xuICAvKiogZnJvbnRtYXR0ZXJcdUZGMDhcdTY1RTBcdTUyMTlcdTRFM0FcdTdBN0FcdTVCRjlcdThDNjFcdUZGMDlcdTMwMDIgKi9cbiAgZnJvbnRtYXR0ZXI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAvKiogXHU2QjYzXHU2NTg3XHVGRjA4XHU0RTBEXHU1NDJCIGZyb250bWF0dGVyXHVGRjA5XHUzMDAyICovXG4gIGJvZHk6IHN0cmluZztcbiAgLyoqIFx1NkI2M1x1NjU4NyBoYXNoXHVGRjA4c2hhMjU2IGhleFx1RkYwOVx1MzAwMiAqL1xuICBoYXNoOiBzdHJpbmc7XG59XG5cbi8qKlxuICogXHU0RUNFXHU1QjhDXHU2NTc0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XHU4OUUzXHU2NzkwXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUZpbGUoY29udGVudDogc3RyaW5nKTogUGFyc2VkRmlsZSB7XG4gIGNvbnN0IHsgZnJvbnRtYXR0ZXIsIGJvZHkgfSA9IHBhcnNlRnJvbnRtYXR0ZXIoY29udGVudCk7XG4gIGNvbnN0IGhhc2ggPSBib2R5SGFzaChib2R5KTtcbiAgcmV0dXJuIHtcbiAgICBjb250ZW50LFxuICAgIGZyb250bWF0dGVyOiBmcm9udG1hdHRlciA/PyB7fSxcbiAgICBib2R5LFxuICAgIGhhc2gsXG4gIH07XG59XG5cbi8qKlxuICogXHU2OEMwXHU2RDRCXHU1MTg1XHU1QkI5XHU2NjJGXHU1NDI2XHU3NkY4XHU1QkY5XHU0RTBBXHU2QjIxXHU1NDBDXHU2QjY1XHU1M0QxXHU3NTFGXHU1M0Q4XHU1MzE2XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNDb250ZW50Q2hhbmdlZChwYXJzZWQ6IFBhcnNlZEZpbGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzQ2hhbmdlZChwYXJzZWQuaGFzaCwgcGFyc2VkLmZyb250bWF0dGVyLnN5bmNfaGFzaCBhcyBzdHJpbmcgfCB1bmRlZmluZWQpO1xufVxuXG4vKipcbiAqIFx1N0VDNFx1ODhDNVx1NjVCMFx1NjU4N1x1NEVGNlx1NzY4NCBmcm9udG1hdHRlclx1RkYwOFx1OThERVx1NEU2Nlx1MjE5Mk9CIFx1OTk5Nlx1NkIyMVx1ODQzRFx1NTczMFx1RkYwOVx1MzAwMlxuICogQHBhcmFtIG1ldGEgXHU0RUNFXHU5OERFXHU0RTY2IGNhbGxvdXQgXHU4OUUzXHU2NzkwXHU1MUZBXHU3Njg0XHU1MTQzXHU2NTcwXHU2MzZFXHVGRjA4XHU2ODA3XHU3QjdFL1x1N0YxNlx1NzgwMS9cdThGOTNcdTUxNjUvXHU2NUU1XHU2NzFGL1x1NTE3M1x1OTUyRVx1OEJDRC9cdThCQzRcdTUyMDYvXHU3RDIyXHU1RjE1XHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEluaXRpYWxGcm9udG1hdHRlcihcbiAgZmVpc2h1SWQ6IHN0cmluZyxcbiAgZmVpc2h1RG9jSWQ6IHN0cmluZyxcbiAgZmVpc2h1VGl0bGU6IHN0cmluZyxcbiAgc3luY1RpbWU6IHN0cmluZyxcbiAgbWV0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogWUFNTEZyb250bWF0dGVyIHtcbiAgcmV0dXJuIHtcbiAgICBmZWlzaHVfaWQ6IGZlaXNodUlkLFxuICAgIGZlaXNodV9kb2NfaWQ6IGZlaXNodURvY0lkLFxuICAgIGZlaXNodV90aXRsZTogZmVpc2h1VGl0bGUsXG4gICAgc3luY190aW1lOiBzeW5jVGltZSxcbiAgICAvLyBcdTk4REVcdTRFNjYgY2FsbG91dCBcdTUxNDNcdTY1NzBcdTYzNkVcdUZGMDhcdTdBN0FcdTUwM0NcdTVCNTdcdTZCQjVcdTRFMERcdTUxOTlcdTUxNjVcdUZGMENcdTRGRERcdTYzMDEgWUFNTCBcdTVFNzJcdTUxQzBcdUZGMDlcbiAgICAuLi4obWV0YSAmJiBzdHJpcEVtcHR5KG1ldGEpKSxcbiAgICAvLyBzeW5jX2hhc2ggXHU1NzI4XHU1MTk5XHU1MTY1XHU2NUY2XHU3NTMxIHdyaXRlciBcdThCQTFcdTdCOTdcdTU4NkJcdTUxNjVcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTU0MDhcdTVFNzZcdTY2RjRcdTY1QjBcdTVERjJcdTY3MDlcdTY1ODdcdTRFRjZcdTc2ODQgZnJvbnRtYXR0ZXJcdUZGMDhcdTRGRERcdTc1NTlcdTc1MjhcdTYyMzdcdTY1MzlcdTc2ODRcdTUxNDNcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVcdUZGMDlcdTMwMDJcbiAqIFx1NTNFQVx1NTIzN1x1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QVx1N0VDNFx1RkYwOGZlaXNodV8qIC8gc3luY18qXHVGRjA5XHVGRjBDXHU0RkREXHU3NTU5IFx1NjgwN1x1N0I3RS9cdTdGMTZcdTc4MDEvXHU4RjkzXHU1MTY1L1x1NjVFNVx1NjcxRi9cdTUxNzNcdTk1MkVcdThCQ0QvXHU4QkM0XHU1MjA2L1x1N0QyMlx1NUYxNSBcdTdCNDlcdTc1MjhcdTYyMzdcdTVCNTdcdTZCQjVcdTMwMDJcbiAqXG4gKiBcdTZDRThcdTYxMEZcdUZGMUFcdTVERjJcdTY3MDlcdTVCNTdcdTZCQjVcdTRGMThcdTUxNDhcdUZGMDhcdTc1MjhcdTYyMzdcdTU3MjggT0IgXHU5MUNDXHU2NTM5XHU4RkM3XHU3Njg0XHVGRjA5XHVGRjBDXHU5OERFXHU0RTY2XHU0RkE3IGNhbGxvdXQgXHU1MTQzXHU2NTcwXHU2MzZFXHU0RUM1XHU1NzI4XHU1QjU3XHU2QkI1XHU3RjNBXHU1OTMxXHU2NUY2XHU4ODY1XHU5RjUwXHUzMDAyXG4gKiBcdThGRDlcdTY4MzdcdTkwN0ZcdTUxNERcdTk4REVcdTRFNjZcdTRGQTdcdTc2ODRcdTY1RTcgY2FsbG91dCBcdTg5ODZcdTc2RDYgT0IgXHU5MUNDXHU3Njg0XHU2NzAwXHU2NUIwXHU2NTc0XHU3NDA2XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUZyb250bWF0dGVyRm9yVXBkYXRlKFxuICBleGlzdGluZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4gIGZlaXNodUlkOiBzdHJpbmcsXG4gIGZlaXNodURvY0lkOiBzdHJpbmcsXG4gIGZlaXNodVRpdGxlOiBzdHJpbmcsXG4gIHN5bmNUaW1lOiBzdHJpbmcsXG4gIG1ldGE/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFlBTUxGcm9udG1hdHRlciB7XG4gIHJldHVybiB7XG4gICAgLy8gXHU1REYyXHU2NzA5XHU1QjU3XHU2QkI1XHU0RjE4XHU1MTQ4XHVGRjA4XHU3NTI4XHU2MjM3XHU2NTM5XHU4RkM3XHU3Njg0XHVGRjA5XHVGRjBDXHU5OERFXHU0RTY2IGNhbGxvdXQgXHU1MTQzXHU2NTcwXHU2MzZFXHU1M0VBXHU4ODY1XHU3RjNBXHU1OTMxXG4gICAgLi4uKG1ldGEgJiYgc3RyaXBFbXB0eShtZXRhKSksXG4gICAgLi4uZXhpc3RpbmcsXG4gICAgZmVpc2h1X2lkOiBmZWlzaHVJZCxcbiAgICBmZWlzaHVfZG9jX2lkOiBmZWlzaHVEb2NJZCxcbiAgICBmZWlzaHVfdGl0bGU6IGZlaXNodVRpdGxlLFxuICAgIHN5bmNfdGltZTogc3luY1RpbWUsXG4gIH0gYXMgWUFNTEZyb250bWF0dGVyO1xufVxuXG4vKiogXHU3OUZCXHU5NjY0XHU1MDNDXHU0RTNBXHU3QTdBXHVGRjA4dW5kZWZpbmVkL251bGwvJycvXHU3QTdBXHU2NTcwXHU3RUM0XHVGRjA5XHU3Njg0XHU1QjU3XHU2QkI1XHVGRjBDXHU5MDdGXHU1MTREXHU2QzYxXHU2N0QzIFlBTUxcdTMwMDIgKi9cbmZ1bmN0aW9uIHN0cmlwRW1wdHkob2JqOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSBudWxsIHx8IHYgPT09ICcnKSBjb250aW51ZTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2KSAmJiB2Lmxlbmd0aCA9PT0gMCkgY29udGludWU7XG4gICAgb3V0W2tdID0gdjtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFx1N0VDNFx1ODhDNVx1NjcwMFx1N0VDOFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVx1RkYwOFlBTUwgKyBcdTZCNjNcdTY1ODcgKyBoYXNoXHVGRjA5XHUzMDAyXG4gKiBAcGFyYW0gZnJvbnRtYXR0ZXIgXHU1NDBDXHU2QjY1XHU3RUQxXHU1QjlBICsgXHU3NTI4XHU2MjM3XHU1MTQzXHU2NTcwXHU2MzZFXG4gKiBAcGFyYW0gYm9keSBcdTZCNjNcdTY1ODcgbWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VtYmxlTWQoZnJvbnRtYXR0ZXI6IFlBTUxGcm9udG1hdHRlciwgYm9keTogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gXHU4QkExXHU3Qjk3XHU1RTc2XHU1MTk5XHU1MTY1IHN5bmNfaGFzaFxuICBjb25zdCBoYXNoID0gYm9keUhhc2goYm9keSk7XG4gIGNvbnN0IGZtV2l0aEhhc2g6IFlBTUxGcm9udG1hdHRlciA9IHtcbiAgICAuLi5mcm9udG1hdHRlcixcbiAgICBzeW5jX2hhc2g6IGhhc2gsXG4gIH07XG4gIHJldHVybiBhc3NlbWJsZUZpbGUoZm1XaXRoSGFzaCwgYm9keSk7XG59XG5cbi8qKlxuICogXHU2MjhBXHU5OERFXHU0RTY2XHU1QkZDXHU1MUZBXHU3Njg0IG1kIFx1NTkwNFx1NzQwNlx1NEUzQSBPQiBcdTZCNjNcdTY1ODdcdTMwMDJcbiAqIC0gXHU1NkZFXHU3MjQ3IGF1dGhjb2RlIFVSTCBcdTIxOTIgZmVpc2h1Oi8vVE9LRU5cbiAqIC0gXHU2ODA3XHU5ODk4XHU4ODRDXHU1M0JCXHU2Mzg5XHVGRjA4XHU2ODA3XHU5ODk4XHU1REYyXHU1NzI4IGZyb250bWF0dGVyLmZlaXNodV90aXRsZVx1RkYwQ09CIFx1OTFDQyBIMSBcdTRGRERcdTc1NTlcdTRGNDZcdTk4REVcdTRFNjZcdTRGQTdcdTc1MzEgb2JqIFx1NTkwNFx1NzQwNlx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0ZlaXNodU1kKG1kOiBzdHJpbmcsIGltZ1Rva2VuczogU2V0PHN0cmluZz4pOiBzdHJpbmcge1xuICByZXR1cm4gcmV3cml0ZUltYWdlc1RvRmVpc2h1UHJvdG8obWQsIGltZ1Rva2Vucyk7XG59XG5cbi8qKlxuICogXHU3NTFGXHU2MjEwXHU4NDNEXHU1NzMwXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU1Qjg5XHU1MTY4XHU2RTA1XHU2RDE3XHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlRmlsZW5hbWUoZmVpc2h1VGl0bGU6IHN0cmluZywgb3ZlcnJpZGU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBuYW1lID0gb3ZlcnJpZGUgPyBzYW5pdGl6ZUZpbGVuYW1lKG92ZXJyaWRlKSA6IHNhbml0aXplRmlsZW5hbWUoZmVpc2h1VGl0bGUpO1xuICByZXR1cm4gd2l0aE1kRXh0KG5hbWUpO1xufVxuXG4vKipcbiAqIFx1NjJGQ1x1NjNBNVx1ODQzRFx1NTczMFx1OERFRlx1NUY4NFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZVBhdGgoZGlyOiBzdHJpbmcgfCB1bmRlZmluZWQsIGZpbGVuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gam9pblBhdGgoZGlyLCBmaWxlbmFtZSk7XG59XG4iLCAiLyoqXG4gKiBhdXRvLXJlbmFtZSBcdTdGMTZcdTc4MDFcdTUyMDZcdTkxNERcdTMwMDJcdTRGOURcdTYzNkUgYDI2XzA1MDlfU18wOF9hNGIxMCBcdTRFMDlcdTc5Q0RcdTdGMTZcdTc4MDFcdTZBMjFcdTVGMEZcdTVCOUVcdTczQjBcdThCRjRcdTY2MEUubWRgXG4gKiArIGBcdTc3RTVcdThCQzZcdTVFOTNcdTgxRUFcdTUyQThcdTYyNTNcdTY4MDdcdTUzNEZcdThCQUVcdThGQjlcdTc1NEMubWRgICsgYDAyX1lBTUxcdTVCNTdcdTZCQjVcdTg5QzRcdTgzMDMubWRgIFx1MDBBNzIuM1x1MzAwMlxuICpcbiAqIFx1N0YxNlx1NzgwMVx1NjgzQ1x1NUYwRlx1RkYxQVlZX01NRERfXHU2ODA3XHU3QjdFX1x1NUU4Rlx1NTNGN1tfXHU1QjUwXHU1RThGXHU1M0Y3XVxuICogICAtIFx1NjU4N1x1NEVGNlx1RkYxQVx1ODIxMlx1NUM1NVx1NTc4QiBTXzAxXHVGRjA4XHU2ODA3XHU3QjdFX1x1NUU4Rlx1NTNGNyBcdTc1MjhcdTRFMEJcdTUyMTJcdTdFQkZcdUZGMDlcbiAqICAgLSBcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMUFcdTdEMjdcdTUxRDFcdTU3OEIgUzAxXHVGRjA4XHU2ODA3XHU3QjdFXHU1RThGXHU1M0Y3IFx1NjVFMFx1NEUwQlx1NTIxMlx1N0VCRlx1RkYwOVxuICpcbiAqIFx1NjgwN1x1N0I3RVx1NEY1M1x1N0NGQlx1RkYwODYgXHU3QzdCXHVGRjBDXHU1NDJCXHU4ODY1XHU1MTY4XHU3Njg0IFEgXHU3MDc1XHU2QzE0XHVGRjA5XHVGRjFBXG4gKiAgIFM9XHU2NTM2XHU5NkM2ICBYPVx1OTg3OVx1NzZFRSAgTD1cdTk4ODZcdTU3REYgIFo9XHU4RDQ0XHU2RTkwICBRPVx1NzA3NVx1NjExRiAgSj1cdTYyODBcdTgwRkRcbiAqXG4gKiBcdTg5RTZcdTUzRDFcdUZGMUFmZXRjaCBcdTg0M0RcdTU3MzBcdTU0MEVcdTMwMDFcdTUzRjNcdTk1MkVcdTgzRENcdTUzNTVcdTMwMDFyaWJib24gXHU2Mjc5XHU5MUNGXHUzMDAyXG4gKi9cbmltcG9ydCB7IFRGaWxlLCBURm9sZGVyLCB0eXBlIEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IHBhcnNlRnJvbnRtYXR0ZXIsIGFzc2VtYmxlRmlsZSwgdHlwZSBUYWcgfSBmcm9tICdAc3luYy9zaGFyZWQnO1xuXG4vKiogXHU2ODA3XHU3QjdFIFx1MjE5MiBcdTc2RUVcdTVGNTVcdTY2MjBcdTVDMDRcdUZGMDhcdTRGOURcdTYzNkUgMDFfXHU1QkY5XHU2QkQ0XHU2MkE1XHU1NDRBLm1kIFx1NzY4NFx1NzZFRVx1NUY1NVx1OERFRlx1NzUzMVx1ODlDNFx1NTIxOVx1RkYwOVx1MzAwMiAqL1xuY29uc3QgVEFHX0JZX0RJUl9ISU5UOiBSZWNvcmQ8c3RyaW5nLCBUYWc+ID0ge1xuICAnMFx1RkUwRlx1MjBFM1x1OEY5M1x1NTE2NSc6ICdTJyxcbiAgJzFcdUZFMEZcdTIwRTNcdThGOTNcdTUxRkEnOiAnWCcsXG4gICcyXHVGRTBGXHUyMEUzXHVEODNEXHVEREMzXHU3N0U1XHU4QkM2XHU2QzYwJzogJ1onLFxufTtcblxuLyoqIFx1N0YxNlx1NzgwMVx1NkI2M1x1NTIxOVx1RkYxQVlZX01NRERfVF9OTltfYU5dXHUzMDAyICovXG5jb25zdCBDT0RFX1JFID0gL14oXFxkezJ9KV8oXFxkezR9KV8oW1NYU0xaUUpdKV8oXFxkKykoPzpfKFthLXpdXFxkKykpPyQvO1xuXG4vKipcbiAqIFx1NEVDRVx1NjU4N1x1NEVGNlx1NjI0MFx1NTcyOFx1NzZFRVx1NUY1NVx1NjNBOFx1NUJGQ1x1NjgwN1x1N0I3RVx1MzAwMlxuICogXHU0RjE4XHU1MTQ4XHU3RUE3XHVGRjFBWUFNTCBcdTY4MDdcdTdCN0VcdTVCNTdcdTZCQjUgPiBcdTc2RUVcdTVGNTVcdTUyNERcdTdGMDAgPiBcdTlFRDhcdThCQTQgU1x1MzAwMlxuICovXG5mdW5jdGlvbiBpbmZlclRhZyhkaXI6IHN0cmluZywgZXhpc3RpbmdUYWc/OiBUYWcpOiBUYWcge1xuICBpZiAoZXhpc3RpbmdUYWcgJiYgWydTJywgJ1gnLCAnTCcsICdaJywgJ1EnLCAnSiddLmluY2x1ZGVzKGV4aXN0aW5nVGFnKSkge1xuICAgIHJldHVybiBleGlzdGluZ1RhZztcbiAgfVxuICBmb3IgKGNvbnN0IFtkaXJIaW50LCB0YWddIG9mIE9iamVjdC5lbnRyaWVzKFRBR19CWV9ESVJfSElOVCkpIHtcbiAgICBpZiAoZGlyLnN0YXJ0c1dpdGgoZGlySGludCkpIHJldHVybiB0YWc7XG4gIH1cbiAgLy8gXHU3N0U1XHU4QkM2XHU2QzYwXHU0RTBCXHU3Njg0XHU1QjUwXHU3NkVFXHU1RjU1XHU1M0VGXHU4MEZEXHU4RkRCXHU0RTAwXHU2QjY1XHU3RUM2XHU1MjA2XG4gIGlmIChkaXIuaW5jbHVkZXMoJ1x1NzdFNVx1OEJDNlx1NkM2MCcpIHx8IGRpci5pbmNsdWRlcygnXHVEODNEXHVEREMzJykpIHtcbiAgICAvLyBcdThENDRcdTZFOTBcdTdDN0JcdTlFRDhcdThCQTQgWlx1RkYwQ1x1NTNFRlx1ODhBQlx1NzZFRVx1NUY1NVx1NTQwRFx1ODk4Nlx1NzZENlxuICAgIGlmIChkaXIuaW5jbHVkZXMoJ0wnKSB8fCBkaXIuaW5jbHVkZXMoJ1x1OTg4Nlx1NTdERicpKSByZXR1cm4gJ0wnO1xuICAgIGlmIChkaXIuaW5jbHVkZXMoJ1EnKSB8fCBkaXIuaW5jbHVkZXMoJ1x1NzA3NVx1NjExRicpKSByZXR1cm4gJ1EnO1xuICAgIGlmIChkaXIuaW5jbHVkZXMoJ0onKSB8fCBkaXIuaW5jbHVkZXMoJ1x1NjI4MFx1ODBGRCcpKSByZXR1cm4gJ0onO1xuICAgIHJldHVybiAnWic7XG4gIH1cbiAgaWYgKGRpci5pbmNsdWRlcygnXHU4RjkzXHU1MUZBJykgfHwgZGlyLmluY2x1ZGVzKCcxXHVGRTBGXHUyMEUzJykpIHJldHVybiAnWCc7XG4gIGlmIChkaXIuaW5jbHVkZXMoJ1x1OEY5M1x1NTE2NScpIHx8IGRpci5pbmNsdWRlcygnMFx1RkUwRlx1MjBFMycpKSByZXR1cm4gJ1MnO1xuICByZXR1cm4gJ1MnO1xufVxuXG4vKipcbiAqIFx1NjI2Qlx1NjNDRlx1NTQwQ1x1NzZFRVx1NUY1NVx1NEUwQlx1NTQwQ1x1NjgwN1x1N0I3RVx1NzY4NFx1NjcwMFx1NTkyN1x1NUU4Rlx1NTNGN1x1RkYwQ1x1NTIwNlx1OTE0RFx1NjVCMFx1NUU4Rlx1NTNGN1x1MzAwMlxuICovXG5hc3luYyBmdW5jdGlvbiBuZXh0U2VxdWVuY2UoYXBwOiBBcHAsIGRpcjogc3RyaW5nLCB0YWc6IFRhZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gIGNvbnN0IGZvbGRlciA9IGFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZGlyKTtcbiAgaWYgKCEoZm9sZGVyIGluc3RhbmNlb2YgVEZvbGRlcikpIHJldHVybiAxO1xuXG4gIGxldCBtYXhTZXEgPSAwO1xuICBmb3IgKGNvbnN0IGNoaWxkIG9mIGZvbGRlci5jaGlsZHJlbikge1xuICAgIGlmICghKGNoaWxkIGluc3RhbmNlb2YgVEZpbGUpIHx8ICFjaGlsZC5uYW1lLmVuZHNXaXRoKCcubWQnKSkgY29udGludWU7XG4gICAgY29uc3QgbWF0Y2ggPSBjaGlsZC5uYW1lLm1hdGNoKENPREVfUkUpO1xuICAgIGlmIChtYXRjaCAmJiBtYXRjaFszXSA9PT0gdGFnKSB7XG4gICAgICBjb25zdCBzZXEgPSBwYXJzZUludChtYXRjaFs0XSwgMTApO1xuICAgICAgaWYgKHNlcSA+IG1heFNlcSkgbWF4U2VxID0gc2VxO1xuICAgIH1cbiAgICAvLyBcdTRFNUZcdTUzMzlcdTkxNERcdTY1RTBcdTUyNERcdTdGMDBcdTRGNDZcdTY3MDkgWUFNTCBcdTdGMTZcdTc4MDFcdTc2ODRcdTYwQzVcdTUxQjVcbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgYXBwLnZhdWx0LnJlYWQoY2hpbGQpO1xuICAgICAgICBjb25zdCB7IGZyb250bWF0dGVyIH0gPSBwYXJzZUZyb250bWF0dGVyKGNvbnRlbnQpO1xuICAgICAgICBjb25zdCBlbmMgPSBmcm9udG1hdHRlcj8uXHU3RjE2XHU3ODAxIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKGVuYykge1xuICAgICAgICAgIGNvbnN0IGVuY01hdGNoID0gZW5jLm1hdGNoKENPREVfUkUpO1xuICAgICAgICAgIGlmIChlbmNNYXRjaCAmJiBlbmNNYXRjaFszXSA9PT0gdGFnKSB7XG4gICAgICAgICAgICBjb25zdCBzZXEgPSBwYXJzZUludChlbmNNYXRjaFs0XSwgMTApO1xuICAgICAgICAgICAgaWYgKHNlcSA+IG1heFNlcSkgbWF4U2VxID0gc2VxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbWF4U2VxICsgMTtcbn1cblxuLyoqXG4gKiBcdTRFM0FcdTY1ODdcdTRFRjZcdTUyMDZcdTkxNERcdTdGMTZcdTc4MDFcdTMwMDJcbiAqIC0gXHU3NTFGXHU2MjEwIFlZX01NRERfVF9OTiBcdTY4M0NcdTVGMEZcbiAqIC0gXHU5MUNEXHU1NDdEXHU1NDBEXHU2NTg3XHU0RUY2XHVGRjA4XHU1MkEwXHU3RjE2XHU3ODAxXHU1MjREXHU3RjAwXHVGRjA5XG4gKiAtIFx1NTE5OVx1NTZERSBZQU1MIFx1N0YxNlx1NzgwMVx1NUI1N1x1NkJCNVxuICpcbiAqIEByZXR1cm5zIFx1NTIwNlx1OTE0RFx1NTIzMFx1NzY4NFx1N0YxNlx1NzgwMVx1NEUzMlx1RkYwQ1x1NTk4MiBcIjI2XzA2MTVfU18wMVwiXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhc3NpZ25FbmNvZGluZyhcbiAgYXBwOiBBcHAsXG4gIGZpbGVQYXRoOiBzdHJpbmcsXG4gIGRpcjogc3RyaW5nLFxuKTogUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQ+IHtcbiAgY29uc3QgZmlsZSA9IGFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZmlsZVBhdGgpO1xuICBpZiAoIShmaWxlIGluc3RhbmNlb2YgVEZpbGUpKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBhcHAudmF1bHQucmVhZChmaWxlKTtcbiAgY29uc3QgeyBmcm9udG1hdHRlciwgYm9keSB9ID0gcGFyc2VGcm9udG1hdHRlcihjb250ZW50KTtcbiAgY29uc3QgZm0gPSBmcm9udG1hdHRlciA/PyB7fTtcblxuICAvLyBcdTVERjJcdTY3MDlcdTdGMTZcdTc4MDFcdTVDMzFcdThERjNcdThGQzdcbiAgaWYgKGZtLlx1N0YxNlx1NzgwMSAmJiBDT0RFX1JFLnRlc3QoZm0uXHU3RjE2XHU3ODAxIGFzIHN0cmluZykpIHtcbiAgICByZXR1cm4gZm0uXHU3RjE2XHU3ODAxIGFzIHN0cmluZztcbiAgfVxuXG4gIC8vIFx1NjNBOFx1NUJGQ1x1NjgwN1x1N0I3RSArIFx1NUU4Rlx1NTNGN1xuICBjb25zdCB0YWcgPSBpbmZlclRhZyhkaXIsIGZtLlx1NjgwN1x1N0I3RSBhcyBUYWcgfCB1bmRlZmluZWQpO1xuICBjb25zdCBzZXEgPSBhd2FpdCBuZXh0U2VxdWVuY2UoYXBwLCBkaXIsIHRhZyk7XG5cbiAgLy8gXHU3NTFGXHU2MjEwXHU3RjE2XHU3ODAxXG4gIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gIGNvbnN0IHl5ID0gU3RyaW5nKG5vdy5nZXRGdWxsWWVhcigpKS5zbGljZSgyKTtcbiAgY29uc3QgbW1kZCA9IGAke1N0cmluZyhub3cuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyl9JHtTdHJpbmcobm93LmdldERhdGUoKSkucGFkU3RhcnQoMiwgJzAnKX1gO1xuICBjb25zdCBjb2RlID0gYCR7eXl9XyR7bW1kZH1fJHt0YWd9XyR7U3RyaW5nKHNlcSkucGFkU3RhcnQoMiwgJzAnKX1gO1xuXG4gIC8vIFx1NTE5OVx1NTZERSBZQU1MXG4gIGNvbnN0IG5ld0ZtID0geyAuLi5mbSwgXHU2ODA3XHU3QjdFOiB0YWcsIFx1N0YxNlx1NzgwMTogY29kZSB9O1xuICBjb25zdCBuZXdDb250ZW50ID0gYXNzZW1ibGVGaWxlKG5ld0ZtLCBib2R5KTtcbiAgYXdhaXQgYXBwLnZhdWx0Lm1vZGlmeShmaWxlLCBuZXdDb250ZW50KTtcblxuICAvLyBcdTkxQ0RcdTU0N0RcdTU0MERcdTY1ODdcdTRFRjZcdUZGMDhcdTUyQTBcdTdGMTZcdTc4MDFcdTUyNERcdTdGMDBcdUZGMDlcbiAgY29uc3QgZXh0ID0gZmlsZS5leHRlbnNpb247XG4gIGNvbnN0IG9sZE5hbWUgPSBmaWxlLmJhc2VuYW1lO1xuICBjb25zdCBuZXdOYW1lID0gYCR7Y29kZX0gJHtvbGROYW1lfWA7XG4gIGNvbnN0IG5ld1BhdGggPSBmaWxlUGF0aC5yZXBsYWNlKC9bXi9dKyQvLCBgJHtuZXdOYW1lfS4ke2V4dH1gKTtcbiAgaWYgKG5ld1BhdGggIT09IGZpbGVQYXRoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGFwcC52YXVsdC5yZW5hbWUoZmlsZSwgbmV3UGF0aCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2F1dG9SZW5hbWVdIHJlbmFtZSBmYWlsZWQ6JywgZXJyKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29kZTtcbn1cblxuLyoqXG4gKiBcdTYyNzlcdTkxQ0ZcdTUyMDZcdTkxNERcdTdGMTZcdTc4MDFcdUZGMDhyaWJib24gXHU4OUU2XHU1M0QxXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBiYXRjaEFzc2lnbkVuY29kaW5nKGFwcDogQXBwLCBkaXI6IHN0cmluZyk6IFByb21pc2U8eyB0b3RhbDogbnVtYmVyOyBhc3NpZ25lZDogbnVtYmVyIH0+IHtcbiAgY29uc3QgZm9sZGVyID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChkaXIpO1xuICBpZiAoIShmb2xkZXIgaW5zdGFuY2VvZiBURm9sZGVyKSkgcmV0dXJuIHsgdG90YWw6IDAsIGFzc2lnbmVkOiAwIH07XG5cbiAgbGV0IGFzc2lnbmVkID0gMDtcbiAgbGV0IHRvdGFsID0gMDtcbiAgZm9yIChjb25zdCBjaGlsZCBvZiBmb2xkZXIuY2hpbGRyZW4pIHtcbiAgICBpZiAoIShjaGlsZCBpbnN0YW5jZW9mIFRGaWxlKSB8fCAhY2hpbGQubmFtZS5lbmRzV2l0aCgnLm1kJykpIGNvbnRpbnVlO1xuICAgIHRvdGFsKys7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFzc2lnbkVuY29kaW5nKGFwcCwgY2hpbGQucGF0aCwgZGlyKTtcbiAgICAgIGlmIChyZXN1bHQpIGFzc2lnbmVkKys7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFtzeW5jL2F1dG9SZW5hbWVdIGJhdGNoIGZhaWxlZCBmb3IgJHtjaGlsZC5wYXRofTpgLCBlcnIpO1xuICAgIH1cbiAgfVxuICByZXR1cm4geyB0b3RhbCwgYXNzaWduZWQgfTtcbn1cblxuLyoqXG4gKiBcdTg5RTNcdTc4MDFcdUZGMUFcdTRFQ0VcdTY1ODdcdTRFRjZcdTU0MERcdTYyMTYgWUFNTCBcdTYzRDBcdTUzRDZcdTdGMTZcdTc4MDFcdTRGRTFcdTYwNkZcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZUNvZGUoY29kZTogc3RyaW5nKToge1xuICB5eTogc3RyaW5nO1xuICBtbWRkOiBzdHJpbmc7XG4gIHRhZzogVGFnO1xuICBzZXE6IG51bWJlcjtcbiAgc3ViPzogc3RyaW5nO1xufSB8IG51bGwge1xuICBjb25zdCBtYXRjaCA9IGNvZGUubWF0Y2goQ09ERV9SRSk7XG4gIGlmICghbWF0Y2gpIHJldHVybiBudWxsO1xuICByZXR1cm4ge1xuICAgIHl5OiBtYXRjaFsxXSxcbiAgICBtbWRkOiBtYXRjaFsyXSxcbiAgICB0YWc6IG1hdGNoWzNdIGFzIFRhZyxcbiAgICBzZXE6IHBhcnNlSW50KG1hdGNoWzRdLCAxMCksXG4gICAgc3ViOiBtYXRjaFs1XSxcbiAgfTtcbn1cbiIsICJleHBvcnQgaW50ZXJmYWNlIEJpbmRpbmdFbnRyeSB7XG4gIHBhdGg6IHN0cmluZztcbiAgY29udGVudDogc3RyaW5nO1xufVxuXG5jbGFzcyBCaW5kaW5nQ29uZmxpY3RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29kZSA9ICdCSU5ESU5HX0NPTkZMSUNUJztcbiAgc3RhdHVzID0gNDA5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEZlaXNodUlkKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCBub3JtYWxpemVkID0gY29udGVudC5yZXBsYWNlKC9eXFx1RkVGRi8sICcnKS5yZXBsYWNlKC9cXHJcXG4/L2csICdcXG4nKTtcbiAgY29uc3QgZnJvbnRtYXR0ZXIgPSBub3JtYWxpemVkLm1hdGNoKC9eLS0tWyBcXHRdKlxcbihbXFxzXFxTXSo/KVxcbi0tLSg/OlxcbnwkKS8pPy5bMV07XG4gIGlmICghZnJvbnRtYXR0ZXIpIHJldHVybiBudWxsO1xuICBjb25zdCBtYXRjaCA9IGZyb250bWF0dGVyLm1hdGNoKC9eZmVpc2h1X2lkWyBcXHRdKjpbIFxcdF0qKD86XCIoW0EtWmEtejAtOV8tXSspXCJ8JyhbQS1aYS16MC05Xy1dKyknfChbQS1aYS16MC05Xy1dKykpWyBcXHRdKiQvbSk7XG4gIHJldHVybiBtYXRjaD8uWzFdID8/IG1hdGNoPy5bMl0gPz8gbWF0Y2g/LlszXSA/PyBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZFVuaXF1ZUJpbmRpbmc8VCBleHRlbmRzIEJpbmRpbmdFbnRyeT4oZmVpc2h1SWQ6IHN0cmluZywgZW50cmllczogcmVhZG9ubHkgVFtdKTogVCB8IG51bGwge1xuICBjb25zdCBtYXRjaGVzID0gZW50cmllcy5maWx0ZXIoKGVudHJ5KSA9PiB7XG4gICAgY29uc3Qgcm9vdCA9IGVudHJ5LnBhdGguc3BsaXQoJy8nKVswXS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChyb290ID09PSAnLm9ic2lkaWFuJyB8fCByb290ID09PSAnLmZlaXNodS1zeW5jJykgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBleHRyYWN0RmVpc2h1SWQoZW50cnkuY29udGVudCkgPT09IGZlaXNodUlkO1xuICB9KTtcbiAgaWYgKG1hdGNoZXMubGVuZ3RoID4gMSkge1xuICAgIGNvbnN0IHBhdGhzID0gbWF0Y2hlcy5tYXAoKGVudHJ5KSA9PiBlbnRyeS5wYXRoKS5zb3J0KCk7XG4gICAgdGhyb3cgbmV3IEJpbmRpbmdDb25mbGljdEVycm9yKGBNdWx0aXBsZSBsb2NhbCBmaWxlcyBiaW5kIGZlaXNodV9pZCAke2ZlaXNodUlkfTogJHtwYXRocy5qb2luKCcsICcpfWApO1xuICB9XG4gIHJldHVybiBtYXRjaGVzWzBdID8/IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRSZXBsYWNlbWVudEJpbmRpbmcoY29udGVudDogc3RyaW5nLCBleHBlY3RlZEZlaXNodUlkOiBzdHJpbmcsIHBhdGg6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBleGlzdGluZ0ZlaXNodUlkID0gZXh0cmFjdEZlaXNodUlkKGNvbnRlbnQpO1xuICBpZiAoZXhpc3RpbmdGZWlzaHVJZCAmJiBleGlzdGluZ0ZlaXNodUlkICE9PSBleHBlY3RlZEZlaXNodUlkKSB7XG4gICAgY29uc3QgZXJyb3IgPSBuZXcgQmluZGluZ0NvbmZsaWN0RXJyb3IoXG4gICAgICBgUmVmdXNpbmcgdG8gcmVwbGFjZSAke3BhdGh9OyBpdCBpcyBib3VuZCB0byBhbm90aGVyIGZlaXNodV9pZGAsXG4gICAgKTtcbiAgICBlcnJvci5jb2RlID0gJ1JFUExBQ0VNRU5UX0JJTkRJTkdfQ09ORkxJQ1QnO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgVEZpbGUsIHR5cGUgQXBwIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgZmluZFVuaXF1ZUJpbmRpbmcgfSBmcm9tICcuL2JpbmRpbmdJbmRleC5qcyc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kVW5pcXVlVmF1bHRCaW5kaW5nKGFwcDogQXBwLCBmZWlzaHVJZDogc3RyaW5nKTogUHJvbWlzZTxURmlsZSB8IG51bGw+IHtcbiAgY29uc3QgZW50cmllczogQXJyYXk8eyBwYXRoOiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZzsgZmlsZTogVEZpbGUgfT4gPSBbXTtcbiAgZm9yIChjb25zdCBmaWxlIG9mIGFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCkpIHtcbiAgICBjb25zdCByb290ID0gZmlsZS5wYXRoLnNwbGl0KCcvJylbMF0udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAocm9vdCA9PT0gJy5vYnNpZGlhbicgfHwgcm9vdCA9PT0gJy5mZWlzaHUtc3luYycpIGNvbnRpbnVlO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gICAgICBpZiAoY29udGVudC5pbmNsdWRlcygnZmVpc2h1X2lkOicpKSBlbnRyaWVzLnB1c2goeyBwYXRoOiBmaWxlLnBhdGgsIGNvbnRlbnQsIGZpbGUgfSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZpbmRVbmlxdWVCaW5kaW5nKGZlaXNodUlkLCBlbnRyaWVzKT8uZmlsZSA/PyBudWxsO1xufVxuIiwgImNvbnN0IE1BWF9QQVRIX0JZVEVTID0gMTAyNDtcbmNvbnN0IE1BWF9TRUdNRU5UX0JZVEVTID0gMjU1O1xuY29uc3QgSU5URVJOQUxfUk9PVFMgPSBuZXcgU2V0KFsnLm9ic2lkaWFuJywgJy5mZWlzaHUtc3luYyddKTtcblxuY2xhc3MgVmFsaWRhdGlvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb2RlOiBzdHJpbmc7XG4gIHN0YXR1cyA9IDQwMDtcblxuICBjb25zdHJ1Y3Rvcihjb2RlOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMuY29kZSA9IGNvZGU7XG4gIH1cbn1cblxuZnVuY3Rpb24gdW5zYWZlUGF0aChtZXNzYWdlOiBzdHJpbmcpOiBuZXZlciB7XG4gIHRocm93IG5ldyBWYWxpZGF0aW9uRXJyb3IoJ1VOU0FGRV9WQVVMVF9QQVRIJywgbWVzc2FnZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVWYXVsdERpcih2YWx1ZTogdW5rbm93bik6IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB1bnNhZmVQYXRoKCdWYXVsdCBwYXRoIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgY29uc3QgcmF3ID0gdmFsdWUudHJpbSgpO1xuICBpZiAoIXJhdykgcmV0dXJuICcnO1xuICBpZiAocmF3LmluY2x1ZGVzKCdcXDAnKSkgdW5zYWZlUGF0aCgnVmF1bHQgcGF0aCBjb250YWlucyBOVUwnKTtcbiAgaWYgKC9eKD86XFwvfFxcXFx8W0EtWmEtel06KS8udGVzdChyYXcpKSB1bnNhZmVQYXRoKCdBYnNvbHV0ZSBWYXVsdCBwYXRocyBhcmUgbm90IGFsbG93ZWQnKTtcbiAgaWYgKC9cXFxcLy50ZXN0KHJhdykpIHVuc2FmZVBhdGgoJ0JhY2tzbGFzaCBzZXBhcmF0b3JzIGFyZSBub3QgYWxsb3dlZCcpO1xuICBpZiAoLyUoPzoyZnw1Y3wwMCkvaS50ZXN0KHJhdykpIHVuc2FmZVBhdGgoJ0VuY29kZWQgc2VwYXJhdG9ycyBhbmQgTlVMIGFyZSBub3QgYWxsb3dlZCcpO1xuXG4gIGxldCBkZWNvZGVkOiBzdHJpbmc7XG4gIHRyeSB7XG4gICAgZGVjb2RlZCA9IGRlY29kZVVSSUNvbXBvbmVudChyYXcpO1xuICB9IGNhdGNoIHtcbiAgICB1bnNhZmVQYXRoKCdWYXVsdCBwYXRoIGNvbnRhaW5zIG1hbGZvcm1lZCBwZXJjZW50IGVuY29kaW5nJyk7XG4gIH1cbiAgaWYgKGRlY29kZWQuaW5jbHVkZXMoJ1xcMCcpIHx8IGRlY29kZWQuaW5jbHVkZXMoJ1xcXFwnKSkgdW5zYWZlUGF0aCgnRGVjb2RlZCBWYXVsdCBwYXRoIGlzIHVuc2FmZScpO1xuXG4gIGNvbnN0IHdpdGhvdXRUcmFpbGluZ1NsYXNoID0gcmF3LnJlcGxhY2UoL1xcLyskLywgJycpO1xuICBjb25zdCBkZWNvZGVkV2l0aG91dFRyYWlsaW5nU2xhc2ggPSBkZWNvZGVkLnJlcGxhY2UoL1xcLyskLywgJycpO1xuICBjb25zdCByYXdTZWdtZW50cyA9IHdpdGhvdXRUcmFpbGluZ1NsYXNoLnNwbGl0KCcvJyk7XG4gIGNvbnN0IGRlY29kZWRTZWdtZW50cyA9IGRlY29kZWRXaXRob3V0VHJhaWxpbmdTbGFzaC5zcGxpdCgnLycpO1xuICBpZiAocmF3U2VnbWVudHMubGVuZ3RoICE9PSBkZWNvZGVkU2VnbWVudHMubGVuZ3RoKSB1bnNhZmVQYXRoKCdFbmNvZGVkIHBhdGggc2VwYXJhdG9ycyBhcmUgbm90IGFsbG93ZWQnKTtcbiAgaWYgKGRlY29kZWRTZWdtZW50cy5zb21lKChzZWdtZW50KSA9PiAhc2VnbWVudCB8fCBzZWdtZW50ID09PSAnLicgfHwgc2VnbWVudCA9PT0gJy4uJykpIHtcbiAgICB1bnNhZmVQYXRoKCdFbXB0eSBhbmQgdHJhdmVyc2FsIHBhdGggc2VnbWVudHMgYXJlIG5vdCBhbGxvd2VkJyk7XG4gIH1cblxuICBjb25zdCBub3JtYWxpemVkU2VnbWVudHMgPSByYXdTZWdtZW50cy5tYXAoKHNlZ21lbnQpID0+IHNlZ21lbnQudHJpbSgpKTtcbiAgaWYgKG5vcm1hbGl6ZWRTZWdtZW50cy5zb21lKChzZWdtZW50KSA9PiAhc2VnbWVudCkpIHVuc2FmZVBhdGgoJ0VtcHR5IHBhdGggc2VnbWVudHMgYXJlIG5vdCBhbGxvd2VkJyk7XG4gIGlmIChJTlRFUk5BTF9ST09UUy5oYXMoZGVjb2RlZFNlZ21lbnRzWzBdLnRyaW0oKS50b0xvd2VyQ2FzZSgpKSkge1xuICAgIHVuc2FmZVBhdGgoJ0ludGVybmFsIHBsdWdpbiBwYXRocyBhcmUgbm90IHdyaXRhYmxlJyk7XG4gIH1cbiAgZm9yIChjb25zdCBzZWdtZW50IG9mIG5vcm1hbGl6ZWRTZWdtZW50cykge1xuICAgIGlmIChCdWZmZXIuYnl0ZUxlbmd0aChzZWdtZW50LCAndXRmOCcpID4gTUFYX1NFR01FTlRfQllURVMpIHtcbiAgICAgIHVuc2FmZVBhdGgoJ1ZhdWx0IHBhdGggc2VnbWVudCBpcyB0b28gbG9uZycpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVkU2VnbWVudHMuam9pbignLycpO1xuICBpZiAoQnVmZmVyLmJ5dGVMZW5ndGgobm9ybWFsaXplZCwgJ3V0ZjgnKSA+IE1BWF9QQVRIX0JZVEVTKSB1bnNhZmVQYXRoKCdWYXVsdCBwYXRoIGlzIHRvbyBsb25nJyk7XG4gIHJldHVybiBub3JtYWxpemVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplVmF1bHRNYXJrZG93blBhdGgodmFsdWU6IHVua25vd24pOiBzdHJpbmcge1xuICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplVmF1bHREaXIodmFsdWUpO1xuICBpZiAoIW5vcm1hbGl6ZWQgfHwgIS9cXC5tZCQvaS50ZXN0KG5vcm1hbGl6ZWQpKSB7XG4gICAgdW5zYWZlUGF0aCgnVmF1bHQgZmlsZSBwYXRoIG11c3QgZW5kIGluIC5tZCcpO1xuICB9XG4gIHJldHVybiBub3JtYWxpemVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVJbWFnZVRva2VuKHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgfHwgIS9eW0EtWmEtejAtOV8tXXsxLDI1Nn0kLy50ZXN0KHZhbHVlKSkge1xuICAgIHRocm93IG5ldyBWYWxpZGF0aW9uRXJyb3IoJ1VOU0FGRV9JTUFHRV9UT0tFTicsICdJbWFnZSB0b2tlbiBpcyBub3QgYSBzYWZlIG9wYXF1ZSBpZGVudGlmaWVyJyk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuIiwgImltcG9ydCB7XG4gIGJvZHlIYXNoLFxuICBjYWxsb3V0WG1sVG9NZXRhLFxuICBjb252ZXJ0RmVpc2h1Q2FsbG91dHNUb09CLFxuICBleHRyYWN0SW1nVG9rZW5zRnJvbVhtbCxcbiAgcmV3cml0ZUltYWdlc1RvRmVpc2h1UHJvdG8sXG59IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVtb3RlRG9jdW1lbnQge1xuICByYXdNYXJrZG93bjogc3RyaW5nO1xuICBib2R5OiBzdHJpbmc7XG4gIGhhc2g6IHN0cmluZztcbiAgdGl0bGU6IHN0cmluZztcbiAgb2JqVG9rZW46IHN0cmluZztcbiAgbWV0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJlbW90ZURvY3VtZW50KFxuICByYXdNYXJrZG93bjogc3RyaW5nLFxuICB4bWw6IHN0cmluZyxcbiAgbm9kZVRva2VuOiBzdHJpbmcsXG4gIG9ialRva2VuID0gJycsXG4pOiBSZW1vdGVEb2N1bWVudCB7XG4gIGNvbnN0IHJlc29sdmVkT2JqVG9rZW4gPSBvYmpUb2tlblxuICAgIHx8IHhtbC5tYXRjaCgvPHRpdGxlW14+XSpcXGJpZD1cIihbQS1aYS16MC05Xy1dKylcIi8pPy5bMV1cbiAgICB8fCAnJztcbiAgY29uc3QgaW1hZ2VUb2tlbnMgPSBuZXcgU2V0KGV4dHJhY3RJbWdUb2tlbnNGcm9tWG1sKHhtbCkpO1xuICBsZXQgYm9keSA9IHJld3JpdGVJbWFnZXNUb0ZlaXNodVByb3RvKHJhd01hcmtkb3duLCBpbWFnZVRva2Vucyk7XG4gIGlmICh4bWwpIGJvZHkgPSBjb252ZXJ0RmVpc2h1Q2FsbG91dHNUb09CKGJvZHkpO1xuICBjb25zdCB0aXRsZSA9IGJvZHkubWF0Y2goL14jXFxzKyguKykkL20pPy5bMV0/LnRyaW0oKSA/PyBub2RlVG9rZW47XG5cbiAgcmV0dXJuIHtcbiAgICByYXdNYXJrZG93bixcbiAgICBib2R5LFxuICAgIGhhc2g6IGJvZHlIYXNoKGJvZHkpLFxuICAgIHRpdGxlLFxuICAgIG9ialRva2VuOiByZXNvbHZlZE9ialRva2VuLFxuICAgIG1ldGE6IHhtbCA/IGNhbGxvdXRYbWxUb01ldGEoeG1sKSA6IHt9LFxuICB9O1xufVxuIiwgImltcG9ydCB7IHJ1biwgZ2V0V2lraU5vZGVJbmZvIH0gZnJvbSAnLi9sYXJrL2NsaS5qcyc7XG5pbXBvcnQgeyBidWlsZFJlbW90ZURvY3VtZW50LCB0eXBlIFJlbW90ZURvY3VtZW50IH0gZnJvbSAnLi9yZW1vdGVDYW5vbmljYWwuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2hSZW1vdGVEb2N1bWVudChpbnB1dDoge1xuICBub2RlVG9rZW46IHN0cmluZztcbiAgc3BhY2VJZD86IHN0cmluZztcbiAgb2JqVG9rZW4/OiBzdHJpbmc7XG59KTogUmVtb3RlRG9jdW1lbnQge1xuICBsZXQgcmVzb2x2ZWRPYmpUb2tlbiA9IGlucHV0Lm9ialRva2VuID8/ICcnO1xuICBsZXQgd2lraUluZm86IFJldHVyblR5cGU8dHlwZW9mIGdldFdpa2lOb2RlSW5mbz4gfCBudWxsID0gbnVsbDtcbiAgbGV0IHJhd01hcmtkb3duOiBzdHJpbmc7XG4gIHRyeSB7XG4gICAgcmF3TWFya2Rvd24gPSBmZXRjaEZvcm1hdChpbnB1dC5ub2RlVG9rZW4sICdtYXJrZG93bicpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHdpa2lJbmZvID0gaW5wdXQuc3BhY2VJZCA/IGdldFdpa2lOb2RlSW5mbyhpbnB1dC5ub2RlVG9rZW4sIGlucHV0LnNwYWNlSWQpIDogbnVsbDtcbiAgICByZXNvbHZlZE9ialRva2VuIHx8PSB3aWtpSW5mbz8ub2JqX3Rva2VuID8/ICcnO1xuICAgIGlmICghcmVzb2x2ZWRPYmpUb2tlbikgdGhyb3cgZXJyb3I7XG4gICAgcmF3TWFya2Rvd24gPSBmZXRjaEZvcm1hdChyZXNvbHZlZE9ialRva2VuLCAnbWFya2Rvd24nKTtcbiAgfVxuXG4gIGxldCB4bWwgPSAnJztcbiAgdHJ5IHtcbiAgICB4bWwgPSBmZXRjaEZvcm1hdChpbnB1dC5ub2RlVG9rZW4sICd4bWwnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoIXJlc29sdmVkT2JqVG9rZW4gJiYgaW5wdXQuc3BhY2VJZCkge1xuICAgICAgd2lraUluZm8gPz89IGdldFdpa2lOb2RlSW5mbyhpbnB1dC5ub2RlVG9rZW4sIGlucHV0LnNwYWNlSWQpO1xuICAgICAgcmVzb2x2ZWRPYmpUb2tlbiA9IHdpa2lJbmZvPy5vYmpfdG9rZW4gPz8gJyc7XG4gICAgfVxuICAgIGlmIChyZXNvbHZlZE9ialRva2VuICYmIHJlc29sdmVkT2JqVG9rZW4gIT09IGlucHV0Lm5vZGVUb2tlbikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgeG1sID0gZmV0Y2hGb3JtYXQocmVzb2x2ZWRPYmpUb2tlbiwgJ3htbCcpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIGNvbnNvbGUud2FybignW3N5bmMvcmVtb3RlXSB4bWwgZmV0Y2ggZmFpbGVkOyBpbWFnZSBhbmQgY2FsbG91dCBtZXRhZGF0YSBtYXkgYmUgaW5jb21wbGV0ZTonLCBlcnJvcik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybignW3N5bmMvcmVtb3RlXSB4bWwgZmV0Y2ggZmFpbGVkOyBpbWFnZSBhbmQgY2FsbG91dCBtZXRhZGF0YSBtYXkgYmUgaW5jb21wbGV0ZTonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1aWxkUmVtb3RlRG9jdW1lbnQocmF3TWFya2Rvd24sIHhtbCwgaW5wdXQubm9kZVRva2VuLCByZXNvbHZlZE9ialRva2VuKTtcbn1cblxuZnVuY3Rpb24gZmV0Y2hGb3JtYXQodG9rZW46IHN0cmluZywgZm9ybWF0OiAnbWFya2Rvd24nIHwgJ3htbCcpOiBzdHJpbmcge1xuICBjb25zdCBhcmdzID0gWydkb2NzJywgJytmZXRjaCcsICctLWRvYycsIHRva2VuLCAnLS1kb2MtZm9ybWF0JywgZm9ybWF0XTtcbiAgaWYgKGZvcm1hdCA9PT0gJ3htbCcpIGFyZ3MucHVzaCgnLS1kZXRhaWwnLCAnd2l0aC1pZHMnKTtcbiAgcmV0dXJuIHJ1bihhcmdzLCB7IHRpbWVvdXQ6IDYwXzAwMCB9KTtcbn1cbiIsICJleHBvcnQgaW50ZXJmYWNlIFRocmVlV2F5U3luY0lucHV0IHtcbiAgYmFzZUhhc2g/OiBzdHJpbmc7XG4gIGxvY2FsSGFzaDogc3RyaW5nO1xuICByZW1vdGVIYXNoOiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIFRocmVlV2F5U3luY0RlY2lzaW9uID1cbiAgfCB7IGFjdGlvbjogJ3BhdXNlJzsgcmVhc29uOiAnTUlTU0lOR19CQVNFJyB9XG4gIHwgeyBhY3Rpb246ICdjb25mbGljdCc7IHJlYXNvbjogJ0JPVEhfQ0hBTkdFRCcgfVxuICB8IHsgYWN0aW9uOiAncHVsbCcgfCAncHVzaCcgfCAnY29udmVyZ2VkJyB8ICd1bmNoYW5nZWQnIH07XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWNpZGVUaHJlZVdheVN5bmMoaW5wdXQ6IFRocmVlV2F5U3luY0lucHV0KTogVGhyZWVXYXlTeW5jRGVjaXNpb24ge1xuICBjb25zdCBiYXNlSGFzaCA9IGlucHV0LmJhc2VIYXNoPy50cmltKCk7XG4gIGlmICghYmFzZUhhc2gpIHJldHVybiB7IGFjdGlvbjogJ3BhdXNlJywgcmVhc29uOiAnTUlTU0lOR19CQVNFJyB9O1xuXG4gIGNvbnN0IGxvY2FsQ2hhbmdlZCA9IGlucHV0LmxvY2FsSGFzaCAhPT0gYmFzZUhhc2g7XG4gIGNvbnN0IHJlbW90ZUNoYW5nZWQgPSBpbnB1dC5yZW1vdGVIYXNoICE9PSBiYXNlSGFzaDtcbiAgaWYgKCFsb2NhbENoYW5nZWQgJiYgIXJlbW90ZUNoYW5nZWQpIHJldHVybiB7IGFjdGlvbjogJ3VuY2hhbmdlZCcgfTtcbiAgaWYgKGlucHV0LmxvY2FsSGFzaCA9PT0gaW5wdXQucmVtb3RlSGFzaCkgcmV0dXJuIHsgYWN0aW9uOiAnY29udmVyZ2VkJyB9O1xuICBpZiAoIWxvY2FsQ2hhbmdlZCAmJiByZW1vdGVDaGFuZ2VkKSByZXR1cm4geyBhY3Rpb246ICdwdWxsJyB9O1xuICBpZiAobG9jYWxDaGFuZ2VkICYmICFyZW1vdGVDaGFuZ2VkKSByZXR1cm4geyBhY3Rpb246ICdwdXNoJyB9O1xuICByZXR1cm4geyBhY3Rpb246ICdjb25mbGljdCcsIHJlYXNvbjogJ0JPVEhfQ0hBTkdFRCcgfTtcbn1cblxuZXhwb3J0IHR5cGUgU3luY0V4ZWN1dGlvbiA9ICd3cml0ZScgfCAnc2tpcCcgfCAnYWR2YW5jZSc7XG5cbmNsYXNzIFN5bmNEZWNpc2lvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb2RlOiBzdHJpbmc7XG4gIHN0YXR1cyA9IDQwOTtcblxuICBjb25zdHJ1Y3Rvcihjb2RlOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMuY29kZSA9IGNvZGU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYW5TeW5jRXhlY3V0aW9uKFxuICBpbnRlbnQ6ICdwdWxsJyB8ICdwdXNoJyxcbiAgZGVjaXNpb246IFRocmVlV2F5U3luY0RlY2lzaW9uLFxuKTogU3luY0V4ZWN1dGlvbiB7XG4gIGlmIChkZWNpc2lvbi5hY3Rpb24gPT09ICdwYXVzZScpIHtcbiAgICB0aHJvdyBuZXcgU3luY0RlY2lzaW9uRXJyb3IoJ01JU1NJTkdfU1lOQ19CQVNFJywgJ1x1N0YzQVx1NUMxMVx1NTNFRlx1OTc2MFx1NTQwQ1x1NkI2NVx1NTdGQVx1N0VCRlx1RkYwQ1x1NURGMlx1NjY4Mlx1NTA1Q1x1ODk4Nlx1NzZENicpO1xuICB9XG4gIGlmIChkZWNpc2lvbi5hY3Rpb24gPT09ICdjb25mbGljdCcpIHtcbiAgICB0aHJvdyBuZXcgU3luY0RlY2lzaW9uRXJyb3IoJ1NZTkNfQ09ORkxJQ1QnLCAnXHU2NzJDXHU1NzMwXHU1NDhDXHU5OERFXHU0RTY2XHU5MEZEXHU1REYyXHU0RkVFXHU2NTM5XHVGRjBDXHU1REYyXHU2NjgyXHU1MDVDXHU4OTg2XHU3NkQ2Jyk7XG4gIH1cbiAgaWYgKGRlY2lzaW9uLmFjdGlvbiA9PT0gJ3VuY2hhbmdlZCcpIHJldHVybiAnc2tpcCc7XG4gIGlmIChkZWNpc2lvbi5hY3Rpb24gPT09ICdjb252ZXJnZWQnKSByZXR1cm4gJ2FkdmFuY2UnO1xuICBpZiAoZGVjaXNpb24uYWN0aW9uID09PSBpbnRlbnQpIHJldHVybiAnd3JpdGUnO1xuICBpZiAoaW50ZW50ID09PSAncHVsbCcpIHtcbiAgICB0aHJvdyBuZXcgU3luY0RlY2lzaW9uRXJyb3IoJ0xPQ0FMX0NIQU5HRVNfUEVORElORycsICdcdTY3MkNcdTU3MzBcdTY3MDlcdTY3MkFcdTU2REVcdTUxOTlcdTRGRUVcdTY1MzlcdUZGMENcdThCRjdcdTUxNDhcdTU2REVcdTUxOTlcdTYyMTZcdTRFQkFcdTVERTVcdTU5MDRcdTc0MDYnKTtcbiAgfVxuICB0aHJvdyBuZXcgU3luY0RlY2lzaW9uRXJyb3IoJ1JFTU9URV9DSEFOR0VTX1BFTkRJTkcnLCAnXHU5OERFXHU0RTY2XHU2NzA5XHU2NzJBXHU2MkM5XHU1M0Q2XHU0RkVFXHU2NTM5XHVGRjBDXHU4QkY3XHU1MTQ4XHU2MkM5XHU1M0Q2XHU2MjE2XHU0RUJBXHU1REU1XHU1OTA0XHU3NDA2Jyk7XG59XG4iLCAiaW1wb3J0IHsgY3JlYXRlSGFzaCwgcmFuZG9tVVVJRCB9IGZyb20gJ25vZGU6Y3J5cHRvJztcblxuY29uc3QgUkVDT1ZFUllfUk9PVCA9ICcuZmVpc2h1LXN5bmMvcmVjb3ZlcnknO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlY292ZXJ5QWRhcHRlciB7XG4gIGV4aXN0cyhwYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+O1xuICBta2RpcihwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+O1xuICB3cml0ZShwYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD47XG4gIGxpc3QocGF0aDogc3RyaW5nKTogUHJvbWlzZTx7IGZpbGVzOiBzdHJpbmdbXTsgZm9sZGVyczogc3RyaW5nW10gfT47XG4gIHJlbW92ZShwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlY292ZXJ5U25hcHNob3RJbnB1dCB7XG4gIG9yaWdpbmFsUGF0aDogc3RyaW5nO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHNvdXJjZTogJ2xvY2FsJyB8ICdyZW1vdGUnO1xuICBub3c/OiBEYXRlO1xuICBub25jZT86IHN0cmluZztcbiAgbWF4U25hcHNob3RzPzogbnVtYmVyO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlUmVjb3ZlcnlTbmFwc2hvdChcbiAgYWRhcHRlcjogUmVjb3ZlcnlBZGFwdGVyLFxuICBpbnB1dDogUmVjb3ZlcnlTbmFwc2hvdElucHV0LFxuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgYXdhaXQgZW5zdXJlRGlyZWN0b3J5KGFkYXB0ZXIsICcuZmVpc2h1LXN5bmMnKTtcbiAgYXdhaXQgZW5zdXJlRGlyZWN0b3J5KGFkYXB0ZXIsIFJFQ09WRVJZX1JPT1QpO1xuXG4gIGNvbnN0IG5vdyA9IGlucHV0Lm5vdyA/PyBuZXcgRGF0ZSgpO1xuICBjb25zdCBub25jZSA9IGlucHV0Lm5vbmNlID8/IHJhbmRvbVVVSUQoKTtcbiAgY29uc3QgaWRlbnRpdHkgPSBjcmVhdGVIYXNoKCdzaGEyNTYnKVxuICAgIC51cGRhdGUoYCR7aW5wdXQub3JpZ2luYWxQYXRofVxcMCR7bm9uY2V9YClcbiAgICAuZGlnZXN0KCdoZXgnKVxuICAgIC5zbGljZSgwLCAxNik7XG4gIGNvbnN0IHRpbWVzdGFtcCA9IG5vdy50b0lTT1N0cmluZygpLnJlcGxhY2UoL1stOi5dL2csICcnKTtcbiAgY29uc3Qgc25hcHNob3RQYXRoID0gYCR7UkVDT1ZFUllfUk9PVH0vJHt0aW1lc3RhbXB9LSR7aW5wdXQuc291cmNlfS0ke2lkZW50aXR5fS5qc29uYDtcbiAgY29uc3Qgc25hcHNob3QgPSB7XG4gICAgc2NoZW1hVmVyc2lvbjogMSxcbiAgICBjcmVhdGVkQXQ6IG5vdy50b0lTT1N0cmluZygpLFxuICAgIHNvdXJjZTogaW5wdXQuc291cmNlLFxuICAgIG9yaWdpbmFsUGF0aDogaW5wdXQub3JpZ2luYWxQYXRoLFxuICAgIGNvbnRlbnQ6IGlucHV0LmNvbnRlbnQsXG4gIH07XG5cbiAgYXdhaXQgYWRhcHRlci53cml0ZShzbmFwc2hvdFBhdGgsIEpTT04uc3RyaW5naWZ5KHNuYXBzaG90LCBudWxsLCAyKSk7XG4gIGF3YWl0IHJvdGF0ZVNuYXBzaG90cyhhZGFwdGVyLCBNYXRoLm1heCgxLCBpbnB1dC5tYXhTbmFwc2hvdHMgPz8gMjApKTtcbiAgcmV0dXJuIHNuYXBzaG90UGF0aDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZW5zdXJlRGlyZWN0b3J5KGFkYXB0ZXI6IFJlY292ZXJ5QWRhcHRlciwgcGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmIChhd2FpdCBhZGFwdGVyLmV4aXN0cyhwYXRoKSkgcmV0dXJuO1xuICB0cnkge1xuICAgIGF3YWl0IGFkYXB0ZXIubWtkaXIocGF0aCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKCEoYXdhaXQgYWRhcHRlci5leGlzdHMocGF0aCkpKSB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiByb3RhdGVTbmFwc2hvdHMoYWRhcHRlcjogUmVjb3ZlcnlBZGFwdGVyLCBtYXhTbmFwc2hvdHM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICB0cnkge1xuICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBhZGFwdGVyLmxpc3QoUkVDT1ZFUllfUk9PVCk7XG4gICAgY29uc3QgZmlsZXMgPSBlbnRyaWVzLmZpbGVzXG4gICAgICAuZmlsdGVyKChwYXRoKSA9PiBwYXRoLmVuZHNXaXRoKCcuanNvbicpKVxuICAgICAgLnNvcnQoKTtcbiAgICBjb25zdCBleGNlc3MgPSBmaWxlcy5zbGljZSgwLCBNYXRoLm1heCgwLCBmaWxlcy5sZW5ndGggLSBtYXhTbmFwc2hvdHMpKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChleGNlc3MubWFwKChwYXRoKSA9PiBhZGFwdGVyLnJlbW92ZShwYXRoKSkpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUud2FybignW3N5bmMvcmVjb3ZlcnldIHNuYXBzaG90IHJvdGF0aW9uIGZhaWxlZDonLCBlcnJvcik7XG4gIH1cbn1cbiIsICIvKipcbiAqIFBPU1QgL2NsaXAgXHUyMDE0IFx1NEVGQlx1NjEwRlx1N0Y1MVx1OTg3NS9cdTUyMTJcdThCQ0RcdTUyNkFcdTVCNThcdTUyMzAgT2JzaWRpYW5cdTMwMDJcbiAqXG4gKiBNVlAgXHU1MUIzXHU3QjU2XHVGRjFBXG4gKiAtIFx1NEUwRFx1N0VEMVx1NUI5QSBmZWlzaHVfaWRcdUZGMENcdTkwN0ZcdTUxNERcdTYyOEFcdTY2NkVcdTkwMUFcdTdGNTFcdTk4NzVcdTRGMkFcdTg4QzVcdTYyMTBcdTk4REVcdTRFNjZcdTU0MENcdTZCNjVcdTY1ODdcdTRFRjZcdTMwMDJcbiAqIC0gXHU1MTk5XHU1MTY1XHU2M0QyXHU0RUY2XHU5RUQ4XHU4QkE0XHU3NkVFXHU1RjU1XHU2MjE2XHU4QkY3XHU2QzQyXHU0RjIwXHU1MTY1XHU3NkVFXHU1RjU1XHUzMDAyXG4gKiAtIFx1NEY3Rlx1NzUyOFx1NzdFNVx1OEJDNlx1NUU5M1x1NUI1N1x1NkJCNVx1OTg4NFx1OEJCRVx1NTg2Qlx1NTE0NVx1NTdGQVx1Nzg0MCBZQU1MXHVGRjBDXHU3RjE2XHU3ODAxXHU0RUNEXHU0RUE0XHU3RUQ5IGF1dG8tcmVuYW1lXHUzMDAyXG4gKi9cbmltcG9ydCB7IGFzc2VtYmxlRmlsZSwgdHlwZSBDbGlwUmVxdWVzdCwgdHlwZSBDbGlwUmVzcG9uc2UgfSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHsgQXBwLCBURmlsZSwgVEZvbGRlciB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuaW1wb3J0IHR5cGUgeyBGZWlzaHVTeW5jU2V0dGluZ3MgfSBmcm9tICcuLi9zZXR0aW5ncy5qcyc7XG5pbXBvcnQgeyBtYWtlRmlsZW5hbWUsIG1ha2VQYXRoIH0gZnJvbSAnLi4vZmlsZWlvL3dyaXRlci5qcyc7XG5pbXBvcnQgeyBhc3NpZ25FbmNvZGluZyB9IGZyb20gJy4uL2F1dG9SZW5hbWUuanMnO1xuaW1wb3J0IHsgbm9ybWFsaXplVmF1bHREaXIsIG5vcm1hbGl6ZVZhdWx0TWFya2Rvd25QYXRoIH0gZnJvbSAnLi4vdmF1bHRQYXRoLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBDbGlwRGVwcyB7XG4gIGFwcDogQXBwO1xuICBzZXR0aW5nczogRmVpc2h1U3luY1NldHRpbmdzO1xuICBub3RpY2U6IChtc2c6IHN0cmluZykgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNsaXBIYW5kbGVyKGRlcHM6IENsaXBEZXBzKSB7XG4gIHJldHVybiBhc3luYyAoY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8Q2xpcFJlc3BvbnNlPiA9PiB7XG4gICAgY29uc3QgcmVxID0gKGN0eC5ib2R5ID8/IHt9KSBhcyBDbGlwUmVxdWVzdDtcbiAgICBjb25zdCB0aXRsZSA9IGNsZWFuVGV4dChyZXEudGl0bGUpIHx8ICdcdTdGNTFcdTk4NzVcdTUyNkFcdTg1Q0YnO1xuICAgIGNvbnN0IHVybCA9IGNsZWFuVGV4dChyZXEudXJsKTtcbiAgICBjb25zdCB0ZXh0ID0gY2xlYW5UZXh0KHJlcS50ZXh0KTtcbiAgICBjb25zdCByYXdUZXh0ID0gY2xlYW5UZXh0KHJlcS5yYXdUZXh0KSB8fCB0ZXh0O1xuICAgIGNvbnN0IGJvZHlNYXJrZG93biA9IGNsZWFuVGV4dChyZXEuYm9keU1hcmtkb3duKTtcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGNsZWFuVGV4dChyZXEuZGVzY3JpcHRpb24pO1xuICAgIGNvbnN0IHNvdXJjZUtpbmQgPSBjbGVhblRleHQocmVxLnNvdXJjZUtpbmQpIHx8ICdnZW5lcmljLXBhZ2UnO1xuICAgIGNvbnN0IGFwcGVuZFBhdGggPSByZXEuYXBwZW5kUGF0aCA/IG5vcm1hbGl6ZVZhdWx0TWFya2Rvd25QYXRoKHJlcS5hcHBlbmRQYXRoKSA6ICcnO1xuICAgIGlmICghdXJsICYmICF0ZXh0ICYmICFib2R5TWFya2Rvd24gJiYgIXJhd1RleHQpIHtcbiAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoJ3VybCBvciB0ZXh0IGlzIHJlcXVpcmVkJykgYXMgRXJyb3IgJiB7IGNvZGU6IHN0cmluZzsgc3RhdHVzOiBudW1iZXIgfTtcbiAgICAgIGUuY29kZSA9ICdNSVNTSU5HX0NMSVBfQ09OVEVOVCc7XG4gICAgICBlLnN0YXR1cyA9IDQwMDtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRlZEF0ID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCB0YXJnZXREaXIgPSBub3JtYWxpemVWYXVsdERpcihjbGVhblRleHQocmVxLmRpcikgfHwgZGVwcy5zZXR0aW5ncy5kZWZhdWx0RGlyKTtcbiAgICBjb25zdCBtZXRhID0gbm9ybWFsaXplQ2xpcE1ldGEocmVxLm1ldGEsIHtcbiAgICAgIHRpdGxlLFxuICAgICAgdXJsLFxuICAgICAgdGV4dDogcmF3VGV4dCB8fCBib2R5TWFya2Rvd24gfHwgdGV4dCxcbiAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgZGlyOiB0YXJnZXREaXIsXG4gICAgICBkYXRlOiBmb3JtYXREYXRlKGNyZWF0ZWRBdCksXG4gICAgfSk7XG5cbiAgICBjb25zdCBjb250ZW50SW5wdXQgPSB7XG4gICAgICB0aXRsZSxcbiAgICAgIHVybCxcbiAgICAgIHRleHQsXG4gICAgICByYXdUZXh0LFxuICAgICAgYm9keU1hcmtkb3duLFxuICAgICAgZGVzY3JpcHRpb24sXG4gICAgICBkaXI6IHRhcmdldERpcixcbiAgICAgIG1ldGEsXG4gICAgICBzb3VyY2VLaW5kLFxuICAgICAgZGF0ZTogZm9ybWF0RGF0ZShjcmVhdGVkQXQpLFxuICAgICAgY3JlYXRlZEF0OiBjcmVhdGVkQXQudG9JU09TdHJpbmcoKSxcbiAgICB9O1xuXG4gICAgaWYgKGFwcGVuZFBhdGgpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGRlcHMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChhcHBlbmRQYXRoKTtcbiAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIFRGaWxlKSkge1xuICAgICAgICBjb25zdCBlID0gbmV3IEVycm9yKGBcdTg4NjVcdTUxNDVcdTc2RUVcdTY4MDdcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUEke2FwcGVuZFBhdGh9YCkgYXMgRXJyb3IgJiB7IGNvZGU6IHN0cmluZzsgc3RhdHVzOiBudW1iZXIgfTtcbiAgICAgICAgZS5jb2RlID0gJ0FQUEVORF9UQVJHRVRfTk9UX0ZPVU5EJztcbiAgICAgICAgZS5zdGF0dXMgPSA0MDQ7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgICBjb25zdCBjdXJyZW50ID0gYXdhaXQgZGVwcy5hcHAudmF1bHQucmVhZCh0YXJnZXQpO1xuICAgICAgY29uc3QgYXBwZW5kaXggPSBidWlsZEFwcGVuZE1hcmtkb3duKGNvbnRlbnRJbnB1dCk7XG4gICAgICBhd2FpdCBkZXBzLmFwcC52YXVsdC5tb2RpZnkodGFyZ2V0LCBgJHtjdXJyZW50LnJlcGxhY2UoL1xccyokLywgJycpfVxcblxcbiR7YXBwZW5kaXh9XFxuYCk7XG4gICAgICBkZXBzLm5vdGljZShgXHVEODNEXHVEQ0REIFx1NURGMlx1ODg2NVx1NTE0NVx1NTIzMCAke2FwcGVuZFBhdGh9YCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgcGF0aDogdGFyZ2V0LnBhdGgsXG4gICAgICAgIGZpbGVuYW1lOiB0YXJnZXQubmFtZSxcbiAgICAgICAgYWN0aW9uOiAndXBkYXRlZCcsXG4gICAgICB9O1xuICAgIH1cblxuICAgIGF3YWl0IGVuc3VyZUZvbGRlcihkZXBzLmFwcCwgdGFyZ2V0RGlyKTtcblxuICAgIGNvbnN0IGZpbGVuYW1lID0gbWFrZUZpbGVuYW1lKHRpdGxlKTtcbiAgICBsZXQgZmluYWxQYXRoID0gbWFrZVBhdGgodGFyZ2V0RGlyLCBmaWxlbmFtZSk7XG4gICAgY29uc3QgZXhpc3RpbmcgPSBkZXBzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZmluYWxQYXRoKTtcbiAgICBpZiAoZXhpc3RpbmcgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgZmluYWxQYXRoID0gbWFrZVBhdGgodGFyZ2V0RGlyLCBgJHtmaWxlbmFtZS5yZXBsYWNlKC9cXC5tZCQvLCAnJyl9LSR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9Lm1kYCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudCA9IGJ1aWxkQ2xpcE1hcmtkb3duKGNvbnRlbnRJbnB1dCk7XG5cbiAgICBhd2FpdCBkZXBzLmFwcC52YXVsdC5jcmVhdGUoZmluYWxQYXRoLCBjb250ZW50KTtcbiAgICBkZXBzLm5vdGljZShgXHVEODNEXHVEQ0NFIFx1NURGMlx1NTI2QVx1NUI1OCAke3RpdGxlfWApO1xuXG4gICAgaWYgKGRlcHMuc2V0dGluZ3MuYXV0b1JlbmFtZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgYXNzaWduRW5jb2RpbmcoZGVwcy5hcHAsIGZpbmFsUGF0aCwgdGFyZ2V0RGlyKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2NsaXBdIGF1dG8tcmVuYW1lIGZhaWxlZDonLCBlcnIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBvazogdHJ1ZSxcbiAgICAgIHBhdGg6IGZpbmFsUGF0aCxcbiAgICAgIGZpbGVuYW1lOiBmaW5hbFBhdGguc3BsaXQoJy8nKS5wb3AoKSA/PyBmaWxlbmFtZSxcbiAgICAgIGFjdGlvbjogJ2NyZWF0ZWQnLFxuICAgIH07XG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQ2xpcE1hcmtkb3duKGlucHV0OiB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIHJhd1RleHQ6IHN0cmluZztcbiAgYm9keU1hcmtkb3duOiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIGRpcjogc3RyaW5nO1xuICBtZXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgc291cmNlS2luZDogc3RyaW5nO1xuICBkYXRlOiBzdHJpbmc7XG4gIGNyZWF0ZWRBdDogc3RyaW5nO1xufSk6IHN0cmluZyB7XG4gIGNvbnN0IGJvZHlDb250ZW50ID0gbm9ybWFsaXplTWFya2Rvd25Cb2R5KGlucHV0LmJvZHlNYXJrZG93biB8fCBpbnB1dC5yYXdUZXh0IHx8IGlucHV0LnRleHQgfHwgaW5wdXQuZGVzY3JpcHRpb24pO1xuICBjb25zdCBib2R5ID0gW1xuICAgIGAjICR7aW5wdXQudGl0bGV9YCxcbiAgICAnJyxcbiAgICBpbnB1dC51cmwgPyBgPiBcdTY3NjVcdTZFOTBcdUZGMUEke2lucHV0LnVybH1gIDogJycsXG4gICAgYD4gXHU3QzdCXHU1NzhCXHVGRjFBJHtpbnB1dC5zb3VyY2VLaW5kfWAsXG4gICAgYD4gXHU1MjZBXHU1QjU4XHU2NUY2XHU5NUY0XHVGRjFBJHtpbnB1dC5jcmVhdGVkQXR9YCxcbiAgICAnJyxcbiAgICBib2R5Q29udGVudCxcbiAgICAnJyxcbiAgXS5maWx0ZXIoKGxpbmUsIGluZGV4LCBhcnIpID0+IGxpbmUgfHwgYXJyW2luZGV4IC0gMV0gIT09ICcnKS5qb2luKCdcXG4nKTtcblxuICByZXR1cm4gYXNzZW1ibGVGaWxlKGlucHV0Lm1ldGEsIGJvZHkpO1xufVxuXG5mdW5jdGlvbiBidWlsZEFwcGVuZE1hcmtkb3duKGlucHV0OiB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIHJhd1RleHQ6IHN0cmluZztcbiAgYm9keU1hcmtkb3duOiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIHNvdXJjZUtpbmQ6IHN0cmluZztcbiAgY3JlYXRlZEF0OiBzdHJpbmc7XG59KTogc3RyaW5nIHtcbiAgY29uc3QgYm9keUNvbnRlbnQgPSBub3JtYWxpemVNYXJrZG93bkJvZHkoaW5wdXQuYm9keU1hcmtkb3duIHx8IGlucHV0LnJhd1RleHQgfHwgaW5wdXQudGV4dCB8fCBpbnB1dC5kZXNjcmlwdGlvbik7XG4gIHJldHVybiBbXG4gICAgYCMjICR7aW5wdXQudGl0bGV9YCxcbiAgICAnJyxcbiAgICBpbnB1dC51cmwgPyBgPiBcdTY3NjVcdTZFOTBcdUZGMUEke2lucHV0LnVybH1gIDogJycsXG4gICAgYD4gXHU3QzdCXHU1NzhCXHVGRjFBJHtpbnB1dC5zb3VyY2VLaW5kfWAsXG4gICAgYD4gXHU4ODY1XHU1MTQ1XHU2NUY2XHU5NUY0XHVGRjFBJHtpbnB1dC5jcmVhdGVkQXR9YCxcbiAgICAnJyxcbiAgICBib2R5Q29udGVudCxcbiAgXS5maWx0ZXIoKGxpbmUsIGluZGV4LCBhcnIpID0+IGxpbmUgfHwgYXJyW2luZGV4IC0gMV0gIT09ICcnKS5qb2luKCdcXG4nKTtcbn1cblxuZnVuY3Rpb24gY2xlYW5UZXh0KHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZS50cmltKCkgOiAnJztcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF0ZShkYXRlOiBEYXRlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGRhdGUudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCk7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUNsaXBNZXRhKG1ldGE6IHVua25vd24sIGZhbGxiYWNrOiB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIGRpcjogc3RyaW5nO1xuICBkYXRlOiBzdHJpbmc7XG59KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICBjb25zdCBpbnB1dCA9IG1ldGEgJiYgdHlwZW9mIG1ldGEgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KG1ldGEpID8gbWV0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA6IHt9O1xuICBjb25zdCBzY29yZSA9IG5vcm1hbGl6ZVNjb3JlKGlucHV0Llx1OEJDNFx1NTIwNik7XG4gIGNvbnN0IG91dDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7XG4gICAgXHU2ODA3XHU3QjdFOiBub3JtYWxpemVUYWcoaW5wdXQuXHU2ODA3XHU3QjdFKSxcbiAgICBcdTdGMTZcdTc4MDE6ICcnLFxuICAgIFx1OEY5M1x1NTE2NTogY2xlYW5UZXh0KGlucHV0Llx1OEY5M1x1NTE2NSkgfHwgZmFsbGJhY2suZGlyIHx8IGZhbGxiYWNrLnVybCxcbiAgICBcdTY1RTVcdTY3MUY6IG5vcm1hbGl6ZURhdGUoaW5wdXQuXHU2NUU1XHU2NzFGLCBmYWxsYmFjay5kYXRlKSxcbiAgICBcdTY1RTVcdTY3MUZcdTdEMjJcdTVGMTU6IG5vcm1hbGl6ZUxpc3QoaW5wdXQuXHU2NUU1XHU2NzFGXHU3RDIyXHU1RjE1KSxcbiAgICBcdTUxNzNcdTk1MkVcdThCQ0Q6IGNsZWFuVGV4dChpbnB1dC5cdTUxNzNcdTk1MkVcdThCQ0QpIHx8IGRyYWZ0S2V5d29yZHMoYCR7ZmFsbGJhY2sudGl0bGV9ICR7ZmFsbGJhY2suZGVzY3JpcHRpb259ICR7ZmFsbGJhY2sudGV4dH1gKSxcbiAgICBcdTY5ODJcdThGRjA6IGNsZWFuVGV4dChpbnB1dC5cdTY5ODJcdThGRjApIHx8IGZhbGxiYWNrLmRlc2NyaXB0aW9uIHx8IGBcdTRFQ0VcdTdGNTFcdTk4NzVcdTUyNkFcdTVCNThcdTVFNzZcdThGNkNcdTYzNjJcdUZGMUEke2ZhbGxiYWNrLnRpdGxlfWAsXG4gICAgXHU4QkM0XHU1MjA2OiBzY29yZSxcbiAgICBcdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBOiBjbGVhblRleHQoaW5wdXQuXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQSkgfHwgc2NvcmVMYWJlbChzY29yZSksXG4gICAgXHU3RDIyXHU1RjE1X1x1NzdFNVx1OEJDNlx1NUU5MzogY2xlYW5UZXh0KGlucHV0Llx1N0QyMlx1NUYxNV9cdTc3RTVcdThCQzZcdTVFOTMpLFxuICAgIFx1N0QyMlx1NUYxNV9cdTk4OUNcdTgyNzI6IGNsZWFuVGV4dChpbnB1dC5cdTdEMjJcdTVGMTVfXHU5ODlDXHU4MjcyKSxcbiAgICAnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnOiBub3JtYWxpemVMaXN0KGlucHV0WydcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OCddKSxcbiAgICBcdTdEMjJcdTVGMTVfXHU1NzU3OiBub3JtYWxpemVMaXN0KGlucHV0Llx1N0QyMlx1NUYxNV9cdTU3NTcpLFxuICAgIFx1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2Njk6IG5vcm1hbGl6ZUxpc3QoaW5wdXQuXHU3RDIyXHU1RjE1X1x1OThDRVx1OTY2OSksXG4gIH07XG4gIGlmICghb3V0Llx1NTE3M1x1OTUyRVx1OEJDRCkgb3V0Llx1NTE3M1x1OTUyRVx1OEJDRCA9ICdcdTdGNTFcdTk4NzVcdTUyNkFcdTVCNTgnO1xuICBpZiAoIW91dC5cdTY5ODJcdThGRjApIG91dC5cdTY5ODJcdThGRjAgPSBgXHU3RjUxXHU5ODc1XHU1MjZBXHU1QjU4XHVGRjFBJHtmYWxsYmFjay50aXRsZX1gO1xuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVUYWcodmFsdWU6IHVua25vd24pOiBzdHJpbmcge1xuICBjb25zdCByYXcgPSBjbGVhblRleHQodmFsdWUpO1xuICByZXR1cm4gcmF3Lm1hdGNoKC9eW1NYTFpRSl0kLykgPyByYXcgOiByYXcubWF0Y2goLyhbU1hMWlFKXSkoPzpffCQpLyk/LlsxXSB8fCAnUyc7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZURhdGUodmFsdWU6IHVua25vd24sIGZhbGxiYWNrOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCByYXcgPSBjbGVhblRleHQodmFsdWUpLnJlcGxhY2UoL1xcLy9nLCAnLScpO1xuICByZXR1cm4gL15cXGR7NH0tXFxkezJ9LVxcZHsyfSQvLnRlc3QocmF3KSA/IHJhdyA6IGZhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVTY29yZSh2YWx1ZTogdW5rbm93bik6IG51bWJlciB7XG4gIGNvbnN0IHJhdyA9IGNsZWFuVGV4dCh2YWx1ZSk7XG4gIGNvbnN0IGV4cGxpY2l0ID0gcmF3Lm1hdGNoKC9bMS01XS8pPy5bMF07XG4gIGlmIChleHBsaWNpdCkgcmV0dXJuIE51bWJlcihleHBsaWNpdCk7XG4gIGNvbnN0IHN0YXJzID0gQXJyYXkuZnJvbShyYXcubWF0Y2hBbGwoL1x1RDgzQ1x1REYxRi9nKSkubGVuZ3RoO1xuICByZXR1cm4gc3RhcnMgPiAwID8gTWF0aC5taW4oc3RhcnMsIDUpIDogMTtcbn1cblxuZnVuY3Rpb24gc2NvcmVMYWJlbChzY29yZTogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIFsnXHVEODNDXHVERjFGXHUwMEI3XHU3RDIwXHU2NzUwJywgJ1x1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1MDBCN1x1NjU3NFx1NzQwNicsICdcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdTAwQjdcdTVCOUVcdThERjUnLCAnXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHUwMEI3XHU5MDFBXHU3NTI4JywgJ1x1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1MDBCN1x1NEY1M1x1N0NGQiddW01hdGgubWF4KDEsIE1hdGgubWluKHNjb3JlLCA1KSkgLSAxXTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplTGlzdCh2YWx1ZTogdW5rbm93bik6IHN0cmluZ1tdIHtcbiAgY29uc3Qgc291cmNlID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IGNsZWFuVGV4dCh2YWx1ZSkuc3BsaXQoL1tcXG4sXHVGRjBDXHUzMDAxXS8pO1xuICByZXR1cm4gc291cmNlLm1hcCgoaXRlbSkgPT4gY2xlYW5UZXh0KGl0ZW0pKS5maWx0ZXIoQm9vbGVhbik7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZU1hcmtkb3duQm9keSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgdGV4dCA9IHZhbHVlLnRyaW0oKTtcbiAgaWYgKCF0ZXh0KSByZXR1cm4gJ1x1RkYwOFx1NjVFMFx1NTNFRlx1ODlDMVx1NkI2M1x1NjU4N1x1RkYwQ1x1NURGMlx1NEZERFx1NUI1OFx1OTg3NVx1OTc2Mlx1NjgwN1x1OTg5OFx1NTQ4Q1x1Njc2NVx1NkU5MFx1MzAwMlx1RkYwOSc7XG4gIHJldHVybiB0ZXh0O1xufVxuXG5mdW5jdGlvbiBkcmFmdEtleXdvcmRzKHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHdvcmRzID0gQXJyYXkuZnJvbShuZXcgU2V0KFxuICAgIHRleHRcbiAgICAgIC5yZXBsYWNlKC9bXlxccHtTY3JpcHQ9SGFufVxccHtMZXR0ZXJ9XFxwe051bWJlcn1cXHNfLV0vZ3UsICcgJylcbiAgICAgIC5zcGxpdCgvXFxzKy8pXG4gICAgICAubWFwKCh3b3JkKSA9PiB3b3JkLnRyaW0oKSlcbiAgICAgIC5maWx0ZXIoKHdvcmQpID0+IHdvcmQubGVuZ3RoID49IDIgJiYgd29yZC5sZW5ndGggPD0gMjApLFxuICApKTtcbiAgcmV0dXJuIHdvcmRzLnNsaWNlKDAsIDYpLmpvaW4oJ1x1MzAwMScpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBlbnN1cmVGb2xkZXIoYXBwOiBBcHAsIGRpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmICghZGlyIHx8IGRpciA9PT0gJy4nIHx8IGRpciA9PT0gJy8nKSByZXR1cm47XG4gIGNvbnN0IGV4aXN0aW5nID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChkaXIpO1xuICBpZiAoZXhpc3RpbmcgaW5zdGFuY2VvZiBURm9sZGVyKSByZXR1cm47XG4gIGNvbnN0IHBhcmVudCA9IGRpci5zcGxpdCgnLycpLnNsaWNlKDAsIC0xKS5qb2luKCcvJyk7XG4gIGlmIChwYXJlbnQpIGF3YWl0IGVuc3VyZUZvbGRlcihhcHAsIHBhcmVudCk7XG4gIHRyeSB7XG4gICAgYXdhaXQgYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihkaXIpO1xuICB9IGNhdGNoIHtcbiAgICAvLyBcdTVERjJcdTVCNThcdTU3MjhcdTYyMTZcdTc1MzFcdTUxNzZcdTRFRDZcdTZENDFcdTdBMEJcdTUyMUFcdTUyMUJcdTVFRkFcdTY1RjZcdTVGRkRcdTc1NjVcdTMwMDJcbiAgfVxufVxuIiwgIi8qKlxuICogUE9TVCAvZXhpc3RzIFx1MjAxNCBcdTY4QzBcdTY3RTUgbm9kZV90b2tlbiBcdTY2MkZcdTU0MjZcdTVERjJcdTU0MENcdTZCNjVcdThGQzdcdTMwMDJcbiAqL1xuaW1wb3J0IHR5cGUgeyBFeGlzdHNSZXF1ZXN0LCBFeGlzdHNSZXNwb25zZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQgdHlwZSB7IEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuaW1wb3J0IHsgZmluZFVuaXF1ZVZhdWx0QmluZGluZyB9IGZyb20gJy4uL3ZhdWx0QmluZGluZy5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFeGlzdHNIYW5kbGVyKGFwcDogQXBwKSB7XG4gIHJldHVybiBhc3luYyAoY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8RXhpc3RzUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCByZXEgPSBjdHguYm9keSBhcyBFeGlzdHNSZXF1ZXN0O1xuICAgIGlmICghcmVxPy5ub2RlX3Rva2VuKSB7XG4gICAgICBjb25zdCBlID0gbmV3IEVycm9yKCdub2RlX3Rva2VuIGlzIHJlcXVpcmVkJykgYXMgRXJyb3IgJiB7IGNvZGU6IHN0cmluZzsgc3RhdHVzOiBudW1iZXIgfTtcbiAgICAgIGUuY29kZSA9ICdNSVNTSU5HX1RPS0VOJztcbiAgICAgIGUuc3RhdHVzID0gNDAwO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlID0gYXdhaXQgZmluZFVuaXF1ZVZhdWx0QmluZGluZyhhcHAsIHJlcS5ub2RlX3Rva2VuKTtcbiAgICByZXR1cm4ge1xuICAgICAgb2s6IHRydWUsXG4gICAgICBleGlzdHM6ICEhZmlsZSxcbiAgICAgIHBhdGg6IGZpbGU/LnBhdGgsXG4gICAgfTtcbiAgfTtcbn1cbiIsICIvKipcbiAqIFBPU1QgL3B1c2hiYWNrIFx1MjAxNCBPQlx1MjE5Mlx1OThERVx1NEU2Nlx1NTZERVx1NTE5OVx1MzAwMlxuICpcbiAqIFx1NEY5RFx1NjM2RSBgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTc2LjJcdUZGMUFcbiAqIDEuIFx1OEJGQiAubWQgXHU3Njg0IFlBTUxcdUZGMENcdTYyRkYgZmVpc2h1X2RvY19pZCArIHN5bmNfaGFzaFxuICogMi4gXHU4QkExXHU3Qjk3XHU1RjUzXHU1MjREXHU1MTg1XHU1QkI5IGhhc2hcdUZGMENcdTZCRDRcdTVCRjkgc3luY19oYXNoXG4gKiAgICBcdTI1MUMgXHU0RTAwXHU4MUY0IFx1MjE5MiBcdThERjNcdThGQzdcdUZGMDhcdTY1RTBcdTUzRDhcdTUzMTZcdUZGMDlcbiAqICAgIFx1MjUxNCBcdTRFMERcdTRFMDBcdTgxRjQgXHUyMTkyIFx1N0VFN1x1N0VFRFxuICogMy4gXHU4OUUzXHU2NzkwXHU2QjYzXHU2NTg3IG1kICsgWUFNTFxuICogNC4gWUFNTCBcdTVCNTdcdTZCQjUgXHUyMTkyIGNhbGxvdXQgWE1MIFx1NzI0N1x1NkJCNVx1RkYwOFx1NjU4N1x1Njg2M1x1NTkzNFx1RkYwOVxuICogNS4gXHU1NkZFXHU3MjQ3IGZlaXNodTovL3Rva2VuIFx1MjE5MiBcdTk4REVcdTRFNjYgPGltZyBzcmM9XCJUT0tFTlwiLz5cbiAqIDYuIFx1N0VDNFx1ODhDNVx1NjcwMFx1N0VDOFx1NTE4NVx1NUJCOSA9IFtjYWxsb3V0IFhNTF0gKyBbXHU2QjYzXHU2NTg3IG1kXVxuICogNy4gXHU4QzAzIGxhcmstY2xpIGRvY3MgK3VwZGF0ZSBvdmVyd3JpdGVcdUZGMDhYTUwgXHU2ODNDXHU1RjBGXHVGRjA5XG4gKiA4LiBcdTY4MDdcdTk4OThcdTU0MENcdTZCNjVcdUZGMDhcdTVERjJcdTU3Mjggb3ZlcndyaXRlIFx1NjVGNlx1NEZFRVx1NTkwRFx1RkYwOVxuICogOS4gXHU2NkY0XHU2NUIwIHN5bmNfaGFzaCArIHN5bmNfdGltZVxuICovXG5pbXBvcnQgdHlwZSB7IFB1c2hiYWNrUmVxdWVzdCwgUHVzaGJhY2tSZXNwb25zZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQge1xuICBtZXRhVG9DYWxsb3V0WG1sLFxuICBmZWlzaHVQcm90b1RvWG1sLFxuICBjb252ZXJ0T0JDYWxsb3V0c1RvRmVpc2h1LFxuICB0eXBlIFlBTUxGcm9udG1hdHRlcixcbn0gZnJvbSAnQHN5bmMvc2hhcmVkJztcbmltcG9ydCB7IFRGaWxlLCB0eXBlIEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEh0dHBFcnJvciwgdHlwZSBSZXF1ZXN0Q29udGV4dCB9IGZyb20gJy4uL3NlcnZlci5qcyc7XG5pbXBvcnQgdHlwZSB7IEZlaXNodVN5bmNTZXR0aW5ncyB9IGZyb20gJy4uL3NldHRpbmdzLmpzJztcbmltcG9ydCB7IG92ZXJ3cml0ZURvY1htbCwgZ2V0V2lraU5vZGVJbmZvIH0gZnJvbSAnLi4vbGFyay9jbGkuanMnO1xuaW1wb3J0IHsgcGFyc2VGaWxlLCBhc3NlbWJsZU1kIH0gZnJvbSAnLi4vZmlsZWlvL3dyaXRlci5qcyc7XG5pbXBvcnQgeyBmaW5kVW5pcXVlVmF1bHRCaW5kaW5nIH0gZnJvbSAnLi4vdmF1bHRCaW5kaW5nLmpzJztcbmltcG9ydCB7IG5vcm1hbGl6ZVZhdWx0TWFya2Rvd25QYXRoIH0gZnJvbSAnLi4vdmF1bHRQYXRoLmpzJztcbmltcG9ydCB7IGZldGNoUmVtb3RlRG9jdW1lbnQgfSBmcm9tICcuLi9yZW1vdGVEb2N1bWVudC5qcyc7XG5pbXBvcnQgeyBkZWNpZGVUaHJlZVdheVN5bmMsIHBsYW5TeW5jRXhlY3V0aW9uIH0gZnJvbSAnLi4vc3luY0RlY2lzaW9uLmpzJztcbmltcG9ydCB7IGNyZWF0ZVJlY292ZXJ5U25hcHNob3QgfSBmcm9tICcuLi9yZWNvdmVyeS5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHVzaGJhY2tEZXBzIHtcbiAgYXBwOiBBcHA7XG4gIHNldHRpbmdzOiBGZWlzaHVTeW5jU2V0dGluZ3M7XG4gIG5vdGljZTogKG1zZzogc3RyaW5nKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHVzaGJhY2tIYW5kbGVyKGRlcHM6IFB1c2hiYWNrRGVwcykge1xuICByZXR1cm4gYXN5bmMgKGN0eDogUmVxdWVzdENvbnRleHQpOiBQcm9taXNlPFB1c2hiYWNrUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCByZXEgPSBjdHguYm9keSBhcyBQdXNoYmFja1JlcXVlc3Q7XG5cbiAgICAvLyBcdTVCOUFcdTRGNERcdTY1ODdcdTRFRjZcbiAgICBsZXQgZmlsZTogVEZpbGUgfCBudWxsID0gbnVsbDtcbiAgICBpZiAocmVxLnBhdGgpIHtcbiAgICAgIGNvbnN0IGYgPSBkZXBzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgobm9ybWFsaXplVmF1bHRNYXJrZG93blBhdGgocmVxLnBhdGgpKTtcbiAgICAgIGlmIChmIGluc3RhbmNlb2YgVEZpbGUpIGZpbGUgPSBmO1xuICAgIH0gZWxzZSBpZiAocmVxLm5vZGVfdG9rZW4pIHtcbiAgICAgIGZpbGUgPSBhd2FpdCBmaW5kVW5pcXVlVmF1bHRCaW5kaW5nKGRlcHMuYXBwLCByZXEubm9kZV90b2tlbik7XG4gICAgfVxuXG4gICAgaWYgKCFmaWxlKSB7XG4gICAgICBjb25zdCBlID0gbmV3IEVycm9yKCdGaWxlIG5vdCBmb3VuZCcpIGFzIEVycm9yICYgeyBjb2RlOiBzdHJpbmc7IHN0YXR1czogbnVtYmVyIH07XG4gICAgICBlLmNvZGUgPSAnTk9UX0ZPVU5EJztcbiAgICAgIGUuc3RhdHVzID0gNDA0O1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgZGVwcy5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUZpbGUoY29udGVudCk7XG5cbiAgICBjb25zdCBmZWlzaHVEb2NJZCA9IHBhcnNlZC5mcm9udG1hdHRlci5mZWlzaHVfZG9jX2lkIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBmZWlzaHVJZCA9IHBhcnNlZC5mcm9udG1hdHRlci5mZWlzaHVfaWQgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGZlaXNodVRpdGxlID0gcGFyc2VkLmZyb250bWF0dGVyLmZlaXNodV90aXRsZSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAvLyBcdTg5RTNcdTY3OTBcdTU2REVcdTUxOTlcdTc1MjhcdTc2ODQgZG9jVG9rZW5cdUZGMDhcdTVGQzVcdTk4N0JcdTY2MkYgZG9jeCBvYmpfdG9rZW5cdUZGMENub2RlX3Rva2VuIFx1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NzUyOFx1NEU4RSBkb2NzICt1cGRhdGVcdUZGMDlcbiAgICBsZXQgZG9jVG9rZW4gPSBmZWlzaHVEb2NJZDtcbiAgICBpZiAoIWRvY1Rva2VuICYmIGZlaXNodUlkKSB7XG4gICAgICAvLyBmZWlzaHVfZG9jX2lkIFx1N0YzQVx1NTkzMVx1RkYxQVx1NzUyOCB3aWtpICtub2RlLWdldCBcdTYyOEEgbm9kZV90b2tlbiBcdTg5RTNcdTY3OTBcdTYyMTAgb2JqX3Rva2VuXG4gICAgICBkZXBzLm5vdGljZSgnXHVEODNEXHVERDE3IFx1ODlFM1x1Njc5MFx1NjU4N1x1Njg2MyB0b2tlbi4uLicpO1xuICAgICAgY29uc3QgaW5mbyA9IGdldFdpa2lOb2RlSW5mbyhmZWlzaHVJZCwgZGVwcy5zZXR0aW5ncy5zcGFjZUlkKTtcbiAgICAgIGRvY1Rva2VuID0gaW5mbz8ub2JqX3Rva2VuO1xuICAgICAgaWYgKCFkb2NUb2tlbikge1xuICAgICAgICBjb25zdCBlID0gbmV3IEVycm9yKGBcdTY1RTBcdTZDRDVcdTg5RTNcdTY3OTAgb2JqX3Rva2VuXHVGRjA4bm9kZV90b2tlbj0ke2ZlaXNodUlkLnNsaWNlKDAsIDgpfS4uLlx1RkYwQ1x1NjhDMFx1NjdFNSBzcGFjZV9pZCBcdThCQkVcdTdGNkVcdUZGMDlgKSBhcyBFcnJvciAmIHsgY29kZTogc3RyaW5nOyBzdGF0dXM6IG51bWJlciB9O1xuICAgICAgICBlLmNvZGUgPSAnVE9LRU5fUkVTT0xWRV9GQUlMRUQnO1xuICAgICAgICBlLnN0YXR1cyA9IDQwMDtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICAgIC8vIFx1NTZERVx1NTE5OSBmZWlzaHVfZG9jX2lkIFx1OEZEQiBmcm9udG1hdHRlclx1RkYwOFx1NEUwQlx1NkIyMVx1NEUwRFx1NzUyOFx1NTE4RFx1ODlFM1x1Njc5MFx1RkYwOVxuICAgICAgcGFyc2VkLmZyb250bWF0dGVyLmZlaXNodV9kb2NfaWQgPSBkb2NUb2tlbjtcbiAgICB9XG4gICAgaWYgKCFkb2NUb2tlbikge1xuICAgICAgY29uc3QgZSA9IG5ldyBFcnJvcignTm8gZmVpc2h1IGJpbmRpbmcgaW4gZnJvbnRtYXR0ZXInKSBhcyBFcnJvciAmIHsgY29kZTogc3RyaW5nOyBzdGF0dXM6IG51bWJlciB9O1xuICAgICAgZS5jb2RlID0gJ05PX0JJTkRJTkcnO1xuICAgICAgZS5zdGF0dXMgPSA0MDA7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgICBjb25zdCB0aXRsZSA9IGZlaXNodVRpdGxlIHx8IGZpbGUuYmFzZW5hbWU7XG4gICAgY29uc3QgcmVtb3RlID0gZmV0Y2hSZW1vdGVEb2N1bWVudCh7XG4gICAgICBub2RlVG9rZW46IGZlaXNodUlkIHx8IGRvY1Rva2VuLFxuICAgICAgb2JqVG9rZW46IGRvY1Rva2VuLFxuICAgICAgc3BhY2VJZDogZGVwcy5zZXR0aW5ncy5zcGFjZUlkLFxuICAgIH0pO1xuICAgIGNvbnN0IGRlY2lzaW9uID0gZGVjaWRlVGhyZWVXYXlTeW5jKHtcbiAgICAgIGJhc2VIYXNoOiBwYXJzZWQuZnJvbnRtYXR0ZXIuc3luY19oYXNoIGFzIHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICAgIGxvY2FsSGFzaDogcGFyc2VkLmhhc2gsXG4gICAgICByZW1vdGVIYXNoOiByZW1vdGUuaGFzaCxcbiAgICB9KTtcbiAgICBjb25zdCBleGVjdXRpb24gPSBwbGFuU3luY0V4ZWN1dGlvbigncHVzaCcsIGRlY2lzaW9uKTtcbiAgICBpZiAoZXhlY3V0aW9uID09PSAnc2tpcCcpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9rOiB0cnVlLFxuICAgICAgICBhY3Rpb246ICdza2lwcGVkJyxcbiAgICAgICAgaGFzaDogcGFyc2VkLmhhc2gsXG4gICAgICAgIHRpdGxlLFxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKGV4ZWN1dGlvbiA9PT0gJ2FkdmFuY2UnKSB7XG4gICAgICBhd2FpdCBhZHZhbmNlTG9jYWxCYXNlbGluZShkZXBzLCBmaWxlLCBjb250ZW50LCBwYXJzZWQsIHRpdGxlKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9rOiB0cnVlLFxuICAgICAgICBhY3Rpb246ICdza2lwcGVkJyxcbiAgICAgICAgaGFzaDogcGFyc2VkLmhhc2gsXG4gICAgICAgIHRpdGxlLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBkZXBzLm5vdGljZShgXHUyQjA2IFx1NTZERVx1NTE5OVx1OThERVx1NEU2NiAke2ZpbGUubmFtZX0uLi5gKTtcblxuICAgIC8vIFx1NkI2NVx1OUFBNCAzLTZcdUZGMUFcdTdFQzRcdTg4QzVcdTY3MDBcdTdFQzggWE1MIFx1NTE4NVx1NUJCOVxuICAgIGNvbnN0IGZpbmFsQ29udGVudCA9IGJ1aWxkUHVzaGJhY2tDb250ZW50KHBhcnNlZCk7XG5cbiAgICAvLyBcdTZCNjVcdTlBQTQgNy04XHVGRjFBXHU1MTQ4XHU0RkREXHU3NTU5XHU4RkRDXHU3QUVGXHU2MDYyXHU1OTBEXHU1MjZGXHU2NzJDXHVGRjBDXHU1MThEIG92ZXJ3cml0ZSArIFx1NjgwN1x1OTg5OFx1NEZFRVx1NTkwRFxuICAgIGNvbnN0IHJlY292ZXJ5UGF0aCA9IGF3YWl0IGNyZWF0ZVJlY292ZXJ5U25hcHNob3QoZGVwcy5hcHAudmF1bHQuYWRhcHRlciwge1xuICAgICAgb3JpZ2luYWxQYXRoOiBmaWxlLnBhdGgsXG4gICAgICBjb250ZW50OiByZW1vdGUucmF3TWFya2Rvd24sXG4gICAgICBzb3VyY2U6ICdyZW1vdGUnLFxuICAgIH0pO1xuICAgIHRyeSB7XG4gICAgICBvdmVyd3JpdGVEb2NYbWwoZG9jVG9rZW4sIGZpbmFsQ29udGVudCwgdGl0bGUpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgSHR0cEVycm9yKFxuICAgICAgICAnUkVNT1RFX1dSSVRFX1VOS05PV04nLFxuICAgICAgICBgXHU4RkRDXHU3QUVGXHU1NkRFXHU1MTk5XHU3RUQzXHU2NzlDXHU2NUUwXHU2Q0Q1XHU3ODZFXHU4QkE0XHVGRjBDXHU4QkY3XHU1MTQ4XHU2OEMwXHU2N0U1XHU5OERFXHU0RTY2XHU1MThEXHU5MUNEXHU4QkQ1XHVGRjFCXHU2MDYyXHU1OTBEXHU1MjZGXHU2NzJDXHVGRjFBJHtyZWNvdmVyeVBhdGh9XHVGRjFCJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCxcbiAgICAgICAgNTAyLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBcdTZCNjVcdTlBQTQgOVx1RkYxQVx1NjZGNFx1NjVCMCBzeW5jX2hhc2ggKyBzeW5jX3RpbWVcbiAgICBjb25zdCBzeW5jVGltZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICBjb25zdCB1cGRhdGVkRm0gPSB7XG4gICAgICAuLi5wYXJzZWQuZnJvbnRtYXR0ZXIsXG4gICAgICBzeW5jX2hhc2g6IHBhcnNlZC5oYXNoLFxuICAgICAgc3luY190aW1lOiBzeW5jVGltZSxcbiAgICB9O1xuICAgIGNvbnN0IG5ld0NvbnRlbnQgPSBhc3NlbWJsZU1kKHVwZGF0ZWRGbSBhcyBuZXZlciwgcGFyc2VkLmJvZHkpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBkZXBzLmFwcC52YXVsdC5tb2RpZnkoZmlsZSwgbmV3Q29udGVudCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBIdHRwRXJyb3IoXG4gICAgICAgICdSRU1PVEVfV1JJVEVfUkVQQUlSX1JFUVVJUkVEJyxcbiAgICAgICAgYFx1OEZEQ1x1N0FFRlx1NURGMlx1NTZERVx1NTE5OVx1RkYwQ1x1NEY0Nlx1NjcyQ1x1NTczMFx1NTdGQVx1N0VCRlx1NjZGNFx1NjVCMFx1NTkzMVx1OEQyNVx1RkYxQlx1NjA2Mlx1NTkwRFx1NTI2Rlx1NjcyQ1x1RkYxQSR7cmVjb3ZlcnlQYXRofVx1RkYxQiR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWAsXG4gICAgICAgIDUwMCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZGVwcy5ub3RpY2UoYFx1MjcwNSBcdTVERjJcdTU2REVcdTUxOTkgJHt0aXRsZX1gKTtcblxuICAgIHJldHVybiB7XG4gICAgICBvazogdHJ1ZSxcbiAgICAgIGFjdGlvbjogJ3B1c2hlZCcsXG4gICAgICBoYXNoOiBwYXJzZWQuaGFzaCxcbiAgICAgIHRpdGxlLFxuICAgIH07XG4gIH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFkdmFuY2VMb2NhbEJhc2VsaW5lKFxuICBkZXBzOiBQdXNoYmFja0RlcHMsXG4gIGZpbGU6IFRGaWxlLFxuICBleGlzdGluZ0NvbnRlbnQ6IHN0cmluZyxcbiAgcGFyc2VkOiBSZXR1cm5UeXBlPHR5cGVvZiBwYXJzZUZpbGU+LFxuICB0aXRsZTogc3RyaW5nLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGF3YWl0IGNyZWF0ZVJlY292ZXJ5U25hcHNob3QoZGVwcy5hcHAudmF1bHQuYWRhcHRlciwge1xuICAgIG9yaWdpbmFsUGF0aDogZmlsZS5wYXRoLFxuICAgIGNvbnRlbnQ6IGV4aXN0aW5nQ29udGVudCxcbiAgICBzb3VyY2U6ICdsb2NhbCcsXG4gIH0pO1xuICBjb25zdCB1cGRhdGVkID0gYXNzZW1ibGVNZCh7XG4gICAgLi4ucGFyc2VkLmZyb250bWF0dGVyLFxuICAgIHN5bmNfaGFzaDogcGFyc2VkLmhhc2gsXG4gICAgc3luY190aW1lOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gIH0gYXMgWUFNTEZyb250bWF0dGVyLCBwYXJzZWQuYm9keSk7XG4gIGF3YWl0IGRlcHMuYXBwLnZhdWx0Lm1vZGlmeShmaWxlLCB1cGRhdGVkKTtcbiAgZGVwcy5ub3RpY2UoYFx1MjcwNSBcdTVERjJcdTc4NkVcdThCQTRcdTUzQ0NcdTdBRUZcdTUxODVcdTVCQjlcdTRFMDBcdTgxRjRcdUZGMUEke3RpdGxlfWApO1xufVxuXG4vKipcbiAqIFx1N0VDNFx1ODhDNVx1NTZERVx1NTE5OVx1OThERVx1NEU2Nlx1NzY4NFx1NjcwMFx1N0VDOFx1NTE4NVx1NUJCOVx1RkYwOFhNTCBcdTY4M0NcdTVGMEZcdUZGMDlcdTMwMDJcbiAqID0gW1lBTUwgY2FsbG91dCBcdTRGRTFcdTYwNkZcdTU3NTddICsgW1x1NkI2M1x1NjU4N1x1RkYwOFx1NTZGRVx1NzI0N1x1OEY2QyBYTUxcdTMwMDFPQiBjYWxsb3V0IFx1OEY2QyBYTUxcdUZGMDldXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkUHVzaGJhY2tDb250ZW50KHBhcnNlZDogUmV0dXJuVHlwZTx0eXBlb2YgcGFyc2VGaWxlPik6IHN0cmluZyB7XG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8vIDEuIFlBTUwgXHU1MTQzXHU2NTcwXHU2MzZFIFx1MjE5MiBjYWxsb3V0IFx1NEZFMVx1NjA2Rlx1NTc1N1xuICBjb25zdCBjYWxsb3V0WG1sID0gbWV0YVRvQ2FsbG91dFhtbChwYXJzZWQuZnJvbnRtYXR0ZXIpO1xuICBpZiAoY2FsbG91dFhtbCkge1xuICAgIHBhcnRzLnB1c2goY2FsbG91dFhtbCk7XG4gIH1cblxuICAvLyAyLiBcdTZCNjNcdTY1ODdcdTU5MDRcdTc0MDZcbiAgbGV0IGJvZHkgPSBwYXJzZWQuYm9keTtcblxuICAvLyAyYS4gXHU1NkZFXHU3MjQ3IGZlaXNodTovL3Rva2VuIFx1MjE5MiA8aW1nIHNyYz1cIlRPS0VOXCIvPlxuICBib2R5ID0gZmVpc2h1UHJvdG9Ub1htbChib2R5KTtcblxuICAvLyAyYi4gT0IgY2FsbG91dCA+IFshdHlwZV0gXHUyMTkyIFx1OThERVx1NEU2NiBjYWxsb3V0IFhNTFxuICBib2R5ID0gY29udmVydE9CQ2FsbG91dHNUb0ZlaXNodShib2R5KTtcblxuICBwYXJ0cy5wdXNoKGJvZHkudHJpbSgpKTtcblxuICByZXR1cm4gcGFydHMuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcblxcbicpO1xufVxuIiwgIi8qKlxuICogXHU1NDdEXHU0RUU0XHU2ODBGXHU1NDdEXHU0RUU0XHUzMDAyXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzEwICsgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGBcdTMwMDJcbiAqXG4gKiAtIFx1NTZERVx1NTE5OVx1NUY1M1x1NTI0RFx1NjU4N1x1NEVGNlx1NTIzMFx1OThERVx1NEU2NlxuICogLSBcdTYyNzlcdTkxQ0ZcdTU2REVcdTUxOTlcdTVGNTNcdTUyNERcdTc2RUVcdTVGNTVcbiAqIC0gXHU1MjM3XHU2NUIwXHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0XG4gKiAtIFx1NjI3OVx1OTFDRlx1NkUwNVx1NzQwNlx1NURGMlx1NTIyMFx1OTY2NFxuICogLSBcdTY2M0VcdTc5M0EvXHU1OTBEXHU1MjM2XHU1NDJGXHU1MkE4XHU0RUU0XHU3MjRDXG4gKiAtIFx1OTFDRFx1NjVCMFx1NTJBMFx1OEY3RFx1NjNEMlx1NEVGNlx1RkYwOFx1OTFDRFx1NTQyRiBIVFRQIHNlcnZlclx1RkYwOVxuICovXG5pbXBvcnQgeyBOb3RpY2UsIE1vZGFsLCBURmlsZSwgdHlwZSBBcHAgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IEZlaXNodVN5bmNQbHVnaW4gfSBmcm9tICcuL21haW4uanMnO1xuaW1wb3J0IHsgcmVmcmVzaE1hcHBpbmcgfSBmcm9tICcuL21hcHBpbmcuanMnO1xuaW1wb3J0IHsgY3JlYXRlUHVzaGJhY2tIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9wdXNoYmFja0hhbmRsZXIuanMnO1xuaW1wb3J0IHsgYmF0Y2hBc3NpZ25FbmNvZGluZyB9IGZyb20gJy4vYXV0b1JlbmFtZS5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckNvbW1hbmRzKHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbik6IHZvaWQge1xuICBjb25zdCB7IGFwcCwgc2V0dGluZ3MgfSA9IHBsdWdpbjtcblxuICAvLyBcdTU2REVcdTUxOTlcdTVGNTNcdTUyNERcdTY1ODdcdTRFRjZcdTUyMzBcdTk4REVcdTRFNjZcbiAgcGx1Z2luLmFkZENvbW1hbmQoe1xuICAgIGlkOiAncHVzaGJhY2stY3VycmVudCcsXG4gICAgbmFtZTogJ1x1NTZERVx1NTE5OVx1NUY1M1x1NTI0RFx1NjU4N1x1NEVGNlx1NTIzMFx1OThERVx1NEU2NicsXG4gICAgZWRpdG9yQ2FsbGJhY2s6IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbGUgPSBhcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgICAgIGlmICghKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkgfHwgIWZpbGUucGF0aC5lbmRzV2l0aCgnLm1kJykpIHtcbiAgICAgICAgbmV3IE5vdGljZSgnXHUyNkEwXHVGRTBGIFx1OEJGN1x1NTcyOCBtYXJrZG93biBcdTY1ODdcdTRFRjZcdTRFMkRcdTRGN0ZcdTc1MjhcdTZCNjRcdTU0N0RcdTRFRTQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBoYW5kbGVyID0gY3JlYXRlUHVzaGJhY2tIYW5kbGVyKHtcbiAgICAgICAgYXBwLFxuICAgICAgICBzZXR0aW5ncyxcbiAgICAgICAgbm90aWNlOiAobSkgPT4gbmV3IE5vdGljZShtKSxcbiAgICAgIH0pO1xuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBwbHVnaW4uZG9jdW1lbnRDb29yZGluYXRpb25LZXkodW5kZWZpbmVkLCBmaWxlLnBhdGgpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwbHVnaW4uc3luY0Nvb3JkaW5hdG9yLnJ1bihrZXksIHVuZGVmaW5lZCwgKCkgPT4gaGFuZGxlcih7XG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgdXJsOiAnL3B1c2hiYWNrJyxcbiAgICAgICAgICBwYXRoOiAnL3B1c2hiYWNrJyxcbiAgICAgICAgICBxdWVyeTogbmV3IFVSTFNlYXJjaFBhcmFtcygpLFxuICAgICAgICAgIGJvZHk6IHsgcGF0aDogZmlsZS5wYXRoIH0sXG4gICAgICAgICAgdG9rZW46ICcnLFxuICAgICAgICB9KSk7XG4gICAgICAgIGlmIChyZXN1bHQuYWN0aW9uID09PSAncHVzaGVkJykge1xuICAgICAgICAgIG5ldyBOb3RpY2UoYFx1MjcwNSBcdTVERjJcdTU2REVcdTUxOTlcdUZGMUEke3Jlc3VsdC50aXRsZX1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXcgTm90aWNlKCdcdTIzRUQgXHU2NUUwXHU1M0Q4XHU1MzE2XHVGRjBDXHU1REYyXHU4REYzXHU4RkM3Jyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBuZXcgTm90aWNlKGBcdTI3NEMgXHU1NkRFXHU1MTk5XHU1OTMxXHU4RDI1XHVGRjFBJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycil9YCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gXHU2Mjc5XHU5MUNGXHU1NkRFXHU1MTk5XHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogJ3B1c2hiYWNrLWRpcicsXG4gICAgbmFtZTogJ1x1NjI3OVx1OTFDRlx1NTZERVx1NTE5OVx1NUY1M1x1NTI0RFx1NzZFRVx1NUY1NVx1NTIzMFx1OThERVx1NEU2NicsXG4gICAgY2FsbGJhY2s6IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbGUgPSBhcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgICAgIGlmICghZmlsZSkge1xuICAgICAgICBuZXcgTm90aWNlKCdcdTI2QTBcdUZFMEYgXHU4QkY3XHU1MTQ4XHU2MjUzXHU1RjAwXHU0RTAwXHU0RTJBXHU2NTg3XHU0RUY2XHU0RUU1XHU3ODZFXHU1QjlBXHU3NkVFXHU1RjU1Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRpciA9IGZpbGUucGFyZW50Py5wYXRoO1xuICAgICAgaWYgKCFkaXIpIHJldHVybjtcblxuICAgICAgY29uc3QgZmlsZXMgPSBhcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpLmZpbHRlcihmID0+IGYucGF0aC5zdGFydHNXaXRoKGRpciArICcvJykpO1xuICAgICAgbGV0IHB1c2hlZCA9IDA7XG4gICAgICBsZXQgc2tpcHBlZCA9IDA7XG4gICAgICBsZXQgZmFpbGVkID0gMDtcblxuICAgICAgY29uc3QgaGFuZGxlciA9IGNyZWF0ZVB1c2hiYWNrSGFuZGxlcih7XG4gICAgICAgIGFwcCxcbiAgICAgICAgc2V0dGluZ3MsXG4gICAgICAgIG5vdGljZTogKCkgPT4ge30sXG4gICAgICB9KTtcblxuICAgICAgZm9yIChjb25zdCBmIG9mIGZpbGVzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgcGx1Z2luLmRvY3VtZW50Q29vcmRpbmF0aW9uS2V5KHVuZGVmaW5lZCwgZi5wYXRoKTtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwbHVnaW4uc3luY0Nvb3JkaW5hdG9yLnJ1bihrZXksIHVuZGVmaW5lZCwgKCkgPT4gaGFuZGxlcih7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIHVybDogJy9wdXNoYmFjaycsXG4gICAgICAgICAgICBwYXRoOiAnL3B1c2hiYWNrJyxcbiAgICAgICAgICAgIHF1ZXJ5OiBuZXcgVVJMU2VhcmNoUGFyYW1zKCksXG4gICAgICAgICAgICBib2R5OiB7IHBhdGg6IGYucGF0aCB9LFxuICAgICAgICAgICAgdG9rZW46ICcnLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBpZiAocmVzdWx0LmFjdGlvbiA9PT0gJ3B1c2hlZCcpIHB1c2hlZCsrO1xuICAgICAgICAgIGVsc2Ugc2tpcHBlZCsrO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICBmYWlsZWQrKztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBuZXcgTm90aWNlKGBcdTJCMDYgXHU2Mjc5XHU5MUNGXHU1NkRFXHU1MTk5XHU1QjhDXHU2MjEwXHVGRjFBXHU2M0E4XHU5MDAxICR7cHVzaGVkfVx1RkYwQ1x1OERGM1x1OEZDNyAke3NraXBwZWR9XHVGRjBDXHU1OTMxXHU4RDI1ICR7ZmFpbGVkfWApO1xuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFx1NjI3OVx1OTFDRlx1NTIwNlx1OTE0RFx1N0YxNlx1NzgwMVx1RkYwOFx1NUY1M1x1NTI0RFx1NzZFRVx1NUY1NVx1RkYwOVxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6ICdhc3NpZ24tZW5jb2RpbmctZGlyJyxcbiAgICBuYW1lOiAnXHU2Mjc5XHU5MUNGXHU1MjA2XHU5MTREXHU3RjE2XHU3ODAxXHVGRjA4XHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XHVGRjA5JyxcbiAgICBjYWxsYmFjazogYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZSA9IGFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuICAgICAgaWYgKCFmaWxlKSB7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1MjZBMFx1RkUwRiBcdThCRjdcdTUxNDhcdTYyNTNcdTVGMDBcdTRFMDBcdTRFMkFcdTY1ODdcdTRFRjZcdTRFRTVcdTc4NkVcdTVCOUFcdTc2RUVcdTVGNTUnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgZGlyID0gZmlsZS5wYXJlbnQ/LnBhdGg7XG4gICAgICBpZiAoIWRpcikgcmV0dXJuO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBiYXRjaEFzc2lnbkVuY29kaW5nKGFwcCwgZGlyKTtcbiAgICAgIG5ldyBOb3RpY2UoYFx1RDgzRFx1REQyMiBcdTdGMTZcdTc4MDFcdTUyMDZcdTkxNERcdUZGMUEke3Jlc3VsdC5hc3NpZ25lZH0vJHtyZXN1bHQudG90YWx9YCk7XG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gXHU1MjM3XHU2NUIwXHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0XG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogJ3JlZnJlc2gtbWFwcGluZycsXG4gICAgbmFtZTogJ1x1NTIzN1x1NjVCMFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1RkYwOE9CXHUyMTkyXHU5OERFXHU0RTY2XHVGRjA5JyxcbiAgICBjYWxsYmFjazogYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgcmVmcmVzaE1hcHBpbmcoYXBwLCBzZXR0aW5ncy5zcGFjZUlkKTtcbiAgICB9LFxuICB9KTtcblxuICAvLyBcdTY2M0VcdTc5M0FcdTU0MkZcdTUyQThcdTRFRTRcdTcyNENcbiAgcGx1Z2luLmFkZENvbW1hbmQoe1xuICAgIGlkOiAnc2hvdy10b2tlbicsXG4gICAgbmFtZTogJ1x1NjYzRVx1NzkzQVx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1x1RkYwOFx1OEZERVx1NjNBNVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NjI2OVx1NUM1NVx1NzUyOFx1RkYwOScsXG4gICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgIGNvbnN0IG1vZGFsID0gbmV3IFRva2VuTW9kYWwoYXBwLCBzZXR0aW5ncy5zeW5jVG9rZW4pO1xuICAgICAgbW9kYWwub3BlbigpO1xuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFx1NjYzRVx1NzkzQVx1NjcwMFx1OEZEMVx1NTQwQ1x1NkI2NVx1OEJCMFx1NUY1NVxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6ICdzaG93LXJlY2VudCcsXG4gICAgbmFtZTogJ1x1NjYzRVx1NzkzQVx1NjcwMFx1OEZEMVx1NTQwQ1x1NkI2NVx1OEJCMFx1NUY1NScsXG4gICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgIGNvbnN0IHJlY2VudCA9IHBsdWdpbi5zdGF0ZS5yZWNlbnRTeW5jcztcbiAgICAgIGlmIChyZWNlbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1RkYwOFx1NjY4Mlx1NjVFMFx1NTQwQ1x1NkI2NVx1OEJCMFx1NUY1NVx1RkYwOScpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBsaW5lcyA9IHJlY2VudC5zbGljZSgwLCAxMCkubWFwKFxuICAgICAgICByID0+IGAke3IuYWN0aW9uID09PSAnY3JlYXRlZCcgPyAnXHUyNzk1JyA6IHIuYWN0aW9uID09PSAndXBkYXRlZCcgPyAnXHUyNzBGJyA6ICdcdTI3NEMnfSAke3IudGl0bGV9IFx1MjE5MiAke3IucGF0aH1gLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IG1vZGFsID0gbmV3IE1vZGFsKGFwcCk7XG4gICAgICBtb2RhbC50aXRsZUVsLnNldFRleHQoJ1x1NjcwMFx1OEZEMVx1NTQwQ1x1NkI2NVx1OEJCMFx1NUY1NScpO1xuICAgICAgY29uc3QgcHJlID0gbW9kYWwuY29udGVudEVsLmNyZWF0ZUVsKCdwcmUnKTtcbiAgICAgIHByZS5zZXRUZXh0KGxpbmVzLmpvaW4oJ1xcbicpKTtcbiAgICAgIG1vZGFsLm9wZW4oKTtcbiAgICB9LFxuICB9KTtcbn1cblxuLyoqIFx1NEVFNFx1NzI0Q1x1NUM1NVx1NzkzQSBNb2RhbFx1MzAwMiAqL1xuY2xhc3MgVG9rZW5Nb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgdG9rZW46IHN0cmluZykge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBvbk9wZW4oKTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG4gICAgY29udGVudEVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1x1NTQyRlx1NTJBOFx1NEVFNFx1NzI0QycgfSk7XG4gICAgY29udGVudEVsLmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDogJ1x1NTkwRFx1NTIzNlx1NkI2NFx1NEVFNFx1NzI0Q1x1RkYwQ1x1N0M5OFx1OEQzNFx1NTIzMFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NjI2OVx1NUM1NVx1NUYzOVx1N0E5N1x1NzY4NFwiVG9rZW5cIlx1OEY5M1x1NTE2NVx1Njg0Nlx1MzAwMicsXG4gICAgICBjbHM6ICdzZXR0aW5nLWl0ZW0tZGVzY3JpcHRpb24nLFxuICAgIH0pO1xuICAgIGNvbnN0IGNvZGVFbCA9IGNvbnRlbnRFbC5jcmVhdGVFbCgnY29kZScpO1xuICAgIGNvZGVFbC5zZXRUZXh0KHRoaXMudG9rZW4pO1xuICAgIGNvZGVFbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBjb2RlRWwuc3R5bGUucGFkZGluZyA9ICcxMnB4JztcbiAgICBjb2RlRWwuc3R5bGUuZm9udEZhbWlseSA9ICdtb25vc3BhY2UnO1xuICAgIGNvZGVFbC5zdHlsZS53b3JkQnJlYWsgPSAnYnJlYWstYWxsJztcbiAgICBjb2RlRWwuc3R5bGUuYmFja2dyb3VuZCA9ICd2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSknO1xuXG4gICAgY29uc3QgYnRuID0gY29udGVudEVsLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdcdTU5MERcdTUyMzYnIH0pO1xuICAgIGJ0bi5vbmNsaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGhpcy50b2tlbik7XG4gICAgICBuZXcgTm90aWNlKCdcdTI3MDUgXHU1REYyXHU1OTBEXHU1MjM2Jyk7XG4gICAgfTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IE1vZGFsLCBOb3RpY2UsIFRGaWxlLCBURm9sZGVyLCB0eXBlIEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7XG4gIE9CU0lESUFOX0xBUktfRE9DX0FDVElPTixcbiAgcGFyc2VPYnNpZGlhbkxhcmtEb2NQYXJhbXMsXG4gIHR5cGUgRmV0Y2hSZXF1ZXN0LFxufSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHR5cGUgeyBGZWlzaHVTeW5jUGx1Z2luIH0gZnJvbSAnLi9tYWluLmpzJztcbmltcG9ydCB7IGNyZWF0ZUZldGNoSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlcnMvZmV0Y2hIYW5kbGVyLmpzJztcbmltcG9ydCB7IHJlc29sdmVOb2RlVG9rZW5Gcm9tVXJsIH0gZnJvbSAnLi9sYXJrL2NsaS5qcyc7XG5pbXBvcnQgeyBub3JtYWxpemVWYXVsdERpciB9IGZyb20gJy4vdmF1bHRQYXRoLmpzJztcblxudHlwZSBUcmlnZ2VyU291cmNlID0gJ3Byb3RvY29sJyB8ICdjb21tYW5kJyB8ICdjbGlwcGVyJztcblxuaW50ZXJmYWNlIFRyaWdnZXJJbnB1dCB7XG4gIG5vZGVfdG9rZW4/OiBzdHJpbmc7XG4gIG9ial90b2tlbj86IHN0cmluZztcbiAgc3BhY2VfaWQ/OiBzdHJpbmc7XG4gIHRpdGxlPzogc3RyaW5nO1xuICB1cmw/OiBzdHJpbmc7XG4gIGRpcj86IHN0cmluZztcbiAgcmVwbGFjZV9wYXRoPzogc3RyaW5nO1xuICBzb3VyY2U6IFRyaWdnZXJTb3VyY2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckZldGNoRW50cnlwb2ludHMocGx1Z2luOiBGZWlzaHVTeW5jUGx1Z2luKTogdm9pZCB7XG4gIHBsdWdpbi5yZWdpc3Rlck9ic2lkaWFuUHJvdG9jb2xIYW5kbGVyKE9CU0lESUFOX0xBUktfRE9DX0FDVElPTiwgKHBhcmFtcykgPT4ge1xuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlT2JzaWRpYW5MYXJrRG9jUGFyYW1zKHBhcmFtcyk7XG4gICAgdm9pZCB0cmlnZ2VyRmV0Y2gocGx1Z2luLCB7XG4gICAgICBub2RlX3Rva2VuOiBwYXJzZWQubm9kZV90b2tlbiB8fCBwYXJzZWQudG9rZW4sXG4gICAgICBvYmpfdG9rZW46IHBhcnNlZC5vYmpfdG9rZW4sXG4gICAgICBzcGFjZV9pZDogcGFyc2VkLnNwYWNlX2lkLFxuICAgICAgdGl0bGU6IHBhcnNlZC50aXRsZSxcbiAgICAgIHVybDogcGFyc2VkLnVybCxcbiAgICAgIGRpcjogcGFyc2VkLmRpcixcbiAgICAgIHNvdXJjZTogJ3Byb3RvY29sJyxcbiAgICB9KTtcbiAgfSk7XG5cbiAgcGx1Z2luLmFkZENvbW1hbmQoe1xuICAgIGlkOiAnZmV0Y2gtZmVpc2h1LWRvYycsXG4gICAgbmFtZTogJ1x1NjJDOVx1NTNENlx1OThERVx1NEU2Nlx1NjU4N1x1Njg2MycsXG4gICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgIG5ldyBGZWlzaHVJbnB1dE1vZGFsKHBsdWdpbi5hcHAsIGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBwYXJzZVVzZXJJbnB1dCh2YWx1ZSk7XG4gICAgICAgIGF3YWl0IHRyaWdnZXJGZXRjaChwbHVnaW4sIHtcbiAgICAgICAgICAuLi5wYXJzZWQsXG4gICAgICAgICAgc291cmNlOiAnY29tbWFuZCcsXG4gICAgICAgIH0pO1xuICAgICAgfSkub3BlbigpO1xuICAgIH0sXG4gIH0pO1xuXG4gIHBsdWdpbi5yZWdpc3RlckV2ZW50KFxuICAgIHBsdWdpbi5hcHAudmF1bHQub24oJ2NyZWF0ZScsIChmaWxlKSA9PiB7XG4gICAgICBpZiAoIShmaWxlIGluc3RhbmNlb2YgVEZpbGUpIHx8IGZpbGUuZXh0ZW5zaW9uICE9PSAnbWQnKSByZXR1cm47XG4gICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHZvaWQgaGFuZGxlQ2xpcHBlclBsYWNlaG9sZGVyKHBsdWdpbiwgZmlsZSk7XG4gICAgICB9LCAyNTApO1xuICAgIH0pLFxuICApO1xufVxuXG5hc3luYyBmdW5jdGlvbiB0cmlnZ2VyRmV0Y2gocGx1Z2luOiBGZWlzaHVTeW5jUGx1Z2luLCBpbnB1dDogVHJpZ2dlcklucHV0KTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHJlc29sdmVkID0gbm9ybWFsaXplSW5wdXQocGx1Z2luLCBpbnB1dCk7XG4gIGlmICghcmVzb2x2ZWQubm9kZV90b2tlbikge1xuICAgIG5ldyBOb3RpY2UoJ1x1NjVFMFx1NkNENVx1OEJDNlx1NTIyQlx1OThERVx1NEU2Nlx1NjU4N1x1Njg2MyB0b2tlbicpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHJlcTogRmV0Y2hSZXF1ZXN0ID0ge1xuICAgIG5vZGVfdG9rZW46IHJlc29sdmVkLm5vZGVfdG9rZW4sXG4gICAgb2JqX3Rva2VuOiByZXNvbHZlZC5vYmpfdG9rZW4sXG4gICAgc3BhY2VfaWQ6IHJlc29sdmVkLnNwYWNlX2lkIHx8IHBsdWdpbi5zZXR0aW5ncy5zcGFjZUlkLFxuICAgIGRpcjogcmVzb2x2ZWQuZGlyIHx8IHBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0RGlyLFxuICAgIGZpbGVuYW1lOiByZXNvbHZlZC50aXRsZSxcbiAgICByZXBsYWNlX3BhdGg6IHJlc29sdmVkLnJlcGxhY2VfcGF0aCxcbiAgfTtcblxuICBjb25zdCBydW4gPSBhc3luYyAoZGlyPzogc3RyaW5nKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBjcmVhdGVGZXRjaEhhbmRsZXIoe1xuICAgICAgICBhcHA6IHBsdWdpbi5hcHAsXG4gICAgICAgIHNldHRpbmdzOiBwbHVnaW4uc2V0dGluZ3MsXG4gICAgICAgIHN0YXRlOiBwbHVnaW4uc3RhdGUsXG4gICAgICAgIG5vdGljZTogKG1lc3NhZ2UpID0+IG5ldyBOb3RpY2UobWVzc2FnZSksXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHRhcmdldERpciA9IG5vcm1hbGl6ZVZhdWx0RGlyKGRpciB8fCByZXEuZGlyIHx8IHBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0RGlyKTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBsdWdpbi5zeW5jQ29vcmRpbmF0b3IucnVuKGBkb2N1bWVudDoke3JlcS5ub2RlX3Rva2VufWAsIHVuZGVmaW5lZCwgKCkgPT5cbiAgICAgICAgcGx1Z2luLnN5bmNDb29yZGluYXRvci5ydW4oYGRpcmVjdG9yeToke3RhcmdldERpcn1gLCB1bmRlZmluZWQsICgpID0+IGhhbmRsZXIoe1xuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgIHVybDogJy9mZXRjaCcsXG4gICAgICAgICAgcGF0aDogJy9mZXRjaCcsXG4gICAgICAgICAgcXVlcnk6IG5ldyBVUkxTZWFyY2hQYXJhbXMoKSxcbiAgICAgICAgICBib2R5OiB7IC4uLnJlcSwgZGlyOiB0YXJnZXREaXIgfSxcbiAgICAgICAgICB0b2tlbjogJycsXG4gICAgICAgIH0pKSk7XG4gICAgICBuZXcgTm90aWNlKGAke3Jlc3VsdC5hY3Rpb24gPT09ICdjcmVhdGVkJyA/ICdcdTVERjJcdTUyMUJcdTVFRkEnIDogJ1x1NURGMlx1NjZGNFx1NjVCMCd9XHVGRjFBJHtyZXN1bHQucGF0aH1gKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIG5ldyBOb3RpY2UoYFx1NTQwQ1x1NkI2NVx1NTkzMVx1OEQyNVx1RkYxQSR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpfWApO1xuICAgIH1cbiAgfTtcblxuICBpZiAoaW5wdXQuc291cmNlID09PSAncHJvdG9jb2wnICYmICFpbnB1dC5kaXIpIHtcbiAgICBuZXcgRm9sZGVyUGlja01vZGFsKHBsdWdpbi5hcHAsIHBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0RGlyLCBydW4pLm9wZW4oKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBhd2FpdCBydW4ocmVxLmRpcik7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUlucHV0KHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbiwgaW5wdXQ6IFRyaWdnZXJJbnB1dCk6IFRyaWdnZXJJbnB1dCB7XG4gIGlmIChpbnB1dC51cmwpIHtcbiAgICBjb25zdCBmcm9tVXJsID0gcmVzb2x2ZU5vZGVUb2tlbkZyb21VcmwoaW5wdXQudXJsKTtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uaW5wdXQsXG4gICAgICBub2RlX3Rva2VuOiBpbnB1dC5ub2RlX3Rva2VuIHx8IGZyb21Vcmwubm9kZV90b2tlbiB8fCBpbnB1dC5vYmpfdG9rZW4gfHwgZnJvbVVybC5vYmpfdG9rZW4sXG4gICAgICBvYmpfdG9rZW46IGlucHV0Lm9ial90b2tlbiB8fCBmcm9tVXJsLm9ial90b2tlbixcbiAgICB9O1xuICB9XG4gIHJldHVybiB7XG4gICAgLi4uaW5wdXQsXG4gICAgbm9kZV90b2tlbjogaW5wdXQubm9kZV90b2tlbiB8fCBpbnB1dC5vYmpfdG9rZW4sXG4gICAgc3BhY2VfaWQ6IGlucHV0LnNwYWNlX2lkIHx8IHBsdWdpbi5zZXR0aW5ncy5zcGFjZUlkLFxuICB9O1xufVxuXG5mdW5jdGlvbiBwYXJzZVVzZXJJbnB1dCh2YWx1ZTogc3RyaW5nKTogT21pdDxUcmlnZ2VySW5wdXQsICdzb3VyY2UnPiB7XG4gIGNvbnN0IHRyaW1tZWQgPSB2YWx1ZS50cmltKCk7XG4gIGlmICgvXmh0dHBzPzpcXC9cXC8vLnRlc3QodHJpbW1lZCkpIHtcbiAgICBjb25zdCBwYXJzZWQgPSByZXNvbHZlTm9kZVRva2VuRnJvbVVybCh0cmltbWVkKTtcbiAgICByZXR1cm4ge1xuICAgICAgbm9kZV90b2tlbjogcGFyc2VkLm5vZGVfdG9rZW4gfHwgcGFyc2VkLm9ial90b2tlbixcbiAgICAgIG9ial90b2tlbjogcGFyc2VkLm9ial90b2tlbixcbiAgICAgIHVybDogdHJpbW1lZCxcbiAgICB9O1xuICB9XG4gIGNvbnN0IHByb3RvY29sUGFyYW1zID0gcGFyc2VPYnNpZGlhbkxhcmtEb2NQYXJhbXModHJpbW1lZCk7XG4gIGlmIChwcm90b2NvbFBhcmFtcy50b2tlbiB8fCBwcm90b2NvbFBhcmFtcy5ub2RlX3Rva2VuIHx8IHByb3RvY29sUGFyYW1zLm9ial90b2tlbikge1xuICAgIHJldHVybiB7XG4gICAgICBub2RlX3Rva2VuOiBwcm90b2NvbFBhcmFtcy5ub2RlX3Rva2VuIHx8IHByb3RvY29sUGFyYW1zLnRva2VuIHx8IHByb3RvY29sUGFyYW1zLm9ial90b2tlbixcbiAgICAgIG9ial90b2tlbjogcHJvdG9jb2xQYXJhbXMub2JqX3Rva2VuLFxuICAgICAgc3BhY2VfaWQ6IHByb3RvY29sUGFyYW1zLnNwYWNlX2lkLFxuICAgICAgdGl0bGU6IHByb3RvY29sUGFyYW1zLnRpdGxlLFxuICAgICAgdXJsOiBwcm90b2NvbFBhcmFtcy51cmwsXG4gICAgICBkaXI6IHByb3RvY29sUGFyYW1zLmRpcixcbiAgICB9O1xuICB9XG4gIHJldHVybiB7IG5vZGVfdG9rZW46IHRyaW1tZWQgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2xpcHBlclBsYWNlaG9sZGVyKHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbiwgZmlsZTogVEZpbGUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgbGV0IGNvbnRlbnQgPSAnJztcbiAgdHJ5IHtcbiAgICBjb250ZW50ID0gYXdhaXQgcGx1Z2luLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB1cmwgPSBleHRyYWN0Q2xpcHBlclVybChjb250ZW50KTtcbiAgaWYgKCF1cmwpIHJldHVybjtcbiAgY29uc3QgcGFyc2VkID0gcmVzb2x2ZU5vZGVUb2tlbkZyb21VcmwodXJsKTtcbiAgY29uc3Qgbm9kZVRva2VuID0gcGFyc2VkLm5vZGVfdG9rZW4gfHwgcGFyc2VkLm9ial90b2tlbjtcbiAgaWYgKCFub2RlVG9rZW4pIHJldHVybjtcblxuICBhd2FpdCB0cmlnZ2VyRmV0Y2gocGx1Z2luLCB7XG4gICAgbm9kZV90b2tlbjogbm9kZVRva2VuLFxuICAgIG9ial90b2tlbjogcGFyc2VkLm9ial90b2tlbixcbiAgICB1cmwsXG4gICAgZGlyOiBmaWxlLnBhcmVudD8ucGF0aCB8fCBwbHVnaW4uc2V0dGluZ3MuZGVmYXVsdERpcixcbiAgICByZXBsYWNlX3BhdGg6IGZpbGUucGF0aCxcbiAgICBzb3VyY2U6ICdjbGlwcGVyJyxcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RDbGlwcGVyVXJsKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCBwYXR0ZXJucyA9IFtcbiAgICAvZmVpc2h1X3N5bmNfdXJsOlxccypbXCInXT8oW15cXG5cIiddKykvLFxuICAgIC9zb3VyY2U6XFxzKltcIiddPyhodHRwcz86XFwvXFwvW15cXG5cIiddKig/OmZlaXNodVxcLmNufGxhcmtzdWl0ZVxcLmNvbSlcXC8oPzp3aWtpfGRvY3h8ZG9jKVxcL1tBLVphLXowLTldKykvLFxuICAgIC8oaHR0cHM/OlxcL1xcL1teXFxzKVwiJ10qKD86ZmVpc2h1XFwuY258bGFya3N1aXRlXFwuY29tKVxcLyg/Ondpa2l8ZG9jeHxkb2MpXFwvW0EtWmEtejAtOV0rKS8sXG4gIF07XG4gIGZvciAoY29uc3QgcGF0dGVybiBvZiBwYXR0ZXJucykge1xuICAgIGNvbnN0IG1hdGNoID0gY29udGVudC5tYXRjaChwYXR0ZXJuKTtcbiAgICBpZiAobWF0Y2g/LlsxXSkgcmV0dXJuIG1hdGNoWzFdLnRyaW0oKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuY2xhc3MgRmVpc2h1SW5wdXRNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBpbnB1dEVsITogSFRNTElucHV0RWxlbWVudDtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJpdmF0ZSBvblN1Ym1pdDogKHZhbHVlOiBzdHJpbmcpID0+IFByb21pc2U8dm9pZD4pIHtcbiAgICBzdXBlcihhcHApO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIHRoaXMudGl0bGVFbC5zZXRUZXh0KCdcdTYyQzlcdTUzRDZcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjMnKTtcbiAgICB0aGlzLmlucHV0RWwgPSB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbCgnaW5wdXQnLCB7XG4gICAgICB0eXBlOiAndGV4dCcsXG4gICAgICBwbGFjZWhvbGRlcjogJ1x1N0M5OFx1OEQzNFx1OThERVx1NEU2Nlx1OTRGRVx1NjNBNVx1MzAwMXRva2VuIFx1NjIxNiBvYnNpZGlhbjovL2xhcmstZG9jIFx1NTczMFx1NTc0MCcsXG4gICAgfSk7XG4gICAgdGhpcy5pbnB1dEVsLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgIHRoaXMuaW5wdXRFbC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ICE9PSAnRW50ZXInKSByZXR1cm47XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmlucHV0RWwudmFsdWUudHJpbSgpO1xuICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgdm9pZCB0aGlzLm9uU3VibWl0KHZhbHVlKTtcbiAgICB9KTtcbiAgICB0aGlzLmlucHV0RWwuZm9jdXMoKTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxufVxuXG5jbGFzcyBGb2xkZXJQaWNrTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIGFwcDogQXBwLFxuICAgIHByaXZhdGUgZGVmYXVsdERpcjogc3RyaW5nLFxuICAgIHByaXZhdGUgb25TdWJtaXQ6IChkaXI6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPixcbiAgKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgfVxuXG4gIG9uT3BlbigpOiB2b2lkIHtcbiAgICB0aGlzLnRpdGxlRWwuc2V0VGV4dCgnXHU5MDA5XHU2MkU5XHU1NDBDXHU2QjY1XHU3NkVFXHU1RjU1Jyk7XG4gICAgY29uc3Qgc2VsZWN0ID0gdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ3NlbGVjdCcpO1xuICAgIHNlbGVjdC5zdHlsZS53aWR0aCA9ICcxMDAlJztcblxuICAgIGNvbnN0IGZvbGRlcnMgPSBnZXRGb2xkZXJzKHRoaXMuYXBwKTtcbiAgICBmb3IgKGNvbnN0IGZvbGRlciBvZiBmb2xkZXJzKSB7XG4gICAgICBjb25zdCBvcHRpb24gPSBzZWxlY3QuY3JlYXRlRWwoJ29wdGlvbicsIHtcbiAgICAgICAgdGV4dDogZm9sZGVyLnBhdGggfHwgJy8nLFxuICAgICAgICB2YWx1ZTogZm9sZGVyLnBhdGgsXG4gICAgICB9KTtcbiAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IGZvbGRlci5wYXRoID09PSB0aGlzLmRlZmF1bHREaXI7XG4gICAgfVxuXG4gICAgY29uc3Qgcm93ID0gdGhpcy5jb250ZW50RWwuY3JlYXRlRGl2KCk7XG4gICAgcm93LnN0eWxlLm1hcmdpblRvcCA9ICcxMnB4JztcbiAgICBjb25zdCBjb25maXJtID0gcm93LmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdcdTU0MENcdTZCNjUnIH0pO1xuICAgIGNvbmZpcm0ub25jbGljayA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGRpciA9IHNlbGVjdC52YWx1ZSB8fCB0aGlzLmRlZmF1bHREaXI7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB2b2lkIHRoaXMub25TdWJtaXQoZGlyKTtcbiAgICB9O1xuICB9XG5cbiAgb25DbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldEZvbGRlcnMoYXBwOiBBcHApOiBURm9sZGVyW10ge1xuICBjb25zdCBmb2xkZXJzID0gYXBwLnZhdWx0XG4gICAgLmdldEFsbExvYWRlZEZpbGVzKClcbiAgICAuZmlsdGVyKChmaWxlKTogZmlsZSBpcyBURm9sZGVyID0+IGZpbGUgaW5zdGFuY2VvZiBURm9sZGVyKVxuICAgIC5maWx0ZXIoKGZvbGRlcikgPT4gIWZvbGRlci5wYXRoLnN0YXJ0c1dpdGgoJy5vYnNpZGlhbicpICYmICFmb2xkZXIucGF0aC5zdGFydHNXaXRoKCcuZmVpc2h1LXN5bmMnKSk7XG4gIHJldHVybiBmb2xkZXJzLmxlbmd0aCA+IDAgPyBmb2xkZXJzIDogW2FwcC52YXVsdC5nZXRSb290KCldO1xufVxuIiwgIi8qKlxuICogXHU1NkZFXHU3MjQ3XHU5ODg0XHU4OUM4XHU2RTMyXHU2N0QzXHUzMDAyXHU0RjlEXHU2MzZFIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgIFx1MDBBNzMuMyArIGAwM19cdTY4M0NcdTVGMEZcdTg5QzRcdTgzMDMubWRgIFx1MDBBN1x1NTE2RFx1MzAwMlxuICpcbiAqIE9CIG1kIFx1OTFDQ1x1NTZGRVx1NzI0N1x1NTE5OVx1NjIxMCBgIVtdKGZlaXNodTovL0ZJTEVfVE9LRU4pYFx1RkYwQ1x1NkUzMlx1NjdEM1x1NjVGNlx1OEMwMyBsYXJrLWNsaSBcdTYzNjJcdTRFMzRcdTY1RjZcdTk0RkVcdTYzQTVcdTMwMDJcbiAqIFx1NUUyNiBMUlUgXHU3RjEzXHU1QjU4XHVGRjA4XHU5MDdGXHU1MTREXHU2QkNGXHU2QjIxXHU2RTMyXHU2N0QzXHU5MEZEXHU0RTBCXHU4RjdEXHVGRjA5XHVGRjBDXHU3RjEzXHU1QjU4XHU3NkVFXHU1RjU1XHU1NzI4IHZhdWx0IFx1NEUwQiBgLmZlaXNodS1zeW5jL2NhY2hlL2BcdTMwMDJcbiAqL1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBOb3RpY2UsIFBsYXRmb3JtIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgcnVuIH0gZnJvbSAnLi9sYXJrL2NsaS5qcyc7XG5pbXBvcnQgeyB2YWxpZGF0ZUltYWdlVG9rZW4gfSBmcm9tICcuL3ZhdWx0UGF0aC5qcyc7XG5cbmNvbnN0IENBQ0hFX0RJUiA9ICcuZmVpc2h1LXN5bmMvY2FjaGUnO1xuXG4vKipcbiAqIFx1NkNFOFx1NTE4Q1x1NTZGRVx1NzI0N1x1NkUzMlx1NjdEM1x1NTkwNFx1NzQwNlx1NTY2OFx1MzAwMlxuICogXHU2MkU2XHU2MjJBXHU2RTMyXHU2N0QzXHU1NDBFXHU3Njg0IDxpbWcgc3JjPVwiZmVpc2h1Oi8vVE9LRU5cIj5cdUZGMENcdTYzNjJcdTYyMTAgbGFyay1jbGkgXHU0RTBCXHU4RjdEXHU3Njg0XHU2NzJDXHU1NzMwXHU0RTM0XHU2NUY2XHU2NTg3XHU0RUY2XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckltYWdlUmVuZGVyZXIocGx1Z2luOiBQbHVnaW4pOiB2b2lkIHtcbiAgaWYgKCFQbGF0Zm9ybS5pc0Rlc2t0b3BBcHApIHJldHVybjtcblxuICBwbHVnaW4ucmVnaXN0ZXJNYXJrZG93blBvc3RQcm9jZXNzb3IoYXN5bmMgKGVsKSA9PiB7XG4gICAgY29uc3QgaW1ncyA9IGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2ltZycpO1xuICAgIGZvciAoY29uc3QgaW1nIG9mIEFycmF5LmZyb20oaW1ncykpIHtcbiAgICAgIGNvbnN0IHNyYyA9IGltZy5nZXRBdHRyaWJ1dGUoJ3NyYycpIHx8ICcnO1xuICAgICAgaWYgKCFzcmMuc3RhcnRzV2l0aCgnZmVpc2h1Oi8vJykpIGNvbnRpbnVlO1xuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB0b2tlbiA9IHZhbGlkYXRlSW1hZ2VUb2tlbihzcmMuc2xpY2UoJ2ZlaXNodTovLycubGVuZ3RoKSk7XG4gICAgICAgIGNvbnN0IGxvY2FsUGF0aCA9IGF3YWl0IHJlc29sdmVJbWFnZShwbHVnaW4sIHRva2VuKTtcbiAgICAgICAgaWYgKGxvY2FsUGF0aCkge1xuICAgICAgICAgIC8vIFx1NzUyOCB2YXVsdDovLyBcdTk0RkVcdTYzQTVcdTYyMTYgYXBwOi8vbG9jYWwvIFx1OTRGRVx1NjNBNVxuICAgICAgICAgIGNvbnN0IHZhdWx0QmFzZSA9IChcbiAgICAgICAgICAgIHBsdWdpbi5hcHAudmF1bHQuYWRhcHRlciBhcyB0eXBlb2YgcGx1Z2luLmFwcC52YXVsdC5hZGFwdGVyICYgeyBnZXRCYXNlUGF0aD86ICgpID0+IHN0cmluZyB9XG4gICAgICAgICAgKS5nZXRCYXNlUGF0aD8uKCkgPz8gJyc7XG4gICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4odmF1bHRCYXNlLCBsb2NhbFBhdGgpO1xuICAgICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoJ3NyYycsIGBhcHA6Ly9sb2NhbC8ke2Z1bGxQYXRofWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoJ2FsdCcsIGBbXHU5OERFXHU0RTY2XHU1NkZFXHU3MjQ3ICR7dG9rZW4uc2xpY2UoMCwgOCl9IFx1NTJBMFx1OEY3RFx1NTkzMVx1OEQyNV1gKTtcbiAgICAgICAgICBpbWcuc2V0QXR0cmlidXRlKCdzcmMnLCAnJyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2ltYWdlXSByZW5kZXIgZmFpbGVkOicsIGVycik7XG4gICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoJ2FsdCcsICdbXHU5OERFXHU0RTY2XHU1NkZFXHU3MjQ3XHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1XScpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogXHU4OUUzXHU2NzkwXHU1MzU1XHU0RTJBXHU5OERFXHU0RTY2XHU1NkZFXHU3MjQ3IHRva2VuIFx1MjE5MiBcdTY3MkNcdTU3MzBcdTdGMTNcdTVCNThcdThERUZcdTVGODRcdTMwMDJcbiAqIFx1NTQ3RFx1NEUyRFx1N0YxM1x1NUI1OFx1NzZGNFx1NjNBNVx1OEZENFx1NTZERVx1RkYwQ1x1NTQyNlx1NTIxOVx1OEMwMyBsYXJrLWNsaSBkb2NzICttZWRpYS1kb3dubG9hZCBcdTRFMEJcdThGN0RcdTMwMDJcbiAqL1xuY29uc3QgcmVzb2x2aW5nID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2U8c3RyaW5nIHwgbnVsbD4+KCk7XG5cbmFzeW5jIGZ1bmN0aW9uIHJlc29sdmVJbWFnZShwbHVnaW46IFBsdWdpbiwgdG9rZW46IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAvLyBcdTVFNzZcdTUzRDFcdTUzQkJcdTkxQ0RcdUZGMDhcdTU0MENcdTRFMDAgdG9rZW4gXHU1OTFBXHU0RTJBIGltZyBcdTU0MENcdTY1RjZcdTZFMzJcdTY3RDNcdTUzRUFcdTRFMEJcdThGN0RcdTRFMDBcdTZCMjFcdUZGMDlcbiAgaWYgKHJlc29sdmluZy5oYXModG9rZW4pKSByZXR1cm4gcmVzb2x2aW5nLmdldCh0b2tlbikhO1xuXG4gIGNvbnN0IHByb21pc2UgPSBkb1Jlc29sdmVJbWFnZShwbHVnaW4sIHRva2VuKTtcbiAgcmVzb2x2aW5nLnNldCh0b2tlbiwgcHJvbWlzZSk7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGF3YWl0IHByb21pc2U7XG4gIH0gZmluYWxseSB7XG4gICAgcmVzb2x2aW5nLmRlbGV0ZSh0b2tlbik7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZG9SZXNvbHZlSW1hZ2UocGx1Z2luOiBQbHVnaW4sIHRva2VuOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgY29uc3QgeyBhZGFwdGVyIH0gPSBwbHVnaW4uYXBwLnZhdWx0O1xuICBjb25zdCBleHQgPSAnLnBuZyc7IC8vIFx1OThERVx1NEU2Nlx1NTZGRVx1NzI0N1x1OUVEOFx1OEJBNCBwbmdcdUZGMENcdTY1RTBcdTZDRDVcdTk4ODRcdTc3RTVcdTY4M0NcdTVGMEZcdUZGMENcdTdFREZcdTRFMDAgcG5nXG4gIGNvbnN0IGNhY2hlUGF0aCA9IGAke0NBQ0hFX0RJUn0vJHt0b2tlbn0ke2V4dH1gO1xuXG4gIC8vIFx1NTQ3RFx1NEUyRFx1N0YxM1x1NUI1OFxuICBpZiAoYXdhaXQgYWRhcHRlci5leGlzdHMoY2FjaGVQYXRoKSkge1xuICAgIHJldHVybiBjYWNoZVBhdGg7XG4gIH1cblxuICAvLyBcdTc4NkVcdTRGRERcdTdGMTNcdTVCNThcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjhcbiAgdHJ5IHtcbiAgICBpZiAoIShhd2FpdCBhZGFwdGVyLmV4aXN0cyhDQUNIRV9ESVIpKSkge1xuICAgICAgYXdhaXQgYWRhcHRlci5ta2RpcihDQUNIRV9ESVIpO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgLyogaWdub3JlICovXG4gIH1cblxuICAvLyBcdTRFMEJcdThGN0RcdTUyMzBcdTRFMzRcdTY1RjZcdTY3MkNcdTU3MzBcdThERUZcdTVGODRcdUZGMDhsYXJrLWNsaSBcdTk3MDBcdTg5ODFcdTY3MkNcdTU3MzBcdTY1ODdcdTRFRjZcdTdDRkJcdTdFREZcdThERUZcdTVGODRcdUZGMDlcbiAgY29uc3QgdmF1bHRCYXNlID0gKGFkYXB0ZXIgYXMgeyBnZXRCYXNlUGF0aD86ICgpID0+IHN0cmluZyB9KS5nZXRCYXNlUGF0aD8uKCkgPz8gcHJvY2Vzcy5jd2QoKTtcbiAgY29uc3QgbG9jYWxGdWxsUGF0aCA9IHBhdGguam9pbih2YXVsdEJhc2UsIGNhY2hlUGF0aCk7XG5cbiAgdHJ5IHtcbiAgICBydW4oWydkb2NzJywgJyttZWRpYS1kb3dubG9hZCcsICctLXRva2VuJywgdG9rZW4sICctLW91dHB1dCcsIGxvY2FsRnVsbFBhdGhdLCB7XG4gICAgICB0aW1lb3V0OiAzMDAwMCxcbiAgICB9KTtcbiAgICByZXR1cm4gY2FjaGVQYXRoO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2ltYWdlXSBtZWRpYS1kb3dubG9hZCBmYWlsZWQ6JywgdG9rZW4sIGVycik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTZFMDVcdTc0MDZcdThGQzdcdTY3MUZcdTdGMTNcdTVCNThcdTMwMDJcdTRGOURcdTYzNkVcdThCQkVcdTdGNkUgY2FjaGVDbGVhbnVwIFx1NTQ2OFx1NjcxRlx1MzAwMlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYW51cEltYWdlQ2FjaGUocGx1Z2luOiBQbHVnaW4sIG1vZGU6ICdkYWlseScgfCAnd2Vla2x5JyB8ICdtb250aGx5JyB8ICduZXZlcicpOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKG1vZGUgPT09ICduZXZlcicpIHJldHVybjtcblxuICBjb25zdCB7IGFkYXB0ZXIgfSA9IHBsdWdpbi5hcHAudmF1bHQ7XG4gIGlmICghKGF3YWl0IGFkYXB0ZXIuZXhpc3RzKENBQ0hFX0RJUikpKSByZXR1cm47XG5cbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgY29uc3QgdHRsTXMgPVxuICAgIG1vZGUgPT09ICdkYWlseScgPyAyNCAqIDM2MDAgKiAxMDAwIDpcbiAgICBtb2RlID09PSAnd2Vla2x5JyA/IDcgKiAyNCAqIDM2MDAgKiAxMDAwIDpcbiAgICAzMCAqIDI0ICogMzYwMCAqIDEwMDA7XG5cbiAgbGV0IGNsZWFuZWQgPSAwO1xuICB0cnkge1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgYWRhcHRlci5saXN0KENBQ0hFX0RJUik7XG4gICAgZm9yIChjb25zdCBmIG9mIGZpbGVzLmZpbGVzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzdGF0ID0gYXdhaXQgYWRhcHRlci5zdGF0KGYpO1xuICAgICAgICBpZiAoc3RhdD8ubXRpbWUgJiYgbm93IC0gc3RhdC5tdGltZSA+IHR0bE1zKSB7XG4gICAgICAgICAgYXdhaXQgYWRhcHRlci5yZW1vdmUoZik7XG4gICAgICAgICAgY2xlYW5lZCsrO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2ltYWdlXSBjbGVhbnVwIGZhaWxlZDonLCBlcnIpO1xuICB9XG5cbiAgaWYgKGNsZWFuZWQgPiAwKSB7XG4gICAgbmV3IE5vdGljZShgXHVEODNFXHVEREY5IFx1NURGMlx1NkUwNVx1NzQwNiAke2NsZWFuZWR9IFx1NEUyQVx1OEZDN1x1NjcxRlx1NTZGRVx1NzI0N1x1N0YxM1x1NUI1OGApO1xuICB9XG59XG4iLCAiY29uc3QgTEVHQUNZX1NZU1RFTV9QUk9QRVJUWV9LRVlTID0gbmV3IFNldChbXG4gICdmZWlzaHVfaWQnLFxuICAnZmVpc2h1X2RvY19pZCcsXG4gICdmZWlzaHVfdGl0bGUnLFxuICAnc3luY19oYXNoJyxcbiAgJ3N5bmNfdGltZScsXG5dKTtcblxuZXhwb3J0IGNvbnN0IFNZU1RFTV9QUk9QRVJUWV9TVFlMRV9JRCA9ICdmc3RiLXN5c3RlbS1wcm9wZXJ0eS1zdHlsZSc7XG5leHBvcnQgY29uc3QgU1lTVEVNX1BST1BFUlRZX0hJRERFTl9DTEFTUyA9ICdmc3RiLXN5c3RlbS1wcm9wZXJ0eS1oaWRkZW4nO1xuZXhwb3J0IGNvbnN0IFNZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTID0gJ2ZzdGItaGlkZS1zeXN0ZW0tcHJvcGVydGllcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N5c3RlbVByb3BlcnR5S2V5KHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGNvbnN0IGtleSA9IFN0cmluZyh2YWx1ZSA/PyAnJykudHJpbSgpO1xuICByZXR1cm4ga2V5LnN0YXJ0c1dpdGgoJ19zeXNfJykgfHwgTEVHQUNZX1NZU1RFTV9QUk9QRVJUWV9LRVlTLmhhcyhrZXkpO1xufVxuXG5leHBvcnQgY29uc3QgU1lTVEVNX1BST1BFUlRZX0NTUyA9IGBcbmJvZHkuJHtTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTU30gLm1ldGFkYXRhLXByb3BlcnR5W2RhdGEtcHJvcGVydHkta2V5Xj1cIl9zeXNfXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHlbZGF0YS1wcm9wZXJ0eS1uYW1lXj1cIl9zeXNfXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHlbZGF0YS1wcm9wZXJ0eS1rZXk9XCJmZWlzaHVfaWRcIl0sXG5ib2R5LiR7U1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1N9IC5tZXRhZGF0YS1wcm9wZXJ0eVtkYXRhLXByb3BlcnR5LWtleT1cImZlaXNodV9kb2NfaWRcIl0sXG5ib2R5LiR7U1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1N9IC5tZXRhZGF0YS1wcm9wZXJ0eVtkYXRhLXByb3BlcnR5LWtleT1cImZlaXNodV90aXRsZVwiXSxcbmJvZHkuJHtTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTU30gLm1ldGFkYXRhLXByb3BlcnR5W2RhdGEtcHJvcGVydHkta2V5PVwic3luY19oYXNoXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHlbZGF0YS1wcm9wZXJ0eS1rZXk9XCJzeW5jX3RpbWVcIl0sXG5ib2R5LiR7U1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1N9IC5tZXRhZGF0YS1wcm9wZXJ0eVtkYXRhLXByb3BlcnR5LW5hbWU9XCJmZWlzaHVfaWRcIl0sXG5ib2R5LiR7U1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1N9IC5tZXRhZGF0YS1wcm9wZXJ0eVtkYXRhLXByb3BlcnR5LW5hbWU9XCJmZWlzaHVfZG9jX2lkXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHlbZGF0YS1wcm9wZXJ0eS1uYW1lPVwiZmVpc2h1X3RpdGxlXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHlbZGF0YS1wcm9wZXJ0eS1uYW1lPVwic3luY19oYXNoXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHlbZGF0YS1wcm9wZXJ0eS1uYW1lPVwic3luY190aW1lXCJdLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHk6aGFzKC5tZXRhZGF0YS1wcm9wZXJ0eS1rZXktaW5wdXRbdmFsdWVePVwiX3N5c19cIl0pLFxuYm9keS4ke1NZU1RFTV9QUk9QRVJUWV9CT0RZX0NMQVNTfSAubWV0YWRhdGEtcHJvcGVydHk6aGFzKC5tZXRhZGF0YS1wcm9wZXJ0eS1rZXktaW5wdXRbYXJpYS1sYWJlbF49XCJfc3lzX1wiXSksXG5ib2R5LiR7U1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1N9IC5tZXRhZGF0YS1wcm9wZXJ0eTpoYXMoLm1ldGFkYXRhLXByb3BlcnR5LWtleSBpbnB1dFt2YWx1ZV49XCJfc3lzX1wiXSksXG5ib2R5LiR7U1lTVEVNX1BST1BFUlRZX0JPRFlfQ0xBU1N9IC5tZXRhZGF0YS1wcm9wZXJ0eTpoYXMoLm1ldGFkYXRhLXByb3BlcnR5LWtleSBzcGFuW3RpdGxlXj1cIl9zeXNfXCJdKSxcbmJvZHkuJHtTWVNURU1fUFJPUEVSVFlfQk9EWV9DTEFTU30gLm1ldGFkYXRhLXByb3BlcnR5OmhhcygubWV0YWRhdGEtcHJvcGVydHkta2V5LWlubmVyW3RpdGxlXj1cIl9zeXNfXCJdKSB7XG4gIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDtcbn1cbi4ke1NZU1RFTV9QUk9QRVJUWV9ISURERU5fQ0xBU1N9IHtcbiAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50O1xufVxuYDtcbiIsICJpbnRlcmZhY2UgQ29vcmRpbmF0b3JPcHRpb25zIHtcbiAgbWF4Q29tcGxldGVkPzogbnVtYmVyO1xuICBjb21wbGV0ZWRUdGxNcz86IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIENhY2hlZFJlc3VsdCB7XG4gIGtleTogc3RyaW5nO1xuICB2YWx1ZTogdW5rbm93bjtcbiAgY29tcGxldGVkQXQ6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIEluZmxpZ2h0UmVzdWx0IHtcbiAga2V5OiBzdHJpbmc7XG4gIHByb21pc2U6IFByb21pc2U8dW5rbm93bj47XG59XG5cbmNsYXNzIFJlcXVlc3RDb25mbGljdEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb2RlID0gJ1JFUVVFU1RfSURfQ09ORkxJQ1QnO1xuICBzdGF0dXMgPSA0MDk7XG59XG5cbmV4cG9ydCBjbGFzcyBTeW5jQ29vcmRpbmF0b3Ige1xuICBwcml2YXRlIHJlYWRvbmx5IG1heENvbXBsZXRlZDogbnVtYmVyO1xuICBwcml2YXRlIHJlYWRvbmx5IGNvbXBsZXRlZFR0bE1zOiBudW1iZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgdGFpbHMgPSBuZXcgTWFwPHN0cmluZywgUHJvbWlzZTx2b2lkPj4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBpbmZsaWdodCA9IG5ldyBNYXA8c3RyaW5nLCBJbmZsaWdodFJlc3VsdD4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBjb21wbGV0ZWQgPSBuZXcgTWFwPHN0cmluZywgQ2FjaGVkUmVzdWx0PigpO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IENvb3JkaW5hdG9yT3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5tYXhDb21wbGV0ZWQgPSBNYXRoLm1heCgxLCBvcHRpb25zLm1heENvbXBsZXRlZCA/PyAxMDApO1xuICAgIHRoaXMuY29tcGxldGVkVHRsTXMgPSBNYXRoLm1heCgxXzAwMCwgb3B0aW9ucy5jb21wbGV0ZWRUdGxNcyA/PyAxMCAqIDYwXzAwMCk7XG4gIH1cblxuICBnZXQgY29tcGxldGVkQ291bnQoKTogbnVtYmVyIHtcbiAgICB0aGlzLnBydW5lQ29tcGxldGVkKCk7XG4gICAgcmV0dXJuIHRoaXMuY29tcGxldGVkLnNpemU7XG4gIH1cblxuICBhc3luYyBydW48VD4oa2V5OiBzdHJpbmcsIHJlcXVlc3RJZDogc3RyaW5nIHwgdW5kZWZpbmVkLCB0YXNrOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZEtleSA9IGtleS50cmltKCk7XG4gICAgY29uc3Qgbm9ybWFsaXplZFJlcXVlc3RJZCA9IHJlcXVlc3RJZD8udHJpbSgpO1xuICAgIGlmICghbm9ybWFsaXplZEtleSkgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRvciBrZXkgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAobm9ybWFsaXplZFJlcXVlc3RJZCAmJiAhL15bQS1aYS16MC05Ll86LV17MSwxMjh9JC8udGVzdChub3JtYWxpemVkUmVxdWVzdElkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdyZXF1ZXN0SWQgY29udGFpbnMgdW5zdXBwb3J0ZWQgY2hhcmFjdGVycyBvciBleGNlZWRzIDEyOCBjaGFyYWN0ZXJzJyk7XG4gICAgfVxuXG4gICAgdGhpcy5wcnVuZUNvbXBsZXRlZCgpO1xuICAgIGlmIChub3JtYWxpemVkUmVxdWVzdElkKSB7XG4gICAgICBjb25zdCBjYWNoZWQgPSB0aGlzLmNvbXBsZXRlZC5nZXQobm9ybWFsaXplZFJlcXVlc3RJZCk7XG4gICAgICBpZiAoY2FjaGVkKSB7XG4gICAgICAgIHRoaXMuYXNzZXJ0U2FtZUtleShub3JtYWxpemVkUmVxdWVzdElkLCBjYWNoZWQua2V5LCBub3JtYWxpemVkS2V5KTtcbiAgICAgICAgcmV0dXJuIGNhY2hlZC52YWx1ZSBhcyBUO1xuICAgICAgfVxuICAgICAgY29uc3QgYWN0aXZlID0gdGhpcy5pbmZsaWdodC5nZXQobm9ybWFsaXplZFJlcXVlc3RJZCk7XG4gICAgICBpZiAoYWN0aXZlKSB7XG4gICAgICAgIHRoaXMuYXNzZXJ0U2FtZUtleShub3JtYWxpemVkUmVxdWVzdElkLCBhY3RpdmUua2V5LCBub3JtYWxpemVkS2V5KTtcbiAgICAgICAgcmV0dXJuIGFjdGl2ZS5wcm9taXNlIGFzIFByb21pc2U8VD47XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgb3BlcmF0aW9uID0gdGhpcy5lbnF1ZXVlKG5vcm1hbGl6ZWRLZXksIHRhc2spO1xuICAgIGlmICghbm9ybWFsaXplZFJlcXVlc3RJZCkgcmV0dXJuIG9wZXJhdGlvbjtcblxuICAgIGNvbnN0IHRyYWNrZWQgPSBvcGVyYXRpb24udGhlbigodmFsdWUpID0+IHtcbiAgICAgIHRoaXMucmVtZW1iZXIobm9ybWFsaXplZFJlcXVlc3RJZCwgbm9ybWFsaXplZEtleSwgdmFsdWUpO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgdGhpcy5pbmZsaWdodC5kZWxldGUobm9ybWFsaXplZFJlcXVlc3RJZCk7XG4gICAgfSk7XG4gICAgdGhpcy5pbmZsaWdodC5zZXQobm9ybWFsaXplZFJlcXVlc3RJZCwgeyBrZXk6IG5vcm1hbGl6ZWRLZXksIHByb21pc2U6IHRyYWNrZWQgfSk7XG4gICAgcmV0dXJuIHRyYWNrZWQ7XG4gIH1cblxuICBwcml2YXRlIGVucXVldWU8VD4oa2V5OiBzdHJpbmcsIHRhc2s6ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBwcmV2aW91cyA9IHRoaXMudGFpbHMuZ2V0KGtleSkgPz8gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgbGV0IHJlbGVhc2UhOiAoKSA9PiB2b2lkO1xuICAgIGNvbnN0IHNsb3QgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgcmVsZWFzZSA9IHJlc29sdmU7XG4gICAgfSk7XG4gICAgY29uc3QgdGFpbCA9IHByZXZpb3VzLmNhdGNoKCgpID0+IHt9KS50aGVuKCgpID0+IHNsb3QpO1xuICAgIHRoaXMudGFpbHMuc2V0KGtleSwgdGFpbCk7XG5cbiAgICByZXR1cm4gcHJldmlvdXMuY2F0Y2goKCkgPT4ge30pLnRoZW4odGFzaykuZmluYWxseSgoKSA9PiB7XG4gICAgICByZWxlYXNlKCk7XG4gICAgICBpZiAodGhpcy50YWlscy5nZXQoa2V5KSA9PT0gdGFpbCkgdGhpcy50YWlscy5kZWxldGUoa2V5KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXNzZXJ0U2FtZUtleShyZXF1ZXN0SWQ6IHN0cmluZywgZXhpc3RpbmdLZXk6IHN0cmluZywgcmVxdWVzdGVkS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoZXhpc3RpbmdLZXkgIT09IHJlcXVlc3RlZEtleSkge1xuICAgICAgdGhyb3cgbmV3IFJlcXVlc3RDb25mbGljdEVycm9yKGByZXF1ZXN0SWQgJHtyZXF1ZXN0SWR9IGlzIGFscmVhZHkgYm91bmQgdG8gYW5vdGhlciBkb2N1bWVudGApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVtZW1iZXIocmVxdWVzdElkOiBzdHJpbmcsIGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMuY29tcGxldGVkLmRlbGV0ZShyZXF1ZXN0SWQpO1xuICAgIHRoaXMuY29tcGxldGVkLnNldChyZXF1ZXN0SWQsIHsga2V5LCB2YWx1ZSwgY29tcGxldGVkQXQ6IERhdGUubm93KCkgfSk7XG4gICAgd2hpbGUgKHRoaXMuY29tcGxldGVkLnNpemUgPiB0aGlzLm1heENvbXBsZXRlZCkge1xuICAgICAgY29uc3Qgb2xkZXN0ID0gdGhpcy5jb21wbGV0ZWQua2V5cygpLm5leHQoKS52YWx1ZSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgICBpZiAoIW9sZGVzdCkgYnJlYWs7XG4gICAgICB0aGlzLmNvbXBsZXRlZC5kZWxldGUob2xkZXN0KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBydW5lQ29tcGxldGVkKCk6IHZvaWQge1xuICAgIGNvbnN0IGN1dG9mZiA9IERhdGUubm93KCkgLSB0aGlzLmNvbXBsZXRlZFR0bE1zO1xuICAgIGZvciAoY29uc3QgW3JlcXVlc3RJZCwgZW50cnldIG9mIHRoaXMuY29tcGxldGVkKSB7XG4gICAgICBpZiAoZW50cnkuY29tcGxldGVkQXQgPj0gY3V0b2ZmKSBicmVhaztcbiAgICAgIHRoaXMuY29tcGxldGVkLmRlbGV0ZShyZXF1ZXN0SWQpO1xuICAgIH1cbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFVQSxJQUFBQSxvQkFBc0M7OztBQ1Z0Qyx5QkFBMkM7OztBQ2tDcEMsSUFBTSxtQkFBdUM7QUFBQSxFQUNsRCxlQUFlO0FBQUEsRUFDZixNQUFNO0FBQUEsRUFDTixXQUFXO0FBQUEsRUFDWCxhQUFhO0FBQUEsRUFDYixZQUFZO0FBQUEsRUFDWixZQUFZO0FBQUEsRUFDWixvQkFBb0I7QUFBQSxFQUNwQixjQUFjO0FBQUEsRUFDZCxzQkFB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QUFBLE1BQ2YsUUFBUSxDQUFDLE1BQU0sSUFBSSx5QkFBTyxDQUFDO0FBQUEsSUFDN0IsQ0FBQztBQUNELFdBQU8sSUFBSSxhQUFhLE9BQU8sUUFBUTtBQUNyQyxZQUFNLE1BQU0sSUFBSTtBQUNoQixZQUFNLE1BQU0sTUFBTSxLQUFLLHdCQUF3QixLQUFLLFlBQVksS0FBSyxJQUFJO0FBQ3pFLGFBQU8sS0FBSyxnQkFBZ0IsSUFBSSxLQUFLLEtBQUssV0FBVyxNQUFNLGdCQUFnQixHQUFHLENBQUM7QUFBQSxJQUNqRixDQUFDO0FBRUQsUUFBSTtBQUNGLFlBQU0sRUFBRSxLQUFLLElBQUksTUFBTSxZQUFZLEtBQUssU0FBUyxNQUFNLElBQUk7QUFDM0QsV0FBSyxhQUFhO0FBQ2xCLFdBQUssTUFBTSxnQkFBZ0I7QUFBQSxJQUM3QixTQUFTLEtBQUs7QUFDWixZQUFNLE1BQU0sZUFBZSxRQUFRLElBQUksVUFBVSxPQUFPLEdBQUc7QUFDM0QsVUFBSSx5QkFBTyxpRUFBeUIsS0FBSyxTQUFTLElBQUksZUFBSyxHQUFHLEVBQUU7QUFDaEUsY0FBUSxNQUFNLGdDQUFnQyxHQUFHO0FBQUEsSUFDbkQ7QUFBQSxFQUNGO0FBQ0Y7QUFHQSxJQUFPLGVBQVE7IiwKICAibmFtZXMiOiBbImltcG9ydF9vYnNpZGlhbiIsICJub2RlV2ViQ3J5cHRvIiwgImltcG9ydF9vYnNpZGlhbiIsICJjcmVhdGVIYXNoIiwgInJlc3VsdCIsICJkYXRlIiwgIlNjaGVtYSIsICJsaW5lIiwgInN0clRhZyIsICJjaCIsICJzdHlsZSIsICJub2RlIiwgImpzb24iLCAidW53cmFwTGFya0VudmVsb3BlIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgInBhdGgiLCAiaW1wb3J0X25vZGVfY3J5cHRvIiwgInBhdGgiLCAiaW1wb3J0X29ic2lkaWFuIiwgImVuc3VyZUZvbGRlciIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJydW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgInBhdGgiLCAicGF0aCJdCn0K
