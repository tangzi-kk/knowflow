"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var import_node_child_process = require("child_process");
var path = __toESM(require("path"), 1);
var os = __toESM(require("os"), 1);
var fs = __toESM(require("fs"), 1);

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
    const { createHash } = require("crypto");
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
var __create2 = Object.create;
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames2 = Object.getOwnPropertyNames;
var __getProtoOf2 = Object.getPrototypeOf;
var __hasOwnProp2 = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __copyProps2 = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function")
    for (var keys = __getOwnPropNames2(from), i = 0, n = keys.length, key; i < n; i++) {
      key = keys[i];
      if (!__hasOwnProp2.call(to, key) && key !== except)
        __defProp2(to, key, {
          get: ((k) => from[k]).bind(null, key),
          enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable
        });
    }
  return to;
};
var __toESM2 = (mod, isNodeMode, target) => (target = mod != null ? __create2(__getProtoOf2(mod)) : {}, __copyProps2(isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", {
  value: mod,
  enumerable: true
}) : target, mod));
var require_common = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  function isNothing(subject) {
    return typeof subject === "undefined" || subject === null;
  }
  function isObject(subject) {
    return typeof subject === "object" && subject !== null;
  }
  function toArray(sequence) {
    if (Array.isArray(sequence))
      return sequence;
    else if (isNothing(sequence))
      return [];
    return [sequence];
  }
  function extend(target, source) {
    if (source) {
      const sourceKeys = Object.keys(source);
      for (let index = 0, length = sourceKeys.length; index < length; index += 1) {
        const key = sourceKeys[index];
        target[key] = source[key];
      }
    }
    return target;
  }
  function repeat(string, count) {
    let result = "";
    for (let cycle = 0; cycle < count; cycle += 1)
      result += string;
    return result;
  }
  function isNegativeZero(number) {
    return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
  }
  module2.exports.isNothing = isNothing;
  module2.exports.isObject = isObject;
  module2.exports.toArray = toArray;
  module2.exports.repeat = repeat;
  module2.exports.isNegativeZero = isNegativeZero;
  module2.exports.extend = extend;
});
var require_exception = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  function formatError(exception, compact) {
    let where = "";
    const message = exception.reason || "(unknown reason)";
    if (!exception.mark)
      return message;
    if (exception.mark.name)
      where += 'in "' + exception.mark.name + '" ';
    where += "(" + (exception.mark.line + 1) + ":" + (exception.mark.column + 1) + ")";
    if (!compact && exception.mark.snippet)
      where += "\n\n" + exception.mark.snippet;
    return message + " " + where;
  }
  function YAMLException2(reason, mark) {
    Error.call(this);
    this.name = "YAMLException";
    this.reason = reason;
    this.mark = mark;
    this.message = formatError(this, false);
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, this.constructor);
    else
      this.stack = (/* @__PURE__ */ new Error()).stack || "";
  }
  YAMLException2.prototype = Object.create(Error.prototype);
  YAMLException2.prototype.constructor = YAMLException2;
  YAMLException2.prototype.toString = function toString(compact) {
    return this.name + ": " + formatError(this, compact);
  };
  module2.exports = YAMLException2;
});
var require_snippet = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  var common = require_common();
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
    return common.repeat(" ", max - string.length) + string;
  }
  function makeSnippet(mark, options) {
    options = Object.create(options || null);
    if (!mark.buffer)
      return null;
    if (!options.maxLength)
      options.maxLength = 79;
    if (typeof options.indent !== "number")
      options.indent = 1;
    if (typeof options.linesBefore !== "number")
      options.linesBefore = 3;
    if (typeof options.linesAfter !== "number")
      options.linesAfter = 2;
    const re = /\r?\n|\r|\0/g;
    const lineStarts = [0];
    const lineEnds = [];
    let match;
    let foundLineNo = -1;
    while (match = re.exec(mark.buffer)) {
      lineEnds.push(match.index);
      lineStarts.push(match.index + match[0].length);
      if (mark.position <= match.index && foundLineNo < 0)
        foundLineNo = lineStarts.length - 2;
    }
    if (foundLineNo < 0)
      foundLineNo = lineStarts.length - 1;
    let result = "";
    const lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
    const maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
    for (let i = 1; i <= options.linesBefore; i++) {
      if (foundLineNo - i < 0)
        break;
      const line2 = getLine(mark.buffer, lineStarts[foundLineNo - i], lineEnds[foundLineNo - i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]), maxLineLength);
      result = common.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line2.str + "\n" + result;
    }
    const line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
    result += common.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
    result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^\n";
    for (let i = 1; i <= options.linesAfter; i++) {
      if (foundLineNo + i >= lineEnds.length)
        break;
      const line2 = getLine(mark.buffer, lineStarts[foundLineNo + i], lineEnds[foundLineNo + i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]), maxLineLength);
      result += common.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line2.str + "\n";
    }
    return result.replace(/\n$/, "");
  }
  module2.exports = makeSnippet;
});
var require_type = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  var YAMLException2 = require_exception();
  var TYPE_CONSTRUCTOR_OPTIONS = [
    "kind",
    "multi",
    "resolve",
    "construct",
    "instanceOf",
    "predicate",
    "represent",
    "representName",
    "defaultStyle",
    "styleAliases"
  ];
  var YAML_NODE_KINDS = [
    "scalar",
    "sequence",
    "mapping"
  ];
  function compileStyleAliases(map) {
    const result = {};
    if (map !== null)
      Object.keys(map).forEach(function(style) {
        map[style].forEach(function(alias) {
          result[String(alias)] = style;
        });
      });
    return result;
  }
  function Type2(tag, options) {
    options = options || {};
    Object.keys(options).forEach(function(name) {
      if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1)
        throw new YAMLException2('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    });
    this.options = options;
    this.tag = tag;
    this.kind = options["kind"] || null;
    this.resolve = options["resolve"] || function() {
      return true;
    };
    this.construct = options["construct"] || function(data) {
      return data;
    };
    this.instanceOf = options["instanceOf"] || null;
    this.predicate = options["predicate"] || null;
    this.represent = options["represent"] || null;
    this.representName = options["representName"] || null;
    this.defaultStyle = options["defaultStyle"] || null;
    this.multi = options["multi"] || false;
    this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
    if (YAML_NODE_KINDS.indexOf(this.kind) === -1)
      throw new YAMLException2('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
  module2.exports = Type2;
});
var require_schema = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  var YAMLException2 = require_exception();
  var Type2 = require_type();
  function compileList(schema, name) {
    const result = [];
    schema[name].forEach(function(currentType) {
      let newIndex = result.length;
      result.forEach(function(previousType, previousIndex) {
        if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi)
          newIndex = previousIndex;
      });
      result[newIndex] = currentType;
    });
    return result;
  }
  function compileMap() {
    const result = {
      scalar: {},
      sequence: {},
      mapping: {},
      fallback: {},
      multi: {
        scalar: [],
        sequence: [],
        mapping: [],
        fallback: []
      }
    };
    function collectType(type) {
      if (type.multi) {
        result.multi[type.kind].push(type);
        result.multi["fallback"].push(type);
      } else
        result[type.kind][type.tag] = result["fallback"][type.tag] = type;
    }
    for (let index = 0, length = arguments.length; index < length; index += 1)
      arguments[index].forEach(collectType);
    return result;
  }
  function Schema2(definition) {
    return this.extend(definition);
  }
  Schema2.prototype.extend = function extend(definition) {
    let implicit = [];
    let explicit = [];
    if (definition instanceof Type2)
      explicit.push(definition);
    else if (Array.isArray(definition))
      explicit = explicit.concat(definition);
    else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
      if (definition.implicit)
        implicit = implicit.concat(definition.implicit);
      if (definition.explicit)
        explicit = explicit.concat(definition.explicit);
    } else
      throw new YAMLException2("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
    implicit.forEach(function(type) {
      if (!(type instanceof Type2))
        throw new YAMLException2("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      if (type.loadKind && type.loadKind !== "scalar")
        throw new YAMLException2("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      if (type.multi)
        throw new YAMLException2("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    });
    explicit.forEach(function(type) {
      if (!(type instanceof Type2))
        throw new YAMLException2("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    });
    const result = Object.create(Schema2.prototype);
    result.implicit = (this.implicit || []).concat(implicit);
    result.explicit = (this.explicit || []).concat(explicit);
    result.compiledImplicit = compileList(result, "implicit");
    result.compiledExplicit = compileList(result, "explicit");
    result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
    return result;
  };
  module2.exports = Schema2;
});
var require_str = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  module2.exports = new (require_type())("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: function(data) {
      return data !== null ? data : "";
    }
  });
});
var require_seq = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  module2.exports = new (require_type())("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: function(data) {
      return data !== null ? data : [];
    }
  });
});
var require_map = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  module2.exports = new (require_type())("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: function(data) {
      return data !== null ? data : {};
    }
  });
});
var require_failsafe = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  module2.exports = new (require_schema())({ explicit: [
    require_str(),
    require_seq(),
    require_map()
  ] });
});
var require_null = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  var Type2 = require_type();
  function resolveYamlNull(data) {
    if (data === null)
      return true;
    const max = data.length;
    return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
  }
  function constructYamlNull() {
    return null;
  }
  function isNull(object) {
    return object === null;
  }
  module2.exports = new Type2("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: resolveYamlNull,
    construct: constructYamlNull,
    predicate: isNull,
    represent: {
      canonical: function() {
        return "~";
      },
      lowercase: function() {
        return "null";
      },
      uppercase: function() {
        return "NULL";
      },
      camelcase: function() {
        return "Null";
      },
      empty: function() {
        return "";
      }
    },
    defaultStyle: "lowercase"
  });
});
var require_bool = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  var Type2 = require_type();
  function resolveYamlBoolean(data) {
    if (data === null)
      return false;
    const max = data.length;
    return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
  }
  function constructYamlBoolean(data) {
    return data === "true" || data === "True" || data === "TRUE";
  }
  function isBoolean(object) {
    return Object.prototype.toString.call(object) === "[object Boolean]";
  }
  module2.exports = new Type2("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: resolveYamlBoolean,
    construct: constructYamlBoolean,
    predicate: isBoolean,
    represent: {
      lowercase: function(object) {
        return object ? "true" : "false";
      },
      uppercase: function(object) {
        return object ? "TRUE" : "FALSE";
      },
      camelcase: function(object) {
        return object ? "True" : "False";
      }
    },
    defaultStyle: "lowercase"
  });
});
var require_int = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  var common = require_common();
  var Type2 = require_type();
  function isHexCode(c) {
    return c >= 48 && c <= 57 || c >= 65 && c <= 70 || c >= 97 && c <= 102;
  }
  function isOctCode(c) {
    return c >= 48 && c <= 55;
  }
  function isDecCode(c) {
    return c >= 48 && c <= 57;
  }
  function resolveYamlInteger(data) {
    if (data === null)
      return false;
    const max = data.length;
    let index = 0;
    let hasDigits = false;
    if (!max)
      return false;
    let ch = data[index];
    if (ch === "-" || ch === "+")
      ch = data[++index];
    if (ch === "0") {
      if (index + 1 === max)
        return true;
      ch = data[++index];
      if (ch === "b") {
        index++;
        for (; index < max; index++) {
          ch = data[index];
          if (ch !== "0" && ch !== "1")
            return false;
          hasDigits = true;
        }
        return hasDigits && Number.isFinite(parseYamlInteger(data));
      }
      if (ch === "x") {
        index++;
        for (; index < max; index++) {
          if (!isHexCode(data.charCodeAt(index)))
            return false;
          hasDigits = true;
        }
        return hasDigits && Number.isFinite(parseYamlInteger(data));
      }
      if (ch === "o") {
        index++;
        for (; index < max; index++) {
          if (!isOctCode(data.charCodeAt(index)))
            return false;
          hasDigits = true;
        }
        return hasDigits && Number.isFinite(parseYamlInteger(data));
      }
    }
    for (; index < max; index++) {
      if (!isDecCode(data.charCodeAt(index)))
        return false;
      hasDigits = true;
    }
    if (!hasDigits)
      return false;
    return Number.isFinite(parseYamlInteger(data));
  }
  function parseYamlInteger(data) {
    let value = data;
    let sign = 1;
    let ch = value[0];
    if (ch === "-" || ch === "+") {
      if (ch === "-")
        sign = -1;
      value = value.slice(1);
      ch = value[0];
    }
    if (value === "0")
      return 0;
    if (ch === "0") {
      if (value[1] === "b")
        return sign * parseInt(value.slice(2), 2);
      if (value[1] === "x")
        return sign * parseInt(value.slice(2), 16);
      if (value[1] === "o")
        return sign * parseInt(value.slice(2), 8);
    }
    return sign * parseInt(value, 10);
  }
  function constructYamlInteger(data) {
    return parseYamlInteger(data);
  }
  function isInteger(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && object % 1 === 0 && !common.isNegativeZero(object);
  }
  module2.exports = new Type2("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: resolveYamlInteger,
    construct: constructYamlInteger,
    predicate: isInteger,
    represent: {
      binary: function(obj) {
        return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
      },
      octal: function(obj) {
        return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
      },
      decimal: function(obj) {
        return obj.toString(10);
      },
      hexadecimal: function(obj) {
        return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
      }
    },
    defaultStyle: "decimal",
    styleAliases: {
      binary: [2, "bin"],
      octal: [8, "oct"],
      decimal: [10, "dec"],
      hexadecimal: [16, "hex"]
    }
  });
});
var require_float = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  var common = require_common();
  var Type2 = require_type();
  var YAML_FLOAT_PATTERN = /* @__PURE__ */ new RegExp("^(?:[-+]?(?:[0-9]+)(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");
  var YAML_FLOAT_SPECIAL_PATTERN = /* @__PURE__ */ new RegExp("^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");
  function resolveYamlFloat(data) {
    if (data === null)
      return false;
    if (!YAML_FLOAT_PATTERN.test(data))
      return false;
    if (Number.isFinite(parseFloat(data, 10)))
      return true;
    return YAML_FLOAT_SPECIAL_PATTERN.test(data);
  }
  function constructYamlFloat(data) {
    let value = data.toLowerCase();
    const sign = value[0] === "-" ? -1 : 1;
    if ("+-".indexOf(value[0]) >= 0)
      value = value.slice(1);
    if (value === ".inf")
      return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    else if (value === ".nan")
      return NaN;
    return sign * parseFloat(value, 10);
  }
  var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
  function representYamlFloat(object, style) {
    if (isNaN(object))
      switch (style) {
        case "lowercase":
          return ".nan";
        case "uppercase":
          return ".NAN";
        case "camelcase":
          return ".NaN";
      }
    else if (Number.POSITIVE_INFINITY === object)
      switch (style) {
        case "lowercase":
          return ".inf";
        case "uppercase":
          return ".INF";
        case "camelcase":
          return ".Inf";
      }
    else if (Number.NEGATIVE_INFINITY === object)
      switch (style) {
        case "lowercase":
          return "-.inf";
        case "uppercase":
          return "-.INF";
        case "camelcase":
          return "-.Inf";
      }
    else if (common.isNegativeZero(object))
      return "-0.0";
    const res = object.toString(10);
    return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
  }
  function isFloat(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
  }
  module2.exports = new Type2("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: resolveYamlFloat,
    construct: constructYamlFloat,
    predicate: isFloat,
    represent: representYamlFloat,
    defaultStyle: "lowercase"
  });
});
var require_json = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  module2.exports = require_failsafe().extend({ implicit: [
    require_null(),
    require_bool(),
    require_int(),
    require_float()
  ] });
});
var require_core = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  module2.exports = require_json();
});
var require_timestamp = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  var Type2 = require_type();
  var YAML_DATE_REGEXP = /* @__PURE__ */ new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$");
  var YAML_TIMESTAMP_REGEXP = /* @__PURE__ */ new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");
  function resolveYamlTimestamp(data) {
    if (data === null)
      return false;
    if (YAML_DATE_REGEXP.exec(data) !== null)
      return true;
    if (YAML_TIMESTAMP_REGEXP.exec(data) !== null)
      return true;
    return false;
  }
  function constructYamlTimestamp(data) {
    let fraction = 0;
    let delta = null;
    let match = YAML_DATE_REGEXP.exec(data);
    if (match === null)
      match = YAML_TIMESTAMP_REGEXP.exec(data);
    if (match === null)
      throw new Error("Date resolve error");
    const year = +match[1];
    const month = +match[2] - 1;
    const day = +match[3];
    if (!match[4])
      return new Date(Date.UTC(year, month, day));
    const hour = +match[4];
    const minute = +match[5];
    const second = +match[6];
    if (match[7]) {
      fraction = match[7].slice(0, 3);
      while (fraction.length < 3)
        fraction += "0";
      fraction = +fraction;
    }
    if (match[9]) {
      const tzHour = +match[10];
      const tzMinute = +(match[11] || 0);
      delta = (tzHour * 60 + tzMinute) * 6e4;
      if (match[9] === "-")
        delta = -delta;
    }
    const date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (delta)
      date.setTime(date.getTime() - delta);
    return date;
  }
  function representYamlTimestamp(object) {
    return object.toISOString();
  }
  module2.exports = new Type2("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: resolveYamlTimestamp,
    construct: constructYamlTimestamp,
    instanceOf: Date,
    represent: representYamlTimestamp
  });
});
var require_merge = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  var Type2 = require_type();
  function resolveYamlMerge(data) {
    return data === "<<" || data === null;
  }
  module2.exports = new Type2("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: resolveYamlMerge
  });
});
var require_binary = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  var Type2 = require_type();
  var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
  function resolveYamlBinary(data) {
    if (data === null)
      return false;
    let bitlen = 0;
    const max = data.length;
    const map = BASE64_MAP;
    for (let idx = 0; idx < max; idx++) {
      const code = map.indexOf(data.charAt(idx));
      if (code > 64)
        continue;
      if (code < 0)
        return false;
      bitlen += 6;
    }
    return bitlen % 8 === 0;
  }
  function constructYamlBinary(data) {
    const input = data.replace(/[\r\n=]/g, "");
    const max = input.length;
    const map = BASE64_MAP;
    let bits = 0;
    const result = [];
    for (let idx = 0; idx < max; idx++) {
      if (idx % 4 === 0 && idx) {
        result.push(bits >> 16 & 255);
        result.push(bits >> 8 & 255);
        result.push(bits & 255);
      }
      bits = bits << 6 | map.indexOf(input.charAt(idx));
    }
    const tailbits = max % 4 * 6;
    if (tailbits === 0) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    } else if (tailbits === 18) {
      result.push(bits >> 10 & 255);
      result.push(bits >> 2 & 255);
    } else if (tailbits === 12)
      result.push(bits >> 4 & 255);
    return new Uint8Array(result);
  }
  function representYamlBinary(object) {
    let result = "";
    let bits = 0;
    const max = object.length;
    const map = BASE64_MAP;
    for (let idx = 0; idx < max; idx++) {
      if (idx % 3 === 0 && idx) {
        result += map[bits >> 18 & 63];
        result += map[bits >> 12 & 63];
        result += map[bits >> 6 & 63];
        result += map[bits & 63];
      }
      bits = (bits << 8) + object[idx];
    }
    const tail = max % 3;
    if (tail === 0) {
      result += map[bits >> 18 & 63];
      result += map[bits >> 12 & 63];
      result += map[bits >> 6 & 63];
      result += map[bits & 63];
    } else if (tail === 2) {
      result += map[bits >> 10 & 63];
      result += map[bits >> 4 & 63];
      result += map[bits << 2 & 63];
      result += map[64];
    } else if (tail === 1) {
      result += map[bits >> 2 & 63];
      result += map[bits << 4 & 63];
      result += map[64];
      result += map[64];
    }
    return result;
  }
  function isBinary(obj) {
    return Object.prototype.toString.call(obj) === "[object Uint8Array]";
  }
  module2.exports = new Type2("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: resolveYamlBinary,
    construct: constructYamlBinary,
    predicate: isBinary,
    represent: representYamlBinary
  });
});
var require_omap = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  var Type2 = require_type();
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  var _toString = Object.prototype.toString;
  function resolveYamlOmap(data) {
    if (data === null)
      return true;
    const objectKeys = [];
    const object = data;
    for (let index = 0, length = object.length; index < length; index += 1) {
      const pair = object[index];
      let pairHasKey = false;
      if (_toString.call(pair) !== "[object Object]")
        return false;
      let pairKey;
      for (pairKey in pair)
        if (_hasOwnProperty.call(pair, pairKey))
          if (!pairHasKey)
            pairHasKey = true;
          else
            return false;
      if (!pairHasKey)
        return false;
      if (objectKeys.indexOf(pairKey) === -1)
        objectKeys.push(pairKey);
      else
        return false;
    }
    return true;
  }
  function constructYamlOmap(data) {
    return data !== null ? data : [];
  }
  module2.exports = new Type2("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: resolveYamlOmap,
    construct: constructYamlOmap
  });
});
var require_pairs = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  var Type2 = require_type();
  var _toString = Object.prototype.toString;
  function resolveYamlPairs(data) {
    if (data === null)
      return true;
    const object = data;
    const result = new Array(object.length);
    for (let index = 0, length = object.length; index < length; index += 1) {
      const pair = object[index];
      if (_toString.call(pair) !== "[object Object]")
        return false;
      const keys = Object.keys(pair);
      if (keys.length !== 1)
        return false;
      result[index] = [keys[0], pair[keys[0]]];
    }
    return true;
  }
  function constructYamlPairs(data) {
    if (data === null)
      return [];
    const object = data;
    const result = new Array(object.length);
    for (let index = 0, length = object.length; index < length; index += 1) {
      const pair = object[index];
      const keys = Object.keys(pair);
      result[index] = [keys[0], pair[keys[0]]];
    }
    return result;
  }
  module2.exports = new Type2("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: resolveYamlPairs,
    construct: constructYamlPairs
  });
});
var require_set = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  var Type2 = require_type();
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  function resolveYamlSet(data) {
    if (data === null)
      return true;
    const object = data;
    for (const key in object)
      if (_hasOwnProperty.call(object, key)) {
        if (object[key] !== null)
          return false;
      }
    return true;
  }
  function constructYamlSet(data) {
    return data !== null ? data : {};
  }
  module2.exports = new Type2("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: resolveYamlSet,
    construct: constructYamlSet
  });
});
var require_default = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  module2.exports = require_core().extend({
    implicit: [require_timestamp(), require_merge()],
    explicit: [
      require_binary(),
      require_omap(),
      require_pairs(),
      require_set()
    ]
  });
});
var require_loader = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  var common = require_common();
  var YAMLException2 = require_exception();
  var makeSnippet = require_snippet();
  var DEFAULT_SCHEMA2 = require_default();
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  var CONTEXT_FLOW_IN = 1;
  var CONTEXT_FLOW_OUT = 2;
  var CONTEXT_BLOCK_IN = 3;
  var CONTEXT_BLOCK_OUT = 4;
  var CHOMPING_CLIP = 1;
  var CHOMPING_STRIP = 2;
  var CHOMPING_KEEP = 3;
  var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
  var PATTERN_FLOW_INDICATORS = /[,\[\]{}]/;
  var PATTERN_TAG_HANDLE = /^(?:!|!!|![0-9A-Za-z-]+!)$/;
  var PATTERN_TAG_URI = /^(?:!|[^,\[\]{}])(?:%[0-9a-f]{2}|[0-9a-z\-#;/?:@&=+$,_.!~*'()\[\]])*$/i;
  function _class(obj) {
    return Object.prototype.toString.call(obj);
  }
  function isEol(c) {
    return c === 10 || c === 13;
  }
  function isWhiteSpace(c) {
    return c === 9 || c === 32;
  }
  function isWsOrEol(c) {
    return c === 9 || c === 32 || c === 10 || c === 13;
  }
  function isFlowIndicator(c) {
    return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
  }
  function fromHexCode(c) {
    if (c >= 48 && c <= 57)
      return c - 48;
    const lc = c | 32;
    if (lc >= 97 && lc <= 102)
      return lc - 97 + 10;
    return -1;
  }
  function escapedHexLen(c) {
    if (c === 120)
      return 2;
    if (c === 117)
      return 4;
    if (c === 85)
      return 8;
    return 0;
  }
  function fromDecimalCode(c) {
    if (c >= 48 && c <= 57)
      return c - 48;
    return -1;
  }
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
  function charFromCodepoint(c) {
    if (c <= 65535)
      return String.fromCharCode(c);
    return String.fromCharCode((c - 65536 >> 10) + 55296, (c - 65536 & 1023) + 56320);
  }
  function setProperty(object, key, value) {
    if (key === "__proto__")
      Object.defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        writable: true,
        value
      });
    else
      object[key] = value;
  }
  var simpleEscapeCheck = new Array(256);
  var simpleEscapeMap = new Array(256);
  for (let i = 0; i < 256; i++) {
    simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
    simpleEscapeMap[i] = simpleEscapeSequence(i);
  }
  function State(input, options) {
    this.input = input;
    this.filename = options["filename"] || null;
    this.schema = options["schema"] || DEFAULT_SCHEMA2;
    this.onWarning = options["onWarning"] || null;
    this.legacy = options["legacy"] || false;
    this.json = options["json"] || false;
    this.listener = options["listener"] || null;
    this.maxDepth = typeof options["maxDepth"] === "number" ? options["maxDepth"] : 100;
    this.maxMergeSeqLength = typeof options["maxMergeSeqLength"] === "number" ? options["maxMergeSeqLength"] : 20;
    this.implicitTypes = this.schema.compiledImplicit;
    this.typeMap = this.schema.compiledTypeMap;
    this.length = input.length;
    this.position = 0;
    this.line = 0;
    this.lineStart = 0;
    this.lineIndent = 0;
    this.depth = 0;
    this.firstTabInLine = -1;
    this.documents = [];
    this.anchorMapTransactions = [];
  }
  function generateError(state, message) {
    const mark = {
      name: state.filename,
      buffer: state.input.slice(0, -1),
      position: state.position,
      line: state.line,
      column: state.position - state.lineStart
    };
    mark.snippet = makeSnippet(mark);
    return new YAMLException2(message, mark);
  }
  function throwError(state, message) {
    throw generateError(state, message);
  }
  function throwWarning(state, message) {
    if (state.onWarning)
      state.onWarning.call(null, generateError(state, message));
  }
  function storeAnchor(state, name, value) {
    const transactions = state.anchorMapTransactions;
    if (transactions.length !== 0) {
      const transaction = transactions[transactions.length - 1];
      if (!_hasOwnProperty.call(transaction, name))
        transaction[name] = {
          existed: _hasOwnProperty.call(state.anchorMap, name),
          value: state.anchorMap[name]
        };
    }
    state.anchorMap[name] = value;
  }
  function beginAnchorTransaction(state) {
    state.anchorMapTransactions.push(/* @__PURE__ */ Object.create(null));
  }
  function commitAnchorTransaction(state) {
    const transaction = state.anchorMapTransactions.pop();
    const transactions = state.anchorMapTransactions;
    if (transactions.length === 0)
      return;
    const parent = transactions[transactions.length - 1];
    const names = Object.keys(transaction);
    for (let index = 0, length = names.length; index < length; index += 1) {
      const name = names[index];
      if (!_hasOwnProperty.call(parent, name))
        parent[name] = transaction[name];
    }
  }
  function rollbackAnchorTransaction(state) {
    const transaction = state.anchorMapTransactions.pop();
    const names = Object.keys(transaction);
    for (let index = names.length - 1; index >= 0; index -= 1) {
      const entry = transaction[names[index]];
      if (entry.existed)
        state.anchorMap[names[index]] = entry.value;
      else
        delete state.anchorMap[names[index]];
    }
  }
  function snapshotState(state) {
    return {
      position: state.position,
      line: state.line,
      lineStart: state.lineStart,
      lineIndent: state.lineIndent,
      firstTabInLine: state.firstTabInLine,
      tag: state.tag,
      anchor: state.anchor,
      kind: state.kind,
      result: state.result
    };
  }
  function restoreState(state, snapshot) {
    state.position = snapshot.position;
    state.line = snapshot.line;
    state.lineStart = snapshot.lineStart;
    state.lineIndent = snapshot.lineIndent;
    state.firstTabInLine = snapshot.firstTabInLine;
    state.tag = snapshot.tag;
    state.anchor = snapshot.anchor;
    state.kind = snapshot.kind;
    state.result = snapshot.result;
  }
  var directiveHandlers = {
    YAML: function handleYamlDirective(state, name, args) {
      if (state.version !== null)
        throwError(state, "duplication of %YAML directive");
      if (args.length !== 1)
        throwError(state, "YAML directive accepts exactly one argument");
      const match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
      if (match === null)
        throwError(state, "ill-formed argument of the YAML directive");
      const major = parseInt(match[1], 10);
      const minor = parseInt(match[2], 10);
      if (major !== 1)
        throwError(state, "unacceptable YAML version of the document");
      state.version = args[0];
      state.checkLineBreaks = minor < 2;
      if (minor !== 1 && minor !== 2)
        throwWarning(state, "unsupported YAML version of the document");
    },
    TAG: function handleTagDirective(state, name, args) {
      let prefix;
      if (args.length !== 2)
        throwError(state, "TAG directive accepts exactly two arguments");
      const handle = args[0];
      prefix = args[1];
      if (!PATTERN_TAG_HANDLE.test(handle))
        throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
      if (_hasOwnProperty.call(state.tagMap, handle))
        throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
      if (!PATTERN_TAG_URI.test(prefix))
        throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
      try {
        prefix = decodeURIComponent(prefix);
      } catch (err) {
        throwError(state, "tag prefix is malformed: " + prefix);
      }
      state.tagMap[handle] = prefix;
    }
  };
  function captureSegment(state, start, end, checkJson) {
    if (start < end) {
      const _result = state.input.slice(start, end);
      if (checkJson)
        for (let _position = 0, _length = _result.length; _position < _length; _position += 1) {
          const _character = _result.charCodeAt(_position);
          if (!(_character === 9 || _character >= 32 && _character <= 1114111))
            throwError(state, "expected valid JSON character");
        }
      else if (PATTERN_NON_PRINTABLE.test(_result))
        throwError(state, "the stream contains non-printable characters");
      state.result += _result;
    }
  }
  function mergeMappings(state, destination, source, overridableKeys) {
    if (!common.isObject(source))
      throwError(state, "cannot merge mappings; the provided source object is unacceptable");
    const sourceKeys = Object.keys(source);
    for (let index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
      const key = sourceKeys[index];
      if (!_hasOwnProperty.call(destination, key)) {
        setProperty(destination, key, source[key]);
        overridableKeys[key] = true;
      }
    }
  }
  function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
    if (Array.isArray(keyNode)) {
      keyNode = Array.prototype.slice.call(keyNode);
      for (let index = 0, quantity = keyNode.length; index < quantity; index += 1) {
        if (Array.isArray(keyNode[index]))
          throwError(state, "nested arrays are not supported inside keys");
        if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]")
          keyNode[index] = "[object Object]";
      }
    }
    if (typeof keyNode === "object" && _class(keyNode) === "[object Object]")
      keyNode = "[object Object]";
    keyNode = String(keyNode);
    if (_result === null)
      _result = {};
    if (keyTag === "tag:yaml.org,2002:merge")
      if (Array.isArray(valueNode)) {
        if (valueNode.length > state.maxMergeSeqLength)
          throwError(state, "merge sequence length exceeded maxMergeSeqLength (" + state.maxMergeSeqLength + ")");
        const seen = /* @__PURE__ */ new Set();
        for (let index = 0, quantity = valueNode.length; index < quantity; index += 1) {
          const src = valueNode[index];
          if (seen.has(src))
            continue;
          seen.add(src);
          mergeMappings(state, _result, src, overridableKeys);
        }
      } else
        mergeMappings(state, _result, valueNode, overridableKeys);
    else {
      if (!state.json && !_hasOwnProperty.call(overridableKeys, keyNode) && _hasOwnProperty.call(_result, keyNode)) {
        state.line = startLine || state.line;
        state.lineStart = startLineStart || state.lineStart;
        state.position = startPos || state.position;
        throwError(state, "duplicated mapping key");
      }
      setProperty(_result, keyNode, valueNode);
      delete overridableKeys[keyNode];
    }
    return _result;
  }
  function readLineBreak(state) {
    const ch = state.input.charCodeAt(state.position);
    if (ch === 10)
      state.position++;
    else if (ch === 13) {
      state.position++;
      if (state.input.charCodeAt(state.position) === 10)
        state.position++;
    } else
      throwError(state, "a line break is expected");
    state.line += 1;
    state.lineStart = state.position;
    state.firstTabInLine = -1;
  }
  function skipSeparationSpace(state, allowComments, checkIndent) {
    let lineBreaks = 0;
    let ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      while (isWhiteSpace(ch)) {
        if (ch === 9 && state.firstTabInLine === -1)
          state.firstTabInLine = state.position;
        ch = state.input.charCodeAt(++state.position);
      }
      if (allowComments && ch === 35)
        do
          ch = state.input.charCodeAt(++state.position);
        while (ch !== 10 && ch !== 13 && ch !== 0);
      if (isEol(ch)) {
        readLineBreak(state);
        ch = state.input.charCodeAt(state.position);
        lineBreaks++;
        state.lineIndent = 0;
        while (ch === 32) {
          state.lineIndent++;
          ch = state.input.charCodeAt(++state.position);
        }
      } else
        break;
    }
    if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent)
      throwWarning(state, "deficient indentation");
    return lineBreaks;
  }
  function testDocumentSeparator(state) {
    let _position = state.position;
    let ch = state.input.charCodeAt(_position);
    if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
      _position += 3;
      ch = state.input.charCodeAt(_position);
      if (ch === 0 || isWsOrEol(ch))
        return true;
    }
    return false;
  }
  function writeFoldedLines(state, count) {
    if (count === 1)
      state.result += " ";
    else if (count > 1)
      state.result += common.repeat("\n", count - 1);
  }
  function readPlainScalar(state, nodeIndent, withinFlowCollection) {
    let captureStart;
    let captureEnd;
    let hasPendingContent;
    let _line;
    let _lineStart;
    let _lineIndent;
    const _kind = state.kind;
    const _result = state.result;
    let ch = state.input.charCodeAt(state.position);
    if (isWsOrEol(ch) || isFlowIndicator(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96)
      return false;
    if (ch === 63 || ch === 45) {
      const following = state.input.charCodeAt(state.position + 1);
      if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following))
        return false;
    }
    state.kind = "scalar";
    state.result = "";
    captureStart = captureEnd = state.position;
    hasPendingContent = false;
    while (ch !== 0) {
      if (ch === 58) {
        const following = state.input.charCodeAt(state.position + 1);
        if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following))
          break;
      } else if (ch === 35) {
        if (isWsOrEol(state.input.charCodeAt(state.position - 1)))
          break;
      } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && isFlowIndicator(ch))
        break;
      else if (isEol(ch)) {
        _line = state.line;
        _lineStart = state.lineStart;
        _lineIndent = state.lineIndent;
        skipSeparationSpace(state, false, -1);
        if (state.lineIndent >= nodeIndent) {
          hasPendingContent = true;
          ch = state.input.charCodeAt(state.position);
          continue;
        } else {
          state.position = captureEnd;
          state.line = _line;
          state.lineStart = _lineStart;
          state.lineIndent = _lineIndent;
          break;
        }
      }
      if (hasPendingContent) {
        captureSegment(state, captureStart, captureEnd, false);
        writeFoldedLines(state, state.line - _line);
        captureStart = captureEnd = state.position;
        hasPendingContent = false;
      }
      if (!isWhiteSpace(ch))
        captureEnd = state.position + 1;
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, captureEnd, false);
    if (state.result)
      return true;
    state.kind = _kind;
    state.result = _result;
    return false;
  }
  function readSingleQuotedScalar(state, nodeIndent) {
    let captureStart;
    let captureEnd;
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 39)
      return false;
    state.kind = "scalar";
    state.result = "";
    state.position++;
    captureStart = captureEnd = state.position;
    while ((ch = state.input.charCodeAt(state.position)) !== 0)
      if (ch === 39) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);
        if (ch === 39) {
          captureStart = state.position;
          state.position++;
          captureEnd = state.position;
        } else
          return true;
      } else if (isEol(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state))
        throwError(state, "unexpected end of the document within a single quoted scalar");
      else {
        state.position++;
        if (!isWhiteSpace(ch))
          captureEnd = state.position;
      }
    throwError(state, "unexpected end of the stream within a single quoted scalar");
  }
  function readDoubleQuotedScalar(state, nodeIndent) {
    let captureStart;
    let captureEnd;
    let tmp;
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 34)
      return false;
    state.kind = "scalar";
    state.result = "";
    state.position++;
    captureStart = captureEnd = state.position;
    while ((ch = state.input.charCodeAt(state.position)) !== 0)
      if (ch === 34) {
        captureSegment(state, captureStart, state.position, true);
        state.position++;
        return true;
      } else if (ch === 92) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);
        if (isEol(ch))
          skipSeparationSpace(state, false, nodeIndent);
        else if (ch < 256 && simpleEscapeCheck[ch]) {
          state.result += simpleEscapeMap[ch];
          state.position++;
        } else if ((tmp = escapedHexLen(ch)) > 0) {
          let hexLength = tmp;
          let hexResult = 0;
          for (; hexLength > 0; hexLength--) {
            ch = state.input.charCodeAt(++state.position);
            if ((tmp = fromHexCode(ch)) >= 0)
              hexResult = (hexResult << 4) + tmp;
            else
              throwError(state, "expected hexadecimal character");
          }
          state.result += charFromCodepoint(hexResult);
          state.position++;
        } else
          throwError(state, "unknown escape sequence");
        captureStart = captureEnd = state.position;
      } else if (isEol(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state))
        throwError(state, "unexpected end of the document within a double quoted scalar");
      else {
        state.position++;
        if (!isWhiteSpace(ch))
          captureEnd = state.position;
      }
    throwError(state, "unexpected end of the stream within a double quoted scalar");
  }
  function readFlowCollection(state, nodeIndent) {
    let readNext = true;
    let _line;
    let _lineStart;
    let _pos;
    const _tag = state.tag;
    let _result;
    const _anchor = state.anchor;
    let terminator;
    let isPair;
    let isExplicitPair;
    let isMapping;
    const overridableKeys = /* @__PURE__ */ Object.create(null);
    let keyNode;
    let keyTag;
    let valueNode;
    let ch = state.input.charCodeAt(state.position);
    if (ch === 91) {
      terminator = 93;
      isMapping = false;
      _result = [];
    } else if (ch === 123) {
      terminator = 125;
      isMapping = true;
      _result = {};
    } else
      return false;
    if (state.anchor !== null)
      storeAnchor(state, state.anchor, _result);
    ch = state.input.charCodeAt(++state.position);
    while (ch !== 0) {
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if (ch === terminator) {
        state.position++;
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = isMapping ? "mapping" : "sequence";
        state.result = _result;
        return true;
      } else if (!readNext)
        throwError(state, "missed comma between flow collection entries");
      else if (ch === 44)
        throwError(state, "expected the node content, but found ','");
      keyTag = keyNode = valueNode = null;
      isPair = isExplicitPair = false;
      if (ch === 63) {
        if (isWsOrEol(state.input.charCodeAt(state.position + 1))) {
          isPair = isExplicitPair = true;
          state.position++;
          skipSeparationSpace(state, true, nodeIndent);
        }
      }
      _line = state.line;
      _lineStart = state.lineStart;
      _pos = state.position;
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      keyTag = state.tag;
      keyNode = state.result;
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if ((isExplicitPair || state.line === _line) && ch === 58) {
        isPair = true;
        ch = state.input.charCodeAt(++state.position);
        skipSeparationSpace(state, true, nodeIndent);
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        valueNode = state.result;
      }
      if (isMapping)
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
      else if (isPair)
        _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
      else
        _result.push(keyNode);
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if (ch === 44) {
        readNext = true;
        ch = state.input.charCodeAt(++state.position);
      } else
        readNext = false;
    }
    throwError(state, "unexpected end of the stream within a flow collection");
  }
  function readBlockScalar(state, nodeIndent) {
    let folding;
    let chomping = CHOMPING_CLIP;
    let didReadContent = false;
    let detectedIndent = false;
    let textIndent = nodeIndent;
    let emptyLines = 0;
    let atMoreIndented = false;
    let tmp;
    let ch = state.input.charCodeAt(state.position);
    if (ch === 124)
      folding = false;
    else if (ch === 62)
      folding = true;
    else
      return false;
    state.kind = "scalar";
    state.result = "";
    while (ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
      if (ch === 43 || ch === 45)
        if (CHOMPING_CLIP === chomping)
          chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
        else
          throwError(state, "repeat of a chomping mode identifier");
      else if ((tmp = fromDecimalCode(ch)) >= 0)
        if (tmp === 0)
          throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
        else if (!detectedIndent) {
          textIndent = nodeIndent + tmp - 1;
          detectedIndent = true;
        } else
          throwError(state, "repeat of an indentation width identifier");
      else
        break;
    }
    if (isWhiteSpace(ch)) {
      do
        ch = state.input.charCodeAt(++state.position);
      while (isWhiteSpace(ch));
      if (ch === 35)
        do
          ch = state.input.charCodeAt(++state.position);
        while (!isEol(ch) && ch !== 0);
    }
    while (ch !== 0) {
      readLineBreak(state);
      state.lineIndent = 0;
      ch = state.input.charCodeAt(state.position);
      while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
      if (!detectedIndent && state.lineIndent > textIndent)
        textIndent = state.lineIndent;
      if (isEol(ch)) {
        emptyLines++;
        continue;
      }
      if (!detectedIndent && textIndent === 0)
        throwError(state, "missing indentation for block scalar");
      if (state.lineIndent < textIndent) {
        if (chomping === CHOMPING_KEEP)
          state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        else if (chomping === CHOMPING_CLIP) {
          if (didReadContent)
            state.result += "\n";
        }
        break;
      }
      if (folding)
        if (isWhiteSpace(ch)) {
          atMoreIndented = true;
          state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        } else if (atMoreIndented) {
          atMoreIndented = false;
          state.result += common.repeat("\n", emptyLines + 1);
        } else if (emptyLines === 0) {
          if (didReadContent)
            state.result += " ";
        } else
          state.result += common.repeat("\n", emptyLines);
      else
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      didReadContent = true;
      detectedIndent = true;
      emptyLines = 0;
      const captureStart = state.position;
      while (!isEol(ch) && ch !== 0)
        ch = state.input.charCodeAt(++state.position);
      captureSegment(state, captureStart, state.position, false);
    }
    return true;
  }
  function readBlockSequence(state, nodeIndent) {
    const _tag = state.tag;
    const _anchor = state.anchor;
    const _result = [];
    let detected = false;
    if (state.firstTabInLine !== -1)
      return false;
    if (state.anchor !== null)
      storeAnchor(state, state.anchor, _result);
    let ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      if (state.firstTabInLine !== -1) {
        state.position = state.firstTabInLine;
        throwError(state, "tab characters must not be used in indentation");
      }
      if (ch !== 45)
        break;
      if (!isWsOrEol(state.input.charCodeAt(state.position + 1)))
        break;
      detected = true;
      state.position++;
      if (skipSeparationSpace(state, true, -1)) {
        if (state.lineIndent <= nodeIndent) {
          _result.push(null);
          ch = state.input.charCodeAt(state.position);
          continue;
        }
      }
      const _line = state.line;
      composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
      _result.push(state.result);
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
      if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0)
        throwError(state, "bad indentation of a sequence entry");
      else if (state.lineIndent < nodeIndent)
        break;
    }
    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = "sequence";
      state.result = _result;
      return true;
    }
    return false;
  }
  function readBlockMapping(state, nodeIndent, flowIndent) {
    let allowCompact;
    let _keyLine;
    let _keyLineStart;
    let _keyPos;
    const _tag = state.tag;
    const _anchor = state.anchor;
    const _result = {};
    const overridableKeys = /* @__PURE__ */ Object.create(null);
    let keyTag = null;
    let keyNode = null;
    let valueNode = null;
    let atExplicitKey = false;
    let detected = false;
    if (state.firstTabInLine !== -1)
      return false;
    if (state.anchor !== null)
      storeAnchor(state, state.anchor, _result);
    let ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      if (!atExplicitKey && state.firstTabInLine !== -1) {
        state.position = state.firstTabInLine;
        throwError(state, "tab characters must not be used in indentation");
      }
      const following = state.input.charCodeAt(state.position + 1);
      const _line = state.line;
      if ((ch === 63 || ch === 58) && isWsOrEol(following)) {
        if (ch === 63) {
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = true;
          allowCompact = true;
        } else if (atExplicitKey) {
          atExplicitKey = false;
          allowCompact = true;
        } else
          throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
        state.position += 1;
        ch = following;
      } else {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
        if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true))
          break;
        if (state.line === _line) {
          ch = state.input.charCodeAt(state.position);
          while (isWhiteSpace(ch))
            ch = state.input.charCodeAt(++state.position);
          if (ch === 58) {
            ch = state.input.charCodeAt(++state.position);
            if (!isWsOrEol(ch))
              throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
              keyTag = keyNode = valueNode = null;
            }
            detected = true;
            atExplicitKey = false;
            allowCompact = false;
            keyTag = state.tag;
            keyNode = state.result;
          } else if (detected)
            throwError(state, "can not read an implicit mapping pair; a colon is missed");
          else {
            state.tag = _tag;
            state.anchor = _anchor;
            return true;
          }
        } else if (detected)
          throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
        else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      }
      if (state.line === _line || state.lineIndent > nodeIndent) {
        if (atExplicitKey) {
          _keyLine = state.line;
          _keyLineStart = state.lineStart;
          _keyPos = state.position;
        }
        if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact))
          if (atExplicitKey)
            keyNode = state.result;
          else
            valueNode = state.result;
        if (!atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
      }
      if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0)
        throwError(state, "bad indentation of a mapping entry");
      else if (state.lineIndent < nodeIndent)
        break;
    }
    if (atExplicitKey)
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = "mapping";
      state.result = _result;
    }
    return detected;
  }
  function readTagProperty(state) {
    let isVerbatim = false;
    let isNamed = false;
    let tagHandle;
    let tagName;
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 33)
      return false;
    if (state.tag !== null)
      throwError(state, "duplication of a tag property");
    ch = state.input.charCodeAt(++state.position);
    if (ch === 60) {
      isVerbatim = true;
      ch = state.input.charCodeAt(++state.position);
    } else if (ch === 33) {
      isNamed = true;
      tagHandle = "!!";
      ch = state.input.charCodeAt(++state.position);
    } else
      tagHandle = "!";
    let _position = state.position;
    if (isVerbatim) {
      do
        ch = state.input.charCodeAt(++state.position);
      while (ch !== 0 && ch !== 62);
      if (state.position < state.length) {
        tagName = state.input.slice(_position, state.position);
        ch = state.input.charCodeAt(++state.position);
      } else
        throwError(state, "unexpected end of the stream within a verbatim tag");
    } else {
      while (ch !== 0 && !isWsOrEol(ch)) {
        if (ch === 33)
          if (!isNamed) {
            tagHandle = state.input.slice(_position - 1, state.position + 1);
            if (!PATTERN_TAG_HANDLE.test(tagHandle))
              throwError(state, "named tag handle cannot contain such characters");
            isNamed = true;
            _position = state.position + 1;
          } else
            throwError(state, "tag suffix cannot contain exclamation marks");
        ch = state.input.charCodeAt(++state.position);
      }
      tagName = state.input.slice(_position, state.position);
      if (PATTERN_FLOW_INDICATORS.test(tagName))
        throwError(state, "tag suffix cannot contain flow indicator characters");
    }
    if (tagName && !PATTERN_TAG_URI.test(tagName))
      throwError(state, "tag name cannot contain such characters: " + tagName);
    try {
      tagName = decodeURIComponent(tagName);
    } catch (err) {
      throwError(state, "tag name is malformed: " + tagName);
    }
    if (isVerbatim)
      state.tag = tagName;
    else if (_hasOwnProperty.call(state.tagMap, tagHandle))
      state.tag = state.tagMap[tagHandle] + tagName;
    else if (tagHandle === "!")
      state.tag = "!" + tagName;
    else if (tagHandle === "!!")
      state.tag = "tag:yaml.org,2002:" + tagName;
    else
      throwError(state, 'undeclared tag handle "' + tagHandle + '"');
    return true;
  }
  function readAnchorProperty(state) {
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 38)
      return false;
    if (state.anchor !== null)
      throwError(state, "duplication of an anchor property");
    ch = state.input.charCodeAt(++state.position);
    const _position = state.position;
    while (ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch))
      ch = state.input.charCodeAt(++state.position);
    if (state.position === _position)
      throwError(state, "name of an anchor node must contain at least one character");
    state.anchor = state.input.slice(_position, state.position);
    return true;
  }
  function readAlias(state) {
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 42)
      return false;
    ch = state.input.charCodeAt(++state.position);
    const _position = state.position;
    while (ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch))
      ch = state.input.charCodeAt(++state.position);
    if (state.position === _position)
      throwError(state, "name of an alias node must contain at least one character");
    const alias = state.input.slice(_position, state.position);
    if (!_hasOwnProperty.call(state.anchorMap, alias))
      throwError(state, 'unidentified alias "' + alias + '"');
    state.result = state.anchorMap[alias];
    skipSeparationSpace(state, true, -1);
    return true;
  }
  function tryReadBlockMappingFromProperty(state, propertyStart, nodeIndent, flowIndent) {
    const fallbackState = snapshotState(state);
    beginAnchorTransaction(state);
    restoreState(state, propertyStart);
    state.tag = null;
    state.anchor = null;
    state.kind = null;
    state.result = null;
    if (readBlockMapping(state, nodeIndent, flowIndent) && state.kind === "mapping") {
      commitAnchorTransaction(state);
      return true;
    }
    rollbackAnchorTransaction(state);
    restoreState(state, fallbackState);
    return false;
  }
  function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
    let allowBlockScalars;
    let allowBlockCollections;
    let indentStatus = 1;
    let atNewLine = false;
    let hasContent = false;
    let propertyStart = null;
    let type;
    let flowIndent;
    let blockIndent;
    if (state.depth >= state.maxDepth)
      throwError(state, "nesting exceeded maxDepth (" + state.maxDepth + ")");
    state.depth += 1;
    if (state.listener !== null)
      state.listener("open", state);
    state.tag = null;
    state.anchor = null;
    state.kind = null;
    state.result = null;
    const allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
    if (allowToSeek) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        if (state.lineIndent > parentIndent)
          indentStatus = 1;
        else if (state.lineIndent === parentIndent)
          indentStatus = 0;
        else if (state.lineIndent < parentIndent)
          indentStatus = -1;
      }
    }
    if (indentStatus === 1)
      while (true) {
        const ch = state.input.charCodeAt(state.position);
        const propertyState = snapshotState(state);
        if (atNewLine && (ch === 33 && state.tag !== null || ch === 38 && state.anchor !== null))
          break;
        if (!readTagProperty(state) && !readAnchorProperty(state))
          break;
        if (propertyStart === null)
          propertyStart = propertyState;
        if (skipSeparationSpace(state, true, -1)) {
          atNewLine = true;
          allowBlockCollections = allowBlockStyles;
          if (state.lineIndent > parentIndent)
            indentStatus = 1;
          else if (state.lineIndent === parentIndent)
            indentStatus = 0;
          else if (state.lineIndent < parentIndent)
            indentStatus = -1;
        } else
          allowBlockCollections = false;
      }
    if (allowBlockCollections)
      allowBlockCollections = atNewLine || allowCompact;
    if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
      if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext)
        flowIndent = parentIndent;
      else
        flowIndent = parentIndent + 1;
      blockIndent = state.position - state.lineStart;
      if (indentStatus === 1)
        if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent))
          hasContent = true;
        else {
          const ch = state.input.charCodeAt(state.position);
          if (propertyStart !== null && allowBlockStyles && !allowBlockCollections && ch !== 124 && ch !== 62 && tryReadBlockMappingFromProperty(state, propertyStart, propertyStart.position - propertyStart.lineStart, flowIndent))
            hasContent = true;
          else if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent))
            hasContent = true;
          else if (readAlias(state)) {
            hasContent = true;
            if (state.tag !== null || state.anchor !== null)
              throwError(state, "alias node should not have any properties");
          } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
            hasContent = true;
            if (state.tag === null)
              state.tag = "?";
          }
          if (state.anchor !== null)
            storeAnchor(state, state.anchor, state.result);
        }
      else if (indentStatus === 0)
        hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
    if (state.tag === null) {
      if (state.anchor !== null)
        storeAnchor(state, state.anchor, state.result);
    } else if (state.tag === "?") {
      if (state.result !== null && state.kind !== "scalar")
        throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
      for (let typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
        type = state.implicitTypes[typeIndex];
        if (type.resolve(state.result)) {
          state.result = type.construct(state.result);
          state.tag = type.tag;
          if (state.anchor !== null)
            storeAnchor(state, state.anchor, state.result);
          break;
        }
      }
    } else if (state.tag !== "!") {
      if (_hasOwnProperty.call(state.typeMap[state.kind || "fallback"], state.tag))
        type = state.typeMap[state.kind || "fallback"][state.tag];
      else {
        type = null;
        const typeList = state.typeMap.multi[state.kind || "fallback"];
        for (let typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1)
          if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
            type = typeList[typeIndex];
            break;
          }
      }
      if (!type)
        throwError(state, "unknown tag !<" + state.tag + ">");
      if (state.result !== null && type.kind !== state.kind)
        throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
      if (!type.resolve(state.result, state.tag))
        throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
      else {
        state.result = type.construct(state.result, state.tag);
        if (state.anchor !== null)
          storeAnchor(state, state.anchor, state.result);
      }
    }
    if (state.listener !== null)
      state.listener("close", state);
    state.depth -= 1;
    return state.tag !== null || state.anchor !== null || hasContent;
  }
  function readDocument(state) {
    const documentStart = state.position;
    let hasDirectives = false;
    let ch;
    state.version = null;
    state.checkLineBreaks = state.legacy;
    state.tagMap = /* @__PURE__ */ Object.create(null);
    state.anchorMap = /* @__PURE__ */ Object.create(null);
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
      if (state.lineIndent > 0 || ch !== 37)
        break;
      hasDirectives = true;
      ch = state.input.charCodeAt(++state.position);
      let _position = state.position;
      while (ch !== 0 && !isWsOrEol(ch))
        ch = state.input.charCodeAt(++state.position);
      const directiveName = state.input.slice(_position, state.position);
      const directiveArgs = [];
      if (directiveName.length < 1)
        throwError(state, "directive name must not be less than one character in length");
      while (ch !== 0) {
        while (isWhiteSpace(ch))
          ch = state.input.charCodeAt(++state.position);
        if (ch === 35) {
          do
            ch = state.input.charCodeAt(++state.position);
          while (ch !== 0 && !isEol(ch));
          break;
        }
        if (isEol(ch))
          break;
        _position = state.position;
        while (ch !== 0 && !isWsOrEol(ch))
          ch = state.input.charCodeAt(++state.position);
        directiveArgs.push(state.input.slice(_position, state.position));
      }
      if (ch !== 0)
        readLineBreak(state);
      if (_hasOwnProperty.call(directiveHandlers, directiveName))
        directiveHandlers[directiveName](state, directiveName, directiveArgs);
      else
        throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
    skipSeparationSpace(state, true, -1);
    if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    } else if (hasDirectives)
      throwError(state, "directives end mark is expected");
    composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
    skipSeparationSpace(state, true, -1);
    if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position)))
      throwWarning(state, "non-ASCII line breaks are interpreted as content");
    state.documents.push(state.result);
    if (state.position === state.lineStart && testDocumentSeparator(state)) {
      if (state.input.charCodeAt(state.position) === 46) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
      }
      return;
    }
    if (state.position < state.length - 1)
      throwError(state, "end of the stream or a document separator is expected");
  }
  function loadDocuments(input, options) {
    input = String(input);
    options = options || {};
    if (input.length !== 0) {
      if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13)
        input += "\n";
      if (input.charCodeAt(0) === 65279)
        input = input.slice(1);
    }
    const state = new State(input, options);
    const nullpos = input.indexOf("\0");
    if (nullpos !== -1) {
      state.position = nullpos;
      throwError(state, "null byte is not allowed in input");
    }
    state.input += "\0";
    while (state.input.charCodeAt(state.position) === 32) {
      state.lineIndent += 1;
      state.position += 1;
    }
    while (state.position < state.length - 1)
      readDocument(state);
    return state.documents;
  }
  function loadAll2(input, iterator, options) {
    if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
      options = iterator;
      iterator = null;
    }
    const documents = loadDocuments(input, options);
    if (typeof iterator !== "function")
      return documents;
    for (let index = 0, length = documents.length; index < length; index += 1)
      iterator(documents[index]);
  }
  function load2(input, options) {
    const documents = loadDocuments(input, options);
    if (documents.length === 0)
      return;
    else if (documents.length === 1)
      return documents[0];
    throw new YAMLException2("expected a single document in the stream, but found more");
  }
  module2.exports.loadAll = loadAll2;
  module2.exports.load = load2;
});
var require_dumper = /* @__PURE__ */ __commonJSMin((exports2, module2) => {
  var common = require_common();
  var YAMLException2 = require_exception();
  var DEFAULT_SCHEMA2 = require_default();
  var _toString = Object.prototype.toString;
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
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
  var DEPRECATED_BOOLEANS_SYNTAX = [
    "y",
    "Y",
    "yes",
    "Yes",
    "YES",
    "on",
    "On",
    "ON",
    "n",
    "N",
    "no",
    "No",
    "NO",
    "off",
    "Off",
    "OFF"
  ];
  var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
  function compileStyleMap(schema, map) {
    if (map === null)
      return {};
    const result = {};
    const keys = Object.keys(map);
    for (let index = 0, length = keys.length; index < length; index += 1) {
      let tag = keys[index];
      let style = String(map[tag]);
      if (tag.slice(0, 2) === "!!")
        tag = "tag:yaml.org,2002:" + tag.slice(2);
      const type = schema.compiledTypeMap["fallback"][tag];
      if (type && _hasOwnProperty.call(type.styleAliases, style))
        style = type.styleAliases[style];
      result[tag] = style;
    }
    return result;
  }
  function encodeHex(character) {
    let handle;
    let length;
    const string = character.toString(16).toUpperCase();
    if (character <= 255) {
      handle = "x";
      length = 2;
    } else if (character <= 65535) {
      handle = "u";
      length = 4;
    } else if (character <= 4294967295) {
      handle = "U";
      length = 8;
    } else
      throw new YAMLException2("code point within a string may not be greater than 0xFFFFFFFF");
    return "\\" + handle + common.repeat("0", length - string.length) + string;
  }
  var QUOTING_TYPE_SINGLE = 1;
  var QUOTING_TYPE_DOUBLE = 2;
  function State(options) {
    this.schema = options["schema"] || DEFAULT_SCHEMA2;
    this.indent = Math.max(1, options["indent"] || 2);
    this.noArrayIndent = options["noArrayIndent"] || false;
    this.skipInvalid = options["skipInvalid"] || false;
    this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
    this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
    this.sortKeys = options["sortKeys"] || false;
    this.lineWidth = options["lineWidth"] || 80;
    this.noRefs = options["noRefs"] || false;
    this.noCompatMode = options["noCompatMode"] || false;
    this.condenseFlow = options["condenseFlow"] || false;
    this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
    this.forceQuotes = options["forceQuotes"] || false;
    this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
    this.implicitTypes = this.schema.compiledImplicit;
    this.explicitTypes = this.schema.compiledExplicit;
    this.tag = null;
    this.result = "";
    this.duplicates = [];
    this.usedDuplicates = null;
  }
  function indentString(string, spaces) {
    const ind = common.repeat(" ", spaces);
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
      if (line.length && line !== "\n")
        result += ind;
      result += line;
    }
    return result;
  }
  function generateNextLine(state, level) {
    return "\n" + common.repeat(" ", state.indent * level);
  }
  function testImplicitResolving(state, str) {
    for (let index = 0, length = state.implicitTypes.length; index < length; index += 1)
      if (state.implicitTypes[index].resolve(str))
        return true;
    return false;
  }
  function isWhitespace(c) {
    return c === CHAR_SPACE || c === CHAR_TAB;
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
  function isPlainSafeLast(c) {
    return !isWhitespace(c) && c !== CHAR_COLON;
  }
  function codePointAt(string, pos) {
    const first = string.charCodeAt(pos);
    let second;
    if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
      second = string.charCodeAt(pos + 1);
      if (second >= 56320 && second <= 57343)
        return (first - 55296) * 1024 + second - 56320 + 65536;
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
  function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
    let i;
    let char = 0;
    let prevChar = null;
    let hasLineBreak = false;
    let hasFoldableLine = false;
    const shouldTrackWidth = lineWidth !== -1;
    let previousLineBreak = -1;
    let plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
    if (singleLineOnly || forceQuotes)
      for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
        char = codePointAt(string, i);
        if (!isPrintable(char))
          return STYLE_DOUBLE;
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
        } else if (!isPrintable(char))
          return STYLE_DOUBLE;
        plain = plain && isPlainSafe(char, prevChar, inblock);
        prevChar = char;
      }
      hasFoldableLine = hasFoldableLine || shouldTrackWidth && i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
    }
    if (!hasLineBreak && !hasFoldableLine) {
      if (plain && !forceQuotes && !testAmbiguousType(string))
        return STYLE_PLAIN;
      return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
    }
    if (indentPerLevel > 9 && needIndentIndicator(string))
      return STYLE_DOUBLE;
    if (!forceQuotes)
      return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  function writeScalar(state, string, level, iskey, inblock) {
    state.dump = function() {
      if (string.length === 0)
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
      if (!state.noCompatMode) {
        if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string))
          return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
      }
      const indent = state.indent * Math.max(1, level);
      const lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
      const singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
      function testAmbiguity(string2) {
        return testImplicitResolving(state, string2);
      }
      switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {
        case STYLE_PLAIN:
          return string;
        case STYLE_SINGLE:
          return "'" + string.replace(/'/g, "''") + "'";
        case STYLE_LITERAL:
          return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
        case STYLE_FOLDED:
          return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
        case STYLE_DOUBLE:
          return '"' + escapeString(string, lineWidth) + '"';
        default:
          throw new YAMLException2("impossible error: invalid scalar style");
      }
    }();
  }
  function blockHeader(string, indentPerLevel) {
    const indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
    const clip = string[string.length - 1] === "\n";
    return indentIndicator + (clip && (string[string.length - 2] === "\n" || string === "\n") ? "+" : clip ? "" : "-") + "\n";
  }
  function dropEndingNewline(string) {
    return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
  }
  function foldString(string, width) {
    const lineRe = /(\n+)([^\n]*)/g;
    let result = function() {
      let nextLF = string.indexOf("\n");
      nextLF = nextLF !== -1 ? nextLF : string.length;
      lineRe.lastIndex = nextLF;
      return foldLine(string.slice(0, nextLF), width);
    }();
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
    if (line === "" || line[0] === " ")
      return line;
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
        result += "\n" + line.slice(start, end);
        start = end + 1;
      }
      curr = next;
    }
    result += "\n";
    if (line.length - start > width && curr > start)
      result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
    else
      result += line.slice(start);
    return result.slice(1);
  }
  function escapeString(string) {
    let result = "";
    let char = 0;
    for (let i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      const escapeSeq = ESCAPE_SEQUENCES[char];
      if (!escapeSeq && isPrintable(char)) {
        result += string[i];
        if (char >= 65536)
          result += string[i + 1];
      } else
        result += escapeSeq || encodeHex(char);
    }
    return result;
  }
  function writeFlowSequence(state, level, object) {
    let _result = "";
    const _tag = state.tag;
    for (let index = 0, length = object.length; index < length; index += 1) {
      let value = object[index];
      if (state.replacer)
        value = state.replacer.call(object, String(index), value);
      if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
        if (_result !== "")
          _result += "," + (!state.condenseFlow ? " " : "");
        _result += state.dump;
      }
    }
    state.tag = _tag;
    state.dump = "[" + _result + "]";
  }
  function writeBlockSequence(state, level, object, compact) {
    let _result = "";
    const _tag = state.tag;
    for (let index = 0, length = object.length; index < length; index += 1) {
      let value = object[index];
      if (state.replacer)
        value = state.replacer.call(object, String(index), value);
      if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
        if (!compact || _result !== "")
          _result += generateNextLine(state, level);
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0))
          _result += "-";
        else
          _result += "- ";
        _result += state.dump;
      }
    }
    state.tag = _tag;
    state.dump = _result || "[]";
  }
  function writeFlowMapping(state, level, object) {
    let _result = "";
    const _tag = state.tag;
    const objectKeyList = Object.keys(object);
    for (let index = 0, length = objectKeyList.length; index < length; index += 1) {
      let pairBuffer = "";
      if (_result !== "")
        pairBuffer += ", ";
      if (state.condenseFlow)
        pairBuffer += '"';
      const objectKey = objectKeyList[index];
      let objectValue = object[objectKey];
      if (state.replacer)
        objectValue = state.replacer.call(object, objectKey, objectValue);
      if (!writeNode(state, level, objectKey, false, false))
        continue;
      if (state.dump.length > 1024)
        pairBuffer += "? ";
      pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
      if (!writeNode(state, level, objectValue, false, false))
        continue;
      pairBuffer += state.dump;
      _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = "{" + _result + "}";
  }
  function writeBlockMapping(state, level, object, compact) {
    let _result = "";
    const _tag = state.tag;
    const objectKeyList = Object.keys(object);
    if (state.sortKeys === true)
      objectKeyList.sort();
    else if (typeof state.sortKeys === "function")
      objectKeyList.sort(state.sortKeys);
    else if (state.sortKeys)
      throw new YAMLException2("sortKeys must be a boolean or a function");
    for (let index = 0, length = objectKeyList.length; index < length; index += 1) {
      let pairBuffer = "";
      if (!compact || _result !== "")
        pairBuffer += generateNextLine(state, level);
      const objectKey = objectKeyList[index];
      let objectValue = object[objectKey];
      if (state.replacer)
        objectValue = state.replacer.call(object, objectKey, objectValue);
      if (!writeNode(state, level + 1, objectKey, true, true, true))
        continue;
      const explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
      if (explicitPair)
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0))
          pairBuffer += "?";
        else
          pairBuffer += "? ";
      pairBuffer += state.dump;
      if (explicitPair)
        pairBuffer += generateNextLine(state, level);
      if (!writeNode(state, level + 1, objectValue, true, explicitPair))
        continue;
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0))
        pairBuffer += ":";
      else
        pairBuffer += ": ";
      pairBuffer += state.dump;
      _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = _result || "{}";
  }
  function detectType(state, object, explicit) {
    const typeList = explicit ? state.explicitTypes : state.implicitTypes;
    for (let index = 0, length = typeList.length; index < length; index += 1) {
      const type = typeList[index];
      if ((type.instanceOf || type.predicate) && (!type.instanceOf || typeof object === "object" && object instanceof type.instanceOf) && (!type.predicate || type.predicate(object))) {
        if (explicit)
          if (type.multi && type.representName)
            state.tag = type.representName(object);
          else
            state.tag = type.tag;
        else
          state.tag = "?";
        if (type.represent) {
          const style = state.styleMap[type.tag] || type.defaultStyle;
          let _result;
          if (_toString.call(type.represent) === "[object Function]")
            _result = type.represent(object, style);
          else if (_hasOwnProperty.call(type.represent, style))
            _result = type.represent[style](object, style);
          else
            throw new YAMLException2("!<" + type.tag + '> tag resolver accepts not "' + style + '" style');
          state.dump = _result;
        }
        return true;
      }
    }
    return false;
  }
  function writeNode(state, level, object, block, compact, iskey, isblockseq) {
    state.tag = null;
    state.dump = object;
    if (!detectType(state, object, false))
      detectType(state, object, true);
    const type = _toString.call(state.dump);
    const inblock = block;
    if (block)
      block = state.flowLevel < 0 || state.flowLevel > level;
    const objectOrArray = type === "[object Object]" || type === "[object Array]";
    let duplicateIndex;
    let duplicate;
    if (objectOrArray) {
      duplicateIndex = state.duplicates.indexOf(object);
      duplicate = duplicateIndex !== -1;
    }
    if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0)
      compact = false;
    if (duplicate && state.usedDuplicates[duplicateIndex])
      state.dump = "*ref_" + duplicateIndex;
    else {
      if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex])
        state.usedDuplicates[duplicateIndex] = true;
      if (type === "[object Object]")
        if (block && Object.keys(state.dump).length !== 0) {
          writeBlockMapping(state, level, state.dump, compact);
          if (duplicate)
            state.dump = "&ref_" + duplicateIndex + state.dump;
        } else {
          writeFlowMapping(state, level, state.dump);
          if (duplicate)
            state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      else if (type === "[object Array]")
        if (block && state.dump.length !== 0) {
          if (state.noArrayIndent && !isblockseq && level > 0)
            writeBlockSequence(state, level - 1, state.dump, compact);
          else
            writeBlockSequence(state, level, state.dump, compact);
          if (duplicate)
            state.dump = "&ref_" + duplicateIndex + state.dump;
        } else {
          writeFlowSequence(state, level, state.dump);
          if (duplicate)
            state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      else if (type === "[object String]") {
        if (state.tag !== "?")
          writeScalar(state, state.dump, level, iskey, inblock);
      } else if (type === "[object Undefined]")
        return false;
      else {
        if (state.skipInvalid)
          return false;
        throw new YAMLException2("unacceptable kind of an object to dump " + type);
      }
      if (state.tag !== null && state.tag !== "?") {
        let tagStr = encodeURI(state.tag[0] === "!" ? state.tag.slice(1) : state.tag).replace(/!/g, "%21");
        if (state.tag[0] === "!")
          tagStr = "!" + tagStr;
        else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:")
          tagStr = "!!" + tagStr.slice(18);
        else
          tagStr = "!<" + tagStr + ">";
        state.dump = tagStr + " " + state.dump;
      }
    }
    return true;
  }
  function getDuplicateReferences(object, state) {
    const objects = [];
    const duplicatesIndexes = [];
    inspectNode(object, objects, duplicatesIndexes);
    const length = duplicatesIndexes.length;
    for (let index = 0; index < length; index += 1)
      state.duplicates.push(objects[duplicatesIndexes[index]]);
    state.usedDuplicates = new Array(length);
  }
  function inspectNode(object, objects, duplicatesIndexes) {
    if (object !== null && typeof object === "object") {
      const index = objects.indexOf(object);
      if (index !== -1) {
        if (duplicatesIndexes.indexOf(index) === -1)
          duplicatesIndexes.push(index);
      } else {
        objects.push(object);
        if (Array.isArray(object))
          for (let i = 0, length = object.length; i < length; i += 1)
            inspectNode(object[i], objects, duplicatesIndexes);
        else {
          const objectKeyList = Object.keys(object);
          for (let i = 0, length = objectKeyList.length; i < length; i += 1)
            inspectNode(object[objectKeyList[i]], objects, duplicatesIndexes);
        }
      }
    }
  }
  function dump2(input, options) {
    options = options || {};
    const state = new State(options);
    if (!state.noRefs)
      getDuplicateReferences(input, state);
    let value = input;
    if (state.replacer)
      value = state.replacer.call({ "": value }, "", value);
    if (writeNode(state, 0, value, true, true))
      return state.dump + "\n";
    return "";
  }
  module2.exports.dump = dump2;
});
var import_js_yaml = /* @__PURE__ */ __toESM2((/* @__PURE__ */ __commonJSMin((exports2, module2) => {
  var loader = require_loader();
  var dumper = require_dumper();
  function renamed(from, to) {
    return function() {
      throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
    };
  }
  module2.exports.Type = require_type();
  module2.exports.Schema = require_schema();
  module2.exports.FAILSAFE_SCHEMA = require_failsafe();
  module2.exports.JSON_SCHEMA = require_json();
  module2.exports.CORE_SCHEMA = require_core();
  module2.exports.DEFAULT_SCHEMA = require_default();
  module2.exports.load = loader.load;
  module2.exports.loadAll = loader.loadAll;
  module2.exports.dump = dumper.dump;
  module2.exports.YAMLException = require_exception();
  module2.exports.types = {
    binary: require_binary(),
    float: require_float(),
    map: require_map(),
    null: require_null(),
    pairs: require_pairs(),
    set: require_set(),
    timestamp: require_timestamp(),
    bool: require_bool(),
    int: require_int(),
    merge: require_merge(),
    omap: require_omap(),
    seq: require_seq(),
    str: require_str()
  };
  module2.exports.safeLoad = renamed("safeLoad", "load");
  module2.exports.safeLoadAll = renamed("safeLoadAll", "loadAll");
  module2.exports.safeDump = renamed("safeDump", "dump");
}))(), 1);
var { Type, Schema, FAILSAFE_SCHEMA, JSON_SCHEMA, CORE_SCHEMA, DEFAULT_SCHEMA, load, loadAll, dump, YAMLException, types, safeLoad, safeLoadAll, safeDump } = import_js_yaml.default;
var index_vite_proxy_tmp_default = import_js_yaml.default;

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
    quotingType: '"',
    // 字符串用双引号（保留 emoji）
    forceQuotes: false,
    sortKeys: false
    // 我们自己控制顺序
  });
  return `${FM_DELIMITER}
${yamlStr}${FM_DELIMITER}`;
}
function parseFrontmatter(content) {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith(FM_DELIMITER)) {
    return { frontmatter: null, body: content };
  }
  const rest = trimmed.slice(FM_DELIMITER.length);
  const secondDelim = rest.indexOf("\n" + FM_DELIMITER);
  if (secondDelim === -1) {
    return { frontmatter: null, body: content };
  }
  const yamlBlock = rest.slice(0, secondDelim);
  const body = rest.slice(secondDelim + FM_DELIMITER.length + 1).replace(/^\n+/, "");
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
    if (latest)
      extra.push(path.join(nvmBase, latest.name, "bin"));
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
    if (found)
      return found;
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
    if (!cli)
      continue;
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
      if (ver)
        return { path: cli, version: ver };
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
  if (!trimmed.startsWith("{"))
    return stdout;
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
  if (wikiMatch)
    return { node_token: wikiMatch[1] };
  const docxMatch = url.match(/\/docx\/([A-Za-z0-9]+)/);
  if (docxMatch)
    return { obj_token: docxMatch[1] };
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
    if (objToken)
      return { obj_token: objToken, title };
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
    if (!child.name || child.name.startsWith("."))
      continue;
    if (!child.children?.length)
      continue;
    const rootMapping = mappings.find((m) => m.obPath === child.name);
    if (!rootMapping)
      continue;
    const feishuChildren = listWikiChildren(spaceId, rootMapping.feishuNodeToken);
    for (const obSub of child.children) {
      if (!obSub.name || obSub.name.startsWith("."))
        continue;
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
  (globalThis.crypto ?? require("crypto")).webcrypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// src/server.ts
var http = __toESM(require("http"), 1);
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
      if (EXCLUDE.has(name) || name.startsWith("."))
        return;
      dirs.push({ path: folder.path, label: name, depth });
    }
    for (const child of folder.children) {
      if (child instanceof import_obsidian3.TFolder)
        walk(child, depth + 1);
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
    if (v === void 0 || v === null || v === "")
      continue;
    if (Array.isArray(v) && v.length === 0)
      continue;
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
    if (dir.startsWith(dirHint))
      return tag;
  }
  if (dir.includes("\u77E5\u8BC6\u6C60") || dir.includes("\u{1F5C3}")) {
    if (dir.includes("L") || dir.includes("\u9886\u57DF"))
      return "L";
    if (dir.includes("Q") || dir.includes("\u7075\u611F"))
      return "Q";
    if (dir.includes("J") || dir.includes("\u6280\u80FD"))
      return "J";
    return "Z";
  }
  if (dir.includes("\u8F93\u51FA") || dir.includes("1\uFE0F\u20E3"))
    return "X";
  if (dir.includes("\u8F93\u5165") || dir.includes("0\uFE0F\u20E3"))
    return "S";
  return "S";
}
async function nextSequence(app, dir, tag) {
  const folder = app.vault.getAbstractFileByPath(dir);
  if (!(folder instanceof TFolder))
    return 1;
  let maxSeq = 0;
  for (const child of folder.children) {
    if (!(child instanceof TFile) || !child.name.endsWith(".md"))
      continue;
    const match = child.name.match(CODE_RE);
    if (match && match[3] === tag) {
      const seq = parseInt(match[4], 10);
      if (seq > maxSeq)
        maxSeq = seq;
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
            if (seq > maxSeq)
              maxSeq = seq;
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
  if (!(file instanceof TFile))
    return void 0;
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
  if (!(folder instanceof TFolder))
    return { total: 0, assigned: 0 };
  let assigned = 0;
  let total = 0;
  for (const child of folder.children) {
    if (!(child instanceof TFile) || !child.name.endsWith(".md"))
      continue;
    total++;
    try {
      const result = await assignEncoding(app, child.path, dir);
      if (result)
        assigned++;
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
        if (titleIdMatch)
          objToken = titleIdMatch[1];
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
    if (file.path.startsWith(".obsidian") || file.path.startsWith(".feishu-sync"))
      continue;
    try {
      const content = await app.vault.read(file);
      if (!content.includes("feishu_id:"))
        continue;
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch)
        continue;
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
  if (!dir || dir === "." || dir === "/")
    return;
  const existing = app.vault.getAbstractFileByPath(dir);
  if (existing instanceof import_obsidian4.TFolder)
    return;
  try {
    await app.vault.createFolder(dir);
  } catch {
    const parent = dir.split("/").slice(0, -1).join("/");
    if (parent)
      await ensureFolder(app, parent);
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
  if (!raw)
    return "";
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
  if (!out.\u5173\u952E\u8BCD)
    out.\u5173\u952E\u8BCD = "\u7F51\u9875\u526A\u5B58";
  if (!out.\u6982\u8FF0)
    out.\u6982\u8FF0 = `\u7F51\u9875\u526A\u5B58\uFF1A${fallback.title}`;
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
  if (explicit)
    return Number(explicit);
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
  if (!text)
    return "\uFF08\u65E0\u53EF\u89C1\u6B63\u6587\uFF0C\u5DF2\u4FDD\u5B58\u9875\u9762\u6807\u9898\u548C\u6765\u6E90\u3002\uFF09";
  return text;
}
function draftKeywords(text) {
  const words = Array.from(new Set(
    text.replace(/[^\p{Script=Han}\p{Letter}\p{Number}\s_-]/gu, " ").split(/\s+/).map((word) => word.trim()).filter((word) => word.length >= 2 && word.length <= 20)
  ));
  return words.slice(0, 6).join("\u3001");
}
async function ensureFolder2(app, dir) {
  if (!dir || dir === "." || dir === "/")
    return;
  const existing = app.vault.getAbstractFileByPath(dir);
  if (existing instanceof import_obsidian5.TFolder)
    return;
  const parent = dir.split("/").slice(0, -1).join("/");
  if (parent)
    await ensureFolder2(app, parent);
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
    if (file.path.startsWith(".obsidian") || file.path.startsWith(".feishu-sync"))
      continue;
    try {
      const content = await app.vault.read(file);
      if (!content.includes("feishu_id:"))
        continue;
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch)
        continue;
      const idMatch = fmMatch[1].match(/feishu_id:\s*["']?([A-Za-z0-9]+)/);
      if (idMatch && idMatch[1] === feishuId)
        return file;
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
      if (f instanceof TFile)
        file = f;
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
    if (file.path.startsWith(".obsidian") || file.path.startsWith(".feishu-sync"))
      continue;
    try {
      const content = await app.vault.read(file);
      if (!content.includes("feishu_id:"))
        continue;
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch)
        continue;
      const idMatch = fmMatch[1].match(/feishu_id:\s*["']?([A-Za-z0-9]+)/);
      if (idMatch && idMatch[1] === feishuId)
        return file;
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
      if (!dir)
        return;
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
          if (result.action === "pushed")
            pushed++;
          else
            skipped++;
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
      if (!dir)
        return;
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
      if (!(file instanceof import_obsidian7.TFile) || file.extension !== "md")
        return;
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
  if (!url)
    return;
  const parsed = resolveNodeTokenFromUrl(url);
  const nodeToken = parsed.node_token || parsed.obj_token;
  if (!nodeToken)
    return;
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
    if (match?.[1])
      return match[1].trim();
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
      if (event.key !== "Enter")
        return;
      event.preventDefault();
      const value = this.inputEl.value.trim();
      if (!value)
        return;
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
var path2 = __toESM(require("path"), 1);
var CACHE_DIR = ".feishu-sync/cache";
function registerImageRenderer(plugin) {
  if (!import_obsidian8.Platform.isDesktopApp)
    return;
  const { adapter } = plugin.app.vault;
  plugin.registerMarkdownPostProcessor(async (el, ctx) => {
    const imgs = el.querySelectorAll("img");
    for (const img of Array.from(imgs)) {
      const src = img.getAttribute("src") || "";
      if (!src.startsWith("feishu://"))
        continue;
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
  if (resolving.has(token))
    return resolving.get(token);
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
  if (mode === "never")
    return;
  const { adapter } = plugin.app.vault;
  if (!await adapter.exists(CACHE_DIR))
    return;
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
  (*! js-yaml 4.2.0 https://github.com/nodeca/js-yaml @license MIT *)
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzLnRzIiwgInNyYy9zZXR0aW5nc1RhYi50cyIsICJzcmMvbGFyay9jbGkudHMiLCAiLi4vc2hhcmVkL3NyYy90eXBlcy50cyIsICIuLi9zaGFyZWQvc3JjL3Byb3RvY29sLnRzIiwgIi4uL3NoYXJlZC9zcmMvaGFzaC50cyIsICIuLi9zaGFyZWQvc3JjL2ZpbGVuYW1lLnRzIiwgIi4uL3NoYXJlZC9zcmMvaW1hZ2UudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL2NvbW1vbi5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9saWIvZXhjZXB0aW9uLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9zbmlwcGV0LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi90eXBlLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9zY2hlbWEuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL3R5cGUvc3RyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi90eXBlL3NlcS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9saWIvdHlwZS9tYXAuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL3NjaGVtYS9mYWlsc2FmZS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9saWIvdHlwZS9udWxsLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi90eXBlL2Jvb2wuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL3R5cGUvaW50LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi90eXBlL2Zsb2F0LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9zY2hlbWEvanNvbi5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9saWIvc2NoZW1hL2NvcmUuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL3R5cGUvdGltZXN0YW1wLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi90eXBlL21lcmdlLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi90eXBlL2JpbmFyeS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9saWIvdHlwZS9vbWFwLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi90eXBlL3BhaXJzLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi90eXBlL3NldC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9saWIvc2NoZW1hL2RlZmF1bHQuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL2xvYWRlci5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9saWIvZHVtcGVyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2luZGV4LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9pbmRleF92aXRlX3Byb3h5LnRtcC5tanMiLCAiLi4vc2hhcmVkL3NyYy95YW1sLnRzIiwgIi4uL3NoYXJlZC9zcmMvY2FsbG91dC50cyIsICJzcmMvbWFwcGluZy50cyIsICJzcmMvc2VydmVyLnRzIiwgInNyYy9oYW5kbGVycy9zdGF0dXNIYW5kbGVyLnRzIiwgInNyYy9oYW5kbGVycy90cmVlSGFuZGxlci50cyIsICJzcmMvaGFuZGxlcnMvZmV0Y2hIYW5kbGVyLnRzIiwgInNyYy9maWxlaW8vd3JpdGVyLnRzIiwgInNyYy9hdXRvUmVuYW1lLnRzIiwgInNyYy9oYW5kbGVycy9jbGlwSGFuZGxlci50cyIsICJzcmMvaGFuZGxlcnMvZXhpc3RzSGFuZGxlci50cyIsICJzcmMvaGFuZGxlcnMvcHVzaGJhY2tIYW5kbGVyLnRzIiwgInNyYy9jb21tYW5kcy50cyIsICJzcmMvZmV0Y2hFbnRyeXBvaW50cy50cyIsICJzcmMvaW1hZ2VSZW5kZXIudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogT0IgXHU2M0QyXHU0RUY2XHU1MTY1XHU1M0UzXHUzMDAyXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzQuMVx1RkYwOFx1NkEyMVx1NTc1NyBCXHVGRjA5XHUzMDAyXG4gKlxuICogXHU4MDRDXHU4RDIzXHVGRjFBXG4gKiAxLiBcdTUyQTBcdThGN0RcdThCQkVcdTdGNkVcdUZGMDhcdTk5OTZcdTZCMjFcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTBcdTU0MkZcdTUyQThcdTRFRTRcdTcyNENcdUZGMDlcbiAqIDIuIFx1NjNBMlx1NkQ0QiBsYXJrLWNsaVxuICogMy4gXHU1NDJGXHU1MkE4XHU2NzJDXHU1NzMwIEhUVFAgc2VydmVyXHVGRjBDXHU2Q0U4XHU1MThDXHU4REVGXHU3NTMxXG4gKiA0LiBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcdTMwMDFcdThCQkVcdTdGNkVcdTk4NzVcdTMwMDFcdTU2RkVcdTcyNDdcdTZFMzJcdTY3RDNcdTMwMDFcdTUyMjBcdTk2NjRcdTc2RDFcdTU0MkNcbiAqIDUuIFx1NTM3OFx1OEY3RFx1NjVGNlx1NTA1Q1x1NkI2MiBzZXJ2ZXJcbiAqL1xuaW1wb3J0IHsgUGx1Z2luLCBOb3RpY2UgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQge1xuICBERUZBVUxUX1NFVFRJTkdTLFxuICB0eXBlIEZlaXNodVN5bmNTZXR0aW5ncyxcbiAgdHlwZSBQbHVnaW5TdGF0ZSxcbiAgdHlwZSBSZWNlbnRTeW5jLFxufSBmcm9tICcuL3NldHRpbmdzLmpzJztcbmltcG9ydCB7IEZlaXNodVN5bmNTZXR0aW5nVGFiIH0gZnJvbSAnLi9zZXR0aW5nc1RhYi5qcyc7XG5pbXBvcnQgeyBzdGFydFNlcnZlciwgdHlwZSBTZXJ2ZXJEZXBzLCB0eXBlIFJvdXRlSGFuZGxlciB9IGZyb20gJy4vc2VydmVyLmpzJztcbmltcG9ydCB7IHJlc29sdmVDbGkgfSBmcm9tICcuL2xhcmsvY2xpLmpzJztcbmltcG9ydCB7IGNyZWF0ZVN0YXR1c0hhbmRsZXIgfSBmcm9tICcuL2hhbmRsZXJzL3N0YXR1c0hhbmRsZXIuanMnO1xuaW1wb3J0IHsgY3JlYXRlVHJlZUhhbmRsZXIgfSBmcm9tICcuL2hhbmRsZXJzL3RyZWVIYW5kbGVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZUZldGNoSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlcnMvZmV0Y2hIYW5kbGVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZUNsaXBIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9jbGlwSGFuZGxlci5qcyc7XG5pbXBvcnQgeyBjcmVhdGVFeGlzdHNIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9leGlzdHNIYW5kbGVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZVB1c2hiYWNrSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlcnMvcHVzaGJhY2tIYW5kbGVyLmpzJztcbmltcG9ydCB7IHJlZ2lzdGVyQ29tbWFuZHMgfSBmcm9tICcuL2NvbW1hbmRzLmpzJztcbmltcG9ydCB7IHJlZ2lzdGVyRmV0Y2hFbnRyeXBvaW50cyB9IGZyb20gJy4vZmV0Y2hFbnRyeXBvaW50cy5qcyc7XG5pbXBvcnQgeyByZWdpc3RlckltYWdlUmVuZGVyZXIsIGNsZWFudXBJbWFnZUNhY2hlIH0gZnJvbSAnLi9pbWFnZVJlbmRlci5qcyc7XG5pbXBvcnQgeyByZWZyZXNoTWFwcGluZyB9IGZyb20gJy4vbWFwcGluZy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBGZWlzaHVTeW5jUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgc2V0dGluZ3MhOiBGZWlzaHVTeW5jU2V0dGluZ3M7XG4gIHN0YXRlITogUGx1Z2luU3RhdGU7XG4gIHByaXZhdGUgc3RvcFNlcnZlcj86ICgpID0+IFByb21pc2U8dm9pZD47XG5cbiAgYXN5bmMgb25sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cbiAgICAvLyBcdThGRDBcdTg4NENcdTY1RjZcdTcyQjZcdTYwMDFcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbGFya0NsaVJlc29sdmVkOiAnJyxcbiAgICAgIGxhcmtDbGlWZXJzaW9uOiAnJyxcbiAgICAgIHNlcnZlclJ1bm5pbmc6IGZhbHNlLFxuICAgICAgcmVjZW50U3luY3M6IFtdIGFzIFJlY2VudFN5bmNbXSxcbiAgICB9O1xuXG4gICAgLy8gXHU5OTk2XHU2QjIxXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXHU1NDJGXHU1MkE4XHU0RUU0XHU3MjRDXG4gICAgaWYgKCF0aGlzLnNldHRpbmdzLnN5bmNUb2tlbikge1xuICAgICAgdGhpcy5zZXR0aW5ncy5zeW5jVG9rZW4gPSBnZW5lcmF0ZVRva2VuKCk7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncygpO1xuICAgIH1cblxuICAgIC8vIFx1NjNBMlx1NkQ0QiBsYXJrLWNsaVxuICAgIGNvbnN0IGxhcmtJbmZvID0gcmVzb2x2ZUNsaSh0aGlzLnNldHRpbmdzLmxhcmtDbGlQYXRoIHx8IHVuZGVmaW5lZCk7XG4gICAgaWYgKGxhcmtJbmZvKSB7XG4gICAgICB0aGlzLnN0YXRlLmxhcmtDbGlSZXNvbHZlZCA9IGxhcmtJbmZvLnBhdGg7XG4gICAgICB0aGlzLnN0YXRlLmxhcmtDbGlWZXJzaW9uID0gbGFya0luZm8udmVyc2lvbjtcbiAgICAgIHByb2Nlc3MuZW52Ll9fTEFSS19DTElfUEFUSF9fID0gbGFya0luZm8ucGF0aDtcbiAgICAgIGNvbnNvbGUubG9nKGBbc3luY10gbGFyay1jbGk6ICR7bGFya0luZm8udmVyc2lvbn0gQCAke2xhcmtJbmZvLnBhdGh9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybignW3N5bmNdIGxhcmstY2xpIG5vdCBmb3VuZCAobmVlZCA+PSAxLjAuNTIpJyk7XG4gICAgfVxuXG4gICAgLy8gXHU4QkJFXHU3RjZFXHU5ODc1XG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBGZWlzaHVTeW5jU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xuXG4gICAgLy8gXHU1NDdEXHU0RUU0XG4gICAgcmVnaXN0ZXJDb21tYW5kcyh0aGlzKTtcbiAgICByZWdpc3RlckZldGNoRW50cnlwb2ludHModGhpcyk7XG5cbiAgICAvLyBcdTU2RkVcdTcyNDdcdTZFMzJcdTY3RDNcbiAgICByZWdpc3RlckltYWdlUmVuZGVyZXIodGhpcyk7XG5cbiAgICAvLyBcdTU0MkZcdTUyQTggSFRUUCBzZXJ2ZXJcbiAgICBhd2FpdCB0aGlzLnN0YXJ0SHR0cFNlcnZlcigpO1xuXG4gICAgLy8gcmliYm9uIFx1NTZGRVx1NjgwN1xuICAgIHRoaXMuYWRkUmliYm9uSWNvbigncmVmcmVzaC1jdycsICdcdTk4REVcdTRFNjZcdTU0MENcdTZCNjUnLCBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCByZWZyZXNoTWFwcGluZyh0aGlzLmFwcCwgdGhpcy5zZXR0aW5ncy5zcGFjZUlkKTtcbiAgICB9KTtcblxuICAgIC8vIFx1NTQyRlx1NTJBOFx1NjVGNlx1NkUwNVx1NzQwNlx1NEUwMFx1NkIyMVx1OEZDN1x1NjcxRlx1N0YxM1x1NUI1OFxuICAgIHRoaXMucmVnaXN0ZXJFdmVudChcbiAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbignbGF5b3V0LXJlYWR5JywgKCkgPT4ge1xuICAgICAgICBjbGVhbnVwSW1hZ2VDYWNoZSh0aGlzLCB0aGlzLnNldHRpbmdzLmNhY2hlQ2xlYW51cCkuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgfSksXG4gICAgKTtcblxuICAgIGNvbnNvbGUubG9nKGBbc3luY10gZmVpc2h1LXN5bmMgbG9hZGVkIG9uIHBvcnQgJHt0aGlzLnNldHRpbmdzLnBvcnR9YCk7XG4gIH1cblxuICBhc3luYyBvbnVubG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5zdG9wU2VydmVyKSB7XG4gICAgICBhd2FpdCB0aGlzLnN0b3BTZXJ2ZXIoKTtcbiAgICAgIHRoaXMuc3RvcFNlcnZlciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ1tzeW5jXSBmZWlzaHUtc3luYyB1bmxvYWRlZCcpO1xuICB9XG5cbiAgYXN5bmMgbG9hZFNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuICB9XG5cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cblxuICAvKiogXHU1NDJGXHU1MkE4IEhUVFAgc2VydmVyXHVGRjBDXHU2Q0U4XHU1MThDXHU2MjQwXHU2NzA5XHU4REVGXHU3NTMxXHUzMDAyICovXG4gIHByaXZhdGUgYXN5bmMgc3RhcnRIdHRwU2VydmVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJvdXRlcyA9IG5ldyBNYXA8c3RyaW5nLCBSb3V0ZUhhbmRsZXI+KCk7XG5cbiAgICBjb25zdCBkZXBzOiBTZXJ2ZXJEZXBzID0ge1xuICAgICAgdmFsaWRhdGVUb2tlbjogKHRva2VuKSA9PiB0b2tlbiA9PT0gdGhpcy5zZXR0aW5ncy5zeW5jVG9rZW4sXG4gICAgICByb3V0ZXMsXG4gICAgfTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1OERFRlx1NzUzMVxuICAgIHJvdXRlcy5zZXQoJy9zdGF0dXMnLCBjcmVhdGVTdGF0dXNIYW5kbGVyKHRoaXMubWFuaWZlc3QudmVyc2lvbiwgdGhpcy5hcHAudmF1bHQuZ2V0TmFtZSgpLCB0aGlzLnN0YXRlKSk7XG4gICAgcm91dGVzLnNldCgnL3RyZWUnLCBjcmVhdGVUcmVlSGFuZGxlcih0aGlzLmFwcCkpO1xuICAgIHJvdXRlcy5zZXQoJy9mZXRjaCcsIGNyZWF0ZUZldGNoSGFuZGxlcih7XG4gICAgICBhcHA6IHRoaXMuYXBwLFxuICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3MsXG4gICAgICBzdGF0ZTogdGhpcy5zdGF0ZSxcbiAgICAgIG5vdGljZTogKG0pID0+IG5ldyBOb3RpY2UobSksXG4gICAgfSkpO1xuICAgIHJvdXRlcy5zZXQoJy9jbGlwJywgY3JlYXRlQ2xpcEhhbmRsZXIoe1xuICAgICAgYXBwOiB0aGlzLmFwcCxcbiAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxuICAgICAgbm90aWNlOiAobSkgPT4gbmV3IE5vdGljZShtKSxcbiAgICB9KSk7XG4gICAgcm91dGVzLnNldCgnL2V4aXN0cycsIGNyZWF0ZUV4aXN0c0hhbmRsZXIodGhpcy5hcHApKTtcbiAgICByb3V0ZXMuc2V0KCcvcHVzaGJhY2snLCBjcmVhdGVQdXNoYmFja0hhbmRsZXIoe1xuICAgICAgYXBwOiB0aGlzLmFwcCxcbiAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxuICAgICAgbm90aWNlOiAobSkgPT4gbmV3IE5vdGljZShtKSxcbiAgICB9KSk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdG9wIH0gPSBhd2FpdCBzdGFydFNlcnZlcih0aGlzLnNldHRpbmdzLnBvcnQsIGRlcHMpO1xuICAgICAgdGhpcy5zdG9wU2VydmVyID0gc3RvcDtcbiAgICAgIHRoaXMuc3RhdGUuc2VydmVyUnVubmluZyA9IHRydWU7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zdCBtc2cgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycik7XG4gICAgICBuZXcgTm90aWNlKGBcdTI3NEMgSFRUUCBzZXJ2ZXIgXHU1NDJGXHU1MkE4XHU1OTMxXHU4RDI1XHVGRjA4XHU3QUVGXHU1M0UzICR7dGhpcy5zZXR0aW5ncy5wb3J0fVx1RkYwOVx1RkYxQSR7bXNnfWApO1xuICAgICAgY29uc29sZS5lcnJvcignW3N5bmNdIHNlcnZlciBzdGFydCBmYWlsZWQ6JywgZXJyKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqIFx1NzUxRlx1NjIxMCAzMiBcdTVCNTdcdTgyODIgaGV4IFx1NEVFNFx1NzI0Q1x1MzAwMiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVUb2tlbigpOiBzdHJpbmcge1xuICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KDMyKTtcbiAgKGdsb2JhbFRoaXMuY3J5cHRvIGFzIENyeXB0bykuZ2V0UmFuZG9tVmFsdWVzKGJ5dGVzKTtcbiAgcmV0dXJuIEFycmF5LmZyb20oYnl0ZXMpLm1hcChiID0+IGIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xufVxuXG4vLyBPYnNpZGlhbiBcdTYzRDJcdTRFRjZcdTUxNjVcdTUzRTNcdUZGMUFcdTVGQzVcdTk4N0JcdTlFRDhcdThCQTRcdTVCRkNcdTUxRkEgUGx1Z2luIFx1NUI1MFx1N0M3QlxuZXhwb3J0IGRlZmF1bHQgRmVpc2h1U3luY1BsdWdpbjtcbiIsICIvKipcbiAqIE9CIFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1NjNBNVx1NTNFMyArIFx1OUVEOFx1OEJBNFx1NTAzQ1x1MzAwMlxuICogXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzEwXHVGRjA4U2V0dGluZ3NUYWJcdUZGMDlcdTMwMDJcbiAqL1xuaW1wb3J0IHR5cGUgeyBUcmVlTm9kZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmVpc2h1U3luY1NldHRpbmdzIHtcbiAgLyoqIFx1NjcyQ1x1NTczMCBIVFRQIHNlcnZlciBcdTdBRUZcdTUzRTNcdUZGMDhcdTlFRDhcdThCQTQgNDU2N1x1RkYwOVx1MzAwMiAqL1xuICBwb3J0OiBudW1iZXI7XG4gIC8qKiBcdTU0MkZcdTUyQThcdTRFRTRcdTcyNENcdUZGMDgzMiBcdTVCNTdcdTgyODIgaGV4XHVGRjBDXHU5OTk2XHU2QjIxXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXHVGRjA5XHUzMDAyICovXG4gIHN5bmNUb2tlbjogc3RyaW5nO1xuICAvKiogbGFyay1jbGkgXHU4REVGXHU1Rjg0XHVGRjA4XHU3QTdBPVx1ODFFQVx1NTJBOFx1NjNBMlx1NkQ0Qlx1RkYwOVx1MzAwMiAqL1xuICBsYXJrQ2xpUGF0aDogc3RyaW5nO1xuICAvKiogXHU5RUQ4XHU4QkE0XHU4NDNEXHU1NzMwXHU3NkVFXHU1RjU1XHVGRjA4XHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1RkYwOVx1MzAwMiAqL1xuICBkZWZhdWx0RGlyOiBzdHJpbmc7XG4gIC8qKiBcdTgxRUFcdTUyQThcdTg5RTZcdTUzRDEgYXV0by1yZW5hbWUgXHU3RjE2XHU3ODAxXHU1MjA2XHU5MTREXHUzMDAyICovXG4gIGF1dG9SZW5hbWU6IGJvb2xlYW47XG4gIC8qKiBcdTgxRUFcdTUyQThcdTc2N0JcdThCQjBcdTUyMjBcdTk2NjRcdUZGMDhcdTUxOTlcdTk4REVcdTRFNjZcdTU5MUFcdTdFRjRcdTg4NjhcdTY4M0NcdUZGMDlcdTMwMDIgKi9cbiAgYXV0b0RlbGV0ZVJlZ2lzdHJ5OiBib29sZWFuO1xuICAvKiogXHU1NkZFXHU3MjQ3XHU3RjEzXHU1QjU4XHU2RTA1XHU3NDA2XHU1NDY4XHU2NzFGXHUzMDAyICovXG4gIGNhY2hlQ2xlYW51cDogJ2RhaWx5JyB8ICd3ZWVrbHknIHwgJ21vbnRobHknIHwgJ25ldmVyJztcbiAgLyoqIFx1NEZERFx1NzU1OVx1ODhDNVx1OTk3MFx1NTZGRVx1NzI0N1x1MzAwMiAqL1xuICBrZWVwRGVjb3JhdGl2ZUltYWdlczogYm9vbGVhbjtcbiAgLyoqIFx1OThERVx1NEU2Nlx1NzdFNVx1OEJDNlx1NUU5MyBzcGFjZV9pZFx1RkYwOFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1NzUyOFx1RkYwOVx1MzAwMiAqL1xuICBzcGFjZUlkOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBGZWlzaHVTeW5jU2V0dGluZ3MgPSB7XG4gIHBvcnQ6IDQ1NjcsXG4gIHN5bmNUb2tlbjogJycsXG4gIGxhcmtDbGlQYXRoOiAnJyxcbiAgZGVmYXVsdERpcjogJzBcdUZFMEZcdTIwRTNcdThGOTNcdTUxNjUnLFxuICBhdXRvUmVuYW1lOiB0cnVlLFxuICBhdXRvRGVsZXRlUmVnaXN0cnk6IHRydWUsXG4gIGNhY2hlQ2xlYW51cDogJ3dlZWtseScsXG4gIGtlZXBEZWNvcmF0aXZlSW1hZ2VzOiB0cnVlLFxuICBzcGFjZUlkOiAnNzY1MTMxNDE1MDA2MDA2NzgwMycsXG59O1xuXG4vKiogXHU2M0QyXHU0RUY2XHU4RkQwXHU4ODRDXHU2NUY2XHU3MkI2XHU2MDAxXHVGRjA4XHU0RTBEXHU2MzAxXHU0RTQ1XHU1MzE2XHVGRjA5XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFBsdWdpblN0YXRlIHtcbiAgLyoqIGxhcmstY2xpIFx1NUI5RVx1OTY0NVx1OERFRlx1NUY4NFx1RkYwOFx1NjNBMlx1NkQ0Qi9cdThCQkVcdTdGNkVcdTU0MEVcdTc2ODRcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMDlcdTMwMDIgKi9cbiAgbGFya0NsaVJlc29sdmVkOiBzdHJpbmc7XG4gIC8qKiBsYXJrLWNsaSBcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMDhcdTU5ODIgXCIxLjAuNTJcIlx1RkYwOVx1MzAwMiAqL1xuICBsYXJrQ2xpVmVyc2lvbjogc3RyaW5nO1xuICAvKiogSFRUUCBzZXJ2ZXIgXHU2NjJGXHU1NDI2XHU2QjYzXHU1NzI4XHU4RkQwXHU4ODRDXHUzMDAyICovXG4gIHNlcnZlclJ1bm5pbmc6IGJvb2xlYW47XG4gIC8qKiBcdTY3MDBcdThGRDFcdTU0MENcdTZCNjVcdThCQjBcdTVGNTVcdUZGMDhcdTUxODVcdTVCNThcdTRFMkRcdUZGMENcdTY3MDBcdTU5MUEgNTAgXHU2NzYxXHVGRjA5XHUzMDAyICovXG4gIHJlY2VudFN5bmNzOiBSZWNlbnRTeW5jW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVjZW50U3luYyB7XG4gIHRpbWU6IHN0cmluZztcbiAgbm9kZV90b2tlbjogc3RyaW5nO1xuICB0aXRsZTogc3RyaW5nO1xuICBwYXRoOiBzdHJpbmc7XG4gIGFjdGlvbjogJ2NyZWF0ZWQnIHwgJ3VwZGF0ZWQnIHwgJ2Vycm9yJztcbiAgZXJyb3I/OiBzdHJpbmc7XG59XG4iLCAiLyoqXG4gKiBPQiBcdTYzRDJcdTRFRjZcdThCQkVcdTdGNkVcdTc1NENcdTk3NjJcdTMwMDJcdTRGOURcdTYzNkVcdTY1QjlcdTY4NDggXHUwMEE3MTBcdUZGMDhTZXR0aW5nc1RhYlx1RkYwOVx1MzAwMlxuICpcbiAqIFx1N0FFRlx1NTNFM1x1MzAwMVx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1x1RkYwOFx1NzUxRlx1NjIxMC9cdTkxQ0RcdTdGNkUvXHU1OTBEXHU1MjM2XHVGRjA5XHUzMDAxbGFyay1jbGkgXHU4REVGXHU1Rjg0XHUzMDAxXHU5RUQ4XHU4QkE0XHU3NkVFXHU1RjU1XHUzMDAxXHU1RjAwXHU1MTczXHUzMDAxXHU3RjEzXHU1QjU4XHU1NDY4XHU2NzFGXHUzMDAyXG4gKi9cbmltcG9ydCB7IEFwcCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZywgTm90aWNlLCBzZXRJY29uIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBGZWlzaHVTeW5jUGx1Z2luIH0gZnJvbSAnLi9tYWluLmpzJztcbmltcG9ydCB7IHJlc29sdmVDbGkgfSBmcm9tICcuL2xhcmsvY2xpLmpzJztcbmltcG9ydCB7IHJlZnJlc2hNYXBwaW5nIH0gZnJvbSAnLi9tYXBwaW5nLmpzJztcblxuZXhwb3J0IGNsYXNzIEZlaXNodVN5bmNTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBGZWlzaHVTeW5jUGx1Z2luKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG5cbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICdcdTk4REVcdTRFNjZcdTU0MENcdTZCNjVcdThCQkVcdTdGNkUnIH0pO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwIFx1OTAxQVx1NEZFMSBcdTI1MDBcdTI1MDBcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTY3MkNcdTU3MzBcdTdBRUZcdTUzRTMnKVxuICAgICAgLnNldERlc2MoJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NjI2OVx1NUM1NVx1OEZERVx1NjNBNSBPQiBcdTYzRDJcdTRFRjZcdTc2ODRcdTdBRUZcdTUzRTNcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkYgT0IgXHU2MjE2XHU5MUNEXHU2NUIwXHU1MkEwXHU4RjdEXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFZhbHVlKFN0cmluZyh0aGlzLnBsdWdpbi5zZXR0aW5ncy5wb3J0KSlcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3J0ID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcbiAgICAgICAgICAgIGlmIChwb3J0ID4gMCAmJiBwb3J0IDwgNjU1MzYpIHtcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MucG9ydCA9IHBvcnQ7XG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgIC8vIFx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1xuICAgIGNvbnN0IHRva2VuU2V0dGluZyA9IG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NTQyRlx1NTJBOFx1NEVFNFx1NzI0QycpXG4gICAgICAuc2V0RGVzYygnXHU2RDRGXHU4OUM4XHU1NjY4XHU2MjY5XHU1QzU1XHU5OTk2XHU2QjIxXHU4RkRFXHU2M0E1XHU5NzAwXHU3Qzk4XHU4RDM0XHU2QjY0XHU0RUU0XHU3MjRDXHUzMDAyXHU3MEI5XHU1MUZCXHU1OTBEXHU1MjM2XHU1NDBFXHU3Qzk4XHU4RDM0XHU1MjMwXHU2MjY5XHU1QzU1XHU1RjM5XHU3QTk3XHUzMDAyJyk7XG5cbiAgICB0b2tlblNldHRpbmcuYWRkVGV4dCgodGV4dCkgPT4ge1xuICAgICAgdGV4dFxuICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY1Rva2VuKVxuICAgICAgICAuc2V0RGlzYWJsZWQodHJ1ZSkgLy8gXHU1M0VBXHU4QkZCXHVGRjBDXHU5MDdGXHU1MTREXHU2MjRCXHU2NTM5XG4gICAgICAgIC5pbnB1dEVsLnN0eWxlLmZvbnRGYW1pbHkgPSAnbW9ub3NwYWNlJztcbiAgICB9KTtcblxuICAgIHRva2VuU2V0dGluZy5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgIGJ0blxuICAgICAgICAuc2V0QnV0dG9uVGV4dCgnXHU1OTBEXHU1MjM2JylcbiAgICAgICAgLnNldFRvb2x0aXAoJ1x1NTkwRFx1NTIzNlx1NEVFNFx1NzI0Q1x1NTIzMFx1NTI2QVx1OEQzNFx1Njc3RicpXG4gICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jVG9rZW4pO1xuICAgICAgICAgIG5ldyBOb3RpY2UoJ1x1MjcwNSBcdTRFRTRcdTcyNENcdTVERjJcdTU5MERcdTUyMzYnKTtcbiAgICAgICAgfSksXG4gICAgKTtcblxuICAgIHRva2VuU2V0dGluZy5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgIGJ0blxuICAgICAgICAuc2V0QnV0dG9uVGV4dCgnXHU5MUNEXHU3RjZFJylcbiAgICAgICAgLnNldFRvb2x0aXAoJ1x1NzUxRlx1NjIxMFx1NjVCMFx1NEVFNFx1NzI0Q1x1RkYwOFx1NjI2OVx1NUM1NVx1OTcwMFx1OTFDRFx1NjVCMFx1N0M5OFx1OEQzNFx1RkYwOScpXG4gICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jVG9rZW4gPSBnZW5lcmF0ZVRva2VuKCk7XG4gICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XG4gICAgICAgICAgbmV3IE5vdGljZSgnXHVEODNEXHVERDA0IFx1NEVFNFx1NzI0Q1x1NURGMlx1OTFDRFx1N0Y2RScpO1xuICAgICAgICB9KSxcbiAgICApO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwIGxhcmstY2xpIFx1MjUwMFx1MjUwMFxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ2xhcmstY2xpJyB9KTtcblxuICAgIGNvbnN0IGxhcmtJbmZvID0gY29udGFpbmVyRWwuY3JlYXRlRWwoJ3AnLCB7XG4gICAgICB0ZXh0OiBgXHU3MkI2XHU2MDAxXHVGRjFBJHt0aGlzLnBsdWdpbi5zdGF0ZS5sYXJrQ2xpUmVzb2x2ZWQgPyAnXHUyNzA1ICcgKyB0aGlzLnBsdWdpbi5zdGF0ZS5sYXJrQ2xpVmVyc2lvbiA6ICdcdTI3NEMgXHU2NzJBXHU2MjdFXHU1MjMwJ31gLFxuICAgICAgY2xzOiAnc2V0dGluZy1pdGVtLWRlc2NyaXB0aW9uJyxcbiAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ2xhcmstY2xpIFx1OERFRlx1NUY4NCcpXG4gICAgICAuc2V0RGVzYygnXHU3NTU5XHU3QTdBXHU1MjE5XHU4MUVBXHU1MkE4XHU2M0EyXHU2RDRCXHUzMDAyXHU1OTgyXHU4MUVBXHU1MkE4XHU2M0EyXHU2RDRCXHU1OTMxXHU4RDI1XHVGRjBDXHU4QkY3XHU2MjRCXHU1MkE4XHU1ODZCXHU1MTk5XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHUzMDAyJylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmxhcmtDbGlQYXRoKVxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignXHU4MUVBXHU1MkE4XHU2M0EyXHU2RDRCJylcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5sYXJrQ2xpUGF0aCA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApXG4gICAgICAuYWRkQnV0dG9uKChidG4pID0+XG4gICAgICAgIGJ0blxuICAgICAgICAgIC5zZXRCdXR0b25UZXh0KCdcdTZENEJcdThCRDUnKVxuICAgICAgICAgIC5zZXRUb29sdGlwKCdcdTkxQ0RcdTY1QjBcdTYzQTJcdTZENEIgbGFyay1jbGknKVxuICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc29sdmVDbGkodGhpcy5wbHVnaW4uc2V0dGluZ3MubGFya0NsaVBhdGggfHwgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc3RhdGUubGFya0NsaVJlc29sdmVkID0gcmVzdWx0LnBhdGg7XG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnN0YXRlLmxhcmtDbGlWZXJzaW9uID0gcmVzdWx0LnZlcnNpb247XG4gICAgICAgICAgICAgIGxhcmtJbmZvLnNldFRleHQoYFx1NzJCNlx1NjAwMVx1RkYxQVx1MjcwNSAke3Jlc3VsdC52ZXJzaW9ufWApO1xuICAgICAgICAgICAgICBuZXcgTm90aWNlKGBcdTI3MDUgXHU2MjdFXHU1MjMwICR7cmVzdWx0LnZlcnNpb259YCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zdGF0ZS5sYXJrQ2xpUmVzb2x2ZWQgPSAnJztcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc3RhdGUubGFya0NsaVZlcnNpb24gPSAnJztcbiAgICAgICAgICAgICAgbGFya0luZm8uc2V0VGV4dCgnXHU3MkI2XHU2MDAxXHVGRjFBXHUyNzRDIFx1NjcyQVx1NjI3RVx1NTIzMCcpO1xuICAgICAgICAgICAgICBuZXcgTm90aWNlKCdcdTI3NEMgXHU2NzJBXHU2MjdFXHU1MjMwIGxhcmstY2xpXHVGRjA4XHU5NzAwIFx1MjI2NSAxLjAuNTJcdUZGMDknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDAgXHU1NDBDXHU2QjY1XHU4ODRDXHU0RTNBIFx1MjUwMFx1MjUwMFxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1x1NTQwQ1x1NkI2NVx1ODg0Q1x1NEUzQScgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTlFRDhcdThCQTRcdTg0M0RcdTU3MzBcdTc2RUVcdTVGNTUnKVxuICAgICAgLnNldERlc2MoJ1x1NjI2OVx1NUM1NVx1NjcyQVx1NjMwN1x1NUI5QVx1NzZFRVx1NUY1NVx1NjVGNlx1RkYwQ1x1OThERVx1NEU2Nlx1NjU4N1x1Njg2M1x1ODQzRFx1NTczMFx1NTIzMFx1NkI2NFx1NzZFRVx1NUY1NVx1RkYwOFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdUZGMDknKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdERpcilcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0RGlyID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTgxRUFcdTUyQThcdTUyMDZcdTkxNERcdTdGMTZcdTc4MDEnKVxuICAgICAgLnNldERlc2MoJ1x1OThERVx1NEU2Nlx1NjU4N1x1Njg2M1x1ODQzRFx1NTczMFx1NTQwRVx1ODFFQVx1NTJBOFx1ODlFNlx1NTNEMSBhdXRvLXJlbmFtZSBcdTdGMTZcdTc4MDFcdTUyMDZcdTkxNEQnKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b1JlbmFtZSlcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdXRvUmVuYW1lID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTUyMjBcdTk2NjRcdTgxRUFcdTUyQThcdTc2N0JcdThCQjAnKVxuICAgICAgLnNldERlc2MoJ1x1NTIyMFx1OTY2NFx1NTQyQiBmZWlzaHVfaWQgXHU3Njg0XHU2NTg3XHU0RUY2XHU2NUY2XHVGRjBDXHU4MUVBXHU1MkE4XHU3NjdCXHU4QkIwXHU1MjMwXHU5OERFXHU0RTY2XHU1OTFBXHU3RUY0XHU4ODY4XHU2ODNDJylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9EZWxldGVSZWdpc3RyeSlcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdXRvRGVsZXRlUmVnaXN0cnkgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NEZERFx1NzU1OVx1ODhDNVx1OTk3MFx1NTZGRVx1NzI0NycpXG4gICAgICAuc2V0RGVzYygnXHU5OERFXHU0RTY2XHU2MzkyXHU3MjQ4XHU3MjY5XHU2NTk5XHVGRjA4MTM1XHU3RjE2XHU4RjkxXHU1NjY4XHU5OENFXHU2ODNDXHU3QjQ5XHU3RUFGXHU1NkZFXHU3MjQ3XHVGRjA5XHU2NjJGXHU1NDI2XHU4NDNEXHU1NzMwXHU1MjMwIE9CJylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmtlZXBEZWNvcmF0aXZlSW1hZ2VzKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmtlZXBEZWNvcmF0aXZlSW1hZ2VzID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTU2RkVcdTcyNDdcdTdGMTNcdTVCNThcdTZFMDVcdTc0MDZcdTU0NjhcdTY3MUYnKVxuICAgICAgLnNldERlc2MoJ2ZlaXNodTovL3Rva2VuIFx1OTg4NFx1ODlDOFx1NTZGRVx1NzI0N1x1NzY4NFx1NjcyQ1x1NTczMFx1N0YxM1x1NUI1OFx1NEZERFx1NzU1OVx1NjVGNlx1OTU3RicpXG4gICAgICAuYWRkRHJvcGRvd24oKGRyb3Bkb3duKSA9PlxuICAgICAgICBkcm9wZG93blxuICAgICAgICAgIC5hZGRPcHRpb24oJ2RhaWx5JywgJ1x1NkJDRlx1NTkyOScpXG4gICAgICAgICAgLmFkZE9wdGlvbignd2Vla2x5JywgJ1x1NkJDRlx1NTQ2OCcpXG4gICAgICAgICAgLmFkZE9wdGlvbignbW9udGhseScsICdcdTZCQ0ZcdTY3MDgnKVxuICAgICAgICAgIC5hZGRPcHRpb24oJ25ldmVyJywgJ1x1NkMzOFx1NEUwRCcpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmNhY2hlQ2xlYW51cClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jYWNoZUNsZWFudXAgPSB2YWx1ZSBhcyBGZWlzaHVTeW5jU2V0dGluZ3NbJ2NhY2hlQ2xlYW51cCddO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwIFx1OThERVx1NEU2Nlx1NzdFNVx1OEJDNlx1NUU5MyBcdTI1MDBcdTI1MDBcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdcdTk4REVcdTRFNjZcdTc3RTVcdThCQzZcdTVFOTMnIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU3N0U1XHU4QkM2XHU1RTkzIHNwYWNlX2lkJylcbiAgICAgIC5zZXREZXNjKCdcdTc2RUVcdTVGNTVcdTY2MjBcdTVDMDRcdTc1MjhcdTMwMDJcdTY1QjBcdTc3RTVcdThCQzZcdTVFOTNcdTlFRDhcdThCQTQgNzY1MTMxNDE1MDA2MDA2NzgwMycpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zcGFjZUlkKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnNwYWNlSWQgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKVxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgICBidG5cbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dCgnXHU1MjM3XHU2NUIwXHU2NjIwXHU1QzA0JylcbiAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCByZWZyZXNoTWFwcGluZyh0aGlzLmFwcCwgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc3BhY2VJZCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuICB9XG59XG5cbmltcG9ydCB0eXBlIHsgRmVpc2h1U3luY1NldHRpbmdzIH0gZnJvbSAnLi9zZXR0aW5ncy5qcyc7XG5cbi8qKiBcdTc1MUZcdTYyMTAgMzIgXHU1QjU3XHU4MjgyIGhleCBcdTRFRTRcdTcyNENcdTMwMDIgKi9cbmZ1bmN0aW9uIGdlbmVyYXRlVG9rZW4oKTogc3RyaW5nIHtcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheSgzMik7XG4gIChnbG9iYWxUaGlzLmNyeXB0byA/PyAocmVxdWlyZSgnbm9kZTpjcnlwdG8nKSBhcyB7IHdlYmNyeXB0bzogQ3J5cHRvIH0pKS53ZWJjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGJ5dGVzKTtcbiAgcmV0dXJuIEFycmF5LmZyb20oYnl0ZXMpLm1hcChiID0+IGIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xufVxuIiwgIi8qKlxuICogbGFyay1jbGkgXHU1QzAxXHU4OEM1XHU1QzQyXHUzMDAyXHU0RjlEXHU2MzZFIGByYy14L3NjcmlwdHMvcmNfZW52LnB5YCArIGAwM19cdTY4M0NcdTVGMEZcdTg5QzRcdTgzMDMubWRgIFx1MDBBN1x1NTM0MS9cdTUzNDFcdTRFMDBcdTMwMDJcbiAqXG4gKiAtIHJlc29sdmVDbGkoKVx1RkYxQVx1NTAxOVx1OTAwOVx1OERFRlx1NUY4NFx1NjNBMlx1NkQ0Qlx1RkYwQ1x1NzI0OFx1NjcyQ1x1NjgyMVx1OUE4QyBcdTIyNjUgMS4wLjUyXG4gKiAtIHJ1bigpXHVGRjFBXHU3RURGXHU0RTAwIHNwYXduU3luYyBcdTUzMDVcdTg4QzVcdUZGMENcdTkxQ0RcdThCRDVcdTMwMDFcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTMwMDFlbW9qaSBcdTZFMDVcdTZEMTdcdTMwMDF+XHU1M0NEXHU4RjZDXHU0RTQ5XHUzMDAxSlNPTiBcdTUzMDVcdTg4QzVcdTg5RTNcdTUzMDVcbiAqIC0gXHU2ODA3XHU5ODk4XHU0RkVFXHU1OTBEXHVGRjFBb3ZlcndyaXRlIFx1NTQwRVx1OEZGRFx1NTJBMCBzdHJfcmVwbGFjZSBcdTRGRUUgPHRpdGxlPlxuICpcbiAqIFx1NTkxQVx1OEJCRVx1NTkwN1x1OTAwMlx1OTE0RFx1NTE3M1x1OTUyRVx1NzBCOVx1RkYxQVxuICogLSBHVUkgXHU1NDJGXHU1MkE4XHU3Njg0IE9ic2lkaWFuIFx1NjJGRlx1NEUwRFx1NTIzMFx1N0VDOFx1N0FFRiBQQVRIXHVGRjA4bnZtL2hvbWVicmV3IFx1NEUwRFx1NTcyOFx1NTE4NVx1RkYwOVx1RkYwQ1x1NjU0NSBzcGF3biBcdTY1RjZcdTZDRThcdTUxNjVcdTU4OUVcdTVGM0EgUEFUSFxuICogLSBudm0gXHU3NkVFXHU1RjU1XHU2MzA5XHU2NTcwXHU1QjU3XHU1RThGXHU1M0Q2IGxhdGVzdFx1RkYwOFx1NUI1N1x1N0IyNlx1NEUzMiBzb3J0IFx1NEYxQVx1OEJBOSB2OSA+IHYxMFx1RkYwOVxuICovXG5pbXBvcnQgeyBleGVjRmlsZVN5bmMsIHR5cGUgRXhlY1N5bmNPcHRpb25zIH0gZnJvbSAnbm9kZTpjaGlsZF9wcm9jZXNzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ25vZGU6b3MnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycywgdW5lc2NhcGVGZWlzaHVUaWxkZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5cbmNvbnN0IE1JTl9WRVJTSU9OID0gWzEsIDAsIDUyXTtcblxuLyoqXG4gKiBcdTY3ODRcdTkwMjBcdTU4OUVcdTVGM0EgUEFUSFx1RkYxQVx1NTcyOFx1OEZEQlx1N0EwQlx1NzNCMFx1NjcwOSBQQVRIIFx1NTI0RFx1OEZGRFx1NTJBMCBudm0vbGF0ZXN0L2JpbiArIFx1NUUzOFx1ODlDMVx1NUI4OVx1ODhDNVx1NEY0RFx1MzAwMlxuICogXHU3NTI4XHU0RThFIEdVSSBcdTU0MkZcdTUyQThcdTc2ODQgT2JzaWRpYW5cdUZGMDhQQVRIIFx1N0YzQSBudm0vaG9tZWJyZXdcdUZGMENcdTVCRkNcdTgxRjQgIyEvdXNyL2Jpbi9lbnYgbm9kZSBcdTYyN0VcdTRFMERcdTUyMzAgbm9kZVx1RkYwOVx1MzAwMlxuICovXG5mdW5jdGlvbiBidWlsZEVuaGFuY2VkUGF0aCgpOiBzdHJpbmcge1xuICBjb25zdCBleHRyYTogc3RyaW5nW10gPSBbXTtcbiAgLy8gbnZtIGxhdGVzdCBub2RlIFx1NzY4NCBiaW5cbiAgY29uc3QgbnZtQmFzZSA9IHBhdGguam9pbihvcy5ob21lZGlyKCksICcubnZtL3ZlcnNpb25zL25vZGUnKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBkaXJzID0gZnMucmVhZGRpclN5bmMobnZtQmFzZSk7XG4gICAgLy8gXHU2NTcwXHU1QjU3XHU1RThGXHU1M0Q2XHU2NzAwXHU1OTI3XHU3MjQ4XHU2NzJDXHVGRjA4djkgdnMgdjEwIFx1NUI1N1x1N0IyNlx1NEUzMlx1NjM5Mlx1NUU4Rlx1NEYxQVx1OTUxOVx1RkYwOVxuICAgIGNvbnN0IGxhdGVzdCA9IGRpcnNcbiAgICAgIC5tYXAoZCA9PiAoeyBuYW1lOiBkLCB2ZXI6IHBhcnNlSW50KGQucmVwbGFjZSgvXnYvLCAnJyksIDEwKSB9KSlcbiAgICAgIC5maWx0ZXIoeCA9PiAhTnVtYmVyLmlzTmFOKHgudmVyKSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBhLnZlciAtIGIudmVyKVxuICAgICAgLnBvcCgpO1xuICAgIGlmIChsYXRlc3QpIGV4dHJhLnB1c2gocGF0aC5qb2luKG52bUJhc2UsIGxhdGVzdC5uYW1lLCAnYmluJykpO1xuICB9IGNhdGNoIHsgLyogbnZtIFx1NjcyQVx1ODhDNSAqLyB9XG4gIGV4dHJhLnB1c2gocGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJy5sb2NhbCcsICdiaW4nKSk7XG4gIGV4dHJhLnB1c2goJy9vcHQvaG9tZWJyZXcvYmluJyk7XG4gIGV4dHJhLnB1c2goJy91c3IvbG9jYWwvYmluJyk7XG4gIGNvbnN0IGJhc2UgPSBwcm9jZXNzLmVudi5QQVRIID8/ICcnO1xuICByZXR1cm4gWy4uLmV4dHJhLmZpbHRlcihwID0+ICFiYXNlLnNwbGl0KHBhdGguZGVsaW1pdGVyKS5pbmNsdWRlcyhwKSksIGJhc2VdLmpvaW4ocGF0aC5kZWxpbWl0ZXIpO1xufVxuXG4vKiogcnVuKCkgXHU1MTcxXHU3NTI4XHU3Njg0XHU1ODlFXHU1RjNBIFBBVEhcdUZGMDhcdTk5OTZcdTZCMjFcdTg5RTNcdTY3OTBcdTU0MEVcdTdGMTNcdTVCNThcdUZGMDlcdTMwMDIgKi9cbmxldCBlbmhhbmNlZFBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gZ2V0RW5oYW5jZWRQYXRoKCk6IHN0cmluZyB7XG4gIHJldHVybiBlbmhhbmNlZFBhdGggPz89IGJ1aWxkRW5oYW5jZWRQYXRoKCk7XG59XG5cbi8qKlxuICogXHU1NzI4XHU1ODlFXHU1RjNBIFBBVEggXHU0RTBCXHU2N0U1XHU2MjdFXHU1M0VGXHU2MjY3XHU4ODRDXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHVGRjA4XHU2NkZGXHU0RUUzIGB3aGljaGBcdUZGMENcdTkwN0ZcdTUxNEQgR1VJIFx1OEZEQlx1N0EwQiBQQVRIIFx1N0YzQVx1NTkzMVx1RkYwOVx1MzAwMlxuICogXHU3NTI4IGV4ZWNGaWxlU3luYyBcdTRFMERcdThENzAgc2hlbGxcdUZGMENcdTY2RjRcdTdBMzNcdTMwMDJcbiAqL1xuZnVuY3Rpb24gd2hpY2goY21kOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgLy8gXHU1MTQ4XHU4QkQ1XHU1RjUzXHU1MjREIFBBVEhcdUZGMDhcdTdFQzhcdTdBRUZcdTU3M0FcdTY2NkZcdUZGMDlcbiAgdHJ5IHtcbiAgICBjb25zdCBmb3VuZCA9IGV4ZWNGaWxlU3luYygnL3Vzci9iaW4vd2hpY2gnLCBbY21kXSwge1xuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICAgIHRpbWVvdXQ6IDMwMDAsXG4gICAgICBlbnY6IHsgLi4ucHJvY2Vzcy5lbnYgfSxcbiAgICB9KS50cmltKCk7XG4gICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmQ7XG4gIH0gY2F0Y2ggeyAvKiBmYWxsIHRocm91Z2ggKi8gfVxuICAvLyBcdTUxOERcdThCRDVcdTU4OUVcdTVGM0EgUEFUSFx1RkYwOEdVSSBcdTU3M0FcdTY2NkZcdUZGMDlcbiAgdHJ5IHtcbiAgICBjb25zdCBmb3VuZCA9IGV4ZWNGaWxlU3luYygnL3Vzci9iaW4vd2hpY2gnLCBbY21kXSwge1xuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICAgIHRpbWVvdXQ6IDMwMDAsXG4gICAgICBlbnY6IHsgLi4ucHJvY2Vzcy5lbnYsIFBBVEg6IGdldEVuaGFuY2VkUGF0aCgpIH0sXG4gICAgfSkudHJpbSgpO1xuICAgIHJldHVybiBmb3VuZCB8fCBudWxsO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKiogXHU1MDE5XHU5MDA5XHU4REVGXHU1Rjg0XHVGRjA4XHU3OUZCXHU2OTBEIHJjX2Vudi5weSByZXNvbHZlX2NsaVx1RkYwOVx1MzAwMiAqL1xuY29uc3QgQ0xJX0NBTkRJREFURVM6ICgoKSA9PiBzdHJpbmcgfCBudWxsKVtdID0gW1xuICAoKSA9PiBwcm9jZXNzLmVudi5MQVJLX0NMSV9CSU4gPz8gbnVsbCxcbiAgKCkgPT4gd2hpY2goJ2xhcmtzdWl0ZS1jbGknKSxcbiAgKCkgPT4gd2hpY2goJ2xhcmstY2xpJyksXG4gICgpID0+IHtcbiAgICBjb25zdCBudm1CYXNlID0gcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJy5udm0vdmVyc2lvbnMvbm9kZScpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkaXJzID0gZnMucmVhZGRpclN5bmMobnZtQmFzZSk7XG4gICAgICAvLyBcdTY1NzBcdTVCNTdcdTVFOEZcdTUzRDZcdTY3MDBcdTU5MjdcdTcyNDhcdTY3MkNcdUZGMDhcdTVCNTdcdTdCMjZcdTRFMzIgc29ydCBcdTRGMUFcdThCQTkgdjkgPiB2MTBcdUZGMDlcbiAgICAgIGNvbnN0IGxhdGVzdCA9IGRpcnNcbiAgICAgICAgLm1hcChkID0+ICh7IG5hbWU6IGQsIHZlcjogcGFyc2VJbnQoZC5yZXBsYWNlKC9edi8sICcnKSwgMTApIH0pKVxuICAgICAgICAuZmlsdGVyKHggPT4gIU51bWJlci5pc05hTih4LnZlcikpXG4gICAgICAgIC5zb3J0KChhLCBiKSA9PiBhLnZlciAtIGIudmVyKVxuICAgICAgICAucG9wKCk7XG4gICAgICByZXR1cm4gbGF0ZXN0ID8gcGF0aC5qb2luKG52bUJhc2UsIGxhdGVzdC5uYW1lLCAnYmluJywgJ2xhcmstY2xpJykgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9LFxuICAoKSA9PiBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnLmxvY2FsJywgJ2JpbicsICdsYXJrLWNsaScpLFxuICAoKSA9PiAnL29wdC9ob21lYnJldy9iaW4vbGFyay1jbGknLFxuICAoKSA9PiAnL3Vzci9sb2NhbC9iaW4vbGFyay1jbGknLFxuXTtcblxuLyoqXG4gKiBcdTYzQTJcdTZENEIgbGFyay1jbGkgXHU4REVGXHU1Rjg0XHUzMDAyXHU0RjE4XHU1MTQ4XHU3NTI4XHU4QkJFXHU3RjZFXHU4OTg2XHU3NkQ2XHVGRjBDXHU1NDI2XHU1MjE5XHU4RDcwXHU1MDE5XHU5MDA5XHU4REVGXHU1Rjg0XHUzMDAyXG4gKiBAcmV0dXJucyB7IHBhdGgsIHZlcnNpb24gfSBcdTYyMTYgbnVsbFx1RkYwOFx1NjcyQVx1NjI3RVx1NTIzMFx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUNsaShvdmVycmlkZVBhdGg/OiBzdHJpbmcpOiB7IHBhdGg6IHN0cmluZzsgdmVyc2lvbjogc3RyaW5nIH0gfCBudWxsIHtcbiAgY29uc3QgY2FuZGlkYXRlcyA9IG92ZXJyaWRlUGF0aFxuICAgID8gWygpID0+IG92ZXJyaWRlUGF0aF1cbiAgICA6IENMSV9DQU5ESURBVEVTO1xuXG4gIGZvciAoY29uc3QgZ2V0Q2xpIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICBjb25zdCBjbGkgPSBnZXRDbGkoKTtcbiAgICBpZiAoIWNsaSkgY29udGludWU7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFx1NzUyOCBleGVjRmlsZVN5bmMgXHU3NkY0XHU2M0E1XHU4REQxIGNsaVx1RkYwQ1x1NkNFOFx1NTE2NVx1NTg5RVx1NUYzQSBQQVRIXHVGRjA4XHU4OUUzXHU1MUIzIEdVSSBcdThGREJcdTdBMEIgZW52IG5vZGUgXHU2MjdFXHU0RTBEXHU1MjMwXHU3Njg0XHU5NUVFXHU5ODk4XHVGRjA5XG4gICAgICBjb25zdCB2ZXIgPSBleGVjRmlsZVN5bmMoY2xpLCBbJy0tdmVyc2lvbiddLCB7XG4gICAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgICAgIHRpbWVvdXQ6IDUwMDAsXG4gICAgICAgIGVudjogeyAuLi5wcm9jZXNzLmVudiwgUEFUSDogZ2V0RW5oYW5jZWRQYXRoKCkgfSxcbiAgICAgIH0pLnRyaW0oKTtcbiAgICAgIC8vIFx1ODlFM1x1Njc5MCBcImxhcmstY2xpIHZlcnNpb24gMS4wLjUyXCJcbiAgICAgIGNvbnN0IG1hdGNoID0gdmVyLm1hdGNoKC8oXFxkKylcXC4oXFxkKylcXC4oXFxkKykvKTtcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICBjb25zdCBtYWpvciA9IHBhcnNlSW50KG1hdGNoWzFdLCAxMCk7XG4gICAgICAgIGNvbnN0IG1pbm9yID0gcGFyc2VJbnQobWF0Y2hbMl0sIDEwKTtcbiAgICAgICAgY29uc3QgcGF0Y2ggPSBwYXJzZUludChtYXRjaFszXSwgMTApO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgbWFqb3IgPiBNSU5fVkVSU0lPTlswXSB8fFxuICAgICAgICAgIChtYWpvciA9PT0gTUlOX1ZFUlNJT05bMF0gJiYgbWlub3IgPiBNSU5fVkVSU0lPTlsxXSkgfHxcbiAgICAgICAgICAobWFqb3IgPT09IE1JTl9WRVJTSU9OWzBdICYmIG1pbm9yID09PSBNSU5fVkVSU0lPTlsxXSAmJiBwYXRjaCA+PSBNSU5fVkVSU0lPTlsyXSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIHsgcGF0aDogY2xpLCB2ZXJzaW9uOiB2ZXIgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gXHU3MjQ4XHU2NzJDXHU4OUUzXHU2NzkwXHU1OTMxXHU4RDI1XHU0RjQ2XHU2NzA5XHU4RjkzXHU1MUZBXHVGRjBDXHU0RUNEXHU1M0VGXHU3NTI4XG4gICAgICBpZiAodmVyKSByZXR1cm4geyBwYXRoOiBjbGksIHZlcnNpb246IHZlciB9O1xuICAgIH0gY2F0Y2gge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKiogcnVuKCkgXHU2MjY3XHU4ODRDXHU5MDA5XHU5ODc5XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFJ1bk9wdGlvbnMge1xuICAvKiogXHU1REU1XHU0RjVDXHU3NkVFXHU1RjU1XHVGRjA4LS1jb250ZW50IEBmaWxlIFx1NzUyOFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1NjVGNlx1OTcwMFx1ODk4MVx1RkYwOVx1MzAwMiAqL1xuICBjd2Q/OiBzdHJpbmc7XG4gIC8qKiBcdTY3MDBcdTU5MjdcdTkxQ0RcdThCRDVcdTZCMjFcdTY1NzBcdUZGMDhcdTlFRDhcdThCQTQgM1x1RkYwOVx1MzAwMiAqL1xuICByZXRyaWVzPzogbnVtYmVyO1xuICAvKiogXHU4RDg1XHU2NUY2IG1zXHVGRjA4XHU5RUQ4XHU4QkE0IDMwc1x1RkYwOVx1MzAwMiAqL1xuICB0aW1lb3V0PzogbnVtYmVyO1xuICAvKiogXHU2NzFGXHU2NzFCIEpTT04gXHU4RjkzXHU1MUZBXHU2NUY2IHRydWVcdUZGMENcdTgxRUFcdTUyQThcdThERjNcdThGQzcgXCJGb3VuZCBYIG5vZGUocylcIiBcdTUyNERcdTdGMDBcdTMwMDIgKi9cbiAganNvbj86IGJvb2xlYW47XG59XG5cbi8qKlxuICogXHU2MjY3XHU4ODRDIGxhcmstY2xpIFx1NTQ3RFx1NEVFNFx1MzAwMlx1N0VERlx1NEUwMFx1NTkwNFx1NzQwNlx1NURGMlx1NzdFNVx1NTc1MVx1MzAwMlxuICpcbiAqIEBwYXJhbSBhcmdzIGxhcmstY2xpIFx1NUI1MFx1NTQ3RFx1NEVFNFx1NTNDMlx1NjU3MFx1NjU3MFx1N0VDNFx1RkYwQ1x1NTk4MiBbJ2RvY3MnLCAnK2ZldGNoJywgJy0tZG9jJywgdG9rZW4sICctLWRvYy1mb3JtYXQnLCAnbWFya2Rvd24nXVxuICogQHBhcmFtIG9wdGlvbnMgXHU5MDA5XHU5ODc5XG4gKiBAcmV0dXJucyBzdGRvdXRcdUZGMDhcdTVERjJcdTZFMDVcdTZEMTdcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJ1bihhcmdzOiBzdHJpbmdbXSwgb3B0aW9uczogUnVuT3B0aW9ucyA9IHt9KTogc3RyaW5nIHtcbiAgY29uc3QgeyBjd2QsIHJldHJpZXMgPSAzLCB0aW1lb3V0ID0gMzAwMDAsIGpzb24gPSBmYWxzZSB9ID0gb3B0aW9ucztcbiAgY29uc3QgY2xpUGF0aCA9IHByb2Nlc3MuZW52Ll9fTEFSS19DTElfUEFUSF9fIHx8ICdsYXJrLWNsaSc7XG5cbiAgbGV0IGxhc3RFcnJvcjogRXJyb3IgfCBudWxsID0gbnVsbDtcblxuICBmb3IgKGxldCBhdHRlbXB0ID0gMTsgYXR0ZW1wdCA8PSByZXRyaWVzOyBhdHRlbXB0KyspIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZnVsbEFyZ3MgPSBbLi4uYXJnc107XG4gICAgICBjb25zdCBleGVjT3B0czogRXhlY1N5bmNPcHRpb25zID0ge1xuICAgICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgICAgICB0aW1lb3V0LFxuICAgICAgICBtYXhCdWZmZXI6IDEwICogMTAyNCAqIDEwMjQsIC8vIDEwTUJcdUZGMDhcdTU5MjdcdTY1ODdcdTY4NjNcdUZGMDlcbiAgICAgICAgLy8gXHU2Q0U4XHU1MTY1XHU1ODlFXHU1RjNBIFBBVEhcdUZGMUFHVUkgXHU1NDJGXHU1MkE4XHU3Njg0IE9ic2lkaWFuIFx1NjJGRlx1NEUwRFx1NTIzMCBudm0vaG9tZWJyZXdcdUZGMENcdTVCRkNcdTgxRjRcbiAgICAgICAgLy8gYCMhL3Vzci9iaW4vZW52IG5vZGVgIFx1NjI3RVx1NEUwRFx1NTIzMCBub2RlXHVGRjA4Y2xpIFx1NjYyRiBub2RlIFx1ODExQVx1NjcyQ1x1RkYwOVxuICAgICAgICBlbnY6IHsgLi4ucHJvY2Vzcy5lbnYsIFBBVEg6IGdldEVuaGFuY2VkUGF0aCgpIH0sXG4gICAgICB9O1xuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgLS1jb250ZW50IEBmaWxlXHVGRjFBXHU3NTI4XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA4XHU1NzUxXHVGRjFBXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHU4OEFCXHU2MkQyXHVGRjA5XG4gICAgICBjb25zdCBjb250ZW50SWR4ID0gZnVsbEFyZ3MuaW5kZXhPZignLS1jb250ZW50Jyk7XG4gICAgICBpZiAoY29udGVudElkeCAhPT0gLTEgJiYgY29udGVudElkeCArIDEgPCBmdWxsQXJncy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgY29udGVudFZhbCA9IGZ1bGxBcmdzW2NvbnRlbnRJZHggKyAxXTtcbiAgICAgICAgaWYgKGNvbnRlbnRWYWwuc3RhcnRzV2l0aCgnQCcpKSB7XG4gICAgICAgICAgY29uc3QgZmlsZVBhdGggPSBjb250ZW50VmFsLnNsaWNlKDEpO1xuICAgICAgICAgIGNvbnN0IGRpciA9IGN3ZCB8fCBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpO1xuICAgICAgICAgIGNvbnN0IGJhc2VOYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlUGF0aCk7XG4gICAgICAgICAgZnVsbEFyZ3NbY29udGVudElkeCArIDFdID0gYEAuLyR7YmFzZU5hbWV9YDtcbiAgICAgICAgICBleGVjT3B0cy5jd2QgPSBkaXI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoY3dkKSB7XG4gICAgICAgIGV4ZWNPcHRzLmN3ZCA9IGN3ZDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1MTk5XHU1MTY1XHU1MjREIGVtb2ppIFx1NkUwNVx1NkQxN1x1RkYxQVx1NjI2Qlx1NjNDRiBmdWxsQXJncyBcdTRFMkQgLS1jb250ZW50IEBmaWxlIFx1NzY4NFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVxuICAgICAgaWYgKGNvbnRlbnRJZHggIT09IC0xICYmIGNvbnRlbnRJZHggKyAxIDwgZnVsbEFyZ3MubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZnVsbEFyZ3NbY29udGVudElkeCArIDFdLnJlcGxhY2UoL15AXFwuXFwvLywgJycpO1xuICAgICAgICBjb25zdCBmdWxsRmlsZVBhdGggPSBwYXRoLmpvaW4oZXhlY09wdHMuY3dkIHx8IHByb2Nlc3MuY3dkKCksIGZpbGVQYXRoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsZXQgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmdWxsRmlsZVBhdGgsICd1dGY4Jyk7XG4gICAgICAgICAgY29udGVudCA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKGNvbnRlbnQpO1xuICAgICAgICAgIC8vIFx1NTNDRFx1OEY2Q1x1NEU0OSBcXH4gXHUyMTkyIH5cdUZGMDhcdTk4REVcdTRFNjZcdThCRkJcdTU2REVcdTY3NjVcdTY1RjZcdThGNkNcdTRFNDlcdTRFODZcdTZDRTJcdTZENkFcdTUzRjdcdUZGMDlcbiAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC9cXFxcfi9nLCAnficpO1xuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbEZpbGVQYXRoLCBjb250ZW50LCAndXRmOCcpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAvLyBcdTY1ODdcdTRFRjZcdThCRkJcdTRFMERcdTUyMzBcdTVDMzFcdThERjNcdThGQzdcdTZFMDVcdTZEMTdcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBcdTc1MjggZXhlY0ZpbGVTeW5jIFx1NzZGNFx1NjNBNVx1NjI2N1x1ODg0Q1x1RkYwQ1x1NEUwRFx1OEQ3MCBzaGVsbFx1RkYwOFx1NTNDMlx1NjU3MFx1NUI4OVx1NTE2OCArIFx1NTg5RVx1NUYzQSBQQVRIIFx1NzUxRlx1NjU0OFx1RkYwOVxuICAgICAgbGV0IHN0ZG91dCA9IGV4ZWNGaWxlU3luYyhjbGlQYXRoLCBmdWxsQXJncywgZXhlY09wdHMpO1xuXG4gICAgICAvLyBcdTU2REVcdThCRkJcdTU0MEVcdTUzQ0RcdThGNkNcdTRFNDlcdUZGMUFcdTk4REVcdTRFNjYgbWQgXHU2MjhBIH4gXHU4RjZDXHU0RTQ5XHU2MjEwIFxcflxuICAgICAgc3Rkb3V0ID0gdW5lc2NhcGVGZWlzaHVUaWxkZShzdGRvdXQpO1xuXG4gICAgICAvLyBcdTg5RTNcdTUzMDUgbGFyay1jbGkgXHU2ODA3XHU1MUM2IEpTT04gXHU1MzA1XHU4OEM1XHVGRjFBe29rLCBpZGVudGl0eSwgZGF0YTp7ZG9jdW1lbnQ6e2NvbnRlbnR9fX0gXHUyMTkyIFx1N0VBRlx1NkI2M1x1NjU4N1xuICAgICAgLy8gZG9jcyArZmV0Y2ggXHU5RUQ4XHU4QkE0IC0tZm9ybWF0IGpzb25cdUZGMENcdTZCNjNcdTY1ODdcdTVENENcdTU3MjggZGF0YS5kb2N1bWVudC5jb250ZW50IFx1OTFDQ1xuICAgICAgc3Rkb3V0ID0gdW53cmFwTGFya0VudmVsb3BlKHN0ZG91dCk7XG5cbiAgICAgIC8vIEpTT04gXHU2QTIxXHU1RjBGXHVGRjFBXHU4REYzXHU4RkM3IFwiRm91bmQgWCBub2RlKHMpXCIgXHU1MjREXHU3RjAwXHVGRjA4XHU1NzUxXHVGRjFBbm9kZS1saXN0IFx1OEY5M1x1NTFGQVx1NTQyQlx1NjVFNVx1NUZEN1x1ODg0Q1x1RkYwOVxuICAgICAgaWYgKGpzb24pIHtcbiAgICAgICAgY29uc3QgYnJhY2VJZHggPSBzdGRvdXQuaW5kZXhPZigneycpO1xuICAgICAgICBpZiAoYnJhY2VJZHggIT09IC0xKSB7XG4gICAgICAgICAgc3Rkb3V0ID0gc3Rkb3V0LnNsaWNlKGJyYWNlSWR4KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3Rkb3V0LnRyaW0oKTtcbiAgICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcbiAgICAgIGxhc3RFcnJvciA9IGVyciBhcyBFcnJvcjtcbiAgICAgIGNvbnN0IGVyck1zZyA9IChlcnIgYXMgRXJyb3IpPy5tZXNzYWdlID8/IFN0cmluZyhlcnIpO1xuXG4gICAgICAvLyA0MjkgXHU5NjUwXHU2RDQxXHU2MjE2XHU3RjUxXHU3RURDXHU5NTE5XHU4QkVGXHVGRjFBXHU5MUNEXHU4QkQ1XHVGRjA4XHU2MzA3XHU2NTcwXHU5MDAwXHU5MDdGXHVGRjA5XG4gICAgICBpZiAoXG4gICAgICAgIGVyck1zZy5pbmNsdWRlcygnNDI5JykgfHxcbiAgICAgICAgZXJyTXNnLmluY2x1ZGVzKCdFVElNRURPVVQnKSB8fFxuICAgICAgICBlcnJNc2cuaW5jbHVkZXMoJ0VDT05OUkVTRVQnKSB8fFxuICAgICAgICBlcnJNc2cuaW5jbHVkZXMoJ3NvY2tldCBoYW5nIHVwJylcbiAgICAgICkge1xuICAgICAgICBjb25zdCBkZWxheSA9IE1hdGgubWluKDEwMDAgKiBNYXRoLnBvdygyLCBhdHRlbXB0IC0gMSksIDEwMDAwKTtcbiAgICAgICAgY29uc29sZS53YXJuKGBbc3luYy9sYXJrXSBhdHRlbXB0ICR7YXR0ZW1wdH0gZmFpbGVkLCByZXRyeWluZyBpbiAke2RlbGF5fW1zOiAke2Vyck1zZ31gKTtcbiAgICAgICAgLy8gXHU0RTBEXHU0RjlEXHU4RDU2IHNoZWxsIFx1NzY4NCBzbGVlcFx1RkYwOEF0b21pY3Mud2FpdCBcdTU0MENcdTZCNjVcdTk2M0JcdTU4NUVcdUZGMDlcbiAgICAgICAgY29uc3QgbXMgPSBkZWxheTtcbiAgICAgICAgY29uc3QgYnVmID0gbmV3IEludDMyQXJyYXkobmV3IFNoYXJlZEFycmF5QnVmZmVyKDQpKTtcbiAgICAgICAgQXRvbWljcy53YWl0KGJ1ZiwgMCwgMCwgbXMpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU5NTE5XHU4QkVGXHU3NkY0XHU2M0E1XHU2MjlCXG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB0aHJvdyBsYXN0RXJyb3IgPz8gbmV3IEVycm9yKCdsYXJrLWNsaSBydW4gZmFpbGVkIHdpdGggdW5rbm93biBlcnJvcicpO1xufVxuXG4vKipcbiAqIFx1ODlFM1x1NTMwNSBsYXJrLWNsaSBcdTY4MDdcdTUxQzYgSlNPTiBcdTUzMDVcdTg4QzVcdTMwMDJcbiAqXG4gKiBsYXJrLWNsaSBcdTc2ODQgZG9jcyArZmV0Y2ggXHU3QjQ5XHU1NDdEXHU0RUU0XHU5RUQ4XHU4QkE0IGAtLWZvcm1hdCBqc29uYFx1RkYwQ1x1OEZENFx1NTZERVx1RkYxQVxuICogICB7IFwib2tcIjogdHJ1ZSwgXCJpZGVudGl0eVwiOiBcIi4uLlwiLCBcImRhdGFcIjogeyBcImRvY3VtZW50XCI6IHsgXCJjb250ZW50XCI6IFwiPFx1NzcxRlx1NUI5RVx1NkI2M1x1NjU4Nz5cIiB9IH0sIC4uLiB9XG4gKiBcdTU0MENcdTZCNjVcdTk0RkVcdThERUZcdTk3MDBcdTg5ODFcdTc2ODRcdTY2MkZcdTdFQUZcdTZCNjNcdTY1ODdcdUZGMDhtYXJrZG93bi94bWxcdUZGMDlcdUZGMENcdTRFMERcdTY2MkZcdTY1NzRcdTRFMkEgZW52ZWxvcGVcdTMwMDJcbiAqXG4gKiBcdTUyMjRcdTVCOUFcdUZGMUFzdGRvdXQgXHU5OTk2XHU0RTJBXHU5NzVFXHU3QTdBXHU3NjdEXHU1QjU3XHU3QjI2XHU2NjJGIGB7YFx1RkYwQ1x1NEUxNFx1ODlFM1x1Njc5MFx1NTQwRVx1NTQyQiBvayBcdTVCNTdcdTZCQjUgKyBkYXRhLmRvY3VtZW50LmNvbnRlbnRcdUZGMENcbiAqIFx1NjI0RFx1OEJBNFx1NEUzQVx1NjYyRiBlbnZlbG9wZSBcdTVFNzZcdTg5RTNcdTUzMDVcdUZGMUJcdTU0MjZcdTUyMTlcdTUzOUZcdTY4MzdcdThGRDRcdTU2REVcdUZGMDhcdTRGRERcdTc1NTkgd2lraSArbm9kZS1saXN0IFx1N0I0OVx1N0VBRiBKU09OIFx1NTRDRFx1NUU5NFx1N0VEOSBqc29uIFx1NkEyMVx1NUYwRlx1NTkwNFx1NzQwNlx1RkYwOVx1MzAwMlxuICovXG5mdW5jdGlvbiB1bndyYXBMYXJrRW52ZWxvcGUoc3Rkb3V0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCB0cmltbWVkID0gc3Rkb3V0LnRyaW1TdGFydCgpO1xuICBpZiAoIXRyaW1tZWQuc3RhcnRzV2l0aCgneycpKSByZXR1cm4gc3Rkb3V0O1xuICBsZXQgcGFyc2VkOiB1bmtub3duO1xuICB0cnkge1xuICAgIHBhcnNlZCA9IEpTT04ucGFyc2UodHJpbW1lZCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBzdGRvdXQ7IC8vIFx1NEUwRFx1NjYyRlx1NTQwOFx1NkNENSBKU09OXHVGRjBDXHU1MzlGXHU2ODM3XHU4RkQ0XHU1NkRFXG4gIH1cbiAgY29uc3QgZW52ID0gcGFyc2VkIGFzIHsgb2s/OiB1bmtub3duOyBkYXRhPzogeyBkb2N1bWVudD86IHsgY29udGVudD86IHVua25vd24gfSB9IH07XG4gIC8vIFx1NEVDNVx1NUY1M1x1NjYyRlx1NTQyQiBkb2N1bWVudC5jb250ZW50IFx1NzY4NFx1NjgwN1x1NTFDNiBlbnZlbG9wZSBcdTYyNERcdTg5RTNcdTUzMDVcbiAgaWYgKGVudiAmJiB0eXBlb2YgZW52Lm9rID09PSAnYm9vbGVhbicgJiYgZW52LmRhdGE/LmRvY3VtZW50Py5jb250ZW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBjb250ZW50ID0gZW52LmRhdGEuZG9jdW1lbnQuY29udGVudDtcbiAgICByZXR1cm4gdHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnID8gY29udGVudCA6IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQpO1xuICB9XG4gIHJldHVybiBzdGRvdXQ7XG59XG5cbi8qKlxuICogXHU1NkRFXHU1MTk5XHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzXHVGRjA4bWFya2Rvd24gb3ZlcndyaXRlICsgXHU2ODA3XHU5ODk4XHU0RkVFXHU1OTBEXHVGRjA5XHUzMDAyXG4gKiBcdTRGOURcdTYzNkVcdTVERjJcdTc3RTVcdTU3NTFcdUZGMUFvdmVyd3JpdGUgXHU1NDBFXHU2ODA3XHU5ODk4XHU1M0Q4IFVudGl0bGVkIFx1MjE5MiBcdThGRkRcdTUyQTAgc3RyX3JlcGxhY2UgXHU0RkVFIDx0aXRsZT5cdTMwMDJcbiAqXG4gKiBAcGFyYW0gdG9rZW4gZG9jeCBvYmpfdG9rZW4gXHU2MjE2IG5vZGVfdG9rZW5cbiAqIEBwYXJhbSBjb250ZW50IFx1NkI2M1x1NjU4NyBtYXJrZG93blx1RkYwOFx1NEUwRFx1NTQyQiBmcm9udG1hdHRlclx1RkYwOVxuICogQHBhcmFtIHRpdGxlIFx1NjU4N1x1Njg2M1x1NjgwN1x1OTg5OFx1RkYwOFx1NUUyNiBlbW9qaVx1RkYwOVxuICogQHBhcmFtIGN3ZCBcdTVERTVcdTRGNUNcdTc2RUVcdTVGNTVcdUZGMDhcdTc1MjhcdTRFOEUgQGZpbGUgXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvdmVyd3JpdGVEb2ModG9rZW46IHN0cmluZywgY29udGVudDogc3RyaW5nLCB0aXRsZTogc3RyaW5nLCBjd2Q/OiBzdHJpbmcpOiB2b2lkIHtcbiAgLy8gXHU1MTk5XHU0RTM0XHU2NUY2XHU2NTg3XHU0RUY2XHVGRjA4b3ZlcndyaXRlIFx1OTcwMFx1ODk4MVx1NzUyOCBAZmlsZVx1RkYwOVxuICBjb25zdCB0bXBEaXIgPSBjd2QgfHwgcHJvY2Vzcy5jd2QoKTtcbiAgY29uc3QgdG1wRmlsZSA9IHBhdGguam9pbih0bXBEaXIsICcuLy5mZWlzaHUtc3luYy10ZW1wLm1kJyk7XG5cbiAgLy8gXHU2RTA1XHU2RDE3XHVGRjFBc3RyaXAgZW1vamkgVlMgKyBcdTUzQ0RcdThGNkNcdTRFNDkgXFx+XG4gIGNvbnN0IGNsZWFuZWQgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhjb250ZW50KTtcblxuICBmcy53cml0ZUZpbGVTeW5jKHRtcEZpbGUsIGNsZWFuZWQsICd1dGY4Jyk7XG5cbiAgdHJ5IHtcbiAgICAvLyBvdmVyd3JpdGVcbiAgICBydW4oWydkb2NzJywgJyt1cGRhdGUnLCAnLS1kb2MnLCB0b2tlbiwgJy0tY29tbWFuZCcsICdvdmVyd3JpdGUnLCAnLS1kb2MtZm9ybWF0JywgJ21hcmtkb3duJywgJy0tY29udGVudCcsIGBALi8uZmVpc2h1LXN5bmMtdGVtcC5tZGBdLCB7IGN3ZDogdG1wRGlyIH0pO1xuXG4gICAgLy8gXHU2ODA3XHU5ODk4XHU0RkVFXHU1OTBEXHVGRjFBc3RyX3JlcGxhY2UgXHU0RkVFIDx0aXRsZT5cbiAgICBjb25zdCBjbGVhblRpdGxlID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnModGl0bGUpO1xuICAgIHJ1bihbXG4gICAgICAnZG9jcycsICcrdXBkYXRlJywgJy0tZG9jJywgdG9rZW4sXG4gICAgICAnLS1jb21tYW5kJywgJ3N0cl9yZXBsYWNlJyxcbiAgICAgICctLWRvYy1mb3JtYXQnLCAnanNvbicsXG4gICAgICAnLS1jb250ZW50JywgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICByZXF1ZXN0OiBbe1xuICAgICAgICAgIGJsb2NrX3R5cGU6IDEsIC8vIHBhZ2VcbiAgICAgICAgICBwYWdlOiB7XG4gICAgICAgICAgICBlbGVtZW50czogW3tcbiAgICAgICAgICAgICAgdGV4dF9ydW46IHsgY29udGVudDogY2xlYW5UaXRsZSwgdGV4dF9lbGVtZW50X3N0eWxlOiB7IGJvbGQ6IHRydWUgfSB9XG4gICAgICAgICAgICB9XVxuICAgICAgICAgIH1cbiAgICAgICAgfV0sXG4gICAgICAgIGluZGV4OiAwLFxuICAgICAgfSksXG4gICAgXSwgeyBjd2Q6IHRtcERpciwgdGltZW91dDogMTUwMDAgfSk7XG4gIH0gZmluYWxseSB7XG4gICAgLy8gXHU2RTA1XHU3NDA2XHU0RTM0XHU2NUY2XHU2NTg3XHU0RUY2XG4gICAgdHJ5IHsgZnMudW5saW5rU3luYyh0bXBGaWxlKTsgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG4gIH1cbn1cblxuLyoqXG4gKiBcdTU2REVcdTUxOTlcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjNcdUZGMDhYTUwgXHU2ODNDXHU1RjBGXHVGRjBDXHU1NDJCIGNhbGxvdXQgXHU3Q0JFXHU3ODZFXHU2M0E3XHU1MjM2XHVGRjA5XHUzMDAyXG4gKiBcdTU0MENcdTY4MzdcdTk3MDBcdTg5ODFcdTY4MDdcdTk4OThcdTRGRUVcdTU5MERcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG92ZXJ3cml0ZURvY1htbCh0b2tlbjogc3RyaW5nLCB4bWxDb250ZW50OiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsIGN3ZD86IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCB0bXBEaXIgPSBjd2QgfHwgcHJvY2Vzcy5jd2QoKTtcbiAgY29uc3QgdG1wRmlsZSA9IHBhdGguam9pbih0bXBEaXIsICcuLy5mZWlzaHUtc3luYy10ZW1wLnhtbCcpO1xuXG4gIGNvbnN0IGNsZWFuZWQgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyh4bWxDb250ZW50KTtcbiAgZnMud3JpdGVGaWxlU3luYyh0bXBGaWxlLCBjbGVhbmVkLCAndXRmOCcpO1xuXG4gIHRyeSB7XG4gICAgcnVuKFsnZG9jcycsICcrdXBkYXRlJywgJy0tZG9jJywgdG9rZW4sICctLWNvbW1hbmQnLCAnb3ZlcndyaXRlJywgJy0tZG9jLWZvcm1hdCcsICd4bWwnLCAnLS1jb250ZW50JywgYEAuLy5mZWlzaHUtc3luYy10ZW1wLnhtbGBdLCB7IGN3ZDogdG1wRGlyIH0pO1xuXG4gICAgLy8gXHU2ODA3XHU5ODk4XHU0RkVFXHU1OTBEXG4gICAgY29uc3QgY2xlYW5UaXRsZSA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKHRpdGxlKTtcbiAgICBydW4oW1xuICAgICAgJ2RvY3MnLCAnK3VwZGF0ZScsICctLWRvYycsIHRva2VuLFxuICAgICAgJy0tY29tbWFuZCcsICdzdHJfcmVwbGFjZScsXG4gICAgICAnLS1kb2MtZm9ybWF0JywgJ2pzb24nLFxuICAgICAgJy0tY29udGVudCcsIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgcmVxdWVzdDogW3tcbiAgICAgICAgICBibG9ja190eXBlOiAxLFxuICAgICAgICAgIHBhZ2U6IHtcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbe1xuICAgICAgICAgICAgICB0ZXh0X3J1bjogeyBjb250ZW50OiBjbGVhblRpdGxlLCB0ZXh0X2VsZW1lbnRfc3R5bGU6IHsgYm9sZDogdHJ1ZSB9IH1cbiAgICAgICAgICAgIH1dXG4gICAgICAgICAgfVxuICAgICAgICB9XSxcbiAgICAgICAgaW5kZXg6IDAsXG4gICAgICB9KSxcbiAgICBdLCB7IGN3ZDogdG1wRGlyLCB0aW1lb3V0OiAxNTAwMCB9KTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkgeyBmcy51bmxpbmtTeW5jKHRtcEZpbGUpOyB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cbiAgfVxufVxuXG4vKipcbiAqIFx1NEVDRVx1OThERVx1NEU2NiB3aWtpIFVSTCBcdTg5RTNcdTY3OTAgbm9kZV90b2tlblx1MzAwMlxuICogVVJMIFx1NUY2Mlx1NTk4Mlx1RkYxQWh0dHBzOi8veHh4LmZlaXNodS5jbi93aWtpL05PREVfVE9LRU5cdTMwMDEvZG9jeC9PQkpfVE9LRU4gXHU2MjE2IC9kb2MvT0JKX1RPS0VOXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlTm9kZVRva2VuRnJvbVVybCh1cmw6IHN0cmluZyk6IHsgbm9kZV90b2tlbj86IHN0cmluZzsgb2JqX3Rva2VuPzogc3RyaW5nIH0ge1xuICAvLyB3aWtpIG5vZGVcbiAgY29uc3Qgd2lraU1hdGNoID0gdXJsLm1hdGNoKC9cXC93aWtpXFwvKFtBLVphLXowLTldKykvKTtcbiAgaWYgKHdpa2lNYXRjaCkgcmV0dXJuIHsgbm9kZV90b2tlbjogd2lraU1hdGNoWzFdIH07XG5cbiAgLy8gZG9jeCBvYmpcbiAgY29uc3QgZG9jeE1hdGNoID0gdXJsLm1hdGNoKC9cXC9kb2N4XFwvKFtBLVphLXowLTldKykvKTtcbiAgaWYgKGRvY3hNYXRjaCkgcmV0dXJuIHsgb2JqX3Rva2VuOiBkb2N4TWF0Y2hbMV0gfTtcblxuICByZXR1cm4ge307XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2IHdpa2kgXHU4MjgyXHU3MEI5XHU3Njg0IGRvY3ggb2JqX3Rva2VuXHUzMDAyXG4gKiBgd2lraSArbm9kZS1nZXQgLS1ub2RlLXRva2VuIDx1cmw+IC0tc3BhY2UtaWQgPGlkPmBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFdpa2lOb2RlSW5mbyhub2RlVG9rZW46IHN0cmluZywgc3BhY2VJZDogc3RyaW5nKTogeyBvYmpfdG9rZW46IHN0cmluZzsgdGl0bGU6IHN0cmluZyB9IHwgbnVsbCB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3V0cHV0ID0gcnVuKFtcbiAgICAgICd3aWtpJywgJytub2RlLWdldCcsXG4gICAgICAnLS1ub2RlLXRva2VuJywgbm9kZVRva2VuLFxuICAgICAgJy0tc3BhY2UtaWQnLCBzcGFjZUlkLFxuICAgIF0sIHsganNvbjogdHJ1ZSB9KTtcbiAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShvdXRwdXQpO1xuICAgIC8vIFx1ODI4Mlx1NzBCOVx1NTNFRlx1ODBGRFx1NjcwOSBub2RlIFx1NjIxNlx1NzZGNFx1NjNBNVx1NjYyRiBvYmpfdG9rZW5cbiAgICBjb25zdCBvYmpUb2tlbiA9IGRhdGE/Lm5vZGU/Lm9ial90b2tlbiA/PyBkYXRhPy5vYmpfdG9rZW4gPz8gZGF0YT8ub2JqX3Rva2VuO1xuICAgIGNvbnN0IHRpdGxlID0gZGF0YT8ubm9kZT8udGl0bGUgPz8gZGF0YT8udGl0bGUgPz8gJyc7XG4gICAgaWYgKG9ialRva2VuKSByZXR1cm4geyBvYmpfdG9rZW46IG9ialRva2VuLCB0aXRsZSB9O1xuICAgIHJldHVybiBudWxsO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2xhcmtdIHdpa2kgK25vZGUtZ2V0IGZhaWxlZDonLCBlcnIpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU5OERFXHU0RTY2XHU3N0U1XHU4QkM2XHU1RTkzXHU1QjUwXHU4MjgyXHU3MEI5XHU1MjE3XHU4ODY4XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaXN0V2lraUNoaWxkcmVuKHNwYWNlSWQ6IHN0cmluZywgcGFyZW50VG9rZW46IHN0cmluZyk6IEFycmF5PHsgbm9kZV90b2tlbjogc3RyaW5nOyB0aXRsZTogc3RyaW5nOyBvYmpfdG9rZW46IHN0cmluZyB9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3V0cHV0ID0gcnVuKFtcbiAgICAgICd3aWtpJywgJytub2RlLWxpc3QnLFxuICAgICAgJy0tc3BhY2UtaWQnLCBzcGFjZUlkLFxuICAgICAgJy0tcGFyZW50LW5vZGUtdG9rZW4nLCBwYXJlbnRUb2tlbixcbiAgICBdLCB7IGpzb246IHRydWUgfSk7XG4gICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2Uob3V0cHV0KTtcbiAgICBjb25zdCBpdGVtcyA9IGRhdGE/Lml0ZW1zID8/IGRhdGE/Lm5vZGVzID8/IFtdO1xuICAgIHJldHVybiBpdGVtcy5tYXAoKG46IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgbm9kZV90b2tlbjogbi5ub2RlX3Rva2VuID8/ICcnLFxuICAgICAgdGl0bGU6IG4udGl0bGUgPz8gJycsXG4gICAgICBvYmpfdG9rZW46IG4ub2JqX3Rva2VuID8/ICcnLFxuICAgIH0pKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS53YXJuKCdbc3luYy9sYXJrXSB3aWtpICtub2RlLWxpc3QgZmFpbGVkOicsIGVycik7XG4gICAgcmV0dXJuIFtdO1xuICB9XG59XG4iLCAiLyoqXG4gKiBcdTU0MENcdTZCNjVcdTdFRDFcdTVCOUEgKyBZQU1MIGZyb250bWF0dGVyIFx1NjU3MFx1NjM2RVx1NkEyMVx1NTc4Qlx1MzAwMlxuICpcbiAqIFx1NEY5RFx1NjM2RVx1RkYxQWBcdThCQkVcdThCQTFcdTY1QjlcdTY4NDgvMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGBcdUZGMDhcdTY3NDNcdTVBMDEgdjFcdUZGMDkrIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgIFx1MDBBNzUuMVx1MzAwMlxuICogXHU5NEMxXHU1RjhCXHVGRjFBXHU1NDBDXHU2QjY1XHU3RUQxXHU1QjlBXHU3RUM0XHVGRjA4ZmVpc2h1XypcdUZGMDlcdTc1MzFcdTYzRDJcdTRFRjZcdTgxRUFcdTUyQThcdTUxOTlcdUZGMENcdTc1MjhcdTYyMzdcdTRFMERcdTUzRUZcdTYyNEJcdTY1MzlcdTMwMDJcbiAqL1xuXG4vKiogXHU1NDBDXHU2QjY1XHU3RUQxXHU1QjlBXHU3RUM0XHVGRjA4XHU2ODM4XHU1RkMzXHVGRjBDXHU0RTBEXHU1M0VGXHU2MjRCXHU2NTM5XHVGRjA5XHUzMDAyXHU1QkY5XHU1RTk0IFlBTUwgXHU1NDBDXHU2QjY1XHU3RUQxXHU1QjlBXHU2QkI1XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFN5bmNCaW5kaW5nIHtcbiAgLyoqIFx1OThERVx1NEU2NiB3aWtpIG5vZGVfdG9rZW5cdUZGMDhcdTU1MkZcdTRFMDBcdTdFRDFcdTVCOUFcdUZGMDlcdTMwMDIgKi9cbiAgZmVpc2h1X2lkOiBzdHJpbmc7XG4gIC8qKiBcdTk4REVcdTRFNjYgZG9jeCBvYmpfdG9rZW5cdUZGMDhcdTU2REVcdTUxOTlcdTc1MjhcdUZGMDlcdTMwMDIgKi9cbiAgZmVpc2h1X2RvY19pZDogc3RyaW5nO1xuICAvKiogXHU5OERFXHU0RTY2XHU1MzlGXHU1OUNCXHU2ODA3XHU5ODk4XHVGRjA4XHU1NDJCIGVtb2ppXHVGRjBDXHU1NkRFXHU1MTk5XHU2NUY2XHU3NTI4XHVGRjA5XHUzMDAyICovXG4gIGZlaXNodV90aXRsZTogc3RyaW5nO1xuICAvKiogXHU0RTBBXHU2QjIxXHU1NDBDXHU2QjY1XHU1MTg1XHU1QkI5IGhhc2hcdUZGMDhcdThGN0JcdTY4MzhcdTlBOENcdTc1MjhcdUZGMENzaGEyNTYgaGV4XHVGRjA5XHUzMDAyICovXG4gIHN5bmNfaGFzaD86IHN0cmluZztcbiAgLyoqIFx1NEUwQVx1NkIyMVx1NTQwQ1x1NkI2NVx1NjVGNlx1OTVGNFx1RkYwOElTTzg2MDFcdUZGMENcdTVFMjZcdTY1RjZcdTUzM0FcdUZGMDlcdTMwMDIgKi9cbiAgc3luY190aW1lPzogc3RyaW5nO1xufVxuXG4vKiogXHU2ODA3XHU3QjdFXHU1QzAxXHU5NUVEXHU2NzlBXHU0RTNFXHUzMDAyXHU0RjlEXHU2MzZFIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYCBcdTAwQTcyLjJcdTMwMDIgKi9cbmV4cG9ydCB0eXBlIFRhZyA9ICdTJyB8ICdYJyB8ICdMJyB8ICdaJyB8ICdRJyB8ICdKJztcblxuZXhwb3J0IGNvbnN0IFRBR19OQU1FUzogUmVjb3JkPFRhZywgc3RyaW5nPiA9IHtcbiAgUzogJ1x1RDgzRFx1RENFNVx1NjUzNlx1OTZDNicsXG4gIFg6ICdcdUQ4M0NcdURGQUZcdTk4NzlcdTc2RUUnLFxuICBMOiAnXHVEODNDXHVERjMzXHU5ODg2XHU1N0RGJyxcbiAgWjogJ1x1RDgzRFx1RENEQVx1OEQ0NFx1NkU5MCcsXG4gIFE6ICdcdUQ4M0RcdURDQTFcdTcwNzVcdTYxMUYnLFxuICBKOiAnXHVEODNEXHVERUUwXHVGRTBGXHU2MjgwXHU4MEZEJyxcbn07XG5cbi8qKiBcdTc3RTVcdThCQzZcdTVFOTNcdTUxNDNcdTY1NzBcdTYzNkVcdUZGMDhPQiBcdTdFRjRcdTYyQTRcdUZGMENcdTU2REVcdTUxOTlcdTk4REVcdTRFNjZcdTYyMTAgY2FsbG91dFx1RkYwOVx1MzAwMlx1NEY5RFx1NjM2RSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGBcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgS25vd2xlZGdlTWV0YSB7XG4gIC8qKiBcdTY4MDdcdTdCN0VcdUZGMENcdTVDMDFcdTk1RURcdTY3OUFcdTRFM0VcdTMwMDJcdTdGNkVcdTRGRTFcdTVFQTYgPDAuNiBcdTIxOTIgU1x1MzAwMiAqL1xuICBcdTY4MDdcdTdCN0U/OiBUYWc7XG4gIC8qKiBcdTdGMTZcdTc4MDFcdUZGMENhdXRvLXJlbmFtZSBcdTUyMDZcdTkxNERcdUZGMENcdTY4M0NcdTVGMEYgWVlfTU1ERF9cdTY4MDdcdTdCN0VfXHU1RThGXHU1M0Y3W19cdTVCNTBcdTVFOEZcdTUzRjddXHUzMDAyICovXG4gIFx1N0YxNlx1NzgwMT86IHN0cmluZztcbiAgLyoqIFx1OEY5M1x1NTE2NVx1NUI4Q1x1NjU3NFx1OERFRlx1NUY4NFx1RkYwOFx1NjcwMFx1NkRGMVx1NkNFOFx1NTE4Q1x1OERFRlx1NUY4NFx1RkYwOVx1MzAwMiAqL1xuICBcdThGOTNcdTUxNjU/OiBzdHJpbmc7XG4gIC8qKiBcdTY1RTVcdTY3MUZcdUZGMENJU08gXHU2ODNDXHU1RjBGIFlZWVktTU0tRERcdTMwMDIgKi9cbiAgXHU2NUU1XHU2NzFGPzogc3RyaW5nO1xuICAvKiogXHU2NUU1XHU2NzFGXHU3RDIyXHU1RjE1XHVGRjBDXHU1M0VGXHU5MDA5XHU5ODc5XHU2NTcwXHU3RUM0XHUzMDAyICovXG4gIFx1NjVFNVx1NjcxRlx1N0QyMlx1NUYxNT86IHN0cmluZ1tdO1xuICAvKiogXHU1MTczXHU5NTJFXHU4QkNEXHVGRjBDXHU5ODdGXHU1M0Y3XHU1MjA2XHU5Njk0XHUzMDAyICovXG4gIFx1NTE3M1x1OTUyRVx1OEJDRD86IHN0cmluZztcbiAgLyoqIFx1Njk4Mlx1OEZGMFx1RkYwQ1x1N0VEOVx1NTQwRVx1N0VFRCBBSSBcdTVGRUJcdTkwMUZcdThCQzZcdTUyMkJcdTY1ODdcdTY4NjNcdTUxODVcdTVCQjlcdTc1MjhcdTMwMDIgKi9cbiAgXHU2OTgyXHU4RkYwPzogc3RyaW5nO1xuICAvKiogXHU4QkM0XHU1MjA2IDEtNVx1RkYxQlx1NjcyQVx1OEJDNFx1NTIwNlx1NjVGNlx1NEZERFx1NzU1OVx1N0E3QVx1NTAzQ1x1NEVFNVx1NjYzRVx1NUYwRlx1NTM2MFx1NEY0RFx1MzAwMiAqL1xuICBcdThCQzRcdTUyMDY/OiBudW1iZXIgfCAnJztcbiAgLyoqIFx1OEJDNFx1NTIwNlx1NjYzRVx1NzkzQVx1NEUzMlx1RkYwQ1x1NTk4MiBcIlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RkY1Q1x1NUI5RVx1OERGNVwiXHUzMDAyICovXG4gIFx1OEJDNFx1NTIwNl9cdTY2M0VcdTc5M0E/OiBzdHJpbmc7XG4gIC8qKiBcdTdEMjJcdTVGMTVfXHU3N0U1XHU4QkM2XHU1RTkzXHVGRjA4XHU2QjYzXHU4RDIyL1x1NTA0Rlx1OEQyMi8uLi5cdUZGMDlcdTMwMDIgKi9cbiAgXHU3RDIyXHU1RjE1X1x1NzdFNVx1OEJDNlx1NUU5Mz86IHN0cmluZztcbiAgLyoqIFx1N0QyMlx1NUYxNV9cdTk4OUNcdTgyNzJcdTMwMDIgKi9cbiAgXHU3RDIyXHU1RjE1X1x1OTg5Q1x1ODI3Mj86IHN0cmluZztcbiAgLyoqIFx1N0QyMlx1NUYxNV9cdTY0Q0RcdTRGNUMmXHU1M0NEXHU5OTg4XHVGRjBDXHU0RTI0XHU3RUM0XHU5MDA5XHU0RTAwXHVGRjA4XHU2MEYzXHU2Q0Q1L1x1ODlDNFx1NTIxMi9cdTYyNjdcdTg4NEMvXHU1M0Q3XHU2MzJCL1x1NTE0Qlx1NjcwRCBcdTAwRDcgXHU1MjFEXHU3QTNGL1x1NUJBMVx1NjgzOC9cdTRGRUVcdTY1MzkvXHU1QjhDXHU2MjEwL1x1NTkwRFx1NzZEOFx1RkYwOVx1MzAwMiAqL1xuICAnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnPzogc3RyaW5nW107XG4gIC8qKiBcdTdEMjJcdTVGMTVfXHU1NzU3XHVGRjBDXHU1OTFBXHU5MDA5XHVGRjA4XHU1MTc3XHU4QzYxL1x1NjJCRFx1OEM2MSBcdTAwRDcgXHU3QjgwXHU1MzU1L1x1NTZGMFx1OTZCRVx1RkYwOVx1MzAwMiAqL1xuICBcdTdEMjJcdTVGMTVfXHU1NzU3Pzogc3RyaW5nW107XG4gIC8qKiBcdTdEMjJcdTVGMTVfXHU5OENFXHU5NjY5XHVGRjBDXHU5NkY2XHU2MjE2XHU1OTFBXHU0RTJBXHUzMDAyICovXG4gIFx1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2Njk/OiBzdHJpbmdbXTtcbn1cblxuLyoqIE9CIFx1NjU4N1x1NEVGNlx1NUI4Q1x1NjU3NCBmcm9udG1hdHRlciA9IFx1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QSArIFx1NzdFNVx1OEJDNlx1NUU5M1x1NTE0M1x1NjU3MFx1NjM2RVx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBZQU1MRnJvbnRtYXR0ZXIgZXh0ZW5kcyBTeW5jQmluZGluZywgS25vd2xlZGdlTWV0YSB7fVxuXG4vKiogT0JcdTIxOTJcdTk4REVcdTRFNjYgY2FsbG91dCBcdTVCNTdcdTZCQjVcdTY2MjBcdTVDMDRcdTk4NzlcdTMwMDJcdTRGOURcdTYzNkUgYDAyX1lBTUxcdTVCNTdcdTZCQjVcdTg5QzRcdTgzMDMubWRgIFx1MDBBN1x1NEU5NFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBDYWxsb3V0RmllbGRNYXAge1xuICAvKiogWUFNTCBcdTVCNTdcdTZCQjVcdTU0MERcdTMwMDIgKi9cbiAgZmllbGQ6IGtleW9mIEtub3dsZWRnZU1ldGE7XG4gIC8qKiBjYWxsb3V0IFx1OTFDQ1x1NjYzRVx1NzkzQVx1NzY4NFx1NEUyRFx1NjU4N1x1NjgwN1x1N0I3RVx1MzAwMiAqL1xuICBsYWJlbDogc3RyaW5nO1xuICAvKiogZW1vamlcdUZGMDhcdTRFMERcdTVFMjYgdmFyaWF0aW9uIHNlbGVjdG9yXHVGRjA5XHUzMDAyICovXG4gIGVtb2ppOiBzdHJpbmc7XG59XG5cbi8qKlxuICogWUFNTCBcdTVCNTdcdTZCQjUgXHUyMTkyIFx1OThERVx1NEU2NiBjYWxsb3V0IFx1ODg0Q1x1NjYyMFx1NUMwNFx1MzAwMlx1NEY5RFx1NjM2RSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU0RTk0XHUzMDAyXG4gKiBcdTZDRThcdTYxMEYgZW1vamkgXHU1MTY4XHU5MEU4XHU0RTBEXHU1RTI2IFUrRkUwRlx1RkYwOFx1OThERVx1NEU2Nlx1NEUwRFx1OEJBNCBWU1x1RkYwQ1x1ODlDMSAwMyBcdTY1ODdcdTY4NjMgXHUwMEE3My4zXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBjb25zdCBDQUxMT1VUX0ZJRUxEX01BUDogQ2FsbG91dEZpZWxkTWFwW10gPSBbXG4gIHsgZmllbGQ6ICdcdTY4MDdcdTdCN0UnLCBsYWJlbDogJ1x1NjgwN1x1N0I3RScsIGVtb2ppOiAnXHVEODNDXHVERkY3JyB9LFxuICB7IGZpZWxkOiAnXHU3RjE2XHU3ODAxJywgbGFiZWw6ICdcdTdGMTZcdTc4MDEnLCBlbW9qaTogJ1x1RDgzRFx1REQyMicgfSxcbiAgeyBmaWVsZDogJ1x1OEY5M1x1NTE2NScsIGxhYmVsOiAnXHU4RjkzXHU1MTY1JywgZW1vamk6ICdcdUQ4M0RcdURDRTUnIH0sXG4gIHsgZmllbGQ6ICdcdTY1RTVcdTY3MUYnLCBsYWJlbDogJ1x1NjVFNVx1NjcxRicsIGVtb2ppOiAnXHVEODNEXHVEQ0M1JyB9LFxuICB7IGZpZWxkOiAnXHU1MTczXHU5NTJFXHU4QkNEJywgbGFiZWw6ICdcdTUxNzNcdTk1MkVcdThCQ0QnLCBlbW9qaTogJ1x1RDgzRFx1REQxMScgfSxcbiAgeyBmaWVsZDogJ1x1OEJDNFx1NTIwNl9cdTY2M0VcdTc5M0EnLCBsYWJlbDogJ1x1OEJDNFx1NTIwNicsIGVtb2ppOiAnXHUyQjUwJyB9LFxuICB7IGZpZWxkOiAnXHU3RDIyXHU1RjE1X1x1NzdFNVx1OEJDNlx1NUU5MycsIGxhYmVsOiAnXHU3RDIyXHU1RjE1JywgZW1vamk6ICdcdUQ4M0RcdURDQjAnIH0sXG5dO1xuXG4vKiogT0JcdTIxOTJcdTk4REVcdTRFNjYgY2FsbG91dCBcdTY1NzRcdTRGNTNcdTkxNERcdTgyNzJcdUZGMDhcdTU0MDhcdTVFNzZcdTRGRTFcdTYwNkZcdTU3NTdcdTc1MjhcdUZGMDlcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBET0NfSU5GT19DQUxMT1VUID0ge1xuICBlbW9qaTogJ1x1RDgzRFx1RENDQicsXG4gICdiYWNrZ3JvdW5kLWNvbG9yJzogJ2xpZ2h0LWJsdWUnLFxuICAnYm9yZGVyLWNvbG9yJzogJ2JsdWUnLFxufSBhcyBjb25zdDtcblxuLyoqIFx1OThERVx1NEU2NiBjYWxsb3V0IFx1ODBDQ1x1NjY2Rlx1ODI3MiBcdTIxOTIgT0IgY2FsbG91dCBcdTdDN0JcdTU3OEJcdTMwMDJcdTRGOURcdTYzNkUgYDAzX1x1NjgzQ1x1NUYwRlx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3My4xXHUzMDAyICovXG5leHBvcnQgY29uc3QgRkVJU0hVX0JHX1RPX09CX0NBTExPVVQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICdsaWdodC15ZWxsb3cnOiAndGlwJyxcbiAgJ21lZGl1bS1yZWQnOiAnd2FybmluZycsXG4gICdsaWdodC1ncmVlbic6ICdzdWNjZXNzJyxcbiAgJ2xpZ2h0LWJsdWUnOiAnaW5mbycsXG4gICdsaWdodC1wdXJwbGUnOiAnbm90ZScsXG4gICdsaWdodC1ncmF5JzogJ3F1b3RlJyxcbiAgJ2xpZ2h0LW9yYW5nZSc6ICdmYXEnLFxufTtcblxuLyoqIE9CIGNhbGxvdXQgXHU3QzdCXHU1NzhCIFx1MjE5MiBcdTk4REVcdTRFNjYgY2FsbG91dCBcdTkxNERcdTgyNzJcdTMwMDJcdTAwQTczLjEgXHU1M0NEXHU1NDExXHUzMDAyICovXG5leHBvcnQgY29uc3QgT0JfQ0FMTE9VVF9UT19GRUlTSFU6IFJlY29yZDxzdHJpbmcsIHsgZW1vamk6IHN0cmluZzsgYmc6IHN0cmluZzsgYm9yZGVyOiBzdHJpbmcgfT4gPSB7XG4gIHRpcDogeyBlbW9qaTogJ1x1RDgzRFx1RENBMScsIGJnOiAnbGlnaHQteWVsbG93JywgYm9yZGVyOiAneWVsbG93JyB9LFxuICB3YXJuaW5nOiB7IGVtb2ppOiAnXHUyNkEwXHVGRTBGJywgYmc6ICdtZWRpdW0tcmVkJywgYm9yZGVyOiAncmVkJyB9LFxuICBzdWNjZXNzOiB7IGVtb2ppOiAnXHUyNzA1JywgYmc6ICdsaWdodC1ncmVlbicsIGJvcmRlcjogJ2dyZWVuJyB9LFxuICBpbmZvOiB7IGVtb2ppOiAnXHUyMTM5XHVGRTBGJywgYmc6ICdsaWdodC1ibHVlJywgYm9yZGVyOiAnYmx1ZScgfSxcbiAgbm90ZTogeyBlbW9qaTogJ1x1RDgzRFx1RENERCcsIGJnOiAnbGlnaHQtcHVycGxlJywgYm9yZGVyOiAncHVycGxlJyB9LFxuICBxdW90ZTogeyBlbW9qaTogJ1x1RDgzRFx1RENBQycsIGJnOiAnbGlnaHQtZ3JheScsIGJvcmRlcjogJ2dyYXknIH0sXG4gIGZhcTogeyBlbW9qaTogJ1x1Mjc1MycsIGJnOiAnbGlnaHQtb3JhbmdlJywgYm9yZGVyOiAnb3JhbmdlJyB9LFxuICBhYnN0cmFjdDogeyBlbW9qaTogJ1x1RDgzRFx1RENDQicsIGJnOiAnbGlnaHQtYmx1ZScsIGJvcmRlcjogJ2JsdWUnIH0sXG59O1xuIiwgImltcG9ydCB0eXBlIHsgS25vd2xlZGdlTWV0YSB9IGZyb20gJy4vdHlwZXMuanMnO1xuXG4vKipcbiAqIGxvY2FsaG9zdCBIVFRQIFx1NTM0Rlx1OEJBRVx1NTk1MVx1N0VBNlx1RkYwOE9CIFx1NjNEMlx1NEVGNiBcdTIxOTQgXHU2RDRGXHU4OUM4XHU1NjY4XHU2MjY5XHU1QzU1XHVGRjA5XHUzMDAyXG4gKlxuICogXHU0RjlEXHU2MzZFXHVGRjFBYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3NC4yICsgXHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExXHVGRjA4XHU1ODZCXHU4ODY1XHU2NTg3XHU2ODYzXHU3RjNBXHU1M0UzXHVGRjA5XHUzMDAyXG4gKiBcdTkyNzRcdTY3NDNcdUZGMUFcdTZCQ0ZcdTRFMkFcdThCRjdcdTZDNDJcdTVFMjYgaGVhZGVyIGBYLVN5bmMtVG9rZW46IDxcdTU0MkZcdTUyQThcdTRFRTRcdTcyNEM+YFx1MzAwMlxuICogQ09SU1x1RkYxQU9CIHNlcnZlciBcdTVGQzVcdTk4N0JcdTY1M0VcdTkwMUEgT1BUSU9OUyBcdTk4ODRcdTY4QzBcdUZGMDhcdTYyNjlcdTVDNTVcdTRFQ0VcdTk4REVcdTRFNjZcdTk4NzVcdTk3NjJcdTUzRDFcdThENzcgZmV0Y2ggXHU0RjFBXHU4OEFCXHU2MkU2XHVGRjA5XHUzMDAyXG4gKi9cblxuLyoqIFx1OUVEOFx1OEJBNFx1N0FFRlx1NTNFM1x1MzAwMlx1NTNFRlx1NTcyOCBPQiBcdTYzRDJcdTRFRjZcdThCQkVcdTdGNkVcdTk4NzVcdTY1MzlcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BPUlQgPSA0NTY3O1xuXG4vKiogXHU5Mjc0XHU2NzQzIGhlYWRlciBcdTU0MERcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBUT0tFTl9IRUFERVIgPSAnWC1TeW5jLVRva2VuJztcblxuLyoqIFx1OThERVx1NEU2Nlx1NjU4N1x1Njg2MyBVUkwgXHU4OUUzXHU2NzkwXHU3RUQzXHU2NzlDXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIEZlaXNodURvY1JlZiB7XG4gIC8qKiB3aWtpIG5vZGVfdG9rZW5cdUZGMDhcdTRGMThcdTUxNDhcdTc1MjhcdUZGMENcdTU1MkZcdTRFMDBcdTdFRDFcdTVCOUFcdUZGMDlcdTMwMDIgKi9cbiAgbm9kZV90b2tlbj86IHN0cmluZztcbiAgLyoqIGRvY3ggb2JqX3Rva2VuXHVGRjA4XHU1NkRFXHU1MTk5XHU3NTI4XHVGRjA5XHUzMDAyICovXG4gIG9ial90b2tlbj86IHN0cmluZztcbiAgLyoqIHNwYWNlX2lkXHVGRjA4XHU5MEU4XHU1MjA2XHU2NENEXHU0RjVDXHU5NzAwXHU4OTgxXHVGRjBDXHU1M0VGXHU5MDA5XHVGRjA5XHUzMDAyICovXG4gIHNwYWNlX2lkPzogc3RyaW5nO1xufVxuXG4vKiogR0VUIC9zdGF0dXMgXHU1NENEXHU1RTk0XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFN0YXR1c1Jlc3BvbnNlIHtcbiAgb2s6IHRydWU7XG4gIC8qKiBcdTYzRDJcdTRFRjZcdTcyNDhcdTY3MkNcdTMwMDIgKi9cbiAgdmVyc2lvbjogc3RyaW5nO1xuICAvKiogdmF1bHQgXHU1NDBEXHUzMDAyICovXG4gIHZhdWx0OiBzdHJpbmc7XG4gIC8qKiBsYXJrLWNsaSBcdTY2MkZcdTU0MjZcdTVDMzFcdTdFRUFcdTMwMDIgKi9cbiAgbGFya1JlYWR5OiBib29sZWFuO1xuICAvKiogbGFyay1jbGkgXHU3MjQ4XHU2NzJDXHVGRjA4XHU2M0EyXHU2RDRCXHU0RTBEXHU1MjMwXHU2NUY2XHU0RTNBIG51bGxcdUZGMDlcdTMwMDIgKi9cbiAgbGFya1ZlcnNpb246IHN0cmluZyB8IG51bGw7XG59XG5cbi8qKiBcdTc2RUVcdTVGNTVcdTY4MTFcdTgyODJcdTcwQjlcdUZGMDhcdTdFRDlcdTYyNjlcdTVDNTVcdTc2RUVcdTVGNTVcdTRFMEJcdTYyQzlcdTc1MjhcdUZGMDlcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHJlZU5vZGUge1xuICAvKiogXHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1NzY4NFx1OERFRlx1NUY4NFx1RkYwQ1x1NTk4MiBcIjBcdUZFMEZcdTIwRTNcdThGOTNcdTUxNjUvXHVEODNEXHVEQ0ExXHU3ODhFXHU3MjQ3XHU4RjkzXHU1MTY1XHVGRjA4XHU5NUVBXHU1RkY1XHVGRjA5XCJcdTMwMDIgKi9cbiAgcGF0aDogc3RyaW5nO1xuICAvKiogXHU2NjNFXHU3OTNBXHU1NDBEXHVGRjA4XHU2NzAwXHU1NDBFXHU0RTAwXHU2QkI1XHVGRjA5XHUzMDAyICovXG4gIGxhYmVsOiBzdHJpbmc7XG4gIC8qKiBcdTZERjFcdTVFQTZcdUZGMDhcdTY4Mzk9MFx1RkYwOVx1MzAwMiAqL1xuICBkZXB0aDogbnVtYmVyO1xufVxuXG4vKiogR0VUIC90cmVlIFx1NTRDRFx1NUU5NFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBUcmVlUmVzcG9uc2Uge1xuICBvazogdHJ1ZTtcbiAgZGlyczogVHJlZU5vZGVbXTtcbn1cblxuLyoqIFBPU1QgL2ZldGNoIFx1OEJGN1x1NkM0Mlx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBGZXRjaFJlcXVlc3Qge1xuICAvKiogXHU1RkM1XHU1ODZCXHVGRjFBd2lraSBub2RlX3Rva2VuXHUzMDAyICovXG4gIG5vZGVfdG9rZW46IHN0cmluZztcbiAgLyoqIFx1NTNFRlx1OTAwOVx1RkYxQWRvY3ggb2JqX3Rva2VuXHVGRjA4XHU2NzJBXHU3RUQ5XHU1MjE5XHU2M0QyXHU0RUY2XHU3NTI4IHdpa2kgK25vZGUtZ2V0IFx1ODlFM1x1Njc5MFx1RkYwOVx1MzAwMiAqL1xuICBvYmpfdG9rZW4/OiBzdHJpbmc7XG4gIC8qKiBcdTUzRUZcdTkwMDlcdUZGMUFzcGFjZV9pZFx1MzAwMiAqL1xuICBzcGFjZV9pZD86IHN0cmluZztcbiAgLyoqIFx1ODQzRFx1NTczMFx1NzZFRVx1NUY1NVx1RkYwOFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdUZGMDlcdUZGMENcdTY3MkFcdTdFRDlcdTc1MjhcdThCQkVcdTdGNkVcdTlFRDhcdThCQTRcdTUwM0NcdTMwMDIgKi9cbiAgZGlyPzogc3RyaW5nO1xuICAvKiogXHU4OTg2XHU3NkQ2XHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU0RTBEXHU1NDJCXHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA5XHVGRjBDXHU2NzJBXHU3RUQ5XHU3NTI4XHU5OERFXHU0RTY2XHU2ODA3XHU5ODk4XHU2RTA1XHU2RDE3XHU3RUQzXHU2NzlDXHUzMDAyICovXG4gIGZpbGVuYW1lPzogc3RyaW5nO1xuICAvKiogXHU2RDRGXHU4OUM4XHU1NjY4XHU1NDBDXHU2QjY1XHU1MjREXHU3ODZFXHU4QkE0XHU1NDBFXHU3Njg0IFlBTUwgXHU1MTQzXHU2NTcwXHU2MzZFXHU4OTg2XHU3NkQ2XHVGRjFCXHU0RUM1XHU5NjUwXHU3N0U1XHU4QkM2XHU1RTkzXHU1MTQzXHU2NTcwXHU2MzZFXHU1QjU3XHU2QkI1XHUzMDAyICovXG4gIG1ldGE/OiBQYXJ0aWFsPEtub3dsZWRnZU1ldGE+O1xuICAvKiogT0IgXHU1MTg1XHU5MEU4XHU0RjdGXHU3NTI4XHVGRjFBQ2xpcHBlciBcdTUzNjBcdTRGNERcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdUZGMENcdTU0N0RcdTRFMkRcdTY1RjZcdTUzOUZcdTRGNERcdTg5ODZcdTc2RDZcdTMwMDIgKi9cbiAgcmVwbGFjZV9wYXRoPzogc3RyaW5nO1xufVxuXG4vKiogUE9TVCAvZmV0Y2ggXHU1NENEXHU1RTk0XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIEZldGNoUmVzcG9uc2Uge1xuICBvazogdHJ1ZTtcbiAgLyoqIFx1ODQzRFx1NTczMFx1NUI4Q1x1NjU3NFx1OERFRlx1NUY4NFx1RkYwOFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdUZGMDlcdTMwMDIgKi9cbiAgcGF0aDogc3RyaW5nO1xuICAvKiogXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU1NDJCXHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA5XHUzMDAyICovXG4gIGZpbGVuYW1lOiBzdHJpbmc7XG4gIC8qKiBcdTY3MkNcdTZCMjFcdTY2MkZcdTY1QjBcdTVFRkFcdThGRDhcdTY2MkZcdTY2RjRcdTY1QjBcdTMwMDIgKi9cbiAgYWN0aW9uOiAnY3JlYXRlZCcgfCAndXBkYXRlZCc7XG4gIC8qKiBcdTUyMDZcdTkxNERcdTUyMzBcdTc2ODRcdTdGMTZcdTc4MDFcdUZGMDhhdXRvLXJlbmFtZSBcdTg5RTZcdTUzRDFcdTU0MEVcdUZGMDlcdTMwMDIgKi9cbiAgXHU3RjE2XHU3ODAxPzogc3RyaW5nO1xuICAvKiogXHU5OERFXHU0RTY2XHU1MzlGXHU1OUNCXHU2ODA3XHU5ODk4XHUzMDAyICovXG4gIGZlaXNodV90aXRsZTogc3RyaW5nO1xufVxuXG4vKiogUE9TVCAvY2xpcCBcdThCRjdcdTZDNDJcdUZGMUFcdTRFRkJcdTYxMEZcdTdGNTFcdTk4NzUvXHU1MjEyXHU4QkNEXHU1MjZBXHU1QjU4XHU1MjMwIE9ic2lkaWFuXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIENsaXBSZXF1ZXN0IHtcbiAgLyoqIFx1N0Y1MVx1OTg3NVx1NjgwN1x1OTg5OFx1MzAwMiAqL1xuICB0aXRsZT86IHN0cmluZztcbiAgLyoqIFx1Njc2NVx1NkU5MCBVUkxcdTMwMDIgKi9cbiAgdXJsPzogc3RyaW5nO1xuICAvKiogXHU2NzY1XHU2RTkwXHU3QzdCXHU1NzhCXHUzMDAyICovXG4gIHNvdXJjZUtpbmQ/OiAnZmVpc2h1LWJhc2UnIHwgJ2FydGljbGUnIHwgJ3NlbGVjdGlvbicgfCAnZ2VuZXJpYy1wYWdlJztcbiAgLyoqIFx1OTAwOVx1NEUyRFx1NjU4N1x1NjcyQ1x1NjIxNlx1NkI2M1x1NjU4N1x1NjQ1OFx1ODk4MVx1MzAwMiAqL1xuICB0ZXh0Pzogc3RyaW5nO1xuICAvKiogQUkgXHU2MjE2XHU4OUM0XHU1MjE5XHU4RjZDXHU2MzYyXHU1NDBFXHU3Njg0IE9ic2lkaWFuIE1hcmtkb3duIFx1NkI2M1x1NjU4N1x1MzAwMiAqL1xuICBib2R5TWFya2Rvd24/OiBzdHJpbmc7XG4gIC8qKiBcdTUzOUZcdTU5Q0JcdTUzRUZcdTg5QzFcdTY1ODdcdTY3MkNcdTMwMDIgKi9cbiAgcmF3VGV4dD86IHN0cmluZztcbiAgLyoqIFx1OTg3NVx1OTc2Mlx1NjNDRlx1OEZGMFx1MzAwMiAqL1xuICBkZXNjcmlwdGlvbj86IHN0cmluZztcbiAgLyoqIFx1ODQzRFx1NTczMFx1NzZFRVx1NUY1NVx1RkYwOFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdUZGMDlcdTMwMDJcdTY3MkFcdTdFRDlcdTc1MjggT0IgXHU2M0QyXHU0RUY2XHU5RUQ4XHU4QkE0XHU3NkVFXHU1RjU1XHUzMDAyICovXG4gIGRpcj86IHN0cmluZztcbiAgLyoqIFx1NTJGRVx1OTAwOVx1MjAxQ1x1ODg2NVx1NTE0NVx1NTIzMFx1NURGMlx1NjcwOVx1NjU4N1x1Njg2M1x1MjAxRFx1NjVGNlx1RkYwQ1x1OEZGRFx1NTJBMFx1NTIzMFx1OEZEOVx1NEUyQVx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdTc2ODQgTWFya2Rvd24gXHU4REVGXHU1Rjg0XHUzMDAyICovXG4gIGFwcGVuZFBhdGg/OiBzdHJpbmc7XG4gIC8qKiBcdTVERjJcdTYzMDlcdTYzRDJcdTRFRjZcdTk4ODRcdThCQkVcdTVGNTJcdTRFMDBcdTUzMTZcdTc2ODQgWUFNTCBcdTUxNDNcdTY1NzBcdTYzNkVcdTMwMDIgKi9cbiAgbWV0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG4vKiogUE9TVCAvY2xpcCBcdTU0Q0RcdTVFOTRcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2xpcFJlc3BvbnNlIHtcbiAgb2s6IHRydWU7XG4gIC8qKiBcdTg0M0RcdTU3MzBcdTVCOENcdTY1NzRcdThERUZcdTVGODRcdUZGMDhcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHVGRjA5XHUzMDAyICovXG4gIHBhdGg6IHN0cmluZztcbiAgLyoqIFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NTQyQlx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOVx1MzAwMiAqL1xuICBmaWxlbmFtZTogc3RyaW5nO1xuICAvKiogXHU2NzJDXHU2QjIxXHU2NjJGXHU2NUIwXHU1RUZBXHU4RkQ4XHU2NjJGXHU2NkY0XHU2NUIwXHUzMDAyICovXG4gIGFjdGlvbjogJ2NyZWF0ZWQnIHwgJ3VwZGF0ZWQnO1xufVxuXG4vKiogUE9TVCAvZXhpc3RzIFx1OEJGN1x1NkM0Mlx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeGlzdHNSZXF1ZXN0IHtcbiAgbm9kZV90b2tlbjogc3RyaW5nO1xufVxuXG4vKiogUE9TVCAvZXhpc3RzIFx1NTRDRFx1NUU5NFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeGlzdHNSZXNwb25zZSB7XG4gIG9rOiB0cnVlO1xuICBleGlzdHM6IGJvb2xlYW47XG4gIC8qKiBcdTVERjJcdTVCNThcdTU3MjhcdTY1RjZcdTdFRDlcdTUxRkFcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHU4REVGXHU1Rjg0XHUzMDAyICovXG4gIHBhdGg/OiBzdHJpbmc7XG59XG5cbi8qKiBQT1NUIC9wdXNoYmFjayBcdThCRjdcdTZDNDJcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVzaGJhY2tSZXF1ZXN0IHtcbiAgLyoqIFx1NEU4Q1x1OTAwOVx1NEUwMFx1RkYxQVx1NjcyQ1x1NTczMFx1OERFRlx1NUY4NFx1RkYwOFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdUZGMDlcdTMwMDIgKi9cbiAgcGF0aD86IHN0cmluZztcbiAgLyoqIFx1NEU4Q1x1OTAwOVx1NEUwMFx1RkYxQW5vZGVfdG9rZW5cdUZGMDhcdTRFQ0VcdTdFRDFcdTVCOUFcdTYyN0VcdTY1ODdcdTRFRjZcdUZGMDlcdTMwMDIgKi9cbiAgbm9kZV90b2tlbj86IHN0cmluZztcbiAgLyoqIFx1NUYzQVx1NTIzNlx1NTZERVx1NTE5OVx1RkYwOFx1NUZGRFx1NzU2NSBoYXNoIFx1NEUwMFx1ODFGNFx1OERGM1x1OEZDN1x1RkYwOVx1MzAwMiAqL1xuICBmb3JjZT86IGJvb2xlYW47XG59XG5cbi8qKiBQT1NUIC9wdXNoYmFjayBcdTU0Q0RcdTVFOTRcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVzaGJhY2tSZXNwb25zZSB7XG4gIG9rOiB0cnVlO1xuICAvKiogXHU1QjlFXHU5NjQ1XHU1NkRFXHU1MTk5XHU4RkQ4XHU2NjJGXHU4REYzXHU4RkM3XHVGRjA4aGFzaCBcdTRFMDBcdTgxRjRcdUZGMDlcdTMwMDIgKi9cbiAgYWN0aW9uOiAncHVzaGVkJyB8ICdza2lwcGVkJztcbiAgLyoqIFx1NjVCMFx1NzY4NCBzeW5jX2hhc2hcdTMwMDIgKi9cbiAgaGFzaD86IHN0cmluZztcbiAgLyoqIFx1NTZERVx1NTE5OVx1NzY4NFx1OThERVx1NEU2Nlx1NjU4N1x1Njg2M1x1NjgwN1x1OTg5OFx1MzAwMiAqL1xuICB0aXRsZT86IHN0cmluZztcbn1cblxuLyoqIFx1N0VERlx1NEUwMFx1OTUxOVx1OEJFRlx1NTRDRFx1NUU5NFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBFcnJvclJlc3BvbnNlIHtcbiAgb2s6IGZhbHNlO1xuICAvKiogXHU2NzNBXHU1NjY4XHU1M0VGXHU4QkZCXHU5NTE5XHU4QkVGXHU3ODAxXHUzMDAyICovXG4gIGNvZGU6IHN0cmluZztcbiAgLyoqIFx1NEVCQVx1N0M3Qlx1NTNFRlx1OEJGQlx1NkQ4OFx1NjA2Rlx1MzAwMiAqL1xuICBtZXNzYWdlOiBzdHJpbmc7XG59XG5cbi8qKiBcdTYyNDBcdTY3MDlcdTdBRUZcdTcwQjlcdTVCOUFcdTRFNDlcdUZGMDhcdThERUZcdTVGODQgKyBcdTY1QjlcdTZDRDVcdUZGMDlcdUZGMENcdTRGOUJcdTRFMjRcdTdBRUZcdTVGMTVcdTc1MjhcdTkwN0ZcdTUxNERcdTYyRkNcdTUxOTlcdTZGMDJcdTc5RkJcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBFTkRQT0lOVFMgPSB7XG4gIHN0YXR1czogJy9zdGF0dXMnLFxuICB0cmVlOiAnL3RyZWUnLFxuICBmZXRjaDogJy9mZXRjaCcsXG4gIGNsaXA6ICcvY2xpcCcsXG4gIGV4aXN0czogJy9leGlzdHMnLFxuICBwdXNoYmFjazogJy9wdXNoYmFjaycsXG59IGFzIGNvbnN0O1xuXG4vKiogT2JzaWRpYW4gXHU3Q0ZCXHU3RURGXHU1MzRGXHU4QkFFXHVGRjFBXHU2RDRGXHU4OUM4XHU1NjY4XHU0RTNCXHU5MDFBXHU5MDUzXHU1MkE4XHU0RjVDXHU1NDBEXHUzMDAyICovXG5leHBvcnQgY29uc3QgT0JTSURJQU5fTEFSS19ET0NfQUNUSU9OID0gJ2xhcmstZG9jJztcblxuLyoqIE9ic2lkaWFuIFx1N0NGQlx1N0VERlx1NTM0Rlx1OEJBRVx1RkYxQVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NEUzQlx1OTAxQVx1OTA1MyBVUkkgXHU1MjREXHU3RjAwXHUzMDAyICovXG5leHBvcnQgY29uc3QgT0JTSURJQU5fTEFSS19ET0NfVVJJX1BSRUZJWCA9IGBvYnNpZGlhbjovLyR7T0JTSURJQU5fTEFSS19ET0NfQUNUSU9OfWA7XG5cbi8qKiBvYnNpZGlhbjovL2xhcmstZG9jIFx1NTNDMlx1NjU3MFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBPYnNpZGlhbkxhcmtEb2NQYXJhbXMge1xuICAvKiogdjMgXHU0RTNCXHU5MDFBXHU5MDUzXHU1MTdDXHU1QkI5XHU1QjU3XHU2QkI1XHVGRjBDXHU0RjE4XHU1MTQ4XHU0RjIwIHdpa2kgbm9kZV90b2tlblx1MzAwMiAqL1xuICB0b2tlbj86IHN0cmluZztcbiAgLyoqIHdpa2kgbm9kZV90b2tlblx1MzAwMiAqL1xuICBub2RlX3Rva2VuPzogc3RyaW5nO1xuICAvKiogZG9jeCBvYmpfdG9rZW5cdTMwMDIgKi9cbiAgb2JqX3Rva2VuPzogc3RyaW5nO1xuICAvKiogXHU5OERFXHU0RTY2XHU3N0U1XHU4QkM2XHU1RTkzIHNwYWNlX2lkXHUzMDAyICovXG4gIHNwYWNlX2lkPzogc3RyaW5nO1xuICAvKiogXHU5ODc1XHU5NzYyXHU2ODA3XHU5ODk4XHUzMDAyICovXG4gIHRpdGxlPzogc3RyaW5nO1xuICAvKiogXHU1MzlGXHU1OUNCXHU5OERFXHU0RTY2IFVSTFx1MzAwMiAqL1xuICB1cmw/OiBzdHJpbmc7XG4gIC8qKiBcdTUzRUZcdTkwMDlcdTc2RUVcdTY4MDdcdTc2RUVcdTVGNTVcdUZGMUJcdTRFM0FcdTdBN0FcdTY1RjZcdTc1MzEgT0IgXHU3QUVGXHU5MDA5XHU2MkU5XHU2MjE2XHU0RjdGXHU3NTI4XHU5RUQ4XHU4QkE0XHU3NkVFXHU1RjU1XHUzMDAyICovXG4gIGRpcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBcdTY3ODRcdTkwMjAgYG9ic2lkaWFuOi8vbGFyay1kb2NgIFVSSVx1MzAwMlxuICpcbiAqIFBvbnl0YWlsOiBcdTc1MjhcdTZENEZcdTg5QzhcdTU2NjhcdTU0OENcdTdDRkJcdTdFREZcdTVERjJcdTY3MDlcdTc2ODRcdTgxRUFcdTVCOUFcdTRFNDlcdTUzNEZcdThCQUVcdTgwRkRcdTUyOUJcdTYyN0ZcdThGN0RcdTRFM0JcdTkwMUFcdTkwNTNcdUZGMENcbiAqIFx1NEUwRFx1NTE4RFx1NEUzQVx1MjAxQ1x1NzBCOVx1NTFGQlx1OThERVx1NEU2Nlx1NjMwOVx1OTRBRVx1MjAxRFx1OTg5RFx1NTkxNlx1NTNEMVx1NjYwRVx1NEUwMFx1NTk1N1x1NTQwRVx1NTNGMFx1NkQ4OFx1NjA2Rlx1NTM0Rlx1OEJBRVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRPYnNpZGlhbkxhcmtEb2NVcmkocGFyYW1zOiBPYnNpZGlhbkxhcmtEb2NQYXJhbXMpOiBzdHJpbmcge1xuICBjb25zdCB0b2tlbiA9IHBhcmFtcy50b2tlbiB8fCBwYXJhbXMubm9kZV90b2tlbiB8fCBwYXJhbXMub2JqX3Rva2VuO1xuICBjb25zdCBxdWVyeTogQXJyYXk8W3N0cmluZywgc3RyaW5nIHwgdW5kZWZpbmVkXT4gPSBbXG4gICAgWyd0b2tlbicsIHRva2VuXSxcbiAgICBbJ25vZGVfdG9rZW4nLCBwYXJhbXMubm9kZV90b2tlbl0sXG4gICAgWydvYmpfdG9rZW4nLCBwYXJhbXMub2JqX3Rva2VuXSxcbiAgICBbJ3NwYWNlX2lkJywgcGFyYW1zLnNwYWNlX2lkXSxcbiAgICBbJ3RpdGxlJywgcGFyYW1zLnRpdGxlXSxcbiAgICBbJ3VybCcsIHBhcmFtcy51cmxdLFxuICAgIFsnZGlyJywgcGFyYW1zLmRpcl0sXG4gIF07XG4gIGNvbnN0IGVuY29kZWQgPSBxdWVyeVxuICAgIC5maWx0ZXIoKFssIHZhbHVlXSkgPT4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gJycpXG4gICAgLm1hcCgoW2tleSwgdmFsdWVdKSA9PiBgJHtlbmNvZGVVUklDb21wb25lbnQoa2V5KX09JHtlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKHZhbHVlKSl9YClcbiAgICAuam9pbignJicpO1xuICByZXR1cm4gZW5jb2RlZCA/IGAke09CU0lESUFOX0xBUktfRE9DX1VSSV9QUkVGSVh9PyR7ZW5jb2RlZH1gIDogT0JTSURJQU5fTEFSS19ET0NfVVJJX1BSRUZJWDtcbn1cblxuLyoqIFx1ODlFM1x1Njc5MCBgb2JzaWRpYW46Ly9sYXJrLWRvY2AgVVJJIFx1NjIxNiBPYnNpZGlhbiBwcm90b2NvbCBoYW5kbGVyIHBhcmFtc1x1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlT2JzaWRpYW5MYXJrRG9jUGFyYW1zKFxuICBpbnB1dDogc3RyaW5nIHwgVVJMU2VhcmNoUGFyYW1zIHwgUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgdW5kZWZpbmVkPixcbik6IE9ic2lkaWFuTGFya0RvY1BhcmFtcyB7XG4gIGNvbnN0IHNlYXJjaFBhcmFtcyA9ICgoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gaW5wdXQuaW5jbHVkZXMoJz8nKSA/IGlucHV0LnNsaWNlKGlucHV0LmluZGV4T2YoJz8nKSArIDEpIDogaW5wdXQ7XG4gICAgICByZXR1cm4gbmV3IFVSTFNlYXJjaFBhcmFtcyhxdWVyeSk7XG4gICAgfVxuICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcykgcmV0dXJuIGlucHV0O1xuICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhpbnB1dCkpIHtcbiAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSBwYXJhbXMuc2V0KGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyYW1zO1xuICB9KSgpO1xuXG4gIGNvbnN0IGdldCA9IChrZXk6IGtleW9mIE9ic2lkaWFuTGFya0RvY1BhcmFtcyk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PlxuICAgIHNlYXJjaFBhcmFtcy5nZXQoa2V5KSB8fCB1bmRlZmluZWQ7XG5cbiAgY29uc3QgcGFyc2VkOiBPYnNpZGlhbkxhcmtEb2NQYXJhbXMgPSB7fTtcbiAgZm9yIChjb25zdCBrZXkgb2YgWyd0b2tlbicsICdub2RlX3Rva2VuJywgJ29ial90b2tlbicsICdzcGFjZV9pZCcsICd0aXRsZScsICd1cmwnLCAnZGlyJ10gYXMgY29uc3QpIHtcbiAgICBjb25zdCB2YWx1ZSA9IGdldChrZXkpO1xuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSBwYXJzZWRba2V5XSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiBwYXJzZWQ7XG59XG5cbi8qKiBcdThGREJcdTVFQTZcdTk2MzZcdTZCQjVcdUZGMDhcdTYyNjlcdTVDNTVcdTZENkVcdTVDNDJcdTc1MjhcdUZGMDlcdTMwMDIgKi9cbmV4cG9ydCB0eXBlIFByb2dyZXNzU3RhZ2UgPVxuICB8ICdjb25uZWN0aW5nJ1xuICB8ICdmZXRjaGluZy1tZCdcbiAgfCAnZmV0Y2hpbmcteG1sJ1xuICB8ICdyZXdyaXRpbmctaW1hZ2VzJ1xuICB8ICd3cml0aW5nLWZpbGUnXG4gIHwgJ2Fzc2lnbmluZy1jb2RlJ1xuICB8ICdkb25lJ1xuICB8ICdlcnJvcic7XG4iLCAiLyoqXG4gKiBcdTUxODVcdTVCQjkgaGFzaFx1RkYwOFx1OEY3Qlx1NjgzOFx1OUE4Q1x1RkYwOVx1MzAwMlx1NEY5RFx1NjM2RSBgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTc2LjIgXHU2QjY1XHU5QUE0IDJcdTMwMDJcbiAqIFx1NzUyOCBzaGEyNTZcdUZGMENcdTUzRUEgaGFzaCBcdTZCNjNcdTY1ODdcdUZGMDhcdTRFMERcdTU0MkIgZnJvbnRtYXR0ZXIgXHU3Njg0IHN5bmNfKiBcdTVCNTdcdTZCQjVcdUZGMENcdTkwN0ZcdTUxNERcdTgxRUFcdTYzMDdcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdThERThcdTczQUZcdTU4ODNcdUZGMUFcdTRGMThcdTUxNDhcdTc1MjggV2ViIENyeXB0byBBUElcdUZGMDhcdTZENEZcdTg5QzhcdTU2NjggKyBOb2RlIDE4KyBcdTkwRkRcdTY3MDkgZ2xvYmFsVGhpcy5jcnlwdG8uc3VidGxlXHVGRjA5XHVGRjBDXG4gKiBmYWxsYmFjayBcdTUyMzAgbm9kZTpjcnlwdG9cdUZGMDhPQiBcdTYzRDJcdTRFRjYgbm9kZSBcdTczQUZcdTU4ODNcdTRGRERcdTk2NjlcdUZGMDlcdTMwMDJcbiAqL1xuXG4vKiogXHU1NDBDXHU2QjY1XHU3MjQ4IHNoYTI1NiBoZXhcdUZGMDhcdTRFQzUgTm9kZSBcdTczQUZcdTU4ODNcdUZGMDlcdTMwMDJcdTZENEZcdTg5QzhcdTU2NjhcdTc1MjggYm9keUhhc2hBc3luY1x1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJvZHlIYXNoKGJvZHk6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIE5vZGUgXHU3M0FGXHU1ODgzXG4gIHRyeSB7XG4gICAgY29uc3QgeyBjcmVhdGVIYXNoIH0gPSByZXF1aXJlKCdub2RlOmNyeXB0bycpIGFzIHR5cGVvZiBpbXBvcnQoJ25vZGU6Y3J5cHRvJyk7XG4gICAgcmV0dXJuIGNyZWF0ZUhhc2goJ3NoYTI1NicpLnVwZGF0ZShib2R5LCAndXRmOCcpLmRpZ2VzdCgnaGV4Jyk7XG4gIH0gY2F0Y2gge1xuICAgIC8vIFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NzNBRlx1NTg4M1x1NjVFMCByZXF1aXJlXHVGRjBDXHU4RDcwIGFzeW5jIFx1NzI0OFx1RkYwOFx1OEZEOVx1OTFDQ1x1NTQwQ1x1NkI2NVx1OEZENFx1NTZERSBmYWxsYmFja1x1RkYwQ1x1OEMwM1x1NzUyOFx1NjVCOVx1NUU5NFx1NzUyOCBhc3luYyBcdTcyNDhcdUZGMDlcbiAgICByZXR1cm4gc3luY0ZhbGxiYWNrSGFzaChib2R5KTtcbiAgfVxufVxuXG4vKipcbiAqIFx1NUYwMlx1NkI2NSBzaGEyNTYgaGV4XHVGRjA4XHU2RDRGXHU4OUM4XHU1NjY4ICsgTm9kZSBcdTkwMUFcdTc1MjhcdUZGMDlcdTMwMDJcdTYzQThcdTgzNTBcdTRGN0ZcdTc1MjhcdTMwMDJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJvZHlIYXNoQXN5bmMoYm9keTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgY3J5cHRvID0gZ2xvYmFsVGhpcy5jcnlwdG8gYXMgeyBzdWJ0bGU/OiB7IGRpZ2VzdDogKGFsZzogc3RyaW5nLCBkYXRhOiBBcnJheUJ1ZmZlcikgPT4gUHJvbWlzZTxBcnJheUJ1ZmZlcj4gfSB9O1xuICBpZiAoY3J5cHRvPy5zdWJ0bGUpIHtcbiAgICBjb25zdCBidWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRpZ2VzdCgnU0hBLTI1NicsIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShib2R5KS5idWZmZXIgYXMgQXJyYXlCdWZmZXIpO1xuICAgIHJldHVybiBbLi4ubmV3IFVpbnQ4QXJyYXkoYnVmKV0ubWFwKChiKSA9PiBiLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpKS5qb2luKCcnKTtcbiAgfVxuICByZXR1cm4gc3luY0ZhbGxiYWNrSGFzaChib2R5KTtcbn1cblxuLyoqXG4gKiBcdTdCODBcdTY2MTNcdTU0MENcdTZCNjUgZmFsbGJhY2tcdUZGMDhcdTk3NUVcdTUyQTBcdTVCQzZcdTdFQTdcdUZGMENcdTRFQzVcdTVGNTMgY3J5cHRvIEFQSSBcdTkwRkRcdTRFMERcdTUzRUZcdTc1MjhcdTY1RjZcdTc1MjhcdUZGMDlcdTMwMDJcbiAqIFx1NzUyOCBkamIyIFx1NTNEOFx1NzlDRFx1RkYwQ1x1NEZERFx1OEJDMVx1NEUwMFx1ODFGNFx1NjAyN1x1NTM3M1x1NTNFRlx1RkYwOFx1OEY3Qlx1NjgzOFx1OUE4Q1x1NTczQVx1NjY2Rlx1RkYwOVx1MzAwMlxuICovXG5mdW5jdGlvbiBzeW5jRmFsbGJhY2tIYXNoKGJvZHk6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBoMSA9IDB4ODExYzlkYzU7XG4gIGxldCBoMiA9IDB4MTAwMDE5MztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBib2R5Lmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgYyA9IGJvZHkuY2hhckNvZGVBdChpKTtcbiAgICBoMSA9IE1hdGguaW11bChoMSBeIGMsIDB4MDEwMDAxOTMpO1xuICAgIGgyID0gTWF0aC5pbXVsKGgyIF4gKGMgKyAweDllMzc3OWI5KSwgMHg4NWViY2E3Nyk7XG4gIH1cbiAgcmV0dXJuIChoMSA+Pj4gMCkudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDgsICcwJykgKyAoaDIgPj4+IDApLnRvU3RyaW5nKDE2KS5wYWRTdGFydCg4LCAnMCcpICsgJ19mYWxsYmFjayc7XG59XG5cbi8qKlxuICogXHU2QkQ0XHU1QkY5XHU2NjJGXHU1NDI2XHU1M0Q4XHU1MzE2XHUzMDAyXG4gKiBAcGFyYW0gY3VycmVudCBcdTVGNTNcdTUyNERcdTZCNjNcdTY1ODcgaGFzaFxuICogQHBhcmFtIGxhc3QgXHU0RTBBXHU2QjIxXHU1NDBDXHU2QjY1XHU1MTk5XHU1MTY1XHU3Njg0IHN5bmNfaGFzaFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDaGFuZ2VkKGN1cnJlbnQ6IHN0cmluZywgbGFzdD86IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoIWxhc3QpIHJldHVybiB0cnVlO1xuICByZXR1cm4gY3VycmVudCAhPT0gbGFzdDtcbn1cbiIsICIvKipcbiAqIFx1OThERVx1NEU2Nlx1NjgwN1x1OTg5OCBcdTIxOTIgXHU1Qjg5XHU1MTY4XHU2NTg3XHU0RUY2XHU1NDBEXHU2RTA1XHU2RDE3XHUzMDAyXHU0RjlEXHU2MzZFIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgIFx1MDBBN1x1NEU4Q1x1NkI2NVx1OUFBNCBcdTI0NjFcdTMwMDJcbiAqIFx1OERFOFx1NUU3M1x1NTNGMFx1OTc1RVx1NkNENVx1NUI1N1x1N0IyNlx1RkYwOFdpbmRvd3MvbWFjT1MvTGludXggXHU1RTc2XHU5NkM2XHVGRjA5XHVGRjFBLyBcXCA6ICogPyBcIiA8ID4gfFxuICogXHU0RUU1XHU1M0NBXHU2M0E3XHU1MjM2XHU1QjU3XHU3QjI2XHUzMDAxXHU5OTk2XHU1QzNFXHU3MEI5XHU1M0Y3L1x1N0E3QVx1NjgzQ1x1RkYwOFdpbmRvd3MgXHU3OTgxXHU2QjYyXHVGRjA5XHUzMDAyXG4gKi9cblxuY29uc3QgSUxMRUdBTCA9IC9bXFwvXFxcXDoqP1wiPD58XS9nO1xuY29uc3QgQ09OVFJPTCA9IC9bXFx4MDAtXFx4MWZcXHg3Zl0vZztcblxuLyoqXG4gKiBcdTZFMDVcdTZEMTdcdTk4REVcdTRFNjZcdTY4MDdcdTk4OThcdTRFM0FcdTVCODlcdTUxNjhcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTRFMERcdTU0MkJcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDlcdTMwMDJcbiAqIC0gXHU1M0JCXHU5NzVFXHU2Q0Q1XHU1QjU3XHU3QjI2IFx1MjE5MiBcdTc1MjhcdTRFMEJcdTUyMTJcdTdFQkZcdTY2RkZcdTYzNjJcbiAqIC0gXHU2Mjk4XHU1M0UwXHU4RkRFXHU3RUVEXHU3QTdBXHU3NjdEXG4gKiAtIFx1NTNCQlx1OTk5Nlx1NUMzRVx1NzBCOVx1NTNGNy9cdTdBN0FcdTY4M0NcbiAqIC0gXHU2MjJBXHU2NUFEXHU1MjMwIDEwMCBcdTVCNTdcdTdCMjZcdUZGMDhcdTRGRERcdTc1NTlcdTdGMTZcdTc4MDFcdTUyNERcdTdGMDBcdTdBN0FcdTk1RjRcdUZGMDlcbiAqIC0gXHU3QTdBXHU2ODA3XHU5ODk4XHU1NkRFXHU5MDAwXHU1MjMwIFwiXHU2NzJBXHU1NDdEXHU1NDBEXCJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplRmlsZW5hbWUodGl0bGU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBzID0gKHRpdGxlID8/ICcnKS50cmltKCk7XG4gIHMgPSBzLnJlcGxhY2UoSUxMRUdBTCwgJ18nKS5yZXBsYWNlKENPTlRST0wsICcnKTtcbiAgcyA9IHMucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKTtcbiAgLy8gV2luZG93cyBcdTc5ODFcdTZCNjJcdTk5OTZcdTVDM0VcdTcwQjlcdTUzRjcvXHU3QTdBXHU2ODNDXG4gIHMgPSBzLnJlcGxhY2UoL15bXFwuXFxzXSt8W1xcLlxcc10rJC9nLCAnJyk7XG4gIGlmIChzLmxlbmd0aCA+IDEwMCkgcyA9IHMuc2xpY2UoMCwgMTAwKS50cmltKCk7XG4gIHJldHVybiBzIHx8ICdcdTY3MkFcdTU0N0RcdTU0MEQnO1xufVxuXG4vKipcbiAqIFx1NTJBMCAubWQgXHU2MjY5XHU1QzU1XHVGRjA4XHU4MkU1XHU1REYyXHU2NzA5XHU1QzMxXHU0RTBEXHU5MUNEXHU1OTBEXHU1MkEwXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoTWRFeHQobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKS5lbmRzV2l0aCgnLm1kJykgPyBuYW1lIDogYCR7bmFtZX0ubWRgO1xufVxuXG4vKipcbiAqIFx1NjJGQ1x1NjNBNVx1NzZFRVx1NUY1NVx1NEUwRVx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NTkwNFx1NzQwNlx1NjU5Q1x1Njc2MFx1RkYwOVx1MzAwMlxuICogQHBhcmFtIGRpciBcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHU3Njg0XHU3NkVFXHU1RjU1XHVGRjBDXHU1OTgyIFwiMFx1RkUwRlx1MjBFM1x1OEY5M1x1NTE2NS9cdUQ4M0RcdURDQTFcdTc4OEVcdTcyNDdcdThGOTNcdTUxNjVcIlxuICogQHBhcmFtIGZpbGVuYW1lIFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NTQyQlx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gam9pblBhdGgoZGlyOiBzdHJpbmcgfCB1bmRlZmluZWQsIGZpbGVuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIWRpciB8fCBkaXIgPT09ICcuJyB8fCBkaXIgPT09ICcvJykgcmV0dXJuIGZpbGVuYW1lO1xuICBjb25zdCBkID0gZGlyLnJlcGxhY2UoL1tcXC9cXFxcXSskLywgJycpLnJlcGxhY2UoL15bXFwvXFxcXF0rLywgJycpO1xuICByZXR1cm4gZCA/IGAke2R9LyR7ZmlsZW5hbWV9YCA6IGZpbGVuYW1lO1xufVxuIiwgIi8qKlxuICogXHU1NkZFXHU3MjQ3IHRva2VuIFx1NTkwNFx1NzQwNlx1MzAwMlx1NEY5RFx1NjM2RSBgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTczLjMgKyBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTUxNkRcdTMwMDJcbiAqXG4gKiBcdTk4REVcdTRFNjZcdTVCRkNcdTUxRkFcdTc2ODRcdTU2RkVcdTcyNDdcdTk0RkVcdTYzQTVcdTVGNjJcdTYwMDFcdUZGMUFcbiAqICAgLSBtZCBcdTVCRkNcdTUxRkFcdUZGMUFgIVtdKGh0dHBzOi8vaW50ZXJuYWwtYXBpLWRyaXZlLXN0cmVhbS5mZWlzaHUuY24vLi4uL2F1dGhjb2RlPS4uLilgXHVGRjA4XHU5NzAwXHU3NjdCXHU1RjU1XHU2MDAxXHVGRjBDMWggXHU4RkM3XHU2NzFGXHVGRjA5XG4gKiAgIC0geG1sIFx1NUJGQ1x1NTFGQVx1RkYxQWA8aW1nIHNyYz1cIkZJTEVfVE9LRU5cIiBocmVmPVwiYXV0aGNvZGVfdXJsXCIvPmBcdUZGMDhGSUxFX1RPS0VOIFx1NkMzOFx1NEU0NVx1NEUwRFx1OEZDN1x1NjcxRlx1RkYwOVxuICpcbiAqIE9CIFx1OTFDQ1x1N0VERlx1NEUwMFx1NTE5OVx1NjIxMFx1RkYxQWAhW10oZmVpc2h1Oi8vRklMRV9UT0tFTilgXG4gKiBcdTk4ODRcdTg5QzhcdTY1RjZcdTc1MzEgT0IgXHU2M0QyXHU0RUY2XHU4QzAzIGBsYXJrLWNsaSBkb2NzICttZWRpYS1kb3dubG9hZGAgXHU2MzYyXHU0RTM0XHU2NUY2XHU5NEZFXHU2M0E1XHUzMDAyXG4gKi9cblxuLyoqIE9CIFx1NEZBN1x1NTZGRVx1NzI0N1x1NUYxNVx1NzUyOFx1NTM0Rlx1OEJBRVx1NTI0RFx1N0YwMFx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IEZFSVNIVV9QUk9UTyA9ICdmZWlzaHU6Ly8nO1xuXG4vKiogXHU5OERFXHU0RTY2IGludGVybmFsLWFwaSBcdTU2RkVcdTcyNDdcdTU3REZcdTU0MERcdUZGMDhcdThCQzZcdTUyMkJcdTk3MDBcdTc2N0JcdTVGNTVcdTYwMDFcdTc2ODRcdTRFMzRcdTY1RjZcdTk0RkVcdTYzQTVcdUZGMDlcdTMwMDIgKi9cbmNvbnN0IElOVEVSTkFMX0FQSV9IT1NUID0gJ2ludGVybmFsLWFwaS1kcml2ZS1zdHJlYW0uZmVpc2h1LmNuJztcbmNvbnN0IElOVEVSTkFMX0FQSV9IT1NUX0xBUksgPSAnaW50ZXJuYWwtYXBpLWRyaXZlLXN0cmVhbS5sYXJrc3VpdGUuY29tJztcblxuLyoqIGZpbGVfdG9rZW4gXHU2ODNDXHU1RjBGXHVGRjFBXHU5OERFXHU0RTY2IHRva2VuIFx1NjYyRiBiYXNlNjItaXNoXHVGRjBDXHU5NTdGXHU1RUE2IH4yOFx1MzAwMiAqL1xuY29uc3QgVE9LRU5fUkUgPSAvW0EtWmEtejAtOV17MjAsfS87XG5cbi8qKlxuICogXHU0RUNFXHU5OERFXHU0RTY2IGludGVybmFsLWFwaSBhdXRoY29kZSBVUkwgXHU5MUNDXHU2M0QwXHU1M0Q2IGZpbGVfdG9rZW5cdTMwMDJcbiAqIFVSTCBcdTVGNjJcdTU5ODIgYGh0dHBzOi8vaW50ZXJuYWwtYXBpLWRyaXZlLXN0cmVhbS5mZWlzaHUuY24vZHJpdmUtc3RyZWFtLzxUT0tFTj4vPGV4dHJhPj9hdXRoY29kZT0uLi5gXG4gKiBcdTUzRDZcdThERUZcdTVGODRcdTZCQjVcdTRFMkRcdTY3MDBcdTk1N0ZcdTc2ODQgdG9rZW4tbGlrZSBcdTVCNTBcdTRFMzJcdTMwMDJcbiAqIEByZXR1cm5zIHRva2VuIFx1NjIxNiBudWxsXHVGRjA4XHU2NUUwXHU2Q0Q1XHU4QkM2XHU1MjJCXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0VG9rZW5Gcm9tQXV0aGNvZGVVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgaWYgKCF1cmwpIHJldHVybiBudWxsO1xuICBsZXQgdTogVVJMO1xuICB0cnkge1xuICAgIHUgPSBuZXcgVVJMKHVybCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGhvc3QgPSB1Lmhvc3RuYW1lO1xuICBpZiAoaG9zdCAhPT0gSU5URVJOQUxfQVBJX0hPU1QgJiYgaG9zdCAhPT0gSU5URVJOQUxfQVBJX0hPU1RfTEFSSykgcmV0dXJuIG51bGw7XG4gIGNvbnN0IHNlZ21lbnRzID0gdS5wYXRobmFtZS5zcGxpdCgnLycpLmZpbHRlcihCb29sZWFuKTtcbiAgbGV0IGJlc3Q6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICBmb3IgKGNvbnN0IHNlZyBvZiBzZWdtZW50cykge1xuICAgIGNvbnN0IG0gPSBzZWcubWF0Y2goVE9LRU5fUkUpO1xuICAgIGlmIChtICYmICghYmVzdCB8fCBtWzBdLmxlbmd0aCA+IGJlc3QubGVuZ3RoKSkgYmVzdCA9IG1bMF07XG4gIH1cbiAgcmV0dXJuIGJlc3Q7XG59XG5cbi8qKlxuICogXHU2MjhBIG1kIFx1NkI2M1x1NjU4N1x1OTFDQ1x1NzY4NCBpbnRlcm5hbC1hcGkgYXV0aGNvZGUgXHU1NkZFXHU3MjQ3XHU5NEZFXHU2M0E1XHU2NkZGXHU2MzYyXHU0RTNBIGBmZWlzaHU6Ly9UT0tFTmBcdTMwMDJcbiAqIFx1NjNEMFx1NEY5Qlx1NEUwMFx1NEUyQSB0b2tlbiBcdTY2MjBcdTVDMDRcdTg4NjhcdUZGMDh4bWwgXHU1QkZDXHU1MUZBXHU2MkZGXHU1MjMwXHU3Njg0IHNyYyB0b2tlbiBcdTIxOTIgaHJlZiBcdTUzRUZcdTgwRkRcdTU0MkJcdTU0MEMgdG9rZW5cdUZGMDlcdTMwMDJcbiAqIFx1NUJGOVx1NjI3RVx1NEUwRFx1NTIzMFx1NjYyMFx1NUMwNFx1NzY4NCBhdXRoY29kZSBVUkxcdUZGMENcdTVDMURcdThCRDVcdTVDMzFcdTU3MzAgZXh0cmFjdFx1MzAwMlxuICpcbiAqIEBwYXJhbSBtZCBcdTZCNjNcdTY1ODcgbWFya2Rvd25cbiAqIEBwYXJhbSB0b2tlbk1hcCB4bWwgXHU1QkZDXHU1MUZBXHU2MkZGXHU1MjMwXHU3Njg0IGZpbGVfdG9rZW4gXHU5NkM2XHU1NDA4XHVGRjA4XHU3NTI4XHU0RThFXHU3Q0JFXHU3ODZFXHU1MzM5XHU5MTREXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXdyaXRlSW1hZ2VzVG9GZWlzaHVQcm90byhcbiAgbWQ6IHN0cmluZyxcbiAgdG9rZW5NYXA6IFNldDxzdHJpbmc+IHwgTWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBTZXQoKSxcbik6IHN0cmluZyB7XG4gIC8vIFx1NTMzOVx1OTE0RCAhW2FsdF0odXJsKSBcdTVGNjJcdTVGMEZcdTc2ODRcdTU2RkVcdTcyNDdcdUZGMEN1cmwgXHU2NjJGIGludGVybmFsLWFwaSBcdTk0RkVcdTYzQTVcbiAgY29uc3QgaW1nUmUgPSAvIVxcWyhbXlxcXV0qKVxcXVxcKChbXildKylcXCkvZztcbiAgcmV0dXJuIG1kLnJlcGxhY2UoaW1nUmUsIChmdWxsLCBhbHQ6IHN0cmluZywgdXJsOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCB0cmltbWVkID0gdXJsLnRyaW0oKS5yZXBsYWNlKC9ePHw+JC9nLCAnJyk7XG4gICAgLy8gXHU1REYyXHU3RUNGXHU2NjJGIGZlaXNodTovLyBcdTUzNEZcdThCQUVcdUZGMENcdThERjNcdThGQzdcbiAgICBpZiAodHJpbW1lZC5zdGFydHNXaXRoKEZFSVNIVV9QUk9UTykpIHJldHVybiBmdWxsO1xuICAgIC8vIGludGVybmFsLWFwaSBcdTk0RkVcdTYzQTVcdUZGMUFcdTYzRDAgdG9rZW5cbiAgICBpZiAoXG4gICAgICB0cmltbWVkLmluY2x1ZGVzKElOVEVSTkFMX0FQSV9IT1NUKSB8fFxuICAgICAgdHJpbW1lZC5pbmNsdWRlcyhJTlRFUk5BTF9BUElfSE9TVF9MQVJLKVxuICAgICkge1xuICAgICAgY29uc3QgdG9rZW4gPSBwaWNrRXhhY3RUb2tlbih0b2tlbk1hcCwgdHJpbW1lZCkgPz8gZXh0cmFjdFRva2VuRnJvbUF1dGhjb2RlVXJsKHRyaW1tZWQpID8/IHBpY2tGcm9tTWFwKHRva2VuTWFwKTtcbiAgICAgIGlmICh0b2tlbikgcmV0dXJuIGAhWyR7YWx0fV0oJHtGRUlTSFVfUFJPVE99JHt0b2tlbn0pYDtcbiAgICB9XG4gICAgLy8gXHU2NjZFXHU5MDFBXHU1OTE2XHU5NEZFXHU2MjE2IGJhc2U2NFx1RkYwQ1x1NTM5Rlx1NjgzN1x1NEZERFx1NzU1OVxuICAgIHJldHVybiBmdWxsO1xuICB9KTtcbn1cblxuLyoqIFx1NEVDRSB0b2tlbk1hcCBcdTkxQ0NcdTUzRDZcdTRFMDBcdTRFMkFcdUZGMDhmYWxsYmFja1x1RkYwQ1x1NzUyOFx1NEU4RVx1OTg3QVx1NUU4Rlx1NTMzOVx1OTE0RFx1NTczQVx1NjY2Rlx1RkYwQ1x1OEMwM1x1NzUyOFx1NjVCOVx1NUU5NFx1NEYxOFx1NTE0OFx1N0NCRVx1Nzg2RVx1NTMzOVx1OTE0RFx1RkYwOVx1MzAwMiAqL1xuZnVuY3Rpb24gcGlja0Zyb21NYXAodG9rZW5NYXA6IFNldDxzdHJpbmc+IHwgTWFwPHN0cmluZywgc3RyaW5nPik6IHN0cmluZyB8IG51bGwge1xuICBpZiAodG9rZW5NYXAgaW5zdGFuY2VvZiBNYXApIHJldHVybiBudWxsO1xuICBpZiAodG9rZW5NYXAuc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG4gIHJldHVybiB0b2tlbk1hcC52YWx1ZXMoKS5uZXh0KCkudmFsdWUgPz8gbnVsbDtcbn1cblxuZnVuY3Rpb24gcGlja0V4YWN0VG9rZW4odG9rZW5NYXA6IFNldDxzdHJpbmc+IHwgTWFwPHN0cmluZywgc3RyaW5nPiwgdXJsOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgaWYgKCEodG9rZW5NYXAgaW5zdGFuY2VvZiBNYXApKSByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIHRva2VuTWFwLmdldCh1cmwpID8/IHRva2VuTWFwLmdldCh1cmwucmVwbGFjZSgvJmFtcDsvZywgJyYnKSkgPz8gbnVsbDtcbn1cblxuLyoqXG4gKiBcdTRFQ0UgeG1sIFx1OTFDQ1x1NjNEMFx1NTNENlx1NjI0MFx1NjcwOSBgPGltZyBzcmM9XCJUT0tFTlwiIC4uLi8+YCBcdTc2ODQgZmlsZV90b2tlblx1MzAwMlxuICogXHU5OERFXHU0RTY2IHhtbCBcdTc2ODQgc3JjIFx1NzZGNFx1NjNBNVx1NUMzMVx1NjYyRiBmaWxlX3Rva2VuXHVGRjA4XHU0RTBEXHU2NjJGIFVSTFx1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEltZ1Rva2Vuc0Zyb21YbWwoeG1sOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IHRva2VucyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCBpbWdSZSA9IC88aW1nXFxiW14+XSpcXGJzcmM9W1wiJ10oW15cIiddKylbXCInXVtePl0qXFwvPz4vZztcbiAgbGV0IG06IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG4gIHdoaWxlICgobSA9IGltZ1JlLmV4ZWMoeG1sKSkgIT09IG51bGwpIHtcbiAgICBjb25zdCBzcmMgPSBtWzFdLnRyaW0oKTtcbiAgICBpZiAoc3JjLnN0YXJ0c1dpdGgoRkVJU0hVX1BST1RPKSkge1xuICAgICAgdG9rZW5zLmFkZChzcmMuc2xpY2UoRkVJU0hVX1BST1RPLmxlbmd0aCkpO1xuICAgIH0gZWxzZSBpZiAoVE9LRU5fUkUudGVzdChzcmMpICYmICFzcmMuc3RhcnRzV2l0aCgnaHR0cCcpKSB7XG4gICAgICB0b2tlbnMuYWRkKHNyYyk7XG4gICAgfVxuICB9XG4gIHJldHVybiBbLi4udG9rZW5zXTtcbn1cblxuLyoqXG4gKiBcdTRFQ0VcdTk4REVcdTRFNjYgWE1MIFx1NjNEMFx1NTNENiBgaHJlZiBcdTRFMzRcdTY1RjZcdTU2RkVcdTk0RkUgLT4gc3JjIGZpbGVfdG9rZW5gIFx1NjYyMFx1NUMwNFx1MzAwMlxuICogbWFya2Rvd24gXHU1QkZDXHU1MUZBXHU1M0VBXHU3RUQ5XHU0RTM0XHU2NUY2IGF1dGhjb2RlIFVSTFx1RkYxQlhNTCBcdTc2ODQgc3JjIFx1NjI0RFx1NjYyRlx1NTNFRlx1OTU3Rlx1NjcxRlx1NEZERFx1NUI1OFx1NzY4NCBmaWxlX3Rva2VuXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0SW1nVG9rZW5NYXBGcm9tWG1sKHhtbDogc3RyaW5nKTogTWFwPHN0cmluZywgc3RyaW5nPiB7XG4gIGNvbnN0IG1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIGNvbnN0IGltZ1JlID0gLzxpbWdcXGJbXj5dKj4vZztcbiAgbGV0IG06IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG4gIHdoaWxlICgobSA9IGltZ1JlLmV4ZWMoeG1sKSkgIT09IG51bGwpIHtcbiAgICBjb25zdCB0YWcgPSBtWzBdO1xuICAgIGNvbnN0IHNyYyA9IGF0dHIodGFnLCAnc3JjJyk7XG4gICAgY29uc3QgaHJlZiA9IGF0dHIodGFnLCAnaHJlZicpO1xuICAgIGlmICghc3JjIHx8ICFocmVmIHx8IHNyYy5zdGFydHNXaXRoKCdodHRwJykpIGNvbnRpbnVlO1xuICAgIGlmICghVE9LRU5fUkUudGVzdChzcmMpKSBjb250aW51ZTtcbiAgICBtYXAuc2V0KGRlY29kZVhtbEF0dHIoaHJlZiksIHNyYyk7XG4gIH1cbiAgcmV0dXJuIG1hcDtcbn1cblxuZnVuY3Rpb24gYXR0cih0YWc6IHN0cmluZywgbmFtZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChgXFxcXGIke25hbWV9PVtcIiddKFteXCInXSspW1wiJ11gKTtcbiAgcmV0dXJuIHRhZy5tYXRjaChyZSk/LlsxXSA/PyBudWxsO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVYbWxBdHRyKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdmFsdWVcbiAgICAucmVwbGFjZSgvJmFtcDsvZywgJyYnKVxuICAgIC5yZXBsYWNlKC8mcXVvdDsvZywgJ1wiJylcbiAgICAucmVwbGFjZSgvJmFwb3M7L2csIFwiJ1wiKVxuICAgIC5yZXBsYWNlKC8mbHQ7L2csICc8JylcbiAgICAucmVwbGFjZSgvJmd0Oy9nLCAnPicpO1xufVxuXG4vKipcbiAqIFx1NEVDRSBtZCBcdTZCNjNcdTY1ODdcdTkxQ0NcdTYzRDBcdTUzRDZcdTYyNDBcdTY3MDkgZmVpc2h1Oi8vVE9LRU5cdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RGZWlzaHVJbWFnZVRva2VucyhtZDogc3RyaW5nKTogc3RyaW5nW10ge1xuICBjb25zdCB0b2tlbnMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKFxuICAgIGAhXFxcXFtbXlxcXFxdXSpcXFxcXVxcXFwoJHtGRUlTSFVfUFJPVE8ucmVwbGFjZSgnLycsICdcXFxcLycpfShbQS1aYS16MC05XSspXFxcXClgLFxuICAgICdnJyxcbiAgKTtcbiAgbGV0IG06IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG4gIHdoaWxlICgobSA9IHJlLmV4ZWMobWQpKSAhPT0gbnVsbCkge1xuICAgIHRva2Vucy5hZGQobVsxXSk7XG4gIH1cbiAgcmV0dXJuIFsuLi50b2tlbnNdO1xufVxuXG4vKipcbiAqIFx1NjI4QSBPQiBcdTZCNjNcdTY1ODdcdTkxQ0NcdTc2ODQgYCFbXShmZWlzaHU6Ly9UT0tFTilgIFx1OEZEOFx1NTM5Rlx1NEUzQVx1OThERVx1NEU2NiB4bWwgYDxpbWcgc3JjPVwiVE9LRU5cIi8+YFx1MzAwMlxuICogXHU3NTI4XHU0RThFIE9CXHUyMTkyXHU5OERFXHU0RTY2XHU1NkRFXHU1MTk5XHVGRjA4bWQgXHU5MEU4XHU1MjA2XHU3NTI4IG1hcmtkb3duXHVGRjBDXHU1NkZFXHU3MjQ3XHU5NzAwXHU3NTI4IHhtbCBcdTY4MDdcdTdCN0VcdTYyNERcdTgwRkRcdTg4QUJcdTk4REVcdTRFNjZcdThCQzZcdTUyMkJcdTRFM0FcdTVERjJcdTY3MDkgdG9rZW5cdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZlaXNodVByb3RvVG9YbWwobWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHJlID0gLyFcXFsoW15cXF1dKilcXF1cXChmZWlzaHU6XFwvXFwvKFtBLVphLXowLTldKylcXCkvZztcbiAgcmV0dXJuIG1kLnJlcGxhY2UocmUsIChfZnVsbCwgX2FsdDogc3RyaW5nLCB0b2tlbjogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIGA8aW1nIHNyYz1cIiR7dG9rZW59XCIvPmA7XG4gIH0pO1xufVxuIiwgIid1c2Ugc3RyaWN0J1xuXG5mdW5jdGlvbiBpc05vdGhpbmcgKHN1YmplY3QpIHtcbiAgcmV0dXJuICh0eXBlb2Ygc3ViamVjdCA9PT0gJ3VuZGVmaW5lZCcpIHx8IChzdWJqZWN0ID09PSBudWxsKVxufVxuXG5mdW5jdGlvbiBpc09iamVjdCAoc3ViamVjdCkge1xuICByZXR1cm4gKHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JykgJiYgKHN1YmplY3QgIT09IG51bGwpXG59XG5cbmZ1bmN0aW9uIHRvQXJyYXkgKHNlcXVlbmNlKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHNlcXVlbmNlKSkgcmV0dXJuIHNlcXVlbmNlXG4gIGVsc2UgaWYgKGlzTm90aGluZyhzZXF1ZW5jZSkpIHJldHVybiBbXVxuXG4gIHJldHVybiBbc2VxdWVuY2VdXG59XG5cbmZ1bmN0aW9uIGV4dGVuZCAodGFyZ2V0LCBzb3VyY2UpIHtcbiAgaWYgKHNvdXJjZSkge1xuICAgIGNvbnN0IHNvdXJjZUtleXMgPSBPYmplY3Qua2V5cyhzb3VyY2UpXG5cbiAgICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IHNvdXJjZUtleXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgICAgY29uc3Qga2V5ID0gc291cmNlS2V5c1tpbmRleF1cbiAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0XG59XG5cbmZ1bmN0aW9uIHJlcGVhdCAoc3RyaW5nLCBjb3VudCkge1xuICBsZXQgcmVzdWx0ID0gJydcblxuICBmb3IgKGxldCBjeWNsZSA9IDA7IGN5Y2xlIDwgY291bnQ7IGN5Y2xlICs9IDEpIHtcbiAgICByZXN1bHQgKz0gc3RyaW5nXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIGlzTmVnYXRpdmVaZXJvIChudW1iZXIpIHtcbiAgcmV0dXJuIChudW1iZXIgPT09IDApICYmIChOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkgPT09IDEgLyBudW1iZXIpXG59XG5cbm1vZHVsZS5leHBvcnRzLmlzTm90aGluZyA9IGlzTm90aGluZ1xubW9kdWxlLmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdFxubW9kdWxlLmV4cG9ydHMudG9BcnJheSA9IHRvQXJyYXlcbm1vZHVsZS5leHBvcnRzLnJlcGVhdCA9IHJlcGVhdFxubW9kdWxlLmV4cG9ydHMuaXNOZWdhdGl2ZVplcm8gPSBpc05lZ2F0aXZlWmVyb1xubW9kdWxlLmV4cG9ydHMuZXh0ZW5kID0gZXh0ZW5kXG4iLCAiLy8gWUFNTCBlcnJvciBjbGFzcy4gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NDU4OTg0XG4vL1xuJ3VzZSBzdHJpY3QnXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yIChleGNlcHRpb24sIGNvbXBhY3QpIHtcbiAgbGV0IHdoZXJlID0gJydcbiAgY29uc3QgbWVzc2FnZSA9IGV4Y2VwdGlvbi5yZWFzb24gfHwgJyh1bmtub3duIHJlYXNvbiknXG5cbiAgaWYgKCFleGNlcHRpb24ubWFyaykgcmV0dXJuIG1lc3NhZ2VcblxuICBpZiAoZXhjZXB0aW9uLm1hcmsubmFtZSkge1xuICAgIHdoZXJlICs9ICdpbiBcIicgKyBleGNlcHRpb24ubWFyay5uYW1lICsgJ1wiICdcbiAgfVxuXG4gIHdoZXJlICs9ICcoJyArIChleGNlcHRpb24ubWFyay5saW5lICsgMSkgKyAnOicgKyAoZXhjZXB0aW9uLm1hcmsuY29sdW1uICsgMSkgKyAnKSdcblxuICBpZiAoIWNvbXBhY3QgJiYgZXhjZXB0aW9uLm1hcmsuc25pcHBldCkge1xuICAgIHdoZXJlICs9ICdcXG5cXG4nICsgZXhjZXB0aW9uLm1hcmsuc25pcHBldFxuICB9XG5cbiAgcmV0dXJuIG1lc3NhZ2UgKyAnICcgKyB3aGVyZVxufVxuXG5mdW5jdGlvbiBZQU1MRXhjZXB0aW9uIChyZWFzb24sIG1hcmspIHtcbiAgLy8gU3VwZXIgY29uc3RydWN0b3JcbiAgRXJyb3IuY2FsbCh0aGlzKVxuXG4gIHRoaXMubmFtZSA9ICdZQU1MRXhjZXB0aW9uJ1xuICB0aGlzLnJlYXNvbiA9IHJlYXNvblxuICB0aGlzLm1hcmsgPSBtYXJrXG4gIHRoaXMubWVzc2FnZSA9IGZvcm1hdEVycm9yKHRoaXMsIGZhbHNlKVxuXG4gIC8vIEluY2x1ZGUgc3RhY2sgdHJhY2UgaW4gZXJyb3Igb2JqZWN0XG4gIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuICAgIC8vIENocm9tZSBhbmQgTm9kZUpTXG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgdGhpcy5jb25zdHJ1Y3RvcilcbiAgfSBlbHNlIHtcbiAgICAvLyBGRiwgSUUgMTArIGFuZCBTYWZhcmkgNisuIEZhbGxiYWNrIGZvciBvdGhlcnNcbiAgICB0aGlzLnN0YWNrID0gKG5ldyBFcnJvcigpKS5zdGFjayB8fCAnJ1xuICB9XG59XG5cbi8vIEluaGVyaXQgZnJvbSBFcnJvclxuWUFNTEV4Y2VwdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSlcbllBTUxFeGNlcHRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gWUFNTEV4Y2VwdGlvblxuXG5ZQU1MRXhjZXB0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nIChjb21wYWN0KSB7XG4gIHJldHVybiB0aGlzLm5hbWUgKyAnOiAnICsgZm9ybWF0RXJyb3IodGhpcywgY29tcGFjdClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBZQU1MRXhjZXB0aW9uXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGNvbW1vbiA9IHJlcXVpcmUoJy4vY29tbW9uJylcblxuLy8gZ2V0IHNuaXBwZXQgZm9yIGEgc2luZ2xlIGxpbmUsIHJlc3BlY3RpbmcgbWF4TGVuZ3RoXG5mdW5jdGlvbiBnZXRMaW5lIChidWZmZXIsIGxpbmVTdGFydCwgbGluZUVuZCwgcG9zaXRpb24sIG1heExpbmVMZW5ndGgpIHtcbiAgbGV0IGhlYWQgPSAnJ1xuICBsZXQgdGFpbCA9ICcnXG4gIGNvbnN0IG1heEhhbGZMZW5ndGggPSBNYXRoLmZsb29yKG1heExpbmVMZW5ndGggLyAyKSAtIDFcblxuICBpZiAocG9zaXRpb24gLSBsaW5lU3RhcnQgPiBtYXhIYWxmTGVuZ3RoKSB7XG4gICAgaGVhZCA9ICcgLi4uICdcbiAgICBsaW5lU3RhcnQgPSBwb3NpdGlvbiAtIG1heEhhbGZMZW5ndGggKyBoZWFkLmxlbmd0aFxuICB9XG5cbiAgaWYgKGxpbmVFbmQgLSBwb3NpdGlvbiA+IG1heEhhbGZMZW5ndGgpIHtcbiAgICB0YWlsID0gJyAuLi4nXG4gICAgbGluZUVuZCA9IHBvc2l0aW9uICsgbWF4SGFsZkxlbmd0aCAtIHRhaWwubGVuZ3RoXG4gIH1cblxuICByZXR1cm4ge1xuICAgIHN0cjogaGVhZCArIGJ1ZmZlci5zbGljZShsaW5lU3RhcnQsIGxpbmVFbmQpLnJlcGxhY2UoL1xcdC9nLCAn4oaSJykgKyB0YWlsLFxuICAgIHBvczogcG9zaXRpb24gLSBsaW5lU3RhcnQgKyBoZWFkLmxlbmd0aCAvLyByZWxhdGl2ZSBwb3NpdGlvblxuICB9XG59XG5cbmZ1bmN0aW9uIHBhZFN0YXJ0IChzdHJpbmcsIG1heCkge1xuICByZXR1cm4gY29tbW9uLnJlcGVhdCgnICcsIG1heCAtIHN0cmluZy5sZW5ndGgpICsgc3RyaW5nXG59XG5cbmZ1bmN0aW9uIG1ha2VTbmlwcGV0IChtYXJrLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKG9wdGlvbnMgfHwgbnVsbClcblxuICBpZiAoIW1hcmsuYnVmZmVyKSByZXR1cm4gbnVsbFxuXG4gIGlmICghb3B0aW9ucy5tYXhMZW5ndGgpIG9wdGlvbnMubWF4TGVuZ3RoID0gNzlcbiAgaWYgKHR5cGVvZiBvcHRpb25zLmluZGVudCAhPT0gJ251bWJlcicpIG9wdGlvbnMuaW5kZW50ID0gMVxuICBpZiAodHlwZW9mIG9wdGlvbnMubGluZXNCZWZvcmUgIT09ICdudW1iZXInKSBvcHRpb25zLmxpbmVzQmVmb3JlID0gM1xuICBpZiAodHlwZW9mIG9wdGlvbnMubGluZXNBZnRlciAhPT0gJ251bWJlcicpIG9wdGlvbnMubGluZXNBZnRlciA9IDJcblxuICBjb25zdCByZSA9IC9cXHI/XFxufFxccnxcXDAvZ1xuICBjb25zdCBsaW5lU3RhcnRzID0gWzBdXG4gIGNvbnN0IGxpbmVFbmRzID0gW11cbiAgbGV0IG1hdGNoXG4gIGxldCBmb3VuZExpbmVObyA9IC0xXG5cbiAgd2hpbGUgKChtYXRjaCA9IHJlLmV4ZWMobWFyay5idWZmZXIpKSkge1xuICAgIGxpbmVFbmRzLnB1c2gobWF0Y2guaW5kZXgpXG4gICAgbGluZVN0YXJ0cy5wdXNoKG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKVxuXG4gICAgaWYgKG1hcmsucG9zaXRpb24gPD0gbWF0Y2guaW5kZXggJiYgZm91bmRMaW5lTm8gPCAwKSB7XG4gICAgICBmb3VuZExpbmVObyA9IGxpbmVTdGFydHMubGVuZ3RoIC0gMlxuICAgIH1cbiAgfVxuXG4gIGlmIChmb3VuZExpbmVObyA8IDApIGZvdW5kTGluZU5vID0gbGluZVN0YXJ0cy5sZW5ndGggLSAxXG5cbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGNvbnN0IGxpbmVOb0xlbmd0aCA9IE1hdGgubWluKG1hcmsubGluZSArIG9wdGlvbnMubGluZXNBZnRlciwgbGluZUVuZHMubGVuZ3RoKS50b1N0cmluZygpLmxlbmd0aFxuICBjb25zdCBtYXhMaW5lTGVuZ3RoID0gb3B0aW9ucy5tYXhMZW5ndGggLSAob3B0aW9ucy5pbmRlbnQgKyBsaW5lTm9MZW5ndGggKyAzKVxuXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IG9wdGlvbnMubGluZXNCZWZvcmU7IGkrKykge1xuICAgIGlmIChmb3VuZExpbmVObyAtIGkgPCAwKSBicmVha1xuICAgIGNvbnN0IGxpbmUgPSBnZXRMaW5lKFxuICAgICAgbWFyay5idWZmZXIsXG4gICAgICBsaW5lU3RhcnRzW2ZvdW5kTGluZU5vIC0gaV0sXG4gICAgICBsaW5lRW5kc1tmb3VuZExpbmVObyAtIGldLFxuICAgICAgbWFyay5wb3NpdGlvbiAtIChsaW5lU3RhcnRzW2ZvdW5kTGluZU5vXSAtIGxpbmVTdGFydHNbZm91bmRMaW5lTm8gLSBpXSksXG4gICAgICBtYXhMaW5lTGVuZ3RoXG4gICAgKVxuICAgIHJlc3VsdCA9IGNvbW1vbi5yZXBlYXQoJyAnLCBvcHRpb25zLmluZGVudCkgKyBwYWRTdGFydCgobWFyay5saW5lIC0gaSArIDEpLnRvU3RyaW5nKCksIGxpbmVOb0xlbmd0aCkgK1xuICAgICAgJyB8ICcgKyBsaW5lLnN0ciArICdcXG4nICsgcmVzdWx0XG4gIH1cblxuICBjb25zdCBsaW5lID0gZ2V0TGluZShtYXJrLmJ1ZmZlciwgbGluZVN0YXJ0c1tmb3VuZExpbmVOb10sIGxpbmVFbmRzW2ZvdW5kTGluZU5vXSwgbWFyay5wb3NpdGlvbiwgbWF4TGluZUxlbmd0aClcbiAgcmVzdWx0ICs9IGNvbW1vbi5yZXBlYXQoJyAnLCBvcHRpb25zLmluZGVudCkgKyBwYWRTdGFydCgobWFyay5saW5lICsgMSkudG9TdHJpbmcoKSwgbGluZU5vTGVuZ3RoKSArXG4gICAgJyB8ICcgKyBsaW5lLnN0ciArICdcXG4nXG4gIHJlc3VsdCArPSBjb21tb24ucmVwZWF0KCctJywgb3B0aW9ucy5pbmRlbnQgKyBsaW5lTm9MZW5ndGggKyAzICsgbGluZS5wb3MpICsgJ14nICsgJ1xcbidcblxuICBmb3IgKGxldCBpID0gMTsgaSA8PSBvcHRpb25zLmxpbmVzQWZ0ZXI7IGkrKykge1xuICAgIGlmIChmb3VuZExpbmVObyArIGkgPj0gbGluZUVuZHMubGVuZ3RoKSBicmVha1xuICAgIGNvbnN0IGxpbmUgPSBnZXRMaW5lKFxuICAgICAgbWFyay5idWZmZXIsXG4gICAgICBsaW5lU3RhcnRzW2ZvdW5kTGluZU5vICsgaV0sXG4gICAgICBsaW5lRW5kc1tmb3VuZExpbmVObyArIGldLFxuICAgICAgbWFyay5wb3NpdGlvbiAtIChsaW5lU3RhcnRzW2ZvdW5kTGluZU5vXSAtIGxpbmVTdGFydHNbZm91bmRMaW5lTm8gKyBpXSksXG4gICAgICBtYXhMaW5lTGVuZ3RoXG4gICAgKVxuICAgIHJlc3VsdCArPSBjb21tb24ucmVwZWF0KCcgJywgb3B0aW9ucy5pbmRlbnQpICsgcGFkU3RhcnQoKG1hcmsubGluZSArIGkgKyAxKS50b1N0cmluZygpLCBsaW5lTm9MZW5ndGgpICtcbiAgICAgICcgfCAnICsgbGluZS5zdHIgKyAnXFxuJ1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdC5yZXBsYWNlKC9cXG4kLywgJycpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFrZVNuaXBwZXRcbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgWUFNTEV4Y2VwdGlvbiA9IHJlcXVpcmUoJy4vZXhjZXB0aW9uJylcblxuY29uc3QgVFlQRV9DT05TVFJVQ1RPUl9PUFRJT05TID0gW1xuICAna2luZCcsXG4gICdtdWx0aScsXG4gICdyZXNvbHZlJyxcbiAgJ2NvbnN0cnVjdCcsXG4gICdpbnN0YW5jZU9mJyxcbiAgJ3ByZWRpY2F0ZScsXG4gICdyZXByZXNlbnQnLFxuICAncmVwcmVzZW50TmFtZScsXG4gICdkZWZhdWx0U3R5bGUnLFxuICAnc3R5bGVBbGlhc2VzJ1xuXVxuXG5jb25zdCBZQU1MX05PREVfS0lORFMgPSBbXG4gICdzY2FsYXInLFxuICAnc2VxdWVuY2UnLFxuICAnbWFwcGluZydcbl1cblxuZnVuY3Rpb24gY29tcGlsZVN0eWxlQWxpYXNlcyAobWFwKSB7XG4gIGNvbnN0IHJlc3VsdCA9IHt9XG5cbiAgaWYgKG1hcCAhPT0gbnVsbCkge1xuICAgIE9iamVjdC5rZXlzKG1hcCkuZm9yRWFjaChmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgIG1hcFtzdHlsZV0uZm9yRWFjaChmdW5jdGlvbiAoYWxpYXMpIHtcbiAgICAgICAgcmVzdWx0W1N0cmluZyhhbGlhcyldID0gc3R5bGVcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gVHlwZSAodGFnLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgT2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmIChUWVBFX0NPTlNUUlVDVE9SX09QVElPTlMuaW5kZXhPZihuYW1lKSA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKCdVbmtub3duIG9wdGlvbiBcIicgKyBuYW1lICsgJ1wiIGlzIG1ldCBpbiBkZWZpbml0aW9uIG9mIFwiJyArIHRhZyArICdcIiBZQU1MIHR5cGUuJylcbiAgICB9XG4gIH0pXG5cbiAgLy8gVE9ETzogQWRkIHRhZyBmb3JtYXQgY2hlY2suXG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgLy8ga2VlcCBvcmlnaW5hbCBvcHRpb25zIGluIGNhc2UgdXNlciB3YW50cyB0byBleHRlbmQgdGhpcyB0eXBlIGxhdGVyXG4gIHRoaXMudGFnID0gdGFnXG4gIHRoaXMua2luZCA9IG9wdGlvbnNbJ2tpbmQnXSB8fCBudWxsXG4gIHRoaXMucmVzb2x2ZSA9IG9wdGlvbnNbJ3Jlc29sdmUnXSB8fCBmdW5jdGlvbiAoKSB7IHJldHVybiB0cnVlIH1cbiAgdGhpcy5jb25zdHJ1Y3QgPSBvcHRpb25zWydjb25zdHJ1Y3QnXSB8fCBmdW5jdGlvbiAoZGF0YSkgeyByZXR1cm4gZGF0YSB9XG4gIHRoaXMuaW5zdGFuY2VPZiA9IG9wdGlvbnNbJ2luc3RhbmNlT2YnXSB8fCBudWxsXG4gIHRoaXMucHJlZGljYXRlID0gb3B0aW9uc1sncHJlZGljYXRlJ10gfHwgbnVsbFxuICB0aGlzLnJlcHJlc2VudCA9IG9wdGlvbnNbJ3JlcHJlc2VudCddIHx8IG51bGxcbiAgdGhpcy5yZXByZXNlbnROYW1lID0gb3B0aW9uc1sncmVwcmVzZW50TmFtZSddIHx8IG51bGxcbiAgdGhpcy5kZWZhdWx0U3R5bGUgPSBvcHRpb25zWydkZWZhdWx0U3R5bGUnXSB8fCBudWxsXG4gIHRoaXMubXVsdGkgPSBvcHRpb25zWydtdWx0aSddIHx8IGZhbHNlXG4gIHRoaXMuc3R5bGVBbGlhc2VzID0gY29tcGlsZVN0eWxlQWxpYXNlcyhvcHRpb25zWydzdHlsZUFsaWFzZXMnXSB8fCBudWxsKVxuXG4gIGlmIChZQU1MX05PREVfS0lORFMuaW5kZXhPZih0aGlzLmtpbmQpID09PSAtMSkge1xuICAgIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKCdVbmtub3duIGtpbmQgXCInICsgdGhpcy5raW5kICsgJ1wiIGlzIHNwZWNpZmllZCBmb3IgXCInICsgdGFnICsgJ1wiIFlBTUwgdHlwZS4nKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHlwZVxuIiwgIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBZQU1MRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9leGNlcHRpb24nKVxuY29uc3QgVHlwZSA9IHJlcXVpcmUoJy4vdHlwZScpXG5cbmZ1bmN0aW9uIGNvbXBpbGVMaXN0IChzY2hlbWEsIG5hbWUpIHtcbiAgY29uc3QgcmVzdWx0ID0gW11cblxuICBzY2hlbWFbbmFtZV0uZm9yRWFjaChmdW5jdGlvbiAoY3VycmVudFR5cGUpIHtcbiAgICBsZXQgbmV3SW5kZXggPSByZXN1bHQubGVuZ3RoXG5cbiAgICByZXN1bHQuZm9yRWFjaChmdW5jdGlvbiAocHJldmlvdXNUeXBlLCBwcmV2aW91c0luZGV4KSB7XG4gICAgICBpZiAocHJldmlvdXNUeXBlLnRhZyA9PT0gY3VycmVudFR5cGUudGFnICYmXG4gICAgICAgICAgcHJldmlvdXNUeXBlLmtpbmQgPT09IGN1cnJlbnRUeXBlLmtpbmQgJiZcbiAgICAgICAgICBwcmV2aW91c1R5cGUubXVsdGkgPT09IGN1cnJlbnRUeXBlLm11bHRpKSB7XG4gICAgICAgIG5ld0luZGV4ID0gcHJldmlvdXNJbmRleFxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXN1bHRbbmV3SW5kZXhdID0gY3VycmVudFR5cGVcbiAgfSlcblxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIGNvbXBpbGVNYXAgKC8qIGxpc3RzLi4uICovKSB7XG4gIGNvbnN0IHJlc3VsdCA9IHtcbiAgICBzY2FsYXI6IHt9LFxuICAgIHNlcXVlbmNlOiB7fSxcbiAgICBtYXBwaW5nOiB7fSxcbiAgICBmYWxsYmFjazoge30sXG4gICAgbXVsdGk6IHtcbiAgICAgIHNjYWxhcjogW10sXG4gICAgICBzZXF1ZW5jZTogW10sXG4gICAgICBtYXBwaW5nOiBbXSxcbiAgICAgIGZhbGxiYWNrOiBbXVxuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBjb2xsZWN0VHlwZSAodHlwZSkge1xuICAgIGlmICh0eXBlLm11bHRpKSB7XG4gICAgICByZXN1bHQubXVsdGlbdHlwZS5raW5kXS5wdXNoKHR5cGUpXG4gICAgICByZXN1bHQubXVsdGlbJ2ZhbGxiYWNrJ10ucHVzaCh0eXBlKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRbdHlwZS5raW5kXVt0eXBlLnRhZ10gPSByZXN1bHRbJ2ZhbGxiYWNrJ11bdHlwZS50YWddID0gdHlwZVxuICAgIH1cbiAgfVxuXG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBhcmd1bWVudHNbaW5kZXhdLmZvckVhY2goY29sbGVjdFR5cGUpXG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiBTY2hlbWEgKGRlZmluaXRpb24pIHtcbiAgcmV0dXJuIHRoaXMuZXh0ZW5kKGRlZmluaXRpb24pXG59XG5cblNjaGVtYS5wcm90b3R5cGUuZXh0ZW5kID0gZnVuY3Rpb24gZXh0ZW5kIChkZWZpbml0aW9uKSB7XG4gIGxldCBpbXBsaWNpdCA9IFtdXG4gIGxldCBleHBsaWNpdCA9IFtdXG5cbiAgaWYgKGRlZmluaXRpb24gaW5zdGFuY2VvZiBUeXBlKSB7XG4gICAgLy8gU2NoZW1hLmV4dGVuZCh0eXBlKVxuICAgIGV4cGxpY2l0LnB1c2goZGVmaW5pdGlvbilcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGRlZmluaXRpb24pKSB7XG4gICAgLy8gU2NoZW1hLmV4dGVuZChbIHR5cGUxLCB0eXBlMiwgLi4uIF0pXG4gICAgZXhwbGljaXQgPSBleHBsaWNpdC5jb25jYXQoZGVmaW5pdGlvbilcbiAgfSBlbHNlIGlmIChkZWZpbml0aW9uICYmIChBcnJheS5pc0FycmF5KGRlZmluaXRpb24uaW1wbGljaXQpIHx8IEFycmF5LmlzQXJyYXkoZGVmaW5pdGlvbi5leHBsaWNpdCkpKSB7XG4gICAgLy8gU2NoZW1hLmV4dGVuZCh7IGV4cGxpY2l0OiBbIHR5cGUxLCB0eXBlMiwgLi4uIF0sIGltcGxpY2l0OiBbIHR5cGUxLCB0eXBlMiwgLi4uIF0gfSlcbiAgICBpZiAoZGVmaW5pdGlvbi5pbXBsaWNpdCkgaW1wbGljaXQgPSBpbXBsaWNpdC5jb25jYXQoZGVmaW5pdGlvbi5pbXBsaWNpdClcbiAgICBpZiAoZGVmaW5pdGlvbi5leHBsaWNpdCkgZXhwbGljaXQgPSBleHBsaWNpdC5jb25jYXQoZGVmaW5pdGlvbi5leHBsaWNpdClcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignU2NoZW1hLmV4dGVuZCBhcmd1bWVudCBzaG91bGQgYmUgYSBUeXBlLCBbIFR5cGUgXSwgJyArXG4gICAgICAnb3IgYSBzY2hlbWEgZGVmaW5pdGlvbiAoeyBpbXBsaWNpdDogWy4uLl0sIGV4cGxpY2l0OiBbLi4uXSB9KScpXG4gIH1cblxuICBpbXBsaWNpdC5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgaWYgKCEodHlwZSBpbnN0YW5jZW9mIFR5cGUpKSB7XG4gICAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignU3BlY2lmaWVkIGxpc3Qgb2YgWUFNTCB0eXBlcyAob3IgYSBzaW5nbGUgVHlwZSBvYmplY3QpIGNvbnRhaW5zIGEgbm9uLVR5cGUgb2JqZWN0LicpXG4gICAgfVxuXG4gICAgaWYgKHR5cGUubG9hZEtpbmQgJiYgdHlwZS5sb2FkS2luZCAhPT0gJ3NjYWxhcicpIHtcbiAgICAgIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKCdUaGVyZSBpcyBhIG5vbi1zY2FsYXIgdHlwZSBpbiB0aGUgaW1wbGljaXQgbGlzdCBvZiBhIHNjaGVtYS4gSW1wbGljaXQgcmVzb2x2aW5nIG9mIHN1Y2ggdHlwZXMgaXMgbm90IHN1cHBvcnRlZC4nKVxuICAgIH1cblxuICAgIGlmICh0eXBlLm11bHRpKSB7XG4gICAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignVGhlcmUgaXMgYSBtdWx0aSB0eXBlIGluIHRoZSBpbXBsaWNpdCBsaXN0IG9mIGEgc2NoZW1hLiBNdWx0aSB0YWdzIGNhbiBvbmx5IGJlIGxpc3RlZCBhcyBleHBsaWNpdC4nKVxuICAgIH1cbiAgfSlcblxuICBleHBsaWNpdC5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgaWYgKCEodHlwZSBpbnN0YW5jZW9mIFR5cGUpKSB7XG4gICAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignU3BlY2lmaWVkIGxpc3Qgb2YgWUFNTCB0eXBlcyAob3IgYSBzaW5nbGUgVHlwZSBvYmplY3QpIGNvbnRhaW5zIGEgbm9uLVR5cGUgb2JqZWN0LicpXG4gICAgfVxuICB9KVxuXG4gIGNvbnN0IHJlc3VsdCA9IE9iamVjdC5jcmVhdGUoU2NoZW1hLnByb3RvdHlwZSlcblxuICByZXN1bHQuaW1wbGljaXQgPSAodGhpcy5pbXBsaWNpdCB8fCBbXSkuY29uY2F0KGltcGxpY2l0KVxuICByZXN1bHQuZXhwbGljaXQgPSAodGhpcy5leHBsaWNpdCB8fCBbXSkuY29uY2F0KGV4cGxpY2l0KVxuXG4gIHJlc3VsdC5jb21waWxlZEltcGxpY2l0ID0gY29tcGlsZUxpc3QocmVzdWx0LCAnaW1wbGljaXQnKVxuICByZXN1bHQuY29tcGlsZWRFeHBsaWNpdCA9IGNvbXBpbGVMaXN0KHJlc3VsdCwgJ2V4cGxpY2l0JylcbiAgcmVzdWx0LmNvbXBpbGVkVHlwZU1hcCA9IGNvbXBpbGVNYXAocmVzdWx0LmNvbXBpbGVkSW1wbGljaXQsIHJlc3VsdC5jb21waWxlZEV4cGxpY2l0KVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTY2hlbWFcbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgVHlwZSA9IHJlcXVpcmUoJy4uL3R5cGUnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBUeXBlKCd0YWc6eWFtbC5vcmcsMjAwMjpzdHInLCB7XG4gIGtpbmQ6ICdzY2FsYXInLFxuICBjb25zdHJ1Y3Q6IGZ1bmN0aW9uIChkYXRhKSB7IHJldHVybiBkYXRhICE9PSBudWxsID8gZGF0YSA6ICcnIH1cbn0pXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IFR5cGUgPSByZXF1aXJlKCcuLi90eXBlJylcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6c2VxJywge1xuICBraW5kOiAnc2VxdWVuY2UnLFxuICBjb25zdHJ1Y3Q6IGZ1bmN0aW9uIChkYXRhKSB7IHJldHVybiBkYXRhICE9PSBudWxsID8gZGF0YSA6IFtdIH1cbn0pXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IFR5cGUgPSByZXF1aXJlKCcuLi90eXBlJylcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6bWFwJywge1xuICBraW5kOiAnbWFwcGluZycsXG4gIGNvbnN0cnVjdDogZnVuY3Rpb24gKGRhdGEpIHsgcmV0dXJuIGRhdGEgIT09IG51bGwgPyBkYXRhIDoge30gfVxufSlcbiIsICIvLyBTdGFuZGFyZCBZQU1MJ3MgRmFpbHNhZmUgc2NoZW1hLlxuLy8gaHR0cDovL3d3dy55YW1sLm9yZy9zcGVjLzEuMi9zcGVjLmh0bWwjaWQyODAyMzQ2XG5cbid1c2Ugc3RyaWN0J1xuXG5jb25zdCBTY2hlbWEgPSByZXF1aXJlKCcuLi9zY2hlbWEnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTY2hlbWEoe1xuICBleHBsaWNpdDogW1xuICAgIHJlcXVpcmUoJy4uL3R5cGUvc3RyJyksXG4gICAgcmVxdWlyZSgnLi4vdHlwZS9zZXEnKSxcbiAgICByZXF1aXJlKCcuLi90eXBlL21hcCcpXG4gIF1cbn0pXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IFR5cGUgPSByZXF1aXJlKCcuLi90eXBlJylcblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxOdWxsIChkYXRhKSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gdHJ1ZVxuXG4gIGNvbnN0IG1heCA9IGRhdGEubGVuZ3RoXG5cbiAgcmV0dXJuIChtYXggPT09IDEgJiYgZGF0YSA9PT0gJ34nKSB8fFxuICAgICAgICAgKG1heCA9PT0gNCAmJiAoZGF0YSA9PT0gJ251bGwnIHx8IGRhdGEgPT09ICdOdWxsJyB8fCBkYXRhID09PSAnTlVMTCcpKVxufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sTnVsbCAoKSB7XG4gIHJldHVybiBudWxsXG59XG5cbmZ1bmN0aW9uIGlzTnVsbCAob2JqZWN0KSB7XG4gIHJldHVybiBvYmplY3QgPT09IG51bGxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6bnVsbCcsIHtcbiAga2luZDogJ3NjYWxhcicsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sTnVsbCxcbiAgY29uc3RydWN0OiBjb25zdHJ1Y3RZYW1sTnVsbCxcbiAgcHJlZGljYXRlOiBpc051bGwsXG4gIHJlcHJlc2VudDoge1xuICAgIGNhbm9uaWNhbDogZnVuY3Rpb24gKCkgeyByZXR1cm4gJ34nIH0sXG4gICAgbG93ZXJjYXNlOiBmdW5jdGlvbiAoKSB7IHJldHVybiAnbnVsbCcgfSxcbiAgICB1cHBlcmNhc2U6IGZ1bmN0aW9uICgpIHsgcmV0dXJuICdOVUxMJyB9LFxuICAgIGNhbWVsY2FzZTogZnVuY3Rpb24gKCkgeyByZXR1cm4gJ051bGwnIH0sXG4gICAgZW1wdHk6IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcnIH1cbiAgfSxcbiAgZGVmYXVsdFN0eWxlOiAnbG93ZXJjYXNlJ1xufSlcbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgVHlwZSA9IHJlcXVpcmUoJy4uL3R5cGUnKVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEJvb2xlYW4gKGRhdGEpIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiBmYWxzZVxuXG4gIGNvbnN0IG1heCA9IGRhdGEubGVuZ3RoXG5cbiAgcmV0dXJuIChtYXggPT09IDQgJiYgKGRhdGEgPT09ICd0cnVlJyB8fCBkYXRhID09PSAnVHJ1ZScgfHwgZGF0YSA9PT0gJ1RSVUUnKSkgfHxcbiAgICAgICAgIChtYXggPT09IDUgJiYgKGRhdGEgPT09ICdmYWxzZScgfHwgZGF0YSA9PT0gJ0ZhbHNlJyB8fCBkYXRhID09PSAnRkFMU0UnKSlcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0WWFtbEJvb2xlYW4gKGRhdGEpIHtcbiAgcmV0dXJuIGRhdGEgPT09ICd0cnVlJyB8fFxuICAgICAgICAgZGF0YSA9PT0gJ1RydWUnIHx8XG4gICAgICAgICBkYXRhID09PSAnVFJVRSdcbn1cblxuZnVuY3Rpb24gaXNCb29sZWFuIChvYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09PSAnW29iamVjdCBCb29sZWFuXSdcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsIHtcbiAga2luZDogJ3NjYWxhcicsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sQm9vbGVhbixcbiAgY29uc3RydWN0OiBjb25zdHJ1Y3RZYW1sQm9vbGVhbixcbiAgcHJlZGljYXRlOiBpc0Jvb2xlYW4sXG4gIHJlcHJlc2VudDoge1xuICAgIGxvd2VyY2FzZTogZnVuY3Rpb24gKG9iamVjdCkgeyByZXR1cm4gb2JqZWN0ID8gJ3RydWUnIDogJ2ZhbHNlJyB9LFxuICAgIHVwcGVyY2FzZTogZnVuY3Rpb24gKG9iamVjdCkgeyByZXR1cm4gb2JqZWN0ID8gJ1RSVUUnIDogJ0ZBTFNFJyB9LFxuICAgIGNhbWVsY2FzZTogZnVuY3Rpb24gKG9iamVjdCkgeyByZXR1cm4gb2JqZWN0ID8gJ1RydWUnIDogJ0ZhbHNlJyB9XG4gIH0sXG4gIGRlZmF1bHRTdHlsZTogJ2xvd2VyY2FzZSdcbn0pXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGNvbW1vbiA9IHJlcXVpcmUoJy4uL2NvbW1vbicpXG5jb25zdCBUeXBlID0gcmVxdWlyZSgnLi4vdHlwZScpXG5cbmZ1bmN0aW9uIGlzSGV4Q29kZSAoYykge1xuICByZXR1cm4gKChjID49IDB4MzAvKiAwICovKSAmJiAoYyA8PSAweDM5LyogOSAqLykpIHx8XG4gICAgICAgICAoKGMgPj0gMHg0MS8qIEEgKi8pICYmIChjIDw9IDB4NDYvKiBGICovKSkgfHxcbiAgICAgICAgICgoYyA+PSAweDYxLyogYSAqLykgJiYgKGMgPD0gMHg2Ni8qIGYgKi8pKVxufVxuXG5mdW5jdGlvbiBpc09jdENvZGUgKGMpIHtcbiAgcmV0dXJuICgoYyA+PSAweDMwLyogMCAqLykgJiYgKGMgPD0gMHgzNy8qIDcgKi8pKVxufVxuXG5mdW5jdGlvbiBpc0RlY0NvZGUgKGMpIHtcbiAgcmV0dXJuICgoYyA+PSAweDMwLyogMCAqLykgJiYgKGMgPD0gMHgzOS8qIDkgKi8pKVxufVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEludGVnZXIgKGRhdGEpIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiBmYWxzZVxuXG4gIGNvbnN0IG1heCA9IGRhdGEubGVuZ3RoXG4gIGxldCBpbmRleCA9IDBcbiAgbGV0IGhhc0RpZ2l0cyA9IGZhbHNlXG5cbiAgaWYgKCFtYXgpIHJldHVybiBmYWxzZVxuXG4gIGxldCBjaCA9IGRhdGFbaW5kZXhdXG5cbiAgLy8gc2lnblxuICBpZiAoY2ggPT09ICctJyB8fCBjaCA9PT0gJysnKSB7XG4gICAgY2ggPSBkYXRhWysraW5kZXhdXG4gIH1cblxuICBpZiAoY2ggPT09ICcwJykge1xuICAgIC8vIDBcbiAgICBpZiAoaW5kZXggKyAxID09PSBtYXgpIHJldHVybiB0cnVlXG4gICAgY2ggPSBkYXRhWysraW5kZXhdXG5cbiAgICAvLyBiYXNlIDIsIGJhc2UgOCwgYmFzZSAxNlxuXG4gICAgaWYgKGNoID09PSAnYicpIHtcbiAgICAgIC8vIGJhc2UgMlxuICAgICAgaW5kZXgrK1xuXG4gICAgICBmb3IgKDsgaW5kZXggPCBtYXg7IGluZGV4KyspIHtcbiAgICAgICAgY2ggPSBkYXRhW2luZGV4XVxuICAgICAgICBpZiAoY2ggIT09ICcwJyAmJiBjaCAhPT0gJzEnKSByZXR1cm4gZmFsc2VcbiAgICAgICAgaGFzRGlnaXRzID0gdHJ1ZVxuICAgICAgfVxuICAgICAgcmV0dXJuIGhhc0RpZ2l0cyAmJiBOdW1iZXIuaXNGaW5pdGUocGFyc2VZYW1sSW50ZWdlcihkYXRhKSlcbiAgICB9XG5cbiAgICBpZiAoY2ggPT09ICd4Jykge1xuICAgICAgLy8gYmFzZSAxNlxuICAgICAgaW5kZXgrK1xuXG4gICAgICBmb3IgKDsgaW5kZXggPCBtYXg7IGluZGV4KyspIHtcbiAgICAgICAgaWYgKCFpc0hleENvZGUoZGF0YS5jaGFyQ29kZUF0KGluZGV4KSkpIHJldHVybiBmYWxzZVxuICAgICAgICBoYXNEaWdpdHMgPSB0cnVlXG4gICAgICB9XG4gICAgICByZXR1cm4gaGFzRGlnaXRzICYmIE51bWJlci5pc0Zpbml0ZShwYXJzZVlhbWxJbnRlZ2VyKGRhdGEpKVxuICAgIH1cblxuICAgIGlmIChjaCA9PT0gJ28nKSB7XG4gICAgICAvLyBiYXNlIDhcbiAgICAgIGluZGV4KytcblxuICAgICAgZm9yICg7IGluZGV4IDwgbWF4OyBpbmRleCsrKSB7XG4gICAgICAgIGlmICghaXNPY3RDb2RlKGRhdGEuY2hhckNvZGVBdChpbmRleCkpKSByZXR1cm4gZmFsc2VcbiAgICAgICAgaGFzRGlnaXRzID0gdHJ1ZVxuICAgICAgfVxuICAgICAgcmV0dXJuIGhhc0RpZ2l0cyAmJiBOdW1iZXIuaXNGaW5pdGUocGFyc2VZYW1sSW50ZWdlcihkYXRhKSlcbiAgICB9XG4gIH1cblxuICAvLyBiYXNlIDEwIChleGNlcHQgMClcblxuICBmb3IgKDsgaW5kZXggPCBtYXg7IGluZGV4KyspIHtcbiAgICBpZiAoIWlzRGVjQ29kZShkYXRhLmNoYXJDb2RlQXQoaW5kZXgpKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGhhc0RpZ2l0cyA9IHRydWVcbiAgfVxuXG4gIGlmICghaGFzRGlnaXRzKSByZXR1cm4gZmFsc2VcblxuICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHBhcnNlWWFtbEludGVnZXIoZGF0YSkpXG59XG5cbmZ1bmN0aW9uIHBhcnNlWWFtbEludGVnZXIgKGRhdGEpIHtcbiAgbGV0IHZhbHVlID0gZGF0YVxuICBsZXQgc2lnbiA9IDFcblxuICBsZXQgY2ggPSB2YWx1ZVswXVxuXG4gIGlmIChjaCA9PT0gJy0nIHx8IGNoID09PSAnKycpIHtcbiAgICBpZiAoY2ggPT09ICctJykgc2lnbiA9IC0xXG4gICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgxKVxuICAgIGNoID0gdmFsdWVbMF1cbiAgfVxuXG4gIGlmICh2YWx1ZSA9PT0gJzAnKSByZXR1cm4gMFxuXG4gIGlmIChjaCA9PT0gJzAnKSB7XG4gICAgaWYgKHZhbHVlWzFdID09PSAnYicpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIDIpXG4gICAgaWYgKHZhbHVlWzFdID09PSAneCcpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIDE2KVxuICAgIGlmICh2YWx1ZVsxXSA9PT0gJ28nKSByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCA4KVxuICB9XG5cbiAgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZSwgMTApXG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdFlhbWxJbnRlZ2VyIChkYXRhKSB7XG4gIHJldHVybiBwYXJzZVlhbWxJbnRlZ2VyKGRhdGEpXG59XG5cbmZ1bmN0aW9uIGlzSW50ZWdlciAob2JqZWN0KSB7XG4gIHJldHVybiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkpID09PSAnW29iamVjdCBOdW1iZXJdJyAmJlxuICAgICAgICAgKG9iamVjdCAlIDEgPT09IDAgJiYgIWNvbW1vbi5pc05lZ2F0aXZlWmVybyhvYmplY3QpKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBUeXBlKCd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLCB7XG4gIGtpbmQ6ICdzY2FsYXInLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbEludGVnZXIsXG4gIGNvbnN0cnVjdDogY29uc3RydWN0WWFtbEludGVnZXIsXG4gIHByZWRpY2F0ZTogaXNJbnRlZ2VyLFxuICByZXByZXNlbnQ6IHtcbiAgICBiaW5hcnk6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiA+PSAwID8gJzBiJyArIG9iai50b1N0cmluZygyKSA6ICctMGInICsgb2JqLnRvU3RyaW5nKDIpLnNsaWNlKDEpIH0sXG4gICAgb2N0YWw6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiA+PSAwID8gJzBvJyArIG9iai50b1N0cmluZyg4KSA6ICctMG8nICsgb2JqLnRvU3RyaW5nKDgpLnNsaWNlKDEpIH0sXG4gICAgZGVjaW1hbDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqLnRvU3RyaW5nKDEwKSB9LFxuICAgIGhleGFkZWNpbWFsOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogPj0gMCA/ICcweCcgKyBvYmoudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCkgOiAnLTB4JyArIG9iai50b1N0cmluZygxNikudG9VcHBlckNhc2UoKS5zbGljZSgxKSB9XG4gIH0sXG4gIGRlZmF1bHRTdHlsZTogJ2RlY2ltYWwnLFxuICBzdHlsZUFsaWFzZXM6IHtcbiAgICBiaW5hcnk6IFsyLCAnYmluJ10sXG4gICAgb2N0YWw6IFs4LCAnb2N0J10sXG4gICAgZGVjaW1hbDogWzEwLCAnZGVjJ10sXG4gICAgaGV4YWRlY2ltYWw6IFsxNiwgJ2hleCddXG4gIH1cbn0pXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGNvbW1vbiA9IHJlcXVpcmUoJy4uL2NvbW1vbicpXG5jb25zdCBUeXBlID0gcmVxdWlyZSgnLi4vdHlwZScpXG5cbmNvbnN0IFlBTUxfRkxPQVRfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gIC8vIDIuNWU0LCAyLjUgYW5kIGludGVnZXJzXG4gICdeKD86Wy0rXT8oPzpbMC05XSspKD86XFxcXC5bMC05XSopPyg/OltlRV1bLStdP1swLTldKyk/JyArXG4gIC8vIC4yZTQsIC4yXG4gIC8vIHNwZWNpYWwgY2FzZSwgc2VlbXMgbm90IGZyb20gc3BlY1xuICAnfFxcXFwuWzAtOV0rKD86W2VFXVstK10/WzAtOV0rKT8nICtcbiAgLy8gLmluZlxuICAnfFstK10/XFxcXC4oPzppbmZ8SW5mfElORiknICtcbiAgLy8gLm5hblxuICAnfFxcXFwuKD86bmFufE5hTnxOQU4pKSQnKVxuXG5jb25zdCBZQU1MX0ZMT0FUX1NQRUNJQUxfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gICdeKD86JyArXG4gIC8vIC5pbmZcbiAgJ1stK10/XFxcXC4oPzppbmZ8SW5mfElORiknICtcbiAgLy8gLm5hblxuICAnfFxcXFwuKD86bmFufE5hTnxOQU4pKSQnKVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEZsb2F0IChkYXRhKSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gZmFsc2VcblxuICBpZiAoIVlBTUxfRkxPQVRfUEFUVEVSTi50ZXN0KGRhdGEpKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoTnVtYmVyLmlzRmluaXRlKHBhcnNlRmxvYXQoZGF0YSwgMTApKSkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICByZXR1cm4gWUFNTF9GTE9BVF9TUEVDSUFMX1BBVFRFUk4udGVzdChkYXRhKVxufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sRmxvYXQgKGRhdGEpIHtcbiAgbGV0IHZhbHVlID0gZGF0YS50b0xvd2VyQ2FzZSgpXG4gIGNvbnN0IHNpZ24gPSB2YWx1ZVswXSA9PT0gJy0nID8gLTEgOiAxXG5cbiAgaWYgKCcrLScuaW5kZXhPZih2YWx1ZVswXSkgPj0gMCkge1xuICAgIHZhbHVlID0gdmFsdWUuc2xpY2UoMSlcbiAgfVxuXG4gIGlmICh2YWx1ZSA9PT0gJy5pbmYnKSB7XG4gICAgcmV0dXJuIChzaWduID09PSAxKSA/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA6IE51bWJlci5ORUdBVElWRV9JTkZJTklUWVxuICB9IGVsc2UgaWYgKHZhbHVlID09PSAnLm5hbicpIHtcbiAgICByZXR1cm4gTmFOXG4gIH1cbiAgcmV0dXJuIHNpZ24gKiBwYXJzZUZsb2F0KHZhbHVlLCAxMClcbn1cblxuY29uc3QgU0NJRU5USUZJQ19XSVRIT1VUX0RPVCA9IC9eWy0rXT9bMC05XStlL1xuXG5mdW5jdGlvbiByZXByZXNlbnRZYW1sRmxvYXQgKG9iamVjdCwgc3R5bGUpIHtcbiAgaWYgKGlzTmFOKG9iamVjdCkpIHtcbiAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICBjYXNlICdsb3dlcmNhc2UnOiByZXR1cm4gJy5uYW4nXG4gICAgICBjYXNlICd1cHBlcmNhc2UnOiByZXR1cm4gJy5OQU4nXG4gICAgICBjYXNlICdjYW1lbGNhc2UnOiByZXR1cm4gJy5OYU4nXG4gICAgfVxuICB9IGVsc2UgaWYgKE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA9PT0gb2JqZWN0KSB7XG4gICAgc3dpdGNoIChzdHlsZSkge1xuICAgICAgY2FzZSAnbG93ZXJjYXNlJzogcmV0dXJuICcuaW5mJ1xuICAgICAgY2FzZSAndXBwZXJjYXNlJzogcmV0dXJuICcuSU5GJ1xuICAgICAgY2FzZSAnY2FtZWxjYXNlJzogcmV0dXJuICcuSW5mJ1xuICAgIH1cbiAgfSBlbHNlIGlmIChOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkgPT09IG9iamVjdCkge1xuICAgIHN3aXRjaCAoc3R5bGUpIHtcbiAgICAgIGNhc2UgJ2xvd2VyY2FzZSc6IHJldHVybiAnLS5pbmYnXG4gICAgICBjYXNlICd1cHBlcmNhc2UnOiByZXR1cm4gJy0uSU5GJ1xuICAgICAgY2FzZSAnY2FtZWxjYXNlJzogcmV0dXJuICctLkluZidcbiAgICB9XG4gIH0gZWxzZSBpZiAoY29tbW9uLmlzTmVnYXRpdmVaZXJvKG9iamVjdCkpIHtcbiAgICByZXR1cm4gJy0wLjAnXG4gIH1cblxuICBjb25zdCByZXMgPSBvYmplY3QudG9TdHJpbmcoMTApXG5cbiAgLy8gSlMgc3RyaW5naWZpZXIgY2FuIGJ1aWxkIHNjaWVudGlmaWMgZm9ybWF0IHdpdGhvdXQgZG90czogNWUtMTAwLFxuICAvLyB3aGlsZSBZQU1MIHJlcXVyZXMgZG90OiA1LmUtMTAwLiBGaXggaXQgd2l0aCBzaW1wbGUgaGFja1xuXG4gIHJldHVybiBTQ0lFTlRJRklDX1dJVEhPVVRfRE9ULnRlc3QocmVzKSA/IHJlcy5yZXBsYWNlKCdlJywgJy5lJykgOiByZXNcbn1cblxuZnVuY3Rpb24gaXNGbG9hdCAob2JqZWN0KSB7XG4gIHJldHVybiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT09ICdbb2JqZWN0IE51bWJlcl0nKSAmJlxuICAgICAgICAgKG9iamVjdCAlIDEgIT09IDAgfHwgY29tbW9uLmlzTmVnYXRpdmVaZXJvKG9iamVjdCkpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFR5cGUoJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0Jywge1xuICBraW5kOiAnc2NhbGFyJyxcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxGbG9hdCxcbiAgY29uc3RydWN0OiBjb25zdHJ1Y3RZYW1sRmxvYXQsXG4gIHByZWRpY2F0ZTogaXNGbG9hdCxcbiAgcmVwcmVzZW50OiByZXByZXNlbnRZYW1sRmxvYXQsXG4gIGRlZmF1bHRTdHlsZTogJ2xvd2VyY2FzZSdcbn0pXG4iLCAiLy8gU3RhbmRhcmQgWUFNTCdzIEpTT04gc2NoZW1hLlxuLy8gaHR0cDovL3d3dy55YW1sLm9yZy9zcGVjLzEuMi9zcGVjLmh0bWwjaWQyODAzMjMxXG4vL1xuLy8gTk9URTogSlMtWUFNTCBkb2VzIG5vdCBzdXBwb3J0IHNjaGVtYS1zcGVjaWZpYyB0YWcgcmVzb2x1dGlvbiByZXN0cmljdGlvbnMuXG4vLyBTbywgdGhpcyBzY2hlbWEgaXMgbm90IHN1Y2ggc3RyaWN0IGFzIGRlZmluZWQgaW4gdGhlIFlBTUwgc3BlY2lmaWNhdGlvbi5cbi8vIEl0IGFsbG93cyBudW1iZXJzIGluIGJpbmFyeSBub3RhaW9uLCB1c2UgYE51bGxgIGFuZCBgTlVMTGAgYXMgYG51bGxgLCBldGMuXG5cbid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZmFpbHNhZmUnKS5leHRlbmQoe1xuICBpbXBsaWNpdDogW1xuICAgIHJlcXVpcmUoJy4uL3R5cGUvbnVsbCcpLFxuICAgIHJlcXVpcmUoJy4uL3R5cGUvYm9vbCcpLFxuICAgIHJlcXVpcmUoJy4uL3R5cGUvaW50JyksXG4gICAgcmVxdWlyZSgnLi4vdHlwZS9mbG9hdCcpXG4gIF1cbn0pXG4iLCAiLy8gU3RhbmRhcmQgWUFNTCdzIENvcmUgc2NoZW1hLlxuLy8gaHR0cDovL3d3dy55YW1sLm9yZy9zcGVjLzEuMi9zcGVjLmh0bWwjaWQyODA0OTIzXG4vL1xuLy8gTk9URTogSlMtWUFNTCBkb2VzIG5vdCBzdXBwb3J0IHNjaGVtYS1zcGVjaWZpYyB0YWcgcmVzb2x1dGlvbiByZXN0cmljdGlvbnMuXG4vLyBTbywgQ29yZSBzY2hlbWEgaGFzIG5vIGRpc3RpbmN0aW9ucyBmcm9tIEpTT04gc2NoZW1hIGlzIEpTLVlBTUwuXG5cbid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vanNvbicpXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IFR5cGUgPSByZXF1aXJlKCcuLi90eXBlJylcblxuY29uc3QgWUFNTF9EQVRFX1JFR0VYUCA9IG5ldyBSZWdFeHAoXG4gICdeKFswLTldWzAtOV1bMC05XVswLTldKScgKyAvLyBbMV0geWVhclxuICAnLShbMC05XVswLTldKScgKyAvLyBbMl0gbW9udGhcbiAgJy0oWzAtOV1bMC05XSkkJykgICAgICAgICAgICAgICAgICAgLy8gWzNdIGRheVxuXG5jb25zdCBZQU1MX1RJTUVTVEFNUF9SRUdFWFAgPSBuZXcgUmVnRXhwKFxuICAnXihbMC05XVswLTldWzAtOV1bMC05XSknICsgLy8gWzFdIHllYXJcbiAgJy0oWzAtOV1bMC05XT8pJyArIC8vIFsyXSBtb250aFxuICAnLShbMC05XVswLTldPyknICsgLy8gWzNdIGRheVxuICAnKD86W1R0XXxbIFxcXFx0XSspJyArIC8vIC4uLlxuICAnKFswLTldWzAtOV0/KScgKyAvLyBbNF0gaG91clxuICAnOihbMC05XVswLTldKScgKyAvLyBbNV0gbWludXRlXG4gICc6KFswLTldWzAtOV0pJyArIC8vIFs2XSBzZWNvbmRcbiAgJyg/OlxcXFwuKFswLTldKikpPycgKyAvLyBbN10gZnJhY3Rpb25cbiAgJyg/OlsgXFxcXHRdKihafChbLStdKShbMC05XVswLTldPyknICsgLy8gWzhdIHR6IFs5XSB0el9zaWduIFsxMF0gdHpIb3VyXG4gICcoPzo6KFswLTldWzAtOV0pKT8pKT8kJykgICAgICAgICAgIC8vIFsxMV0gdHpNaW51dGVcblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxUaW1lc3RhbXAgKGRhdGEpIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiBmYWxzZVxuICBpZiAoWUFNTF9EQVRFX1JFR0VYUC5leGVjKGRhdGEpICE9PSBudWxsKSByZXR1cm4gdHJ1ZVxuICBpZiAoWUFNTF9USU1FU1RBTVBfUkVHRVhQLmV4ZWMoZGF0YSkgIT09IG51bGwpIHJldHVybiB0cnVlXG4gIHJldHVybiBmYWxzZVxufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sVGltZXN0YW1wIChkYXRhKSB7XG4gIGxldCBmcmFjdGlvbiA9IDBcbiAgbGV0IGRlbHRhID0gbnVsbFxuXG4gIGxldCBtYXRjaCA9IFlBTUxfREFURV9SRUdFWFAuZXhlYyhkYXRhKVxuICBpZiAobWF0Y2ggPT09IG51bGwpIG1hdGNoID0gWUFNTF9USU1FU1RBTVBfUkVHRVhQLmV4ZWMoZGF0YSlcblxuICBpZiAobWF0Y2ggPT09IG51bGwpIHRocm93IG5ldyBFcnJvcignRGF0ZSByZXNvbHZlIGVycm9yJylcblxuICAvLyBtYXRjaDogWzFdIHllYXIgWzJdIG1vbnRoIFszXSBkYXlcblxuICBjb25zdCB5ZWFyID0gKyhtYXRjaFsxXSlcbiAgY29uc3QgbW9udGggPSArKG1hdGNoWzJdKSAtIDEgLy8gSlMgbW9udGggc3RhcnRzIHdpdGggMFxuICBjb25zdCBkYXkgPSArKG1hdGNoWzNdKVxuXG4gIGlmICghbWF0Y2hbNF0pIHsgLy8gbm8gaG91clxuICAgIHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQyh5ZWFyLCBtb250aCwgZGF5KSlcbiAgfVxuXG4gIC8vIG1hdGNoOiBbNF0gaG91ciBbNV0gbWludXRlIFs2XSBzZWNvbmQgWzddIGZyYWN0aW9uXG5cbiAgY29uc3QgaG91ciA9ICsobWF0Y2hbNF0pXG4gIGNvbnN0IG1pbnV0ZSA9ICsobWF0Y2hbNV0pXG4gIGNvbnN0IHNlY29uZCA9ICsobWF0Y2hbNl0pXG5cbiAgaWYgKG1hdGNoWzddKSB7XG4gICAgZnJhY3Rpb24gPSBtYXRjaFs3XS5zbGljZSgwLCAzKVxuICAgIHdoaWxlIChmcmFjdGlvbi5sZW5ndGggPCAzKSB7IC8vIG1pbGxpLXNlY29uZHNcbiAgICAgIGZyYWN0aW9uICs9ICcwJ1xuICAgIH1cbiAgICBmcmFjdGlvbiA9ICtmcmFjdGlvblxuICB9XG5cbiAgLy8gbWF0Y2g6IFs4XSB0eiBbOV0gdHpfc2lnbiBbMTBdIHR6SG91ciBbMTFdIHR6TWludXRlXG5cbiAgaWYgKG1hdGNoWzldKSB7XG4gICAgY29uc3QgdHpIb3VyID0gKyhtYXRjaFsxMF0pXG4gICAgY29uc3QgdHpNaW51dGUgPSArKG1hdGNoWzExXSB8fCAwKVxuICAgIGRlbHRhID0gKHR6SG91ciAqIDYwICsgdHpNaW51dGUpICogNjAwMDAgLy8gZGVsdGEgaW4gbWlsaS1zZWNvbmRzXG4gICAgaWYgKG1hdGNoWzldID09PSAnLScpIGRlbHRhID0gLWRlbHRhXG4gIH1cblxuICBjb25zdCBkYXRlID0gbmV3IERhdGUoRGF0ZS5VVEMoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIGZyYWN0aW9uKSlcblxuICBpZiAoZGVsdGEpIGRhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSAtIGRlbHRhKVxuXG4gIHJldHVybiBkYXRlXG59XG5cbmZ1bmN0aW9uIHJlcHJlc2VudFlhbWxUaW1lc3RhbXAgKG9iamVjdCAvKiwgc3R5bGUgKi8pIHtcbiAgcmV0dXJuIG9iamVjdC50b0lTT1N0cmluZygpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFR5cGUoJ3RhZzp5YW1sLm9yZywyMDAyOnRpbWVzdGFtcCcsIHtcbiAga2luZDogJ3NjYWxhcicsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sVGltZXN0YW1wLFxuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdFlhbWxUaW1lc3RhbXAsXG4gIGluc3RhbmNlT2Y6IERhdGUsXG4gIHJlcHJlc2VudDogcmVwcmVzZW50WWFtbFRpbWVzdGFtcFxufSlcbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgVHlwZSA9IHJlcXVpcmUoJy4uL3R5cGUnKVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbE1lcmdlIChkYXRhKSB7XG4gIHJldHVybiBkYXRhID09PSAnPDwnIHx8IGRhdGEgPT09IG51bGxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6bWVyZ2UnLCB7XG4gIGtpbmQ6ICdzY2FsYXInLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbE1lcmdlXG59KVxuIiwgIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBUeXBlID0gcmVxdWlyZSgnLi4vdHlwZScpXG5cbi8vIFsgNjQsIDY1LCA2NiBdIC0+IFsgcGFkZGluZywgQ1IsIExGIF1cbmNvbnN0IEJBU0U2NF9NQVAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz1cXG5cXHInXG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sQmluYXJ5IChkYXRhKSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gZmFsc2VcblxuICBsZXQgYml0bGVuID0gMFxuICBjb25zdCBtYXggPSBkYXRhLmxlbmd0aFxuICBjb25zdCBtYXAgPSBCQVNFNjRfTUFQXG5cbiAgLy8gQ29udmVydCBvbmUgYnkgb25lLlxuICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBtYXg7IGlkeCsrKSB7XG4gICAgY29uc3QgY29kZSA9IG1hcC5pbmRleE9mKGRhdGEuY2hhckF0KGlkeCkpXG5cbiAgICAvLyBTa2lwIENSL0xGXG4gICAgaWYgKGNvZGUgPiA2NCkgY29udGludWVcblxuICAgIC8vIEZhaWwgb24gaWxsZWdhbCBjaGFyYWN0ZXJzXG4gICAgaWYgKGNvZGUgPCAwKSByZXR1cm4gZmFsc2VcblxuICAgIGJpdGxlbiArPSA2XG4gIH1cblxuICAvLyBJZiB0aGVyZSBhcmUgYW55IGJpdHMgbGVmdCwgc291cmNlIHdhcyBjb3JydXB0ZWRcbiAgcmV0dXJuIChiaXRsZW4gJSA4KSA9PT0gMFxufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sQmluYXJ5IChkYXRhKSB7XG4gIGNvbnN0IGlucHV0ID0gZGF0YS5yZXBsYWNlKC9bXFxyXFxuPV0vZywgJycpIC8vIHJlbW92ZSBDUi9MRiAmIHBhZGRpbmcgdG8gc2ltcGxpZnkgc2NhblxuICBjb25zdCBtYXggPSBpbnB1dC5sZW5ndGhcbiAgY29uc3QgbWFwID0gQkFTRTY0X01BUFxuICBsZXQgYml0cyA9IDBcbiAgY29uc3QgcmVzdWx0ID0gW11cblxuICAvLyBDb2xsZWN0IGJ5IDYqNCBiaXRzICgzIGJ5dGVzKVxuXG4gIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IG1heDsgaWR4KyspIHtcbiAgICBpZiAoKGlkeCAlIDQgPT09IDApICYmIGlkeCkge1xuICAgICAgcmVzdWx0LnB1c2goKGJpdHMgPj4gMTYpICYgMHhGRilcbiAgICAgIHJlc3VsdC5wdXNoKChiaXRzID4+IDgpICYgMHhGRilcbiAgICAgIHJlc3VsdC5wdXNoKGJpdHMgJiAweEZGKVxuICAgIH1cblxuICAgIGJpdHMgPSAoYml0cyA8PCA2KSB8IG1hcC5pbmRleE9mKGlucHV0LmNoYXJBdChpZHgpKVxuICB9XG5cbiAgLy8gRHVtcCB0YWlsXG5cbiAgY29uc3QgdGFpbGJpdHMgPSAobWF4ICUgNCkgKiA2XG5cbiAgaWYgKHRhaWxiaXRzID09PSAwKSB7XG4gICAgcmVzdWx0LnB1c2goKGJpdHMgPj4gMTYpICYgMHhGRilcbiAgICByZXN1bHQucHVzaCgoYml0cyA+PiA4KSAmIDB4RkYpXG4gICAgcmVzdWx0LnB1c2goYml0cyAmIDB4RkYpXG4gIH0gZWxzZSBpZiAodGFpbGJpdHMgPT09IDE4KSB7XG4gICAgcmVzdWx0LnB1c2goKGJpdHMgPj4gMTApICYgMHhGRilcbiAgICByZXN1bHQucHVzaCgoYml0cyA+PiAyKSAmIDB4RkYpXG4gIH0gZWxzZSBpZiAodGFpbGJpdHMgPT09IDEyKSB7XG4gICAgcmVzdWx0LnB1c2goKGJpdHMgPj4gNCkgJiAweEZGKVxuICB9XG5cbiAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHJlc3VsdClcbn1cblxuZnVuY3Rpb24gcmVwcmVzZW50WWFtbEJpbmFyeSAob2JqZWN0IC8qLCBzdHlsZSAqLykge1xuICBsZXQgcmVzdWx0ID0gJydcbiAgbGV0IGJpdHMgPSAwXG4gIGNvbnN0IG1heCA9IG9iamVjdC5sZW5ndGhcbiAgY29uc3QgbWFwID0gQkFTRTY0X01BUFxuXG4gIC8vIENvbnZlcnQgZXZlcnkgdGhyZWUgYnl0ZXMgdG8gNCBBU0NJSSBjaGFyYWN0ZXJzLlxuXG4gIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IG1heDsgaWR4KyspIHtcbiAgICBpZiAoKGlkeCAlIDMgPT09IDApICYmIGlkeCkge1xuICAgICAgcmVzdWx0ICs9IG1hcFsoYml0cyA+PiAxOCkgJiAweDNGXVxuICAgICAgcmVzdWx0ICs9IG1hcFsoYml0cyA+PiAxMikgJiAweDNGXVxuICAgICAgcmVzdWx0ICs9IG1hcFsoYml0cyA+PiA2KSAmIDB4M0ZdXG4gICAgICByZXN1bHQgKz0gbWFwW2JpdHMgJiAweDNGXVxuICAgIH1cblxuICAgIGJpdHMgPSAoYml0cyA8PCA4KSArIG9iamVjdFtpZHhdXG4gIH1cblxuICAvLyBEdW1wIHRhaWxcblxuICBjb25zdCB0YWlsID0gbWF4ICUgM1xuXG4gIGlmICh0YWlsID09PSAwKSB7XG4gICAgcmVzdWx0ICs9IG1hcFsoYml0cyA+PiAxOCkgJiAweDNGXVxuICAgIHJlc3VsdCArPSBtYXBbKGJpdHMgPj4gMTIpICYgMHgzRl1cbiAgICByZXN1bHQgKz0gbWFwWyhiaXRzID4+IDYpICYgMHgzRl1cbiAgICByZXN1bHQgKz0gbWFwW2JpdHMgJiAweDNGXVxuICB9IGVsc2UgaWYgKHRhaWwgPT09IDIpIHtcbiAgICByZXN1bHQgKz0gbWFwWyhiaXRzID4+IDEwKSAmIDB4M0ZdXG4gICAgcmVzdWx0ICs9IG1hcFsoYml0cyA+PiA0KSAmIDB4M0ZdXG4gICAgcmVzdWx0ICs9IG1hcFsoYml0cyA8PCAyKSAmIDB4M0ZdXG4gICAgcmVzdWx0ICs9IG1hcFs2NF1cbiAgfSBlbHNlIGlmICh0YWlsID09PSAxKSB7XG4gICAgcmVzdWx0ICs9IG1hcFsoYml0cyA+PiAyKSAmIDB4M0ZdXG4gICAgcmVzdWx0ICs9IG1hcFsoYml0cyA8PCA0KSAmIDB4M0ZdXG4gICAgcmVzdWx0ICs9IG1hcFs2NF1cbiAgICByZXN1bHQgKz0gbWFwWzY0XVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiBpc0JpbmFyeSAob2JqKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgVWludDhBcnJheV0nXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFR5cGUoJ3RhZzp5YW1sLm9yZywyMDAyOmJpbmFyeScsIHtcbiAga2luZDogJ3NjYWxhcicsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sQmluYXJ5LFxuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdFlhbWxCaW5hcnksXG4gIHByZWRpY2F0ZTogaXNCaW5hcnksXG4gIHJlcHJlc2VudDogcmVwcmVzZW50WWFtbEJpbmFyeVxufSlcbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgVHlwZSA9IHJlcXVpcmUoJy4uL3R5cGUnKVxuXG5jb25zdCBfaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG5jb25zdCBfdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sT21hcCAoZGF0YSkge1xuICBpZiAoZGF0YSA9PT0gbnVsbCkgcmV0dXJuIHRydWVcblxuICBjb25zdCBvYmplY3RLZXlzID0gW11cbiAgY29uc3Qgb2JqZWN0ID0gZGF0YVxuXG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCBwYWlyID0gb2JqZWN0W2luZGV4XVxuICAgIGxldCBwYWlySGFzS2V5ID0gZmFsc2VcblxuICAgIGlmIChfdG9TdHJpbmcuY2FsbChwYWlyKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHJldHVybiBmYWxzZVxuXG4gICAgbGV0IHBhaXJLZXlcbiAgICBmb3IgKHBhaXJLZXkgaW4gcGFpcikge1xuICAgICAgaWYgKF9oYXNPd25Qcm9wZXJ0eS5jYWxsKHBhaXIsIHBhaXJLZXkpKSB7XG4gICAgICAgIGlmICghcGFpckhhc0tleSkgcGFpckhhc0tleSA9IHRydWVcbiAgICAgICAgZWxzZSByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXBhaXJIYXNLZXkpIHJldHVybiBmYWxzZVxuXG4gICAgaWYgKG9iamVjdEtleXMuaW5kZXhPZihwYWlyS2V5KSA9PT0gLTEpIG9iamVjdEtleXMucHVzaChwYWlyS2V5KVxuICAgIGVsc2UgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sT21hcCAoZGF0YSkge1xuICByZXR1cm4gZGF0YSAhPT0gbnVsbCA/IGRhdGEgOiBbXVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBUeXBlKCd0YWc6eWFtbC5vcmcsMjAwMjpvbWFwJywge1xuICBraW5kOiAnc2VxdWVuY2UnLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbE9tYXAsXG4gIGNvbnN0cnVjdDogY29uc3RydWN0WWFtbE9tYXBcbn0pXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IFR5cGUgPSByZXF1aXJlKCcuLi90eXBlJylcblxuY29uc3QgX3RvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xuXG5mdW5jdGlvbiByZXNvbHZlWWFtbFBhaXJzIChkYXRhKSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gdHJ1ZVxuXG4gIGNvbnN0IG9iamVjdCA9IGRhdGFcblxuICBjb25zdCByZXN1bHQgPSBuZXcgQXJyYXkob2JqZWN0Lmxlbmd0aClcblxuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IG9iamVjdC5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgY29uc3QgcGFpciA9IG9iamVjdFtpbmRleF1cblxuICAgIGlmIChfdG9TdHJpbmcuY2FsbChwYWlyKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHJldHVybiBmYWxzZVxuXG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHBhaXIpXG5cbiAgICBpZiAoa2V5cy5sZW5ndGggIT09IDEpIHJldHVybiBmYWxzZVxuXG4gICAgcmVzdWx0W2luZGV4XSA9IFtrZXlzWzBdLCBwYWlyW2tleXNbMF1dXVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0WWFtbFBhaXJzIChkYXRhKSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gW11cblxuICBjb25zdCBvYmplY3QgPSBkYXRhXG4gIGNvbnN0IHJlc3VsdCA9IG5ldyBBcnJheShvYmplY3QubGVuZ3RoKVxuXG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCBwYWlyID0gb2JqZWN0W2luZGV4XVxuXG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHBhaXIpXG5cbiAgICByZXN1bHRbaW5kZXhdID0gW2tleXNbMF0sIHBhaXJba2V5c1swXV1dXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFR5cGUoJ3RhZzp5YW1sLm9yZywyMDAyOnBhaXJzJywge1xuICBraW5kOiAnc2VxdWVuY2UnLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbFBhaXJzLFxuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdFlhbWxQYWlyc1xufSlcbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgVHlwZSA9IHJlcXVpcmUoJy4uL3R5cGUnKVxuXG5jb25zdCBfaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sU2V0IChkYXRhKSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gdHJ1ZVxuXG4gIGNvbnN0IG9iamVjdCA9IGRhdGFcblxuICBmb3IgKGNvbnN0IGtleSBpbiBvYmplY3QpIHtcbiAgICBpZiAoX2hhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSB7XG4gICAgICBpZiAob2JqZWN0W2tleV0gIT09IG51bGwpIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdFlhbWxTZXQgKGRhdGEpIHtcbiAgcmV0dXJuIGRhdGEgIT09IG51bGwgPyBkYXRhIDoge31cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6c2V0Jywge1xuICBraW5kOiAnbWFwcGluZycsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sU2V0LFxuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdFlhbWxTZXRcbn0pXG4iLCAiLy8gSlMtWUFNTCdzIGRlZmF1bHQgc2NoZW1hIGZvciBgc2FmZUxvYWRgIGZ1bmN0aW9uLlxuLy8gSXQgaXMgbm90IGRlc2NyaWJlZCBpbiB0aGUgWUFNTCBzcGVjaWZpY2F0aW9uLlxuLy9cbi8vIFRoaXMgc2NoZW1hIGlzIGJhc2VkIG9uIHN0YW5kYXJkIFlBTUwncyBDb3JlIHNjaGVtYSBhbmQgaW5jbHVkZXMgbW9zdCBvZlxuLy8gZXh0cmEgdHlwZXMgZGVzY3JpYmVkIGF0IFlBTUwgdGFnIHJlcG9zaXRvcnkuIChodHRwOi8veWFtbC5vcmcvdHlwZS8pXG5cbid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY29yZScpLmV4dGVuZCh7XG4gIGltcGxpY2l0OiBbXG4gICAgcmVxdWlyZSgnLi4vdHlwZS90aW1lc3RhbXAnKSxcbiAgICByZXF1aXJlKCcuLi90eXBlL21lcmdlJylcbiAgXSxcbiAgZXhwbGljaXQ6IFtcbiAgICByZXF1aXJlKCcuLi90eXBlL2JpbmFyeScpLFxuICAgIHJlcXVpcmUoJy4uL3R5cGUvb21hcCcpLFxuICAgIHJlcXVpcmUoJy4uL3R5cGUvcGFpcnMnKSxcbiAgICByZXF1aXJlKCcuLi90eXBlL3NldCcpXG4gIF1cbn0pXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGNvbW1vbiA9IHJlcXVpcmUoJy4vY29tbW9uJylcbmNvbnN0IFlBTUxFeGNlcHRpb24gPSByZXF1aXJlKCcuL2V4Y2VwdGlvbicpXG5jb25zdCBtYWtlU25pcHBldCA9IHJlcXVpcmUoJy4vc25pcHBldCcpXG5jb25zdCBERUZBVUxUX1NDSEVNQSA9IHJlcXVpcmUoJy4vc2NoZW1hL2RlZmF1bHQnKVxuXG5jb25zdCBfaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG5cbmNvbnN0IENPTlRFWFRfRkxPV19JTiA9IDFcbmNvbnN0IENPTlRFWFRfRkxPV19PVVQgPSAyXG5jb25zdCBDT05URVhUX0JMT0NLX0lOID0gM1xuY29uc3QgQ09OVEVYVF9CTE9DS19PVVQgPSA0XG5cbmNvbnN0IENIT01QSU5HX0NMSVAgPSAxXG5jb25zdCBDSE9NUElOR19TVFJJUCA9IDJcbmNvbnN0IENIT01QSU5HX0tFRVAgPSAzXG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb250cm9sLXJlZ2V4XG5jb25zdCBQQVRURVJOX05PTl9QUklOVEFCTEUgPSAvW1xceDAwLVxceDA4XFx4MEJcXHgwQ1xceDBFLVxceDFGXFx4N0YtXFx4ODRcXHg4Ni1cXHg5RlxcdUZGRkVcXHVGRkZGXXxbXFx1RDgwMC1cXHVEQkZGXSg/IVtcXHVEQzAwLVxcdURGRkZdKXwoPzpbXlxcdUQ4MDAtXFx1REJGRl18XilbXFx1REMwMC1cXHVERkZGXS9cbmNvbnN0IFBBVFRFUk5fTk9OX0FTQ0lJX0xJTkVfQlJFQUtTID0gL1tcXHg4NVxcdTIwMjhcXHUyMDI5XS9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2VsZXNzLWVzY2FwZVxuY29uc3QgUEFUVEVSTl9GTE9XX0lORElDQVRPUlMgPSAvWyxcXFtcXF17fV0vXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlbGVzcy1lc2NhcGVcbmNvbnN0IFBBVFRFUk5fVEFHX0hBTkRMRSA9IC9eKD86IXwhIXwhWzAtOUEtWmEtei1dKyEpJC9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2VsZXNzLWVzY2FwZVxuY29uc3QgUEFUVEVSTl9UQUdfVVJJID0gL14oPzohfFteLFxcW1xcXXt9XSkoPzolWzAtOWEtZl17Mn18WzAtOWEtelxcLSM7Lz86QCY9KyQsXy4hfionKClcXFtcXF1dKSokL2lcblxuZnVuY3Rpb24gX2NsYXNzIChvYmopIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopIH1cblxuZnVuY3Rpb24gaXNFb2wgKGMpIHtcbiAgcmV0dXJuIChjID09PSAweDBBLyogTEYgKi8pIHx8IChjID09PSAweDBELyogQ1IgKi8pXG59XG5cbmZ1bmN0aW9uIGlzV2hpdGVTcGFjZSAoYykge1xuICByZXR1cm4gKGMgPT09IDB4MDkvKiBUYWIgKi8pIHx8IChjID09PSAweDIwLyogU3BhY2UgKi8pXG59XG5cbmZ1bmN0aW9uIGlzV3NPckVvbCAoYykge1xuICByZXR1cm4gKGMgPT09IDB4MDkvKiBUYWIgKi8pIHx8XG4gICAgICAgICAoYyA9PT0gMHgyMC8qIFNwYWNlICovKSB8fFxuICAgICAgICAgKGMgPT09IDB4MEEvKiBMRiAqLykgfHxcbiAgICAgICAgIChjID09PSAweDBELyogQ1IgKi8pXG59XG5cbmZ1bmN0aW9uIGlzRmxvd0luZGljYXRvciAoYykge1xuICByZXR1cm4gYyA9PT0gMHgyQy8qICwgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NUIvKiBbICovIHx8XG4gICAgICAgICBjID09PSAweDVELyogXSAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg3Qi8qIHsgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4N0QvKiB9ICovXG59XG5cbmZ1bmN0aW9uIGZyb21IZXhDb2RlIChjKSB7XG4gIGlmICgoYyA+PSAweDMwLyogMCAqLykgJiYgKGMgPD0gMHgzOS8qIDkgKi8pKSB7XG4gICAgcmV0dXJuIGMgLSAweDMwXG4gIH1cblxuICBjb25zdCBsYyA9IGMgfCAweDIwXG5cbiAgaWYgKChsYyA+PSAweDYxLyogYSAqLykgJiYgKGxjIDw9IDB4NjYvKiBmICovKSkge1xuICAgIHJldHVybiBsYyAtIDB4NjEgKyAxMFxuICB9XG5cbiAgcmV0dXJuIC0xXG59XG5cbmZ1bmN0aW9uIGVzY2FwZWRIZXhMZW4gKGMpIHtcbiAgaWYgKGMgPT09IDB4NzgvKiB4ICovKSB7IHJldHVybiAyIH1cbiAgaWYgKGMgPT09IDB4NzUvKiB1ICovKSB7IHJldHVybiA0IH1cbiAgaWYgKGMgPT09IDB4NTUvKiBVICovKSB7IHJldHVybiA4IH1cbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gZnJvbURlY2ltYWxDb2RlIChjKSB7XG4gIGlmICgoYyA+PSAweDMwLyogMCAqLykgJiYgKGMgPD0gMHgzOS8qIDkgKi8pKSB7XG4gICAgcmV0dXJuIGMgLSAweDMwXG4gIH1cblxuICByZXR1cm4gLTFcbn1cblxuZnVuY3Rpb24gc2ltcGxlRXNjYXBlU2VxdWVuY2UgKGMpIHtcbiAgc3dpdGNoIChjKSB7XG4gICAgY2FzZSAweDMwLyogMCAqLzogcmV0dXJuICdcXHgwMCdcbiAgICBjYXNlIDB4NjEvKiBhICovOiByZXR1cm4gJ1xceDA3J1xuICAgIGNhc2UgMHg2Mi8qIGIgKi86IHJldHVybiAnXFx4MDgnXG4gICAgY2FzZSAweDc0LyogdCAqLzogcmV0dXJuICdcXHgwOSdcbiAgICBjYXNlIDB4MDkvKiBUYWIgKi86IHJldHVybiAnXFx4MDknXG4gICAgY2FzZSAweDZFLyogbiAqLzogcmV0dXJuICdcXHgwQSdcbiAgICBjYXNlIDB4NzYvKiB2ICovOiByZXR1cm4gJ1xceDBCJ1xuICAgIGNhc2UgMHg2Ni8qIGYgKi86IHJldHVybiAnXFx4MEMnXG4gICAgY2FzZSAweDcyLyogciAqLzogcmV0dXJuICdcXHgwRCdcbiAgICBjYXNlIDB4NjUvKiBlICovOiByZXR1cm4gJ1xceDFCJ1xuICAgIGNhc2UgMHgyMC8qIFNwYWNlICovOiByZXR1cm4gJyAnXG4gICAgY2FzZSAweDIyLyogXCIgKi86IHJldHVybiAnXFx4MjInXG4gICAgY2FzZSAweDJGLyogLyAqLzogcmV0dXJuICcvJ1xuICAgIGNhc2UgMHg1Qy8qIFxcICovOiByZXR1cm4gJ1xceDVDJ1xuICAgIGNhc2UgMHg0RS8qIE4gKi86IHJldHVybiAnXFx4ODUnXG4gICAgY2FzZSAweDVGLyogXyAqLzogcmV0dXJuICdcXHhBMCdcbiAgICBjYXNlIDB4NEMvKiBMICovOiByZXR1cm4gJ1xcdTIwMjgnXG4gICAgY2FzZSAweDUwLyogUCAqLzogcmV0dXJuICdcXHUyMDI5J1xuICAgIGRlZmF1bHQ6IHJldHVybiAnJ1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoYXJGcm9tQ29kZXBvaW50IChjKSB7XG4gIGlmIChjIDw9IDB4RkZGRikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGMpXG4gIH1cbiAgLy8gRW5jb2RlIFVURi0xNiBzdXJyb2dhdGUgcGFpclxuICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9VVEYtMTYjQ29kZV9wb2ludHNfVS4yQjAxMDAwMF90b19VLjJCMTBGRkZGXG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKFxuICAgICgoYyAtIDB4MDEwMDAwKSA+PiAxMCkgKyAweEQ4MDAsXG4gICAgKChjIC0gMHgwMTAwMDApICYgMHgwM0ZGKSArIDB4REMwMFxuICApXG59XG5cbi8vIHNldCBhIHByb3BlcnR5IG9mIGEgbGl0ZXJhbCBvYmplY3QsIHdoaWxlIHByb3RlY3RpbmcgYWdhaW5zdCBwcm90b3R5cGUgcG9sbHV0aW9uLFxuLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC9pc3N1ZXMvMTY0IGZvciBtb3JlIGRldGFpbHNcbmZ1bmN0aW9uIHNldFByb3BlcnR5IChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgLy8gdXNlZCBmb3IgdGhpcyBzcGVjaWZpYyBrZXkgb25seSBiZWNhdXNlIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBpcyBzbG93XG4gIGlmIChrZXkgPT09ICdfX3Byb3RvX18nKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICB2YWx1ZTogdmFsdWVcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFtrZXldID0gdmFsdWVcbiAgfVxufVxuXG5jb25zdCBzaW1wbGVFc2NhcGVDaGVjayA9IG5ldyBBcnJheSgyNTYpIC8vIGludGVnZXIsIGZvciBmYXN0IGFjY2Vzc1xuY29uc3Qgc2ltcGxlRXNjYXBlTWFwID0gbmV3IEFycmF5KDI1NilcbmZvciAobGV0IGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgc2ltcGxlRXNjYXBlQ2hlY2tbaV0gPSBzaW1wbGVFc2NhcGVTZXF1ZW5jZShpKSA/IDEgOiAwXG4gIHNpbXBsZUVzY2FwZU1hcFtpXSA9IHNpbXBsZUVzY2FwZVNlcXVlbmNlKGkpXG59XG5cbmZ1bmN0aW9uIFN0YXRlIChpbnB1dCwgb3B0aW9ucykge1xuICB0aGlzLmlucHV0ID0gaW5wdXRcblxuICB0aGlzLmZpbGVuYW1lID0gb3B0aW9uc1snZmlsZW5hbWUnXSB8fCBudWxsXG4gIHRoaXMuc2NoZW1hID0gb3B0aW9uc1snc2NoZW1hJ10gfHwgREVGQVVMVF9TQ0hFTUFcbiAgdGhpcy5vbldhcm5pbmcgPSBvcHRpb25zWydvbldhcm5pbmcnXSB8fCBudWxsXG4gIC8vIChIaWRkZW4pIFJlbW92ZT8gbWFrZXMgdGhlIGxvYWRlciB0byBleHBlY3QgWUFNTCAxLjEgZG9jdW1lbnRzXG4gIC8vIGlmIHN1Y2ggZG9jdW1lbnRzIGhhdmUgbm8gZXhwbGljaXQgJVlBTUwgZGlyZWN0aXZlXG4gIHRoaXMubGVnYWN5ID0gb3B0aW9uc1snbGVnYWN5J10gfHwgZmFsc2VcblxuICB0aGlzLmpzb24gPSBvcHRpb25zWydqc29uJ10gfHwgZmFsc2VcbiAgdGhpcy5saXN0ZW5lciA9IG9wdGlvbnNbJ2xpc3RlbmVyJ10gfHwgbnVsbFxuICB0aGlzLm1heERlcHRoID0gdHlwZW9mIG9wdGlvbnNbJ21heERlcHRoJ10gPT09ICdudW1iZXInID8gb3B0aW9uc1snbWF4RGVwdGgnXSA6IDEwMFxuICB0aGlzLm1heE1lcmdlU2VxTGVuZ3RoID0gdHlwZW9mIG9wdGlvbnNbJ21heE1lcmdlU2VxTGVuZ3RoJ10gPT09ICdudW1iZXInID8gb3B0aW9uc1snbWF4TWVyZ2VTZXFMZW5ndGgnXSA6IDIwXG5cbiAgdGhpcy5pbXBsaWNpdFR5cGVzID0gdGhpcy5zY2hlbWEuY29tcGlsZWRJbXBsaWNpdFxuICB0aGlzLnR5cGVNYXAgPSB0aGlzLnNjaGVtYS5jb21waWxlZFR5cGVNYXBcblxuICB0aGlzLmxlbmd0aCA9IGlucHV0Lmxlbmd0aFxuICB0aGlzLnBvc2l0aW9uID0gMFxuICB0aGlzLmxpbmUgPSAwXG4gIHRoaXMubGluZVN0YXJ0ID0gMFxuICB0aGlzLmxpbmVJbmRlbnQgPSAwXG4gIHRoaXMuZGVwdGggPSAwXG5cbiAgLy8gcG9zaXRpb24gb2YgZmlyc3QgbGVhZGluZyB0YWIgaW4gdGhlIGN1cnJlbnQgbGluZSxcbiAgLy8gdXNlZCB0byBtYWtlIHN1cmUgdGhlcmUgYXJlIG5vIHRhYnMgaW4gdGhlIGluZGVudGF0aW9uXG4gIHRoaXMuZmlyc3RUYWJJbkxpbmUgPSAtMVxuXG4gIHRoaXMuZG9jdW1lbnRzID0gW11cbiAgdGhpcy5hbmNob3JNYXBUcmFuc2FjdGlvbnMgPSBbXVxuXG4gIC8qXG4gIHRoaXMudmVyc2lvbjtcbiAgdGhpcy5jaGVja0xpbmVCcmVha3M7XG4gIHRoaXMudGFnTWFwO1xuICB0aGlzLmFuY2hvck1hcDtcbiAgdGhpcy50YWc7XG4gIHRoaXMuYW5jaG9yO1xuICB0aGlzLmtpbmQ7XG4gIHRoaXMucmVzdWx0OyAqL1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUVycm9yIChzdGF0ZSwgbWVzc2FnZSkge1xuICBjb25zdCBtYXJrID0ge1xuICAgIG5hbWU6IHN0YXRlLmZpbGVuYW1lLFxuICAgIGJ1ZmZlcjogc3RhdGUuaW5wdXQuc2xpY2UoMCwgLTEpLCAvLyBvbWl0IHRyYWlsaW5nIFxcMFxuICAgIHBvc2l0aW9uOiBzdGF0ZS5wb3NpdGlvbixcbiAgICBsaW5lOiBzdGF0ZS5saW5lLFxuICAgIGNvbHVtbjogc3RhdGUucG9zaXRpb24gLSBzdGF0ZS5saW5lU3RhcnRcbiAgfVxuXG4gIG1hcmsuc25pcHBldCA9IG1ha2VTbmlwcGV0KG1hcmspXG5cbiAgcmV0dXJuIG5ldyBZQU1MRXhjZXB0aW9uKG1lc3NhZ2UsIG1hcmspXG59XG5cbmZ1bmN0aW9uIHRocm93RXJyb3IgKHN0YXRlLCBtZXNzYWdlKSB7XG4gIHRocm93IGdlbmVyYXRlRXJyb3Ioc3RhdGUsIG1lc3NhZ2UpXG59XG5cbmZ1bmN0aW9uIHRocm93V2FybmluZyAoc3RhdGUsIG1lc3NhZ2UpIHtcbiAgaWYgKHN0YXRlLm9uV2FybmluZykge1xuICAgIHN0YXRlLm9uV2FybmluZy5jYWxsKG51bGwsIGdlbmVyYXRlRXJyb3Ioc3RhdGUsIG1lc3NhZ2UpKVxuICB9XG59XG5cbmZ1bmN0aW9uIHN0b3JlQW5jaG9yIChzdGF0ZSwgbmFtZSwgdmFsdWUpIHtcbiAgY29uc3QgdHJhbnNhY3Rpb25zID0gc3RhdGUuYW5jaG9yTWFwVHJhbnNhY3Rpb25zXG5cbiAgaWYgKHRyYW5zYWN0aW9ucy5sZW5ndGggIT09IDApIHtcbiAgICBjb25zdCB0cmFuc2FjdGlvbiA9IHRyYW5zYWN0aW9uc1t0cmFuc2FjdGlvbnMubGVuZ3RoIC0gMV1cblxuICAgIGlmICghX2hhc093blByb3BlcnR5LmNhbGwodHJhbnNhY3Rpb24sIG5hbWUpKSB7XG4gICAgICB0cmFuc2FjdGlvbltuYW1lXSA9IHtcbiAgICAgICAgZXhpc3RlZDogX2hhc093blByb3BlcnR5LmNhbGwoc3RhdGUuYW5jaG9yTWFwLCBuYW1lKSxcbiAgICAgICAgdmFsdWU6IHN0YXRlLmFuY2hvck1hcFtuYW1lXVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0YXRlLmFuY2hvck1hcFtuYW1lXSA9IHZhbHVlXG59XG5cbmZ1bmN0aW9uIGJlZ2luQW5jaG9yVHJhbnNhY3Rpb24gKHN0YXRlKSB7XG4gIHN0YXRlLmFuY2hvck1hcFRyYW5zYWN0aW9ucy5wdXNoKE9iamVjdC5jcmVhdGUobnVsbCkpXG59XG5cbmZ1bmN0aW9uIGNvbW1pdEFuY2hvclRyYW5zYWN0aW9uIChzdGF0ZSkge1xuICBjb25zdCB0cmFuc2FjdGlvbiA9IHN0YXRlLmFuY2hvck1hcFRyYW5zYWN0aW9ucy5wb3AoKVxuICBjb25zdCB0cmFuc2FjdGlvbnMgPSBzdGF0ZS5hbmNob3JNYXBUcmFuc2FjdGlvbnNcblxuICBpZiAodHJhbnNhY3Rpb25zLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgY29uc3QgcGFyZW50ID0gdHJhbnNhY3Rpb25zW3RyYW5zYWN0aW9ucy5sZW5ndGggLSAxXVxuICBjb25zdCBuYW1lcyA9IE9iamVjdC5rZXlzKHRyYW5zYWN0aW9uKVxuXG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gbmFtZXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGNvbnN0IG5hbWUgPSBuYW1lc1tpbmRleF1cblxuICAgIGlmICghX2hhc093blByb3BlcnR5LmNhbGwocGFyZW50LCBuYW1lKSkge1xuICAgICAgcGFyZW50W25hbWVdID0gdHJhbnNhY3Rpb25bbmFtZV1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcm9sbGJhY2tBbmNob3JUcmFuc2FjdGlvbiAoc3RhdGUpIHtcbiAgY29uc3QgdHJhbnNhY3Rpb24gPSBzdGF0ZS5hbmNob3JNYXBUcmFuc2FjdGlvbnMucG9wKClcbiAgY29uc3QgbmFtZXMgPSBPYmplY3Qua2V5cyh0cmFuc2FjdGlvbilcblxuICBmb3IgKGxldCBpbmRleCA9IG5hbWVzLmxlbmd0aCAtIDE7IGluZGV4ID49IDA7IGluZGV4IC09IDEpIHtcbiAgICBjb25zdCBlbnRyeSA9IHRyYW5zYWN0aW9uW25hbWVzW2luZGV4XV1cblxuICAgIGlmIChlbnRyeS5leGlzdGVkKSB7XG4gICAgICBzdGF0ZS5hbmNob3JNYXBbbmFtZXNbaW5kZXhdXSA9IGVudHJ5LnZhbHVlXG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSBzdGF0ZS5hbmNob3JNYXBbbmFtZXNbaW5kZXhdXVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzbmFwc2hvdFN0YXRlIChzdGF0ZSkge1xuICByZXR1cm4ge1xuICAgIHBvc2l0aW9uOiBzdGF0ZS5wb3NpdGlvbixcbiAgICBsaW5lOiBzdGF0ZS5saW5lLFxuICAgIGxpbmVTdGFydDogc3RhdGUubGluZVN0YXJ0LFxuICAgIGxpbmVJbmRlbnQ6IHN0YXRlLmxpbmVJbmRlbnQsXG4gICAgZmlyc3RUYWJJbkxpbmU6IHN0YXRlLmZpcnN0VGFiSW5MaW5lLFxuICAgIHRhZzogc3RhdGUudGFnLFxuICAgIGFuY2hvcjogc3RhdGUuYW5jaG9yLFxuICAgIGtpbmQ6IHN0YXRlLmtpbmQsXG4gICAgcmVzdWx0OiBzdGF0ZS5yZXN1bHRcbiAgfVxufVxuXG5mdW5jdGlvbiByZXN0b3JlU3RhdGUgKHN0YXRlLCBzbmFwc2hvdCkge1xuICBzdGF0ZS5wb3NpdGlvbiA9IHNuYXBzaG90LnBvc2l0aW9uXG4gIHN0YXRlLmxpbmUgPSBzbmFwc2hvdC5saW5lXG4gIHN0YXRlLmxpbmVTdGFydCA9IHNuYXBzaG90LmxpbmVTdGFydFxuICBzdGF0ZS5saW5lSW5kZW50ID0gc25hcHNob3QubGluZUluZGVudFxuICBzdGF0ZS5maXJzdFRhYkluTGluZSA9IHNuYXBzaG90LmZpcnN0VGFiSW5MaW5lXG4gIHN0YXRlLnRhZyA9IHNuYXBzaG90LnRhZ1xuICBzdGF0ZS5hbmNob3IgPSBzbmFwc2hvdC5hbmNob3JcbiAgc3RhdGUua2luZCA9IHNuYXBzaG90LmtpbmRcbiAgc3RhdGUucmVzdWx0ID0gc25hcHNob3QucmVzdWx0XG59XG5cbmNvbnN0IGRpcmVjdGl2ZUhhbmRsZXJzID0ge1xuXG4gIFlBTUw6IGZ1bmN0aW9uIGhhbmRsZVlhbWxEaXJlY3RpdmUgKHN0YXRlLCBuYW1lLCBhcmdzKSB7XG4gICAgaWYgKHN0YXRlLnZlcnNpb24gIT09IG51bGwpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdkdXBsaWNhdGlvbiBvZiAlWUFNTCBkaXJlY3RpdmUnKVxuICAgIH1cblxuICAgIGlmIChhcmdzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ1lBTUwgZGlyZWN0aXZlIGFjY2VwdHMgZXhhY3RseSBvbmUgYXJndW1lbnQnKVxuICAgIH1cblxuICAgIGNvbnN0IG1hdGNoID0gL14oWzAtOV0rKVxcLihbMC05XSspJC8uZXhlYyhhcmdzWzBdKVxuXG4gICAgaWYgKG1hdGNoID09PSBudWxsKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnaWxsLWZvcm1lZCBhcmd1bWVudCBvZiB0aGUgWUFNTCBkaXJlY3RpdmUnKVxuICAgIH1cblxuICAgIGNvbnN0IG1ham9yID0gcGFyc2VJbnQobWF0Y2hbMV0sIDEwKVxuICAgIGNvbnN0IG1pbm9yID0gcGFyc2VJbnQobWF0Y2hbMl0sIDEwKVxuXG4gICAgaWYgKG1ham9yICE9PSAxKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndW5hY2NlcHRhYmxlIFlBTUwgdmVyc2lvbiBvZiB0aGUgZG9jdW1lbnQnKVxuICAgIH1cblxuICAgIHN0YXRlLnZlcnNpb24gPSBhcmdzWzBdXG4gICAgc3RhdGUuY2hlY2tMaW5lQnJlYWtzID0gKG1pbm9yIDwgMilcblxuICAgIGlmIChtaW5vciAhPT0gMSAmJiBtaW5vciAhPT0gMikge1xuICAgICAgdGhyb3dXYXJuaW5nKHN0YXRlLCAndW5zdXBwb3J0ZWQgWUFNTCB2ZXJzaW9uIG9mIHRoZSBkb2N1bWVudCcpXG4gICAgfVxuICB9LFxuXG4gIFRBRzogZnVuY3Rpb24gaGFuZGxlVGFnRGlyZWN0aXZlIChzdGF0ZSwgbmFtZSwgYXJncykge1xuICAgIGxldCBwcmVmaXhcblxuICAgIGlmIChhcmdzLmxlbmd0aCAhPT0gMikge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ1RBRyBkaXJlY3RpdmUgYWNjZXB0cyBleGFjdGx5IHR3byBhcmd1bWVudHMnKVxuICAgIH1cblxuICAgIGNvbnN0IGhhbmRsZSA9IGFyZ3NbMF1cbiAgICBwcmVmaXggPSBhcmdzWzFdXG5cbiAgICBpZiAoIVBBVFRFUk5fVEFHX0hBTkRMRS50ZXN0KGhhbmRsZSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdpbGwtZm9ybWVkIHRhZyBoYW5kbGUgKGZpcnN0IGFyZ3VtZW50KSBvZiB0aGUgVEFHIGRpcmVjdGl2ZScpXG4gICAgfVxuXG4gICAgaWYgKF9oYXNPd25Qcm9wZXJ0eS5jYWxsKHN0YXRlLnRhZ01hcCwgaGFuZGxlKSkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RoZXJlIGlzIGEgcHJldmlvdXNseSBkZWNsYXJlZCBzdWZmaXggZm9yIFwiJyArIGhhbmRsZSArICdcIiB0YWcgaGFuZGxlJylcbiAgICB9XG5cbiAgICBpZiAoIVBBVFRFUk5fVEFHX1VSSS50ZXN0KHByZWZpeCkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdpbGwtZm9ybWVkIHRhZyBwcmVmaXggKHNlY29uZCBhcmd1bWVudCkgb2YgdGhlIFRBRyBkaXJlY3RpdmUnKVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBwcmVmaXggPSBkZWNvZGVVUklDb21wb25lbnQocHJlZml4KVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RhZyBwcmVmaXggaXMgbWFsZm9ybWVkOiAnICsgcHJlZml4KVxuICAgIH1cblxuICAgIHN0YXRlLnRhZ01hcFtoYW5kbGVdID0gcHJlZml4XG4gIH1cbn1cblxuZnVuY3Rpb24gY2FwdHVyZVNlZ21lbnQgKHN0YXRlLCBzdGFydCwgZW5kLCBjaGVja0pzb24pIHtcbiAgaWYgKHN0YXJ0IDwgZW5kKSB7XG4gICAgY29uc3QgX3Jlc3VsdCA9IHN0YXRlLmlucHV0LnNsaWNlKHN0YXJ0LCBlbmQpXG5cbiAgICBpZiAoY2hlY2tKc29uKSB7XG4gICAgICBmb3IgKGxldCBfcG9zaXRpb24gPSAwLCBfbGVuZ3RoID0gX3Jlc3VsdC5sZW5ndGg7IF9wb3NpdGlvbiA8IF9sZW5ndGg7IF9wb3NpdGlvbiArPSAxKSB7XG4gICAgICAgIGNvbnN0IF9jaGFyYWN0ZXIgPSBfcmVzdWx0LmNoYXJDb2RlQXQoX3Bvc2l0aW9uKVxuICAgICAgICBpZiAoIShfY2hhcmFjdGVyID09PSAweDA5IHx8XG4gICAgICAgICAgICAgIChfY2hhcmFjdGVyID49IDB4MjAgJiYgX2NoYXJhY3RlciA8PSAweDEwRkZGRikpKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2V4cGVjdGVkIHZhbGlkIEpTT04gY2hhcmFjdGVyJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoUEFUVEVSTl9OT05fUFJJTlRBQkxFLnRlc3QoX3Jlc3VsdCkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd0aGUgc3RyZWFtIGNvbnRhaW5zIG5vbi1wcmludGFibGUgY2hhcmFjdGVycycpXG4gICAgfVxuXG4gICAgc3RhdGUucmVzdWx0ICs9IF9yZXN1bHRcbiAgfVxufVxuXG5mdW5jdGlvbiBtZXJnZU1hcHBpbmdzIChzdGF0ZSwgZGVzdGluYXRpb24sIHNvdXJjZSwgb3ZlcnJpZGFibGVLZXlzKSB7XG4gIGlmICghY29tbW9uLmlzT2JqZWN0KHNvdXJjZSkpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnY2Fubm90IG1lcmdlIG1hcHBpbmdzOyB0aGUgcHJvdmlkZWQgc291cmNlIG9iamVjdCBpcyB1bmFjY2VwdGFibGUnKVxuICB9XG5cbiAgY29uc3Qgc291cmNlS2V5cyA9IE9iamVjdC5rZXlzKHNvdXJjZSlcblxuICBmb3IgKGxldCBpbmRleCA9IDAsIHF1YW50aXR5ID0gc291cmNlS2V5cy5sZW5ndGg7IGluZGV4IDwgcXVhbnRpdHk7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCBrZXkgPSBzb3VyY2VLZXlzW2luZGV4XVxuXG4gICAgaWYgKCFfaGFzT3duUHJvcGVydHkuY2FsbChkZXN0aW5hdGlvbiwga2V5KSkge1xuICAgICAgc2V0UHJvcGVydHkoZGVzdGluYXRpb24sIGtleSwgc291cmNlW2tleV0pXG4gICAgICBvdmVycmlkYWJsZUtleXNba2V5XSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RvcmVNYXBwaW5nUGFpciAoc3RhdGUsIF9yZXN1bHQsIG92ZXJyaWRhYmxlS2V5cywga2V5VGFnLCBrZXlOb2RlLCB2YWx1ZU5vZGUsXG4gIHN0YXJ0TGluZSwgc3RhcnRMaW5lU3RhcnQsIHN0YXJ0UG9zKSB7XG4gIC8vIFRoZSBvdXRwdXQgaXMgYSBwbGFpbiBvYmplY3QgaGVyZSwgc28ga2V5cyBjYW4gb25seSBiZSBzdHJpbmdzLlxuICAvLyBXZSBuZWVkIHRvIGNvbnZlcnQga2V5Tm9kZSB0byBhIHN0cmluZywgYnV0IGRvaW5nIHNvIGNhbiBoYW5nIHRoZSBwcm9jZXNzXG4gIC8vIChkZWVwbHkgbmVzdGVkIGFycmF5cyB0aGF0IGV4cGxvZGUgZXhwb25lbnRpYWxseSB1c2luZyBhbGlhc2VzKS5cbiAgaWYgKEFycmF5LmlzQXJyYXkoa2V5Tm9kZSkpIHtcbiAgICBrZXlOb2RlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoa2V5Tm9kZSlcblxuICAgIGZvciAobGV0IGluZGV4ID0gMCwgcXVhbnRpdHkgPSBrZXlOb2RlLmxlbmd0aDsgaW5kZXggPCBxdWFudGl0eTsgaW5kZXggKz0gMSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoa2V5Tm9kZVtpbmRleF0pKSB7XG4gICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICduZXN0ZWQgYXJyYXlzIGFyZSBub3Qgc3VwcG9ydGVkIGluc2lkZSBrZXlzJylcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBrZXlOb2RlID09PSAnb2JqZWN0JyAmJiBfY2xhc3Moa2V5Tm9kZVtpbmRleF0pID09PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgICBrZXlOb2RlW2luZGV4XSA9ICdbb2JqZWN0IE9iamVjdF0nXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQXZvaWQgY29kZSBleGVjdXRpb24gaW4gbG9hZCgpIHZpYSB0b1N0cmluZyBwcm9wZXJ0eVxuICAvLyAoc3RpbGwgdXNlIGl0cyBvd24gdG9TdHJpbmcgZm9yIGFycmF5cywgdGltZXN0YW1wcyxcbiAgLy8gYW5kIHdoYXRldmVyIHVzZXIgc2NoZW1hIGV4dGVuc2lvbnMgaGFwcGVuIHRvIGhhdmUgQEB0b1N0cmluZ1RhZylcbiAgaWYgKHR5cGVvZiBrZXlOb2RlID09PSAnb2JqZWN0JyAmJiBfY2xhc3Moa2V5Tm9kZSkgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAga2V5Tm9kZSA9ICdbb2JqZWN0IE9iamVjdF0nXG4gIH1cblxuICBrZXlOb2RlID0gU3RyaW5nKGtleU5vZGUpXG5cbiAgaWYgKF9yZXN1bHQgPT09IG51bGwpIHtcbiAgICBfcmVzdWx0ID0ge31cbiAgfVxuXG4gIGlmIChrZXlUYWcgPT09ICd0YWc6eWFtbC5vcmcsMjAwMjptZXJnZScpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZU5vZGUpKSB7XG4gICAgICBpZiAodmFsdWVOb2RlLmxlbmd0aCA+IHN0YXRlLm1heE1lcmdlU2VxTGVuZ3RoKSB7XG4gICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdtZXJnZSBzZXF1ZW5jZSBsZW5ndGggZXhjZWVkZWQgbWF4TWVyZ2VTZXFMZW5ndGggKCcgKyBzdGF0ZS5tYXhNZXJnZVNlcUxlbmd0aCArICcpJylcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0KClcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMCwgcXVhbnRpdHkgPSB2YWx1ZU5vZGUubGVuZ3RoOyBpbmRleCA8IHF1YW50aXR5OyBpbmRleCArPSAxKSB7XG4gICAgICAgIGNvbnN0IHNyYyA9IHZhbHVlTm9kZVtpbmRleF1cbiAgICAgICAgLy8gRXhpc3Rpbmcga2V5cyBhcmUgbm90IG92ZXJyaWRkZW4gb24gbWVyZ2UsIHNvIGRlZHVwZSBzb3VyY2VzIHRvXG4gICAgICAgIC8vIGF2b2lkIHJlZHVuZGFudCB3b3JrIG9uIHJlcGVhdGVkIGFsaWFzZXMuXG4gICAgICAgIGlmIChzZWVuLmhhcyhzcmMpKSBjb250aW51ZVxuICAgICAgICBzZWVuLmFkZChzcmMpXG4gICAgICAgIG1lcmdlTWFwcGluZ3Moc3RhdGUsIF9yZXN1bHQsIHNyYywgb3ZlcnJpZGFibGVLZXlzKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtZXJnZU1hcHBpbmdzKHN0YXRlLCBfcmVzdWx0LCB2YWx1ZU5vZGUsIG92ZXJyaWRhYmxlS2V5cylcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKCFzdGF0ZS5qc29uICYmXG4gICAgICAgICFfaGFzT3duUHJvcGVydHkuY2FsbChvdmVycmlkYWJsZUtleXMsIGtleU5vZGUpICYmXG4gICAgICAgIF9oYXNPd25Qcm9wZXJ0eS5jYWxsKF9yZXN1bHQsIGtleU5vZGUpKSB7XG4gICAgICBzdGF0ZS5saW5lID0gc3RhcnRMaW5lIHx8IHN0YXRlLmxpbmVcbiAgICAgIHN0YXRlLmxpbmVTdGFydCA9IHN0YXJ0TGluZVN0YXJ0IHx8IHN0YXRlLmxpbmVTdGFydFxuICAgICAgc3RhdGUucG9zaXRpb24gPSBzdGFydFBvcyB8fCBzdGF0ZS5wb3NpdGlvblxuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2R1cGxpY2F0ZWQgbWFwcGluZyBrZXknKVxuICAgIH1cblxuICAgIHNldFByb3BlcnR5KF9yZXN1bHQsIGtleU5vZGUsIHZhbHVlTm9kZSlcbiAgICBkZWxldGUgb3ZlcnJpZGFibGVLZXlzW2tleU5vZGVdXG4gIH1cblxuICByZXR1cm4gX3Jlc3VsdFxufVxuXG5mdW5jdGlvbiByZWFkTGluZUJyZWFrIChzdGF0ZSkge1xuICBjb25zdCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgaWYgKGNoID09PSAweDBBLyogTEYgKi8pIHtcbiAgICBzdGF0ZS5wb3NpdGlvbisrXG4gIH0gZWxzZSBpZiAoY2ggPT09IDB4MEQvKiBDUiAqLykge1xuICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MEEvKiBMRiAqLykge1xuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnYSBsaW5lIGJyZWFrIGlzIGV4cGVjdGVkJylcbiAgfVxuXG4gIHN0YXRlLmxpbmUgKz0gMVxuICBzdGF0ZS5saW5lU3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICBzdGF0ZS5maXJzdFRhYkluTGluZSA9IC0xXG59XG5cbmZ1bmN0aW9uIHNraXBTZXBhcmF0aW9uU3BhY2UgKHN0YXRlLCBhbGxvd0NvbW1lbnRzLCBjaGVja0luZGVudCkge1xuICBsZXQgbGluZUJyZWFrcyA9IDBcbiAgbGV0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICB3aGlsZSAoaXNXaGl0ZVNwYWNlKGNoKSkge1xuICAgICAgaWYgKGNoID09PSAweDA5LyogVGFiICovICYmIHN0YXRlLmZpcnN0VGFiSW5MaW5lID09PSAtMSkge1xuICAgICAgICBzdGF0ZS5maXJzdFRhYkluTGluZSA9IHN0YXRlLnBvc2l0aW9uXG4gICAgICB9XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgICB9XG5cbiAgICBpZiAoYWxsb3dDb21tZW50cyAmJiBjaCA9PT0gMHgyMy8qICMgKi8pIHtcbiAgICAgIGRvIHtcbiAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgICB9IHdoaWxlIChjaCAhPT0gMHgwQS8qIExGICovICYmIGNoICE9PSAweDBELyogQ1IgKi8gJiYgY2ggIT09IDApXG4gICAgfVxuXG4gICAgaWYgKGlzRW9sKGNoKSkge1xuICAgICAgcmVhZExpbmVCcmVhayhzdGF0ZSlcblxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICAgICAgbGluZUJyZWFrcysrXG4gICAgICBzdGF0ZS5saW5lSW5kZW50ID0gMFxuXG4gICAgICB3aGlsZSAoY2ggPT09IDB4MjAvKiBTcGFjZSAqLykge1xuICAgICAgICBzdGF0ZS5saW5lSW5kZW50KytcbiAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKGNoZWNrSW5kZW50ICE9PSAtMSAmJiBsaW5lQnJlYWtzICE9PSAwICYmIHN0YXRlLmxpbmVJbmRlbnQgPCBjaGVja0luZGVudCkge1xuICAgIHRocm93V2FybmluZyhzdGF0ZSwgJ2RlZmljaWVudCBpbmRlbnRhdGlvbicpXG4gIH1cblxuICByZXR1cm4gbGluZUJyZWFrc1xufVxuXG5mdW5jdGlvbiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3IgKHN0YXRlKSB7XG4gIGxldCBfcG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvblxuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KF9wb3NpdGlvbilcblxuICAvLyBDb25kaXRpb24gc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCBpcyB0ZXN0ZWRcbiAgLy8gaW4gcGFyZW50IG9uIGVhY2ggY2FsbCwgZm9yIGVmZmljaWVuY3kuIE5vIG5lZWRzIHRvIHRlc3QgaGVyZSBhZ2Fpbi5cbiAgaWYgKChjaCA9PT0gMHgyRC8qIC0gKi8gfHwgY2ggPT09IDB4MkUvKiAuICovKSAmJlxuICAgICAgY2ggPT09IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoX3Bvc2l0aW9uICsgMSkgJiZcbiAgICAgIGNoID09PSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KF9wb3NpdGlvbiArIDIpKSB7XG4gICAgX3Bvc2l0aW9uICs9IDNcblxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChfcG9zaXRpb24pXG5cbiAgICBpZiAoY2ggPT09IDAgfHwgaXNXc09yRW9sKGNoKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gd3JpdGVGb2xkZWRMaW5lcyAoc3RhdGUsIGNvdW50KSB7XG4gIGlmIChjb3VudCA9PT0gMSkge1xuICAgIHN0YXRlLnJlc3VsdCArPSAnICdcbiAgfSBlbHNlIGlmIChjb3VudCA+IDEpIHtcbiAgICBzdGF0ZS5yZXN1bHQgKz0gY29tbW9uLnJlcGVhdCgnXFxuJywgY291bnQgLSAxKVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlYWRQbGFpblNjYWxhciAoc3RhdGUsIG5vZGVJbmRlbnQsIHdpdGhpbkZsb3dDb2xsZWN0aW9uKSB7XG4gIGxldCBjYXB0dXJlU3RhcnRcbiAgbGV0IGNhcHR1cmVFbmRcbiAgbGV0IGhhc1BlbmRpbmdDb250ZW50XG4gIGxldCBfbGluZVxuICBsZXQgX2xpbmVTdGFydFxuICBsZXQgX2xpbmVJbmRlbnRcbiAgY29uc3QgX2tpbmQgPSBzdGF0ZS5raW5kXG4gIGNvbnN0IF9yZXN1bHQgPSBzdGF0ZS5yZXN1bHRcblxuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gIGlmIChpc1dzT3JFb2woY2gpIHx8XG4gICAgICBpc0Zsb3dJbmRpY2F0b3IoY2gpIHx8XG4gICAgICBjaCA9PT0gMHgyMy8qICMgKi8gfHxcbiAgICAgIGNoID09PSAweDI2LyogJiAqLyB8fFxuICAgICAgY2ggPT09IDB4MkEvKiAqICovIHx8XG4gICAgICBjaCA9PT0gMHgyMS8qICEgKi8gfHxcbiAgICAgIGNoID09PSAweDdDLyogfCAqLyB8fFxuICAgICAgY2ggPT09IDB4M0UvKiA+ICovIHx8XG4gICAgICBjaCA9PT0gMHgyNy8qICcgKi8gfHxcbiAgICAgIGNoID09PSAweDIyLyogXCIgKi8gfHxcbiAgICAgIGNoID09PSAweDI1LyogJSAqLyB8fFxuICAgICAgY2ggPT09IDB4NDAvKiBAICovIHx8XG4gICAgICBjaCA9PT0gMHg2MC8qIGAgKi8pIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmIChjaCA9PT0gMHgzRi8qID8gKi8gfHwgY2ggPT09IDB4MkQvKiAtICovKSB7XG4gICAgY29uc3QgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpXG5cbiAgICBpZiAoaXNXc09yRW9sKGZvbGxvd2luZykgfHxcbiAgICAgICAgKHdpdGhpbkZsb3dDb2xsZWN0aW9uICYmIGlzRmxvd0luZGljYXRvcihmb2xsb3dpbmcpKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgc3RhdGUua2luZCA9ICdzY2FsYXInXG4gIHN0YXRlLnJlc3VsdCA9ICcnXG4gIGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvblxuICBoYXNQZW5kaW5nQ29udGVudCA9IGZhbHNlXG5cbiAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgaWYgKGNoID09PSAweDNBLyogOiAqLykge1xuICAgICAgY29uc3QgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpXG5cbiAgICAgIGlmIChpc1dzT3JFb2woZm9sbG93aW5nKSB8fFxuICAgICAgICAgICh3aXRoaW5GbG93Q29sbGVjdGlvbiAmJiBpc0Zsb3dJbmRpY2F0b3IoZm9sbG93aW5nKSkpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDIzLyogIyAqLykge1xuICAgICAgY29uc3QgcHJlY2VkaW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiAtIDEpXG5cbiAgICAgIGlmIChpc1dzT3JFb2wocHJlY2VkaW5nKSkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoKHN0YXRlLnBvc2l0aW9uID09PSBzdGF0ZS5saW5lU3RhcnQgJiYgdGVzdERvY3VtZW50U2VwYXJhdG9yKHN0YXRlKSkgfHxcbiAgICAgICAgICAgICAgICh3aXRoaW5GbG93Q29sbGVjdGlvbiAmJiBpc0Zsb3dJbmRpY2F0b3IoY2gpKSkge1xuICAgICAgYnJlYWtcbiAgICB9IGVsc2UgaWYgKGlzRW9sKGNoKSkge1xuICAgICAgX2xpbmUgPSBzdGF0ZS5saW5lXG4gICAgICBfbGluZVN0YXJ0ID0gc3RhdGUubGluZVN0YXJ0XG4gICAgICBfbGluZUluZGVudCA9IHN0YXRlLmxpbmVJbmRlbnRcbiAgICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIGZhbHNlLCAtMSlcblxuICAgICAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPj0gbm9kZUluZGVudCkge1xuICAgICAgICBoYXNQZW5kaW5nQ29udGVudCA9IHRydWVcbiAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGUucG9zaXRpb24gPSBjYXB0dXJlRW5kXG4gICAgICAgIHN0YXRlLmxpbmUgPSBfbGluZVxuICAgICAgICBzdGF0ZS5saW5lU3RhcnQgPSBfbGluZVN0YXJ0XG4gICAgICAgIHN0YXRlLmxpbmVJbmRlbnQgPSBfbGluZUluZGVudFxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChoYXNQZW5kaW5nQ29udGVudCkge1xuICAgICAgY2FwdHVyZVNlZ21lbnQoc3RhdGUsIGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZCwgZmFsc2UpXG4gICAgICB3cml0ZUZvbGRlZExpbmVzKHN0YXRlLCBzdGF0ZS5saW5lIC0gX2xpbmUpXG4gICAgICBjYXB0dXJlU3RhcnQgPSBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb25cbiAgICAgIGhhc1BlbmRpbmdDb250ZW50ID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoIWlzV2hpdGVTcGFjZShjaCkpIHtcbiAgICAgIGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvbiArIDFcbiAgICB9XG5cbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgfVxuXG4gIGNhcHR1cmVTZWdtZW50KHN0YXRlLCBjYXB0dXJlU3RhcnQsIGNhcHR1cmVFbmQsIGZhbHNlKVxuXG4gIGlmIChzdGF0ZS5yZXN1bHQpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgc3RhdGUua2luZCA9IF9raW5kXG4gIHN0YXRlLnJlc3VsdCA9IF9yZXN1bHRcbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIHJlYWRTaW5nbGVRdW90ZWRTY2FsYXIgKHN0YXRlLCBub2RlSW5kZW50KSB7XG4gIGxldCBjYXB0dXJlU3RhcnRcbiAgbGV0IGNhcHR1cmVFbmRcblxuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gIGlmIChjaCAhPT0gMHgyNy8qICcgKi8pIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHN0YXRlLmtpbmQgPSAnc2NhbGFyJ1xuICBzdGF0ZS5yZXN1bHQgPSAnJ1xuICBzdGF0ZS5wb3NpdGlvbisrXG4gIGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvblxuXG4gIHdoaWxlICgoY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSkgIT09IDApIHtcbiAgICBpZiAoY2ggPT09IDB4MjcvKiAnICovKSB7XG4gICAgICBjYXB0dXJlU2VnbWVudChzdGF0ZSwgY2FwdHVyZVN0YXJ0LCBzdGF0ZS5wb3NpdGlvbiwgdHJ1ZSlcbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuXG4gICAgICBpZiAoY2ggPT09IDB4MjcvKiAnICovKSB7XG4gICAgICAgIGNhcHR1cmVTdGFydCA9IHN0YXRlLnBvc2l0aW9uXG4gICAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgICAgY2FwdHVyZUVuZCA9IHN0YXRlLnBvc2l0aW9uXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNFb2woY2gpKSB7XG4gICAgICBjYXB0dXJlU2VnbWVudChzdGF0ZSwgY2FwdHVyZVN0YXJ0LCBjYXB0dXJlRW5kLCB0cnVlKVxuICAgICAgd3JpdGVGb2xkZWRMaW5lcyhzdGF0ZSwgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgZmFsc2UsIG5vZGVJbmRlbnQpKVxuICAgICAgY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IHN0YXRlLnBvc2l0aW9uXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd1bmV4cGVjdGVkIGVuZCBvZiB0aGUgZG9jdW1lbnQgd2l0aGluIGEgc2luZ2xlIHF1b3RlZCBzY2FsYXInKVxuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgICBpZiAoIWlzV2hpdGVTcGFjZShjaCkpIHtcbiAgICAgICAgY2FwdHVyZUVuZCA9IHN0YXRlLnBvc2l0aW9uXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuZXhwZWN0ZWQgZW5kIG9mIHRoZSBzdHJlYW0gd2l0aGluIGEgc2luZ2xlIHF1b3RlZCBzY2FsYXInKVxufVxuXG5mdW5jdGlvbiByZWFkRG91YmxlUXVvdGVkU2NhbGFyIChzdGF0ZSwgbm9kZUluZGVudCkge1xuICBsZXQgY2FwdHVyZVN0YXJ0XG4gIGxldCBjYXB0dXJlRW5kXG4gIGxldCB0bXBcblxuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gIGlmIChjaCAhPT0gMHgyMi8qIFwiICovKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBzdGF0ZS5raW5kID0gJ3NjYWxhcidcbiAgc3RhdGUucmVzdWx0ID0gJydcbiAgc3RhdGUucG9zaXRpb24rK1xuICBjYXB0dXJlU3RhcnQgPSBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb25cblxuICB3aGlsZSAoKGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpICE9PSAwKSB7XG4gICAgaWYgKGNoID09PSAweDIyLyogXCIgKi8pIHtcbiAgICAgIGNhcHR1cmVTZWdtZW50KHN0YXRlLCBjYXB0dXJlU3RhcnQsIHN0YXRlLnBvc2l0aW9uLCB0cnVlKVxuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDVDLyogXFwgKi8pIHtcbiAgICAgIGNhcHR1cmVTZWdtZW50KHN0YXRlLCBjYXB0dXJlU3RhcnQsIHN0YXRlLnBvc2l0aW9uLCB0cnVlKVxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG5cbiAgICAgIGlmIChpc0VvbChjaCkpIHtcbiAgICAgICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgZmFsc2UsIG5vZGVJbmRlbnQpXG5cbiAgICAgICAgLy8gVE9ETzogcmV3b3JrIHRvIGlubGluZSBmbiB3aXRoIG5vIHR5cGUgY2FzdD9cbiAgICAgIH0gZWxzZSBpZiAoY2ggPCAyNTYgJiYgc2ltcGxlRXNjYXBlQ2hlY2tbY2hdKSB7XG4gICAgICAgIHN0YXRlLnJlc3VsdCArPSBzaW1wbGVFc2NhcGVNYXBbY2hdXG4gICAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgIH0gZWxzZSBpZiAoKHRtcCA9IGVzY2FwZWRIZXhMZW4oY2gpKSA+IDApIHtcbiAgICAgICAgbGV0IGhleExlbmd0aCA9IHRtcFxuICAgICAgICBsZXQgaGV4UmVzdWx0ID0gMFxuXG4gICAgICAgIGZvciAoOyBoZXhMZW5ndGggPiAwOyBoZXhMZW5ndGgtLSkge1xuICAgICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuXG4gICAgICAgICAgaWYgKCh0bXAgPSBmcm9tSGV4Q29kZShjaCkpID49IDApIHtcbiAgICAgICAgICAgIGhleFJlc3VsdCA9IChoZXhSZXN1bHQgPDwgNCkgKyB0bXBcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2V4cGVjdGVkIGhleGFkZWNpbWFsIGNoYXJhY3RlcicpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUucmVzdWx0ICs9IGNoYXJGcm9tQ29kZXBvaW50KGhleFJlc3VsdClcblxuICAgICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndW5rbm93biBlc2NhcGUgc2VxdWVuY2UnKVxuICAgICAgfVxuXG4gICAgICBjYXB0dXJlU3RhcnQgPSBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb25cbiAgICB9IGVsc2UgaWYgKGlzRW9sKGNoKSkge1xuICAgICAgY2FwdHVyZVNlZ21lbnQoc3RhdGUsIGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZCwgdHJ1ZSlcbiAgICAgIHdyaXRlRm9sZGVkTGluZXMoc3RhdGUsIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIGZhbHNlLCBub2RlSW5kZW50KSlcbiAgICAgIGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvblxuICAgIH0gZWxzZSBpZiAoc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUpKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndW5leHBlY3RlZCBlbmQgb2YgdGhlIGRvY3VtZW50IHdpdGhpbiBhIGRvdWJsZSBxdW90ZWQgc2NhbGFyJylcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgaWYgKCFpc1doaXRlU3BhY2UoY2gpKSB7XG4gICAgICAgIGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvblxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRocm93RXJyb3Ioc3RhdGUsICd1bmV4cGVjdGVkIGVuZCBvZiB0aGUgc3RyZWFtIHdpdGhpbiBhIGRvdWJsZSBxdW90ZWQgc2NhbGFyJylcbn1cblxuZnVuY3Rpb24gcmVhZEZsb3dDb2xsZWN0aW9uIChzdGF0ZSwgbm9kZUluZGVudCkge1xuICBsZXQgcmVhZE5leHQgPSB0cnVlXG4gIGxldCBfbGluZVxuICBsZXQgX2xpbmVTdGFydFxuICBsZXQgX3Bvc1xuICBjb25zdCBfdGFnID0gc3RhdGUudGFnXG4gIGxldCBfcmVzdWx0XG4gIGNvbnN0IF9hbmNob3IgPSBzdGF0ZS5hbmNob3JcbiAgbGV0IHRlcm1pbmF0b3JcbiAgbGV0IGlzUGFpclxuICBsZXQgaXNFeHBsaWNpdFBhaXJcbiAgbGV0IGlzTWFwcGluZ1xuICBjb25zdCBvdmVycmlkYWJsZUtleXMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIGxldCBrZXlOb2RlXG4gIGxldCBrZXlUYWdcbiAgbGV0IHZhbHVlTm9kZVxuXG4gIGxldCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgaWYgKGNoID09PSAweDVCLyogWyAqLykge1xuICAgIHRlcm1pbmF0b3IgPSAweDVELyogXSAqL1xuICAgIGlzTWFwcGluZyA9IGZhbHNlXG4gICAgX3Jlc3VsdCA9IFtdXG4gIH0gZWxzZSBpZiAoY2ggPT09IDB4N0IvKiB7ICovKSB7XG4gICAgdGVybWluYXRvciA9IDB4N0QvKiB9ICovXG4gICAgaXNNYXBwaW5nID0gdHJ1ZVxuICAgIF9yZXN1bHQgPSB7fVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaWYgKHN0YXRlLmFuY2hvciAhPT0gbnVsbCkge1xuICAgIHN0b3JlQW5jaG9yKHN0YXRlLCBzdGF0ZS5hbmNob3IsIF9yZXN1bHQpXG4gIH1cblxuICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcblxuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCBub2RlSW5kZW50KVxuXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSB0ZXJtaW5hdG9yKSB7XG4gICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgICBzdGF0ZS50YWcgPSBfdGFnXG4gICAgICBzdGF0ZS5hbmNob3IgPSBfYW5jaG9yXG4gICAgICBzdGF0ZS5raW5kID0gaXNNYXBwaW5nID8gJ21hcHBpbmcnIDogJ3NlcXVlbmNlJ1xuICAgICAgc3RhdGUucmVzdWx0ID0gX3Jlc3VsdFxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2UgaWYgKCFyZWFkTmV4dCkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ21pc3NlZCBjb21tYSBiZXR3ZWVuIGZsb3cgY29sbGVjdGlvbiBlbnRyaWVzJylcbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDJDLyogLCAqLykge1xuICAgICAgLy8gXCJmbG93IGNvbGxlY3Rpb24gZW50cmllcyBjYW4gbmV2ZXIgYmUgY29tcGxldGVseSBlbXB0eVwiLCBhcyBwZXIgWUFNTCAxLjIsIHNlY3Rpb24gNy40XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCBcImV4cGVjdGVkIHRoZSBub2RlIGNvbnRlbnQsIGJ1dCBmb3VuZCAnLCdcIilcbiAgICB9XG5cbiAgICBrZXlUYWcgPSBrZXlOb2RlID0gdmFsdWVOb2RlID0gbnVsbFxuICAgIGlzUGFpciA9IGlzRXhwbGljaXRQYWlyID0gZmFsc2VcblxuICAgIGlmIChjaCA9PT0gMHgzRi8qID8gKi8pIHtcbiAgICAgIGNvbnN0IGZvbGxvd2luZyA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKVxuXG4gICAgICBpZiAoaXNXc09yRW9sKGZvbGxvd2luZykpIHtcbiAgICAgICAgaXNQYWlyID0gaXNFeHBsaWNpdFBhaXIgPSB0cnVlXG4gICAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgbm9kZUluZGVudClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfbGluZSA9IHN0YXRlLmxpbmUgLy8gU2F2ZSB0aGUgY3VycmVudCBsaW5lLlxuICAgIF9saW5lU3RhcnQgPSBzdGF0ZS5saW5lU3RhcnRcbiAgICBfcG9zID0gc3RhdGUucG9zaXRpb25cbiAgICBjb21wb3NlTm9kZShzdGF0ZSwgbm9kZUluZGVudCwgQ09OVEVYVF9GTE9XX0lOLCBmYWxzZSwgdHJ1ZSlcbiAgICBrZXlUYWcgPSBzdGF0ZS50YWdcbiAgICBrZXlOb2RlID0gc3RhdGUucmVzdWx0XG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgbm9kZUluZGVudClcblxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIGlmICgoaXNFeHBsaWNpdFBhaXIgfHwgc3RhdGUubGluZSA9PT0gX2xpbmUpICYmIGNoID09PSAweDNBLyogOiAqLykge1xuICAgICAgaXNQYWlyID0gdHJ1ZVxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCBub2RlSW5kZW50KVxuICAgICAgY29tcG9zZU5vZGUoc3RhdGUsIG5vZGVJbmRlbnQsIENPTlRFWFRfRkxPV19JTiwgZmFsc2UsIHRydWUpXG4gICAgICB2YWx1ZU5vZGUgPSBzdGF0ZS5yZXN1bHRcbiAgICB9XG5cbiAgICBpZiAoaXNNYXBwaW5nKSB7XG4gICAgICBzdG9yZU1hcHBpbmdQYWlyKHN0YXRlLCBfcmVzdWx0LCBvdmVycmlkYWJsZUtleXMsIGtleVRhZywga2V5Tm9kZSwgdmFsdWVOb2RlLCBfbGluZSwgX2xpbmVTdGFydCwgX3BvcylcbiAgICB9IGVsc2UgaWYgKGlzUGFpcikge1xuICAgICAgX3Jlc3VsdC5wdXNoKHN0b3JlTWFwcGluZ1BhaXIoc3RhdGUsIG51bGwsIG92ZXJyaWRhYmxlS2V5cywga2V5VGFnLCBrZXlOb2RlLCB2YWx1ZU5vZGUsIF9saW5lLCBfbGluZVN0YXJ0LCBfcG9zKSlcbiAgICB9IGVsc2Uge1xuICAgICAgX3Jlc3VsdC5wdXNoKGtleU5vZGUpXG4gICAgfVxuXG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgbm9kZUluZGVudClcblxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIGlmIChjaCA9PT0gMHgyQy8qICwgKi8pIHtcbiAgICAgIHJlYWROZXh0ID0gdHJ1ZVxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlYWROZXh0ID0gZmFsc2VcbiAgICB9XG4gIH1cblxuICB0aHJvd0Vycm9yKHN0YXRlLCAndW5leHBlY3RlZCBlbmQgb2YgdGhlIHN0cmVhbSB3aXRoaW4gYSBmbG93IGNvbGxlY3Rpb24nKVxufVxuXG5mdW5jdGlvbiByZWFkQmxvY2tTY2FsYXIgKHN0YXRlLCBub2RlSW5kZW50KSB7XG4gIGxldCBmb2xkaW5nXG4gIGxldCBjaG9tcGluZyA9IENIT01QSU5HX0NMSVBcbiAgbGV0IGRpZFJlYWRDb250ZW50ID0gZmFsc2VcbiAgbGV0IGRldGVjdGVkSW5kZW50ID0gZmFsc2VcbiAgbGV0IHRleHRJbmRlbnQgPSBub2RlSW5kZW50XG4gIGxldCBlbXB0eUxpbmVzID0gMFxuICBsZXQgYXRNb3JlSW5kZW50ZWQgPSBmYWxzZVxuICBsZXQgdG1wXG5cbiAgbGV0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICBpZiAoY2ggPT09IDB4N0MvKiB8ICovKSB7XG4gICAgZm9sZGluZyA9IGZhbHNlXG4gIH0gZWxzZSBpZiAoY2ggPT09IDB4M0UvKiA+ICovKSB7XG4gICAgZm9sZGluZyA9IHRydWVcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHN0YXRlLmtpbmQgPSAnc2NhbGFyJ1xuICBzdGF0ZS5yZXN1bHQgPSAnJ1xuXG4gIHdoaWxlIChjaCAhPT0gMCkge1xuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSAweDJCLyogKyAqLyB8fCBjaCA9PT0gMHgyRC8qIC0gKi8pIHtcbiAgICAgIGlmIChDSE9NUElOR19DTElQID09PSBjaG9tcGluZykge1xuICAgICAgICBjaG9tcGluZyA9IChjaCA9PT0gMHgyQi8qICsgKi8pID8gQ0hPTVBJTkdfS0VFUCA6IENIT01QSU5HX1NUUklQXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAncmVwZWF0IG9mIGEgY2hvbXBpbmcgbW9kZSBpZGVudGlmaWVyJylcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCh0bXAgPSBmcm9tRGVjaW1hbENvZGUoY2gpKSA+PSAwKSB7XG4gICAgICBpZiAodG1wID09PSAwKSB7XG4gICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdiYWQgZXhwbGljaXQgaW5kZW50YXRpb24gd2lkdGggb2YgYSBibG9jayBzY2FsYXI7IGl0IGNhbm5vdCBiZSBsZXNzIHRoYW4gb25lJylcbiAgICAgIH0gZWxzZSBpZiAoIWRldGVjdGVkSW5kZW50KSB7XG4gICAgICAgIHRleHRJbmRlbnQgPSBub2RlSW5kZW50ICsgdG1wIC0gMVxuICAgICAgICBkZXRlY3RlZEluZGVudCA9IHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdyZXBlYXQgb2YgYW4gaW5kZW50YXRpb24gd2lkdGggaWRlbnRpZmllcicpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKGlzV2hpdGVTcGFjZShjaCkpIHtcbiAgICBkbyB7IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKSB9XG4gICAgd2hpbGUgKGlzV2hpdGVTcGFjZShjaCkpXG5cbiAgICBpZiAoY2ggPT09IDB4MjMvKiAjICovKSB7XG4gICAgICBkbyB7IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKSB9XG4gICAgICB3aGlsZSAoIWlzRW9sKGNoKSAmJiAoY2ggIT09IDApKVxuICAgIH1cbiAgfVxuXG4gIHdoaWxlIChjaCAhPT0gMCkge1xuICAgIHJlYWRMaW5lQnJlYWsoc3RhdGUpXG4gICAgc3RhdGUubGluZUluZGVudCA9IDBcblxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bm1vZGlmaWVkLWxvb3AtY29uZGl0aW9uXG4gICAgd2hpbGUgKCghZGV0ZWN0ZWRJbmRlbnQgfHwgc3RhdGUubGluZUluZGVudCA8IHRleHRJbmRlbnQpICYmXG4gICAgICAgICAgIChjaCA9PT0gMHgyMC8qIFNwYWNlICovKSkge1xuICAgICAgc3RhdGUubGluZUluZGVudCsrXG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgICB9XG5cbiAgICBpZiAoIWRldGVjdGVkSW5kZW50ICYmIHN0YXRlLmxpbmVJbmRlbnQgPiB0ZXh0SW5kZW50KSB7XG4gICAgICB0ZXh0SW5kZW50ID0gc3RhdGUubGluZUluZGVudFxuICAgIH1cblxuICAgIGlmIChpc0VvbChjaCkpIHtcbiAgICAgIGVtcHR5TGluZXMrK1xuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICBpZiAoIWRldGVjdGVkSW5kZW50ICYmIHRleHRJbmRlbnQgPT09IDApIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdtaXNzaW5nIGluZGVudGF0aW9uIGZvciBibG9jayBzY2FsYXInKVxuICAgIH1cblxuICAgIC8vIEVuZCBvZiB0aGUgc2NhbGFyLlxuICAgIGlmIChzdGF0ZS5saW5lSW5kZW50IDwgdGV4dEluZGVudCkge1xuICAgICAgLy8gUGVyZm9ybSB0aGUgY2hvbXBpbmcuXG4gICAgICBpZiAoY2hvbXBpbmcgPT09IENIT01QSU5HX0tFRVApIHtcbiAgICAgICAgc3RhdGUucmVzdWx0ICs9IGNvbW1vbi5yZXBlYXQoJ1xcbicsIGRpZFJlYWRDb250ZW50ID8gMSArIGVtcHR5TGluZXMgOiBlbXB0eUxpbmVzKVxuICAgICAgfSBlbHNlIGlmIChjaG9tcGluZyA9PT0gQ0hPTVBJTkdfQ0xJUCkge1xuICAgICAgICBpZiAoZGlkUmVhZENvbnRlbnQpIHsgLy8gaS5lLiBvbmx5IGlmIHRoZSBzY2FsYXIgaXMgbm90IGVtcHR5LlxuICAgICAgICAgIHN0YXRlLnJlc3VsdCArPSAnXFxuJ1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEJyZWFrIHRoaXMgYHdoaWxlYCBjeWNsZSBhbmQgZ28gdG8gdGhlIGZ1bmNpdG9uJ3MgZXBpbG9ndWUuXG4gICAgICBicmVha1xuICAgIH1cblxuICAgIC8vIEZvbGRlZCBzdHlsZTogdXNlIGZhbmN5IHJ1bGVzIHRvIGhhbmRsZSBsaW5lIGJyZWFrcy5cbiAgICBpZiAoZm9sZGluZykge1xuICAgICAgLy8gTGluZXMgc3RhcnRpbmcgd2l0aCB3aGl0ZSBzcGFjZSBjaGFyYWN0ZXJzIChtb3JlLWluZGVudGVkIGxpbmVzKSBhcmUgbm90IGZvbGRlZC5cbiAgICAgIGlmIChpc1doaXRlU3BhY2UoY2gpKSB7XG4gICAgICAgIGF0TW9yZUluZGVudGVkID0gdHJ1ZVxuICAgICAgICAvLyBleGNlcHQgZm9yIHRoZSBmaXJzdCBjb250ZW50IGxpbmUgKGNmLiBFeGFtcGxlIDguMSlcbiAgICAgICAgc3RhdGUucmVzdWx0ICs9IGNvbW1vbi5yZXBlYXQoJ1xcbicsIGRpZFJlYWRDb250ZW50ID8gMSArIGVtcHR5TGluZXMgOiBlbXB0eUxpbmVzKVxuXG4gICAgICAvLyBFbmQgb2YgbW9yZS1pbmRlbnRlZCBibG9jay5cbiAgICAgIH0gZWxzZSBpZiAoYXRNb3JlSW5kZW50ZWQpIHtcbiAgICAgICAgYXRNb3JlSW5kZW50ZWQgPSBmYWxzZVxuICAgICAgICBzdGF0ZS5yZXN1bHQgKz0gY29tbW9uLnJlcGVhdCgnXFxuJywgZW1wdHlMaW5lcyArIDEpXG5cbiAgICAgIC8vIEp1c3Qgb25lIGxpbmUgYnJlYWsgLSBwZXJjZWl2ZSBhcyB0aGUgc2FtZSBsaW5lLlxuICAgICAgfSBlbHNlIGlmIChlbXB0eUxpbmVzID09PSAwKSB7XG4gICAgICAgIGlmIChkaWRSZWFkQ29udGVudCkgeyAvLyBpLmUuIG9ubHkgaWYgd2UgaGF2ZSBhbHJlYWR5IHJlYWQgc29tZSBzY2FsYXIgY29udGVudC5cbiAgICAgICAgICBzdGF0ZS5yZXN1bHQgKz0gJyAnXG4gICAgICAgIH1cblxuICAgICAgLy8gU2V2ZXJhbCBsaW5lIGJyZWFrcyAtIHBlcmNlaXZlIGFzIGRpZmZlcmVudCBsaW5lcy5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXRlLnJlc3VsdCArPSBjb21tb24ucmVwZWF0KCdcXG4nLCBlbXB0eUxpbmVzKVxuICAgICAgfVxuXG4gICAgLy8gTGl0ZXJhbCBzdHlsZToganVzdCBhZGQgZXhhY3QgbnVtYmVyIG9mIGxpbmUgYnJlYWtzIGJldHdlZW4gY29udGVudCBsaW5lcy5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gS2VlcCBhbGwgbGluZSBicmVha3MgZXhjZXB0IHRoZSBoZWFkZXIgbGluZSBicmVhay5cbiAgICAgIHN0YXRlLnJlc3VsdCArPSBjb21tb24ucmVwZWF0KCdcXG4nLCBkaWRSZWFkQ29udGVudCA/IDEgKyBlbXB0eUxpbmVzIDogZW1wdHlMaW5lcylcbiAgICB9XG5cbiAgICBkaWRSZWFkQ29udGVudCA9IHRydWVcbiAgICBkZXRlY3RlZEluZGVudCA9IHRydWVcbiAgICBlbXB0eUxpbmVzID0gMFxuICAgIGNvbnN0IGNhcHR1cmVTdGFydCA9IHN0YXRlLnBvc2l0aW9uXG5cbiAgICB3aGlsZSAoIWlzRW9sKGNoKSAmJiAoY2ggIT09IDApKSB7XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgICB9XG5cbiAgICBjYXB0dXJlU2VnbWVudChzdGF0ZSwgY2FwdHVyZVN0YXJ0LCBzdGF0ZS5wb3NpdGlvbiwgZmFsc2UpXG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiByZWFkQmxvY2tTZXF1ZW5jZSAoc3RhdGUsIG5vZGVJbmRlbnQpIHtcbiAgY29uc3QgX3RhZyA9IHN0YXRlLnRhZ1xuICBjb25zdCBfYW5jaG9yID0gc3RhdGUuYW5jaG9yXG4gIGNvbnN0IF9yZXN1bHQgPSBbXVxuICBsZXQgZGV0ZWN0ZWQgPSBmYWxzZVxuXG4gIC8vIHRoZXJlIGlzIGEgbGVhZGluZyB0YWIgYmVmb3JlIHRoaXMgdG9rZW4sIHNvIGl0IGNhbid0IGJlIGEgYmxvY2sgc2VxdWVuY2UvbWFwcGluZztcbiAgLy8gaXQgY2FuIHN0aWxsIGJlIGZsb3cgc2VxdWVuY2UvbWFwcGluZyBvciBhIHNjYWxhclxuICBpZiAoc3RhdGUuZmlyc3RUYWJJbkxpbmUgIT09IC0xKSByZXR1cm4gZmFsc2VcblxuICBpZiAoc3RhdGUuYW5jaG9yICE9PSBudWxsKSB7XG4gICAgc3RvcmVBbmNob3Ioc3RhdGUsIHN0YXRlLmFuY2hvciwgX3Jlc3VsdClcbiAgfVxuXG4gIGxldCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgaWYgKHN0YXRlLmZpcnN0VGFiSW5MaW5lICE9PSAtMSkge1xuICAgICAgc3RhdGUucG9zaXRpb24gPSBzdGF0ZS5maXJzdFRhYkluTGluZVxuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RhYiBjaGFyYWN0ZXJzIG11c3Qgbm90IGJlIHVzZWQgaW4gaW5kZW50YXRpb24nKVxuICAgIH1cblxuICAgIGlmIChjaCAhPT0gMHgyRC8qIC0gKi8pIHtcbiAgICAgIGJyZWFrXG4gICAgfVxuXG4gICAgY29uc3QgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpXG5cbiAgICBpZiAoIWlzV3NPckVvbChmb2xsb3dpbmcpKSB7XG4gICAgICBicmVha1xuICAgIH1cblxuICAgIGRldGVjdGVkID0gdHJ1ZVxuICAgIHN0YXRlLnBvc2l0aW9uKytcblxuICAgIGlmIChza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSkpIHtcbiAgICAgIGlmIChzdGF0ZS5saW5lSW5kZW50IDw9IG5vZGVJbmRlbnQpIHtcbiAgICAgICAgX3Jlc3VsdC5wdXNoKG51bGwpXG4gICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBfbGluZSA9IHN0YXRlLmxpbmVcbiAgICBjb21wb3NlTm9kZShzdGF0ZSwgbm9kZUluZGVudCwgQ09OVEVYVF9CTE9DS19JTiwgZmFsc2UsIHRydWUpXG4gICAgX3Jlc3VsdC5wdXNoKHN0YXRlLnJlc3VsdClcbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSlcblxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIGlmICgoc3RhdGUubGluZSA9PT0gX2xpbmUgfHwgc3RhdGUubGluZUluZGVudCA+IG5vZGVJbmRlbnQpICYmIChjaCAhPT0gMCkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdiYWQgaW5kZW50YXRpb24gb2YgYSBzZXF1ZW5jZSBlbnRyeScpXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5saW5lSW5kZW50IDwgbm9kZUluZGVudCkge1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoZGV0ZWN0ZWQpIHtcbiAgICBzdGF0ZS50YWcgPSBfdGFnXG4gICAgc3RhdGUuYW5jaG9yID0gX2FuY2hvclxuICAgIHN0YXRlLmtpbmQgPSAnc2VxdWVuY2UnXG4gICAgc3RhdGUucmVzdWx0ID0gX3Jlc3VsdFxuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIHJlYWRCbG9ja01hcHBpbmcgKHN0YXRlLCBub2RlSW5kZW50LCBmbG93SW5kZW50KSB7XG4gIGxldCBhbGxvd0NvbXBhY3RcbiAgbGV0IF9rZXlMaW5lXG4gIGxldCBfa2V5TGluZVN0YXJ0XG4gIGxldCBfa2V5UG9zXG4gIGNvbnN0IF90YWcgPSBzdGF0ZS50YWdcbiAgY29uc3QgX2FuY2hvciA9IHN0YXRlLmFuY2hvclxuICBjb25zdCBfcmVzdWx0ID0ge31cbiAgY29uc3Qgb3ZlcnJpZGFibGVLZXlzID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICBsZXQga2V5VGFnID0gbnVsbFxuICBsZXQga2V5Tm9kZSA9IG51bGxcbiAgbGV0IHZhbHVlTm9kZSA9IG51bGxcbiAgbGV0IGF0RXhwbGljaXRLZXkgPSBmYWxzZVxuICBsZXQgZGV0ZWN0ZWQgPSBmYWxzZVxuXG4gIC8vIHRoZXJlIGlzIGEgbGVhZGluZyB0YWIgYmVmb3JlIHRoaXMgdG9rZW4sIHNvIGl0IGNhbid0IGJlIGEgYmxvY2sgc2VxdWVuY2UvbWFwcGluZztcbiAgLy8gaXQgY2FuIHN0aWxsIGJlIGZsb3cgc2VxdWVuY2UvbWFwcGluZyBvciBhIHNjYWxhclxuICBpZiAoc3RhdGUuZmlyc3RUYWJJbkxpbmUgIT09IC0xKSByZXR1cm4gZmFsc2VcblxuICBpZiAoc3RhdGUuYW5jaG9yICE9PSBudWxsKSB7XG4gICAgc3RvcmVBbmNob3Ioc3RhdGUsIHN0YXRlLmFuY2hvciwgX3Jlc3VsdClcbiAgfVxuXG4gIGxldCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgaWYgKCFhdEV4cGxpY2l0S2V5ICYmIHN0YXRlLmZpcnN0VGFiSW5MaW5lICE9PSAtMSkge1xuICAgICAgc3RhdGUucG9zaXRpb24gPSBzdGF0ZS5maXJzdFRhYkluTGluZVxuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RhYiBjaGFyYWN0ZXJzIG11c3Qgbm90IGJlIHVzZWQgaW4gaW5kZW50YXRpb24nKVxuICAgIH1cblxuICAgIGNvbnN0IGZvbGxvd2luZyA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKVxuICAgIGNvbnN0IF9saW5lID0gc3RhdGUubGluZSAvLyBTYXZlIHRoZSBjdXJyZW50IGxpbmUuXG5cbiAgICAvL1xuICAgIC8vIEV4cGxpY2l0IG5vdGF0aW9uIGNhc2UuIFRoZXJlIGFyZSB0d28gc2VwYXJhdGUgYmxvY2tzOlxuICAgIC8vIGZpcnN0IGZvciB0aGUga2V5IChkZW5vdGVkIGJ5IFwiP1wiKSBhbmQgc2Vjb25kIGZvciB0aGUgdmFsdWUgKGRlbm90ZWQgYnkgXCI6XCIpXG4gICAgLy9cbiAgICBpZiAoKGNoID09PSAweDNGLyogPyAqLyB8fCBjaCA9PT0gMHgzQS8qIDogKi8pICYmIGlzV3NPckVvbChmb2xsb3dpbmcpKSB7XG4gICAgICBpZiAoY2ggPT09IDB4M0YvKiA/ICovKSB7XG4gICAgICAgIGlmIChhdEV4cGxpY2l0S2V5KSB7XG4gICAgICAgICAgc3RvcmVNYXBwaW5nUGFpcihzdGF0ZSwgX3Jlc3VsdCwgb3ZlcnJpZGFibGVLZXlzLCBrZXlUYWcsIGtleU5vZGUsIG51bGwsIF9rZXlMaW5lLCBfa2V5TGluZVN0YXJ0LCBfa2V5UG9zKVxuICAgICAgICAgIGtleVRhZyA9IGtleU5vZGUgPSB2YWx1ZU5vZGUgPSBudWxsXG4gICAgICAgIH1cblxuICAgICAgICBkZXRlY3RlZCA9IHRydWVcbiAgICAgICAgYXRFeHBsaWNpdEtleSA9IHRydWVcbiAgICAgICAgYWxsb3dDb21wYWN0ID0gdHJ1ZVxuICAgICAgfSBlbHNlIGlmIChhdEV4cGxpY2l0S2V5KSB7XG4gICAgICAgIC8vIGkuZS4gMHgzQS8qIDogKi8gPT09IGNoYXJhY3RlciBhZnRlciB0aGUgZXhwbGljaXQga2V5LlxuICAgICAgICBhdEV4cGxpY2l0S2V5ID0gZmFsc2VcbiAgICAgICAgYWxsb3dDb21wYWN0ID0gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2luY29tcGxldGUgZXhwbGljaXQgbWFwcGluZyBwYWlyOyBhIGtleSBub2RlIGlzIG1pc3NlZDsgb3IgZm9sbG93ZWQgYnkgYSBub24tdGFidWxhdGVkIGVtcHR5IGxpbmUnKVxuICAgICAgfVxuXG4gICAgICBzdGF0ZS5wb3NpdGlvbiArPSAxXG4gICAgICBjaCA9IGZvbGxvd2luZ1xuXG4gICAgLy9cbiAgICAvLyBJbXBsaWNpdCBub3RhdGlvbiBjYXNlLiBGbG93LXN0eWxlIG5vZGUgYXMgdGhlIGtleSBmaXJzdCwgdGhlbiBcIjpcIiwgYW5kIHRoZSB2YWx1ZS5cbiAgICAvL1xuICAgIH0gZWxzZSB7XG4gICAgICBfa2V5TGluZSA9IHN0YXRlLmxpbmVcbiAgICAgIF9rZXlMaW5lU3RhcnQgPSBzdGF0ZS5saW5lU3RhcnRcbiAgICAgIF9rZXlQb3MgPSBzdGF0ZS5wb3NpdGlvblxuXG4gICAgICBpZiAoIWNvbXBvc2VOb2RlKHN0YXRlLCBmbG93SW5kZW50LCBDT05URVhUX0ZMT1dfT1VULCBmYWxzZSwgdHJ1ZSkpIHtcbiAgICAgICAgLy8gTmVpdGhlciBpbXBsaWNpdCBub3IgZXhwbGljaXQgbm90YXRpb24uXG4gICAgICAgIC8vIFJlYWRpbmcgaXMgZG9uZS4gR28gdG8gdGhlIGVwaWxvZ3VlLlxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUubGluZSA9PT0gX2xpbmUpIHtcbiAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgICAgIHdoaWxlIChpc1doaXRlU3BhY2UoY2gpKSB7XG4gICAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2ggPT09IDB4M0EvKiA6ICovKSB7XG4gICAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG5cbiAgICAgICAgICBpZiAoIWlzV3NPckVvbChjaCkpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdhIHdoaXRlc3BhY2UgY2hhcmFjdGVyIGlzIGV4cGVjdGVkIGFmdGVyIHRoZSBrZXktdmFsdWUgc2VwYXJhdG9yIHdpdGhpbiBhIGJsb2NrIG1hcHBpbmcnKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChhdEV4cGxpY2l0S2V5KSB7XG4gICAgICAgICAgICBzdG9yZU1hcHBpbmdQYWlyKHN0YXRlLCBfcmVzdWx0LCBvdmVycmlkYWJsZUtleXMsIGtleVRhZywga2V5Tm9kZSwgbnVsbCwgX2tleUxpbmUsIF9rZXlMaW5lU3RhcnQsIF9rZXlQb3MpXG4gICAgICAgICAgICBrZXlUYWcgPSBrZXlOb2RlID0gdmFsdWVOb2RlID0gbnVsbFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGRldGVjdGVkID0gdHJ1ZVxuICAgICAgICAgIGF0RXhwbGljaXRLZXkgPSBmYWxzZVxuICAgICAgICAgIGFsbG93Q29tcGFjdCA9IGZhbHNlXG4gICAgICAgICAga2V5VGFnID0gc3RhdGUudGFnXG4gICAgICAgICAga2V5Tm9kZSA9IHN0YXRlLnJlc3VsdFxuICAgICAgICB9IGVsc2UgaWYgKGRldGVjdGVkKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2NhbiBub3QgcmVhZCBhbiBpbXBsaWNpdCBtYXBwaW5nIHBhaXI7IGEgY29sb24gaXMgbWlzc2VkJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGF0ZS50YWcgPSBfdGFnXG4gICAgICAgICAgc3RhdGUuYW5jaG9yID0gX2FuY2hvclxuICAgICAgICAgIHJldHVybiB0cnVlIC8vIEtlZXAgdGhlIHJlc3VsdCBvZiBgY29tcG9zZU5vZGVgLlxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGRldGVjdGVkKSB7XG4gICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdjYW4gbm90IHJlYWQgYSBibG9jayBtYXBwaW5nIGVudHJ5OyBhIG11bHRpbGluZSBrZXkgbWF5IG5vdCBiZSBhbiBpbXBsaWNpdCBrZXknKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGUudGFnID0gX3RhZ1xuICAgICAgICBzdGF0ZS5hbmNob3IgPSBfYW5jaG9yXG4gICAgICAgIHJldHVybiB0cnVlIC8vIEtlZXAgdGhlIHJlc3VsdCBvZiBgY29tcG9zZU5vZGVgLlxuICAgICAgfVxuICAgIH1cblxuICAgIC8vXG4gICAgLy8gQ29tbW9uIHJlYWRpbmcgY29kZSBmb3IgYm90aCBleHBsaWNpdCBhbmQgaW1wbGljaXQgbm90YXRpb25zLlxuICAgIC8vXG4gICAgaWYgKHN0YXRlLmxpbmUgPT09IF9saW5lIHx8IHN0YXRlLmxpbmVJbmRlbnQgPiBub2RlSW5kZW50KSB7XG4gICAgICBpZiAoYXRFeHBsaWNpdEtleSkge1xuICAgICAgICBfa2V5TGluZSA9IHN0YXRlLmxpbmVcbiAgICAgICAgX2tleUxpbmVTdGFydCA9IHN0YXRlLmxpbmVTdGFydFxuICAgICAgICBfa2V5UG9zID0gc3RhdGUucG9zaXRpb25cbiAgICAgIH1cblxuICAgICAgaWYgKGNvbXBvc2VOb2RlKHN0YXRlLCBub2RlSW5kZW50LCBDT05URVhUX0JMT0NLX09VVCwgdHJ1ZSwgYWxsb3dDb21wYWN0KSkge1xuICAgICAgICBpZiAoYXRFeHBsaWNpdEtleSkge1xuICAgICAgICAgIGtleU5vZGUgPSBzdGF0ZS5yZXN1bHRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWx1ZU5vZGUgPSBzdGF0ZS5yZXN1bHRcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIWF0RXhwbGljaXRLZXkpIHtcbiAgICAgICAgc3RvcmVNYXBwaW5nUGFpcihzdGF0ZSwgX3Jlc3VsdCwgb3ZlcnJpZGFibGVLZXlzLCBrZXlUYWcsIGtleU5vZGUsIHZhbHVlTm9kZSwgX2tleUxpbmUsIF9rZXlMaW5lU3RhcnQsIF9rZXlQb3MpXG4gICAgICAgIGtleVRhZyA9IGtleU5vZGUgPSB2YWx1ZU5vZGUgPSBudWxsXG4gICAgICB9XG5cbiAgICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIC0xKVxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICAgIH1cblxuICAgIGlmICgoc3RhdGUubGluZSA9PT0gX2xpbmUgfHwgc3RhdGUubGluZUluZGVudCA+IG5vZGVJbmRlbnQpICYmIChjaCAhPT0gMCkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdiYWQgaW5kZW50YXRpb24gb2YgYSBtYXBwaW5nIGVudHJ5JylcbiAgICB9IGVsc2UgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPCBub2RlSW5kZW50KSB7XG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIEVwaWxvZ3VlLlxuICAvL1xuXG4gIC8vIFNwZWNpYWwgY2FzZTogbGFzdCBtYXBwaW5nJ3Mgbm9kZSBjb250YWlucyBvbmx5IHRoZSBrZXkgaW4gZXhwbGljaXQgbm90YXRpb24uXG4gIGlmIChhdEV4cGxpY2l0S2V5KSB7XG4gICAgc3RvcmVNYXBwaW5nUGFpcihzdGF0ZSwgX3Jlc3VsdCwgb3ZlcnJpZGFibGVLZXlzLCBrZXlUYWcsIGtleU5vZGUsIG51bGwsIF9rZXlMaW5lLCBfa2V5TGluZVN0YXJ0LCBfa2V5UG9zKVxuICB9XG5cbiAgLy8gRXhwb3NlIHRoZSByZXN1bHRpbmcgbWFwcGluZy5cbiAgaWYgKGRldGVjdGVkKSB7XG4gICAgc3RhdGUudGFnID0gX3RhZ1xuICAgIHN0YXRlLmFuY2hvciA9IF9hbmNob3JcbiAgICBzdGF0ZS5raW5kID0gJ21hcHBpbmcnXG4gICAgc3RhdGUucmVzdWx0ID0gX3Jlc3VsdFxuICB9XG5cbiAgcmV0dXJuIGRldGVjdGVkXG59XG5cbmZ1bmN0aW9uIHJlYWRUYWdQcm9wZXJ0eSAoc3RhdGUpIHtcbiAgbGV0IGlzVmVyYmF0aW0gPSBmYWxzZVxuICBsZXQgaXNOYW1lZCA9IGZhbHNlXG4gIGxldCB0YWdIYW5kbGVcbiAgbGV0IHRhZ05hbWVcblxuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gIGlmIChjaCAhPT0gMHgyMS8qICEgKi8pIHJldHVybiBmYWxzZVxuXG4gIGlmIChzdGF0ZS50YWcgIT09IG51bGwpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZHVwbGljYXRpb24gb2YgYSB0YWcgcHJvcGVydHknKVxuICB9XG5cbiAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG5cbiAgaWYgKGNoID09PSAweDNDLyogPCAqLykge1xuICAgIGlzVmVyYmF0aW0gPSB0cnVlXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gIH0gZWxzZSBpZiAoY2ggPT09IDB4MjEvKiAhICovKSB7XG4gICAgaXNOYW1lZCA9IHRydWVcbiAgICB0YWdIYW5kbGUgPSAnISEnXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gIH0gZWxzZSB7XG4gICAgdGFnSGFuZGxlID0gJyEnXG4gIH1cblxuICBsZXQgX3Bvc2l0aW9uID0gc3RhdGUucG9zaXRpb25cblxuICBpZiAoaXNWZXJiYXRpbSkge1xuICAgIGRvIHsgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pIH1cbiAgICB3aGlsZSAoY2ggIT09IDAgJiYgY2ggIT09IDB4M0UvKiA+ICovKVxuXG4gICAgaWYgKHN0YXRlLnBvc2l0aW9uIDwgc3RhdGUubGVuZ3RoKSB7XG4gICAgICB0YWdOYW1lID0gc3RhdGUuaW5wdXQuc2xpY2UoX3Bvc2l0aW9uLCBzdGF0ZS5wb3NpdGlvbilcbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndW5leHBlY3RlZCBlbmQgb2YgdGhlIHN0cmVhbSB3aXRoaW4gYSB2ZXJiYXRpbSB0YWcnKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoY2ggIT09IDAgJiYgIWlzV3NPckVvbChjaCkpIHtcbiAgICAgIGlmIChjaCA9PT0gMHgyMS8qICEgKi8pIHtcbiAgICAgICAgaWYgKCFpc05hbWVkKSB7XG4gICAgICAgICAgdGFnSGFuZGxlID0gc3RhdGUuaW5wdXQuc2xpY2UoX3Bvc2l0aW9uIC0gMSwgc3RhdGUucG9zaXRpb24gKyAxKVxuXG4gICAgICAgICAgaWYgKCFQQVRURVJOX1RBR19IQU5ETEUudGVzdCh0YWdIYW5kbGUpKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnbmFtZWQgdGFnIGhhbmRsZSBjYW5ub3QgY29udGFpbiBzdWNoIGNoYXJhY3RlcnMnKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlzTmFtZWQgPSB0cnVlXG4gICAgICAgICAgX3Bvc2l0aW9uID0gc3RhdGUucG9zaXRpb24gKyAxXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RhZyBzdWZmaXggY2Fubm90IGNvbnRhaW4gZXhjbGFtYXRpb24gbWFya3MnKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICAgIH1cblxuICAgIHRhZ05hbWUgPSBzdGF0ZS5pbnB1dC5zbGljZShfcG9zaXRpb24sIHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgaWYgKFBBVFRFUk5fRkxPV19JTkRJQ0FUT1JTLnRlc3QodGFnTmFtZSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd0YWcgc3VmZml4IGNhbm5vdCBjb250YWluIGZsb3cgaW5kaWNhdG9yIGNoYXJhY3RlcnMnKVxuICAgIH1cbiAgfVxuXG4gIGlmICh0YWdOYW1lICYmICFQQVRURVJOX1RBR19VUkkudGVzdCh0YWdOYW1lKSkge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICd0YWcgbmFtZSBjYW5ub3QgY29udGFpbiBzdWNoIGNoYXJhY3RlcnM6ICcgKyB0YWdOYW1lKVxuICB9XG5cbiAgdHJ5IHtcbiAgICB0YWdOYW1lID0gZGVjb2RlVVJJQ29tcG9uZW50KHRhZ05hbWUpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICd0YWcgbmFtZSBpcyBtYWxmb3JtZWQ6ICcgKyB0YWdOYW1lKVxuICB9XG5cbiAgaWYgKGlzVmVyYmF0aW0pIHtcbiAgICBzdGF0ZS50YWcgPSB0YWdOYW1lXG4gIH0gZWxzZSBpZiAoX2hhc093blByb3BlcnR5LmNhbGwoc3RhdGUudGFnTWFwLCB0YWdIYW5kbGUpKSB7XG4gICAgc3RhdGUudGFnID0gc3RhdGUudGFnTWFwW3RhZ0hhbmRsZV0gKyB0YWdOYW1lXG4gIH0gZWxzZSBpZiAodGFnSGFuZGxlID09PSAnIScpIHtcbiAgICBzdGF0ZS50YWcgPSAnIScgKyB0YWdOYW1lXG4gIH0gZWxzZSBpZiAodGFnSGFuZGxlID09PSAnISEnKSB7XG4gICAgc3RhdGUudGFnID0gJ3RhZzp5YW1sLm9yZywyMDAyOicgKyB0YWdOYW1lXG4gIH0gZWxzZSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuZGVjbGFyZWQgdGFnIGhhbmRsZSBcIicgKyB0YWdIYW5kbGUgKyAnXCInKVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gcmVhZEFuY2hvclByb3BlcnR5IChzdGF0ZSkge1xuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gIGlmIChjaCAhPT0gMHgyNi8qICYgKi8pIHJldHVybiBmYWxzZVxuXG4gIGlmIChzdGF0ZS5hbmNob3IgIT09IG51bGwpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZHVwbGljYXRpb24gb2YgYW4gYW5jaG9yIHByb3BlcnR5JylcbiAgfVxuXG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICBjb25zdCBfcG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvblxuXG4gIHdoaWxlIChjaCAhPT0gMCAmJiAhaXNXc09yRW9sKGNoKSAmJiAhaXNGbG93SW5kaWNhdG9yKGNoKSkge1xuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICB9XG5cbiAgaWYgKHN0YXRlLnBvc2l0aW9uID09PSBfcG9zaXRpb24pIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnbmFtZSBvZiBhbiBhbmNob3Igbm9kZSBtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIGNoYXJhY3RlcicpXG4gIH1cblxuICBzdGF0ZS5hbmNob3IgPSBzdGF0ZS5pbnB1dC5zbGljZShfcG9zaXRpb24sIHN0YXRlLnBvc2l0aW9uKVxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiByZWFkQWxpYXMgKHN0YXRlKSB7XG4gIGxldCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgaWYgKGNoICE9PSAweDJBLyogKiAqLykgcmV0dXJuIGZhbHNlXG5cbiAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gIGNvbnN0IF9wb3NpdGlvbiA9IHN0YXRlLnBvc2l0aW9uXG5cbiAgd2hpbGUgKGNoICE9PSAwICYmICFpc1dzT3JFb2woY2gpICYmICFpc0Zsb3dJbmRpY2F0b3IoY2gpKSB7XG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gIH1cblxuICBpZiAoc3RhdGUucG9zaXRpb24gPT09IF9wb3NpdGlvbikge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICduYW1lIG9mIGFuIGFsaWFzIG5vZGUgbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBjaGFyYWN0ZXInKVxuICB9XG5cbiAgY29uc3QgYWxpYXMgPSBzdGF0ZS5pbnB1dC5zbGljZShfcG9zaXRpb24sIHN0YXRlLnBvc2l0aW9uKVxuXG4gIGlmICghX2hhc093blByb3BlcnR5LmNhbGwoc3RhdGUuYW5jaG9yTWFwLCBhbGlhcykpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAndW5pZGVudGlmaWVkIGFsaWFzIFwiJyArIGFsaWFzICsgJ1wiJylcbiAgfVxuXG4gIHN0YXRlLnJlc3VsdCA9IHN0YXRlLmFuY2hvck1hcFthbGlhc11cbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHRyeVJlYWRCbG9ja01hcHBpbmdGcm9tUHJvcGVydHkgKHN0YXRlLCBwcm9wZXJ0eVN0YXJ0LCBub2RlSW5kZW50LCBmbG93SW5kZW50KSB7XG4gIGNvbnN0IGZhbGxiYWNrU3RhdGUgPSBzbmFwc2hvdFN0YXRlKHN0YXRlKVxuXG4gIGJlZ2luQW5jaG9yVHJhbnNhY3Rpb24oc3RhdGUpXG4gIHJlc3RvcmVTdGF0ZShzdGF0ZSwgcHJvcGVydHlTdGFydClcblxuICAvLyBSZS1yZWFkIHRoZSBsZWFkaW5nIHByb3BlcnRpZXMgYXMgcGFydCBvZiB0aGUgZmlyc3QgaW1wbGljaXQga2V5LCBub3QgYXNcbiAgLy8gcHJvcGVydGllcyBvZiB0aGUgY3VycmVudCBub2RlLlxuICBzdGF0ZS50YWcgPSBudWxsXG4gIHN0YXRlLmFuY2hvciA9IG51bGxcbiAgc3RhdGUua2luZCA9IG51bGxcbiAgc3RhdGUucmVzdWx0ID0gbnVsbFxuXG4gIGlmIChyZWFkQmxvY2tNYXBwaW5nKHN0YXRlLCBub2RlSW5kZW50LCBmbG93SW5kZW50KSAmJiBzdGF0ZS5raW5kID09PSAnbWFwcGluZycpIHtcbiAgICBjb21taXRBbmNob3JUcmFuc2FjdGlvbihzdGF0ZSlcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgcm9sbGJhY2tBbmNob3JUcmFuc2FjdGlvbihzdGF0ZSlcbiAgcmVzdG9yZVN0YXRlKHN0YXRlLCBmYWxsYmFja1N0YXRlKVxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gY29tcG9zZU5vZGUgKHN0YXRlLCBwYXJlbnRJbmRlbnQsIG5vZGVDb250ZXh0LCBhbGxvd1RvU2VlaywgYWxsb3dDb21wYWN0KSB7XG4gIGxldCBhbGxvd0Jsb2NrU2NhbGFyc1xuICBsZXQgYWxsb3dCbG9ja0NvbGxlY3Rpb25zXG4gIGxldCBpbmRlbnRTdGF0dXMgPSAxIC8vIDE6IHRoaXM+cGFyZW50LCAwOiB0aGlzPXBhcmVudCwgLTE6IHRoaXM8cGFyZW50XG4gIGxldCBhdE5ld0xpbmUgPSBmYWxzZVxuICBsZXQgaGFzQ29udGVudCA9IGZhbHNlXG4gIGxldCBwcm9wZXJ0eVN0YXJ0ID0gbnVsbFxuICBsZXQgdHlwZVxuICBsZXQgZmxvd0luZGVudFxuICBsZXQgYmxvY2tJbmRlbnRcblxuICBpZiAoc3RhdGUuZGVwdGggPj0gc3RhdGUubWF4RGVwdGgpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnbmVzdGluZyBleGNlZWRlZCBtYXhEZXB0aCAoJyArIHN0YXRlLm1heERlcHRoICsgJyknKVxuICB9XG5cbiAgc3RhdGUuZGVwdGggKz0gMVxuXG4gIGlmIChzdGF0ZS5saXN0ZW5lciAhPT0gbnVsbCkge1xuICAgIHN0YXRlLmxpc3RlbmVyKCdvcGVuJywgc3RhdGUpXG4gIH1cblxuICBzdGF0ZS50YWcgPSBudWxsXG4gIHN0YXRlLmFuY2hvciA9IG51bGxcbiAgc3RhdGUua2luZCA9IG51bGxcbiAgc3RhdGUucmVzdWx0ID0gbnVsbFxuXG4gIGNvbnN0IGFsbG93QmxvY2tTdHlsZXMgPSBhbGxvd0Jsb2NrU2NhbGFycyA9IGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9XG4gICAgQ09OVEVYVF9CTE9DS19PVVQgPT09IG5vZGVDb250ZXh0IHx8XG4gICAgQ09OVEVYVF9CTE9DS19JTiA9PT0gbm9kZUNvbnRleHRcblxuICBpZiAoYWxsb3dUb1NlZWspIHtcbiAgICBpZiAoc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpKSB7XG4gICAgICBhdE5ld0xpbmUgPSB0cnVlXG5cbiAgICAgIGlmIChzdGF0ZS5saW5lSW5kZW50ID4gcGFyZW50SW5kZW50KSB7XG4gICAgICAgIGluZGVudFN0YXR1cyA9IDFcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUubGluZUluZGVudCA9PT0gcGFyZW50SW5kZW50KSB7XG4gICAgICAgIGluZGVudFN0YXR1cyA9IDBcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUubGluZUluZGVudCA8IHBhcmVudEluZGVudCkge1xuICAgICAgICBpbmRlbnRTdGF0dXMgPSAtMVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChpbmRlbnRTdGF0dXMgPT09IDEpIHtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICAgICAgY29uc3QgcHJvcGVydHlTdGF0ZSA9IHNuYXBzaG90U3RhdGUoc3RhdGUpXG5cbiAgICAgIC8vIEEgZHVwbGljYXRlIHByb3BlcnR5IHRva2VuIGFmdGVyIGEgbGluZSBicmVhayBjYW4gYmUgdGhlIGZpcnN0IGtleSBvZlxuICAgICAgLy8gYSBuZXN0ZWQgYmxvY2sgbWFwcGluZywgZS5nLiBgISFtYXBcXG4gICEhc3RyIGtleTogdmFsdWVgLlxuICAgICAgaWYgKGF0TmV3TGluZSAmJlxuICAgICAgICAgICgoY2ggPT09IDB4MjEvKiAhICovICYmIHN0YXRlLnRhZyAhPT0gbnVsbCkgfHxcbiAgICAgICAgICAgKGNoID09PSAweDI2LyogJiAqLyAmJiBzdGF0ZS5hbmNob3IgIT09IG51bGwpKSkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBpZiAoIXJlYWRUYWdQcm9wZXJ0eShzdGF0ZSkgJiYgIXJlYWRBbmNob3JQcm9wZXJ0eShzdGF0ZSkpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgaWYgKHByb3BlcnR5U3RhcnQgPT09IG51bGwpIHtcbiAgICAgICAgcHJvcGVydHlTdGFydCA9IHByb3BlcnR5U3RhdGVcbiAgICAgIH1cblxuICAgICAgaWYgKHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIC0xKSkge1xuICAgICAgICBhdE5ld0xpbmUgPSB0cnVlXG4gICAgICAgIGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9IGFsbG93QmxvY2tTdHlsZXNcblxuICAgICAgICBpZiAoc3RhdGUubGluZUluZGVudCA+IHBhcmVudEluZGVudCkge1xuICAgICAgICAgIGluZGVudFN0YXR1cyA9IDFcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZS5saW5lSW5kZW50ID09PSBwYXJlbnRJbmRlbnQpIHtcbiAgICAgICAgICBpbmRlbnRTdGF0dXMgPSAwXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUubGluZUluZGVudCA8IHBhcmVudEluZGVudCkge1xuICAgICAgICAgIGluZGVudFN0YXR1cyA9IC0xXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGFsbG93QmxvY2tDb2xsZWN0aW9ucykge1xuICAgIGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9IGF0TmV3TGluZSB8fCBhbGxvd0NvbXBhY3RcbiAgfVxuXG4gIGlmIChpbmRlbnRTdGF0dXMgPT09IDEgfHwgQ09OVEVYVF9CTE9DS19PVVQgPT09IG5vZGVDb250ZXh0KSB7XG4gICAgaWYgKENPTlRFWFRfRkxPV19JTiA9PT0gbm9kZUNvbnRleHQgfHwgQ09OVEVYVF9GTE9XX09VVCA9PT0gbm9kZUNvbnRleHQpIHtcbiAgICAgIGZsb3dJbmRlbnQgPSBwYXJlbnRJbmRlbnRcbiAgICB9IGVsc2Uge1xuICAgICAgZmxvd0luZGVudCA9IHBhcmVudEluZGVudCArIDFcbiAgICB9XG5cbiAgICBibG9ja0luZGVudCA9IHN0YXRlLnBvc2l0aW9uIC0gc3RhdGUubGluZVN0YXJ0XG5cbiAgICBpZiAoaW5kZW50U3RhdHVzID09PSAxKSB7XG4gICAgICBpZiAoKGFsbG93QmxvY2tDb2xsZWN0aW9ucyAmJlxuICAgICAgICAgIChyZWFkQmxvY2tTZXF1ZW5jZShzdGF0ZSwgYmxvY2tJbmRlbnQpIHx8IHJlYWRCbG9ja01hcHBpbmcoc3RhdGUsIGJsb2NrSW5kZW50LCBmbG93SW5kZW50KSkpIHx8XG4gICAgICAgICAgcmVhZEZsb3dDb2xsZWN0aW9uKHN0YXRlLCBmbG93SW5kZW50KSkge1xuICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgICAgIGlmIChwcm9wZXJ0eVN0YXJ0ICE9PSBudWxsICYmIGFsbG93QmxvY2tTdHlsZXMgJiYgIWFsbG93QmxvY2tDb2xsZWN0aW9ucyAmJlxuICAgICAgICAgICAgY2ggIT09IDB4N0MvKiB8ICovICYmIGNoICE9PSAweDNFLyogPiAqLyAmJlxuICAgICAgICAgICAgdHJ5UmVhZEJsb2NrTWFwcGluZ0Zyb21Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgICAgIHByb3BlcnR5U3RhcnQsXG4gICAgICAgICAgICAgIHByb3BlcnR5U3RhcnQucG9zaXRpb24gLSBwcm9wZXJ0eVN0YXJ0LmxpbmVTdGFydCxcbiAgICAgICAgICAgICAgZmxvd0luZGVudFxuICAgICAgICAgICAgKSkge1xuICAgICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlXG4gICAgICAgIH0gZWxzZSBpZiAoKGFsbG93QmxvY2tTY2FsYXJzICYmIHJlYWRCbG9ja1NjYWxhcihzdGF0ZSwgZmxvd0luZGVudCkpIHx8XG4gICAgICAgICAgICByZWFkU2luZ2xlUXVvdGVkU2NhbGFyKHN0YXRlLCBmbG93SW5kZW50KSB8fFxuICAgICAgICAgICAgcmVhZERvdWJsZVF1b3RlZFNjYWxhcihzdGF0ZSwgZmxvd0luZGVudCkpIHtcbiAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuICAgICAgICB9IGVsc2UgaWYgKHJlYWRBbGlhcyhzdGF0ZSkpIHtcbiAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuXG4gICAgICAgICAgaWYgKHN0YXRlLnRhZyAhPT0gbnVsbCB8fCBzdGF0ZS5hbmNob3IgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdhbGlhcyBub2RlIHNob3VsZCBub3QgaGF2ZSBhbnkgcHJvcGVydGllcycpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHJlYWRQbGFpblNjYWxhcihzdGF0ZSwgZmxvd0luZGVudCwgQ09OVEVYVF9GTE9XX0lOID09PSBub2RlQ29udGV4dCkpIHtcbiAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuXG4gICAgICAgICAgaWYgKHN0YXRlLnRhZyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgc3RhdGUudGFnID0gJz8nXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0YXRlLmFuY2hvciAhPT0gbnVsbCkge1xuICAgICAgICAgIHN0b3JlQW5jaG9yKHN0YXRlLCBzdGF0ZS5hbmNob3IsIHN0YXRlLnJlc3VsdClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaW5kZW50U3RhdHVzID09PSAwKSB7XG4gICAgICAvLyBTcGVjaWFsIGNhc2U6IGJsb2NrIHNlcXVlbmNlcyBhcmUgYWxsb3dlZCB0byBoYXZlIHNhbWUgaW5kZW50YXRpb24gbGV2ZWwgYXMgdGhlIHBhcmVudC5cbiAgICAgIC8vIGh0dHA6Ly93d3cueWFtbC5vcmcvc3BlYy8xLjIvc3BlYy5odG1sI2lkMjc5OTc4NFxuICAgICAgaGFzQ29udGVudCA9IGFsbG93QmxvY2tDb2xsZWN0aW9ucyAmJiByZWFkQmxvY2tTZXF1ZW5jZShzdGF0ZSwgYmxvY2tJbmRlbnQpXG4gICAgfVxuICB9XG5cbiAgaWYgKHN0YXRlLnRhZyA9PT0gbnVsbCkge1xuICAgIGlmIChzdGF0ZS5hbmNob3IgIT09IG51bGwpIHtcbiAgICAgIHN0b3JlQW5jaG9yKHN0YXRlLCBzdGF0ZS5hbmNob3IsIHN0YXRlLnJlc3VsdClcbiAgICB9XG4gIH0gZWxzZSBpZiAoc3RhdGUudGFnID09PSAnPycpIHtcbiAgICAvLyBJbXBsaWNpdCByZXNvbHZpbmcgaXMgbm90IGFsbG93ZWQgZm9yIG5vbi1zY2FsYXIgdHlwZXMsIGFuZCAnPydcbiAgICAvLyBub24tc3BlY2lmaWMgdGFnIGlzIG9ubHkgYXV0b21hdGljYWxseSBhc3NpZ25lZCB0byBwbGFpbiBzY2FsYXJzLlxuICAgIC8vXG4gICAgLy8gV2Ugb25seSBuZWVkIHRvIGNoZWNrIGtpbmQgY29uZm9ybWl0eSBpbiBjYXNlIHVzZXIgZXhwbGljaXRseSBhc3NpZ25zICc/J1xuICAgIC8vIHRhZywgZm9yIGV4YW1wbGUgbGlrZSB0aGlzOiBcIiE8Pz4gWzBdXCJcbiAgICAvL1xuICAgIGlmIChzdGF0ZS5yZXN1bHQgIT09IG51bGwgJiYgc3RhdGUua2luZCAhPT0gJ3NjYWxhcicpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd1bmFjY2VwdGFibGUgbm9kZSBraW5kIGZvciAhPD8+IHRhZzsgaXQgc2hvdWxkIGJlIFwic2NhbGFyXCIsIG5vdCBcIicgKyBzdGF0ZS5raW5kICsgJ1wiJylcbiAgICB9XG5cbiAgICBmb3IgKGxldCB0eXBlSW5kZXggPSAwLCB0eXBlUXVhbnRpdHkgPSBzdGF0ZS5pbXBsaWNpdFR5cGVzLmxlbmd0aDsgdHlwZUluZGV4IDwgdHlwZVF1YW50aXR5OyB0eXBlSW5kZXggKz0gMSkge1xuICAgICAgdHlwZSA9IHN0YXRlLmltcGxpY2l0VHlwZXNbdHlwZUluZGV4XVxuXG4gICAgICBpZiAodHlwZS5yZXNvbHZlKHN0YXRlLnJlc3VsdCkpIHsgLy8gYHN0YXRlLnJlc3VsdGAgdXBkYXRlZCBpbiByZXNvbHZlciBpZiBtYXRjaGVkXG4gICAgICAgIHN0YXRlLnJlc3VsdCA9IHR5cGUuY29uc3RydWN0KHN0YXRlLnJlc3VsdClcbiAgICAgICAgc3RhdGUudGFnID0gdHlwZS50YWdcbiAgICAgICAgaWYgKHN0YXRlLmFuY2hvciAhPT0gbnVsbCkge1xuICAgICAgICAgIHN0b3JlQW5jaG9yKHN0YXRlLCBzdGF0ZS5hbmNob3IsIHN0YXRlLnJlc3VsdClcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChzdGF0ZS50YWcgIT09ICchJykge1xuICAgIGlmIChfaGFzT3duUHJvcGVydHkuY2FsbChzdGF0ZS50eXBlTWFwW3N0YXRlLmtpbmQgfHwgJ2ZhbGxiYWNrJ10sIHN0YXRlLnRhZykpIHtcbiAgICAgIHR5cGUgPSBzdGF0ZS50eXBlTWFwW3N0YXRlLmtpbmQgfHwgJ2ZhbGxiYWNrJ11bc3RhdGUudGFnXVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBsb29raW5nIGZvciBtdWx0aSB0eXBlXG4gICAgICB0eXBlID0gbnVsbFxuICAgICAgY29uc3QgdHlwZUxpc3QgPSBzdGF0ZS50eXBlTWFwLm11bHRpW3N0YXRlLmtpbmQgfHwgJ2ZhbGxiYWNrJ11cblxuICAgICAgZm9yIChsZXQgdHlwZUluZGV4ID0gMCwgdHlwZVF1YW50aXR5ID0gdHlwZUxpc3QubGVuZ3RoOyB0eXBlSW5kZXggPCB0eXBlUXVhbnRpdHk7IHR5cGVJbmRleCArPSAxKSB7XG4gICAgICAgIGlmIChzdGF0ZS50YWcuc2xpY2UoMCwgdHlwZUxpc3RbdHlwZUluZGV4XS50YWcubGVuZ3RoKSA9PT0gdHlwZUxpc3RbdHlwZUluZGV4XS50YWcpIHtcbiAgICAgICAgICB0eXBlID0gdHlwZUxpc3RbdHlwZUluZGV4XVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXR5cGUpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd1bmtub3duIHRhZyAhPCcgKyBzdGF0ZS50YWcgKyAnPicpXG4gICAgfVxuXG4gICAgaWYgKHN0YXRlLnJlc3VsdCAhPT0gbnVsbCAmJiB0eXBlLmtpbmQgIT09IHN0YXRlLmtpbmQpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd1bmFjY2VwdGFibGUgbm9kZSBraW5kIGZvciAhPCcgKyBzdGF0ZS50YWcgKyAnPiB0YWc7IGl0IHNob3VsZCBiZSBcIicgKyB0eXBlLmtpbmQgKyAnXCIsIG5vdCBcIicgKyBzdGF0ZS5raW5kICsgJ1wiJylcbiAgICB9XG5cbiAgICBpZiAoIXR5cGUucmVzb2x2ZShzdGF0ZS5yZXN1bHQsIHN0YXRlLnRhZykpIHsgLy8gYHN0YXRlLnJlc3VsdGAgdXBkYXRlZCBpbiByZXNvbHZlciBpZiBtYXRjaGVkXG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnY2Fubm90IHJlc29sdmUgYSBub2RlIHdpdGggITwnICsgc3RhdGUudGFnICsgJz4gZXhwbGljaXQgdGFnJylcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGUucmVzdWx0ID0gdHlwZS5jb25zdHJ1Y3Qoc3RhdGUucmVzdWx0LCBzdGF0ZS50YWcpXG4gICAgICBpZiAoc3RhdGUuYW5jaG9yICE9PSBudWxsKSB7XG4gICAgICAgIHN0b3JlQW5jaG9yKHN0YXRlLCBzdGF0ZS5hbmNob3IsIHN0YXRlLnJlc3VsdClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoc3RhdGUubGlzdGVuZXIgIT09IG51bGwpIHtcbiAgICBzdGF0ZS5saXN0ZW5lcignY2xvc2UnLCBzdGF0ZSlcbiAgfVxuXG4gIHN0YXRlLmRlcHRoIC09IDFcbiAgcmV0dXJuIHN0YXRlLnRhZyAhPT0gbnVsbCB8fCBzdGF0ZS5hbmNob3IgIT09IG51bGwgfHwgaGFzQ29udGVudFxufVxuXG5mdW5jdGlvbiByZWFkRG9jdW1lbnQgKHN0YXRlKSB7XG4gIGNvbnN0IGRvY3VtZW50U3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICBsZXQgaGFzRGlyZWN0aXZlcyA9IGZhbHNlXG4gIGxldCBjaFxuXG4gIHN0YXRlLnZlcnNpb24gPSBudWxsXG4gIHN0YXRlLmNoZWNrTGluZUJyZWFrcyA9IHN0YXRlLmxlZ2FjeVxuICBzdGF0ZS50YWdNYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIHN0YXRlLmFuY2hvck1hcCA9IE9iamVjdC5jcmVhdGUobnVsbClcblxuICB3aGlsZSAoKGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpICE9PSAwKSB7XG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpXG5cbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgICBpZiAoc3RhdGUubGluZUluZGVudCA+IDAgfHwgY2ggIT09IDB4MjUvKiAlICovKSB7XG4gICAgICBicmVha1xuICAgIH1cblxuICAgIGhhc0RpcmVjdGl2ZXMgPSB0cnVlXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgbGV0IF9wb3NpdGlvbiA9IHN0YXRlLnBvc2l0aW9uXG5cbiAgICB3aGlsZSAoY2ggIT09IDAgJiYgIWlzV3NPckVvbChjaCkpIHtcbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICAgIH1cblxuICAgIGNvbnN0IGRpcmVjdGl2ZU5hbWUgPSBzdGF0ZS5pbnB1dC5zbGljZShfcG9zaXRpb24sIHN0YXRlLnBvc2l0aW9uKVxuICAgIGNvbnN0IGRpcmVjdGl2ZUFyZ3MgPSBbXVxuXG4gICAgaWYgKGRpcmVjdGl2ZU5hbWUubGVuZ3RoIDwgMSkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2RpcmVjdGl2ZSBuYW1lIG11c3Qgbm90IGJlIGxlc3MgdGhhbiBvbmUgY2hhcmFjdGVyIGluIGxlbmd0aCcpXG4gICAgfVxuXG4gICAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgICB3aGlsZSAoaXNXaGl0ZVNwYWNlKGNoKSkge1xuICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgICAgIH1cblxuICAgICAgaWYgKGNoID09PSAweDIzLyogIyAqLykge1xuICAgICAgICBkbyB7IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKSB9XG4gICAgICAgIHdoaWxlIChjaCAhPT0gMCAmJiAhaXNFb2woY2gpKVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNFb2woY2gpKSBicmVha1xuXG4gICAgICBfcG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvblxuXG4gICAgICB3aGlsZSAoY2ggIT09IDAgJiYgIWlzV3NPckVvbChjaCkpIHtcbiAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgICB9XG5cbiAgICAgIGRpcmVjdGl2ZUFyZ3MucHVzaChzdGF0ZS5pbnB1dC5zbGljZShfcG9zaXRpb24sIHN0YXRlLnBvc2l0aW9uKSlcbiAgICB9XG5cbiAgICBpZiAoY2ggIT09IDApIHJlYWRMaW5lQnJlYWsoc3RhdGUpXG5cbiAgICBpZiAoX2hhc093blByb3BlcnR5LmNhbGwoZGlyZWN0aXZlSGFuZGxlcnMsIGRpcmVjdGl2ZU5hbWUpKSB7XG4gICAgICBkaXJlY3RpdmVIYW5kbGVyc1tkaXJlY3RpdmVOYW1lXShzdGF0ZSwgZGlyZWN0aXZlTmFtZSwgZGlyZWN0aXZlQXJncylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3dXYXJuaW5nKHN0YXRlLCAndW5rbm93biBkb2N1bWVudCBkaXJlY3RpdmUgXCInICsgZGlyZWN0aXZlTmFtZSArICdcIicpXG4gICAgfVxuICB9XG5cbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpXG5cbiAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPT09IDAgJiZcbiAgICAgIHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAweDJELyogLSAqLyAmJlxuICAgICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpID09PSAweDJELyogLSAqLyAmJlxuICAgICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDIpID09PSAweDJELyogLSAqLykge1xuICAgIHN0YXRlLnBvc2l0aW9uICs9IDNcbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSlcbiAgfSBlbHNlIGlmIChoYXNEaXJlY3RpdmVzKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2RpcmVjdGl2ZXMgZW5kIG1hcmsgaXMgZXhwZWN0ZWQnKVxuICB9XG5cbiAgY29tcG9zZU5vZGUoc3RhdGUsIHN0YXRlLmxpbmVJbmRlbnQgLSAxLCBDT05URVhUX0JMT0NLX09VVCwgZmFsc2UsIHRydWUpXG4gIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIC0xKVxuXG4gIGlmIChzdGF0ZS5jaGVja0xpbmVCcmVha3MgJiZcbiAgICAgIFBBVFRFUk5fTk9OX0FTQ0lJX0xJTkVfQlJFQUtTLnRlc3Qoc3RhdGUuaW5wdXQuc2xpY2UoZG9jdW1lbnRTdGFydCwgc3RhdGUucG9zaXRpb24pKSkge1xuICAgIHRocm93V2FybmluZyhzdGF0ZSwgJ25vbi1BU0NJSSBsaW5lIGJyZWFrcyBhcmUgaW50ZXJwcmV0ZWQgYXMgY29udGVudCcpXG4gIH1cblxuICBzdGF0ZS5kb2N1bWVudHMucHVzaChzdGF0ZS5yZXN1bHQpXG5cbiAgaWYgKHN0YXRlLnBvc2l0aW9uID09PSBzdGF0ZS5saW5lU3RhcnQgJiYgdGVzdERvY3VtZW50U2VwYXJhdG9yKHN0YXRlKSkge1xuICAgIGlmIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gMHgyRS8qIC4gKi8pIHtcbiAgICAgIHN0YXRlLnBvc2l0aW9uICs9IDNcbiAgICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIC0xKVxuICAgIH1cbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmIChzdGF0ZS5wb3NpdGlvbiA8IChzdGF0ZS5sZW5ndGggLSAxKSkge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICdlbmQgb2YgdGhlIHN0cmVhbSBvciBhIGRvY3VtZW50IHNlcGFyYXRvciBpcyBleHBlY3RlZCcpXG4gIH1cbn1cblxuZnVuY3Rpb24gbG9hZERvY3VtZW50cyAoaW5wdXQsIG9wdGlvbnMpIHtcbiAgaW5wdXQgPSBTdHJpbmcoaW5wdXQpXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgaWYgKGlucHV0Lmxlbmd0aCAhPT0gMCkge1xuICAgIC8vIEFkZCB0YWlsaW5nIGBcXG5gIGlmIG5vdCBleGlzdHNcbiAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChpbnB1dC5sZW5ndGggLSAxKSAhPT0gMHgwQS8qIExGICovICYmXG4gICAgICAgIGlucHV0LmNoYXJDb2RlQXQoaW5wdXQubGVuZ3RoIC0gMSkgIT09IDB4MEQvKiBDUiAqLykge1xuICAgICAgaW5wdXQgKz0gJ1xcbidcbiAgICB9XG5cbiAgICAvLyBTdHJpcCBCT01cbiAgICBpZiAoaW5wdXQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgICBpbnB1dCA9IGlucHV0LnNsaWNlKDEpXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3RhdGUgPSBuZXcgU3RhdGUoaW5wdXQsIG9wdGlvbnMpXG5cbiAgY29uc3QgbnVsbHBvcyA9IGlucHV0LmluZGV4T2YoJ1xcMCcpXG5cbiAgaWYgKG51bGxwb3MgIT09IC0xKSB7XG4gICAgc3RhdGUucG9zaXRpb24gPSBudWxscG9zXG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ251bGwgYnl0ZSBpcyBub3QgYWxsb3dlZCBpbiBpbnB1dCcpXG4gIH1cblxuICAvLyBVc2UgMCBhcyBzdHJpbmcgdGVybWluYXRvci4gVGhhdCBzaWduaWZpY2FudGx5IHNpbXBsaWZpZXMgYm91bmRzIGNoZWNrLlxuICBzdGF0ZS5pbnB1dCArPSAnXFwwJ1xuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gMHgyMC8qIFNwYWNlICovKSB7XG4gICAgc3RhdGUubGluZUluZGVudCArPSAxXG4gICAgc3RhdGUucG9zaXRpb24gKz0gMVxuICB9XG5cbiAgd2hpbGUgKHN0YXRlLnBvc2l0aW9uIDwgKHN0YXRlLmxlbmd0aCAtIDEpKSB7XG4gICAgcmVhZERvY3VtZW50KHN0YXRlKVxuICB9XG5cbiAgcmV0dXJuIHN0YXRlLmRvY3VtZW50c1xufVxuXG5mdW5jdGlvbiBsb2FkQWxsIChpbnB1dCwgaXRlcmF0b3IsIG9wdGlvbnMpIHtcbiAgaWYgKGl0ZXJhdG9yICE9PSBudWxsICYmIHR5cGVvZiBpdGVyYXRvciA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG9wdGlvbnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgb3B0aW9ucyA9IGl0ZXJhdG9yXG4gICAgaXRlcmF0b3IgPSBudWxsXG4gIH1cblxuICBjb25zdCBkb2N1bWVudHMgPSBsb2FkRG9jdW1lbnRzKGlucHV0LCBvcHRpb25zKVxuXG4gIGlmICh0eXBlb2YgaXRlcmF0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZG9jdW1lbnRzXG4gIH1cblxuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IGRvY3VtZW50cy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgaXRlcmF0b3IoZG9jdW1lbnRzW2luZGV4XSlcbiAgfVxufVxuXG5mdW5jdGlvbiBsb2FkIChpbnB1dCwgb3B0aW9ucykge1xuICBjb25zdCBkb2N1bWVudHMgPSBsb2FkRG9jdW1lbnRzKGlucHV0LCBvcHRpb25zKVxuXG4gIGlmIChkb2N1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9IGVsc2UgaWYgKGRvY3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gZG9jdW1lbnRzWzBdXG4gIH1cbiAgdGhyb3cgbmV3IFlBTUxFeGNlcHRpb24oJ2V4cGVjdGVkIGEgc2luZ2xlIGRvY3VtZW50IGluIHRoZSBzdHJlYW0sIGJ1dCBmb3VuZCBtb3JlJylcbn1cblxubW9kdWxlLmV4cG9ydHMubG9hZEFsbCA9IGxvYWRBbGxcbm1vZHVsZS5leHBvcnRzLmxvYWQgPSBsb2FkXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGNvbW1vbiA9IHJlcXVpcmUoJy4vY29tbW9uJylcbmNvbnN0IFlBTUxFeGNlcHRpb24gPSByZXF1aXJlKCcuL2V4Y2VwdGlvbicpXG5jb25zdCBERUZBVUxUX1NDSEVNQSA9IHJlcXVpcmUoJy4vc2NoZW1hL2RlZmF1bHQnKVxuXG5jb25zdCBfdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG5jb25zdCBfaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG5cbmNvbnN0IENIQVJfQk9NID0gMHhGRUZGXG5jb25zdCBDSEFSX1RBQiA9IDB4MDkgLyogVGFiICovXG5jb25zdCBDSEFSX0xJTkVfRkVFRCA9IDB4MEEgLyogTEYgKi9cbmNvbnN0IENIQVJfQ0FSUklBR0VfUkVUVVJOID0gMHgwRCAvKiBDUiAqL1xuY29uc3QgQ0hBUl9TUEFDRSA9IDB4MjAgLyogU3BhY2UgKi9cbmNvbnN0IENIQVJfRVhDTEFNQVRJT04gPSAweDIxIC8qICEgKi9cbmNvbnN0IENIQVJfRE9VQkxFX1FVT1RFID0gMHgyMiAvKiBcIiAqL1xuY29uc3QgQ0hBUl9TSEFSUCA9IDB4MjMgLyogIyAqL1xuY29uc3QgQ0hBUl9QRVJDRU5UID0gMHgyNSAvKiAlICovXG5jb25zdCBDSEFSX0FNUEVSU0FORCA9IDB4MjYgLyogJiAqL1xuY29uc3QgQ0hBUl9TSU5HTEVfUVVPVEUgPSAweDI3IC8qICcgKi9cbmNvbnN0IENIQVJfQVNURVJJU0sgPSAweDJBIC8qICogKi9cbmNvbnN0IENIQVJfQ09NTUEgPSAweDJDIC8qICwgKi9cbmNvbnN0IENIQVJfTUlOVVMgPSAweDJEIC8qIC0gKi9cbmNvbnN0IENIQVJfQ09MT04gPSAweDNBIC8qIDogKi9cbmNvbnN0IENIQVJfRVFVQUxTID0gMHgzRCAvKiA9ICovXG5jb25zdCBDSEFSX0dSRUFURVJfVEhBTiA9IDB4M0UgLyogPiAqL1xuY29uc3QgQ0hBUl9RVUVTVElPTiA9IDB4M0YgLyogPyAqL1xuY29uc3QgQ0hBUl9DT01NRVJDSUFMX0FUID0gMHg0MCAvKiBAICovXG5jb25zdCBDSEFSX0xFRlRfU1FVQVJFX0JSQUNLRVQgPSAweDVCIC8qIFsgKi9cbmNvbnN0IENIQVJfUklHSFRfU1FVQVJFX0JSQUNLRVQgPSAweDVEIC8qIF0gKi9cbmNvbnN0IENIQVJfR1JBVkVfQUNDRU5UID0gMHg2MCAvKiBgICovXG5jb25zdCBDSEFSX0xFRlRfQ1VSTFlfQlJBQ0tFVCA9IDB4N0IgLyogeyAqL1xuY29uc3QgQ0hBUl9WRVJUSUNBTF9MSU5FID0gMHg3QyAvKiB8ICovXG5jb25zdCBDSEFSX1JJR0hUX0NVUkxZX0JSQUNLRVQgPSAweDdEIC8qIH0gKi9cblxuY29uc3QgRVNDQVBFX1NFUVVFTkNFUyA9IHt9XG5cbkVTQ0FQRV9TRVFVRU5DRVNbMHgwMF0gPSAnXFxcXDAnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MDddID0gJ1xcXFxhJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDA4XSA9ICdcXFxcYidcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwOV0gPSAnXFxcXHQnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MEFdID0gJ1xcXFxuJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDBCXSA9ICdcXFxcdidcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwQ10gPSAnXFxcXGYnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MERdID0gJ1xcXFxyJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDFCXSA9ICdcXFxcZSdcbkVTQ0FQRV9TRVFVRU5DRVNbMHgyMl0gPSAnXFxcXFwiJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDVDXSA9ICdcXFxcXFxcXCdcbkVTQ0FQRV9TRVFVRU5DRVNbMHg4NV0gPSAnXFxcXE4nXG5FU0NBUEVfU0VRVUVOQ0VTWzB4QTBdID0gJ1xcXFxfJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDIwMjhdID0gJ1xcXFxMJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDIwMjldID0gJ1xcXFxQJ1xuXG5jb25zdCBERVBSRUNBVEVEX0JPT0xFQU5TX1NZTlRBWCA9IFtcbiAgJ3knLCAnWScsICd5ZXMnLCAnWWVzJywgJ1lFUycsICdvbicsICdPbicsICdPTicsXG4gICduJywgJ04nLCAnbm8nLCAnTm8nLCAnTk8nLCAnb2ZmJywgJ09mZicsICdPRkYnXG5dXG5cbmNvbnN0IERFUFJFQ0FURURfQkFTRTYwX1NZTlRBWCA9IC9eWy0rXT9bMC05X10rKD86OlswLTlfXSspKyg/OlxcLlswLTlfXSopPyQvXG5cbmZ1bmN0aW9uIGNvbXBpbGVTdHlsZU1hcCAoc2NoZW1hLCBtYXApIHtcbiAgaWYgKG1hcCA9PT0gbnVsbCkgcmV0dXJuIHt9XG5cbiAgY29uc3QgcmVzdWx0ID0ge31cbiAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKG1hcClcblxuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGxldCB0YWcgPSBrZXlzW2luZGV4XVxuICAgIGxldCBzdHlsZSA9IFN0cmluZyhtYXBbdGFnXSlcblxuICAgIGlmICh0YWcuc2xpY2UoMCwgMikgPT09ICchIScpIHtcbiAgICAgIHRhZyA9ICd0YWc6eWFtbC5vcmcsMjAwMjonICsgdGFnLnNsaWNlKDIpXG4gICAgfVxuICAgIGNvbnN0IHR5cGUgPSBzY2hlbWEuY29tcGlsZWRUeXBlTWFwWydmYWxsYmFjayddW3RhZ11cblxuICAgIGlmICh0eXBlICYmIF9oYXNPd25Qcm9wZXJ0eS5jYWxsKHR5cGUuc3R5bGVBbGlhc2VzLCBzdHlsZSkpIHtcbiAgICAgIHN0eWxlID0gdHlwZS5zdHlsZUFsaWFzZXNbc3R5bGVdXG4gICAgfVxuXG4gICAgcmVzdWx0W3RhZ10gPSBzdHlsZVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiBlbmNvZGVIZXggKGNoYXJhY3Rlcikge1xuICBsZXQgaGFuZGxlXG4gIGxldCBsZW5ndGhcblxuICBjb25zdCBzdHJpbmcgPSBjaGFyYWN0ZXIudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKClcblxuICBpZiAoY2hhcmFjdGVyIDw9IDB4RkYpIHtcbiAgICBoYW5kbGUgPSAneCdcbiAgICBsZW5ndGggPSAyXG4gIH0gZWxzZSBpZiAoY2hhcmFjdGVyIDw9IDB4RkZGRikge1xuICAgIGhhbmRsZSA9ICd1J1xuICAgIGxlbmd0aCA9IDRcbiAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPD0gMHhGRkZGRkZGRikge1xuICAgIGhhbmRsZSA9ICdVJ1xuICAgIGxlbmd0aCA9IDhcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignY29kZSBwb2ludCB3aXRoaW4gYSBzdHJpbmcgbWF5IG5vdCBiZSBncmVhdGVyIHRoYW4gMHhGRkZGRkZGRicpXG4gIH1cblxuICByZXR1cm4gJ1xcXFwnICsgaGFuZGxlICsgY29tbW9uLnJlcGVhdCgnMCcsIGxlbmd0aCAtIHN0cmluZy5sZW5ndGgpICsgc3RyaW5nXG59XG5cbmNvbnN0IFFVT1RJTkdfVFlQRV9TSU5HTEUgPSAxXG5jb25zdCBRVU9USU5HX1RZUEVfRE9VQkxFID0gMlxuXG5mdW5jdGlvbiBTdGF0ZSAob3B0aW9ucykge1xuICB0aGlzLnNjaGVtYSA9IG9wdGlvbnNbJ3NjaGVtYSddIHx8IERFRkFVTFRfU0NIRU1BXG4gIHRoaXMuaW5kZW50ID0gTWF0aC5tYXgoMSwgKG9wdGlvbnNbJ2luZGVudCddIHx8IDIpKVxuICB0aGlzLm5vQXJyYXlJbmRlbnQgPSBvcHRpb25zWydub0FycmF5SW5kZW50J10gfHwgZmFsc2VcbiAgdGhpcy5za2lwSW52YWxpZCA9IG9wdGlvbnNbJ3NraXBJbnZhbGlkJ10gfHwgZmFsc2VcbiAgdGhpcy5mbG93TGV2ZWwgPSAoY29tbW9uLmlzTm90aGluZyhvcHRpb25zWydmbG93TGV2ZWwnXSkgPyAtMSA6IG9wdGlvbnNbJ2Zsb3dMZXZlbCddKVxuICB0aGlzLnN0eWxlTWFwID0gY29tcGlsZVN0eWxlTWFwKHRoaXMuc2NoZW1hLCBvcHRpb25zWydzdHlsZXMnXSB8fCBudWxsKVxuICB0aGlzLnNvcnRLZXlzID0gb3B0aW9uc1snc29ydEtleXMnXSB8fCBmYWxzZVxuICB0aGlzLmxpbmVXaWR0aCA9IG9wdGlvbnNbJ2xpbmVXaWR0aCddIHx8IDgwXG4gIHRoaXMubm9SZWZzID0gb3B0aW9uc1snbm9SZWZzJ10gfHwgZmFsc2VcbiAgdGhpcy5ub0NvbXBhdE1vZGUgPSBvcHRpb25zWydub0NvbXBhdE1vZGUnXSB8fCBmYWxzZVxuICB0aGlzLmNvbmRlbnNlRmxvdyA9IG9wdGlvbnNbJ2NvbmRlbnNlRmxvdyddIHx8IGZhbHNlXG4gIHRoaXMucXVvdGluZ1R5cGUgPSBvcHRpb25zWydxdW90aW5nVHlwZSddID09PSAnXCInID8gUVVPVElOR19UWVBFX0RPVUJMRSA6IFFVT1RJTkdfVFlQRV9TSU5HTEVcbiAgdGhpcy5mb3JjZVF1b3RlcyA9IG9wdGlvbnNbJ2ZvcmNlUXVvdGVzJ10gfHwgZmFsc2VcbiAgdGhpcy5yZXBsYWNlciA9IHR5cGVvZiBvcHRpb25zWydyZXBsYWNlciddID09PSAnZnVuY3Rpb24nID8gb3B0aW9uc1sncmVwbGFjZXInXSA6IG51bGxcblxuICB0aGlzLmltcGxpY2l0VHlwZXMgPSB0aGlzLnNjaGVtYS5jb21waWxlZEltcGxpY2l0XG4gIHRoaXMuZXhwbGljaXRUeXBlcyA9IHRoaXMuc2NoZW1hLmNvbXBpbGVkRXhwbGljaXRcblxuICB0aGlzLnRhZyA9IG51bGxcbiAgdGhpcy5yZXN1bHQgPSAnJ1xuXG4gIHRoaXMuZHVwbGljYXRlcyA9IFtdXG4gIHRoaXMudXNlZER1cGxpY2F0ZXMgPSBudWxsXG59XG5cbi8vIEluZGVudHMgZXZlcnkgbGluZSBpbiBhIHN0cmluZy4gRW1wdHkgbGluZXMgKFxcbiBvbmx5KSBhcmUgbm90IGluZGVudGVkLlxuZnVuY3Rpb24gaW5kZW50U3RyaW5nIChzdHJpbmcsIHNwYWNlcykge1xuICBjb25zdCBpbmQgPSBjb21tb24ucmVwZWF0KCcgJywgc3BhY2VzKVxuICBsZXQgcG9zaXRpb24gPSAwXG4gIGxldCByZXN1bHQgPSAnJ1xuICBjb25zdCBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG5cbiAgd2hpbGUgKHBvc2l0aW9uIDwgbGVuZ3RoKSB7XG4gICAgbGV0IGxpbmVcbiAgICBjb25zdCBuZXh0ID0gc3RyaW5nLmluZGV4T2YoJ1xcbicsIHBvc2l0aW9uKVxuICAgIGlmIChuZXh0ID09PSAtMSkge1xuICAgICAgbGluZSA9IHN0cmluZy5zbGljZShwb3NpdGlvbilcbiAgICAgIHBvc2l0aW9uID0gbGVuZ3RoXG4gICAgfSBlbHNlIHtcbiAgICAgIGxpbmUgPSBzdHJpbmcuc2xpY2UocG9zaXRpb24sIG5leHQgKyAxKVxuICAgICAgcG9zaXRpb24gPSBuZXh0ICsgMVxuICAgIH1cblxuICAgIGlmIChsaW5lLmxlbmd0aCAmJiBsaW5lICE9PSAnXFxuJykgcmVzdWx0ICs9IGluZFxuXG4gICAgcmVzdWx0ICs9IGxpbmVcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVOZXh0TGluZSAoc3RhdGUsIGxldmVsKSB7XG4gIHJldHVybiAnXFxuJyArIGNvbW1vbi5yZXBlYXQoJyAnLCBzdGF0ZS5pbmRlbnQgKiBsZXZlbClcbn1cblxuZnVuY3Rpb24gdGVzdEltcGxpY2l0UmVzb2x2aW5nIChzdGF0ZSwgc3RyKSB7XG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gc3RhdGUuaW1wbGljaXRUeXBlcy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgY29uc3QgdHlwZSA9IHN0YXRlLmltcGxpY2l0VHlwZXNbaW5kZXhdXG5cbiAgICBpZiAodHlwZS5yZXNvbHZlKHN0cikpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8vIFszM10gcy13aGl0ZSA6Oj0gcy1zcGFjZSB8IHMtdGFiXG5mdW5jdGlvbiBpc1doaXRlc3BhY2UgKGMpIHtcbiAgcmV0dXJuIGMgPT09IENIQVJfU1BBQ0UgfHwgYyA9PT0gQ0hBUl9UQUJcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBjaGFyYWN0ZXIgY2FuIGJlIHByaW50ZWQgd2l0aG91dCBlc2NhcGluZy5cbi8vIEZyb20gWUFNTCAxLjI6IFwiYW55IGFsbG93ZWQgY2hhcmFjdGVycyBrbm93biB0byBiZSBub24tcHJpbnRhYmxlXG4vLyBzaG91bGQgYWxzbyBiZSBlc2NhcGVkLiBbSG93ZXZlcixdIFRoaXMgaXNu4oCZdCBtYW5kYXRvcnlcIlxuLy8gRGVyaXZlZCBmcm9tIG5iLWNoYXIgLSBcXHQgLSAjeDg1IC0gI3hBMCAtICN4MjAyOCAtICN4MjAyOS5cbmZ1bmN0aW9uIGlzUHJpbnRhYmxlIChjKSB7XG4gIHJldHVybiAoYyA+PSAweDAwMDIwICYmIGMgPD0gMHgwMDAwN0UpIHx8XG4gICAgKChjID49IDB4MDAwQTEgJiYgYyA8PSAweDAwRDdGRikgJiYgYyAhPT0gMHgyMDI4ICYmIGMgIT09IDB4MjAyOSkgfHxcbiAgICAoKGMgPj0gMHgwRTAwMCAmJiBjIDw9IDB4MDBGRkZEKSAmJiBjICE9PSBDSEFSX0JPTSkgfHxcbiAgICAoYyA+PSAweDEwMDAwICYmIGMgPD0gMHgxMEZGRkYpXG59XG5cbi8vIFszNF0gbnMtY2hhciA6Oj0gbmItY2hhciAtIHMtd2hpdGVcbi8vIFsyN10gbmItY2hhciA6Oj0gYy1wcmludGFibGUgLSBiLWNoYXIgLSBjLWJ5dGUtb3JkZXItbWFya1xuLy8gWzI2XSBiLWNoYXIgIDo6PSBiLWxpbmUtZmVlZCB8IGItY2FycmlhZ2UtcmV0dXJuXG4vLyBJbmNsdWRpbmcgcy13aGl0ZSAoZm9yIHNvbWUgcmVhc29uLCBleGFtcGxlcyBkb2Vzbid0IG1hdGNoIHNwZWNzIGluIHRoaXMgYXNwZWN0KVxuLy8gbnMtY2hhciA6Oj0gYy1wcmludGFibGUgLSBiLWxpbmUtZmVlZCAtIGItY2FycmlhZ2UtcmV0dXJuIC0gYy1ieXRlLW9yZGVyLW1hcmtcbmZ1bmN0aW9uIGlzTnNDaGFyT3JXaGl0ZXNwYWNlIChjKSB7XG4gIHJldHVybiBpc1ByaW50YWJsZShjKSAmJlxuICAgIGMgIT09IENIQVJfQk9NICYmXG4gICAgLy8gLSBiLWNoYXJcbiAgICBjICE9PSBDSEFSX0NBUlJJQUdFX1JFVFVSTiAmJlxuICAgIGMgIT09IENIQVJfTElORV9GRUVEXG59XG5cbi8vIFsxMjddICBucy1wbGFpbi1zYWZlKGMpIDo6PSBjID0gZmxvdy1vdXQgIOKHkiBucy1wbGFpbi1zYWZlLW91dFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBmbG93LWluICAg4oeSIG5zLXBsYWluLXNhZmUtaW5cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjID0gYmxvY2sta2V5IOKHkiBucy1wbGFpbi1zYWZlLW91dFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBmbG93LWtleSAg4oeSIG5zLXBsYWluLXNhZmUtaW5cbi8vIFsxMjhdIG5zLXBsYWluLXNhZmUtb3V0IDo6PSBucy1jaGFyXG4vLyBbMTI5XSAgbnMtcGxhaW4tc2FmZS1pbiA6Oj0gbnMtY2hhciAtIGMtZmxvdy1pbmRpY2F0b3Jcbi8vIFsxMzBdICBucy1wbGFpbi1jaGFyKGMpIDo6PSAgKCBucy1wbGFpbi1zYWZlKGMpIC0g4oCcOuKAnSAtIOKAnCPigJ0gKVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAoIC8qIEFuIG5zLWNoYXIgcHJlY2VkaW5nICovIOKAnCPigJ0gKVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAoIOKAnDrigJ0gLyogRm9sbG93ZWQgYnkgYW4gbnMtcGxhaW4tc2FmZShjKSAqLyApXG5mdW5jdGlvbiBpc1BsYWluU2FmZSAoYywgcHJldiwgaW5ibG9jaykge1xuICBjb25zdCBjSXNOc0NoYXJPcldoaXRlc3BhY2UgPSBpc05zQ2hhck9yV2hpdGVzcGFjZShjKVxuICBjb25zdCBjSXNOc0NoYXIgPSBjSXNOc0NoYXJPcldoaXRlc3BhY2UgJiYgIWlzV2hpdGVzcGFjZShjKVxuICByZXR1cm4gKFxuICAgIChcbiAgICAgIC8vIG5zLXBsYWluLXNhZmVcbiAgICAgIGluYmxvY2sgLy8gYyA9IGZsb3ctaW5cbiAgICAgICAgPyBjSXNOc0NoYXJPcldoaXRlc3BhY2VcbiAgICAgICAgOiBjSXNOc0NoYXJPcldoaXRlc3BhY2UgJiZcbiAgICAgICAgICAvLyAtIGMtZmxvdy1pbmRpY2F0b3JcbiAgICAgICAgICBjICE9PSBDSEFSX0NPTU1BICYmXG4gICAgICAgICAgYyAhPT0gQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VUICYmXG4gICAgICAgICAgYyAhPT0gQ0hBUl9SSUdIVF9TUVVBUkVfQlJBQ0tFVCAmJlxuICAgICAgICAgIGMgIT09IENIQVJfTEVGVF9DVVJMWV9CUkFDS0VUICYmXG4gICAgICAgICAgYyAhPT0gQ0hBUl9SSUdIVF9DVVJMWV9CUkFDS0VUXG4gICAgKSAmJlxuICAgIC8vIG5zLXBsYWluLWNoYXJcbiAgICBjICE9PSBDSEFSX1NIQVJQICYmIC8vIGZhbHNlIG9uICcjJ1xuICAgICEocHJldiA9PT0gQ0hBUl9DT0xPTiAmJiAhY0lzTnNDaGFyKVxuICApIHx8IC8vIGZhbHNlIG9uICc6ICdcbiAgKGlzTnNDaGFyT3JXaGl0ZXNwYWNlKHByZXYpICYmICFpc1doaXRlc3BhY2UocHJldikgJiYgYyA9PT0gQ0hBUl9TSEFSUCkgfHwgLy8gY2hhbmdlIHRvIHRydWUgb24gJ1teIF0jJ1xuICAocHJldiA9PT0gQ0hBUl9DT0xPTiAmJiBjSXNOc0NoYXIpIC8vIGNoYW5nZSB0byB0cnVlIG9uICc6W14gXSdcbn1cblxuLy8gU2ltcGxpZmllZCB0ZXN0IGZvciB2YWx1ZXMgYWxsb3dlZCBhcyB0aGUgZmlyc3QgY2hhcmFjdGVyIGluIHBsYWluIHN0eWxlLlxuZnVuY3Rpb24gaXNQbGFpblNhZmVGaXJzdCAoYykge1xuICAvLyBVc2VzIGEgc3Vic2V0IG9mIG5zLWNoYXIgLSBjLWluZGljYXRvclxuICAvLyB3aGVyZSBucy1jaGFyID0gbmItY2hhciAtIHMtd2hpdGUuXG4gIC8vIE5vIHN1cHBvcnQgb2YgKCAoIOKAnD/igJ0gfCDigJw64oCdIHwg4oCcLeKAnSApIC8qIEZvbGxvd2VkIGJ5IGFuIG5zLXBsYWluLXNhZmUoYykpICovICkgcGFydFxuICByZXR1cm4gaXNQcmludGFibGUoYykgJiZcbiAgICBjICE9PSBDSEFSX0JPTSAmJlxuICAgICFpc1doaXRlc3BhY2UoYykgJiYgLy8gLSBzLXdoaXRlXG4gICAgLy8gLSAoYy1pbmRpY2F0b3IgOjo9XG4gICAgLy8g4oCcLeKAnSB8IOKAnD/igJ0gfCDigJw64oCdIHwg4oCcLOKAnSB8IOKAnFvigJ0gfCDigJxd4oCdIHwg4oCce+KAnSB8IOKAnH3igJ1cbiAgICBjICE9PSBDSEFSX01JTlVTICYmXG4gICAgYyAhPT0gQ0hBUl9RVUVTVElPTiAmJlxuICAgIGMgIT09IENIQVJfQ09MT04gJiZcbiAgICBjICE9PSBDSEFSX0NPTU1BICYmXG4gICAgYyAhPT0gQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VUICYmXG4gICAgYyAhPT0gQ0hBUl9SSUdIVF9TUVVBUkVfQlJBQ0tFVCAmJlxuICAgIGMgIT09IENIQVJfTEVGVF9DVVJMWV9CUkFDS0VUICYmXG4gICAgYyAhPT0gQ0hBUl9SSUdIVF9DVVJMWV9CUkFDS0VUICYmXG4gICAgLy8gfCDigJwj4oCdIHwg4oCcJuKAnSB8IOKAnCrigJ0gfCDigJwh4oCdIHwg4oCcfOKAnSB8IOKAnD3igJ0gfCDigJw+4oCdIHwg4oCcJ+KAnSB8IOKAnFwi4oCdXG4gICAgYyAhPT0gQ0hBUl9TSEFSUCAmJlxuICAgIGMgIT09IENIQVJfQU1QRVJTQU5EICYmXG4gICAgYyAhPT0gQ0hBUl9BU1RFUklTSyAmJlxuICAgIGMgIT09IENIQVJfRVhDTEFNQVRJT04gJiZcbiAgICBjICE9PSBDSEFSX1ZFUlRJQ0FMX0xJTkUgJiZcbiAgICBjICE9PSBDSEFSX0VRVUFMUyAmJlxuICAgIGMgIT09IENIQVJfR1JFQVRFUl9USEFOICYmXG4gICAgYyAhPT0gQ0hBUl9TSU5HTEVfUVVPVEUgJiZcbiAgICBjICE9PSBDSEFSX0RPVUJMRV9RVU9URSAmJlxuICAgIC8vIHwg4oCcJeKAnSB8IOKAnEDigJ0gfCDigJxg4oCdKVxuICAgIGMgIT09IENIQVJfUEVSQ0VOVCAmJlxuICAgIGMgIT09IENIQVJfQ09NTUVSQ0lBTF9BVCAmJlxuICAgIGMgIT09IENIQVJfR1JBVkVfQUNDRU5UXG59XG5cbi8vIFNpbXBsaWZpZWQgdGVzdCBmb3IgdmFsdWVzIGFsbG93ZWQgYXMgdGhlIGxhc3QgY2hhcmFjdGVyIGluIHBsYWluIHN0eWxlLlxuZnVuY3Rpb24gaXNQbGFpblNhZmVMYXN0IChjKSB7XG4gIC8vIGp1c3Qgbm90IHdoaXRlc3BhY2Ugb3IgY29sb24sIGl0IHdpbGwgYmUgY2hlY2tlZCB0byBiZSBwbGFpbiBjaGFyYWN0ZXIgbGF0ZXJcbiAgcmV0dXJuICFpc1doaXRlc3BhY2UoYykgJiYgYyAhPT0gQ0hBUl9DT0xPTlxufVxuXG4vLyBTYW1lIGFzICdzdHJpbmcnLmNvZGVQb2ludEF0KHBvcyksIGJ1dCB3b3JrcyBpbiBvbGRlciBicm93c2Vycy5cbmZ1bmN0aW9uIGNvZGVQb2ludEF0IChzdHJpbmcsIHBvcykge1xuICBjb25zdCBmaXJzdCA9IHN0cmluZy5jaGFyQ29kZUF0KHBvcylcbiAgbGV0IHNlY29uZFxuXG4gIGlmIChmaXJzdCA+PSAweEQ4MDAgJiYgZmlyc3QgPD0gMHhEQkZGICYmIHBvcyArIDEgPCBzdHJpbmcubGVuZ3RoKSB7XG4gICAgc2Vjb25kID0gc3RyaW5nLmNoYXJDb2RlQXQocG9zICsgMSlcbiAgICBpZiAoc2Vjb25kID49IDB4REMwMCAmJiBzZWNvbmQgPD0gMHhERkZGKSB7XG4gICAgICAvLyBodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZyNzdXJyb2dhdGUtZm9ybXVsYWVcbiAgICAgIHJldHVybiAoZmlyc3QgLSAweEQ4MDApICogMHg0MDAgKyBzZWNvbmQgLSAweERDMDAgKyAweDEwMDAwXG4gICAgfVxuICB9XG4gIHJldHVybiBmaXJzdFxufVxuXG4vLyBEZXRlcm1pbmVzIHdoZXRoZXIgYmxvY2sgaW5kZW50YXRpb24gaW5kaWNhdG9yIGlzIHJlcXVpcmVkLlxuZnVuY3Rpb24gbmVlZEluZGVudEluZGljYXRvciAoc3RyaW5nKSB7XG4gIGNvbnN0IGxlYWRpbmdTcGFjZVJlID0gL15cXG4qIC9cbiAgcmV0dXJuIGxlYWRpbmdTcGFjZVJlLnRlc3Qoc3RyaW5nKVxufVxuXG5jb25zdCBTVFlMRV9QTEFJTiA9IDFcbmNvbnN0IFNUWUxFX1NJTkdMRSA9IDJcbmNvbnN0IFNUWUxFX0xJVEVSQUwgPSAzXG5jb25zdCBTVFlMRV9GT0xERUQgPSA0XG5jb25zdCBTVFlMRV9ET1VCTEUgPSA1XG5cbi8vIERldGVybWluZXMgd2hpY2ggc2NhbGFyIHN0eWxlcyBhcmUgcG9zc2libGUgYW5kIHJldHVybnMgdGhlIHByZWZlcnJlZCBzdHlsZS5cbi8vIGxpbmVXaWR0aCA9IC0xID0+IG5vIGxpbWl0LlxuLy8gUHJlLWNvbmRpdGlvbnM6IHN0ci5sZW5ndGggPiAwLlxuLy8gUG9zdC1jb25kaXRpb25zOlxuLy8gICAgU1RZTEVfUExBSU4gb3IgU1RZTEVfU0lOR0xFID0+IG5vIFxcbiBhcmUgaW4gdGhlIHN0cmluZy5cbi8vICAgIFNUWUxFX0xJVEVSQUwgPT4gbm8gbGluZXMgYXJlIHN1aXRhYmxlIGZvciBmb2xkaW5nIChvciBsaW5lV2lkdGggaXMgLTEpLlxuLy8gICAgU1RZTEVfRk9MREVEID0+IGEgbGluZSA+IGxpbmVXaWR0aCBhbmQgY2FuIGJlIGZvbGRlZCAoYW5kIGxpbmVXaWR0aCAhPSAtMSkuXG5mdW5jdGlvbiBjaG9vc2VTY2FsYXJTdHlsZSAoc3RyaW5nLCBzaW5nbGVMaW5lT25seSwgaW5kZW50UGVyTGV2ZWwsIGxpbmVXaWR0aCxcbiAgdGVzdEFtYmlndW91c1R5cGUsIHF1b3RpbmdUeXBlLCBmb3JjZVF1b3RlcywgaW5ibG9jaykge1xuICBsZXQgaVxuICBsZXQgY2hhciA9IDBcbiAgbGV0IHByZXZDaGFyID0gbnVsbFxuICBsZXQgaGFzTGluZUJyZWFrID0gZmFsc2VcbiAgbGV0IGhhc0ZvbGRhYmxlTGluZSA9IGZhbHNlIC8vIG9ubHkgY2hlY2tlZCBpZiBzaG91bGRUcmFja1dpZHRoXG4gIGNvbnN0IHNob3VsZFRyYWNrV2lkdGggPSBsaW5lV2lkdGggIT09IC0xXG4gIGxldCBwcmV2aW91c0xpbmVCcmVhayA9IC0xIC8vIGNvdW50IHRoZSBmaXJzdCBsaW5lIGNvcnJlY3RseVxuICBsZXQgcGxhaW4gPSBpc1BsYWluU2FmZUZpcnN0KGNvZGVQb2ludEF0KHN0cmluZywgMCkpICYmXG4gICAgaXNQbGFpblNhZmVMYXN0KGNvZGVQb2ludEF0KHN0cmluZywgc3RyaW5nLmxlbmd0aCAtIDEpKVxuXG4gIGlmIChzaW5nbGVMaW5lT25seSB8fCBmb3JjZVF1b3Rlcykge1xuICAgIC8vIENhc2U6IG5vIGJsb2NrIHN0eWxlcy5cbiAgICAvLyBDaGVjayBmb3IgZGlzYWxsb3dlZCBjaGFyYWN0ZXJzIHRvIHJ1bGUgb3V0IHBsYWluIGFuZCBzaW5nbGUuXG4gICAgZm9yIChpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGNoYXIgPj0gMHgxMDAwMCA/IGkgKz0gMiA6IGkrKykge1xuICAgICAgY2hhciA9IGNvZGVQb2ludEF0KHN0cmluZywgaSlcbiAgICAgIGlmICghaXNQcmludGFibGUoY2hhcikpIHtcbiAgICAgICAgcmV0dXJuIFNUWUxFX0RPVUJMRVxuICAgICAgfVxuICAgICAgcGxhaW4gPSBwbGFpbiAmJiBpc1BsYWluU2FmZShjaGFyLCBwcmV2Q2hhciwgaW5ibG9jaylcbiAgICAgIHByZXZDaGFyID0gY2hhclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBDYXNlOiBibG9jayBzdHlsZXMgcGVybWl0dGVkLlxuICAgIGZvciAoaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBjaGFyID49IDB4MTAwMDAgPyBpICs9IDIgOiBpKyspIHtcbiAgICAgIGNoYXIgPSBjb2RlUG9pbnRBdChzdHJpbmcsIGkpXG4gICAgICBpZiAoY2hhciA9PT0gQ0hBUl9MSU5FX0ZFRUQpIHtcbiAgICAgICAgaGFzTGluZUJyZWFrID0gdHJ1ZVxuICAgICAgICAvLyBDaGVjayBpZiBhbnkgbGluZSBjYW4gYmUgZm9sZGVkLlxuICAgICAgICBpZiAoc2hvdWxkVHJhY2tXaWR0aCkge1xuICAgICAgICAgIGhhc0ZvbGRhYmxlTGluZSA9IGhhc0ZvbGRhYmxlTGluZSB8fFxuICAgICAgICAgICAgLy8gRm9sZGFibGUgbGluZSA9IHRvbyBsb25nLCBhbmQgbm90IG1vcmUtaW5kZW50ZWQuXG4gICAgICAgICAgICAoaSAtIHByZXZpb3VzTGluZUJyZWFrIC0gMSA+IGxpbmVXaWR0aCAmJlxuICAgICAgICAgICAgIHN0cmluZ1twcmV2aW91c0xpbmVCcmVhayArIDFdICE9PSAnICcpXG4gICAgICAgICAgcHJldmlvdXNMaW5lQnJlYWsgPSBpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIWlzUHJpbnRhYmxlKGNoYXIpKSB7XG4gICAgICAgIHJldHVybiBTVFlMRV9ET1VCTEVcbiAgICAgIH1cbiAgICAgIHBsYWluID0gcGxhaW4gJiYgaXNQbGFpblNhZmUoY2hhciwgcHJldkNoYXIsIGluYmxvY2spXG4gICAgICBwcmV2Q2hhciA9IGNoYXJcbiAgICB9XG4gICAgLy8gaW4gY2FzZSB0aGUgZW5kIGlzIG1pc3NpbmcgYSBcXG5cbiAgICBoYXNGb2xkYWJsZUxpbmUgPSBoYXNGb2xkYWJsZUxpbmUgfHwgKHNob3VsZFRyYWNrV2lkdGggJiZcbiAgICAgIChpIC0gcHJldmlvdXNMaW5lQnJlYWsgLSAxID4gbGluZVdpZHRoICYmXG4gICAgICAgc3RyaW5nW3ByZXZpb3VzTGluZUJyZWFrICsgMV0gIT09ICcgJykpXG4gIH1cbiAgLy8gQWx0aG91Z2ggZXZlcnkgc3R5bGUgY2FuIHJlcHJlc2VudCBcXG4gd2l0aG91dCBlc2NhcGluZywgcHJlZmVyIGJsb2NrIHN0eWxlc1xuICAvLyBmb3IgbXVsdGlsaW5lLCBzaW5jZSB0aGV5J3JlIG1vcmUgcmVhZGFibGUgYW5kIHRoZXkgZG9uJ3QgYWRkIGVtcHR5IGxpbmVzLlxuICAvLyBBbHNvIHByZWZlciBmb2xkaW5nIGEgc3VwZXItbG9uZyBsaW5lLlxuICBpZiAoIWhhc0xpbmVCcmVhayAmJiAhaGFzRm9sZGFibGVMaW5lKSB7XG4gICAgLy8gU3RyaW5ncyBpbnRlcnByZXRhYmxlIGFzIGFub3RoZXIgdHlwZSBoYXZlIHRvIGJlIHF1b3RlZDtcbiAgICAvLyBlLmcuIHRoZSBzdHJpbmcgJ3RydWUnIHZzLiB0aGUgYm9vbGVhbiB0cnVlLlxuICAgIGlmIChwbGFpbiAmJiAhZm9yY2VRdW90ZXMgJiYgIXRlc3RBbWJpZ3VvdXNUeXBlKHN0cmluZykpIHtcbiAgICAgIHJldHVybiBTVFlMRV9QTEFJTlxuICAgIH1cbiAgICByZXR1cm4gcXVvdGluZ1R5cGUgPT09IFFVT1RJTkdfVFlQRV9ET1VCTEUgPyBTVFlMRV9ET1VCTEUgOiBTVFlMRV9TSU5HTEVcbiAgfVxuICAvLyBFZGdlIGNhc2U6IGJsb2NrIGluZGVudGF0aW9uIGluZGljYXRvciBjYW4gb25seSBoYXZlIG9uZSBkaWdpdC5cbiAgaWYgKGluZGVudFBlckxldmVsID4gOSAmJiBuZWVkSW5kZW50SW5kaWNhdG9yKHN0cmluZykpIHtcbiAgICByZXR1cm4gU1RZTEVfRE9VQkxFXG4gIH1cbiAgLy8gQXQgdGhpcyBwb2ludCB3ZSBrbm93IGJsb2NrIHN0eWxlcyBhcmUgdmFsaWQuXG4gIC8vIFByZWZlciBsaXRlcmFsIHN0eWxlIHVubGVzcyB3ZSB3YW50IHRvIGZvbGQuXG4gIGlmICghZm9yY2VRdW90ZXMpIHtcbiAgICByZXR1cm4gaGFzRm9sZGFibGVMaW5lID8gU1RZTEVfRk9MREVEIDogU1RZTEVfTElURVJBTFxuICB9XG4gIHJldHVybiBxdW90aW5nVHlwZSA9PT0gUVVPVElOR19UWVBFX0RPVUJMRSA/IFNUWUxFX0RPVUJMRSA6IFNUWUxFX1NJTkdMRVxufVxuXG4vLyBOb3RlOiBsaW5lIGJyZWFraW5nL2ZvbGRpbmcgaXMgaW1wbGVtZW50ZWQgZm9yIG9ubHkgdGhlIGZvbGRlZCBzdHlsZS5cbi8vIE5CLiBXZSBkcm9wIHRoZSBsYXN0IHRyYWlsaW5nIG5ld2xpbmUgKGlmIGFueSkgb2YgYSByZXR1cm5lZCBibG9jayBzY2FsYXJcbi8vICBzaW5jZSB0aGUgZHVtcGVyIGFkZHMgaXRzIG93biBuZXdsaW5lLiBUaGlzIGFsd2F5cyB3b3Jrczpcbi8vICAgIOKAoiBObyBlbmRpbmcgbmV3bGluZSA9PiB1bmFmZmVjdGVkOyBhbHJlYWR5IHVzaW5nIHN0cmlwIFwiLVwiIGNob21waW5nLlxuLy8gICAg4oCiIEVuZGluZyBuZXdsaW5lICAgID0+IHJlbW92ZWQgdGhlbiByZXN0b3JlZC5cbi8vICBJbXBvcnRhbnRseSwgdGhpcyBrZWVwcyB0aGUgXCIrXCIgY2hvbXAgaW5kaWNhdG9yIGZyb20gZ2FpbmluZyBhbiBleHRyYSBsaW5lLlxuZnVuY3Rpb24gd3JpdGVTY2FsYXIgKHN0YXRlLCBzdHJpbmcsIGxldmVsLCBpc2tleSwgaW5ibG9jaykge1xuICBzdGF0ZS5kdW1wID0gKGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoc3RyaW5nLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHN0YXRlLnF1b3RpbmdUeXBlID09PSBRVU9USU5HX1RZUEVfRE9VQkxFID8gJ1wiXCInIDogXCInJ1wiXG4gICAgfVxuICAgIGlmICghc3RhdGUubm9Db21wYXRNb2RlKSB7XG4gICAgICBpZiAoREVQUkVDQVRFRF9CT09MRUFOU19TWU5UQVguaW5kZXhPZihzdHJpbmcpICE9PSAtMSB8fCBERVBSRUNBVEVEX0JBU0U2MF9TWU5UQVgudGVzdChzdHJpbmcpKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZS5xdW90aW5nVHlwZSA9PT0gUVVPVElOR19UWVBFX0RPVUJMRSA/ICgnXCInICsgc3RyaW5nICsgJ1wiJykgOiAoXCInXCIgKyBzdHJpbmcgKyBcIidcIilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbmRlbnQgPSBzdGF0ZS5pbmRlbnQgKiBNYXRoLm1heCgxLCBsZXZlbCkgLy8gbm8gMC1pbmRlbnQgc2NhbGFyc1xuICAgIC8vIEFzIGluZGVudGF0aW9uIGdldHMgZGVlcGVyLCBsZXQgdGhlIHdpZHRoIGRlY3JlYXNlIG1vbm90b25pY2FsbHlcbiAgICAvLyB0byB0aGUgbG93ZXIgYm91bmQgbWluKHN0YXRlLmxpbmVXaWR0aCwgNDApLlxuICAgIC8vIE5vdGUgdGhhdCB0aGlzIGltcGxpZXNcbiAgICAvLyAgc3RhdGUubGluZVdpZHRoIOKJpCA0MCArIHN0YXRlLmluZGVudDogd2lkdGggaXMgZml4ZWQgYXQgdGhlIGxvd2VyIGJvdW5kLlxuICAgIC8vICBzdGF0ZS5saW5lV2lkdGggPiA0MCArIHN0YXRlLmluZGVudDogd2lkdGggZGVjcmVhc2VzIHVudGlsIHRoZSBsb3dlciBib3VuZC5cbiAgICAvLyBUaGlzIGJlaGF2ZXMgYmV0dGVyIHRoYW4gYSBjb25zdGFudCBtaW5pbXVtIHdpZHRoIHdoaWNoIGRpc2FsbG93cyBuYXJyb3dlciBvcHRpb25zLFxuICAgIC8vIG9yIGFuIGluZGVudCB0aHJlc2hvbGQgd2hpY2ggY2F1c2VzIHRoZSB3aWR0aCB0byBzdWRkZW5seSBpbmNyZWFzZS5cbiAgICBjb25zdCBsaW5lV2lkdGggPSAoc3RhdGUubGluZVdpZHRoID09PSAtMSlcbiAgICAgID8gLTFcbiAgICAgIDogTWF0aC5tYXgoTWF0aC5taW4oc3RhdGUubGluZVdpZHRoLCA0MCksIHN0YXRlLmxpbmVXaWR0aCAtIGluZGVudClcblxuICAgIC8vIFdpdGhvdXQga25vd2luZyBpZiBrZXlzIGFyZSBpbXBsaWNpdC9leHBsaWNpdCwgYXNzdW1lIGltcGxpY2l0IGZvciBzYWZldHkuXG4gICAgY29uc3Qgc2luZ2xlTGluZU9ubHkgPSBpc2tleSB8fFxuICAgICAgLy8gTm8gYmxvY2sgc3R5bGVzIGluIGZsb3cgbW9kZS5cbiAgICAgIChzdGF0ZS5mbG93TGV2ZWwgPiAtMSAmJiBsZXZlbCA+PSBzdGF0ZS5mbG93TGV2ZWwpXG4gICAgZnVuY3Rpb24gdGVzdEFtYmlndWl0eSAoc3RyaW5nKSB7XG4gICAgICByZXR1cm4gdGVzdEltcGxpY2l0UmVzb2x2aW5nKHN0YXRlLCBzdHJpbmcpXG4gICAgfVxuXG4gICAgc3dpdGNoIChjaG9vc2VTY2FsYXJTdHlsZShzdHJpbmcsIHNpbmdsZUxpbmVPbmx5LCBzdGF0ZS5pbmRlbnQsIGxpbmVXaWR0aCxcbiAgICAgIHRlc3RBbWJpZ3VpdHksIHN0YXRlLnF1b3RpbmdUeXBlLCBzdGF0ZS5mb3JjZVF1b3RlcyAmJiAhaXNrZXksIGluYmxvY2spKSB7XG4gICAgICBjYXNlIFNUWUxFX1BMQUlOOlxuICAgICAgICByZXR1cm4gc3RyaW5nXG4gICAgICBjYXNlIFNUWUxFX1NJTkdMRTpcbiAgICAgICAgcmV0dXJuIFwiJ1wiICsgc3RyaW5nLnJlcGxhY2UoLycvZywgXCInJ1wiKSArIFwiJ1wiXG4gICAgICBjYXNlIFNUWUxFX0xJVEVSQUw6XG4gICAgICAgIHJldHVybiAnfCcgKyBibG9ja0hlYWRlcihzdHJpbmcsIHN0YXRlLmluZGVudCkgK1xuICAgICAgICAgIGRyb3BFbmRpbmdOZXdsaW5lKGluZGVudFN0cmluZyhzdHJpbmcsIGluZGVudCkpXG4gICAgICBjYXNlIFNUWUxFX0ZPTERFRDpcbiAgICAgICAgcmV0dXJuICc+JyArIGJsb2NrSGVhZGVyKHN0cmluZywgc3RhdGUuaW5kZW50KSArXG4gICAgICAgICAgZHJvcEVuZGluZ05ld2xpbmUoaW5kZW50U3RyaW5nKGZvbGRTdHJpbmcoc3RyaW5nLCBsaW5lV2lkdGgpLCBpbmRlbnQpKVxuICAgICAgY2FzZSBTVFlMRV9ET1VCTEU6XG4gICAgICAgIHJldHVybiAnXCInICsgZXNjYXBlU3RyaW5nKHN0cmluZywgbGluZVdpZHRoKSArICdcIidcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKCdpbXBvc3NpYmxlIGVycm9yOiBpbnZhbGlkIHNjYWxhciBzdHlsZScpXG4gICAgfVxuICB9KCkpXG59XG5cbi8vIFByZS1jb25kaXRpb25zOiBzdHJpbmcgaXMgdmFsaWQgZm9yIGEgYmxvY2sgc2NhbGFyLCAxIDw9IGluZGVudFBlckxldmVsIDw9IDkuXG5mdW5jdGlvbiBibG9ja0hlYWRlciAoc3RyaW5nLCBpbmRlbnRQZXJMZXZlbCkge1xuICBjb25zdCBpbmRlbnRJbmRpY2F0b3IgPSBuZWVkSW5kZW50SW5kaWNhdG9yKHN0cmluZykgPyBTdHJpbmcoaW5kZW50UGVyTGV2ZWwpIDogJydcblxuICAvLyBub3RlIHRoZSBzcGVjaWFsIGNhc2U6IHRoZSBzdHJpbmcgJ1xcbicgY291bnRzIGFzIGEgXCJ0cmFpbGluZ1wiIGVtcHR5IGxpbmUuXG4gIGNvbnN0IGNsaXAgPSBzdHJpbmdbc3RyaW5nLmxlbmd0aCAtIDFdID09PSAnXFxuJ1xuICBjb25zdCBrZWVwID0gY2xpcCAmJiAoc3RyaW5nW3N0cmluZy5sZW5ndGggLSAyXSA9PT0gJ1xcbicgfHwgc3RyaW5nID09PSAnXFxuJylcbiAgY29uc3QgY2hvbXAgPSBrZWVwID8gJysnIDogKGNsaXAgPyAnJyA6ICctJylcblxuICByZXR1cm4gaW5kZW50SW5kaWNhdG9yICsgY2hvbXAgKyAnXFxuJ1xufVxuXG4vLyAoU2VlIHRoZSBub3RlIGZvciB3cml0ZVNjYWxhci4pXG5mdW5jdGlvbiBkcm9wRW5kaW5nTmV3bGluZSAoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmdbc3RyaW5nLmxlbmd0aCAtIDFdID09PSAnXFxuJyA/IHN0cmluZy5zbGljZSgwLCAtMSkgOiBzdHJpbmdcbn1cblxuLy8gTm90ZTogYSBsb25nIGxpbmUgd2l0aG91dCBhIHN1aXRhYmxlIGJyZWFrIHBvaW50IHdpbGwgZXhjZWVkIHRoZSB3aWR0aCBsaW1pdC5cbi8vIFByZS1jb25kaXRpb25zOiBldmVyeSBjaGFyIGluIHN0ciBpc1ByaW50YWJsZSwgc3RyLmxlbmd0aCA+IDAsIHdpZHRoID4gMC5cbmZ1bmN0aW9uIGZvbGRTdHJpbmcgKHN0cmluZywgd2lkdGgpIHtcbiAgLy8gSW4gZm9sZGVkIHN0eWxlLCAkayQgY29uc2VjdXRpdmUgbmV3bGluZXMgb3V0cHV0IGFzICRrKzEkIG5ld2xpbmVz4oCUXG4gIC8vIHVubGVzcyB0aGV5J3JlIGJlZm9yZSBvciBhZnRlciBhIG1vcmUtaW5kZW50ZWQgbGluZSwgb3IgYXQgdGhlIHZlcnlcbiAgLy8gYmVnaW5uaW5nIG9yIGVuZCwgaW4gd2hpY2ggY2FzZSAkayQgbWFwcyB0byAkayQuXG4gIC8vIFRoZXJlZm9yZSwgcGFyc2UgZWFjaCBjaHVuayBhcyBuZXdsaW5lKHMpIGZvbGxvd2VkIGJ5IGEgY29udGVudCBsaW5lLlxuICBjb25zdCBsaW5lUmUgPSAvKFxcbispKFteXFxuXSopL2dcblxuICAvLyBmaXJzdCBsaW5lIChwb3NzaWJseSBhbiBlbXB0eSBsaW5lKVxuICBsZXQgcmVzdWx0ID0gKGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgbmV4dExGID0gc3RyaW5nLmluZGV4T2YoJ1xcbicpXG4gICAgbmV4dExGID0gbmV4dExGICE9PSAtMSA/IG5leHRMRiA6IHN0cmluZy5sZW5ndGhcbiAgICBsaW5lUmUubGFzdEluZGV4ID0gbmV4dExGXG4gICAgcmV0dXJuIGZvbGRMaW5lKHN0cmluZy5zbGljZSgwLCBuZXh0TEYpLCB3aWR0aClcbiAgfSgpKVxuICAvLyBJZiB3ZSBoYXZlbid0IHJlYWNoZWQgdGhlIGZpcnN0IGNvbnRlbnQgbGluZSB5ZXQsIGRvbid0IGFkZCBhbiBleHRyYSBcXG4uXG4gIGxldCBwcmV2TW9yZUluZGVudGVkID0gc3RyaW5nWzBdID09PSAnXFxuJyB8fCBzdHJpbmdbMF0gPT09ICcgJ1xuICBsZXQgbW9yZUluZGVudGVkXG5cbiAgLy8gcmVzdCBvZiB0aGUgbGluZXNcbiAgbGV0IG1hdGNoXG4gIHdoaWxlICgobWF0Y2ggPSBsaW5lUmUuZXhlYyhzdHJpbmcpKSkge1xuICAgIGNvbnN0IHByZWZpeCA9IG1hdGNoWzFdXG4gICAgY29uc3QgbGluZSA9IG1hdGNoWzJdXG5cbiAgICBtb3JlSW5kZW50ZWQgPSAobGluZVswXSA9PT0gJyAnKVxuICAgIHJlc3VsdCArPSBwcmVmaXggK1xuICAgICAgKCghcHJldk1vcmVJbmRlbnRlZCAmJiAhbW9yZUluZGVudGVkICYmIGxpbmUgIT09ICcnKSA/ICdcXG4nIDogJycpICtcbiAgICAgIGZvbGRMaW5lKGxpbmUsIHdpZHRoKVxuICAgIHByZXZNb3JlSW5kZW50ZWQgPSBtb3JlSW5kZW50ZWRcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuLy8gR3JlZWR5IGxpbmUgYnJlYWtpbmcuXG4vLyBQaWNrcyB0aGUgbG9uZ2VzdCBsaW5lIHVuZGVyIHRoZSBsaW1pdCBlYWNoIHRpbWUsXG4vLyBvdGhlcndpc2Ugc2V0dGxlcyBmb3IgdGhlIHNob3J0ZXN0IGxpbmUgb3ZlciB0aGUgbGltaXQuXG4vLyBOQi4gTW9yZS1pbmRlbnRlZCBsaW5lcyAqY2Fubm90KiBiZSBmb2xkZWQsIGFzIHRoYXQgd291bGQgYWRkIGFuIGV4dHJhIFxcbi5cbmZ1bmN0aW9uIGZvbGRMaW5lIChsaW5lLCB3aWR0aCkge1xuICBpZiAobGluZSA9PT0gJycgfHwgbGluZVswXSA9PT0gJyAnKSByZXR1cm4gbGluZVxuXG4gIC8vIFNpbmNlIGEgbW9yZS1pbmRlbnRlZCBsaW5lIGFkZHMgYSBcXG4sIGJyZWFrcyBjYW4ndCBiZSBmb2xsb3dlZCBieSBhIHNwYWNlLlxuICBjb25zdCBicmVha1JlID0gLyBbXiBdL2cgLy8gbm90ZTogdGhlIG1hdGNoIGluZGV4IHdpbGwgYWx3YXlzIGJlIDw9IGxlbmd0aC0yLlxuICBsZXQgbWF0Y2hcbiAgLy8gc3RhcnQgaXMgYW4gaW5jbHVzaXZlIGluZGV4LiBlbmQsIGN1cnIsIGFuZCBuZXh0IGFyZSBleGNsdXNpdmUuXG4gIGxldCBzdGFydCA9IDBcbiAgbGV0IGVuZFxuICBsZXQgY3VyciA9IDBcbiAgbGV0IG5leHQgPSAwXG4gIGxldCByZXN1bHQgPSAnJ1xuXG4gIC8vIEludmFyaWFudHM6IDAgPD0gc3RhcnQgPD0gbGVuZ3RoLTEuXG4gIC8vICAgMCA8PSBjdXJyIDw9IG5leHQgPD0gbWF4KDAsIGxlbmd0aC0yKS4gY3VyciAtIHN0YXJ0IDw9IHdpZHRoLlxuICAvLyBJbnNpZGUgdGhlIGxvb3A6XG4gIC8vICAgQSBtYXRjaCBpbXBsaWVzIGxlbmd0aCA+PSAyLCBzbyBjdXJyIGFuZCBuZXh0IGFyZSA8PSBsZW5ndGgtMi5cbiAgd2hpbGUgKChtYXRjaCA9IGJyZWFrUmUuZXhlYyhsaW5lKSkpIHtcbiAgICBuZXh0ID0gbWF0Y2guaW5kZXhcbiAgICAvLyBtYWludGFpbiBpbnZhcmlhbnQ6IGN1cnIgLSBzdGFydCA8PSB3aWR0aFxuICAgIGlmIChuZXh0IC0gc3RhcnQgPiB3aWR0aCkge1xuICAgICAgZW5kID0gKGN1cnIgPiBzdGFydCkgPyBjdXJyIDogbmV4dCAvLyBkZXJpdmUgZW5kIDw9IGxlbmd0aC0yXG4gICAgICByZXN1bHQgKz0gJ1xcbicgKyBsaW5lLnNsaWNlKHN0YXJ0LCBlbmQpXG4gICAgICAvLyBza2lwIHRoZSBzcGFjZSB0aGF0IHdhcyBvdXRwdXQgYXMgXFxuXG4gICAgICBzdGFydCA9IGVuZCArIDEgICAgICAgICAgICAgICAgICAgIC8vIGRlcml2ZSBzdGFydCA8PSBsZW5ndGgtMVxuICAgIH1cbiAgICBjdXJyID0gbmV4dFxuICB9XG5cbiAgLy8gQnkgdGhlIGludmFyaWFudHMsIHN0YXJ0IDw9IGxlbmd0aC0xLCBzbyB0aGVyZSBpcyBzb21ldGhpbmcgbGVmdCBvdmVyLlxuICAvLyBJdCBpcyBlaXRoZXIgdGhlIHdob2xlIHN0cmluZyBvciBhIHBhcnQgc3RhcnRpbmcgZnJvbSBub24td2hpdGVzcGFjZS5cbiAgcmVzdWx0ICs9ICdcXG4nXG4gIC8vIEluc2VydCBhIGJyZWFrIGlmIHRoZSByZW1haW5kZXIgaXMgdG9vIGxvbmcgYW5kIHRoZXJlIGlzIGEgYnJlYWsgYXZhaWxhYmxlLlxuICBpZiAobGluZS5sZW5ndGggLSBzdGFydCA+IHdpZHRoICYmIGN1cnIgPiBzdGFydCkge1xuICAgIHJlc3VsdCArPSBsaW5lLnNsaWNlKHN0YXJ0LCBjdXJyKSArICdcXG4nICsgbGluZS5zbGljZShjdXJyICsgMSlcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgKz0gbGluZS5zbGljZShzdGFydClcbiAgfVxuXG4gIHJldHVybiByZXN1bHQuc2xpY2UoMSkgLy8gZHJvcCBleHRyYSBcXG4gam9pbmVyXG59XG5cbi8vIEVzY2FwZXMgYSBkb3VibGUtcXVvdGVkIHN0cmluZy5cbmZ1bmN0aW9uIGVzY2FwZVN0cmluZyAoc3RyaW5nKSB7XG4gIGxldCByZXN1bHQgPSAnJ1xuICBsZXQgY2hhciA9IDBcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGNoYXIgPj0gMHgxMDAwMCA/IGkgKz0gMiA6IGkrKykge1xuICAgIGNoYXIgPSBjb2RlUG9pbnRBdChzdHJpbmcsIGkpXG4gICAgY29uc3QgZXNjYXBlU2VxID0gRVNDQVBFX1NFUVVFTkNFU1tjaGFyXVxuXG4gICAgaWYgKCFlc2NhcGVTZXEgJiYgaXNQcmludGFibGUoY2hhcikpIHtcbiAgICAgIHJlc3VsdCArPSBzdHJpbmdbaV1cbiAgICAgIGlmIChjaGFyID49IDB4MTAwMDApIHJlc3VsdCArPSBzdHJpbmdbaSArIDFdXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCArPSBlc2NhcGVTZXEgfHwgZW5jb2RlSGV4KGNoYXIpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb3dTZXF1ZW5jZSAoc3RhdGUsIGxldmVsLCBvYmplY3QpIHtcbiAgbGV0IF9yZXN1bHQgPSAnJ1xuICBjb25zdCBfdGFnID0gc3RhdGUudGFnXG5cbiAgZm9yIChsZXQgaW5kZXggPSAwLCBsZW5ndGggPSBvYmplY3QubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGxldCB2YWx1ZSA9IG9iamVjdFtpbmRleF1cblxuICAgIGlmIChzdGF0ZS5yZXBsYWNlcikge1xuICAgICAgdmFsdWUgPSBzdGF0ZS5yZXBsYWNlci5jYWxsKG9iamVjdCwgU3RyaW5nKGluZGV4KSwgdmFsdWUpXG4gICAgfVxuXG4gICAgLy8gV3JpdGUgb25seSB2YWxpZCBlbGVtZW50cywgcHV0IG51bGwgaW5zdGVhZCBvZiBpbnZhbGlkIGVsZW1lbnRzLlxuICAgIGlmICh3cml0ZU5vZGUoc3RhdGUsIGxldmVsLCB2YWx1ZSwgZmFsc2UsIGZhbHNlKSB8fFxuICAgICAgICAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCwgbnVsbCwgZmFsc2UsIGZhbHNlKSkpIHtcbiAgICAgIGlmIChfcmVzdWx0ICE9PSAnJykgX3Jlc3VsdCArPSAnLCcgKyAoIXN0YXRlLmNvbmRlbnNlRmxvdyA/ICcgJyA6ICcnKVxuICAgICAgX3Jlc3VsdCArPSBzdGF0ZS5kdW1wXG4gICAgfVxuICB9XG5cbiAgc3RhdGUudGFnID0gX3RhZ1xuICBzdGF0ZS5kdW1wID0gJ1snICsgX3Jlc3VsdCArICddJ1xufVxuXG5mdW5jdGlvbiB3cml0ZUJsb2NrU2VxdWVuY2UgKHN0YXRlLCBsZXZlbCwgb2JqZWN0LCBjb21wYWN0KSB7XG4gIGxldCBfcmVzdWx0ID0gJydcbiAgY29uc3QgX3RhZyA9IHN0YXRlLnRhZ1xuXG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBsZXQgdmFsdWUgPSBvYmplY3RbaW5kZXhdXG5cbiAgICBpZiAoc3RhdGUucmVwbGFjZXIpIHtcbiAgICAgIHZhbHVlID0gc3RhdGUucmVwbGFjZXIuY2FsbChvYmplY3QsIFN0cmluZyhpbmRleCksIHZhbHVlKVxuICAgIH1cblxuICAgIC8vIFdyaXRlIG9ubHkgdmFsaWQgZWxlbWVudHMsIHB1dCBudWxsIGluc3RlYWQgb2YgaW52YWxpZCBlbGVtZW50cy5cbiAgICBpZiAod3JpdGVOb2RlKHN0YXRlLCBsZXZlbCArIDEsIHZhbHVlLCB0cnVlLCB0cnVlLCBmYWxzZSwgdHJ1ZSkgfHxcbiAgICAgICAgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgIHdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwgKyAxLCBudWxsLCB0cnVlLCB0cnVlLCBmYWxzZSwgdHJ1ZSkpKSB7XG4gICAgICBpZiAoIWNvbXBhY3QgfHwgX3Jlc3VsdCAhPT0gJycpIHtcbiAgICAgICAgX3Jlc3VsdCArPSBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlLCBsZXZlbClcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlLmR1bXAgJiYgQ0hBUl9MSU5FX0ZFRUQgPT09IHN0YXRlLmR1bXAuY2hhckNvZGVBdCgwKSkge1xuICAgICAgICBfcmVzdWx0ICs9ICctJ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3Jlc3VsdCArPSAnLSAnXG4gICAgICB9XG5cbiAgICAgIF9yZXN1bHQgKz0gc3RhdGUuZHVtcFxuICAgIH1cbiAgfVxuXG4gIHN0YXRlLnRhZyA9IF90YWdcbiAgc3RhdGUuZHVtcCA9IF9yZXN1bHQgfHwgJ1tdJyAvLyBFbXB0eSBzZXF1ZW5jZSBpZiBubyB2YWxpZCB2YWx1ZXMuXG59XG5cbmZ1bmN0aW9uIHdyaXRlRmxvd01hcHBpbmcgKHN0YXRlLCBsZXZlbCwgb2JqZWN0KSB7XG4gIGxldCBfcmVzdWx0ID0gJydcbiAgY29uc3QgX3RhZyA9IHN0YXRlLnRhZ1xuICBjb25zdCBvYmplY3RLZXlMaXN0ID0gT2JqZWN0LmtleXMob2JqZWN0KVxuXG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gb2JqZWN0S2V5TGlzdC5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgbGV0IHBhaXJCdWZmZXIgPSAnJ1xuICAgIGlmIChfcmVzdWx0ICE9PSAnJykgcGFpckJ1ZmZlciArPSAnLCAnXG5cbiAgICBpZiAoc3RhdGUuY29uZGVuc2VGbG93KSBwYWlyQnVmZmVyICs9ICdcIidcblxuICAgIGNvbnN0IG9iamVjdEtleSA9IG9iamVjdEtleUxpc3RbaW5kZXhdXG4gICAgbGV0IG9iamVjdFZhbHVlID0gb2JqZWN0W29iamVjdEtleV1cblxuICAgIGlmIChzdGF0ZS5yZXBsYWNlcikge1xuICAgICAgb2JqZWN0VmFsdWUgPSBzdGF0ZS5yZXBsYWNlci5jYWxsKG9iamVjdCwgb2JqZWN0S2V5LCBvYmplY3RWYWx1ZSlcbiAgICB9XG5cbiAgICBpZiAoIXdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwsIG9iamVjdEtleSwgZmFsc2UsIGZhbHNlKSkge1xuICAgICAgY29udGludWUgLy8gU2tpcCB0aGlzIHBhaXIgYmVjYXVzZSBvZiBpbnZhbGlkIGtleTtcbiAgICB9XG5cbiAgICBpZiAoc3RhdGUuZHVtcC5sZW5ndGggPiAxMDI0KSBwYWlyQnVmZmVyICs9ICc/ICdcblxuICAgIHBhaXJCdWZmZXIgKz0gc3RhdGUuZHVtcCArIChzdGF0ZS5jb25kZW5zZUZsb3cgPyAnXCInIDogJycpICsgJzonICsgKHN0YXRlLmNvbmRlbnNlRmxvdyA/ICcnIDogJyAnKVxuXG4gICAgaWYgKCF3cml0ZU5vZGUoc3RhdGUsIGxldmVsLCBvYmplY3RWYWx1ZSwgZmFsc2UsIGZhbHNlKSkge1xuICAgICAgY29udGludWUgLy8gU2tpcCB0aGlzIHBhaXIgYmVjYXVzZSBvZiBpbnZhbGlkIHZhbHVlLlxuICAgIH1cblxuICAgIHBhaXJCdWZmZXIgKz0gc3RhdGUuZHVtcFxuXG4gICAgLy8gQm90aCBrZXkgYW5kIHZhbHVlIGFyZSB2YWxpZC5cbiAgICBfcmVzdWx0ICs9IHBhaXJCdWZmZXJcbiAgfVxuXG4gIHN0YXRlLnRhZyA9IF90YWdcbiAgc3RhdGUuZHVtcCA9ICd7JyArIF9yZXN1bHQgKyAnfSdcbn1cblxuZnVuY3Rpb24gd3JpdGVCbG9ja01hcHBpbmcgKHN0YXRlLCBsZXZlbCwgb2JqZWN0LCBjb21wYWN0KSB7XG4gIGxldCBfcmVzdWx0ID0gJydcbiAgY29uc3QgX3RhZyA9IHN0YXRlLnRhZ1xuICBjb25zdCBvYmplY3RLZXlMaXN0ID0gT2JqZWN0LmtleXMob2JqZWN0KVxuXG4gIC8vIEFsbG93IHNvcnRpbmcga2V5cyBzbyB0aGF0IHRoZSBvdXRwdXQgZmlsZSBpcyBkZXRlcm1pbmlzdGljXG4gIGlmIChzdGF0ZS5zb3J0S2V5cyA9PT0gdHJ1ZSkge1xuICAgIC8vIERlZmF1bHQgc29ydGluZ1xuICAgIG9iamVjdEtleUxpc3Quc29ydCgpXG4gIH0gZWxzZSBpZiAodHlwZW9mIHN0YXRlLnNvcnRLZXlzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gQ3VzdG9tIHNvcnQgZnVuY3Rpb25cbiAgICBvYmplY3RLZXlMaXN0LnNvcnQoc3RhdGUuc29ydEtleXMpXG4gIH0gZWxzZSBpZiAoc3RhdGUuc29ydEtleXMpIHtcbiAgICAvLyBTb21ldGhpbmcgaXMgd3JvbmdcbiAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignc29ydEtleXMgbXVzdCBiZSBhIGJvb2xlYW4gb3IgYSBmdW5jdGlvbicpXG4gIH1cblxuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IG9iamVjdEtleUxpc3QubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGxldCBwYWlyQnVmZmVyID0gJydcblxuICAgIGlmICghY29tcGFjdCB8fCBfcmVzdWx0ICE9PSAnJykge1xuICAgICAgcGFpckJ1ZmZlciArPSBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlLCBsZXZlbClcbiAgICB9XG5cbiAgICBjb25zdCBvYmplY3RLZXkgPSBvYmplY3RLZXlMaXN0W2luZGV4XVxuICAgIGxldCBvYmplY3RWYWx1ZSA9IG9iamVjdFtvYmplY3RLZXldXG5cbiAgICBpZiAoc3RhdGUucmVwbGFjZXIpIHtcbiAgICAgIG9iamVjdFZhbHVlID0gc3RhdGUucmVwbGFjZXIuY2FsbChvYmplY3QsIG9iamVjdEtleSwgb2JqZWN0VmFsdWUpXG4gICAgfVxuXG4gICAgaWYgKCF3cml0ZU5vZGUoc3RhdGUsIGxldmVsICsgMSwgb2JqZWN0S2V5LCB0cnVlLCB0cnVlLCB0cnVlKSkge1xuICAgICAgY29udGludWUgLy8gU2tpcCB0aGlzIHBhaXIgYmVjYXVzZSBvZiBpbnZhbGlkIGtleS5cbiAgICB9XG5cbiAgICBjb25zdCBleHBsaWNpdFBhaXIgPSAoc3RhdGUudGFnICE9PSBudWxsICYmIHN0YXRlLnRhZyAhPT0gJz8nKSB8fFxuICAgICAgICAgICAgICAgICAgIChzdGF0ZS5kdW1wICYmIHN0YXRlLmR1bXAubGVuZ3RoID4gMTAyNClcblxuICAgIGlmIChleHBsaWNpdFBhaXIpIHtcbiAgICAgIGlmIChzdGF0ZS5kdW1wICYmIENIQVJfTElORV9GRUVEID09PSBzdGF0ZS5kdW1wLmNoYXJDb2RlQXQoMCkpIHtcbiAgICAgICAgcGFpckJ1ZmZlciArPSAnPydcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhaXJCdWZmZXIgKz0gJz8gJ1xuICAgICAgfVxuICAgIH1cblxuICAgIHBhaXJCdWZmZXIgKz0gc3RhdGUuZHVtcFxuXG4gICAgaWYgKGV4cGxpY2l0UGFpcikge1xuICAgICAgcGFpckJ1ZmZlciArPSBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlLCBsZXZlbClcbiAgICB9XG5cbiAgICBpZiAoIXdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwgKyAxLCBvYmplY3RWYWx1ZSwgdHJ1ZSwgZXhwbGljaXRQYWlyKSkge1xuICAgICAgY29udGludWUgLy8gU2tpcCB0aGlzIHBhaXIgYmVjYXVzZSBvZiBpbnZhbGlkIHZhbHVlLlxuICAgIH1cblxuICAgIGlmIChzdGF0ZS5kdW1wICYmIENIQVJfTElORV9GRUVEID09PSBzdGF0ZS5kdW1wLmNoYXJDb2RlQXQoMCkpIHtcbiAgICAgIHBhaXJCdWZmZXIgKz0gJzonXG4gICAgfSBlbHNlIHtcbiAgICAgIHBhaXJCdWZmZXIgKz0gJzogJ1xuICAgIH1cblxuICAgIHBhaXJCdWZmZXIgKz0gc3RhdGUuZHVtcFxuXG4gICAgLy8gQm90aCBrZXkgYW5kIHZhbHVlIGFyZSB2YWxpZC5cbiAgICBfcmVzdWx0ICs9IHBhaXJCdWZmZXJcbiAgfVxuXG4gIHN0YXRlLnRhZyA9IF90YWdcbiAgc3RhdGUuZHVtcCA9IF9yZXN1bHQgfHwgJ3t9JyAvLyBFbXB0eSBtYXBwaW5nIGlmIG5vIHZhbGlkIHBhaXJzLlxufVxuXG5mdW5jdGlvbiBkZXRlY3RUeXBlIChzdGF0ZSwgb2JqZWN0LCBleHBsaWNpdCkge1xuICBjb25zdCB0eXBlTGlzdCA9IGV4cGxpY2l0ID8gc3RhdGUuZXhwbGljaXRUeXBlcyA6IHN0YXRlLmltcGxpY2l0VHlwZXNcblxuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IHR5cGVMaXN0Lmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCB0eXBlID0gdHlwZUxpc3RbaW5kZXhdXG5cbiAgICBpZiAoKHR5cGUuaW5zdGFuY2VPZiB8fCB0eXBlLnByZWRpY2F0ZSkgJiZcbiAgICAgICAgKCF0eXBlLmluc3RhbmNlT2YgfHwgKCh0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JykgJiYgKG9iamVjdCBpbnN0YW5jZW9mIHR5cGUuaW5zdGFuY2VPZikpKSAmJlxuICAgICAgICAoIXR5cGUucHJlZGljYXRlIHx8IHR5cGUucHJlZGljYXRlKG9iamVjdCkpKSB7XG4gICAgICBpZiAoZXhwbGljaXQpIHtcbiAgICAgICAgaWYgKHR5cGUubXVsdGkgJiYgdHlwZS5yZXByZXNlbnROYW1lKSB7XG4gICAgICAgICAgc3RhdGUudGFnID0gdHlwZS5yZXByZXNlbnROYW1lKG9iamVjdClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGF0ZS50YWcgPSB0eXBlLnRhZ1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0ZS50YWcgPSAnPydcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGUucmVwcmVzZW50KSB7XG4gICAgICAgIGNvbnN0IHN0eWxlID0gc3RhdGUuc3R5bGVNYXBbdHlwZS50YWddIHx8IHR5cGUuZGVmYXVsdFN0eWxlXG5cbiAgICAgICAgbGV0IF9yZXN1bHRcbiAgICAgICAgaWYgKF90b1N0cmluZy5jYWxsKHR5cGUucmVwcmVzZW50KSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJykge1xuICAgICAgICAgIF9yZXN1bHQgPSB0eXBlLnJlcHJlc2VudChvYmplY3QsIHN0eWxlKVxuICAgICAgICB9IGVsc2UgaWYgKF9oYXNPd25Qcm9wZXJ0eS5jYWxsKHR5cGUucmVwcmVzZW50LCBzdHlsZSkpIHtcbiAgICAgICAgICBfcmVzdWx0ID0gdHlwZS5yZXByZXNlbnRbc3R5bGVdKG9iamVjdCwgc3R5bGUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFlBTUxFeGNlcHRpb24oJyE8JyArIHR5cGUudGFnICsgJz4gdGFnIHJlc29sdmVyIGFjY2VwdHMgbm90IFwiJyArIHN0eWxlICsgJ1wiIHN0eWxlJylcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlLmR1bXAgPSBfcmVzdWx0XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8vIFNlcmlhbGl6ZXMgYG9iamVjdGAgYW5kIHdyaXRlcyBpdCB0byBnbG9iYWwgYHJlc3VsdGAuXG4vLyBSZXR1cm5zIHRydWUgb24gc3VjY2Vzcywgb3IgZmFsc2Ugb24gaW52YWxpZCBvYmplY3QuXG4vL1xuZnVuY3Rpb24gd3JpdGVOb2RlIChzdGF0ZSwgbGV2ZWwsIG9iamVjdCwgYmxvY2ssIGNvbXBhY3QsIGlza2V5LCBpc2Jsb2Nrc2VxKSB7XG4gIHN0YXRlLnRhZyA9IG51bGxcbiAgc3RhdGUuZHVtcCA9IG9iamVjdFxuXG4gIGlmICghZGV0ZWN0VHlwZShzdGF0ZSwgb2JqZWN0LCBmYWxzZSkpIHtcbiAgICBkZXRlY3RUeXBlKHN0YXRlLCBvYmplY3QsIHRydWUpXG4gIH1cblxuICBjb25zdCB0eXBlID0gX3RvU3RyaW5nLmNhbGwoc3RhdGUuZHVtcClcbiAgY29uc3QgaW5ibG9jayA9IGJsb2NrXG5cbiAgaWYgKGJsb2NrKSB7XG4gICAgYmxvY2sgPSAoc3RhdGUuZmxvd0xldmVsIDwgMCB8fCBzdGF0ZS5mbG93TGV2ZWwgPiBsZXZlbClcbiAgfVxuXG4gIGNvbnN0IG9iamVjdE9yQXJyYXkgPSB0eXBlID09PSAnW29iamVjdCBPYmplY3RdJyB8fCB0eXBlID09PSAnW29iamVjdCBBcnJheV0nXG4gIGxldCBkdXBsaWNhdGVJbmRleFxuICBsZXQgZHVwbGljYXRlXG5cbiAgaWYgKG9iamVjdE9yQXJyYXkpIHtcbiAgICBkdXBsaWNhdGVJbmRleCA9IHN0YXRlLmR1cGxpY2F0ZXMuaW5kZXhPZihvYmplY3QpXG4gICAgZHVwbGljYXRlID0gZHVwbGljYXRlSW5kZXggIT09IC0xXG4gIH1cblxuICBpZiAoKHN0YXRlLnRhZyAhPT0gbnVsbCAmJiBzdGF0ZS50YWcgIT09ICc/JykgfHwgZHVwbGljYXRlIHx8IChzdGF0ZS5pbmRlbnQgIT09IDIgJiYgbGV2ZWwgPiAwKSkge1xuICAgIGNvbXBhY3QgPSBmYWxzZVxuICB9XG5cbiAgaWYgKGR1cGxpY2F0ZSAmJiBzdGF0ZS51c2VkRHVwbGljYXRlc1tkdXBsaWNhdGVJbmRleF0pIHtcbiAgICBzdGF0ZS5kdW1wID0gJypyZWZfJyArIGR1cGxpY2F0ZUluZGV4XG4gIH0gZWxzZSB7XG4gICAgaWYgKG9iamVjdE9yQXJyYXkgJiYgZHVwbGljYXRlICYmICFzdGF0ZS51c2VkRHVwbGljYXRlc1tkdXBsaWNhdGVJbmRleF0pIHtcbiAgICAgIHN0YXRlLnVzZWREdXBsaWNhdGVzW2R1cGxpY2F0ZUluZGV4XSA9IHRydWVcbiAgICB9XG4gICAgaWYgKHR5cGUgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICBpZiAoYmxvY2sgJiYgKE9iamVjdC5rZXlzKHN0YXRlLmR1bXApLmxlbmd0aCAhPT0gMCkpIHtcbiAgICAgICAgd3JpdGVCbG9ja01hcHBpbmcoc3RhdGUsIGxldmVsLCBzdGF0ZS5kdW1wLCBjb21wYWN0KVxuICAgICAgICBpZiAoZHVwbGljYXRlKSB7XG4gICAgICAgICAgc3RhdGUuZHVtcCA9ICcmcmVmXycgKyBkdXBsaWNhdGVJbmRleCArIHN0YXRlLmR1bXBcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd3JpdGVGbG93TWFwcGluZyhzdGF0ZSwgbGV2ZWwsIHN0YXRlLmR1bXApXG4gICAgICAgIGlmIChkdXBsaWNhdGUpIHtcbiAgICAgICAgICBzdGF0ZS5kdW1wID0gJyZyZWZfJyArIGR1cGxpY2F0ZUluZGV4ICsgJyAnICsgc3RhdGUuZHVtcFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICBpZiAoYmxvY2sgJiYgKHN0YXRlLmR1bXAubGVuZ3RoICE9PSAwKSkge1xuICAgICAgICBpZiAoc3RhdGUubm9BcnJheUluZGVudCAmJiAhaXNibG9ja3NlcSAmJiBsZXZlbCA+IDApIHtcbiAgICAgICAgICB3cml0ZUJsb2NrU2VxdWVuY2Uoc3RhdGUsIGxldmVsIC0gMSwgc3RhdGUuZHVtcCwgY29tcGFjdClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3cml0ZUJsb2NrU2VxdWVuY2Uoc3RhdGUsIGxldmVsLCBzdGF0ZS5kdW1wLCBjb21wYWN0KVxuICAgICAgICB9XG4gICAgICAgIGlmIChkdXBsaWNhdGUpIHtcbiAgICAgICAgICBzdGF0ZS5kdW1wID0gJyZyZWZfJyArIGR1cGxpY2F0ZUluZGV4ICsgc3RhdGUuZHVtcFxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3cml0ZUZsb3dTZXF1ZW5jZShzdGF0ZSwgbGV2ZWwsIHN0YXRlLmR1bXApXG4gICAgICAgIGlmIChkdXBsaWNhdGUpIHtcbiAgICAgICAgICBzdGF0ZS5kdW1wID0gJyZyZWZfJyArIGR1cGxpY2F0ZUluZGV4ICsgJyAnICsgc3RhdGUuZHVtcFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnW29iamVjdCBTdHJpbmddJykge1xuICAgICAgaWYgKHN0YXRlLnRhZyAhPT0gJz8nKSB7XG4gICAgICAgIHdyaXRlU2NhbGFyKHN0YXRlLCBzdGF0ZS5kdW1wLCBsZXZlbCwgaXNrZXksIGluYmxvY2spXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnW29iamVjdCBVbmRlZmluZWRdJykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzdGF0ZS5za2lwSW52YWxpZCkgcmV0dXJuIGZhbHNlXG4gICAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbigndW5hY2NlcHRhYmxlIGtpbmQgb2YgYW4gb2JqZWN0IHRvIGR1bXAgJyArIHR5cGUpXG4gICAgfVxuXG4gICAgaWYgKHN0YXRlLnRhZyAhPT0gbnVsbCAmJiBzdGF0ZS50YWcgIT09ICc/Jykge1xuICAgICAgLy8gTmVlZCB0byBlbmNvZGUgYWxsIGNoYXJhY3RlcnMgZXhjZXB0IHRob3NlIGFsbG93ZWQgYnkgdGhlIHNwZWM6XG4gICAgICAvL1xuICAgICAgLy8gWzM1XSBucy1kZWMtZGlnaXQgICAgOjo9ICBbI3gzMC0jeDM5XSAvKiAwLTkgKi9cbiAgICAgIC8vIFszNl0gbnMtaGV4LWRpZ2l0ICAgIDo6PSAgbnMtZGVjLWRpZ2l0XG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICB8IFsjeDQxLSN4NDZdIC8qIEEtRiAqLyB8IFsjeDYxLSN4NjZdIC8qIGEtZiAqL1xuICAgICAgLy8gWzM3XSBucy1hc2NpaS1sZXR0ZXIgOjo9ICBbI3g0MS0jeDVBXSAvKiBBLVogKi8gfCBbI3g2MS0jeDdBXSAvKiBhLXogKi9cbiAgICAgIC8vIFszOF0gbnMtd29yZC1jaGFyICAgIDo6PSAgbnMtZGVjLWRpZ2l0IHwgbnMtYXNjaWktbGV0dGVyIHwg4oCcLeKAnVxuICAgICAgLy8gWzM5XSBucy11cmktY2hhciAgICAgOjo9ICDigJwl4oCdIG5zLWhleC1kaWdpdCBucy1oZXgtZGlnaXQgfCBucy13b3JkLWNoYXIgfCDigJwj4oCdXG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICB8IOKAnDvigJ0gfCDigJwv4oCdIHwg4oCcP+KAnSB8IOKAnDrigJ0gfCDigJxA4oCdIHwg4oCcJuKAnSB8IOKAnD3igJ0gfCDigJwr4oCdIHwg4oCcJOKAnSB8IOKAnCzigJ1cbiAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIHwg4oCcX+KAnSB8IOKAnC7igJ0gfCDigJwh4oCdIHwg4oCcfuKAnSB8IOKAnCrigJ0gfCDigJwn4oCdIHwg4oCcKOKAnSB8IOKAnCnigJ0gfCDigJxb4oCdIHwg4oCcXeKAnVxuICAgICAgLy9cbiAgICAgIC8vIEFsc28gbmVlZCB0byBlbmNvZGUgJyEnIGJlY2F1c2UgaXQgaGFzIHNwZWNpYWwgbWVhbmluZyAoZW5kIG9mIHRhZyBwcmVmaXgpLlxuICAgICAgLy9cbiAgICAgIGxldCB0YWdTdHIgPSBlbmNvZGVVUkkoXG4gICAgICAgIHN0YXRlLnRhZ1swXSA9PT0gJyEnID8gc3RhdGUudGFnLnNsaWNlKDEpIDogc3RhdGUudGFnXG4gICAgICApLnJlcGxhY2UoLyEvZywgJyUyMScpXG5cbiAgICAgIGlmIChzdGF0ZS50YWdbMF0gPT09ICchJykge1xuICAgICAgICB0YWdTdHIgPSAnIScgKyB0YWdTdHJcbiAgICAgIH0gZWxzZSBpZiAodGFnU3RyLnNsaWNlKDAsIDE4KSA9PT0gJ3RhZzp5YW1sLm9yZywyMDAyOicpIHtcbiAgICAgICAgdGFnU3RyID0gJyEhJyArIHRhZ1N0ci5zbGljZSgxOClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRhZ1N0ciA9ICchPCcgKyB0YWdTdHIgKyAnPidcbiAgICAgIH1cblxuICAgICAgc3RhdGUuZHVtcCA9IHRhZ1N0ciArICcgJyArIHN0YXRlLmR1bXBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiBnZXREdXBsaWNhdGVSZWZlcmVuY2VzIChvYmplY3QsIHN0YXRlKSB7XG4gIGNvbnN0IG9iamVjdHMgPSBbXVxuICBjb25zdCBkdXBsaWNhdGVzSW5kZXhlcyA9IFtdXG5cbiAgaW5zcGVjdE5vZGUob2JqZWN0LCBvYmplY3RzLCBkdXBsaWNhdGVzSW5kZXhlcylcblxuICBjb25zdCBsZW5ndGggPSBkdXBsaWNhdGVzSW5kZXhlcy5sZW5ndGhcbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIHN0YXRlLmR1cGxpY2F0ZXMucHVzaChvYmplY3RzW2R1cGxpY2F0ZXNJbmRleGVzW2luZGV4XV0pXG4gIH1cbiAgc3RhdGUudXNlZER1cGxpY2F0ZXMgPSBuZXcgQXJyYXkobGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBpbnNwZWN0Tm9kZSAob2JqZWN0LCBvYmplY3RzLCBkdXBsaWNhdGVzSW5kZXhlcykge1xuICBpZiAob2JqZWN0ICE9PSBudWxsICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnKSB7XG4gICAgY29uc3QgaW5kZXggPSBvYmplY3RzLmluZGV4T2Yob2JqZWN0KVxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIGlmIChkdXBsaWNhdGVzSW5kZXhlcy5pbmRleE9mKGluZGV4KSA9PT0gLTEpIHtcbiAgICAgICAgZHVwbGljYXRlc0luZGV4ZXMucHVzaChpbmRleClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgb2JqZWN0cy5wdXNoKG9iamVjdClcblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0KSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgaW5zcGVjdE5vZGUob2JqZWN0W2ldLCBvYmplY3RzLCBkdXBsaWNhdGVzSW5kZXhlcylcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgb2JqZWN0S2V5TGlzdCA9IE9iamVjdC5rZXlzKG9iamVjdClcblxuICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0gb2JqZWN0S2V5TGlzdC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgIGluc3BlY3ROb2RlKG9iamVjdFtvYmplY3RLZXlMaXN0W2ldXSwgb2JqZWN0cywgZHVwbGljYXRlc0luZGV4ZXMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZHVtcCAoaW5wdXQsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cblxuICBjb25zdCBzdGF0ZSA9IG5ldyBTdGF0ZShvcHRpb25zKVxuXG4gIGlmICghc3RhdGUubm9SZWZzKSBnZXREdXBsaWNhdGVSZWZlcmVuY2VzKGlucHV0LCBzdGF0ZSlcblxuICBsZXQgdmFsdWUgPSBpbnB1dFxuXG4gIGlmIChzdGF0ZS5yZXBsYWNlcikge1xuICAgIHZhbHVlID0gc3RhdGUucmVwbGFjZXIuY2FsbCh7ICcnOiB2YWx1ZSB9LCAnJywgdmFsdWUpXG4gIH1cblxuICBpZiAod3JpdGVOb2RlKHN0YXRlLCAwLCB2YWx1ZSwgdHJ1ZSwgdHJ1ZSkpIHJldHVybiBzdGF0ZS5kdW1wICsgJ1xcbidcblxuICByZXR1cm4gJydcbn1cblxubW9kdWxlLmV4cG9ydHMuZHVtcCA9IGR1bXBcbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgbG9hZGVyID0gcmVxdWlyZSgnLi9saWIvbG9hZGVyJylcbmNvbnN0IGR1bXBlciA9IHJlcXVpcmUoJy4vbGliL2R1bXBlcicpXG5cbmZ1bmN0aW9uIHJlbmFtZWQgKGZyb20sIHRvKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdGdW5jdGlvbiB5YW1sLicgKyBmcm9tICsgJyBpcyByZW1vdmVkIGluIGpzLXlhbWwgNC4gJyArXG4gICAgICAnVXNlIHlhbWwuJyArIHRvICsgJyBpbnN0ZWFkLCB3aGljaCBpcyBub3cgc2FmZSBieSBkZWZhdWx0LicpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMuVHlwZSA9IHJlcXVpcmUoJy4vbGliL3R5cGUnKVxubW9kdWxlLmV4cG9ydHMuU2NoZW1hID0gcmVxdWlyZSgnLi9saWIvc2NoZW1hJylcbm1vZHVsZS5leHBvcnRzLkZBSUxTQUZFX1NDSEVNQSA9IHJlcXVpcmUoJy4vbGliL3NjaGVtYS9mYWlsc2FmZScpXG5tb2R1bGUuZXhwb3J0cy5KU09OX1NDSEVNQSA9IHJlcXVpcmUoJy4vbGliL3NjaGVtYS9qc29uJylcbm1vZHVsZS5leHBvcnRzLkNPUkVfU0NIRU1BID0gcmVxdWlyZSgnLi9saWIvc2NoZW1hL2NvcmUnKVxubW9kdWxlLmV4cG9ydHMuREVGQVVMVF9TQ0hFTUEgPSByZXF1aXJlKCcuL2xpYi9zY2hlbWEvZGVmYXVsdCcpXG5tb2R1bGUuZXhwb3J0cy5sb2FkID0gbG9hZGVyLmxvYWRcbm1vZHVsZS5leHBvcnRzLmxvYWRBbGwgPSBsb2FkZXIubG9hZEFsbFxubW9kdWxlLmV4cG9ydHMuZHVtcCA9IGR1bXBlci5kdW1wXG5tb2R1bGUuZXhwb3J0cy5ZQU1MRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9saWIvZXhjZXB0aW9uJylcblxuLy8gUmUtZXhwb3J0IGFsbCB0eXBlcyBpbiBjYXNlIHVzZXIgd2FudHMgdG8gY3JlYXRlIGN1c3RvbSBzY2hlbWFcbm1vZHVsZS5leHBvcnRzLnR5cGVzID0ge1xuICBiaW5hcnk6IHJlcXVpcmUoJy4vbGliL3R5cGUvYmluYXJ5JyksXG4gIGZsb2F0OiByZXF1aXJlKCcuL2xpYi90eXBlL2Zsb2F0JyksXG4gIG1hcDogcmVxdWlyZSgnLi9saWIvdHlwZS9tYXAnKSxcbiAgbnVsbDogcmVxdWlyZSgnLi9saWIvdHlwZS9udWxsJyksXG4gIHBhaXJzOiByZXF1aXJlKCcuL2xpYi90eXBlL3BhaXJzJyksXG4gIHNldDogcmVxdWlyZSgnLi9saWIvdHlwZS9zZXQnKSxcbiAgdGltZXN0YW1wOiByZXF1aXJlKCcuL2xpYi90eXBlL3RpbWVzdGFtcCcpLFxuICBib29sOiByZXF1aXJlKCcuL2xpYi90eXBlL2Jvb2wnKSxcbiAgaW50OiByZXF1aXJlKCcuL2xpYi90eXBlL2ludCcpLFxuICBtZXJnZTogcmVxdWlyZSgnLi9saWIvdHlwZS9tZXJnZScpLFxuICBvbWFwOiByZXF1aXJlKCcuL2xpYi90eXBlL29tYXAnKSxcbiAgc2VxOiByZXF1aXJlKCcuL2xpYi90eXBlL3NlcScpLFxuICBzdHI6IHJlcXVpcmUoJy4vbGliL3R5cGUvc3RyJylcbn1cblxuLy8gUmVtb3ZlZCBmdW5jdGlvbnMgZnJvbSBKUy1ZQU1MIDMuMC54XG5tb2R1bGUuZXhwb3J0cy5zYWZlTG9hZCA9IHJlbmFtZWQoJ3NhZmVMb2FkJywgJ2xvYWQnKVxubW9kdWxlLmV4cG9ydHMuc2FmZUxvYWRBbGwgPSByZW5hbWVkKCdzYWZlTG9hZEFsbCcsICdsb2FkQWxsJylcbm1vZHVsZS5leHBvcnRzLnNhZmVEdW1wID0gcmVuYW1lZCgnc2FmZUR1bXAnLCAnZHVtcCcpXG4iLCAiaW1wb3J0IHlhbWwgZnJvbSAnLi4vaW5kZXguanMnXG5cbmNvbnN0IHtcbiAgVHlwZSxcbiAgU2NoZW1hLFxuICBGQUlMU0FGRV9TQ0hFTUEsXG4gIEpTT05fU0NIRU1BLFxuICBDT1JFX1NDSEVNQSxcbiAgREVGQVVMVF9TQ0hFTUEsXG4gIGxvYWQsXG4gIGxvYWRBbGwsXG4gIGR1bXAsXG4gIFlBTUxFeGNlcHRpb24sXG4gIHR5cGVzLFxuICBzYWZlTG9hZCxcbiAgc2FmZUxvYWRBbGwsXG4gIHNhZmVEdW1wXG59ID0geWFtbFxuXG5leHBvcnQge1xuICBUeXBlLFxuICBTY2hlbWEsXG4gIEZBSUxTQUZFX1NDSEVNQSxcbiAgSlNPTl9TQ0hFTUEsXG4gIENPUkVfU0NIRU1BLFxuICBERUZBVUxUX1NDSEVNQSxcbiAgbG9hZCxcbiAgbG9hZEFsbCxcbiAgZHVtcCxcbiAgWUFNTEV4Y2VwdGlvbixcbiAgdHlwZXMsXG4gIHNhZmVMb2FkLFxuICBzYWZlTG9hZEFsbCxcbiAgc2FmZUR1bXBcbn1cblxuZXhwb3J0IGRlZmF1bHQgeWFtbFxuIiwgIi8qKlxuICogWUFNTCBmcm9udG1hdHRlciBcdTg5RTNcdTY3OTAvXHU1RThGXHU1MjE3XHU1MzE2XHUzMDAyXHU0RjlEXHU2MzZFIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYFx1MzAwMlxuICpcbiAqIC0gXHU3NTI4IGpzLXlhbWwgXHU1OTA0XHU3NDA2XHU0RTJEXHU2NTg3XHU1QjU3XHU2QkI1XHU1NDBEXHVGRjA4anMteWFtbCBcdTUzOUZcdTc1MUZcdTY1MkZcdTYzMDEgVW5pY29kZSBrZXlcdUZGMDlcbiAqIC0gXHU4OUUzXHU2NzkwXHU2NUY2XHU0RkREXHU3NTU5XHU2Q0U4XHU5MUNBXHU5ODdBXHU1RThGXHVGRjA4anMteWFtbCBcdTRFMERcdTRGRERcdTc1NTlcdUZGMENcdTRGNDZcdTYyMTFcdTRFRUNcdTc1MjhcdTU2RkFcdTVCOUFcdTVCNTdcdTZCQjVcdTY2MjBcdTVDMDRcdTkxQ0RcdTVFRkFcdUZGMDlcbiAqIC0gXHU1RThGXHU1MjE3XHU1MzE2XHU2NUY2XHU2MzA5XHU4OUM0XHU4MzAzXHU5ODdBXHU1RThGXHU4RjkzXHU1MUZBXHVGRjA4XHU1NDBDXHU2QjY1XHU3RUQxXHU1QjlBXHUyMTkyXHU2ODA3XHU3QjdFXHUyMTkyXHU3RjE2XHU3ODAxXHUyMTkyXHU4RjkzXHU1MTY1XHUyMTkyXHU2NUU1XHU2NzFGXHUyMTkyXHU1MTczXHU5NTJFXHU4QkNEXHUyMTkyXHU4QkM0XHU1MjA2XHUyMTkyXHU3RDIyXHU1RjE1XHVGRjA5XG4gKi9cbmltcG9ydCAqIGFzIFlBTUwgZnJvbSAnanMteWFtbCc7XG5cbi8qKiBmcm9udG1hdHRlciBcdTUyMDZcdTk2OTRcdTdCMjZcdTMwMDIgKi9cbmNvbnN0IEZNX0RFTElNSVRFUiA9ICctLS0nO1xuXG4vKiogZnJvbnRtYXR0ZXIgXHU4RjkzXHU1MUZBXHU2NUY2XHU3Njg0XHU1QjU3XHU2QkI1XHU5ODdBXHU1RThGXHUzMDAyXHU0RjlEXHU2MzZFIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTRFMDBcdTZBMjFcdTY3N0ZcdTMwMDIgKi9cbmNvbnN0IEZJRUxEX09SREVSOiAoa2V5b2YgaW1wb3J0KCcuL3R5cGVzJykuWUFNTEZyb250bWF0dGVyKVtdID0gW1xuICAnZmVpc2h1X2lkJyxcbiAgJ2ZlaXNodV9kb2NfaWQnLFxuICAnZmVpc2h1X3RpdGxlJyxcbiAgJ3N5bmNfaGFzaCcsXG4gICdzeW5jX3RpbWUnLFxuICAnXHU2ODA3XHU3QjdFJyxcbiAgJ1x1N0YxNlx1NzgwMScsXG4gICdcdThGOTNcdTUxNjUnLFxuICAnXHU2NUU1XHU2NzFGJyxcbiAgJ1x1NjVFNVx1NjcxRlx1N0QyMlx1NUYxNScsXG4gICdcdTUxNzNcdTk1MkVcdThCQ0QnLFxuICAnXHU2OTgyXHU4RkYwJyxcbiAgJ1x1OEJDNFx1NTIwNicsXG4gICdcdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBJyxcbiAgJ1x1N0QyMlx1NUYxNV9cdTc3RTVcdThCQzZcdTVFOTMnLFxuICAnXHU3RDIyXHU1RjE1X1x1OTg5Q1x1ODI3MicsXG4gICdcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OCcsXG4gICdcdTdEMjJcdTVGMTVfXHU1NzU3JyxcbiAgJ1x1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2NjknLFxuXTtcblxuLyoqIFx1N0E3QVx1NTAzQ1x1OERGM1x1OEZDN1x1OTZDNlx1NTQwOFx1RkYxQVx1NEVDNVx1OERGM1x1OEZDN1x1NjcyQVx1OEJCRVx1N0Y2RVx1RkYxQlx1N0E3QVx1NUI1N1x1N0IyNlx1NEUzMi9cdTdBN0FcdTY1NzBcdTdFQzRcdTc1MjhcdTRFOEVcdTg5QzRcdTgzMDNcdTVCNTdcdTZCQjVcdTUzNjBcdTRGNERcdTMwMDIgKi9cbmZ1bmN0aW9uIGlzRW1wdHkodjogdW5rbm93bik6IGJvb2xlYW4ge1xuICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IG51bGwpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogXHU1QzA2IGZyb250bWF0dGVyIFx1NUJGOVx1OEM2MVx1NUU4Rlx1NTIxN1x1NTMxNlx1NEUzQSBZQU1MIFx1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOFx1NTQyQiBgLS0tYCBcdTUyMDZcdTk2OTRcdTdCMjZcdUZGMDlcdTMwMDJcbiAqIFx1NjMwOVx1ODlDNFx1ODMwM1x1OTg3QVx1NUU4Rlx1OEY5M1x1NTFGQVx1RkYwQ1x1OERGM1x1OEZDN1x1N0E3QVx1NTAzQ1x1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplRnJvbnRtYXR0ZXIoZm06IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogc3RyaW5nIHtcbiAgY29uc3Qgb3JkZXJlZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcbiAgZm9yIChjb25zdCBrZXkgb2YgRklFTERfT1JERVIpIHtcbiAgICBpZiAoIWlzRW1wdHkoZm1ba2V5XSkpIHtcbiAgICAgIG9yZGVyZWRba2V5IGFzIHN0cmluZ10gPSBmbVtrZXldO1xuICAgIH1cbiAgfVxuICAvLyBcdTY1MzZcdTVDM0VcdUZGMUFcdTUzRUZcdTgwRkRcdTY3MDlcdTU5MUFcdTRGNTlcdTVCNTdcdTZCQjVcdTRFMERcdTU3MjggRklFTERfT1JERVIgXHU5MUNDXHVGRjA4XHU1NDExXHU1NDBFXHU1MTdDXHU1QkI5XHVGRjA5XG4gIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKGZtKSkge1xuICAgIGlmICghKGsgaW4gb3JkZXJlZCkgJiYgIWlzRW1wdHkodikpIHtcbiAgICAgIG9yZGVyZWRba10gPSB2O1xuICAgIH1cbiAgfVxuICBjb25zdCB5YW1sU3RyID0gWUFNTC5kdW1wKG9yZGVyZWQsIHtcbiAgICBsaW5lV2lkdGg6IC0xLCAgICAgICAgICAgLy8gXHU0RTBEXHU2Mjk4XHU4ODRDXHVGRjA4XHU4ODY4XHU2ODNDXHU3QjQ5XHU5NTdGXHU4ODRDXHU0RTBEXHU3ODM0XHU1NzRGXHVGRjA5XG4gICAgcXVvdGluZ1R5cGU6ICdcIicsICAgICAgICAvLyBcdTVCNTdcdTdCMjZcdTRFMzJcdTc1MjhcdTUzQ0NcdTVGMTVcdTUzRjdcdUZGMDhcdTRGRERcdTc1NTkgZW1vamlcdUZGMDlcbiAgICBmb3JjZVF1b3RlczogZmFsc2UsXG4gICAgc29ydEtleXM6IGZhbHNlLCAgICAgICAgIC8vIFx1NjIxMVx1NEVFQ1x1ODFFQVx1NURGMVx1NjNBN1x1NTIzNlx1OTg3QVx1NUU4RlxuICB9KSBhcyBzdHJpbmc7XG4gIHJldHVybiBgJHtGTV9ERUxJTUlURVJ9XFxuJHt5YW1sU3RyfSR7Rk1fREVMSU1JVEVSfWA7XG59XG5cbi8qKlxuICogXHU0RUNFIG1kIFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVx1ODlFM1x1Njc5MCBmcm9udG1hdHRlclx1MzAwMlxuICogQHBhcmFtIGNvbnRlbnQgXHU1QjhDXHU2NTc0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XG4gKiBAcmV0dXJucyB7IGZyb250bWF0dGVyLCBib2R5IH1cdUZGMENmcm9udG1hdHRlciBcdTRFM0EgbnVsbCBcdTg4NjhcdTc5M0FcdTY1RTAgZnJvbnRtYXR0ZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRnJvbnRtYXR0ZXIoY29udGVudDogc3RyaW5nKToge1xuICBmcm9udG1hdHRlcjogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsO1xuICBib2R5OiBzdHJpbmc7XG59IHtcbiAgY29uc3QgdHJpbW1lZCA9IGNvbnRlbnQudHJpbVN0YXJ0KCk7XG4gIGlmICghdHJpbW1lZC5zdGFydHNXaXRoKEZNX0RFTElNSVRFUikpIHtcbiAgICByZXR1cm4geyBmcm9udG1hdHRlcjogbnVsbCwgYm9keTogY29udGVudCB9O1xuICB9XG4gIC8vIFx1NjI3RVx1N0IyQ1x1NEU4Q1x1NEUyQSAtLS1cbiAgY29uc3QgcmVzdCA9IHRyaW1tZWQuc2xpY2UoRk1fREVMSU1JVEVSLmxlbmd0aCk7XG4gIGNvbnN0IHNlY29uZERlbGltID0gcmVzdC5pbmRleE9mKCdcXG4nICsgRk1fREVMSU1JVEVSKTtcbiAgaWYgKHNlY29uZERlbGltID09PSAtMSkge1xuICAgIHJldHVybiB7IGZyb250bWF0dGVyOiBudWxsLCBib2R5OiBjb250ZW50IH07XG4gIH1cbiAgY29uc3QgeWFtbEJsb2NrID0gcmVzdC5zbGljZSgwLCBzZWNvbmREZWxpbSk7XG4gIGNvbnN0IGJvZHkgPSByZXN0LnNsaWNlKHNlY29uZERlbGltICsgRk1fREVMSU1JVEVSLmxlbmd0aCArIDEpLnJlcGxhY2UoL15cXG4rLywgJycpO1xuICB0cnkge1xuICAgIGNvbnN0IGZtID0gWUFNTC5sb2FkKHlhbWxCbG9jaykgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgcmV0dXJuIHsgZnJvbnRtYXR0ZXI6IGZtID8/IHt9LCBib2R5IH07XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBZQU1MIFx1ODlFM1x1Njc5MFx1NTkzMVx1OEQyNVx1RkYxQVx1ODlDNlx1NEUzQVx1NjVFMCBmcm9udG1hdHRlclxuICAgIGNvbnNvbGUud2FybignW3N5bmMvc2hhcmVkXSBmcm9udG1hdHRlciBwYXJzZSBmYWlsZWQ6JywgZSk7XG4gICAgcmV0dXJuIHsgZnJvbnRtYXR0ZXI6IG51bGwsIGJvZHk6IGNvbnRlbnQgfTtcbiAgfVxufVxuXG4vKipcbiAqIFx1NUMwNiBmcm9udG1hdHRlciArIGJvZHkgXHU2MkZDXHU2MjEwXHU1QjhDXHU2NTc0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlbWJsZUZpbGUoXG4gIGZtOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbiAgYm9keTogc3RyaW5nLFxuKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3NlcmlhbGl6ZUZyb250bWF0dGVyKGZtKX1cXG5cXG4ke2JvZHl9YDtcbn1cbiIsICIvKipcbiAqIFlBTUwgXHUyMTk0IFx1OThERVx1NEU2NiBjYWxsb3V0IFx1NTNDQ1x1NTQxMVx1OEY2Q1x1NjM2Mlx1MzAwMlxuICpcbiAqIFx1NEY5RFx1NjM2RVx1RkYxQVxuICogLSBgMDNfXHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzXHU0RTBFT0JcdTY2MjBcdTVDMDQubWRgIFx1MDBBN1x1NEUwOVx1RkYwOGNhbGxvdXQgXHU5ODlDXHU4MjcyXHU2NjIwXHU1QzA0XHVGRjA5XG4gKiAtIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTRFOTRcdUZGMDhZQU1MXHUyMTkyY2FsbG91dCBcdTY2MjBcdTVDMDRcdTg4NjhcdUZGMDlcbiAqIC0gXHUwMEE3XHU1NkRCXHVGRjA4XHU1NDA4XHU1RTc2XHU0RkUxXHU2MDZGXHU1NzU3XHU4QkJFXHU4QkExXHVGRjFBXHU2MjQwXHU2NzA5XHU1QjU3XHU2QkI1XHU4RkRCXHU0RTAwXHU0RTJBIGNhbGxvdXRcdUZGMDlcbiAqXG4gKiBcdTVERjJcdTc3RTVcdTU3NTFcdUZGMDgwMyBcdTY1ODdcdTY4NjMgXHUwMEE3XHU1MzQxICsgXHUwMEE3My4zXHVGRjA5XHVGRjFBXG4gKiAtIGVtb2ppIFx1NUUyNiBVK0ZFMEYgdmFyaWF0aW9uIHNlbGVjdG9yIFx1OThERVx1NEU2Nlx1NEUwRFx1OEJBNCBcdTIxOTIgXHU1MTk5XHU1MTY1XHU1MjREIHN0cmlwXG4gKiAtIGB+YCBcdTg4QUJcdTk4REVcdTRFNjZcdThGNkNcdTRFNDlcdTYyMTAgYFxcfmAgXHUyMTkyIFx1NTZERVx1OEJGQlx1NjVGNlx1NTNDRFx1OEY2Q1x1NEU0OVxuICovXG5cbmltcG9ydCB0eXBlIHsgS25vd2xlZGdlTWV0YSwgVGFnIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQge1xuICBDQUxMT1VUX0ZJRUxEX01BUCxcbiAgVEFHX05BTUVTLFxuICBET0NfSU5GT19DQUxMT1VULFxuICBPQl9DQUxMT1VUX1RPX0ZFSVNIVSxcbiAgRkVJU0hVX0JHX1RPX09CX0NBTExPVVQsXG59IGZyb20gJy4vdHlwZXMuanMnO1xuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgZW1vamkgXHU2RTA1XHU2RDE3IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKiogXHU3OUZCXHU5NjY0IGVtb2ppIFx1NzY4NCBVK0ZFMEYgdmFyaWF0aW9uIHNlbGVjdG9yXHUzMDAyXHU5OERFXHU0RTY2XHU0RTBEXHU4QkE0XHU1RTI2IFZTIFx1NzY4NCBlbW9qaVx1RkYwODAzIFx1NjU4N1x1Njg2MyBcdTAwQTczLjNcdUZGMDlcdTMwMDIgKi9cbmNvbnN0IFZTX1JFID0gL1xcdUZFMEYvZ3U7XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhzOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcy5yZXBsYWNlKFZTX1JFLCAnJyk7XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTZDRTJcdTZENkFcdTUzRjdcdThGNkNcdTRFNDkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKiBcdTk4REVcdTRFNjYgbWQgXHU2MjhBIGB+YCBcdThGNkNcdTRFNDlcdTYyMTAgYFxcfmBcdUZGMENcdTU2REVcdThCRkJcdTY1RjZcdTUzQ0RcdTU0MTFcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiB1bmVzY2FwZUZlaXNodVRpbGRlKHM6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzLnJlcGxhY2UoL1xcXFx+L2csICd+Jyk7XG59XG5cbi8qKiBcdTUxOTlcdTUxNjVcdTk4REVcdTRFNjZcdTUyNERcdTUzQ0RcdThGNkNcdTRFNDlcdUZGMDhcdTU5ODJcdTY3OUNcdTc1MjhcdTYyMzdcdTYwRjNcdTc1MjggYH5gIFx1NTIyMFx1OTY2NFx1N0VCRlx1RkYwOVx1MzAwMlx1OThERVx1NEU2NiBtZCBcdTkxQ0MgYH5+fnRleHR+fn5gIFx1NjYyRlx1NTIyMFx1OTY2NFx1N0VCRlx1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVzY2FwZUZlaXNodVRpbGRlKHM6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIFx1NEUwRFx1NEUzQlx1NTJBOFx1OEY2Q1x1NEU0OVx1RkYwQ1x1NEZERFx1NjMwMVx1NTM5Rlx1NjgzN1x1MzAwMlx1NEVDNVx1NTcyOCBvdmVyd3JpdGUgXHU1NzNBXHU2NjZGXHU3ODZFXHU4QkE0XHU5NzAwXHU4OTgxXHU2NUY2XHU2MjRCXHU1MkE4XHU1OTA0XHU3NDA2XHUzMDAyXG4gIHJldHVybiBzO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU2ODA3XHU3QjdFXHU1MDNDXHU2ODNDXHU1RjBGXHU1MzE2IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG5mdW5jdGlvbiBmb3JtYXRUYWdWYWx1ZSh0YWc6IFRhZyB8IHVuZGVmaW5lZCk6IHN0cmluZyB7XG4gIGlmICghdGFnKSByZXR1cm4gJyc7XG4gIHJldHVybiBgJHtUQUdfTkFNRVNbdGFnXX0gJHt0YWd9YDtcbn1cblxuZnVuY3Rpb24gcGFyc2VUYWdWYWx1ZSh2YWx1ZTogc3RyaW5nKTogVGFnIHwgbnVsbCB7XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyh2YWx1ZSkudHJpbSgpO1xuICBjb25zdCBkaXJlY3QgPSBub3JtYWxpemVkLm1hdGNoKC8oPzpefFxccykoW1NYTFpRSl0pKD86XFxzfCQpLyk7XG4gIGNvbnN0IGNvbXBhY3QgPSBub3JtYWxpemVkLm1hdGNoKC9bU1hMWlFKXS8pO1xuICBjb25zdCB0YWcgPSAoZGlyZWN0Py5bMV0gPz8gY29tcGFjdD8uWzBdKSBhcyBUYWcgfCB1bmRlZmluZWQ7XG4gIHJldHVybiB0YWcgJiYgWydTJywgJ1gnLCAnTCcsICdaJywgJ1EnLCAnSiddLmluY2x1ZGVzKHRhZykgPyB0YWcgOiBudWxsO1xufVxuXG5mdW5jdGlvbiBtYXBGZWlzaHVCZ1RvT2JUeXBlKGJnQ29sb3I6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICghYmdDb2xvcikgcmV0dXJuICd0aXAnO1xuICBpZiAoRkVJU0hVX0JHX1RPX09CX0NBTExPVVRbYmdDb2xvcl0pIHJldHVybiBGRUlTSFVfQkdfVE9fT0JfQ0FMTE9VVFtiZ0NvbG9yXTtcbiAgY29uc3Qgbm9ybWFsaXplZCA9IGJnQ29sb3IucmVwbGFjZSgvXFxzKy9nLCAnJykudG9Mb3dlckNhc2UoKTtcbiAgY29uc3QgcmdiTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICdyZ2IoMjU1LDI0NSwyMzUpJzogJ3RpcCcsXG4gICAgJ3JnYigyNTQsMjEyLDE2NCknOiAndGlwJyxcbiAgICAncmdiYSgyNTUsMjQ2LDEyMiwwLjgpJzogJ3RpcCcsXG4gICAgJ3JnYigyNTUsMjQwLDI0MCknOiAnd2FybmluZycsXG4gICAgJ3JnYigyNDIsMjQzLDI0NSknOiAncXVvdGUnLFxuICAgICdyZ2IoMjQwLDI0NCwyNTUpJzogJ2luZm8nLFxuICAgICdyZ2IoMjQwLDI1MywyNDQpJzogJ3N1Y2Nlc3MnLFxuICB9O1xuICByZXR1cm4gcmdiTWFwW25vcm1hbGl6ZWRdID8/ICdhYnN0cmFjdCc7XG59XG5cbmZ1bmN0aW9uIGh0bWxCbG9ja1RvVGV4dExpbmVzKGh0bWw6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IGJsb2NrUmUgPSAvPCg/OnB8bGkpXFxiW14+XSo+KFtcXHNcXFNdKj8pPFxcLyg/OnB8bGkpPi9nO1xuICBsZXQgbTogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcbiAgd2hpbGUgKChtID0gYmxvY2tSZS5leGVjKGh0bWwpKSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IHRleHQgPSBodG1sVG9QbGFpblRleHQobVsxXSk7XG4gICAgaWYgKHRleHQpIGxpbmVzLnB1c2goLi4udGV4dC5zcGxpdCgnXFxuJykubWFwKGxpbmUgPT4gbGluZS50cmltKCkpLmZpbHRlcihCb29sZWFuKSk7XG4gIH1cbiAgaWYgKGxpbmVzLmxlbmd0aCA+IDApIHJldHVybiBsaW5lcztcbiAgY29uc3QgZmFsbGJhY2sgPSBodG1sVG9QbGFpblRleHQoaHRtbCk7XG4gIHJldHVybiBmYWxsYmFjayA/IGZhbGxiYWNrLnNwbGl0KCdcXG4nKS5tYXAobGluZSA9PiBsaW5lLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pIDogW107XG59XG5cbmZ1bmN0aW9uIGh0bWxUb1BsYWluVGV4dChodG1sOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gaHRtbFxuICAgIC5yZXBsYWNlKC88YnJcXHMqXFwvPz4vZywgJ1xcbicpXG4gICAgLnJlcGxhY2UoLzxbXj5dKz4vZywgJycpXG4gICAgLnJlcGxhY2UoLyZsdDsvZywgJzwnKVxuICAgIC5yZXBsYWNlKC8mZ3Q7L2csICc+JylcbiAgICAucmVwbGFjZSgvJmFtcDsvZywgJyYnKVxuICAgIC5yZXBsYWNlKC8mcXVvdDsvZywgJ1wiJylcbiAgICAucmVwbGFjZSgvJmFwb3M7L2csIFwiJ1wiKVxuICAgIC50cmltKCk7XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBPQlx1MjE5Mlx1OThERVx1NEU2Nlx1RkYxQVlBTUxcdTIxOTJcdTU0MDhcdTVFNzZcdTRGRTFcdTYwNkYgY2FsbG91dCBYTUwgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKlxuICogXHU1QzA2IE9CIFx1NzY4NCBZQU1MIFx1NTE0M1x1NjU3MFx1NjM2RVx1NUI1N1x1NkJCNVx1NkUzMlx1NjdEM1x1NEUzQVx1OThERVx1NEU2Nlx1NTQwOFx1NUU3Nlx1NEZFMVx1NjA2RiBjYWxsb3V0IFhNTFx1MzAwMlxuICogXHU0RjlEXHU2MzZFIGAwM19cdTY4M0NcdTVGMEZcdTg5QzRcdTgzMDMubWRgIFx1MDBBN1x1NTZEQlx1RkYwOFx1NTQwOFx1NUU3Nlx1OEZEQlx1NEUwMFx1NEUyQSBjYWxsb3V0IFx1OUFEOFx1NEVBRVx1NTc1N1x1RkYwOVx1MzAwMlxuICpcbiAqIEBwYXJhbSBtZXRhIFx1NzdFNVx1OEJDNlx1NUU5M1x1NTE0M1x1NjU3MFx1NjM2RVxuICogQHJldHVybnMgY2FsbG91dCBYTUwgXHU1QjU3XHU3QjI2XHU0RTMyXHVGRjA4XHU1NDJCIHN0cmlwIFZTXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXRhVG9DYWxsb3V0WG1sKG1ldGE6IEtub3dsZWRnZU1ldGEpOiBzdHJpbmcge1xuICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXTtcblxuICBmb3IgKGNvbnN0IGl0ZW0gb2YgQ0FMTE9VVF9GSUVMRF9NQVApIHtcbiAgICBjb25zdCByYXcgPSBtZXRhW2l0ZW0uZmllbGRdO1xuICAgIGlmIChyYXcgPT09IHVuZGVmaW5lZCB8fCByYXcgPT09IG51bGwgfHwgcmF3ID09PSAnJyB8fCAoQXJyYXkuaXNBcnJheShyYXcpICYmIHJhdy5sZW5ndGggPT09IDApKSBjb250aW51ZTtcblxuICAgIGxldCB2YWx1ZTogc3RyaW5nO1xuICAgIGlmIChpdGVtLmZpZWxkID09PSAnXHU2ODA3XHU3QjdFJykge1xuICAgICAgdmFsdWUgPSBmb3JtYXRUYWdWYWx1ZShyYXcgYXMgVGFnIHwgdW5kZWZpbmVkKTtcbiAgICB9IGVsc2UgaWYgKGl0ZW0uZmllbGQgPT09ICdcdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBJykge1xuICAgICAgdmFsdWUgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhTdHJpbmcocmF3KSk7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJhdykpIHtcbiAgICAgIHZhbHVlID0gKHJhdyBhcyBzdHJpbmdbXSkuam9pbignIFx1MDBCNyAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhTdHJpbmcocmF3KSk7XG4gICAgfVxuICAgIGlmICghdmFsdWUpIGNvbnRpbnVlO1xuXG4gICAgbGluZXMucHVzaChgPGxpPjxiPiR7aXRlbS5sYWJlbH08L2I+XHVGRjFBJHt2YWx1ZX08L2xpPmApO1xuICB9XG5cbiAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcnO1xuXG4gIGNvbnN0IHsgZW1vamksIC4uLmF0dHJzIH0gPSBET0NfSU5GT19DQUxMT1VUO1xuICBjb25zdCBhdHRyU3RyID0gT2JqZWN0LmVudHJpZXMoYXR0cnMpXG4gICAgLm1hcCgoW2ssIHZdKSA9PiBgJHtrfT1cIiR7dn1cImApXG4gICAgLmpvaW4oJyAnKTtcbiAgY29uc3QgY2xlYW5FbW9qaSA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKGVtb2ppKTtcblxuICByZXR1cm4gW1xuICAgIGA8Y2FsbG91dCBlbW9qaT1cIiR7Y2xlYW5FbW9qaX1cIiAke2F0dHJTdHJ9PmAsXG4gICAgYDxwPjxiPlx1NjU4N1x1Njg2M1x1NEZFMVx1NjA2RjwvYj48L3A+YCxcbiAgICBgPHVsPmAsXG4gICAgLi4ubGluZXMsXG4gICAgYDwvdWw+YCxcbiAgICBgPC9jYWxsb3V0PmAsXG4gICAgJycsXG4gIF0uam9pbignXFxuJyk7XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTk4REVcdTRFNjZcdTIxOTJPQlx1RkYxQVx1ODlFM1x1Njc5MFx1NTQwOFx1NUU3Nlx1NEZFMVx1NjA2RiBjYWxsb3V0IFx1MjE5MiBZQU1MIFx1NUI1N1x1NkJCNSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBcdTRFQ0VcdTk4REVcdTRFNjYgWE1MIFx1NzY4NFx1NTkzNFx1OTBFOFx1NEZFMVx1NjA2RiBjYWxsb3V0IFx1NEUyRFx1ODlFM1x1Njc5MFx1NTFGQSBZQU1MIFx1NUI1N1x1NkJCNVx1NTAzQ1x1MzAwMlxuICogXHU0RjlEXHU2MzZFIGAwM19cdTY4M0NcdTVGMEZcdTg5QzRcdTgzMDMubWRgIFx1MDBBN1x1NTZEQlx1RkYxQWA8bGk+PGI+XHU1QjU3XHU2QkI1XHU1NDBEPC9iPlx1RkYxQVx1NTAzQzwvbGk+YCBcdTY4M0NcdTVGMEZcdTMwMDJcbiAqXG4gKiBAcGFyYW0geG1sIFx1OThERVx1NEU2Nlx1NjU4N1x1Njg2MyBYTUwgXHU3MjQ3XHU2QkI1XG4gKiBAcmV0dXJucyBcdTg5RTNcdTY3OTBcdTUyMzBcdTc2ODRcdTUxNDNcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGxvdXRYbWxUb01ldGEoeG1sOiBzdHJpbmcpOiBQYXJ0aWFsPEtub3dsZWRnZU1ldGE+IHtcbiAgY29uc3QgcmVzdWx0OiBQYXJ0aWFsPEtub3dsZWRnZU1ldGE+ID0ge307XG5cbiAgLy8gXHU2MjdFXCJcdTY1ODdcdTY4NjNcdTRGRTFcdTYwNkZcImNhbGxvdXRcbiAgY29uc3QgY2FsbG91dFJlID0gLzxjYWxsb3V0XFxiW14+XSo+XFxzKjxwPjxiPlx1NjU4N1x1Njg2M1x1NEZFMVx1NjA2RjxcXC9iPjxcXC9wPlxccyo8dWw+KFtcXHNcXFNdKj8pPFxcL3VsPlxccyo8XFwvY2FsbG91dD4vO1xuICBjb25zdCBjYWxsb3V0TWF0Y2ggPSB4bWwubWF0Y2goY2FsbG91dFJlKTtcbiAgaWYgKCFjYWxsb3V0TWF0Y2gpIHJldHVybiByZXN1bHQ7XG5cbiAgY29uc3QgdWxDb250ZW50ID0gY2FsbG91dE1hdGNoWzFdO1xuICBjb25zdCBsaVJlID0gLzxsaT48Yj4oW148XSspPFxcL2I+W1x1RkYxQTpdKC4rPyk8XFwvbGk+L2c7XG4gIGxldCBtOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuXG4gIHdoaWxlICgobSA9IGxpUmUuZXhlYyh1bENvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGxhYmVsID0gbVsxXS50cmltKCk7XG4gICAgY29uc3QgdmFsdWUgPSB1bmVzY2FwZUZlaXNodVRpbGRlKG1bMl0udHJpbSgpKTtcblxuICAgIC8vIFx1NjgzOVx1NjM2RVx1NjgwN1x1N0I3RVx1NTQwRFx1NjYyMFx1NUMwNFx1NTIzMFx1NUI1N1x1NkJCNVxuICAgIGlmIChsYWJlbCA9PT0gJ1x1NjgwN1x1N0I3RScpIHtcbiAgICAgIGNvbnN0IHRhZyA9IHBhcnNlVGFnVmFsdWUodmFsdWUpO1xuICAgICAgaWYgKHRhZykgcmVzdWx0Llx1NjgwN1x1N0I3RSA9IHRhZztcbiAgICB9IGVsc2UgaWYgKGxhYmVsID09PSAnXHU3RjE2XHU3ODAxJykge1xuICAgICAgcmVzdWx0Llx1N0YxNlx1NzgwMSA9IHZhbHVlLnJlcGxhY2UoL15cdUQ4M0RcdUREMjJcXHMqLywgJycpLnRyaW0oKTtcbiAgICB9IGVsc2UgaWYgKGxhYmVsID09PSAnXHU4RjkzXHU1MTY1Jykge1xuICAgICAgcmVzdWx0Llx1OEY5M1x1NTE2NSA9IHZhbHVlLnJlcGxhY2UoL15cdUQ4M0RcdURDRTVcXHMqLywgJycpLnRyaW0oKTtcbiAgICB9IGVsc2UgaWYgKGxhYmVsID09PSAnXHU2NUU1XHU2NzFGJykge1xuICAgICAgcmVzdWx0Llx1NjVFNVx1NjcxRiA9IHZhbHVlLnJlcGxhY2UoL15cdUQ4M0RcdURDQzVcXHMqLywgJycpLnRyaW0oKTtcbiAgICB9IGVsc2UgaWYgKGxhYmVsID09PSAnXHU1MTczXHU5NTJFXHU4QkNEJykge1xuICAgICAgcmVzdWx0Llx1NTE3M1x1OTUyRVx1OEJDRCA9IHZhbHVlLnJlcGxhY2UoL15cdUQ4M0RcdUREMTFcXHMqLywgJycpLnRyaW0oKTtcbiAgICB9IGVsc2UgaWYgKGxhYmVsID09PSAnXHU4QkM0XHU1MjA2Jykge1xuICAgICAgLy8gXHU2M0QwXHU1M0Q2XHU4QkM0XHU1MjA2XHU2NjNFXHU3OTNBXHU0RTMyXHVGRjA4XHU1OTgyIFwiXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVGRjVDXHU1QjlFXHU4REY1XCJcdUZGMDlcbiAgICAgIHJlc3VsdC5cdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnModmFsdWUpO1xuICAgICAgLy8gXHU1QzFEXHU4QkQ1XHU2M0QwXHU1M0Q2XHU2NTcwXHU1QjU3XG4gICAgICBjb25zdCBzdGFyQ291bnQgPSAodmFsdWUubWF0Y2goL1x1RDgzQ1x1REYxRi9nKSB8fCBbXSkubGVuZ3RoO1xuICAgICAgaWYgKHN0YXJDb3VudCA+PSAxICYmIHN0YXJDb3VudCA8PSA1KSB7XG4gICAgICAgIHJlc3VsdC5cdThCQzRcdTUyMDYgPSBzdGFyQ291bnQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1N0QyMlx1NUYxNScpIHtcbiAgICAgIC8vIFx1N0QyMlx1NUYxNVx1NjYyRlx1NTkxQVx1N0VGNFx1NUVBNlx1NTQwOFx1NUU3Nlx1NjYzRVx1NzkzQVx1RkYwOFx1RDgzRFx1RENCMFx1NkI2M1x1OEQyMiBcdTAwQjcgXHVEODNEXHVERDM1XHU1REU1XHU0RjVDIFx1MDBCNyAuLi5cdUZGMDlcbiAgICAgIC8vIFx1OTcwMFx1ODk4MVx1OEZEQlx1NEUwMFx1NkI2NVx1NjJDNlx1NTIwNlx1NTQwNFx1N0VGNFx1NUVBNlxuICAgICAgcGFyc2VJbmRleEZpZWxkKHZhbHVlLCByZXN1bHQpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogXHU4OUUzXHU2NzkwXHU3RDIyXHU1RjE1XHU1NDA4XHU1RTc2XHU1QjU3XHU2QkI1IFwiXHVEODNEXHVEQ0IwXHU2QjYzXHU4RDIyIFx1MDBCNyBcdUQ4M0RcdUREMzVcdTVERTVcdTRGNUMgXHUwMEI3IFx1MjcwNVx1NUI4Q1x1NjIxMCBcdTAwQjcgXHVEODNDXHVERkFGXHU1MTc3XHU4QzYxIFx1MDBCNyBcdTI3MDVcdTdCODBcdTUzNTUgXHUwMEI3IFx1Mjc2NFx1RkUwRlx1NTA2NVx1NUVCN1wiXG4gKiBcdTU2REVcdTU0MDRcdTdEMjJcdTVGMTVcdTVCNTBcdTVCNTdcdTZCQjVcdTMwMDJcbiAqL1xuZnVuY3Rpb24gcGFyc2VJbmRleEZpZWxkKHZhbHVlOiBzdHJpbmcsIHJlc3VsdDogUGFydGlhbDxLbm93bGVkZ2VNZXRhPik6IHZvaWQge1xuICBjb25zdCBwYXJ0cyA9IHZhbHVlLnNwbGl0KC9bXHUwMEI3XFxuXS8pLm1hcChzID0+IHMudHJpbSgpKS5maWx0ZXIoQm9vbGVhbik7XG4gIGZvciAoY29uc3QgcGFydCBvZiBwYXJ0cykge1xuICAgIGNvbnN0IGNsZWFuZWQgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhwYXJ0KTtcbiAgICAvLyBcdTc3RTVcdThCQzZcdTVFOTNcdTdFRjRcdTVFQTZcbiAgICBmb3IgKGNvbnN0IGt3IG9mIFsnXHU2QjYzXHU4RDIyJywgJ1x1NTA0Rlx1OEQyMicsICdcdTZCNjNcdTUzNzAnLCAnXHU1MDRGXHU1MzcwJywgJ1x1NkI2M1x1NUJBQicsICdcdTRGMjRcdTVCOTgnXSkge1xuICAgICAgaWYgKGNsZWFuZWQuaW5jbHVkZXMoa3cpKSB7IHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU3N0U1XHU4QkM2XHU1RTkzID0ga3c7IGJyZWFrOyB9XG4gICAgfVxuICAgIC8vIFx1OTg5Q1x1ODI3Mlx1N0VGNFx1NUVBNlxuICAgIGZvciAoY29uc3Qga3cgb2YgWydcdTc3NjFcdTc3MjAnLCAnXHU1REU1XHU0RjVDJywgJ1x1NzUxRlx1NkQzQicsICdcdTVBMzFcdTRFNTAnLCAnXHU3OTNFXHU0RUE0JywgJ1x1NUI2Nlx1NEU2MCcsICdcdThGRDBcdTUyQTgnXSkge1xuICAgICAgaWYgKGNsZWFuZWQuaW5jbHVkZXMoa3cpKSB7IHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU5ODlDXHU4MjcyID0gY2xlYW5lZDsgYnJlYWs7IH1cbiAgICB9XG4gICAgLy8gXHU2NENEXHU0RjVDXHU3RUY0XHU1RUE2XG4gICAgZm9yIChjb25zdCBrdyBvZiBbJ1x1NjBGM1x1NkNENScsICdcdTg5QzRcdTUyMTInLCAnXHU2MjY3XHU4ODRDJywgJ1x1NTNEN1x1NjMyQicsICdcdTUxNEJcdTY3MEQnLCAnXHU1MjFEXHU3QTNGJywgJ1x1NUJBMVx1NjgzOCcsICdcdTRGRUVcdTY1MzknLCAnXHU1QjhDXHU2MjEwJywgJ1x1NTkwRFx1NzZEOCddKSB7XG4gICAgICBpZiAoY2xlYW5lZC5pbmNsdWRlcyhrdykpIHtcbiAgICAgICAgcmVzdWx0WydcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OCddID0gcmVzdWx0WydcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OCddID8/IFtdO1xuICAgICAgICBpZiAoIXJlc3VsdFsnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnXS5pbmNsdWRlcyhrdykpIHJlc3VsdFsnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnXS5wdXNoKGt3KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFx1NTc1N1x1N0VGNFx1NUVBNlx1RkYwOFx1NTkxQVx1OTAwOVx1RkYwOVxuICAgIGZvciAoY29uc3Qga3cgb2YgWydcdTYyQkRcdThDNjEnLCAnXHU1MTc3XHU4QzYxJywgJ1x1N0I4MFx1NTM1NScsICdcdTU2RjBcdTk2QkUnXSkge1xuICAgICAgaWYgKGNsZWFuZWQuaW5jbHVkZXMoa3cpICYmIGt3ICE9PSBjbGVhbmVkKSB7XG4gICAgICAgIHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU1NzU3ID0gcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTU3NTcgPz8gW107XG4gICAgICAgIGlmICghcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTU3NTcuaW5jbHVkZXMoa3cpKSByZXN1bHQuXHU3RDIyXHU1RjE1X1x1NTc1Ny5wdXNoKGt3KTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gXHU5OENFXHU5NjY5XHU3RUY0XHU1RUE2XHVGRjA4XHU1OTFBXHU5MDA5XHVGRjA5XG4gICAgZm9yIChjb25zdCBrdyBvZiBbJ1x1ODg0Q1x1NEUzQScsICdcdTdCQTFcdTc0MDYnLCAnXHU1MDY1XHU1RUI3JywgJ1x1NzdFNVx1OEJDNicsICdcdTc5M0VcdTRFQTQnLCAnXHU1QkI2XHU1RUFEJywgJ1x1NzkzRVx1NEYxQScsICdcdTYxMEZcdTU5MTYnXSkge1xuICAgICAgaWYgKGNsZWFuZWQuaW5jbHVkZXMoa3cpICYmIGt3ICE9PSBjbGVhbmVkKSB7XG4gICAgICAgIHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU5OENFXHU5NjY5ID0gcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2NjkgPz8gW107XG4gICAgICAgIGlmICghcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2NjkuaW5jbHVkZXMoa3cpKSByZXN1bHQuXHU3RDIyXHU1RjE1X1x1OThDRVx1OTY2OS5wdXNoKGt3KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIFx1NkI2M1x1NjU4NyBjYWxsb3V0IFx1NTNDQ1x1NTQxMVx1OEY2Q1x1NjM2MiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBcdTk4REVcdTRFNjZcdTZCNjNcdTY1ODcgY2FsbG91dCBYTUwgXHUyMTkyIE9CIGA+IFshdHlwZV1gIGNhbGxvdXRcdTMwMDJcbiAqIFx1NEY5RFx1NjM2RSBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTczLjFcdTMwMDJcbiAqXG4gKiBcdThGOTNcdTUxNjVcdTUzNTVcdTRFMkEgYDxjYWxsb3V0IC4uLj5jb250ZW50PC9jYWxsb3V0PmAgXHU1NzU3XHVGRjBDXHU4RjkzXHU1MUZBIE9CIG1hcmtkb3duIGNhbGxvdXRcdTMwMDJcbiAqIFx1NTkxQVx1NEUyQSBjYWxsb3V0IFx1NTc1N1x1NzUzMVx1OEMwM1x1NzUyOFx1NjVCOVx1NjJDNlx1NTIwNlx1NTQwRVx1OTAxMFx1NEUyQVx1OEMwM1x1NzUyOFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmVpc2h1Q2FsbG91dFRvT0IoeG1sOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBcdTYzRDBcdTUzRDZcdTVDNUVcdTYwMjdcbiAgY29uc3Qgb3Blbk1hdGNoID0geG1sLm1hdGNoKC88Y2FsbG91dFxcYihbXj5dKik+Lyk7XG4gIGlmICghb3Blbk1hdGNoKSByZXR1cm4geG1sO1xuXG4gIGNvbnN0IGF0dHJzID0gb3Blbk1hdGNoWzFdO1xuICBsZXQgZW1vamkgPSAnJztcbiAgbGV0IGJnQ29sb3IgPSAnJztcblxuICBjb25zdCBlbW9qaU1hdGNoID0gYXR0cnMubWF0Y2goL2Vtb2ppPVtcIiddKFteXCInXSspW1wiJ10vKTtcbiAgaWYgKGVtb2ppTWF0Y2gpIGVtb2ppID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMoZW1vamlNYXRjaFsxXSk7XG5cbiAgY29uc3QgYmdNYXRjaCA9IGF0dHJzLm1hdGNoKC9iYWNrZ3JvdW5kLWNvbG9yPVtcIiddKFteXCInXSspW1wiJ10vKTtcbiAgaWYgKGJnTWF0Y2gpIGJnQ29sb3IgPSBiZ01hdGNoWzFdO1xuXG4gIC8vIFx1NjNEMFx1NTNENlx1NTE4NVx1NUJCOVx1RkYwOFx1NTNCQlx1NjM4OSBvcGVuL2Nsb3NlIHRhZ1x1RkYwOVxuICBjb25zdCBjb250ZW50ID0geG1sXG4gICAgLnJlcGxhY2UoLzxjYWxsb3V0XFxiW14+XSo+LywgJycpXG4gICAgLnJlcGxhY2UoLzxcXC9jYWxsb3V0Pi8sICcnKVxuICAgIC50cmltKCk7XG5cbiAgLy8gXHU2NjIwXHU1QzA0IGNhbGxvdXQgXHU3QzdCXHU1NzhCXG4gIGNvbnN0IG9iVHlwZSA9IG1hcEZlaXNodUJnVG9PYlR5cGUoYmdDb2xvcik7XG4gIGNvbnN0IGxpbmVzID0gaHRtbEJsb2NrVG9UZXh0TGluZXMoY29udGVudCk7XG4gIGNvbnN0IHRpdGxlID0gYD4gWyEke29iVHlwZX1dJHtlbW9qaSA/IGAgJHtlbW9qaX1gIDogJyd9YDtcblxuICBpZiAobGluZXMubGVuZ3RoID09PSAwKSByZXR1cm4gdGl0bGU7XG4gIHJldHVybiBbdGl0bGUsIC4uLmxpbmVzLm1hcChsaW5lID0+IGA+ICR7bGluZX1gKV0uam9pbignXFxuJyk7XG59XG5cbi8qKlxuICogXHU2Mjc5XHU5MUNGXHU1QzA2XHU5OERFXHU0RTY2IFhNTCBcdTkxQ0NcdTc2ODRcdTYyNDBcdTY3MDkgY2FsbG91dCBcdTU3NTdcdThGNkNcdTYzNjJcdTRFM0EgT0IgY2FsbG91dFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydEZlaXNodUNhbGxvdXRzVG9PQih4bWw6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGNhbGxvdXRSZSA9IC88Y2FsbG91dFxcYltePl0qPltcXHNcXFNdKj88XFwvY2FsbG91dD4vZztcbiAgcmV0dXJuIHhtbC5yZXBsYWNlKGNhbGxvdXRSZSwgKG1hdGNoKSA9PiBmZWlzaHVDYWxsb3V0VG9PQihtYXRjaCkpO1xufVxuXG4vKipcbiAqIE9CIGA+IFshdHlwZV1gIGNhbGxvdXQgXHUyMTkyIFx1OThERVx1NEU2NiBjYWxsb3V0IFhNTFx1MzAwMlxuICogXHU0RjlEXHU2MzZFIGAwM19cdTY4M0NcdTVGMEZcdTg5QzRcdTgzMDMubWRgIFx1MDBBNzMuMlx1MzAwMlxuICpcbiAqIFx1OEY5M1x1NTE2NVx1NTM1NVx1NEUyQSBPQiBjYWxsb3V0IFx1NTc1N1x1RkYwOFx1NTQyQiBgPiBbIXR5cGVdYCBcdTk5OTZcdTg4NEMgKyBcdTVCNTBcdTg4NENcdUZGMDlcdTMwMDJcbiAqIFx1NTkxQVx1NEUyQSBjYWxsb3V0IFx1NzUzMVx1OEMwM1x1NzUyOFx1NjVCOVx1NjJDNlx1NTIwNlx1NTQwRVx1OTAxMFx1NEUyQVx1OEMwM1x1NzUyOFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gb2JDYWxsb3V0VG9GZWlzaHUobWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGxpbmVzID0gbWQuc3BsaXQoJ1xcbicpLm1hcChsID0+IGwucmVwbGFjZSgvXj5cXHM/LywgJycpKTtcbiAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG1kO1xuXG4gIC8vIFx1ODlFM1x1Njc5MFx1OTk5Nlx1ODg0QyBgPiBbIXR5cGVdYFxuICBjb25zdCBoZWFkZXJNYXRjaCA9IGxpbmVzWzBdLm1hdGNoKC9cXFshKFxcdyspXFxdXFxzKiguKikvKTtcbiAgaWYgKCFoZWFkZXJNYXRjaCkgcmV0dXJuIG1kO1xuXG4gIGNvbnN0IG9iVHlwZSA9IGhlYWRlck1hdGNoWzFdO1xuICBsZXQgcmVzdCA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKGhlYWRlck1hdGNoWzJdID8/ICcnKS50cmltKCk7XG4gIGNvbnN0IGZlaXNodSA9IE9CX0NBTExPVVRfVE9fRkVJU0hVW29iVHlwZV07XG5cbiAgbGV0IGVtb2ppID0gZmVpc2h1Py5lbW9qaSA/PyAnXHVEODNEXHVEQ0ExJztcbiAgbGV0IGJnID0gZmVpc2h1Py5iZyA/PyAnbGlnaHQtYmx1ZSc7XG4gIGxldCBib3JkZXIgPSBmZWlzaHU/LmJvcmRlciA/PyAnYmx1ZSc7XG5cbiAgLy8gXHU1QzFEXHU4QkQ1XHU0RUNFXHU5OTk2XHU4ODRDXHU1MjY5XHU0RjU5XHU1MTg1XHU1QkI5XHU2M0QwXHU1M0Q2XHU3NTI4XHU2MjM3XHU1MTk5XHU3Njg0IGVtb2ppXHVGRjBDXHU1RTc2XHU0RUNFXHU2QjYzXHU2NTg3XHU0RTJEXHU3OUZCXHU5NjY0XHUzMDAyXG4gIGNvbnN0IGVtb2ppTWF0Y2ggPSByZXN0Lm1hdGNoKC9eKFxccHtFeHRlbmRlZF9QaWN0b2dyYXBoaWN9KVxccyovdSk7XG4gIGlmIChlbW9qaU1hdGNoKSB7XG4gICAgZW1vamkgPSBlbW9qaU1hdGNoWzFdO1xuICAgIHJlc3QgPSByZXN0LnNsaWNlKGVtb2ppTWF0Y2hbMF0ubGVuZ3RoKS50cmltU3RhcnQoKTtcbiAgfVxuXG4gIC8vIFx1NTE4NVx1NUJCOVx1RkYwOFx1OTk5Nlx1ODg0Q1x1NTNCQlx1NjM4OSBlbW9qaSArIFx1NTQwRVx1N0VFRFx1NUI1MFx1ODg0Q1x1RkYwOVxuICBjb25zdCBib2R5TGluZXMgPSBsaW5lcy5zbGljZSgxKTtcbiAgaWYgKHJlc3QpIHtcbiAgICBib2R5TGluZXMudW5zaGlmdChyZXN0KTtcbiAgfVxuICBjb25zdCBjb250ZW50SHRtbCA9IGJvZHlMaW5lc1xuICAgIC5maWx0ZXIobCA9PiBsLnRyaW0oKSlcbiAgICAubWFwKGwgPT4gYDxwPiR7bH08L3A+YClcbiAgICAuam9pbignXFxuJyk7XG5cbiAgcmV0dXJuIFtcbiAgICBgPGNhbGxvdXQgZW1vamk9XCIke2Vtb2ppfVwiIGJhY2tncm91bmQtY29sb3I9XCIke2JnfVwiIGJvcmRlci1jb2xvcj1cIiR7Ym9yZGVyfVwiPmAsXG4gICAgY29udGVudEh0bWwsXG4gICAgYDwvY2FsbG91dD5gLFxuICBdLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIFx1NjI3OVx1OTFDRlx1NUMwNiBPQiBtZCBcdTkxQ0NcdTc2ODRcdTYyNDBcdTY3MDkgYD4gWyF0eXBlXWAgY2FsbG91dCBcdThGNkNcdTYzNjJcdTRFM0FcdTk4REVcdTRFNjYgWE1MIGNhbGxvdXRcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRPQkNhbGxvdXRzVG9GZWlzaHUobWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIFx1NTMzOVx1OTE0RFx1OEZERVx1N0VFRFx1NzY4NCBjYWxsb3V0IFx1NTc1N1x1RkYwOFx1NEVFNSA+IFshIFx1NUYwMFx1NTkzNFx1NzY4NFx1ODg0Q1x1RkYwQ1x1NzZGNFx1NTIzMFx1OTc1RSA+IFx1NjIxNlx1N0E3QVx1ODg0Q1x1RkYwOVxuICBjb25zdCBjYWxsb3V0UmUgPSAvKD86Xj4gXFxbIVxcdytcXF0uKlxcbig/Ol4+LipcXG4/KSopL2dtO1xuICByZXR1cm4gbWQucmVwbGFjZShjYWxsb3V0UmUsIChtYXRjaCkgPT4gb2JDYWxsb3V0VG9GZWlzaHUobWF0Y2gpKTtcbn1cbiIsICIvKipcbiAqIFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1NjNBOFx1NUJGQ1x1MzAwMlx1NEY5RFx1NjM2RSBgMDFfT0JcdTIxOTRcdTk4REVcdTRFNjZcdTVCRjlcdTZCRDRcdTYyQTVcdTU0NEEubWRgICsgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3XHU0RTAzXHUzMDAyXG4gKlxuICogT0IgMjUgXHU0RTJBXHU2ODM5XHU3NkVFXHU1RjU1IFx1MjE5MiBcdTk4REVcdTRFNjYgNSBcdTRFMkFcdTk4NzZcdTdFQTdcdTgyODJcdTcwQjlcdTc2ODRcdTY2MjBcdTVDMDRcdTg5QzRcdTUyMTlcdUZGMUFcbiAqICAgMFx1RkUwRlx1MjBFM1x1OEY5M1x1NTE2NSAvIFMgXHUyMTkyIFx1OThERVx1NEU2NlwiXHU4RjkzXHU1MTY1XCJcbiAqICAgMVx1RkUwRlx1MjBFM1x1OEY5M1x1NTFGQSAvIFggXHUyMTkyIFx1OThERVx1NEU2NlwiXHU4RjkzXHU1MUZBXCJcbiAqICAgMlx1RkUwRlx1MjBFM1x1RDgzRFx1RERDM1x1NzdFNVx1OEJDNlx1NkM2MCAvIFogLyBMIC8gSiAvIFEgXHUyMTkyIFx1OThERVx1NEU2NlwiXHU3N0U1XHU4QkM2XHU2QzYwXCJcbiAqICAgXHVEODNFXHVERUE3XHU1QkZDXHU1RjE1IFx1MjE5MiBcdTk4REVcdTRFNjZcIlx1NUJGQ1x1NUYxNVwiXG4gKiAgIDNcdUZFMEZcdTIwRTNcdTk2NDRcdTRFRjZcdTY1ODdcdTRFRjYgXHUyMTkyIFx1OThERVx1NEU2NlwiXHU5NjQ0XHU0RUY2XCJcdUZGMDhcdTcyNzlcdTZCOEFcdUZGMENcdTk3NUVcdTY1ODdcdTY4NjNcdUZGMDlcbiAqXG4gKiBcdTYzQThcdTVCRkNcdTdFRDNcdTY3OUNcdTdGMTNcdTVCNThcdTUyMzAgYC5mZWlzaHUtc3luYy9tYXBwaW5nLmpzb25gXHVGRjBDXHU0RTBEXHU3ODZDXHU3RjE2XHU3ODAxXHUzMDAyXG4gKi9cbmltcG9ydCB0eXBlIHsgQXBwIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgTm90aWNlIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgbGlzdFdpa2lDaGlsZHJlbiB9IGZyb20gJy4vbGFyay9jbGkuanMnO1xuXG5jb25zdCBNQVBQSU5HX0ZJTEUgPSAnLmZlaXNodS1zeW5jL21hcHBpbmcuanNvbic7XG5cbi8qKiBcdTUzNTVcdTY3NjFcdTY2MjBcdTVDMDRcdUZGMUFPQiBcdThERUZcdTVGODQgXHUyMTkyIFx1OThERVx1NEU2Nlx1ODI4Mlx1NzBCOVx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBEaXJNYXBwaW5nIHtcbiAgLyoqIE9CIFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NTk4MiBcIjBcdUZFMEZcdTIwRTNcdThGOTNcdTUxNjUvXHVEODNEXHVEQ0ExXHU3ODhFXHU3MjQ3XHU4RjkzXHU1MTY1XHVGRjA4XHU5NUVBXHU1RkY1XHVGRjA5XCJcdTMwMDIgKi9cbiAgb2JQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTk4REVcdTRFNjYgbm9kZV90b2tlblx1MzAwMiAqL1xuICBmZWlzaHVOb2RlVG9rZW46IHN0cmluZztcbiAgLyoqIFx1OThERVx1NEU2Nlx1ODI4Mlx1NzBCOVx1NjgwN1x1OTg5OFx1MzAwMiAqL1xuICBmZWlzaHVUaXRsZTogc3RyaW5nO1xufVxuXG4vKiogXHU2NjIwXHU1QzA0XHU3RjEzXHU1QjU4XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIE1hcHBpbmdDYWNoZSB7XG4gIC8qKiBcdTc1MUZcdTYyMTBcdTY1RjZcdTk1RjRcdTMwMDIgKi9cbiAgZ2VuZXJhdGVkQXQ6IHN0cmluZztcbiAgLyoqIHNwYWNlX2lkXHUzMDAyICovXG4gIHNwYWNlSWQ6IHN0cmluZztcbiAgLyoqIFx1OTg3Nlx1N0VBN1x1ODI4Mlx1NzBCOVx1MzAwMiAqL1xuICB0b3BOb2RlczogQXJyYXk8eyB0b2tlbjogc3RyaW5nOyB0aXRsZTogc3RyaW5nIH0+O1xuICAvKiogXHU4QkU2XHU3RUM2XHU2NjIwXHU1QzA0XHUzMDAyICovXG4gIG1hcHBpbmdzOiBEaXJNYXBwaW5nW107XG59XG5cbi8qKiBPQiBcdTY4MzlcdTc2RUVcdTVGNTUgZW1vamkgXHUyMTkyIFx1OThERVx1NEU2Nlx1OTg3Nlx1N0VBN1x1ODI4Mlx1NzBCOVx1NjgwN1x1OTg5OFx1RkYwOFx1NEY5RFx1NjM2RSAwMSBcdTVCRjlcdTZCRDRcdTYyQTVcdTU0NEFcdUZGMDlcdTMwMDIgKi9cbmNvbnN0IFJPT1RfRElSX1RPX0ZFSVNIVTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJzBcdUZFMEZcdTIwRTNcdThGOTNcdTUxNjUnOiAnXHU4RjkzXHU1MTY1JyxcbiAgJzFcdUZFMEZcdTIwRTNcdThGOTNcdTUxRkEnOiAnXHU4RjkzXHU1MUZBJyxcbiAgJzJcdUZFMEZcdTIwRTNcdUQ4M0RcdUREQzNcdTc3RTVcdThCQzZcdTZDNjAnOiAnXHU3N0U1XHU4QkM2XHU2QzYwJyxcbiAgJzNcdUZFMEZcdTIwRTNcdTk2NDRcdTRFRjZcdTY1ODdcdTRFRjYnOiAnXHU5NjQ0XHU0RUY2JyxcbiAgJ1x1RDgzRVx1REVBN1x1NUJGQ1x1NUYxNSc6ICdcdTVCRkNcdTVGMTUnLFxufTtcblxuLyoqXG4gKiBcdTYzQThcdTVCRkNcdTVFNzZcdTdGMTNcdTVCNThcdTc2RUVcdTVGNTVcdTY2MjBcdTVDMDRcdTMwMDJcbiAqIDEuIFx1NjJDOVx1OThERVx1NEU2Nlx1OTg3Nlx1N0VBN1x1ODI4Mlx1NzBCOVx1NTIxN1x1ODg2OFxuICogMi4gXHU2MzA5IGVtb2ppIFx1ODlDNFx1NTIxOVx1NTMzOVx1OTE0RCBPQiBcdTY4MzlcdTc2RUVcdTVGNTUgXHUyMTkyIFx1OThERVx1NEU2Nlx1OTg3Nlx1N0VBN1xuICogMy4gXHU5MDEyXHU1RjUyXHU1MzM5XHU5MTREXHU1QjUwXHU3NkVFXHU1RjU1XHVGRjA4XHU2MzA5XHU2ODA3XHU5ODk4XHU2QTIxXHU3Q0NBXHU1MzM5XHU5MTREXHVGRjA5XG4gKiA0LiBcdTUxOTlcdTUxNjUgLmZlaXNodS1zeW5jL21hcHBpbmcuanNvblxuICpcbiAqIEByZXR1cm5zIFx1NjNBOFx1NUJGQ1x1NzY4NFx1NjYyMFx1NUMwNFx1NjU3MFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVmcmVzaE1hcHBpbmcoYXBwOiBBcHAsIHNwYWNlSWQ6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gIGlmICghc3BhY2VJZCkge1xuICAgIG5ldyBOb3RpY2UoJ1x1MjZBMFx1RkUwRiBcdTY3MkFcdTkxNERcdTdGNkUgc3BhY2VfaWRcdUZGMENcdThCRjdcdTU3MjhcdThCQkVcdTdGNkVcdTk4NzVcdTU4NkJcdTUxOTknKTtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIG5ldyBOb3RpY2UoJ1x1RDgzRFx1REQwNCBcdTYzQThcdTVCRkNcdTc2RUVcdTVGNTVcdTY2MjBcdTVDMDQuLi4nKTtcblxuICAvLyBcdTYyQzkgNSBcdTRFMkFcdTk4NzZcdTdFQTdcdTgyODJcdTcwQjlcbiAgY29uc3QgdG9wTm9kZXMgPSBsaXN0V2lraUNoaWxkcmVuKHNwYWNlSWQsICcnKTtcbiAgaWYgKHRvcE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIG5ldyBOb3RpY2UoJ1x1MjZBMFx1RkUwRiBcdTYyQzlcdTRFMERcdTUyMzBcdTk4REVcdTRFNjZcdTk4NzZcdTdFQTdcdTgyODJcdTcwQjlcdUZGMENcdThCRjdcdTY4QzBcdTY3RTUgc3BhY2VfaWQgXHU1NDhDIGxhcmstY2xpIFx1NzY3Qlx1NUY1NVx1NjAwMScpO1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgY29uc3QgbWFwcGluZ3M6IERpck1hcHBpbmdbXSA9IFtdO1xuXG4gIC8vIFx1OTg3Nlx1N0VBN1x1NTMzOVx1OTE0RFxuICBmb3IgKGNvbnN0IFtvYlJvb3QsIGZlaXNodVRpdGxlXSBvZiBPYmplY3QuZW50cmllcyhST09UX0RJUl9UT19GRUlTSFUpKSB7XG4gICAgY29uc3QgbWF0Y2hlZCA9IHRvcE5vZGVzLmZpbmQobiA9PiBuLnRpdGxlLmluY2x1ZGVzKGZlaXNodVRpdGxlKSB8fCBmZWlzaHVUaXRsZS5pbmNsdWRlcyhuLnRpdGxlKSk7XG4gICAgaWYgKG1hdGNoZWQpIHtcbiAgICAgIG1hcHBpbmdzLnB1c2goe1xuICAgICAgICBvYlBhdGg6IG9iUm9vdCxcbiAgICAgICAgZmVpc2h1Tm9kZVRva2VuOiBtYXRjaGVkLm5vZGVfdG9rZW4sXG4gICAgICAgIGZlaXNodVRpdGxlOiBtYXRjaGVkLnRpdGxlLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gXHU5MDEyXHU1RjUyXHU1MzM5XHU5MTREXHU1QjUwXHU3NkVFXHU1RjU1XHVGRjA4XHU0RTAwXHU3RUE3XHU1MzczXHU1M0VGXHVGRjBDXHU5MDdGXHU1MTREXHU4RkM3XHU2REYxXHVGRjA5XG4gIGNvbnN0IHJvb3QgPSBhcHAudmF1bHQuZ2V0Um9vdCgpO1xuICBmb3IgKGNvbnN0IGNoaWxkIG9mIHJvb3QuY2hpbGRyZW4pIHtcbiAgICBpZiAoIWNoaWxkLm5hbWUgfHwgY2hpbGQubmFtZS5zdGFydHNXaXRoKCcuJykpIGNvbnRpbnVlO1xuICAgIGlmICghKGNoaWxkLmNoaWxkcmVuPy5sZW5ndGgpKSBjb250aW51ZTtcbiAgICAvLyBcdTYyN0VcdTUyMzBcdThGRDlcdTRFMkFcdTY4MzlcdTc2ODRcdTk4REVcdTRFNjYgdG9rZW5cbiAgICBjb25zdCByb290TWFwcGluZyA9IG1hcHBpbmdzLmZpbmQobSA9PiBtLm9iUGF0aCA9PT0gY2hpbGQubmFtZSk7XG4gICAgaWYgKCFyb290TWFwcGluZykgY29udGludWU7XG5cbiAgICAvLyBcdTYyQzlcdTk4REVcdTRFNjZcdTVCNTBcdTgyODJcdTcwQjlcbiAgICBjb25zdCBmZWlzaHVDaGlsZHJlbiA9IGxpc3RXaWtpQ2hpbGRyZW4oc3BhY2VJZCwgcm9vdE1hcHBpbmcuZmVpc2h1Tm9kZVRva2VuKTtcbiAgICBmb3IgKGNvbnN0IG9iU3ViIG9mIGNoaWxkLmNoaWxkcmVuKSB7XG4gICAgICBpZiAoIW9iU3ViLm5hbWUgfHwgb2JTdWIubmFtZS5zdGFydHNXaXRoKCcuJykpIGNvbnRpbnVlO1xuICAgICAgLy8gXHU2QTIxXHU3Q0NBXHU1MzM5XHU5MTREXHVGRjA4XHU1M0JCXHU2Mzg5XHU3RjE2XHU3ODAxXHU1MjREXHU3RjAwXHU1NDBFXHU2QkQ0XHU4RjgzXHVGRjA5XG4gICAgICBjb25zdCBjbGVhbk9iTmFtZSA9IG9iU3ViLm5hbWUucmVwbGFjZSgvXlxcZHsyfV9cXGR7NH1fW1NYWkxRSl1cXGQrXFxzKi8sICcnKTtcbiAgICAgIGNvbnN0IG1hdGNoZWQgPSBmZWlzaHVDaGlsZHJlbi5maW5kKFxuICAgICAgICBuID0+IG4udGl0bGUuaW5jbHVkZXMoY2xlYW5PYk5hbWUpIHx8IGNsZWFuT2JOYW1lLmluY2x1ZGVzKG4udGl0bGUpLFxuICAgICAgKTtcbiAgICAgIGlmIChtYXRjaGVkKSB7XG4gICAgICAgIG1hcHBpbmdzLnB1c2goe1xuICAgICAgICAgIG9iUGF0aDogYCR7Y2hpbGQubmFtZX0vJHtvYlN1Yi5uYW1lfWAsXG4gICAgICAgICAgZmVpc2h1Tm9kZVRva2VuOiBtYXRjaGVkLm5vZGVfdG9rZW4sXG4gICAgICAgICAgZmVpc2h1VGl0bGU6IG1hdGNoZWQudGl0bGUsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFx1NTE5OVx1N0YxM1x1NUI1OFxuICBjb25zdCBjYWNoZTogTWFwcGluZ0NhY2hlID0ge1xuICAgIGdlbmVyYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgc3BhY2VJZCxcbiAgICB0b3BOb2RlczogdG9wTm9kZXMubWFwKG4gPT4gKHsgdG9rZW46IG4ubm9kZV90b2tlbiwgdGl0bGU6IG4udGl0bGUgfSkpLFxuICAgIG1hcHBpbmdzLFxuICB9O1xuXG4gIGF3YWl0IGVuc3VyZUNvbmZpZ0RpcihhcHApO1xuICBhd2FpdCBhcHAudmF1bHQuYWRhcHRlci53cml0ZShNQVBQSU5HX0ZJTEUsIEpTT04uc3RyaW5naWZ5KGNhY2hlLCBudWxsLCAyKSk7XG5cbiAgbmV3IE5vdGljZShgXHUyNzA1IFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1NURGMlx1NjZGNFx1NjVCMFx1RkYwOCR7bWFwcGluZ3MubGVuZ3RofSBcdTY3NjFcdUZGMDlgKTtcbiAgcmV0dXJuIG1hcHBpbmdzLmxlbmd0aDtcbn1cblxuLyoqXG4gKiBcdThCRkJcdTY2MjBcdTVDMDRcdTdGMTNcdTVCNThcdTMwMDJcdTY1RTBcdTdGMTNcdTVCNThcdThGRDRcdTU2REUgbnVsbFx1MzAwMlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZE1hcHBpbmcoYXBwOiBBcHApOiBQcm9taXNlPE1hcHBpbmdDYWNoZSB8IG51bGw+IHtcbiAgdHJ5IHtcbiAgICBpZiAoIShhd2FpdCBhcHAudmF1bHQuYWRhcHRlci5leGlzdHMoTUFQUElOR19GSUxFKSkpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IHJhdyA9IGF3YWl0IGFwcC52YXVsdC5hZGFwdGVyLnJlYWQoTUFQUElOR19GSUxFKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShyYXcpIGFzIE1hcHBpbmdDYWNoZTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS53YXJuKCdbc3luYy9tYXBwaW5nXSBsb2FkIGZhaWxlZDonLCBlcnIpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogXHU2N0U1IE9CIFx1OERFRlx1NUY4NFx1NUJGOVx1NUU5NFx1NzY4NFx1OThERVx1NEU2Nlx1ODI4Mlx1NzBCOSB0b2tlblx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9va3VwRmVpc2h1Tm9kZShjYWNoZTogTWFwcGluZ0NhY2hlLCBvYlBhdGg6IHN0cmluZyk6IERpck1hcHBpbmcgfCBudWxsIHtcbiAgLy8gXHU3Q0JFXHU3ODZFXHU1MzM5XHU5MTREXG4gIGNvbnN0IGV4YWN0ID0gY2FjaGUubWFwcGluZ3MuZmluZChtID0+IG0ub2JQYXRoID09PSBvYlBhdGgpO1xuICBpZiAoZXhhY3QpIHJldHVybiBleGFjdDtcblxuICAvLyBcdTUyNERcdTdGMDBcdTUzMzlcdTkxNERcdUZGMDhcdTUzRDZcdTY3MDBcdTk1N0ZcdTUzMzlcdTkxNERcdUZGMDlcbiAgbGV0IGJlc3Q6IERpck1hcHBpbmcgfCBudWxsID0gbnVsbDtcbiAgZm9yIChjb25zdCBtIG9mIGNhY2hlLm1hcHBpbmdzKSB7XG4gICAgaWYgKG9iUGF0aC5zdGFydHNXaXRoKG0ub2JQYXRoICsgJy8nKSB8fCBvYlBhdGguc3RhcnRzV2l0aChtLm9iUGF0aCkpIHtcbiAgICAgIGlmICghYmVzdCB8fCBtLm9iUGF0aC5sZW5ndGggPiBiZXN0Lm9iUGF0aC5sZW5ndGgpIGJlc3QgPSBtO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYmVzdDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZW5zdXJlQ29uZmlnRGlyKGFwcDogQXBwKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGRpciA9ICcuZmVpc2h1LXN5bmMnO1xuICBpZiAoIShhd2FpdCBhcHAudmF1bHQuYWRhcHRlci5leGlzdHMoZGlyKSkpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIoZGlyKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8qIGlnbm9yZSAqL1xuICAgIH1cbiAgfVxufVxuIiwgIi8qKlxuICogXHU2NzJDXHU1NzMwIEhUVFAgc2VydmVyXHUzMDAyXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzJcdUZGMDhsb2NhbGhvc3QgSFRUUCBcdTUzNEZcdThCQUVcdUZGMDlcdTMwMDJcbiAqXG4gKiAtIFx1NzUyOCBub2RlOmh0dHAgXHU4RDc3IHNlcnZlclx1RkYwOE9CIFx1NjNEMlx1NEVGNiBpc0Rlc2t0b3BPbmx5XHVGRjBDXHU1M0VGXHU3NTI4IG5vZGUgXHU1MTg1XHU3RjZFXHU2QTIxXHU1NzU3XHVGRjA5XG4gKiAtIFx1N0FFRlx1NTNFM1x1NTNFRlx1OTE0RFx1N0Y2RVx1RkYwOFx1OUVEOFx1OEJBNCA0NTY3XHVGRjA5XG4gKiAtIFx1OTI3NFx1Njc0M1x1RkYxQVx1NkJDRlx1NEUyQVx1OEJGN1x1NkM0Mlx1NjgyMVx1OUE4QyBYLVN5bmMtVG9rZW4gaGVhZGVyXG4gKiAtIENPUlNcdUZGMUFcdTY1M0VcdTkwMUEgT1BUSU9OUyBcdTk4ODRcdTY4QzBcdUZGMDhcdTYyNjlcdTVDNTVcdTRFQ0VcdTk4REVcdTRFNjZcdTk4NzVcdTk3NjIgZmV0Y2ggXHU0RjFBXHU4OEFCXHU2MkU2XHVGRjA5XG4gKiAtIFx1OERFRlx1NzUzMVx1NTIwNlx1NTNEMVx1NTIzMCBoYW5kbGVyc1xuICovXG5pbXBvcnQgKiBhcyBodHRwIGZyb20gJ25vZGU6aHR0cCc7XG5pbXBvcnQgeyBUT0tFTl9IRUFERVIgfSBmcm9tICdAc3luYy9zaGFyZWQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlcnZlckRlcHMge1xuICAvKiogXHU2ODIxXHU5QThDIHRva2VuIFx1NjYyRlx1NTQyNlx1NTMzOVx1OTE0RFx1MzAwMiAqL1xuICB2YWxpZGF0ZVRva2VuOiAodG9rZW46IHN0cmluZykgPT4gYm9vbGVhbjtcbiAgLyoqIFx1OERFRlx1NzUzMVx1NTkwNFx1NzQwNlx1NTY2OFx1NjYyMFx1NUMwNFx1MzAwMiAqL1xuICByb3V0ZXM6IE1hcDxzdHJpbmcsIFJvdXRlSGFuZGxlcj47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWVzdENvbnRleHQge1xuICBtZXRob2Q6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG4gIC8qKiBcdTg5RTNcdTY3OTBcdTU0MEVcdTc2ODQgcGF0aFx1RkYwOFx1NEUwRFx1NTQyQiBxdWVyeVx1RkYwOVx1MzAwMiAqL1xuICBwYXRoOiBzdHJpbmc7XG4gIC8qKiBxdWVyeSBcdTUzQzJcdTY1NzBcdTMwMDIgKi9cbiAgcXVlcnk6IFVSTFNlYXJjaFBhcmFtcztcbiAgLyoqIFx1OEJGN1x1NkM0Mlx1NEY1M1x1RkYwOFBPU1QvUFVUIFx1NjI0RFx1NjcwOVx1RkYwQ1x1NURGMiBwYXJzZSBKU09OXHVGRjA5XHUzMDAyICovXG4gIGJvZHk/OiB1bmtub3duO1xuICAvKiogXHU1MzlGXHU1OUNCIHRva2VuXHUzMDAyICovXG4gIHRva2VuOiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIFJvdXRlSGFuZGxlciA9IChjdHg6IFJlcXVlc3RDb250ZXh0KSA9PiBQcm9taXNlPHVua25vd24+IHwgdW5rbm93bjtcblxuLyoqIEpTT04gXHU1NENEXHU1RTk0XHU1REU1XHU1MTc3XHUzMDAyICovXG5mdW5jdGlvbiBqc29uKHJlczogaHR0cC5TZXJ2ZXJSZXNwb25zZSwgc3RhdHVzOiBudW1iZXIsIGRhdGE6IHVua25vd24pOiB2b2lkIHtcbiAgY29uc3QgYm9keSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICByZXMud3JpdGVIZWFkKHN0YXR1cywge1xuICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCcsXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6IGAke1RPS0VOX0hFQURFUn0sIENvbnRlbnQtVHlwZWAsXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULCBQT1NULCBPUFRJT05TJyxcbiAgICAnQ29udGVudC1MZW5ndGgnOiBCdWZmZXIuYnl0ZUxlbmd0aChib2R5KSxcbiAgfSk7XG4gIHJlcy5lbmQoYm9keSk7XG59XG5cbi8qKlxuICogXHU1NDJGXHU1MkE4IEhUVFAgc2VydmVyXHUzMDAyXG4gKiBAcmV0dXJucyBzdG9wKCkgXHU1MUZEXHU2NTcwXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFydFNlcnZlcihwb3J0OiBudW1iZXIsIGRlcHM6IFNlcnZlckRlcHMpOiBQcm9taXNlPHsgc3RvcDogKCkgPT4gUHJvbWlzZTx2b2lkPiB9PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAvLyBDT1JTIFx1OTg4NFx1NjhDMFxuICAgICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgICByZXMud3JpdGVIZWFkKDIwNCwge1xuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiBgJHtUT0tFTl9IRUFERVJ9LCBDb250ZW50LVR5cGVgLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCwgUE9TVCwgT1BUSU9OUycsXG4gICAgICAgIH0pO1xuICAgICAgICByZXMuZW5kKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU4OUUzXHU2NzkwIFVSTFxuICAgICAgY29uc3QgZnVsbFVybCA9IHJlcS51cmwgPz8gJy8nO1xuICAgICAgY29uc3QgdXJsT2JqID0gbmV3IFVSTChmdWxsVXJsLCBgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9YCk7XG4gICAgICBjb25zdCBjdHhQYXRoID0gdXJsT2JqLnBhdGhuYW1lO1xuXG4gICAgICAvLyBcdThCRkJcdTUzRDYgYm9keVx1RkYwOFBPU1QvUFVUXHVGRjA5XG4gICAgICBsZXQgYm9keTogdW5rbm93bjtcbiAgICAgIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcgfHwgcmVxLm1ldGhvZCA9PT0gJ1BVVCcpIHtcbiAgICAgICAgY29uc3QgY2h1bmtzOiBCdWZmZXJbXSA9IFtdO1xuICAgICAgICBmb3IgYXdhaXQgKGNvbnN0IGNodW5rIG9mIHJlcSkge1xuICAgICAgICAgIGNodW5rcy5wdXNoKGNodW5rIGFzIEJ1ZmZlcik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmF3ID0gQnVmZmVyLmNvbmNhdChjaHVua3MpLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgIGlmIChyYXcpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYm9keSA9IEpTT04ucGFyc2UocmF3KTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIGpzb24ocmVzLCA0MDAsIHsgb2s6IGZhbHNlLCBjb2RlOiAnQkFEX0pTT04nLCBtZXNzYWdlOiAnSW52YWxpZCBKU09OIGJvZHknIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBcdTkyNzRcdTY3NDNcdUZGMDgvc3RhdHVzIFx1NTE0MVx1OEJCOFx1NjVFMCB0b2tlbiBcdTYzQTJcdTZENEJcdUZGMENcdTRGNDZcdTVCOUVcdTk2NDVcdTYzRTFcdTYyNEJcdTk3MDBcdTg5ODFcdUZGMDlcbiAgICAgIGNvbnN0IHRva2VuID0gcmVxLmhlYWRlcnNbVE9LRU5fSEVBREVSLnRvTG93ZXJDYXNlKCldIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgIGlmIChjdHhQYXRoICE9PSAnL3N0YXR1cycgJiYgIWRlcHMudmFsaWRhdGVUb2tlbih0b2tlbiA/PyAnJykpIHtcbiAgICAgICAganNvbihyZXMsIDQwMSwgeyBvazogZmFsc2UsIGNvZGU6ICdVTkFVVEhPUklaRUQnLCBtZXNzYWdlOiAnSW52YWxpZCBvciBtaXNzaW5nIFgtU3luYy1Ub2tlbicgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU4REVGXHU3NTMxXG4gICAgICBjb25zdCBoYW5kbGVyID0gZGVwcy5yb3V0ZXMuZ2V0KGN0eFBhdGgpO1xuICAgICAgaWYgKCFoYW5kbGVyKSB7XG4gICAgICAgIGpzb24ocmVzLCA0MDQsIHsgb2s6IGZhbHNlLCBjb2RlOiAnTk9UX0ZPVU5EJywgbWVzc2FnZTogYFVua25vd24gcGF0aDogJHtjdHhQYXRofWAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaGFuZGxlcih7XG4gICAgICAgICAgbWV0aG9kOiByZXEubWV0aG9kID8/ICdHRVQnLFxuICAgICAgICAgIHVybDogZnVsbFVybCxcbiAgICAgICAgICBwYXRoOiBjdHhQYXRoLFxuICAgICAgICAgIHF1ZXJ5OiB1cmxPYmouc2VhcmNoUGFyYW1zLFxuICAgICAgICAgIGJvZHksXG4gICAgICAgICAgdG9rZW46IHRva2VuID8/ICcnLFxuICAgICAgICB9KTtcbiAgICAgICAganNvbihyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgIH0gY2F0Y2ggKGVycjogdW5rbm93bikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpO1xuICAgICAgICBjb25zdCBjb2RlID0gKGVyciBhcyB7IGNvZGU/OiBzdHJpbmcgfSk/LmNvZGUgPz8gJ0lOVEVSTkFMJztcbiAgICAgICAgY29uc3Qgc3RhdHVzID0gKGVyciBhcyB7IHN0YXR1cz86IG51bWJlciB9KT8uc3RhdHVzID8/IDUwMDtcbiAgICAgICAgY29uc29sZS5lcnJvcignW3N5bmMvc2VydmVyXSBoYW5kbGVyIGVycm9yOicsIGVycik7XG4gICAgICAgIGpzb24ocmVzLCBzdGF0dXMsIHsgb2s6IGZhbHNlLCBjb2RlLCBtZXNzYWdlIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2VydmVyLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH0pO1xuXG4gICAgc2VydmVyLmxpc3Rlbihwb3J0LCAnMTI3LjAuMC4xJywgKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coYFtzeW5jL3NlcnZlcl0gbGlzdGVuaW5nIG9uIGh0dHA6Ly8xMjcuMC4wLjE6JHtwb3J0fWApO1xuICAgICAgcmVzb2x2ZSh7XG4gICAgICAgIHN0b3A6ICgpID0+XG4gICAgICAgICAgbmV3IFByb21pc2UoKHJlcykgPT4ge1xuICAgICAgICAgICAgc2VydmVyLmNsb3NlKCgpID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtzeW5jL3NlcnZlcl0gc3RvcHBlZGApO1xuICAgICAgICAgICAgICByZXMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKiogXHU2Nzg0XHU5MDIwXHU5NTE5XHU4QkVGXHVGRjA4XHU1RTI2IGNvZGUvc3RhdHVzXHVGRjA5XHUzMDAyICovXG5leHBvcnQgY2xhc3MgSHR0cEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb2RlOiBzdHJpbmc7XG4gIHN0YXR1czogbnVtYmVyO1xuICBjb25zdHJ1Y3Rvcihjb2RlOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZywgc3RhdHVzID0gNDAwKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5jb2RlID0gY29kZTtcbiAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgfVxufVxuIiwgIi8qKlxuICogR0VUIC9zdGF0dXMgXHUyMDE0IFx1NjNFMVx1NjI0Qi9cdTUwNjVcdTVFQjdcdTY4QzBcdTY3RTVcdTMwMDJcbiAqL1xuaW1wb3J0IHR5cGUgeyBTdGF0dXNSZXNwb25zZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpblN0YXRlIH0gZnJvbSAnLi4vc2V0dGluZ3MuanMnO1xuaW1wb3J0IHR5cGUgeyBSZXF1ZXN0Q29udGV4dCB9IGZyb20gJy4uL3NlcnZlci5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdGF0dXNIYW5kbGVyKHBsdWdpblZlcnNpb246IHN0cmluZywgdmF1bHROYW1lOiBzdHJpbmcsIHN0YXRlOiBQbHVnaW5TdGF0ZSkge1xuICByZXR1cm4gYXN5bmMgKF9jdHg6IFJlcXVlc3RDb250ZXh0KTogUHJvbWlzZTxTdGF0dXNSZXNwb25zZT4gPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBvazogdHJ1ZSxcbiAgICAgIHZlcnNpb246IHBsdWdpblZlcnNpb24sXG4gICAgICB2YXVsdDogdmF1bHROYW1lLFxuICAgICAgbGFya1JlYWR5OiAhIXN0YXRlLmxhcmtDbGlSZXNvbHZlZCxcbiAgICAgIGxhcmtWZXJzaW9uOiBzdGF0ZS5sYXJrQ2xpVmVyc2lvbiB8fCBudWxsLFxuICAgIH07XG4gIH07XG59XG4iLCAiLyoqXG4gKiBHRVQgL3RyZWUgXHUyMDE0IFx1OEZENFx1NTZERSB2YXVsdCBcdTc2RUVcdTVGNTVcdTY4MTFcdUZGMDhcdTdFRDlcdTYyNjlcdTVDNTVcdTc2RUVcdTVGNTVcdTRFMEJcdTYyQzlcdTc1MjhcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdTRGMThcdTUzMTZcdUZGMUFcbiAqIC0gXHU1MTg1XHU1QjU4XHU3RjEzXHU1QjU4XHVGRjA4NSBcdTc5RDIgVFRMXHVGRjA5XHVGRjBDXHU5MDdGXHU1MTREXHU2QkNGXHU2QjIxXHU4QkY3XHU2QzQyXHU5MDREXHU1Mzg2XHU1MTY4IHZhdWx0XG4gKiAtIFx1NjUyRlx1NjMwMSBtYXhEZXB0aCBcdTUzQzJcdTY1NzBcdUZGMDhxdWVyeSBzdHJpbmdcdUZGMDlcdUZGMENcdTlFRDhcdThCQTRcdThGRDRcdTU2REVcdThGODNcdTVCOENcdTY1NzRcdTc2RUVcdTVGNTVcdTY4MTFcbiAqIC0gXHU2NTJGXHU2MzAxIHByZWZpeCBcdTUzQzJcdTY1NzBcdUZGMENcdTVDNTVcdTVGMDBcdTYzMDdcdTVCOUFcdTVCNTBcdTY4MTFcbiAqL1xuaW1wb3J0IHR5cGUgeyBUcmVlUmVzcG9uc2UsIFRyZWVOb2RlIH0gZnJvbSAnQHN5bmMvc2hhcmVkJztcbmltcG9ydCB7IHR5cGUgQXBwLCBURm9sZGVyIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBSZXF1ZXN0Q29udGV4dCB9IGZyb20gJy4uL3NlcnZlci5qcyc7XG5cbmNvbnN0IEVYQ0xVREUgPSBuZXcgU2V0KFtcbiAgJ1x1NjNEMlx1NEVGNicsXG4gICdzY3JpcHRzJyxcbiAgJy5vYnNpZGlhbicsXG4gICcudHJhc2gnLFxuICAnLmZlaXNodS1zeW5jJyxcbiAgJ25vZGVfbW9kdWxlcycsXG5dKTtcblxuLyoqIFx1N0YxM1x1NUI1OCAqL1xubGV0IGNhY2hlRGlyczogVHJlZU5vZGVbXSA9IFtdO1xubGV0IGNhY2hlVGltZSA9IDA7XG5jb25zdCBDQUNIRV9UVEwgPSA1XzAwMDsgLy8gNSBcdTc5RDJcblxuZnVuY3Rpb24gYnVpbGRGdWxsVHJlZShhcHA6IEFwcCk6IFRyZWVOb2RlW10ge1xuICBjb25zdCByb290ID0gYXBwLnZhdWx0LmdldFJvb3QoKTtcbiAgY29uc3QgZGlyczogVHJlZU5vZGVbXSA9IFtdO1xuXG4gIGNvbnN0IHdhbGsgPSAoZm9sZGVyOiBURm9sZGVyLCBkZXB0aDogbnVtYmVyKSA9PiB7XG4gICAgaWYgKGRlcHRoID4gMCkge1xuICAgICAgY29uc3QgbmFtZSA9IGZvbGRlci5uYW1lO1xuICAgICAgaWYgKEVYQ0xVREUuaGFzKG5hbWUpIHx8IG5hbWUuc3RhcnRzV2l0aCgnLicpKSByZXR1cm47XG4gICAgICBkaXJzLnB1c2goeyBwYXRoOiBmb2xkZXIucGF0aCwgbGFiZWw6IG5hbWUsIGRlcHRoIH0pO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGZvbGRlci5jaGlsZHJlbikge1xuICAgICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgVEZvbGRlcikgd2FsayhjaGlsZCwgZGVwdGggKyAxKTtcbiAgICB9XG4gIH07XG5cbiAgd2Fsayhyb290LCAwKTtcblxuICBkaXJzLnNvcnQoKGEsIGIpID0+IGEucGF0aC5sb2NhbGVDb21wYXJlKGIucGF0aCwgJ3poJykpO1xuXG4gIHJldHVybiBkaXJzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVHJlZUhhbmRsZXIoYXBwOiBBcHApIHtcbiAgcmV0dXJuIGFzeW5jIChjdHg6IFJlcXVlc3RDb250ZXh0KTogUHJvbWlzZTxUcmVlUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgIGNvbnN0IG1heERlcHRoID0gcGFyc2VJbnQoY3R4LnF1ZXJ5LmdldCgnbWF4RGVwdGgnKSB8fCAnMTInLCAxMCk7XG4gICAgY29uc3QgcHJlZml4ID0gY3R4LnF1ZXJ5LmdldCgncHJlZml4JykgfHwgJyc7XG5cbiAgICAvLyBcdTUyMzdcdTY1QjBcdTdGMTNcdTVCNThcbiAgICBpZiAobm93IC0gY2FjaGVUaW1lID4gQ0FDSEVfVFRMIHx8IGNhY2hlRGlycy5sZW5ndGggPT09IDApIHtcbiAgICAgIGNhY2hlRGlycyA9IGJ1aWxkRnVsbFRyZWUoYXBwKTtcbiAgICAgIGNhY2hlVGltZSA9IG5vdztcbiAgICB9XG5cbiAgICBsZXQgZGlycyA9IGNhY2hlRGlycztcblxuICAgIC8vIHByZWZpeCBcdTdCNUJcdTkwMDlcdUZGMUFcdTUzRUFcdThGRDRcdTU2REUgcHJlZml4LyBcdTRFMEJcdTc2ODRcdTVCNTBcdTgyODJcdTcwQjlcdUZGMDhkZXB0aCBcdTRFQ0UgcHJlZml4IFx1NEUwQlx1NEUwMFx1N0VBN1x1NUYwMFx1NTlDQlx1RkYwOVxuICAgIGlmIChwcmVmaXgpIHtcbiAgICAgIGNvbnN0IHByZWZpeERlcHRoID0gcHJlZml4LnNwbGl0KCcvJykubGVuZ3RoICsgMTtcbiAgICAgIGRpcnMgPSBkaXJzLmZpbHRlcihkID0+IGQucGF0aC5zdGFydHNXaXRoKHByZWZpeCArICcvJykgJiYgZC5kZXB0aCA8PSBwcmVmaXhEZXB0aCArIDEpO1xuICAgICAgLy8gXHU5MUNEXHU2NUIwXHU4QkExXHU3Qjk3XHU3NkY4XHU1QkY5XHU2REYxXHU1RUE2XG4gICAgICBkaXJzID0gZGlycy5tYXAoZCA9PiAoe1xuICAgICAgICAuLi5kLFxuICAgICAgICBkZXB0aDogZC5kZXB0aCAtIHByZWZpeERlcHRoICsgMixcbiAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gXHU2MzA5IG1heERlcHRoIFx1NjIyQVx1NjVBRFxuICAgICAgZGlycyA9IGRpcnMuZmlsdGVyKGQgPT4gZC5kZXB0aCA8PSBtYXhEZXB0aCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgb2s6IHRydWUsIGRpcnMgfTtcbiAgfTtcbn1cblxuLyoqIFx1NUJGQ1x1NTFGQVx1NTIzN1x1NjVCMFx1N0YxM1x1NUI1OFx1RkYwOFx1NjU4N1x1NEVGNlx1NjRDRFx1NEY1Q1x1NTQwRVx1OEMwM1x1NzUyOFx1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmFsaWRhdGVUcmVlQ2FjaGUoKTogdm9pZCB7XG4gIGNhY2hlRGlycyA9IFtdO1xuICBjYWNoZVRpbWUgPSAwO1xufVxuIiwgIi8qKlxuICogUE9TVCAvZmV0Y2ggXHUyMDE0IFx1OThERVx1NEU2Nlx1MjE5Mk9CIFx1ODQzRFx1NTczMFx1NEUzQlx1OTRGRVx1OERFRlx1MzAwMlxuICpcbiAqIFx1NEY5RFx1NjM2RSBgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTc2LjFcdUZGMUFcbiAqIDEuIGxhcmstY2xpIGRvY3MgK2ZldGNoIC0tZG9jLWZvcm1hdCBtYXJrZG93biBcdTIxOTIgXHU2QjYzXHU2NTg3IG1kXG4gKiAyLiBsYXJrLWNsaSBkb2NzICtmZXRjaCAtLWRvYy1mb3JtYXQgeG1sIC0tZGV0YWlsIHdpdGgtaWRzIFx1MjE5MiBmaWxlX3Rva2VuIFx1NTIxN1x1ODg2OCArIGNhbGxvdXQgXHU5ODlDXHU4MjcyICsgZG9jeCBvYmpfdG9rZW5cbiAqIDMuIFx1NTZGRVx1NzI0NyBhdXRoY29kZSBVUkwgXHUyMTkyIGZlaXNodTovL1RPS0VOXG4gKiA0LiBleGlzdHMgXHU2OEMwXHU2N0U1XHVGRjFBXHU1REYyXHU2NzA5XHU1NDBDIGZlaXNodV9pZCBcdTIxOTIgXHU2NkY0XHU2NUIwXHU1MjA2XHU2NTJGXHVGRjFCXHU2NUUwIFx1MjE5MiBcdTY1QjBcdTVFRkFcbiAqIDUuIFx1N0VDNFx1ODhDNSBZQU1MXHVGRjA4ZmVpc2h1X2lkL2ZlaXNodV9kb2NfaWQvZmVpc2h1X3RpdGxlL3N5bmNfdGltZVx1RkYwOSsgXHU2QjYzXHU2NTg3XG4gKiA2LiBcdTY1ODdcdTRFRjZcdTU0MEQgPSBcdTVCODlcdTUxNjhcdTZFMDVcdTZEMTcoZmVpc2h1X3RpdGxlKVx1RkYwQ1x1NTE5OVx1NTE2NSBkaXJcbiAqIDcuIGF1dG8tcmVuYW1lIFx1ODlFNlx1NTNEMVx1N0YxNlx1NzgwMSBcdTIxOTIgXHU1MTk5XHU1NkRFXHU2NTg3XHU0RUY2XHU1NDBEICsgWUFNTCBcdTdGMTZcdTc4MDFcbiAqIDguIFx1OEJBMVx1N0I5NyBzeW5jX2hhc2hcdUZGMENcdTUxOTkgc3luY190aW1lXG4gKiA5LiBcdThGRDRcdTU2REVcdTg0M0RcdTU3MzBcdThERUZcdTVGODRcbiAqL1xuaW1wb3J0IHR5cGUgeyBGZXRjaFJlcXVlc3QsIEZldGNoUmVzcG9uc2UgfSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHsgQXBwLCBURmlsZSwgVEZvbGRlciB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQsIEh0dHBFcnJvciB9IGZyb20gJy4uL3NlcnZlci5qcyc7XG5pbXBvcnQgdHlwZSB7IEZlaXNodVN5bmNTZXR0aW5ncywgUGx1Z2luU3RhdGUgfSBmcm9tICcuLi9zZXR0aW5ncy5qcyc7XG5pbXBvcnQgeyBydW4sIGdldFdpa2lOb2RlSW5mbyB9IGZyb20gJy4uL2xhcmsvY2xpLmpzJztcbmltcG9ydCB7XG4gIGV4dHJhY3RJbWdUb2tlbnNGcm9tWG1sLFxuICBjb252ZXJ0RmVpc2h1Q2FsbG91dHNUb09CLFxuICBjYWxsb3V0WG1sVG9NZXRhLFxufSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHtcbiAgcGFyc2VGaWxlLFxuICBidWlsZEluaXRpYWxGcm9udG1hdHRlcixcbiAgbWVyZ2VGcm9udG1hdHRlckZvclVwZGF0ZSxcbiAgYXNzZW1ibGVNZCxcbiAgcHJvY2Vzc0ZlaXNodU1kLFxuICBtYWtlRmlsZW5hbWUsXG4gIG1ha2VQYXRoLFxufSBmcm9tICcuLi9maWxlaW8vd3JpdGVyLmpzJztcbmltcG9ydCB7IGFzc2lnbkVuY29kaW5nIH0gZnJvbSAnLi4vYXV0b1JlbmFtZS5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmV0Y2hEZXBzIHtcbiAgYXBwOiBBcHA7XG4gIHNldHRpbmdzOiBGZWlzaHVTeW5jU2V0dGluZ3M7XG4gIHN0YXRlOiBQbHVnaW5TdGF0ZTtcbiAgbm90aWNlOiAobXNnOiBzdHJpbmcpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGZXRjaEhhbmRsZXIoZGVwczogRmV0Y2hEZXBzKSB7XG4gIHJldHVybiBhc3luYyAoY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8RmV0Y2hSZXNwb25zZT4gPT4ge1xuICAgIGNvbnN0IHJlcSA9IGN0eC5ib2R5IGFzIEZldGNoUmVxdWVzdDtcbiAgICBpZiAoIXJlcT8ubm9kZV90b2tlbikge1xuICAgICAgY29uc3QgZSA9IG5ldyBFcnJvcignbm9kZV90b2tlbiBpcyByZXF1aXJlZCcpIGFzIEVycm9yICYgeyBjb2RlOiBzdHJpbmc7IHN0YXR1czogbnVtYmVyIH07XG4gICAgICBlLmNvZGUgPSAnTUlTU0lOR19UT0tFTic7XG4gICAgICBlLnN0YXR1cyA9IDQwMDtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgY29uc3QgeyBub2RlX3Rva2VuLCBzcGFjZV9pZCwgZGlyIH0gPSByZXE7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBkZXBzLnNldHRpbmdzO1xuICAgIGNvbnN0IHRhcmdldERpciA9IGRpciA/PyBzZXR0aW5ncy5kZWZhdWx0RGlyO1xuXG4gICAgZGVwcy5ub3RpY2UoYFx1MkIwNyBcdTU0MENcdTZCNjVcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjMgJHtub2RlX3Rva2VuLnNsaWNlKDAsIDgpfS4uLmApO1xuXG4gICAgLy8gXHU2QjY1XHU5QUE0IDFcdUZGMUFcdTYyRkZcdTZCNjNcdTY1ODcgbWRcbiAgICBsZXQgbWQ6IHN0cmluZztcbiAgICB0cnkge1xuICAgICAgbWQgPSBydW4oXG4gICAgICAgIFsnZG9jcycsICcrZmV0Y2gnLCAnLS1kb2MnLCBub2RlX3Rva2VuLCAnLS1kb2MtZm9ybWF0JywgJ21hcmtkb3duJ10sXG4gICAgICAgIHsgdGltZW91dDogNjAwMDAgfSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAvLyBub2RlX3Rva2VuIFx1NTNFRlx1ODBGRFx1NjYyRiB3aWtpIG5vZGVcdUZGMENcdTk3MDBcdTUxNDhcdTg5RTNcdTY3OTBcdTRFM0Egb2JqX3Rva2VuXG4gICAgICBjb25zdCBpbmZvID0gc3BhY2VfaWQgPyBnZXRXaWtpTm9kZUluZm8obm9kZV90b2tlbiwgc3BhY2VfaWQpIDogbnVsbDtcbiAgICAgIGlmIChpbmZvPy5vYmpfdG9rZW4pIHtcbiAgICAgICAgbWQgPSBydW4oXG4gICAgICAgICAgWydkb2NzJywgJytmZXRjaCcsICctLWRvYycsIGluZm8ub2JqX3Rva2VuLCAnLS1kb2MtZm9ybWF0JywgJ21hcmtkb3duJ10sXG4gICAgICAgICAgeyB0aW1lb3V0OiA2MDAwMCB9LFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFx1NkI2NVx1OUFBNCAyXHVGRjFBXHU2MkZGIFhNTFx1RkYwOFx1NTZGRVx1NzI0NyB0b2tlbiArIGNhbGxvdXQgXHU5ODlDXHU4MjcyICsgZG9jeCBvYmpfdG9rZW5cdUZGMDlcbiAgICBsZXQgeG1sID0gJyc7XG4gICAgbGV0IG9ialRva2VuID0gcmVxLm9ial90b2tlbiA/PyAnJztcbiAgICB0cnkge1xuICAgICAgeG1sID0gcnVuKFxuICAgICAgICBbJ2RvY3MnLCAnK2ZldGNoJywgJy0tZG9jJywgbm9kZV90b2tlbiwgJy0tZG9jLWZvcm1hdCcsICd4bWwnLCAnLS1kZXRhaWwnLCAnd2l0aC1pZHMnXSxcbiAgICAgICAgeyB0aW1lb3V0OiA2MDAwMCB9LFxuICAgICAgKTtcbiAgICAgIGlmICghb2JqVG9rZW4pIHtcbiAgICAgICAgLy8gb2JqX3Rva2VuIFx1NTcyOCBYTUwgXHU3Njg0IDx0aXRsZSBpZD1cIi4uLlwiPiBcdTVDNUVcdTYwMjdcdTkxQ0NcdUZGMDhcdTg5RTNcdTUzMDVcdTU0MEVcdTc2ODRcdTdFQUYgWE1MIFx1NkNBMVx1NjcwOVx1NjYzRVx1NUYwRiBvYmpfdG9rZW4gXHU1QjU3XHU2QkI1XHVGRjA5XG4gICAgICAgIGNvbnN0IHRpdGxlSWRNYXRjaCA9IHhtbC5tYXRjaCgvPHRpdGxlW14+XSpcXGJpZD1cIihbQS1aYS16MC05XSspXCIvKTtcbiAgICAgICAgaWYgKHRpdGxlSWRNYXRjaCkgb2JqVG9rZW4gPSB0aXRsZUlkTWF0Y2hbMV07XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2ZldGNoXSB4bWwgZmV0Y2ggZmFpbGVkIChpbWFnZSB0b2tlbnMgbWF5IGJlIG1pc3NpbmcpOicsIGVycik7XG4gICAgfVxuXG4gICAgLy8gXHU2QjY1XHU5QUE0IDIuNVx1RkYxQVx1NEVDRVx1OThERVx1NEU2Nlx1NTkzNFx1OTBFOCBjYWxsb3V0IFx1ODlFM1x1Njc5MFx1NTE0M1x1NjU3MFx1NjM2RVx1RkYwOFx1NjgwN1x1N0I3RS9cdTdGMTZcdTc4MDEvXHU4RjkzXHU1MTY1L1x1NjVFNVx1NjcxRi9cdTUxNzNcdTk1MkVcdThCQ0QvXHU4QkM0XHU1MjA2L1x1N0QyMlx1NUYxNVx1RkYwOVxuICAgIC8vIFx1OEZEOVx1NEU5Qlx1NUI1N1x1NkJCNVx1NEYxQVx1NTE5OVx1OEZEQiBZQU1MIGZyb250bWF0dGVyXHVGRjFCXHU2QjYzXHU2NTg3IGNhbGxvdXQgXHU0RkREXHU3NTU5XHU0RTBEXHU1MkE4XHVGRjA4XHU2QjY1XHU5QUE0IDMuNSBcdThGNkMgT0IgY2FsbG91dFx1RkYwOVxuICAgIGNvbnN0IG1ldGEgPSB7XG4gICAgICAuLi4oeG1sID8gY2FsbG91dFhtbFRvTWV0YSh4bWwpIDoge30pLFxuICAgICAgLi4uKHJlcS5tZXRhID8/IHt9KSxcbiAgICB9O1xuICAgIGlmIChPYmplY3Qua2V5cyhtZXRhKS5sZW5ndGggPiAwKSB7XG4gICAgICBkZXBzLm5vdGljZShgXHVEODNEXHVEQ0NCIFx1NjNEMFx1NTNENlx1NTIzMCAke09iamVjdC5rZXlzKG1ldGEpLmxlbmd0aH0gXHU0RTJBXHU1MTQzXHU2NTcwXHU2MzZFXHU1QjU3XHU2QkI1YCk7XG4gICAgfVxuXG4gICAgLy8gXHU2QjY1XHU5QUE0IDNcdUZGMUFcdTU2RkVcdTcyNDcgdG9rZW4gXHUyMTkyIGZlaXNodTovLyBcdTUzNEZcdThCQUVcbiAgICBjb25zdCBpbWdUb2tlbnMgPSBuZXcgU2V0KGV4dHJhY3RJbWdUb2tlbnNGcm9tWG1sKHhtbCkpO1xuICAgIGxldCBwcm9jZXNzZWRNZCA9IHByb2Nlc3NGZWlzaHVNZChtZCwgaW1nVG9rZW5zKTtcblxuICAgIC8vIFx1NkI2NVx1OUFBNCAzLjVcdUZGMUFcdTk4REVcdTRFNjZcdTZCNjNcdTY1ODcgY2FsbG91dCBYTUwgXHUyMTkyIE9CIGNhbGxvdXRcbiAgICBpZiAoeG1sKSB7XG4gICAgICBwcm9jZXNzZWRNZCA9IGNvbnZlcnRGZWlzaHVDYWxsb3V0c1RvT0IocHJvY2Vzc2VkTWQpO1xuICAgIH1cblxuICAgIC8vIFx1NjNEMFx1NTNENlx1OThERVx1NEU2Nlx1NjgwN1x1OTg5OFx1RkYwOG1kIFx1N0IyQ1x1NEUwMFx1NEUyQSBIMVx1RkYwQ1x1NjIxNiBmYWxsYmFjayBcdTUyMzAgbm9kZSBcdTRGRTFcdTYwNkZcdUZGMDlcbiAgICBjb25zdCB0aXRsZU1hdGNoID0gcHJvY2Vzc2VkTWQubWF0Y2goL14jXFxzKyguKykkL20pO1xuICAgIGxldCBmZWlzaHVUaXRsZSA9IHRpdGxlTWF0Y2g/LlsxXT8udHJpbSgpID8/IG5vZGVfdG9rZW47XG4gICAgLy8gXHU1OTgyXHU2NzlDIG1kIFx1OTFDQ1x1NjcwOSBIMVx1RkYwQ1x1NEVDRVx1NkI2M1x1NjU4N1x1NTNCQlx1NjM4OVx1RkYwOE9CIFx1NjU4N1x1NEVGNiBIMSBcdTRGRERcdTc1NTlcdUZGMENcdTRGNDZcdTkwN0ZcdTUxNERcdTkxQ0RcdTU5MERcdTIwMTRcdTIwMTRcdThGRDlcdTkxQ0NcdTRGRERcdTc1NTkgSDEgXHU0RjVDXHU0RTNBXHU2QjYzXHU2NTg3XHU5OTk2XHU4ODRDXHVGRjA5XG4gICAgLy8gXHU1MUIzXHU3QjU2XHVGRjFBXHU0RkREXHU3NTU5IEgxXHVGRjBDXHU1NkUwXHU0RTNBIE9CIFx1NzY4NFx1NjU4N1x1NEVGNlx1NTQwRFx1NTQ4QyBIMSBcdTUzRUZcdTRFRTVcdTRFMERcdTU0MENcblxuICAgIC8vIFx1NkI2NVx1OUFBNCA0XHVGRjFBZXhpc3RzIFx1NjhDMFx1NjdFNVxuICAgIGNvbnN0IGV4aXN0aW5nRmlsZSA9IGF3YWl0IGZpbmRCeUZlaXNodUlkKGRlcHMuYXBwLCBub2RlX3Rva2VuKTtcbiAgICBjb25zdCBzeW5jVGltZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICBsZXQgYWN0aW9uOiAnY3JlYXRlZCcgfCAndXBkYXRlZCc7XG4gICAgbGV0IGZpbmFsUGF0aDogc3RyaW5nO1xuICAgIGxldCBlbmNvZGluZzogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgaWYgKGV4aXN0aW5nRmlsZSkge1xuICAgICAgLy8gXHU2NkY0XHU2NUIwXHU1MjA2XHU2NTJGXHVGRjFBXHU0RkREXHU3NTU5XHU3NTI4XHU2MjM3XHU2NTM5XHU3Njg0XHU1MTQzXHU2NTcwXHU2MzZFXHVGRjBDXHU1M0VBXHU1MjM3XHU2QjYzXHU2NTg3ICsgXHU3RUQxXHU1QjlBXHU1QjU3XHU2QkI1XG4gICAgICBhY3Rpb24gPSAndXBkYXRlZCc7XG4gICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IGRlcHMuYXBwLnZhdWx0LnJlYWQoZXhpc3RpbmdGaWxlKTtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlRmlsZShleGlzdGluZyk7XG4gICAgICBjb25zdCBtZXJnZWQgPSBtZXJnZUZyb250bWF0dGVyRm9yVXBkYXRlKFxuICAgICAgICBwYXJzZWQuZnJvbnRtYXR0ZXIsXG4gICAgICAgIG5vZGVfdG9rZW4sXG4gICAgICAgIG9ialRva2VuLFxuICAgICAgICBmZWlzaHVUaXRsZSxcbiAgICAgICAgc3luY1RpbWUsXG4gICAgICAgIG1ldGEsXG4gICAgICApO1xuICAgICAgY29uc3QgY29udGVudCA9IGFzc2VtYmxlTWQobWVyZ2VkLCBwcm9jZXNzZWRNZCk7XG4gICAgICBhd2FpdCBkZXBzLmFwcC52YXVsdC5tb2RpZnkoZXhpc3RpbmdGaWxlLCBjb250ZW50KTtcbiAgICAgIGZpbmFsUGF0aCA9IGV4aXN0aW5nRmlsZS5wYXRoO1xuICAgICAgZGVwcy5ub3RpY2UoYFx1MjcwRiBcdTVERjJcdTY2RjRcdTY1QjAgJHtleGlzdGluZ0ZpbGUubmFtZX1gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gXHU2NUIwXHU1RUZBXHU1MjA2XHU2NTJGXG4gICAgICBhY3Rpb24gPSAnY3JlYXRlZCc7XG4gICAgICBjb25zdCBmaWxlbmFtZSA9IG1ha2VGaWxlbmFtZShmZWlzaHVUaXRsZSwgcmVxLmZpbGVuYW1lKTtcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IG1ha2VQYXRoKHRhcmdldERpciwgZmlsZW5hbWUpO1xuXG4gICAgICAvLyBcdTc4NkVcdTRGRERcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjhcbiAgICAgIGF3YWl0IGVuc3VyZUZvbGRlcihkZXBzLmFwcCwgdGFyZ2V0RGlyKTtcblxuICAgICAgY29uc3QgZm0gPSBidWlsZEluaXRpYWxGcm9udG1hdHRlcihub2RlX3Rva2VuLCBvYmpUb2tlbiwgZmVpc2h1VGl0bGUsIHN5bmNUaW1lLCBtZXRhKTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhc3NlbWJsZU1kKGZtLCBwcm9jZXNzZWRNZCk7XG5cbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjU4N1x1NEVGNlx1NjYyRlx1NTQyNlx1NURGMlx1NUI1OFx1NTcyOFx1RkYwOFx1NTQwQ1x1NTQwRFx1NEUwRFx1NTQwQyBmZWlzaHVfaWRcdUZGMDlcbiAgICAgIGNvbnN0IHJlcGxhY2VGaWxlID0gcmVxLnJlcGxhY2VfcGF0aFxuICAgICAgICA/IGRlcHMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChyZXEucmVwbGFjZV9wYXRoKVxuICAgICAgICA6IG51bGw7XG4gICAgICBjb25zdCBleGlzdGluZyA9IGRlcHMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChyZWxhdGl2ZVBhdGgpO1xuICAgICAgaWYgKHJlcGxhY2VGaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgICAgYXdhaXQgZGVwcy5hcHAudmF1bHQubW9kaWZ5KHJlcGxhY2VGaWxlLCBjb250ZW50KTtcbiAgICAgICAgZmluYWxQYXRoID0gcmVwbGFjZUZpbGUucGF0aDtcbiAgICAgICAgYWN0aW9uID0gJ3VwZGF0ZWQnO1xuICAgICAgfSBlbHNlIGlmIChleGlzdGluZyBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgIC8vIFx1NTQwQ1x1NTQwRFx1NTFCMlx1N0E4MVx1RkYxQVx1NTJBMFx1NTQwRVx1N0YwMFxuICAgICAgICBjb25zdCBjb25mbGljdFBhdGggPSBtYWtlUGF0aCh0YXJnZXREaXIsIGAke2ZpbGVuYW1lLnJlcGxhY2UoL1xcLm1kJC8sICcnKX0tJHtub2RlX3Rva2VuLnNsaWNlKDAsIDYpfS5tZGApO1xuICAgICAgICBhd2FpdCBkZXBzLmFwcC52YXVsdC5jcmVhdGUoY29uZmxpY3RQYXRoLCBjb250ZW50KTtcbiAgICAgICAgZmluYWxQYXRoID0gY29uZmxpY3RQYXRoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgY3JlYXRlZCA9IGF3YWl0IGRlcHMuYXBwLnZhdWx0LmNyZWF0ZShyZWxhdGl2ZVBhdGgsIGNvbnRlbnQpO1xuICAgICAgICBmaW5hbFBhdGggPSBjcmVhdGVkLnBhdGg7XG4gICAgICB9XG5cbiAgICAgIGRlcHMubm90aWNlKGBcdTI3MDUgXHU1REYyXHU1MjFCXHU1RUZBICR7ZmlsZW5hbWV9YCk7XG5cbiAgICAgIC8vIFx1NkI2NVx1OUFBNCA3XHVGRjFBYXV0by1yZW5hbWUgXHU3RjE2XHU3ODAxXHU1MjA2XHU5MTREXG4gICAgICBpZiAoc2V0dGluZ3MuYXV0b1JlbmFtZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGVuY29kaW5nID0gYXdhaXQgYXNzaWduRW5jb2RpbmcoZGVwcy5hcHAsIGZpbmFsUGF0aCwgdGFyZ2V0RGlyKTtcbiAgICAgICAgICBpZiAoZW5jb2RpbmcpIHtcbiAgICAgICAgICAgIGRlcHMubm90aWNlKGBcdUQ4M0RcdUREMjIgXHU3RjE2XHU3ODAxXHVGRjFBJHtlbmNvZGluZ31gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGNvbnNvbGUud2FybignW3N5bmMvZmV0Y2hdIGF1dG8tcmVuYW1lIGZhaWxlZDonLCBlcnIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gXHU4QkIwXHU1RjU1XHU2NzAwXHU4RkQxXHU1NDBDXHU2QjY1XG4gICAgZGVwcy5zdGF0ZS5yZWNlbnRTeW5jcy51bnNoaWZ0KHtcbiAgICAgIHRpbWU6IHN5bmNUaW1lLFxuICAgICAgbm9kZV90b2tlbixcbiAgICAgIHRpdGxlOiBmZWlzaHVUaXRsZSxcbiAgICAgIHBhdGg6IGZpbmFsUGF0aCxcbiAgICAgIGFjdGlvbixcbiAgICB9KTtcbiAgICBpZiAoZGVwcy5zdGF0ZS5yZWNlbnRTeW5jcy5sZW5ndGggPiA1MCkge1xuICAgICAgZGVwcy5zdGF0ZS5yZWNlbnRTeW5jcyA9IGRlcHMuc3RhdGUucmVjZW50U3luY3Muc2xpY2UoMCwgNTApO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBvazogdHJ1ZSxcbiAgICAgIHBhdGg6IGZpbmFsUGF0aCxcbiAgICAgIGZpbGVuYW1lOiBmaW5hbFBhdGguc3BsaXQoJy8nKS5wb3AoKSA/PyAnJyxcbiAgICAgIGFjdGlvbixcbiAgICAgIFx1N0YxNlx1NzgwMTogZW5jb2RpbmcsXG4gICAgICBmZWlzaHVfdGl0bGU6IGZlaXNodVRpdGxlLFxuICAgIH07XG4gIH07XG59XG5cbi8qKlxuICogXHU2MzA5IGZlaXNodV9pZCBcdTY3RTVcdTYyN0VcdTVERjJcdTU0MENcdTZCNjVcdTY1ODdcdTRFRjZcdTMwMDJcbiAqIFx1NjI2Qlx1NjNDRiB2YXVsdCBcdTRFMEJcdTYyNDBcdTY3MDkgLm1kXHVGRjBDXHU4OUUzXHU2NzkwIGZyb250bWF0dGVyIFx1NTMzOVx1OTE0RCBmZWlzaHVfaWRcdTMwMDJcbiAqL1xuYXN5bmMgZnVuY3Rpb24gZmluZEJ5RmVpc2h1SWQoYXBwOiBBcHAsIGZlaXNodUlkOiBzdHJpbmcpOiBQcm9taXNlPFRGaWxlIHwgbnVsbD4ge1xuICBjb25zdCBmaWxlcyA9IGFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XG4gIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgIC8vIFx1OERGM1x1OEZDN1x1NjNEMlx1NEVGNlx1NzZFRVx1NUY1NVxuICAgIGlmIChmaWxlLnBhdGguc3RhcnRzV2l0aCgnLm9ic2lkaWFuJykgfHwgZmlsZS5wYXRoLnN0YXJ0c1dpdGgoJy5mZWlzaHUtc3luYycpKSBjb250aW51ZTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgLy8gXHU1RkVCXHU5MDFGXHU2OEMwXHU2RDRCXHVGRjFBXHU1NDJCIGZlaXNodV9pZCBcdTVCNTdcdTZCQjVcdTYyNERcdTg5RTNcdTY3OTBcbiAgICAgIGlmICghY29udGVudC5pbmNsdWRlcygnZmVpc2h1X2lkOicpKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGZtTWF0Y2ggPSBjb250ZW50Lm1hdGNoKC9eLS0tXFxuKFtcXHNcXFNdKj8pXFxuLS0tLyk7XG4gICAgICBpZiAoIWZtTWF0Y2gpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgaWRNYXRjaCA9IGZtTWF0Y2hbMV0ubWF0Y2goL2ZlaXNodV9pZDpcXHMqW1wiJ10/KFtBLVphLXowLTldKykvKTtcbiAgICAgIGlmIChpZE1hdGNoICYmIGlkTWF0Y2hbMV0gPT09IGZlaXNodUlkKSB7XG4gICAgICAgIHJldHVybiBmaWxlO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIFx1Nzg2RVx1NEZERFx1NzZFRVx1NUY1NVx1NUI1OFx1NTcyOFx1RkYwOFx1OTAxMlx1NUY1Mlx1NTIxQlx1NUVGQVx1RkYwOVx1MzAwMlxuICovXG5hc3luYyBmdW5jdGlvbiBlbnN1cmVGb2xkZXIoYXBwOiBBcHAsIGRpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmICghZGlyIHx8IGRpciA9PT0gJy4nIHx8IGRpciA9PT0gJy8nKSByZXR1cm47XG4gIGNvbnN0IGV4aXN0aW5nID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChkaXIpO1xuICBpZiAoZXhpc3RpbmcgaW5zdGFuY2VvZiBURm9sZGVyKSByZXR1cm47XG4gIHRyeSB7XG4gICAgYXdhaXQgYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihkaXIpO1xuICB9IGNhdGNoIHtcbiAgICAvLyBcdTUzRUZcdTgwRkRcdTcyMzZcdTc2RUVcdTVGNTVcdTRFNUZcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTkwMTJcdTVGNTJcbiAgICBjb25zdCBwYXJlbnQgPSBkaXIuc3BsaXQoJy8nKS5zbGljZSgwLCAtMSkuam9pbignLycpO1xuICAgIGlmIChwYXJlbnQpIGF3YWl0IGVuc3VyZUZvbGRlcihhcHAsIHBhcmVudCk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGFwcC52YXVsdC5jcmVhdGVGb2xkZXIoZGlyKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIFx1NURGMlx1NUI1OFx1NTcyOFx1NjIxNlx1NTE3Nlx1NEVENlx1OTUxOVx1OEJFRlx1RkYwQ1x1NUZGRFx1NzU2NVxuICAgIH1cbiAgfVxufVxuIiwgIi8qKlxuICogXHU2NTg3XHU0RUY2IElPXHVGRjFBXHU4QkZCXHU1MTk5IHZhdWx0IFx1NEUyRFx1NzY4NCAubWQgXHU2NTg3XHU0RUY2XHUzMDAyXG4gKiBcdTRGOURcdTYzNkVcdTY1QjlcdTY4NDggXHUwMEE3Nlx1RkYwOFx1NTE3M1x1OTUyRVx1NkQ0MVx1N0EwQlx1RkYwOSsgYDAyX1lBTUxcdTVCNTdcdTZCQjVcdTg5QzRcdTgzMDMubWRgXHUzMDAyXG4gKlxuICogLSByZWFkZXJcdUZGMUFcdTg5RTNcdTY3OTAgZnJvbnRtYXR0ZXIgKyBib2R5XHVGRjBDXHU4QkExXHU3Qjk3IGhhc2hcdUZGMENcdTZCRDRcdTVCRjkgc3luY19oYXNoXG4gKiAtIHdyaXRlclx1RkYxQVx1N0VDNFx1ODhDNSBZQU1MICsgYm9keVx1RkYwQ1x1NTE5OVx1NjU4N1x1NEVGNlxuICovXG5pbXBvcnQge1xuICBwYXJzZUZyb250bWF0dGVyLFxuICBzZXJpYWxpemVGcm9udG1hdHRlcixcbiAgYXNzZW1ibGVGaWxlLFxuICBib2R5SGFzaCxcbiAgaXNDaGFuZ2VkLFxuICBzYW5pdGl6ZUZpbGVuYW1lLFxuICB3aXRoTWRFeHQsXG4gIGpvaW5QYXRoLFxuICByZXdyaXRlSW1hZ2VzVG9GZWlzaHVQcm90byxcbiAgdHlwZSBZQU1MRnJvbnRtYXR0ZXIsXG59IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5cbi8qKiBcdThCRkJcdTY1ODdcdTRFRjZcdTdFRDNcdTY3OUNcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkRmlsZSB7XG4gIC8qKiBcdTVCOENcdTY1NzRcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcdTMwMDIgKi9cbiAgY29udGVudDogc3RyaW5nO1xuICAvKiogZnJvbnRtYXR0ZXJcdUZGMDhcdTY1RTBcdTUyMTlcdTRFM0FcdTdBN0FcdTVCRjlcdThDNjFcdUZGMDlcdTMwMDIgKi9cbiAgZnJvbnRtYXR0ZXI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAvKiogXHU2QjYzXHU2NTg3XHVGRjA4XHU0RTBEXHU1NDJCIGZyb250bWF0dGVyXHVGRjA5XHUzMDAyICovXG4gIGJvZHk6IHN0cmluZztcbiAgLyoqIFx1NkI2M1x1NjU4NyBoYXNoXHVGRjA4c2hhMjU2IGhleFx1RkYwOVx1MzAwMiAqL1xuICBoYXNoOiBzdHJpbmc7XG59XG5cbi8qKlxuICogXHU0RUNFXHU1QjhDXHU2NTc0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XHU4OUUzXHU2NzkwXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUZpbGUoY29udGVudDogc3RyaW5nKTogUGFyc2VkRmlsZSB7XG4gIGNvbnN0IHsgZnJvbnRtYXR0ZXIsIGJvZHkgfSA9IHBhcnNlRnJvbnRtYXR0ZXIoY29udGVudCk7XG4gIGNvbnN0IGhhc2ggPSBib2R5SGFzaChib2R5KTtcbiAgcmV0dXJuIHtcbiAgICBjb250ZW50LFxuICAgIGZyb250bWF0dGVyOiBmcm9udG1hdHRlciA/PyB7fSxcbiAgICBib2R5LFxuICAgIGhhc2gsXG4gIH07XG59XG5cbi8qKlxuICogXHU2OEMwXHU2RDRCXHU1MTg1XHU1QkI5XHU2NjJGXHU1NDI2XHU3NkY4XHU1QkY5XHU0RTBBXHU2QjIxXHU1NDBDXHU2QjY1XHU1M0QxXHU3NTFGXHU1M0Q4XHU1MzE2XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNDb250ZW50Q2hhbmdlZChwYXJzZWQ6IFBhcnNlZEZpbGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzQ2hhbmdlZChwYXJzZWQuaGFzaCwgcGFyc2VkLmZyb250bWF0dGVyLnN5bmNfaGFzaCBhcyBzdHJpbmcgfCB1bmRlZmluZWQpO1xufVxuXG4vKipcbiAqIFx1N0VDNFx1ODhDNVx1NjVCMFx1NjU4N1x1NEVGNlx1NzY4NCBmcm9udG1hdHRlclx1RkYwOFx1OThERVx1NEU2Nlx1MjE5Mk9CIFx1OTk5Nlx1NkIyMVx1ODQzRFx1NTczMFx1RkYwOVx1MzAwMlxuICogQHBhcmFtIG1ldGEgXHU0RUNFXHU5OERFXHU0RTY2IGNhbGxvdXQgXHU4OUUzXHU2NzkwXHU1MUZBXHU3Njg0XHU1MTQzXHU2NTcwXHU2MzZFXHVGRjA4XHU2ODA3XHU3QjdFL1x1N0YxNlx1NzgwMS9cdThGOTNcdTUxNjUvXHU2NUU1XHU2NzFGL1x1NTE3M1x1OTUyRVx1OEJDRC9cdThCQzRcdTUyMDYvXHU3RDIyXHU1RjE1XHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEluaXRpYWxGcm9udG1hdHRlcihcbiAgZmVpc2h1SWQ6IHN0cmluZyxcbiAgZmVpc2h1RG9jSWQ6IHN0cmluZyxcbiAgZmVpc2h1VGl0bGU6IHN0cmluZyxcbiAgc3luY1RpbWU6IHN0cmluZyxcbiAgbWV0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogWUFNTEZyb250bWF0dGVyIHtcbiAgcmV0dXJuIHtcbiAgICBmZWlzaHVfaWQ6IGZlaXNodUlkLFxuICAgIGZlaXNodV9kb2NfaWQ6IGZlaXNodURvY0lkLFxuICAgIGZlaXNodV90aXRsZTogZmVpc2h1VGl0bGUsXG4gICAgc3luY190aW1lOiBzeW5jVGltZSxcbiAgICAvLyBcdTk4REVcdTRFNjYgY2FsbG91dCBcdTUxNDNcdTY1NzBcdTYzNkVcdUZGMDhcdTdBN0FcdTUwM0NcdTVCNTdcdTZCQjVcdTRFMERcdTUxOTlcdTUxNjVcdUZGMENcdTRGRERcdTYzMDEgWUFNTCBcdTVFNzJcdTUxQzBcdUZGMDlcbiAgICAuLi4obWV0YSAmJiBzdHJpcEVtcHR5KG1ldGEpKSxcbiAgICAvLyBzeW5jX2hhc2ggXHU1NzI4XHU1MTk5XHU1MTY1XHU2NUY2XHU3NTMxIHdyaXRlciBcdThCQTFcdTdCOTdcdTU4NkJcdTUxNjVcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTU0MDhcdTVFNzZcdTY2RjRcdTY1QjBcdTVERjJcdTY3MDlcdTY1ODdcdTRFRjZcdTc2ODQgZnJvbnRtYXR0ZXJcdUZGMDhcdTRGRERcdTc1NTlcdTc1MjhcdTYyMzdcdTY1MzlcdTc2ODRcdTUxNDNcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVcdUZGMDlcdTMwMDJcbiAqIFx1NTNFQVx1NTIzN1x1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QVx1N0VDNFx1RkYwOGZlaXNodV8qIC8gc3luY18qXHVGRjA5XHVGRjBDXHU0RkREXHU3NTU5IFx1NjgwN1x1N0I3RS9cdTdGMTZcdTc4MDEvXHU4RjkzXHU1MTY1L1x1NjVFNVx1NjcxRi9cdTUxNzNcdTk1MkVcdThCQ0QvXHU4QkM0XHU1MjA2L1x1N0QyMlx1NUYxNSBcdTdCNDlcdTc1MjhcdTYyMzdcdTVCNTdcdTZCQjVcdTMwMDJcbiAqXG4gKiBcdTZDRThcdTYxMEZcdUZGMUFcdTVERjJcdTY3MDlcdTVCNTdcdTZCQjVcdTRGMThcdTUxNDhcdUZGMDhcdTc1MjhcdTYyMzdcdTU3MjggT0IgXHU5MUNDXHU2NTM5XHU4RkM3XHU3Njg0XHVGRjA5XHVGRjBDXHU5OERFXHU0RTY2XHU0RkE3IGNhbGxvdXQgXHU1MTQzXHU2NTcwXHU2MzZFXHU0RUM1XHU1NzI4XHU1QjU3XHU2QkI1XHU3RjNBXHU1OTMxXHU2NUY2XHU4ODY1XHU5RjUwXHUzMDAyXG4gKiBcdThGRDlcdTY4MzdcdTkwN0ZcdTUxNERcdTk4REVcdTRFNjZcdTRGQTdcdTc2ODRcdTY1RTcgY2FsbG91dCBcdTg5ODZcdTc2RDYgT0IgXHU5MUNDXHU3Njg0XHU2NzAwXHU2NUIwXHU2NTc0XHU3NDA2XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUZyb250bWF0dGVyRm9yVXBkYXRlKFxuICBleGlzdGluZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4gIGZlaXNodUlkOiBzdHJpbmcsXG4gIGZlaXNodURvY0lkOiBzdHJpbmcsXG4gIGZlaXNodVRpdGxlOiBzdHJpbmcsXG4gIHN5bmNUaW1lOiBzdHJpbmcsXG4gIG1ldGE/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFlBTUxGcm9udG1hdHRlciB7XG4gIHJldHVybiB7XG4gICAgLy8gXHU1REYyXHU2NzA5XHU1QjU3XHU2QkI1XHU0RjE4XHU1MTQ4XHVGRjA4XHU3NTI4XHU2MjM3XHU2NTM5XHU4RkM3XHU3Njg0XHVGRjA5XHVGRjBDXHU5OERFXHU0RTY2IGNhbGxvdXQgXHU1MTQzXHU2NTcwXHU2MzZFXHU1M0VBXHU4ODY1XHU3RjNBXHU1OTMxXG4gICAgLi4uKG1ldGEgJiYgc3RyaXBFbXB0eShtZXRhKSksXG4gICAgLi4uZXhpc3RpbmcsXG4gICAgZmVpc2h1X2lkOiBmZWlzaHVJZCxcbiAgICBmZWlzaHVfZG9jX2lkOiBmZWlzaHVEb2NJZCxcbiAgICBmZWlzaHVfdGl0bGU6IGZlaXNodVRpdGxlLFxuICAgIHN5bmNfdGltZTogc3luY1RpbWUsXG4gIH0gYXMgWUFNTEZyb250bWF0dGVyO1xufVxuXG4vKiogXHU3OUZCXHU5NjY0XHU1MDNDXHU0RTNBXHU3QTdBXHVGRjA4dW5kZWZpbmVkL251bGwvJycvXHU3QTdBXHU2NTcwXHU3RUM0XHVGRjA5XHU3Njg0XHU1QjU3XHU2QkI1XHVGRjBDXHU5MDdGXHU1MTREXHU2QzYxXHU2N0QzIFlBTUxcdTMwMDIgKi9cbmZ1bmN0aW9uIHN0cmlwRW1wdHkob2JqOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSBudWxsIHx8IHYgPT09ICcnKSBjb250aW51ZTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2KSAmJiB2Lmxlbmd0aCA9PT0gMCkgY29udGludWU7XG4gICAgb3V0W2tdID0gdjtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFx1N0VDNFx1ODhDNVx1NjcwMFx1N0VDOFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVx1RkYwOFlBTUwgKyBcdTZCNjNcdTY1ODcgKyBoYXNoXHVGRjA5XHUzMDAyXG4gKiBAcGFyYW0gZnJvbnRtYXR0ZXIgXHU1NDBDXHU2QjY1XHU3RUQxXHU1QjlBICsgXHU3NTI4XHU2MjM3XHU1MTQzXHU2NTcwXHU2MzZFXG4gKiBAcGFyYW0gYm9keSBcdTZCNjNcdTY1ODcgbWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VtYmxlTWQoZnJvbnRtYXR0ZXI6IFlBTUxGcm9udG1hdHRlciwgYm9keTogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gXHU4QkExXHU3Qjk3XHU1RTc2XHU1MTk5XHU1MTY1IHN5bmNfaGFzaFxuICBjb25zdCBoYXNoID0gYm9keUhhc2goYm9keSk7XG4gIGNvbnN0IGZtV2l0aEhhc2g6IFlBTUxGcm9udG1hdHRlciA9IHtcbiAgICAuLi5mcm9udG1hdHRlcixcbiAgICBzeW5jX2hhc2g6IGhhc2gsXG4gIH07XG4gIHJldHVybiBhc3NlbWJsZUZpbGUoZm1XaXRoSGFzaCwgYm9keSk7XG59XG5cbi8qKlxuICogXHU2MjhBXHU5OERFXHU0RTY2XHU1QkZDXHU1MUZBXHU3Njg0IG1kIFx1NTkwNFx1NzQwNlx1NEUzQSBPQiBcdTZCNjNcdTY1ODdcdTMwMDJcbiAqIC0gXHU1NkZFXHU3MjQ3IGF1dGhjb2RlIFVSTCBcdTIxOTIgZmVpc2h1Oi8vVE9LRU5cbiAqIC0gXHU2ODA3XHU5ODk4XHU4ODRDXHU1M0JCXHU2Mzg5XHVGRjA4XHU2ODA3XHU5ODk4XHU1REYyXHU1NzI4IGZyb250bWF0dGVyLmZlaXNodV90aXRsZVx1RkYwQ09CIFx1OTFDQyBIMSBcdTRGRERcdTc1NTlcdTRGNDZcdTk4REVcdTRFNjZcdTRGQTdcdTc1MzEgb2JqIFx1NTkwNFx1NzQwNlx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0ZlaXNodU1kKG1kOiBzdHJpbmcsIGltZ1Rva2VuczogU2V0PHN0cmluZz4pOiBzdHJpbmcge1xuICByZXR1cm4gcmV3cml0ZUltYWdlc1RvRmVpc2h1UHJvdG8obWQsIGltZ1Rva2Vucyk7XG59XG5cbi8qKlxuICogXHU3NTFGXHU2MjEwXHU4NDNEXHU1NzMwXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU1Qjg5XHU1MTY4XHU2RTA1XHU2RDE3XHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlRmlsZW5hbWUoZmVpc2h1VGl0bGU6IHN0cmluZywgb3ZlcnJpZGU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBuYW1lID0gb3ZlcnJpZGUgPyBzYW5pdGl6ZUZpbGVuYW1lKG92ZXJyaWRlKSA6IHNhbml0aXplRmlsZW5hbWUoZmVpc2h1VGl0bGUpO1xuICByZXR1cm4gd2l0aE1kRXh0KG5hbWUpO1xufVxuXG4vKipcbiAqIFx1NjJGQ1x1NjNBNVx1ODQzRFx1NTczMFx1OERFRlx1NUY4NFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZVBhdGgoZGlyOiBzdHJpbmcgfCB1bmRlZmluZWQsIGZpbGVuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gam9pblBhdGgoZGlyLCBmaWxlbmFtZSk7XG59XG4iLCAiLyoqXG4gKiBhdXRvLXJlbmFtZSBcdTdGMTZcdTc4MDFcdTUyMDZcdTkxNERcdTMwMDJcdTRGOURcdTYzNkUgYDI2XzA1MDlfU18wOF9hNGIxMCBcdTRFMDlcdTc5Q0RcdTdGMTZcdTc4MDFcdTZBMjFcdTVGMEZcdTVCOUVcdTczQjBcdThCRjRcdTY2MEUubWRgXG4gKiArIGBcdTc3RTVcdThCQzZcdTVFOTNcdTgxRUFcdTUyQThcdTYyNTNcdTY4MDdcdTUzNEZcdThCQUVcdThGQjlcdTc1NEMubWRgICsgYDAyX1lBTUxcdTVCNTdcdTZCQjVcdTg5QzRcdTgzMDMubWRgIFx1MDBBNzIuM1x1MzAwMlxuICpcbiAqIFx1N0YxNlx1NzgwMVx1NjgzQ1x1NUYwRlx1RkYxQVlZX01NRERfXHU2ODA3XHU3QjdFX1x1NUU4Rlx1NTNGN1tfXHU1QjUwXHU1RThGXHU1M0Y3XVxuICogICAtIFx1NjU4N1x1NEVGNlx1RkYxQVx1ODIxMlx1NUM1NVx1NTc4QiBTXzAxXHVGRjA4XHU2ODA3XHU3QjdFX1x1NUU4Rlx1NTNGNyBcdTc1MjhcdTRFMEJcdTUyMTJcdTdFQkZcdUZGMDlcbiAqICAgLSBcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMUFcdTdEMjdcdTUxRDFcdTU3OEIgUzAxXHVGRjA4XHU2ODA3XHU3QjdFXHU1RThGXHU1M0Y3IFx1NjVFMFx1NEUwQlx1NTIxMlx1N0VCRlx1RkYwOVxuICpcbiAqIFx1NjgwN1x1N0I3RVx1NEY1M1x1N0NGQlx1RkYwODYgXHU3QzdCXHVGRjBDXHU1NDJCXHU4ODY1XHU1MTY4XHU3Njg0IFEgXHU3MDc1XHU2QzE0XHVGRjA5XHVGRjFBXG4gKiAgIFM9XHU2NTM2XHU5NkM2ICBYPVx1OTg3OVx1NzZFRSAgTD1cdTk4ODZcdTU3REYgIFo9XHU4RDQ0XHU2RTkwICBRPVx1NzA3NVx1NjExRiAgSj1cdTYyODBcdTgwRkRcbiAqXG4gKiBcdTg5RTZcdTUzRDFcdUZGMUFmZXRjaCBcdTg0M0RcdTU3MzBcdTU0MEVcdTMwMDFcdTUzRjNcdTk1MkVcdTgzRENcdTUzNTVcdTMwMDFyaWJib24gXHU2Mjc5XHU5MUNGXHUzMDAyXG4gKi9cbmltcG9ydCB0eXBlIHsgQXBwLCBURmlsZSwgVEZvbGRlciB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IHBhcnNlRnJvbnRtYXR0ZXIsIHNlcmlhbGl6ZUZyb250bWF0dGVyLCBhc3NlbWJsZUZpbGUsIHR5cGUgVGFnIH0gZnJvbSAnQHN5bmMvc2hhcmVkJztcblxuLyoqIFx1NjgwN1x1N0I3RSBcdTIxOTIgXHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0XHVGRjA4XHU0RjlEXHU2MzZFIDAxX1x1NUJGOVx1NkJENFx1NjJBNVx1NTQ0QS5tZCBcdTc2ODRcdTc2RUVcdTVGNTVcdThERUZcdTc1MzFcdTg5QzRcdTUyMTlcdUZGMDlcdTMwMDIgKi9cbmNvbnN0IFRBR19CWV9ESVJfSElOVDogUmVjb3JkPHN0cmluZywgVGFnPiA9IHtcbiAgJzBcdUZFMEZcdTIwRTNcdThGOTNcdTUxNjUnOiAnUycsXG4gICcxXHVGRTBGXHUyMEUzXHU4RjkzXHU1MUZBJzogJ1gnLFxuICAnMlx1RkUwRlx1MjBFM1x1RDgzRFx1RERDM1x1NzdFNVx1OEJDNlx1NkM2MCc6ICdaJyxcbn07XG5cbi8qKiBcdTdGMTZcdTc4MDFcdTZCNjNcdTUyMTlcdUZGMUFZWV9NTUREX1RfTk5bX2FOXVx1MzAwMiAqL1xuY29uc3QgQ09ERV9SRSA9IC9eKFxcZHsyfSlfKFxcZHs0fSlfKFtTWFNMWlFKXSlfKFxcZCspKD86XyhbYS16XVxcZCspKT8kLztcblxuLyoqXG4gKiBcdTRFQ0VcdTY1ODdcdTRFRjZcdTYyNDBcdTU3MjhcdTc2RUVcdTVGNTVcdTYzQThcdTVCRkNcdTY4MDdcdTdCN0VcdTMwMDJcbiAqIFx1NEYxOFx1NTE0OFx1N0VBN1x1RkYxQVlBTUwgXHU2ODA3XHU3QjdFXHU1QjU3XHU2QkI1ID4gXHU3NkVFXHU1RjU1XHU1MjREXHU3RjAwID4gXHU5RUQ4XHU4QkE0IFNcdTMwMDJcbiAqL1xuZnVuY3Rpb24gaW5mZXJUYWcoZGlyOiBzdHJpbmcsIGV4aXN0aW5nVGFnPzogVGFnKTogVGFnIHtcbiAgaWYgKGV4aXN0aW5nVGFnICYmIFsnUycsICdYJywgJ0wnLCAnWicsICdRJywgJ0onXS5pbmNsdWRlcyhleGlzdGluZ1RhZykpIHtcbiAgICByZXR1cm4gZXhpc3RpbmdUYWc7XG4gIH1cbiAgZm9yIChjb25zdCBbZGlySGludCwgdGFnXSBvZiBPYmplY3QuZW50cmllcyhUQUdfQllfRElSX0hJTlQpKSB7XG4gICAgaWYgKGRpci5zdGFydHNXaXRoKGRpckhpbnQpKSByZXR1cm4gdGFnO1xuICB9XG4gIC8vIFx1NzdFNVx1OEJDNlx1NkM2MFx1NEUwQlx1NzY4NFx1NUI1MFx1NzZFRVx1NUY1NVx1NTNFRlx1ODBGRFx1OEZEQlx1NEUwMFx1NkI2NVx1N0VDNlx1NTIwNlxuICBpZiAoZGlyLmluY2x1ZGVzKCdcdTc3RTVcdThCQzZcdTZDNjAnKSB8fCBkaXIuaW5jbHVkZXMoJ1x1RDgzRFx1RERDMycpKSB7XG4gICAgLy8gXHU4RDQ0XHU2RTkwXHU3QzdCXHU5RUQ4XHU4QkE0IFpcdUZGMENcdTUzRUZcdTg4QUJcdTc2RUVcdTVGNTVcdTU0MERcdTg5ODZcdTc2RDZcbiAgICBpZiAoZGlyLmluY2x1ZGVzKCdMJykgfHwgZGlyLmluY2x1ZGVzKCdcdTk4ODZcdTU3REYnKSkgcmV0dXJuICdMJztcbiAgICBpZiAoZGlyLmluY2x1ZGVzKCdRJykgfHwgZGlyLmluY2x1ZGVzKCdcdTcwNzVcdTYxMUYnKSkgcmV0dXJuICdRJztcbiAgICBpZiAoZGlyLmluY2x1ZGVzKCdKJykgfHwgZGlyLmluY2x1ZGVzKCdcdTYyODBcdTgwRkQnKSkgcmV0dXJuICdKJztcbiAgICByZXR1cm4gJ1onO1xuICB9XG4gIGlmIChkaXIuaW5jbHVkZXMoJ1x1OEY5M1x1NTFGQScpIHx8IGRpci5pbmNsdWRlcygnMVx1RkUwRlx1MjBFMycpKSByZXR1cm4gJ1gnO1xuICBpZiAoZGlyLmluY2x1ZGVzKCdcdThGOTNcdTUxNjUnKSB8fCBkaXIuaW5jbHVkZXMoJzBcdUZFMEZcdTIwRTMnKSkgcmV0dXJuICdTJztcbiAgcmV0dXJuICdTJztcbn1cblxuLyoqXG4gKiBcdTYyNkJcdTYzQ0ZcdTU0MENcdTc2RUVcdTVGNTVcdTRFMEJcdTU0MENcdTY4MDdcdTdCN0VcdTc2ODRcdTY3MDBcdTU5MjdcdTVFOEZcdTUzRjdcdUZGMENcdTUyMDZcdTkxNERcdTY1QjBcdTVFOEZcdTUzRjdcdTMwMDJcbiAqL1xuYXN5bmMgZnVuY3Rpb24gbmV4dFNlcXVlbmNlKGFwcDogQXBwLCBkaXI6IHN0cmluZywgdGFnOiBUYWcpOiBQcm9taXNlPG51bWJlcj4ge1xuICBjb25zdCBmb2xkZXIgPSBhcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGRpcik7XG4gIGlmICghKGZvbGRlciBpbnN0YW5jZW9mIFRGb2xkZXIpKSByZXR1cm4gMTtcblxuICBsZXQgbWF4U2VxID0gMDtcbiAgZm9yIChjb25zdCBjaGlsZCBvZiBmb2xkZXIuY2hpbGRyZW4pIHtcbiAgICBpZiAoIShjaGlsZCBpbnN0YW5jZW9mIFRGaWxlKSB8fCAhY2hpbGQubmFtZS5lbmRzV2l0aCgnLm1kJykpIGNvbnRpbnVlO1xuICAgIGNvbnN0IG1hdGNoID0gY2hpbGQubmFtZS5tYXRjaChDT0RFX1JFKTtcbiAgICBpZiAobWF0Y2ggJiYgbWF0Y2hbM10gPT09IHRhZykge1xuICAgICAgY29uc3Qgc2VxID0gcGFyc2VJbnQobWF0Y2hbNF0sIDEwKTtcbiAgICAgIGlmIChzZXEgPiBtYXhTZXEpIG1heFNlcSA9IHNlcTtcbiAgICB9XG4gICAgLy8gXHU0RTVGXHU1MzM5XHU5MTREXHU2NUUwXHU1MjREXHU3RjAwXHU0RjQ2XHU2NzA5IFlBTUwgXHU3RjE2XHU3ODAxXHU3Njg0XHU2MEM1XHU1MUI1XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGFwcC52YXVsdC5yZWFkKGNoaWxkKTtcbiAgICAgICAgY29uc3QgeyBmcm9udG1hdHRlciB9ID0gcGFyc2VGcm9udG1hdHRlcihjb250ZW50KTtcbiAgICAgICAgY29uc3QgZW5jID0gZnJvbnRtYXR0ZXI/Llx1N0YxNlx1NzgwMSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChlbmMpIHtcbiAgICAgICAgICBjb25zdCBlbmNNYXRjaCA9IGVuYy5tYXRjaChDT0RFX1JFKTtcbiAgICAgICAgICBpZiAoZW5jTWF0Y2ggJiYgZW5jTWF0Y2hbM10gPT09IHRhZykge1xuICAgICAgICAgICAgY29uc3Qgc2VxID0gcGFyc2VJbnQoZW5jTWF0Y2hbNF0sIDEwKTtcbiAgICAgICAgICAgIGlmIChzZXEgPiBtYXhTZXEpIG1heFNlcSA9IHNlcTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1heFNlcSArIDE7XG59XG5cbi8qKlxuICogXHU0RTNBXHU2NTg3XHU0RUY2XHU1MjA2XHU5MTREXHU3RjE2XHU3ODAxXHUzMDAyXG4gKiAtIFx1NzUxRlx1NjIxMCBZWV9NTUREX1RfTk4gXHU2ODNDXHU1RjBGXG4gKiAtIFx1OTFDRFx1NTQ3RFx1NTQwRFx1NjU4N1x1NEVGNlx1RkYwOFx1NTJBMFx1N0YxNlx1NzgwMVx1NTI0RFx1N0YwMFx1RkYwOVxuICogLSBcdTUxOTlcdTU2REUgWUFNTCBcdTdGMTZcdTc4MDFcdTVCNTdcdTZCQjVcbiAqXG4gKiBAcmV0dXJucyBcdTUyMDZcdTkxNERcdTUyMzBcdTc2ODRcdTdGMTZcdTc4MDFcdTRFMzJcdUZGMENcdTU5ODIgXCIyNl8wNjE1X1NfMDFcIlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXNzaWduRW5jb2RpbmcoXG4gIGFwcDogQXBwLFxuICBmaWxlUGF0aDogc3RyaW5nLFxuICBkaXI6IHN0cmluZyxcbik6IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPiB7XG4gIGNvbnN0IGZpbGUgPSBhcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGZpbGVQYXRoKTtcbiAgaWYgKCEoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuICBjb25zdCBjb250ZW50ID0gYXdhaXQgYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gIGNvbnN0IHsgZnJvbnRtYXR0ZXIsIGJvZHkgfSA9IHBhcnNlRnJvbnRtYXR0ZXIoY29udGVudCk7XG4gIGNvbnN0IGZtID0gZnJvbnRtYXR0ZXIgPz8ge307XG5cbiAgLy8gXHU1REYyXHU2NzA5XHU3RjE2XHU3ODAxXHU1QzMxXHU4REYzXHU4RkM3XG4gIGlmIChmbS5cdTdGMTZcdTc4MDEgJiYgQ09ERV9SRS50ZXN0KGZtLlx1N0YxNlx1NzgwMSBhcyBzdHJpbmcpKSB7XG4gICAgcmV0dXJuIGZtLlx1N0YxNlx1NzgwMSBhcyBzdHJpbmc7XG4gIH1cblxuICAvLyBcdTYzQThcdTVCRkNcdTY4MDdcdTdCN0UgKyBcdTVFOEZcdTUzRjdcbiAgY29uc3QgdGFnID0gaW5mZXJUYWcoZGlyLCBmbS5cdTY4MDdcdTdCN0UgYXMgVGFnIHwgdW5kZWZpbmVkKTtcbiAgY29uc3Qgc2VxID0gYXdhaXQgbmV4dFNlcXVlbmNlKGFwcCwgZGlyLCB0YWcpO1xuXG4gIC8vIFx1NzUxRlx1NjIxMFx1N0YxNlx1NzgwMVxuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICBjb25zdCB5eSA9IFN0cmluZyhub3cuZ2V0RnVsbFllYXIoKSkuc2xpY2UoMik7XG4gIGNvbnN0IG1tZGQgPSBgJHtTdHJpbmcobm93LmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCAnMCcpfSR7U3RyaW5nKG5vdy5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsICcwJyl9YDtcbiAgY29uc3QgY29kZSA9IGAke3l5fV8ke21tZGR9XyR7dGFnfV8ke1N0cmluZyhzZXEpLnBhZFN0YXJ0KDIsICcwJyl9YDtcblxuICAvLyBcdTUxOTlcdTU2REUgWUFNTFxuICBjb25zdCBuZXdGbSA9IHsgLi4uZm0sIFx1NjgwN1x1N0I3RTogdGFnLCBcdTdGMTZcdTc4MDE6IGNvZGUgfTtcbiAgY29uc3QgbmV3Q29udGVudCA9IGFzc2VtYmxlRmlsZShuZXdGbSwgYm9keSk7XG4gIGF3YWl0IGFwcC52YXVsdC5tb2RpZnkoZmlsZSwgbmV3Q29udGVudCk7XG5cbiAgLy8gXHU5MUNEXHU1NDdEXHU1NDBEXHU2NTg3XHU0RUY2XHVGRjA4XHU1MkEwXHU3RjE2XHU3ODAxXHU1MjREXHU3RjAwXHVGRjA5XG4gIGNvbnN0IGV4dCA9IGZpbGUuZXh0ZW5zaW9uO1xuICBjb25zdCBvbGROYW1lID0gZmlsZS5iYXNlbmFtZTtcbiAgY29uc3QgbmV3TmFtZSA9IGAke2NvZGV9ICR7b2xkTmFtZX1gO1xuICBjb25zdCBuZXdQYXRoID0gZmlsZVBhdGgucmVwbGFjZSgvW14vXSskLywgYCR7bmV3TmFtZX0uJHtleHR9YCk7XG4gIGlmIChuZXdQYXRoICE9PSBmaWxlUGF0aCkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBhcHAudmF1bHQucmVuYW1lKGZpbGUsIG5ld1BhdGgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS53YXJuKCdbc3luYy9hdXRvUmVuYW1lXSByZW5hbWUgZmFpbGVkOicsIGVycik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvZGU7XG59XG5cbi8qKlxuICogXHU2Mjc5XHU5MUNGXHU1MjA2XHU5MTREXHU3RjE2XHU3ODAxXHVGRjA4cmliYm9uIFx1ODlFNlx1NTNEMVx1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYmF0Y2hBc3NpZ25FbmNvZGluZyhhcHA6IEFwcCwgZGlyOiBzdHJpbmcpOiBQcm9taXNlPHsgdG90YWw6IG51bWJlcjsgYXNzaWduZWQ6IG51bWJlciB9PiB7XG4gIGNvbnN0IGZvbGRlciA9IGFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZGlyKTtcbiAgaWYgKCEoZm9sZGVyIGluc3RhbmNlb2YgVEZvbGRlcikpIHJldHVybiB7IHRvdGFsOiAwLCBhc3NpZ25lZDogMCB9O1xuXG4gIGxldCBhc3NpZ25lZCA9IDA7XG4gIGxldCB0b3RhbCA9IDA7XG4gIGZvciAoY29uc3QgY2hpbGQgb2YgZm9sZGVyLmNoaWxkcmVuKSB7XG4gICAgaWYgKCEoY2hpbGQgaW5zdGFuY2VvZiBURmlsZSkgfHwgIWNoaWxkLm5hbWUuZW5kc1dpdGgoJy5tZCcpKSBjb250aW51ZTtcbiAgICB0b3RhbCsrO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhc3NpZ25FbmNvZGluZyhhcHAsIGNoaWxkLnBhdGgsIGRpcik7XG4gICAgICBpZiAocmVzdWx0KSBhc3NpZ25lZCsrO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS53YXJuKGBbc3luYy9hdXRvUmVuYW1lXSBiYXRjaCBmYWlsZWQgZm9yICR7Y2hpbGQucGF0aH06YCwgZXJyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHsgdG90YWwsIGFzc2lnbmVkIH07XG59XG5cbi8qKlxuICogXHU4OUUzXHU3ODAxXHVGRjFBXHU0RUNFXHU2NTg3XHU0RUY2XHU1NDBEXHU2MjE2IFlBTUwgXHU2M0QwXHU1M0Q2XHU3RjE2XHU3ODAxXHU0RkUxXHU2MDZGXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVDb2RlKGNvZGU6IHN0cmluZyk6IHtcbiAgeXk6IHN0cmluZztcbiAgbW1kZDogc3RyaW5nO1xuICB0YWc6IFRhZztcbiAgc2VxOiBudW1iZXI7XG4gIHN1Yj86IHN0cmluZztcbn0gfCBudWxsIHtcbiAgY29uc3QgbWF0Y2ggPSBjb2RlLm1hdGNoKENPREVfUkUpO1xuICBpZiAoIW1hdGNoKSByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIHtcbiAgICB5eTogbWF0Y2hbMV0sXG4gICAgbW1kZDogbWF0Y2hbMl0sXG4gICAgdGFnOiBtYXRjaFszXSBhcyBUYWcsXG4gICAgc2VxOiBwYXJzZUludChtYXRjaFs0XSwgMTApLFxuICAgIHN1YjogbWF0Y2hbNV0sXG4gIH07XG59XG4iLCAiLyoqXG4gKiBQT1NUIC9jbGlwIFx1MjAxNCBcdTRFRkJcdTYxMEZcdTdGNTFcdTk4NzUvXHU1MjEyXHU4QkNEXHU1MjZBXHU1QjU4XHU1MjMwIE9ic2lkaWFuXHUzMDAyXG4gKlxuICogTVZQIFx1NTFCM1x1N0I1Nlx1RkYxQVxuICogLSBcdTRFMERcdTdFRDFcdTVCOUEgZmVpc2h1X2lkXHVGRjBDXHU5MDdGXHU1MTREXHU2MjhBXHU2NjZFXHU5MDFBXHU3RjUxXHU5ODc1XHU0RjJBXHU4OEM1XHU2MjEwXHU5OERFXHU0RTY2XHU1NDBDXHU2QjY1XHU2NTg3XHU0RUY2XHUzMDAyXG4gKiAtIFx1NTE5OVx1NTE2NVx1NjNEMlx1NEVGNlx1OUVEOFx1OEJBNFx1NzZFRVx1NUY1NVx1NjIxNlx1OEJGN1x1NkM0Mlx1NEYyMFx1NTE2NVx1NzZFRVx1NUY1NVx1MzAwMlxuICogLSBcdTRGN0ZcdTc1MjhcdTc3RTVcdThCQzZcdTVFOTNcdTVCNTdcdTZCQjVcdTk4ODRcdThCQkVcdTU4NkJcdTUxNDVcdTU3RkFcdTc4NDAgWUFNTFx1RkYwQ1x1N0YxNlx1NzgwMVx1NEVDRFx1NEVBNFx1N0VEOSBhdXRvLXJlbmFtZVx1MzAwMlxuICovXG5pbXBvcnQgeyBhc3NlbWJsZUZpbGUsIHR5cGUgQ2xpcFJlcXVlc3QsIHR5cGUgQ2xpcFJlc3BvbnNlIH0gZnJvbSAnQHN5bmMvc2hhcmVkJztcbmltcG9ydCB7IEFwcCwgVEZpbGUsIFRGb2xkZXIgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IFJlcXVlc3RDb250ZXh0IH0gZnJvbSAnLi4vc2VydmVyLmpzJztcbmltcG9ydCB0eXBlIHsgRmVpc2h1U3luY1NldHRpbmdzIH0gZnJvbSAnLi4vc2V0dGluZ3MuanMnO1xuaW1wb3J0IHsgbWFrZUZpbGVuYW1lLCBtYWtlUGF0aCB9IGZyb20gJy4uL2ZpbGVpby93cml0ZXIuanMnO1xuaW1wb3J0IHsgYXNzaWduRW5jb2RpbmcgfSBmcm9tICcuLi9hdXRvUmVuYW1lLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBDbGlwRGVwcyB7XG4gIGFwcDogQXBwO1xuICBzZXR0aW5nczogRmVpc2h1U3luY1NldHRpbmdzO1xuICBub3RpY2U6IChtc2c6IHN0cmluZykgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNsaXBIYW5kbGVyKGRlcHM6IENsaXBEZXBzKSB7XG4gIHJldHVybiBhc3luYyAoY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8Q2xpcFJlc3BvbnNlPiA9PiB7XG4gICAgY29uc3QgcmVxID0gKGN0eC5ib2R5ID8/IHt9KSBhcyBDbGlwUmVxdWVzdDtcbiAgICBjb25zdCB0aXRsZSA9IGNsZWFuVGV4dChyZXEudGl0bGUpIHx8ICdcdTdGNTFcdTk4NzVcdTUyNkFcdTg1Q0YnO1xuICAgIGNvbnN0IHVybCA9IGNsZWFuVGV4dChyZXEudXJsKTtcbiAgICBjb25zdCB0ZXh0ID0gY2xlYW5UZXh0KHJlcS50ZXh0KTtcbiAgICBjb25zdCByYXdUZXh0ID0gY2xlYW5UZXh0KHJlcS5yYXdUZXh0KSB8fCB0ZXh0O1xuICAgIGNvbnN0IGJvZHlNYXJrZG93biA9IGNsZWFuVGV4dChyZXEuYm9keU1hcmtkb3duKTtcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGNsZWFuVGV4dChyZXEuZGVzY3JpcHRpb24pO1xuICAgIGNvbnN0IHNvdXJjZUtpbmQgPSBjbGVhblRleHQocmVxLnNvdXJjZUtpbmQpIHx8ICdnZW5lcmljLXBhZ2UnO1xuICAgIGNvbnN0IGFwcGVuZFBhdGggPSBjbGVhblBhdGgocmVxLmFwcGVuZFBhdGgpO1xuICAgIGlmICghdXJsICYmICF0ZXh0ICYmICFib2R5TWFya2Rvd24gJiYgIXJhd1RleHQpIHtcbiAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoJ3VybCBvciB0ZXh0IGlzIHJlcXVpcmVkJykgYXMgRXJyb3IgJiB7IGNvZGU6IHN0cmluZzsgc3RhdHVzOiBudW1iZXIgfTtcbiAgICAgIGUuY29kZSA9ICdNSVNTSU5HX0NMSVBfQ09OVEVOVCc7XG4gICAgICBlLnN0YXR1cyA9IDQwMDtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRlZEF0ID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCB0YXJnZXREaXIgPSBjbGVhbkRpcihyZXEuZGlyKSB8fCBkZXBzLnNldHRpbmdzLmRlZmF1bHREaXI7XG4gICAgY29uc3QgbWV0YSA9IG5vcm1hbGl6ZUNsaXBNZXRhKHJlcS5tZXRhLCB7XG4gICAgICB0aXRsZSxcbiAgICAgIHVybCxcbiAgICAgIHRleHQ6IHJhd1RleHQgfHwgYm9keU1hcmtkb3duIHx8IHRleHQsXG4gICAgICBkZXNjcmlwdGlvbixcbiAgICAgIGRpcjogdGFyZ2V0RGlyLFxuICAgICAgZGF0ZTogZm9ybWF0RGF0ZShjcmVhdGVkQXQpLFxuICAgIH0pO1xuXG4gICAgY29uc3QgY29udGVudElucHV0ID0ge1xuICAgICAgdGl0bGUsXG4gICAgICB1cmwsXG4gICAgICB0ZXh0LFxuICAgICAgcmF3VGV4dCxcbiAgICAgIGJvZHlNYXJrZG93bixcbiAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgZGlyOiB0YXJnZXREaXIsXG4gICAgICBtZXRhLFxuICAgICAgc291cmNlS2luZCxcbiAgICAgIGRhdGU6IGZvcm1hdERhdGUoY3JlYXRlZEF0KSxcbiAgICAgIGNyZWF0ZWRBdDogY3JlYXRlZEF0LnRvSVNPU3RyaW5nKCksXG4gICAgfTtcblxuICAgIGlmIChhcHBlbmRQYXRoKSB7XG4gICAgICBjb25zdCB0YXJnZXQgPSBkZXBzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoYXBwZW5kUGF0aCk7XG4gICAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBURmlsZSkpIHtcbiAgICAgICAgY29uc3QgZSA9IG5ldyBFcnJvcihgXHU4ODY1XHU1MTQ1XHU3NkVFXHU2ODA3XHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjFBJHthcHBlbmRQYXRofWApIGFzIEVycm9yICYgeyBjb2RlOiBzdHJpbmc7IHN0YXR1czogbnVtYmVyIH07XG4gICAgICAgIGUuY29kZSA9ICdBUFBFTkRfVEFSR0VUX05PVF9GT1VORCc7XG4gICAgICAgIGUuc3RhdHVzID0gNDA0O1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgICAgY29uc3QgY3VycmVudCA9IGF3YWl0IGRlcHMuYXBwLnZhdWx0LnJlYWQodGFyZ2V0KTtcbiAgICAgIGNvbnN0IGFwcGVuZGl4ID0gYnVpbGRBcHBlbmRNYXJrZG93bihjb250ZW50SW5wdXQpO1xuICAgICAgYXdhaXQgZGVwcy5hcHAudmF1bHQubW9kaWZ5KHRhcmdldCwgYCR7Y3VycmVudC5yZXBsYWNlKC9cXHMqJC8sICcnKX1cXG5cXG4ke2FwcGVuZGl4fVxcbmApO1xuICAgICAgZGVwcy5ub3RpY2UoYFx1RDgzRFx1RENERCBcdTVERjJcdTg4NjVcdTUxNDVcdTUyMzAgJHthcHBlbmRQYXRofWApO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb2s6IHRydWUsXG4gICAgICAgIHBhdGg6IHRhcmdldC5wYXRoLFxuICAgICAgICBmaWxlbmFtZTogdGFyZ2V0Lm5hbWUsXG4gICAgICAgIGFjdGlvbjogJ3VwZGF0ZWQnLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBhd2FpdCBlbnN1cmVGb2xkZXIoZGVwcy5hcHAsIHRhcmdldERpcik7XG5cbiAgICBjb25zdCBmaWxlbmFtZSA9IG1ha2VGaWxlbmFtZSh0aXRsZSk7XG4gICAgbGV0IGZpbmFsUGF0aCA9IG1ha2VQYXRoKHRhcmdldERpciwgZmlsZW5hbWUpO1xuICAgIGNvbnN0IGV4aXN0aW5nID0gZGVwcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGZpbmFsUGF0aCk7XG4gICAgaWYgKGV4aXN0aW5nIGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgIGZpbmFsUGF0aCA9IG1ha2VQYXRoKHRhcmdldERpciwgYCR7ZmlsZW5hbWUucmVwbGFjZSgvXFwubWQkLywgJycpfS0ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfS5tZGApO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRlbnQgPSBidWlsZENsaXBNYXJrZG93bihjb250ZW50SW5wdXQpO1xuXG4gICAgYXdhaXQgZGVwcy5hcHAudmF1bHQuY3JlYXRlKGZpbmFsUGF0aCwgY29udGVudCk7XG4gICAgZGVwcy5ub3RpY2UoYFx1RDgzRFx1RENDRSBcdTVERjJcdTUyNkFcdTVCNTggJHt0aXRsZX1gKTtcblxuICAgIGlmIChkZXBzLnNldHRpbmdzLmF1dG9SZW5hbWUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGFzc2lnbkVuY29kaW5nKGRlcHMuYXBwLCBmaW5hbFBhdGgsIHRhcmdldERpcik7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbc3luYy9jbGlwXSBhdXRvLXJlbmFtZSBmYWlsZWQ6JywgZXJyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgb2s6IHRydWUsXG4gICAgICBwYXRoOiBmaW5hbFBhdGgsXG4gICAgICBmaWxlbmFtZTogZmluYWxQYXRoLnNwbGl0KCcvJykucG9wKCkgPz8gZmlsZW5hbWUsXG4gICAgICBhY3Rpb246ICdjcmVhdGVkJyxcbiAgICB9O1xuICB9O1xufVxuXG5mdW5jdGlvbiBidWlsZENsaXBNYXJrZG93bihpbnB1dDoge1xuICB0aXRsZTogc3RyaW5nO1xuICB1cmw6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xuICByYXdUZXh0OiBzdHJpbmc7XG4gIGJvZHlNYXJrZG93bjogc3RyaW5nO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBkaXI6IHN0cmluZztcbiAgbWV0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIHNvdXJjZUtpbmQ6IHN0cmluZztcbiAgZGF0ZTogc3RyaW5nO1xuICBjcmVhdGVkQXQ6IHN0cmluZztcbn0pOiBzdHJpbmcge1xuICBjb25zdCBib2R5Q29udGVudCA9IG5vcm1hbGl6ZU1hcmtkb3duQm9keShpbnB1dC5ib2R5TWFya2Rvd24gfHwgaW5wdXQucmF3VGV4dCB8fCBpbnB1dC50ZXh0IHx8IGlucHV0LmRlc2NyaXB0aW9uKTtcbiAgY29uc3QgYm9keSA9IFtcbiAgICBgIyAke2lucHV0LnRpdGxlfWAsXG4gICAgJycsXG4gICAgaW5wdXQudXJsID8gYD4gXHU2NzY1XHU2RTkwXHVGRjFBJHtpbnB1dC51cmx9YCA6ICcnLFxuICAgIGA+IFx1N0M3Qlx1NTc4Qlx1RkYxQSR7aW5wdXQuc291cmNlS2luZH1gLFxuICAgIGA+IFx1NTI2QVx1NUI1OFx1NjVGNlx1OTVGNFx1RkYxQSR7aW5wdXQuY3JlYXRlZEF0fWAsXG4gICAgJycsXG4gICAgYm9keUNvbnRlbnQsXG4gICAgJycsXG4gIF0uZmlsdGVyKChsaW5lLCBpbmRleCwgYXJyKSA9PiBsaW5lIHx8IGFycltpbmRleCAtIDFdICE9PSAnJykuam9pbignXFxuJyk7XG5cbiAgcmV0dXJuIGFzc2VtYmxlRmlsZShpbnB1dC5tZXRhLCBib2R5KTtcbn1cblxuZnVuY3Rpb24gYnVpbGRBcHBlbmRNYXJrZG93bihpbnB1dDoge1xuICB0aXRsZTogc3RyaW5nO1xuICB1cmw6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xuICByYXdUZXh0OiBzdHJpbmc7XG4gIGJvZHlNYXJrZG93bjogc3RyaW5nO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBzb3VyY2VLaW5kOiBzdHJpbmc7XG4gIGNyZWF0ZWRBdDogc3RyaW5nO1xufSk6IHN0cmluZyB7XG4gIGNvbnN0IGJvZHlDb250ZW50ID0gbm9ybWFsaXplTWFya2Rvd25Cb2R5KGlucHV0LmJvZHlNYXJrZG93biB8fCBpbnB1dC5yYXdUZXh0IHx8IGlucHV0LnRleHQgfHwgaW5wdXQuZGVzY3JpcHRpb24pO1xuICByZXR1cm4gW1xuICAgIGAjIyAke2lucHV0LnRpdGxlfWAsXG4gICAgJycsXG4gICAgaW5wdXQudXJsID8gYD4gXHU2NzY1XHU2RTkwXHVGRjFBJHtpbnB1dC51cmx9YCA6ICcnLFxuICAgIGA+IFx1N0M3Qlx1NTc4Qlx1RkYxQSR7aW5wdXQuc291cmNlS2luZH1gLFxuICAgIGA+IFx1ODg2NVx1NTE0NVx1NjVGNlx1OTVGNFx1RkYxQSR7aW5wdXQuY3JlYXRlZEF0fWAsXG4gICAgJycsXG4gICAgYm9keUNvbnRlbnQsXG4gIF0uZmlsdGVyKChsaW5lLCBpbmRleCwgYXJyKSA9PiBsaW5lIHx8IGFycltpbmRleCAtIDFdICE9PSAnJykuam9pbignXFxuJyk7XG59XG5cbmZ1bmN0aW9uIGNsZWFuVGV4dCh2YWx1ZTogdW5rbm93bik6IHN0cmluZyB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUudHJpbSgpIDogJyc7XG59XG5cbmZ1bmN0aW9uIGNsZWFuRGlyKHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHtcbiAgcmV0dXJuIGNsZWFuVGV4dCh2YWx1ZSkucmVwbGFjZSgvXlxcLyt8XFwvKyQvZywgJycpO1xufVxuXG5mdW5jdGlvbiBjbGVhblBhdGgodmFsdWU6IHVua25vd24pOiBzdHJpbmcge1xuICBjb25zdCByYXcgPSBjbGVhbkRpcih2YWx1ZSk7XG4gIGlmICghcmF3KSByZXR1cm4gJyc7XG4gIHJldHVybiByYXcuZW5kc1dpdGgoJy5tZCcpID8gcmF3IDogYCR7cmF3fS5tZGA7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERhdGUoZGF0ZTogRGF0ZSk6IHN0cmluZyB7XG4gIHJldHVybiBkYXRlLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVZYW1sKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdmFsdWUucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykucmVwbGFjZSgvXFxuKy9nLCAnICcpLnRyaW0oKTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplQ2xpcE1ldGEobWV0YTogdW5rbm93biwgZmFsbGJhY2s6IHtcbiAgdGl0bGU6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG4gIHRleHQ6IHN0cmluZztcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgZGlyOiBzdHJpbmc7XG4gIGRhdGU6IHN0cmluZztcbn0pOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gIGNvbnN0IGlucHV0ID0gbWV0YSAmJiB0eXBlb2YgbWV0YSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkobWV0YSkgPyBtZXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IDoge307XG4gIGNvbnN0IHNjb3JlID0gbm9ybWFsaXplU2NvcmUoaW5wdXQuXHU4QkM0XHU1MjA2KTtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHtcbiAgICBcdTY4MDdcdTdCN0U6IG5vcm1hbGl6ZVRhZyhpbnB1dC5cdTY4MDdcdTdCN0UpLFxuICAgIFx1N0YxNlx1NzgwMTogJycsXG4gICAgXHU4RjkzXHU1MTY1OiBjbGVhblRleHQoaW5wdXQuXHU4RjkzXHU1MTY1KSB8fCBmYWxsYmFjay5kaXIgfHwgZmFsbGJhY2sudXJsLFxuICAgIFx1NjVFNVx1NjcxRjogbm9ybWFsaXplRGF0ZShpbnB1dC5cdTY1RTVcdTY3MUYsIGZhbGxiYWNrLmRhdGUpLFxuICAgIFx1NjVFNVx1NjcxRlx1N0QyMlx1NUYxNTogbm9ybWFsaXplTGlzdChpbnB1dC5cdTY1RTVcdTY3MUZcdTdEMjJcdTVGMTUpLFxuICAgIFx1NTE3M1x1OTUyRVx1OEJDRDogY2xlYW5UZXh0KGlucHV0Llx1NTE3M1x1OTUyRVx1OEJDRCkgfHwgZHJhZnRLZXl3b3JkcyhgJHtmYWxsYmFjay50aXRsZX0gJHtmYWxsYmFjay5kZXNjcmlwdGlvbn0gJHtmYWxsYmFjay50ZXh0fWApLFxuICAgIFx1Njk4Mlx1OEZGMDogY2xlYW5UZXh0KGlucHV0Llx1Njk4Mlx1OEZGMCkgfHwgZmFsbGJhY2suZGVzY3JpcHRpb24gfHwgYFx1NEVDRVx1N0Y1MVx1OTg3NVx1NTI2QVx1NUI1OFx1NUU3Nlx1OEY2Q1x1NjM2Mlx1RkYxQSR7ZmFsbGJhY2sudGl0bGV9YCxcbiAgICBcdThCQzRcdTUyMDY6IHNjb3JlLFxuICAgIFx1OEJDNFx1NTIwNl9cdTY2M0VcdTc5M0E6IGNsZWFuVGV4dChpbnB1dC5cdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBKSB8fCBzY29yZUxhYmVsKHNjb3JlKSxcbiAgICBcdTdEMjJcdTVGMTVfXHU3N0U1XHU4QkM2XHU1RTkzOiBjbGVhblRleHQoaW5wdXQuXHU3RDIyXHU1RjE1X1x1NzdFNVx1OEJDNlx1NUU5MyksXG4gICAgXHU3RDIyXHU1RjE1X1x1OTg5Q1x1ODI3MjogY2xlYW5UZXh0KGlucHV0Llx1N0QyMlx1NUYxNV9cdTk4OUNcdTgyNzIpLFxuICAgICdcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OCc6IG5vcm1hbGl6ZUxpc3QoaW5wdXRbJ1x1N0QyMlx1NUYxNV9cdTY0Q0RcdTRGNUMmXHU1M0NEXHU5OTg4J10pLFxuICAgIFx1N0QyMlx1NUYxNV9cdTU3NTc6IG5vcm1hbGl6ZUxpc3QoaW5wdXQuXHU3RDIyXHU1RjE1X1x1NTc1NyksXG4gICAgXHU3RDIyXHU1RjE1X1x1OThDRVx1OTY2OTogbm9ybWFsaXplTGlzdChpbnB1dC5cdTdEMjJcdTVGMTVfXHU5OENFXHU5NjY5KSxcbiAgfTtcbiAgaWYgKCFvdXQuXHU1MTczXHU5NTJFXHU4QkNEKSBvdXQuXHU1MTczXHU5NTJFXHU4QkNEID0gJ1x1N0Y1MVx1OTg3NVx1NTI2QVx1NUI1OCc7XG4gIGlmICghb3V0Llx1Njk4Mlx1OEZGMCkgb3V0Llx1Njk4Mlx1OEZGMCA9IGBcdTdGNTFcdTk4NzVcdTUyNkFcdTVCNThcdUZGMUEke2ZhbGxiYWNrLnRpdGxlfWA7XG4gIHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVRhZyh2YWx1ZTogdW5rbm93bik6IHN0cmluZyB7XG4gIGNvbnN0IHJhdyA9IGNsZWFuVGV4dCh2YWx1ZSk7XG4gIHJldHVybiByYXcubWF0Y2goL15bU1hMWlFKXSQvKSA/IHJhdyA6IHJhdy5tYXRjaCgvKFtTWExaUUpdKSg/Ol98JCkvKT8uWzFdIHx8ICdTJztcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplRGF0ZSh2YWx1ZTogdW5rbm93biwgZmFsbGJhY2s6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHJhdyA9IGNsZWFuVGV4dCh2YWx1ZSkucmVwbGFjZSgvXFwvL2csICctJyk7XG4gIHJldHVybiAvXlxcZHs0fS1cXGR7Mn0tXFxkezJ9JC8udGVzdChyYXcpID8gcmF3IDogZmFsbGJhY2s7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVNjb3JlKHZhbHVlOiB1bmtub3duKTogbnVtYmVyIHtcbiAgY29uc3QgcmF3ID0gY2xlYW5UZXh0KHZhbHVlKTtcbiAgY29uc3QgZXhwbGljaXQgPSByYXcubWF0Y2goL1sxLTVdLyk/LlswXTtcbiAgaWYgKGV4cGxpY2l0KSByZXR1cm4gTnVtYmVyKGV4cGxpY2l0KTtcbiAgY29uc3Qgc3RhcnMgPSBBcnJheS5mcm9tKHJhdy5tYXRjaEFsbCgvXHVEODNDXHVERjFGL2cpKS5sZW5ndGg7XG4gIHJldHVybiBzdGFycyA+IDAgPyBNYXRoLm1pbihzdGFycywgNSkgOiAxO1xufVxuXG5mdW5jdGlvbiBzY29yZUxhYmVsKHNjb3JlOiBudW1iZXIpOiBzdHJpbmcge1xuICByZXR1cm4gWydcdUQ4M0NcdURGMUZcdTAwQjdcdTdEMjBcdTY3NTAnLCAnXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHUwMEI3XHU2NTc0XHU3NDA2JywgJ1x1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1MDBCN1x1NUI5RVx1OERGNScsICdcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdTAwQjdcdTkwMUFcdTc1MjgnLCAnXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHUwMEI3XHU0RjUzXHU3Q0ZCJ11bTWF0aC5tYXgoMSwgTWF0aC5taW4oc2NvcmUsIDUpKSAtIDFdO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVMaXN0KHZhbHVlOiB1bmtub3duKTogc3RyaW5nW10ge1xuICBjb25zdCBzb3VyY2UgPSBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlIDogY2xlYW5UZXh0KHZhbHVlKS5zcGxpdCgvW1xcbixcdUZGMENcdTMwMDFdLyk7XG4gIHJldHVybiBzb3VyY2UubWFwKChpdGVtKSA9PiBjbGVhblRleHQoaXRlbSkpLmZpbHRlcihCb29sZWFuKTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplTWFya2Rvd25Cb2R5KHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCB0ZXh0ID0gdmFsdWUudHJpbSgpO1xuICBpZiAoIXRleHQpIHJldHVybiAnXHVGRjA4XHU2NUUwXHU1M0VGXHU4OUMxXHU2QjYzXHU2NTg3XHVGRjBDXHU1REYyXHU0RkREXHU1QjU4XHU5ODc1XHU5NzYyXHU2ODA3XHU5ODk4XHU1NDhDXHU2NzY1XHU2RTkwXHUzMDAyXHVGRjA5JztcbiAgcmV0dXJuIHRleHQ7XG59XG5cbmZ1bmN0aW9uIGRyYWZ0S2V5d29yZHModGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3Qgd29yZHMgPSBBcnJheS5mcm9tKG5ldyBTZXQoXG4gICAgdGV4dFxuICAgICAgLnJlcGxhY2UoL1teXFxwe1NjcmlwdD1IYW59XFxwe0xldHRlcn1cXHB7TnVtYmVyfVxcc18tXS9ndSwgJyAnKVxuICAgICAgLnNwbGl0KC9cXHMrLylcbiAgICAgIC5tYXAoKHdvcmQpID0+IHdvcmQudHJpbSgpKVxuICAgICAgLmZpbHRlcigod29yZCkgPT4gd29yZC5sZW5ndGggPj0gMiAmJiB3b3JkLmxlbmd0aCA8PSAyMCksXG4gICkpO1xuICByZXR1cm4gd29yZHMuc2xpY2UoMCwgNikuam9pbignXHUzMDAxJyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGVuc3VyZUZvbGRlcihhcHA6IEFwcCwgZGlyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKCFkaXIgfHwgZGlyID09PSAnLicgfHwgZGlyID09PSAnLycpIHJldHVybjtcbiAgY29uc3QgZXhpc3RpbmcgPSBhcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGRpcik7XG4gIGlmIChleGlzdGluZyBpbnN0YW5jZW9mIFRGb2xkZXIpIHJldHVybjtcbiAgY29uc3QgcGFyZW50ID0gZGlyLnNwbGl0KCcvJykuc2xpY2UoMCwgLTEpLmpvaW4oJy8nKTtcbiAgaWYgKHBhcmVudCkgYXdhaXQgZW5zdXJlRm9sZGVyKGFwcCwgcGFyZW50KTtcbiAgdHJ5IHtcbiAgICBhd2FpdCBhcHAudmF1bHQuY3JlYXRlRm9sZGVyKGRpcik7XG4gIH0gY2F0Y2gge1xuICAgIC8vIFx1NURGMlx1NUI1OFx1NTcyOFx1NjIxNlx1NzUzMVx1NTE3Nlx1NEVENlx1NkQ0MVx1N0EwQlx1NTIxQVx1NTIxQlx1NUVGQVx1NjVGNlx1NUZGRFx1NzU2NVx1MzAwMlxuICB9XG59XG4iLCAiLyoqXG4gKiBQT1NUIC9leGlzdHMgXHUyMDE0IFx1NjhDMFx1NjdFNSBub2RlX3Rva2VuIFx1NjYyRlx1NTQyNlx1NURGMlx1NTQwQ1x1NkI2NVx1OEZDN1x1MzAwMlxuICovXG5pbXBvcnQgdHlwZSB7IEV4aXN0c1JlcXVlc3QsIEV4aXN0c1Jlc3BvbnNlIH0gZnJvbSAnQHN5bmMvc2hhcmVkJztcbmltcG9ydCB0eXBlIHsgQXBwLCBURmlsZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXhpc3RzSGFuZGxlcihhcHA6IEFwcCkge1xuICByZXR1cm4gYXN5bmMgKGN0eDogUmVxdWVzdENvbnRleHQpOiBQcm9taXNlPEV4aXN0c1Jlc3BvbnNlPiA9PiB7XG4gICAgY29uc3QgcmVxID0gY3R4LmJvZHkgYXMgRXhpc3RzUmVxdWVzdDtcbiAgICBpZiAoIXJlcT8ubm9kZV90b2tlbikge1xuICAgICAgY29uc3QgZSA9IG5ldyBFcnJvcignbm9kZV90b2tlbiBpcyByZXF1aXJlZCcpIGFzIEVycm9yICYgeyBjb2RlOiBzdHJpbmc7IHN0YXR1czogbnVtYmVyIH07XG4gICAgICBlLmNvZGUgPSAnTUlTU0lOR19UT0tFTic7XG4gICAgICBlLnN0YXR1cyA9IDQwMDtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZSA9IGF3YWl0IGZpbmRCeUZlaXNodUlkKGFwcCwgcmVxLm5vZGVfdG9rZW4pO1xuICAgIHJldHVybiB7XG4gICAgICBvazogdHJ1ZSxcbiAgICAgIGV4aXN0czogISFmaWxlLFxuICAgICAgcGF0aDogZmlsZT8ucGF0aCxcbiAgICB9O1xuICB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBmaW5kQnlGZWlzaHVJZChhcHA6IEFwcCwgZmVpc2h1SWQ6IHN0cmluZyk6IFByb21pc2U8VEZpbGUgfCBudWxsPiB7XG4gIGNvbnN0IGZpbGVzID0gYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcbiAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgaWYgKGZpbGUucGF0aC5zdGFydHNXaXRoKCcub2JzaWRpYW4nKSB8fCBmaWxlLnBhdGguc3RhcnRzV2l0aCgnLmZlaXNodS1zeW5jJykpIGNvbnRpbnVlO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gICAgICBpZiAoIWNvbnRlbnQuaW5jbHVkZXMoJ2ZlaXNodV9pZDonKSkgY29udGludWU7XG4gICAgICBjb25zdCBmbU1hdGNoID0gY29udGVudC5tYXRjaCgvXi0tLVxcbihbXFxzXFxTXSo/KVxcbi0tLS8pO1xuICAgICAgaWYgKCFmbU1hdGNoKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGlkTWF0Y2ggPSBmbU1hdGNoWzFdLm1hdGNoKC9mZWlzaHVfaWQ6XFxzKltcIiddPyhbQS1aYS16MC05XSspLyk7XG4gICAgICBpZiAoaWRNYXRjaCAmJiBpZE1hdGNoWzFdID09PSBmZWlzaHVJZCkgcmV0dXJuIGZpbGU7XG4gICAgfSBjYXRjaCB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG4iLCAiLyoqXG4gKiBQT1NUIC9wdXNoYmFjayBcdTIwMTQgT0JcdTIxOTJcdTk4REVcdTRFNjZcdTU2REVcdTUxOTlcdTMwMDJcbiAqXG4gKiBcdTRGOURcdTYzNkUgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3Ni4yXHVGRjFBXG4gKiAxLiBcdThCRkIgLm1kIFx1NzY4NCBZQU1MXHVGRjBDXHU2MkZGIGZlaXNodV9kb2NfaWQgKyBzeW5jX2hhc2hcbiAqIDIuIFx1OEJBMVx1N0I5N1x1NUY1M1x1NTI0RFx1NTE4NVx1NUJCOSBoYXNoXHVGRjBDXHU2QkQ0XHU1QkY5IHN5bmNfaGFzaFxuICogICAgXHUyNTFDIFx1NEUwMFx1ODFGNCBcdTIxOTIgXHU4REYzXHU4RkM3XHVGRjA4XHU2NUUwXHU1M0Q4XHU1MzE2XHVGRjA5XG4gKiAgICBcdTI1MTQgXHU0RTBEXHU0RTAwXHU4MUY0IFx1MjE5MiBcdTdFRTdcdTdFRURcbiAqIDMuIFx1ODlFM1x1Njc5MFx1NkI2M1x1NjU4NyBtZCArIFlBTUxcbiAqIDQuIFlBTUwgXHU1QjU3XHU2QkI1IFx1MjE5MiBjYWxsb3V0IFhNTCBcdTcyNDdcdTZCQjVcdUZGMDhcdTY1ODdcdTY4NjNcdTU5MzRcdUZGMDlcbiAqIDUuIFx1NTZGRVx1NzI0NyBmZWlzaHU6Ly90b2tlbiBcdTIxOTIgXHU5OERFXHU0RTY2IDxpbWcgc3JjPVwiVE9LRU5cIi8+XG4gKiA2LiBcdTdFQzRcdTg4QzVcdTY3MDBcdTdFQzhcdTUxODVcdTVCQjkgPSBbY2FsbG91dCBYTUxdICsgW1x1NkI2M1x1NjU4NyBtZF1cbiAqIDcuIFx1OEMwMyBsYXJrLWNsaSBkb2NzICt1cGRhdGUgb3ZlcndyaXRlXHVGRjA4WE1MIFx1NjgzQ1x1NUYwRlx1RkYwOVxuICogOC4gXHU2ODA3XHU5ODk4XHU1NDBDXHU2QjY1XHVGRjA4XHU1REYyXHU1NzI4IG92ZXJ3cml0ZSBcdTY1RjZcdTRGRUVcdTU5MERcdUZGMDlcbiAqIDkuIFx1NjZGNFx1NjVCMCBzeW5jX2hhc2ggKyBzeW5jX3RpbWVcbiAqL1xuaW1wb3J0IHR5cGUgeyBQdXNoYmFja1JlcXVlc3QsIFB1c2hiYWNrUmVzcG9uc2UgfSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHtcbiAgbWV0YVRvQ2FsbG91dFhtbCxcbiAgZmVpc2h1UHJvdG9Ub1htbCxcbiAgY29udmVydE9CQ2FsbG91dHNUb0ZlaXNodSxcbiAgYm9keUhhc2gsXG4gIGlzQ2hhbmdlZCxcbn0gZnJvbSAnQHN5bmMvc2hhcmVkJztcbmltcG9ydCB0eXBlIHsgQXBwLCBURmlsZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuaW1wb3J0IHR5cGUgeyBGZWlzaHVTeW5jU2V0dGluZ3MgfSBmcm9tICcuLi9zZXR0aW5ncy5qcyc7XG5pbXBvcnQgeyBvdmVyd3JpdGVEb2NYbWwsIGdldFdpa2lOb2RlSW5mbyB9IGZyb20gJy4uL2xhcmsvY2xpLmpzJztcbmltcG9ydCB7IHBhcnNlRmlsZSwgYXNzZW1ibGVNZCB9IGZyb20gJy4uL2ZpbGVpby93cml0ZXIuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFB1c2hiYWNrRGVwcyB7XG4gIGFwcDogQXBwO1xuICBzZXR0aW5nczogRmVpc2h1U3luY1NldHRpbmdzO1xuICBub3RpY2U6IChtc2c6IHN0cmluZykgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVB1c2hiYWNrSGFuZGxlcihkZXBzOiBQdXNoYmFja0RlcHMpIHtcbiAgcmV0dXJuIGFzeW5jIChjdHg6IFJlcXVlc3RDb250ZXh0KTogUHJvbWlzZTxQdXNoYmFja1Jlc3BvbnNlPiA9PiB7XG4gICAgY29uc3QgcmVxID0gY3R4LmJvZHkgYXMgUHVzaGJhY2tSZXF1ZXN0O1xuXG4gICAgLy8gXHU1QjlBXHU0RjREXHU2NTg3XHU0RUY2XG4gICAgbGV0IGZpbGU6IFRGaWxlIHwgbnVsbCA9IG51bGw7XG4gICAgaWYgKHJlcS5wYXRoKSB7XG4gICAgICBjb25zdCBmID0gZGVwcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHJlcS5wYXRoKTtcbiAgICAgIGlmIChmIGluc3RhbmNlb2YgVEZpbGUpIGZpbGUgPSBmO1xuICAgIH0gZWxzZSBpZiAocmVxLm5vZGVfdG9rZW4pIHtcbiAgICAgIGZpbGUgPSBhd2FpdCBmaW5kQnlGZWlzaHVJZChkZXBzLmFwcCwgcmVxLm5vZGVfdG9rZW4pO1xuICAgIH1cblxuICAgIGlmICghZmlsZSkge1xuICAgICAgY29uc3QgZSA9IG5ldyBFcnJvcignRmlsZSBub3QgZm91bmQnKSBhcyBFcnJvciAmIHsgY29kZTogc3RyaW5nOyBzdGF0dXM6IG51bWJlciB9O1xuICAgICAgZS5jb2RlID0gJ05PVF9GT1VORCc7XG4gICAgICBlLnN0YXR1cyA9IDQwNDtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudCA9IGF3YWl0IGRlcHMuYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VGaWxlKGNvbnRlbnQpO1xuXG4gICAgY29uc3QgZmVpc2h1RG9jSWQgPSBwYXJzZWQuZnJvbnRtYXR0ZXIuZmVpc2h1X2RvY19pZCBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgZmVpc2h1SWQgPSBwYXJzZWQuZnJvbnRtYXR0ZXIuZmVpc2h1X2lkIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBmZWlzaHVUaXRsZSA9IHBhcnNlZC5mcm9udG1hdHRlci5mZWlzaHVfdGl0bGUgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgLy8gXHU4OUUzXHU2NzkwXHU1NkRFXHU1MTk5XHU3NTI4XHU3Njg0IGRvY1Rva2VuXHVGRjA4XHU1RkM1XHU5ODdCXHU2NjJGIGRvY3ggb2JqX3Rva2VuXHVGRjBDbm9kZV90b2tlbiBcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTc1MjhcdTRFOEUgZG9jcyArdXBkYXRlXHVGRjA5XG4gICAgbGV0IGRvY1Rva2VuID0gZmVpc2h1RG9jSWQ7XG4gICAgaWYgKCFkb2NUb2tlbiAmJiBmZWlzaHVJZCkge1xuICAgICAgLy8gZmVpc2h1X2RvY19pZCBcdTdGM0FcdTU5MzFcdUZGMUFcdTc1Mjggd2lraSArbm9kZS1nZXQgXHU2MjhBIG5vZGVfdG9rZW4gXHU4OUUzXHU2NzkwXHU2MjEwIG9ial90b2tlblxuICAgICAgZGVwcy5ub3RpY2UoJ1x1RDgzRFx1REQxNyBcdTg5RTNcdTY3OTBcdTY1ODdcdTY4NjMgdG9rZW4uLi4nKTtcbiAgICAgIGNvbnN0IGluZm8gPSBnZXRXaWtpTm9kZUluZm8oZmVpc2h1SWQsIGRlcHMuc2V0dGluZ3Muc3BhY2VJZCk7XG4gICAgICBkb2NUb2tlbiA9IGluZm8/Lm9ial90b2tlbjtcbiAgICAgIGlmICghZG9jVG9rZW4pIHtcbiAgICAgICAgY29uc3QgZSA9IG5ldyBFcnJvcihgXHU2NUUwXHU2Q0Q1XHU4OUUzXHU2NzkwIG9ial90b2tlblx1RkYwOG5vZGVfdG9rZW49JHtmZWlzaHVJZC5zbGljZSgwLCA4KX0uLi5cdUZGMENcdTY4QzBcdTY3RTUgc3BhY2VfaWQgXHU4QkJFXHU3RjZFXHVGRjA5YCkgYXMgRXJyb3IgJiB7IGNvZGU6IHN0cmluZzsgc3RhdHVzOiBudW1iZXIgfTtcbiAgICAgICAgZS5jb2RlID0gJ1RPS0VOX1JFU09MVkVfRkFJTEVEJztcbiAgICAgICAgZS5zdGF0dXMgPSA0MDA7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgICAvLyBcdTU2REVcdTUxOTkgZmVpc2h1X2RvY19pZCBcdThGREIgZnJvbnRtYXR0ZXJcdUZGMDhcdTRFMEJcdTZCMjFcdTRFMERcdTc1MjhcdTUxOERcdTg5RTNcdTY3OTBcdUZGMDlcbiAgICAgIHBhcnNlZC5mcm9udG1hdHRlci5mZWlzaHVfZG9jX2lkID0gZG9jVG9rZW47XG4gICAgfVxuICAgIGlmICghZG9jVG9rZW4pIHtcbiAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoJ05vIGZlaXNodSBiaW5kaW5nIGluIGZyb250bWF0dGVyJykgYXMgRXJyb3IgJiB7IGNvZGU6IHN0cmluZzsgc3RhdHVzOiBudW1iZXIgfTtcbiAgICAgIGUuY29kZSA9ICdOT19CSU5ESU5HJztcbiAgICAgIGUuc3RhdHVzID0gNDAwO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgY29uc3QgdGl0bGUgPSBmZWlzaHVUaXRsZSB8fCBmaWxlLmJhc2VuYW1lO1xuXG4gICAgLy8gXHU2QjY1XHU5QUE0IDJcdUZGMUFoYXNoIFx1NkJENFx1NUJGOVxuICAgIGlmICghcmVxLmZvcmNlICYmICFpc0NoYW5nZWQocGFyc2VkLmhhc2gsIHBhcnNlZC5mcm9udG1hdHRlci5zeW5jX2hhc2ggYXMgc3RyaW5nIHwgdW5kZWZpbmVkKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb2s6IHRydWUsXG4gICAgICAgIGFjdGlvbjogJ3NraXBwZWQnLFxuICAgICAgICBoYXNoOiBwYXJzZWQuaGFzaCxcbiAgICAgICAgdGl0bGUsXG4gICAgICB9O1xuICAgIH1cblxuICAgIGRlcHMubm90aWNlKGBcdTJCMDYgXHU1NkRFXHU1MTk5XHU5OERFXHU0RTY2ICR7ZmlsZS5uYW1lfS4uLmApO1xuXG4gICAgLy8gXHU2QjY1XHU5QUE0IDMtNlx1RkYxQVx1N0VDNFx1ODhDNVx1NjcwMFx1N0VDOCBYTUwgXHU1MTg1XHU1QkI5XG4gICAgY29uc3QgZmluYWxDb250ZW50ID0gYnVpbGRQdXNoYmFja0NvbnRlbnQocGFyc2VkKTtcblxuICAgIC8vIFx1NkI2NVx1OUFBNCA3LThcdUZGMUFvdmVyd3JpdGUgKyBcdTY4MDdcdTk4OThcdTRGRUVcdTU5MERcbiAgICBvdmVyd3JpdGVEb2NYbWwoZG9jVG9rZW4sIGZpbmFsQ29udGVudCwgdGl0bGUpO1xuXG4gICAgLy8gXHU2QjY1XHU5QUE0IDlcdUZGMUFcdTY2RjRcdTY1QjAgc3luY19oYXNoICsgc3luY190aW1lXG4gICAgY29uc3Qgc3luY1RpbWUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgY29uc3QgdXBkYXRlZEZtID0ge1xuICAgICAgLi4ucGFyc2VkLmZyb250bWF0dGVyLFxuICAgICAgc3luY19oYXNoOiBwYXJzZWQuaGFzaCxcbiAgICAgIHN5bmNfdGltZTogc3luY1RpbWUsXG4gICAgfTtcbiAgICBjb25zdCBuZXdDb250ZW50ID0gYXNzZW1ibGVNZCh1cGRhdGVkRm0gYXMgbmV2ZXIsIHBhcnNlZC5ib2R5KTtcbiAgICBhd2FpdCBkZXBzLmFwcC52YXVsdC5tb2RpZnkoZmlsZSwgbmV3Q29udGVudCk7XG5cbiAgICBkZXBzLm5vdGljZShgXHUyNzA1IFx1NURGMlx1NTZERVx1NTE5OSAke3RpdGxlfWApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG9rOiB0cnVlLFxuICAgICAgYWN0aW9uOiAncHVzaGVkJyxcbiAgICAgIGhhc2g6IHBhcnNlZC5oYXNoLFxuICAgICAgdGl0bGUsXG4gICAgfTtcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTdFQzRcdTg4QzVcdTU2REVcdTUxOTlcdTk4REVcdTRFNjZcdTc2ODRcdTY3MDBcdTdFQzhcdTUxODVcdTVCQjlcdUZGMDhYTUwgXHU2ODNDXHU1RjBGXHVGRjA5XHUzMDAyXG4gKiA9IFtZQU1MIGNhbGxvdXQgXHU0RkUxXHU2MDZGXHU1NzU3XSArIFtcdTZCNjNcdTY1ODdcdUZGMDhcdTU2RkVcdTcyNDdcdThGNkMgWE1MXHUzMDAxT0IgY2FsbG91dCBcdThGNkMgWE1MXHVGRjA5XVxuICovXG5mdW5jdGlvbiBidWlsZFB1c2hiYWNrQ29udGVudChwYXJzZWQ6IFJldHVyblR5cGU8dHlwZW9mIHBhcnNlRmlsZT4pOiBzdHJpbmcge1xuICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcblxuICAvLyAxLiBZQU1MIFx1NTE0M1x1NjU3MFx1NjM2RSBcdTIxOTIgY2FsbG91dCBcdTRGRTFcdTYwNkZcdTU3NTdcbiAgY29uc3QgY2FsbG91dFhtbCA9IG1ldGFUb0NhbGxvdXRYbWwocGFyc2VkLmZyb250bWF0dGVyKTtcbiAgaWYgKGNhbGxvdXRYbWwpIHtcbiAgICBwYXJ0cy5wdXNoKGNhbGxvdXRYbWwpO1xuICB9XG5cbiAgLy8gMi4gXHU2QjYzXHU2NTg3XHU1OTA0XHU3NDA2XG4gIGxldCBib2R5ID0gcGFyc2VkLmJvZHk7XG5cbiAgLy8gMmEuIFx1NTZGRVx1NzI0NyBmZWlzaHU6Ly90b2tlbiBcdTIxOTIgPGltZyBzcmM9XCJUT0tFTlwiLz5cbiAgYm9keSA9IGZlaXNodVByb3RvVG9YbWwoYm9keSk7XG5cbiAgLy8gMmIuIE9CIGNhbGxvdXQgPiBbIXR5cGVdIFx1MjE5MiBcdTk4REVcdTRFNjYgY2FsbG91dCBYTUxcbiAgYm9keSA9IGNvbnZlcnRPQkNhbGxvdXRzVG9GZWlzaHUoYm9keSk7XG5cbiAgcGFydHMucHVzaChib2R5LnRyaW0oKSk7XG5cbiAgcmV0dXJuIHBhcnRzLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG5cXG4nKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZmluZEJ5RmVpc2h1SWQoYXBwOiBBcHAsIGZlaXNodUlkOiBzdHJpbmcpOiBQcm9taXNlPFRGaWxlIHwgbnVsbD4ge1xuICBjb25zdCBmaWxlcyA9IGFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XG4gIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgIGlmIChmaWxlLnBhdGguc3RhcnRzV2l0aCgnLm9ic2lkaWFuJykgfHwgZmlsZS5wYXRoLnN0YXJ0c1dpdGgoJy5mZWlzaHUtc3luYycpKSBjb250aW51ZTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgaWYgKCFjb250ZW50LmluY2x1ZGVzKCdmZWlzaHVfaWQ6JykpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgZm1NYXRjaCA9IGNvbnRlbnQubWF0Y2goL14tLS1cXG4oW1xcc1xcU10qPylcXG4tLS0vKTtcbiAgICAgIGlmICghZm1NYXRjaCkgY29udGludWU7XG4gICAgICBjb25zdCBpZE1hdGNoID0gZm1NYXRjaFsxXS5tYXRjaCgvZmVpc2h1X2lkOlxccypbXCInXT8oW0EtWmEtejAtOV0rKS8pO1xuICAgICAgaWYgKGlkTWF0Y2ggJiYgaWRNYXRjaFsxXSA9PT0gZmVpc2h1SWQpIHJldHVybiBmaWxlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuIiwgIi8qKlxuICogXHU1NDdEXHU0RUU0XHU2ODBGXHU1NDdEXHU0RUU0XHUzMDAyXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzEwICsgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGBcdTMwMDJcbiAqXG4gKiAtIFx1NTZERVx1NTE5OVx1NUY1M1x1NTI0RFx1NjU4N1x1NEVGNlx1NTIzMFx1OThERVx1NEU2NlxuICogLSBcdTYyNzlcdTkxQ0ZcdTU2REVcdTUxOTlcdTVGNTNcdTUyNERcdTc2RUVcdTVGNTVcbiAqIC0gXHU1MjM3XHU2NUIwXHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0XG4gKiAtIFx1NjI3OVx1OTFDRlx1NkUwNVx1NzQwNlx1NURGMlx1NTIyMFx1OTY2NFxuICogLSBcdTY2M0VcdTc5M0EvXHU1OTBEXHU1MjM2XHU1NDJGXHU1MkE4XHU0RUU0XHU3MjRDXG4gKiAtIFx1OTFDRFx1NjVCMFx1NTJBMFx1OEY3RFx1NjNEMlx1NEVGNlx1RkYwOFx1OTFDRFx1NTQyRiBIVFRQIHNlcnZlclx1RkYwOVxuICovXG5pbXBvcnQgdHlwZSB7IEFwcCwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBOb3RpY2UsIE1vZGFsIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBGZWlzaHVTeW5jUGx1Z2luIH0gZnJvbSAnLi9tYWluLmpzJztcbmltcG9ydCB7IHJlZnJlc2hNYXBwaW5nLCBsb2FkTWFwcGluZyB9IGZyb20gJy4vbWFwcGluZy5qcyc7XG5pbXBvcnQgeyBjcmVhdGVQdXNoYmFja0hhbmRsZXIgfSBmcm9tICcuL2hhbmRsZXJzL3B1c2hiYWNrSGFuZGxlci5qcyc7XG5pbXBvcnQgeyBiYXRjaEFzc2lnbkVuY29kaW5nIH0gZnJvbSAnLi9hdXRvUmVuYW1lLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyQ29tbWFuZHMocGx1Z2luOiBGZWlzaHVTeW5jUGx1Z2luKTogdm9pZCB7XG4gIGNvbnN0IHsgYXBwLCBzZXR0aW5ncyB9ID0gcGx1Z2luO1xuXG4gIC8vIFx1NTZERVx1NTE5OVx1NUY1M1x1NTI0RFx1NjU4N1x1NEVGNlx1NTIzMFx1OThERVx1NEU2NlxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6ICdwdXNoYmFjay1jdXJyZW50JyxcbiAgICBuYW1lOiAnXHU1NkRFXHU1MTk5XHU1RjUzXHU1MjREXHU2NTg3XHU0RUY2XHU1MjMwXHU5OERFXHU0RTY2JyxcbiAgICBlZGl0b3JDYWxsYmFjazogYXN5bmMgKGVkaXRvcikgPT4ge1xuICAgICAgY29uc3QgZmlsZSA9IGFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuICAgICAgaWYgKCEoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB8fCAhZmlsZS5wYXRoLmVuZHNXaXRoKCcubWQnKSkge1xuICAgICAgICBuZXcgTm90aWNlKCdcdTI2QTBcdUZFMEYgXHU4QkY3XHU1NzI4IG1hcmtkb3duIFx1NjU4N1x1NEVGNlx1NEUyRFx1NEY3Rlx1NzUyOFx1NkI2NFx1NTQ3RFx1NEVFNCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBjcmVhdGVQdXNoYmFja0hhbmRsZXIoe1xuICAgICAgICBhcHAsXG4gICAgICAgIHNldHRpbmdzLFxuICAgICAgICBub3RpY2U6IChtKSA9PiBuZXcgTm90aWNlKG0pLFxuICAgICAgfSk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGhhbmRsZXIoe1xuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgIHVybDogJy9wdXNoYmFjaycsXG4gICAgICAgICAgcGF0aDogJy9wdXNoYmFjaycsXG4gICAgICAgICAgcXVlcnk6IG5ldyBVUkxTZWFyY2hQYXJhbXMoKSxcbiAgICAgICAgICBib2R5OiB7IHBhdGg6IGZpbGUucGF0aCB9LFxuICAgICAgICAgIHRva2VuOiAnJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQuYWN0aW9uID09PSAncHVzaGVkJykge1xuICAgICAgICAgIG5ldyBOb3RpY2UoYFx1MjcwNSBcdTVERjJcdTU2REVcdTUxOTlcdUZGMUEke3Jlc3VsdC50aXRsZX1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXcgTm90aWNlKCdcdTIzRUQgXHU2NUUwXHU1M0Q4XHU1MzE2XHVGRjBDXHU1REYyXHU4REYzXHU4RkM3Jyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBuZXcgTm90aWNlKGBcdTI3NEMgXHU1NkRFXHU1MTk5XHU1OTMxXHU4RDI1XHVGRjFBJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycil9YCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gXHU2Mjc5XHU5MUNGXHU1NkRFXHU1MTk5XHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogJ3B1c2hiYWNrLWRpcicsXG4gICAgbmFtZTogJ1x1NjI3OVx1OTFDRlx1NTZERVx1NTE5OVx1NUY1M1x1NTI0RFx1NzZFRVx1NUY1NVx1NTIzMFx1OThERVx1NEU2NicsXG4gICAgY2FsbGJhY2s6IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbGUgPSBhcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgICAgIGlmICghZmlsZSkge1xuICAgICAgICBuZXcgTm90aWNlKCdcdTI2QTBcdUZFMEYgXHU4QkY3XHU1MTQ4XHU2MjUzXHU1RjAwXHU0RTAwXHU0RTJBXHU2NTg3XHU0RUY2XHU0RUU1XHU3ODZFXHU1QjlBXHU3NkVFXHU1RjU1Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRpciA9IGZpbGUucGFyZW50Py5wYXRoO1xuICAgICAgaWYgKCFkaXIpIHJldHVybjtcblxuICAgICAgY29uc3QgZmlsZXMgPSBhcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpLmZpbHRlcihmID0+IGYucGF0aC5zdGFydHNXaXRoKGRpciArICcvJykpO1xuICAgICAgbGV0IHB1c2hlZCA9IDA7XG4gICAgICBsZXQgc2tpcHBlZCA9IDA7XG4gICAgICBsZXQgZmFpbGVkID0gMDtcblxuICAgICAgY29uc3QgaGFuZGxlciA9IGNyZWF0ZVB1c2hiYWNrSGFuZGxlcih7XG4gICAgICAgIGFwcCxcbiAgICAgICAgc2V0dGluZ3MsXG4gICAgICAgIG5vdGljZTogKCkgPT4ge30sXG4gICAgICB9KTtcblxuICAgICAgZm9yIChjb25zdCBmIG9mIGZpbGVzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaGFuZGxlcih7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIHVybDogJy9wdXNoYmFjaycsXG4gICAgICAgICAgICBwYXRoOiAnL3B1c2hiYWNrJyxcbiAgICAgICAgICAgIHF1ZXJ5OiBuZXcgVVJMU2VhcmNoUGFyYW1zKCksXG4gICAgICAgICAgICBib2R5OiB7IHBhdGg6IGYucGF0aCB9LFxuICAgICAgICAgICAgdG9rZW46ICcnLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChyZXN1bHQuYWN0aW9uID09PSAncHVzaGVkJykgcHVzaGVkKys7XG4gICAgICAgICAgZWxzZSBza2lwcGVkKys7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIGZhaWxlZCsrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG5ldyBOb3RpY2UoYFx1MkIwNiBcdTYyNzlcdTkxQ0ZcdTU2REVcdTUxOTlcdTVCOENcdTYyMTBcdUZGMUFcdTYzQThcdTkwMDEgJHtwdXNoZWR9XHVGRjBDXHU4REYzXHU4RkM3ICR7c2tpcHBlZH1cdUZGMENcdTU5MzFcdThEMjUgJHtmYWlsZWR9YCk7XG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gXHU2Mjc5XHU5MUNGXHU1MjA2XHU5MTREXHU3RjE2XHU3ODAxXHVGRjA4XHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XHVGRjA5XG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogJ2Fzc2lnbi1lbmNvZGluZy1kaXInLFxuICAgIG5hbWU6ICdcdTYyNzlcdTkxQ0ZcdTUyMDZcdTkxNERcdTdGMTZcdTc4MDFcdUZGMDhcdTVGNTNcdTUyNERcdTc2RUVcdTVGNTVcdUZGMDknLFxuICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlID0gYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gICAgICBpZiAoIWZpbGUpIHtcbiAgICAgICAgbmV3IE5vdGljZSgnXHUyNkEwXHVGRTBGIFx1OEJGN1x1NTE0OFx1NjI1M1x1NUYwMFx1NEUwMFx1NEUyQVx1NjU4N1x1NEVGNlx1NEVFNVx1Nzg2RVx1NUI5QVx1NzZFRVx1NUY1NScpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBkaXIgPSBmaWxlLnBhcmVudD8ucGF0aDtcbiAgICAgIGlmICghZGlyKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGJhdGNoQXNzaWduRW5jb2RpbmcoYXBwLCBkaXIpO1xuICAgICAgbmV3IE5vdGljZShgXHVEODNEXHVERDIyIFx1N0YxNlx1NzgwMVx1NTIwNlx1OTE0RFx1RkYxQSR7cmVzdWx0LmFzc2lnbmVkfS8ke3Jlc3VsdC50b3RhbH1gKTtcbiAgICB9LFxuICB9KTtcblxuICAvLyBcdTUyMzdcdTY1QjBcdTc2RUVcdTVGNTVcdTY2MjBcdTVDMDRcbiAgcGx1Z2luLmFkZENvbW1hbmQoe1xuICAgIGlkOiAncmVmcmVzaC1tYXBwaW5nJyxcbiAgICBuYW1lOiAnXHU1MjM3XHU2NUIwXHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0XHVGRjA4T0JcdTIxOTJcdTk4REVcdTRFNjZcdUZGMDknLFxuICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCByZWZyZXNoTWFwcGluZyhhcHAsIHNldHRpbmdzLnNwYWNlSWQpO1xuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFx1NjYzRVx1NzkzQVx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1xuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6ICdzaG93LXRva2VuJyxcbiAgICBuYW1lOiAnXHU2NjNFXHU3OTNBXHU1NDJGXHU1MkE4XHU0RUU0XHU3MjRDXHVGRjA4XHU4RkRFXHU2M0E1XHU2RDRGXHU4OUM4XHU1NjY4XHU2MjY5XHU1QzU1XHU3NTI4XHVGRjA5JyxcbiAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgY29uc3QgbW9kYWwgPSBuZXcgVG9rZW5Nb2RhbChhcHAsIHNldHRpbmdzLnN5bmNUb2tlbik7XG4gICAgICBtb2RhbC5vcGVuKCk7XG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gXHU2NjNFXHU3OTNBXHU2NzAwXHU4RkQxXHU1NDBDXHU2QjY1XHU4QkIwXHU1RjU1XG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogJ3Nob3ctcmVjZW50JyxcbiAgICBuYW1lOiAnXHU2NjNFXHU3OTNBXHU2NzAwXHU4RkQxXHU1NDBDXHU2QjY1XHU4QkIwXHU1RjU1JyxcbiAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgY29uc3QgcmVjZW50ID0gcGx1Z2luLnN0YXRlLnJlY2VudFN5bmNzO1xuICAgICAgaWYgKHJlY2VudC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgbmV3IE5vdGljZSgnXHVGRjA4XHU2NjgyXHU2NUUwXHU1NDBDXHU2QjY1XHU4QkIwXHU1RjU1XHVGRjA5Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGxpbmVzID0gcmVjZW50LnNsaWNlKDAsIDEwKS5tYXAoXG4gICAgICAgIHIgPT4gYCR7ci5hY3Rpb24gPT09ICdjcmVhdGVkJyA/ICdcdTI3OTUnIDogci5hY3Rpb24gPT09ICd1cGRhdGVkJyA/ICdcdTI3MEYnIDogJ1x1Mjc0Qyd9ICR7ci50aXRsZX0gXHUyMTkyICR7ci5wYXRofWAsXG4gICAgICApO1xuICAgICAgY29uc3QgbW9kYWwgPSBuZXcgTW9kYWwoYXBwKTtcbiAgICAgIG1vZGFsLnRpdGxlRWwuc2V0VGV4dCgnXHU2NzAwXHU4RkQxXHU1NDBDXHU2QjY1XHU4QkIwXHU1RjU1Jyk7XG4gICAgICBjb25zdCBwcmUgPSBtb2RhbC5jb250ZW50RWwuY3JlYXRlRWwoJ3ByZScpO1xuICAgICAgcHJlLnNldFRleHQobGluZXMuam9pbignXFxuJykpO1xuICAgICAgbW9kYWwub3BlbigpO1xuICAgIH0sXG4gIH0pO1xufVxuXG4vKiogXHU0RUU0XHU3MjRDXHU1QzU1XHU3OTNBIE1vZGFsXHUzMDAyICovXG5jbGFzcyBUb2tlbk1vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJpdmF0ZSB0b2tlbjogc3RyaW5nKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgfVxuXG4gIG9uT3BlbigpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnXHU1NDJGXHU1MkE4XHU0RUU0XHU3MjRDJyB9KTtcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7XG4gICAgICB0ZXh0OiAnXHU1OTBEXHU1MjM2XHU2QjY0XHU0RUU0XHU3MjRDXHVGRjBDXHU3Qzk4XHU4RDM0XHU1MjMwXHU2RDRGXHU4OUM4XHU1NjY4XHU2MjY5XHU1QzU1XHU1RjM5XHU3QTk3XHU3Njg0XCJUb2tlblwiXHU4RjkzXHU1MTY1XHU2ODQ2XHUzMDAyJyxcbiAgICAgIGNsczogJ3NldHRpbmctaXRlbS1kZXNjcmlwdGlvbicsXG4gICAgfSk7XG4gICAgY29uc3QgY29kZUVsID0gY29udGVudEVsLmNyZWF0ZUVsKCdjb2RlJyk7XG4gICAgY29kZUVsLnNldFRleHQodGhpcy50b2tlbik7XG4gICAgY29kZUVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIGNvZGVFbC5zdHlsZS5wYWRkaW5nID0gJzEycHgnO1xuICAgIGNvZGVFbC5zdHlsZS5mb250RmFtaWx5ID0gJ21vbm9zcGFjZSc7XG4gICAgY29kZUVsLnN0eWxlLndvcmRCcmVhayA9ICdicmVhay1hbGwnO1xuICAgIGNvZGVFbC5zdHlsZS5iYWNrZ3JvdW5kID0gJ3ZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KSc7XG5cbiAgICBjb25zdCBidG4gPSBjb250ZW50RWwuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ1x1NTkwRFx1NTIzNicgfSk7XG4gICAgYnRuLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0aGlzLnRva2VuKTtcbiAgICAgIG5ldyBOb3RpY2UoJ1x1MjcwNSBcdTVERjJcdTU5MERcdTUyMzYnKTtcbiAgICB9O1xuICB9XG5cbiAgb25DbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgTW9kYWwsIE5vdGljZSwgVEZpbGUsIFRGb2xkZXIsIHR5cGUgQXBwIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHtcbiAgT0JTSURJQU5fTEFSS19ET0NfQUNUSU9OLFxuICBwYXJzZU9ic2lkaWFuTGFya0RvY1BhcmFtcyxcbiAgdHlwZSBGZXRjaFJlcXVlc3QsXG59IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQgdHlwZSB7IEZlaXNodVN5bmNQbHVnaW4gfSBmcm9tICcuL21haW4uanMnO1xuaW1wb3J0IHsgY3JlYXRlRmV0Y2hIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9mZXRjaEhhbmRsZXIuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZU5vZGVUb2tlbkZyb21VcmwgfSBmcm9tICcuL2xhcmsvY2xpLmpzJztcblxudHlwZSBUcmlnZ2VyU291cmNlID0gJ3Byb3RvY29sJyB8ICdjb21tYW5kJyB8ICdjbGlwcGVyJztcblxuaW50ZXJmYWNlIFRyaWdnZXJJbnB1dCB7XG4gIG5vZGVfdG9rZW4/OiBzdHJpbmc7XG4gIG9ial90b2tlbj86IHN0cmluZztcbiAgc3BhY2VfaWQ/OiBzdHJpbmc7XG4gIHRpdGxlPzogc3RyaW5nO1xuICB1cmw/OiBzdHJpbmc7XG4gIGRpcj86IHN0cmluZztcbiAgcmVwbGFjZV9wYXRoPzogc3RyaW5nO1xuICBzb3VyY2U6IFRyaWdnZXJTb3VyY2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckZldGNoRW50cnlwb2ludHMocGx1Z2luOiBGZWlzaHVTeW5jUGx1Z2luKTogdm9pZCB7XG4gIHBsdWdpbi5yZWdpc3Rlck9ic2lkaWFuUHJvdG9jb2xIYW5kbGVyKE9CU0lESUFOX0xBUktfRE9DX0FDVElPTiwgKHBhcmFtcykgPT4ge1xuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlT2JzaWRpYW5MYXJrRG9jUGFyYW1zKHBhcmFtcyk7XG4gICAgdm9pZCB0cmlnZ2VyRmV0Y2gocGx1Z2luLCB7XG4gICAgICBub2RlX3Rva2VuOiBwYXJzZWQubm9kZV90b2tlbiB8fCBwYXJzZWQudG9rZW4sXG4gICAgICBvYmpfdG9rZW46IHBhcnNlZC5vYmpfdG9rZW4sXG4gICAgICBzcGFjZV9pZDogcGFyc2VkLnNwYWNlX2lkLFxuICAgICAgdGl0bGU6IHBhcnNlZC50aXRsZSxcbiAgICAgIHVybDogcGFyc2VkLnVybCxcbiAgICAgIGRpcjogcGFyc2VkLmRpcixcbiAgICAgIHNvdXJjZTogJ3Byb3RvY29sJyxcbiAgICB9KTtcbiAgfSk7XG5cbiAgcGx1Z2luLmFkZENvbW1hbmQoe1xuICAgIGlkOiAnZmV0Y2gtZmVpc2h1LWRvYycsXG4gICAgbmFtZTogJ1x1NjJDOVx1NTNENlx1OThERVx1NEU2Nlx1NjU4N1x1Njg2MycsXG4gICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgIG5ldyBGZWlzaHVJbnB1dE1vZGFsKHBsdWdpbi5hcHAsIGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBwYXJzZVVzZXJJbnB1dCh2YWx1ZSk7XG4gICAgICAgIGF3YWl0IHRyaWdnZXJGZXRjaChwbHVnaW4sIHtcbiAgICAgICAgICAuLi5wYXJzZWQsXG4gICAgICAgICAgc291cmNlOiAnY29tbWFuZCcsXG4gICAgICAgIH0pO1xuICAgICAgfSkub3BlbigpO1xuICAgIH0sXG4gIH0pO1xuXG4gIHBsdWdpbi5yZWdpc3RlckV2ZW50KFxuICAgIHBsdWdpbi5hcHAudmF1bHQub24oJ2NyZWF0ZScsIChmaWxlKSA9PiB7XG4gICAgICBpZiAoIShmaWxlIGluc3RhbmNlb2YgVEZpbGUpIHx8IGZpbGUuZXh0ZW5zaW9uICE9PSAnbWQnKSByZXR1cm47XG4gICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHZvaWQgaGFuZGxlQ2xpcHBlclBsYWNlaG9sZGVyKHBsdWdpbiwgZmlsZSk7XG4gICAgICB9LCAyNTApO1xuICAgIH0pLFxuICApO1xufVxuXG5hc3luYyBmdW5jdGlvbiB0cmlnZ2VyRmV0Y2gocGx1Z2luOiBGZWlzaHVTeW5jUGx1Z2luLCBpbnB1dDogVHJpZ2dlcklucHV0KTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHJlc29sdmVkID0gbm9ybWFsaXplSW5wdXQocGx1Z2luLCBpbnB1dCk7XG4gIGlmICghcmVzb2x2ZWQubm9kZV90b2tlbikge1xuICAgIG5ldyBOb3RpY2UoJ1x1NjVFMFx1NkNENVx1OEJDNlx1NTIyQlx1OThERVx1NEU2Nlx1NjU4N1x1Njg2MyB0b2tlbicpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHJlcTogRmV0Y2hSZXF1ZXN0ID0ge1xuICAgIG5vZGVfdG9rZW46IHJlc29sdmVkLm5vZGVfdG9rZW4sXG4gICAgb2JqX3Rva2VuOiByZXNvbHZlZC5vYmpfdG9rZW4sXG4gICAgc3BhY2VfaWQ6IHJlc29sdmVkLnNwYWNlX2lkIHx8IHBsdWdpbi5zZXR0aW5ncy5zcGFjZUlkLFxuICAgIGRpcjogcmVzb2x2ZWQuZGlyIHx8IHBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0RGlyLFxuICAgIGZpbGVuYW1lOiByZXNvbHZlZC50aXRsZSxcbiAgICByZXBsYWNlX3BhdGg6IHJlc29sdmVkLnJlcGxhY2VfcGF0aCxcbiAgfTtcblxuICBjb25zdCBydW4gPSBhc3luYyAoZGlyPzogc3RyaW5nKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBjcmVhdGVGZXRjaEhhbmRsZXIoe1xuICAgICAgICBhcHA6IHBsdWdpbi5hcHAsXG4gICAgICAgIHNldHRpbmdzOiBwbHVnaW4uc2V0dGluZ3MsXG4gICAgICAgIHN0YXRlOiBwbHVnaW4uc3RhdGUsXG4gICAgICAgIG5vdGljZTogKG1lc3NhZ2UpID0+IG5ldyBOb3RpY2UobWVzc2FnZSksXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGhhbmRsZXIoe1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgdXJsOiAnL2ZldGNoJyxcbiAgICAgICAgcGF0aDogJy9mZXRjaCcsXG4gICAgICAgIHF1ZXJ5OiBuZXcgVVJMU2VhcmNoUGFyYW1zKCksXG4gICAgICAgIGJvZHk6IHsgLi4ucmVxLCBkaXI6IGRpciB8fCByZXEuZGlyIH0sXG4gICAgICAgIHRva2VuOiAnJyxcbiAgICAgIH0pO1xuICAgICAgbmV3IE5vdGljZShgJHtyZXN1bHQuYWN0aW9uID09PSAnY3JlYXRlZCcgPyAnXHU1REYyXHU1MjFCXHU1RUZBJyA6ICdcdTVERjJcdTY2RjRcdTY1QjAnfVx1RkYxQSR7cmVzdWx0LnBhdGh9YCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBuZXcgTm90aWNlKGBcdTU0MENcdTZCNjVcdTU5MzFcdThEMjVcdUZGMUEke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKX1gKTtcbiAgICB9XG4gIH07XG5cbiAgaWYgKGlucHV0LnNvdXJjZSA9PT0gJ3Byb3RvY29sJyAmJiAhaW5wdXQuZGlyKSB7XG4gICAgbmV3IEZvbGRlclBpY2tNb2RhbChwbHVnaW4uYXBwLCBwbHVnaW4uc2V0dGluZ3MuZGVmYXVsdERpciwgcnVuKS5vcGVuKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgYXdhaXQgcnVuKHJlcS5kaXIpO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVJbnB1dChwbHVnaW46IEZlaXNodVN5bmNQbHVnaW4sIGlucHV0OiBUcmlnZ2VySW5wdXQpOiBUcmlnZ2VySW5wdXQge1xuICBpZiAoaW5wdXQudXJsKSB7XG4gICAgY29uc3QgZnJvbVVybCA9IHJlc29sdmVOb2RlVG9rZW5Gcm9tVXJsKGlucHV0LnVybCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmlucHV0LFxuICAgICAgbm9kZV90b2tlbjogaW5wdXQubm9kZV90b2tlbiB8fCBmcm9tVXJsLm5vZGVfdG9rZW4gfHwgaW5wdXQub2JqX3Rva2VuIHx8IGZyb21Vcmwub2JqX3Rva2VuLFxuICAgICAgb2JqX3Rva2VuOiBpbnB1dC5vYmpfdG9rZW4gfHwgZnJvbVVybC5vYmpfdG9rZW4sXG4gICAgfTtcbiAgfVxuICByZXR1cm4ge1xuICAgIC4uLmlucHV0LFxuICAgIG5vZGVfdG9rZW46IGlucHV0Lm5vZGVfdG9rZW4gfHwgaW5wdXQub2JqX3Rva2VuLFxuICAgIHNwYWNlX2lkOiBpbnB1dC5zcGFjZV9pZCB8fCBwbHVnaW4uc2V0dGluZ3Muc3BhY2VJZCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gcGFyc2VVc2VySW5wdXQodmFsdWU6IHN0cmluZyk6IE9taXQ8VHJpZ2dlcklucHV0LCAnc291cmNlJz4ge1xuICBjb25zdCB0cmltbWVkID0gdmFsdWUudHJpbSgpO1xuICBpZiAoL15odHRwcz86XFwvXFwvLy50ZXN0KHRyaW1tZWQpKSB7XG4gICAgY29uc3QgcGFyc2VkID0gcmVzb2x2ZU5vZGVUb2tlbkZyb21VcmwodHJpbW1lZCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5vZGVfdG9rZW46IHBhcnNlZC5ub2RlX3Rva2VuIHx8IHBhcnNlZC5vYmpfdG9rZW4sXG4gICAgICBvYmpfdG9rZW46IHBhcnNlZC5vYmpfdG9rZW4sXG4gICAgICB1cmw6IHRyaW1tZWQsXG4gICAgfTtcbiAgfVxuICBjb25zdCBwcm90b2NvbFBhcmFtcyA9IHBhcnNlT2JzaWRpYW5MYXJrRG9jUGFyYW1zKHRyaW1tZWQpO1xuICBpZiAocHJvdG9jb2xQYXJhbXMudG9rZW4gfHwgcHJvdG9jb2xQYXJhbXMubm9kZV90b2tlbiB8fCBwcm90b2NvbFBhcmFtcy5vYmpfdG9rZW4pIHtcbiAgICByZXR1cm4ge1xuICAgICAgbm9kZV90b2tlbjogcHJvdG9jb2xQYXJhbXMubm9kZV90b2tlbiB8fCBwcm90b2NvbFBhcmFtcy50b2tlbiB8fCBwcm90b2NvbFBhcmFtcy5vYmpfdG9rZW4sXG4gICAgICBvYmpfdG9rZW46IHByb3RvY29sUGFyYW1zLm9ial90b2tlbixcbiAgICAgIHNwYWNlX2lkOiBwcm90b2NvbFBhcmFtcy5zcGFjZV9pZCxcbiAgICAgIHRpdGxlOiBwcm90b2NvbFBhcmFtcy50aXRsZSxcbiAgICAgIHVybDogcHJvdG9jb2xQYXJhbXMudXJsLFxuICAgICAgZGlyOiBwcm90b2NvbFBhcmFtcy5kaXIsXG4gICAgfTtcbiAgfVxuICByZXR1cm4geyBub2RlX3Rva2VuOiB0cmltbWVkIH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNsaXBwZXJQbGFjZWhvbGRlcihwbHVnaW46IEZlaXNodVN5bmNQbHVnaW4sIGZpbGU6IFRGaWxlKTogUHJvbWlzZTx2b2lkPiB7XG4gIGxldCBjb250ZW50ID0gJyc7XG4gIHRyeSB7XG4gICAgY29udGVudCA9IGF3YWl0IHBsdWdpbi5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgdXJsID0gZXh0cmFjdENsaXBwZXJVcmwoY29udGVudCk7XG4gIGlmICghdXJsKSByZXR1cm47XG4gIGNvbnN0IHBhcnNlZCA9IHJlc29sdmVOb2RlVG9rZW5Gcm9tVXJsKHVybCk7XG4gIGNvbnN0IG5vZGVUb2tlbiA9IHBhcnNlZC5ub2RlX3Rva2VuIHx8IHBhcnNlZC5vYmpfdG9rZW47XG4gIGlmICghbm9kZVRva2VuKSByZXR1cm47XG5cbiAgYXdhaXQgdHJpZ2dlckZldGNoKHBsdWdpbiwge1xuICAgIG5vZGVfdG9rZW46IG5vZGVUb2tlbixcbiAgICBvYmpfdG9rZW46IHBhcnNlZC5vYmpfdG9rZW4sXG4gICAgdXJsLFxuICAgIGRpcjogZmlsZS5wYXJlbnQ/LnBhdGggfHwgcGx1Z2luLnNldHRpbmdzLmRlZmF1bHREaXIsXG4gICAgcmVwbGFjZV9wYXRoOiBmaWxlLnBhdGgsXG4gICAgc291cmNlOiAnY2xpcHBlcicsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0Q2xpcHBlclVybChjb250ZW50OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3QgcGF0dGVybnMgPSBbXG4gICAgL2ZlaXNodV9zeW5jX3VybDpcXHMqW1wiJ10/KFteXFxuXCInXSspLyxcbiAgICAvc291cmNlOlxccypbXCInXT8oaHR0cHM/OlxcL1xcL1teXFxuXCInXSooPzpmZWlzaHVcXC5jbnxsYXJrc3VpdGVcXC5jb20pXFwvKD86d2lraXxkb2N4fGRvYylcXC9bQS1aYS16MC05XSspLyxcbiAgICAvKGh0dHBzPzpcXC9cXC9bXlxccylcIiddKig/OmZlaXNodVxcLmNufGxhcmtzdWl0ZVxcLmNvbSlcXC8oPzp3aWtpfGRvY3h8ZG9jKVxcL1tBLVphLXowLTldKykvLFxuICBdO1xuICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgcGF0dGVybnMpIHtcbiAgICBjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2gocGF0dGVybik7XG4gICAgaWYgKG1hdGNoPy5bMV0pIHJldHVybiBtYXRjaFsxXS50cmltKCk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmNsYXNzIEZlaXNodUlucHV0TW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIHByaXZhdGUgaW5wdXRFbCE6IEhUTUxJbnB1dEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgb25TdWJtaXQ6ICh2YWx1ZTogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+KSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgfVxuXG4gIG9uT3BlbigpOiB2b2lkIHtcbiAgICB0aGlzLnRpdGxlRWwuc2V0VGV4dCgnXHU2MkM5XHU1M0Q2XHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzJyk7XG4gICAgdGhpcy5pbnB1dEVsID0gdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ2lucHV0Jywge1xuICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgcGxhY2Vob2xkZXI6ICdcdTdDOThcdThEMzRcdTk4REVcdTRFNjZcdTk0RkVcdTYzQTVcdTMwMDF0b2tlbiBcdTYyMTYgb2JzaWRpYW46Ly9sYXJrLWRvYyBcdTU3MzBcdTU3NDAnLFxuICAgIH0pO1xuICAgIHRoaXMuaW5wdXRFbC5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICB0aGlzLmlucHV0RWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmtleSAhPT0gJ0VudGVyJykgcmV0dXJuO1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5pbnB1dEVsLnZhbHVlLnRyaW0oKTtcbiAgICAgIGlmICghdmFsdWUpIHJldHVybjtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIHZvaWQgdGhpcy5vblN1Ym1pdCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgdGhpcy5pbnB1dEVsLmZvY3VzKCk7XG4gIH1cblxuICBvbkNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gIH1cbn1cblxuY2xhc3MgRm9sZGVyUGlja01vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBjb25zdHJ1Y3RvcihcbiAgICBhcHA6IEFwcCxcbiAgICBwcml2YXRlIGRlZmF1bHREaXI6IHN0cmluZyxcbiAgICBwcml2YXRlIG9uU3VibWl0OiAoZGlyOiBzdHJpbmcpID0+IFByb21pc2U8dm9pZD4sXG4gICkge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBvbk9wZW4oKTogdm9pZCB7XG4gICAgdGhpcy50aXRsZUVsLnNldFRleHQoJ1x1OTAwOVx1NjJFOVx1NTQwQ1x1NkI2NVx1NzZFRVx1NUY1NScpO1xuICAgIGNvbnN0IHNlbGVjdCA9IHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdzZWxlY3QnKTtcbiAgICBzZWxlY3Quc3R5bGUud2lkdGggPSAnMTAwJSc7XG5cbiAgICBjb25zdCBmb2xkZXJzID0gZ2V0Rm9sZGVycyh0aGlzLmFwcCk7XG4gICAgZm9yIChjb25zdCBmb2xkZXIgb2YgZm9sZGVycykge1xuICAgICAgY29uc3Qgb3B0aW9uID0gc2VsZWN0LmNyZWF0ZUVsKCdvcHRpb24nLCB7XG4gICAgICAgIHRleHQ6IGZvbGRlci5wYXRoIHx8ICcvJyxcbiAgICAgICAgdmFsdWU6IGZvbGRlci5wYXRoLFxuICAgICAgfSk7XG4gICAgICBvcHRpb24uc2VsZWN0ZWQgPSBmb2xkZXIucGF0aCA9PT0gdGhpcy5kZWZhdWx0RGlyO1xuICAgIH1cblxuICAgIGNvbnN0IHJvdyA9IHRoaXMuY29udGVudEVsLmNyZWF0ZURpdigpO1xuICAgIHJvdy5zdHlsZS5tYXJnaW5Ub3AgPSAnMTJweCc7XG4gICAgY29uc3QgY29uZmlybSA9IHJvdy5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnXHU1NDBDXHU2QjY1JyB9KTtcbiAgICBjb25maXJtLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICBjb25zdCBkaXIgPSBzZWxlY3QudmFsdWUgfHwgdGhpcy5kZWZhdWx0RGlyO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgdm9pZCB0aGlzLm9uU3VibWl0KGRpcik7XG4gICAgfTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRGb2xkZXJzKGFwcDogQXBwKTogVEZvbGRlcltdIHtcbiAgY29uc3QgZm9sZGVycyA9IGFwcC52YXVsdFxuICAgIC5nZXRBbGxMb2FkZWRGaWxlcygpXG4gICAgLmZpbHRlcigoZmlsZSk6IGZpbGUgaXMgVEZvbGRlciA9PiBmaWxlIGluc3RhbmNlb2YgVEZvbGRlcilcbiAgICAuZmlsdGVyKChmb2xkZXIpID0+ICFmb2xkZXIucGF0aC5zdGFydHNXaXRoKCcub2JzaWRpYW4nKSAmJiAhZm9sZGVyLnBhdGguc3RhcnRzV2l0aCgnLmZlaXNodS1zeW5jJykpO1xuICByZXR1cm4gZm9sZGVycy5sZW5ndGggPiAwID8gZm9sZGVycyA6IFthcHAudmF1bHQuZ2V0Um9vdCgpXTtcbn1cbiIsICIvKipcbiAqIFx1NTZGRVx1NzI0N1x1OTg4NFx1ODlDOFx1NkUzMlx1NjdEM1x1MzAwMlx1NEY5RFx1NjM2RSBgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTczLjMgKyBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTUxNkRcdTMwMDJcbiAqXG4gKiBPQiBtZCBcdTkxQ0NcdTU2RkVcdTcyNDdcdTUxOTlcdTYyMTAgYCFbXShmZWlzaHU6Ly9GSUxFX1RPS0VOKWBcdUZGMENcdTZFMzJcdTY3RDNcdTY1RjZcdThDMDMgbGFyay1jbGkgXHU2MzYyXHU0RTM0XHU2NUY2XHU5NEZFXHU2M0E1XHUzMDAyXG4gKiBcdTVFMjYgTFJVIFx1N0YxM1x1NUI1OFx1RkYwOFx1OTA3Rlx1NTE0RFx1NkJDRlx1NkIyMVx1NkUzMlx1NjdEM1x1OTBGRFx1NEUwQlx1OEY3RFx1RkYwOVx1RkYwQ1x1N0YxM1x1NUI1OFx1NzZFRVx1NUY1NVx1NTcyOCB2YXVsdCBcdTRFMEIgYC5mZWlzaHUtc3luYy9jYWNoZS9gXHUzMDAyXG4gKi9cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgTm90aWNlLCBQbGF0Zm9ybSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7IHJ1biB9IGZyb20gJy4vbGFyay9jbGkuanMnO1xuXG5jb25zdCBDQUNIRV9ESVIgPSAnLmZlaXNodS1zeW5jL2NhY2hlJztcblxuLyoqXG4gKiBcdTZDRThcdTUxOENcdTU2RkVcdTcyNDdcdTZFMzJcdTY3RDNcdTU5MDRcdTc0MDZcdTU2NjhcdTMwMDJcbiAqIFx1NjJFNlx1NjIyQVx1NkUzMlx1NjdEM1x1NTQwRVx1NzY4NCA8aW1nIHNyYz1cImZlaXNodTovL1RPS0VOXCI+XHVGRjBDXHU2MzYyXHU2MjEwIGxhcmstY2xpIFx1NEUwQlx1OEY3RFx1NzY4NFx1NjcyQ1x1NTczMFx1NEUzNFx1NjVGNlx1NjU4N1x1NEVGNlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJJbWFnZVJlbmRlcmVyKHBsdWdpbjogUGx1Z2luKTogdm9pZCB7XG4gIGlmICghUGxhdGZvcm0uaXNEZXNrdG9wQXBwKSByZXR1cm47XG5cbiAgY29uc3QgeyBhZGFwdGVyIH0gPSBwbHVnaW4uYXBwLnZhdWx0O1xuXG4gIHBsdWdpbi5yZWdpc3Rlck1hcmtkb3duUG9zdFByb2Nlc3Nvcihhc3luYyAoZWwsIGN0eCkgPT4ge1xuICAgIGNvbnN0IGltZ3MgPSBlbC5xdWVyeVNlbGVjdG9yQWxsKCdpbWcnKTtcbiAgICBmb3IgKGNvbnN0IGltZyBvZiBBcnJheS5mcm9tKGltZ3MpKSB7XG4gICAgICBjb25zdCBzcmMgPSBpbWcuZ2V0QXR0cmlidXRlKCdzcmMnKSB8fCAnJztcbiAgICAgIGlmICghc3JjLnN0YXJ0c1dpdGgoJ2ZlaXNodTovLycpKSBjb250aW51ZTtcblxuICAgICAgY29uc3QgdG9rZW4gPSBzcmMuc2xpY2UoJ2ZlaXNodTovLycubGVuZ3RoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGxvY2FsUGF0aCA9IGF3YWl0IHJlc29sdmVJbWFnZShwbHVnaW4sIHRva2VuKTtcbiAgICAgICAgaWYgKGxvY2FsUGF0aCkge1xuICAgICAgICAgIC8vIFx1NzUyOCB2YXVsdDovLyBcdTk0RkVcdTYzQTVcdTYyMTYgYXBwOi8vbG9jYWwvIFx1OTRGRVx1NjNBNVxuICAgICAgICAgIGNvbnN0IHZhdWx0QmFzZSA9IHBsdWdpbi5hcHAudmF1bHQuYWRhcHRlci5nZXRCYXNlUGF0aD8uKCkgPz8gJyc7XG4gICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4odmF1bHRCYXNlLCBsb2NhbFBhdGgpO1xuICAgICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoJ3NyYycsIGBhcHA6Ly9sb2NhbC8ke2Z1bGxQYXRofWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoJ2FsdCcsIGBbXHU5OERFXHU0RTY2XHU1NkZFXHU3MjQ3ICR7dG9rZW4uc2xpY2UoMCwgOCl9IFx1NTJBMFx1OEY3RFx1NTkzMVx1OEQyNV1gKTtcbiAgICAgICAgICBpbWcuc2V0QXR0cmlidXRlKCdzcmMnLCAnJyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2ltYWdlXSByZW5kZXIgZmFpbGVkOicsIHRva2VuLCBlcnIpO1xuICAgICAgICBpbWcuc2V0QXR0cmlidXRlKCdhbHQnLCBgW1x1OThERVx1NEU2Nlx1NTZGRVx1NzI0NyAke3Rva2VuLnNsaWNlKDAsIDgpfSBcdTUyQTBcdThGN0RcdTRFMkQuLi5dYCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBcdTg5RTNcdTY3OTBcdTUzNTVcdTRFMkFcdTk4REVcdTRFNjZcdTU2RkVcdTcyNDcgdG9rZW4gXHUyMTkyIFx1NjcyQ1x1NTczMFx1N0YxM1x1NUI1OFx1OERFRlx1NUY4NFx1MzAwMlxuICogXHU1NDdEXHU0RTJEXHU3RjEzXHU1QjU4XHU3NkY0XHU2M0E1XHU4RkQ0XHU1NkRFXHVGRjBDXHU1NDI2XHU1MjE5XHU4QzAzIGxhcmstY2xpIGRvY3MgK21lZGlhLWRvd25sb2FkIFx1NEUwQlx1OEY3RFx1MzAwMlxuICovXG5jb25zdCByZXNvbHZpbmcgPSBuZXcgTWFwPHN0cmluZywgUHJvbWlzZTxzdHJpbmcgfCBudWxsPj4oKTtcblxuYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZUltYWdlKHBsdWdpbjogUGx1Z2luLCB0b2tlbjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gIC8vIFx1NUU3Nlx1NTNEMVx1NTNCQlx1OTFDRFx1RkYwOFx1NTQwQ1x1NEUwMCB0b2tlbiBcdTU5MUFcdTRFMkEgaW1nIFx1NTQwQ1x1NjVGNlx1NkUzMlx1NjdEM1x1NTNFQVx1NEUwQlx1OEY3RFx1NEUwMFx1NkIyMVx1RkYwOVxuICBpZiAocmVzb2x2aW5nLmhhcyh0b2tlbikpIHJldHVybiByZXNvbHZpbmcuZ2V0KHRva2VuKSE7XG5cbiAgY29uc3QgcHJvbWlzZSA9IGRvUmVzb2x2ZUltYWdlKHBsdWdpbiwgdG9rZW4pO1xuICByZXNvbHZpbmcuc2V0KHRva2VuLCBwcm9taXNlKTtcbiAgdHJ5IHtcbiAgICByZXR1cm4gYXdhaXQgcHJvbWlzZTtcbiAgfSBmaW5hbGx5IHtcbiAgICByZXNvbHZpbmcuZGVsZXRlKHRva2VuKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBkb1Jlc29sdmVJbWFnZShwbHVnaW46IFBsdWdpbiwgdG9rZW46IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICBjb25zdCB7IGFkYXB0ZXIgfSA9IHBsdWdpbi5hcHAudmF1bHQ7XG4gIGNvbnN0IGV4dCA9ICcucG5nJzsgLy8gXHU5OERFXHU0RTY2XHU1NkZFXHU3MjQ3XHU5RUQ4XHU4QkE0IHBuZ1x1RkYwQ1x1NjVFMFx1NkNENVx1OTg4NFx1NzdFNVx1NjgzQ1x1NUYwRlx1RkYwQ1x1N0VERlx1NEUwMCBwbmdcbiAgY29uc3QgY2FjaGVQYXRoID0gYCR7Q0FDSEVfRElSfS8ke3Rva2VufSR7ZXh0fWA7XG5cbiAgLy8gXHU1NDdEXHU0RTJEXHU3RjEzXHU1QjU4XG4gIGlmIChhd2FpdCBhZGFwdGVyLmV4aXN0cyhjYWNoZVBhdGgpKSB7XG4gICAgcmV0dXJuIGNhY2hlUGF0aDtcbiAgfVxuXG4gIC8vIFx1Nzg2RVx1NEZERFx1N0YxM1x1NUI1OFx1NzZFRVx1NUY1NVx1NUI1OFx1NTcyOFxuICB0cnkge1xuICAgIGlmICghKGF3YWl0IGFkYXB0ZXIuZXhpc3RzKENBQ0hFX0RJUikpKSB7XG4gICAgICBhd2FpdCBhZGFwdGVyLm1rZGlyKENBQ0hFX0RJUik7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICAvKiBpZ25vcmUgKi9cbiAgfVxuXG4gIC8vIFx1NEUwQlx1OEY3RFx1NTIzMFx1NEUzNFx1NjVGNlx1NjcyQ1x1NTczMFx1OERFRlx1NUY4NFx1RkYwOGxhcmstY2xpIFx1OTcwMFx1ODk4MVx1NjcyQ1x1NTczMFx1NjU4N1x1NEVGNlx1N0NGQlx1N0VERlx1OERFRlx1NUY4NFx1RkYwOVxuICBjb25zdCB2YXVsdEJhc2UgPSAoYWRhcHRlciBhcyB7IGdldEJhc2VQYXRoPzogKCkgPT4gc3RyaW5nIH0pLmdldEJhc2VQYXRoPy4oKSA/PyBwcm9jZXNzLmN3ZCgpO1xuICBjb25zdCBsb2NhbEZ1bGxQYXRoID0gcGF0aC5qb2luKHZhdWx0QmFzZSwgY2FjaGVQYXRoKTtcblxuICB0cnkge1xuICAgIHJ1bihbJ2RvY3MnLCAnK21lZGlhLWRvd25sb2FkJywgJy0tdG9rZW4nLCB0b2tlbiwgJy0tb3V0cHV0JywgbG9jYWxGdWxsUGF0aF0sIHtcbiAgICAgIHRpbWVvdXQ6IDMwMDAwLFxuICAgIH0pO1xuICAgIHJldHVybiBjYWNoZVBhdGg7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUud2FybignW3N5bmMvaW1hZ2VdIG1lZGlhLWRvd25sb2FkIGZhaWxlZDonLCB0b2tlbiwgZXJyKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFx1NkUwNVx1NzQwNlx1OEZDN1x1NjcxRlx1N0YxM1x1NUI1OFx1MzAwMlx1NEY5RFx1NjM2RVx1OEJCRVx1N0Y2RSBjYWNoZUNsZWFudXAgXHU1NDY4XHU2NzFGXHUzMDAyXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhbnVwSW1hZ2VDYWNoZShwbHVnaW46IFBsdWdpbiwgbW9kZTogJ2RhaWx5JyB8ICd3ZWVrbHknIHwgJ21vbnRobHknIHwgJ25ldmVyJyk6IFByb21pc2U8dm9pZD4ge1xuICBpZiAobW9kZSA9PT0gJ25ldmVyJykgcmV0dXJuO1xuXG4gIGNvbnN0IHsgYWRhcHRlciB9ID0gcGx1Z2luLmFwcC52YXVsdDtcbiAgaWYgKCEoYXdhaXQgYWRhcHRlci5leGlzdHMoQ0FDSEVfRElSKSkpIHJldHVybjtcblxuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICBjb25zdCB0dGxNcyA9XG4gICAgbW9kZSA9PT0gJ2RhaWx5JyA/IDI0ICogMzYwMCAqIDEwMDAgOlxuICAgIG1vZGUgPT09ICd3ZWVrbHknID8gNyAqIDI0ICogMzYwMCAqIDEwMDAgOlxuICAgIDMwICogMjQgKiAzNjAwICogMTAwMDtcblxuICBsZXQgY2xlYW5lZCA9IDA7XG4gIHRyeSB7XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCBhZGFwdGVyLmxpc3QoQ0FDSEVfRElSKTtcbiAgICBmb3IgKGNvbnN0IGYgb2YgZmlsZXMuZmlsZXMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN0YXQgPSBhd2FpdCBhZGFwdGVyLnN0YXQoZik7XG4gICAgICAgIGlmIChzdGF0Py5tdGltZSAmJiBub3cgLSBzdGF0Lm10aW1lID4gdHRsTXMpIHtcbiAgICAgICAgICBhd2FpdCBhZGFwdGVyLnJlbW92ZShmKTtcbiAgICAgICAgICBjbGVhbmVkKys7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUud2FybignW3N5bmMvaW1hZ2VdIGNsZWFudXAgZmFpbGVkOicsIGVycik7XG4gIH1cblxuICBpZiAoY2xlYW5lZCA+IDApIHtcbiAgICBuZXcgTm90aWNlKGBcdUQ4M0VcdURERjkgXHU1REYyXHU2RTA1XHU3NDA2ICR7Y2xlYW5lZH0gXHU0RTJBXHU4RkM3XHU2NzFGXHU1NkZFXHU3MjQ3XHU3RjEzXHU1QjU4YCk7XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QUFDO0FBQ0YsV0FBTyxJQUFJLFdBQVcsb0JBQW9CLEtBQUssR0FBRyxDQUFDO0FBQ25ELFdBQU8sSUFBSSxhQUFhLHNCQUFzQjtBQUFBLE1BQzVDLEtBQUssS0FBSztBQUFBLE1BQ1YsVUFBVSxLQUFLO0FBQUEsTUFDZixRQUFRLENBQUMsTUFBTSxJQUFJLHdCQUFPLENBQUM7QUFBQSxJQUM3QixDQUFDLENBQUM7QUFFRixRQUFJO0FBQ0YsWUFBTSxFQUFFLEtBQUssSUFBSSxNQUFNLFlBQVksS0FBSyxTQUFTLE1BQU0sSUFBSTtBQUMzRCxXQUFLLGFBQWE7QUFDbEIsV0FBSyxNQUFNLGdCQUFnQjtBQUFBLElBQzdCLFNBQVMsS0FBSztBQUNaLFlBQU0sTUFBTSxlQUFlLFFBQVEsSUFBSSxVQUFVLE9BQU8sR0FBRztBQUMzRCxVQUFJLHdCQUFPLGlFQUF5QixLQUFLLFNBQVMsSUFBSSxlQUFLLEdBQUcsRUFBRTtBQUNoRSxjQUFRLE1BQU0sK0JBQStCLEdBQUc7QUFBQSxJQUNsRDtBQUFBLEVBQ0Y7QUFDRjtBQUdBLFNBQVNBLGlCQUF3QjtBQUMvQixRQUFNLFFBQVEsSUFBSSxXQUFXLEVBQUU7QUFDL0IsRUFBQyxXQUFXLE9BQWtCLGdCQUFnQixLQUFLO0FBQ25ELFNBQU8sTUFBTSxLQUFLLEtBQUssRUFBRSxJQUFJLE9BQUssRUFBRSxTQUFTLEVBQUUsRUFBRSxTQUFTLEdBQUcsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFO0FBQzVFO0FBR0EsSUFBTyxlQUFROyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgIm1vZHVsZSIsICJZQU1MRXhjZXB0aW9uIiwgImxpbmUiLCAiVHlwZSIsICJTY2hlbWEiLCAiREVGQVVMVF9TQ0hFTUEiLCAibG9hZEFsbCIsICJsb2FkIiwgInN0cmluZyIsICJkdW1wIiwgInlhbWwiLCAianNvbiIsICJ1bndyYXBMYXJrRW52ZWxvcGUiLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiZW5zdXJlRm9sZGVyIiwgImVuc3VyZUZvbGRlciIsICJmaW5kQnlGZWlzaHVJZCIsICJmaW5kQnlGZWlzaHVJZCIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgInJ1biIsICJpbXBvcnRfb2JzaWRpYW4iLCAicGF0aCIsICJnZW5lcmF0ZVRva2VuIl0KfQo=
