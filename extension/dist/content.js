"use strict";
(() => {
  // ../packages/shared/dist/protocol.js
  var DEFAULT_PORT = 4567;
  var TOKEN_HEADER = "X-Sync-Token";
  var OBSIDIAN_LARK_DOC_ACTION = "lark-doc";
  var OBSIDIAN_LARK_DOC_URI_PREFIX = `obsidian://${OBSIDIAN_LARK_DOC_ACTION}`;

  // ../node_modules/js-yaml/dist/js-yaml.mjs
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function")
      for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
        key = keys[i];
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, {
            get: ((k) => from[k]).bind(null, key),
            enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
          });
      }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
    value: mod,
    enumerable: true
  }) : target, mod));
  var require_common = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
    module.exports.isNothing = isNothing;
    module.exports.isObject = isObject;
    module.exports.toArray = toArray;
    module.exports.repeat = repeat;
    module.exports.isNegativeZero = isNegativeZero;
    module.exports.extend = extend;
  });
  var require_exception = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
    module.exports = YAMLException2;
  });
  var require_snippet = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
    module.exports = makeSnippet;
  });
  var require_type = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
    module.exports = Type2;
  });
  var require_schema = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
    module.exports = Schema2;
  });
  var require_str = /* @__PURE__ */ __commonJSMin((exports, module) => {
    module.exports = new (require_type())("tag:yaml.org,2002:str", {
      kind: "scalar",
      construct: function(data) {
        return data !== null ? data : "";
      }
    });
  });
  var require_seq = /* @__PURE__ */ __commonJSMin((exports, module) => {
    module.exports = new (require_type())("tag:yaml.org,2002:seq", {
      kind: "sequence",
      construct: function(data) {
        return data !== null ? data : [];
      }
    });
  });
  var require_map = /* @__PURE__ */ __commonJSMin((exports, module) => {
    module.exports = new (require_type())("tag:yaml.org,2002:map", {
      kind: "mapping",
      construct: function(data) {
        return data !== null ? data : {};
      }
    });
  });
  var require_failsafe = /* @__PURE__ */ __commonJSMin((exports, module) => {
    module.exports = new (require_schema())({ explicit: [
      require_str(),
      require_seq(),
      require_map()
    ] });
  });
  var require_null = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
    module.exports = new Type2("tag:yaml.org,2002:null", {
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
  var require_bool = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
    module.exports = new Type2("tag:yaml.org,2002:bool", {
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
  var require_int = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
    module.exports = new Type2("tag:yaml.org,2002:int", {
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
  var require_float = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
    module.exports = new Type2("tag:yaml.org,2002:float", {
      kind: "scalar",
      resolve: resolveYamlFloat,
      construct: constructYamlFloat,
      predicate: isFloat,
      represent: representYamlFloat,
      defaultStyle: "lowercase"
    });
  });
  var require_json = /* @__PURE__ */ __commonJSMin((exports, module) => {
    module.exports = require_failsafe().extend({ implicit: [
      require_null(),
      require_bool(),
      require_int(),
      require_float()
    ] });
  });
  var require_core = /* @__PURE__ */ __commonJSMin((exports, module) => {
    module.exports = require_json();
  });
  var require_timestamp = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
    module.exports = new Type2("tag:yaml.org,2002:timestamp", {
      kind: "scalar",
      resolve: resolveYamlTimestamp,
      construct: constructYamlTimestamp,
      instanceOf: Date,
      represent: representYamlTimestamp
    });
  });
  var require_merge = /* @__PURE__ */ __commonJSMin((exports, module) => {
    var Type2 = require_type();
    function resolveYamlMerge(data) {
      return data === "<<" || data === null;
    }
    module.exports = new Type2("tag:yaml.org,2002:merge", {
      kind: "scalar",
      resolve: resolveYamlMerge
    });
  });
  var require_binary = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
    module.exports = new Type2("tag:yaml.org,2002:binary", {
      kind: "scalar",
      resolve: resolveYamlBinary,
      construct: constructYamlBinary,
      predicate: isBinary,
      represent: representYamlBinary
    });
  });
  var require_omap = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
    module.exports = new Type2("tag:yaml.org,2002:omap", {
      kind: "sequence",
      resolve: resolveYamlOmap,
      construct: constructYamlOmap
    });
  });
  var require_pairs = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
    module.exports = new Type2("tag:yaml.org,2002:pairs", {
      kind: "sequence",
      resolve: resolveYamlPairs,
      construct: constructYamlPairs
    });
  });
  var require_set = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
    module.exports = new Type2("tag:yaml.org,2002:set", {
      kind: "mapping",
      resolve: resolveYamlSet,
      construct: constructYamlSet
    });
  });
  var require_default = /* @__PURE__ */ __commonJSMin((exports, module) => {
    module.exports = require_core().extend({
      implicit: [require_timestamp(), require_merge()],
      explicit: [
        require_binary(),
        require_omap(),
        require_pairs(),
        require_set()
      ]
    });
  });
  var require_loader = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
    module.exports.loadAll = loadAll2;
    module.exports.load = load2;
  });
  var require_dumper = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
    module.exports.dump = dump2;
  });
  var import_js_yaml = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin((exports, module) => {
    var loader = require_loader();
    var dumper = require_dumper();
    function renamed(from, to) {
      return function() {
        throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
      };
    }
    module.exports.Type = require_type();
    module.exports.Schema = require_schema();
    module.exports.FAILSAFE_SCHEMA = require_failsafe();
    module.exports.JSON_SCHEMA = require_json();
    module.exports.CORE_SCHEMA = require_core();
    module.exports.DEFAULT_SCHEMA = require_default();
    module.exports.load = loader.load;
    module.exports.loadAll = loader.loadAll;
    module.exports.dump = dumper.dump;
    module.exports.YAMLException = require_exception();
    module.exports.types = {
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
    module.exports.safeLoad = renamed("safeLoad", "load");
    module.exports.safeLoadAll = renamed("safeLoadAll", "loadAll");
    module.exports.safeDump = renamed("safeDump", "dump");
  }))(), 1);
  var { Type, Schema, FAILSAFE_SCHEMA, JSON_SCHEMA, CORE_SCHEMA, DEFAULT_SCHEMA, load, loadAll, dump, YAMLException, types, safeLoad, safeLoadAll, safeDump } = import_js_yaml.default;
  var index_vite_proxy_tmp_default = import_js_yaml.default;

  // src/client.ts
  var DEFAULT_CONFIG = {
    host: "127.0.0.1",
    port: DEFAULT_PORT,
    token: ""
  };
  var DEFAULT_PROPERTY_TEMPLATE = {
    \u6807\u7B7E: "S",
    \u7F16\u7801: "",
    \u8F93\u5165: "{{dir}}",
    \u65E5\u671F: "{{date}}",
    \u65E5\u671F\u7D22\u5F15: "",
    \u5173\u952E\u8BCD: "{{keywords}}",
    \u6982\u8FF0: "",
    \u8BC4\u5206: "",
    \u8BC4\u5206_\u663E\u793A: "",
    \u7D22\u5F15_\u77E5\u8BC6\u5E93: "",
    \u7D22\u5F15_\u989C\u8272: "",
    "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988": "",
    \u7D22\u5F15_\u5757: "",
    \u7D22\u5F15_\u98CE\u9669: ""
  };
  var DEFAULT_PROPERTY_OPTIONS = {
    \u6807\u7B7E: "\u{1F4E5}S_\u6536\u96C6, \u{1F3AF}X_\u9879\u76EE, \u{1F333}L_\u9886\u57DF, \u{1F4DA}Z_\u8D44\u6E90, \u{1F4A1}Q_\u7075\u611F, \u{1F6E0}\uFE0FJ_\u6280\u80FD",
    \u65E5\u671F\u7D22\u5F15: "\u231A\u65F6\u95F4, \u{1F504}\u5468\u671F\u6027, \u{1F304}\u60C5\u666F\u5F0F, \u23F3\u5012\u8BA1\u65F6, \u{1F3C6}\u91CC\u7A0B\u7891, \u{1F60A}\u5FC3\u60C5, \u2601\uFE0F\u4E60\u60EF, \u{1F4A1}\u7075\u611F, \u{1F4C8}\u6D3B\u8DC3\u65F6\u95F4",
    \u8BC4\u5206: "\u{1F31F}, \u{1F31F}\u{1F31F}, \u{1F31F}\u{1F31F}\u{1F31F}, \u{1F31F}\u{1F31F}\u{1F31F}\u{1F31F}, \u{1F31F}\u{1F31F}\u{1F31F}\u{1F31F}\u{1F31F}",
    \u8BC4\u5206_\u663E\u793A: "\u{1F31F}\xB7\u7D20\u6750, \u{1F31F}\u{1F31F}\xB7\u6574\u7406, \u{1F31F}\u{1F31F}\u{1F31F}\xB7\u5B9E\u8DF5, \u{1F31F}\u{1F31F}\u{1F31F}\u{1F31F}\xB7\u901A\u7528, \u{1F31F}\u{1F31F}\u{1F31F}\u{1F31F}\u{1F31F}\xB7\u4F53\u7CFB",
    \u7D22\u5F15_\u77E5\u8BC6\u5E93: "\u{1F4BC}\u6B63\u8D22\uFF08\u4E3B\u4E1A\uFF09, \u{1F9E7}\u504F\u8D22\uFF08\u526F\u4E1A\uFF09, \u{1F468}\u200D\u{1F3EB}\u6B63\u5370\uFF08\u524D\u8F88\uFF09, \u{1F465}\u504F\u5370\uFF08\u4F19\u4F34\uFF09, \u2764\uFE0F\u6B63\u5BAB\uFF08\u7231\u60C5\uFF09, \u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}\u4F24\u5B98\uFF08\u5BB6\u4EBA\uFF5C\u670B\u53CB\uFF09",
    \u7D22\u5F15_\u989C\u8272: "\u26AA\u7070\u8272\xB7\u7761\u7720, \u{1F535}\u84DD\u8272\xB7\u5DE5\u4F5C, \u{1F7E2}\u6DF1\u7EFF\xB7\u751F\u6D3B, \u{1F534}\u7EA2\u8272\xB7\u5A31\u4E50, \u{1F7E1}\u9EC4\u8272\xB7\u793E\u4EA4, \u{1F7E3}\u7D2B\u8272\xB7\u5B66\u4E60, \u{1F7E2}\u6D45\u7EFF\xB7\u8FD0\u52A8",
    "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988": "\u{1F4A1}\u60F3\u6CD5, \u{1F4CB}\u89C4\u5212, \u{1F680}\u6267\u884C, \u{1F6AB}\u53D7\u632B, \u{1F4AA}\u514B\u670D, \u{1F4DD}\u521D\u7A3F, \u{1F50D}\u5BA1\u6838, \u270F\uFE0F\u4FEE\u6539, \u2705\u5B8C\u6210, \u{1F4CA}\u590D\u76D8",
    \u7D22\u5F15_\u5757: "\u{1F4AD}\u62BD\u8C61, \u{1F3AF}\u5177\u8C61, \u2705\u7B80\u5355, \u{1F6A7}\u56F0\u96BE",
    \u7D22\u5F15_\u98CE\u9669: "\u{1F463}\u884C\u4E3A, \u2699\uFE0F\u7BA1\u7406, \u2764\uFE0F\u5065\u5EB7, \u{1F9E0}\u77E5\u8BC6, \u{1F5E3}\uFE0F\u793E\u4EA4, \u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}\u5BB6\u5EAD, \u{1F306}\u793E\u4F1A, \u{1F6A8}\u610F\u5916"
  };
  function normalizePropertyOptionValue(key, value) {
    const raw = value.trim();
    if (!raw)
      return "";
    if (key === "\u6807\u7B7E") {
      const tag = raw.match(/([SXLZQJ])(?:_|$)/)?.[1];
      return tag ?? raw;
    }
    if (key === "\u8BC4\u5206") {
      const explicit = raw.match(/[1-5]/)?.[0];
      if (explicit)
        return explicit;
      const stars = Array.from(raw.matchAll(/🌟/g)).length;
      return stars > 0 ? String(Math.min(stars, 5)) : raw;
    }
    if (key === "\u65E5\u671F\u7D22\u5F15") {
      const dateIndex = pickKnownValue(raw, ["\u65F6\u95F4", "\u5468\u671F\u6027", "\u60C5\u666F\u5F0F", "\u5012\u8BA1\u65F6", "\u91CC\u7A0B\u7891", "\u5FC3\u60C5", "\u4E60\u60EF", "\u7075\u611F", "\u6D3B\u8DC3\u65F6\u95F4"]);
      return dateIndex ? `#\u{1F4C5}\u65E5\u671F/${dateIndex}` : raw;
    }
    if (key === "\u7D22\u5F15_\u77E5\u8BC6\u5E93") {
      return pickKnownValue(raw, ["\u6B63\u8D22", "\u504F\u8D22", "\u6B63\u5370", "\u504F\u5370", "\u6B63\u5BAB", "\u4F24\u5B98"]) ?? raw;
    }
    if (key === "\u7D22\u5F15_\u989C\u8272") {
      const color = pickKnownValue(raw, ["\u7070\u8272", "\u84DD\u8272", "\u6DF1\u7EFF", "\u7EA2\u8272", "\u9EC4\u8272", "\u7D2B\u8272", "\u6D45\u7EFF"]);
      const domain = pickKnownValue(raw, ["\u7761\u7720", "\u5DE5\u4F5C", "\u751F\u6D3B", "\u5A31\u4E50", "\u793E\u4EA4", "\u5B66\u4E60", "\u8FD0\u52A8"]);
      return color && domain ? `${color}${domain}` : raw;
    }
    if (key === "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988") {
      return pickKnownValue(raw, ["\u60F3\u6CD5", "\u89C4\u5212", "\u6267\u884C", "\u53D7\u632B", "\u514B\u670D", "\u521D\u7A3F", "\u5BA1\u6838", "\u4FEE\u6539", "\u5B8C\u6210", "\u590D\u76D8"]) ?? raw;
    }
    if (key === "\u7D22\u5F15_\u5757") {
      return pickKnownValue(raw, ["\u62BD\u8C61", "\u5177\u8C61", "\u7B80\u5355", "\u56F0\u96BE"]) ?? raw;
    }
    if (key === "\u7D22\u5F15_\u98CE\u9669") {
      return pickKnownValue(raw, ["\u884C\u4E3A", "\u7BA1\u7406", "\u5065\u5EB7", "\u77E5\u8BC6", "\u793E\u4EA4", "\u5BB6\u5EAD", "\u793E\u4F1A", "\u610F\u5916"]) ?? raw;
    }
    return raw;
  }
  function pickKnownValue(raw, values) {
    return values.find((value) => raw.includes(value));
  }
  var DEFAULT_INTERPRETER_CONFIG = {
    enabled: true,
    autoRun: false,
    customProviderEnabled: false,
    provider: "NewAPI",
    baseUrl: "http://127.0.0.1:3000/v1",
    model: "smart",
    apiKey: "",
    excerptChars: 4e3,
    context: "\u4ECE\u9875\u9762\u6807\u9898\u3001URL\u3001\u6B63\u6587\u6458\u8981\u548C\u76EE\u6807\u76EE\u5F55\u63A8\u65AD Obsidian YAML \u5C5E\u6027\u3002\u901A\u8FC7 NewAPI \u89D2\u8272\u8DEF\u7531\u8C03\u7528\u672C\u5730\u4E2D\u8F6C\uFF1B\u4FDD\u6301\u4FDD\u5B88\uFF0C\u4E0D\u786E\u5B9A\u7684\u5B57\u6BB5\u7559\u7A7A\u3002"
  };
  async function loadConfig() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["syncConfig"], (result) => {
        resolve({ ...DEFAULT_CONFIG, ...result.syncConfig ?? {} });
      });
    });
  }
  async function loadPropertyTemplate() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["propertyTemplate"], (result) => {
        resolve({ ...DEFAULT_PROPERTY_TEMPLATE, ...result.propertyTemplate ?? {} });
      });
    });
  }
  async function loadPropertyOptions() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["propertyOptions"], (result) => {
        resolve({ ...DEFAULT_PROPERTY_OPTIONS, ...result.propertyOptions ?? {} });
      });
    });
  }
  async function loadInterpreterConfig() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["interpreterConfig"], (syncResult) => {
        chrome.storage.local.get(["interpreterApiKey"], (localResult) => {
          resolve({
            ...DEFAULT_INTERPRETER_CONFIG,
            ...syncResult.interpreterConfig ?? {},
            apiKey: localResult.interpreterApiKey ?? ""
          });
        });
      });
    });
  }
  async function suggestMetaWithInterpreter(config, input) {
    if (!config.enabled)
      throw new Error("\u89E3\u91CA\u5668\u672A\u542F\u7528");
    if (!config.baseUrl || !config.model)
      throw new Error("\u8BF7\u5148\u914D\u7F6E AI \u4E2D\u8F6C\u5730\u5740\u548C\u8DEF\u7531\u6A21\u578B");
    if (/newapi/i.test(config.provider) && !config.apiKey)
      throw new Error("\u8BF7\u5148\u5728 AI \u89E3\u91CA\u5668\u8BBE\u7F6E\u91CC\u586B\u5199 NewAPI API Key");
    const endpoint = `${config.baseUrl.replace(/\/+$/, "")}/chat/completions`;
    const headers = { "Content-Type": "application/json" };
    if (config.apiKey)
      headers.Authorization = `Bearer ${config.apiKey}`;
    let res;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: config.model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: [
                "\u4F60\u662F Obsidian \u77E5\u8BC6\u5E93\u540C\u6B65\u63D2\u4EF6\u7684\u5C5E\u6027\u5EFA\u8BAE\u5668\u3002",
                "\u53EA\u6839\u636E\u7ED9\u5B9A\u6807\u9898\u3001URL\u3001\u76EE\u5F55\u548C\u53EF\u9009\u9879\u5EFA\u8BAE YAML \u5C5E\u6027\u3002",
                "\u4EBA\u5DE5\u786E\u8BA4\u4F18\u5148\uFF1B\u4F60\u53EA\u63D0\u4F9B\u5EFA\u8BAE\uFF0C\u4E0D\u8981\u7F16\u9020\u6CA1\u6709\u8BC1\u636E\u7684\u5B57\u6BB5\u3002",
                "\u8F93\u51FA\u4E25\u683C JSON\uFF0C\u4E0D\u8981 Markdown\u3002"
              ].join("\n")
            },
            {
              role: "user",
              content: JSON.stringify({
                task: "\u4E3A\u98DE\u4E66\u6587\u6863\u5EFA\u8BAE Obsidian YAML \u5C5E\u6027",
                title: input.title,
                source: input.source,
                targetDir: input.dir,
                excerpt: input.excerpt ?? "",
                template: input.template,
                options: input.options,
                rules: {
                  \u6807\u7B7E: "\u5FC5\u987B\u4ECE S/X/L/Z/Q/J \u4E2D\u9009\u4E00\u4E2A\uFF1B\u4E0D\u786E\u5B9A\u9009 S\u3002",
                  \u8BC4\u5206: "\u53EF\u4E3A\u7A7A\uFF1B\u6709\u8BC1\u636E\u65F6\u4ECE 1-5 \u9009\u4E00\u4E2A\u3002",
                  \u8BC4\u5206_\u663E\u793A: "\u4E0E\u8BC4\u5206\u5BF9\u5E94\uFF1A\u{1F31F}\uFF5C\u7D20\u6750 \u5230 \u{1F31F}\u{1F31F}\u{1F31F}\u{1F31F}\u{1F31F}\uFF5C\u4F53\u7CFB\u3002",
                  \u65E5\u671F\u7D22\u5F15: "\u53EF\u591A\u9009\uFF1A#\u{1F4C5}\u65E5\u671F/\u65F6\u95F4\u3001#\u{1F4C5}\u65E5\u671F/\u5468\u671F\u6027\u3001#\u{1F4C5}\u65E5\u671F/\u60C5\u666F\u5F0F\u3001#\u{1F4C5}\u65E5\u671F/\u5012\u8BA1\u65F6\u3001#\u{1F4C5}\u65E5\u671F/\u91CC\u7A0B\u7891\u3001#\u{1F4C5}\u65E5\u671F/\u5FC3\u60C5\u3001#\u{1F4C5}\u65E5\u671F/\u4E60\u60EF\u3001#\u{1F4C5}\u65E5\u671F/\u7075\u611F\u3001#\u{1F4C5}\u65E5\u671F/\u6D3B\u8DC3\u65F6\u95F4\uFF1B\u666E\u901A\u6587\u7AE0\u8FD4\u56DE\u7A7A\u6570\u7EC4\u3002",
                  \u6982\u8FF0: "\u751F\u6210 1-3 \u53E5\u300180-160 \u5B57\u7684\u6587\u6863\u6982\u8FF0\u3002\u6982\u8FF0\u8981\u8BF4\u660E\u4E3B\u9898\u3001\u7528\u9014\u548C\u53EF\u590D\u7528\u4EF7\u503C\uFF0C\u65B9\u4FBF\u672A\u6765 AI \u4E0D\u8BFB\u5168\u6587\u4E5F\u80FD\u5224\u65AD\u5185\u5BB9\u3002",
                  \u7D22\u5F15_\u77E5\u8BC6\u5E93: "\u4ECE\u6B63\u8D22/\u504F\u8D22/\u6B63\u5370/\u504F\u5370/\u6B63\u5BAB/\u4F24\u5B98\u4E2D\u9009\uFF0C\u6CA1\u8BC1\u636E\u7559\u7A7A\u3002",
                  \u7D22\u5F15_\u989C\u8272: "\u4ECE\u989C\u8272\u7D22\u5F15\u4E2D\u9009\u4E00\u4E2A\uFF0C\u6CA1\u8BC1\u636E\u7559\u7A7A\u3002",
                  "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988": "\u8FD4\u56DE\u6570\u7EC4\uFF0C\u6700\u591A 2 \u9879\u3002\u7B2C\u4E00\u7EC4\u53EA\u53EF\u9009\u4E00\u4E2A\uFF1A\u60F3\u6CD5/\u89C4\u5212/\u6267\u884C/\u53D7\u632B/\u514B\u670D\uFF1B\u7B2C\u4E8C\u7EC4\u53EA\u53EF\u9009\u4E00\u4E2A\uFF1A\u521D\u7A3F/\u5BA1\u6838/\u4FEE\u6539/\u5B8C\u6210/\u590D\u76D8\u3002\u4E0D\u786E\u5B9A\u7684\u7EC4\u7559\u7A7A\uFF0C\u4E0D\u80FD\u540C\u7EC4\u591A\u9009\u3002",
                  \u7D22\u5F15_\u5757: "\u8FD4\u56DE\u6570\u7EC4\uFF0C\u6700\u591A 2 \u9879\u3002\u7B2C\u4E00\u7EC4\u53EA\u53EF\u9009\u4E00\u4E2A\uFF1A\u62BD\u8C61/\u5177\u8C61\uFF1B\u7B2C\u4E8C\u7EC4\u53EA\u53EF\u9009\u4E00\u4E2A\uFF1A\u7B80\u5355/\u56F0\u96BE\u3002\u4E0D\u786E\u5B9A\u7684\u7EC4\u7559\u7A7A\uFF0C\u4E0D\u80FD\u540C\u7EC4\u591A\u9009\u3002",
                  \u7D22\u5F15_\u98CE\u9669: "\u53EF\u591A\u9009\uFF1A\u884C\u4E3A/\u7BA1\u7406/\u5065\u5EB7/\u77E5\u8BC6/\u793E\u4EA4/\u5BB6\u5EAD/\u793E\u4F1A/\u610F\u5916\uFF0C\u6CA1\u8BC1\u636E\u8FD4\u56DE\u7A7A\u6570\u7EC4\u3002",
                  \u5173\u952E\u8BCD: "\u63D0\u53D6 3-6 \u4E2A\u5173\u952E\u8BCD\uFF0C\u7528\u987F\u53F7\u5206\u9694\u3002"
                },
                outputSchema: {
                  \u6807\u7B7E: "string",
                  \u65E5\u671F\u7D22\u5F15: "string_array",
                  \u5173\u952E\u8BCD: "string",
                  \u6982\u8FF0: "string",
                  \u8BC4\u5206: "number_or_empty_string",
                  \u8BC4\u5206_\u663E\u793A: "string",
                  \u7D22\u5F15_\u77E5\u8BC6\u5E93: "string",
                  \u7D22\u5F15_\u989C\u8272: "string",
                  "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988": "string_array",
                  \u7D22\u5F15_\u5757: "string_array",
                  \u7D22\u5F15_\u98CE\u9669: "string_array"
                }
              })
            }
          ]
        })
      });
    } catch (err) {
      throw new Error(`\u65E0\u6CD5\u8FDE\u63A5 AI \u4E2D\u8F6C\uFF1A${err instanceof Error ? err.message : String(err)}\u3002\u8BF7\u786E\u8BA4 ${config.baseUrl} \u53EF\u8BBF\u95EE\uFF0C\u4E14 Chrome \u5DF2\u91CD\u8F7D\u6269\u5C55\u3002`);
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `AI \u8BF7\u6C42\u5931\u8D25\uFF1AHTTP ${res.status}`);
    }
    const content = data.choices?.[0]?.message?.content;
    if (!content)
      throw new Error("AI \u672A\u8FD4\u56DE\u5EFA\u8BAE\u5185\u5BB9");
    try {
      return JSON.parse(content);
    } catch {
      throw new Error(`AI \u8FD4\u56DE\u975E JSON\uFF1A${content.slice(0, 160)}`);
    }
  }
  function baseUrl(config) {
    return `http://${config.host}:${config.port}`;
  }
  async function request(config, method, path, body, timeoutMs = 6e4) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${baseUrl(config)}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          [TOKEN_HEADER]: config.token
        },
        body: body ? JSON.stringify(body) : void 0,
        signal: controller.signal
      });
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`OB \u63D2\u4EF6\u8FD4\u56DE\u975E JSON\uFF1A${text.slice(0, 200)}`);
      }
      if (!res.ok) {
        const err = data;
        if (res.status === 401 || err.code === "UNAUTHORIZED") {
          throw new Error("OB \u63D2\u4EF6\u542F\u52A8\u4EE4\u724C\u65E0\u6548\u6216\u672A\u586B\u5199\u3002\u8BF7\u5728 Obsidian\u300C\u98DE\u4E66\u540C\u6B65\u300D\u8BBE\u7F6E\u9875\u590D\u5236\u542F\u52A8\u4EE4\u724C\uFF0C\u518D\u5230\u6D4F\u89C8\u5668\u6269\u5C55\u8BBE\u7F6E\u9875\u4FDD\u5B58\u540C\u4E00\u4E2A\u4EE4\u724C\u3002");
        }
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      return data;
    } finally {
      clearTimeout(timer);
    }
  }
  async function getStatus(config) {
    return request(config, "GET", "/status", void 0, 5e3);
  }
  async function getTree(config) {
    return request(config, "GET", "/tree?maxDepth=12", void 0, 1e4);
  }
  async function postFetch(config, req) {
    return request(config, "POST", "/fetch", req, 12e4);
  }
  async function postExists(config, req) {
    return request(config, "POST", "/exists", req, 1e4);
  }
  async function testConnection(config) {
    try {
      const status = await getStatus(config);
      if (!status.larkReady) {
        return { ok: false, message: `OB \u63D2\u4EF6\u5DF2\u8FDE\u63A5\uFF0C\u4F46 lark-cli \u672A\u5C31\u7EEA\uFF08${status.larkVersion ?? "\u672A\u627E\u5230"}\uFF09` };
      }
      return {
        ok: true,
        message: `\u2705 \u8FDE\u63A5\u6210\u529F\uFF1Avault=${status.vault}\uFF0Clark-cli=${status.larkVersion}`
      };
    } catch (err) {
      return {
        ok: false,
        message: `\u274C \u8FDE\u63A5\u5931\u8D25\uFF1A${err instanceof Error ? err.message : String(err)}`
      };
    }
  }

  // src/content/content.ts
  var BUTTON_ID = "feishu-sync-btn";
  var PANEL_ID = "feishu-sync-panel";
  var PANEL_BACKDROP_ID = "feishu-sync-panel-backdrop";
  var DEFAULT_AI_EXCERPT_CHARS = 4e3;
  var META_FIELDS = [
    { key: "\u6807\u7B7E", label: "\u6807\u7B7E", type: "text", help: "S / X / L / Z / Q / J" },
    { key: "\u7F16\u7801", label: "\u7F16\u7801", type: "text" },
    { key: "\u8F93\u5165", label: "\u8F93\u5165", type: "text" },
    { key: "\u65E5\u671F", label: "\u65E5\u671F", type: "date" },
    { key: "\u65E5\u671F\u7D22\u5F15", label: "\u65E5\u671F\u7D22\u5F15", type: "text", help: "\u591A\u4E2A\u503C\u7528\u9017\u53F7\u6216\u987F\u53F7\u5206\u9694" },
    { key: "\u5173\u952E\u8BCD", label: "\u5173\u952E\u8BCD", type: "textarea", help: "\u591A\u4E2A\u5173\u952E\u8BCD\u7528\u987F\u53F7\u5206\u9694" },
    { key: "\u6982\u8FF0", label: "\u6982\u8FF0", type: "textarea", help: "80-160 \u5B57\uFF0C\u65B9\u4FBF\u4EE5\u540E AI \u5FEB\u901F\u8BC6\u522B\u6587\u6863\u5185\u5BB9" },
    { key: "\u8BC4\u5206", label: "\u8BC4\u5206", type: "number" },
    { key: "\u8BC4\u5206_\u663E\u793A", label: "\u8BC4\u5206_\u663E\u793A", type: "text" },
    { key: "\u7D22\u5F15_\u77E5\u8BC6\u5E93", label: "\u7D22\u5F15_\u77E5\u8BC6\u5E93", type: "text" },
    { key: "\u7D22\u5F15_\u989C\u8272", label: "\u7D22\u5F15_\u989C\u8272", type: "text" },
    { key: "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988", label: "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988", type: "grouped", help: "\u6BCF\u7EC4\u6700\u591A\u9009\u4E00\u4E2A" },
    { key: "\u7D22\u5F15_\u5757", label: "\u7D22\u5F15_\u5757", type: "grouped", help: "\u62BD\u8C61/\u5177\u8C61\u9009\u4E00\u4E2A\uFF0C\u7B80\u5355/\u56F0\u96BE\u9009\u4E00\u4E2A" },
    { key: "\u7D22\u5F15_\u98CE\u9669", label: "\u7D22\u5F15_\u98CE\u9669", type: "text", help: "\u591A\u4E2A\u503C\u7528\u9017\u53F7\u6216\u987F\u53F7\u5206\u9694" }
  ];
  var SELECT_FIELDS = /* @__PURE__ */ new Set([
    "\u6807\u7B7E",
    "\u8BC4\u5206",
    "\u8BC4\u5206_\u663E\u793A",
    "\u7D22\u5F15_\u77E5\u8BC6\u5E93",
    "\u7D22\u5F15_\u989C\u8272"
  ]);
  var GROUPED_FIELDS = {
    "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988": [
      {
        name: "\u52A8\u4F5C\u72B6\u6001",
        options: [
          { label: "\u{1F4A1}\u60F3\u6CD5", value: "\u60F3\u6CD5" },
          { label: "\u{1F4CB}\u89C4\u5212", value: "\u89C4\u5212" },
          { label: "\u{1F680}\u6267\u884C", value: "\u6267\u884C" },
          { label: "\u{1F6AB}\u53D7\u632B", value: "\u53D7\u632B" },
          { label: "\u{1F4AA}\u514B\u670D", value: "\u514B\u670D" }
        ]
      },
      {
        name: "\u4EA7\u51FA\u9636\u6BB5",
        options: [
          { label: "\u{1F4DD}\u521D\u7A3F", value: "\u521D\u7A3F" },
          { label: "\u{1F50D}\u5BA1\u6838", value: "\u5BA1\u6838" },
          { label: "\u270F\uFE0F\u4FEE\u6539", value: "\u4FEE\u6539" },
          { label: "\u2705\u5B8C\u6210", value: "\u5B8C\u6210" },
          { label: "\u{1F4CA}\u590D\u76D8", value: "\u590D\u76D8" }
        ]
      }
    ],
    \u7D22\u5F15_\u5757: [
      {
        name: "\u62BD\u8C61\u5EA6",
        options: [
          { label: "\u{1F4AD}\u62BD\u8C61", value: "\u62BD\u8C61" },
          { label: "\u{1F3AF}\u5177\u8C61", value: "\u5177\u8C61" }
        ]
      },
      {
        name: "\u96BE\u5EA6",
        options: [
          { label: "\u2705\u7B80\u5355", value: "\u7B80\u5355" },
          { label: "\u{1F6A7}\u56F0\u96BE", value: "\u56F0\u96BE" }
        ]
      }
    ]
  };
  function extractTokenFromUrl() {
    const url = window.location.href;
    const wikiMatch = url.match(/\/wiki\/([A-Za-z0-9]+)/);
    if (wikiMatch)
      return { node_token: wikiMatch[1] };
    const docxMatch = url.match(/\/(?:docx|doc)\/([A-Za-z0-9]+)/);
    if (docxMatch)
      return { obj_token: docxMatch[1] };
    return null;
  }
  function isDocPage() {
    return /\/(wiki|docx|doc)\//.test(window.location.pathname);
  }
  function waitForElement(selector, timeout = 1e4) {
    return new Promise((resolve) => {
      const existing = document.querySelector(selector);
      if (existing)
        return resolve(existing);
      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }
  async function injectButton() {
    if (document.getElementById(BUTTON_ID))
      return;
    if (!isDocPage())
      return;
    let mount = await waitForElement('.doc-title, .wiki-title, [data-testid="doc-title"]', 5e3);
    if (!mount) {
      mount = document.body;
    }
    const btn = document.createElement("button");
    btn.id = BUTTON_ID;
    btn.textContent = "\u540C\u6B65\u5230 OB";
    btn.title = "\u9884\u89C8\u5E76\u540C\u6B65\u6B64\u98DE\u4E66\u6587\u6863\u5230 Obsidian";
    btn.className = "feishu-sync-fab";
    btn.onclick = onSyncClick;
    if (mount === document.body) {
      document.body.appendChild(btn);
    } else {
      btn.style.marginLeft = "12px";
      mount.parentElement?.insertBefore(btn, mount.nextSibling);
    }
  }
  async function onSyncClick(event) {
    const tokenInfo = extractTokenFromUrl();
    if (!tokenInfo?.node_token && !tokenInfo?.obj_token) {
      openPanelShell("\u65E0\u6CD5\u8BC6\u522B\u5F53\u524D\u98DE\u4E66\u6587\u6863 token", "error");
      return;
    }
    if (!event?.altKey) {
      chrome.runtime.sendMessage({
        type: "feishu-sync-trigger",
        payload: {
          title: getDocumentTitle(),
          url: window.location.href,
          docToken: tokenInfo,
          domain: window.location.hostname
        }
      }).catch(() => openPanelShell("\u6269\u5C55\u8FDE\u63A5\u5DF2\u5931\u6548\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u540E\u91CD\u8BD5\u3002", "error"));
      return;
    }
    const [config, propertyTemplate, propertyOptions, interpreter] = await Promise.all([
      loadConfig(),
      loadPropertyTemplate(),
      loadPropertyOptions(),
      loadInterpreterConfig()
    ]);
    const nodeToken = tokenInfo.node_token || tokenInfo.obj_token;
    const state = {
      config,
      propertyTemplate,
      propertyOptions,
      interpreter,
      tokenInfo,
      nodeToken,
      title: getDocumentTitle(),
      source: window.location.href,
      dirs: [],
      fallbackDir: ""
    };
    renderPreviewPanel(state, "\u6B63\u5728\u52A0\u8F7D\u76EE\u5F55\u548C\u540C\u6B65\u72B6\u6001...", "info");
    if (!config.token) {
      updatePanelStatus("\u8BF7\u5148\u5728\u6269\u5C55\u5F39\u7A97\u914D\u7F6E OB \u63D2\u4EF6\u5730\u5740\u548C\u4EE4\u724C", "error");
      return;
    }
    try {
      const exists = await postExists(config, { node_token: nodeToken });
      if (exists.exists) {
        state.existingPath = exists.path;
        state.fallbackDir = dirname(exists.path);
      }
    } catch {
      state.existingPath = void 0;
    }
    try {
      const tree = await getTree(config);
      state.dirs = tree.dirs;
      state.fallbackDir = state.fallbackDir || tree.dirs[0]?.path || "";
    } catch (err) {
      state.treeError = err instanceof Error ? err.message : String(err);
    }
    renderPreviewPanel(state, getReadyMessage(state), state.treeError ? "error" : "idle");
  }
  function getDocumentTitle() {
    const candidates = [
      document.querySelector(".doc-title"),
      document.querySelector(".wiki-title"),
      document.querySelector('[data-testid="doc-title"]'),
      document.querySelector("h1")
    ];
    const title = candidates.map((el) => el?.innerText?.trim()).find(Boolean);
    return title || document.title.replace(/\s*[-|].*$/, "").trim() || "\u672A\u547D\u540D\u98DE\u4E66\u6587\u6863";
  }
  function getDocumentExcerpt(limit = DEFAULT_AI_EXCERPT_CHARS) {
    const candidates = [
      document.querySelector('[data-testid="doc-content"]'),
      document.querySelector(".docx-content"),
      document.querySelector(".wiki-content"),
      document.querySelector(".suite-web-doc-body"),
      document.querySelector("main"),
      document.body
    ];
    const text = candidates.map((el) => el?.innerText || el?.textContent || "").map((value) => value.replace(/\s+/g, " ").trim()).find((value) => value.length > 80) || document.body.innerText.replace(/\s+/g, " ").trim();
    return text.slice(0, limit);
  }
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "GET_FEISHU_DOC_EXCERPT")
      return false;
    const limit = Number(message.limit) || DEFAULT_AI_EXCERPT_CHARS;
    sendResponse({
      ok: true,
      title: getDocumentTitle(),
      excerpt: getDocumentExcerpt(limit)
    });
    return false;
  });
  function dirname(path) {
    if (!path)
      return "";
    const parts = path.split("/").filter(Boolean);
    if (parts.length <= 1)
      return "";
    return parts.slice(0, -1).join("/");
  }
  function getReadyMessage(state) {
    if (state.treeError) {
      return `\u76EE\u5F55\u6811\u52A0\u8F7D\u5931\u8D25\uFF0C\u53EF\u624B\u52A8\u586B\u5199\u76EE\u5F55\uFF1A${state.treeError}`;
    }
    if (state.existingPath) {
      return `\u68C0\u6D4B\u5230\u5DF2\u540C\u6B65\u6587\u4EF6\uFF1A${state.existingPath}\uFF0C\u786E\u8BA4\u540E\u5C06\u66F4\u65B0`;
    }
    return "\u8BF7\u786E\u8BA4\u76EE\u5F55\u548C\u5C5E\u6027\uFF0C\u786E\u8BA4\u540E\u5F00\u59CB\u540C\u6B65";
  }
  function openPanelShell(message, type) {
    const config = { host: "", port: 0, token: "" };
    const propertyTemplate = {
      \u6807\u7B7E: "S",
      \u7F16\u7801: "",
      \u8F93\u5165: "",
      \u65E5\u671F: "",
      \u65E5\u671F\u7D22\u5F15: "",
      \u5173\u952E\u8BCD: "",
      \u6982\u8FF0: "",
      \u8BC4\u5206: "",
      \u8BC4\u5206_\u663E\u793A: "",
      \u7D22\u5F15_\u77E5\u8BC6\u5E93: "",
      \u7D22\u5F15_\u989C\u8272: "",
      "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988": "",
      \u7D22\u5F15_\u5757: "",
      \u7D22\u5F15_\u98CE\u9669: ""
    };
    renderPreviewPanel({
      config,
      propertyTemplate,
      propertyOptions: DEFAULT_PROPERTY_OPTIONS,
      interpreter: { ...DEFAULT_INTERPRETER_CONFIG, enabled: false, autoRun: false },
      tokenInfo: {},
      nodeToken: "",
      title: getDocumentTitle(),
      source: window.location.href,
      dirs: [],
      fallbackDir: ""
    }, message, type);
  }
  function renderPreviewPanel(state, statusMessage, statusType) {
    closePreviewPanel();
    const backdrop = document.createElement("div");
    backdrop.id = PANEL_BACKDROP_ID;
    backdrop.className = "feishu-sync-panel-backdrop";
    const panel = document.createElement("aside");
    panel.id = PANEL_ID;
    panel.className = "feishu-sync-panel";
    panel.setAttribute("aria-label", "\u540C\u6B65\u5230 Obsidian \u9884\u89C8\u9762\u677F");
    const header = document.createElement("div");
    header.className = "feishu-sync-panel-header";
    header.innerHTML = `
    <div>
      <p class="feishu-sync-eyebrow">Obsidian Sync</p>
      <h2>\u540C\u6B65\u524D\u9884\u89C8</h2>
    </div>
    <button class="feishu-sync-icon-btn" type="button" aria-label="\u5173\u95ED">\xD7</button>
  `;
    const closeBtn = header.querySelector(".feishu-sync-icon-btn");
    closeBtn.onclick = closePreviewPanel;
    const body = document.createElement("div");
    body.className = "feishu-sync-panel-body";
    const summary = document.createElement("section");
    summary.className = "feishu-sync-section";
    summary.innerHTML = `
    <div class="feishu-sync-doc-title">${escapeHtml(state.title)}</div>
    <a class="feishu-sync-source" href="${escapeAttribute(state.source)}" target="_blank" rel="noreferrer">${escapeHtml(state.source)}</a>
    <div class="feishu-sync-interpreter">${escapeHtml(getInterpreterSummary(state))}</div>
  `;
    const directory = document.createElement("section");
    directory.className = "feishu-sync-section";
    directory.appendChild(createSectionTitle("\u76EE\u6807\u76EE\u5F55"));
    directory.appendChild(createDirectoryControl(state));
    const formSection = document.createElement("section");
    formSection.className = "feishu-sync-section";
    formSection.appendChild(createSectionTitle("YAML \u5C5E\u6027"));
    formSection.appendChild(createMetaForm(state));
    const status = document.createElement("div");
    status.className = `feishu-sync-status feishu-sync-status-${statusType}`;
    status.dataset.status = "true";
    status.textContent = statusMessage;
    body.append(summary, directory, formSection, status);
    const footer = document.createElement("div");
    footer.className = "feishu-sync-panel-footer";
    footer.innerHTML = `
    <button class="feishu-sync-secondary" type="button">\u53D6\u6D88</button>
    <button class="feishu-sync-suggest" type="button">AI \u5EFA\u8BAE</button>
    <button class="feishu-sync-primary" type="button">\u540C\u6B65</button>
  `;
    const cancelBtn = footer.querySelector(".feishu-sync-secondary");
    const suggestBtn = footer.querySelector(".feishu-sync-suggest");
    const syncBtn = footer.querySelector(".feishu-sync-primary");
    cancelBtn.onclick = closePreviewPanel;
    suggestBtn.onclick = () => suggestMeta(state);
    syncBtn.onclick = () => confirmSync(state);
    suggestBtn.disabled = !state.interpreter.enabled;
    syncBtn.disabled = !state.config.token || !state.nodeToken;
    panel.append(header, body, footer);
    backdrop.onclick = closePreviewPanel;
    document.body.append(backdrop, panel);
  }
  function createSectionTitle(title) {
    const heading = document.createElement("h3");
    heading.className = "feishu-sync-section-title";
    heading.textContent = title;
    return heading;
  }
  function createDirectoryControl(state) {
    const wrapper = document.createElement("div");
    wrapper.className = "feishu-sync-dir-control";
    if (state.dirs.length > 0) {
      const select = document.createElement("select");
      select.className = "feishu-sync-dir-select";
      select.name = "feishu-sync-dir";
      state.dirs.forEach((dir) => {
        const option = document.createElement("option");
        option.value = dir.path;
        option.textContent = `${dir.depth > 0 ? "  ".repeat(dir.depth - 1) : ""}${dir.label}`;
        option.selected = dir.path === state.fallbackDir;
        select.appendChild(option);
      });
      wrapper.appendChild(select);
      return wrapper;
    }
    const input = document.createElement("input");
    input.className = "feishu-sync-dir-input";
    input.name = "feishu-sync-dir";
    input.placeholder = "\u4F8B\u5982\uFF1A0\uFE0F\u20E3\u8F93\u5165/\u{1F4A1}\u788E\u7247\u8F93\u5165\uFF08\u95EA\u5FF5\uFF09";
    input.value = state.fallbackDir;
    wrapper.appendChild(input);
    return wrapper;
  }
  function createMetaForm(state) {
    const form = document.createElement("div");
    form.className = "feishu-sync-meta-form";
    const defaults = getDefaultMeta(state);
    META_FIELDS.forEach((field) => {
      const row = document.createElement("label");
      row.className = `feishu-sync-field feishu-sync-field-${field.type}`;
      const label = document.createElement("span");
      label.className = "feishu-sync-field-label";
      label.textContent = field.label;
      const control = createMetaControl(field, defaults[field.key], state.propertyOptions[field.key]);
      row.append(label, control);
      if (field.help) {
        const help = document.createElement("small");
        help.textContent = field.help;
        row.appendChild(help);
      }
      form.appendChild(row);
    });
    return form;
  }
  function createMetaControl(field, value, rawOptions) {
    const options = parseOptions(rawOptions);
    const stringValue = Array.isArray(value) ? value.join("\u3001") : String(value ?? "");
    if (field.type === "grouped") {
      return createGroupedControl(field.key, stringValue);
    }
    if (SELECT_FIELDS.has(field.key) && options.length > 0) {
      const select = document.createElement("select");
      select.dataset.metaKey = field.key;
      appendOption(select, "", "\u672A\u9009\u62E9");
      const optionValues = options.map((option) => normalizePropertyOptionValue(field.key, option));
      options.forEach((option, index) => appendOption(select, optionValues[index], option));
      const normalizedValue = normalizePropertyOptionValue(field.key, stringValue);
      if (normalizedValue && !optionValues.includes(normalizedValue))
        appendOption(select, normalizedValue, stringValue);
      select.value = normalizedValue;
      return select;
    }
    if (field.type === "textarea") {
      const textarea = document.createElement("textarea");
      textarea.dataset.metaKey = field.key;
      textarea.rows = field.key === "\u6982\u8FF0" ? 4 : field.key === "\u5173\u952E\u8BCD" ? 3 : 2;
      textarea.value = stringValue;
      return textarea;
    }
    const input = document.createElement("input");
    input.dataset.metaKey = field.key;
    input.type = field.type;
    input.value = stringValue;
    if (field.type === "number") {
      input.min = "0";
      input.max = "5";
      input.step = "1";
    }
    if (options.length > 0) {
      const wrapper = document.createElement("div");
      wrapper.className = "feishu-sync-option-input";
      const listId = `feishu-sync-options-${encodeURIComponent(field.key)}`;
      input.setAttribute("list", listId);
      const datalist = document.createElement("datalist");
      datalist.id = listId;
      options.forEach((option) => appendOption(datalist, option, option));
      wrapper.append(input, datalist);
      return wrapper;
    }
    return input;
  }
  function getDefaultMeta(state) {
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const keywords = draftKeywords(state.title);
    const templateVars = {
      title: state.title,
      url: state.source,
      date: today,
      dir: state.fallbackDir,
      keywords: keywords.join("\u3001")
    };
    return {
      \u6807\u7B7E: applyTemplate(state.propertyTemplate.\u6807\u7B7E || "S", templateVars),
      \u7F16\u7801: applyTemplate(state.propertyTemplate.\u7F16\u7801, templateVars),
      \u8F93\u5165: applyTemplate(state.propertyTemplate.\u8F93\u5165 || state.fallbackDir, templateVars),
      \u65E5\u671F: applyTemplate(state.propertyTemplate.\u65E5\u671F || today, templateVars),
      \u65E5\u671F\u7D22\u5F15: applyTemplate(state.propertyTemplate.\u65E5\u671F\u7D22\u5F15, templateVars),
      \u5173\u952E\u8BCD: applyTemplate(state.propertyTemplate.\u5173\u952E\u8BCD || keywords.join("\u3001"), templateVars),
      \u6982\u8FF0: applyTemplate(state.propertyTemplate.\u6982\u8FF0, templateVars),
      \u8BC4\u5206: state.propertyTemplate.\u8BC4\u5206,
      \u8BC4\u5206_\u663E\u793A: applyTemplate(state.propertyTemplate.\u8BC4\u5206_\u663E\u793A, templateVars),
      \u7D22\u5F15_\u77E5\u8BC6\u5E93: applyTemplate(state.propertyTemplate.\u7D22\u5F15_\u77E5\u8BC6\u5E93, templateVars),
      \u7D22\u5F15_\u989C\u8272: applyTemplate(state.propertyTemplate.\u7D22\u5F15_\u989C\u8272, templateVars),
      "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988": applyTemplate(state.propertyTemplate["\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988"], templateVars),
      \u7D22\u5F15_\u5757: applyTemplate(state.propertyTemplate.\u7D22\u5F15_\u5757, templateVars),
      \u7D22\u5F15_\u98CE\u9669: applyTemplate(state.propertyTemplate.\u7D22\u5F15_\u98CE\u9669, templateVars)
    };
  }
  function applyTemplate(template, vars) {
    return String(template ?? "").replace(/\{\{(\w+)\}\}/g, (_full, key) => vars[key] ?? "");
  }
  function getInterpreterSummary(state) {
    if (!state.interpreter.enabled)
      return "\u89E3\u91CA\u5668\uFF1A\u5173\u95ED\u3002\u5C06\u4EC5\u4F7F\u7528\u5C5E\u6027\u6A21\u677F\u9884\u586B\u3002";
    const mode = state.interpreter.provider || "\u672C\u5730\u89C4\u5219";
    return `\u89E3\u91CA\u5668\uFF1A${mode}${state.interpreter.autoRun ? "\uFF0C\u5DF2\u81EA\u52A8\u751F\u6210\u5EFA\u8BAE" : "\uFF0C\u540C\u6B65\u524D\u53EF\u6309\u6A21\u677F\u624B\u52A8\u786E\u8BA4"}`;
  }
  function draftKeywords(title) {
    const words = title.replace(/[^\p{Script=Han}\p{Letter}\p{Number}]+/gu, " ").split(/\s+/).map((word) => word.trim()).filter((word) => word.length >= 2);
    return Array.from(new Set(words)).slice(0, 6);
  }
  async function confirmSync(state) {
    const panel = document.getElementById(PANEL_ID);
    if (!panel)
      return;
    const syncBtn = panel.querySelector(".feishu-sync-primary");
    const dirControl = panel.querySelector('[name="feishu-sync-dir"]');
    const dir = dirControl?.value.trim() || void 0;
    const meta = collectMeta(panel);
    if (!dir) {
      updatePanelStatus("\u8BF7\u9009\u62E9\u6216\u586B\u5199\u76EE\u6807\u76EE\u5F55\u540E\u518D\u540C\u6B65\u3002", "error");
      return;
    }
    syncBtn.disabled = true;
    updatePanelStatus("\u6B63\u5728\u8FDE\u63A5 OB \u63D2\u4EF6...", "info");
    const conn = await testConnection(state.config);
    if (!conn.ok) {
      syncBtn.disabled = false;
      updatePanelStatus(conn.message, "error");
      return;
    }
    updatePanelStatus("\u6B63\u5728\u6293\u53D6\u5E76\u5199\u5165 Obsidian...", "info");
    try {
      const payload = {
        node_token: state.nodeToken,
        obj_token: state.tokenInfo.obj_token,
        dir,
        meta
      };
      const result = await postFetch(state.config, payload);
      const codeMsg = result.\u7F16\u7801 ? `\uFF08\u7F16\u7801 ${result.\u7F16\u7801}\uFF09` : "";
      updatePanelStatus(`${result.action === "created" ? "\u5DF2\u521B\u5EFA" : "\u5DF2\u66F4\u65B0"}\uFF1A${result.path}${codeMsg}`, "success");
    } catch (err) {
      syncBtn.disabled = false;
      updatePanelStatus(`\u540C\u6B65\u5931\u8D25\uFF1A${err instanceof Error ? err.message : String(err)}`, "error");
    }
  }
  function collectMeta(panel) {
    const meta = {};
    panel.querySelectorAll("[data-meta-key]").forEach((control) => {
      const key = control.dataset.metaKey;
      if (!key)
        return;
      if (key === "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988") {
        meta[key] = splitList(control.value).map((item) => normalizePropertyOptionValue(key, item)).join("\u3001");
        return;
      }
      if (key === "\u65E5\u671F\u7D22\u5F15" || key === "\u7D22\u5F15_\u5757" || key === "\u7D22\u5F15_\u98CE\u9669") {
        meta[key] = splitList(control.value).map((item) => normalizePropertyOptionValue(key, item));
        return;
      }
      if (key === "\u8BC4\u5206") {
        const normalized = normalizePropertyOptionValue(key, control.value);
        meta[key] = normalized === "" ? "" : Number(normalized);
        return;
      }
      meta[key] = normalizePropertyOptionValue(key, control.value);
    });
    return meta;
  }
  async function suggestMeta(state) {
    const panel = document.getElementById(PANEL_ID);
    if (!panel)
      return;
    const button = panel.querySelector(".feishu-sync-suggest");
    const dirControl = panel.querySelector('[name="feishu-sync-dir"]');
    const dir = dirControl?.value.trim() || state.fallbackDir;
    if (button)
      button.disabled = true;
    updatePanelStatus("\u6B63\u5728\u8BFB\u53D6\u6B63\u6587\u524D\u6BB5\u5E76\u751F\u6210 AI \u6807\u7B7E\u4E0E\u7D22\u5F15\u5EFA\u8BAE...", "info");
    try {
      const excerpt = getDocumentExcerpt(state.interpreter.excerptChars || DEFAULT_AI_EXCERPT_CHARS);
      const suggestion = await suggestMetaWithInterpreter(state.interpreter, {
        title: state.title,
        source: state.source,
        dir,
        excerpt,
        template: state.propertyTemplate,
        options: state.propertyOptions
      });
      applyMetaSuggestion(panel, suggestion);
      updatePanelStatus("AI \u5EFA\u8BAE\u5DF2\u586B\u5165\uFF0C\u8BF7\u4EBA\u5DE5\u786E\u8BA4\u540E\u518D\u540C\u6B65\u3002", "success");
    } catch (err) {
      updatePanelStatus(`AI \u5EFA\u8BAE\u5931\u8D25\uFF1A${err instanceof Error ? err.message : String(err)}`, "error");
    } finally {
      if (button)
        button.disabled = false;
    }
  }
  function applyMetaSuggestion(panel, suggestion) {
    for (const [key, raw] of Object.entries(suggestion)) {
      const control = panel.querySelector(`[data-meta-key="${cssEscape(key)}"]`);
      if (!control)
        continue;
      const value = Array.isArray(raw) ? raw.join("\u3001") : String(raw ?? "");
      if (control.dataset.groupedMeta === "true") {
        setGroupedControlValue(control, key, value);
        continue;
      }
      if (control instanceof HTMLSelectElement && value && !Array.from(control.options).some((option) => option.value === value)) {
        appendOption(control, value, value);
      }
      control.value = value;
    }
  }
  function createGroupedControl(key, value) {
    const wrapper = document.createElement("div");
    wrapper.className = "feishu-sync-grouped-control";
    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.dataset.metaKey = key;
    hidden.dataset.groupedMeta = "true";
    wrapper.appendChild(hidden);
    const groups = GROUPED_FIELDS[key] ?? [];
    groups.forEach((group, groupIndex) => {
      const row = document.createElement("div");
      row.className = "feishu-sync-choice-row";
      const title = document.createElement("span");
      title.className = "feishu-sync-choice-title";
      title.textContent = group.name;
      row.appendChild(title);
      group.options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "feishu-sync-choice-chip";
        button.textContent = option.label;
        button.dataset.groupIndex = String(groupIndex);
        button.dataset.value = option.value;
        button.addEventListener("click", () => {
          const active = button.classList.contains("is-selected");
          row.querySelectorAll(".feishu-sync-choice-chip").forEach((chip) => chip.classList.remove("is-selected"));
          if (!active)
            button.classList.add("is-selected");
          syncGroupedHiddenValue(wrapper, hidden);
        });
        row.appendChild(button);
      });
      wrapper.appendChild(row);
    });
    setGroupedControlValue(hidden, key, value);
    return wrapper;
  }
  function setGroupedControlValue(control, key, value) {
    const wrapper = control.closest(".feishu-sync-grouped-control");
    if (!wrapper) {
      control.value = value;
      return;
    }
    const selected = new Set(splitList(value).map((item) => normalizePropertyOptionValue(key, item)));
    wrapper.querySelectorAll(".feishu-sync-choice-chip").forEach((chip) => {
      chip.classList.toggle("is-selected", selected.has(chip.dataset.value ?? ""));
    });
    syncGroupedHiddenValue(wrapper, control);
  }
  function syncGroupedHiddenValue(wrapper, hidden) {
    const values = Array.from(wrapper.querySelectorAll(".feishu-sync-choice-chip.is-selected")).map((chip) => chip.dataset.value ?? "").filter(Boolean);
    hidden.value = values.join("\u3001");
  }
  function splitList(value) {
    return value.split(/[\n,，、]/).map((item) => item.trim()).filter(Boolean);
  }
  function parseOptions(value) {
    return Array.from(new Set(splitList(value ?? ""))).slice(0, 30);
  }
  function appendOption(target, value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    target.appendChild(option);
  }
  function cssEscape(value) {
    return value.replace(/["\\]/g, "\\$&");
  }
  function updatePanelStatus(message, type) {
    const status = document.querySelector(`#${PANEL_ID} [data-status="true"]`);
    if (!status)
      return;
    status.textContent = message;
    status.className = `feishu-sync-status feishu-sync-status-${type}`;
  }
  function closePreviewPanel() {
    document.getElementById(PANEL_ID)?.remove();
    document.getElementById(PANEL_BACKDROP_ID)?.remove();
  }
  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };
      return map[char];
    });
  }
  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }
  var lastPath = "";
  function watchRoute() {
    const check = () => {
      const path = window.location.pathname;
      if (path !== lastPath) {
        lastPath = path;
        document.getElementById(BUTTON_ID)?.remove();
        closePreviewPanel();
        if (isDocPage()) {
          setTimeout(injectButton, 1500);
        }
      }
    };
    window.addEventListener("popstate", check);
    window.addEventListener("hashchange", check);
    new MutationObserver(check).observe(document.body, { childList: true, subtree: true });
    check();
  }
  watchRoute();
  console.log("[feishu-sync] content script loaded");
})();
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.2.0 https://github.com/nodeca/js-yaml @license MIT *)
*/
//# sourceMappingURL=content.js.map
