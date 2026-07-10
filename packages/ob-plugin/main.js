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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzLnRzIiwgInNyYy9zZXR0aW5nc1RhYi50cyIsICJzcmMvbGFyay9jbGkudHMiLCAiLi4vc2hhcmVkL3NyYy90eXBlcy50cyIsICIuLi9zaGFyZWQvc3JjL3Byb3RvY29sLnRzIiwgIi4uL3NoYXJlZC9zcmMvaGFzaC50cyIsICIuLi9zaGFyZWQvc3JjL2ZpbGVuYW1lLnRzIiwgIi4uL3NoYXJlZC9zcmMvaW1hZ2UudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL2NvbW1vbi5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9saWIvZXhjZXB0aW9uLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9zbmlwcGV0LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi90eXBlLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9zY2hlbWEuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL3R5cGUvc3RyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi90eXBlL3NlcS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9saWIvdHlwZS9tYXAuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL3NjaGVtYS9mYWlsc2FmZS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9saWIvdHlwZS9udWxsLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi90eXBlL2Jvb2wuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL3R5cGUvaW50LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi90eXBlL2Zsb2F0LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9zY2hlbWEvanNvbi5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9saWIvc2NoZW1hL2NvcmUuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL3R5cGUvdGltZXN0YW1wLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi90eXBlL21lcmdlLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi90eXBlL2JpbmFyeS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9saWIvdHlwZS9vbWFwLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi90eXBlL3BhaXJzLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi90eXBlL3NldC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9saWIvc2NoZW1hL2RlZmF1bHQuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL2xvYWRlci5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvanMteWFtbC9saWIvZHVtcGVyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2luZGV4LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9pbmRleF92aXRlX3Byb3h5LnRtcC5tanMiLCAiLi4vc2hhcmVkL3NyYy95YW1sLnRzIiwgIi4uL3NoYXJlZC9zcmMvY2FsbG91dC50cyIsICJzcmMvbWFwcGluZy50cyIsICJzcmMvc2VydmVyLnRzIiwgInNyYy9oYW5kbGVycy9zdGF0dXNIYW5kbGVyLnRzIiwgInNyYy9oYW5kbGVycy90cmVlSGFuZGxlci50cyIsICJzcmMvaGFuZGxlcnMvZmV0Y2hIYW5kbGVyLnRzIiwgInNyYy9maWxlaW8vd3JpdGVyLnRzIiwgInNyYy9hdXRvUmVuYW1lLnRzIiwgInNyYy9oYW5kbGVycy9jbGlwSGFuZGxlci50cyIsICJzcmMvaGFuZGxlcnMvZXhpc3RzSGFuZGxlci50cyIsICJzcmMvaGFuZGxlcnMvcHVzaGJhY2tIYW5kbGVyLnRzIiwgInNyYy9jb21tYW5kcy50cyIsICJzcmMvZmV0Y2hFbnRyeXBvaW50cy50cyIsICJzcmMvaW1hZ2VSZW5kZXIudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogT0IgXHU2M0QyXHU0RUY2XHU1MTY1XHU1M0UzXHUzMDAyXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzQuMVx1RkYwOFx1NkEyMVx1NTc1NyBCXHVGRjA5XHUzMDAyXG4gKlxuICogXHU4MDRDXHU4RDIzXHVGRjFBXG4gKiAxLiBcdTUyQTBcdThGN0RcdThCQkVcdTdGNkVcdUZGMDhcdTk5OTZcdTZCMjFcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTBcdTU0MkZcdTUyQThcdTRFRTRcdTcyNENcdUZGMDlcbiAqIDIuIFx1NjNBMlx1NkQ0QiBsYXJrLWNsaVxuICogMy4gXHU1NDJGXHU1MkE4XHU2NzJDXHU1NzMwIEhUVFAgc2VydmVyXHVGRjBDXHU2Q0U4XHU1MThDXHU4REVGXHU3NTMxXG4gKiA0LiBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcdTMwMDFcdThCQkVcdTdGNkVcdTk4NzVcdTMwMDFcdTU2RkVcdTcyNDdcdTZFMzJcdTY3RDNcdTMwMDFcdTUyMjBcdTk2NjRcdTc2RDFcdTU0MkNcbiAqIDUuIFx1NTM3OFx1OEY3RFx1NjVGNlx1NTA1Q1x1NkI2MiBzZXJ2ZXJcbiAqL1xuaW1wb3J0IHsgUGx1Z2luLCBOb3RpY2UgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQge1xuICBERUZBVUxUX1NFVFRJTkdTLFxuICB0eXBlIEZlaXNodVN5bmNTZXR0aW5ncyxcbiAgdHlwZSBQbHVnaW5TdGF0ZSxcbiAgdHlwZSBSZWNlbnRTeW5jLFxufSBmcm9tICcuL3NldHRpbmdzLmpzJztcbmltcG9ydCB7IEZlaXNodVN5bmNTZXR0aW5nVGFiIH0gZnJvbSAnLi9zZXR0aW5nc1RhYi5qcyc7XG5pbXBvcnQgeyBzdGFydFNlcnZlciwgdHlwZSBTZXJ2ZXJEZXBzLCB0eXBlIFJvdXRlSGFuZGxlciB9IGZyb20gJy4vc2VydmVyLmpzJztcbmltcG9ydCB7IHJlc29sdmVDbGkgfSBmcm9tICcuL2xhcmsvY2xpLmpzJztcbmltcG9ydCB7IGNyZWF0ZVN0YXR1c0hhbmRsZXIgfSBmcm9tICcuL2hhbmRsZXJzL3N0YXR1c0hhbmRsZXIuanMnO1xuaW1wb3J0IHsgY3JlYXRlVHJlZUhhbmRsZXIgfSBmcm9tICcuL2hhbmRsZXJzL3RyZWVIYW5kbGVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZUZldGNoSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlcnMvZmV0Y2hIYW5kbGVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZUNsaXBIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9jbGlwSGFuZGxlci5qcyc7XG5pbXBvcnQgeyBjcmVhdGVFeGlzdHNIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9leGlzdHNIYW5kbGVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZVB1c2hiYWNrSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlcnMvcHVzaGJhY2tIYW5kbGVyLmpzJztcbmltcG9ydCB7IHJlZ2lzdGVyQ29tbWFuZHMgfSBmcm9tICcuL2NvbW1hbmRzLmpzJztcbmltcG9ydCB7IHJlZ2lzdGVyRmV0Y2hFbnRyeXBvaW50cyB9IGZyb20gJy4vZmV0Y2hFbnRyeXBvaW50cy5qcyc7XG5pbXBvcnQgeyByZWdpc3RlckltYWdlUmVuZGVyZXIsIGNsZWFudXBJbWFnZUNhY2hlIH0gZnJvbSAnLi9pbWFnZVJlbmRlci5qcyc7XG5pbXBvcnQgeyByZWZyZXNoTWFwcGluZyB9IGZyb20gJy4vbWFwcGluZy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBGZWlzaHVTeW5jUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgc2V0dGluZ3MhOiBGZWlzaHVTeW5jU2V0dGluZ3M7XG4gIHN0YXRlITogUGx1Z2luU3RhdGU7XG4gIHByaXZhdGUgc3RvcFNlcnZlcj86ICgpID0+IFByb21pc2U8dm9pZD47XG5cbiAgYXN5bmMgb25sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cbiAgICAvLyBcdThGRDBcdTg4NENcdTY1RjZcdTcyQjZcdTYwMDFcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbGFya0NsaVJlc29sdmVkOiAnJyxcbiAgICAgIGxhcmtDbGlWZXJzaW9uOiAnJyxcbiAgICAgIHNlcnZlclJ1bm5pbmc6IGZhbHNlLFxuICAgICAgcmVjZW50U3luY3M6IFtdIGFzIFJlY2VudFN5bmNbXSxcbiAgICB9O1xuXG4gICAgLy8gXHU5OTk2XHU2QjIxXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXHU1NDJGXHU1MkE4XHU0RUU0XHU3MjRDXG4gICAgaWYgKCF0aGlzLnNldHRpbmdzLnN5bmNUb2tlbikge1xuICAgICAgdGhpcy5zZXR0aW5ncy5zeW5jVG9rZW4gPSBnZW5lcmF0ZVRva2VuKCk7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncygpO1xuICAgIH1cblxuICAgIC8vIFx1NjNBMlx1NkQ0QiBsYXJrLWNsaVxuICAgIGNvbnN0IGxhcmtJbmZvID0gcmVzb2x2ZUNsaSh0aGlzLnNldHRpbmdzLmxhcmtDbGlQYXRoIHx8IHVuZGVmaW5lZCk7XG4gICAgaWYgKGxhcmtJbmZvKSB7XG4gICAgICB0aGlzLnN0YXRlLmxhcmtDbGlSZXNvbHZlZCA9IGxhcmtJbmZvLnBhdGg7XG4gICAgICB0aGlzLnN0YXRlLmxhcmtDbGlWZXJzaW9uID0gbGFya0luZm8udmVyc2lvbjtcbiAgICAgIHByb2Nlc3MuZW52Ll9fTEFSS19DTElfUEFUSF9fID0gbGFya0luZm8ucGF0aDtcbiAgICAgIGNvbnNvbGUubG9nKGBbc3luY10gbGFyay1jbGk6ICR7bGFya0luZm8udmVyc2lvbn0gQCAke2xhcmtJbmZvLnBhdGh9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybignW3N5bmNdIGxhcmstY2xpIG5vdCBmb3VuZCAobmVlZCA+PSAxLjAuNTIpJyk7XG4gICAgfVxuXG4gICAgLy8gXHU4QkJFXHU3RjZFXHU5ODc1XG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBGZWlzaHVTeW5jU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xuXG4gICAgLy8gXHU1NDdEXHU0RUU0XG4gICAgcmVnaXN0ZXJDb21tYW5kcyh0aGlzKTtcbiAgICByZWdpc3RlckZldGNoRW50cnlwb2ludHModGhpcyk7XG5cbiAgICAvLyBcdTU2RkVcdTcyNDdcdTZFMzJcdTY3RDNcbiAgICByZWdpc3RlckltYWdlUmVuZGVyZXIodGhpcyk7XG5cbiAgICAvLyBcdTU0MkZcdTUyQTggSFRUUCBzZXJ2ZXJcbiAgICBhd2FpdCB0aGlzLnN0YXJ0SHR0cFNlcnZlcigpO1xuXG4gICAgLy8gcmliYm9uIFx1NTZGRVx1NjgwN1xuICAgIHRoaXMuYWRkUmliYm9uSWNvbigncmVmcmVzaC1jdycsICdcdTk4REVcdTRFNjZcdTU0MENcdTZCNjUnLCBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCByZWZyZXNoTWFwcGluZyh0aGlzLmFwcCwgdGhpcy5zZXR0aW5ncy5zcGFjZUlkKTtcbiAgICB9KTtcblxuICAgIC8vIFx1NTQyRlx1NTJBOFx1NjVGNlx1NkUwNVx1NzQwNlx1NEUwMFx1NkIyMVx1OEZDN1x1NjcxRlx1N0YxM1x1NUI1OFxuICAgIHRoaXMucmVnaXN0ZXJFdmVudChcbiAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbignbGF5b3V0LXJlYWR5JywgKCkgPT4ge1xuICAgICAgICBjbGVhbnVwSW1hZ2VDYWNoZSh0aGlzLCB0aGlzLnNldHRpbmdzLmNhY2hlQ2xlYW51cCkuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgfSksXG4gICAgKTtcblxuICAgIGNvbnNvbGUubG9nKGBbc3luY10gZmVpc2h1LXN5bmMgbG9hZGVkIG9uIHBvcnQgJHt0aGlzLnNldHRpbmdzLnBvcnR9YCk7XG4gIH1cblxuICBhc3luYyBvbnVubG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5zdG9wU2VydmVyKSB7XG4gICAgICBhd2FpdCB0aGlzLnN0b3BTZXJ2ZXIoKTtcbiAgICAgIHRoaXMuc3RvcFNlcnZlciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ1tzeW5jXSBmZWlzaHUtc3luYyB1bmxvYWRlZCcpO1xuICB9XG5cbiAgYXN5bmMgbG9hZFNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuICB9XG5cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cblxuICAvKiogXHU1NDJGXHU1MkE4IEhUVFAgc2VydmVyXHVGRjBDXHU2Q0U4XHU1MThDXHU2MjQwXHU2NzA5XHU4REVGXHU3NTMxXHUzMDAyICovXG4gIHByaXZhdGUgYXN5bmMgc3RhcnRIdHRwU2VydmVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJvdXRlcyA9IG5ldyBNYXA8c3RyaW5nLCBSb3V0ZUhhbmRsZXI+KCk7XG5cbiAgICBjb25zdCBkZXBzOiBTZXJ2ZXJEZXBzID0ge1xuICAgICAgdmFsaWRhdGVUb2tlbjogKHRva2VuKSA9PiB0b2tlbiA9PT0gdGhpcy5zZXR0aW5ncy5zeW5jVG9rZW4sXG4gICAgICByb3V0ZXMsXG4gICAgfTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1OERFRlx1NzUzMVxuICAgIHJvdXRlcy5zZXQoJy9zdGF0dXMnLCBjcmVhdGVTdGF0dXNIYW5kbGVyKHRoaXMubWFuaWZlc3QudmVyc2lvbiwgdGhpcy5hcHAudmF1bHQuZ2V0TmFtZSgpLCB0aGlzLnN0YXRlKSk7XG4gICAgcm91dGVzLnNldCgnL3RyZWUnLCBjcmVhdGVUcmVlSGFuZGxlcih0aGlzLmFwcCkpO1xuICAgIHJvdXRlcy5zZXQoJy9mZXRjaCcsIGNyZWF0ZUZldGNoSGFuZGxlcih7XG4gICAgICBhcHA6IHRoaXMuYXBwLFxuICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3MsXG4gICAgICBzdGF0ZTogdGhpcy5zdGF0ZSxcbiAgICAgIG5vdGljZTogKG0pID0+IG5ldyBOb3RpY2UobSksXG4gICAgfSkpO1xuICAgIHJvdXRlcy5zZXQoJy9jbGlwJywgY3JlYXRlQ2xpcEhhbmRsZXIoe1xuICAgICAgYXBwOiB0aGlzLmFwcCxcbiAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxuICAgICAgbm90aWNlOiAobSkgPT4gbmV3IE5vdGljZShtKSxcbiAgICB9KSk7XG4gICAgcm91dGVzLnNldCgnL2V4aXN0cycsIGNyZWF0ZUV4aXN0c0hhbmRsZXIodGhpcy5hcHApKTtcbiAgICByb3V0ZXMuc2V0KCcvcHVzaGJhY2snLCBjcmVhdGVQdXNoYmFja0hhbmRsZXIoe1xuICAgICAgYXBwOiB0aGlzLmFwcCxcbiAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxuICAgICAgbm90aWNlOiAobSkgPT4gbmV3IE5vdGljZShtKSxcbiAgICB9KSk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzdG9wIH0gPSBhd2FpdCBzdGFydFNlcnZlcih0aGlzLnNldHRpbmdzLnBvcnQsIGRlcHMpO1xuICAgICAgdGhpcy5zdG9wU2VydmVyID0gc3RvcDtcbiAgICAgIHRoaXMuc3RhdGUuc2VydmVyUnVubmluZyA9IHRydWU7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zdCBtc2cgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycik7XG4gICAgICBuZXcgTm90aWNlKGBcdTI3NEMgSFRUUCBzZXJ2ZXIgXHU1NDJGXHU1MkE4XHU1OTMxXHU4RDI1XHVGRjA4XHU3QUVGXHU1M0UzICR7dGhpcy5zZXR0aW5ncy5wb3J0fVx1RkYwOVx1RkYxQSR7bXNnfWApO1xuICAgICAgY29uc29sZS5lcnJvcignW3N5bmNdIHNlcnZlciBzdGFydCBmYWlsZWQ6JywgZXJyKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqIFx1NzUxRlx1NjIxMCAzMiBcdTVCNTdcdTgyODIgaGV4IFx1NEVFNFx1NzI0Q1x1MzAwMiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVUb2tlbigpOiBzdHJpbmcge1xuICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KDMyKTtcbiAgKGdsb2JhbFRoaXMuY3J5cHRvIGFzIENyeXB0bykuZ2V0UmFuZG9tVmFsdWVzKGJ5dGVzKTtcbiAgcmV0dXJuIEFycmF5LmZyb20oYnl0ZXMpLm1hcChiID0+IGIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xufVxuXG4vLyBPYnNpZGlhbiBcdTYzRDJcdTRFRjZcdTUxNjVcdTUzRTNcdUZGMUFcdTVGQzVcdTk4N0JcdTlFRDhcdThCQTRcdTVCRkNcdTUxRkEgUGx1Z2luIFx1NUI1MFx1N0M3QlxuZXhwb3J0IGRlZmF1bHQgRmVpc2h1U3luY1BsdWdpbjtcbiIsICIvKipcbiAqIE9CIFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1NjNBNVx1NTNFMyArIFx1OUVEOFx1OEJBNFx1NTAzQ1x1MzAwMlxuICogXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzEwXHVGRjA4U2V0dGluZ3NUYWJcdUZGMDlcdTMwMDJcbiAqL1xuaW1wb3J0IHR5cGUgeyBUcmVlTm9kZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmVpc2h1U3luY1NldHRpbmdzIHtcbiAgLyoqIFx1NjcyQ1x1NTczMCBIVFRQIHNlcnZlciBcdTdBRUZcdTUzRTNcdUZGMDhcdTlFRDhcdThCQTQgNDU2N1x1RkYwOVx1MzAwMiAqL1xuICBwb3J0OiBudW1iZXI7XG4gIC8qKiBcdTU0MkZcdTUyQThcdTRFRTRcdTcyNENcdUZGMDgzMiBcdTVCNTdcdTgyODIgaGV4XHVGRjBDXHU5OTk2XHU2QjIxXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXHVGRjA5XHUzMDAyICovXG4gIHN5bmNUb2tlbjogc3RyaW5nO1xuICAvKiogbGFyay1jbGkgXHU4REVGXHU1Rjg0XHVGRjA4XHU3QTdBPVx1ODFFQVx1NTJBOFx1NjNBMlx1NkQ0Qlx1RkYwOVx1MzAwMiAqL1xuICBsYXJrQ2xpUGF0aDogc3RyaW5nO1xuICAvKiogXHU5RUQ4XHU4QkE0XHU4NDNEXHU1NzMwXHU3NkVFXHU1RjU1XHVGRjA4XHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1RkYwOVx1MzAwMiAqL1xuICBkZWZhdWx0RGlyOiBzdHJpbmc7XG4gIC8qKiBcdTgxRUFcdTUyQThcdTg5RTZcdTUzRDEgYXV0by1yZW5hbWUgXHU3RjE2XHU3ODAxXHU1MjA2XHU5MTREXHUzMDAyICovXG4gIGF1dG9SZW5hbWU6IGJvb2xlYW47XG4gIC8qKiBcdTgxRUFcdTUyQThcdTc2N0JcdThCQjBcdTUyMjBcdTk2NjRcdUZGMDhcdTUxOTlcdTk4REVcdTRFNjZcdTU5MUFcdTdFRjRcdTg4NjhcdTY4M0NcdUZGMDlcdTMwMDIgKi9cbiAgYXV0b0RlbGV0ZVJlZ2lzdHJ5OiBib29sZWFuO1xuICAvKiogXHU1NkZFXHU3MjQ3XHU3RjEzXHU1QjU4XHU2RTA1XHU3NDA2XHU1NDY4XHU2NzFGXHUzMDAyICovXG4gIGNhY2hlQ2xlYW51cDogJ2RhaWx5JyB8ICd3ZWVrbHknIHwgJ21vbnRobHknIHwgJ25ldmVyJztcbiAgLyoqIFx1NEZERFx1NzU1OVx1ODhDNVx1OTk3MFx1NTZGRVx1NzI0N1x1MzAwMiAqL1xuICBrZWVwRGVjb3JhdGl2ZUltYWdlczogYm9vbGVhbjtcbiAgLyoqIFx1OThERVx1NEU2Nlx1NzdFNVx1OEJDNlx1NUU5MyBzcGFjZV9pZFx1RkYwOFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1NzUyOFx1RkYwOVx1MzAwMiAqL1xuICBzcGFjZUlkOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBGZWlzaHVTeW5jU2V0dGluZ3MgPSB7XG4gIHBvcnQ6IDQ1NjcsXG4gIHN5bmNUb2tlbjogJycsXG4gIGxhcmtDbGlQYXRoOiAnJyxcbiAgZGVmYXVsdERpcjogJzBcdUZFMEZcdTIwRTNcdThGOTNcdTUxNjUnLFxuICBhdXRvUmVuYW1lOiB0cnVlLFxuICBhdXRvRGVsZXRlUmVnaXN0cnk6IHRydWUsXG4gIGNhY2hlQ2xlYW51cDogJ3dlZWtseScsXG4gIGtlZXBEZWNvcmF0aXZlSW1hZ2VzOiB0cnVlLFxuICBzcGFjZUlkOiAnNzY1MTMxNDE1MDA2MDA2NzgwMycsXG59O1xuXG4vKiogXHU2M0QyXHU0RUY2XHU4RkQwXHU4ODRDXHU2NUY2XHU3MkI2XHU2MDAxXHVGRjA4XHU0RTBEXHU2MzAxXHU0RTQ1XHU1MzE2XHVGRjA5XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFBsdWdpblN0YXRlIHtcbiAgLyoqIGxhcmstY2xpIFx1NUI5RVx1OTY0NVx1OERFRlx1NUY4NFx1RkYwOFx1NjNBMlx1NkQ0Qi9cdThCQkVcdTdGNkVcdTU0MEVcdTc2ODRcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMDlcdTMwMDIgKi9cbiAgbGFya0NsaVJlc29sdmVkOiBzdHJpbmc7XG4gIC8qKiBsYXJrLWNsaSBcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMDhcdTU5ODIgXCIxLjAuNTJcIlx1RkYwOVx1MzAwMiAqL1xuICBsYXJrQ2xpVmVyc2lvbjogc3RyaW5nO1xuICAvKiogSFRUUCBzZXJ2ZXIgXHU2NjJGXHU1NDI2XHU2QjYzXHU1NzI4XHU4RkQwXHU4ODRDXHUzMDAyICovXG4gIHNlcnZlclJ1bm5pbmc6IGJvb2xlYW47XG4gIC8qKiBcdTY3MDBcdThGRDFcdTU0MENcdTZCNjVcdThCQjBcdTVGNTVcdUZGMDhcdTUxODVcdTVCNThcdTRFMkRcdUZGMENcdTY3MDBcdTU5MUEgNTAgXHU2NzYxXHVGRjA5XHUzMDAyICovXG4gIHJlY2VudFN5bmNzOiBSZWNlbnRTeW5jW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVjZW50U3luYyB7XG4gIHRpbWU6IHN0cmluZztcbiAgbm9kZV90b2tlbjogc3RyaW5nO1xuICB0aXRsZTogc3RyaW5nO1xuICBwYXRoOiBzdHJpbmc7XG4gIGFjdGlvbjogJ2NyZWF0ZWQnIHwgJ3VwZGF0ZWQnIHwgJ2Vycm9yJztcbiAgZXJyb3I/OiBzdHJpbmc7XG59XG4iLCAiLyoqXG4gKiBPQiBcdTYzRDJcdTRFRjZcdThCQkVcdTdGNkVcdTc1NENcdTk3NjJcdTMwMDJcdTRGOURcdTYzNkVcdTY1QjlcdTY4NDggXHUwMEE3MTBcdUZGMDhTZXR0aW5nc1RhYlx1RkYwOVx1MzAwMlxuICpcbiAqIFx1N0FFRlx1NTNFM1x1MzAwMVx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1x1RkYwOFx1NzUxRlx1NjIxMC9cdTkxQ0RcdTdGNkUvXHU1OTBEXHU1MjM2XHVGRjA5XHUzMDAxbGFyay1jbGkgXHU4REVGXHU1Rjg0XHUzMDAxXHU5RUQ4XHU4QkE0XHU3NkVFXHU1RjU1XHUzMDAxXHU1RjAwXHU1MTczXHUzMDAxXHU3RjEzXHU1QjU4XHU1NDY4XHU2NzFGXHUzMDAyXG4gKi9cbmltcG9ydCB7IEFwcCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZywgTm90aWNlLCBzZXRJY29uIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBGZWlzaHVTeW5jUGx1Z2luIH0gZnJvbSAnLi9tYWluLmpzJztcbmltcG9ydCB7IHJlc29sdmVDbGkgfSBmcm9tICcuL2xhcmsvY2xpLmpzJztcbmltcG9ydCB7IHJlZnJlc2hNYXBwaW5nIH0gZnJvbSAnLi9tYXBwaW5nLmpzJztcblxuZXhwb3J0IGNsYXNzIEZlaXNodVN5bmNTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBGZWlzaHVTeW5jUGx1Z2luKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG5cbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICdcdTk4REVcdTRFNjZcdTU0MENcdTZCNjVcdThCQkVcdTdGNkUnIH0pO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwIFx1OTAxQVx1NEZFMSBcdTI1MDBcdTI1MDBcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTY3MkNcdTU3MzBcdTdBRUZcdTUzRTMnKVxuICAgICAgLnNldERlc2MoJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NjI2OVx1NUM1NVx1OEZERVx1NjNBNSBPQiBcdTYzRDJcdTRFRjZcdTc2ODRcdTdBRUZcdTUzRTNcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkYgT0IgXHU2MjE2XHU5MUNEXHU2NUIwXHU1MkEwXHU4RjdEXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFZhbHVlKFN0cmluZyh0aGlzLnBsdWdpbi5zZXR0aW5ncy5wb3J0KSlcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3J0ID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcbiAgICAgICAgICAgIGlmIChwb3J0ID4gMCAmJiBwb3J0IDwgNjU1MzYpIHtcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MucG9ydCA9IHBvcnQ7XG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgIC8vIFx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1xuICAgIGNvbnN0IHRva2VuU2V0dGluZyA9IG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NTQyRlx1NTJBOFx1NEVFNFx1NzI0QycpXG4gICAgICAuc2V0RGVzYygnXHU2RDRGXHU4OUM4XHU1NjY4XHU2MjY5XHU1QzU1XHU5OTk2XHU2QjIxXHU4RkRFXHU2M0E1XHU5NzAwXHU3Qzk4XHU4RDM0XHU2QjY0XHU0RUU0XHU3MjRDXHUzMDAyXHU3MEI5XHU1MUZCXHU1OTBEXHU1MjM2XHU1NDBFXHU3Qzk4XHU4RDM0XHU1MjMwXHU2MjY5XHU1QzU1XHU1RjM5XHU3QTk3XHUzMDAyJyk7XG5cbiAgICB0b2tlblNldHRpbmcuYWRkVGV4dCgodGV4dCkgPT4ge1xuICAgICAgdGV4dFxuICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY1Rva2VuKVxuICAgICAgICAuc2V0RGlzYWJsZWQodHJ1ZSkgLy8gXHU1M0VBXHU4QkZCXHVGRjBDXHU5MDdGXHU1MTREXHU2MjRCXHU2NTM5XG4gICAgICAgIC5pbnB1dEVsLnN0eWxlLmZvbnRGYW1pbHkgPSAnbW9ub3NwYWNlJztcbiAgICB9KTtcblxuICAgIHRva2VuU2V0dGluZy5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgIGJ0blxuICAgICAgICAuc2V0QnV0dG9uVGV4dCgnXHU1OTBEXHU1MjM2JylcbiAgICAgICAgLnNldFRvb2x0aXAoJ1x1NTkwRFx1NTIzNlx1NEVFNFx1NzI0Q1x1NTIzMFx1NTI2QVx1OEQzNFx1Njc3RicpXG4gICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jVG9rZW4pO1xuICAgICAgICAgIG5ldyBOb3RpY2UoJ1x1MjcwNSBcdTRFRTRcdTcyNENcdTVERjJcdTU5MERcdTUyMzYnKTtcbiAgICAgICAgfSksXG4gICAgKTtcblxuICAgIHRva2VuU2V0dGluZy5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgIGJ0blxuICAgICAgICAuc2V0QnV0dG9uVGV4dCgnXHU5MUNEXHU3RjZFJylcbiAgICAgICAgLnNldFRvb2x0aXAoJ1x1NzUxRlx1NjIxMFx1NjVCMFx1NEVFNFx1NzI0Q1x1RkYwOFx1NjI2OVx1NUM1NVx1OTcwMFx1OTFDRFx1NjVCMFx1N0M5OFx1OEQzNFx1RkYwOScpXG4gICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jVG9rZW4gPSBnZW5lcmF0ZVRva2VuKCk7XG4gICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XG4gICAgICAgICAgbmV3IE5vdGljZSgnXHVEODNEXHVERDA0IFx1NEVFNFx1NzI0Q1x1NURGMlx1OTFDRFx1N0Y2RScpO1xuICAgICAgICB9KSxcbiAgICApO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwIGxhcmstY2xpIFx1MjUwMFx1MjUwMFxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ2xhcmstY2xpJyB9KTtcblxuICAgIGNvbnN0IGxhcmtJbmZvID0gY29udGFpbmVyRWwuY3JlYXRlRWwoJ3AnLCB7XG4gICAgICB0ZXh0OiBgXHU3MkI2XHU2MDAxXHVGRjFBJHt0aGlzLnBsdWdpbi5zdGF0ZS5sYXJrQ2xpUmVzb2x2ZWQgPyAnXHUyNzA1ICcgKyB0aGlzLnBsdWdpbi5zdGF0ZS5sYXJrQ2xpVmVyc2lvbiA6ICdcdTI3NEMgXHU2NzJBXHU2MjdFXHU1MjMwJ31gLFxuICAgICAgY2xzOiAnc2V0dGluZy1pdGVtLWRlc2NyaXB0aW9uJyxcbiAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ2xhcmstY2xpIFx1OERFRlx1NUY4NCcpXG4gICAgICAuc2V0RGVzYygnXHU3NTU5XHU3QTdBXHU1MjE5XHU4MUVBXHU1MkE4XHU2M0EyXHU2RDRCXHUzMDAyXHU1OTgyXHU4MUVBXHU1MkE4XHU2M0EyXHU2RDRCXHU1OTMxXHU4RDI1XHVGRjBDXHU4QkY3XHU2MjRCXHU1MkE4XHU1ODZCXHU1MTk5XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHUzMDAyJylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmxhcmtDbGlQYXRoKVxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignXHU4MUVBXHU1MkE4XHU2M0EyXHU2RDRCJylcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5sYXJrQ2xpUGF0aCA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApXG4gICAgICAuYWRkQnV0dG9uKChidG4pID0+XG4gICAgICAgIGJ0blxuICAgICAgICAgIC5zZXRCdXR0b25UZXh0KCdcdTZENEJcdThCRDUnKVxuICAgICAgICAgIC5zZXRUb29sdGlwKCdcdTkxQ0RcdTY1QjBcdTYzQTJcdTZENEIgbGFyay1jbGknKVxuICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc29sdmVDbGkodGhpcy5wbHVnaW4uc2V0dGluZ3MubGFya0NsaVBhdGggfHwgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc3RhdGUubGFya0NsaVJlc29sdmVkID0gcmVzdWx0LnBhdGg7XG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnN0YXRlLmxhcmtDbGlWZXJzaW9uID0gcmVzdWx0LnZlcnNpb247XG4gICAgICAgICAgICAgIGxhcmtJbmZvLnNldFRleHQoYFx1NzJCNlx1NjAwMVx1RkYxQVx1MjcwNSAke3Jlc3VsdC52ZXJzaW9ufWApO1xuICAgICAgICAgICAgICBuZXcgTm90aWNlKGBcdTI3MDUgXHU2MjdFXHU1MjMwICR7cmVzdWx0LnZlcnNpb259YCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zdGF0ZS5sYXJrQ2xpUmVzb2x2ZWQgPSAnJztcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc3RhdGUubGFya0NsaVZlcnNpb24gPSAnJztcbiAgICAgICAgICAgICAgbGFya0luZm8uc2V0VGV4dCgnXHU3MkI2XHU2MDAxXHVGRjFBXHUyNzRDIFx1NjcyQVx1NjI3RVx1NTIzMCcpO1xuICAgICAgICAgICAgICBuZXcgTm90aWNlKCdcdTI3NEMgXHU2NzJBXHU2MjdFXHU1MjMwIGxhcmstY2xpXHVGRjA4XHU5NzAwIFx1MjI2NSAxLjAuNTJcdUZGMDknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDAgXHU1NDBDXHU2QjY1XHU4ODRDXHU0RTNBIFx1MjUwMFx1MjUwMFxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1x1NTQwQ1x1NkI2NVx1ODg0Q1x1NEUzQScgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTlFRDhcdThCQTRcdTg0M0RcdTU3MzBcdTc2RUVcdTVGNTUnKVxuICAgICAgLnNldERlc2MoJ1x1NjI2OVx1NUM1NVx1NjcyQVx1NjMwN1x1NUI5QVx1NzZFRVx1NUY1NVx1NjVGNlx1RkYwQ1x1OThERVx1NEU2Nlx1NjU4N1x1Njg2M1x1ODQzRFx1NTczMFx1NTIzMFx1NkI2NFx1NzZFRVx1NUY1NVx1RkYwOFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdUZGMDknKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdERpcilcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0RGlyID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTgxRUFcdTUyQThcdTUyMDZcdTkxNERcdTdGMTZcdTc4MDEnKVxuICAgICAgLnNldERlc2MoJ1x1OThERVx1NEU2Nlx1NjU4N1x1Njg2M1x1ODQzRFx1NTczMFx1NTQwRVx1ODFFQVx1NTJBOFx1ODlFNlx1NTNEMSBhdXRvLXJlbmFtZSBcdTdGMTZcdTc4MDFcdTUyMDZcdTkxNEQnKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b1JlbmFtZSlcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdXRvUmVuYW1lID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTUyMjBcdTk2NjRcdTgxRUFcdTUyQThcdTc2N0JcdThCQjAnKVxuICAgICAgLnNldERlc2MoJ1x1NTIyMFx1OTY2NFx1NTQyQiBmZWlzaHVfaWQgXHU3Njg0XHU2NTg3XHU0RUY2XHU2NUY2XHVGRjBDXHU4MUVBXHU1MkE4XHU3NjdCXHU4QkIwXHU1MjMwXHU5OERFXHU0RTY2XHU1OTFBXHU3RUY0XHU4ODY4XHU2ODNDJylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9EZWxldGVSZWdpc3RyeSlcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdXRvRGVsZXRlUmVnaXN0cnkgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NEZERFx1NzU1OVx1ODhDNVx1OTk3MFx1NTZGRVx1NzI0NycpXG4gICAgICAuc2V0RGVzYygnXHU5OERFXHU0RTY2XHU2MzkyXHU3MjQ4XHU3MjY5XHU2NTk5XHVGRjA4MTM1XHU3RjE2XHU4RjkxXHU1NjY4XHU5OENFXHU2ODNDXHU3QjQ5XHU3RUFGXHU1NkZFXHU3MjQ3XHVGRjA5XHU2NjJGXHU1NDI2XHU4NDNEXHU1NzMwXHU1MjMwIE9CJylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmtlZXBEZWNvcmF0aXZlSW1hZ2VzKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmtlZXBEZWNvcmF0aXZlSW1hZ2VzID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTU2RkVcdTcyNDdcdTdGMTNcdTVCNThcdTZFMDVcdTc0MDZcdTU0NjhcdTY3MUYnKVxuICAgICAgLnNldERlc2MoJ2ZlaXNodTovL3Rva2VuIFx1OTg4NFx1ODlDOFx1NTZGRVx1NzI0N1x1NzY4NFx1NjcyQ1x1NTczMFx1N0YxM1x1NUI1OFx1NEZERFx1NzU1OVx1NjVGNlx1OTU3RicpXG4gICAgICAuYWRkRHJvcGRvd24oKGRyb3Bkb3duKSA9PlxuICAgICAgICBkcm9wZG93blxuICAgICAgICAgIC5hZGRPcHRpb24oJ2RhaWx5JywgJ1x1NkJDRlx1NTkyOScpXG4gICAgICAgICAgLmFkZE9wdGlvbignd2Vla2x5JywgJ1x1NkJDRlx1NTQ2OCcpXG4gICAgICAgICAgLmFkZE9wdGlvbignbW9udGhseScsICdcdTZCQ0ZcdTY3MDgnKVxuICAgICAgICAgIC5hZGRPcHRpb24oJ25ldmVyJywgJ1x1NkMzOFx1NEUwRCcpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmNhY2hlQ2xlYW51cClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jYWNoZUNsZWFudXAgPSB2YWx1ZSBhcyBGZWlzaHVTeW5jU2V0dGluZ3NbJ2NhY2hlQ2xlYW51cCddO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwIFx1OThERVx1NEU2Nlx1NzdFNVx1OEJDNlx1NUU5MyBcdTI1MDBcdTI1MDBcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdcdTk4REVcdTRFNjZcdTc3RTVcdThCQzZcdTVFOTMnIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU3N0U1XHU4QkM2XHU1RTkzIHNwYWNlX2lkJylcbiAgICAgIC5zZXREZXNjKCdcdTc2RUVcdTVGNTVcdTY2MjBcdTVDMDRcdTc1MjhcdTMwMDJcdTY1QjBcdTc3RTVcdThCQzZcdTVFOTNcdTlFRDhcdThCQTQgNzY1MTMxNDE1MDA2MDA2NzgwMycpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zcGFjZUlkKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnNwYWNlSWQgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKVxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgICBidG5cbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dCgnXHU1MjM3XHU2NUIwXHU2NjIwXHU1QzA0JylcbiAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCByZWZyZXNoTWFwcGluZyh0aGlzLmFwcCwgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc3BhY2VJZCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuICB9XG59XG5cbmltcG9ydCB0eXBlIHsgRmVpc2h1U3luY1NldHRpbmdzIH0gZnJvbSAnLi9zZXR0aW5ncy5qcyc7XG5cbi8qKiBcdTc1MUZcdTYyMTAgMzIgXHU1QjU3XHU4MjgyIGhleCBcdTRFRTRcdTcyNENcdTMwMDIgKi9cbmZ1bmN0aW9uIGdlbmVyYXRlVG9rZW4oKTogc3RyaW5nIHtcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheSgzMik7XG4gIChnbG9iYWxUaGlzLmNyeXB0byA/PyAocmVxdWlyZSgnbm9kZTpjcnlwdG8nKSBhcyB7IHdlYmNyeXB0bzogQ3J5cHRvIH0pKS53ZWJjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGJ5dGVzKTtcbiAgcmV0dXJuIEFycmF5LmZyb20oYnl0ZXMpLm1hcChiID0+IGIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xufVxuIiwgIi8qKlxuICogbGFyay1jbGkgXHU1QzAxXHU4OEM1XHU1QzQyXHUzMDAyXHU0RjlEXHU2MzZFIGByYy14L3NjcmlwdHMvcmNfZW52LnB5YCArIGAwM19cdTY4M0NcdTVGMEZcdTg5QzRcdTgzMDMubWRgIFx1MDBBN1x1NTM0MS9cdTUzNDFcdTRFMDBcdTMwMDJcbiAqXG4gKiAtIHJlc29sdmVDbGkoKVx1RkYxQVx1NTAxOVx1OTAwOVx1OERFRlx1NUY4NFx1NjNBMlx1NkQ0Qlx1RkYwQ1x1NzI0OFx1NjcyQ1x1NjgyMVx1OUE4QyBcdTIyNjUgMS4wLjUyXG4gKiAtIHJ1bigpXHVGRjFBXHU3RURGXHU0RTAwIHNwYXduU3luYyBcdTUzMDVcdTg4QzVcdUZGMENcdTkxQ0RcdThCRDVcdTMwMDFcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTMwMDFlbW9qaSBcdTZFMDVcdTZEMTdcdTMwMDF+XHU1M0NEXHU4RjZDXHU0RTQ5XHUzMDAxSlNPTiBcdTUzMDVcdTg4QzVcdTg5RTNcdTUzMDVcbiAqIC0gXHU2ODA3XHU5ODk4XHU0RkVFXHU1OTBEXHVGRjFBb3ZlcndyaXRlIFx1NTQwRVx1OEZGRFx1NTJBMCBzdHJfcmVwbGFjZSBcdTRGRUUgPHRpdGxlPlxuICpcbiAqIFx1NTkxQVx1OEJCRVx1NTkwN1x1OTAwMlx1OTE0RFx1NTE3M1x1OTUyRVx1NzBCOVx1RkYxQVxuICogLSBHVUkgXHU1NDJGXHU1MkE4XHU3Njg0IE9ic2lkaWFuIFx1NjJGRlx1NEUwRFx1NTIzMFx1N0VDOFx1N0FFRiBQQVRIXHVGRjA4bnZtL2hvbWVicmV3IFx1NEUwRFx1NTcyOFx1NTE4NVx1RkYwOVx1RkYwQ1x1NjU0NSBzcGF3biBcdTY1RjZcdTZDRThcdTUxNjVcdTU4OUVcdTVGM0EgUEFUSFxuICogLSBudm0gXHU3NkVFXHU1RjU1XHU2MzA5XHU2NTcwXHU1QjU3XHU1RThGXHU1M0Q2IGxhdGVzdFx1RkYwOFx1NUI1N1x1N0IyNlx1NEUzMiBzb3J0IFx1NEYxQVx1OEJBOSB2OSA+IHYxMFx1RkYwOVxuICovXG5pbXBvcnQgeyBleGVjRmlsZVN5bmMsIHR5cGUgRXhlY1N5bmNPcHRpb25zIH0gZnJvbSAnbm9kZTpjaGlsZF9wcm9jZXNzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ25vZGU6b3MnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycywgdW5lc2NhcGVGZWlzaHVUaWxkZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5cbmNvbnN0IE1JTl9WRVJTSU9OID0gWzEsIDAsIDUyXTtcblxuLyoqXG4gKiBcdTY3ODRcdTkwMjBcdTU4OUVcdTVGM0EgUEFUSFx1RkYxQVx1NTcyOFx1OEZEQlx1N0EwQlx1NzNCMFx1NjcwOSBQQVRIIFx1NTI0RFx1OEZGRFx1NTJBMCBudm0vbGF0ZXN0L2JpbiArIFx1NUUzOFx1ODlDMVx1NUI4OVx1ODhDNVx1NEY0RFx1MzAwMlxuICogXHU3NTI4XHU0RThFIEdVSSBcdTU0MkZcdTUyQThcdTc2ODQgT2JzaWRpYW5cdUZGMDhQQVRIIFx1N0YzQSBudm0vaG9tZWJyZXdcdUZGMENcdTVCRkNcdTgxRjQgIyEvdXNyL2Jpbi9lbnYgbm9kZSBcdTYyN0VcdTRFMERcdTUyMzAgbm9kZVx1RkYwOVx1MzAwMlxuICovXG5mdW5jdGlvbiBidWlsZEVuaGFuY2VkUGF0aCgpOiBzdHJpbmcge1xuICBjb25zdCBleHRyYTogc3RyaW5nW10gPSBbXTtcbiAgLy8gbnZtIGxhdGVzdCBub2RlIFx1NzY4NCBiaW5cbiAgY29uc3QgbnZtQmFzZSA9IHBhdGguam9pbihvcy5ob21lZGlyKCksICcubnZtL3ZlcnNpb25zL25vZGUnKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBkaXJzID0gZnMucmVhZGRpclN5bmMobnZtQmFzZSk7XG4gICAgLy8gXHU2NTcwXHU1QjU3XHU1RThGXHU1M0Q2XHU2NzAwXHU1OTI3XHU3MjQ4XHU2NzJDXHVGRjA4djkgdnMgdjEwIFx1NUI1N1x1N0IyNlx1NEUzMlx1NjM5Mlx1NUU4Rlx1NEYxQVx1OTUxOVx1RkYwOVxuICAgIGNvbnN0IGxhdGVzdCA9IGRpcnNcbiAgICAgIC5tYXAoZCA9PiAoeyBuYW1lOiBkLCB2ZXI6IHBhcnNlSW50KGQucmVwbGFjZSgvXnYvLCAnJyksIDEwKSB9KSlcbiAgICAgIC5maWx0ZXIoeCA9PiAhTnVtYmVyLmlzTmFOKHgudmVyKSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBhLnZlciAtIGIudmVyKVxuICAgICAgLnBvcCgpO1xuICAgIGlmIChsYXRlc3QpIGV4dHJhLnB1c2gocGF0aC5qb2luKG52bUJhc2UsIGxhdGVzdC5uYW1lLCAnYmluJykpO1xuICB9IGNhdGNoIHsgLyogbnZtIFx1NjcyQVx1ODhDNSAqLyB9XG4gIGV4dHJhLnB1c2gocGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJy5sb2NhbCcsICdiaW4nKSk7XG4gIGV4dHJhLnB1c2goJy9vcHQvaG9tZWJyZXcvYmluJyk7XG4gIGV4dHJhLnB1c2goJy91c3IvbG9jYWwvYmluJyk7XG4gIGNvbnN0IGJhc2UgPSBwcm9jZXNzLmVudi5QQVRIID8/ICcnO1xuICByZXR1cm4gWy4uLmV4dHJhLmZpbHRlcihwID0+ICFiYXNlLnNwbGl0KHBhdGguZGVsaW1pdGVyKS5pbmNsdWRlcyhwKSksIGJhc2VdLmpvaW4ocGF0aC5kZWxpbWl0ZXIpO1xufVxuXG4vKiogcnVuKCkgXHU1MTcxXHU3NTI4XHU3Njg0XHU1ODlFXHU1RjNBIFBBVEhcdUZGMDhcdTk5OTZcdTZCMjFcdTg5RTNcdTY3OTBcdTU0MEVcdTdGMTNcdTVCNThcdUZGMDlcdTMwMDIgKi9cbmxldCBlbmhhbmNlZFBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gZ2V0RW5oYW5jZWRQYXRoKCk6IHN0cmluZyB7XG4gIHJldHVybiBlbmhhbmNlZFBhdGggPz89IGJ1aWxkRW5oYW5jZWRQYXRoKCk7XG59XG5cbi8qKlxuICogXHU1NzI4XHU1ODlFXHU1RjNBIFBBVEggXHU0RTBCXHU2N0U1XHU2MjdFXHU1M0VGXHU2MjY3XHU4ODRDXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHVGRjA4XHU2NkZGXHU0RUUzIGB3aGljaGBcdUZGMENcdTkwN0ZcdTUxNEQgR1VJIFx1OEZEQlx1N0EwQiBQQVRIIFx1N0YzQVx1NTkzMVx1RkYwOVx1MzAwMlxuICogXHU3NTI4IGV4ZWNGaWxlU3luYyBcdTRFMERcdThENzAgc2hlbGxcdUZGMENcdTY2RjRcdTdBMzNcdTMwMDJcbiAqL1xuZnVuY3Rpb24gd2hpY2goY21kOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgLy8gXHU1MTQ4XHU4QkQ1XHU1RjUzXHU1MjREIFBBVEhcdUZGMDhcdTdFQzhcdTdBRUZcdTU3M0FcdTY2NkZcdUZGMDlcbiAgdHJ5IHtcbiAgICBjb25zdCBmb3VuZCA9IGV4ZWNGaWxlU3luYygnL3Vzci9iaW4vd2hpY2gnLCBbY21kXSwge1xuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICAgIHRpbWVvdXQ6IDMwMDAsXG4gICAgICBlbnY6IHsgLi4ucHJvY2Vzcy5lbnYgfSxcbiAgICB9KS50cmltKCk7XG4gICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmQ7XG4gIH0gY2F0Y2ggeyAvKiBmYWxsIHRocm91Z2ggKi8gfVxuICAvLyBcdTUxOERcdThCRDVcdTU4OUVcdTVGM0EgUEFUSFx1RkYwOEdVSSBcdTU3M0FcdTY2NkZcdUZGMDlcbiAgdHJ5IHtcbiAgICBjb25zdCBmb3VuZCA9IGV4ZWNGaWxlU3luYygnL3Vzci9iaW4vd2hpY2gnLCBbY21kXSwge1xuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICAgIHRpbWVvdXQ6IDMwMDAsXG4gICAgICBlbnY6IHsgLi4ucHJvY2Vzcy5lbnYsIFBBVEg6IGdldEVuaGFuY2VkUGF0aCgpIH0sXG4gICAgfSkudHJpbSgpO1xuICAgIHJldHVybiBmb3VuZCB8fCBudWxsO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKiogXHU1MDE5XHU5MDA5XHU4REVGXHU1Rjg0XHVGRjA4XHU3OUZCXHU2OTBEIHJjX2Vudi5weSByZXNvbHZlX2NsaVx1RkYwOVx1MzAwMiAqL1xuY29uc3QgQ0xJX0NBTkRJREFURVM6ICgoKSA9PiBzdHJpbmcgfCBudWxsKVtdID0gW1xuICAoKSA9PiBwcm9jZXNzLmVudi5MQVJLX0NMSV9CSU4gPz8gbnVsbCxcbiAgKCkgPT4gd2hpY2goJ2xhcmtzdWl0ZS1jbGknKSxcbiAgKCkgPT4gd2hpY2goJ2xhcmstY2xpJyksXG4gICgpID0+IHtcbiAgICBjb25zdCBudm1CYXNlID0gcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJy5udm0vdmVyc2lvbnMvbm9kZScpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkaXJzID0gZnMucmVhZGRpclN5bmMobnZtQmFzZSk7XG4gICAgICAvLyBcdTY1NzBcdTVCNTdcdTVFOEZcdTUzRDZcdTY3MDBcdTU5MjdcdTcyNDhcdTY3MkNcdUZGMDhcdTVCNTdcdTdCMjZcdTRFMzIgc29ydCBcdTRGMUFcdThCQTkgdjkgPiB2MTBcdUZGMDlcbiAgICAgIGNvbnN0IGxhdGVzdCA9IGRpcnNcbiAgICAgICAgLm1hcChkID0+ICh7IG5hbWU6IGQsIHZlcjogcGFyc2VJbnQoZC5yZXBsYWNlKC9edi8sICcnKSwgMTApIH0pKVxuICAgICAgICAuZmlsdGVyKHggPT4gIU51bWJlci5pc05hTih4LnZlcikpXG4gICAgICAgIC5zb3J0KChhLCBiKSA9PiBhLnZlciAtIGIudmVyKVxuICAgICAgICAucG9wKCk7XG4gICAgICByZXR1cm4gbGF0ZXN0ID8gcGF0aC5qb2luKG52bUJhc2UsIGxhdGVzdC5uYW1lLCAnYmluJywgJ2xhcmstY2xpJykgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9LFxuICAoKSA9PiBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnLmxvY2FsJywgJ2JpbicsICdsYXJrLWNsaScpLFxuICAoKSA9PiAnL29wdC9ob21lYnJldy9iaW4vbGFyay1jbGknLFxuICAoKSA9PiAnL3Vzci9sb2NhbC9iaW4vbGFyay1jbGknLFxuXTtcblxuLyoqXG4gKiBcdTYzQTJcdTZENEIgbGFyay1jbGkgXHU4REVGXHU1Rjg0XHUzMDAyXHU0RjE4XHU1MTQ4XHU3NTI4XHU4QkJFXHU3RjZFXHU4OTg2XHU3NkQ2XHVGRjBDXHU1NDI2XHU1MjE5XHU4RDcwXHU1MDE5XHU5MDA5XHU4REVGXHU1Rjg0XHUzMDAyXG4gKiBAcmV0dXJucyB7IHBhdGgsIHZlcnNpb24gfSBcdTYyMTYgbnVsbFx1RkYwOFx1NjcyQVx1NjI3RVx1NTIzMFx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUNsaShvdmVycmlkZVBhdGg/OiBzdHJpbmcpOiB7IHBhdGg6IHN0cmluZzsgdmVyc2lvbjogc3RyaW5nIH0gfCBudWxsIHtcbiAgY29uc3QgY2FuZGlkYXRlcyA9IG92ZXJyaWRlUGF0aFxuICAgID8gWygpID0+IG92ZXJyaWRlUGF0aF1cbiAgICA6IENMSV9DQU5ESURBVEVTO1xuXG4gIGZvciAoY29uc3QgZ2V0Q2xpIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICBjb25zdCBjbGkgPSBnZXRDbGkoKTtcbiAgICBpZiAoIWNsaSkgY29udGludWU7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFx1NzUyOCBleGVjRmlsZVN5bmMgXHU3NkY0XHU2M0E1XHU4REQxIGNsaVx1RkYwQ1x1NkNFOFx1NTE2NVx1NTg5RVx1NUYzQSBQQVRIXHVGRjA4XHU4OUUzXHU1MUIzIEdVSSBcdThGREJcdTdBMEIgZW52IG5vZGUgXHU2MjdFXHU0RTBEXHU1MjMwXHU3Njg0XHU5NUVFXHU5ODk4XHVGRjA5XG4gICAgICBjb25zdCB2ZXIgPSBleGVjRmlsZVN5bmMoY2xpLCBbJy0tdmVyc2lvbiddLCB7XG4gICAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgICAgIHRpbWVvdXQ6IDUwMDAsXG4gICAgICAgIGVudjogeyAuLi5wcm9jZXNzLmVudiwgUEFUSDogZ2V0RW5oYW5jZWRQYXRoKCkgfSxcbiAgICAgIH0pLnRyaW0oKTtcbiAgICAgIC8vIFx1ODlFM1x1Njc5MCBcImxhcmstY2xpIHZlcnNpb24gMS4wLjUyXCJcbiAgICAgIGNvbnN0IG1hdGNoID0gdmVyLm1hdGNoKC8oXFxkKylcXC4oXFxkKylcXC4oXFxkKykvKTtcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICBjb25zdCBtYWpvciA9IHBhcnNlSW50KG1hdGNoWzFdLCAxMCk7XG4gICAgICAgIGNvbnN0IG1pbm9yID0gcGFyc2VJbnQobWF0Y2hbMl0sIDEwKTtcbiAgICAgICAgY29uc3QgcGF0Y2ggPSBwYXJzZUludChtYXRjaFszXSwgMTApO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgbWFqb3IgPiBNSU5fVkVSU0lPTlswXSB8fFxuICAgICAgICAgIChtYWpvciA9PT0gTUlOX1ZFUlNJT05bMF0gJiYgbWlub3IgPiBNSU5fVkVSU0lPTlsxXSkgfHxcbiAgICAgICAgICAobWFqb3IgPT09IE1JTl9WRVJTSU9OWzBdICYmIG1pbm9yID09PSBNSU5fVkVSU0lPTlsxXSAmJiBwYXRjaCA+PSBNSU5fVkVSU0lPTlsyXSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIHsgcGF0aDogY2xpLCB2ZXJzaW9uOiB2ZXIgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gXHU3MjQ4XHU2NzJDXHU4OUUzXHU2NzkwXHU1OTMxXHU4RDI1XHU0RjQ2XHU2NzA5XHU4RjkzXHU1MUZBXHVGRjBDXHU0RUNEXHU1M0VGXHU3NTI4XG4gICAgICBpZiAodmVyKSByZXR1cm4geyBwYXRoOiBjbGksIHZlcnNpb246IHZlciB9O1xuICAgIH0gY2F0Y2gge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKiogcnVuKCkgXHU2MjY3XHU4ODRDXHU5MDA5XHU5ODc5XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFJ1bk9wdGlvbnMge1xuICAvKiogXHU1REU1XHU0RjVDXHU3NkVFXHU1RjU1XHVGRjA4LS1jb250ZW50IEBmaWxlIFx1NzUyOFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1NjVGNlx1OTcwMFx1ODk4MVx1RkYwOVx1MzAwMiAqL1xuICBjd2Q/OiBzdHJpbmc7XG4gIC8qKiBcdTY3MDBcdTU5MjdcdTkxQ0RcdThCRDVcdTZCMjFcdTY1NzBcdUZGMDhcdTlFRDhcdThCQTQgM1x1RkYwOVx1MzAwMiAqL1xuICByZXRyaWVzPzogbnVtYmVyO1xuICAvKiogXHU4RDg1XHU2NUY2IG1zXHVGRjA4XHU5RUQ4XHU4QkE0IDMwc1x1RkYwOVx1MzAwMiAqL1xuICB0aW1lb3V0PzogbnVtYmVyO1xuICAvKiogXHU2NzFGXHU2NzFCIEpTT04gXHU4RjkzXHU1MUZBXHU2NUY2IHRydWVcdUZGMENcdTgxRUFcdTUyQThcdThERjNcdThGQzcgXCJGb3VuZCBYIG5vZGUocylcIiBcdTUyNERcdTdGMDBcdTMwMDIgKi9cbiAganNvbj86IGJvb2xlYW47XG59XG5cbi8qKlxuICogXHU2MjY3XHU4ODRDIGxhcmstY2xpIFx1NTQ3RFx1NEVFNFx1MzAwMlx1N0VERlx1NEUwMFx1NTkwNFx1NzQwNlx1NURGMlx1NzdFNVx1NTc1MVx1MzAwMlxuICpcbiAqIEBwYXJhbSBhcmdzIGxhcmstY2xpIFx1NUI1MFx1NTQ3RFx1NEVFNFx1NTNDMlx1NjU3MFx1NjU3MFx1N0VDNFx1RkYwQ1x1NTk4MiBbJ2RvY3MnLCAnK2ZldGNoJywgJy0tZG9jJywgdG9rZW4sICctLWRvYy1mb3JtYXQnLCAnbWFya2Rvd24nXVxuICogQHBhcmFtIG9wdGlvbnMgXHU5MDA5XHU5ODc5XG4gKiBAcmV0dXJucyBzdGRvdXRcdUZGMDhcdTVERjJcdTZFMDVcdTZEMTdcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJ1bihhcmdzOiBzdHJpbmdbXSwgb3B0aW9uczogUnVuT3B0aW9ucyA9IHt9KTogc3RyaW5nIHtcbiAgY29uc3QgeyBjd2QsIHJldHJpZXMgPSAzLCB0aW1lb3V0ID0gMzAwMDAsIGpzb24gPSBmYWxzZSB9ID0gb3B0aW9ucztcbiAgY29uc3QgY2xpUGF0aCA9IHByb2Nlc3MuZW52Ll9fTEFSS19DTElfUEFUSF9fIHx8ICdsYXJrLWNsaSc7XG5cbiAgbGV0IGxhc3RFcnJvcjogRXJyb3IgfCBudWxsID0gbnVsbDtcblxuICBmb3IgKGxldCBhdHRlbXB0ID0gMTsgYXR0ZW1wdCA8PSByZXRyaWVzOyBhdHRlbXB0KyspIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZnVsbEFyZ3MgPSBbLi4uYXJnc107XG4gICAgICBjb25zdCBleGVjT3B0czogRXhlY1N5bmNPcHRpb25zID0ge1xuICAgICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgICAgICB0aW1lb3V0LFxuICAgICAgICBtYXhCdWZmZXI6IDEwICogMTAyNCAqIDEwMjQsIC8vIDEwTUJcdUZGMDhcdTU5MjdcdTY1ODdcdTY4NjNcdUZGMDlcbiAgICAgICAgLy8gXHU2Q0U4XHU1MTY1XHU1ODlFXHU1RjNBIFBBVEhcdUZGMUFHVUkgXHU1NDJGXHU1MkE4XHU3Njg0IE9ic2lkaWFuIFx1NjJGRlx1NEUwRFx1NTIzMCBudm0vaG9tZWJyZXdcdUZGMENcdTVCRkNcdTgxRjRcbiAgICAgICAgLy8gYCMhL3Vzci9iaW4vZW52IG5vZGVgIFx1NjI3RVx1NEUwRFx1NTIzMCBub2RlXHVGRjA4Y2xpIFx1NjYyRiBub2RlIFx1ODExQVx1NjcyQ1x1RkYwOVxuICAgICAgICBlbnY6IHsgLi4ucHJvY2Vzcy5lbnYsIFBBVEg6IGdldEVuaGFuY2VkUGF0aCgpIH0sXG4gICAgICB9O1xuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgLS1jb250ZW50IEBmaWxlXHVGRjFBXHU3NTI4XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA4XHU1NzUxXHVGRjFBXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHU4OEFCXHU2MkQyXHVGRjA5XG4gICAgICBjb25zdCBjb250ZW50SWR4ID0gZnVsbEFyZ3MuaW5kZXhPZignLS1jb250ZW50Jyk7XG4gICAgICBpZiAoY29udGVudElkeCAhPT0gLTEgJiYgY29udGVudElkeCArIDEgPCBmdWxsQXJncy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgY29udGVudFZhbCA9IGZ1bGxBcmdzW2NvbnRlbnRJZHggKyAxXTtcbiAgICAgICAgaWYgKGNvbnRlbnRWYWwuc3RhcnRzV2l0aCgnQCcpKSB7XG4gICAgICAgICAgY29uc3QgZmlsZVBhdGggPSBjb250ZW50VmFsLnNsaWNlKDEpO1xuICAgICAgICAgIGNvbnN0IGRpciA9IGN3ZCB8fCBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpO1xuICAgICAgICAgIGNvbnN0IGJhc2VOYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlUGF0aCk7XG4gICAgICAgICAgZnVsbEFyZ3NbY29udGVudElkeCArIDFdID0gYEAuLyR7YmFzZU5hbWV9YDtcbiAgICAgICAgICBleGVjT3B0cy5jd2QgPSBkaXI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoY3dkKSB7XG4gICAgICAgIGV4ZWNPcHRzLmN3ZCA9IGN3ZDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1MTk5XHU1MTY1XHU1MjREIGVtb2ppIFx1NkUwNVx1NkQxN1x1RkYxQVx1NjI2Qlx1NjNDRiBmdWxsQXJncyBcdTRFMkQgLS1jb250ZW50IEBmaWxlIFx1NzY4NFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVxuICAgICAgaWYgKGNvbnRlbnRJZHggIT09IC0xICYmIGNvbnRlbnRJZHggKyAxIDwgZnVsbEFyZ3MubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZnVsbEFyZ3NbY29udGVudElkeCArIDFdLnJlcGxhY2UoL15AXFwuXFwvLywgJycpO1xuICAgICAgICBjb25zdCBmdWxsRmlsZVBhdGggPSBwYXRoLmpvaW4oZXhlY09wdHMuY3dkIHx8IHByb2Nlc3MuY3dkKCksIGZpbGVQYXRoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsZXQgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmdWxsRmlsZVBhdGgsICd1dGY4Jyk7XG4gICAgICAgICAgY29udGVudCA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKGNvbnRlbnQpO1xuICAgICAgICAgIC8vIFx1NTNDRFx1OEY2Q1x1NEU0OSBcXH4gXHUyMTkyIH5cdUZGMDhcdTk4REVcdTRFNjZcdThCRkJcdTU2REVcdTY3NjVcdTY1RjZcdThGNkNcdTRFNDlcdTRFODZcdTZDRTJcdTZENkFcdTUzRjdcdUZGMDlcbiAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC9cXFxcfi9nLCAnficpO1xuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZnVsbEZpbGVQYXRoLCBjb250ZW50LCAndXRmOCcpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAvLyBcdTY1ODdcdTRFRjZcdThCRkJcdTRFMERcdTUyMzBcdTVDMzFcdThERjNcdThGQzdcdTZFMDVcdTZEMTdcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBcdTc1MjggZXhlY0ZpbGVTeW5jIFx1NzZGNFx1NjNBNVx1NjI2N1x1ODg0Q1x1RkYwQ1x1NEUwRFx1OEQ3MCBzaGVsbFx1RkYwOFx1NTNDMlx1NjU3MFx1NUI4OVx1NTE2OCArIFx1NTg5RVx1NUYzQSBQQVRIIFx1NzUxRlx1NjU0OFx1RkYwOVxuICAgICAgbGV0IHN0ZG91dCA9IGV4ZWNGaWxlU3luYyhjbGlQYXRoLCBmdWxsQXJncywgZXhlY09wdHMpO1xuXG4gICAgICAvLyBcdTU2REVcdThCRkJcdTU0MEVcdTUzQ0RcdThGNkNcdTRFNDlcdUZGMUFcdTk4REVcdTRFNjYgbWQgXHU2MjhBIH4gXHU4RjZDXHU0RTQ5XHU2MjEwIFxcflxuICAgICAgc3Rkb3V0ID0gdW5lc2NhcGVGZWlzaHVUaWxkZShzdGRvdXQpO1xuXG4gICAgICAvLyBcdTg5RTNcdTUzMDUgbGFyay1jbGkgXHU2ODA3XHU1MUM2IEpTT04gXHU1MzA1XHU4OEM1XHVGRjFBe29rLCBpZGVudGl0eSwgZGF0YTp7ZG9jdW1lbnQ6e2NvbnRlbnR9fX0gXHUyMTkyIFx1N0VBRlx1NkI2M1x1NjU4N1xuICAgICAgLy8gZG9jcyArZmV0Y2ggXHU5RUQ4XHU4QkE0IC0tZm9ybWF0IGpzb25cdUZGMENcdTZCNjNcdTY1ODdcdTVENENcdTU3MjggZGF0YS5kb2N1bWVudC5jb250ZW50IFx1OTFDQ1xuICAgICAgc3Rkb3V0ID0gdW53cmFwTGFya0VudmVsb3BlKHN0ZG91dCk7XG5cbiAgICAgIC8vIEpTT04gXHU2QTIxXHU1RjBGXHVGRjFBXHU4REYzXHU4RkM3IFwiRm91bmQgWCBub2RlKHMpXCIgXHU1MjREXHU3RjAwXHVGRjA4XHU1NzUxXHVGRjFBbm9kZS1saXN0IFx1OEY5M1x1NTFGQVx1NTQyQlx1NjVFNVx1NUZEN1x1ODg0Q1x1RkYwOVxuICAgICAgaWYgKGpzb24pIHtcbiAgICAgICAgY29uc3QgYnJhY2VJZHggPSBzdGRvdXQuaW5kZXhPZigneycpO1xuICAgICAgICBpZiAoYnJhY2VJZHggIT09IC0xKSB7XG4gICAgICAgICAgc3Rkb3V0ID0gc3Rkb3V0LnNsaWNlKGJyYWNlSWR4KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3Rkb3V0LnRyaW0oKTtcbiAgICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcbiAgICAgIGxhc3RFcnJvciA9IGVyciBhcyBFcnJvcjtcbiAgICAgIGNvbnN0IGVyck1zZyA9IChlcnIgYXMgRXJyb3IpPy5tZXNzYWdlID8/IFN0cmluZyhlcnIpO1xuXG4gICAgICAvLyA0MjkgXHU5NjUwXHU2RDQxXHU2MjE2XHU3RjUxXHU3RURDXHU5NTE5XHU4QkVGXHVGRjFBXHU5MUNEXHU4QkQ1XHVGRjA4XHU2MzA3XHU2NTcwXHU5MDAwXHU5MDdGXHVGRjA5XG4gICAgICBpZiAoXG4gICAgICAgIGVyck1zZy5pbmNsdWRlcygnNDI5JykgfHxcbiAgICAgICAgZXJyTXNnLmluY2x1ZGVzKCdFVElNRURPVVQnKSB8fFxuICAgICAgICBlcnJNc2cuaW5jbHVkZXMoJ0VDT05OUkVTRVQnKSB8fFxuICAgICAgICBlcnJNc2cuaW5jbHVkZXMoJ3NvY2tldCBoYW5nIHVwJylcbiAgICAgICkge1xuICAgICAgICBjb25zdCBkZWxheSA9IE1hdGgubWluKDEwMDAgKiBNYXRoLnBvdygyLCBhdHRlbXB0IC0gMSksIDEwMDAwKTtcbiAgICAgICAgY29uc29sZS53YXJuKGBbc3luYy9sYXJrXSBhdHRlbXB0ICR7YXR0ZW1wdH0gZmFpbGVkLCByZXRyeWluZyBpbiAke2RlbGF5fW1zOiAke2Vyck1zZ31gKTtcbiAgICAgICAgLy8gXHU0RTBEXHU0RjlEXHU4RDU2IHNoZWxsIFx1NzY4NCBzbGVlcFx1RkYwOEF0b21pY3Mud2FpdCBcdTU0MENcdTZCNjVcdTk2M0JcdTU4NUVcdUZGMDlcbiAgICAgICAgY29uc3QgbXMgPSBkZWxheTtcbiAgICAgICAgY29uc3QgYnVmID0gbmV3IEludDMyQXJyYXkobmV3IFNoYXJlZEFycmF5QnVmZmVyKDQpKTtcbiAgICAgICAgQXRvbWljcy53YWl0KGJ1ZiwgMCwgMCwgbXMpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU5NTE5XHU4QkVGXHU3NkY0XHU2M0E1XHU2MjlCXG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB0aHJvdyBsYXN0RXJyb3IgPz8gbmV3IEVycm9yKCdsYXJrLWNsaSBydW4gZmFpbGVkIHdpdGggdW5rbm93biBlcnJvcicpO1xufVxuXG4vKipcbiAqIFx1ODlFM1x1NTMwNSBsYXJrLWNsaSBcdTY4MDdcdTUxQzYgSlNPTiBcdTUzMDVcdTg4QzVcdTMwMDJcbiAqXG4gKiBsYXJrLWNsaSBcdTc2ODQgZG9jcyArZmV0Y2ggXHU3QjQ5XHU1NDdEXHU0RUU0XHU5RUQ4XHU4QkE0IGAtLWZvcm1hdCBqc29uYFx1RkYwQ1x1OEZENFx1NTZERVx1RkYxQVxuICogICB7IFwib2tcIjogdHJ1ZSwgXCJpZGVudGl0eVwiOiBcIi4uLlwiLCBcImRhdGFcIjogeyBcImRvY3VtZW50XCI6IHsgXCJjb250ZW50XCI6IFwiPFx1NzcxRlx1NUI5RVx1NkI2M1x1NjU4Nz5cIiB9IH0sIC4uLiB9XG4gKiBcdTU0MENcdTZCNjVcdTk0RkVcdThERUZcdTk3MDBcdTg5ODFcdTc2ODRcdTY2MkZcdTdFQUZcdTZCNjNcdTY1ODdcdUZGMDhtYXJrZG93bi94bWxcdUZGMDlcdUZGMENcdTRFMERcdTY2MkZcdTY1NzRcdTRFMkEgZW52ZWxvcGVcdTMwMDJcbiAqXG4gKiBcdTUyMjRcdTVCOUFcdUZGMUFzdGRvdXQgXHU5OTk2XHU0RTJBXHU5NzVFXHU3QTdBXHU3NjdEXHU1QjU3XHU3QjI2XHU2NjJGIGB7YFx1RkYwQ1x1NEUxNFx1ODlFM1x1Njc5MFx1NTQwRVx1NTQyQiBvayBcdTVCNTdcdTZCQjUgKyBkYXRhLmRvY3VtZW50LmNvbnRlbnRcdUZGMENcbiAqIFx1NjI0RFx1OEJBNFx1NEUzQVx1NjYyRiBlbnZlbG9wZSBcdTVFNzZcdTg5RTNcdTUzMDVcdUZGMUJcdTU0MjZcdTUyMTlcdTUzOUZcdTY4MzdcdThGRDRcdTU2REVcdUZGMDhcdTRGRERcdTc1NTkgd2lraSArbm9kZS1saXN0IFx1N0I0OVx1N0VBRiBKU09OIFx1NTRDRFx1NUU5NFx1N0VEOSBqc29uIFx1NkEyMVx1NUYwRlx1NTkwNFx1NzQwNlx1RkYwOVx1MzAwMlxuICovXG5mdW5jdGlvbiB1bndyYXBMYXJrRW52ZWxvcGUoc3Rkb3V0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCB0cmltbWVkID0gc3Rkb3V0LnRyaW1TdGFydCgpO1xuICBpZiAoIXRyaW1tZWQuc3RhcnRzV2l0aCgneycpKSByZXR1cm4gc3Rkb3V0O1xuICBsZXQgcGFyc2VkOiB1bmtub3duO1xuICB0cnkge1xuICAgIHBhcnNlZCA9IEpTT04ucGFyc2UodHJpbW1lZCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBzdGRvdXQ7IC8vIFx1NEUwRFx1NjYyRlx1NTQwOFx1NkNENSBKU09OXHVGRjBDXHU1MzlGXHU2ODM3XHU4RkQ0XHU1NkRFXG4gIH1cbiAgY29uc3QgZW52ID0gcGFyc2VkIGFzIHsgb2s/OiB1bmtub3duOyBkYXRhPzogeyBkb2N1bWVudD86IHsgY29udGVudD86IHVua25vd24gfSB9IH07XG4gIC8vIFx1NEVDNVx1NUY1M1x1NjYyRlx1NTQyQiBkb2N1bWVudC5jb250ZW50IFx1NzY4NFx1NjgwN1x1NTFDNiBlbnZlbG9wZSBcdTYyNERcdTg5RTNcdTUzMDVcbiAgaWYgKGVudiAmJiB0eXBlb2YgZW52Lm9rID09PSAnYm9vbGVhbicgJiYgZW52LmRhdGE/LmRvY3VtZW50Py5jb250ZW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBjb250ZW50ID0gZW52LmRhdGEuZG9jdW1lbnQuY29udGVudDtcbiAgICByZXR1cm4gdHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnID8gY29udGVudCA6IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQpO1xuICB9XG4gIHJldHVybiBzdGRvdXQ7XG59XG5cbi8qKlxuICogXHU1NkRFXHU1MTk5XHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzXHVGRjA4bWFya2Rvd24gb3ZlcndyaXRlICsgXHU2ODA3XHU5ODk4XHU0RkVFXHU1OTBEXHVGRjA5XHUzMDAyXG4gKiBcdTRGOURcdTYzNkVcdTVERjJcdTc3RTVcdTU3NTFcdUZGMUFvdmVyd3JpdGUgXHU1NDBFXHU2ODA3XHU5ODk4XHU1M0Q4IFVudGl0bGVkIFx1MjE5MiBcdThGRkRcdTUyQTAgc3RyX3JlcGxhY2UgXHU0RkVFIDx0aXRsZT5cdTMwMDJcbiAqXG4gKiBAcGFyYW0gdG9rZW4gZG9jeCBvYmpfdG9rZW4gXHU2MjE2IG5vZGVfdG9rZW5cbiAqIEBwYXJhbSBjb250ZW50IFx1NkI2M1x1NjU4NyBtYXJrZG93blx1RkYwOFx1NEUwRFx1NTQyQiBmcm9udG1hdHRlclx1RkYwOVxuICogQHBhcmFtIHRpdGxlIFx1NjU4N1x1Njg2M1x1NjgwN1x1OTg5OFx1RkYwOFx1NUUyNiBlbW9qaVx1RkYwOVxuICogQHBhcmFtIGN3ZCBcdTVERTVcdTRGNUNcdTc2RUVcdTVGNTVcdUZGMDhcdTc1MjhcdTRFOEUgQGZpbGUgXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvdmVyd3JpdGVEb2ModG9rZW46IHN0cmluZywgY29udGVudDogc3RyaW5nLCB0aXRsZTogc3RyaW5nLCBjd2Q/OiBzdHJpbmcpOiB2b2lkIHtcbiAgLy8gXHU1MTk5XHU0RTM0XHU2NUY2XHU2NTg3XHU0RUY2XHVGRjA4b3ZlcndyaXRlIFx1OTcwMFx1ODk4MVx1NzUyOCBAZmlsZVx1RkYwOVxuICBjb25zdCB0bXBEaXIgPSBjd2QgfHwgcHJvY2Vzcy5jd2QoKTtcbiAgY29uc3QgdG1wRmlsZSA9IHBhdGguam9pbih0bXBEaXIsICcuLy5mZWlzaHUtc3luYy10ZW1wLm1kJyk7XG5cbiAgLy8gXHU2RTA1XHU2RDE3XHVGRjFBc3RyaXAgZW1vamkgVlMgKyBcdTUzQ0RcdThGNkNcdTRFNDkgXFx+XG4gIGNvbnN0IGNsZWFuZWQgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhjb250ZW50KTtcblxuICBmcy53cml0ZUZpbGVTeW5jKHRtcEZpbGUsIGNsZWFuZWQsICd1dGY4Jyk7XG5cbiAgdHJ5IHtcbiAgICAvLyBvdmVyd3JpdGVcbiAgICBydW4oWydkb2NzJywgJyt1cGRhdGUnLCAnLS1kb2MnLCB0b2tlbiwgJy0tY29tbWFuZCcsICdvdmVyd3JpdGUnLCAnLS1kb2MtZm9ybWF0JywgJ21hcmtkb3duJywgJy0tY29udGVudCcsIGBALi8uZmVpc2h1LXN5bmMtdGVtcC5tZGBdLCB7IGN3ZDogdG1wRGlyIH0pO1xuXG4gICAgLy8gXHU2ODA3XHU5ODk4XHU0RkVFXHU1OTBEXHVGRjFBc3RyX3JlcGxhY2UgXHU0RkVFIDx0aXRsZT5cbiAgICBjb25zdCBjbGVhblRpdGxlID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnModGl0bGUpO1xuICAgIHJ1bihbXG4gICAgICAnZG9jcycsICcrdXBkYXRlJywgJy0tZG9jJywgdG9rZW4sXG4gICAgICAnLS1jb21tYW5kJywgJ3N0cl9yZXBsYWNlJyxcbiAgICAgICctLWRvYy1mb3JtYXQnLCAnanNvbicsXG4gICAgICAnLS1jb250ZW50JywgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICByZXF1ZXN0OiBbe1xuICAgICAgICAgIGJsb2NrX3R5cGU6IDEsIC8vIHBhZ2VcbiAgICAgICAgICBwYWdlOiB7XG4gICAgICAgICAgICBlbGVtZW50czogW3tcbiAgICAgICAgICAgICAgdGV4dF9ydW46IHsgY29udGVudDogY2xlYW5UaXRsZSwgdGV4dF9lbGVtZW50X3N0eWxlOiB7IGJvbGQ6IHRydWUgfSB9XG4gICAgICAgICAgICB9XVxuICAgICAgICAgIH1cbiAgICAgICAgfV0sXG4gICAgICAgIGluZGV4OiAwLFxuICAgICAgfSksXG4gICAgXSwgeyBjd2Q6IHRtcERpciwgdGltZW91dDogMTUwMDAgfSk7XG4gIH0gZmluYWxseSB7XG4gICAgLy8gXHU2RTA1XHU3NDA2XHU0RTM0XHU2NUY2XHU2NTg3XHU0RUY2XG4gICAgdHJ5IHsgZnMudW5saW5rU3luYyh0bXBGaWxlKTsgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG4gIH1cbn1cblxuLyoqXG4gKiBcdTU2REVcdTUxOTlcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjNcdUZGMDhYTUwgXHU2ODNDXHU1RjBGXHVGRjBDXHU1NDJCIGNhbGxvdXQgXHU3Q0JFXHU3ODZFXHU2M0E3XHU1MjM2XHVGRjA5XHUzMDAyXG4gKiBcdTU0MENcdTY4MzdcdTk3MDBcdTg5ODFcdTY4MDdcdTk4OThcdTRGRUVcdTU5MERcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG92ZXJ3cml0ZURvY1htbCh0b2tlbjogc3RyaW5nLCB4bWxDb250ZW50OiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsIGN3ZD86IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCB0bXBEaXIgPSBjd2QgfHwgcHJvY2Vzcy5jd2QoKTtcbiAgY29uc3QgdG1wRmlsZSA9IHBhdGguam9pbih0bXBEaXIsICcuLy5mZWlzaHUtc3luYy10ZW1wLnhtbCcpO1xuXG4gIGNvbnN0IGNsZWFuZWQgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyh4bWxDb250ZW50KTtcbiAgZnMud3JpdGVGaWxlU3luYyh0bXBGaWxlLCBjbGVhbmVkLCAndXRmOCcpO1xuXG4gIHRyeSB7XG4gICAgcnVuKFsnZG9jcycsICcrdXBkYXRlJywgJy0tZG9jJywgdG9rZW4sICctLWNvbW1hbmQnLCAnb3ZlcndyaXRlJywgJy0tZG9jLWZvcm1hdCcsICd4bWwnLCAnLS1jb250ZW50JywgYEAuLy5mZWlzaHUtc3luYy10ZW1wLnhtbGBdLCB7IGN3ZDogdG1wRGlyIH0pO1xuXG4gICAgLy8gXHU2ODA3XHU5ODk4XHU0RkVFXHU1OTBEXG4gICAgY29uc3QgY2xlYW5UaXRsZSA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKHRpdGxlKTtcbiAgICBydW4oW1xuICAgICAgJ2RvY3MnLCAnK3VwZGF0ZScsICctLWRvYycsIHRva2VuLFxuICAgICAgJy0tY29tbWFuZCcsICdzdHJfcmVwbGFjZScsXG4gICAgICAnLS1kb2MtZm9ybWF0JywgJ2pzb24nLFxuICAgICAgJy0tY29udGVudCcsIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgcmVxdWVzdDogW3tcbiAgICAgICAgICBibG9ja190eXBlOiAxLFxuICAgICAgICAgIHBhZ2U6IHtcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbe1xuICAgICAgICAgICAgICB0ZXh0X3J1bjogeyBjb250ZW50OiBjbGVhblRpdGxlLCB0ZXh0X2VsZW1lbnRfc3R5bGU6IHsgYm9sZDogdHJ1ZSB9IH1cbiAgICAgICAgICAgIH1dXG4gICAgICAgICAgfVxuICAgICAgICB9XSxcbiAgICAgICAgaW5kZXg6IDAsXG4gICAgICB9KSxcbiAgICBdLCB7IGN3ZDogdG1wRGlyLCB0aW1lb3V0OiAxNTAwMCB9KTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkgeyBmcy51bmxpbmtTeW5jKHRtcEZpbGUpOyB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cbiAgfVxufVxuXG4vKipcbiAqIFx1NEVDRVx1OThERVx1NEU2NiB3aWtpIFVSTCBcdTg5RTNcdTY3OTAgbm9kZV90b2tlblx1MzAwMlxuICogVVJMIFx1NUY2Mlx1NTk4Mlx1RkYxQWh0dHBzOi8veHh4LmZlaXNodS5jbi93aWtpL05PREVfVE9LRU5cdTMwMDEvZG9jeC9PQkpfVE9LRU4gXHU2MjE2IC9kb2MvT0JKX1RPS0VOXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlTm9kZVRva2VuRnJvbVVybCh1cmw6IHN0cmluZyk6IHsgbm9kZV90b2tlbj86IHN0cmluZzsgb2JqX3Rva2VuPzogc3RyaW5nIH0ge1xuICAvLyB3aWtpIG5vZGVcbiAgY29uc3Qgd2lraU1hdGNoID0gdXJsLm1hdGNoKC9cXC93aWtpXFwvKFtBLVphLXowLTldKykvKTtcbiAgaWYgKHdpa2lNYXRjaCkgcmV0dXJuIHsgbm9kZV90b2tlbjogd2lraU1hdGNoWzFdIH07XG5cbiAgLy8gZG9jeCBvYmpcbiAgY29uc3QgZG9jeE1hdGNoID0gdXJsLm1hdGNoKC9cXC9kb2N4XFwvKFtBLVphLXowLTldKykvKTtcbiAgaWYgKGRvY3hNYXRjaCkgcmV0dXJuIHsgb2JqX3Rva2VuOiBkb2N4TWF0Y2hbMV0gfTtcblxuICByZXR1cm4ge307XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2IHdpa2kgXHU4MjgyXHU3MEI5XHU3Njg0IGRvY3ggb2JqX3Rva2VuXHUzMDAyXG4gKiBgd2lraSArbm9kZS1nZXQgLS1ub2RlLXRva2VuIDx1cmw+IC0tc3BhY2UtaWQgPGlkPmBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFdpa2lOb2RlSW5mbyhub2RlVG9rZW46IHN0cmluZywgc3BhY2VJZDogc3RyaW5nKTogeyBvYmpfdG9rZW46IHN0cmluZzsgdGl0bGU6IHN0cmluZyB9IHwgbnVsbCB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3V0cHV0ID0gcnVuKFtcbiAgICAgICd3aWtpJywgJytub2RlLWdldCcsXG4gICAgICAnLS1ub2RlLXRva2VuJywgbm9kZVRva2VuLFxuICAgICAgJy0tc3BhY2UtaWQnLCBzcGFjZUlkLFxuICAgIF0sIHsganNvbjogdHJ1ZSB9KTtcbiAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShvdXRwdXQpO1xuICAgIC8vIFx1ODI4Mlx1NzBCOVx1NTNFRlx1ODBGRFx1NjcwOSBub2RlIFx1NjIxNlx1NzZGNFx1NjNBNVx1NjYyRiBvYmpfdG9rZW5cbiAgICBjb25zdCBvYmpUb2tlbiA9IGRhdGE/Lm5vZGU/Lm9ial90b2tlbiA/PyBkYXRhPy5vYmpfdG9rZW4gPz8gZGF0YT8ub2JqX3Rva2VuO1xuICAgIGNvbnN0IHRpdGxlID0gZGF0YT8ubm9kZT8udGl0bGUgPz8gZGF0YT8udGl0bGUgPz8gJyc7XG4gICAgaWYgKG9ialRva2VuKSByZXR1cm4geyBvYmpfdG9rZW46IG9ialRva2VuLCB0aXRsZSB9O1xuICAgIHJldHVybiBudWxsO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2xhcmtdIHdpa2kgK25vZGUtZ2V0IGZhaWxlZDonLCBlcnIpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU5OERFXHU0RTY2XHU3N0U1XHU4QkM2XHU1RTkzXHU1QjUwXHU4MjgyXHU3MEI5XHU1MjE3XHU4ODY4XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaXN0V2lraUNoaWxkcmVuKHNwYWNlSWQ6IHN0cmluZywgcGFyZW50VG9rZW46IHN0cmluZyk6IEFycmF5PHsgbm9kZV90b2tlbjogc3RyaW5nOyB0aXRsZTogc3RyaW5nOyBvYmpfdG9rZW46IHN0cmluZyB9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3V0cHV0ID0gcnVuKFtcbiAgICAgICd3aWtpJywgJytub2RlLWxpc3QnLFxuICAgICAgJy0tc3BhY2UtaWQnLCBzcGFjZUlkLFxuICAgICAgJy0tcGFyZW50LW5vZGUtdG9rZW4nLCBwYXJlbnRUb2tlbixcbiAgICBdLCB7IGpzb246IHRydWUgfSk7XG4gICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2Uob3V0cHV0KTtcbiAgICBjb25zdCBpdGVtcyA9IGRhdGE/Lml0ZW1zID8/IGRhdGE/Lm5vZGVzID8/IFtdO1xuICAgIHJldHVybiBpdGVtcy5tYXAoKG46IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiAoe1xuICAgICAgbm9kZV90b2tlbjogbi5ub2RlX3Rva2VuID8/ICcnLFxuICAgICAgdGl0bGU6IG4udGl0bGUgPz8gJycsXG4gICAgICBvYmpfdG9rZW46IG4ub2JqX3Rva2VuID8/ICcnLFxuICAgIH0pKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS53YXJuKCdbc3luYy9sYXJrXSB3aWtpICtub2RlLWxpc3QgZmFpbGVkOicsIGVycik7XG4gICAgcmV0dXJuIFtdO1xuICB9XG59XG4iLCAiLyoqXG4gKiBcdTU0MENcdTZCNjVcdTdFRDFcdTVCOUEgKyBZQU1MIGZyb250bWF0dGVyIFx1NjU3MFx1NjM2RVx1NkEyMVx1NTc4Qlx1MzAwMlxuICpcbiAqIFx1NEY5RFx1NjM2RVx1RkYxQWBcdThCQkVcdThCQTFcdTY1QjlcdTY4NDgvMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGBcdUZGMDhcdTY3NDNcdTVBMDEgdjFcdUZGMDkrIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgIFx1MDBBNzUuMVx1MzAwMlxuICogXHU5NEMxXHU1RjhCXHVGRjFBXHU1NDBDXHU2QjY1XHU3RUQxXHU1QjlBXHU3RUM0XHVGRjA4ZmVpc2h1XypcdUZGMDlcdTc1MzFcdTYzRDJcdTRFRjZcdTgxRUFcdTUyQThcdTUxOTlcdUZGMENcdTc1MjhcdTYyMzdcdTRFMERcdTUzRUZcdTYyNEJcdTY1MzlcdTMwMDJcbiAqL1xuXG4vKiogXHU1NDBDXHU2QjY1XHU3RUQxXHU1QjlBXHU3RUM0XHVGRjA4XHU2ODM4XHU1RkMzXHVGRjBDXHU0RTBEXHU1M0VGXHU2MjRCXHU2NTM5XHVGRjA5XHUzMDAyXHU1QkY5XHU1RTk0IFlBTUwgXHU1NDBDXHU2QjY1XHU3RUQxXHU1QjlBXHU2QkI1XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFN5bmNCaW5kaW5nIHtcbiAgLyoqIFx1OThERVx1NEU2NiB3aWtpIG5vZGVfdG9rZW5cdUZGMDhcdTU1MkZcdTRFMDBcdTdFRDFcdTVCOUFcdUZGMDlcdTMwMDIgKi9cbiAgZmVpc2h1X2lkOiBzdHJpbmc7XG4gIC8qKiBcdTk4REVcdTRFNjYgZG9jeCBvYmpfdG9rZW5cdUZGMDhcdTU2REVcdTUxOTlcdTc1MjhcdUZGMDlcdTMwMDIgKi9cbiAgZmVpc2h1X2RvY19pZDogc3RyaW5nO1xuICAvKiogXHU5OERFXHU0RTY2XHU1MzlGXHU1OUNCXHU2ODA3XHU5ODk4XHVGRjA4XHU1NDJCIGVtb2ppXHVGRjBDXHU1NkRFXHU1MTk5XHU2NUY2XHU3NTI4XHVGRjA5XHUzMDAyICovXG4gIGZlaXNodV90aXRsZTogc3RyaW5nO1xuICAvKiogXHU0RTBBXHU2QjIxXHU1NDBDXHU2QjY1XHU1MTg1XHU1QkI5IGhhc2hcdUZGMDhcdThGN0JcdTY4MzhcdTlBOENcdTc1MjhcdUZGMENzaGEyNTYgaGV4XHVGRjA5XHUzMDAyICovXG4gIHN5bmNfaGFzaD86IHN0cmluZztcbiAgLyoqIFx1NEUwQVx1NkIyMVx1NTQwQ1x1NkI2NVx1NjVGNlx1OTVGNFx1RkYwOElTTzg2MDFcdUZGMENcdTVFMjZcdTY1RjZcdTUzM0FcdUZGMDlcdTMwMDIgKi9cbiAgc3luY190aW1lPzogc3RyaW5nO1xufVxuXG4vKiogXHU2ODA3XHU3QjdFXHU1QzAxXHU5NUVEXHU2NzlBXHU0RTNFXHUzMDAyXHU0RjlEXHU2MzZFIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYCBcdTAwQTcyLjJcdTMwMDIgKi9cbmV4cG9ydCB0eXBlIFRhZyA9ICdTJyB8ICdYJyB8ICdMJyB8ICdaJyB8ICdRJyB8ICdKJztcblxuZXhwb3J0IGNvbnN0IFRBR19OQU1FUzogUmVjb3JkPFRhZywgc3RyaW5nPiA9IHtcbiAgUzogJ1x1RDgzRFx1RENFNVx1NjUzNlx1OTZDNicsXG4gIFg6ICdcdUQ4M0NcdURGQUZcdTk4NzlcdTc2RUUnLFxuICBMOiAnXHVEODNDXHVERjMzXHU5ODg2XHU1N0RGJyxcbiAgWjogJ1x1RDgzRFx1RENEQVx1OEQ0NFx1NkU5MCcsXG4gIFE6ICdcdUQ4M0RcdURDQTFcdTcwNzVcdTYxMUYnLFxuICBKOiAnXHVEODNEXHVERUUwXHVGRTBGXHU2MjgwXHU4MEZEJyxcbn07XG5cbi8qKiBcdTc3RTVcdThCQzZcdTVFOTNcdTUxNDNcdTY1NzBcdTYzNkVcdUZGMDhPQiBcdTdFRjRcdTYyQTRcdUZGMENcdTU2REVcdTUxOTlcdTk4REVcdTRFNjZcdTYyMTAgY2FsbG91dFx1RkYwOVx1MzAwMlx1NEY5RFx1NjM2RSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGBcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgS25vd2xlZGdlTWV0YSB7XG4gIC8qKiBcdTY4MDdcdTdCN0VcdUZGMENcdTVDMDFcdTk1RURcdTY3OUFcdTRFM0VcdTMwMDJcdTdGNkVcdTRGRTFcdTVFQTYgPDAuNiBcdTIxOTIgU1x1MzAwMiAqL1xuICBcdTY4MDdcdTdCN0U/OiBUYWc7XG4gIC8qKiBcdTdGMTZcdTc4MDFcdUZGMENhdXRvLXJlbmFtZSBcdTUyMDZcdTkxNERcdUZGMENcdTY4M0NcdTVGMEYgWVlfTU1ERF9cdTY4MDdcdTdCN0VfXHU1RThGXHU1M0Y3W19cdTVCNTBcdTVFOEZcdTUzRjddXHUzMDAyICovXG4gIFx1N0YxNlx1NzgwMT86IHN0cmluZztcbiAgLyoqIFx1OEY5M1x1NTE2NVx1NUI4Q1x1NjU3NFx1OERFRlx1NUY4NFx1RkYwOFx1NjcwMFx1NkRGMVx1NkNFOFx1NTE4Q1x1OERFRlx1NUY4NFx1RkYwOVx1MzAwMiAqL1xuICBcdThGOTNcdTUxNjU/OiBzdHJpbmc7XG4gIC8qKiBcdTY1RTVcdTY3MUZcdUZGMENJU08gXHU2ODNDXHU1RjBGIFlZWVktTU0tRERcdTMwMDIgKi9cbiAgXHU2NUU1XHU2NzFGPzogc3RyaW5nO1xuICAvKiogXHU2NUU1XHU2NzFGXHU3RDIyXHU1RjE1XHVGRjBDXHU1M0VGXHU5MDA5XHU5ODc5XHU2NTcwXHU3RUM0XHUzMDAyICovXG4gIFx1NjVFNVx1NjcxRlx1N0QyMlx1NUYxNT86IHN0cmluZ1tdO1xuICAvKiogXHU1MTczXHU5NTJFXHU4QkNEXHVGRjBDXHU5ODdGXHU1M0Y3XHU1MjA2XHU5Njk0XHUzMDAyICovXG4gIFx1NTE3M1x1OTUyRVx1OEJDRD86IHN0cmluZztcbiAgLyoqIFx1Njk4Mlx1OEZGMFx1RkYwQ1x1N0VEOVx1NTQwRVx1N0VFRCBBSSBcdTVGRUJcdTkwMUZcdThCQzZcdTUyMkJcdTY1ODdcdTY4NjNcdTUxODVcdTVCQjlcdTc1MjhcdTMwMDIgKi9cbiAgXHU2OTgyXHU4RkYwPzogc3RyaW5nO1xuICAvKiogXHU4QkM0XHU1MjA2IDEtNVx1RkYxQlx1NjcyQVx1OEJDNFx1NTIwNlx1NjVGNlx1NEZERFx1NzU1OVx1N0E3QVx1NTAzQ1x1NEVFNVx1NjYzRVx1NUYwRlx1NTM2MFx1NEY0RFx1MzAwMiAqL1xuICBcdThCQzRcdTUyMDY/OiBudW1iZXIgfCAnJztcbiAgLyoqIFx1OEJDNFx1NTIwNlx1NjYzRVx1NzkzQVx1NEUzMlx1RkYwQ1x1NTk4MiBcIlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RkY1Q1x1NUI5RVx1OERGNVwiXHUzMDAyICovXG4gIFx1OEJDNFx1NTIwNl9cdTY2M0VcdTc5M0E/OiBzdHJpbmc7XG4gIC8qKiBcdTdEMjJcdTVGMTVfXHU3N0U1XHU4QkM2XHU1RTkzXHVGRjA4XHU2QjYzXHU4RDIyL1x1NTA0Rlx1OEQyMi8uLi5cdUZGMDlcdTMwMDIgKi9cbiAgXHU3RDIyXHU1RjE1X1x1NzdFNVx1OEJDNlx1NUU5Mz86IHN0cmluZztcbiAgLyoqIFx1N0QyMlx1NUYxNV9cdTk4OUNcdTgyNzJcdTMwMDIgKi9cbiAgXHU3RDIyXHU1RjE1X1x1OTg5Q1x1ODI3Mj86IHN0cmluZztcbiAgLyoqIFx1N0QyMlx1NUYxNV9cdTY0Q0RcdTRGNUMmXHU1M0NEXHU5OTg4XHVGRjBDXHU0RTI0XHU3RUM0XHU5MDA5XHU0RTAwXHVGRjA4XHU2MEYzXHU2Q0Q1L1x1ODlDNFx1NTIxMi9cdTYyNjdcdTg4NEMvXHU1M0Q3XHU2MzJCL1x1NTE0Qlx1NjcwRCBcdTAwRDcgXHU1MjFEXHU3QTNGL1x1NUJBMVx1NjgzOC9cdTRGRUVcdTY1MzkvXHU1QjhDXHU2MjEwL1x1NTkwRFx1NzZEOFx1RkYwOVx1MzAwMiAqL1xuICAnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnPzogc3RyaW5nW107XG4gIC8qKiBcdTdEMjJcdTVGMTVfXHU1NzU3XHVGRjBDXHU1OTFBXHU5MDA5XHVGRjA4XHU1MTc3XHU4QzYxL1x1NjJCRFx1OEM2MSBcdTAwRDcgXHU3QjgwXHU1MzU1L1x1NTZGMFx1OTZCRVx1RkYwOVx1MzAwMiAqL1xuICBcdTdEMjJcdTVGMTVfXHU1NzU3Pzogc3RyaW5nW107XG4gIC8qKiBcdTdEMjJcdTVGMTVfXHU5OENFXHU5NjY5XHVGRjBDXHU5NkY2XHU2MjE2XHU1OTFBXHU0RTJBXHUzMDAyICovXG4gIFx1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2Njk/OiBzdHJpbmdbXTtcbn1cblxuLyoqIE9CIFx1NjU4N1x1NEVGNlx1NUI4Q1x1NjU3NCBmcm9udG1hdHRlciA9IFx1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QSArIFx1NzdFNVx1OEJDNlx1NUU5M1x1NTE0M1x1NjU3MFx1NjM2RVx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBZQU1MRnJvbnRtYXR0ZXIgZXh0ZW5kcyBTeW5jQmluZGluZywgS25vd2xlZGdlTWV0YSB7fVxuXG4vKiogT0JcdTIxOTJcdTk4REVcdTRFNjYgY2FsbG91dCBcdTVCNTdcdTZCQjVcdTY2MjBcdTVDMDRcdTk4NzlcdTMwMDJcdTRGOURcdTYzNkUgYDAyX1lBTUxcdTVCNTdcdTZCQjVcdTg5QzRcdTgzMDMubWRgIFx1MDBBN1x1NEU5NFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBDYWxsb3V0RmllbGRNYXAge1xuICAvKiogWUFNTCBcdTVCNTdcdTZCQjVcdTU0MERcdTMwMDIgKi9cbiAgZmllbGQ6IGtleW9mIEtub3dsZWRnZU1ldGE7XG4gIC8qKiBjYWxsb3V0IFx1OTFDQ1x1NjYzRVx1NzkzQVx1NzY4NFx1NEUyRFx1NjU4N1x1NjgwN1x1N0I3RVx1MzAwMiAqL1xuICBsYWJlbDogc3RyaW5nO1xuICAvKiogZW1vamlcdUZGMDhcdTRFMERcdTVFMjYgdmFyaWF0aW9uIHNlbGVjdG9yXHVGRjA5XHUzMDAyICovXG4gIGVtb2ppOiBzdHJpbmc7XG59XG5cbi8qKlxuICogWUFNTCBcdTVCNTdcdTZCQjUgXHUyMTkyIFx1OThERVx1NEU2NiBjYWxsb3V0IFx1ODg0Q1x1NjYyMFx1NUMwNFx1MzAwMlx1NEY5RFx1NjM2RSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU0RTk0XHUzMDAyXG4gKiBcdTZDRThcdTYxMEYgZW1vamkgXHU1MTY4XHU5MEU4XHU0RTBEXHU1RTI2IFUrRkUwRlx1RkYwOFx1OThERVx1NEU2Nlx1NEUwRFx1OEJBNCBWU1x1RkYwQ1x1ODlDMSAwMyBcdTY1ODdcdTY4NjMgXHUwMEE3My4zXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBjb25zdCBDQUxMT1VUX0ZJRUxEX01BUDogQ2FsbG91dEZpZWxkTWFwW10gPSBbXG4gIHsgZmllbGQ6ICdcdTY4MDdcdTdCN0UnLCBsYWJlbDogJ1x1NjgwN1x1N0I3RScsIGVtb2ppOiAnXHVEODNDXHVERkY3JyB9LFxuICB7IGZpZWxkOiAnXHU3RjE2XHU3ODAxJywgbGFiZWw6ICdcdTdGMTZcdTc4MDEnLCBlbW9qaTogJ1x1RDgzRFx1REQyMicgfSxcbiAgeyBmaWVsZDogJ1x1OEY5M1x1NTE2NScsIGxhYmVsOiAnXHU4RjkzXHU1MTY1JywgZW1vamk6ICdcdUQ4M0RcdURDRTUnIH0sXG4gIHsgZmllbGQ6ICdcdTY1RTVcdTY3MUYnLCBsYWJlbDogJ1x1NjVFNVx1NjcxRicsIGVtb2ppOiAnXHVEODNEXHVEQ0M1JyB9LFxuICB7IGZpZWxkOiAnXHU1MTczXHU5NTJFXHU4QkNEJywgbGFiZWw6ICdcdTUxNzNcdTk1MkVcdThCQ0QnLCBlbW9qaTogJ1x1RDgzRFx1REQxMScgfSxcbiAgeyBmaWVsZDogJ1x1OEJDNFx1NTIwNl9cdTY2M0VcdTc5M0EnLCBsYWJlbDogJ1x1OEJDNFx1NTIwNicsIGVtb2ppOiAnXHUyQjUwJyB9LFxuICB7IGZpZWxkOiAnXHU3RDIyXHU1RjE1X1x1NzdFNVx1OEJDNlx1NUU5MycsIGxhYmVsOiAnXHU3RDIyXHU1RjE1JywgZW1vamk6ICdcdUQ4M0RcdURDQjAnIH0sXG5dO1xuXG4vKiogT0JcdTIxOTJcdTk4REVcdTRFNjYgY2FsbG91dCBcdTY1NzRcdTRGNTNcdTkxNERcdTgyNzJcdUZGMDhcdTU0MDhcdTVFNzZcdTRGRTFcdTYwNkZcdTU3NTdcdTc1MjhcdUZGMDlcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBET0NfSU5GT19DQUxMT1VUID0ge1xuICBlbW9qaTogJ1x1RDgzRFx1RENDQicsXG4gICdiYWNrZ3JvdW5kLWNvbG9yJzogJ2xpZ2h0LWJsdWUnLFxuICAnYm9yZGVyLWNvbG9yJzogJ2JsdWUnLFxufSBhcyBjb25zdDtcblxuLyoqIFx1OThERVx1NEU2NiBjYWxsb3V0IFx1ODBDQ1x1NjY2Rlx1ODI3MiBcdTIxOTIgT0IgY2FsbG91dCBcdTdDN0JcdTU3OEJcdTMwMDJcdTRGOURcdTYzNkUgYDAzX1x1NjgzQ1x1NUYwRlx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3My4xXHUzMDAyICovXG5leHBvcnQgY29uc3QgRkVJU0hVX0JHX1RPX09CX0NBTExPVVQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICdsaWdodC15ZWxsb3cnOiAndGlwJyxcbiAgJ21lZGl1bS1yZWQnOiAnd2FybmluZycsXG4gICdsaWdodC1ncmVlbic6ICdzdWNjZXNzJyxcbiAgJ2xpZ2h0LWJsdWUnOiAnaW5mbycsXG4gICdsaWdodC1wdXJwbGUnOiAnbm90ZScsXG4gICdsaWdodC1ncmF5JzogJ3F1b3RlJyxcbiAgJ2xpZ2h0LW9yYW5nZSc6ICdmYXEnLFxufTtcblxuLyoqIE9CIGNhbGxvdXQgXHU3QzdCXHU1NzhCIFx1MjE5MiBcdTk4REVcdTRFNjYgY2FsbG91dCBcdTkxNERcdTgyNzJcdTMwMDJcdTAwQTczLjEgXHU1M0NEXHU1NDExXHUzMDAyICovXG5leHBvcnQgY29uc3QgT0JfQ0FMTE9VVF9UT19GRUlTSFU6IFJlY29yZDxzdHJpbmcsIHsgZW1vamk6IHN0cmluZzsgYmc6IHN0cmluZzsgYm9yZGVyOiBzdHJpbmcgfT4gPSB7XG4gIHRpcDogeyBlbW9qaTogJ1x1RDgzRFx1RENBMScsIGJnOiAnbGlnaHQteWVsbG93JywgYm9yZGVyOiAneWVsbG93JyB9LFxuICB3YXJuaW5nOiB7IGVtb2ppOiAnXHUyNkEwXHVGRTBGJywgYmc6ICdtZWRpdW0tcmVkJywgYm9yZGVyOiAncmVkJyB9LFxuICBzdWNjZXNzOiB7IGVtb2ppOiAnXHUyNzA1JywgYmc6ICdsaWdodC1ncmVlbicsIGJvcmRlcjogJ2dyZWVuJyB9LFxuICBpbmZvOiB7IGVtb2ppOiAnXHUyMTM5XHVGRTBGJywgYmc6ICdsaWdodC1ibHVlJywgYm9yZGVyOiAnYmx1ZScgfSxcbiAgbm90ZTogeyBlbW9qaTogJ1x1RDgzRFx1RENERCcsIGJnOiAnbGlnaHQtcHVycGxlJywgYm9yZGVyOiAncHVycGxlJyB9LFxuICBxdW90ZTogeyBlbW9qaTogJ1x1RDgzRFx1RENBQycsIGJnOiAnbGlnaHQtZ3JheScsIGJvcmRlcjogJ2dyYXknIH0sXG4gIGZhcTogeyBlbW9qaTogJ1x1Mjc1MycsIGJnOiAnbGlnaHQtb3JhbmdlJywgYm9yZGVyOiAnb3JhbmdlJyB9LFxuICBhYnN0cmFjdDogeyBlbW9qaTogJ1x1RDgzRFx1RENDQicsIGJnOiAnbGlnaHQtYmx1ZScsIGJvcmRlcjogJ2JsdWUnIH0sXG59O1xuIiwgImltcG9ydCB0eXBlIHsgS25vd2xlZGdlTWV0YSB9IGZyb20gJy4vdHlwZXMuanMnO1xuXG4vKipcbiAqIGxvY2FsaG9zdCBIVFRQIFx1NTM0Rlx1OEJBRVx1NTk1MVx1N0VBNlx1RkYwOE9CIFx1NjNEMlx1NEVGNiBcdTIxOTQgXHU2RDRGXHU4OUM4XHU1NjY4XHU2MjY5XHU1QzU1XHVGRjA5XHUzMDAyXG4gKlxuICogXHU0RjlEXHU2MzZFXHVGRjFBYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3NC4yICsgXHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExXHVGRjA4XHU1ODZCXHU4ODY1XHU2NTg3XHU2ODYzXHU3RjNBXHU1M0UzXHVGRjA5XHUzMDAyXG4gKiBcdTkyNzRcdTY3NDNcdUZGMUFcdTZCQ0ZcdTRFMkFcdThCRjdcdTZDNDJcdTVFMjYgaGVhZGVyIGBYLVN5bmMtVG9rZW46IDxcdTU0MkZcdTUyQThcdTRFRTRcdTcyNEM+YFx1MzAwMlxuICogQ09SU1x1RkYxQU9CIHNlcnZlciBcdTVGQzVcdTk4N0JcdTY1M0VcdTkwMUEgT1BUSU9OUyBcdTk4ODRcdTY4QzBcdUZGMDhcdTYyNjlcdTVDNTVcdTRFQ0VcdTk4REVcdTRFNjZcdTk4NzVcdTk3NjJcdTUzRDFcdThENzcgZmV0Y2ggXHU0RjFBXHU4OEFCXHU2MkU2XHVGRjA5XHUzMDAyXG4gKi9cblxuLyoqIFx1OUVEOFx1OEJBNFx1N0FFRlx1NTNFM1x1MzAwMlx1NTNFRlx1NTcyOCBPQiBcdTYzRDJcdTRFRjZcdThCQkVcdTdGNkVcdTk4NzVcdTY1MzlcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BPUlQgPSA0NTY3O1xuXG4vKiogXHU5Mjc0XHU2NzQzIGhlYWRlciBcdTU0MERcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBUT0tFTl9IRUFERVIgPSAnWC1TeW5jLVRva2VuJztcblxuLyoqIFx1OThERVx1NEU2Nlx1NjU4N1x1Njg2MyBVUkwgXHU4OUUzXHU2NzkwXHU3RUQzXHU2NzlDXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIEZlaXNodURvY1JlZiB7XG4gIC8qKiB3aWtpIG5vZGVfdG9rZW5cdUZGMDhcdTRGMThcdTUxNDhcdTc1MjhcdUZGMENcdTU1MkZcdTRFMDBcdTdFRDFcdTVCOUFcdUZGMDlcdTMwMDIgKi9cbiAgbm9kZV90b2tlbj86IHN0cmluZztcbiAgLyoqIGRvY3ggb2JqX3Rva2VuXHVGRjA4XHU1NkRFXHU1MTk5XHU3NTI4XHVGRjA5XHUzMDAyICovXG4gIG9ial90b2tlbj86IHN0cmluZztcbiAgLyoqIHNwYWNlX2lkXHVGRjA4XHU5MEU4XHU1MjA2XHU2NENEXHU0RjVDXHU5NzAwXHU4OTgxXHVGRjBDXHU1M0VGXHU5MDA5XHVGRjA5XHUzMDAyICovXG4gIHNwYWNlX2lkPzogc3RyaW5nO1xufVxuXG4vKiogR0VUIC9zdGF0dXMgXHU1NENEXHU1RTk0XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFN0YXR1c1Jlc3BvbnNlIHtcbiAgb2s6IHRydWU7XG4gIC8qKiBcdTYzRDJcdTRFRjZcdTcyNDhcdTY3MkNcdTMwMDIgKi9cbiAgdmVyc2lvbjogc3RyaW5nO1xuICAvKiogdmF1bHQgXHU1NDBEXHUzMDAyICovXG4gIHZhdWx0OiBzdHJpbmc7XG4gIC8qKiBsYXJrLWNsaSBcdTY2MkZcdTU0MjZcdTVDMzFcdTdFRUFcdTMwMDIgKi9cbiAgbGFya1JlYWR5OiBib29sZWFuO1xuICAvKiogbGFyay1jbGkgXHU3MjQ4XHU2NzJDXHVGRjA4XHU2M0EyXHU2RDRCXHU0RTBEXHU1MjMwXHU2NUY2XHU0RTNBIG51bGxcdUZGMDlcdTMwMDIgKi9cbiAgbGFya1ZlcnNpb246IHN0cmluZyB8IG51bGw7XG59XG5cbi8qKiBcdTc2RUVcdTVGNTVcdTY4MTFcdTgyODJcdTcwQjlcdUZGMDhcdTdFRDlcdTYyNjlcdTVDNTVcdTc2RUVcdTVGNTVcdTRFMEJcdTYyQzlcdTc1MjhcdUZGMDlcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHJlZU5vZGUge1xuICAvKiogXHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1NzY4NFx1OERFRlx1NUY4NFx1RkYwQ1x1NTk4MiBcIjBcdUZFMEZcdTIwRTNcdThGOTNcdTUxNjUvXHVEODNEXHVEQ0ExXHU3ODhFXHU3MjQ3XHU4RjkzXHU1MTY1XHVGRjA4XHU5NUVBXHU1RkY1XHVGRjA5XCJcdTMwMDIgKi9cbiAgcGF0aDogc3RyaW5nO1xuICAvKiogXHU2NjNFXHU3OTNBXHU1NDBEXHVGRjA4XHU2NzAwXHU1NDBFXHU0RTAwXHU2QkI1XHVGRjA5XHUzMDAyICovXG4gIGxhYmVsOiBzdHJpbmc7XG4gIC8qKiBcdTZERjFcdTVFQTZcdUZGMDhcdTY4Mzk9MFx1RkYwOVx1MzAwMiAqL1xuICBkZXB0aDogbnVtYmVyO1xufVxuXG4vKiogR0VUIC90cmVlIFx1NTRDRFx1NUU5NFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBUcmVlUmVzcG9uc2Uge1xuICBvazogdHJ1ZTtcbiAgZGlyczogVHJlZU5vZGVbXTtcbn1cblxuLyoqIFBPU1QgL2ZldGNoIFx1OEJGN1x1NkM0Mlx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBGZXRjaFJlcXVlc3Qge1xuICAvKiogXHU1RkM1XHU1ODZCXHVGRjFBd2lraSBub2RlX3Rva2VuXHUzMDAyICovXG4gIG5vZGVfdG9rZW46IHN0cmluZztcbiAgLyoqIFx1NTNFRlx1OTAwOVx1RkYxQWRvY3ggb2JqX3Rva2VuXHVGRjA4XHU2NzJBXHU3RUQ5XHU1MjE5XHU2M0QyXHU0RUY2XHU3NTI4IHdpa2kgK25vZGUtZ2V0IFx1ODlFM1x1Njc5MFx1RkYwOVx1MzAwMiAqL1xuICBvYmpfdG9rZW4/OiBzdHJpbmc7XG4gIC8qKiBcdTUzRUZcdTkwMDlcdUZGMUFzcGFjZV9pZFx1MzAwMiAqL1xuICBzcGFjZV9pZD86IHN0cmluZztcbiAgLyoqIFx1ODQzRFx1NTczMFx1NzZFRVx1NUY1NVx1RkYwOFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdUZGMDlcdUZGMENcdTY3MkFcdTdFRDlcdTc1MjhcdThCQkVcdTdGNkVcdTlFRDhcdThCQTRcdTUwM0NcdTMwMDIgKi9cbiAgZGlyPzogc3RyaW5nO1xuICAvKiogXHU4OTg2XHU3NkQ2XHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU0RTBEXHU1NDJCXHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA5XHVGRjBDXHU2NzJBXHU3RUQ5XHU3NTI4XHU5OERFXHU0RTY2XHU2ODA3XHU5ODk4XHU2RTA1XHU2RDE3XHU3RUQzXHU2NzlDXHUzMDAyICovXG4gIGZpbGVuYW1lPzogc3RyaW5nO1xuICAvKiogXHU2RDRGXHU4OUM4XHU1NjY4XHU1NDBDXHU2QjY1XHU1MjREXHU3ODZFXHU4QkE0XHU1NDBFXHU3Njg0IFlBTUwgXHU1MTQzXHU2NTcwXHU2MzZFXHU4OTg2XHU3NkQ2XHVGRjFCXHU0RUM1XHU5NjUwXHU3N0U1XHU4QkM2XHU1RTkzXHU1MTQzXHU2NTcwXHU2MzZFXHU1QjU3XHU2QkI1XHUzMDAyICovXG4gIG1ldGE/OiBQYXJ0aWFsPEtub3dsZWRnZU1ldGE+O1xuICAvKiogT0IgXHU1MTg1XHU5MEU4XHU0RjdGXHU3NTI4XHVGRjFBQ2xpcHBlciBcdTUzNjBcdTRGNERcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdUZGMENcdTU0N0RcdTRFMkRcdTY1RjZcdTUzOUZcdTRGNERcdTg5ODZcdTc2RDZcdTMwMDIgKi9cbiAgcmVwbGFjZV9wYXRoPzogc3RyaW5nO1xufVxuXG4vKiogUE9TVCAvZmV0Y2ggXHU1NENEXHU1RTk0XHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIEZldGNoUmVzcG9uc2Uge1xuICBvazogdHJ1ZTtcbiAgLyoqIFx1ODQzRFx1NTczMFx1NUI4Q1x1NjU3NFx1OERFRlx1NUY4NFx1RkYwOFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdUZGMDlcdTMwMDIgKi9cbiAgcGF0aDogc3RyaW5nO1xuICAvKiogXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU1NDJCXHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA5XHUzMDAyICovXG4gIGZpbGVuYW1lOiBzdHJpbmc7XG4gIC8qKiBcdTY3MkNcdTZCMjFcdTY2MkZcdTY1QjBcdTVFRkFcdThGRDhcdTY2MkZcdTY2RjRcdTY1QjBcdTMwMDIgKi9cbiAgYWN0aW9uOiAnY3JlYXRlZCcgfCAndXBkYXRlZCc7XG4gIC8qKiBcdTUyMDZcdTkxNERcdTUyMzBcdTc2ODRcdTdGMTZcdTc4MDFcdUZGMDhhdXRvLXJlbmFtZSBcdTg5RTZcdTUzRDFcdTU0MEVcdUZGMDlcdTMwMDIgKi9cbiAgXHU3RjE2XHU3ODAxPzogc3RyaW5nO1xuICAvKiogXHU5OERFXHU0RTY2XHU1MzlGXHU1OUNCXHU2ODA3XHU5ODk4XHUzMDAyICovXG4gIGZlaXNodV90aXRsZTogc3RyaW5nO1xufVxuXG4vKiogUE9TVCAvY2xpcCBcdThCRjdcdTZDNDJcdUZGMUFcdTRFRkJcdTYxMEZcdTdGNTFcdTk4NzUvXHU1MjEyXHU4QkNEXHU1MjZBXHU1QjU4XHU1MjMwIE9ic2lkaWFuXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIENsaXBSZXF1ZXN0IHtcbiAgLyoqIFx1N0Y1MVx1OTg3NVx1NjgwN1x1OTg5OFx1MzAwMiAqL1xuICB0aXRsZT86IHN0cmluZztcbiAgLyoqIFx1Njc2NVx1NkU5MCBVUkxcdTMwMDIgKi9cbiAgdXJsPzogc3RyaW5nO1xuICAvKiogXHU2NzY1XHU2RTkwXHU3QzdCXHU1NzhCXHUzMDAyICovXG4gIHNvdXJjZUtpbmQ/OiAnZmVpc2h1LWJhc2UnIHwgJ2FydGljbGUnIHwgJ3NlbGVjdGlvbicgfCAnZ2VuZXJpYy1wYWdlJztcbiAgLyoqIFx1OTAwOVx1NEUyRFx1NjU4N1x1NjcyQ1x1NjIxNlx1NkI2M1x1NjU4N1x1NjQ1OFx1ODk4MVx1MzAwMiAqL1xuICB0ZXh0Pzogc3RyaW5nO1xuICAvKiogQUkgXHU2MjE2XHU4OUM0XHU1MjE5XHU4RjZDXHU2MzYyXHU1NDBFXHU3Njg0IE9ic2lkaWFuIE1hcmtkb3duIFx1NkI2M1x1NjU4N1x1MzAwMiAqL1xuICBib2R5TWFya2Rvd24/OiBzdHJpbmc7XG4gIC8qKiBcdTUzOUZcdTU5Q0JcdTUzRUZcdTg5QzFcdTY1ODdcdTY3MkNcdTMwMDIgKi9cbiAgcmF3VGV4dD86IHN0cmluZztcbiAgLyoqIFx1OTg3NVx1OTc2Mlx1NjNDRlx1OEZGMFx1MzAwMiAqL1xuICBkZXNjcmlwdGlvbj86IHN0cmluZztcbiAgLyoqIFx1ODQzRFx1NTczMFx1NzZFRVx1NUY1NVx1RkYwOFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdUZGMDlcdTMwMDJcdTY3MkFcdTdFRDlcdTc1MjggT0IgXHU2M0QyXHU0RUY2XHU5RUQ4XHU4QkE0XHU3NkVFXHU1RjU1XHUzMDAyICovXG4gIGRpcj86IHN0cmluZztcbiAgLyoqIFx1NTJGRVx1OTAwOVx1MjAxQ1x1ODg2NVx1NTE0NVx1NTIzMFx1NURGMlx1NjcwOVx1NjU4N1x1Njg2M1x1MjAxRFx1NjVGNlx1RkYwQ1x1OEZGRFx1NTJBMFx1NTIzMFx1OEZEOVx1NEUyQVx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdTc2ODQgTWFya2Rvd24gXHU4REVGXHU1Rjg0XHUzMDAyICovXG4gIGFwcGVuZFBhdGg/OiBzdHJpbmc7XG4gIC8qKiBcdTVERjJcdTYzMDlcdTYzRDJcdTRFRjZcdTk4ODRcdThCQkVcdTVGNTJcdTRFMDBcdTUzMTZcdTc2ODQgWUFNTCBcdTUxNDNcdTY1NzBcdTYzNkVcdTMwMDIgKi9cbiAgbWV0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG4vKiogUE9TVCAvY2xpcCBcdTU0Q0RcdTVFOTRcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2xpcFJlc3BvbnNlIHtcbiAgb2s6IHRydWU7XG4gIC8qKiBcdTg0M0RcdTU3MzBcdTVCOENcdTY1NzRcdThERUZcdTVGODRcdUZGMDhcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHVGRjA5XHUzMDAyICovXG4gIHBhdGg6IHN0cmluZztcbiAgLyoqIFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NTQyQlx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOVx1MzAwMiAqL1xuICBmaWxlbmFtZTogc3RyaW5nO1xuICAvKiogXHU2NzJDXHU2QjIxXHU2NjJGXHU2NUIwXHU1RUZBXHU4RkQ4XHU2NjJGXHU2NkY0XHU2NUIwXHUzMDAyICovXG4gIGFjdGlvbjogJ2NyZWF0ZWQnIHwgJ3VwZGF0ZWQnO1xufVxuXG4vKiogUE9TVCAvZXhpc3RzIFx1OEJGN1x1NkM0Mlx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeGlzdHNSZXF1ZXN0IHtcbiAgbm9kZV90b2tlbjogc3RyaW5nO1xufVxuXG4vKiogUE9TVCAvZXhpc3RzIFx1NTRDRFx1NUU5NFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeGlzdHNSZXNwb25zZSB7XG4gIG9rOiB0cnVlO1xuICBleGlzdHM6IGJvb2xlYW47XG4gIC8qKiBcdTVERjJcdTVCNThcdTU3MjhcdTY1RjZcdTdFRDlcdTUxRkFcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHU4REVGXHU1Rjg0XHUzMDAyICovXG4gIHBhdGg/OiBzdHJpbmc7XG59XG5cbi8qKiBQT1NUIC9wdXNoYmFjayBcdThCRjdcdTZDNDJcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVzaGJhY2tSZXF1ZXN0IHtcbiAgLyoqIFx1NEU4Q1x1OTAwOVx1NEUwMFx1RkYxQVx1NjcyQ1x1NTczMFx1OERFRlx1NUY4NFx1RkYwOFx1NzZGOFx1NUJGOSB2YXVsdCBcdTY4MzlcdUZGMDlcdTMwMDIgKi9cbiAgcGF0aD86IHN0cmluZztcbiAgLyoqIFx1NEU4Q1x1OTAwOVx1NEUwMFx1RkYxQW5vZGVfdG9rZW5cdUZGMDhcdTRFQ0VcdTdFRDFcdTVCOUFcdTYyN0VcdTY1ODdcdTRFRjZcdUZGMDlcdTMwMDIgKi9cbiAgbm9kZV90b2tlbj86IHN0cmluZztcbiAgLyoqIFx1NUYzQVx1NTIzNlx1NTZERVx1NTE5OVx1RkYwOFx1NUZGRFx1NzU2NSBoYXNoIFx1NEUwMFx1ODFGNFx1OERGM1x1OEZDN1x1RkYwOVx1MzAwMiAqL1xuICBmb3JjZT86IGJvb2xlYW47XG59XG5cbi8qKiBQT1NUIC9wdXNoYmFjayBcdTU0Q0RcdTVFOTRcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVzaGJhY2tSZXNwb25zZSB7XG4gIG9rOiB0cnVlO1xuICAvKiogXHU1QjlFXHU5NjQ1XHU1NkRFXHU1MTk5XHU4RkQ4XHU2NjJGXHU4REYzXHU4RkM3XHVGRjA4aGFzaCBcdTRFMDBcdTgxRjRcdUZGMDlcdTMwMDIgKi9cbiAgYWN0aW9uOiAncHVzaGVkJyB8ICdza2lwcGVkJztcbiAgLyoqIFx1NjVCMFx1NzY4NCBzeW5jX2hhc2hcdTMwMDIgKi9cbiAgaGFzaD86IHN0cmluZztcbiAgLyoqIFx1NTZERVx1NTE5OVx1NzY4NFx1OThERVx1NEU2Nlx1NjU4N1x1Njg2M1x1NjgwN1x1OTg5OFx1MzAwMiAqL1xuICB0aXRsZT86IHN0cmluZztcbn1cblxuLyoqIFx1N0VERlx1NEUwMFx1OTUxOVx1OEJFRlx1NTRDRFx1NUU5NFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBFcnJvclJlc3BvbnNlIHtcbiAgb2s6IGZhbHNlO1xuICAvKiogXHU2NzNBXHU1NjY4XHU1M0VGXHU4QkZCXHU5NTE5XHU4QkVGXHU3ODAxXHUzMDAyICovXG4gIGNvZGU6IHN0cmluZztcbiAgLyoqIFx1NEVCQVx1N0M3Qlx1NTNFRlx1OEJGQlx1NkQ4OFx1NjA2Rlx1MzAwMiAqL1xuICBtZXNzYWdlOiBzdHJpbmc7XG59XG5cbi8qKiBcdTYyNDBcdTY3MDlcdTdBRUZcdTcwQjlcdTVCOUFcdTRFNDlcdUZGMDhcdThERUZcdTVGODQgKyBcdTY1QjlcdTZDRDVcdUZGMDlcdUZGMENcdTRGOUJcdTRFMjRcdTdBRUZcdTVGMTVcdTc1MjhcdTkwN0ZcdTUxNERcdTYyRkNcdTUxOTlcdTZGMDJcdTc5RkJcdTMwMDIgKi9cbmV4cG9ydCBjb25zdCBFTkRQT0lOVFMgPSB7XG4gIHN0YXR1czogJy9zdGF0dXMnLFxuICB0cmVlOiAnL3RyZWUnLFxuICBmZXRjaDogJy9mZXRjaCcsXG4gIGNsaXA6ICcvY2xpcCcsXG4gIGV4aXN0czogJy9leGlzdHMnLFxuICBwdXNoYmFjazogJy9wdXNoYmFjaycsXG59IGFzIGNvbnN0O1xuXG4vKiogT2JzaWRpYW4gXHU3Q0ZCXHU3RURGXHU1MzRGXHU4QkFFXHVGRjFBXHU2RDRGXHU4OUM4XHU1NjY4XHU0RTNCXHU5MDFBXHU5MDUzXHU1MkE4XHU0RjVDXHU1NDBEXHUzMDAyICovXG5leHBvcnQgY29uc3QgT0JTSURJQU5fTEFSS19ET0NfQUNUSU9OID0gJ2xhcmstZG9jJztcblxuLyoqIE9ic2lkaWFuIFx1N0NGQlx1N0VERlx1NTM0Rlx1OEJBRVx1RkYxQVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NEUzQlx1OTAxQVx1OTA1MyBVUkkgXHU1MjREXHU3RjAwXHUzMDAyICovXG5leHBvcnQgY29uc3QgT0JTSURJQU5fTEFSS19ET0NfVVJJX1BSRUZJWCA9IGBvYnNpZGlhbjovLyR7T0JTSURJQU5fTEFSS19ET0NfQUNUSU9OfWA7XG5cbi8qKiBvYnNpZGlhbjovL2xhcmstZG9jIFx1NTNDMlx1NjU3MFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBPYnNpZGlhbkxhcmtEb2NQYXJhbXMge1xuICAvKiogdjMgXHU0RTNCXHU5MDFBXHU5MDUzXHU1MTdDXHU1QkI5XHU1QjU3XHU2QkI1XHVGRjBDXHU0RjE4XHU1MTQ4XHU0RjIwIHdpa2kgbm9kZV90b2tlblx1MzAwMiAqL1xuICB0b2tlbj86IHN0cmluZztcbiAgLyoqIHdpa2kgbm9kZV90b2tlblx1MzAwMiAqL1xuICBub2RlX3Rva2VuPzogc3RyaW5nO1xuICAvKiogZG9jeCBvYmpfdG9rZW5cdTMwMDIgKi9cbiAgb2JqX3Rva2VuPzogc3RyaW5nO1xuICAvKiogXHU5OERFXHU0RTY2XHU3N0U1XHU4QkM2XHU1RTkzIHNwYWNlX2lkXHUzMDAyICovXG4gIHNwYWNlX2lkPzogc3RyaW5nO1xuICAvKiogXHU5ODc1XHU5NzYyXHU2ODA3XHU5ODk4XHUzMDAyICovXG4gIHRpdGxlPzogc3RyaW5nO1xuICAvKiogXHU1MzlGXHU1OUNCXHU5OERFXHU0RTY2IFVSTFx1MzAwMiAqL1xuICB1cmw/OiBzdHJpbmc7XG4gIC8qKiBcdTUzRUZcdTkwMDlcdTc2RUVcdTY4MDdcdTc2RUVcdTVGNTVcdUZGMUJcdTRFM0FcdTdBN0FcdTY1RjZcdTc1MzEgT0IgXHU3QUVGXHU5MDA5XHU2MkU5XHU2MjE2XHU0RjdGXHU3NTI4XHU5RUQ4XHU4QkE0XHU3NkVFXHU1RjU1XHUzMDAyICovXG4gIGRpcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBcdTY3ODRcdTkwMjAgYG9ic2lkaWFuOi8vbGFyay1kb2NgIFVSSVx1MzAwMlxuICpcbiAqIFBvbnl0YWlsOiBcdTc1MjhcdTZENEZcdTg5QzhcdTU2NjhcdTU0OENcdTdDRkJcdTdFREZcdTVERjJcdTY3MDlcdTc2ODRcdTgxRUFcdTVCOUFcdTRFNDlcdTUzNEZcdThCQUVcdTgwRkRcdTUyOUJcdTYyN0ZcdThGN0RcdTRFM0JcdTkwMUFcdTkwNTNcdUZGMENcbiAqIFx1NEUwRFx1NTE4RFx1NEUzQVx1MjAxQ1x1NzBCOVx1NTFGQlx1OThERVx1NEU2Nlx1NjMwOVx1OTRBRVx1MjAxRFx1OTg5RFx1NTkxNlx1NTNEMVx1NjYwRVx1NEUwMFx1NTk1N1x1NTQwRVx1NTNGMFx1NkQ4OFx1NjA2Rlx1NTM0Rlx1OEJBRVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRPYnNpZGlhbkxhcmtEb2NVcmkocGFyYW1zOiBPYnNpZGlhbkxhcmtEb2NQYXJhbXMpOiBzdHJpbmcge1xuICBjb25zdCB0b2tlbiA9IHBhcmFtcy50b2tlbiB8fCBwYXJhbXMubm9kZV90b2tlbiB8fCBwYXJhbXMub2JqX3Rva2VuO1xuICBjb25zdCBxdWVyeTogQXJyYXk8W3N0cmluZywgc3RyaW5nIHwgdW5kZWZpbmVkXT4gPSBbXG4gICAgWyd0b2tlbicsIHRva2VuXSxcbiAgICBbJ25vZGVfdG9rZW4nLCBwYXJhbXMubm9kZV90b2tlbl0sXG4gICAgWydvYmpfdG9rZW4nLCBwYXJhbXMub2JqX3Rva2VuXSxcbiAgICBbJ3NwYWNlX2lkJywgcGFyYW1zLnNwYWNlX2lkXSxcbiAgICBbJ3RpdGxlJywgcGFyYW1zLnRpdGxlXSxcbiAgICBbJ3VybCcsIHBhcmFtcy51cmxdLFxuICAgIFsnZGlyJywgcGFyYW1zLmRpcl0sXG4gIF07XG4gIGNvbnN0IGVuY29kZWQgPSBxdWVyeVxuICAgIC5maWx0ZXIoKFssIHZhbHVlXSkgPT4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gJycpXG4gICAgLm1hcCgoW2tleSwgdmFsdWVdKSA9PiBgJHtlbmNvZGVVUklDb21wb25lbnQoa2V5KX09JHtlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKHZhbHVlKSl9YClcbiAgICAuam9pbignJicpO1xuICByZXR1cm4gZW5jb2RlZCA/IGAke09CU0lESUFOX0xBUktfRE9DX1VSSV9QUkVGSVh9PyR7ZW5jb2RlZH1gIDogT0JTSURJQU5fTEFSS19ET0NfVVJJX1BSRUZJWDtcbn1cblxuLyoqIFx1ODlFM1x1Njc5MCBgb2JzaWRpYW46Ly9sYXJrLWRvY2AgVVJJIFx1NjIxNiBPYnNpZGlhbiBwcm90b2NvbCBoYW5kbGVyIHBhcmFtc1x1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlT2JzaWRpYW5MYXJrRG9jUGFyYW1zKFxuICBpbnB1dDogc3RyaW5nIHwgVVJMU2VhcmNoUGFyYW1zIHwgUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgdW5kZWZpbmVkPixcbik6IE9ic2lkaWFuTGFya0RvY1BhcmFtcyB7XG4gIGNvbnN0IHNlYXJjaFBhcmFtcyA9ICgoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gaW5wdXQuaW5jbHVkZXMoJz8nKSA/IGlucHV0LnNsaWNlKGlucHV0LmluZGV4T2YoJz8nKSArIDEpIDogaW5wdXQ7XG4gICAgICByZXR1cm4gbmV3IFVSTFNlYXJjaFBhcmFtcyhxdWVyeSk7XG4gICAgfVxuICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcykgcmV0dXJuIGlucHV0O1xuICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhpbnB1dCkpIHtcbiAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSBwYXJhbXMuc2V0KGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyYW1zO1xuICB9KSgpO1xuXG4gIGNvbnN0IGdldCA9IChrZXk6IGtleW9mIE9ic2lkaWFuTGFya0RvY1BhcmFtcyk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PlxuICAgIHNlYXJjaFBhcmFtcy5nZXQoa2V5KSB8fCB1bmRlZmluZWQ7XG5cbiAgY29uc3QgcGFyc2VkOiBPYnNpZGlhbkxhcmtEb2NQYXJhbXMgPSB7fTtcbiAgZm9yIChjb25zdCBrZXkgb2YgWyd0b2tlbicsICdub2RlX3Rva2VuJywgJ29ial90b2tlbicsICdzcGFjZV9pZCcsICd0aXRsZScsICd1cmwnLCAnZGlyJ10gYXMgY29uc3QpIHtcbiAgICBjb25zdCB2YWx1ZSA9IGdldChrZXkpO1xuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSBwYXJzZWRba2V5XSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiBwYXJzZWQ7XG59XG5cbi8qKiBcdThGREJcdTVFQTZcdTk2MzZcdTZCQjVcdUZGMDhcdTYyNjlcdTVDNTVcdTZENkVcdTVDNDJcdTc1MjhcdUZGMDlcdTMwMDIgKi9cbmV4cG9ydCB0eXBlIFByb2dyZXNzU3RhZ2UgPVxuICB8ICdjb25uZWN0aW5nJ1xuICB8ICdmZXRjaGluZy1tZCdcbiAgfCAnZmV0Y2hpbmcteG1sJ1xuICB8ICdyZXdyaXRpbmctaW1hZ2VzJ1xuICB8ICd3cml0aW5nLWZpbGUnXG4gIHwgJ2Fzc2lnbmluZy1jb2RlJ1xuICB8ICdkb25lJ1xuICB8ICdlcnJvcic7XG4iLCAiLyoqXG4gKiBcdTUxODVcdTVCQjkgaGFzaFx1RkYwOFx1OEY3Qlx1NjgzOFx1OUE4Q1x1RkYwOVx1MzAwMlx1NEY5RFx1NjM2RSBgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTc2LjIgXHU2QjY1XHU5QUE0IDJcdTMwMDJcbiAqIFx1NzUyOCBzaGEyNTZcdUZGMENcdTUzRUEgaGFzaCBcdTZCNjNcdTY1ODdcdUZGMDhcdTRFMERcdTU0MkIgZnJvbnRtYXR0ZXIgXHU3Njg0IHN5bmNfKiBcdTVCNTdcdTZCQjVcdUZGMENcdTkwN0ZcdTUxNERcdTgxRUFcdTYzMDdcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdThERThcdTczQUZcdTU4ODNcdUZGMUFcdTRGMThcdTUxNDhcdTc1MjggV2ViIENyeXB0byBBUElcdUZGMDhcdTZENEZcdTg5QzhcdTU2NjggKyBOb2RlIDE4KyBcdTkwRkRcdTY3MDkgZ2xvYmFsVGhpcy5jcnlwdG8uc3VidGxlXHVGRjA5XHVGRjBDXG4gKiBmYWxsYmFjayBcdTUyMzAgbm9kZTpjcnlwdG9cdUZGMDhPQiBcdTYzRDJcdTRFRjYgbm9kZSBcdTczQUZcdTU4ODNcdTRGRERcdTk2NjlcdUZGMDlcdTMwMDJcbiAqL1xuXG4vKiogXHU1NDBDXHU2QjY1XHU3MjQ4IHNoYTI1NiBoZXhcdUZGMDhcdTRFQzUgTm9kZSBcdTczQUZcdTU4ODNcdUZGMDlcdTMwMDJcdTZENEZcdTg5QzhcdTU2NjhcdTc1MjggYm9keUhhc2hBc3luY1x1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJvZHlIYXNoKGJvZHk6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIE5vZGUgXHU3M0FGXHU1ODgzXG4gIHRyeSB7XG4gICAgY29uc3QgeyBjcmVhdGVIYXNoIH0gPSByZXF1aXJlKCdub2RlOmNyeXB0bycpIGFzIHR5cGVvZiBpbXBvcnQoJ25vZGU6Y3J5cHRvJyk7XG4gICAgcmV0dXJuIGNyZWF0ZUhhc2goJ3NoYTI1NicpLnVwZGF0ZShib2R5LCAndXRmOCcpLmRpZ2VzdCgnaGV4Jyk7XG4gIH0gY2F0Y2gge1xuICAgIC8vIFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NzNBRlx1NTg4M1x1NjVFMCByZXF1aXJlXHVGRjBDXHU4RDcwIGFzeW5jIFx1NzI0OFx1RkYwOFx1OEZEOVx1OTFDQ1x1NTQwQ1x1NkI2NVx1OEZENFx1NTZERSBmYWxsYmFja1x1RkYwQ1x1OEMwM1x1NzUyOFx1NjVCOVx1NUU5NFx1NzUyOCBhc3luYyBcdTcyNDhcdUZGMDlcbiAgICByZXR1cm4gc3luY0ZhbGxiYWNrSGFzaChib2R5KTtcbiAgfVxufVxuXG4vKipcbiAqIFx1NUYwMlx1NkI2NSBzaGEyNTYgaGV4XHVGRjA4XHU2RDRGXHU4OUM4XHU1NjY4ICsgTm9kZSBcdTkwMUFcdTc1MjhcdUZGMDlcdTMwMDJcdTYzQThcdTgzNTBcdTRGN0ZcdTc1MjhcdTMwMDJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJvZHlIYXNoQXN5bmMoYm9keTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgY3J5cHRvID0gZ2xvYmFsVGhpcy5jcnlwdG8gYXMgeyBzdWJ0bGU/OiB7IGRpZ2VzdDogKGFsZzogc3RyaW5nLCBkYXRhOiBBcnJheUJ1ZmZlcikgPT4gUHJvbWlzZTxBcnJheUJ1ZmZlcj4gfSB9O1xuICBpZiAoY3J5cHRvPy5zdWJ0bGUpIHtcbiAgICBjb25zdCBidWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRpZ2VzdCgnU0hBLTI1NicsIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShib2R5KS5idWZmZXIgYXMgQXJyYXlCdWZmZXIpO1xuICAgIHJldHVybiBbLi4ubmV3IFVpbnQ4QXJyYXkoYnVmKV0ubWFwKChiKSA9PiBiLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpKS5qb2luKCcnKTtcbiAgfVxuICByZXR1cm4gc3luY0ZhbGxiYWNrSGFzaChib2R5KTtcbn1cblxuLyoqXG4gKiBcdTdCODBcdTY2MTNcdTU0MENcdTZCNjUgZmFsbGJhY2tcdUZGMDhcdTk3NUVcdTUyQTBcdTVCQzZcdTdFQTdcdUZGMENcdTRFQzVcdTVGNTMgY3J5cHRvIEFQSSBcdTkwRkRcdTRFMERcdTUzRUZcdTc1MjhcdTY1RjZcdTc1MjhcdUZGMDlcdTMwMDJcbiAqIFx1NzUyOCBkamIyIFx1NTNEOFx1NzlDRFx1RkYwQ1x1NEZERFx1OEJDMVx1NEUwMFx1ODFGNFx1NjAyN1x1NTM3M1x1NTNFRlx1RkYwOFx1OEY3Qlx1NjgzOFx1OUE4Q1x1NTczQVx1NjY2Rlx1RkYwOVx1MzAwMlxuICovXG5mdW5jdGlvbiBzeW5jRmFsbGJhY2tIYXNoKGJvZHk6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBoMSA9IDB4ODExYzlkYzU7XG4gIGxldCBoMiA9IDB4MTAwMDE5MztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBib2R5Lmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgYyA9IGJvZHkuY2hhckNvZGVBdChpKTtcbiAgICBoMSA9IE1hdGguaW11bChoMSBeIGMsIDB4MDEwMDAxOTMpO1xuICAgIGgyID0gTWF0aC5pbXVsKGgyIF4gKGMgKyAweDllMzc3OWI5KSwgMHg4NWViY2E3Nyk7XG4gIH1cbiAgcmV0dXJuIChoMSA+Pj4gMCkudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDgsICcwJykgKyAoaDIgPj4+IDApLnRvU3RyaW5nKDE2KS5wYWRTdGFydCg4LCAnMCcpICsgJ19mYWxsYmFjayc7XG59XG5cbi8qKlxuICogXHU2QkQ0XHU1QkY5XHU2NjJGXHU1NDI2XHU1M0Q4XHU1MzE2XHUzMDAyXG4gKiBAcGFyYW0gY3VycmVudCBcdTVGNTNcdTUyNERcdTZCNjNcdTY1ODcgaGFzaFxuICogQHBhcmFtIGxhc3QgXHU0RTBBXHU2QjIxXHU1NDBDXHU2QjY1XHU1MTk5XHU1MTY1XHU3Njg0IHN5bmNfaGFzaFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDaGFuZ2VkKGN1cnJlbnQ6IHN0cmluZywgbGFzdD86IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoIWxhc3QpIHJldHVybiB0cnVlO1xuICByZXR1cm4gY3VycmVudCAhPT0gbGFzdDtcbn1cbiIsICIvKipcbiAqIFx1OThERVx1NEU2Nlx1NjgwN1x1OTg5OCBcdTIxOTIgXHU1Qjg5XHU1MTY4XHU2NTg3XHU0RUY2XHU1NDBEXHU2RTA1XHU2RDE3XHUzMDAyXHU0RjlEXHU2MzZFIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgIFx1MDBBN1x1NEU4Q1x1NkI2NVx1OUFBNCBcdTI0NjFcdTMwMDJcbiAqIFx1OERFOFx1NUU3M1x1NTNGMFx1OTc1RVx1NkNENVx1NUI1N1x1N0IyNlx1RkYwOFdpbmRvd3MvbWFjT1MvTGludXggXHU1RTc2XHU5NkM2XHVGRjA5XHVGRjFBLyBcXCA6ICogPyBcIiA8ID4gfFxuICogXHU0RUU1XHU1M0NBXHU2M0E3XHU1MjM2XHU1QjU3XHU3QjI2XHUzMDAxXHU5OTk2XHU1QzNFXHU3MEI5XHU1M0Y3L1x1N0E3QVx1NjgzQ1x1RkYwOFdpbmRvd3MgXHU3OTgxXHU2QjYyXHVGRjA5XHUzMDAyXG4gKi9cblxuY29uc3QgSUxMRUdBTCA9IC9bXFwvXFxcXDoqP1wiPD58XS9nO1xuY29uc3QgQ09OVFJPTCA9IC9bXFx4MDAtXFx4MWZcXHg3Zl0vZztcblxuLyoqXG4gKiBcdTZFMDVcdTZEMTdcdTk4REVcdTRFNjZcdTY4MDdcdTk4OThcdTRFM0FcdTVCODlcdTUxNjhcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTRFMERcdTU0MkJcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDlcdTMwMDJcbiAqIC0gXHU1M0JCXHU5NzVFXHU2Q0Q1XHU1QjU3XHU3QjI2IFx1MjE5MiBcdTc1MjhcdTRFMEJcdTUyMTJcdTdFQkZcdTY2RkZcdTYzNjJcbiAqIC0gXHU2Mjk4XHU1M0UwXHU4RkRFXHU3RUVEXHU3QTdBXHU3NjdEXG4gKiAtIFx1NTNCQlx1OTk5Nlx1NUMzRVx1NzBCOVx1NTNGNy9cdTdBN0FcdTY4M0NcbiAqIC0gXHU2MjJBXHU2NUFEXHU1MjMwIDEwMCBcdTVCNTdcdTdCMjZcdUZGMDhcdTRGRERcdTc1NTlcdTdGMTZcdTc4MDFcdTUyNERcdTdGMDBcdTdBN0FcdTk1RjRcdUZGMDlcbiAqIC0gXHU3QTdBXHU2ODA3XHU5ODk4XHU1NkRFXHU5MDAwXHU1MjMwIFwiXHU2NzJBXHU1NDdEXHU1NDBEXCJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplRmlsZW5hbWUodGl0bGU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBzID0gKHRpdGxlID8/ICcnKS50cmltKCk7XG4gIHMgPSBzLnJlcGxhY2UoSUxMRUdBTCwgJ18nKS5yZXBsYWNlKENPTlRST0wsICcnKTtcbiAgcyA9IHMucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKTtcbiAgLy8gV2luZG93cyBcdTc5ODFcdTZCNjJcdTk5OTZcdTVDM0VcdTcwQjlcdTUzRjcvXHU3QTdBXHU2ODNDXG4gIHMgPSBzLnJlcGxhY2UoL15bXFwuXFxzXSt8W1xcLlxcc10rJC9nLCAnJyk7XG4gIGlmIChzLmxlbmd0aCA+IDEwMCkgcyA9IHMuc2xpY2UoMCwgMTAwKS50cmltKCk7XG4gIHJldHVybiBzIHx8ICdcdTY3MkFcdTU0N0RcdTU0MEQnO1xufVxuXG4vKipcbiAqIFx1NTJBMCAubWQgXHU2MjY5XHU1QzU1XHVGRjA4XHU4MkU1XHU1REYyXHU2NzA5XHU1QzMxXHU0RTBEXHU5MUNEXHU1OTBEXHU1MkEwXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoTWRFeHQobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKS5lbmRzV2l0aCgnLm1kJykgPyBuYW1lIDogYCR7bmFtZX0ubWRgO1xufVxuXG4vKipcbiAqIFx1NjJGQ1x1NjNBNVx1NzZFRVx1NUY1NVx1NEUwRVx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NTkwNFx1NzQwNlx1NjU5Q1x1Njc2MFx1RkYwOVx1MzAwMlxuICogQHBhcmFtIGRpciBcdTc2RjhcdTVCRjkgdmF1bHQgXHU2ODM5XHU3Njg0XHU3NkVFXHU1RjU1XHVGRjBDXHU1OTgyIFwiMFx1RkUwRlx1MjBFM1x1OEY5M1x1NTE2NS9cdUQ4M0RcdURDQTFcdTc4OEVcdTcyNDdcdThGOTNcdTUxNjVcIlxuICogQHBhcmFtIGZpbGVuYW1lIFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NTQyQlx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gam9pblBhdGgoZGlyOiBzdHJpbmcgfCB1bmRlZmluZWQsIGZpbGVuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIWRpciB8fCBkaXIgPT09ICcuJyB8fCBkaXIgPT09ICcvJykgcmV0dXJuIGZpbGVuYW1lO1xuICBjb25zdCBkID0gZGlyLnJlcGxhY2UoL1tcXC9cXFxcXSskLywgJycpLnJlcGxhY2UoL15bXFwvXFxcXF0rLywgJycpO1xuICByZXR1cm4gZCA/IGAke2R9LyR7ZmlsZW5hbWV9YCA6IGZpbGVuYW1lO1xufVxuIiwgIi8qKlxuICogXHU1NkZFXHU3MjQ3IHRva2VuIFx1NTkwNFx1NzQwNlx1MzAwMlx1NEY5RFx1NjM2RSBgMDBfXHU1NDBDXHU2QjY1XHU2NUI5XHU2ODQ4XHU4QkJFXHU4QkExX3YyLm1kYCBcdTAwQTczLjMgKyBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTUxNkRcdTMwMDJcbiAqXG4gKiBcdTk4REVcdTRFNjZcdTVCRkNcdTUxRkFcdTc2ODRcdTU2RkVcdTcyNDdcdTk0RkVcdTYzQTVcdTVGNjJcdTYwMDFcdUZGMUFcbiAqICAgLSBtZCBcdTVCRkNcdTUxRkFcdUZGMUFgIVtdKGh0dHBzOi8vaW50ZXJuYWwtYXBpLWRyaXZlLXN0cmVhbS5mZWlzaHUuY24vLi4uL2F1dGhjb2RlPS4uLilgXHVGRjA4XHU5NzAwXHU3NjdCXHU1RjU1XHU2MDAxXHVGRjBDMWggXHU4RkM3XHU2NzFGXHVGRjA5XG4gKiAgIC0geG1sIFx1NUJGQ1x1NTFGQVx1RkYxQWA8aW1nIHNyYz1cIkZJTEVfVE9LRU5cIiBocmVmPVwiYXV0aGNvZGVfdXJsXCIvPmBcdUZGMDhGSUxFX1RPS0VOIFx1NkMzOFx1NEU0NVx1NEUwRFx1OEZDN1x1NjcxRlx1RkYwOVxuICpcbiAqIE9CIFx1OTFDQ1x1N0VERlx1NEUwMFx1NTE5OVx1NjIxMFx1RkYxQWAhW10oZmVpc2h1Oi8vRklMRV9UT0tFTilgXG4gKiBcdTk4ODRcdTg5QzhcdTY1RjZcdTc1MzEgT0IgXHU2M0QyXHU0RUY2XHU4QzAzIGBsYXJrLWNsaSBkb2NzICttZWRpYS1kb3dubG9hZGAgXHU2MzYyXHU0RTM0XHU2NUY2XHU5NEZFXHU2M0E1XHUzMDAyXG4gKi9cblxuLyoqIE9CIFx1NEZBN1x1NTZGRVx1NzI0N1x1NUYxNVx1NzUyOFx1NTM0Rlx1OEJBRVx1NTI0RFx1N0YwMFx1MzAwMiAqL1xuZXhwb3J0IGNvbnN0IEZFSVNIVV9QUk9UTyA9ICdmZWlzaHU6Ly8nO1xuXG4vKiogXHU5OERFXHU0RTY2IGludGVybmFsLWFwaSBcdTU2RkVcdTcyNDdcdTU3REZcdTU0MERcdUZGMDhcdThCQzZcdTUyMkJcdTk3MDBcdTc2N0JcdTVGNTVcdTYwMDFcdTc2ODRcdTRFMzRcdTY1RjZcdTk0RkVcdTYzQTVcdUZGMDlcdTMwMDIgKi9cbmNvbnN0IElOVEVSTkFMX0FQSV9IT1NUID0gJ2ludGVybmFsLWFwaS1kcml2ZS1zdHJlYW0uZmVpc2h1LmNuJztcbmNvbnN0IElOVEVSTkFMX0FQSV9IT1NUX0xBUksgPSAnaW50ZXJuYWwtYXBpLWRyaXZlLXN0cmVhbS5sYXJrc3VpdGUuY29tJztcblxuLyoqIGZpbGVfdG9rZW4gXHU2ODNDXHU1RjBGXHVGRjFBXHU5OERFXHU0RTY2IHRva2VuIFx1NjYyRiBiYXNlNjItaXNoXHVGRjBDXHU5NTdGXHU1RUE2IH4yOFx1MzAwMiAqL1xuY29uc3QgVE9LRU5fUkUgPSAvW0EtWmEtejAtOV17MjAsfS87XG5cbi8qKlxuICogXHU0RUNFXHU5OERFXHU0RTY2IGludGVybmFsLWFwaSBhdXRoY29kZSBVUkwgXHU5MUNDXHU2M0QwXHU1M0Q2IGZpbGVfdG9rZW5cdTMwMDJcbiAqIFVSTCBcdTVGNjJcdTU5ODIgYGh0dHBzOi8vaW50ZXJuYWwtYXBpLWRyaXZlLXN0cmVhbS5mZWlzaHUuY24vZHJpdmUtc3RyZWFtLzxUT0tFTj4vPGV4dHJhPj9hdXRoY29kZT0uLi5gXG4gKiBcdTUzRDZcdThERUZcdTVGODRcdTZCQjVcdTRFMkRcdTY3MDBcdTk1N0ZcdTc2ODQgdG9rZW4tbGlrZSBcdTVCNTBcdTRFMzJcdTMwMDJcbiAqIEByZXR1cm5zIHRva2VuIFx1NjIxNiBudWxsXHVGRjA4XHU2NUUwXHU2Q0Q1XHU4QkM2XHU1MjJCXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0VG9rZW5Gcm9tQXV0aGNvZGVVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgaWYgKCF1cmwpIHJldHVybiBudWxsO1xuICBsZXQgdTogVVJMO1xuICB0cnkge1xuICAgIHUgPSBuZXcgVVJMKHVybCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGhvc3QgPSB1Lmhvc3RuYW1lO1xuICBpZiAoaG9zdCAhPT0gSU5URVJOQUxfQVBJX0hPU1QgJiYgaG9zdCAhPT0gSU5URVJOQUxfQVBJX0hPU1RfTEFSSykgcmV0dXJuIG51bGw7XG4gIGNvbnN0IHNlZ21lbnRzID0gdS5wYXRobmFtZS5zcGxpdCgnLycpLmZpbHRlcihCb29sZWFuKTtcbiAgbGV0IGJlc3Q6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICBmb3IgKGNvbnN0IHNlZyBvZiBzZWdtZW50cykge1xuICAgIGNvbnN0IG0gPSBzZWcubWF0Y2goVE9LRU5fUkUpO1xuICAgIGlmIChtICYmICghYmVzdCB8fCBtWzBdLmxlbmd0aCA+IGJlc3QubGVuZ3RoKSkgYmVzdCA9IG1bMF07XG4gIH1cbiAgcmV0dXJuIGJlc3Q7XG59XG5cbi8qKlxuICogXHU2MjhBIG1kIFx1NkI2M1x1NjU4N1x1OTFDQ1x1NzY4NCBpbnRlcm5hbC1hcGkgYXV0aGNvZGUgXHU1NkZFXHU3MjQ3XHU5NEZFXHU2M0E1XHU2NkZGXHU2MzYyXHU0RTNBIGBmZWlzaHU6Ly9UT0tFTmBcdTMwMDJcbiAqIFx1NjNEMFx1NEY5Qlx1NEUwMFx1NEUyQSB0b2tlbiBcdTY2MjBcdTVDMDRcdTg4NjhcdUZGMDh4bWwgXHU1QkZDXHU1MUZBXHU2MkZGXHU1MjMwXHU3Njg0IHNyYyB0b2tlbiBcdTIxOTIgaHJlZiBcdTUzRUZcdTgwRkRcdTU0MkJcdTU0MEMgdG9rZW5cdUZGMDlcdTMwMDJcbiAqIFx1NUJGOVx1NjI3RVx1NEUwRFx1NTIzMFx1NjYyMFx1NUMwNFx1NzY4NCBhdXRoY29kZSBVUkxcdUZGMENcdTVDMURcdThCRDVcdTVDMzFcdTU3MzAgZXh0cmFjdFx1MzAwMlxuICpcbiAqIEBwYXJhbSBtZCBcdTZCNjNcdTY1ODcgbWFya2Rvd25cbiAqIEBwYXJhbSB0b2tlbk1hcCB4bWwgXHU1QkZDXHU1MUZBXHU2MkZGXHU1MjMwXHU3Njg0IGZpbGVfdG9rZW4gXHU5NkM2XHU1NDA4XHVGRjA4XHU3NTI4XHU0RThFXHU3Q0JFXHU3ODZFXHU1MzM5XHU5MTREXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXdyaXRlSW1hZ2VzVG9GZWlzaHVQcm90byhcbiAgbWQ6IHN0cmluZyxcbiAgdG9rZW5NYXA6IFNldDxzdHJpbmc+IHwgTWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBTZXQoKSxcbik6IHN0cmluZyB7XG4gIC8vIFx1NTMzOVx1OTE0RCAhW2FsdF0odXJsKSBcdTVGNjJcdTVGMEZcdTc2ODRcdTU2RkVcdTcyNDdcdUZGMEN1cmwgXHU2NjJGIGludGVybmFsLWFwaSBcdTk0RkVcdTYzQTVcbiAgY29uc3QgaW1nUmUgPSAvIVxcWyhbXlxcXV0qKVxcXVxcKChbXildKylcXCkvZztcbiAgcmV0dXJuIG1kLnJlcGxhY2UoaW1nUmUsIChmdWxsLCBhbHQ6IHN0cmluZywgdXJsOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCB0cmltbWVkID0gdXJsLnRyaW0oKS5yZXBsYWNlKC9ePHw+JC9nLCAnJyk7XG4gICAgLy8gXHU1REYyXHU3RUNGXHU2NjJGIGZlaXNodTovLyBcdTUzNEZcdThCQUVcdUZGMENcdThERjNcdThGQzdcbiAgICBpZiAodHJpbW1lZC5zdGFydHNXaXRoKEZFSVNIVV9QUk9UTykpIHJldHVybiBmdWxsO1xuICAgIC8vIGludGVybmFsLWFwaSBcdTk0RkVcdTYzQTVcdUZGMUFcdTYzRDAgdG9rZW5cbiAgICBpZiAoXG4gICAgICB0cmltbWVkLmluY2x1ZGVzKElOVEVSTkFMX0FQSV9IT1NUKSB8fFxuICAgICAgdHJpbW1lZC5pbmNsdWRlcyhJTlRFUk5BTF9BUElfSE9TVF9MQVJLKVxuICAgICkge1xuICAgICAgY29uc3QgdG9rZW4gPSBwaWNrRXhhY3RUb2tlbih0b2tlbk1hcCwgdHJpbW1lZCkgPz8gZXh0cmFjdFRva2VuRnJvbUF1dGhjb2RlVXJsKHRyaW1tZWQpID8/IHBpY2tGcm9tTWFwKHRva2VuTWFwKTtcbiAgICAgIGlmICh0b2tlbikgcmV0dXJuIGAhWyR7YWx0fV0oJHtGRUlTSFVfUFJPVE99JHt0b2tlbn0pYDtcbiAgICB9XG4gICAgLy8gXHU2NjZFXHU5MDFBXHU1OTE2XHU5NEZFXHU2MjE2IGJhc2U2NFx1RkYwQ1x1NTM5Rlx1NjgzN1x1NEZERFx1NzU1OVxuICAgIHJldHVybiBmdWxsO1xuICB9KTtcbn1cblxuLyoqIFx1NEVDRSB0b2tlbk1hcCBcdTkxQ0NcdTUzRDZcdTRFMDBcdTRFMkFcdUZGMDhmYWxsYmFja1x1RkYwQ1x1NzUyOFx1NEU4RVx1OTg3QVx1NUU4Rlx1NTMzOVx1OTE0RFx1NTczQVx1NjY2Rlx1RkYwQ1x1OEMwM1x1NzUyOFx1NjVCOVx1NUU5NFx1NEYxOFx1NTE0OFx1N0NCRVx1Nzg2RVx1NTMzOVx1OTE0RFx1RkYwOVx1MzAwMiAqL1xuZnVuY3Rpb24gcGlja0Zyb21NYXAodG9rZW5NYXA6IFNldDxzdHJpbmc+IHwgTWFwPHN0cmluZywgc3RyaW5nPik6IHN0cmluZyB8IG51bGwge1xuICBpZiAodG9rZW5NYXAgaW5zdGFuY2VvZiBNYXApIHJldHVybiBudWxsO1xuICBpZiAodG9rZW5NYXAuc2l6ZSA9PT0gMCkgcmV0dXJuIG51bGw7XG4gIHJldHVybiB0b2tlbk1hcC52YWx1ZXMoKS5uZXh0KCkudmFsdWUgPz8gbnVsbDtcbn1cblxuZnVuY3Rpb24gcGlja0V4YWN0VG9rZW4odG9rZW5NYXA6IFNldDxzdHJpbmc+IHwgTWFwPHN0cmluZywgc3RyaW5nPiwgdXJsOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgaWYgKCEodG9rZW5NYXAgaW5zdGFuY2VvZiBNYXApKSByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIHRva2VuTWFwLmdldCh1cmwpID8/IHRva2VuTWFwLmdldCh1cmwucmVwbGFjZSgvJmFtcDsvZywgJyYnKSkgPz8gbnVsbDtcbn1cblxuLyoqXG4gKiBcdTRFQ0UgeG1sIFx1OTFDQ1x1NjNEMFx1NTNENlx1NjI0MFx1NjcwOSBgPGltZyBzcmM9XCJUT0tFTlwiIC4uLi8+YCBcdTc2ODQgZmlsZV90b2tlblx1MzAwMlxuICogXHU5OERFXHU0RTY2IHhtbCBcdTc2ODQgc3JjIFx1NzZGNFx1NjNBNVx1NUMzMVx1NjYyRiBmaWxlX3Rva2VuXHVGRjA4XHU0RTBEXHU2NjJGIFVSTFx1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEltZ1Rva2Vuc0Zyb21YbWwoeG1sOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IHRva2VucyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCBpbWdSZSA9IC88aW1nXFxiW14+XSpcXGJzcmM9W1wiJ10oW15cIiddKylbXCInXVtePl0qXFwvPz4vZztcbiAgbGV0IG06IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG4gIHdoaWxlICgobSA9IGltZ1JlLmV4ZWMoeG1sKSkgIT09IG51bGwpIHtcbiAgICBjb25zdCBzcmMgPSBtWzFdLnRyaW0oKTtcbiAgICBpZiAoc3JjLnN0YXJ0c1dpdGgoRkVJU0hVX1BST1RPKSkge1xuICAgICAgdG9rZW5zLmFkZChzcmMuc2xpY2UoRkVJU0hVX1BST1RPLmxlbmd0aCkpO1xuICAgIH0gZWxzZSBpZiAoVE9LRU5fUkUudGVzdChzcmMpICYmICFzcmMuc3RhcnRzV2l0aCgnaHR0cCcpKSB7XG4gICAgICB0b2tlbnMuYWRkKHNyYyk7XG4gICAgfVxuICB9XG4gIHJldHVybiBbLi4udG9rZW5zXTtcbn1cblxuLyoqXG4gKiBcdTRFQ0VcdTk4REVcdTRFNjYgWE1MIFx1NjNEMFx1NTNENiBgaHJlZiBcdTRFMzRcdTY1RjZcdTU2RkVcdTk0RkUgLT4gc3JjIGZpbGVfdG9rZW5gIFx1NjYyMFx1NUMwNFx1MzAwMlxuICogbWFya2Rvd24gXHU1QkZDXHU1MUZBXHU1M0VBXHU3RUQ5XHU0RTM0XHU2NUY2IGF1dGhjb2RlIFVSTFx1RkYxQlhNTCBcdTc2ODQgc3JjIFx1NjI0RFx1NjYyRlx1NTNFRlx1OTU3Rlx1NjcxRlx1NEZERFx1NUI1OFx1NzY4NCBmaWxlX3Rva2VuXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0SW1nVG9rZW5NYXBGcm9tWG1sKHhtbDogc3RyaW5nKTogTWFwPHN0cmluZywgc3RyaW5nPiB7XG4gIGNvbnN0IG1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIGNvbnN0IGltZ1JlID0gLzxpbWdcXGJbXj5dKj4vZztcbiAgbGV0IG06IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG4gIHdoaWxlICgobSA9IGltZ1JlLmV4ZWMoeG1sKSkgIT09IG51bGwpIHtcbiAgICBjb25zdCB0YWcgPSBtWzBdO1xuICAgIGNvbnN0IHNyYyA9IGF0dHIodGFnLCAnc3JjJyk7XG4gICAgY29uc3QgaHJlZiA9IGF0dHIodGFnLCAnaHJlZicpO1xuICAgIGlmICghc3JjIHx8ICFocmVmIHx8IHNyYy5zdGFydHNXaXRoKCdodHRwJykpIGNvbnRpbnVlO1xuICAgIGlmICghVE9LRU5fUkUudGVzdChzcmMpKSBjb250aW51ZTtcbiAgICBtYXAuc2V0KGRlY29kZVhtbEF0dHIoaHJlZiksIHNyYyk7XG4gIH1cbiAgcmV0dXJuIG1hcDtcbn1cblxuZnVuY3Rpb24gYXR0cih0YWc6IHN0cmluZywgbmFtZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChgXFxcXGIke25hbWV9PVtcIiddKFteXCInXSspW1wiJ11gKTtcbiAgcmV0dXJuIHRhZy5tYXRjaChyZSk/LlsxXSA/PyBudWxsO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVYbWxBdHRyKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdmFsdWVcbiAgICAucmVwbGFjZSgvJmFtcDsvZywgJyYnKVxuICAgIC5yZXBsYWNlKC8mcXVvdDsvZywgJ1wiJylcbiAgICAucmVwbGFjZSgvJmFwb3M7L2csIFwiJ1wiKVxuICAgIC5yZXBsYWNlKC8mbHQ7L2csICc8JylcbiAgICAucmVwbGFjZSgvJmd0Oy9nLCAnPicpO1xufVxuXG4vKipcbiAqIFx1NEVDRSBtZCBcdTZCNjNcdTY1ODdcdTkxQ0NcdTYzRDBcdTUzRDZcdTYyNDBcdTY3MDkgZmVpc2h1Oi8vVE9LRU5cdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RGZWlzaHVJbWFnZVRva2VucyhtZDogc3RyaW5nKTogc3RyaW5nW10ge1xuICBjb25zdCB0b2tlbnMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKFxuICAgIGAhXFxcXFtbXlxcXFxdXSpcXFxcXVxcXFwoJHtGRUlTSFVfUFJPVE8ucmVwbGFjZSgnLycsICdcXFxcLycpfShbQS1aYS16MC05XSspXFxcXClgLFxuICAgICdnJyxcbiAgKTtcbiAgbGV0IG06IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG4gIHdoaWxlICgobSA9IHJlLmV4ZWMobWQpKSAhPT0gbnVsbCkge1xuICAgIHRva2Vucy5hZGQobVsxXSk7XG4gIH1cbiAgcmV0dXJuIFsuLi50b2tlbnNdO1xufVxuXG4vKipcbiAqIFx1NjI4QSBPQiBcdTZCNjNcdTY1ODdcdTkxQ0NcdTc2ODQgYCFbXShmZWlzaHU6Ly9UT0tFTilgIFx1OEZEOFx1NTM5Rlx1NEUzQVx1OThERVx1NEU2NiB4bWwgYDxpbWcgc3JjPVwiVE9LRU5cIi8+YFx1MzAwMlxuICogXHU3NTI4XHU0RThFIE9CXHUyMTkyXHU5OERFXHU0RTY2XHU1NkRFXHU1MTk5XHVGRjA4bWQgXHU5MEU4XHU1MjA2XHU3NTI4IG1hcmtkb3duXHVGRjBDXHU1NkZFXHU3MjQ3XHU5NzAwXHU3NTI4IHhtbCBcdTY4MDdcdTdCN0VcdTYyNERcdTgwRkRcdTg4QUJcdTk4REVcdTRFNjZcdThCQzZcdTUyMkJcdTRFM0FcdTVERjJcdTY3MDkgdG9rZW5cdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZlaXNodVByb3RvVG9YbWwobWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHJlID0gLyFcXFsoW15cXF1dKilcXF1cXChmZWlzaHU6XFwvXFwvKFtBLVphLXowLTldKylcXCkvZztcbiAgcmV0dXJuIG1kLnJlcGxhY2UocmUsIChfZnVsbCwgX2FsdDogc3RyaW5nLCB0b2tlbjogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIGA8aW1nIHNyYz1cIiR7dG9rZW59XCIvPmA7XG4gIH0pO1xufVxuIiwgIid1c2Ugc3RyaWN0J1xuXG5mdW5jdGlvbiBpc05vdGhpbmcgKHN1YmplY3QpIHtcbiAgcmV0dXJuICh0eXBlb2Ygc3ViamVjdCA9PT0gJ3VuZGVmaW5lZCcpIHx8IChzdWJqZWN0ID09PSBudWxsKVxufVxuXG5mdW5jdGlvbiBpc09iamVjdCAoc3ViamVjdCkge1xuICByZXR1cm4gKHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JykgJiYgKHN1YmplY3QgIT09IG51bGwpXG59XG5cbmZ1bmN0aW9uIHRvQXJyYXkgKHNlcXVlbmNlKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHNlcXVlbmNlKSkgcmV0dXJuIHNlcXVlbmNlXG4gIGVsc2UgaWYgKGlzTm90aGluZyhzZXF1ZW5jZSkpIHJldHVybiBbXVxuXG4gIHJldHVybiBbc2VxdWVuY2VdXG59XG5cbmZ1bmN0aW9uIGV4dGVuZCAodGFyZ2V0LCBzb3VyY2UpIHtcbiAgaWYgKHNvdXJjZSkge1xuICAgIGNvbnN0IHNvdXJjZUtleXMgPSBPYmplY3Qua2V5cyhzb3VyY2UpXG5cbiAgICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IHNvdXJjZUtleXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgICAgY29uc3Qga2V5ID0gc291cmNlS2V5c1tpbmRleF1cbiAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0XG59XG5cbmZ1bmN0aW9uIHJlcGVhdCAoc3RyaW5nLCBjb3VudCkge1xuICBsZXQgcmVzdWx0ID0gJydcblxuICBmb3IgKGxldCBjeWNsZSA9IDA7IGN5Y2xlIDwgY291bnQ7IGN5Y2xlICs9IDEpIHtcbiAgICByZXN1bHQgKz0gc3RyaW5nXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIGlzTmVnYXRpdmVaZXJvIChudW1iZXIpIHtcbiAgcmV0dXJuIChudW1iZXIgPT09IDApICYmIChOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkgPT09IDEgLyBudW1iZXIpXG59XG5cbm1vZHVsZS5leHBvcnRzLmlzTm90aGluZyA9IGlzTm90aGluZ1xubW9kdWxlLmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdFxubW9kdWxlLmV4cG9ydHMudG9BcnJheSA9IHRvQXJyYXlcbm1vZHVsZS5leHBvcnRzLnJlcGVhdCA9IHJlcGVhdFxubW9kdWxlLmV4cG9ydHMuaXNOZWdhdGl2ZVplcm8gPSBpc05lZ2F0aXZlWmVyb1xubW9kdWxlLmV4cG9ydHMuZXh0ZW5kID0gZXh0ZW5kXG4iLCAiLy8gWUFNTCBlcnJvciBjbGFzcy4gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NDU4OTg0XG4vL1xuJ3VzZSBzdHJpY3QnXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yIChleGNlcHRpb24sIGNvbXBhY3QpIHtcbiAgbGV0IHdoZXJlID0gJydcbiAgY29uc3QgbWVzc2FnZSA9IGV4Y2VwdGlvbi5yZWFzb24gfHwgJyh1bmtub3duIHJlYXNvbiknXG5cbiAgaWYgKCFleGNlcHRpb24ubWFyaykgcmV0dXJuIG1lc3NhZ2VcblxuICBpZiAoZXhjZXB0aW9uLm1hcmsubmFtZSkge1xuICAgIHdoZXJlICs9ICdpbiBcIicgKyBleGNlcHRpb24ubWFyay5uYW1lICsgJ1wiICdcbiAgfVxuXG4gIHdoZXJlICs9ICcoJyArIChleGNlcHRpb24ubWFyay5saW5lICsgMSkgKyAnOicgKyAoZXhjZXB0aW9uLm1hcmsuY29sdW1uICsgMSkgKyAnKSdcblxuICBpZiAoIWNvbXBhY3QgJiYgZXhjZXB0aW9uLm1hcmsuc25pcHBldCkge1xuICAgIHdoZXJlICs9ICdcXG5cXG4nICsgZXhjZXB0aW9uLm1hcmsuc25pcHBldFxuICB9XG5cbiAgcmV0dXJuIG1lc3NhZ2UgKyAnICcgKyB3aGVyZVxufVxuXG5mdW5jdGlvbiBZQU1MRXhjZXB0aW9uIChyZWFzb24sIG1hcmspIHtcbiAgLy8gU3VwZXIgY29uc3RydWN0b3JcbiAgRXJyb3IuY2FsbCh0aGlzKVxuXG4gIHRoaXMubmFtZSA9ICdZQU1MRXhjZXB0aW9uJ1xuICB0aGlzLnJlYXNvbiA9IHJlYXNvblxuICB0aGlzLm1hcmsgPSBtYXJrXG4gIHRoaXMubWVzc2FnZSA9IGZvcm1hdEVycm9yKHRoaXMsIGZhbHNlKVxuXG4gIC8vIEluY2x1ZGUgc3RhY2sgdHJhY2UgaW4gZXJyb3Igb2JqZWN0XG4gIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuICAgIC8vIENocm9tZSBhbmQgTm9kZUpTXG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgdGhpcy5jb25zdHJ1Y3RvcilcbiAgfSBlbHNlIHtcbiAgICAvLyBGRiwgSUUgMTArIGFuZCBTYWZhcmkgNisuIEZhbGxiYWNrIGZvciBvdGhlcnNcbiAgICB0aGlzLnN0YWNrID0gKG5ldyBFcnJvcigpKS5zdGFjayB8fCAnJ1xuICB9XG59XG5cbi8vIEluaGVyaXQgZnJvbSBFcnJvclxuWUFNTEV4Y2VwdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSlcbllBTUxFeGNlcHRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gWUFNTEV4Y2VwdGlvblxuXG5ZQU1MRXhjZXB0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nIChjb21wYWN0KSB7XG4gIHJldHVybiB0aGlzLm5hbWUgKyAnOiAnICsgZm9ybWF0RXJyb3IodGhpcywgY29tcGFjdClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBZQU1MRXhjZXB0aW9uXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGNvbW1vbiA9IHJlcXVpcmUoJy4vY29tbW9uJylcblxuLy8gZ2V0IHNuaXBwZXQgZm9yIGEgc2luZ2xlIGxpbmUsIHJlc3BlY3RpbmcgbWF4TGVuZ3RoXG5mdW5jdGlvbiBnZXRMaW5lIChidWZmZXIsIGxpbmVTdGFydCwgbGluZUVuZCwgcG9zaXRpb24sIG1heExpbmVMZW5ndGgpIHtcbiAgbGV0IGhlYWQgPSAnJ1xuICBsZXQgdGFpbCA9ICcnXG4gIGNvbnN0IG1heEhhbGZMZW5ndGggPSBNYXRoLmZsb29yKG1heExpbmVMZW5ndGggLyAyKSAtIDFcblxuICBpZiAocG9zaXRpb24gLSBsaW5lU3RhcnQgPiBtYXhIYWxmTGVuZ3RoKSB7XG4gICAgaGVhZCA9ICcgLi4uICdcbiAgICBsaW5lU3RhcnQgPSBwb3NpdGlvbiAtIG1heEhhbGZMZW5ndGggKyBoZWFkLmxlbmd0aFxuICB9XG5cbiAgaWYgKGxpbmVFbmQgLSBwb3NpdGlvbiA+IG1heEhhbGZMZW5ndGgpIHtcbiAgICB0YWlsID0gJyAuLi4nXG4gICAgbGluZUVuZCA9IHBvc2l0aW9uICsgbWF4SGFsZkxlbmd0aCAtIHRhaWwubGVuZ3RoXG4gIH1cblxuICByZXR1cm4ge1xuICAgIHN0cjogaGVhZCArIGJ1ZmZlci5zbGljZShsaW5lU3RhcnQsIGxpbmVFbmQpLnJlcGxhY2UoL1xcdC9nLCAn4oaSJykgKyB0YWlsLFxuICAgIHBvczogcG9zaXRpb24gLSBsaW5lU3RhcnQgKyBoZWFkLmxlbmd0aCAvLyByZWxhdGl2ZSBwb3NpdGlvblxuICB9XG59XG5cbmZ1bmN0aW9uIHBhZFN0YXJ0IChzdHJpbmcsIG1heCkge1xuICByZXR1cm4gY29tbW9uLnJlcGVhdCgnICcsIG1heCAtIHN0cmluZy5sZW5ndGgpICsgc3RyaW5nXG59XG5cbmZ1bmN0aW9uIG1ha2VTbmlwcGV0IChtYXJrLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKG9wdGlvbnMgfHwgbnVsbClcblxuICBpZiAoIW1hcmsuYnVmZmVyKSByZXR1cm4gbnVsbFxuXG4gIGlmICghb3B0aW9ucy5tYXhMZW5ndGgpIG9wdGlvbnMubWF4TGVuZ3RoID0gNzlcbiAgaWYgKHR5cGVvZiBvcHRpb25zLmluZGVudCAhPT0gJ251bWJlcicpIG9wdGlvbnMuaW5kZW50ID0gMVxuICBpZiAodHlwZW9mIG9wdGlvbnMubGluZXNCZWZvcmUgIT09ICdudW1iZXInKSBvcHRpb25zLmxpbmVzQmVmb3JlID0gM1xuICBpZiAodHlwZW9mIG9wdGlvbnMubGluZXNBZnRlciAhPT0gJ251bWJlcicpIG9wdGlvbnMubGluZXNBZnRlciA9IDJcblxuICBjb25zdCByZSA9IC9cXHI/XFxufFxccnxcXDAvZ1xuICBjb25zdCBsaW5lU3RhcnRzID0gWzBdXG4gIGNvbnN0IGxpbmVFbmRzID0gW11cbiAgbGV0IG1hdGNoXG4gIGxldCBmb3VuZExpbmVObyA9IC0xXG5cbiAgd2hpbGUgKChtYXRjaCA9IHJlLmV4ZWMobWFyay5idWZmZXIpKSkge1xuICAgIGxpbmVFbmRzLnB1c2gobWF0Y2guaW5kZXgpXG4gICAgbGluZVN0YXJ0cy5wdXNoKG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKVxuXG4gICAgaWYgKG1hcmsucG9zaXRpb24gPD0gbWF0Y2guaW5kZXggJiYgZm91bmRMaW5lTm8gPCAwKSB7XG4gICAgICBmb3VuZExpbmVObyA9IGxpbmVTdGFydHMubGVuZ3RoIC0gMlxuICAgIH1cbiAgfVxuXG4gIGlmIChmb3VuZExpbmVObyA8IDApIGZvdW5kTGluZU5vID0gbGluZVN0YXJ0cy5sZW5ndGggLSAxXG5cbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGNvbnN0IGxpbmVOb0xlbmd0aCA9IE1hdGgubWluKG1hcmsubGluZSArIG9wdGlvbnMubGluZXNBZnRlciwgbGluZUVuZHMubGVuZ3RoKS50b1N0cmluZygpLmxlbmd0aFxuICBjb25zdCBtYXhMaW5lTGVuZ3RoID0gb3B0aW9ucy5tYXhMZW5ndGggLSAob3B0aW9ucy5pbmRlbnQgKyBsaW5lTm9MZW5ndGggKyAzKVxuXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IG9wdGlvbnMubGluZXNCZWZvcmU7IGkrKykge1xuICAgIGlmIChmb3VuZExpbmVObyAtIGkgPCAwKSBicmVha1xuICAgIGNvbnN0IGxpbmUgPSBnZXRMaW5lKFxuICAgICAgbWFyay5idWZmZXIsXG4gICAgICBsaW5lU3RhcnRzW2ZvdW5kTGluZU5vIC0gaV0sXG4gICAgICBsaW5lRW5kc1tmb3VuZExpbmVObyAtIGldLFxuICAgICAgbWFyay5wb3NpdGlvbiAtIChsaW5lU3RhcnRzW2ZvdW5kTGluZU5vXSAtIGxpbmVTdGFydHNbZm91bmRMaW5lTm8gLSBpXSksXG4gICAgICBtYXhMaW5lTGVuZ3RoXG4gICAgKVxuICAgIHJlc3VsdCA9IGNvbW1vbi5yZXBlYXQoJyAnLCBvcHRpb25zLmluZGVudCkgKyBwYWRTdGFydCgobWFyay5saW5lIC0gaSArIDEpLnRvU3RyaW5nKCksIGxpbmVOb0xlbmd0aCkgK1xuICAgICAgJyB8ICcgKyBsaW5lLnN0ciArICdcXG4nICsgcmVzdWx0XG4gIH1cblxuICBjb25zdCBsaW5lID0gZ2V0TGluZShtYXJrLmJ1ZmZlciwgbGluZVN0YXJ0c1tmb3VuZExpbmVOb10sIGxpbmVFbmRzW2ZvdW5kTGluZU5vXSwgbWFyay5wb3NpdGlvbiwgbWF4TGluZUxlbmd0aClcbiAgcmVzdWx0ICs9IGNvbW1vbi5yZXBlYXQoJyAnLCBvcHRpb25zLmluZGVudCkgKyBwYWRTdGFydCgobWFyay5saW5lICsgMSkudG9TdHJpbmcoKSwgbGluZU5vTGVuZ3RoKSArXG4gICAgJyB8ICcgKyBsaW5lLnN0ciArICdcXG4nXG4gIHJlc3VsdCArPSBjb21tb24ucmVwZWF0KCctJywgb3B0aW9ucy5pbmRlbnQgKyBsaW5lTm9MZW5ndGggKyAzICsgbGluZS5wb3MpICsgJ14nICsgJ1xcbidcblxuICBmb3IgKGxldCBpID0gMTsgaSA8PSBvcHRpb25zLmxpbmVzQWZ0ZXI7IGkrKykge1xuICAgIGlmIChmb3VuZExpbmVObyArIGkgPj0gbGluZUVuZHMubGVuZ3RoKSBicmVha1xuICAgIGNvbnN0IGxpbmUgPSBnZXRMaW5lKFxuICAgICAgbWFyay5idWZmZXIsXG4gICAgICBsaW5lU3RhcnRzW2ZvdW5kTGluZU5vICsgaV0sXG4gICAgICBsaW5lRW5kc1tmb3VuZExpbmVObyArIGldLFxuICAgICAgbWFyay5wb3NpdGlvbiAtIChsaW5lU3RhcnRzW2ZvdW5kTGluZU5vXSAtIGxpbmVTdGFydHNbZm91bmRMaW5lTm8gKyBpXSksXG4gICAgICBtYXhMaW5lTGVuZ3RoXG4gICAgKVxuICAgIHJlc3VsdCArPSBjb21tb24ucmVwZWF0KCcgJywgb3B0aW9ucy5pbmRlbnQpICsgcGFkU3RhcnQoKG1hcmsubGluZSArIGkgKyAxKS50b1N0cmluZygpLCBsaW5lTm9MZW5ndGgpICtcbiAgICAgICcgfCAnICsgbGluZS5zdHIgKyAnXFxuJ1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdC5yZXBsYWNlKC9cXG4kLywgJycpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFrZVNuaXBwZXRcbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgWUFNTEV4Y2VwdGlvbiA9IHJlcXVpcmUoJy4vZXhjZXB0aW9uJylcblxuY29uc3QgVFlQRV9DT05TVFJVQ1RPUl9PUFRJT05TID0gW1xuICAna2luZCcsXG4gICdtdWx0aScsXG4gICdyZXNvbHZlJyxcbiAgJ2NvbnN0cnVjdCcsXG4gICdpbnN0YW5jZU9mJyxcbiAgJ3ByZWRpY2F0ZScsXG4gICdyZXByZXNlbnQnLFxuICAncmVwcmVzZW50TmFtZScsXG4gICdkZWZhdWx0U3R5bGUnLFxuICAnc3R5bGVBbGlhc2VzJ1xuXVxuXG5jb25zdCBZQU1MX05PREVfS0lORFMgPSBbXG4gICdzY2FsYXInLFxuICAnc2VxdWVuY2UnLFxuICAnbWFwcGluZydcbl1cblxuZnVuY3Rpb24gY29tcGlsZVN0eWxlQWxpYXNlcyAobWFwKSB7XG4gIGNvbnN0IHJlc3VsdCA9IHt9XG5cbiAgaWYgKG1hcCAhPT0gbnVsbCkge1xuICAgIE9iamVjdC5rZXlzKG1hcCkuZm9yRWFjaChmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgIG1hcFtzdHlsZV0uZm9yRWFjaChmdW5jdGlvbiAoYWxpYXMpIHtcbiAgICAgICAgcmVzdWx0W1N0cmluZyhhbGlhcyldID0gc3R5bGVcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gVHlwZSAodGFnLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgT2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmIChUWVBFX0NPTlNUUlVDVE9SX09QVElPTlMuaW5kZXhPZihuYW1lKSA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKCdVbmtub3duIG9wdGlvbiBcIicgKyBuYW1lICsgJ1wiIGlzIG1ldCBpbiBkZWZpbml0aW9uIG9mIFwiJyArIHRhZyArICdcIiBZQU1MIHR5cGUuJylcbiAgICB9XG4gIH0pXG5cbiAgLy8gVE9ETzogQWRkIHRhZyBmb3JtYXQgY2hlY2suXG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgLy8ga2VlcCBvcmlnaW5hbCBvcHRpb25zIGluIGNhc2UgdXNlciB3YW50cyB0byBleHRlbmQgdGhpcyB0eXBlIGxhdGVyXG4gIHRoaXMudGFnID0gdGFnXG4gIHRoaXMua2luZCA9IG9wdGlvbnNbJ2tpbmQnXSB8fCBudWxsXG4gIHRoaXMucmVzb2x2ZSA9IG9wdGlvbnNbJ3Jlc29sdmUnXSB8fCBmdW5jdGlvbiAoKSB7IHJldHVybiB0cnVlIH1cbiAgdGhpcy5jb25zdHJ1Y3QgPSBvcHRpb25zWydjb25zdHJ1Y3QnXSB8fCBmdW5jdGlvbiAoZGF0YSkgeyByZXR1cm4gZGF0YSB9XG4gIHRoaXMuaW5zdGFuY2VPZiA9IG9wdGlvbnNbJ2luc3RhbmNlT2YnXSB8fCBudWxsXG4gIHRoaXMucHJlZGljYXRlID0gb3B0aW9uc1sncHJlZGljYXRlJ10gfHwgbnVsbFxuICB0aGlzLnJlcHJlc2VudCA9IG9wdGlvbnNbJ3JlcHJlc2VudCddIHx8IG51bGxcbiAgdGhpcy5yZXByZXNlbnROYW1lID0gb3B0aW9uc1sncmVwcmVzZW50TmFtZSddIHx8IG51bGxcbiAgdGhpcy5kZWZhdWx0U3R5bGUgPSBvcHRpb25zWydkZWZhdWx0U3R5bGUnXSB8fCBudWxsXG4gIHRoaXMubXVsdGkgPSBvcHRpb25zWydtdWx0aSddIHx8IGZhbHNlXG4gIHRoaXMuc3R5bGVBbGlhc2VzID0gY29tcGlsZVN0eWxlQWxpYXNlcyhvcHRpb25zWydzdHlsZUFsaWFzZXMnXSB8fCBudWxsKVxuXG4gIGlmIChZQU1MX05PREVfS0lORFMuaW5kZXhPZih0aGlzLmtpbmQpID09PSAtMSkge1xuICAgIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKCdVbmtub3duIGtpbmQgXCInICsgdGhpcy5raW5kICsgJ1wiIGlzIHNwZWNpZmllZCBmb3IgXCInICsgdGFnICsgJ1wiIFlBTUwgdHlwZS4nKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHlwZVxuIiwgIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBZQU1MRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9leGNlcHRpb24nKVxuY29uc3QgVHlwZSA9IHJlcXVpcmUoJy4vdHlwZScpXG5cbmZ1bmN0aW9uIGNvbXBpbGVMaXN0IChzY2hlbWEsIG5hbWUpIHtcbiAgY29uc3QgcmVzdWx0ID0gW11cblxuICBzY2hlbWFbbmFtZV0uZm9yRWFjaChmdW5jdGlvbiAoY3VycmVudFR5cGUpIHtcbiAgICBsZXQgbmV3SW5kZXggPSByZXN1bHQubGVuZ3RoXG5cbiAgICByZXN1bHQuZm9yRWFjaChmdW5jdGlvbiAocHJldmlvdXNUeXBlLCBwcmV2aW91c0luZGV4KSB7XG4gICAgICBpZiAocHJldmlvdXNUeXBlLnRhZyA9PT0gY3VycmVudFR5cGUudGFnICYmXG4gICAgICAgICAgcHJldmlvdXNUeXBlLmtpbmQgPT09IGN1cnJlbnRUeXBlLmtpbmQgJiZcbiAgICAgICAgICBwcmV2aW91c1R5cGUubXVsdGkgPT09IGN1cnJlbnRUeXBlLm11bHRpKSB7XG4gICAgICAgIG5ld0luZGV4ID0gcHJldmlvdXNJbmRleFxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXN1bHRbbmV3SW5kZXhdID0gY3VycmVudFR5cGVcbiAgfSlcblxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIGNvbXBpbGVNYXAgKC8qIGxpc3RzLi4uICovKSB7XG4gIGNvbnN0IHJlc3VsdCA9IHtcbiAgICBzY2FsYXI6IHt9LFxuICAgIHNlcXVlbmNlOiB7fSxcbiAgICBtYXBwaW5nOiB7fSxcbiAgICBmYWxsYmFjazoge30sXG4gICAgbXVsdGk6IHtcbiAgICAgIHNjYWxhcjogW10sXG4gICAgICBzZXF1ZW5jZTogW10sXG4gICAgICBtYXBwaW5nOiBbXSxcbiAgICAgIGZhbGxiYWNrOiBbXVxuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBjb2xsZWN0VHlwZSAodHlwZSkge1xuICAgIGlmICh0eXBlLm11bHRpKSB7XG4gICAgICByZXN1bHQubXVsdGlbdHlwZS5raW5kXS5wdXNoKHR5cGUpXG4gICAgICByZXN1bHQubXVsdGlbJ2ZhbGxiYWNrJ10ucHVzaCh0eXBlKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRbdHlwZS5raW5kXVt0eXBlLnRhZ10gPSByZXN1bHRbJ2ZhbGxiYWNrJ11bdHlwZS50YWddID0gdHlwZVxuICAgIH1cbiAgfVxuXG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBhcmd1bWVudHNbaW5kZXhdLmZvckVhY2goY29sbGVjdFR5cGUpXG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiBTY2hlbWEgKGRlZmluaXRpb24pIHtcbiAgcmV0dXJuIHRoaXMuZXh0ZW5kKGRlZmluaXRpb24pXG59XG5cblNjaGVtYS5wcm90b3R5cGUuZXh0ZW5kID0gZnVuY3Rpb24gZXh0ZW5kIChkZWZpbml0aW9uKSB7XG4gIGxldCBpbXBsaWNpdCA9IFtdXG4gIGxldCBleHBsaWNpdCA9IFtdXG5cbiAgaWYgKGRlZmluaXRpb24gaW5zdGFuY2VvZiBUeXBlKSB7XG4gICAgLy8gU2NoZW1hLmV4dGVuZCh0eXBlKVxuICAgIGV4cGxpY2l0LnB1c2goZGVmaW5pdGlvbilcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGRlZmluaXRpb24pKSB7XG4gICAgLy8gU2NoZW1hLmV4dGVuZChbIHR5cGUxLCB0eXBlMiwgLi4uIF0pXG4gICAgZXhwbGljaXQgPSBleHBsaWNpdC5jb25jYXQoZGVmaW5pdGlvbilcbiAgfSBlbHNlIGlmIChkZWZpbml0aW9uICYmIChBcnJheS5pc0FycmF5KGRlZmluaXRpb24uaW1wbGljaXQpIHx8IEFycmF5LmlzQXJyYXkoZGVmaW5pdGlvbi5leHBsaWNpdCkpKSB7XG4gICAgLy8gU2NoZW1hLmV4dGVuZCh7IGV4cGxpY2l0OiBbIHR5cGUxLCB0eXBlMiwgLi4uIF0sIGltcGxpY2l0OiBbIHR5cGUxLCB0eXBlMiwgLi4uIF0gfSlcbiAgICBpZiAoZGVmaW5pdGlvbi5pbXBsaWNpdCkgaW1wbGljaXQgPSBpbXBsaWNpdC5jb25jYXQoZGVmaW5pdGlvbi5pbXBsaWNpdClcbiAgICBpZiAoZGVmaW5pdGlvbi5leHBsaWNpdCkgZXhwbGljaXQgPSBleHBsaWNpdC5jb25jYXQoZGVmaW5pdGlvbi5leHBsaWNpdClcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignU2NoZW1hLmV4dGVuZCBhcmd1bWVudCBzaG91bGQgYmUgYSBUeXBlLCBbIFR5cGUgXSwgJyArXG4gICAgICAnb3IgYSBzY2hlbWEgZGVmaW5pdGlvbiAoeyBpbXBsaWNpdDogWy4uLl0sIGV4cGxpY2l0OiBbLi4uXSB9KScpXG4gIH1cblxuICBpbXBsaWNpdC5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgaWYgKCEodHlwZSBpbnN0YW5jZW9mIFR5cGUpKSB7XG4gICAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignU3BlY2lmaWVkIGxpc3Qgb2YgWUFNTCB0eXBlcyAob3IgYSBzaW5nbGUgVHlwZSBvYmplY3QpIGNvbnRhaW5zIGEgbm9uLVR5cGUgb2JqZWN0LicpXG4gICAgfVxuXG4gICAgaWYgKHR5cGUubG9hZEtpbmQgJiYgdHlwZS5sb2FkS2luZCAhPT0gJ3NjYWxhcicpIHtcbiAgICAgIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKCdUaGVyZSBpcyBhIG5vbi1zY2FsYXIgdHlwZSBpbiB0aGUgaW1wbGljaXQgbGlzdCBvZiBhIHNjaGVtYS4gSW1wbGljaXQgcmVzb2x2aW5nIG9mIHN1Y2ggdHlwZXMgaXMgbm90IHN1cHBvcnRlZC4nKVxuICAgIH1cblxuICAgIGlmICh0eXBlLm11bHRpKSB7XG4gICAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignVGhlcmUgaXMgYSBtdWx0aSB0eXBlIGluIHRoZSBpbXBsaWNpdCBsaXN0IG9mIGEgc2NoZW1hLiBNdWx0aSB0YWdzIGNhbiBvbmx5IGJlIGxpc3RlZCBhcyBleHBsaWNpdC4nKVxuICAgIH1cbiAgfSlcblxuICBleHBsaWNpdC5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgaWYgKCEodHlwZSBpbnN0YW5jZW9mIFR5cGUpKSB7XG4gICAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignU3BlY2lmaWVkIGxpc3Qgb2YgWUFNTCB0eXBlcyAob3IgYSBzaW5nbGUgVHlwZSBvYmplY3QpIGNvbnRhaW5zIGEgbm9uLVR5cGUgb2JqZWN0LicpXG4gICAgfVxuICB9KVxuXG4gIGNvbnN0IHJlc3VsdCA9IE9iamVjdC5jcmVhdGUoU2NoZW1hLnByb3RvdHlwZSlcblxuICByZXN1bHQuaW1wbGljaXQgPSAodGhpcy5pbXBsaWNpdCB8fCBbXSkuY29uY2F0KGltcGxpY2l0KVxuICByZXN1bHQuZXhwbGljaXQgPSAodGhpcy5leHBsaWNpdCB8fCBbXSkuY29uY2F0KGV4cGxpY2l0KVxuXG4gIHJlc3VsdC5jb21waWxlZEltcGxpY2l0ID0gY29tcGlsZUxpc3QocmVzdWx0LCAnaW1wbGljaXQnKVxuICByZXN1bHQuY29tcGlsZWRFeHBsaWNpdCA9IGNvbXBpbGVMaXN0KHJlc3VsdCwgJ2V4cGxpY2l0JylcbiAgcmVzdWx0LmNvbXBpbGVkVHlwZU1hcCA9IGNvbXBpbGVNYXAocmVzdWx0LmNvbXBpbGVkSW1wbGljaXQsIHJlc3VsdC5jb21waWxlZEV4cGxpY2l0KVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTY2hlbWFcbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgVHlwZSA9IHJlcXVpcmUoJy4uL3R5cGUnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBUeXBlKCd0YWc6eWFtbC5vcmcsMjAwMjpzdHInLCB7XG4gIGtpbmQ6ICdzY2FsYXInLFxuICBjb25zdHJ1Y3Q6IGZ1bmN0aW9uIChkYXRhKSB7IHJldHVybiBkYXRhICE9PSBudWxsID8gZGF0YSA6ICcnIH1cbn0pXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IFR5cGUgPSByZXF1aXJlKCcuLi90eXBlJylcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6c2VxJywge1xuICBraW5kOiAnc2VxdWVuY2UnLFxuICBjb25zdHJ1Y3Q6IGZ1bmN0aW9uIChkYXRhKSB7IHJldHVybiBkYXRhICE9PSBudWxsID8gZGF0YSA6IFtdIH1cbn0pXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IFR5cGUgPSByZXF1aXJlKCcuLi90eXBlJylcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6bWFwJywge1xuICBraW5kOiAnbWFwcGluZycsXG4gIGNvbnN0cnVjdDogZnVuY3Rpb24gKGRhdGEpIHsgcmV0dXJuIGRhdGEgIT09IG51bGwgPyBkYXRhIDoge30gfVxufSlcbiIsICIvLyBTdGFuZGFyZCBZQU1MJ3MgRmFpbHNhZmUgc2NoZW1hLlxuLy8gaHR0cDovL3d3dy55YW1sLm9yZy9zcGVjLzEuMi9zcGVjLmh0bWwjaWQyODAyMzQ2XG5cbid1c2Ugc3RyaWN0J1xuXG5jb25zdCBTY2hlbWEgPSByZXF1aXJlKCcuLi9zY2hlbWEnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTY2hlbWEoe1xuICBleHBsaWNpdDogW1xuICAgIHJlcXVpcmUoJy4uL3R5cGUvc3RyJyksXG4gICAgcmVxdWlyZSgnLi4vdHlwZS9zZXEnKSxcbiAgICByZXF1aXJlKCcuLi90eXBlL21hcCcpXG4gIF1cbn0pXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IFR5cGUgPSByZXF1aXJlKCcuLi90eXBlJylcblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxOdWxsIChkYXRhKSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gdHJ1ZVxuXG4gIGNvbnN0IG1heCA9IGRhdGEubGVuZ3RoXG5cbiAgcmV0dXJuIChtYXggPT09IDEgJiYgZGF0YSA9PT0gJ34nKSB8fFxuICAgICAgICAgKG1heCA9PT0gNCAmJiAoZGF0YSA9PT0gJ251bGwnIHx8IGRhdGEgPT09ICdOdWxsJyB8fCBkYXRhID09PSAnTlVMTCcpKVxufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sTnVsbCAoKSB7XG4gIHJldHVybiBudWxsXG59XG5cbmZ1bmN0aW9uIGlzTnVsbCAob2JqZWN0KSB7XG4gIHJldHVybiBvYmplY3QgPT09IG51bGxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6bnVsbCcsIHtcbiAga2luZDogJ3NjYWxhcicsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sTnVsbCxcbiAgY29uc3RydWN0OiBjb25zdHJ1Y3RZYW1sTnVsbCxcbiAgcHJlZGljYXRlOiBpc051bGwsXG4gIHJlcHJlc2VudDoge1xuICAgIGNhbm9uaWNhbDogZnVuY3Rpb24gKCkgeyByZXR1cm4gJ34nIH0sXG4gICAgbG93ZXJjYXNlOiBmdW5jdGlvbiAoKSB7IHJldHVybiAnbnVsbCcgfSxcbiAgICB1cHBlcmNhc2U6IGZ1bmN0aW9uICgpIHsgcmV0dXJuICdOVUxMJyB9LFxuICAgIGNhbWVsY2FzZTogZnVuY3Rpb24gKCkgeyByZXR1cm4gJ051bGwnIH0sXG4gICAgZW1wdHk6IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcnIH1cbiAgfSxcbiAgZGVmYXVsdFN0eWxlOiAnbG93ZXJjYXNlJ1xufSlcbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgVHlwZSA9IHJlcXVpcmUoJy4uL3R5cGUnKVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEJvb2xlYW4gKGRhdGEpIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiBmYWxzZVxuXG4gIGNvbnN0IG1heCA9IGRhdGEubGVuZ3RoXG5cbiAgcmV0dXJuIChtYXggPT09IDQgJiYgKGRhdGEgPT09ICd0cnVlJyB8fCBkYXRhID09PSAnVHJ1ZScgfHwgZGF0YSA9PT0gJ1RSVUUnKSkgfHxcbiAgICAgICAgIChtYXggPT09IDUgJiYgKGRhdGEgPT09ICdmYWxzZScgfHwgZGF0YSA9PT0gJ0ZhbHNlJyB8fCBkYXRhID09PSAnRkFMU0UnKSlcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0WWFtbEJvb2xlYW4gKGRhdGEpIHtcbiAgcmV0dXJuIGRhdGEgPT09ICd0cnVlJyB8fFxuICAgICAgICAgZGF0YSA9PT0gJ1RydWUnIHx8XG4gICAgICAgICBkYXRhID09PSAnVFJVRSdcbn1cblxuZnVuY3Rpb24gaXNCb29sZWFuIChvYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09PSAnW29iamVjdCBCb29sZWFuXSdcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsIHtcbiAga2luZDogJ3NjYWxhcicsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sQm9vbGVhbixcbiAgY29uc3RydWN0OiBjb25zdHJ1Y3RZYW1sQm9vbGVhbixcbiAgcHJlZGljYXRlOiBpc0Jvb2xlYW4sXG4gIHJlcHJlc2VudDoge1xuICAgIGxvd2VyY2FzZTogZnVuY3Rpb24gKG9iamVjdCkgeyByZXR1cm4gb2JqZWN0ID8gJ3RydWUnIDogJ2ZhbHNlJyB9LFxuICAgIHVwcGVyY2FzZTogZnVuY3Rpb24gKG9iamVjdCkgeyByZXR1cm4gb2JqZWN0ID8gJ1RSVUUnIDogJ0ZBTFNFJyB9LFxuICAgIGNhbWVsY2FzZTogZnVuY3Rpb24gKG9iamVjdCkgeyByZXR1cm4gb2JqZWN0ID8gJ1RydWUnIDogJ0ZhbHNlJyB9XG4gIH0sXG4gIGRlZmF1bHRTdHlsZTogJ2xvd2VyY2FzZSdcbn0pXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGNvbW1vbiA9IHJlcXVpcmUoJy4uL2NvbW1vbicpXG5jb25zdCBUeXBlID0gcmVxdWlyZSgnLi4vdHlwZScpXG5cbmZ1bmN0aW9uIGlzSGV4Q29kZSAoYykge1xuICByZXR1cm4gKChjID49IDB4MzAvKiAwICovKSAmJiAoYyA8PSAweDM5LyogOSAqLykpIHx8XG4gICAgICAgICAoKGMgPj0gMHg0MS8qIEEgKi8pICYmIChjIDw9IDB4NDYvKiBGICovKSkgfHxcbiAgICAgICAgICgoYyA+PSAweDYxLyogYSAqLykgJiYgKGMgPD0gMHg2Ni8qIGYgKi8pKVxufVxuXG5mdW5jdGlvbiBpc09jdENvZGUgKGMpIHtcbiAgcmV0dXJuICgoYyA+PSAweDMwLyogMCAqLykgJiYgKGMgPD0gMHgzNy8qIDcgKi8pKVxufVxuXG5mdW5jdGlvbiBpc0RlY0NvZGUgKGMpIHtcbiAgcmV0dXJuICgoYyA+PSAweDMwLyogMCAqLykgJiYgKGMgPD0gMHgzOS8qIDkgKi8pKVxufVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEludGVnZXIgKGRhdGEpIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiBmYWxzZVxuXG4gIGNvbnN0IG1heCA9IGRhdGEubGVuZ3RoXG4gIGxldCBpbmRleCA9IDBcbiAgbGV0IGhhc0RpZ2l0cyA9IGZhbHNlXG5cbiAgaWYgKCFtYXgpIHJldHVybiBmYWxzZVxuXG4gIGxldCBjaCA9IGRhdGFbaW5kZXhdXG5cbiAgLy8gc2lnblxuICBpZiAoY2ggPT09ICctJyB8fCBjaCA9PT0gJysnKSB7XG4gICAgY2ggPSBkYXRhWysraW5kZXhdXG4gIH1cblxuICBpZiAoY2ggPT09ICcwJykge1xuICAgIC8vIDBcbiAgICBpZiAoaW5kZXggKyAxID09PSBtYXgpIHJldHVybiB0cnVlXG4gICAgY2ggPSBkYXRhWysraW5kZXhdXG5cbiAgICAvLyBiYXNlIDIsIGJhc2UgOCwgYmFzZSAxNlxuXG4gICAgaWYgKGNoID09PSAnYicpIHtcbiAgICAgIC8vIGJhc2UgMlxuICAgICAgaW5kZXgrK1xuXG4gICAgICBmb3IgKDsgaW5kZXggPCBtYXg7IGluZGV4KyspIHtcbiAgICAgICAgY2ggPSBkYXRhW2luZGV4XVxuICAgICAgICBpZiAoY2ggIT09ICcwJyAmJiBjaCAhPT0gJzEnKSByZXR1cm4gZmFsc2VcbiAgICAgICAgaGFzRGlnaXRzID0gdHJ1ZVxuICAgICAgfVxuICAgICAgcmV0dXJuIGhhc0RpZ2l0cyAmJiBOdW1iZXIuaXNGaW5pdGUocGFyc2VZYW1sSW50ZWdlcihkYXRhKSlcbiAgICB9XG5cbiAgICBpZiAoY2ggPT09ICd4Jykge1xuICAgICAgLy8gYmFzZSAxNlxuICAgICAgaW5kZXgrK1xuXG4gICAgICBmb3IgKDsgaW5kZXggPCBtYXg7IGluZGV4KyspIHtcbiAgICAgICAgaWYgKCFpc0hleENvZGUoZGF0YS5jaGFyQ29kZUF0KGluZGV4KSkpIHJldHVybiBmYWxzZVxuICAgICAgICBoYXNEaWdpdHMgPSB0cnVlXG4gICAgICB9XG4gICAgICByZXR1cm4gaGFzRGlnaXRzICYmIE51bWJlci5pc0Zpbml0ZShwYXJzZVlhbWxJbnRlZ2VyKGRhdGEpKVxuICAgIH1cblxuICAgIGlmIChjaCA9PT0gJ28nKSB7XG4gICAgICAvLyBiYXNlIDhcbiAgICAgIGluZGV4KytcblxuICAgICAgZm9yICg7IGluZGV4IDwgbWF4OyBpbmRleCsrKSB7XG4gICAgICAgIGlmICghaXNPY3RDb2RlKGRhdGEuY2hhckNvZGVBdChpbmRleCkpKSByZXR1cm4gZmFsc2VcbiAgICAgICAgaGFzRGlnaXRzID0gdHJ1ZVxuICAgICAgfVxuICAgICAgcmV0dXJuIGhhc0RpZ2l0cyAmJiBOdW1iZXIuaXNGaW5pdGUocGFyc2VZYW1sSW50ZWdlcihkYXRhKSlcbiAgICB9XG4gIH1cblxuICAvLyBiYXNlIDEwIChleGNlcHQgMClcblxuICBmb3IgKDsgaW5kZXggPCBtYXg7IGluZGV4KyspIHtcbiAgICBpZiAoIWlzRGVjQ29kZShkYXRhLmNoYXJDb2RlQXQoaW5kZXgpKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGhhc0RpZ2l0cyA9IHRydWVcbiAgfVxuXG4gIGlmICghaGFzRGlnaXRzKSByZXR1cm4gZmFsc2VcblxuICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHBhcnNlWWFtbEludGVnZXIoZGF0YSkpXG59XG5cbmZ1bmN0aW9uIHBhcnNlWWFtbEludGVnZXIgKGRhdGEpIHtcbiAgbGV0IHZhbHVlID0gZGF0YVxuICBsZXQgc2lnbiA9IDFcblxuICBsZXQgY2ggPSB2YWx1ZVswXVxuXG4gIGlmIChjaCA9PT0gJy0nIHx8IGNoID09PSAnKycpIHtcbiAgICBpZiAoY2ggPT09ICctJykgc2lnbiA9IC0xXG4gICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgxKVxuICAgIGNoID0gdmFsdWVbMF1cbiAgfVxuXG4gIGlmICh2YWx1ZSA9PT0gJzAnKSByZXR1cm4gMFxuXG4gIGlmIChjaCA9PT0gJzAnKSB7XG4gICAgaWYgKHZhbHVlWzFdID09PSAnYicpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIDIpXG4gICAgaWYgKHZhbHVlWzFdID09PSAneCcpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIDE2KVxuICAgIGlmICh2YWx1ZVsxXSA9PT0gJ28nKSByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCA4KVxuICB9XG5cbiAgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZSwgMTApXG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdFlhbWxJbnRlZ2VyIChkYXRhKSB7XG4gIHJldHVybiBwYXJzZVlhbWxJbnRlZ2VyKGRhdGEpXG59XG5cbmZ1bmN0aW9uIGlzSW50ZWdlciAob2JqZWN0KSB7XG4gIHJldHVybiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkpID09PSAnW29iamVjdCBOdW1iZXJdJyAmJlxuICAgICAgICAgKG9iamVjdCAlIDEgPT09IDAgJiYgIWNvbW1vbi5pc05lZ2F0aXZlWmVybyhvYmplY3QpKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBUeXBlKCd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLCB7XG4gIGtpbmQ6ICdzY2FsYXInLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbEludGVnZXIsXG4gIGNvbnN0cnVjdDogY29uc3RydWN0WWFtbEludGVnZXIsXG4gIHByZWRpY2F0ZTogaXNJbnRlZ2VyLFxuICByZXByZXNlbnQ6IHtcbiAgICBiaW5hcnk6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiA+PSAwID8gJzBiJyArIG9iai50b1N0cmluZygyKSA6ICctMGInICsgb2JqLnRvU3RyaW5nKDIpLnNsaWNlKDEpIH0sXG4gICAgb2N0YWw6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiA+PSAwID8gJzBvJyArIG9iai50b1N0cmluZyg4KSA6ICctMG8nICsgb2JqLnRvU3RyaW5nKDgpLnNsaWNlKDEpIH0sXG4gICAgZGVjaW1hbDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqLnRvU3RyaW5nKDEwKSB9LFxuICAgIGhleGFkZWNpbWFsOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogPj0gMCA/ICcweCcgKyBvYmoudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCkgOiAnLTB4JyArIG9iai50b1N0cmluZygxNikudG9VcHBlckNhc2UoKS5zbGljZSgxKSB9XG4gIH0sXG4gIGRlZmF1bHRTdHlsZTogJ2RlY2ltYWwnLFxuICBzdHlsZUFsaWFzZXM6IHtcbiAgICBiaW5hcnk6IFsyLCAnYmluJ10sXG4gICAgb2N0YWw6IFs4LCAnb2N0J10sXG4gICAgZGVjaW1hbDogWzEwLCAnZGVjJ10sXG4gICAgaGV4YWRlY2ltYWw6IFsxNiwgJ2hleCddXG4gIH1cbn0pXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGNvbW1vbiA9IHJlcXVpcmUoJy4uL2NvbW1vbicpXG5jb25zdCBUeXBlID0gcmVxdWlyZSgnLi4vdHlwZScpXG5cbmNvbnN0IFlBTUxfRkxPQVRfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gIC8vIDIuNWU0LCAyLjUgYW5kIGludGVnZXJzXG4gICdeKD86Wy0rXT8oPzpbMC05XSspKD86XFxcXC5bMC05XSopPyg/OltlRV1bLStdP1swLTldKyk/JyArXG4gIC8vIC4yZTQsIC4yXG4gIC8vIHNwZWNpYWwgY2FzZSwgc2VlbXMgbm90IGZyb20gc3BlY1xuICAnfFxcXFwuWzAtOV0rKD86W2VFXVstK10/WzAtOV0rKT8nICtcbiAgLy8gLmluZlxuICAnfFstK10/XFxcXC4oPzppbmZ8SW5mfElORiknICtcbiAgLy8gLm5hblxuICAnfFxcXFwuKD86bmFufE5hTnxOQU4pKSQnKVxuXG5jb25zdCBZQU1MX0ZMT0FUX1NQRUNJQUxfUEFUVEVSTiA9IG5ldyBSZWdFeHAoXG4gICdeKD86JyArXG4gIC8vIC5pbmZcbiAgJ1stK10/XFxcXC4oPzppbmZ8SW5mfElORiknICtcbiAgLy8gLm5hblxuICAnfFxcXFwuKD86bmFufE5hTnxOQU4pKSQnKVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEZsb2F0IChkYXRhKSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gZmFsc2VcblxuICBpZiAoIVlBTUxfRkxPQVRfUEFUVEVSTi50ZXN0KGRhdGEpKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoTnVtYmVyLmlzRmluaXRlKHBhcnNlRmxvYXQoZGF0YSwgMTApKSkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICByZXR1cm4gWUFNTF9GTE9BVF9TUEVDSUFMX1BBVFRFUk4udGVzdChkYXRhKVxufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sRmxvYXQgKGRhdGEpIHtcbiAgbGV0IHZhbHVlID0gZGF0YS50b0xvd2VyQ2FzZSgpXG4gIGNvbnN0IHNpZ24gPSB2YWx1ZVswXSA9PT0gJy0nID8gLTEgOiAxXG5cbiAgaWYgKCcrLScuaW5kZXhPZih2YWx1ZVswXSkgPj0gMCkge1xuICAgIHZhbHVlID0gdmFsdWUuc2xpY2UoMSlcbiAgfVxuXG4gIGlmICh2YWx1ZSA9PT0gJy5pbmYnKSB7XG4gICAgcmV0dXJuIChzaWduID09PSAxKSA/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA6IE51bWJlci5ORUdBVElWRV9JTkZJTklUWVxuICB9IGVsc2UgaWYgKHZhbHVlID09PSAnLm5hbicpIHtcbiAgICByZXR1cm4gTmFOXG4gIH1cbiAgcmV0dXJuIHNpZ24gKiBwYXJzZUZsb2F0KHZhbHVlLCAxMClcbn1cblxuY29uc3QgU0NJRU5USUZJQ19XSVRIT1VUX0RPVCA9IC9eWy0rXT9bMC05XStlL1xuXG5mdW5jdGlvbiByZXByZXNlbnRZYW1sRmxvYXQgKG9iamVjdCwgc3R5bGUpIHtcbiAgaWYgKGlzTmFOKG9iamVjdCkpIHtcbiAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICBjYXNlICdsb3dlcmNhc2UnOiByZXR1cm4gJy5uYW4nXG4gICAgICBjYXNlICd1cHBlcmNhc2UnOiByZXR1cm4gJy5OQU4nXG4gICAgICBjYXNlICdjYW1lbGNhc2UnOiByZXR1cm4gJy5OYU4nXG4gICAgfVxuICB9IGVsc2UgaWYgKE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA9PT0gb2JqZWN0KSB7XG4gICAgc3dpdGNoIChzdHlsZSkge1xuICAgICAgY2FzZSAnbG93ZXJjYXNlJzogcmV0dXJuICcuaW5mJ1xuICAgICAgY2FzZSAndXBwZXJjYXNlJzogcmV0dXJuICcuSU5GJ1xuICAgICAgY2FzZSAnY2FtZWxjYXNlJzogcmV0dXJuICcuSW5mJ1xuICAgIH1cbiAgfSBlbHNlIGlmIChOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkgPT09IG9iamVjdCkge1xuICAgIHN3aXRjaCAoc3R5bGUpIHtcbiAgICAgIGNhc2UgJ2xvd2VyY2FzZSc6IHJldHVybiAnLS5pbmYnXG4gICAgICBjYXNlICd1cHBlcmNhc2UnOiByZXR1cm4gJy0uSU5GJ1xuICAgICAgY2FzZSAnY2FtZWxjYXNlJzogcmV0dXJuICctLkluZidcbiAgICB9XG4gIH0gZWxzZSBpZiAoY29tbW9uLmlzTmVnYXRpdmVaZXJvKG9iamVjdCkpIHtcbiAgICByZXR1cm4gJy0wLjAnXG4gIH1cblxuICBjb25zdCByZXMgPSBvYmplY3QudG9TdHJpbmcoMTApXG5cbiAgLy8gSlMgc3RyaW5naWZpZXIgY2FuIGJ1aWxkIHNjaWVudGlmaWMgZm9ybWF0IHdpdGhvdXQgZG90czogNWUtMTAwLFxuICAvLyB3aGlsZSBZQU1MIHJlcXVyZXMgZG90OiA1LmUtMTAwLiBGaXggaXQgd2l0aCBzaW1wbGUgaGFja1xuXG4gIHJldHVybiBTQ0lFTlRJRklDX1dJVEhPVVRfRE9ULnRlc3QocmVzKSA/IHJlcy5yZXBsYWNlKCdlJywgJy5lJykgOiByZXNcbn1cblxuZnVuY3Rpb24gaXNGbG9hdCAob2JqZWN0KSB7XG4gIHJldHVybiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT09ICdbb2JqZWN0IE51bWJlcl0nKSAmJlxuICAgICAgICAgKG9iamVjdCAlIDEgIT09IDAgfHwgY29tbW9uLmlzTmVnYXRpdmVaZXJvKG9iamVjdCkpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFR5cGUoJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0Jywge1xuICBraW5kOiAnc2NhbGFyJyxcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxGbG9hdCxcbiAgY29uc3RydWN0OiBjb25zdHJ1Y3RZYW1sRmxvYXQsXG4gIHByZWRpY2F0ZTogaXNGbG9hdCxcbiAgcmVwcmVzZW50OiByZXByZXNlbnRZYW1sRmxvYXQsXG4gIGRlZmF1bHRTdHlsZTogJ2xvd2VyY2FzZSdcbn0pXG4iLCAiLy8gU3RhbmRhcmQgWUFNTCdzIEpTT04gc2NoZW1hLlxuLy8gaHR0cDovL3d3dy55YW1sLm9yZy9zcGVjLzEuMi9zcGVjLmh0bWwjaWQyODAzMjMxXG4vL1xuLy8gTk9URTogSlMtWUFNTCBkb2VzIG5vdCBzdXBwb3J0IHNjaGVtYS1zcGVjaWZpYyB0YWcgcmVzb2x1dGlvbiByZXN0cmljdGlvbnMuXG4vLyBTbywgdGhpcyBzY2hlbWEgaXMgbm90IHN1Y2ggc3RyaWN0IGFzIGRlZmluZWQgaW4gdGhlIFlBTUwgc3BlY2lmaWNhdGlvbi5cbi8vIEl0IGFsbG93cyBudW1iZXJzIGluIGJpbmFyeSBub3RhaW9uLCB1c2UgYE51bGxgIGFuZCBgTlVMTGAgYXMgYG51bGxgLCBldGMuXG5cbid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZmFpbHNhZmUnKS5leHRlbmQoe1xuICBpbXBsaWNpdDogW1xuICAgIHJlcXVpcmUoJy4uL3R5cGUvbnVsbCcpLFxuICAgIHJlcXVpcmUoJy4uL3R5cGUvYm9vbCcpLFxuICAgIHJlcXVpcmUoJy4uL3R5cGUvaW50JyksXG4gICAgcmVxdWlyZSgnLi4vdHlwZS9mbG9hdCcpXG4gIF1cbn0pXG4iLCAiLy8gU3RhbmRhcmQgWUFNTCdzIENvcmUgc2NoZW1hLlxuLy8gaHR0cDovL3d3dy55YW1sLm9yZy9zcGVjLzEuMi9zcGVjLmh0bWwjaWQyODA0OTIzXG4vL1xuLy8gTk9URTogSlMtWUFNTCBkb2VzIG5vdCBzdXBwb3J0IHNjaGVtYS1zcGVjaWZpYyB0YWcgcmVzb2x1dGlvbiByZXN0cmljdGlvbnMuXG4vLyBTbywgQ29yZSBzY2hlbWEgaGFzIG5vIGRpc3RpbmN0aW9ucyBmcm9tIEpTT04gc2NoZW1hIGlzIEpTLVlBTUwuXG5cbid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vanNvbicpXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IFR5cGUgPSByZXF1aXJlKCcuLi90eXBlJylcblxuY29uc3QgWUFNTF9EQVRFX1JFR0VYUCA9IG5ldyBSZWdFeHAoXG4gICdeKFswLTldWzAtOV1bMC05XVswLTldKScgKyAvLyBbMV0geWVhclxuICAnLShbMC05XVswLTldKScgKyAvLyBbMl0gbW9udGhcbiAgJy0oWzAtOV1bMC05XSkkJykgICAgICAgICAgICAgICAgICAgLy8gWzNdIGRheVxuXG5jb25zdCBZQU1MX1RJTUVTVEFNUF9SRUdFWFAgPSBuZXcgUmVnRXhwKFxuICAnXihbMC05XVswLTldWzAtOV1bMC05XSknICsgLy8gWzFdIHllYXJcbiAgJy0oWzAtOV1bMC05XT8pJyArIC8vIFsyXSBtb250aFxuICAnLShbMC05XVswLTldPyknICsgLy8gWzNdIGRheVxuICAnKD86W1R0XXxbIFxcXFx0XSspJyArIC8vIC4uLlxuICAnKFswLTldWzAtOV0/KScgKyAvLyBbNF0gaG91clxuICAnOihbMC05XVswLTldKScgKyAvLyBbNV0gbWludXRlXG4gICc6KFswLTldWzAtOV0pJyArIC8vIFs2XSBzZWNvbmRcbiAgJyg/OlxcXFwuKFswLTldKikpPycgKyAvLyBbN10gZnJhY3Rpb25cbiAgJyg/OlsgXFxcXHRdKihafChbLStdKShbMC05XVswLTldPyknICsgLy8gWzhdIHR6IFs5XSB0el9zaWduIFsxMF0gdHpIb3VyXG4gICcoPzo6KFswLTldWzAtOV0pKT8pKT8kJykgICAgICAgICAgIC8vIFsxMV0gdHpNaW51dGVcblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxUaW1lc3RhbXAgKGRhdGEpIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiBmYWxzZVxuICBpZiAoWUFNTF9EQVRFX1JFR0VYUC5leGVjKGRhdGEpICE9PSBudWxsKSByZXR1cm4gdHJ1ZVxuICBpZiAoWUFNTF9USU1FU1RBTVBfUkVHRVhQLmV4ZWMoZGF0YSkgIT09IG51bGwpIHJldHVybiB0cnVlXG4gIHJldHVybiBmYWxzZVxufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sVGltZXN0YW1wIChkYXRhKSB7XG4gIGxldCBmcmFjdGlvbiA9IDBcbiAgbGV0IGRlbHRhID0gbnVsbFxuXG4gIGxldCBtYXRjaCA9IFlBTUxfREFURV9SRUdFWFAuZXhlYyhkYXRhKVxuICBpZiAobWF0Y2ggPT09IG51bGwpIG1hdGNoID0gWUFNTF9USU1FU1RBTVBfUkVHRVhQLmV4ZWMoZGF0YSlcblxuICBpZiAobWF0Y2ggPT09IG51bGwpIHRocm93IG5ldyBFcnJvcignRGF0ZSByZXNvbHZlIGVycm9yJylcblxuICAvLyBtYXRjaDogWzFdIHllYXIgWzJdIG1vbnRoIFszXSBkYXlcblxuICBjb25zdCB5ZWFyID0gKyhtYXRjaFsxXSlcbiAgY29uc3QgbW9udGggPSArKG1hdGNoWzJdKSAtIDEgLy8gSlMgbW9udGggc3RhcnRzIHdpdGggMFxuICBjb25zdCBkYXkgPSArKG1hdGNoWzNdKVxuXG4gIGlmICghbWF0Y2hbNF0pIHsgLy8gbm8gaG91clxuICAgIHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQyh5ZWFyLCBtb250aCwgZGF5KSlcbiAgfVxuXG4gIC8vIG1hdGNoOiBbNF0gaG91ciBbNV0gbWludXRlIFs2XSBzZWNvbmQgWzddIGZyYWN0aW9uXG5cbiAgY29uc3QgaG91ciA9ICsobWF0Y2hbNF0pXG4gIGNvbnN0IG1pbnV0ZSA9ICsobWF0Y2hbNV0pXG4gIGNvbnN0IHNlY29uZCA9ICsobWF0Y2hbNl0pXG5cbiAgaWYgKG1hdGNoWzddKSB7XG4gICAgZnJhY3Rpb24gPSBtYXRjaFs3XS5zbGljZSgwLCAzKVxuICAgIHdoaWxlIChmcmFjdGlvbi5sZW5ndGggPCAzKSB7IC8vIG1pbGxpLXNlY29uZHNcbiAgICAgIGZyYWN0aW9uICs9ICcwJ1xuICAgIH1cbiAgICBmcmFjdGlvbiA9ICtmcmFjdGlvblxuICB9XG5cbiAgLy8gbWF0Y2g6IFs4XSB0eiBbOV0gdHpfc2lnbiBbMTBdIHR6SG91ciBbMTFdIHR6TWludXRlXG5cbiAgaWYgKG1hdGNoWzldKSB7XG4gICAgY29uc3QgdHpIb3VyID0gKyhtYXRjaFsxMF0pXG4gICAgY29uc3QgdHpNaW51dGUgPSArKG1hdGNoWzExXSB8fCAwKVxuICAgIGRlbHRhID0gKHR6SG91ciAqIDYwICsgdHpNaW51dGUpICogNjAwMDAgLy8gZGVsdGEgaW4gbWlsaS1zZWNvbmRzXG4gICAgaWYgKG1hdGNoWzldID09PSAnLScpIGRlbHRhID0gLWRlbHRhXG4gIH1cblxuICBjb25zdCBkYXRlID0gbmV3IERhdGUoRGF0ZS5VVEMoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIGZyYWN0aW9uKSlcblxuICBpZiAoZGVsdGEpIGRhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSAtIGRlbHRhKVxuXG4gIHJldHVybiBkYXRlXG59XG5cbmZ1bmN0aW9uIHJlcHJlc2VudFlhbWxUaW1lc3RhbXAgKG9iamVjdCAvKiwgc3R5bGUgKi8pIHtcbiAgcmV0dXJuIG9iamVjdC50b0lTT1N0cmluZygpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFR5cGUoJ3RhZzp5YW1sLm9yZywyMDAyOnRpbWVzdGFtcCcsIHtcbiAga2luZDogJ3NjYWxhcicsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sVGltZXN0YW1wLFxuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdFlhbWxUaW1lc3RhbXAsXG4gIGluc3RhbmNlT2Y6IERhdGUsXG4gIHJlcHJlc2VudDogcmVwcmVzZW50WWFtbFRpbWVzdGFtcFxufSlcbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgVHlwZSA9IHJlcXVpcmUoJy4uL3R5cGUnKVxuXG5mdW5jdGlvbiByZXNvbHZlWWFtbE1lcmdlIChkYXRhKSB7XG4gIHJldHVybiBkYXRhID09PSAnPDwnIHx8IGRhdGEgPT09IG51bGxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6bWVyZ2UnLCB7XG4gIGtpbmQ6ICdzY2FsYXInLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbE1lcmdlXG59KVxuIiwgIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBUeXBlID0gcmVxdWlyZSgnLi4vdHlwZScpXG5cbi8vIFsgNjQsIDY1LCA2NiBdIC0+IFsgcGFkZGluZywgQ1IsIExGIF1cbmNvbnN0IEJBU0U2NF9NQVAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz1cXG5cXHInXG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sQmluYXJ5IChkYXRhKSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gZmFsc2VcblxuICBsZXQgYml0bGVuID0gMFxuICBjb25zdCBtYXggPSBkYXRhLmxlbmd0aFxuICBjb25zdCBtYXAgPSBCQVNFNjRfTUFQXG5cbiAgLy8gQ29udmVydCBvbmUgYnkgb25lLlxuICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBtYXg7IGlkeCsrKSB7XG4gICAgY29uc3QgY29kZSA9IG1hcC5pbmRleE9mKGRhdGEuY2hhckF0KGlkeCkpXG5cbiAgICAvLyBTa2lwIENSL0xGXG4gICAgaWYgKGNvZGUgPiA2NCkgY29udGludWVcblxuICAgIC8vIEZhaWwgb24gaWxsZWdhbCBjaGFyYWN0ZXJzXG4gICAgaWYgKGNvZGUgPCAwKSByZXR1cm4gZmFsc2VcblxuICAgIGJpdGxlbiArPSA2XG4gIH1cblxuICAvLyBJZiB0aGVyZSBhcmUgYW55IGJpdHMgbGVmdCwgc291cmNlIHdhcyBjb3JydXB0ZWRcbiAgcmV0dXJuIChiaXRsZW4gJSA4KSA9PT0gMFxufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sQmluYXJ5IChkYXRhKSB7XG4gIGNvbnN0IGlucHV0ID0gZGF0YS5yZXBsYWNlKC9bXFxyXFxuPV0vZywgJycpIC8vIHJlbW92ZSBDUi9MRiAmIHBhZGRpbmcgdG8gc2ltcGxpZnkgc2NhblxuICBjb25zdCBtYXggPSBpbnB1dC5sZW5ndGhcbiAgY29uc3QgbWFwID0gQkFTRTY0X01BUFxuICBsZXQgYml0cyA9IDBcbiAgY29uc3QgcmVzdWx0ID0gW11cblxuICAvLyBDb2xsZWN0IGJ5IDYqNCBiaXRzICgzIGJ5dGVzKVxuXG4gIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IG1heDsgaWR4KyspIHtcbiAgICBpZiAoKGlkeCAlIDQgPT09IDApICYmIGlkeCkge1xuICAgICAgcmVzdWx0LnB1c2goKGJpdHMgPj4gMTYpICYgMHhGRilcbiAgICAgIHJlc3VsdC5wdXNoKChiaXRzID4+IDgpICYgMHhGRilcbiAgICAgIHJlc3VsdC5wdXNoKGJpdHMgJiAweEZGKVxuICAgIH1cblxuICAgIGJpdHMgPSAoYml0cyA8PCA2KSB8IG1hcC5pbmRleE9mKGlucHV0LmNoYXJBdChpZHgpKVxuICB9XG5cbiAgLy8gRHVtcCB0YWlsXG5cbiAgY29uc3QgdGFpbGJpdHMgPSAobWF4ICUgNCkgKiA2XG5cbiAgaWYgKHRhaWxiaXRzID09PSAwKSB7XG4gICAgcmVzdWx0LnB1c2goKGJpdHMgPj4gMTYpICYgMHhGRilcbiAgICByZXN1bHQucHVzaCgoYml0cyA+PiA4KSAmIDB4RkYpXG4gICAgcmVzdWx0LnB1c2goYml0cyAmIDB4RkYpXG4gIH0gZWxzZSBpZiAodGFpbGJpdHMgPT09IDE4KSB7XG4gICAgcmVzdWx0LnB1c2goKGJpdHMgPj4gMTApICYgMHhGRilcbiAgICByZXN1bHQucHVzaCgoYml0cyA+PiAyKSAmIDB4RkYpXG4gIH0gZWxzZSBpZiAodGFpbGJpdHMgPT09IDEyKSB7XG4gICAgcmVzdWx0LnB1c2goKGJpdHMgPj4gNCkgJiAweEZGKVxuICB9XG5cbiAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHJlc3VsdClcbn1cblxuZnVuY3Rpb24gcmVwcmVzZW50WWFtbEJpbmFyeSAob2JqZWN0IC8qLCBzdHlsZSAqLykge1xuICBsZXQgcmVzdWx0ID0gJydcbiAgbGV0IGJpdHMgPSAwXG4gIGNvbnN0IG1heCA9IG9iamVjdC5sZW5ndGhcbiAgY29uc3QgbWFwID0gQkFTRTY0X01BUFxuXG4gIC8vIENvbnZlcnQgZXZlcnkgdGhyZWUgYnl0ZXMgdG8gNCBBU0NJSSBjaGFyYWN0ZXJzLlxuXG4gIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IG1heDsgaWR4KyspIHtcbiAgICBpZiAoKGlkeCAlIDMgPT09IDApICYmIGlkeCkge1xuICAgICAgcmVzdWx0ICs9IG1hcFsoYml0cyA+PiAxOCkgJiAweDNGXVxuICAgICAgcmVzdWx0ICs9IG1hcFsoYml0cyA+PiAxMikgJiAweDNGXVxuICAgICAgcmVzdWx0ICs9IG1hcFsoYml0cyA+PiA2KSAmIDB4M0ZdXG4gICAgICByZXN1bHQgKz0gbWFwW2JpdHMgJiAweDNGXVxuICAgIH1cblxuICAgIGJpdHMgPSAoYml0cyA8PCA4KSArIG9iamVjdFtpZHhdXG4gIH1cblxuICAvLyBEdW1wIHRhaWxcblxuICBjb25zdCB0YWlsID0gbWF4ICUgM1xuXG4gIGlmICh0YWlsID09PSAwKSB7XG4gICAgcmVzdWx0ICs9IG1hcFsoYml0cyA+PiAxOCkgJiAweDNGXVxuICAgIHJlc3VsdCArPSBtYXBbKGJpdHMgPj4gMTIpICYgMHgzRl1cbiAgICByZXN1bHQgKz0gbWFwWyhiaXRzID4+IDYpICYgMHgzRl1cbiAgICByZXN1bHQgKz0gbWFwW2JpdHMgJiAweDNGXVxuICB9IGVsc2UgaWYgKHRhaWwgPT09IDIpIHtcbiAgICByZXN1bHQgKz0gbWFwWyhiaXRzID4+IDEwKSAmIDB4M0ZdXG4gICAgcmVzdWx0ICs9IG1hcFsoYml0cyA+PiA0KSAmIDB4M0ZdXG4gICAgcmVzdWx0ICs9IG1hcFsoYml0cyA8PCAyKSAmIDB4M0ZdXG4gICAgcmVzdWx0ICs9IG1hcFs2NF1cbiAgfSBlbHNlIGlmICh0YWlsID09PSAxKSB7XG4gICAgcmVzdWx0ICs9IG1hcFsoYml0cyA+PiAyKSAmIDB4M0ZdXG4gICAgcmVzdWx0ICs9IG1hcFsoYml0cyA8PCA0KSAmIDB4M0ZdXG4gICAgcmVzdWx0ICs9IG1hcFs2NF1cbiAgICByZXN1bHQgKz0gbWFwWzY0XVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiBpc0JpbmFyeSAob2JqKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgVWludDhBcnJheV0nXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFR5cGUoJ3RhZzp5YW1sLm9yZywyMDAyOmJpbmFyeScsIHtcbiAga2luZDogJ3NjYWxhcicsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sQmluYXJ5LFxuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdFlhbWxCaW5hcnksXG4gIHByZWRpY2F0ZTogaXNCaW5hcnksXG4gIHJlcHJlc2VudDogcmVwcmVzZW50WWFtbEJpbmFyeVxufSlcbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgVHlwZSA9IHJlcXVpcmUoJy4uL3R5cGUnKVxuXG5jb25zdCBfaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG5jb25zdCBfdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sT21hcCAoZGF0YSkge1xuICBpZiAoZGF0YSA9PT0gbnVsbCkgcmV0dXJuIHRydWVcblxuICBjb25zdCBvYmplY3RLZXlzID0gW11cbiAgY29uc3Qgb2JqZWN0ID0gZGF0YVxuXG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCBwYWlyID0gb2JqZWN0W2luZGV4XVxuICAgIGxldCBwYWlySGFzS2V5ID0gZmFsc2VcblxuICAgIGlmIChfdG9TdHJpbmcuY2FsbChwYWlyKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHJldHVybiBmYWxzZVxuXG4gICAgbGV0IHBhaXJLZXlcbiAgICBmb3IgKHBhaXJLZXkgaW4gcGFpcikge1xuICAgICAgaWYgKF9oYXNPd25Qcm9wZXJ0eS5jYWxsKHBhaXIsIHBhaXJLZXkpKSB7XG4gICAgICAgIGlmICghcGFpckhhc0tleSkgcGFpckhhc0tleSA9IHRydWVcbiAgICAgICAgZWxzZSByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXBhaXJIYXNLZXkpIHJldHVybiBmYWxzZVxuXG4gICAgaWYgKG9iamVjdEtleXMuaW5kZXhPZihwYWlyS2V5KSA9PT0gLTEpIG9iamVjdEtleXMucHVzaChwYWlyS2V5KVxuICAgIGVsc2UgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sT21hcCAoZGF0YSkge1xuICByZXR1cm4gZGF0YSAhPT0gbnVsbCA/IGRhdGEgOiBbXVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBUeXBlKCd0YWc6eWFtbC5vcmcsMjAwMjpvbWFwJywge1xuICBraW5kOiAnc2VxdWVuY2UnLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbE9tYXAsXG4gIGNvbnN0cnVjdDogY29uc3RydWN0WWFtbE9tYXBcbn0pXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IFR5cGUgPSByZXF1aXJlKCcuLi90eXBlJylcblxuY29uc3QgX3RvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xuXG5mdW5jdGlvbiByZXNvbHZlWWFtbFBhaXJzIChkYXRhKSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gdHJ1ZVxuXG4gIGNvbnN0IG9iamVjdCA9IGRhdGFcblxuICBjb25zdCByZXN1bHQgPSBuZXcgQXJyYXkob2JqZWN0Lmxlbmd0aClcblxuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IG9iamVjdC5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgY29uc3QgcGFpciA9IG9iamVjdFtpbmRleF1cblxuICAgIGlmIChfdG9TdHJpbmcuY2FsbChwYWlyKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHJldHVybiBmYWxzZVxuXG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHBhaXIpXG5cbiAgICBpZiAoa2V5cy5sZW5ndGggIT09IDEpIHJldHVybiBmYWxzZVxuXG4gICAgcmVzdWx0W2luZGV4XSA9IFtrZXlzWzBdLCBwYWlyW2tleXNbMF1dXVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0WWFtbFBhaXJzIChkYXRhKSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gW11cblxuICBjb25zdCBvYmplY3QgPSBkYXRhXG4gIGNvbnN0IHJlc3VsdCA9IG5ldyBBcnJheShvYmplY3QubGVuZ3RoKVxuXG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCBwYWlyID0gb2JqZWN0W2luZGV4XVxuXG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHBhaXIpXG5cbiAgICByZXN1bHRbaW5kZXhdID0gW2tleXNbMF0sIHBhaXJba2V5c1swXV1dXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFR5cGUoJ3RhZzp5YW1sLm9yZywyMDAyOnBhaXJzJywge1xuICBraW5kOiAnc2VxdWVuY2UnLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbFBhaXJzLFxuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdFlhbWxQYWlyc1xufSlcbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgVHlwZSA9IHJlcXVpcmUoJy4uL3R5cGUnKVxuXG5jb25zdCBfaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sU2V0IChkYXRhKSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gdHJ1ZVxuXG4gIGNvbnN0IG9iamVjdCA9IGRhdGFcblxuICBmb3IgKGNvbnN0IGtleSBpbiBvYmplY3QpIHtcbiAgICBpZiAoX2hhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSB7XG4gICAgICBpZiAob2JqZWN0W2tleV0gIT09IG51bGwpIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdFlhbWxTZXQgKGRhdGEpIHtcbiAgcmV0dXJuIGRhdGEgIT09IG51bGwgPyBkYXRhIDoge31cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6c2V0Jywge1xuICBraW5kOiAnbWFwcGluZycsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sU2V0LFxuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdFlhbWxTZXRcbn0pXG4iLCAiLy8gSlMtWUFNTCdzIGRlZmF1bHQgc2NoZW1hIGZvciBgc2FmZUxvYWRgIGZ1bmN0aW9uLlxuLy8gSXQgaXMgbm90IGRlc2NyaWJlZCBpbiB0aGUgWUFNTCBzcGVjaWZpY2F0aW9uLlxuLy9cbi8vIFRoaXMgc2NoZW1hIGlzIGJhc2VkIG9uIHN0YW5kYXJkIFlBTUwncyBDb3JlIHNjaGVtYSBhbmQgaW5jbHVkZXMgbW9zdCBvZlxuLy8gZXh0cmEgdHlwZXMgZGVzY3JpYmVkIGF0IFlBTUwgdGFnIHJlcG9zaXRvcnkuIChodHRwOi8veWFtbC5vcmcvdHlwZS8pXG5cbid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY29yZScpLmV4dGVuZCh7XG4gIGltcGxpY2l0OiBbXG4gICAgcmVxdWlyZSgnLi4vdHlwZS90aW1lc3RhbXAnKSxcbiAgICByZXF1aXJlKCcuLi90eXBlL21lcmdlJylcbiAgXSxcbiAgZXhwbGljaXQ6IFtcbiAgICByZXF1aXJlKCcuLi90eXBlL2JpbmFyeScpLFxuICAgIHJlcXVpcmUoJy4uL3R5cGUvb21hcCcpLFxuICAgIHJlcXVpcmUoJy4uL3R5cGUvcGFpcnMnKSxcbiAgICByZXF1aXJlKCcuLi90eXBlL3NldCcpXG4gIF1cbn0pXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGNvbW1vbiA9IHJlcXVpcmUoJy4vY29tbW9uJylcbmNvbnN0IFlBTUxFeGNlcHRpb24gPSByZXF1aXJlKCcuL2V4Y2VwdGlvbicpXG5jb25zdCBtYWtlU25pcHBldCA9IHJlcXVpcmUoJy4vc25pcHBldCcpXG5jb25zdCBERUZBVUxUX1NDSEVNQSA9IHJlcXVpcmUoJy4vc2NoZW1hL2RlZmF1bHQnKVxuXG5jb25zdCBfaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG5cbmNvbnN0IENPTlRFWFRfRkxPV19JTiA9IDFcbmNvbnN0IENPTlRFWFRfRkxPV19PVVQgPSAyXG5jb25zdCBDT05URVhUX0JMT0NLX0lOID0gM1xuY29uc3QgQ09OVEVYVF9CTE9DS19PVVQgPSA0XG5cbmNvbnN0IENIT01QSU5HX0NMSVAgPSAxXG5jb25zdCBDSE9NUElOR19TVFJJUCA9IDJcbmNvbnN0IENIT01QSU5HX0tFRVAgPSAzXG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb250cm9sLXJlZ2V4XG5jb25zdCBQQVRURVJOX05PTl9QUklOVEFCTEUgPSAvW1xceDAwLVxceDA4XFx4MEJcXHgwQ1xceDBFLVxceDFGXFx4N0YtXFx4ODRcXHg4Ni1cXHg5RlxcdUZGRkVcXHVGRkZGXXxbXFx1RDgwMC1cXHVEQkZGXSg/IVtcXHVEQzAwLVxcdURGRkZdKXwoPzpbXlxcdUQ4MDAtXFx1REJGRl18XilbXFx1REMwMC1cXHVERkZGXS9cbmNvbnN0IFBBVFRFUk5fTk9OX0FTQ0lJX0xJTkVfQlJFQUtTID0gL1tcXHg4NVxcdTIwMjhcXHUyMDI5XS9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2VsZXNzLWVzY2FwZVxuY29uc3QgUEFUVEVSTl9GTE9XX0lORElDQVRPUlMgPSAvWyxcXFtcXF17fV0vXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlbGVzcy1lc2NhcGVcbmNvbnN0IFBBVFRFUk5fVEFHX0hBTkRMRSA9IC9eKD86IXwhIXwhWzAtOUEtWmEtei1dKyEpJC9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2VsZXNzLWVzY2FwZVxuY29uc3QgUEFUVEVSTl9UQUdfVVJJID0gL14oPzohfFteLFxcW1xcXXt9XSkoPzolWzAtOWEtZl17Mn18WzAtOWEtelxcLSM7Lz86QCY9KyQsXy4hfionKClcXFtcXF1dKSokL2lcblxuZnVuY3Rpb24gX2NsYXNzIChvYmopIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopIH1cblxuZnVuY3Rpb24gaXNFb2wgKGMpIHtcbiAgcmV0dXJuIChjID09PSAweDBBLyogTEYgKi8pIHx8IChjID09PSAweDBELyogQ1IgKi8pXG59XG5cbmZ1bmN0aW9uIGlzV2hpdGVTcGFjZSAoYykge1xuICByZXR1cm4gKGMgPT09IDB4MDkvKiBUYWIgKi8pIHx8IChjID09PSAweDIwLyogU3BhY2UgKi8pXG59XG5cbmZ1bmN0aW9uIGlzV3NPckVvbCAoYykge1xuICByZXR1cm4gKGMgPT09IDB4MDkvKiBUYWIgKi8pIHx8XG4gICAgICAgICAoYyA9PT0gMHgyMC8qIFNwYWNlICovKSB8fFxuICAgICAgICAgKGMgPT09IDB4MEEvKiBMRiAqLykgfHxcbiAgICAgICAgIChjID09PSAweDBELyogQ1IgKi8pXG59XG5cbmZ1bmN0aW9uIGlzRmxvd0luZGljYXRvciAoYykge1xuICByZXR1cm4gYyA9PT0gMHgyQy8qICwgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NUIvKiBbICovIHx8XG4gICAgICAgICBjID09PSAweDVELyogXSAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg3Qi8qIHsgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4N0QvKiB9ICovXG59XG5cbmZ1bmN0aW9uIGZyb21IZXhDb2RlIChjKSB7XG4gIGlmICgoYyA+PSAweDMwLyogMCAqLykgJiYgKGMgPD0gMHgzOS8qIDkgKi8pKSB7XG4gICAgcmV0dXJuIGMgLSAweDMwXG4gIH1cblxuICBjb25zdCBsYyA9IGMgfCAweDIwXG5cbiAgaWYgKChsYyA+PSAweDYxLyogYSAqLykgJiYgKGxjIDw9IDB4NjYvKiBmICovKSkge1xuICAgIHJldHVybiBsYyAtIDB4NjEgKyAxMFxuICB9XG5cbiAgcmV0dXJuIC0xXG59XG5cbmZ1bmN0aW9uIGVzY2FwZWRIZXhMZW4gKGMpIHtcbiAgaWYgKGMgPT09IDB4NzgvKiB4ICovKSB7IHJldHVybiAyIH1cbiAgaWYgKGMgPT09IDB4NzUvKiB1ICovKSB7IHJldHVybiA0IH1cbiAgaWYgKGMgPT09IDB4NTUvKiBVICovKSB7IHJldHVybiA4IH1cbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gZnJvbURlY2ltYWxDb2RlIChjKSB7XG4gIGlmICgoYyA+PSAweDMwLyogMCAqLykgJiYgKGMgPD0gMHgzOS8qIDkgKi8pKSB7XG4gICAgcmV0dXJuIGMgLSAweDMwXG4gIH1cblxuICByZXR1cm4gLTFcbn1cblxuZnVuY3Rpb24gc2ltcGxlRXNjYXBlU2VxdWVuY2UgKGMpIHtcbiAgc3dpdGNoIChjKSB7XG4gICAgY2FzZSAweDMwLyogMCAqLzogcmV0dXJuICdcXHgwMCdcbiAgICBjYXNlIDB4NjEvKiBhICovOiByZXR1cm4gJ1xceDA3J1xuICAgIGNhc2UgMHg2Mi8qIGIgKi86IHJldHVybiAnXFx4MDgnXG4gICAgY2FzZSAweDc0LyogdCAqLzogcmV0dXJuICdcXHgwOSdcbiAgICBjYXNlIDB4MDkvKiBUYWIgKi86IHJldHVybiAnXFx4MDknXG4gICAgY2FzZSAweDZFLyogbiAqLzogcmV0dXJuICdcXHgwQSdcbiAgICBjYXNlIDB4NzYvKiB2ICovOiByZXR1cm4gJ1xceDBCJ1xuICAgIGNhc2UgMHg2Ni8qIGYgKi86IHJldHVybiAnXFx4MEMnXG4gICAgY2FzZSAweDcyLyogciAqLzogcmV0dXJuICdcXHgwRCdcbiAgICBjYXNlIDB4NjUvKiBlICovOiByZXR1cm4gJ1xceDFCJ1xuICAgIGNhc2UgMHgyMC8qIFNwYWNlICovOiByZXR1cm4gJyAnXG4gICAgY2FzZSAweDIyLyogXCIgKi86IHJldHVybiAnXFx4MjInXG4gICAgY2FzZSAweDJGLyogLyAqLzogcmV0dXJuICcvJ1xuICAgIGNhc2UgMHg1Qy8qIFxcICovOiByZXR1cm4gJ1xceDVDJ1xuICAgIGNhc2UgMHg0RS8qIE4gKi86IHJldHVybiAnXFx4ODUnXG4gICAgY2FzZSAweDVGLyogXyAqLzogcmV0dXJuICdcXHhBMCdcbiAgICBjYXNlIDB4NEMvKiBMICovOiByZXR1cm4gJ1xcdTIwMjgnXG4gICAgY2FzZSAweDUwLyogUCAqLzogcmV0dXJuICdcXHUyMDI5J1xuICAgIGRlZmF1bHQ6IHJldHVybiAnJ1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoYXJGcm9tQ29kZXBvaW50IChjKSB7XG4gIGlmIChjIDw9IDB4RkZGRikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGMpXG4gIH1cbiAgLy8gRW5jb2RlIFVURi0xNiBzdXJyb2dhdGUgcGFpclxuICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9VVEYtMTYjQ29kZV9wb2ludHNfVS4yQjAxMDAwMF90b19VLjJCMTBGRkZGXG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKFxuICAgICgoYyAtIDB4MDEwMDAwKSA+PiAxMCkgKyAweEQ4MDAsXG4gICAgKChjIC0gMHgwMTAwMDApICYgMHgwM0ZGKSArIDB4REMwMFxuICApXG59XG5cbi8vIHNldCBhIHByb3BlcnR5IG9mIGEgbGl0ZXJhbCBvYmplY3QsIHdoaWxlIHByb3RlY3RpbmcgYWdhaW5zdCBwcm90b3R5cGUgcG9sbHV0aW9uLFxuLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC9pc3N1ZXMvMTY0IGZvciBtb3JlIGRldGFpbHNcbmZ1bmN0aW9uIHNldFByb3BlcnR5IChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgLy8gdXNlZCBmb3IgdGhpcyBzcGVjaWZpYyBrZXkgb25seSBiZWNhdXNlIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBpcyBzbG93XG4gIGlmIChrZXkgPT09ICdfX3Byb3RvX18nKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICB2YWx1ZTogdmFsdWVcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFtrZXldID0gdmFsdWVcbiAgfVxufVxuXG5jb25zdCBzaW1wbGVFc2NhcGVDaGVjayA9IG5ldyBBcnJheSgyNTYpIC8vIGludGVnZXIsIGZvciBmYXN0IGFjY2Vzc1xuY29uc3Qgc2ltcGxlRXNjYXBlTWFwID0gbmV3IEFycmF5KDI1NilcbmZvciAobGV0IGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgc2ltcGxlRXNjYXBlQ2hlY2tbaV0gPSBzaW1wbGVFc2NhcGVTZXF1ZW5jZShpKSA/IDEgOiAwXG4gIHNpbXBsZUVzY2FwZU1hcFtpXSA9IHNpbXBsZUVzY2FwZVNlcXVlbmNlKGkpXG59XG5cbmZ1bmN0aW9uIFN0YXRlIChpbnB1dCwgb3B0aW9ucykge1xuICB0aGlzLmlucHV0ID0gaW5wdXRcblxuICB0aGlzLmZpbGVuYW1lID0gb3B0aW9uc1snZmlsZW5hbWUnXSB8fCBudWxsXG4gIHRoaXMuc2NoZW1hID0gb3B0aW9uc1snc2NoZW1hJ10gfHwgREVGQVVMVF9TQ0hFTUFcbiAgdGhpcy5vbldhcm5pbmcgPSBvcHRpb25zWydvbldhcm5pbmcnXSB8fCBudWxsXG4gIC8vIChIaWRkZW4pIFJlbW92ZT8gbWFrZXMgdGhlIGxvYWRlciB0byBleHBlY3QgWUFNTCAxLjEgZG9jdW1lbnRzXG4gIC8vIGlmIHN1Y2ggZG9jdW1lbnRzIGhhdmUgbm8gZXhwbGljaXQgJVlBTUwgZGlyZWN0aXZlXG4gIHRoaXMubGVnYWN5ID0gb3B0aW9uc1snbGVnYWN5J10gfHwgZmFsc2VcblxuICB0aGlzLmpzb24gPSBvcHRpb25zWydqc29uJ10gfHwgZmFsc2VcbiAgdGhpcy5saXN0ZW5lciA9IG9wdGlvbnNbJ2xpc3RlbmVyJ10gfHwgbnVsbFxuICB0aGlzLm1heERlcHRoID0gdHlwZW9mIG9wdGlvbnNbJ21heERlcHRoJ10gPT09ICdudW1iZXInID8gb3B0aW9uc1snbWF4RGVwdGgnXSA6IDEwMFxuICB0aGlzLm1heE1lcmdlU2VxTGVuZ3RoID0gdHlwZW9mIG9wdGlvbnNbJ21heE1lcmdlU2VxTGVuZ3RoJ10gPT09ICdudW1iZXInID8gb3B0aW9uc1snbWF4TWVyZ2VTZXFMZW5ndGgnXSA6IDIwXG5cbiAgdGhpcy5pbXBsaWNpdFR5cGVzID0gdGhpcy5zY2hlbWEuY29tcGlsZWRJbXBsaWNpdFxuICB0aGlzLnR5cGVNYXAgPSB0aGlzLnNjaGVtYS5jb21waWxlZFR5cGVNYXBcblxuICB0aGlzLmxlbmd0aCA9IGlucHV0Lmxlbmd0aFxuICB0aGlzLnBvc2l0aW9uID0gMFxuICB0aGlzLmxpbmUgPSAwXG4gIHRoaXMubGluZVN0YXJ0ID0gMFxuICB0aGlzLmxpbmVJbmRlbnQgPSAwXG4gIHRoaXMuZGVwdGggPSAwXG5cbiAgLy8gcG9zaXRpb24gb2YgZmlyc3QgbGVhZGluZyB0YWIgaW4gdGhlIGN1cnJlbnQgbGluZSxcbiAgLy8gdXNlZCB0byBtYWtlIHN1cmUgdGhlcmUgYXJlIG5vIHRhYnMgaW4gdGhlIGluZGVudGF0aW9uXG4gIHRoaXMuZmlyc3RUYWJJbkxpbmUgPSAtMVxuXG4gIHRoaXMuZG9jdW1lbnRzID0gW11cbiAgdGhpcy5hbmNob3JNYXBUcmFuc2FjdGlvbnMgPSBbXVxuXG4gIC8qXG4gIHRoaXMudmVyc2lvbjtcbiAgdGhpcy5jaGVja0xpbmVCcmVha3M7XG4gIHRoaXMudGFnTWFwO1xuICB0aGlzLmFuY2hvck1hcDtcbiAgdGhpcy50YWc7XG4gIHRoaXMuYW5jaG9yO1xuICB0aGlzLmtpbmQ7XG4gIHRoaXMucmVzdWx0OyAqL1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUVycm9yIChzdGF0ZSwgbWVzc2FnZSkge1xuICBjb25zdCBtYXJrID0ge1xuICAgIG5hbWU6IHN0YXRlLmZpbGVuYW1lLFxuICAgIGJ1ZmZlcjogc3RhdGUuaW5wdXQuc2xpY2UoMCwgLTEpLCAvLyBvbWl0IHRyYWlsaW5nIFxcMFxuICAgIHBvc2l0aW9uOiBzdGF0ZS5wb3NpdGlvbixcbiAgICBsaW5lOiBzdGF0ZS5saW5lLFxuICAgIGNvbHVtbjogc3RhdGUucG9zaXRpb24gLSBzdGF0ZS5saW5lU3RhcnRcbiAgfVxuXG4gIG1hcmsuc25pcHBldCA9IG1ha2VTbmlwcGV0KG1hcmspXG5cbiAgcmV0dXJuIG5ldyBZQU1MRXhjZXB0aW9uKG1lc3NhZ2UsIG1hcmspXG59XG5cbmZ1bmN0aW9uIHRocm93RXJyb3IgKHN0YXRlLCBtZXNzYWdlKSB7XG4gIHRocm93IGdlbmVyYXRlRXJyb3Ioc3RhdGUsIG1lc3NhZ2UpXG59XG5cbmZ1bmN0aW9uIHRocm93V2FybmluZyAoc3RhdGUsIG1lc3NhZ2UpIHtcbiAgaWYgKHN0YXRlLm9uV2FybmluZykge1xuICAgIHN0YXRlLm9uV2FybmluZy5jYWxsKG51bGwsIGdlbmVyYXRlRXJyb3Ioc3RhdGUsIG1lc3NhZ2UpKVxuICB9XG59XG5cbmZ1bmN0aW9uIHN0b3JlQW5jaG9yIChzdGF0ZSwgbmFtZSwgdmFsdWUpIHtcbiAgY29uc3QgdHJhbnNhY3Rpb25zID0gc3RhdGUuYW5jaG9yTWFwVHJhbnNhY3Rpb25zXG5cbiAgaWYgKHRyYW5zYWN0aW9ucy5sZW5ndGggIT09IDApIHtcbiAgICBjb25zdCB0cmFuc2FjdGlvbiA9IHRyYW5zYWN0aW9uc1t0cmFuc2FjdGlvbnMubGVuZ3RoIC0gMV1cblxuICAgIGlmICghX2hhc093blByb3BlcnR5LmNhbGwodHJhbnNhY3Rpb24sIG5hbWUpKSB7XG4gICAgICB0cmFuc2FjdGlvbltuYW1lXSA9IHtcbiAgICAgICAgZXhpc3RlZDogX2hhc093blByb3BlcnR5LmNhbGwoc3RhdGUuYW5jaG9yTWFwLCBuYW1lKSxcbiAgICAgICAgdmFsdWU6IHN0YXRlLmFuY2hvck1hcFtuYW1lXVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0YXRlLmFuY2hvck1hcFtuYW1lXSA9IHZhbHVlXG59XG5cbmZ1bmN0aW9uIGJlZ2luQW5jaG9yVHJhbnNhY3Rpb24gKHN0YXRlKSB7XG4gIHN0YXRlLmFuY2hvck1hcFRyYW5zYWN0aW9ucy5wdXNoKE9iamVjdC5jcmVhdGUobnVsbCkpXG59XG5cbmZ1bmN0aW9uIGNvbW1pdEFuY2hvclRyYW5zYWN0aW9uIChzdGF0ZSkge1xuICBjb25zdCB0cmFuc2FjdGlvbiA9IHN0YXRlLmFuY2hvck1hcFRyYW5zYWN0aW9ucy5wb3AoKVxuICBjb25zdCB0cmFuc2FjdGlvbnMgPSBzdGF0ZS5hbmNob3JNYXBUcmFuc2FjdGlvbnNcblxuICBpZiAodHJhbnNhY3Rpb25zLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgY29uc3QgcGFyZW50ID0gdHJhbnNhY3Rpb25zW3RyYW5zYWN0aW9ucy5sZW5ndGggLSAxXVxuICBjb25zdCBuYW1lcyA9IE9iamVjdC5rZXlzKHRyYW5zYWN0aW9uKVxuXG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gbmFtZXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGNvbnN0IG5hbWUgPSBuYW1lc1tpbmRleF1cblxuICAgIGlmICghX2hhc093blByb3BlcnR5LmNhbGwocGFyZW50LCBuYW1lKSkge1xuICAgICAgcGFyZW50W25hbWVdID0gdHJhbnNhY3Rpb25bbmFtZV1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcm9sbGJhY2tBbmNob3JUcmFuc2FjdGlvbiAoc3RhdGUpIHtcbiAgY29uc3QgdHJhbnNhY3Rpb24gPSBzdGF0ZS5hbmNob3JNYXBUcmFuc2FjdGlvbnMucG9wKClcbiAgY29uc3QgbmFtZXMgPSBPYmplY3Qua2V5cyh0cmFuc2FjdGlvbilcblxuICBmb3IgKGxldCBpbmRleCA9IG5hbWVzLmxlbmd0aCAtIDE7IGluZGV4ID49IDA7IGluZGV4IC09IDEpIHtcbiAgICBjb25zdCBlbnRyeSA9IHRyYW5zYWN0aW9uW25hbWVzW2luZGV4XV1cblxuICAgIGlmIChlbnRyeS5leGlzdGVkKSB7XG4gICAgICBzdGF0ZS5hbmNob3JNYXBbbmFtZXNbaW5kZXhdXSA9IGVudHJ5LnZhbHVlXG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSBzdGF0ZS5hbmNob3JNYXBbbmFtZXNbaW5kZXhdXVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzbmFwc2hvdFN0YXRlIChzdGF0ZSkge1xuICByZXR1cm4ge1xuICAgIHBvc2l0aW9uOiBzdGF0ZS5wb3NpdGlvbixcbiAgICBsaW5lOiBzdGF0ZS5saW5lLFxuICAgIGxpbmVTdGFydDogc3RhdGUubGluZVN0YXJ0LFxuICAgIGxpbmVJbmRlbnQ6IHN0YXRlLmxpbmVJbmRlbnQsXG4gICAgZmlyc3RUYWJJbkxpbmU6IHN0YXRlLmZpcnN0VGFiSW5MaW5lLFxuICAgIHRhZzogc3RhdGUudGFnLFxuICAgIGFuY2hvcjogc3RhdGUuYW5jaG9yLFxuICAgIGtpbmQ6IHN0YXRlLmtpbmQsXG4gICAgcmVzdWx0OiBzdGF0ZS5yZXN1bHRcbiAgfVxufVxuXG5mdW5jdGlvbiByZXN0b3JlU3RhdGUgKHN0YXRlLCBzbmFwc2hvdCkge1xuICBzdGF0ZS5wb3NpdGlvbiA9IHNuYXBzaG90LnBvc2l0aW9uXG4gIHN0YXRlLmxpbmUgPSBzbmFwc2hvdC5saW5lXG4gIHN0YXRlLmxpbmVTdGFydCA9IHNuYXBzaG90LmxpbmVTdGFydFxuICBzdGF0ZS5saW5lSW5kZW50ID0gc25hcHNob3QubGluZUluZGVudFxuICBzdGF0ZS5maXJzdFRhYkluTGluZSA9IHNuYXBzaG90LmZpcnN0VGFiSW5MaW5lXG4gIHN0YXRlLnRhZyA9IHNuYXBzaG90LnRhZ1xuICBzdGF0ZS5hbmNob3IgPSBzbmFwc2hvdC5hbmNob3JcbiAgc3RhdGUua2luZCA9IHNuYXBzaG90LmtpbmRcbiAgc3RhdGUucmVzdWx0ID0gc25hcHNob3QucmVzdWx0XG59XG5cbmNvbnN0IGRpcmVjdGl2ZUhhbmRsZXJzID0ge1xuXG4gIFlBTUw6IGZ1bmN0aW9uIGhhbmRsZVlhbWxEaXJlY3RpdmUgKHN0YXRlLCBuYW1lLCBhcmdzKSB7XG4gICAgaWYgKHN0YXRlLnZlcnNpb24gIT09IG51bGwpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdkdXBsaWNhdGlvbiBvZiAlWUFNTCBkaXJlY3RpdmUnKVxuICAgIH1cblxuICAgIGlmIChhcmdzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ1lBTUwgZGlyZWN0aXZlIGFjY2VwdHMgZXhhY3RseSBvbmUgYXJndW1lbnQnKVxuICAgIH1cblxuICAgIGNvbnN0IG1hdGNoID0gL14oWzAtOV0rKVxcLihbMC05XSspJC8uZXhlYyhhcmdzWzBdKVxuXG4gICAgaWYgKG1hdGNoID09PSBudWxsKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnaWxsLWZvcm1lZCBhcmd1bWVudCBvZiB0aGUgWUFNTCBkaXJlY3RpdmUnKVxuICAgIH1cblxuICAgIGNvbnN0IG1ham9yID0gcGFyc2VJbnQobWF0Y2hbMV0sIDEwKVxuICAgIGNvbnN0IG1pbm9yID0gcGFyc2VJbnQobWF0Y2hbMl0sIDEwKVxuXG4gICAgaWYgKG1ham9yICE9PSAxKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndW5hY2NlcHRhYmxlIFlBTUwgdmVyc2lvbiBvZiB0aGUgZG9jdW1lbnQnKVxuICAgIH1cblxuICAgIHN0YXRlLnZlcnNpb24gPSBhcmdzWzBdXG4gICAgc3RhdGUuY2hlY2tMaW5lQnJlYWtzID0gKG1pbm9yIDwgMilcblxuICAgIGlmIChtaW5vciAhPT0gMSAmJiBtaW5vciAhPT0gMikge1xuICAgICAgdGhyb3dXYXJuaW5nKHN0YXRlLCAndW5zdXBwb3J0ZWQgWUFNTCB2ZXJzaW9uIG9mIHRoZSBkb2N1bWVudCcpXG4gICAgfVxuICB9LFxuXG4gIFRBRzogZnVuY3Rpb24gaGFuZGxlVGFnRGlyZWN0aXZlIChzdGF0ZSwgbmFtZSwgYXJncykge1xuICAgIGxldCBwcmVmaXhcblxuICAgIGlmIChhcmdzLmxlbmd0aCAhPT0gMikge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ1RBRyBkaXJlY3RpdmUgYWNjZXB0cyBleGFjdGx5IHR3byBhcmd1bWVudHMnKVxuICAgIH1cblxuICAgIGNvbnN0IGhhbmRsZSA9IGFyZ3NbMF1cbiAgICBwcmVmaXggPSBhcmdzWzFdXG5cbiAgICBpZiAoIVBBVFRFUk5fVEFHX0hBTkRMRS50ZXN0KGhhbmRsZSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdpbGwtZm9ybWVkIHRhZyBoYW5kbGUgKGZpcnN0IGFyZ3VtZW50KSBvZiB0aGUgVEFHIGRpcmVjdGl2ZScpXG4gICAgfVxuXG4gICAgaWYgKF9oYXNPd25Qcm9wZXJ0eS5jYWxsKHN0YXRlLnRhZ01hcCwgaGFuZGxlKSkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RoZXJlIGlzIGEgcHJldmlvdXNseSBkZWNsYXJlZCBzdWZmaXggZm9yIFwiJyArIGhhbmRsZSArICdcIiB0YWcgaGFuZGxlJylcbiAgICB9XG5cbiAgICBpZiAoIVBBVFRFUk5fVEFHX1VSSS50ZXN0KHByZWZpeCkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdpbGwtZm9ybWVkIHRhZyBwcmVmaXggKHNlY29uZCBhcmd1bWVudCkgb2YgdGhlIFRBRyBkaXJlY3RpdmUnKVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBwcmVmaXggPSBkZWNvZGVVUklDb21wb25lbnQocHJlZml4KVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RhZyBwcmVmaXggaXMgbWFsZm9ybWVkOiAnICsgcHJlZml4KVxuICAgIH1cblxuICAgIHN0YXRlLnRhZ01hcFtoYW5kbGVdID0gcHJlZml4XG4gIH1cbn1cblxuZnVuY3Rpb24gY2FwdHVyZVNlZ21lbnQgKHN0YXRlLCBzdGFydCwgZW5kLCBjaGVja0pzb24pIHtcbiAgaWYgKHN0YXJ0IDwgZW5kKSB7XG4gICAgY29uc3QgX3Jlc3VsdCA9IHN0YXRlLmlucHV0LnNsaWNlKHN0YXJ0LCBlbmQpXG5cbiAgICBpZiAoY2hlY2tKc29uKSB7XG4gICAgICBmb3IgKGxldCBfcG9zaXRpb24gPSAwLCBfbGVuZ3RoID0gX3Jlc3VsdC5sZW5ndGg7IF9wb3NpdGlvbiA8IF9sZW5ndGg7IF9wb3NpdGlvbiArPSAxKSB7XG4gICAgICAgIGNvbnN0IF9jaGFyYWN0ZXIgPSBfcmVzdWx0LmNoYXJDb2RlQXQoX3Bvc2l0aW9uKVxuICAgICAgICBpZiAoIShfY2hhcmFjdGVyID09PSAweDA5IHx8XG4gICAgICAgICAgICAgIChfY2hhcmFjdGVyID49IDB4MjAgJiYgX2NoYXJhY3RlciA8PSAweDEwRkZGRikpKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2V4cGVjdGVkIHZhbGlkIEpTT04gY2hhcmFjdGVyJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoUEFUVEVSTl9OT05fUFJJTlRBQkxFLnRlc3QoX3Jlc3VsdCkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd0aGUgc3RyZWFtIGNvbnRhaW5zIG5vbi1wcmludGFibGUgY2hhcmFjdGVycycpXG4gICAgfVxuXG4gICAgc3RhdGUucmVzdWx0ICs9IF9yZXN1bHRcbiAgfVxufVxuXG5mdW5jdGlvbiBtZXJnZU1hcHBpbmdzIChzdGF0ZSwgZGVzdGluYXRpb24sIHNvdXJjZSwgb3ZlcnJpZGFibGVLZXlzKSB7XG4gIGlmICghY29tbW9uLmlzT2JqZWN0KHNvdXJjZSkpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnY2Fubm90IG1lcmdlIG1hcHBpbmdzOyB0aGUgcHJvdmlkZWQgc291cmNlIG9iamVjdCBpcyB1bmFjY2VwdGFibGUnKVxuICB9XG5cbiAgY29uc3Qgc291cmNlS2V5cyA9IE9iamVjdC5rZXlzKHNvdXJjZSlcblxuICBmb3IgKGxldCBpbmRleCA9IDAsIHF1YW50aXR5ID0gc291cmNlS2V5cy5sZW5ndGg7IGluZGV4IDwgcXVhbnRpdHk7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCBrZXkgPSBzb3VyY2VLZXlzW2luZGV4XVxuXG4gICAgaWYgKCFfaGFzT3duUHJvcGVydHkuY2FsbChkZXN0aW5hdGlvbiwga2V5KSkge1xuICAgICAgc2V0UHJvcGVydHkoZGVzdGluYXRpb24sIGtleSwgc291cmNlW2tleV0pXG4gICAgICBvdmVycmlkYWJsZUtleXNba2V5XSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RvcmVNYXBwaW5nUGFpciAoc3RhdGUsIF9yZXN1bHQsIG92ZXJyaWRhYmxlS2V5cywga2V5VGFnLCBrZXlOb2RlLCB2YWx1ZU5vZGUsXG4gIHN0YXJ0TGluZSwgc3RhcnRMaW5lU3RhcnQsIHN0YXJ0UG9zKSB7XG4gIC8vIFRoZSBvdXRwdXQgaXMgYSBwbGFpbiBvYmplY3QgaGVyZSwgc28ga2V5cyBjYW4gb25seSBiZSBzdHJpbmdzLlxuICAvLyBXZSBuZWVkIHRvIGNvbnZlcnQga2V5Tm9kZSB0byBhIHN0cmluZywgYnV0IGRvaW5nIHNvIGNhbiBoYW5nIHRoZSBwcm9jZXNzXG4gIC8vIChkZWVwbHkgbmVzdGVkIGFycmF5cyB0aGF0IGV4cGxvZGUgZXhwb25lbnRpYWxseSB1c2luZyBhbGlhc2VzKS5cbiAgaWYgKEFycmF5LmlzQXJyYXkoa2V5Tm9kZSkpIHtcbiAgICBrZXlOb2RlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoa2V5Tm9kZSlcblxuICAgIGZvciAobGV0IGluZGV4ID0gMCwgcXVhbnRpdHkgPSBrZXlOb2RlLmxlbmd0aDsgaW5kZXggPCBxdWFudGl0eTsgaW5kZXggKz0gMSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoa2V5Tm9kZVtpbmRleF0pKSB7XG4gICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICduZXN0ZWQgYXJyYXlzIGFyZSBub3Qgc3VwcG9ydGVkIGluc2lkZSBrZXlzJylcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBrZXlOb2RlID09PSAnb2JqZWN0JyAmJiBfY2xhc3Moa2V5Tm9kZVtpbmRleF0pID09PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgICBrZXlOb2RlW2luZGV4XSA9ICdbb2JqZWN0IE9iamVjdF0nXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQXZvaWQgY29kZSBleGVjdXRpb24gaW4gbG9hZCgpIHZpYSB0b1N0cmluZyBwcm9wZXJ0eVxuICAvLyAoc3RpbGwgdXNlIGl0cyBvd24gdG9TdHJpbmcgZm9yIGFycmF5cywgdGltZXN0YW1wcyxcbiAgLy8gYW5kIHdoYXRldmVyIHVzZXIgc2NoZW1hIGV4dGVuc2lvbnMgaGFwcGVuIHRvIGhhdmUgQEB0b1N0cmluZ1RhZylcbiAgaWYgKHR5cGVvZiBrZXlOb2RlID09PSAnb2JqZWN0JyAmJiBfY2xhc3Moa2V5Tm9kZSkgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAga2V5Tm9kZSA9ICdbb2JqZWN0IE9iamVjdF0nXG4gIH1cblxuICBrZXlOb2RlID0gU3RyaW5nKGtleU5vZGUpXG5cbiAgaWYgKF9yZXN1bHQgPT09IG51bGwpIHtcbiAgICBfcmVzdWx0ID0ge31cbiAgfVxuXG4gIGlmIChrZXlUYWcgPT09ICd0YWc6eWFtbC5vcmcsMjAwMjptZXJnZScpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZU5vZGUpKSB7XG4gICAgICBpZiAodmFsdWVOb2RlLmxlbmd0aCA+IHN0YXRlLm1heE1lcmdlU2VxTGVuZ3RoKSB7XG4gICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdtZXJnZSBzZXF1ZW5jZSBsZW5ndGggZXhjZWVkZWQgbWF4TWVyZ2VTZXFMZW5ndGggKCcgKyBzdGF0ZS5tYXhNZXJnZVNlcUxlbmd0aCArICcpJylcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0KClcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMCwgcXVhbnRpdHkgPSB2YWx1ZU5vZGUubGVuZ3RoOyBpbmRleCA8IHF1YW50aXR5OyBpbmRleCArPSAxKSB7XG4gICAgICAgIGNvbnN0IHNyYyA9IHZhbHVlTm9kZVtpbmRleF1cbiAgICAgICAgLy8gRXhpc3Rpbmcga2V5cyBhcmUgbm90IG92ZXJyaWRkZW4gb24gbWVyZ2UsIHNvIGRlZHVwZSBzb3VyY2VzIHRvXG4gICAgICAgIC8vIGF2b2lkIHJlZHVuZGFudCB3b3JrIG9uIHJlcGVhdGVkIGFsaWFzZXMuXG4gICAgICAgIGlmIChzZWVuLmhhcyhzcmMpKSBjb250aW51ZVxuICAgICAgICBzZWVuLmFkZChzcmMpXG4gICAgICAgIG1lcmdlTWFwcGluZ3Moc3RhdGUsIF9yZXN1bHQsIHNyYywgb3ZlcnJpZGFibGVLZXlzKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtZXJnZU1hcHBpbmdzKHN0YXRlLCBfcmVzdWx0LCB2YWx1ZU5vZGUsIG92ZXJyaWRhYmxlS2V5cylcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKCFzdGF0ZS5qc29uICYmXG4gICAgICAgICFfaGFzT3duUHJvcGVydHkuY2FsbChvdmVycmlkYWJsZUtleXMsIGtleU5vZGUpICYmXG4gICAgICAgIF9oYXNPd25Qcm9wZXJ0eS5jYWxsKF9yZXN1bHQsIGtleU5vZGUpKSB7XG4gICAgICBzdGF0ZS5saW5lID0gc3RhcnRMaW5lIHx8IHN0YXRlLmxpbmVcbiAgICAgIHN0YXRlLmxpbmVTdGFydCA9IHN0YXJ0TGluZVN0YXJ0IHx8IHN0YXRlLmxpbmVTdGFydFxuICAgICAgc3RhdGUucG9zaXRpb24gPSBzdGFydFBvcyB8fCBzdGF0ZS5wb3NpdGlvblxuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2R1cGxpY2F0ZWQgbWFwcGluZyBrZXknKVxuICAgIH1cblxuICAgIHNldFByb3BlcnR5KF9yZXN1bHQsIGtleU5vZGUsIHZhbHVlTm9kZSlcbiAgICBkZWxldGUgb3ZlcnJpZGFibGVLZXlzW2tleU5vZGVdXG4gIH1cblxuICByZXR1cm4gX3Jlc3VsdFxufVxuXG5mdW5jdGlvbiByZWFkTGluZUJyZWFrIChzdGF0ZSkge1xuICBjb25zdCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgaWYgKGNoID09PSAweDBBLyogTEYgKi8pIHtcbiAgICBzdGF0ZS5wb3NpdGlvbisrXG4gIH0gZWxzZSBpZiAoY2ggPT09IDB4MEQvKiBDUiAqLykge1xuICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MEEvKiBMRiAqLykge1xuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnYSBsaW5lIGJyZWFrIGlzIGV4cGVjdGVkJylcbiAgfVxuXG4gIHN0YXRlLmxpbmUgKz0gMVxuICBzdGF0ZS5saW5lU3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICBzdGF0ZS5maXJzdFRhYkluTGluZSA9IC0xXG59XG5cbmZ1bmN0aW9uIHNraXBTZXBhcmF0aW9uU3BhY2UgKHN0YXRlLCBhbGxvd0NvbW1lbnRzLCBjaGVja0luZGVudCkge1xuICBsZXQgbGluZUJyZWFrcyA9IDBcbiAgbGV0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICB3aGlsZSAoaXNXaGl0ZVNwYWNlKGNoKSkge1xuICAgICAgaWYgKGNoID09PSAweDA5LyogVGFiICovICYmIHN0YXRlLmZpcnN0VGFiSW5MaW5lID09PSAtMSkge1xuICAgICAgICBzdGF0ZS5maXJzdFRhYkluTGluZSA9IHN0YXRlLnBvc2l0aW9uXG4gICAgICB9XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgICB9XG5cbiAgICBpZiAoYWxsb3dDb21tZW50cyAmJiBjaCA9PT0gMHgyMy8qICMgKi8pIHtcbiAgICAgIGRvIHtcbiAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgICB9IHdoaWxlIChjaCAhPT0gMHgwQS8qIExGICovICYmIGNoICE9PSAweDBELyogQ1IgKi8gJiYgY2ggIT09IDApXG4gICAgfVxuXG4gICAgaWYgKGlzRW9sKGNoKSkge1xuICAgICAgcmVhZExpbmVCcmVhayhzdGF0ZSlcblxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICAgICAgbGluZUJyZWFrcysrXG4gICAgICBzdGF0ZS5saW5lSW5kZW50ID0gMFxuXG4gICAgICB3aGlsZSAoY2ggPT09IDB4MjAvKiBTcGFjZSAqLykge1xuICAgICAgICBzdGF0ZS5saW5lSW5kZW50KytcbiAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKGNoZWNrSW5kZW50ICE9PSAtMSAmJiBsaW5lQnJlYWtzICE9PSAwICYmIHN0YXRlLmxpbmVJbmRlbnQgPCBjaGVja0luZGVudCkge1xuICAgIHRocm93V2FybmluZyhzdGF0ZSwgJ2RlZmljaWVudCBpbmRlbnRhdGlvbicpXG4gIH1cblxuICByZXR1cm4gbGluZUJyZWFrc1xufVxuXG5mdW5jdGlvbiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3IgKHN0YXRlKSB7XG4gIGxldCBfcG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvblxuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KF9wb3NpdGlvbilcblxuICAvLyBDb25kaXRpb24gc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCBpcyB0ZXN0ZWRcbiAgLy8gaW4gcGFyZW50IG9uIGVhY2ggY2FsbCwgZm9yIGVmZmljaWVuY3kuIE5vIG5lZWRzIHRvIHRlc3QgaGVyZSBhZ2Fpbi5cbiAgaWYgKChjaCA9PT0gMHgyRC8qIC0gKi8gfHwgY2ggPT09IDB4MkUvKiAuICovKSAmJlxuICAgICAgY2ggPT09IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoX3Bvc2l0aW9uICsgMSkgJiZcbiAgICAgIGNoID09PSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KF9wb3NpdGlvbiArIDIpKSB7XG4gICAgX3Bvc2l0aW9uICs9IDNcblxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChfcG9zaXRpb24pXG5cbiAgICBpZiAoY2ggPT09IDAgfHwgaXNXc09yRW9sKGNoKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gd3JpdGVGb2xkZWRMaW5lcyAoc3RhdGUsIGNvdW50KSB7XG4gIGlmIChjb3VudCA9PT0gMSkge1xuICAgIHN0YXRlLnJlc3VsdCArPSAnICdcbiAgfSBlbHNlIGlmIChjb3VudCA+IDEpIHtcbiAgICBzdGF0ZS5yZXN1bHQgKz0gY29tbW9uLnJlcGVhdCgnXFxuJywgY291bnQgLSAxKVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlYWRQbGFpblNjYWxhciAoc3RhdGUsIG5vZGVJbmRlbnQsIHdpdGhpbkZsb3dDb2xsZWN0aW9uKSB7XG4gIGxldCBjYXB0dXJlU3RhcnRcbiAgbGV0IGNhcHR1cmVFbmRcbiAgbGV0IGhhc1BlbmRpbmdDb250ZW50XG4gIGxldCBfbGluZVxuICBsZXQgX2xpbmVTdGFydFxuICBsZXQgX2xpbmVJbmRlbnRcbiAgY29uc3QgX2tpbmQgPSBzdGF0ZS5raW5kXG4gIGNvbnN0IF9yZXN1bHQgPSBzdGF0ZS5yZXN1bHRcblxuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gIGlmIChpc1dzT3JFb2woY2gpIHx8XG4gICAgICBpc0Zsb3dJbmRpY2F0b3IoY2gpIHx8XG4gICAgICBjaCA9PT0gMHgyMy8qICMgKi8gfHxcbiAgICAgIGNoID09PSAweDI2LyogJiAqLyB8fFxuICAgICAgY2ggPT09IDB4MkEvKiAqICovIHx8XG4gICAgICBjaCA9PT0gMHgyMS8qICEgKi8gfHxcbiAgICAgIGNoID09PSAweDdDLyogfCAqLyB8fFxuICAgICAgY2ggPT09IDB4M0UvKiA+ICovIHx8XG4gICAgICBjaCA9PT0gMHgyNy8qICcgKi8gfHxcbiAgICAgIGNoID09PSAweDIyLyogXCIgKi8gfHxcbiAgICAgIGNoID09PSAweDI1LyogJSAqLyB8fFxuICAgICAgY2ggPT09IDB4NDAvKiBAICovIHx8XG4gICAgICBjaCA9PT0gMHg2MC8qIGAgKi8pIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmIChjaCA9PT0gMHgzRi8qID8gKi8gfHwgY2ggPT09IDB4MkQvKiAtICovKSB7XG4gICAgY29uc3QgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpXG5cbiAgICBpZiAoaXNXc09yRW9sKGZvbGxvd2luZykgfHxcbiAgICAgICAgKHdpdGhpbkZsb3dDb2xsZWN0aW9uICYmIGlzRmxvd0luZGljYXRvcihmb2xsb3dpbmcpKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgc3RhdGUua2luZCA9ICdzY2FsYXInXG4gIHN0YXRlLnJlc3VsdCA9ICcnXG4gIGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvblxuICBoYXNQZW5kaW5nQ29udGVudCA9IGZhbHNlXG5cbiAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgaWYgKGNoID09PSAweDNBLyogOiAqLykge1xuICAgICAgY29uc3QgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpXG5cbiAgICAgIGlmIChpc1dzT3JFb2woZm9sbG93aW5nKSB8fFxuICAgICAgICAgICh3aXRoaW5GbG93Q29sbGVjdGlvbiAmJiBpc0Zsb3dJbmRpY2F0b3IoZm9sbG93aW5nKSkpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDIzLyogIyAqLykge1xuICAgICAgY29uc3QgcHJlY2VkaW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiAtIDEpXG5cbiAgICAgIGlmIChpc1dzT3JFb2wocHJlY2VkaW5nKSkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoKHN0YXRlLnBvc2l0aW9uID09PSBzdGF0ZS5saW5lU3RhcnQgJiYgdGVzdERvY3VtZW50U2VwYXJhdG9yKHN0YXRlKSkgfHxcbiAgICAgICAgICAgICAgICh3aXRoaW5GbG93Q29sbGVjdGlvbiAmJiBpc0Zsb3dJbmRpY2F0b3IoY2gpKSkge1xuICAgICAgYnJlYWtcbiAgICB9IGVsc2UgaWYgKGlzRW9sKGNoKSkge1xuICAgICAgX2xpbmUgPSBzdGF0ZS5saW5lXG4gICAgICBfbGluZVN0YXJ0ID0gc3RhdGUubGluZVN0YXJ0XG4gICAgICBfbGluZUluZGVudCA9IHN0YXRlLmxpbmVJbmRlbnRcbiAgICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIGZhbHNlLCAtMSlcblxuICAgICAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPj0gbm9kZUluZGVudCkge1xuICAgICAgICBoYXNQZW5kaW5nQ29udGVudCA9IHRydWVcbiAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGUucG9zaXRpb24gPSBjYXB0dXJlRW5kXG4gICAgICAgIHN0YXRlLmxpbmUgPSBfbGluZVxuICAgICAgICBzdGF0ZS5saW5lU3RhcnQgPSBfbGluZVN0YXJ0XG4gICAgICAgIHN0YXRlLmxpbmVJbmRlbnQgPSBfbGluZUluZGVudFxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChoYXNQZW5kaW5nQ29udGVudCkge1xuICAgICAgY2FwdHVyZVNlZ21lbnQoc3RhdGUsIGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZCwgZmFsc2UpXG4gICAgICB3cml0ZUZvbGRlZExpbmVzKHN0YXRlLCBzdGF0ZS5saW5lIC0gX2xpbmUpXG4gICAgICBjYXB0dXJlU3RhcnQgPSBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb25cbiAgICAgIGhhc1BlbmRpbmdDb250ZW50ID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoIWlzV2hpdGVTcGFjZShjaCkpIHtcbiAgICAgIGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvbiArIDFcbiAgICB9XG5cbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgfVxuXG4gIGNhcHR1cmVTZWdtZW50KHN0YXRlLCBjYXB0dXJlU3RhcnQsIGNhcHR1cmVFbmQsIGZhbHNlKVxuXG4gIGlmIChzdGF0ZS5yZXN1bHQpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgc3RhdGUua2luZCA9IF9raW5kXG4gIHN0YXRlLnJlc3VsdCA9IF9yZXN1bHRcbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIHJlYWRTaW5nbGVRdW90ZWRTY2FsYXIgKHN0YXRlLCBub2RlSW5kZW50KSB7XG4gIGxldCBjYXB0dXJlU3RhcnRcbiAgbGV0IGNhcHR1cmVFbmRcblxuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gIGlmIChjaCAhPT0gMHgyNy8qICcgKi8pIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHN0YXRlLmtpbmQgPSAnc2NhbGFyJ1xuICBzdGF0ZS5yZXN1bHQgPSAnJ1xuICBzdGF0ZS5wb3NpdGlvbisrXG4gIGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvblxuXG4gIHdoaWxlICgoY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSkgIT09IDApIHtcbiAgICBpZiAoY2ggPT09IDB4MjcvKiAnICovKSB7XG4gICAgICBjYXB0dXJlU2VnbWVudChzdGF0ZSwgY2FwdHVyZVN0YXJ0LCBzdGF0ZS5wb3NpdGlvbiwgdHJ1ZSlcbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuXG4gICAgICBpZiAoY2ggPT09IDB4MjcvKiAnICovKSB7XG4gICAgICAgIGNhcHR1cmVTdGFydCA9IHN0YXRlLnBvc2l0aW9uXG4gICAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgICAgY2FwdHVyZUVuZCA9IHN0YXRlLnBvc2l0aW9uXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNFb2woY2gpKSB7XG4gICAgICBjYXB0dXJlU2VnbWVudChzdGF0ZSwgY2FwdHVyZVN0YXJ0LCBjYXB0dXJlRW5kLCB0cnVlKVxuICAgICAgd3JpdGVGb2xkZWRMaW5lcyhzdGF0ZSwgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgZmFsc2UsIG5vZGVJbmRlbnQpKVxuICAgICAgY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IHN0YXRlLnBvc2l0aW9uXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd1bmV4cGVjdGVkIGVuZCBvZiB0aGUgZG9jdW1lbnQgd2l0aGluIGEgc2luZ2xlIHF1b3RlZCBzY2FsYXInKVxuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgICBpZiAoIWlzV2hpdGVTcGFjZShjaCkpIHtcbiAgICAgICAgY2FwdHVyZUVuZCA9IHN0YXRlLnBvc2l0aW9uXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuZXhwZWN0ZWQgZW5kIG9mIHRoZSBzdHJlYW0gd2l0aGluIGEgc2luZ2xlIHF1b3RlZCBzY2FsYXInKVxufVxuXG5mdW5jdGlvbiByZWFkRG91YmxlUXVvdGVkU2NhbGFyIChzdGF0ZSwgbm9kZUluZGVudCkge1xuICBsZXQgY2FwdHVyZVN0YXJ0XG4gIGxldCBjYXB0dXJlRW5kXG4gIGxldCB0bXBcblxuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gIGlmIChjaCAhPT0gMHgyMi8qIFwiICovKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBzdGF0ZS5raW5kID0gJ3NjYWxhcidcbiAgc3RhdGUucmVzdWx0ID0gJydcbiAgc3RhdGUucG9zaXRpb24rK1xuICBjYXB0dXJlU3RhcnQgPSBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb25cblxuICB3aGlsZSAoKGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpICE9PSAwKSB7XG4gICAgaWYgKGNoID09PSAweDIyLyogXCIgKi8pIHtcbiAgICAgIGNhcHR1cmVTZWdtZW50KHN0YXRlLCBjYXB0dXJlU3RhcnQsIHN0YXRlLnBvc2l0aW9uLCB0cnVlKVxuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDVDLyogXFwgKi8pIHtcbiAgICAgIGNhcHR1cmVTZWdtZW50KHN0YXRlLCBjYXB0dXJlU3RhcnQsIHN0YXRlLnBvc2l0aW9uLCB0cnVlKVxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG5cbiAgICAgIGlmIChpc0VvbChjaCkpIHtcbiAgICAgICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgZmFsc2UsIG5vZGVJbmRlbnQpXG5cbiAgICAgICAgLy8gVE9ETzogcmV3b3JrIHRvIGlubGluZSBmbiB3aXRoIG5vIHR5cGUgY2FzdD9cbiAgICAgIH0gZWxzZSBpZiAoY2ggPCAyNTYgJiYgc2ltcGxlRXNjYXBlQ2hlY2tbY2hdKSB7XG4gICAgICAgIHN0YXRlLnJlc3VsdCArPSBzaW1wbGVFc2NhcGVNYXBbY2hdXG4gICAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgIH0gZWxzZSBpZiAoKHRtcCA9IGVzY2FwZWRIZXhMZW4oY2gpKSA+IDApIHtcbiAgICAgICAgbGV0IGhleExlbmd0aCA9IHRtcFxuICAgICAgICBsZXQgaGV4UmVzdWx0ID0gMFxuXG4gICAgICAgIGZvciAoOyBoZXhMZW5ndGggPiAwOyBoZXhMZW5ndGgtLSkge1xuICAgICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuXG4gICAgICAgICAgaWYgKCh0bXAgPSBmcm9tSGV4Q29kZShjaCkpID49IDApIHtcbiAgICAgICAgICAgIGhleFJlc3VsdCA9IChoZXhSZXN1bHQgPDwgNCkgKyB0bXBcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2V4cGVjdGVkIGhleGFkZWNpbWFsIGNoYXJhY3RlcicpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUucmVzdWx0ICs9IGNoYXJGcm9tQ29kZXBvaW50KGhleFJlc3VsdClcblxuICAgICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndW5rbm93biBlc2NhcGUgc2VxdWVuY2UnKVxuICAgICAgfVxuXG4gICAgICBjYXB0dXJlU3RhcnQgPSBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb25cbiAgICB9IGVsc2UgaWYgKGlzRW9sKGNoKSkge1xuICAgICAgY2FwdHVyZVNlZ21lbnQoc3RhdGUsIGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZCwgdHJ1ZSlcbiAgICAgIHdyaXRlRm9sZGVkTGluZXMoc3RhdGUsIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIGZhbHNlLCBub2RlSW5kZW50KSlcbiAgICAgIGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvblxuICAgIH0gZWxzZSBpZiAoc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUpKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndW5leHBlY3RlZCBlbmQgb2YgdGhlIGRvY3VtZW50IHdpdGhpbiBhIGRvdWJsZSBxdW90ZWQgc2NhbGFyJylcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGUucG9zaXRpb24rK1xuICAgICAgaWYgKCFpc1doaXRlU3BhY2UoY2gpKSB7XG4gICAgICAgIGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvblxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRocm93RXJyb3Ioc3RhdGUsICd1bmV4cGVjdGVkIGVuZCBvZiB0aGUgc3RyZWFtIHdpdGhpbiBhIGRvdWJsZSBxdW90ZWQgc2NhbGFyJylcbn1cblxuZnVuY3Rpb24gcmVhZEZsb3dDb2xsZWN0aW9uIChzdGF0ZSwgbm9kZUluZGVudCkge1xuICBsZXQgcmVhZE5leHQgPSB0cnVlXG4gIGxldCBfbGluZVxuICBsZXQgX2xpbmVTdGFydFxuICBsZXQgX3Bvc1xuICBjb25zdCBfdGFnID0gc3RhdGUudGFnXG4gIGxldCBfcmVzdWx0XG4gIGNvbnN0IF9hbmNob3IgPSBzdGF0ZS5hbmNob3JcbiAgbGV0IHRlcm1pbmF0b3JcbiAgbGV0IGlzUGFpclxuICBsZXQgaXNFeHBsaWNpdFBhaXJcbiAgbGV0IGlzTWFwcGluZ1xuICBjb25zdCBvdmVycmlkYWJsZUtleXMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIGxldCBrZXlOb2RlXG4gIGxldCBrZXlUYWdcbiAgbGV0IHZhbHVlTm9kZVxuXG4gIGxldCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgaWYgKGNoID09PSAweDVCLyogWyAqLykge1xuICAgIHRlcm1pbmF0b3IgPSAweDVELyogXSAqL1xuICAgIGlzTWFwcGluZyA9IGZhbHNlXG4gICAgX3Jlc3VsdCA9IFtdXG4gIH0gZWxzZSBpZiAoY2ggPT09IDB4N0IvKiB7ICovKSB7XG4gICAgdGVybWluYXRvciA9IDB4N0QvKiB9ICovXG4gICAgaXNNYXBwaW5nID0gdHJ1ZVxuICAgIF9yZXN1bHQgPSB7fVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaWYgKHN0YXRlLmFuY2hvciAhPT0gbnVsbCkge1xuICAgIHN0b3JlQW5jaG9yKHN0YXRlLCBzdGF0ZS5hbmNob3IsIF9yZXN1bHQpXG4gIH1cblxuICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcblxuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCBub2RlSW5kZW50KVxuXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSB0ZXJtaW5hdG9yKSB7XG4gICAgICBzdGF0ZS5wb3NpdGlvbisrXG4gICAgICBzdGF0ZS50YWcgPSBfdGFnXG4gICAgICBzdGF0ZS5hbmNob3IgPSBfYW5jaG9yXG4gICAgICBzdGF0ZS5raW5kID0gaXNNYXBwaW5nID8gJ21hcHBpbmcnIDogJ3NlcXVlbmNlJ1xuICAgICAgc3RhdGUucmVzdWx0ID0gX3Jlc3VsdFxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2UgaWYgKCFyZWFkTmV4dCkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ21pc3NlZCBjb21tYSBiZXR3ZWVuIGZsb3cgY29sbGVjdGlvbiBlbnRyaWVzJylcbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDJDLyogLCAqLykge1xuICAgICAgLy8gXCJmbG93IGNvbGxlY3Rpb24gZW50cmllcyBjYW4gbmV2ZXIgYmUgY29tcGxldGVseSBlbXB0eVwiLCBhcyBwZXIgWUFNTCAxLjIsIHNlY3Rpb24gNy40XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCBcImV4cGVjdGVkIHRoZSBub2RlIGNvbnRlbnQsIGJ1dCBmb3VuZCAnLCdcIilcbiAgICB9XG5cbiAgICBrZXlUYWcgPSBrZXlOb2RlID0gdmFsdWVOb2RlID0gbnVsbFxuICAgIGlzUGFpciA9IGlzRXhwbGljaXRQYWlyID0gZmFsc2VcblxuICAgIGlmIChjaCA9PT0gMHgzRi8qID8gKi8pIHtcbiAgICAgIGNvbnN0IGZvbGxvd2luZyA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKVxuXG4gICAgICBpZiAoaXNXc09yRW9sKGZvbGxvd2luZykpIHtcbiAgICAgICAgaXNQYWlyID0gaXNFeHBsaWNpdFBhaXIgPSB0cnVlXG4gICAgICAgIHN0YXRlLnBvc2l0aW9uKytcbiAgICAgICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgbm9kZUluZGVudClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfbGluZSA9IHN0YXRlLmxpbmUgLy8gU2F2ZSB0aGUgY3VycmVudCBsaW5lLlxuICAgIF9saW5lU3RhcnQgPSBzdGF0ZS5saW5lU3RhcnRcbiAgICBfcG9zID0gc3RhdGUucG9zaXRpb25cbiAgICBjb21wb3NlTm9kZShzdGF0ZSwgbm9kZUluZGVudCwgQ09OVEVYVF9GTE9XX0lOLCBmYWxzZSwgdHJ1ZSlcbiAgICBrZXlUYWcgPSBzdGF0ZS50YWdcbiAgICBrZXlOb2RlID0gc3RhdGUucmVzdWx0XG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgbm9kZUluZGVudClcblxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIGlmICgoaXNFeHBsaWNpdFBhaXIgfHwgc3RhdGUubGluZSA9PT0gX2xpbmUpICYmIGNoID09PSAweDNBLyogOiAqLykge1xuICAgICAgaXNQYWlyID0gdHJ1ZVxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCBub2RlSW5kZW50KVxuICAgICAgY29tcG9zZU5vZGUoc3RhdGUsIG5vZGVJbmRlbnQsIENPTlRFWFRfRkxPV19JTiwgZmFsc2UsIHRydWUpXG4gICAgICB2YWx1ZU5vZGUgPSBzdGF0ZS5yZXN1bHRcbiAgICB9XG5cbiAgICBpZiAoaXNNYXBwaW5nKSB7XG4gICAgICBzdG9yZU1hcHBpbmdQYWlyKHN0YXRlLCBfcmVzdWx0LCBvdmVycmlkYWJsZUtleXMsIGtleVRhZywga2V5Tm9kZSwgdmFsdWVOb2RlLCBfbGluZSwgX2xpbmVTdGFydCwgX3BvcylcbiAgICB9IGVsc2UgaWYgKGlzUGFpcikge1xuICAgICAgX3Jlc3VsdC5wdXNoKHN0b3JlTWFwcGluZ1BhaXIoc3RhdGUsIG51bGwsIG92ZXJyaWRhYmxlS2V5cywga2V5VGFnLCBrZXlOb2RlLCB2YWx1ZU5vZGUsIF9saW5lLCBfbGluZVN0YXJ0LCBfcG9zKSlcbiAgICB9IGVsc2Uge1xuICAgICAgX3Jlc3VsdC5wdXNoKGtleU5vZGUpXG4gICAgfVxuXG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgbm9kZUluZGVudClcblxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIGlmIChjaCA9PT0gMHgyQy8qICwgKi8pIHtcbiAgICAgIHJlYWROZXh0ID0gdHJ1ZVxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlYWROZXh0ID0gZmFsc2VcbiAgICB9XG4gIH1cblxuICB0aHJvd0Vycm9yKHN0YXRlLCAndW5leHBlY3RlZCBlbmQgb2YgdGhlIHN0cmVhbSB3aXRoaW4gYSBmbG93IGNvbGxlY3Rpb24nKVxufVxuXG5mdW5jdGlvbiByZWFkQmxvY2tTY2FsYXIgKHN0YXRlLCBub2RlSW5kZW50KSB7XG4gIGxldCBmb2xkaW5nXG4gIGxldCBjaG9tcGluZyA9IENIT01QSU5HX0NMSVBcbiAgbGV0IGRpZFJlYWRDb250ZW50ID0gZmFsc2VcbiAgbGV0IGRldGVjdGVkSW5kZW50ID0gZmFsc2VcbiAgbGV0IHRleHRJbmRlbnQgPSBub2RlSW5kZW50XG4gIGxldCBlbXB0eUxpbmVzID0gMFxuICBsZXQgYXRNb3JlSW5kZW50ZWQgPSBmYWxzZVxuICBsZXQgdG1wXG5cbiAgbGV0IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICBpZiAoY2ggPT09IDB4N0MvKiB8ICovKSB7XG4gICAgZm9sZGluZyA9IGZhbHNlXG4gIH0gZWxzZSBpZiAoY2ggPT09IDB4M0UvKiA+ICovKSB7XG4gICAgZm9sZGluZyA9IHRydWVcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHN0YXRlLmtpbmQgPSAnc2NhbGFyJ1xuICBzdGF0ZS5yZXN1bHQgPSAnJ1xuXG4gIHdoaWxlIChjaCAhPT0gMCkge1xuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuXG4gICAgaWYgKGNoID09PSAweDJCLyogKyAqLyB8fCBjaCA9PT0gMHgyRC8qIC0gKi8pIHtcbiAgICAgIGlmIChDSE9NUElOR19DTElQID09PSBjaG9tcGluZykge1xuICAgICAgICBjaG9tcGluZyA9IChjaCA9PT0gMHgyQi8qICsgKi8pID8gQ0hPTVBJTkdfS0VFUCA6IENIT01QSU5HX1NUUklQXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAncmVwZWF0IG9mIGEgY2hvbXBpbmcgbW9kZSBpZGVudGlmaWVyJylcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCh0bXAgPSBmcm9tRGVjaW1hbENvZGUoY2gpKSA+PSAwKSB7XG4gICAgICBpZiAodG1wID09PSAwKSB7XG4gICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdiYWQgZXhwbGljaXQgaW5kZW50YXRpb24gd2lkdGggb2YgYSBibG9jayBzY2FsYXI7IGl0IGNhbm5vdCBiZSBsZXNzIHRoYW4gb25lJylcbiAgICAgIH0gZWxzZSBpZiAoIWRldGVjdGVkSW5kZW50KSB7XG4gICAgICAgIHRleHRJbmRlbnQgPSBub2RlSW5kZW50ICsgdG1wIC0gMVxuICAgICAgICBkZXRlY3RlZEluZGVudCA9IHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdyZXBlYXQgb2YgYW4gaW5kZW50YXRpb24gd2lkdGggaWRlbnRpZmllcicpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKGlzV2hpdGVTcGFjZShjaCkpIHtcbiAgICBkbyB7IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKSB9XG4gICAgd2hpbGUgKGlzV2hpdGVTcGFjZShjaCkpXG5cbiAgICBpZiAoY2ggPT09IDB4MjMvKiAjICovKSB7XG4gICAgICBkbyB7IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKSB9XG4gICAgICB3aGlsZSAoIWlzRW9sKGNoKSAmJiAoY2ggIT09IDApKVxuICAgIH1cbiAgfVxuXG4gIHdoaWxlIChjaCAhPT0gMCkge1xuICAgIHJlYWRMaW5lQnJlYWsoc3RhdGUpXG4gICAgc3RhdGUubGluZUluZGVudCA9IDBcblxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bm1vZGlmaWVkLWxvb3AtY29uZGl0aW9uXG4gICAgd2hpbGUgKCghZGV0ZWN0ZWRJbmRlbnQgfHwgc3RhdGUubGluZUluZGVudCA8IHRleHRJbmRlbnQpICYmXG4gICAgICAgICAgIChjaCA9PT0gMHgyMC8qIFNwYWNlICovKSkge1xuICAgICAgc3RhdGUubGluZUluZGVudCsrXG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgICB9XG5cbiAgICBpZiAoIWRldGVjdGVkSW5kZW50ICYmIHN0YXRlLmxpbmVJbmRlbnQgPiB0ZXh0SW5kZW50KSB7XG4gICAgICB0ZXh0SW5kZW50ID0gc3RhdGUubGluZUluZGVudFxuICAgIH1cblxuICAgIGlmIChpc0VvbChjaCkpIHtcbiAgICAgIGVtcHR5TGluZXMrK1xuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICBpZiAoIWRldGVjdGVkSW5kZW50ICYmIHRleHRJbmRlbnQgPT09IDApIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdtaXNzaW5nIGluZGVudGF0aW9uIGZvciBibG9jayBzY2FsYXInKVxuICAgIH1cblxuICAgIC8vIEVuZCBvZiB0aGUgc2NhbGFyLlxuICAgIGlmIChzdGF0ZS5saW5lSW5kZW50IDwgdGV4dEluZGVudCkge1xuICAgICAgLy8gUGVyZm9ybSB0aGUgY2hvbXBpbmcuXG4gICAgICBpZiAoY2hvbXBpbmcgPT09IENIT01QSU5HX0tFRVApIHtcbiAgICAgICAgc3RhdGUucmVzdWx0ICs9IGNvbW1vbi5yZXBlYXQoJ1xcbicsIGRpZFJlYWRDb250ZW50ID8gMSArIGVtcHR5TGluZXMgOiBlbXB0eUxpbmVzKVxuICAgICAgfSBlbHNlIGlmIChjaG9tcGluZyA9PT0gQ0hPTVBJTkdfQ0xJUCkge1xuICAgICAgICBpZiAoZGlkUmVhZENvbnRlbnQpIHsgLy8gaS5lLiBvbmx5IGlmIHRoZSBzY2FsYXIgaXMgbm90IGVtcHR5LlxuICAgICAgICAgIHN0YXRlLnJlc3VsdCArPSAnXFxuJ1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEJyZWFrIHRoaXMgYHdoaWxlYCBjeWNsZSBhbmQgZ28gdG8gdGhlIGZ1bmNpdG9uJ3MgZXBpbG9ndWUuXG4gICAgICBicmVha1xuICAgIH1cblxuICAgIC8vIEZvbGRlZCBzdHlsZTogdXNlIGZhbmN5IHJ1bGVzIHRvIGhhbmRsZSBsaW5lIGJyZWFrcy5cbiAgICBpZiAoZm9sZGluZykge1xuICAgICAgLy8gTGluZXMgc3RhcnRpbmcgd2l0aCB3aGl0ZSBzcGFjZSBjaGFyYWN0ZXJzIChtb3JlLWluZGVudGVkIGxpbmVzKSBhcmUgbm90IGZvbGRlZC5cbiAgICAgIGlmIChpc1doaXRlU3BhY2UoY2gpKSB7XG4gICAgICAgIGF0TW9yZUluZGVudGVkID0gdHJ1ZVxuICAgICAgICAvLyBleGNlcHQgZm9yIHRoZSBmaXJzdCBjb250ZW50IGxpbmUgKGNmLiBFeGFtcGxlIDguMSlcbiAgICAgICAgc3RhdGUucmVzdWx0ICs9IGNvbW1vbi5yZXBlYXQoJ1xcbicsIGRpZFJlYWRDb250ZW50ID8gMSArIGVtcHR5TGluZXMgOiBlbXB0eUxpbmVzKVxuXG4gICAgICAvLyBFbmQgb2YgbW9yZS1pbmRlbnRlZCBibG9jay5cbiAgICAgIH0gZWxzZSBpZiAoYXRNb3JlSW5kZW50ZWQpIHtcbiAgICAgICAgYXRNb3JlSW5kZW50ZWQgPSBmYWxzZVxuICAgICAgICBzdGF0ZS5yZXN1bHQgKz0gY29tbW9uLnJlcGVhdCgnXFxuJywgZW1wdHlMaW5lcyArIDEpXG5cbiAgICAgIC8vIEp1c3Qgb25lIGxpbmUgYnJlYWsgLSBwZXJjZWl2ZSBhcyB0aGUgc2FtZSBsaW5lLlxuICAgICAgfSBlbHNlIGlmIChlbXB0eUxpbmVzID09PSAwKSB7XG4gICAgICAgIGlmIChkaWRSZWFkQ29udGVudCkgeyAvLyBpLmUuIG9ubHkgaWYgd2UgaGF2ZSBhbHJlYWR5IHJlYWQgc29tZSBzY2FsYXIgY29udGVudC5cbiAgICAgICAgICBzdGF0ZS5yZXN1bHQgKz0gJyAnXG4gICAgICAgIH1cblxuICAgICAgLy8gU2V2ZXJhbCBsaW5lIGJyZWFrcyAtIHBlcmNlaXZlIGFzIGRpZmZlcmVudCBsaW5lcy5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXRlLnJlc3VsdCArPSBjb21tb24ucmVwZWF0KCdcXG4nLCBlbXB0eUxpbmVzKVxuICAgICAgfVxuXG4gICAgLy8gTGl0ZXJhbCBzdHlsZToganVzdCBhZGQgZXhhY3QgbnVtYmVyIG9mIGxpbmUgYnJlYWtzIGJldHdlZW4gY29udGVudCBsaW5lcy5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gS2VlcCBhbGwgbGluZSBicmVha3MgZXhjZXB0IHRoZSBoZWFkZXIgbGluZSBicmVhay5cbiAgICAgIHN0YXRlLnJlc3VsdCArPSBjb21tb24ucmVwZWF0KCdcXG4nLCBkaWRSZWFkQ29udGVudCA/IDEgKyBlbXB0eUxpbmVzIDogZW1wdHlMaW5lcylcbiAgICB9XG5cbiAgICBkaWRSZWFkQ29udGVudCA9IHRydWVcbiAgICBkZXRlY3RlZEluZGVudCA9IHRydWVcbiAgICBlbXB0eUxpbmVzID0gMFxuICAgIGNvbnN0IGNhcHR1cmVTdGFydCA9IHN0YXRlLnBvc2l0aW9uXG5cbiAgICB3aGlsZSAoIWlzRW9sKGNoKSAmJiAoY2ggIT09IDApKSB7XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgICB9XG5cbiAgICBjYXB0dXJlU2VnbWVudChzdGF0ZSwgY2FwdHVyZVN0YXJ0LCBzdGF0ZS5wb3NpdGlvbiwgZmFsc2UpXG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiByZWFkQmxvY2tTZXF1ZW5jZSAoc3RhdGUsIG5vZGVJbmRlbnQpIHtcbiAgY29uc3QgX3RhZyA9IHN0YXRlLnRhZ1xuICBjb25zdCBfYW5jaG9yID0gc3RhdGUuYW5jaG9yXG4gIGNvbnN0IF9yZXN1bHQgPSBbXVxuICBsZXQgZGV0ZWN0ZWQgPSBmYWxzZVxuXG4gIC8vIHRoZXJlIGlzIGEgbGVhZGluZyB0YWIgYmVmb3JlIHRoaXMgdG9rZW4sIHNvIGl0IGNhbid0IGJlIGEgYmxvY2sgc2VxdWVuY2UvbWFwcGluZztcbiAgLy8gaXQgY2FuIHN0aWxsIGJlIGZsb3cgc2VxdWVuY2UvbWFwcGluZyBvciBhIHNjYWxhclxuICBpZiAoc3RhdGUuZmlyc3RUYWJJbkxpbmUgIT09IC0xKSByZXR1cm4gZmFsc2VcblxuICBpZiAoc3RhdGUuYW5jaG9yICE9PSBudWxsKSB7XG4gICAgc3RvcmVBbmNob3Ioc3RhdGUsIHN0YXRlLmFuY2hvciwgX3Jlc3VsdClcbiAgfVxuXG4gIGxldCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgaWYgKHN0YXRlLmZpcnN0VGFiSW5MaW5lICE9PSAtMSkge1xuICAgICAgc3RhdGUucG9zaXRpb24gPSBzdGF0ZS5maXJzdFRhYkluTGluZVxuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RhYiBjaGFyYWN0ZXJzIG11c3Qgbm90IGJlIHVzZWQgaW4gaW5kZW50YXRpb24nKVxuICAgIH1cblxuICAgIGlmIChjaCAhPT0gMHgyRC8qIC0gKi8pIHtcbiAgICAgIGJyZWFrXG4gICAgfVxuXG4gICAgY29uc3QgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpXG5cbiAgICBpZiAoIWlzV3NPckVvbChmb2xsb3dpbmcpKSB7XG4gICAgICBicmVha1xuICAgIH1cblxuICAgIGRldGVjdGVkID0gdHJ1ZVxuICAgIHN0YXRlLnBvc2l0aW9uKytcblxuICAgIGlmIChza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSkpIHtcbiAgICAgIGlmIChzdGF0ZS5saW5lSW5kZW50IDw9IG5vZGVJbmRlbnQpIHtcbiAgICAgICAgX3Jlc3VsdC5wdXNoKG51bGwpXG4gICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBfbGluZSA9IHN0YXRlLmxpbmVcbiAgICBjb21wb3NlTm9kZShzdGF0ZSwgbm9kZUluZGVudCwgQ09OVEVYVF9CTE9DS19JTiwgZmFsc2UsIHRydWUpXG4gICAgX3Jlc3VsdC5wdXNoKHN0YXRlLnJlc3VsdClcbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSlcblxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbilcblxuICAgIGlmICgoc3RhdGUubGluZSA9PT0gX2xpbmUgfHwgc3RhdGUubGluZUluZGVudCA+IG5vZGVJbmRlbnQpICYmIChjaCAhPT0gMCkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdiYWQgaW5kZW50YXRpb24gb2YgYSBzZXF1ZW5jZSBlbnRyeScpXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5saW5lSW5kZW50IDwgbm9kZUluZGVudCkge1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoZGV0ZWN0ZWQpIHtcbiAgICBzdGF0ZS50YWcgPSBfdGFnXG4gICAgc3RhdGUuYW5jaG9yID0gX2FuY2hvclxuICAgIHN0YXRlLmtpbmQgPSAnc2VxdWVuY2UnXG4gICAgc3RhdGUucmVzdWx0ID0gX3Jlc3VsdFxuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIHJlYWRCbG9ja01hcHBpbmcgKHN0YXRlLCBub2RlSW5kZW50LCBmbG93SW5kZW50KSB7XG4gIGxldCBhbGxvd0NvbXBhY3RcbiAgbGV0IF9rZXlMaW5lXG4gIGxldCBfa2V5TGluZVN0YXJ0XG4gIGxldCBfa2V5UG9zXG4gIGNvbnN0IF90YWcgPSBzdGF0ZS50YWdcbiAgY29uc3QgX2FuY2hvciA9IHN0YXRlLmFuY2hvclxuICBjb25zdCBfcmVzdWx0ID0ge31cbiAgY29uc3Qgb3ZlcnJpZGFibGVLZXlzID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICBsZXQga2V5VGFnID0gbnVsbFxuICBsZXQga2V5Tm9kZSA9IG51bGxcbiAgbGV0IHZhbHVlTm9kZSA9IG51bGxcbiAgbGV0IGF0RXhwbGljaXRLZXkgPSBmYWxzZVxuICBsZXQgZGV0ZWN0ZWQgPSBmYWxzZVxuXG4gIC8vIHRoZXJlIGlzIGEgbGVhZGluZyB0YWIgYmVmb3JlIHRoaXMgdG9rZW4sIHNvIGl0IGNhbid0IGJlIGEgYmxvY2sgc2VxdWVuY2UvbWFwcGluZztcbiAgLy8gaXQgY2FuIHN0aWxsIGJlIGZsb3cgc2VxdWVuY2UvbWFwcGluZyBvciBhIHNjYWxhclxuICBpZiAoc3RhdGUuZmlyc3RUYWJJbkxpbmUgIT09IC0xKSByZXR1cm4gZmFsc2VcblxuICBpZiAoc3RhdGUuYW5jaG9yICE9PSBudWxsKSB7XG4gICAgc3RvcmVBbmNob3Ioc3RhdGUsIHN0YXRlLmFuY2hvciwgX3Jlc3VsdClcbiAgfVxuXG4gIGxldCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgaWYgKCFhdEV4cGxpY2l0S2V5ICYmIHN0YXRlLmZpcnN0VGFiSW5MaW5lICE9PSAtMSkge1xuICAgICAgc3RhdGUucG9zaXRpb24gPSBzdGF0ZS5maXJzdFRhYkluTGluZVxuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RhYiBjaGFyYWN0ZXJzIG11c3Qgbm90IGJlIHVzZWQgaW4gaW5kZW50YXRpb24nKVxuICAgIH1cblxuICAgIGNvbnN0IGZvbGxvd2luZyA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKVxuICAgIGNvbnN0IF9saW5lID0gc3RhdGUubGluZSAvLyBTYXZlIHRoZSBjdXJyZW50IGxpbmUuXG5cbiAgICAvL1xuICAgIC8vIEV4cGxpY2l0IG5vdGF0aW9uIGNhc2UuIFRoZXJlIGFyZSB0d28gc2VwYXJhdGUgYmxvY2tzOlxuICAgIC8vIGZpcnN0IGZvciB0aGUga2V5IChkZW5vdGVkIGJ5IFwiP1wiKSBhbmQgc2Vjb25kIGZvciB0aGUgdmFsdWUgKGRlbm90ZWQgYnkgXCI6XCIpXG4gICAgLy9cbiAgICBpZiAoKGNoID09PSAweDNGLyogPyAqLyB8fCBjaCA9PT0gMHgzQS8qIDogKi8pICYmIGlzV3NPckVvbChmb2xsb3dpbmcpKSB7XG4gICAgICBpZiAoY2ggPT09IDB4M0YvKiA/ICovKSB7XG4gICAgICAgIGlmIChhdEV4cGxpY2l0S2V5KSB7XG4gICAgICAgICAgc3RvcmVNYXBwaW5nUGFpcihzdGF0ZSwgX3Jlc3VsdCwgb3ZlcnJpZGFibGVLZXlzLCBrZXlUYWcsIGtleU5vZGUsIG51bGwsIF9rZXlMaW5lLCBfa2V5TGluZVN0YXJ0LCBfa2V5UG9zKVxuICAgICAgICAgIGtleVRhZyA9IGtleU5vZGUgPSB2YWx1ZU5vZGUgPSBudWxsXG4gICAgICAgIH1cblxuICAgICAgICBkZXRlY3RlZCA9IHRydWVcbiAgICAgICAgYXRFeHBsaWNpdEtleSA9IHRydWVcbiAgICAgICAgYWxsb3dDb21wYWN0ID0gdHJ1ZVxuICAgICAgfSBlbHNlIGlmIChhdEV4cGxpY2l0S2V5KSB7XG4gICAgICAgIC8vIGkuZS4gMHgzQS8qIDogKi8gPT09IGNoYXJhY3RlciBhZnRlciB0aGUgZXhwbGljaXQga2V5LlxuICAgICAgICBhdEV4cGxpY2l0S2V5ID0gZmFsc2VcbiAgICAgICAgYWxsb3dDb21wYWN0ID0gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2luY29tcGxldGUgZXhwbGljaXQgbWFwcGluZyBwYWlyOyBhIGtleSBub2RlIGlzIG1pc3NlZDsgb3IgZm9sbG93ZWQgYnkgYSBub24tdGFidWxhdGVkIGVtcHR5IGxpbmUnKVxuICAgICAgfVxuXG4gICAgICBzdGF0ZS5wb3NpdGlvbiArPSAxXG4gICAgICBjaCA9IGZvbGxvd2luZ1xuXG4gICAgLy9cbiAgICAvLyBJbXBsaWNpdCBub3RhdGlvbiBjYXNlLiBGbG93LXN0eWxlIG5vZGUgYXMgdGhlIGtleSBmaXJzdCwgdGhlbiBcIjpcIiwgYW5kIHRoZSB2YWx1ZS5cbiAgICAvL1xuICAgIH0gZWxzZSB7XG4gICAgICBfa2V5TGluZSA9IHN0YXRlLmxpbmVcbiAgICAgIF9rZXlMaW5lU3RhcnQgPSBzdGF0ZS5saW5lU3RhcnRcbiAgICAgIF9rZXlQb3MgPSBzdGF0ZS5wb3NpdGlvblxuXG4gICAgICBpZiAoIWNvbXBvc2VOb2RlKHN0YXRlLCBmbG93SW5kZW50LCBDT05URVhUX0ZMT1dfT1VULCBmYWxzZSwgdHJ1ZSkpIHtcbiAgICAgICAgLy8gTmVpdGhlciBpbXBsaWNpdCBub3IgZXhwbGljaXQgbm90YXRpb24uXG4gICAgICAgIC8vIFJlYWRpbmcgaXMgZG9uZS4gR28gdG8gdGhlIGVwaWxvZ3VlLlxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUubGluZSA9PT0gX2xpbmUpIHtcbiAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgICAgIHdoaWxlIChpc1doaXRlU3BhY2UoY2gpKSB7XG4gICAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2ggPT09IDB4M0EvKiA6ICovKSB7XG4gICAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG5cbiAgICAgICAgICBpZiAoIWlzV3NPckVvbChjaCkpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdhIHdoaXRlc3BhY2UgY2hhcmFjdGVyIGlzIGV4cGVjdGVkIGFmdGVyIHRoZSBrZXktdmFsdWUgc2VwYXJhdG9yIHdpdGhpbiBhIGJsb2NrIG1hcHBpbmcnKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChhdEV4cGxpY2l0S2V5KSB7XG4gICAgICAgICAgICBzdG9yZU1hcHBpbmdQYWlyKHN0YXRlLCBfcmVzdWx0LCBvdmVycmlkYWJsZUtleXMsIGtleVRhZywga2V5Tm9kZSwgbnVsbCwgX2tleUxpbmUsIF9rZXlMaW5lU3RhcnQsIF9rZXlQb3MpXG4gICAgICAgICAgICBrZXlUYWcgPSBrZXlOb2RlID0gdmFsdWVOb2RlID0gbnVsbFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGRldGVjdGVkID0gdHJ1ZVxuICAgICAgICAgIGF0RXhwbGljaXRLZXkgPSBmYWxzZVxuICAgICAgICAgIGFsbG93Q29tcGFjdCA9IGZhbHNlXG4gICAgICAgICAga2V5VGFnID0gc3RhdGUudGFnXG4gICAgICAgICAga2V5Tm9kZSA9IHN0YXRlLnJlc3VsdFxuICAgICAgICB9IGVsc2UgaWYgKGRldGVjdGVkKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2NhbiBub3QgcmVhZCBhbiBpbXBsaWNpdCBtYXBwaW5nIHBhaXI7IGEgY29sb24gaXMgbWlzc2VkJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGF0ZS50YWcgPSBfdGFnXG4gICAgICAgICAgc3RhdGUuYW5jaG9yID0gX2FuY2hvclxuICAgICAgICAgIHJldHVybiB0cnVlIC8vIEtlZXAgdGhlIHJlc3VsdCBvZiBgY29tcG9zZU5vZGVgLlxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGRldGVjdGVkKSB7XG4gICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdjYW4gbm90IHJlYWQgYSBibG9jayBtYXBwaW5nIGVudHJ5OyBhIG11bHRpbGluZSBrZXkgbWF5IG5vdCBiZSBhbiBpbXBsaWNpdCBrZXknKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGUudGFnID0gX3RhZ1xuICAgICAgICBzdGF0ZS5hbmNob3IgPSBfYW5jaG9yXG4gICAgICAgIHJldHVybiB0cnVlIC8vIEtlZXAgdGhlIHJlc3VsdCBvZiBgY29tcG9zZU5vZGVgLlxuICAgICAgfVxuICAgIH1cblxuICAgIC8vXG4gICAgLy8gQ29tbW9uIHJlYWRpbmcgY29kZSBmb3IgYm90aCBleHBsaWNpdCBhbmQgaW1wbGljaXQgbm90YXRpb25zLlxuICAgIC8vXG4gICAgaWYgKHN0YXRlLmxpbmUgPT09IF9saW5lIHx8IHN0YXRlLmxpbmVJbmRlbnQgPiBub2RlSW5kZW50KSB7XG4gICAgICBpZiAoYXRFeHBsaWNpdEtleSkge1xuICAgICAgICBfa2V5TGluZSA9IHN0YXRlLmxpbmVcbiAgICAgICAgX2tleUxpbmVTdGFydCA9IHN0YXRlLmxpbmVTdGFydFxuICAgICAgICBfa2V5UG9zID0gc3RhdGUucG9zaXRpb25cbiAgICAgIH1cblxuICAgICAgaWYgKGNvbXBvc2VOb2RlKHN0YXRlLCBub2RlSW5kZW50LCBDT05URVhUX0JMT0NLX09VVCwgdHJ1ZSwgYWxsb3dDb21wYWN0KSkge1xuICAgICAgICBpZiAoYXRFeHBsaWNpdEtleSkge1xuICAgICAgICAgIGtleU5vZGUgPSBzdGF0ZS5yZXN1bHRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWx1ZU5vZGUgPSBzdGF0ZS5yZXN1bHRcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIWF0RXhwbGljaXRLZXkpIHtcbiAgICAgICAgc3RvcmVNYXBwaW5nUGFpcihzdGF0ZSwgX3Jlc3VsdCwgb3ZlcnJpZGFibGVLZXlzLCBrZXlUYWcsIGtleU5vZGUsIHZhbHVlTm9kZSwgX2tleUxpbmUsIF9rZXlMaW5lU3RhcnQsIF9rZXlQb3MpXG4gICAgICAgIGtleVRhZyA9IGtleU5vZGUgPSB2YWx1ZU5vZGUgPSBudWxsXG4gICAgICB9XG5cbiAgICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIC0xKVxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICAgIH1cblxuICAgIGlmICgoc3RhdGUubGluZSA9PT0gX2xpbmUgfHwgc3RhdGUubGluZUluZGVudCA+IG5vZGVJbmRlbnQpICYmIChjaCAhPT0gMCkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdiYWQgaW5kZW50YXRpb24gb2YgYSBtYXBwaW5nIGVudHJ5JylcbiAgICB9IGVsc2UgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPCBub2RlSW5kZW50KSB7XG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIEVwaWxvZ3VlLlxuICAvL1xuXG4gIC8vIFNwZWNpYWwgY2FzZTogbGFzdCBtYXBwaW5nJ3Mgbm9kZSBjb250YWlucyBvbmx5IHRoZSBrZXkgaW4gZXhwbGljaXQgbm90YXRpb24uXG4gIGlmIChhdEV4cGxpY2l0S2V5KSB7XG4gICAgc3RvcmVNYXBwaW5nUGFpcihzdGF0ZSwgX3Jlc3VsdCwgb3ZlcnJpZGFibGVLZXlzLCBrZXlUYWcsIGtleU5vZGUsIG51bGwsIF9rZXlMaW5lLCBfa2V5TGluZVN0YXJ0LCBfa2V5UG9zKVxuICB9XG5cbiAgLy8gRXhwb3NlIHRoZSByZXN1bHRpbmcgbWFwcGluZy5cbiAgaWYgKGRldGVjdGVkKSB7XG4gICAgc3RhdGUudGFnID0gX3RhZ1xuICAgIHN0YXRlLmFuY2hvciA9IF9hbmNob3JcbiAgICBzdGF0ZS5raW5kID0gJ21hcHBpbmcnXG4gICAgc3RhdGUucmVzdWx0ID0gX3Jlc3VsdFxuICB9XG5cbiAgcmV0dXJuIGRldGVjdGVkXG59XG5cbmZ1bmN0aW9uIHJlYWRUYWdQcm9wZXJ0eSAoc3RhdGUpIHtcbiAgbGV0IGlzVmVyYmF0aW0gPSBmYWxzZVxuICBsZXQgaXNOYW1lZCA9IGZhbHNlXG4gIGxldCB0YWdIYW5kbGVcbiAgbGV0IHRhZ05hbWVcblxuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gIGlmIChjaCAhPT0gMHgyMS8qICEgKi8pIHJldHVybiBmYWxzZVxuXG4gIGlmIChzdGF0ZS50YWcgIT09IG51bGwpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZHVwbGljYXRpb24gb2YgYSB0YWcgcHJvcGVydHknKVxuICB9XG5cbiAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG5cbiAgaWYgKGNoID09PSAweDNDLyogPCAqLykge1xuICAgIGlzVmVyYmF0aW0gPSB0cnVlXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gIH0gZWxzZSBpZiAoY2ggPT09IDB4MjEvKiAhICovKSB7XG4gICAgaXNOYW1lZCA9IHRydWVcbiAgICB0YWdIYW5kbGUgPSAnISEnXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gIH0gZWxzZSB7XG4gICAgdGFnSGFuZGxlID0gJyEnXG4gIH1cblxuICBsZXQgX3Bvc2l0aW9uID0gc3RhdGUucG9zaXRpb25cblxuICBpZiAoaXNWZXJiYXRpbSkge1xuICAgIGRvIHsgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pIH1cbiAgICB3aGlsZSAoY2ggIT09IDAgJiYgY2ggIT09IDB4M0UvKiA+ICovKVxuXG4gICAgaWYgKHN0YXRlLnBvc2l0aW9uIDwgc3RhdGUubGVuZ3RoKSB7XG4gICAgICB0YWdOYW1lID0gc3RhdGUuaW5wdXQuc2xpY2UoX3Bvc2l0aW9uLCBzdGF0ZS5wb3NpdGlvbilcbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndW5leHBlY3RlZCBlbmQgb2YgdGhlIHN0cmVhbSB3aXRoaW4gYSB2ZXJiYXRpbSB0YWcnKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoY2ggIT09IDAgJiYgIWlzV3NPckVvbChjaCkpIHtcbiAgICAgIGlmIChjaCA9PT0gMHgyMS8qICEgKi8pIHtcbiAgICAgICAgaWYgKCFpc05hbWVkKSB7XG4gICAgICAgICAgdGFnSGFuZGxlID0gc3RhdGUuaW5wdXQuc2xpY2UoX3Bvc2l0aW9uIC0gMSwgc3RhdGUucG9zaXRpb24gKyAxKVxuXG4gICAgICAgICAgaWYgKCFQQVRURVJOX1RBR19IQU5ETEUudGVzdCh0YWdIYW5kbGUpKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnbmFtZWQgdGFnIGhhbmRsZSBjYW5ub3QgY29udGFpbiBzdWNoIGNoYXJhY3RlcnMnKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlzTmFtZWQgPSB0cnVlXG4gICAgICAgICAgX3Bvc2l0aW9uID0gc3RhdGUucG9zaXRpb24gKyAxXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RhZyBzdWZmaXggY2Fubm90IGNvbnRhaW4gZXhjbGFtYXRpb24gbWFya3MnKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICAgIH1cblxuICAgIHRhZ05hbWUgPSBzdGF0ZS5pbnB1dC5zbGljZShfcG9zaXRpb24sIHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgaWYgKFBBVFRFUk5fRkxPV19JTkRJQ0FUT1JTLnRlc3QodGFnTmFtZSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd0YWcgc3VmZml4IGNhbm5vdCBjb250YWluIGZsb3cgaW5kaWNhdG9yIGNoYXJhY3RlcnMnKVxuICAgIH1cbiAgfVxuXG4gIGlmICh0YWdOYW1lICYmICFQQVRURVJOX1RBR19VUkkudGVzdCh0YWdOYW1lKSkge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICd0YWcgbmFtZSBjYW5ub3QgY29udGFpbiBzdWNoIGNoYXJhY3RlcnM6ICcgKyB0YWdOYW1lKVxuICB9XG5cbiAgdHJ5IHtcbiAgICB0YWdOYW1lID0gZGVjb2RlVVJJQ29tcG9uZW50KHRhZ05hbWUpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICd0YWcgbmFtZSBpcyBtYWxmb3JtZWQ6ICcgKyB0YWdOYW1lKVxuICB9XG5cbiAgaWYgKGlzVmVyYmF0aW0pIHtcbiAgICBzdGF0ZS50YWcgPSB0YWdOYW1lXG4gIH0gZWxzZSBpZiAoX2hhc093blByb3BlcnR5LmNhbGwoc3RhdGUudGFnTWFwLCB0YWdIYW5kbGUpKSB7XG4gICAgc3RhdGUudGFnID0gc3RhdGUudGFnTWFwW3RhZ0hhbmRsZV0gKyB0YWdOYW1lXG4gIH0gZWxzZSBpZiAodGFnSGFuZGxlID09PSAnIScpIHtcbiAgICBzdGF0ZS50YWcgPSAnIScgKyB0YWdOYW1lXG4gIH0gZWxzZSBpZiAodGFnSGFuZGxlID09PSAnISEnKSB7XG4gICAgc3RhdGUudGFnID0gJ3RhZzp5YW1sLm9yZywyMDAyOicgKyB0YWdOYW1lXG4gIH0gZWxzZSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuZGVjbGFyZWQgdGFnIGhhbmRsZSBcIicgKyB0YWdIYW5kbGUgKyAnXCInKVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gcmVhZEFuY2hvclByb3BlcnR5IChzdGF0ZSkge1xuICBsZXQgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gIGlmIChjaCAhPT0gMHgyNi8qICYgKi8pIHJldHVybiBmYWxzZVxuXG4gIGlmIChzdGF0ZS5hbmNob3IgIT09IG51bGwpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZHVwbGljYXRpb24gb2YgYW4gYW5jaG9yIHByb3BlcnR5JylcbiAgfVxuXG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICBjb25zdCBfcG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvblxuXG4gIHdoaWxlIChjaCAhPT0gMCAmJiAhaXNXc09yRW9sKGNoKSAmJiAhaXNGbG93SW5kaWNhdG9yKGNoKSkge1xuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICB9XG5cbiAgaWYgKHN0YXRlLnBvc2l0aW9uID09PSBfcG9zaXRpb24pIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnbmFtZSBvZiBhbiBhbmNob3Igbm9kZSBtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIGNoYXJhY3RlcicpXG4gIH1cblxuICBzdGF0ZS5hbmNob3IgPSBzdGF0ZS5pbnB1dC5zbGljZShfcG9zaXRpb24sIHN0YXRlLnBvc2l0aW9uKVxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiByZWFkQWxpYXMgKHN0YXRlKSB7XG4gIGxldCBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgaWYgKGNoICE9PSAweDJBLyogKiAqLykgcmV0dXJuIGZhbHNlXG5cbiAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gIGNvbnN0IF9wb3NpdGlvbiA9IHN0YXRlLnBvc2l0aW9uXG5cbiAgd2hpbGUgKGNoICE9PSAwICYmICFpc1dzT3JFb2woY2gpICYmICFpc0Zsb3dJbmRpY2F0b3IoY2gpKSB7XG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gIH1cblxuICBpZiAoc3RhdGUucG9zaXRpb24gPT09IF9wb3NpdGlvbikge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICduYW1lIG9mIGFuIGFsaWFzIG5vZGUgbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBjaGFyYWN0ZXInKVxuICB9XG5cbiAgY29uc3QgYWxpYXMgPSBzdGF0ZS5pbnB1dC5zbGljZShfcG9zaXRpb24sIHN0YXRlLnBvc2l0aW9uKVxuXG4gIGlmICghX2hhc093blByb3BlcnR5LmNhbGwoc3RhdGUuYW5jaG9yTWFwLCBhbGlhcykpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAndW5pZGVudGlmaWVkIGFsaWFzIFwiJyArIGFsaWFzICsgJ1wiJylcbiAgfVxuXG4gIHN0YXRlLnJlc3VsdCA9IHN0YXRlLmFuY2hvck1hcFthbGlhc11cbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHRyeVJlYWRCbG9ja01hcHBpbmdGcm9tUHJvcGVydHkgKHN0YXRlLCBwcm9wZXJ0eVN0YXJ0LCBub2RlSW5kZW50LCBmbG93SW5kZW50KSB7XG4gIGNvbnN0IGZhbGxiYWNrU3RhdGUgPSBzbmFwc2hvdFN0YXRlKHN0YXRlKVxuXG4gIGJlZ2luQW5jaG9yVHJhbnNhY3Rpb24oc3RhdGUpXG4gIHJlc3RvcmVTdGF0ZShzdGF0ZSwgcHJvcGVydHlTdGFydClcblxuICAvLyBSZS1yZWFkIHRoZSBsZWFkaW5nIHByb3BlcnRpZXMgYXMgcGFydCBvZiB0aGUgZmlyc3QgaW1wbGljaXQga2V5LCBub3QgYXNcbiAgLy8gcHJvcGVydGllcyBvZiB0aGUgY3VycmVudCBub2RlLlxuICBzdGF0ZS50YWcgPSBudWxsXG4gIHN0YXRlLmFuY2hvciA9IG51bGxcbiAgc3RhdGUua2luZCA9IG51bGxcbiAgc3RhdGUucmVzdWx0ID0gbnVsbFxuXG4gIGlmIChyZWFkQmxvY2tNYXBwaW5nKHN0YXRlLCBub2RlSW5kZW50LCBmbG93SW5kZW50KSAmJiBzdGF0ZS5raW5kID09PSAnbWFwcGluZycpIHtcbiAgICBjb21taXRBbmNob3JUcmFuc2FjdGlvbihzdGF0ZSlcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgcm9sbGJhY2tBbmNob3JUcmFuc2FjdGlvbihzdGF0ZSlcbiAgcmVzdG9yZVN0YXRlKHN0YXRlLCBmYWxsYmFja1N0YXRlKVxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gY29tcG9zZU5vZGUgKHN0YXRlLCBwYXJlbnRJbmRlbnQsIG5vZGVDb250ZXh0LCBhbGxvd1RvU2VlaywgYWxsb3dDb21wYWN0KSB7XG4gIGxldCBhbGxvd0Jsb2NrU2NhbGFyc1xuICBsZXQgYWxsb3dCbG9ja0NvbGxlY3Rpb25zXG4gIGxldCBpbmRlbnRTdGF0dXMgPSAxIC8vIDE6IHRoaXM+cGFyZW50LCAwOiB0aGlzPXBhcmVudCwgLTE6IHRoaXM8cGFyZW50XG4gIGxldCBhdE5ld0xpbmUgPSBmYWxzZVxuICBsZXQgaGFzQ29udGVudCA9IGZhbHNlXG4gIGxldCBwcm9wZXJ0eVN0YXJ0ID0gbnVsbFxuICBsZXQgdHlwZVxuICBsZXQgZmxvd0luZGVudFxuICBsZXQgYmxvY2tJbmRlbnRcblxuICBpZiAoc3RhdGUuZGVwdGggPj0gc3RhdGUubWF4RGVwdGgpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnbmVzdGluZyBleGNlZWRlZCBtYXhEZXB0aCAoJyArIHN0YXRlLm1heERlcHRoICsgJyknKVxuICB9XG5cbiAgc3RhdGUuZGVwdGggKz0gMVxuXG4gIGlmIChzdGF0ZS5saXN0ZW5lciAhPT0gbnVsbCkge1xuICAgIHN0YXRlLmxpc3RlbmVyKCdvcGVuJywgc3RhdGUpXG4gIH1cblxuICBzdGF0ZS50YWcgPSBudWxsXG4gIHN0YXRlLmFuY2hvciA9IG51bGxcbiAgc3RhdGUua2luZCA9IG51bGxcbiAgc3RhdGUucmVzdWx0ID0gbnVsbFxuXG4gIGNvbnN0IGFsbG93QmxvY2tTdHlsZXMgPSBhbGxvd0Jsb2NrU2NhbGFycyA9IGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9XG4gICAgQ09OVEVYVF9CTE9DS19PVVQgPT09IG5vZGVDb250ZXh0IHx8XG4gICAgQ09OVEVYVF9CTE9DS19JTiA9PT0gbm9kZUNvbnRleHRcblxuICBpZiAoYWxsb3dUb1NlZWspIHtcbiAgICBpZiAoc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpKSB7XG4gICAgICBhdE5ld0xpbmUgPSB0cnVlXG5cbiAgICAgIGlmIChzdGF0ZS5saW5lSW5kZW50ID4gcGFyZW50SW5kZW50KSB7XG4gICAgICAgIGluZGVudFN0YXR1cyA9IDFcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUubGluZUluZGVudCA9PT0gcGFyZW50SW5kZW50KSB7XG4gICAgICAgIGluZGVudFN0YXR1cyA9IDBcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUubGluZUluZGVudCA8IHBhcmVudEluZGVudCkge1xuICAgICAgICBpbmRlbnRTdGF0dXMgPSAtMVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChpbmRlbnRTdGF0dXMgPT09IDEpIHtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuICAgICAgY29uc3QgcHJvcGVydHlTdGF0ZSA9IHNuYXBzaG90U3RhdGUoc3RhdGUpXG5cbiAgICAgIC8vIEEgZHVwbGljYXRlIHByb3BlcnR5IHRva2VuIGFmdGVyIGEgbGluZSBicmVhayBjYW4gYmUgdGhlIGZpcnN0IGtleSBvZlxuICAgICAgLy8gYSBuZXN0ZWQgYmxvY2sgbWFwcGluZywgZS5nLiBgISFtYXBcXG4gICEhc3RyIGtleTogdmFsdWVgLlxuICAgICAgaWYgKGF0TmV3TGluZSAmJlxuICAgICAgICAgICgoY2ggPT09IDB4MjEvKiAhICovICYmIHN0YXRlLnRhZyAhPT0gbnVsbCkgfHxcbiAgICAgICAgICAgKGNoID09PSAweDI2LyogJiAqLyAmJiBzdGF0ZS5hbmNob3IgIT09IG51bGwpKSkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBpZiAoIXJlYWRUYWdQcm9wZXJ0eShzdGF0ZSkgJiYgIXJlYWRBbmNob3JQcm9wZXJ0eShzdGF0ZSkpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgaWYgKHByb3BlcnR5U3RhcnQgPT09IG51bGwpIHtcbiAgICAgICAgcHJvcGVydHlTdGFydCA9IHByb3BlcnR5U3RhdGVcbiAgICAgIH1cblxuICAgICAgaWYgKHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIC0xKSkge1xuICAgICAgICBhdE5ld0xpbmUgPSB0cnVlXG4gICAgICAgIGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9IGFsbG93QmxvY2tTdHlsZXNcblxuICAgICAgICBpZiAoc3RhdGUubGluZUluZGVudCA+IHBhcmVudEluZGVudCkge1xuICAgICAgICAgIGluZGVudFN0YXR1cyA9IDFcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZS5saW5lSW5kZW50ID09PSBwYXJlbnRJbmRlbnQpIHtcbiAgICAgICAgICBpbmRlbnRTdGF0dXMgPSAwXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUubGluZUluZGVudCA8IHBhcmVudEluZGVudCkge1xuICAgICAgICAgIGluZGVudFN0YXR1cyA9IC0xXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGFsbG93QmxvY2tDb2xsZWN0aW9ucykge1xuICAgIGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9IGF0TmV3TGluZSB8fCBhbGxvd0NvbXBhY3RcbiAgfVxuXG4gIGlmIChpbmRlbnRTdGF0dXMgPT09IDEgfHwgQ09OVEVYVF9CTE9DS19PVVQgPT09IG5vZGVDb250ZXh0KSB7XG4gICAgaWYgKENPTlRFWFRfRkxPV19JTiA9PT0gbm9kZUNvbnRleHQgfHwgQ09OVEVYVF9GTE9XX09VVCA9PT0gbm9kZUNvbnRleHQpIHtcbiAgICAgIGZsb3dJbmRlbnQgPSBwYXJlbnRJbmRlbnRcbiAgICB9IGVsc2Uge1xuICAgICAgZmxvd0luZGVudCA9IHBhcmVudEluZGVudCArIDFcbiAgICB9XG5cbiAgICBibG9ja0luZGVudCA9IHN0YXRlLnBvc2l0aW9uIC0gc3RhdGUubGluZVN0YXJ0XG5cbiAgICBpZiAoaW5kZW50U3RhdHVzID09PSAxKSB7XG4gICAgICBpZiAoKGFsbG93QmxvY2tDb2xsZWN0aW9ucyAmJlxuICAgICAgICAgIChyZWFkQmxvY2tTZXF1ZW5jZShzdGF0ZSwgYmxvY2tJbmRlbnQpIHx8IHJlYWRCbG9ja01hcHBpbmcoc3RhdGUsIGJsb2NrSW5kZW50LCBmbG93SW5kZW50KSkpIHx8XG4gICAgICAgICAgcmVhZEZsb3dDb2xsZWN0aW9uKHN0YXRlLCBmbG93SW5kZW50KSkge1xuICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKVxuXG4gICAgICAgIGlmIChwcm9wZXJ0eVN0YXJ0ICE9PSBudWxsICYmIGFsbG93QmxvY2tTdHlsZXMgJiYgIWFsbG93QmxvY2tDb2xsZWN0aW9ucyAmJlxuICAgICAgICAgICAgY2ggIT09IDB4N0MvKiB8ICovICYmIGNoICE9PSAweDNFLyogPiAqLyAmJlxuICAgICAgICAgICAgdHJ5UmVhZEJsb2NrTWFwcGluZ0Zyb21Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgICAgIHByb3BlcnR5U3RhcnQsXG4gICAgICAgICAgICAgIHByb3BlcnR5U3RhcnQucG9zaXRpb24gLSBwcm9wZXJ0eVN0YXJ0LmxpbmVTdGFydCxcbiAgICAgICAgICAgICAgZmxvd0luZGVudFxuICAgICAgICAgICAgKSkge1xuICAgICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlXG4gICAgICAgIH0gZWxzZSBpZiAoKGFsbG93QmxvY2tTY2FsYXJzICYmIHJlYWRCbG9ja1NjYWxhcihzdGF0ZSwgZmxvd0luZGVudCkpIHx8XG4gICAgICAgICAgICByZWFkU2luZ2xlUXVvdGVkU2NhbGFyKHN0YXRlLCBmbG93SW5kZW50KSB8fFxuICAgICAgICAgICAgcmVhZERvdWJsZVF1b3RlZFNjYWxhcihzdGF0ZSwgZmxvd0luZGVudCkpIHtcbiAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuICAgICAgICB9IGVsc2UgaWYgKHJlYWRBbGlhcyhzdGF0ZSkpIHtcbiAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuXG4gICAgICAgICAgaWYgKHN0YXRlLnRhZyAhPT0gbnVsbCB8fCBzdGF0ZS5hbmNob3IgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdhbGlhcyBub2RlIHNob3VsZCBub3QgaGF2ZSBhbnkgcHJvcGVydGllcycpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHJlYWRQbGFpblNjYWxhcihzdGF0ZSwgZmxvd0luZGVudCwgQ09OVEVYVF9GTE9XX0lOID09PSBub2RlQ29udGV4dCkpIHtcbiAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuXG4gICAgICAgICAgaWYgKHN0YXRlLnRhZyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgc3RhdGUudGFnID0gJz8nXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0YXRlLmFuY2hvciAhPT0gbnVsbCkge1xuICAgICAgICAgIHN0b3JlQW5jaG9yKHN0YXRlLCBzdGF0ZS5hbmNob3IsIHN0YXRlLnJlc3VsdClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaW5kZW50U3RhdHVzID09PSAwKSB7XG4gICAgICAvLyBTcGVjaWFsIGNhc2U6IGJsb2NrIHNlcXVlbmNlcyBhcmUgYWxsb3dlZCB0byBoYXZlIHNhbWUgaW5kZW50YXRpb24gbGV2ZWwgYXMgdGhlIHBhcmVudC5cbiAgICAgIC8vIGh0dHA6Ly93d3cueWFtbC5vcmcvc3BlYy8xLjIvc3BlYy5odG1sI2lkMjc5OTc4NFxuICAgICAgaGFzQ29udGVudCA9IGFsbG93QmxvY2tDb2xsZWN0aW9ucyAmJiByZWFkQmxvY2tTZXF1ZW5jZShzdGF0ZSwgYmxvY2tJbmRlbnQpXG4gICAgfVxuICB9XG5cbiAgaWYgKHN0YXRlLnRhZyA9PT0gbnVsbCkge1xuICAgIGlmIChzdGF0ZS5hbmNob3IgIT09IG51bGwpIHtcbiAgICAgIHN0b3JlQW5jaG9yKHN0YXRlLCBzdGF0ZS5hbmNob3IsIHN0YXRlLnJlc3VsdClcbiAgICB9XG4gIH0gZWxzZSBpZiAoc3RhdGUudGFnID09PSAnPycpIHtcbiAgICAvLyBJbXBsaWNpdCByZXNvbHZpbmcgaXMgbm90IGFsbG93ZWQgZm9yIG5vbi1zY2FsYXIgdHlwZXMsIGFuZCAnPydcbiAgICAvLyBub24tc3BlY2lmaWMgdGFnIGlzIG9ubHkgYXV0b21hdGljYWxseSBhc3NpZ25lZCB0byBwbGFpbiBzY2FsYXJzLlxuICAgIC8vXG4gICAgLy8gV2Ugb25seSBuZWVkIHRvIGNoZWNrIGtpbmQgY29uZm9ybWl0eSBpbiBjYXNlIHVzZXIgZXhwbGljaXRseSBhc3NpZ25zICc/J1xuICAgIC8vIHRhZywgZm9yIGV4YW1wbGUgbGlrZSB0aGlzOiBcIiE8Pz4gWzBdXCJcbiAgICAvL1xuICAgIGlmIChzdGF0ZS5yZXN1bHQgIT09IG51bGwgJiYgc3RhdGUua2luZCAhPT0gJ3NjYWxhcicpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd1bmFjY2VwdGFibGUgbm9kZSBraW5kIGZvciAhPD8+IHRhZzsgaXQgc2hvdWxkIGJlIFwic2NhbGFyXCIsIG5vdCBcIicgKyBzdGF0ZS5raW5kICsgJ1wiJylcbiAgICB9XG5cbiAgICBmb3IgKGxldCB0eXBlSW5kZXggPSAwLCB0eXBlUXVhbnRpdHkgPSBzdGF0ZS5pbXBsaWNpdFR5cGVzLmxlbmd0aDsgdHlwZUluZGV4IDwgdHlwZVF1YW50aXR5OyB0eXBlSW5kZXggKz0gMSkge1xuICAgICAgdHlwZSA9IHN0YXRlLmltcGxpY2l0VHlwZXNbdHlwZUluZGV4XVxuXG4gICAgICBpZiAodHlwZS5yZXNvbHZlKHN0YXRlLnJlc3VsdCkpIHsgLy8gYHN0YXRlLnJlc3VsdGAgdXBkYXRlZCBpbiByZXNvbHZlciBpZiBtYXRjaGVkXG4gICAgICAgIHN0YXRlLnJlc3VsdCA9IHR5cGUuY29uc3RydWN0KHN0YXRlLnJlc3VsdClcbiAgICAgICAgc3RhdGUudGFnID0gdHlwZS50YWdcbiAgICAgICAgaWYgKHN0YXRlLmFuY2hvciAhPT0gbnVsbCkge1xuICAgICAgICAgIHN0b3JlQW5jaG9yKHN0YXRlLCBzdGF0ZS5hbmNob3IsIHN0YXRlLnJlc3VsdClcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChzdGF0ZS50YWcgIT09ICchJykge1xuICAgIGlmIChfaGFzT3duUHJvcGVydHkuY2FsbChzdGF0ZS50eXBlTWFwW3N0YXRlLmtpbmQgfHwgJ2ZhbGxiYWNrJ10sIHN0YXRlLnRhZykpIHtcbiAgICAgIHR5cGUgPSBzdGF0ZS50eXBlTWFwW3N0YXRlLmtpbmQgfHwgJ2ZhbGxiYWNrJ11bc3RhdGUudGFnXVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBsb29raW5nIGZvciBtdWx0aSB0eXBlXG4gICAgICB0eXBlID0gbnVsbFxuICAgICAgY29uc3QgdHlwZUxpc3QgPSBzdGF0ZS50eXBlTWFwLm11bHRpW3N0YXRlLmtpbmQgfHwgJ2ZhbGxiYWNrJ11cblxuICAgICAgZm9yIChsZXQgdHlwZUluZGV4ID0gMCwgdHlwZVF1YW50aXR5ID0gdHlwZUxpc3QubGVuZ3RoOyB0eXBlSW5kZXggPCB0eXBlUXVhbnRpdHk7IHR5cGVJbmRleCArPSAxKSB7XG4gICAgICAgIGlmIChzdGF0ZS50YWcuc2xpY2UoMCwgdHlwZUxpc3RbdHlwZUluZGV4XS50YWcubGVuZ3RoKSA9PT0gdHlwZUxpc3RbdHlwZUluZGV4XS50YWcpIHtcbiAgICAgICAgICB0eXBlID0gdHlwZUxpc3RbdHlwZUluZGV4XVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXR5cGUpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd1bmtub3duIHRhZyAhPCcgKyBzdGF0ZS50YWcgKyAnPicpXG4gICAgfVxuXG4gICAgaWYgKHN0YXRlLnJlc3VsdCAhPT0gbnVsbCAmJiB0eXBlLmtpbmQgIT09IHN0YXRlLmtpbmQpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd1bmFjY2VwdGFibGUgbm9kZSBraW5kIGZvciAhPCcgKyBzdGF0ZS50YWcgKyAnPiB0YWc7IGl0IHNob3VsZCBiZSBcIicgKyB0eXBlLmtpbmQgKyAnXCIsIG5vdCBcIicgKyBzdGF0ZS5raW5kICsgJ1wiJylcbiAgICB9XG5cbiAgICBpZiAoIXR5cGUucmVzb2x2ZShzdGF0ZS5yZXN1bHQsIHN0YXRlLnRhZykpIHsgLy8gYHN0YXRlLnJlc3VsdGAgdXBkYXRlZCBpbiByZXNvbHZlciBpZiBtYXRjaGVkXG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnY2Fubm90IHJlc29sdmUgYSBub2RlIHdpdGggITwnICsgc3RhdGUudGFnICsgJz4gZXhwbGljaXQgdGFnJylcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGUucmVzdWx0ID0gdHlwZS5jb25zdHJ1Y3Qoc3RhdGUucmVzdWx0LCBzdGF0ZS50YWcpXG4gICAgICBpZiAoc3RhdGUuYW5jaG9yICE9PSBudWxsKSB7XG4gICAgICAgIHN0b3JlQW5jaG9yKHN0YXRlLCBzdGF0ZS5hbmNob3IsIHN0YXRlLnJlc3VsdClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoc3RhdGUubGlzdGVuZXIgIT09IG51bGwpIHtcbiAgICBzdGF0ZS5saXN0ZW5lcignY2xvc2UnLCBzdGF0ZSlcbiAgfVxuXG4gIHN0YXRlLmRlcHRoIC09IDFcbiAgcmV0dXJuIHN0YXRlLnRhZyAhPT0gbnVsbCB8fCBzdGF0ZS5hbmNob3IgIT09IG51bGwgfHwgaGFzQ29udGVudFxufVxuXG5mdW5jdGlvbiByZWFkRG9jdW1lbnQgKHN0YXRlKSB7XG4gIGNvbnN0IGRvY3VtZW50U3RhcnQgPSBzdGF0ZS5wb3NpdGlvblxuICBsZXQgaGFzRGlyZWN0aXZlcyA9IGZhbHNlXG4gIGxldCBjaFxuXG4gIHN0YXRlLnZlcnNpb24gPSBudWxsXG4gIHN0YXRlLmNoZWNrTGluZUJyZWFrcyA9IHN0YXRlLmxlZ2FjeVxuICBzdGF0ZS50YWdNYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIHN0YXRlLmFuY2hvck1hcCA9IE9iamVjdC5jcmVhdGUobnVsbClcblxuICB3aGlsZSAoKGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpICE9PSAwKSB7XG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpXG5cbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pXG5cbiAgICBpZiAoc3RhdGUubGluZUluZGVudCA+IDAgfHwgY2ggIT09IDB4MjUvKiAlICovKSB7XG4gICAgICBicmVha1xuICAgIH1cblxuICAgIGhhc0RpcmVjdGl2ZXMgPSB0cnVlXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgbGV0IF9wb3NpdGlvbiA9IHN0YXRlLnBvc2l0aW9uXG5cbiAgICB3aGlsZSAoY2ggIT09IDAgJiYgIWlzV3NPckVvbChjaCkpIHtcbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKVxuICAgIH1cblxuICAgIGNvbnN0IGRpcmVjdGl2ZU5hbWUgPSBzdGF0ZS5pbnB1dC5zbGljZShfcG9zaXRpb24sIHN0YXRlLnBvc2l0aW9uKVxuICAgIGNvbnN0IGRpcmVjdGl2ZUFyZ3MgPSBbXVxuXG4gICAgaWYgKGRpcmVjdGl2ZU5hbWUubGVuZ3RoIDwgMSkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2RpcmVjdGl2ZSBuYW1lIG11c3Qgbm90IGJlIGxlc3MgdGhhbiBvbmUgY2hhcmFjdGVyIGluIGxlbmd0aCcpXG4gICAgfVxuXG4gICAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgICB3aGlsZSAoaXNXaGl0ZVNwYWNlKGNoKSkge1xuICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbilcbiAgICAgIH1cblxuICAgICAgaWYgKGNoID09PSAweDIzLyogIyAqLykge1xuICAgICAgICBkbyB7IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKSB9XG4gICAgICAgIHdoaWxlIChjaCAhPT0gMCAmJiAhaXNFb2woY2gpKVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNFb2woY2gpKSBicmVha1xuXG4gICAgICBfcG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvblxuXG4gICAgICB3aGlsZSAoY2ggIT09IDAgJiYgIWlzV3NPckVvbChjaCkpIHtcbiAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pXG4gICAgICB9XG5cbiAgICAgIGRpcmVjdGl2ZUFyZ3MucHVzaChzdGF0ZS5pbnB1dC5zbGljZShfcG9zaXRpb24sIHN0YXRlLnBvc2l0aW9uKSlcbiAgICB9XG5cbiAgICBpZiAoY2ggIT09IDApIHJlYWRMaW5lQnJlYWsoc3RhdGUpXG5cbiAgICBpZiAoX2hhc093blByb3BlcnR5LmNhbGwoZGlyZWN0aXZlSGFuZGxlcnMsIGRpcmVjdGl2ZU5hbWUpKSB7XG4gICAgICBkaXJlY3RpdmVIYW5kbGVyc1tkaXJlY3RpdmVOYW1lXShzdGF0ZSwgZGlyZWN0aXZlTmFtZSwgZGlyZWN0aXZlQXJncylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3dXYXJuaW5nKHN0YXRlLCAndW5rbm93biBkb2N1bWVudCBkaXJlY3RpdmUgXCInICsgZGlyZWN0aXZlTmFtZSArICdcIicpXG4gICAgfVxuICB9XG5cbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpXG5cbiAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPT09IDAgJiZcbiAgICAgIHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAweDJELyogLSAqLyAmJlxuICAgICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpID09PSAweDJELyogLSAqLyAmJlxuICAgICAgc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDIpID09PSAweDJELyogLSAqLykge1xuICAgIHN0YXRlLnBvc2l0aW9uICs9IDNcbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSlcbiAgfSBlbHNlIGlmIChoYXNEaXJlY3RpdmVzKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2RpcmVjdGl2ZXMgZW5kIG1hcmsgaXMgZXhwZWN0ZWQnKVxuICB9XG5cbiAgY29tcG9zZU5vZGUoc3RhdGUsIHN0YXRlLmxpbmVJbmRlbnQgLSAxLCBDT05URVhUX0JMT0NLX09VVCwgZmFsc2UsIHRydWUpXG4gIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIC0xKVxuXG4gIGlmIChzdGF0ZS5jaGVja0xpbmVCcmVha3MgJiZcbiAgICAgIFBBVFRFUk5fTk9OX0FTQ0lJX0xJTkVfQlJFQUtTLnRlc3Qoc3RhdGUuaW5wdXQuc2xpY2UoZG9jdW1lbnRTdGFydCwgc3RhdGUucG9zaXRpb24pKSkge1xuICAgIHRocm93V2FybmluZyhzdGF0ZSwgJ25vbi1BU0NJSSBsaW5lIGJyZWFrcyBhcmUgaW50ZXJwcmV0ZWQgYXMgY29udGVudCcpXG4gIH1cblxuICBzdGF0ZS5kb2N1bWVudHMucHVzaChzdGF0ZS5yZXN1bHQpXG5cbiAgaWYgKHN0YXRlLnBvc2l0aW9uID09PSBzdGF0ZS5saW5lU3RhcnQgJiYgdGVzdERvY3VtZW50U2VwYXJhdG9yKHN0YXRlKSkge1xuICAgIGlmIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gMHgyRS8qIC4gKi8pIHtcbiAgICAgIHN0YXRlLnBvc2l0aW9uICs9IDNcbiAgICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIC0xKVxuICAgIH1cbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmIChzdGF0ZS5wb3NpdGlvbiA8IChzdGF0ZS5sZW5ndGggLSAxKSkge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICdlbmQgb2YgdGhlIHN0cmVhbSBvciBhIGRvY3VtZW50IHNlcGFyYXRvciBpcyBleHBlY3RlZCcpXG4gIH1cbn1cblxuZnVuY3Rpb24gbG9hZERvY3VtZW50cyAoaW5wdXQsIG9wdGlvbnMpIHtcbiAgaW5wdXQgPSBTdHJpbmcoaW5wdXQpXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgaWYgKGlucHV0Lmxlbmd0aCAhPT0gMCkge1xuICAgIC8vIEFkZCB0YWlsaW5nIGBcXG5gIGlmIG5vdCBleGlzdHNcbiAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChpbnB1dC5sZW5ndGggLSAxKSAhPT0gMHgwQS8qIExGICovICYmXG4gICAgICAgIGlucHV0LmNoYXJDb2RlQXQoaW5wdXQubGVuZ3RoIC0gMSkgIT09IDB4MEQvKiBDUiAqLykge1xuICAgICAgaW5wdXQgKz0gJ1xcbidcbiAgICB9XG5cbiAgICAvLyBTdHJpcCBCT01cbiAgICBpZiAoaW5wdXQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgICBpbnB1dCA9IGlucHV0LnNsaWNlKDEpXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3RhdGUgPSBuZXcgU3RhdGUoaW5wdXQsIG9wdGlvbnMpXG5cbiAgY29uc3QgbnVsbHBvcyA9IGlucHV0LmluZGV4T2YoJ1xcMCcpXG5cbiAgaWYgKG51bGxwb3MgIT09IC0xKSB7XG4gICAgc3RhdGUucG9zaXRpb24gPSBudWxscG9zXG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ251bGwgYnl0ZSBpcyBub3QgYWxsb3dlZCBpbiBpbnB1dCcpXG4gIH1cblxuICAvLyBVc2UgMCBhcyBzdHJpbmcgdGVybWluYXRvci4gVGhhdCBzaWduaWZpY2FudGx5IHNpbXBsaWZpZXMgYm91bmRzIGNoZWNrLlxuICBzdGF0ZS5pbnB1dCArPSAnXFwwJ1xuXG4gIHdoaWxlIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gMHgyMC8qIFNwYWNlICovKSB7XG4gICAgc3RhdGUubGluZUluZGVudCArPSAxXG4gICAgc3RhdGUucG9zaXRpb24gKz0gMVxuICB9XG5cbiAgd2hpbGUgKHN0YXRlLnBvc2l0aW9uIDwgKHN0YXRlLmxlbmd0aCAtIDEpKSB7XG4gICAgcmVhZERvY3VtZW50KHN0YXRlKVxuICB9XG5cbiAgcmV0dXJuIHN0YXRlLmRvY3VtZW50c1xufVxuXG5mdW5jdGlvbiBsb2FkQWxsIChpbnB1dCwgaXRlcmF0b3IsIG9wdGlvbnMpIHtcbiAgaWYgKGl0ZXJhdG9yICE9PSBudWxsICYmIHR5cGVvZiBpdGVyYXRvciA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG9wdGlvbnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgb3B0aW9ucyA9IGl0ZXJhdG9yXG4gICAgaXRlcmF0b3IgPSBudWxsXG4gIH1cblxuICBjb25zdCBkb2N1bWVudHMgPSBsb2FkRG9jdW1lbnRzKGlucHV0LCBvcHRpb25zKVxuXG4gIGlmICh0eXBlb2YgaXRlcmF0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZG9jdW1lbnRzXG4gIH1cblxuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IGRvY3VtZW50cy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgaXRlcmF0b3IoZG9jdW1lbnRzW2luZGV4XSlcbiAgfVxufVxuXG5mdW5jdGlvbiBsb2FkIChpbnB1dCwgb3B0aW9ucykge1xuICBjb25zdCBkb2N1bWVudHMgPSBsb2FkRG9jdW1lbnRzKGlucHV0LCBvcHRpb25zKVxuXG4gIGlmIChkb2N1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9IGVsc2UgaWYgKGRvY3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gZG9jdW1lbnRzWzBdXG4gIH1cbiAgdGhyb3cgbmV3IFlBTUxFeGNlcHRpb24oJ2V4cGVjdGVkIGEgc2luZ2xlIGRvY3VtZW50IGluIHRoZSBzdHJlYW0sIGJ1dCBmb3VuZCBtb3JlJylcbn1cblxubW9kdWxlLmV4cG9ydHMubG9hZEFsbCA9IGxvYWRBbGxcbm1vZHVsZS5leHBvcnRzLmxvYWQgPSBsb2FkXG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGNvbW1vbiA9IHJlcXVpcmUoJy4vY29tbW9uJylcbmNvbnN0IFlBTUxFeGNlcHRpb24gPSByZXF1aXJlKCcuL2V4Y2VwdGlvbicpXG5jb25zdCBERUZBVUxUX1NDSEVNQSA9IHJlcXVpcmUoJy4vc2NoZW1hL2RlZmF1bHQnKVxuXG5jb25zdCBfdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG5jb25zdCBfaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG5cbmNvbnN0IENIQVJfQk9NID0gMHhGRUZGXG5jb25zdCBDSEFSX1RBQiA9IDB4MDkgLyogVGFiICovXG5jb25zdCBDSEFSX0xJTkVfRkVFRCA9IDB4MEEgLyogTEYgKi9cbmNvbnN0IENIQVJfQ0FSUklBR0VfUkVUVVJOID0gMHgwRCAvKiBDUiAqL1xuY29uc3QgQ0hBUl9TUEFDRSA9IDB4MjAgLyogU3BhY2UgKi9cbmNvbnN0IENIQVJfRVhDTEFNQVRJT04gPSAweDIxIC8qICEgKi9cbmNvbnN0IENIQVJfRE9VQkxFX1FVT1RFID0gMHgyMiAvKiBcIiAqL1xuY29uc3QgQ0hBUl9TSEFSUCA9IDB4MjMgLyogIyAqL1xuY29uc3QgQ0hBUl9QRVJDRU5UID0gMHgyNSAvKiAlICovXG5jb25zdCBDSEFSX0FNUEVSU0FORCA9IDB4MjYgLyogJiAqL1xuY29uc3QgQ0hBUl9TSU5HTEVfUVVPVEUgPSAweDI3IC8qICcgKi9cbmNvbnN0IENIQVJfQVNURVJJU0sgPSAweDJBIC8qICogKi9cbmNvbnN0IENIQVJfQ09NTUEgPSAweDJDIC8qICwgKi9cbmNvbnN0IENIQVJfTUlOVVMgPSAweDJEIC8qIC0gKi9cbmNvbnN0IENIQVJfQ09MT04gPSAweDNBIC8qIDogKi9cbmNvbnN0IENIQVJfRVFVQUxTID0gMHgzRCAvKiA9ICovXG5jb25zdCBDSEFSX0dSRUFURVJfVEhBTiA9IDB4M0UgLyogPiAqL1xuY29uc3QgQ0hBUl9RVUVTVElPTiA9IDB4M0YgLyogPyAqL1xuY29uc3QgQ0hBUl9DT01NRVJDSUFMX0FUID0gMHg0MCAvKiBAICovXG5jb25zdCBDSEFSX0xFRlRfU1FVQVJFX0JSQUNLRVQgPSAweDVCIC8qIFsgKi9cbmNvbnN0IENIQVJfUklHSFRfU1FVQVJFX0JSQUNLRVQgPSAweDVEIC8qIF0gKi9cbmNvbnN0IENIQVJfR1JBVkVfQUNDRU5UID0gMHg2MCAvKiBgICovXG5jb25zdCBDSEFSX0xFRlRfQ1VSTFlfQlJBQ0tFVCA9IDB4N0IgLyogeyAqL1xuY29uc3QgQ0hBUl9WRVJUSUNBTF9MSU5FID0gMHg3QyAvKiB8ICovXG5jb25zdCBDSEFSX1JJR0hUX0NVUkxZX0JSQUNLRVQgPSAweDdEIC8qIH0gKi9cblxuY29uc3QgRVNDQVBFX1NFUVVFTkNFUyA9IHt9XG5cbkVTQ0FQRV9TRVFVRU5DRVNbMHgwMF0gPSAnXFxcXDAnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MDddID0gJ1xcXFxhJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDA4XSA9ICdcXFxcYidcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwOV0gPSAnXFxcXHQnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MEFdID0gJ1xcXFxuJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDBCXSA9ICdcXFxcdidcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwQ10gPSAnXFxcXGYnXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MERdID0gJ1xcXFxyJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDFCXSA9ICdcXFxcZSdcbkVTQ0FQRV9TRVFVRU5DRVNbMHgyMl0gPSAnXFxcXFwiJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDVDXSA9ICdcXFxcXFxcXCdcbkVTQ0FQRV9TRVFVRU5DRVNbMHg4NV0gPSAnXFxcXE4nXG5FU0NBUEVfU0VRVUVOQ0VTWzB4QTBdID0gJ1xcXFxfJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDIwMjhdID0gJ1xcXFxMJ1xuRVNDQVBFX1NFUVVFTkNFU1sweDIwMjldID0gJ1xcXFxQJ1xuXG5jb25zdCBERVBSRUNBVEVEX0JPT0xFQU5TX1NZTlRBWCA9IFtcbiAgJ3knLCAnWScsICd5ZXMnLCAnWWVzJywgJ1lFUycsICdvbicsICdPbicsICdPTicsXG4gICduJywgJ04nLCAnbm8nLCAnTm8nLCAnTk8nLCAnb2ZmJywgJ09mZicsICdPRkYnXG5dXG5cbmNvbnN0IERFUFJFQ0FURURfQkFTRTYwX1NZTlRBWCA9IC9eWy0rXT9bMC05X10rKD86OlswLTlfXSspKyg/OlxcLlswLTlfXSopPyQvXG5cbmZ1bmN0aW9uIGNvbXBpbGVTdHlsZU1hcCAoc2NoZW1hLCBtYXApIHtcbiAgaWYgKG1hcCA9PT0gbnVsbCkgcmV0dXJuIHt9XG5cbiAgY29uc3QgcmVzdWx0ID0ge31cbiAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKG1hcClcblxuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGxldCB0YWcgPSBrZXlzW2luZGV4XVxuICAgIGxldCBzdHlsZSA9IFN0cmluZyhtYXBbdGFnXSlcblxuICAgIGlmICh0YWcuc2xpY2UoMCwgMikgPT09ICchIScpIHtcbiAgICAgIHRhZyA9ICd0YWc6eWFtbC5vcmcsMjAwMjonICsgdGFnLnNsaWNlKDIpXG4gICAgfVxuICAgIGNvbnN0IHR5cGUgPSBzY2hlbWEuY29tcGlsZWRUeXBlTWFwWydmYWxsYmFjayddW3RhZ11cblxuICAgIGlmICh0eXBlICYmIF9oYXNPd25Qcm9wZXJ0eS5jYWxsKHR5cGUuc3R5bGVBbGlhc2VzLCBzdHlsZSkpIHtcbiAgICAgIHN0eWxlID0gdHlwZS5zdHlsZUFsaWFzZXNbc3R5bGVdXG4gICAgfVxuXG4gICAgcmVzdWx0W3RhZ10gPSBzdHlsZVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiBlbmNvZGVIZXggKGNoYXJhY3Rlcikge1xuICBsZXQgaGFuZGxlXG4gIGxldCBsZW5ndGhcblxuICBjb25zdCBzdHJpbmcgPSBjaGFyYWN0ZXIudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKClcblxuICBpZiAoY2hhcmFjdGVyIDw9IDB4RkYpIHtcbiAgICBoYW5kbGUgPSAneCdcbiAgICBsZW5ndGggPSAyXG4gIH0gZWxzZSBpZiAoY2hhcmFjdGVyIDw9IDB4RkZGRikge1xuICAgIGhhbmRsZSA9ICd1J1xuICAgIGxlbmd0aCA9IDRcbiAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPD0gMHhGRkZGRkZGRikge1xuICAgIGhhbmRsZSA9ICdVJ1xuICAgIGxlbmd0aCA9IDhcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignY29kZSBwb2ludCB3aXRoaW4gYSBzdHJpbmcgbWF5IG5vdCBiZSBncmVhdGVyIHRoYW4gMHhGRkZGRkZGRicpXG4gIH1cblxuICByZXR1cm4gJ1xcXFwnICsgaGFuZGxlICsgY29tbW9uLnJlcGVhdCgnMCcsIGxlbmd0aCAtIHN0cmluZy5sZW5ndGgpICsgc3RyaW5nXG59XG5cbmNvbnN0IFFVT1RJTkdfVFlQRV9TSU5HTEUgPSAxXG5jb25zdCBRVU9USU5HX1RZUEVfRE9VQkxFID0gMlxuXG5mdW5jdGlvbiBTdGF0ZSAob3B0aW9ucykge1xuICB0aGlzLnNjaGVtYSA9IG9wdGlvbnNbJ3NjaGVtYSddIHx8IERFRkFVTFRfU0NIRU1BXG4gIHRoaXMuaW5kZW50ID0gTWF0aC5tYXgoMSwgKG9wdGlvbnNbJ2luZGVudCddIHx8IDIpKVxuICB0aGlzLm5vQXJyYXlJbmRlbnQgPSBvcHRpb25zWydub0FycmF5SW5kZW50J10gfHwgZmFsc2VcbiAgdGhpcy5za2lwSW52YWxpZCA9IG9wdGlvbnNbJ3NraXBJbnZhbGlkJ10gfHwgZmFsc2VcbiAgdGhpcy5mbG93TGV2ZWwgPSAoY29tbW9uLmlzTm90aGluZyhvcHRpb25zWydmbG93TGV2ZWwnXSkgPyAtMSA6IG9wdGlvbnNbJ2Zsb3dMZXZlbCddKVxuICB0aGlzLnN0eWxlTWFwID0gY29tcGlsZVN0eWxlTWFwKHRoaXMuc2NoZW1hLCBvcHRpb25zWydzdHlsZXMnXSB8fCBudWxsKVxuICB0aGlzLnNvcnRLZXlzID0gb3B0aW9uc1snc29ydEtleXMnXSB8fCBmYWxzZVxuICB0aGlzLmxpbmVXaWR0aCA9IG9wdGlvbnNbJ2xpbmVXaWR0aCddIHx8IDgwXG4gIHRoaXMubm9SZWZzID0gb3B0aW9uc1snbm9SZWZzJ10gfHwgZmFsc2VcbiAgdGhpcy5ub0NvbXBhdE1vZGUgPSBvcHRpb25zWydub0NvbXBhdE1vZGUnXSB8fCBmYWxzZVxuICB0aGlzLmNvbmRlbnNlRmxvdyA9IG9wdGlvbnNbJ2NvbmRlbnNlRmxvdyddIHx8IGZhbHNlXG4gIHRoaXMucXVvdGluZ1R5cGUgPSBvcHRpb25zWydxdW90aW5nVHlwZSddID09PSAnXCInID8gUVVPVElOR19UWVBFX0RPVUJMRSA6IFFVT1RJTkdfVFlQRV9TSU5HTEVcbiAgdGhpcy5mb3JjZVF1b3RlcyA9IG9wdGlvbnNbJ2ZvcmNlUXVvdGVzJ10gfHwgZmFsc2VcbiAgdGhpcy5yZXBsYWNlciA9IHR5cGVvZiBvcHRpb25zWydyZXBsYWNlciddID09PSAnZnVuY3Rpb24nID8gb3B0aW9uc1sncmVwbGFjZXInXSA6IG51bGxcblxuICB0aGlzLmltcGxpY2l0VHlwZXMgPSB0aGlzLnNjaGVtYS5jb21waWxlZEltcGxpY2l0XG4gIHRoaXMuZXhwbGljaXRUeXBlcyA9IHRoaXMuc2NoZW1hLmNvbXBpbGVkRXhwbGljaXRcblxuICB0aGlzLnRhZyA9IG51bGxcbiAgdGhpcy5yZXN1bHQgPSAnJ1xuXG4gIHRoaXMuZHVwbGljYXRlcyA9IFtdXG4gIHRoaXMudXNlZER1cGxpY2F0ZXMgPSBudWxsXG59XG5cbi8vIEluZGVudHMgZXZlcnkgbGluZSBpbiBhIHN0cmluZy4gRW1wdHkgbGluZXMgKFxcbiBvbmx5KSBhcmUgbm90IGluZGVudGVkLlxuZnVuY3Rpb24gaW5kZW50U3RyaW5nIChzdHJpbmcsIHNwYWNlcykge1xuICBjb25zdCBpbmQgPSBjb21tb24ucmVwZWF0KCcgJywgc3BhY2VzKVxuICBsZXQgcG9zaXRpb24gPSAwXG4gIGxldCByZXN1bHQgPSAnJ1xuICBjb25zdCBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG5cbiAgd2hpbGUgKHBvc2l0aW9uIDwgbGVuZ3RoKSB7XG4gICAgbGV0IGxpbmVcbiAgICBjb25zdCBuZXh0ID0gc3RyaW5nLmluZGV4T2YoJ1xcbicsIHBvc2l0aW9uKVxuICAgIGlmIChuZXh0ID09PSAtMSkge1xuICAgICAgbGluZSA9IHN0cmluZy5zbGljZShwb3NpdGlvbilcbiAgICAgIHBvc2l0aW9uID0gbGVuZ3RoXG4gICAgfSBlbHNlIHtcbiAgICAgIGxpbmUgPSBzdHJpbmcuc2xpY2UocG9zaXRpb24sIG5leHQgKyAxKVxuICAgICAgcG9zaXRpb24gPSBuZXh0ICsgMVxuICAgIH1cblxuICAgIGlmIChsaW5lLmxlbmd0aCAmJiBsaW5lICE9PSAnXFxuJykgcmVzdWx0ICs9IGluZFxuXG4gICAgcmVzdWx0ICs9IGxpbmVcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVOZXh0TGluZSAoc3RhdGUsIGxldmVsKSB7XG4gIHJldHVybiAnXFxuJyArIGNvbW1vbi5yZXBlYXQoJyAnLCBzdGF0ZS5pbmRlbnQgKiBsZXZlbClcbn1cblxuZnVuY3Rpb24gdGVzdEltcGxpY2l0UmVzb2x2aW5nIChzdGF0ZSwgc3RyKSB7XG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gc3RhdGUuaW1wbGljaXRUeXBlcy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgY29uc3QgdHlwZSA9IHN0YXRlLmltcGxpY2l0VHlwZXNbaW5kZXhdXG5cbiAgICBpZiAodHlwZS5yZXNvbHZlKHN0cikpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8vIFszM10gcy13aGl0ZSA6Oj0gcy1zcGFjZSB8IHMtdGFiXG5mdW5jdGlvbiBpc1doaXRlc3BhY2UgKGMpIHtcbiAgcmV0dXJuIGMgPT09IENIQVJfU1BBQ0UgfHwgYyA9PT0gQ0hBUl9UQUJcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBjaGFyYWN0ZXIgY2FuIGJlIHByaW50ZWQgd2l0aG91dCBlc2NhcGluZy5cbi8vIEZyb20gWUFNTCAxLjI6IFwiYW55IGFsbG93ZWQgY2hhcmFjdGVycyBrbm93biB0byBiZSBub24tcHJpbnRhYmxlXG4vLyBzaG91bGQgYWxzbyBiZSBlc2NhcGVkLiBbSG93ZXZlcixdIFRoaXMgaXNu4oCZdCBtYW5kYXRvcnlcIlxuLy8gRGVyaXZlZCBmcm9tIG5iLWNoYXIgLSBcXHQgLSAjeDg1IC0gI3hBMCAtICN4MjAyOCAtICN4MjAyOS5cbmZ1bmN0aW9uIGlzUHJpbnRhYmxlIChjKSB7XG4gIHJldHVybiAoYyA+PSAweDAwMDIwICYmIGMgPD0gMHgwMDAwN0UpIHx8XG4gICAgKChjID49IDB4MDAwQTEgJiYgYyA8PSAweDAwRDdGRikgJiYgYyAhPT0gMHgyMDI4ICYmIGMgIT09IDB4MjAyOSkgfHxcbiAgICAoKGMgPj0gMHgwRTAwMCAmJiBjIDw9IDB4MDBGRkZEKSAmJiBjICE9PSBDSEFSX0JPTSkgfHxcbiAgICAoYyA+PSAweDEwMDAwICYmIGMgPD0gMHgxMEZGRkYpXG59XG5cbi8vIFszNF0gbnMtY2hhciA6Oj0gbmItY2hhciAtIHMtd2hpdGVcbi8vIFsyN10gbmItY2hhciA6Oj0gYy1wcmludGFibGUgLSBiLWNoYXIgLSBjLWJ5dGUtb3JkZXItbWFya1xuLy8gWzI2XSBiLWNoYXIgIDo6PSBiLWxpbmUtZmVlZCB8IGItY2FycmlhZ2UtcmV0dXJuXG4vLyBJbmNsdWRpbmcgcy13aGl0ZSAoZm9yIHNvbWUgcmVhc29uLCBleGFtcGxlcyBkb2Vzbid0IG1hdGNoIHNwZWNzIGluIHRoaXMgYXNwZWN0KVxuLy8gbnMtY2hhciA6Oj0gYy1wcmludGFibGUgLSBiLWxpbmUtZmVlZCAtIGItY2FycmlhZ2UtcmV0dXJuIC0gYy1ieXRlLW9yZGVyLW1hcmtcbmZ1bmN0aW9uIGlzTnNDaGFyT3JXaGl0ZXNwYWNlIChjKSB7XG4gIHJldHVybiBpc1ByaW50YWJsZShjKSAmJlxuICAgIGMgIT09IENIQVJfQk9NICYmXG4gICAgLy8gLSBiLWNoYXJcbiAgICBjICE9PSBDSEFSX0NBUlJJQUdFX1JFVFVSTiAmJlxuICAgIGMgIT09IENIQVJfTElORV9GRUVEXG59XG5cbi8vIFsxMjddICBucy1wbGFpbi1zYWZlKGMpIDo6PSBjID0gZmxvdy1vdXQgIOKHkiBucy1wbGFpbi1zYWZlLW91dFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBmbG93LWluICAg4oeSIG5zLXBsYWluLXNhZmUtaW5cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjID0gYmxvY2sta2V5IOKHkiBucy1wbGFpbi1zYWZlLW91dFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBmbG93LWtleSAg4oeSIG5zLXBsYWluLXNhZmUtaW5cbi8vIFsxMjhdIG5zLXBsYWluLXNhZmUtb3V0IDo6PSBucy1jaGFyXG4vLyBbMTI5XSAgbnMtcGxhaW4tc2FmZS1pbiA6Oj0gbnMtY2hhciAtIGMtZmxvdy1pbmRpY2F0b3Jcbi8vIFsxMzBdICBucy1wbGFpbi1jaGFyKGMpIDo6PSAgKCBucy1wbGFpbi1zYWZlKGMpIC0g4oCcOuKAnSAtIOKAnCPigJ0gKVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAoIC8qIEFuIG5zLWNoYXIgcHJlY2VkaW5nICovIOKAnCPigJ0gKVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAoIOKAnDrigJ0gLyogRm9sbG93ZWQgYnkgYW4gbnMtcGxhaW4tc2FmZShjKSAqLyApXG5mdW5jdGlvbiBpc1BsYWluU2FmZSAoYywgcHJldiwgaW5ibG9jaykge1xuICBjb25zdCBjSXNOc0NoYXJPcldoaXRlc3BhY2UgPSBpc05zQ2hhck9yV2hpdGVzcGFjZShjKVxuICBjb25zdCBjSXNOc0NoYXIgPSBjSXNOc0NoYXJPcldoaXRlc3BhY2UgJiYgIWlzV2hpdGVzcGFjZShjKVxuICByZXR1cm4gKFxuICAgIChcbiAgICAgIC8vIG5zLXBsYWluLXNhZmVcbiAgICAgIGluYmxvY2sgLy8gYyA9IGZsb3ctaW5cbiAgICAgICAgPyBjSXNOc0NoYXJPcldoaXRlc3BhY2VcbiAgICAgICAgOiBjSXNOc0NoYXJPcldoaXRlc3BhY2UgJiZcbiAgICAgICAgICAvLyAtIGMtZmxvdy1pbmRpY2F0b3JcbiAgICAgICAgICBjICE9PSBDSEFSX0NPTU1BICYmXG4gICAgICAgICAgYyAhPT0gQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VUICYmXG4gICAgICAgICAgYyAhPT0gQ0hBUl9SSUdIVF9TUVVBUkVfQlJBQ0tFVCAmJlxuICAgICAgICAgIGMgIT09IENIQVJfTEVGVF9DVVJMWV9CUkFDS0VUICYmXG4gICAgICAgICAgYyAhPT0gQ0hBUl9SSUdIVF9DVVJMWV9CUkFDS0VUXG4gICAgKSAmJlxuICAgIC8vIG5zLXBsYWluLWNoYXJcbiAgICBjICE9PSBDSEFSX1NIQVJQICYmIC8vIGZhbHNlIG9uICcjJ1xuICAgICEocHJldiA9PT0gQ0hBUl9DT0xPTiAmJiAhY0lzTnNDaGFyKVxuICApIHx8IC8vIGZhbHNlIG9uICc6ICdcbiAgKGlzTnNDaGFyT3JXaGl0ZXNwYWNlKHByZXYpICYmICFpc1doaXRlc3BhY2UocHJldikgJiYgYyA9PT0gQ0hBUl9TSEFSUCkgfHwgLy8gY2hhbmdlIHRvIHRydWUgb24gJ1teIF0jJ1xuICAocHJldiA9PT0gQ0hBUl9DT0xPTiAmJiBjSXNOc0NoYXIpIC8vIGNoYW5nZSB0byB0cnVlIG9uICc6W14gXSdcbn1cblxuLy8gU2ltcGxpZmllZCB0ZXN0IGZvciB2YWx1ZXMgYWxsb3dlZCBhcyB0aGUgZmlyc3QgY2hhcmFjdGVyIGluIHBsYWluIHN0eWxlLlxuZnVuY3Rpb24gaXNQbGFpblNhZmVGaXJzdCAoYykge1xuICAvLyBVc2VzIGEgc3Vic2V0IG9mIG5zLWNoYXIgLSBjLWluZGljYXRvclxuICAvLyB3aGVyZSBucy1jaGFyID0gbmItY2hhciAtIHMtd2hpdGUuXG4gIC8vIE5vIHN1cHBvcnQgb2YgKCAoIOKAnD/igJ0gfCDigJw64oCdIHwg4oCcLeKAnSApIC8qIEZvbGxvd2VkIGJ5IGFuIG5zLXBsYWluLXNhZmUoYykpICovICkgcGFydFxuICByZXR1cm4gaXNQcmludGFibGUoYykgJiZcbiAgICBjICE9PSBDSEFSX0JPTSAmJlxuICAgICFpc1doaXRlc3BhY2UoYykgJiYgLy8gLSBzLXdoaXRlXG4gICAgLy8gLSAoYy1pbmRpY2F0b3IgOjo9XG4gICAgLy8g4oCcLeKAnSB8IOKAnD/igJ0gfCDigJw64oCdIHwg4oCcLOKAnSB8IOKAnFvigJ0gfCDigJxd4oCdIHwg4oCce+KAnSB8IOKAnH3igJ1cbiAgICBjICE9PSBDSEFSX01JTlVTICYmXG4gICAgYyAhPT0gQ0hBUl9RVUVTVElPTiAmJlxuICAgIGMgIT09IENIQVJfQ09MT04gJiZcbiAgICBjICE9PSBDSEFSX0NPTU1BICYmXG4gICAgYyAhPT0gQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VUICYmXG4gICAgYyAhPT0gQ0hBUl9SSUdIVF9TUVVBUkVfQlJBQ0tFVCAmJlxuICAgIGMgIT09IENIQVJfTEVGVF9DVVJMWV9CUkFDS0VUICYmXG4gICAgYyAhPT0gQ0hBUl9SSUdIVF9DVVJMWV9CUkFDS0VUICYmXG4gICAgLy8gfCDigJwj4oCdIHwg4oCcJuKAnSB8IOKAnCrigJ0gfCDigJwh4oCdIHwg4oCcfOKAnSB8IOKAnD3igJ0gfCDigJw+4oCdIHwg4oCcJ+KAnSB8IOKAnFwi4oCdXG4gICAgYyAhPT0gQ0hBUl9TSEFSUCAmJlxuICAgIGMgIT09IENIQVJfQU1QRVJTQU5EICYmXG4gICAgYyAhPT0gQ0hBUl9BU1RFUklTSyAmJlxuICAgIGMgIT09IENIQVJfRVhDTEFNQVRJT04gJiZcbiAgICBjICE9PSBDSEFSX1ZFUlRJQ0FMX0xJTkUgJiZcbiAgICBjICE9PSBDSEFSX0VRVUFMUyAmJlxuICAgIGMgIT09IENIQVJfR1JFQVRFUl9USEFOICYmXG4gICAgYyAhPT0gQ0hBUl9TSU5HTEVfUVVPVEUgJiZcbiAgICBjICE9PSBDSEFSX0RPVUJMRV9RVU9URSAmJlxuICAgIC8vIHwg4oCcJeKAnSB8IOKAnEDigJ0gfCDigJxg4oCdKVxuICAgIGMgIT09IENIQVJfUEVSQ0VOVCAmJlxuICAgIGMgIT09IENIQVJfQ09NTUVSQ0lBTF9BVCAmJlxuICAgIGMgIT09IENIQVJfR1JBVkVfQUNDRU5UXG59XG5cbi8vIFNpbXBsaWZpZWQgdGVzdCBmb3IgdmFsdWVzIGFsbG93ZWQgYXMgdGhlIGxhc3QgY2hhcmFjdGVyIGluIHBsYWluIHN0eWxlLlxuZnVuY3Rpb24gaXNQbGFpblNhZmVMYXN0IChjKSB7XG4gIC8vIGp1c3Qgbm90IHdoaXRlc3BhY2Ugb3IgY29sb24sIGl0IHdpbGwgYmUgY2hlY2tlZCB0byBiZSBwbGFpbiBjaGFyYWN0ZXIgbGF0ZXJcbiAgcmV0dXJuICFpc1doaXRlc3BhY2UoYykgJiYgYyAhPT0gQ0hBUl9DT0xPTlxufVxuXG4vLyBTYW1lIGFzICdzdHJpbmcnLmNvZGVQb2ludEF0KHBvcyksIGJ1dCB3b3JrcyBpbiBvbGRlciBicm93c2Vycy5cbmZ1bmN0aW9uIGNvZGVQb2ludEF0IChzdHJpbmcsIHBvcykge1xuICBjb25zdCBmaXJzdCA9IHN0cmluZy5jaGFyQ29kZUF0KHBvcylcbiAgbGV0IHNlY29uZFxuXG4gIGlmIChmaXJzdCA+PSAweEQ4MDAgJiYgZmlyc3QgPD0gMHhEQkZGICYmIHBvcyArIDEgPCBzdHJpbmcubGVuZ3RoKSB7XG4gICAgc2Vjb25kID0gc3RyaW5nLmNoYXJDb2RlQXQocG9zICsgMSlcbiAgICBpZiAoc2Vjb25kID49IDB4REMwMCAmJiBzZWNvbmQgPD0gMHhERkZGKSB7XG4gICAgICAvLyBodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZyNzdXJyb2dhdGUtZm9ybXVsYWVcbiAgICAgIHJldHVybiAoZmlyc3QgLSAweEQ4MDApICogMHg0MDAgKyBzZWNvbmQgLSAweERDMDAgKyAweDEwMDAwXG4gICAgfVxuICB9XG4gIHJldHVybiBmaXJzdFxufVxuXG4vLyBEZXRlcm1pbmVzIHdoZXRoZXIgYmxvY2sgaW5kZW50YXRpb24gaW5kaWNhdG9yIGlzIHJlcXVpcmVkLlxuZnVuY3Rpb24gbmVlZEluZGVudEluZGljYXRvciAoc3RyaW5nKSB7XG4gIGNvbnN0IGxlYWRpbmdTcGFjZVJlID0gL15cXG4qIC9cbiAgcmV0dXJuIGxlYWRpbmdTcGFjZVJlLnRlc3Qoc3RyaW5nKVxufVxuXG5jb25zdCBTVFlMRV9QTEFJTiA9IDFcbmNvbnN0IFNUWUxFX1NJTkdMRSA9IDJcbmNvbnN0IFNUWUxFX0xJVEVSQUwgPSAzXG5jb25zdCBTVFlMRV9GT0xERUQgPSA0XG5jb25zdCBTVFlMRV9ET1VCTEUgPSA1XG5cbi8vIERldGVybWluZXMgd2hpY2ggc2NhbGFyIHN0eWxlcyBhcmUgcG9zc2libGUgYW5kIHJldHVybnMgdGhlIHByZWZlcnJlZCBzdHlsZS5cbi8vIGxpbmVXaWR0aCA9IC0xID0+IG5vIGxpbWl0LlxuLy8gUHJlLWNvbmRpdGlvbnM6IHN0ci5sZW5ndGggPiAwLlxuLy8gUG9zdC1jb25kaXRpb25zOlxuLy8gICAgU1RZTEVfUExBSU4gb3IgU1RZTEVfU0lOR0xFID0+IG5vIFxcbiBhcmUgaW4gdGhlIHN0cmluZy5cbi8vICAgIFNUWUxFX0xJVEVSQUwgPT4gbm8gbGluZXMgYXJlIHN1aXRhYmxlIGZvciBmb2xkaW5nIChvciBsaW5lV2lkdGggaXMgLTEpLlxuLy8gICAgU1RZTEVfRk9MREVEID0+IGEgbGluZSA+IGxpbmVXaWR0aCBhbmQgY2FuIGJlIGZvbGRlZCAoYW5kIGxpbmVXaWR0aCAhPSAtMSkuXG5mdW5jdGlvbiBjaG9vc2VTY2FsYXJTdHlsZSAoc3RyaW5nLCBzaW5nbGVMaW5lT25seSwgaW5kZW50UGVyTGV2ZWwsIGxpbmVXaWR0aCxcbiAgdGVzdEFtYmlndW91c1R5cGUsIHF1b3RpbmdUeXBlLCBmb3JjZVF1b3RlcywgaW5ibG9jaykge1xuICBsZXQgaVxuICBsZXQgY2hhciA9IDBcbiAgbGV0IHByZXZDaGFyID0gbnVsbFxuICBsZXQgaGFzTGluZUJyZWFrID0gZmFsc2VcbiAgbGV0IGhhc0ZvbGRhYmxlTGluZSA9IGZhbHNlIC8vIG9ubHkgY2hlY2tlZCBpZiBzaG91bGRUcmFja1dpZHRoXG4gIGNvbnN0IHNob3VsZFRyYWNrV2lkdGggPSBsaW5lV2lkdGggIT09IC0xXG4gIGxldCBwcmV2aW91c0xpbmVCcmVhayA9IC0xIC8vIGNvdW50IHRoZSBmaXJzdCBsaW5lIGNvcnJlY3RseVxuICBsZXQgcGxhaW4gPSBpc1BsYWluU2FmZUZpcnN0KGNvZGVQb2ludEF0KHN0cmluZywgMCkpICYmXG4gICAgaXNQbGFpblNhZmVMYXN0KGNvZGVQb2ludEF0KHN0cmluZywgc3RyaW5nLmxlbmd0aCAtIDEpKVxuXG4gIGlmIChzaW5nbGVMaW5lT25seSB8fCBmb3JjZVF1b3Rlcykge1xuICAgIC8vIENhc2U6IG5vIGJsb2NrIHN0eWxlcy5cbiAgICAvLyBDaGVjayBmb3IgZGlzYWxsb3dlZCBjaGFyYWN0ZXJzIHRvIHJ1bGUgb3V0IHBsYWluIGFuZCBzaW5nbGUuXG4gICAgZm9yIChpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGNoYXIgPj0gMHgxMDAwMCA/IGkgKz0gMiA6IGkrKykge1xuICAgICAgY2hhciA9IGNvZGVQb2ludEF0KHN0cmluZywgaSlcbiAgICAgIGlmICghaXNQcmludGFibGUoY2hhcikpIHtcbiAgICAgICAgcmV0dXJuIFNUWUxFX0RPVUJMRVxuICAgICAgfVxuICAgICAgcGxhaW4gPSBwbGFpbiAmJiBpc1BsYWluU2FmZShjaGFyLCBwcmV2Q2hhciwgaW5ibG9jaylcbiAgICAgIHByZXZDaGFyID0gY2hhclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBDYXNlOiBibG9jayBzdHlsZXMgcGVybWl0dGVkLlxuICAgIGZvciAoaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBjaGFyID49IDB4MTAwMDAgPyBpICs9IDIgOiBpKyspIHtcbiAgICAgIGNoYXIgPSBjb2RlUG9pbnRBdChzdHJpbmcsIGkpXG4gICAgICBpZiAoY2hhciA9PT0gQ0hBUl9MSU5FX0ZFRUQpIHtcbiAgICAgICAgaGFzTGluZUJyZWFrID0gdHJ1ZVxuICAgICAgICAvLyBDaGVjayBpZiBhbnkgbGluZSBjYW4gYmUgZm9sZGVkLlxuICAgICAgICBpZiAoc2hvdWxkVHJhY2tXaWR0aCkge1xuICAgICAgICAgIGhhc0ZvbGRhYmxlTGluZSA9IGhhc0ZvbGRhYmxlTGluZSB8fFxuICAgICAgICAgICAgLy8gRm9sZGFibGUgbGluZSA9IHRvbyBsb25nLCBhbmQgbm90IG1vcmUtaW5kZW50ZWQuXG4gICAgICAgICAgICAoaSAtIHByZXZpb3VzTGluZUJyZWFrIC0gMSA+IGxpbmVXaWR0aCAmJlxuICAgICAgICAgICAgIHN0cmluZ1twcmV2aW91c0xpbmVCcmVhayArIDFdICE9PSAnICcpXG4gICAgICAgICAgcHJldmlvdXNMaW5lQnJlYWsgPSBpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIWlzUHJpbnRhYmxlKGNoYXIpKSB7XG4gICAgICAgIHJldHVybiBTVFlMRV9ET1VCTEVcbiAgICAgIH1cbiAgICAgIHBsYWluID0gcGxhaW4gJiYgaXNQbGFpblNhZmUoY2hhciwgcHJldkNoYXIsIGluYmxvY2spXG4gICAgICBwcmV2Q2hhciA9IGNoYXJcbiAgICB9XG4gICAgLy8gaW4gY2FzZSB0aGUgZW5kIGlzIG1pc3NpbmcgYSBcXG5cbiAgICBoYXNGb2xkYWJsZUxpbmUgPSBoYXNGb2xkYWJsZUxpbmUgfHwgKHNob3VsZFRyYWNrV2lkdGggJiZcbiAgICAgIChpIC0gcHJldmlvdXNMaW5lQnJlYWsgLSAxID4gbGluZVdpZHRoICYmXG4gICAgICAgc3RyaW5nW3ByZXZpb3VzTGluZUJyZWFrICsgMV0gIT09ICcgJykpXG4gIH1cbiAgLy8gQWx0aG91Z2ggZXZlcnkgc3R5bGUgY2FuIHJlcHJlc2VudCBcXG4gd2l0aG91dCBlc2NhcGluZywgcHJlZmVyIGJsb2NrIHN0eWxlc1xuICAvLyBmb3IgbXVsdGlsaW5lLCBzaW5jZSB0aGV5J3JlIG1vcmUgcmVhZGFibGUgYW5kIHRoZXkgZG9uJ3QgYWRkIGVtcHR5IGxpbmVzLlxuICAvLyBBbHNvIHByZWZlciBmb2xkaW5nIGEgc3VwZXItbG9uZyBsaW5lLlxuICBpZiAoIWhhc0xpbmVCcmVhayAmJiAhaGFzRm9sZGFibGVMaW5lKSB7XG4gICAgLy8gU3RyaW5ncyBpbnRlcnByZXRhYmxlIGFzIGFub3RoZXIgdHlwZSBoYXZlIHRvIGJlIHF1b3RlZDtcbiAgICAvLyBlLmcuIHRoZSBzdHJpbmcgJ3RydWUnIHZzLiB0aGUgYm9vbGVhbiB0cnVlLlxuICAgIGlmIChwbGFpbiAmJiAhZm9yY2VRdW90ZXMgJiYgIXRlc3RBbWJpZ3VvdXNUeXBlKHN0cmluZykpIHtcbiAgICAgIHJldHVybiBTVFlMRV9QTEFJTlxuICAgIH1cbiAgICByZXR1cm4gcXVvdGluZ1R5cGUgPT09IFFVT1RJTkdfVFlQRV9ET1VCTEUgPyBTVFlMRV9ET1VCTEUgOiBTVFlMRV9TSU5HTEVcbiAgfVxuICAvLyBFZGdlIGNhc2U6IGJsb2NrIGluZGVudGF0aW9uIGluZGljYXRvciBjYW4gb25seSBoYXZlIG9uZSBkaWdpdC5cbiAgaWYgKGluZGVudFBlckxldmVsID4gOSAmJiBuZWVkSW5kZW50SW5kaWNhdG9yKHN0cmluZykpIHtcbiAgICByZXR1cm4gU1RZTEVfRE9VQkxFXG4gIH1cbiAgLy8gQXQgdGhpcyBwb2ludCB3ZSBrbm93IGJsb2NrIHN0eWxlcyBhcmUgdmFsaWQuXG4gIC8vIFByZWZlciBsaXRlcmFsIHN0eWxlIHVubGVzcyB3ZSB3YW50IHRvIGZvbGQuXG4gIGlmICghZm9yY2VRdW90ZXMpIHtcbiAgICByZXR1cm4gaGFzRm9sZGFibGVMaW5lID8gU1RZTEVfRk9MREVEIDogU1RZTEVfTElURVJBTFxuICB9XG4gIHJldHVybiBxdW90aW5nVHlwZSA9PT0gUVVPVElOR19UWVBFX0RPVUJMRSA/IFNUWUxFX0RPVUJMRSA6IFNUWUxFX1NJTkdMRVxufVxuXG4vLyBOb3RlOiBsaW5lIGJyZWFraW5nL2ZvbGRpbmcgaXMgaW1wbGVtZW50ZWQgZm9yIG9ubHkgdGhlIGZvbGRlZCBzdHlsZS5cbi8vIE5CLiBXZSBkcm9wIHRoZSBsYXN0IHRyYWlsaW5nIG5ld2xpbmUgKGlmIGFueSkgb2YgYSByZXR1cm5lZCBibG9jayBzY2FsYXJcbi8vICBzaW5jZSB0aGUgZHVtcGVyIGFkZHMgaXRzIG93biBuZXdsaW5lLiBUaGlzIGFsd2F5cyB3b3Jrczpcbi8vICAgIOKAoiBObyBlbmRpbmcgbmV3bGluZSA9PiB1bmFmZmVjdGVkOyBhbHJlYWR5IHVzaW5nIHN0cmlwIFwiLVwiIGNob21waW5nLlxuLy8gICAg4oCiIEVuZGluZyBuZXdsaW5lICAgID0+IHJlbW92ZWQgdGhlbiByZXN0b3JlZC5cbi8vICBJbXBvcnRhbnRseSwgdGhpcyBrZWVwcyB0aGUgXCIrXCIgY2hvbXAgaW5kaWNhdG9yIGZyb20gZ2FpbmluZyBhbiBleHRyYSBsaW5lLlxuZnVuY3Rpb24gd3JpdGVTY2FsYXIgKHN0YXRlLCBzdHJpbmcsIGxldmVsLCBpc2tleSwgaW5ibG9jaykge1xuICBzdGF0ZS5kdW1wID0gKGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoc3RyaW5nLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHN0YXRlLnF1b3RpbmdUeXBlID09PSBRVU9USU5HX1RZUEVfRE9VQkxFID8gJ1wiXCInIDogXCInJ1wiXG4gICAgfVxuICAgIGlmICghc3RhdGUubm9Db21wYXRNb2RlKSB7XG4gICAgICBpZiAoREVQUkVDQVRFRF9CT09MRUFOU19TWU5UQVguaW5kZXhPZihzdHJpbmcpICE9PSAtMSB8fCBERVBSRUNBVEVEX0JBU0U2MF9TWU5UQVgudGVzdChzdHJpbmcpKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZS5xdW90aW5nVHlwZSA9PT0gUVVPVElOR19UWVBFX0RPVUJMRSA/ICgnXCInICsgc3RyaW5nICsgJ1wiJykgOiAoXCInXCIgKyBzdHJpbmcgKyBcIidcIilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbmRlbnQgPSBzdGF0ZS5pbmRlbnQgKiBNYXRoLm1heCgxLCBsZXZlbCkgLy8gbm8gMC1pbmRlbnQgc2NhbGFyc1xuICAgIC8vIEFzIGluZGVudGF0aW9uIGdldHMgZGVlcGVyLCBsZXQgdGhlIHdpZHRoIGRlY3JlYXNlIG1vbm90b25pY2FsbHlcbiAgICAvLyB0byB0aGUgbG93ZXIgYm91bmQgbWluKHN0YXRlLmxpbmVXaWR0aCwgNDApLlxuICAgIC8vIE5vdGUgdGhhdCB0aGlzIGltcGxpZXNcbiAgICAvLyAgc3RhdGUubGluZVdpZHRoIOKJpCA0MCArIHN0YXRlLmluZGVudDogd2lkdGggaXMgZml4ZWQgYXQgdGhlIGxvd2VyIGJvdW5kLlxuICAgIC8vICBzdGF0ZS5saW5lV2lkdGggPiA0MCArIHN0YXRlLmluZGVudDogd2lkdGggZGVjcmVhc2VzIHVudGlsIHRoZSBsb3dlciBib3VuZC5cbiAgICAvLyBUaGlzIGJlaGF2ZXMgYmV0dGVyIHRoYW4gYSBjb25zdGFudCBtaW5pbXVtIHdpZHRoIHdoaWNoIGRpc2FsbG93cyBuYXJyb3dlciBvcHRpb25zLFxuICAgIC8vIG9yIGFuIGluZGVudCB0aHJlc2hvbGQgd2hpY2ggY2F1c2VzIHRoZSB3aWR0aCB0byBzdWRkZW5seSBpbmNyZWFzZS5cbiAgICBjb25zdCBsaW5lV2lkdGggPSAoc3RhdGUubGluZVdpZHRoID09PSAtMSlcbiAgICAgID8gLTFcbiAgICAgIDogTWF0aC5tYXgoTWF0aC5taW4oc3RhdGUubGluZVdpZHRoLCA0MCksIHN0YXRlLmxpbmVXaWR0aCAtIGluZGVudClcblxuICAgIC8vIFdpdGhvdXQga25vd2luZyBpZiBrZXlzIGFyZSBpbXBsaWNpdC9leHBsaWNpdCwgYXNzdW1lIGltcGxpY2l0IGZvciBzYWZldHkuXG4gICAgY29uc3Qgc2luZ2xlTGluZU9ubHkgPSBpc2tleSB8fFxuICAgICAgLy8gTm8gYmxvY2sgc3R5bGVzIGluIGZsb3cgbW9kZS5cbiAgICAgIChzdGF0ZS5mbG93TGV2ZWwgPiAtMSAmJiBsZXZlbCA+PSBzdGF0ZS5mbG93TGV2ZWwpXG4gICAgZnVuY3Rpb24gdGVzdEFtYmlndWl0eSAoc3RyaW5nKSB7XG4gICAgICByZXR1cm4gdGVzdEltcGxpY2l0UmVzb2x2aW5nKHN0YXRlLCBzdHJpbmcpXG4gICAgfVxuXG4gICAgc3dpdGNoIChjaG9vc2VTY2FsYXJTdHlsZShzdHJpbmcsIHNpbmdsZUxpbmVPbmx5LCBzdGF0ZS5pbmRlbnQsIGxpbmVXaWR0aCxcbiAgICAgIHRlc3RBbWJpZ3VpdHksIHN0YXRlLnF1b3RpbmdUeXBlLCBzdGF0ZS5mb3JjZVF1b3RlcyAmJiAhaXNrZXksIGluYmxvY2spKSB7XG4gICAgICBjYXNlIFNUWUxFX1BMQUlOOlxuICAgICAgICByZXR1cm4gc3RyaW5nXG4gICAgICBjYXNlIFNUWUxFX1NJTkdMRTpcbiAgICAgICAgcmV0dXJuIFwiJ1wiICsgc3RyaW5nLnJlcGxhY2UoLycvZywgXCInJ1wiKSArIFwiJ1wiXG4gICAgICBjYXNlIFNUWUxFX0xJVEVSQUw6XG4gICAgICAgIHJldHVybiAnfCcgKyBibG9ja0hlYWRlcihzdHJpbmcsIHN0YXRlLmluZGVudCkgK1xuICAgICAgICAgIGRyb3BFbmRpbmdOZXdsaW5lKGluZGVudFN0cmluZyhzdHJpbmcsIGluZGVudCkpXG4gICAgICBjYXNlIFNUWUxFX0ZPTERFRDpcbiAgICAgICAgcmV0dXJuICc+JyArIGJsb2NrSGVhZGVyKHN0cmluZywgc3RhdGUuaW5kZW50KSArXG4gICAgICAgICAgZHJvcEVuZGluZ05ld2xpbmUoaW5kZW50U3RyaW5nKGZvbGRTdHJpbmcoc3RyaW5nLCBsaW5lV2lkdGgpLCBpbmRlbnQpKVxuICAgICAgY2FzZSBTVFlMRV9ET1VCTEU6XG4gICAgICAgIHJldHVybiAnXCInICsgZXNjYXBlU3RyaW5nKHN0cmluZywgbGluZVdpZHRoKSArICdcIidcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKCdpbXBvc3NpYmxlIGVycm9yOiBpbnZhbGlkIHNjYWxhciBzdHlsZScpXG4gICAgfVxuICB9KCkpXG59XG5cbi8vIFByZS1jb25kaXRpb25zOiBzdHJpbmcgaXMgdmFsaWQgZm9yIGEgYmxvY2sgc2NhbGFyLCAxIDw9IGluZGVudFBlckxldmVsIDw9IDkuXG5mdW5jdGlvbiBibG9ja0hlYWRlciAoc3RyaW5nLCBpbmRlbnRQZXJMZXZlbCkge1xuICBjb25zdCBpbmRlbnRJbmRpY2F0b3IgPSBuZWVkSW5kZW50SW5kaWNhdG9yKHN0cmluZykgPyBTdHJpbmcoaW5kZW50UGVyTGV2ZWwpIDogJydcblxuICAvLyBub3RlIHRoZSBzcGVjaWFsIGNhc2U6IHRoZSBzdHJpbmcgJ1xcbicgY291bnRzIGFzIGEgXCJ0cmFpbGluZ1wiIGVtcHR5IGxpbmUuXG4gIGNvbnN0IGNsaXAgPSBzdHJpbmdbc3RyaW5nLmxlbmd0aCAtIDFdID09PSAnXFxuJ1xuICBjb25zdCBrZWVwID0gY2xpcCAmJiAoc3RyaW5nW3N0cmluZy5sZW5ndGggLSAyXSA9PT0gJ1xcbicgfHwgc3RyaW5nID09PSAnXFxuJylcbiAgY29uc3QgY2hvbXAgPSBrZWVwID8gJysnIDogKGNsaXAgPyAnJyA6ICctJylcblxuICByZXR1cm4gaW5kZW50SW5kaWNhdG9yICsgY2hvbXAgKyAnXFxuJ1xufVxuXG4vLyAoU2VlIHRoZSBub3RlIGZvciB3cml0ZVNjYWxhci4pXG5mdW5jdGlvbiBkcm9wRW5kaW5nTmV3bGluZSAoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmdbc3RyaW5nLmxlbmd0aCAtIDFdID09PSAnXFxuJyA/IHN0cmluZy5zbGljZSgwLCAtMSkgOiBzdHJpbmdcbn1cblxuLy8gTm90ZTogYSBsb25nIGxpbmUgd2l0aG91dCBhIHN1aXRhYmxlIGJyZWFrIHBvaW50IHdpbGwgZXhjZWVkIHRoZSB3aWR0aCBsaW1pdC5cbi8vIFByZS1jb25kaXRpb25zOiBldmVyeSBjaGFyIGluIHN0ciBpc1ByaW50YWJsZSwgc3RyLmxlbmd0aCA+IDAsIHdpZHRoID4gMC5cbmZ1bmN0aW9uIGZvbGRTdHJpbmcgKHN0cmluZywgd2lkdGgpIHtcbiAgLy8gSW4gZm9sZGVkIHN0eWxlLCAkayQgY29uc2VjdXRpdmUgbmV3bGluZXMgb3V0cHV0IGFzICRrKzEkIG5ld2xpbmVz4oCUXG4gIC8vIHVubGVzcyB0aGV5J3JlIGJlZm9yZSBvciBhZnRlciBhIG1vcmUtaW5kZW50ZWQgbGluZSwgb3IgYXQgdGhlIHZlcnlcbiAgLy8gYmVnaW5uaW5nIG9yIGVuZCwgaW4gd2hpY2ggY2FzZSAkayQgbWFwcyB0byAkayQuXG4gIC8vIFRoZXJlZm9yZSwgcGFyc2UgZWFjaCBjaHVuayBhcyBuZXdsaW5lKHMpIGZvbGxvd2VkIGJ5IGEgY29udGVudCBsaW5lLlxuICBjb25zdCBsaW5lUmUgPSAvKFxcbispKFteXFxuXSopL2dcblxuICAvLyBmaXJzdCBsaW5lIChwb3NzaWJseSBhbiBlbXB0eSBsaW5lKVxuICBsZXQgcmVzdWx0ID0gKGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgbmV4dExGID0gc3RyaW5nLmluZGV4T2YoJ1xcbicpXG4gICAgbmV4dExGID0gbmV4dExGICE9PSAtMSA/IG5leHRMRiA6IHN0cmluZy5sZW5ndGhcbiAgICBsaW5lUmUubGFzdEluZGV4ID0gbmV4dExGXG4gICAgcmV0dXJuIGZvbGRMaW5lKHN0cmluZy5zbGljZSgwLCBuZXh0TEYpLCB3aWR0aClcbiAgfSgpKVxuICAvLyBJZiB3ZSBoYXZlbid0IHJlYWNoZWQgdGhlIGZpcnN0IGNvbnRlbnQgbGluZSB5ZXQsIGRvbid0IGFkZCBhbiBleHRyYSBcXG4uXG4gIGxldCBwcmV2TW9yZUluZGVudGVkID0gc3RyaW5nWzBdID09PSAnXFxuJyB8fCBzdHJpbmdbMF0gPT09ICcgJ1xuICBsZXQgbW9yZUluZGVudGVkXG5cbiAgLy8gcmVzdCBvZiB0aGUgbGluZXNcbiAgbGV0IG1hdGNoXG4gIHdoaWxlICgobWF0Y2ggPSBsaW5lUmUuZXhlYyhzdHJpbmcpKSkge1xuICAgIGNvbnN0IHByZWZpeCA9IG1hdGNoWzFdXG4gICAgY29uc3QgbGluZSA9IG1hdGNoWzJdXG5cbiAgICBtb3JlSW5kZW50ZWQgPSAobGluZVswXSA9PT0gJyAnKVxuICAgIHJlc3VsdCArPSBwcmVmaXggK1xuICAgICAgKCghcHJldk1vcmVJbmRlbnRlZCAmJiAhbW9yZUluZGVudGVkICYmIGxpbmUgIT09ICcnKSA/ICdcXG4nIDogJycpICtcbiAgICAgIGZvbGRMaW5lKGxpbmUsIHdpZHRoKVxuICAgIHByZXZNb3JlSW5kZW50ZWQgPSBtb3JlSW5kZW50ZWRcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuLy8gR3JlZWR5IGxpbmUgYnJlYWtpbmcuXG4vLyBQaWNrcyB0aGUgbG9uZ2VzdCBsaW5lIHVuZGVyIHRoZSBsaW1pdCBlYWNoIHRpbWUsXG4vLyBvdGhlcndpc2Ugc2V0dGxlcyBmb3IgdGhlIHNob3J0ZXN0IGxpbmUgb3ZlciB0aGUgbGltaXQuXG4vLyBOQi4gTW9yZS1pbmRlbnRlZCBsaW5lcyAqY2Fubm90KiBiZSBmb2xkZWQsIGFzIHRoYXQgd291bGQgYWRkIGFuIGV4dHJhIFxcbi5cbmZ1bmN0aW9uIGZvbGRMaW5lIChsaW5lLCB3aWR0aCkge1xuICBpZiAobGluZSA9PT0gJycgfHwgbGluZVswXSA9PT0gJyAnKSByZXR1cm4gbGluZVxuXG4gIC8vIFNpbmNlIGEgbW9yZS1pbmRlbnRlZCBsaW5lIGFkZHMgYSBcXG4sIGJyZWFrcyBjYW4ndCBiZSBmb2xsb3dlZCBieSBhIHNwYWNlLlxuICBjb25zdCBicmVha1JlID0gLyBbXiBdL2cgLy8gbm90ZTogdGhlIG1hdGNoIGluZGV4IHdpbGwgYWx3YXlzIGJlIDw9IGxlbmd0aC0yLlxuICBsZXQgbWF0Y2hcbiAgLy8gc3RhcnQgaXMgYW4gaW5jbHVzaXZlIGluZGV4LiBlbmQsIGN1cnIsIGFuZCBuZXh0IGFyZSBleGNsdXNpdmUuXG4gIGxldCBzdGFydCA9IDBcbiAgbGV0IGVuZFxuICBsZXQgY3VyciA9IDBcbiAgbGV0IG5leHQgPSAwXG4gIGxldCByZXN1bHQgPSAnJ1xuXG4gIC8vIEludmFyaWFudHM6IDAgPD0gc3RhcnQgPD0gbGVuZ3RoLTEuXG4gIC8vICAgMCA8PSBjdXJyIDw9IG5leHQgPD0gbWF4KDAsIGxlbmd0aC0yKS4gY3VyciAtIHN0YXJ0IDw9IHdpZHRoLlxuICAvLyBJbnNpZGUgdGhlIGxvb3A6XG4gIC8vICAgQSBtYXRjaCBpbXBsaWVzIGxlbmd0aCA+PSAyLCBzbyBjdXJyIGFuZCBuZXh0IGFyZSA8PSBsZW5ndGgtMi5cbiAgd2hpbGUgKChtYXRjaCA9IGJyZWFrUmUuZXhlYyhsaW5lKSkpIHtcbiAgICBuZXh0ID0gbWF0Y2guaW5kZXhcbiAgICAvLyBtYWludGFpbiBpbnZhcmlhbnQ6IGN1cnIgLSBzdGFydCA8PSB3aWR0aFxuICAgIGlmIChuZXh0IC0gc3RhcnQgPiB3aWR0aCkge1xuICAgICAgZW5kID0gKGN1cnIgPiBzdGFydCkgPyBjdXJyIDogbmV4dCAvLyBkZXJpdmUgZW5kIDw9IGxlbmd0aC0yXG4gICAgICByZXN1bHQgKz0gJ1xcbicgKyBsaW5lLnNsaWNlKHN0YXJ0LCBlbmQpXG4gICAgICAvLyBza2lwIHRoZSBzcGFjZSB0aGF0IHdhcyBvdXRwdXQgYXMgXFxuXG4gICAgICBzdGFydCA9IGVuZCArIDEgICAgICAgICAgICAgICAgICAgIC8vIGRlcml2ZSBzdGFydCA8PSBsZW5ndGgtMVxuICAgIH1cbiAgICBjdXJyID0gbmV4dFxuICB9XG5cbiAgLy8gQnkgdGhlIGludmFyaWFudHMsIHN0YXJ0IDw9IGxlbmd0aC0xLCBzbyB0aGVyZSBpcyBzb21ldGhpbmcgbGVmdCBvdmVyLlxuICAvLyBJdCBpcyBlaXRoZXIgdGhlIHdob2xlIHN0cmluZyBvciBhIHBhcnQgc3RhcnRpbmcgZnJvbSBub24td2hpdGVzcGFjZS5cbiAgcmVzdWx0ICs9ICdcXG4nXG4gIC8vIEluc2VydCBhIGJyZWFrIGlmIHRoZSByZW1haW5kZXIgaXMgdG9vIGxvbmcgYW5kIHRoZXJlIGlzIGEgYnJlYWsgYXZhaWxhYmxlLlxuICBpZiAobGluZS5sZW5ndGggLSBzdGFydCA+IHdpZHRoICYmIGN1cnIgPiBzdGFydCkge1xuICAgIHJlc3VsdCArPSBsaW5lLnNsaWNlKHN0YXJ0LCBjdXJyKSArICdcXG4nICsgbGluZS5zbGljZShjdXJyICsgMSlcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgKz0gbGluZS5zbGljZShzdGFydClcbiAgfVxuXG4gIHJldHVybiByZXN1bHQuc2xpY2UoMSkgLy8gZHJvcCBleHRyYSBcXG4gam9pbmVyXG59XG5cbi8vIEVzY2FwZXMgYSBkb3VibGUtcXVvdGVkIHN0cmluZy5cbmZ1bmN0aW9uIGVzY2FwZVN0cmluZyAoc3RyaW5nKSB7XG4gIGxldCByZXN1bHQgPSAnJ1xuICBsZXQgY2hhciA9IDBcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGNoYXIgPj0gMHgxMDAwMCA/IGkgKz0gMiA6IGkrKykge1xuICAgIGNoYXIgPSBjb2RlUG9pbnRBdChzdHJpbmcsIGkpXG4gICAgY29uc3QgZXNjYXBlU2VxID0gRVNDQVBFX1NFUVVFTkNFU1tjaGFyXVxuXG4gICAgaWYgKCFlc2NhcGVTZXEgJiYgaXNQcmludGFibGUoY2hhcikpIHtcbiAgICAgIHJlc3VsdCArPSBzdHJpbmdbaV1cbiAgICAgIGlmIChjaGFyID49IDB4MTAwMDApIHJlc3VsdCArPSBzdHJpbmdbaSArIDFdXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCArPSBlc2NhcGVTZXEgfHwgZW5jb2RlSGV4KGNoYXIpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb3dTZXF1ZW5jZSAoc3RhdGUsIGxldmVsLCBvYmplY3QpIHtcbiAgbGV0IF9yZXN1bHQgPSAnJ1xuICBjb25zdCBfdGFnID0gc3RhdGUudGFnXG5cbiAgZm9yIChsZXQgaW5kZXggPSAwLCBsZW5ndGggPSBvYmplY3QubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGxldCB2YWx1ZSA9IG9iamVjdFtpbmRleF1cblxuICAgIGlmIChzdGF0ZS5yZXBsYWNlcikge1xuICAgICAgdmFsdWUgPSBzdGF0ZS5yZXBsYWNlci5jYWxsKG9iamVjdCwgU3RyaW5nKGluZGV4KSwgdmFsdWUpXG4gICAgfVxuXG4gICAgLy8gV3JpdGUgb25seSB2YWxpZCBlbGVtZW50cywgcHV0IG51bGwgaW5zdGVhZCBvZiBpbnZhbGlkIGVsZW1lbnRzLlxuICAgIGlmICh3cml0ZU5vZGUoc3RhdGUsIGxldmVsLCB2YWx1ZSwgZmFsc2UsIGZhbHNlKSB8fFxuICAgICAgICAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCwgbnVsbCwgZmFsc2UsIGZhbHNlKSkpIHtcbiAgICAgIGlmIChfcmVzdWx0ICE9PSAnJykgX3Jlc3VsdCArPSAnLCcgKyAoIXN0YXRlLmNvbmRlbnNlRmxvdyA/ICcgJyA6ICcnKVxuICAgICAgX3Jlc3VsdCArPSBzdGF0ZS5kdW1wXG4gICAgfVxuICB9XG5cbiAgc3RhdGUudGFnID0gX3RhZ1xuICBzdGF0ZS5kdW1wID0gJ1snICsgX3Jlc3VsdCArICddJ1xufVxuXG5mdW5jdGlvbiB3cml0ZUJsb2NrU2VxdWVuY2UgKHN0YXRlLCBsZXZlbCwgb2JqZWN0LCBjb21wYWN0KSB7XG4gIGxldCBfcmVzdWx0ID0gJydcbiAgY29uc3QgX3RhZyA9IHN0YXRlLnRhZ1xuXG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBsZXQgdmFsdWUgPSBvYmplY3RbaW5kZXhdXG5cbiAgICBpZiAoc3RhdGUucmVwbGFjZXIpIHtcbiAgICAgIHZhbHVlID0gc3RhdGUucmVwbGFjZXIuY2FsbChvYmplY3QsIFN0cmluZyhpbmRleCksIHZhbHVlKVxuICAgIH1cblxuICAgIC8vIFdyaXRlIG9ubHkgdmFsaWQgZWxlbWVudHMsIHB1dCBudWxsIGluc3RlYWQgb2YgaW52YWxpZCBlbGVtZW50cy5cbiAgICBpZiAod3JpdGVOb2RlKHN0YXRlLCBsZXZlbCArIDEsIHZhbHVlLCB0cnVlLCB0cnVlLCBmYWxzZSwgdHJ1ZSkgfHxcbiAgICAgICAgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgIHdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwgKyAxLCBudWxsLCB0cnVlLCB0cnVlLCBmYWxzZSwgdHJ1ZSkpKSB7XG4gICAgICBpZiAoIWNvbXBhY3QgfHwgX3Jlc3VsdCAhPT0gJycpIHtcbiAgICAgICAgX3Jlc3VsdCArPSBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlLCBsZXZlbClcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlLmR1bXAgJiYgQ0hBUl9MSU5FX0ZFRUQgPT09IHN0YXRlLmR1bXAuY2hhckNvZGVBdCgwKSkge1xuICAgICAgICBfcmVzdWx0ICs9ICctJ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3Jlc3VsdCArPSAnLSAnXG4gICAgICB9XG5cbiAgICAgIF9yZXN1bHQgKz0gc3RhdGUuZHVtcFxuICAgIH1cbiAgfVxuXG4gIHN0YXRlLnRhZyA9IF90YWdcbiAgc3RhdGUuZHVtcCA9IF9yZXN1bHQgfHwgJ1tdJyAvLyBFbXB0eSBzZXF1ZW5jZSBpZiBubyB2YWxpZCB2YWx1ZXMuXG59XG5cbmZ1bmN0aW9uIHdyaXRlRmxvd01hcHBpbmcgKHN0YXRlLCBsZXZlbCwgb2JqZWN0KSB7XG4gIGxldCBfcmVzdWx0ID0gJydcbiAgY29uc3QgX3RhZyA9IHN0YXRlLnRhZ1xuICBjb25zdCBvYmplY3RLZXlMaXN0ID0gT2JqZWN0LmtleXMob2JqZWN0KVxuXG4gIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gb2JqZWN0S2V5TGlzdC5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgbGV0IHBhaXJCdWZmZXIgPSAnJ1xuICAgIGlmIChfcmVzdWx0ICE9PSAnJykgcGFpckJ1ZmZlciArPSAnLCAnXG5cbiAgICBpZiAoc3RhdGUuY29uZGVuc2VGbG93KSBwYWlyQnVmZmVyICs9ICdcIidcblxuICAgIGNvbnN0IG9iamVjdEtleSA9IG9iamVjdEtleUxpc3RbaW5kZXhdXG4gICAgbGV0IG9iamVjdFZhbHVlID0gb2JqZWN0W29iamVjdEtleV1cblxuICAgIGlmIChzdGF0ZS5yZXBsYWNlcikge1xuICAgICAgb2JqZWN0VmFsdWUgPSBzdGF0ZS5yZXBsYWNlci5jYWxsKG9iamVjdCwgb2JqZWN0S2V5LCBvYmplY3RWYWx1ZSlcbiAgICB9XG5cbiAgICBpZiAoIXdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwsIG9iamVjdEtleSwgZmFsc2UsIGZhbHNlKSkge1xuICAgICAgY29udGludWUgLy8gU2tpcCB0aGlzIHBhaXIgYmVjYXVzZSBvZiBpbnZhbGlkIGtleTtcbiAgICB9XG5cbiAgICBpZiAoc3RhdGUuZHVtcC5sZW5ndGggPiAxMDI0KSBwYWlyQnVmZmVyICs9ICc/ICdcblxuICAgIHBhaXJCdWZmZXIgKz0gc3RhdGUuZHVtcCArIChzdGF0ZS5jb25kZW5zZUZsb3cgPyAnXCInIDogJycpICsgJzonICsgKHN0YXRlLmNvbmRlbnNlRmxvdyA/ICcnIDogJyAnKVxuXG4gICAgaWYgKCF3cml0ZU5vZGUoc3RhdGUsIGxldmVsLCBvYmplY3RWYWx1ZSwgZmFsc2UsIGZhbHNlKSkge1xuICAgICAgY29udGludWUgLy8gU2tpcCB0aGlzIHBhaXIgYmVjYXVzZSBvZiBpbnZhbGlkIHZhbHVlLlxuICAgIH1cblxuICAgIHBhaXJCdWZmZXIgKz0gc3RhdGUuZHVtcFxuXG4gICAgLy8gQm90aCBrZXkgYW5kIHZhbHVlIGFyZSB2YWxpZC5cbiAgICBfcmVzdWx0ICs9IHBhaXJCdWZmZXJcbiAgfVxuXG4gIHN0YXRlLnRhZyA9IF90YWdcbiAgc3RhdGUuZHVtcCA9ICd7JyArIF9yZXN1bHQgKyAnfSdcbn1cblxuZnVuY3Rpb24gd3JpdGVCbG9ja01hcHBpbmcgKHN0YXRlLCBsZXZlbCwgb2JqZWN0LCBjb21wYWN0KSB7XG4gIGxldCBfcmVzdWx0ID0gJydcbiAgY29uc3QgX3RhZyA9IHN0YXRlLnRhZ1xuICBjb25zdCBvYmplY3RLZXlMaXN0ID0gT2JqZWN0LmtleXMob2JqZWN0KVxuXG4gIC8vIEFsbG93IHNvcnRpbmcga2V5cyBzbyB0aGF0IHRoZSBvdXRwdXQgZmlsZSBpcyBkZXRlcm1pbmlzdGljXG4gIGlmIChzdGF0ZS5zb3J0S2V5cyA9PT0gdHJ1ZSkge1xuICAgIC8vIERlZmF1bHQgc29ydGluZ1xuICAgIG9iamVjdEtleUxpc3Quc29ydCgpXG4gIH0gZWxzZSBpZiAodHlwZW9mIHN0YXRlLnNvcnRLZXlzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gQ3VzdG9tIHNvcnQgZnVuY3Rpb25cbiAgICBvYmplY3RLZXlMaXN0LnNvcnQoc3RhdGUuc29ydEtleXMpXG4gIH0gZWxzZSBpZiAoc3RhdGUuc29ydEtleXMpIHtcbiAgICAvLyBTb21ldGhpbmcgaXMgd3JvbmdcbiAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignc29ydEtleXMgbXVzdCBiZSBhIGJvb2xlYW4gb3IgYSBmdW5jdGlvbicpXG4gIH1cblxuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IG9iamVjdEtleUxpc3QubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGxldCBwYWlyQnVmZmVyID0gJydcblxuICAgIGlmICghY29tcGFjdCB8fCBfcmVzdWx0ICE9PSAnJykge1xuICAgICAgcGFpckJ1ZmZlciArPSBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlLCBsZXZlbClcbiAgICB9XG5cbiAgICBjb25zdCBvYmplY3RLZXkgPSBvYmplY3RLZXlMaXN0W2luZGV4XVxuICAgIGxldCBvYmplY3RWYWx1ZSA9IG9iamVjdFtvYmplY3RLZXldXG5cbiAgICBpZiAoc3RhdGUucmVwbGFjZXIpIHtcbiAgICAgIG9iamVjdFZhbHVlID0gc3RhdGUucmVwbGFjZXIuY2FsbChvYmplY3QsIG9iamVjdEtleSwgb2JqZWN0VmFsdWUpXG4gICAgfVxuXG4gICAgaWYgKCF3cml0ZU5vZGUoc3RhdGUsIGxldmVsICsgMSwgb2JqZWN0S2V5LCB0cnVlLCB0cnVlLCB0cnVlKSkge1xuICAgICAgY29udGludWUgLy8gU2tpcCB0aGlzIHBhaXIgYmVjYXVzZSBvZiBpbnZhbGlkIGtleS5cbiAgICB9XG5cbiAgICBjb25zdCBleHBsaWNpdFBhaXIgPSAoc3RhdGUudGFnICE9PSBudWxsICYmIHN0YXRlLnRhZyAhPT0gJz8nKSB8fFxuICAgICAgICAgICAgICAgICAgIChzdGF0ZS5kdW1wICYmIHN0YXRlLmR1bXAubGVuZ3RoID4gMTAyNClcblxuICAgIGlmIChleHBsaWNpdFBhaXIpIHtcbiAgICAgIGlmIChzdGF0ZS5kdW1wICYmIENIQVJfTElORV9GRUVEID09PSBzdGF0ZS5kdW1wLmNoYXJDb2RlQXQoMCkpIHtcbiAgICAgICAgcGFpckJ1ZmZlciArPSAnPydcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhaXJCdWZmZXIgKz0gJz8gJ1xuICAgICAgfVxuICAgIH1cblxuICAgIHBhaXJCdWZmZXIgKz0gc3RhdGUuZHVtcFxuXG4gICAgaWYgKGV4cGxpY2l0UGFpcikge1xuICAgICAgcGFpckJ1ZmZlciArPSBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlLCBsZXZlbClcbiAgICB9XG5cbiAgICBpZiAoIXdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwgKyAxLCBvYmplY3RWYWx1ZSwgdHJ1ZSwgZXhwbGljaXRQYWlyKSkge1xuICAgICAgY29udGludWUgLy8gU2tpcCB0aGlzIHBhaXIgYmVjYXVzZSBvZiBpbnZhbGlkIHZhbHVlLlxuICAgIH1cblxuICAgIGlmIChzdGF0ZS5kdW1wICYmIENIQVJfTElORV9GRUVEID09PSBzdGF0ZS5kdW1wLmNoYXJDb2RlQXQoMCkpIHtcbiAgICAgIHBhaXJCdWZmZXIgKz0gJzonXG4gICAgfSBlbHNlIHtcbiAgICAgIHBhaXJCdWZmZXIgKz0gJzogJ1xuICAgIH1cblxuICAgIHBhaXJCdWZmZXIgKz0gc3RhdGUuZHVtcFxuXG4gICAgLy8gQm90aCBrZXkgYW5kIHZhbHVlIGFyZSB2YWxpZC5cbiAgICBfcmVzdWx0ICs9IHBhaXJCdWZmZXJcbiAgfVxuXG4gIHN0YXRlLnRhZyA9IF90YWdcbiAgc3RhdGUuZHVtcCA9IF9yZXN1bHQgfHwgJ3t9JyAvLyBFbXB0eSBtYXBwaW5nIGlmIG5vIHZhbGlkIHBhaXJzLlxufVxuXG5mdW5jdGlvbiBkZXRlY3RUeXBlIChzdGF0ZSwgb2JqZWN0LCBleHBsaWNpdCkge1xuICBjb25zdCB0eXBlTGlzdCA9IGV4cGxpY2l0ID8gc3RhdGUuZXhwbGljaXRUeXBlcyA6IHN0YXRlLmltcGxpY2l0VHlwZXNcblxuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IHR5cGVMaXN0Lmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCB0eXBlID0gdHlwZUxpc3RbaW5kZXhdXG5cbiAgICBpZiAoKHR5cGUuaW5zdGFuY2VPZiB8fCB0eXBlLnByZWRpY2F0ZSkgJiZcbiAgICAgICAgKCF0eXBlLmluc3RhbmNlT2YgfHwgKCh0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JykgJiYgKG9iamVjdCBpbnN0YW5jZW9mIHR5cGUuaW5zdGFuY2VPZikpKSAmJlxuICAgICAgICAoIXR5cGUucHJlZGljYXRlIHx8IHR5cGUucHJlZGljYXRlKG9iamVjdCkpKSB7XG4gICAgICBpZiAoZXhwbGljaXQpIHtcbiAgICAgICAgaWYgKHR5cGUubXVsdGkgJiYgdHlwZS5yZXByZXNlbnROYW1lKSB7XG4gICAgICAgICAgc3RhdGUudGFnID0gdHlwZS5yZXByZXNlbnROYW1lKG9iamVjdClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGF0ZS50YWcgPSB0eXBlLnRhZ1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0ZS50YWcgPSAnPydcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGUucmVwcmVzZW50KSB7XG4gICAgICAgIGNvbnN0IHN0eWxlID0gc3RhdGUuc3R5bGVNYXBbdHlwZS50YWddIHx8IHR5cGUuZGVmYXVsdFN0eWxlXG5cbiAgICAgICAgbGV0IF9yZXN1bHRcbiAgICAgICAgaWYgKF90b1N0cmluZy5jYWxsKHR5cGUucmVwcmVzZW50KSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJykge1xuICAgICAgICAgIF9yZXN1bHQgPSB0eXBlLnJlcHJlc2VudChvYmplY3QsIHN0eWxlKVxuICAgICAgICB9IGVsc2UgaWYgKF9oYXNPd25Qcm9wZXJ0eS5jYWxsKHR5cGUucmVwcmVzZW50LCBzdHlsZSkpIHtcbiAgICAgICAgICBfcmVzdWx0ID0gdHlwZS5yZXByZXNlbnRbc3R5bGVdKG9iamVjdCwgc3R5bGUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFlBTUxFeGNlcHRpb24oJyE8JyArIHR5cGUudGFnICsgJz4gdGFnIHJlc29sdmVyIGFjY2VwdHMgbm90IFwiJyArIHN0eWxlICsgJ1wiIHN0eWxlJylcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlLmR1bXAgPSBfcmVzdWx0XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8vIFNlcmlhbGl6ZXMgYG9iamVjdGAgYW5kIHdyaXRlcyBpdCB0byBnbG9iYWwgYHJlc3VsdGAuXG4vLyBSZXR1cm5zIHRydWUgb24gc3VjY2Vzcywgb3IgZmFsc2Ugb24gaW52YWxpZCBvYmplY3QuXG4vL1xuZnVuY3Rpb24gd3JpdGVOb2RlIChzdGF0ZSwgbGV2ZWwsIG9iamVjdCwgYmxvY2ssIGNvbXBhY3QsIGlza2V5LCBpc2Jsb2Nrc2VxKSB7XG4gIHN0YXRlLnRhZyA9IG51bGxcbiAgc3RhdGUuZHVtcCA9IG9iamVjdFxuXG4gIGlmICghZGV0ZWN0VHlwZShzdGF0ZSwgb2JqZWN0LCBmYWxzZSkpIHtcbiAgICBkZXRlY3RUeXBlKHN0YXRlLCBvYmplY3QsIHRydWUpXG4gIH1cblxuICBjb25zdCB0eXBlID0gX3RvU3RyaW5nLmNhbGwoc3RhdGUuZHVtcClcbiAgY29uc3QgaW5ibG9jayA9IGJsb2NrXG5cbiAgaWYgKGJsb2NrKSB7XG4gICAgYmxvY2sgPSAoc3RhdGUuZmxvd0xldmVsIDwgMCB8fCBzdGF0ZS5mbG93TGV2ZWwgPiBsZXZlbClcbiAgfVxuXG4gIGNvbnN0IG9iamVjdE9yQXJyYXkgPSB0eXBlID09PSAnW29iamVjdCBPYmplY3RdJyB8fCB0eXBlID09PSAnW29iamVjdCBBcnJheV0nXG4gIGxldCBkdXBsaWNhdGVJbmRleFxuICBsZXQgZHVwbGljYXRlXG5cbiAgaWYgKG9iamVjdE9yQXJyYXkpIHtcbiAgICBkdXBsaWNhdGVJbmRleCA9IHN0YXRlLmR1cGxpY2F0ZXMuaW5kZXhPZihvYmplY3QpXG4gICAgZHVwbGljYXRlID0gZHVwbGljYXRlSW5kZXggIT09IC0xXG4gIH1cblxuICBpZiAoKHN0YXRlLnRhZyAhPT0gbnVsbCAmJiBzdGF0ZS50YWcgIT09ICc/JykgfHwgZHVwbGljYXRlIHx8IChzdGF0ZS5pbmRlbnQgIT09IDIgJiYgbGV2ZWwgPiAwKSkge1xuICAgIGNvbXBhY3QgPSBmYWxzZVxuICB9XG5cbiAgaWYgKGR1cGxpY2F0ZSAmJiBzdGF0ZS51c2VkRHVwbGljYXRlc1tkdXBsaWNhdGVJbmRleF0pIHtcbiAgICBzdGF0ZS5kdW1wID0gJypyZWZfJyArIGR1cGxpY2F0ZUluZGV4XG4gIH0gZWxzZSB7XG4gICAgaWYgKG9iamVjdE9yQXJyYXkgJiYgZHVwbGljYXRlICYmICFzdGF0ZS51c2VkRHVwbGljYXRlc1tkdXBsaWNhdGVJbmRleF0pIHtcbiAgICAgIHN0YXRlLnVzZWREdXBsaWNhdGVzW2R1cGxpY2F0ZUluZGV4XSA9IHRydWVcbiAgICB9XG4gICAgaWYgKHR5cGUgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICBpZiAoYmxvY2sgJiYgKE9iamVjdC5rZXlzKHN0YXRlLmR1bXApLmxlbmd0aCAhPT0gMCkpIHtcbiAgICAgICAgd3JpdGVCbG9ja01hcHBpbmcoc3RhdGUsIGxldmVsLCBzdGF0ZS5kdW1wLCBjb21wYWN0KVxuICAgICAgICBpZiAoZHVwbGljYXRlKSB7XG4gICAgICAgICAgc3RhdGUuZHVtcCA9ICcmcmVmXycgKyBkdXBsaWNhdGVJbmRleCArIHN0YXRlLmR1bXBcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd3JpdGVGbG93TWFwcGluZyhzdGF0ZSwgbGV2ZWwsIHN0YXRlLmR1bXApXG4gICAgICAgIGlmIChkdXBsaWNhdGUpIHtcbiAgICAgICAgICBzdGF0ZS5kdW1wID0gJyZyZWZfJyArIGR1cGxpY2F0ZUluZGV4ICsgJyAnICsgc3RhdGUuZHVtcFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICBpZiAoYmxvY2sgJiYgKHN0YXRlLmR1bXAubGVuZ3RoICE9PSAwKSkge1xuICAgICAgICBpZiAoc3RhdGUubm9BcnJheUluZGVudCAmJiAhaXNibG9ja3NlcSAmJiBsZXZlbCA+IDApIHtcbiAgICAgICAgICB3cml0ZUJsb2NrU2VxdWVuY2Uoc3RhdGUsIGxldmVsIC0gMSwgc3RhdGUuZHVtcCwgY29tcGFjdClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3cml0ZUJsb2NrU2VxdWVuY2Uoc3RhdGUsIGxldmVsLCBzdGF0ZS5kdW1wLCBjb21wYWN0KVxuICAgICAgICB9XG4gICAgICAgIGlmIChkdXBsaWNhdGUpIHtcbiAgICAgICAgICBzdGF0ZS5kdW1wID0gJyZyZWZfJyArIGR1cGxpY2F0ZUluZGV4ICsgc3RhdGUuZHVtcFxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3cml0ZUZsb3dTZXF1ZW5jZShzdGF0ZSwgbGV2ZWwsIHN0YXRlLmR1bXApXG4gICAgICAgIGlmIChkdXBsaWNhdGUpIHtcbiAgICAgICAgICBzdGF0ZS5kdW1wID0gJyZyZWZfJyArIGR1cGxpY2F0ZUluZGV4ICsgJyAnICsgc3RhdGUuZHVtcFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnW29iamVjdCBTdHJpbmddJykge1xuICAgICAgaWYgKHN0YXRlLnRhZyAhPT0gJz8nKSB7XG4gICAgICAgIHdyaXRlU2NhbGFyKHN0YXRlLCBzdGF0ZS5kdW1wLCBsZXZlbCwgaXNrZXksIGluYmxvY2spXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnW29iamVjdCBVbmRlZmluZWRdJykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzdGF0ZS5za2lwSW52YWxpZCkgcmV0dXJuIGZhbHNlXG4gICAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbigndW5hY2NlcHRhYmxlIGtpbmQgb2YgYW4gb2JqZWN0IHRvIGR1bXAgJyArIHR5cGUpXG4gICAgfVxuXG4gICAgaWYgKHN0YXRlLnRhZyAhPT0gbnVsbCAmJiBzdGF0ZS50YWcgIT09ICc/Jykge1xuICAgICAgLy8gTmVlZCB0byBlbmNvZGUgYWxsIGNoYXJhY3RlcnMgZXhjZXB0IHRob3NlIGFsbG93ZWQgYnkgdGhlIHNwZWM6XG4gICAgICAvL1xuICAgICAgLy8gWzM1XSBucy1kZWMtZGlnaXQgICAgOjo9ICBbI3gzMC0jeDM5XSAvKiAwLTkgKi9cbiAgICAgIC8vIFszNl0gbnMtaGV4LWRpZ2l0ICAgIDo6PSAgbnMtZGVjLWRpZ2l0XG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICB8IFsjeDQxLSN4NDZdIC8qIEEtRiAqLyB8IFsjeDYxLSN4NjZdIC8qIGEtZiAqL1xuICAgICAgLy8gWzM3XSBucy1hc2NpaS1sZXR0ZXIgOjo9ICBbI3g0MS0jeDVBXSAvKiBBLVogKi8gfCBbI3g2MS0jeDdBXSAvKiBhLXogKi9cbiAgICAgIC8vIFszOF0gbnMtd29yZC1jaGFyICAgIDo6PSAgbnMtZGVjLWRpZ2l0IHwgbnMtYXNjaWktbGV0dGVyIHwg4oCcLeKAnVxuICAgICAgLy8gWzM5XSBucy11cmktY2hhciAgICAgOjo9ICDigJwl4oCdIG5zLWhleC1kaWdpdCBucy1oZXgtZGlnaXQgfCBucy13b3JkLWNoYXIgfCDigJwj4oCdXG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICB8IOKAnDvigJ0gfCDigJwv4oCdIHwg4oCcP+KAnSB8IOKAnDrigJ0gfCDigJxA4oCdIHwg4oCcJuKAnSB8IOKAnD3igJ0gfCDigJwr4oCdIHwg4oCcJOKAnSB8IOKAnCzigJ1cbiAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIHwg4oCcX+KAnSB8IOKAnC7igJ0gfCDigJwh4oCdIHwg4oCcfuKAnSB8IOKAnCrigJ0gfCDigJwn4oCdIHwg4oCcKOKAnSB8IOKAnCnigJ0gfCDigJxb4oCdIHwg4oCcXeKAnVxuICAgICAgLy9cbiAgICAgIC8vIEFsc28gbmVlZCB0byBlbmNvZGUgJyEnIGJlY2F1c2UgaXQgaGFzIHNwZWNpYWwgbWVhbmluZyAoZW5kIG9mIHRhZyBwcmVmaXgpLlxuICAgICAgLy9cbiAgICAgIGxldCB0YWdTdHIgPSBlbmNvZGVVUkkoXG4gICAgICAgIHN0YXRlLnRhZ1swXSA9PT0gJyEnID8gc3RhdGUudGFnLnNsaWNlKDEpIDogc3RhdGUudGFnXG4gICAgICApLnJlcGxhY2UoLyEvZywgJyUyMScpXG5cbiAgICAgIGlmIChzdGF0ZS50YWdbMF0gPT09ICchJykge1xuICAgICAgICB0YWdTdHIgPSAnIScgKyB0YWdTdHJcbiAgICAgIH0gZWxzZSBpZiAodGFnU3RyLnNsaWNlKDAsIDE4KSA9PT0gJ3RhZzp5YW1sLm9yZywyMDAyOicpIHtcbiAgICAgICAgdGFnU3RyID0gJyEhJyArIHRhZ1N0ci5zbGljZSgxOClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRhZ1N0ciA9ICchPCcgKyB0YWdTdHIgKyAnPidcbiAgICAgIH1cblxuICAgICAgc3RhdGUuZHVtcCA9IHRhZ1N0ciArICcgJyArIHN0YXRlLmR1bXBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiBnZXREdXBsaWNhdGVSZWZlcmVuY2VzIChvYmplY3QsIHN0YXRlKSB7XG4gIGNvbnN0IG9iamVjdHMgPSBbXVxuICBjb25zdCBkdXBsaWNhdGVzSW5kZXhlcyA9IFtdXG5cbiAgaW5zcGVjdE5vZGUob2JqZWN0LCBvYmplY3RzLCBkdXBsaWNhdGVzSW5kZXhlcylcblxuICBjb25zdCBsZW5ndGggPSBkdXBsaWNhdGVzSW5kZXhlcy5sZW5ndGhcbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIHN0YXRlLmR1cGxpY2F0ZXMucHVzaChvYmplY3RzW2R1cGxpY2F0ZXNJbmRleGVzW2luZGV4XV0pXG4gIH1cbiAgc3RhdGUudXNlZER1cGxpY2F0ZXMgPSBuZXcgQXJyYXkobGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBpbnNwZWN0Tm9kZSAob2JqZWN0LCBvYmplY3RzLCBkdXBsaWNhdGVzSW5kZXhlcykge1xuICBpZiAob2JqZWN0ICE9PSBudWxsICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnKSB7XG4gICAgY29uc3QgaW5kZXggPSBvYmplY3RzLmluZGV4T2Yob2JqZWN0KVxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIGlmIChkdXBsaWNhdGVzSW5kZXhlcy5pbmRleE9mKGluZGV4KSA9PT0gLTEpIHtcbiAgICAgICAgZHVwbGljYXRlc0luZGV4ZXMucHVzaChpbmRleClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgb2JqZWN0cy5wdXNoKG9iamVjdClcblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0KSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgaW5zcGVjdE5vZGUob2JqZWN0W2ldLCBvYmplY3RzLCBkdXBsaWNhdGVzSW5kZXhlcylcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgb2JqZWN0S2V5TGlzdCA9IE9iamVjdC5rZXlzKG9iamVjdClcblxuICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0gb2JqZWN0S2V5TGlzdC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgIGluc3BlY3ROb2RlKG9iamVjdFtvYmplY3RLZXlMaXN0W2ldXSwgb2JqZWN0cywgZHVwbGljYXRlc0luZGV4ZXMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZHVtcCAoaW5wdXQsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cblxuICBjb25zdCBzdGF0ZSA9IG5ldyBTdGF0ZShvcHRpb25zKVxuXG4gIGlmICghc3RhdGUubm9SZWZzKSBnZXREdXBsaWNhdGVSZWZlcmVuY2VzKGlucHV0LCBzdGF0ZSlcblxuICBsZXQgdmFsdWUgPSBpbnB1dFxuXG4gIGlmIChzdGF0ZS5yZXBsYWNlcikge1xuICAgIHZhbHVlID0gc3RhdGUucmVwbGFjZXIuY2FsbCh7ICcnOiB2YWx1ZSB9LCAnJywgdmFsdWUpXG4gIH1cblxuICBpZiAod3JpdGVOb2RlKHN0YXRlLCAwLCB2YWx1ZSwgdHJ1ZSwgdHJ1ZSkpIHJldHVybiBzdGF0ZS5kdW1wICsgJ1xcbidcblxuICByZXR1cm4gJydcbn1cblxubW9kdWxlLmV4cG9ydHMuZHVtcCA9IGR1bXBcbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgbG9hZGVyID0gcmVxdWlyZSgnLi9saWIvbG9hZGVyJylcbmNvbnN0IGR1bXBlciA9IHJlcXVpcmUoJy4vbGliL2R1bXBlcicpXG5cbmZ1bmN0aW9uIHJlbmFtZWQgKGZyb20sIHRvKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdGdW5jdGlvbiB5YW1sLicgKyBmcm9tICsgJyBpcyByZW1vdmVkIGluIGpzLXlhbWwgNC4gJyArXG4gICAgICAnVXNlIHlhbWwuJyArIHRvICsgJyBpbnN0ZWFkLCB3aGljaCBpcyBub3cgc2FmZSBieSBkZWZhdWx0LicpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMuVHlwZSA9IHJlcXVpcmUoJy4vbGliL3R5cGUnKVxubW9kdWxlLmV4cG9ydHMuU2NoZW1hID0gcmVxdWlyZSgnLi9saWIvc2NoZW1hJylcbm1vZHVsZS5leHBvcnRzLkZBSUxTQUZFX1NDSEVNQSA9IHJlcXVpcmUoJy4vbGliL3NjaGVtYS9mYWlsc2FmZScpXG5tb2R1bGUuZXhwb3J0cy5KU09OX1NDSEVNQSA9IHJlcXVpcmUoJy4vbGliL3NjaGVtYS9qc29uJylcbm1vZHVsZS5leHBvcnRzLkNPUkVfU0NIRU1BID0gcmVxdWlyZSgnLi9saWIvc2NoZW1hL2NvcmUnKVxubW9kdWxlLmV4cG9ydHMuREVGQVVMVF9TQ0hFTUEgPSByZXF1aXJlKCcuL2xpYi9zY2hlbWEvZGVmYXVsdCcpXG5tb2R1bGUuZXhwb3J0cy5sb2FkID0gbG9hZGVyLmxvYWRcbm1vZHVsZS5leHBvcnRzLmxvYWRBbGwgPSBsb2FkZXIubG9hZEFsbFxubW9kdWxlLmV4cG9ydHMuZHVtcCA9IGR1bXBlci5kdW1wXG5tb2R1bGUuZXhwb3J0cy5ZQU1MRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9saWIvZXhjZXB0aW9uJylcblxuLy8gUmUtZXhwb3J0IGFsbCB0eXBlcyBpbiBjYXNlIHVzZXIgd2FudHMgdG8gY3JlYXRlIGN1c3RvbSBzY2hlbWFcbm1vZHVsZS5leHBvcnRzLnR5cGVzID0ge1xuICBiaW5hcnk6IHJlcXVpcmUoJy4vbGliL3R5cGUvYmluYXJ5JyksXG4gIGZsb2F0OiByZXF1aXJlKCcuL2xpYi90eXBlL2Zsb2F0JyksXG4gIG1hcDogcmVxdWlyZSgnLi9saWIvdHlwZS9tYXAnKSxcbiAgbnVsbDogcmVxdWlyZSgnLi9saWIvdHlwZS9udWxsJyksXG4gIHBhaXJzOiByZXF1aXJlKCcuL2xpYi90eXBlL3BhaXJzJyksXG4gIHNldDogcmVxdWlyZSgnLi9saWIvdHlwZS9zZXQnKSxcbiAgdGltZXN0YW1wOiByZXF1aXJlKCcuL2xpYi90eXBlL3RpbWVzdGFtcCcpLFxuICBib29sOiByZXF1aXJlKCcuL2xpYi90eXBlL2Jvb2wnKSxcbiAgaW50OiByZXF1aXJlKCcuL2xpYi90eXBlL2ludCcpLFxuICBtZXJnZTogcmVxdWlyZSgnLi9saWIvdHlwZS9tZXJnZScpLFxuICBvbWFwOiByZXF1aXJlKCcuL2xpYi90eXBlL29tYXAnKSxcbiAgc2VxOiByZXF1aXJlKCcuL2xpYi90eXBlL3NlcScpLFxuICBzdHI6IHJlcXVpcmUoJy4vbGliL3R5cGUvc3RyJylcbn1cblxuLy8gUmVtb3ZlZCBmdW5jdGlvbnMgZnJvbSBKUy1ZQU1MIDMuMC54XG5tb2R1bGUuZXhwb3J0cy5zYWZlTG9hZCA9IHJlbmFtZWQoJ3NhZmVMb2FkJywgJ2xvYWQnKVxubW9kdWxlLmV4cG9ydHMuc2FmZUxvYWRBbGwgPSByZW5hbWVkKCdzYWZlTG9hZEFsbCcsICdsb2FkQWxsJylcbm1vZHVsZS5leHBvcnRzLnNhZmVEdW1wID0gcmVuYW1lZCgnc2FmZUR1bXAnLCAnZHVtcCcpXG4iLCAiaW1wb3J0IHlhbWwgZnJvbSAnLi4vaW5kZXguanMnXG5cbmNvbnN0IHtcbiAgVHlwZSxcbiAgU2NoZW1hLFxuICBGQUlMU0FGRV9TQ0hFTUEsXG4gIEpTT05fU0NIRU1BLFxuICBDT1JFX1NDSEVNQSxcbiAgREVGQVVMVF9TQ0hFTUEsXG4gIGxvYWQsXG4gIGxvYWRBbGwsXG4gIGR1bXAsXG4gIFlBTUxFeGNlcHRpb24sXG4gIHR5cGVzLFxuICBzYWZlTG9hZCxcbiAgc2FmZUxvYWRBbGwsXG4gIHNhZmVEdW1wXG59ID0geWFtbFxuXG5leHBvcnQge1xuICBUeXBlLFxuICBTY2hlbWEsXG4gIEZBSUxTQUZFX1NDSEVNQSxcbiAgSlNPTl9TQ0hFTUEsXG4gIENPUkVfU0NIRU1BLFxuICBERUZBVUxUX1NDSEVNQSxcbiAgbG9hZCxcbiAgbG9hZEFsbCxcbiAgZHVtcCxcbiAgWUFNTEV4Y2VwdGlvbixcbiAgdHlwZXMsXG4gIHNhZmVMb2FkLFxuICBzYWZlTG9hZEFsbCxcbiAgc2FmZUR1bXBcbn1cblxuZXhwb3J0IGRlZmF1bHQgeWFtbFxuIiwgIi8qKlxuICogWUFNTCBmcm9udG1hdHRlciBcdTg5RTNcdTY3OTAvXHU1RThGXHU1MjE3XHU1MzE2XHUzMDAyXHU0RjlEXHU2MzZFIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYFx1MzAwMlxuICpcbiAqIC0gXHU3NTI4IGpzLXlhbWwgXHU1OTA0XHU3NDA2XHU0RTJEXHU2NTg3XHU1QjU3XHU2QkI1XHU1NDBEXHVGRjA4anMteWFtbCBcdTUzOUZcdTc1MUZcdTY1MkZcdTYzMDEgVW5pY29kZSBrZXlcdUZGMDlcbiAqIC0gXHU4OUUzXHU2NzkwXHU2NUY2XHU0RkREXHU3NTU5XHU2Q0U4XHU5MUNBXHU5ODdBXHU1RThGXHVGRjA4anMteWFtbCBcdTRFMERcdTRGRERcdTc1NTlcdUZGMENcdTRGNDZcdTYyMTFcdTRFRUNcdTc1MjhcdTU2RkFcdTVCOUFcdTVCNTdcdTZCQjVcdTY2MjBcdTVDMDRcdTkxQ0RcdTVFRkFcdUZGMDlcbiAqIC0gXHU1RThGXHU1MjE3XHU1MzE2XHU2NUY2XHU2MzA5XHU4OUM0XHU4MzAzXHU5ODdBXHU1RThGXHU4RjkzXHU1MUZBXHVGRjA4XHU1NDBDXHU2QjY1XHU3RUQxXHU1QjlBXHUyMTkyXHU2ODA3XHU3QjdFXHUyMTkyXHU3RjE2XHU3ODAxXHUyMTkyXHU4RjkzXHU1MTY1XHUyMTkyXHU2NUU1XHU2NzFGXHUyMTkyXHU1MTczXHU5NTJFXHU4QkNEXHUyMTkyXHU4QkM0XHU1MjA2XHUyMTkyXHU3RDIyXHU1RjE1XHVGRjA5XG4gKi9cbmltcG9ydCAqIGFzIFlBTUwgZnJvbSAnanMteWFtbCc7XG5cbi8qKiBmcm9udG1hdHRlciBcdTUyMDZcdTk2OTRcdTdCMjZcdTMwMDIgKi9cbmNvbnN0IEZNX0RFTElNSVRFUiA9ICctLS0nO1xuXG4vKiogZnJvbnRtYXR0ZXIgXHU4RjkzXHU1MUZBXHU2NUY2XHU3Njg0XHU1QjU3XHU2QkI1XHU5ODdBXHU1RThGXHUzMDAyXHU0RjlEXHU2MzZFIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTRFMDBcdTZBMjFcdTY3N0ZcdTMwMDIgKi9cbmNvbnN0IEZJRUxEX09SREVSOiAoa2V5b2YgaW1wb3J0KCcuL3R5cGVzJykuWUFNTEZyb250bWF0dGVyKVtdID0gW1xuICAnZmVpc2h1X2lkJyxcbiAgJ2ZlaXNodV9kb2NfaWQnLFxuICAnZmVpc2h1X3RpdGxlJyxcbiAgJ3N5bmNfaGFzaCcsXG4gICdzeW5jX3RpbWUnLFxuICAnXHU2ODA3XHU3QjdFJyxcbiAgJ1x1N0YxNlx1NzgwMScsXG4gICdcdThGOTNcdTUxNjUnLFxuICAnXHU2NUU1XHU2NzFGJyxcbiAgJ1x1NjVFNVx1NjcxRlx1N0QyMlx1NUYxNScsXG4gICdcdTUxNzNcdTk1MkVcdThCQ0QnLFxuICAnXHU2OTgyXHU4RkYwJyxcbiAgJ1x1OEJDNFx1NTIwNicsXG4gICdcdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBJyxcbiAgJ1x1N0QyMlx1NUYxNV9cdTc3RTVcdThCQzZcdTVFOTMnLFxuICAnXHU3RDIyXHU1RjE1X1x1OTg5Q1x1ODI3MicsXG4gICdcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OCcsXG4gICdcdTdEMjJcdTVGMTVfXHU1NzU3JyxcbiAgJ1x1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2NjknLFxuXTtcblxuLyoqIFx1N0E3QVx1NTAzQ1x1OERGM1x1OEZDN1x1OTZDNlx1NTQwOFx1RkYxQVx1NEVDNVx1OERGM1x1OEZDN1x1NjcyQVx1OEJCRVx1N0Y2RVx1RkYxQlx1N0E3QVx1NUI1N1x1N0IyNlx1NEUzMi9cdTdBN0FcdTY1NzBcdTdFQzRcdTc1MjhcdTRFOEVcdTg5QzRcdTgzMDNcdTVCNTdcdTZCQjVcdTUzNjBcdTRGNERcdTMwMDIgKi9cbmZ1bmN0aW9uIGlzRW1wdHkodjogdW5rbm93bik6IGJvb2xlYW4ge1xuICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IG51bGwpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogXHU1QzA2IGZyb250bWF0dGVyIFx1NUJGOVx1OEM2MVx1NUU4Rlx1NTIxN1x1NTMxNlx1NEUzQSBZQU1MIFx1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOFx1NTQyQiBgLS0tYCBcdTUyMDZcdTk2OTRcdTdCMjZcdUZGMDlcdTMwMDJcbiAqIFx1NjMwOVx1ODlDNFx1ODMwM1x1OTg3QVx1NUU4Rlx1OEY5M1x1NTFGQVx1RkYwQ1x1OERGM1x1OEZDN1x1N0E3QVx1NTAzQ1x1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplRnJvbnRtYXR0ZXIoZm06IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogc3RyaW5nIHtcbiAgY29uc3Qgb3JkZXJlZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcbiAgZm9yIChjb25zdCBrZXkgb2YgRklFTERfT1JERVIpIHtcbiAgICBpZiAoIWlzRW1wdHkoZm1ba2V5XSkpIHtcbiAgICAgIG9yZGVyZWRba2V5IGFzIHN0cmluZ10gPSBmbVtrZXldO1xuICAgIH1cbiAgfVxuICAvLyBcdTY1MzZcdTVDM0VcdUZGMUFcdTUzRUZcdTgwRkRcdTY3MDlcdTU5MUFcdTRGNTlcdTVCNTdcdTZCQjVcdTRFMERcdTU3MjggRklFTERfT1JERVIgXHU5MUNDXHVGRjA4XHU1NDExXHU1NDBFXHU1MTdDXHU1QkI5XHVGRjA5XG4gIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKGZtKSkge1xuICAgIGlmICghKGsgaW4gb3JkZXJlZCkgJiYgIWlzRW1wdHkodikpIHtcbiAgICAgIG9yZGVyZWRba10gPSB2O1xuICAgIH1cbiAgfVxuICBjb25zdCB5YW1sU3RyID0gWUFNTC5kdW1wKG9yZGVyZWQsIHtcbiAgICBsaW5lV2lkdGg6IC0xLCAgICAgICAgICAgLy8gXHU0RTBEXHU2Mjk4XHU4ODRDXHVGRjA4XHU4ODY4XHU2ODNDXHU3QjQ5XHU5NTdGXHU4ODRDXHU0RTBEXHU3ODM0XHU1NzRGXHVGRjA5XG4gICAgcXVvdGluZ1R5cGU6ICdcIicsICAgICAgICAvLyBcdTVCNTdcdTdCMjZcdTRFMzJcdTc1MjhcdTUzQ0NcdTVGMTVcdTUzRjdcdUZGMDhcdTRGRERcdTc1NTkgZW1vamlcdUZGMDlcbiAgICBmb3JjZVF1b3RlczogZmFsc2UsXG4gICAgc29ydEtleXM6IGZhbHNlLCAgICAgICAgIC8vIFx1NjIxMVx1NEVFQ1x1ODFFQVx1NURGMVx1NjNBN1x1NTIzNlx1OTg3QVx1NUU4RlxuICB9KSBhcyBzdHJpbmc7XG4gIHJldHVybiBgJHtGTV9ERUxJTUlURVJ9XFxuJHt5YW1sU3RyfSR7Rk1fREVMSU1JVEVSfWA7XG59XG5cbi8qKlxuICogXHU0RUNFIG1kIFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVx1ODlFM1x1Njc5MCBmcm9udG1hdHRlclx1MzAwMlxuICogQHBhcmFtIGNvbnRlbnQgXHU1QjhDXHU2NTc0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XG4gKiBAcmV0dXJucyB7IGZyb250bWF0dGVyLCBib2R5IH1cdUZGMENmcm9udG1hdHRlciBcdTRFM0EgbnVsbCBcdTg4NjhcdTc5M0FcdTY1RTAgZnJvbnRtYXR0ZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRnJvbnRtYXR0ZXIoY29udGVudDogc3RyaW5nKToge1xuICBmcm9udG1hdHRlcjogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsO1xuICBib2R5OiBzdHJpbmc7XG59IHtcbiAgY29uc3Qgb2Zmc2V0ID0gY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweGZlZmYgPyAxIDogMDtcbiAgaWYgKCFjb250ZW50LnN0YXJ0c1dpdGgoRk1fREVMSU1JVEVSLCBvZmZzZXQpKSB7XG4gICAgcmV0dXJuIHsgZnJvbnRtYXR0ZXI6IG51bGwsIGJvZHk6IGNvbnRlbnQgfTtcbiAgfVxuXG4gIGNvbnN0IHJlc3QgPSBjb250ZW50LnNsaWNlKG9mZnNldCArIEZNX0RFTElNSVRFUi5sZW5ndGgpO1xuICBjb25zdCBtYXRjaCA9IHJlc3QubWF0Y2goL15cXHI/XFxuKFtcXHNcXFNdKj8pXFxyP1xcbi0tLVsgXFx0XSooPzpcXHI/XFxufCQpLyk7XG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm4geyBmcm9udG1hdHRlcjogbnVsbCwgYm9keTogY29udGVudCB9O1xuICB9XG5cbiAgY29uc3QgeWFtbEJsb2NrID0gbWF0Y2hbMV07XG4gIGNvbnN0IGJvZHlTdGFydCA9IG9mZnNldCArIEZNX0RFTElNSVRFUi5sZW5ndGggKyBtYXRjaFswXS5sZW5ndGg7XG4gIGNvbnN0IGJvZHkgPSBjb250ZW50LnNsaWNlKGJvZHlTdGFydCkucmVwbGFjZSgvXig/Olxccj9cXG4pKy8sICcnKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBmbSA9IFlBTUwubG9hZCh5YW1sQmxvY2spIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIHJldHVybiB7IGZyb250bWF0dGVyOiBmbSA/PyB7fSwgYm9keSB9O1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gWUFNTCBcdTg5RTNcdTY3OTBcdTU5MzFcdThEMjVcdUZGMUFcdTg5QzZcdTRFM0FcdTY1RTAgZnJvbnRtYXR0ZXJcbiAgICBjb25zb2xlLndhcm4oJ1tzeW5jL3NoYXJlZF0gZnJvbnRtYXR0ZXIgcGFyc2UgZmFpbGVkOicsIGUpO1xuICAgIHJldHVybiB7IGZyb250bWF0dGVyOiBudWxsLCBib2R5OiBjb250ZW50IH07XG4gIH1cbn1cblxuLyoqXG4gKiBcdTVDMDYgZnJvbnRtYXR0ZXIgKyBib2R5IFx1NjJGQ1x1NjIxMFx1NUI4Q1x1NjU3NFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZW1ibGVGaWxlKFxuICBmbTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4gIGJvZHk6IHN0cmluZyxcbik6IHN0cmluZyB7XG4gIHJldHVybiBgJHtzZXJpYWxpemVGcm9udG1hdHRlcihmbSl9XFxuXFxuJHtib2R5fWA7XG59XG4iLCAiLyoqXG4gKiBZQU1MIFx1MjE5NCBcdTk4REVcdTRFNjYgY2FsbG91dCBcdTUzQ0NcdTU0MTFcdThGNkNcdTYzNjJcdTMwMDJcbiAqXG4gKiBcdTRGOURcdTYzNkVcdUZGMUFcbiAqIC0gYDAzX1x1OThERVx1NEU2Nlx1NjU4N1x1Njg2M1x1NjgzQ1x1NUYwRlx1ODlDNFx1ODMwM1x1NEUwRU9CXHU2NjIwXHU1QzA0Lm1kYCBcdTAwQTdcdTRFMDlcdUZGMDhjYWxsb3V0IFx1OTg5Q1x1ODI3Mlx1NjYyMFx1NUMwNFx1RkYwOVxuICogLSBgMDJfWUFNTFx1NUI1N1x1NkJCNVx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU0RTk0XHVGRjA4WUFNTFx1MjE5MmNhbGxvdXQgXHU2NjIwXHU1QzA0XHU4ODY4XHVGRjA5XG4gKiAtIFx1MDBBN1x1NTZEQlx1RkYwOFx1NTQwOFx1NUU3Nlx1NEZFMVx1NjA2Rlx1NTc1N1x1OEJCRVx1OEJBMVx1RkYxQVx1NjI0MFx1NjcwOVx1NUI1N1x1NkJCNVx1OEZEQlx1NEUwMFx1NEUyQSBjYWxsb3V0XHVGRjA5XG4gKlxuICogXHU1REYyXHU3N0U1XHU1NzUxXHVGRjA4MDMgXHU2NTg3XHU2ODYzIFx1MDBBN1x1NTM0MSArIFx1MDBBNzMuM1x1RkYwOVx1RkYxQVxuICogLSBlbW9qaSBcdTVFMjYgVStGRTBGIHZhcmlhdGlvbiBzZWxlY3RvciBcdTk4REVcdTRFNjZcdTRFMERcdThCQTQgXHUyMTkyIFx1NTE5OVx1NTE2NVx1NTI0RCBzdHJpcFxuICogLSBgfmAgXHU4OEFCXHU5OERFXHU0RTY2XHU4RjZDXHU0RTQ5XHU2MjEwIGBcXH5gIFx1MjE5MiBcdTU2REVcdThCRkJcdTY1RjZcdTUzQ0RcdThGNkNcdTRFNDlcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IEtub3dsZWRnZU1ldGEsIFRhZyB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHtcbiAgQ0FMTE9VVF9GSUVMRF9NQVAsXG4gIFRBR19OQU1FUyxcbiAgRE9DX0lORk9fQ0FMTE9VVCxcbiAgT0JfQ0FMTE9VVF9UT19GRUlTSFUsXG4gIEZFSVNIVV9CR19UT19PQl9DQUxMT1VULFxufSBmcm9tICcuL3R5cGVzLmpzJztcblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIGVtb2ppIFx1NkUwNVx1NkQxNyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqIFx1NzlGQlx1OTY2NCBlbW9qaSBcdTc2ODQgVStGRTBGIHZhcmlhdGlvbiBzZWxlY3Rvclx1MzAwMlx1OThERVx1NEU2Nlx1NEUwRFx1OEJBNFx1NUUyNiBWUyBcdTc2ODQgZW1vamlcdUZGMDgwMyBcdTY1ODdcdTY4NjMgXHUwMEE3My4zXHVGRjA5XHUzMDAyICovXG5jb25zdCBWU19SRSA9IC9cXHVGRTBGL2d1O1xuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMoczogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHMucmVwbGFjZShWU19SRSwgJycpO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU2Q0UyXHU2RDZBXHU1M0Y3XHU4RjZDXHU0RTQ5IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKiogXHU5OERFXHU0RTY2IG1kIFx1NjI4QSBgfmAgXHU4RjZDXHU0RTQ5XHU2MjEwIGBcXH5gXHVGRjBDXHU1NkRFXHU4QkZCXHU2NUY2XHU1M0NEXHU1NDExXHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gdW5lc2NhcGVGZWlzaHVUaWxkZShzOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcy5yZXBsYWNlKC9cXFxcfi9nLCAnficpO1xufVxuXG4vKiogXHU1MTk5XHU1MTY1XHU5OERFXHU0RTY2XHU1MjREXHU1M0NEXHU4RjZDXHU0RTQ5XHVGRjA4XHU1OTgyXHU2NzlDXHU3NTI4XHU2MjM3XHU2MEYzXHU3NTI4IGB+YCBcdTUyMjBcdTk2NjRcdTdFQkZcdUZGMDlcdTMwMDJcdTk4REVcdTRFNjYgbWQgXHU5MUNDIGB+fn50ZXh0fn5+YCBcdTY2MkZcdTUyMjBcdTk2NjRcdTdFQkZcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVGZWlzaHVUaWxkZShzOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBcdTRFMERcdTRFM0JcdTUyQThcdThGNkNcdTRFNDlcdUZGMENcdTRGRERcdTYzMDFcdTUzOUZcdTY4MzdcdTMwMDJcdTRFQzVcdTU3Mjggb3ZlcndyaXRlIFx1NTczQVx1NjY2Rlx1Nzg2RVx1OEJBNFx1OTcwMFx1ODk4MVx1NjVGNlx1NjI0Qlx1NTJBOFx1NTkwNFx1NzQwNlx1MzAwMlxuICByZXR1cm4gcztcbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIFx1NjgwN1x1N0I3RVx1NTAzQ1x1NjgzQ1x1NUYwRlx1NTMxNiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuZnVuY3Rpb24gZm9ybWF0VGFnVmFsdWUodGFnOiBUYWcgfCB1bmRlZmluZWQpOiBzdHJpbmcge1xuICBpZiAoIXRhZykgcmV0dXJuICcnO1xuICByZXR1cm4gYCR7VEFHX05BTUVTW3RhZ119ICR7dGFnfWA7XG59XG5cbmZ1bmN0aW9uIHBhcnNlVGFnVmFsdWUodmFsdWU6IHN0cmluZyk6IFRhZyB8IG51bGwge1xuICBjb25zdCBub3JtYWxpemVkID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnModmFsdWUpLnRyaW0oKTtcbiAgY29uc3QgZGlyZWN0ID0gbm9ybWFsaXplZC5tYXRjaCgvKD86XnxcXHMpKFtTWExaUUpdKSg/Olxcc3wkKS8pO1xuICBjb25zdCBjb21wYWN0ID0gbm9ybWFsaXplZC5tYXRjaCgvW1NYTFpRSl0vKTtcbiAgY29uc3QgdGFnID0gKGRpcmVjdD8uWzFdID8/IGNvbXBhY3Q/LlswXSkgYXMgVGFnIHwgdW5kZWZpbmVkO1xuICByZXR1cm4gdGFnICYmIFsnUycsICdYJywgJ0wnLCAnWicsICdRJywgJ0onXS5pbmNsdWRlcyh0YWcpID8gdGFnIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gbWFwRmVpc2h1QmdUb09iVHlwZShiZ0NvbG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIWJnQ29sb3IpIHJldHVybiAndGlwJztcbiAgaWYgKEZFSVNIVV9CR19UT19PQl9DQUxMT1VUW2JnQ29sb3JdKSByZXR1cm4gRkVJU0hVX0JHX1RPX09CX0NBTExPVVRbYmdDb2xvcl07XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBiZ0NvbG9yLnJlcGxhY2UoL1xccysvZywgJycpLnRvTG93ZXJDYXNlKCk7XG4gIGNvbnN0IHJnYk1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAncmdiKDI1NSwyNDUsMjM1KSc6ICd0aXAnLFxuICAgICdyZ2IoMjU0LDIxMiwxNjQpJzogJ3RpcCcsXG4gICAgJ3JnYmEoMjU1LDI0NiwxMjIsMC44KSc6ICd0aXAnLFxuICAgICdyZ2IoMjU1LDI0MCwyNDApJzogJ3dhcm5pbmcnLFxuICAgICdyZ2IoMjQyLDI0MywyNDUpJzogJ3F1b3RlJyxcbiAgICAncmdiKDI0MCwyNDQsMjU1KSc6ICdpbmZvJyxcbiAgICAncmdiKDI0MCwyNTMsMjQ0KSc6ICdzdWNjZXNzJyxcbiAgfTtcbiAgcmV0dXJuIHJnYk1hcFtub3JtYWxpemVkXSA/PyAnYWJzdHJhY3QnO1xufVxuXG5mdW5jdGlvbiBodG1sQmxvY2tUb1RleHRMaW5lcyhodG1sOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBibG9ja1JlID0gLzwoPzpwfGxpKVxcYltePl0qPihbXFxzXFxTXSo/KTxcXC8oPzpwfGxpKT4vZztcbiAgbGV0IG06IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG4gIHdoaWxlICgobSA9IGJsb2NrUmUuZXhlYyhodG1sKSkgIT09IG51bGwpIHtcbiAgICBjb25zdCB0ZXh0ID0gaHRtbFRvUGxhaW5UZXh0KG1bMV0pO1xuICAgIGlmICh0ZXh0KSBsaW5lcy5wdXNoKC4uLnRleHQuc3BsaXQoJ1xcbicpLm1hcChsaW5lID0+IGxpbmUudHJpbSgpKS5maWx0ZXIoQm9vbGVhbikpO1xuICB9XG4gIGlmIChsaW5lcy5sZW5ndGggPiAwKSByZXR1cm4gbGluZXM7XG4gIGNvbnN0IGZhbGxiYWNrID0gaHRtbFRvUGxhaW5UZXh0KGh0bWwpO1xuICByZXR1cm4gZmFsbGJhY2sgPyBmYWxsYmFjay5zcGxpdCgnXFxuJykubWFwKGxpbmUgPT4gbGluZS50cmltKCkpLmZpbHRlcihCb29sZWFuKSA6IFtdO1xufVxuXG5mdW5jdGlvbiBodG1sVG9QbGFpblRleHQoaHRtbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGh0bWxcbiAgICAucmVwbGFjZSgvPGJyXFxzKlxcLz8+L2csICdcXG4nKVxuICAgIC5yZXBsYWNlKC88W14+XSs+L2csICcnKVxuICAgIC5yZXBsYWNlKC8mbHQ7L2csICc8JylcbiAgICAucmVwbGFjZSgvJmd0Oy9nLCAnPicpXG4gICAgLnJlcGxhY2UoLyZhbXA7L2csICcmJylcbiAgICAucmVwbGFjZSgvJnF1b3Q7L2csICdcIicpXG4gICAgLnJlcGxhY2UoLyZhcG9zOy9nLCBcIidcIilcbiAgICAudHJpbSgpO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgT0JcdTIxOTJcdTk4REVcdTRFNjZcdUZGMUFZQU1MXHUyMTkyXHU1NDA4XHU1RTc2XHU0RkUxXHU2MDZGIGNhbGxvdXQgWE1MIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKipcbiAqIFx1NUMwNiBPQiBcdTc2ODQgWUFNTCBcdTUxNDNcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVcdTZFMzJcdTY3RDNcdTRFM0FcdTk4REVcdTRFNjZcdTU0MDhcdTVFNzZcdTRGRTFcdTYwNkYgY2FsbG91dCBYTUxcdTMwMDJcbiAqIFx1NEY5RFx1NjM2RSBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTU2REJcdUZGMDhcdTU0MDhcdTVFNzZcdThGREJcdTRFMDBcdTRFMkEgY2FsbG91dCBcdTlBRDhcdTRFQUVcdTU3NTdcdUZGMDlcdTMwMDJcbiAqXG4gKiBAcGFyYW0gbWV0YSBcdTc3RTVcdThCQzZcdTVFOTNcdTUxNDNcdTY1NzBcdTYzNkVcbiAqIEByZXR1cm5zIGNhbGxvdXQgWE1MIFx1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOFx1NTQyQiBzdHJpcCBWU1x1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gbWV0YVRvQ2FsbG91dFhtbChtZXRhOiBLbm93bGVkZ2VNZXRhKTogc3RyaW5nIHtcbiAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW107XG5cbiAgZm9yIChjb25zdCBpdGVtIG9mIENBTExPVVRfRklFTERfTUFQKSB7XG4gICAgY29uc3QgcmF3ID0gbWV0YVtpdGVtLmZpZWxkXTtcbiAgICBpZiAocmF3ID09PSB1bmRlZmluZWQgfHwgcmF3ID09PSBudWxsIHx8IHJhdyA9PT0gJycgfHwgKEFycmF5LmlzQXJyYXkocmF3KSAmJiByYXcubGVuZ3RoID09PSAwKSkgY29udGludWU7XG5cbiAgICBsZXQgdmFsdWU6IHN0cmluZztcbiAgICBpZiAoaXRlbS5maWVsZCA9PT0gJ1x1NjgwN1x1N0I3RScpIHtcbiAgICAgIHZhbHVlID0gZm9ybWF0VGFnVmFsdWUocmF3IGFzIFRhZyB8IHVuZGVmaW5lZCk7XG4gICAgfSBlbHNlIGlmIChpdGVtLmZpZWxkID09PSAnXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQScpIHtcbiAgICAgIHZhbHVlID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMoU3RyaW5nKHJhdykpO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyYXcpKSB7XG4gICAgICB2YWx1ZSA9IChyYXcgYXMgc3RyaW5nW10pLmpvaW4oJyBcdTAwQjcgJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMoU3RyaW5nKHJhdykpO1xuICAgIH1cbiAgICBpZiAoIXZhbHVlKSBjb250aW51ZTtcblxuICAgIGxpbmVzLnB1c2goYDxsaT48Yj4ke2l0ZW0ubGFiZWx9PC9iPlx1RkYxQSR7dmFsdWV9PC9saT5gKTtcbiAgfVxuXG4gIGlmIChsaW5lcy5sZW5ndGggPT09IDApIHJldHVybiAnJztcblxuICBjb25zdCB7IGVtb2ppLCAuLi5hdHRycyB9ID0gRE9DX0lORk9fQ0FMTE9VVDtcbiAgY29uc3QgYXR0clN0ciA9IE9iamVjdC5lbnRyaWVzKGF0dHJzKVxuICAgIC5tYXAoKFtrLCB2XSkgPT4gYCR7a309XCIke3Z9XCJgKVxuICAgIC5qb2luKCcgJyk7XG4gIGNvbnN0IGNsZWFuRW1vamkgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhlbW9qaSk7XG5cbiAgcmV0dXJuIFtcbiAgICBgPGNhbGxvdXQgZW1vamk9XCIke2NsZWFuRW1vaml9XCIgJHthdHRyU3RyfT5gLFxuICAgIGA8cD48Yj5cdTY1ODdcdTY4NjNcdTRGRTFcdTYwNkY8L2I+PC9wPmAsXG4gICAgYDx1bD5gLFxuICAgIC4uLmxpbmVzLFxuICAgIGA8L3VsPmAsXG4gICAgYDwvY2FsbG91dD5gLFxuICAgICcnLFxuICBdLmpvaW4oJ1xcbicpO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU5OERFXHU0RTY2XHUyMTkyT0JcdUZGMUFcdTg5RTNcdTY3OTBcdTU0MDhcdTVFNzZcdTRGRTFcdTYwNkYgY2FsbG91dCBcdTIxOTIgWUFNTCBcdTVCNTdcdTZCQjUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKlxuICogXHU0RUNFXHU5OERFXHU0RTY2IFhNTCBcdTc2ODRcdTU5MzRcdTkwRThcdTRGRTFcdTYwNkYgY2FsbG91dCBcdTRFMkRcdTg5RTNcdTY3OTBcdTUxRkEgWUFNTCBcdTVCNTdcdTZCQjVcdTUwM0NcdTMwMDJcbiAqIFx1NEY5RFx1NjM2RSBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTdcdTU2REJcdUZGMUFgPGxpPjxiPlx1NUI1N1x1NkJCNVx1NTQwRDwvYj5cdUZGMUFcdTUwM0M8L2xpPmAgXHU2ODNDXHU1RjBGXHUzMDAyXG4gKlxuICogQHBhcmFtIHhtbCBcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjMgWE1MIFx1NzI0N1x1NkJCNVxuICogQHJldHVybnMgXHU4OUUzXHU2NzkwXHU1MjMwXHU3Njg0XHU1MTQzXHU2NTcwXHU2MzZFXHU1QjU3XHU2QkI1XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxsb3V0WG1sVG9NZXRhKHhtbDogc3RyaW5nKTogUGFydGlhbDxLbm93bGVkZ2VNZXRhPiB7XG4gIGNvbnN0IHJlc3VsdDogUGFydGlhbDxLbm93bGVkZ2VNZXRhPiA9IHt9O1xuXG4gIC8vIFx1NjI3RVwiXHU2NTg3XHU2ODYzXHU0RkUxXHU2MDZGXCJjYWxsb3V0XG4gIGNvbnN0IGNhbGxvdXRSZSA9IC88Y2FsbG91dFxcYltePl0qPlxccyo8cD48Yj5cdTY1ODdcdTY4NjNcdTRGRTFcdTYwNkY8XFwvYj48XFwvcD5cXHMqPHVsPihbXFxzXFxTXSo/KTxcXC91bD5cXHMqPFxcL2NhbGxvdXQ+LztcbiAgY29uc3QgY2FsbG91dE1hdGNoID0geG1sLm1hdGNoKGNhbGxvdXRSZSk7XG4gIGlmICghY2FsbG91dE1hdGNoKSByZXR1cm4gcmVzdWx0O1xuXG4gIGNvbnN0IHVsQ29udGVudCA9IGNhbGxvdXRNYXRjaFsxXTtcbiAgY29uc3QgbGlSZSA9IC88bGk+PGI+KFtePF0rKTxcXC9iPltcdUZGMUE6XSguKz8pPFxcL2xpPi9nO1xuICBsZXQgbTogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcblxuICB3aGlsZSAoKG0gPSBsaVJlLmV4ZWModWxDb250ZW50KSkgIT09IG51bGwpIHtcbiAgICBjb25zdCBsYWJlbCA9IG1bMV0udHJpbSgpO1xuICAgIGNvbnN0IHZhbHVlID0gdW5lc2NhcGVGZWlzaHVUaWxkZShtWzJdLnRyaW0oKSk7XG5cbiAgICAvLyBcdTY4MzlcdTYzNkVcdTY4MDdcdTdCN0VcdTU0MERcdTY2MjBcdTVDMDRcdTUyMzBcdTVCNTdcdTZCQjVcbiAgICBpZiAobGFiZWwgPT09ICdcdTY4MDdcdTdCN0UnKSB7XG4gICAgICBjb25zdCB0YWcgPSBwYXJzZVRhZ1ZhbHVlKHZhbHVlKTtcbiAgICAgIGlmICh0YWcpIHJlc3VsdC5cdTY4MDdcdTdCN0UgPSB0YWc7XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1N0YxNlx1NzgwMScpIHtcbiAgICAgIHJlc3VsdC5cdTdGMTZcdTc4MDEgPSB2YWx1ZS5yZXBsYWNlKC9eXHVEODNEXHVERDIyXFxzKi8sICcnKS50cmltKCk7XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1OEY5M1x1NTE2NScpIHtcbiAgICAgIHJlc3VsdC5cdThGOTNcdTUxNjUgPSB2YWx1ZS5yZXBsYWNlKC9eXHVEODNEXHVEQ0U1XFxzKi8sICcnKS50cmltKCk7XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1NjVFNVx1NjcxRicpIHtcbiAgICAgIHJlc3VsdC5cdTY1RTVcdTY3MUYgPSB2YWx1ZS5yZXBsYWNlKC9eXHVEODNEXHVEQ0M1XFxzKi8sICcnKS50cmltKCk7XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1NTE3M1x1OTUyRVx1OEJDRCcpIHtcbiAgICAgIHJlc3VsdC5cdTUxNzNcdTk1MkVcdThCQ0QgPSB2YWx1ZS5yZXBsYWNlKC9eXHVEODNEXHVERDExXFxzKi8sICcnKS50cmltKCk7XG4gICAgfSBlbHNlIGlmIChsYWJlbCA9PT0gJ1x1OEJDNFx1NTIwNicpIHtcbiAgICAgIC8vIFx1NjNEMFx1NTNENlx1OEJDNFx1NTIwNlx1NjYzRVx1NzkzQVx1NEUzMlx1RkYwOFx1NTk4MiBcIlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RkY1Q1x1NUI5RVx1OERGNVwiXHVGRjA5XG4gICAgICByZXN1bHQuXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQSA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKHZhbHVlKTtcbiAgICAgIC8vIFx1NUMxRFx1OEJENVx1NjNEMFx1NTNENlx1NjU3MFx1NUI1N1xuICAgICAgY29uc3Qgc3RhckNvdW50ID0gKHZhbHVlLm1hdGNoKC9cdUQ4M0NcdURGMUYvZykgfHwgW10pLmxlbmd0aDtcbiAgICAgIGlmIChzdGFyQ291bnQgPj0gMSAmJiBzdGFyQ291bnQgPD0gNSkge1xuICAgICAgICByZXN1bHQuXHU4QkM0XHU1MjA2ID0gc3RhckNvdW50O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobGFiZWwgPT09ICdcdTdEMjJcdTVGMTUnKSB7XG4gICAgICAvLyBcdTdEMjJcdTVGMTVcdTY2MkZcdTU5MUFcdTdFRjRcdTVFQTZcdTU0MDhcdTVFNzZcdTY2M0VcdTc5M0FcdUZGMDhcdUQ4M0RcdURDQjBcdTZCNjNcdThEMjIgXHUwMEI3IFx1RDgzRFx1REQzNVx1NURFNVx1NEY1QyBcdTAwQjcgLi4uXHVGRjA5XG4gICAgICAvLyBcdTk3MDBcdTg5ODFcdThGREJcdTRFMDBcdTZCNjVcdTYyQzZcdTUyMDZcdTU0MDRcdTdFRjRcdTVFQTZcbiAgICAgIHBhcnNlSW5kZXhGaWVsZCh2YWx1ZSwgcmVzdWx0KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFx1ODlFM1x1Njc5MFx1N0QyMlx1NUYxNVx1NTQwOFx1NUU3Nlx1NUI1N1x1NkJCNSBcIlx1RDgzRFx1RENCMFx1NkI2M1x1OEQyMiBcdTAwQjcgXHVEODNEXHVERDM1XHU1REU1XHU0RjVDIFx1MDBCNyBcdTI3MDVcdTVCOENcdTYyMTAgXHUwMEI3IFx1RDgzQ1x1REZBRlx1NTE3N1x1OEM2MSBcdTAwQjcgXHUyNzA1XHU3QjgwXHU1MzU1IFx1MDBCNyBcdTI3NjRcdUZFMEZcdTUwNjVcdTVFQjdcIlxuICogXHU1NkRFXHU1NDA0XHU3RDIyXHU1RjE1XHU1QjUwXHU1QjU3XHU2QkI1XHUzMDAyXG4gKi9cbmZ1bmN0aW9uIHBhcnNlSW5kZXhGaWVsZCh2YWx1ZTogc3RyaW5nLCByZXN1bHQ6IFBhcnRpYWw8S25vd2xlZGdlTWV0YT4pOiB2b2lkIHtcbiAgY29uc3QgcGFydHMgPSB2YWx1ZS5zcGxpdCgvW1x1MDBCN1xcbl0vKS5tYXAocyA9PiBzLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pO1xuICBmb3IgKGNvbnN0IHBhcnQgb2YgcGFydHMpIHtcbiAgICBjb25zdCBjbGVhbmVkID0gc3RyaXBWYXJpYXRpb25TZWxlY3RvcnMocGFydCk7XG4gICAgLy8gXHU3N0U1XHU4QkM2XHU1RTkzXHU3RUY0XHU1RUE2XG4gICAgZm9yIChjb25zdCBrdyBvZiBbJ1x1NkI2M1x1OEQyMicsICdcdTUwNEZcdThEMjInLCAnXHU2QjYzXHU1MzcwJywgJ1x1NTA0Rlx1NTM3MCcsICdcdTZCNjNcdTVCQUInLCAnXHU0RjI0XHU1Qjk4J10pIHtcbiAgICAgIGlmIChjbGVhbmVkLmluY2x1ZGVzKGt3KSkgeyByZXN1bHQuXHU3RDIyXHU1RjE1X1x1NzdFNVx1OEJDNlx1NUU5MyA9IGt3OyBicmVhazsgfVxuICAgIH1cbiAgICAvLyBcdTk4OUNcdTgyNzJcdTdFRjRcdTVFQTZcbiAgICBmb3IgKGNvbnN0IGt3IG9mIFsnXHU3NzYxXHU3NzIwJywgJ1x1NURFNVx1NEY1QycsICdcdTc1MUZcdTZEM0InLCAnXHU1QTMxXHU0RTUwJywgJ1x1NzkzRVx1NEVBNCcsICdcdTVCNjZcdTRFNjAnLCAnXHU4RkQwXHU1MkE4J10pIHtcbiAgICAgIGlmIChjbGVhbmVkLmluY2x1ZGVzKGt3KSkgeyByZXN1bHQuXHU3RDIyXHU1RjE1X1x1OTg5Q1x1ODI3MiA9IGNsZWFuZWQ7IGJyZWFrOyB9XG4gICAgfVxuICAgIC8vIFx1NjRDRFx1NEY1Q1x1N0VGNFx1NUVBNlxuICAgIGZvciAoY29uc3Qga3cgb2YgWydcdTYwRjNcdTZDRDUnLCAnXHU4OUM0XHU1MjEyJywgJ1x1NjI2N1x1ODg0QycsICdcdTUzRDdcdTYzMkInLCAnXHU1MTRCXHU2NzBEJywgJ1x1NTIxRFx1N0EzRicsICdcdTVCQTFcdTY4MzgnLCAnXHU0RkVFXHU2NTM5JywgJ1x1NUI4Q1x1NjIxMCcsICdcdTU5MERcdTc2RDgnXSkge1xuICAgICAgaWYgKGNsZWFuZWQuaW5jbHVkZXMoa3cpKSB7XG4gICAgICAgIHJlc3VsdFsnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnXSA9IHJlc3VsdFsnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnXSA/PyBbXTtcbiAgICAgICAgaWYgKCFyZXN1bHRbJ1x1N0QyMlx1NUYxNV9cdTY0Q0RcdTRGNUMmXHU1M0NEXHU5OTg4J10uaW5jbHVkZXMoa3cpKSByZXN1bHRbJ1x1N0QyMlx1NUYxNV9cdTY0Q0RcdTRGNUMmXHU1M0NEXHU5OTg4J10ucHVzaChrdyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBcdTU3NTdcdTdFRjRcdTVFQTZcdUZGMDhcdTU5MUFcdTkwMDlcdUZGMDlcbiAgICBmb3IgKGNvbnN0IGt3IG9mIFsnXHU2MkJEXHU4QzYxJywgJ1x1NTE3N1x1OEM2MScsICdcdTdCODBcdTUzNTUnLCAnXHU1NkYwXHU5NkJFJ10pIHtcbiAgICAgIGlmIChjbGVhbmVkLmluY2x1ZGVzKGt3KSAmJiBrdyAhPT0gY2xlYW5lZCkge1xuICAgICAgICByZXN1bHQuXHU3RDIyXHU1RjE1X1x1NTc1NyA9IHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU1NzU3ID8/IFtdO1xuICAgICAgICBpZiAoIXJlc3VsdC5cdTdEMjJcdTVGMTVfXHU1NzU3LmluY2x1ZGVzKGt3KSkgcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTU3NTcucHVzaChrdyk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFx1OThDRVx1OTY2OVx1N0VGNFx1NUVBNlx1RkYwOFx1NTkxQVx1OTAwOVx1RkYwOVxuICAgIGZvciAoY29uc3Qga3cgb2YgWydcdTg4NENcdTRFM0EnLCAnXHU3QkExXHU3NDA2JywgJ1x1NTA2NVx1NUVCNycsICdcdTc3RTVcdThCQzYnLCAnXHU3OTNFXHU0RUE0JywgJ1x1NUJCNlx1NUVBRCcsICdcdTc5M0VcdTRGMUEnLCAnXHU2MTBGXHU1OTE2J10pIHtcbiAgICAgIGlmIChjbGVhbmVkLmluY2x1ZGVzKGt3KSAmJiBrdyAhPT0gY2xlYW5lZCkge1xuICAgICAgICByZXN1bHQuXHU3RDIyXHU1RjE1X1x1OThDRVx1OTY2OSA9IHJlc3VsdC5cdTdEMjJcdTVGMTVfXHU5OENFXHU5NjY5ID8/IFtdO1xuICAgICAgICBpZiAoIXJlc3VsdC5cdTdEMjJcdTVGMTVfXHU5OENFXHU5NjY5LmluY2x1ZGVzKGt3KSkgcmVzdWx0Llx1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2NjkucHVzaChrdyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTZCNjNcdTY1ODcgY2FsbG91dCBcdTUzQ0NcdTU0MTFcdThGNkNcdTYzNjIgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKlxuICogXHU5OERFXHU0RTY2XHU2QjYzXHU2NTg3IGNhbGxvdXQgWE1MIFx1MjE5MiBPQiBgPiBbIXR5cGVdYCBjYWxsb3V0XHUzMDAyXG4gKiBcdTRGOURcdTYzNkUgYDAzX1x1NjgzQ1x1NUYwRlx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3My4xXHUzMDAyXG4gKlxuICogXHU4RjkzXHU1MTY1XHU1MzU1XHU0RTJBIGA8Y2FsbG91dCAuLi4+Y29udGVudDwvY2FsbG91dD5gIFx1NTc1N1x1RkYwQ1x1OEY5M1x1NTFGQSBPQiBtYXJrZG93biBjYWxsb3V0XHUzMDAyXG4gKiBcdTU5MUFcdTRFMkEgY2FsbG91dCBcdTU3NTdcdTc1MzFcdThDMDNcdTc1MjhcdTY1QjlcdTYyQzZcdTUyMDZcdTU0MEVcdTkwMTBcdTRFMkFcdThDMDNcdTc1MjhcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZlaXNodUNhbGxvdXRUb09CKHhtbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gXHU2M0QwXHU1M0Q2XHU1QzVFXHU2MDI3XG4gIGNvbnN0IG9wZW5NYXRjaCA9IHhtbC5tYXRjaCgvPGNhbGxvdXRcXGIoW14+XSopPi8pO1xuICBpZiAoIW9wZW5NYXRjaCkgcmV0dXJuIHhtbDtcblxuICBjb25zdCBhdHRycyA9IG9wZW5NYXRjaFsxXTtcbiAgbGV0IGVtb2ppID0gJyc7XG4gIGxldCBiZ0NvbG9yID0gJyc7XG5cbiAgY29uc3QgZW1vamlNYXRjaCA9IGF0dHJzLm1hdGNoKC9lbW9qaT1bXCInXShbXlwiJ10rKVtcIiddLyk7XG4gIGlmIChlbW9qaU1hdGNoKSBlbW9qaSA9IHN0cmlwVmFyaWF0aW9uU2VsZWN0b3JzKGVtb2ppTWF0Y2hbMV0pO1xuXG4gIGNvbnN0IGJnTWF0Y2ggPSBhdHRycy5tYXRjaCgvYmFja2dyb3VuZC1jb2xvcj1bXCInXShbXlwiJ10rKVtcIiddLyk7XG4gIGlmIChiZ01hdGNoKSBiZ0NvbG9yID0gYmdNYXRjaFsxXTtcblxuICAvLyBcdTYzRDBcdTUzRDZcdTUxODVcdTVCQjlcdUZGMDhcdTUzQkJcdTYzODkgb3Blbi9jbG9zZSB0YWdcdUZGMDlcbiAgY29uc3QgY29udGVudCA9IHhtbFxuICAgIC5yZXBsYWNlKC88Y2FsbG91dFxcYltePl0qPi8sICcnKVxuICAgIC5yZXBsYWNlKC88XFwvY2FsbG91dD4vLCAnJylcbiAgICAudHJpbSgpO1xuXG4gIC8vIFx1NjYyMFx1NUMwNCBjYWxsb3V0IFx1N0M3Qlx1NTc4QlxuICBjb25zdCBvYlR5cGUgPSBtYXBGZWlzaHVCZ1RvT2JUeXBlKGJnQ29sb3IpO1xuICBjb25zdCBsaW5lcyA9IGh0bWxCbG9ja1RvVGV4dExpbmVzKGNvbnRlbnQpO1xuICBjb25zdCB0aXRsZSA9IGA+IFshJHtvYlR5cGV9XSR7ZW1vamkgPyBgICR7ZW1vaml9YCA6ICcnfWA7XG5cbiAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRpdGxlO1xuICByZXR1cm4gW3RpdGxlLCAuLi5saW5lcy5tYXAobGluZSA9PiBgPiAke2xpbmV9YCldLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIFx1NjI3OVx1OTFDRlx1NUMwNlx1OThERVx1NEU2NiBYTUwgXHU5MUNDXHU3Njg0XHU2MjQwXHU2NzA5IGNhbGxvdXQgXHU1NzU3XHU4RjZDXHU2MzYyXHU0RTNBIE9CIGNhbGxvdXRcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRGZWlzaHVDYWxsb3V0c1RvT0IoeG1sOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBjYWxsb3V0UmUgPSAvPGNhbGxvdXRcXGJbXj5dKj5bXFxzXFxTXSo/PFxcL2NhbGxvdXQ+L2c7XG4gIHJldHVybiB4bWwucmVwbGFjZShjYWxsb3V0UmUsIChtYXRjaCkgPT4gZmVpc2h1Q2FsbG91dFRvT0IobWF0Y2gpKTtcbn1cblxuLyoqXG4gKiBPQiBgPiBbIXR5cGVdYCBjYWxsb3V0IFx1MjE5MiBcdTk4REVcdTRFNjYgY2FsbG91dCBYTUxcdTMwMDJcbiAqIFx1NEY5RFx1NjM2RSBgMDNfXHU2ODNDXHU1RjBGXHU4OUM0XHU4MzAzLm1kYCBcdTAwQTczLjJcdTMwMDJcbiAqXG4gKiBcdThGOTNcdTUxNjVcdTUzNTVcdTRFMkEgT0IgY2FsbG91dCBcdTU3NTdcdUZGMDhcdTU0MkIgYD4gWyF0eXBlXWAgXHU5OTk2XHU4ODRDICsgXHU1QjUwXHU4ODRDXHVGRjA5XHUzMDAyXG4gKiBcdTU5MUFcdTRFMkEgY2FsbG91dCBcdTc1MzFcdThDMDNcdTc1MjhcdTY1QjlcdTYyQzZcdTUyMDZcdTU0MEVcdTkwMTBcdTRFMkFcdThDMDNcdTc1MjhcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9iQ2FsbG91dFRvRmVpc2h1KG1kOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBsaW5lcyA9IG1kLnNwbGl0KCdcXG4nKS5tYXAobCA9PiBsLnJlcGxhY2UoL14+XFxzPy8sICcnKSk7XG4gIGlmIChsaW5lcy5sZW5ndGggPT09IDApIHJldHVybiBtZDtcblxuICAvLyBcdTg5RTNcdTY3OTBcdTk5OTZcdTg4NEMgYD4gWyF0eXBlXWBcbiAgY29uc3QgaGVhZGVyTWF0Y2ggPSBsaW5lc1swXS5tYXRjaCgvXFxbIShcXHcrKVxcXVxccyooLiopLyk7XG4gIGlmICghaGVhZGVyTWF0Y2gpIHJldHVybiBtZDtcblxuICBjb25zdCBvYlR5cGUgPSBoZWFkZXJNYXRjaFsxXTtcbiAgbGV0IHJlc3QgPSBzdHJpcFZhcmlhdGlvblNlbGVjdG9ycyhoZWFkZXJNYXRjaFsyXSA/PyAnJykudHJpbSgpO1xuICBjb25zdCBmZWlzaHUgPSBPQl9DQUxMT1VUX1RPX0ZFSVNIVVtvYlR5cGVdO1xuXG4gIGxldCBlbW9qaSA9IGZlaXNodT8uZW1vamkgPz8gJ1x1RDgzRFx1RENBMSc7XG4gIGxldCBiZyA9IGZlaXNodT8uYmcgPz8gJ2xpZ2h0LWJsdWUnO1xuICBsZXQgYm9yZGVyID0gZmVpc2h1Py5ib3JkZXIgPz8gJ2JsdWUnO1xuXG4gIC8vIFx1NUMxRFx1OEJENVx1NEVDRVx1OTk5Nlx1ODg0Q1x1NTI2OVx1NEY1OVx1NTE4NVx1NUJCOVx1NjNEMFx1NTNENlx1NzUyOFx1NjIzN1x1NTE5OVx1NzY4NCBlbW9qaVx1RkYwQ1x1NUU3Nlx1NEVDRVx1NkI2M1x1NjU4N1x1NEUyRFx1NzlGQlx1OTY2NFx1MzAwMlxuICBjb25zdCBlbW9qaU1hdGNoID0gcmVzdC5tYXRjaCgvXihcXHB7RXh0ZW5kZWRfUGljdG9ncmFwaGljfSlcXHMqL3UpO1xuICBpZiAoZW1vamlNYXRjaCkge1xuICAgIGVtb2ppID0gZW1vamlNYXRjaFsxXTtcbiAgICByZXN0ID0gcmVzdC5zbGljZShlbW9qaU1hdGNoWzBdLmxlbmd0aCkudHJpbVN0YXJ0KCk7XG4gIH1cblxuICAvLyBcdTUxODVcdTVCQjlcdUZGMDhcdTk5OTZcdTg4NENcdTUzQkJcdTYzODkgZW1vamkgKyBcdTU0MEVcdTdFRURcdTVCNTBcdTg4NENcdUZGMDlcbiAgY29uc3QgYm9keUxpbmVzID0gbGluZXMuc2xpY2UoMSk7XG4gIGlmIChyZXN0KSB7XG4gICAgYm9keUxpbmVzLnVuc2hpZnQocmVzdCk7XG4gIH1cbiAgY29uc3QgY29udGVudEh0bWwgPSBib2R5TGluZXNcbiAgICAuZmlsdGVyKGwgPT4gbC50cmltKCkpXG4gICAgLm1hcChsID0+IGA8cD4ke2x9PC9wPmApXG4gICAgLmpvaW4oJ1xcbicpO1xuXG4gIHJldHVybiBbXG4gICAgYDxjYWxsb3V0IGVtb2ppPVwiJHtlbW9qaX1cIiBiYWNrZ3JvdW5kLWNvbG9yPVwiJHtiZ31cIiBib3JkZXItY29sb3I9XCIke2JvcmRlcn1cIj5gLFxuICAgIGNvbnRlbnRIdG1sLFxuICAgIGA8L2NhbGxvdXQ+YCxcbiAgXS5qb2luKCdcXG4nKTtcbn1cblxuLyoqXG4gKiBcdTYyNzlcdTkxQ0ZcdTVDMDYgT0IgbWQgXHU5MUNDXHU3Njg0XHU2MjQwXHU2NzA5IGA+IFshdHlwZV1gIGNhbGxvdXQgXHU4RjZDXHU2MzYyXHU0RTNBXHU5OERFXHU0RTY2IFhNTCBjYWxsb3V0XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0T0JDYWxsb3V0c1RvRmVpc2h1KG1kOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBcdTUzMzlcdTkxNERcdThGREVcdTdFRURcdTc2ODQgY2FsbG91dCBcdTU3NTdcdUZGMDhcdTRFRTUgPiBbISBcdTVGMDBcdTU5MzRcdTc2ODRcdTg4NENcdUZGMENcdTc2RjRcdTUyMzBcdTk3NUUgPiBcdTYyMTZcdTdBN0FcdTg4NENcdUZGMDlcbiAgY29uc3QgY2FsbG91dFJlID0gLyg/Ol4+IFxcWyFcXHcrXFxdLipcXG4oPzpePi4qXFxuPykqKS9nbTtcbiAgcmV0dXJuIG1kLnJlcGxhY2UoY2FsbG91dFJlLCAobWF0Y2gpID0+IG9iQ2FsbG91dFRvRmVpc2h1KG1hdGNoKSk7XG59XG4iLCAiLyoqXG4gKiBcdTc2RUVcdTVGNTVcdTY2MjBcdTVDMDRcdTYzQThcdTVCRkNcdTMwMDJcdTRGOURcdTYzNkUgYDAxX09CXHUyMTk0XHU5OERFXHU0RTY2XHU1QkY5XHU2QkQ0XHU2MkE1XHU1NDRBLm1kYCArIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgIFx1MDBBN1x1NEUwM1x1MzAwMlxuICpcbiAqIE9CIDI1IFx1NEUyQVx1NjgzOVx1NzZFRVx1NUY1NSBcdTIxOTIgXHU5OERFXHU0RTY2IDUgXHU0RTJBXHU5ODc2XHU3RUE3XHU4MjgyXHU3MEI5XHU3Njg0XHU2NjIwXHU1QzA0XHU4OUM0XHU1MjE5XHVGRjFBXG4gKiAgIDBcdUZFMEZcdTIwRTNcdThGOTNcdTUxNjUgLyBTIFx1MjE5MiBcdTk4REVcdTRFNjZcIlx1OEY5M1x1NTE2NVwiXG4gKiAgIDFcdUZFMEZcdTIwRTNcdThGOTNcdTUxRkEgLyBYIFx1MjE5MiBcdTk4REVcdTRFNjZcIlx1OEY5M1x1NTFGQVwiXG4gKiAgIDJcdUZFMEZcdTIwRTNcdUQ4M0RcdUREQzNcdTc3RTVcdThCQzZcdTZDNjAgLyBaIC8gTCAvIEogLyBRIFx1MjE5MiBcdTk4REVcdTRFNjZcIlx1NzdFNVx1OEJDNlx1NkM2MFwiXG4gKiAgIFx1RDgzRVx1REVBN1x1NUJGQ1x1NUYxNSBcdTIxOTIgXHU5OERFXHU0RTY2XCJcdTVCRkNcdTVGMTVcIlxuICogICAzXHVGRTBGXHUyMEUzXHU5NjQ0XHU0RUY2XHU2NTg3XHU0RUY2IFx1MjE5MiBcdTk4REVcdTRFNjZcIlx1OTY0NFx1NEVGNlwiXHVGRjA4XHU3Mjc5XHU2QjhBXHVGRjBDXHU5NzVFXHU2NTg3XHU2ODYzXHVGRjA5XG4gKlxuICogXHU2M0E4XHU1QkZDXHU3RUQzXHU2NzlDXHU3RjEzXHU1QjU4XHU1MjMwIGAuZmVpc2h1LXN5bmMvbWFwcGluZy5qc29uYFx1RkYwQ1x1NEUwRFx1Nzg2Q1x1N0YxNlx1NzgwMVx1MzAwMlxuICovXG5pbXBvcnQgdHlwZSB7IEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IE5vdGljZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IGxpc3RXaWtpQ2hpbGRyZW4gfSBmcm9tICcuL2xhcmsvY2xpLmpzJztcblxuY29uc3QgTUFQUElOR19GSUxFID0gJy5mZWlzaHUtc3luYy9tYXBwaW5nLmpzb24nO1xuXG4vKiogXHU1MzU1XHU2NzYxXHU2NjIwXHU1QzA0XHVGRjFBT0IgXHU4REVGXHU1Rjg0IFx1MjE5MiBcdTk4REVcdTRFNjZcdTgyODJcdTcwQjlcdTMwMDIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGlyTWFwcGluZyB7XG4gIC8qKiBPQiBcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTU5ODIgXCIwXHVGRTBGXHUyMEUzXHU4RjkzXHU1MTY1L1x1RDgzRFx1RENBMVx1Nzg4RVx1NzI0N1x1OEY5M1x1NTE2NVx1RkYwOFx1OTVFQVx1NUZGNVx1RkYwOVwiXHUzMDAyICovXG4gIG9iUGF0aDogc3RyaW5nO1xuICAvKiogXHU5OERFXHU0RTY2IG5vZGVfdG9rZW5cdTMwMDIgKi9cbiAgZmVpc2h1Tm9kZVRva2VuOiBzdHJpbmc7XG4gIC8qKiBcdTk4REVcdTRFNjZcdTgyODJcdTcwQjlcdTY4MDdcdTk4OThcdTMwMDIgKi9cbiAgZmVpc2h1VGl0bGU6IHN0cmluZztcbn1cblxuLyoqIFx1NjYyMFx1NUMwNFx1N0YxM1x1NUI1OFx1MzAwMiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYXBwaW5nQ2FjaGUge1xuICAvKiogXHU3NTFGXHU2MjEwXHU2NUY2XHU5NUY0XHUzMDAyICovXG4gIGdlbmVyYXRlZEF0OiBzdHJpbmc7XG4gIC8qKiBzcGFjZV9pZFx1MzAwMiAqL1xuICBzcGFjZUlkOiBzdHJpbmc7XG4gIC8qKiBcdTk4NzZcdTdFQTdcdTgyODJcdTcwQjlcdTMwMDIgKi9cbiAgdG9wTm9kZXM6IEFycmF5PHsgdG9rZW46IHN0cmluZzsgdGl0bGU6IHN0cmluZyB9PjtcbiAgLyoqIFx1OEJFNlx1N0VDNlx1NjYyMFx1NUMwNFx1MzAwMiAqL1xuICBtYXBwaW5nczogRGlyTWFwcGluZ1tdO1xufVxuXG4vKiogT0IgXHU2ODM5XHU3NkVFXHU1RjU1IGVtb2ppIFx1MjE5MiBcdTk4REVcdTRFNjZcdTk4NzZcdTdFQTdcdTgyODJcdTcwQjlcdTY4MDdcdTk4OThcdUZGMDhcdTRGOURcdTYzNkUgMDEgXHU1QkY5XHU2QkQ0XHU2MkE1XHU1NDRBXHVGRjA5XHUzMDAyICovXG5jb25zdCBST09UX0RJUl9UT19GRUlTSFU6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICcwXHVGRTBGXHUyMEUzXHU4RjkzXHU1MTY1JzogJ1x1OEY5M1x1NTE2NScsXG4gICcxXHVGRTBGXHUyMEUzXHU4RjkzXHU1MUZBJzogJ1x1OEY5M1x1NTFGQScsXG4gICcyXHVGRTBGXHUyMEUzXHVEODNEXHVEREMzXHU3N0U1XHU4QkM2XHU2QzYwJzogJ1x1NzdFNVx1OEJDNlx1NkM2MCcsXG4gICczXHVGRTBGXHUyMEUzXHU5NjQ0XHU0RUY2XHU2NTg3XHU0RUY2JzogJ1x1OTY0NFx1NEVGNicsXG4gICdcdUQ4M0VcdURFQTdcdTVCRkNcdTVGMTUnOiAnXHU1QkZDXHU1RjE1Jyxcbn07XG5cbi8qKlxuICogXHU2M0E4XHU1QkZDXHU1RTc2XHU3RjEzXHU1QjU4XHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0XHUzMDAyXG4gKiAxLiBcdTYyQzlcdTk4REVcdTRFNjZcdTk4NzZcdTdFQTdcdTgyODJcdTcwQjlcdTUyMTdcdTg4NjhcbiAqIDIuIFx1NjMwOSBlbW9qaSBcdTg5QzRcdTUyMTlcdTUzMzlcdTkxNEQgT0IgXHU2ODM5XHU3NkVFXHU1RjU1IFx1MjE5MiBcdTk4REVcdTRFNjZcdTk4NzZcdTdFQTdcbiAqIDMuIFx1OTAxMlx1NUY1Mlx1NTMzOVx1OTE0RFx1NUI1MFx1NzZFRVx1NUY1NVx1RkYwOFx1NjMwOVx1NjgwN1x1OTg5OFx1NkEyMVx1N0NDQVx1NTMzOVx1OTE0RFx1RkYwOVxuICogNC4gXHU1MTk5XHU1MTY1IC5mZWlzaHUtc3luYy9tYXBwaW5nLmpzb25cbiAqXG4gKiBAcmV0dXJucyBcdTYzQThcdTVCRkNcdTc2ODRcdTY2MjBcdTVDMDRcdTY1NzBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hNYXBwaW5nKGFwcDogQXBwLCBzcGFjZUlkOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICBpZiAoIXNwYWNlSWQpIHtcbiAgICBuZXcgTm90aWNlKCdcdTI2QTBcdUZFMEYgXHU2NzJBXHU5MTREXHU3RjZFIHNwYWNlX2lkXHVGRjBDXHU4QkY3XHU1NzI4XHU4QkJFXHU3RjZFXHU5ODc1XHU1ODZCXHU1MTk5Jyk7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBuZXcgTm90aWNlKCdcdUQ4M0RcdUREMDQgXHU2M0E4XHU1QkZDXHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0Li4uJyk7XG5cbiAgLy8gXHU2MkM5IDUgXHU0RTJBXHU5ODc2XHU3RUE3XHU4MjgyXHU3MEI5XG4gIGNvbnN0IHRvcE5vZGVzID0gbGlzdFdpa2lDaGlsZHJlbihzcGFjZUlkLCAnJyk7XG4gIGlmICh0b3BOb2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICBuZXcgTm90aWNlKCdcdTI2QTBcdUZFMEYgXHU2MkM5XHU0RTBEXHU1MjMwXHU5OERFXHU0RTY2XHU5ODc2XHU3RUE3XHU4MjgyXHU3MEI5XHVGRjBDXHU4QkY3XHU2OEMwXHU2N0U1IHNwYWNlX2lkIFx1NTQ4QyBsYXJrLWNsaSBcdTc2N0JcdTVGNTVcdTYwMDEnKTtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGNvbnN0IG1hcHBpbmdzOiBEaXJNYXBwaW5nW10gPSBbXTtcblxuICAvLyBcdTk4NzZcdTdFQTdcdTUzMzlcdTkxNERcbiAgZm9yIChjb25zdCBbb2JSb290LCBmZWlzaHVUaXRsZV0gb2YgT2JqZWN0LmVudHJpZXMoUk9PVF9ESVJfVE9fRkVJU0hVKSkge1xuICAgIGNvbnN0IG1hdGNoZWQgPSB0b3BOb2Rlcy5maW5kKG4gPT4gbi50aXRsZS5pbmNsdWRlcyhmZWlzaHVUaXRsZSkgfHwgZmVpc2h1VGl0bGUuaW5jbHVkZXMobi50aXRsZSkpO1xuICAgIGlmIChtYXRjaGVkKSB7XG4gICAgICBtYXBwaW5ncy5wdXNoKHtcbiAgICAgICAgb2JQYXRoOiBvYlJvb3QsXG4gICAgICAgIGZlaXNodU5vZGVUb2tlbjogbWF0Y2hlZC5ub2RlX3Rva2VuLFxuICAgICAgICBmZWlzaHVUaXRsZTogbWF0Y2hlZC50aXRsZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFx1OTAxMlx1NUY1Mlx1NTMzOVx1OTE0RFx1NUI1MFx1NzZFRVx1NUY1NVx1RkYwOFx1NEUwMFx1N0VBN1x1NTM3M1x1NTNFRlx1RkYwQ1x1OTA3Rlx1NTE0RFx1OEZDN1x1NkRGMVx1RkYwOVxuICBjb25zdCByb290ID0gYXBwLnZhdWx0LmdldFJvb3QoKTtcbiAgZm9yIChjb25zdCBjaGlsZCBvZiByb290LmNoaWxkcmVuKSB7XG4gICAgaWYgKCFjaGlsZC5uYW1lIHx8IGNoaWxkLm5hbWUuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICBpZiAoIShjaGlsZC5jaGlsZHJlbj8ubGVuZ3RoKSkgY29udGludWU7XG4gICAgLy8gXHU2MjdFXHU1MjMwXHU4RkQ5XHU0RTJBXHU2ODM5XHU3Njg0XHU5OERFXHU0RTY2IHRva2VuXG4gICAgY29uc3Qgcm9vdE1hcHBpbmcgPSBtYXBwaW5ncy5maW5kKG0gPT4gbS5vYlBhdGggPT09IGNoaWxkLm5hbWUpO1xuICAgIGlmICghcm9vdE1hcHBpbmcpIGNvbnRpbnVlO1xuXG4gICAgLy8gXHU2MkM5XHU5OERFXHU0RTY2XHU1QjUwXHU4MjgyXHU3MEI5XG4gICAgY29uc3QgZmVpc2h1Q2hpbGRyZW4gPSBsaXN0V2lraUNoaWxkcmVuKHNwYWNlSWQsIHJvb3RNYXBwaW5nLmZlaXNodU5vZGVUb2tlbik7XG4gICAgZm9yIChjb25zdCBvYlN1YiBvZiBjaGlsZC5jaGlsZHJlbikge1xuICAgICAgaWYgKCFvYlN1Yi5uYW1lIHx8IG9iU3ViLm5hbWUuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICAgIC8vIFx1NkEyMVx1N0NDQVx1NTMzOVx1OTE0RFx1RkYwOFx1NTNCQlx1NjM4OVx1N0YxNlx1NzgwMVx1NTI0RFx1N0YwMFx1NTQwRVx1NkJENFx1OEY4M1x1RkYwOVxuICAgICAgY29uc3QgY2xlYW5PYk5hbWUgPSBvYlN1Yi5uYW1lLnJlcGxhY2UoL15cXGR7Mn1fXFxkezR9X1tTWFpMUUpdXFxkK1xccyovLCAnJyk7XG4gICAgICBjb25zdCBtYXRjaGVkID0gZmVpc2h1Q2hpbGRyZW4uZmluZChcbiAgICAgICAgbiA9PiBuLnRpdGxlLmluY2x1ZGVzKGNsZWFuT2JOYW1lKSB8fCBjbGVhbk9iTmFtZS5pbmNsdWRlcyhuLnRpdGxlKSxcbiAgICAgICk7XG4gICAgICBpZiAobWF0Y2hlZCkge1xuICAgICAgICBtYXBwaW5ncy5wdXNoKHtcbiAgICAgICAgICBvYlBhdGg6IGAke2NoaWxkLm5hbWV9LyR7b2JTdWIubmFtZX1gLFxuICAgICAgICAgIGZlaXNodU5vZGVUb2tlbjogbWF0Y2hlZC5ub2RlX3Rva2VuLFxuICAgICAgICAgIGZlaXNodVRpdGxlOiBtYXRjaGVkLnRpdGxlLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBcdTUxOTlcdTdGMTNcdTVCNThcbiAgY29uc3QgY2FjaGU6IE1hcHBpbmdDYWNoZSA9IHtcbiAgICBnZW5lcmF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHNwYWNlSWQsXG4gICAgdG9wTm9kZXM6IHRvcE5vZGVzLm1hcChuID0+ICh7IHRva2VuOiBuLm5vZGVfdG9rZW4sIHRpdGxlOiBuLnRpdGxlIH0pKSxcbiAgICBtYXBwaW5ncyxcbiAgfTtcblxuICBhd2FpdCBlbnN1cmVDb25maWdEaXIoYXBwKTtcbiAgYXdhaXQgYXBwLnZhdWx0LmFkYXB0ZXIud3JpdGUoTUFQUElOR19GSUxFLCBKU09OLnN0cmluZ2lmeShjYWNoZSwgbnVsbCwgMikpO1xuXG4gIG5ldyBOb3RpY2UoYFx1MjcwNSBcdTc2RUVcdTVGNTVcdTY2MjBcdTVDMDRcdTVERjJcdTY2RjRcdTY1QjBcdUZGMDgke21hcHBpbmdzLmxlbmd0aH0gXHU2NzYxXHVGRjA5YCk7XG4gIHJldHVybiBtYXBwaW5ncy5sZW5ndGg7XG59XG5cbi8qKlxuICogXHU4QkZCXHU2NjIwXHU1QzA0XHU3RjEzXHU1QjU4XHUzMDAyXHU2NUUwXHU3RjEzXHU1QjU4XHU4RkQ0XHU1NkRFIG51bGxcdTMwMDJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRNYXBwaW5nKGFwcDogQXBwKTogUHJvbWlzZTxNYXBwaW5nQ2FjaGUgfCBudWxsPiB7XG4gIHRyeSB7XG4gICAgaWYgKCEoYXdhaXQgYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKE1BUFBJTkdfRklMRSkpKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCByYXcgPSBhd2FpdCBhcHAudmF1bHQuYWRhcHRlci5yZWFkKE1BUFBJTkdfRklMRSk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UocmF3KSBhcyBNYXBwaW5nQ2FjaGU7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUud2FybignW3N5bmMvbWFwcGluZ10gbG9hZCBmYWlsZWQ6JywgZXJyKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFx1NjdFNSBPQiBcdThERUZcdTVGODRcdTVCRjlcdTVFOTRcdTc2ODRcdTk4REVcdTRFNjZcdTgyODJcdTcwQjkgdG9rZW5cdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvb2t1cEZlaXNodU5vZGUoY2FjaGU6IE1hcHBpbmdDYWNoZSwgb2JQYXRoOiBzdHJpbmcpOiBEaXJNYXBwaW5nIHwgbnVsbCB7XG4gIC8vIFx1N0NCRVx1Nzg2RVx1NTMzOVx1OTE0RFxuICBjb25zdCBleGFjdCA9IGNhY2hlLm1hcHBpbmdzLmZpbmQobSA9PiBtLm9iUGF0aCA9PT0gb2JQYXRoKTtcbiAgaWYgKGV4YWN0KSByZXR1cm4gZXhhY3Q7XG5cbiAgLy8gXHU1MjREXHU3RjAwXHU1MzM5XHU5MTREXHVGRjA4XHU1M0Q2XHU2NzAwXHU5NTdGXHU1MzM5XHU5MTREXHVGRjA5XG4gIGxldCBiZXN0OiBEaXJNYXBwaW5nIHwgbnVsbCA9IG51bGw7XG4gIGZvciAoY29uc3QgbSBvZiBjYWNoZS5tYXBwaW5ncykge1xuICAgIGlmIChvYlBhdGguc3RhcnRzV2l0aChtLm9iUGF0aCArICcvJykgfHwgb2JQYXRoLnN0YXJ0c1dpdGgobS5vYlBhdGgpKSB7XG4gICAgICBpZiAoIWJlc3QgfHwgbS5vYlBhdGgubGVuZ3RoID4gYmVzdC5vYlBhdGgubGVuZ3RoKSBiZXN0ID0gbTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJlc3Q7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGVuc3VyZUNvbmZpZ0RpcihhcHA6IEFwcCk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBkaXIgPSAnLmZlaXNodS1zeW5jJztcbiAgaWYgKCEoYXdhaXQgYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKGRpcikpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKGRpcik7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvKiBpZ25vcmUgKi9cbiAgICB9XG4gIH1cbn1cbiIsICIvKipcbiAqIFx1NjcyQ1x1NTczMCBIVFRQIHNlcnZlclx1MzAwMlx1NEY5RFx1NjM2RVx1NjVCOVx1Njg0OCBcdTAwQTcyXHVGRjA4bG9jYWxob3N0IEhUVFAgXHU1MzRGXHU4QkFFXHVGRjA5XHUzMDAyXG4gKlxuICogLSBcdTc1Mjggbm9kZTpodHRwIFx1OEQ3NyBzZXJ2ZXJcdUZGMDhPQiBcdTYzRDJcdTRFRjYgaXNEZXNrdG9wT25seVx1RkYwQ1x1NTNFRlx1NzUyOCBub2RlIFx1NTE4NVx1N0Y2RVx1NkEyMVx1NTc1N1x1RkYwOVxuICogLSBcdTdBRUZcdTUzRTNcdTUzRUZcdTkxNERcdTdGNkVcdUZGMDhcdTlFRDhcdThCQTQgNDU2N1x1RkYwOVxuICogLSBcdTkyNzRcdTY3NDNcdUZGMUFcdTZCQ0ZcdTRFMkFcdThCRjdcdTZDNDJcdTY4MjFcdTlBOEMgWC1TeW5jLVRva2VuIGhlYWRlclxuICogLSBDT1JTXHVGRjFBXHU2NTNFXHU5MDFBIE9QVElPTlMgXHU5ODg0XHU2OEMwXHVGRjA4XHU2MjY5XHU1QzU1XHU0RUNFXHU5OERFXHU0RTY2XHU5ODc1XHU5NzYyIGZldGNoIFx1NEYxQVx1ODhBQlx1NjJFNlx1RkYwOVxuICogLSBcdThERUZcdTc1MzFcdTUyMDZcdTUzRDFcdTUyMzAgaGFuZGxlcnNcbiAqL1xuaW1wb3J0ICogYXMgaHR0cCBmcm9tICdub2RlOmh0dHAnO1xuaW1wb3J0IHsgVE9LRU5fSEVBREVSIH0gZnJvbSAnQHN5bmMvc2hhcmVkJztcblxuZXhwb3J0IGludGVyZmFjZSBTZXJ2ZXJEZXBzIHtcbiAgLyoqIFx1NjgyMVx1OUE4QyB0b2tlbiBcdTY2MkZcdTU0MjZcdTUzMzlcdTkxNERcdTMwMDIgKi9cbiAgdmFsaWRhdGVUb2tlbjogKHRva2VuOiBzdHJpbmcpID0+IGJvb2xlYW47XG4gIC8qKiBcdThERUZcdTc1MzFcdTU5MDRcdTc0MDZcdTU2NjhcdTY2MjBcdTVDMDRcdTMwMDIgKi9cbiAgcm91dGVzOiBNYXA8c3RyaW5nLCBSb3V0ZUhhbmRsZXI+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlcXVlc3RDb250ZXh0IHtcbiAgbWV0aG9kOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICAvKiogXHU4OUUzXHU2NzkwXHU1NDBFXHU3Njg0IHBhdGhcdUZGMDhcdTRFMERcdTU0MkIgcXVlcnlcdUZGMDlcdTMwMDIgKi9cbiAgcGF0aDogc3RyaW5nO1xuICAvKiogcXVlcnkgXHU1M0MyXHU2NTcwXHUzMDAyICovXG4gIHF1ZXJ5OiBVUkxTZWFyY2hQYXJhbXM7XG4gIC8qKiBcdThCRjdcdTZDNDJcdTRGNTNcdUZGMDhQT1NUL1BVVCBcdTYyNERcdTY3MDlcdUZGMENcdTVERjIgcGFyc2UgSlNPTlx1RkYwOVx1MzAwMiAqL1xuICBib2R5PzogdW5rbm93bjtcbiAgLyoqIFx1NTM5Rlx1NTlDQiB0b2tlblx1MzAwMiAqL1xuICB0b2tlbjogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBSb3V0ZUhhbmRsZXIgPSAoY3R4OiBSZXF1ZXN0Q29udGV4dCkgPT4gUHJvbWlzZTx1bmtub3duPiB8IHVua25vd247XG5cbi8qKiBKU09OIFx1NTRDRFx1NUU5NFx1NURFNVx1NTE3N1x1MzAwMiAqL1xuZnVuY3Rpb24ganNvbihyZXM6IGh0dHAuU2VydmVyUmVzcG9uc2UsIHN0YXR1czogbnVtYmVyLCBkYXRhOiB1bmtub3duKTogdm9pZCB7XG4gIGNvbnN0IGJvZHkgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgcmVzLndyaXRlSGVhZChzdGF0dXMsIHtcbiAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnLFxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiBgJHtUT0tFTl9IRUFERVJ9LCBDb250ZW50LVR5cGVgLFxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCwgUE9TVCwgT1BUSU9OUycsXG4gICAgJ0NvbnRlbnQtTGVuZ3RoJzogQnVmZmVyLmJ5dGVMZW5ndGgoYm9keSksXG4gIH0pO1xuICByZXMuZW5kKGJvZHkpO1xufVxuXG4vKipcbiAqIFx1NTQyRlx1NTJBOCBIVFRQIHNlcnZlclx1MzAwMlxuICogQHJldHVybnMgc3RvcCgpIFx1NTFGRFx1NjU3MFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRTZXJ2ZXIocG9ydDogbnVtYmVyLCBkZXBzOiBTZXJ2ZXJEZXBzKTogUHJvbWlzZTx7IHN0b3A6ICgpID0+IFByb21pc2U8dm9pZD4gfT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgLy8gQ09SUyBcdTk4ODRcdTY4QzBcbiAgICAgIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICAgICAgcmVzLndyaXRlSGVhZCgyMDQsIHtcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogYCR7VE9LRU5fSEVBREVSfSwgQ29udGVudC1UeXBlYCxcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsIFBPU1QsIE9QVElPTlMnLFxuICAgICAgICB9KTtcbiAgICAgICAgcmVzLmVuZCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1ODlFM1x1Njc5MCBVUkxcbiAgICAgIGNvbnN0IGZ1bGxVcmwgPSByZXEudXJsID8/ICcvJztcbiAgICAgIGNvbnN0IHVybE9iaiA9IG5ldyBVUkwoZnVsbFVybCwgYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fWApO1xuICAgICAgY29uc3QgY3R4UGF0aCA9IHVybE9iai5wYXRobmFtZTtcblxuICAgICAgLy8gXHU4QkZCXHU1M0Q2IGJvZHlcdUZGMDhQT1NUL1BVVFx1RkYwOVxuICAgICAgbGV0IGJvZHk6IHVua25vd247XG4gICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ1BPU1QnIHx8IHJlcS5tZXRob2QgPT09ICdQVVQnKSB7XG4gICAgICAgIGNvbnN0IGNodW5rczogQnVmZmVyW10gPSBbXTtcbiAgICAgICAgZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiByZXEpIHtcbiAgICAgICAgICBjaHVua3MucHVzaChjaHVuayBhcyBCdWZmZXIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJhdyA9IEJ1ZmZlci5jb25jYXQoY2h1bmtzKS50b1N0cmluZygndXRmOCcpO1xuICAgICAgICBpZiAocmF3KSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGJvZHkgPSBKU09OLnBhcnNlKHJhdyk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICBqc29uKHJlcywgNDAwLCB7IG9rOiBmYWxzZSwgY29kZTogJ0JBRF9KU09OJywgbWVzc2FnZTogJ0ludmFsaWQgSlNPTiBib2R5JyB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gXHU5Mjc0XHU2NzQzXHVGRjA4L3N0YXR1cyBcdTUxNDFcdThCQjhcdTY1RTAgdG9rZW4gXHU2M0EyXHU2RDRCXHVGRjBDXHU0RjQ2XHU1QjlFXHU5NjQ1XHU2M0UxXHU2MjRCXHU5NzAwXHU4OTgxXHVGRjA5XG4gICAgICBjb25zdCB0b2tlbiA9IHJlcS5oZWFkZXJzW1RPS0VOX0hFQURFUi50b0xvd2VyQ2FzZSgpXSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgICBpZiAoY3R4UGF0aCAhPT0gJy9zdGF0dXMnICYmICFkZXBzLnZhbGlkYXRlVG9rZW4odG9rZW4gPz8gJycpKSB7XG4gICAgICAgIGpzb24ocmVzLCA0MDEsIHsgb2s6IGZhbHNlLCBjb2RlOiAnVU5BVVRIT1JJWkVEJywgbWVzc2FnZTogJ0ludmFsaWQgb3IgbWlzc2luZyBYLVN5bmMtVG9rZW4nIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1OERFRlx1NzUzMVxuICAgICAgY29uc3QgaGFuZGxlciA9IGRlcHMucm91dGVzLmdldChjdHhQYXRoKTtcbiAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICBqc29uKHJlcywgNDA0LCB7IG9rOiBmYWxzZSwgY29kZTogJ05PVF9GT1VORCcsIG1lc3NhZ2U6IGBVbmtub3duIHBhdGg6ICR7Y3R4UGF0aH1gIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGhhbmRsZXIoe1xuICAgICAgICAgIG1ldGhvZDogcmVxLm1ldGhvZCA/PyAnR0VUJyxcbiAgICAgICAgICB1cmw6IGZ1bGxVcmwsXG4gICAgICAgICAgcGF0aDogY3R4UGF0aCxcbiAgICAgICAgICBxdWVyeTogdXJsT2JqLnNlYXJjaFBhcmFtcyxcbiAgICAgICAgICBib2R5LFxuICAgICAgICAgIHRva2VuOiB0b2tlbiA/PyAnJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGpzb24ocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKTtcbiAgICAgICAgY29uc3QgY29kZSA9IChlcnIgYXMgeyBjb2RlPzogc3RyaW5nIH0pPy5jb2RlID8/ICdJTlRFUk5BTCc7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IChlcnIgYXMgeyBzdGF0dXM/OiBudW1iZXIgfSk/LnN0YXR1cyA/PyA1MDA7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tzeW5jL3NlcnZlcl0gaGFuZGxlciBlcnJvcjonLCBlcnIpO1xuICAgICAgICBqc29uKHJlcywgc3RhdHVzLCB7IG9rOiBmYWxzZSwgY29kZSwgbWVzc2FnZSB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNlcnZlci5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9KTtcblxuICAgIHNlcnZlci5saXN0ZW4ocG9ydCwgJzEyNy4wLjAuMScsICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGBbc3luYy9zZXJ2ZXJdIGxpc3RlbmluZyBvbiBodHRwOi8vMTI3LjAuMC4xOiR7cG9ydH1gKTtcbiAgICAgIHJlc29sdmUoe1xuICAgICAgICBzdG9wOiAoKSA9PlxuICAgICAgICAgIG5ldyBQcm9taXNlKChyZXMpID0+IHtcbiAgICAgICAgICAgIHNlcnZlci5jbG9zZSgoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbc3luYy9zZXJ2ZXJdIHN0b3BwZWRgKTtcbiAgICAgICAgICAgICAgcmVzKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqIFx1Njc4NFx1OTAyMFx1OTUxOVx1OEJFRlx1RkYwOFx1NUUyNiBjb2RlL3N0YXR1c1x1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IGNsYXNzIEh0dHBFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29kZTogc3RyaW5nO1xuICBzdGF0dXM6IG51bWJlcjtcbiAgY29uc3RydWN0b3IoY29kZTogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcsIHN0YXR1cyA9IDQwMCkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMuY29kZSA9IGNvZGU7XG4gICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gIH1cbn1cbiIsICIvKipcbiAqIEdFVCAvc3RhdHVzIFx1MjAxNCBcdTYzRTFcdTYyNEIvXHU1MDY1XHU1RUI3XHU2OEMwXHU2N0U1XHUzMDAyXG4gKi9cbmltcG9ydCB0eXBlIHsgU3RhdHVzUmVzcG9uc2UgfSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5TdGF0ZSB9IGZyb20gJy4uL3NldHRpbmdzLmpzJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhdHVzSGFuZGxlcihwbHVnaW5WZXJzaW9uOiBzdHJpbmcsIHZhdWx0TmFtZTogc3RyaW5nLCBzdGF0ZTogUGx1Z2luU3RhdGUpIHtcbiAgcmV0dXJuIGFzeW5jIChfY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8U3RhdHVzUmVzcG9uc2U+ID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgb2s6IHRydWUsXG4gICAgICB2ZXJzaW9uOiBwbHVnaW5WZXJzaW9uLFxuICAgICAgdmF1bHQ6IHZhdWx0TmFtZSxcbiAgICAgIGxhcmtSZWFkeTogISFzdGF0ZS5sYXJrQ2xpUmVzb2x2ZWQsXG4gICAgICBsYXJrVmVyc2lvbjogc3RhdGUubGFya0NsaVZlcnNpb24gfHwgbnVsbCxcbiAgICB9O1xuICB9O1xufVxuIiwgIi8qKlxuICogR0VUIC90cmVlIFx1MjAxNCBcdThGRDRcdTU2REUgdmF1bHQgXHU3NkVFXHU1RjU1XHU2ODExXHVGRjA4XHU3RUQ5XHU2MjY5XHU1QzU1XHU3NkVFXHU1RjU1XHU0RTBCXHU2MkM5XHU3NTI4XHVGRjA5XHUzMDAyXG4gKlxuICogXHU0RjE4XHU1MzE2XHVGRjFBXG4gKiAtIFx1NTE4NVx1NUI1OFx1N0YxM1x1NUI1OFx1RkYwODUgXHU3OUQyIFRUTFx1RkYwOVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NkJDRlx1NkIyMVx1OEJGN1x1NkM0Mlx1OTA0RFx1NTM4Nlx1NTE2OCB2YXVsdFxuICogLSBcdTY1MkZcdTYzMDEgbWF4RGVwdGggXHU1M0MyXHU2NTcwXHVGRjA4cXVlcnkgc3RyaW5nXHVGRjA5XHVGRjBDXHU5RUQ4XHU4QkE0XHU4RkQ0XHU1NkRFXHU4RjgzXHU1QjhDXHU2NTc0XHU3NkVFXHU1RjU1XHU2ODExXG4gKiAtIFx1NjUyRlx1NjMwMSBwcmVmaXggXHU1M0MyXHU2NTcwXHVGRjBDXHU1QzU1XHU1RjAwXHU2MzA3XHU1QjlBXHU1QjUwXHU2ODExXG4gKi9cbmltcG9ydCB0eXBlIHsgVHJlZVJlc3BvbnNlLCBUcmVlTm9kZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQgeyB0eXBlIEFwcCwgVEZvbGRlciB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgUmVxdWVzdENvbnRleHQgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuXG5jb25zdCBFWENMVURFID0gbmV3IFNldChbXG4gICdcdTYzRDJcdTRFRjYnLFxuICAnc2NyaXB0cycsXG4gICcub2JzaWRpYW4nLFxuICAnLnRyYXNoJyxcbiAgJy5mZWlzaHUtc3luYycsXG4gICdub2RlX21vZHVsZXMnLFxuXSk7XG5cbi8qKiBcdTdGMTNcdTVCNTggKi9cbmxldCBjYWNoZURpcnM6IFRyZWVOb2RlW10gPSBbXTtcbmxldCBjYWNoZVRpbWUgPSAwO1xuY29uc3QgQ0FDSEVfVFRMID0gNV8wMDA7IC8vIDUgXHU3OUQyXG5cbmZ1bmN0aW9uIGJ1aWxkRnVsbFRyZWUoYXBwOiBBcHApOiBUcmVlTm9kZVtdIHtcbiAgY29uc3Qgcm9vdCA9IGFwcC52YXVsdC5nZXRSb290KCk7XG4gIGNvbnN0IGRpcnM6IFRyZWVOb2RlW10gPSBbXTtcblxuICBjb25zdCB3YWxrID0gKGZvbGRlcjogVEZvbGRlciwgZGVwdGg6IG51bWJlcikgPT4ge1xuICAgIGlmIChkZXB0aCA+IDApIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBmb2xkZXIubmFtZTtcbiAgICAgIGlmIChFWENMVURFLmhhcyhuYW1lKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJy4nKSkgcmV0dXJuO1xuICAgICAgZGlycy5wdXNoKHsgcGF0aDogZm9sZGVyLnBhdGgsIGxhYmVsOiBuYW1lLCBkZXB0aCB9KTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBmb2xkZXIuY2hpbGRyZW4pIHtcbiAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIFRGb2xkZXIpIHdhbGsoY2hpbGQsIGRlcHRoICsgMSk7XG4gICAgfVxuICB9O1xuXG4gIHdhbGsocm9vdCwgMCk7XG5cbiAgZGlycy5zb3J0KChhLCBiKSA9PiBhLnBhdGgubG9jYWxlQ29tcGFyZShiLnBhdGgsICd6aCcpKTtcblxuICByZXR1cm4gZGlycztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyZWVIYW5kbGVyKGFwcDogQXBwKSB7XG4gIHJldHVybiBhc3luYyAoY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8VHJlZVJlc3BvbnNlPiA9PiB7XG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBtYXhEZXB0aCA9IHBhcnNlSW50KGN0eC5xdWVyeS5nZXQoJ21heERlcHRoJykgfHwgJzEyJywgMTApO1xuICAgIGNvbnN0IHByZWZpeCA9IGN0eC5xdWVyeS5nZXQoJ3ByZWZpeCcpIHx8ICcnO1xuXG4gICAgLy8gXHU1MjM3XHU2NUIwXHU3RjEzXHU1QjU4XG4gICAgaWYgKG5vdyAtIGNhY2hlVGltZSA+IENBQ0hFX1RUTCB8fCBjYWNoZURpcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjYWNoZURpcnMgPSBidWlsZEZ1bGxUcmVlKGFwcCk7XG4gICAgICBjYWNoZVRpbWUgPSBub3c7XG4gICAgfVxuXG4gICAgbGV0IGRpcnMgPSBjYWNoZURpcnM7XG5cbiAgICAvLyBwcmVmaXggXHU3QjVCXHU5MDA5XHVGRjFBXHU1M0VBXHU4RkQ0XHU1NkRFIHByZWZpeC8gXHU0RTBCXHU3Njg0XHU1QjUwXHU4MjgyXHU3MEI5XHVGRjA4ZGVwdGggXHU0RUNFIHByZWZpeCBcdTRFMEJcdTRFMDBcdTdFQTdcdTVGMDBcdTU5Q0JcdUZGMDlcbiAgICBpZiAocHJlZml4KSB7XG4gICAgICBjb25zdCBwcmVmaXhEZXB0aCA9IHByZWZpeC5zcGxpdCgnLycpLmxlbmd0aCArIDE7XG4gICAgICBkaXJzID0gZGlycy5maWx0ZXIoZCA9PiBkLnBhdGguc3RhcnRzV2l0aChwcmVmaXggKyAnLycpICYmIGQuZGVwdGggPD0gcHJlZml4RGVwdGggKyAxKTtcbiAgICAgIC8vIFx1OTFDRFx1NjVCMFx1OEJBMVx1N0I5N1x1NzZGOFx1NUJGOVx1NkRGMVx1NUVBNlxuICAgICAgZGlycyA9IGRpcnMubWFwKGQgPT4gKHtcbiAgICAgICAgLi4uZCxcbiAgICAgICAgZGVwdGg6IGQuZGVwdGggLSBwcmVmaXhEZXB0aCArIDIsXG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFx1NjMwOSBtYXhEZXB0aCBcdTYyMkFcdTY1QURcbiAgICAgIGRpcnMgPSBkaXJzLmZpbHRlcihkID0+IGQuZGVwdGggPD0gbWF4RGVwdGgpO1xuICAgIH1cblxuICAgIHJldHVybiB7IG9rOiB0cnVlLCBkaXJzIH07XG4gIH07XG59XG5cbi8qKiBcdTVCRkNcdTUxRkFcdTUyMzdcdTY1QjBcdTdGMTNcdTVCNThcdUZGMDhcdTY1ODdcdTRFRjZcdTY0Q0RcdTRGNUNcdTU0MEVcdThDMDNcdTc1MjhcdUZGMDlcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZhbGlkYXRlVHJlZUNhY2hlKCk6IHZvaWQge1xuICBjYWNoZURpcnMgPSBbXTtcbiAgY2FjaGVUaW1lID0gMDtcbn1cbiIsICIvKipcbiAqIFBPU1QgL2ZldGNoIFx1MjAxNCBcdTk4REVcdTRFNjZcdTIxOTJPQiBcdTg0M0RcdTU3MzBcdTRFM0JcdTk0RkVcdThERUZcdTMwMDJcbiAqXG4gKiBcdTRGOURcdTYzNkUgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3Ni4xXHVGRjFBXG4gKiAxLiBsYXJrLWNsaSBkb2NzICtmZXRjaCAtLWRvYy1mb3JtYXQgbWFya2Rvd24gXHUyMTkyIFx1NkI2M1x1NjU4NyBtZFxuICogMi4gbGFyay1jbGkgZG9jcyArZmV0Y2ggLS1kb2MtZm9ybWF0IHhtbCAtLWRldGFpbCB3aXRoLWlkcyBcdTIxOTIgZmlsZV90b2tlbiBcdTUyMTdcdTg4NjggKyBjYWxsb3V0IFx1OTg5Q1x1ODI3MiArIGRvY3ggb2JqX3Rva2VuXG4gKiAzLiBcdTU2RkVcdTcyNDcgYXV0aGNvZGUgVVJMIFx1MjE5MiBmZWlzaHU6Ly9UT0tFTlxuICogNC4gZXhpc3RzIFx1NjhDMFx1NjdFNVx1RkYxQVx1NURGMlx1NjcwOVx1NTQwQyBmZWlzaHVfaWQgXHUyMTkyIFx1NjZGNFx1NjVCMFx1NTIwNlx1NjUyRlx1RkYxQlx1NjVFMCBcdTIxOTIgXHU2NUIwXHU1RUZBXG4gKiA1LiBcdTdFQzRcdTg4QzUgWUFNTFx1RkYwOGZlaXNodV9pZC9mZWlzaHVfZG9jX2lkL2ZlaXNodV90aXRsZS9zeW5jX3RpbWVcdUZGMDkrIFx1NkI2M1x1NjU4N1xuICogNi4gXHU2NTg3XHU0RUY2XHU1NDBEID0gXHU1Qjg5XHU1MTY4XHU2RTA1XHU2RDE3KGZlaXNodV90aXRsZSlcdUZGMENcdTUxOTlcdTUxNjUgZGlyXG4gKiA3LiBhdXRvLXJlbmFtZSBcdTg5RTZcdTUzRDFcdTdGMTZcdTc4MDEgXHUyMTkyIFx1NTE5OVx1NTZERVx1NjU4N1x1NEVGNlx1NTQwRCArIFlBTUwgXHU3RjE2XHU3ODAxXG4gKiA4LiBcdThCQTFcdTdCOTcgc3luY19oYXNoXHVGRjBDXHU1MTk5IHN5bmNfdGltZVxuICogOS4gXHU4RkQ0XHU1NkRFXHU4NDNEXHU1NzMwXHU4REVGXHU1Rjg0XG4gKi9cbmltcG9ydCB0eXBlIHsgRmV0Y2hSZXF1ZXN0LCBGZXRjaFJlc3BvbnNlIH0gZnJvbSAnQHN5bmMvc2hhcmVkJztcbmltcG9ydCB7IEFwcCwgVEZpbGUsIFRGb2xkZXIgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IFJlcXVlc3RDb250ZXh0LCBIdHRwRXJyb3IgfSBmcm9tICcuLi9zZXJ2ZXIuanMnO1xuaW1wb3J0IHR5cGUgeyBGZWlzaHVTeW5jU2V0dGluZ3MsIFBsdWdpblN0YXRlIH0gZnJvbSAnLi4vc2V0dGluZ3MuanMnO1xuaW1wb3J0IHsgcnVuLCBnZXRXaWtpTm9kZUluZm8gfSBmcm9tICcuLi9sYXJrL2NsaS5qcyc7XG5pbXBvcnQge1xuICBleHRyYWN0SW1nVG9rZW5zRnJvbVhtbCxcbiAgY29udmVydEZlaXNodUNhbGxvdXRzVG9PQixcbiAgY2FsbG91dFhtbFRvTWV0YSxcbn0gZnJvbSAnQHN5bmMvc2hhcmVkJztcbmltcG9ydCB7XG4gIHBhcnNlRmlsZSxcbiAgYnVpbGRJbml0aWFsRnJvbnRtYXR0ZXIsXG4gIG1lcmdlRnJvbnRtYXR0ZXJGb3JVcGRhdGUsXG4gIGFzc2VtYmxlTWQsXG4gIHByb2Nlc3NGZWlzaHVNZCxcbiAgbWFrZUZpbGVuYW1lLFxuICBtYWtlUGF0aCxcbn0gZnJvbSAnLi4vZmlsZWlvL3dyaXRlci5qcyc7XG5pbXBvcnQgeyBhc3NpZ25FbmNvZGluZyB9IGZyb20gJy4uL2F1dG9SZW5hbWUuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZldGNoRGVwcyB7XG4gIGFwcDogQXBwO1xuICBzZXR0aW5nczogRmVpc2h1U3luY1NldHRpbmdzO1xuICBzdGF0ZTogUGx1Z2luU3RhdGU7XG4gIG5vdGljZTogKG1zZzogc3RyaW5nKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRmV0Y2hIYW5kbGVyKGRlcHM6IEZldGNoRGVwcykge1xuICByZXR1cm4gYXN5bmMgKGN0eDogUmVxdWVzdENvbnRleHQpOiBQcm9taXNlPEZldGNoUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCByZXEgPSBjdHguYm9keSBhcyBGZXRjaFJlcXVlc3Q7XG4gICAgaWYgKCFyZXE/Lm5vZGVfdG9rZW4pIHtcbiAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoJ25vZGVfdG9rZW4gaXMgcmVxdWlyZWQnKSBhcyBFcnJvciAmIHsgY29kZTogc3RyaW5nOyBzdGF0dXM6IG51bWJlciB9O1xuICAgICAgZS5jb2RlID0gJ01JU1NJTkdfVE9LRU4nO1xuICAgICAgZS5zdGF0dXMgPSA0MDA7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIGNvbnN0IHsgbm9kZV90b2tlbiwgc3BhY2VfaWQsIGRpciB9ID0gcmVxO1xuICAgIGNvbnN0IHNldHRpbmdzID0gZGVwcy5zZXR0aW5ncztcbiAgICBjb25zdCB0YXJnZXREaXIgPSBkaXIgPz8gc2V0dGluZ3MuZGVmYXVsdERpcjtcblxuICAgIGRlcHMubm90aWNlKGBcdTJCMDcgXHU1NDBDXHU2QjY1XHU5OERFXHU0RTY2XHU2NTg3XHU2ODYzICR7bm9kZV90b2tlbi5zbGljZSgwLCA4KX0uLi5gKTtcblxuICAgIC8vIFx1NkI2NVx1OUFBNCAxXHVGRjFBXHU2MkZGXHU2QjYzXHU2NTg3IG1kXG4gICAgbGV0IG1kOiBzdHJpbmc7XG4gICAgdHJ5IHtcbiAgICAgIG1kID0gcnVuKFxuICAgICAgICBbJ2RvY3MnLCAnK2ZldGNoJywgJy0tZG9jJywgbm9kZV90b2tlbiwgJy0tZG9jLWZvcm1hdCcsICdtYXJrZG93biddLFxuICAgICAgICB7IHRpbWVvdXQ6IDYwMDAwIH0sXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gbm9kZV90b2tlbiBcdTUzRUZcdTgwRkRcdTY2MkYgd2lraSBub2RlXHVGRjBDXHU5NzAwXHU1MTQ4XHU4OUUzXHU2NzkwXHU0RTNBIG9ial90b2tlblxuICAgICAgY29uc3QgaW5mbyA9IHNwYWNlX2lkID8gZ2V0V2lraU5vZGVJbmZvKG5vZGVfdG9rZW4sIHNwYWNlX2lkKSA6IG51bGw7XG4gICAgICBpZiAoaW5mbz8ub2JqX3Rva2VuKSB7XG4gICAgICAgIG1kID0gcnVuKFxuICAgICAgICAgIFsnZG9jcycsICcrZmV0Y2gnLCAnLS1kb2MnLCBpbmZvLm9ial90b2tlbiwgJy0tZG9jLWZvcm1hdCcsICdtYXJrZG93biddLFxuICAgICAgICAgIHsgdGltZW91dDogNjAwMDAgfSxcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBcdTZCNjVcdTlBQTQgMlx1RkYxQVx1NjJGRiBYTUxcdUZGMDhcdTU2RkVcdTcyNDcgdG9rZW4gKyBjYWxsb3V0IFx1OTg5Q1x1ODI3MiArIGRvY3ggb2JqX3Rva2VuXHVGRjA5XG4gICAgbGV0IHhtbCA9ICcnO1xuICAgIGxldCBvYmpUb2tlbiA9IHJlcS5vYmpfdG9rZW4gPz8gJyc7XG4gICAgdHJ5IHtcbiAgICAgIHhtbCA9IHJ1bihcbiAgICAgICAgWydkb2NzJywgJytmZXRjaCcsICctLWRvYycsIG5vZGVfdG9rZW4sICctLWRvYy1mb3JtYXQnLCAneG1sJywgJy0tZGV0YWlsJywgJ3dpdGgtaWRzJ10sXG4gICAgICAgIHsgdGltZW91dDogNjAwMDAgfSxcbiAgICAgICk7XG4gICAgICBpZiAoIW9ialRva2VuKSB7XG4gICAgICAgIC8vIG9ial90b2tlbiBcdTU3MjggWE1MIFx1NzY4NCA8dGl0bGUgaWQ9XCIuLi5cIj4gXHU1QzVFXHU2MDI3XHU5MUNDXHVGRjA4XHU4OUUzXHU1MzA1XHU1NDBFXHU3Njg0XHU3RUFGIFhNTCBcdTZDQTFcdTY3MDlcdTY2M0VcdTVGMEYgb2JqX3Rva2VuIFx1NUI1N1x1NkJCNVx1RkYwOVxuICAgICAgICBjb25zdCB0aXRsZUlkTWF0Y2ggPSB4bWwubWF0Y2goLzx0aXRsZVtePl0qXFxiaWQ9XCIoW0EtWmEtejAtOV0rKVwiLyk7XG4gICAgICAgIGlmICh0aXRsZUlkTWF0Y2gpIG9ialRva2VuID0gdGl0bGVJZE1hdGNoWzFdO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS53YXJuKCdbc3luYy9mZXRjaF0geG1sIGZldGNoIGZhaWxlZCAoaW1hZ2UgdG9rZW5zIG1heSBiZSBtaXNzaW5nKTonLCBlcnIpO1xuICAgIH1cblxuICAgIC8vIFx1NkI2NVx1OUFBNCAyLjVcdUZGMUFcdTRFQ0VcdTk4REVcdTRFNjZcdTU5MzRcdTkwRTggY2FsbG91dCBcdTg5RTNcdTY3OTBcdTUxNDNcdTY1NzBcdTYzNkVcdUZGMDhcdTY4MDdcdTdCN0UvXHU3RjE2XHU3ODAxL1x1OEY5M1x1NTE2NS9cdTY1RTVcdTY3MUYvXHU1MTczXHU5NTJFXHU4QkNEL1x1OEJDNFx1NTIwNi9cdTdEMjJcdTVGMTVcdUZGMDlcbiAgICAvLyBcdThGRDlcdTRFOUJcdTVCNTdcdTZCQjVcdTRGMUFcdTUxOTlcdThGREIgWUFNTCBmcm9udG1hdHRlclx1RkYxQlx1NkI2M1x1NjU4NyBjYWxsb3V0IFx1NEZERFx1NzU1OVx1NEUwRFx1NTJBOFx1RkYwOFx1NkI2NVx1OUFBNCAzLjUgXHU4RjZDIE9CIGNhbGxvdXRcdUZGMDlcbiAgICBjb25zdCBtZXRhID0ge1xuICAgICAgLi4uKHhtbCA/IGNhbGxvdXRYbWxUb01ldGEoeG1sKSA6IHt9KSxcbiAgICAgIC4uLihyZXEubWV0YSA/PyB7fSksXG4gICAgfTtcbiAgICBpZiAoT2JqZWN0LmtleXMobWV0YSkubGVuZ3RoID4gMCkge1xuICAgICAgZGVwcy5ub3RpY2UoYFx1RDgzRFx1RENDQiBcdTYzRDBcdTUzRDZcdTUyMzAgJHtPYmplY3Qua2V5cyhtZXRhKS5sZW5ndGh9IFx1NEUyQVx1NTE0M1x1NjU3MFx1NjM2RVx1NUI1N1x1NkJCNWApO1xuICAgIH1cblxuICAgIC8vIFx1NkI2NVx1OUFBNCAzXHVGRjFBXHU1NkZFXHU3MjQ3IHRva2VuIFx1MjE5MiBmZWlzaHU6Ly8gXHU1MzRGXHU4QkFFXG4gICAgY29uc3QgaW1nVG9rZW5zID0gbmV3IFNldChleHRyYWN0SW1nVG9rZW5zRnJvbVhtbCh4bWwpKTtcbiAgICBsZXQgcHJvY2Vzc2VkTWQgPSBwcm9jZXNzRmVpc2h1TWQobWQsIGltZ1Rva2Vucyk7XG5cbiAgICAvLyBcdTZCNjVcdTlBQTQgMy41XHVGRjFBXHU5OERFXHU0RTY2XHU2QjYzXHU2NTg3IGNhbGxvdXQgWE1MIFx1MjE5MiBPQiBjYWxsb3V0XG4gICAgaWYgKHhtbCkge1xuICAgICAgcHJvY2Vzc2VkTWQgPSBjb252ZXJ0RmVpc2h1Q2FsbG91dHNUb09CKHByb2Nlc3NlZE1kKTtcbiAgICB9XG5cbiAgICAvLyBcdTYzRDBcdTUzRDZcdTk4REVcdTRFNjZcdTY4MDdcdTk4OThcdUZGMDhtZCBcdTdCMkNcdTRFMDBcdTRFMkEgSDFcdUZGMENcdTYyMTYgZmFsbGJhY2sgXHU1MjMwIG5vZGUgXHU0RkUxXHU2MDZGXHVGRjA5XG4gICAgY29uc3QgdGl0bGVNYXRjaCA9IHByb2Nlc3NlZE1kLm1hdGNoKC9eI1xccysoLispJC9tKTtcbiAgICBsZXQgZmVpc2h1VGl0bGUgPSB0aXRsZU1hdGNoPy5bMV0/LnRyaW0oKSA/PyBub2RlX3Rva2VuO1xuICAgIC8vIFx1NTk4Mlx1Njc5QyBtZCBcdTkxQ0NcdTY3MDkgSDFcdUZGMENcdTRFQ0VcdTZCNjNcdTY1ODdcdTUzQkJcdTYzODlcdUZGMDhPQiBcdTY1ODdcdTRFRjYgSDEgXHU0RkREXHU3NTU5XHVGRjBDXHU0RjQ2XHU5MDdGXHU1MTREXHU5MUNEXHU1OTBEXHUyMDE0XHUyMDE0XHU4RkQ5XHU5MUNDXHU0RkREXHU3NTU5IEgxIFx1NEY1Q1x1NEUzQVx1NkI2M1x1NjU4N1x1OTk5Nlx1ODg0Q1x1RkYwOVxuICAgIC8vIFx1NTFCM1x1N0I1Nlx1RkYxQVx1NEZERFx1NzU1OSBIMVx1RkYwQ1x1NTZFMFx1NEUzQSBPQiBcdTc2ODRcdTY1ODdcdTRFRjZcdTU0MERcdTU0OEMgSDEgXHU1M0VGXHU0RUU1XHU0RTBEXHU1NDBDXG5cbiAgICAvLyBcdTZCNjVcdTlBQTQgNFx1RkYxQWV4aXN0cyBcdTY4QzBcdTY3RTVcbiAgICBjb25zdCBleGlzdGluZ0ZpbGUgPSBhd2FpdCBmaW5kQnlGZWlzaHVJZChkZXBzLmFwcCwgbm9kZV90b2tlbik7XG4gICAgY29uc3Qgc3luY1RpbWUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgbGV0IGFjdGlvbjogJ2NyZWF0ZWQnIHwgJ3VwZGF0ZWQnO1xuICAgIGxldCBmaW5hbFBhdGg6IHN0cmluZztcbiAgICBsZXQgZW5jb2Rpbmc6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgIGlmIChleGlzdGluZ0ZpbGUpIHtcbiAgICAgIC8vIFx1NjZGNFx1NjVCMFx1NTIwNlx1NjUyRlx1RkYxQVx1NEZERFx1NzU1OVx1NzUyOFx1NjIzN1x1NjUzOVx1NzY4NFx1NTE0M1x1NjU3MFx1NjM2RVx1RkYwQ1x1NTNFQVx1NTIzN1x1NkI2M1x1NjU4NyArIFx1N0VEMVx1NUI5QVx1NUI1N1x1NkJCNVxuICAgICAgYWN0aW9uID0gJ3VwZGF0ZWQnO1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBkZXBzLmFwcC52YXVsdC5yZWFkKGV4aXN0aW5nRmlsZSk7XG4gICAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUZpbGUoZXhpc3RpbmcpO1xuICAgICAgY29uc3QgbWVyZ2VkID0gbWVyZ2VGcm9udG1hdHRlckZvclVwZGF0ZShcbiAgICAgICAgcGFyc2VkLmZyb250bWF0dGVyLFxuICAgICAgICBub2RlX3Rva2VuLFxuICAgICAgICBvYmpUb2tlbixcbiAgICAgICAgZmVpc2h1VGl0bGUsXG4gICAgICAgIHN5bmNUaW1lLFxuICAgICAgICBtZXRhLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhc3NlbWJsZU1kKG1lcmdlZCwgcHJvY2Vzc2VkTWQpO1xuICAgICAgYXdhaXQgZGVwcy5hcHAudmF1bHQubW9kaWZ5KGV4aXN0aW5nRmlsZSwgY29udGVudCk7XG4gICAgICBmaW5hbFBhdGggPSBleGlzdGluZ0ZpbGUucGF0aDtcbiAgICAgIGRlcHMubm90aWNlKGBcdTI3MEYgXHU1REYyXHU2NkY0XHU2NUIwICR7ZXhpc3RpbmdGaWxlLm5hbWV9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFx1NjVCMFx1NUVGQVx1NTIwNlx1NjUyRlxuICAgICAgYWN0aW9uID0gJ2NyZWF0ZWQnO1xuICAgICAgY29uc3QgZmlsZW5hbWUgPSBtYWtlRmlsZW5hbWUoZmVpc2h1VGl0bGUsIHJlcS5maWxlbmFtZSk7XG4gICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBtYWtlUGF0aCh0YXJnZXREaXIsIGZpbGVuYW1lKTtcblxuICAgICAgLy8gXHU3ODZFXHU0RkREXHU3NkVFXHU1RjU1XHU1QjU4XHU1NzI4XG4gICAgICBhd2FpdCBlbnN1cmVGb2xkZXIoZGVwcy5hcHAsIHRhcmdldERpcik7XG5cbiAgICAgIGNvbnN0IGZtID0gYnVpbGRJbml0aWFsRnJvbnRtYXR0ZXIobm9kZV90b2tlbiwgb2JqVG9rZW4sIGZlaXNodVRpdGxlLCBzeW5jVGltZSwgbWV0YSk7XG4gICAgICBjb25zdCBjb250ZW50ID0gYXNzZW1ibGVNZChmbSwgcHJvY2Vzc2VkTWQpO1xuXG4gICAgICAvLyBcdTY4QzBcdTY3RTVcdTY1ODdcdTRFRjZcdTY2MkZcdTU0MjZcdTVERjJcdTVCNThcdTU3MjhcdUZGMDhcdTU0MENcdTU0MERcdTRFMERcdTU0MEMgZmVpc2h1X2lkXHVGRjA5XG4gICAgICBjb25zdCByZXBsYWNlRmlsZSA9IHJlcS5yZXBsYWNlX3BhdGhcbiAgICAgICAgPyBkZXBzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocmVxLnJlcGxhY2VfcGF0aClcbiAgICAgICAgOiBudWxsO1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBkZXBzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocmVsYXRpdmVQYXRoKTtcbiAgICAgIGlmIChyZXBsYWNlRmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgIGF3YWl0IGRlcHMuYXBwLnZhdWx0Lm1vZGlmeShyZXBsYWNlRmlsZSwgY29udGVudCk7XG4gICAgICAgIGZpbmFsUGF0aCA9IHJlcGxhY2VGaWxlLnBhdGg7XG4gICAgICAgIGFjdGlvbiA9ICd1cGRhdGVkJztcbiAgICAgIH0gZWxzZSBpZiAoZXhpc3RpbmcgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAvLyBcdTU0MENcdTU0MERcdTUxQjJcdTdBODFcdUZGMUFcdTUyQTBcdTU0MEVcdTdGMDBcbiAgICAgICAgY29uc3QgY29uZmxpY3RQYXRoID0gbWFrZVBhdGgodGFyZ2V0RGlyLCBgJHtmaWxlbmFtZS5yZXBsYWNlKC9cXC5tZCQvLCAnJyl9LSR7bm9kZV90b2tlbi5zbGljZSgwLCA2KX0ubWRgKTtcbiAgICAgICAgYXdhaXQgZGVwcy5hcHAudmF1bHQuY3JlYXRlKGNvbmZsaWN0UGF0aCwgY29udGVudCk7XG4gICAgICAgIGZpbmFsUGF0aCA9IGNvbmZsaWN0UGF0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGNyZWF0ZWQgPSBhd2FpdCBkZXBzLmFwcC52YXVsdC5jcmVhdGUocmVsYXRpdmVQYXRoLCBjb250ZW50KTtcbiAgICAgICAgZmluYWxQYXRoID0gY3JlYXRlZC5wYXRoO1xuICAgICAgfVxuXG4gICAgICBkZXBzLm5vdGljZShgXHUyNzA1IFx1NURGMlx1NTIxQlx1NUVGQSAke2ZpbGVuYW1lfWApO1xuXG4gICAgICAvLyBcdTZCNjVcdTlBQTQgN1x1RkYxQWF1dG8tcmVuYW1lIFx1N0YxNlx1NzgwMVx1NTIwNlx1OTE0RFxuICAgICAgaWYgKHNldHRpbmdzLmF1dG9SZW5hbWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBlbmNvZGluZyA9IGF3YWl0IGFzc2lnbkVuY29kaW5nKGRlcHMuYXBwLCBmaW5hbFBhdGgsIHRhcmdldERpcik7XG4gICAgICAgICAgaWYgKGVuY29kaW5nKSB7XG4gICAgICAgICAgICBkZXBzLm5vdGljZShgXHVEODNEXHVERDIyIFx1N0YxNlx1NzgwMVx1RkYxQSR7ZW5jb2Rpbmd9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2ZldGNoXSBhdXRvLXJlbmFtZSBmYWlsZWQ6JywgZXJyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFx1OEJCMFx1NUY1NVx1NjcwMFx1OEZEMVx1NTQwQ1x1NkI2NVxuICAgIGRlcHMuc3RhdGUucmVjZW50U3luY3MudW5zaGlmdCh7XG4gICAgICB0aW1lOiBzeW5jVGltZSxcbiAgICAgIG5vZGVfdG9rZW4sXG4gICAgICB0aXRsZTogZmVpc2h1VGl0bGUsXG4gICAgICBwYXRoOiBmaW5hbFBhdGgsXG4gICAgICBhY3Rpb24sXG4gICAgfSk7XG4gICAgaWYgKGRlcHMuc3RhdGUucmVjZW50U3luY3MubGVuZ3RoID4gNTApIHtcbiAgICAgIGRlcHMuc3RhdGUucmVjZW50U3luY3MgPSBkZXBzLnN0YXRlLnJlY2VudFN5bmNzLnNsaWNlKDAsIDUwKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgb2s6IHRydWUsXG4gICAgICBwYXRoOiBmaW5hbFBhdGgsXG4gICAgICBmaWxlbmFtZTogZmluYWxQYXRoLnNwbGl0KCcvJykucG9wKCkgPz8gJycsXG4gICAgICBhY3Rpb24sXG4gICAgICBcdTdGMTZcdTc4MDE6IGVuY29kaW5nLFxuICAgICAgZmVpc2h1X3RpdGxlOiBmZWlzaHVUaXRsZSxcbiAgICB9O1xuICB9O1xufVxuXG4vKipcbiAqIFx1NjMwOSBmZWlzaHVfaWQgXHU2N0U1XHU2MjdFXHU1REYyXHU1NDBDXHU2QjY1XHU2NTg3XHU0RUY2XHUzMDAyXG4gKiBcdTYyNkJcdTYzQ0YgdmF1bHQgXHU0RTBCXHU2MjQwXHU2NzA5IC5tZFx1RkYwQ1x1ODlFM1x1Njc5MCBmcm9udG1hdHRlciBcdTUzMzlcdTkxNEQgZmVpc2h1X2lkXHUzMDAyXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZpbmRCeUZlaXNodUlkKGFwcDogQXBwLCBmZWlzaHVJZDogc3RyaW5nKTogUHJvbWlzZTxURmlsZSB8IG51bGw+IHtcbiAgY29uc3QgZmlsZXMgPSBhcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAvLyBcdThERjNcdThGQzdcdTYzRDJcdTRFRjZcdTc2RUVcdTVGNTVcbiAgICBpZiAoZmlsZS5wYXRoLnN0YXJ0c1dpdGgoJy5vYnNpZGlhbicpIHx8IGZpbGUucGF0aC5zdGFydHNXaXRoKCcuZmVpc2h1LXN5bmMnKSkgY29udGludWU7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBhcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgIC8vIFx1NUZFQlx1OTAxRlx1NjhDMFx1NkQ0Qlx1RkYxQVx1NTQyQiBmZWlzaHVfaWQgXHU1QjU3XHU2QkI1XHU2MjREXHU4OUUzXHU2NzkwXG4gICAgICBpZiAoIWNvbnRlbnQuaW5jbHVkZXMoJ2ZlaXNodV9pZDonKSkgY29udGludWU7XG4gICAgICBjb25zdCBmbU1hdGNoID0gY29udGVudC5tYXRjaCgvXi0tLVxcbihbXFxzXFxTXSo/KVxcbi0tLS8pO1xuICAgICAgaWYgKCFmbU1hdGNoKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGlkTWF0Y2ggPSBmbU1hdGNoWzFdLm1hdGNoKC9mZWlzaHVfaWQ6XFxzKltcIiddPyhbQS1aYS16MC05XSspLyk7XG4gICAgICBpZiAoaWRNYXRjaCAmJiBpZE1hdGNoWzFdID09PSBmZWlzaHVJZCkge1xuICAgICAgICByZXR1cm4gZmlsZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBcdTc4NkVcdTRGRERcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjhcdUZGMDhcdTkwMTJcdTVGNTJcdTUyMUJcdTVFRkFcdUZGMDlcdTMwMDJcbiAqL1xuYXN5bmMgZnVuY3Rpb24gZW5zdXJlRm9sZGVyKGFwcDogQXBwLCBkaXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICBpZiAoIWRpciB8fCBkaXIgPT09ICcuJyB8fCBkaXIgPT09ICcvJykgcmV0dXJuO1xuICBjb25zdCBleGlzdGluZyA9IGFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZGlyKTtcbiAgaWYgKGV4aXN0aW5nIGluc3RhbmNlb2YgVEZvbGRlcikgcmV0dXJuO1xuICB0cnkge1xuICAgIGF3YWl0IGFwcC52YXVsdC5jcmVhdGVGb2xkZXIoZGlyKTtcbiAgfSBjYXRjaCB7XG4gICAgLy8gXHU1M0VGXHU4MEZEXHU3MjM2XHU3NkVFXHU1RjU1XHU0RTVGXHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU5MDEyXHU1RjUyXG4gICAgY29uc3QgcGFyZW50ID0gZGlyLnNwbGl0KCcvJykuc2xpY2UoMCwgLTEpLmpvaW4oJy8nKTtcbiAgICBpZiAocGFyZW50KSBhd2FpdCBlbnN1cmVGb2xkZXIoYXBwLCBwYXJlbnQpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBhcHAudmF1bHQuY3JlYXRlRm9sZGVyKGRpcik7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBcdTVERjJcdTVCNThcdTU3MjhcdTYyMTZcdTUxNzZcdTRFRDZcdTk1MTlcdThCRUZcdUZGMENcdTVGRkRcdTc1NjVcbiAgICB9XG4gIH1cbn1cbiIsICIvKipcbiAqIFx1NjU4N1x1NEVGNiBJT1x1RkYxQVx1OEJGQlx1NTE5OSB2YXVsdCBcdTRFMkRcdTc2ODQgLm1kIFx1NjU4N1x1NEVGNlx1MzAwMlxuICogXHU0RjlEXHU2MzZFXHU2NUI5XHU2ODQ4IFx1MDBBNzZcdUZGMDhcdTUxNzNcdTk1MkVcdTZENDFcdTdBMEJcdUZGMDkrIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYFx1MzAwMlxuICpcbiAqIC0gcmVhZGVyXHVGRjFBXHU4OUUzXHU2NzkwIGZyb250bWF0dGVyICsgYm9keVx1RkYwQ1x1OEJBMVx1N0I5NyBoYXNoXHVGRjBDXHU2QkQ0XHU1QkY5IHN5bmNfaGFzaFxuICogLSB3cml0ZXJcdUZGMUFcdTdFQzRcdTg4QzUgWUFNTCArIGJvZHlcdUZGMENcdTUxOTlcdTY1ODdcdTRFRjZcbiAqL1xuaW1wb3J0IHtcbiAgcGFyc2VGcm9udG1hdHRlcixcbiAgc2VyaWFsaXplRnJvbnRtYXR0ZXIsXG4gIGFzc2VtYmxlRmlsZSxcbiAgYm9keUhhc2gsXG4gIGlzQ2hhbmdlZCxcbiAgc2FuaXRpemVGaWxlbmFtZSxcbiAgd2l0aE1kRXh0LFxuICBqb2luUGF0aCxcbiAgcmV3cml0ZUltYWdlc1RvRmVpc2h1UHJvdG8sXG4gIHR5cGUgWUFNTEZyb250bWF0dGVyLFxufSBmcm9tICdAc3luYy9zaGFyZWQnO1xuXG4vKiogXHU4QkZCXHU2NTg3XHU0RUY2XHU3RUQzXHU2NzlDXHUzMDAyICovXG5leHBvcnQgaW50ZXJmYWNlIFBhcnNlZEZpbGUge1xuICAvKiogXHU1QjhDXHU2NTc0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XHUzMDAyICovXG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgLyoqIGZyb250bWF0dGVyXHVGRjA4XHU2NUUwXHU1MjE5XHU0RTNBXHU3QTdBXHU1QkY5XHU4QzYxXHVGRjA5XHUzMDAyICovXG4gIGZyb250bWF0dGVyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgLyoqIFx1NkI2M1x1NjU4N1x1RkYwOFx1NEUwRFx1NTQyQiBmcm9udG1hdHRlclx1RkYwOVx1MzAwMiAqL1xuICBib2R5OiBzdHJpbmc7XG4gIC8qKiBcdTZCNjNcdTY1ODcgaGFzaFx1RkYwOHNoYTI1NiBoZXhcdUZGMDlcdTMwMDIgKi9cbiAgaGFzaDogc3RyaW5nO1xufVxuXG4vKipcbiAqIFx1NEVDRVx1NUI4Q1x1NjU3NFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVx1ODlFM1x1Njc5MFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGaWxlKGNvbnRlbnQ6IHN0cmluZyk6IFBhcnNlZEZpbGUge1xuICBjb25zdCB7IGZyb250bWF0dGVyLCBib2R5IH0gPSBwYXJzZUZyb250bWF0dGVyKGNvbnRlbnQpO1xuICBjb25zdCBoYXNoID0gYm9keUhhc2goYm9keSk7XG4gIHJldHVybiB7XG4gICAgY29udGVudCxcbiAgICBmcm9udG1hdHRlcjogZnJvbnRtYXR0ZXIgPz8ge30sXG4gICAgYm9keSxcbiAgICBoYXNoLFxuICB9O1xufVxuXG4vKipcbiAqIFx1NjhDMFx1NkQ0Qlx1NTE4NVx1NUJCOVx1NjYyRlx1NTQyNlx1NzZGOFx1NUJGOVx1NEUwQVx1NkIyMVx1NTQwQ1x1NkI2NVx1NTNEMVx1NzUxRlx1NTNEOFx1NTMxNlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzQ29udGVudENoYW5nZWQocGFyc2VkOiBQYXJzZWRGaWxlKTogYm9vbGVhbiB7XG4gIHJldHVybiBpc0NoYW5nZWQocGFyc2VkLmhhc2gsIHBhcnNlZC5mcm9udG1hdHRlci5zeW5jX2hhc2ggYXMgc3RyaW5nIHwgdW5kZWZpbmVkKTtcbn1cblxuLyoqXG4gKiBcdTdFQzRcdTg4QzVcdTY1QjBcdTY1ODdcdTRFRjZcdTc2ODQgZnJvbnRtYXR0ZXJcdUZGMDhcdTk4REVcdTRFNjZcdTIxOTJPQiBcdTk5OTZcdTZCMjFcdTg0M0RcdTU3MzBcdUZGMDlcdTMwMDJcbiAqIEBwYXJhbSBtZXRhIFx1NEVDRVx1OThERVx1NEU2NiBjYWxsb3V0IFx1ODlFM1x1Njc5MFx1NTFGQVx1NzY4NFx1NTE0M1x1NjU3MFx1NjM2RVx1RkYwOFx1NjgwN1x1N0I3RS9cdTdGMTZcdTc4MDEvXHU4RjkzXHU1MTY1L1x1NjVFNVx1NjcxRi9cdTUxNzNcdTk1MkVcdThCQ0QvXHU4QkM0XHU1MjA2L1x1N0QyMlx1NUYxNVx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRJbml0aWFsRnJvbnRtYXR0ZXIoXG4gIGZlaXNodUlkOiBzdHJpbmcsXG4gIGZlaXNodURvY0lkOiBzdHJpbmcsXG4gIGZlaXNodVRpdGxlOiBzdHJpbmcsXG4gIHN5bmNUaW1lOiBzdHJpbmcsXG4gIG1ldGE/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFlBTUxGcm9udG1hdHRlciB7XG4gIHJldHVybiB7XG4gICAgZmVpc2h1X2lkOiBmZWlzaHVJZCxcbiAgICBmZWlzaHVfZG9jX2lkOiBmZWlzaHVEb2NJZCxcbiAgICBmZWlzaHVfdGl0bGU6IGZlaXNodVRpdGxlLFxuICAgIHN5bmNfdGltZTogc3luY1RpbWUsXG4gICAgLy8gXHU5OERFXHU0RTY2IGNhbGxvdXQgXHU1MTQzXHU2NTcwXHU2MzZFXHVGRjA4XHU3QTdBXHU1MDNDXHU1QjU3XHU2QkI1XHU0RTBEXHU1MTk5XHU1MTY1XHVGRjBDXHU0RkREXHU2MzAxIFlBTUwgXHU1RTcyXHU1MUMwXHVGRjA5XG4gICAgLi4uKG1ldGEgJiYgc3RyaXBFbXB0eShtZXRhKSksXG4gICAgLy8gc3luY19oYXNoIFx1NTcyOFx1NTE5OVx1NTE2NVx1NjVGNlx1NzUzMSB3cml0ZXIgXHU4QkExXHU3Qjk3XHU1ODZCXHU1MTY1XG4gIH07XG59XG5cbi8qKlxuICogXHU1NDA4XHU1RTc2XHU2NkY0XHU2NUIwXHU1REYyXHU2NzA5XHU2NTg3XHU0RUY2XHU3Njg0IGZyb250bWF0dGVyXHVGRjA4XHU0RkREXHU3NTU5XHU3NTI4XHU2MjM3XHU2NTM5XHU3Njg0XHU1MTQzXHU2NTcwXHU2MzZFXHU1QjU3XHU2QkI1XHVGRjA5XHUzMDAyXG4gKiBcdTUzRUFcdTUyMzdcdTU0MENcdTZCNjVcdTdFRDFcdTVCOUFcdTdFQzRcdUZGMDhmZWlzaHVfKiAvIHN5bmNfKlx1RkYwOVx1RkYwQ1x1NEZERFx1NzU1OSBcdTY4MDdcdTdCN0UvXHU3RjE2XHU3ODAxL1x1OEY5M1x1NTE2NS9cdTY1RTVcdTY3MUYvXHU1MTczXHU5NTJFXHU4QkNEL1x1OEJDNFx1NTIwNi9cdTdEMjJcdTVGMTUgXHU3QjQ5XHU3NTI4XHU2MjM3XHU1QjU3XHU2QkI1XHUzMDAyXG4gKlxuICogXHU2Q0U4XHU2MTBGXHVGRjFBXHU1REYyXHU2NzA5XHU1QjU3XHU2QkI1XHU0RjE4XHU1MTQ4XHVGRjA4XHU3NTI4XHU2MjM3XHU1NzI4IE9CIFx1OTFDQ1x1NjUzOVx1OEZDN1x1NzY4NFx1RkYwOVx1RkYwQ1x1OThERVx1NEU2Nlx1NEZBNyBjYWxsb3V0IFx1NTE0M1x1NjU3MFx1NjM2RVx1NEVDNVx1NTcyOFx1NUI1N1x1NkJCNVx1N0YzQVx1NTkzMVx1NjVGNlx1ODg2NVx1OUY1MFx1MzAwMlxuICogXHU4RkQ5XHU2ODM3XHU5MDdGXHU1MTREXHU5OERFXHU0RTY2XHU0RkE3XHU3Njg0XHU2NUU3IGNhbGxvdXQgXHU4OTg2XHU3NkQ2IE9CIFx1OTFDQ1x1NzY4NFx1NjcwMFx1NjVCMFx1NjU3NFx1NzQwNlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VGcm9udG1hdHRlckZvclVwZGF0ZShcbiAgZXhpc3Rpbmc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuICBmZWlzaHVJZDogc3RyaW5nLFxuICBmZWlzaHVEb2NJZDogc3RyaW5nLFxuICBmZWlzaHVUaXRsZTogc3RyaW5nLFxuICBzeW5jVGltZTogc3RyaW5nLFxuICBtZXRhPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4pOiBZQU1MRnJvbnRtYXR0ZXIge1xuICByZXR1cm4ge1xuICAgIC8vIFx1NURGMlx1NjcwOVx1NUI1N1x1NkJCNVx1NEYxOFx1NTE0OFx1RkYwOFx1NzUyOFx1NjIzN1x1NjUzOVx1OEZDN1x1NzY4NFx1RkYwOVx1RkYwQ1x1OThERVx1NEU2NiBjYWxsb3V0IFx1NTE0M1x1NjU3MFx1NjM2RVx1NTNFQVx1ODg2NVx1N0YzQVx1NTkzMVxuICAgIC4uLihtZXRhICYmIHN0cmlwRW1wdHkobWV0YSkpLFxuICAgIC4uLmV4aXN0aW5nLFxuICAgIGZlaXNodV9pZDogZmVpc2h1SWQsXG4gICAgZmVpc2h1X2RvY19pZDogZmVpc2h1RG9jSWQsXG4gICAgZmVpc2h1X3RpdGxlOiBmZWlzaHVUaXRsZSxcbiAgICBzeW5jX3RpbWU6IHN5bmNUaW1lLFxuICB9IGFzIFlBTUxGcm9udG1hdHRlcjtcbn1cblxuLyoqIFx1NzlGQlx1OTY2NFx1NTAzQ1x1NEUzQVx1N0E3QVx1RkYwOHVuZGVmaW5lZC9udWxsLycnL1x1N0E3QVx1NjU3MFx1N0VDNFx1RkYwOVx1NzY4NFx1NUI1N1x1NkJCNVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NkM2MVx1NjdEMyBZQU1MXHUzMDAyICovXG5mdW5jdGlvbiBzdHJpcEVtcHR5KG9iajogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gIGNvbnN0IG91dDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcbiAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMob2JqKSkge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gbnVsbCB8fCB2ID09PSAnJykgY29udGludWU7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodikgJiYgdi5sZW5ndGggPT09IDApIGNvbnRpbnVlO1xuICAgIG91dFtrXSA9IHY7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBcdTdFQzRcdTg4QzVcdTY3MDBcdTdFQzhcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcdUZGMDhZQU1MICsgXHU2QjYzXHU2NTg3ICsgaGFzaFx1RkYwOVx1MzAwMlxuICogQHBhcmFtIGZyb250bWF0dGVyIFx1NTQwQ1x1NkI2NVx1N0VEMVx1NUI5QSArIFx1NzUyOFx1NjIzN1x1NTE0M1x1NjU3MFx1NjM2RVxuICogQHBhcmFtIGJvZHkgXHU2QjYzXHU2NTg3IG1kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlbWJsZU1kKGZyb250bWF0dGVyOiBZQU1MRnJvbnRtYXR0ZXIsIGJvZHk6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIFx1OEJBMVx1N0I5N1x1NUU3Nlx1NTE5OVx1NTE2NSBzeW5jX2hhc2hcbiAgY29uc3QgaGFzaCA9IGJvZHlIYXNoKGJvZHkpO1xuICBjb25zdCBmbVdpdGhIYXNoOiBZQU1MRnJvbnRtYXR0ZXIgPSB7XG4gICAgLi4uZnJvbnRtYXR0ZXIsXG4gICAgc3luY19oYXNoOiBoYXNoLFxuICB9O1xuICByZXR1cm4gYXNzZW1ibGVGaWxlKGZtV2l0aEhhc2gsIGJvZHkpO1xufVxuXG4vKipcbiAqIFx1NjI4QVx1OThERVx1NEU2Nlx1NUJGQ1x1NTFGQVx1NzY4NCBtZCBcdTU5MDRcdTc0MDZcdTRFM0EgT0IgXHU2QjYzXHU2NTg3XHUzMDAyXG4gKiAtIFx1NTZGRVx1NzI0NyBhdXRoY29kZSBVUkwgXHUyMTkyIGZlaXNodTovL1RPS0VOXG4gKiAtIFx1NjgwN1x1OTg5OFx1ODg0Q1x1NTNCQlx1NjM4OVx1RkYwOFx1NjgwN1x1OTg5OFx1NURGMlx1NTcyOCBmcm9udG1hdHRlci5mZWlzaHVfdGl0bGVcdUZGMENPQiBcdTkxQ0MgSDEgXHU0RkREXHU3NTU5XHU0RjQ2XHU5OERFXHU0RTY2XHU0RkE3XHU3NTMxIG9iaiBcdTU5MDRcdTc0MDZcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NGZWlzaHVNZChtZDogc3RyaW5nLCBpbWdUb2tlbnM6IFNldDxzdHJpbmc+KTogc3RyaW5nIHtcbiAgcmV0dXJuIHJld3JpdGVJbWFnZXNUb0ZlaXNodVByb3RvKG1kLCBpbWdUb2tlbnMpO1xufVxuXG4vKipcbiAqIFx1NzUxRlx1NjIxMFx1ODQzRFx1NTczMFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NUI4OVx1NTE2OFx1NkUwNVx1NkQxN1x1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUZpbGVuYW1lKGZlaXNodVRpdGxlOiBzdHJpbmcsIG92ZXJyaWRlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbmFtZSA9IG92ZXJyaWRlID8gc2FuaXRpemVGaWxlbmFtZShvdmVycmlkZSkgOiBzYW5pdGl6ZUZpbGVuYW1lKGZlaXNodVRpdGxlKTtcbiAgcmV0dXJuIHdpdGhNZEV4dChuYW1lKTtcbn1cblxuLyoqXG4gKiBcdTYyRkNcdTYzQTVcdTg0M0RcdTU3MzBcdThERUZcdTVGODRcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1ha2VQYXRoKGRpcjogc3RyaW5nIHwgdW5kZWZpbmVkLCBmaWxlbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGpvaW5QYXRoKGRpciwgZmlsZW5hbWUpO1xufVxuIiwgIi8qKlxuICogYXV0by1yZW5hbWUgXHU3RjE2XHU3ODAxXHU1MjA2XHU5MTREXHUzMDAyXHU0RjlEXHU2MzZFIGAyNl8wNTA5X1NfMDhfYTRiMTAgXHU0RTA5XHU3OUNEXHU3RjE2XHU3ODAxXHU2QTIxXHU1RjBGXHU1QjlFXHU3M0IwXHU4QkY0XHU2NjBFLm1kYFxuICogKyBgXHU3N0U1XHU4QkM2XHU1RTkzXHU4MUVBXHU1MkE4XHU2MjUzXHU2ODA3XHU1MzRGXHU4QkFFXHU4RkI5XHU3NTRDLm1kYCArIGAwMl9ZQU1MXHU1QjU3XHU2QkI1XHU4OUM0XHU4MzAzLm1kYCBcdTAwQTcyLjNcdTMwMDJcbiAqXG4gKiBcdTdGMTZcdTc4MDFcdTY4M0NcdTVGMEZcdUZGMUFZWV9NTUREX1x1NjgwN1x1N0I3RV9cdTVFOEZcdTUzRjdbX1x1NUI1MFx1NUU4Rlx1NTNGN11cbiAqICAgLSBcdTY1ODdcdTRFRjZcdUZGMUFcdTgyMTJcdTVDNTVcdTU3OEIgU18wMVx1RkYwOFx1NjgwN1x1N0I3RV9cdTVFOEZcdTUzRjcgXHU3NTI4XHU0RTBCXHU1MjEyXHU3RUJGXHVGRjA5XG4gKiAgIC0gXHU2NTg3XHU0RUY2XHU1OTM5XHVGRjFBXHU3RDI3XHU1MUQxXHU1NzhCIFMwMVx1RkYwOFx1NjgwN1x1N0I3RVx1NUU4Rlx1NTNGNyBcdTY1RTBcdTRFMEJcdTUyMTJcdTdFQkZcdUZGMDlcbiAqXG4gKiBcdTY4MDdcdTdCN0VcdTRGNTNcdTdDRkJcdUZGMDg2IFx1N0M3Qlx1RkYwQ1x1NTQyQlx1ODg2NVx1NTE2OFx1NzY4NCBRIFx1NzA3NVx1NkMxNFx1RkYwOVx1RkYxQVxuICogICBTPVx1NjUzNlx1OTZDNiAgWD1cdTk4NzlcdTc2RUUgIEw9XHU5ODg2XHU1N0RGICBaPVx1OEQ0NFx1NkU5MCAgUT1cdTcwNzVcdTYxMUYgIEo9XHU2MjgwXHU4MEZEXG4gKlxuICogXHU4OUU2XHU1M0QxXHVGRjFBZmV0Y2ggXHU4NDNEXHU1NzMwXHU1NDBFXHUzMDAxXHU1M0YzXHU5NTJFXHU4M0RDXHU1MzU1XHUzMDAxcmliYm9uIFx1NjI3OVx1OTFDRlx1MzAwMlxuICovXG5pbXBvcnQgdHlwZSB7IEFwcCwgVEZpbGUsIFRGb2xkZXIgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBwYXJzZUZyb250bWF0dGVyLCBzZXJpYWxpemVGcm9udG1hdHRlciwgYXNzZW1ibGVGaWxlLCB0eXBlIFRhZyB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5cbi8qKiBcdTY4MDdcdTdCN0UgXHUyMTkyIFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1RkYwOFx1NEY5RFx1NjM2RSAwMV9cdTVCRjlcdTZCRDRcdTYyQTVcdTU0NEEubWQgXHU3Njg0XHU3NkVFXHU1RjU1XHU4REVGXHU3NTMxXHU4OUM0XHU1MjE5XHVGRjA5XHUzMDAyICovXG5jb25zdCBUQUdfQllfRElSX0hJTlQ6IFJlY29yZDxzdHJpbmcsIFRhZz4gPSB7XG4gICcwXHVGRTBGXHUyMEUzXHU4RjkzXHU1MTY1JzogJ1MnLFxuICAnMVx1RkUwRlx1MjBFM1x1OEY5M1x1NTFGQSc6ICdYJyxcbiAgJzJcdUZFMEZcdTIwRTNcdUQ4M0RcdUREQzNcdTc3RTVcdThCQzZcdTZDNjAnOiAnWicsXG59O1xuXG4vKiogXHU3RjE2XHU3ODAxXHU2QjYzXHU1MjE5XHVGRjFBWVlfTU1ERF9UX05OW19hTl1cdTMwMDIgKi9cbmNvbnN0IENPREVfUkUgPSAvXihcXGR7Mn0pXyhcXGR7NH0pXyhbU1hTTFpRSl0pXyhcXGQrKSg/Ol8oW2Etel1cXGQrKSk/JC87XG5cbi8qKlxuICogXHU0RUNFXHU2NTg3XHU0RUY2XHU2MjQwXHU1NzI4XHU3NkVFXHU1RjU1XHU2M0E4XHU1QkZDXHU2ODA3XHU3QjdFXHUzMDAyXG4gKiBcdTRGMThcdTUxNDhcdTdFQTdcdUZGMUFZQU1MIFx1NjgwN1x1N0I3RVx1NUI1N1x1NkJCNSA+IFx1NzZFRVx1NUY1NVx1NTI0RFx1N0YwMCA+IFx1OUVEOFx1OEJBNCBTXHUzMDAyXG4gKi9cbmZ1bmN0aW9uIGluZmVyVGFnKGRpcjogc3RyaW5nLCBleGlzdGluZ1RhZz86IFRhZyk6IFRhZyB7XG4gIGlmIChleGlzdGluZ1RhZyAmJiBbJ1MnLCAnWCcsICdMJywgJ1onLCAnUScsICdKJ10uaW5jbHVkZXMoZXhpc3RpbmdUYWcpKSB7XG4gICAgcmV0dXJuIGV4aXN0aW5nVGFnO1xuICB9XG4gIGZvciAoY29uc3QgW2RpckhpbnQsIHRhZ10gb2YgT2JqZWN0LmVudHJpZXMoVEFHX0JZX0RJUl9ISU5UKSkge1xuICAgIGlmIChkaXIuc3RhcnRzV2l0aChkaXJIaW50KSkgcmV0dXJuIHRhZztcbiAgfVxuICAvLyBcdTc3RTVcdThCQzZcdTZDNjBcdTRFMEJcdTc2ODRcdTVCNTBcdTc2RUVcdTVGNTVcdTUzRUZcdTgwRkRcdThGREJcdTRFMDBcdTZCNjVcdTdFQzZcdTUyMDZcbiAgaWYgKGRpci5pbmNsdWRlcygnXHU3N0U1XHU4QkM2XHU2QzYwJykgfHwgZGlyLmluY2x1ZGVzKCdcdUQ4M0RcdUREQzMnKSkge1xuICAgIC8vIFx1OEQ0NFx1NkU5MFx1N0M3Qlx1OUVEOFx1OEJBNCBaXHVGRjBDXHU1M0VGXHU4OEFCXHU3NkVFXHU1RjU1XHU1NDBEXHU4OTg2XHU3NkQ2XG4gICAgaWYgKGRpci5pbmNsdWRlcygnTCcpIHx8IGRpci5pbmNsdWRlcygnXHU5ODg2XHU1N0RGJykpIHJldHVybiAnTCc7XG4gICAgaWYgKGRpci5pbmNsdWRlcygnUScpIHx8IGRpci5pbmNsdWRlcygnXHU3MDc1XHU2MTFGJykpIHJldHVybiAnUSc7XG4gICAgaWYgKGRpci5pbmNsdWRlcygnSicpIHx8IGRpci5pbmNsdWRlcygnXHU2MjgwXHU4MEZEJykpIHJldHVybiAnSic7XG4gICAgcmV0dXJuICdaJztcbiAgfVxuICBpZiAoZGlyLmluY2x1ZGVzKCdcdThGOTNcdTUxRkEnKSB8fCBkaXIuaW5jbHVkZXMoJzFcdUZFMEZcdTIwRTMnKSkgcmV0dXJuICdYJztcbiAgaWYgKGRpci5pbmNsdWRlcygnXHU4RjkzXHU1MTY1JykgfHwgZGlyLmluY2x1ZGVzKCcwXHVGRTBGXHUyMEUzJykpIHJldHVybiAnUyc7XG4gIHJldHVybiAnUyc7XG59XG5cbi8qKlxuICogXHU2MjZCXHU2M0NGXHU1NDBDXHU3NkVFXHU1RjU1XHU0RTBCXHU1NDBDXHU2ODA3XHU3QjdFXHU3Njg0XHU2NzAwXHU1OTI3XHU1RThGXHU1M0Y3XHVGRjBDXHU1MjA2XHU5MTREXHU2NUIwXHU1RThGXHU1M0Y3XHUzMDAyXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIG5leHRTZXF1ZW5jZShhcHA6IEFwcCwgZGlyOiBzdHJpbmcsIHRhZzogVGFnKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgY29uc3QgZm9sZGVyID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChkaXIpO1xuICBpZiAoIShmb2xkZXIgaW5zdGFuY2VvZiBURm9sZGVyKSkgcmV0dXJuIDE7XG5cbiAgbGV0IG1heFNlcSA9IDA7XG4gIGZvciAoY29uc3QgY2hpbGQgb2YgZm9sZGVyLmNoaWxkcmVuKSB7XG4gICAgaWYgKCEoY2hpbGQgaW5zdGFuY2VvZiBURmlsZSkgfHwgIWNoaWxkLm5hbWUuZW5kc1dpdGgoJy5tZCcpKSBjb250aW51ZTtcbiAgICBjb25zdCBtYXRjaCA9IGNoaWxkLm5hbWUubWF0Y2goQ09ERV9SRSk7XG4gICAgaWYgKG1hdGNoICYmIG1hdGNoWzNdID09PSB0YWcpIHtcbiAgICAgIGNvbnN0IHNlcSA9IHBhcnNlSW50KG1hdGNoWzRdLCAxMCk7XG4gICAgICBpZiAoc2VxID4gbWF4U2VxKSBtYXhTZXEgPSBzZXE7XG4gICAgfVxuICAgIC8vIFx1NEU1Rlx1NTMzOVx1OTE0RFx1NjVFMFx1NTI0RFx1N0YwMFx1NEY0Nlx1NjcwOSBZQU1MIFx1N0YxNlx1NzgwMVx1NzY4NFx1NjBDNVx1NTFCNVxuICAgIGlmICghbWF0Y2gpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBhcHAudmF1bHQucmVhZChjaGlsZCk7XG4gICAgICAgIGNvbnN0IHsgZnJvbnRtYXR0ZXIgfSA9IHBhcnNlRnJvbnRtYXR0ZXIoY29udGVudCk7XG4gICAgICAgIGNvbnN0IGVuYyA9IGZyb250bWF0dGVyPy5cdTdGMTZcdTc4MDEgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgICBpZiAoZW5jKSB7XG4gICAgICAgICAgY29uc3QgZW5jTWF0Y2ggPSBlbmMubWF0Y2goQ09ERV9SRSk7XG4gICAgICAgICAgaWYgKGVuY01hdGNoICYmIGVuY01hdGNoWzNdID09PSB0YWcpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlcSA9IHBhcnNlSW50KGVuY01hdGNoWzRdLCAxMCk7XG4gICAgICAgICAgICBpZiAoc2VxID4gbWF4U2VxKSBtYXhTZXEgPSBzZXE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBtYXhTZXEgKyAxO1xufVxuXG4vKipcbiAqIFx1NEUzQVx1NjU4N1x1NEVGNlx1NTIwNlx1OTE0RFx1N0YxNlx1NzgwMVx1MzAwMlxuICogLSBcdTc1MUZcdTYyMTAgWVlfTU1ERF9UX05OIFx1NjgzQ1x1NUYwRlxuICogLSBcdTkxQ0RcdTU0N0RcdTU0MERcdTY1ODdcdTRFRjZcdUZGMDhcdTUyQTBcdTdGMTZcdTc4MDFcdTUyNERcdTdGMDBcdUZGMDlcbiAqIC0gXHU1MTk5XHU1NkRFIFlBTUwgXHU3RjE2XHU3ODAxXHU1QjU3XHU2QkI1XG4gKlxuICogQHJldHVybnMgXHU1MjA2XHU5MTREXHU1MjMwXHU3Njg0XHU3RjE2XHU3ODAxXHU0RTMyXHVGRjBDXHU1OTgyIFwiMjZfMDYxNV9TXzAxXCJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFzc2lnbkVuY29kaW5nKFxuICBhcHA6IEFwcCxcbiAgZmlsZVBhdGg6IHN0cmluZyxcbiAgZGlyOiBzdHJpbmcsXG4pOiBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD4ge1xuICBjb25zdCBmaWxlID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChmaWxlUGF0aCk7XG4gIGlmICghKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgY29uc3QgY29udGVudCA9IGF3YWl0IGFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICBjb25zdCB7IGZyb250bWF0dGVyLCBib2R5IH0gPSBwYXJzZUZyb250bWF0dGVyKGNvbnRlbnQpO1xuICBjb25zdCBmbSA9IGZyb250bWF0dGVyID8/IHt9O1xuXG4gIC8vIFx1NURGMlx1NjcwOVx1N0YxNlx1NzgwMVx1NUMzMVx1OERGM1x1OEZDN1xuICBpZiAoZm0uXHU3RjE2XHU3ODAxICYmIENPREVfUkUudGVzdChmbS5cdTdGMTZcdTc4MDEgYXMgc3RyaW5nKSkge1xuICAgIHJldHVybiBmbS5cdTdGMTZcdTc4MDEgYXMgc3RyaW5nO1xuICB9XG5cbiAgLy8gXHU2M0E4XHU1QkZDXHU2ODA3XHU3QjdFICsgXHU1RThGXHU1M0Y3XG4gIGNvbnN0IHRhZyA9IGluZmVyVGFnKGRpciwgZm0uXHU2ODA3XHU3QjdFIGFzIFRhZyB8IHVuZGVmaW5lZCk7XG4gIGNvbnN0IHNlcSA9IGF3YWl0IG5leHRTZXF1ZW5jZShhcHAsIGRpciwgdGFnKTtcblxuICAvLyBcdTc1MUZcdTYyMTBcdTdGMTZcdTc4MDFcbiAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgY29uc3QgeXkgPSBTdHJpbmcobm93LmdldEZ1bGxZZWFyKCkpLnNsaWNlKDIpO1xuICBjb25zdCBtbWRkID0gYCR7U3RyaW5nKG5vdy5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgJzAnKX0ke1N0cmluZyhub3cuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCAnMCcpfWA7XG4gIGNvbnN0IGNvZGUgPSBgJHt5eX1fJHttbWRkfV8ke3RhZ31fJHtTdHJpbmcoc2VxKS5wYWRTdGFydCgyLCAnMCcpfWA7XG5cbiAgLy8gXHU1MTk5XHU1NkRFIFlBTUxcbiAgY29uc3QgbmV3Rm0gPSB7IC4uLmZtLCBcdTY4MDdcdTdCN0U6IHRhZywgXHU3RjE2XHU3ODAxOiBjb2RlIH07XG4gIGNvbnN0IG5ld0NvbnRlbnQgPSBhc3NlbWJsZUZpbGUobmV3Rm0sIGJvZHkpO1xuICBhd2FpdCBhcHAudmF1bHQubW9kaWZ5KGZpbGUsIG5ld0NvbnRlbnQpO1xuXG4gIC8vIFx1OTFDRFx1NTQ3RFx1NTQwRFx1NjU4N1x1NEVGNlx1RkYwOFx1NTJBMFx1N0YxNlx1NzgwMVx1NTI0RFx1N0YwMFx1RkYwOVxuICBjb25zdCBleHQgPSBmaWxlLmV4dGVuc2lvbjtcbiAgY29uc3Qgb2xkTmFtZSA9IGZpbGUuYmFzZW5hbWU7XG4gIGNvbnN0IG5ld05hbWUgPSBgJHtjb2RlfSAke29sZE5hbWV9YDtcbiAgY29uc3QgbmV3UGF0aCA9IGZpbGVQYXRoLnJlcGxhY2UoL1teL10rJC8sIGAke25ld05hbWV9LiR7ZXh0fWApO1xuICBpZiAobmV3UGF0aCAhPT0gZmlsZVBhdGgpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgYXBwLnZhdWx0LnJlbmFtZShmaWxlLCBuZXdQYXRoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUud2FybignW3N5bmMvYXV0b1JlbmFtZV0gcmVuYW1lIGZhaWxlZDonLCBlcnIpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb2RlO1xufVxuXG4vKipcbiAqIFx1NjI3OVx1OTFDRlx1NTIwNlx1OTE0RFx1N0YxNlx1NzgwMVx1RkYwOHJpYmJvbiBcdTg5RTZcdTUzRDFcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJhdGNoQXNzaWduRW5jb2RpbmcoYXBwOiBBcHAsIGRpcjogc3RyaW5nKTogUHJvbWlzZTx7IHRvdGFsOiBudW1iZXI7IGFzc2lnbmVkOiBudW1iZXIgfT4ge1xuICBjb25zdCBmb2xkZXIgPSBhcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGRpcik7XG4gIGlmICghKGZvbGRlciBpbnN0YW5jZW9mIFRGb2xkZXIpKSByZXR1cm4geyB0b3RhbDogMCwgYXNzaWduZWQ6IDAgfTtcblxuICBsZXQgYXNzaWduZWQgPSAwO1xuICBsZXQgdG90YWwgPSAwO1xuICBmb3IgKGNvbnN0IGNoaWxkIG9mIGZvbGRlci5jaGlsZHJlbikge1xuICAgIGlmICghKGNoaWxkIGluc3RhbmNlb2YgVEZpbGUpIHx8ICFjaGlsZC5uYW1lLmVuZHNXaXRoKCcubWQnKSkgY29udGludWU7XG4gICAgdG90YWwrKztcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXNzaWduRW5jb2RpbmcoYXBwLCBjaGlsZC5wYXRoLCBkaXIpO1xuICAgICAgaWYgKHJlc3VsdCkgYXNzaWduZWQrKztcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUud2FybihgW3N5bmMvYXV0b1JlbmFtZV0gYmF0Y2ggZmFpbGVkIGZvciAke2NoaWxkLnBhdGh9OmAsIGVycik7XG4gICAgfVxuICB9XG4gIHJldHVybiB7IHRvdGFsLCBhc3NpZ25lZCB9O1xufVxuXG4vKipcbiAqIFx1ODlFM1x1NzgwMVx1RkYxQVx1NEVDRVx1NjU4N1x1NEVGNlx1NTQwRFx1NjIxNiBZQU1MIFx1NjNEMFx1NTNENlx1N0YxNlx1NzgwMVx1NEZFMVx1NjA2Rlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlQ29kZShjb2RlOiBzdHJpbmcpOiB7XG4gIHl5OiBzdHJpbmc7XG4gIG1tZGQ6IHN0cmluZztcbiAgdGFnOiBUYWc7XG4gIHNlcTogbnVtYmVyO1xuICBzdWI/OiBzdHJpbmc7XG59IHwgbnVsbCB7XG4gIGNvbnN0IG1hdGNoID0gY29kZS5tYXRjaChDT0RFX1JFKTtcbiAgaWYgKCFtYXRjaCkgcmV0dXJuIG51bGw7XG4gIHJldHVybiB7XG4gICAgeXk6IG1hdGNoWzFdLFxuICAgIG1tZGQ6IG1hdGNoWzJdLFxuICAgIHRhZzogbWF0Y2hbM10gYXMgVGFnLFxuICAgIHNlcTogcGFyc2VJbnQobWF0Y2hbNF0sIDEwKSxcbiAgICBzdWI6IG1hdGNoWzVdLFxuICB9O1xufVxuIiwgIi8qKlxuICogUE9TVCAvY2xpcCBcdTIwMTQgXHU0RUZCXHU2MTBGXHU3RjUxXHU5ODc1L1x1NTIxMlx1OEJDRFx1NTI2QVx1NUI1OFx1NTIzMCBPYnNpZGlhblx1MzAwMlxuICpcbiAqIE1WUCBcdTUxQjNcdTdCNTZcdUZGMUFcbiAqIC0gXHU0RTBEXHU3RUQxXHU1QjlBIGZlaXNodV9pZFx1RkYwQ1x1OTA3Rlx1NTE0RFx1NjI4QVx1NjY2RVx1OTAxQVx1N0Y1MVx1OTg3NVx1NEYyQVx1ODhDNVx1NjIxMFx1OThERVx1NEU2Nlx1NTQwQ1x1NkI2NVx1NjU4N1x1NEVGNlx1MzAwMlxuICogLSBcdTUxOTlcdTUxNjVcdTYzRDJcdTRFRjZcdTlFRDhcdThCQTRcdTc2RUVcdTVGNTVcdTYyMTZcdThCRjdcdTZDNDJcdTRGMjBcdTUxNjVcdTc2RUVcdTVGNTVcdTMwMDJcbiAqIC0gXHU0RjdGXHU3NTI4XHU3N0U1XHU4QkM2XHU1RTkzXHU1QjU3XHU2QkI1XHU5ODg0XHU4QkJFXHU1ODZCXHU1MTQ1XHU1N0ZBXHU3ODQwIFlBTUxcdUZGMENcdTdGMTZcdTc4MDFcdTRFQ0RcdTRFQTRcdTdFRDkgYXV0by1yZW5hbWVcdTMwMDJcbiAqL1xuaW1wb3J0IHsgYXNzZW1ibGVGaWxlLCB0eXBlIENsaXBSZXF1ZXN0LCB0eXBlIENsaXBSZXNwb25zZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQgeyBBcHAsIFRGaWxlLCBURm9sZGVyIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBSZXF1ZXN0Q29udGV4dCB9IGZyb20gJy4uL3NlcnZlci5qcyc7XG5pbXBvcnQgdHlwZSB7IEZlaXNodVN5bmNTZXR0aW5ncyB9IGZyb20gJy4uL3NldHRpbmdzLmpzJztcbmltcG9ydCB7IG1ha2VGaWxlbmFtZSwgbWFrZVBhdGggfSBmcm9tICcuLi9maWxlaW8vd3JpdGVyLmpzJztcbmltcG9ydCB7IGFzc2lnbkVuY29kaW5nIH0gZnJvbSAnLi4vYXV0b1JlbmFtZS5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2xpcERlcHMge1xuICBhcHA6IEFwcDtcbiAgc2V0dGluZ3M6IEZlaXNodVN5bmNTZXR0aW5ncztcbiAgbm90aWNlOiAobXNnOiBzdHJpbmcpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDbGlwSGFuZGxlcihkZXBzOiBDbGlwRGVwcykge1xuICByZXR1cm4gYXN5bmMgKGN0eDogUmVxdWVzdENvbnRleHQpOiBQcm9taXNlPENsaXBSZXNwb25zZT4gPT4ge1xuICAgIGNvbnN0IHJlcSA9IChjdHguYm9keSA/PyB7fSkgYXMgQ2xpcFJlcXVlc3Q7XG4gICAgY29uc3QgdGl0bGUgPSBjbGVhblRleHQocmVxLnRpdGxlKSB8fCAnXHU3RjUxXHU5ODc1XHU1MjZBXHU4NUNGJztcbiAgICBjb25zdCB1cmwgPSBjbGVhblRleHQocmVxLnVybCk7XG4gICAgY29uc3QgdGV4dCA9IGNsZWFuVGV4dChyZXEudGV4dCk7XG4gICAgY29uc3QgcmF3VGV4dCA9IGNsZWFuVGV4dChyZXEucmF3VGV4dCkgfHwgdGV4dDtcbiAgICBjb25zdCBib2R5TWFya2Rvd24gPSBjbGVhblRleHQocmVxLmJvZHlNYXJrZG93bik7XG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSBjbGVhblRleHQocmVxLmRlc2NyaXB0aW9uKTtcbiAgICBjb25zdCBzb3VyY2VLaW5kID0gY2xlYW5UZXh0KHJlcS5zb3VyY2VLaW5kKSB8fCAnZ2VuZXJpYy1wYWdlJztcbiAgICBjb25zdCBhcHBlbmRQYXRoID0gY2xlYW5QYXRoKHJlcS5hcHBlbmRQYXRoKTtcbiAgICBpZiAoIXVybCAmJiAhdGV4dCAmJiAhYm9keU1hcmtkb3duICYmICFyYXdUZXh0KSB7XG4gICAgICBjb25zdCBlID0gbmV3IEVycm9yKCd1cmwgb3IgdGV4dCBpcyByZXF1aXJlZCcpIGFzIEVycm9yICYgeyBjb2RlOiBzdHJpbmc7IHN0YXR1czogbnVtYmVyIH07XG4gICAgICBlLmNvZGUgPSAnTUlTU0lOR19DTElQX0NPTlRFTlQnO1xuICAgICAgZS5zdGF0dXMgPSA0MDA7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIGNvbnN0IGNyZWF0ZWRBdCA9IG5ldyBEYXRlKCk7XG4gICAgY29uc3QgdGFyZ2V0RGlyID0gY2xlYW5EaXIocmVxLmRpcikgfHwgZGVwcy5zZXR0aW5ncy5kZWZhdWx0RGlyO1xuICAgIGNvbnN0IG1ldGEgPSBub3JtYWxpemVDbGlwTWV0YShyZXEubWV0YSwge1xuICAgICAgdGl0bGUsXG4gICAgICB1cmwsXG4gICAgICB0ZXh0OiByYXdUZXh0IHx8IGJvZHlNYXJrZG93biB8fCB0ZXh0LFxuICAgICAgZGVzY3JpcHRpb24sXG4gICAgICBkaXI6IHRhcmdldERpcixcbiAgICAgIGRhdGU6IGZvcm1hdERhdGUoY3JlYXRlZEF0KSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGNvbnRlbnRJbnB1dCA9IHtcbiAgICAgIHRpdGxlLFxuICAgICAgdXJsLFxuICAgICAgdGV4dCxcbiAgICAgIHJhd1RleHQsXG4gICAgICBib2R5TWFya2Rvd24sXG4gICAgICBkZXNjcmlwdGlvbixcbiAgICAgIGRpcjogdGFyZ2V0RGlyLFxuICAgICAgbWV0YSxcbiAgICAgIHNvdXJjZUtpbmQsXG4gICAgICBkYXRlOiBmb3JtYXREYXRlKGNyZWF0ZWRBdCksXG4gICAgICBjcmVhdGVkQXQ6IGNyZWF0ZWRBdC50b0lTT1N0cmluZygpLFxuICAgIH07XG5cbiAgICBpZiAoYXBwZW5kUGF0aCkge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZGVwcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGFwcGVuZFBhdGgpO1xuICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgVEZpbGUpKSB7XG4gICAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoYFx1ODg2NVx1NTE0NVx1NzZFRVx1NjgwN1x1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYxQSR7YXBwZW5kUGF0aH1gKSBhcyBFcnJvciAmIHsgY29kZTogc3RyaW5nOyBzdGF0dXM6IG51bWJlciB9O1xuICAgICAgICBlLmNvZGUgPSAnQVBQRU5EX1RBUkdFVF9OT1RfRk9VTkQnO1xuICAgICAgICBlLnN0YXR1cyA9IDQwNDtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGN1cnJlbnQgPSBhd2FpdCBkZXBzLmFwcC52YXVsdC5yZWFkKHRhcmdldCk7XG4gICAgICBjb25zdCBhcHBlbmRpeCA9IGJ1aWxkQXBwZW5kTWFya2Rvd24oY29udGVudElucHV0KTtcbiAgICAgIGF3YWl0IGRlcHMuYXBwLnZhdWx0Lm1vZGlmeSh0YXJnZXQsIGAke2N1cnJlbnQucmVwbGFjZSgvXFxzKiQvLCAnJyl9XFxuXFxuJHthcHBlbmRpeH1cXG5gKTtcbiAgICAgIGRlcHMubm90aWNlKGBcdUQ4M0RcdURDREQgXHU1REYyXHU4ODY1XHU1MTQ1XHU1MjMwICR7YXBwZW5kUGF0aH1gKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9rOiB0cnVlLFxuICAgICAgICBwYXRoOiB0YXJnZXQucGF0aCxcbiAgICAgICAgZmlsZW5hbWU6IHRhcmdldC5uYW1lLFxuICAgICAgICBhY3Rpb246ICd1cGRhdGVkJyxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgYXdhaXQgZW5zdXJlRm9sZGVyKGRlcHMuYXBwLCB0YXJnZXREaXIpO1xuXG4gICAgY29uc3QgZmlsZW5hbWUgPSBtYWtlRmlsZW5hbWUodGl0bGUpO1xuICAgIGxldCBmaW5hbFBhdGggPSBtYWtlUGF0aCh0YXJnZXREaXIsIGZpbGVuYW1lKTtcbiAgICBjb25zdCBleGlzdGluZyA9IGRlcHMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChmaW5hbFBhdGgpO1xuICAgIGlmIChleGlzdGluZyBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICBmaW5hbFBhdGggPSBtYWtlUGF0aCh0YXJnZXREaXIsIGAke2ZpbGVuYW1lLnJlcGxhY2UoL1xcLm1kJC8sICcnKX0tJHtEYXRlLm5vdygpLnRvU3RyaW5nKDM2KX0ubWRgKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50ID0gYnVpbGRDbGlwTWFya2Rvd24oY29udGVudElucHV0KTtcblxuICAgIGF3YWl0IGRlcHMuYXBwLnZhdWx0LmNyZWF0ZShmaW5hbFBhdGgsIGNvbnRlbnQpO1xuICAgIGRlcHMubm90aWNlKGBcdUQ4M0RcdURDQ0UgXHU1REYyXHU1MjZBXHU1QjU4ICR7dGl0bGV9YCk7XG5cbiAgICBpZiAoZGVwcy5zZXR0aW5ncy5hdXRvUmVuYW1lKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBhc3NpZ25FbmNvZGluZyhkZXBzLmFwcCwgZmluYWxQYXRoLCB0YXJnZXREaXIpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignW3N5bmMvY2xpcF0gYXV0by1yZW5hbWUgZmFpbGVkOicsIGVycik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG9rOiB0cnVlLFxuICAgICAgcGF0aDogZmluYWxQYXRoLFxuICAgICAgZmlsZW5hbWU6IGZpbmFsUGF0aC5zcGxpdCgnLycpLnBvcCgpID8/IGZpbGVuYW1lLFxuICAgICAgYWN0aW9uOiAnY3JlYXRlZCcsXG4gICAgfTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRDbGlwTWFya2Rvd24oaW5wdXQ6IHtcbiAgdGl0bGU6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG4gIHRleHQ6IHN0cmluZztcbiAgcmF3VGV4dDogc3RyaW5nO1xuICBib2R5TWFya2Rvd246IHN0cmluZztcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgZGlyOiBzdHJpbmc7XG4gIG1ldGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBzb3VyY2VLaW5kOiBzdHJpbmc7XG4gIGRhdGU6IHN0cmluZztcbiAgY3JlYXRlZEF0OiBzdHJpbmc7XG59KTogc3RyaW5nIHtcbiAgY29uc3QgYm9keUNvbnRlbnQgPSBub3JtYWxpemVNYXJrZG93bkJvZHkoaW5wdXQuYm9keU1hcmtkb3duIHx8IGlucHV0LnJhd1RleHQgfHwgaW5wdXQudGV4dCB8fCBpbnB1dC5kZXNjcmlwdGlvbik7XG4gIGNvbnN0IGJvZHkgPSBbXG4gICAgYCMgJHtpbnB1dC50aXRsZX1gLFxuICAgICcnLFxuICAgIGlucHV0LnVybCA/IGA+IFx1Njc2NVx1NkU5MFx1RkYxQSR7aW5wdXQudXJsfWAgOiAnJyxcbiAgICBgPiBcdTdDN0JcdTU3OEJcdUZGMUEke2lucHV0LnNvdXJjZUtpbmR9YCxcbiAgICBgPiBcdTUyNkFcdTVCNThcdTY1RjZcdTk1RjRcdUZGMUEke2lucHV0LmNyZWF0ZWRBdH1gLFxuICAgICcnLFxuICAgIGJvZHlDb250ZW50LFxuICAgICcnLFxuICBdLmZpbHRlcigobGluZSwgaW5kZXgsIGFycikgPT4gbGluZSB8fCBhcnJbaW5kZXggLSAxXSAhPT0gJycpLmpvaW4oJ1xcbicpO1xuXG4gIHJldHVybiBhc3NlbWJsZUZpbGUoaW5wdXQubWV0YSwgYm9keSk7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQXBwZW5kTWFya2Rvd24oaW5wdXQ6IHtcbiAgdGl0bGU6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG4gIHRleHQ6IHN0cmluZztcbiAgcmF3VGV4dDogc3RyaW5nO1xuICBib2R5TWFya2Rvd246IHN0cmluZztcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgc291cmNlS2luZDogc3RyaW5nO1xuICBjcmVhdGVkQXQ6IHN0cmluZztcbn0pOiBzdHJpbmcge1xuICBjb25zdCBib2R5Q29udGVudCA9IG5vcm1hbGl6ZU1hcmtkb3duQm9keShpbnB1dC5ib2R5TWFya2Rvd24gfHwgaW5wdXQucmF3VGV4dCB8fCBpbnB1dC50ZXh0IHx8IGlucHV0LmRlc2NyaXB0aW9uKTtcbiAgcmV0dXJuIFtcbiAgICBgIyMgJHtpbnB1dC50aXRsZX1gLFxuICAgICcnLFxuICAgIGlucHV0LnVybCA/IGA+IFx1Njc2NVx1NkU5MFx1RkYxQSR7aW5wdXQudXJsfWAgOiAnJyxcbiAgICBgPiBcdTdDN0JcdTU3OEJcdUZGMUEke2lucHV0LnNvdXJjZUtpbmR9YCxcbiAgICBgPiBcdTg4NjVcdTUxNDVcdTY1RjZcdTk1RjRcdUZGMUEke2lucHV0LmNyZWF0ZWRBdH1gLFxuICAgICcnLFxuICAgIGJvZHlDb250ZW50LFxuICBdLmZpbHRlcigobGluZSwgaW5kZXgsIGFycikgPT4gbGluZSB8fCBhcnJbaW5kZXggLSAxXSAhPT0gJycpLmpvaW4oJ1xcbicpO1xufVxuXG5mdW5jdGlvbiBjbGVhblRleHQodmFsdWU6IHVua25vd24pOiBzdHJpbmcge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlLnRyaW0oKSA6ICcnO1xufVxuXG5mdW5jdGlvbiBjbGVhbkRpcih2YWx1ZTogdW5rbm93bik6IHN0cmluZyB7XG4gIHJldHVybiBjbGVhblRleHQodmFsdWUpLnJlcGxhY2UoL15cXC8rfFxcLyskL2csICcnKTtcbn1cblxuZnVuY3Rpb24gY2xlYW5QYXRoKHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHtcbiAgY29uc3QgcmF3ID0gY2xlYW5EaXIodmFsdWUpO1xuICBpZiAoIXJhdykgcmV0dXJuICcnO1xuICByZXR1cm4gcmF3LmVuZHNXaXRoKCcubWQnKSA/IHJhdyA6IGAke3Jhd30ubWRgO1xufVxuXG5mdW5jdGlvbiBmb3JtYXREYXRlKGRhdGU6IERhdGUpOiBzdHJpbmcge1xuICByZXR1cm4gZGF0ZS50b0lTT1N0cmluZygpLnNsaWNlKDAsIDEwKTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlWWFtbCh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJykucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpLnJlcGxhY2UoL1xcbisvZywgJyAnKS50cmltKCk7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUNsaXBNZXRhKG1ldGE6IHVua25vd24sIGZhbGxiYWNrOiB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIGRpcjogc3RyaW5nO1xuICBkYXRlOiBzdHJpbmc7XG59KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICBjb25zdCBpbnB1dCA9IG1ldGEgJiYgdHlwZW9mIG1ldGEgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KG1ldGEpID8gbWV0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA6IHt9O1xuICBjb25zdCBzY29yZSA9IG5vcm1hbGl6ZVNjb3JlKGlucHV0Llx1OEJDNFx1NTIwNik7XG4gIGNvbnN0IG91dDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7XG4gICAgXHU2ODA3XHU3QjdFOiBub3JtYWxpemVUYWcoaW5wdXQuXHU2ODA3XHU3QjdFKSxcbiAgICBcdTdGMTZcdTc4MDE6ICcnLFxuICAgIFx1OEY5M1x1NTE2NTogY2xlYW5UZXh0KGlucHV0Llx1OEY5M1x1NTE2NSkgfHwgZmFsbGJhY2suZGlyIHx8IGZhbGxiYWNrLnVybCxcbiAgICBcdTY1RTVcdTY3MUY6IG5vcm1hbGl6ZURhdGUoaW5wdXQuXHU2NUU1XHU2NzFGLCBmYWxsYmFjay5kYXRlKSxcbiAgICBcdTY1RTVcdTY3MUZcdTdEMjJcdTVGMTU6IG5vcm1hbGl6ZUxpc3QoaW5wdXQuXHU2NUU1XHU2NzFGXHU3RDIyXHU1RjE1KSxcbiAgICBcdTUxNzNcdTk1MkVcdThCQ0Q6IGNsZWFuVGV4dChpbnB1dC5cdTUxNzNcdTk1MkVcdThCQ0QpIHx8IGRyYWZ0S2V5d29yZHMoYCR7ZmFsbGJhY2sudGl0bGV9ICR7ZmFsbGJhY2suZGVzY3JpcHRpb259ICR7ZmFsbGJhY2sudGV4dH1gKSxcbiAgICBcdTY5ODJcdThGRjA6IGNsZWFuVGV4dChpbnB1dC5cdTY5ODJcdThGRjApIHx8IGZhbGxiYWNrLmRlc2NyaXB0aW9uIHx8IGBcdTRFQ0VcdTdGNTFcdTk4NzVcdTUyNkFcdTVCNThcdTVFNzZcdThGNkNcdTYzNjJcdUZGMUEke2ZhbGxiYWNrLnRpdGxlfWAsXG4gICAgXHU4QkM0XHU1MjA2OiBzY29yZSxcbiAgICBcdThCQzRcdTUyMDZfXHU2NjNFXHU3OTNBOiBjbGVhblRleHQoaW5wdXQuXHU4QkM0XHU1MjA2X1x1NjYzRVx1NzkzQSkgfHwgc2NvcmVMYWJlbChzY29yZSksXG4gICAgXHU3RDIyXHU1RjE1X1x1NzdFNVx1OEJDNlx1NUU5MzogY2xlYW5UZXh0KGlucHV0Llx1N0QyMlx1NUYxNV9cdTc3RTVcdThCQzZcdTVFOTMpLFxuICAgIFx1N0QyMlx1NUYxNV9cdTk4OUNcdTgyNzI6IGNsZWFuVGV4dChpbnB1dC5cdTdEMjJcdTVGMTVfXHU5ODlDXHU4MjcyKSxcbiAgICAnXHU3RDIyXHU1RjE1X1x1NjRDRFx1NEY1QyZcdTUzQ0RcdTk5ODgnOiBub3JtYWxpemVMaXN0KGlucHV0WydcdTdEMjJcdTVGMTVfXHU2NENEXHU0RjVDJlx1NTNDRFx1OTk4OCddKSxcbiAgICBcdTdEMjJcdTVGMTVfXHU1NzU3OiBub3JtYWxpemVMaXN0KGlucHV0Llx1N0QyMlx1NUYxNV9cdTU3NTcpLFxuICAgIFx1N0QyMlx1NUYxNV9cdTk4Q0VcdTk2Njk6IG5vcm1hbGl6ZUxpc3QoaW5wdXQuXHU3RDIyXHU1RjE1X1x1OThDRVx1OTY2OSksXG4gIH07XG4gIGlmICghb3V0Llx1NTE3M1x1OTUyRVx1OEJDRCkgb3V0Llx1NTE3M1x1OTUyRVx1OEJDRCA9ICdcdTdGNTFcdTk4NzVcdTUyNkFcdTVCNTgnO1xuICBpZiAoIW91dC5cdTY5ODJcdThGRjApIG91dC5cdTY5ODJcdThGRjAgPSBgXHU3RjUxXHU5ODc1XHU1MjZBXHU1QjU4XHVGRjFBJHtmYWxsYmFjay50aXRsZX1gO1xuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVUYWcodmFsdWU6IHVua25vd24pOiBzdHJpbmcge1xuICBjb25zdCByYXcgPSBjbGVhblRleHQodmFsdWUpO1xuICByZXR1cm4gcmF3Lm1hdGNoKC9eW1NYTFpRSl0kLykgPyByYXcgOiByYXcubWF0Y2goLyhbU1hMWlFKXSkoPzpffCQpLyk/LlsxXSB8fCAnUyc7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZURhdGUodmFsdWU6IHVua25vd24sIGZhbGxiYWNrOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCByYXcgPSBjbGVhblRleHQodmFsdWUpLnJlcGxhY2UoL1xcLy9nLCAnLScpO1xuICByZXR1cm4gL15cXGR7NH0tXFxkezJ9LVxcZHsyfSQvLnRlc3QocmF3KSA/IHJhdyA6IGZhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVTY29yZSh2YWx1ZTogdW5rbm93bik6IG51bWJlciB7XG4gIGNvbnN0IHJhdyA9IGNsZWFuVGV4dCh2YWx1ZSk7XG4gIGNvbnN0IGV4cGxpY2l0ID0gcmF3Lm1hdGNoKC9bMS01XS8pPy5bMF07XG4gIGlmIChleHBsaWNpdCkgcmV0dXJuIE51bWJlcihleHBsaWNpdCk7XG4gIGNvbnN0IHN0YXJzID0gQXJyYXkuZnJvbShyYXcubWF0Y2hBbGwoL1x1RDgzQ1x1REYxRi9nKSkubGVuZ3RoO1xuICByZXR1cm4gc3RhcnMgPiAwID8gTWF0aC5taW4oc3RhcnMsIDUpIDogMTtcbn1cblxuZnVuY3Rpb24gc2NvcmVMYWJlbChzY29yZTogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIFsnXHVEODNDXHVERjFGXHUwMEI3XHU3RDIwXHU2NzUwJywgJ1x1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1MDBCN1x1NjU3NFx1NzQwNicsICdcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdUQ4M0NcdURGMUZcdTAwQjdcdTVCOUVcdThERjUnLCAnXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHVEODNDXHVERjFGXHUwMEI3XHU5MDFBXHU3NTI4JywgJ1x1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1RDgzQ1x1REYxRlx1MDBCN1x1NEY1M1x1N0NGQiddW01hdGgubWF4KDEsIE1hdGgubWluKHNjb3JlLCA1KSkgLSAxXTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplTGlzdCh2YWx1ZTogdW5rbm93bik6IHN0cmluZ1tdIHtcbiAgY29uc3Qgc291cmNlID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IGNsZWFuVGV4dCh2YWx1ZSkuc3BsaXQoL1tcXG4sXHVGRjBDXHUzMDAxXS8pO1xuICByZXR1cm4gc291cmNlLm1hcCgoaXRlbSkgPT4gY2xlYW5UZXh0KGl0ZW0pKS5maWx0ZXIoQm9vbGVhbik7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZU1hcmtkb3duQm9keSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgdGV4dCA9IHZhbHVlLnRyaW0oKTtcbiAgaWYgKCF0ZXh0KSByZXR1cm4gJ1x1RkYwOFx1NjVFMFx1NTNFRlx1ODlDMVx1NkI2M1x1NjU4N1x1RkYwQ1x1NURGMlx1NEZERFx1NUI1OFx1OTg3NVx1OTc2Mlx1NjgwN1x1OTg5OFx1NTQ4Q1x1Njc2NVx1NkU5MFx1MzAwMlx1RkYwOSc7XG4gIHJldHVybiB0ZXh0O1xufVxuXG5mdW5jdGlvbiBkcmFmdEtleXdvcmRzKHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHdvcmRzID0gQXJyYXkuZnJvbShuZXcgU2V0KFxuICAgIHRleHRcbiAgICAgIC5yZXBsYWNlKC9bXlxccHtTY3JpcHQ9SGFufVxccHtMZXR0ZXJ9XFxwe051bWJlcn1cXHNfLV0vZ3UsICcgJylcbiAgICAgIC5zcGxpdCgvXFxzKy8pXG4gICAgICAubWFwKCh3b3JkKSA9PiB3b3JkLnRyaW0oKSlcbiAgICAgIC5maWx0ZXIoKHdvcmQpID0+IHdvcmQubGVuZ3RoID49IDIgJiYgd29yZC5sZW5ndGggPD0gMjApLFxuICApKTtcbiAgcmV0dXJuIHdvcmRzLnNsaWNlKDAsIDYpLmpvaW4oJ1x1MzAwMScpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBlbnN1cmVGb2xkZXIoYXBwOiBBcHAsIGRpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmICghZGlyIHx8IGRpciA9PT0gJy4nIHx8IGRpciA9PT0gJy8nKSByZXR1cm47XG4gIGNvbnN0IGV4aXN0aW5nID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChkaXIpO1xuICBpZiAoZXhpc3RpbmcgaW5zdGFuY2VvZiBURm9sZGVyKSByZXR1cm47XG4gIGNvbnN0IHBhcmVudCA9IGRpci5zcGxpdCgnLycpLnNsaWNlKDAsIC0xKS5qb2luKCcvJyk7XG4gIGlmIChwYXJlbnQpIGF3YWl0IGVuc3VyZUZvbGRlcihhcHAsIHBhcmVudCk7XG4gIHRyeSB7XG4gICAgYXdhaXQgYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihkaXIpO1xuICB9IGNhdGNoIHtcbiAgICAvLyBcdTVERjJcdTVCNThcdTU3MjhcdTYyMTZcdTc1MzFcdTUxNzZcdTRFRDZcdTZENDFcdTdBMEJcdTUyMUFcdTUyMUJcdTVFRkFcdTY1RjZcdTVGRkRcdTc1NjVcdTMwMDJcbiAgfVxufVxuIiwgIi8qKlxuICogUE9TVCAvZXhpc3RzIFx1MjAxNCBcdTY4QzBcdTY3RTUgbm9kZV90b2tlbiBcdTY2MkZcdTU0MjZcdTVERjJcdTU0MENcdTZCNjVcdThGQzdcdTMwMDJcbiAqL1xuaW1wb3J0IHR5cGUgeyBFeGlzdHNSZXF1ZXN0LCBFeGlzdHNSZXNwb25zZSB9IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQgdHlwZSB7IEFwcCwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IFJlcXVlc3RDb250ZXh0IH0gZnJvbSAnLi4vc2VydmVyLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV4aXN0c0hhbmRsZXIoYXBwOiBBcHApIHtcbiAgcmV0dXJuIGFzeW5jIChjdHg6IFJlcXVlc3RDb250ZXh0KTogUHJvbWlzZTxFeGlzdHNSZXNwb25zZT4gPT4ge1xuICAgIGNvbnN0IHJlcSA9IGN0eC5ib2R5IGFzIEV4aXN0c1JlcXVlc3Q7XG4gICAgaWYgKCFyZXE/Lm5vZGVfdG9rZW4pIHtcbiAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoJ25vZGVfdG9rZW4gaXMgcmVxdWlyZWQnKSBhcyBFcnJvciAmIHsgY29kZTogc3RyaW5nOyBzdGF0dXM6IG51bWJlciB9O1xuICAgICAgZS5jb2RlID0gJ01JU1NJTkdfVE9LRU4nO1xuICAgICAgZS5zdGF0dXMgPSA0MDA7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBmaW5kQnlGZWlzaHVJZChhcHAsIHJlcS5ub2RlX3Rva2VuKTtcbiAgICByZXR1cm4ge1xuICAgICAgb2s6IHRydWUsXG4gICAgICBleGlzdHM6ICEhZmlsZSxcbiAgICAgIHBhdGg6IGZpbGU/LnBhdGgsXG4gICAgfTtcbiAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZmluZEJ5RmVpc2h1SWQoYXBwOiBBcHAsIGZlaXNodUlkOiBzdHJpbmcpOiBQcm9taXNlPFRGaWxlIHwgbnVsbD4ge1xuICBjb25zdCBmaWxlcyA9IGFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XG4gIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgIGlmIChmaWxlLnBhdGguc3RhcnRzV2l0aCgnLm9ic2lkaWFuJykgfHwgZmlsZS5wYXRoLnN0YXJ0c1dpdGgoJy5mZWlzaHUtc3luYycpKSBjb250aW51ZTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgaWYgKCFjb250ZW50LmluY2x1ZGVzKCdmZWlzaHVfaWQ6JykpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgZm1NYXRjaCA9IGNvbnRlbnQubWF0Y2goL14tLS1cXG4oW1xcc1xcU10qPylcXG4tLS0vKTtcbiAgICAgIGlmICghZm1NYXRjaCkgY29udGludWU7XG4gICAgICBjb25zdCBpZE1hdGNoID0gZm1NYXRjaFsxXS5tYXRjaCgvZmVpc2h1X2lkOlxccypbXCInXT8oW0EtWmEtejAtOV0rKS8pO1xuICAgICAgaWYgKGlkTWF0Y2ggJiYgaWRNYXRjaFsxXSA9PT0gZmVpc2h1SWQpIHJldHVybiBmaWxlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuIiwgIi8qKlxuICogUE9TVCAvcHVzaGJhY2sgXHUyMDE0IE9CXHUyMTkyXHU5OERFXHU0RTY2XHU1NkRFXHU1MTk5XHUzMDAyXG4gKlxuICogXHU0RjlEXHU2MzZFIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgIFx1MDBBNzYuMlx1RkYxQVxuICogMS4gXHU4QkZCIC5tZCBcdTc2ODQgWUFNTFx1RkYwQ1x1NjJGRiBmZWlzaHVfZG9jX2lkICsgc3luY19oYXNoXG4gKiAyLiBcdThCQTFcdTdCOTdcdTVGNTNcdTUyNERcdTUxODVcdTVCQjkgaGFzaFx1RkYwQ1x1NkJENFx1NUJGOSBzeW5jX2hhc2hcbiAqICAgIFx1MjUxQyBcdTRFMDBcdTgxRjQgXHUyMTkyIFx1OERGM1x1OEZDN1x1RkYwOFx1NjVFMFx1NTNEOFx1NTMxNlx1RkYwOVxuICogICAgXHUyNTE0IFx1NEUwRFx1NEUwMFx1ODFGNCBcdTIxOTIgXHU3RUU3XHU3RUVEXG4gKiAzLiBcdTg5RTNcdTY3OTBcdTZCNjNcdTY1ODcgbWQgKyBZQU1MXG4gKiA0LiBZQU1MIFx1NUI1N1x1NkJCNSBcdTIxOTIgY2FsbG91dCBYTUwgXHU3MjQ3XHU2QkI1XHVGRjA4XHU2NTg3XHU2ODYzXHU1OTM0XHVGRjA5XG4gKiA1LiBcdTU2RkVcdTcyNDcgZmVpc2h1Oi8vdG9rZW4gXHUyMTkyIFx1OThERVx1NEU2NiA8aW1nIHNyYz1cIlRPS0VOXCIvPlxuICogNi4gXHU3RUM0XHU4OEM1XHU2NzAwXHU3RUM4XHU1MTg1XHU1QkI5ID0gW2NhbGxvdXQgWE1MXSArIFtcdTZCNjNcdTY1ODcgbWRdXG4gKiA3LiBcdThDMDMgbGFyay1jbGkgZG9jcyArdXBkYXRlIG92ZXJ3cml0ZVx1RkYwOFhNTCBcdTY4M0NcdTVGMEZcdUZGMDlcbiAqIDguIFx1NjgwN1x1OTg5OFx1NTQwQ1x1NkI2NVx1RkYwOFx1NURGMlx1NTcyOCBvdmVyd3JpdGUgXHU2NUY2XHU0RkVFXHU1OTBEXHVGRjA5XG4gKiA5LiBcdTY2RjRcdTY1QjAgc3luY19oYXNoICsgc3luY190aW1lXG4gKi9cbmltcG9ydCB0eXBlIHsgUHVzaGJhY2tSZXF1ZXN0LCBQdXNoYmFja1Jlc3BvbnNlIH0gZnJvbSAnQHN5bmMvc2hhcmVkJztcbmltcG9ydCB7XG4gIG1ldGFUb0NhbGxvdXRYbWwsXG4gIGZlaXNodVByb3RvVG9YbWwsXG4gIGNvbnZlcnRPQkNhbGxvdXRzVG9GZWlzaHUsXG4gIGJvZHlIYXNoLFxuICBpc0NoYW5nZWQsXG59IGZyb20gJ0BzeW5jL3NoYXJlZCc7XG5pbXBvcnQgdHlwZSB7IEFwcCwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IFJlcXVlc3RDb250ZXh0IH0gZnJvbSAnLi4vc2VydmVyLmpzJztcbmltcG9ydCB0eXBlIHsgRmVpc2h1U3luY1NldHRpbmdzIH0gZnJvbSAnLi4vc2V0dGluZ3MuanMnO1xuaW1wb3J0IHsgb3ZlcndyaXRlRG9jWG1sLCBnZXRXaWtpTm9kZUluZm8gfSBmcm9tICcuLi9sYXJrL2NsaS5qcyc7XG5pbXBvcnQgeyBwYXJzZUZpbGUsIGFzc2VtYmxlTWQgfSBmcm9tICcuLi9maWxlaW8vd3JpdGVyLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBQdXNoYmFja0RlcHMge1xuICBhcHA6IEFwcDtcbiAgc2V0dGluZ3M6IEZlaXNodVN5bmNTZXR0aW5ncztcbiAgbm90aWNlOiAobXNnOiBzdHJpbmcpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQdXNoYmFja0hhbmRsZXIoZGVwczogUHVzaGJhY2tEZXBzKSB7XG4gIHJldHVybiBhc3luYyAoY3R4OiBSZXF1ZXN0Q29udGV4dCk6IFByb21pc2U8UHVzaGJhY2tSZXNwb25zZT4gPT4ge1xuICAgIGNvbnN0IHJlcSA9IGN0eC5ib2R5IGFzIFB1c2hiYWNrUmVxdWVzdDtcblxuICAgIC8vIFx1NUI5QVx1NEY0RFx1NjU4N1x1NEVGNlxuICAgIGxldCBmaWxlOiBURmlsZSB8IG51bGwgPSBudWxsO1xuICAgIGlmIChyZXEucGF0aCkge1xuICAgICAgY29uc3QgZiA9IGRlcHMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChyZXEucGF0aCk7XG4gICAgICBpZiAoZiBpbnN0YW5jZW9mIFRGaWxlKSBmaWxlID0gZjtcbiAgICB9IGVsc2UgaWYgKHJlcS5ub2RlX3Rva2VuKSB7XG4gICAgICBmaWxlID0gYXdhaXQgZmluZEJ5RmVpc2h1SWQoZGVwcy5hcHAsIHJlcS5ub2RlX3Rva2VuKTtcbiAgICB9XG5cbiAgICBpZiAoIWZpbGUpIHtcbiAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoJ0ZpbGUgbm90IGZvdW5kJykgYXMgRXJyb3IgJiB7IGNvZGU6IHN0cmluZzsgc3RhdHVzOiBudW1iZXIgfTtcbiAgICAgIGUuY29kZSA9ICdOT1RfRk9VTkQnO1xuICAgICAgZS5zdGF0dXMgPSA0MDQ7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBkZXBzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlRmlsZShjb250ZW50KTtcblxuICAgIGNvbnN0IGZlaXNodURvY0lkID0gcGFyc2VkLmZyb250bWF0dGVyLmZlaXNodV9kb2NfaWQgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGZlaXNodUlkID0gcGFyc2VkLmZyb250bWF0dGVyLmZlaXNodV9pZCBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgZmVpc2h1VGl0bGUgPSBwYXJzZWQuZnJvbnRtYXR0ZXIuZmVpc2h1X3RpdGxlIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgIC8vIFx1ODlFM1x1Njc5MFx1NTZERVx1NTE5OVx1NzUyOFx1NzY4NCBkb2NUb2tlblx1RkYwOFx1NUZDNVx1OTg3Qlx1NjYyRiBkb2N4IG9ial90b2tlblx1RkYwQ25vZGVfdG9rZW4gXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU3NTI4XHU0RThFIGRvY3MgK3VwZGF0ZVx1RkYwOVxuICAgIGxldCBkb2NUb2tlbiA9IGZlaXNodURvY0lkO1xuICAgIGlmICghZG9jVG9rZW4gJiYgZmVpc2h1SWQpIHtcbiAgICAgIC8vIGZlaXNodV9kb2NfaWQgXHU3RjNBXHU1OTMxXHVGRjFBXHU3NTI4IHdpa2kgK25vZGUtZ2V0IFx1NjI4QSBub2RlX3Rva2VuIFx1ODlFM1x1Njc5MFx1NjIxMCBvYmpfdG9rZW5cbiAgICAgIGRlcHMubm90aWNlKCdcdUQ4M0RcdUREMTcgXHU4OUUzXHU2NzkwXHU2NTg3XHU2ODYzIHRva2VuLi4uJyk7XG4gICAgICBjb25zdCBpbmZvID0gZ2V0V2lraU5vZGVJbmZvKGZlaXNodUlkLCBkZXBzLnNldHRpbmdzLnNwYWNlSWQpO1xuICAgICAgZG9jVG9rZW4gPSBpbmZvPy5vYmpfdG9rZW47XG4gICAgICBpZiAoIWRvY1Rva2VuKSB7XG4gICAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoYFx1NjVFMFx1NkNENVx1ODlFM1x1Njc5MCBvYmpfdG9rZW5cdUZGMDhub2RlX3Rva2VuPSR7ZmVpc2h1SWQuc2xpY2UoMCwgOCl9Li4uXHVGRjBDXHU2OEMwXHU2N0U1IHNwYWNlX2lkIFx1OEJCRVx1N0Y2RVx1RkYwOWApIGFzIEVycm9yICYgeyBjb2RlOiBzdHJpbmc7IHN0YXR1czogbnVtYmVyIH07XG4gICAgICAgIGUuY29kZSA9ICdUT0tFTl9SRVNPTFZFX0ZBSUxFRCc7XG4gICAgICAgIGUuc3RhdHVzID0gNDAwO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgICAgLy8gXHU1NkRFXHU1MTk5IGZlaXNodV9kb2NfaWQgXHU4RkRCIGZyb250bWF0dGVyXHVGRjA4XHU0RTBCXHU2QjIxXHU0RTBEXHU3NTI4XHU1MThEXHU4OUUzXHU2NzkwXHVGRjA5XG4gICAgICBwYXJzZWQuZnJvbnRtYXR0ZXIuZmVpc2h1X2RvY19pZCA9IGRvY1Rva2VuO1xuICAgIH1cbiAgICBpZiAoIWRvY1Rva2VuKSB7XG4gICAgICBjb25zdCBlID0gbmV3IEVycm9yKCdObyBmZWlzaHUgYmluZGluZyBpbiBmcm9udG1hdHRlcicpIGFzIEVycm9yICYgeyBjb2RlOiBzdHJpbmc7IHN0YXR1czogbnVtYmVyIH07XG4gICAgICBlLmNvZGUgPSAnTk9fQklORElORyc7XG4gICAgICBlLnN0YXR1cyA9IDQwMDtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICAgIGNvbnN0IHRpdGxlID0gZmVpc2h1VGl0bGUgfHwgZmlsZS5iYXNlbmFtZTtcblxuICAgIC8vIFx1NkI2NVx1OUFBNCAyXHVGRjFBaGFzaCBcdTZCRDRcdTVCRjlcbiAgICBpZiAoIXJlcS5mb3JjZSAmJiAhaXNDaGFuZ2VkKHBhcnNlZC5oYXNoLCBwYXJzZWQuZnJvbnRtYXR0ZXIuc3luY19oYXNoIGFzIHN0cmluZyB8IHVuZGVmaW5lZCkpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9rOiB0cnVlLFxuICAgICAgICBhY3Rpb246ICdza2lwcGVkJyxcbiAgICAgICAgaGFzaDogcGFyc2VkLmhhc2gsXG4gICAgICAgIHRpdGxlLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBkZXBzLm5vdGljZShgXHUyQjA2IFx1NTZERVx1NTE5OVx1OThERVx1NEU2NiAke2ZpbGUubmFtZX0uLi5gKTtcblxuICAgIC8vIFx1NkI2NVx1OUFBNCAzLTZcdUZGMUFcdTdFQzRcdTg4QzVcdTY3MDBcdTdFQzggWE1MIFx1NTE4NVx1NUJCOVxuICAgIGNvbnN0IGZpbmFsQ29udGVudCA9IGJ1aWxkUHVzaGJhY2tDb250ZW50KHBhcnNlZCk7XG5cbiAgICAvLyBcdTZCNjVcdTlBQTQgNy04XHVGRjFBb3ZlcndyaXRlICsgXHU2ODA3XHU5ODk4XHU0RkVFXHU1OTBEXG4gICAgb3ZlcndyaXRlRG9jWG1sKGRvY1Rva2VuLCBmaW5hbENvbnRlbnQsIHRpdGxlKTtcblxuICAgIC8vIFx1NkI2NVx1OUFBNCA5XHVGRjFBXHU2NkY0XHU2NUIwIHN5bmNfaGFzaCArIHN5bmNfdGltZVxuICAgIGNvbnN0IHN5bmNUaW1lID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgIGNvbnN0IHVwZGF0ZWRGbSA9IHtcbiAgICAgIC4uLnBhcnNlZC5mcm9udG1hdHRlcixcbiAgICAgIHN5bmNfaGFzaDogcGFyc2VkLmhhc2gsXG4gICAgICBzeW5jX3RpbWU6IHN5bmNUaW1lLFxuICAgIH07XG4gICAgY29uc3QgbmV3Q29udGVudCA9IGFzc2VtYmxlTWQodXBkYXRlZEZtIGFzIG5ldmVyLCBwYXJzZWQuYm9keSk7XG4gICAgYXdhaXQgZGVwcy5hcHAudmF1bHQubW9kaWZ5KGZpbGUsIG5ld0NvbnRlbnQpO1xuXG4gICAgZGVwcy5ub3RpY2UoYFx1MjcwNSBcdTVERjJcdTU2REVcdTUxOTkgJHt0aXRsZX1gKTtcblxuICAgIHJldHVybiB7XG4gICAgICBvazogdHJ1ZSxcbiAgICAgIGFjdGlvbjogJ3B1c2hlZCcsXG4gICAgICBoYXNoOiBwYXJzZWQuaGFzaCxcbiAgICAgIHRpdGxlLFxuICAgIH07XG4gIH07XG59XG5cbi8qKlxuICogXHU3RUM0XHU4OEM1XHU1NkRFXHU1MTk5XHU5OERFXHU0RTY2XHU3Njg0XHU2NzAwXHU3RUM4XHU1MTg1XHU1QkI5XHVGRjA4WE1MIFx1NjgzQ1x1NUYwRlx1RkYwOVx1MzAwMlxuICogPSBbWUFNTCBjYWxsb3V0IFx1NEZFMVx1NjA2Rlx1NTc1N10gKyBbXHU2QjYzXHU2NTg3XHVGRjA4XHU1NkZFXHU3MjQ3XHU4RjZDIFhNTFx1MzAwMU9CIGNhbGxvdXQgXHU4RjZDIFhNTFx1RkYwOV1cbiAqL1xuZnVuY3Rpb24gYnVpbGRQdXNoYmFja0NvbnRlbnQocGFyc2VkOiBSZXR1cm5UeXBlPHR5cGVvZiBwYXJzZUZpbGU+KTogc3RyaW5nIHtcbiAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XG5cbiAgLy8gMS4gWUFNTCBcdTUxNDNcdTY1NzBcdTYzNkUgXHUyMTkyIGNhbGxvdXQgXHU0RkUxXHU2MDZGXHU1NzU3XG4gIGNvbnN0IGNhbGxvdXRYbWwgPSBtZXRhVG9DYWxsb3V0WG1sKHBhcnNlZC5mcm9udG1hdHRlcik7XG4gIGlmIChjYWxsb3V0WG1sKSB7XG4gICAgcGFydHMucHVzaChjYWxsb3V0WG1sKTtcbiAgfVxuXG4gIC8vIDIuIFx1NkI2M1x1NjU4N1x1NTkwNFx1NzQwNlxuICBsZXQgYm9keSA9IHBhcnNlZC5ib2R5O1xuXG4gIC8vIDJhLiBcdTU2RkVcdTcyNDcgZmVpc2h1Oi8vdG9rZW4gXHUyMTkyIDxpbWcgc3JjPVwiVE9LRU5cIi8+XG4gIGJvZHkgPSBmZWlzaHVQcm90b1RvWG1sKGJvZHkpO1xuXG4gIC8vIDJiLiBPQiBjYWxsb3V0ID4gWyF0eXBlXSBcdTIxOTIgXHU5OERFXHU0RTY2IGNhbGxvdXQgWE1MXG4gIGJvZHkgPSBjb252ZXJ0T0JDYWxsb3V0c1RvRmVpc2h1KGJvZHkpO1xuXG4gIHBhcnRzLnB1c2goYm9keS50cmltKCkpO1xuXG4gIHJldHVybiBwYXJ0cy5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuXFxuJyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZpbmRCeUZlaXNodUlkKGFwcDogQXBwLCBmZWlzaHVJZDogc3RyaW5nKTogUHJvbWlzZTxURmlsZSB8IG51bGw+IHtcbiAgY29uc3QgZmlsZXMgPSBhcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICBpZiAoZmlsZS5wYXRoLnN0YXJ0c1dpdGgoJy5vYnNpZGlhbicpIHx8IGZpbGUucGF0aC5zdGFydHNXaXRoKCcuZmVpc2h1LXN5bmMnKSkgY29udGludWU7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBhcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgIGlmICghY29udGVudC5pbmNsdWRlcygnZmVpc2h1X2lkOicpKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGZtTWF0Y2ggPSBjb250ZW50Lm1hdGNoKC9eLS0tXFxuKFtcXHNcXFNdKj8pXFxuLS0tLyk7XG4gICAgICBpZiAoIWZtTWF0Y2gpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgaWRNYXRjaCA9IGZtTWF0Y2hbMV0ubWF0Y2goL2ZlaXNodV9pZDpcXHMqW1wiJ10/KFtBLVphLXowLTldKykvKTtcbiAgICAgIGlmIChpZE1hdGNoICYmIGlkTWF0Y2hbMV0gPT09IGZlaXNodUlkKSByZXR1cm4gZmlsZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cbiIsICIvKipcbiAqIFx1NTQ3RFx1NEVFNFx1NjgwRlx1NTQ3RFx1NEVFNFx1MzAwMlx1NEY5RFx1NjM2RVx1NjVCOVx1Njg0OCBcdTAwQTcxMCArIGAwMF9cdTU0MENcdTZCNjVcdTY1QjlcdTY4NDhcdThCQkVcdThCQTFfdjIubWRgXHUzMDAyXG4gKlxuICogLSBcdTU2REVcdTUxOTlcdTVGNTNcdTUyNERcdTY1ODdcdTRFRjZcdTUyMzBcdTk4REVcdTRFNjZcbiAqIC0gXHU2Mjc5XHU5MUNGXHU1NkRFXHU1MTk5XHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XG4gKiAtIFx1NTIzN1x1NjVCMFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFxuICogLSBcdTYyNzlcdTkxQ0ZcdTZFMDVcdTc0MDZcdTVERjJcdTUyMjBcdTk2NjRcbiAqIC0gXHU2NjNFXHU3OTNBL1x1NTkwRFx1NTIzNlx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1xuICogLSBcdTkxQ0RcdTY1QjBcdTUyQTBcdThGN0RcdTYzRDJcdTRFRjZcdUZGMDhcdTkxQ0RcdTU0MkYgSFRUUCBzZXJ2ZXJcdUZGMDlcbiAqL1xuaW1wb3J0IHR5cGUgeyBBcHAsIFRGaWxlIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgTm90aWNlLCBNb2RhbCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgRmVpc2h1U3luY1BsdWdpbiB9IGZyb20gJy4vbWFpbi5qcyc7XG5pbXBvcnQgeyByZWZyZXNoTWFwcGluZywgbG9hZE1hcHBpbmcgfSBmcm9tICcuL21hcHBpbmcuanMnO1xuaW1wb3J0IHsgY3JlYXRlUHVzaGJhY2tIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9wdXNoYmFja0hhbmRsZXIuanMnO1xuaW1wb3J0IHsgYmF0Y2hBc3NpZ25FbmNvZGluZyB9IGZyb20gJy4vYXV0b1JlbmFtZS5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckNvbW1hbmRzKHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbik6IHZvaWQge1xuICBjb25zdCB7IGFwcCwgc2V0dGluZ3MgfSA9IHBsdWdpbjtcblxuICAvLyBcdTU2REVcdTUxOTlcdTVGNTNcdTUyNERcdTY1ODdcdTRFRjZcdTUyMzBcdTk4REVcdTRFNjZcbiAgcGx1Z2luLmFkZENvbW1hbmQoe1xuICAgIGlkOiAncHVzaGJhY2stY3VycmVudCcsXG4gICAgbmFtZTogJ1x1NTZERVx1NTE5OVx1NUY1M1x1NTI0RFx1NjU4N1x1NEVGNlx1NTIzMFx1OThERVx1NEU2NicsXG4gICAgZWRpdG9yQ2FsbGJhY2s6IGFzeW5jIChlZGl0b3IpID0+IHtcbiAgICAgIGNvbnN0IGZpbGUgPSBhcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgICAgIGlmICghKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkgfHwgIWZpbGUucGF0aC5lbmRzV2l0aCgnLm1kJykpIHtcbiAgICAgICAgbmV3IE5vdGljZSgnXHUyNkEwXHVGRTBGIFx1OEJGN1x1NTcyOCBtYXJrZG93biBcdTY1ODdcdTRFRjZcdTRFMkRcdTRGN0ZcdTc1MjhcdTZCNjRcdTU0N0RcdTRFRTQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBoYW5kbGVyID0gY3JlYXRlUHVzaGJhY2tIYW5kbGVyKHtcbiAgICAgICAgYXBwLFxuICAgICAgICBzZXR0aW5ncyxcbiAgICAgICAgbm90aWNlOiAobSkgPT4gbmV3IE5vdGljZShtKSxcbiAgICAgIH0pO1xuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBoYW5kbGVyKHtcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICB1cmw6ICcvcHVzaGJhY2snLFxuICAgICAgICAgIHBhdGg6ICcvcHVzaGJhY2snLFxuICAgICAgICAgIHF1ZXJ5OiBuZXcgVVJMU2VhcmNoUGFyYW1zKCksXG4gICAgICAgICAgYm9keTogeyBwYXRoOiBmaWxlLnBhdGggfSxcbiAgICAgICAgICB0b2tlbjogJycsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0LmFjdGlvbiA9PT0gJ3B1c2hlZCcpIHtcbiAgICAgICAgICBuZXcgTm90aWNlKGBcdTI3MDUgXHU1REYyXHU1NkRFXHU1MTk5XHVGRjFBJHtyZXN1bHQudGl0bGV9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3IE5vdGljZSgnXHUyM0VEIFx1NjVFMFx1NTNEOFx1NTMxNlx1RkYwQ1x1NURGMlx1OERGM1x1OEZDNycpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgbmV3IE5vdGljZShgXHUyNzRDIFx1NTZERVx1NTE5OVx1NTkzMVx1OEQyNVx1RkYxQSR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpfWApO1xuICAgICAgfVxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFx1NjI3OVx1OTFDRlx1NTZERVx1NTE5OVx1NUY1M1x1NTI0RFx1NzZFRVx1NUY1NVxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6ICdwdXNoYmFjay1kaXInLFxuICAgIG5hbWU6ICdcdTYyNzlcdTkxQ0ZcdTU2REVcdTUxOTlcdTVGNTNcdTUyNERcdTc2RUVcdTVGNTVcdTUyMzBcdTk4REVcdTRFNjYnLFxuICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlID0gYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gICAgICBpZiAoIWZpbGUpIHtcbiAgICAgICAgbmV3IE5vdGljZSgnXHUyNkEwXHVGRTBGIFx1OEJGN1x1NTE0OFx1NjI1M1x1NUYwMFx1NEUwMFx1NEUyQVx1NjU4N1x1NEVGNlx1NEVFNVx1Nzg2RVx1NUI5QVx1NzZFRVx1NUY1NScpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBkaXIgPSBmaWxlLnBhcmVudD8ucGF0aDtcbiAgICAgIGlmICghZGlyKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IGZpbGVzID0gYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKS5maWx0ZXIoZiA9PiBmLnBhdGguc3RhcnRzV2l0aChkaXIgKyAnLycpKTtcbiAgICAgIGxldCBwdXNoZWQgPSAwO1xuICAgICAgbGV0IHNraXBwZWQgPSAwO1xuICAgICAgbGV0IGZhaWxlZCA9IDA7XG5cbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBjcmVhdGVQdXNoYmFja0hhbmRsZXIoe1xuICAgICAgICBhcHAsXG4gICAgICAgIHNldHRpbmdzLFxuICAgICAgICBub3RpY2U6ICgpID0+IHt9LFxuICAgICAgfSk7XG5cbiAgICAgIGZvciAoY29uc3QgZiBvZiBmaWxlcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGhhbmRsZXIoe1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6ICcvcHVzaGJhY2snLFxuICAgICAgICAgICAgcGF0aDogJy9wdXNoYmFjaycsXG4gICAgICAgICAgICBxdWVyeTogbmV3IFVSTFNlYXJjaFBhcmFtcygpLFxuICAgICAgICAgICAgYm9keTogeyBwYXRoOiBmLnBhdGggfSxcbiAgICAgICAgICAgIHRva2VuOiAnJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAocmVzdWx0LmFjdGlvbiA9PT0gJ3B1c2hlZCcpIHB1c2hlZCsrO1xuICAgICAgICAgIGVsc2Ugc2tpcHBlZCsrO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICBmYWlsZWQrKztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBuZXcgTm90aWNlKGBcdTJCMDYgXHU2Mjc5XHU5MUNGXHU1NkRFXHU1MTk5XHU1QjhDXHU2MjEwXHVGRjFBXHU2M0E4XHU5MDAxICR7cHVzaGVkfVx1RkYwQ1x1OERGM1x1OEZDNyAke3NraXBwZWR9XHVGRjBDXHU1OTMxXHU4RDI1ICR7ZmFpbGVkfWApO1xuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFx1NjI3OVx1OTFDRlx1NTIwNlx1OTE0RFx1N0YxNlx1NzgwMVx1RkYwOFx1NUY1M1x1NTI0RFx1NzZFRVx1NUY1NVx1RkYwOVxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6ICdhc3NpZ24tZW5jb2RpbmctZGlyJyxcbiAgICBuYW1lOiAnXHU2Mjc5XHU5MUNGXHU1MjA2XHU5MTREXHU3RjE2XHU3ODAxXHVGRjA4XHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XHVGRjA5JyxcbiAgICBjYWxsYmFjazogYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZSA9IGFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuICAgICAgaWYgKCFmaWxlKSB7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1MjZBMFx1RkUwRiBcdThCRjdcdTUxNDhcdTYyNTNcdTVGMDBcdTRFMDBcdTRFMkFcdTY1ODdcdTRFRjZcdTRFRTVcdTc4NkVcdTVCOUFcdTc2RUVcdTVGNTUnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgZGlyID0gZmlsZS5wYXJlbnQ/LnBhdGg7XG4gICAgICBpZiAoIWRpcikgcmV0dXJuO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBiYXRjaEFzc2lnbkVuY29kaW5nKGFwcCwgZGlyKTtcbiAgICAgIG5ldyBOb3RpY2UoYFx1RDgzRFx1REQyMiBcdTdGMTZcdTc4MDFcdTUyMDZcdTkxNERcdUZGMUEke3Jlc3VsdC5hc3NpZ25lZH0vJHtyZXN1bHQudG90YWx9YCk7XG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gXHU1MjM3XHU2NUIwXHU3NkVFXHU1RjU1XHU2NjIwXHU1QzA0XG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogJ3JlZnJlc2gtbWFwcGluZycsXG4gICAgbmFtZTogJ1x1NTIzN1x1NjVCMFx1NzZFRVx1NUY1NVx1NjYyMFx1NUMwNFx1RkYwOE9CXHUyMTkyXHU5OERFXHU0RTY2XHVGRjA5JyxcbiAgICBjYWxsYmFjazogYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgcmVmcmVzaE1hcHBpbmcoYXBwLCBzZXR0aW5ncy5zcGFjZUlkKTtcbiAgICB9LFxuICB9KTtcblxuICAvLyBcdTY2M0VcdTc5M0FcdTU0MkZcdTUyQThcdTRFRTRcdTcyNENcbiAgcGx1Z2luLmFkZENvbW1hbmQoe1xuICAgIGlkOiAnc2hvdy10b2tlbicsXG4gICAgbmFtZTogJ1x1NjYzRVx1NzkzQVx1NTQyRlx1NTJBOFx1NEVFNFx1NzI0Q1x1RkYwOFx1OEZERVx1NjNBNVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NjI2OVx1NUM1NVx1NzUyOFx1RkYwOScsXG4gICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgIGNvbnN0IG1vZGFsID0gbmV3IFRva2VuTW9kYWwoYXBwLCBzZXR0aW5ncy5zeW5jVG9rZW4pO1xuICAgICAgbW9kYWwub3BlbigpO1xuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFx1NjYzRVx1NzkzQVx1NjcwMFx1OEZEMVx1NTQwQ1x1NkI2NVx1OEJCMFx1NUY1NVxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6ICdzaG93LXJlY2VudCcsXG4gICAgbmFtZTogJ1x1NjYzRVx1NzkzQVx1NjcwMFx1OEZEMVx1NTQwQ1x1NkI2NVx1OEJCMFx1NUY1NScsXG4gICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgIGNvbnN0IHJlY2VudCA9IHBsdWdpbi5zdGF0ZS5yZWNlbnRTeW5jcztcbiAgICAgIGlmIChyZWNlbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1RkYwOFx1NjY4Mlx1NjVFMFx1NTQwQ1x1NkI2NVx1OEJCMFx1NUY1NVx1RkYwOScpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBsaW5lcyA9IHJlY2VudC5zbGljZSgwLCAxMCkubWFwKFxuICAgICAgICByID0+IGAke3IuYWN0aW9uID09PSAnY3JlYXRlZCcgPyAnXHUyNzk1JyA6IHIuYWN0aW9uID09PSAndXBkYXRlZCcgPyAnXHUyNzBGJyA6ICdcdTI3NEMnfSAke3IudGl0bGV9IFx1MjE5MiAke3IucGF0aH1gLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IG1vZGFsID0gbmV3IE1vZGFsKGFwcCk7XG4gICAgICBtb2RhbC50aXRsZUVsLnNldFRleHQoJ1x1NjcwMFx1OEZEMVx1NTQwQ1x1NkI2NVx1OEJCMFx1NUY1NScpO1xuICAgICAgY29uc3QgcHJlID0gbW9kYWwuY29udGVudEVsLmNyZWF0ZUVsKCdwcmUnKTtcbiAgICAgIHByZS5zZXRUZXh0KGxpbmVzLmpvaW4oJ1xcbicpKTtcbiAgICAgIG1vZGFsLm9wZW4oKTtcbiAgICB9LFxuICB9KTtcbn1cblxuLyoqIFx1NEVFNFx1NzI0Q1x1NUM1NVx1NzkzQSBNb2RhbFx1MzAwMiAqL1xuY2xhc3MgVG9rZW5Nb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgdG9rZW46IHN0cmluZykge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBvbk9wZW4oKTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG4gICAgY29udGVudEVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1x1NTQyRlx1NTJBOFx1NEVFNFx1NzI0QycgfSk7XG4gICAgY29udGVudEVsLmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDogJ1x1NTkwRFx1NTIzNlx1NkI2NFx1NEVFNFx1NzI0Q1x1RkYwQ1x1N0M5OFx1OEQzNFx1NTIzMFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NjI2OVx1NUM1NVx1NUYzOVx1N0E5N1x1NzY4NFwiVG9rZW5cIlx1OEY5M1x1NTE2NVx1Njg0Nlx1MzAwMicsXG4gICAgICBjbHM6ICdzZXR0aW5nLWl0ZW0tZGVzY3JpcHRpb24nLFxuICAgIH0pO1xuICAgIGNvbnN0IGNvZGVFbCA9IGNvbnRlbnRFbC5jcmVhdGVFbCgnY29kZScpO1xuICAgIGNvZGVFbC5zZXRUZXh0KHRoaXMudG9rZW4pO1xuICAgIGNvZGVFbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBjb2RlRWwuc3R5bGUucGFkZGluZyA9ICcxMnB4JztcbiAgICBjb2RlRWwuc3R5bGUuZm9udEZhbWlseSA9ICdtb25vc3BhY2UnO1xuICAgIGNvZGVFbC5zdHlsZS53b3JkQnJlYWsgPSAnYnJlYWstYWxsJztcbiAgICBjb2RlRWwuc3R5bGUuYmFja2dyb3VuZCA9ICd2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSknO1xuXG4gICAgY29uc3QgYnRuID0gY29udGVudEVsLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdcdTU5MERcdTUyMzYnIH0pO1xuICAgIGJ0bi5vbmNsaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGhpcy50b2tlbik7XG4gICAgICBuZXcgTm90aWNlKCdcdTI3MDUgXHU1REYyXHU1OTBEXHU1MjM2Jyk7XG4gICAgfTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IE1vZGFsLCBOb3RpY2UsIFRGaWxlLCBURm9sZGVyLCB0eXBlIEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7XG4gIE9CU0lESUFOX0xBUktfRE9DX0FDVElPTixcbiAgcGFyc2VPYnNpZGlhbkxhcmtEb2NQYXJhbXMsXG4gIHR5cGUgRmV0Y2hSZXF1ZXN0LFxufSBmcm9tICdAc3luYy9zaGFyZWQnO1xuaW1wb3J0IHR5cGUgeyBGZWlzaHVTeW5jUGx1Z2luIH0gZnJvbSAnLi9tYWluLmpzJztcbmltcG9ydCB7IGNyZWF0ZUZldGNoSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlcnMvZmV0Y2hIYW5kbGVyLmpzJztcbmltcG9ydCB7IHJlc29sdmVOb2RlVG9rZW5Gcm9tVXJsIH0gZnJvbSAnLi9sYXJrL2NsaS5qcyc7XG5cbnR5cGUgVHJpZ2dlclNvdXJjZSA9ICdwcm90b2NvbCcgfCAnY29tbWFuZCcgfCAnY2xpcHBlcic7XG5cbmludGVyZmFjZSBUcmlnZ2VySW5wdXQge1xuICBub2RlX3Rva2VuPzogc3RyaW5nO1xuICBvYmpfdG9rZW4/OiBzdHJpbmc7XG4gIHNwYWNlX2lkPzogc3RyaW5nO1xuICB0aXRsZT86IHN0cmluZztcbiAgdXJsPzogc3RyaW5nO1xuICBkaXI/OiBzdHJpbmc7XG4gIHJlcGxhY2VfcGF0aD86IHN0cmluZztcbiAgc291cmNlOiBUcmlnZ2VyU291cmNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJGZXRjaEVudHJ5cG9pbnRzKHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbik6IHZvaWQge1xuICBwbHVnaW4ucmVnaXN0ZXJPYnNpZGlhblByb3RvY29sSGFuZGxlcihPQlNJRElBTl9MQVJLX0RPQ19BQ1RJT04sIChwYXJhbXMpID0+IHtcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZU9ic2lkaWFuTGFya0RvY1BhcmFtcyhwYXJhbXMpO1xuICAgIHZvaWQgdHJpZ2dlckZldGNoKHBsdWdpbiwge1xuICAgICAgbm9kZV90b2tlbjogcGFyc2VkLm5vZGVfdG9rZW4gfHwgcGFyc2VkLnRva2VuLFxuICAgICAgb2JqX3Rva2VuOiBwYXJzZWQub2JqX3Rva2VuLFxuICAgICAgc3BhY2VfaWQ6IHBhcnNlZC5zcGFjZV9pZCxcbiAgICAgIHRpdGxlOiBwYXJzZWQudGl0bGUsXG4gICAgICB1cmw6IHBhcnNlZC51cmwsXG4gICAgICBkaXI6IHBhcnNlZC5kaXIsXG4gICAgICBzb3VyY2U6ICdwcm90b2NvbCcsXG4gICAgfSk7XG4gIH0pO1xuXG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogJ2ZldGNoLWZlaXNodS1kb2MnLFxuICAgIG5hbWU6ICdcdTYyQzlcdTUzRDZcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjMnLFxuICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICBuZXcgRmVpc2h1SW5wdXRNb2RhbChwbHVnaW4uYXBwLCBhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VVc2VySW5wdXQodmFsdWUpO1xuICAgICAgICBhd2FpdCB0cmlnZ2VyRmV0Y2gocGx1Z2luLCB7XG4gICAgICAgICAgLi4ucGFyc2VkLFxuICAgICAgICAgIHNvdXJjZTogJ2NvbW1hbmQnLFxuICAgICAgICB9KTtcbiAgICAgIH0pLm9wZW4oKTtcbiAgICB9LFxuICB9KTtcblxuICBwbHVnaW4ucmVnaXN0ZXJFdmVudChcbiAgICBwbHVnaW4uYXBwLnZhdWx0Lm9uKCdjcmVhdGUnLCAoZmlsZSkgPT4ge1xuICAgICAgaWYgKCEoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB8fCBmaWxlLmV4dGVuc2lvbiAhPT0gJ21kJykgcmV0dXJuO1xuICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB2b2lkIGhhbmRsZUNsaXBwZXJQbGFjZWhvbGRlcihwbHVnaW4sIGZpbGUpO1xuICAgICAgfSwgMjUwKTtcbiAgICB9KSxcbiAgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdHJpZ2dlckZldGNoKHBsdWdpbjogRmVpc2h1U3luY1BsdWdpbiwgaW5wdXQ6IFRyaWdnZXJJbnB1dCk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCByZXNvbHZlZCA9IG5vcm1hbGl6ZUlucHV0KHBsdWdpbiwgaW5wdXQpO1xuICBpZiAoIXJlc29sdmVkLm5vZGVfdG9rZW4pIHtcbiAgICBuZXcgTm90aWNlKCdcdTY1RTBcdTZDRDVcdThCQzZcdTUyMkJcdTk4REVcdTRFNjZcdTY1ODdcdTY4NjMgdG9rZW4nKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCByZXE6IEZldGNoUmVxdWVzdCA9IHtcbiAgICBub2RlX3Rva2VuOiByZXNvbHZlZC5ub2RlX3Rva2VuLFxuICAgIG9ial90b2tlbjogcmVzb2x2ZWQub2JqX3Rva2VuLFxuICAgIHNwYWNlX2lkOiByZXNvbHZlZC5zcGFjZV9pZCB8fCBwbHVnaW4uc2V0dGluZ3Muc3BhY2VJZCxcbiAgICBkaXI6IHJlc29sdmVkLmRpciB8fCBwbHVnaW4uc2V0dGluZ3MuZGVmYXVsdERpcixcbiAgICBmaWxlbmFtZTogcmVzb2x2ZWQudGl0bGUsXG4gICAgcmVwbGFjZV9wYXRoOiByZXNvbHZlZC5yZXBsYWNlX3BhdGgsXG4gIH07XG5cbiAgY29uc3QgcnVuID0gYXN5bmMgKGRpcj86IHN0cmluZykgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gY3JlYXRlRmV0Y2hIYW5kbGVyKHtcbiAgICAgICAgYXBwOiBwbHVnaW4uYXBwLFxuICAgICAgICBzZXR0aW5nczogcGx1Z2luLnNldHRpbmdzLFxuICAgICAgICBzdGF0ZTogcGx1Z2luLnN0YXRlLFxuICAgICAgICBub3RpY2U6IChtZXNzYWdlKSA9PiBuZXcgTm90aWNlKG1lc3NhZ2UpLFxuICAgICAgfSk7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBoYW5kbGVyKHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHVybDogJy9mZXRjaCcsXG4gICAgICAgIHBhdGg6ICcvZmV0Y2gnLFxuICAgICAgICBxdWVyeTogbmV3IFVSTFNlYXJjaFBhcmFtcygpLFxuICAgICAgICBib2R5OiB7IC4uLnJlcSwgZGlyOiBkaXIgfHwgcmVxLmRpciB9LFxuICAgICAgICB0b2tlbjogJycsXG4gICAgICB9KTtcbiAgICAgIG5ldyBOb3RpY2UoYCR7cmVzdWx0LmFjdGlvbiA9PT0gJ2NyZWF0ZWQnID8gJ1x1NURGMlx1NTIxQlx1NUVGQScgOiAnXHU1REYyXHU2NkY0XHU2NUIwJ31cdUZGMUEke3Jlc3VsdC5wYXRofWApO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbmV3IE5vdGljZShgXHU1NDBDXHU2QjY1XHU1OTMxXHU4RDI1XHVGRjFBJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycil9YCk7XG4gICAgfVxuICB9O1xuXG4gIGlmIChpbnB1dC5zb3VyY2UgPT09ICdwcm90b2NvbCcgJiYgIWlucHV0LmRpcikge1xuICAgIG5ldyBGb2xkZXJQaWNrTW9kYWwocGx1Z2luLmFwcCwgcGx1Z2luLnNldHRpbmdzLmRlZmF1bHREaXIsIHJ1bikub3BlbigpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGF3YWl0IHJ1bihyZXEuZGlyKTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplSW5wdXQocGx1Z2luOiBGZWlzaHVTeW5jUGx1Z2luLCBpbnB1dDogVHJpZ2dlcklucHV0KTogVHJpZ2dlcklucHV0IHtcbiAgaWYgKGlucHV0LnVybCkge1xuICAgIGNvbnN0IGZyb21VcmwgPSByZXNvbHZlTm9kZVRva2VuRnJvbVVybChpbnB1dC51cmwpO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5pbnB1dCxcbiAgICAgIG5vZGVfdG9rZW46IGlucHV0Lm5vZGVfdG9rZW4gfHwgZnJvbVVybC5ub2RlX3Rva2VuIHx8IGlucHV0Lm9ial90b2tlbiB8fCBmcm9tVXJsLm9ial90b2tlbixcbiAgICAgIG9ial90b2tlbjogaW5wdXQub2JqX3Rva2VuIHx8IGZyb21Vcmwub2JqX3Rva2VuLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHtcbiAgICAuLi5pbnB1dCxcbiAgICBub2RlX3Rva2VuOiBpbnB1dC5ub2RlX3Rva2VuIHx8IGlucHV0Lm9ial90b2tlbixcbiAgICBzcGFjZV9pZDogaW5wdXQuc3BhY2VfaWQgfHwgcGx1Z2luLnNldHRpbmdzLnNwYWNlSWQsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHBhcnNlVXNlcklucHV0KHZhbHVlOiBzdHJpbmcpOiBPbWl0PFRyaWdnZXJJbnB1dCwgJ3NvdXJjZSc+IHtcbiAgY29uc3QgdHJpbW1lZCA9IHZhbHVlLnRyaW0oKTtcbiAgaWYgKC9eaHR0cHM/OlxcL1xcLy8udGVzdCh0cmltbWVkKSkge1xuICAgIGNvbnN0IHBhcnNlZCA9IHJlc29sdmVOb2RlVG9rZW5Gcm9tVXJsKHRyaW1tZWQpO1xuICAgIHJldHVybiB7XG4gICAgICBub2RlX3Rva2VuOiBwYXJzZWQubm9kZV90b2tlbiB8fCBwYXJzZWQub2JqX3Rva2VuLFxuICAgICAgb2JqX3Rva2VuOiBwYXJzZWQub2JqX3Rva2VuLFxuICAgICAgdXJsOiB0cmltbWVkLFxuICAgIH07XG4gIH1cbiAgY29uc3QgcHJvdG9jb2xQYXJhbXMgPSBwYXJzZU9ic2lkaWFuTGFya0RvY1BhcmFtcyh0cmltbWVkKTtcbiAgaWYgKHByb3RvY29sUGFyYW1zLnRva2VuIHx8IHByb3RvY29sUGFyYW1zLm5vZGVfdG9rZW4gfHwgcHJvdG9jb2xQYXJhbXMub2JqX3Rva2VuKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5vZGVfdG9rZW46IHByb3RvY29sUGFyYW1zLm5vZGVfdG9rZW4gfHwgcHJvdG9jb2xQYXJhbXMudG9rZW4gfHwgcHJvdG9jb2xQYXJhbXMub2JqX3Rva2VuLFxuICAgICAgb2JqX3Rva2VuOiBwcm90b2NvbFBhcmFtcy5vYmpfdG9rZW4sXG4gICAgICBzcGFjZV9pZDogcHJvdG9jb2xQYXJhbXMuc3BhY2VfaWQsXG4gICAgICB0aXRsZTogcHJvdG9jb2xQYXJhbXMudGl0bGUsXG4gICAgICB1cmw6IHByb3RvY29sUGFyYW1zLnVybCxcbiAgICAgIGRpcjogcHJvdG9jb2xQYXJhbXMuZGlyLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHsgbm9kZV90b2tlbjogdHJpbW1lZCB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDbGlwcGVyUGxhY2Vob2xkZXIocGx1Z2luOiBGZWlzaHVTeW5jUGx1Z2luLCBmaWxlOiBURmlsZSk6IFByb21pc2U8dm9pZD4ge1xuICBsZXQgY29udGVudCA9ICcnO1xuICB0cnkge1xuICAgIGNvbnRlbnQgPSBhd2FpdCBwbHVnaW4uYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHVybCA9IGV4dHJhY3RDbGlwcGVyVXJsKGNvbnRlbnQpO1xuICBpZiAoIXVybCkgcmV0dXJuO1xuICBjb25zdCBwYXJzZWQgPSByZXNvbHZlTm9kZVRva2VuRnJvbVVybCh1cmwpO1xuICBjb25zdCBub2RlVG9rZW4gPSBwYXJzZWQubm9kZV90b2tlbiB8fCBwYXJzZWQub2JqX3Rva2VuO1xuICBpZiAoIW5vZGVUb2tlbikgcmV0dXJuO1xuXG4gIGF3YWl0IHRyaWdnZXJGZXRjaChwbHVnaW4sIHtcbiAgICBub2RlX3Rva2VuOiBub2RlVG9rZW4sXG4gICAgb2JqX3Rva2VuOiBwYXJzZWQub2JqX3Rva2VuLFxuICAgIHVybCxcbiAgICBkaXI6IGZpbGUucGFyZW50Py5wYXRoIHx8IHBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0RGlyLFxuICAgIHJlcGxhY2VfcGF0aDogZmlsZS5wYXRoLFxuICAgIHNvdXJjZTogJ2NsaXBwZXInLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdENsaXBwZXJVcmwoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IHBhdHRlcm5zID0gW1xuICAgIC9mZWlzaHVfc3luY191cmw6XFxzKltcIiddPyhbXlxcblwiJ10rKS8sXG4gICAgL3NvdXJjZTpcXHMqW1wiJ10/KGh0dHBzPzpcXC9cXC9bXlxcblwiJ10qKD86ZmVpc2h1XFwuY258bGFya3N1aXRlXFwuY29tKVxcLyg/Ondpa2l8ZG9jeHxkb2MpXFwvW0EtWmEtejAtOV0rKS8sXG4gICAgLyhodHRwcz86XFwvXFwvW15cXHMpXCInXSooPzpmZWlzaHVcXC5jbnxsYXJrc3VpdGVcXC5jb20pXFwvKD86d2lraXxkb2N4fGRvYylcXC9bQS1aYS16MC05XSspLyxcbiAgXTtcbiAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIHBhdHRlcm5zKSB7XG4gICAgY29uc3QgbWF0Y2ggPSBjb250ZW50Lm1hdGNoKHBhdHRlcm4pO1xuICAgIGlmIChtYXRjaD8uWzFdKSByZXR1cm4gbWF0Y2hbMV0udHJpbSgpO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5jbGFzcyBGZWlzaHVJbnB1dE1vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBwcml2YXRlIGlucHV0RWwhOiBIVE1MSW5wdXRFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIG9uU3VibWl0OiAodmFsdWU6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPikge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBvbk9wZW4oKTogdm9pZCB7XG4gICAgdGhpcy50aXRsZUVsLnNldFRleHQoJ1x1NjJDOVx1NTNENlx1OThERVx1NEU2Nlx1NjU4N1x1Njg2MycpO1xuICAgIHRoaXMuaW5wdXRFbCA9IHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdpbnB1dCcsIHtcbiAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgIHBsYWNlaG9sZGVyOiAnXHU3Qzk4XHU4RDM0XHU5OERFXHU0RTY2XHU5NEZFXHU2M0E1XHUzMDAxdG9rZW4gXHU2MjE2IG9ic2lkaWFuOi8vbGFyay1kb2MgXHU1NzMwXHU1NzQwJyxcbiAgICB9KTtcbiAgICB0aGlzLmlucHV0RWwuc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgdGhpcy5pbnB1dEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgIT09ICdFbnRlcicpIHJldHVybjtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuaW5wdXRFbC52YWx1ZS50cmltKCk7XG4gICAgICBpZiAoIXZhbHVlKSByZXR1cm47XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB2b2lkIHRoaXMub25TdWJtaXQodmFsdWUpO1xuICAgIH0pO1xuICAgIHRoaXMuaW5wdXRFbC5mb2N1cygpO1xuICB9XG5cbiAgb25DbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xuICB9XG59XG5cbmNsYXNzIEZvbGRlclBpY2tNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgY29uc3RydWN0b3IoXG4gICAgYXBwOiBBcHAsXG4gICAgcHJpdmF0ZSBkZWZhdWx0RGlyOiBzdHJpbmcsXG4gICAgcHJpdmF0ZSBvblN1Ym1pdDogKGRpcjogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+LFxuICApIHtcbiAgICBzdXBlcihhcHApO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIHRoaXMudGl0bGVFbC5zZXRUZXh0KCdcdTkwMDlcdTYyRTlcdTU0MENcdTZCNjVcdTc2RUVcdTVGNTUnKTtcbiAgICBjb25zdCBzZWxlY3QgPSB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbCgnc2VsZWN0Jyk7XG4gICAgc2VsZWN0LnN0eWxlLndpZHRoID0gJzEwMCUnO1xuXG4gICAgY29uc3QgZm9sZGVycyA9IGdldEZvbGRlcnModGhpcy5hcHApO1xuICAgIGZvciAoY29uc3QgZm9sZGVyIG9mIGZvbGRlcnMpIHtcbiAgICAgIGNvbnN0IG9wdGlvbiA9IHNlbGVjdC5jcmVhdGVFbCgnb3B0aW9uJywge1xuICAgICAgICB0ZXh0OiBmb2xkZXIucGF0aCB8fCAnLycsXG4gICAgICAgIHZhbHVlOiBmb2xkZXIucGF0aCxcbiAgICAgIH0pO1xuICAgICAgb3B0aW9uLnNlbGVjdGVkID0gZm9sZGVyLnBhdGggPT09IHRoaXMuZGVmYXVsdERpcjtcbiAgICB9XG5cbiAgICBjb25zdCByb3cgPSB0aGlzLmNvbnRlbnRFbC5jcmVhdGVEaXYoKTtcbiAgICByb3cuc3R5bGUubWFyZ2luVG9wID0gJzEycHgnO1xuICAgIGNvbnN0IGNvbmZpcm0gPSByb3cuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ1x1NTQwQ1x1NkI2NScgfSk7XG4gICAgY29uZmlybS5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgY29uc3QgZGlyID0gc2VsZWN0LnZhbHVlIHx8IHRoaXMuZGVmYXVsdERpcjtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIHZvaWQgdGhpcy5vblN1Ym1pdChkaXIpO1xuICAgIH07XG4gIH1cblxuICBvbkNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0Rm9sZGVycyhhcHA6IEFwcCk6IFRGb2xkZXJbXSB7XG4gIGNvbnN0IGZvbGRlcnMgPSBhcHAudmF1bHRcbiAgICAuZ2V0QWxsTG9hZGVkRmlsZXMoKVxuICAgIC5maWx0ZXIoKGZpbGUpOiBmaWxlIGlzIFRGb2xkZXIgPT4gZmlsZSBpbnN0YW5jZW9mIFRGb2xkZXIpXG4gICAgLmZpbHRlcigoZm9sZGVyKSA9PiAhZm9sZGVyLnBhdGguc3RhcnRzV2l0aCgnLm9ic2lkaWFuJykgJiYgIWZvbGRlci5wYXRoLnN0YXJ0c1dpdGgoJy5mZWlzaHUtc3luYycpKTtcbiAgcmV0dXJuIGZvbGRlcnMubGVuZ3RoID4gMCA/IGZvbGRlcnMgOiBbYXBwLnZhdWx0LmdldFJvb3QoKV07XG59XG4iLCAiLyoqXG4gKiBcdTU2RkVcdTcyNDdcdTk4ODRcdTg5QzhcdTZFMzJcdTY3RDNcdTMwMDJcdTRGOURcdTYzNkUgYDAwX1x1NTQwQ1x1NkI2NVx1NjVCOVx1Njg0OFx1OEJCRVx1OEJBMV92Mi5tZGAgXHUwMEE3My4zICsgYDAzX1x1NjgzQ1x1NUYwRlx1ODlDNFx1ODMwMy5tZGAgXHUwMEE3XHU1MTZEXHUzMDAyXG4gKlxuICogT0IgbWQgXHU5MUNDXHU1NkZFXHU3MjQ3XHU1MTk5XHU2MjEwIGAhW10oZmVpc2h1Oi8vRklMRV9UT0tFTilgXHVGRjBDXHU2RTMyXHU2N0QzXHU2NUY2XHU4QzAzIGxhcmstY2xpIFx1NjM2Mlx1NEUzNFx1NjVGNlx1OTRGRVx1NjNBNVx1MzAwMlxuICogXHU1RTI2IExSVSBcdTdGMTNcdTVCNThcdUZGMDhcdTkwN0ZcdTUxNERcdTZCQ0ZcdTZCMjFcdTZFMzJcdTY3RDNcdTkwRkRcdTRFMEJcdThGN0RcdUZGMDlcdUZGMENcdTdGMTNcdTVCNThcdTc2RUVcdTVGNTVcdTU3MjggdmF1bHQgXHU0RTBCIGAuZmVpc2h1LXN5bmMvY2FjaGUvYFx1MzAwMlxuICovXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IE5vdGljZSwgUGxhdGZvcm0gfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBydW4gfSBmcm9tICcuL2xhcmsvY2xpLmpzJztcblxuY29uc3QgQ0FDSEVfRElSID0gJy5mZWlzaHUtc3luYy9jYWNoZSc7XG5cbi8qKlxuICogXHU2Q0U4XHU1MThDXHU1NkZFXHU3MjQ3XHU2RTMyXHU2N0QzXHU1OTA0XHU3NDA2XHU1NjY4XHUzMDAyXG4gKiBcdTYyRTZcdTYyMkFcdTZFMzJcdTY3RDNcdTU0MEVcdTc2ODQgPGltZyBzcmM9XCJmZWlzaHU6Ly9UT0tFTlwiPlx1RkYwQ1x1NjM2Mlx1NjIxMCBsYXJrLWNsaSBcdTRFMEJcdThGN0RcdTc2ODRcdTY3MkNcdTU3MzBcdTRFMzRcdTY1RjZcdTY1ODdcdTRFRjZcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVySW1hZ2VSZW5kZXJlcihwbHVnaW46IFBsdWdpbik6IHZvaWQge1xuICBpZiAoIVBsYXRmb3JtLmlzRGVza3RvcEFwcCkgcmV0dXJuO1xuXG4gIGNvbnN0IHsgYWRhcHRlciB9ID0gcGx1Z2luLmFwcC52YXVsdDtcblxuICBwbHVnaW4ucmVnaXN0ZXJNYXJrZG93blBvc3RQcm9jZXNzb3IoYXN5bmMgKGVsLCBjdHgpID0+IHtcbiAgICBjb25zdCBpbWdzID0gZWwucXVlcnlTZWxlY3RvckFsbCgnaW1nJyk7XG4gICAgZm9yIChjb25zdCBpbWcgb2YgQXJyYXkuZnJvbShpbWdzKSkge1xuICAgICAgY29uc3Qgc3JjID0gaW1nLmdldEF0dHJpYnV0ZSgnc3JjJykgfHwgJyc7XG4gICAgICBpZiAoIXNyYy5zdGFydHNXaXRoKCdmZWlzaHU6Ly8nKSkgY29udGludWU7XG5cbiAgICAgIGNvbnN0IHRva2VuID0gc3JjLnNsaWNlKCdmZWlzaHU6Ly8nLmxlbmd0aCk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBsb2NhbFBhdGggPSBhd2FpdCByZXNvbHZlSW1hZ2UocGx1Z2luLCB0b2tlbik7XG4gICAgICAgIGlmIChsb2NhbFBhdGgpIHtcbiAgICAgICAgICAvLyBcdTc1MjggdmF1bHQ6Ly8gXHU5NEZFXHU2M0E1XHU2MjE2IGFwcDovL2xvY2FsLyBcdTk0RkVcdTYzQTVcbiAgICAgICAgICBjb25zdCB2YXVsdEJhc2UgPSBwbHVnaW4uYXBwLnZhdWx0LmFkYXB0ZXIuZ2V0QmFzZVBhdGg/LigpID8/ICcnO1xuICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKHZhdWx0QmFzZSwgbG9jYWxQYXRoKTtcbiAgICAgICAgICBpbWcuc2V0QXR0cmlidXRlKCdzcmMnLCBgYXBwOi8vbG9jYWwvJHtmdWxsUGF0aH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbWcuc2V0QXR0cmlidXRlKCdhbHQnLCBgW1x1OThERVx1NEU2Nlx1NTZGRVx1NzI0NyAke3Rva2VuLnNsaWNlKDAsIDgpfSBcdTUyQTBcdThGN0RcdTU5MzFcdThEMjVdYCk7XG4gICAgICAgICAgaW1nLnNldEF0dHJpYnV0ZSgnc3JjJywgJycpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbc3luYy9pbWFnZV0gcmVuZGVyIGZhaWxlZDonLCB0b2tlbiwgZXJyKTtcbiAgICAgICAgaW1nLnNldEF0dHJpYnV0ZSgnYWx0JywgYFtcdTk4REVcdTRFNjZcdTU2RkVcdTcyNDcgJHt0b2tlbi5zbGljZSgwLCA4KX0gXHU1MkEwXHU4RjdEXHU0RTJELi4uXWApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogXHU4OUUzXHU2NzkwXHU1MzU1XHU0RTJBXHU5OERFXHU0RTY2XHU1NkZFXHU3MjQ3IHRva2VuIFx1MjE5MiBcdTY3MkNcdTU3MzBcdTdGMTNcdTVCNThcdThERUZcdTVGODRcdTMwMDJcbiAqIFx1NTQ3RFx1NEUyRFx1N0YxM1x1NUI1OFx1NzZGNFx1NjNBNVx1OEZENFx1NTZERVx1RkYwQ1x1NTQyNlx1NTIxOVx1OEMwMyBsYXJrLWNsaSBkb2NzICttZWRpYS1kb3dubG9hZCBcdTRFMEJcdThGN0RcdTMwMDJcbiAqL1xuY29uc3QgcmVzb2x2aW5nID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2U8c3RyaW5nIHwgbnVsbD4+KCk7XG5cbmFzeW5jIGZ1bmN0aW9uIHJlc29sdmVJbWFnZShwbHVnaW46IFBsdWdpbiwgdG9rZW46IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAvLyBcdTVFNzZcdTUzRDFcdTUzQkJcdTkxQ0RcdUZGMDhcdTU0MENcdTRFMDAgdG9rZW4gXHU1OTFBXHU0RTJBIGltZyBcdTU0MENcdTY1RjZcdTZFMzJcdTY3RDNcdTUzRUFcdTRFMEJcdThGN0RcdTRFMDBcdTZCMjFcdUZGMDlcbiAgaWYgKHJlc29sdmluZy5oYXModG9rZW4pKSByZXR1cm4gcmVzb2x2aW5nLmdldCh0b2tlbikhO1xuXG4gIGNvbnN0IHByb21pc2UgPSBkb1Jlc29sdmVJbWFnZShwbHVnaW4sIHRva2VuKTtcbiAgcmVzb2x2aW5nLnNldCh0b2tlbiwgcHJvbWlzZSk7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGF3YWl0IHByb21pc2U7XG4gIH0gZmluYWxseSB7XG4gICAgcmVzb2x2aW5nLmRlbGV0ZSh0b2tlbik7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZG9SZXNvbHZlSW1hZ2UocGx1Z2luOiBQbHVnaW4sIHRva2VuOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgY29uc3QgeyBhZGFwdGVyIH0gPSBwbHVnaW4uYXBwLnZhdWx0O1xuICBjb25zdCBleHQgPSAnLnBuZyc7IC8vIFx1OThERVx1NEU2Nlx1NTZGRVx1NzI0N1x1OUVEOFx1OEJBNCBwbmdcdUZGMENcdTY1RTBcdTZDRDVcdTk4ODRcdTc3RTVcdTY4M0NcdTVGMEZcdUZGMENcdTdFREZcdTRFMDAgcG5nXG4gIGNvbnN0IGNhY2hlUGF0aCA9IGAke0NBQ0hFX0RJUn0vJHt0b2tlbn0ke2V4dH1gO1xuXG4gIC8vIFx1NTQ3RFx1NEUyRFx1N0YxM1x1NUI1OFxuICBpZiAoYXdhaXQgYWRhcHRlci5leGlzdHMoY2FjaGVQYXRoKSkge1xuICAgIHJldHVybiBjYWNoZVBhdGg7XG4gIH1cblxuICAvLyBcdTc4NkVcdTRGRERcdTdGMTNcdTVCNThcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjhcbiAgdHJ5IHtcbiAgICBpZiAoIShhd2FpdCBhZGFwdGVyLmV4aXN0cyhDQUNIRV9ESVIpKSkge1xuICAgICAgYXdhaXQgYWRhcHRlci5ta2RpcihDQUNIRV9ESVIpO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgLyogaWdub3JlICovXG4gIH1cblxuICAvLyBcdTRFMEJcdThGN0RcdTUyMzBcdTRFMzRcdTY1RjZcdTY3MkNcdTU3MzBcdThERUZcdTVGODRcdUZGMDhsYXJrLWNsaSBcdTk3MDBcdTg5ODFcdTY3MkNcdTU3MzBcdTY1ODdcdTRFRjZcdTdDRkJcdTdFREZcdThERUZcdTVGODRcdUZGMDlcbiAgY29uc3QgdmF1bHRCYXNlID0gKGFkYXB0ZXIgYXMgeyBnZXRCYXNlUGF0aD86ICgpID0+IHN0cmluZyB9KS5nZXRCYXNlUGF0aD8uKCkgPz8gcHJvY2Vzcy5jd2QoKTtcbiAgY29uc3QgbG9jYWxGdWxsUGF0aCA9IHBhdGguam9pbih2YXVsdEJhc2UsIGNhY2hlUGF0aCk7XG5cbiAgdHJ5IHtcbiAgICBydW4oWydkb2NzJywgJyttZWRpYS1kb3dubG9hZCcsICctLXRva2VuJywgdG9rZW4sICctLW91dHB1dCcsIGxvY2FsRnVsbFBhdGhdLCB7XG4gICAgICB0aW1lb3V0OiAzMDAwMCxcbiAgICB9KTtcbiAgICByZXR1cm4gY2FjaGVQYXRoO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2ltYWdlXSBtZWRpYS1kb3dubG9hZCBmYWlsZWQ6JywgdG9rZW4sIGVycik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTZFMDVcdTc0MDZcdThGQzdcdTY3MUZcdTdGMTNcdTVCNThcdTMwMDJcdTRGOURcdTYzNkVcdThCQkVcdTdGNkUgY2FjaGVDbGVhbnVwIFx1NTQ2OFx1NjcxRlx1MzAwMlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYW51cEltYWdlQ2FjaGUocGx1Z2luOiBQbHVnaW4sIG1vZGU6ICdkYWlseScgfCAnd2Vla2x5JyB8ICdtb250aGx5JyB8ICduZXZlcicpOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKG1vZGUgPT09ICduZXZlcicpIHJldHVybjtcblxuICBjb25zdCB7IGFkYXB0ZXIgfSA9IHBsdWdpbi5hcHAudmF1bHQ7XG4gIGlmICghKGF3YWl0IGFkYXB0ZXIuZXhpc3RzKENBQ0hFX0RJUikpKSByZXR1cm47XG5cbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgY29uc3QgdHRsTXMgPVxuICAgIG1vZGUgPT09ICdkYWlseScgPyAyNCAqIDM2MDAgKiAxMDAwIDpcbiAgICBtb2RlID09PSAnd2Vla2x5JyA/IDcgKiAyNCAqIDM2MDAgKiAxMDAwIDpcbiAgICAzMCAqIDI0ICogMzYwMCAqIDEwMDA7XG5cbiAgbGV0IGNsZWFuZWQgPSAwO1xuICB0cnkge1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgYWRhcHRlci5saXN0KENBQ0hFX0RJUik7XG4gICAgZm9yIChjb25zdCBmIG9mIGZpbGVzLmZpbGVzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzdGF0ID0gYXdhaXQgYWRhcHRlci5zdGF0KGYpO1xuICAgICAgICBpZiAoc3RhdD8ubXRpbWUgJiYgbm93IC0gc3RhdC5tdGltZSA+IHR0bE1zKSB7XG4gICAgICAgICAgYXdhaXQgYWRhcHRlci5yZW1vdmUoZik7XG4gICAgICAgICAgY2xlYW5lZCsrO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tzeW5jL2ltYWdlXSBjbGVhbnVwIGZhaWxlZDonLCBlcnIpO1xuICB9XG5cbiAgaWYgKGNsZWFuZWQgPiAwKSB7XG4gICAgbmV3IE5vdGljZShgXHVEODNFXHVEREY5IFx1NURGMlx1NkUwNVx1NzQwNiAke2NsZWFuZWR9IFx1NEUyQVx1OEZDN1x1NjcxRlx1NTZGRVx1NzI0N1x1N0YxM1x1NUI1OGApO1xu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QUEsTUFDcEMsS0FBSyxLQUFLO0FBQUEsTUFDVixVQUFVLEtBQUs7QUFBQSxNQUNmLFFBQVEsQ0FBQyxNQUFNLElBQUksd0JBQU8sQ0FBQztBQUFBLElBQzdCLENBQUMsQ0FBQztBQUNGLFdBQU8sSUFBSSxXQUFXLG9CQUFvQixLQUFLLEdBQUcsQ0FBQztBQUNuRCxXQUFPLElBQUksYUFBYSxzQkFBc0I7QUFBQSxNQUM1QyxLQUFLLEtBQUs7QUFBQSxNQUNWLFVBQVUsS0FBSztBQUFBLE1BQ2YsUUFBUSxDQUFDLE1BQU0sSUFBSSx3QkFBTyxDQUFDO0FBQUEsSUFDN0IsQ0FBQyxDQUFDO0FBRUYsUUFBSTtBQUNGLFlBQU0sRUFBRSxLQUFLLElBQUksTUFBTSxZQUFZLEtBQUssU0FBUyxNQUFNLElBQUk7QUFDM0QsV0FBSyxhQUFhO0FBQ2xCLFdBQUssTUFBTSxnQkFBZ0I7QUFBQSxJQUM3QixTQUFTLEtBQUs7QUFDWixZQUFNLE1BQU0sZUFBZSxRQUFRLElBQUksVUFBVSxPQUFPLEdBQUc7QUFDM0QsVUFBSSx3QkFBTyxpRUFBeUIsS0FBSyxTQUFTLElBQUksZUFBSyxHQUFHLEVBQUU7QUFDaEUsY0FBUSxNQUFNLCtCQUErQixHQUFHO0FBQUEsSUFDbEQ7QUFBQSxFQUNGO0FBQ0Y7QUFHQSxTQUFTQSxpQkFBd0I7QUFDL0IsUUFBTSxRQUFRLElBQUksV0FBVyxFQUFFO0FBQy9CLEVBQUMsV0FBVyxPQUFrQixnQkFBZ0IsS0FBSztBQUNuRCxTQUFPLE1BQU0sS0FBSyxLQUFLLEVBQUUsSUFBSSxPQUFLLEVBQUUsU0FBUyxFQUFFLEVBQUUsU0FBUyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRTtBQUM1RTtBQUdBLElBQU8sZUFBUTsiLAogICJuYW1lcyI6IFsiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJtb2R1bGUiLCAiWUFNTEV4Y2VwdGlvbiIsICJsaW5lIiwgIlR5cGUiLCAiU2NoZW1hIiwgIkRFRkFVTFRfU0NIRU1BIiwgImxvYWRBbGwiLCAibG9hZCIsICJzdHJpbmciLCAiZHVtcCIsICJ5YW1sIiwgImpzb24iLCAidW53cmFwTGFya0VudmVsb3BlIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImVuc3VyZUZvbGRlciIsICJlbnN1cmVGb2xkZXIiLCAiZmluZEJ5RmVpc2h1SWQiLCAiZmluZEJ5RmVpc2h1SWQiLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJydW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgInBhdGgiLCAiZ2VuZXJhdGVUb2tlbiJdCn0K
