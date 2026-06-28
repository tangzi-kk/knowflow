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
    function generateError(state2, message) {
      const mark = {
        name: state2.filename,
        buffer: state2.input.slice(0, -1),
        position: state2.position,
        line: state2.line,
        column: state2.position - state2.lineStart
      };
      mark.snippet = makeSnippet(mark);
      return new YAMLException2(message, mark);
    }
    function throwError(state2, message) {
      throw generateError(state2, message);
    }
    function throwWarning(state2, message) {
      if (state2.onWarning)
        state2.onWarning.call(null, generateError(state2, message));
    }
    function storeAnchor(state2, name, value) {
      const transactions = state2.anchorMapTransactions;
      if (transactions.length !== 0) {
        const transaction = transactions[transactions.length - 1];
        if (!_hasOwnProperty.call(transaction, name))
          transaction[name] = {
            existed: _hasOwnProperty.call(state2.anchorMap, name),
            value: state2.anchorMap[name]
          };
      }
      state2.anchorMap[name] = value;
    }
    function beginAnchorTransaction(state2) {
      state2.anchorMapTransactions.push(/* @__PURE__ */ Object.create(null));
    }
    function commitAnchorTransaction(state2) {
      const transaction = state2.anchorMapTransactions.pop();
      const transactions = state2.anchorMapTransactions;
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
    function rollbackAnchorTransaction(state2) {
      const transaction = state2.anchorMapTransactions.pop();
      const names = Object.keys(transaction);
      for (let index = names.length - 1; index >= 0; index -= 1) {
        const entry = transaction[names[index]];
        if (entry.existed)
          state2.anchorMap[names[index]] = entry.value;
        else
          delete state2.anchorMap[names[index]];
      }
    }
    function snapshotState(state2) {
      return {
        position: state2.position,
        line: state2.line,
        lineStart: state2.lineStart,
        lineIndent: state2.lineIndent,
        firstTabInLine: state2.firstTabInLine,
        tag: state2.tag,
        anchor: state2.anchor,
        kind: state2.kind,
        result: state2.result
      };
    }
    function restoreState(state2, snapshot) {
      state2.position = snapshot.position;
      state2.line = snapshot.line;
      state2.lineStart = snapshot.lineStart;
      state2.lineIndent = snapshot.lineIndent;
      state2.firstTabInLine = snapshot.firstTabInLine;
      state2.tag = snapshot.tag;
      state2.anchor = snapshot.anchor;
      state2.kind = snapshot.kind;
      state2.result = snapshot.result;
    }
    var directiveHandlers = {
      YAML: function handleYamlDirective(state2, name, args) {
        if (state2.version !== null)
          throwError(state2, "duplication of %YAML directive");
        if (args.length !== 1)
          throwError(state2, "YAML directive accepts exactly one argument");
        const match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
        if (match === null)
          throwError(state2, "ill-formed argument of the YAML directive");
        const major = parseInt(match[1], 10);
        const minor = parseInt(match[2], 10);
        if (major !== 1)
          throwError(state2, "unacceptable YAML version of the document");
        state2.version = args[0];
        state2.checkLineBreaks = minor < 2;
        if (minor !== 1 && minor !== 2)
          throwWarning(state2, "unsupported YAML version of the document");
      },
      TAG: function handleTagDirective(state2, name, args) {
        let prefix;
        if (args.length !== 2)
          throwError(state2, "TAG directive accepts exactly two arguments");
        const handle = args[0];
        prefix = args[1];
        if (!PATTERN_TAG_HANDLE.test(handle))
          throwError(state2, "ill-formed tag handle (first argument) of the TAG directive");
        if (_hasOwnProperty.call(state2.tagMap, handle))
          throwError(state2, 'there is a previously declared suffix for "' + handle + '" tag handle');
        if (!PATTERN_TAG_URI.test(prefix))
          throwError(state2, "ill-formed tag prefix (second argument) of the TAG directive");
        try {
          prefix = decodeURIComponent(prefix);
        } catch (err) {
          throwError(state2, "tag prefix is malformed: " + prefix);
        }
        state2.tagMap[handle] = prefix;
      }
    };
    function captureSegment(state2, start, end, checkJson) {
      if (start < end) {
        const _result = state2.input.slice(start, end);
        if (checkJson)
          for (let _position = 0, _length = _result.length; _position < _length; _position += 1) {
            const _character = _result.charCodeAt(_position);
            if (!(_character === 9 || _character >= 32 && _character <= 1114111))
              throwError(state2, "expected valid JSON character");
          }
        else if (PATTERN_NON_PRINTABLE.test(_result))
          throwError(state2, "the stream contains non-printable characters");
        state2.result += _result;
      }
    }
    function mergeMappings(state2, destination, source, overridableKeys) {
      if (!common.isObject(source))
        throwError(state2, "cannot merge mappings; the provided source object is unacceptable");
      const sourceKeys = Object.keys(source);
      for (let index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
        const key = sourceKeys[index];
        if (!_hasOwnProperty.call(destination, key)) {
          setProperty(destination, key, source[key]);
          overridableKeys[key] = true;
        }
      }
    }
    function storeMappingPair(state2, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
      if (Array.isArray(keyNode)) {
        keyNode = Array.prototype.slice.call(keyNode);
        for (let index = 0, quantity = keyNode.length; index < quantity; index += 1) {
          if (Array.isArray(keyNode[index]))
            throwError(state2, "nested arrays are not supported inside keys");
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
          if (valueNode.length > state2.maxMergeSeqLength)
            throwError(state2, "merge sequence length exceeded maxMergeSeqLength (" + state2.maxMergeSeqLength + ")");
          const seen = /* @__PURE__ */ new Set();
          for (let index = 0, quantity = valueNode.length; index < quantity; index += 1) {
            const src = valueNode[index];
            if (seen.has(src))
              continue;
            seen.add(src);
            mergeMappings(state2, _result, src, overridableKeys);
          }
        } else
          mergeMappings(state2, _result, valueNode, overridableKeys);
      else {
        if (!state2.json && !_hasOwnProperty.call(overridableKeys, keyNode) && _hasOwnProperty.call(_result, keyNode)) {
          state2.line = startLine || state2.line;
          state2.lineStart = startLineStart || state2.lineStart;
          state2.position = startPos || state2.position;
          throwError(state2, "duplicated mapping key");
        }
        setProperty(_result, keyNode, valueNode);
        delete overridableKeys[keyNode];
      }
      return _result;
    }
    function readLineBreak(state2) {
      const ch = state2.input.charCodeAt(state2.position);
      if (ch === 10)
        state2.position++;
      else if (ch === 13) {
        state2.position++;
        if (state2.input.charCodeAt(state2.position) === 10)
          state2.position++;
      } else
        throwError(state2, "a line break is expected");
      state2.line += 1;
      state2.lineStart = state2.position;
      state2.firstTabInLine = -1;
    }
    function skipSeparationSpace(state2, allowComments, checkIndent) {
      let lineBreaks = 0;
      let ch = state2.input.charCodeAt(state2.position);
      while (ch !== 0) {
        while (isWhiteSpace(ch)) {
          if (ch === 9 && state2.firstTabInLine === -1)
            state2.firstTabInLine = state2.position;
          ch = state2.input.charCodeAt(++state2.position);
        }
        if (allowComments && ch === 35)
          do
            ch = state2.input.charCodeAt(++state2.position);
          while (ch !== 10 && ch !== 13 && ch !== 0);
        if (isEol(ch)) {
          readLineBreak(state2);
          ch = state2.input.charCodeAt(state2.position);
          lineBreaks++;
          state2.lineIndent = 0;
          while (ch === 32) {
            state2.lineIndent++;
            ch = state2.input.charCodeAt(++state2.position);
          }
        } else
          break;
      }
      if (checkIndent !== -1 && lineBreaks !== 0 && state2.lineIndent < checkIndent)
        throwWarning(state2, "deficient indentation");
      return lineBreaks;
    }
    function testDocumentSeparator(state2) {
      let _position = state2.position;
      let ch = state2.input.charCodeAt(_position);
      if ((ch === 45 || ch === 46) && ch === state2.input.charCodeAt(_position + 1) && ch === state2.input.charCodeAt(_position + 2)) {
        _position += 3;
        ch = state2.input.charCodeAt(_position);
        if (ch === 0 || isWsOrEol(ch))
          return true;
      }
      return false;
    }
    function writeFoldedLines(state2, count) {
      if (count === 1)
        state2.result += " ";
      else if (count > 1)
        state2.result += common.repeat("\n", count - 1);
    }
    function readPlainScalar(state2, nodeIndent, withinFlowCollection) {
      let captureStart;
      let captureEnd;
      let hasPendingContent;
      let _line;
      let _lineStart;
      let _lineIndent;
      const _kind = state2.kind;
      const _result = state2.result;
      let ch = state2.input.charCodeAt(state2.position);
      if (isWsOrEol(ch) || isFlowIndicator(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96)
        return false;
      if (ch === 63 || ch === 45) {
        const following = state2.input.charCodeAt(state2.position + 1);
        if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following))
          return false;
      }
      state2.kind = "scalar";
      state2.result = "";
      captureStart = captureEnd = state2.position;
      hasPendingContent = false;
      while (ch !== 0) {
        if (ch === 58) {
          const following = state2.input.charCodeAt(state2.position + 1);
          if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following))
            break;
        } else if (ch === 35) {
          if (isWsOrEol(state2.input.charCodeAt(state2.position - 1)))
            break;
        } else if (state2.position === state2.lineStart && testDocumentSeparator(state2) || withinFlowCollection && isFlowIndicator(ch))
          break;
        else if (isEol(ch)) {
          _line = state2.line;
          _lineStart = state2.lineStart;
          _lineIndent = state2.lineIndent;
          skipSeparationSpace(state2, false, -1);
          if (state2.lineIndent >= nodeIndent) {
            hasPendingContent = true;
            ch = state2.input.charCodeAt(state2.position);
            continue;
          } else {
            state2.position = captureEnd;
            state2.line = _line;
            state2.lineStart = _lineStart;
            state2.lineIndent = _lineIndent;
            break;
          }
        }
        if (hasPendingContent) {
          captureSegment(state2, captureStart, captureEnd, false);
          writeFoldedLines(state2, state2.line - _line);
          captureStart = captureEnd = state2.position;
          hasPendingContent = false;
        }
        if (!isWhiteSpace(ch))
          captureEnd = state2.position + 1;
        ch = state2.input.charCodeAt(++state2.position);
      }
      captureSegment(state2, captureStart, captureEnd, false);
      if (state2.result)
        return true;
      state2.kind = _kind;
      state2.result = _result;
      return false;
    }
    function readSingleQuotedScalar(state2, nodeIndent) {
      let captureStart;
      let captureEnd;
      let ch = state2.input.charCodeAt(state2.position);
      if (ch !== 39)
        return false;
      state2.kind = "scalar";
      state2.result = "";
      state2.position++;
      captureStart = captureEnd = state2.position;
      while ((ch = state2.input.charCodeAt(state2.position)) !== 0)
        if (ch === 39) {
          captureSegment(state2, captureStart, state2.position, true);
          ch = state2.input.charCodeAt(++state2.position);
          if (ch === 39) {
            captureStart = state2.position;
            state2.position++;
            captureEnd = state2.position;
          } else
            return true;
        } else if (isEol(ch)) {
          captureSegment(state2, captureStart, captureEnd, true);
          writeFoldedLines(state2, skipSeparationSpace(state2, false, nodeIndent));
          captureStart = captureEnd = state2.position;
        } else if (state2.position === state2.lineStart && testDocumentSeparator(state2))
          throwError(state2, "unexpected end of the document within a single quoted scalar");
        else {
          state2.position++;
          if (!isWhiteSpace(ch))
            captureEnd = state2.position;
        }
      throwError(state2, "unexpected end of the stream within a single quoted scalar");
    }
    function readDoubleQuotedScalar(state2, nodeIndent) {
      let captureStart;
      let captureEnd;
      let tmp;
      let ch = state2.input.charCodeAt(state2.position);
      if (ch !== 34)
        return false;
      state2.kind = "scalar";
      state2.result = "";
      state2.position++;
      captureStart = captureEnd = state2.position;
      while ((ch = state2.input.charCodeAt(state2.position)) !== 0)
        if (ch === 34) {
          captureSegment(state2, captureStart, state2.position, true);
          state2.position++;
          return true;
        } else if (ch === 92) {
          captureSegment(state2, captureStart, state2.position, true);
          ch = state2.input.charCodeAt(++state2.position);
          if (isEol(ch))
            skipSeparationSpace(state2, false, nodeIndent);
          else if (ch < 256 && simpleEscapeCheck[ch]) {
            state2.result += simpleEscapeMap[ch];
            state2.position++;
          } else if ((tmp = escapedHexLen(ch)) > 0) {
            let hexLength = tmp;
            let hexResult = 0;
            for (; hexLength > 0; hexLength--) {
              ch = state2.input.charCodeAt(++state2.position);
              if ((tmp = fromHexCode(ch)) >= 0)
                hexResult = (hexResult << 4) + tmp;
              else
                throwError(state2, "expected hexadecimal character");
            }
            state2.result += charFromCodepoint(hexResult);
            state2.position++;
          } else
            throwError(state2, "unknown escape sequence");
          captureStart = captureEnd = state2.position;
        } else if (isEol(ch)) {
          captureSegment(state2, captureStart, captureEnd, true);
          writeFoldedLines(state2, skipSeparationSpace(state2, false, nodeIndent));
          captureStart = captureEnd = state2.position;
        } else if (state2.position === state2.lineStart && testDocumentSeparator(state2))
          throwError(state2, "unexpected end of the document within a double quoted scalar");
        else {
          state2.position++;
          if (!isWhiteSpace(ch))
            captureEnd = state2.position;
        }
      throwError(state2, "unexpected end of the stream within a double quoted scalar");
    }
    function readFlowCollection(state2, nodeIndent) {
      let readNext = true;
      let _line;
      let _lineStart;
      let _pos;
      const _tag = state2.tag;
      let _result;
      const _anchor = state2.anchor;
      let terminator;
      let isPair;
      let isExplicitPair;
      let isMapping;
      const overridableKeys = /* @__PURE__ */ Object.create(null);
      let keyNode;
      let keyTag;
      let valueNode;
      let ch = state2.input.charCodeAt(state2.position);
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
      if (state2.anchor !== null)
        storeAnchor(state2, state2.anchor, _result);
      ch = state2.input.charCodeAt(++state2.position);
      while (ch !== 0) {
        skipSeparationSpace(state2, true, nodeIndent);
        ch = state2.input.charCodeAt(state2.position);
        if (ch === terminator) {
          state2.position++;
          state2.tag = _tag;
          state2.anchor = _anchor;
          state2.kind = isMapping ? "mapping" : "sequence";
          state2.result = _result;
          return true;
        } else if (!readNext)
          throwError(state2, "missed comma between flow collection entries");
        else if (ch === 44)
          throwError(state2, "expected the node content, but found ','");
        keyTag = keyNode = valueNode = null;
        isPair = isExplicitPair = false;
        if (ch === 63) {
          if (isWsOrEol(state2.input.charCodeAt(state2.position + 1))) {
            isPair = isExplicitPair = true;
            state2.position++;
            skipSeparationSpace(state2, true, nodeIndent);
          }
        }
        _line = state2.line;
        _lineStart = state2.lineStart;
        _pos = state2.position;
        composeNode(state2, nodeIndent, CONTEXT_FLOW_IN, false, true);
        keyTag = state2.tag;
        keyNode = state2.result;
        skipSeparationSpace(state2, true, nodeIndent);
        ch = state2.input.charCodeAt(state2.position);
        if ((isExplicitPair || state2.line === _line) && ch === 58) {
          isPair = true;
          ch = state2.input.charCodeAt(++state2.position);
          skipSeparationSpace(state2, true, nodeIndent);
          composeNode(state2, nodeIndent, CONTEXT_FLOW_IN, false, true);
          valueNode = state2.result;
        }
        if (isMapping)
          storeMappingPair(state2, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
        else if (isPair)
          _result.push(storeMappingPair(state2, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
        else
          _result.push(keyNode);
        skipSeparationSpace(state2, true, nodeIndent);
        ch = state2.input.charCodeAt(state2.position);
        if (ch === 44) {
          readNext = true;
          ch = state2.input.charCodeAt(++state2.position);
        } else
          readNext = false;
      }
      throwError(state2, "unexpected end of the stream within a flow collection");
    }
    function readBlockScalar(state2, nodeIndent) {
      let folding;
      let chomping = CHOMPING_CLIP;
      let didReadContent = false;
      let detectedIndent = false;
      let textIndent = nodeIndent;
      let emptyLines = 0;
      let atMoreIndented = false;
      let tmp;
      let ch = state2.input.charCodeAt(state2.position);
      if (ch === 124)
        folding = false;
      else if (ch === 62)
        folding = true;
      else
        return false;
      state2.kind = "scalar";
      state2.result = "";
      while (ch !== 0) {
        ch = state2.input.charCodeAt(++state2.position);
        if (ch === 43 || ch === 45)
          if (CHOMPING_CLIP === chomping)
            chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
          else
            throwError(state2, "repeat of a chomping mode identifier");
        else if ((tmp = fromDecimalCode(ch)) >= 0)
          if (tmp === 0)
            throwError(state2, "bad explicit indentation width of a block scalar; it cannot be less than one");
          else if (!detectedIndent) {
            textIndent = nodeIndent + tmp - 1;
            detectedIndent = true;
          } else
            throwError(state2, "repeat of an indentation width identifier");
        else
          break;
      }
      if (isWhiteSpace(ch)) {
        do
          ch = state2.input.charCodeAt(++state2.position);
        while (isWhiteSpace(ch));
        if (ch === 35)
          do
            ch = state2.input.charCodeAt(++state2.position);
          while (!isEol(ch) && ch !== 0);
      }
      while (ch !== 0) {
        readLineBreak(state2);
        state2.lineIndent = 0;
        ch = state2.input.charCodeAt(state2.position);
        while ((!detectedIndent || state2.lineIndent < textIndent) && ch === 32) {
          state2.lineIndent++;
          ch = state2.input.charCodeAt(++state2.position);
        }
        if (!detectedIndent && state2.lineIndent > textIndent)
          textIndent = state2.lineIndent;
        if (isEol(ch)) {
          emptyLines++;
          continue;
        }
        if (!detectedIndent && textIndent === 0)
          throwError(state2, "missing indentation for block scalar");
        if (state2.lineIndent < textIndent) {
          if (chomping === CHOMPING_KEEP)
            state2.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
          else if (chomping === CHOMPING_CLIP) {
            if (didReadContent)
              state2.result += "\n";
          }
          break;
        }
        if (folding)
          if (isWhiteSpace(ch)) {
            atMoreIndented = true;
            state2.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
          } else if (atMoreIndented) {
            atMoreIndented = false;
            state2.result += common.repeat("\n", emptyLines + 1);
          } else if (emptyLines === 0) {
            if (didReadContent)
              state2.result += " ";
          } else
            state2.result += common.repeat("\n", emptyLines);
        else
          state2.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        didReadContent = true;
        detectedIndent = true;
        emptyLines = 0;
        const captureStart = state2.position;
        while (!isEol(ch) && ch !== 0)
          ch = state2.input.charCodeAt(++state2.position);
        captureSegment(state2, captureStart, state2.position, false);
      }
      return true;
    }
    function readBlockSequence(state2, nodeIndent) {
      const _tag = state2.tag;
      const _anchor = state2.anchor;
      const _result = [];
      let detected = false;
      if (state2.firstTabInLine !== -1)
        return false;
      if (state2.anchor !== null)
        storeAnchor(state2, state2.anchor, _result);
      let ch = state2.input.charCodeAt(state2.position);
      while (ch !== 0) {
        if (state2.firstTabInLine !== -1) {
          state2.position = state2.firstTabInLine;
          throwError(state2, "tab characters must not be used in indentation");
        }
        if (ch !== 45)
          break;
        if (!isWsOrEol(state2.input.charCodeAt(state2.position + 1)))
          break;
        detected = true;
        state2.position++;
        if (skipSeparationSpace(state2, true, -1)) {
          if (state2.lineIndent <= nodeIndent) {
            _result.push(null);
            ch = state2.input.charCodeAt(state2.position);
            continue;
          }
        }
        const _line = state2.line;
        composeNode(state2, nodeIndent, CONTEXT_BLOCK_IN, false, true);
        _result.push(state2.result);
        skipSeparationSpace(state2, true, -1);
        ch = state2.input.charCodeAt(state2.position);
        if ((state2.line === _line || state2.lineIndent > nodeIndent) && ch !== 0)
          throwError(state2, "bad indentation of a sequence entry");
        else if (state2.lineIndent < nodeIndent)
          break;
      }
      if (detected) {
        state2.tag = _tag;
        state2.anchor = _anchor;
        state2.kind = "sequence";
        state2.result = _result;
        return true;
      }
      return false;
    }
    function readBlockMapping(state2, nodeIndent, flowIndent) {
      let allowCompact;
      let _keyLine;
      let _keyLineStart;
      let _keyPos;
      const _tag = state2.tag;
      const _anchor = state2.anchor;
      const _result = {};
      const overridableKeys = /* @__PURE__ */ Object.create(null);
      let keyTag = null;
      let keyNode = null;
      let valueNode = null;
      let atExplicitKey = false;
      let detected = false;
      if (state2.firstTabInLine !== -1)
        return false;
      if (state2.anchor !== null)
        storeAnchor(state2, state2.anchor, _result);
      let ch = state2.input.charCodeAt(state2.position);
      while (ch !== 0) {
        if (!atExplicitKey && state2.firstTabInLine !== -1) {
          state2.position = state2.firstTabInLine;
          throwError(state2, "tab characters must not be used in indentation");
        }
        const following = state2.input.charCodeAt(state2.position + 1);
        const _line = state2.line;
        if ((ch === 63 || ch === 58) && isWsOrEol(following)) {
          if (ch === 63) {
            if (atExplicitKey) {
              storeMappingPair(state2, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
              keyTag = keyNode = valueNode = null;
            }
            detected = true;
            atExplicitKey = true;
            allowCompact = true;
          } else if (atExplicitKey) {
            atExplicitKey = false;
            allowCompact = true;
          } else
            throwError(state2, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
          state2.position += 1;
          ch = following;
        } else {
          _keyLine = state2.line;
          _keyLineStart = state2.lineStart;
          _keyPos = state2.position;
          if (!composeNode(state2, flowIndent, CONTEXT_FLOW_OUT, false, true))
            break;
          if (state2.line === _line) {
            ch = state2.input.charCodeAt(state2.position);
            while (isWhiteSpace(ch))
              ch = state2.input.charCodeAt(++state2.position);
            if (ch === 58) {
              ch = state2.input.charCodeAt(++state2.position);
              if (!isWsOrEol(ch))
                throwError(state2, "a whitespace character is expected after the key-value separator within a block mapping");
              if (atExplicitKey) {
                storeMappingPair(state2, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
                keyTag = keyNode = valueNode = null;
              }
              detected = true;
              atExplicitKey = false;
              allowCompact = false;
              keyTag = state2.tag;
              keyNode = state2.result;
            } else if (detected)
              throwError(state2, "can not read an implicit mapping pair; a colon is missed");
            else {
              state2.tag = _tag;
              state2.anchor = _anchor;
              return true;
            }
          } else if (detected)
            throwError(state2, "can not read a block mapping entry; a multiline key may not be an implicit key");
          else {
            state2.tag = _tag;
            state2.anchor = _anchor;
            return true;
          }
        }
        if (state2.line === _line || state2.lineIndent > nodeIndent) {
          if (atExplicitKey) {
            _keyLine = state2.line;
            _keyLineStart = state2.lineStart;
            _keyPos = state2.position;
          }
          if (composeNode(state2, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact))
            if (atExplicitKey)
              keyNode = state2.result;
            else
              valueNode = state2.result;
          if (!atExplicitKey) {
            storeMappingPair(state2, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          skipSeparationSpace(state2, true, -1);
          ch = state2.input.charCodeAt(state2.position);
        }
        if ((state2.line === _line || state2.lineIndent > nodeIndent) && ch !== 0)
          throwError(state2, "bad indentation of a mapping entry");
        else if (state2.lineIndent < nodeIndent)
          break;
      }
      if (atExplicitKey)
        storeMappingPair(state2, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
      if (detected) {
        state2.tag = _tag;
        state2.anchor = _anchor;
        state2.kind = "mapping";
        state2.result = _result;
      }
      return detected;
    }
    function readTagProperty(state2) {
      let isVerbatim = false;
      let isNamed = false;
      let tagHandle;
      let tagName;
      let ch = state2.input.charCodeAt(state2.position);
      if (ch !== 33)
        return false;
      if (state2.tag !== null)
        throwError(state2, "duplication of a tag property");
      ch = state2.input.charCodeAt(++state2.position);
      if (ch === 60) {
        isVerbatim = true;
        ch = state2.input.charCodeAt(++state2.position);
      } else if (ch === 33) {
        isNamed = true;
        tagHandle = "!!";
        ch = state2.input.charCodeAt(++state2.position);
      } else
        tagHandle = "!";
      let _position = state2.position;
      if (isVerbatim) {
        do
          ch = state2.input.charCodeAt(++state2.position);
        while (ch !== 0 && ch !== 62);
        if (state2.position < state2.length) {
          tagName = state2.input.slice(_position, state2.position);
          ch = state2.input.charCodeAt(++state2.position);
        } else
          throwError(state2, "unexpected end of the stream within a verbatim tag");
      } else {
        while (ch !== 0 && !isWsOrEol(ch)) {
          if (ch === 33)
            if (!isNamed) {
              tagHandle = state2.input.slice(_position - 1, state2.position + 1);
              if (!PATTERN_TAG_HANDLE.test(tagHandle))
                throwError(state2, "named tag handle cannot contain such characters");
              isNamed = true;
              _position = state2.position + 1;
            } else
              throwError(state2, "tag suffix cannot contain exclamation marks");
          ch = state2.input.charCodeAt(++state2.position);
        }
        tagName = state2.input.slice(_position, state2.position);
        if (PATTERN_FLOW_INDICATORS.test(tagName))
          throwError(state2, "tag suffix cannot contain flow indicator characters");
      }
      if (tagName && !PATTERN_TAG_URI.test(tagName))
        throwError(state2, "tag name cannot contain such characters: " + tagName);
      try {
        tagName = decodeURIComponent(tagName);
      } catch (err) {
        throwError(state2, "tag name is malformed: " + tagName);
      }
      if (isVerbatim)
        state2.tag = tagName;
      else if (_hasOwnProperty.call(state2.tagMap, tagHandle))
        state2.tag = state2.tagMap[tagHandle] + tagName;
      else if (tagHandle === "!")
        state2.tag = "!" + tagName;
      else if (tagHandle === "!!")
        state2.tag = "tag:yaml.org,2002:" + tagName;
      else
        throwError(state2, 'undeclared tag handle "' + tagHandle + '"');
      return true;
    }
    function readAnchorProperty(state2) {
      let ch = state2.input.charCodeAt(state2.position);
      if (ch !== 38)
        return false;
      if (state2.anchor !== null)
        throwError(state2, "duplication of an anchor property");
      ch = state2.input.charCodeAt(++state2.position);
      const _position = state2.position;
      while (ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch))
        ch = state2.input.charCodeAt(++state2.position);
      if (state2.position === _position)
        throwError(state2, "name of an anchor node must contain at least one character");
      state2.anchor = state2.input.slice(_position, state2.position);
      return true;
    }
    function readAlias(state2) {
      let ch = state2.input.charCodeAt(state2.position);
      if (ch !== 42)
        return false;
      ch = state2.input.charCodeAt(++state2.position);
      const _position = state2.position;
      while (ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch))
        ch = state2.input.charCodeAt(++state2.position);
      if (state2.position === _position)
        throwError(state2, "name of an alias node must contain at least one character");
      const alias = state2.input.slice(_position, state2.position);
      if (!_hasOwnProperty.call(state2.anchorMap, alias))
        throwError(state2, 'unidentified alias "' + alias + '"');
      state2.result = state2.anchorMap[alias];
      skipSeparationSpace(state2, true, -1);
      return true;
    }
    function tryReadBlockMappingFromProperty(state2, propertyStart, nodeIndent, flowIndent) {
      const fallbackState = snapshotState(state2);
      beginAnchorTransaction(state2);
      restoreState(state2, propertyStart);
      state2.tag = null;
      state2.anchor = null;
      state2.kind = null;
      state2.result = null;
      if (readBlockMapping(state2, nodeIndent, flowIndent) && state2.kind === "mapping") {
        commitAnchorTransaction(state2);
        return true;
      }
      rollbackAnchorTransaction(state2);
      restoreState(state2, fallbackState);
      return false;
    }
    function composeNode(state2, parentIndent, nodeContext, allowToSeek, allowCompact) {
      let allowBlockScalars;
      let allowBlockCollections;
      let indentStatus = 1;
      let atNewLine = false;
      let hasContent = false;
      let propertyStart = null;
      let type;
      let flowIndent;
      let blockIndent;
      if (state2.depth >= state2.maxDepth)
        throwError(state2, "nesting exceeded maxDepth (" + state2.maxDepth + ")");
      state2.depth += 1;
      if (state2.listener !== null)
        state2.listener("open", state2);
      state2.tag = null;
      state2.anchor = null;
      state2.kind = null;
      state2.result = null;
      const allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
      if (allowToSeek) {
        if (skipSeparationSpace(state2, true, -1)) {
          atNewLine = true;
          if (state2.lineIndent > parentIndent)
            indentStatus = 1;
          else if (state2.lineIndent === parentIndent)
            indentStatus = 0;
          else if (state2.lineIndent < parentIndent)
            indentStatus = -1;
        }
      }
      if (indentStatus === 1)
        while (true) {
          const ch = state2.input.charCodeAt(state2.position);
          const propertyState = snapshotState(state2);
          if (atNewLine && (ch === 33 && state2.tag !== null || ch === 38 && state2.anchor !== null))
            break;
          if (!readTagProperty(state2) && !readAnchorProperty(state2))
            break;
          if (propertyStart === null)
            propertyStart = propertyState;
          if (skipSeparationSpace(state2, true, -1)) {
            atNewLine = true;
            allowBlockCollections = allowBlockStyles;
            if (state2.lineIndent > parentIndent)
              indentStatus = 1;
            else if (state2.lineIndent === parentIndent)
              indentStatus = 0;
            else if (state2.lineIndent < parentIndent)
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
        blockIndent = state2.position - state2.lineStart;
        if (indentStatus === 1)
          if (allowBlockCollections && (readBlockSequence(state2, blockIndent) || readBlockMapping(state2, blockIndent, flowIndent)) || readFlowCollection(state2, flowIndent))
            hasContent = true;
          else {
            const ch = state2.input.charCodeAt(state2.position);
            if (propertyStart !== null && allowBlockStyles && !allowBlockCollections && ch !== 124 && ch !== 62 && tryReadBlockMappingFromProperty(state2, propertyStart, propertyStart.position - propertyStart.lineStart, flowIndent))
              hasContent = true;
            else if (allowBlockScalars && readBlockScalar(state2, flowIndent) || readSingleQuotedScalar(state2, flowIndent) || readDoubleQuotedScalar(state2, flowIndent))
              hasContent = true;
            else if (readAlias(state2)) {
              hasContent = true;
              if (state2.tag !== null || state2.anchor !== null)
                throwError(state2, "alias node should not have any properties");
            } else if (readPlainScalar(state2, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
              hasContent = true;
              if (state2.tag === null)
                state2.tag = "?";
            }
            if (state2.anchor !== null)
              storeAnchor(state2, state2.anchor, state2.result);
          }
        else if (indentStatus === 0)
          hasContent = allowBlockCollections && readBlockSequence(state2, blockIndent);
      }
      if (state2.tag === null) {
        if (state2.anchor !== null)
          storeAnchor(state2, state2.anchor, state2.result);
      } else if (state2.tag === "?") {
        if (state2.result !== null && state2.kind !== "scalar")
          throwError(state2, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state2.kind + '"');
        for (let typeIndex = 0, typeQuantity = state2.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
          type = state2.implicitTypes[typeIndex];
          if (type.resolve(state2.result)) {
            state2.result = type.construct(state2.result);
            state2.tag = type.tag;
            if (state2.anchor !== null)
              storeAnchor(state2, state2.anchor, state2.result);
            break;
          }
        }
      } else if (state2.tag !== "!") {
        if (_hasOwnProperty.call(state2.typeMap[state2.kind || "fallback"], state2.tag))
          type = state2.typeMap[state2.kind || "fallback"][state2.tag];
        else {
          type = null;
          const typeList = state2.typeMap.multi[state2.kind || "fallback"];
          for (let typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1)
            if (state2.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
              type = typeList[typeIndex];
              break;
            }
        }
        if (!type)
          throwError(state2, "unknown tag !<" + state2.tag + ">");
        if (state2.result !== null && type.kind !== state2.kind)
          throwError(state2, "unacceptable node kind for !<" + state2.tag + '> tag; it should be "' + type.kind + '", not "' + state2.kind + '"');
        if (!type.resolve(state2.result, state2.tag))
          throwError(state2, "cannot resolve a node with !<" + state2.tag + "> explicit tag");
        else {
          state2.result = type.construct(state2.result, state2.tag);
          if (state2.anchor !== null)
            storeAnchor(state2, state2.anchor, state2.result);
        }
      }
      if (state2.listener !== null)
        state2.listener("close", state2);
      state2.depth -= 1;
      return state2.tag !== null || state2.anchor !== null || hasContent;
    }
    function readDocument(state2) {
      const documentStart = state2.position;
      let hasDirectives = false;
      let ch;
      state2.version = null;
      state2.checkLineBreaks = state2.legacy;
      state2.tagMap = /* @__PURE__ */ Object.create(null);
      state2.anchorMap = /* @__PURE__ */ Object.create(null);
      while ((ch = state2.input.charCodeAt(state2.position)) !== 0) {
        skipSeparationSpace(state2, true, -1);
        ch = state2.input.charCodeAt(state2.position);
        if (state2.lineIndent > 0 || ch !== 37)
          break;
        hasDirectives = true;
        ch = state2.input.charCodeAt(++state2.position);
        let _position = state2.position;
        while (ch !== 0 && !isWsOrEol(ch))
          ch = state2.input.charCodeAt(++state2.position);
        const directiveName = state2.input.slice(_position, state2.position);
        const directiveArgs = [];
        if (directiveName.length < 1)
          throwError(state2, "directive name must not be less than one character in length");
        while (ch !== 0) {
          while (isWhiteSpace(ch))
            ch = state2.input.charCodeAt(++state2.position);
          if (ch === 35) {
            do
              ch = state2.input.charCodeAt(++state2.position);
            while (ch !== 0 && !isEol(ch));
            break;
          }
          if (isEol(ch))
            break;
          _position = state2.position;
          while (ch !== 0 && !isWsOrEol(ch))
            ch = state2.input.charCodeAt(++state2.position);
          directiveArgs.push(state2.input.slice(_position, state2.position));
        }
        if (ch !== 0)
          readLineBreak(state2);
        if (_hasOwnProperty.call(directiveHandlers, directiveName))
          directiveHandlers[directiveName](state2, directiveName, directiveArgs);
        else
          throwWarning(state2, 'unknown document directive "' + directiveName + '"');
      }
      skipSeparationSpace(state2, true, -1);
      if (state2.lineIndent === 0 && state2.input.charCodeAt(state2.position) === 45 && state2.input.charCodeAt(state2.position + 1) === 45 && state2.input.charCodeAt(state2.position + 2) === 45) {
        state2.position += 3;
        skipSeparationSpace(state2, true, -1);
      } else if (hasDirectives)
        throwError(state2, "directives end mark is expected");
      composeNode(state2, state2.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
      skipSeparationSpace(state2, true, -1);
      if (state2.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state2.input.slice(documentStart, state2.position)))
        throwWarning(state2, "non-ASCII line breaks are interpreted as content");
      state2.documents.push(state2.result);
      if (state2.position === state2.lineStart && testDocumentSeparator(state2)) {
        if (state2.input.charCodeAt(state2.position) === 46) {
          state2.position += 3;
          skipSeparationSpace(state2, true, -1);
        }
        return;
      }
      if (state2.position < state2.length - 1)
        throwError(state2, "end of the stream or a document separator is expected");
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
      const state2 = new State(input, options);
      const nullpos = input.indexOf("\0");
      if (nullpos !== -1) {
        state2.position = nullpos;
        throwError(state2, "null byte is not allowed in input");
      }
      state2.input += "\0";
      while (state2.input.charCodeAt(state2.position) === 32) {
        state2.lineIndent += 1;
        state2.position += 1;
      }
      while (state2.position < state2.length - 1)
        readDocument(state2);
      return state2.documents;
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
    function generateNextLine(state2, level) {
      return "\n" + common.repeat(" ", state2.indent * level);
    }
    function testImplicitResolving(state2, str) {
      for (let index = 0, length = state2.implicitTypes.length; index < length; index += 1)
        if (state2.implicitTypes[index].resolve(str))
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
    function writeScalar(state2, string, level, iskey, inblock) {
      state2.dump = function() {
        if (string.length === 0)
          return state2.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
        if (!state2.noCompatMode) {
          if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string))
            return state2.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
        }
        const indent = state2.indent * Math.max(1, level);
        const lineWidth = state2.lineWidth === -1 ? -1 : Math.max(Math.min(state2.lineWidth, 40), state2.lineWidth - indent);
        const singleLineOnly = iskey || state2.flowLevel > -1 && level >= state2.flowLevel;
        function testAmbiguity(string2) {
          return testImplicitResolving(state2, string2);
        }
        switch (chooseScalarStyle(string, singleLineOnly, state2.indent, lineWidth, testAmbiguity, state2.quotingType, state2.forceQuotes && !iskey, inblock)) {
          case STYLE_PLAIN:
            return string;
          case STYLE_SINGLE:
            return "'" + string.replace(/'/g, "''") + "'";
          case STYLE_LITERAL:
            return "|" + blockHeader(string, state2.indent) + dropEndingNewline(indentString(string, indent));
          case STYLE_FOLDED:
            return ">" + blockHeader(string, state2.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
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
    function writeFlowSequence(state2, level, object) {
      let _result = "";
      const _tag = state2.tag;
      for (let index = 0, length = object.length; index < length; index += 1) {
        let value = object[index];
        if (state2.replacer)
          value = state2.replacer.call(object, String(index), value);
        if (writeNode(state2, level, value, false, false) || typeof value === "undefined" && writeNode(state2, level, null, false, false)) {
          if (_result !== "")
            _result += "," + (!state2.condenseFlow ? " " : "");
          _result += state2.dump;
        }
      }
      state2.tag = _tag;
      state2.dump = "[" + _result + "]";
    }
    function writeBlockSequence(state2, level, object, compact) {
      let _result = "";
      const _tag = state2.tag;
      for (let index = 0, length = object.length; index < length; index += 1) {
        let value = object[index];
        if (state2.replacer)
          value = state2.replacer.call(object, String(index), value);
        if (writeNode(state2, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state2, level + 1, null, true, true, false, true)) {
          if (!compact || _result !== "")
            _result += generateNextLine(state2, level);
          if (state2.dump && CHAR_LINE_FEED === state2.dump.charCodeAt(0))
            _result += "-";
          else
            _result += "- ";
          _result += state2.dump;
        }
      }
      state2.tag = _tag;
      state2.dump = _result || "[]";
    }
    function writeFlowMapping(state2, level, object) {
      let _result = "";
      const _tag = state2.tag;
      const objectKeyList = Object.keys(object);
      for (let index = 0, length = objectKeyList.length; index < length; index += 1) {
        let pairBuffer = "";
        if (_result !== "")
          pairBuffer += ", ";
        if (state2.condenseFlow)
          pairBuffer += '"';
        const objectKey = objectKeyList[index];
        let objectValue = object[objectKey];
        if (state2.replacer)
          objectValue = state2.replacer.call(object, objectKey, objectValue);
        if (!writeNode(state2, level, objectKey, false, false))
          continue;
        if (state2.dump.length > 1024)
          pairBuffer += "? ";
        pairBuffer += state2.dump + (state2.condenseFlow ? '"' : "") + ":" + (state2.condenseFlow ? "" : " ");
        if (!writeNode(state2, level, objectValue, false, false))
          continue;
        pairBuffer += state2.dump;
        _result += pairBuffer;
      }
      state2.tag = _tag;
      state2.dump = "{" + _result + "}";
    }
    function writeBlockMapping(state2, level, object, compact) {
      let _result = "";
      const _tag = state2.tag;
      const objectKeyList = Object.keys(object);
      if (state2.sortKeys === true)
        objectKeyList.sort();
      else if (typeof state2.sortKeys === "function")
        objectKeyList.sort(state2.sortKeys);
      else if (state2.sortKeys)
        throw new YAMLException2("sortKeys must be a boolean or a function");
      for (let index = 0, length = objectKeyList.length; index < length; index += 1) {
        let pairBuffer = "";
        if (!compact || _result !== "")
          pairBuffer += generateNextLine(state2, level);
        const objectKey = objectKeyList[index];
        let objectValue = object[objectKey];
        if (state2.replacer)
          objectValue = state2.replacer.call(object, objectKey, objectValue);
        if (!writeNode(state2, level + 1, objectKey, true, true, true))
          continue;
        const explicitPair = state2.tag !== null && state2.tag !== "?" || state2.dump && state2.dump.length > 1024;
        if (explicitPair)
          if (state2.dump && CHAR_LINE_FEED === state2.dump.charCodeAt(0))
            pairBuffer += "?";
          else
            pairBuffer += "? ";
        pairBuffer += state2.dump;
        if (explicitPair)
          pairBuffer += generateNextLine(state2, level);
        if (!writeNode(state2, level + 1, objectValue, true, explicitPair))
          continue;
        if (state2.dump && CHAR_LINE_FEED === state2.dump.charCodeAt(0))
          pairBuffer += ":";
        else
          pairBuffer += ": ";
        pairBuffer += state2.dump;
        _result += pairBuffer;
      }
      state2.tag = _tag;
      state2.dump = _result || "{}";
    }
    function detectType(state2, object, explicit) {
      const typeList = explicit ? state2.explicitTypes : state2.implicitTypes;
      for (let index = 0, length = typeList.length; index < length; index += 1) {
        const type = typeList[index];
        if ((type.instanceOf || type.predicate) && (!type.instanceOf || typeof object === "object" && object instanceof type.instanceOf) && (!type.predicate || type.predicate(object))) {
          if (explicit)
            if (type.multi && type.representName)
              state2.tag = type.representName(object);
            else
              state2.tag = type.tag;
          else
            state2.tag = "?";
          if (type.represent) {
            const style = state2.styleMap[type.tag] || type.defaultStyle;
            let _result;
            if (_toString.call(type.represent) === "[object Function]")
              _result = type.represent(object, style);
            else if (_hasOwnProperty.call(type.represent, style))
              _result = type.represent[style](object, style);
            else
              throw new YAMLException2("!<" + type.tag + '> tag resolver accepts not "' + style + '" style');
            state2.dump = _result;
          }
          return true;
        }
      }
      return false;
    }
    function writeNode(state2, level, object, block, compact, iskey, isblockseq) {
      state2.tag = null;
      state2.dump = object;
      if (!detectType(state2, object, false))
        detectType(state2, object, true);
      const type = _toString.call(state2.dump);
      const inblock = block;
      if (block)
        block = state2.flowLevel < 0 || state2.flowLevel > level;
      const objectOrArray = type === "[object Object]" || type === "[object Array]";
      let duplicateIndex;
      let duplicate;
      if (objectOrArray) {
        duplicateIndex = state2.duplicates.indexOf(object);
        duplicate = duplicateIndex !== -1;
      }
      if (state2.tag !== null && state2.tag !== "?" || duplicate || state2.indent !== 2 && level > 0)
        compact = false;
      if (duplicate && state2.usedDuplicates[duplicateIndex])
        state2.dump = "*ref_" + duplicateIndex;
      else {
        if (objectOrArray && duplicate && !state2.usedDuplicates[duplicateIndex])
          state2.usedDuplicates[duplicateIndex] = true;
        if (type === "[object Object]")
          if (block && Object.keys(state2.dump).length !== 0) {
            writeBlockMapping(state2, level, state2.dump, compact);
            if (duplicate)
              state2.dump = "&ref_" + duplicateIndex + state2.dump;
          } else {
            writeFlowMapping(state2, level, state2.dump);
            if (duplicate)
              state2.dump = "&ref_" + duplicateIndex + " " + state2.dump;
          }
        else if (type === "[object Array]")
          if (block && state2.dump.length !== 0) {
            if (state2.noArrayIndent && !isblockseq && level > 0)
              writeBlockSequence(state2, level - 1, state2.dump, compact);
            else
              writeBlockSequence(state2, level, state2.dump, compact);
            if (duplicate)
              state2.dump = "&ref_" + duplicateIndex + state2.dump;
          } else {
            writeFlowSequence(state2, level, state2.dump);
            if (duplicate)
              state2.dump = "&ref_" + duplicateIndex + " " + state2.dump;
          }
        else if (type === "[object String]") {
          if (state2.tag !== "?")
            writeScalar(state2, state2.dump, level, iskey, inblock);
        } else if (type === "[object Undefined]")
          return false;
        else {
          if (state2.skipInvalid)
            return false;
          throw new YAMLException2("unacceptable kind of an object to dump " + type);
        }
        if (state2.tag !== null && state2.tag !== "?") {
          let tagStr = encodeURI(state2.tag[0] === "!" ? state2.tag.slice(1) : state2.tag).replace(/!/g, "%21");
          if (state2.tag[0] === "!")
            tagStr = "!" + tagStr;
          else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:")
            tagStr = "!!" + tagStr.slice(18);
          else
            tagStr = "!<" + tagStr + ">";
          state2.dump = tagStr + " " + state2.dump;
        }
      }
      return true;
    }
    function getDuplicateReferences(object, state2) {
      const objects = [];
      const duplicatesIndexes = [];
      inspectNode(object, objects, duplicatesIndexes);
      const length = duplicatesIndexes.length;
      for (let index = 0; index < length; index += 1)
        state2.duplicates.push(objects[duplicatesIndexes[index]]);
      state2.usedDuplicates = new Array(length);
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
      const state2 = new State(options);
      if (!state2.noRefs)
        getDuplicateReferences(input, state2);
      let value = input;
      if (state2.replacer)
        value = state2.replacer.call({ "": value }, "", value);
      if (writeNode(state2, 0, value, true, true))
        return state2.dump + "\n";
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
  async function postClip(config, req) {
    return request(config, "POST", "/clip", req, 3e4);
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

  // src/sidepanel/sidepanel.ts
  var DEFAULT_AI_EXCERPT_CHARS = 4e3;
  var DEFAULT_AI_CONFIG = {
    provider: "gemini-web",
    apiKey: "",
    baseUrl: "",
    model: "56fdd199312815e2",
    systemPrompt: "\u4F60\u662F\u98DE\u4E66\u540C\u6B65\u63D2\u4EF6\u7684 AI \u52A9\u624B\u3002\u4F60\u53EF\u4EE5\u5E2E\u52A9\u7528\u6237\u7FFB\u8BD1\u3001\u603B\u7ED3\u6587\u6863\uFF0C\u89E3\u7B54 Obsidian \u548C\u98DE\u4E66\u540C\u6B65\u76F8\u5173\u7684\u95EE\u9898\u3002\u8BF7\u7528\u7B80\u6D01\u7684\u4E2D\u6587\u56DE\u7B54\u3002"
  };
  var META_FIELDS = [
    { key: "\u6807\u7B7E", label: "\u6807\u7B7E", type: "text", help: "S / X / L / Z / Q / J" },
    { key: "\u7F16\u7801", label: "\u7F16\u7801", type: "text" },
    { key: "\u8F93\u5165", label: "\u8F93\u5165", type: "text" },
    { key: "\u65E5\u671F", label: "\u65E5\u671F", type: "date" },
    { key: "\u65E5\u671F\u7D22\u5F15", label: "\u65E5\u671F\u7D22\u5F15", type: "text", help: "\u591A\u4E2A\u503C\u7528\u9017\u53F7\u6216\u987F\u53F7\u5206\u9694" },
    { key: "\u5173\u952E\u8BCD", label: "\u5173\u952E\u8BCD", type: "textarea" },
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
  var state = null;
  var aiConfig = { ...DEFAULT_AI_CONFIG };
  var aiMessages = [];
  var aiAttachments = [];
  var RECENT_TARGET_DIR_KEY = "recentTargetDir";
  var $ = (id) => document.getElementById(id);
  async function init() {
    bindEvents();
    setupTabs();
    await loadAiConfig();
    setupAiChat();
    await loadPanel();
  }
  function bindEvents() {
    $("refresh-btn").addEventListener("click", () => {
      loadPanel();
    });
    $("sync-btn").addEventListener("click", () => {
      confirmSync();
    });
    $("suggest-btn").addEventListener("click", () => {
      suggestMeta();
    });
    document.addEventListener("change", (e) => {
      const target = e.target;
      if (target instanceof HTMLSelectElement && target.name === "target-dir") {
        if (target.value)
          updateSteps(2, "done");
      }
    });
    document.addEventListener("input", (e) => {
      const target = e.target;
      if (target instanceof HTMLInputElement && target.name === "target-dir") {
        if (target.value.trim())
          updateSteps(2, "done");
      }
    });
  }
  async function loadPanel() {
    setStatus("\u6B63\u5728\u8BFB\u53D6\u5F53\u524D\u6807\u7B7E\u9875...", "info");
    $("sync-btn").setAttribute("disabled", "true");
    renderLoading();
    const activeTab = await getActiveTab();
    const tokenInfo = extractTokenFromUrl(activeTab.url ?? "");
    const [config, template, options, interpreter] = await Promise.all([
      loadConfig(),
      loadPropertyTemplate(),
      loadPropertyOptions(),
      loadInterpreterConfig()
    ]);
    const isFeishuDoc = Boolean(activeTab.url && tokenInfo && (tokenInfo.node_token || tokenInfo.obj_token));
    const pageSnapshot = isFeishuDoc ? void 0 : await getActivePageSnapshot(activeTab);
    const sourceKind = isFeishuDoc ? "feishu-doc" : pageSnapshot?.sourceKind ?? detectSourceKind(activeTab.url ?? "", false, "");
    const next = {
      config,
      template,
      options,
      interpreter,
      mode: isFeishuDoc ? "feishu-sync" : "web-clip",
      sourceKind,
      tokenInfo: tokenInfo ?? {},
      nodeToken: tokenInfo?.node_token || tokenInfo?.obj_token || "",
      title: cleanTitle(pageSnapshot?.title || activeTab.title || (isFeishuDoc ? "\u672A\u547D\u540D\u98DE\u4E66\u6587\u6863" : "\u672A\u547D\u540D\u7F51\u9875")),
      source: pageSnapshot?.url || activeTab.url || "",
      dirs: [],
      fallbackDir: "",
      pageSnapshot
    };
    state = next;
    renderPanel(next);
    if (!config.token) {
      setStatus("\u8BF7\u5148\u5728\u6269\u5C55\u8BBE\u7F6E\u91CC\u4FDD\u5B58 OB \u63D2\u4EF6\u542F\u52A8\u4EE4\u724C\u3002", "error");
      return;
    }
    if (next.mode === "feishu-sync") {
      try {
        const exists = await postExists(config, { node_token: next.nodeToken });
        if (exists.exists) {
          next.existingPath = exists.path;
          next.fallbackDir = dirname(exists.path);
        }
      } catch {
        next.existingPath = void 0;
      }
    }
    const recentDir = await loadRecentTargetDir();
    try {
      const tree = await getTree(config);
      next.dirs = tree.dirs;
      next.fallbackDir = resolveTargetDir(next.dirs, next.fallbackDir || recentDir);
    } catch (err) {
      next.treeError = err instanceof Error ? err.message : String(err);
    }
    state = next;
    renderPanel(next);
    $("sync-btn").toggleAttribute("disabled", !next.config.token || next.mode === "feishu-sync" && !next.nodeToken);
    $("suggest-btn").toggleAttribute("disabled", !next.interpreter.enabled);
    setStatus(getReadyMessage(next), next.treeError ? "error" : "info");
    updateSteps(1, "done");
    if (next.interpreter.enabled && next.interpreter.autoRun) {
      suggestMeta();
    }
  }
  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab ?? {};
  }
  function extractTokenFromUrl(url) {
    const wikiMatch = url.match(/\/wiki\/([A-Za-z0-9]+)/);
    if (wikiMatch)
      return { node_token: wikiMatch[1] };
    const docxMatch = url.match(/\/(?:docx|doc)\/([A-Za-z0-9]+)/);
    if (docxMatch)
      return { obj_token: docxMatch[1] };
    return null;
  }
  function renderLoading() {
    $("doc-summary").innerHTML = `
    <div class="skeleton title"></div>
    <div class="skeleton line"></div>
  `;
    $("directory-control").innerHTML = "";
    $("meta-form").innerHTML = "";
    $("interpreter-note").textContent = "";
  }
  function renderPanel(next) {
    const modeLabel = next.mode === "feishu-sync" ? "\u98DE\u4E66\u6587\u6863\u540C\u6B65" : "\u7F51\u9875\u8F6C Obsidian";
    $("doc-summary").innerHTML = `
    <div class="summary-title">${escapeHtml(next.title)}</div>
    <span class="summary-existing">${modeLabel} \xB7 ${escapeHtml(next.sourceKind)}</span>
    <a class="summary-source" href="${escapeAttr(next.source)}" target="_blank" rel="noreferrer">${escapeHtml(next.source)}</a>
    ${next.existingPath ? `<span class="summary-existing">\u5DF2\u540C\u6B65\uFF1A${escapeHtml(next.existingPath)}</span>` : ""}
  `;
    const syncBtn = $("sync-btn");
    syncBtn.textContent = next.mode === "feishu-sync" ? next.existingPath ? "\u66F4\u65B0\u98DE\u4E66\u6587\u6863\u5230 Obsidian" : "\u540C\u6B65\u98DE\u4E66\u6587\u6863" : "\u7F51\u9875\u8F6C Obsidian";
    $("directory-control").innerHTML = "";
    $("directory-control").appendChild(createDirectoryControl(next));
    renderMetaForm(next);
    $("interpreter-note").textContent = getInterpreterSummary(next);
  }
  function createDirectoryControl(next) {
    const wrapper = document.createElement("div");
    wrapper.className = "dir-control";
    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = "target-dir";
    hidden.value = next.fallbackDir;
    wrapper.appendChild(hidden);
    if (next.mode === "web-clip") {
      wrapper.appendChild(createAppendControl());
    }
    if (next.dirs.length > 0) {
      const tree = document.createElement("div");
      tree.className = "dir-tree";
      tree.setAttribute("role", "tree");
      const roots = buildDirTree(next.dirs);
      const expanded = new Set(getAncestorPaths(next.fallbackDir));
      const renderTree = () => {
        tree.innerHTML = "";
        const appendNode = (dir) => {
          const hasChildren = dir.children.length > 0;
          const isExpanded = expanded.has(dir.path);
          const row = document.createElement("button");
          row.type = "button";
          row.className = "dir-tree-item";
          row.dataset.path = dir.path;
          row.style.setProperty("--depth", String(Math.max(0, dir.depth - 1)));
          row.classList.toggle("is-selected", dir.path === next.fallbackDir);
          row.classList.toggle("is-expanded", isExpanded);
          row.innerHTML = `<span class="dir-tree-caret">${hasChildren ? isExpanded ? "\u25BE" : "\u25B8" : ""}</span><span class="dir-tree-icon">\u{1F4C1}</span><span class="dir-tree-label">${escapeHtml(dir.label)}</span>`;
          row.addEventListener("click", (event) => {
            if (hasChildren && (event.offsetX < 28 + Math.max(0, dir.depth - 1) * 16 || dir.path === next.fallbackDir)) {
              if (isExpanded)
                expanded.delete(dir.path);
              else
                expanded.add(dir.path);
              renderTree();
              return;
            }
            hidden.value = dir.path;
            next.fallbackDir = dir.path;
            expanded.add(dir.path);
            getAncestorPaths(dir.path).forEach((path) => expanded.add(path));
            updateSteps(2, "done");
            renderTree();
          });
          tree.appendChild(row);
          if (isExpanded)
            dir.children.forEach(appendNode);
        };
        roots.forEach(appendNode);
      };
      renderTree();
      wrapper.appendChild(tree);
      return wrapper;
    }
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "\u4F8B\u5982\uFF1A26_0421_L02 \u63D0\u793A\u8BCD";
    input.value = next.fallbackDir;
    input.addEventListener("input", () => {
      hidden.value = input.value.trim();
    });
    wrapper.appendChild(input);
    return wrapper;
  }
  function renderMetaForm(next) {
    const form = $("meta-form");
    form.innerHTML = "";
    const defaults = getDefaultMeta(next);
    META_FIELDS.forEach((field) => {
      const label = document.createElement("label");
      label.className = "field";
      const title = document.createElement("span");
      title.className = "field-label";
      title.textContent = field.label;
      const control = createMetaControl(field, defaults[field.key], next.options[field.key]);
      label.append(title, control);
      if (field.help) {
        const help = document.createElement("small");
        help.textContent = field.help;
        label.appendChild(help);
      }
      form.appendChild(label);
    });
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
      const optionValues = options.map((option) => normalizePropertyOptionValue(String(field.key), option));
      options.forEach((option, index) => appendOption(select, optionValues[index], option));
      const normalizedValue = normalizePropertyOptionValue(String(field.key), stringValue);
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
      wrapper.className = "option-input";
      const listId = `options-${encodeURIComponent(String(field.key))}`;
      input.setAttribute("list", listId);
      const datalist = document.createElement("datalist");
      datalist.id = listId;
      options.forEach((option) => appendOption(datalist, option, option));
      wrapper.append(input, datalist);
      return wrapper;
    }
    return input;
  }
  function createAppendControl() {
    const wrapper = document.createElement("div");
    wrapper.className = "append-control";
    wrapper.innerHTML = `
    <label class="append-toggle">
      <input type="checkbox" name="append-mode" />
      <span>\u8865\u5145\u5230\u5DF2\u6709\u6587\u6863\uFF0C\u4E0D\u65B0\u5EFA</span>
    </label>
    <input type="text" name="append-path" placeholder="\u4F8B\u5982\uFF1A2\uFE0F\u20E3\u8F93\u51FA/\u91D1\u53E5\u6C47\u603B.md" disabled />
    <small>\u9002\u5408\u5212\u8BCD\u91D1\u53E5\u3001\u7247\u6BB5\u7D20\u6750\u3001\u540C\u4E00\u4E3B\u9898\u6301\u7EED\u8865\u5145\u3002\u586B\u5199 vault \u5185\u76F8\u5BF9\u8DEF\u5F84\u3002</small>
  `;
    const checkbox = wrapper.querySelector('[name="append-mode"]');
    const input = wrapper.querySelector('[name="append-path"]');
    checkbox?.addEventListener("change", () => {
      if (!input || !checkbox)
        return;
      input.disabled = !checkbox.checked;
      if (checkbox.checked)
        input.focus();
    });
    return wrapper;
  }
  function getDefaultMeta(next) {
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const keywords = draftKeywords(next.title).join("\u3001");
    const vars = {
      title: next.title,
      url: next.source,
      date: today,
      dir: next.fallbackDir,
      keywords
    };
    return {
      \u6807\u7B7E: applyTemplate(next.template.\u6807\u7B7E || "S", vars),
      \u7F16\u7801: applyTemplate(next.template.\u7F16\u7801, vars),
      \u8F93\u5165: applyTemplate(next.template.\u8F93\u5165 || next.fallbackDir, vars),
      \u65E5\u671F: applyTemplate(next.template.\u65E5\u671F || today, vars),
      \u65E5\u671F\u7D22\u5F15: applyTemplate(next.template.\u65E5\u671F\u7D22\u5F15, vars),
      \u5173\u952E\u8BCD: applyTemplate(next.template.\u5173\u952E\u8BCD || keywords, vars),
      \u6982\u8FF0: applyTemplate(next.template.\u6982\u8FF0, vars),
      \u8BC4\u5206: next.template.\u8BC4\u5206,
      \u8BC4\u5206_\u663E\u793A: applyTemplate(next.template.\u8BC4\u5206_\u663E\u793A, vars),
      \u7D22\u5F15_\u77E5\u8BC6\u5E93: applyTemplate(next.template.\u7D22\u5F15_\u77E5\u8BC6\u5E93, vars),
      \u7D22\u5F15_\u989C\u8272: applyTemplate(next.template.\u7D22\u5F15_\u989C\u8272, vars),
      "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988": applyTemplate(next.template["\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988"], vars),
      \u7D22\u5F15_\u5757: applyTemplate(next.template.\u7D22\u5F15_\u5757, vars),
      \u7D22\u5F15_\u98CE\u9669: applyTemplate(next.template.\u7D22\u5F15_\u98CE\u9669, vars)
    };
  }
  function applyTemplate(template, vars) {
    return String(template ?? "").replace(/\{\{(\w+)\}\}/g, (_full, key) => vars[key] ?? "");
  }
  function collectMeta() {
    const meta = {};
    document.querySelectorAll("[data-meta-key]").forEach((control) => {
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
  async function suggestMeta() {
    if (!state)
      return;
    const button = $("suggest-btn");
    const dirControl = document.querySelector('[name="target-dir"]');
    const dir = dirControl?.value.trim() || state.fallbackDir;
    button.disabled = true;
    setStatus("\u6B63\u5728\u8BFB\u53D6\u6B63\u6587\u524D\u6BB5\u5E76\u751F\u6210 AI \u6807\u7B7E\u4E0E\u7D22\u5F15\u5EFA\u8BAE...", "info");
    try {
      const excerpt = state.mode === "web-clip" && state.pageSnapshot ? buildSnapshotExcerpt(state.pageSnapshot, state.interpreter.excerptChars || DEFAULT_AI_EXCERPT_CHARS) : await getActiveTabExcerpt(state.interpreter.excerptChars || DEFAULT_AI_EXCERPT_CHARS);
      const input = {
        title: state.title,
        source: state.source,
        dir,
        excerpt,
        template: state.template,
        options: state.options
      };
      const suggestion = state.interpreter.customProviderEnabled === true ? await suggestMetaWithInterpreter(state.interpreter, input) : await suggestMetaWithAiAssistant(input);
      applyMetaSuggestion(suggestion);
      setStatus("AI \u5EFA\u8BAE\u5DF2\u586B\u5165\uFF0C\u8BF7\u4EBA\u5DE5\u786E\u8BA4\u540E\u518D\u540C\u6B65\u3002", "success");
    } catch (err) {
      setStatus(`AI \u5EFA\u8BAE\u5931\u8D25\uFF1A${err instanceof Error ? err.message : String(err)}`, "error");
    } finally {
      button.disabled = false;
    }
  }
  async function suggestMetaWithAiAssistant(input) {
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const prompt = [
      "\u4F60\u662F Obsidian \u77E5\u8BC6\u5E93\u540C\u6B65\u63D2\u4EF6\u7684 YAML \u5C5E\u6027\u5EFA\u8BAE\u5668\u3002\u8BF7\u6839\u636E\u7528\u6237\u9884\u8BBE\u5C3D\u91CF\u586B\u597D\u5B57\u6BB5\u3002",
      "\u82E5\u8BF4\u660E\u6587\u6863\u548C\u63D2\u4EF6\u9884\u8BBE\u51B2\u7A81\uFF0C\u4EE5\u63D2\u4EF6\u9884\u8BBE/\u53EF\u9009\u9879\u4E3A\u51C6\u3002",
      "\u7F16\u7801\u5B57\u6BB5\u5FC5\u987B\u7559\u7A7A\u5B57\u7B26\u4E32\uFF0C\u56E0\u4E3A\u7F16\u7801\u7531 auto-rename \u63D2\u4EF6\u5206\u914D\u3002",
      "\u8F93\u5165\u5B57\u6BB5\u4F18\u5148\u4F7F\u7528\u76EE\u6807\u76EE\u5F55\u5B8C\u6574\u8DEF\u5F84\u3002",
      `\u65E5\u671F\u5B57\u6BB5\u7528 ISO \u683C\u5F0F YYYY-MM-DD\uFF1B\u65E0\u6CD5\u4ECE\u5185\u5BB9\u5224\u65AD\u65F6\u4F7F\u7528\u4ECA\u5929\uFF1A${today}\u3002`,
      "\u5173\u952E\u8BCD\u7ED9 3-7 \u4E2A\uFF0C\u7528\u987F\u53F7\u5206\u9694\u3002",
      "\u8BC4\u5206\u5FC5\u987B\u662F 1-5\uFF1B\u8BC4\u5206_\u663E\u793A\u5FC5\u987B\u4ECE\u53EF\u9009\u9879\u4E2D\u9009\u62E9\u6700\u63A5\u8FD1\u7684\u4E00\u9879\u3002",
      "\u6240\u6709\u679A\u4E3E\u5B57\u6BB5\u5FC5\u987B\u4ECE\u53EF\u9009\u9879\u4E2D\u9009\u62E9\u6700\u63A5\u8FD1\u7684\u4E00\u9879\uFF1B\u7D22\u5F15_\u5757\u548C\u7D22\u5F15_\u98CE\u9669\u53EF\u4EE5\u8FD4\u56DE\u6570\u7EC4\u3002",
      "\u53EA\u8FD4\u56DE\u4E25\u683C JSON \u5BF9\u8C61\uFF0C\u4E0D\u8981 Markdown\uFF0C\u4E0D\u8981\u89E3\u91CA\u3002",
      "",
      `\u6807\u9898\uFF1A${input.title}`,
      `URL\uFF1A${input.source}`,
      `\u76EE\u6807\u76EE\u5F55\uFF1A${input.dir}`,
      `\u5C5E\u6027\u6A21\u677F\uFF1A${JSON.stringify(input.template)}`,
      `\u53EF\u9009\u9879\uFF1A${JSON.stringify(input.options)}`,
      `\u6B63\u6587\u6458\u8981\uFF1A
${input.excerpt || ""}`,
      "",
      "\u5FC5\u987B\u8FD4\u56DE\u8FD9\u4E9B\u5B57\u6BB5\uFF1A\u6807\u7B7E\u3001\u7F16\u7801\u3001\u8F93\u5165\u3001\u65E5\u671F\u3001\u65E5\u671F\u7D22\u5F15\u3001\u5173\u952E\u8BCD\u3001\u6982\u8FF0\u3001\u8BC4\u5206\u3001\u8BC4\u5206_\u663E\u793A\u3001\u7D22\u5F15_\u77E5\u8BC6\u5E93\u3001\u7D22\u5F15_\u989C\u8272\u3001\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988\u3001\u7D22\u5F15_\u5757\u3001\u7D22\u5F15_\u98CE\u9669\u3002"
    ].join("\n");
    const result = await chatWithAI(aiConfig, [
      { role: "system", content: "\u4F60\u53EA\u8F93\u51FA\u53EF\u89E3\u6790 JSON\u3002" },
      { role: "user", content: prompt }
    ]);
    return normalizeAiSuggestion(parseAiJsonObject(result), input.dir);
  }
  function parseAiJsonObject(raw) {
    const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    const jsonText = start >= 0 && end > start ? trimmed.slice(start, end + 1) : trimmed;
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        throw new Error("not object");
      return parsed;
    } catch {
      throw new Error(`AI \u52A9\u624B\u8FD4\u56DE\u975E JSON\uFF1A${raw.slice(0, 160)}`);
    }
  }
  function normalizeAiSuggestion(suggestion, dir) {
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const next = { ...suggestion };
    next.\u7F16\u7801 = "";
    next.\u8F93\u5165 = String(next.\u8F93\u5165 || dir || "");
    next.\u6807\u7B7E = normalizePropertyOptionValue("\u6807\u7B7E", String(next.\u6807\u7B7E || "S")) || "S";
    const rawDate = String(next.\u65E5\u671F || today).replace(/\//g, "-");
    next.\u65E5\u671F = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : today;
    if (!next.\u5173\u952E\u8BCD)
      next.\u5173\u952E\u8BCD = draftKeywords(String(next.\u6982\u8FF0 || "")).join("\u3001");
    const score = normalizePropertyOptionValue("\u8BC4\u5206", String(next.\u8BC4\u5206 || "2"));
    next.\u8BC4\u5206 = score || "2";
    const scoreLabelMap = {
      "1": "\u{1F31F}\xB7\u7D20\u6750",
      "2": "\u{1F31F}\u{1F31F}\xB7\u6574\u7406",
      "3": "\u{1F31F}\u{1F31F}\u{1F31F}\xB7\u5B9E\u8DF5",
      "4": "\u{1F31F}\u{1F31F}\u{1F31F}\u{1F31F}\xB7\u901A\u7528",
      "5": "\u{1F31F}\u{1F31F}\u{1F31F}\u{1F31F}\u{1F31F}\xB7\u4F53\u7CFB"
    };
    if (!next.\u8BC4\u5206_\u663E\u793A || String(next.\u8BC4\u5206_\u663E\u793A).includes("\u672A\u9009\u62E9")) {
      next.\u8BC4\u5206_\u663E\u793A = scoreLabelMap[String(next.\u8BC4\u5206)] || scoreLabelMap["2"];
    }
    for (const key of ["\u65E5\u671F\u7D22\u5F15", "\u7D22\u5F15_\u77E5\u8BC6\u5E93", "\u7D22\u5F15_\u989C\u8272", "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988", "\u7D22\u5F15_\u5757", "\u7D22\u5F15_\u98CE\u9669"]) {
      const raw = next[key];
      if (Array.isArray(raw)) {
        next[key] = raw.map((item) => normalizePropertyOptionValue(key, String(item))).filter(Boolean);
      } else {
        const parts = splitList(String(raw || ""));
        if (key === "\u7D22\u5F15_\u5757" || key === "\u7D22\u5F15_\u98CE\u9669" || key === "\u65E5\u671F\u7D22\u5F15") {
          next[key] = parts.map((item) => normalizePropertyOptionValue(key, item)).filter(Boolean);
        } else {
          next[key] = normalizePropertyOptionValue(key, String(raw || ""));
        }
      }
    }
    return next;
  }
  function applyMetaSuggestion(suggestion) {
    for (const [key, raw] of Object.entries(suggestion)) {
      const control = document.querySelector(`[data-meta-key="${cssEscape(key)}"]`);
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
    wrapper.className = "grouped-control";
    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.dataset.metaKey = key;
    hidden.dataset.groupedMeta = "true";
    wrapper.appendChild(hidden);
    const groups = GROUPED_FIELDS[key] ?? [];
    groups.forEach((group, groupIndex) => {
      const row = document.createElement("div");
      row.className = "choice-row";
      const title = document.createElement("span");
      title.className = "choice-title";
      title.textContent = group.name;
      row.appendChild(title);
      group.options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "choice-chip";
        button.textContent = option.label;
        button.dataset.groupIndex = String(groupIndex);
        button.dataset.value = option.value;
        button.addEventListener("click", () => {
          const active = button.classList.contains("is-selected");
          row.querySelectorAll(".choice-chip").forEach((chip) => chip.classList.remove("is-selected"));
          if (!active)
            button.classList.add("is-selected");
          syncGroupedHiddenValue(wrapper, hidden);
        });
        row.appendChild(button);
      });
      wrapper.appendChild(row);
    });
    setGroupedControlValue(hidden, String(key), value);
    return wrapper;
  }
  function setGroupedControlValue(control, key, value) {
    const wrapper = control.closest(".grouped-control");
    if (!wrapper) {
      control.value = value;
      return;
    }
    const selected = new Set(splitList(value).map((item) => normalizePropertyOptionValue(key, item)));
    wrapper.querySelectorAll(".choice-chip").forEach((chip) => {
      chip.classList.toggle("is-selected", selected.has(chip.dataset.value ?? ""));
    });
    syncGroupedHiddenValue(wrapper, control);
  }
  function syncGroupedHiddenValue(wrapper, hidden) {
    const values = Array.from(wrapper.querySelectorAll(".choice-chip.is-selected")).map((chip) => chip.dataset.value ?? "").filter(Boolean);
    hidden.value = values.join("\u3001");
  }
  async function confirmSync() {
    if (!state)
      return;
    const syncBtn = $("sync-btn");
    const dirControl = document.querySelector('[name="target-dir"]');
    const appendEnabled = document.querySelector('[name="append-mode"]')?.checked === true;
    const dir = dirControl?.value.trim() || state.fallbackDir || void 0;
    if (!dir && !appendEnabled) {
      setStatus("\u8BF7\u9009\u62E9\u6216\u586B\u5199\u76EE\u6807\u76EE\u5F55\u540E\u518D\u540C\u6B65\u3002", "error");
      return;
    }
    syncBtn.disabled = true;
    setStatus("\u6B63\u5728\u8FDE\u63A5 OB \u63D2\u4EF6...", "info");
    const conn = await testConnection(state.config);
    if (!conn.ok) {
      setStatus(conn.message, "error");
      syncBtn.disabled = false;
      return;
    }
    try {
      if (state.mode === "web-clip") {
        await confirmWebClip(state, dir || state.fallbackDir);
        return;
      }
      const targetDir = dir || "";
      setStatus("\u6B63\u5728\u6293\u53D6\u5E76\u5199\u5165 Obsidian...", "info");
      const result = await postFetch(state.config, {
        node_token: state.nodeToken,
        obj_token: state.tokenInfo.obj_token,
        dir: targetDir,
        meta: collectMeta()
      });
      await saveRecentTargetDir(targetDir);
      const codeMsg = result.\u7F16\u7801 ? `\uFF08\u7F16\u7801 ${result.\u7F16\u7801}\uFF09` : "";
      setStatus(`${result.action === "created" ? "\u5DF2\u521B\u5EFA" : "\u5DF2\u66F4\u65B0"}\uFF1A${result.path}${codeMsg}`, "success");
      updateSteps(4, "done");
    } catch (err) {
      setStatus(`\u540C\u6B65\u5931\u8D25\uFF1A${err instanceof Error ? err.message : String(err)}`, "error");
      syncBtn.disabled = false;
    }
  }
  async function confirmWebClip(current, dir) {
    const appendEnabled = document.querySelector('[name="append-mode"]')?.checked === true;
    const appendPath = document.querySelector('[name="append-path"]')?.value.trim() || "";
    if (appendEnabled && !appendPath) {
      throw new Error("\u5DF2\u52FE\u9009\u201C\u8865\u5145\u5230\u5DF2\u6709\u6587\u6863\u201D\uFF0C\u8BF7\u586B\u5199\u8981\u8865\u5145\u7684 .md \u6587\u4EF6\u8DEF\u5F84\u3002");
    }
    setStatus(appendEnabled ? "\u6B63\u5728\u6574\u7406\u7F51\u9875\u5185\u5BB9\u5E76\u8865\u5145\u5230\u5DF2\u6709\u6587\u6863..." : "\u6B63\u5728\u6574\u7406\u7F51\u9875\u5185\u5BB9\u5E76\u8F6C\u6362\u4E3A Obsidian \u6587\u6863...", "info");
    const snapshot = current.pageSnapshot ?? await getActivePageSnapshot(await getActiveTab());
    const draft = await buildWebConversionDraft(current, snapshot, dir);
    const result = await postClip(current.config, {
      title: snapshot.title || current.title,
      url: snapshot.url || current.source,
      sourceKind: snapshot.sourceKind === "feishu-doc" ? "generic-page" : snapshot.sourceKind,
      text: snapshot.selection || snapshot.text,
      rawText: snapshot.text,
      bodyMarkdown: draft.bodyMarkdown,
      description: snapshot.description,
      dir: draft.suggestedDir || dir,
      appendPath: appendEnabled ? appendPath : void 0,
      meta: draft.meta
    });
    await saveRecentTargetDir(dir);
    setStatus(`${appendEnabled ? "\u5DF2\u8865\u5145" : "\u5DF2\u4FDD\u5B58"}\uFF1A${result.path}`, "success");
    updateSteps(4, "done");
  }
  function getReadyMessage(next) {
    if (next.treeError)
      return `\u76EE\u5F55\u6811\u52A0\u8F7D\u5931\u8D25\uFF0C\u53EF\u624B\u52A8\u586B\u5199\u76EE\u5F55\uFF1A${next.treeError}`;
    if (next.existingPath)
      return `\u68C0\u6D4B\u5230\u5DF2\u540C\u6B65\u6587\u4EF6\uFF0C\u786E\u8BA4\u540E\u5C06\u66F4\u65B0\uFF1A${next.existingPath}`;
    if (next.mode === "web-clip")
      return "\u5F53\u524D\u9875\u4E0D\u662F\u98DE\u4E66 wiki/docx/doc \u6587\u6863\uFF0C\u5C06\u4F7F\u7528\u201C\u7F51\u9875\u8F6C Obsidian\u201D\u6A21\u5F0F\u3002Base\u3001\u591A\u7EF4\u8868\u683C\u548C\u666E\u901A\u7F51\u9875\u4F1A\u6309\u53EF\u89C1\u5185\u5BB9\u751F\u6210 Obsidian \u6587\u6863\u3002";
    return "\u8BF7\u786E\u8BA4\u76EE\u5F55\u548C\u5C5E\u6027\uFF0C\u786E\u8BA4\u540E\u5F00\u59CB\u540C\u6B65\u3002";
  }
  function getInterpreterSummary(next) {
    if (next.mode === "web-clip") {
      return "\u7F51\u9875\u8F6C\u6362\uFF1A\u8BFB\u53D6\u5F53\u524D\u9875\u53EF\u89C1\u5185\u5BB9\uFF1B\u53EF\u52FE\u9009\u201C\u8865\u5145\u5230\u5DF2\u6709\u6587\u6863\u201D\u628A\u5212\u8BCD/\u91D1\u53E5\u8FFD\u52A0\u5230\u6C47\u603B\u6587\u4EF6\u3002";
    }
    if (!next.interpreter.enabled)
      return "\u89E3\u91CA\u5668\uFF1A\u5173\u95ED\u3002\u4FA7\u8FB9\u680F\u5C06\u53EA\u4F7F\u7528\u5C5E\u6027\u6A21\u677F\u9884\u586B\u3002";
    if (next.interpreter.customProviderEnabled !== true) {
      const excerptChars2 = next.interpreter.excerptChars || DEFAULT_AI_EXCERPT_CHARS;
      return `\u89E3\u91CA\u5668\uFF1A\u4F7F\u7528 AI \u52A9\u624B / ${aiConfig.provider}\uFF0C\u624B\u52A8\u786E\u8BA4\u6A21\u5F0F\u3002AI \u53EA\u8BFB\u53D6\u6B63\u6587\u524D ${excerptChars2} \u5B57\u751F\u6210\u5EFA\u8BAE\uFF0C\u6700\u7EC8\u5199\u5165\u4EE5\u8FD9\u91CC\u786E\u8BA4\u4E3A\u51C6\u3002`;
    }
    const provider = next.interpreter.provider || "\u672C\u5730\u89C4\u5219";
    const model = next.interpreter.model ? ` / ${next.interpreter.model}` : "";
    const route = next.interpreter.baseUrl ? `\uFF0C\u4E2D\u8F6C\uFF1A${next.interpreter.baseUrl}` : "";
    const mode = next.interpreter.autoRun ? "\u81EA\u52A8\u5EFA\u8BAE\u5F00\u542F" : "\u624B\u52A8\u786E\u8BA4\u6A21\u5F0F";
    const excerptChars = next.interpreter.excerptChars || DEFAULT_AI_EXCERPT_CHARS;
    return `\u89E3\u91CA\u5668\uFF1A${provider}${model}${route}\uFF0C${mode}\u3002AI \u53EA\u8BFB\u53D6\u6B63\u6587\u524D ${excerptChars} \u5B57\u751F\u6210\u5EFA\u8BAE\uFF0C\u6700\u7EC8\u5199\u5165\u4EE5\u8FD9\u91CC\u786E\u8BA4\u4E3A\u51C6\u3002`;
  }
  async function getActiveTabExcerpt(limit) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id)
      return "";
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "GET_FEISHU_DOC_EXCERPT",
        limit
      });
      return response?.ok ? response.excerpt ?? "" : "";
    } catch {
      return "";
    }
  }
  async function getActivePageSnapshot(tab) {
    const fallbackUrl = tab.url || "";
    const fallbackTitle = cleanTitle(tab.title || "\u672A\u547D\u540D\u7F51\u9875");
    if (!tab.id || !/^https?:/i.test(fallbackUrl)) {
      return {
        title: fallbackTitle,
        url: fallbackUrl,
        description: "",
        selection: "",
        headings: [],
        tables: [],
        text: "",
        sourceKind: detectSourceKind(fallbackUrl, false, "")
      };
    }
    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const pickText = (element, limit = 12e3) => (element?.textContent || "").replace(/\s+/g, " ").trim().slice(0, limit);
          const selection = window.getSelection()?.toString().replace(/\s+/g, " ").trim() || "";
          const title = document.title || "";
          const description = document.querySelector('meta[name="description"],meta[property="og:description"]')?.content || "";
          const main = document.querySelector('article, main, [role="main"], .article, .post, .content, .doc-content');
          const bodyText = pickText(main, 16e3) || pickText(document.body, 16e3);
          const headings = Array.from(document.querySelectorAll("h1,h2,h3")).map((heading) => heading.textContent?.replace(/\s+/g, " ").trim() || "").filter(Boolean).slice(0, 24);
          const tables = Array.from(document.querySelectorAll('table,[role="table"],.table,.grid,.bitable,.base-table')).map((table) => pickText(table, 3e3)).filter(Boolean).slice(0, 6);
          return {
            title,
            url: location.href,
            description,
            selection,
            headings,
            tables,
            text: selection || bodyText
          };
        }
      });
      const value = result?.result;
      const text = value?.text || "";
      return {
        title: cleanTitle(value?.title || fallbackTitle),
        url: value?.url || fallbackUrl,
        description: value?.description || "",
        selection: value?.selection || "",
        headings: value?.headings || [],
        tables: value?.tables || [],
        text,
        sourceKind: detectSourceKind(value?.url || fallbackUrl, Boolean(value?.selection), text)
      };
    } catch {
      return {
        title: fallbackTitle,
        url: fallbackUrl,
        description: "",
        selection: "",
        headings: [],
        tables: [],
        text: "",
        sourceKind: detectSourceKind(fallbackUrl, false, "")
      };
    }
  }
  function detectSourceKind(url, hasSelection, text) {
    if (hasSelection)
      return "selection";
    if (/\.feishu\.cn\/(base|bitable|sheets|mindnotes|wiki\/base)/i.test(url) || /多维表格|Base|bitable/i.test(text))
      return "feishu-base";
    if (/\/(article|post|news|blog|posts)\b/i.test(url))
      return "article";
    return "generic-page";
  }
  async function buildWebConversionDraft(current, snapshot, dir) {
    const scenePrompt = current.scenePrompt?.trim();
    if (!current.interpreter.enabled && !current.aiEnabled)
      return fallbackWebDraft(current, snapshot, dir);
    if (current.interpreter.customProviderEnabled === true) {
      try {
        const meta = await suggestMetaWithInterpreter(current.interpreter, {
          title: snapshot.title,
          source: snapshot.url,
          dir,
          excerpt: buildSnapshotExcerpt(snapshot, current.interpreter.excerptChars || DEFAULT_AI_EXCERPT_CHARS),
          template: current.template,
          options: current.options
        });
        return {
          meta: normalizeAiSuggestion(meta, dir),
          bodyMarkdown: fallbackBodyMarkdown(snapshot),
          suggestedDir: dir
        };
      } catch {
        return fallbackWebDraft(current, snapshot, dir);
      }
    }
    try {
      const prompt = [
        "\u4F60\u662F\u7F51\u9875\u8F6C Obsidian \u6587\u6863\u8F6C\u6362\u5668\u3002\u8BF7\u628A\u5F53\u524D\u7F51\u9875/\u9009\u4E2D\u6587\u672C\u6574\u7406\u6210\u7528\u6237\u77E5\u8BC6\u5E93\u53EF\u7528\u7684 Obsidian Markdown\u3002",
        "\u53EA\u8FD4\u56DE\u4E25\u683C JSON\uFF0C\u4E0D\u8981 Markdown \u4EE3\u7801\u5757\uFF0C\u4E0D\u8981\u89E3\u91CA\u3002",
        'JSON \u7ED3\u6784\uFF1A{"meta":{...},"bodyMarkdown":"...","suggestedDir":""}',
        "meta \u5FC5\u987B\u7B26\u5408\u63D2\u4EF6\u9884\u8BBE\uFF1B\u8BF4\u660E\u6587\u6863\u548C\u63D2\u4EF6\u9884\u8BBE\u51B2\u7A81\u65F6\uFF0C\u4EE5\u63D2\u4EF6\u9884\u8BBE/\u53EF\u9009\u9879\u4E3A\u51C6\u3002",
        "\u7F16\u7801\u5FC5\u987B\u662F\u7A7A\u5B57\u7B26\u4E32\uFF1B\u8F93\u5165\u4F18\u5148\u586B\u76EE\u6807\u76EE\u5F55\uFF1B\u65E5\u671F YYYY-MM-DD\uFF1B\u5173\u952E\u8BCD 3-7 \u4E2A\u987F\u53F7\u5206\u9694\uFF1B\u8BC4\u5206 1-5\uFF1B\u8BC4\u5206_\u663E\u793A\u4E0E\u8BC4\u5206\u5339\u914D\u3002",
        scenePrompt ? `\u7528\u6237\u81EA\u5B9A\u4E49\u573A\u666F Prompt\uFF1A
${scenePrompt}` : "",
        "",
        `\u6807\u9898\uFF1A${snapshot.title}`,
        `URL\uFF1A${snapshot.url}`,
        `\u6765\u6E90\u7C7B\u578B\uFF1A${snapshot.sourceKind}`,
        `\u76EE\u6807\u76EE\u5F55\uFF1A${dir}`,
        `\u5C5E\u6027\u6A21\u677F\uFF1A${JSON.stringify(current.template)}`,
        `\u53EF\u9009\u9879\uFF1A${JSON.stringify(current.options)}`,
        `Meta description\uFF1A${snapshot.description}`,
        `Headings\uFF1A${snapshot.headings.join(" / ")}`,
        `Tables\uFF1A
${snapshot.tables.join("\n\n")}`,
        `\u6B63\u6587\uFF1A
${buildSnapshotExcerpt(snapshot, 12e3)}`
      ].join("\n");
      const result = await chatWithAI(aiConfig, [
        { role: "system", content: "\u4F60\u53EA\u8F93\u51FA\u53EF\u89E3\u6790 JSON\u3002" },
        { role: "user", content: prompt }
      ]);
      const parsed = parseAiJsonObject(result);
      const meta = parsed.meta && typeof parsed.meta === "object" && !Array.isArray(parsed.meta) ? parsed.meta : parsed;
      const bodyMarkdown = typeof parsed.bodyMarkdown === "string" && parsed.bodyMarkdown.trim() ? parsed.bodyMarkdown.trim() : fallbackBodyMarkdown(snapshot);
      return {
        meta: normalizeAiSuggestion(meta, dir),
        bodyMarkdown,
        suggestedDir: typeof parsed.suggestedDir === "string" ? parsed.suggestedDir.trim() : dir
      };
    } catch {
      return fallbackWebDraft(current, snapshot, dir);
    }
  }
  function fallbackWebDraft(current, snapshot, dir) {
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    return {
      meta: normalizeAiSuggestion({
        \u6807\u7B7E: "S",
        \u7F16\u7801: "",
        \u8F93\u5165: dir,
        \u65E5\u671F: today,
        \u5173\u952E\u8BCD: draftKeywords(`${snapshot.title} ${snapshot.description} ${snapshot.text}`).join("\u3001") || "\u7F51\u9875\u526A\u5B58",
        \u6982\u8FF0: snapshot.description || `\u4ECE\u7F51\u9875\u8F6C\u6362\uFF1A${snapshot.title}`,
        \u8BC4\u5206: 1,
        \u8BC4\u5206_\u663E\u793A: "\u{1F31F}\xB7\u7D20\u6750"
      }, dir),
      bodyMarkdown: fallbackBodyMarkdown(snapshot),
      suggestedDir: dir || current.fallbackDir
    };
  }
  function buildSnapshotExcerpt(snapshot, limit) {
    return [
      snapshot.selection ? `\u9009\u4E2D\u6587\u672C\uFF1A
${snapshot.selection}` : "",
      snapshot.tables.length ? `\u8868\u683C/\u5361\u7247\uFF1A
${snapshot.tables.join("\n\n")}` : "",
      snapshot.text ? `\u6B63\u6587\uFF1A
${snapshot.text}` : ""
    ].filter(Boolean).join("\n\n").slice(0, limit);
  }
  function fallbackBodyMarkdown(snapshot) {
    const sections = [
      snapshot.description ? `## \u6458\u8981

${snapshot.description}` : "",
      snapshot.headings.length ? `## \u9875\u9762\u7ED3\u6784

${snapshot.headings.map((heading) => `- ${heading}`).join("\n")}` : "",
      snapshot.tables.length ? `## \u53EF\u89C1\u8868\u683C/\u5361\u7247

${snapshot.tables.join("\n\n---\n\n")}` : "",
      `## \u6B63\u6587

${snapshot.selection || snapshot.text || "\uFF08\u5F53\u524D\u9875\u9762\u6CA1\u6709\u53EF\u8BFB\u53D6\u7684\u53EF\u89C1\u6587\u672C\u3002\uFF09"}`
    ].filter(Boolean);
    return sections.join("\n\n");
  }
  function cleanTitle(title) {
    return title.replace(/\s*-\s*飞书云文档\s*$/, "").trim() || title.trim();
  }
  function dirname(path) {
    if (!path)
      return "";
    const parts = path.split("/").filter(Boolean);
    if (parts.length <= 1)
      return "";
    return parts.slice(0, -1).join("/");
  }
  async function loadRecentTargetDir() {
    return new Promise((resolve) => {
      chrome.storage.local.get([RECENT_TARGET_DIR_KEY], (result) => {
        resolve(typeof result[RECENT_TARGET_DIR_KEY] === "string" ? result[RECENT_TARGET_DIR_KEY] : "");
      });
    });
  }
  async function saveRecentTargetDir(dir) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [RECENT_TARGET_DIR_KEY]: dir }, () => resolve());
    });
  }
  function resolveTargetDir(dirs, preferred) {
    if (dirs.length === 0)
      return preferred;
    if (preferred && dirs.some((dir) => dir.path === preferred))
      return preferred;
    if (preferred) {
      const parent = dirs.filter((dir) => preferred.startsWith(`${dir.path}/`)).sort((a, b) => b.path.length - a.path.length)[0];
      if (parent)
        return parent.path;
    }
    const inboxLike = dirs.find((dir) => /inbox|输入|收集|素材|闪念/i.test(dir.path));
    return inboxLike?.path || dirs[0].path;
  }
  function buildDirTree(dirs) {
    const nodes = /* @__PURE__ */ new Map();
    dirs.slice().sort((a, b) => a.path.localeCompare(b.path, "zh")).forEach((dir) => {
      nodes.set(dir.path, { ...dir, children: [], parentPath: dirname(dir.path) });
    });
    const roots = [];
    for (const node of nodes.values()) {
      const parent = node.parentPath ? nodes.get(node.parentPath) : void 0;
      if (parent)
        parent.children.push(node);
      else
        roots.push(node);
    }
    const sortChildren = (items) => {
      items.sort((a, b) => a.label.localeCompare(b.label, "zh"));
      items.forEach((item) => sortChildren(item.children));
    };
    sortChildren(roots);
    return roots;
  }
  function getAncestorPaths(path) {
    const parts = path.split("/").filter(Boolean);
    const ancestors = [];
    for (let index = 1; index < parts.length; index += 1) {
      ancestors.push(parts.slice(0, index).join("/"));
    }
    return ancestors;
  }
  function draftKeywords(title) {
    const words = title.replace(/[^\p{Script=Han}\p{Letter}\p{Number}]+/gu, " ").split(/\s+/).map((word) => word.trim()).filter((word) => word.length >= 2);
    return Array.from(new Set(words)).slice(0, 6);
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
  function setStatus(message, type) {
    const status = $("status");
    status.textContent = message;
    status.className = `status status-${type}`;
  }
  function updateSteps(current, stepState) {
    const dots = document.querySelectorAll(".step");
    dots.forEach((dot, i) => {
      const n = i + 1;
      dot.classList.remove("step-active", "step-done");
      if (n < current)
        dot.classList.add("step-done");
      if (n === current)
        dot.classList.add(stepState === "active" ? "step-active" : "step-done");
    });
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
  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }
  function setupTabs() {
    document.querySelectorAll(".panel-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        const panel = btn.dataset.panel;
        switchTab(panel);
      });
    });
  }
  function switchTab(panel) {
    document.querySelectorAll(".panel-tab").forEach((b) => {
      b.classList.toggle("panel-tab-active", b.dataset.panel === panel);
    });
    const syncEl = document.getElementById("panel-sync");
    const aiEl = document.getElementById("panel-ai");
    if (syncEl)
      syncEl.style.display = panel === "sync" ? "" : "none";
    if (aiEl)
      aiEl.style.display = panel === "ai" ? "flex" : "none";
    const title = document.getElementById("page-title");
    if (title)
      title.textContent = panel === "sync" ? "\u540C\u6B65\u524D\u9884\u89C8" : "AI \u5BF9\u8BDD";
  }
  async function loadAiConfig() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["aiConfig"], (result) => {
        aiConfig = { ...DEFAULT_AI_CONFIG, ...result.aiConfig ?? {} };
        updateProviderBadge();
        resolve();
      });
    });
  }
  function updateProviderBadge() {
    const badge = document.getElementById("ai-provider-badge");
    if (!badge)
      return;
    const labels = {
      "gemini-web": "Gemini Web",
      "gemini-nano": "Gemini Nano (\u5185\u7F6E)",
      "gemini-api": "Gemini API",
      "openai": "OpenAI",
      "deepseek": "DeepSeek",
      "custom": "\u81EA\u5B9A\u4E49"
    };
    badge.textContent = labels[aiConfig.provider] || aiConfig.provider;
    badge.className = `ai-provider-badge ai-provider-${aiConfig.provider}`;
  }
  async function chatWithAI(config, messages, attachments = []) {
    switch (config.provider) {
      case "gemini-web": {
        const prompt = messages.filter((message) => message.role !== "system").map((message) => message.content).join("\n\n");
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({ type: "ai-inline", payload: { action: "ai-chat", text: prompt, attachments } }, (response) => {
            const error = chrome.runtime.lastError?.message || response?.error;
            if (error)
              reject(new Error(error));
            else
              resolve(response?.text || "Gemini Web \u672A\u8FD4\u56DE\u5185\u5BB9");
          });
        });
      }
      case "gemini-nano": {
        const ai = window.ai;
        if (!ai?.languageModel) {
          throw new Error("\u5F53\u524D Chrome \u4E0D\u652F\u6301 Gemini Nano\u3002\u8BF7\u5728\u6269\u5C55\u8BBE\u7F6E > AI \u52A9\u624B\u4E2D\u9009\u62E9 Gemini API\u3001OpenAI\u3001DeepSeek \u6216\u81EA\u5B9A\u4E49\u517C\u5BB9\u670D\u52A1\u3002");
        }
        const session = await ai.languageModel.create({
          temperature: 0.7,
          topK: 40,
          systemPrompt: config.systemPrompt
        });
        try {
          const prompt = messages.map((m) => {
            if (m.role === "system")
              return `[\u7CFB\u7EDF]: ${m.content}`;
            if (m.role === "user")
              return `[\u7528\u6237]: ${m.content}`;
            return `[AI]: ${m.content}`;
          }).join("\n\n") + "\n\n[AI]: ";
          const result = await session.prompt(prompt);
          return result;
        } finally {
          session.destroy();
        }
      }
      case "gemini-api": {
        if (!config.apiKey)
          throw new Error("Gemini API \u9700\u8981 API Key\u3002\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6E\u3002");
        const model = config.model || "gemini-2.0-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;
        const contents = messages.filter((m) => m.role !== "system").map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }));
        if (config.systemPrompt && contents.length > 0) {
          contents[0].parts[0].text = `[\u7CFB\u7EDF\u6307\u4EE4: ${config.systemPrompt}]

${contents[0].parts[0].text}`;
        }
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents })
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error?.message || `Gemini API HTTP ${res.status}`);
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "(\u7A7A\u54CD\u5E94)";
      }
      case "openai":
      case "deepseek":
      case "custom": {
        const baseUrl2 = config.baseUrl || (config.provider === "openai" ? "https://api.openai.com" : config.provider === "deepseek" ? "https://api.deepseek.com" : "");
        if (!baseUrl2)
          throw new Error("AI \u52A9\u624B\u5C1A\u672A\u914D\u7F6E\u3002\u8BF7\u5728\u6269\u5C55\u8BBE\u7F6E > AI \u52A9\u624B\u4E2D\u586B\u5199 Base URL \u548C\u6A21\u578B\uFF0C\u6216\u9009\u62E9 Gemini API\u3001OpenAI\u3001DeepSeek\u3002");
        if (!config.apiKey && config.provider !== "custom")
          throw new Error("\u8BF7\u914D\u7F6E API Key\u3002");
        const endpoint = `${baseUrl2.replace(/\/+$/, "")}/chat/completions`;
        const headers = { "Content-Type": "application/json" };
        if (config.apiKey)
          headers.Authorization = `Bearer ${config.apiKey}`;
        const payload = {
          model: config.model || (config.provider === "openai" ? "gpt-4o-mini" : config.provider === "deepseek" ? "deepseek-chat" : "gpt-3.5-turbo"),
          messages: [
            ...config.systemPrompt ? [{ role: "system", content: config.systemPrompt }] : [],
            ...messages.filter((m) => m.role !== "system")
          ],
          temperature: 0.7
        };
        const res = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error?.message || `API HTTP ${res.status}`);
        return data.choices?.[0]?.message?.content || "(\u7A7A\u54CD\u5E94)";
      }
      default:
        throw new Error(`\u672A\u77E5 Provider: ${config.provider}`);
    }
  }
  function renderMarkdown(text) {
    let html = escapeHtml(text);
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) => {
      return `<pre class="ai-code-block"><code>${escapeHtml(code.trim())}</code></pre>`;
    });
    html = html.replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    html = html.replace(/\n/g, "<br>");
    return html;
  }
  function addUserMessage(text) {
    const el = document.getElementById("ai-messages");
    if (!el)
      return;
    const empty = el.querySelector(".ai-empty");
    if (empty)
      empty.remove();
    const msg = document.createElement("div");
    msg.className = "ai-msg ai-msg-user";
    msg.textContent = text;
    el.appendChild(msg);
    el.scrollTop = el.scrollHeight;
  }
  function addAiMessage(text) {
    const el = document.getElementById("ai-messages");
    if (!el)
      return;
    const msg = document.createElement("div");
    msg.className = "ai-msg ai-msg-ai";
    msg.innerHTML = renderMarkdown(text);
    el.appendChild(msg);
    el.scrollTop = el.scrollHeight;
  }
  function addAiError(text) {
    const el = document.getElementById("ai-messages");
    if (!el)
      return;
    const msg = document.createElement("div");
    msg.className = "ai-msg ai-msg-error";
    msg.textContent = text;
    el.appendChild(msg);
    el.scrollTop = el.scrollHeight;
  }
  function addScreenshotMessage(dataUrl, label) {
    const el = document.getElementById("ai-messages");
    if (!el)
      return;
    const empty = el.querySelector(".ai-empty");
    if (empty)
      empty.remove();
    const msg = document.createElement("div");
    msg.className = "ai-msg ai-msg-user ai-screenshot-msg";
    const caption = document.createElement("div");
    caption.textContent = `${label}\uFF1A\u5DF2\u6355\u83B7\u5F53\u524D\u9875\u9762\u622A\u56FE`;
    const image = document.createElement("img");
    image.src = dataUrl;
    image.alt = "\u5F53\u524D\u9875\u9762\u622A\u56FE";
    image.className = "ai-screenshot";
    msg.append(caption, image);
    el.appendChild(msg);
    el.scrollTop = el.scrollHeight;
  }
  function renderAttachmentChips() {
    const target = document.getElementById("ai-attachments");
    if (!target)
      return;
    target.innerHTML = aiAttachments.map((file) => `<span class="ai-attachment" title="${escapeAttr(file.name)}">${escapeHtml(file.name)}</span>`).join("");
  }
  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error(`\u8BFB\u53D6\u9644\u4EF6\u5931\u8D25\uFF1A${file.name}`));
      reader.readAsDataURL(file);
    });
  }
  async function captureDisplayFrame() {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error("\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u5C4F\u5E55\u9009\u62E9\u622A\u56FE\u3002");
    }
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    try {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      await video.play();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const track = stream.getVideoTracks()[0];
      const settings = track?.getSettings();
      const width = settings?.width || video.videoWidth || 1280;
      const height = settings?.height || video.videoHeight || 720;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx)
        throw new Error("\u65E0\u6CD5\u521B\u5EFA\u622A\u56FE\u753B\u5E03\u3002");
      ctx.drawImage(video, 0, 0, width, height);
      return { name: "screen-shot.png", dataUrl: canvas.toDataURL("image/png") };
    } finally {
      stream.getTracks().forEach((track) => track.stop());
    }
  }
  function addAiLoading() {
    const el = document.getElementById("ai-messages");
    const msg = document.createElement("div");
    msg.className = "ai-msg ai-msg-ai ai-msg-loading";
    msg.innerHTML = '<span class="ai-dot"></span><span class="ai-dot"></span><span class="ai-dot"></span>';
    el.appendChild(msg);
    el.scrollTop = el.scrollHeight;
    return msg;
  }
  async function sendAiMessage(prompt, attachmentsOverride, options = {}) {
    const sendBtn = document.getElementById("ai-send");
    const attachmentsForSend = attachmentsOverride ?? aiAttachments;
    const attachmentSuffix = attachmentsForSend.length > 0 ? `
[\u5DF2\u9644\u52A0 ${attachmentsForSend.length} \u5F20\u56FE\u7247]` : "";
    if (!options.skipUserBubble)
      addUserMessage(`${prompt}${attachmentSuffix}`);
    if (sendBtn)
      sendBtn.disabled = true;
    const loadingEl = addAiLoading();
    aiMessages.push({ role: "user", content: `${prompt}${attachmentSuffix}` });
    if (!attachmentsOverride) {
      aiAttachments = [];
      renderAttachmentChips();
    }
    try {
      const fullMessages = [
        { role: "system", content: aiConfig.systemPrompt },
        ...aiMessages
      ];
      const result = await chatWithAI(aiConfig, fullMessages, attachmentsForSend);
      loadingEl.remove();
      addAiMessage(result);
      aiMessages.push({ role: "assistant", content: result });
    } catch (e) {
      loadingEl.remove();
      const errMsg = `\u274C ${e instanceof Error ? e.message : String(e)}`;
      addAiError(errMsg);
    } finally {
      if (sendBtn)
        sendBtn.disabled = false;
    }
  }
  function setupAiChat() {
    const sendBtn = document.getElementById("ai-send");
    const inputEl = document.getElementById("ai-input");
    const clearBtn = document.getElementById("ai-clear");
    const fileInput = document.getElementById("ai-file");
    if (!sendBtn || !inputEl)
      return;
    sendBtn.addEventListener("click", () => {
      const text = inputEl.value.trim();
      if (!text)
        return;
      inputEl.value = "";
      sendAiMessage(text);
    });
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        aiMessages = [];
        const el = document.getElementById("ai-messages");
        if (el) {
          el.innerHTML = '<div class="ai-empty">\u5728\u4E0B\u65B9\u8F93\u5165\u95EE\u9898\uFF0CAI \u52A9\u624B\u5C06\u4E3A\u4F60\u89E3\u7B54</div>';
        }
      });
    }
    fileInput?.addEventListener("change", async () => {
      const files = Array.from(fileInput.files ?? []);
      const invalidFile = files.find((file) => !file.type.startsWith("image/"));
      if (invalidFile) {
        addAiError(`Gemini Web \u76EE\u524D\u53EA\u652F\u6301\u56FE\u7247\u9644\u4EF6\uFF1A${invalidFile.name}`);
        fileInput.value = "";
        return;
      }
      aiAttachments = await Promise.all(files.map(async (file) => ({ name: file.name, dataUrl: await readFileAsDataUrl(file) })));
      renderAttachmentChips();
    });
    document.querySelectorAll("[data-ai-tool]").forEach((button) => button.addEventListener("click", async () => {
      const action = button.dataset.aiTool || "ai-chat";
      const instruction = inputEl.value.trim();
      if (action === "screen-shot") {
        try {
          const attachment = await captureDisplayFrame();
          addScreenshotMessage(attachment.dataUrl, "\u5C4F\u5E55\u622A\u56FE");
          const prompt = instruction || "\u8BF7\u5206\u6790\u8FD9\u5F20\u5C4F\u5E55\u622A\u56FE\uFF0C\u63D0\u53D6\u5173\u952E\u4FE1\u606F\uFF0C\u5E76\u6574\u7406\u6210\u9002\u5408 Obsidian \u7684\u4E2D\u6587\u7B14\u8BB0\u3002";
          await sendAiMessage(prompt, [attachment], { skipUserBubble: true });
        } catch (error) {
          addAiError(`\u5C4F\u5E55\u622A\u56FE\u5931\u8D25\uFF1A${error instanceof Error ? error.message : String(error)}`);
        }
        return;
      }
      chrome.runtime.sendMessage({ type: "ai-tool", payload: { action, text: instruction } });
    }));
  }
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "ai-prompt") {
      switchTab("ai");
      setTimeout(() => {
        const actionLabels = {
          translate: "\u7FFB\u8BD1",
          summarize: "\u603B\u7ED3",
          explain: "\u89E3\u91CA",
          grammar: "\u8BED\u6CD5\u4FEE\u6B63",
          "ai-chat": "AI \u5BF9\u8BDD",
          "browser-control": "\u6D4F\u89C8\u5668\u63A7\u5236",
          page: "\u7F51\u9875",
          quote: "\u5F15\u7528",
          ocr: "OCR",
          "screenshot-translate": "\u622A\u56FE\u7FFB\u8BD1",
          "screen-shot": "\u5C4F\u5E55\u622A\u56FE"
        };
        const label = actionLabels[message.payload.action] || "AI";
        const rawText = String(message.payload.text || message.payload.selection || "");
        let userText = rawText.slice(0, 500);
        const attachments = message.payload.imageDataUrl ? [{ name: `${message.payload.action || "screenshot"}.png`, dataUrl: message.payload.imageDataUrl }] : [];
        if (message.payload.imageDataUrl) {
          addScreenshotMessage(message.payload.imageDataUrl, label);
        }
        if (message.payload.captureError) {
          addAiError(`\u622A\u56FE\u5931\u8D25\uFF1A${message.payload.captureError}`);
        }
        const actionPrompts = {
          translate: `\u8BF7\u5C06\u4EE5\u4E0B\u5185\u5BB9\u7FFB\u8BD1\u6210\u4E2D\u6587\uFF0C\u53EA\u8F93\u51FA\u7FFB\u8BD1\u7ED3\u679C\uFF1A

${message.payload.text}`,
          summarize: `\u8BF7\u7528\u7B80\u6D01\u7684\u8981\u70B9\u5F0F\u4E2D\u6587\u603B\u7ED3\u4EE5\u4E0B\u5185\u5BB9\uFF1A

${message.payload.text}`,
          explain: `\u8BF7\u7528\u901A\u4FD7\u6613\u61C2\u7684\u4E2D\u6587\u89E3\u91CA\u4EE5\u4E0B\u5185\u5BB9\uFF0C\u9002\u5408\u521D\u5B66\u8005\u7406\u89E3\uFF1A

${message.payload.text}`,
          grammar: `\u8BF7\u4FEE\u6B63\u4EE5\u4E0B\u6587\u672C\u7684\u8BED\u6CD5\u9519\u8BEF\uFF0C\u7528\u4E2D\u6587\u7B80\u8981\u8BF4\u660E\u4FEE\u6539\u4E86\u4EC0\u4E48\uFF1A

${message.payload.text}`,
          "browser-control": `\u4F60\u662F\u6D4F\u89C8\u5668\u63A7\u5236\u52A9\u624B\u3002\u8BF7\u6839\u636E\u5F53\u524D\u7F51\u9875\u5FEB\u7167\u7ED9\u51FA\u4E0B\u4E00\u6B65\u64CD\u4F5C\u5EFA\u8BAE\u3002\u4E0D\u8981\u865A\u6784\u5DF2\u6267\u884C\u52A8\u4F5C\uFF1B\u5982\u679C\u9700\u8981\u70B9\u51FB\u6216\u8F93\u5165\uFF0C\u8BF7\u7ED9\u51FA\u660E\u786E\u7684\u76EE\u6807\u5143\u7D20\u548C\u6587\u672C\u3002

\u7528\u6237\u610F\u56FE\uFF1A${message.payload.userInstruction || "\u672A\u586B\u5199"}
\u6807\u9898\uFF1A${message.payload.title}
URL\uFF1A${message.payload.url}
\u9009\u4E2D\u6587\u672C\uFF1A${message.payload.selection || "\u65E0"}
\u53EF\u4EA4\u4E92\u5143\u7D20\uFF1A
${JSON.stringify(message.payload.debugTarget || message.payload.elements || [], null, 2)}`,
          page: `\u8BF7\u5206\u6790\u5F53\u524D\u7F51\u9875\uFF0C\u63D0\u53D6\u4E3B\u9898\u3001\u5173\u952E\u4FE1\u606F\u3001\u9002\u5408\u526A\u85CF\u5230 Obsidian \u7684\u6458\u8981\u548C\u6807\u7B7E\u5EFA\u8BAE\u3002

\u7528\u6237\u610F\u56FE\uFF1A${message.payload.userInstruction || "\u672A\u586B\u5199"}
\u6807\u9898\uFF1A${message.payload.title}
URL\uFF1A${message.payload.url}

\u7F51\u9875\u6B63\u6587\uFF1A
${rawText}`,
          quote: `\u8BF7\u628A\u4E0B\u9762\u5185\u5BB9\u6574\u7406\u6210\u9002\u5408\u5F15\u7528\u5230 Obsidian \u7684\u683C\u5F0F\uFF1A\u4FDD\u7559\u539F\u610F\uFF0C\u7ED9\u51FA\u4E00\u53E5\u6458\u8981\u3001\u5F15\u7528\u6B63\u6587\u548C\u53EF\u9009\u6807\u7B7E\u3002

\u6765\u6E90\uFF1A${message.payload.url}

${message.payload.text || userText || "\u672A\u9009\u4E2D\u6587\u672C"}`,
          ocr: message.payload.imageDataUrl ? `\u8BF7\u5BF9\u8FD9\u5F20\u622A\u56FE\u505A OCR\uFF1A\u8BC6\u522B\u6240\u6709\u53EF\u89C1\u6587\u5B57\uFF0C\u5C3D\u91CF\u4FDD\u6301\u539F\u6709\u5C42\u7EA7\u548C\u8868\u683C\u7ED3\u6784\uFF0C\u5E76\u8F93\u51FA\u53EF\u590D\u5236\u7684 Markdown\u3002` : `OCR \u529F\u80FD\u9700\u8981\u8BFB\u53D6\u622A\u56FE\u6216\u56FE\u7247\u3002\u5F53\u524D\u8FD8\u6CA1\u6709\u6536\u5230\u56FE\u7247\uFF0C\u8BF7\u63D0\u793A\u6211\u5148\u6267\u884C\u5C4F\u5E55\u622A\u56FE\u6216\u4E0A\u4F20\u56FE\u7247\uFF0C\u5E76\u8BF4\u660E\u4F60\u53EF\u4EE5\u5E2E\u6211\u8BC6\u522B\u6587\u5B57\u3001\u6574\u7406\u7ED3\u6784\u3001\u751F\u6210\u53EF\u590D\u5236\u6587\u672C\u3002`,
          "screenshot-translate": message.payload.imageDataUrl ? `\u8BF7\u8BC6\u522B\u8FD9\u5F20\u622A\u56FE\u4E2D\u7684\u6587\u5B57\uFF0C\u5E76\u7FFB\u8BD1\u6210\u81EA\u7136\u4E2D\u6587\u3002\u8F93\u51FA\u683C\u5F0F\uFF1A\u5148\u7ED9\u8BD1\u6587\uFF0C\u518D\u5217\u51FA\u539F\u6587\u4E2D\u4E0D\u786E\u5B9A\u7684\u90E8\u5206\u3002` : `\u622A\u56FE\u7FFB\u8BD1\u529F\u80FD\u9700\u8981\u622A\u56FE\u56FE\u50CF\u3002\u5F53\u524D\u8FD8\u6CA1\u6709\u6536\u5230\u56FE\u7247\uFF0C\u8BF7\u63D0\u793A\u6211\u5148\u6267\u884C\u5C4F\u5E55\u622A\u56FE\u6216\u4E0A\u4F20\u56FE\u7247\uFF0C\u5E76\u8BF4\u660E\u4F60\u53EF\u4EE5\u5E2E\u6211\u8BC6\u522B\u622A\u56FE\u6587\u5B57\u540E\u7FFB\u8BD1\u3002`,
          "screen-shot": `\u8BF7\u5206\u6790\u8FD9\u5F20\u5C4F\u5E55\u622A\u56FE\uFF0C\u63D0\u53D6\u5173\u952E\u4FE1\u606F\u3001\u53EF\u89C1\u6587\u5B57\u548C\u4E0B\u4E00\u6B65\u5EFA\u8BAE\u3002

\u6807\u9898\uFF1A${message.payload.title}
URL\uFF1A${message.payload.url}`,
          "ai-chat": message.payload.text
        };
        const prompt = actionPrompts[message.payload.action] || message.payload.text;
        if (!message.payload.imageDataUrl)
          addUserMessage(`${label}\uFF1A${userText || message.payload.title || ""}`);
        sendAiMessage(prompt, attachments, { skipUserBubble: true });
      }, 200);
    }
    if (message.type === "clip-data") {
      if (message.payload?.triggerSync) {
        switchTab("sync");
        loadPanel();
      } else {
        handleClipData(message.payload ?? {});
      }
    }
  });
  init();
  async function handleClipData(payload) {
    const title = typeof payload.title === "string" && payload.title.trim() ? payload.title.trim() : "\u7F51\u9875\u526A\u85CF";
    const url = typeof payload.url === "string" ? payload.url.trim() : "";
    const text = typeof payload.text === "string" ? payload.text.trim() : "";
    const description = typeof payload.description === "string" ? payload.description.trim() : "";
    const snapshot = {
      title,
      url,
      description,
      selection: text,
      headings: [],
      tables: [],
      text,
      sourceKind: detectSourceKind(url, Boolean(text), text)
    };
    await openWebClipPanel(snapshot, {
      sceneId: typeof payload.sceneId === "string" ? payload.sceneId : "",
      sceneLabel: typeof payload.sceneLabel === "string" ? payload.sceneLabel : "",
      sceneAction: typeof payload.sceneAction === "string" ? payload.sceneAction : "",
      scenePrompt: typeof payload.prompt === "string" ? payload.prompt : "",
      defaultAppendPath: typeof payload.appendPath === "string" ? payload.appendPath : "",
      defaultDir: typeof payload.defaultDir === "string" ? payload.defaultDir : "",
      aiEnabled: payload.aiEnabled === true
    });
    const label = typeof payload.sceneLabel === "string" && payload.sceneLabel ? payload.sceneLabel : "\u5212\u8BCD/\u53F3\u952E";
    setStatus(`\u5DF2\u8BFB\u53D6${label}\u5185\u5BB9\u3002\u53EF\u76F4\u63A5\u4FDD\u5B58\uFF0C\u4E5F\u53EF\u52FE\u9009\u201C\u8865\u5145\u5230\u5DF2\u6709\u6587\u6863\u201D\u3002`, "info");
  }
  async function openWebClipPanel(snapshot, scene = {}) {
    switchTab("sync");
    renderLoading();
    const [config, template, options, interpreter] = await Promise.all([
      loadConfig(),
      loadPropertyTemplate(),
      loadPropertyOptions(),
      loadInterpreterConfig()
    ]);
    const recentDir = await loadRecentTargetDir();
    const next = {
      config,
      template,
      options,
      interpreter,
      mode: "web-clip",
      sourceKind: snapshot.sourceKind,
      tokenInfo: {},
      nodeToken: "",
      title: cleanTitle(snapshot.title || "\u7F51\u9875\u526A\u85CF"),
      source: snapshot.url,
      dirs: [],
      fallbackDir: recentDir,
      pageSnapshot: snapshot,
      sceneId: scene.sceneId || "",
      sceneLabel: scene.sceneLabel || "",
      sceneAction: scene.sceneAction || "",
      scenePrompt: scene.scenePrompt || "",
      defaultAppendPath: scene.defaultAppendPath || "",
      defaultDir: scene.defaultDir || "",
      aiEnabled: scene.aiEnabled === true
    };
    state = next;
    try {
      const tree = config.token ? await getTree(config) : { dirs: [] };
      next.dirs = tree.dirs;
      next.fallbackDir = resolveTargetDir(next.dirs, next.defaultDir || recentDir);
    } catch (err) {
      next.treeError = err instanceof Error ? err.message : String(err);
    }
    renderPanel(next);
    applySceneControls(next);
    $("sync-btn").toggleAttribute("disabled", !next.config.token);
    $("suggest-btn").toggleAttribute("disabled", !next.interpreter.enabled);
  }
  function applySceneControls(next) {
    const appendCheckbox = document.querySelector('[name="append-mode"]');
    const appendInput = document.querySelector('[name="append-path"]');
    const dirInput = document.querySelector('[name="target-dir"]');
    if (next.defaultDir && dirInput)
      dirInput.value = next.defaultDir;
    if (!appendCheckbox || !appendInput)
      return;
    const shouldAppend = next.sceneAction === "append";
    if (!shouldAppend)
      return;
    appendCheckbox.checked = true;
    appendInput.disabled = false;
    appendInput.value = next.defaultAppendPath || appendInput.value;
    if (appendInput.value) {
      setStatus(`\u8865\u5145\u6A21\u5F0F\uFF1A\u5C06\u8FFD\u52A0\u5230 ${appendInput.value}`, "info");
    } else {
      appendInput.focus();
      setStatus("\u8BF7\u5148\u8BBE\u7F6E\u9ED8\u8BA4\u8865\u5145\u6587\u6863\uFF0C\u6216\u5728\u8FD9\u91CC\u586B\u5199\u8981\u8865\u5145\u7684 .md \u6587\u4EF6\u8DEF\u5F84\u3002", "error");
    }
  }
})();
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.2.0 https://github.com/nodeca/js-yaml @license MIT *)
*/
//# sourceMappingURL=sidepanel.js.map
