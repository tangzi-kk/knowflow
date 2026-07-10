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
var import_obsidian9 = require("obsidian");

// src/settings.ts
var DEFAULT_SETTINGS = {
  port: 4567,
  syncToken: "",
  larkCliPath: "",
  defaultDir: "0\uFE0F\u20E3\u8F93\u5165",
  autoRename: true,
  autoDeleteRegistry: true,
  cacheCleanup: "weekly",
  keepDecorativeImages: true,
  spaceId: "7651314150060067803"
};

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
        const fullFilePath = path.join(execOpts.cwd || process.cwd(), filePath);
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
    if (!child.name || child.name.startsWith(".")) continue;
    if (!child.children?.length) continue;
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
        this.plugin.settings.syncToken = generateToken();
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
function generateToken() {
  const bytes = new Uint8Array(32);
  (globalThis.crypto ?? require("node:crypto")).webcrypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

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
var import_obsidian4 = require("obsidian");

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
  if (!(folder instanceof TFolder)) return 1;
  let maxSeq = 0;
  for (const child of folder.children) {
    if (!(child instanceof TFile) || !child.name.endsWith(".md")) continue;
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
  if (!(file instanceof TFile)) return void 0;
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
  if (!(folder instanceof TFolder)) return { total: 0, assigned: 0 };
  let assigned = 0;
  let total = 0;
  for (const child of folder.children) {
    if (!(child instanceof TFile) || !child.name.endsWith(".md")) continue;
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
    const targetDir = dir ?? settings.defaultDir;
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
    const existingFile = await findByFeishuId(deps.app, node_token);
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
      const replaceFile = req.replace_path ? deps.app.vault.getAbstractFileByPath(req.replace_path) : null;
      const existing = deps.app.vault.getAbstractFileByPath(relativePath);
      if (replaceFile instanceof import_obsidian4.TFile) {
        await deps.app.vault.modify(replaceFile, content);
        finalPath = replaceFile.path;
        action = "updated";
      } else if (existing instanceof import_obsidian4.TFile) {
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
async function findByFeishuId(app, feishuId) {
  const files = app.vault.getMarkdownFiles();
  for (const file of files) {
    if (file.path.startsWith(".obsidian") || file.path.startsWith(".feishu-sync")) continue;
    try {
      const content = await app.vault.read(file);
      if (!content.includes("feishu_id:")) continue;
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch) continue;
      const idMatch = fmMatch[1].match(/feishu_id:\s*["']?([A-Za-z0-9]+)/);
      if (idMatch && idMatch[1] === feishuId) {
        return file;
      }
    } catch {
      continue;
    }
  }
  return null;
}
async function ensureFolder(app, dir) {
  if (!dir || dir === "." || dir === "/") return;
  const existing = app.vault.getAbstractFileByPath(dir);
  if (existing instanceof import_obsidian4.TFolder) return;
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
var import_obsidian5 = require("obsidian");
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
    const appendPath = cleanPath(req.appendPath);
    if (!url && !text && !bodyMarkdown && !rawText) {
      const e = new Error("url or text is required");
      e.code = "MISSING_CLIP_CONTENT";
      e.status = 400;
      throw e;
    }
    const createdAt = /* @__PURE__ */ new Date();
    const targetDir = cleanDir(req.dir) || deps.settings.defaultDir;
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
      if (!(target instanceof import_obsidian5.TFile)) {
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
    if (existing instanceof import_obsidian5.TFile) {
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
function cleanDir(value) {
  return cleanText(value).replace(/^\/+|\/+$/g, "");
}
function cleanPath(value) {
  const raw = cleanDir(value);
  if (!raw) return "";
  return raw.endsWith(".md") ? raw : `${raw}.md`;
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
  if (existing instanceof import_obsidian5.TFolder) return;
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
    const file = await findByFeishuId2(app, req.node_token);
    return {
      ok: true,
      exists: !!file,
      path: file?.path
    };
  };
}
async function findByFeishuId2(app, feishuId) {
  const files = app.vault.getMarkdownFiles();
  for (const file of files) {
    if (file.path.startsWith(".obsidian") || file.path.startsWith(".feishu-sync")) continue;
    try {
      const content = await app.vault.read(file);
      if (!content.includes("feishu_id:")) continue;
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch) continue;
      const idMatch = fmMatch[1].match(/feishu_id:\s*["']?([A-Za-z0-9]+)/);
      if (idMatch && idMatch[1] === feishuId) return file;
    } catch {
      continue;
    }
  }
  return null;
}

// src/handlers/pushbackHandler.ts
function createPushbackHandler(deps) {
  return async (ctx) => {
    const req = ctx.body;
    let file = null;
    if (req.path) {
      const f = deps.app.vault.getAbstractFileByPath(req.path);
      if (f instanceof TFile) file = f;
    } else if (req.node_token) {
      file = await findByFeishuId3(deps.app, req.node_token);
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
async function findByFeishuId3(app, feishuId) {
  const files = app.vault.getMarkdownFiles();
  for (const file of files) {
    if (file.path.startsWith(".obsidian") || file.path.startsWith(".feishu-sync")) continue;
    try {
      const content = await app.vault.read(file);
      if (!content.includes("feishu_id:")) continue;
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch) continue;
      const idMatch = fmMatch[1].match(/feishu_id:\s*["']?([A-Za-z0-9]+)/);
      if (idMatch && idMatch[1] === feishuId) return file;
    } catch {
      continue;
    }
  }
  return null;
}

// src/commands.ts
var import_obsidian6 = require("obsidian");
function registerCommands(plugin) {
  const { app, settings } = plugin;
  plugin.addCommand({
    id: "pushback-current",
    name: "\u56DE\u5199\u5F53\u524D\u6587\u4EF6\u5230\u98DE\u4E66",
    editorCallback: async (editor) => {
      const file = app.workspace.getActiveFile();
      if (!(file instanceof TFile) || !file.path.endsWith(".md")) {
        new import_obsidian6.Notice("\u26A0\uFE0F \u8BF7\u5728 markdown \u6587\u4EF6\u4E2D\u4F7F\u7528\u6B64\u547D\u4EE4");
        return;
      }
      const handler = createPushbackHandler({
        app,
        settings,
        notice: (m) => new import_obsidian6.Notice(m)
      });
      try {
        const result = await handler({
          method: "POST",
          url: "/pushback",
          path: "/pushback",
          query: new URLSearchParams(),
          body: { path: file.path },
          token: ""
        });
        if (result.action === "pushed") {
          new import_obsidian6.Notice(`\u2705 \u5DF2\u56DE\u5199\uFF1A${result.title}`);
        } else {
          new import_obsidian6.Notice("\u23ED \u65E0\u53D8\u5316\uFF0C\u5DF2\u8DF3\u8FC7");
        }
      } catch (err) {
        new import_obsidian6.Notice(`\u274C \u56DE\u5199\u5931\u8D25\uFF1A${err instanceof Error ? err.message : String(err)}`);
      }
    }
  });
  plugin.addCommand({
    id: "pushback-dir",
    name: "\u6279\u91CF\u56DE\u5199\u5F53\u524D\u76EE\u5F55\u5230\u98DE\u4E66",
    callback: async () => {
      const file = app.workspace.getActiveFile();
      if (!file) {
        new import_obsidian6.Notice("\u26A0\uFE0F \u8BF7\u5148\u6253\u5F00\u4E00\u4E2A\u6587\u4EF6\u4EE5\u786E\u5B9A\u76EE\u5F55");
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
          const result = await handler({
            method: "POST",
            url: "/pushback",
            path: "/pushback",
            query: new URLSearchParams(),
            body: { path: f.path },
            token: ""
          });
          if (result.action === "pushed") pushed++;
          else skipped++;
        } catch {
          failed++;
        }
      }
      new import_obsidian6.Notice(`\u2B06 \u6279\u91CF\u56DE\u5199\u5B8C\u6210\uFF1A\u63A8\u9001 ${pushed}\uFF0C\u8DF3\u8FC7 ${skipped}\uFF0C\u5931\u8D25 ${failed}`);
    }
  });
  plugin.addCommand({
    id: "assign-encoding-dir",
    name: "\u6279\u91CF\u5206\u914D\u7F16\u7801\uFF08\u5F53\u524D\u76EE\u5F55\uFF09",
    callback: async () => {
      const file = app.workspace.getActiveFile();
      if (!file) {
        new import_obsidian6.Notice("\u26A0\uFE0F \u8BF7\u5148\u6253\u5F00\u4E00\u4E2A\u6587\u4EF6\u4EE5\u786E\u5B9A\u76EE\u5F55");
        return;
      }
      const dir = file.parent?.path;
      if (!dir) return;
      const result = await batchAssignEncoding(app, dir);
      new import_obsidian6.Notice(`\u{1F522} \u7F16\u7801\u5206\u914D\uFF1A${result.assigned}/${result.total}`);
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
        new import_obsidian6.Notice("\uFF08\u6682\u65E0\u540C\u6B65\u8BB0\u5F55\uFF09");
        return;
      }
      const lines = recent.slice(0, 10).map(
        (r) => `${r.action === "created" ? "\u2795" : r.action === "updated" ? "\u270F" : "\u274C"} ${r.title} \u2192 ${r.path}`
      );
      const modal = new import_obsidian6.Modal(app);
      modal.titleEl.setText("\u6700\u8FD1\u540C\u6B65\u8BB0\u5F55");
      const pre = modal.contentEl.createEl("pre");
      pre.setText(lines.join("\n"));
      modal.open();
    }
  });
}
var TokenModal = class extends import_obsidian6.Modal {
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
      new import_obsidian6.Notice("\u2705 \u5DF2\u590D\u5236");
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/fetchEntrypoints.ts
var import_obsidian7 = require("obsidian");
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
      if (!(file instanceof import_obsidian7.TFile) || file.extension !== "md") return;
      window.setTimeout(() => {
        void handleClipperPlaceholder(plugin, file);
      }, 250);
    })
  );
}
async function triggerFetch(plugin, input) {
  const resolved = normalizeInput(plugin, input);
  if (!resolved.node_token) {
    new import_obsidian7.Notice("\u65E0\u6CD5\u8BC6\u522B\u98DE\u4E66\u6587\u6863 token");
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
        notice: (message) => new import_obsidian7.Notice(message)
      });
      const result = await handler({
        method: "POST",
        url: "/fetch",
        path: "/fetch",
        query: new URLSearchParams(),
        body: { ...req, dir: dir || req.dir },
        token: ""
      });
      new import_obsidian7.Notice(`${result.action === "created" ? "\u5DF2\u521B\u5EFA" : "\u5DF2\u66F4\u65B0"}\uFF1A${result.path}`);
    } catch (err) {
      new import_obsidian7.Notice(`\u540C\u6B65\u5931\u8D25\uFF1A${err instanceof Error ? err.message : String(err)}`);
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
var FeishuInputModal = class extends import_obsidian7.Modal {
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
var FolderPickModal = class extends import_obsidian7.Modal {
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
  const folders = app.vault.getAllLoadedFiles().filter((file) => file instanceof import_obsidian7.TFolder).filter((folder) => !folder.path.startsWith(".obsidian") && !folder.path.startsWith(".feishu-sync"));
  return folders.length > 0 ? folders : [app.vault.getRoot()];
}

// src/imageRender.ts
var import_obsidian8 = require("obsidian");
var path2 = __toESM(require("node:path"), 1);
var CACHE_DIR = ".feishu-sync/cache";
function registerImageRenderer(plugin) {
  if (!import_obsidian8.Platform.isDesktopApp) return;
  const { adapter } = plugin.app.vault;
  plugin.registerMarkdownPostProcessor(async (el, ctx) => {
    const imgs = el.querySelectorAll("img");
    for (const img of Array.from(imgs)) {
      const src = img.getAttribute("src") || "";
      if (!src.startsWith("feishu://")) continue;
      const token = src.slice("feishu://".length);
      try {
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
        console.warn("[sync/image] render failed:", token, err);
        img.setAttribute("alt", `[\u98DE\u4E66\u56FE\u7247 ${token.slice(0, 8)} \u52A0\u8F7D\u4E2D...]`);
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
    new import_obsidian8.Notice(`\u{1F9F9} \u5DF2\u6E05\u7406 ${cleaned} \u4E2A\u8FC7\u671F\u56FE\u7247\u7F13\u5B58`);
  }
}

// src/main.ts
var FeishuSyncPlugin = class extends import_obsidian9.Plugin {
  async onload() {
    await this.loadSettings();
    this.state = {
      larkCliResolved: "",
      larkCliVersion: "",
      serverRunning: false,
      recentSyncs: []
    };
    if (!this.settings.syncToken) {
      this.settings.syncToken = generateToken2();
      await this.saveSettings();
    }
    const larkInfo = resolveCli(this.settings.larkCliPath || void 0);
    if (larkInfo) {
      this.state.larkCliResolved = larkInfo.path;
      this.state.larkCliVersion = larkInfo.version;
      process.env.__LARK_CLI_PATH__ = larkInfo.path;
      console.log(`[sync] lark-cli: ${larkInfo.version} @ ${larkInfo.path}`);
    } else {
      console.warn("[sync] lark-cli not found (need >= 1.0.52)");
    }
    this.addSettingTab(new FeishuSyncSettingTab(this.app, this));
    registerCommands(this);
    registerFetchEntrypoints(this);
    registerImageRenderer(this);
    await this.startHttpServer();
    this.addRibbonIcon("refresh-cw", "\u98DE\u4E66\u540C\u6B65", async () => {
      await refreshMapping(this.app, this.settings.spaceId);
    });
    this.registerEvent(
      this.app.workspace.on("layout-ready", () => {
        cleanupImageCache(this, this.settings.cacheCleanup).catch(() => {
        });
      })
    );
    console.log(`[sync] feishu-sync loaded on port ${this.settings.port}`);
  }
  async onunload() {
    if (this.stopServer) {
      await this.stopServer();
      this.stopServer = void 0;
    }
    console.log("[sync] feishu-sync unloaded");
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
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
    routes.set("/fetch", createFetchHandler({
      app: this.app,
      settings: this.settings,
      state: this.state,
      notice: (m) => new import_obsidian9.Notice(m)
    }));
    routes.set("/clip", createClipHandler({
      app: this.app,
      settings: this.settings,
      notice: (m) => new import_obsidian9.Notice(m)
    }));
    routes.set("/exists", createExistsHandler(this.app));
    routes.set("/pushback", createPushbackHandler({
      app: this.app,
      settings: this.settings,
      notice: (m) => new import_obsidian9.Notice(m)
    }));
    try {
      const { stop } = await startServer(this.settings.port, deps);
      this.stopServer = stop;
      this.state.serverRunning = true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      new import_obsidian9.Notice(`\u274C HTTP server \u542F\u52A8\u5931\u8D25\uFF08\u7AEF\u53E3 ${this.settings.port}\uFF09\uFF1A${msg}`);
      console.error("[sync] server start failed:", err);
    }
  }
};
function generateToken2() {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
var main_default = FeishuSyncPlugin;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FeishuSyncPlugin
});
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 5.2.1 https://github.com/nodeca/js-yaml @license MIT *)
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzLnRzIiwgInNyYy9zZXR0aW5nc1RhYi50cyIsICJzcmMvbGFyay9jbGkudHMiLCAiLi4vc2hhcmVkL3NyYy90eXBlcy50cyIsICIuLi9zaGFyZWQvc3JjL3Byb3RvY29sLnRzIiwgIi4uL3NoYXJlZC9zcmMvaGFzaC50cyIsICIuLi9zaGFyZWQvc3JjL2ZpbGVuYW1lLnRzIiwgIi4uL3NoYXJlZC9zcmMvaW1hZ2UudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9zdHIudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvbnVsbF9jb3JlLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL251bGxfanNvbi50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9udWxsX3lhbWwxMS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9ib29sX2NvcmUudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvYm9vbF9qc29uLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL2Jvb2xfeWFtbDExLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL2ludF9jb3JlLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL2ludF9qc29uLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL2ludF95YW1sMTEudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvZmxvYXRfY29yZS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9mbG9hdF9qc29uLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2NhbGFyL2Zsb2F0X3lhbWwxMS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9tZXJnZS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NjYWxhci9iaW5hcnkudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9zY2FsYXIvdGltZXN0YW1wLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2VxdWVuY2Uvc2VxLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9jb21tb24vb2JqZWN0LnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvc2VxdWVuY2Uvb21hcC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL3NlcXVlbmNlL3BhaXJzLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvbWFwcGluZy9tYXAudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3RhZy9tYXBwaW5nL3NldC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvc2NoZW1hLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy90YWcvbWFwcGluZy9yZWFsX21hcC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvdGFnL21hcHBpbmcvbGVnYWN5X21hcC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvY29tbW9uL3NuaXBwZXQudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL2NvbW1vbi9leGNlcHRpb24udHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3BhcnNlci9ldmVudHMudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL3BhcnNlci9wYXJzZXJfc2NhbGFyLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9jb21tb24vdGFnbmFtZS50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9zcmMvcGFyc2VyL2NvbnN0cnVjdG9yLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9wYXJzZXIvcGFyc2VyLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9sb2FkLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9hc3Qvbm9kZXMudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL2FzdC9mcm9tX2pzLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL3NyYy9hc3QvdmlzaXQudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL2FzdC9wcmVzZW50ZXIudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL2R1bXAudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvc3JjL2FzdC9mcm9tX2V2ZW50cy50cyIsICIuLi9zaGFyZWQvc3JjL3lhbWwudHMiLCAiLi4vc2hhcmVkL3NyYy9jYWxsb3V0LnRzIiwgInNyYy9tYXBwaW5nLnRzIiwgInNyYy9zZXJ2ZXIudHMiLCAic3JjL2hhbmRsZXJzL3N0YXR1c0hhbmRsZXIudHMiLCAic3JjL2hhbmRsZXJzL3RyZWVIYW5kbGVyLnRzIiwgInNyYy9oYW5kbGVycy9mZXRjaEhhbmRsZXIudHMiLCAic3JjL2ZpbGVpby93cml0ZXIudHMiLCAic3JjL2F1dG9SZW5hbWUudHMiLCAic3JjL2hhbmRsZXJzL2NsaXBIYW5kbGVyLnRzIiwgInNyYy9oYW5kbGVycy9leGlzdHNIYW5kbGVyLnRzIiwgInNyYy9oYW5kbGVycy9wdXNoYmFja0hhbmRsZXIudHMiLCAic3JjL2NvbW1hbmRzLnRzIiwgInNyYy9mZXRjaEVudHJ5cG9pbnRzLnRzIiwgInNyYy9pbWFnZVJlbmRlci50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBPQiBcdTYzRDJcdTRFRjZcdTUxNjVcdTUzRTNcdTMwMDJcdTRGOURcdTYzNkVcdTY1QjlcdTY4NDggXHUwMEE3NC4xXHVGRjA4XHU2QTIxXHU1NzU3IEJcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdTgwNENcdThEMjNcdUZGMUFcbiAqIDEuIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RVx1RkYwOFx1OTk5Nlx1NkIyMVx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMFx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1x1RkYwOVxuICogMi4gXHU2M0EyXHU2RDRCIGxhcmstY2xpXG4gKiAzLiBcdTU0MkZcdTUyQThcdTY3MkNcdTU3MzAgSFRUUCBzZXJ2ZXJcdUZGMENcdTZDRThcdTUxOENcdThERUZcdTc1MzFcbiAqIDQuIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFx1MzAwMVx1OEJCRVx1N0Y2RVx1OTg3NVx1MzAwMVx1NTZGRVx1NzI0N1x1NkUzMlx1NjdEM1x1MzAwMVx1NTIyMFx1OTY2NFx1NzZEMVx1NTQyQ1xuICogNS4gXHU1Mzc4XHU4RjdEXHU2NUY2XHU1MDVDXHU2QjYyIHNlcnZlclxuICovXG5pbXBvcnQgeyBQbHVnaW4sIE5vdGljZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7XG4gIERFRkFVTFRfU0VUVElOR1MsXG4gIHR5cGUgRmVpc2h1U3luY1NldHRpbmdzLFxuICB0eXBlIFBsdWdpblN0YXRlLFxuICB0eXBlIFJlY2VudFN5bmMsXG59IGZyb20gJy4vc2V0dGluZ3MuanMnO1xuaW1wb3J0IHsgRmVpc2h1U3luY1NldHRpbmdUYWIgfSBmcm9tICcuL3NldHRpbmdzVGFiLmpzJztcbmltcG9ydCB7IHN0YXJ0U2VydmVyLCB0eXBlIFNlcnZlckRlcHMsIHR5cGUgUm91dGVIYW5kbGVyIH0gZnJvbSAnLi9zZXJ2ZXIuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUNsaSB9IGZyb20gJy4vbGFyay9jbGkuanMnO1xuaW1wb3J0IHsgY3JlYXRlU3RhdHVzSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlcnMvc3RhdHVzSGFuZGxlci5qcyc7XG5pbXBvcnQgeyBjcmVhdGVUcmVlSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlcnMvdHJlZUhhbmRsZXIuanMnO1xuaW1wb3J0IHsgY3JlYXRlRmV0Y2hIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9mZXRjaEhhbmRsZXIuanMnO1xuaW1wb3J0IHsgY3JlYXRlQ2xpcEhhbmRsZXIgfSBmcm9tICcuL2hhbmRsZXJzL2NsaXBIYW5kbGVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZUV4aXN0c0hhbmRsZXIgfSBmcm9tICcuL2hhbmRsZXJzL2V4aXN0c0hhbmRsZXIuanMnO1xuaW1wb3J0IHsgY3JlYXRlUHVzaGJhY2tIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9wdXNoYmFja0hhbmRsZXIuanMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJDb21tYW5kcyB9IGZyb20gJy4vY29tbWFuZHMuanMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJGZXRjaEVudHJ5cG9pbnRzIH0gZnJvbSAnLi9mZXRjaEVudHJ5cG9pbnRzLmpzJztcbmltcG9ydCB7IHJlZ2lzdGVySW1hZ2VSZW5kZXJlciwgY2xlYW51cEltYWdlQ2FjaGUgfSBmcm9tICcuL2ltYWdlUmVuZGVyLmpzJztcbmltcG9ydCB7IHJlZnJlc2hNYXBwaW5nIH0gZnJvbSAnLi9tYXBwaW5nLmpzJztcblxuZXhwb3J0IGNsYXNzIEZlaXNodVN5bmNQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5ncyE6IEZlaXNodVN5bmNTZXR0aW5ncztcbiAgc3RhdGUhOiBQbHVnaW5TdGF0ZTtcbiAgcHJpdmF0ZSBzdG9wU2VydmVyPzogKCkgPT4gUHJvbWlzZTx2b2lkPjtcblxuICBhc3luYyBvbmxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcblxuICAgIC8vIFx1OEZEMFx1ODg0Q1x1NjVGNlx1NzJCNlx1NjAwMVxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBsYXJrQ2xpUmVzb2x2ZWQ6ICcnLFxuICAgICAgbGFya0NsaVZlcnNpb246ICcnLFxuICAgICAgc2VydmVyUnVubmluZzogZmFsc2UsXG4gICAgICByZWNlbnRTeW5jczogW10gYXMgUmVjZW50U3luY1tdLFxuICAgIH07XG5cbiAgICAvLyBcdTk5OTZcdTZCMjFcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTBcdTU0MkZcdTUyQThcdTRFRTRcdTcyNENcbiAgICBpZiAoIXRoaXMuc2V0dGluZ3Muc3luY1Rva2VuKSB7XG4gICAgICB0aGlzLnNldHRpbmdzLnN5bmNUb2tlbiA9IGdlbmVyYXRlVG9rZW4oKTtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKCk7XG4gICAgfVxuXG4gICAgLy8gXHU2M0EyXHU2RDRCIGxhcmstY2xpXG4gICAgY29uc3QgbGFya0luZm8gPSByZXNvbHZlQ2xpKHRoaXMuc2V0dGluZ3MubGFya0NsaVBhdGggfHwgdW5kZWZpbmVkKTtcbiAgICBpZiAobGFya0luZm8pIHtcbiAgICAgIHRoaXMuc3RhdGUubGFya0NsaVJlc29sdmVkID0gbGFya0luZm8ucGF0aDtcbiAgICAgIHRoaXMuc3RhdGUubGFya0NsaVZlcnNpb24gPSBsYXJrSW5mby52ZXJzaW9uO1xuICAgICAgcHJvY2Vzcy5lbnYuX19MQVJLX0NMSV9QQVRIX18gPSBsYXJrSW5mby5wYXRoO1xuICAgICAgY29uc29sZS5sb2coYFtzeW5jXSBsYXJrLWNsaTogJHtsYXJrSW5mby52ZXJzaW9ufSBAICR7bGFya0luZm8ucGF0aH1gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKCdbc3luY10gbGFyay1jbGkgbm90IGZvdW5kIChuZWVkID49IDEuMC41MiknKTtcbiAgICB9XG5cbiAgICAvLyBcdThCQkVcdTdGNkVcdTk4NzVcbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IEZlaXNodVN5bmNTZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XG5cbiAgICAvLyBcdTU0N0RcdTRFRTRcbiAgICByZWdpc3RlckNvbW1hbmRzKHRoaXMpO1xuICAgIHJlZ2lzdGVyRmV0Y2hFbnRyeXBvaW50cyh0aGlzKTtcblxuICAgIC8vIFx1NTZGRVx1NzI0N1x1NkUzMlx1NjdEM1xuICAgIHJlZ2lzdGVySW1hZ2VSZW5kZXJlcih0aGlzKTtcblxuICAgIC8vIFx1NTQyRlx1NTJBOCBIVFRQIHNlcnZlclxuICAgIGF3YWl0IHRoaXMuc3RhcnRIdHRwU2VydmVyKCk7XG5cbiAgICAvLyByaWJib24gXHU1NkZFXHU2ODA3XG4gICAgdGhpcy5hZGRSaWJib25JY29uKCdyZWZyZXNoLWN3JywgJ1x1OThERVx1NEU2Nlx1NTQwQ1x1NkI2NScsIGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IHJlZnJlc2hNYXBwaW5nKHRoaXMuYXBwLCB0aGlzLnNldHRpbmdzLnNwYWNlSWQpO1xuICAgIH0pO1xuXG4gICAgLy8gXHU1NDJGXHU1MkE4XHU2NUY2XHU2RTA1XHU3NDA2XHU0RTAwXHU2QjIxXHU4RkM3XHU2NzFGXHU3RjEzXHU1QjU4XG4gICAgdGhpcy5yZWdpc3RlckV2ZW50KFxuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9uKCdsYXlvdXQtcmVhZHknLCAoKSA9PiB7XG4gICAgICAgIGNsZWFudXBJbWFnZUNhY2hlKHRoaXMsIHRoaXMuc2V0dGluZ3MuY2FjaGVDbGVhbnVwKS5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICB9KSxcbiAgICApO1xuXG4gICAgY29uc29sZS5sb2coYFtzeW5jXSBmZWlzaHUtc3luYyBsb2FkZWQgb24gcG9ydCAke3RoaXMuc2V0dGluZ3MucG9ydH1gKTtcbiAgfVxuXG4gIGFzeW5jIG9udW5sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLnN0b3BTZXJ2ZXIpIHtcbiAgICAgIGF3YWl0IHRoaXMuc3RvcFNlcnZlcigpO1xuICAgICAgdGhpcy5zdG9wU2VydmVyID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnW3N5bmNdIGZlaXNodS1zeW5jIHVubG9hZGVkJyk7XG4gIH1cblxuICBhc3luYyBsb2FkU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XG4gIH1cblxuICBhc3luYyBzYXZlU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcbiAgfVxuXG4gIC8qKiBcdTU0MkZcdTUyQTggSFRUUCBzZXJ2ZXJcdUZGMENcdTZDRThcdTUxOENcdTYyNDBcdTY3MDlcdThERUZcdTc1MzFcdTMwMDIgKi9cbiAgcHJpdmF0ZSBhc3luYyBzdGFydEh0dHBTZXJ2ZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgcm91dGVzID0gbmV3IE1hcDxzdHJpbmcsIFJvdXRlSGFuZGxlcj4oKTtcblxuICAgIGNvbnN0IGRlcHM6IFNlcnZlckRlcHMgPSB7XG4gICAgICB2YWxpZGF0ZVRva2VuOiAodG9rZW4pID0+IHRva2VuID09PSB0aGlzLnNldHRpbmdzLnN5bmNUb2tlbixcbiAgICAgIHJvdXRlcyxcbiAgICB9O1xuXG4gICAgLy8gXHU2Q0U4XHU1MThDXHU4REVGXHU3NTMxXG4gICAgcm91dGVzLnNldCgnL3N0YXR1cycsIGNyZWF0ZVN0YXR1c0hhbmRsZXIodGhpcy5tYW5pZmVzdC52ZXJzaW9uLCB0aGlzLmFwcC52YXVsdC5nZXROYW1lKCksIHRoaXMuc3RhdGUpKTtcbiAgICByb3V0ZXMuc2V0KCcvdHJlZScsIGNyZWF0ZVRyZWVIYW5kbGVyKHRoaXMuYXBwKSk7XG4gICAgcm91dGVzLnNldCgnL2ZldGNoJywgY3JlYXRlRmV0Y2hIYW5kbGVyKHtcbiAgICAgIGFwcDogdGhpcy5hcHAsXG4gICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5ncyxcbiAgICAgIHN0YXRlOiB0aGlzLnN0YXRlLFxuICAgICAgbm90aWNlOiAobSkgPT4gbmV3IE5vdGljZShtKSxcbiAgICB9KSk7XG4gICAgcm91dGVzLnNldCgnL2NsaXAnLCBjcmVhdGVDbGlwSGFuZGxlcih7XG4gICAgICBhcHA6IHRoaXMuYXBwLFxuICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3MsXG4gICAgICBub3RpY2U6IChtKSA9PiBuZXcgTm90aWNlKG0pLFxuICAgIH0pKTtcbiAgICByb3V0ZXMuc2V0KCcvZXhpc3RzJywgY3JlYXRlRXhpc3RzSGFuZGxlcih0aGlzLmFwcCkpO1xuICAgIHJvdXRlcy5zZXQoJy9wdXNoYmFjaycsIGNyZWF0ZVB1c2hiYWNrSGFuZGxlcih7XG4gICAgICBhcHA6IHRoaXMuYXBwLFxuICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3MsXG4gICAgICBub3RpY2U6IChtKSA9PiBuZXcgTm90aWNlKG0pLFxuICAgIH0pKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0b3AgfSA9IGF3YWl0IHN0YXJ0U2VydmVyKHRoaXMuc2V0dGluZ3MucG9ydCwgZGVwcyk7XG4gICAgICB0aGlzLnN0b3BTZXJ2ZXIgPSBzdG9wO1xuICAgICAgdGhpcy5zdGF0ZS5zZXJ2ZXJSdW5uaW5nID0gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnN0IG1zZyA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKTtcbiAgICAgIG5ldyBOb3RpY2UoYFx1Mjc0QyBIVFRQIHNlcnZlciBcdTU0MkZcdTUyQThcdTU5MzFcdThEMjVcdUZGMDhcdTdBRUZcdTUzRTMgJHt0aGlzLnNldHRpbmdzLnBvcnR9XHVGRjA5XHVGRjFBJHttc2d9YCk7XG4gICAgICBjb25zb2xlLmVycm9yKCdbc3luY10gc2VydmVyIHN0YXJ0IGZhaWxlZDonLCBlcnIpO1xuICAgIH1cbiAgfVxufVxuXG4vKiogXHU3NTFGXHU2MjEwIDMyIFx1NUI1N1x1ODI4MiBoZXggXHU0RUU0XHU3MjRDXHUzMDAyICovXG5mdW5jdGlvbiBnZW5lcmF0ZVRva2VuKCk6IHN0cmluZyB7XG4gIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoMzIpO1xuICAoZ2xvYmFsVGhpcy5jcnlwdG8gYXMgQ3J5cHRvKS5nZXRSYW5kb21WYWx1ZXMoYnl0ZXMpO1xuICByZXR1cm4gQXJyYXkuZnJvbShieXRlcykubWFwKGIgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XG59XG5cbi8vIE9ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NTE2NVx1NTNFM1x1RkYxQVx1NUZDNVx1OTg3Qlx1OUVEOFx1OEJBNFx1NUJGQ1x1NTFGQSBQbHVnaW4gXHU1QjUwXHU3QzdCXG5leHBvcnQgZGVmYXVsdCBGZWlzaHVTeW5jUGx1Z2luO1xuIiwgIi8qKlxuICogT0IgXHU2M0QyXHU0RUY2XHU4QkJFXHU3RjZFXHU2M0E1XHU1M0UzICsgXHU5RUQ4XHU4QkE0XHU1MDNDXHUzMDAyXG4gKiBcdTRGOURcdTYzNkVcdTY1QjlcdTY4NDggXHUwMEE3MTBcdUZGMDhTZXR0aW5nc1RhYlx1RkYwOVx1MzAwMlxuICovXG5pbXBvcnQgdHlwZSB7IFRyZWVOb2RlIH0gZnJvbSAnQHN5bmMvc2hhcmVkJztcblxuZXhwb3J0IGludGVyZmFjZSBGZWlzaHVTeW5jU2V0dGluZ3Mge1xuICAvKiogXHU2NzJDXHU1NzMwIEhUVFAgc2VydmVyIFx1N0FFRlx1NTNFM1x1RkYwOFx1OUVEOFx1OEJBNCA0NTY3XHVGRjA5XHUzMDAyICovXG4gIHBvcnQ6IG51bWJlcjtcbiAgLyoqIFx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1x1RkYwODMyIFx1NUI1N1x1ODI4MiBoZXhcdUZGMENcdTk5OTZcdTZCMjFcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTBcdUZGMDlcdTMwMDIgKi9cbiAgc3luY1Rva2VuOiBzdHJpbmc7XG4gIC8qKiBsYXJrLWNsaSBcdThERUZcdTVGODRcdUZGMDhcdTdBN0E9XHU4MUVBXHU1MkE4XHU2M0EyXHU2RDRCXHVGRjA5XHUzMDAyICovXG4gIGxhcmtDbGlQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTlFRDhcdThCQTRcdTg0M0RcdTU3MzBcdTc2RUVcdTVGNTVcdUZGMDhcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHVGRjA5XHUzMDAyICovXG4gIGRlZmF1bHREaXI6IHN0cmluZztcbiAgLyoqIFx1ODFFQVx1NTJBOFx1ODlFNlx1NTNEMSBhdXRvLXJlbmFtZSBcdTdGMTZcdTc4MDFcdTUyMDZcdTkxNERcdTMwMDIgKi9cbiAgYXV0b1JlbmFtZTogYm9vbGVhbjtcbiAgLyoqIFx1ODFFQVx1NTJBOFx1NzY3Qlx1OEJCMFx1NTIyMFx1OTY2NFx1RkYwOFx1NTE5OVx1OThERVx1NEU2Nlx1NTkxQVx1N0VGNFx1ODg2OFx1NjgzQ1x1RkYwOVx1MzAwMiAqL1xuICBhdXRvRGVsZXRlUmVnaXN0cnk6IGJvb2xlYW47XG4gIC8qKiBcdTU2RkVcdTcyNDdcdTdGMTNcdTVCNThcdTZFMDVcdTc0MDZcdTU0NjhcdTY3MUZcdTMwMDIgKi9cbiAgY2FjaGVDbGVhbnVwOiAnZGFpbHknIHwgJ3dlZWtseScgfCAnbW9udGhseScgfCAnbmV2ZXInO1xuICAvKiogXHU0RkREXHU3NTU5XHU4OEM1XHU5OTcwXHU1NkZFXHU3MjQ3XHUzMDAyICovXG4gIGtlZXBEZWNvcmF0aXZlSW1hZ2VzOiBib29sZWFuO1xuICAvKiogXHU5OERFXHU0RTY2XHU3N0U1XHU4QkM2XHU1RTkzIHNwYWNlX2lkXHVGRjA4XHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0XHU3NTI4XHVGRjA5XHUzMDAyICovXG4gIHNwYWNlSWQ6IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1M6IEZlaXNodVN5bmNTZXR0aW5ncyA9IHtcbiAgcG9ydDogNDU2NyxcbiAgc3luY1Rva2VuOiAnJyxcbiAgbGFya0NsaVBhdGg6ICcnLFxuICBkZWZhdWx0RGlyOiAnMFx1RkUwRlx1MjBFM1x1OEY5M1x1NTE2NScsXG4gIGF1dG9SZW5hbWU6IHRydWUsXG4gIGF1dG9EZWxldGVSZWdpc3RyeTogdHJ1ZSxcbiAgY2FjaGVDbGVhbnVwOiAnd2Vla2x5JyxcbiAga2VlcERlY29yYXRpdmVJbWFnZXM6IHRydWUsXG4gIHNwYWNlSWQ6ICc3NjUxMzE0MTUwMDYwMDY3ODAzJyxcbn07XG5cbi8qKiBcdTYzRDJcdTRFRjZcdThGRDBcdTg4NENcdTY1RjZcdTcyQjZcdTYwMDFcdUZGMDhcdTRFMERcdTYzMDFcdTRFNDVcdTUzMTZcdUZGMDlcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGx1Z2luU3RhdGUge1xuICAvKiogbGFyay1jbGkgXHU1QjlFXHU5NjQ1XHU4REVGXHU1Rjg0XHVGRjA4XHU2M0EyXHU2RDRCL1x1OEJCRVx1N0Y2RVx1NTQwRVx1NzY4NFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOVx1MzAwMiAqL1xuICBsYXJrQ2xpUmVzb2x2ZWQ6IHN0cmluZztcbiAgLyoqIGxhcmstY2xpIFx1NzI0OFx1NjcyQ1x1NTNGN1x1RkYwOFx1NTk4MiBcIjEuMC41MlwiXHVGRjA5XHUzMDAyICovXG4gIGxhcmtDbGlWZXJzaW9uOiBzdHJpbmc7XG4gIC8qKiBIVFRQIHNlcnZlciBcdTY2MkZcdTU0MjZcdTZCNjNcdTU3MjhcdThGRDBcdTg4NENcdTMwMDIgKi9cbiAgc2VydmVyUnVubmluZzogYm9vbGVhbjtcbiAgLyoqIFx1NjcwMFx1OEZEMVx1NTQwQ1x1NkI2NVx1OEJCMFx1NUY1NVx1RkYwOFx1NTE4NVx1NUI1OFx1NEUyRFx1RkYwQ1x1NjcwMFx1NTkxQSA1MCBcdTY3NjFcdUZGMDlcdTMwMDIgKi9cbiAgcmVjZW50U3luY3M6IFJlY2VudFN5bmNbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZWNlbnRTeW5jIHtcbiAgdGltZTogc3RyaW5nO1xuICBub2RlX3Rva2VuOiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHBhdGg6IHN0cmluZztcbiAgYWN0aW9uOiAnY3JlYXRlZCcgfCAndXBkYXRlZCcgfCAnZXJyb3InO1xuICBlcnJvcj86IHN0cmluZztcbn1cbiIsICIvKipcbiAqIE9CIFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1NzU0Q1x1OTc2Mlx1MzAwMlx1NEY5RFx1NjM2RVx1NjVCOVx1Njg0OCBcdTAwQTcxMFx1RkYwOFNldHRpbmdzVGFiXHVGRjA5XHUzMDAyXG4gKlxuICogXHU3QUVGXHU1M0UzXHUzMDAxXHU1NDJGXHU1MkE4XHU0RUU0XHU3MjRDXHVGRjA4XHU3NTFGXHU2MjEwL1x1OTFDRFx1N0Y2RS9cdTU5MERcdTUyMzZcdUZGMDlcdTMwMDFsYXJrLWNsaSBcdThERUZcdTVGODRcdTMwMDFcdTlFRDhcdThCQTRcdTc2RUVcdTVGNTVcdTMwMDFcdTVGMDBcdTUxNzNcdTMwMDFcdTdGMTNcdTVCNThcdTU0NjhcdTY3MUZcdTMwMDJcbiAqL1xuaW1wb3J0IHsgQXBwLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nLCBOb3RpY2UsIHNldEljb24gfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IEZlaXNodVN5bmNQbHVnaW4gfSBmcm9tICcuL21haW4uanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUNsaSB9IGZyb20gJy4vbGFyay9jbGkuanMnO1xuaW1wb3J0IHsgcmVmcmVzaE1hcHBpbmcgfSBmcm9tICcuL21hcHBpbmcuanMnO1xuXG5leHBvcnQgY2xhc3MgRmVpc2h1U3luY1NldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgcGx1Z2luOiBGZWlzaHVTeW5jUGx1Z2luO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IEZlaXNodVN5bmNQbHVnaW4pIHtcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gIH1cblxuICBkaXNwbGF5KCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG4gICAgY29udGFpbmVyRWwuZW1wdHkoKTtcblxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ1x1OThERVx1NEU2Nlx1NTQwQ1x1NkI2NVx1OEJCRVx1N0Y2RScgfSk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDAgXHU5MDFBXHU0RkUxIFx1MjUwMFx1MjUwMFxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NjcyQ1x1NTczMFx1N0FFRlx1NTNFMycpXG4gICAgICAuc2V0RGVzYygnXHU2RDRGXHU4OUM4XHU1NjY4XHU2MjY5XHU1QzU1XHU4RkRFXHU2M0E1IE9CIFx1NjNEMlx1NEVGNlx1NzY4NFx1N0FFRlx1NTNFM1x1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRiBPQiBcdTYyMTZcdTkxQ0RcdTY1QjBcdTUyQTBcdThGN0RcdTYzRDJcdTRFRjZcdUZGMDknKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0VmFsdWUoU3RyaW5nKHRoaXMucGx1Z2luLnNldHRpbmdzLnBvcnQpKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvcnQgPSBwYXJzZUludCh2YWx1ZSwgMTApO1xuICAgICAgICAgICAgaWYgKHBvcnQgPiAwICYmIHBvcnQgPCA2NTUzNikge1xuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5wb3J0ID0gcG9ydDtcbiAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgLy8gXHU1NDJGXHU1MkE4XHU0RUU0XHU3MjRDXG4gICAgY29uc3QgdG9rZW5TZXR0aW5nID0gbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU1NDJGXHU1MkE4XHU0RUU0XHU3MjRDJylcbiAgICAgIC5zZXREZXNjKCdcdTZENEZcdTg5QzhcdTU2NjhcdTYyNjlcdTVDNTVcdTk5OTZcdTZCMjFcdThGREVcdTYzQTVcdTk3MDBcdTdDOThcdThEMzRcdTZCNjRcdTRFRTRcdTcyNENcdTMwMDJcdTcwQjlcdTUxRkJcdTU5MERcdTUyMzZcdTU0MEVcdTdDOThcdThEMzRcdTUyMzBcdTYyNjlcdTVDNTVcdTVGMzlcdTdBOTdcdTMwMDInKTtcblxuICAgIHRva2VuU2V0dGluZy5hZGRUZXh0KCh0ZXh0KSA9PiB7XG4gICAgICB0ZXh0XG4gICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jVG9rZW4pXG4gICAgICAgIC5zZXREaXNhYmxlZCh0cnVlKSAvLyBcdTUzRUFcdThCRkJcdUZGMENcdTkwN0ZcdTUxNERcdTYyNEJcdTY1MzlcbiAgICAgICAgLmlucHV0RWwuc3R5bGUuZm9udEZhbWlseSA9ICdtb25vc3BhY2UnO1xuICAgIH0pO1xuXG4gICAgdG9rZW5TZXR0aW5nLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgYnRuXG4gICAgICAgIC5zZXRCdXR0b25UZXh0KCdcdTU5MERcdTUyMzYnKVxuICAgICAgICAuc2V0VG9vbHRpcCgnXHU1OTBEXHU1MjM2XHU0RUU0XHU3MjRDXHU1MjMwXHU1MjZBXHU4RDM0XHU2NzdGJylcbiAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRoaXMucGx1Z2luLnNldHRpbmdzLnN5bmNUb2tlbik7XG4gICAgICAgICAgbmV3IE5vdGljZSgnXHUyNzA1IFx1NEVFNFx1NzI0Q1x1NURGMlx1NTkwRFx1NTIzNicpO1xuICAgICAgICB9KSxcbiAgICApO1xuXG4gICAgdG9rZW5TZXR0aW5nLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgYnRuXG4gICAgICAgIC5zZXRCdXR0b25UZXh0KCdcdTkxQ0RcdTdGNkUnKVxuICAgICAgICAuc2V0VG9vbHRpcCgnXHU3NTFGXHU2MjEwXHU2NUIwXHU0RUU0XHU3MjRDXHVGRjA4XHU2MjY5XHU1QzU1XHU5NzAwXHU5MUNEXHU2NUIwXHU3Qzk4XHU4RDM0XHVGRjA5JylcbiAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnN5bmNUb2tlbiA9IGdlbmVyYXRlVG9rZW4oKTtcbiAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcbiAgICAgICAgICBuZXcgTm90aWNlKCdcdUQ4M0RcdUREMDQgXHU0RUU0XHU3MjRDXHU1REYyXHU5MUNEXHU3RjZFJyk7XG4gICAgICAgIH0pLFxuICAgICk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDAgbGFyay1jbGkgXHUyNTAwXHUyNTAwXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnbGFyay1jbGknIH0pO1xuXG4gICAgY29uc3QgbGFya0luZm8gPSBjb250YWluZXJFbC5jcmVhdGVFbCgncCcsIHtcbiAgICAgIHRleHQ6IGBcdTcyQjZcdTYwMDFcdUZGMUEke3RoaXMucGx1Z2luLnN0YXRlLmxhcmtDbGlSZXNvbHZlZCA/ICdcdTI3MDUgJyArIHRoaXMucGx1Z2luLnN0YXRlLmxhcmtDbGlWZXJzaW9uIDogJ1x1Mjc0QyBcdTY3MkFcdTYyN0VcdTUyMzAnfWAsXG4gICAgICBjbHM6ICdzZXR0aW5nLWl0ZW0tZGVzY3JpcHRpb24nLFxuICAgIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnbGFyay1jbGkgXHU4REVGXHU1Rjg0JylcbiAgICAgIC5zZXREZXNjKCdcdTc1NTlcdTdBN0FcdTUyMTlcdTgxRUFcdTUyQThcdTYzQTJcdTZENEJcdTMwMDJcdTU5ODJcdTgxRUFcdTUyQThcdTYzQTJcdTZENEJcdTU5MzFcdThEMjVcdUZGMENcdThCRjdcdTYyNEJcdTUyQThcdTU4NkJcdTUxOTlcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdTMwMDInKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubGFya0NsaVBhdGgpXG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdcdTgxRUFcdTUyQThcdTYzQTJcdTZENEInKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmxhcmtDbGlQYXRoID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KSxcbiAgICAgIClcbiAgICAgIC5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgICAgYnRuXG4gICAgICAgICAgLnNldEJ1dHRvblRleHQoJ1x1NkQ0Qlx1OEJENScpXG4gICAgICAgICAgLnNldFRvb2x0aXAoJ1x1OTFDRFx1NjVCMFx1NjNBMlx1NkQ0QiBsYXJrLWNsaScpXG4gICAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gcmVzb2x2ZUNsaSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5sYXJrQ2xpUGF0aCB8fCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zdGF0ZS5sYXJrQ2xpUmVzb2x2ZWQgPSByZXN1bHQucGF0aDtcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc3RhdGUubGFya0NsaVZlcnNpb24gPSByZXN1bHQudmVyc2lvbjtcbiAgICAgICAgICAgICAgbGFya0luZm8uc2V0VGV4dChgXHU3MkI2XHU2MDAxXHVGRjFBXHUyNzA1ICR7cmVzdWx0LnZlcnNpb259YCk7XG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoYFx1MjcwNSBcdTYyN0VcdTUyMzAgJHtyZXN1bHQudmVyc2lvbn1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnN0YXRlLmxhcmtDbGlSZXNvbHZlZCA9ICcnO1xuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zdGF0ZS5sYXJrQ2xpVmVyc2lvbiA9ICcnO1xuICAgICAgICAgICAgICBsYXJrSW5mby5zZXRUZXh0KCdcdTcyQjZcdTYwMDFcdUZGMUFcdTI3NEMgXHU2NzJBXHU2MjdFXHU1MjMwJyk7XG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoJ1x1Mjc0QyBcdTY3MkFcdTYyN0VcdTUyMzAgbGFyay1jbGlcdUZGMDhcdTk3MDAgXHUyMjY1IDEuMC41Mlx1RkYwOScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgIC8vIFx1MjUwMFx1MjUwMCBcdTU0MENcdTZCNjVcdTg4NENcdTRFM0EgXHUyNTAwXHUyNTAwXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnXHU1NDBDXHU2QjY1XHU4ODRDXHU0RTNBJyB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1OUVEOFx1OEJBNFx1ODQzRFx1NTczMFx1NzZFRVx1NUY1NScpXG4gICAgICAuc2V0RGVzYygnXHU2MjY5XHU1QzU1XHU2NzJBXHU2MzA3XHU1QjlBXHU3NkVFXHU1RjU1XHU2NUY2XHVGRjBDXHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzXHU4NDNEXHU1NzMwXHU1MjMwXHU2QjY0XHU3NkVFXHU1RjU1XHVGRjA4XHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0RGlyKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHREaXIgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1ODFFQVx1NTJBOFx1NTIwNlx1OTE0RFx1N0YxNlx1NzgwMScpXG4gICAgICAuc2V0RGVzYygnXHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzXHU4NDNEXHU1NzMwXHU1NDBFXHU4MUVBXHU1MkE4XHU4OUU2XHU1M0QxIGF1dG8tcmVuYW1lIFx1N0YxNlx1NzgwMVx1NTIwNlx1OTE0RCcpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdXRvUmVuYW1lKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9SZW5hbWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NTIyMFx1OTY2NFx1ODFFQVx1NTJBOFx1NzY3Qlx1OEJCMCcpXG4gICAgICAuc2V0RGVzYygnXHU1MjIwXHU5NjY0XHU1NDJCIGZlaXNodV9pZCBcdTc2ODRcdTY1ODdcdTRFRjZcdTY1RjZcdUZGMENcdTgxRUFcdTUyQThcdTc2N0JcdThCQjBcdTUyMzBcdTk4REVcdTRFNjZcdTU5MUFcdTdFRjRcdTg4NjhcdTY4M0MnKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b0RlbGV0ZVJlZ2lzdHJ5KVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9EZWxldGVSZWdpc3RyeSA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU0RkREXHU3NTU5XHU4OEM1XHU5OTcwXHU1NkZFXHU3MjQ3JylcbiAgICAgIC5zZXREZXNjKCdcdTk4REVcdTRFNjZcdTYzOTJcdTcyNDhcdTcyNjlcdTY1OTlcdUZGMDgxMzVcdTdGMTZcdThGOTFcdTU2NjhcdTk4Q0VcdTY4M0NcdTdCNDlcdTdFQUZcdTU2RkVcdTcyNDdcdUZGMDlcdTY2MkZcdTU0MjZcdTg0M0RcdTU3MzBcdTUyMzAgT0InKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mua2VlcERlY29yYXRpdmVJbWFnZXMpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Mua2VlcERlY29yYXRpdmVJbWFnZXMgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NTZGRVx1NzI0N1x1N0YxM1x1NUI1OFx1NkUwNVx1NzQwNlx1NTQ2OFx1NjcxRicpXG4gICAgICAuc2V0RGVzYygnZmVpc2h1Oi8vdG9rZW4gXHU5ODg0XHU4OUM4XHU1NkZFXHU3MjQ3XHU3Njg0XHU2NzJDXHU1NzMwXHU3RjEzXHU1QjU4XHU0RkREXHU3NTU5XHU2NUY2XHU5NTdGJylcbiAgICAgIC5hZGREcm9wZG93bigoZHJvcGRvd24pID0+XG4gICAgICAgIGRyb3Bkb3duXG4gICAgICAgICAgLmFkZE9wdGlvbignZGFpbHknLCAnXHU2QkNGXHU1OTI5JylcbiAgICAgICAgICAuYWRkT3B0aW9uKCd3ZWVrbHknLCAnXHU2QkNGXHU1NDY4JylcbiAgICAgICAgICAuYWRkT3B0aW9uKCdtb250aGx5JywgJ1x1NkJDRlx1NjcwOCcpXG4gICAgICAgICAgLmFkZE9wdGlvbignbmV2ZXInLCAnXHU2QzM4XHU0RTBEJylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuY2FjaGVDbGVhbnVwKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmNhY2hlQ2xlYW51cCA9IHZhbHVlIGFzIEZlaXNodVN5bmNTZXR0aW5nc1snY2FjaGVDbGVhbnVwJ107XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDAgXHU5OERFXHU0RTY2XHU3N0U1XHU4QkM2XHU1RTkzIFx1MjUwMFx1MjUwMFxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1x1OThERVx1NEU2Nlx1NzdFNVx1OEJDNlx1NUU5MycgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTc3RTVcdThCQzZcdTVFOTMgc3BhY2VfaWQnKVxuICAgICAgLnNldERlc2MoJ1x1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1NzUyOFx1MzAwMlx1NjVCMFx1NzdFNVx1OEJDNlx1NUU5M1x1OUVEOFx1OEJBNCA3NjUxMzE0MTUwMDYwMDY3ODAzJylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnNwYWNlSWQpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc3BhY2VJZCA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApXG4gICAgICAuYWRkQnV0dG9uKChidG4pID0+XG4gICAgICAgIGJ0blxuICAgICAgICAgIC5zZXRCdXR0b25UZXh0KCdcdTUyMzdcdTY1QjBcdTY2MjBcdTVDMDQnKVxuICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IHJlZnJlc2hNYXBwaW5nKHRoaXMuYXBwLCB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zcGFjZUlkKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG4gIH1cbn1cblxuaW1wb3J0IHR5cGUgeyBGZWlzaHVTeW5jU2V0dGluZ3MgfSBmcm9tICcuL3NldHRpbmdzLmpzJztcblxuLyoqIFx1NzUxRlx1NjIxMCAzMiBcdTVCNTdcdTgyODIgaGV4IFx1NEVFNFx1NzI0Q1x1MzAwMiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVUb2tlbigpOiBzdHJpbmcge1xuICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KDMyKTtcbiAgKGdsb2JhbFRoaXMuY3J5cHRvID8/IChyZXF1aXJlKCdub2RlOmNyeXB0bycpIGFzIHsgd2ViY3J5cHRvOiBDcnlwdG8gfSkpLndlYmNyeXB0by5nZXRSYW5kb21WYWx1ZXMoYnl0ZXMpO1xuICByZXR1cm4gQXJyYXkuZnJvbShieXRlcykubWFwKGIgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XG59XG4iLCAiLyoqXG4gKiBsYXJrLWNsaSBcdTVDMDFcdTg4QzVcdTVDNDJcdTMwMDJcdTRGOURcdTYzNkUgYHJjLXgvc2NyaXB0cy9yY19lbnYucHlgICsgYDAzX1x1NjgzQ1x1NUYwRlx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU1MzQxL1x1NTM0MVx1NEUwMFx1MzAwMlxuICpcbiAqIC0gcmVzb2x2ZUNsaSgpXHVGRjFBXHU1MDE5XHU5MDA5XHU4REVGXHU1Rjg0XHU2M0EyXHU2RDRCXHVGRjBDXHU3MjQ4XHU2NzJDXHU2ODIxXHU5QThDIFx1MjI2NSAxLjAuNTJcbiAqIC0gcnVuKClcdUZGMUFcdTdFREZcdTRFMDAgc3Bhd25TeW5jIFx1NTMwNVx1ODhDNVx1RkYwQ1x1OTFDRFx1OEJENVx1MzAwMVx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1MzAwMWVtb2ppIFx1NkUwNVx1NkQxN1x1MzAwMX5cdTUzQ0RcdThGNkNcdTRFNDlcdTMwMDFKU09OIFx1NTMwNVx1ODhDNVx1ODlFM1x1NTMwNVxuICogLSBcdTY4MDdcdTk4OThcdTRGRUVcdTU5MERcdUZGMUFvdmVyd3JpdGUgXHU1NDBFXHU4RkZEXHU1MkEwIHN0cl9yZXBsYWNlIFx1NEZFRSA8dGl0bGU+XG4gKlxuICogXHU1OTFBXHU4QkJFXHU1OTA3XHU5MDAyXHU5MTREXHU1MTczXHU5NTJFXHU3MEI5XHVGRjFBXG4gKiAtIEdVSSBcdTU0MkZcdTUyQThcdTc2ODQgT2JzaWRpYW4gXHU2MkZGXHU0RTBEXHU1MjMwXHU3RUM4XHU3QUVGIFBBVEhcdUZGMDhudm0vaG9tZWJyZXcgXHU0RTBEXHU1NzI4XHU1MTg1XHVGRjA5XHVGRjBDXHU2NTQ1IHNwYXduIFx1NjVGNlx1NkNFOFx1NTE2NVx1NTg5RVx1NUYzQSBQQVRIXG4gKiAtIG52bSBcdTc2RUVcdTVGNTVcdTYzMDlcdTY1NzBcdTVCNTdcdTVFOEZcdTUzRDYgbGF0ZXN0XHVGRjA4XHU1QjU3XHU3QjI2XHU0RTMyIHNvcnQgXHU0RjFBXHU4QkE5IHY5ID4gdjEwXHVGRjA5XG4gKi9cbmltcG9ydCB7IGV4ZWNGaWxlU3luYywgdHlwZSBFeGVjU3luY09wdGlvbnMgfSBmcm9tICdub2RlOmNoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0ICogYXMgb3MgZnJvbSAnbm9kZTpvcyc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzLCB1bmVzY2FwZUZlaXNodVRpbGRlIH0gZnJvbSAnQHN5bmMvc2hhcmVkJztcblxuY29uc3QgTUlOX1ZFUlNJT04gPSBbMSwgMCwgNTJdO1xuXG4vKipcbiAqIFx1Njc4NFx1OTAyMFx1NTg5RVx1NUYzQSBQQVRIXHVGRjFBXHU1NzI4XHU4RkRCXHU3QTBCXHU3M0IwXHU2NzA5IFBBVEggXHU1MjREXHU4RkZEXHU1MkEwIG52bS9sYXRlc3QvYmluICsgXHU1RTM4XHU4OUMxXHU1Qjg5XHU4OEM1XHU0RjREXHUzMDAyXG4gKiBcdTc1MjhcdTRFOEUgR1VJIFx1NTQyRlx1NTJBOFx1NzY4NCBPYnNpZGlhblx1RkYwOFBBVEggXHU3RjNBIG52bS9ob21lYnJld1x1RkYwQ1x1NUJGQ1x1ODFGNCAjIS91c3IvYmluL2VudiBub2RlIFx1NjI3RVx1NEUwRFx1NTIzMCBub2RlXHVGRjA5XHUzMDAyXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkRW5oYW5jZWRQYXRoKCk6IHN0cmluZyB7XG4gIGNvbnN0IGV4dHJhOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBudm0gbGF0ZXN0IG5vZGUgXHU3Njg0IGJpblxuICBjb25zdCBudm1CYXNlID0gcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJy5udm0vdmVyc2lvbnMvbm9kZScpO1xuICB0cnkge1xuICAgIGNvbnN0IGRpcnMgPSBmcy5yZWFkZGlyU3luYyhudm1CYXNlKTtcbiAgICAvLyBcdTY1NzBcdTVCNTdcdTVFOEZcdTUzRDZcdTY3MDBcdTU5MjdcdTcyNDhcdTY3MkNcdUZGMDh2OSB2cyB2MTAgXHU1QjU3XHU3QjI2XHU0RTMyXHU2MzkyXHU1RThGXHU0RjFBXHU5NTE5XHVGRjA5XG4gICAgY29uc3QgbGF0ZXN0ID0gZGlyc1xuICAgICAgLm1hcChkID0+ICh7IG5hbWU6IGQsIHZlcjogcGFyc2VJbnQoZC5yZXBsYWNlKC9edi8sICcnKSwgMTApIH0pKVxuICAgICAgLmZpbHRlcih4ID0+ICFOdW1iZXIuaXNOYU4oeC52ZXIpKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGEudmVyIC0gYi52ZXIpXG4gICAgICAucG9wKCk7XG4gICAgaWYgKGxhdGVzdCkgZXh0cmEucHVzaChwYXRoLmpvaW4obnZtQmFzZSwgbGF0ZXN0Lm5hbWUsICdiaW4nKSk7XG4gIH0gY2F0Y2ggeyAvKiBudm0gXHU2NzJBXHU4OEM1ICovIH1cbiAgZXh0cmEucHVzaChwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnLmxvY2FsJywgJ2JpbicpKTtcbiAgZXh0cmEucHVzaCgnL29wdC9ob21lYnJldy9iaW4nKTtcbiAgZXh0cmEucHVzaCgnL3Vzci9sb2NhbC9iaW4nKTtcbiAgY29uc3QgYmFzZSA9IHByb2Nlc3MuZW52LlBBVEggPz8gJyc7XG4gIHJldHVybiBbLi4uZXh0cmEuZmlsdGVyKHAgPT4gIWJhc2Uuc3BsaXQocGF0aC5kZWxpbWl0ZXIpLmluY2x1ZGVzKHApKSwgYmFzZV0uam9pbihwYXRoLmRlbGltaXRlcik7XG59XG5cbi8qKiBydW4oKSBcdTUxNzFcdTc1MjhcdTc2ODRcdTU4OUVcdTVGM0EgUEFUSFx1RkYwOFx1OTk5Nlx1NkIyMVx1ODlFM1x1Njc5MFx1NTQwRVx1N0YxM1x1NUI1OFx1RkYwOVx1MzAwMiAqL1xubGV0IGVuaGFuY2VkUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBnZXRFbmhhbmNlZFBhdGgoKTogc3RyaW5nIHtcbiAgcmV0dXJuIGVuaGFuY2VkUGF0aCA/Pz0gYnVpbGRFbmhhbmNlZFBhdGgoKTtcbn1cblxuLyoqXG4gKiBcdTU3MjhcdTU4OUVcdTVGM0EgUEFUSCBcdTRFMEJcdTY3RTVcdTYyN0VcdTUzRUZcdTYyNjdcdTg4NENcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdUZGMDhcdTY2RkZcdTRFRTMgYHdoaWNoYFx1RkYwQ1x1OTA3Rlx1NTE0RCBHVUkgXHU4RkRCXHU3QTBCIFBBVEggXHU3RjNBXHU1OTMxXHVGRjA5XHUzMDAyXG4gKiBcdTc1MjggZXhlY0ZpbGVTeW5jIFx1NEUwRFx1OEQ3MCBzaGVsbFx1RkYwQ1x1NjZGNFx1N0EzM1x1MzAwMlxuICovXG5mdW5jdGlvbiB3aGljaChjbWQ6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICAvLyBcdTUxNDhcdThCRDVcdTVGNTNcdTUyNEQgUEFUSFx1RkYwOFx1N0VDOFx1N0FFRlx1NTczQVx1NjY2Rlx1RkYwOVxuICB0cnkge1xuICAgIGNvbnN0IGZvdW5kID0gZXhlY0ZpbGVTeW5jKCcvdXNyL2Jpbi93aGljaCcsIFtjbWRdLCB7XG4gICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgICAgdGltZW91dDogMzAwMCxcbiAgICAgIGVudjogeyAuLi5wcm9jZXNzLmVudiB9LFxuICAgIH0pLnRyaW0oKTtcbiAgICBpZiAoZm91bmQpIHJldHVybiBmb3VuZDtcbiAgfSBjYXRjaCB7IC8qIGZhbGwgdGhyb3VnaCAqLyB9XG4gIC8vIFx1NTE4RFx1OEJENVx1NTg5RVx1NUYzQSBQQVRIXHVGRjA4R1VJIFx1NTczQVx1NjY2Rlx1RkYwOVxuICB0cnkge1xuICAgIGNvbnN0IGZvdW5kID0gZXhlY0ZpbGVTeW5jKCcvdXNyL2Jpbi93aGljaCcsIFtjbWRdLCB7XG4gICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgICAgdGltZW91dDogMzAwMCxcbiAgICAgIGVudjogeyAuLi5wcm9jZXNzLmVudiwgUEFUSDogZ2V0RW5oYW5jZWRQYXRoKCkgfSxcbiAgICB9KS50cmltKCk7XG4gICAgcmV0dXJuIGZvdW5kIHx8IG51bGw7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKiBcdTUwMTlcdTkwMDlcdThERUZcdTVGODRcdUZGMDhcdTc5RkJcdTY5MEQgcmNfZW52LnB5IHJlc29sdmVfY2xpXHVGRjA5XHUzMDAyICovXG5jb25zdCBDTElfQ0FORElEQVRFUzogKCgpID0+IHN0cmluZyB8IG51bGwpW10gPSBbXG4gICgpID0+IHByb2Nlc3MuZW52LkxBUktfQ0xJX0JJTiA/PyBudWxsLFxuICAoKSA9PiB3aGljaCgnbGFya3N1aXRlLWNsaScpLFxuICAoKSA9PiB3aGljaCgnbGFyay1jbGknKSxcbiAgKCkgPT4ge1xuICAgIGNvbnN0IG52bUJhc2UgPSBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnLm52bS92ZXJzaW9ucy9ub2RlJyk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRpcnMgPSBmcy5yZWFkZGlyU3luYyhudm1CYXNlKTtcbiAgICAgIC8vIFx1NjU3MFx1NUI1N1x1NUU4Rlx1NTNENlx1NjcwMFx1NTkyN1x1NzI0OFx1NjcyQ1x1RkYwOFx1NUI1N1x1N0IyNlx1NEUzMiBzb3J0IFx1NEYxQVx1OEJBOSB2OSA+IHYxMFx1RkYwOVxuICAgICAgY29uc3QgbGF0ZXN0ID0gZGlyc1xuICAgICAgICAubWFwKGQgPT4gKHsgbmFtZTogZCwgdmVyOiBwYXJzZUludChkLnJlcGxhY2UoL152LywgJycpLCAxMCkgfSkpXG4gICAgICAgIC5maWx0ZXIoeCA9PiAhTnVtYmVyLmlzTmFOKHgudmVyKSlcbiAgICAgICAgLnNvcnQoKGEsIGIpID0+IGEudmVyIC0gYi52ZXIpXG4gICAgICAgIC5wb3AoKTtcbiAgICAgIHJldHVybiBsYXRlc3QgPyBwYXRoLmpvaW4obnZtQmFzZSwgbGF0ZXN0Lm5hbWUsICdiaW4nLCAnbGFyay1jbGknKSA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0sXG4gICgpID0+IHBhdGguam9pbihvcy5ob21lZGlyKCksICcubG9jYWwnLCAnYmluJywgJ2xhcmstY2xpJyksXG4gICgpID0+ICcvb3B0L2hvbWVicmV3L2Jpbi9sYXJrLWNsaScsXG4gICgpID0+ICcvdXNyL2xvY2FsL2Jpbi9sYXJrLWNsaScsXG5dO1xuXG4vKipcbiAqIFx1NjNBMlx1NkQ0QiBsYXJrLWNsaSBcdThERUZcdTVGODRcdTMwMDJcdTRGMThcdTUxNDhcdTc1MjhcdThCQkVcdTdGNkVcdTg5ODZcdTc2RDZcdUZGMENcdTU0MjZcdTUyMTlcdThENzBcdTUwMTlcdTkwMDlcdThERUZcdTVGODRcdTMwMDJcbiAqIEByZXR1cm5zIHsgcGF0aCwgdmVyc2lvbiB9IFx1NjIxNiBudWxsXHVGRjA4XHU2NzJBXHU2MjdFXHU1MjMwXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlQ2xpKG92ZXJyaWRlUGF0aD86IHN0cmluZyk6IHsgcGF0aDogc3RyaW5nOyB2ZXJzaW9uOiBzdHJpbmcgfSB8IG51bGwge1xuICBjb25zdCBjYW5kaWRhdGVzID0gb3ZlcnJpZGVQYXRoXG4gICAgPyBbKCkgPT4gb3ZlcnJpZGVQYXRoXVxuICAgIDogQ0xJX0NBTkRJREFURVM7XG5cbiAgZm9yIChjb25zdCBnZXRDbGkgb2YgY2FuZGlkYXRlcykge1xuICAgIGNvbnN0IGNsaSA9IGdldENsaSgpO1xuICAgIGlmICghY2xpKSBjb250aW51ZTtcbiAgICB0cnkge1xuICAgICAgLy8gXHU3NTI4IGV4ZWNGaWxlU3luYyBcdTc2RjRcdTYzQTVcdThERDEgY2xpXHVGRjBDXHU2Q0U4XHU1MTY1XHU1ODlFXHU1RjNBIFBBVEhcdUZGMDhcdTg5RTNcdTUxQjMgR1VJIFx1OEZEQlx1N0EwQiBlbnYgbm9kZSBcdTYyN0VcdTRFMERcdTUyMzBcdTc2ODRcdTk1RUVcdTk4OThcdUZGMDlcbiAgICAgIGNvbnN0IHZlciA9IGV4ZWNGaWxlU3luYyhjbGksIFsnLS12ZXJzaW9uJ10sIHtcbiAgICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICAgICAgdGltZW91dDogNTAwMCxcbiAgICAgICAgZW52OiB7IC4uLnByb2Nlc3MuZW52LCBQQVRIOiBnZXRFbmhhbmNlZFBhdGgoKSB9LFxuICAgICAgfSkudHJpbSgpO1xuICAgICAgLy8gXHU4OUUzXHU2NzkwIFwibGFyay1jbGkgdmVyc2lvbiAxLjAuNTJcIlxuICAgICAgY29uc3QgbWF0Y2ggPSB2ZXIubWF0Y2goLyhcXGQrKVxcLihcXGQrKVxcLihcXGQrKS8pO1xuICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIGNvbnN0IG1ham9yID0gcGFyc2VJbnQobWF0Y2hbMV0sIDEwKTtcbiAgICAgICAgY29uc3QgbWlub3IgPSBwYXJzZUludChtYXRjaFsyXSwgMTApO1xuICAgICAgICBjb25zdCBwYXRjaCA9IHBhcnNlSW50KG1hdGNoWzNdLCAxMCk7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBtYWpvciA+IE1JTl9WRVJTSU9OWzBdIHx8XG4gICAgICAgICAgKG1ham9yID09PSBNSU5fVkVSU0lPTlswXSAmJiBtaW5vciA+IE1JTl9WRVJTSU9OWzFdKSB8fFxuICAgICAgICAgIChtYWpvciA9PT0gTUlOX1ZFUlNJT05bMF0gJiYgbWlub3IgPT09IE1JTl9WRVJTSU9OWzFdICYmIHBhdGNoID49IE1JTl9WRVJTSU9OWzJdKVxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm4geyBwYXRoOiBjbGksIHZlcnNpb246IHZlciB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBcdTcyNDhcdTY3MkNcdTg5RTNcdTY3OTBcdTU5MzFcdThEMjVcdTRGNDZcdTY3MDlcdThGOTNcdTUxRkFcdUZGMENcdTRFQ0RcdTUzRUZcdTc1MjhcbiAgICAgIGlmICh2ZXIpIHJldHVybiB7IHBhdGg6IGNsaSwgdmVyc2lvbjogdmVyIH07XG4gICAgfSBjYXRjaCB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKiBydW4oKSBcdTYyNjdcdTg4NENcdTkwMDlcdTk4NzlcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUnVuT3B0aW9ucyB7XG4gIC8qKiBcdTVERTVcdTRGNUNcdTc2RUVcdTVGNTVcdUZGMDgtLWNvbnRlbnQgQGZpbGUgXHU3NTI4XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHU2NUY2XHU5NzAwXHU4OTgxXHVGRjA5XHUzMDAyICovXG4gIGN3ZD86IHN0cmluZztcbiAgLyoqIFx1NjcwMFx1NTkyN1x1OTFDRFx1OEJENVx1NkIyMVx1NjU3MFx1RkYwOFx1OUVEOFx1OEJBNCAzXHVGRjA5XHUzMDAyICovXG4gIHJldHJpZXM/OiBudW1iZXI7XG4gIC8qKiBcdThEODVcdTY1RjYgbXNcdUZGMDhcdTlFRDhcdThCQTQgMzBzXHVGRjA5XHUzMDAyICovXG4gIHRpbWVvdXQ/OiBudW1iZXI7XG4gIC8qKiBcdTY3MUZcdTY3MUIgSlNPTiBcdThGOTNcdTUxRkFcdTY1RjYgdHJ1ZVx1RkYwQ1x1ODFFQVx1NTJBOFx1OERGM1x1OEZDNyBcIkZvdW5kIFggbm9kZShzKVwiIFx1NTI0RFx1N0YwMFx1MzAwMiAqL1xuICBqc29uPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBcdTYyNjdcdTg4NEMgbGFyay1jbGkgXHU1NDdEXHU0RUU0XHUzMDAyXHU3RURGXHU0RTAwXHU1OTA0XHU3NDA2XHU1REYyXHU3N0U1XHU1NzUxXHUzMDAyXG4gKlxuICogQHBhcmFtIGFyZ3MgbGFyay1jbGkgXHU1QjUwXHU1NDdEXHU0RUU0XHU1M0MyXHU2NTcwXHU2NTcwXHU3RUM0XHVGRjBDXHU1OTgyIFsnZG9jcycsICcrZmV0Y2gnLCAnLS1kb2MnLCB0b2tlbiwgJy0tZG9jLWZvcm1hdCcsICdtYXJrZG93biddXG4gKiBAcGFyYW0gb3B0aW9ucyBcdTkwMDlcdTk4NzlcbiAqIEByZXR1cm5zIHN0ZG91dFx1RkYwOFx1NURGMlx1NkUwNVx1NkQxN1x1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gcnVuKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zOiBSdW5PcHRpb25zID0ge30pOiBzdHJpbmcge1xuICBjb25zdCB7IGN3ZCwgcmV0cmllcyA9IDMsIHRpbWVvdXQgPSAzMDAwMCwganNvbiA9IGZhbHNlIH0gPSBvcHRpb25zO1xuICBjb25zdCBjbGlQYXRoID0gcHJvY2Vzcy5lbnYuX19MQVJLX0NMSV9QQVRIX18gfHwgJ2xhcmstY2xpJztcblxuICBsZXQgbGFzdEVycm9yOiBFcnJvciB8IG51bGwgPSBudWxsO1xuXG4gIGZvciAobGV0IGF0dGVtcHQgPSAxOyBhdHRlbXB0IDw9IHJldHJpZXM7IGF0dGVtcHQrKykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmdWxsQXJncyA9IFsuLi5hcmdzXTtcbiAgICAgIGNvbnN0IGV4ZWNPcHRzOiBFeGVjU3luY09wdGlvbnMgPSB7XG4gICAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgICAgIHRpbWVvdXQsXG4gICAgICAgIG1heEJ1ZmZlcjogMTAgKiAxMDI0ICogMTAyNCwgLy8gMTBNQlx1RkYwOFx1NTkyN1x1NjU4N1x1Njg2M1x1RkYwOVxuICAgICAgICAvLyBcdTZDRThcdTUxNjVcdTU4OUVcdTVGM0EgUEFUSFx1RkYxQUdVSSBcdTU0MkZcdTUyQThcdTc2ODQgT2JzaWRpYW4gXHU2MkZGXHU0RTBEXHU1MjMwIG52bS9ob21lYnJld1x1RkYwQ1x1NUJGQ1x1ODFGNFxuICAgICAgICAvLyBgIyEvdXNyL2Jpbi9lbnYgbm9kZWAgXHU2MjdFXHU0RTBEXHU1MjMwIG5vZGVcdUZGMDhjbGkgXHU2NjJGIG5vZGUgXHU4MTFBXHU2NzJDXHVGRjA5XG4gICAgICAgIGVudjogeyAuLi5wcm9jZXNzLmVudiwgUEFUSDogZ2V0RW5oYW5jZWRQYXRoKCkgfSxcbiAgICAgIH07XG5cbiAgICAgIC8vIFx1NTkwNFx1NzQwNiAtLWNvbnRlbnQgQGZpbGVcdUZGMUFcdTc1MjhcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDhcdTU3NTFcdUZGMUFcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdTg4QUJcdTYyRDJcdUZGMDlcbiAgICAgIGNvbnN0IGNvbnRlbnRJZHggPSBmdWxsQXJncy5pbmRleE9mKCctLWNvbnRlbnQnKTtcbiAgICAgIGlmIChjb250ZW50SWR4ICE9PSAtMSAmJiBjb250ZW50SWR4ICsgMSA8IGZ1bGxBcmdzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBjb250ZW50VmFsID0gZnVsbEFyZ3NbY29udGVudElkeCArIDFdO1xuICAgICAgICBpZiAoY29udGVudFZhbC5zdGFydHNXaXRoKCdAJykpIHtcbiAgICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGNvbnRlbnRWYWwuc2xpY2UoMSk7XG4gICAgICAgICAgY29uc3QgZGlyID0gY3dkIHx8IHBhdGguZGlybmFtZShmaWxlUGF0aCk7XG4gICAgICAgICAgY29uc3QgYmFzZU5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKTtcbiAgICAgICAgICBmdWxsQXJnc1tjb250ZW50SWR4ICsgMV0gPSBgQC4vJHtiYXNlTmFtZX1gO1xuICAgICAgICAgIGV4ZWNPcHRzLmN3ZCA9IGRpcjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChjd2QpIHtcbiAgICAgICAgZXhlY09wdHMuY3dkID0gY3dkO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUxOTlcdTUxNjVcdTUyNEQgZW1vamkgXHU2RTA1XHU2RDE3XHVGRjFBXHU2MjZCXHU2M0NGIGZ1bGxBcmdzIFx1NEUyRCAtLWNvbnRlbnQgQGZpbGUgXHU3Njg0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XG4gICAgICBpZiAoY29udGVudElkeCAhPT0gLTEgJiYgY29udGVudElkeCArIDEgPCBmdWxsQXJncy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBmdWxsQXJnc1tjb250ZW50SWR4ICsgMV0ucmVwbGFjZSgvXkBcXC5cXC8vLCAnJyk7XG4gICAgICAgIGNvbnN0IGZ1bGxGaWxlUGF0aCA9IHBhdGguam9pbihleGVjT3B0cy5jd2QgfHwgcHJvY2Vzcy5jd2QoKSwgZmlsZVBhdGgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGxldCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZ1bGxGaWxlUGF0aCwgJ3V0ZjgnKTtcbiAgICAgICAgICBjb250ZW50ID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMoY29udGVudCk7XG4gICAgICAgICAgLy8gXHU1M0NEXHU4RjZDXHU0RTQ5IFxcfiBcdTIxOTIgflx1RkYwOFx1OThERVx1NEU2Nlx1OEJGQlx1NTZERVx1Njc2NVx1NjVGNlx1OEY2Q1x1NEU0OVx1NEU4Nlx1NkNFMlx1NkQ2QVx1NTNGN1x1RkYwOVxuICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL1xcXFx+L2csICd+Jyk7XG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmdWxsRmlsZVBhdGgsIGNvbnRlbnQsICd1dGY4Jyk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIC8vIFx1NjU4N1x1NEVGNlx1OEJGQlx1NEUwRFx1NTIzMFx1NUMzMVx1OERGM1x1OEZDN1x1NkUwNVx1NkQxN1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NzUyOCBleGVjRmlsZVN5bmMgXHU3NkY0XHU2M0E1XHU2MjY3XHU4ODRDXHVGRjBDXHU0RTBEXHU4RDcwIHNoZWxsXHVGRjA4XHU1M0MyXHU2NTcwXHU1Qjg5XHU1MTY4ICsgXHU1ODlFXHU1RjNBIFBBVEggXHU3NTFGXHU2NTQ4XHVGRjA5XG4gICAgICBsZXQgc3Rkb3V0ID0gZXhlY0ZpbGVTeW5jKGNsaVBhdGgsIGZ1bGxBcmdzLCBleGVjT3B0cyk7XG5cbiAgICAgIC8vIFx1NTZERVx1OEJGQlx1NTQwRVx1NTNDRFx1OEY2Q1x1NEU0OVx1RkYxQVx1OThERVx1NEU2NiBtZCBcdTYyOEEgfiBcdThGNkNcdTRFNDlcdTYyMTAgXFx+XG4gICAgICBzdGRvdXQgPSB1bmVzY2FwZUZlaXNodVRpbGRlKHN0ZG91dCk7XG5cbiAgICAgIC8vIFx1ODlFM1x1NTMwNSBsYXJrLWNsaSBcdTY4MDdcdTUxQzYgSlNPTiBcdTUzMDVcdTg4QzVcdUZGMUF7b2ssIGlkZW50aXR5LCBkYXRhOntkb2N1bWVudDp7Y29udGVudH19fSBcdTIxOTIgXHU3RUFGXHU2QjYzXHU2NTg3XG4gICAgICAvLyBkb2NzICtmZXRjaCBcdTlFRDhcdThCQTQgLS1mb3JtYXQganNvblx1RkYwQ1x1NkI2M1x1NjU4N1x1NUQ0Q1x1NTcyOCBkYXRhLmRvY3VtZW50LmNvbnRlbnQgXHU5MUNDXG4gICAgICBzdGRvdXQgPSB1bndyYXBMYXJrRW52ZWxvcGUoc3Rkb3V0KTtcblxuICAgICAgLy8gSlNPTiBcdTZBMjFcdTVGMEZcdUZGMUFcdThERjNcdThGQzcgXCJGb3VuZCBYIG5vZGUocylcIiBcdTUyNERcdTdGMDBcdUZGMDhcdTU3NTFcdUZGMUFub2RlLWxpc3QgXHU4RjkzXHU1MUZBXHU1NDJCXHU2NUU1XHU1RkQ3XHU4ODRDXHVGRjA5XG4gICAgICBpZiAoanNvbikge1xuICAgICAgICBjb25zdCBicmFjZUlkeCA9IHN0ZG91dC5pbmRleE9mKCd7Jyk7XG4gICAgICAgIGlmIChicmFjZUlkeCAhPT0gLTEpIHtcbiAgICAgICAgICBzdGRvdXQgPSBzdGRvdXQuc2xpY2UoYnJhY2VJZHgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdGRvdXQudHJpbSgpO1xuICAgIH0gY2F0Y2ggKGVycjogdW5rbm93bikge1xuICAgICAgbGFzdEVycm9yID0gZXJyIGFzIEVycm9yO1xuICAgICAgY29uc3QgZXJyTXNnID0gKGVyciBhcyBFcnJvcik/Lm1lc3NhZ2UgPz8gU3RyaW5nKGVycik7XG5cbiAgICAgIC8vIDQyOSBcdTk2NTBcdTZENDFcdTYyMTZcdTdGNTFcdTdFRENcdTk1MTlcdThCRUZcdUZGMUFcdTkxQ0RcdThCRDVcdUZGMDhcdTYzMDdcdTY1NzBcdTkwMDBcdTkwN0ZcdUZGMDlcbiAgICAgIGlmIChcbiAgICAgICAgZXJyTXNnLmluY2x1ZGVzKCc0MjknKSB8fFxuICAgICAgICBlcnJNc2cuaW5jbHVkZXMoJ0VUSU1FRE9VVCcpIHx8XG4gICAgICAgIGVyck1zZy5pbmNsdWRlcygnRUNPTk5SRVNFVCcpIHx8XG4gICAgICAgIGVyck1zZy5pbmNsdWRlcygnc29ja2V0IGhhbmcgdXAnKVxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IGRlbGF5ID0gTWF0aC5taW4oMTAwMCAqIE1hdGgucG93KDIsIGF0dGVtcHQgLSAxKSwgMTAwMDApO1xuICAgICAgICBjb25zb2xlLndhcm4oYFtzeW5jL2xhcmtdIGF0dGVtcHQgJHthdHRlbXB0fSBmYWlsZWQsIHJldHJ5aW5nIGluICR7ZGVsYXl9bXM6ICR7ZXJyTXNnfWApO1xuICAgICAgICAvLyBcdTRFMERcdTRGOURcdThENTYgc2hlbGwgXHU3Njg0IHNsZWVwXHVGRjA4QXRvbWljcy53YWl0IFx1NTQwQ1x1NkI2NVx1OTYzQlx1NTg1RVx1RkYwOVxuICAgICAgICBjb25zdCBtcyA9IGRlbGF5O1xuICAgICAgICBjb25zdCBidWYgPSBuZXcgSW50MzJBcnJheShuZXcgU2hhcmVkQXJyYXlCdWZmZXIoNCkpO1xuICAgICAgICBBdG9taWNzLndhaXQoYnVmLCAwLCAwLCBtcyk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUxNzZcdTRFRDZcdTk1MTlcdThCRUZcdTc2RjRcdTYzQTVcdTYyOUJcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHRocm93IGxhc3RFcnJvciA/PyBuZXcgRXJyb3IoJ2xhcmstY2xpIHJ1biBmYWlsZWQgd2l0aCB1bmtub3duIGVycm9yJyk7XG59XG5cbi8qKlxuICogXHU4OUUzXHU1MzA1IGxhcmstY2xpIFx1NjgwN1x1NTFDNiBKU09OIFx1NTMwNVx1ODhDNVx1MzAwMlxuICpcbiAqIGxhcmstY2xpIFx1NzY4NCBkb2NzICtmZXRjaCBcdTdCNDlcdTU0N0RcdTRFRTRcdTlFRDhcdThCQTQgYC0tZm9ybWF0IGpzb25gXHVGRjBDXHU4RkQ0XHU1NkRFXHVGRjFBXG4gKiAgIHsgXCJva1wiOiB0cnVlLCBcImlkZW50aXR5XCI6IFwiLi4uXCIsIFwiZGF0YVwiOiB7IFwiZG9jdW1lbnRcIjogeyBcImNvbnRlbnRcIjogXCI8XHU3NzFGXHU1QjlFXHU2QjYzXHU2NTg3PlwiIH0gfSwgLi4uIH1cbiAqIFx1NTQwQ1x1NkI2NVx1OTRGRVx1OERFRlx1OTcwMFx1ODk4MVx1NzY4NFx1NjYyRlx1N0VBRlx1NkI2M1x1NjU4N1x1RkYwOG1hcmtkb3duL3htbFx1RkYwOVx1RkYwQ1x1NEUwRFx1NjYyRlx1NjU3NFx1NEUyQSBlbnZlbG9wZVx1MzAwMlxuICpcbiAqIFx1NTIyNFx1NUI5QVx1RkYxQXN0ZG91dCBcdTk5OTZcdTRFMkFcdTk3NUVcdTdBN0FcdTc2N0RcdTVCNTdcdTdCMjZcdTY2MkYgYHtgXHVGRjBDXHU0RTE0XHU4OUUzXHU2NzkwXHU1NDBFXHU1NDJCIG9rIFx1NUI1N1x1NkJCNSArIGRhdGEuZG9jdW1lbnQuY29udGVudFx1RkYwQ1xuICogXHU2MjREXHU4QkE0XHU0RTNBXHU2NjJGIGVudmVsb3BlIFx1NUU3Nlx1ODlFM1x1NTMwNVx1RkYxQlx1NTQyNlx1NTIxOVx1NTM5Rlx1NjgzN1x1OEZENFx1NTZERVx1RkYwOFx1NEZERFx1NzU1OSB3aWtpICtub2RlLWxpc3QgXHU3QjQ5XHU3RUFGIEpTT04gXHU1NENEXHU1RTk0XHU3RUQ5IGpzb24gXHU2QTIxXHU1RjBGXHU1OTA0XHU3NDA2XHVGRjA5XHUzMDAyXG4gKi9cbmZ1bmN0aW9uIHVud3JhcExhcmtFbnZlbG9wZShzdGRvdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHRyaW1tZWQgPSBzdGRvdXQudHJpbVN0YXJ0KCk7XG4gIGlmICghdHJpbW1lZC5zdGFydHNXaXRoKCd7JykpIHJldHVybiBzdGRvdXQ7XG4gIGxldCBwYXJzZWQ6IHVua25vd247XG4gIHRyeSB7XG4gICAgcGFyc2VkID0gSlNPTi5wYXJzZSh0cmltbWVkKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIHN0ZG91dDsgLy8gXHU0RTBEXHU2NjJGXHU1NDA4XHU2Q0Q1IEpTT05cdUZGMENcdTUzOUZcdTY4MzdcdThGRDRcdTU2REVcbiAgfVxuICBjb25zdCBlbnYgPSBwYXJzZWQgYXMgeyBvaz86IHVua25vd247IGRhdGE/OiB7IGRvY3VtZW50PzogeyBjb250ZW50PzogdW5rbm93biB9IH0gfTtcbiAgLy8gXHU0RUM1XHU1RjUzXHU2NjJGXHU1NDJCIGRvY3VtZW50LmNvbnRlbnQgXHU3Njg0XHU2ODA3XHU1MUM2IGVudmVsb3BlIFx1NjI0RFx1ODlFM1x1NTMwNVxuICBpZiAoZW52ICYmIHR5cGVvZiBlbnYub2sgPT09ICdib29sZWFuJyAmJiBlbnYuZGF0YT8uZG9jdW1lbnQ/LmNvbnRlbnQgIT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBlbnYuZGF0YS5kb2N1bWVudC5jb250ZW50O1xuICAgIHJldHVybiB0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycgPyBjb250ZW50IDogSlNPTi5zdHJpbmdpZnkoY29udGVudCk7XG4gIH1cbiAgcmV0dXJuIHN0ZG91dDtcbn1cblxuLyoqXG4gKiBcdTU2REVcdTUxOTlcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjNcdUZGMDhtYXJrZG93biBvdmVyd3JpdGUgKyBcdTY4MDdcdTk4OThcdTRGRUVcdTU5MERcdUZGMDlcdTMwMDJcbiAqIFx1NEY5RFx1NjM2RVx1NURGMlx1NzdFNVx1NTc1MVx1RkYxQW92ZXJ3cml0ZSBcdTU0MEVcdTY4MDdcdTk4OThcdTUzRDggVW50aXRsZWQgXHUyMTkyIFx1OEZGRFx1NTJBMCBzdHJfcmVwbGFjZSBcdTRGRUUgPHRpdGxlPlx1MzAwMlxuICpcbiAqIEBwYXJhbSB0b2tlbiBkb2N4IG9ial90b2tlbiBcdTYyMTYgbm9kZV90b2tlblxuICogQHBhcmFtIGNvbnRlbnQgXHU2QjYzXHU2NTg3IG1hcmtkb3duXHVGRjA4XHU0RTBEXHU1NDJCIGZyb250bWF0dGVyXHVGRjA5XG4gKiBAcGFyYW0gdGl0bGUgXHU2NTg3XHU2ODYzXHU2ODA3XHU5ODk4XHVGRjA4XHU1RTI2IGVtb2ppXHVGRjA5XG4gKiBAcGFyYW0gY3dkIFx1NURFNVx1NEY1Q1x1NzZFRVx1NUY1NVx1RkYwOFx1NzUyOFx1NEU4RSBAZmlsZSBcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG92ZXJ3cml0ZURvYyh0b2tlbjogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsIGN3ZD86IHN0cmluZyk6IHZvaWQge1xuICAvLyBcdTUxOTlcdTRFMzRcdTY1RjZcdTY1ODdcdTRFRjZcdUZGMDhvdmVyd3JpdGUgXHU5NzAwXHU4OTgxXHU3NTI4IEBmaWxlXHVGRjA5XG4gIGNvbnN0IHRtcERpciA9IGN3ZCB8fCBwcm9jZXNzLmN3ZCgpO1xuICBjb25zdCB0bXBGaWxlID0gcGF0aC5qb2luKHRtcERpciwgJy4vLmZlaXNodS1zeW5jLXRlbXAubWQnKTtcblxuICAvLyBcdTZFMDVcdTZEMTdcdUZGMUFzdHJpcCBlbW9qaSBWUyArIFx1NTNDRFx1OEY2Q1x1NEU0OSBcXH5cbiAgY29uc3QgY2xlYW5lZCA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKGNvbnRlbnQpO1xuXG4gIGZzLndyaXRlRmlsZVN5bmModG1wRmlsZSwgY2xlYW5lZCwgJ3V0ZjgnKTtcblxuICB0cnkge1xuICAgIC8vIG92ZXJ3cml0ZVxuICAgIHJ1bihbJ2RvY3MnLCAnK3VwZGF0ZScsICctLWRvYycsIHRva2VuLCAnLS1jb21tYW5kJywgJ292ZXJ3cml0ZScsICctLWRvYy1mb3JtYXQnLCAnbWFya2Rvd24nLCAnLS1jb250ZW50JywgYEAuLy5mZWlzaHUtc3luYy10ZW1wLm1kYF0sIHsgY3dkOiB0bXBEaXIgfSk7XG5cbiAgICAvLyBcdTY4MDdcdTk4OThcdTRGRUVcdTU5MERcdUZGMUFzdHJfcmVwbGFjZSBcdTRGRUUgPHRpdGxlPlxuICAgIGNvbnN0IGNsZWFuVGl0bGUgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyh0aXRsZSk7XG4gICAgcnVuKFtcbiAgICAgICdkb2NzJywgJyt1cGRhdGUnLCAnLS1kb2MnLCB0b2tlbixcbiAgICAgICctLWNvbW1hbmQnLCAnc3RyX3JlcGxhY2UnLFxuICAgICAgJy0tZG9jLWZvcm1hdCcsICdqc29uJyxcbiAgICAgICctLWNvbnRlbnQnLCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHJlcXVlc3Q6IFt7XG4gICAgICAgICAgYmxvY2tfdHlwZTogMSwgLy8gcGFnZVxuICAgICAgICAgIHBhZ2U6IHtcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbe1xuICAgICAgICAgICAgICB0ZXh0X3J1bjogeyBjb250ZW50OiBjbGVhblRpdGxlLCB0ZXh0X2VsZW1lbnRfc3R5bGU6IHsgYm9sZDogdHJ1ZSB9IH1cbiAgICAgICAgICAgIH1dXG4gICAgICAgICAgfVxuICAgICAgICB9XSxcbiAgICAgICAgaW5kZXg6IDAsXG4gICAgICB9KSxcbiAgICBdLCB7IGN3ZDogdG1wRGlyLCB0aW1lb3V0OiAxNTAwMCB9KTtcbiAgfSBmaW5hbGx5IHtcbiAgICAvLyBcdTZFMDVcdTc0MDZcdTRFMzRcdTY1RjZcdTY1ODdcdTRFRjZcbiAgICB0cnkgeyBmcy51bmxpbmtTeW5jKHRtcEZpbGUpOyB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cbiAgfVxufVxuXG4vKipcbiAqIFx1NTZERVx1NTE5OVx1OThERVx1NEU2Nlx1NjU4N1x1Njg2M1x1RkYwOFhNTCBcdTY4M0NcdTVGMEZcdUZGMENcdTU0MkIgY2FsbG91dCBcdTdDQkVcdTc4NkVcdTYzQTdcdTUyMzZcdUZGMDlcdTMwMDJcbiAqIFx1NTQwQ1x1NjgzN1x1OTcwMFx1ODk4MVx1NjgwN1x1OTg5OFx1NEZFRVx1NTkwRFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gb3ZlcndyaXRlRG9jWG1sKHRva2VuOiBzdHJpbmcsIHhtbENvbnRlbnQ6IHN0cmluZywgdGl0bGU6IHN0cmluZywgY3dkPzogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IHRtcERpciA9IGN3ZCB8fCBwcm9jZXNzLmN3ZCgpO1xuICBjb25zdCB0bXBGaWxlID0gcGF0aC5qb2luKHRtcERpciwgJy4vLmZlaXNodS1zeW5jLXRlbXAueG1sJyk7XG5cbiAgY29uc3QgY2xlYW5lZCA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKHhtbENvbnRlbnQpO1xuICBmcy53cml0ZUZpbGVTeW5jKHRtcEZpbGUsIGNsZWFuZWQsICd1dGY4Jyk7XG5cbiAgdHJ5IHtcbiAgICBydW4oWydkb2NzJywgJyt1cGRhdGUnLCAnLS1kb2MnLCB0b2tlbiwgJy0tY29tbWFuZCcsICdvdmVyd3JpdGUnLCAnLS1kb2MtZm9ybWF0JywgJ3htbCcsICctLWNvbnRlbnQnLCBgQC4vLmZlaXNodS1zeW5jLXRlbXAueG1sYF0sIHsgY3dkOiB0bXBEaXIgfSk7XG5cbiAgICAvLyBcdTY4MDdcdTk4OThcdTRGRUVcdTU5MERcbiAgICBjb25zdCBjbGVhblRpdGxlID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnModGl0bGUpO1xuICAgIHJ1bihbXG4gICAgICAnZG9jcycsICcrdXBkYXRlJywgJy0tZG9jJywgdG9rZW4sXG4gICAgICAnLS1jb21tYW5kJywgJ3N0cl9yZXBsYWNlJyxcbiAgICAgICctLWRvYy1mb3JtYXQnLCAnanNvbicsXG4gICAgICAnLS1jb250ZW50JywgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICByZXF1ZXN0OiBbe1xuICAgICAgICAgIGJsb2NrX3R5cGU6IDEsXG4gICAgICAgICAgcGFnZToge1xuICAgICAgICAgICAgZWxlbWVudHM6IFt7XG4gICAgICAgICAgICAgIHRleHRfcnVuOiB7IGNvbnRlbnQ6IGNsZWFuVGl0bGUsIHRleHRfZWxlbWVudF9zdHlsZTogeyBib2xkOiB0cnVlIH0gfVxuICAgICAgICAgICAgfV1cbiAgICAgICAgICB9XG4gICAgICAgIH1dLFxuICAgICAgICBpbmRleDogMCxcbiAgICAgIH0pLFxuICAgIF0sIHsgY3dkOiB0bXBEaXIsIHRpbWVvdXQ6IDE1MDAwIH0pO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7IGZzLnVubGlua1N5bmModG1wRmlsZSk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxuICB9XG59XG5cbi8qKlxuICogXHU0RUNFXHU5OERFXHU0RTY2IHdpa2kgVVJMIFx1ODlFM1x1Njc5MCBub2RlX3Rva2VuXHUzMDAyXG4gKiBVUkwgXHU1RjYyXHU1OTgyXHVGRjFBaHR0cHM6Ly94eHguZmVpc2h1LmNuL3dpa2kvTk9ERV9UT0tFTlx1MzAwMS9kb2N4L09CSl9UT0tFTiBcdTYyMTYgL2RvYy9PQkpfVE9LRU5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVOb2RlVG9rZW5Gcm9tVXJsKHVybDogc3RyaW5nKTogeyBub2RlX3Rva2VuPzogc3RyaW5nOyBvYmpfdG9rZW4/OiBzdHJpbmcgfSB7XG4gIC8vIHdpa2kgbm9kZVxuICBjb25zdCB3aWtpTWF0Y2ggPSB1cmwubWF0Y2goL1xcL3dpa2lcXC8oW0EtWmEtejAtOV0rKS8pO1xuICBpZiAod2lraU1hdGNoKSByZXR1cm4geyBub2RlX3Rva2VuOiB3aWtpTWF0Y2hbMV0gfTtcblxuICAvLyBkb2N4IG9ialxuICBjb25zdCBkb2N4TWF0Y2ggPSB1cmwubWF0Y2goL1xcL2RvY3hcXC8oW0EtWmEtejAtOV0rKS8pO1xuICBpZiAoZG9jeE1hdGNoKSByZXR1cm4geyBvYmpfdG9rZW46IGRvY3hNYXRjaFsxXSB9O1xuXG4gIHJldHVybiB7fTtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDYgd2lraSBcdTgyODJcdTcwQjlcdTc2ODQgZG9jeCBvYmpfdG9rZW5cdTMwMDJcbiAqIGB3aWtpICtub2RlLWdldCAtLW5vZGUtdG9rZW4gPHVybD4gLS1zcGFjZS1pZCA8aWQ+YFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0V2lraU5vZGVJbmZvKG5vZGVUb2tlbjogc3RyaW5nLCBzcGFjZUlkOiBzdHJpbmcpOiB7IG9ial90b2tlbjogc3RyaW5nOyB0aXRsZTogc3RyaW5nIH0gfCBudWxsIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBvdXRwdXQgPSBydW4oW1xuICAgICAgJ3dpa2knLCAnK25vZGUtZ2V0JyxcbiAgICAgICctLW5vZGUtdG9rZW4nLCBub2RlVG9rZW4sXG4gICAgICAnLS1zcGFjZS1pZCcsIHNwYWNlSWQsXG4gICAgXSwgeyBqc29uOiB0cnVlIH0pO1xuICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKG91dHB1dCk7XG4gICAgLy8gXHU4MjgyXHU3MEI5XHU1M0VGXHU4MEZEXHU2NzA5IG5vZGUgXHU2MjE2XHU3NkY0XHU2M0E1XHU2NjJGIG9ial90b2tlblxuICAgIGNvbnN0IG9ialRva2VuID0gZGF0YT8ubm9kZT8ub2JqX3Rva2VuID8/IGRhdGE/Lm9ial90b2tlbiA/PyBkYXRhPy5vYmpfdG9rZW47XG4gICAgY29uc3QgdGl0bGUgPSBkYXRhPy5ub2RlPy50aXRsZSA/PyBkYXRhPy50aXRsZSA/PyAnJztcbiAgICBpZiAob2JqVG9rZW4pIHJldHVybiB7IG9ial90b2tlbjogb2JqVG9rZW4sIHRpdGxlIH07XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUud2FybignW3N5bmMvbGFya10gd2lraSArbm9kZS1nZXQgZmFpbGVkOicsIGVycik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTk4REVcdTRFNjZcdTc3RTVcdThCQzZcdTVFOTNcdTVCNTBcdTgyODJcdTcwQjlcdTUyMTdcdTg4NjhcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpc3RXaWtpQ2hpbGRyZW4oc3BhY2VJZDogc3RyaW5nLCBwYXJlbnRUb2tlbjogc3RyaW5nKTogQXJyYXk8eyBub2RlX3Rva2VuOiBzdHJpbmc7IHRpdGxlOiBzdHJpbmc7IG9ial90b2tlbjogc3RyaW5nIH0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBvdXRwdXQgPSBydW4oW1xuICAgICAgJ3dpa2knLCAnK25vZGUtbGlzdCcsXG4gICAgICAnLS1zcGFjZS1pZCcsIHNwYWNlSWQsXG4gICAgICAnLS1wYXJlbnQtbm9kZS10b2tlbicsIHBhcmVudFRva2VuLFxuICAgIF0sIHsganNvbjogdHJ1ZSB9KTtcbiAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShvdXRwdXQpO1xuICAgIGNvbnN0IGl0ZW1zID0gZGF0YT8uaXRlbXMgPz8gZGF0YT8ubm9kZXMgPz8gW107XG4gICAgcmV0dXJuIGl0ZW1zLm1hcCgobjogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+ICh7XG4gICAgICBub2RlX3Rva2VuOiBuLm5vZGVfdG9rZW4gPz8gJycsXG4gICAgICB0aXRsZTogbi50aXRsZSA/PyAnJyxcbiAgICAgIG9ial90b2tlbjogbi5vYmpfdG9rZW4gPz8gJycsXG4gICAgfSkpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2xhcmtdIHdpa2kgK25vZGUtbGlzdCBmYWlsZWQ6JywgZXJyKTtcbiAgICByZXR1cm4gW107XG4gIH1cbn1cbiIsICIvKipcbiAqIFx1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QSArIFlBTUwgZnJvbnRtYXR0ZXIgXHU2NTcwXHU2MzZFXHU2QTIxXHU1NzhCXHUzMDAyXG4gKlxuICogXHU0RjlEXHU2MzZFXHVGRjFBYFx1OEJCRVx1OEJBMVx1NjVCOVx1Njg0OC8wMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYFx1RkYwOFx1Njc0M1x1NUEwMSB2MVx1RkYwOSsgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3NS4xXHUzMDAyXG4gKiBcdTk0QzFcdTVGOEJcdUZGMUFcdTU0MENcdTZCNjVcdTdFRDFcdTVCOUFcdTdFQzRcdUZGMDhmZWlzaHVfKlx1RkYwOVx1NzUzMVx1NjNEMlx1NEVGNlx1ODFFQVx1NTJBOFx1NTE5OVx1RkYwQ1x1NzUyOFx1NjIzN1x1NEUwRFx1NTNFRlx1NjI0Qlx1NjUzOVx1MzAwMlxuICovXG5cbi8qKiBcdTU0MENcdTZCNjVcdTdFRDFcdTVCOUFcdTdFQzRcdUZGMDhcdTY4MzhcdTVGQzNcdUZGMENcdTRFMERcdTUzRUZcdTYyNEJcdTY1MzlcdUZGMDlcdTMwMDJcdTVCRjlcdTVFOTQgWUFNTCBcdTU0MENcdTZCNjVcdTdFRDFcdTVCOUFcdTZCQjVcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3luY0JpbmRpbmcge1xuICAvKiogXHU5OERFXHU0RTY2IHdpa2kgbm9kZV90b2tlblx1RkYwOFx1NTUyRlx1NEUwMFx1N0VEMVx1NUI5QVx1RkYwOVx1MzAwMiAqL1xuICBmZWlzaHVfaWQ6IHN0cmluZztcbiAgLyoqIFx1OThERVx1NEU2NiBkb2N4IG9ial90b2tlblx1RkYwOFx1NTZERVx1NTE5OVx1NzUyOFx1RkYwOVx1MzAwMiAqL1xuICBmZWlzaHVfZG9jX2lkOiBzdHJpbmc7XG4gIC8qKiBcdTk4REVcdTRFNjZcdTUzOUZcdTU5Q0JcdTY4MDdcdTk4OThcdUZGMDhcdTU0MkIgZW1vamlcdUZGMENcdTU2REVcdTUxOTlcdTY1RjZcdTc1MjhcdUZGMDlcdTMwMDIgKi9cbiAgZmVpc2h1X3RpdGxlOiBzdHJpbmc7XG4gIC8qKiBcdTRFMEFcdTZCMjFcdTU0MENcdTZCNjVcdTUxODVcdTVCQjkgaGFzaFx1RkYwOFx1OEY3Qlx1NjgzOFx1OUE4Q1x1NzUyOFx1RkYwQ3NoYTI1NiBoZXhcdUZGMDlcdTMwMDIgKi9cbiAgc3luY19oYXNoPzogc3RyaW5nO1xuICAvKiogXHU0RTBBXHU2QjIxXHU1NDBDXHU2QjY1XHU2NUY2XHU5NUY0XHVGRjA4SVNPODYwMVx1RkYwQ1x1NUUyNlx1NjVGNlx1NTMzQVx1RkYwOVx1MzAwMiAqL1xuICBzeW5jX3RpbWU/OiBzdHJpbmc7XG59XG5cbi8qKiBcdTY4MDdcdTdCN0VcdTVDMDFcdTk1RURcdTY3OUFcdTRFM0VcdTMwMDJcdTRGOURcdTYzNkUgYDAyX1lBTUxcdTVCNTdcdTZCQjVcdTg5QzRcdTgzMDMubWRgIFx1MDBBNzIuMlx1MzAwMiAqL1xuZXhwb3J0IHR5cGUgVGFnID0gJ1MnIHwgJ1gnIHwgJ0wnIHwgJ1onIHwgJ1EnIHwgJ0onO1xuXG5leHBvcnQgY29uc3QgVEFHX05BTUVTOiBSZWNvcmQ8VGFnLCBzdHJpbmc+ID0ge1xuICBTOiAnXHVEODNEXHVEQ0U1XHU2NTM2XHU5NkM2JyxcbiAgWDogJ1x1RDgzQ1x1REZBRlx1OTg3OVx1NzZFRScsXG4gIEw6ICdcdUQ4M0NcdURGMzNcdTk4ODZcdTU3REYnLFxuICBaOiAnXHVEODNEXHVEQ0RBXHU4RDQ0XHU2RTkwJyxcbiAgUTogJ1x1RDgzRFx1RENBMVx1NzA3NVx1NjExRicsXG4gIEo6ICdcdUQ4M0RcdURFRTBcdUZFMEZcdTYyODBcdTgwRkQnLFxufTtcblxuLyoqIFx1NzdFNVx1OEJDNlx1NUU5M1x1NTE0M1x1NjU3MFx1NjM2RVx1RkYwOE9CIFx1N0VGNFx1NjJBNFx1RkYwQ1x1NTZERVx1NTE5OVx1OThERVx1NEU2Nlx1NjIxMCBjYWxsb3V0XHVGRjA5XHUzMDAyXHU0RjlEXHU2MzZFIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBLbm93bGVkZ2VNZXRhIHtcbiAgLyoqIFx1NjgwN1x1N0I3RVx1RkYwQ1x1NUMwMVx1OTVFRFx1Njc5QVx1NEUzRVx1MzAwMlx1N0Y2RVx1NEZFMVx1NUVBNiA8MC42IFx1MjE5MiBTXHUzMDAyICovXG4gIFx1NjgwN1x1N0I3RT86IFRhZztcbiAgLyoqIFx1N0YxNlx1NzgwMVx1RkYwQ2F1dG8tcmVuYW1lIFx1NTIwNlx1OTE0RFx1RkYwQ1x1NjgzQ1x1NUYwRiBZWV9NTUREX1x1NjgwN1x1N0I3RV9cdTVFOEZcdTUzRjdbX1x1NUI1MFx1NUU4Rlx1NTNGN11cdTMwMDIgKi9cbiAgXHU3RjE2XHU3ODAxPzogc3RyaW5nO1xuICAvKiogXHU4RjkzXHU1MTY1XHU1QjhDXHU2NTc0XHU4REVGXHU1Rjg0XHVGRjA4XHU2NzAwXHU2REYxXHU2Q0U4XHU1MThDXHU4REVGXHU1Rjg0XHVGRjA5XHUzMDAyICovXG4gIFx1OEY5M1x1NTE2NT86IHN0cmluZztcbiAgLyoqIFx1NjVFNVx1NjcxRlx1RkYwQ0lTTyBcdTY4M0NcdTVGMEYgWVlZWS1NTS1ERFx1MzAwMiAqL1xuICBcdTY1RTVcdTY3MUY/OiBzdHJpbmc7XG4gIC8qKiBcdTY1RTVcdTY3MUZcdTdEMjJcdTVGMTVcdUZGMENcdTUzRUZcdTkwMDlcdTk4NzlcdTY1NzBcdTdFQzRcdTMwMDIgKi9cbiAgXHU2NUU1XHU2NzFGXHU3RDIyXHU1RjE1Pzogc3RyaW5nW107XG4gIC8qKiBcdTUxNzNcdTk1MkVcdThCQ0RcdUZGMENcdTk4N0ZcdTUzRjdcdTUyMDZcdTk2OTRcdTMwMDIgKi9cbiAgXHU1MTczXHU5NTJFXHU4QkNEPzogc3RyaW5nO1xuICAvKiogXHU2OTgyXHU4RkYwXHVGRjBDXHU3RUQ5XHU1NDBFXHU3RUVEIEFJIFx1NUZFQlx1OTAxRlx1OEJDNlx1NTIyQlx1NjU4N1x1Njg2M1x1NTE4NVx1NUJCOVx1NzUyOFx1MzAwMiAqL1xuICBcdTY5ODJcdThGRjA/OiBzdHJpbmc7XG4gIC8qKiBcdThCQzRcdTUyMDYgMS01XHVGRjFCXHU2NzJBXHU4QkM0XHU1MjA2XHU2NUY2XHU0RkREXHU3NTU5XHU3QTdBXHU1MDNDXHU0RUU1XHU2NjNFXHU1RjBGXHU1MzYwXHU0RjREXHUzMDAyICovXG4gIFx1OEJDNFx1NTIwNj86IG51bWJlciB8ICcnO1xuICAvKiogXHU4QkM0XHU1MjA2XHU2NjNFXHU3OTNBXHU0RTMyXHVGRjBDXHU1OTgyIFwiXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVGRjVDXHU1QjlFXHU4REY1XCJcdTMwMDIgKi9cbiAgXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQT86IHN0cmluZztcbiAgLyoqIFx1N0QyMlx1NUYxNV9cdTc3RTVcdThCQzZcdTVFOTNcdUZGMDhcdTZCNjNcdThEMjIvXHU1MDRGXHU4RDIyLy4uLlx1RkYwOVx1MzAwMiAqL1xuICBcdTdEMjJcdTVGMTVfXHU3N0U1XHU4QkM2XHU1RTkzPzogc3RyaW5nO1xuICAvKiogXHU3RDIyXHU1RjE1X1x1OTg5Q1x1ODI3Mlx1MzAwMiAqL1xuICBcdTdEMjJcdTVGMTVfXHU5ODlDXHU4MjcyPzogc3RyaW5nO1xuICAvKiogXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODhcdUZGMENcdTRFMjRcdTdFQzRcdTkwMDlcdTRFMDBcdUZGMDhcdTYwRjNcdTZDRDUvXHU4OUM0XHU1MjEyL1x1NjI2N1x1ODg0Qy9cdTUzRDdcdTYzMkIvXHU1MTRCXHU2NzBEIFx1MDBENyBcdTUyMURcdTdBM0YvXHU1QkExXHU2ODM4L1x1NEZFRVx1NjUzOS9cdTVCOENcdTYyMTAvXHU1OTBEXHU3NkQ4XHVGRjA5XHUzMDAyICovXG4gICdcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OCc/OiBzdHJpbmdbXTtcbiAgLyoqIFx1N0QyMlx1NUYxNV9cdTU3NTdcdUZGMENcdTU5MUFcdTkwMDlcdUZGMDhcdTUxNzdcdThDNjEvXHU2MkJEXHU4QzYxIFx1MDBENyBcdTdCODBcdTUzNTUvXHU1NkYwXHU5NkJFXHVGRjA5XHUzMDAyICovXG4gIFx1N0QyMlx1NUYxNV9cdTU3NTc/OiBzdHJpbmdbXTtcbiAgLyoqIFx1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2NjlcdUZGMENcdTk2RjZcdTYyMTZcdTU5MUFcdTRFMkFcdTMwMDIgKi9cbiAgXHU3RDIyXHU1RjE1X1x1OThDRVx1OTY2OT86IHN0cmluZ1tdO1xufVxuXG4vKiogT0IgXHU2NTg3XHU0RUY2XHU1QjhDXHU2NTc0IGZyb250bWF0dGVyID0gXHU1NDBDXHU2QjY1XHU3RUQxXHU1QjlBICsgXHU3N0U1XHU4QkM2XHU1RTkzXHU1MTQzXHU2NTcwXHU2MzZFXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFlBTUxGcm9udG1hdHRlciBleHRlbmRzIFN5bmNCaW5kaW5nLCBLbm93bGVkZ2VNZXRhIHt9XG5cbi8qKiBPQlx1MjE5Mlx1OThERVx1NEU2NiBjYWxsb3V0IFx1NUI1N1x1NkJCNVx1NjYyMFx1NUMwNFx1OTg3OVx1MzAwMlx1NEY5RFx1NjM2RSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU0RTk0XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIENhbGxvdXRGaWVsZE1hcCB7XG4gIC8qKiBZQU1MIFx1NUI1N1x1NkJCNVx1NTQwRFx1MzAwMiAqL1xuICBmaWVsZDoga2V5b2YgS25vd2xlZGdlTWV0YTtcbiAgLyoqIGNhbGxvdXQgXHU5MUNDXHU2NjNFXHU3OTNBXHU3Njg0XHU0RTJEXHU2NTg3XHU2ODA3XHU3QjdFXHUzMDAyICovXG4gIGxhYmVsOiBzdHJpbmc7XG4gIC8qKiBlbW9qaVx1RkYwOFx1NEUwRFx1NUUyNiB2YXJpYXRpb24gc2VsZWN0b3JcdUZGMDlcdTMwMDIgKi9cbiAgZW1vamk6IHN0cmluZztcbn1cblxuLyoqXG4gKiBZQU1MIFx1NUI1N1x1NkJCNSBcdTIxOTIgXHU5OERFXHU0RTY2IGNhbGxvdXQgXHU4ODRDXHU2NjIwXHU1QzA0XHUzMDAyXHU0RjlEXHU2MzZFIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTRFOTRcdTMwMDJcbiAqIFx1NkNFOFx1NjEwRiBlbW9qaSBcdTUxNjhcdTkwRThcdTRFMERcdTVFMjYgVStGRTBGXHVGRjA4XHU5OERFXHU0RTY2XHU0RTBEXHU4QkE0IFZTXHVGRjBDXHU4OUMxIDAzIFx1NjU4N1x1Njg2MyBcdTAwQTczLjNcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGNvbnN0IENBTExPVVRfRklFTERfTUFQOiBDYWxsb3V0RmllbGRNYXBbXSA9IFtcbiAgeyBmaWVsZDogJ1x1NjgwN1x1N0I3RScsIGxhYmVsOiAnXHU2ODA3XHU3QjdFJywgZW1vamk6ICdcdUQ4M0NcdURGRjcnIH0sXG4gIHsgZmllbGQ6ICdcdTdGMTZcdTc4MDEnLCBsYWJlbDogJ1x1N0YxNlx1NzgwMScsIGVtb2ppOiAnXHVEODNEXHVERDIyJyB9LFxuICB7IGZpZWxkOiAnXHU4RjkzXHU1MTY1JywgbGFiZWw6ICdcdThGOTNcdTUxNjUnLCBlbW9qaTogJ1x1RDgzRFx1RENFNScgfSxcbiAgeyBmaWVsZDogJ1x1NjVFNVx1NjcxRicsIGxhYmVsOiAnXHU2NUU1XHU2NzFGJywgZW1vamk6ICdcdUQ4M0RcdURDQzUnIH0sXG4gIHsgZmllbGQ6ICdcdTUxNzNcdTk1MkVcdThCQ0QnLCBsYWJlbDogJ1x1NTE3M1x1OTUyRVx1OEJDRCcsIGVtb2ppOiAnXHVEODNEXHVERDExJyB9LFxuICB7IGZpZWxkOiAnXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQScsIGxhYmVsOiAnXHU4QkM0XHU1MjA2JywgZW1vamk6ICdcdTJCNTAnIH0sXG4gIHsgZmllbGQ6ICdcdTdEMjJcdTVGMTVfXHU3N0U1XHU4QkM2XHU1RTkzJywgbGFiZWw6ICdcdTdEMjJcdTVGMTUnLCBlbW9qaTogJ1x1RDgzRFx1RENCMCcgfSxcbl07XG5cbi8qKiBPQlx1MjE5Mlx1OThERVx1NEU2NiBjYWxsb3V0IFx1NjU3NFx1NEY1M1x1OTE0RFx1ODI3Mlx1RkYwOFx1NTQwOFx1NUU3Nlx1NEZFMVx1NjA2Rlx1NTc1N1x1NzUyOFx1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IERPQ19JTkZPX0NBTExPVVQgPSB7XG4gIGVtb2ppOiAnXHVEODNEXHVEQ0NCJyxcbiAgJ2JhY2tncm91bmQtY29sb3InOiAnbGlnaHQtYmx1ZScsXG4gICdib3JkZXItY29sb3InOiAnYmx1ZScsXG59IGFzIGNvbnN0O1xuXG4vKiogXHU5OERFXHU0RTY2IGNhbGxvdXQgXHU4MENDXHU2NjZGXHU4MjcyIFx1MjE5MiBPQiBjYWxsb3V0IFx1N0M3Qlx1NTc4Qlx1MzAwMlx1NEY5RFx1NjM2RSBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTczLjFcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBGRUlTSFVfQkdfVE9fT0JfQ0FMTE9VVDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJ2xpZ2h0LXllbGxvdyc6ICd0aXAnLFxuICAnbWVkaXVtLXJlZCc6ICd3YXJuaW5nJyxcbiAgJ2xpZ2h0LWdyZWVuJzogJ3N1Y2Nlc3MnLFxuICAnbGlnaHQtYmx1ZSc6ICdpbmZvJyxcbiAgJ2xpZ2h0LXB1cnBsZSc6ICdub3RlJyxcbiAgJ2xpZ2h0LWdyYXknOiAncXVvdGUnLFxuICAnbGlnaHQtb3JhbmdlJzogJ2ZhcScsXG59O1xuXG4vKiogT0IgY2FsbG91dCBcdTdDN0JcdTU3OEIgXHUyMTkyIFx1OThERVx1NEU2NiBjYWxsb3V0IFx1OTE0RFx1ODI3Mlx1MzAwMlx1MDBBNzMuMSBcdTUzQ0RcdTU0MTFcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBPQl9DQUxMT1VUX1RPX0ZFSVNIVTogUmVjb3JkPHN0cmluZywgeyBlbW9qaTogc3RyaW5nOyBiZzogc3RyaW5nOyBib3JkZXI6IHN0cmluZyB9PiA9IHtcbiAgdGlwOiB7IGVtb2ppOiAnXHVEODNEXHVEQ0ExJywgYmc6ICdsaWdodC15ZWxsb3cnLCBib3JkZXI6ICd5ZWxsb3cnIH0sXG4gIHdhcm5pbmc6IHsgZW1vamk6ICdcdTI2QTBcdUZFMEYnLCBiZzogJ21lZGl1bS1yZWQnLCBib3JkZXI6ICdyZWQnIH0sXG4gIHN1Y2Nlc3M6IHsgZW1vamk6ICdcdTI3MDUnLCBiZzogJ2xpZ2h0LWdyZWVuJywgYm9yZGVyOiAnZ3JlZW4nIH0sXG4gIGluZm86IHsgZW1vamk6ICdcdTIxMzlcdUZFMEYnLCBiZzogJ2xpZ2h0LWJsdWUnLCBib3JkZXI6ICdibHVlJyB9LFxuICBub3RlOiB7IGVtb2ppOiAnXHVEODNEXHVEQ0REJywgYmc6ICdsaWdodC1wdXJwbGUnLCBib3JkZXI6ICdwdXJwbGUnIH0sXG4gIHF1b3RlOiB7IGVtb2ppOiAnXHVEODNEXHVEQ0FDJywgYmc6ICdsaWdodC1ncmF5JywgYm9yZGVyOiAnZ3JheScgfSxcbiAgZmFxOiB7IGVtb2ppOiAnXHUyNzUzJywgYmc6ICdsaWdodC1vcmFuZ2UnLCBib3JkZXI6ICdvcmFuZ2UnIH0sXG4gIGFic3RyYWN0OiB7IGVtb2ppOiAnXHVEODNEXHVEQ0NCJywgYmc6ICdsaWdodC1ibHVlJywgYm9yZGVyOiAnYmx1ZScgfSxcbn07XG4iLCAiaW1wb3J0IHR5cGUgeyBLbm93bGVkZ2VNZXRhIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5cbi8qKlxuICogbG9jYWxob3N0IEhUVFAgXHU1MzRGXHU4QkFFXHU1OTUxXHU3RUE2XHVGRjA4T0IgXHU2M0QyXHU0RUY2IFx1MjE5NCBcdTZENEZcdTg5QzhcdTU2NjhcdTYyNjlcdTVDNTVcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdTRGOURcdTYzNkVcdUZGMUFgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTc0LjIgKyBcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFcdUZGMDhcdTU4NkJcdTg4NjVcdTY1ODdcdTY4NjNcdTdGM0FcdTUzRTNcdUZGMDlcdTMwMDJcbiAqIFx1OTI3NFx1Njc0M1x1RkYxQVx1NkJDRlx1NEUyQVx1OEJGN1x1NkM0Mlx1NUUyNiBoZWFkZXIgYFgtU3luYy1Ub2tlbjogPFx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Qz5gXHUzMDAyXG4gKiBDT1JTXHVGRjFBT0Igc2VydmVyIFx1NUZDNVx1OTg3Qlx1NjUzRVx1OTAxQSBPUFRJT05TIFx1OTg4NFx1NjhDMFx1RkYwOFx1NjI2OVx1NUM1NVx1NEVDRVx1OThERVx1NEU2Nlx1OTg3NVx1OTc2Mlx1NTNEMVx1OEQ3NyBmZXRjaCBcdTRGMUFcdTg4QUJcdTYyRTZcdUZGMDlcdTMwMDJcbiAqL1xuXG4vKiogXHU5RUQ4XHU4QkE0XHU3QUVGXHU1M0UzXHUzMDAyXHU1M0VGXHU1NzI4IE9CIFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1OTg3NVx1NjUzOVx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUE9SVCA9IDQ1Njc7XG5cbi8qKiBcdTkyNzRcdTY3NDMgaGVhZGVyIFx1NTQwRFx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IFRPS0VOX0hFQURFUiA9ICdYLVN5bmMtVG9rZW4nO1xuXG4vKiogXHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzIFVSTCBcdTg5RTNcdTY3OTBcdTdFRDNcdTY3OUNcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmVpc2h1RG9jUmVmIHtcbiAgLyoqIHdpa2kgbm9kZV90b2tlblx1RkYwOFx1NEYxOFx1NTE0OFx1NzUyOFx1RkYwQ1x1NTUyRlx1NEUwMFx1N0VEMVx1NUI5QVx1RkYwOVx1MzAwMiAqL1xuICBub2RlX3Rva2VuPzogc3RyaW5nO1xuICAvKiogZG9jeCBvYmpfdG9rZW5cdUZGMDhcdTU2REVcdTUxOTlcdTc1MjhcdUZGMDlcdTMwMDIgKi9cbiAgb2JqX3Rva2VuPzogc3RyaW5nO1xuICAvKiogc3BhY2VfaWRcdUZGMDhcdTkwRThcdTUyMDZcdTY0Q0RcdTRGNUNcdTk3MDBcdTg5ODFcdUZGMENcdTUzRUZcdTkwMDlcdUZGMDlcdTMwMDIgKi9cbiAgc3BhY2VfaWQ/OiBzdHJpbmc7XG59XG5cbi8qKiBHRVQgL3N0YXR1cyBcdTU0Q0RcdTVFOTRcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdHVzUmVzcG9uc2Uge1xuICBvazogdHJ1ZTtcbiAgLyoqIFx1NjNEMlx1NEVGNlx1NzI0OFx1NjcyQ1x1MzAwMiAqL1xuICB2ZXJzaW9uOiBzdHJpbmc7XG4gIC8qKiB2YXVsdCBcdTU0MERcdTMwMDIgKi9cbiAgdmF1bHQ6IHN0cmluZztcbiAgLyoqIGxhcmstY2xpIFx1NjYyRlx1NTQyNlx1NUMzMVx1N0VFQVx1MzAwMiAqL1xuICBsYXJrUmVhZHk6IGJvb2xlYW47XG4gIC8qKiBsYXJrLWNsaSBcdTcyNDhcdTY3MkNcdUZGMDhcdTYzQTJcdTZENEJcdTRFMERcdTUyMzBcdTY1RjZcdTRFM0EgbnVsbFx1RkYwOVx1MzAwMiAqL1xuICBsYXJrVmVyc2lvbjogc3RyaW5nIHwgbnVsbDtcbn1cblxuLyoqIFx1NzZFRVx1NUY1NVx1NjgxMVx1ODI4Mlx1NzBCOVx1RkYwOFx1N0VEOVx1NjI2OVx1NUM1NVx1NzZFRVx1NUY1NVx1NEUwQlx1NjJDOVx1NzUyOFx1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBUcmVlTm9kZSB7XG4gIC8qKiBcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHU3Njg0XHU4REVGXHU1Rjg0XHVGRjBDXHU1OTgyIFwiMFx1RkUwRlx1MjBFM1x1OEY5M1x1NTE2NS9cdUQ4M0RcdURDQTFcdTc4OEVcdTcyNDdcdThGOTNcdTUxNjVcdUZGMDhcdTk1RUFcdTVGRjVcdUZGMDlcIlx1MzAwMiAqL1xuICBwYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTY2M0VcdTc5M0FcdTU0MERcdUZGMDhcdTY3MDBcdTU0MEVcdTRFMDBcdTZCQjVcdUZGMDlcdTMwMDIgKi9cbiAgbGFiZWw6IHN0cmluZztcbiAgLyoqIFx1NkRGMVx1NUVBNlx1RkYwOFx1NjgzOT0wXHVGRjA5XHUzMDAyICovXG4gIGRlcHRoOiBudW1iZXI7XG59XG5cbi8qKiBHRVQgL3RyZWUgXHU1NENEXHU1RTk0XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFRyZWVSZXNwb25zZSB7XG4gIG9rOiB0cnVlO1xuICBkaXJzOiBUcmVlTm9kZVtdO1xufVxuXG4vKiogUE9TVCAvZmV0Y2ggXHU4QkY3XHU2QzQyXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIEZldGNoUmVxdWVzdCB7XG4gIC8qKiBcdTVGQzVcdTU4NkJcdUZGMUF3aWtpIG5vZGVfdG9rZW5cdTMwMDIgKi9cbiAgbm9kZV90b2tlbjogc3RyaW5nO1xuICAvKiogXHU1M0VGXHU5MDA5XHVGRjFBZG9jeCBvYmpfdG9rZW5cdUZGMDhcdTY3MkFcdTdFRDlcdTUyMTlcdTYzRDJcdTRFRjZcdTc1Mjggd2lraSArbm9kZS1nZXQgXHU4OUUzXHU2NzkwXHVGRjA5XHUzMDAyICovXG4gIG9ial90b2tlbj86IHN0cmluZztcbiAgLyoqIFx1NTNFRlx1OTAwOVx1RkYxQXNwYWNlX2lkXHUzMDAyICovXG4gIHNwYWNlX2lkPzogc3RyaW5nO1xuICAvKiogXHU4NDNEXHU1NzMwXHU3NkVFXHU1RjU1XHVGRjA4XHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1RkYwOVx1RkYwQ1x1NjcyQVx1N0VEOVx1NzUyOFx1OEJCRVx1N0Y2RVx1OUVEOFx1OEJBNFx1NTAzQ1x1MzAwMiAqL1xuICBkaXI/OiBzdHJpbmc7XG4gIC8qKiBcdTg5ODZcdTc2RDZcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTRFMERcdTU0MkJcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDlcdUZGMENcdTY3MkFcdTdFRDlcdTc1MjhcdTk4REVcdTRFNjZcdTY4MDdcdTk4OThcdTZFMDVcdTZEMTdcdTdFRDNcdTY3OUNcdTMwMDIgKi9cbiAgZmlsZW5hbWU/OiBzdHJpbmc7XG4gIC8qKiBcdTZENEZcdTg5QzhcdTU2NjhcdTU0MENcdTZCNjVcdTUyNERcdTc4NkVcdThCQTRcdTU0MEVcdTc2ODQgWUFNTCBcdTUxNDNcdTY1NzBcdTYzNkVcdTg5ODZcdTc2RDZcdUZGMUJcdTRFQzVcdTk2NTBcdTc3RTVcdThCQzZcdTVFOTNcdTUxNDNcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVcdTMwMDIgKi9cbiAgbWV0YT86IFBhcnRpYWw8S25vd2xlZGdlTWV0YT47XG4gIC8qKiBPQiBcdTUxODVcdTkwRThcdTRGN0ZcdTc1MjhcdUZGMUFDbGlwcGVyIFx1NTM2MFx1NEY0RFx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1RkYwQ1x1NTQ3RFx1NEUyRFx1NjVGNlx1NTM5Rlx1NEY0RFx1ODk4Nlx1NzZENlx1MzAwMiAqL1xuICByZXBsYWNlX3BhdGg/OiBzdHJpbmc7XG59XG5cbi8qKiBQT1NUIC9mZXRjaCBcdTU0Q0RcdTVFOTRcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmV0Y2hSZXNwb25zZSB7XG4gIG9rOiB0cnVlO1xuICAvKiogXHU4NDNEXHU1NzMwXHU1QjhDXHU2NTc0XHU4REVGXHU1Rjg0XHVGRjA4XHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1RkYwOVx1MzAwMiAqL1xuICBwYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTU0MkJcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDlcdTMwMDIgKi9cbiAgZmlsZW5hbWU6IHN0cmluZztcbiAgLyoqIFx1NjcyQ1x1NkIyMVx1NjYyRlx1NjVCMFx1NUVGQVx1OEZEOFx1NjYyRlx1NjZGNFx1NjVCMFx1MzAwMiAqL1xuICBhY3Rpb246ICdjcmVhdGVkJyB8ICd1cGRhdGVkJztcbiAgLyoqIFx1NTIwNlx1OTE0RFx1NTIzMFx1NzY4NFx1N0YxNlx1NzgwMVx1RkYwOGF1dG8tcmVuYW1lIFx1ODlFNlx1NTNEMVx1NTQwRVx1RkYwOVx1MzAwMiAqL1xuICBcdTdGMTZcdTc4MDE/OiBzdHJpbmc7XG4gIC8qKiBcdTk4REVcdTRFNjZcdTUzOUZcdTU5Q0JcdTY4MDdcdTk4OThcdTMwMDIgKi9cbiAgZmVpc2h1X3RpdGxlOiBzdHJpbmc7XG59XG5cbi8qKiBQT1NUIC9jbGlwIFx1OEJGN1x1NkM0Mlx1RkYxQVx1NEVGQlx1NjEwRlx1N0Y1MVx1OTg3NS9cdTUyMTJcdThCQ0RcdTUyNkFcdTVCNThcdTUyMzAgT2JzaWRpYW5cdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2xpcFJlcXVlc3Qge1xuICAvKiogXHU3RjUxXHU5ODc1XHU2ODA3XHU5ODk4XHUzMDAyICovXG4gIHRpdGxlPzogc3RyaW5nO1xuICAvKiogXHU2NzY1XHU2RTkwIFVSTFx1MzAwMiAqL1xuICB1cmw/OiBzdHJpbmc7XG4gIC8qKiBcdTY3NjVcdTZFOTBcdTdDN0JcdTU3OEJcdTMwMDIgKi9cbiAgc291cmNlS2luZD86ICdmZWlzaHUtYmFzZScgfCAnYXJ0aWNsZScgfCAnc2VsZWN0aW9uJyB8ICdnZW5lcmljLXBhZ2UnO1xuICAvKiogXHU5MDA5XHU0RTJEXHU2NTg3XHU2NzJDXHU2MjE2XHU2QjYzXHU2NTg3XHU2NDU4XHU4OTgxXHUzMDAyICovXG4gIHRleHQ/OiBzdHJpbmc7XG4gIC8qKiBBSSBcdTYyMTZcdTg5QzRcdTUyMTlcdThGNkNcdTYzNjJcdTU0MEVcdTc2ODQgT2JzaWRpYW4gTWFya2Rvd24gXHU2QjYzXHU2NTg3XHUzMDAyICovXG4gIGJvZHlNYXJrZG93bj86IHN0cmluZztcbiAgLyoqIFx1NTM5Rlx1NTlDQlx1NTNFRlx1ODlDMVx1NjU4N1x1NjcyQ1x1MzAwMiAqL1xuICByYXdUZXh0Pzogc3RyaW5nO1xuICAvKiogXHU5ODc1XHU5NzYyXHU2M0NGXHU4RkYwXHUzMDAyICovXG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICAvKiogXHU4NDNEXHU1NzMwXHU3NkVFXHU1RjU1XHVGRjA4XHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1RkYwOVx1MzAwMlx1NjcyQVx1N0VEOVx1NzUyOCBPQiBcdTYzRDJcdTRFRjZcdTlFRDhcdThCQTRcdTc2RUVcdTVGNTVcdTMwMDIgKi9cbiAgZGlyPzogc3RyaW5nO1xuICAvKiogXHU1MkZFXHU5MDA5XHUyMDFDXHU4ODY1XHU1MTQ1XHU1MjMwXHU1REYyXHU2NzA5XHU2NTg3XHU2ODYzXHUyMDFEXHU2NUY2XHVGRjBDXHU4RkZEXHU1MkEwXHU1MjMwXHU4RkQ5XHU0RTJBXHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1NzY4NCBNYXJrZG93biBcdThERUZcdTVGODRcdTMwMDIgKi9cbiAgYXBwZW5kUGF0aD86IHN0cmluZztcbiAgLyoqIFx1NURGMlx1NjMwOVx1NjNEMlx1NEVGNlx1OTg4NFx1OEJCRVx1NUY1Mlx1NEUwMFx1NTMxNlx1NzY4NCBZQU1MIFx1NTE0M1x1NjU3MFx1NjM2RVx1MzAwMiAqL1xuICBtZXRhPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG5cbi8qKiBQT1NUIC9jbGlwIFx1NTRDRFx1NUU5NFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBDbGlwUmVzcG9uc2Uge1xuICBvazogdHJ1ZTtcbiAgLyoqIFx1ODQzRFx1NTczMFx1NUI4Q1x1NjU3NFx1OERFRlx1NUY4NFx1RkYwOFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdUZGMDlcdTMwMDIgKi9cbiAgcGF0aDogc3RyaW5nO1xuICAvKiogXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU1NDJCXHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA5XHUzMDAyICovXG4gIGZpbGVuYW1lOiBzdHJpbmc7XG4gIC8qKiBcdTY3MkNcdTZCMjFcdTY2MkZcdTY1QjBcdTVFRkFcdThGRDhcdTY2MkZcdTY2RjRcdTY1QjBcdTMwMDIgKi9cbiAgYWN0aW9uOiAnY3JlYXRlZCcgfCAndXBkYXRlZCc7XG59XG5cbi8qKiBQT1NUIC9leGlzdHMgXHU4QkY3XHU2QzQyXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIEV4aXN0c1JlcXVlc3Qge1xuICBub2RlX3Rva2VuOiBzdHJpbmc7XG59XG5cbi8qKiBQT1NUIC9leGlzdHMgXHU1NENEXHU1RTk0XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIEV4aXN0c1Jlc3BvbnNlIHtcbiAgb2s6IHRydWU7XG4gIGV4aXN0czogYm9vbGVhbjtcbiAgLyoqIFx1NURGMlx1NUI1OFx1NTcyOFx1NjVGNlx1N0VEOVx1NTFGQVx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdThERUZcdTVGODRcdTMwMDIgKi9cbiAgcGF0aD86IHN0cmluZztcbn1cblxuLyoqIFBPU1QgL3B1c2hiYWNrIFx1OEJGN1x1NkM0Mlx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdXNoYmFja1JlcXVlc3Qge1xuICAvKiogXHU0RThDXHU5MDA5XHU0RTAwXHVGRjFBXHU2NzJDXHU1NzMwXHU4REVGXHU1Rjg0XHVGRjA4XHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1RkYwOVx1MzAwMiAqL1xuICBwYXRoPzogc3RyaW5nO1xuICAvKiogXHU0RThDXHU5MDA5XHU0RTAwXHVGRjFBbm9kZV90b2tlblx1RkYwOFx1NEVDRVx1N0VEMVx1NUI5QVx1NjI3RVx1NjU4N1x1NEVGNlx1RkYwOVx1MzAwMiAqL1xuICBub2RlX3Rva2VuPzogc3RyaW5nO1xuICAvKiogXHU1RjNBXHU1MjM2XHU1NkRFXHU1MTk5XHVGRjA4XHU1RkZEXHU3NTY1IGhhc2ggXHU0RTAwXHU4MUY0XHU4REYzXHU4RkM3XHVGRjA5XHUzMDAyICovXG4gIGZvcmNlPzogYm9vbGVhbjtcbn1cblxuLyoqIFBPU1QgL3B1c2hiYWNrIFx1NTRDRFx1NUU5NFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdXNoYmFja1Jlc3BvbnNlIHtcbiAgb2s6IHRydWU7XG4gIC8qKiBcdTVCOUVcdTk2NDVcdTU2REVcdTUxOTlcdThGRDhcdTY2MkZcdThERjNcdThGQzdcdUZGMDhoYXNoIFx1NEUwMFx1ODFGNFx1RkYwOVx1MzAwMiAqL1xuICBhY3Rpb246ICdwdXNoZWQnIHwgJ3NraXBwZWQnO1xuICAvKiogXHU2NUIwXHU3Njg0IHN5bmNfaGFzaFx1MzAwMiAqL1xuICBoYXNoPzogc3RyaW5nO1xuICAvKiogXHU1NkRFXHU1MTk5XHU3Njg0XHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzXHU2ODA3XHU5ODk4XHUzMDAyICovXG4gIHRpdGxlPzogc3RyaW5nO1xufVxuXG4vKiogXHU3RURGXHU0RTAwXHU5NTE5XHU4QkVGXHU1NENEXHU1RTk0XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIEVycm9yUmVzcG9uc2Uge1xuICBvazogZmFsc2U7XG4gIC8qKiBcdTY3M0FcdTU2NjhcdTUzRUZcdThCRkJcdTk1MTlcdThCRUZcdTc4MDFcdTMwMDIgKi9cbiAgY29kZTogc3RyaW5nO1xuICAvKiogXHU0RUJBXHU3QzdCXHU1M0VGXHU4QkZCXHU2RDg4XHU2MDZGXHUzMDAyICovXG4gIG1lc3NhZ2U6IHN0cmluZztcbn1cblxuLyoqIFx1NjI0MFx1NjcwOVx1N0FFRlx1NzBCOVx1NUI5QVx1NEU0OVx1RkYwOFx1OERFRlx1NUY4NCArIFx1NjVCOVx1NkNENVx1RkYwOVx1RkYwQ1x1NEY5Qlx1NEUyNFx1N0FFRlx1NUYxNVx1NzUyOFx1OTA3Rlx1NTE0RFx1NjJGQ1x1NTE5OVx1NkYwMlx1NzlGQlx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IEVORFBPSU5UUyA9IHtcbiAgc3RhdHVzOiAnL3N0YXR1cycsXG4gIHRyZWU6ICcvdHJlZScsXG4gIGZldGNoOiAnL2ZldGNoJyxcbiAgY2xpcDogJy9jbGlwJyxcbiAgZXhpc3RzOiAnL2V4aXN0cycsXG4gIHB1c2hiYWNrOiAnL3B1c2hiYWNrJyxcbn0gYXMgY29uc3Q7XG5cbi8qKiBPYnNpZGlhbiBcdTdDRkJcdTdFREZcdTUzNEZcdThCQUVcdUZGMUFcdTZENEZcdTg5QzhcdTU2NjhcdTRFM0JcdTkwMUFcdTkwNTNcdTUyQThcdTRGNUNcdTU0MERcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBPQlNJRElBTl9MQVJLX0RPQ19BQ1RJT04gPSAnbGFyay1kb2MnO1xuXG4vKiogT2JzaWRpYW4gXHU3Q0ZCXHU3RURGXHU1MzRGXHU4QkFFXHVGRjFBXHU2RDRGXHU4OUM4XHU1NjY4XHU0RTNCXHU5MDFBXHU5MDUzIFVSSSBcdTUyNERcdTdGMDBcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBPQlNJRElBTl9MQVJLX0RPQ19VUklfUFJFRklYID0gYG9ic2lkaWFuOi8vJHtPQlNJRElBTl9MQVJLX0RPQ19BQ1RJT059YDtcblxuLyoqIG9ic2lkaWFuOi8vbGFyay1kb2MgXHU1M0MyXHU2NTcwXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIE9ic2lkaWFuTGFya0RvY1BhcmFtcyB7XG4gIC8qKiB2MyBcdTRFM0JcdTkwMUFcdTkwNTNcdTUxN0NcdTVCQjlcdTVCNTdcdTZCQjVcdUZGMENcdTRGMThcdTUxNDhcdTRGMjAgd2lraSBub2RlX3Rva2VuXHUzMDAyICovXG4gIHRva2VuPzogc3RyaW5nO1xuICAvKiogd2lraSBub2RlX3Rva2VuXHUzMDAyICovXG4gIG5vZGVfdG9rZW4/OiBzdHJpbmc7XG4gIC8qKiBkb2N4IG9ial90b2tlblx1MzAwMiAqL1xuICBvYmpfdG9rZW4/OiBzdHJpbmc7XG4gIC8qKiBcdTk4REVcdTRFNjZcdTc3RTVcdThCQzZcdTVFOTMgc3BhY2VfaWRcdTMwMDIgKi9cbiAgc3BhY2VfaWQ/OiBzdHJpbmc7XG4gIC8qKiBcdTk4NzVcdTk3NjJcdTY4MDdcdTk4OThcdTMwMDIgKi9cbiAgdGl0bGU/OiBzdHJpbmc7XG4gIC8qKiBcdTUzOUZcdTU5Q0JcdTk4REVcdTRFNjYgVVJMXHUzMDAyICovXG4gIHVybD86IHN0cmluZztcbiAgLyoqIFx1NTNFRlx1OTAwOVx1NzZFRVx1NjgwN1x1NzZFRVx1NUY1NVx1RkYxQlx1NEUzQVx1N0E3QVx1NjVGNlx1NzUzMSBPQiBcdTdBRUZcdTkwMDlcdTYyRTlcdTYyMTZcdTRGN0ZcdTc1MjhcdTlFRDhcdThCQTRcdTc2RUVcdTVGNTVcdTMwMDIgKi9cbiAgZGlyPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFx1Njc4NFx1OTAyMCBgb2JzaWRpYW46Ly9sYXJrLWRvY2AgVVJJXHUzMDAyXG4gKlxuICogUG9ueXRhaWw6IFx1NzUyOFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NTQ4Q1x1N0NGQlx1N0VERlx1NURGMlx1NjcwOVx1NzY4NFx1ODFFQVx1NUI5QVx1NEU0OVx1NTM0Rlx1OEJBRVx1ODBGRFx1NTI5Qlx1NjI3Rlx1OEY3RFx1NEUzQlx1OTAxQVx1OTA1M1x1RkYwQ1xuICogXHU0RTBEXHU1MThEXHU0RTNBXHUyMDFDXHU3MEI5XHU1MUZCXHU5OERFXHU0RTY2XHU2MzA5XHU5NEFFXHUyMDFEXHU5ODlEXHU1OTE2XHU1M0QxXHU2NjBFXHU0RTAwXHU1OTU3XHU1NDBFXHU1M0YwXHU2RDg4XHU2MDZGXHU1MzRGXHU4QkFFXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZE9ic2lkaWFuTGFya0RvY1VyaShwYXJhbXM6IE9ic2lkaWFuTGFya0RvY1BhcmFtcyk6IHN0cmluZyB7XG4gIGNvbnN0IHRva2VuID0gcGFyYW1zLnRva2VuIHx8IHBhcmFtcy5ub2RlX3Rva2VuIHx8IHBhcmFtcy5vYmpfdG9rZW47XG4gIGNvbnN0IHF1ZXJ5OiBBcnJheTxbc3RyaW5nLCBzdHJpbmcgfCB1bmRlZmluZWRdPiA9IFtcbiAgICBbJ3Rva2VuJywgdG9rZW5dLFxuICAgIFsnbm9kZV90b2tlbicsIHBhcmFtcy5ub2RlX3Rva2VuXSxcbiAgICBbJ29ial90b2tlbicsIHBhcmFtcy5vYmpfdG9rZW5dLFxuICAgIFsnc3BhY2VfaWQnLCBwYXJhbXMuc3BhY2VfaWRdLFxuICAgIFsndGl0bGUnLCBwYXJhbXMudGl0bGVdLFxuICAgIFsndXJsJywgcGFyYW1zLnVybF0sXG4gICAgWydkaXInLCBwYXJhbXMuZGlyXSxcbiAgXTtcbiAgY29uc3QgZW5jb2RlZCA9IHF1ZXJ5XG4gICAgLmZpbHRlcigoWywgdmFsdWVdKSA9PiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSAnJylcbiAgICAubWFwKChba2V5LCB2YWx1ZV0pID0+IGAke2VuY29kZVVSSUNvbXBvbmVudChrZXkpfT0ke2VuY29kZVVSSUNvbXBvbmVudChTdHJpbmcodmFsdWUpKX1gKVxuICAgIC5qb2luKCcmJyk7XG4gIHJldHVybiBlbmNvZGVkID8gYCR7T0JTSURJQU5fTEFSS19ET0NfVVJJX1BSRUZJWH0/JHtlbmNvZGVkfWAgOiBPQlNJRElBTl9MQVJLX0RPQ19VUklfUFJFRklYO1xufVxuXG4vKiogXHU4OUUzXHU2NzkwIGBvYnNpZGlhbjovL2xhcmstZG9jYCBVUkkgXHU2MjE2IE9ic2lkaWFuIHByb3RvY29sIGhhbmRsZXIgcGFyYW1zXHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VPYnNpZGlhbkxhcmtEb2NQYXJhbXMoXG4gIGlucHV0OiBzdHJpbmcgfCBVUkxTZWFyY2hQYXJhbXMgfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCB1bmRlZmluZWQ+LFxuKTogT2JzaWRpYW5MYXJrRG9jUGFyYW1zIHtcbiAgY29uc3Qgc2VhcmNoUGFyYW1zID0gKCgpID0+IHtcbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgcXVlcnkgPSBpbnB1dC5pbmNsdWRlcygnPycpID8gaW5wdXQuc2xpY2UoaW5wdXQuaW5kZXhPZignPycpICsgMSkgOiBpbnB1dDtcbiAgICAgIHJldHVybiBuZXcgVVJMU2VhcmNoUGFyYW1zKHF1ZXJ5KTtcbiAgICB9XG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zKSByZXR1cm4gaW5wdXQ7XG4gICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGlucHV0KSkge1xuICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHBhcmFtcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBwYXJhbXM7XG4gIH0pKCk7XG5cbiAgY29uc3QgZ2V0ID0gKGtleToga2V5b2YgT2JzaWRpYW5MYXJrRG9jUGFyYW1zKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+XG4gICAgc2VhcmNoUGFyYW1zLmdldChrZXkpIHx8IHVuZGVmaW5lZDtcblxuICBjb25zdCBwYXJzZWQ6IE9ic2lkaWFuTGFya0RvY1BhcmFtcyA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBvZiBbJ3Rva2VuJywgJ25vZGVfdG9rZW4nLCAnb2JqX3Rva2VuJywgJ3NwYWNlX2lkJywgJ3RpdGxlJywgJ3VybCcsICdkaXInXSBhcyBjb25zdCkge1xuICAgIGNvbnN0IHZhbHVlID0gZ2V0KGtleSk7XG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHBhcnNlZFtrZXldID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIHBhcnNlZDtcbn1cblxuLyoqIFx1OEZEQlx1NUVBNlx1OTYzNlx1NkJCNVx1RkYwOFx1NjI2OVx1NUM1NVx1NkQ2RVx1NUM0Mlx1NzUyOFx1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IHR5cGUgUHJvZ3Jlc3NTdGFnZSA9XG4gIHwgJ2Nvbm5lY3RpbmcnXG4gIHwgJ2ZldGNoaW5nLW1kJ1xuICB8ICdmZXRjaGluZy14bWwnXG4gIHwgJ3Jld3JpdGluZy1pbWFnZXMnXG4gIHwgJ3dyaXRpbmctZmlsZSdcbiAgfCAnYXNzaWduaW5nLWNvZGUnXG4gIHwgJ2RvbmUnXG4gIHwgJ2Vycm9yJztcbiIsICIvKipcbiAqIFx1NTE4NVx1NUJCOSBoYXNoXHVGRjA4XHU4RjdCXHU2ODM4XHU5QThDXHVGRjA5XHUzMDAyXHU0RjlEXHU2MzZFIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgIFx1MDBBNzYuMiBcdTZCNjVcdTlBQTQgMlx1MzAwMlxuICogXHU3NTI4IHNoYTI1Nlx1RkYwQ1x1NTNFQSBoYXNoIFx1NkI2M1x1NjU4N1x1RkYwOFx1NEUwRFx1NTQyQiBmcm9udG1hdHRlciBcdTc2ODQgc3luY18qIFx1NUI1N1x1NkJCNVx1RkYwQ1x1OTA3Rlx1NTE0RFx1ODFFQVx1NjMwN1x1RkYwOVx1MzAwMlxuICpcbiAqIFx1OERFOFx1NzNBRlx1NTg4M1x1RkYxQVx1NEYxOFx1NTE0OFx1NzUyOCBXZWIgQ3J5cHRvIEFQSVx1RkYwOFx1NkQ0Rlx1ODlDOFx1NTY2OCArIE5vZGUgMTgrIFx1OTBGRFx1NjcwOSBnbG9iYWxUaGlzLmNyeXB0by5zdWJ0bGVcdUZGMDlcdUZGMENcbiAqIGZhbGxiYWNrIFx1NTIzMCBub2RlOmNyeXB0b1x1RkYwOE9CIFx1NjNEMlx1NEVGNiBub2RlIFx1NzNBRlx1NTg4M1x1NEZERFx1OTY2OVx1RkYwOVx1MzAwMlxuICovXG5cbi8qKiBcdTU0MENcdTZCNjVcdTcyNDggc2hhMjU2IGhleFx1RkYwOFx1NEVDNSBOb2RlIFx1NzNBRlx1NTg4M1x1RkYwOVx1MzAwMlx1NkQ0Rlx1ODlDOFx1NTY2OFx1NzUyOCBib2R5SGFzaEFzeW5jXHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gYm9keUhhc2goYm9keTogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gTm9kZSBcdTczQUZcdTU4ODNcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGNyZWF0ZUhhc2ggfSA9IHJlcXVpcmUoJ25vZGU6Y3J5cHRvJykgYXMgdHlwZW9mIGltcG9ydCgnbm9kZTpjcnlwdG8nKTtcbiAgICByZXR1cm4gY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKGJvZHksICd1dGY4JykuZGlnZXN0KCdoZXgnKTtcbiAgfSBjYXRjaCB7XG4gICAgLy8gXHU2RDRGXHU4OUM4XHU1NjY4XHU3M0FGXHU1ODgzXHU2NUUwIHJlcXVpcmVcdUZGMENcdThENzAgYXN5bmMgXHU3MjQ4XHVGRjA4XHU4RkQ5XHU5MUNDXHU1NDBDXHU2QjY1XHU4RkQ0XHU1NkRFIGZhbGxiYWNrXHVGRjBDXHU4QzAzXHU3NTI4XHU2NUI5XHU1RTk0XHU3NTI4IGFzeW5jIFx1NzI0OFx1RkYwOVxuICAgIHJldHVybiBzeW5jRmFsbGJhY2tIYXNoKGJvZHkpO1xuICB9XG59XG5cbi8qKlxuICogXHU1RjAyXHU2QjY1IHNoYTI1NiBoZXhcdUZGMDhcdTZENEZcdTg5QzhcdTU2NjggKyBOb2RlIFx1OTAxQVx1NzUyOFx1RkYwOVx1MzAwMlx1NjNBOFx1ODM1MFx1NEY3Rlx1NzUyOFx1MzAwMlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYm9keUhhc2hBc3luYyhib2R5OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBjcnlwdG8gPSBnbG9iYWxUaGlzLmNyeXB0byBhcyB7IHN1YnRsZT86IHsgZGlnZXN0OiAoYWxnOiBzdHJpbmcsIGRhdGE6IEFycmF5QnVmZmVyKSA9PiBQcm9taXNlPEFycmF5QnVmZmVyPiB9IH07XG4gIGlmIChjcnlwdG8/LnN1YnRsZSkge1xuICAgIGNvbnN0IGJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGlnZXN0KCdTSEEtMjU2JywgbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKGJvZHkpLmJ1ZmZlciBhcyBBcnJheUJ1ZmZlcik7XG4gICAgcmV0dXJuIFsuLi5uZXcgVWludDhBcnJheShidWYpXS5tYXAoKGIpID0+IGIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xuICB9XG4gIHJldHVybiBzeW5jRmFsbGJhY2tIYXNoKGJvZHkpO1xufVxuXG4vKipcbiAqIFx1N0I4MFx1NjYxM1x1NTQwQ1x1NkI2NSBmYWxsYmFja1x1RkYwOFx1OTc1RVx1NTJBMFx1NUJDNlx1N0VBN1x1RkYwQ1x1NEVDNVx1NUY1MyBjcnlwdG8gQVBJIFx1OTBGRFx1NEUwRFx1NTNFRlx1NzUyOFx1NjVGNlx1NzUyOFx1RkYwOVx1MzAwMlxuICogXHU3NTI4IGRqYjIgXHU1M0Q4XHU3OUNEXHVGRjBDXHU0RkREXHU4QkMxXHU0RTAwXHU4MUY0XHU2MDI3XHU1MzczXHU1M0VGXHVGRjA4XHU4RjdCXHU2ODM4XHU5QThDXHU1NzNBXHU2NjZGXHVGRjA5XHUzMDAyXG4gKi9cbmZ1bmN0aW9uIHN5bmNGYWxsYmFja0hhc2goYm9keTogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IGgxID0gMHg4MTFjOWRjNTtcbiAgbGV0IGgyID0gMHgxMDAwMTkzO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGJvZHkubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjID0gYm9keS5jaGFyQ29kZUF0KGkpO1xuICAgIGgxID0gTWF0aC5pbXVsKGgxIF4gYywgMHgwMTAwMDE5Myk7XG4gICAgaDIgPSBNYXRoLmltdWwoaDIgXiAoYyArIDB4OWUzNzc5YjkpLCAweDg1ZWJjYTc3KTtcbiAgfVxuICByZXR1cm4gKGgxID4+PiAwKS50b1N0cmluZygxNikucGFkU3RhcnQoOCwgJzAnKSArIChoMiA+Pj4gMCkudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDgsICcwJykgKyAnX2ZhbGxiYWNrJztcbn1cblxuLyoqXG4gKiBcdTZCRDRcdTVCRjlcdTY2MkZcdTU0MjZcdTUzRDhcdTUzMTZcdTMwMDJcbiAqIEBwYXJhbSBjdXJyZW50IFx1NUY1M1x1NTI0RFx1NkI2M1x1NjU4NyBoYXNoXG4gKiBAcGFyYW0gbGFzdCBcdTRFMEFcdTZCMjFcdTU0MENcdTZCNjVcdTUxOTlcdTUxNjVcdTc2ODQgc3luY19oYXNoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0NoYW5nZWQoY3VycmVudDogc3RyaW5nLCBsYXN0Pzogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmICghbGFzdCkgcmV0dXJuIHRydWU7XG4gIHJldHVybiBjdXJyZW50ICE9PSBsYXN0O1xufVxuIiwgIi8qKlxuICogXHU5OERFXHU0RTY2XHU2ODA3XHU5ODk4IFx1MjE5MiBcdTVCODlcdTUxNjhcdTY1ODdcdTRFRjZcdTU0MERcdTZFMDVcdTZEMTdcdTMwMDJcdTRGOURcdTYzNkUgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3XHU0RThDXHU2QjY1XHU5QUE0IFx1MjQ2MVx1MzAwMlxuICogXHU4REU4XHU1RTczXHU1M0YwXHU5NzVFXHU2Q0Q1XHU1QjU3XHU3QjI2XHVGRjA4V2luZG93cy9tYWNPUy9MaW51eCBcdTVFNzZcdTk2QzZcdUZGMDlcdUZGMUEvIFxcIDogKiA/IFwiIDwgPiB8XG4gKiBcdTRFRTVcdTUzQ0FcdTYzQTdcdTUyMzZcdTVCNTdcdTdCMjZcdTMwMDFcdTk5OTZcdTVDM0VcdTcwQjlcdTUzRjcvXHU3QTdBXHU2ODNDXHVGRjA4V2luZG93cyBcdTc5ODFcdTZCNjJcdUZGMDlcdTMwMDJcbiAqL1xuXG5jb25zdCBJTExFR0FMID0gL1tcXC9cXFxcOio/XCI8PnxdL2c7XG5jb25zdCBDT05UUk9MID0gL1tcXHgwMC1cXHgxZlxceDdmXS9nO1xuXG4vKipcbiAqIFx1NkUwNVx1NkQxN1x1OThERVx1NEU2Nlx1NjgwN1x1OTg5OFx1NEUzQVx1NUI4OVx1NTE2OFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NEUwRFx1NTQyQlx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOVx1MzAwMlxuICogLSBcdTUzQkJcdTk3NUVcdTZDRDVcdTVCNTdcdTdCMjYgXHUyMTkyIFx1NzUyOFx1NEUwQlx1NTIxMlx1N0VCRlx1NjZGRlx1NjM2MlxuICogLSBcdTYyOThcdTUzRTBcdThGREVcdTdFRURcdTdBN0FcdTc2N0RcbiAqIC0gXHU1M0JCXHU5OTk2XHU1QzNFXHU3MEI5XHU1M0Y3L1x1N0E3QVx1NjgzQ1xuICogLSBcdTYyMkFcdTY1QURcdTUyMzAgMTAwIFx1NUI1N1x1N0IyNlx1RkYwOFx1NEZERFx1NzU1OVx1N0YxNlx1NzgwMVx1NTI0RFx1N0YwMFx1N0E3QVx1OTVGNFx1RkYwOVxuICogLSBcdTdBN0FcdTY4MDdcdTk4OThcdTU2REVcdTkwMDBcdTUyMzAgXCJcdTY3MkFcdTU0N0RcdTU0MERcIlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVGaWxlbmFtZSh0aXRsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IHMgPSAodGl0bGUgPz8gJycpLnRyaW0oKTtcbiAgcyA9IHMucmVwbGFjZShJTExFR0FMLCAnXycpLnJlcGxhY2UoQ09OVFJPTCwgJycpO1xuICBzID0gcy5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpO1xuICAvLyBXaW5kb3dzIFx1Nzk4MVx1NkI2Mlx1OTk5Nlx1NUMzRVx1NzBCOVx1NTNGNy9cdTdBN0FcdTY4M0NcbiAgcyA9IHMucmVwbGFjZSgvXltcXC5cXHNdK3xbXFwuXFxzXSskL2csICcnKTtcbiAgaWYgKHMubGVuZ3RoID4gMTAwKSBzID0gcy5zbGljZSgwLCAxMDApLnRyaW0oKTtcbiAgcmV0dXJuIHMgfHwgJ1x1NjcyQVx1NTQ3RFx1NTQwRCc7XG59XG5cbi8qKlxuICogXHU1MkEwIC5tZCBcdTYyNjlcdTVDNTVcdUZGMDhcdTgyRTVcdTVERjJcdTY3MDlcdTVDMzFcdTRFMERcdTkxQ0RcdTU5MERcdTUyQTBcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhNZEV4dChuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpLmVuZHNXaXRoKCcubWQnKSA/IG5hbWUgOiBgJHtuYW1lfS5tZGA7XG59XG5cbi8qKlxuICogXHU2MkZDXHU2M0E1XHU3NkVFXHU1RjU1XHU0RTBFXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU1OTA0XHU3NDA2XHU2NTlDXHU2NzYwXHVGRjA5XHUzMDAyXG4gKiBAcGFyYW0gZGlyIFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdTc2ODRcdTc2RUVcdTVGNTVcdUZGMENcdTU5ODIgXCIwXHVGRTBGXHUyMEUzXHU4RjkzXHU1MTY1L1x1RDgzRFx1RENBMVx1Nzg4RVx1NzI0N1x1OEY5M1x1NTE2NVwiXG4gKiBAcGFyYW0gZmlsZW5hbWUgXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU1NDJCXHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBqb2luUGF0aChkaXI6IHN0cmluZyB8IHVuZGVmaW5lZCwgZmlsZW5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICghZGlyIHx8IGRpciA9PT0gJy4nIHx8IGRpciA9PT0gJy8nKSByZXR1cm4gZmlsZW5hbWU7XG4gIGNvbnN0IGQgPSBkaXIucmVwbGFjZSgvW1xcL1xcXFxdKyQvLCAnJykucmVwbGFjZSgvXltcXC9cXFxcXSsvLCAnJyk7XG4gIHJldHVybiBkID8gYCR7ZH0vJHtmaWxlbmFtZX1gIDogZmlsZW5hbWU7XG59XG4iLCAiLyoqXG4gKiBcdTU2RkVcdTcyNDcgdG9rZW4gXHU1OTA0XHU3NDA2XHUzMDAyXHU0RjlEXHU2MzZFIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgIFx1MDBBNzMuMyArIGAwM19cdTY4M0NcdTVGMEZcdTg5QzRcdTgzMDMubWRgIFx1MDBBN1x1NTE2RFx1MzAwMlxuICpcbiAqIFx1OThERVx1NEU2Nlx1NUJGQ1x1NTFGQVx1NzY4NFx1NTZGRVx1NzI0N1x1OTRGRVx1NjNBNVx1NUY2Mlx1NjAwMVx1RkYxQVxuICogICAtIG1kIFx1NUJGQ1x1NTFGQVx1RkYxQWAhW10oaHR0cHM6Ly9pbnRlcm5hbC1hcGktZHJpdmUtc3RyZWFtLmZlaXNodS5jbi8uLi4vYXV0aGNvZGU9Li4uKWBcdUZGMDhcdTk3MDBcdTc2N0JcdTVGNTVcdTYwMDFcdUZGMEMxaCBcdThGQzdcdTY3MUZcdUZGMDlcbiAqICAgLSB4bWwgXHU1QkZDXHU1MUZBXHVGRjFBYDxpbWcgc3JjPVwiRklMRV9UT0tFTlwiIGhyZWY9XCJhdXRoY29kZV91cmxcIi8+YFx1RkYwOEZJTEVfVE9LRU4gXHU2QzM4XHU0RTQ1XHU0RTBEXHU4RkM3XHU2NzFGXHVGRjA5XG4gKlxuICogT0IgXHU5MUNDXHU3RURGXHU0RTAwXHU1MTk5XHU2MjEwXHVGRjFBYCFbXShmZWlzaHU6Ly9GSUxFX1RPS0VOKWBcbiAqIFx1OTg4NFx1ODlDOFx1NjVGNlx1NzUzMSBPQiBcdTYzRDJcdTRFRjZcdThDMDMgYGxhcmstY2xpIGRvY3MgK21lZGlhLWRvd25sb2FkYCBcdTYzNjJcdTRFMzRcdTY1RjZcdTk0RkVcdTYzQTVcdTMwMDJcbiAqL1xuXG4vKiogT0IgXHU0RkE3XHU1NkZFXHU3MjQ3XHU1RjE1XHU3NTI4XHU1MzRGXHU4QkFFXHU1MjREXHU3RjAwXHUzMDAyICovXG5leHBvcnQgY29uc3QgRkVJU0hVX1BST1RPID0gJ2ZlaXNodTovLyc7XG5cbi8qKiBcdTk4REVcdTRFNjYgaW50ZXJuYWwtYXBpIFx1NTZGRVx1NzI0N1x1NTdERlx1NTQwRFx1RkYwOFx1OEJDNlx1NTIyQlx1OTcwMFx1NzY3Qlx1NUY1NVx1NjAwMVx1NzY4NFx1NEUzNFx1NjVGNlx1OTRGRVx1NjNBNVx1RkYwOVx1MzAwMiAqL1xuY29uc3QgSU5URVJOQUxfQVBJX0hPU1QgPSAnaW50ZXJuYWwtYXBpLWRyaXZlLXN0cmVhbS5mZWlzaHUuY24nO1xuY29uc3QgSU5URVJOQUxfQVBJX0hPU1RfTEFSSyA9ICdpbnRlcm5hbC1hcGktZHJpdmUtc3RyZWFtLmxhcmtzdWl0ZS5jb20nO1xuXG4vKiogZmlsZV90b2tlbiBcdTY4M0NcdTVGMEZcdUZGMUFcdTk4REVcdTRFNjYgdG9rZW4gXHU2NjJGIGJhc2U2Mi1pc2hcdUZGMENcdTk1N0ZcdTVFQTYgfjI4XHUzMDAyICovXG5jb25zdCBUT0tFTl9SRSA9IC9bQS1aYS16MC05XXsyMCx9LztcblxuLyoqXG4gKiBcdTRFQ0VcdTk4REVcdTRFNjYgaW50ZXJuYWwtYXBpIGF1dGhjb2RlIFVSTCBcdTkxQ0NcdTYzRDBcdTUzRDYgZmlsZV90b2tlblx1MzAwMlxuICogVVJMIFx1NUY2Mlx1NTk4MiBgaHR0cHM6Ly9pbnRlcm5hbC1hcGktZHJpdmUtc3RyZWFtLmZlaXNodS5jbi9kcml2ZS1zdHJlYW0vPFRPS0VOPi88ZXh0cmE+P2F1dGhjb2RlPS4uLmBcbiAqIFx1NTNENlx1OERFRlx1NUY4NFx1NkJCNVx1NEUyRFx1NjcwMFx1OTU3Rlx1NzY4NCB0b2tlbi1saWtlIFx1NUI1MFx1NEUzMlx1MzAwMlxuICogQHJldHVybnMgdG9rZW4gXHU2MjE2IG51bGxcdUZGMDhcdTY1RTBcdTZDRDVcdThCQzZcdTUyMkJcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RUb2tlbkZyb21BdXRoY29kZVVybCh1cmw6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBpZiAoIXVybCkgcmV0dXJuIG51bGw7XG4gIGxldCB1OiBVUkw7XG4gIHRyeSB7XG4gICAgdSA9IG5ldyBVUkwodXJsKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgaG9zdCA9IHUuaG9zdG5hbWU7XG4gIGlmIChob3N0ICE9PSBJTlRFUk5BTF9BUElfSE9TVCAmJiBob3N0ICE9PSBJTlRFUk5BTF9BUElfSE9TVF9MQVJLKSByZXR1cm4gbnVsbDtcbiAgY29uc3Qgc2VnbWVudHMgPSB1LnBhdGhuYW1lLnNwbGl0KCcvJykuZmlsdGVyKEJvb2xlYW4pO1xuICBsZXQgYmVzdDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIGZvciAoY29uc3Qgc2VnIG9mIHNlZ21lbnRzKSB7XG4gICAgY29uc3QgbSA9IHNlZy5tYXRjaChUT0tFTl9SRSk7XG4gICAgaWYgKG0gJiYgKCFiZXN0IHx8IG1bMF0ubGVuZ3RoID4gYmVzdC5sZW5ndGgpKSBiZXN0ID0gbVswXTtcbiAgfVxuICByZXR1cm4gYmVzdDtcbn1cblxuLyoqXG4gKiBcdTYyOEEgbWQgXHU2QjYzXHU2NTg3XHU5MUNDXHU3Njg0IGludGVybmFsLWFwaSBhdXRoY29kZSBcdTU2RkVcdTcyNDdcdTk0RkVcdTYzQTVcdTY2RkZcdTYzNjJcdTRFM0EgYGZlaXNodTovL1RPS0VOYFx1MzAwMlxuICogXHU2M0QwXHU0RjlCXHU0RTAwXHU0RTJBIHRva2VuIFx1NjYyMFx1NUMwNFx1ODg2OFx1RkYwOHhtbCBcdTVCRkNcdTUxRkFcdTYyRkZcdTUyMzBcdTc2ODQgc3JjIHRva2VuIFx1MjE5MiBocmVmIFx1NTNFRlx1ODBGRFx1NTQyQlx1NTQwQyB0b2tlblx1RkYwOVx1MzAwMlxuICogXHU1QkY5XHU2MjdFXHU0RTBEXHU1MjMwXHU2NjIwXHU1QzA0XHU3Njg0IGF1dGhjb2RlIFVSTFx1RkYwQ1x1NUMxRFx1OEJENVx1NUMzMVx1NTczMCBleHRyYWN0XHUzMDAyXG4gKlxuICogQHBhcmFtIG1kIFx1NkI2M1x1NjU4NyBtYXJrZG93blxuICogQHBhcmFtIHRva2VuTWFwIHhtbCBcdTVCRkNcdTUxRkFcdTYyRkZcdTUyMzBcdTc2ODQgZmlsZV90b2tlbiBcdTk2QzZcdTU0MDhcdUZGMDhcdTc1MjhcdTRFOEVcdTdDQkVcdTc4NkVcdTUzMzlcdTkxNERcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJld3JpdGVJbWFnZXNUb0ZlaXNodVByb3RvKFxuICBtZDogc3RyaW5nLFxuICB0b2tlbk1hcDogU2V0PHN0cmluZz4gfCBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IFNldCgpLFxuKTogc3RyaW5nIHtcbiAgLy8gXHU1MzM5XHU5MTREICFbYWx0XSh1cmwpIFx1NUY2Mlx1NUYwRlx1NzY4NFx1NTZGRVx1NzI0N1x1RkYwQ3VybCBcdTY2MkYgaW50ZXJuYWwtYXBpIFx1OTRGRVx1NjNBNVxuICBjb25zdCBpbWdSZSA9IC8hXFxbKFteXFxdXSopXFxdXFwoKFteKV0rKVxcKS9nO1xuICByZXR1cm4gbWQucmVwbGFjZShpbWdSZSwgKGZ1bGwsIGFsdDogc3RyaW5nLCB1cmw6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHRyaW1tZWQgPSB1cmwudHJpbSgpLnJlcGxhY2UoL148fD4kL2csICcnKTtcbiAgICAvLyBcdTVERjJcdTdFQ0ZcdTY2MkYgZmVpc2h1Oi8vIFx1NTM0Rlx1OEJBRVx1RkYwQ1x1OERGM1x1OEZDN1xuICAgIGlmICh0cmltbWVkLnN0YXJ0c1dpdGgoRkVJU0hVX1BST1RPKSkgcmV0dXJuIGZ1bGw7XG4gICAgLy8gaW50ZXJuYWwtYXBpIFx1OTRGRVx1NjNBNVx1RkYxQVx1NjNEMCB0b2tlblxuICAgIGlmIChcbiAgICAgIHRyaW1tZWQuaW5jbHVkZXMoSU5URVJOQUxfQVBJX0hPU1QpIHx8XG4gICAgICB0cmltbWVkLmluY2x1ZGVzKElOVEVSTkFMX0FQSV9IT1NUX0xBUkspXG4gICAgKSB7XG4gICAgICBjb25zdCB0b2tlbiA9IHBpY2tFeGFjdFRva2VuKHRva2VuTWFwLCB0cmltbWVkKSA/PyBleHRyYWN0VG9rZW5Gcm9tQXV0aGNvZGVVcmwodHJpbW1lZCkgPz8gcGlja0Zyb21NYXAodG9rZW5NYXApO1xuICAgICAgaWYgKHRva2VuKSByZXR1cm4gYCFbJHthbHR9XSgke0ZFSVNIVV9QUk9UT30ke3Rva2VufSlgO1xuICAgIH1cbiAgICAvLyBcdTY2NkVcdTkwMUFcdTU5MTZcdTk0RkVcdTYyMTYgYmFzZTY0XHVGRjBDXHU1MzlGXHU2ODM3XHU0RkREXHU3NTU5XG4gICAgcmV0dXJuIGZ1bGw7XG4gIH0pO1xufVxuXG4vKiogXHU0RUNFIHRva2VuTWFwIFx1OTFDQ1x1NTNENlx1NEUwMFx1NEUyQVx1RkYwOGZhbGxiYWNrXHVGRjBDXHU3NTI4XHU0RThFXHU5ODdBXHU1RThGXHU1MzM5XHU5MTREXHU1NzNBXHU2NjZGXHVGRjBDXHU4QzAzXHU3NTI4XHU2NUI5XHU1RTk0XHU0RjE4XHU1MTQ4XHU3Q0JFXHU3ODZFXHU1MzM5XHU5MTREXHVGRjA5XHUzMDAyICovXG5mdW5jdGlvbiBwaWNrRnJvbU1hcCh0b2tlbk1hcDogU2V0PHN0cmluZz4gfCBNYXA8c3RyaW5nLCBzdHJpbmc+KTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmICh0b2tlbk1hcCBpbnN0YW5jZW9mIE1hcCkgcmV0dXJuIG51bGw7XG4gIGlmICh0b2tlbk1hcC5zaXplID09PSAwKSByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIHRva2VuTWFwLnZhbHVlcygpLm5leHQoKS52YWx1ZSA/PyBudWxsO1xufVxuXG5mdW5jdGlvbiBwaWNrRXhhY3RUb2tlbih0b2tlbk1hcDogU2V0PHN0cmluZz4gfCBNYXA8c3RyaW5nLCBzdHJpbmc+LCB1cmw6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBpZiAoISh0b2tlbk1hcCBpbnN0YW5jZW9mIE1hcCkpIHJldHVybiBudWxsO1xuICByZXR1cm4gdG9rZW5NYXAuZ2V0KHVybCkgPz8gdG9rZW5NYXAuZ2V0KHVybC5yZXBsYWNlKC8mYW1wOy9nLCAnJicpKSA/PyBudWxsO1xufVxuXG4vKipcbiAqIFx1NEVDRSB4bWwgXHU5MUNDXHU2M0QwXHU1M0Q2XHU2MjQwXHU2NzA5IGA8aW1nIHNyYz1cIlRPS0VOXCIgLi4uLz5gIFx1NzY4NCBmaWxlX3Rva2VuXHUzMDAyXG4gKiBcdTk4REVcdTRFNjYgeG1sIFx1NzY4NCBzcmMgXHU3NkY0XHU2M0E1XHU1QzMxXHU2NjJGIGZpbGVfdG9rZW5cdUZGMDhcdTRFMERcdTY2MkYgVVJMXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0SW1nVG9rZW5zRnJvbVhtbCh4bWw6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgY29uc3QgdG9rZW5zID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IGltZ1JlID0gLzxpbWdcXGJbXj5dKlxcYnNyYz1bXCInXShbXlwiJ10rKVtcIiddW14+XSpcXC8/Pi9nO1xuICBsZXQgbTogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcbiAgd2hpbGUgKChtID0gaW1nUmUuZXhlYyh4bWwpKSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IHNyYyA9IG1bMV0udHJpbSgpO1xuICAgIGlmIChzcmMuc3RhcnRzV2l0aChGRUlTSFVfUFJPVE8pKSB7XG4gICAgICB0b2tlbnMuYWRkKHNyYy5zbGljZShGRUlTSFVfUFJPVE8ubGVuZ3RoKSk7XG4gICAgfSBlbHNlIGlmIChUT0tFTl9SRS50ZXN0KHNyYykgJiYgIXNyYy5zdGFydHNXaXRoKCdodHRwJykpIHtcbiAgICAgIHRva2Vucy5hZGQoc3JjKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFsuLi50b2tlbnNdO1xufVxuXG4vKipcbiAqIFx1NEVDRVx1OThERVx1NEU2NiBYTUwgXHU2M0QwXHU1M0Q2IGBocmVmIFx1NEUzNFx1NjVGNlx1NTZGRVx1OTRGRSAtPiBzcmMgZmlsZV90b2tlbmAgXHU2NjIwXHU1QzA0XHUzMDAyXG4gKiBtYXJrZG93biBcdTVCRkNcdTUxRkFcdTUzRUFcdTdFRDlcdTRFMzRcdTY1RjYgYXV0aGNvZGUgVVJMXHVGRjFCWE1MIFx1NzY4NCBzcmMgXHU2MjREXHU2NjJGXHU1M0VGXHU5NTdGXHU2NzFGXHU0RkREXHU1QjU4XHU3Njg0IGZpbGVfdG9rZW5cdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RJbWdUb2tlbk1hcEZyb21YbWwoeG1sOiBzdHJpbmcpOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgY29uc3QgbWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgY29uc3QgaW1nUmUgPSAvPGltZ1xcYltePl0qPi9nO1xuICBsZXQgbTogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcbiAgd2hpbGUgKChtID0gaW1nUmUuZXhlYyh4bWwpKSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IHRhZyA9IG1bMF07XG4gICAgY29uc3Qgc3JjID0gYXR0cih0YWcsICdzcmMnKTtcbiAgICBjb25zdCBocmVmID0gYXR0cih0YWcsICdocmVmJyk7XG4gICAgaWYgKCFzcmMgfHwgIWhyZWYgfHwgc3JjLnN0YXJ0c1dpdGgoJ2h0dHAnKSkgY29udGludWU7XG4gICAgaWYgKCFUT0tFTl9SRS50ZXN0KHNyYykpIGNvbnRpbnVlO1xuICAgIG1hcC5zZXQoZGVjb2RlWG1sQXR0cihocmVmKSwgc3JjKTtcbiAgfVxuICByZXR1cm4gbWFwO1xufVxuXG5mdW5jdGlvbiBhdHRyKHRhZzogc3RyaW5nLCBuYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKGBcXFxcYiR7bmFtZX09W1wiJ10oW15cIiddKylbXCInXWApO1xuICByZXR1cm4gdGFnLm1hdGNoKHJlKT8uWzFdID8/IG51bGw7XG59XG5cbmZ1bmN0aW9uIGRlY29kZVhtbEF0dHIodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB2YWx1ZVxuICAgIC5yZXBsYWNlKC8mYW1wOy9nLCAnJicpXG4gICAgLnJlcGxhY2UoLyZxdW90Oy9nLCAnXCInKVxuICAgIC5yZXBsYWNlKC8mYXBvczsvZywgXCInXCIpXG4gICAgLnJlcGxhY2UoLyZsdDsvZywgJzwnKVxuICAgIC5yZXBsYWNlKC8mZ3Q7L2csICc+Jyk7XG59XG5cbi8qKlxuICogXHU0RUNFIG1kIFx1NkI2M1x1NjU4N1x1OTFDQ1x1NjNEMFx1NTNENlx1NjI0MFx1NjcwOSBmZWlzaHU6Ly9UT0tFTlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEZlaXNodUltYWdlVG9rZW5zKG1kOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IHRva2VucyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCByZSA9IG5ldyBSZWdFeHAoXG4gICAgYCFcXFxcW1teXFxcXF1dKlxcXFxdXFxcXCgke0ZFSVNIVV9QUk9UTy5yZXBsYWNlKCcvJywgJ1xcXFwvJyl9KFtBLVphLXowLTldKylcXFxcKWAsXG4gICAgJ2cnLFxuICApO1xuICBsZXQgbTogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcbiAgd2hpbGUgKChtID0gcmUuZXhlYyhtZCkpICE9PSBudWxsKSB7XG4gICAgdG9rZW5zLmFkZChtWzFdKTtcbiAgfVxuICByZXR1cm4gWy4uLnRva2Vuc107XG59XG5cbi8qKlxuICogXHU2MjhBIE9CIFx1NkI2M1x1NjU4N1x1OTFDQ1x1NzY4NCBgIVtdKGZlaXNodTovL1RPS0VOKWAgXHU4RkQ4XHU1MzlGXHU0RTNBXHU5OERFXHU0RTY2IHhtbCBgPGltZyBzcmM9XCJUT0tFTlwiLz5gXHUzMDAyXG4gKiBcdTc1MjhcdTRFOEUgT0JcdTIxOTJcdTk4REVcdTRFNjZcdTU2REVcdTUxOTlcdUZGMDhtZCBcdTkwRThcdTUyMDZcdTc1MjggbWFya2Rvd25cdUZGMENcdTU2RkVcdTcyNDdcdTk3MDBcdTc1MjggeG1sIFx1NjgwN1x1N0I3RVx1NjI0RFx1ODBGRFx1ODhBQlx1OThERVx1NEU2Nlx1OEJDNlx1NTIyQlx1NEUzQVx1NURGMlx1NjcwOSB0b2tlblx1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmVpc2h1UHJvdG9Ub1htbChtZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgcmUgPSAvIVxcWyhbXlxcXV0qKVxcXVxcKGZlaXNodTpcXC9cXC8oW0EtWmEtejAtOV0rKVxcKS9nO1xuICByZXR1cm4gbWQucmVwbGFjZShyZSwgKF9mdWxsLCBfYWx0OiBzdHJpbmcsIHRva2VuOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gYDxpbWcgc3JjPVwiJHt0b2tlbn1cIi8+YDtcbiAgfSk7XG59XG4iLCAiY29uc3QgTk9UX1JFU09MVkVEOiB1bmlxdWUgc3ltYm9sID0gU3ltYm9sKCdOT1RfUkVTT0xWRUQnKVxuY29uc3QgTUVSR0VfS0VZOiB1bmlxdWUgc3ltYm9sID0gU3ltYm9sKCdNRVJHRV9LRVknKVxuXG50eXBlIFNjYWxhclJlcHJlc2VudCA9IChkYXRhOiBhbnkpID0+IHN0cmluZ1xudHlwZSBTZXF1ZW5jZVJlcHJlc2VudCA9IChkYXRhOiBhbnkpID0+IEFycmF5TGlrZTx1bmtub3duPlxudHlwZSBNYXBwaW5nUmVwcmVzZW50ID0gKGRhdGE6IGFueSkgPT4gTWFwPHVua25vd24sIHVua25vd24+XG5cbnR5cGUgSWRlbnRpZnlGbiA9IChkYXRhOiBhbnkpID0+IGJvb2xlYW5cbnR5cGUgUmVwcmVzZW50VGFnTmFtZUZuID0gKGRhdGE6IGFueSkgPT4gc3RyaW5nXG5cbmludGVyZmFjZSBTY2FsYXJUYWdEZWZpbml0aW9uPFJlc3VsdCA9IHVua25vd24+IHtcbiAgdGFnTmFtZTogc3RyaW5nXG4gIG5vZGVLaW5kOiAnc2NhbGFyJ1xuICBpbXBsaWNpdDogYm9vbGVhblxuICBtYXRjaEJ5VGFnUHJlZml4OiBib29sZWFuXG4gIC8vIFNldCBvZiBgc291cmNlLmNoYXJBdCgwKWAga2V5cyBmb3Igd2hpY2ggYHJlc29sdmVgIG1heSBzdWNjZWVkIChhIHN1cGVyc2V0IG9mXG4gIC8vIHdoYXQgaXQgcmVhbGx5IG1hdGNoZXMpLiBBIGtleSBpcyBlaXRoZXIgYSBzaW5nbGUgY2hhcmFjdGVyIG9yICcnIChlbXB0eVxuICAvLyBzb3VyY2UpLiBgbnVsbGAgbWVhbnMgXCJubyBjb25zdHJhaW50LCBhbHdheXMgdHJ5XCIuIFVzZWQgYnkgdGhlIGNvbXBvc2VyIHRvXG4gIC8vIGRpc3BhdGNoIGltcGxpY2l0IHNjYWxhcnMgYnkgZmlyc3QgY2hhcmFjdGVyIHdpdGhvdXQgcnVubmluZyBldmVyeSByZXNvbHZlci5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiByZWFkb25seSBzdHJpbmdbXSB8IG51bGxcbiAgLy8gYGlzRXhwbGljaXRgIGlzIHRydWUgZm9yIGFuIGV4cGxpY2l0IHRhZyAoYCEhdGFnYCksIGZhbHNlIGZvciBpbXBsaWNpdCBwbGFpblxuICAvLyBzY2FsYXIgcmVzb2x1dGlvbi5cbiAgcmVzb2x2ZTogKHNvdXJjZTogc3RyaW5nLCBpc0V4cGxpY2l0OiBib29sZWFuLCB0YWdOYW1lOiBzdHJpbmcpID0+IFJlc3VsdCB8IHR5cGVvZiBOT1RfUkVTT0xWRURcbiAgaWRlbnRpZnk6IElkZW50aWZ5Rm4gfCBudWxsXG4gIC8vIEEgc2NhbGFyJ3MgcHJpbnRlZCBmb3JtIGlzIHRleHQsIHNvIGByZXByZXNlbnRgIGFsd2F5cyB5aWVsZHMgYSBzdHJpbmcuIFRoZVxuICAvLyBmYWN0b3J5IHN1cHBsaWVzIGEgYFN0cmluZyhkYXRhKWAgZGVmYXVsdCB3aGVuIGEgdGFnIG9taXRzIGl0LlxuICByZXByZXNlbnQ6IFNjYWxhclJlcHJlc2VudFxuICByZXByZXNlbnRUYWdOYW1lOiBSZXByZXNlbnRUYWdOYW1lRm4gfCBudWxsXG59XG5cbmludGVyZmFjZSBTZXF1ZW5jZVRhZ0RlZmluaXRpb248Q2FycmllciA9IHVua25vd24sIFJlc3VsdCA9IENhcnJpZXI+IHtcbiAgdGFnTmFtZTogc3RyaW5nXG4gIG5vZGVLaW5kOiAnc2VxdWVuY2UnXG4gIGltcGxpY2l0OiBmYWxzZVxuICBtYXRjaEJ5VGFnUHJlZml4OiBib29sZWFuXG4gIGNyZWF0ZTogKHRhZ05hbWU6IHN0cmluZykgPT4gQ2FycmllclxuICBhZGRJdGVtOiAoY2FycmllcjogQ2FycmllciwgaXRlbTogdW5rbm93biwgaW5kZXg6IG51bWJlcikgPT4gdm9pZCB8IHN0cmluZ1xuICBmaW5hbGl6ZTogKGNhcnJpZXI6IENhcnJpZXIpID0+IFJlc3VsdFxuICBjYXJyaWVySXNSZXN1bHQ6IGJvb2xlYW5cbiAgaWRlbnRpZnk6IElkZW50aWZ5Rm4gfCBudWxsXG4gIHJlcHJlc2VudDogU2VxdWVuY2VSZXByZXNlbnRcbiAgcmVwcmVzZW50VGFnTmFtZTogUmVwcmVzZW50VGFnTmFtZUZuIHwgbnVsbFxufVxuXG5pbnRlcmZhY2UgTWFwcGluZ1RhZ0RlZmluaXRpb248Q2FycmllciA9IHVua25vd24sIFJlc3VsdCA9IENhcnJpZXI+IHtcbiAgdGFnTmFtZTogc3RyaW5nXG4gIG5vZGVLaW5kOiAnbWFwcGluZydcbiAgaW1wbGljaXQ6IGZhbHNlXG4gIG1hdGNoQnlUYWdQcmVmaXg6IGJvb2xlYW5cbiAgY3JlYXRlOiAodGFnTmFtZTogc3RyaW5nKSA9PiBDYXJyaWVyXG4gIC8vIFdyaXRlcyBhIHBhaXIuIFJldHVybnMgJycgb24gc3VjY2VzcywgYSBub24tZW1wdHkgZXJyb3IgbWVzc2FnZSBvdGhlcndpc2VcbiAgLy8gKGtleSBkb2VzIG5vdCBmaXQgdGhlIHJlcHJlc2VudGF0aW9uLCB2YWx1ZSByZWplY3RlZCwgLi4uKS4gQWx3YXlzIGEgc3RyaW5nXG4gIC8vIHNvIHRoZSBob3QgcGF0aCBuZXZlciBhbGxvY2F0ZXMgYW4gZXhjZXB0aW9uIHdyYXBwZXIuXG4gIGFkZFBhaXI6IChjYXJyaWVyOiBDYXJyaWVyLCBrZXk6IHVua25vd24sIHZhbHVlOiB1bmtub3duKSA9PiBzdHJpbmdcbiAgLy8gUmVhZCBzaWRlLCBtaXJyb3JzIGBNYXBgIOKAlCBkZWZpbmluZyBhIHJlcHJlc2VudGF0aW9uIG1lYW5zIGRlZmluaW5nIGhvdyB0b1xuICAvLyByZWFkIGl0IGJhY2suIGBoYXNgIGlzIHRoZSBob3QgZGVkdXAgcHJvYmUgKG1lbWJlcnNoaXAgd2l0aG91dCBmZXRjaGluZyB0aGVcbiAgLy8gdmFsdWUpOyBga2V5c2AvYGdldGAgYXJlIHVzZWQgb25seSBvbiB0aGUgY29sZCBtZXJnZSBwYXRoIChgPDxgKS5cbiAgaGFzOiAoY2FycmllcjogQ2Fycmllciwga2V5OiB1bmtub3duKSA9PiBib29sZWFuXG4gIGtleXM6IChyZXN1bHQ6IFJlc3VsdCkgPT4gSXRlcmFibGU8dW5rbm93bj5cbiAgZ2V0OiAocmVzdWx0OiBSZXN1bHQsIGtleTogdW5rbm93bikgPT4gdW5rbm93blxuICBmaW5hbGl6ZTogKGNhcnJpZXI6IENhcnJpZXIpID0+IFJlc3VsdFxuICBjYXJyaWVySXNSZXN1bHQ6IGJvb2xlYW5cbiAgaWRlbnRpZnk6IElkZW50aWZ5Rm4gfCBudWxsXG4gIHJlcHJlc2VudDogTWFwcGluZ1JlcHJlc2VudFxuICByZXByZXNlbnRUYWdOYW1lOiBSZXByZXNlbnRUYWdOYW1lRm4gfCBudWxsXG59XG5cbnR5cGUgVGFnRGVmaW5pdGlvbiA9XG4gIHwgU2NhbGFyVGFnRGVmaW5pdGlvbjxhbnk+XG4gIHwgU2VxdWVuY2VUYWdEZWZpbml0aW9uPGFueSwgYW55PlxuICB8IE1hcHBpbmdUYWdEZWZpbml0aW9uPGFueSwgYW55PlxuXG5pbnRlcmZhY2UgU2NhbGFyVGFnT3B0aW9uczxSZXN1bHQ+IHtcbiAgaW1wbGljaXQ/OiBib29sZWFuXG4gIG1hdGNoQnlUYWdQcmVmaXg/OiBib29sZWFuXG4gIGltcGxpY2l0Rmlyc3RDaGFycz86IHJlYWRvbmx5IHN0cmluZ1tdIHwgbnVsbFxuICByZXNvbHZlOiBTY2FsYXJUYWdEZWZpbml0aW9uPFJlc3VsdD5bJ3Jlc29sdmUnXVxuICBpZGVudGlmeT86IFNjYWxhclRhZ0RlZmluaXRpb248UmVzdWx0PlsnaWRlbnRpZnknXVxuICByZXByZXNlbnQ/OiBTY2FsYXJUYWdEZWZpbml0aW9uPFJlc3VsdD5bJ3JlcHJlc2VudCddXG4gIHJlcHJlc2VudFRhZ05hbWU/OiBTY2FsYXJUYWdEZWZpbml0aW9uPFJlc3VsdD5bJ3JlcHJlc2VudFRhZ05hbWUnXVxufVxuXG50eXBlIFJlcHJlc2VudE9wdGlvbnM8Q29udGFpbmVyLCBDYW5vbmljYWwsIFJlcHJlc2VudD4gPVxuICB8IHtcbiAgICAgIGlkZW50aWZ5PzogbnVsbFxuICAgICAgcmVwcmVzZW50PzogUmVwcmVzZW50XG4gICAgICByZXByZXNlbnRUYWdOYW1lPzogUmVwcmVzZW50VGFnTmFtZUZuIHwgbnVsbFxuICAgIH1cbiAgfCAoQ29udGFpbmVyIGV4dGVuZHMgQ2Fub25pY2FsXG4gICAgICA/IHtcbiAgICAgICAgICBpZGVudGlmeT86IElkZW50aWZ5Rm4gfCBudWxsXG4gICAgICAgICAgcmVwcmVzZW50PzogUmVwcmVzZW50XG4gICAgICAgICAgcmVwcmVzZW50VGFnTmFtZT86IFJlcHJlc2VudFRhZ05hbWVGbiB8IG51bGxcbiAgICAgICAgfVxuICAgICAgOiB7XG4gICAgICAgICAgaWRlbnRpZnk6IElkZW50aWZ5Rm5cbiAgICAgICAgICByZXByZXNlbnQ6IFJlcHJlc2VudFxuICAgICAgICAgIHJlcHJlc2VudFRhZ05hbWU/OiBSZXByZXNlbnRUYWdOYW1lRm4gfCBudWxsXG4gICAgICAgIH0pXG5cbnR5cGUgU2VxdWVuY2VUYWdPcHRpb25zPENhcnJpZXIsIFJlc3VsdCA9IENhcnJpZXI+ID0ge1xuICBtYXRjaEJ5VGFnUHJlZml4PzogYm9vbGVhblxuICBjcmVhdGU6IFNlcXVlbmNlVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+WydjcmVhdGUnXVxuICBhZGRJdGVtOiBTZXF1ZW5jZVRhZ0RlZmluaXRpb248Q2FycmllciwgUmVzdWx0PlsnYWRkSXRlbSddXG4gIGZpbmFsaXplPzogU2VxdWVuY2VUYWdEZWZpbml0aW9uPENhcnJpZXIsIFJlc3VsdD5bJ2ZpbmFsaXplJ11cbn0gJiBSZXByZXNlbnRPcHRpb25zPFJlc3VsdCwgQXJyYXlMaWtlPHVua25vd24+LCBTZXF1ZW5jZVJlcHJlc2VudD5cblxudHlwZSBNYXBwaW5nVGFnT3B0aW9uczxDYXJyaWVyLCBSZXN1bHQgPSBDYXJyaWVyPiA9IHtcbiAgbWF0Y2hCeVRhZ1ByZWZpeD86IGJvb2xlYW5cbiAgY3JlYXRlOiBNYXBwaW5nVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+WydjcmVhdGUnXVxuICBhZGRQYWlyOiBNYXBwaW5nVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+WydhZGRQYWlyJ11cbiAgaGFzOiBNYXBwaW5nVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+WydoYXMnXVxuICBrZXlzOiBNYXBwaW5nVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+WydrZXlzJ11cbiAgZ2V0OiBNYXBwaW5nVGFnRGVmaW5pdGlvbjxDYXJyaWVyLCBSZXN1bHQ+WydnZXQnXVxuICBmaW5hbGl6ZT86IE1hcHBpbmdUYWdEZWZpbml0aW9uPENhcnJpZXIsIFJlc3VsdD5bJ2ZpbmFsaXplJ11cbn0gJiBSZXByZXNlbnRPcHRpb25zPFJlc3VsdCwgTWFwPHVua25vd24sIHVua25vd24+LCBNYXBwaW5nUmVwcmVzZW50PlxuXG5mdW5jdGlvbiBkZWZpbmVTY2FsYXJUYWc8UmVzdWx0PiAodGFnTmFtZTogc3RyaW5nLCBvcHRpb25zOiBTY2FsYXJUYWdPcHRpb25zPFJlc3VsdD4pOiBTY2FsYXJUYWdEZWZpbml0aW9uPFJlc3VsdD4ge1xuICByZXR1cm4ge1xuICAgIHRhZ05hbWUsXG4gICAgbm9kZUtpbmQ6ICdzY2FsYXInLFxuICAgIGltcGxpY2l0OiBvcHRpb25zLmltcGxpY2l0ID8/IGZhbHNlLFxuICAgIG1hdGNoQnlUYWdQcmVmaXg6IG9wdGlvbnMubWF0Y2hCeVRhZ1ByZWZpeCA/PyBmYWxzZSxcbiAgICBpbXBsaWNpdEZpcnN0Q2hhcnM6IG9wdGlvbnMuaW1wbGljaXRGaXJzdENoYXJzID8/IG51bGwsXG4gICAgcmVzb2x2ZTogb3B0aW9ucy5yZXNvbHZlLFxuICAgIGlkZW50aWZ5OiBvcHRpb25zLmlkZW50aWZ5ID8/IG51bGwsXG4gICAgcmVwcmVzZW50OiBvcHRpb25zLnJlcHJlc2VudCA/PyAoZGF0YSA9PiBTdHJpbmcoZGF0YSkpLFxuICAgIHJlcHJlc2VudFRhZ05hbWU6IG9wdGlvbnMucmVwcmVzZW50VGFnTmFtZSA/PyBudWxsXG4gIH1cbn1cblxuZnVuY3Rpb24gZGVmaW5lU2VxdWVuY2VUYWc8Q2FycmllciwgUmVzdWx0ID0gQ2Fycmllcj4gKHRhZ05hbWU6IHN0cmluZywgb3B0aW9uczogU2VxdWVuY2VUYWdPcHRpb25zPENhcnJpZXIsIFJlc3VsdD4pOiBTZXF1ZW5jZVRhZ0RlZmluaXRpb248Q2FycmllciwgUmVzdWx0PiB7XG4gIGNvbnN0IGNhcnJpZXJJc1Jlc3VsdCA9IG9wdGlvbnMuZmluYWxpemUgPT09IHVuZGVmaW5lZFxuXG4gIHJldHVybiB7XG4gICAgdGFnTmFtZSxcbiAgICBub2RlS2luZDogJ3NlcXVlbmNlJyxcbiAgICBpbXBsaWNpdDogZmFsc2UsXG4gICAgbWF0Y2hCeVRhZ1ByZWZpeDogb3B0aW9ucy5tYXRjaEJ5VGFnUHJlZml4ID8/IGZhbHNlLFxuICAgIGNyZWF0ZTogb3B0aW9ucy5jcmVhdGUsXG4gICAgYWRkSXRlbTogb3B0aW9ucy5hZGRJdGVtLFxuICAgIGZpbmFsaXplOiBvcHRpb25zLmZpbmFsaXplID8/IChjYXJyaWVyID0+IGNhcnJpZXIgYXMgdW5rbm93biBhcyBSZXN1bHQpLFxuICAgIGNhcnJpZXJJc1Jlc3VsdCxcbiAgICBpZGVudGlmeTogb3B0aW9ucy5pZGVudGlmeSA/PyBudWxsLFxuICAgIHJlcHJlc2VudDogb3B0aW9ucy5yZXByZXNlbnQgPz8gKGRhdGEgPT4gZGF0YSBhcyBBcnJheUxpa2U8dW5rbm93bj4pLFxuICAgIHJlcHJlc2VudFRhZ05hbWU6IG9wdGlvbnMucmVwcmVzZW50VGFnTmFtZSA/PyBudWxsXG4gIH1cbn1cblxuZnVuY3Rpb24gZGVmaW5lTWFwcGluZ1RhZzxDYXJyaWVyLCBSZXN1bHQgPSBDYXJyaWVyPiAodGFnTmFtZTogc3RyaW5nLCBvcHRpb25zOiBNYXBwaW5nVGFnT3B0aW9uczxDYXJyaWVyLCBSZXN1bHQ+KTogTWFwcGluZ1RhZ0RlZmluaXRpb248Q2FycmllciwgUmVzdWx0PiB7XG4gIGNvbnN0IGNhcnJpZXJJc1Jlc3VsdCA9IG9wdGlvbnMuZmluYWxpemUgPT09IHVuZGVmaW5lZFxuXG4gIHJldHVybiB7XG4gICAgdGFnTmFtZSxcbiAgICBub2RlS2luZDogJ21hcHBpbmcnLFxuICAgIGltcGxpY2l0OiBmYWxzZSxcbiAgICBtYXRjaEJ5VGFnUHJlZml4OiBvcHRpb25zLm1hdGNoQnlUYWdQcmVmaXggPz8gZmFsc2UsXG4gICAgY3JlYXRlOiBvcHRpb25zLmNyZWF0ZSxcbiAgICBhZGRQYWlyOiBvcHRpb25zLmFkZFBhaXIsXG4gICAgaGFzOiBvcHRpb25zLmhhcyxcbiAgICBrZXlzOiBvcHRpb25zLmtleXMsXG4gICAgZ2V0OiBvcHRpb25zLmdldCxcbiAgICBmaW5hbGl6ZTogb3B0aW9ucy5maW5hbGl6ZSA/PyAoY2FycmllciA9PiBjYXJyaWVyIGFzIHVua25vd24gYXMgUmVzdWx0KSxcbiAgICBjYXJyaWVySXNSZXN1bHQsXG4gICAgaWRlbnRpZnk6IG9wdGlvbnMuaWRlbnRpZnkgPz8gbnVsbCxcbiAgICByZXByZXNlbnQ6IG9wdGlvbnMucmVwcmVzZW50ID8/IChkYXRhID0+IGRhdGEgYXMgTWFwPHVua25vd24sIHVua25vd24+KSxcbiAgICByZXByZXNlbnRUYWdOYW1lOiBvcHRpb25zLnJlcHJlc2VudFRhZ05hbWUgPz8gbnVsbFxuICB9XG59XG5cbmV4cG9ydCB7XG4gIE5PVF9SRVNPTFZFRCxcbiAgTUVSR0VfS0VZLFxuICBkZWZpbmVTY2FsYXJUYWcsXG4gIGRlZmluZVNlcXVlbmNlVGFnLFxuICBkZWZpbmVNYXBwaW5nVGFnLFxuXG4gIHR5cGUgU2NhbGFyVGFnRGVmaW5pdGlvbixcbiAgdHlwZSBTZXF1ZW5jZVRhZ0RlZmluaXRpb24sXG4gIHR5cGUgTWFwcGluZ1RhZ0RlZmluaXRpb24sXG4gIHR5cGUgVGFnRGVmaW5pdGlvbixcbiAgdHlwZSBTY2FsYXJUYWdPcHRpb25zLFxuICB0eXBlIFNlcXVlbmNlVGFnT3B0aW9ucyxcbiAgdHlwZSBNYXBwaW5nVGFnT3B0aW9ucyxcbiAgdHlwZSBTY2FsYXJSZXByZXNlbnQsXG4gIHR5cGUgU2VxdWVuY2VSZXByZXNlbnQsXG4gIHR5cGUgTWFwcGluZ1JlcHJlc2VudFxufVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZyB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3Qgc3RyVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpzdHInLCB7XG4gIHJlc29sdmU6IChzb3VyY2UpID0+IHNvdXJjZSxcbiAgaWRlbnRpZnk6IChkYXRhKSA9PiB0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZydcbn0pXG5cbmV4cG9ydCB7IHN0clRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IE5VTExfVkFMVUVTID0gWycnLCAnficsICdudWxsJywgJ051bGwnLCAnTlVMTCddXG5cbmNvbnN0IG51bGxDb3JlVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpudWxsJywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0czogJycgKGVtcHR5KSwgJ34nLCAnbnVsbCcvJ051bGwnLydOVUxMJy5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJycsICd+JywgJ24nLCAnTiddLFxuICByZXNvbHZlOiAoc291cmNlKSA9PiB7XG4gICAgaWYgKE5VTExfVkFMVUVTLmluZGV4T2Yoc291cmNlKSAhPT0gLTEpIHJldHVybiBudWxsXG5cbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH0sXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PiBvYmplY3QgPT09IG51bGwsXG4gIHJlcHJlc2VudDogKCkgPT4gJ251bGwnXG59KVxuXG5leHBvcnQgeyBudWxsQ29yZVRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IG51bGxKc29uVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpudWxsJywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0czogbnVsbC5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJ24nXSxcbiAgcmVzb2x2ZTogKHNvdXJjZSwgaXNFeHBsaWNpdCkgPT4ge1xuICAgIGlmIChzb3VyY2UgPT09ICdudWxsJyB8fCAoaXNFeHBsaWNpdCAmJiBzb3VyY2UgPT09ICcnKSkgcmV0dXJuIG51bGxcblxuICAgIHJldHVybiBOT1RfUkVTT0xWRURcbiAgfSxcbiAgaWRlbnRpZnk6IChvYmplY3QpID0+IG9iamVjdCA9PT0gbnVsbCxcbiAgcmVwcmVzZW50OiAoKSA9PiAnbnVsbCdcbn0pXG5cbmV4cG9ydCB7IG51bGxKc29uVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgTlVMTF9WQUxVRVMgPSBbJycsICd+JywgJ251bGwnLCAnTnVsbCcsICdOVUxMJ11cblxuY29uc3QgbnVsbFlhbWwxMVRhZyA9IGRlZmluZVNjYWxhclRhZygndGFnOnlhbWwub3JnLDIwMDI6bnVsbCcsIHtcbiAgaW1wbGljaXQ6IHRydWUsXG4gIC8vIFN1cGVyc2V0IG9mIHNvdXJjZS5jaGFyQXQoMCkgb3ZlciBhbGwgbWF0Y2hlZCBpbnB1dHM6ICcnIChlbXB0eSksICd+JywgJ251bGwnLydOdWxsJy8nTlVMTCcuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWycnLCAnficsICduJywgJ04nXSxcbiAgcmVzb2x2ZTogKHNvdXJjZSkgPT4ge1xuICAgIGlmIChOVUxMX1ZBTFVFUy5pbmRleE9mKHNvdXJjZSkgIT09IC0xKSByZXR1cm4gbnVsbFxuXG4gICAgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICB9LFxuICBpZGVudGlmeTogKG9iamVjdCkgPT4gb2JqZWN0ID09PSBudWxsLFxuICByZXByZXNlbnQ6ICgpID0+ICdudWxsJ1xufSlcblxuZXhwb3J0IHsgbnVsbFlhbWwxMVRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IFRSVUVfVkFMVUVTID0gWyd0cnVlJywgJ1RydWUnLCAnVFJVRSddXG5jb25zdCBGQUxTRV9WQUxVRVMgPSBbJ2ZhbHNlJywgJ0ZhbHNlJywgJ0ZBTFNFJ11cblxuY29uc3QgYm9vbENvcmVUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOmJvb2wnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBTdXBlcnNldCBvZiBzb3VyY2UuY2hhckF0KDApIG92ZXIgYWxsIG1hdGNoZWQgaW5wdXRzOiB0cnVlL1RydWUvVFJVRSwgZmFsc2UvRmFsc2UvRkFMU0UuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWyd0JywgJ1QnLCAnZicsICdGJ10sXG4gIHJlc29sdmU6IChzb3VyY2UpID0+IHtcbiAgICBpZiAoVFJVRV9WQUxVRVMuaW5kZXhPZihzb3VyY2UpICE9PSAtMSkgcmV0dXJuIHRydWVcbiAgICBpZiAoRkFMU0VfVkFMVUVTLmluZGV4T2Yoc291cmNlKSAhPT0gLTEpIHJldHVybiBmYWxzZVxuXG4gICAgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICB9LFxuICBpZGVudGlmeTogKG9iamVjdCkgPT4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT09ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgcmVwcmVzZW50OiAob2JqZWN0KSA9PiBvYmplY3QgPyAndHJ1ZScgOiAnZmFsc2UnXG59KVxuXG5leHBvcnQgeyBib29sQ29yZVRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IFRSVUVfVkFMVUVTID0gWyd0cnVlJ11cbmNvbnN0IEZBTFNFX1ZBTFVFUyA9IFsnZmFsc2UnXVxuXG5jb25zdCBib29sSnNvblRhZyA9IGRlZmluZVNjYWxhclRhZygndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsIHtcbiAgaW1wbGljaXQ6IHRydWUsXG4gIC8vIFN1cGVyc2V0IG9mIHNvdXJjZS5jaGFyQXQoMCkgb3ZlciBhbGwgbWF0Y2hlZCBpbnB1dHM6IHRydWUsIGZhbHNlLlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IFsndCcsICdmJ10sXG4gIHJlc29sdmU6IChzb3VyY2UpID0+IHtcbiAgICBpZiAoVFJVRV9WQUxVRVMuaW5kZXhPZihzb3VyY2UpICE9PSAtMSkgcmV0dXJuIHRydWVcbiAgICBpZiAoRkFMU0VfVkFMVUVTLmluZGV4T2Yoc291cmNlKSAhPT0gLTEpIHJldHVybiBmYWxzZVxuXG4gICAgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICB9LFxuICBpZGVudGlmeTogKG9iamVjdCkgPT4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT09ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgcmVwcmVzZW50OiAob2JqZWN0KSA9PiBvYmplY3QgPyAndHJ1ZScgOiAnZmFsc2UnXG59KVxuXG5leHBvcnQgeyBib29sSnNvblRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IFRSVUVfVkFMVUVTID0gWyd0cnVlJywgJ1RydWUnLCAnVFJVRScsICd5JywgJ1knLCAneWVzJywgJ1llcycsICdZRVMnLCAnb24nLCAnT24nLCAnT04nXVxuY29uc3QgRkFMU0VfVkFMVUVTID0gWydmYWxzZScsICdGYWxzZScsICdGQUxTRScsICduJywgJ04nLCAnbm8nLCAnTm8nLCAnTk8nLCAnb2ZmJywgJ09mZicsICdPRkYnXVxuXG5jb25zdCBib29sWWFtbDExVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpib29sJywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0cy5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJ3knLCAnWScsICduJywgJ04nLCAndCcsICdUJywgJ2YnLCAnRicsICdvJywgJ08nXSxcbiAgcmVzb2x2ZTogKHNvdXJjZSkgPT4ge1xuICAgIGlmIChUUlVFX1ZBTFVFUy5pbmRleE9mKHNvdXJjZSkgIT09IC0xKSByZXR1cm4gdHJ1ZVxuICAgIGlmIChGQUxTRV9WQUxVRVMuaW5kZXhPZihzb3VyY2UpICE9PSAtMSkgcmV0dXJuIGZhbHNlXG5cbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH0sXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICByZXByZXNlbnQ6IChvYmplY3QpID0+IG9iamVjdCA/ICd0cnVlJyA6ICdmYWxzZSdcbn0pXG5cbmV4cG9ydCB7IGJvb2xZYW1sMTFUYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZywgTk9UX1JFU09MVkVEIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG4vLyBZQU1MIDEuMiBDb3JlIHNjaGVtYSBpbXBsaWNpdCByZXNvbHV0aW9uOlxuLy8gWy0rXT8gWzAtOV0rIHwgMG8gWzAtN10rIHwgMHggWzAtOWEtZkEtRl0rXG5jb25zdCBZQU1MX0lOVEVHRVJfSU1QTElDSVRfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gIC8vIDBvMTIzXG4gICdeKD86MG9bMC03XSsnICtcbiAgLy8gMHgxQVxuICAnfDB4WzAtOWEtZkEtRl0rJyArXG4gIC8vIDEyMzQ1XG4gICd8Wy0rXT9bMC05XSspJCcpXG5cbi8vIEV4cGxpY2l0IGAhIWludGAgdmFsaWRhdGlvbiBpcyBzZXBhcmF0ZSBmcm9tIENvcmUgaW1wbGljaXQgcmVzb2x1dGlvbi5cbmNvbnN0IFlBTUxfSU5URUdFUl9FWFBMSUNJVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgLy8gMGIxMDEwXG4gICdeKD86Wy0rXT8wYlswLTFdKycgK1xuICAvLyAwbzEyM1xuICAnfFstK10/MG9bMC03XSsnICtcbiAgLy8gMHgxQVxuICAnfFstK10/MHhbMC05YS1mQS1GXSsnICtcbiAgLy8gMTIzNDVcbiAgJ3xbLStdP1swLTldKykkJylcblxuZnVuY3Rpb24gcGFyc2VZYW1sSW50ZWdlciAoc291cmNlOiBzdHJpbmcpIHtcbiAgbGV0IHZhbHVlID0gc291cmNlXG4gIGxldCBzaWduID0gMVxuXG4gIGlmICh2YWx1ZVswXSA9PT0gJy0nIHx8IHZhbHVlWzBdID09PSAnKycpIHtcbiAgICBpZiAodmFsdWVbMF0gPT09ICctJykgc2lnbiA9IC0xXG4gICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgxKVxuICB9XG5cbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoJzBiJykpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIDIpXG4gIGlmICh2YWx1ZS5zdGFydHNXaXRoKCcwbycpKSByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCA4KVxuICBpZiAodmFsdWUuc3RhcnRzV2l0aCgnMHgnKSkgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgMTYpXG5cbiAgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZSwgMTApXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sSW50ZWdlciAoc291cmNlOiBzdHJpbmcsIGlzRXhwbGljaXQ6IGJvb2xlYW4pIHtcbiAgaWYgKGlzRXhwbGljaXQpIHtcbiAgICBpZiAoIVlBTUxfSU5URUdFUl9FWFBMSUNJVF9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICB9IGVsc2UgaWYgKCFZQU1MX0lOVEVHRVJfSU1QTElDSVRfUEFUVEVSTi50ZXN0KHNvdXJjZSkpIHtcbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH1cblxuICBjb25zdCByZXN1bHQgPSBwYXJzZVlhbWxJbnRlZ2VyKHNvdXJjZSlcbiAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZShyZXN1bHQpID8gcmVzdWx0IDogTk9UX1JFU09MVkVEXG59XG5cbmNvbnN0IGludENvcmVUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsIHtcbiAgaW1wbGljaXQ6IHRydWUsXG4gIC8vIFN1cGVyc2V0IG9mIHNvdXJjZS5jaGFyQXQoMCkgb3ZlciBhbGwgbWF0Y2hlZCBpbnB1dHM6IG9wdGlvbmFsIHNpZ24gKyBkZWNpbWFsIGRpZ2l0LlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IFsnLScsICcrJywgLi4uJzAxMjM0NTY3ODknXSxcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxJbnRlZ2VyLFxuICBpZGVudGlmeTogKG9iamVjdCkgPT5cbiAgICAvLyBObyBhbmNpZW50IGJveGVkIG51bWJlcnMgc3VwcG9ydFxuICAgIE51bWJlci5pc0ludGVnZXIob2JqZWN0KSAmJlxuICAgIC8vIE5lZ2F0aXZlIHplcm8gPT4gISFmbG9hdFxuICAgICFPYmplY3QuaXMob2JqZWN0LCAtMCkgJiZcbiAgICAvLyBFeHBvbmVudGlhbCBmb3JtID0+ICEhZmxvYXQsIHJvdW5kLXRyaXAgZm9yICEhaW50IDFlMjEgd2lsbCBiZSBicm9rZW5cbiAgICBvYmplY3QudG9TdHJpbmcoMTApLmluZGV4T2YoJ2UnKSA8IDAsXG4gIHJlcHJlc2VudDogKG9iamVjdDogbnVtYmVyKSA9PiBvYmplY3QudG9TdHJpbmcoMTApXG59KVxuXG5leHBvcnQgeyBpbnRDb3JlVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuLy8gWUFNTCAxLjIgSlNPTiBzY2hlbWEgaW1wbGljaXQgcmVzb2x1dGlvbjpcbi8vIC0/ICggMCB8IFsxLTldIFswLTldKiApXG5jb25zdCBZQU1MX0lOVEVHRVJfSU1QTElDSVRfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gICdeLT8oPzowfFsxLTldWzAtOV0qKSQnKVxuXG4vLyBFeHBsaWNpdCBgISFpbnRgIHZhbGlkYXRpb24gaXMgc2VwYXJhdGUgZnJvbSBKU09OIGltcGxpY2l0IHJlc29sdXRpb24uXG5jb25zdCBZQU1MX0lOVEVHRVJfRVhQTElDSVRfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gIC8vIDBiMTAxMFxuICAnXig/OlstK10/MGJbMC0xXSsnICtcbiAgLy8gMG8xMjNcbiAgJ3xbLStdPzBvWzAtN10rJyArXG4gIC8vIDB4MUFcbiAgJ3xbLStdPzB4WzAtOWEtZkEtRl0rJyArXG4gIC8vIDEyMzQ1XG4gICd8Wy0rXT9bMC05XSspJCcpXG5cbmZ1bmN0aW9uIHBhcnNlWWFtbEludGVnZXIgKHNvdXJjZTogc3RyaW5nKSB7XG4gIGxldCB2YWx1ZSA9IHNvdXJjZVxuICBsZXQgc2lnbiA9IDFcblxuICBpZiAodmFsdWVbMF0gPT09ICctJyB8fCB2YWx1ZVswXSA9PT0gJysnKSB7XG4gICAgaWYgKHZhbHVlWzBdID09PSAnLScpIHNpZ24gPSAtMVxuICAgIHZhbHVlID0gdmFsdWUuc2xpY2UoMSlcbiAgfVxuXG4gIGlmICh2YWx1ZS5zdGFydHNXaXRoKCcwYicpKSByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCAyKVxuICBpZiAodmFsdWUuc3RhcnRzV2l0aCgnMG8nKSkgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgOClcbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoJzB4JykpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIDE2KVxuXG4gIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUsIDEwKVxufVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEludGVnZXIgKHNvdXJjZTogc3RyaW5nLCBpc0V4cGxpY2l0OiBib29sZWFuKSB7XG4gIGlmIChpc0V4cGxpY2l0KSB7XG4gICAgaWYgKCFZQU1MX0lOVEVHRVJfRVhQTElDSVRfUEFUVEVSTi50ZXN0KHNvdXJjZSkpIHJldHVybiBOT1RfUkVTT0xWRURcbiAgfSBlbHNlIGlmICghWUFNTF9JTlRFR0VSX0lNUExJQ0lUX1BBVFRFUk4udGVzdChzb3VyY2UpKSB7XG4gICAgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0gcGFyc2VZYW1sSW50ZWdlcihzb3VyY2UpXG4gIHJldHVybiBOdW1iZXIuaXNGaW5pdGUocmVzdWx0KSA/IHJlc3VsdCA6IE5PVF9SRVNPTFZFRFxufVxuXG5jb25zdCBpbnRKc29uVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBTdXBlcnNldCBvZiBzb3VyY2UuY2hhckF0KDApIG92ZXIgYWxsIG1hdGNoZWQgaW5wdXRzOiBvcHRpb25hbCAnLScgb3IgZGlnaXQuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWyctJywgLi4uJzAxMjM0NTY3ODknXSxcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxJbnRlZ2VyLFxuICBpZGVudGlmeTogKG9iamVjdCkgPT5cbiAgICAvLyBObyBhbmNpZW50IGJveGVkIG51bWJlcnMgc3VwcG9ydFxuICAgIE51bWJlci5pc0ludGVnZXIob2JqZWN0KSAmJlxuICAgIC8vIE5lZ2F0aXZlIHplcm8gPT4gISFmbG9hdFxuICAgICFPYmplY3QuaXMob2JqZWN0LCAtMCkgJiZcbiAgICAvLyBFeHBvbmVudGlhbCBmb3JtID0+ICEhZmxvYXQsIHJvdW5kLXRyaXAgZm9yICEhaW50IDFlMjEgd2lsbCBiZSBicm9rZW5cbiAgICBvYmplY3QudG9TdHJpbmcoMTApLmluZGV4T2YoJ2UnKSA8IDAsXG4gIHJlcHJlc2VudDogKG9iamVjdDogbnVtYmVyKSA9PiBvYmplY3QudG9TdHJpbmcoMTApXG59KVxuXG5leHBvcnQgeyBpbnRKc29uVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgWUFNTF9JTlRFR0VSX1BBVFRFUk4gPSBuZXcgUmVnRXhwKFxuICAvLyAwYjEwMTBcbiAgJ14oPzpbLStdPzBiWzAtMV9dKycgK1xuICAvLyAwMTIzXG4gICd8Wy0rXT8wWzAtN19dKycgK1xuICAvLyAweDFBXG4gICd8Wy0rXT8weFswLTlhLWZBLUZfXSsnICtcbiAgLy8gMToyM1xuICAnfFstK10/WzAtOV1bMC05X10qKD86OlswLTVdP1swLTldKSsnICtcbiAgLy8gMTIzNDVcbiAgJ3xbLStdPyg/OjB8WzEtOV1bMC05X10qKSkkJylcblxuZnVuY3Rpb24gcGFyc2VZYW1sSW50ZWdlciAoc291cmNlOiBzdHJpbmcpIHtcbiAgbGV0IHZhbHVlID0gc291cmNlLnJlcGxhY2UoL18vZywgJycpXG4gIGxldCBzaWduID0gMVxuXG4gIGlmICh2YWx1ZVswXSA9PT0gJy0nIHx8IHZhbHVlWzBdID09PSAnKycpIHtcbiAgICBpZiAodmFsdWVbMF0gPT09ICctJykgc2lnbiA9IC0xXG4gICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgxKVxuICB9XG5cbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoJzBiJykpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIDIpXG4gIGlmICh2YWx1ZS5zdGFydHNXaXRoKCcweCcpKSByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCAxNilcblxuICBpZiAodmFsdWUuaW5jbHVkZXMoJzonKSkge1xuICAgIGxldCByZXN1bHQgPSAwXG4gICAgZm9yIChjb25zdCBwYXJ0IG9mIHZhbHVlLnNwbGl0KCc6JykpIHJlc3VsdCA9IHJlc3VsdCAqIDYwICsgTnVtYmVyKHBhcnQpXG4gICAgcmV0dXJuIHNpZ24gKiByZXN1bHRcbiAgfVxuXG4gIGlmICh2YWx1ZSAhPT0gJzAnICYmIHZhbHVlWzBdID09PSAnMCcpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUsIDgpXG5cbiAgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZSwgMTApXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sSW50ZWdlciAoc291cmNlOiBzdHJpbmcpIHtcbiAgaWYgKCFZQU1MX0lOVEVHRVJfUEFUVEVSTi50ZXN0KHNvdXJjZSkpIHJldHVybiBOT1RfUkVTT0xWRURcblxuICBjb25zdCByZXN1bHQgPSBwYXJzZVlhbWxJbnRlZ2VyKHNvdXJjZSlcbiAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZShyZXN1bHQpID8gcmVzdWx0IDogTk9UX1JFU09MVkVEXG59XG5cbmNvbnN0IGludFlhbWwxMVRhZyA9IGRlZmluZVNjYWxhclRhZygndGFnOnlhbWwub3JnLDIwMDI6aW50Jywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0czogb3B0aW9uYWwgc2lnbiArIGRlY2ltYWwgZGlnaXQuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWyctJywgJysnLCAuLi4nMDEyMzQ1Njc4OSddLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbEludGVnZXIsXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PlxuICAgIC8vIE5vIGFuY2llbnQgYm94ZWQgbnVtYmVycyBzdXBwb3J0XG4gICAgTnVtYmVyLmlzSW50ZWdlcihvYmplY3QpICYmXG4gICAgLy8gTmVnYXRpdmUgemVybyA9PiAhIWZsb2F0XG4gICAgIU9iamVjdC5pcyhvYmplY3QsIC0wKSAmJlxuICAgIC8vIEV4cG9uZW50aWFsIGZvcm0gPT4gISFmbG9hdCwgcm91bmQtdHJpcCBmb3IgISFpbnQgMWUyMSB3aWxsIGJlIGJyb2tlblxuICAgIG9iamVjdC50b1N0cmluZygxMCkuaW5kZXhPZignZScpIDwgMCxcbiAgcmVwcmVzZW50OiAob2JqZWN0OiBudW1iZXIpID0+IG9iamVjdC50b1N0cmluZygxMClcbn0pXG5cbmV4cG9ydCB7IGludFlhbWwxMVRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IFlBTUxfRkxPQVRfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gIC8vIDIuNWU0LCAyLjUgYW5kIGludGVnZXJzXG4gICdeKD86Wy0rXT9bMC05XSsoPzpcXFxcLlswLTldKik/KD86W2VFXVstK10/WzAtOV0rKT8nICtcbiAgLy8gLjJlNCwgLjJcbiAgJ3xbLStdP1xcXFwuWzAtOV0rKD86W2VFXVstK10/WzAtOV0rKT8nICtcbiAgLy8gLmluZlxuICAnfFstK10/XFxcXC4oPzppbmZ8SW5mfElORiknICtcbiAgLy8gLm5hblxuICAnfFxcXFwuKD86bmFufE5hTnxOQU4pKSQnKVxuXG5jb25zdCBZQU1MX0ZMT0FUX1NQRUNJQUxfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gICdeKD86JyArXG4gIC8vIC5pbmZcbiAgJ1stK10/XFxcXC4oPzppbmZ8SW5mfElORiknICtcbiAgLy8gLm5hblxuICAnfFxcXFwuKD86bmFufE5hTnxOQU4pKSQnKVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEZsb2F0IChzb3VyY2U6IHN0cmluZykge1xuICBpZiAoIVlBTUxfRkxPQVRfUEFUVEVSTi50ZXN0KHNvdXJjZSkpIHJldHVybiBOT1RfUkVTT0xWRURcblxuICBsZXQgdmFsdWUgPSBzb3VyY2UudG9Mb3dlckNhc2UoKVxuICBjb25zdCBzaWduID0gdmFsdWVbMF0gPT09ICctJyA/IC0xIDogMVxuXG4gIGlmICgnKy0nLmluY2x1ZGVzKHZhbHVlWzBdKSkgdmFsdWUgPSB2YWx1ZS5zbGljZSgxKVxuXG4gIGlmICh2YWx1ZSA9PT0gJy5pbmYnKSByZXR1cm4gc2lnbiA9PT0gMSA/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA6IE51bWJlci5ORUdBVElWRV9JTkZJTklUWVxuICBpZiAodmFsdWUgPT09ICcubmFuJykgcmV0dXJuIE5hTlxuXG4gIGNvbnN0IHJlc3VsdCA9IHNpZ24gKiBwYXJzZUZsb2F0KHZhbHVlKVxuXG4gIGlmIChOdW1iZXIuaXNGaW5pdGUocmVzdWx0KSB8fCBZQU1MX0ZMT0FUX1NQRUNJQUxfUEFUVEVSTi50ZXN0KHNvdXJjZSkpIHJldHVybiByZXN1bHRcbiAgcmV0dXJuIE5PVF9SRVNPTFZFRFxufVxuXG5mdW5jdGlvbiByZXByZXNlbnRZYW1sRmxvYXQgKG9iamVjdDogbnVtYmVyKSB7XG4gIGlmIChpc05hTihvYmplY3QpKSByZXR1cm4gJy5uYW4nXG4gIGlmIChvYmplY3QgPT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkgcmV0dXJuICcuaW5mJ1xuICBpZiAob2JqZWN0ID09PSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpIHJldHVybiAnLS5pbmYnXG4gIGlmIChPYmplY3QuaXMob2JqZWN0LCAtMCkpIHJldHVybiAnLTAuMCdcblxuICBjb25zdCByZXN1bHQgPSBvYmplY3QudG9TdHJpbmcoMTApXG4gIHJldHVybiAvXlstK10/WzAtOV0rZS8udGVzdChyZXN1bHQpID8gcmVzdWx0LnJlcGxhY2UoJ2UnLCAnLmUnKSA6IHJlc3VsdFxufVxuXG5jb25zdCBmbG9hdENvcmVUYWcgPSBkZWZpbmVTY2FsYXJUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0Jywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gU3VwZXJzZXQgb2Ygc291cmNlLmNoYXJBdCgwKSBvdmVyIGFsbCBtYXRjaGVkIGlucHV0czogb3B0aW9uYWwgc2lnbiwgJy4nLCBvciBkaWdpdFxuICAvLyAoJy5pbmYnLycubmFuJyBzdGFydCB3aXRoICcuJykuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWyctJywgJysnLCAnLicsIC4uLicwMTIzNDU2Nzg5J10sXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sRmxvYXQsXG4gIGlkZW50aWZ5OiAob2JqZWN0KSA9PlxuICAgIC8vIE5vIGFuY2llbnQgYm94ZWQgbnVtYmVycyBzdXBwb3J0XG4gICAgdHlwZW9mIG9iamVjdCA9PT0gJ251bWJlcicgJiZcbiAgICAoXG4gICAgICAvLyBXZSBsYW5kIGhlcmUgYWxsIG51bWJlcnMsIG5vdCBoYW5kbGVkIChkZWNsaW5lZCkgYnkgISFpbnQgYC5pZGVudGlmeWBcbiAgICAgIC8vIFRoZSBzYW1lIGNvbmRpdGlvbiBhcyBmb3IgISFpbnQsIGJ1dCByZXZlcnNlZC5cblxuICAgICAgLy8gRmlsdGVyIG91dCBpbnRlZ2Vycy4uLlxuICAgICAgIU51bWJlci5pc0ludGVnZXIob2JqZWN0KSB8fFxuICAgICAgLy8gYnV0IGFsbG93IG5lZ2F0aXZlIHplcm9cbiAgICAgIE9iamVjdC5pcyhvYmplY3QsIC0wKSB8fFxuICAgICAgLy8gYW5kIGludGVnZXJzIHdpdGggZXhwb25lbnRpYWwgZm9ybVxuICAgICAgb2JqZWN0LnRvU3RyaW5nKDEwKS5pbmRleE9mKCdlJykgPj0gMFxuICAgICksXG4gIHJlcHJlc2VudDogcmVwcmVzZW50WWFtbEZsb2F0XG59KVxuXG5leHBvcnQgeyBmbG9hdENvcmVUYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZywgTk9UX1JFU09MVkVEIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG4vLyBZQU1MIDEuMiBKU09OIHNjaGVtYSBpbXBsaWNpdCByZXNvbHV0aW9uOlxuLy8gLT8gKCAwIHwgWzEtOV0gWzAtOV0qICkgKCBcXC4gWzAtOV0qICk/ICggW2VFXSBbLStdPyBbMC05XSsgKT9cbmNvbnN0IFlBTUxfRkxPQVRfSU1QTElDSVRfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gIC8vIDIuNWU0LCAyLjUgYW5kIGludGVnZXJzXG4gICdeLT8oPzowfFsxLTldWzAtOV0qKSg/OlxcXFwuWzAtOV0qKT8oPzpbZUVdWy0rXT9bMC05XSspPyQnKVxuXG4vLyBFeHBsaWNpdCBgISFmbG9hdGAgdmFsaWRhdGlvbiBpcyBzZXBhcmF0ZSBmcm9tIEpTT04gaW1wbGljaXQgcmVzb2x1dGlvbi5cbmNvbnN0IFlBTUxfRkxPQVRfRVhQTElDSVRfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gIC8vIDIuNWU0LCAyLjUgYW5kIGludGVnZXJzXG4gICdeKD86Wy0rXT9bMC05XSsoPzpcXFxcLlswLTldKik/KD86W2VFXVstK10/WzAtOV0rKT8nICtcbiAgLy8gLjJlNCwgLjJcbiAgJ3xbLStdP1xcXFwuWzAtOV0rKD86W2VFXVstK10/WzAtOV0rKT8nICtcbiAgLy8gLmluZlxuICAnfFstK10/XFxcXC4oPzppbmZ8SW5mfElORiknICtcbiAgLy8gLm5hblxuICAnfFxcXFwuKD86bmFufE5hTnxOQU4pKSQnKVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEZsb2F0IChzb3VyY2U6IHN0cmluZywgaXNFeHBsaWNpdDogYm9vbGVhbikge1xuICBpZiAoaXNFeHBsaWNpdCkge1xuICAgIGlmICghWUFNTF9GTE9BVF9FWFBMSUNJVF9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuXG4gICAgbGV0IHZhbHVlID0gc291cmNlLnRvTG93ZXJDYXNlKClcbiAgICBjb25zdCBzaWduID0gdmFsdWVbMF0gPT09ICctJyA/IC0xIDogMVxuXG4gICAgaWYgKCcrLScuaW5jbHVkZXModmFsdWVbMF0pKSB2YWx1ZSA9IHZhbHVlLnNsaWNlKDEpXG5cbiAgICBpZiAodmFsdWUgPT09ICcuaW5mJykgcmV0dXJuIHNpZ24gPT09IDEgPyBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgOiBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFlcbiAgICBpZiAodmFsdWUgPT09ICcubmFuJykgcmV0dXJuIE5hTlxuXG4gICAgY29uc3QgcmVzdWx0ID0gc2lnbiAqIHBhcnNlRmxvYXQodmFsdWUpXG4gICAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZShyZXN1bHQpID8gcmVzdWx0IDogTk9UX1JFU09MVkVEXG4gIH1cblxuICBpZiAoIVlBTUxfRkxPQVRfSU1QTElDSVRfUEFUVEVSTi50ZXN0KHNvdXJjZSkpIHJldHVybiBOT1RfUkVTT0xWRURcblxuICBjb25zdCByZXN1bHQgPSBOdW1iZXIoc291cmNlKVxuXG4gIGlmIChOdW1iZXIuaXNGaW5pdGUocmVzdWx0KSkgcmV0dXJuIHJlc3VsdFxuICByZXR1cm4gTk9UX1JFU09MVkVEXG59XG5cbmZ1bmN0aW9uIHJlcHJlc2VudFlhbWxGbG9hdCAob2JqZWN0OiBudW1iZXIpIHtcbiAgaWYgKGlzTmFOKG9iamVjdCkpIHJldHVybiAnLm5hbidcbiAgaWYgKG9iamVjdCA9PT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSByZXR1cm4gJy5pbmYnXG4gIGlmIChvYmplY3QgPT09IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSkgcmV0dXJuICctLmluZidcbiAgaWYgKE9iamVjdC5pcyhvYmplY3QsIC0wKSkgcmV0dXJuICctMC4wJ1xuXG4gIGNvbnN0IHJlc3VsdCA9IG9iamVjdC50b1N0cmluZygxMClcbiAgcmV0dXJuIC9eWy0rXT9bMC05XStlLy50ZXN0KHJlc3VsdCkgPyByZXN1bHQucmVwbGFjZSgnZScsICcuZScpIDogcmVzdWx0XG59XG5cbmNvbnN0IGZsb2F0SnNvblRhZyA9IGRlZmluZVNjYWxhclRhZygndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLCB7XG4gIGltcGxpY2l0OiB0cnVlLFxuICAvLyBTdXBlcnNldCBvZiBzb3VyY2UuY2hhckF0KDApIG92ZXIgYWxsIG1hdGNoZWQgaW5wdXRzOiBvcHRpb25hbCAnLScgb3IgZGlnaXQuXG4gIGltcGxpY2l0Rmlyc3RDaGFyczogWyctJywgLi4uJzAxMjM0NTY3ODknXSxcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxGbG9hdCxcbiAgaWRlbnRpZnk6IChvYmplY3QpID0+XG4gICAgLy8gTm8gYW5jaWVudCBib3hlZCBudW1iZXJzIHN1cHBvcnRcbiAgICB0eXBlb2Ygb2JqZWN0ID09PSAnbnVtYmVyJyAmJlxuICAgIChcbiAgICAgIC8vIFdlIGxhbmQgaGVyZSBhbGwgbnVtYmVycywgbm90IGhhbmRsZWQgKGRlY2xpbmVkKSBieSAhIWludCBgLmlkZW50aWZ5YFxuICAgICAgLy8gVGhlIHNhbWUgY29uZGl0aW9uIGFzIGZvciAhIWludCwgYnV0IHJldmVyc2VkLlxuXG4gICAgICAvLyBGaWx0ZXIgb3V0IGludGVnZXJzLi4uXG4gICAgICAhTnVtYmVyLmlzSW50ZWdlcihvYmplY3QpIHx8XG4gICAgICAvLyBidXQgYWxsb3cgbmVnYXRpdmUgemVyb1xuICAgICAgT2JqZWN0LmlzKG9iamVjdCwgLTApIHx8XG4gICAgICAvLyBhbmQgaW50ZWdlcnMgd2l0aCBleHBvbmVudGlhbCBmb3JtXG4gICAgICBvYmplY3QudG9TdHJpbmcoMTApLmluZGV4T2YoJ2UnKSA+PSAwXG4gICAgKSxcbiAgcmVwcmVzZW50OiByZXByZXNlbnRZYW1sRmxvYXRcbn0pXG5cbmV4cG9ydCB7IGZsb2F0SnNvblRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2NhbGFyVGFnLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IFlBTUxfRkxPQVRfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gIC8vIDIuNWU0LCAyLjUgYW5kIGludGVnZXJzXG4gICdeKD86Wy0rXT8oPzooPzpbMC05XVswLTlfXSopP1xcXFwuWzAtOV9dKikoPzpbZUVdWy0rXVswLTldKyk/JyArXG4gIC8vIDE5MDoyMDozMC4xNVxuICAnfFstK10/WzAtOV1bMC05X10qKD86OlswLTVdP1swLTldKStcXFxcLlswLTlfXSonICtcbiAgLy8gLmluZlxuICAnfFstK10/XFxcXC4oPzppbmZ8SW5mfElORiknICtcbiAgLy8gLm5hblxuICAnfFxcXFwuKD86bmFufE5hTnxOQU4pKSQnKVxuXG5jb25zdCBZQU1MX0ZMT0FUX1NQRUNJQUxfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gICdeKD86JyArXG4gIC8vIC5pbmZcbiAgJ1stK10/XFxcXC4oPzppbmZ8SW5mfElORiknICtcbiAgLy8gLm5hblxuICAnfFxcXFwuKD86bmFufE5hTnxOQU4pKSQnKVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEZsb2F0IChzb3VyY2U6IHN0cmluZykge1xuICBpZiAoIVlBTUxfRkxPQVRfUEFUVEVSTi50ZXN0KHNvdXJjZSkpIHJldHVybiBOT1RfUkVTT0xWRURcblxuICBsZXQgdmFsdWUgPSBzb3VyY2UudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9fL2csICcnKVxuICBjb25zdCBzaWduID0gdmFsdWVbMF0gPT09ICctJyA/IC0xIDogMVxuXG4gIGlmICgnKy0nLmluY2x1ZGVzKHZhbHVlWzBdKSkgdmFsdWUgPSB2YWx1ZS5zbGljZSgxKVxuXG4gIGlmICh2YWx1ZSA9PT0gJy5pbmYnKSByZXR1cm4gc2lnbiA9PT0gMSA/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA6IE51bWJlci5ORUdBVElWRV9JTkZJTklUWVxuICBpZiAodmFsdWUgPT09ICcubmFuJykgcmV0dXJuIE5hTlxuXG4gIGxldCByZXN1bHQgPSAwXG5cbiAgaWYgKHZhbHVlLmluY2x1ZGVzKCc6JykpIHtcbiAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdmFsdWUuc3BsaXQoJzonKSkgcmVzdWx0ID0gcmVzdWx0ICogNjAgKyBOdW1iZXIocGFydClcbiAgICByZXN1bHQgKj0gc2lnblxuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9IHNpZ24gKiBwYXJzZUZsb2F0KHZhbHVlKVxuICB9XG5cbiAgaWYgKE51bWJlci5pc0Zpbml0ZShyZXN1bHQpIHx8IFlBTUxfRkxPQVRfU1BFQ0lBTF9QQVRURVJOLnRlc3Qoc291cmNlKSkgcmV0dXJuIHJlc3VsdFxuICByZXR1cm4gTk9UX1JFU09MVkVEXG59XG5cbmZ1bmN0aW9uIHJlcHJlc2VudFlhbWxGbG9hdCAob2JqZWN0OiBudW1iZXIpIHtcbiAgaWYgKGlzTmFOKG9iamVjdCkpIHJldHVybiAnLm5hbidcbiAgaWYgKG9iamVjdCA9PT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSByZXR1cm4gJy5pbmYnXG4gIGlmIChvYmplY3QgPT09IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSkgcmV0dXJuICctLmluZidcbiAgaWYgKE9iamVjdC5pcyhvYmplY3QsIC0wKSkgcmV0dXJuICctMC4wJ1xuXG4gIGNvbnN0IHJlc3VsdCA9IG9iamVjdC50b1N0cmluZygxMClcbiAgcmV0dXJuIC9eWy0rXT9bMC05XStlLy50ZXN0KHJlc3VsdCkgPyByZXN1bHQucmVwbGFjZSgnZScsICcuZScpIDogcmVzdWx0XG59XG5cbmNvbnN0IGZsb2F0WWFtbDExVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsIHtcbiAgaW1wbGljaXQ6IHRydWUsXG4gIC8vIFN1cGVyc2V0IG9mIHNvdXJjZS5jaGFyQXQoMCkgb3ZlciBhbGwgbWF0Y2hlZCBpbnB1dHM6IG9wdGlvbmFsIHNpZ24sICcuJywgb3IgZGlnaXRcbiAgLy8gKCcuaW5mJy8nLm5hbicgc3RhcnQgd2l0aCAnLicpLlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IFsnLScsICcrJywgJy4nLCAuLi4nMDEyMzQ1Njc4OSddLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbEZsb2F0LFxuICBpZGVudGlmeTogKG9iamVjdCkgPT5cbiAgICAvLyBObyBhbmNpZW50IGJveGVkIG51bWJlcnMgc3VwcG9ydFxuICAgIHR5cGVvZiBvYmplY3QgPT09ICdudW1iZXInICYmXG4gICAgKFxuICAgICAgLy8gV2UgbGFuZCBoZXJlIGFsbCBudW1iZXJzLCBub3QgaGFuZGxlZCAoZGVjbGluZWQpIGJ5ICEhaW50IGAuaWRlbnRpZnlgXG4gICAgICAvLyBUaGUgc2FtZSBjb25kaXRpb24gYXMgZm9yICEhaW50LCBidXQgcmV2ZXJzZWQuXG5cbiAgICAgIC8vIEZpbHRlciBvdXQgaW50ZWdlcnMuLi5cbiAgICAgICFOdW1iZXIuaXNJbnRlZ2VyKG9iamVjdCkgfHxcbiAgICAgIC8vIGJ1dCBhbGxvdyBuZWdhdGl2ZSB6ZXJvXG4gICAgICBPYmplY3QuaXMob2JqZWN0LCAtMCkgfHxcbiAgICAgIC8vIGFuZCBpbnRlZ2VycyB3aXRoIGV4cG9uZW50aWFsIGZvcm1cbiAgICAgIG9iamVjdC50b1N0cmluZygxMCkuaW5kZXhPZignZScpID49IDBcbiAgICApLFxuICByZXByZXNlbnQ6IHJlcHJlc2VudFlhbWxGbG9hdFxufSlcblxuZXhwb3J0IHsgZmxvYXRZYW1sMTFUYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZywgTUVSR0VfS0VZLCBOT1RfUkVTT0xWRUQgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IG1lcmdlVGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjptZXJnZScsIHtcbiAgaW1wbGljaXQ6IHRydWUsXG4gIC8vIHNvdXJjZS5jaGFyQXQoMCkgb3ZlciBtYXRjaGVkIGltcGxpY2l0IGlucHV0czogJzwnICgnPDwnKS5cbiAgaW1wbGljaXRGaXJzdENoYXJzOiBbJzwnXSxcbiAgcmVzb2x2ZTogKHNvdXJjZSwgaXNFeHBsaWNpdCkgPT4ge1xuICAgIGlmIChzb3VyY2UgPT09ICc8PCcgfHwgKGlzRXhwbGljaXQgJiYgc291cmNlID09PSAnJykpIHJldHVybiBNRVJHRV9LRVlcbiAgICByZXR1cm4gTk9UX1JFU09MVkVEXG4gIH1cbn0pXG5cbmV4cG9ydCB7IG1lcmdlVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVTY2FsYXJUYWcsIE5PVF9SRVNPTFZFRCB9IGZyb20gJy4uLy4uL3RhZy50cydcblxuY29uc3QgQkFTRTY0X1BBVFRFUk4gPSAvXltBLVphLXowLTkrL10qPXswLDJ9JC9cblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxCaW5hcnkgKHNvdXJjZTogc3RyaW5nKSB7XG4gIC8vIFN0cmlwIGFsbG93ZWQgd2hpdGVzcGFjZSBmaXJzdCwgc28gdmFsaWRhdGlvbiBzdGF5cyBhIHBsYWluIGJhc2U2NCBjaGVjay5cbiAgY29uc3QgaW5wdXQgPSBzb3VyY2UucmVwbGFjZSgvXFxzL2csICcnKVxuICBpZiAoaW5wdXQubGVuZ3RoICUgNCAhPT0gMCB8fCAhQkFTRTY0X1BBVFRFUk4udGVzdChpbnB1dCkpIHJldHVybiBOT1RfUkVTT0xWRURcblxuICBjb25zdCBiaW5hcnkgPSBhdG9iKGlucHV0KVxuICBjb25zdCByZXN1bHQgPSBuZXcgVWludDhBcnJheShiaW5hcnkubGVuZ3RoKVxuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYmluYXJ5Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgIHJlc3VsdFtpbmRleF0gPSBiaW5hcnkuY2hhckNvZGVBdChpbmRleClcbiAgfVxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIHJlcHJlc2VudFlhbWxCaW5hcnkgKG9iamVjdDogVWludDhBcnJheSkge1xuICBsZXQgYmluYXJ5ID0gJydcbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9iamVjdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShvYmplY3RbaW5kZXhdKVxuICB9XG4gIHJldHVybiBidG9hKGJpbmFyeSlcbn1cblxuY29uc3QgYmluYXJ5VGFnID0gZGVmaW5lU2NhbGFyVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpiaW5hcnknLCB7XG4gIHJlc29sdmU6IHJlc29sdmVZYW1sQmluYXJ5LFxuICBpZGVudGlmeTogKG9iamVjdCkgPT4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT09ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgcmVwcmVzZW50OiByZXByZXNlbnRZYW1sQmluYXJ5XG59KVxuXG5leHBvcnQgeyBiaW5hcnlUYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZVNjYWxhclRhZywgTk9UX1JFU09MVkVEIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG5jb25zdCBZQU1MX0RBVEVfUkVHRVhQID0gbmV3IFJlZ0V4cChcbiAgJ14oWzAtOV1bMC05XVswLTldWzAtOV0pLShbMC05XVswLTldKS0oWzAtOV1bMC05XSkkJylcblxuY29uc3QgWUFNTF9USU1FU1RBTVBfUkVHRVhQID0gbmV3IFJlZ0V4cChcbiAgJ14oWzAtOV1bMC05XVswLTldWzAtOV0pJyArXG4gICctKFswLTldWzAtOV0/KScgK1xuICAnLShbMC05XVswLTldPyknICtcbiAgJyg/OltUdF18WyBcXFxcdF0rKScgK1xuICAnKFswLTldWzAtOV0/KScgK1xuICAnOihbMC05XVswLTldKScgK1xuICAnOihbMC05XVswLTldKScgK1xuICAnKD86XFxcXC4oWzAtOV0qKSk/JyArXG4gICcoPzpbIFxcXFx0XSooWnwoWy0rXSkoWzAtOV1bMC05XT8pJyArXG4gICcoPzo6KFswLTldWzAtOV0pKT8pKT8kJylcblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxUaW1lc3RhbXAgKHNvdXJjZTogc3RyaW5nKSB7XG4gIGxldCBtYXRjaCA9IFlBTUxfREFURV9SRUdFWFAuZXhlYyhzb3VyY2UpXG4gIGlmIChtYXRjaCA9PT0gbnVsbCkgbWF0Y2ggPSBZQU1MX1RJTUVTVEFNUF9SRUdFWFAuZXhlYyhzb3VyY2UpXG4gIGlmIChtYXRjaCA9PT0gbnVsbCkgcmV0dXJuIE5PVF9SRVNPTFZFRFxuXG4gIGNvbnN0IHllYXIgPSArKG1hdGNoWzFdKVxuICBjb25zdCBtb250aCA9ICsobWF0Y2hbMl0pIC0gMVxuICBjb25zdCBkYXkgPSArKG1hdGNoWzNdKVxuXG4gIC8vIERhdGUtb25seSBmb3JtIChgWVlZWS1NTS1ERGApIGhhcyBubyB0aW1lIGNhcHR1cmVzLlxuICBpZiAoIW1hdGNoWzRdKSB7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKHllYXIsIG1vbnRoLCBkYXkpKVxuICAgIC8vIFJlamVjdCBkYXRlcyB0aGF0IEpTIHdvdWxkIG5vcm1hbGl6ZSwgZS5nLiAyMDIzLTAyLTI5IC0+IDIwMjMtMDMtMDEuXG4gICAgaWYgKGRhdGUuZ2V0VVRDRnVsbFllYXIoKSAhPT0geWVhciB8fCBkYXRlLmdldFVUQ01vbnRoKCkgIT09IG1vbnRoIHx8IGRhdGUuZ2V0VVRDRGF0ZSgpICE9PSBkYXkpIHtcbiAgICAgIHJldHVybiBOT1RfUkVTT0xWRURcbiAgICB9XG4gICAgcmV0dXJuIGRhdGVcbiAgfVxuXG4gIGNvbnN0IGhvdXIgPSArKG1hdGNoWzRdKVxuICBjb25zdCBtaW51dGUgPSArKG1hdGNoWzVdKVxuICBjb25zdCBzZWNvbmQgPSArKG1hdGNoWzZdKVxuICBsZXQgZnJhY3Rpb24gPSAwXG5cbiAgLy8gUmVqZWN0IHRpbWVzIHRoYXQgSlMgd291bGQgbm9ybWFsaXplIGludG8gdGhlIG5leHQgbWludXRlL2hvdXIvZGF5LlxuICBpZiAoaG91ciA+IDIzIHx8IG1pbnV0ZSA+IDU5IHx8IHNlY29uZCA+IDU5KSByZXR1cm4gTk9UX1JFU09MVkVEXG5cbiAgaWYgKG1hdGNoWzddKSB7XG4gICAgbGV0IHZhbHVlID0gbWF0Y2hbN10uc2xpY2UoMCwgMylcbiAgICB3aGlsZSAodmFsdWUubGVuZ3RoIDwgMykgdmFsdWUgKz0gJzAnXG4gICAgZnJhY3Rpb24gPSArdmFsdWVcbiAgfVxuXG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgZnJhY3Rpb24pKVxuXG4gIC8vIFJlamVjdCBpbnZhbGlkIGNhbGVuZGFyIGRhdGVzIGJlZm9yZSBhcHBseWluZyB0aW1lem9uZSBvZmZzZXQuXG4gIGlmIChkYXRlLmdldFVUQ0Z1bGxZZWFyKCkgIT09IHllYXIgfHwgZGF0ZS5nZXRVVENNb250aCgpICE9PSBtb250aCB8fCBkYXRlLmdldFVUQ0RhdGUoKSAhPT0gZGF5KSB7XG4gICAgcmV0dXJuIE5PVF9SRVNPTFZFRFxuICB9XG5cbiAgaWYgKG1hdGNoWzldKSB7XG4gICAgY29uc3Qgb2Zmc2V0SG91ciA9ICsobWF0Y2hbMTBdKVxuICAgIGNvbnN0IG9mZnNldE1pbnV0ZSA9ICsobWF0Y2hbMTFdIHx8IDApXG4gICAgLy8gUmVqZWN0IHRpbWV6b25lIG9mZnNldHMgdGhhdCBKUyBkYXRlIGFyaXRobWV0aWMgd291bGQgb3RoZXJ3aXNlIGFjY2VwdC5cbiAgICBpZiAob2Zmc2V0SG91ciA+IDIzIHx8IG9mZnNldE1pbnV0ZSA+IDU5KSByZXR1cm4gTk9UX1JFU09MVkVEXG5cbiAgICBjb25zdCBvZmZzZXQgPSAob2Zmc2V0SG91ciAqIDYwICsgb2Zmc2V0TWludXRlKSAqIDYwMDAwXG4gICAgZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpIC0gKG1hdGNoWzldID09PSAnLScgPyAtb2Zmc2V0IDogb2Zmc2V0KSlcbiAgfVxuXG4gIHJldHVybiBkYXRlXG59XG5cbmNvbnN0IHRpbWVzdGFtcFRhZyA9IGRlZmluZVNjYWxhclRhZygndGFnOnlhbWwub3JnLDIwMDI6dGltZXN0YW1wJywge1xuICBpbXBsaWNpdDogdHJ1ZSxcbiAgLy8gQm90aCBwYXR0ZXJucyBzdGFydCB3aXRoIGEgNC1kaWdpdCB5ZWFyLCBzbyBzb3VyY2UuY2hhckF0KDApIGlzIGFsd2F5cyBhIGRpZ2l0LlxuICBpbXBsaWNpdEZpcnN0Q2hhcnM6IFsuLi4nMDEyMzQ1Njc4OSddLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbFRpbWVzdGFtcCxcbiAgaWRlbnRpZnk6IChvYmplY3QpID0+IG9iamVjdCBpbnN0YW5jZW9mIERhdGUsXG4gIHJlcHJlc2VudDogKG9iamVjdDogRGF0ZSkgPT4gb2JqZWN0LnRvSVNPU3RyaW5nKClcbn0pXG5cbmV4cG9ydCB7IHRpbWVzdGFtcFRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2VxdWVuY2VUYWcgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbmNvbnN0IHNlcVRhZyA9IGRlZmluZVNlcXVlbmNlVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpzZXEnLCB7XG4gIGNyZWF0ZTogKCkgPT4gW10gYXMgdW5rbm93bltdLFxuICBhZGRJdGVtOiAoY29udGFpbmVyLCBpdGVtKSA9PiB7XG4gICAgY29udGFpbmVyLnB1c2goaXRlbSlcbiAgfSxcbiAgaWRlbnRpZnk6IEFycmF5LmlzQXJyYXlcbn0pXG5cbmV4cG9ydCB7IHNlcVRhZyB9XG4iLCAiZnVuY3Rpb24gaXNQbGFpbk9iamVjdCAoZGF0YTogdW5rbm93bik6IGJvb2xlYW4ge1xuICBpZiAoZGF0YSA9PT0gbnVsbCB8fCB0eXBlb2YgZGF0YSAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShkYXRhKSkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihkYXRhKVxuICByZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZVxufVxuXG4vLyBQcm9qZWN0IGBvYmplY3RgIG9udG8gYGtleXNgLiBBYnNlbnQga2V5cyBhcmUgc2tpcHBlZCAoc28gdGhlIHJlc3VsdCBjYW4gYmVcbi8vIHNhZmVseSBzcHJlYWQgb3ZlciBkZWZhdWx0cyB3aXRob3V0IGNsb2JiZXJpbmcgdGhlbSB3aXRoIGB1bmRlZmluZWRgKSwgaGVuY2Vcbi8vIHRoZSBgUGFydGlhbGAgcmV0dXJuLlxuZnVuY3Rpb24gcGljazxUIGV4dGVuZHMgb2JqZWN0LCBLIGV4dGVuZHMga2V5b2YgVD4gKG9iamVjdDogVCwga2V5czogcmVhZG9ubHkgS1tdKTogUGFydGlhbDxQaWNrPFQsIEs+PiB7XG4gIGNvbnN0IHJlc3VsdDogUGFydGlhbDxQaWNrPFQsIEs+PiA9IHt9XG4gIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICBpZiAob2JqZWN0W2tleV0gIT09IHVuZGVmaW5lZCkgcmVzdWx0W2tleV0gPSBvYmplY3Rba2V5XVxuICB9XG4gIHJldHVybiByZXN1bHRcbn1cblxuZXhwb3J0IHtcbiAgaXNQbGFpbk9iamVjdCxcbiAgcGlja1xufVxuIiwgImltcG9ydCB7IGRlZmluZVNlcXVlbmNlVGFnIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuaW1wb3J0IHsgaXNQbGFpbk9iamVjdCB9IGZyb20gJy4uLy4uL2NvbW1vbi9vYmplY3QudHMnXG5cbmludGVyZmFjZSBPbWFwQ2FycmllciB7XG4gIGxpc3Q6IHVua25vd25bXVxuICBzZWVuOiBTZXQ8dW5rbm93bj5cbn1cblxuY29uc3Qgb21hcFRhZyA9IGRlZmluZVNlcXVlbmNlVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpvbWFwJywge1xuICBjcmVhdGU6ICgpOiBPbWFwQ2FycmllciA9PiAoeyBsaXN0OiBbXSwgc2VlbjogbmV3IFNldCgpIH0pLFxuICBhZGRJdGVtOiAoY2FycmllciwgaXRlbSkgPT4ge1xuICAgIGxldCBrZXk6IHVua25vd25cblxuICAgIGlmIChpdGVtIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICBpZiAoaXRlbS5zaXplICE9PSAxKSByZXR1cm4gJ2Nhbm5vdCByZXNvbHZlIGFuIG9yZGVyZWQgbWFwIGl0ZW0nXG4gICAgICBrZXkgPSBpdGVtLmtleXMoKS5uZXh0KCkudmFsdWVcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QoaXRlbSkpIHtcbiAgICAgIGNvbnN0IGl0ZW1LZXlzID0gT2JqZWN0LmtleXMoaXRlbSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilcbiAgICAgIGlmIChpdGVtS2V5cy5sZW5ndGggIT09IDEpIHJldHVybiAnY2Fubm90IHJlc29sdmUgYW4gb3JkZXJlZCBtYXAgaXRlbSdcbiAgICAgIGtleSA9IGl0ZW1LZXlzWzBdXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnY2Fubm90IHJlc29sdmUgYW4gb3JkZXJlZCBtYXAgaXRlbSdcbiAgICB9XG5cbiAgICBpZiAoY2Fycmllci5zZWVuLmhhcyhrZXkpKSByZXR1cm4gJ2R1cGxpY2F0ZSBrZXkgaW4gb3JkZXJlZCBtYXAnXG4gICAgY2Fycmllci5zZWVuLmFkZChrZXkpXG4gICAgY2Fycmllci5saXN0LnB1c2goaXRlbSlcbiAgICByZXR1cm4gJydcbiAgfSxcbiAgZmluYWxpemU6IChjYXJyaWVyKTogdW5rbm93bltdID0+IGNhcnJpZXIubGlzdFxufSlcblxuZXhwb3J0IHsgb21hcFRhZyB9XG4iLCAiaW1wb3J0IHsgZGVmaW5lU2VxdWVuY2VUYWcgfSBmcm9tICcuLi8uLi90YWcudHMnXG5cbnR5cGUgUGFpciA9IFt1bmtub3duLCB1bmtub3duXVxuXG5jb25zdCBwYWlyc1RhZyA9IGRlZmluZVNlcXVlbmNlVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpwYWlycycsIHtcbiAgY3JlYXRlOiAoKSA9PiBbXSBhcyBQYWlyW10sXG4gIGFkZEl0ZW06IChjb250YWluZXIsIGl0ZW0pID0+IHtcbiAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgaWYgKGl0ZW0uc2l6ZSAhPT0gMSkgcmV0dXJuICdjYW5ub3QgcmVzb2x2ZSBhIHBhaXJzIGl0ZW0nXG5cbiAgICAgIGNvbnRhaW5lci5wdXNoKGl0ZW0uZW50cmllcygpLm5leHQoKS52YWx1ZSEpXG4gICAgICByZXR1cm4gJydcbiAgICB9XG5cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGl0ZW0pICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgcmV0dXJuICdjYW5ub3QgcmVzb2x2ZSBhIHBhaXJzIGl0ZW0nXG4gICAgfVxuXG4gICAgY29uc3Qgb2JqZWN0ID0gaXRlbSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpXG5cbiAgICBpZiAoa2V5cy5sZW5ndGggIT09IDEpIHJldHVybiAnY2Fubm90IHJlc29sdmUgYSBwYWlycyBpdGVtJ1xuXG4gICAgY29udGFpbmVyLnB1c2goW2tleXNbMF0sIG9iamVjdFtrZXlzWzBdXV0gc2F0aXNmaWVzIFBhaXIpXG4gICAgcmV0dXJuICcnXG4gIH1cbn0pXG5cbmV4cG9ydCB7IHBhaXJzVGFnIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVNYXBwaW5nVGFnIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuaW1wb3J0IHsgaXNQbGFpbk9iamVjdCB9IGZyb20gJy4uLy4uL2NvbW1vbi9vYmplY3QudHMnXG5cbnR5cGUgU3RyaW5nTWFwcGluZyA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+XG5cbmNvbnN0IG1hcFRhZyA9IGRlZmluZU1hcHBpbmdUYWcoJ3RhZzp5YW1sLm9yZywyMDAyOm1hcCcsIHtcbiAgY3JlYXRlOiAoKTogU3RyaW5nTWFwcGluZyA9PiAoe30pLFxuICBpZGVudGlmeTogaXNQbGFpbk9iamVjdCxcbiAgLy8gRHVtcCBzaWRlOiB3cmFwIHRoZSBwbGFpbiBvYmplY3QgaW50byB0aGUgY2Fub25pY2FsIGBNYXBgIGZvcm0gdGhlIHdyaXRlclxuICAvLyB3YWxrcy4gU2hhbGxvdyDigJQga2V5cy92YWx1ZXMgc3RheSByZWZlcmVuY2VzIHRvIHRoZSBvcmlnaW5hbHMuXG4gIHJlcHJlc2VudDogKG86IFN0cmluZ01hcHBpbmcpID0+IHtcbiAgICBjb25zdCBtYXAgPSBuZXcgTWFwPHN0cmluZywgdW5rbm93bj4oKVxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG8pKSBtYXAuc2V0KGtleSwgb1trZXldKVxuICAgIHJldHVybiBtYXBcbiAgfSxcbiAgYWRkUGFpcjogKGNvbnRhaW5lciwga2V5LCB2YWx1ZSkgPT4ge1xuICAgIGlmIChrZXkgIT09IG51bGwgJiYgdHlwZW9mIGtleSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiAnb2JqZWN0LWJhc2VkIG1hcCBkb2VzIG5vdCBzdXBwb3J0IGNvbXBsZXgga2V5cydcbiAgICB9XG4gICAgY29uc3Qgbm9ybWFsaXplZEtleSA9IFN0cmluZyhrZXkpXG4gICAgaWYgKG5vcm1hbGl6ZWRLZXkgPT09ICdfX3Byb3RvX18nKSB7XG4gICAgICAvLyBEZWZpbmUgYXMgYW4gb3duIGRhdGEgcHJvcGVydHkgc28gYSBsaXRlcmFsIGBfX3Byb3RvX19gIGtleSBzdGF5cyBkYXRhXG4gICAgICAvLyBhbmQgbmV2ZXIgaW52b2tlcyB0aGUgcHJvdG90eXBlIHNldHRlci5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb250YWluZXIsIG5vcm1hbGl6ZWRLZXksIHtcbiAgICAgICAgdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRhaW5lcltub3JtYWxpemVkS2V5XSA9IHZhbHVlXG4gICAgfVxuICAgIHJldHVybiAnJ1xuICB9LFxuICAvLyBoYXNPd24sIG5vdCBgaW5gOiBhIHBsYWluIG9iamVjdCBpbmhlcml0cyBgdG9TdHJpbmdgIGFuZCBmcmllbmRzLlxuICBoYXM6IChjb250YWluZXIsIGtleSkgPT4ge1xuICAgIGlmIChrZXkgIT09IG51bGwgJiYgdHlwZW9mIGtleSA9PT0gJ29iamVjdCcpIHJldHVybiBmYWxzZVxuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY29udGFpbmVyLCBTdHJpbmcoa2V5KSlcbiAgfSxcbiAga2V5czogKGNvbnRhaW5lcikgPT4gT2JqZWN0LmtleXMoY29udGFpbmVyKSxcbiAgZ2V0OiAoY29udGFpbmVyLCBrZXkpID0+IGNvbnRhaW5lcltTdHJpbmcoa2V5KV1cbn0pXG5cbmV4cG9ydCB7IG1hcFRhZywgaXNQbGFpbk9iamVjdCwgdHlwZSBTdHJpbmdNYXBwaW5nIH1cbiIsICJpbXBvcnQgeyBkZWZpbmVNYXBwaW5nVGFnIH0gZnJvbSAnLi4vLi4vdGFnLnRzJ1xuXG5jb25zdCBzZXRUYWcgPSBkZWZpbmVNYXBwaW5nVGFnKCd0YWc6eWFtbC5vcmcsMjAwMjpzZXQnLCB7XG4gIGNyZWF0ZTogKCkgPT4gbmV3IFNldDx1bmtub3duPigpLFxuICBpZGVudGlmeTogKGRhdGEpID0+IGRhdGEgaW5zdGFuY2VvZiBTZXQsXG4gIHJlcHJlc2VudDogKGRhdGE6IFNldDx1bmtub3duPikgPT4ge1xuICAgIGNvbnN0IG1hcCA9IG5ldyBNYXA8dW5rbm93biwgbnVsbD4oKVxuICAgIGZvciAoY29uc3Qga2V5IG9mIGRhdGEpIG1hcC5zZXQoa2V5LCBudWxsKVxuICAgIHJldHVybiBtYXBcbiAgfSxcbiAgYWRkUGFpcjogKGNvbnRhaW5lciwga2V5LCB2YWx1ZSkgPT4ge1xuICAgIGlmICh2YWx1ZSAhPT0gbnVsbCkgcmV0dXJuICdjYW5ub3QgcmVzb2x2ZSBhIHNldCBpdGVtJ1xuICAgIGNvbnRhaW5lci5hZGQoa2V5KVxuICAgIHJldHVybiAnJ1xuICB9LFxuICBoYXM6IChjb250YWluZXIsIGtleSkgPT4gY29udGFpbmVyLmhhcyhrZXkpLFxuICBrZXlzOiAoY29udGFpbmVyKSA9PiBjb250YWluZXIua2V5cygpLFxuICBnZXQ6ICgpID0+IG51bGxcbn0pXG5cbmV4cG9ydCB7IHNldFRhZyB9XG4iLCAiaW1wb3J0IHtcbiAgdHlwZSBNYXBwaW5nVGFnRGVmaW5pdGlvbixcbiAgdHlwZSBTY2FsYXJUYWdEZWZpbml0aW9uLFxuICB0eXBlIFNlcXVlbmNlVGFnRGVmaW5pdGlvbixcbiAgdHlwZSBUYWdEZWZpbml0aW9uXG59IGZyb20gJy4vdGFnLnRzJ1xuaW1wb3J0IHsgc3RyVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL3N0ci50cydcbmltcG9ydCB7IG51bGxDb3JlVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL251bGxfY29yZS50cydcbmltcG9ydCB7IG51bGxKc29uVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL251bGxfanNvbi50cydcbmltcG9ydCB7IG51bGxZYW1sMTFUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvbnVsbF95YW1sMTEudHMnXG5pbXBvcnQgeyBib29sQ29yZVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9ib29sX2NvcmUudHMnXG5pbXBvcnQgeyBib29sSnNvblRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9ib29sX2pzb24udHMnXG5pbXBvcnQgeyBib29sWWFtbDExVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2Jvb2xfeWFtbDExLnRzJ1xuaW1wb3J0IHsgaW50Q29yZVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9pbnRfY29yZS50cydcbmltcG9ydCB7IGludEpzb25UYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvaW50X2pzb24udHMnXG5pbXBvcnQgeyBpbnRZYW1sMTFUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvaW50X3lhbWwxMS50cydcbmltcG9ydCB7IGZsb2F0Q29yZVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9mbG9hdF9jb3JlLnRzJ1xuaW1wb3J0IHsgZmxvYXRKc29uVGFnIH0gZnJvbSAnLi90YWcvc2NhbGFyL2Zsb2F0X2pzb24udHMnXG5pbXBvcnQgeyBmbG9hdFlhbWwxMVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9mbG9hdF95YW1sMTEudHMnXG5pbXBvcnQgeyBtZXJnZVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9tZXJnZS50cydcbmltcG9ydCB7IGJpbmFyeVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9iaW5hcnkudHMnXG5pbXBvcnQgeyB0aW1lc3RhbXBUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvdGltZXN0YW1wLnRzJ1xuaW1wb3J0IHsgc2VxVGFnIH0gZnJvbSAnLi90YWcvc2VxdWVuY2Uvc2VxLnRzJ1xuaW1wb3J0IHsgb21hcFRhZyB9IGZyb20gJy4vdGFnL3NlcXVlbmNlL29tYXAudHMnXG5pbXBvcnQgeyBwYWlyc1RhZyB9IGZyb20gJy4vdGFnL3NlcXVlbmNlL3BhaXJzLnRzJ1xuaW1wb3J0IHsgbWFwVGFnIH0gZnJvbSAnLi90YWcvbWFwcGluZy9tYXAudHMnXG5pbXBvcnQgeyBzZXRUYWcgfSBmcm9tICcuL3RhZy9tYXBwaW5nL3NldC50cydcblxuaW50ZXJmYWNlIFRhZ0RlZmluaXRpb25NYXAge1xuICBzY2FsYXI6IFJlY29yZDxzdHJpbmcsIFNjYWxhclRhZ0RlZmluaXRpb24+XG4gIHNlcXVlbmNlOiBSZWNvcmQ8c3RyaW5nLCBTZXF1ZW5jZVRhZ0RlZmluaXRpb24+XG4gIG1hcHBpbmc6IFJlY29yZDxzdHJpbmcsIE1hcHBpbmdUYWdEZWZpbml0aW9uPlxufVxuXG5pbnRlcmZhY2UgVGFnRGVmaW5pdGlvbkxpc3RNYXAge1xuICBzY2FsYXI6IFNjYWxhclRhZ0RlZmluaXRpb25bXVxuICBzZXF1ZW5jZTogU2VxdWVuY2VUYWdEZWZpbml0aW9uW11cbiAgbWFwcGluZzogTWFwcGluZ1RhZ0RlZmluaXRpb25bXVxufVxuXG5mdW5jdGlvbiBjcmVhdGVUYWdEZWZpbml0aW9uTWFwICgpOiBUYWdEZWZpbml0aW9uTWFwIHtcbiAgcmV0dXJuIHtcbiAgICBzY2FsYXI6IHt9LFxuICAgIHNlcXVlbmNlOiB7fSxcbiAgICBtYXBwaW5nOiB7fVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRhZ0RlZmluaXRpb25MaXN0TWFwICgpOiBUYWdEZWZpbml0aW9uTGlzdE1hcCB7XG4gIHJldHVybiB7XG4gICAgc2NhbGFyOiBbXSxcbiAgICBzZXF1ZW5jZTogW10sXG4gICAgbWFwcGluZzogW11cbiAgfVxufVxuXG5mdW5jdGlvbiBjb21waWxlVGFncyAodGFnczogcmVhZG9ubHkgVGFnRGVmaW5pdGlvbltdKSB7XG4gIGNvbnN0IHJlc3VsdDogVGFnRGVmaW5pdGlvbltdID0gW11cblxuICBmb3IgKGNvbnN0IHRhZyBvZiB0YWdzKSB7XG4gICAgbGV0IGluZGV4ID0gcmVzdWx0Lmxlbmd0aFxuXG4gICAgZm9yIChsZXQgcHJldmlvdXNJbmRleCA9IDA7IHByZXZpb3VzSW5kZXggPCByZXN1bHQubGVuZ3RoOyBwcmV2aW91c0luZGV4KyspIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzID0gcmVzdWx0W3ByZXZpb3VzSW5kZXhdXG5cbiAgICAgIGlmIChwcmV2aW91cy5ub2RlS2luZCA9PT0gdGFnLm5vZGVLaW5kICYmXG4gICAgICAgICAgcHJldmlvdXMudGFnTmFtZSA9PT0gdGFnLnRhZ05hbWUgJiZcbiAgICAgICAgICBwcmV2aW91cy5tYXRjaEJ5VGFnUHJlZml4ID09PSB0YWcubWF0Y2hCeVRhZ1ByZWZpeCkge1xuICAgICAgICBpbmRleCA9IHByZXZpb3VzSW5kZXhcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXN1bHRbaW5kZXhdID0gdGFnXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbmNsYXNzIFNjaGVtYSB7XG4gIHJlYWRvbmx5IHRhZ3M6IHJlYWRvbmx5IFRhZ0RlZmluaXRpb25bXVxuICByZWFkb25seSBpbXBsaWNpdFNjYWxhclRhZ3M6IHJlYWRvbmx5IFNjYWxhclRhZ0RlZmluaXRpb25bXVxuICAvLyBEaXNwYXRjaCBpbXBsaWNpdCBzY2FsYXIgcmVzb2x2ZXJzIGJ5IGBzb3VyY2UuY2hhckF0KDApYC4gRWFjaCBidWNrZXQgaG9sZHMgdGhlXG4gIC8vIHJlc29sdmVycyB0aGF0IG1heSBtYXRjaCB0aGF0IGtleSwgaW4gc2NoZW1hIG9yZGVyOyBhIGtleSBhYnNlbnQgZnJvbSB0aGUgbWFwXG4gIC8vIHVzZXMgYGltcGxpY2l0U2NhbGFyQW55Rmlyc3RDaGFyYCAocmVzb2x2ZXJzIHRoYXQgZGVjbGFyZWQgbm8gZmlyc3QtY2hhclxuICAvLyBjb25zdHJhaW50LCBzbyB0aGV5IGFwcGx5IHRvIGFueSBmaXJzdCBjaGFyYWN0ZXIpLlxuICByZWFkb25seSBpbXBsaWNpdFNjYWxhckJ5Rmlyc3RDaGFyOiBSZWFkb25seU1hcDxzdHJpbmcsIHJlYWRvbmx5IFNjYWxhclRhZ0RlZmluaXRpb25bXT5cbiAgcmVhZG9ubHkgaW1wbGljaXRTY2FsYXJBbnlGaXJzdENoYXI6IHJlYWRvbmx5IFNjYWxhclRhZ0RlZmluaXRpb25bXVxuICAvLyBUaGUgZGVmYXVsdCBzY2FsYXIgdGFnIChgISFzdHJgKSwgcmVzb2x2ZWQgb25jZSBzbyB0aGUgY29tcG9zZXIncyBmYWxsYmFjayBmb3JcbiAgLy8gdW5yZXNvbHZlZCBwbGFpbiBzY2FsYXJzIGF2b2lkcyBhIGtleWVkIGxvb2t1cCBwZXIgc2NhbGFyLlxuICByZWFkb25seSBkZWZhdWx0U2NhbGFyVGFnOiBTY2FsYXJUYWdEZWZpbml0aW9uXG4gIC8vIFRoZSBkZWZhdWx0IGNvbnRhaW5lciB0YWdzIChgISFzZXFgIC8gYCEhbWFwYCksIHVzZWQgYnkgdGhlIGR1bXBlcjogd2hlbiBhXG4gIC8vIHZhbHVlIGlzIGlkZW50aWZpZWQgYnkgaXRzIGRlZmF1bHQgdGFnLCB0aGUgdGFnIGlzIGltcGxpY2l0IGFuZCBub3QgcHJpbnRlZC5cbiAgLy8gVW5kZWZpbmVkIGlmIHRoZSBzY2hlbWEgZG9lcyBub3QgZGVmaW5lIHRoZW0gKHRoZW4gc3VjaCB2YWx1ZXMgY2FuJ3QgYmUgZHVtcGVkKS5cbiAgcmVhZG9ubHkgZGVmYXVsdFNlcXVlbmNlVGFnOiBTZXF1ZW5jZVRhZ0RlZmluaXRpb24gfCB1bmRlZmluZWRcbiAgcmVhZG9ubHkgZGVmYXVsdE1hcHBpbmdUYWc6IE1hcHBpbmdUYWdEZWZpbml0aW9uIHwgdW5kZWZpbmVkXG4gIHJlYWRvbmx5IGV4YWN0OiBUYWdEZWZpbml0aW9uTWFwXG4gIHJlYWRvbmx5IHByZWZpeDogVGFnRGVmaW5pdGlvbkxpc3RNYXBcblxuICBjb25zdHJ1Y3RvciAodGFnczogcmVhZG9ubHkgVGFnRGVmaW5pdGlvbltdKSB7XG4gICAgY29uc3QgY29tcGlsZWRUYWdzID0gY29tcGlsZVRhZ3ModGFncylcbiAgICBjb25zdCBpbXBsaWNpdFNjYWxhclRhZ3M6IFNjYWxhclRhZ0RlZmluaXRpb25bXSA9IFtdXG4gICAgY29uc3QgZXhhY3QgPSBjcmVhdGVUYWdEZWZpbml0aW9uTWFwKClcbiAgICBjb25zdCBwcmVmaXggPSBjcmVhdGVUYWdEZWZpbml0aW9uTGlzdE1hcCgpXG5cbiAgICBmb3IgKGNvbnN0IHRhZyBvZiBjb21waWxlZFRhZ3MpIHtcbiAgICAgIGlmICh0YWcubm9kZUtpbmQgPT09ICdzY2FsYXInICYmIHRhZy5pbXBsaWNpdCkge1xuICAgICAgICBpZiAodGFnLm1hdGNoQnlUYWdQcmVmaXgpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ltcGxpY2l0IHNjYWxhciB0YWdzIGNhbm5vdCBtYXRjaCBieSB0YWcgcHJlZml4JylcbiAgICAgICAgfVxuXG4gICAgICAgIGltcGxpY2l0U2NhbGFyVGFncy5wdXNoKHRhZylcbiAgICAgIH1cblxuICAgICAgc3dpdGNoICh0YWcubm9kZUtpbmQpIHtcbiAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICBpZiAodGFnLm1hdGNoQnlUYWdQcmVmaXgpIHByZWZpeC5zY2FsYXIucHVzaCh0YWcpXG4gICAgICAgICAgZWxzZSBleGFjdC5zY2FsYXJbdGFnLnRhZ05hbWVdID0gdGFnXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnc2VxdWVuY2UnOlxuICAgICAgICAgIGlmICh0YWcubWF0Y2hCeVRhZ1ByZWZpeCkgcHJlZml4LnNlcXVlbmNlLnB1c2godGFnKVxuICAgICAgICAgIGVsc2UgZXhhY3Quc2VxdWVuY2VbdGFnLnRhZ05hbWVdID0gdGFnXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnbWFwcGluZyc6XG4gICAgICAgICAgaWYgKHRhZy5tYXRjaEJ5VGFnUHJlZml4KSBwcmVmaXgubWFwcGluZy5wdXNoKHRhZylcbiAgICAgICAgICBlbHNlIGV4YWN0Lm1hcHBpbmdbdGFnLnRhZ05hbWVdID0gdGFnXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbXBsaWNpdFNjYWxhckFueUZpcnN0Q2hhciA9IGltcGxpY2l0U2NhbGFyVGFncy5maWx0ZXIodGFnID0+IHRhZy5pbXBsaWNpdEZpcnN0Q2hhcnMgPT09IG51bGwpXG5cbiAgICBjb25zdCBrZXlzID0gbmV3IFNldDxzdHJpbmc+KClcbiAgICBmb3IgKGNvbnN0IHRhZyBvZiBpbXBsaWNpdFNjYWxhclRhZ3MpIHtcbiAgICAgIGlmICh0YWcuaW1wbGljaXRGaXJzdENoYXJzICE9PSBudWxsKSB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHRhZy5pbXBsaWNpdEZpcnN0Q2hhcnMpIGtleXMuYWRkKGtleSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbXBsaWNpdFNjYWxhckJ5Rmlyc3RDaGFyID0gbmV3IE1hcDxzdHJpbmcsIFNjYWxhclRhZ0RlZmluaXRpb25bXT4oKVxuICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICAgIGltcGxpY2l0U2NhbGFyQnlGaXJzdENoYXIuc2V0KGtleSwgaW1wbGljaXRTY2FsYXJUYWdzLmZpbHRlcih0YWcgPT5cbiAgICAgICAgdGFnLmltcGxpY2l0Rmlyc3RDaGFycyA9PT0gbnVsbCB8fCB0YWcuaW1wbGljaXRGaXJzdENoYXJzLmluZGV4T2Yoa2V5KSAhPT0gLTEpKVxuICAgIH1cblxuICAgIGNvbnN0IGRlZmF1bHRTY2FsYXJUYWcgPSBleGFjdC5zY2FsYXJbJ3RhZzp5YW1sLm9yZywyMDAyOnN0ciddXG4gICAgaWYgKCFkZWZhdWx0U2NhbGFyVGFnKSB0aHJvdyBuZXcgRXJyb3IoJ3NjaGVtYSBkb2VzIG5vdCBkZWZpbmUgdGhlIGRlZmF1bHQgc2NhbGFyIHRhZyAodGFnOnlhbWwub3JnLDIwMDI6c3RyKScpXG5cbiAgICB0aGlzLnRhZ3MgPSBjb21waWxlZFRhZ3NcbiAgICB0aGlzLmltcGxpY2l0U2NhbGFyVGFncyA9IGltcGxpY2l0U2NhbGFyVGFnc1xuICAgIHRoaXMuaW1wbGljaXRTY2FsYXJCeUZpcnN0Q2hhciA9IGltcGxpY2l0U2NhbGFyQnlGaXJzdENoYXJcbiAgICB0aGlzLmltcGxpY2l0U2NhbGFyQW55Rmlyc3RDaGFyID0gaW1wbGljaXRTY2FsYXJBbnlGaXJzdENoYXJcbiAgICB0aGlzLmRlZmF1bHRTY2FsYXJUYWcgPSBkZWZhdWx0U2NhbGFyVGFnXG4gICAgdGhpcy5kZWZhdWx0U2VxdWVuY2VUYWcgPSBleGFjdC5zZXF1ZW5jZVsndGFnOnlhbWwub3JnLDIwMDI6c2VxJ11cbiAgICB0aGlzLmRlZmF1bHRNYXBwaW5nVGFnID0gZXhhY3QubWFwcGluZ1sndGFnOnlhbWwub3JnLDIwMDI6bWFwJ11cbiAgICB0aGlzLmV4YWN0ID0gZXhhY3RcbiAgICB0aGlzLnByZWZpeCA9IHByZWZpeFxuICB9XG5cbiAgd2l0aFRhZ3MgKC4uLnRhZ3M6IEFycmF5PFRhZ0RlZmluaXRpb24gfCByZWFkb25seSBUYWdEZWZpbml0aW9uW10+KTogU2NoZW1hIHtcbiAgICBsZXQgZmxhdFRhZ3M6IFRhZ0RlZmluaXRpb25bXSA9IFtdXG4gICAgZm9yIChjb25zdCB0YWcgb2YgdGFncykgZmxhdFRhZ3MgPSBmbGF0VGFncy5jb25jYXQodGFnKVxuXG4gICAgcmV0dXJuIG5ldyBTY2hlbWEoWy4uLnRoaXMudGFncywgLi4uZmxhdFRhZ3NdKVxuICB9XG59XG5cbmNvbnN0IEZBSUxTQUZFX1NDSEVNQSA9IG5ldyBTY2hlbWEoW1xuICBzdHJUYWcsXG4gIHNlcVRhZyxcbiAgbWFwVGFnXG5dKVxuXG5jb25zdCBKU09OX1NDSEVNQSA9IG5ldyBTY2hlbWEoW1xuICAuLi5GQUlMU0FGRV9TQ0hFTUEudGFncyxcbiAgbnVsbEpzb25UYWcsXG4gIGJvb2xKc29uVGFnLFxuICBpbnRKc29uVGFnLFxuICBmbG9hdEpzb25UYWdcbl0pXG5cbmNvbnN0IENPUkVfU0NIRU1BID0gbmV3IFNjaGVtYShbXG4gIC4uLkZBSUxTQUZFX1NDSEVNQS50YWdzLFxuICBudWxsQ29yZVRhZyxcbiAgYm9vbENvcmVUYWcsXG4gIGludENvcmVUYWcsXG4gIGZsb2F0Q29yZVRhZ1xuXSlcblxuY29uc3QgWUFNTDExX1NDSEVNQSA9IG5ldyBTY2hlbWEoW1xuICAuLi5GQUlMU0FGRV9TQ0hFTUEudGFncyxcbiAgbnVsbFlhbWwxMVRhZyxcbiAgYm9vbFlhbWwxMVRhZyxcbiAgaW50WWFtbDExVGFnLFxuICBmbG9hdFlhbWwxMVRhZyxcbiAgdGltZXN0YW1wVGFnLFxuICBtZXJnZVRhZyxcbiAgYmluYXJ5VGFnLFxuICBvbWFwVGFnLFxuICBwYWlyc1RhZyxcbiAgc2V0VGFnXG5dKVxuXG5leHBvcnQge1xuICBTY2hlbWEsXG4gIEZBSUxTQUZFX1NDSEVNQSxcbiAgSlNPTl9TQ0hFTUEsXG4gIENPUkVfU0NIRU1BLFxuICBZQU1MMTFfU0NIRU1BLFxuXG4gIHR5cGUgVGFnRGVmaW5pdGlvbk1hcCxcbiAgdHlwZSBUYWdEZWZpbml0aW9uTGlzdE1hcFxufVxuIiwgImltcG9ydCB7IGRlZmluZU1hcHBpbmdUYWcgfSBmcm9tICcuLi8uLi90YWcudHMnXG5pbXBvcnQgeyBpc1BsYWluT2JqZWN0IH0gZnJvbSAnLi4vLi4vY29tbW9uL29iamVjdC50cydcblxudHlwZSBSZWFsTWFwcGluZyA9IE1hcDx1bmtub3duLCB1bmtub3duPlxuXG4vLyBBIG1hcHBpbmcgcmVwcmVzZW50ZWQgYXMgYSByZWFsIGBNYXBgOiBrZXlzIGtlZXAgdGhlaXIgY29uc3RydWN0ZWQgdHlwZSxcbi8vIG5vdGhpbmcgaXMgc3RyaW5naWZpZWQuIERyb3AtaW4gcmVwbGFjZW1lbnQgZm9yIHRoZSBkZWZhdWx0IGAhIW1hcGAgdGFnXG4vLyAoc2FtZSB0YWcgbmFtZSkg4oCUIGBDT1JFX1NDSEVNQS53aXRoVGFncyhyZWFsTWFwVGFnKWAuXG5jb25zdCByZWFsTWFwVGFnID0gZGVmaW5lTWFwcGluZ1RhZygndGFnOnlhbWwub3JnLDIwMDI6bWFwJywge1xuICBjcmVhdGU6ICgpID0+IG5ldyBNYXA8dW5rbm93biwgdW5rbm93bj4oKSxcbiAgYWRkUGFpcjogKGNvbnRhaW5lcjogUmVhbE1hcHBpbmcsIGtleSwgdmFsdWUpID0+IHtcbiAgICBjb250YWluZXIuc2V0KGtleSwgdmFsdWUpXG4gICAgcmV0dXJuICcnXG4gIH0sXG4gIGhhczogKGNvbnRhaW5lcjogUmVhbE1hcHBpbmcsIGtleSkgPT4gY29udGFpbmVyLmhhcyhrZXkpLFxuICBrZXlzOiAoY29udGFpbmVyOiBSZWFsTWFwcGluZykgPT4gY29udGFpbmVyLmtleXMoKSxcbiAgZ2V0OiAoY29udGFpbmVyOiBSZWFsTWFwcGluZywga2V5KSA9PiBjb250YWluZXIuZ2V0KGtleSksXG4gIC8vIER1bXAgc2lkZTogaGFuZGxlIGJvdGggYSByZWFsIGBNYXBgIGFuZCBhIHBsYWluIG9iamVjdCwgc28gdGhpcyB0YWcgZnVsbHlcbiAgLy8gcmVwbGFjZXMgdGhlIGRlZmF1bHQgbWFwIHJlcHJlc2VudGF0aW9uIHdoZW4gZHVtcGluZyB0b28uXG4gIGlkZW50aWZ5OiAoZGF0YSkgPT4gZGF0YSBpbnN0YW5jZW9mIE1hcCB8fCBpc1BsYWluT2JqZWN0KGRhdGEpLFxuICAvLyBEdW1wIHNpZGU6IHRoZSBjYW5vbmljYWwgbWFwcGluZyBmb3JtIGlzIGEgYE1hcGAuIEEgcmVhbCBgTWFwYCBwYXNzZXNcbiAgLy8gdGhyb3VnaCB1bnRvdWNoZWQgKGtleXMga2VlcCB0aGVpciB0eXBlKTsgYSBwbGFpbiBvYmplY3QgaXMgd3JhcHBlZFxuICAvLyBzaGFsbG93bHkuIExvc3NsZXNzIOKAlCBub3RoaW5nIGlzIHN0cmluZ2lmaWVkLlxuICByZXByZXNlbnQ6IChkYXRhKSA9PiB7XG4gICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBNYXApIHJldHVybiBkYXRhXG4gICAgY29uc3QgbWFwID0gbmV3IE1hcDx1bmtub3duLCB1bmtub3duPigpXG4gICAgY29uc3Qgb2JqID0gZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG9iaikpIG1hcC5zZXQoa2V5LCBvYmpba2V5XSlcbiAgICByZXR1cm4gbWFwXG4gIH1cbn0pXG5cbmV4cG9ydCB7IHJlYWxNYXBUYWcgfVxuIiwgImltcG9ydCB7IGRlZmluZU1hcHBpbmdUYWcgfSBmcm9tICcuLi8uLi90YWcudHMnXG5pbXBvcnQgeyBpc1BsYWluT2JqZWN0IH0gZnJvbSAnLi4vLi4vY29tbW9uL29iamVjdC50cydcblxudHlwZSBTdHJpbmdNYXBwaW5nID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj5cblxuLy8gQ29lcmNlIGEgY29uc3RydWN0ZWQga2V5IGludG8gdGhlIHN0cmluZyBpZGVudGl0eSBhIGB7fWAgcmVwcmVzZW50YXRpb24gdXNlcy5cbi8vIFJldHVybnMgbnVsbCBmb3IgYSBuZXN0ZWQgYXJyYXkga2V5IChhbiBhcnJheSBlbGVtZW50IHRoYXQgaXMgaXRzZWxmIGFuXG4vLyBhcnJheSksIHdoaWNoIHdvdWxkIG90aGVyd2lzZSBibG93IHVwIGV4cG9uZW50aWFsbHkgd2hlbiBzdHJpbmdpZmllZCB2aWFcbi8vIGFsaWFzZXMuXG5mdW5jdGlvbiBub3JtYWxpemVLZXkgKGtleTogdW5rbm93bik6IHN0cmluZyB8IG51bGwge1xuICBpZiAoQXJyYXkuaXNBcnJheShrZXkpKSB7XG4gICAgY29uc3QgYXJyYXkgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChrZXkpIGFzIHVua25vd25bXVxuXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGFycmF5Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyYXlbaW5kZXhdKSkgcmV0dXJuIG51bGxcblxuICAgICAgaWYgKHR5cGVvZiBhcnJheVtpbmRleF0gPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFycmF5W2luZGV4XSkgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICAgIGFycmF5W2luZGV4XSA9ICdbb2JqZWN0IE9iamVjdF0nXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFN0cmluZyhhcnJheSlcbiAgfVxuXG4gIGlmICh0eXBlb2Yga2V5ID09PSAnb2JqZWN0JyAmJlxuICAgICAgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGtleSkgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgcmV0dXJuICdbb2JqZWN0IE9iamVjdF0nXG4gIH1cblxuICByZXR1cm4gU3RyaW5nKGtleSlcbn1cblxuY29uc3QgbGVnYWN5TWFwVGFnID0gZGVmaW5lTWFwcGluZ1RhZygndGFnOnlhbWwub3JnLDIwMDI6bWFwJywge1xuICBjcmVhdGU6ICgpOiBTdHJpbmdNYXBwaW5nID0+ICh7fSksXG4gIGlkZW50aWZ5OiBpc1BsYWluT2JqZWN0LFxuICAvLyBEdW1wIHNpZGU6IHdyYXAgdGhlIHBsYWluIG9iamVjdCBpbnRvIHRoZSBjYW5vbmljYWwgYE1hcGAgZm9ybSB0aGUgd3JpdGVyXG4gIC8vIHdhbGtzLiBTaGFsbG93IOKAlCBrZXlzL3ZhbHVlcyBzdGF5IHJlZmVyZW5jZXMgdG8gdGhlIG9yaWdpbmFscy5cbiAgcmVwcmVzZW50OiAobzogU3RyaW5nTWFwcGluZykgPT4ge1xuICAgIGNvbnN0IG1hcCA9IG5ldyBNYXA8c3RyaW5nLCB1bmtub3duPigpXG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMobykpIG1hcC5zZXQoa2V5LCBvW2tleV0pXG4gICAgcmV0dXJuIG1hcFxuICB9LFxuICBhZGRQYWlyOiAoY29udGFpbmVyLCBrZXksIHZhbHVlKSA9PiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZEtleSA9IG5vcm1hbGl6ZUtleShrZXkpXG4gICAgaWYgKG5vcm1hbGl6ZWRLZXkgPT09IG51bGwpIHJldHVybiAnbmVzdGVkIGFycmF5cyBhcmUgbm90IHN1cHBvcnRlZCBpbnNpZGUga2V5cydcbiAgICBpZiAobm9ybWFsaXplZEtleSA9PT0gJ19fcHJvdG9fXycpIHtcbiAgICAgIC8vIERlZmluZSBhcyBhbiBvd24gZGF0YSBwcm9wZXJ0eSBzbyBhIGxpdGVyYWwgYF9fcHJvdG9fX2Aga2V5IHN0YXlzIGRhdGFcbiAgICAgIC8vIGFuZCBuZXZlciBpbnZva2VzIHRoZSBwcm90b3R5cGUgc2V0dGVyLlxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnRhaW5lciwgbm9ybWFsaXplZEtleSwge1xuICAgICAgICB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGFpbmVyW25vcm1hbGl6ZWRLZXldID0gdmFsdWVcbiAgICB9XG4gICAgcmV0dXJuICcnXG4gIH0sXG4gIC8vIGhhc093biwgbm90IGBpbmA6IGEgcGxhaW4gb2JqZWN0IGluaGVyaXRzIGB0b1N0cmluZ2AgYW5kIGZyaWVuZHMuXG4gIGhhczogKGNvbnRhaW5lciwga2V5KSA9PiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZEtleSA9IG5vcm1hbGl6ZUtleShrZXkpXG4gICAgcmV0dXJuIG5vcm1hbGl6ZWRLZXkgIT09IG51bGwgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRhaW5lciwgbm9ybWFsaXplZEtleSlcbiAgfSxcbiAga2V5czogKGNvbnRhaW5lcikgPT4gT2JqZWN0LmtleXMoY29udGFpbmVyKSxcbiAgZ2V0OiAoY29udGFpbmVyLCBrZXkpID0+IGNvbnRhaW5lcltTdHJpbmcoa2V5KV1cbn0pXG5cbmV4cG9ydCB7IGxlZ2FjeU1hcFRhZywgaXNQbGFpbk9iamVjdCwgdHlwZSBTdHJpbmdNYXBwaW5nIH1cbiIsICJleHBvcnQgaW50ZXJmYWNlIFNuaXBwZXRNYXJrIHtcbiAgbmFtZT86IHN0cmluZyB8IG51bGxcbiAgYnVmZmVyOiBzdHJpbmdcbiAgcG9zaXRpb246IG51bWJlclxuICBsaW5lOiBudW1iZXJcbiAgY29sdW1uOiBudW1iZXJcbiAgc25pcHBldD86IHN0cmluZyB8IG51bGxcbn1cblxuaW50ZXJmYWNlIFNuaXBwZXRPcHRpb25zIHtcbiAgbWF4TGVuZ3RoPzogbnVtYmVyXG4gIGluZGVudD86IG51bWJlclxuICBsaW5lc0JlZm9yZT86IG51bWJlclxuICBsaW5lc0FmdGVyPzogbnVtYmVyXG59XG5cbmNvbnN0IERFRkFVTFRfU05JUFBFVF9PUFRJT05TOiBSZXF1aXJlZDxTbmlwcGV0T3B0aW9ucz4gPSB7XG4gIG1heExlbmd0aDogNzksXG4gIGluZGVudDogMSxcbiAgbGluZXNCZWZvcmU6IDMsXG4gIGxpbmVzQWZ0ZXI6IDJcbn1cblxuLy8gZ2V0IHNuaXBwZXQgZm9yIGEgc2luZ2xlIGxpbmUsIHJlc3BlY3RpbmcgbWF4TGVuZ3RoXG5mdW5jdGlvbiBnZXRMaW5lIChidWZmZXI6IHN0cmluZywgbGluZVN0YXJ0OiBudW1iZXIsIGxpbmVFbmQ6IG51bWJlciwgcG9zaXRpb246IG51bWJlciwgbWF4TGluZUxlbmd0aDogbnVtYmVyKSB7XG4gIGxldCBoZWFkID0gJydcbiAgbGV0IHRhaWwgPSAnJ1xuICBjb25zdCBtYXhIYWxmTGVuZ3RoID0gTWF0aC5mbG9vcihtYXhMaW5lTGVuZ3RoIC8gMikgLSAxXG5cbiAgaWYgKHBvc2l0aW9uIC0gbGluZVN0YXJ0ID4gbWF4SGFsZkxlbmd0aCkge1xuICAgIGhlYWQgPSAnIC4uLiAnXG4gICAgbGluZVN0YXJ0ID0gcG9zaXRpb24gLSBtYXhIYWxmTGVuZ3RoICsgaGVhZC5sZW5ndGhcbiAgfVxuXG4gIGlmIChsaW5lRW5kIC0gcG9zaXRpb24gPiBtYXhIYWxmTGVuZ3RoKSB7XG4gICAgdGFpbCA9ICcgLi4uJ1xuICAgIGxpbmVFbmQgPSBwb3NpdGlvbiArIG1heEhhbGZMZW5ndGggLSB0YWlsLmxlbmd0aFxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzdHI6IGhlYWQgKyBidWZmZXIuc2xpY2UobGluZVN0YXJ0LCBsaW5lRW5kKS5yZXBsYWNlKC9cXHQvZywgJ+KGkicpICsgdGFpbCxcbiAgICBwb3M6IHBvc2l0aW9uIC0gbGluZVN0YXJ0ICsgaGVhZC5sZW5ndGggLy8gcmVsYXRpdmUgcG9zaXRpb25cbiAgfVxufVxuXG5mdW5jdGlvbiBwYWRTdGFydCAoc3RyaW5nOiBzdHJpbmcsIG1heDogbnVtYmVyKSB7XG4gIC8vIG1heCgpIHByb3RlY3RzIGZyb20gbmVnYXRpdmEgdmFsdWUsIHRvIGF2b2lkIGV4Y2VwdGlvbi5cbiAgcmV0dXJuICcgJy5yZXBlYXQoTWF0aC5tYXgobWF4IC0gc3RyaW5nLmxlbmd0aCwgMCkpICsgc3RyaW5nXG59XG5cbmZ1bmN0aW9uIG1ha2VTbmlwcGV0IChtYXJrOiBTbmlwcGV0TWFyaywgb3B0aW9ucz86IFNuaXBwZXRPcHRpb25zKSB7XG4gIGlmICghbWFyay5idWZmZXIpIHJldHVybiBudWxsXG5cbiAgY29uc3Qgb3B0cyA9IHsgLi4uREVGQVVMVF9TTklQUEVUX09QVElPTlMsIC4uLm9wdGlvbnMgfVxuXG4gIGNvbnN0IHJlID0gL1xccj9cXG58XFxyfFxcMC9nXG4gIGNvbnN0IGxpbmVTdGFydHMgPSBbMF1cbiAgY29uc3QgbGluZUVuZHM6IG51bWJlcltdID0gW11cbiAgbGV0IG1hdGNoOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsXG4gIGxldCBmb3VuZExpbmVObyA9IC0xXG5cbiAgd2hpbGUgKChtYXRjaCA9IHJlLmV4ZWMobWFyay5idWZmZXIpKSkge1xuICAgIGxpbmVFbmRzLnB1c2gobWF0Y2guaW5kZXgpXG4gICAgbGluZVN0YXJ0cy5wdXNoKG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKVxuXG4gICAgaWYgKG1hcmsucG9zaXRpb24gPD0gbWF0Y2guaW5kZXggJiYgZm91bmRMaW5lTm8gPCAwKSB7XG4gICAgICBmb3VuZExpbmVObyA9IGxpbmVTdGFydHMubGVuZ3RoIC0gMlxuICAgIH1cbiAgfVxuXG4gIGlmIChmb3VuZExpbmVObyA8IDApIGZvdW5kTGluZU5vID0gbGluZVN0YXJ0cy5sZW5ndGggLSAxXG5cbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGNvbnN0IGxpbmVOb0xlbmd0aCA9IE1hdGgubWluKG1hcmsubGluZSArIG9wdHMubGluZXNBZnRlciwgbGluZUVuZHMubGVuZ3RoKS50b1N0cmluZygpLmxlbmd0aFxuICBjb25zdCBtYXhMaW5lTGVuZ3RoID0gb3B0cy5tYXhMZW5ndGggLSAob3B0cy5pbmRlbnQgKyBsaW5lTm9MZW5ndGggKyAzKVxuXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IG9wdHMubGluZXNCZWZvcmU7IGkrKykge1xuICAgIGlmIChmb3VuZExpbmVObyAtIGkgPCAwKSBicmVha1xuICAgIGNvbnN0IGxpbmUgPSBnZXRMaW5lKFxuICAgICAgbWFyay5idWZmZXIsXG4gICAgICBsaW5lU3RhcnRzW2ZvdW5kTGluZU5vIC0gaV0sXG4gICAgICBsaW5lRW5kc1tmb3VuZExpbmVObyAtIGldLFxuICAgICAgbWFyay5wb3NpdGlvbiAtIChsaW5lU3RhcnRzW2ZvdW5kTGluZU5vXSAtIGxpbmVTdGFydHNbZm91bmRMaW5lTm8gLSBpXSksXG4gICAgICBtYXhMaW5lTGVuZ3RoXG4gICAgKVxuICAgIHJlc3VsdCA9IGAkeycgJy5yZXBlYXQob3B0cy5pbmRlbnQpfSR7cGFkU3RhcnQoKG1hcmsubGluZSAtIGkgKyAxKS50b1N0cmluZygpLCBsaW5lTm9MZW5ndGgpfSB8ICR7bGluZS5zdHJ9XFxuJHtyZXN1bHR9YFxuICB9XG5cbiAgY29uc3QgbGluZSA9IGdldExpbmUobWFyay5idWZmZXIsIGxpbmVTdGFydHNbZm91bmRMaW5lTm9dLCBsaW5lRW5kc1tmb3VuZExpbmVOb10sIG1hcmsucG9zaXRpb24sIG1heExpbmVMZW5ndGgpXG4gIHJlc3VsdCArPSBgJHsnICcucmVwZWF0KG9wdHMuaW5kZW50KX0ke3BhZFN0YXJ0KChtYXJrLmxpbmUgKyAxKS50b1N0cmluZygpLCBsaW5lTm9MZW5ndGgpfSB8ICR7bGluZS5zdHJ9XFxuYFxuICByZXN1bHQgKz0gYCR7Jy0nLnJlcGVhdChvcHRzLmluZGVudCArIGxpbmVOb0xlbmd0aCArIDMgKyBsaW5lLnBvcyl9XlxcbmBcblxuICBmb3IgKGxldCBpID0gMTsgaSA8PSBvcHRzLmxpbmVzQWZ0ZXI7IGkrKykge1xuICAgIGlmIChmb3VuZExpbmVObyArIGkgPj0gbGluZUVuZHMubGVuZ3RoKSBicmVha1xuICAgIGNvbnN0IGxpbmUgPSBnZXRMaW5lKFxuICAgICAgbWFyay5idWZmZXIsXG4gICAgICBsaW5lU3RhcnRzW2ZvdW5kTGluZU5vICsgaV0sXG4gICAgICBsaW5lRW5kc1tmb3VuZExpbmVObyArIGldLFxuICAgICAgbWFyay5wb3NpdGlvbiAtIChsaW5lU3RhcnRzW2ZvdW5kTGluZU5vXSAtIGxpbmVTdGFydHNbZm91bmRMaW5lTm8gKyBpXSksXG4gICAgICBtYXhMaW5lTGVuZ3RoXG4gICAgKVxuICAgIHJlc3VsdCArPSBgJHsnICcucmVwZWF0KG9wdHMuaW5kZW50KX0ke3BhZFN0YXJ0KChtYXJrLmxpbmUgKyBpICsgMSkudG9TdHJpbmcoKSwgbGluZU5vTGVuZ3RoKX0gfCAke2xpbmUuc3RyfVxcbmBcbiAgfVxuXG4gIHJldHVybiByZXN1bHQucmVwbGFjZSgvXFxuJC8sICcnKVxufVxuXG5leHBvcnQgZGVmYXVsdCBtYWtlU25pcHBldFxuIiwgImltcG9ydCBtYWtlU25pcHBldCwgeyB0eXBlIFNuaXBwZXRNYXJrIH0gZnJvbSAnLi9zbmlwcGV0LnRzJ1xuXG4vLyBZQU1MIGVycm9yIGNsYXNzLiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg0NTg5ODRcbi8vXG5mdW5jdGlvbiBmb3JtYXRFcnJvciAoZXhjZXB0aW9uOiBZQU1MRXhjZXB0aW9uLCBjb21wYWN0PzogYm9vbGVhbikge1xuICBsZXQgd2hlcmUgPSAnJ1xuXG4gIGlmICghZXhjZXB0aW9uLm1hcmspIHJldHVybiBleGNlcHRpb24ucmVhc29uXG5cbiAgaWYgKGV4Y2VwdGlvbi5tYXJrLm5hbWUpIHtcbiAgICB3aGVyZSArPSBgaW4gXCIke2V4Y2VwdGlvbi5tYXJrLm5hbWV9XCIgYFxuICB9XG5cbiAgd2hlcmUgKz0gYCgke2V4Y2VwdGlvbi5tYXJrLmxpbmUgKyAxfToke2V4Y2VwdGlvbi5tYXJrLmNvbHVtbiArIDF9KWBcblxuICBpZiAoIWNvbXBhY3QgJiYgZXhjZXB0aW9uLm1hcmsuc25pcHBldCkge1xuICAgIHdoZXJlICs9IGBcXG5cXG4ke2V4Y2VwdGlvbi5tYXJrLnNuaXBwZXR9YFxuICB9XG5cbiAgcmV0dXJuIGAke2V4Y2VwdGlvbi5yZWFzb259ICR7d2hlcmV9YFxufVxuXG5jbGFzcyBZQU1MRXhjZXB0aW9uIGV4dGVuZHMgRXJyb3Ige1xuICByZWFzb246IHN0cmluZ1xuICBtYXJrPzogU25pcHBldE1hcmtcblxuICBjb25zdHJ1Y3RvciAocmVhc29uOiBzdHJpbmcsIG1hcms/OiBTbmlwcGV0TWFyaykge1xuICAgIHN1cGVyKClcblxuICAgIHRoaXMubmFtZSA9ICdZQU1MRXhjZXB0aW9uJ1xuICAgIHRoaXMucmVhc29uID0gcmVhc29uXG4gICAgdGhpcy5tYXJrID0gbWFya1xuICAgIHRoaXMubWVzc2FnZSA9IGZvcm1hdEVycm9yKHRoaXMsIGZhbHNlKVxuXG4gICAgLy8gR3VhcmQgZm9yIGFuY2llbnQgYnJvd3NlcnNcbiAgICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICAgIC8vIEluY2x1ZGUgc3RhY2sgdHJhY2UgaW4gZXJyb3Igb2JqZWN0LFxuICAgICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgdGhpcy5jb25zdHJ1Y3RvcilcbiAgICB9XG4gIH1cblxuICB0b1N0cmluZyAoY29tcGFjdD86IGJvb2xlYW4pIHtcbiAgICByZXR1cm4gYCR7dGhpcy5uYW1lfTogJHtmb3JtYXRFcnJvcih0aGlzLCBjb21wYWN0KX1gXG4gIH1cbn1cblxuLy8gQnVpbGQgYSBZQU1MRXhjZXB0aW9uIHdpdGggYSBzb3VyY2Ugc25pcHBldCBhbmQgdGhyb3cgaXQuIGBzb3VyY2VgIGlzIHRoZVxuLy8gcmF3IGlucHV0IHRleHQgKG5vIHBhcnNlciBzZW50aW5lbCk7IGBwb3NpdGlvbmAgaXMgYW4gb2Zmc2V0IGludG8gaXQuXG5mdW5jdGlvbiB0aHJvd0Vycm9yQXQgKHNvdXJjZTogc3RyaW5nLCBwb3NpdGlvbjogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcsIGZpbGVuYW1lID0gJycpOiBuZXZlciB7XG4gIGxldCBsaW5lID0gMFxuICBsZXQgbGluZVN0YXJ0ID0gMFxuXG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NpdGlvbjsgaW5kZXgrKykge1xuICAgIGNvbnN0IGNoID0gc291cmNlLmNoYXJDb2RlQXQoaW5kZXgpXG5cbiAgICBpZiAoY2ggPT09IDB4MEEvKiBMRiAqLykge1xuICAgICAgbGluZSsrXG4gICAgICBsaW5lU3RhcnQgPSBpbmRleCArIDFcbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDBELyogQ1IgKi8pIHtcbiAgICAgIGxpbmUrK1xuICAgICAgaWYgKHNvdXJjZS5jaGFyQ29kZUF0KGluZGV4ICsgMSkgPT09IDB4MEEvKiBMRiAqLykgaW5kZXgrK1xuICAgICAgbGluZVN0YXJ0ID0gaW5kZXggKyAxXG4gICAgfVxuICB9XG5cbiAgY29uc3QgbWFyazogU25pcHBldE1hcmsgPSB7XG4gICAgbmFtZTogZmlsZW5hbWUsXG4gICAgYnVmZmVyOiBzb3VyY2UsXG4gICAgcG9zaXRpb24sXG4gICAgbGluZSxcbiAgICBjb2x1bW46IHBvc2l0aW9uIC0gbGluZVN0YXJ0XG4gIH1cblxuICBtYXJrLnNuaXBwZXQgPSBtYWtlU25pcHBldChtYXJrKVxuICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbihtZXNzYWdlLCBtYXJrKVxufVxuXG5leHBvcnQgeyBZQU1MRXhjZXB0aW9uLCB0aHJvd0Vycm9yQXQgfVxuIiwgImNvbnN0IEVWRU5UX0RPQ1VNRU5UID0gMVxuY29uc3QgRVZFTlRfU0VRVUVOQ0UgPSAyXG5jb25zdCBFVkVOVF9NQVBQSU5HID0gM1xuY29uc3QgRVZFTlRfU0NBTEFSID0gNFxuY29uc3QgRVZFTlRfQUxJQVMgPSA1XG5jb25zdCBFVkVOVF9QT1AgPSA2XG5cbnR5cGUgRXZlbnRUeXBlID1cbiAgdHlwZW9mIEVWRU5UX0RPQ1VNRU5UIHwgdHlwZW9mIEVWRU5UX1NFUVVFTkNFIHwgdHlwZW9mIEVWRU5UX01BUFBJTkcgfFxuICB0eXBlb2YgRVZFTlRfU0NBTEFSIHwgdHlwZW9mIEVWRU5UX0FMSUFTIHwgdHlwZW9mIEVWRU5UX1BPUFxuXG5jb25zdCBTQ0FMQVJfU1RZTEVfUExBSU4gPSAxXG5jb25zdCBTQ0FMQVJfU1RZTEVfU0lOR0xFX1FVT1RFRCA9IDJcbmNvbnN0IFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVEID0gM1xuY29uc3QgU0NBTEFSX1NUWUxFX0xJVEVSQUxfQkxPQ0sgPSA0XG5jb25zdCBTQ0FMQVJfU1RZTEVfRk9MREVEX0JMT0NLID0gNVxuXG50eXBlIFNjYWxhclN0eWxlID1cbiAgdHlwZW9mIFNDQUxBUl9TVFlMRV9QTEFJTiB8IHR5cGVvZiBTQ0FMQVJfU1RZTEVfU0lOR0xFX1FVT1RFRCB8XG4gIHR5cGVvZiBTQ0FMQVJfU1RZTEVfRE9VQkxFX1FVT1RFRCB8IHR5cGVvZiBTQ0FMQVJfU1RZTEVfTElURVJBTF9CTE9DSyB8XG4gIHR5cGVvZiBTQ0FMQVJfU1RZTEVfRk9MREVEX0JMT0NLXG5cbmNvbnN0IENPTExFQ1RJT05fU1RZTEVfQkxPQ0sgPSAxXG5jb25zdCBDT0xMRUNUSU9OX1NUWUxFX0ZMT1cgPSAyXG5cbnR5cGUgQ29sbGVjdGlvblN0eWxlID1cbiAgdHlwZW9mIENPTExFQ1RJT05fU1RZTEVfQkxPQ0sgfCB0eXBlb2YgQ09MTEVDVElPTl9TVFlMRV9GTE9XXG5cbmNvbnN0IENIT01QSU5HX0NMSVAgPSAxXG5jb25zdCBDSE9NUElOR19TVFJJUCA9IDJcbmNvbnN0IENIT01QSU5HX0tFRVAgPSAzXG5cbnR5cGUgQ2hvbXBpbmcgPVxuICB0eXBlb2YgQ0hPTVBJTkdfQ0xJUCB8IHR5cGVvZiBDSE9NUElOR19TVFJJUCB8IHR5cGVvZiBDSE9NUElOR19LRUVQXG5cbnR5cGUgRG9jdW1lbnREaXJlY3RpdmUgPVxuICB7IGtpbmQ6ICd5YW1sJywgdmVyc2lvbjogc3RyaW5nIH0gfFxuICB7IGtpbmQ6ICd0YWcnLCBoYW5kbGU6IHN0cmluZywgcHJlZml4OiBzdHJpbmcgfVxuXG50eXBlIFRhZ0hhbmRsZXJzID0gUmVjb3JkPHN0cmluZywgc3RyaW5nPlxuXG5pbnRlcmZhY2UgRG9jdW1lbnRFdmVudCB7XG4gIHR5cGU6IHR5cGVvZiBFVkVOVF9ET0NVTUVOVFxuICBleHBsaWNpdFN0YXJ0OiBib29sZWFuXG4gIGV4cGxpY2l0RW5kOiBib29sZWFuXG4gIGRpcmVjdGl2ZXM6IERvY3VtZW50RGlyZWN0aXZlW11cbn1cblxuaW50ZXJmYWNlIFNlcXVlbmNlRXZlbnQge1xuICB0eXBlOiB0eXBlb2YgRVZFTlRfU0VRVUVOQ0VcbiAgc3RhcnQ6IG51bWJlclxuICBhbmNob3JTdGFydDogbnVtYmVyXG4gIGFuY2hvckVuZDogbnVtYmVyXG4gIHRhZ1N0YXJ0OiBudW1iZXJcbiAgdGFnRW5kOiBudW1iZXJcbiAgc3R5bGU6IENvbGxlY3Rpb25TdHlsZVxufVxuXG5pbnRlcmZhY2UgTWFwcGluZ0V2ZW50IHtcbiAgdHlwZTogdHlwZW9mIEVWRU5UX01BUFBJTkdcbiAgc3RhcnQ6IG51bWJlclxuICBhbmNob3JTdGFydDogbnVtYmVyXG4gIGFuY2hvckVuZDogbnVtYmVyXG4gIHRhZ1N0YXJ0OiBudW1iZXJcbiAgdGFnRW5kOiBudW1iZXJcbiAgc3R5bGU6IENvbGxlY3Rpb25TdHlsZVxufVxuXG5pbnRlcmZhY2UgU2NhbGFyRXZlbnQge1xuICB0eXBlOiB0eXBlb2YgRVZFTlRfU0NBTEFSXG4gIHZhbHVlU3RhcnQ6IG51bWJlclxuICB2YWx1ZUVuZDogbnVtYmVyXG4gIGFuY2hvclN0YXJ0OiBudW1iZXJcbiAgYW5jaG9yRW5kOiBudW1iZXJcbiAgdGFnU3RhcnQ6IG51bWJlclxuICB0YWdFbmQ6IG51bWJlclxuICBzdHlsZTogU2NhbGFyU3R5bGVcbiAgY2hvbXBpbmc6IENob21waW5nXG4gIGluZGVudDogbnVtYmVyXG4gIGZhc3Q6IGJvb2xlYW5cbn1cblxuaW50ZXJmYWNlIEFsaWFzRXZlbnQge1xuICB0eXBlOiB0eXBlb2YgRVZFTlRfQUxJQVNcbiAgYW5jaG9yU3RhcnQ6IG51bWJlclxuICBhbmNob3JFbmQ6IG51bWJlclxufVxuXG5pbnRlcmZhY2UgUG9wRXZlbnQge1xuICB0eXBlOiB0eXBlb2YgRVZFTlRfUE9QXG59XG5cbnR5cGUgRXZlbnQgPVxuICBEb2N1bWVudEV2ZW50IHxcbiAgU2VxdWVuY2VFdmVudCB8XG4gIE1hcHBpbmdFdmVudCB8XG4gIFNjYWxhckV2ZW50IHxcbiAgQWxpYXNFdmVudCB8XG4gIFBvcEV2ZW50XG5cbmV4cG9ydCB7XG4gIEVWRU5UX0RPQ1VNRU5ULFxuICBFVkVOVF9TRVFVRU5DRSxcbiAgRVZFTlRfTUFQUElORyxcbiAgRVZFTlRfU0NBTEFSLFxuICBFVkVOVF9BTElBUyxcbiAgRVZFTlRfUE9QLFxuXG4gIFNDQUxBUl9TVFlMRV9QTEFJTixcbiAgU0NBTEFSX1NUWUxFX1NJTkdMRV9RVU9URUQsXG4gIFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVELFxuICBTQ0FMQVJfU1RZTEVfTElURVJBTF9CTE9DSyxcbiAgU0NBTEFSX1NUWUxFX0ZPTERFRF9CTE9DSyxcblxuICBDT0xMRUNUSU9OX1NUWUxFX0JMT0NLLFxuICBDT0xMRUNUSU9OX1NUWUxFX0ZMT1csXG5cbiAgQ0hPTVBJTkdfQ0xJUCxcbiAgQ0hPTVBJTkdfU1RSSVAsXG4gIENIT01QSU5HX0tFRVAsXG5cbiAgdHlwZSBFdmVudFR5cGUsXG4gIHR5cGUgU2NhbGFyU3R5bGUsXG4gIHR5cGUgQ29sbGVjdGlvblN0eWxlLFxuXG4gIHR5cGUgQ2hvbXBpbmcsXG4gIHR5cGUgRG9jdW1lbnREaXJlY3RpdmUsXG4gIHR5cGUgVGFnSGFuZGxlcnMsXG4gIHR5cGUgRG9jdW1lbnRFdmVudCxcbiAgdHlwZSBTZXF1ZW5jZUV2ZW50LFxuICB0eXBlIE1hcHBpbmdFdmVudCxcbiAgdHlwZSBTY2FsYXJFdmVudCxcbiAgdHlwZSBBbGlhc0V2ZW50LFxuICB0eXBlIFBvcEV2ZW50LFxuICB0eXBlIEV2ZW50XG59XG4iLCAiaW1wb3J0IHtcbiAgU0NBTEFSX1NUWUxFX1NJTkdMRV9RVU9URUQsXG4gIFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVELFxuICBTQ0FMQVJfU1RZTEVfTElURVJBTF9CTE9DSyxcbiAgU0NBTEFSX1NUWUxFX0ZPTERFRF9CTE9DSyxcbiAgQ0hPTVBJTkdfU1RSSVAsXG4gIENIT01QSU5HX0tFRVAsXG4gIHR5cGUgU2NhbGFyRXZlbnRcbn0gZnJvbSAnLi9ldmVudHMudHMnXG5cbmNvbnN0IE5PX1JBTkdFID0gLTFcblxuLy8gLS0tIGNoYXJhY3RlciBoZWxwZXJzIChtaXJyb3JzIHNyYy9sb2FkZXIudHMsIGtlcHQgc2VsZi1jb250YWluZWQgaGVyZSkgLS0tXG5cbmZ1bmN0aW9uIHNpbXBsZUVzY2FwZVNlcXVlbmNlIChjOiBudW1iZXIpIHtcbiAgc3dpdGNoIChjKSB7XG4gICAgY2FzZSAweDMwLyogMCAqLzogcmV0dXJuICdcXHgwMCdcbiAgICBjYXNlIDB4NjEvKiBhICovOiByZXR1cm4gJ1xceDA3J1xuICAgIGNhc2UgMHg2Mi8qIGIgKi86IHJldHVybiAnXFx4MDgnXG4gICAgY2FzZSAweDc0LyogdCAqLzogcmV0dXJuICdcXHgwOSdcbiAgICBjYXNlIDB4MDkvKiBUYWIgKi86IHJldHVybiAnXFx4MDknXG4gICAgY2FzZSAweDZFLyogbiAqLzogcmV0dXJuICdcXHgwQSdcbiAgICBjYXNlIDB4NzYvKiB2ICovOiByZXR1cm4gJ1xceDBCJ1xuICAgIGNhc2UgMHg2Ni8qIGYgKi86IHJldHVybiAnXFx4MEMnXG4gICAgY2FzZSAweDcyLyogciAqLzogcmV0dXJuICdcXHgwRCdcbiAgICBjYXNlIDB4NjUvKiBlICovOiByZXR1cm4gJ1xceDFCJ1xuICAgIGNhc2UgMHgyMC8qIFNwYWNlICovOiByZXR1cm4gJyAnXG4gICAgY2FzZSAweDIyLyogXCIgKi86IHJldHVybiAnXFx4MjInXG4gICAgY2FzZSAweDJGLyogLyAqLzogcmV0dXJuICcvJ1xuICAgIGNhc2UgMHg1Qy8qIFxcICovOiByZXR1cm4gJ1xceDVDJ1xuICAgIGNhc2UgMHg0RS8qIE4gKi86IHJldHVybiAnXFx4ODUnXG4gICAgY2FzZSAweDVGLyogXyAqLzogcmV0dXJuICdcXHhBMCdcbiAgICBjYXNlIDB4NEMvKiBMICovOiByZXR1cm4gJ1xcdTIwMjgnXG4gICAgY2FzZSAweDUwLyogUCAqLzogcmV0dXJuICdcXHUyMDI5J1xuICAgIGRlZmF1bHQ6IHJldHVybiAnJ1xuICB9XG59XG5cbmNvbnN0IHNpbXBsZUVzY2FwZUNoZWNrID0gbmV3IEFycmF5KDI1NilcbmNvbnN0IHNpbXBsZUVzY2FwZU1hcCA9IG5ldyBBcnJheSgyNTYpXG5mb3IgKGxldCBpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG4gIHNpbXBsZUVzY2FwZUNoZWNrW2ldID0gc2ltcGxlRXNjYXBlU2VxdWVuY2UoaSkgPyAxIDogMFxuICBzaW1wbGVFc2NhcGVNYXBbaV0gPSBzaW1wbGVFc2NhcGVTZXF1ZW5jZShpKVxufVxuXG5mdW5jdGlvbiBjaGFyRnJvbUNvZGVwb2ludCAoYzogbnVtYmVyKSB7XG4gIGlmIChjIDw9IDB4RkZGRikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGMpXG4gIH1cbiAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoXG4gICAgKChjIC0gMHgwMTAwMDApID4+IDEwKSArIDB4RDgwMCxcbiAgICAoKGMgLSAweDAxMDAwMCkgJiAweDAzRkYpICsgMHhEQzAwXG4gIClcbn1cblxuZnVuY3Rpb24gZnJvbUhleENvZGUgKGM6IG51bWJlcikge1xuICBpZiAoYyA+PSAweDMwLyogMCAqLyAmJiBjIDw9IDB4MzkvKiA5ICovKSByZXR1cm4gYyAtIDB4MzBcbiAgY29uc3QgbGMgPSBjIHwgMHgyMFxuICAvLyBEb3VibGUtcXVvdGVkIHNjYWxhciByYW5nZXMgYXJlIHZhbGlkYXRlZCBieSBwYXJzZXIudHMgYmVmb3JlIGNvb2tpbmcuXG4gIHJldHVybiBsYyAtIDB4NjEgKyAxMFxufVxuXG5mdW5jdGlvbiBlc2NhcGVkSGV4TGVuIChjOiBudW1iZXIpIHtcbiAgaWYgKGMgPT09IDB4NzgvKiB4ICovKSByZXR1cm4gMlxuICBpZiAoYyA9PT0gMHg3NS8qIHUgKi8pIHJldHVybiA0XG4gIC8vIERvdWJsZS1xdW90ZWQgc2NhbGFyIHJhbmdlcyBhcmUgdmFsaWRhdGVkIGJ5IHBhcnNlci50cyBiZWZvcmUgY29va2luZy5cbiAgcmV0dXJuIDhcbn1cblxuLy8gLS0tIGxpbmUgZm9sZGluZyBoZWxwZXJzIC0tLVxuXG4vLyBTa2lwIGEgcnVuIG9mIGxpbmUgYnJlYWtzIHBsdXMgdGhlIGxlYWRpbmcgd2hpdGVzcGFjZSBvZiB0aGUgZm9sbG93aW5nXG4vLyBsaW5lcywgcmV0dXJuaW5nIHRoZSBudW1iZXIgb2YgbGluZSBicmVha3MgY29uc3VtZWQgYW5kIHRoZSBuZXcgcG9zaXRpb24uXG5mdW5jdGlvbiBza2lwRm9sZGVkQnJlYWtzIChpbnB1dDogc3RyaW5nLCBwb3NpdGlvbjogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xuICBsZXQgYnJlYWtzID0gMFxuXG4gIHdoaWxlIChwb3NpdGlvbiA8IGVuZCkge1xuICAgIGNvbnN0IGNoID0gaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbilcblxuICAgIGlmIChjaCA9PT0gMHgwQS8qIExGICovKSB7XG4gICAgICBicmVha3MrK1xuICAgICAgcG9zaXRpb24rK1xuICAgIH0gZWxzZSBpZiAoY2ggPT09IDB4MEQvKiBDUiAqLykge1xuICAgICAgYnJlYWtzKytcbiAgICAgIHBvc2l0aW9uKytcbiAgICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSA9PT0gMHgwQS8qIExGICovKSBwb3NpdGlvbisrXG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHgyMC8qIFNwYWNlICovIHx8IGNoID09PSAweDA5LyogVGFiICovKSB7XG4gICAgICBwb3NpdGlvbisrXG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgcG9zaXRpb24sIGJyZWFrcyB9XG59XG5cbi8vIEZvbGRpbmcgb2YgbGluZSBicmVha3MgYmV0d2VlbiBjb250ZW50IGNodW5rczogYSBzaW5nbGUgYnJlYWsgYmVjb21lcyBhXG4vLyBzcGFjZSwgc2V2ZXJhbCBicmVha3MgYmVjb21lIChjb3VudCAtIDEpIG5ld2xpbmVzLlxuZnVuY3Rpb24gZm9sZGVkQnJlYWtzIChjb3VudDogbnVtYmVyKSB7XG4gIGlmIChjb3VudCA9PT0gMSkgcmV0dXJuICcgJ1xuICAvLyBDYWxsZWQgb25seSBhZnRlciBza2lwRm9sZGVkQnJlYWtzKCkgY29uc3VtZWQgYXQgbGVhc3Qgb25lIGxpbmUgYnJlYWsuXG4gIHJldHVybiAnXFxuJy5yZXBlYXQoY291bnQgLSAxKVxufVxuXG4vLyAtLS0gcGVyLXN0eWxlIGV4dHJhY3RvcnMgLS0tXG5cbmZ1bmN0aW9uIGdldFBsYWluVmFsdWUgKGlucHV0OiBzdHJpbmcsIHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XG4gIGxldCByZXN1bHQgPSAnJ1xuICBsZXQgcG9zaXRpb24gPSBzdGFydFxuICBsZXQgY2FwdHVyZVN0YXJ0ID0gc3RhcnRcbiAgbGV0IGNhcHR1cmVFbmQgPSBzdGFydFxuXG4gIHdoaWxlIChwb3NpdGlvbiA8IGVuZCkge1xuICAgIGNvbnN0IGNoID0gaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbilcblxuICAgIGlmIChjaCA9PT0gMHgwQS8qIExGICovIHx8IGNoID09PSAweDBELyogQ1IgKi8pIHtcbiAgICAgIHJlc3VsdCArPSBpbnB1dC5zbGljZShjYXB0dXJlU3RhcnQsIGNhcHR1cmVFbmQpXG4gICAgICBjb25zdCBmb2xkID0gc2tpcEZvbGRlZEJyZWFrcyhpbnB1dCwgcG9zaXRpb24sIGVuZClcbiAgICAgIHJlc3VsdCArPSBmb2xkZWRCcmVha3MoZm9sZC5icmVha3MpXG4gICAgICBwb3NpdGlvbiA9IGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBmb2xkLnBvc2l0aW9uXG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc2l0aW9uKytcbiAgICAgIGlmIChjaCAhPT0gMHgyMC8qIFNwYWNlICovICYmIGNoICE9PSAweDA5LyogVGFiICovKSBjYXB0dXJlRW5kID0gcG9zaXRpb25cbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0ICsgaW5wdXQuc2xpY2UoY2FwdHVyZVN0YXJ0LCBjYXB0dXJlRW5kKVxufVxuXG5mdW5jdGlvbiBnZXRTaW5nbGVRdW90ZWRWYWx1ZSAoaW5wdXQ6IHN0cmluZywgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGxldCBwb3NpdGlvbiA9IHN0YXJ0XG4gIGxldCBjYXB0dXJlU3RhcnQgPSBzdGFydFxuICBsZXQgY2FwdHVyZUVuZCA9IHN0YXJ0XG5cbiAgd2hpbGUgKHBvc2l0aW9uIDwgZW5kKSB7XG4gICAgY29uc3QgY2ggPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSAweDI3LyogJyAqLykge1xuICAgICAgLy8gV2l0aGluIHRoZSBzdG9yZWQgcmFuZ2UgZXZlcnkgcXVvdGUgaXMgcGFydCBvZiBhbiBlc2NhcGVkICcnIHBhaXIuXG4gICAgICByZXN1bHQgKz0gaW5wdXQuc2xpY2UoY2FwdHVyZVN0YXJ0LCBwb3NpdGlvbikgKyBcIidcIlxuICAgICAgcG9zaXRpb24gKz0gMlxuICAgICAgY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IHBvc2l0aW9uXG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHgwQS8qIExGICovIHx8IGNoID09PSAweDBELyogQ1IgKi8pIHtcbiAgICAgIHJlc3VsdCArPSBpbnB1dC5zbGljZShjYXB0dXJlU3RhcnQsIGNhcHR1cmVFbmQpXG4gICAgICBjb25zdCBmb2xkID0gc2tpcEZvbGRlZEJyZWFrcyhpbnB1dCwgcG9zaXRpb24sIGVuZClcbiAgICAgIHJlc3VsdCArPSBmb2xkZWRCcmVha3MoZm9sZC5icmVha3MpXG4gICAgICBwb3NpdGlvbiA9IGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBmb2xkLnBvc2l0aW9uXG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc2l0aW9uKytcbiAgICAgIGlmIChjaCAhPT0gMHgyMC8qIFNwYWNlICovICYmIGNoICE9PSAweDA5LyogVGFiICovKSBjYXB0dXJlRW5kID0gcG9zaXRpb25cbiAgICB9XG4gIH1cblxuICAvLyBXaGl0ZXNwYWNlIHJpZ2h0IGJlZm9yZSB0aGUgY2xvc2luZyBxdW90ZSBpcyBzaWduaWZpY2FudCAoaXQgaXMgb25seVxuICAvLyBzdHJpcHBlZCB3aGVuIGZvbGxvd2VkIGJ5IGEgbGluZSBicmVhaykuXG4gIHJldHVybiByZXN1bHQgKyBpbnB1dC5zbGljZShjYXB0dXJlU3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gZ2V0RG91YmxlUXVvdGVkVmFsdWUgKGlucHV0OiBzdHJpbmcsIHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XG4gIGxldCByZXN1bHQgPSAnJ1xuICBsZXQgcG9zaXRpb24gPSBzdGFydFxuICBsZXQgY2FwdHVyZVN0YXJ0ID0gc3RhcnRcbiAgbGV0IGNhcHR1cmVFbmQgPSBzdGFydFxuXG4gIHdoaWxlIChwb3NpdGlvbiA8IGVuZCkge1xuICAgIGNvbnN0IGNoID0gaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbilcblxuICAgIGlmIChjaCA9PT0gMHg1Qy8qIFxcICovKSB7XG4gICAgICByZXN1bHQgKz0gaW5wdXQuc2xpY2UoY2FwdHVyZVN0YXJ0LCBwb3NpdGlvbilcbiAgICAgIHBvc2l0aW9uKytcbiAgICAgIGNvbnN0IGVzY2FwZWQgPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKVxuXG4gICAgICBpZiAoZXNjYXBlZCA9PT0gMHgwQS8qIExGICovIHx8IGVzY2FwZWQgPT09IDB4MEQvKiBDUiAqLykge1xuICAgICAgICAvLyBFc2NhcGVkIGxpbmUgYnJlYWs6IGEgbGluZSBjb250aW51YXRpb24gdGhhdCBqb2lucyB3aXRoIG5vdGhpbmcuXG4gICAgICAgIHBvc2l0aW9uID0gc2tpcEZvbGRlZEJyZWFrcyhpbnB1dCwgcG9zaXRpb24sIGVuZCkucG9zaXRpb25cbiAgICAgIH0gZWxzZSBpZiAoZXNjYXBlZCA8IDI1NiAmJiBzaW1wbGVFc2NhcGVDaGVja1tlc2NhcGVkXSkge1xuICAgICAgICByZXN1bHQgKz0gc2ltcGxlRXNjYXBlTWFwW2VzY2FwZWRdXG4gICAgICAgIHBvc2l0aW9uKytcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHBhcnNlci50cyBoYXMgYWxyZWFkeSByZWplY3RlZCB1bmtub3duIGVzY2FwZXMgYW5kIGludmFsaWQgaGV4IGRpZ2l0cy5cbiAgICAgICAgbGV0IGhleExlbmd0aCA9IGVzY2FwZWRIZXhMZW4oZXNjYXBlZClcbiAgICAgICAgbGV0IGhleFJlc3VsdCA9IDBcblxuICAgICAgICBmb3IgKDsgaGV4TGVuZ3RoID4gMDsgaGV4TGVuZ3RoLS0pIHtcbiAgICAgICAgICBwb3NpdGlvbisrXG4gICAgICAgICAgY29uc3QgZGlnaXQgPSBmcm9tSGV4Q29kZShpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSlcbiAgICAgICAgICBoZXhSZXN1bHQgPSAoaGV4UmVzdWx0IDw8IDQpICsgZGlnaXRcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdCArPSBjaGFyRnJvbUNvZGVwb2ludChoZXhSZXN1bHQpXG4gICAgICAgIHBvc2l0aW9uKytcbiAgICAgIH1cblxuICAgICAgY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IHBvc2l0aW9uXG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHgwQS8qIExGICovIHx8IGNoID09PSAweDBELyogQ1IgKi8pIHtcbiAgICAgIHJlc3VsdCArPSBpbnB1dC5zbGljZShjYXB0dXJlU3RhcnQsIGNhcHR1cmVFbmQpXG4gICAgICBjb25zdCBmb2xkID0gc2tpcEZvbGRlZEJyZWFrcyhpbnB1dCwgcG9zaXRpb24sIGVuZClcbiAgICAgIHJlc3VsdCArPSBmb2xkZWRCcmVha3MoZm9sZC5icmVha3MpXG4gICAgICBwb3NpdGlvbiA9IGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBmb2xkLnBvc2l0aW9uXG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc2l0aW9uKytcbiAgICAgIGlmIChjaCAhPT0gMHgyMC8qIFNwYWNlICovICYmIGNoICE9PSAweDA5LyogVGFiICovKSBjYXB0dXJlRW5kID0gcG9zaXRpb25cbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0ICsgaW5wdXQuc2xpY2UoY2FwdHVyZVN0YXJ0LCBlbmQpXG59XG5cbmZ1bmN0aW9uIGdldEJsb2NrVmFsdWUgKFxuICBpbnB1dDogc3RyaW5nLFxuICBzdGFydDogbnVtYmVyLFxuICBlbmQ6IG51bWJlcixcbiAgaW5kZW50OiBudW1iZXIsXG4gIGNob21waW5nOiBudW1iZXIsXG4gIGZvbGRlZDogYm9vbGVhblxuKSB7XG4gIGNvbnN0IHRleHRJbmRlbnQgPSBpbmRlbnQgPCAwID8gMCA6IGluZGVudFxuICAvLyBUaGUgcmFuZ2Ugc3RhcnRzIGF0IGNvbHVtbiAwIG9mIHRoZSBmaXJzdCBsaW5lIGFuZCBpbmNsdWRlcyBldmVyeSBsaW5lXG4gIC8vIGJyZWFrLCBpbmNsdWRpbmcgdGhvc2Ugb2YgdHJhaWxpbmcgYmxhbmsgbGluZXMuXG4gIGNvbnN0IHJlZ2lvbiA9IGlucHV0LnNsaWNlKHN0YXJ0LCBlbmQpLnJlcGxhY2UoL1xcclxcbj8vZywgJ1xcbicpXG4gIC8vIEFuIGVtcHR5IHJhbmdlIGlzIGEgYmxvY2sgd2l0aCBubyBsaW5lcyBhdCBhbGwgKGUuZy4gYW4gZW1wdHkgYHwrYCkgYW5kXG4gIC8vIG11c3Qgc3RheSBlbXB0eTsgYSBuYWl2ZSBzcGxpdCB3b3VsZCBpbnZlbnQgYSBwaGFudG9tIGJsYW5rIGxpbmUuIE90aGVyd2lzZVxuICAvLyBhIHRyYWlsaW5nIGxpbmUgYnJlYWsgbGVhdmVzIGEgdHJhaWxpbmcgJycgZnJvbSBzcGxpdCgpIHRoYXQgaXMgbm90IGEgcmVhbFxuICAvLyBsaW5lIChqdXN0IHRoZSB0ZXJtaW5hdG9yIG9mIHRoZSBsYXN0IG9uZSksIHNvIGRyb3AgaXQuIEludGVyaW9yIGJsYW5rXG4gIC8vIGxpbmVzIGFyZSBrZXB0LlxuICBjb25zdCBsaW5lcyA9IHJlZ2lvbiA9PT0gJydcbiAgICA/IFtdXG4gICAgOiAocmVnaW9uLmVuZHNXaXRoKCdcXG4nKSA/IHJlZ2lvbi5zbGljZSgwLCAtMSkgOiByZWdpb24pLnNwbGl0KCdcXG4nKVxuXG4gIGxldCByZXN1bHQgPSAnJ1xuICBsZXQgZGlkUmVhZENvbnRlbnQgPSBmYWxzZVxuICBsZXQgZW1wdHlMaW5lcyA9IDBcbiAgbGV0IGF0TW9yZUluZGVudGVkID0gZmFsc2VcblxuICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAvLyBXaGl0ZXNwYWNlIGJleW9uZCB0aGUgY29udGVudCBpbmRlbnRhdGlvbiBpcyBwYXJ0IG9mIHRoZSBjb250ZW50LCBzbyB0aGVcbiAgICAvLyBpbmRlbnRhdGlvbiBzY2FuIHN0b3BzIGF0IHRleHRJbmRlbnQuIEEgbGluZSBpcyBlbXB0eSBvbmx5IHdoZW4gbm90aGluZ1xuICAgIC8vIHJlbWFpbnMgYWZ0ZXIgdGhlIChjYXBwZWQpIGluZGVudGF0aW9uLlxuICAgIC8vIGluZGVudCA8IDAgbWVhbnMgbm8gY29udGVudCBsaW5lIHdhcyBkZXRlY3RlZCAoYSB3aG9sbHkgYmxhbmsgYmxvY2spLCBzb1xuICAgIC8vIGV2ZXJ5IGxpbmUgaXMgYW4gZW1wdHkgbGluZS5cbiAgICBsZXQgY29sdW1uID0gMFxuICAgIHdoaWxlIChjb2x1bW4gPCB0ZXh0SW5kZW50ICYmIGxpbmUuY2hhckNvZGVBdChjb2x1bW4pID09PSAweDIwLyogU3BhY2UgKi8pIGNvbHVtbisrXG5cbiAgICBpZiAoaW5kZW50IDwgMCB8fCBjb2x1bW4gPj0gbGluZS5sZW5ndGgpIHtcbiAgICAgIGVtcHR5TGluZXMrK1xuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50ID0gbGluZS5zbGljZSh0ZXh0SW5kZW50KVxuICAgIGNvbnN0IGZpcnN0ID0gY29udGVudC5jaGFyQ29kZUF0KDApXG5cbiAgICBpZiAoZm9sZGVkKSB7XG4gICAgICBpZiAoZmlyc3QgPT09IDB4MjAvKiBTcGFjZSAqLyB8fCBmaXJzdCA9PT0gMHgwOS8qIFRhYiAqLykge1xuICAgICAgICAvLyBNb3JlLWluZGVudGVkIGxpbmVzIGFyZSBub3QgZm9sZGVkLlxuICAgICAgICBhdE1vcmVJbmRlbnRlZCA9IHRydWVcbiAgICAgICAgcmVzdWx0ICs9ICdcXG4nLnJlcGVhdChkaWRSZWFkQ29udGVudCA/IDEgKyBlbXB0eUxpbmVzIDogZW1wdHlMaW5lcylcbiAgICAgIH0gZWxzZSBpZiAoYXRNb3JlSW5kZW50ZWQpIHtcbiAgICAgICAgYXRNb3JlSW5kZW50ZWQgPSBmYWxzZVxuICAgICAgICByZXN1bHQgKz0gJ1xcbicucmVwZWF0KGVtcHR5TGluZXMgKyAxKVxuICAgICAgfSBlbHNlIGlmIChlbXB0eUxpbmVzID09PSAwKSB7XG4gICAgICAgIGlmIChkaWRSZWFkQ29udGVudCkgcmVzdWx0ICs9ICcgJ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ICs9ICdcXG4nLnJlcGVhdChlbXB0eUxpbmVzKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgKz0gJ1xcbicucmVwZWF0KGRpZFJlYWRDb250ZW50ID8gMSArIGVtcHR5TGluZXMgOiBlbXB0eUxpbmVzKVxuICAgIH1cblxuICAgIHJlc3VsdCArPSBjb250ZW50XG4gICAgZGlkUmVhZENvbnRlbnQgPSB0cnVlXG4gICAgZW1wdHlMaW5lcyA9IDBcbiAgfVxuXG4gIGlmIChjaG9tcGluZyA9PT0gQ0hPTVBJTkdfS0VFUCkge1xuICAgIHJlc3VsdCArPSAnXFxuJy5yZXBlYXQoZGlkUmVhZENvbnRlbnQgPyAxICsgZW1wdHlMaW5lcyA6IGVtcHR5TGluZXMpXG4gIH0gZWxzZSBpZiAoY2hvbXBpbmcgIT09IENIT01QSU5HX1NUUklQKSB7XG4gICAgaWYgKGRpZFJlYWRDb250ZW50KSByZXN1bHQgKz0gJ1xcbidcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gZ2V0U2NhbGFyVmFsdWUgKGlucHV0OiBzdHJpbmcsIHNjYWxhcjogU2NhbGFyRXZlbnQpOiBzdHJpbmcge1xuICBpZiAoc2NhbGFyLnZhbHVlU3RhcnQgPT09IE5PX1JBTkdFKSByZXR1cm4gJydcblxuICBjb25zdCB7IHZhbHVlU3RhcnQsIHZhbHVlRW5kIH0gPSBzY2FsYXJcblxuICAvLyBGYXN0IHBhdGg6IHRoZSBwYXJzZXIgbWFya2VkIHRoaXMgc2NhbGFyIGFzIGEgdmVyYmF0aW0gc2xpY2Ugb2YgdGhlIGlucHV0XG4gIC8vIChzaW5nbGUtbGluZSBwbGFpbiAvIHF1b3RlZCB3aXRoIG5vIGVzY2FwZXMgb3IgZm9sZGVkIGJyZWFrcyksIHNvIHRoZVxuICAvLyBwZXItc3R5bGUgY2hhciBsb29wIGJlbG93IHdvdWxkIGp1c3QgcmVwcm9kdWNlIHRoZSBzbGljZS5cbiAgaWYgKHNjYWxhci5mYXN0KSByZXR1cm4gaW5wdXQuc2xpY2UodmFsdWVTdGFydCwgdmFsdWVFbmQpXG5cbiAgc3dpdGNoIChzY2FsYXIuc3R5bGUpIHtcbiAgICBjYXNlIFNDQUxBUl9TVFlMRV9TSU5HTEVfUVVPVEVEOlxuICAgICAgcmV0dXJuIGdldFNpbmdsZVF1b3RlZFZhbHVlKGlucHV0LCB2YWx1ZVN0YXJ0LCB2YWx1ZUVuZClcbiAgICBjYXNlIFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVEOlxuICAgICAgcmV0dXJuIGdldERvdWJsZVF1b3RlZFZhbHVlKGlucHV0LCB2YWx1ZVN0YXJ0LCB2YWx1ZUVuZClcbiAgICBjYXNlIFNDQUxBUl9TVFlMRV9MSVRFUkFMX0JMT0NLOlxuICAgICAgcmV0dXJuIGdldEJsb2NrVmFsdWUoaW5wdXQsIHZhbHVlU3RhcnQsIHZhbHVlRW5kLCBzY2FsYXIuaW5kZW50LCBzY2FsYXIuY2hvbXBpbmcsIGZhbHNlKVxuICAgIGNhc2UgU0NBTEFSX1NUWUxFX0ZPTERFRF9CTE9DSzpcbiAgICAgIHJldHVybiBnZXRCbG9ja1ZhbHVlKGlucHV0LCB2YWx1ZVN0YXJ0LCB2YWx1ZUVuZCwgc2NhbGFyLmluZGVudCwgc2NhbGFyLmNob21waW5nLCB0cnVlKVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZ2V0UGxhaW5WYWx1ZShpbnB1dCwgdmFsdWVTdGFydCwgdmFsdWVFbmQpXG4gIH1cbn1cblxuZXhwb3J0IHtcbiAgZ2V0U2NhbGFyVmFsdWVcbn1cbiIsICJjb25zdCBERUZBVUxUX1RBR19IQU5ETEVSUzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgc3RyaW5nPj4gPSB7XG4gICchJzogJyEnLFxuICAnISEnOiAndGFnOnlhbWwub3JnLDIwMDI6J1xufVxuXG5mdW5jdGlvbiB0YWdQZXJjZW50RW5jb2RlIChzb3VyY2U6IHN0cmluZykge1xuICByZXR1cm4gZW5jb2RlVVJJKHNvdXJjZSkucmVwbGFjZSgvIS9nLCAnJTIxJylcbn1cblxuZnVuY3Rpb24gdGFnTmFtZUZ1bGwgKHJhd1RhZzogc3RyaW5nLCB0YWdIYW5kbGVycz86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHN0cmluZz4+KSB7XG4gIGlmIChyYXdUYWcuc3RhcnRzV2l0aCgnITwnKSAmJiByYXdUYWcuZW5kc1dpdGgoJz4nKSkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocmF3VGFnLnNsaWNlKDIsIC0xKSlcbiAgfVxuXG4gIGNvbnN0IGhhbmRsZUVuZCA9IHJhd1RhZy5pbmRleE9mKCchJywgMSlcbiAgY29uc3QgaGFuZGxlID0gaGFuZGxlRW5kID09PSAtMSA/ICchJyA6IHJhd1RhZy5zbGljZSgwLCBoYW5kbGVFbmQgKyAxKVxuICBjb25zdCBwcmVmaXggPSB0YWdIYW5kbGVycz8uW2hhbmRsZV0gPz8gREVGQVVMVF9UQUdfSEFORExFUlNbaGFuZGxlXSA/PyBoYW5kbGVcblxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHByZWZpeCkgKyBkZWNvZGVVUklDb21wb25lbnQocmF3VGFnLnNsaWNlKGhhbmRsZS5sZW5ndGgpKVxufVxuXG5mdW5jdGlvbiB0YWdOYW1lU2hvcnQgKGZ1bGxUYWc6IHN0cmluZykge1xuICBsZXQgdGFnID0gZnVsbFRhZ1xuXG4gIGlmICh0YWcuY2hhckNvZGVBdCgwKSA9PT0gMHgyMSkge1xuICAgIHRhZyA9IHRhZy5zbGljZSgxKVxuICAgIHJldHVybiBgISR7dGFnUGVyY2VudEVuY29kZSh0YWcpfWBcbiAgfVxuXG4gIGlmICh0YWcuc2xpY2UoMCwgMTgpID09PSAndGFnOnlhbWwub3JnLDIwMDI6Jykge1xuICAgIHJldHVybiBgISEke3RhZ1BlcmNlbnRFbmNvZGUodGFnLnNsaWNlKDE4KSl9YFxuICB9XG5cbiAgcmV0dXJuIGAhPCR7dGFnUGVyY2VudEVuY29kZSh0YWcpfT5gXG59XG5cbmV4cG9ydCB7XG4gIHRhZ05hbWVGdWxsLFxuICB0YWdOYW1lU2hvcnRcbn1cbiIsICJpbXBvcnQge1xuICBFVkVOVF9BTElBUyxcbiAgRVZFTlRfRE9DVU1FTlQsXG4gIEVWRU5UX01BUFBJTkcsXG4gIEVWRU5UX1BPUCxcbiAgRVZFTlRfU0NBTEFSLFxuICBFVkVOVF9TRVFVRU5DRSxcbiAgU0NBTEFSX1NUWUxFX1BMQUlOLFxuICB0eXBlIEV2ZW50LFxuICB0eXBlIFRhZ0hhbmRsZXJzLFxuICB0eXBlIE1hcHBpbmdFdmVudCxcbiAgdHlwZSBTY2FsYXJFdmVudCxcbiAgdHlwZSBTZXF1ZW5jZUV2ZW50XG59IGZyb20gJy4vZXZlbnRzLnRzJ1xuaW1wb3J0IHsgZ2V0U2NhbGFyVmFsdWUgfSBmcm9tICcuL3BhcnNlcl9zY2FsYXIudHMnXG5pbXBvcnQgeyBDT1JFX1NDSEVNQSwgdHlwZSBTY2hlbWEgfSBmcm9tICcuLi9zY2hlbWEudHMnXG5pbXBvcnQge1xuICBNRVJHRV9LRVksXG4gIE5PVF9SRVNPTFZFRCxcbiAgdHlwZSBNYXBwaW5nVGFnRGVmaW5pdGlvbixcbiAgdHlwZSBTY2FsYXJUYWdEZWZpbml0aW9uLFxuICB0eXBlIFNlcXVlbmNlVGFnRGVmaW5pdGlvblxufSBmcm9tICcuLi90YWcudHMnXG5pbXBvcnQgeyBZQU1MRXhjZXB0aW9uLCB0aHJvd0Vycm9yQXQgfSBmcm9tICcuLi9jb21tb24vZXhjZXB0aW9uLnRzJ1xuaW1wb3J0IHsgdGFnTmFtZUZ1bGwgfSBmcm9tICcuLi9jb21tb24vdGFnbmFtZS50cydcblxuY29uc3QgTk9fUkFOR0UgPSAtMVxuXG5pbnRlcmZhY2UgRG9jdW1lbnRGcmFtZSB7XG4gIGtpbmQ6ICdkb2N1bWVudCdcbiAgcG9zaXRpb246IG51bWJlclxuICB2YWx1ZTogdW5rbm93blxuICBoYXNWYWx1ZTogYm9vbGVhblxufVxuXG5pbnRlcmZhY2UgU2VxdWVuY2VGcmFtZSB7XG4gIGtpbmQ6ICdzZXF1ZW5jZSdcbiAgcG9zaXRpb246IG51bWJlclxuICB2YWx1ZTogYW55XG4gIHRhZzogU2VxdWVuY2VUYWdEZWZpbml0aW9uPGFueSwgYW55PlxuICBhbmNob3I6IEFuY2hvciB8IG51bGxcbiAgaW5kZXg6IG51bWJlclxuICAvLyBUcnVlIHdoZW4gdGhpcyBzZXF1ZW5jZSBpcyB0aGUgc291cmNlIGxpc3Qgb2YgYSBgPDxgIG1lcmdlIChgPDw6IFsuLi5dYCkuXG4gIC8vIEVhY2ggZWxlbWVudCBpcyB2YWxpZGF0ZWQgYXMgYSBtYXBwaW5nIG9uIGFycml2YWw7IHRoZSBtYXRlcmlhbGl6ZWQgbGlzdCBpc1xuICAvLyB0aGVuIGRlbGl2ZXJlZCB0byB0aGUgdGFyZ2V0IG1hcHBpbmcsIHdoaWNoIGZvbGRzIHRoZSBlbGVtZW50cyBpbi5cbiAgbWVyZ2U6IGJvb2xlYW5cbn1cblxuaW50ZXJmYWNlIE1hcHBpbmdGcmFtZSB7XG4gIGtpbmQ6ICdtYXBwaW5nJ1xuICBwb3NpdGlvbjogbnVtYmVyXG4gIHZhbHVlOiBhbnlcbiAgdGFnOiBNYXBwaW5nVGFnRGVmaW5pdGlvbjxhbnksIGFueT5cbiAgYW5jaG9yOiBBbmNob3IgfCBudWxsXG4gIGtleTogdW5rbm93blxuICBrZXlQb3NpdGlvbjogbnVtYmVyXG4gIGhhc0tleTogYm9vbGVhblxuICAvLyBLZXlzIGJyb3VnaHQgaW4gYnkgYSBtZXJnZSB0aGF0IGFuIGV4cGxpY2l0IHBhaXIgaXMgc3RpbGwgYWxsb3dlZCB0b1xuICAvLyBvdmVycmlkZS4gTGF6aWx5IGFsbG9jYXRlZDogc3RheXMgbnVsbCBmb3IgbWFwcGluZ3Mgd2l0aG91dCBgPDxgLlxuICBvdmVycmlkYWJsZTogU2V0PHVua25vd24+IHwgbnVsbFxufVxuXG50eXBlIEZyYW1lID0gRG9jdW1lbnRGcmFtZSB8IFNlcXVlbmNlRnJhbWUgfCBNYXBwaW5nRnJhbWVcblxudHlwZSBBbnlUYWcgPSBTY2FsYXJUYWdEZWZpbml0aW9uIHwgU2VxdWVuY2VUYWdEZWZpbml0aW9uPGFueSwgYW55PiB8IE1hcHBpbmdUYWdEZWZpbml0aW9uPGFueSwgYW55PlxuXG5pbnRlcmZhY2UgVmFsdWVBbmRUYWcge1xuICB2YWx1ZTogdW5rbm93blxuICB0YWc6IEFueVRhZ1xufVxuXG5pbnRlcmZhY2UgQW5jaG9yIHtcbiAgdmFsdWU6IHVua25vd25cbiAgdGFnOiBBbnlUYWdcbiAgaXNWYWx1ZUZpbmFsOiBib29sZWFuXG59XG5cbmludGVyZmFjZSBDb25zdHJ1Y3Rvck9wdGlvbnMge1xuICBzb3VyY2U6IHN0cmluZ1xuICBmaWxlbmFtZT86IHN0cmluZ1xuICBzY2hlbWE/OiBTY2hlbWFcbiAganNvbj86IGJvb2xlYW5cbiAgbWF4VG90YWxNZXJnZUtleXM/OiBudW1iZXJcbiAgbWF4QWxpYXNlcz86IG51bWJlclxufVxuXG4vLyBgc291cmNlYCBpcyBpbnB1dCBkYXRhLCBub3QgY29uZmlnIOKAlCBzbyBpdCBoYXMgbm8gZGVmYXVsdCBoZXJlLlxuY29uc3QgREVGQVVMVF9DT05TVFJVQ1RPUl9PUFRJT05TOiBSZXF1aXJlZDxPbWl0PENvbnN0cnVjdG9yT3B0aW9ucywgJ3NvdXJjZSc+PiA9IHtcbiAgZmlsZW5hbWU6ICcnLFxuICBzY2hlbWE6IENPUkVfU0NIRU1BLFxuICBqc29uOiBmYWxzZSxcbiAgbWF4VG90YWxNZXJnZUtleXM6IDEwMDAwLFxuICBtYXhBbGlhc2VzOiAtMVxufVxuXG5pbnRlcmZhY2UgQ29uc3RydWN0b3JTdGF0ZSBleHRlbmRzIFJlcXVpcmVkPENvbnN0cnVjdG9yT3B0aW9ucz4ge1xuICBldmVudHM6IEV2ZW50W11cbiAgZG9jdW1lbnRzOiB1bmtub3duW11cbiAgZXZlbnRJbmRleDogbnVtYmVyXG4gIHBvc2l0aW9uOiBudW1iZXJcbiAgZnJhbWVzOiBGcmFtZVtdXG4gIGFuY2hvcnM6IE1hcDxzdHJpbmcsIEFuY2hvcj5cbiAgdGFnSGFuZGxlcnM6IFRhZ0hhbmRsZXJzXG4gIHRvdGFsTWVyZ2VLZXlzOiBudW1iZXJcbiAgYWxpYXNDb3VudDogbnVtYmVyXG59XG5cbmZ1bmN0aW9uIGV2ZW50UG9zaXRpb24gKGV2ZW50OiBFdmVudCkge1xuICBpZiAoJ3RhZ1N0YXJ0JyBpbiBldmVudCAmJiBldmVudC50YWdTdGFydCAhPT0gTk9fUkFOR0UpIHJldHVybiBldmVudC50YWdTdGFydFxuICBpZiAoJ2FuY2hvclN0YXJ0JyBpbiBldmVudCAmJiBldmVudC5hbmNob3JTdGFydCAhPT0gTk9fUkFOR0UpIHJldHVybiBldmVudC5hbmNob3JTdGFydFxuICBpZiAoJ3ZhbHVlU3RhcnQnIGluIGV2ZW50ICYmIGV2ZW50LnZhbHVlU3RhcnQgIT09IE5PX1JBTkdFKSByZXR1cm4gZXZlbnQudmFsdWVTdGFydFxuICBpZiAoJ3N0YXJ0JyBpbiBldmVudCkgcmV0dXJuIGV2ZW50LnN0YXJ0XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIHRocm93RXJyb3IgKHN0YXRlOiBDb25zdHJ1Y3RvclN0YXRlLCBtZXNzYWdlOiBzdHJpbmcpOiBuZXZlciB7XG4gIHRocm93RXJyb3JBdChzdGF0ZS5zb3VyY2UsIHN0YXRlLnBvc2l0aW9uLCBtZXNzYWdlLCBzdGF0ZS5maWxlbmFtZSlcbn1cblxuZnVuY3Rpb24gZmluYWxpemVDb2xsZWN0aW9uIChcbiAgc3RhdGU6IENvbnN0cnVjdG9yU3RhdGUsXG4gIHBvc2l0aW9uOiBudW1iZXIsXG4gIHRhZzogU2VxdWVuY2VUYWdEZWZpbml0aW9uPGFueSwgYW55PiB8IE1hcHBpbmdUYWdEZWZpbml0aW9uPGFueSwgYW55PixcbiAgY2FycmllcjogdW5rbm93blxuKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHRhZy5maW5hbGl6ZShjYXJyaWVyKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFlBTUxFeGNlcHRpb24pIHRocm93IGVycm9yXG4gICAgdGhyb3dFcnJvckF0KFxuICAgICAgc3RhdGUuc291cmNlLFxuICAgICAgcG9zaXRpb24sXG4gICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvciksXG4gICAgICBzdGF0ZS5maWxlbmFtZVxuICAgIClcbiAgfVxufVxuXG5mdW5jdGlvbiBsb29rdXBUYWc8VCBleHRlbmRzIFNjYWxhclRhZ0RlZmluaXRpb24gfCBTZXF1ZW5jZVRhZ0RlZmluaXRpb24gfCBNYXBwaW5nVGFnRGVmaW5pdGlvbj4gKFxuICBleGFjdDogUmVjb3JkPHN0cmluZywgVD4sXG4gIHByZWZpeDogcmVhZG9ubHkgVFtdLFxuICB0YWdOYW1lOiBzdHJpbmdcbik6IFQgfCB1bmRlZmluZWQge1xuICBjb25zdCBleGFjdFRhZyA9IGV4YWN0W3RhZ05hbWVdXG4gIGlmIChleGFjdFRhZykgcmV0dXJuIGV4YWN0VGFnXG5cbiAgZm9yIChjb25zdCB0YWcgb2YgcHJlZml4KSB7XG4gICAgaWYgKHRhZ05hbWUuc3RhcnRzV2l0aCh0YWcudGFnTmFtZSkpIHJldHVybiB0YWdcbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWRcbn1cblxuZnVuY3Rpb24gZmluZEV4cGxpY2l0VGFnPFQgZXh0ZW5kcyBTY2FsYXJUYWdEZWZpbml0aW9uIHwgU2VxdWVuY2VUYWdEZWZpbml0aW9uIHwgTWFwcGluZ1RhZ0RlZmluaXRpb24+IChcbiAgc3RhdGU6IENvbnN0cnVjdG9yU3RhdGUsXG4gIGV4YWN0OiBSZWNvcmQ8c3RyaW5nLCBUPixcbiAgcHJlZml4OiByZWFkb25seSBUW10sXG4gIHRhZ05hbWU6IHN0cmluZyxcbiAgbm9kZUtpbmQ6IFRbJ25vZGVLaW5kJ11cbikge1xuICBjb25zdCB0YWcgPSBsb29rdXBUYWcoZXhhY3QsIHByZWZpeCwgdGFnTmFtZSlcbiAgaWYgKHRhZykgcmV0dXJuIHRhZ1xuXG4gIHRocm93RXJyb3Ioc3RhdGUsIGB1bmtub3duICR7bm9kZUtpbmR9IHRhZyAhPCR7dGFnTmFtZX0+YClcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0U2NhbGFyIChcbiAgc3RhdGU6IENvbnN0cnVjdG9yU3RhdGUsXG4gIGV2ZW50OiBTY2FsYXJFdmVudFxuKTogVmFsdWVBbmRUYWcge1xuICBjb25zdCBzb3VyY2UgPSBnZXRTY2FsYXJWYWx1ZShzdGF0ZS5zb3VyY2UsIGV2ZW50KVxuICBjb25zdCByYXdUYWcgPSBldmVudC50YWdTdGFydCA9PT0gTk9fUkFOR0VcbiAgICA/ICcnXG4gICAgOiBzdGF0ZS5zb3VyY2Uuc2xpY2UoZXZlbnQudGFnU3RhcnQsIGV2ZW50LnRhZ0VuZClcbiAgY29uc3Qgc3RyVGFnID0gc3RhdGUuc2NoZW1hLmRlZmF1bHRTY2FsYXJUYWdcblxuICBpZiAocmF3VGFnICE9PSAnJykge1xuICAgIGlmIChyYXdUYWcgPT09ICchJykgcmV0dXJuIHsgdmFsdWU6IHNvdXJjZSwgdGFnOiBzdHJUYWcgfVxuXG4gICAgY29uc3QgdGFnTmFtZSA9IHRhZ05hbWVGdWxsKHJhd1RhZywgc3RhdGUudGFnSGFuZGxlcnMpXG4gICAgY29uc3Qgc2NhbGFyVGFnID0gbG9va3VwVGFnKHN0YXRlLnNjaGVtYS5leGFjdC5zY2FsYXIsIHN0YXRlLnNjaGVtYS5wcmVmaXguc2NhbGFyLCB0YWdOYW1lKVxuXG4gICAgaWYgKHNjYWxhclRhZykge1xuICAgICAgY29uc3QgcmVzdWx0ID0gc2NhbGFyVGFnLnJlc29sdmUoc291cmNlLCB0cnVlLCB0YWdOYW1lKVxuXG4gICAgICBpZiAocmVzdWx0ID09PSBOT1RfUkVTT0xWRUQpIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgYGNhbm5vdCByZXNvbHZlIGEgbm9kZSB3aXRoICE8JHt0YWdOYW1lfT4gZXhwbGljaXQgdGFnYClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHsgdmFsdWU6IHJlc3VsdCwgdGFnOiBzY2FsYXJUYWcgfVxuICAgIH1cblxuICAgIC8vIEFuIGVtcHR5IG5vZGUgY2FycnlpbmcgYSBjb2xsZWN0aW9uIHRhZyAoZS5nLiBgISFtYXBgLCBgISFzZXFgKSBpcyBlbWl0dGVkXG4gICAgLy8gYnkgdGhlIHBhcnNlciBhcyBhIHNjYWxhciBldmVudCwgc2luY2UgdGhlcmUgaXMgbm8gY29sbGVjdGlvbiBzeW50YXggdG8ga2V5XG4gICAgLy8gb2ZmLiBSZXNvbHZlIGl0IGhlcmUgYnkgdGhlIGV4cGxpY2l0IHRhZydzIGtpbmQgaW50byBhbiBlbXB0eSBjb2xsZWN0aW9uLlxuICAgIGNvbnN0IGNvbGxlY3Rpb25UYWdEZWYgPVxuICAgICAgbG9va3VwVGFnKHN0YXRlLnNjaGVtYS5leGFjdC5tYXBwaW5nLCBzdGF0ZS5zY2hlbWEucHJlZml4Lm1hcHBpbmcsIHRhZ05hbWUpID8/XG4gICAgICBsb29rdXBUYWcoc3RhdGUuc2NoZW1hLmV4YWN0LnNlcXVlbmNlLCBzdGF0ZS5zY2hlbWEucHJlZml4LnNlcXVlbmNlLCB0YWdOYW1lKVxuXG4gICAgaWYgKGNvbGxlY3Rpb25UYWdEZWYpIHtcbiAgICAgIGlmIChzb3VyY2UgIT09ICcnKSB7XG4gICAgICAgIHRocm93RXJyb3Ioc3RhdGUsIGBjYW5ub3QgcmVzb2x2ZSBhIG5vZGUgd2l0aCAhPCR7dGFnTmFtZX0+IGV4cGxpY2l0IHRhZ2ApXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNhcnJpZXIgPSBjb2xsZWN0aW9uVGFnRGVmLmNyZWF0ZSh0YWdOYW1lKVxuICAgICAgY29uc3QgdmFsdWUgPSBjb2xsZWN0aW9uVGFnRGVmLmNhcnJpZXJJc1Jlc3VsdFxuICAgICAgICA/IGNhcnJpZXJcbiAgICAgICAgOiBmaW5hbGl6ZUNvbGxlY3Rpb24oc3RhdGUsIHN0YXRlLnBvc2l0aW9uLCBjb2xsZWN0aW9uVGFnRGVmLCBjYXJyaWVyKVxuICAgICAgcmV0dXJuIHsgdmFsdWUsIHRhZzogY29sbGVjdGlvblRhZ0RlZiB9XG4gICAgfVxuXG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgYHVua25vd24gc2NhbGFyIHRhZyAhPCR7dGFnTmFtZX0+YClcbiAgfVxuXG4gIGlmIChldmVudC5zdHlsZSA9PT0gU0NBTEFSX1NUWUxFX1BMQUlOKSB7XG4gICAgLy8gY2hhckF0KDApIChub3Qgc291cmNlWzBdKSB5aWVsZHMgJycgZm9yIGFuIGVtcHR5IHNvdXJjZSwgd2hpY2ggaXMgdGhlIGtleVxuICAgIC8vIHRoZSBudWxsIHRhZyBkZWNsYXJlczsgc291cmNlWzBdIHdvdWxkIGJlIHVuZGVmaW5lZCBhbmQgbWlzcyB0aGF0IGJ1Y2tldC5cbiAgICBjb25zdCBjYW5kaWRhdGVzID0gc3RhdGUuc2NoZW1hLmltcGxpY2l0U2NhbGFyQnlGaXJzdENoYXIuZ2V0KHNvdXJjZS5jaGFyQXQoMCkpID8/XG4gICAgICBzdGF0ZS5zY2hlbWEuaW1wbGljaXRTY2FsYXJBbnlGaXJzdENoYXJcbiAgICBmb3IgKGNvbnN0IHRhZyBvZiBjYW5kaWRhdGVzKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSB0YWcucmVzb2x2ZShzb3VyY2UsIGZhbHNlLCB0YWcudGFnTmFtZSlcbiAgICAgIGlmIChyZXN1bHQgIT09IE5PVF9SRVNPTFZFRCkgcmV0dXJuIHsgdmFsdWU6IHJlc3VsdCwgdGFnIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4geyB2YWx1ZTogc3RyVGFnLnJlc29sdmUoc291cmNlLCBmYWxzZSwgc3RyVGFnLnRhZ05hbWUpLCB0YWc6IHN0clRhZyB9XG59XG5cbmZ1bmN0aW9uIGNvbGxlY3Rpb25UYWc8VGFnIGV4dGVuZHMgU2VxdWVuY2VUYWdEZWZpbml0aW9uIHwgTWFwcGluZ1RhZ0RlZmluaXRpb24+IChcbiAgc3RhdGU6IENvbnN0cnVjdG9yU3RhdGUsXG4gIGV2ZW50OiBTZXF1ZW5jZUV2ZW50IHwgTWFwcGluZ0V2ZW50LFxuICBleGFjdDogUmVjb3JkPHN0cmluZywgVGFnPixcbiAgcHJlZml4OiByZWFkb25seSBUYWdbXSxcbiAgZGVmYXVsdFRhZ05hbWU6IHN0cmluZyxcbiAgbm9kZUtpbmQ6IFRhZ1snbm9kZUtpbmQnXVxuKSB7XG4gIGNvbnN0IHJhd1RhZyA9IGV2ZW50LnRhZ1N0YXJ0ID09PSBOT19SQU5HRVxuICAgID8gJydcbiAgICA6IHN0YXRlLnNvdXJjZS5zbGljZShldmVudC50YWdTdGFydCwgZXZlbnQudGFnRW5kKVxuICBjb25zdCB0YWdOYW1lID0gcmF3VGFnID09PSAnJyB8fCByYXdUYWcgPT09ICchJ1xuICAgID8gZGVmYXVsdFRhZ05hbWVcbiAgICA6IHRhZ05hbWVGdWxsKHJhd1RhZywgc3RhdGUudGFnSGFuZGxlcnMpXG5cbiAgcmV0dXJuIHtcbiAgICB0YWdOYW1lLFxuICAgIHRhZzogZmluZEV4cGxpY2l0VGFnKHN0YXRlLCBleGFjdCwgcHJlZml4LCB0YWdOYW1lLCBub2RlS2luZClcbiAgfVxufVxuXG4vLyBBIG1lcmdlIHNvdXJjZSBtdXN0IGJlIGEgbWFwcGluZzsgZXZlcnkgbWFwcGluZyB0YWcgZXhwb3NlcyB0aGUgcmVhZCBzaWRlLlxuZnVuY3Rpb24gaXNNYXBwaW5nVGFnICh0YWc6IEFueVRhZyk6IHRhZyBpcyBNYXBwaW5nVGFnRGVmaW5pdGlvbjxhbnksIGFueT4ge1xuICByZXR1cm4gdGFnLm5vZGVLaW5kID09PSAnbWFwcGluZydcbn1cblxuLy8gRm9sZCB0aGUga2V5cyBvZiBvbmUgbWFwcGluZyBzb3VyY2UgaW50byB0aGUgdGFyZ2V0IGZyYW1lLCBob25vcmluZyBtZXJnZVxuLy8gcHJlY2VkZW5jZTogYW4gYWxyZWFkeS1wcmVzZW50IGtleSAoZXhwbGljaXQgb3IgZnJvbSBhbiBlYXJsaWVyIHNvdXJjZSkgd2lucy5cbmZ1bmN0aW9uIG1lcmdlS2V5cyAoc3RhdGU6IENvbnN0cnVjdG9yU3RhdGUsIGZyYW1lOiBNYXBwaW5nRnJhbWUsIHNvdXJjZTogdW5rbm93biwgc291cmNlVGFnOiBNYXBwaW5nVGFnRGVmaW5pdGlvbjxhbnksIGFueT4pIHtcbiAgZm9yIChjb25zdCBzb3VyY2VLZXkgb2Ygc291cmNlVGFnLmtleXMoc291cmNlKSkge1xuICAgIGlmIChzdGF0ZS5tYXhUb3RhbE1lcmdlS2V5cyAhPT0gLTEgJiYgKytzdGF0ZS50b3RhbE1lcmdlS2V5cyA+IHN0YXRlLm1heFRvdGFsTWVyZ2VLZXlzKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCBgbWVyZ2Uga2V5cyBleGNlZWRlZCBtYXhUb3RhbE1lcmdlS2V5cyAoJHtzdGF0ZS5tYXhUb3RhbE1lcmdlS2V5c30pYClcbiAgICB9XG5cbiAgICBpZiAoZnJhbWUudGFnLmhhcyhmcmFtZS52YWx1ZSwgc291cmNlS2V5KSkgY29udGludWVcblxuICAgIGNvbnN0IGVyciA9IGZyYW1lLnRhZy5hZGRQYWlyKGZyYW1lLnZhbHVlLCBzb3VyY2VLZXksIHNvdXJjZVRhZy5nZXQoc291cmNlLCBzb3VyY2VLZXkpKVxuICAgIGlmIChlcnIpIHRocm93RXJyb3Ioc3RhdGUsIGVycilcbiAgICA7KGZyYW1lLm92ZXJyaWRhYmxlID8/PSBuZXcgU2V0KCkpLmFkZChzb3VyY2VLZXkpXG4gIH1cbn1cblxuLy8gVGhlIHZhbHVlIG9mIGEgYDw8YCBrZXk6IGVpdGhlciBhIG1hcHBpbmcgKGZvbGQgaXRzIGtleXMpIG9yIGEgc2VxdWVuY2Ugb2Zcbi8vIG1hcHBpbmdzIChmb2xkIGVhY2gpLiBBIG1lcmdlIHNlcXVlbmNlIGhhcyBhbHJlYWR5IGhhZCBldmVyeSBlbGVtZW50IHZhbGlkYXRlZFxuLy8gYXMgYSBtYXBwaW5nIG9uIGFycml2YWwgKHNlZSBhZGRWYWx1ZSksIGFuZCBpdHMgZWxlbWVudHMgd2VyZSBidWlsdCBieSB0aGVcbi8vIHRhcmdldCdzIG93biBtYXBwaW5nIHRhZywgc28gdGhleSBhcmUgcmVhZCBiYWNrIHdpdGggaXQuXG5mdW5jdGlvbiBtZXJnZVNvdXJjZSAoc3RhdGU6IENvbnN0cnVjdG9yU3RhdGUsIGZyYW1lOiBNYXBwaW5nRnJhbWUsIHNvdXJjZTogdW5rbm93biwgc291cmNlVGFnOiBBbnlUYWcpIHtcbiAgc3RhdGUucG9zaXRpb24gPSBmcmFtZS5rZXlQb3NpdGlvblxuXG4gIGlmIChpc01hcHBpbmdUYWcoc291cmNlVGFnKSkge1xuICAgIG1lcmdlS2V5cyhzdGF0ZSwgZnJhbWUsIHNvdXJjZSwgc291cmNlVGFnKVxuICB9IGVsc2UgaWYgKHNvdXJjZVRhZy5ub2RlS2luZCA9PT0gJ3NlcXVlbmNlJyAmJiBBcnJheS5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygc291cmNlKSB7XG4gICAgICBtZXJnZUtleXMoc3RhdGUsIGZyYW1lLCBlbGVtZW50LCBmcmFtZS50YWcpXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICdjYW5ub3QgbWVyZ2UgbWFwcGluZ3M7IHRoZSBwcm92aWRlZCBzb3VyY2Ugb2JqZWN0IGlzIHVuYWNjZXB0YWJsZScpXG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkTWFwcGluZ1ZhbHVlIChzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSwgZnJhbWU6IE1hcHBpbmdGcmFtZSwga2V5OiB1bmtub3duLCB2YWx1ZTogdW5rbm93biwgdGFnOiBBbnlUYWcpIHtcbiAgc3RhdGUucG9zaXRpb24gPSBmcmFtZS5rZXlQb3NpdGlvblxuXG4gIC8vIGA8PGAgaXMgaW50ZXJjZXB0ZWQgYmVmb3JlIGRlZHVwLCBzbyBhIHJlcGVhdGVkIG1lcmdlIGtleSBpcyBhbGxvd2VkLlxuICBpZiAoa2V5ID09PSBNRVJHRV9LRVkpIHtcbiAgICBtZXJnZVNvdXJjZShzdGF0ZSwgZnJhbWUsIHZhbHVlLCB0YWcpXG4gICAgcmV0dXJuXG4gIH1cblxuICBpZiAoIXN0YXRlLmpzb24gJiYgZnJhbWUudGFnLmhhcyhmcmFtZS52YWx1ZSwga2V5KSAmJiAhZnJhbWUub3ZlcnJpZGFibGU/LmhhcyhrZXkpKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2R1cGxpY2F0ZWQgbWFwcGluZyBrZXknKVxuICB9XG5cbiAgY29uc3QgZXJyID0gZnJhbWUudGFnLmFkZFBhaXIoZnJhbWUudmFsdWUsIGtleSwgdmFsdWUpXG4gIGlmIChlcnIpIHRocm93RXJyb3Ioc3RhdGUsIGVycilcbiAgZnJhbWUub3ZlcnJpZGFibGU/LmRlbGV0ZShrZXkpXG59XG5cbmZ1bmN0aW9uIGFkZFZhbHVlIChzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSwgdmFsdWU6IHVua25vd24sIHRhZzogQW55VGFnKSB7XG4gIGNvbnN0IGZyYW1lID0gc3RhdGUuZnJhbWVzW3N0YXRlLmZyYW1lcy5sZW5ndGggLSAxXSFcblxuICBpZiAoZnJhbWUua2luZCA9PT0gJ2RvY3VtZW50Jykge1xuICAgIGZyYW1lLnZhbHVlID0gdmFsdWVcbiAgICBmcmFtZS5oYXNWYWx1ZSA9IHRydWVcbiAgfSBlbHNlIGlmIChmcmFtZS5raW5kID09PSAnc2VxdWVuY2UnKSB7XG4gICAgaWYgKGZyYW1lLm1lcmdlKSB7XG4gICAgICAvLyBFbGVtZW50IG9mIGEgYDw8OiBbLi4uXWAgbGlzdDogdmFsaWRhdGUgaXQgaXMgYSBtYXBwaW5nLCB0aGVuIGNvbGxlY3RcbiAgICAgIC8vIGl0IGxpa2UgYW55IG90aGVyIGl0ZW0gZm9yIHRoZSB0YXJnZXQgdG8gZm9sZCBpbi5cbiAgICAgIGlmICghaXNNYXBwaW5nVGFnKHRhZykpIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2Nhbm5vdCBtZXJnZSBtYXBwaW5nczsgdGhlIHByb3ZpZGVkIHNvdXJjZSBvYmplY3QgaXMgdW5hY2NlcHRhYmxlJylcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZXJyID0gZnJhbWUudGFnLmFkZEl0ZW0oZnJhbWUudmFsdWUsIHZhbHVlLCBmcmFtZS5pbmRleCsrKVxuICAgIGlmIChlcnIpIHRocm93RXJyb3Ioc3RhdGUsIGVycilcbiAgfSBlbHNlIGlmIChmcmFtZS5oYXNLZXkpIHtcbiAgICBjb25zdCBrZXkgPSBmcmFtZS5rZXlcbiAgICBmcmFtZS5rZXkgPSB1bmRlZmluZWRcbiAgICBmcmFtZS5oYXNLZXkgPSBmYWxzZVxuICAgIGFkZE1hcHBpbmdWYWx1ZShzdGF0ZSwgZnJhbWUsIGtleSwgdmFsdWUsIHRhZylcbiAgfSBlbHNlIHtcbiAgICBmcmFtZS5rZXkgPSB2YWx1ZVxuICAgIGZyYW1lLmtleVBvc2l0aW9uID0gc3RhdGUucG9zaXRpb25cbiAgICBmcmFtZS5oYXNLZXkgPSB0cnVlXG4gIH1cbn1cblxuZnVuY3Rpb24gc3RvcmVBbmNob3IgKFxuICBzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSxcbiAgZXZlbnQ6IFNjYWxhckV2ZW50IHwgU2VxdWVuY2VFdmVudCB8IE1hcHBpbmdFdmVudCxcbiAgdmFsdWU6IHVua25vd24sXG4gIHRhZzogQW55VGFnLFxuICBpc1ZhbHVlRmluYWw6IGJvb2xlYW5cbik6IEFuY2hvciB8IG51bGwge1xuICBpZiAoZXZlbnQuYW5jaG9yU3RhcnQgIT09IE5PX1JBTkdFKSB7XG4gICAgY29uc3QgYW5jaG9yID0ge1xuICAgICAgdmFsdWUsXG4gICAgICB0YWcsXG4gICAgICBpc1ZhbHVlRmluYWxcbiAgICB9XG4gICAgc3RhdGUuYW5jaG9ycy5zZXQoc3RhdGUuc291cmNlLnNsaWNlKGV2ZW50LmFuY2hvclN0YXJ0LCBldmVudC5hbmNob3JFbmQpLCBhbmNob3IpXG4gICAgcmV0dXJuIGFuY2hvclxuICB9XG5cbiAgcmV0dXJuIG51bGxcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0RnJvbUV2ZW50cyAoZXZlbnRzOiBFdmVudFtdLCBvcHRpb25zOiBDb25zdHJ1Y3Rvck9wdGlvbnMpOiB1bmtub3duW10ge1xuICBjb25zdCBzdGF0ZTogQ29uc3RydWN0b3JTdGF0ZSA9IHtcbiAgICAuLi5ERUZBVUxUX0NPTlNUUlVDVE9SX09QVElPTlMsXG4gICAgLi4ub3B0aW9ucyxcbiAgICBldmVudHMsXG4gICAgZG9jdW1lbnRzOiBbXSxcbiAgICBldmVudEluZGV4OiAwLFxuICAgIHBvc2l0aW9uOiAwLFxuICAgIGZyYW1lczogW10sXG4gICAgYW5jaG9yczogbmV3IE1hcCgpLFxuICAgIHRhZ0hhbmRsZXJzOiBPYmplY3QuY3JlYXRlKG51bGwpLFxuICAgIHRvdGFsTWVyZ2VLZXlzOiAwLFxuICAgIGFsaWFzQ291bnQ6IDBcbiAgfVxuXG4gIHdoaWxlIChzdGF0ZS5ldmVudEluZGV4IDwgc3RhdGUuZXZlbnRzLmxlbmd0aCkge1xuICAgIGNvbnN0IGV2ZW50ID0gc3RhdGUuZXZlbnRzW3N0YXRlLmV2ZW50SW5kZXgrK11cbiAgICBzdGF0ZS5wb3NpdGlvbiA9IGV2ZW50UG9zaXRpb24oZXZlbnQpXG5cbiAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgIGNhc2UgRVZFTlRfRE9DVU1FTlQ6XG4gICAgICAgIHN0YXRlLmFuY2hvcnMgPSBuZXcgTWFwKClcbiAgICAgICAgc3RhdGUuYWxpYXNDb3VudCA9IDBcbiAgICAgICAgc3RhdGUudGFnSGFuZGxlcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgICAgIGZvciAoY29uc3QgZGlyZWN0aXZlIG9mIGV2ZW50LmRpcmVjdGl2ZXMpIHtcbiAgICAgICAgICBpZiAoZGlyZWN0aXZlLmtpbmQgPT09ICd0YWcnKSBzdGF0ZS50YWdIYW5kbGVyc1tkaXJlY3RpdmUuaGFuZGxlXSA9IGRpcmVjdGl2ZS5wcmVmaXhcbiAgICAgICAgfVxuICAgICAgICBzdGF0ZS5mcmFtZXMucHVzaCh7IGtpbmQ6ICdkb2N1bWVudCcsIHBvc2l0aW9uOiBzdGF0ZS5wb3NpdGlvbiwgdmFsdWU6IHVuZGVmaW5lZCwgaGFzVmFsdWU6IGZhbHNlIH0pXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgRVZFTlRfU0NBTEFSOiB7XG4gICAgICAgIGNvbnN0IHsgdmFsdWUsIHRhZyB9ID0gY29uc3RydWN0U2NhbGFyKHN0YXRlLCBldmVudClcbiAgICAgICAgc3RvcmVBbmNob3Ioc3RhdGUsIGV2ZW50LCB2YWx1ZSwgdGFnLCB0cnVlKVxuICAgICAgICBhZGRWYWx1ZShzdGF0ZSwgdmFsdWUsIHRhZylcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgY2FzZSBFVkVOVF9TRVFVRU5DRToge1xuICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gY29sbGVjdGlvblRhZyhcbiAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgICBldmVudCxcbiAgICAgICAgICBzdGF0ZS5zY2hlbWEuZXhhY3Quc2VxdWVuY2UsXG4gICAgICAgICAgc3RhdGUuc2NoZW1hLnByZWZpeC5zZXF1ZW5jZSxcbiAgICAgICAgICAndGFnOnlhbWwub3JnLDIwMDI6c2VxJyxcbiAgICAgICAgICAnc2VxdWVuY2UnXG4gICAgICAgIClcbiAgICAgICAgY29uc3QgdmFsdWUgPSBkZWZpbml0aW9uLnRhZy5jcmVhdGUoZGVmaW5pdGlvbi50YWdOYW1lKVxuICAgICAgICBjb25zdCBhbmNob3IgPSBzdG9yZUFuY2hvcihzdGF0ZSwgZXZlbnQsIHZhbHVlLCBkZWZpbml0aW9uLnRhZywgZGVmaW5pdGlvbi50YWcuY2FycmllcklzUmVzdWx0KVxuXG4gICAgICAgIC8vIGA8PDogWy4uLl1gIOKAlCB0aGUgcGFyZW50IG1hcHBpbmcgaXMgd2FpdGluZyBvbiBhIG1lcmdlIGtleSwgc28gdGhpc1xuICAgICAgICAvLyBzZXF1ZW5jZSBpcyBhIGxpc3Qgb2YgbWVyZ2Ugc291cmNlczogaXRzIGVsZW1lbnRzIG11c3QgYmUgbWFwcGluZ3MuXG4gICAgICAgIC8vIEl0IGlzIHN0aWxsIGJ1aWx0IGFuZCBkZWxpdmVyZWQgYXMgYSBub3JtYWwgdmFsdWU7IHRoZSB0YXJnZXQgZm9sZHMgaXQuXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHN0YXRlLmZyYW1lc1tzdGF0ZS5mcmFtZXMubGVuZ3RoIC0gMV1cbiAgICAgICAgY29uc3QgbWVyZ2UgPSBwYXJlbnQgIT09IHVuZGVmaW5lZCAmJiBwYXJlbnQua2luZCA9PT0gJ21hcHBpbmcnICYmXG4gICAgICAgICAgcGFyZW50Lmhhc0tleSAmJiBwYXJlbnQua2V5ID09PSBNRVJHRV9LRVlcblxuICAgICAgICBzdGF0ZS5mcmFtZXMucHVzaCh7XG4gICAgICAgICAga2luZDogJ3NlcXVlbmNlJywgcG9zaXRpb246IHN0YXRlLnBvc2l0aW9uLCB2YWx1ZSwgdGFnOiBkZWZpbml0aW9uLnRhZywgYW5jaG9yLCBpbmRleDogMCwgbWVyZ2VcbiAgICAgICAgfSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgY2FzZSBFVkVOVF9NQVBQSU5HOiB7XG4gICAgICAgIGNvbnN0IGRlZmluaXRpb24gPSBjb2xsZWN0aW9uVGFnKFxuICAgICAgICAgIHN0YXRlLFxuICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgIHN0YXRlLnNjaGVtYS5leGFjdC5tYXBwaW5nLFxuICAgICAgICAgIHN0YXRlLnNjaGVtYS5wcmVmaXgubWFwcGluZyxcbiAgICAgICAgICAndGFnOnlhbWwub3JnLDIwMDI6bWFwJyxcbiAgICAgICAgICAnbWFwcGluZydcbiAgICAgICAgKVxuICAgICAgICBjb25zdCB2YWx1ZSA9IGRlZmluaXRpb24udGFnLmNyZWF0ZShkZWZpbml0aW9uLnRhZ05hbWUpXG4gICAgICAgIGNvbnN0IGFuY2hvciA9IHN0b3JlQW5jaG9yKHN0YXRlLCBldmVudCwgdmFsdWUsIGRlZmluaXRpb24udGFnLCBkZWZpbml0aW9uLnRhZy5jYXJyaWVySXNSZXN1bHQpXG4gICAgICAgIHN0YXRlLmZyYW1lcy5wdXNoKHtcbiAgICAgICAgICBraW5kOiAnbWFwcGluZycsXG4gICAgICAgICAgcG9zaXRpb246IHN0YXRlLnBvc2l0aW9uLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIHRhZzogZGVmaW5pdGlvbi50YWcsXG4gICAgICAgICAgYW5jaG9yLFxuICAgICAgICAgIGtleTogdW5kZWZpbmVkLFxuICAgICAgICAgIGtleVBvc2l0aW9uOiBzdGF0ZS5wb3NpdGlvbixcbiAgICAgICAgICBoYXNLZXk6IGZhbHNlLFxuICAgICAgICAgIG92ZXJyaWRhYmxlOiBudWxsXG4gICAgICAgIH0pXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGNhc2UgRVZFTlRfQUxJQVM6IHtcbiAgICAgICAgaWYgKHN0YXRlLm1heEFsaWFzZXMgIT09IC0xICYmICsrc3RhdGUuYWxpYXNDb3VudCA+IHN0YXRlLm1heEFsaWFzZXMpIHtcbiAgICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCBgYWxpYXNlcyBleGNlZWRlZCBtYXhBbGlhc2VzICgke3N0YXRlLm1heEFsaWFzZXN9KWApXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuYW1lID0gc3RhdGUuc291cmNlLnNsaWNlKGV2ZW50LmFuY2hvclN0YXJ0LCBldmVudC5hbmNob3JFbmQpXG4gICAgICAgIGNvbnN0IGFuY2hvciA9IHN0YXRlLmFuY2hvcnMuZ2V0KG5hbWUpXG4gICAgICAgIGlmICghYW5jaG9yKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgYHVuaWRlbnRpZmllZCBhbGlhcyBcIiR7bmFtZX1cImApXG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhbmNob3IuaXNWYWx1ZUZpbmFsKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgYHJlY3Vyc2l2ZSBhbGlhcyBcIiR7bmFtZX1cIiBpcyBub3Qgc3VwcG9ydGVkIGZvciB0YWcgJHthbmNob3IudGFnLnRhZ05hbWV9IGJlY2F1c2UgaXQgdXNlcyBmaW5hbGl6ZSgpYClcbiAgICAgICAgfVxuICAgICAgICBhZGRWYWx1ZShzdGF0ZSwgYW5jaG9yLnZhbHVlLCBhbmNob3IudGFnKVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjYXNlIEVWRU5UX1BPUDoge1xuICAgICAgICBjb25zdCBmcmFtZSA9IHN0YXRlLmZyYW1lcy5wb3AoKSFcblxuICAgICAgICBpZiAoZnJhbWUua2luZCA9PT0gJ2RvY3VtZW50Jykge1xuICAgICAgICAgIHN0YXRlLmRvY3VtZW50cy5wdXNoKGZyYW1lLnZhbHVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gZnJhbWUudGFnLmNhcnJpZXJJc1Jlc3VsdFxuICAgICAgICAgICAgPyBmcmFtZS52YWx1ZVxuICAgICAgICAgICAgOiBmaW5hbGl6ZUNvbGxlY3Rpb24oc3RhdGUsIGZyYW1lLnBvc2l0aW9uLCBmcmFtZS50YWcsIGZyYW1lLnZhbHVlKVxuICAgICAgICAgIGlmIChmcmFtZS5hbmNob3IpIHtcbiAgICAgICAgICAgIGZyYW1lLmFuY2hvci52YWx1ZSA9IHZhbHVlXG4gICAgICAgICAgICBmcmFtZS5hbmNob3IuaXNWYWx1ZUZpbmFsID0gdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgICBhZGRWYWx1ZShzdGF0ZSwgdmFsdWUsIGZyYW1lLnRhZylcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdGF0ZS5kb2N1bWVudHNcbn1cblxuZXhwb3J0IHtcbiAgY29uc3RydWN0RnJvbUV2ZW50cyxcbiAgREVGQVVMVF9DT05TVFJVQ1RPUl9PUFRJT05TLFxuICB0eXBlIENvbnN0cnVjdG9yT3B0aW9uc1xufVxuIiwgImltcG9ydCB7XG4gIEVWRU5UX0RPQ1VNRU5ULFxuICBFVkVOVF9TRVFVRU5DRSxcbiAgRVZFTlRfTUFQUElORyxcbiAgRVZFTlRfU0NBTEFSLFxuICBFVkVOVF9BTElBUyxcbiAgRVZFTlRfUE9QLFxuICBTQ0FMQVJfU1RZTEVfUExBSU4sXG4gIFNDQUxBUl9TVFlMRV9TSU5HTEVfUVVPVEVELFxuICBTQ0FMQVJfU1RZTEVfRE9VQkxFX1FVT1RFRCxcbiAgU0NBTEFSX1NUWUxFX0xJVEVSQUxfQkxPQ0ssXG4gIFNDQUxBUl9TVFlMRV9GT0xERURfQkxPQ0ssXG4gIENPTExFQ1RJT05fU1RZTEVfQkxPQ0ssXG4gIENPTExFQ1RJT05fU1RZTEVfRkxPVyxcbiAgQ0hPTVBJTkdfQ0xJUCxcbiAgQ0hPTVBJTkdfU1RSSVAsXG4gIENIT01QSU5HX0tFRVAsXG4gIHR5cGUgRXZlbnQsXG4gIHR5cGUgU2NhbGFyU3R5bGUsXG4gIHR5cGUgQ29sbGVjdGlvblN0eWxlLFxuICB0eXBlIENob21waW5nLFxuICB0eXBlIERvY3VtZW50RGlyZWN0aXZlLFxuICB0eXBlIFRhZ0hhbmRsZXJzXG59IGZyb20gJy4vZXZlbnRzLnRzJ1xuaW1wb3J0IHsgdGhyb3dFcnJvckF0IH0gZnJvbSAnLi4vY29tbW9uL2V4Y2VwdGlvbi50cydcblxuY29uc3QgTk9fUkFOR0UgPSAtMVxuY29uc3QgSEFTX09XTiA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHlcblxuY29uc3QgQ09OVEVYVF9GTE9XX0lOID0gMVxuY29uc3QgQ09OVEVYVF9GTE9XX09VVCA9IDJcbmNvbnN0IENPTlRFWFRfQkxPQ0tfSU4gPSAzXG5jb25zdCBDT05URVhUX0JMT0NLX09VVCA9IDRcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnRyb2wtcmVnZXhcbmNvbnN0IFBBVFRFUk5fTk9OX1BSSU5UQUJMRSA9IC9bXFx4MDAtXFx4MDhcXHgwQlxceDBDXFx4MEUtXFx4MUZcXHg3Ri1cXHg4NFxceDg2LVxceDlGXFx1RkZGRVxcdUZGRkZdfFtcXHVEODAwLVxcdURCRkZdKD8hW1xcdURDMDAtXFx1REZGRl0pfCg/OlteXFx1RDgwMC1cXHVEQkZGXXxeKVtcXHVEQzAwLVxcdURGRkZdL1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZWxlc3MtZXNjYXBlXG5jb25zdCBQQVRURVJOX0ZMT1dfSU5ESUNBVE9SUyA9IC9bLFxcW1xcXXt9XS9cbi8vIFlBTUwgMS4yLjIsIFs5MV0gYy10YWctaGFuZGxlLlxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZWxlc3MtZXNjYXBlXG5jb25zdCBQQVRURVJOX1RBR19IQU5ETEUgPSAvXig/OiF8ISF8IVswLTlBLVphLXotXSshKSQvXG4vLyBZQU1MIDEuMi4yLCBbMzldIG5zLXVyaS1jaGFyLlxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZWxlc3MtZXNjYXBlXG5jb25zdCBOU19VUklfQ0hBUiA9IFN0cmluZy5yYXdgKD86JVswLTlBLUZhLWZdezJ9fFswLTlBLVphLXpcXC0jOy8/OkAmPSskLF8uIX4qJygpXFxbXFxdXSlgXG4vLyBZQU1MIDEuMi4yLCBbNDBdIG5zLXRhZy1jaGFyID0gbnMtdXJpLWNoYXIgLSBcIiFcIiAtIGMtZmxvdy1pbmRpY2F0b3IuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlbGVzcy1lc2NhcGVcbmNvbnN0IE5TX1RBR19DSEFSID0gU3RyaW5nLnJhd2AoPzolWzAtOUEtRmEtZl17Mn18WzAtOUEtWmEtelxcLSM7Lz86QCY9KyQufionKClfXSlgXG5jb25zdCBQQVRURVJOX1RBR19VUkkgPSBuZXcgUmVnRXhwKGBeKD86JHtOU19VUklfQ0hBUn0pKiRgKVxuLy8gWUFNTCAxLjIuMiwgWzk5XSBjLW5zLXNob3J0aGFuZC10YWcgc3VmZml4IHBhcnQuXG5jb25zdCBQQVRURVJOX1RBR19TVUZGSVggPSBuZXcgUmVnRXhwKGBeKD86JHtOU19UQUdfQ0hBUn0pKyRgKVxuLy8gWUFNTCAxLjIuMiwgWzkzXSBucy10YWctcHJlZml4LlxuY29uc3QgUEFUVEVSTl9UQUdfUFJFRklYID0gbmV3IFJlZ0V4cChgXig/OiEoPzoke05TX1VSSV9DSEFSfSkqfCR7TlNfVEFHX0NIQVJ9KD86JHtOU19VUklfQ0hBUn0pKikkYClcblxudHlwZSBOb2RlQ29udGV4dCA9XG4gIHR5cGVvZiBDT05URVhUX0ZMT1dfSU4gfCB0eXBlb2YgQ09OVEVYVF9GTE9XX09VVCB8XG4gIHR5cGVvZiBDT05URVhUX0JMT0NLX0lOIHwgdHlwZW9mIENPTlRFWFRfQkxPQ0tfT1VUXG5cbmludGVyZmFjZSBOb2RlUHJvcGVydGllcyB7XG4gIGFuY2hvclN0YXJ0OiBudW1iZXJcbiAgYW5jaG9yRW5kOiBudW1iZXJcbiAgdGFnU3RhcnQ6IG51bWJlclxuICB0YWdFbmQ6IG51bWJlclxufVxuXG5pbnRlcmZhY2UgUGFyc2VyU25hcHNob3Qge1xuICBwb3NpdGlvbjogbnVtYmVyXG4gIGxpbmU6IG51bWJlclxuICBsaW5lU3RhcnQ6IG51bWJlclxuICBsaW5lSW5kZW50OiBudW1iZXJcbiAgZmlyc3RUYWJJbkxpbmU6IG51bWJlclxuICBldmVudHNMZW5ndGg6IG51bWJlclxufVxuXG5pbnRlcmZhY2UgUGFyc2VyT3B0aW9ucyB7XG4gIGZpbGVuYW1lPzogc3RyaW5nXG4gIG1heERlcHRoPzogbnVtYmVyXG59XG5cbmNvbnN0IERFRkFVTFRfUEFSU0VSX09QVElPTlM6IFJlcXVpcmVkPFBhcnNlck9wdGlvbnM+ID0ge1xuICBmaWxlbmFtZTogJycsXG4gIG1heERlcHRoOiAxMDBcbn1cblxuaW50ZXJmYWNlIFBhcnNlclN0YXRlIGV4dGVuZHMgUmVxdWlyZWQ8UGFyc2VyT3B0aW9ucz4ge1xuICBpbnB1dDogc3RyaW5nXG4gIGxlbmd0aDogbnVtYmVyXG4gIHBvc2l0aW9uOiBudW1iZXJcbiAgbGluZTogbnVtYmVyXG4gIGxpbmVTdGFydDogbnVtYmVyXG4gIGxpbmVJbmRlbnQ6IG51bWJlclxuICBmaXJzdFRhYkluTGluZTogbnVtYmVyXG4gIGRlcHRoOiBudW1iZXJcbiAgZGlyZWN0aXZlczogRG9jdW1lbnREaXJlY3RpdmVbXVxuICB0YWdIYW5kbGVyczogVGFnSGFuZGxlcnNcbiAgZXZlbnRzOiBFdmVudFtdXG59XG5cbmZ1bmN0aW9uIGFkZERvY3VtZW50RXZlbnQgKFxuICBzdGF0ZTogUGFyc2VyU3RhdGUsXG4gIGV4cGxpY2l0U3RhcnQ6IGJvb2xlYW4sXG4gIGV4cGxpY2l0RW5kOiBib29sZWFuXG4pIHtcbiAgc3RhdGUuZXZlbnRzLnB1c2goe1xuICAgIHR5cGU6IEVWRU5UX0RPQ1VNRU5ULFxuICAgIGV4cGxpY2l0U3RhcnQsXG4gICAgZXhwbGljaXRFbmQsXG4gICAgZGlyZWN0aXZlczogc3RhdGUuZGlyZWN0aXZlc1xuICB9KVxufVxuXG5mdW5jdGlvbiBhZGRTZXF1ZW5jZUV2ZW50IChcbiAgc3RhdGU6IFBhcnNlclN0YXRlLFxuICBzdGFydDogbnVtYmVyLFxuICBhbmNob3JTdGFydDogbnVtYmVyLFxuICBhbmNob3JFbmQ6IG51bWJlcixcbiAgdGFnU3RhcnQ6IG51bWJlcixcbiAgdGFnRW5kOiBudW1iZXIsXG4gIHN0eWxlOiBDb2xsZWN0aW9uU3R5bGVcbikge1xuICBzdGF0ZS5ldmVudHMucHVzaCh7XG4gICAgdHlwZTogRVZFTlRfU0VRVUVOQ0UsXG4gICAgc3RhcnQsXG4gICAgYW5jaG9yU3RhcnQsXG4gICAgYW5jaG9yRW5kLFxuICAgIHRhZ1N0YXJ0LFxuICAgIHRhZ0VuZCxcbiAgICBzdHlsZVxuICB9KVxufVxuXG5mdW5jdGlvbiBhZGRNYXBwaW5nRXZlbnQgKFxuICBzdGF0ZTogUGFyc2VyU3RhdGUsXG4gIHN0YXJ0OiBudW1iZXIsXG4gIGFuY2hvclN0YXJ0OiBudW1iZXIsXG4gIGFuY2hvckVuZDogbnVtYmVyLFxuICB0YWdTdGFydDogbnVtYmVyLFxuICB0YWdFbmQ6IG51bWJlcixcbiAgc3R5bGU6IENvbGxlY3Rpb25TdHlsZVxuKSB7XG4gIHN0YXRlLmV2ZW50cy5wdXNoKHtcbiAgICB0eXBlOiBFVkVOVF9NQVBQSU5HLFxuICAgIHN0YXJ0LFxuICAgIGFuY2hvclN0YXJ0LFxuICAgIGFuY2hvckVuZCxcbiAgICB0YWdTdGFydCxcbiAgICB0YWdFbmQsXG4gICAgc3R5bGVcbiAgfSlcbn1cblxuZnVuY3Rpb24gYWRkU2NhbGFyRXZlbnQgKFxuICBzdGF0ZTogUGFyc2VyU3RhdGUsXG4gIHZhbHVlU3RhcnQ6IG51bWJlcixcbiAgdmFsdWVFbmQ6IG51bWJlcixcbiAgYW5jaG9yU3RhcnQ6IG51bWJlcixcbiAgYW5jaG9yRW5kOiBudW1iZXIsXG4gIHRhZ1N0YXJ0OiBudW1iZXIsXG4gIHRhZ0VuZDogbnVtYmVyLFxuICBzdHlsZTogU2NhbGFyU3R5bGUsXG4gIGNob21waW5nOiBDaG9tcGluZyA9IENIT01QSU5HX0NMSVAsXG4gIGluZGVudCA9IC0xLFxuICBmYXN0ID0gZmFsc2Vcbikge1xuICBzdGF0ZS5ldmVudHMucHVzaCh7XG4gICAgdHlwZTogRVZFTlRfU0NBTEFSLFxuICAgIHZhbHVlU3RhcnQsXG4gICAgdmFsdWVFbmQsXG4gICAgYW5jaG9yU3RhcnQsXG4gICAgYW5jaG9yRW5kLFxuICAgIHRhZ1N0YXJ0LFxuICAgIHRhZ0VuZCxcbiAgICBzdHlsZSxcbiAgICBjaG9tcGluZyxcbiAgICBpbmRlbnQsXG4gICAgZmFzdFxuICB9KVxufVxuXG5mdW5jdGlvbiBhZGRBbGlhc0V2ZW50IChcbiAgc3RhdGU6IFBhcnNlclN0YXRlLFxuICBhbmNob3JTdGFydDogbnVtYmVyLFxuICBhbmNob3JFbmQ6IG51bWJlclxuKSB7XG4gIHN0YXRlLmV2ZW50cy5wdXNoKHtcbiAgICB0eXBlOiBFVkVOVF9BTElBUyxcbiAgICBhbmNob3JTdGFydCxcbiAgICBhbmNob3JFbmRcbiAgfSlcbn1cblxuZnVuY3Rpb24gYWRkUG9wRXZlbnQgKHN0YXRlOiBQYXJzZXJTdGF0ZSkge1xuICBzdGF0ZS5ldmVudHMucHVzaCh7IHR5cGU6IEVWRU5UX1BPUCB9KVxufVxuXG5mdW5jdGlvbiBhZGRFbXB0eVNjYWxhckV2ZW50IChzdGF0ZTogUGFyc2VyU3RhdGUpIHtcbiAgYWRkU2NhbGFyRXZlbnQoXG4gICAgc3RhdGUsXG4gICAgTk9fUkFOR0UsXG4gICAgTk9fUkFOR0UsXG4gICAgTk9fUkFOR0UsXG4gICAgTk9fUkFOR0UsXG4gICAgTk9fUkFOR0UsXG4gICAgTk9fUkFOR0UsXG4gICAgU0NBTEFSX1NUWUxFX1BMQUlOXG4gIClcbn1cblxuZnVuY3Rpb24gZW1wdHlQcm9wZXJ0aWVzICgpOiBOb2RlUHJvcGVydGllcyB7XG4gIHJldHVybiB7XG4gICAgYW5jaG9yU3RhcnQ6IE5PX1JBTkdFLFxuICAgIGFuY2hvckVuZDogTk9fUkFOR0UsXG4gICAgdGFnU3RhcnQ6IE5PX1JBTkdFLFxuICAgIHRhZ0VuZDogTk9fUkFOR0VcbiAgfVxufVxuXG5mdW5jdGlvbiBzbmFwc2hvdFN0YXRlIChzdGF0ZTogUGFyc2VyU3RhdGUpOiBQYXJzZXJTbmFwc2hvdCB7XG4gIHJldHVybiB7XG4gICAgcG9zaXRpb246IHN0YXRlLnBvc2l0aW9uLFxuICAgIGxpbmU6IHN0YXRlLmxpbmUsXG4gICAgbGluZVN0YXJ0OiBzdGF0ZS5saW5lU3RhcnQsXG4gICAgbGluZUluZGVudDogc3RhdGUubGluZUluZGVudCxcbiAgICBmaXJzdFRhYkluTGluZTogc3RhdGUuZmlyc3RUYWJJbkxpbmUsXG4gICAgZXZlbnRzTGVuZ3RoOiBzdGF0ZS5ldmVudHMubGVuZ3RoXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzdG9yZVN0YXRlIChzdGF0ZTogUGFyc2VyU3RhdGUsIHNuYXBzaG90OiBQYXJzZXJTbmFwc2hvdCkge1xuICBzdGF0ZS5wb3NpdGlvbiA9IHNuYXBzaG90LnBvc2l0aW9uXG4gIHN0YXRlLmxpbmUgPSBzbmFwc2hvdC5saW5lXG4gIHN0YXRlLmxpbmVTdGFydCA9IHNuYXBzaG90LmxpbmVTdGFydFxuICBzdGF0ZS5saW5lSW5kZW50ID0gc25hcHNob3QubGluZUluZGVudFxuICBzdGF0ZS5maXJzdFRhYkluTGluZSA9IHNuYXBzaG90LmZpcnN0VGFiSW5MaW5lXG4gIHN0YXRlLmV2ZW50cy5sZW5ndGggPSBzbmFwc2hvdC5ldmVudHNMZW5ndGhcbn1cblxuZnVuY3Rpb24gdGhyb3dFcnJvciAoc3RhdGU6IFBhcnNlclN0YXRlLCBtZXNzYWdlOiBzdHJpbmcpOiBuZXZlciB7XG4gIHRocm93RXJyb3JBdChzdGF0ZS5pbnB1dC5zbGljZSgwLCBzdGF0ZS5sZW5ndGgpLCBzdGF0ZS5wb3NpdGlvbiwgbWVzc2FnZSwgc3RhdGUuZmlsZW5hbWUpXG59XG5cbmZ1bmN0aW9uIGlzRW9sIChjOiBudW1iZXIpIHtcbiAgcmV0dXJuIGMgPT09IDB4MEEvKiBMRiAqLyB8fCBjID09PSAweDBELyogQ1IgKi9cbn1cblxuZnVuY3Rpb24gaXNXaGl0ZVNwYWNlIChjOiBudW1iZXIpIHtcbiAgcmV0dXJuIGMgPT09IDB4MDkvKiBUYWIgKi8gfHwgYyA9PT0gMHgyMC8qIFNwYWNlICovXG59XG5cbmZ1bmN0aW9uIGlzV3NPckVvbCAoYzogbnVtYmVyKSB7XG4gIHJldHVybiBpc1doaXRlU3BhY2UoYykgfHwgaXNFb2woYylcbn1cblxuZnVuY3Rpb24gaXNXc09yRW9sT3JFbmQgKGM6IG51bWJlcikge1xuICByZXR1cm4gYyA9PT0gMCB8fCBpc1dzT3JFb2woYylcbn1cblxuZnVuY3Rpb24gaXNGbG93SW5kaWNhdG9yIChjOiBudW1iZXIpIHtcbiAgcmV0dXJuIGMgPT09IDB4MkMvKiAsICovIHx8XG4gICAgICAgICBjID09PSAweDVCLyogWyAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg1RC8qIF0gKi8gfHxcbiAgICAgICAgIGMgPT09IDB4N0IvKiB7ICovIHx8XG4gICAgICAgICBjID09PSAweDdELyogfSAqL1xufVxuXG5mdW5jdGlvbiBmcm9tRGVjaW1hbENvZGUgKGM6IG51bWJlcikge1xuICByZXR1cm4gYyA+PSAweDMwLyogMCAqLyAmJiBjIDw9IDB4MzkvKiA5ICovID8gYyAtIDB4MzAgOiAtMVxufVxuXG5mdW5jdGlvbiBmcm9tSGV4Q29kZSAoYzogbnVtYmVyKSB7XG4gIGlmIChjID49IDB4MzAvKiAwICovICYmIGMgPD0gMHgzOS8qIDkgKi8pIHJldHVybiBjIC0gMHgzMFxuICBjb25zdCBsYyA9IGMgfCAweDIwXG4gIGlmIChsYyA+PSAweDYxLyogYSAqLyAmJiBsYyA8PSAweDY2LyogZiAqLykgcmV0dXJuIGxjIC0gMHg2MSArIDEwXG4gIHJldHVybiAtMVxufVxuXG5mdW5jdGlvbiBlc2NhcGVkSGV4TGVuIChjOiBudW1iZXIpIHtcbiAgaWYgKGMgPT09IDB4NzgvKiB4ICovKSByZXR1cm4gMlxuICBpZiAoYyA9PT0gMHg3NS8qIHUgKi8pIHJldHVybiA0XG4gIGlmIChjID09PSAweDU1LyogVSAqLykgcmV0dXJuIDhcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gaXNTaW1wbGVFc2NhcGUgKGM6IG51bWJlcikge1xuICByZXR1cm4gYyA9PT0gMHgzMC8qIDAgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NjEvKiBhICovIHx8XG4gICAgICAgICBjID09PSAweDYyLyogYiAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg3NC8qIHQgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4MDkvKiBUYWIgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NkUvKiBuICovIHx8XG4gICAgICAgICBjID09PSAweDc2LyogdiAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg2Ni8qIGYgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NzIvKiByICovIHx8XG4gICAgICAgICBjID09PSAweDY1LyogZSAqLyB8fFxuICAgICAgICAgYyA9PT0gMHgyMC8qIFNwYWNlICovIHx8XG4gICAgICAgICBjID09PSAweDIyLyogXCIgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4MkYvKiAvICovIHx8XG4gICAgICAgICBjID09PSAweDVDLyogXFwgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NEUvKiBOICovIHx8XG4gICAgICAgICBjID09PSAweDVGLyogXyAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg0Qy8qIEwgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NTAvKiBQICovXG59XG5cbi8vIFByZWNvbmRpdGlvbjogc3RhdGUucG9zaXRpb24gcG9pbnRzIGF0IExGIG9yIENSLlxuZnVuY3Rpb24gY29uc3VtZUxpbmVCcmVhayAoc3RhdGU6IFBhcnNlclN0YXRlKSB7XG4gIGNvbnN0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICBpZiAoY2ggPT09IDB4MEEvKiBMRiAqLykge1xuICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgfSBlbHNlIHtcbiAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAweDBBLyogTEYgKi8pIHN0YXRlLnBvc2l0aW9uKytcbiAgfVxuXG4gIHN0YXRlLmxpbmUrK1xuICBzdGF0ZS5saW5lU3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICBzdGF0ZS5saW5lSW5kZW50ID0gMFxuICBzdGF0ZS5maXJzdFRhYkluTGluZSA9IC0xXG59XG5cbmZ1bmN0aW9uIHNraXBTZXBhcmF0aW9uU3BhY2UgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgYWxsb3dDb21tZW50czogYm9vbGVhbikge1xuICBsZXQgbGluZUJyZWFrcyA9IDBcbiAgbGV0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcbiAgbGV0IGhhc1NlcGFyYXRpb24gPSBzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0IHx8XG4gICAgaXNXc09yRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gLSAxKSlcblxuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICB3aGlsZSAoaXNXaGl0ZVNwYWNlKGNoKSkge1xuICAgICAgaGFzU2VwYXJhdGlvbiA9IHRydWVcbiAgICAgIGlmIChjaCA9PT0gMHgwOS8qIFRhYiAqLyAmJiBzdGF0ZS5maXJzdFRhYkluTGluZSA9PT0gLTEpIHtcbiAgICAgICAgc3RhdGUuZmlyc3RUYWJJbkxpbmUgPSBzdGF0ZS5wb3NpdGlvblxuICAgICAgfVxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgfVxuXG4gICAgaWYgKGFsbG93Q29tbWVudHMgJiYgaGFzU2VwYXJhdGlvbiAmJiBjaCA9PT0gMHgyMy8qICMgKi8pIHtcbiAgICAgIGRvIHsgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pIH1cbiAgICAgIHdoaWxlICghaXNFb2woY2gpICYmIGNoICE9PSAwKVxuICAgIH1cblxuICAgIGlmICghaXNFb2woY2gpKSBicmVha1xuXG4gICAgY29uc3VtZUxpbmVCcmVhayhzdGF0ZSlcbiAgICBsaW5lQnJlYWtzKytcbiAgICBoYXNTZXBhcmF0aW9uID0gdHJ1ZVxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIHdoaWxlIChjaCA9PT0gMHgyMC8qIFNwYWNlICovKSB7XG4gICAgICBzdGF0ZS5saW5lSW5kZW50KytcbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBsaW5lQnJlYWtzXG59XG5cbmZ1bmN0aW9uIHRlc3REb2N1bWVudFNlcGFyYXRvciAoc3RhdGU6IFBhcnNlclN0YXRlLCBwb3NpdGlvbiA9IHN0YXRlLnBvc2l0aW9uKSB7XG4gIGNvbnN0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbilcblxuICBpZiAoKGNoID09PSAweDJELyogLSAqLyB8fCBjaCA9PT0gMHgyRS8qIC4gKi8pICYmXG4gICAgICBjaCA9PT0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbiArIDEpICYmXG4gICAgICBjaCA9PT0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbiArIDIpKSB7XG4gICAgY29uc3QgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbiArIDMpXG4gICAgcmV0dXJuIGZvbGxvd2luZyA9PT0gMCB8fCBpc1dzT3JFb2woZm9sbG93aW5nKVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIHNraXBVbnRpbExpbmVFbmQgKHN0YXRlOiBQYXJzZXJTdGF0ZSkge1xuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gIHdoaWxlIChjaCAhPT0gMCAmJiAhaXNFb2woY2gpKSB7XG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tQcmludGFibGUgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcbiAgaWYgKFBBVFRFUk5fTk9OX1BSSU5UQUJMRS50ZXN0KHN0YXRlLmlucHV0LnNsaWNlKHN0YXJ0LCBlbmQpKSkge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICd0aGUgc3RyZWFtIGNvbnRhaW5zIG5vbi1wcmludGFibGUgY2hhcmFjdGVycycpXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVhZFRhZ1Byb3BlcnR5IChzdGF0ZTogUGFyc2VyU3RhdGUsIHByb3BzOiBOb2RlUHJvcGVydGllcywgaW5GbG93OiBib29sZWFuKSB7XG4gIGlmIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMHgyMS8qICEgKi8pIHJldHVybiBmYWxzZVxuICBpZiAocHJvcHMudGFnU3RhcnQgIT09IE5PX1JBTkdFKSB0aHJvd0Vycm9yKHN0YXRlLCAnZHVwbGljYXRpb24gb2YgYSB0YWcgcHJvcGVydHknKVxuXG4gIGNvbnN0IHN0YXJ0ID0gc3RhdGUucG9zaXRpb25cbiAgbGV0IGlzVmVyYmF0aW0gPSBmYWxzZVxuICBsZXQgaXNOYW1lZCA9IGZhbHNlXG4gIGxldCB0YWdIYW5kbGUgPSAnISdcbiAgbGV0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuXG4gIGlmIChjaCA9PT0gMHgzQy8qIDwgKi8pIHtcbiAgICBpc1ZlcmJhdGltID0gdHJ1ZVxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICB9IGVsc2UgaWYgKGNoID09PSAweDIxLyogISAqLykge1xuICAgIGlzTmFtZWQgPSB0cnVlXG4gICAgdGFnSGFuZGxlID0gJyEhJ1xuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICB9XG5cbiAgbGV0IHN1ZmZpeFN0YXJ0ID0gc3RhdGUucG9zaXRpb25cbiAgbGV0IHRhZ05hbWVcblxuICBpZiAoaXNWZXJiYXRpbSkge1xuICAgIHdoaWxlIChjaCAhPT0gMCAmJiBjaCAhPT0gMHgzRS8qID4gKi8pIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICAgIGlmIChjaCAhPT0gMHgzRS8qID4gKi8pIHRocm93RXJyb3Ioc3RhdGUsICd1bmV4cGVjdGVkIGVuZCBvZiB0aGUgc3RyZWFtIHdpdGhpbiBhIHZlcmJhdGltIHRhZycpXG4gICAgdGFnTmFtZSA9IHN0YXRlLmlucHV0LnNsaWNlKHN1ZmZpeFN0YXJ0LCBzdGF0ZS5wb3NpdGlvbilcbiAgICBzdGF0ZS5wb3NpdGlvbisrXG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKGNoICE9PSAwICYmICFpc1dzT3JFb2woY2gpICYmICEoaW5GbG93ICYmIGlzRmxvd0luZGljYXRvcihjaCkpKSB7XG4gICAgICBpZiAoY2ggPT09IDB4MjEvKiAhICovKSB7XG4gICAgICAgIGlmICghaXNOYW1lZCkge1xuICAgICAgICAgIHRhZ0hhbmRsZSA9IHN0YXRlLmlucHV0LnNsaWNlKHN1ZmZpeFN0YXJ0IC0gMSwgc3RhdGUucG9zaXRpb24gKyAxKVxuICAgICAgICAgIGlmICghUEFUVEVSTl9UQUdfSEFORExFLnRlc3QodGFnSGFuZGxlKSkgdGhyb3dFcnJvcihzdGF0ZSwgJ25hbWVkIHRhZyBoYW5kbGUgY2Fubm90IGNvbnRhaW4gc3VjaCBjaGFyYWN0ZXJzJylcbiAgICAgICAgICBpc05hbWVkID0gdHJ1ZVxuICAgICAgICAgIHN1ZmZpeFN0YXJ0ID0gc3RhdGUucG9zaXRpb24gKyAxXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RhZyBzdWZmaXggY2Fubm90IGNvbnRhaW4gZXhjbGFtYXRpb24gbWFya3MnKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICAgIH1cblxuICAgIHRhZ05hbWUgPSBzdGF0ZS5pbnB1dC5zbGljZShzdWZmaXhTdGFydCwgc3RhdGUucG9zaXRpb24pXG4gICAgaWYgKFBBVFRFUk5fRkxPV19JTkRJQ0FUT1JTLnRlc3QodGFnTmFtZSkpIHRocm93RXJyb3Ioc3RhdGUsICd0YWcgc3VmZml4IGNhbm5vdCBjb250YWluIGZsb3cgaW5kaWNhdG9yIGNoYXJhY3RlcnMnKVxuICB9XG5cbiAgaWYgKHRhZ05hbWUgJiYgIShpc1ZlcmJhdGltID8gUEFUVEVSTl9UQUdfVVJJLnRlc3QodGFnTmFtZSkgOiBQQVRURVJOX1RBR19TVUZGSVgudGVzdCh0YWdOYW1lKSkpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCBgdGFnIG5hbWUgY2Fubm90IGNvbnRhaW4gc3VjaCBjaGFyYWN0ZXJzOiAke3RhZ05hbWV9YClcbiAgfVxuICB0cnkge1xuICAgIGRlY29kZVVSSUNvbXBvbmVudCh0YWdOYW1lKVxuICB9IGNhdGNoIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCBgdGFnIG5hbWUgaXMgbWFsZm9ybWVkOiAke3RhZ05hbWV9YClcbiAgfVxuXG4gIGlmICghaXNWZXJiYXRpbSAmJiB0YWdIYW5kbGUgIT09ICchJyAmJiB0YWdIYW5kbGUgIT09ICchIScgJiYgIUhBU19PV04uY2FsbChzdGF0ZS50YWdIYW5kbGVycywgdGFnSGFuZGxlKSkge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsIGB1bmRlY2xhcmVkIHRhZyBoYW5kbGUgXCIke3RhZ0hhbmRsZX1cImApXG4gIH1cblxuICBwcm9wcy50YWdTdGFydCA9IHN0YXJ0XG4gIHByb3BzLnRhZ0VuZCA9IHN0YXRlLnBvc2l0aW9uXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHJlYWRBbmNob3JQcm9wZXJ0eSAoc3RhdGU6IFBhcnNlclN0YXRlLCBwcm9wczogTm9kZVByb3BlcnRpZXMpIHtcbiAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAweDI2LyogJiAqLykgcmV0dXJuIGZhbHNlXG4gIGlmIChwcm9wcy5hbmNob3JTdGFydCAhPT0gTk9fUkFOR0UpIHRocm93RXJyb3Ioc3RhdGUsICdkdXBsaWNhdGlvbiBvZiBhbiBhbmNob3IgcHJvcGVydHknKVxuXG4gIHN0YXRlLnBvc2l0aW9uKytcbiAgY29uc3Qgc3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCAmJiAhaXNXc09yRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSAmJiAhaXNGbG93SW5kaWNhdG9yKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkge1xuICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgfVxuXG4gIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhcnQpIHRocm93RXJyb3Ioc3RhdGUsICduYW1lIG9mIGFuIGFuY2hvciBub2RlIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgY2hhcmFjdGVyJylcblxuICBwcm9wcy5hbmNob3JTdGFydCA9IHN0YXJ0XG4gIHByb3BzLmFuY2hvckVuZCA9IHN0YXRlLnBvc2l0aW9uXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHJlYWRBbGlhcyAoc3RhdGU6IFBhcnNlclN0YXRlLCBwcm9wczogTm9kZVByb3BlcnRpZXMpIHtcbiAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAweDJBLyogKiAqLykgcmV0dXJuIGZhbHNlXG4gIGlmIChwcm9wcy5hbmNob3JTdGFydCAhPT0gTk9fUkFOR0UgfHwgcHJvcHMudGFnU3RhcnQgIT09IE5PX1JBTkdFKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2FsaWFzIG5vZGUgc2hvdWxkIG5vdCBoYXZlIGFueSBwcm9wZXJ0aWVzJylcbiAgfVxuXG4gIHN0YXRlLnBvc2l0aW9uKytcbiAgY29uc3Qgc3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCAmJiAhaXNXc09yRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSAmJiAhaXNGbG93SW5kaWNhdG9yKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkge1xuICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgfVxuXG4gIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhcnQpIHRocm93RXJyb3Ioc3RhdGUsICduYW1lIG9mIGFuIGFsaWFzIG5vZGUgbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBjaGFyYWN0ZXInKVxuXG4gIGFkZEFsaWFzRXZlbnQoc3RhdGUsIHN0YXJ0LCBzdGF0ZS5wb3NpdGlvbilcbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gcmVhZEZsb3dTY2FsYXJCcmVhayAoc3RhdGU6IFBhcnNlclN0YXRlLCBub2RlSW5kZW50OiBudW1iZXIpIHtcbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgZmFsc2UpXG5cbiAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPCBub2RlSW5kZW50KSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2RlZmljaWVudCBpbmRlbnRhdGlvbicpXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVhZFNpbmdsZVF1b3RlZFNjYWxhciAoc3RhdGU6IFBhcnNlclN0YXRlLCBub2RlSW5kZW50OiBudW1iZXIsIHByb3BzOiBOb2RlUHJvcGVydGllcykge1xuICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgIT09IDB4MjcvKiAnICovKSByZXR1cm4gZmFsc2VcblxuICBzdGF0ZS5wb3NpdGlvbisrXG4gIGNvbnN0IHN0YXJ0ID0gc3RhdGUucG9zaXRpb25cbiAgLy8gQSBzaW5nbGUtcXVvdGVkIHNjYWxhciBpcyBzbGljZWFibGUgdmVyYmF0aW0gd2hlbiBpdCBoYXMgbm8gJycgZXNjYXBlIHBhaXJzXG4gIC8vIGFuZCBubyBmb2xkZWQgbGluZSBicmVha3MgKHNlZSBnZXRTY2FsYXJWYWx1ZSBmYXN0IHBhdGgpLlxuICBsZXQgc2ltcGxlID0gdHJ1ZVxuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCkge1xuICAgIGNvbnN0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIGlmIChjaCA9PT0gMHgyNy8qICcgKi8pIHtcbiAgICAgIGlmIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSkgPT09IDB4MjcvKiAnICovKSB7XG4gICAgICAgIHNpbXBsZSA9IGZhbHNlXG4gICAgICAgIHN0YXRlLnBvc2l0aW9uICs9IDJcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgY29uc3QgZW5kID0gc3RhdGUucG9zaXRpb25cbiAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgIGFkZFNjYWxhckV2ZW50KHN0YXRlLCBzdGFydCwgZW5kLCBwcm9wcy5hbmNob3JTdGFydCwgcHJvcHMuYW5jaG9yRW5kLCBwcm9wcy50YWdTdGFydCwgcHJvcHMudGFnRW5kLCBTQ0FMQVJfU1RZTEVfU0lOR0xFX1FVT1RFRCwgQ0hPTVBJTkdfQ0xJUCwgLTEsIHNpbXBsZSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKGlzRW9sKGNoKSkge1xuICAgICAgc2ltcGxlID0gZmFsc2VcbiAgICAgIHJlYWRGbG93U2NhbGFyQnJlYWsoc3RhdGUsIG5vZGVJbmRlbnQpXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd1bmV4cGVjdGVkIGVuZCBvZiB0aGUgZG9jdW1lbnQgd2l0aGluIGEgc2luZ2xlIHF1b3RlZCBzY2FsYXInKVxuICAgIH0gZWxzZSBpZiAoY2ggIT09IDB4MDkvKiBUYWIgKi8gJiYgY2ggPCAweDIwKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZXhwZWN0ZWQgdmFsaWQgSlNPTiBjaGFyYWN0ZXInKVxuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgfVxuICB9XG5cbiAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuZXhwZWN0ZWQgZW5kIG9mIHRoZSBzdHJlYW0gd2l0aGluIGEgc2luZ2xlIHF1b3RlZCBzY2FsYXInKVxufVxuXG5mdW5jdGlvbiByZWFkRG91YmxlUXVvdGVkU2NhbGFyIChzdGF0ZTogUGFyc2VyU3RhdGUsIG5vZGVJbmRlbnQ6IG51bWJlciwgcHJvcHM6IE5vZGVQcm9wZXJ0aWVzKSB7XG4gIGlmIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMHgyMi8qIFwiICovKSByZXR1cm4gZmFsc2VcblxuICBzdGF0ZS5wb3NpdGlvbisrXG4gIGNvbnN0IHN0YXJ0ID0gc3RhdGUucG9zaXRpb25cbiAgLy8gQSBkb3VibGUtcXVvdGVkIHNjYWxhciBpcyBzbGljZWFibGUgdmVyYmF0aW0gd2hlbiBpdCBoYXMgbm8gXFwgZXNjYXBlcyBhbmRcbiAgLy8gbm8gZm9sZGVkIGxpbmUgYnJlYWtzIChzZWUgZ2V0U2NhbGFyVmFsdWUgZmFzdCBwYXRoKS5cbiAgbGV0IHNpbXBsZSA9IHRydWVcblxuICB3aGlsZSAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgIT09IDApIHtcbiAgICBjb25zdCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgICBpZiAoY2ggPT09IDB4MjIvKiBcIiAqLykge1xuICAgICAgY29uc3QgZW5kID0gc3RhdGUucG9zaXRpb25cbiAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgIGFkZFNjYWxhckV2ZW50KHN0YXRlLCBzdGFydCwgZW5kLCBwcm9wcy5hbmNob3JTdGFydCwgcHJvcHMuYW5jaG9yRW5kLCBwcm9wcy50YWdTdGFydCwgcHJvcHMudGFnRW5kLCBTQ0FMQVJfU1RZTEVfRE9VQkxFX1FVT1RFRCwgQ0hPTVBJTkdfQ0xJUCwgLTEsIHNpbXBsZSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKGNoID09PSAweDVDLyogXFwgKi8pIHtcbiAgICAgIHNpbXBsZSA9IGZhbHNlXG4gICAgICBjb25zdCBlc2NhcGVkID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuXG4gICAgICBpZiAoaXNFb2woZXNjYXBlZCkpIHtcbiAgICAgICAgcmVhZEZsb3dTY2FsYXJCcmVhayhzdGF0ZSwgbm9kZUluZGVudClcbiAgICAgIH0gZWxzZSBpZiAoaXNTaW1wbGVFc2NhcGUoZXNjYXBlZCkpIHtcbiAgICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGhleExlbmd0aCA9IGVzY2FwZWRIZXhMZW4oZXNjYXBlZClcblxuICAgICAgICBpZiAoaGV4TGVuZ3RoID09PSAwKSB0aHJvd0Vycm9yKHN0YXRlLCAndW5rbm93biBlc2NhcGUgc2VxdWVuY2UnKVxuXG4gICAgICAgIHdoaWxlIChoZXhMZW5ndGgtLSA+IDApIHtcbiAgICAgICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgICAgICAgaWYgKGZyb21IZXhDb2RlKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSA8IDApIHtcbiAgICAgICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdleHBlY3RlZCBoZXhhZGVjaW1hbCBjaGFyYWN0ZXInKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc0VvbChjaCkpIHtcbiAgICAgIHNpbXBsZSA9IGZhbHNlXG4gICAgICByZWFkRmxvd1NjYWxhckJyZWFrKHN0YXRlLCBub2RlSW5kZW50KVxuICAgIH0gZWxzZSBpZiAoc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUpKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndW5leHBlY3RlZCBlbmQgb2YgdGhlIGRvY3VtZW50IHdpdGhpbiBhIGRvdWJsZSBxdW90ZWQgc2NhbGFyJylcbiAgICB9IGVsc2UgaWYgKGNoICE9PSAweDA5LyogVGFiICovICYmIGNoIDwgMHgyMCkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2V4cGVjdGVkIHZhbGlkIEpTT04gY2hhcmFjdGVyJylcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgIH1cbiAgfVxuXG4gIHRocm93RXJyb3Ioc3RhdGUsICd1bmV4cGVjdGVkIGVuZCBvZiB0aGUgc3RyZWFtIHdpdGhpbiBhIGRvdWJsZSBxdW90ZWQgc2NhbGFyJylcbn1cblxuZnVuY3Rpb24gcmVhZEJsb2NrU2NhbGFyIChzdGF0ZTogUGFyc2VyU3RhdGUsIHBhcmVudEluZGVudDogbnVtYmVyLCBwcm9wczogTm9kZVByb3BlcnRpZXMpIHtcbiAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICBsZXQgY2hvbXBpbmc6IENob21waW5nID0gQ0hPTVBJTkdfQ0xJUFxuICBsZXQgaW5kZW50ID0gLTFcbiAgbGV0IGRldGVjdGVkSW5kZW50ID0gZmFsc2VcblxuICBpZiAoY2ggIT09IDB4N0MvKiB8ICovICYmIGNoICE9PSAweDNFLyogPiAqLykgcmV0dXJuIGZhbHNlXG5cbiAgY29uc3Qgc3R5bGUgPSBjaCA9PT0gMHg3Qy8qIHwgKi8gPyBTQ0FMQVJfU1RZTEVfTElURVJBTF9CTE9DSyA6IFNDQUxBUl9TVFlMRV9GT0xERURfQkxPQ0tcbiAgc3RhdGUucG9zaXRpb24rK1xuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCkge1xuICAgIGNvbnN0IGN1cnJlbnQgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICAgIGNvbnN0IGRpZ2l0ID0gZnJvbURlY2ltYWxDb2RlKGN1cnJlbnQpXG5cbiAgICBpZiAoY3VycmVudCA9PT0gMHgyQi8qICsgKi8gfHwgY3VycmVudCA9PT0gMHgyRC8qIC0gKi8pIHtcbiAgICAgIGlmIChjaG9tcGluZyAhPT0gQ0hPTVBJTkdfQ0xJUCkgdGhyb3dFcnJvcihzdGF0ZSwgJ3JlcGVhdCBvZiBhIGNob21waW5nIG1vZGUgaWRlbnRpZmllcicpXG4gICAgICBjaG9tcGluZyA9IGN1cnJlbnQgPT09IDB4MkIvKiArICovID8gQ0hPTVBJTkdfS0VFUCA6IENIT01QSU5HX1NUUklQXG4gICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgfSBlbHNlIGlmIChkaWdpdCA+PSAwKSB7XG4gICAgICBpZiAoZGlnaXQgPT09IDApIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2JhZCBleHBsaWNpdCBpbmRlbnRhdGlvbiB3aWR0aCBvZiBhIGJsb2NrIHNjYWxhcjsgaXQgY2Fubm90IGJlIGxlc3MgdGhhbiBvbmUnKVxuICAgICAgfVxuICAgICAgaWYgKGRldGVjdGVkSW5kZW50KSB0aHJvd0Vycm9yKHN0YXRlLCAncmVwZWF0IG9mIGFuIGluZGVudGF0aW9uIHdpZHRoIGlkZW50aWZpZXInKVxuICAgICAgaW5kZW50ID0gcGFyZW50SW5kZW50ICsgZGlnaXQgLSAxXG4gICAgICBkZXRlY3RlZEluZGVudCA9IHRydWVcbiAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBsZXQgaGFkV2hpdGVzcGFjZSA9IGZhbHNlXG4gIHdoaWxlIChpc1doaXRlU3BhY2Uoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpKSB7XG4gICAgaGFkV2hpdGVzcGFjZSA9IHRydWVcbiAgICBzdGF0ZS5wb3NpdGlvbisrXG4gIH1cbiAgaWYgKGhhZFdoaXRlc3BhY2UgJiYgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MjMvKiAjICovKSBza2lwVW50aWxMaW5lRW5kKHN0YXRlKVxuXG4gIGlmIChpc0VvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSkpIHtcbiAgICBjb25zdW1lTGluZUJyZWFrKHN0YXRlKVxuICB9IGVsc2UgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2EgbGluZSBicmVhayBpcyBleHBlY3RlZCcpXG4gIH1cblxuICBsZXQgY29udGVudEluZGVudCA9IGRldGVjdGVkSW5kZW50ID8gaW5kZW50IDogLTFcbiAgbGV0IG1heExlYWRpbmdJbmRlbnQgPSAwXG4gIGNvbnN0IHZhbHVlU3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICBsZXQgdmFsdWVFbmQgPSBzdGF0ZS5wb3NpdGlvblxuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCkge1xuICAgIGNvbnN0IGxpbmVQb3NpdGlvbiA9IHN0YXRlLnBvc2l0aW9uXG4gICAgbGV0IGNvbHVtbiA9IDBcblxuICAgIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KGxpbmVQb3NpdGlvbiArIGNvbHVtbikgPT09IDB4MjAvKiBTcGFjZSAqLykgY29sdW1uKytcblxuICAgIGNvbnN0IGZpcnN0ID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChsaW5lUG9zaXRpb24gKyBjb2x1bW4pXG4gICAgaWYgKGZpcnN0ID09PSAwKSB7XG4gICAgICAvLyBFbmQgb2YgaW5wdXQgYWN0cyBhcyBhIGxpbmUgdGVybWluYXRvciwgYnV0IHRoZXJlIGlzIG5vIGxpbmUgYnJlYWsgdG9cbiAgICAgIC8vIGluY2x1ZGUgaGVyZS4gQSBmaW5hbCBhbGwtc3BhY2VzIGxpbmUgc3RpbGwgY291bnRzOiB3aGVuIHRoZSBibG9jayBoYXMgYVxuICAgICAgLy8gY29udGVudCBpbmRlbnQsIHRoZSBzcGFjZXMgYmV5b25kIGl0IGFyZSByZWFsIGNvbnRlbnQ7IGluIGEgd2hvbGx5IGJsYW5rXG4gICAgICAvLyBibG9jayAoY29udGVudEluZGVudCA8IDApIHRoZSBzcGFjZXMgZm9ybSBhIGJsYW5rIGxpbmUgdGhhdCBjaG9tcGluZyBtdXN0XG4gICAgICAvLyBzZWUsIGV4YWN0bHkgYXMgaXQgd291bGQgaWYgdGhlIGxpbmUgZW5kZWQgd2l0aCBhIGJyZWFrLiBDYXB0dXJlIHRoZSBsaW5lXG4gICAgICAvLyBpbiBib3RoIGNhc2VzOyBvdGhlcndpc2UgdGhlIGJsb2NrIGVuZHMgYXQgdGhlIHN0YXJ0IG9mIHRoaXMgZW1wdHkgbGluZS5cbiAgICAgIGlmIChjb250ZW50SW5kZW50ID49IDApIHtcbiAgICAgICAgaWYgKGNvbHVtbiA+IGNvbnRlbnRJbmRlbnQpIHZhbHVlRW5kID0gbGluZVBvc2l0aW9uICsgY29sdW1uXG4gICAgICB9IGVsc2UgaWYgKGNvbHVtbiA+IDApIHtcbiAgICAgICAgdmFsdWVFbmQgPSBsaW5lUG9zaXRpb24gKyBjb2x1bW5cbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgfVxuICAgIGlmIChsaW5lUG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUsIGxpbmVQb3NpdGlvbikpIGJyZWFrXG5cbiAgICBpZiAoIWRldGVjdGVkSW5kZW50ICYmIGNvbnRlbnRJbmRlbnQgPT09IC0xICYmIGlzRW9sKGZpcnN0KSkge1xuICAgICAgbWF4TGVhZGluZ0luZGVudCA9IE1hdGgubWF4KG1heExlYWRpbmdJbmRlbnQsIGNvbHVtbilcbiAgICB9XG5cbiAgICBpZiAoIWRldGVjdGVkSW5kZW50ICYmIGNvbnRlbnRJbmRlbnQgPT09IC0xICYmICFpc0VvbChmaXJzdCkpIHtcbiAgICAgIGlmIChmaXJzdCA9PT0gMHgwOS8qIFRhYiAqLyAmJiBjb2x1bW4gPCBwYXJlbnRJbmRlbnQpIHtcbiAgICAgICAgc3RhdGUucG9zaXRpb24gPSBsaW5lUG9zaXRpb24gKyBjb2x1bW5cbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RhYiBjaGFyYWN0ZXJzIG11c3Qgbm90IGJlIHVzZWQgaW4gaW5kZW50YXRpb24nKVxuICAgICAgfVxuICAgICAgaWYgKGNvbHVtbiA8IG1heExlYWRpbmdJbmRlbnQpIHtcbiAgICAgICAgc3RhdGUucG9zaXRpb24gPSBsaW5lUG9zaXRpb24gKyBjb2x1bW5cbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2JhZCBpbmRlbnRhdGlvbiBvZiBhIG1hcHBpbmcgZW50cnknKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb250ZW50SW5kZW50ID09PSAtMSAmJiBmaXJzdCAhPT0gMCAmJiAhaXNFb2woZmlyc3QpICYmIGNvbHVtbiA8IHBhcmVudEluZGVudCkge1xuICAgICAgc3RhdGUubGluZUluZGVudCA9IGNvbHVtblxuICAgICAgc3RhdGUucG9zaXRpb24gPSBsaW5lUG9zaXRpb24gKyBjb2x1bW5cbiAgICAgIGJyZWFrXG4gICAgfVxuXG4gICAgaWYgKCFkZXRlY3RlZEluZGVudCAmJiBmaXJzdCAhPT0gMCAmJiAhaXNFb2woZmlyc3QpICYmIGNvbnRlbnRJbmRlbnQgPT09IC0xKSB7XG4gICAgICBjb250ZW50SW5kZW50ID0gY29sdW1uXG4gICAgfVxuXG4gICAgY29uc3QgcmVxdWlyZWRJbmRlbnQgPSBjb250ZW50SW5kZW50ID09PSAtMSA/IHBhcmVudEluZGVudCArIDEgOiBjb250ZW50SW5kZW50XG4gICAgaWYgKGZpcnN0ICE9PSAwICYmICFpc0VvbChmaXJzdCkgJiYgY29sdW1uIDwgcmVxdWlyZWRJbmRlbnQpIHtcbiAgICAgIHN0YXRlLmxpbmVJbmRlbnQgPSBjb2x1bW5cbiAgICAgIHN0YXRlLnBvc2l0aW9uID0gbGluZVBvc2l0aW9uICsgY29sdW1uXG4gICAgICBicmVha1xuICAgIH1cblxuICAgIHNraXBVbnRpbExpbmVFbmQoc3RhdGUpXG4gICAgdmFsdWVFbmQgPSBzdGF0ZS5wb3NpdGlvblxuICAgIGlmIChpc0VvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSkpIHtcbiAgICAgIGNvbnN1bWVMaW5lQnJlYWsoc3RhdGUpXG4gICAgICAvLyBJbmNsdWRlIHRoZSBsaW5lIGJyZWFrIGluIHRoZSByYW5nZSBzbyB0cmFpbGluZyBibGFuayBsaW5lcyBhcmVcbiAgICAgIC8vIHByZXNlcnZlZC4gVGhpcyBpcyB3aGF0IGxldHMgY29vayB0ZWxsIGFwYXJ0IGFuIGVtcHR5IGB8K2AgKHJhbmdlIFwiXCIsXG4gICAgICAvLyB2YWx1ZSBcIlwiKSBmcm9tIGEgYHwrYCB3aXRoIG9uZSBibGFuayBsaW5lIChyYW5nZSBcIlxcblwiLCB2YWx1ZSBcIlxcblwiKS5cbiAgICAgIC8vIERlLWluZGVudCBhbmQgY2hvbXBpbmcgYXJlIGFwcGxpZWQgbGF0ZXIgaW4gZ2V0U2NhbGFyVmFsdWUuXG4gICAgICB2YWx1ZUVuZCA9IHN0YXRlLnBvc2l0aW9uXG4gICAgfVxuICB9XG5cbiAgY2hlY2tQcmludGFibGUoc3RhdGUsIHZhbHVlU3RhcnQsIHZhbHVlRW5kKVxuICBhZGRTY2FsYXJFdmVudChcbiAgICBzdGF0ZSxcbiAgICB2YWx1ZVN0YXJ0LFxuICAgIHZhbHVlRW5kLFxuICAgIHByb3BzLmFuY2hvclN0YXJ0LFxuICAgIHByb3BzLmFuY2hvckVuZCxcbiAgICBwcm9wcy50YWdTdGFydCxcbiAgICBwcm9wcy50YWdFbmQsXG4gICAgc3R5bGUsXG4gICAgY2hvbXBpbmcsXG4gICAgY29udGVudEluZGVudFxuICApXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIGNhblN0YXJ0UGxhaW5TY2FsYXIgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgbm9kZUNvbnRleHQ6IE5vZGVDb250ZXh0KSB7XG4gIGNvbnN0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcbiAgY29uc3QgaW5GbG93ID0gbm9kZUNvbnRleHQgPT09IENPTlRFWFRfRkxPV19JTlxuXG4gIGlmIChjaCA9PT0gMCB8fFxuICAgICAgaXNXc09yRW9sKGNoKSB8fFxuICAgICAgY2ggPT09IDB4MjMvKiAjICovIHx8XG4gICAgICBjaCA9PT0gMHgyNi8qICYgKi8gfHxcbiAgICAgIGNoID09PSAweDJBLyogKiAqLyB8fFxuICAgICAgY2ggPT09IDB4MjEvKiAhICovIHx8XG4gICAgICBjaCA9PT0gMHg3Qy8qIHwgKi8gfHxcbiAgICAgIGNoID09PSAweDNFLyogPiAqLyB8fFxuICAgICAgY2ggPT09IDB4MjcvKiAnICovIHx8XG4gICAgICBjaCA9PT0gMHgyMi8qIFwiICovIHx8XG4gICAgICBjaCA9PT0gMHgyNS8qICUgKi8gfHxcbiAgICAgIGNoID09PSAweDQwLyogQCAqLyB8fFxuICAgICAgY2ggPT09IDB4NjAvKiBgICovIHx8XG4gICAgICAoaW5GbG93ICYmIGlzRmxvd0luZGljYXRvcihjaCkpKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoY2ggPT09IDB4M0YvKiA/ICovIHx8IGNoID09PSAweDJELyogLSAqLykge1xuICAgIGNvbnN0IGZvbGxvd2luZyA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKVxuICAgIGlmIChpc1dzT3JFb2xPckVuZChmb2xsb3dpbmcpIHx8IChpbkZsb3cgJiYgaXNGbG93SW5kaWNhdG9yKGZvbGxvd2luZykpKSByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHJlYWRQbGFpblNjYWxhciAoc3RhdGU6IFBhcnNlclN0YXRlLCBub2RlSW5kZW50OiBudW1iZXIsIG5vZGVDb250ZXh0OiBOb2RlQ29udGV4dCwgcHJvcHM6IE5vZGVQcm9wZXJ0aWVzKSB7XG4gIGlmICghY2FuU3RhcnRQbGFpblNjYWxhcihzdGF0ZSwgbm9kZUNvbnRleHQpKSByZXR1cm4gZmFsc2VcblxuICBjb25zdCBzdGFydCA9IHN0YXRlLnBvc2l0aW9uXG4gIGxldCBlbmQgPSBzdGF0ZS5wb3NpdGlvblxuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICBjb25zdCBpbkZsb3cgPSBub2RlQ29udGV4dCA9PT0gQ09OVEVYVF9GTE9XX0lOXG4gIC8vIEEgc2luZ2xlLWxpbmUgcGxhaW4gc2NhbGFyIGlzIHNsaWNlYWJsZSB2ZXJiYXRpbTogdGhlIHBhcnNlciBhbHJlYWR5IHRyaW1zXG4gIC8vIHRyYWlsaW5nIHdoaXRlc3BhY2UgZnJvbSB0aGUgcmFuZ2UsIHNvIG5vIGZvbGRpbmcgaXMgbmVlZGVkIChzZWVcbiAgLy8gZ2V0U2NhbGFyVmFsdWUgZmFzdCBwYXRoKS4gRm9sZGVkIGxpbmUgYnJlYWtzIG1ha2UgaXQgbm9uLXNpbXBsZS5cbiAgbGV0IG11bHRpbGluZSA9IGZhbHNlXG5cbiAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgaWYgKHN0YXRlLnBvc2l0aW9uID09PSBzdGF0ZS5saW5lU3RhcnQgJiYgdGVzdERvY3VtZW50U2VwYXJhdG9yKHN0YXRlKSkgYnJlYWtcblxuICAgIGlmIChjaCA9PT0gMHgzQS8qIDogKi8pIHtcbiAgICAgIGNvbnN0IGZvbGxvd2luZyA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKVxuICAgICAgaWYgKGlzV3NPckVvbE9yRW5kKGZvbGxvd2luZykgfHwgKGluRmxvdyAmJiBpc0Zsb3dJbmRpY2F0b3IoZm9sbG93aW5nKSkpIGJyZWFrXG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHgyMy8qICMgKi8pIHtcbiAgICAgIGNvbnN0IHByZWNlZGluZyA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gLSAxKVxuICAgICAgaWYgKGlzV3NPckVvbChwcmVjZWRpbmcpKSBicmVha1xuICAgIH0gZWxzZSBpZiAoaW5GbG93ICYmIGlzRmxvd0luZGljYXRvcihjaCkpIHtcbiAgICAgIGJyZWFrXG4gICAgfSBlbHNlIGlmIChpc0VvbChjaCkpIHtcbiAgICAgIGNvbnN0IHNhdmVkUG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvblxuICAgICAgY29uc3Qgc2F2ZWRMaW5lID0gc3RhdGUubGluZVxuICAgICAgY29uc3Qgc2F2ZWRMaW5lU3RhcnQgPSBzdGF0ZS5saW5lU3RhcnRcbiAgICAgIGNvbnN0IHNhdmVkTGluZUluZGVudCA9IHN0YXRlLmxpbmVJbmRlbnRcblxuICAgICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgZmFsc2UpXG5cbiAgICAgIGlmIChzdGF0ZS5saW5lSW5kZW50ID49IG5vZGVJbmRlbnQpIHtcbiAgICAgICAgbXVsdGlsaW5lID0gdHJ1ZVxuICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHN0YXRlLnBvc2l0aW9uID0gc2F2ZWRQb3NpdGlvblxuICAgICAgc3RhdGUubGluZSA9IHNhdmVkTGluZVxuICAgICAgc3RhdGUubGluZVN0YXJ0ID0gc2F2ZWRMaW5lU3RhcnRcbiAgICAgIHN0YXRlLmxpbmVJbmRlbnQgPSBzYXZlZExpbmVJbmRlbnRcbiAgICAgIGJyZWFrXG4gICAgfVxuXG4gICAgaWYgKCFpc1doaXRlU3BhY2UoY2gpKSBlbmQgPSBzdGF0ZS5wb3NpdGlvbiArIDFcbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgfVxuXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm4gZmFsc2VcblxuICBjaGVja1ByaW50YWJsZShzdGF0ZSwgc3RhcnQsIGVuZClcbiAgYWRkU2NhbGFyRXZlbnQoc3RhdGUsIHN0YXJ0LCBlbmQsIHByb3BzLmFuY2hvclN0YXJ0LCBwcm9wcy5hbmNob3JFbmQsIHByb3BzLnRhZ1N0YXJ0LCBwcm9wcy50YWdFbmQsIFNDQUxBUl9TVFlMRV9QTEFJTiwgQ0hPTVBJTkdfQ0xJUCwgLTEsICFtdWx0aWxpbmUpXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIGZpbmRCbG9ja01hcHBpbmdDb2xvbiAoc3RhdGU6IFBhcnNlclN0YXRlKSB7XG4gIGxldCBwb3NpdGlvbiA9IHN0YXRlLnBvc2l0aW9uXG4gIGxldCBmbG93TGV2ZWwgPSAwXG5cbiAgd2hpbGUgKHBvc2l0aW9uIDwgc3RhdGUubGVuZ3RoKSB7XG4gICAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKVxuXG4gICAgaWYgKGlzRW9sKGNoKSkgcmV0dXJuIC0xXG4gICAgaWYgKGNoID09PSAweDIzLyogIyAqLyAmJiBpc1dzT3JFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbiAtIDEpKSkgcmV0dXJuIC0xXG5cbiAgICBpZiAoKGNoID09PSAweDJBLyogKiAqLyB8fCBjaCA9PT0gMHgyNi8qICYgKi8pICYmIHBvc2l0aW9uID09PSBzdGF0ZS5wb3NpdGlvbikge1xuICAgICAgZG8geyBwb3NpdGlvbisrIH1cbiAgICAgIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSAhPT0gMCAmJlxuICAgICAgICAgICAgICFpc1dzT3JFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbikpICYmXG4gICAgICAgICAgICAgIWlzRmxvd0luZGljYXRvcihzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSkpXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIGlmIChjaCA9PT0gMHg1Qi8qIFsgKi8gfHwgY2ggPT09IDB4N0IvKiB7ICovKSB7XG4gICAgICBmbG93TGV2ZWwrK1xuICAgIH0gZWxzZSBpZiAoY2ggPT09IDB4NUQvKiBdICovIHx8IGNoID09PSAweDdELyogfSAqLykge1xuICAgICAgaWYgKGZsb3dMZXZlbCA+IDApIGZsb3dMZXZlbC0tXG4gICAgfSBlbHNlIGlmIChmbG93TGV2ZWwgPT09IDAgJiYgY2ggPT09IDB4M0EvKiA6ICovICYmIGlzV3NPckVvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uICsgMSkpKSB7XG4gICAgICByZXR1cm4gcG9zaXRpb25cbiAgICB9XG5cbiAgICBpZiAoKGZsb3dMZXZlbCA+IDAgfHwgcG9zaXRpb24gPT09IHN0YXRlLnBvc2l0aW9uKSAmJlxuICAgICAgICAoY2ggPT09IDB4MjcvKiAnICovIHx8IGNoID09PSAweDIyLyogXCIgKi8pKSB7XG4gICAgICBjb25zdCBxdW90ZSA9IGNoXG4gICAgICBwb3NpdGlvbisrXG5cbiAgICAgIHdoaWxlIChwb3NpdGlvbiA8IHN0YXRlLmxlbmd0aCAmJiBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSAhPT0gcXVvdGUpIHtcbiAgICAgICAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pID09PSAweDVDLyogXFwgKi8gJiYgcXVvdGUgPT09IDB4MjIvKiBcIiAqLykgcG9zaXRpb24rK1xuICAgICAgICBwb3NpdGlvbisrXG4gICAgICB9XG4gICAgfVxuXG4gICAgcG9zaXRpb24rK1xuICB9XG5cbiAgcmV0dXJuIC0xXG59XG5cbmZ1bmN0aW9uIHNraXBGbG93U2VwYXJhdGlvblNwYWNlIChzdGF0ZTogUGFyc2VyU3RhdGUsIG5vZGVJbmRlbnQ6IG51bWJlcikge1xuICBjb25zdCBzdGFydExpbmUgPSBzdGF0ZS5saW5lXG4gIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUpXG5cbiAgaWYgKChzdGF0ZS5saW5lID4gc3RhcnRMaW5lICYmIHN0YXRlLmxpbmVJbmRlbnQgPCBub2RlSW5kZW50KSB8fFxuICAgICAgKHN0YXRlLmZpcnN0VGFiSW5MaW5lICE9PSAtMSAmJiBzdGF0ZS5saW5lSW5kZW50IDwgbm9kZUluZGVudCkpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZGVmaWNpZW50IGluZGVudGF0aW9uJylcbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkRmxvd0NvbGxlY3Rpb24gKHN0YXRlOiBQYXJzZXJTdGF0ZSwgbm9kZUluZGVudDogbnVtYmVyLCBwcm9wczogTm9kZVByb3BlcnRpZXMpIHtcbiAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICBjb25zdCBpc01hcHBpbmcgPSBjaCA9PT0gMHg3Qi8qIHsgKi9cbiAgY29uc3Qgc3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICBsZXQgcmVhZE5leHQgPSB0cnVlXG5cbiAgaWYgKGNoICE9PSAweDVCLyogWyAqLyAmJiBjaCAhPT0gMHg3Qi8qIHsgKi8pIHJldHVybiBmYWxzZVxuXG4gIGNvbnN0IHRlcm1pbmF0b3IgPSBpc01hcHBpbmcgPyAweDdELyogfSAqLyA6IDB4NUQvKiBdICovXG5cbiAgaWYgKGlzTWFwcGluZykge1xuICAgIGFkZE1hcHBpbmdFdmVudChzdGF0ZSwgc3RhcnQsIHByb3BzLmFuY2hvclN0YXJ0LCBwcm9wcy5hbmNob3JFbmQsIHByb3BzLnRhZ1N0YXJ0LCBwcm9wcy50YWdFbmQsIENPTExFQ1RJT05fU1RZTEVfRkxPVylcbiAgfSBlbHNlIHtcbiAgICBhZGRTZXF1ZW5jZUV2ZW50KHN0YXRlLCBzdGFydCwgcHJvcHMuYW5jaG9yU3RhcnQsIHByb3BzLmFuY2hvckVuZCwgcHJvcHMudGFnU3RhcnQsIHByb3BzLnRhZ0VuZCwgQ09MTEVDVElPTl9TVFlMRV9GTE9XKVxuICB9XG5cbiAgc3RhdGUucG9zaXRpb24rK1xuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCkge1xuICAgIHNraXBGbG93U2VwYXJhdGlvblNwYWNlKHN0YXRlLCBub2RlSW5kZW50KVxuXG4gICAgbGV0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIGlmIChjaCA9PT0gdGVybWluYXRvcikge1xuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgYWRkUG9wRXZlbnQoc3RhdGUpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSBpZiAoIXJlYWROZXh0KSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnbWlzc2VkIGNvbW1hIGJldHdlZW4gZmxvdyBjb2xsZWN0aW9uIGVudHJpZXMnKVxuICAgIH0gZWxzZSBpZiAoY2ggPT09IDB4MkMvKiAsICovKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCBcImV4cGVjdGVkIHRoZSBub2RlIGNvbnRlbnQsIGJ1dCBmb3VuZCAnLCdcIilcbiAgICB9XG5cbiAgICBsZXQgaXNQYWlyID0gZmFsc2VcbiAgICBsZXQgaXNFeHBsaWNpdFBhaXIgPSBmYWxzZVxuXG4gICAgaWYgKGNoID09PSAweDNGLyogPyAqLyAmJiBpc1dzT3JFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpKSkge1xuICAgICAgaXNQYWlyID0gaXNFeHBsaWNpdFBhaXIgPSB0cnVlXG4gICAgICBzdGF0ZS5wb3NpdGlvbiArPSAxXG4gICAgICBza2lwRmxvd1NlcGFyYXRpb25TcGFjZShzdGF0ZSwgbm9kZUluZGVudClcbiAgICB9XG5cbiAgICBjb25zdCBlbnRyeUxpbmUgPSBzdGF0ZS5saW5lXG4gICAgY29uc3QgZW50cnlTdGFydCA9IHNuYXBzaG90U3RhdGUoc3RhdGUpXG5cbiAgICBjb25zdCBrZXlXYXNSZWFkID0gcGFyc2VOb2RlKHN0YXRlLCBub2RlSW5kZW50LCBDT05URVhUX0ZMT1dfSU4sIGZhbHNlLCB0cnVlKVxuICAgIHNraXBGbG93U2VwYXJhdGlvblNwYWNlKHN0YXRlLCBub2RlSW5kZW50KVxuXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgaWYgKChpc01hcHBpbmcgfHwgaXNFeHBsaWNpdFBhaXIgfHwgc3RhdGUubGluZSA9PT0gZW50cnlMaW5lKSAmJiBjaCA9PT0gMHgzQS8qIDogKi8pIHtcbiAgICAgIGlzUGFpciA9IHRydWVcbiAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgIHNraXBGbG93U2VwYXJhdGlvblNwYWNlKHN0YXRlLCBub2RlSW5kZW50KVxuICAgICAgaWYgKCFpc01hcHBpbmcpIHtcbiAgICAgICAgcmVzdG9yZVN0YXRlKHN0YXRlLCBlbnRyeVN0YXJ0KVxuICAgICAgICBhZGRNYXBwaW5nRXZlbnQoc3RhdGUsIGVudHJ5U3RhcnQucG9zaXRpb24sIE5PX1JBTkdFLCBOT19SQU5HRSwgTk9fUkFOR0UsIE5PX1JBTkdFLCBDT0xMRUNUSU9OX1NUWUxFX0ZMT1cpXG4gICAgICAgIGlmICghcGFyc2VOb2RlKHN0YXRlLCBub2RlSW5kZW50LCBDT05URVhUX0ZMT1dfSU4sIGZhbHNlLCB0cnVlKSkge1xuICAgICAgICAgIGFkZEVtcHR5U2NhbGFyRXZlbnQoc3RhdGUpXG4gICAgICAgIH1cbiAgICAgICAgc2tpcEZsb3dTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIG5vZGVJbmRlbnQpXG4gICAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgICAgc2tpcEZsb3dTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIG5vZGVJbmRlbnQpXG4gICAgICB9IGVsc2UgaWYgKCFrZXlXYXNSZWFkKSB7XG4gICAgICAgIGFkZEVtcHR5U2NhbGFyRXZlbnQoc3RhdGUpXG4gICAgICB9XG4gICAgICBpZiAoIXBhcnNlTm9kZShzdGF0ZSwgbm9kZUluZGVudCwgQ09OVEVYVF9GTE9XX0lOLCBmYWxzZSwgdHJ1ZSkpIHtcbiAgICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICAgIH1cbiAgICAgIHNraXBGbG93U2VwYXJhdGlvblNwYWNlKHN0YXRlLCBub2RlSW5kZW50KVxuICAgICAgaWYgKCFpc01hcHBpbmcpIGFkZFBvcEV2ZW50KHN0YXRlKVxuICAgIH0gZWxzZSBpZiAoaXNNYXBwaW5nICYmIGlzUGFpcikge1xuICAgICAgaWYgKCFrZXlXYXNSZWFkKSBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICB9IGVsc2UgaWYgKGlzTWFwcGluZykge1xuICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICB9IGVsc2UgaWYgKGlzUGFpcikge1xuICAgICAgcmVzdG9yZVN0YXRlKHN0YXRlLCBlbnRyeVN0YXJ0KVxuICAgICAgYWRkTWFwcGluZ0V2ZW50KHN0YXRlLCBlbnRyeVN0YXJ0LnBvc2l0aW9uLCBOT19SQU5HRSwgTk9fUkFOR0UsIE5PX1JBTkdFLCBOT19SQU5HRSwgQ09MTEVDVElPTl9TVFlMRV9GTE9XKVxuICAgICAgcGFyc2VOb2RlKHN0YXRlLCBub2RlSW5kZW50LCBDT05URVhUX0ZMT1dfSU4sIGZhbHNlLCB0cnVlKVxuICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICAgIGFkZFBvcEV2ZW50KHN0YXRlKVxuICAgIH1cblxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIGlmIChjaCA9PT0gMHgyQy8qICwgKi8pIHtcbiAgICAgIHJlYWROZXh0ID0gdHJ1ZVxuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgIH0gZWxzZSB7XG4gICAgICByZWFkTmV4dCA9IGZhbHNlXG4gICAgfVxuICB9XG5cbiAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuZXhwZWN0ZWQgZW5kIG9mIHRoZSBzdHJlYW0gd2l0aGluIGEgZmxvdyBjb2xsZWN0aW9uJylcbn1cblxuZnVuY3Rpb24gcmVhZEJsb2NrU2VxdWVuY2UgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgbm9kZUluZGVudDogbnVtYmVyLCBwcm9wczogTm9kZVByb3BlcnRpZXMpIHtcbiAgaWYgKHN0YXRlLmZpcnN0VGFiSW5MaW5lICE9PSAtMSB8fCBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMHgyRC8qIC0gKi8gfHwgIWlzV3NPckVvbE9yRW5kKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKSkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGFkZFNlcXVlbmNlRXZlbnQoc3RhdGUsIHN0YXRlLnBvc2l0aW9uLCBwcm9wcy5hbmNob3JTdGFydCwgcHJvcHMuYW5jaG9yRW5kLCBwcm9wcy50YWdTdGFydCwgcHJvcHMudGFnRW5kLCBDT0xMRUNUSU9OX1NUWUxFX0JMT0NLKVxuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gMHgyRC8qIC0gKi8gJiYgaXNXc09yRW9sT3JFbmQoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpKSkge1xuICAgIGlmIChzdGF0ZS5maXJzdFRhYkluTGluZSAhPT0gLTEpIHtcbiAgICAgIHN0YXRlLnBvc2l0aW9uID0gc3RhdGUuZmlyc3RUYWJJbkxpbmVcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd0YWIgY2hhcmFjdGVycyBtdXN0IG5vdCBiZSB1c2VkIGluIGluZGVudGF0aW9uJylcbiAgICB9XG5cbiAgICBjb25zdCBlbnRyeUxpbmUgPSBzdGF0ZS5saW5lXG4gICAgc3RhdGUucG9zaXRpb24rK1xuXG4gICAgY29uc3QgaGFkQnJlYWsgPSBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKSA+IDBcbiAgICBpZiAoc3RhdGUuZmlyc3RUYWJJbkxpbmUgIT09IC0xICYmXG4gICAgICAgIHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAweDJELyogLSAqLyAmJlxuICAgICAgICBpc1dzT3JFb2xPckVuZChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSkpKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnYmFkIGluZGVudGF0aW9uIG9mIGEgc2VxdWVuY2UgZW50cnknKVxuICAgIH1cblxuICAgIGlmIChoYWRCcmVhayAmJiBzdGF0ZS5saW5lSW5kZW50IDw9IG5vZGVJbmRlbnQpIHtcbiAgICAgIGFkZEVtcHR5U2NhbGFyRXZlbnQoc3RhdGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnNlTm9kZShzdGF0ZSwgbm9kZUluZGVudCwgQ09OVEVYVF9CTE9DS19JTiwgZmFsc2UsIHRydWUpXG4gICAgfVxuXG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSlcblxuICAgIGlmIChzdGF0ZS5saW5lSW5kZW50IDwgbm9kZUluZGVudCB8fCBzdGF0ZS5wb3NpdGlvbiA+PSBzdGF0ZS5sZW5ndGgpIGJyZWFrXG4gICAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPiBub2RlSW5kZW50KSB0aHJvd0Vycm9yKHN0YXRlLCAnYmFkIGluZGVudGF0aW9uIG9mIGEgc2VxdWVuY2UgZW50cnknKVxuICAgIGlmIChzdGF0ZS5saW5lID09PSBlbnRyeUxpbmUgJiZcbiAgICAgICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MkQvKiAtICovICYmXG4gICAgICAgIGlzV3NPckVvbE9yRW5kKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdiYWQgaW5kZW50YXRpb24gb2YgYSBzZXF1ZW5jZSBlbnRyeScpXG4gICAgfVxuICB9XG5cbiAgYWRkUG9wRXZlbnQoc3RhdGUpXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHJlYWRCbG9ja01hcHBpbmcgKHN0YXRlOiBQYXJzZXJTdGF0ZSwgbm9kZUluZGVudDogbnVtYmVyLCBmbG93SW5kZW50OiBudW1iZXIsIHByb3BzOiBOb2RlUHJvcGVydGllcykge1xuICBsZXQgYXRFeHBsaWNpdEtleSA9IGZhbHNlXG4gIGxldCBkZXRlY3RlZCA9IGZhbHNlXG4gIGxldCBtYXBwaW5nT3BlbmVkID0gZmFsc2VcbiAgbGV0IHBlbmRpbmdFeHBsaWNpdEtleSA9IGZhbHNlXG5cbiAgaWYgKHN0YXRlLmZpcnN0VGFiSW5MaW5lICE9PSAtMSkgcmV0dXJuIGZhbHNlXG5cbiAgbGV0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICBpZiAoIWF0RXhwbGljaXRLZXkgJiYgc3RhdGUuZmlyc3RUYWJJbkxpbmUgIT09IC0xKSB7XG4gICAgICBzdGF0ZS5wb3NpdGlvbiA9IHN0YXRlLmZpcnN0VGFiSW5MaW5lXG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndGFiIGNoYXJhY3RlcnMgbXVzdCBub3QgYmUgdXNlZCBpbiBpbmRlbnRhdGlvbicpXG4gICAgfVxuXG4gICAgY29uc3QgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpXG4gICAgY29uc3QgZW50cnlMaW5lID0gc3RhdGUubGluZVxuXG4gICAgaWYgKChjaCA9PT0gMHgzRi8qID8gKi8gfHwgY2ggPT09IDB4M0EvKiA6ICovKSAmJiBpc1dzT3JFb2xPckVuZChmb2xsb3dpbmcpKSB7XG4gICAgICBpZiAoIW1hcHBpbmdPcGVuZWQpIHtcbiAgICAgICAgYWRkTWFwcGluZ0V2ZW50KHN0YXRlLCBzdGF0ZS5wb3NpdGlvbiwgcHJvcHMuYW5jaG9yU3RhcnQsIHByb3BzLmFuY2hvckVuZCwgcHJvcHMudGFnU3RhcnQsIHByb3BzLnRhZ0VuZCwgQ09MTEVDVElPTl9TVFlMRV9CTE9DSylcbiAgICAgICAgbWFwcGluZ09wZW5lZCA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKGNoID09PSAweDNGLyogPyAqLykge1xuICAgICAgICBpZiAoYXRFeHBsaWNpdEtleSkgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICAgICAgZGV0ZWN0ZWQgPSB0cnVlXG4gICAgICAgIGF0RXhwbGljaXRLZXkgPSB0cnVlXG4gICAgICB9IGVsc2UgaWYgKGF0RXhwbGljaXRLZXkpIHtcbiAgICAgICAgYXRFeHBsaWNpdEtleSA9IGZhbHNlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhZGRFbXB0eVNjYWxhckV2ZW50KHN0YXRlKVxuICAgICAgICBkZXRlY3RlZCA9IHRydWVcbiAgICAgICAgYXRFeHBsaWNpdEtleSA9IGZhbHNlXG4gICAgICB9XG5cbiAgICAgIHN0YXRlLnBvc2l0aW9uICs9IDFcbiAgICAgIHBlbmRpbmdFeHBsaWNpdEtleSA9IHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQW4gZXhwbGljaXQga2V5IGF3YWl0aW5nIGl0cyB2YWx1ZSwgZm9sbG93ZWQgYnkgYW4gaW1wbGljaXQga2V5LCBtZWFuc1xuICAgICAgLy8gdGhlIGV4cGxpY2l0IGtleSdzIHZhbHVlIGlzIGVtcHR5LiBFbWl0IGl0IG5vdyAoYXBwZW5kLW9ubHkpIHNvIGl0IGlzXG4gICAgICAvLyBvcmRlcmVkIGJlZm9yZSB0aGUgaW1wbGljaXQga2V5IG5vZGUgcmVhZCBqdXN0IGJlbG93LlxuICAgICAgaWYgKGF0RXhwbGljaXRLZXkpIHtcbiAgICAgICAgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgICAgICAgYXRFeHBsaWNpdEtleSA9IGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGJlZm9yZUtleSA9IHNuYXBzaG90U3RhdGUoc3RhdGUpXG5cbiAgICAgIGlmICghcGFyc2VOb2RlKHN0YXRlLCBmbG93SW5kZW50LCBDT05URVhUX0ZMT1dfT1VULCBmYWxzZSwgdHJ1ZSkpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlLmxpbmUgPT09IGVudHJ5TGluZSkge1xuICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgICAgICAgd2hpbGUgKGlzV2hpdGVTcGFjZShjaCkpIHtcbiAgICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaCA9PT0gMHgzQS8qIDogKi8pIHtcbiAgICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcblxuICAgICAgICAgIGlmICghaXNXc09yRW9sT3JFbmQoY2gpKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnYSB3aGl0ZXNwYWNlIGNoYXJhY3RlciBpcyBleHBlY3RlZCBhZnRlciB0aGUga2V5LXZhbHVlIHNlcGFyYXRvciB3aXRoaW4gYSBibG9jayBtYXBwaW5nJylcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIW1hcHBpbmdPcGVuZWQpIHtcbiAgICAgICAgICAgIHJlc3RvcmVTdGF0ZShzdGF0ZSwgYmVmb3JlS2V5KVxuICAgICAgICAgICAgYWRkTWFwcGluZ0V2ZW50KHN0YXRlLCBiZWZvcmVLZXkucG9zaXRpb24sIHByb3BzLmFuY2hvclN0YXJ0LCBwcm9wcy5hbmNob3JFbmQsIHByb3BzLnRhZ1N0YXJ0LCBwcm9wcy50YWdFbmQsIENPTExFQ1RJT05fU1RZTEVfQkxPQ0spXG4gICAgICAgICAgICBtYXBwaW5nT3BlbmVkID0gdHJ1ZVxuICAgICAgICAgICAgLy8gVGhlIGtleSwgdGhlIGA6YCBhbmQgdGhlIHNwYWNlIGFmdGVyIGl0IHdlcmUgYWxyZWFkeSB2YWxpZGF0ZWRcbiAgICAgICAgICAgIC8vIGFib3ZlLCBiZWZvcmUgdGhlIHJvbGxiYWNrLiBSZS1yZWFkaW5nIHRoZSBzYW1lIGlucHV0IGNhbm5vdFxuICAgICAgICAgICAgLy8gZmFpbCwgc28ganVzdCBjb25zdW1lIGl0IGFnYWluIHdpdGhvdXQgZXJyb3IgY2hlY2tzLlxuICAgICAgICAgICAgcGFyc2VOb2RlKHN0YXRlLCBmbG93SW5kZW50LCBDT05URVhUX0ZMT1dfT1VULCBmYWxzZSwgdHJ1ZSlcblxuICAgICAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICAgICAgICAgICAgd2hpbGUgKGlzV2hpdGVTcGFjZShjaCkpIHtcbiAgICAgICAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkZXRlY3RlZCA9IHRydWVcbiAgICAgICAgICBhdEV4cGxpY2l0S2V5ID0gZmFsc2VcbiAgICAgICAgICBwZW5kaW5nRXhwbGljaXRLZXkgPSBmYWxzZVxuICAgICAgICB9IGVsc2UgaWYgKGRldGVjdGVkKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJleHBlY3RlZCAnOicgYWZ0ZXIgYSBtYXBwaW5nIGtleVwiKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE5vdCBhIG1hcHBpbmcuIElmIG91dGVyIHByb3BlcnRpZXMgYXJlIHBlbmRpbmcsIHJvbGwgYmFjayBzbyB0aGVcbiAgICAgICAgICAvLyBjYWxsZXIgcmUtcmVhZHMgdGhpcyBub2RlIHdpdGggdGhlbSBhdHRhY2hlZCAoZXZlbnRzIGFyZSBhcHBlbmQtb25seSkuXG4gICAgICAgICAgaWYgKHByb3BzLmFuY2hvclN0YXJ0ICE9PSBOT19SQU5HRSB8fCBwcm9wcy50YWdTdGFydCAhPT0gTk9fUkFOR0UpIHtcbiAgICAgICAgICAgIHJlc3RvcmVTdGF0ZShzdGF0ZSwgYmVmb3JlS2V5KVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZGV0ZWN0ZWQpIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2NhbiBub3QgcmVhZCBhIGJsb2NrIG1hcHBpbmcgZW50cnk7IGEgbXVsdGlsaW5lIGtleSBtYXkgbm90IGJlIGFuIGltcGxpY2l0IGtleScpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocHJvcHMuYW5jaG9yU3RhcnQgIT09IE5PX1JBTkdFIHx8IHByb3BzLnRhZ1N0YXJ0ICE9PSBOT19SQU5HRSkge1xuICAgICAgICAgIHJlc3RvcmVTdGF0ZShzdGF0ZSwgYmVmb3JlS2V5KVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBhcnNlTm9kZShzdGF0ZSwgbm9kZUluZGVudCwgQ09OVEVYVF9CTE9DS19PVVQsIHRydWUsIHBlbmRpbmdFeHBsaWNpdEtleSkpIHtcbiAgICAgIHBlbmRpbmdFeHBsaWNpdEtleSA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKCFhdEV4cGxpY2l0S2V5KSB7XG4gICAgICBpZiAocGVuZGluZ0V4cGxpY2l0S2V5KSB7XG4gICAgICAgIGFkZEVtcHR5U2NhbGFyRXZlbnQoc3RhdGUpXG4gICAgICAgIHBlbmRpbmdFeHBsaWNpdEtleSA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSlcbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgICBpZiAoKHN0YXRlLmxpbmUgPT09IGVudHJ5TGluZSB8fCBzdGF0ZS5saW5lSW5kZW50ID4gbm9kZUluZGVudCkgJiYgY2ggIT09IDApIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdiYWQgaW5kZW50YXRpb24gb2YgYSBtYXBwaW5nIGVudHJ5JylcbiAgICB9IGVsc2UgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPCBub2RlSW5kZW50KSB7XG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICghZGV0ZWN0ZWQpIHJldHVybiBmYWxzZVxuICBpZiAoYXRFeHBsaWNpdEtleSkgYWRkRW1wdHlTY2FsYXJFdmVudChzdGF0ZSlcbiAgaWYgKG1hcHBpbmdPcGVuZWQpIGFkZFBvcEV2ZW50KHN0YXRlKVxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiBwYXJzZU5vZGUgKFxuICBzdGF0ZTogUGFyc2VyU3RhdGUsXG4gIHBhcmVudEluZGVudDogbnVtYmVyLFxuICBub2RlQ29udGV4dDogTm9kZUNvbnRleHQsXG4gIGFsbG93VG9TZWVrOiBib29sZWFuLFxuICBhbGxvd0NvbXBhY3Q6IGJvb2xlYW4sXG4gIGFsbG93UHJvcGVydHlNYXBwaW5nID0gdHJ1ZVxuKTogYm9vbGVhbiB7XG4gIGlmIChzdGF0ZS5kZXB0aCA+PSBzdGF0ZS5tYXhEZXB0aCkge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsIGBuZXN0aW5nIGV4Y2VlZGVkIG1heERlcHRoICgke3N0YXRlLm1heERlcHRofSlgKVxuICB9XG5cbiAgc3RhdGUuZGVwdGgrK1xuXG4gIGxldCBpbmRlbnRTdGF0dXMgPSAxXG4gIGxldCBhdE5ld0xpbmUgPSBmYWxzZVxuICBsZXQgaGFzQ29udGVudCA9IGZhbHNlXG4gIGxldCBwcm9wZXJ0eVN0YXJ0OiBQYXJzZXJTbmFwc2hvdCB8IG51bGwgPSBudWxsXG4gIGNvbnN0IHByb3BzID0gZW1wdHlQcm9wZXJ0aWVzKClcblxuICBsZXQgYWxsb3dCbG9ja1NjYWxhcnMgPSBub2RlQ29udGV4dCA9PT0gQ09OVEVYVF9CTE9DS19PVVQgfHwgbm9kZUNvbnRleHQgPT09IENPTlRFWFRfQkxPQ0tfSU5cbiAgbGV0IGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9IGFsbG93QmxvY2tTY2FsYXJzXG4gIGNvbnN0IGFsbG93QmxvY2tTdHlsZXMgPSBhbGxvd0Jsb2NrU2NhbGFyc1xuXG4gIGlmIChhbGxvd1RvU2VlayAmJiBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKSkge1xuICAgIGF0TmV3TGluZSA9IHRydWVcblxuICAgIGlmIChzdGF0ZS5saW5lSW5kZW50ID4gcGFyZW50SW5kZW50KSB7XG4gICAgICBpbmRlbnRTdGF0dXMgPSAxXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5saW5lSW5kZW50ID09PSBwYXJlbnRJbmRlbnQpIHtcbiAgICAgIGluZGVudFN0YXR1cyA9IDBcbiAgICB9IGVsc2Uge1xuICAgICAgaW5kZW50U3RhdHVzID0gLTFcbiAgICB9XG4gIH1cblxuICBpZiAoc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUpKSB7XG4gICAgc3RhdGUuZGVwdGgtLVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaWYgKGluZGVudFN0YXR1cyA9PT0gMSkge1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBjb25zdCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG4gICAgICBjb25zdCBwcm9wZXJ0eVN0YXRlID0gc25hcHNob3RTdGF0ZShzdGF0ZSlcblxuICAgICAgaWYgKGF0TmV3TGluZSAmJlxuICAgICAgICAgIGluZGVudFN0YXR1cyAhPT0gMSAmJlxuICAgICAgICAgIChjaCA9PT0gMHgyMS8qICEgKi8gfHwgY2ggPT09IDB4MjYvKiAmICovKSkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBpZiAoYXROZXdMaW5lICYmXG4gICAgICAgICAgYWxsb3dCbG9ja1N0eWxlcyAmJlxuICAgICAgICAgIChwcm9wcy50YWdTdGFydCAhPT0gTk9fUkFOR0UgfHwgcHJvcHMuYW5jaG9yU3RhcnQgIT09IE5PX1JBTkdFKSAmJlxuICAgICAgICAgIChjaCA9PT0gMHgyMS8qICEgKi8gfHwgY2ggPT09IDB4MjYvKiAmICovKSkge1xuICAgICAgICBjb25zdCBmYWxsYmFja1N0YXRlID0gc25hcHNob3RTdGF0ZShzdGF0ZSlcbiAgICAgICAgY29uc3QgZmxvd0luZGVudCA9IHBhcmVudEluZGVudCArIDFcbiAgICAgICAgY29uc3QgbWFwcGluZ0luZGVudCA9IHN0YXRlLnBvc2l0aW9uIC0gc3RhdGUubGluZVN0YXJ0XG5cbiAgICAgICAgaWYgKHJlYWRCbG9ja01hcHBpbmcoc3RhdGUsIG1hcHBpbmdJbmRlbnQsIGZsb3dJbmRlbnQsIHByb3BzKSAmJlxuICAgICAgICAgICAgc3RhdGUuZXZlbnRzW2ZhbGxiYWNrU3RhdGUuZXZlbnRzTGVuZ3RoXT8udHlwZSA9PT0gRVZFTlRfTUFQUElORykge1xuICAgICAgICAgIHN0YXRlLmRlcHRoLS1cbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzdG9yZVN0YXRlKHN0YXRlLCBmYWxsYmFja1N0YXRlKVxuICAgICAgfVxuXG4gICAgICBpZiAoYXROZXdMaW5lICYmXG4gICAgICAgICAgKChjaCA9PT0gMHgyMS8qICEgKi8gJiYgcHJvcHMudGFnU3RhcnQgIT09IE5PX1JBTkdFKSB8fFxuICAgICAgICAgICAoY2ggPT09IDB4MjYvKiAmICovICYmIHByb3BzLmFuY2hvclN0YXJ0ICE9PSBOT19SQU5HRSkpKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGlmICghcmVhZFRhZ1Byb3BlcnR5KHN0YXRlLCBwcm9wcywgbm9kZUNvbnRleHQgPT09IENPTlRFWFRfRkxPV19JTikgJiYgIXJlYWRBbmNob3JQcm9wZXJ0eShzdGF0ZSwgcHJvcHMpKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9wZXJ0eVN0YXJ0ID09PSBudWxsKSBwcm9wZXJ0eVN0YXJ0ID0gcHJvcGVydHlTdGF0ZVxuXG4gICAgICBpZiAoc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSkpIHtcbiAgICAgICAgYXROZXdMaW5lID0gdHJ1ZVxuICAgICAgICBhbGxvd0Jsb2NrQ29sbGVjdGlvbnMgPSBhbGxvd0Jsb2NrU3R5bGVzXG5cbiAgICAgICAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPiBwYXJlbnRJbmRlbnQpIHtcbiAgICAgICAgICBpbmRlbnRTdGF0dXMgPSAxXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUubGluZUluZGVudCA9PT0gcGFyZW50SW5kZW50KSB7XG4gICAgICAgICAgaW5kZW50U3RhdHVzID0gMFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluZGVudFN0YXR1cyA9IC0xXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGFsbG93QmxvY2tDb2xsZWN0aW9ucykge1xuICAgIGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9IGF0TmV3TGluZSB8fCBhbGxvd0NvbXBhY3RcbiAgfVxuXG4gIGlmIChpbmRlbnRTdGF0dXMgPT09IDEgfHwgbm9kZUNvbnRleHQgPT09IENPTlRFWFRfQkxPQ0tfT1VUKSB7XG4gICAgY29uc3QgZmxvd0luZGVudCA9IG5vZGVDb250ZXh0ID09PSBDT05URVhUX0ZMT1dfSU4gfHwgbm9kZUNvbnRleHQgPT09IENPTlRFWFRfRkxPV19PVVRcbiAgICAgID8gcGFyZW50SW5kZW50XG4gICAgICA6IHBhcmVudEluZGVudCArIDFcbiAgICBjb25zdCBibG9ja0luZGVudCA9IHN0YXRlLnBvc2l0aW9uIC0gc3RhdGUubGluZVN0YXJ0XG5cbiAgICBpZiAoaW5kZW50U3RhdHVzID09PSAxKSB7XG4gICAgICBpZiAoKGFsbG93QmxvY2tDb2xsZWN0aW9ucyAmJlxuICAgICAgICAgIChyZWFkQmxvY2tTZXF1ZW5jZShzdGF0ZSwgYmxvY2tJbmRlbnQsIHByb3BzKSB8fFxuICAgICAgICAgICByZWFkQmxvY2tNYXBwaW5nKHN0YXRlLCBibG9ja0luZGVudCwgZmxvd0luZGVudCwgcHJvcHMpKSkgfHxcbiAgICAgICAgICByZWFkRmxvd0NvbGxlY3Rpb24oc3RhdGUsIGZsb3dJbmRlbnQsIHByb3BzKSkge1xuICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgICAgIGlmIChwcm9wZXJ0eVN0YXJ0ICE9PSBudWxsICYmIGFsbG93UHJvcGVydHlNYXBwaW5nICYmIGFsbG93QmxvY2tTdHlsZXMgJiYgIWFsbG93QmxvY2tDb2xsZWN0aW9ucyAmJlxuICAgICAgICAgICAgY2ggIT09IDB4N0MvKiB8ICovICYmIGNoICE9PSAweDNFLyogPiAqLykge1xuICAgICAgICAgIGNvbnN0IGZhbGxiYWNrU3RhdGUgPSBzbmFwc2hvdFN0YXRlKHN0YXRlKVxuICAgICAgICAgIGNvbnN0IHByb3BlcnR5SW5kZW50ID0gcHJvcGVydHlTdGFydC5wb3NpdGlvbiAtIHByb3BlcnR5U3RhcnQubGluZVN0YXJ0XG5cbiAgICAgICAgICByZXN0b3JlU3RhdGUoc3RhdGUsIHByb3BlcnR5U3RhcnQpXG5cbiAgICAgICAgICBpZiAocmVhZEJsb2NrTWFwcGluZyhzdGF0ZSwgcHJvcGVydHlJbmRlbnQsIGZsb3dJbmRlbnQsIGVtcHR5UHJvcGVydGllcygpKSAmJlxuICAgICAgICAgICAgICBzdGF0ZS5ldmVudHNbZmFsbGJhY2tTdGF0ZS5ldmVudHNMZW5ndGhdPy50eXBlID09PSBFVkVOVF9NQVBQSU5HKSB7XG4gICAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN0b3JlU3RhdGUoc3RhdGUsIGZhbGxiYWNrU3RhdGUpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFoYXNDb250ZW50ICYmXG4gICAgICAgICAgICAoKGFsbG93QmxvY2tTY2FsYXJzICYmIHJlYWRCbG9ja1NjYWxhcihzdGF0ZSwgZmxvd0luZGVudCwgcHJvcHMpKSB8fFxuICAgICAgICAgICAgIHJlYWRTaW5nbGVRdW90ZWRTY2FsYXIoc3RhdGUsIGZsb3dJbmRlbnQsIHByb3BzKSB8fFxuICAgICAgICAgICAgIHJlYWREb3VibGVRdW90ZWRTY2FsYXIoc3RhdGUsIGZsb3dJbmRlbnQsIHByb3BzKSB8fFxuICAgICAgICAgICAgIHJlYWRBbGlhcyhzdGF0ZSwgcHJvcHMpIHx8XG4gICAgICAgICAgICAgcmVhZFBsYWluU2NhbGFyKHN0YXRlLCBmbG93SW5kZW50LCBub2RlQ29udGV4dCwgcHJvcHMpKSkge1xuICAgICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGluZGVudFN0YXR1cyA9PT0gMCkge1xuICAgICAgaGFzQ29udGVudCA9IGFsbG93QmxvY2tDb2xsZWN0aW9ucyAmJiByZWFkQmxvY2tTZXF1ZW5jZShzdGF0ZSwgYmxvY2tJbmRlbnQsIHByb3BzKVxuICAgIH1cbiAgfVxuXG4gIGFsbG93QmxvY2tTY2FsYXJzID0gYWxsb3dCbG9ja1NjYWxhcnMgJiYgIWhhc0NvbnRlbnRcblxuICBpZiAoIWhhc0NvbnRlbnQgJiYgKHByb3BzLmFuY2hvclN0YXJ0ICE9PSBOT19SQU5HRSB8fCBwcm9wcy50YWdTdGFydCAhPT0gTk9fUkFOR0UgfHwgYWxsb3dCbG9ja1NjYWxhcnMpKSB7XG4gICAgYWRkU2NhbGFyRXZlbnQoXG4gICAgICBzdGF0ZSxcbiAgICAgIE5PX1JBTkdFLFxuICAgICAgTk9fUkFOR0UsXG4gICAgICBwcm9wcy5hbmNob3JTdGFydCxcbiAgICAgIHByb3BzLmFuY2hvckVuZCxcbiAgICAgIHByb3BzLnRhZ1N0YXJ0LFxuICAgICAgcHJvcHMudGFnRW5kLFxuICAgICAgU0NBTEFSX1NUWUxFX1BMQUlOXG4gICAgKVxuICAgIGhhc0NvbnRlbnQgPSB0cnVlXG4gIH1cblxuICBzdGF0ZS5kZXB0aC0tXG4gIHJldHVybiBoYXNDb250ZW50IHx8IHByb3BzLmFuY2hvclN0YXJ0ICE9PSBOT19SQU5HRSB8fCBwcm9wcy50YWdTdGFydCAhPT0gTk9fUkFOR0Vcbn1cblxuZnVuY3Rpb24gcmVhZERpcmVjdGl2ZSAoc3RhdGU6IFBhcnNlclN0YXRlKSB7XG4gIGlmIChzdGF0ZS5saW5lSW5kZW50ID4gMCB8fCBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMHgyNS8qICUgKi8pIHJldHVybiBmYWxzZVxuXG4gIHN0YXRlLnBvc2l0aW9uKytcbiAgY29uc3QgbmFtZVN0YXJ0ID0gc3RhdGUucG9zaXRpb25cblxuICB3aGlsZSAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgIT09IDAgJiYgIWlzV3NPckVvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSkpIHN0YXRlLnBvc2l0aW9uKytcblxuICBjb25zdCBuYW1lID0gc3RhdGUuaW5wdXQuc2xpY2UobmFtZVN0YXJ0LCBzdGF0ZS5wb3NpdGlvbilcbiAgY29uc3QgYXJnczogc3RyaW5nW10gPSBbXVxuXG4gIGlmIChuYW1lLmxlbmd0aCA9PT0gMCkgdGhyb3dFcnJvcihzdGF0ZSwgJ2RpcmVjdGl2ZSBuYW1lIG11c3Qgbm90IGJlIGxlc3MgdGhhbiBvbmUgY2hhcmFjdGVyIGluIGxlbmd0aCcpXG5cbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pICE9PSAwICYmICFpc0VvbChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSkpIHtcbiAgICB3aGlsZSAoaXNXaGl0ZVNwYWNlKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkgc3RhdGUucG9zaXRpb24rK1xuICAgIGlmIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gMHgyMy8qICMgKi8gfHwgaXNFb2woc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpIHx8IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAwKSBicmVha1xuXG4gICAgY29uc3Qgc3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICAgIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAhPT0gMCAmJiAhaXNXc09yRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkgc3RhdGUucG9zaXRpb24rK1xuICAgIGFyZ3MucHVzaChzdGF0ZS5pbnB1dC5zbGljZShzdGFydCwgc3RhdGUucG9zaXRpb24pKVxuICB9XG5cbiAgaWYgKGlzRW9sKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSkgY29uc3VtZUxpbmVCcmVhayhzdGF0ZSlcblxuICBpZiAobmFtZSA9PT0gJ1lBTUwnKSB7XG4gICAgaWYgKHN0YXRlLmRpcmVjdGl2ZXMuc29tZShkaXJlY3RpdmUgPT4gZGlyZWN0aXZlLmtpbmQgPT09ICd5YW1sJykpIHRocm93RXJyb3Ioc3RhdGUsICdkdXBsaWNhdGlvbiBvZiAlWUFNTCBkaXJlY3RpdmUnKVxuICAgIGlmIChhcmdzLmxlbmd0aCAhPT0gMSkgdGhyb3dFcnJvcihzdGF0ZSwgJ1lBTUwgZGlyZWN0aXZlIGFjY2VwdHMgZXhhY3RseSBvbmUgYXJndW1lbnQnKVxuXG4gICAgY29uc3QgbWF0Y2ggPSAvXihbMC05XSspXFwuKFswLTldKykkLy5leGVjKGFyZ3NbMF0pXG4gICAgaWYgKG1hdGNoID09PSBudWxsKSB0aHJvd0Vycm9yKHN0YXRlLCAnaWxsLWZvcm1lZCBhcmd1bWVudCBvZiB0aGUgWUFNTCBkaXJlY3RpdmUnKVxuICAgIGlmIChwYXJzZUludChtYXRjaFsxXSwgMTApICE9PSAxKSB0aHJvd0Vycm9yKHN0YXRlLCAndW5hY2NlcHRhYmxlIFlBTUwgdmVyc2lvbiBvZiB0aGUgZG9jdW1lbnQnKVxuXG4gICAgc3RhdGUuZGlyZWN0aXZlcy5wdXNoKHsga2luZDogJ3lhbWwnLCB2ZXJzaW9uOiBhcmdzWzBdIH0pXG4gIH0gZWxzZSBpZiAobmFtZSA9PT0gJ1RBRycpIHtcbiAgICBpZiAoYXJncy5sZW5ndGggIT09IDIpIHRocm93RXJyb3Ioc3RhdGUsICdUQUcgZGlyZWN0aXZlIGFjY2VwdHMgZXhhY3RseSB0d28gYXJndW1lbnRzJylcblxuICAgIGNvbnN0IFtoYW5kbGUsIHByZWZpeF0gPSBhcmdzXG4gICAgaWYgKCFQQVRURVJOX1RBR19IQU5ETEUudGVzdChoYW5kbGUpKSB0aHJvd0Vycm9yKHN0YXRlLCAnaWxsLWZvcm1lZCB0YWcgaGFuZGxlIChmaXJzdCBhcmd1bWVudCkgb2YgdGhlIFRBRyBkaXJlY3RpdmUnKVxuICAgIGlmIChIQVNfT1dOLmNhbGwoc3RhdGUudGFnSGFuZGxlcnMsIGhhbmRsZSkpIHRocm93RXJyb3Ioc3RhdGUsIGB0aGVyZSBpcyBhIHByZXZpb3VzbHkgZGVjbGFyZWQgc3VmZml4IGZvciBcIiR7aGFuZGxlfVwiIHRhZyBoYW5kbGVgKVxuICAgIGlmICghUEFUVEVSTl9UQUdfUFJFRklYLnRlc3QocHJlZml4KSkgdGhyb3dFcnJvcihzdGF0ZSwgJ2lsbC1mb3JtZWQgdGFnIHByZWZpeCAoc2Vjb25kIGFyZ3VtZW50KSBvZiB0aGUgVEFHIGRpcmVjdGl2ZScpXG4gICAgdHJ5IHtcbiAgICAgIGRlY29kZVVSSUNvbXBvbmVudChwcmVmaXgpXG4gICAgfSBjYXRjaCB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCBgdGFnIHByZWZpeCBpcyBtYWxmb3JtZWQ6ICR7cHJlZml4fWApXG4gICAgfVxuXG4gICAgc3RhdGUudGFnSGFuZGxlcnNbaGFuZGxlXSA9IHByZWZpeFxuICAgIHN0YXRlLmRpcmVjdGl2ZXMucHVzaCh7IGtpbmQ6ICd0YWcnLCBoYW5kbGUsIHByZWZpeCB9KVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gcmVhZERvY3VtZW50IChzdGF0ZTogUGFyc2VyU3RhdGUpIHtcbiAgc3RhdGUuZGlyZWN0aXZlcyA9IFtdXG4gIHN0YXRlLnRhZ0hhbmRsZXJzID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICBsZXQgaGFzRGlyZWN0aXZlcyA9IGZhbHNlXG5cbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSlcblxuICB3aGlsZSAocmVhZERpcmVjdGl2ZShzdGF0ZSkpIHtcbiAgICBoYXNEaXJlY3RpdmVzID0gdHJ1ZVxuICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUpXG4gIH1cblxuICBsZXQgZXhwbGljaXRTdGFydCA9IGZhbHNlXG4gIGxldCBleHBsaWNpdEVuZCA9IGZhbHNlXG4gIGxldCBhbGxvd0NvbXBhY3QgPSB0cnVlXG5cbiAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPT09IDAgJiZcbiAgICAgIHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAweDJELyogLSAqLyAmJlxuICAgICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpID09PSAweDJELyogLSAqLyAmJlxuICAgICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDIpID09PSAweDJELyogLSAqLyAmJlxuICAgICAgaXNXc09yRW9sT3JFbmQoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDMpKSkge1xuICAgIGV4cGxpY2l0U3RhcnQgPSB0cnVlXG4gICAgY29uc3QgbWFya2VyTGluZSA9IHN0YXRlLmxpbmVcbiAgICBzdGF0ZS5wb3NpdGlvbiArPSAzXG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSlcbiAgICBhbGxvd0NvbXBhY3QgPSBzdGF0ZS5saW5lID4gbWFya2VyTGluZVxuICB9IGVsc2UgaWYgKGhhc0RpcmVjdGl2ZXMpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZGlyZWN0aXZlcyBlbmQgbWFyayBpcyBleHBlY3RlZCcpXG4gIH1cblxuICBjb25zdCBkb2N1bWVudEV2ZW50SW5kZXggPSBzdGF0ZS5ldmVudHMubGVuZ3RoXG4gIGlmICghZXhwbGljaXRTdGFydCAmJlxuICAgICAgc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJlxuICAgICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MkUvKiAuICovICYmXG4gICAgICB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUpKSB7XG4gICAgc3RhdGUucG9zaXRpb24gKz0gM1xuICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUpXG4gICAgcmV0dXJuXG4gIH1cblxuICBhZGREb2N1bWVudEV2ZW50KHN0YXRlLCBleHBsaWNpdFN0YXJ0LCBmYWxzZSlcbiAgaWYgKCFwYXJzZU5vZGUoc3RhdGUsIHN0YXRlLmxpbmVJbmRlbnQgLSAxLCBDT05URVhUX0JMT0NLX09VVCwgZmFsc2UsIGFsbG93Q29tcGFjdCwgYWxsb3dDb21wYWN0KSkge1xuICAgIGFkZEVtcHR5U2NhbGFyRXZlbnQoc3RhdGUpXG4gIH1cbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSlcblxuICBpZiAoc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUpKSB7XG4gICAgZXhwbGljaXRFbmQgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gMHgyRS8qIC4gKi9cbiAgICBpZiAoZXhwbGljaXRFbmQpIHtcbiAgICAgIGNvbnN0IG1hcmtlckxpbmUgPSBzdGF0ZS5saW5lXG4gICAgICBzdGF0ZS5wb3NpdGlvbiArPSAzXG4gICAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKVxuICAgICAgaWYgKHN0YXRlLmxpbmUgPT09IG1hcmtlckxpbmUgJiYgc3RhdGUucG9zaXRpb24gPCBzdGF0ZS5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2VuZCBvZiB0aGUgc3RyZWFtIG9yIGEgZG9jdW1lbnQgc2VwYXJhdG9yIGlzIGV4cGVjdGVkJylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBkb2N1bWVudEV2ZW50ID0gc3RhdGUuZXZlbnRzW2RvY3VtZW50RXZlbnRJbmRleF1cbiAgaWYgKGRvY3VtZW50RXZlbnQ/LnR5cGUgPT09IEVWRU5UX0RPQ1VNRU5UKSBkb2N1bWVudEV2ZW50LmV4cGxpY2l0RW5kID0gZXhwbGljaXRFbmRcblxuICBhZGRQb3BFdmVudChzdGF0ZSlcblxuICBpZiAoIWV4cGxpY2l0RW5kICYmXG4gICAgICBzdGF0ZS5wb3NpdGlvbiA8IHN0YXRlLmxlbmd0aCAmJlxuICAgICAgIShzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSkpKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2VuZCBvZiB0aGUgc3RyZWFtIG9yIGEgZG9jdW1lbnQgc2VwYXJhdG9yIGlzIGV4cGVjdGVkJylcbiAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZUV2ZW50cyAoaW5wdXQ6IHN0cmluZywgb3B0aW9uczogUGFyc2VyT3B0aW9ucyk6IEV2ZW50W10ge1xuICBjb25zdCBsZW5ndGggPSBpbnB1dC5sZW5ndGhcbiAgY29uc3Qgc3RhdGU6IFBhcnNlclN0YXRlID0ge1xuICAgIC4uLkRFRkFVTFRfUEFSU0VSX09QVElPTlMsXG4gICAgLi4ub3B0aW9ucyxcbiAgICBpbnB1dDogYCR7aW5wdXR9XFwwYCxcbiAgICBsZW5ndGgsXG4gICAgcG9zaXRpb246IDAsXG4gICAgbGluZTogMCxcbiAgICBsaW5lU3RhcnQ6IDAsXG4gICAgbGluZUluZGVudDogMCxcbiAgICBmaXJzdFRhYkluTGluZTogLTEsXG4gICAgZGVwdGg6IDAsXG4gICAgZGlyZWN0aXZlczogW10sXG4gICAgdGFnSGFuZGxlcnM6IE9iamVjdC5jcmVhdGUobnVsbCksXG4gICAgZXZlbnRzOiBbXVxuICB9XG5cbiAgY29uc3QgbnVsbHBvcyA9IGlucHV0LmluZGV4T2YoJ1xcMCcpXG4gIGlmIChudWxscG9zICE9PSAtMSkgdGhyb3dFcnJvckF0KGlucHV0LCBudWxscG9zLCAnbnVsbCBieXRlIGlzIG5vdCBhbGxvd2VkIGluIGlucHV0Jywgc3RhdGUuZmlsZW5hbWUpXG5cbiAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAweEZFRkYpIHN0YXRlLnBvc2l0aW9uKytcblxuICB3aGlsZSAoc3RhdGUucG9zaXRpb24gPCBzdGF0ZS5sZW5ndGgpIHtcbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlKVxuICAgIGlmIChzdGF0ZS5wb3NpdGlvbiA+PSBzdGF0ZS5sZW5ndGgpIGJyZWFrXG4gICAgY29uc3QgZG9jdW1lbnRTdGFydCA9IHN0YXRlLnBvc2l0aW9uXG4gICAgcmVhZERvY3VtZW50KHN0YXRlKVxuICAgIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gZG9jdW1lbnRTdGFydCkge1xuICAgICAgLy8gSW50ZXJuYWwgcHJvZ3Jlc3MgZ3VhcmQ6IGlmIHJlYWREb2N1bWVudCgpIGV2ZXIgcmV0dXJucyB3aXRob3V0XG4gICAgICAvLyBjb25zdW1pbmcgaW5wdXQsIHN0b3AgaGVyZSBpbnN0ZWFkIG9mIGxvb3BpbmcgZm9yZXZlci5cbiAgICAgIC8qIGM4IGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnY2FuIG5vdCByZWFkIGEgZG9jdW1lbnQnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdGF0ZS5ldmVudHNcbn1cblxuZXhwb3J0IHtcbiAgcGFyc2VFdmVudHMsXG4gIERFRkFVTFRfUEFSU0VSX09QVElPTlMsXG4gIHR5cGUgUGFyc2VyT3B0aW9uc1xufVxuIiwgImltcG9ydCB7IFlBTUxFeGNlcHRpb24gfSBmcm9tICcuL2NvbW1vbi9leGNlcHRpb24udHMnXG5pbXBvcnQgeyBwaWNrIH0gZnJvbSAnLi9jb21tb24vb2JqZWN0LnRzJ1xuaW1wb3J0IHtcbiAgY29uc3RydWN0RnJvbUV2ZW50cyxcbiAgREVGQVVMVF9DT05TVFJVQ1RPUl9PUFRJT05TLFxuICB0eXBlIENvbnN0cnVjdG9yT3B0aW9uc1xufSBmcm9tICcuL3BhcnNlci9jb25zdHJ1Y3Rvci50cydcbmltcG9ydCB7XG4gIHBhcnNlRXZlbnRzLFxuICBERUZBVUxUX1BBUlNFUl9PUFRJT05TLFxuICB0eXBlIFBhcnNlck9wdGlvbnNcbn0gZnJvbSAnLi9wYXJzZXIvcGFyc2VyLnRzJ1xuXG4vLyBgc291cmNlYCBpcyBzdXBwbGllZCBieSBgbG9hZERvY3VtZW50c2AgaXRzZWxmLCBub3QgYnkgdGhlIHB1YmxpYyBjYWxsZXIuXG5pbnRlcmZhY2UgTG9hZE9wdGlvbnMgZXh0ZW5kcyBQYXJzZXJPcHRpb25zLCBPbWl0PENvbnN0cnVjdG9yT3B0aW9ucywgJ3NvdXJjZSc+IHt9XG5cbnR5cGUgTG9hZEFsbEl0ZXJhdG9yID0gKGRvY3VtZW50OiB1bmtub3duKSA9PiB2b2lkXG5cbmNvbnN0IERFRkFVTFRfTE9BRF9PUFRJT05TOiBSZXF1aXJlZDxMb2FkT3B0aW9ucz4gPSB7XG4gIC4uLkRFRkFVTFRfUEFSU0VSX09QVElPTlMsXG4gIC4uLkRFRkFVTFRfQ09OU1RSVUNUT1JfT1BUSU9OU1xufVxuXG5mdW5jdGlvbiBsb2FkRG9jdW1lbnRzIChpbnB1dDogc3RyaW5nLCBvcHRpb25zOiBMb2FkT3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IG9wdHMgPSB7IC4uLkRFRkFVTFRfTE9BRF9PUFRJT05TLCAuLi5vcHRpb25zIH1cbiAgY29uc3Qgc291cmNlID0gU3RyaW5nKGlucHV0KVxuXG4gIGNvbnN0IFBBUlNFUl9PUFRfS0VZUyA9IE9iamVjdC5rZXlzKERFRkFVTFRfUEFSU0VSX09QVElPTlMpIGFzXG4gICAgKGtleW9mIHR5cGVvZiBERUZBVUxUX1BBUlNFUl9PUFRJT05TKVtdXG4gIGNvbnN0IENPTlNUUlVDVE9SX09QVF9LRVlTID0gT2JqZWN0LmtleXMoREVGQVVMVF9DT05TVFJVQ1RPUl9PUFRJT05TKSBhc1xuICAgIChrZXlvZiB0eXBlb2YgREVGQVVMVF9DT05TVFJVQ1RPUl9PUFRJT05TKVtdXG5cbiAgY29uc3QgZXZlbnRzID0gcGFyc2VFdmVudHMoc291cmNlLCBwaWNrKG9wdHMsIFBBUlNFUl9PUFRfS0VZUykpXG4gIHJldHVybiBjb25zdHJ1Y3RGcm9tRXZlbnRzKGV2ZW50cywgeyAuLi5waWNrKG9wdHMsIENPTlNUUlVDVE9SX09QVF9LRVlTKSwgc291cmNlIH0pXG59XG5cbi8vIFNpZ25hdHVyZXMgd2l0aCBpdGVyYXRvciBhcmUgZGVwcmVjYXRlZC4gV2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZXh0IHZlcnNpb25zLlxuZnVuY3Rpb24gbG9hZEFsbCAoaW5wdXQ6IHN0cmluZywgb3B0aW9ucz86IExvYWRPcHRpb25zKTogdW5rbm93bltdXG5mdW5jdGlvbiBsb2FkQWxsIChpbnB1dDogc3RyaW5nLCBpdGVyYXRvcjogbnVsbCwgb3B0aW9ucz86IExvYWRPcHRpb25zKTogdW5rbm93bltdXG5mdW5jdGlvbiBsb2FkQWxsIChpbnB1dDogc3RyaW5nLCBpdGVyYXRvcjogTG9hZEFsbEl0ZXJhdG9yLCBvcHRpb25zPzogTG9hZE9wdGlvbnMpOiB2b2lkXG5mdW5jdGlvbiBsb2FkQWxsIChcbiAgaW5wdXQ6IHN0cmluZyxcbiAgaXRlcmF0b3JPck9wdGlvbnM/OiBMb2FkQWxsSXRlcmF0b3IgfCBMb2FkT3B0aW9ucyB8IG51bGwsXG4gIG9wdGlvbnM/OiBMb2FkT3B0aW9uc1xuKSB7XG4gIGxldCBpdGVyYXRvcjogTG9hZEFsbEl0ZXJhdG9yIHwgbnVsbCA9IG51bGxcblxuICBpZiAodHlwZW9mIGl0ZXJhdG9yT3JPcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaXRlcmF0b3IgPSBpdGVyYXRvck9yT3B0aW9uc1xuICB9IGVsc2UgaWYgKGl0ZXJhdG9yT3JPcHRpb25zICE9PSBudWxsICYmIHR5cGVvZiBpdGVyYXRvck9yT3B0aW9ucyA9PT0gJ29iamVjdCcpIHtcbiAgICBvcHRpb25zID0gaXRlcmF0b3JPck9wdGlvbnNcbiAgfVxuXG4gIGNvbnN0IGRvY3VtZW50cyA9IGxvYWREb2N1bWVudHMoaW5wdXQsIG9wdGlvbnMpXG5cbiAgaWYgKGl0ZXJhdG9yID09PSBudWxsKSByZXR1cm4gZG9jdW1lbnRzXG4gIGZvciAoY29uc3QgZG9jdW1lbnQgb2YgZG9jdW1lbnRzKSBpdGVyYXRvcihkb2N1bWVudClcbn1cblxuZnVuY3Rpb24gbG9hZCAoaW5wdXQ6IHN0cmluZywgb3B0aW9ucz86IExvYWRPcHRpb25zKSB7XG4gIGNvbnN0IGRvY3VtZW50cyA9IGxvYWREb2N1bWVudHMoaW5wdXQsIG9wdGlvbnMpXG5cbiAgaWYgKGRvY3VtZW50cy5sZW5ndGggPT09IDApIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKCdleHBlY3RlZCBhIGRvY3VtZW50LCBidXQgdGhlIGlucHV0IGlzIGVtcHR5JylcbiAgaWYgKGRvY3VtZW50cy5sZW5ndGggPT09IDEpIHJldHVybiBkb2N1bWVudHNbMF1cblxuICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignZXhwZWN0ZWQgYSBzaW5nbGUgZG9jdW1lbnQgaW4gdGhlIHN0cmVhbSwgYnV0IGZvdW5kIG1vcmUnKVxufVxuXG5leHBvcnQge1xuICBsb2FkLFxuICBsb2FkQWxsLFxuICB0eXBlIExvYWRPcHRpb25zXG59XG4iLCAiLy8gUGxhaW4tb2JqZWN0IGRpc2NyaW1pbmF0ZWQgdW5pb24gc2hhcmVkIGJ5IHRoZSBkdW1wZXIgKGJ1aWx0IGJ5IGBqc1RvQXN0YCxcbi8vIHJlbmRlcmVkIGJ5IHRoZSBwcmVzZW50ZXIpIGFuZCwgbGF0ZXIsIGJ5IGxvYWQuIEJlaGF2aW91ciBsaXZlcyBpbiB0aGUgd2Fsa2Vycyxcbi8vIG5vdCBvbiB0aGUgbm9kZXMuXG5cbmltcG9ydCB7IHR5cGUgRG9jdW1lbnREaXJlY3RpdmUgfSBmcm9tICcuLi9wYXJzZXIvZXZlbnRzLnRzJ1xuXG5jbGFzcyBTdHlsZSB7XG4gIHRhZ2dlZCA9IGZhbHNlXG4gIGZsb3cgPSBmYWxzZVxuICBzaW5nbGVRdW90ZWQgPSBmYWxzZVxuICBkb3VibGVRdW90ZWQgPSBmYWxzZVxuICBsaXRlcmFsID0gZmFsc2VcbiAgZm9sZGVkID0gZmFsc2Vcbn1cblxuaW50ZXJmYWNlIE5vZGVCYXNlIHtcbiAgLy8gWUFNTCB0YWcuIFVudGFnZ2VkIG5vZGVzIGNhcnJ5IHRoZSBzZW1hbnRpYyByZXNvbHZlZCB0YWc7IHRhZ2dlZCBub2RlcyBjYXJyeVxuICAvLyB0aGUgcHJpbnRhYmxlL3ZlcmJhdGltIHRhZyBzcGVsbGluZy5cbiAgdGFnOiBzdHJpbmdcbiAgc3R5bGU6IFN0eWxlXG4gIGFuY2hvcj86IHN0cmluZ1xuXG4gIC8vIFJlc2VydmVkIGZvciB0aGUgZm9ybWF0dGluZyBsYXllcjsgbm90IHBvcHVsYXRlZCBieSB0aGUgZHVtcGVyIHlldC5cbiAgY29tbWVudEJlZm9yZT86IHN0cmluZ1xuICBjb21tZW50Pzogc3RyaW5nXG4gIGNvbW1lbnRBZnRlcj86IHN0cmluZ1xuICBibGFua0JlZm9yZT86IG51bWJlclxufVxuXG5pbnRlcmZhY2UgU2NhbGFyTm9kZSBleHRlbmRzIE5vZGVCYXNlIHtcbiAga2luZDogJ3NjYWxhcidcbiAgdmFsdWU6IHN0cmluZ1xufVxuXG5pbnRlcmZhY2UgU2VxdWVuY2VOb2RlIGV4dGVuZHMgTm9kZUJhc2Uge1xuICBraW5kOiAnc2VxdWVuY2UnXG4gIGl0ZW1zOiBOb2RlW11cbn1cblxuaW50ZXJmYWNlIE1hcHBpbmdOb2RlIGV4dGVuZHMgTm9kZUJhc2Uge1xuICBraW5kOiAnbWFwcGluZydcbiAgaXRlbXM6IEFycmF5PHsga2V5OiBOb2RlLCB2YWx1ZTogTm9kZSB9PlxufVxuXG5pbnRlcmZhY2UgQWxpYXNOb2RlIGV4dGVuZHMgTm9kZUJhc2Uge1xuICBraW5kOiAnYWxpYXMnXG4gIC8vIFRoZSBhbmNob3IgbmFtZSB0aGlzIGFsaWFzIHBvaW50cyBhdCAoYCpuYW1lYCkuXG4gIGFuY2hvcjogc3RyaW5nXG59XG5cbnR5cGUgTm9kZSA9IFNjYWxhck5vZGUgfCBTZXF1ZW5jZU5vZGUgfCBNYXBwaW5nTm9kZSB8IEFsaWFzTm9kZVxuXG4vLyBUaGUgbGF5ZXIgYWJvdmUgYE5vZGVgOiBlYWNoIGRvY3VtZW50IHdyYXBzIG9uZSBjb250ZW50IG5vZGUgcGx1cyBpdHMgb3duXG4vLyBtYXJrZXJzL2RpcmVjdGl2ZXMuIE5vdCBhIG1lbWJlciBvZiBgTm9kZWAg4oCUIHRoZSBmaWVsZHMgZGlmZmVyLiBEb2N1bWVudFxuLy8gZGlyZWN0aXZlcyBhcmUgb3JkZXJlZCBwcmVzZW50YXRpb24gZGF0YS5cbmludGVyZmFjZSBEb2N1bWVudCB7XG4gIGNvbnRlbnRzOiBOb2RlIHwgbnVsbCAgICAgICAgICAgIC8vIG51bGwgPSBlbXB0eSBkb2N1bWVudFxuICBleHBsaWNpdFN0YXJ0PzogYm9vbGVhbiAgICAgICAgICAvLyBwcmludCAnLS0tJ1xuICBleHBsaWNpdEVuZD86IGJvb2xlYW4gICAgICAgICAgICAvLyBwcmludCAnLi4uJ1xuICBkaXJlY3RpdmVzOiBEb2N1bWVudERpcmVjdGl2ZVtdXG59XG5cbmV4cG9ydCB7XG4gIFN0eWxlLFxuXG4gIHR5cGUgTm9kZSxcbiAgdHlwZSBEb2N1bWVudCxcbiAgdHlwZSBOb2RlQmFzZSxcbiAgdHlwZSBTY2FsYXJOb2RlLFxuICB0eXBlIFNlcXVlbmNlTm9kZSxcbiAgdHlwZSBNYXBwaW5nTm9kZSxcbiAgdHlwZSBBbGlhc05vZGVcbn1cbiIsICIvLyBKUyB2YWx1ZSBncmFwaCDihpIgQVNULiBLbm93cyB0YWdzIChgaWRlbnRpZnlgIC8gYHJlcHJlc2VudGApLiBBIHNpbmdsZVxuLy8gaWRlbnRpdHktYE1hcGAgd2FsayBoYW5kbGVzIGRlZHVwOiBhIHJlcGVhdCBvY2N1cnJlbmNlIG9mIGFuIG9iamVjdCAoaW5jbHVkaW5nXG4vLyBhIGN5Y2xlKSBiZWNvbWVzIGFuIGBhbGlhc2AsIGFuZCB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBnZXRzIGFuIGBhbmNob3JgLlxuXG5pbXBvcnQgeyBZQU1MRXhjZXB0aW9uIH0gZnJvbSAnLi4vY29tbW9uL2V4Y2VwdGlvbi50cydcbmltcG9ydCB7IHR5cGUgU2NoZW1hIH0gZnJvbSAnLi4vc2NoZW1hLnRzJ1xuaW1wb3J0IHsgdHlwZSBUYWdEZWZpbml0aW9uIH0gZnJvbSAnLi4vdGFnLnRzJ1xuaW1wb3J0IHsgdGFnTmFtZVNob3J0IH0gZnJvbSAnLi4vY29tbW9uL3RhZ25hbWUudHMnXG5pbXBvcnQge1xuICBTdHlsZSxcbiAgdHlwZSBEb2N1bWVudCxcbiAgdHlwZSBOb2RlLFxuICB0eXBlIFNjYWxhck5vZGUsXG4gIHR5cGUgU2VxdWVuY2VOb2RlLFxuICB0eXBlIE1hcHBpbmdOb2RlXG59IGZyb20gJy4vbm9kZXMudHMnXG5cbmludGVyZmFjZSBGcm9tSnNPcHRpb25zIHtcbiAgbm9SZWZzPzogYm9vbGVhblxuICBza2lwSW52YWxpZD86IGJvb2xlYW5cbn1cblxuLy8gQSBtYXRjaCBjYW5kaWRhdGUuIGBpbXBsaWNpdFRhZ2AgbWVhbnMgdGhlIHRhZyBpcyBub3QgcHJpbnRlZCAoaW1wbGljaXRcbi8vIHNjYWxhcnMgYW5kIHRoZSBkZWZhdWx0IHN0ci9zZXEvbWFwIHRhZ3MpLlxuaW50ZXJmYWNlIFJlcHJlc2VudFR5cGUge1xuICB0YWc6IFRhZ0RlZmluaXRpb25cbiAgaW1wbGljaXRUYWc6IGJvb2xlYW5cbn1cblxuLy8gUmV0dXJuZWQgYnkgYGJ1aWxkYCB3aGVuIG5vIHRhZyBtYXRjaGVkLlxuY29uc3QgSU5WQUxJRCA9IFN5bWJvbCgnSU5WQUxJRCcpXG5cbmludGVyZmFjZSBGcm9tSnNTdGF0ZSB7XG4gIHJlcHJlc2VudFR5cGVzOiBSZXByZXNlbnRUeXBlW11cbiAgbm9SZWZzOiBib29sZWFuXG4gIHNraXBJbnZhbGlkOiBib29sZWFuXG5cbiAgLy8gQWxyZWFkeS1idWlsdCBjb2xsZWN0aW9uIHZhbHVlcyDihpIgdGhlaXIgbm9kZSwgZm9yIGFuY2hvci9hbGlhcyBkZWR1cC5cbiAgcmVmczogTWFwPHVua25vd24sIE5vZGU+XG4gIHJlZkNvdW50ZXI6IG51bWJlclxufVxuXG5mdW5jdGlvbiBidWlsZFJlcHJlc2VudFR5cGVzIChzY2hlbWE6IFNjaGVtYSk6IFJlcHJlc2VudFR5cGVbXSB7XG4gIGNvbnN0IGRlZmF1bHRUYWdzID0gbmV3IFNldDxUYWdEZWZpbml0aW9uPihbXG4gICAgc2NoZW1hLmRlZmF1bHRTY2FsYXJUYWcsXG4gICAgc2NoZW1hLmRlZmF1bHRTZXF1ZW5jZVRhZyxcbiAgICBzY2hlbWEuZGVmYXVsdE1hcHBpbmdUYWdcbiAgXS5maWx0ZXIoKHQpOiB0IGlzIFRhZ0RlZmluaXRpb24gPT4gdCAhPT0gdW5kZWZpbmVkKSlcblxuICAvLyBEZWZhdWx0IGNvbnRhaW5lci9zdHIgdGFncyBnbyBsYXN0IHNvIGEgbW9yZSBzcGVjaWZpYyB0YWcgaWRlbnRpZnlpbmcgdGhlXG4gIC8vIHNhbWUgSlMgdmFsdWUgKGUuZy4gYSBjdXN0b20gdGFnIG9uIGEgcGxhaW4gb2JqZWN0KSB3aW5zLlxuICBjb25zdCBpbXBsaWNpdFNjYWxhcnMgPSBzY2hlbWEuaW1wbGljaXRTY2FsYXJUYWdzXG4gIGNvbnN0IGV4cGxpY2l0VGFncyA9IHNjaGVtYS50YWdzLmZpbHRlcih0ID0+XG4gICAgISh0Lm5vZGVLaW5kID09PSAnc2NhbGFyJyAmJiB0LmltcGxpY2l0KSAmJiAhZGVmYXVsdFRhZ3MuaGFzKHQpKVxuICBjb25zdCBkZWZhdWx0VGFnc0xhc3QgPSBzY2hlbWEudGFncy5maWx0ZXIodCA9PiBkZWZhdWx0VGFncy5oYXModCkpXG5cbiAgcmV0dXJuIFtcbiAgICAuLi5pbXBsaWNpdFNjYWxhcnMubWFwKHRhZyA9PiAoeyB0YWcsIGltcGxpY2l0VGFnOiB0cnVlIH0pKSxcbiAgICAuLi5leHBsaWNpdFRhZ3MubWFwKHRhZyA9PiAoeyB0YWcsIGltcGxpY2l0VGFnOiBmYWxzZSB9KSksXG4gICAgLi4uZGVmYXVsdFRhZ3NMYXN0Lm1hcCh0YWcgPT4gKHsgdGFnLCBpbXBsaWNpdFRhZzogdHJ1ZSB9KSlcbiAgXVxufVxuXG4vLyBGaXJzdCB0YWcgd2hvc2UgYGlkZW50aWZ5YCBhY2NlcHRzIGBvYmplY3RgLlxuZnVuY3Rpb24gbWF0Y2hUYWcgKHN0YXRlOiBGcm9tSnNTdGF0ZSwgb2JqZWN0OiB1bmtub3duKTogeyB0YWc6IFRhZ0RlZmluaXRpb24sIHRhZ05hbWU6IHN0cmluZywgaW1wbGljaXRUYWc6IGJvb2xlYW4gfSB8IG51bGwge1xuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IHN0YXRlLnJlcHJlc2VudFR5cGVzLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCB7IHRhZywgaW1wbGljaXRUYWcgfSA9IHN0YXRlLnJlcHJlc2VudFR5cGVzW2luZGV4XVxuXG4gICAgaWYgKHRhZy5pZGVudGlmeSAmJiB0YWcuaWRlbnRpZnkob2JqZWN0KSkge1xuICAgICAgbGV0IHRhZ05hbWU6IHN0cmluZ1xuICAgICAgaWYgKHRhZy5tYXRjaEJ5VGFnUHJlZml4ICYmIHRhZy5yZXByZXNlbnRUYWdOYW1lKSB7XG4gICAgICAgIHRhZ05hbWUgPSB0YWcucmVwcmVzZW50VGFnTmFtZShvYmplY3QpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0YWdOYW1lID0gdGFnLnRhZ05hbWVcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IHRhZywgdGFnTmFtZSwgaW1wbGljaXRUYWcgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsXG59XG5cbi8vIEJ1aWxkIGEgbm9kZSBmb3IgYG9iamVjdGAsIG9yIElOVkFMSUQgd2hlbiBubyB0YWcgbWF0Y2hlcy4gYHVuZGVmaW5lZGAgbmV2ZXJcbi8vIHRocm93cyAoY2FsbGVyIGRlY2lkZXM6IG51bGwgaW4gYSBzZXF1ZW5jZSwgc2tpcCBpbiBhIG1hcHBpbmcsICcnIGF0IHJvb3QpO1xuLy8gYW55IG90aGVyIHVucmVwcmVzZW50YWJsZSB2YWx1ZSB0aHJvd3MgdW5sZXNzIGBza2lwSW52YWxpZGAuXG5mdW5jdGlvbiBidWlsZCAoc3RhdGU6IEZyb21Kc1N0YXRlLCBvYmplY3Q6IHVua25vd24pOiBOb2RlIHwgdHlwZW9mIElOVkFMSUQge1xuICBpZiAoIXN0YXRlLm5vUmVmcyAmJiBvYmplY3QgIT09IG51bGwgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcpIHtcbiAgICBjb25zdCBleGlzdGluZyA9IHN0YXRlLnJlZnMuZ2V0KG9iamVjdClcbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgIGlmIChleGlzdGluZy5hbmNob3IgPT09IHVuZGVmaW5lZCkgZXhpc3RpbmcuYW5jaG9yID0gYHJlZl8ke3N0YXRlLnJlZkNvdW50ZXIrK31gXG4gICAgICByZXR1cm4geyBraW5kOiAnYWxpYXMnLCB0YWc6ICcnLCBzdHlsZTogbmV3IFN0eWxlKCksIGFuY2hvcjogZXhpc3RpbmcuYW5jaG9yIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBtYXRjaGVkID0gbWF0Y2hUYWcoc3RhdGUsIG9iamVjdClcblxuICBpZiAoIW1hdGNoZWQpIHtcbiAgICBpZiAob2JqZWN0ID09PSB1bmRlZmluZWQpIHJldHVybiBJTlZBTElEXG4gICAgaWYgKHN0YXRlLnNraXBJbnZhbGlkKSByZXR1cm4gSU5WQUxJRFxuICAgIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKGB1bmFjY2VwdGFibGUga2luZCBvZiBhbiBvYmplY3QgdG8gZHVtcCAke09iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpfWApXG4gIH1cblxuICBjb25zdCB7IHRhZywgdGFnTmFtZSwgaW1wbGljaXRUYWcgfSA9IG1hdGNoZWRcbiAgY29uc3Qgbm9kZVRhZ05hbWUgPSBpbXBsaWNpdFRhZyA/IHRhZ05hbWUgOiB0YWdOYW1lU2hvcnQodGFnTmFtZSlcblxuICBpZiAodGFnLm5vZGVLaW5kID09PSAnc2NhbGFyJykge1xuICAgIGNvbnN0IHN0eWxlID0gbmV3IFN0eWxlKClcbiAgICBzdHlsZS50YWdnZWQgPSAhaW1wbGljaXRUYWdcbiAgICBjb25zdCBub2RlOiBTY2FsYXJOb2RlID0ge1xuICAgICAga2luZDogJ3NjYWxhcicsXG4gICAgICB0YWc6IG5vZGVUYWdOYW1lLFxuICAgICAgc3R5bGUsXG4gICAgICB2YWx1ZTogdGFnLnJlcHJlc2VudChvYmplY3QpXG4gICAgfVxuICAgIHJldHVybiBub2RlXG4gIH1cblxuICBpZiAodGFnLm5vZGVLaW5kID09PSAnc2VxdWVuY2UnKSB7XG4gICAgY29uc3QgY29udGFpbmVyID0gdGFnLnJlcHJlc2VudChvYmplY3QpXG4gICAgY29uc3Qgc3R5bGUgPSBuZXcgU3R5bGUoKVxuICAgIHN0eWxlLnRhZ2dlZCA9ICFpbXBsaWNpdFRhZ1xuICAgIGNvbnN0IG5vZGU6IFNlcXVlbmNlTm9kZSA9IHsga2luZDogJ3NlcXVlbmNlJywgdGFnOiBub2RlVGFnTmFtZSwgc3R5bGUsIGl0ZW1zOiBbXSB9XG4gICAgaWYgKCFzdGF0ZS5ub1JlZnMpIHN0YXRlLnJlZnMuc2V0KG9iamVjdCwgbm9kZSlcblxuICAgIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gY29udGFpbmVyLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICAgIGxldCBpdGVtID0gYnVpbGQoc3RhdGUsIGNvbnRhaW5lcltpbmRleF0pXG4gICAgICAvLyBBbiBpbnZhbGlkIGVsZW1lbnQgYmVjb21lcyBudWxsOyBhIHN0aWxsLWludmFsaWQgbnVsbCB0aGVuIHNraXBzL3Rocm93cy5cbiAgICAgIGlmIChpdGVtID09PSBJTlZBTElEICYmIGNvbnRhaW5lcltpbmRleF0gPT09IHVuZGVmaW5lZCkgaXRlbSA9IGJ1aWxkKHN0YXRlLCBudWxsKVxuICAgICAgaWYgKGl0ZW0gPT09IElOVkFMSUQpIGNvbnRpbnVlXG4gICAgICBub2RlLml0ZW1zLnB1c2goaXRlbSlcbiAgICB9XG4gICAgcmV0dXJuIG5vZGVcbiAgfVxuXG4gIC8vIG1hcHBpbmcg4oCUIHRoZSBjYW5vbmljYWwgZm9ybSBpcyBhbHdheXMgYSBgTWFwYC5cbiAgY29uc3QgbWFwID0gdGFnLnJlcHJlc2VudChvYmplY3QpXG4gIGNvbnN0IHN0eWxlID0gbmV3IFN0eWxlKClcbiAgc3R5bGUudGFnZ2VkID0gIWltcGxpY2l0VGFnXG4gIGNvbnN0IG5vZGU6IE1hcHBpbmdOb2RlID0geyBraW5kOiAnbWFwcGluZycsIHRhZzogbm9kZVRhZ05hbWUsIHN0eWxlLCBpdGVtczogW10gfVxuICBpZiAoIXN0YXRlLm5vUmVmcykgc3RhdGUucmVmcy5zZXQob2JqZWN0LCBub2RlKVxuXG4gIGZvciAoY29uc3QgW29iamVjdEtleSwgb2JqZWN0VmFsdWVdIG9mIG1hcCkge1xuICAgIGNvbnN0IGtleSA9IGJ1aWxkKHN0YXRlLCBvYmplY3RLZXkpXG4gICAgaWYgKGtleSA9PT0gSU5WQUxJRCkgY29udGludWUgLy8gaW52YWxpZCBrZXkgc2tpcHMgdGhlIHBhaXJcbiAgICBjb25zdCB2YWx1ZSA9IGJ1aWxkKHN0YXRlLCBvYmplY3RWYWx1ZSlcbiAgICBpZiAodmFsdWUgPT09IElOVkFMSUQpIGNvbnRpbnVlIC8vIGludmFsaWQgdmFsdWUgc2tpcHMgdGhlIHBhaXJcbiAgICBub2RlLml0ZW1zLnB1c2goeyBrZXksIHZhbHVlIH0pXG4gIH1cbiAgcmV0dXJuIG5vZGVcbn1cblxuLy8gQSBKUyB2YWx1ZSBpcyBvbmUgWUFNTCBkb2N1bWVudC4gQW4gdW5yZXByZXNlbnRhYmxlIHJvb3QgYmVjb21lcyBhbiBlbXB0eVxuLy8gZG9jdW1lbnQsIHdoaWNoIHRoZSBwcmVzZW50ZXIgcmVuZGVycyBhcyBhbiBlbXB0eSBzdHJpbmcuXG5mdW5jdGlvbiBqc1RvQXN0IChpbnB1dDogdW5rbm93biwgc2NoZW1hOiBTY2hlbWEsIG9wdGlvbnM6IEZyb21Kc09wdGlvbnMgPSB7fSk6IERvY3VtZW50W10ge1xuICBjb25zdCBzdGF0ZTogRnJvbUpzU3RhdGUgPSB7XG4gICAgcmVwcmVzZW50VHlwZXM6IGJ1aWxkUmVwcmVzZW50VHlwZXMoc2NoZW1hKSxcbiAgICBub1JlZnM6IG9wdGlvbnMubm9SZWZzID8/IGZhbHNlLFxuICAgIHNraXBJbnZhbGlkOiBvcHRpb25zLnNraXBJbnZhbGlkID8/IGZhbHNlLFxuICAgIHJlZnM6IG5ldyBNYXAoKSxcbiAgICByZWZDb3VudGVyOiAwXG4gIH1cblxuICBjb25zdCByb290ID0gYnVpbGQoc3RhdGUsIGlucHV0KVxuICByZXR1cm4gW3sgY29udGVudHM6IHJvb3QgPT09IElOVkFMSUQgPyBudWxsIDogcm9vdCwgZGlyZWN0aXZlczogW10gfV1cbn1cblxuZXhwb3J0IHtcbiAganNUb0FzdCxcbiAgdHlwZSBGcm9tSnNPcHRpb25zXG59XG4iLCAiLy8gRGVwdGgtZmlyc3QgQVNUIHRyYXZlcnNhbC4gTWlycm9ycyB0aGUgYGtpbmRgIHdhbGsgb2YgdGhlIHByZXNlbnRlciBhbmQgdGhlXG4vLyBgZnJvbV8qYCBidWlsZGVycywgYnV0IHN0YXlzIHJlYWQtb3JpZW50ZWQ6IG5vZGVzIGFyZSBwbGFpbiBvYmplY3RzLCBzbyBhXG4vLyB2aXNpdG9yIG11dGF0ZXMgdGhlbSBpbiBwbGFjZS4gQ29udHJvbCBzaWduYWxzIGxldCBpdCBwcnVuZSBvciBzdG9wIHRoZSB3YWxrLlxuXG5pbXBvcnQge1xuICB0eXBlIE5vZGUsXG4gIHR5cGUgRG9jdW1lbnRcbn0gZnJvbSAnLi9ub2Rlcy50cydcblxuLy8gUmV0dXJuZWQgYnkgYSB2aXNpdG9yIHRvIGNvbnRyb2wgdGhlIHdhbGs7IGFueXRoaW5nIGVsc2UgKGluY2wuIGB1bmRlZmluZWRgKVxuLy8gZGVzY2VuZHMgYXMgdXN1YWwuXG5jb25zdCBWSVNJVF9CUkVBSyA9IFN5bWJvbCgndmlzaXQ6YnJlYWsnKSAvLyBzdG9wIHRoZSB3aG9sZSB0cmF2ZXJzYWxcbmNvbnN0IFZJU0lUX1NLSVAgPSBTeW1ib2woJ3Zpc2l0OnNraXAnKSAgIC8vIGRvbid0IGRlc2NlbmQgaW50byB0aGlzIG5vZGUncyBjaGlsZHJlblxuXG50eXBlIFZpc2l0Q29udHJvbCA9IHR5cGVvZiBWSVNJVF9CUkVBSyB8IHR5cGVvZiBWSVNJVF9TS0lQIHwgdW5kZWZpbmVkIHwgdm9pZFxuXG4vLyBUcmF2ZXJzYWwtZGVyaXZlZCBwb3NpdGlvbiBvZiB0aGUgY3VycmVudCBub2RlLiBLZXB0IG9mZiB0aGUgbm9kZSBpdHNlbGY6IGFcbi8vIG5vZGUgbWF5IHNpdCBpbiBzZXZlcmFsIHBsYWNlcyAoYWxpYXMvZGVkdXAgcmV1c2UpLCBzbyBkZXB0aC9yb2xlIGJlbG9uZyB0b1xuLy8gdGhlIHdhbGssIG5vdCB0aGUgbm9kZS4gYHBhcmVudC5raW5kYCArIGBpc0tleWAgcGluIHRoZSBleGFjdCBzbG90LlxuaW50ZXJmYWNlIFZpc2l0Q29udGV4dCB7XG4gIGRlcHRoOiBudW1iZXIgICAgICAgIC8vIDAgPSBkb2N1bWVudCBjb250ZW50IHJvb3RcbiAgcGFyZW50OiBOb2RlIHwgbnVsbCAgLy8gZW5jbG9zaW5nIHNlcXVlbmNlL21hcHBpbmcsIG51bGwgYXQgdGhlIHJvb3RcbiAgaXNLZXk6IGJvb2xlYW4gICAgICAgLy8gbm9kZSBzaXRzIGluIGEgbWFwcGluZyBrZXkgcG9zaXRpb25cbn1cblxudHlwZSBWaXNpdG9yID0gKG5vZGU6IE5vZGUsIGN0eDogVmlzaXRDb250ZXh0KSA9PiBWaXNpdENvbnRyb2xcblxuLy8gUmV0dXJucyBgdHJ1ZWAgb25jZSBgVklTSVRfQlJFQUtgIHdhcyBzZWVuLCBzbyBjYWxsZXJzIGNhbiB1bndpbmQgdGhlIHdhbGsuXG5mdW5jdGlvbiB2aXNpdE5vZGUgKG5vZGU6IE5vZGUsIHZpc2l0b3I6IFZpc2l0b3IsIGN0eDogVmlzaXRDb250ZXh0KTogYm9vbGVhbiB7XG4gIGNvbnN0IGNvbnRyb2wgPSB2aXNpdG9yKG5vZGUsIGN0eClcbiAgaWYgKGNvbnRyb2wgPT09IFZJU0lUX0JSRUFLKSByZXR1cm4gdHJ1ZVxuICBpZiAoY29udHJvbCA9PT0gVklTSVRfU0tJUCkgcmV0dXJuIGZhbHNlXG5cbiAgY29uc3QgZGVwdGggPSBjdHguZGVwdGggKyAxXG5cbiAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICBjYXNlICdzZXF1ZW5jZSc6XG4gICAgICBmb3IgKGNvbnN0IGl0ZW0gb2Ygbm9kZS5pdGVtcykge1xuICAgICAgICBpZiAodmlzaXROb2RlKGl0ZW0sIHZpc2l0b3IsIHsgZGVwdGgsIHBhcmVudDogbm9kZSwgaXNLZXk6IGZhbHNlIH0pKSByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdtYXBwaW5nJzpcbiAgICAgIGZvciAoY29uc3QgeyBrZXksIHZhbHVlIH0gb2Ygbm9kZS5pdGVtcykge1xuICAgICAgICBpZiAodmlzaXROb2RlKGtleSwgdmlzaXRvciwgeyBkZXB0aCwgcGFyZW50OiBub2RlLCBpc0tleTogdHJ1ZSB9KSkgcmV0dXJuIHRydWVcbiAgICAgICAgaWYgKHZpc2l0Tm9kZSh2YWx1ZSwgdmlzaXRvciwgeyBkZXB0aCwgcGFyZW50OiBub2RlLCBpc0tleTogZmFsc2UgfSkpIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBicmVha1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8vIFdhbGsgZXZlcnkgbm9kZSBpbiB0aGUgZG9jdW1lbnRzLCBjYWxsaW5nIGB2aXNpdG9yYCBvbmNlIHBlciBub2RlIChwcmUtb3JkZXIpLlxuZnVuY3Rpb24gdmlzaXQgKGRvY3VtZW50czogRG9jdW1lbnRbXSwgdmlzaXRvcjogVmlzaXRvcik6IHZvaWQge1xuICBmb3IgKGNvbnN0IGRvYyBvZiBkb2N1bWVudHMpIHtcbiAgICBpZiAoZG9jLmNvbnRlbnRzICYmIHZpc2l0Tm9kZShkb2MuY29udGVudHMsIHZpc2l0b3IsIHsgZGVwdGg6IDAsIHBhcmVudDogbnVsbCwgaXNLZXk6IGZhbHNlIH0pKSByZXR1cm5cbiAgfVxufVxuXG5leHBvcnQge1xuICB2aXNpdCxcbiAgVklTSVRfQlJFQUssXG4gIFZJU0lUX1NLSVAsXG4gIHR5cGUgVmlzaXRvcixcbiAgdHlwZSBWaXNpdENvbnRleHRcbn1cbiIsICIvLyBBU1Qg4oaSIHRleHQuIFdhbGtzIHRoZSBub2RlIGBraW5kYDsgdGhlIHNjYWxhciBtYWNoaW5lcnkgKHN0eWxlIHNlbGVjdGlvbixcbi8vIHF1b3RpbmcsIGZvbGRpbmcpIGlzIGRyaXZlbiBieSBub2RlIHRleHQsIG5vdCBieSBzbmlmZmluZyBhIEpTIHZhbHVlLlxuXG5pbXBvcnQgeyBZQU1MRXhjZXB0aW9uIH0gZnJvbSAnLi4vY29tbW9uL2V4Y2VwdGlvbi50cydcbmltcG9ydCB7IHRhZ05hbWVTaG9ydCB9IGZyb20gJy4uL2NvbW1vbi90YWduYW1lLnRzJ1xuaW1wb3J0IHsgdHlwZSBTY2hlbWEgfSBmcm9tICcuLi9zY2hlbWEudHMnXG5pbXBvcnQgeyBOT1RfUkVTT0xWRUQsIHR5cGUgU2NhbGFyVGFnRGVmaW5pdGlvbiB9IGZyb20gJy4uL3RhZy50cydcbmltcG9ydCB7XG4gIHR5cGUgTm9kZSxcbiAgdHlwZSBEb2N1bWVudCxcbiAgdHlwZSBTY2FsYXJOb2RlLFxuICB0eXBlIFNlcXVlbmNlTm9kZSxcbiAgdHlwZSBNYXBwaW5nTm9kZVxufSBmcm9tICcuL25vZGVzLnRzJ1xuXG5jb25zdCBDSEFSX0JPTSA9IDB4RkVGRlxuY29uc3QgQ0hBUl9UQUIgPSAweDA5IC8qIFRhYiAqL1xuY29uc3QgQ0hBUl9MSU5FX0ZFRUQgPSAweDBBIC8qIExGICovXG5jb25zdCBDSEFSX0NBUlJJQUdFX1JFVFVSTiA9IDB4MEQgLyogQ1IgKi9cbmNvbnN0IENIQVJfU1BBQ0UgPSAweDIwIC8qIFNwYWNlICovXG5jb25zdCBDSEFSX0VYQ0xBTUFUSU9OID0gMHgyMSAvKiAhICovXG5jb25zdCBDSEFSX0RPVUJMRV9RVU9URSA9IDB4MjIgLyogXCIgKi9cbmNvbnN0IENIQVJfU0hBUlAgPSAweDIzIC8qICMgKi9cbmNvbnN0IENIQVJfUEVSQ0VOVCA9IDB4MjUgLyogJSAqL1xuY29uc3QgQ0hBUl9BTVBFUlNBTkQgPSAweDI2IC8qICYgKi9cbmNvbnN0IENIQVJfU0lOR0xFX1FVT1RFID0gMHgyNyAvKiAnICovXG5jb25zdCBDSEFSX0FTVEVSSVNLID0gMHgyQSAvKiAqICovXG5jb25zdCBDSEFSX0NPTU1BID0gMHgyQyAvKiAsICovXG5jb25zdCBDSEFSX01JTlVTID0gMHgyRCAvKiAtICovXG5jb25zdCBDSEFSX0NPTE9OID0gMHgzQSAvKiA6ICovXG5jb25zdCBDSEFSX0VRVUFMUyA9IDB4M0QgLyogPSAqL1xuY29uc3QgQ0hBUl9HUkVBVEVSX1RIQU4gPSAweDNFIC8qID4gKi9cbmNvbnN0IENIQVJfUVVFU1RJT04gPSAweDNGIC8qID8gKi9cbmNvbnN0IENIQVJfQ09NTUVSQ0lBTF9BVCA9IDB4NDAgLyogQCAqL1xuY29uc3QgQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VUID0gMHg1QiAvKiBbICovXG5jb25zdCBDSEFSX1JJR0hUX1NRVUFSRV9CUkFDS0VUID0gMHg1RCAvKiBdICovXG5jb25zdCBDSEFSX0dSQVZFX0FDQ0VOVCA9IDB4NjAgLyogYCAqL1xuY29uc3QgQ0hBUl9MRUZUX0NVUkxZX0JSQUNLRVQgPSAweDdCIC8qIHsgKi9cbmNvbnN0IENIQVJfVkVSVElDQUxfTElORSA9IDB4N0MgLyogfCAqL1xuY29uc3QgQ0hBUl9SSUdIVF9DVVJMWV9CUkFDS0VUID0gMHg3RCAvKiB9ICovXG5cbmNvbnN0IEVTQ0FQRV9TRVFVRU5DRVM6IFJlY29yZDxudW1iZXIsIHN0cmluZz4gPSB7fVxuXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MDBdID0gJ1xcXFwwJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDA3XSA9ICdcXFxcYSdcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwOF0gPSAnXFxcXGInXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MDldID0gJ1xcXFx0J1xuRVNDQVBFX1NFUVVFTkNFU1sweDBBXSA9ICdcXFxcbidcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwQl0gPSAnXFxcXHYnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MENdID0gJ1xcXFxmJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDBEXSA9ICdcXFxccidcbkVTQ0FQRV9TRVFVRU5DRVNbMHgxQl0gPSAnXFxcXGUnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MjJdID0gJ1xcXFxcIidcbkVTQ0FQRV9TRVFVRU5DRVNbMHg1Q10gPSAnXFxcXFxcXFwnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4ODVdID0gJ1xcXFxOJ1xuRVNDQVBFX1NFUVVFTkNFU1sweEEwXSA9ICdcXFxcXydcbkVTQ0FQRV9TRVFVRU5DRVNbMHgyMDI4XSA9ICdcXFxcTCdcbkVTQ0FQRV9TRVFVRU5DRVNbMHgyMDI5XSA9ICdcXFxcUCdcblxuaW50ZXJmYWNlIFByZXNlbnRlck9wdGlvbnMge1xuICBzY2hlbWE6IFNjaGVtYVxuICBpbmRlbnQ/OiBudW1iZXJcbiAgc2VxTm9JbmRlbnQ/OiBib29sZWFuXG4gIHNlcUlubGluZUZpcnN0PzogYm9vbGVhblxuICBzb3J0S2V5cz86IGJvb2xlYW4gfCAoKGE6IGFueSwgYjogYW55KSA9PiBudW1iZXIpXG4gIGxpbmVXaWR0aD86IG51bWJlclxuICBmbG93QnJhY2tldFBhZGRpbmc/OiBib29sZWFuXG4gIGZsb3dTa2lwQ29tbWFTcGFjZT86IGJvb2xlYW5cbiAgZmxvd1NraXBDb2xvblNwYWNlPzogYm9vbGVhblxuICBxdW90ZUZsb3dLZXlzPzogYm9vbGVhblxuICBxdW90ZVN0eWxlPzogJ3NpbmdsZScgfCAnZG91YmxlJ1xuICBmb3JjZVF1b3Rlcz86IGJvb2xlYW5cbiAgdGFnQmVmb3JlQW5jaG9yPzogYm9vbGVhblxufVxuXG5jb25zdCBERUZBVUxUX1BSRVNFTlRFUl9PUFRJT05TOiBSZXF1aXJlZDxPbWl0PFByZXNlbnRlck9wdGlvbnMsICdzY2hlbWEnPj4gPSB7XG4gIGluZGVudDogMixcbiAgc2VxTm9JbmRlbnQ6IGZhbHNlLFxuICBzZXFJbmxpbmVGaXJzdDogdHJ1ZSxcbiAgc29ydEtleXM6IGZhbHNlLFxuICBsaW5lV2lkdGg6IDgwLFxuICBmbG93QnJhY2tldFBhZGRpbmc6IGZhbHNlLFxuICBmbG93U2tpcENvbW1hU3BhY2U6IGZhbHNlLFxuICBmbG93U2tpcENvbG9uU3BhY2U6IGZhbHNlLFxuICBxdW90ZUZsb3dLZXlzOiBmYWxzZSxcbiAgcXVvdGVTdHlsZTogJ3NpbmdsZScsXG4gIGZvcmNlUXVvdGVzOiBmYWxzZSxcbiAgdGFnQmVmb3JlQW5jaG9yOiBmYWxzZVxufVxuXG5pbnRlcmZhY2UgUHJlc2VudGVyU3RhdGUgZXh0ZW5kcyBSZXF1aXJlZDxQcmVzZW50ZXJPcHRpb25zPiB7XG4gIGRlZmF1bHRTY2FsYXJUYWdOYW1lOiBzdHJpbmdcbiAgaW1wbGljaXRSZXNvbHZlcnM6IHJlYWRvbmx5IFNjYWxhclRhZ0RlZmluaXRpb25bXVxufVxuXG5mdW5jdGlvbiBub2RlVGFnU2hvcnQgKG5vZGU6IE5vZGUpIHtcbiAgcmV0dXJuIG5vZGUuc3R5bGUudGFnZ2VkID8gbm9kZS50YWcgOiB0YWdOYW1lU2hvcnQobm9kZS50YWcpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVByZXNlbnRlclN0YXRlIChvcHRpb25zOiBQcmVzZW50ZXJPcHRpb25zKTogUHJlc2VudGVyU3RhdGUge1xuICBjb25zdCBvcHRzID0ge1xuICAgIC4uLkRFRkFVTFRfUFJFU0VOVEVSX09QVElPTlMsXG4gICAgLi4ub3B0aW9uc1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5vcHRzLFxuICAgIGRlZmF1bHRTY2FsYXJUYWdOYW1lOiBvcHRzLnNjaGVtYS5kZWZhdWx0U2NhbGFyVGFnLnRhZ05hbWUsXG4gICAgaW1wbGljaXRSZXNvbHZlcnM6IG9wdHMuc2NoZW1hLmltcGxpY2l0U2NhbGFyVGFnc1xuICB9XG59XG5cbmZ1bmN0aW9uIGVuY29kZU5vblByaW50YWJsZSAoY2hhcmFjdGVyOiBudW1iZXIpIHtcbiAgLy8gWUFNTCBub24tcHJpbnRhYmxlIGNvZGUgcG9pbnRzIGFyZSBhbGwgaW4gQk1QIChtYXggRkZGRik7XG4gIC8vIGFzdHJhbCBjb2RlIHBvaW50cyBhcmUgcHJpbnRhYmxlIGFuZCBjYW4ndCBjb21lIGhlcmUuXG4gIGNvbnN0IHN0cmluZyA9IGNoYXJhY3Rlci50b1N0cmluZygxNikudG9VcHBlckNhc2UoKVxuICBjb25zdCBoYW5kbGUgPSBjaGFyYWN0ZXIgPD0gMHhGRiA/ICd4JyA6ICd1J1xuICBjb25zdCBsZW5ndGggPSBjaGFyYWN0ZXIgPD0gMHhGRiA/IDIgOiA0XG5cbiAgcmV0dXJuIGBcXFxcJHtoYW5kbGV9JHsnMCcucmVwZWF0KGxlbmd0aCAtIHN0cmluZy5sZW5ndGgpfSR7c3RyaW5nfWBcbn1cblxuLy8gSW5kZW50cyBldmVyeSBsaW5lIGluIGEgc3RyaW5nLiBFbXB0eSBsaW5lcyAoXFxuIG9ubHkpIGFyZSBub3QgaW5kZW50ZWQuXG5mdW5jdGlvbiBpbmRlbnRTdHJpbmcgKHN0cmluZzogc3RyaW5nLCBzcGFjZXM6IG51bWJlcikge1xuICBjb25zdCBpbmQgPSAnICcucmVwZWF0KHNwYWNlcylcbiAgbGV0IHBvc2l0aW9uID0gMFxuICBsZXQgcmVzdWx0ID0gJydcbiAgY29uc3QgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aFxuXG4gIHdoaWxlIChwb3NpdGlvbiA8IGxlbmd0aCkge1xuICAgIGxldCBsaW5lXG4gICAgY29uc3QgbmV4dCA9IHN0cmluZy5pbmRleE9mKCdcXG4nLCBwb3NpdGlvbilcbiAgICBpZiAobmV4dCA9PT0gLTEpIHtcbiAgICAgIGxpbmUgPSBzdHJpbmcuc2xpY2UocG9zaXRpb24pXG4gICAgICBwb3NpdGlvbiA9IGxlbmd0aFxuICAgIH0gZWxzZSB7XG4gICAgICBsaW5lID0gc3RyaW5nLnNsaWNlKHBvc2l0aW9uLCBuZXh0ICsgMSlcbiAgICAgIHBvc2l0aW9uID0gbmV4dCArIDFcbiAgICB9XG5cbiAgICBpZiAobGluZS5sZW5ndGggJiYgbGluZSAhPT0gJ1xcbicpIHJlc3VsdCArPSBpbmRcblxuICAgIHJlc3VsdCArPSBsaW5lXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlTmV4dExpbmUgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgbGV2ZWw6IG51bWJlcikge1xuICByZXR1cm4gYFxcbiR7JyAnLnJlcGVhdChzdGF0ZS5pbmRlbnQgKiBsZXZlbCl9YFxufVxuXG4vLyBJbmRlbnRhdGlvbi93aWR0aCBudW1iZXJzIHRoYXQgZ292ZXJuIGhvdyBhIHNjYWxhciBsYXlzIG91dCBhdCBgbGV2ZWxgLlxuLy8gU2NhbGFyLW9ubHk6IGNvbGxlY3Rpb25zIGNvbXB1dGUgdGhlaXIgb3duIGluZGVudCB2aWEgYGdlbmVyYXRlTmV4dExpbmVgLlxuLy8gICBpbmRlbnQgICAgICAtIHNwYWNlcyBwcmVwZW5kZWQgdG8gdGhlIHNjYWxhcidzIGNvbnRlbnQgKGJsb2NrIHN0eWxlcylcbi8vICAgYmxvY2tJbmRlbnQgLSB0aGUgYmxvY2sgaW5kZW50YXRpb24gaW5kaWNhdG9yIGRpZ2l0IChgfDJgIC8gYD4yYCk7IGF0IHRoZVxuLy8gICAgICAgICAgICAgICAgIGRvY3VtZW50IHJvb3QgKGxldmVsIDApIGl0IGlzIG9uZSBncmVhdGVyIHRoYW4gdGhlIHNwYWNlcyB3ZVxuLy8gICAgICAgICAgICAgICAgIGFjdHVhbGx5IHByZXBlbmQgKHJlYWRlciBhcHBsaWVzIGl0IHJlbGF0aXZlIHRvIHBhcmVudCBuID0gLTEpXG4vLyAgIGxpbmVXaWR0aCAgIC0gZm9sZCB3aWR0aCBhdCB0aGlzIGRlcHRoLCBzaHJpbmtpbmcgbW9ub3RvbmljYWxseSB0b3dhcmRcbi8vICAgICAgICAgICAgICAgICBtaW4oc3RhdGUubGluZVdpZHRoLCA0MCkgYXMgaW5kZW50YXRpb24gZGVlcGVuczsgLTEgPSBubyBsaW1pdFxuZnVuY3Rpb24gc2NhbGFyTGF5b3V0IChzdGF0ZTogUHJlc2VudGVyU3RhdGUsIGxldmVsOiBudW1iZXIpIHtcbiAgY29uc3QgaW5kZW50ID0gc3RhdGUuaW5kZW50ICogTWF0aC5tYXgoMSwgbGV2ZWwpIC8vIG5vIDAtaW5kZW50IHNjYWxhcnNcbiAgY29uc3QgYmxvY2tJbmRlbnQgPSBsZXZlbCA9PT0gMCA/IHN0YXRlLmluZGVudCArIDEgOiBzdGF0ZS5pbmRlbnRcbiAgY29uc3QgbGluZVdpZHRoID0gKHN0YXRlLmxpbmVXaWR0aCA9PT0gLTEpXG4gICAgPyAtMVxuICAgIDogTWF0aC5tYXgoTWF0aC5taW4oc3RhdGUubGluZVdpZHRoLCA0MCksIHN0YXRlLmxpbmVXaWR0aCAtIGluZGVudClcblxuICByZXR1cm4geyBpbmRlbnQsIGJsb2NrSW5kZW50LCBsaW5lV2lkdGggfVxufVxuXG5mdW5jdGlvbiByZXNvbHZlSW1wbGljaXRUYWcgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgc3RyOiBzdHJpbmcpIHtcbiAgZm9yIChsZXQgaW5kZXggPSAwLCBsZW5ndGggPSBzdGF0ZS5pbXBsaWNpdFJlc29sdmVycy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgY29uc3QgdGFnRGVmaW5pdGlvbiA9IHN0YXRlLmltcGxpY2l0UmVzb2x2ZXJzW2luZGV4XVxuXG4gICAgaWYgKHRhZ0RlZmluaXRpb24ucmVzb2x2ZShzdHIsIGZhbHNlLCB0YWdEZWZpbml0aW9uLnRhZ05hbWUpICE9PSBOT1RfUkVTT0xWRUQpIHtcbiAgICAgIHJldHVybiB0YWdEZWZpbml0aW9uLnRhZ05hbWVcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc3RhdGUuZGVmYXVsdFNjYWxhclRhZ05hbWVcbn1cblxuLy8gWzMzXSBzLXdoaXRlIDo6PSBzLXNwYWNlIHwgcy10YWJcbmZ1bmN0aW9uIGlzV2hpdGVzcGFjZSAoYzogbnVtYmVyKSB7XG4gIHJldHVybiBjID09PSBDSEFSX1NQQUNFIHx8IGMgPT09IENIQVJfVEFCXG59XG5cbi8vIE1pcnJvcnMgcGFyc2VyLnRlc3REb2N1bWVudFNlcGFyYXRvcigpOiBgLS0tYCBhbmQgYC4uLmAgYXJlIGRvY3VtZW50XG4vLyBtYXJrZXJzIHdoZW4gZm9sbG93ZWQgYnkgc2VwYXJhdGlvbiB3aGl0ZXNwYWNlLCBhIGxpbmUgYnJlYWssIG9yIEVPRi5cbmZ1bmN0aW9uIHN0YXJ0c1dpdGhEb2N1bWVudFNlcGFyYXRvciAoc3RyaW5nOiBzdHJpbmcpIHtcbiAgY29uc3QgbWFya2VyID0gc3RyaW5nLmNoYXJDb2RlQXQoMClcblxuICBpZiAoKG1hcmtlciAhPT0gQ0hBUl9NSU5VUyAmJiBtYXJrZXIgIT09IDB4MkUvKiAuICovKSB8fFxuICAgICAgc3RyaW5nLmNoYXJDb2RlQXQoMSkgIT09IG1hcmtlciB8fCBzdHJpbmcuY2hhckNvZGVBdCgyKSAhPT0gbWFya2VyKSByZXR1cm4gZmFsc2VcblxuICBpZiAoc3RyaW5nLmxlbmd0aCA9PT0gMykgcmV0dXJuIHRydWVcblxuICBjb25zdCBmb2xsb3dpbmcgPSBzdHJpbmcuY2hhckNvZGVBdCgzKVxuICByZXR1cm4gaXNXaGl0ZXNwYWNlKGZvbGxvd2luZykgfHxcbiAgICBmb2xsb3dpbmcgPT09IENIQVJfQ0FSUklBR0VfUkVUVVJOIHx8IGZvbGxvd2luZyA9PT0gQ0hBUl9MSU5FX0ZFRURcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBjaGFyYWN0ZXIgY2FuIGJlIHByaW50ZWQgd2l0aG91dCBlc2NhcGluZy5cbi8vIEZyb20gWUFNTCAxLjI6IFwiYW55IGFsbG93ZWQgY2hhcmFjdGVycyBrbm93biB0byBiZSBub24tcHJpbnRhYmxlXG4vLyBzaG91bGQgYWxzbyBiZSBlc2NhcGVkLiBbSG93ZXZlcixdIFRoaXMgaXNu4oCZdCBtYW5kYXRvcnlcIlxuLy8gRGVyaXZlZCBmcm9tIG5iLWNoYXIgLSBcXHQgLSAjeDg1IC0gI3hBMCAtICN4MjAyOCAtICN4MjAyOS5cbmZ1bmN0aW9uIGlzUHJpbnRhYmxlIChjOiBudW1iZXIpIHtcbiAgcmV0dXJuIChjID49IDB4MDAwMjAgJiYgYyA8PSAweDAwMDA3RSkgfHxcbiAgICAoKGMgPj0gMHgwMDBBMSAmJiBjIDw9IDB4MDBEN0ZGKSAmJiBjICE9PSAweDIwMjggJiYgYyAhPT0gMHgyMDI5KSB8fFxuICAgICgoYyA+PSAweDBFMDAwICYmIGMgPD0gMHgwMEZGRkQpICYmIGMgIT09IENIQVJfQk9NKSB8fFxuICAgIChjID49IDB4MTAwMDAgJiYgYyA8PSAweDEwRkZGRilcbn1cblxuLy8gWzM0XSBucy1jaGFyIDo6PSBuYi1jaGFyIC0gcy13aGl0ZVxuLy8gWzI3XSBuYi1jaGFyIDo6PSBjLXByaW50YWJsZSAtIGItY2hhciAtIGMtYnl0ZS1vcmRlci1tYXJrXG4vLyBbMjZdIGItY2hhciAgOjo9IGItbGluZS1mZWVkIHwgYi1jYXJyaWFnZS1yZXR1cm5cbi8vIEluY2x1ZGluZyBzLXdoaXRlIChmb3Igc29tZSByZWFzb24sIGV4YW1wbGVzIGRvZXNuJ3QgbWF0Y2ggc3BlY3MgaW4gdGhpcyBhc3BlY3QpXG4vLyBucy1jaGFyIDo6PSBjLXByaW50YWJsZSAtIGItbGluZS1mZWVkIC0gYi1jYXJyaWFnZS1yZXR1cm4gLSBjLWJ5dGUtb3JkZXItbWFya1xuZnVuY3Rpb24gaXNOc0NoYXJPcldoaXRlc3BhY2UgKGM6IG51bWJlcikge1xuICByZXR1cm4gaXNQcmludGFibGUoYykgJiZcbiAgICBjICE9PSBDSEFSX0JPTSAmJlxuICAgIC8vIC0gYi1jaGFyXG4gICAgYyAhPT0gQ0hBUl9DQVJSSUFHRV9SRVRVUk4gJiZcbiAgICBjICE9PSBDSEFSX0xJTkVfRkVFRFxufVxuXG4vLyBbMTI3XSAgbnMtcGxhaW4tc2FmZShjKSA6Oj0gYyA9IGZsb3ctb3V0ICDih5IgbnMtcGxhaW4tc2FmZS1vdXRcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjID0gZmxvdy1pbiAgIOKHkiBucy1wbGFpbi1zYWZlLWluXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYyA9IGJsb2NrLWtleSDih5IgbnMtcGxhaW4tc2FmZS1vdXRcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjID0gZmxvdy1rZXkgIOKHkiBucy1wbGFpbi1zYWZlLWluXG4vLyBbMTI4XSBucy1wbGFpbi1zYWZlLW91dCA6Oj0gbnMtY2hhclxuLy8gWzEyOV0gIG5zLXBsYWluLXNhZmUtaW4gOjo9IG5zLWNoYXIgLSBjLWZsb3ctaW5kaWNhdG9yXG4vLyBbMTMwXSAgbnMtcGxhaW4tY2hhcihjKSA6Oj0gICggbnMtcGxhaW4tc2FmZShjKSAtIOKAnDrigJ0gLSDigJwj4oCdIClcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgKCAvKiBBbiBucy1jaGFyIHByZWNlZGluZyAqLyDigJwj4oCdIClcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgKCDigJw64oCdIC8qIEZvbGxvd2VkIGJ5IGFuIG5zLXBsYWluLXNhZmUoYykgKi8gKVxuLy8gYHByZXZgIGlzIHRoZSBwcmV2aW91cyBjb2RlIHBvaW50LCBvciAtMSB3aGVuIGBjYCBpcyB0aGUgZmlyc3QgY2hhcmFjdGVyXG4vLyAobm8gcHJlY2VkaW5nIGNoYXJhY3RlcikuIC0xIGlzIG5vdCBhIHZhbGlkIGNvZGUgcG9pbnQsIHNvIGl0IGNhbiBuZXZlclxuLy8gY29sbGlkZSB3aXRoIGEgcmVhbCBvbmUgYW5kIHNhZmVseSBkaXNhYmxlcyB0aGUgcHJldi1kZXBlbmRlbnQgY2FzZXMgYmVsb3cuXG5mdW5jdGlvbiBpc1BsYWluU2FmZSAoYzogbnVtYmVyLCBwcmV2OiBudW1iZXIsIGluYmxvY2s6IGJvb2xlYW4pIHtcbiAgY29uc3QgY0lzTnNDaGFyT3JXaGl0ZXNwYWNlID0gaXNOc0NoYXJPcldoaXRlc3BhY2UoYylcbiAgY29uc3QgY0lzTnNDaGFyID0gY0lzTnNDaGFyT3JXaGl0ZXNwYWNlICYmICFpc1doaXRlc3BhY2UoYylcbiAgcmV0dXJuIChcbiAgICAoXG4gICAgICAvLyBucy1wbGFpbi1zYWZlXG4gICAgICBpbmJsb2NrIC8vIGMgPSBmbG93LWluXG4gICAgICAgID8gY0lzTnNDaGFyT3JXaGl0ZXNwYWNlXG4gICAgICAgIDogY0lzTnNDaGFyT3JXaGl0ZXNwYWNlICYmXG4gICAgICAgICAgLy8gLSBjLWZsb3ctaW5kaWNhdG9yXG4gICAgICAgICAgYyAhPT0gQ0hBUl9DT01NQSAmJlxuICAgICAgICAgIGMgIT09IENIQVJfTEVGVF9TUVVBUkVfQlJBQ0tFVCAmJlxuICAgICAgICAgIGMgIT09IENIQVJfUklHSFRfU1FVQVJFX0JSQUNLRVQgJiZcbiAgICAgICAgICBjICE9PSBDSEFSX0xFRlRfQ1VSTFlfQlJBQ0tFVCAmJlxuICAgICAgICAgIGMgIT09IENIQVJfUklHSFRfQ1VSTFlfQlJBQ0tFVFxuICAgICkgJiZcbiAgICAvLyBucy1wbGFpbi1jaGFyXG4gICAgYyAhPT0gQ0hBUl9TSEFSUCAmJiAvLyBmYWxzZSBvbiAnIydcbiAgICAhKHByZXYgPT09IENIQVJfQ09MT04gJiYgIWNJc05zQ2hhcilcbiAgKSB8fCAvLyBmYWxzZSBvbiAnOiAnXG4gIChpc05zQ2hhck9yV2hpdGVzcGFjZShwcmV2KSAmJiAhaXNXaGl0ZXNwYWNlKHByZXYpICYmIGMgPT09IENIQVJfU0hBUlApIHx8IC8vIGNoYW5nZSB0byB0cnVlIG9uICdbXiBdIydcbiAgKHByZXYgPT09IENIQVJfQ09MT04gJiYgY0lzTnNDaGFyKSAvLyBjaGFuZ2UgdG8gdHJ1ZSBvbiAnOlteIF0nXG59XG5cbi8vIFNpbXBsaWZpZWQgdGVzdCBmb3IgdmFsdWVzIGFsbG93ZWQgYXMgdGhlIGZpcnN0IGNoYXJhY3RlciBpbiBwbGFpbiBzdHlsZS5cbmZ1bmN0aW9uIGlzUGxhaW5TYWZlRmlyc3QgKGM6IG51bWJlcikge1xuICAvLyBVc2VzIGEgc3Vic2V0IG9mIG5zLWNoYXIgLSBjLWluZGljYXRvclxuICAvLyB3aGVyZSBucy1jaGFyID0gbmItY2hhciAtIHMtd2hpdGUuXG4gIC8vIE5vIHN1cHBvcnQgb2YgKCAoIOKAnD/igJ0gfCDigJw64oCdIHwg4oCcLeKAnSApIC8qIEZvbGxvd2VkIGJ5IGFuIG5zLXBsYWluLXNhZmUoYykpICovICkgcGFydFxuICByZXR1cm4gaXNQcmludGFibGUoYykgJiZcbiAgICBjICE9PSBDSEFSX0JPTSAmJlxuICAgICFpc1doaXRlc3BhY2UoYykgJiYgLy8gLSBzLXdoaXRlXG4gICAgLy8gLSAoYy1pbmRpY2F0b3IgOjo9XG4gICAgLy8g4oCcLeKAnSB8IOKAnD/igJ0gfCDigJw64oCdIHwg4oCcLOKAnSB8IOKAnFvigJ0gfCDigJxd4oCdIHwg4oCce+KAnSB8IOKAnH3igJ1cbiAgICBjICE9PSBDSEFSX01JTlVTICYmXG4gICAgYyAhPT0gQ0hBUl9RVUVTVElPTiAmJlxuICAgIGMgIT09IENIQVJfQ09MT04gJiZcbiAgICBjICE9PSBDSEFSX0NPTU1BICYmXG4gICAgYyAhPT0gQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VUICYmXG4gICAgYyAhPT0gQ0hBUl9SSUdIVF9TUVVBUkVfQlJBQ0tFVCAmJlxuICAgIGMgIT09IENIQVJfTEVGVF9DVVJMWV9CUkFDS0VUICYmXG4gICAgYyAhPT0gQ0hBUl9SSUdIVF9DVVJMWV9CUkFDS0VUICYmXG4gICAgLy8gfCDigJwj4oCdIHwg4oCcJuKAnSB8IOKAnCrigJ0gfCDigJwh4oCdIHwg4oCcfOKAnSB8IOKAnD3igJ0gfCDigJw+4oCdIHwg4oCcJ+KAnSB8IOKAnFwi4oCdXG4gICAgYyAhPT0gQ0hBUl9TSEFSUCAmJlxuICAgIGMgIT09IENIQVJfQU1QRVJTQU5EICYmXG4gICAgYyAhPT0gQ0hBUl9BU1RFUklTSyAmJlxuICAgIGMgIT09IENIQVJfRVhDTEFNQVRJT04gJiZcbiAgICBjICE9PSBDSEFSX1ZFUlRJQ0FMX0xJTkUgJiZcbiAgICBjICE9PSBDSEFSX0VRVUFMUyAmJlxuICAgIGMgIT09IENIQVJfR1JFQVRFUl9USEFOICYmXG4gICAgYyAhPT0gQ0hBUl9TSU5HTEVfUVVPVEUgJiZcbiAgICBjICE9PSBDSEFSX0RPVUJMRV9RVU9URSAmJlxuICAgIC8vIHwg4oCcJeKAnSB8IOKAnEDigJ0gfCDigJxg4oCdKVxuICAgIGMgIT09IENIQVJfUEVSQ0VOVCAmJlxuICAgIGMgIT09IENIQVJfQ09NTUVSQ0lBTF9BVCAmJlxuICAgIGMgIT09IENIQVJfR1JBVkVfQUNDRU5UXG59XG5cbmZ1bmN0aW9uIGlzUGxhaW5TYWZlQXRTdGFydCAoc3RyaW5nOiBzdHJpbmcsIGluYmxvY2s6IGJvb2xlYW4pIHtcbiAgY29uc3QgZmlyc3QgPSBjb2RlUG9pbnRBdChzdHJpbmcsIDApXG5cbiAgaWYgKGlzUGxhaW5TYWZlRmlyc3QoZmlyc3QpKSByZXR1cm4gdHJ1ZVxuXG4gIGlmIChcbiAgICBzdHJpbmcubGVuZ3RoID4gMSAmJlxuICAgIChmaXJzdCA9PT0gQ0hBUl9NSU5VUyB8fCBmaXJzdCA9PT0gQ0hBUl9RVUVTVElPTiB8fCBmaXJzdCA9PT0gQ0hBUl9DT0xPTilcbiAgKSB7XG4gICAgY29uc3Qgc2Vjb25kID0gY29kZVBvaW50QXQoc3RyaW5nLCAxKVxuXG4gICAgLy8gVGhlIHJlbGF4ZWQgaXNQbGFpblNhZmUoKSBhY2NlcHRzIHdoaXRlc3BhY2UgaW5zaWRlIGEgc2NhbGFyLCBidXQgdGhlXG4gICAgLy8gaW5kaWNhdG9yIGV4Y2VwdGlvbiBpbiBucy1wbGFpbi1maXJzdCByZXF1aXJlcyBhbiBucy1wbGFpbi1zYWZlXG4gICAgLy8gKm5vbi1zcGFjZSogY2hhcmFjdGVyLiBPdGhlcndpc2UgYC0gdmFsdWVgIGFuZCBgPyB2YWx1ZWAgc3RhcnQgYmxvY2tcbiAgICAvLyBjb2xsZWN0aW9ucyBpbnN0ZWFkIG9mIHBsYWluIHNjYWxhcnMuXG4gICAgcmV0dXJuICFpc1doaXRlc3BhY2Uoc2Vjb25kKSAmJiBpc1BsYWluU2FmZShzZWNvbmQsIGZpcnN0LCBpbmJsb2NrKVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8vIFNpbXBsaWZpZWQgdGVzdCBmb3IgdmFsdWVzIGFsbG93ZWQgYXMgdGhlIGxhc3QgY2hhcmFjdGVyIGluIHBsYWluIHN0eWxlLlxuZnVuY3Rpb24gaXNQbGFpblNhZmVMYXN0IChjOiBudW1iZXIpIHtcbiAgLy8ganVzdCBub3Qgd2hpdGVzcGFjZSBvciBjb2xvbiwgaXQgd2lsbCBiZSBjaGVja2VkIHRvIGJlIHBsYWluIGNoYXJhY3RlciBsYXRlclxuICByZXR1cm4gIWlzV2hpdGVzcGFjZShjKSAmJiBjICE9PSBDSEFSX0NPTE9OXG59XG5cbi8vIFNhbWUgYXMgJ3N0cmluZycuY29kZVBvaW50QXQocG9zKSwgYnV0IHdvcmtzIGluIG9sZGVyIGJyb3dzZXJzLlxuZnVuY3Rpb24gY29kZVBvaW50QXQgKHN0cmluZzogc3RyaW5nLCBwb3M6IG51bWJlcikge1xuICBjb25zdCBmaXJzdCA9IHN0cmluZy5jaGFyQ29kZUF0KHBvcylcbiAgbGV0IHNlY29uZFxuXG4gIGlmIChmaXJzdCA+PSAweEQ4MDAgJiYgZmlyc3QgPD0gMHhEQkZGICYmIHBvcyArIDEgPCBzdHJpbmcubGVuZ3RoKSB7XG4gICAgc2Vjb25kID0gc3RyaW5nLmNoYXJDb2RlQXQocG9zICsgMSlcbiAgICBpZiAoc2Vjb25kID49IDB4REMwMCAmJiBzZWNvbmQgPD0gMHhERkZGKSB7XG4gICAgICAvLyBodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZyNzdXJyb2dhdGUtZm9ybXVsYWVcbiAgICAgIHJldHVybiAoZmlyc3QgLSAweEQ4MDApICogMHg0MDAgKyBzZWNvbmQgLSAweERDMDAgKyAweDEwMDAwXG4gICAgfVxuICB9XG4gIHJldHVybiBmaXJzdFxufVxuXG5mdW5jdGlvbiBuZWVkSW5kZW50SW5kaWNhdG9yIChzdHJpbmc6IHN0cmluZykge1xuICBjb25zdCBsZWFkaW5nU3BhY2VSZSA9IC9eXFxuKiAvXG4gIHJldHVybiBsZWFkaW5nU3BhY2VSZS50ZXN0KHN0cmluZylcbn1cblxuY29uc3QgU1RZTEVfUExBSU4gPSAxXG5jb25zdCBTVFlMRV9TSU5HTEUgPSAyXG5jb25zdCBTVFlMRV9MSVRFUkFMID0gM1xuY29uc3QgU1RZTEVfRk9MREVEID0gNFxuY29uc3QgU1RZTEVfRE9VQkxFID0gNVxuXG50eXBlIFNjYWxhclN0eWxlSWQgPVxuICB0eXBlb2YgU1RZTEVfUExBSU4gfFxuICB0eXBlb2YgU1RZTEVfU0lOR0xFIHxcbiAgdHlwZW9mIFNUWUxFX0xJVEVSQUwgfFxuICB0eXBlb2YgU1RZTEVfRk9MREVEIHxcbiAgdHlwZW9mIFNUWUxFX0RPVUJMRVxuXG4vLyBEZXRlcm1pbmVzIHdoaWNoIHNjYWxhciBzdHlsZXMgYXJlIHBvc3NpYmxlIGFuZCByZXR1cm5zIHRoZSBwcmVmZXJyZWQgc3R5bGUuXG4vLyBsaW5lV2lkdGggPSAtMSA9PiBubyBsaW1pdC5cbi8vIFByZS1jb25kaXRpb25zOiBzdHIubGVuZ3RoID4gMC5cbi8vIFBvc3QtY29uZGl0aW9uczpcbi8vICAgIFNUWUxFX1BMQUlOIG9yIFNUWUxFX1NJTkdMRSA9PiBubyBcXG4gYXJlIGluIHRoZSBzdHJpbmcuXG4vLyAgICBTVFlMRV9MSVRFUkFMID0+IG5vIGxpbmVzIGFyZSBzdWl0YWJsZSBmb3IgZm9sZGluZyAob3IgbGluZVdpZHRoIGlzIC0xKS5cbi8vICAgIFNUWUxFX0ZPTERFRCA9PiBhIGxpbmUgPiBsaW5lV2lkdGggYW5kIGNhbiBiZSBmb2xkZWQgKGFuZCBsaW5lV2lkdGggIT0gLTEpLlxuZnVuY3Rpb24gY2hvb3NlU2NhbGFyU3R5bGUgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgc3RyaW5nOiBzdHJpbmcsIGxheW91dDogUmV0dXJuVHlwZTx0eXBlb2Ygc2NhbGFyTGF5b3V0PixcbiAgc2luZ2xlTGluZU9ubHk6IGJvb2xlYW4sIGZvcmNlUXVvdGU6IGJvb2xlYW4sIGluYmxvY2s6IGJvb2xlYW4pOiBTY2FsYXJTdHlsZUlkIHtcbiAgY29uc3QgeyBibG9ja0luZGVudCwgbGluZVdpZHRoIH0gPSBsYXlvdXRcbiAgbGV0IGlcbiAgbGV0IGNoYXIgPSAwXG4gIGxldCBwcmV2Q2hhciA9IC0xIC8vIC0xID0gbm8gcHJldmlvdXMgY2hhcmFjdGVyIHlldCAoc2VlIGlzUGxhaW5TYWZlKVxuICBsZXQgaGFzTGluZUJyZWFrID0gZmFsc2VcbiAgbGV0IGhhc0ZvbGRhYmxlTGluZSA9IGZhbHNlIC8vIG9ubHkgY2hlY2tlZCBpZiBzaG91bGRUcmFja1dpZHRoXG4gIGNvbnN0IHNob3VsZFRyYWNrV2lkdGggPSBsaW5lV2lkdGggIT09IC0xXG4gIGxldCBwcmV2aW91c0xpbmVCcmVhayA9IC0xIC8vIGNvdW50IHRoZSBmaXJzdCBsaW5lIGNvcnJlY3RseVxuICAvLyBEb2N1bWVudCBtYXJrZXJzIGFyZSByZWNvZ25pemVkIGFzIHdob2xlIHRva2VucyBhdCB0aGUgc3RhcnQgb2YgYSBsaW5lLFxuICAvLyBzbyBjaGFyYWN0ZXItbGV2ZWwgcGxhaW4tc2NhbGFyIGNoZWNrcyBhbG9uZSBjYW5ub3QgcmVqZWN0IHRoZW0uXG4gIGxldCBwbGFpbiA9ICFzdGFydHNXaXRoRG9jdW1lbnRTZXBhcmF0b3Ioc3RyaW5nKSAmJlxuICAgIGlzUGxhaW5TYWZlQXRTdGFydChzdHJpbmcsIGluYmxvY2spICYmXG4gICAgaXNQbGFpblNhZmVMYXN0KGNvZGVQb2ludEF0KHN0cmluZywgc3RyaW5nLmxlbmd0aCAtIDEpKVxuXG4gIGlmIChzaW5nbGVMaW5lT25seSB8fCBmb3JjZVF1b3RlKSB7XG4gICAgLy8gQ2FzZTogbm8gYmxvY2sgc3R5bGVzLlxuICAgIC8vIENoZWNrIGZvciBkaXNhbGxvd2VkIGNoYXJhY3RlcnMgdG8gcnVsZSBvdXQgcGxhaW4gYW5kIHNpbmdsZS5cbiAgICBmb3IgKGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgY2hhciA+PSAweDEwMDAwID8gaSArPSAyIDogaSsrKSB7XG4gICAgICBjaGFyID0gY29kZVBvaW50QXQoc3RyaW5nLCBpKVxuICAgICAgaWYgKCFpc1ByaW50YWJsZShjaGFyKSkge1xuICAgICAgICByZXR1cm4gU1RZTEVfRE9VQkxFXG4gICAgICB9XG4gICAgICBwbGFpbiA9IHBsYWluICYmIGlzUGxhaW5TYWZlKGNoYXIsIHByZXZDaGFyLCBpbmJsb2NrKVxuICAgICAgcHJldkNoYXIgPSBjaGFyXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIENhc2U6IGJsb2NrIHN0eWxlcyBwZXJtaXR0ZWQuXG4gICAgZm9yIChpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGNoYXIgPj0gMHgxMDAwMCA/IGkgKz0gMiA6IGkrKykge1xuICAgICAgY2hhciA9IGNvZGVQb2ludEF0KHN0cmluZywgaSlcbiAgICAgIGlmIChjaGFyID09PSBDSEFSX0xJTkVfRkVFRCkge1xuICAgICAgICBoYXNMaW5lQnJlYWsgPSB0cnVlXG4gICAgICAgIC8vIENoZWNrIGlmIGFueSBsaW5lIGNhbiBiZSBmb2xkZWQuXG4gICAgICAgIGlmIChzaG91bGRUcmFja1dpZHRoKSB7XG4gICAgICAgICAgaGFzRm9sZGFibGVMaW5lID0gaGFzRm9sZGFibGVMaW5lIHx8XG4gICAgICAgICAgICAvLyBGb2xkYWJsZSBsaW5lID0gdG9vIGxvbmcsIGFuZCBub3QgbW9yZS1pbmRlbnRlZC5cbiAgICAgICAgICAgIChpIC0gcHJldmlvdXNMaW5lQnJlYWsgLSAxID4gbGluZVdpZHRoICYmXG4gICAgICAgICAgICAgc3RyaW5nW3ByZXZpb3VzTGluZUJyZWFrICsgMV0gIT09ICcgJylcbiAgICAgICAgICBwcmV2aW91c0xpbmVCcmVhayA9IGlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghaXNQcmludGFibGUoY2hhcikpIHtcbiAgICAgICAgcmV0dXJuIFNUWUxFX0RPVUJMRVxuICAgICAgfVxuICAgICAgcGxhaW4gPSBwbGFpbiAmJiBpc1BsYWluU2FmZShjaGFyLCBwcmV2Q2hhciwgaW5ibG9jaylcbiAgICAgIHByZXZDaGFyID0gY2hhclxuICAgIH1cbiAgICAvLyBpbiBjYXNlIHRoZSBlbmQgaXMgbWlzc2luZyBhIFxcblxuICAgIGhhc0ZvbGRhYmxlTGluZSA9IGhhc0ZvbGRhYmxlTGluZSB8fCAoc2hvdWxkVHJhY2tXaWR0aCAmJlxuICAgICAgKGkgLSBwcmV2aW91c0xpbmVCcmVhayAtIDEgPiBsaW5lV2lkdGggJiZcbiAgICAgICBzdHJpbmdbcHJldmlvdXNMaW5lQnJlYWsgKyAxXSAhPT0gJyAnKSlcbiAgfVxuICAvLyBBbHRob3VnaCBldmVyeSBzdHlsZSBjYW4gcmVwcmVzZW50IFxcbiB3aXRob3V0IGVzY2FwaW5nLCBwcmVmZXIgYmxvY2sgc3R5bGVzXG4gIC8vIGZvciBtdWx0aWxpbmUsIHNpbmNlIHRoZXkncmUgbW9yZSByZWFkYWJsZSBhbmQgdGhleSBkb24ndCBhZGQgZW1wdHkgbGluZXMuXG4gIC8vIEFsc28gcHJlZmVyIGZvbGRpbmcgYSBzdXBlci1sb25nIGxpbmUuXG4gIGlmICghaGFzTGluZUJyZWFrICYmICFoYXNGb2xkYWJsZUxpbmUpIHtcbiAgICAvLyBTeW50YWN0aWMgdmVyZGljdCBvbmx5OiB3aGV0aGVyIHRoZSBiYXJlIHRleHQgcm91bmQtdHJpcHMgdG8gdGhlIG5vZGUnc1xuICAgIC8vIHRhZyBpcyBhIHNlbWFudGljIGNoZWNrIHRoZSBjYWxsZXIgYXBwbGllcyAoc2VlIHJlc29sdmVTY2FsYXJTdHlsZSkuXG4gICAgaWYgKHBsYWluICYmICFmb3JjZVF1b3RlKSByZXR1cm4gU1RZTEVfUExBSU5cbiAgICByZXR1cm4gc3RhdGUucXVvdGVTdHlsZSA9PT0gJ2RvdWJsZScgPyBTVFlMRV9ET1VCTEUgOiBTVFlMRV9TSU5HTEVcbiAgfVxuICAvLyBFZGdlIGNhc2U6IGJsb2NrIGluZGVudGF0aW9uIGluZGljYXRvciBjYW4gb25seSBoYXZlIG9uZSBkaWdpdC5cbiAgaWYgKGJsb2NrSW5kZW50ID4gOSAmJiBuZWVkSW5kZW50SW5kaWNhdG9yKHN0cmluZykpIHtcbiAgICByZXR1cm4gU1RZTEVfRE9VQkxFXG4gIH1cbiAgLy8gQXQgdGhpcyBwb2ludCB3ZSBrbm93IGJsb2NrIHN0eWxlcyBhcmUgdmFsaWQuXG4gIC8vIFByZWZlciBsaXRlcmFsIHN0eWxlIHVubGVzcyB3ZSB3YW50IHRvIGZvbGQuXG4gIHJldHVybiBoYXNGb2xkYWJsZUxpbmUgPyBTVFlMRV9GT0xERUQgOiBTVFlMRV9MSVRFUkFMXG59XG5cbi8vIFJlbmRlcnMgYHN0cmluZ2AgaW4gdGhlIGdpdmVuIG51bWVyaWMgc3R5bGUgd2l0aCB0aGUgZ2l2ZW4gbGF5b3V0LlxuLy8gTkIuIFdlIGRyb3AgdGhlIGxhc3QgdHJhaWxpbmcgbmV3bGluZSAoaWYgYW55KSBvZiBhIHJldHVybmVkIGJsb2NrIHNjYWxhclxuLy8gIHNpbmNlIHRoZSBkdW1wZXIgYWRkcyBpdHMgb3duIG5ld2xpbmUuIFRoaXMgYWx3YXlzIHdvcmtzOlxuLy8gICAg4oCiIE5vIGVuZGluZyBuZXdsaW5lID0+IHVuYWZmZWN0ZWQ7IGFscmVhZHkgdXNpbmcgc3RyaXAgXCItXCIgY2hvbXBpbmcuXG4vLyAgICDigKIgRW5kaW5nIG5ld2xpbmUgICAgPT4gcmVtb3ZlZCB0aGVuIHJlc3RvcmVkLlxuLy8gIEltcG9ydGFudGx5LCB0aGlzIGtlZXBzIHRoZSBcIitcIiBjaG9tcCBpbmRpY2F0b3IgZnJvbSBnYWluaW5nIGFuIGV4dHJhIGxpbmUuXG5mdW5jdGlvbiByZW5kZXJTY2FsYXJTdHlsZSAoc3RyaW5nOiBzdHJpbmcsIHN0eWxlOiBTY2FsYXJTdHlsZUlkLCBsYXlvdXQ6IFJldHVyblR5cGU8dHlwZW9mIHNjYWxhckxheW91dD4pIHtcbiAgY29uc3QgeyBpbmRlbnQsIGJsb2NrSW5kZW50LCBsaW5lV2lkdGggfSA9IGxheW91dFxuXG4gIHN3aXRjaCAoc3R5bGUpIHtcbiAgICBjYXNlIFNUWUxFX1BMQUlOOlxuICAgICAgcmV0dXJuIGVuY29kZUZsb3dCcmVha3Moc3RyaW5nLCBpbmRlbnQpXG4gICAgY2FzZSBTVFlMRV9TSU5HTEU6XG4gICAgICByZXR1cm4gYCcke2VuY29kZUZsb3dCcmVha3Moc3RyaW5nLCBpbmRlbnQpLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYFxuICAgIGNhc2UgU1RZTEVfTElURVJBTDpcbiAgICAgIHJldHVybiAnfCcgKyBibG9ja0hlYWRlcihzdHJpbmcsIGJsb2NrSW5kZW50KSArXG4gICAgICAgIGRyb3BFbmRpbmdOZXdsaW5lKGluZGVudFN0cmluZyhzdHJpbmcsIGluZGVudCkpXG4gICAgY2FzZSBTVFlMRV9GT0xERUQ6XG4gICAgICByZXR1cm4gJz4nICsgYmxvY2tIZWFkZXIoc3RyaW5nLCBibG9ja0luZGVudCkgK1xuICAgICAgICBkcm9wRW5kaW5nTmV3bGluZShpbmRlbnRTdHJpbmcoZm9sZEJsb2NrU2NhbGFyKHN0cmluZywgbGluZVdpZHRoKSwgaW5kZW50KSlcbiAgICBjYXNlIFNUWUxFX0RPVUJMRTpcbiAgICAgIHJldHVybiBgXCIke2VzY2FwZVN0cmluZyhzdHJpbmcpfVwiYFxuICB9XG59XG5cbi8vIFBpY2tzIHRoZSBzY2FsYXIgc3R5bGUgZm9yIGBub2RlYDogYSBzdHlsZSBoaW50IGNhcnJpZWQgb24gdGhlIG5vZGUgd2lucyxcbi8vIG90aGVyd2lzZSB0aGUgc3R5bGUgY2hvc2VuIGJ5IHRoZSBtYWNoaW5lcnkuIFJldHVybnMgYSBudW1lcmljIFNUWUxFXyouXG5mdW5jdGlvbiByZXNvbHZlU2NhbGFyU3R5bGUgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgbm9kZTogU2NhbGFyTm9kZSxcbiAgbGF5b3V0OiBSZXR1cm5UeXBlPHR5cGVvZiBzY2FsYXJMYXlvdXQ+LCBpc2tleTogYm9vbGVhbiwgaW5ibG9jazogYm9vbGVhbik6IFNjYWxhclN0eWxlSWQge1xuICAvLyBXaXRob3V0IGtub3dpbmcgaWYga2V5cyBhcmUgaW1wbGljaXQvZXhwbGljaXQsIGFzc3VtZSBpbXBsaWNpdCBmb3Igc2FmZXR5LlxuICBjb25zdCBzaW5nbGVMaW5lT25seSA9IGlza2V5IHx8ICFpbmJsb2NrXG5cbiAgLy8gU3R5bGUgaGludHMgY2FycmllZCBvbiB0aGUgbm9kZSB0YWtlIHByZWNlZGVuY2UuIFRoZXkgd2VyZSB2YWxpZCBpbiB0aGVpclxuICAvLyBvcmlnaW5hbCBjb250ZXh0OyBvbmx5IGEgcGFyZW50IGNoYW5nZSBjYW4gYnJlYWsgdGhlbSwgYW5kIG9ubHkgYmxvY2tcbiAgLy8gc3R5bGVzIGluIGEgc2luZ2xlLWxpbmUgY29udGV4dCDigJQgcXVvdGVkIHN0eWxlcyBzdXJ2aXZlIGFueSBjb250ZXh0LiBBXG4gIC8vIHJlamVjdGVkIGJsb2NrIGhpbnQgZmFsbHMgdGhyb3VnaCB0byBzZWxlY3Rpb24gYnkgY29udGVudCBiZWxvdy5cbiAgaWYgKG5vZGUuc3R5bGUuc2luZ2xlUXVvdGVkKSByZXR1cm4gU1RZTEVfU0lOR0xFXG4gIGlmIChub2RlLnN0eWxlLmRvdWJsZVF1b3RlZCkgcmV0dXJuIFNUWUxFX0RPVUJMRVxuICBpZiAoIXNpbmdsZUxpbmVPbmx5KSB7XG4gICAgaWYgKG5vZGUuc3R5bGUubGl0ZXJhbCkgcmV0dXJuIFNUWUxFX0xJVEVSQUxcbiAgICBpZiAobm9kZS5zdHlsZS5mb2xkZWQpIHJldHVybiBTVFlMRV9GT0xERURcbiAgfVxuXG4gIGNvbnN0IHN0cmluZyA9IG5vZGUudmFsdWVcblxuICBpZiAoc3RyaW5nLmxlbmd0aCA9PT0gMCkge1xuICAgIC8vIEFuIGVtcHR5IHNjYWxhciBpcyBzYWZlIHdoZW4gaXRzIHRhZyBpcyBleHBsaWNpdCBvciByZXNvbHZlcyBiYWNrIHRvIHRoZVxuICAgIC8vIG5vZGUgdGFnIChub3RhYmx5LCB0aGUgZGVmYXVsdCBudWxsIHJlcHJlc2VudGF0aW9uKS4gQSByZWFsIGVtcHR5IHN0cmluZ1xuICAgIC8vIGRvZXMgbmVpdGhlciBhbmQgdGhlcmVmb3JlIHJlbWFpbnMgcXVvdGVkLlxuICAgIGlmIChub2RlLnN0eWxlLnRhZ2dlZCB8fCByZXNvbHZlSW1wbGljaXRUYWcoc3RhdGUsIHN0cmluZykgPT09IG5vZGUudGFnKSByZXR1cm4gU1RZTEVfUExBSU5cbiAgICByZXR1cm4gc3RhdGUucXVvdGVTdHlsZSA9PT0gJ2RvdWJsZScgPyBTVFlMRV9ET1VCTEUgOiBTVFlMRV9TSU5HTEVcbiAgfVxuXG4gIC8vIHY0J3MgZm9yY2VRdW90ZXMgZGVsaWJlcmF0ZWx5IGV4Y2x1ZGVkIGtleXMuIEtleXMgYXJlIHN0aWxsIHF1b3RlZCB3aGVuXG4gIC8vIHN5bnRheCBvciB0YWcgcmVzb2x1dGlvbiByZXF1aXJlcyBpdCwgdXNpbmcgcXVvdGVTdHlsZSBhcyB0aGUgcHJlZmVyZW5jZS5cbiAgY29uc3Qgc3R5bGUgPSBjaG9vc2VTY2FsYXJTdHlsZShcbiAgICBzdGF0ZSwgc3RyaW5nLCBsYXlvdXQsIHNpbmdsZUxpbmVPbmx5LCBzdGF0ZS5mb3JjZVF1b3RlcyAmJiAhaXNrZXksIGluYmxvY2spXG5cbiAgLy8gUGxhaW4gd3JpdGVzIG5vIHRhZywgc28gaXQgcm91bmQtdHJpcHMgb25seSBpZiB0aGUgYmFyZSB0ZXh0IHJlc29sdmVzIGJhY2tcbiAgLy8gdG8gdGhlIG5vZGUncyB0YWcgKG9yIHRoZSB0YWcgZ2V0cyBwcmludGVkIGV4cGxpY2l0bHkpLiBFbHNlIGRvd25ncmFkZS5cbiAgLy8gRG93bmdyYWRlIHRvIHRoZSBwcmVmZXJyZWQgcXVvdGUgc3R5bGUgaGVyZS5cbiAgaWYgKHN0eWxlID09PSBTVFlMRV9QTEFJTiAmJiAhbm9kZS5zdHlsZS50YWdnZWQgJiYgcmVzb2x2ZUltcGxpY2l0VGFnKHN0YXRlLCBzdHJpbmcpICE9PSBub2RlLnRhZykge1xuICAgIHJldHVybiBzdGF0ZS5xdW90ZVN0eWxlID09PSAnZG91YmxlJyA/IFNUWUxFX0RPVUJMRSA6IFNUWUxFX1NJTkdMRVxuICB9XG4gIHJldHVybiBzdHlsZVxufVxuXG4vLyBQcmUtY29uZGl0aW9uczogc3RyaW5nIGlzIHZhbGlkIGZvciBhIGJsb2NrIHNjYWxhciwgMSA8PSBpbmRlbnRQZXJMZXZlbCA8PSA5LlxuZnVuY3Rpb24gYmxvY2tIZWFkZXIgKHN0cmluZzogc3RyaW5nLCBpbmRlbnRQZXJMZXZlbDogbnVtYmVyKSB7XG4gIGNvbnN0IGluZGVudEluZGljYXRvciA9IG5lZWRJbmRlbnRJbmRpY2F0b3Ioc3RyaW5nKSA/IFN0cmluZyhpbmRlbnRQZXJMZXZlbCkgOiAnJ1xuXG4gIC8vIG5vdGUgdGhlIHNwZWNpYWwgY2FzZTogdGhlIHN0cmluZyAnXFxuJyBjb3VudHMgYXMgYSBcInRyYWlsaW5nXCIgZW1wdHkgbGluZS5cbiAgY29uc3QgY2xpcCA9IHN0cmluZ1tzdHJpbmcubGVuZ3RoIC0gMV0gPT09ICdcXG4nXG4gIGNvbnN0IGtlZXAgPSBjbGlwICYmIChzdHJpbmdbc3RyaW5nLmxlbmd0aCAtIDJdID09PSAnXFxuJyB8fCBzdHJpbmcgPT09ICdcXG4nKVxuICBjb25zdCBjaG9tcCA9IGtlZXAgPyAnKycgOiAoY2xpcCA/ICcnIDogJy0nKVxuXG4gIHJldHVybiBgJHtpbmRlbnRJbmRpY2F0b3J9JHtjaG9tcH1cXG5gXG59XG5cbi8vIEZsb3cgc2NhbGFycyAocGxhaW4sIHNpbmdsZS1xdW90ZWQpIGZvbGQgbGluZSBicmVha3M6IGEgcnVuIG9mIGsgc291cmNlIGxpbmVcbi8vIGJyZWFrcyByZXBhcnNlcyB0byBrLTEgbGl0ZXJhbCBgXFxuYC4gU28gYSBzaW5nbGUgYnJlYWsgaXMganVzdCBsaW5lLXdyYXBwaW5nXG4vLyAoZm9sZHMgYmFjayB0byBhIHNwYWNlKSwgd2hpbGUgYSBsaXRlcmFsIGBcXG5gIGluIHRoZSB2YWx1ZSBtdXN0IGJlIGVtaXR0ZWQgYXNcbi8vIGEgYmxhbmsgbGluZSAodHdvIGJyZWFrcykuIEVuY29kZSBlYWNoIHJ1biBvZiBwIGxpdGVyYWwgYFxcbmAgYXMgcCsxIGJyZWFrcyBhbmRcbi8vIGluZGVudCB0aGUgZm9sbG93aW5nIGNvbnRlbnQgbGluZSBzbyB0aGUgY29udGludWF0aW9uIGlzbid0IHJlYWQgYXMgYSBuZXcgbm9kZVxuLy8gKGEgYmFyZSBicmVhayB3b3VsZCB5aWVsZCBpbnZhbGlkIFwiZGVmaWNpZW50IGluZGVudGF0aW9uXCIgb3V0cHV0KS5cbi8vIGBmb2xkQmxvY2tTY2FsYXJgIGNhbid0IGJlIHJldXNlZCBoZXJlOiBpdCB0cmVhdHMgYSBsZWFkaW5nIHNwYWNlIGFzIGFcbi8vIFwibW9yZS1pbmRlbnRlZFwiIGxpbmUgYW5kIHN1cHByZXNzZXMgdGhlIGRvdWJsaW5nLCB3aGljaCBhIGZsb3cgc2NhbGFyIG11c3Qgbm90LlxuZnVuY3Rpb24gZW5jb2RlRmxvd0JyZWFrcyAoc3RyaW5nOiBzdHJpbmcsIGluZGVudDogbnVtYmVyKSB7XG4gIGxldCBuZXh0TEYgPSBzdHJpbmcuaW5kZXhPZignXFxuJylcbiAgaWYgKG5leHRMRiA9PT0gLTEpIHJldHVybiBzdHJpbmdcblxuICBjb25zdCBwYWQgPSAnICcucmVwZWF0KGluZGVudClcbiAgbGV0IHJlc3VsdCA9IHN0cmluZy5zbGljZSgwLCBuZXh0TEYpIC8vIGZpcnN0IGxpbmUgZm9sbG93cyB0aGUgcXVvdGUsIG5vIGluZGVudFxuXG4gIGNvbnN0IGxpbmVSZSA9IC8oXFxuKykoW15cXG5dKikvZ1xuICBsaW5lUmUubGFzdEluZGV4ID0gbmV4dExGXG4gIGxldCBtYXRjaFxuICB3aGlsZSAoKG1hdGNoID0gbGluZVJlLmV4ZWMoc3RyaW5nKSkpIHtcbiAgICBjb25zdCBicmVha3MgPSBtYXRjaFsxXS5sZW5ndGhcbiAgICBjb25zdCBsaW5lID0gbWF0Y2hbMl1cbiAgICAvLyBsaW5lID09PSAnJyBvbmx5IGF0IHRoZSBlbmQgKHRoZSBncmVlZHkgXFxuKyBsZWF2ZXMgbm8gZW1wdHkgbGluZSBtaWQtc3RyaW5nKTtcbiAgICAvLyBwYWQgaXQgc28gdGhlIGNsb3NpbmcgcXVvdGUgY2FycmllcyBpbmRlbnQgaW5zdGVhZCBvZiBzaXR0aW5nIGF0IGNvbHVtbiAwLlxuICAgIHJlc3VsdCArPSAnXFxuJy5yZXBlYXQoYnJlYWtzICsgMSkgKyBwYWQgKyBsaW5lXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbi8vIFN0cmlwcyBvbmUgdHJhaWxpbmcgbmV3bGluZSBmcm9tIGEgYmxvY2sgc2NhbGFyOiB0aGUgZHVtcGVyIGFkZHMgaXRzIG93bixcbi8vIHNvIHdpdGhvdXQgdGhpcyBhIFwiK1wiIChrZWVwKSBjaG9tcCB3b3VsZCBnYWluIGFuIGV4dHJhIGJsYW5rIGxpbmUuXG5mdW5jdGlvbiBkcm9wRW5kaW5nTmV3bGluZSAoc3RyaW5nOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZ1tzdHJpbmcubGVuZ3RoIC0gMV0gPT09ICdcXG4nID8gc3RyaW5nLnNsaWNlKDAsIC0xKSA6IHN0cmluZ1xufVxuXG4vLyBOb3RlOiBhIGxvbmcgbGluZSB3aXRob3V0IGEgc3VpdGFibGUgYnJlYWsgcG9pbnQgd2lsbCBleGNlZWQgdGhlIHdpZHRoIGxpbWl0LlxuLy8gUHJlLWNvbmRpdGlvbnM6IGV2ZXJ5IGNoYXIgaW4gc3RyIGlzUHJpbnRhYmxlLCBzdHIubGVuZ3RoID4gMCwgd2lkdGggPiAwLlxuZnVuY3Rpb24gZm9sZEJsb2NrU2NhbGFyIChzdHJpbmc6IHN0cmluZywgd2lkdGg6IG51bWJlcikge1xuICAvLyBJbiBmb2xkZWQgc3R5bGUsICRrJCBjb25zZWN1dGl2ZSBuZXdsaW5lcyBvdXRwdXQgYXMgJGsrMSQgbmV3bGluZXPigJRcbiAgLy8gdW5sZXNzIHRoZXkncmUgYmVmb3JlIG9yIGFmdGVyIGEgbW9yZS1pbmRlbnRlZCBsaW5lLCBvciBhdCB0aGUgdmVyeVxuICAvLyBiZWdpbm5pbmcgb3IgZW5kLCBpbiB3aGljaCBjYXNlICRrJCBtYXBzIHRvICRrJC5cbiAgLy8gVGhlcmVmb3JlLCBwYXJzZSBlYWNoIGNodW5rIGFzIG5ld2xpbmUocykgZm9sbG93ZWQgYnkgYSBjb250ZW50IGxpbmUuXG4gIGNvbnN0IGxpbmVSZSA9IC8oXFxuKykoW15cXG5dKikvZ1xuXG4gIC8vIGZpcnN0IGxpbmUgKHBvc3NpYmx5IGFuIGVtcHR5IGxpbmUpXG4gIGxldCBuZXh0TEYgPSBzdHJpbmcuaW5kZXhPZignXFxuJylcbiAgaWYgKG5leHRMRiA9PT0gLTEpIG5leHRMRiA9IHN0cmluZy5sZW5ndGhcbiAgbGluZVJlLmxhc3RJbmRleCA9IG5leHRMRlxuICBsZXQgcmVzdWx0ID0gZm9sZExpbmUoc3RyaW5nLnNsaWNlKDAsIG5leHRMRiksIHdpZHRoKVxuICAvLyBJZiB3ZSBoYXZlbid0IHJlYWNoZWQgdGhlIGZpcnN0IGNvbnRlbnQgbGluZSB5ZXQsIGRvbid0IGFkZCBhbiBleHRyYSBcXG4uXG4gIGxldCBwcmV2TW9yZUluZGVudGVkID0gc3RyaW5nWzBdID09PSAnXFxuJyB8fCBzdHJpbmdbMF0gPT09ICcgJ1xuICBsZXQgbW9yZUluZGVudGVkXG5cbiAgLy8gcmVzdCBvZiB0aGUgbGluZXNcbiAgbGV0IG1hdGNoXG4gIHdoaWxlICgobWF0Y2ggPSBsaW5lUmUuZXhlYyhzdHJpbmcpKSkge1xuICAgIGNvbnN0IHByZWZpeCA9IG1hdGNoWzFdXG4gICAgY29uc3QgbGluZSA9IG1hdGNoWzJdXG5cbiAgICBtb3JlSW5kZW50ZWQgPSAobGluZVswXSA9PT0gJyAnKVxuICAgIHJlc3VsdCArPSBwcmVmaXggK1xuICAgICAgKCghcHJldk1vcmVJbmRlbnRlZCAmJiAhbW9yZUluZGVudGVkICYmIGxpbmUgIT09ICcnKSA/ICdcXG4nIDogJycpICtcbiAgICAgIGZvbGRMaW5lKGxpbmUsIHdpZHRoKVxuICAgIHByZXZNb3JlSW5kZW50ZWQgPSBtb3JlSW5kZW50ZWRcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuLy8gR3JlZWR5IGxpbmUgYnJlYWtpbmcuXG4vLyBQaWNrcyB0aGUgbG9uZ2VzdCBsaW5lIHVuZGVyIHRoZSBsaW1pdCBlYWNoIHRpbWUsXG4vLyBvdGhlcndpc2Ugc2V0dGxlcyBmb3IgdGhlIHNob3J0ZXN0IGxpbmUgb3ZlciB0aGUgbGltaXQuXG4vLyBOQi4gTW9yZS1pbmRlbnRlZCBsaW5lcyAqY2Fubm90KiBiZSBmb2xkZWQsIGFzIHRoYXQgd291bGQgYWRkIGFuIGV4dHJhIFxcbi5cbmZ1bmN0aW9uIGZvbGRMaW5lIChsaW5lOiBzdHJpbmcsIHdpZHRoOiBudW1iZXIpIHtcbiAgaWYgKGxpbmUgPT09ICcnIHx8IGxpbmVbMF0gPT09ICcgJykgcmV0dXJuIGxpbmVcblxuICAvLyBTaW5jZSBhIG1vcmUtaW5kZW50ZWQgbGluZSBhZGRzIGEgXFxuLCBicmVha3MgY2FuJ3QgYmUgZm9sbG93ZWQgYnkgYSBzcGFjZS5cbiAgY29uc3QgYnJlYWtSZSA9IC8gW14gXS9nIC8vIG5vdGU6IHRoZSBtYXRjaCBpbmRleCB3aWxsIGFsd2F5cyBiZSA8PSBsZW5ndGgtMi5cbiAgbGV0IG1hdGNoXG4gIC8vIHN0YXJ0IGlzIGFuIGluY2x1c2l2ZSBpbmRleC4gZW5kLCBjdXJyLCBhbmQgbmV4dCBhcmUgZXhjbHVzaXZlLlxuICBsZXQgc3RhcnQgPSAwXG4gIGxldCBlbmRcbiAgbGV0IGN1cnIgPSAwXG4gIGxldCBuZXh0ID0gMFxuICBsZXQgcmVzdWx0ID0gJydcblxuICAvLyBJbnZhcmlhbnRzOiAwIDw9IHN0YXJ0IDw9IGxlbmd0aC0xLlxuICAvLyAgIDAgPD0gY3VyciA8PSBuZXh0IDw9IG1heCgwLCBsZW5ndGgtMikuIGN1cnIgLSBzdGFydCA8PSB3aWR0aC5cbiAgLy8gSW5zaWRlIHRoZSBsb29wOlxuICAvLyAgIEEgbWF0Y2ggaW1wbGllcyBsZW5ndGggPj0gMiwgc28gY3VyciBhbmQgbmV4dCBhcmUgPD0gbGVuZ3RoLTIuXG4gIHdoaWxlICgobWF0Y2ggPSBicmVha1JlLmV4ZWMobGluZSkpKSB7XG4gICAgbmV4dCA9IG1hdGNoLmluZGV4XG4gICAgLy8gbWFpbnRhaW4gaW52YXJpYW50OiBjdXJyIC0gc3RhcnQgPD0gd2lkdGhcbiAgICBpZiAobmV4dCAtIHN0YXJ0ID4gd2lkdGgpIHtcbiAgICAgIGVuZCA9IChjdXJyID4gc3RhcnQpID8gY3VyciA6IG5leHQgLy8gZGVyaXZlIGVuZCA8PSBsZW5ndGgtMlxuICAgICAgcmVzdWx0ICs9IGBcXG4ke2xpbmUuc2xpY2Uoc3RhcnQsIGVuZCl9YFxuICAgICAgLy8gc2tpcCB0aGUgc3BhY2UgdGhhdCB3YXMgb3V0cHV0IGFzIFxcblxuICAgICAgc3RhcnQgPSBlbmQgKyAxICAgICAgICAgICAgICAgICAgICAvLyBkZXJpdmUgc3RhcnQgPD0gbGVuZ3RoLTFcbiAgICB9XG4gICAgY3VyciA9IG5leHRcbiAgfVxuXG4gIC8vIEJ5IHRoZSBpbnZhcmlhbnRzLCBzdGFydCA8PSBsZW5ndGgtMSwgc28gdGhlcmUgaXMgc29tZXRoaW5nIGxlZnQgb3Zlci5cbiAgLy8gSXQgaXMgZWl0aGVyIHRoZSB3aG9sZSBzdHJpbmcgb3IgYSBwYXJ0IHN0YXJ0aW5nIGZyb20gbm9uLXdoaXRlc3BhY2UuXG4gIHJlc3VsdCArPSAnXFxuJ1xuICAvLyBJbnNlcnQgYSBicmVhayBpZiB0aGUgcmVtYWluZGVyIGlzIHRvbyBsb25nIGFuZCB0aGVyZSBpcyBhIGJyZWFrIGF2YWlsYWJsZS5cbiAgaWYgKGxpbmUubGVuZ3RoIC0gc3RhcnQgPiB3aWR0aCAmJiBjdXJyID4gc3RhcnQpIHtcbiAgICByZXN1bHQgKz0gYCR7bGluZS5zbGljZShzdGFydCwgY3Vycil9XFxuJHtsaW5lLnNsaWNlKGN1cnIgKyAxKX1gXG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ICs9IGxpbmUuc2xpY2Uoc3RhcnQpXG4gIH1cblxuICByZXR1cm4gcmVzdWx0LnNsaWNlKDEpIC8vIGRyb3AgZXh0cmEgXFxuIGpvaW5lclxufVxuXG5mdW5jdGlvbiBlc2NhcGVTdHJpbmcgKHN0cmluZzogc3RyaW5nKSB7XG4gIGxldCByZXN1bHQgPSAnJ1xuICBsZXQgY2hhciA9IDBcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGNoYXIgPj0gMHgxMDAwMCA/IGkgKz0gMiA6IGkrKykge1xuICAgIGNoYXIgPSBjb2RlUG9pbnRBdChzdHJpbmcsIGkpXG4gICAgY29uc3QgZXNjYXBlU2VxID0gRVNDQVBFX1NFUVVFTkNFU1tjaGFyXVxuXG4gICAgaWYgKGVzY2FwZVNlcSkge1xuICAgICAgcmVzdWx0ICs9IGVzY2FwZVNlcVxuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICBpZiAoaXNQcmludGFibGUoY2hhcikpIHtcbiAgICAgIHJlc3VsdCArPSBzdHJpbmdbaV1cbiAgICAgIGlmIChjaGFyID49IDB4MTAwMDApIHJlc3VsdCArPSBzdHJpbmdbaSArIDFdXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIHJlc3VsdCArPSBlbmNvZGVOb25QcmludGFibGUoY2hhcilcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG93U2VxdWVuY2UgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgbGV2ZWw6IG51bWJlciwgbm9kZTogU2VxdWVuY2VOb2RlKSB7XG4gIGxldCByZXN1bHQgPSAnJ1xuXG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gbm9kZS5pdGVtcy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgY29uc3QgaXRlbSA9IHdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwsIG5vZGUuaXRlbXNbaW5kZXhdLCB7fSlcbiAgICBpZiAocmVzdWx0ICE9PSAnJykgcmVzdWx0ICs9IGAsJHshc3RhdGUuZmxvd1NraXBDb21tYVNwYWNlID8gJyAnIDogJyd9YFxuICAgIHJlc3VsdCArPSBpdGVtXG4gIH1cblxuICBjb25zdCBwYWQgPSBzdGF0ZS5mbG93QnJhY2tldFBhZGRpbmcgJiYgcmVzdWx0ICE9PSAnJyA/ICcgJyA6ICcnXG4gIHJldHVybiBgWyR7cGFkfSR7cmVzdWx0fSR7cGFkfV1gXG59XG5cbmZ1bmN0aW9uIHdyaXRlQmxvY2tTZXF1ZW5jZSAoc3RhdGU6IFByZXNlbnRlclN0YXRlLCBsZXZlbDogbnVtYmVyLCBub2RlOiBTZXF1ZW5jZU5vZGUsIGNvbXBhY3Q6IGJvb2xlYW4pIHtcbiAgbGV0IHJlc3VsdCA9ICcnXG5cbiAgZm9yIChsZXQgaW5kZXggPSAwLCBsZW5ndGggPSBub2RlLml0ZW1zLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCBpdGVtID0gd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCArIDEsIG5vZGUuaXRlbXNbaW5kZXhdLFxuICAgICAgeyBibG9jazogdHJ1ZSwgY29tcGFjdDogc3RhdGUuc2VxSW5saW5lRmlyc3QsIGlzYmxvY2tzZXE6IHRydWUgfSlcblxuICAgIGlmICghY29tcGFjdCB8fCByZXN1bHQgIT09ICcnKSB7XG4gICAgICByZXN1bHQgKz0gZ2VuZXJhdGVOZXh0TGluZShzdGF0ZSwgbGV2ZWwpXG4gICAgfVxuXG4gICAgLy8gTm8gdHJhaWxpbmcgc3BhY2Ugd2hlbiB0aGUgdmFsdWUgcmVuZGVycyBlbXB0eSAoZS5nLiBudWxsIOKGkiAnJykuXG4gICAgaWYgKGl0ZW0gPT09ICcnIHx8IENIQVJfTElORV9GRUVEID09PSBpdGVtLmNoYXJDb2RlQXQoMCkpIHtcbiAgICAgIHJlc3VsdCArPSAnLSdcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ICs9ICctICdcbiAgICB9XG5cbiAgICByZXN1bHQgKz0gaXRlbVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb3dNYXBwaW5nIChzdGF0ZTogUHJlc2VudGVyU3RhdGUsIGxldmVsOiBudW1iZXIsIG5vZGU6IE1hcHBpbmdOb2RlKSB7XG4gIGxldCByZXN1bHQgPSAnJ1xuICBjb25zdCBpdGVtcyA9IHNvcnRNYXBwaW5nSXRlbXMoc3RhdGUsIG5vZGUuaXRlbXMpXG5cbiAgZm9yIChjb25zdCB7IGtleSwgdmFsdWUgfSBvZiBpdGVtcykge1xuICAgIGxldCBwYWlyQnVmZmVyID0gJydcbiAgICBpZiAocmVzdWx0ICE9PSAnJykgcGFpckJ1ZmZlciArPSBgLCR7IXN0YXRlLmZsb3dTa2lwQ29tbWFTcGFjZSA/ICcgJyA6ICcnfWBcblxuICAgIGNvbnN0IGtleVRleHQgPSB3cml0ZU5vZGUoc3RhdGUsIGxldmVsLCBrZXksIHsgaXNrZXk6IHRydWUgfSlcbiAgICBjb25zdCBleHBsaWNpdFBhaXIgPSBrZXlUZXh0Lmxlbmd0aCA+IDEwMjRcblxuICAgIGlmIChleHBsaWNpdFBhaXIpIHtcbiAgICAgIHBhaXJCdWZmZXIgKz0gJz8gJ1xuICAgIH0gZWxzZSBpZiAoc3RhdGUucXVvdGVGbG93S2V5cykge1xuICAgICAgcGFpckJ1ZmZlciArPSAnXCInXG4gICAgfVxuXG4gICAgY29uc3QgdmFsdWVUZXh0ID0gd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCwgdmFsdWUsIHt9KVxuICAgIC8vIE5vIHNlcGFyYXRpbmcgc3BhY2Ugd2hlbiB0aGUgdmFsdWUgcmVuZGVycyBlbXB0eSAoZS5nLiBudWxsIOKGkiAnJykuXG4gICAgY29uc3Qgc2VwID0gc3RhdGUuZmxvd1NraXBDb2xvblNwYWNlIHx8IHZhbHVlVGV4dCA9PT0gJycgPyAnJyA6ICcgJ1xuXG4gICAgcGFpckJ1ZmZlciArPSBgJHtrZXlUZXh0fSR7c3RhdGUucXVvdGVGbG93S2V5cyAmJiAhZXhwbGljaXRQYWlyID8gJ1wiJyA6ICcnfToke3NlcH0ke3ZhbHVlVGV4dH1gXG5cbiAgICByZXN1bHQgKz0gcGFpckJ1ZmZlclxuICB9XG5cbiAgY29uc3QgcGFkID0gc3RhdGUuZmxvd0JyYWNrZXRQYWRkaW5nICYmIHJlc3VsdCAhPT0gJycgPyAnICcgOiAnJ1xuICByZXR1cm4gYHske3BhZH0ke3Jlc3VsdH0ke3BhZH19YFxufVxuXG4vLyBBIHNjYWxhciBrZXkgc29ydHMgYnkgaXRzIHRleHQ7IHRoZSBkZWZhdWx0IHNvcnQgYW5kIGEgY3VzdG9tIGNvbXBhcmF0b3IgYm90aFxuLy8gc2VlIHRoYXQsIG1hdGNoaW5nIHRoZSBvcmlnaW5hbCBrZXlzLWFycmF5IHNvcnQuXG5mdW5jdGlvbiBzb3J0S2V5VmFsdWUgKGtleTogTm9kZSk6IGFueSB7XG4gIHJldHVybiBrZXkua2luZCA9PT0gJ3NjYWxhcicgPyBrZXkudmFsdWUgOiBrZXlcbn1cblxuZnVuY3Rpb24gc29ydE1hcHBpbmdJdGVtcyAoc3RhdGU6IFByZXNlbnRlclN0YXRlLCBpdGVtczogTWFwcGluZ05vZGVbJ2l0ZW1zJ10pIHtcbiAgaWYgKCFzdGF0ZS5zb3J0S2V5cykgcmV0dXJuIGl0ZW1zXG5cbiAgY29uc3QgY29weSA9IGl0ZW1zLnNsaWNlKClcblxuICBpZiAoc3RhdGUuc29ydEtleXMgPT09IHRydWUpIHtcbiAgICBjb3B5LnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIGNvbnN0IHggPSBzb3J0S2V5VmFsdWUoYS5rZXkpXG4gICAgICBjb25zdCB5ID0gc29ydEtleVZhbHVlKGIua2V5KVxuICAgICAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgICAgIGlmICh4ID4geSkgcmV0dXJuIDFcbiAgICAgIHJldHVybiAwXG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBmbiA9IHN0YXRlLnNvcnRLZXlzXG4gICAgY29weS5zb3J0KChhLCBiKSA9PiBmbihzb3J0S2V5VmFsdWUoYS5rZXkpLCBzb3J0S2V5VmFsdWUoYi5rZXkpKSlcbiAgfVxuXG4gIHJldHVybiBjb3B5XG59XG5cbmZ1bmN0aW9uIHdyaXRlQmxvY2tNYXBwaW5nIChzdGF0ZTogUHJlc2VudGVyU3RhdGUsIGxldmVsOiBudW1iZXIsIG5vZGU6IE1hcHBpbmdOb2RlLCBjb21wYWN0OiBib29sZWFuKSB7XG4gIGxldCByZXN1bHQgPSAnJ1xuICBjb25zdCBpdGVtcyA9IHNvcnRNYXBwaW5nSXRlbXMoc3RhdGUsIG5vZGUuaXRlbXMpXG5cbiAgZm9yIChsZXQgaW5kZXggPSAwLCBsZW5ndGggPSBpdGVtcy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgbGV0IHBhaXJCdWZmZXIgPSAnJ1xuXG4gICAgaWYgKCFjb21wYWN0IHx8IHJlc3VsdCAhPT0gJycpIHtcbiAgICAgIHBhaXJCdWZmZXIgKz0gZ2VuZXJhdGVOZXh0TGluZShzdGF0ZSwgbGV2ZWwpXG4gICAgfVxuXG4gICAgY29uc3QgeyBrZXksIHZhbHVlIH0gPSBpdGVtc1tpbmRleF1cblxuICAgIC8vIEEgYmxvY2sga2V5IOKAlCBhIGJsb2NrIGNvbGxlY3Rpb24gKG1hcHBpbmcvc2VxdWVuY2UpIG9yIGEgYmxvY2sgc2NhbGFyXG4gICAgLy8gKGxpdGVyYWwvZm9sZGVkKSDigJQgY2FuJ3Qgc2l0IG9uIGEgYGtleTpgIGxpbmUsIHNvIGl0J3Mgd3JpdHRlbiB3aXRoIGJsb2NrXG4gICAgLy8gY29udGV4dCBhbmQgdGhlIHBhaXIgdGFrZXMgdGhlIGV4cGxpY2l0IGA/IGtleSAvIDogdmFsdWVgIGZvcm0uIEEgc2ltcGxlXG4gICAgLy8gc2NhbGFyIGtleSBzdGF5cyBpbmxpbmUgKGZsb3ctdnMtYmxvY2sgaXMgaW52aXNpYmxlIHRoZXJlKS5cbiAgICBjb25zdCBrZXlJc0Jsb2NrID1cbiAgICAgICgoa2V5LmtpbmQgPT09ICdtYXBwaW5nJyB8fCBrZXkua2luZCA9PT0gJ3NlcXVlbmNlJykgJiZcbiAgICAgICAgIWtleS5zdHlsZS5mbG93ICYmIGtleS5pdGVtcy5sZW5ndGggIT09IDApIHx8XG4gICAgICAoa2V5LmtpbmQgPT09ICdzY2FsYXInICYmIChrZXkuc3R5bGUubGl0ZXJhbCB8fCBrZXkuc3R5bGUuZm9sZGVkKSlcblxuICAgIC8vIFRoZSBgP2AvYDpgIGluZGljYXRvcnMgc2hpZnQgY29udGVudCByaWdodCBsaWtlIGEgYC1gLCBzbyBhIGJsb2NrIGtleSBvclxuICAgIC8vIHZhbHVlIHRoYXQgc3RheXMgb24gdGhlIGluZGljYXRvciBsaW5lIGtlZXBzIGl0cyBpbmRlbnRhdGlvbiB1bmRlclxuICAgIC8vIHNlcU5vSW5kZW50IChgaXNibG9ja3NlcWApLiBPbmUgdGhhdCBkcm9wcyB0byBpdHMgb3duIGxpbmUgKHRhZy9hbmNob3IpXG4gICAgLy8gY29sbGFwc2VzIHRvIHRoZSBwYXJlbnQgaW5kZW50LCBzbyBsZWF2ZSB0aGUgZmxhZyBvZmYgdGhlcmUuXG4gICAgY29uc3Qga2V5VGV4dCA9IGtleUlzQmxvY2tcbiAgICAgID8gd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCArIDEsIGtleSxcbiAgICAgICAgeyBibG9jazogdHJ1ZSwgY29tcGFjdDogdHJ1ZSwgaXNibG9ja3NlcTogIWNhbm5vdEJlQ29tcGFjdChzdGF0ZSwga2V5LCBsZXZlbCArIDEpIH0pXG4gICAgICA6IHdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwgKyAxLCBrZXksIHsgYmxvY2s6IHRydWUsIGNvbXBhY3Q6IHRydWUsIGlza2V5OiB0cnVlIH0pXG5cbiAgICAvLyBCbG9jayBrZXksIG92ZXItbG9uZyBrZXksIG9yIG11bHRpbGluZSBzY2FsYXIga2V5IGZvcmNlcyBleHBsaWNpdCBmb3JtLlxuICAgIC8vIE11bHRpbGluZSBpc24ndCBhIHNwZWMgcmVxdWlyZW1lbnQg4oCUIGp1c3QgbWF0Y2hlcyBweXlhbWwncyBzaW1wbGUta2V5IHJ1bGUuXG4gICAgY29uc3Qga2V5SGFzTGluZUJyZWFrID0ga2V5LmtpbmQgPT09ICdzY2FsYXInICYmIGtleS52YWx1ZS5pbmRleE9mKCdcXG4nKSAhPT0gLTFcbiAgICBjb25zdCBleHBsaWNpdFBhaXIgPSBrZXlJc0Jsb2NrIHx8IGtleUhhc0xpbmVCcmVhayB8fCBrZXlUZXh0Lmxlbmd0aCA+IDEwMjRcblxuICAgIGlmIChleHBsaWNpdFBhaXIpIHtcbiAgICAgIGlmIChrZXlUZXh0ICYmIENIQVJfTElORV9GRUVEID09PSBrZXlUZXh0LmNoYXJDb2RlQXQoMCkpIHtcbiAgICAgICAgcGFpckJ1ZmZlciArPSAnPydcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhaXJCdWZmZXIgKz0gJz8gJ1xuICAgICAgfVxuICAgIH1cblxuICAgIHBhaXJCdWZmZXIgKz0ga2V5VGV4dFxuXG4gICAgaWYgKGV4cGxpY2l0UGFpcikge1xuICAgICAgcGFpckJ1ZmZlciArPSBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlLCBsZXZlbClcbiAgICB9XG5cbiAgICBjb25zdCB2YWx1ZVRleHQgPSB3cml0ZU5vZGUoc3RhdGUsIGxldmVsICsgMSwgdmFsdWUsXG4gICAgICB7IGJsb2NrOiB0cnVlLCBjb21wYWN0OiBleHBsaWNpdFBhaXIsIGlzYmxvY2tzZXE6IGV4cGxpY2l0UGFpciAmJiAhY2Fubm90QmVDb21wYWN0KHN0YXRlLCB2YWx1ZSwgbGV2ZWwgKyAxKSB9KVxuXG4gICAgLy8gS2VlcCBhIHNwYWNlIGJlZm9yZSB0aGUgY29sb24gd2hlbiB0aGUga2V5IHRleHQgZW5kcyBpbiBhIGxlYWRpbmdcbiAgICAvLyBwcm9wZXJ0eSByYXRoZXIgdGhhbiBzY2FsYXIgY29udGVudCwgc28gdGhlIGNvbG9uIGNhbid0IGJlIHJlYWQgYXMgcGFydFxuICAgIC8vIG9mIGl0LiBUd28gY2FzZXM6IGFuIGlubGluZSBhbGlhcyBrZXkgKGAqYiA6IHZgKSwgYW5kIGFuIGVtcHR5IHNjYWxhciBrZXlcbiAgICAvLyB3aG9zZSB3aG9sZSB0ZXh0IGlzIGl0cyBhbmNob3IvdGFnIChgJmEgOmAsIGAhIXN0ciA6YCkg4oCUIHdpdGhvdXQgdGhlXG4gICAgLy8gc3BhY2UgYCZhOmAgcmVwYXJzZXMgYXMgYW4gYW5jaG9yZWQgdmFsdWUsIGRyb3BwaW5nIHRoZSBudWxsIGtleS5cbiAgICBjb25zdCBrZXlJc0JhcmVQcm9wcyA9IGtleS5raW5kID09PSAnc2NhbGFyJyAmJiBrZXkudmFsdWUgPT09ICcnICYmXG4gICAgICBrZXlUZXh0ICE9PSAnJyAmJlxuICAgICAga2V5VGV4dC5jaGFyQ29kZUF0KGtleVRleHQubGVuZ3RoIC0gMSkgIT09IENIQVJfU0lOR0xFX1FVT1RFICYmXG4gICAgICBrZXlUZXh0LmNoYXJDb2RlQXQoa2V5VGV4dC5sZW5ndGggLSAxKSAhPT0gQ0hBUl9ET1VCTEVfUVVPVEVcbiAgICBjb25zdCBrZXlDb2xvblNlcCA9ICFleHBsaWNpdFBhaXIgJiYgKGtleS5raW5kID09PSAnYWxpYXMnIHx8IGtleUlzQmFyZVByb3BzKSA/ICcgJyA6ICcnXG5cbiAgICAvLyBObyB0cmFpbGluZyBzcGFjZSB3aGVuIHRoZSB2YWx1ZSByZW5kZXJzIGVtcHR5IChlLmcuIG51bGwg4oaSICcnKS5cbiAgICBpZiAodmFsdWVUZXh0ID09PSAnJyB8fCBDSEFSX0xJTkVfRkVFRCA9PT0gdmFsdWVUZXh0LmNoYXJDb2RlQXQoMCkpIHtcbiAgICAgIHBhaXJCdWZmZXIgKz0gYCR7a2V5Q29sb25TZXB9OmBcbiAgICB9IGVsc2Uge1xuICAgICAgcGFpckJ1ZmZlciArPSBgJHtrZXlDb2xvblNlcH06IGBcbiAgICB9XG5cbiAgICBwYWlyQnVmZmVyICs9IHZhbHVlVGV4dFxuXG4gICAgcmVzdWx0ICs9IHBhaXJCdWZmZXJcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuLy8gV2hlcmUgYSBub2RlIHNpdHMgcmVsYXRpdmUgdG8gaXRzIHBhcmVudCDigJQgZHJpdmVzIGxheW91dC9zdHlsZSBkZWNpc2lvbnMuXG4vLyBBbGwgZmxhZ3MgZGVmYXVsdCB0byBmYWxzZSAodGhlIGZsb3ctY29udGV4dCwgbm9uLWtleSwgbm9uLWNvbXBhY3QgY2FzZSkuXG5pbnRlcmZhY2UgTm9kZUNvbnRleHQge1xuICBibG9jaz86IGJvb2xlYW4gICAgICAvLyBibG9jayBjb250ZXh0ICh2cyBmbG93KTsgcHJvcGFnYXRlcyBkb3dud2FyZFxuICBjb21wYWN0PzogYm9vbGVhbiAgICAvLyBtYXkgc3RhcnQgb24gdGhlIGN1cnJlbnQgbGluZSAobm8gbGVhZGluZyBuZXdsaW5lKVxuICBpc2tleT86IGJvb2xlYW4gICAgICAvLyBub2RlIGlzIGEgbWFwcGluZyBrZXlcbiAgaXNibG9ja3NlcT86IGJvb2xlYW4gLy8gY29udGVudCBmb2xsb3dzIGFuIGluZGljYXRvciAoYC1gLCBvciBgP2AvYDpgIGluIGFuXG4gICAgICAgICAgICAgICAgICAgICAgIC8vIGV4cGxpY2l0IHBhaXIpIHRoYXQgYWxyZWFkeSBzaGlmdGVkIGl0IHJpZ2h0OyBrZWVwc1xuICAgICAgICAgICAgICAgICAgICAgICAvLyBpdHMgaW5kZW50YXRpb24gdW5kZXIgc2VxTm9JbmRlbnRcbn1cblxuLy8gQSBub2RlIGNhbid0IHNpdCBjb21wYWN0IG9uIGl0cyBwYXJlbnQncyBpbmRpY2F0b3IgKGAtYC9gP2AvYDpgKSBsaW5lIHdoZW4gaXRcbi8vIGNhcnJpZXMgbGVhZGluZyBwcm9wcyAodGFnL2FuY2hvcikgdGhhdCB3b3VsZCBjb2xsaWRlIHdpdGggdGhlIGluZGljYXRvciwgb3Jcbi8vIHdoZW4gdGhlIGluZGVudCBzdGVwIGlzIHRvbyBuYXJyb3cgZm9yIHRoZSAyLWNoYXIgaW5kaWNhdG9yLiBTdWNoIGEgbm9kZSBkcm9wc1xuLy8gdG8gaXRzIG93biBsaW5lOyBhIGJsb2NrIGNvbGxlY3Rpb24gdGhhdCBkb2VzIHNvIGFsc28gY29sbGFwc2VzIGl0cyBzZXFOb0luZGVudFxuLy8gaW5kZW50YXRpb24gYmFjayB0byB0aGUgcGFyZW50LlxuZnVuY3Rpb24gY2Fubm90QmVDb21wYWN0IChzdGF0ZTogUHJlc2VudGVyU3RhdGUsIG5vZGU6IE5vZGUsIGxldmVsOiBudW1iZXIpIHtcbiAgcmV0dXJuIG5vZGUuc3R5bGUudGFnZ2VkIHx8IG5vZGUuYW5jaG9yICE9PSB1bmRlZmluZWQgfHwgKHN0YXRlLmluZGVudCA8IDIgJiYgbGV2ZWwgPiAwKVxufVxuXG5mdW5jdGlvbiB3cml0ZU5vZGUgKHN0YXRlOiBQcmVzZW50ZXJTdGF0ZSwgbGV2ZWw6IG51bWJlciwgbm9kZTogTm9kZSwgY3R4OiBOb2RlQ29udGV4dCk6IHN0cmluZyB7XG4gIGlmIChub2RlLmtpbmQgPT09ICdhbGlhcycpIHJldHVybiBgKiR7bm9kZS5hbmNob3J9YFxuXG4gIGNvbnN0IHsgYmxvY2sgPSBmYWxzZSwgaXNrZXkgPSBmYWxzZSwgaXNibG9ja3NlcSA9IGZhbHNlIH0gPSBjdHhcbiAgbGV0IGNvbXBhY3QgPSBjdHguY29tcGFjdCA/PyBmYWxzZVxuXG4gIGNvbnN0IGhhc0FuY2hvciA9IG5vZGUuYW5jaG9yICE9PSB1bmRlZmluZWRcblxuICBpZiAoY2Fubm90QmVDb21wYWN0KHN0YXRlLCBub2RlLCBsZXZlbCkpIHtcbiAgICBjb21wYWN0ID0gZmFsc2VcbiAgfVxuXG4gIGxldCBib2R5OiBzdHJpbmdcbiAgbGV0IHNob3VsZFByaW50VGFnID0gbm9kZS5zdHlsZS50YWdnZWRcbiAgY29uc3QgdXNlQmxvY2tDb2xsZWN0aW9uID0gYmxvY2sgJiZcbiAgICAobm9kZS5raW5kID09PSAnbWFwcGluZycgfHwgbm9kZS5raW5kID09PSAnc2VxdWVuY2UnKSAmJlxuICAgICFub2RlLnN0eWxlLmZsb3cgJiYgbm9kZS5pdGVtcy5sZW5ndGggIT09IDBcblxuICBpZiAobm9kZS5raW5kID09PSAnbWFwcGluZycpIHtcbiAgICBpZiAodXNlQmxvY2tDb2xsZWN0aW9uKSB7XG4gICAgICBib2R5ID0gd3JpdGVCbG9ja01hcHBpbmcoc3RhdGUsIGxldmVsLCBub2RlLCBjb21wYWN0KVxuICAgIH0gZWxzZSB7XG4gICAgICBib2R5ID0gd3JpdGVGbG93TWFwcGluZyhzdGF0ZSwgbGV2ZWwsIG5vZGUpXG4gICAgfVxuICB9IGVsc2UgaWYgKG5vZGUua2luZCA9PT0gJ3NlcXVlbmNlJykge1xuICAgIGlmICh1c2VCbG9ja0NvbGxlY3Rpb24pIHtcbiAgICAgIGlmIChzdGF0ZS5zZXFOb0luZGVudCAmJiAhaXNibG9ja3NlcSAmJiBsZXZlbCA+IDApIHtcbiAgICAgICAgYm9keSA9IHdyaXRlQmxvY2tTZXF1ZW5jZShzdGF0ZSwgbGV2ZWwgLSAxLCBub2RlLCBjb21wYWN0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYm9keSA9IHdyaXRlQmxvY2tTZXF1ZW5jZShzdGF0ZSwgbGV2ZWwsIG5vZGUsIGNvbXBhY3QpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGJvZHkgPSB3cml0ZUZsb3dTZXF1ZW5jZShzdGF0ZSwgbGV2ZWwsIG5vZGUpXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGxheW91dCA9IHNjYWxhckxheW91dChzdGF0ZSwgbGV2ZWwpXG4gICAgY29uc3Qgc3R5bGUgPSByZXNvbHZlU2NhbGFyU3R5bGUoc3RhdGUsIG5vZGUsIGxheW91dCwgaXNrZXksIGJsb2NrKVxuICAgIGJvZHkgPSByZW5kZXJTY2FsYXJTdHlsZShub2RlLnZhbHVlLCBzdHlsZSwgbGF5b3V0KVxuICAgIHNob3VsZFByaW50VGFnID0gbm9kZS5zdHlsZS50YWdnZWQgfHwgKHN0eWxlICE9PSBTVFlMRV9QTEFJTiAmJiBub2RlLnRhZyAhPT0gc3RhdGUuZGVmYXVsdFNjYWxhclRhZ05hbWUpXG4gIH1cblxuICAvLyBBbiBpbmRpY2F0b3IgcGx1cyBpdHMgbWFuZGF0b3J5IHNlcGFyYXRvciBvY2N1cGllcyAyIGNvbHVtbnMuIEZvciB3aWRlclxuICAvLyBpbmRlbnRhdGlvbiwgcGFkIGEgY29tcGFjdCBibG9jayBjb2xsZWN0aW9uIHNvIGl0cyBmaXJzdCBpdGVtIHN0YXJ0cyBhdFxuICAvLyB0aGUgc2FtZSBjb2x1bW4gYXMgdGhlIGZvbGxvd2luZyBpdGVtcy5cbiAgaWYgKHVzZUJsb2NrQ29sbGVjdGlvbiAmJiBjb21wYWN0ICYmIGxldmVsID4gMCAmJiBzdGF0ZS5pbmRlbnQgPiAyKSB7XG4gICAgYm9keSA9IGAkeycgJy5yZXBlYXQoc3RhdGUuaW5kZW50IC0gMil9JHtib2R5fWBcbiAgfVxuXG4gIGlmIChzaG91bGRQcmludFRhZyB8fCBoYXNBbmNob3IpIHtcbiAgICBjb25zdCBwcm9wczogc3RyaW5nW10gPSBbXVxuICAgIGNvbnN0IHRhZyA9IHNob3VsZFByaW50VGFnID8gbm9kZVRhZ1Nob3J0KG5vZGUpIDogbnVsbFxuICAgIGNvbnN0IGFuY2hvciA9IGhhc0FuY2hvciA/IGAmJHtub2RlLmFuY2hvcn1gIDogbnVsbFxuXG4gICAgaWYgKHN0YXRlLnRhZ0JlZm9yZUFuY2hvcikge1xuICAgICAgaWYgKHRhZyAhPT0gbnVsbCkgcHJvcHMucHVzaCh0YWcpXG4gICAgICBpZiAoYW5jaG9yICE9PSBudWxsKSBwcm9wcy5wdXNoKGFuY2hvcilcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGFuY2hvciAhPT0gbnVsbCkgcHJvcHMucHVzaChhbmNob3IpXG4gICAgICBpZiAodGFnICE9PSBudWxsKSBwcm9wcy5wdXNoKHRhZylcbiAgICB9XG5cbiAgICAvLyBObyBzZXBhcmF0b3Igd2hlbiB0aGUgYm9keSBpcyBlbXB0eSAoZS5nLiBgJmFuY2hvcmAgb24gYSBudWxsIG5vZGUpIG9yXG4gICAgLy8gYWxyZWFkeSBzdGFydHMgb24gaXRzIG93biBsaW5lLlxuICAgIGNvbnN0IHNlcCA9IGJvZHkgPT09ICcnIHx8IGJvZHkuY2hhckNvZGVBdCgwKSA9PT0gQ0hBUl9MSU5FX0ZFRUQgPyAnJyA6ICcgJ1xuICAgIGJvZHkgPSBgJHtwcm9wcy5qb2luKCcgJyl9JHtzZXB9JHtib2R5fWBcbiAgfVxuXG4gIHJldHVybiBib2R5XG59XG5cbi8vIEEgYmFyZSAodW50YWdnZWQsIHVuYW5jaG9yZWQpIG5vbi1lbXB0eSBibG9jayBjb2xsZWN0aW9uOiB3cml0ZU5vZGUgcmVuZGVycyBpdFxuLy8gaW4gY29tcGFjdCBmb3JtIHdpdGggaXRzIGZpcnN0IGl0ZW0gb24gdGhlIG9wZW5pbmcgbGluZS4gVGhhdCB3b3JrcyBtaWQtc3RyZWFtLFxuLy8gYnV0IHJpZ2h0IGFmdGVyIGEgYC0tLWAgdGhlIGZpcnN0IGl0ZW0gbXVzdCBkcm9wIHRvIHRoZSBuZXh0IGxpbmUuIEEgdGFnL2FuY2hvclxuLy8gYWxyZWFkeSBmb3JjZXMgdGhlIGJvZHkgb250byBpdHMgb3duIGxpbmUsIHNvIHRob3NlIHN0YXkgb24gdGhlIGAtLS1gIGxpbmUuXG5mdW5jdGlvbiByb290U3RhcnRzT3duTGluZSAobm9kZTogTm9kZSkge1xuICByZXR1cm4gKG5vZGUua2luZCA9PT0gJ3NlcXVlbmNlJyB8fCBub2RlLmtpbmQgPT09ICdtYXBwaW5nJykgJiZcbiAgICAhbm9kZS5zdHlsZS5mbG93ICYmXG4gICAgbm9kZS5pdGVtcy5sZW5ndGggIT09IDAgJiZcbiAgICAhbm9kZS5zdHlsZS50YWdnZWQgJiZcbiAgICBub2RlLmFuY2hvciA9PT0gdW5kZWZpbmVkXG59XG5cbi8vIEEgZG9jdW1lbnQgd2hvc2Ugc2VyaWFsaXphdGlvbiBlbmRzIHdpdGggYSBrZWVwLWNob21wZWQgKGArYCkgYmxvY2sgc2NhbGFyIGlzXG4vLyBvcGVuLWVuZGVkOiB0aGUgdHJhaWxpbmcgYmxhbmsgbGluZShzKSB3b3VsZCBvdGhlcndpc2UgYmUgYW1iaWd1b3VzLCBzbyBpdFxuLy8gbmVlZHMgYSBgLi4uYCB0ZXJtaW5hdG9yLiBNaXJyb3JzIHRoZSBrZWVwIHRlc3QgaW4gYGJsb2NrSGVhZGVyYC5cbmZ1bmN0aW9uIGlzT3BlbkVuZGVkIChub2RlOiBOb2RlKSB7XG4gIC8vIERlc2NlbmQgdG8gdGhlIGxhc3QgbGVhZiwgYWx3YXlzIHRha2luZyB0aGUgbGFzdCBpdGVtIG9mIGEgYmxvY2sgY29sbGVjdGlvblxuICAvLyAoYSBmbG93IGNvbGxlY3Rpb24gcmVuZGVycyBvbiBvbmUgbGluZSwgc28gaXQgZW5kcyB0aGUgZG9jdW1lbnQgaXRzZWxmKS5cbiAgbGV0IGxlYWYgPSBub2RlXG4gIHdoaWxlICgobGVhZi5raW5kID09PSAnc2VxdWVuY2UnIHx8IGxlYWYua2luZCA9PT0gJ21hcHBpbmcnKSAmJlxuICAgICFsZWFmLnN0eWxlLmZsb3cgJiYgbGVhZi5pdGVtcy5sZW5ndGggIT09IDApIHtcbiAgICBsZWFmID0gbGVhZi5raW5kID09PSAnc2VxdWVuY2UnXG4gICAgICA/IGxlYWYuaXRlbXNbbGVhZi5pdGVtcy5sZW5ndGggLSAxXVxuICAgICAgOiBsZWFmLml0ZW1zW2xlYWYuaXRlbXMubGVuZ3RoIC0gMV0udmFsdWVcbiAgfVxuXG4gIGlmIChsZWFmLmtpbmQgIT09ICdzY2FsYXInIHx8ICEobGVhZi5zdHlsZS5saXRlcmFsIHx8IGxlYWYuc3R5bGUuZm9sZGVkKSkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGxlYWZcbiAgLy8gS2VlcCBjaG9tcGluZzogZW5kcyBpbiBhIGJsYW5rIGxpbmUgKGBcXG5cXG5gKSBvciBpcyBhIGxvbmUgYFxcbmAuXG4gIHJldHVybiB2YWx1ZS5lbmRzV2l0aCgnXFxuXFxuJykgfHwgdmFsdWUgPT09ICdcXG4nXG59XG5cbmZ1bmN0aW9uIHdyaXRlRG9jdW1lbnREaXJlY3RpdmVzIChkb2M6IERvY3VtZW50KSB7XG4gIGxldCByZXN1bHQgPSAnJ1xuXG4gIGZvciAoY29uc3QgZGlyZWN0aXZlIG9mIGRvYy5kaXJlY3RpdmVzKSB7XG4gICAgaWYgKGRpcmVjdGl2ZS5raW5kID09PSAneWFtbCcpIHtcbiAgICAgIHJlc3VsdCArPSBgJVlBTUwgJHtkaXJlY3RpdmUudmVyc2lvbn1cXG5gXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIGNvbnN0IHsgaGFuZGxlLCBwcmVmaXggfSA9IGRpcmVjdGl2ZVxuICAgIHJlc3VsdCArPSBgJVRBRyAke2hhbmRsZX0gJHtwcmVmaXh9XFxuYFxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG4vLyBEb2N1bWVudHMg4oaSIHRleHQsIGluY2x1ZGluZyB0aGUgdHJhaWxpbmcgbmV3bGluZS5cbmZ1bmN0aW9uIHByZXNlbnQgKGRvY3VtZW50czogRG9jdW1lbnRbXSwgb3B0aW9uczogUHJlc2VudGVyT3B0aW9ucyk6IHN0cmluZyB7XG4gIGNvbnN0IHN0YXRlID0gY3JlYXRlUHJlc2VudGVyU3RhdGUob3B0aW9ucylcbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGxldCBwcmV2aW91c0VuZGVkID0gZmFsc2VcblxuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZG9jdW1lbnRzLmxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGNvbnN0IGRvYyA9IGRvY3VtZW50c1tpbmRleF1cbiAgICBjb25zdCBkaXJlY3RpdmVzID0gd3JpdGVEb2N1bWVudERpcmVjdGl2ZXMoZG9jKVxuICAgIGNvbnN0IGhhc0RpcmVjdGl2ZXMgPSBkaXJlY3RpdmVzICE9PSAnJ1xuICAgIGNvbnN0IG1hcmtlciA9IGRvYy5leHBsaWNpdFN0YXJ0IHx8IGhhc0RpcmVjdGl2ZXMgfHwgKGluZGV4ID4gMCAmJiAhcHJldmlvdXNFbmRlZClcblxuICAgIHJlc3VsdCArPSBkaXJlY3RpdmVzXG5cbiAgICBpZiAoZG9jLmNvbnRlbnRzID09PSBudWxsKSB7XG4gICAgICBpZiAobWFya2VyKSByZXN1bHQgKz0gJy0tLVxcbidcbiAgICB9IGVsc2UgaWYgKG1hcmtlcikge1xuICAgICAgY29uc3QgYm9keSA9IHdyaXRlTm9kZShzdGF0ZSwgMCwgZG9jLmNvbnRlbnRzLCB7IGJsb2NrOiB0cnVlLCBjb21wYWN0OiB0cnVlIH0pXG4gICAgICAvLyBDb250ZW50IHNoYXJlcyB0aGUgYC0tLWAgbGluZSwgZXhjZXB0OiBhbiBlbXB0eSByZW5kZXIgKG5vIHNlcGFyYXRvciBhdFxuICAgICAgLy8gYWxsKSwgYSBiYXJlIGJsb2NrIGNvbGxlY3Rpb24gKHdyYXBzIHRvIHRoZSBuZXh0IGxpbmUpLCBvciBkaXJlY3RpdmVzXG4gICAgICAvLyBmb3JjaW5nIGAtLS1gIG9udG8gaXRzIG93biBsaW5lLlxuICAgICAgY29uc3Qgc2VwID0gYm9keSA9PT0gJycgPyAnJyA6IChoYXNEaXJlY3RpdmVzIHx8IHJvb3RTdGFydHNPd25MaW5lKGRvYy5jb250ZW50cykgPyAnXFxuJyA6ICcgJylcbiAgICAgIHJlc3VsdCArPSBgLS0tJHtzZXB9JHtib2R5fVxcbmBcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ICs9IHdyaXRlTm9kZShzdGF0ZSwgMCwgZG9jLmNvbnRlbnRzLCB7IGJsb2NrOiB0cnVlLCBjb21wYWN0OiB0cnVlIH0pICsgJ1xcbidcbiAgICB9XG5cbiAgICBwcmV2aW91c0VuZGVkID0gZG9jLmV4cGxpY2l0RW5kIHx8IChkb2MuY29udGVudHMgIT09IG51bGwgJiYgaXNPcGVuRW5kZWQoZG9jLmNvbnRlbnRzKSlcbiAgICBpZiAocHJldmlvdXNFbmRlZCkge1xuICAgICAgcmVzdWx0ICs9ICcuLi5cXG4nXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5leHBvcnQge1xuICBERUZBVUxUX1BSRVNFTlRFUl9PUFRJT05TLFxuICBwcmVzZW50LFxuICB0eXBlIFByZXNlbnRlck9wdGlvbnNcbn1cbiIsICJpbXBvcnQgeyBZQU1MMTFfU0NIRU1BLCB0eXBlIFNjaGVtYSB9IGZyb20gJy4vc2NoZW1hLnRzJ1xuaW1wb3J0IHsganNUb0FzdCB9IGZyb20gJy4vYXN0L2Zyb21fanMudHMnXG5pbXBvcnQgeyB2aXNpdCwgVklTSVRfU0tJUCB9IGZyb20gJy4vYXN0L3Zpc2l0LnRzJ1xuaW1wb3J0IHsgdHlwZSBEb2N1bWVudCB9IGZyb20gJy4vYXN0L25vZGVzLnRzJ1xuaW1wb3J0IHtcbiAgREVGQVVMVF9QUkVTRU5URVJfT1BUSU9OUyxcbiAgcHJlc2VudCxcbiAgdHlwZSBQcmVzZW50ZXJPcHRpb25zXG59IGZyb20gJy4vYXN0L3ByZXNlbnRlci50cydcbmltcG9ydCB7IHBpY2sgfSBmcm9tICcuL2NvbW1vbi9vYmplY3QudHMnXG5pbXBvcnQgeyBOT1RfUkVTT0xWRUQgfSBmcm9tICcuL3RhZy50cydcbmltcG9ydCB7IGludENvcmVUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvaW50X2NvcmUudHMnXG5pbXBvcnQgeyBpbnRZYW1sMTFUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvaW50X3lhbWwxMS50cydcbmltcG9ydCB7IGZsb2F0Q29yZVRhZyB9IGZyb20gJy4vdGFnL3NjYWxhci9mbG9hdF9jb3JlLnRzJ1xuaW1wb3J0IHsgZmxvYXRZYW1sMTFUYWcgfSBmcm9tICcuL3RhZy9zY2FsYXIvZmxvYXRfeWFtbDExLnRzJ1xuXG5pbnRlcmZhY2UgRHVtcE9wdGlvbnMgZXh0ZW5kcyBPbWl0PFByZXNlbnRlck9wdGlvbnMsICdzY2hlbWEnPiB7XG4gIHNjaGVtYT86IFNjaGVtYVxuICBza2lwSW52YWxpZD86IGJvb2xlYW5cbiAgbm9SZWZzPzogYm9vbGVhblxuICBmbG93TGV2ZWw/OiBudW1iZXJcbiAgdHJhbnNmb3JtPzogKGRvY3VtZW50czogRG9jdW1lbnRbXSkgPT4gdm9pZFxufVxuXG4vLyBZQU1MIDEuMSBtaXNzZXMgWUFNTCAxLjIgYDBvLi4uYCBpbnRzIGFuZCBleHBvbmVudC1vbmx5IGZsb2F0cy5cbi8vIENvbWJpbmUgcmVzb2x2ZXJzIHNvIGFsbCBwb3NzaWJsZSBjb2xsaXNpb25zIGFyZSBxdW90ZWQuXG5jb25zdCBERUZBVUxUX0RVTVBfU0NIRU1BID0gWUFNTDExX1NDSEVNQS53aXRoVGFncyhcbiAge1xuICAgIC4uLmludFlhbWwxMVRhZyxcbiAgICByZXNvbHZlOiAoc291cmNlLCBpc0V4cGxpY2l0LCB0YWdOYW1lKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBpbnRZYW1sMTFUYWcucmVzb2x2ZShzb3VyY2UsIGlzRXhwbGljaXQsIHRhZ05hbWUpXG4gICAgICByZXR1cm4gcmVzdWx0ID09PSBOT1RfUkVTT0xWRUQgPyBpbnRDb3JlVGFnLnJlc29sdmUoc291cmNlLCBpc0V4cGxpY2l0LCB0YWdOYW1lKSA6IHJlc3VsdFxuICAgIH1cbiAgfSxcbiAge1xuICAgIC4uLmZsb2F0WWFtbDExVGFnLFxuICAgIHJlc29sdmU6IChzb3VyY2UsIGlzRXhwbGljaXQsIHRhZ05hbWUpID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGZsb2F0WWFtbDExVGFnLnJlc29sdmUoc291cmNlLCBpc0V4cGxpY2l0LCB0YWdOYW1lKVxuICAgICAgcmV0dXJuIHJlc3VsdCA9PT0gTk9UX1JFU09MVkVEID8gZmxvYXRDb3JlVGFnLnJlc29sdmUoc291cmNlLCBpc0V4cGxpY2l0LCB0YWdOYW1lKSA6IHJlc3VsdFxuICAgIH1cbiAgfVxuKVxuXG5jb25zdCBERUZBVUxUX0RVTVBfT1BUSU9OUzogUmVxdWlyZWQ8RHVtcE9wdGlvbnM+ID0ge1xuICAuLi5ERUZBVUxUX1BSRVNFTlRFUl9PUFRJT05TLFxuICBzY2hlbWE6IERFRkFVTFRfRFVNUF9TQ0hFTUEsXG4gIHNraXBJbnZhbGlkOiBmYWxzZSxcbiAgbm9SZWZzOiBmYWxzZSxcbiAgZmxvd0xldmVsOiAtMSxcbiAgdHJhbnNmb3JtOiAoKSA9PiB7fVxufVxuXG4vLyBPcHRpb25zIHRoYXQgbmVlZCB0aGUgSlMgdmFsdWUgKHRhZ3MsIGZvcm1hdCwgZGVkdXApIGdvIHRvIGBqc1RvQXN0YDsgcHVyZWx5XG4vLyBwcmVzZW50YXRpb25hbCBvbmVzIGdvIHRvIGBwcmVzZW50YC5cbmZ1bmN0aW9uIGR1bXAgKGlucHV0OiBhbnksIG9wdGlvbnM6IER1bXBPcHRpb25zID0ge30pIHtcbiAgY29uc3Qgb3B0cyA9IHsgLi4uREVGQVVMVF9EVU1QX09QVElPTlMsIC4uLm9wdGlvbnMgfVxuXG4gIGNvbnN0IGRvY3VtZW50cyA9IGpzVG9Bc3QoaW5wdXQsIG9wdHMuc2NoZW1hLCB7XG4gICAgbm9SZWZzOiBvcHRzLm5vUmVmcyxcbiAgICBza2lwSW52YWxpZDogb3B0cy5za2lwSW52YWxpZFxuICB9KVxuXG4gIC8vIGZsb3dMZXZlbDogZXZlcnkgbm9kZSBhdCB0aGlzIGRlcHRoIHN3aXRjaGVzIHRvIGZsb3c7IHRoZSBwcmVzZW50ZXIgZm9yY2VzXG4gIC8vIGV2ZXJ5dGhpbmcgYmVsb3cgaW50byBmbG93IHRvbywgc28gdGhlIHdhbGsgc3RvcHMgdGhlcmUuXG4gIGlmIChvcHRzLmZsb3dMZXZlbCA+PSAwKSB7XG4gICAgdmlzaXQoZG9jdW1lbnRzLCAobm9kZSwgY3R4KSA9PiB7XG4gICAgICBpZiAoY3R4LmRlcHRoIDwgb3B0cy5mbG93TGV2ZWwpIHJldHVyblxuICAgICAgbm9kZS5zdHlsZS5mbG93ID0gdHJ1ZVxuICAgICAgcmV0dXJuIFZJU0lUX1NLSVBcbiAgICB9KVxuICB9XG5cbiAgb3B0cy50cmFuc2Zvcm0oZG9jdW1lbnRzKVxuXG4gIGNvbnN0IFBSRVNFTlRFUl9PUFRfS0VZUyA9IE9iamVjdC5rZXlzKERFRkFVTFRfUFJFU0VOVEVSX09QVElPTlMpIGFzXG4gICAgKGtleW9mIHR5cGVvZiBERUZBVUxUX1BSRVNFTlRFUl9PUFRJT05TKVtdXG5cbiAgcmV0dXJuIHByZXNlbnQoZG9jdW1lbnRzLCB7IC4uLnBpY2sob3B0cywgUFJFU0VOVEVSX09QVF9LRVlTKSwgc2NoZW1hOiBvcHRzLnNjaGVtYSB9KVxufVxuXG5leHBvcnQge1xuICBkdW1wLFxuXG4gIHR5cGUgRHVtcE9wdGlvbnNcbn1cbiIsICIvLyBQYXJzZXIgZXZlbnRzIOKGkiBBU1QuIFRoZSBzZWNvbmQgZW50cnkgaW50byB0aGUgQVNUIHdvcmxkICh0aGUgZmlyc3QgYmVpbmdcbi8vIGBqc1RvQXN0YCk6IGluc3RlYWQgb2YgYnVpbGRpbmcgSlMgdmFsdWVzIGxpa2UgdGhlIGNvbnN0cnVjdG9yLCBpdCBtaXJyb3JzIHRoZVxuLy8gc2FtZSBkb2N1bWVudC9zZXF1ZW5jZS9tYXBwaW5nIGZyYW1lIHdhbGsgYW5kIGVtaXRzIGBOb2RlYHMgdGhhdCBrZWVwIHRoZVxuLy8gb3JpZ2luYWwgc3R5bGVzLCB0YWdzIGFuZCBhbmNob3JzLCBzbyBwYXJzZWQgWUFNTCBjYW4gYmUgcmUtZHVtcGVkIGZhaXRoZnVsbHkuXG5cbmltcG9ydCB7XG4gIEVWRU5UX0FMSUFTLFxuICBFVkVOVF9ET0NVTUVOVCxcbiAgRVZFTlRfTUFQUElORyxcbiAgRVZFTlRfUE9QLFxuICBFVkVOVF9TQ0FMQVIsXG4gIEVWRU5UX1NFUVVFTkNFLFxuICBTQ0FMQVJfU1RZTEVfUExBSU4sXG4gIFNDQUxBUl9TVFlMRV9TSU5HTEVfUVVPVEVELFxuICBTQ0FMQVJfU1RZTEVfRE9VQkxFX1FVT1RFRCxcbiAgU0NBTEFSX1NUWUxFX0xJVEVSQUxfQkxPQ0ssXG4gIFNDQUxBUl9TVFlMRV9GT0xERURfQkxPQ0ssXG4gIENPTExFQ1RJT05fU1RZTEVfRkxPVyxcbiAgdHlwZSBFdmVudCxcbiAgdHlwZSBNYXBwaW5nRXZlbnQsXG4gIHR5cGUgU2NhbGFyRXZlbnQsXG4gIHR5cGUgU2VxdWVuY2VFdmVudFxufSBmcm9tICcuLi9wYXJzZXIvZXZlbnRzLnRzJ1xuaW1wb3J0IHsgZ2V0U2NhbGFyVmFsdWUgfSBmcm9tICcuLi9wYXJzZXIvcGFyc2VyX3NjYWxhci50cydcbmltcG9ydCB7IHR5cGUgU2NoZW1hIH0gZnJvbSAnLi4vc2NoZW1hLnRzJ1xuaW1wb3J0IHsgTk9UX1JFU09MVkVEIH0gZnJvbSAnLi4vdGFnLnRzJ1xuaW1wb3J0IHtcbiAgU3R5bGUsXG4gIHR5cGUgTm9kZSxcbiAgdHlwZSBEb2N1bWVudCxcbiAgdHlwZSBTY2FsYXJOb2RlLFxuICB0eXBlIFNlcXVlbmNlTm9kZSxcbiAgdHlwZSBNYXBwaW5nTm9kZSxcbiAgdHlwZSBBbGlhc05vZGVcbn0gZnJvbSAnLi9ub2Rlcy50cydcblxuY29uc3QgTk9fUkFOR0UgPSAtMVxuXG5pbnRlcmZhY2UgRG9jdW1lbnRGcmFtZSB7XG4gIGtpbmQ6ICdkb2N1bWVudCdcbiAgZG9jOiBEb2N1bWVudFxufVxuXG5pbnRlcmZhY2UgU2VxdWVuY2VGcmFtZSB7XG4gIGtpbmQ6ICdzZXF1ZW5jZSdcbiAgbm9kZTogU2VxdWVuY2VOb2RlXG59XG5cbmludGVyZmFjZSBNYXBwaW5nRnJhbWUge1xuICBraW5kOiAnbWFwcGluZydcbiAgbm9kZTogTWFwcGluZ05vZGVcbiAga2V5OiBOb2RlIHwgbnVsbFxufVxuXG50eXBlIEZyYW1lID0gRG9jdW1lbnRGcmFtZSB8IFNlcXVlbmNlRnJhbWUgfCBNYXBwaW5nRnJhbWVcblxuaW50ZXJmYWNlIEZyb21FdmVudHNPcHRpb25zIHtcbiAgc291cmNlOiBzdHJpbmdcbiAgc2NoZW1hOiBTY2hlbWFcbn1cblxuaW50ZXJmYWNlIEZyb21FdmVudHNTdGF0ZSB7XG4gIHNvdXJjZTogc3RyaW5nXG4gIHNjaGVtYTogU2NoZW1hXG4gIGV2ZW50SW5kZXg6IG51bWJlclxuICBwb3NpdGlvbjogbnVtYmVyXG4gIGZyYW1lczogRnJhbWVbXVxuICBkb2N1bWVudHM6IERvY3VtZW50W11cbn1cblxuZnVuY3Rpb24gZXZlbnRQb3NpdGlvbiAoZXZlbnQ6IEV2ZW50KSB7XG4gIGlmICgndGFnU3RhcnQnIGluIGV2ZW50ICYmIGV2ZW50LnRhZ1N0YXJ0ICE9PSBOT19SQU5HRSkgcmV0dXJuIGV2ZW50LnRhZ1N0YXJ0XG4gIGlmICgnYW5jaG9yU3RhcnQnIGluIGV2ZW50ICYmIGV2ZW50LmFuY2hvclN0YXJ0ICE9PSBOT19SQU5HRSkgcmV0dXJuIGV2ZW50LmFuY2hvclN0YXJ0XG4gIGlmICgndmFsdWVTdGFydCcgaW4gZXZlbnQgJiYgZXZlbnQudmFsdWVTdGFydCAhPT0gTk9fUkFOR0UpIHJldHVybiBldmVudC52YWx1ZVN0YXJ0XG4gIGlmICgnc3RhcnQnIGluIGV2ZW50KSByZXR1cm4gZXZlbnQuc3RhcnRcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gcmF3VGFnIChzdGF0ZTogRnJvbUV2ZW50c1N0YXRlLCBldmVudDogU2NhbGFyRXZlbnQgfCBTZXF1ZW5jZUV2ZW50IHwgTWFwcGluZ0V2ZW50KSB7XG4gIHJldHVybiBldmVudC50YWdTdGFydCA9PT0gTk9fUkFOR0VcbiAgICA/ICcnXG4gICAgOiBzdGF0ZS5zb3VyY2Uuc2xpY2UoZXZlbnQudGFnU3RhcnQsIGV2ZW50LnRhZ0VuZClcbn1cblxuZnVuY3Rpb24gYW5jaG9yTmFtZSAoc3RhdGU6IEZyb21FdmVudHNTdGF0ZSwgZXZlbnQ6IFNjYWxhckV2ZW50IHwgU2VxdWVuY2VFdmVudCB8IE1hcHBpbmdFdmVudCkge1xuICByZXR1cm4gZXZlbnQuYW5jaG9yU3RhcnQgPT09IE5PX1JBTkdFXG4gICAgPyB1bmRlZmluZWRcbiAgICA6IHN0YXRlLnNvdXJjZS5zbGljZShldmVudC5hbmNob3JTdGFydCwgZXZlbnQuYW5jaG9yRW5kKVxufVxuXG4vLyBUYWcgbmFtZSBjYXJyaWVkIGJ5IGFuIGVtcHR5L3BsYWluIHNjYWxhciB3aXRoIG5vIGV4cGxpY2l0IHRhZzogdGhlIGZpcnN0XG4vLyBpbXBsaWNpdCBzY2FsYXIgcmVzb2x2ZXIgdGhhdCBhY2NlcHRzIHRoZSB0ZXh0LCBmYWxsaW5nIGJhY2sgdG8gc3RyLiBNaXJyb3JzXG4vLyB0aGUgaW1wbGljaXQgYnJhbmNoIG9mIGBjb25zdHJ1Y3RTY2FsYXJgLCBidXQgd2Ugb25seSB3YW50IHRoZSB0YWcgbmFtZS5cbmZ1bmN0aW9uIGltcGxpY2l0U2NhbGFyVGFnTmFtZSAoc3RhdGU6IEZyb21FdmVudHNTdGF0ZSwgc291cmNlOiBzdHJpbmcpIHtcbiAgY29uc3QgeyBzY2hlbWEgfSA9IHN0YXRlXG4gIGNvbnN0IGNhbmRpZGF0ZXMgPSBzY2hlbWEuaW1wbGljaXRTY2FsYXJCeUZpcnN0Q2hhci5nZXQoc291cmNlLmNoYXJBdCgwKSkgPz9cbiAgICBzY2hlbWEuaW1wbGljaXRTY2FsYXJBbnlGaXJzdENoYXJcbiAgZm9yIChjb25zdCB0YWcgb2YgY2FuZGlkYXRlcykge1xuICAgIGlmICh0YWcucmVzb2x2ZShzb3VyY2UsIGZhbHNlLCB0YWcudGFnTmFtZSkgIT09IE5PVF9SRVNPTFZFRCkgcmV0dXJuIHRhZy50YWdOYW1lXG4gIH1cbiAgcmV0dXJuIHNjaGVtYS5kZWZhdWx0U2NhbGFyVGFnLnRhZ05hbWVcbn1cblxuZnVuY3Rpb24gYnVpbGRTY2FsYXIgKHN0YXRlOiBGcm9tRXZlbnRzU3RhdGUsIGV2ZW50OiBTY2FsYXJFdmVudCk6IFNjYWxhck5vZGUge1xuICBjb25zdCB2YWx1ZSA9IGdldFNjYWxhclZhbHVlKHN0YXRlLnNvdXJjZSwgZXZlbnQpXG4gIGNvbnN0IHJhdyA9IHJhd1RhZyhzdGF0ZSwgZXZlbnQpXG4gIGNvbnN0IHN0eWxlID0gbmV3IFN0eWxlKClcblxuICBzd2l0Y2ggKGV2ZW50LnN0eWxlKSB7XG4gICAgY2FzZSBTQ0FMQVJfU1RZTEVfU0lOR0xFX1FVT1RFRDogc3R5bGUuc2luZ2xlUXVvdGVkID0gdHJ1ZTsgYnJlYWtcbiAgICBjYXNlIFNDQUxBUl9TVFlMRV9ET1VCTEVfUVVPVEVEOiBzdHlsZS5kb3VibGVRdW90ZWQgPSB0cnVlOyBicmVha1xuICAgIGNhc2UgU0NBTEFSX1NUWUxFX0xJVEVSQUxfQkxPQ0s6IHN0eWxlLmxpdGVyYWwgPSB0cnVlOyBicmVha1xuICAgIGNhc2UgU0NBTEFSX1NUWUxFX0ZPTERFRF9CTE9DSzogc3R5bGUuZm9sZGVkID0gdHJ1ZTsgYnJlYWtcbiAgfVxuXG4gIGxldCB0YWc6IHN0cmluZ1xuICBpZiAocmF3ICE9PSAnJykge1xuICAgIHN0eWxlLnRhZ2dlZCA9IHRydWVcbiAgICB0YWcgPSByYXdcbiAgfSBlbHNlIGlmIChldmVudC5zdHlsZSA9PT0gU0NBTEFSX1NUWUxFX1BMQUlOKSB7XG4gICAgdGFnID0gaW1wbGljaXRTY2FsYXJUYWdOYW1lKHN0YXRlLCB2YWx1ZSlcbiAgfSBlbHNlIHtcbiAgICB0YWcgPSBzdGF0ZS5zY2hlbWEuZGVmYXVsdFNjYWxhclRhZy50YWdOYW1lXG4gIH1cblxuICByZXR1cm4geyBraW5kOiAnc2NhbGFyJywgdGFnLCBzdHlsZSwgYW5jaG9yOiBhbmNob3JOYW1lKHN0YXRlLCBldmVudCksIHZhbHVlIH1cbn1cblxuZnVuY3Rpb24gYnVpbGRDb2xsZWN0aW9uIChcbiAgc3RhdGU6IEZyb21FdmVudHNTdGF0ZSxcbiAgZXZlbnQ6IFNlcXVlbmNlRXZlbnQgfCBNYXBwaW5nRXZlbnQsXG4gIGRlZmF1bHRUYWdOYW1lOiBzdHJpbmdcbik6IHsgdGFnOiBzdHJpbmcsIHN0eWxlOiBTdHlsZSwgYW5jaG9yPzogc3RyaW5nIH0ge1xuICBjb25zdCByYXcgPSByYXdUYWcoc3RhdGUsIGV2ZW50KVxuICBjb25zdCBzdHlsZSA9IG5ldyBTdHlsZSgpXG4gIGlmIChldmVudC5zdHlsZSA9PT0gQ09MTEVDVElPTl9TVFlMRV9GTE9XKSBzdHlsZS5mbG93ID0gdHJ1ZVxuXG4gIGxldCB0YWc6IHN0cmluZ1xuICBpZiAocmF3ID09PSAnJykge1xuICAgIHRhZyA9IGRlZmF1bHRUYWdOYW1lXG4gIH0gZWxzZSB7XG4gICAgdGFnID0gcmF3XG4gICAgc3R5bGUudGFnZ2VkID0gdHJ1ZVxuICB9XG5cbiAgcmV0dXJuIHsgdGFnLCBzdHlsZSwgYW5jaG9yOiBhbmNob3JOYW1lKHN0YXRlLCBldmVudCkgfVxufVxuXG5mdW5jdGlvbiBhZGROb2RlIChzdGF0ZTogRnJvbUV2ZW50c1N0YXRlLCBub2RlOiBOb2RlKSB7XG4gIGNvbnN0IGZyYW1lID0gc3RhdGUuZnJhbWVzW3N0YXRlLmZyYW1lcy5sZW5ndGggLSAxXVxuXG4gIGlmIChmcmFtZS5raW5kID09PSAnZG9jdW1lbnQnKSB7XG4gICAgZnJhbWUuZG9jLmNvbnRlbnRzID0gbm9kZVxuICB9IGVsc2UgaWYgKGZyYW1lLmtpbmQgPT09ICdzZXF1ZW5jZScpIHtcbiAgICBmcmFtZS5ub2RlLml0ZW1zLnB1c2gobm9kZSlcbiAgfSBlbHNlIGlmIChmcmFtZS5rZXkpIHtcbiAgICBmcmFtZS5ub2RlLml0ZW1zLnB1c2goeyBrZXk6IGZyYW1lLmtleSwgdmFsdWU6IG5vZGUgfSlcbiAgICBmcmFtZS5rZXkgPSBudWxsXG4gIH0gZWxzZSB7XG4gICAgZnJhbWUua2V5ID0gbm9kZVxuICB9XG59XG5cbmZ1bmN0aW9uIGV2ZW50c1RvQXN0IChldmVudHM6IEV2ZW50W10sIG9wdGlvbnM6IEZyb21FdmVudHNPcHRpb25zKTogRG9jdW1lbnRbXSB7XG4gIGNvbnN0IHN0YXRlOiBGcm9tRXZlbnRzU3RhdGUgPSB7XG4gICAgc291cmNlOiBvcHRpb25zLnNvdXJjZSxcbiAgICBzY2hlbWE6IG9wdGlvbnMuc2NoZW1hLFxuICAgIGV2ZW50SW5kZXg6IDAsXG4gICAgcG9zaXRpb246IDAsXG4gICAgZnJhbWVzOiBbXSxcbiAgICBkb2N1bWVudHM6IFtdXG4gIH1cblxuICB3aGlsZSAoc3RhdGUuZXZlbnRJbmRleCA8IGV2ZW50cy5sZW5ndGgpIHtcbiAgICBjb25zdCBldmVudCA9IGV2ZW50c1tzdGF0ZS5ldmVudEluZGV4KytdXG4gICAgc3RhdGUucG9zaXRpb24gPSBldmVudFBvc2l0aW9uKGV2ZW50KVxuXG4gICAgc3dpdGNoIChldmVudC50eXBlKSB7XG4gICAgICBjYXNlIEVWRU5UX0RPQ1VNRU5UOiB7XG4gICAgICAgIGNvbnN0IGRvYzogRG9jdW1lbnQgPSB7XG4gICAgICAgICAgY29udGVudHM6IG51bGwsXG4gICAgICAgICAgZXhwbGljaXRTdGFydDogZXZlbnQuZXhwbGljaXRTdGFydCxcbiAgICAgICAgICBleHBsaWNpdEVuZDogZXZlbnQuZXhwbGljaXRFbmQsXG4gICAgICAgICAgZGlyZWN0aXZlczogZXZlbnQuZGlyZWN0aXZlc1xuICAgICAgICB9XG4gICAgICAgIHN0YXRlLmZyYW1lcy5wdXNoKHsga2luZDogJ2RvY3VtZW50JywgZG9jIH0pXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGNhc2UgRVZFTlRfU0NBTEFSOlxuICAgICAgICBhZGROb2RlKHN0YXRlLCBidWlsZFNjYWxhcihzdGF0ZSwgZXZlbnQpKVxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlIEVWRU5UX1NFUVVFTkNFOiB7XG4gICAgICAgIGNvbnN0IHsgdGFnLCBzdHlsZSwgYW5jaG9yIH0gPSBidWlsZENvbGxlY3Rpb24oc3RhdGUsIGV2ZW50LCAndGFnOnlhbWwub3JnLDIwMDI6c2VxJylcbiAgICAgICAgY29uc3Qgbm9kZTogU2VxdWVuY2VOb2RlID0geyBraW5kOiAnc2VxdWVuY2UnLCB0YWcsIHN0eWxlLCBhbmNob3IsIGl0ZW1zOiBbXSB9XG4gICAgICAgIHN0YXRlLmZyYW1lcy5wdXNoKHsga2luZDogJ3NlcXVlbmNlJywgbm9kZSB9KVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjYXNlIEVWRU5UX01BUFBJTkc6IHtcbiAgICAgICAgY29uc3QgeyB0YWcsIHN0eWxlLCBhbmNob3IgfSA9IGJ1aWxkQ29sbGVjdGlvbihzdGF0ZSwgZXZlbnQsICd0YWc6eWFtbC5vcmcsMjAwMjptYXAnKVxuICAgICAgICBjb25zdCBub2RlOiBNYXBwaW5nTm9kZSA9IHsga2luZDogJ21hcHBpbmcnLCB0YWcsIHN0eWxlLCBhbmNob3IsIGl0ZW1zOiBbXSB9XG4gICAgICAgIHN0YXRlLmZyYW1lcy5wdXNoKHsga2luZDogJ21hcHBpbmcnLCBub2RlLCBrZXk6IG51bGwgfSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgY2FzZSBFVkVOVF9BTElBUzoge1xuICAgICAgICBjb25zdCBuYW1lID0gc3RhdGUuc291cmNlLnNsaWNlKGV2ZW50LmFuY2hvclN0YXJ0LCBldmVudC5hbmNob3JFbmQpXG4gICAgICAgIGNvbnN0IG5vZGU6IEFsaWFzTm9kZSA9IHsga2luZDogJ2FsaWFzJywgdGFnOiAnJywgc3R5bGU6IG5ldyBTdHlsZSgpLCBhbmNob3I6IG5hbWUgfVxuICAgICAgICBhZGROb2RlKHN0YXRlLCBub2RlKVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjYXNlIEVWRU5UX1BPUDoge1xuICAgICAgICBjb25zdCBmcmFtZSA9IHN0YXRlLmZyYW1lcy5wb3AoKSFcbiAgICAgICAgaWYgKGZyYW1lLmtpbmQgPT09ICdkb2N1bWVudCcpIHtcbiAgICAgICAgICBzdGF0ZS5kb2N1bWVudHMucHVzaChmcmFtZS5kb2MpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWRkTm9kZShzdGF0ZSwgZnJhbWUubm9kZSlcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdGF0ZS5kb2N1bWVudHNcbn1cblxuZXhwb3J0IHtcbiAgZXZlbnRzVG9Bc3QsXG4gIHR5cGUgRnJvbUV2ZW50c09wdGlvbnNcbn1cbiIsICIvKipcbiAqIFlBTUwgZnJvbnRtYXR0ZXIgXHU4OUUzXHU2NzkwL1x1NUU4Rlx1NTIxN1x1NTMxNlx1MzAwMlx1NEY5RFx1NjM2RSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGBcdTMwMDJcbiAqXG4gKiAtIFx1NzUyOCBqcy15YW1sIFx1NTkwNFx1NzQwNlx1NEUyRFx1NjU4N1x1NUI1N1x1NkJCNVx1NTQwRFx1RkYwOGpzLXlhbWwgXHU1MzlGXHU3NTFGXHU2NTJGXHU2MzAxIFVuaWNvZGUga2V5XHVGRjA5XG4gKiAtIFx1ODlFM1x1Njc5MFx1NjVGNlx1NEZERFx1NzU1OVx1NkNFOFx1OTFDQVx1OTg3QVx1NUU4Rlx1RkYwOGpzLXlhbWwgXHU0RTBEXHU0RkREXHU3NTU5XHVGRjBDXHU0RjQ2XHU2MjExXHU0RUVDXHU3NTI4XHU1NkZBXHU1QjlBXHU1QjU3XHU2QkI1XHU2NjIwXHU1QzA0XHU5MUNEXHU1RUZBXHVGRjA5XG4gKiAtIFx1NUU4Rlx1NTIxN1x1NTMxNlx1NjVGNlx1NjMwOVx1ODlDNFx1ODMwM1x1OTg3QVx1NUU4Rlx1OEY5M1x1NTFGQVx1RkYwOFx1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QVx1MjE5Mlx1NjgwN1x1N0I3RVx1MjE5Mlx1N0YxNlx1NzgwMVx1MjE5Mlx1OEY5M1x1NTE2NVx1MjE5Mlx1NjVFNVx1NjcxRlx1MjE5Mlx1NTE3M1x1OTUyRVx1OEJDRFx1MjE5Mlx1OEJDNFx1NTIwNlx1MjE5Mlx1N0QyMlx1NUYxNVx1RkYwOVxuICovXG5pbXBvcnQgKiBhcyBZQU1MIGZyb20gJ2pzLXlhbWwnO1xuXG4vKiogZnJvbnRtYXR0ZXIgXHU1MjA2XHU5Njk0XHU3QjI2XHUzMDAyICovXG5jb25zdCBGTV9ERUxJTUlURVIgPSAnLS0tJztcblxuLyoqIGZyb250bWF0dGVyIFx1OEY5M1x1NTFGQVx1NjVGNlx1NzY4NFx1NUI1N1x1NkJCNVx1OTg3QVx1NUU4Rlx1MzAwMlx1NEY5RFx1NjM2RSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU0RTAwXHU2QTIxXHU2NzdGXHUzMDAyICovXG5jb25zdCBGSUVMRF9PUkRFUjogKGtleW9mIGltcG9ydCgnLi90eXBlcycpLllBTUxGcm9udG1hdHRlcilbXSA9IFtcbiAgJ2ZlaXNodV9pZCcsXG4gICdmZWlzaHVfZG9jX2lkJyxcbiAgJ2ZlaXNodV90aXRsZScsXG4gICdzeW5jX2hhc2gnLFxuICAnc3luY190aW1lJyxcbiAgJ1x1NjgwN1x1N0I3RScsXG4gICdcdTdGMTZcdTc4MDEnLFxuICAnXHU4RjkzXHU1MTY1JyxcbiAgJ1x1NjVFNVx1NjcxRicsXG4gICdcdTY1RTVcdTY3MUZcdTdEMjJcdTVGMTUnLFxuICAnXHU1MTczXHU5NTJFXHU4QkNEJyxcbiAgJ1x1Njk4Mlx1OEZGMCcsXG4gICdcdThCQzRcdTUyMDYnLFxuICAnXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQScsXG4gICdcdTdEMjJcdTVGMTVfXHU3N0U1XHU4QkM2XHU1RTkzJyxcbiAgJ1x1N0QyMlx1NUYxNV9cdTk4OUNcdTgyNzInLFxuICAnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnLFxuICAnXHU3RDIyXHU1RjE1X1x1NTc1NycsXG4gICdcdTdEMjJcdTVGMTVfXHU5OENFXHU5NjY5Jyxcbl07XG5cbi8qKiBcdTdBN0FcdTUwM0NcdThERjNcdThGQzdcdTk2QzZcdTU0MDhcdUZGMUFcdTRFQzVcdThERjNcdThGQzdcdTY3MkFcdThCQkVcdTdGNkVcdUZGMUJcdTdBN0FcdTVCNTdcdTdCMjZcdTRFMzIvXHU3QTdBXHU2NTcwXHU3RUM0XHU3NTI4XHU0RThFXHU4OUM0XHU4MzAzXHU1QjU3XHU2QkI1XHU1MzYwXHU0RjREXHUzMDAyICovXG5mdW5jdGlvbiBpc0VtcHR5KHY6IHVua25vd24pOiBib29sZWFuIHtcbiAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFx1NUMwNiBmcm9udG1hdHRlciBcdTVCRjlcdThDNjFcdTVFOEZcdTUyMTdcdTUzMTZcdTRFM0EgWUFNTCBcdTVCNTdcdTdCMjZcdTRFMzJcdUZGMDhcdTU0MkIgYC0tLWAgXHU1MjA2XHU5Njk0XHU3QjI2XHVGRjA5XHUzMDAyXG4gKiBcdTYzMDlcdTg5QzRcdTgzMDNcdTk4N0FcdTVFOEZcdThGOTNcdTUxRkFcdUZGMENcdThERjNcdThGQzdcdTdBN0FcdTUwM0NcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZUZyb250bWF0dGVyKGZtOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHN0cmluZyB7XG4gIGNvbnN0IG9yZGVyZWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG4gIGZvciAoY29uc3Qga2V5IG9mIEZJRUxEX09SREVSKSB7XG4gICAgaWYgKCFpc0VtcHR5KGZtW2tleV0pKSB7XG4gICAgICBvcmRlcmVkW2tleSBhcyBzdHJpbmddID0gZm1ba2V5XTtcbiAgICB9XG4gIH1cbiAgLy8gXHU2NTM2XHU1QzNFXHVGRjFBXHU1M0VGXHU4MEZEXHU2NzA5XHU1OTFBXHU0RjU5XHU1QjU3XHU2QkI1XHU0RTBEXHU1NzI4IEZJRUxEX09SREVSIFx1OTFDQ1x1RkYwOFx1NTQxMVx1NTQwRVx1NTE3Q1x1NUJCOVx1RkYwOVxuICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhmbSkpIHtcbiAgICBpZiAoIShrIGluIG9yZGVyZWQpICYmICFpc0VtcHR5KHYpKSB7XG4gICAgICBvcmRlcmVkW2tdID0gdjtcbiAgICB9XG4gIH1cbiAgY29uc3QgeWFtbFN0ciA9IFlBTUwuZHVtcChvcmRlcmVkLCB7XG4gICAgbGluZVdpZHRoOiAtMSwgICAgICAgICAgIC8vIFx1NEUwRFx1NjI5OFx1ODg0Q1x1RkYwOFx1ODg2OFx1NjgzQ1x1N0I0OVx1OTU3Rlx1ODg0Q1x1NEUwRFx1NzgzNFx1NTc0Rlx1RkYwOVxuICAgIHF1b3RlU3R5bGU6ICdkb3VibGUnLCAgICAvLyBcdTVCNTdcdTdCMjZcdTRFMzJcdTc1MjhcdTUzQ0NcdTVGMTVcdTUzRjdcdUZGMDhcdTRGRERcdTc1NTkgZW1vamlcdUZGMDlcbiAgICBmb3JjZVF1b3RlczogZmFsc2UsXG4gICAgc29ydEtleXM6IGZhbHNlLCAgICAgICAgIC8vIFx1NjIxMVx1NEVFQ1x1ODFFQVx1NURGMVx1NjNBN1x1NTIzNlx1OTg3QVx1NUU4RlxuICB9KSBhcyBzdHJpbmc7XG4gIHJldHVybiBgJHtGTV9ERUxJTUlURVJ9XFxuJHt5YW1sU3RyfSR7Rk1fREVMSU1JVEVSfWA7XG59XG5cbi8qKlxuICogXHU0RUNFIG1kIFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVx1ODlFM1x1Njc5MCBmcm9udG1hdHRlclx1MzAwMlxuICogQHBhcmFtIGNvbnRlbnQgXHU1QjhDXHU2NTc0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XG4gKiBAcmV0dXJucyB7IGZyb250bWF0dGVyLCBib2R5IH1cdUZGMENmcm9udG1hdHRlciBcdTRFM0EgbnVsbCBcdTg4NjhcdTc5M0FcdTY1RTAgZnJvbnRtYXR0ZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRnJvbnRtYXR0ZXIoY29udGVudDogc3RyaW5nKToge1xuICBmcm9udG1hdHRlcjogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsO1xuICBib2R5OiBzdHJpbmc7XG59IHtcbiAgY29uc3Qgb2Zmc2V0ID0gY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweGZlZmYgPyAxIDogMDtcbiAgaWYgKCFjb250ZW50LnN0YXJ0c1dpdGgoRk1fREVMSU1JVEVSLCBvZmZzZXQpKSB7XG4gICAgcmV0dXJuIHsgZnJvbnRtYXR0ZXI6IG51bGwsIGJvZHk6IGNvbnRlbnQgfTtcbiAgfVxuXG4gIGNvbnN0IHJlc3QgPSBjb250ZW50LnNsaWNlKG9mZnNldCArIEZNX0RFTElNSVRFUi5sZW5ndGgpO1xuICBjb25zdCBtYXRjaCA9IHJlc3QubWF0Y2goL15cXHI/XFxuKFtcXHNcXFNdKj8pXFxyP1xcbi0tLVsgXFx0XSooPzpcXHI/XFxufCQpLyk7XG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm4geyBmcm9udG1hdHRlcjogbnVsbCwgYm9keTogY29udGVudCB9O1xuICB9XG5cbiAgY29uc3QgeWFtbEJsb2NrID0gbWF0Y2hbMV07XG4gIGNvbnN0IGJvZHlTdGFydCA9IG9mZnNldCArIEZNX0RFTElNSVRFUi5sZW5ndGggKyBtYXRjaFswXS5sZW5ndGg7XG4gIGNvbnN0IGJvZHkgPSBjb250ZW50LnNsaWNlKGJvZHlTdGFydCkucmVwbGFjZSgvXig/Olxccj9cXG4pKy8sICcnKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBmbSA9IFlBTUwubG9hZCh5YW1sQmxvY2spIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIHJldHVybiB7IGZyb250bWF0dGVyOiBmbSA/PyB7fSwgYm9keSB9O1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gWUFNTCBcdTg5RTNcdTY3OTBcdTU5MzFcdThEMjVcdUZGMUFcdTg5QzZcdTRFM0FcdTY1RTAgZnJvbnRtYXR0ZXJcbiAgICBjb25zb2xlLndhcm4oJ1tzeW5jL3NoYXJlZF0gZnJvbnRtYXR0ZXIgcGFyc2UgZmFpbGVkOicsIGUpO1xuICAgIHJldHVybiB7IGZyb250bWF0dGVyOiBudWxsLCBib2R5OiBjb250ZW50IH07XG4gIH1cbn1cblxuLyoqXG4gKiBcdTVDMDYgZnJvbnRtYXR0ZXIgKyBib2R5IFx1NjJGQ1x1NjIxMFx1NUI4Q1x1NjU3NFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZW1ibGVGaWxlKFxuICBmbTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4gIGJvZHk6IHN0cmluZyxcbik6IHN0cmluZyB7XG4gIHJldHVybiBgJHtzZXJpYWxpemVGcm9udG1hdHRlcihmbSl9XFxuXFxuJHtib2R5fWA7XG59XG4iLCAiLyoqXG4gKiBZQU1MIFx1MjE5NCBcdTk4REVcdTRFNjYgY2FsbG91dCBcdTUzQ0NcdTU0MTFcdThGNkNcdTYzNjJcdTMwMDJcbiAqXG4gKiBcdTRGOURcdTYzNkVcdUZGMUFcbiAqIC0gYDAzX1x1OThERVx1NEU2Nlx1NjU4N1x1Njg2M1x1NjgzQ1x1NUYwRlx1ODlDNFx1ODMwM1x1NEUwRU9CXHU2NjIwXHU1QzA0Lm1kYCBcdTAwQTdcdTRFMDlcdUZGMDhjYWxsb3V0IFx1OTg5Q1x1ODI3Mlx1NjYyMFx1NUMwNFx1RkYwOVxuICogLSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU0RTk0XHVGRjA4WUFNTFx1MjE5MmNhbGxvdXQgXHU2NjIwXHU1QzA0XHU4ODY4XHVGRjA5XG4gKiAtIFx1MDBBN1x1NTZEQlx1RkYwOFx1NTQwOFx1NUU3Nlx1NEZFMVx1NjA2Rlx1NTc1N1x1OEJCRVx1OEJBMVx1RkYxQVx1NjI0MFx1NjcwOVx1NUI1N1x1NkJCNVx1OEZEQlx1NEUwMFx1NEUyQSBjYWxsb3V0XHVGRjA5XG4gKlxuICogXHU1REYyXHU3N0U1XHU1NzUxXHVGRjA4MDMgXHU2NTg3XHU2ODYzIFx1MDBBN1x1NTM0MSArIFx1MDBBNzMuM1x1RkYwOVx1RkYxQVxuICogLSBlbW9qaSBcdTVFMjYgVStGRTBGIHZhcmlhdGlvbiBzZWxlY3RvciBcdTk4REVcdTRFNjZcdTRFMERcdThCQTQgXHUyMTkyIFx1NTE5OVx1NTE2NVx1NTI0RCBzdHJpcFxuICogLSBgfmAgXHU4OEFCXHU5OERFXHU0RTY2XHU4RjZDXHU0RTQ5XHU2MjEwIGBcXH5gIFx1MjE5MiBcdTU2REVcdThCRkJcdTY1RjZcdTUzQ0RcdThGNkNcdTRFNDlcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IEtub3dsZWRnZU1ldGEsIFRhZyB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHtcbiAgQ0FMTE9VVF9GSUVMRF9NQVAsXG4gIFRBR19OQU1FUyxcbiAgRE9DX0lORk9fQ0FMTE9VVCxcbiAgT0JfQ0FMTE9VVF9UT19GRUlTSFUsXG4gIEZFSVNIVV9CR19UT19PQl9DQUxMT1VULFxufSBmcm9tICcuL3R5cGVzLmpzJztcblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIGVtb2ppIFx1NkUwNVx1NkQxNyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqIFx1NzlGQlx1OTY2NCBlbW9qaSBcdTc2ODQgVStGRTBGIHZhcmlhdGlvbiBzZWxlY3Rvclx1MzAwMlx1OThERVx1NEU2Nlx1NEUwRFx1OEJBNFx1NUUyNiBWUyBcdTc2ODQgZW1vamlcdUZGMDgwMyBcdTY1ODdcdTY4NjMgXHUwMEE3My4zXHVGRjA5XHUzMDAyICovXG5jb25zdCBWU19SRSA9IC9cXHVGRTBGL2d1O1xuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMoczogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHMucmVwbGFjZShWU19SRSwgJycpO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU2Q0UyXHU2RDZBXHU1M0Y3XHU4RjZDXHU0RTQ5IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKiogXHU5OERFXHU0RTY2IG1kIFx1NjI4QSBgfmAgXHU4RjZDXHU0RTQ5XHU2MjEwIGBcXH5gXHVGRjBDXHU1NkRFXHU4QkZCXHU2NUY2XHU1M0NEXHU1NDExXHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gdW5lc2NhcGVGZWlzaHVUaWxkZShzOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcy5yZXBsYWNlKC9cXFxcfi9nLCAnficpO1xufVxuXG4vKiogXHU1MTk5XHU1MTY1XHU5OERFXHU0RTY2XHU1MjREXHU1M0NEXHU4RjZDXHU0RTQ5XHVGRjA4XHU1OTgyXHU2NzlDXHU3NTI4XHU2MjM3XHU2MEYzXHU3NTI4IGB+YCBcdTUyMjBcdTk2NjRcdTdFQkZcdUZGMDlcdTMwMDJcdTk4REVcdTRFNjYgbWQgXHU5MUNDIGB+fn50ZXh0fn5+YCBcdTY2MkZcdTUyMjBcdTk2NjRcdTdFQkZcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVGZWlzaHVUaWxkZShzOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBcdTRFMERcdTRFM0JcdTUyQThcdThGNkNcdTRFNDlcdUZGMENcdTRGRERcdTYzMDFcdTUzOUZcdTY4MzdcdTMwMDJcdTRFQzVcdTU3Mjggb3ZlcndyaXRlIFx1NTczQVx1NjY2Rlx1Nzg2RVx1OEJBNFx1OTcwMFx1ODk4MVx1NjVGNlx1NjI0Qlx1NTJBOFx1NTkwNFx1NzQwNlx1MzAwMlxuICByZXR1cm4gcztcbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIFx1NjgwN1x1N0I3RVx1NTAzQ1x1NjgzQ1x1NUYwRlx1NTMxNiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuZnVuY3Rpb24gZm9ybWF0VGFnVmFsdWUodGFnOiBUYWcgfCB1bmRlZmluZWQpOiBzdHJpbmcge1xuICBpZiAoIXRhZykgcmV0dXJuICcnO1xuICByZXR1cm4gYCR7VEFHX05BTUVTW3RhZ119ICR7dGFnfWA7XG59XG5cbmZ1bmN0aW9uIHBhcnNlVGFnVmFsdWUodmFsdWU6IHN0cmluZyk6IFRhZyB8IG51bGwge1xuICBjb25zdCBub3JtYWxpemVkID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnModmFsdWUpLnRyaW0oKTtcbiAgY29uc3QgZGlyZWN0ID0gbm9ybWFsaXplZC5tYXRjaCgvKD86XnxcXHMpKFtTWExaUUpdKSg/Olxcc3wkKS8pO1xuICBjb25zdCBjb21wYWN0ID0gbm9ybWFsaXplZC5tYXRjaCgvW1NYTFpRSl0vKTtcbiAgY29uc3QgdGFnID0gKGRpcmVjdD8uWzFdID8/IGNvbXBhY3Q/LlswXSkgYXMgVGFnIHwgdW5kZWZpbmVkO1xuICByZXR1cm4gdGFnICYmIFsnUycsICdYJywgJ0wnLCAnWicsICdRJywgJ0onXS5pbmNsdWRlcyh0YWcpID8gdGFnIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gbWFwRmVpc2h1QmdUb09iVHlwZShiZ0NvbG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIWJnQ29sb3IpIHJldHVybiAndGlwJztcbiAgaWYgKEZFSVNIVV9CR19UT19PQl9DQUxMT1VUW2JnQ29sb3JdKSByZXR1cm4gRkVJU0hVX0JHX1RPX09CX0NBTExPVVRbYmdDb2xvcl07XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBiZ0NvbG9yLnJlcGxhY2UoL1xccysvZywgJycpLnRvTG93ZXJDYXNlKCk7XG4gIGNvbnN0IHJnYk1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAncmdiKDI1NSwyNDUsMjM1KSc6ICd0aXAnLFxuICAgICdyZ2IoMjU0LDIxMiwxNjQpJzogJ3RpcCcsXG4gICAgJ3JnYmEoMjU1LDI0NiwxMjIsMC44KSc6ICd0aXAnLFxuICAgICdyZ2IoMjU1LDI0MCwyNDApJzogJ3dhcm5pbmcnLFxuICAgICdyZ2IoMjQyLDI0MywyNDUpJzogJ3F1b3RlJyxcbiAgICAncmdiKDI0MCwyNDQsMjU1KSc6ICdpbmZvJyxcbiAgICAncmdiKDI0MCwyNTMsMjQ0KSc6ICdzdWNjZXNzJyxcbiAgfTtcbiAgcmV0dXJuIHJnYk1hcFtub3JtYWxpemVkXSA/PyAnYWJzdHJhY3QnO1xufVxuXG5mdW5jdGlvbiBodG1sQmxvY2tUb1RleHRMaW5lcyhodG1sOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBibG9ja1JlID0gLzwoPzpwfGxpKVxcYltePl0qPihbXFxzXFxTXSo/KTxcXC8oPzpwfGxpKT4vZztcbiAgbGV0IG06IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG4gIHdoaWxlICgobSA9IGJsb2NrUmUuZXhlYyhodG1sKSkgIT09IG51bGwpIHtcbiAgICBjb25zdCB0ZXh0ID0gaHRtbFRvUGxhaW5UZXh0KG1bMV0pO1xuICAgIGlmICh0ZXh0KSBsaW5lcy5wdXNoKC4uLnRleHQuc3BsaXQoJ1xcbicpLm1hcChsaW5lID0+IGxpbmUudHJpbSgpKS5maWx0ZXIoQm9vbGVhbikpO1xuICB9XG4gIGlmIChsaW5lcy5sZW5ndGggPiAwKSByZXR1cm4gbGluZXM7XG4gIGNvbnN0IGZhbGxiYWNrID0gaHRtbFRvUGxhaW5UZXh0KGh0bWwpO1xuICByZXR1cm4gZmFsbGJhY2sgPyBmYWxsYmFjay5zcGxpdCgnXFxuJykubWFwKGxpbmUgPT4gbGluZS50cmltKCkpLmZpbHRlcihCb29sZWFuKSA6IFtdO1xufVxuXG5mdW5jdGlvbiBodG1sVG9QbGFpblRleHQoaHRtbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGh0bWxcbiAgICAucmVwbGFjZSgvPGJyXFxzKlxcLz8+L2csICdcXG4nKVxuICAgIC5yZXBsYWNlKC88W14+XSs+L2csICcnKVxuICAgIC5yZXBsYWNlKC8mbHQ7L2csICc8JylcbiAgICAucmVwbGFjZSgvJmd0Oy9nLCAnPicpXG4gICAgLnJlcGxhY2UoLyZhbXA7L2csICcmJylcbiAgICAucmVwbGFjZSgvJnF1b3Q7L2csICdcIicpXG4gICAgLnJlcGxhY2UoLyZhcG9zOy9nLCBcIidcIilcbiAgICAudHJpbSgpO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgT0JcdTIxOTJcdTk4REVcdTRFNjZcdUZGMUFZQU1MXHUyMTkyXHU1NDA4XHU1RTc2XHU0RkUxXHU2MDZGIGNhbGxvdXQgWE1MIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKipcbiAqIFx1NUMwNiBPQiBcdTc2ODQgWUFNTCBcdTUxNDNcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVcdTZFMzJcdTY3RDNcdTRFM0FcdTk4REVcdTRFNjZcdTU0MDhcdTVFNzZcdTRGRTFcdTYwNkYgY2FsbG91dCBYTUxcdTMwMDJcbiAqIFx1NEY5RFx1NjM2RSBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTU2REJcdUZGMDhcdTU0MDhcdTVFNzZcdThGREJcdTRFMDBcdTRFMkEgY2FsbG91dCBcdTlBRDhcdTRFQUVcdTU3NTdcdUZGMDlcdTMwMDJcbiAqXG4gKiBAcGFyYW0gbWV0YSBcdTc3RTVcdThCQzZcdTVFOTNcdTUxNDNcdTY1NzBcdTYzNkVcbiAqIEByZXR1cm5zIGNhbGxvdXQgWE1MIFx1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOFx1NTQyQiBzdHJpcCBWU1x1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gbWV0YVRvQ2FsbG91dFhtbChtZXRhOiBLbm93bGVkZ2VNZXRhKTogc3RyaW5nIHtcbiAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW107XG5cbiAgZm9yIChjb25zdCBpdGVtIG9mIENBTExPVVRfRklFTERfTUFQKSB7XG4gICAgY29uc3QgcmF3ID0gbWV0YVtpdGVtLmZpZWxkXTtcbiAgICBpZiAocmF3ID09PSB1bmRlZmluZWQgfHwgcmF3ID09PSBudWxsIHx8IHJhdyA9PT0gJycgfHwgKEFycmF5LmlzQXJyYXkocmF3KSAmJiByYXcubGVuZ3RoID09PSAwKSkgY29udGludWU7XG5cbiAgICBsZXQgdmFsdWU6IHN0cmluZztcbiAgICBpZiAoaXRlbS5maWVsZCA9PT0gJ1x1NjgwN1x1N0I3RScpIHtcbiAgICAgIHZhbHVlID0gZm9ybWF0VGFnVmFsdWUocmF3IGFzIFRhZyB8IHVuZGVmaW5lZCk7XG4gICAgfSBlbHNlIGlmIChpdGVtLmZpZWxkID09PSAnXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQScpIHtcbiAgICAgIHZhbHVlID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMoU3RyaW5nKHJhdykpO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyYXcpKSB7XG4gICAgICB2YWx1ZSA9IChyYXcgYXMgc3RyaW5nW10pLmpvaW4oJyBcdTAwQjcgJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMoU3RyaW5nKHJhdykpO1xuICAgIH1cbiAgICBpZiAoIXZhbHVlKSBjb250aW51ZTtcblxuICAgIGxpbmVzLnB1c2goYDxsaT48Yj4ke2l0ZW0ubGFiZWx9PC9iPlx1RkYxQSR7dmFsdWV9PC9saT5gKTtcbiAgfVxuXG4gIGlmIChsaW5lcy5sZW5ndGggPT09IDApIHJldHVybiAnJztcblxuICBjb25zdCB7IGVtb2ppLCAuLi5hdHRycyB9ID0gRE9DX0lORk9fQ0FMTE9VVDtcbiAgY29uc3QgYXR0clN0ciA9IE9iamVjdC5lbnRyaWVzKGF0dHJzKVxuICAgIC5tYXAoKFtrLCB2XSkgPT4gYCR7a309XCIke3Z9XCJgKVxuICAgIC5qb2luKCcgJyk7XG4gIGNvbnN0IGNsZWFuRW1vamkgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhlbW9qaSk7XG5cbiAgcmV0dXJuIFtcbiAgICBgPGNhbGxvdXQgZW1vamk9XCIke2NsZWFuRW1vaml9XCIgJHthdHRyU3RyfT5gLFxuICAgIGA8cD48Yj5cdTY1ODdcdTY4NjNcdTRGRTFcdTYwNkY8L2I+PC9wPmAsXG4gICAgYDx1bD5gLFxuICAgIC4uLmxpbmVzLFxuICAgIGA8L3VsPmAsXG4gICAgYDwvY2FsbG91dD5gLFxuICAgICcnLFxuICBdLmpvaW4oJ1xcbicpO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU5OERFXHU0RTY2XHUyMTkyT0JcdUZGMUFcdTg5RTNcdTY3OTBcdTU0MDhcdTVFNzZcdTRGRTFcdTYwNkYgY2FsbG91dCBcdTIxOTIgWUFNTCBcdTVCNTdcdTZCQjUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKlxuICogXHU0RUNFXHU5OERFXHU0RTY2IFhNTCBcdTc2ODRcdTU5MzRcdTkwRThcdTRGRTFcdTYwNkYgY2FsbG91dCBcdTRFMkRcdTg5RTNcdTY3OTBcdTUxRkEgWUFNTCBcdTVCNTdcdTZCQjVcdTUwM0NcdTMwMDJcbiAqIFx1NEY5RFx1NjM2RSBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTU2REJcdUZGMUFgPGxpPjxiPlx1NUI1N1x1NkJCNVx1NTQwRDwvYj5cdUZGMUFcdTUwM0M8L2xpPmAgXHU2ODNDXHU1RjBGXHUzMDAyXG4gKlxuICogQHBhcmFtIHhtbCBcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjMgWE1MIFx1NzI0N1x1NkJCNVxuICogQHJldHVybnMgXHU4OUUzXHU2NzkwXHU1MjMwXHU3Njg0XHU1MTQzXHU2NTcwXHU2MzZFXHU1QjU3XHU2QkI1XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxsb3V0WG1sVG9NZXRhKHhtbDogc3RyaW5nKTogUGFydGlhbDxLbm93bGVkZ2VNZXRhPiB7XG4gIGNvbnN0IHJlc3VsdDogUGFydGlhbDxLbm93bGVkZ2VNZXRhPiA9IHt9O1xuXG4gIC8vIFx1NjI3RVwiXHU2NTg3XHU2ODYzXHU0RkUxXHU2MDZGXCJjYWxsb3V0XG4gIGNvbnN0IGNhbGxvdXRSZSA9IC88Y2FsbG91dFxcYltePl0qPlxccyo8cD48Yj5cdTY1ODdcdTY4NjNcdTRGRTFcdTYwNkY8XFwvYj48XFwvcD5cXHMqPHVsPihbXFxzXFxTXSo/KTxcXC91bD5cXHMqPFxcL2NhbGxvdXQ+LztcbiAgY29uc3QgY2FsbG91dE1hdGNoID0geG1sLm1hdGNoKGNhbGxvdXRSZSk7XG4gIGlmICghY2FsbG91dE1hdGNoKSByZXR1cm4gcmVzdWx0O1xuXG4gIGNvbnN0IHVsQ29udGVudCA9IGNhbGxvdXRNYXRjaFsxXTtcbiAgY29uc3QgbGlSZSA9IC88bGk+PGI+KFtePF0rKTxcXC9iPltcdUZGMUE6XSguKz8pPFxcL2xpPi9nO1xuICBsZXQgbTogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcblxuICB3aGlsZSAoKG0gPSBsaVJlLmV4ZWModWxDb250ZW50KSkgIT09IG51bGwpIHtcbiAgICBjb25zdCBsYWJlbCA9IG1bMV0udHJpbSgpO1xuICAgIGNvbnN0IHZhbHVlID0gdW5lc2NhcGVGZWlzaHVUaWxkZShtWzJdLnRyaW0oKSk7XG5cbiAgICAvLyBcdTY4MzlcdTYzNkVcdTY4MDdcdTdCN0VcdTU0MERcdTY2MjBcdTVDMDRcdTUyMzBcdTVCNTdcdTZCQjVcbiAgICBpZiAobGFiZWwgPT09ICdcdTY4MDdcdTdCN0UnKSB7XG4gICAgICBjb25zdCB0YWcgPSBwYXJzZVRhZ1ZhbHVlKHZhbHVlKTtcbiAgICAgIGlmICh0YWcpIHJlc3VsdC5cdTY4MDdcdTdCN0UgPSB0YWc7XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1N0YxNlx1NzgwMScpIHtcbiAgICAgIHJlc3VsdC5cdTdGMTZcdTc4MDEgPSB2YWx1ZS5yZXBsYWNlKC9eXHVEODNEXHVERDIyXFxzKi8sICcnKS50cmltKCk7XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1OEY5M1x1NTE2NScpIHtcbiAgICAgIHJlc3VsdC5cdThGOTNcdTUxNjUgPSB2YWx1ZS5yZXBsYWNlKC9eXHVEODNEXHVEQ0U1XFxzKi8sICcnKS50cmltKCk7XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1NjVFNVx1NjcxRicpIHtcbiAgICAgIHJlc3VsdC5cdTY1RTVcdTY3MUYgPSB2YWx1ZS5yZXBsYWNlKC9eXHVEODNEXHVEQ0M1XFxzKi8sICcnKS50cmltKCk7XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1NTE3M1x1OTUyRVx1OEJDRCcpIHtcbiAgICAgIHJlc3VsdC5cdTUxNzNcdTk1MkVcdThCQ0QgPSB2YWx1ZS5yZXBsYWNlKC9eXHVEODNEXHVERDExXFxzKi8sICcnKS50cmltKCk7XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1OEJDNFx1NTIwNicpIHtcbiAgICAgIC8vIFx1NjNEMFx1NTNENlx1OEJDNFx1NTIwNlx1NjYzRVx1NzkzQVx1NEUzMlx1RkYwOFx1NTk4MiBcIlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RkY1Q1x1NUI5RVx1OERGNVwiXHVGRjA5XG4gICAgICByZXN1bHQuXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQSA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKHZhbHVlKTtcbiAgICAgIC8vIFx1NUMxRFx1OEJENVx1NjNEMFx1NTNENlx1NjU3MFx1NUI1N1xuICAgICAgY29uc3Qgc3RhckNvdW50ID0gKHZhbHVlLm1hdGNoKC9cdUQ4M0NcdURGMUYvZykgfHwgW10pLmxlbmd0aDtcbiAgICAgIGlmIChzdGFyQ291bnQgPj0gMSAmJiBzdGFyQ291bnQgPD0gNSkge1xuICAgICAgICByZXN1bHQuXHU4QkM0XHU1MjA2ID0gc3RhckNvdW50O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobGFiZWwgPT09ICdcdTdEMjJcdTVGMTUnKSB7XG4gICAgICAvLyBcdTdEMjJcdTVGMTVcdTY2MkZcdTU5MUFcdTdFRjRcdTVFQTZcdTU0MDhcdTVFNzZcdTY2M0VcdTc5M0FcdUZGMDhcdUQ4M0RcdURDQjBcdTZCNjNcdThEMjIgXHUwMEI3IFx1RDgzRFx1REQzNVx1NURFNVx1NEY1QyBcdTAwQjcgLi4uXHVGRjA5XG4gICAgICAvLyBcdTk3MDBcdTg5ODFcdThGREJcdTRFMDBcdTZCNjVcdTYyQzZcdTUyMDZcdTU0MDRcdTdFRjRcdTVFQTZcbiAgICAgIHBhcnNlSW5kZXhGaWVsZCh2YWx1ZSwgcmVzdWx0KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFx1ODlFM1x1Njc5MFx1N0QyMlx1NUYxNVx1NTQwOFx1NUU3Nlx1NUI1N1x1NkJCNSBcIlx1RDgzRFx1RENCMFx1NkI2M1x1OEQyMiBcdTAwQjcgXHVEODNEXHVERDM1XHU1REU1XHU0RjVDIFx1MDBCNyBcdTI3MDVcdTVCOENcdTYyMTAgXHUwMEI3IFx1RDgzQ1x1REZBRlx1NTE3N1x1OEM2MSBcdTAwQjcgXHUyNzA1XHU3QjgwXHU1MzU1IFx1MDBCNyBcdTI3NjRcdUZFMEZcdTUwNjVcdTVFQjdcIlxuICogXHU1NkRFXHU1NDA0XHU3RDIyXHU1RjE1XHU1QjUwXHU1QjU3XHU2QkI1XHUzMDAyXG4gKi9cbmZ1bmN0aW9uIHBhcnNlSW5kZXhGaWVsZCh2YWx1ZTogc3RyaW5nLCByZXN1bHQ6IFBhcnRpYWw8S25vd2xlZGdlTWV0YT4pOiB2b2lkIHtcbiAgY29uc3QgcGFydHMgPSB2YWx1ZS5zcGxpdCgvW1x1MDBCN1xcbl0vKS5tYXAocyA9PiBzLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pO1xuICBmb3IgKGNvbnN0IHBhcnQgb2YgcGFydHMpIHtcbiAgICBjb25zdCBjbGVhbmVkID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMocGFydCk7XG4gICAgLy8gXHU3N0U1XHU4QkM2XHU1RTkzXHU3RUY0XHU1RUE2XG4gICAgZm9yIChjb25zdCBrdyBvZiBbJ1x1NkI2M1x1OEQyMicsICdcdTUwNEZcdThEMjInLCAnXHU2QjYzXHU1MzcwJywgJ1x1NTA0Rlx1NTM3MCcsICdcdTZCNjNcdTVCQUInLCAnXHU0RjI0XHU1Qjk4J10pIHtcbiAgICAgIGlmIChjbGVhbmVkLmluY2x1ZGVzKGt3KSkgeyByZXN1bHQuXHU3RDIyXHU1RjE1X1x1NzdFNVx1OEJDNlx1NUU5MyA9IGt3OyBicmVhazsgfVxuICAgIH1cbiAgICAvLyBcdTk4OUNcdTgyNzJcdTdFRjRcdTVFQTZcbiAgICBmb3IgKGNvbnN0IGt3IG9mIFsnXHU3NzYxXHU3NzIwJywgJ1x1NURFNVx1NEY1QycsICdcdTc1MUZcdTZEM0InLCAnXHU1QTMxXHU0RTUwJywgJ1x1NzkzRVx1NEVBNCcsICdcdTVCNjZcdTRFNjAnLCAnXHU4RkQwXHU1MkE4J10pIHtcbiAgICAgIGlmIChjbGVhbmVkLmluY2x1ZGVzKGt3KSkgeyByZXN1bHQuXHU3RDIyXHU1RjE1X1x1OTg5Q1x1ODI3MiA9IGNsZWFuZWQ7IGJyZWFrOyB9XG4gICAgfVxuICAgIC8vIFx1NjRDRFx1NEY1Q1x1N0VGNFx1NUVBNlxuICAgIGZvciAoY29uc3Qga3cgb2YgWydcdTYwRjNcdTZDRDUnLCAnXHU4OUM0XHU1MjEyJywgJ1x1NjI2N1x1ODg0QycsICdcdTUzRDdcdTYzMkInLCAnXHU1MTRCXHU2NzBEJywgJ1x1NTIxRFx1N0EzRicsICdcdTVCQTFcdTY4MzgnLCAnXHU0RkVFXHU2NTM5JywgJ1x1NUI4Q1x1NjIxMCcsICdcdTU5MERcdTc2RDgnXSkge1xuICAgICAgaWYgKGNsZWFuZWQuaW5jbHVkZXMoa3cpKSB7XG4gICAgICAgIHJlc3VsdFsnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnXSA9IHJlc3VsdFsnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnXSA/PyBbXTtcbiAgICAgICAgaWYgKCFyZXN1bHRbJ1x1N0QyMlx1NUYxNV9cdTY0Q0RcdTRGNUMmXHU1M0NEXHU5OTg4J10uaW5jbHVkZXMoa3cpKSByZXN1bHRbJ1x1N0QyMlx1NUYxNV9cdTY0Q0RcdTRGNUMmXHU1M0NEXHU5OTg4J10ucHVzaChrdyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBcdTU3NTdcdTdFRjRcdTVFQTZcdUZGMDhcdTU5MUFcdTkwMDlcdUZGMDlcbiAgICBmb3IgKGNvbnN0IGt3IG9mIFsnXHU2MkJEXHU4QzYxJywgJ1x1NTE3N1x1OEM2MScsICdcdTdCODBcdTUzNTUnLCAnXHU1NkYwXHU5NkJFJ10pIHtcbiAgICAgIGlmIChjbGVhbmVkLmluY2x1ZGVzKGt3KSAmJiBrdyAhPT0gY2xlYW5lZCkge1xuICAgICAgICByZXN1bHQuXHU3RDIyXHU1RjE1X1x1NTc1NyA9IHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU1NzU3ID8/IFtdO1xuICAgICAgICBpZiAoIXJlc3VsdC5cdTdEMjJcdTVGMTVfXHU1NzU3LmluY2x1ZGVzKGt3KSkgcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTU3NTcucHVzaChrdyk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFx1OThDRVx1OTY2OVx1N0VGNFx1NUVBNlx1RkYwOFx1NTkxQVx1OTAwOVx1RkYwOVxuICAgIGZvciAoY29uc3Qga3cgb2YgWydcdTg4NENcdTRFM0EnLCAnXHU3QkExXHU3NDA2JywgJ1x1NTA2NVx1NUVCNycsICdcdTc3RTVcdThCQzYnLCAnXHU3OTNFXHU0RUE0JywgJ1x1NUJCNlx1NUVBRCcsICdcdTc5M0VcdTRGMUEnLCAnXHU2MTBGXHU1OTE2J10pIHtcbiAgICAgIGlmIChjbGVhbmVkLmluY2x1ZGVzKGt3KSAmJiBrdyAhPT0gY2xlYW5lZCkge1xuICAgICAgICByZXN1bHQuXHU3RDIyXHU1RjE1X1x1OThDRVx1OTY2OSA9IHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU5OENFXHU5NjY5ID8/IFtdO1xuICAgICAgICBpZiAoIXJlc3VsdC5cdTdEMjJcdTVGMTVfXHU5OENFXHU5NjY5LmluY2x1ZGVzKGt3KSkgcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2NjkucHVzaChrdyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTZCNjNcdTY1ODcgY2FsbG91dCBcdTUzQ0NcdTU0MTFcdThGNkNcdTYzNjIgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKlxuICogXHU5OERFXHU0RTY2XHU2QjYzXHU2NTg3IGNhbGxvdXQgWE1MIFx1MjE5MiBPQiBgPiBbIXR5cGVdYCBjYWxsb3V0XHUzMDAyXG4gKiBcdTRGOURcdTYzNkUgYDAzX1x1NjgzQ1x1NUYwRlx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3My4xXHUzMDAyXG4gKlxuICogXHU4RjkzXHU1MTY1XHU1MzU1XHU0RTJBIGA8Y2FsbG91dCAuLi4+Y29udGVudDwvY2FsbG91dD5gIFx1NTc1N1x1RkYwQ1x1OEY5M1x1NTFGQSBPQiBtYXJrZG93biBjYWxsb3V0XHUzMDAyXG4gKiBcdTU5MUFcdTRFMkEgY2FsbG91dCBcdTU3NTdcdTc1MzFcdThDMDNcdTc1MjhcdTY1QjlcdTYyQzZcdTUyMDZcdTU0MEVcdTkwMTBcdTRFMkFcdThDMDNcdTc1MjhcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZlaXNodUNhbGxvdXRUb09CKHhtbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gXHU2M0QwXHU1M0Q2XHU1QzVFXHU2MDI3XG4gIGNvbnN0IG9wZW5NYXRjaCA9IHhtbC5tYXRjaCgvPGNhbGxvdXRcXGIoW14+XSopPi8pO1xuICBpZiAoIW9wZW5NYXRjaCkgcmV0dXJuIHhtbDtcblxuICBjb25zdCBhdHRycyA9IG9wZW5NYXRjaFsxXTtcbiAgbGV0IGVtb2ppID0gJyc7XG4gIGxldCBiZ0NvbG9yID0gJyc7XG5cbiAgY29uc3QgZW1vamlNYXRjaCA9IGF0dHJzLm1hdGNoKC9lbW9qaT1bXCInXShbXlwiJ10rKVtcIiddLyk7XG4gIGlmIChlbW9qaU1hdGNoKSBlbW9qaSA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKGVtb2ppTWF0Y2hbMV0pO1xuXG4gIGNvbnN0IGJnTWF0Y2ggPSBhdHRycy5tYXRjaCgvYmFja2dyb3VuZC1jb2xvcj1bXCInXShbXlwiJ10rKVtcIiddLyk7XG4gIGlmIChiZ01hdGNoKSBiZ0NvbG9yID0gYmdNYXRjaFsxXTtcblxuICAvLyBcdTYzRDBcdTUzRDZcdTUxODVcdTVCQjlcdUZGMDhcdTUzQkJcdTYzODkgb3Blbi9jbG9zZSB0YWdcdUZGMDlcbiAgY29uc3QgY29udGVudCA9IHhtbFxuICAgIC5yZXBsYWNlKC88Y2FsbG91dFxcYltePl0qPi8sICcnKVxuICAgIC5yZXBsYWNlKC88XFwvY2FsbG91dD4vLCAnJylcbiAgICAudHJpbSgpO1xuXG4gIC8vIFx1NjYyMFx1NUMwNCBjYWxsb3V0IFx1N0M3Qlx1NTc4QlxuICBjb25zdCBvYlR5cGUgPSBtYXBGZWlzaHVCZ1RvT2JUeXBlKGJnQ29sb3IpO1xuICBjb25zdCBsaW5lcyA9IGh0bWxCbG9ja1RvVGV4dExpbmVzKGNvbnRlbnQpO1xuICBjb25zdCB0aXRsZSA9IGA+IFshJHtvYlR5cGV9XSR7ZW1vamkgPyBgICR7ZW1vaml9YCA6ICcnfWA7XG5cbiAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRpdGxlO1xuICByZXR1cm4gW3RpdGxlLCAuLi5saW5lcy5tYXAobGluZSA9PiBgPiAke2xpbmV9YCldLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIFx1NjI3OVx1OTFDRlx1NUMwNlx1OThERVx1NEU2NiBYTUwgXHU5MUNDXHU3Njg0XHU2MjQwXHU2NzA5IGNhbGxvdXQgXHU1NzU3XHU4RjZDXHU2MzYyXHU0RTNBIE9CIGNhbGxvdXRcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRGZWlzaHVDYWxsb3V0c1RvT0IoeG1sOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBjYWxsb3V0UmUgPSAvPGNhbGxvdXRcXGJbXj5dKj5bXFxzXFxTXSo/PFxcL2NhbGxvdXQ+L2c7XG4gIHJldHVybiB4bWwucmVwbGFjZShjYWxsb3V0UmUsIChtYXRjaCkgPT4gZmVpc2h1Q2FsbG91dFRvT0IobWF0Y2gpKTtcbn1cblxuLyoqXG4gKiBPQiBgPiBbIXR5cGVdYCBjYWxsb3V0IFx1MjE5MiBcdTk4REVcdTRFNjYgY2FsbG91dCBYTUxcdTMwMDJcbiAqIFx1NEY5RFx1NjM2RSBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTczLjJcdTMwMDJcbiAqXG4gKiBcdThGOTNcdTUxNjVcdTUzNTVcdTRFMkEgT0IgY2FsbG91dCBcdTU3NTdcdUZGMDhcdTU0MkIgYD4gWyF0eXBlXWAgXHU5OTk2XHU4ODRDICsgXHU1QjUwXHU4ODRDXHVGRjA5XHUzMDAyXG4gKiBcdTU5MUFcdTRFMkEgY2FsbG91dCBcdTc1MzFcdThDMDNcdTc1MjhcdTY1QjlcdTYyQzZcdTUyMDZcdTU0MEVcdTkwMTBcdTRFMkFcdThDMDNcdTc1MjhcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9iQ2FsbG91dFRvRmVpc2h1KG1kOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBsaW5lcyA9IG1kLnNwbGl0KCdcXG4nKS5tYXAobCA9PiBsLnJlcGxhY2UoL14+XFxzPy8sICcnKSk7XG4gIGlmIChsaW5lcy5sZW5ndGggPT09IDApIHJldHVybiBtZDtcblxuICAvLyBcdTg5RTNcdTY3OTBcdTk5OTZcdTg4NEMgYD4gWyF0eXBlXWBcbiAgY29uc3QgaGVhZGVyTWF0Y2ggPSBsaW5lc1swXS5tYXRjaCgvXFxbIShcXHcrKVxcXVxccyooLiopLyk7XG4gIGlmICghaGVhZGVyTWF0Y2gpIHJldHVybiBtZDtcblxuICBjb25zdCBvYlR5cGUgPSBoZWFkZXJNYXRjaFsxXTtcbiAgbGV0IHJlc3QgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhoZWFkZXJNYXRjaFsyXSA/PyAnJykudHJpbSgpO1xuICBjb25zdCBmZWlzaHUgPSBPQl9DQUxMT1VUX1RPX0ZFSVNIVVtvYlR5cGVdO1xuXG4gIGxldCBlbW9qaSA9IGZlaXNodT8uZW1vamkgPz8gJ1x1RDgzRFx1RENBMSc7XG4gIGxldCBiZyA9IGZlaXNodT8uYmcgPz8gJ2xpZ2h0LWJsdWUnO1xuICBsZXQgYm9yZGVyID0gZmVpc2h1Py5ib3JkZXIgPz8gJ2JsdWUnO1xuXG4gIC8vIFx1NUMxRFx1OEJENVx1NEVDRVx1OTk5Nlx1ODg0Q1x1NTI2OVx1NEY1OVx1NTE4NVx1NUJCOVx1NjNEMFx1NTNENlx1NzUyOFx1NjIzN1x1NTE5OVx1NzY4NCBlbW9qaVx1RkYwQ1x1NUU3Nlx1NEVDRVx1NkI2M1x1NjU4N1x1NEUyRFx1NzlGQlx1OTY2NFx1MzAwMlxuICBjb25zdCBlbW9qaU1hdGNoID0gcmVzdC5tYXRjaCgvXihcXHB7RXh0ZW5kZWRfUGljdG9ncmFwaGljfSlcXHMqL3UpO1xuICBpZiAoZW1vamlNYXRjaCkge1xuICAgIGVtb2ppID0gZW1vamlNYXRjaFsxXTtcbiAgICByZXN0ID0gcmVzdC5zbGljZShlbW9qaU1hdGNoWzBdLmxlbmd0aCkudHJpbVN0YXJ0KCk7XG4gIH1cblxuICAvLyBcdTUxODVcdTVCQjlcdUZGMDhcdTk5OTZcdTg4NENcdTUzQkJcdTYzODkgZW1vamkgKyBcdTU0MEVcdTdFRURcdTVCNTBcdTg4NENcdUZGMDlcbiAgY29uc3QgYm9keUxpbmVzID0gbGluZXMuc2xpY2UoMSk7XG4gIGlmIChyZXN0KSB7XG4gICAgYm9keUxpbmVzLnVuc2hpZnQocmVzdCk7XG4gIH1cbiAgY29uc3QgY29udGVudEh0bWwgPSBib2R5TGluZXNcbiAgICAuZmlsdGVyKGwgPT4gbC50cmltKCkpXG4gICAgLm1hcChsID0+IGA8cD4ke2x9PC9wPmApXG4gICAgLmpvaW4oJ1xcbicpO1xuXG4gIHJldHVybiBbXG4gICAgYDxjYWxsb3V0IGVtb2ppPVwiJHtlbW9qaX1cIiBiYWNrZ3JvdW5kLWNvbG9yPVwiJHtiZ31cIiBib3JkZXItY29sb3I9XCIke2JvcmRlcn1cIj5gLFxuICAgIGNvbnRlbnRIdG1sLFxuICAgIGA8L2NhbGxvdXQ+YCxcbiAgXS5qb2luKCdcXG4nKTtcbn1cblxuLyoqXG4gKiBcdTYyNzlcdTkxQ0ZcdTVDMDYgT0IgbWQgXHU5MUNDXHU3Njg0XHU2MjQwXHU2NzA5IGA+IFshdHlwZV1gIGNhbGxvdXQgXHU4RjZDXHU2MzYyXHU0RTNBXHU5OERFXHU0RTY2IFhNTCBjYWxsb3V0XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0T0JDYWxsb3V0c1RvRmVpc2h1KG1kOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBcdTUzMzlcdTkxNERcdThGREVcdTdFRURcdTc2ODQgY2FsbG91dCBcdTU3NTdcdUZGMDhcdTRFRTUgPiBbISBcdTVGMDBcdTU5MzRcdTc2ODRcdTg4NENcdUZGMENcdTc2RjRcdTUyMzBcdTk3NUUgPiBcdTYyMTZcdTdBN0FcdTg4NENcdUZGMDlcbiAgY29uc3QgY2FsbG91dFJlID0gLyg/Ol4+IFxcWyFcXHcrXFxdLipcXG4oPzpePi4qXFxuPykqKS9nbTtcbiAgcmV0dXJuIG1kLnJlcGxhY2UoY2FsbG91dFJlLCAobWF0Y2gpID0+IG9iQ2FsbG91dFRvRmVpc2h1KG1hdGNoKSk7XG59XG4iLCAiLyoqXG4gKiBcdTc2RUVcdTVGNTVcdTY2MjBcdTVDMDRcdTYzQThcdTVCRkNcdTMwMDJcdTRGOURcdTYzNkUgYDAxX09CXHUyMTk0XHU5OERFXHU0RTY2XHU1QkY5XHU2QkQ0XHU2MkE1XHU1NDRBLm1kYCArIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgIFx1MDBBN1x1NEUwM1x1MzAwMlxuICpcbiAqIE9CIDI1IFx1NEUyQVx1NjgzOVx1NzZFRVx1NUY1NSBcdTIxOTIgXHU5OERFXHU0RTY2IDUgXHU0RTJBXHU5ODc2XHU3RUE3XHU4MjgyXHU3MEI5XHU3Njg0XHU2NjIwXHU1QzA0XHU4OUM0XHU1MjE5XHVGRjFBXG4gKiAgIDBcdUZFMEZcdTIwRTNcdThGOTNcdTUxNjUgLyBTIFx1MjE5MiBcdTk4REVcdTRFNjZcIlx1OEY5M1x1NTE2NVwiXG4gKiAgIDFcdUZFMEZcdTIwRTNcdThGOTNcdTUxRkEgLyBYIFx1MjE5MiBcdTk4REVcdTRFNjZcIlx1OEY5M1x1NTFGQVwiXG4gKiAgIDJcdUZFMEZcdTIwRTNcdUQ4M0RcdUREQzNcdTc3RTVcdThCQzZcdTZDNjAgLyBaIC8gTCAvIEogLyBRIFx1MjE5MiBcdTk4REVcdTRFNjZcIlx1NzdFNVx1OEJDNlx1NkM2MFwiXG4gKiAgIFx1RDgzRVx1REVBN1x1NUJGQ1x1NUYxNSBcdTIxOTIgXHU5OERFXHU0RTY2XCJcdTVCRkNcdTVGMTVcIlxuICogICAzXHVGRTBGXHUyMEUzXHU5NjQ0XHU0RUY2XHU2NTg3XHU0RUY2IFx1MjE5MiBcdTk4REVcdTRFNjZcIlx1OTY0NFx1NEVGNlwiXHVGRjA4XHU3Mjc5XHU2QjhBXHVGRjBDXHU5NzVFXHU2NTg3XHU2ODYzXHVGRjA5XG4gKlxuICogXHU2M0E4XHU1QkZDXHU3RUQzXHU2NzlDXHU3RjEzXHU1QjU4XHU1MjMwIGAuZmVpc2h1LXN5bmMvbWFwcGluZy5qc29uYFx1RkYwQ1x1NEUwRFx1Nzg2Q1x1N0YxNlx1NzgwMVx1MzAwMlxuICovXG5pbXBvcnQgdHlwZSB7IEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IE5vdGljZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IGxpc3RXaWtpQ2hpbGRyZW4gfSBmcm9tICcuL2xhcmsvY2xpLmpzJztcblxuY29uc3QgTUFQUElOR19GSUxFID0gJy5mZWlzaHUtc3luYy9tYXBwaW5nLmpzb24nO1xuXG4vKiogXHU1MzU1XHU2NzYxXHU2NjIwXHU1QzA0XHVGRjFBT0IgXHU4REVGXHU1Rjg0IFx1MjE5MiBcdTk4REVcdTRFNjZcdTgyODJcdTcwQjlcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGlyTWFwcGluZyB7XG4gIC8qKiBPQiBcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTU5ODIgXCIwXHVGRTBGXHUyMEUzXHU4RjkzXHU1MTY1L1x1RDgzRFx1RENBMVx1Nzg4RVx1NzI0N1x1OEY5M1x1NTE2NVx1RkYwOFx1OTVFQVx1NUZGNVx1RkYwOVwiXHUzMDAyICovXG4gIG9iUGF0aDogc3RyaW5nO1xuICAvKiogXHU5OERFXHU0RTY2IG5vZGVfdG9rZW5cdTMwMDIgKi9cbiAgZmVpc2h1Tm9kZVRva2VuOiBzdHJpbmc7XG4gIC8qKiBcdTk4REVcdTRFNjZcdTgyODJcdTcwQjlcdTY4MDdcdTk4OThcdTMwMDIgKi9cbiAgZmVpc2h1VGl0bGU6IHN0cmluZztcbn1cblxuLyoqIFx1NjYyMFx1NUMwNFx1N0YxM1x1NUI1OFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYXBwaW5nQ2FjaGUge1xuICAvKiogXHU3NTFGXHU2MjEwXHU2NUY2XHU5NUY0XHUzMDAyICovXG4gIGdlbmVyYXRlZEF0OiBzdHJpbmc7XG4gIC8qKiBzcGFjZV9pZFx1MzAwMiAqL1xuICBzcGFjZUlkOiBzdHJpbmc7XG4gIC8qKiBcdTk4NzZcdTdFQTdcdTgyODJcdTcwQjlcdTMwMDIgKi9cbiAgdG9wTm9kZXM6IEFycmF5PHsgdG9rZW46IHN0cmluZzsgdGl0bGU6IHN0cmluZyB9PjtcbiAgLyoqIFx1OEJFNlx1N0VDNlx1NjYyMFx1NUMwNFx1MzAwMiAqL1xuICBtYXBwaW5nczogRGlyTWFwcGluZ1tdO1xufVxuXG4vKiogT0IgXHU2ODM5XHU3NkVFXHU1RjU1IGVtb2ppIFx1MjE5MiBcdTk4REVcdTRFNjZcdTk4NzZcdTdFQTdcdTgyODJcdTcwQjlcdTY4MDdcdTk4OThcdUZGMDhcdTRGOURcdTYzNkUgMDEgXHU1QkY5XHU2QkQ0XHU2MkE1XHU1NDRBXHVGRjA5XHUzMDAyICovXG5jb25zdCBST09UX0RJUl9UT19GRUlTSFU6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICcwXHVGRTBGXHUyMEUzXHU4RjkzXHU1MTY1JzogJ1x1OEY5M1x1NTE2NScsXG4gICcxXHVGRTBGXHUyMEUzXHU4RjkzXHU1MUZBJzogJ1x1OEY5M1x1NTFGQScsXG4gICcyXHVGRTBGXHUyMEUzXHVEODNEXHVEREMzXHU3N0U1XHU4QkM2XHU2QzYwJzogJ1x1NzdFNVx1OEJDNlx1NkM2MCcsXG4gICczXHVGRTBGXHUyMEUzXHU5NjQ0XHU0RUY2XHU2NTg3XHU0RUY2JzogJ1x1OTY0NFx1NEVGNicsXG4gICdcdUQ4M0VcdURFQTdcdTVCRkNcdTVGMTUnOiAnXHU1QkZDXHU1RjE1Jyxcbn07XG5cbi8qKlxuICogXHU2M0E4XHU1QkZDXHU1RTc2XHU3RjEzXHU1QjU4XHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0XHUzMDAyXG4gKiAxLiBcdTYyQzlcdTk4REVcdTRFNjZcdTk4NzZcdTdFQTdcdTgyODJcdTcwQjlcdTUyMTdcdTg4NjhcbiAqIDIuIFx1NjMwOSBlbW9qaSBcdTg5QzRcdTUyMTlcdTUzMzlcdTkxNEQgT0IgXHU2ODM5XHU3NkVFXHU1RjU1IFx1MjE5MiBcdTk4REVcdTRFNjZcdTk4NzZcdTdFQTdcbiAqIDMuIFx1OTAxMlx1NUY1Mlx1NTMzOVx1OTE0RFx1NUI1MFx1NzZFRVx1NUY1NVx1RkYwOFx1NjMwOVx1NjgwN1x1OTg5OFx1NkEyMVx1N0NDQVx1NTMzOVx1OTE0RFx1RkYwOVxuICogNC4gXHU1MTk5XHU1MTY1IC5mZWlzaHUtc3luYy9tYXBwaW5nLmpzb25cbiAqXG4gKiBAcmV0dXJucyBcdTYzQThcdTVCRkNcdTc2ODRcdTY2MjBcdTVDMDRcdTY1NzBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hNYXBwaW5nKGFwcDogQXBwLCBzcGFjZUlkOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICBpZiAoIXNwYWNlSWQpIHtcbiAgICBuZXcgTm90aWNlKCdcdTI2QTBcdUZFMEYgXHU2NzJBXHU5MTREXHU3RjZFIHNwYWNlX2lkXHVGRjBDXHU4QkY3XHU1NzI4XHU4QkJFXHU3RjZFXHU5ODc1XHU1ODZCXHU1MTk5Jyk7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBuZXcgTm90aWNlKCdcdUQ4M0RcdUREMDQgXHU2M0E4XHU1QkZDXHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0Li4uJyk7XG5cbiAgLy8gXHU2MkM5IDUgXHU0RTJBXHU5ODc2XHU3RUE3XHU4MjgyXHU3MEI5XG4gIGNvbnN0IHRvcE5vZGVzID0gbGlzdFdpa2lDaGlsZHJlbihzcGFjZUlkLCAnJyk7XG4gIGlmICh0b3BOb2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICBuZXcgTm90aWNlKCdcdTI2QTBcdUZFMEYgXHU2MkM5XHU0RTBEXHU1MjMwXHU5OERFXHU0RTY2XHU5ODc2XHU3RUE3XHU4MjgyXHU3MEI5XHVGRjBDXHU4QkY3XHU2OEMwXHU2N0U1IHNwYWNlX2lkIFx1NTQ4QyBsYXJrLWNsaSBcdTc2N0JcdTVGNTVcdTYwMDEnKTtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGNvbnN0IG1hcHBpbmdzOiBEaXJNYXBwaW5nW10gPSBbXTtcblxuICAvLyBcdTk4NzZcdTdFQTdcdTUzMzlcdTkxNERcbiAgZm9yIChjb25zdCBbb2JSb290LCBmZWlzaHVUaXRsZV0gb2YgT2JqZWN0LmVudHJpZXMoUk9PVF9ESVJfVE9fRkVJU0hVKSkge1xuICAgIGNvbnN0IG1hdGNoZWQgPSB0b3BOb2Rlcy5maW5kKG4gPT4gbi50aXRsZS5pbmNsdWRlcyhmZWlzaHVUaXRsZSkgfHwgZmVpc2h1VGl0bGUuaW5jbHVkZXMobi50aXRsZSkpO1xuICAgIGlmIChtYXRjaGVkKSB7XG4gICAgICBtYXBwaW5ncy5wdXNoKHtcbiAgICAgICAgb2JQYXRoOiBvYlJvb3QsXG4gICAgICAgIGZlaXNodU5vZGVUb2tlbjogbWF0Y2hlZC5ub2RlX3Rva2VuLFxuICAgICAgICBmZWlzaHVUaXRsZTogbWF0Y2hlZC50aXRsZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFx1OTAxMlx1NUY1Mlx1NTMzOVx1OTE0RFx1NUI1MFx1NzZFRVx1NUY1NVx1RkYwOFx1NEUwMFx1N0VBN1x1NTM3M1x1NTNFRlx1RkYwQ1x1OTA3Rlx1NTE0RFx1OEZDN1x1NkRGMVx1RkYwOVxuICBjb25zdCByb290ID0gYXBwLnZhdWx0LmdldFJvb3QoKTtcbiAgZm9yIChjb25zdCBjaGlsZCBvZiByb290LmNoaWxkcmVuKSB7XG4gICAgaWYgKCFjaGlsZC5uYW1lIHx8IGNoaWxkLm5hbWUuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICBpZiAoIShjaGlsZC5jaGlsZHJlbj8ubGVuZ3RoKSkgY29udGludWU7XG4gICAgLy8gXHU2MjdFXHU1MjMwXHU4RkQ5XHU0RTJBXHU2ODM5XHU3Njg0XHU5OERFXHU0RTY2IHRva2VuXG4gICAgY29uc3Qgcm9vdE1hcHBpbmcgPSBtYXBwaW5ncy5maW5kKG0gPT4gbS5vYlBhdGggPT09IGNoaWxkLm5hbWUpO1xuICAgIGlmICghcm9vdE1hcHBpbmcpIGNvbnRpbnVlO1xuXG4gICAgLy8gXHU2MkM5XHU5OERFXHU0RTY2XHU1QjUwXHU4MjgyXHU3MEI5XG4gICAgY29uc3QgZmVpc2h1Q2hpbGRyZW4gPSBsaXN0V2lraUNoaWxkcmVuKHNwYWNlSWQsIHJvb3RNYXBwaW5nLmZlaXNodU5vZGVUb2tlbik7XG4gICAgZm9yIChjb25zdCBvYlN1YiBvZiBjaGlsZC5jaGlsZHJlbikge1xuICAgICAgaWYgKCFvYlN1Yi5uYW1lIHx8IG9iU3ViLm5hbWUuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICAgIC8vIFx1NkEyMVx1N0NDQVx1NTMzOVx1OTE0RFx1RkYwOFx1NTNCQlx1NjM4OVx1N0YxNlx1NzgwMVx1NTI0RFx1N0YwMFx1NTQwRVx1NkJENFx1OEY4M1x1RkYwOVxuICAgICAgY29uc3QgY2xlYW5PYk5hbWUgPSBvYlN1Yi5uYW1lLnJlcGxhY2UoL15cXGR7Mn1fXFxkezR9X1tTWFpMUUpdXFxkK1xccyovLCAnJyk7XG4gICAgICBjb25zdCBtYXRjaGVkID0gZmVpc2h1Q2hpbGRyZW4uZmluZChcbiAgICAgICAgbiA9PiBuLnRpdGxlLmluY2x1ZGVzKGNsZWFuT2JOYW1lKSB8fCBjbGVhbk9iTmFtZS5pbmNsdWRlcyhuLnRpdGxlKSxcbiAgICAgICk7XG4gICAgICBpZiAobWF0Y2hlZCkge1xuICAgICAgICBtYXBwaW5ncy5wdXNoKHtcbiAgICAgICAgICBvYlBhdGg6IGAke2NoaWxkLm5hbWV9LyR7b2JTdWIubmFtZX1gLFxuICAgICAgICAgIGZlaXNodU5vZGVUb2tlbjogbWF0Y2hlZC5ub2RlX3Rva2VuLFxuICAgICAgICAgIGZlaXNodVRpdGxlOiBtYXRjaGVkLnRpdGxlLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBcdTUxOTlcdTdGMTNcdTVCNThcbiAgY29uc3QgY2FjaGU6IE1hcHBpbmdDYWNoZSA9IHtcbiAgICBnZW5lcmF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHNwYWNlSWQsXG4gICAgdG9wTm9kZXM6IHRvcE5vZGVzLm1hcChuID0+ICh7IHRva2VuOiBuLm5vZGVfdG9rZW4sIHRpdGxlOiBuLnRpdGxlIH0pKSxcbiAgICBtYXBwaW5ncyxcbiAgfTtcblxuICBhd2FpdCBlbnN1cmVDb25maWdEaXIoYXBwKTtcbiAgYXdhaXQgYXBwLnZhdWx0LmFkYXB0ZXIud3JpdGUoTUFQUElOR19GSUxFLCBKU09OLnN0cmluZ2lmeShjYWNoZSwgbnVsbCwgMikpO1xuXG4gIG5ldyBOb3RpY2UoYFx1MjcwNSBcdTc2RUVcdTVGNTVcdTY2MjBcdTVDMDRcdTVERjJcdTY2RjRcdTY1QjBcdUZGMDgke21hcHBpbmdzLmxlbmd0aH0gXHU2NzYxXHVGRjA5YCk7XG4gIHJldHVybiBtYXBwaW5ncy5sZW5ndGg7XG59XG5cbi8qKlxuICogXHU4QkZCXHU2NjIwXHU1QzA0XHU3RjEzXHU1QjU4XHUzMDAyXHU2NUUwXHU3RjEzXHU1QjU4XHU4RkQ0XHU1NkRFIG51bGxcdTMwMDJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRNYXBwaW5nKGFwcDogQXBwKTogUHJvbWlzZTxNYXBwaW5nQ2FjaGUgfCBudWxsPiB7XG4gIHRyeSB7XG4gICAgaWYgKCEoYXdhaXQgYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKE1BUFBJTkdfRklMRSkpKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCByYXcgPSBhd2FpdCBhcHAudmF1bHQuYWRhcHRlci5yZWFkKE1BUFBJTkdfRklMRSk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UocmF3KSBhcyBNYXBwaW5nQ2FjaGU7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUud2FybignW3N5bmMvbWFwcGluZ10gbG9hZCBmYWlsZWQ6JywgZXJyKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFx1NjdFNSBPQiBcdThERUZcdTVGODRcdTVCRjlcdTVFOTRcdTc2ODRcdTk4REVcdTRFNjZcdTgyODJcdTcwQjkgdG9rZW5cdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvb2t1cEZlaXNodU5vZGUoY2FjaGU6IE1hcHBpbmdDYWNoZSwgb2JQYXRoOiBzdHJpbmcpOiBEaXJNYXBwaW5nIHwgbnVsbCB7XG4gIC8vIFx1N0NCRVx1Nzg2RVx1NTMzOVx1OTE0RFxuICBjb25zdCBleGFjdCA9IGNhY2hlLm1hcHBpbmdzLmZpbmQobSA9PiBtLm9iUGF0aCA9PT0gb2JQYXRoKTtcbiAgaWYgKGV4YWN0KSByZXR1cm4gZXhhY3Q7XG5cbiAgLy8gXHU1MjREXHU3RjAwXHU1MzM5XHU5MTREXHVGRjA4XHU1M0Q2XHU2NzAwXHU5NTdGXHU1MzM5XHU5MTREXHVGRjA5XG4gIGxldCBiZXN0OiBEaXJNYXBwaW5nIHwgbnVsbCA9IG51bGw7XG4gIGZvciAoY29uc3QgbSBvZiBjYWNoZS5tYXBwaW5ncykge1xuICAgIGlmIChvYlBhdGguc3RhcnRzV2l0aChtLm9iUGF0aCArICcvJykgfHwgb2JQYXRoLnN0YXJ0c1dpdGgobS5vYlBhdGgpKSB7XG4gICAgICBpZiAoIWJlc3QgfHwgbS5vYlBhdGgubGVuZ3RoID4gYmVzdC5vYlBhdGgubGVuZ3RoKSBiZXN0ID0gbTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJlc3Q7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGVuc3VyZUNvbmZpZ0RpcihhcHA6IEFwcCk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBkaXIgPSAnLmZlaXNodS1zeW5jJztcbiAgaWYgKCEoYXdhaXQgYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKGRpcikpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKGRpcik7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvKiBpZ25vcmUgKi9cbiAgICB9XG4gIH1cbn1cbiIsICIvKipcbiAqIFx1NjcyQ1x1NTczMCBIVFRQIHNlcnZlclx1MzAwMlx1NEY5RFx1NjM2RVx1NjVCOVx1Njg0OCBcdTAwQTcyXHVGRjA4bG9jYWxob3N0IEhUVFAgXHU1MzRGXHU4QkFFXHVGRjA5XHUzMDAyXG4gKlxuICogLSBcdTc1Mjggbm9kZTpodHRwIFx1OEQ3NyBzZXJ2ZXJcdUZGMDhPQiBcdTYzRDJcdTRFRjYgaXNEZXNrdG9wT25seVx1RkYwQ1x1NTNFRlx1NzUyOCBub2RlIFx1NTE4NVx1N0Y2RVx1NkEyMVx1NTc1N1x1RkYwOVxuICogLSBcdTdBRUZcdTUzRTNcdTUzRUZcdTkxNERcdTdGNkVcdUZGMDhcdTlFRDhcdThCQTQgNDU2N1x1RkYwOVxuICogLSBcdTkyNzRcdTY3NDNcdUZGMUFcdTZCQ0ZcdTRFMkFcdThCRjdcdTZDNDJcdTY4MjFcdTlBOEMgWC1TeW5jLVRva2VuIGhlYWRlclxuICogLSBDT1JTXHVGRjFBXHU2NTNFXHU5MDFBIE9QVElPTlMgXHU5ODg0XHU2OEMwXHVGRjA4XHU2MjY5XHU1QzU1XHU0RUNFXHU5OERFXHU0RTY2XHU5ODc1XHU5NzYyIGZldGNoIFx1NEYxQVx1ODhBQlx1NjJFNlx1RkYwOVxuICogLSBcdThERUZcdTc1MzFcdTUyMDZcdTUzRDFcdTUyMzAgaGFuZGxlcnNcbiAqL1xuaW1wb3J0ICogYXMgaHR0cCBmcm9tICdub2RlOmh0dHAnO1xuaW1wb3J0IHsgVE9LRU5fSEVBREVSIH0gZnJvbSAnQHN5bmMvc2hhcmVkJztcblxuZXhwb3J0IGludGVyZmFjZSBTZXJ2ZXJEZXBzIHtcbiAgLyoqIFx1NjgyMVx1OUE4QyB0b2tlbiBcdTY2MkZcdTU0MjZcdTUzMzlcdTkxNERcdTMwMDIgKi9cbiAgdmFsaWRhdGVUb2tlbjogKHRva2VuOiBzdHJpbmcpID0+IGJvb2xlYW47XG4gIC8qKiBcdThERUZcdTc1MzFcdTU5MDRcdTc0MDZcdTU2NjhcdTY2MjBcdTVDMDRcdTMwMDIgKi9cbiAgcm91dGVzOiBNYXA8c3RyaW5nLCBSb3V0ZUhhbmRsZXI+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlcXVlc3RDb250ZXh0IHtcbiAgbWV0aG9kOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICAvKiogXHU4OUUzXHU2NzkwXHU1NDBFXHU3Njg0IHBhdGhcdUZGMDhcdTRFMERcdTU0MkIgcXVlcnlcdUZGMDlcdTMwMDIgKi9cbiAgcGF0aDogc3RyaW5nO1xuICAvKiogcXVlcnkgXHU1M0MyXHU2NTcwXHUzMDAyICovXG4gIHF1ZXJ5OiBVUkxTZWFyY2hQYXJhbXM7XG4gIC8qKiBcdThCRjdcdTZDNDJcdTRGNTNcdUZGMDhQT1NUL1BVVCBcdTYyNERcdTY3MDlcdUZGMENcdTVERjIgcGFyc2UgSlNPTlx1RkYwOVx1MzAwMiAqL1xuICBib2R5PzogdW5rbm93bjtcbiAgLyoqIFx1NTM5Rlx1NTlDQiB0b2tlblx1MzAwMiAqL1xuICB0b2tlbjogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBSb3V0ZUhhbmRsZXIgPSAoY3R4OiBSZXF1ZXN0Q29udGV4dCkgPT4gUHJvbWlzZTx1bmtub3duPiB8IHVua25vd247XG5cbi8qKiBKU09OIFx1NTRDRFx1NUU5NFx1NURFNVx1NTE3N1x1MzAwMiAqL1xuZnVuY3Rpb24ganNvbihyZXM6IGh0dHAuU2VydmVyUmVzcG9uc2UsIHN0YXR1czogbnVtYmVyLCBkYXRhOiB1bmtub3duKTogdm9pZCB7XG4gIGNvbnN0IGJvZHkgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgcmVzLndyaXRlSGVhZChzdGF0dXMsIHtcbiAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnLFxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiBgJHtUT0tFTl9IRUFERVJ9LCBDb250ZW50LVR5cGVgLFxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCwgUE9TVCwgT1BUSU9OUycsXG4gICAgJ0NvbnRlbnQtTGVuZ3RoJzogQnVmZmVyLmJ5dGVMZW5ndGgoYm9keSksXG4gIH0pO1xuICByZXMuZW5kKGJvZHkpO1xufVxuXG4vKipcbiAqIFx1NTQyRlx1NTJBOCBIVFRQIHNlcnZlclx1MzAwMlxuICogQHJldHVybnMgc3RvcCgpIFx1NTFGRFx1NjU3MFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRTZXJ2ZXIocG9ydDogbnVtYmVyLCBkZXBzOiBTZXJ2ZXJEZXBzKTogUHJvbWlzZTx7IHN0b3A6ICgpID0+IFByb21pc2U8dm9pZD4gfT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgLy8gQ09SUyBcdTk4ODRcdTY4QzBcbiAgICAgIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCgyMDQsIHtcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogYCR7VE9LRU5fSEVBREVSfSwgQ29udGVudC1UeXBlYCxcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsIFBPU1QsIE9QVElPTlMnLFxuICAgICAgICB9KTtcbiAgICAgICAgcmVzLmVuZCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1ODlFM1x1Njc5MCBVUkxcbiAgICAgIGNvbnN0IGZ1bGxVcmwgPSByZXEudXJsID8/ICcvJztcbiAgICAgIGNvbnN0IHVybE9iaiA9IG5ldyBVUkwoZnVsbFVybCwgYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fWApO1xuICAgICAgY29uc3QgY3R4UGF0aCA9IHVybE9iai5wYXRobmFtZTtcblxuICAgICAgLy8gXHU4QkZCXHU1M0Q2IGJvZHlcdUZGMDhQT1NUL1BVVFx1RkYwOVxuICAgICAgbGV0IGJvZHk6IHVua25vd247XG4gICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ1BPU1QnIHx8IHJlcS5tZXRob2QgPT09ICdQVVQnKSB7XG4gICAgICAgIGNvbnN0IGNodW5rczogQnVmZmVyW10gPSBbXTtcbiAgICAgICAgZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiByZXEpIHtcbiAgICAgICAgICBjaHVua3MucHVzaChjaHVuayBhcyBCdWZmZXIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJhdyA9IEJ1ZmZlci5jb25jYXQoY2h1bmtzKS50b1N0cmluZygndXRmOCcpO1xuICAgICAgICBpZiAocmF3KSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGJvZHkgPSBKU09OLnBhcnNlKHJhdyk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICBqc29uKHJlcywgNDAwLCB7IG9rOiBmYWxzZSwgY29kZTogJ0JBRF9KU09OJywgbWVzc2FnZTogJ0ludmFsaWQgSlNPTiBib2R5JyB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gXHU5Mjc0XHU2NzQzXHVGRjA4L3N0YXR1cyBcdTUxNDFcdThCQjhcdTY1RTAgdG9rZW4gXHU2M0EyXHU2RDRCXHVGRjBDXHU0RjQ2XHU1QjlFXHU5NjQ1XHU2M0UxXHU2MjRCXHU5NzAwXHU4OTgxXHVGRjA5XG4gICAgICBjb25zdCB0b2tlbiA9IHJlcS5oZWFkZXJzW1RPS0VOX0hFQURFUi50b0xvd2VyQ2FzZSgpXSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgICBpZiAoY3R4UGF0aCAhPT0gJy9zdGF0dXMnICYmICFkZXBzLnZhbGlkYXRlVG9rZW4odG9rZW4gPz8gJycpKSB7XG4gICAgICAgIGpzb24ocmVzLCA0MDEsIHsgb2s6IGZhbHNlLCBjb2RlOiAnVU5BVVRIT1JJWkVEJywgbWVzc2FnZTogJ0ludmFsaWQgb3IgbWlzc2luZyBYLVN5bmMtVG9rZW4nIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1OERFRlx1NzUzMVxuICAgICAgY29uc3QgaGFuZGxlciA9IGRlcHMucm91dGVzLmdldChjdHhQYXRoKTtcbiAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICBqc29uKHJlcywgNDA0LCB7IG9rOiBmYWxzZSwgY29kZTogJ05PVF9GT1VORCcsIG1lc3NhZ2U6IGBVbmtub3duIHBhdGg6ICR7Y3R4UGF0aH1gIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGhhbmRsZXIoe1xuICAgICAgICAgIG1ldGhvZDogcmVxLm1ldGhvZCA/PyAnR0VUJyxcbiAgICAgICAgICB1cmw6IGZ1bGxVcmwsXG4gICAgICAgICAgcGF0aDogY3R4UGF0aCxcbiAgICAgICAgICBxdWVyeTogdXJsT2JqLnNlYXJjaFBhcmFtcyxcbiAgICAgICAgICBib2R5LFxuICAgICAgICAgIHRva2VuOiB0b2tlbiA/PyAnJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGpzb24ocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKTtcbiAgICAgICAgY29uc3QgY29kZSA9IChlcnIgYXMgeyBjb2RlPzogc3RyaW5nIH0pPy5jb2RlID8/ICdJTlRFUk5BTCc7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IChlcnIgYXMgeyBzdGF0dXM/OiBudW1iZXIgfSk/LnN0YXR1cyA/PyA1MDA7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tzeW5jL3NlcnZlcl0gaGFuZGxlciBlcnJvcjonLCBlcnIpO1xuICAgICAgICBqc29uKHJlcywgc3RhdHVzLCB7IG9rOiBmYWxzZSwgY29kZSwgbWVzc2FnZSB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNlcnZlci5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9KTtcblxuICAgIHNlcnZlci5saXN0ZW4ocG9ydCwgJzEyNy4wLjAuMScsICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGBbc3luYy9zZXJ2ZXJdIGxpc3RlbmluZyBvbiBodHRwOi8vMTI3LjAuMC4xOiR7cG9ydH1gKTtcbiAgICAgIHJlc29sdmUoe1xuICAgICAgICBzdG9wOiAoKSA9PlxuICAgICAgICAgIG5ldyBQcm9taXNlKChyZXMpID0+IHtcbiAgICAgICAgICAgIHNlcnZlci5jbG9zZSgoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbc3luYy9zZXJ2ZXJdIHN0b3BwZWRgKTtcbiAgICAgICAgICAgICAgcmVzKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqIFx1Njc4NFx1OTAyMFx1OTUxOVx1OEJFRlx1RkYwOFx1NUUyNiBjb2RlL3N0YXR1c1x1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IGNsYXNzIEh0dHBFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29kZTogc3RyaW5nO1xuICBzdGF0dXM6IG51bWJlcjtcbiAgY29uc3RydWN0b3IoY29kZTogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcsIHN0YXR1cyA9IDQwMCkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMuY29kZSA9IGNvZGU7XG4gICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gIH1cbn1cbiIsICIvKipcbiAqIEdFVCAvc3RhdHVzIFx1MjAxNCBcdTYzRTFcdTYyNEIvXHU1MDY1XHU1RUI3XHU2OEMwXHU2N0U1XHUzMDAyXG4gKi9cbmltcG9ydCB0eXBlIHsgU3RhdHVzUmVzcG9uc2UgfSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5TdGF0ZSB9IGZyb20gJy4uL3NldHRpbmdzLmpzJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhdHVzSGFuZGxlcihwbHVnaW5WZXJzaW9uOiBzdHJpbmcsIHZhdWx0TmFtZTogc3RyaW5nLCBzdGF0ZTogUGx1Z2luU3RhdGUpIHtcbiAgcmV0dXJuIGFzeW5jIChfY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8U3RhdHVzUmVzcG9uc2U+ID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgb2s6IHRydWUsXG4gICAgICB2ZXJzaW9uOiBwbHVnaW5WZXJzaW9uLFxuICAgICAgdmF1bHQ6IHZhdWx0TmFtZSxcbiAgICAgIGxhcmtSZWFkeTogISFzdGF0ZS5sYXJrQ2xpUmVzb2x2ZWQsXG4gICAgICBsYXJrVmVyc2lvbjogc3RhdGUubGFya0NsaVZlcnNpb24gfHwgbnVsbCxcbiAgICB9O1xuICB9O1xufVxuIiwgIi8qKlxuICogR0VUIC90cmVlIFx1MjAxNCBcdThGRDRcdTU2REUgdmF1bHQgXHU3NkVFXHU1RjU1XHU2ODExXHVGRjA4XHU3RUQ5XHU2MjY5XHU1QzU1XHU3NkVFXHU1RjU1XHU0RTBCXHU2MkM5XHU3NTI4XHVGRjA5XHUzMDAyXG4gKlxuICogXHU0RjE4XHU1MzE2XHVGRjFBXG4gKiAtIFx1NTE4NVx1NUI1OFx1N0YxM1x1NUI1OFx1RkYwODUgXHU3OUQyIFRUTFx1RkYwOVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NkJDRlx1NkIyMVx1OEJGN1x1NkM0Mlx1OTA0RFx1NTM4Nlx1NTE2OCB2YXVsdFxuICogLSBcdTY1MkZcdTYzMDEgbWF4RGVwdGggXHU1M0MyXHU2NTcwXHVGRjA4cXVlcnkgc3RyaW5nXHVGRjA5XHVGRjBDXHU5RUQ4XHU4QkE0XHU4RkQ0XHU1NkRFXHU4RjgzXHU1QjhDXHU2NTc0XHU3NkVFXHU1RjU1XHU2ODExXG4gKiAtIFx1NjUyRlx1NjMwMSBwcmVmaXggXHU1M0MyXHU2NTcwXHVGRjBDXHU1QzU1XHU1RjAwXHU2MzA3XHU1QjlBXHU1QjUwXHU2ODExXG4gKi9cbmltcG9ydCB0eXBlIHsgVHJlZVJlc3BvbnNlLCBUcmVlTm9kZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQgeyB0eXBlIEFwcCwgVEZvbGRlciB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuXG5jb25zdCBFWENMVURFID0gbmV3IFNldChbXG4gICdcdTYzRDJcdTRFRjYnLFxuICAnc2NyaXB0cycsXG4gICcub2JzaWRpYW4nLFxuICAnLnRyYXNoJyxcbiAgJy5mZWlzaHUtc3luYycsXG4gICdub2RlX21vZHVsZXMnLFxuXSk7XG5cbi8qKiBcdTdGMTNcdTVCNTggKi9cbmxldCBjYWNoZURpcnM6IFRyZWVOb2RlW10gPSBbXTtcbmxldCBjYWNoZVRpbWUgPSAwO1xuY29uc3QgQ0FDSEVfVFRMID0gNV8wMDA7IC8vIDUgXHU3OUQyXG5cbmZ1bmN0aW9uIGJ1aWxkRnVsbFRyZWUoYXBwOiBBcHApOiBUcmVlTm9kZVtdIHtcbiAgY29uc3Qgcm9vdCA9IGFwcC52YXVsdC5nZXRSb290KCk7XG4gIGNvbnN0IGRpcnM6IFRyZWVOb2RlW10gPSBbXTtcblxuICBjb25zdCB3YWxrID0gKGZvbGRlcjogVEZvbGRlciwgZGVwdGg6IG51bWJlcikgPT4ge1xuICAgIGlmIChkZXB0aCA+IDApIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBmb2xkZXIubmFtZTtcbiAgICAgIGlmIChFWENMVURFLmhhcyhuYW1lKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJy4nKSkgcmV0dXJuO1xuICAgICAgZGlycy5wdXNoKHsgcGF0aDogZm9sZGVyLnBhdGgsIGxhYmVsOiBuYW1lLCBkZXB0aCB9KTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBmb2xkZXIuY2hpbGRyZW4pIHtcbiAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIFRGb2xkZXIpIHdhbGsoY2hpbGQsIGRlcHRoICsgMSk7XG4gICAgfVxuICB9O1xuXG4gIHdhbGsocm9vdCwgMCk7XG5cbiAgZGlycy5zb3J0KChhLCBiKSA9PiBhLnBhdGgubG9jYWxlQ29tcGFyZShiLnBhdGgsICd6aCcpKTtcblxuICByZXR1cm4gZGlycztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyZWVIYW5kbGVyKGFwcDogQXBwKSB7XG4gIHJldHVybiBhc3luYyAoY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8VHJlZVJlc3BvbnNlPiA9PiB7XG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBtYXhEZXB0aCA9IHBhcnNlSW50KGN0eC5xdWVyeS5nZXQoJ21heERlcHRoJykgfHwgJzEyJywgMTApO1xuICAgIGNvbnN0IHByZWZpeCA9IGN0eC5xdWVyeS5nZXQoJ3ByZWZpeCcpIHx8ICcnO1xuXG4gICAgLy8gXHU1MjM3XHU2NUIwXHU3RjEzXHU1QjU4XG4gICAgaWYgKG5vdyAtIGNhY2hlVGltZSA+IENBQ0hFX1RUTCB8fCBjYWNoZURpcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjYWNoZURpcnMgPSBidWlsZEZ1bGxUcmVlKGFwcCk7XG4gICAgICBjYWNoZVRpbWUgPSBub3c7XG4gICAgfVxuXG4gICAgbGV0IGRpcnMgPSBjYWNoZURpcnM7XG5cbiAgICAvLyBwcmVmaXggXHU3QjVCXHU5MDA5XHVGRjFBXHU1M0VBXHU4RkQ0XHU1NkRFIHByZWZpeC8gXHU0RTBCXHU3Njg0XHU1QjUwXHU4MjgyXHU3MEI5XHVGRjA4ZGVwdGggXHU0RUNFIHByZWZpeCBcdTRFMEJcdTRFMDBcdTdFQTdcdTVGMDBcdTU5Q0JcdUZGMDlcbiAgICBpZiAocHJlZml4KSB7XG4gICAgICBjb25zdCBwcmVmaXhEZXB0aCA9IHByZWZpeC5zcGxpdCgnLycpLmxlbmd0aCArIDE7XG4gICAgICBkaXJzID0gZGlycy5maWx0ZXIoZCA9PiBkLnBhdGguc3RhcnRzV2l0aChwcmVmaXggKyAnLycpICYmIGQuZGVwdGggPD0gcHJlZml4RGVwdGggKyAxKTtcbiAgICAgIC8vIFx1OTFDRFx1NjVCMFx1OEJBMVx1N0I5N1x1NzZGOFx1NUJGOVx1NkRGMVx1NUVBNlxuICAgICAgZGlycyA9IGRpcnMubWFwKGQgPT4gKHtcbiAgICAgICAgLi4uZCxcbiAgICAgICAgZGVwdGg6IGQuZGVwdGggLSBwcmVmaXhEZXB0aCArIDIsXG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFx1NjMwOSBtYXhEZXB0aCBcdTYyMkFcdTY1QURcbiAgICAgIGRpcnMgPSBkaXJzLmZpbHRlcihkID0+IGQuZGVwdGggPD0gbWF4RGVwdGgpO1xuICAgIH1cblxuICAgIHJldHVybiB7IG9rOiB0cnVlLCBkaXJzIH07XG4gIH07XG59XG5cbi8qKiBcdTVCRkNcdTUxRkFcdTUyMzdcdTY1QjBcdTdGMTNcdTVCNThcdUZGMDhcdTY1ODdcdTRFRjZcdTY0Q0RcdTRGNUNcdTU0MEVcdThDMDNcdTc1MjhcdUZGMDlcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZhbGlkYXRlVHJlZUNhY2hlKCk6IHZvaWQge1xuICBjYWNoZURpcnMgPSBbXTtcbiAgY2FjaGVUaW1lID0gMDtcbn1cbiIsICIvKipcbiAqIFBPU1QgL2ZldGNoIFx1MjAxNCBcdTk4REVcdTRFNjZcdTIxOTJPQiBcdTg0M0RcdTU3MzBcdTRFM0JcdTk0RkVcdThERUZcdTMwMDJcbiAqXG4gKiBcdTRGOURcdTYzNkUgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3Ni4xXHVGRjFBXG4gKiAxLiBsYXJrLWNsaSBkb2NzICtmZXRjaCAtLWRvYy1mb3JtYXQgbWFya2Rvd24gXHUyMTkyIFx1NkI2M1x1NjU4NyBtZFxuICogMi4gbGFyay1jbGkgZG9jcyArZmV0Y2ggLS1kb2MtZm9ybWF0IHhtbCAtLWRldGFpbCB3aXRoLWlkcyBcdTIxOTIgZmlsZV90b2tlbiBcdTUyMTdcdTg4NjggKyBjYWxsb3V0IFx1OTg5Q1x1ODI3MiArIGRvY3ggb2JqX3Rva2VuXG4gKiAzLiBcdTU2RkVcdTcyNDcgYXV0aGNvZGUgVVJMIFx1MjE5MiBmZWlzaHU6Ly9UT0tFTlxuICogNC4gZXhpc3RzIFx1NjhDMFx1NjdFNVx1RkYxQVx1NURGMlx1NjcwOVx1NTQwQyBmZWlzaHVfaWQgXHUyMTkyIFx1NjZGNFx1NjVCMFx1NTIwNlx1NjUyRlx1RkYxQlx1NjVFMCBcdTIxOTIgXHU2NUIwXHU1RUZBXG4gKiA1LiBcdTdFQzRcdTg4QzUgWUFNTFx1RkYwOGZlaXNodV9pZC9mZWlzaHVfZG9jX2lkL2ZlaXNodV90aXRsZS9zeW5jX3RpbWVcdUZGMDkrIFx1NkI2M1x1NjU4N1xuICogNi4gXHU2NTg3XHU0RUY2XHU1NDBEID0gXHU1Qjg5XHU1MTY4XHU2RTA1XHU2RDE3KGZlaXNodV90aXRsZSlcdUZGMENcdTUxOTlcdTUxNjUgZGlyXG4gKiA3LiBhdXRvLXJlbmFtZSBcdTg5RTZcdTUzRDFcdTdGMTZcdTc4MDEgXHUyMTkyIFx1NTE5OVx1NTZERVx1NjU4N1x1NEVGNlx1NTQwRCArIFlBTUwgXHU3RjE2XHU3ODAxXG4gKiA4LiBcdThCQTFcdTdCOTcgc3luY19oYXNoXHVGRjBDXHU1MTk5IHN5bmNfdGltZVxuICogOS4gXHU4RkQ0XHU1NkRFXHU4NDNEXHU1NzMwXHU4REVGXHU1Rjg0XG4gKi9cbmltcG9ydCB0eXBlIHsgRmV0Y2hSZXF1ZXN0LCBGZXRjaFJlc3BvbnNlIH0gZnJvbSAnQHN5bmMvc2hhcmVkJztcbmltcG9ydCB7IEFwcCwgVEZpbGUsIFRGb2xkZXIgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IFJlcXVlc3RDb250ZXh0LCBIdHRwRXJyb3IgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuaW1wb3J0IHR5cGUgeyBGZWlzaHVTeW5jU2V0dGluZ3MsIFBsdWdpblN0YXRlIH0gZnJvbSAnLi4vc2V0dGluZ3MuanMnO1xuaW1wb3J0IHsgcnVuLCBnZXRXaWtpTm9kZUluZm8gfSBmcm9tICcuLi9sYXJrL2NsaS5qcyc7XG5pbXBvcnQge1xuICBleHRyYWN0SW1nVG9rZW5zRnJvbVhtbCxcbiAgY29udmVydEZlaXNodUNhbGxvdXRzVG9PQixcbiAgY2FsbG91dFhtbFRvTWV0YSxcbn0gZnJvbSAnQHN5bmMvc2hhcmVkJztcbmltcG9ydCB7XG4gIHBhcnNlRmlsZSxcbiAgYnVpbGRJbml0aWFsRnJvbnRtYXR0ZXIsXG4gIG1lcmdlRnJvbnRtYXR0ZXJGb3JVcGRhdGUsXG4gIGFzc2VtYmxlTWQsXG4gIHByb2Nlc3NGZWlzaHVNZCxcbiAgbWFrZUZpbGVuYW1lLFxuICBtYWtlUGF0aCxcbn0gZnJvbSAnLi4vZmlsZWlvL3dyaXRlci5qcyc7XG5pbXBvcnQgeyBhc3NpZ25FbmNvZGluZyB9IGZyb20gJy4uL2F1dG9SZW5hbWUuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZldGNoRGVwcyB7XG4gIGFwcDogQXBwO1xuICBzZXR0aW5nczogRmVpc2h1U3luY1NldHRpbmdzO1xuICBzdGF0ZTogUGx1Z2luU3RhdGU7XG4gIG5vdGljZTogKG1zZzogc3RyaW5nKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRmV0Y2hIYW5kbGVyKGRlcHM6IEZldGNoRGVwcykge1xuICByZXR1cm4gYXN5bmMgKGN0eDogUmVxdWVzdENvbnRleHQpOiBQcm9taXNlPEZldGNoUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCByZXEgPSBjdHguYm9keSBhcyBGZXRjaFJlcXVlc3Q7XG4gICAgaWYgKCFyZXE/Lm5vZGVfdG9rZW4pIHtcbiAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoJ25vZGVfdG9rZW4gaXMgcmVxdWlyZWQnKSBhcyBFcnJvciAmIHsgY29kZTogc3RyaW5nOyBzdGF0dXM6IG51bWJlciB9O1xuICAgICAgZS5jb2RlID0gJ01JU1NJTkdfVE9LRU4nO1xuICAgICAgZS5zdGF0dXMgPSA0MDA7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIGNvbnN0IHsgbm9kZV90b2tlbiwgc3BhY2VfaWQsIGRpciB9ID0gcmVxO1xuICAgIGNvbnN0IHNldHRpbmdzID0gZGVwcy5zZXR0aW5ncztcbiAgICBjb25zdCB0YXJnZXREaXIgPSBkaXIgPz8gc2V0dGluZ3MuZGVmYXVsdERpcjtcblxuICAgIGRlcHMubm90aWNlKGBcdTJCMDcgXHU1NDBDXHU2QjY1XHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzICR7bm9kZV90b2tlbi5zbGljZSgwLCA4KX0uLi5gKTtcblxuICAgIC8vIFx1NkI2NVx1OUFBNCAxXHVGRjFBXHU2MkZGXHU2QjYzXHU2NTg3IG1kXG4gICAgbGV0IG1kOiBzdHJpbmc7XG4gICAgdHJ5IHtcbiAgICAgIG1kID0gcnVuKFxuICAgICAgICBbJ2RvY3MnLCAnK2ZldGNoJywgJy0tZG9jJywgbm9kZV90b2tlbiwgJy0tZG9jLWZvcm1hdCcsICdtYXJrZG93biddLFxuICAgICAgICB7IHRpbWVvdXQ6IDYwMDAwIH0sXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gbm9kZV90b2tlbiBcdTUzRUZcdTgwRkRcdTY2MkYgd2lraSBub2RlXHVGRjBDXHU5NzAwXHU1MTQ4XHU4OUUzXHU2NzkwXHU0RTNBIG9ial90b2tlblxuICAgICAgY29uc3QgaW5mbyA9IHNwYWNlX2lkID8gZ2V0V2lraU5vZGVJbmZvKG5vZGVfdG9rZW4sIHNwYWNlX2lkKSA6IG51bGw7XG4gICAgICBpZiAoaW5mbz8ub2JqX3Rva2VuKSB7XG4gICAgICAgIG1kID0gcnVuKFxuICAgICAgICAgIFsnZG9jcycsICcrZmV0Y2gnLCAnLS1kb2MnLCBpbmZvLm9ial90b2tlbiwgJy0tZG9jLWZvcm1hdCcsICdtYXJrZG93biddLFxuICAgICAgICAgIHsgdGltZW91dDogNjAwMDAgfSxcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBcdTZCNjVcdTlBQTQgMlx1RkYxQVx1NjJGRiBYTUxcdUZGMDhcdTU2RkVcdTcyNDcgdG9rZW4gKyBjYWxsb3V0IFx1OTg5Q1x1ODI3MiArIGRvY3ggb2JqX3Rva2VuXHVGRjA5XG4gICAgbGV0IHhtbCA9ICcnO1xuICAgIGxldCBvYmpUb2tlbiA9IHJlcS5vYmpfdG9rZW4gPz8gJyc7XG4gICAgdHJ5IHtcbiAgICAgIHhtbCA9IHJ1bihcbiAgICAgICAgWydkb2NzJywgJytmZXRjaCcsICctLWRvYycsIG5vZGVfdG9rZW4sICctLWRvYy1mb3JtYXQnLCAneG1sJywgJy0tZGV0YWlsJywgJ3dpdGgtaWRzJ10sXG4gICAgICAgIHsgdGltZW91dDogNjAwMDAgfSxcbiAgICAgICk7XG4gICAgICBpZiAoIW9ialRva2VuKSB7XG4gICAgICAgIC8vIG9ial90b2tlbiBcdTU3MjggWE1MIFx1NzY4NCA8dGl0bGUgaWQ9XCIuLi5cIj4gXHU1QzVFXHU2MDI3XHU5MUNDXHVGRjA4XHU4OUUzXHU1MzA1XHU1NDBFXHU3Njg0XHU3RUFGIFhNTCBcdTZDQTFcdTY3MDlcdTY2M0VcdTVGMEYgb2JqX3Rva2VuIFx1NUI1N1x1NkJCNVx1RkYwOVxuICAgICAgICBjb25zdCB0aXRsZUlkTWF0Y2ggPSB4bWwubWF0Y2goLzx0aXRsZVtePl0qXFxiaWQ9XCIoW0EtWmEtejAtOV0rKVwiLyk7XG4gICAgICAgIGlmICh0aXRsZUlkTWF0Y2gpIG9ialRva2VuID0gdGl0bGVJZE1hdGNoWzFdO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS53YXJuKCdbc3luYy9mZXRjaF0geG1sIGZldGNoIGZhaWxlZCAoaW1hZ2UgdG9rZW5zIG1heSBiZSBtaXNzaW5nKTonLCBlcnIpO1xuICAgIH1cblxuICAgIC8vIFx1NkI2NVx1OUFBNCAyLjVcdUZGMUFcdTRFQ0VcdTk4REVcdTRFNjZcdTU5MzRcdTkwRTggY2FsbG91dCBcdTg5RTNcdTY3OTBcdTUxNDNcdTY1NzBcdTYzNkVcdUZGMDhcdTY4MDdcdTdCN0UvXHU3RjE2XHU3ODAxL1x1OEY5M1x1NTE2NS9cdTY1RTVcdTY3MUYvXHU1MTczXHU5NTJFXHU4QkNEL1x1OEJDNFx1NTIwNi9cdTdEMjJcdTVGMTVcdUZGMDlcbiAgICAvLyBcdThGRDlcdTRFOUJcdTVCNTdcdTZCQjVcdTRGMUFcdTUxOTlcdThGREIgWUFNTCBmcm9udG1hdHRlclx1RkYxQlx1NkI2M1x1NjU4NyBjYWxsb3V0IFx1NEZERFx1NzU1OVx1NEUwRFx1NTJBOFx1RkYwOFx1NkI2NVx1OUFBNCAzLjUgXHU4RjZDIE9CIGNhbGxvdXRcdUZGMDlcbiAgICBjb25zdCBtZXRhID0ge1xuICAgICAgLi4uKHhtbCA/IGNhbGxvdXRYbWxUb01ldGEoeG1sKSA6IHt9KSxcbiAgICAgIC4uLihyZXEubWV0YSA/PyB7fSksXG4gICAgfTtcbiAgICBpZiAoT2JqZWN0LmtleXMobWV0YSkubGVuZ3RoID4gMCkge1xuICAgICAgZGVwcy5ub3RpY2UoYFx1RDgzRFx1RENDQiBcdTYzRDBcdTUzRDZcdTUyMzAgJHtPYmplY3Qua2V5cyhtZXRhKS5sZW5ndGh9IFx1NEUyQVx1NTE0M1x1NjU3MFx1NjM2RVx1NUI1N1x1NkJCNWApO1xuICAgIH1cblxuICAgIC8vIFx1NkI2NVx1OUFBNCAzXHVGRjFBXHU1NkZFXHU3MjQ3IHRva2VuIFx1MjE5MiBmZWlzaHU6Ly8gXHU1MzRGXHU4QkFFXG4gICAgY29uc3QgaW1nVG9rZW5zID0gbmV3IFNldChleHRyYWN0SW1nVG9rZW5zRnJvbVhtbCh4bWwpKTtcbiAgICBsZXQgcHJvY2Vzc2VkTWQgPSBwcm9jZXNzRmVpc2h1TWQobWQsIGltZ1Rva2Vucyk7XG5cbiAgICAvLyBcdTZCNjVcdTlBQTQgMy41XHVGRjFBXHU5OERFXHU0RTY2XHU2QjYzXHU2NTg3IGNhbGxvdXQgWE1MIFx1MjE5MiBPQiBjYWxsb3V0XG4gICAgaWYgKHhtbCkge1xuICAgICAgcHJvY2Vzc2VkTWQgPSBjb252ZXJ0RmVpc2h1Q2FsbG91dHNUb09CKHByb2Nlc3NlZE1kKTtcbiAgICB9XG5cbiAgICAvLyBcdTYzRDBcdTUzRDZcdTk4REVcdTRFNjZcdTY4MDdcdTk4OThcdUZGMDhtZCBcdTdCMkNcdTRFMDBcdTRFMkEgSDFcdUZGMENcdTYyMTYgZmFsbGJhY2sgXHU1MjMwIG5vZGUgXHU0RkUxXHU2MDZGXHVGRjA5XG4gICAgY29uc3QgdGl0bGVNYXRjaCA9IHByb2Nlc3NlZE1kLm1hdGNoKC9eI1xccysoLispJC9tKTtcbiAgICBsZXQgZmVpc2h1VGl0bGUgPSB0aXRsZU1hdGNoPy5bMV0/LnRyaW0oKSA/PyBub2RlX3Rva2VuO1xuICAgIC8vIFx1NTk4Mlx1Njc5QyBtZCBcdTkxQ0NcdTY3MDkgSDFcdUZGMENcdTRFQ0VcdTZCNjNcdTY1ODdcdTUzQkJcdTYzODlcdUZGMDhPQiBcdTY1ODdcdTRFRjYgSDEgXHU0RkREXHU3NTU5XHVGRjBDXHU0RjQ2XHU5MDdGXHU1MTREXHU5MUNEXHU1OTBEXHUyMDE0XHUyMDE0XHU4RkQ5XHU5MUNDXHU0RkREXHU3NTU5IEgxIFx1NEY1Q1x1NEUzQVx1NkI2M1x1NjU4N1x1OTk5Nlx1ODg0Q1x1RkYwOVxuICAgIC8vIFx1NTFCM1x1N0I1Nlx1RkYxQVx1NEZERFx1NzU1OSBIMVx1RkYwQ1x1NTZFMFx1NEUzQSBPQiBcdTc2ODRcdTY1ODdcdTRFRjZcdTU0MERcdTU0OEMgSDEgXHU1M0VGXHU0RUU1XHU0RTBEXHU1NDBDXG5cbiAgICAvLyBcdTZCNjVcdTlBQTQgNFx1RkYxQWV4aXN0cyBcdTY4QzBcdTY3RTVcbiAgICBjb25zdCBleGlzdGluZ0ZpbGUgPSBhd2FpdCBmaW5kQnlGZWlzaHVJZChkZXBzLmFwcCwgbm9kZV90b2tlbik7XG4gICAgY29uc3Qgc3luY1RpbWUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgbGV0IGFjdGlvbjogJ2NyZWF0ZWQnIHwgJ3VwZGF0ZWQnO1xuICAgIGxldCBmaW5hbFBhdGg6IHN0cmluZztcbiAgICBsZXQgZW5jb2Rpbmc6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgIGlmIChleGlzdGluZ0ZpbGUpIHtcbiAgICAgIC8vIFx1NjZGNFx1NjVCMFx1NTIwNlx1NjUyRlx1RkYxQVx1NEZERFx1NzU1OVx1NzUyOFx1NjIzN1x1NjUzOVx1NzY4NFx1NTE0M1x1NjU3MFx1NjM2RVx1RkYwQ1x1NTNFQVx1NTIzN1x1NkI2M1x1NjU4NyArIFx1N0VEMVx1NUI5QVx1NUI1N1x1NkJCNVxuICAgICAgYWN0aW9uID0gJ3VwZGF0ZWQnO1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBkZXBzLmFwcC52YXVsdC5yZWFkKGV4aXN0aW5nRmlsZSk7XG4gICAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUZpbGUoZXhpc3RpbmcpO1xuICAgICAgY29uc3QgbWVyZ2VkID0gbWVyZ2VGcm9udG1hdHRlckZvclVwZGF0ZShcbiAgICAgICAgcGFyc2VkLmZyb250bWF0dGVyLFxuICAgICAgICBub2RlX3Rva2VuLFxuICAgICAgICBvYmpUb2tlbixcbiAgICAgICAgZmVpc2h1VGl0bGUsXG4gICAgICAgIHN5bmNUaW1lLFxuICAgICAgICBtZXRhLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhc3NlbWJsZU1kKG1lcmdlZCwgcHJvY2Vzc2VkTWQpO1xuICAgICAgYXdhaXQgZGVwcy5hcHAudmF1bHQubW9kaWZ5KGV4aXN0aW5nRmlsZSwgY29udGVudCk7XG4gICAgICBmaW5hbFBhdGggPSBleGlzdGluZ0ZpbGUucGF0aDtcbiAgICAgIGRlcHMubm90aWNlKGBcdTI3MEYgXHU1REYyXHU2NkY0XHU2NUIwICR7ZXhpc3RpbmdGaWxlLm5hbWV9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFx1NjVCMFx1NUVGQVx1NTIwNlx1NjUyRlxuICAgICAgYWN0aW9uID0gJ2NyZWF0ZWQnO1xuICAgICAgY29uc3QgZmlsZW5hbWUgPSBtYWtlRmlsZW5hbWUoZmVpc2h1VGl0bGUsIHJlcS5maWxlbmFtZSk7XG4gICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBtYWtlUGF0aCh0YXJnZXREaXIsIGZpbGVuYW1lKTtcblxuICAgICAgLy8gXHU3ODZFXHU0RkREXHU3NkVFXHU1RjU1XHU1QjU4XHU1NzI4XG4gICAgICBhd2FpdCBlbnN1cmVGb2xkZXIoZGVwcy5hcHAsIHRhcmdldERpcik7XG5cbiAgICAgIGNvbnN0IGZtID0gYnVpbGRJbml0aWFsRnJvbnRtYXR0ZXIobm9kZV90b2tlbiwgb2JqVG9rZW4sIGZlaXNodVRpdGxlLCBzeW5jVGltZSwgbWV0YSk7XG4gICAgICBjb25zdCBjb250ZW50ID0gYXNzZW1ibGVNZChmbSwgcHJvY2Vzc2VkTWQpO1xuXG4gICAgICAvLyBcdTY4QzBcdTY3RTVcdTY1ODdcdTRFRjZcdTY2MkZcdTU0MjZcdTVERjJcdTVCNThcdTU3MjhcdUZGMDhcdTU0MENcdTU0MERcdTRFMERcdTU0MEMgZmVpc2h1X2lkXHVGRjA5XG4gICAgICBjb25zdCByZXBsYWNlRmlsZSA9IHJlcS5yZXBsYWNlX3BhdGhcbiAgICAgICAgPyBkZXBzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocmVxLnJlcGxhY2VfcGF0aClcbiAgICAgICAgOiBudWxsO1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBkZXBzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocmVsYXRpdmVQYXRoKTtcbiAgICAgIGlmIChyZXBsYWNlRmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgIGF3YWl0IGRlcHMuYXBwLnZhdWx0Lm1vZGlmeShyZXBsYWNlRmlsZSwgY29udGVudCk7XG4gICAgICAgIGZpbmFsUGF0aCA9IHJlcGxhY2VGaWxlLnBhdGg7XG4gICAgICAgIGFjdGlvbiA9ICd1cGRhdGVkJztcbiAgICAgIH0gZWxzZSBpZiAoZXhpc3RpbmcgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAvLyBcdTU0MENcdTU0MERcdTUxQjJcdTdBODFcdUZGMUFcdTUyQTBcdTU0MEVcdTdGMDBcbiAgICAgICAgY29uc3QgY29uZmxpY3RQYXRoID0gbWFrZVBhdGgodGFyZ2V0RGlyLCBgJHtmaWxlbmFtZS5yZXBsYWNlKC9cXC5tZCQvLCAnJyl9LSR7bm9kZV90b2tlbi5zbGljZSgwLCA2KX0ubWRgKTtcbiAgICAgICAgYXdhaXQgZGVwcy5hcHAudmF1bHQuY3JlYXRlKGNvbmZsaWN0UGF0aCwgY29udGVudCk7XG4gICAgICAgIGZpbmFsUGF0aCA9IGNvbmZsaWN0UGF0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGNyZWF0ZWQgPSBhd2FpdCBkZXBzLmFwcC52YXVsdC5jcmVhdGUocmVsYXRpdmVQYXRoLCBjb250ZW50KTtcbiAgICAgICAgZmluYWxQYXRoID0gY3JlYXRlZC5wYXRoO1xuICAgICAgfVxuXG4gICAgICBkZXBzLm5vdGljZShgXHUyNzA1IFx1NURGMlx1NTIxQlx1NUVGQSAke2ZpbGVuYW1lfWApO1xuXG4gICAgICAvLyBcdTZCNjVcdTlBQTQgN1x1RkYxQWF1dG8tcmVuYW1lIFx1N0YxNlx1NzgwMVx1NTIwNlx1OTE0RFxuICAgICAgaWYgKHNldHRpbmdzLmF1dG9SZW5hbWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBlbmNvZGluZyA9IGF3YWl0IGFzc2lnbkVuY29kaW5nKGRlcHMuYXBwLCBmaW5hbFBhdGgsIHRhcmdldERpcik7XG4gICAgICAgICAgaWYgKGVuY29kaW5nKSB7XG4gICAgICAgICAgICBkZXBzLm5vdGljZShgXHVEODNEXHVERDIyIFx1N0YxNlx1NzgwMVx1RkYxQSR7ZW5jb2Rpbmd9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2ZldGNoXSBhdXRvLXJlbmFtZSBmYWlsZWQ6JywgZXJyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFx1OEJCMFx1NUY1NVx1NjcwMFx1OEZEMVx1NTQwQ1x1NkI2NVxuICAgIGRlcHMuc3RhdGUucmVjZW50U3luY3MudW5zaGlmdCh7XG4gICAgICB0aW1lOiBzeW5jVGltZSxcbiAgICAgIG5vZGVfdG9rZW4sXG4gICAgICB0aXRsZTogZmVpc2h1VGl0bGUsXG4gICAgICBwYXRoOiBmaW5hbFBhdGgsXG4gICAgICBhY3Rpb24sXG4gICAgfSk7XG4gICAgaWYgKGRlcHMuc3RhdGUucmVjZW50U3luY3MubGVuZ3RoID4gNTApIHtcbiAgICAgIGRlcHMuc3RhdGUucmVjZW50U3luY3MgPSBkZXBzLnN0YXRlLnJlY2VudFN5bmNzLnNsaWNlKDAsIDUwKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgb2s6IHRydWUsXG4gICAgICBwYXRoOiBmaW5hbFBhdGgsXG4gICAgICBmaWxlbmFtZTogZmluYWxQYXRoLnNwbGl0KCcvJykucG9wKCkgPz8gJycsXG4gICAgICBhY3Rpb24sXG4gICAgICBcdTdGMTZcdTc4MDE6IGVuY29kaW5nLFxuICAgICAgZmVpc2h1X3RpdGxlOiBmZWlzaHVUaXRsZSxcbiAgICB9O1xuICB9O1xufVxuXG4vKipcbiAqIFx1NjMwOSBmZWlzaHVfaWQgXHU2N0U1XHU2MjdFXHU1REYyXHU1NDBDXHU2QjY1XHU2NTg3XHU0RUY2XHUzMDAyXG4gKiBcdTYyNkJcdTYzQ0YgdmF1bHQgXHU0RTBCXHU2MjQwXHU2NzA5IC5tZFx1RkYwQ1x1ODlFM1x1Njc5MCBmcm9udG1hdHRlciBcdTUzMzlcdTkxNEQgZmVpc2h1X2lkXHUzMDAyXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZpbmRCeUZlaXNodUlkKGFwcDogQXBwLCBmZWlzaHVJZDogc3RyaW5nKTogUHJvbWlzZTxURmlsZSB8IG51bGw+IHtcbiAgY29uc3QgZmlsZXMgPSBhcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAvLyBcdThERjNcdThGQzdcdTYzRDJcdTRFRjZcdTc2RUVcdTVGNTVcbiAgICBpZiAoZmlsZS5wYXRoLnN0YXJ0c1dpdGgoJy5vYnNpZGlhbicpIHx8IGZpbGUucGF0aC5zdGFydHNXaXRoKCcuZmVpc2h1LXN5bmMnKSkgY29udGludWU7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBhcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgIC8vIFx1NUZFQlx1OTAxRlx1NjhDMFx1NkQ0Qlx1RkYxQVx1NTQyQiBmZWlzaHVfaWQgXHU1QjU3XHU2QkI1XHU2MjREXHU4OUUzXHU2NzkwXG4gICAgICBpZiAoIWNvbnRlbnQuaW5jbHVkZXMoJ2ZlaXNodV9pZDonKSkgY29udGludWU7XG4gICAgICBjb25zdCBmbU1hdGNoID0gY29udGVudC5tYXRjaCgvXi0tLVxcbihbXFxzXFxTXSo/KVxcbi0tLS8pO1xuICAgICAgaWYgKCFmbU1hdGNoKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGlkTWF0Y2ggPSBmbU1hdGNoWzFdLm1hdGNoKC9mZWlzaHVfaWQ6XFxzKltcIiddPyhbQS1aYS16MC05XSspLyk7XG4gICAgICBpZiAoaWRNYXRjaCAmJiBpZE1hdGNoWzFdID09PSBmZWlzaHVJZCkge1xuICAgICAgICByZXR1cm4gZmlsZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBcdTc4NkVcdTRGRERcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjhcdUZGMDhcdTkwMTJcdTVGNTJcdTUyMUJcdTVFRkFcdUZGMDlcdTMwMDJcbiAqL1xuYXN5bmMgZnVuY3Rpb24gZW5zdXJlRm9sZGVyKGFwcDogQXBwLCBkaXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICBpZiAoIWRpciB8fCBkaXIgPT09ICcuJyB8fCBkaXIgPT09ICcvJykgcmV0dXJuO1xuICBjb25zdCBleGlzdGluZyA9IGFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZGlyKTtcbiAgaWYgKGV4aXN0aW5nIGluc3RhbmNlb2YgVEZvbGRlcikgcmV0dXJuO1xuICB0cnkge1xuICAgIGF3YWl0IGFwcC52YXVsdC5jcmVhdGVGb2xkZXIoZGlyKTtcbiAgfSBjYXRjaCB7XG4gICAgLy8gXHU1M0VGXHU4MEZEXHU3MjM2XHU3NkVFXHU1RjU1XHU0RTVGXHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU5MDEyXHU1RjUyXG4gICAgY29uc3QgcGFyZW50ID0gZGlyLnNwbGl0KCcvJykuc2xpY2UoMCwgLTEpLmpvaW4oJy8nKTtcbiAgICBpZiAocGFyZW50KSBhd2FpdCBlbnN1cmVGb2xkZXIoYXBwLCBwYXJlbnQpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBhcHAudmF1bHQuY3JlYXRlRm9sZGVyKGRpcik7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBcdTVERjJcdTVCNThcdTU3MjhcdTYyMTZcdTUxNzZcdTRFRDZcdTk1MTlcdThCRUZcdUZGMENcdTVGRkRcdTc1NjVcbiAgICB9XG4gIH1cbn1cbiIsICIvKipcbiAqIFx1NjU4N1x1NEVGNiBJT1x1RkYxQVx1OEJGQlx1NTE5OSB2YXVsdCBcdTRFMkRcdTc2ODQgLm1kIFx1NjU4N1x1NEVGNlx1MzAwMlxuICogXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzZcdUZGMDhcdTUxNzNcdTk1MkVcdTZENDFcdTdBMEJcdUZGMDkrIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYFx1MzAwMlxuICpcbiAqIC0gcmVhZGVyXHVGRjFBXHU4OUUzXHU2NzkwIGZyb250bWF0dGVyICsgYm9keVx1RkYwQ1x1OEJBMVx1N0I5NyBoYXNoXHVGRjBDXHU2QkQ0XHU1QkY5IHN5bmNfaGFzaFxuICogLSB3cml0ZXJcdUZGMUFcdTdFQzRcdTg4QzUgWUFNTCArIGJvZHlcdUZGMENcdTUxOTlcdTY1ODdcdTRFRjZcbiAqL1xuaW1wb3J0IHtcbiAgcGFyc2VGcm9udG1hdHRlcixcbiAgc2VyaWFsaXplRnJvbnRtYXR0ZXIsXG4gIGFzc2VtYmxlRmlsZSxcbiAgYm9keUhhc2gsXG4gIGlzQ2hhbmdlZCxcbiAgc2FuaXRpemVGaWxlbmFtZSxcbiAgd2l0aE1kRXh0LFxuICBqb2luUGF0aCxcbiAgcmV3cml0ZUltYWdlc1RvRmVpc2h1UHJvdG8sXG4gIHR5cGUgWUFNTEZyb250bWF0dGVyLFxufSBmcm9tICdAc3luYy9zaGFyZWQnO1xuXG4vKiogXHU4QkZCXHU2NTg3XHU0RUY2XHU3RUQzXHU2NzlDXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFBhcnNlZEZpbGUge1xuICAvKiogXHU1QjhDXHU2NTc0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XHUzMDAyICovXG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgLyoqIGZyb250bWF0dGVyXHVGRjA4XHU2NUUwXHU1MjE5XHU0RTNBXHU3QTdBXHU1QkY5XHU4QzYxXHVGRjA5XHUzMDAyICovXG4gIGZyb250bWF0dGVyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgLyoqIFx1NkI2M1x1NjU4N1x1RkYwOFx1NEUwRFx1NTQyQiBmcm9udG1hdHRlclx1RkYwOVx1MzAwMiAqL1xuICBib2R5OiBzdHJpbmc7XG4gIC8qKiBcdTZCNjNcdTY1ODcgaGFzaFx1RkYwOHNoYTI1NiBoZXhcdUZGMDlcdTMwMDIgKi9cbiAgaGFzaDogc3RyaW5nO1xufVxuXG4vKipcbiAqIFx1NEVDRVx1NUI4Q1x1NjU3NFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVx1ODlFM1x1Njc5MFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGaWxlKGNvbnRlbnQ6IHN0cmluZyk6IFBhcnNlZEZpbGUge1xuICBjb25zdCB7IGZyb250bWF0dGVyLCBib2R5IH0gPSBwYXJzZUZyb250bWF0dGVyKGNvbnRlbnQpO1xuICBjb25zdCBoYXNoID0gYm9keUhhc2goYm9keSk7XG4gIHJldHVybiB7XG4gICAgY29udGVudCxcbiAgICBmcm9udG1hdHRlcjogZnJvbnRtYXR0ZXIgPz8ge30sXG4gICAgYm9keSxcbiAgICBoYXNoLFxuICB9O1xufVxuXG4vKipcbiAqIFx1NjhDMFx1NkQ0Qlx1NTE4NVx1NUJCOVx1NjYyRlx1NTQyNlx1NzZGOFx1NUJGOVx1NEUwQVx1NkIyMVx1NTQwQ1x1NkI2NVx1NTNEMVx1NzUxRlx1NTNEOFx1NTMxNlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzQ29udGVudENoYW5nZWQocGFyc2VkOiBQYXJzZWRGaWxlKTogYm9vbGVhbiB7XG4gIHJldHVybiBpc0NoYW5nZWQocGFyc2VkLmhhc2gsIHBhcnNlZC5mcm9udG1hdHRlci5zeW5jX2hhc2ggYXMgc3RyaW5nIHwgdW5kZWZpbmVkKTtcbn1cblxuLyoqXG4gKiBcdTdFQzRcdTg4QzVcdTY1QjBcdTY1ODdcdTRFRjZcdTc2ODQgZnJvbnRtYXR0ZXJcdUZGMDhcdTk4REVcdTRFNjZcdTIxOTJPQiBcdTk5OTZcdTZCMjFcdTg0M0RcdTU3MzBcdUZGMDlcdTMwMDJcbiAqIEBwYXJhbSBtZXRhIFx1NEVDRVx1OThERVx1NEU2NiBjYWxsb3V0IFx1ODlFM1x1Njc5MFx1NTFGQVx1NzY4NFx1NTE0M1x1NjU3MFx1NjM2RVx1RkYwOFx1NjgwN1x1N0I3RS9cdTdGMTZcdTc4MDEvXHU4RjkzXHU1MTY1L1x1NjVFNVx1NjcxRi9cdTUxNzNcdTk1MkVcdThCQ0QvXHU4QkM0XHU1MjA2L1x1N0QyMlx1NUYxNVx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRJbml0aWFsRnJvbnRtYXR0ZXIoXG4gIGZlaXNodUlkOiBzdHJpbmcsXG4gIGZlaXNodURvY0lkOiBzdHJpbmcsXG4gIGZlaXNodVRpdGxlOiBzdHJpbmcsXG4gIHN5bmNUaW1lOiBzdHJpbmcsXG4gIG1ldGE/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFlBTUxGcm9udG1hdHRlciB7XG4gIHJldHVybiB7XG4gICAgZmVpc2h1X2lkOiBmZWlzaHVJZCxcbiAgICBmZWlzaHVfZG9jX2lkOiBmZWlzaHVEb2NJZCxcbiAgICBmZWlzaHVfdGl0bGU6IGZlaXNodVRpdGxlLFxuICAgIHN5bmNfdGltZTogc3luY1RpbWUsXG4gICAgLy8gXHU5OERFXHU0RTY2IGNhbGxvdXQgXHU1MTQzXHU2NTcwXHU2MzZFXHVGRjA4XHU3QTdBXHU1MDNDXHU1QjU3XHU2QkI1XHU0RTBEXHU1MTk5XHU1MTY1XHVGRjBDXHU0RkREXHU2MzAxIFlBTUwgXHU1RTcyXHU1MUMwXHVGRjA5XG4gICAgLi4uKG1ldGEgJiYgc3RyaXBFbXB0eShtZXRhKSksXG4gICAgLy8gc3luY19oYXNoIFx1NTcyOFx1NTE5OVx1NTE2NVx1NjVGNlx1NzUzMSB3cml0ZXIgXHU4QkExXHU3Qjk3XHU1ODZCXHU1MTY1XG4gIH07XG59XG5cbi8qKlxuICogXHU1NDA4XHU1RTc2XHU2NkY0XHU2NUIwXHU1REYyXHU2NzA5XHU2NTg3XHU0RUY2XHU3Njg0IGZyb250bWF0dGVyXHVGRjA4XHU0RkREXHU3NTU5XHU3NTI4XHU2MjM3XHU2NTM5XHU3Njg0XHU1MTQzXHU2NTcwXHU2MzZFXHU1QjU3XHU2QkI1XHVGRjA5XHUzMDAyXG4gKiBcdTUzRUFcdTUyMzdcdTU0MENcdTZCNjVcdTdFRDFcdTVCOUFcdTdFQzRcdUZGMDhmZWlzaHVfKiAvIHN5bmNfKlx1RkYwOVx1RkYwQ1x1NEZERFx1NzU1OSBcdTY4MDdcdTdCN0UvXHU3RjE2XHU3ODAxL1x1OEY5M1x1NTE2NS9cdTY1RTVcdTY3MUYvXHU1MTczXHU5NTJFXHU4QkNEL1x1OEJDNFx1NTIwNi9cdTdEMjJcdTVGMTUgXHU3QjQ5XHU3NTI4XHU2MjM3XHU1QjU3XHU2QkI1XHUzMDAyXG4gKlxuICogXHU2Q0U4XHU2MTBGXHVGRjFBXHU1REYyXHU2NzA5XHU1QjU3XHU2QkI1XHU0RjE4XHU1MTQ4XHVGRjA4XHU3NTI4XHU2MjM3XHU1NzI4IE9CIFx1OTFDQ1x1NjUzOVx1OEZDN1x1NzY4NFx1RkYwOVx1RkYwQ1x1OThERVx1NEU2Nlx1NEZBNyBjYWxsb3V0IFx1NTE0M1x1NjU3MFx1NjM2RVx1NEVDNVx1NTcyOFx1NUI1N1x1NkJCNVx1N0YzQVx1NTkzMVx1NjVGNlx1ODg2NVx1OUY1MFx1MzAwMlxuICogXHU4RkQ5XHU2ODM3XHU5MDdGXHU1MTREXHU5OERFXHU0RTY2XHU0RkE3XHU3Njg0XHU2NUU3IGNhbGxvdXQgXHU4OTg2XHU3NkQ2IE9CIFx1OTFDQ1x1NzY4NFx1NjcwMFx1NjVCMFx1NjU3NFx1NzQwNlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VGcm9udG1hdHRlckZvclVwZGF0ZShcbiAgZXhpc3Rpbmc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuICBmZWlzaHVJZDogc3RyaW5nLFxuICBmZWlzaHVEb2NJZDogc3RyaW5nLFxuICBmZWlzaHVUaXRsZTogc3RyaW5nLFxuICBzeW5jVGltZTogc3RyaW5nLFxuICBtZXRhPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4pOiBZQU1MRnJvbnRtYXR0ZXIge1xuICByZXR1cm4ge1xuICAgIC8vIFx1NURGMlx1NjcwOVx1NUI1N1x1NkJCNVx1NEYxOFx1NTE0OFx1RkYwOFx1NzUyOFx1NjIzN1x1NjUzOVx1OEZDN1x1NzY4NFx1RkYwOVx1RkYwQ1x1OThERVx1NEU2NiBjYWxsb3V0IFx1NTE0M1x1NjU3MFx1NjM2RVx1NTNFQVx1ODg2NVx1N0YzQVx1NTkzMVxuICAgIC4uLihtZXRhICYmIHN0cmlwRW1wdHkobWV0YSkpLFxuICAgIC4uLmV4aXN0aW5nLFxuICAgIGZlaXNodV9pZDogZmVpc2h1SWQsXG4gICAgZmVpc2h1X2RvY19pZDogZmVpc2h1RG9jSWQsXG4gICAgZmVpc2h1X3RpdGxlOiBmZWlzaHVUaXRsZSxcbiAgICBzeW5jX3RpbWU6IHN5bmNUaW1lLFxuICB9IGFzIFlBTUxGcm9udG1hdHRlcjtcbn1cblxuLyoqIFx1NzlGQlx1OTY2NFx1NTAzQ1x1NEUzQVx1N0E3QVx1RkYwOHVuZGVmaW5lZC9udWxsLycnL1x1N0E3QVx1NjU3MFx1N0VDNFx1RkYwOVx1NzY4NFx1NUI1N1x1NkJCNVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NkM2MVx1NjdEMyBZQU1MXHUzMDAyICovXG5mdW5jdGlvbiBzdHJpcEVtcHR5KG9iajogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gIGNvbnN0IG91dDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcbiAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMob2JqKSkge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gbnVsbCB8fCB2ID09PSAnJykgY29udGludWU7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodikgJiYgdi5sZW5ndGggPT09IDApIGNvbnRpbnVlO1xuICAgIG91dFtrXSA9IHY7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBcdTdFQzRcdTg4QzVcdTY3MDBcdTdFQzhcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcdUZGMDhZQU1MICsgXHU2QjYzXHU2NTg3ICsgaGFzaFx1RkYwOVx1MzAwMlxuICogQHBhcmFtIGZyb250bWF0dGVyIFx1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QSArIFx1NzUyOFx1NjIzN1x1NTE0M1x1NjU3MFx1NjM2RVxuICogQHBhcmFtIGJvZHkgXHU2QjYzXHU2NTg3IG1kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlbWJsZU1kKGZyb250bWF0dGVyOiBZQU1MRnJvbnRtYXR0ZXIsIGJvZHk6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIFx1OEJBMVx1N0I5N1x1NUU3Nlx1NTE5OVx1NTE2NSBzeW5jX2hhc2hcbiAgY29uc3QgaGFzaCA9IGJvZHlIYXNoKGJvZHkpO1xuICBjb25zdCBmbVdpdGhIYXNoOiBZQU1MRnJvbnRtYXR0ZXIgPSB7XG4gICAgLi4uZnJvbnRtYXR0ZXIsXG4gICAgc3luY19oYXNoOiBoYXNoLFxuICB9O1xuICByZXR1cm4gYXNzZW1ibGVGaWxlKGZtV2l0aEhhc2gsIGJvZHkpO1xufVxuXG4vKipcbiAqIFx1NjI4QVx1OThERVx1NEU2Nlx1NUJGQ1x1NTFGQVx1NzY4NCBtZCBcdTU5MDRcdTc0MDZcdTRFM0EgT0IgXHU2QjYzXHU2NTg3XHUzMDAyXG4gKiAtIFx1NTZGRVx1NzI0NyBhdXRoY29kZSBVUkwgXHUyMTkyIGZlaXNodTovL1RPS0VOXG4gKiAtIFx1NjgwN1x1OTg5OFx1ODg0Q1x1NTNCQlx1NjM4OVx1RkYwOFx1NjgwN1x1OTg5OFx1NURGMlx1NTcyOCBmcm9udG1hdHRlci5mZWlzaHVfdGl0bGVcdUZGMENPQiBcdTkxQ0MgSDEgXHU0RkREXHU3NTU5XHU0RjQ2XHU5OERFXHU0RTY2XHU0RkE3XHU3NTMxIG9iaiBcdTU5MDRcdTc0MDZcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NGZWlzaHVNZChtZDogc3RyaW5nLCBpbWdUb2tlbnM6IFNldDxzdHJpbmc+KTogc3RyaW5nIHtcbiAgcmV0dXJuIHJld3JpdGVJbWFnZXNUb0ZlaXNodVByb3RvKG1kLCBpbWdUb2tlbnMpO1xufVxuXG4vKipcbiAqIFx1NzUxRlx1NjIxMFx1ODQzRFx1NTczMFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NUI4OVx1NTE2OFx1NkUwNVx1NkQxN1x1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUZpbGVuYW1lKGZlaXNodVRpdGxlOiBzdHJpbmcsIG92ZXJyaWRlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbmFtZSA9IG92ZXJyaWRlID8gc2FuaXRpemVGaWxlbmFtZShvdmVycmlkZSkgOiBzYW5pdGl6ZUZpbGVuYW1lKGZlaXNodVRpdGxlKTtcbiAgcmV0dXJuIHdpdGhNZEV4dChuYW1lKTtcbn1cblxuLyoqXG4gKiBcdTYyRkNcdTYzQTVcdTg0M0RcdTU3MzBcdThERUZcdTVGODRcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1ha2VQYXRoKGRpcjogc3RyaW5nIHwgdW5kZWZpbmVkLCBmaWxlbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGpvaW5QYXRoKGRpciwgZmlsZW5hbWUpO1xufVxuIiwgIi8qKlxuICogYXV0by1yZW5hbWUgXHU3RjE2XHU3ODAxXHU1MjA2XHU5MTREXHUzMDAyXHU0RjlEXHU2MzZFIGAyNl8wNTA5X1NfMDhfYTRiMTAgXHU0RTA5XHU3OUNEXHU3RjE2XHU3ODAxXHU2QTIxXHU1RjBGXHU1QjlFXHU3M0IwXHU4QkY0XHU2NjBFLm1kYFxuICogKyBgXHU3N0U1XHU4QkM2XHU1RTkzXHU4MUVBXHU1MkE4XHU2MjUzXHU2ODA3XHU1MzRGXHU4QkFFXHU4RkI5XHU3NTRDLm1kYCArIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYCBcdTAwQTcyLjNcdTMwMDJcbiAqXG4gKiBcdTdGMTZcdTc4MDFcdTY4M0NcdTVGMEZcdUZGMUFZWV9NTUREX1x1NjgwN1x1N0I3RV9cdTVFOEZcdTUzRjdbX1x1NUI1MFx1NUU4Rlx1NTNGN11cbiAqICAgLSBcdTY1ODdcdTRFRjZcdUZGMUFcdTgyMTJcdTVDNTVcdTU3OEIgU18wMVx1RkYwOFx1NjgwN1x1N0I3RV9cdTVFOEZcdTUzRjcgXHU3NTI4XHU0RTBCXHU1MjEyXHU3RUJGXHVGRjA5XG4gKiAgIC0gXHU2NTg3XHU0RUY2XHU1OTM5XHVGRjFBXHU3RDI3XHU1MUQxXHU1NzhCIFMwMVx1RkYwOFx1NjgwN1x1N0I3RVx1NUU4Rlx1NTNGNyBcdTY1RTBcdTRFMEJcdTUyMTJcdTdFQkZcdUZGMDlcbiAqXG4gKiBcdTY4MDdcdTdCN0VcdTRGNTNcdTdDRkJcdUZGMDg2IFx1N0M3Qlx1RkYwQ1x1NTQyQlx1ODg2NVx1NTE2OFx1NzY4NCBRIFx1NzA3NVx1NkMxNFx1RkYwOVx1RkYxQVxuICogICBTPVx1NjUzNlx1OTZDNiAgWD1cdTk4NzlcdTc2RUUgIEw9XHU5ODg2XHU1N0RGICBaPVx1OEQ0NFx1NkU5MCAgUT1cdTcwNzVcdTYxMUYgIEo9XHU2MjgwXHU4MEZEXG4gKlxuICogXHU4OUU2XHU1M0QxXHVGRjFBZmV0Y2ggXHU4NDNEXHU1NzMwXHU1NDBFXHUzMDAxXHU1M0YzXHU5NTJFXHU4M0RDXHU1MzU1XHUzMDAxcmliYm9uIFx1NjI3OVx1OTFDRlx1MzAwMlxuICovXG5pbXBvcnQgdHlwZSB7IEFwcCwgVEZpbGUsIFRGb2xkZXIgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBwYXJzZUZyb250bWF0dGVyLCBzZXJpYWxpemVGcm9udG1hdHRlciwgYXNzZW1ibGVGaWxlLCB0eXBlIFRhZyB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5cbi8qKiBcdTY4MDdcdTdCN0UgXHUyMTkyIFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1RkYwOFx1NEY5RFx1NjM2RSAwMV9cdTVCRjlcdTZCRDRcdTYyQTVcdTU0NEEubWQgXHU3Njg0XHU3NkVFXHU1RjU1XHU4REVGXHU3NTMxXHU4OUM0XHU1MjE5XHVGRjA5XHUzMDAyICovXG5jb25zdCBUQUdfQllfRElSX0hJTlQ6IFJlY29yZDxzdHJpbmcsIFRhZz4gPSB7XG4gICcwXHVGRTBGXHUyMEUzXHU4RjkzXHU1MTY1JzogJ1MnLFxuICAnMVx1RkUwRlx1MjBFM1x1OEY5M1x1NTFGQSc6ICdYJyxcbiAgJzJcdUZFMEZcdTIwRTNcdUQ4M0RcdUREQzNcdTc3RTVcdThCQzZcdTZDNjAnOiAnWicsXG59O1xuXG4vKiogXHU3RjE2XHU3ODAxXHU2QjYzXHU1MjE5XHVGRjFBWVlfTU1ERF9UX05OW19hTl1cdTMwMDIgKi9cbmNvbnN0IENPREVfUkUgPSAvXihcXGR7Mn0pXyhcXGR7NH0pXyhbU1hTTFpRSl0pXyhcXGQrKSg/Ol8oW2Etel1cXGQrKSk/JC87XG5cbi8qKlxuICogXHU0RUNFXHU2NTg3XHU0RUY2XHU2MjQwXHU1NzI4XHU3NkVFXHU1RjU1XHU2M0E4XHU1QkZDXHU2ODA3XHU3QjdFXHUzMDAyXG4gKiBcdTRGMThcdTUxNDhcdTdFQTdcdUZGMUFZQU1MIFx1NjgwN1x1N0I3RVx1NUI1N1x1NkJCNSA+IFx1NzZFRVx1NUY1NVx1NTI0RFx1N0YwMCA+IFx1OUVEOFx1OEJBNCBTXHUzMDAyXG4gKi9cbmZ1bmN0aW9uIGluZmVyVGFnKGRpcjogc3RyaW5nLCBleGlzdGluZ1RhZz86IFRhZyk6IFRhZyB7XG4gIGlmIChleGlzdGluZ1RhZyAmJiBbJ1MnLCAnWCcsICdMJywgJ1onLCAnUScsICdKJ10uaW5jbHVkZXMoZXhpc3RpbmdUYWcpKSB7XG4gICAgcmV0dXJuIGV4aXN0aW5nVGFnO1xuICB9XG4gIGZvciAoY29uc3QgW2RpckhpbnQsIHRhZ10gb2YgT2JqZWN0LmVudHJpZXMoVEFHX0JZX0RJUl9ISU5UKSkge1xuICAgIGlmIChkaXIuc3RhcnRzV2l0aChkaXJIaW50KSkgcmV0dXJuIHRhZztcbiAgfVxuICAvLyBcdTc3RTVcdThCQzZcdTZDNjBcdTRFMEJcdTc2ODRcdTVCNTBcdTc2RUVcdTVGNTVcdTUzRUZcdTgwRkRcdThGREJcdTRFMDBcdTZCNjVcdTdFQzZcdTUyMDZcbiAgaWYgKGRpci5pbmNsdWRlcygnXHU3N0U1XHU4QkM2XHU2QzYwJykgfHwgZGlyLmluY2x1ZGVzKCdcdUQ4M0RcdUREQzMnKSkge1xuICAgIC8vIFx1OEQ0NFx1NkU5MFx1N0M3Qlx1OUVEOFx1OEJBNCBaXHVGRjBDXHU1M0VGXHU4OEFCXHU3NkVFXHU1RjU1XHU1NDBEXHU4OTg2XHU3NkQ2XG4gICAgaWYgKGRpci5pbmNsdWRlcygnTCcpIHx8IGRpci5pbmNsdWRlcygnXHU5ODg2XHU1N0RGJykpIHJldHVybiAnTCc7XG4gICAgaWYgKGRpci5pbmNsdWRlcygnUScpIHx8IGRpci5pbmNsdWRlcygnXHU3MDc1XHU2MTFGJykpIHJldHVybiAnUSc7XG4gICAgaWYgKGRpci5pbmNsdWRlcygnSicpIHx8IGRpci5pbmNsdWRlcygnXHU2MjgwXHU4MEZEJykpIHJldHVybiAnSic7XG4gICAgcmV0dXJuICdaJztcbiAgfVxuICBpZiAoZGlyLmluY2x1ZGVzKCdcdThGOTNcdTUxRkEnKSB8fCBkaXIuaW5jbHVkZXMoJzFcdUZFMEZcdTIwRTMnKSkgcmV0dXJuICdYJztcbiAgaWYgKGRpci5pbmNsdWRlcygnXHU4RjkzXHU1MTY1JykgfHwgZGlyLmluY2x1ZGVzKCcwXHVGRTBGXHUyMEUzJykpIHJldHVybiAnUyc7XG4gIHJldHVybiAnUyc7XG59XG5cbi8qKlxuICogXHU2MjZCXHU2M0NGXHU1NDBDXHU3NkVFXHU1RjU1XHU0RTBCXHU1NDBDXHU2ODA3XHU3QjdFXHU3Njg0XHU2NzAwXHU1OTI3XHU1RThGXHU1M0Y3XHVGRjBDXHU1MjA2XHU5MTREXHU2NUIwXHU1RThGXHU1M0Y3XHUzMDAyXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIG5leHRTZXF1ZW5jZShhcHA6IEFwcCwgZGlyOiBzdHJpbmcsIHRhZzogVGFnKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgY29uc3QgZm9sZGVyID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChkaXIpO1xuICBpZiAoIShmb2xkZXIgaW5zdGFuY2VvZiBURm9sZGVyKSkgcmV0dXJuIDE7XG5cbiAgbGV0IG1heFNlcSA9IDA7XG4gIGZvciAoY29uc3QgY2hpbGQgb2YgZm9sZGVyLmNoaWxkcmVuKSB7XG4gICAgaWYgKCEoY2hpbGQgaW5zdGFuY2VvZiBURmlsZSkgfHwgIWNoaWxkLm5hbWUuZW5kc1dpdGgoJy5tZCcpKSBjb250aW51ZTtcbiAgICBjb25zdCBtYXRjaCA9IGNoaWxkLm5hbWUubWF0Y2goQ09ERV9SRSk7XG4gICAgaWYgKG1hdGNoICYmIG1hdGNoWzNdID09PSB0YWcpIHtcbiAgICAgIGNvbnN0IHNlcSA9IHBhcnNlSW50KG1hdGNoWzRdLCAxMCk7XG4gICAgICBpZiAoc2VxID4gbWF4U2VxKSBtYXhTZXEgPSBzZXE7XG4gICAgfVxuICAgIC8vIFx1NEU1Rlx1NTMzOVx1OTE0RFx1NjVFMFx1NTI0RFx1N0YwMFx1NEY0Nlx1NjcwOSBZQU1MIFx1N0YxNlx1NzgwMVx1NzY4NFx1NjBDNVx1NTFCNVxuICAgIGlmICghbWF0Y2gpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBhcHAudmF1bHQucmVhZChjaGlsZCk7XG4gICAgICAgIGNvbnN0IHsgZnJvbnRtYXR0ZXIgfSA9IHBhcnNlRnJvbnRtYXR0ZXIoY29udGVudCk7XG4gICAgICAgIGNvbnN0IGVuYyA9IGZyb250bWF0dGVyPy5cdTdGMTZcdTc4MDEgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgICBpZiAoZW5jKSB7XG4gICAgICAgICAgY29uc3QgZW5jTWF0Y2ggPSBlbmMubWF0Y2goQ09ERV9SRSk7XG4gICAgICAgICAgaWYgKGVuY01hdGNoICYmIGVuY01hdGNoWzNdID09PSB0YWcpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlcSA9IHBhcnNlSW50KGVuY01hdGNoWzRdLCAxMCk7XG4gICAgICAgICAgICBpZiAoc2VxID4gbWF4U2VxKSBtYXhTZXEgPSBzZXE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBtYXhTZXEgKyAxO1xufVxuXG4vKipcbiAqIFx1NEUzQVx1NjU4N1x1NEVGNlx1NTIwNlx1OTE0RFx1N0YxNlx1NzgwMVx1MzAwMlxuICogLSBcdTc1MUZcdTYyMTAgWVlfTU1ERF9UX05OIFx1NjgzQ1x1NUYwRlxuICogLSBcdTkxQ0RcdTU0N0RcdTU0MERcdTY1ODdcdTRFRjZcdUZGMDhcdTUyQTBcdTdGMTZcdTc4MDFcdTUyNERcdTdGMDBcdUZGMDlcbiAqIC0gXHU1MTk5XHU1NkRFIFlBTUwgXHU3RjE2XHU3ODAxXHU1QjU3XHU2QkI1XG4gKlxuICogQHJldHVybnMgXHU1MjA2XHU5MTREXHU1MjMwXHU3Njg0XHU3RjE2XHU3ODAxXHU0RTMyXHVGRjBDXHU1OTgyIFwiMjZfMDYxNV9TXzAxXCJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFzc2lnbkVuY29kaW5nKFxuICBhcHA6IEFwcCxcbiAgZmlsZVBhdGg6IHN0cmluZyxcbiAgZGlyOiBzdHJpbmcsXG4pOiBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD4ge1xuICBjb25zdCBmaWxlID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChmaWxlUGF0aCk7XG4gIGlmICghKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgY29uc3QgY29udGVudCA9IGF3YWl0IGFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICBjb25zdCB7IGZyb250bWF0dGVyLCBib2R5IH0gPSBwYXJzZUZyb250bWF0dGVyKGNvbnRlbnQpO1xuICBjb25zdCBmbSA9IGZyb250bWF0dGVyID8/IHt9O1xuXG4gIC8vIFx1NURGMlx1NjcwOVx1N0YxNlx1NzgwMVx1NUMzMVx1OERGM1x1OEZDN1xuICBpZiAoZm0uXHU3RjE2XHU3ODAxICYmIENPREVfUkUudGVzdChmbS5cdTdGMTZcdTc4MDEgYXMgc3RyaW5nKSkge1xuICAgIHJldHVybiBmbS5cdTdGMTZcdTc4MDEgYXMgc3RyaW5nO1xuICB9XG5cbiAgLy8gXHU2M0E4XHU1QkZDXHU2ODA3XHU3QjdFICsgXHU1RThGXHU1M0Y3XG4gIGNvbnN0IHRhZyA9IGluZmVyVGFnKGRpciwgZm0uXHU2ODA3XHU3QjdFIGFzIFRhZyB8IHVuZGVmaW5lZCk7XG4gIGNvbnN0IHNlcSA9IGF3YWl0IG5leHRTZXF1ZW5jZShhcHAsIGRpciwgdGFnKTtcblxuICAvLyBcdTc1MUZcdTYyMTBcdTdGMTZcdTc4MDFcbiAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgY29uc3QgeXkgPSBTdHJpbmcobm93LmdldEZ1bGxZZWFyKCkpLnNsaWNlKDIpO1xuICBjb25zdCBtbWRkID0gYCR7U3RyaW5nKG5vdy5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgJzAnKX0ke1N0cmluZyhub3cuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCAnMCcpfWA7XG4gIGNvbnN0IGNvZGUgPSBgJHt5eX1fJHttbWRkfV8ke3RhZ31fJHtTdHJpbmcoc2VxKS5wYWRTdGFydCgyLCAnMCcpfWA7XG5cbiAgLy8gXHU1MTk5XHU1NkRFIFlBTUxcbiAgY29uc3QgbmV3Rm0gPSB7IC4uLmZtLCBcdTY4MDdcdTdCN0U6IHRhZywgXHU3RjE2XHU3ODAxOiBjb2RlIH07XG4gIGNvbnN0IG5ld0NvbnRlbnQgPSBhc3NlbWJsZUZpbGUobmV3Rm0sIGJvZHkpO1xuICBhd2FpdCBhcHAudmF1bHQubW9kaWZ5KGZpbGUsIG5ld0NvbnRlbnQpO1xuXG4gIC8vIFx1OTFDRFx1NTQ3RFx1NTQwRFx1NjU4N1x1NEVGNlx1RkYwOFx1NTJBMFx1N0YxNlx1NzgwMVx1NTI0RFx1N0YwMFx1RkYwOVxuICBjb25zdCBleHQgPSBmaWxlLmV4dGVuc2lvbjtcbiAgY29uc3Qgb2xkTmFtZSA9IGZpbGUuYmFzZW5hbWU7XG4gIGNvbnN0IG5ld05hbWUgPSBgJHtjb2RlfSAke29sZE5hbWV9YDtcbiAgY29uc3QgbmV3UGF0aCA9IGZpbGVQYXRoLnJlcGxhY2UoL1teL10rJC8sIGAke25ld05hbWV9LiR7ZXh0fWApO1xuICBpZiAobmV3UGF0aCAhPT0gZmlsZVBhdGgpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgYXBwLnZhdWx0LnJlbmFtZShmaWxlLCBuZXdQYXRoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUud2FybignW3N5bmMvYXV0b1JlbmFtZV0gcmVuYW1lIGZhaWxlZDonLCBlcnIpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb2RlO1xufVxuXG4vKipcbiAqIFx1NjI3OVx1OTFDRlx1NTIwNlx1OTE0RFx1N0YxNlx1NzgwMVx1RkYwOHJpYmJvbiBcdTg5RTZcdTUzRDFcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJhdGNoQXNzaWduRW5jb2RpbmcoYXBwOiBBcHAsIGRpcjogc3RyaW5nKTogUHJvbWlzZTx7IHRvdGFsOiBudW1iZXI7IGFzc2lnbmVkOiBudW1iZXIgfT4ge1xuICBjb25zdCBmb2xkZXIgPSBhcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGRpcik7XG4gIGlmICghKGZvbGRlciBpbnN0YW5jZW9mIFRGb2xkZXIpKSByZXR1cm4geyB0b3RhbDogMCwgYXNzaWduZWQ6IDAgfTtcblxuICBsZXQgYXNzaWduZWQgPSAwO1xuICBsZXQgdG90YWwgPSAwO1xuICBmb3IgKGNvbnN0IGNoaWxkIG9mIGZvbGRlci5jaGlsZHJlbikge1xuICAgIGlmICghKGNoaWxkIGluc3RhbmNlb2YgVEZpbGUpIHx8ICFjaGlsZC5uYW1lLmVuZHNXaXRoKCcubWQnKSkgY29udGludWU7XG4gICAgdG90YWwrKztcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXNzaWduRW5jb2RpbmcoYXBwLCBjaGlsZC5wYXRoLCBkaXIpO1xuICAgICAgaWYgKHJlc3VsdCkgYXNzaWduZWQrKztcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUud2FybihgW3N5bmMvYXV0b1JlbmFtZV0gYmF0Y2ggZmFpbGVkIGZvciAke2NoaWxkLnBhdGh9OmAsIGVycik7XG4gICAgfVxuICB9XG4gIHJldHVybiB7IHRvdGFsLCBhc3NpZ25lZCB9O1xufVxuXG4vKipcbiAqIFx1ODlFM1x1NzgwMVx1RkYxQVx1NEVDRVx1NjU4N1x1NEVGNlx1NTQwRFx1NjIxNiBZQU1MIFx1NjNEMFx1NTNENlx1N0YxNlx1NzgwMVx1NEZFMVx1NjA2Rlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlQ29kZShjb2RlOiBzdHJpbmcpOiB7XG4gIHl5OiBzdHJpbmc7XG4gIG1tZGQ6IHN0cmluZztcbiAgdGFnOiBUYWc7XG4gIHNlcTogbnVtYmVyO1xuICBzdWI/OiBzdHJpbmc7XG59IHwgbnVsbCB7XG4gIGNvbnN0IG1hdGNoID0gY29kZS5tYXRjaChDT0RFX1JFKTtcbiAgaWYgKCFtYXRjaCkgcmV0dXJuIG51bGw7XG4gIHJldHVybiB7XG4gICAgeXk6IG1hdGNoWzFdLFxuICAgIG1tZGQ6IG1hdGNoWzJdLFxuICAgIHRhZzogbWF0Y2hbM10gYXMgVGFnLFxuICAgIHNlcTogcGFyc2VJbnQobWF0Y2hbNF0sIDEwKSxcbiAgICBzdWI6IG1hdGNoWzVdLFxuICB9O1xufVxuIiwgIi8qKlxuICogUE9TVCAvY2xpcCBcdTIwMTQgXHU0RUZCXHU2MTBGXHU3RjUxXHU5ODc1L1x1NTIxMlx1OEJDRFx1NTI2QVx1NUI1OFx1NTIzMCBPYnNpZGlhblx1MzAwMlxuICpcbiAqIE1WUCBcdTUxQjNcdTdCNTZcdUZGMUFcbiAqIC0gXHU0RTBEXHU3RUQxXHU1QjlBIGZlaXNodV9pZFx1RkYwQ1x1OTA3Rlx1NTE0RFx1NjI4QVx1NjY2RVx1OTAxQVx1N0Y1MVx1OTg3NVx1NEYyQVx1ODhDNVx1NjIxMFx1OThERVx1NEU2Nlx1NTQwQ1x1NkI2NVx1NjU4N1x1NEVGNlx1MzAwMlxuICogLSBcdTUxOTlcdTUxNjVcdTYzRDJcdTRFRjZcdTlFRDhcdThCQTRcdTc2RUVcdTVGNTVcdTYyMTZcdThCRjdcdTZDNDJcdTRGMjBcdTUxNjVcdTc2RUVcdTVGNTVcdTMwMDJcbiAqIC0gXHU0RjdGXHU3NTI4XHU3N0U1XHU4QkM2XHU1RTkzXHU1QjU3XHU2QkI1XHU5ODg0XHU4QkJFXHU1ODZCXHU1MTQ1XHU1N0ZBXHU3ODQwIFlBTUxcdUZGMENcdTdGMTZcdTc4MDFcdTRFQ0RcdTRFQTRcdTdFRDkgYXV0by1yZW5hbWVcdTMwMDJcbiAqL1xuaW1wb3J0IHsgYXNzZW1ibGVGaWxlLCB0eXBlIENsaXBSZXF1ZXN0LCB0eXBlIENsaXBSZXNwb25zZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQgeyBBcHAsIFRGaWxlLCBURm9sZGVyIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBSZXF1ZXN0Q29udGV4dCB9IGZyb20gJy4uL3NlcnZlci5qcyc7XG5pbXBvcnQgdHlwZSB7IEZlaXNodVN5bmNTZXR0aW5ncyB9IGZyb20gJy4uL3NldHRpbmdzLmpzJztcbmltcG9ydCB7IG1ha2VGaWxlbmFtZSwgbWFrZVBhdGggfSBmcm9tICcuLi9maWxlaW8vd3JpdGVyLmpzJztcbmltcG9ydCB7IGFzc2lnbkVuY29kaW5nIH0gZnJvbSAnLi4vYXV0b1JlbmFtZS5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2xpcERlcHMge1xuICBhcHA6IEFwcDtcbiAgc2V0dGluZ3M6IEZlaXNodVN5bmNTZXR0aW5ncztcbiAgbm90aWNlOiAobXNnOiBzdHJpbmcpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDbGlwSGFuZGxlcihkZXBzOiBDbGlwRGVwcykge1xuICByZXR1cm4gYXN5bmMgKGN0eDogUmVxdWVzdENvbnRleHQpOiBQcm9taXNlPENsaXBSZXNwb25zZT4gPT4ge1xuICAgIGNvbnN0IHJlcSA9IChjdHguYm9keSA/PyB7fSkgYXMgQ2xpcFJlcXVlc3Q7XG4gICAgY29uc3QgdGl0bGUgPSBjbGVhblRleHQocmVxLnRpdGxlKSB8fCAnXHU3RjUxXHU5ODc1XHU1MjZBXHU4NUNGJztcbiAgICBjb25zdCB1cmwgPSBjbGVhblRleHQocmVxLnVybCk7XG4gICAgY29uc3QgdGV4dCA9IGNsZWFuVGV4dChyZXEudGV4dCk7XG4gICAgY29uc3QgcmF3VGV4dCA9IGNsZWFuVGV4dChyZXEucmF3VGV4dCkgfHwgdGV4dDtcbiAgICBjb25zdCBib2R5TWFya2Rvd24gPSBjbGVhblRleHQocmVxLmJvZHlNYXJrZG93bik7XG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSBjbGVhblRleHQocmVxLmRlc2NyaXB0aW9uKTtcbiAgICBjb25zdCBzb3VyY2VLaW5kID0gY2xlYW5UZXh0KHJlcS5zb3VyY2VLaW5kKSB8fCAnZ2VuZXJpYy1wYWdlJztcbiAgICBjb25zdCBhcHBlbmRQYXRoID0gY2xlYW5QYXRoKHJlcS5hcHBlbmRQYXRoKTtcbiAgICBpZiAoIXVybCAmJiAhdGV4dCAmJiAhYm9keU1hcmtkb3duICYmICFyYXdUZXh0KSB7XG4gICAgICBjb25zdCBlID0gbmV3IEVycm9yKCd1cmwgb3IgdGV4dCBpcyByZXF1aXJlZCcpIGFzIEVycm9yICYgeyBjb2RlOiBzdHJpbmc7IHN0YXR1czogbnVtYmVyIH07XG4gICAgICBlLmNvZGUgPSAnTUlTU0lOR19DTElQX0NPTlRFTlQnO1xuICAgICAgZS5zdGF0dXMgPSA0MDA7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIGNvbnN0IGNyZWF0ZWRBdCA9IG5ldyBEYXRlKCk7XG4gICAgY29uc3QgdGFyZ2V0RGlyID0gY2xlYW5EaXIocmVxLmRpcikgfHwgZGVwcy5zZXR0aW5ncy5kZWZhdWx0RGlyO1xuICAgIGNvbnN0IG1ldGEgPSBub3JtYWxpemVDbGlwTWV0YShyZXEubWV0YSwge1xuICAgICAgdGl0bGUsXG4gICAgICB1cmwsXG4gICAgICB0ZXh0OiByYXdUZXh0IHx8IGJvZHlNYXJrZG93biB8fCB0ZXh0LFxuICAgICAgZGVzY3JpcHRpb24sXG4gICAgICBkaXI6IHRhcmdldERpcixcbiAgICAgIGRhdGU6IGZvcm1hdERhdGUoY3JlYXRlZEF0KSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGNvbnRlbnRJbnB1dCA9IHtcbiAgICAgIHRpdGxlLFxuICAgICAgdXJsLFxuICAgICAgdGV4dCxcbiAgICAgIHJhd1RleHQsXG4gICAgICBib2R5TWFya2Rvd24sXG4gICAgICBkZXNjcmlwdGlvbixcbiAgICAgIGRpcjogdGFyZ2V0RGlyLFxuICAgICAgbWV0YSxcbiAgICAgIHNvdXJjZUtpbmQsXG4gICAgICBkYXRlOiBmb3JtYXREYXRlKGNyZWF0ZWRBdCksXG4gICAgICBjcmVhdGVkQXQ6IGNyZWF0ZWRBdC50b0lTT1N0cmluZygpLFxuICAgIH07XG5cbiAgICBpZiAoYXBwZW5kUGF0aCkge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZGVwcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGFwcGVuZFBhdGgpO1xuICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgVEZpbGUpKSB7XG4gICAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoYFx1ODg2NVx1NTE0NVx1NzZFRVx1NjgwN1x1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYxQSR7YXBwZW5kUGF0aH1gKSBhcyBFcnJvciAmIHsgY29kZTogc3RyaW5nOyBzdGF0dXM6IG51bWJlciB9O1xuICAgICAgICBlLmNvZGUgPSAnQVBQRU5EX1RBUkdFVF9OT1RfRk9VTkQnO1xuICAgICAgICBlLnN0YXR1cyA9IDQwNDtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGN1cnJlbnQgPSBhd2FpdCBkZXBzLmFwcC52YXVsdC5yZWFkKHRhcmdldCk7XG4gICAgICBjb25zdCBhcHBlbmRpeCA9IGJ1aWxkQXBwZW5kTWFya2Rvd24oY29udGVudElucHV0KTtcbiAgICAgIGF3YWl0IGRlcHMuYXBwLnZhdWx0Lm1vZGlmeSh0YXJnZXQsIGAke2N1cnJlbnQucmVwbGFjZSgvXFxzKiQvLCAnJyl9XFxuXFxuJHthcHBlbmRpeH1cXG5gKTtcbiAgICAgIGRlcHMubm90aWNlKGBcdUQ4M0RcdURDREQgXHU1REYyXHU4ODY1XHU1MTQ1XHU1MjMwICR7YXBwZW5kUGF0aH1gKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9rOiB0cnVlLFxuICAgICAgICBwYXRoOiB0YXJnZXQucGF0aCxcbiAgICAgICAgZmlsZW5hbWU6IHRhcmdldC5uYW1lLFxuICAgICAgICBhY3Rpb246ICd1cGRhdGVkJyxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgYXdhaXQgZW5zdXJlRm9sZGVyKGRlcHMuYXBwLCB0YXJnZXREaXIpO1xuXG4gICAgY29uc3QgZmlsZW5hbWUgPSBtYWtlRmlsZW5hbWUodGl0bGUpO1xuICAgIGxldCBmaW5hbFBhdGggPSBtYWtlUGF0aCh0YXJnZXREaXIsIGZpbGVuYW1lKTtcbiAgICBjb25zdCBleGlzdGluZyA9IGRlcHMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChmaW5hbFBhdGgpO1xuICAgIGlmIChleGlzdGluZyBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICBmaW5hbFBhdGggPSBtYWtlUGF0aCh0YXJnZXREaXIsIGAke2ZpbGVuYW1lLnJlcGxhY2UoL1xcLm1kJC8sICcnKX0tJHtEYXRlLm5vdygpLnRvU3RyaW5nKDM2KX0ubWRgKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50ID0gYnVpbGRDbGlwTWFya2Rvd24oY29udGVudElucHV0KTtcblxuICAgIGF3YWl0IGRlcHMuYXBwLnZhdWx0LmNyZWF0ZShmaW5hbFBhdGgsIGNvbnRlbnQpO1xuICAgIGRlcHMubm90aWNlKGBcdUQ4M0RcdURDQ0UgXHU1REYyXHU1MjZBXHU1QjU4ICR7dGl0bGV9YCk7XG5cbiAgICBpZiAoZGVwcy5zZXR0aW5ncy5hdXRvUmVuYW1lKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBhc3NpZ25FbmNvZGluZyhkZXBzLmFwcCwgZmluYWxQYXRoLCB0YXJnZXREaXIpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignW3N5bmMvY2xpcF0gYXV0by1yZW5hbWUgZmFpbGVkOicsIGVycik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG9rOiB0cnVlLFxuICAgICAgcGF0aDogZmluYWxQYXRoLFxuICAgICAgZmlsZW5hbWU6IGZpbmFsUGF0aC5zcGxpdCgnLycpLnBvcCgpID8/IGZpbGVuYW1lLFxuICAgICAgYWN0aW9uOiAnY3JlYXRlZCcsXG4gICAgfTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRDbGlwTWFya2Rvd24oaW5wdXQ6IHtcbiAgdGl0bGU6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG4gIHRleHQ6IHN0cmluZztcbiAgcmF3VGV4dDogc3RyaW5nO1xuICBib2R5TWFya2Rvd246IHN0cmluZztcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgZGlyOiBzdHJpbmc7XG4gIG1ldGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBzb3VyY2VLaW5kOiBzdHJpbmc7XG4gIGRhdGU6IHN0cmluZztcbiAgY3JlYXRlZEF0OiBzdHJpbmc7XG59KTogc3RyaW5nIHtcbiAgY29uc3QgYm9keUNvbnRlbnQgPSBub3JtYWxpemVNYXJrZG93bkJvZHkoaW5wdXQuYm9keU1hcmtkb3duIHx8IGlucHV0LnJhd1RleHQgfHwgaW5wdXQudGV4dCB8fCBpbnB1dC5kZXNjcmlwdGlvbik7XG4gIGNvbnN0IGJvZHkgPSBbXG4gICAgYCMgJHtpbnB1dC50aXRsZX1gLFxuICAgICcnLFxuICAgIGlucHV0LnVybCA/IGA+IFx1Njc2NVx1NkU5MFx1RkYxQSR7aW5wdXQudXJsfWAgOiAnJyxcbiAgICBgPiBcdTdDN0JcdTU3OEJcdUZGMUEke2lucHV0LnNvdXJjZUtpbmR9YCxcbiAgICBgPiBcdTUyNkFcdTVCNThcdTY1RjZcdTk1RjRcdUZGMUEke2lucHV0LmNyZWF0ZWRBdH1gLFxuICAgICcnLFxuICAgIGJvZHlDb250ZW50LFxuICAgICcnLFxuICBdLmZpbHRlcigobGluZSwgaW5kZXgsIGFycikgPT4gbGluZSB8fCBhcnJbaW5kZXggLSAxXSAhPT0gJycpLmpvaW4oJ1xcbicpO1xuXG4gIHJldHVybiBhc3NlbWJsZUZpbGUoaW5wdXQubWV0YSwgYm9keSk7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQXBwZW5kTWFya2Rvd24oaW5wdXQ6IHtcbiAgdGl0bGU6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG4gIHRleHQ6IHN0cmluZztcbiAgcmF3VGV4dDogc3RyaW5nO1xuICBib2R5TWFya2Rvd246IHN0cmluZztcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgc291cmNlS2luZDogc3RyaW5nO1xuICBjcmVhdGVkQXQ6IHN0cmluZztcbn0pOiBzdHJpbmcge1xuICBjb25zdCBib2R5Q29udGVudCA9IG5vcm1hbGl6ZU1hcmtkb3duQm9keShpbnB1dC5ib2R5TWFya2Rvd24gfHwgaW5wdXQucmF3VGV4dCB8fCBpbnB1dC50ZXh0IHx8IGlucHV0LmRlc2NyaXB0aW9uKTtcbiAgcmV0dXJuIFtcbiAgICBgIyMgJHtpbnB1dC50aXRsZX1gLFxuICAgICcnLFxuICAgIGlucHV0LnVybCA/IGA+IFx1Njc2NVx1NkU5MFx1RkYxQSR7aW5wdXQudXJsfWAgOiAnJyxcbiAgICBgPiBcdTdDN0JcdTU3OEJcdUZGMUEke2lucHV0LnNvdXJjZUtpbmR9YCxcbiAgICBgPiBcdTg4NjVcdTUxNDVcdTY1RjZcdTk1RjRcdUZGMUEke2lucHV0LmNyZWF0ZWRBdH1gLFxuICAgICcnLFxuICAgIGJvZHlDb250ZW50LFxuICBdLmZpbHRlcigobGluZSwgaW5kZXgsIGFycikgPT4gbGluZSB8fCBhcnJbaW5kZXggLSAxXSAhPT0gJycpLmpvaW4oJ1xcbicpO1xufVxuXG5mdW5jdGlvbiBjbGVhblRleHQodmFsdWU6IHVua25vd24pOiBzdHJpbmcge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlLnRyaW0oKSA6ICcnO1xufVxuXG5mdW5jdGlvbiBjbGVhbkRpcih2YWx1ZTogdW5rbm93bik6IHN0cmluZyB7XG4gIHJldHVybiBjbGVhblRleHQodmFsdWUpLnJlcGxhY2UoL15cXC8rfFxcLyskL2csICcnKTtcbn1cblxuZnVuY3Rpb24gY2xlYW5QYXRoKHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHtcbiAgY29uc3QgcmF3ID0gY2xlYW5EaXIodmFsdWUpO1xuICBpZiAoIXJhdykgcmV0dXJuICcnO1xuICByZXR1cm4gcmF3LmVuZHNXaXRoKCcubWQnKSA/IHJhdyA6IGAke3Jhd30ubWRgO1xufVxuXG5mdW5jdGlvbiBmb3JtYXREYXRlKGRhdGU6IERhdGUpOiBzdHJpbmcge1xuICByZXR1cm4gZGF0ZS50b0lTT1N0cmluZygpLnNsaWNlKDAsIDEwKTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlWWFtbCh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJykucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpLnJlcGxhY2UoL1xcbisvZywgJyAnKS50cmltKCk7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUNsaXBNZXRhKG1ldGE6IHVua25vd24sIGZhbGxiYWNrOiB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIGRpcjogc3RyaW5nO1xuICBkYXRlOiBzdHJpbmc7XG59KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICBjb25zdCBpbnB1dCA9IG1ldGEgJiYgdHlwZW9mIG1ldGEgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KG1ldGEpID8gbWV0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA6IHt9O1xuICBjb25zdCBzY29yZSA9IG5vcm1hbGl6ZVNjb3JlKGlucHV0Llx1OEJDNFx1NTIwNik7XG4gIGNvbnN0IG91dDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7XG4gICAgXHU2ODA3XHU3QjdFOiBub3JtYWxpemVUYWcoaW5wdXQuXHU2ODA3XHU3QjdFKSxcbiAgICBcdTdGMTZcdTc4MDE6ICcnLFxuICAgIFx1OEY5M1x1NTE2NTogY2xlYW5UZXh0KGlucHV0Llx1OEY5M1x1NTE2NSkgfHwgZmFsbGJhY2suZGlyIHx8IGZhbGxiYWNrLnVybCxcbiAgICBcdTY1RTVcdTY3MUY6IG5vcm1hbGl6ZURhdGUoaW5wdXQuXHU2NUU1XHU2NzFGLCBmYWxsYmFjay5kYXRlKSxcbiAgICBcdTY1RTVcdTY3MUZcdTdEMjJcdTVGMTU6IG5vcm1hbGl6ZUxpc3QoaW5wdXQuXHU2NUU1XHU2NzFGXHU3RDIyXHU1RjE1KSxcbiAgICBcdTUxNzNcdTk1MkVcdThCQ0Q6IGNsZWFuVGV4dChpbnB1dC5cdTUxNzNcdTk1MkVcdThCQ0QpIHx8IGRyYWZ0S2V5d29yZHMoYCR7ZmFsbGJhY2sudGl0bGV9ICR7ZmFsbGJhY2suZGVzY3JpcHRpb259ICR7ZmFsbGJhY2sudGV4dH1gKSxcbiAgICBcdTY5ODJcdThGRjA6IGNsZWFuVGV4dChpbnB1dC5cdTY5ODJcdThGRjApIHx8IGZhbGxiYWNrLmRlc2NyaXB0aW9uIHx8IGBcdTRFQ0VcdTdGNTFcdTk4NzVcdTUyNkFcdTVCNThcdTVFNzZcdThGNkNcdTYzNjJcdUZGMUEke2ZhbGxiYWNrLnRpdGxlfWAsXG4gICAgXHU4QkM0XHU1MjA2OiBzY29yZSxcbiAgICBcdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBOiBjbGVhblRleHQoaW5wdXQuXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQSkgfHwgc2NvcmVMYWJlbChzY29yZSksXG4gICAgXHU3RDIyXHU1RjE1X1x1NzdFNVx1OEJDNlx1NUU5MzogY2xlYW5UZXh0KGlucHV0Llx1N0QyMlx1NUYxNV9cdTc3RTVcdThCQzZcdTVFOTMpLFxuICAgIFx1N0QyMlx1NUYxNV9cdTk4OUNcdTgyNzI6IGNsZWFuVGV4dChpbnB1dC5cdTdEMjJcdTVGMTVfXHU5ODlDXHU4MjcyKSxcbiAgICAnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnOiBub3JtYWxpemVMaXN0KGlucHV0WydcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OCddKSxcbiAgICBcdTdEMjJcdTVGMTVfXHU1NzU3OiBub3JtYWxpemVMaXN0KGlucHV0Llx1N0QyMlx1NUYxNV9cdTU3NTcpLFxuICAgIFx1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2Njk6IG5vcm1hbGl6ZUxpc3QoaW5wdXQuXHU3RDIyXHU1RjE1X1x1OThDRVx1OTY2OSksXG4gIH07XG4gIGlmICghb3V0Llx1NTE3M1x1OTUyRVx1OEJDRCkgb3V0Llx1NTE3M1x1OTUyRVx1OEJDRCA9ICdcdTdGNTFcdTk4NzVcdTUyNkFcdTVCNTgnO1xuICBpZiAoIW91dC5cdTY5ODJcdThGRjApIG91dC5cdTY5ODJcdThGRjAgPSBgXHU3RjUxXHU5ODc1XHU1MjZBXHU1QjU4XHVGRjFBJHtmYWxsYmFjay50aXRsZX1gO1xuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVUYWcodmFsdWU6IHVua25vd24pOiBzdHJpbmcge1xuICBjb25zdCByYXcgPSBjbGVhblRleHQodmFsdWUpO1xuICByZXR1cm4gcmF3Lm1hdGNoKC9eW1NYTFpRSl0kLykgPyByYXcgOiByYXcubWF0Y2goLyhbU1hMWlFKXSkoPzpffCQpLyk/LlsxXSB8fCAnUyc7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZURhdGUodmFsdWU6IHVua25vd24sIGZhbGxiYWNrOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCByYXcgPSBjbGVhblRleHQodmFsdWUpLnJlcGxhY2UoL1xcLy9nLCAnLScpO1xuICByZXR1cm4gL15cXGR7NH0tXFxkezJ9LVxcZHsyfSQvLnRlc3QocmF3KSA/IHJhdyA6IGZhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVTY29yZSh2YWx1ZTogdW5rbm93bik6IG51bWJlciB7XG4gIGNvbnN0IHJhdyA9IGNsZWFuVGV4dCh2YWx1ZSk7XG4gIGNvbnN0IGV4cGxpY2l0ID0gcmF3Lm1hdGNoKC9bMS01XS8pPy5bMF07XG4gIGlmIChleHBsaWNpdCkgcmV0dXJuIE51bWJlcihleHBsaWNpdCk7XG4gIGNvbnN0IHN0YXJzID0gQXJyYXkuZnJvbShyYXcubWF0Y2hBbGwoL1x1RDgzQ1x1REYxRi9nKSkubGVuZ3RoO1xuICByZXR1cm4gc3RhcnMgPiAwID8gTWF0aC5taW4oc3RhcnMsIDUpIDogMTtcbn1cblxuZnVuY3Rpb24gc2NvcmVMYWJlbChzY29yZTogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIFsnXHVEODNDXHVERjFGXHUwMEI3XHU3RDIwXHU2NzUwJywgJ1x1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1MDBCN1x1NjU3NFx1NzQwNicsICdcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdTAwQjdcdTVCOUVcdThERjUnLCAnXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHUwMEI3XHU5MDFBXHU3NTI4JywgJ1x1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1MDBCN1x1NEY1M1x1N0NGQiddW01hdGgubWF4KDEsIE1hdGgubWluKHNjb3JlLCA1KSkgLSAxXTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplTGlzdCh2YWx1ZTogdW5rbm93bik6IHN0cmluZ1tdIHtcbiAgY29uc3Qgc291cmNlID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IGNsZWFuVGV4dCh2YWx1ZSkuc3BsaXQoL1tcXG4sXHVGRjBDXHUzMDAxXS8pO1xuICByZXR1cm4gc291cmNlLm1hcCgoaXRlbSkgPT4gY2xlYW5UZXh0KGl0ZW0pKS5maWx0ZXIoQm9vbGVhbik7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZU1hcmtkb3duQm9keSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgdGV4dCA9IHZhbHVlLnRyaW0oKTtcbiAgaWYgKCF0ZXh0KSByZXR1cm4gJ1x1RkYwOFx1NjVFMFx1NTNFRlx1ODlDMVx1NkI2M1x1NjU4N1x1RkYwQ1x1NURGMlx1NEZERFx1NUI1OFx1OTg3NVx1OTc2Mlx1NjgwN1x1OTg5OFx1NTQ4Q1x1Njc2NVx1NkU5MFx1MzAwMlx1RkYwOSc7XG4gIHJldHVybiB0ZXh0O1xufVxuXG5mdW5jdGlvbiBkcmFmdEtleXdvcmRzKHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHdvcmRzID0gQXJyYXkuZnJvbShuZXcgU2V0KFxuICAgIHRleHRcbiAgICAgIC5yZXBsYWNlKC9bXlxccHtTY3JpcHQ9SGFufVxccHtMZXR0ZXJ9XFxwe051bWJlcn1cXHNfLV0vZ3UsICcgJylcbiAgICAgIC5zcGxpdCgvXFxzKy8pXG4gICAgICAubWFwKCh3b3JkKSA9PiB3b3JkLnRyaW0oKSlcbiAgICAgIC5maWx0ZXIoKHdvcmQpID0+IHdvcmQubGVuZ3RoID49IDIgJiYgd29yZC5sZW5ndGggPD0gMjApLFxuICApKTtcbiAgcmV0dXJuIHdvcmRzLnNsaWNlKDAsIDYpLmpvaW4oJ1x1MzAwMScpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBlbnN1cmVGb2xkZXIoYXBwOiBBcHAsIGRpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmICghZGlyIHx8IGRpciA9PT0gJy4nIHx8IGRpciA9PT0gJy8nKSByZXR1cm47XG4gIGNvbnN0IGV4aXN0aW5nID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChkaXIpO1xuICBpZiAoZXhpc3RpbmcgaW5zdGFuY2VvZiBURm9sZGVyKSByZXR1cm47XG4gIGNvbnN0IHBhcmVudCA9IGRpci5zcGxpdCgnLycpLnNsaWNlKDAsIC0xKS5qb2luKCcvJyk7XG4gIGlmIChwYXJlbnQpIGF3YWl0IGVuc3VyZUZvbGRlcihhcHAsIHBhcmVudCk7XG4gIHRyeSB7XG4gICAgYXdhaXQgYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihkaXIpO1xuICB9IGNhdGNoIHtcbiAgICAvLyBcdTVERjJcdTVCNThcdTU3MjhcdTYyMTZcdTc1MzFcdTUxNzZcdTRFRDZcdTZENDFcdTdBMEJcdTUyMUFcdTUyMUJcdTVFRkFcdTY1RjZcdTVGRkRcdTc1NjVcdTMwMDJcbiAgfVxufVxuIiwgIi8qKlxuICogUE9TVCAvZXhpc3RzIFx1MjAxNCBcdTY4QzBcdTY3RTUgbm9kZV90b2tlbiBcdTY2MkZcdTU0MjZcdTVERjJcdTU0MENcdTZCNjVcdThGQzdcdTMwMDJcbiAqL1xuaW1wb3J0IHR5cGUgeyBFeGlzdHNSZXF1ZXN0LCBFeGlzdHNSZXNwb25zZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQgdHlwZSB7IEFwcCwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IFJlcXVlc3RDb250ZXh0IH0gZnJvbSAnLi4vc2VydmVyLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV4aXN0c0hhbmRsZXIoYXBwOiBBcHApIHtcbiAgcmV0dXJuIGFzeW5jIChjdHg6IFJlcXVlc3RDb250ZXh0KTogUHJvbWlzZTxFeGlzdHNSZXNwb25zZT4gPT4ge1xuICAgIGNvbnN0IHJlcSA9IGN0eC5ib2R5IGFzIEV4aXN0c1JlcXVlc3Q7XG4gICAgaWYgKCFyZXE/Lm5vZGVfdG9rZW4pIHtcbiAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoJ25vZGVfdG9rZW4gaXMgcmVxdWlyZWQnKSBhcyBFcnJvciAmIHsgY29kZTogc3RyaW5nOyBzdGF0dXM6IG51bWJlciB9O1xuICAgICAgZS5jb2RlID0gJ01JU1NJTkdfVE9LRU4nO1xuICAgICAgZS5zdGF0dXMgPSA0MDA7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBmaW5kQnlGZWlzaHVJZChhcHAsIHJlcS5ub2RlX3Rva2VuKTtcbiAgICByZXR1cm4ge1xuICAgICAgb2s6IHRydWUsXG4gICAgICBleGlzdHM6ICEhZmlsZSxcbiAgICAgIHBhdGg6IGZpbGU/LnBhdGgsXG4gICAgfTtcbiAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZmluZEJ5RmVpc2h1SWQoYXBwOiBBcHAsIGZlaXNodUlkOiBzdHJpbmcpOiBQcm9taXNlPFRGaWxlIHwgbnVsbD4ge1xuICBjb25zdCBmaWxlcyA9IGFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XG4gIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgIGlmIChmaWxlLnBhdGguc3RhcnRzV2l0aCgnLm9ic2lkaWFuJykgfHwgZmlsZS5wYXRoLnN0YXJ0c1dpdGgoJy5mZWlzaHUtc3luYycpKSBjb250aW51ZTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgaWYgKCFjb250ZW50LmluY2x1ZGVzKCdmZWlzaHVfaWQ6JykpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgZm1NYXRjaCA9IGNvbnRlbnQubWF0Y2goL14tLS1cXG4oW1xcc1xcU10qPylcXG4tLS0vKTtcbiAgICAgIGlmICghZm1NYXRjaCkgY29udGludWU7XG4gICAgICBjb25zdCBpZE1hdGNoID0gZm1NYXRjaFsxXS5tYXRjaCgvZmVpc2h1X2lkOlxccypbXCInXT8oW0EtWmEtejAtOV0rKS8pO1xuICAgICAgaWYgKGlkTWF0Y2ggJiYgaWRNYXRjaFsxXSA9PT0gZmVpc2h1SWQpIHJldHVybiBmaWxlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuIiwgIi8qKlxuICogUE9TVCAvcHVzaGJhY2sgXHUyMDE0IE9CXHUyMTkyXHU5OERFXHU0RTY2XHU1NkRFXHU1MTk5XHUzMDAyXG4gKlxuICogXHU0RjlEXHU2MzZFIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgIFx1MDBBNzYuMlx1RkYxQVxuICogMS4gXHU4QkZCIC5tZCBcdTc2ODQgWUFNTFx1RkYwQ1x1NjJGRiBmZWlzaHVfZG9jX2lkICsgc3luY19oYXNoXG4gKiAyLiBcdThCQTFcdTdCOTdcdTVGNTNcdTUyNERcdTUxODVcdTVCQjkgaGFzaFx1RkYwQ1x1NkJENFx1NUJGOSBzeW5jX2hhc2hcbiAqICAgIFx1MjUxQyBcdTRFMDBcdTgxRjQgXHUyMTkyIFx1OERGM1x1OEZDN1x1RkYwOFx1NjVFMFx1NTNEOFx1NTMxNlx1RkYwOVxuICogICAgXHUyNTE0IFx1NEUwRFx1NEUwMFx1ODFGNCBcdTIxOTIgXHU3RUU3XHU3RUVEXG4gKiAzLiBcdTg5RTNcdTY3OTBcdTZCNjNcdTY1ODcgbWQgKyBZQU1MXG4gKiA0LiBZQU1MIFx1NUI1N1x1NkJCNSBcdTIxOTIgY2FsbG91dCBYTUwgXHU3MjQ3XHU2QkI1XHVGRjA4XHU2NTg3XHU2ODYzXHU1OTM0XHVGRjA5XG4gKiA1LiBcdTU2RkVcdTcyNDcgZmVpc2h1Oi8vdG9rZW4gXHUyMTkyIFx1OThERVx1NEU2NiA8aW1nIHNyYz1cIlRPS0VOXCIvPlxuICogNi4gXHU3RUM0XHU4OEM1XHU2NzAwXHU3RUM4XHU1MTg1XHU1QkI5ID0gW2NhbGxvdXQgWE1MXSArIFtcdTZCNjNcdTY1ODcgbWRdXG4gKiA3LiBcdThDMDMgbGFyay1jbGkgZG9jcyArdXBkYXRlIG92ZXJ3cml0ZVx1RkYwOFhNTCBcdTY4M0NcdTVGMEZcdUZGMDlcbiAqIDguIFx1NjgwN1x1OTg5OFx1NTQwQ1x1NkI2NVx1RkYwOFx1NURGMlx1NTcyOCBvdmVyd3JpdGUgXHU2NUY2XHU0RkVFXHU1OTBEXHVGRjA5XG4gKiA5LiBcdTY2RjRcdTY1QjAgc3luY19oYXNoICsgc3luY190aW1lXG4gKi9cbmltcG9ydCB0eXBlIHsgUHVzaGJhY2tSZXF1ZXN0LCBQdXNoYmFja1Jlc3BvbnNlIH0gZnJvbSAnQHN5bmMvc2hhcmVkJztcbmltcG9ydCB7XG4gIG1ldGFUb0NhbGxvdXRYbWwsXG4gIGZlaXNodVByb3RvVG9YbWwsXG4gIGNvbnZlcnRPQkNhbGxvdXRzVG9GZWlzaHUsXG4gIGJvZHlIYXNoLFxuICBpc0NoYW5nZWQsXG59IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQgdHlwZSB7IEFwcCwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IFJlcXVlc3RDb250ZXh0IH0gZnJvbSAnLi4vc2VydmVyLmpzJztcbmltcG9ydCB0eXBlIHsgRmVpc2h1U3luY1NldHRpbmdzIH0gZnJvbSAnLi4vc2V0dGluZ3MuanMnO1xuaW1wb3J0IHsgb3ZlcndyaXRlRG9jWG1sLCBnZXRXaWtpTm9kZUluZm8gfSBmcm9tICcuLi9sYXJrL2NsaS5qcyc7XG5pbXBvcnQgeyBwYXJzZUZpbGUsIGFzc2VtYmxlTWQgfSBmcm9tICcuLi9maWxlaW8vd3JpdGVyLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBQdXNoYmFja0RlcHMge1xuICBhcHA6IEFwcDtcbiAgc2V0dGluZ3M6IEZlaXNodVN5bmNTZXR0aW5ncztcbiAgbm90aWNlOiAobXNnOiBzdHJpbmcpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQdXNoYmFja0hhbmRsZXIoZGVwczogUHVzaGJhY2tEZXBzKSB7XG4gIHJldHVybiBhc3luYyAoY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8UHVzaGJhY2tSZXNwb25zZT4gPT4ge1xuICAgIGNvbnN0IHJlcSA9IGN0eC5ib2R5IGFzIFB1c2hiYWNrUmVxdWVzdDtcblxuICAgIC8vIFx1NUI5QVx1NEY0RFx1NjU4N1x1NEVGNlxuICAgIGxldCBmaWxlOiBURmlsZSB8IG51bGwgPSBudWxsO1xuICAgIGlmIChyZXEucGF0aCkge1xuICAgICAgY29uc3QgZiA9IGRlcHMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChyZXEucGF0aCk7XG4gICAgICBpZiAoZiBpbnN0YW5jZW9mIFRGaWxlKSBmaWxlID0gZjtcbiAgICB9IGVsc2UgaWYgKHJlcS5ub2RlX3Rva2VuKSB7XG4gICAgICBmaWxlID0gYXdhaXQgZmluZEJ5RmVpc2h1SWQoZGVwcy5hcHAsIHJlcS5ub2RlX3Rva2VuKTtcbiAgICB9XG5cbiAgICBpZiAoIWZpbGUpIHtcbiAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoJ0ZpbGUgbm90IGZvdW5kJykgYXMgRXJyb3IgJiB7IGNvZGU6IHN0cmluZzsgc3RhdHVzOiBudW1iZXIgfTtcbiAgICAgIGUuY29kZSA9ICdOT1RfRk9VTkQnO1xuICAgICAgZS5zdGF0dXMgPSA0MDQ7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBkZXBzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlRmlsZShjb250ZW50KTtcblxuICAgIGNvbnN0IGZlaXNodURvY0lkID0gcGFyc2VkLmZyb250bWF0dGVyLmZlaXNodV9kb2NfaWQgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGZlaXNodUlkID0gcGFyc2VkLmZyb250bWF0dGVyLmZlaXNodV9pZCBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgZmVpc2h1VGl0bGUgPSBwYXJzZWQuZnJvbnRtYXR0ZXIuZmVpc2h1X3RpdGxlIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgIC8vIFx1ODlFM1x1Njc5MFx1NTZERVx1NTE5OVx1NzUyOFx1NzY4NCBkb2NUb2tlblx1RkYwOFx1NUZDNVx1OTg3Qlx1NjYyRiBkb2N4IG9ial90b2tlblx1RkYwQ25vZGVfdG9rZW4gXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU3NTI4XHU0RThFIGRvY3MgK3VwZGF0ZVx1RkYwOVxuICAgIGxldCBkb2NUb2tlbiA9IGZlaXNodURvY0lkO1xuICAgIGlmICghZG9jVG9rZW4gJiYgZmVpc2h1SWQpIHtcbiAgICAgIC8vIGZlaXNodV9kb2NfaWQgXHU3RjNBXHU1OTMxXHVGRjFBXHU3NTI4IHdpa2kgK25vZGUtZ2V0IFx1NjI4QSBub2RlX3Rva2VuIFx1ODlFM1x1Njc5MFx1NjIxMCBvYmpfdG9rZW5cbiAgICAgIGRlcHMubm90aWNlKCdcdUQ4M0RcdUREMTcgXHU4OUUzXHU2NzkwXHU2NTg3XHU2ODYzIHRva2VuLi4uJyk7XG4gICAgICBjb25zdCBpbmZvID0gZ2V0V2lraU5vZGVJbmZvKGZlaXNodUlkLCBkZXBzLnNldHRpbmdzLnNwYWNlSWQpO1xuICAgICAgZG9jVG9rZW4gPSBpbmZvPy5vYmpfdG9rZW47XG4gICAgICBpZiAoIWRvY1Rva2VuKSB7XG4gICAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoYFx1NjVFMFx1NkNENVx1ODlFM1x1Njc5MCBvYmpfdG9rZW5cdUZGMDhub2RlX3Rva2VuPSR7ZmVpc2h1SWQuc2xpY2UoMCwgOCl9Li4uXHVGRjBDXHU2OEMwXHU2N0U1IHNwYWNlX2lkIFx1OEJCRVx1N0Y2RVx1RkYwOWApIGFzIEVycm9yICYgeyBjb2RlOiBzdHJpbmc7IHN0YXR1czogbnVtYmVyIH07XG4gICAgICAgIGUuY29kZSA9ICdUT0tFTl9SRVNPTFZFX0ZBSUxFRCc7XG4gICAgICAgIGUuc3RhdHVzID0gNDAwO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgICAgLy8gXHU1NkRFXHU1MTk5IGZlaXNodV9kb2NfaWQgXHU4RkRCIGZyb250bWF0dGVyXHVGRjA4XHU0RTBCXHU2QjIxXHU0RTBEXHU3NTI4XHU1MThEXHU4OUUzXHU2NzkwXHVGRjA5XG4gICAgICBwYXJzZWQuZnJvbnRtYXR0ZXIuZmVpc2h1X2RvY19pZCA9IGRvY1Rva2VuO1xuICAgIH1cbiAgICBpZiAoIWRvY1Rva2VuKSB7XG4gICAgICBjb25zdCBlID0gbmV3IEVycm9yKCdObyBmZWlzaHUgYmluZGluZyBpbiBmcm9udG1hdHRlcicpIGFzIEVycm9yICYgeyBjb2RlOiBzdHJpbmc7IHN0YXR1czogbnVtYmVyIH07XG4gICAgICBlLmNvZGUgPSAnTk9fQklORElORyc7XG4gICAgICBlLnN0YXR1cyA9IDQwMDtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICAgIGNvbnN0IHRpdGxlID0gZmVpc2h1VGl0bGUgfHwgZmlsZS5iYXNlbmFtZTtcblxuICAgIC8vIFx1NkI2NVx1OUFBNCAyXHVGRjFBaGFzaCBcdTZCRDRcdTVCRjlcbiAgICBpZiAoIXJlcS5mb3JjZSAmJiAhaXNDaGFuZ2VkKHBhcnNlZC5oYXNoLCBwYXJzZWQuZnJvbnRtYXR0ZXIuc3luY19oYXNoIGFzIHN0cmluZyB8IHVuZGVmaW5lZCkpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9rOiB0cnVlLFxuICAgICAgICBhY3Rpb246ICdza2lwcGVkJyxcbiAgICAgICAgaGFzaDogcGFyc2VkLmhhc2gsXG4gICAgICAgIHRpdGxlLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBkZXBzLm5vdGljZShgXHUyQjA2IFx1NTZERVx1NTE5OVx1OThERVx1NEU2NiAke2ZpbGUubmFtZX0uLi5gKTtcblxuICAgIC8vIFx1NkI2NVx1OUFBNCAzLTZcdUZGMUFcdTdFQzRcdTg4QzVcdTY3MDBcdTdFQzggWE1MIFx1NTE4NVx1NUJCOVxuICAgIGNvbnN0IGZpbmFsQ29udGVudCA9IGJ1aWxkUHVzaGJhY2tDb250ZW50KHBhcnNlZCk7XG5cbiAgICAvLyBcdTZCNjVcdTlBQTQgNy04XHVGRjFBb3ZlcndyaXRlICsgXHU2ODA3XHU5ODk4XHU0RkVFXHU1OTBEXG4gICAgb3ZlcndyaXRlRG9jWG1sKGRvY1Rva2VuLCBmaW5hbENvbnRlbnQsIHRpdGxlKTtcblxuICAgIC8vIFx1NkI2NVx1OUFBNCA5XHVGRjFBXHU2NkY0XHU2NUIwIHN5bmNfaGFzaCArIHN5bmNfdGltZVxuICAgIGNvbnN0IHN5bmNUaW1lID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgIGNvbnN0IHVwZGF0ZWRGbSA9IHtcbiAgICAgIC4uLnBhcnNlZC5mcm9udG1hdHRlcixcbiAgICAgIHN5bmNfaGFzaDogcGFyc2VkLmhhc2gsXG4gICAgICBzeW5jX3RpbWU6IHN5bmNUaW1lLFxuICAgIH07XG4gICAgY29uc3QgbmV3Q29udGVudCA9IGFzc2VtYmxlTWQodXBkYXRlZEZtIGFzIG5ldmVyLCBwYXJzZWQuYm9keSk7XG4gICAgYXdhaXQgZGVwcy5hcHAudmF1bHQubW9kaWZ5KGZpbGUsIG5ld0NvbnRlbnQpO1xuXG4gICAgZGVwcy5ub3RpY2UoYFx1MjcwNSBcdTVERjJcdTU2REVcdTUxOTkgJHt0aXRsZX1gKTtcblxuICAgIHJldHVybiB7XG4gICAgICBvazogdHJ1ZSxcbiAgICAgIGFjdGlvbjogJ3B1c2hlZCcsXG4gICAgICBoYXNoOiBwYXJzZWQuaGFzaCxcbiAgICAgIHRpdGxlLFxuICAgIH07XG4gIH07XG59XG5cbi8qKlxuICogXHU3RUM0XHU4OEM1XHU1NkRFXHU1MTk5XHU5OERFXHU0RTY2XHU3Njg0XHU2NzAwXHU3RUM4XHU1MTg1XHU1QkI5XHVGRjA4WE1MIFx1NjgzQ1x1NUYwRlx1RkYwOVx1MzAwMlxuICogPSBbWUFNTCBjYWxsb3V0IFx1NEZFMVx1NjA2Rlx1NTc1N10gKyBbXHU2QjYzXHU2NTg3XHVGRjA4XHU1NkZFXHU3MjQ3XHU4RjZDIFhNTFx1MzAwMU9CIGNhbGxvdXQgXHU4RjZDIFhNTFx1RkYwOV1cbiAqL1xuZnVuY3Rpb24gYnVpbGRQdXNoYmFja0NvbnRlbnQocGFyc2VkOiBSZXR1cm5UeXBlPHR5cGVvZiBwYXJzZUZpbGU+KTogc3RyaW5nIHtcbiAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XG5cbiAgLy8gMS4gWUFNTCBcdTUxNDNcdTY1NzBcdTYzNkUgXHUyMTkyIGNhbGxvdXQgXHU0RkUxXHU2MDZGXHU1NzU3XG4gIGNvbnN0IGNhbGxvdXRYbWwgPSBtZXRhVG9DYWxsb3V0WG1sKHBhcnNlZC5mcm9udG1hdHRlcik7XG4gIGlmIChjYWxsb3V0WG1sKSB7XG4gICAgcGFydHMucHVzaChjYWxsb3V0WG1sKTtcbiAgfVxuXG4gIC8vIDIuIFx1NkI2M1x1NjU4N1x1NTkwNFx1NzQwNlxuICBsZXQgYm9keSA9IHBhcnNlZC5ib2R5O1xuXG4gIC8vIDJhLiBcdTU2RkVcdTcyNDcgZmVpc2h1Oi8vdG9rZW4gXHUyMTkyIDxpbWcgc3JjPVwiVE9LRU5cIi8+XG4gIGJvZHkgPSBmZWlzaHVQcm90b1RvWG1sKGJvZHkpO1xuXG4gIC8vIDJiLiBPQiBjYWxsb3V0ID4gWyF0eXBlXSBcdTIxOTIgXHU5OERFXHU0RTY2IGNhbGxvdXQgWE1MXG4gIGJvZHkgPSBjb252ZXJ0T0JDYWxsb3V0c1RvRmVpc2h1KGJvZHkpO1xuXG4gIHBhcnRzLnB1c2goYm9keS50cmltKCkpO1xuXG4gIHJldHVybiBwYXJ0cy5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuXFxuJyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZpbmRCeUZlaXNodUlkKGFwcDogQXBwLCBmZWlzaHVJZDogc3RyaW5nKTogUHJvbWlzZTxURmlsZSB8IG51bGw+IHtcbiAgY29uc3QgZmlsZXMgPSBhcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICBpZiAoZmlsZS5wYXRoLnN0YXJ0c1dpdGgoJy5vYnNpZGlhbicpIHx8IGZpbGUucGF0aC5zdGFydHNXaXRoKCcuZmVpc2h1LXN5bmMnKSkgY29udGludWU7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBhcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgIGlmICghY29udGVudC5pbmNsdWRlcygnZmVpc2h1X2lkOicpKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGZtTWF0Y2ggPSBjb250ZW50Lm1hdGNoKC9eLS0tXFxuKFtcXHNcXFNdKj8pXFxuLS0tLyk7XG4gICAgICBpZiAoIWZtTWF0Y2gpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgaWRNYXRjaCA9IGZtTWF0Y2hbMV0ubWF0Y2goL2ZlaXNodV9pZDpcXHMqW1wiJ10/KFtBLVphLXowLTldKykvKTtcbiAgICAgIGlmIChpZE1hdGNoICYmIGlkTWF0Y2hbMV0gPT09IGZlaXNodUlkKSByZXR1cm4gZmlsZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cbiIsICIvKipcbiAqIFx1NTQ3RFx1NEVFNFx1NjgwRlx1NTQ3RFx1NEVFNFx1MzAwMlx1NEY5RFx1NjM2RVx1NjVCOVx1Njg0OCBcdTAwQTcxMCArIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgXHUzMDAyXG4gKlxuICogLSBcdTU2REVcdTUxOTlcdTVGNTNcdTUyNERcdTY1ODdcdTRFRjZcdTUyMzBcdTk4REVcdTRFNjZcbiAqIC0gXHU2Mjc5XHU5MUNGXHU1NkRFXHU1MTk5XHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XG4gKiAtIFx1NTIzN1x1NjVCMFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFxuICogLSBcdTYyNzlcdTkxQ0ZcdTZFMDVcdTc0MDZcdTVERjJcdTUyMjBcdTk2NjRcbiAqIC0gXHU2NjNFXHU3OTNBL1x1NTkwRFx1NTIzNlx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1xuICogLSBcdTkxQ0RcdTY1QjBcdTUyQTBcdThGN0RcdTYzRDJcdTRFRjZcdUZGMDhcdTkxQ0RcdTU0MkYgSFRUUCBzZXJ2ZXJcdUZGMDlcbiAqL1xuaW1wb3J0IHR5cGUgeyBBcHAsIFRGaWxlIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgTm90aWNlLCBNb2RhbCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgRmVpc2h1U3luY1BsdWdpbiB9IGZyb20gJy4vbWFpbi5qcyc7XG5pbXBvcnQgeyByZWZyZXNoTWFwcGluZywgbG9hZE1hcHBpbmcgfSBmcm9tICcuL21hcHBpbmcuanMnO1xuaW1wb3J0IHsgY3JlYXRlUHVzaGJhY2tIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9wdXNoYmFja0hhbmRsZXIuanMnO1xuaW1wb3J0IHsgYmF0Y2hBc3NpZ25FbmNvZGluZyB9IGZyb20gJy4vYXV0b1JlbmFtZS5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckNvbW1hbmRzKHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbik6IHZvaWQge1xuICBjb25zdCB7IGFwcCwgc2V0dGluZ3MgfSA9IHBsdWdpbjtcblxuICAvLyBcdTU2REVcdTUxOTlcdTVGNTNcdTUyNERcdTY1ODdcdTRFRjZcdTUyMzBcdTk4REVcdTRFNjZcbiAgcGx1Z2luLmFkZENvbW1hbmQoe1xuICAgIGlkOiAncHVzaGJhY2stY3VycmVudCcsXG4gICAgbmFtZTogJ1x1NTZERVx1NTE5OVx1NUY1M1x1NTI0RFx1NjU4N1x1NEVGNlx1NTIzMFx1OThERVx1NEU2NicsXG4gICAgZWRpdG9yQ2FsbGJhY2s6IGFzeW5jIChlZGl0b3IpID0+IHtcbiAgICAgIGNvbnN0IGZpbGUgPSBhcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgICAgIGlmICghKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkgfHwgIWZpbGUucGF0aC5lbmRzV2l0aCgnLm1kJykpIHtcbiAgICAgICAgbmV3IE5vdGljZSgnXHUyNkEwXHVGRTBGIFx1OEJGN1x1NTcyOCBtYXJrZG93biBcdTY1ODdcdTRFRjZcdTRFMkRcdTRGN0ZcdTc1MjhcdTZCNjRcdTU0N0RcdTRFRTQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBoYW5kbGVyID0gY3JlYXRlUHVzaGJhY2tIYW5kbGVyKHtcbiAgICAgICAgYXBwLFxuICAgICAgICBzZXR0aW5ncyxcbiAgICAgICAgbm90aWNlOiAobSkgPT4gbmV3IE5vdGljZShtKSxcbiAgICAgIH0pO1xuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBoYW5kbGVyKHtcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICB1cmw6ICcvcHVzaGJhY2snLFxuICAgICAgICAgIHBhdGg6ICcvcHVzaGJhY2snLFxuICAgICAgICAgIHF1ZXJ5OiBuZXcgVVJMU2VhcmNoUGFyYW1zKCksXG4gICAgICAgICAgYm9keTogeyBwYXRoOiBmaWxlLnBhdGggfSxcbiAgICAgICAgICB0b2tlbjogJycsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0LmFjdGlvbiA9PT0gJ3B1c2hlZCcpIHtcbiAgICAgICAgICBuZXcgTm90aWNlKGBcdTI3MDUgXHU1REYyXHU1NkRFXHU1MTk5XHVGRjFBJHtyZXN1bHQudGl0bGV9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3IE5vdGljZSgnXHUyM0VEIFx1NjVFMFx1NTNEOFx1NTMxNlx1RkYwQ1x1NURGMlx1OERGM1x1OEZDNycpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgbmV3IE5vdGljZShgXHUyNzRDIFx1NTZERVx1NTE5OVx1NTkzMVx1OEQyNVx1RkYxQSR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpfWApO1xuICAgICAgfVxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFx1NjI3OVx1OTFDRlx1NTZERVx1NTE5OVx1NUY1M1x1NTI0RFx1NzZFRVx1NUY1NVxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6ICdwdXNoYmFjay1kaXInLFxuICAgIG5hbWU6ICdcdTYyNzlcdTkxQ0ZcdTU2REVcdTUxOTlcdTVGNTNcdTUyNERcdTc2RUVcdTVGNTVcdTUyMzBcdTk4REVcdTRFNjYnLFxuICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlID0gYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gICAgICBpZiAoIWZpbGUpIHtcbiAgICAgICAgbmV3IE5vdGljZSgnXHUyNkEwXHVGRTBGIFx1OEJGN1x1NTE0OFx1NjI1M1x1NUYwMFx1NEUwMFx1NEUyQVx1NjU4N1x1NEVGNlx1NEVFNVx1Nzg2RVx1NUI5QVx1NzZFRVx1NUY1NScpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBkaXIgPSBmaWxlLnBhcmVudD8ucGF0aDtcbiAgICAgIGlmICghZGlyKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IGZpbGVzID0gYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKS5maWx0ZXIoZiA9PiBmLnBhdGguc3RhcnRzV2l0aChkaXIgKyAnLycpKTtcbiAgICAgIGxldCBwdXNoZWQgPSAwO1xuICAgICAgbGV0IHNraXBwZWQgPSAwO1xuICAgICAgbGV0IGZhaWxlZCA9IDA7XG5cbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBjcmVhdGVQdXNoYmFja0hhbmRsZXIoe1xuICAgICAgICBhcHAsXG4gICAgICAgIHNldHRpbmdzLFxuICAgICAgICBub3RpY2U6ICgpID0+IHt9LFxuICAgICAgfSk7XG5cbiAgICAgIGZvciAoY29uc3QgZiBvZiBmaWxlcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGhhbmRsZXIoe1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6ICcvcHVzaGJhY2snLFxuICAgICAgICAgICAgcGF0aDogJy9wdXNoYmFjaycsXG4gICAgICAgICAgICBxdWVyeTogbmV3IFVSTFNlYXJjaFBhcmFtcygpLFxuICAgICAgICAgICAgYm9keTogeyBwYXRoOiBmLnBhdGggfSxcbiAgICAgICAgICAgIHRva2VuOiAnJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAocmVzdWx0LmFjdGlvbiA9PT0gJ3B1c2hlZCcpIHB1c2hlZCsrO1xuICAgICAgICAgIGVsc2Ugc2tpcHBlZCsrO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICBmYWlsZWQrKztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBuZXcgTm90aWNlKGBcdTJCMDYgXHU2Mjc5XHU5MUNGXHU1NkRFXHU1MTk5XHU1QjhDXHU2MjEwXHVGRjFBXHU2M0E4XHU5MDAxICR7cHVzaGVkfVx1RkYwQ1x1OERGM1x1OEZDNyAke3NraXBwZWR9XHVGRjBDXHU1OTMxXHU4RDI1ICR7ZmFpbGVkfWApO1xuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFx1NjI3OVx1OTFDRlx1NTIwNlx1OTE0RFx1N0YxNlx1NzgwMVx1RkYwOFx1NUY1M1x1NTI0RFx1NzZFRVx1NUY1NVx1RkYwOVxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6ICdhc3NpZ24tZW5jb2RpbmctZGlyJyxcbiAgICBuYW1lOiAnXHU2Mjc5XHU5MUNGXHU1MjA2XHU5MTREXHU3RjE2XHU3ODAxXHVGRjA4XHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XHVGRjA5JyxcbiAgICBjYWxsYmFjazogYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZSA9IGFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuICAgICAgaWYgKCFmaWxlKSB7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1MjZBMFx1RkUwRiBcdThCRjdcdTUxNDhcdTYyNTNcdTVGMDBcdTRFMDBcdTRFMkFcdTY1ODdcdTRFRjZcdTRFRTVcdTc4NkVcdTVCOUFcdTc2RUVcdTVGNTUnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgZGlyID0gZmlsZS5wYXJlbnQ/LnBhdGg7XG4gICAgICBpZiAoIWRpcikgcmV0dXJuO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBiYXRjaEFzc2lnbkVuY29kaW5nKGFwcCwgZGlyKTtcbiAgICAgIG5ldyBOb3RpY2UoYFx1RDgzRFx1REQyMiBcdTdGMTZcdTc4MDFcdTUyMDZcdTkxNERcdUZGMUEke3Jlc3VsdC5hc3NpZ25lZH0vJHtyZXN1bHQudG90YWx9YCk7XG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gXHU1MjM3XHU2NUIwXHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0XG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogJ3JlZnJlc2gtbWFwcGluZycsXG4gICAgbmFtZTogJ1x1NTIzN1x1NjVCMFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1RkYwOE9CXHUyMTkyXHU5OERFXHU0RTY2XHVGRjA5JyxcbiAgICBjYWxsYmFjazogYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgcmVmcmVzaE1hcHBpbmcoYXBwLCBzZXR0aW5ncy5zcGFjZUlkKTtcbiAgICB9LFxuICB9KTtcblxuICAvLyBcdTY2M0VcdTc5M0FcdTU0MkZcdTUyQThcdTRFRTRcdTcyNENcbiAgcGx1Z2luLmFkZENvbW1hbmQoe1xuICAgIGlkOiAnc2hvdy10b2tlbicsXG4gICAgbmFtZTogJ1x1NjYzRVx1NzkzQVx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1x1RkYwOFx1OEZERVx1NjNBNVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NjI2OVx1NUM1NVx1NzUyOFx1RkYwOScsXG4gICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgIGNvbnN0IG1vZGFsID0gbmV3IFRva2VuTW9kYWwoYXBwLCBzZXR0aW5ncy5zeW5jVG9rZW4pO1xuICAgICAgbW9kYWwub3BlbigpO1xuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFx1NjYzRVx1NzkzQVx1NjcwMFx1OEZEMVx1NTQwQ1x1NkI2NVx1OEJCMFx1NUY1NVxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6ICdzaG93LXJlY2VudCcsXG4gICAgbmFtZTogJ1x1NjYzRVx1NzkzQVx1NjcwMFx1OEZEMVx1NTQwQ1x1NkI2NVx1OEJCMFx1NUY1NScsXG4gICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgIGNvbnN0IHJlY2VudCA9IHBsdWdpbi5zdGF0ZS5yZWNlbnRTeW5jcztcbiAgICAgIGlmIChyZWNlbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1RkYwOFx1NjY4Mlx1NjVFMFx1NTQwQ1x1NkI2NVx1OEJCMFx1NUY1NVx1RkYwOScpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBsaW5lcyA9IHJlY2VudC5zbGljZSgwLCAxMCkubWFwKFxuICAgICAgICByID0+IGAke3IuYWN0aW9uID09PSAnY3JlYXRlZCcgPyAnXHUyNzk1JyA6IHIuYWN0aW9uID09PSAndXBkYXRlZCcgPyAnXHUyNzBGJyA6ICdcdTI3NEMnfSAke3IudGl0bGV9IFx1MjE5MiAke3IucGF0aH1gLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IG1vZGFsID0gbmV3IE1vZGFsKGFwcCk7XG4gICAgICBtb2RhbC50aXRsZUVsLnNldFRleHQoJ1x1NjcwMFx1OEZEMVx1NTQwQ1x1NkI2NVx1OEJCMFx1NUY1NScpO1xuICAgICAgY29uc3QgcHJlID0gbW9kYWwuY29udGVudEVsLmNyZWF0ZUVsKCdwcmUnKTtcbiAgICAgIHByZS5zZXRUZXh0KGxpbmVzLmpvaW4oJ1xcbicpKTtcbiAgICAgIG1vZGFsLm9wZW4oKTtcbiAgICB9LFxuICB9KTtcbn1cblxuLyoqIFx1NEVFNFx1NzI0Q1x1NUM1NVx1NzkzQSBNb2RhbFx1MzAwMiAqL1xuY2xhc3MgVG9rZW5Nb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgdG9rZW46IHN0cmluZykge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBvbk9wZW4oKTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG4gICAgY29udGVudEVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1x1NTQyRlx1NTJBOFx1NEVFNFx1NzI0QycgfSk7XG4gICAgY29udGVudEVsLmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDogJ1x1NTkwRFx1NTIzNlx1NkI2NFx1NEVFNFx1NzI0Q1x1RkYwQ1x1N0M5OFx1OEQzNFx1NTIzMFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NjI2OVx1NUM1NVx1NUYzOVx1N0E5N1x1NzY4NFwiVG9rZW5cIlx1OEY5M1x1NTE2NVx1Njg0Nlx1MzAwMicsXG4gICAgICBjbHM6ICdzZXR0aW5nLWl0ZW0tZGVzY3JpcHRpb24nLFxuICAgIH0pO1xuICAgIGNvbnN0IGNvZGVFbCA9IGNvbnRlbnRFbC5jcmVhdGVFbCgnY29kZScpO1xuICAgIGNvZGVFbC5zZXRUZXh0KHRoaXMudG9rZW4pO1xuICAgIGNvZGVFbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBjb2RlRWwuc3R5bGUucGFkZGluZyA9ICcxMnB4JztcbiAgICBjb2RlRWwuc3R5bGUuZm9udEZhbWlseSA9ICdtb25vc3BhY2UnO1xuICAgIGNvZGVFbC5zdHlsZS53b3JkQnJlYWsgPSAnYnJlYWstYWxsJztcbiAgICBjb2RlRWwuc3R5bGUuYmFja2dyb3VuZCA9ICd2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSknO1xuXG4gICAgY29uc3QgYnRuID0gY29udGVudEVsLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdcdTU5MERcdTUyMzYnIH0pO1xuICAgIGJ0bi5vbmNsaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGhpcy50b2tlbik7XG4gICAgICBuZXcgTm90aWNlKCdcdTI3MDUgXHU1REYyXHU1OTBEXHU1MjM2Jyk7XG4gICAgfTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IE1vZGFsLCBOb3RpY2UsIFRGaWxlLCBURm9sZGVyLCB0eXBlIEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7XG4gIE9CU0lESUFOX0xBUktfRE9DX0FDVElPTixcbiAgcGFyc2VPYnNpZGlhbkxhcmtEb2NQYXJhbXMsXG4gIHR5cGUgRmV0Y2hSZXF1ZXN0LFxufSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHR5cGUgeyBGZWlzaHVTeW5jUGx1Z2luIH0gZnJvbSAnLi9tYWluLmpzJztcbmltcG9ydCB7IGNyZWF0ZUZldGNoSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlcnMvZmV0Y2hIYW5kbGVyLmpzJztcbmltcG9ydCB7IHJlc29sdmVOb2RlVG9rZW5Gcm9tVXJsIH0gZnJvbSAnLi9sYXJrL2NsaS5qcyc7XG5cbnR5cGUgVHJpZ2dlclNvdXJjZSA9ICdwcm90b2NvbCcgfCAnY29tbWFuZCcgfCAnY2xpcHBlcic7XG5cbmludGVyZmFjZSBUcmlnZ2VySW5wdXQge1xuICBub2RlX3Rva2VuPzogc3RyaW5nO1xuICBvYmpfdG9rZW4/OiBzdHJpbmc7XG4gIHNwYWNlX2lkPzogc3RyaW5nO1xuICB0aXRsZT86IHN0cmluZztcbiAgdXJsPzogc3RyaW5nO1xuICBkaXI/OiBzdHJpbmc7XG4gIHJlcGxhY2VfcGF0aD86IHN0cmluZztcbiAgc291cmNlOiBUcmlnZ2VyU291cmNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJGZXRjaEVudHJ5cG9pbnRzKHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbik6IHZvaWQge1xuICBwbHVnaW4ucmVnaXN0ZXJPYnNpZGlhblByb3RvY29sSGFuZGxlcihPQlNJRElBTl9MQVJLX0RPQ19BQ1RJT04sIChwYXJhbXMpID0+IHtcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZU9ic2lkaWFuTGFya0RvY1BhcmFtcyhwYXJhbXMpO1xuICAgIHZvaWQgdHJpZ2dlckZldGNoKHBsdWdpbiwge1xuICAgICAgbm9kZV90b2tlbjogcGFyc2VkLm5vZGVfdG9rZW4gfHwgcGFyc2VkLnRva2VuLFxuICAgICAgb2JqX3Rva2VuOiBwYXJzZWQub2JqX3Rva2VuLFxuICAgICAgc3BhY2VfaWQ6IHBhcnNlZC5zcGFjZV9pZCxcbiAgICAgIHRpdGxlOiBwYXJzZWQudGl0bGUsXG4gICAgICB1cmw6IHBhcnNlZC51cmwsXG4gICAgICBkaXI6IHBhcnNlZC5kaXIsXG4gICAgICBzb3VyY2U6ICdwcm90b2NvbCcsXG4gICAgfSk7XG4gIH0pO1xuXG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogJ2ZldGNoLWZlaXNodS1kb2MnLFxuICAgIG5hbWU6ICdcdTYyQzlcdTUzRDZcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjMnLFxuICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICBuZXcgRmVpc2h1SW5wdXRNb2RhbChwbHVnaW4uYXBwLCBhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VVc2VySW5wdXQodmFsdWUpO1xuICAgICAgICBhd2FpdCB0cmlnZ2VyRmV0Y2gocGx1Z2luLCB7XG4gICAgICAgICAgLi4ucGFyc2VkLFxuICAgICAgICAgIHNvdXJjZTogJ2NvbW1hbmQnLFxuICAgICAgICB9KTtcbiAgICAgIH0pLm9wZW4oKTtcbiAgICB9LFxuICB9KTtcblxuICBwbHVnaW4ucmVnaXN0ZXJFdmVudChcbiAgICBwbHVnaW4uYXBwLnZhdWx0Lm9uKCdjcmVhdGUnLCAoZmlsZSkgPT4ge1xuICAgICAgaWYgKCEoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB8fCBmaWxlLmV4dGVuc2lvbiAhPT0gJ21kJykgcmV0dXJuO1xuICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB2b2lkIGhhbmRsZUNsaXBwZXJQbGFjZWhvbGRlcihwbHVnaW4sIGZpbGUpO1xuICAgICAgfSwgMjUwKTtcbiAgICB9KSxcbiAgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdHJpZ2dlckZldGNoKHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbiwgaW5wdXQ6IFRyaWdnZXJJbnB1dCk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCByZXNvbHZlZCA9IG5vcm1hbGl6ZUlucHV0KHBsdWdpbiwgaW5wdXQpO1xuICBpZiAoIXJlc29sdmVkLm5vZGVfdG9rZW4pIHtcbiAgICBuZXcgTm90aWNlKCdcdTY1RTBcdTZDRDVcdThCQzZcdTUyMkJcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjMgdG9rZW4nKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCByZXE6IEZldGNoUmVxdWVzdCA9IHtcbiAgICBub2RlX3Rva2VuOiByZXNvbHZlZC5ub2RlX3Rva2VuLFxuICAgIG9ial90b2tlbjogcmVzb2x2ZWQub2JqX3Rva2VuLFxuICAgIHNwYWNlX2lkOiByZXNvbHZlZC5zcGFjZV9pZCB8fCBwbHVnaW4uc2V0dGluZ3Muc3BhY2VJZCxcbiAgICBkaXI6IHJlc29sdmVkLmRpciB8fCBwbHVnaW4uc2V0dGluZ3MuZGVmYXVsdERpcixcbiAgICBmaWxlbmFtZTogcmVzb2x2ZWQudGl0bGUsXG4gICAgcmVwbGFjZV9wYXRoOiByZXNvbHZlZC5yZXBsYWNlX3BhdGgsXG4gIH07XG5cbiAgY29uc3QgcnVuID0gYXN5bmMgKGRpcj86IHN0cmluZykgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gY3JlYXRlRmV0Y2hIYW5kbGVyKHtcbiAgICAgICAgYXBwOiBwbHVnaW4uYXBwLFxuICAgICAgICBzZXR0aW5nczogcGx1Z2luLnNldHRpbmdzLFxuICAgICAgICBzdGF0ZTogcGx1Z2luLnN0YXRlLFxuICAgICAgICBub3RpY2U6IChtZXNzYWdlKSA9PiBuZXcgTm90aWNlKG1lc3NhZ2UpLFxuICAgICAgfSk7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBoYW5kbGVyKHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHVybDogJy9mZXRjaCcsXG4gICAgICAgIHBhdGg6ICcvZmV0Y2gnLFxuICAgICAgICBxdWVyeTogbmV3IFVSTFNlYXJjaFBhcmFtcygpLFxuICAgICAgICBib2R5OiB7IC4uLnJlcSwgZGlyOiBkaXIgfHwgcmVxLmRpciB9LFxuICAgICAgICB0b2tlbjogJycsXG4gICAgICB9KTtcbiAgICAgIG5ldyBOb3RpY2UoYCR7cmVzdWx0LmFjdGlvbiA9PT0gJ2NyZWF0ZWQnID8gJ1x1NURGMlx1NTIxQlx1NUVGQScgOiAnXHU1REYyXHU2NkY0XHU2NUIwJ31cdUZGMUEke3Jlc3VsdC5wYXRofWApO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbmV3IE5vdGljZShgXHU1NDBDXHU2QjY1XHU1OTMxXHU4RDI1XHVGRjFBJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycil9YCk7XG4gICAgfVxuICB9O1xuXG4gIGlmIChpbnB1dC5zb3VyY2UgPT09ICdwcm90b2NvbCcgJiYgIWlucHV0LmRpcikge1xuICAgIG5ldyBGb2xkZXJQaWNrTW9kYWwocGx1Z2luLmFwcCwgcGx1Z2luLnNldHRpbmdzLmRlZmF1bHREaXIsIHJ1bikub3BlbigpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGF3YWl0IHJ1bihyZXEuZGlyKTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplSW5wdXQocGx1Z2luOiBGZWlzaHVTeW5jUGx1Z2luLCBpbnB1dDogVHJpZ2dlcklucHV0KTogVHJpZ2dlcklucHV0IHtcbiAgaWYgKGlucHV0LnVybCkge1xuICAgIGNvbnN0IGZyb21VcmwgPSByZXNvbHZlTm9kZVRva2VuRnJvbVVybChpbnB1dC51cmwpO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5pbnB1dCxcbiAgICAgIG5vZGVfdG9rZW46IGlucHV0Lm5vZGVfdG9rZW4gfHwgZnJvbVVybC5ub2RlX3Rva2VuIHx8IGlucHV0Lm9ial90b2tlbiB8fCBmcm9tVXJsLm9ial90b2tlbixcbiAgICAgIG9ial90b2tlbjogaW5wdXQub2JqX3Rva2VuIHx8IGZyb21Vcmwub2JqX3Rva2VuLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHtcbiAgICAuLi5pbnB1dCxcbiAgICBub2RlX3Rva2VuOiBpbnB1dC5ub2RlX3Rva2VuIHx8IGlucHV0Lm9ial90b2tlbixcbiAgICBzcGFjZV9pZDogaW5wdXQuc3BhY2VfaWQgfHwgcGx1Z2luLnNldHRpbmdzLnNwYWNlSWQsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHBhcnNlVXNlcklucHV0KHZhbHVlOiBzdHJpbmcpOiBPbWl0PFRyaWdnZXJJbnB1dCwgJ3NvdXJjZSc+IHtcbiAgY29uc3QgdHJpbW1lZCA9IHZhbHVlLnRyaW0oKTtcbiAgaWYgKC9eaHR0cHM/OlxcL1xcLy8udGVzdCh0cmltbWVkKSkge1xuICAgIGNvbnN0IHBhcnNlZCA9IHJlc29sdmVOb2RlVG9rZW5Gcm9tVXJsKHRyaW1tZWQpO1xuICAgIHJldHVybiB7XG4gICAgICBub2RlX3Rva2VuOiBwYXJzZWQubm9kZV90b2tlbiB8fCBwYXJzZWQub2JqX3Rva2VuLFxuICAgICAgb2JqX3Rva2VuOiBwYXJzZWQub2JqX3Rva2VuLFxuICAgICAgdXJsOiB0cmltbWVkLFxuICAgIH07XG4gIH1cbiAgY29uc3QgcHJvdG9jb2xQYXJhbXMgPSBwYXJzZU9ic2lkaWFuTGFya0RvY1BhcmFtcyh0cmltbWVkKTtcbiAgaWYgKHByb3RvY29sUGFyYW1zLnRva2VuIHx8IHByb3RvY29sUGFyYW1zLm5vZGVfdG9rZW4gfHwgcHJvdG9jb2xQYXJhbXMub2JqX3Rva2VuKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5vZGVfdG9rZW46IHByb3RvY29sUGFyYW1zLm5vZGVfdG9rZW4gfHwgcHJvdG9jb2xQYXJhbXMudG9rZW4gfHwgcHJvdG9jb2xQYXJhbXMub2JqX3Rva2VuLFxuICAgICAgb2JqX3Rva2VuOiBwcm90b2NvbFBhcmFtcy5vYmpfdG9rZW4sXG4gICAgICBzcGFjZV9pZDogcHJvdG9jb2xQYXJhbXMuc3BhY2VfaWQsXG4gICAgICB0aXRsZTogcHJvdG9jb2xQYXJhbXMudGl0bGUsXG4gICAgICB1cmw6IHByb3RvY29sUGFyYW1zLnVybCxcbiAgICAgIGRpcjogcHJvdG9jb2xQYXJhbXMuZGlyLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHsgbm9kZV90b2tlbjogdHJpbW1lZCB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDbGlwcGVyUGxhY2Vob2xkZXIocGx1Z2luOiBGZWlzaHVTeW5jUGx1Z2luLCBmaWxlOiBURmlsZSk6IFByb21pc2U8dm9pZD4ge1xuICBsZXQgY29udGVudCA9ICcnO1xuICB0cnkge1xuICAgIGNvbnRlbnQgPSBhd2FpdCBwbHVnaW4uYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHVybCA9IGV4dHJhY3RDbGlwcGVyVXJsKGNvbnRlbnQpO1xuICBpZiAoIXVybCkgcmV0dXJuO1xuICBjb25zdCBwYXJzZWQgPSByZXNvbHZlTm9kZVRva2VuRnJvbVVybCh1cmwpO1xuICBjb25zdCBub2RlVG9rZW4gPSBwYXJzZWQubm9kZV90b2tlbiB8fCBwYXJzZWQub2JqX3Rva2VuO1xuICBpZiAoIW5vZGVUb2tlbikgcmV0dXJuO1xuXG4gIGF3YWl0IHRyaWdnZXJGZXRjaChwbHVnaW4sIHtcbiAgICBub2RlX3Rva2VuOiBub2RlVG9rZW4sXG4gICAgb2JqX3Rva2VuOiBwYXJzZWQub2JqX3Rva2VuLFxuICAgIHVybCxcbiAgICBkaXI6IGZpbGUucGFyZW50Py5wYXRoIHx8IHBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0RGlyLFxuICAgIHJlcGxhY2VfcGF0aDogZmlsZS5wYXRoLFxuICAgIHNvdXJjZTogJ2NsaXBwZXInLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdENsaXBwZXJVcmwoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IHBhdHRlcm5zID0gW1xuICAgIC9mZWlzaHVfc3luY191cmw6XFxzKltcIiddPyhbXlxcblwiJ10rKS8sXG4gICAgL3NvdXJjZTpcXHMqW1wiJ10/KGh0dHBzPzpcXC9cXC9bXlxcblwiJ10qKD86ZmVpc2h1XFwuY258bGFya3N1aXRlXFwuY29tKVxcLyg/Ondpa2l8ZG9jeHxkb2MpXFwvW0EtWmEtejAtOV0rKS8sXG4gICAgLyhodHRwcz86XFwvXFwvW15cXHMpXCInXSooPzpmZWlzaHVcXC5jbnxsYXJrc3VpdGVcXC5jb20pXFwvKD86d2lraXxkb2N4fGRvYylcXC9bQS1aYS16MC05XSspLyxcbiAgXTtcbiAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIHBhdHRlcm5zKSB7XG4gICAgY29uc3QgbWF0Y2ggPSBjb250ZW50Lm1hdGNoKHBhdHRlcm4pO1xuICAgIGlmIChtYXRjaD8uWzFdKSByZXR1cm4gbWF0Y2hbMV0udHJpbSgpO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5jbGFzcyBGZWlzaHVJbnB1dE1vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBwcml2YXRlIGlucHV0RWwhOiBIVE1MSW5wdXRFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIG9uU3VibWl0OiAodmFsdWU6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPikge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBvbk9wZW4oKTogdm9pZCB7XG4gICAgdGhpcy50aXRsZUVsLnNldFRleHQoJ1x1NjJDOVx1NTNENlx1OThERVx1NEU2Nlx1NjU4N1x1Njg2MycpO1xuICAgIHRoaXMuaW5wdXRFbCA9IHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdpbnB1dCcsIHtcbiAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgIHBsYWNlaG9sZGVyOiAnXHU3Qzk4XHU4RDM0XHU5OERFXHU0RTY2XHU5NEZFXHU2M0E1XHUzMDAxdG9rZW4gXHU2MjE2IG9ic2lkaWFuOi8vbGFyay1kb2MgXHU1NzMwXHU1NzQwJyxcbiAgICB9KTtcbiAgICB0aGlzLmlucHV0RWwuc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgdGhpcy5pbnB1dEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgIT09ICdFbnRlcicpIHJldHVybjtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuaW5wdXRFbC52YWx1ZS50cmltKCk7XG4gICAgICBpZiAoIXZhbHVlKSByZXR1cm47XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB2b2lkIHRoaXMub25TdWJtaXQodmFsdWUpO1xuICAgIH0pO1xuICAgIHRoaXMuaW5wdXRFbC5mb2N1cygpO1xuICB9XG5cbiAgb25DbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xuICB9XG59XG5cbmNsYXNzIEZvbGRlclBpY2tNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgY29uc3RydWN0b3IoXG4gICAgYXBwOiBBcHAsXG4gICAgcHJpdmF0ZSBkZWZhdWx0RGlyOiBzdHJpbmcsXG4gICAgcHJpdmF0ZSBvblN1Ym1pdDogKGRpcjogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+LFxuICApIHtcbiAgICBzdXBlcihhcHApO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIHRoaXMudGl0bGVFbC5zZXRUZXh0KCdcdTkwMDlcdTYyRTlcdTU0MENcdTZCNjVcdTc2RUVcdTVGNTUnKTtcbiAgICBjb25zdCBzZWxlY3QgPSB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbCgnc2VsZWN0Jyk7XG4gICAgc2VsZWN0LnN0eWxlLndpZHRoID0gJzEwMCUnO1xuXG4gICAgY29uc3QgZm9sZGVycyA9IGdldEZvbGRlcnModGhpcy5hcHApO1xuICAgIGZvciAoY29uc3QgZm9sZGVyIG9mIGZvbGRlcnMpIHtcbiAgICAgIGNvbnN0IG9wdGlvbiA9IHNlbGVjdC5jcmVhdGVFbCgnb3B0aW9uJywge1xuICAgICAgICB0ZXh0OiBmb2xkZXIucGF0aCB8fCAnLycsXG4gICAgICAgIHZhbHVlOiBmb2xkZXIucGF0aCxcbiAgICAgIH0pO1xuICAgICAgb3B0aW9uLnNlbGVjdGVkID0gZm9sZGVyLnBhdGggPT09IHRoaXMuZGVmYXVsdERpcjtcbiAgICB9XG5cbiAgICBjb25zdCByb3cgPSB0aGlzLmNvbnRlbnRFbC5jcmVhdGVEaXYoKTtcbiAgICByb3cuc3R5bGUubWFyZ2luVG9wID0gJzEycHgnO1xuICAgIGNvbnN0IGNvbmZpcm0gPSByb3cuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ1x1NTQwQ1x1NkI2NScgfSk7XG4gICAgY29uZmlybS5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgY29uc3QgZGlyID0gc2VsZWN0LnZhbHVlIHx8IHRoaXMuZGVmYXVsdERpcjtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIHZvaWQgdGhpcy5vblN1Ym1pdChkaXIpO1xuICAgIH07XG4gIH1cblxuICBvbkNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0Rm9sZGVycyhhcHA6IEFwcCk6IFRGb2xkZXJbXSB7XG4gIGNvbnN0IGZvbGRlcnMgPSBhcHAudmF1bHRcbiAgICAuZ2V0QWxsTG9hZGVkRmlsZXMoKVxuICAgIC5maWx0ZXIoKGZpbGUpOiBmaWxlIGlzIFRGb2xkZXIgPT4gZmlsZSBpbnN0YW5jZW9mIFRGb2xkZXIpXG4gICAgLmZpbHRlcigoZm9sZGVyKSA9PiAhZm9sZGVyLnBhdGguc3RhcnRzV2l0aCgnLm9ic2lkaWFuJykgJiYgIWZvbGRlci5wYXRoLnN0YXJ0c1dpdGgoJy5mZWlzaHUtc3luYycpKTtcbiAgcmV0dXJuIGZvbGRlcnMubGVuZ3RoID4gMCA/IGZvbGRlcnMgOiBbYXBwLnZhdWx0LmdldFJvb3QoKV07XG59XG4iLCAiLyoqXG4gKiBcdTU2RkVcdTcyNDdcdTk4ODRcdTg5QzhcdTZFMzJcdTY3RDNcdTMwMDJcdTRGOURcdTYzNkUgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3My4zICsgYDAzX1x1NjgzQ1x1NUYwRlx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU1MTZEXHUzMDAyXG4gKlxuICogT0IgbWQgXHU5MUNDXHU1NkZFXHU3MjQ3XHU1MTk5XHU2MjEwIGAhW10oZmVpc2h1Oi8vRklMRV9UT0tFTilgXHVGRjBDXHU2RTMyXHU2N0QzXHU2NUY2XHU4QzAzIGxhcmstY2xpIFx1NjM2Mlx1NEUzNFx1NjVGNlx1OTRGRVx1NjNBNVx1MzAwMlxuICogXHU1RTI2IExSVSBcdTdGMTNcdTVCNThcdUZGMDhcdTkwN0ZcdTUxNERcdTZCQ0ZcdTZCMjFcdTZFMzJcdTY3RDNcdTkwRkRcdTRFMEJcdThGN0RcdUZGMDlcdUZGMENcdTdGMTNcdTVCNThcdTc2RUVcdTVGNTVcdTU3MjggdmF1bHQgXHU0RTBCIGAuZmVpc2h1LXN5bmMvY2FjaGUvYFx1MzAwMlxuICovXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IE5vdGljZSwgUGxhdGZvcm0gfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBydW4gfSBmcm9tICcuL2xhcmsvY2xpLmpzJztcblxuY29uc3QgQ0FDSEVfRElSID0gJy5mZWlzaHUtc3luYy9jYWNoZSc7XG5cbi8qKlxuICogXHU2Q0U4XHU1MThDXHU1NkZFXHU3MjQ3XHU2RTMyXHU2N0QzXHU1OTA0XHU3NDA2XHU1NjY4XHUzMDAyXG4gKiBcdTYyRTZcdTYyMkFcdTZFMzJcdTY3RDNcdTU0MEVcdTc2ODQgPGltZyBzcmM9XCJmZWlzaHU6Ly9UT0tFTlwiPlx1RkYwQ1x1NjM2Mlx1NjIxMCBsYXJrLWNsaSBcdTRFMEJcdThGN0RcdTc2ODRcdTY3MkNcdTU3MzBcdTRFMzRcdTY1RjZcdTY1ODdcdTRFRjZcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVySW1hZ2VSZW5kZXJlcihwbHVnaW46IFBsdWdpbik6IHZvaWQge1xuICBpZiAoIVBsYXRmb3JtLmlzRGVza3RvcEFwcCkgcmV0dXJuO1xuXG4gIGNvbnN0IHsgYWRhcHRlciB9ID0gcGx1Z2luLmFwcC52YXVsdDtcblxuICBwbHVnaW4ucmVnaXN0ZXJNYXJrZG93blBvc3RQcm9jZXNzb3IoYXN5bmMgKGVsLCBjdHgpID0+IHtcbiAgICBjb25zdCBpbWdzID0gZWwucXVlcnlTZWxlY3RvckFsbCgnaW1nJyk7XG4gICAgZm9yIChjb25zdCBpbWcgb2YgQXJyYXkuZnJvbShpbWdzKSkge1xuICAgICAgY29uc3Qgc3JjID0gaW1nLmdldEF0dHJpYnV0ZSgnc3JjJykgfHwgJyc7XG4gICAgICBpZiAoIXNyYy5zdGFydHNXaXRoKCdmZWlzaHU6Ly8nKSkgY29udGludWU7XG5cbiAgICAgIGNvbnN0IHRva2VuID0gc3JjLnNsaWNlKCdmZWlzaHU6Ly8nLmxlbmd0aCk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBsb2NhbFBhdGggPSBhd2FpdCByZXNvbHZlSW1hZ2UocGx1Z2luLCB0b2tlbik7XG4gICAgICAgIGlmIChsb2NhbFBhdGgpIHtcbiAgICAgICAgICAvLyBcdTc1MjggdmF1bHQ6Ly8gXHU5NEZFXHU2M0E1XHU2MjE2IGFwcDovL2xvY2FsLyBcdTk0RkVcdTYzQTVcbiAgICAgICAgICBjb25zdCB2YXVsdEJhc2UgPSBwbHVnaW4uYXBwLnZhdWx0LmFkYXB0ZXIuZ2V0QmFzZVBhdGg/LigpID8/ICcnO1xuICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKHZhdWx0QmFzZSwgbG9jYWxQYXRoKTtcbiAgICAgICAgICBpbWcuc2V0QXR0cmlidXRlKCdzcmMnLCBgYXBwOi8vbG9jYWwvJHtmdWxsUGF0aH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbWcuc2V0QXR0cmlidXRlKCdhbHQnLCBgW1x1OThERVx1NEU2Nlx1NTZGRVx1NzI0NyAke3Rva2VuLnNsaWNlKDAsIDgpfSBcdTUyQTBcdThGN0RcdTU5MzFcdThEMjVdYCk7XG4gICAgICAgICAgaW1nLnNldEF0dHJpYnV0ZSgnc3JjJywgJycpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbc3luYy9pbWFnZV0gcmVuZGVyIGZhaWxlZDonLCB0b2tlbiwgZXJyKTtcbiAgICAgICAgaW1nLnNldEF0dHJpYnV0ZSgnYWx0JywgYFtcdTk4REVcdTRFNjZcdTU2RkVcdTcyNDcgJHt0b2tlbi5zbGljZSgwLCA4KX0gXHU1MkEwXHU4RjdEXHU0RTJELi4uXWApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogXHU4OUUzXHU2NzkwXHU1MzU1XHU0RTJBXHU5OERFXHU0RTY2XHU1NkZFXHU3MjQ3IHRva2VuIFx1MjE5MiBcdTY3MkNcdTU3MzBcdTdGMTNcdTVCNThcdThERUZcdTVGODRcdTMwMDJcbiAqIFx1NTQ3RFx1NEUyRFx1N0YxM1x1NUI1OFx1NzZGNFx1NjNBNVx1OEZENFx1NTZERVx1RkYwQ1x1NTQyNlx1NTIxOVx1OEMwMyBsYXJrLWNsaSBkb2NzICttZWRpYS1kb3dubG9hZCBcdTRFMEJcdThGN0RcdTMwMDJcbiAqL1xuY29uc3QgcmVzb2x2aW5nID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2U8c3RyaW5nIHwgbnVsbD4+KCk7XG5cbmFzeW5jIGZ1bmN0aW9uIHJlc29sdmVJbWFnZShwbHVnaW46IFBsdWdpbiwgdG9rZW46IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAvLyBcdTVFNzZcdTUzRDFcdTUzQkJcdTkxQ0RcdUZGMDhcdTU0MENcdTRFMDAgdG9rZW4gXHU1OTFBXHU0RTJBIGltZyBcdTU0MENcdTY1RjZcdTZFMzJcdTY3RDNcdTUzRUFcdTRFMEJcdThGN0RcdTRFMDBcdTZCMjFcdUZGMDlcbiAgaWYgKHJlc29sdmluZy5oYXModG9rZW4pKSByZXR1cm4gcmVzb2x2aW5nLmdldCh0b2tlbikhO1xuXG4gIGNvbnN0IHByb21pc2UgPSBkb1Jlc29sdmVJbWFnZShwbHVnaW4sIHRva2VuKTtcbiAgcmVzb2x2aW5nLnNldCh0b2tlbiwgcHJvbWlzZSk7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGF3YWl0IHByb21pc2U7XG4gIH0gZmluYWxseSB7XG4gICAgcmVzb2x2aW5nLmRlbGV0ZSh0b2tlbik7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZG9SZXNvbHZlSW1hZ2UocGx1Z2luOiBQbHVnaW4sIHRva2VuOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgY29uc3QgeyBhZGFwdGVyIH0gPSBwbHVnaW4uYXBwLnZhdWx0O1xuICBjb25zdCBleHQgPSAnLnBuZyc7IC8vIFx1OThERVx1NEU2Nlx1NTZGRVx1NzI0N1x1OUVEOFx1OEJBNCBwbmdcdUZGMENcdTY1RTBcdTZDRDVcdTk4ODRcdTc3RTVcdTY4M0NcdTVGMEZcdUZGMENcdTdFREZcdTRFMDAgcG5nXG4gIGNvbnN0IGNhY2hlUGF0aCA9IGAke0NBQ0hFX0RJUn0vJHt0b2tlbn0ke2V4dH1gO1xuXG4gIC8vIFx1NTQ3RFx1NEUyRFx1N0YxM1x1NUI1OFxuICBpZiAoYXdhaXQgYWRhcHRlci5leGlzdHMoY2FjaGVQYXRoKSkge1xuICAgIHJldHVybiBjYWNoZVBhdGg7XG4gIH1cblxuICAvLyBcdTc4NkVcdTRGRERcdTdGMTNcdTVCNThcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjhcbiAgdHJ5IHtcbiAgICBpZiAoIShhd2FpdCBhZGFwdGVyLmV4aXN0cyhDQUNIRV9ESVIpKSkge1xuICAgICAgYXdhaXQgYWRhcHRlci5ta2RpcihDQUNIRV9ESVIpO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgLyogaWdub3JlICovXG4gIH1cblxuICAvLyBcdTRFMEJcdThGN0RcdTUyMzBcdTRFMzRcdTY1RjZcdTY3MkNcdTU3MzBcdThERUZcdTVGODRcdUZGMDhsYXJrLWNsaSBcdTk3MDBcdTg5ODFcdTY3MkNcdTU3MzBcdTY1ODdcdTRFRjZcdTdDRkJcdTdFREZcdThERUZcdTVGODRcdUZGMDlcbiAgY29uc3QgdmF1bHRCYXNlID0gKGFkYXB0ZXIgYXMgeyBnZXRCYXNlUGF0aD86ICgpID0+IHN0cmluZyB9KS5nZXRCYXNlUGF0aD8uKCkgPz8gcHJvY2Vzcy5jd2QoKTtcbiAgY29uc3QgbG9jYWxGdWxsUGF0aCA9IHBhdGguam9pbih2YXVsdEJhc2UsIGNhY2hlUGF0aCk7XG5cbiAgdHJ5IHtcbiAgICBydW4oWydkb2NzJywgJyttZWRpYS1kb3dubG9hZCcsICctLXRva2VuJywgdG9rZW4sICctLW91dHB1dCcsIGxvY2FsRnVsbFBhdGhdLCB7XG4gICAgICB0aW1lb3V0OiAzMDAwMCxcbiAgICB9KTtcbiAgICByZXR1cm4gY2FjaGVQYXRoO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2ltYWdlXSBtZWRpYS1kb3dubG9hZCBmYWlsZWQ6JywgdG9rZW4sIGVycik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTZFMDVcdTc0MDZcdThGQzdcdTY3MUZcdTdGMTNcdTVCNThcdTMwMDJcdTRGOURcdTYzNkVcdThCQkVcdTdGNkUgY2FjaGVDbGVhbnVwIFx1NTQ2OFx1NjcxRlx1MzAwMlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYW51cEltYWdlQ2FjaGUocGx1Z2luOiBQbHVnaW4sIG1vZGU6ICdkYWlseScgfCAnd2Vla2x5JyB8ICdtb250aGx5JyB8ICduZXZlcicpOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKG1vZGUgPT09ICduZXZlcicpIHJldHVybjtcblxuICBjb25zdCB7IGFkYXB0ZXIgfSA9IHBsdWdpbi5hcHAudmF1bHQ7XG4gIGlmICghKGF3YWl0IGFkYXB0ZXIuZXhpc3RzKENBQ0hFX0RJUikpKSByZXR1cm47XG5cbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgY29uc3QgdHRsTXMgPVxuICAgIG1vZGUgPT09ICdkYWlseScgPyAyNCAqIDM2MDAgKiAxMDAwIDpcbiAgICBtb2RlID09PSAnd2Vla2x5JyA/IDcgKiAyNCAqIDM2MDAgKiAxMDAwIDpcbiAgICAzMCAqIDI0ICogMzYwMCAqIDEwMDA7XG5cbiAgbGV0IGNsZWFuZWQgPSAwO1xuICB0cnkge1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgYWRhcHRlci5saXN0KENBQ0hFX0RJUik7XG4gICAgZm9yIChjb25zdCBmIG9mIGZpbGVzLmZpbGVzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzdGF0ID0gYXdhaXQgYWRhcHRlci5zdGF0KGYpO1xuICAgICAgICBpZiAoc3RhdD8ubXRpbWUgJiYgbm93IC0gc3RhdC5tdGltZSA+IHR0bE1zKSB7XG4gICAgICAgICAgYXdhaXQgYWRhcHRlci5yZW1vdmUoZik7XG4gICAgICAgICAgY2xlYW5lZCsrO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2ltYWdlXSBjbGVhbnVwIGZhaWxlZDonLCBlcnIpO1xuICB9XG5cbiAgaWYgKGNsZWFuZWQgPiAwKSB7XG4gICAgbmV3IE5vdGljZShgXHVEODNFXHVEREY5IFx1NURGMlx1NkUwNVx1NzQwNiAke2NsZWFuZWR9IFx1NEUyQVx1OEZDN1x1NjcxRlx1NTZGRVx1NzI0N1x1N0YxM1x1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TSxZQUFZLEtBQUssU0FBUyxNQUFNLElBQUk7QUFDM0QsV0FBSyxhQUFhO0FBQ2xCLFdBQUssTUFBTSxnQkFBZ0I7QUFBQSxJQUM3QixTQUFTLEtBQUs7QUFDWixZQUFNLE1BQU0sZUFBZSxRQUFRLElBQUksVUFBVSxPQUFPLEdBQUc7QUFDM0QsVUFBSSx3QkFBTyxpRUFBeUIsS0FBSyxTQUFTLElBQUksZUFBSyxHQUFHLEVBQUU7QUFDaEUsY0FBUSxNQUFNLCtCQUErQixHQUFHO0FBQUEsSUFDbEQ7QUFBQSxFQUNGO0FBQ0Y7QUFHQSxTQUFTQSxpQkFBd0I7QUFDL0IsUUFBTSxRQUFRLElBQUksV0FBVyxFQUFFO0FBQy9CLEVBQUMsV0FBVyxPQUFrQixnQkFBZ0IsS0FBSztBQUNuRCxTQUFPLE1BQU0sS0FBSyxLQUFLLEVBQUUsSUFBSSxPQUFLLEVBQUUsU0FBUyxFQUFFLEVBQUUsU0FBUyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRTtBQUM1RTtBQUdBLElBQU8sZUFBUTsiLAogICJuYW1lcyI6IFsiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJyZXN1bHQiLCAiZGF0ZSIsICJTY2hlbWEiLCAibGluZSIsICJzdHJUYWciLCAiY2giLCAic3R5bGUiLCAibm9kZSIsICJqc29uIiwgInVud3JhcExhcmtFbnZlbG9wZSIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJlbnN1cmVGb2xkZXIiLCAiZW5zdXJlRm9sZGVyIiwgImZpbmRCeUZlaXNodUlkIiwgImZpbmRCeUZlaXNodUlkIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAicnVuIiwgImltcG9ydF9vYnNpZGlhbiIsICJwYXRoIiwgImdlbmVyYXRlVG9rZW4iXQp9Cg==
