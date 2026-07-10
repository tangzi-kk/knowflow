"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
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

  // ../packages/shared/dist/types.js
  var init_types = __esm({
    "../packages/shared/dist/types.js"() {
      "use strict";
    }
  });

  // ../packages/shared/dist/protocol.js
  var DEFAULT_PORT, TOKEN_HEADER, OBSIDIAN_LARK_DOC_ACTION, OBSIDIAN_LARK_DOC_URI_PREFIX;
  var init_protocol = __esm({
    "../packages/shared/dist/protocol.js"() {
      "use strict";
      DEFAULT_PORT = 4567;
      TOKEN_HEADER = "X-Sync-Token";
      OBSIDIAN_LARK_DOC_ACTION = "lark-doc";
      OBSIDIAN_LARK_DOC_URI_PREFIX = `obsidian://${OBSIDIAN_LARK_DOC_ACTION}`;
    }
  });

  // ../packages/shared/dist/hash.js
  var init_hash = __esm({
    "../packages/shared/dist/hash.js"() {
      "use strict";
    }
  });

  // ../packages/shared/dist/filename.js
  var init_filename = __esm({
    "../packages/shared/dist/filename.js"() {
      "use strict";
    }
  });

  // ../packages/shared/dist/image.js
  var init_image = __esm({
    "../packages/shared/dist/image.js"() {
      "use strict";
    }
  });

  // ../node_modules/js-yaml/dist/js-yaml.mjs
  var __create2, __defProp2, __getOwnPropDesc2, __getOwnPropNames2, __getProtoOf2, __hasOwnProp2, __commonJSMin, __copyProps2, __toESM2, require_common, require_exception, require_snippet, require_type, require_schema, require_str, require_seq, require_map, require_failsafe, require_null, require_bool, require_int, require_float, require_json, require_core, require_timestamp, require_merge, require_binary, require_omap, require_pairs, require_set, require_default, require_loader, require_dumper, import_js_yaml, Type, Schema, FAILSAFE_SCHEMA, JSON_SCHEMA, CORE_SCHEMA, DEFAULT_SCHEMA, load, loadAll, dump, YAMLException, types, safeLoad, safeLoadAll, safeDump, index_vite_proxy_tmp_default;
  var init_js_yaml = __esm({
    "../node_modules/js-yaml/dist/js-yaml.mjs"() {
      __create2 = Object.create;
      __defProp2 = Object.defineProperty;
      __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
      __getOwnPropNames2 = Object.getOwnPropertyNames;
      __getProtoOf2 = Object.getPrototypeOf;
      __hasOwnProp2 = Object.prototype.hasOwnProperty;
      __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
      __copyProps2 = (to, from, except, desc) => {
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
      __toESM2 = (mod, isNodeMode, target) => (target = mod != null ? __create2(__getProtoOf2(mod)) : {}, __copyProps2(isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", {
        value: mod,
        enumerable: true
      }) : target, mod));
      require_common = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
      require_exception = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
      require_snippet = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
      require_type = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
      require_schema = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
      require_str = /* @__PURE__ */ __commonJSMin((exports, module) => {
        module.exports = new (require_type())("tag:yaml.org,2002:str", {
          kind: "scalar",
          construct: function(data) {
            return data !== null ? data : "";
          }
        });
      });
      require_seq = /* @__PURE__ */ __commonJSMin((exports, module) => {
        module.exports = new (require_type())("tag:yaml.org,2002:seq", {
          kind: "sequence",
          construct: function(data) {
            return data !== null ? data : [];
          }
        });
      });
      require_map = /* @__PURE__ */ __commonJSMin((exports, module) => {
        module.exports = new (require_type())("tag:yaml.org,2002:map", {
          kind: "mapping",
          construct: function(data) {
            return data !== null ? data : {};
          }
        });
      });
      require_failsafe = /* @__PURE__ */ __commonJSMin((exports, module) => {
        module.exports = new (require_schema())({ explicit: [
          require_str(),
          require_seq(),
          require_map()
        ] });
      });
      require_null = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
      require_bool = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
      require_int = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
      require_float = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
      require_json = /* @__PURE__ */ __commonJSMin((exports, module) => {
        module.exports = require_failsafe().extend({ implicit: [
          require_null(),
          require_bool(),
          require_int(),
          require_float()
        ] });
      });
      require_core = /* @__PURE__ */ __commonJSMin((exports, module) => {
        module.exports = require_json();
      });
      require_timestamp = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
      require_merge = /* @__PURE__ */ __commonJSMin((exports, module) => {
        var Type2 = require_type();
        function resolveYamlMerge(data) {
          return data === "<<" || data === null;
        }
        module.exports = new Type2("tag:yaml.org,2002:merge", {
          kind: "scalar",
          resolve: resolveYamlMerge
        });
      });
      require_binary = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
      require_omap = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
      require_pairs = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
      require_set = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
      require_default = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
      require_loader = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
      require_dumper = /* @__PURE__ */ __commonJSMin((exports, module) => {
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
      import_js_yaml = /* @__PURE__ */ __toESM2((/* @__PURE__ */ __commonJSMin((exports, module) => {
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
      ({ Type, Schema, FAILSAFE_SCHEMA, JSON_SCHEMA, CORE_SCHEMA, DEFAULT_SCHEMA, load, loadAll, dump, YAMLException, types, safeLoad, safeLoadAll, safeDump } = import_js_yaml.default);
      index_vite_proxy_tmp_default = import_js_yaml.default;
    }
  });

  // ../packages/shared/dist/yaml.js
  var init_yaml = __esm({
    "../packages/shared/dist/yaml.js"() {
      "use strict";
      init_js_yaml();
    }
  });

  // ../packages/shared/dist/callout.js
  var init_callout = __esm({
    "../packages/shared/dist/callout.js"() {
      "use strict";
      init_types();
    }
  });

  // ../packages/shared/dist/larkEnvelope.js
  var init_larkEnvelope = __esm({
    "../packages/shared/dist/larkEnvelope.js"() {
      "use strict";
    }
  });

  // ../packages/shared/dist/index.js
  var init_dist = __esm({
    "../packages/shared/dist/index.js"() {
      "use strict";
      init_types();
      init_protocol();
      init_hash();
      init_filename();
      init_image();
      init_yaml();
      init_callout();
      init_larkEnvelope();
    }
  });

  // src/client.ts
  var client_exports = {};
  __export(client_exports, {
    DEFAULT_CONFIG: () => DEFAULT_CONFIG,
    DEFAULT_INTERPRETER_CONFIG: () => DEFAULT_INTERPRETER_CONFIG,
    DEFAULT_PROPERTY_OPTIONS: () => DEFAULT_PROPERTY_OPTIONS,
    DEFAULT_PROPERTY_TEMPLATE: () => DEFAULT_PROPERTY_TEMPLATE,
    getStatus: () => getStatus,
    getTree: () => getTree,
    loadConfig: () => loadConfig,
    loadInterpreterConfig: () => loadInterpreterConfig,
    loadPropertyOptions: () => loadPropertyOptions,
    loadPropertyTemplate: () => loadPropertyTemplate,
    normalizePropertyOptionValue: () => normalizePropertyOptionValue,
    postClip: () => postClip,
    postExists: () => postExists,
    postFetch: () => postFetch,
    saveConfig: () => saveConfig,
    saveInterpreterConfig: () => saveInterpreterConfig,
    savePropertyOptions: () => savePropertyOptions,
    savePropertyTemplate: () => savePropertyTemplate,
    suggestMetaWithInterpreter: () => suggestMetaWithInterpreter,
    testConnection: () => testConnection
  });
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
  async function savePropertyTemplate(template) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ propertyTemplate: template }, () => resolve());
    });
  }
  async function savePropertyOptions(options) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ propertyOptions: options }, () => resolve());
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
  async function saveInterpreterConfig(config) {
    const { apiKey, ...syncConfig } = config;
    return new Promise((resolve) => {
      chrome.storage.sync.set({ interpreterConfig: syncConfig }, () => {
        chrome.storage.local.set({ interpreterApiKey: apiKey }, () => resolve());
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
  async function saveConfig(config) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ syncConfig: config }, () => resolve());
    });
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
  var DEFAULT_CONFIG, DEFAULT_PROPERTY_TEMPLATE, DEFAULT_PROPERTY_OPTIONS, DEFAULT_INTERPRETER_CONFIG;
  var init_client = __esm({
    "src/client.ts"() {
      "use strict";
      init_dist();
      DEFAULT_CONFIG = {
        host: "127.0.0.1",
        port: DEFAULT_PORT,
        token: ""
      };
      DEFAULT_PROPERTY_TEMPLATE = {
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
      DEFAULT_PROPERTY_OPTIONS = {
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
      DEFAULT_INTERPRETER_CONFIG = {
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
    }
  });

  // ../node_modules/js-sha3/src/sha3.js
  var require_sha3 = __commonJS({
    "../node_modules/js-sha3/src/sha3.js"(exports, module) {
      (function() {
        "use strict";
        var INPUT_ERROR = "input is invalid type";
        var FINALIZE_ERROR = "finalize already called";
        var WINDOW = typeof window === "object";
        var root = WINDOW ? window : {};
        if (root.JS_SHA3_NO_WINDOW) {
          WINDOW = false;
        }
        var WEB_WORKER = !WINDOW && typeof self === "object";
        var NODE_JS = !root.JS_SHA3_NO_NODE_JS && typeof process === "object" && process.versions && process.versions.node;
        if (NODE_JS) {
          root = global;
        } else if (WEB_WORKER) {
          root = self;
        }
        var COMMON_JS = !root.JS_SHA3_NO_COMMON_JS && typeof module === "object" && module.exports;
        var AMD = typeof define === "function" && define.amd;
        var ARRAY_BUFFER = !root.JS_SHA3_NO_ARRAY_BUFFER && typeof ArrayBuffer !== "undefined";
        var HEX_CHARS = "0123456789abcdef".split("");
        var SHAKE_PADDING = [31, 7936, 2031616, 520093696];
        var CSHAKE_PADDING = [4, 1024, 262144, 67108864];
        var KECCAK_PADDING = [1, 256, 65536, 16777216];
        var PADDING = [6, 1536, 393216, 100663296];
        var SHIFT = [0, 8, 16, 24];
        var RC = [
          1,
          0,
          32898,
          0,
          32906,
          2147483648,
          2147516416,
          2147483648,
          32907,
          0,
          2147483649,
          0,
          2147516545,
          2147483648,
          32777,
          2147483648,
          138,
          0,
          136,
          0,
          2147516425,
          0,
          2147483658,
          0,
          2147516555,
          0,
          139,
          2147483648,
          32905,
          2147483648,
          32771,
          2147483648,
          32770,
          2147483648,
          128,
          2147483648,
          32778,
          0,
          2147483658,
          2147483648,
          2147516545,
          2147483648,
          32896,
          2147483648,
          2147483649,
          0,
          2147516424,
          2147483648
        ];
        var BITS = [224, 256, 384, 512];
        var SHAKE_BITS = [128, 256];
        var OUTPUT_TYPES = ["hex", "buffer", "arrayBuffer", "array", "digest"];
        var CSHAKE_BYTEPAD = {
          "128": 168,
          "256": 136
        };
        var isArray = root.JS_SHA3_NO_NODE_JS || !Array.isArray ? function(obj) {
          return Object.prototype.toString.call(obj) === "[object Array]";
        } : Array.isArray;
        var isView = ARRAY_BUFFER && (root.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView) ? function(obj) {
          return typeof obj === "object" && obj.buffer && obj.buffer.constructor === ArrayBuffer;
        } : ArrayBuffer.isView;
        var formatMessage = function(message) {
          var type = typeof message;
          if (type === "string") {
            return [message, true];
          }
          if (type !== "object" || message === null) {
            throw new Error(INPUT_ERROR);
          }
          if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
            return [new Uint8Array(message), false];
          }
          if (!isArray(message) && !isView(message)) {
            throw new Error(INPUT_ERROR);
          }
          return [message, false];
        };
        var empty = function(message) {
          return formatMessage(message)[0].length === 0;
        };
        var cloneArray = function(array) {
          var newArray = [];
          for (var i2 = 0; i2 < array.length; ++i2) {
            newArray[i2] = array[i2];
          }
          return newArray;
        };
        var createOutputMethod = function(bits2, padding, outputType) {
          return function(message) {
            return new Keccak(bits2, padding, bits2).update(message)[outputType]();
          };
        };
        var createShakeOutputMethod = function(bits2, padding, outputType) {
          return function(message, outputBits) {
            return new Keccak(bits2, padding, outputBits).update(message)[outputType]();
          };
        };
        var createCshakeOutputMethod = function(bits2, padding, outputType) {
          return function(message, outputBits, n, s) {
            return methods["cshake" + bits2].update(message, outputBits, n, s)[outputType]();
          };
        };
        var createKmacOutputMethod = function(bits2, padding, outputType) {
          return function(key, message, outputBits, s) {
            return methods["kmac" + bits2].update(key, message, outputBits, s)[outputType]();
          };
        };
        var createOutputMethods = function(method, createMethod2, bits2, padding) {
          for (var i2 = 0; i2 < OUTPUT_TYPES.length; ++i2) {
            var type = OUTPUT_TYPES[i2];
            method[type] = createMethod2(bits2, padding, type);
          }
          return method;
        };
        var createMethod = function(bits2, padding) {
          var method = createOutputMethod(bits2, padding, "hex");
          method.create = function() {
            return new Keccak(bits2, padding, bits2);
          };
          method.update = function(message) {
            return method.create().update(message);
          };
          return createOutputMethods(method, createOutputMethod, bits2, padding);
        };
        var createShakeMethod = function(bits2, padding) {
          var method = createShakeOutputMethod(bits2, padding, "hex");
          method.create = function(outputBits) {
            return new Keccak(bits2, padding, outputBits);
          };
          method.update = function(message, outputBits) {
            return method.create(outputBits).update(message);
          };
          return createOutputMethods(method, createShakeOutputMethod, bits2, padding);
        };
        var createCshakeMethod = function(bits2, padding) {
          var w = CSHAKE_BYTEPAD[bits2];
          var method = createCshakeOutputMethod(bits2, padding, "hex");
          method.create = function(outputBits, n, s) {
            if (empty(n) && empty(s)) {
              return methods["shake" + bits2].create(outputBits);
            } else {
              return new Keccak(bits2, padding, outputBits).bytepad([n, s], w);
            }
          };
          method.update = function(message, outputBits, n, s) {
            return method.create(outputBits, n, s).update(message);
          };
          return createOutputMethods(method, createCshakeOutputMethod, bits2, padding);
        };
        var createKmacMethod = function(bits2, padding) {
          var w = CSHAKE_BYTEPAD[bits2];
          var method = createKmacOutputMethod(bits2, padding, "hex");
          method.create = function(key, outputBits, s) {
            return new Kmac(bits2, padding, outputBits).bytepad(["KMAC", s], w).bytepad([key], w);
          };
          method.update = function(key, message, outputBits, s) {
            return method.create(key, outputBits, s).update(message);
          };
          return createOutputMethods(method, createKmacOutputMethod, bits2, padding);
        };
        var algorithms = [
          { name: "keccak", padding: KECCAK_PADDING, bits: BITS, createMethod },
          { name: "sha3", padding: PADDING, bits: BITS, createMethod },
          { name: "shake", padding: SHAKE_PADDING, bits: SHAKE_BITS, createMethod: createShakeMethod },
          { name: "cshake", padding: CSHAKE_PADDING, bits: SHAKE_BITS, createMethod: createCshakeMethod },
          { name: "kmac", padding: CSHAKE_PADDING, bits: SHAKE_BITS, createMethod: createKmacMethod }
        ];
        var methods = {}, methodNames = [];
        for (var i = 0; i < algorithms.length; ++i) {
          var algorithm = algorithms[i];
          var bits = algorithm.bits;
          for (var j = 0; j < bits.length; ++j) {
            var methodName = algorithm.name + "_" + bits[j];
            methodNames.push(methodName);
            methods[methodName] = algorithm.createMethod(bits[j], algorithm.padding);
            if (algorithm.name !== "sha3") {
              var newMethodName = algorithm.name + bits[j];
              methodNames.push(newMethodName);
              methods[newMethodName] = methods[methodName];
            }
          }
        }
        function Keccak(bits2, padding, outputBits) {
          this.blocks = [];
          this.s = [];
          this.padding = padding;
          this.outputBits = outputBits;
          this.reset = true;
          this.finalized = false;
          this.block = 0;
          this.start = 0;
          this.blockCount = 1600 - (bits2 << 1) >> 5;
          this.byteCount = this.blockCount << 2;
          this.outputBlocks = outputBits >> 5;
          this.extraBytes = (outputBits & 31) >> 3;
          for (var i2 = 0; i2 < 50; ++i2) {
            this.s[i2] = 0;
          }
        }
        Keccak.prototype.update = function(message) {
          if (this.finalized) {
            throw new Error(FINALIZE_ERROR);
          }
          var result = formatMessage(message);
          message = result[0];
          var isString = result[1];
          var blocks = this.blocks, byteCount = this.byteCount, length = message.length, blockCount = this.blockCount, index = 0, s = this.s, i2, code;
          while (index < length) {
            if (this.reset) {
              this.reset = false;
              blocks[0] = this.block;
              for (i2 = 1; i2 < blockCount + 1; ++i2) {
                blocks[i2] = 0;
              }
            }
            if (isString) {
              for (i2 = this.start; index < length && i2 < byteCount; ++index) {
                code = message.charCodeAt(index);
                if (code < 128) {
                  blocks[i2 >> 2] |= code << SHIFT[i2++ & 3];
                } else if (code < 2048) {
                  blocks[i2 >> 2] |= (192 | code >> 6) << SHIFT[i2++ & 3];
                  blocks[i2 >> 2] |= (128 | code & 63) << SHIFT[i2++ & 3];
                } else if (code < 55296 || code >= 57344) {
                  blocks[i2 >> 2] |= (224 | code >> 12) << SHIFT[i2++ & 3];
                  blocks[i2 >> 2] |= (128 | code >> 6 & 63) << SHIFT[i2++ & 3];
                  blocks[i2 >> 2] |= (128 | code & 63) << SHIFT[i2++ & 3];
                } else {
                  code = 65536 + ((code & 1023) << 10 | message.charCodeAt(++index) & 1023);
                  blocks[i2 >> 2] |= (240 | code >> 18) << SHIFT[i2++ & 3];
                  blocks[i2 >> 2] |= (128 | code >> 12 & 63) << SHIFT[i2++ & 3];
                  blocks[i2 >> 2] |= (128 | code >> 6 & 63) << SHIFT[i2++ & 3];
                  blocks[i2 >> 2] |= (128 | code & 63) << SHIFT[i2++ & 3];
                }
              }
            } else {
              for (i2 = this.start; index < length && i2 < byteCount; ++index) {
                blocks[i2 >> 2] |= message[index] << SHIFT[i2++ & 3];
              }
            }
            this.lastByteIndex = i2;
            if (i2 >= byteCount) {
              this.start = i2 - byteCount;
              this.block = blocks[blockCount];
              for (i2 = 0; i2 < blockCount; ++i2) {
                s[i2] ^= blocks[i2];
              }
              f(s);
              this.reset = true;
            } else {
              this.start = i2;
            }
          }
          return this;
        };
        Keccak.prototype.encode = function(x, right) {
          var o = x & 255, n = 1;
          var bytes = [o];
          x = x >> 8;
          o = x & 255;
          while (o > 0) {
            bytes.unshift(o);
            x = x >> 8;
            o = x & 255;
            ++n;
          }
          if (right) {
            bytes.push(n);
          } else {
            bytes.unshift(n);
          }
          this.update(bytes);
          return bytes.length;
        };
        Keccak.prototype.encodeString = function(str) {
          var result = formatMessage(str);
          str = result[0];
          var isString = result[1];
          var bytes = 0, length = str.length;
          if (isString) {
            for (var i2 = 0; i2 < str.length; ++i2) {
              var code = str.charCodeAt(i2);
              if (code < 128) {
                bytes += 1;
              } else if (code < 2048) {
                bytes += 2;
              } else if (code < 55296 || code >= 57344) {
                bytes += 3;
              } else {
                code = 65536 + ((code & 1023) << 10 | str.charCodeAt(++i2) & 1023);
                bytes += 4;
              }
            }
          } else {
            bytes = length;
          }
          bytes += this.encode(bytes * 8);
          this.update(str);
          return bytes;
        };
        Keccak.prototype.bytepad = function(strs, w) {
          var bytes = this.encode(w);
          for (var i2 = 0; i2 < strs.length; ++i2) {
            bytes += this.encodeString(strs[i2]);
          }
          var paddingBytes = (w - bytes % w) % w;
          var zeros = [];
          zeros.length = paddingBytes;
          this.update(zeros);
          return this;
        };
        Keccak.prototype.finalize = function() {
          if (this.finalized) {
            return;
          }
          this.finalized = true;
          var blocks = this.blocks, i2 = this.lastByteIndex, blockCount = this.blockCount, s = this.s;
          blocks[i2 >> 2] |= this.padding[i2 & 3];
          if (this.lastByteIndex === this.byteCount) {
            blocks[0] = blocks[blockCount];
            for (i2 = 1; i2 < blockCount + 1; ++i2) {
              blocks[i2] = 0;
            }
          }
          blocks[blockCount - 1] |= 2147483648;
          for (i2 = 0; i2 < blockCount; ++i2) {
            s[i2] ^= blocks[i2];
          }
          f(s);
        };
        Keccak.prototype.toString = Keccak.prototype.hex = function() {
          this.finalize();
          var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks, extraBytes = this.extraBytes, i2 = 0, j2 = 0;
          var hex = "", block;
          while (j2 < outputBlocks) {
            for (i2 = 0; i2 < blockCount && j2 < outputBlocks; ++i2, ++j2) {
              block = s[i2];
              hex += HEX_CHARS[block >> 4 & 15] + HEX_CHARS[block & 15] + HEX_CHARS[block >> 12 & 15] + HEX_CHARS[block >> 8 & 15] + HEX_CHARS[block >> 20 & 15] + HEX_CHARS[block >> 16 & 15] + HEX_CHARS[block >> 28 & 15] + HEX_CHARS[block >> 24 & 15];
            }
            if (j2 % blockCount === 0) {
              s = cloneArray(s);
              f(s);
              i2 = 0;
            }
          }
          if (extraBytes) {
            block = s[i2];
            hex += HEX_CHARS[block >> 4 & 15] + HEX_CHARS[block & 15];
            if (extraBytes > 1) {
              hex += HEX_CHARS[block >> 12 & 15] + HEX_CHARS[block >> 8 & 15];
            }
            if (extraBytes > 2) {
              hex += HEX_CHARS[block >> 20 & 15] + HEX_CHARS[block >> 16 & 15];
            }
          }
          return hex;
        };
        Keccak.prototype.arrayBuffer = function() {
          this.finalize();
          var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks, extraBytes = this.extraBytes, i2 = 0, j2 = 0;
          var bytes = this.outputBits >> 3;
          var buffer;
          if (extraBytes) {
            buffer = new ArrayBuffer(outputBlocks + 1 << 2);
          } else {
            buffer = new ArrayBuffer(bytes);
          }
          var array = new Uint32Array(buffer);
          while (j2 < outputBlocks) {
            for (i2 = 0; i2 < blockCount && j2 < outputBlocks; ++i2, ++j2) {
              array[j2] = s[i2];
            }
            if (j2 % blockCount === 0) {
              s = cloneArray(s);
              f(s);
            }
          }
          if (extraBytes) {
            array[j2] = s[i2];
            buffer = buffer.slice(0, bytes);
          }
          return buffer;
        };
        Keccak.prototype.buffer = Keccak.prototype.arrayBuffer;
        Keccak.prototype.digest = Keccak.prototype.array = function() {
          this.finalize();
          var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks, extraBytes = this.extraBytes, i2 = 0, j2 = 0;
          var array = [], offset, block;
          while (j2 < outputBlocks) {
            for (i2 = 0; i2 < blockCount && j2 < outputBlocks; ++i2, ++j2) {
              offset = j2 << 2;
              block = s[i2];
              array[offset] = block & 255;
              array[offset + 1] = block >> 8 & 255;
              array[offset + 2] = block >> 16 & 255;
              array[offset + 3] = block >> 24 & 255;
            }
            if (j2 % blockCount === 0) {
              s = cloneArray(s);
              f(s);
            }
          }
          if (extraBytes) {
            offset = j2 << 2;
            block = s[i2];
            array[offset] = block & 255;
            if (extraBytes > 1) {
              array[offset + 1] = block >> 8 & 255;
            }
            if (extraBytes > 2) {
              array[offset + 2] = block >> 16 & 255;
            }
          }
          return array;
        };
        function Kmac(bits2, padding, outputBits) {
          Keccak.call(this, bits2, padding, outputBits);
        }
        Kmac.prototype = new Keccak();
        Kmac.prototype.finalize = function() {
          this.encode(this.outputBits, true);
          return Keccak.prototype.finalize.call(this);
        };
        var f = function(s) {
          var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17, b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33, b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;
          for (n = 0; n < 48; n += 2) {
            c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
            c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
            c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
            c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
            c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
            c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
            c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
            c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
            c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
            c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];
            h = c8 ^ (c2 << 1 | c3 >>> 31);
            l = c9 ^ (c3 << 1 | c2 >>> 31);
            s[0] ^= h;
            s[1] ^= l;
            s[10] ^= h;
            s[11] ^= l;
            s[20] ^= h;
            s[21] ^= l;
            s[30] ^= h;
            s[31] ^= l;
            s[40] ^= h;
            s[41] ^= l;
            h = c0 ^ (c4 << 1 | c5 >>> 31);
            l = c1 ^ (c5 << 1 | c4 >>> 31);
            s[2] ^= h;
            s[3] ^= l;
            s[12] ^= h;
            s[13] ^= l;
            s[22] ^= h;
            s[23] ^= l;
            s[32] ^= h;
            s[33] ^= l;
            s[42] ^= h;
            s[43] ^= l;
            h = c2 ^ (c6 << 1 | c7 >>> 31);
            l = c3 ^ (c7 << 1 | c6 >>> 31);
            s[4] ^= h;
            s[5] ^= l;
            s[14] ^= h;
            s[15] ^= l;
            s[24] ^= h;
            s[25] ^= l;
            s[34] ^= h;
            s[35] ^= l;
            s[44] ^= h;
            s[45] ^= l;
            h = c4 ^ (c8 << 1 | c9 >>> 31);
            l = c5 ^ (c9 << 1 | c8 >>> 31);
            s[6] ^= h;
            s[7] ^= l;
            s[16] ^= h;
            s[17] ^= l;
            s[26] ^= h;
            s[27] ^= l;
            s[36] ^= h;
            s[37] ^= l;
            s[46] ^= h;
            s[47] ^= l;
            h = c6 ^ (c0 << 1 | c1 >>> 31);
            l = c7 ^ (c1 << 1 | c0 >>> 31);
            s[8] ^= h;
            s[9] ^= l;
            s[18] ^= h;
            s[19] ^= l;
            s[28] ^= h;
            s[29] ^= l;
            s[38] ^= h;
            s[39] ^= l;
            s[48] ^= h;
            s[49] ^= l;
            b0 = s[0];
            b1 = s[1];
            b32 = s[11] << 4 | s[10] >>> 28;
            b33 = s[10] << 4 | s[11] >>> 28;
            b14 = s[20] << 3 | s[21] >>> 29;
            b15 = s[21] << 3 | s[20] >>> 29;
            b46 = s[31] << 9 | s[30] >>> 23;
            b47 = s[30] << 9 | s[31] >>> 23;
            b28 = s[40] << 18 | s[41] >>> 14;
            b29 = s[41] << 18 | s[40] >>> 14;
            b20 = s[2] << 1 | s[3] >>> 31;
            b21 = s[3] << 1 | s[2] >>> 31;
            b2 = s[13] << 12 | s[12] >>> 20;
            b3 = s[12] << 12 | s[13] >>> 20;
            b34 = s[22] << 10 | s[23] >>> 22;
            b35 = s[23] << 10 | s[22] >>> 22;
            b16 = s[33] << 13 | s[32] >>> 19;
            b17 = s[32] << 13 | s[33] >>> 19;
            b48 = s[42] << 2 | s[43] >>> 30;
            b49 = s[43] << 2 | s[42] >>> 30;
            b40 = s[5] << 30 | s[4] >>> 2;
            b41 = s[4] << 30 | s[5] >>> 2;
            b22 = s[14] << 6 | s[15] >>> 26;
            b23 = s[15] << 6 | s[14] >>> 26;
            b4 = s[25] << 11 | s[24] >>> 21;
            b5 = s[24] << 11 | s[25] >>> 21;
            b36 = s[34] << 15 | s[35] >>> 17;
            b37 = s[35] << 15 | s[34] >>> 17;
            b18 = s[45] << 29 | s[44] >>> 3;
            b19 = s[44] << 29 | s[45] >>> 3;
            b10 = s[6] << 28 | s[7] >>> 4;
            b11 = s[7] << 28 | s[6] >>> 4;
            b42 = s[17] << 23 | s[16] >>> 9;
            b43 = s[16] << 23 | s[17] >>> 9;
            b24 = s[26] << 25 | s[27] >>> 7;
            b25 = s[27] << 25 | s[26] >>> 7;
            b6 = s[36] << 21 | s[37] >>> 11;
            b7 = s[37] << 21 | s[36] >>> 11;
            b38 = s[47] << 24 | s[46] >>> 8;
            b39 = s[46] << 24 | s[47] >>> 8;
            b30 = s[8] << 27 | s[9] >>> 5;
            b31 = s[9] << 27 | s[8] >>> 5;
            b12 = s[18] << 20 | s[19] >>> 12;
            b13 = s[19] << 20 | s[18] >>> 12;
            b44 = s[29] << 7 | s[28] >>> 25;
            b45 = s[28] << 7 | s[29] >>> 25;
            b26 = s[38] << 8 | s[39] >>> 24;
            b27 = s[39] << 8 | s[38] >>> 24;
            b8 = s[48] << 14 | s[49] >>> 18;
            b9 = s[49] << 14 | s[48] >>> 18;
            s[0] = b0 ^ ~b2 & b4;
            s[1] = b1 ^ ~b3 & b5;
            s[10] = b10 ^ ~b12 & b14;
            s[11] = b11 ^ ~b13 & b15;
            s[20] = b20 ^ ~b22 & b24;
            s[21] = b21 ^ ~b23 & b25;
            s[30] = b30 ^ ~b32 & b34;
            s[31] = b31 ^ ~b33 & b35;
            s[40] = b40 ^ ~b42 & b44;
            s[41] = b41 ^ ~b43 & b45;
            s[2] = b2 ^ ~b4 & b6;
            s[3] = b3 ^ ~b5 & b7;
            s[12] = b12 ^ ~b14 & b16;
            s[13] = b13 ^ ~b15 & b17;
            s[22] = b22 ^ ~b24 & b26;
            s[23] = b23 ^ ~b25 & b27;
            s[32] = b32 ^ ~b34 & b36;
            s[33] = b33 ^ ~b35 & b37;
            s[42] = b42 ^ ~b44 & b46;
            s[43] = b43 ^ ~b45 & b47;
            s[4] = b4 ^ ~b6 & b8;
            s[5] = b5 ^ ~b7 & b9;
            s[14] = b14 ^ ~b16 & b18;
            s[15] = b15 ^ ~b17 & b19;
            s[24] = b24 ^ ~b26 & b28;
            s[25] = b25 ^ ~b27 & b29;
            s[34] = b34 ^ ~b36 & b38;
            s[35] = b35 ^ ~b37 & b39;
            s[44] = b44 ^ ~b46 & b48;
            s[45] = b45 ^ ~b47 & b49;
            s[6] = b6 ^ ~b8 & b0;
            s[7] = b7 ^ ~b9 & b1;
            s[16] = b16 ^ ~b18 & b10;
            s[17] = b17 ^ ~b19 & b11;
            s[26] = b26 ^ ~b28 & b20;
            s[27] = b27 ^ ~b29 & b21;
            s[36] = b36 ^ ~b38 & b30;
            s[37] = b37 ^ ~b39 & b31;
            s[46] = b46 ^ ~b48 & b40;
            s[47] = b47 ^ ~b49 & b41;
            s[8] = b8 ^ ~b0 & b2;
            s[9] = b9 ^ ~b1 & b3;
            s[18] = b18 ^ ~b10 & b12;
            s[19] = b19 ^ ~b11 & b13;
            s[28] = b28 ^ ~b20 & b22;
            s[29] = b29 ^ ~b21 & b23;
            s[38] = b38 ^ ~b30 & b32;
            s[39] = b39 ^ ~b31 & b33;
            s[48] = b48 ^ ~b40 & b42;
            s[49] = b49 ^ ~b41 & b43;
            s[0] ^= RC[n];
            s[1] ^= RC[n + 1];
          }
        };
        if (COMMON_JS) {
          module.exports = methods;
        } else {
          for (i = 0; i < methodNames.length; ++i) {
            root[methodNames[i]] = methods[methodNames[i]];
          }
          if (AMD) {
            define(function() {
              return methods;
            });
          }
        }
      })();
    }
  });

  // src/background.ts
  init_client();

  // src/deepseek-web.ts
  var import_js_sha3 = __toESM(require_sha3(), 1);
  function solvePoW(challenge, maxTimeMs = 1e4) {
    const prefix = `${challenge.salt}_${challenge.expire_at}_`;
    const threshold = Math.floor(4294967296 / challenge.difficulty);
    const startTime = performance.now();
    const input = new TextEncoder();
    const bChallenge = input.encode(challenge.challenge);
    const bPrefix = input.encode(prefix);
    const preLen = bChallenge.length + bPrefix.length;
    const preBuf = new Uint8Array(preLen + 10);
    preBuf.set(bChallenge, 0);
    preBuf.set(bPrefix, bChallenge.length);
    let nonce = 0;
    while (nonce < 5e7) {
      const nonceStr = String(nonce);
      const nonceBytes = input.encode(nonceStr);
      const totalLen = preLen + nonceBytes.length;
      const fullInput = new Uint8Array(
        preBuf.buffer.slice(0, preLen)
      );
      const combined = new Uint8Array(totalLen);
      combined.set(fullInput, 0);
      combined.set(nonceBytes, preLen);
      const hash = import_js_sha3.sha3_256.array(combined);
      const value = (hash[0] | hash[1] << 8 | hash[2] << 16 | hash[3] << 24) >>> 0;
      if (value < threshold) {
        const elapsed = performance.now() - startTime;
        console.log(`[DeepSeek PoW] nonce=${nonce}, time=${elapsed.toFixed(0)}ms, value=${value.toString(16)}, threshold=${threshold.toString(16)}`);
        return nonce;
      }
      nonce++;
      if (nonce % 1e5 === 0) {
        const elapsed = performance.now() - startTime;
        if (elapsed > maxTimeMs) {
          console.warn(`[DeepSeek PoW] timeout after ${elapsed.toFixed(0)}ms, ${nonce} iterations`);
          return null;
        }
      }
    }
    console.warn(`[DeepSeek PoW] no solution found in ${nonce} iterations`);
    return null;
  }
  function encodePowResponse(challenge, nonce) {
    const payload = {
      algorithm: challenge.algorithm,
      challenge: challenge.challenge,
      salt: challenge.salt,
      answer: nonce,
      signature: challenge.signature,
      target_path: challenge.target_path
    };
    const json = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(json)));
  }
  async function fetchPowChallenge(token) {
    const resp = await fetch("https://chat.deepseek.com/api/v0/chat/create_pow_challenge", {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Origin": "https://chat.deepseek.com",
        "Referer": "https://chat.deepseek.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/134.0.0.0 Safari/537.36",
        "x-client-version": "2.0.2",
        "x-client-platform": "web"
      },
      body: JSON.stringify({ target_path: "/api/v0/chat/completion" })
    });
    if (!resp.ok) {
      throw new Error(`\u83B7\u53D6 PoW \u6311\u6218\u5931\u8D25\uFF1AHTTP ${resp.status}`);
    }
    const data = await resp.json();
    const bizData = data?.data?.biz_data || data?.biz_data || data;
    if (!bizData.challenge || !bizData.salt || !bizData.difficulty) {
      throw new Error(`PoW \u6311\u6218\u683C\u5F0F\u5F02\u5E38\uFF1A${JSON.stringify(bizData).slice(0, 200)}`);
    }
    return {
      algorithm: bizData.algorithm || "DeepSeekHashV1",
      challenge: bizData.challenge,
      salt: bizData.salt,
      difficulty: bizData.difficulty,
      expire_at: bizData.expire_at || Date.now() + 6e4,
      signature: bizData.signature || "",
      target_path: bizData.target_path || "/api/v0/chat/completion"
    };
  }
  var DS_TOKEN_KEY = "deepseek_web_token";
  async function getDeepSeekToken() {
    try {
      const stored = await chrome.storage.sync.get(DS_TOKEN_KEY);
      return stored[DS_TOKEN_KEY] || null;
    } catch {
      return null;
    }
  }
  async function setDeepSeekToken(token) {
    await chrome.storage.sync.set({ [DS_TOKEN_KEY]: token });
  }
  function isValidToken(token) {
    if (!token || token.length < 20)
      return false;
    return true;
  }
  async function sendDeepSeekWebMessage(opts) {
    const token = await getDeepSeekToken();
    if (!isValidToken(token)) {
      throw new Error(
        "DeepSeek Token \u672A\u914D\u7F6E\u3002\u8BF7\u5728\u6269\u5C55\u8BBE\u7F6E\u4E2D\u7C98\u8D34\u60A8\u7684 DeepSeek Token\uFF0C\u6216\u6253\u5F00 chat.deepseek.com \u767B\u5F55\u540E\u81EA\u52A8\u63D0\u53D6\u3002"
      );
    }
    const challenge = await fetchPowChallenge(token);
    const nonce = solvePoW(challenge, 1e4);
    if (nonce === null) {
      throw new Error("DeepSeek PoW \u6C42\u89E3\u8D85\u65F6\uFF0810s\uFF09\u3002\u8BF7\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5\u6216\u91CD\u8BD5\u3002");
    }
    const powResponse = encodePowResponse(challenge, nonce);
    const model = opts.model || "deepseek-chat";
    const messages = [
      { role: "user", content: opts.prompt }
    ];
    const chatBody = {
      model,
      messages,
      stream: false,
      temperature: 0.7
    };
    const resp = await fetch("https://chat.deepseek.com/api/v0/chat/completion", {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Origin": "https://chat.deepseek.com",
        "Referer": "https://chat.deepseek.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/134.0.0.0 Safari/537.36",
        "x-client-version": "2.0.2",
        "x-client-platform": "web",
        "x-ds-pow-response": powResponse
      },
      body: JSON.stringify(chatBody)
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      if (resp.status === 401) {
        throw new Error(
          "DeepSeek Token \u5DF2\u5931\u6548\uFF08401\uFF09\uFF0C\u8BF7\u91CD\u65B0\u83B7\u53D6\u3002\u6253\u5F00 chat.deepseek.com \u767B\u5F55\u540E\u53EF\u81EA\u52A8\u63D0\u53D6\u3002"
        );
      }
      throw new Error(`DeepSeek API \u9519\u8BEF [${resp.status}]\uFF1A${errText.slice(0, 200)}`);
    }
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || data?.data?.content || data?.content || "";
    if (!text) {
      throw new Error("DeepSeek \u672A\u8FD4\u56DE\u5185\u5BB9\u3002\u54CD\u5E94\uFF1A" + JSON.stringify(data).slice(0, 300));
    }
    return text;
  }
  async function sendDeepSeekWebMessageStream(opts, onChunk) {
    const token = await getDeepSeekToken();
    if (!isValidToken(token)) {
      throw new Error(
        "DeepSeek Token \u672A\u914D\u7F6E\u3002\u8BF7\u5728\u6269\u5C55\u8BBE\u7F6E\u4E2D\u7C98\u8D34\u60A8\u7684 DeepSeek Token\uFF0C\u6216\u6253\u5F00 chat.deepseek.com \u767B\u5F55\u540E\u81EA\u52A8\u63D0\u53D6\u3002"
      );
    }
    const challenge = await fetchPowChallenge(token);
    const nonce = solvePoW(challenge, 1e4);
    if (nonce === null) {
      throw new Error("DeepSeek PoW \u6C42\u89E3\u8D85\u65F6\uFF0810s\uFF09\u3002\u8BF7\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5\u6216\u91CD\u8BD5\u3002");
    }
    const powResponse = encodePowResponse(challenge, nonce);
    const model = opts.model || "deepseek-chat";
    const messages = [
      { role: "user", content: opts.prompt }
    ];
    const chatBody = {
      model,
      messages,
      stream: true,
      temperature: 0.7
    };
    const resp = await fetch("https://chat.deepseek.com/api/v0/chat/completion", {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Origin": "https://chat.deepseek.com",
        "Referer": "https://chat.deepseek.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/134.0.0.0 Safari/537.36",
        "x-client-version": "2.0.2",
        "x-client-platform": "web",
        "x-ds-pow-response": powResponse
      },
      body: JSON.stringify(chatBody)
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      if (resp.status === 401) {
        throw new Error(
          "DeepSeek Token \u5DF2\u5931\u6548\uFF08401\uFF09\uFF0C\u8BF7\u91CD\u65B0\u83B7\u53D6\u3002\u6253\u5F00 chat.deepseek.com \u767B\u5F55\u540E\u53EF\u81EA\u52A8\u63D0\u53D6\u3002"
        );
      }
      throw new Error(`DeepSeek API \u9519\u8BEF [${resp.status}]\uFF1A${errText.slice(0, 200)}`);
    }
    if (!resp.body) {
      throw new Error("DeepSeek \u6D41\u5F0F\u54CD\u5E94\u4E0D\u652F\u6301\uFF1Aresponse.body \u4E3A\u7A7A\u3002");
    }
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";
    const processSSELine = (line) => {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:"))
        return;
      const data = trimmed.slice(5).trim();
      if (!data || data === "[DONE]")
        return;
      try {
        const json = JSON.parse(data);
        const content = json?.choices?.[0]?.delta?.content;
        if (typeof content === "string" && content) {
          fullText += content;
          onChunk(content);
        }
      } catch {
      }
    };
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        processSSELine(line);
      }
    }
    if (buffer.trim()) {
      processSSELine(buffer);
    }
    if (!fullText) {
      throw new Error("DeepSeek \u6D41\u5F0F\u672A\u8FD4\u56DE\u5185\u5BB9\u3002");
    }
    return fullText;
  }

  // src/background.ts
  var DEFAULT_INLINE_AI_CONFIG = {
    provider: "gemini-web",
    apiKey: "",
    baseUrl: "",
    model: "56fdd199312815e2",
    systemPrompt: "\u4F60\u662F\u98DE\u4E66\u540C\u6B65\u63D2\u4EF6\u7684 AI \u52A9\u624B\u3002\u8BF7\u7528\u7B80\u6D01\u7684\u4E2D\u6587\u56DE\u7B54\u3002"
  };
  var DEFAULT_CONTEXT_SCENES = [
    { id: "save", label: "\u6536\u5B58", action: "save", prompt: "{text}", enabled: true, aiEnabled: false },
    { id: "append", label: "\u8865\u5145", action: "append", prompt: "{text}", enabled: true, aiEnabled: false },
    { id: "refine", label: "\u7CBE\u70BC", action: "refine", prompt: "\u8BF7\u628A\u4EE5\u4E0B\u5185\u5BB9\u6574\u7406\u6210 Obsidian \u77E5\u8BC6\u5361\u7247\uFF1A\n\n\u8F93\u51FA\u7ED3\u6784\uFF1A\n## \u6838\u5FC3\u89C2\u70B9\n## \u5173\u952E\u8981\u70B9\n## \u53EF\u590D\u7528\u542F\u53D1\n## \u76F8\u5173\u5173\u952E\u8BCD\n\n\u8981\u6C42\uFF1A\n- \u4E0D\u8981\u7A7A\u6CDB\u603B\u7ED3\u3002\n- \u4FDD\u7559\u6709\u4FE1\u606F\u5BC6\u5EA6\u7684\u539F\u53E5\u3002\n- \u5982\u679C\u5185\u5BB9\u5F88\u77ED\uFF0C\u5C31\u76F4\u63A5\u56F4\u7ED5\u8FD9\u53E5\u8BDD\u5C55\u5F00\u3002\n- \u7528\u4E2D\u6587\u8F93\u51FA\u3002\n\n\u9875\u9762\uFF1A{title}\n\u6765\u6E90\uFF1A{url}\n\u5185\u5BB9\uFF1A\n{text}\n\n{context}", enabled: true, aiEnabled: true },
    { id: "translate-explain", label: "\u8BD1\u89E3", action: "showResult", prompt: '\u8BF7\u4E0D\u8981\u505A\u9010\u5B57\u7FFB\u8BD1\u3002\u8BF7\u628A\u4EE5\u4E0B\u5185\u5BB9\u8F6C\u6362\u6210\u6211\u80FD\u653E\u5165 Obsidian \u7684"\u6982\u5FF5\u7406\u89E3\u7B14\u8BB0"\uFF1A\n\n\u8981\u6C42\uFF1A\n1. \u5148\u7ED9\u81EA\u7136\u4E2D\u6587\u89E3\u91CA\u3002\n2. \u4FDD\u7559\u5173\u952E\u539F\u6587\u672F\u8BED\uFF0C\u5E76\u89E3\u91CA\u5B83\u4EEC\u7684\u542B\u4E49\u3002\n3. \u5982\u679C\u539F\u6587\u6709\u9690\u542B\u80CC\u666F\uFF0C\u8BF7\u8865\u51FA\u6765\u3002\n4. \u7ED9\u4E00\u4E2A\u6211\u80FD\u590D\u7528\u7684\u4F8B\u5B50\u3002\n5. \u6700\u540E\u7ED9 3-5 \u4E2A\u5173\u952E\u8BCD\u3002\n\n\u9875\u9762\uFF1A{title}\n\u6765\u6E90\uFF1A{url}\n\u9009\u4E2D\u6587\u672C\uFF1A\n{text}\n\n{context}', enabled: true, aiEnabled: true },
    { id: "concept-card", label: "\u6982\u5FF5\u5361", action: "showResult", prompt: "\u8BF7\u628A\u4EE5\u4E0B\u5185\u5BB9\u6574\u7406\u6210\u4E00\u4E2A Obsidian \u6982\u5FF5\u5361\uFF1A\n\n\u8F93\u51FA\u7ED3\u6784\uFF1A\n## \u5B9A\u4E49\n## \u80CC\u666F\n## \u4F8B\u5B50\n## \u5BB9\u6613\u8BEF\u89E3\u7684\u70B9\n## \u5173\u8054\u6982\u5FF5\n\n\u9875\u9762\uFF1A{title}\n\u6765\u6E90\uFF1A{url}\n\u9009\u4E2D\u6587\u672C\uFF1A\n{text}\n\n{context}", enabled: true, aiEnabled: true },
    { id: "quote", label: "\u91D1\u53E5", action: "showResult", prompt: '\u8BF7\u628A\u4EE5\u4E0B\u9009\u4E2D\u6587\u672C\u6574\u7406\u6210"\u91D1\u53E5/\u6D1E\u5BDF\u5361\u7247"\uFF1A\n\n\u8F93\u51FA\u7ED3\u6784\uFF1A\n> \u539F\u53E5\n\n## \u8FD9\u53E5\u8BDD\u7684\u542B\u4E49\n## \u4E3A\u4EC0\u4E48\u91CD\u8981\n## \u6211\u53EF\u4EE5\u600E\u4E48\u7528\n## \u5173\u952E\u8BCD\n\n\u9009\u4E2D\u6587\u672C\uFF1A\n{text}\n\n{context}', enabled: true, aiEnabled: true },
    { id: "question", label: "\u95EE\u9898", action: "showResult", prompt: "\u8BF7\u628A\u4EE5\u4E0B\u5185\u5BB9\u8F6C\u6210\u540E\u7EED\u53EF\u63A2\u7D22\u7684\u95EE\u9898\uFF1A\n\n\u8F93\u51FA\u7ED3\u6784\uFF1A\n## \u6838\u5FC3\u95EE\u9898\n## \u53EF\u80FD\u7B54\u6848\n## \u8FD8\u9700\u8981\u67E5\u4EC0\u4E48\n## \u9002\u5408\u653E\u5165 Obsidian \u7684\u8FFD\u95EE\n\n\u9875\u9762\uFF1A{title}\n\u6765\u6E90\uFF1A{url}\n\u9009\u4E2D\u6587\u672C\uFF1A\n{text}\n\n{context}", enabled: true, aiEnabled: true },
    { id: "copy", label: "\u590D\u5236", action: "copy", prompt: "{text}", enabled: true, aiEnabled: false },
    { id: "open-sidepanel", label: "\u6253\u5F00\u4FA7\u8FB9\u680F", action: "openSidepanel", prompt: "{text}", enabled: true, aiEnabled: false }
  ];
  var AI_TIMEOUT_MS = 8e3;
  var AI_TIMEOUT_MESSAGE = "AI \u8BF7\u6C42\u8D85\u65F6\u3002\u8BF7\u91CD\u8BD5\uFF0C\u6216\u5F00\u542F\u300C\u81EA\u5B9A\u4E49 AI \u89E3\u91CA\u5668\u300D\u540E\u4F7F\u7528\u81EA\u5B9A\u4E49 API\u3002";
  var AI_CACHE_TTL_MS = 5 * 60 * 1e3;
  var aiResultCache = /* @__PURE__ */ new Map();
  function hashString(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }
  function getCacheKey(sceneId, text, prompt) {
    return `${sceneId}:${hashString(text + "|" + prompt)}`;
  }
  function getCachedResult(key) {
    const entry = aiResultCache.get(key);
    if (!entry)
      return null;
    if (Date.now() - entry.timestamp > AI_CACHE_TTL_MS) {
      aiResultCache.delete(key);
      return null;
    }
    return entry.result;
  }
  function setCachedResult(key, result) {
    aiResultCache.set(key, { result, timestamp: Date.now() });
    if (aiResultCache.size % 20 === 0) {
      const now = Date.now();
      for (const [k, v] of aiResultCache) {
        if (now - v.timestamp > AI_CACHE_TTL_MS)
          aiResultCache.delete(k);
      }
    }
  }
  function withTimeout(promise, ms, message) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(message)), ms);
      promise.then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });
  }
  async function runInlineAi(payload) {
    const stored = await chrome.storage.sync.get("aiConfig");
    const config = { ...DEFAULT_INLINE_AI_CONFIG, ...stored.aiConfig ?? {} };
    const text = payload.text?.trim();
    const attachments = normalizeAiAttachments(payload.attachments);
    if (!text && attachments.length === 0)
      throw new Error("\u8BF7\u5148\u8F93\u5165\u6587\u5B57\u3001\u5212\u9009\u6587\u672C\u6216\u6DFB\u52A0\u56FE\u7247\u3002");
    const instruction = {
      translate: "\u5C06\u4EE5\u4E0B\u5185\u5BB9\u7FFB\u8BD1\u6210\u7B80\u6D01\u81EA\u7136\u7684\u4E2D\u6587\uFF1A",
      summarize: "\u7528\u8981\u70B9\u603B\u7ED3\u4EE5\u4E0B\u5185\u5BB9\uFF1A",
      explain: "\u89E3\u91CA\u4EE5\u4E0B\u5185\u5BB9\uFF1A",
      grammar: "\u4FEE\u6B63\u4EE5\u4E0B\u5185\u5BB9\u7684\u8BED\u6CD5\u548C\u8868\u8FBE\uFF0C\u5E76\u53EA\u8FD4\u56DE\u4FEE\u6B63\u540E\u7684\u6587\u672C\uFF1A",
      "ai-chat": "\u57FA\u4E8E\u4EE5\u4E0B\u5185\u5BB9\u56DE\u7B54\uFF1A"
    };
    const prompt = payload.prompt?.trim() || `${instruction[payload.action ?? "ai-chat"] ?? instruction["ai-chat"]}

${text}`;
    const sceneId = payload?.action || "ai-chat";
    const cacheKey = getCacheKey(sceneId, text || "", prompt);
    const cached = getCachedResult(cacheKey);
    if (cached)
      return cached;
    const interpreterStored = await chrome.storage.sync.get("interpreterConfig");
    const interpreterConfig = interpreterStored?.interpreterConfig ?? {};
    const useCustomProvider = interpreterConfig?.customProviderEnabled === true;
    let aiResult;
    if (config.provider === "deepseek-web") {
      try {
        const dsToken = await getDeepSeekToken();
        if (!isValidToken(dsToken)) {
          throw new Error("DeepSeek Token \u672A\u914D\u7F6E\u3002\u8BF7\u5148\u6253\u5F00 chat.deepseek.com \u767B\u5F55\uFF0C\u6269\u5C55\u4F1A\u81EA\u52A8\u63D0\u53D6 Token\u3002");
        }
        const systemMsg = config.systemPrompt ? `${config.systemPrompt}

` : "";
        aiResult = await withTimeout(
          sendDeepSeekWebMessage({ prompt: `${systemMsg}${prompt}` }),
          AI_TIMEOUT_MS,
          AI_TIMEOUT_MESSAGE
        );
        setCachedResult(cacheKey, aiResult);
        return aiResult;
      } catch (error) {
        throw error instanceof Error ? error : new Error(String(error));
      }
    }
    if (!useCustomProvider) {
      let geminiError = null;
      try {
        aiResult = await withTimeout(
          sendGeminiWebMessage(`${config.systemPrompt}

${prompt}`, config.model, attachments),
          AI_TIMEOUT_MS,
          AI_TIMEOUT_MESSAGE
        );
        setCachedResult(cacheKey, aiResult);
        return aiResult;
      } catch (error) {
        geminiError = error instanceof Error ? error.message : String(error);
        console.warn("[feishu-sync] Gemini Web \u5931\u8D25\uFF0C\u5C1D\u8BD5 DeepSeek Web \u964D\u7EA7\uFF1A", geminiError);
      }
      const dsToken = await getDeepSeekToken();
      if (isValidToken(dsToken)) {
        try {
          const systemMsg = config.systemPrompt ? `${config.systemPrompt}

` : "";
          aiResult = await withTimeout(
            sendDeepSeekWebMessage({ prompt: `${systemMsg}${prompt}` }),
            AI_TIMEOUT_MS,
            AI_TIMEOUT_MESSAGE
          );
          setCachedResult(cacheKey, aiResult);
          return aiResult;
        } catch (dsError) {
          const dsErrMsg = dsError instanceof Error ? dsError.message : String(dsError);
          throw new Error(
            `Gemini Web \u4E0D\u53EF\u7528\uFF0CDeepSeek Web \u4E5F\u5931\u8D25\u3002
Gemini\uFF1A${geminiError}
DeepSeek\uFF1A${dsErrMsg}

\u8BF7\u5728\u4FA7\u8FB9\u680F\u8BBE\u7F6E\u4E2D\u5F00\u542F\u300C\u81EA\u5B9A\u4E49 AI \u89E3\u91CA\u5668\u300D\u4F7F\u7528\u81EA\u5B9A\u4E49 API\u3002`
          );
        }
      }
      throw new Error(
        "Gemini Web \u8FDE\u63A5\u5931\u8D25\u3002\u8BF7\u6253\u5F00 gemini.google.com \u5237\u65B0\u767B\u5F55\u540E\u518D\u8BD5\uFF0C\u6216\u5728\u4FA7\u8FB9\u680F\u8BBE\u7F6E\u4E2D\u5F00\u542F\u300C\u81EA\u5B9A\u4E49 AI \u89E3\u91CA\u5668\u300D\u540E\u914D\u7F6E API Key\u3002"
      );
    } else {
      const aiPromise = (async () => {
        if (config.provider === "gemini-nano")
          throw new Error("\u5F53\u524D Chrome \u4E0D\u652F\u6301 Gemini Nano\u3002");
        if (config.provider === "gemini-api") {
          if (!config.apiKey)
            throw new Error("Gemini API \u5C1A\u672A\u914D\u7F6E API Key\u3002");
          const response2 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model || "gemini-2.0-flash"}:generateContent?key=${config.apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `${config.systemPrompt}

${prompt}` }] }] })
          });
          const data2 = await response2.json();
          if (!response2.ok)
            throw new Error(data2.error?.message || `Gemini API HTTP ${response2.status}`);
          return data2.candidates?.[0]?.content?.parts?.[0]?.text || "AI \u672A\u8FD4\u56DE\u5185\u5BB9";
        }
        const baseUrl2 = config.baseUrl || (config.provider === "openai" ? "https://api.openai.com" : config.provider === "deepseek" ? "https://api.deepseek.com" : "");
        if (!baseUrl2)
          throw new Error("AI \u52A9\u624B\u5C1A\u672A\u914D\u7F6E\u3002\u8BF7\u5728\u6269\u5C55\u8BBE\u7F6E > AI \u52A9\u624B\u4E2D\u586B\u5199 Base URL \u548C\u6A21\u578B\u3002");
        if (!config.apiKey && config.provider !== "custom")
          throw new Error("\u8BF7\u5728\u6269\u5C55\u8BBE\u7F6E > AI \u52A9\u624B\u4E2D\u586B\u5199 API Key\u3002");
        const response = await fetch(`${baseUrl2.replace(/\/+$/, "")}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {} },
          body: JSON.stringify({ model: config.model, temperature: 0.7, messages: [{ role: "system", content: config.systemPrompt }, { role: "user", content: prompt }] })
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error?.message || `AI \u8BF7\u6C42\u5931\u8D25\uFF1AHTTP ${response.status}`);
        return data.choices?.[0]?.message?.content || "AI \u672A\u8FD4\u56DE\u5185\u5BB9";
      })();
      aiResult = await withTimeout(aiPromise, AI_TIMEOUT_MS, AI_TIMEOUT_MESSAGE);
    }
    setCachedResult(cacheKey, aiResult);
    return aiResult;
  }
  var MAX_RETRIES = 2;
  var RETRY_BASE_DELAY_MS = 1e3;
  var NON_RETRYABLE_ERRORS = /* @__PURE__ */ new Set([
    "CONTENT_TOO_LONG",
    "QUOTA_EXHAUSTED",
    "EMPTY_RESULT",
    "SESSION_EXPIRED"
  ]);
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function classifyAiError(error, textLength) {
    const message = error instanceof Error ? error.message : String(error);
    const lowerMsg = message.toLowerCase();
    if (message.includes("\u767B\u5F55\u4F1A\u8BDD\u4E0D\u53EF\u7528") || message.includes("Token") || message.includes("401")) {
      const provider2 = lowerMsg.includes("deepseek") ? "deepseek" : "gemini";
      return { errorType: "SESSION_EXPIRED", message, provider: provider2 };
    }
    if (message.includes("429") || message.includes("\u989D\u5EA6") || lowerMsg.includes("quota")) {
      const provider2 = lowerMsg.includes("deepseek") ? "deepseek" : "gemini";
      return { errorType: "QUOTA_EXHAUSTED", message, provider: provider2 };
    }
    if (textLength > 5e3) {
      return { errorType: "CONTENT_TOO_LONG", message, provider: "unknown" };
    }
    if (message.includes("\u8D85\u65F6") || lowerMsg.includes("timeout")) {
      const provider2 = lowerMsg.includes("deepseek") ? "deepseek" : "gemini";
      return { errorType: "TIMEOUT", message, provider: provider2 };
    }
    if (lowerMsg.includes("fetch") || lowerMsg.includes("network") || lowerMsg.includes("failed to fetch")) {
      const provider2 = lowerMsg.includes("deepseek") ? "deepseek" : "gemini";
      return { errorType: "CONNECTION_ERROR", message, provider: provider2 };
    }
    const provider = lowerMsg.includes("deepseek") ? "deepseek" : lowerMsg.includes("gemini") ? "gemini" : "unknown";
    return { errorType: "UNKNOWN", message, provider };
  }
  async function runInlineAiWithRetry(payload) {
    let lastError = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const result = await runInlineAi(payload);
        return result;
      } catch (error) {
        lastError = error;
        const textLength = (payload.text || "").length;
        const classified = classifyAiError(error, textLength);
        if (NON_RETRYABLE_ERRORS.has(classified.errorType)) {
          throw error;
        }
        if (attempt >= MAX_RETRIES)
          break;
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
    throw lastError;
  }
  var WEB_MODELS = {
    "8c46e95b1a07cecc": { hash: "8c46e95b1a07cecc", mode: 6 },
    "56fdd199312815e2": { hash: "56fdd199312815e2", mode: 1 },
    e6fa609c3fa255c0: { hash: "e6fa609c3fa255c0", mode: 3 }
  };
  var WEB_ALIASES = { "gemini-3.1-flash-lite": "8c46e95b1a07cecc", "gemini-3.5-flash": "56fdd199312815e2", "gemini-3.1-pro": "e6fa609c3fa255c0" };
  function extractGeminiToken(key, html) {
    return html.match(new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`))?.[1] || "";
  }
  function parseGeminiLine(line) {
    try {
      const envelope = JSON.parse(line.replace(/^\)\]\}'/, "").trim());
      for (const item of envelope) {
        const payload = typeof item?.[2] === "string" ? JSON.parse(item[2]) : null;
        const candidate = payload?.[4]?.[0];
        const text = candidate?.[1]?.[0];
        if (typeof text === "string")
          return text;
      }
    } catch {
    }
    return null;
  }
  function normalizeAiAttachments(attachments) {
    if (!Array.isArray(attachments))
      return [];
    return attachments.map((item) => {
      if (!item || typeof item !== "object")
        return null;
      const value = item;
      if (typeof value.dataUrl !== "string" || !value.dataUrl.startsWith("data:"))
        return null;
      return {
        name: typeof value.name === "string" && value.name.trim() ? value.name.trim() : "image.png",
        dataUrl: value.dataUrl
      };
    }).filter((item) => Boolean(item));
  }
  function getDataUrlMime(dataUrl) {
    return dataUrl.match(/^data:([^;,]+)[;,]/)?.[1] || "application/octet-stream";
  }
  function dataUrlToBlob(dataUrl) {
    const [header, payload] = dataUrl.split(",");
    const mimeType = header?.match(/:(.*?);/)?.[1] || "application/octet-stream";
    if (!payload)
      throw new Error("\u56FE\u7247\u6570\u636E\u65E0\u6548\u3002");
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1)
      bytes[index] = binary.charCodeAt(index);
    return new Blob([bytes], { type: mimeType });
  }
  async function uploadGeminiWebImage(file, uploadContext) {
    const mimeType = getDataUrlMime(file.dataUrl);
    if (!mimeType.startsWith("image/"))
      throw new Error(`Gemini Web \u76EE\u524D\u53EA\u652F\u6301\u56FE\u7247\u9644\u4EF6\uFF1A${file.name}`);
    const baseHeaders = {
      "Push-ID": uploadContext.uploadPushId,
      "X-Tenant-Id": "bard-storage",
      "X-Client-Pctx": uploadContext.uploadClientPctx
    };
    const startResponse = await fetch("https://push.clients6.google.com/upload/", {
      method: "POST",
      credentials: "include",
      headers: {
        ...baseHeaders,
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start"
      },
      body: `File name: ${file.name}`
    });
    if (!startResponse.ok)
      throw new Error(`Gemini Web \u56FE\u7247\u4E0A\u4F20\u521D\u59CB\u5316\u5931\u8D25\uFF1AHTTP ${startResponse.status}`);
    const uploadUrl = startResponse.headers.get("X-Goog-Upload-URL");
    if (!uploadUrl)
      throw new Error("Gemini Web \u56FE\u7247\u4E0A\u4F20\u5931\u8D25\uFF1A\u7F3A\u5C11\u4E0A\u4F20 URL\u3002");
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      credentials: "include",
      headers: {
        ...baseHeaders,
        "X-Goog-Upload-Command": "upload, finalize",
        "X-Goog-Upload-Offset": "0"
      },
      body: dataUrlToBlob(file.dataUrl)
    });
    if (!uploadResponse.ok)
      throw new Error(`Gemini Web \u56FE\u7247\u4E0A\u4F20\u5931\u8D25\uFF1AHTTP ${uploadResponse.status}`);
    const uploadedPath = (await uploadResponse.text()).trim();
    if (!uploadedPath)
      throw new Error("Gemini Web \u56FE\u7247\u4E0A\u4F20\u5931\u8D25\uFF1A\u8FD4\u56DE\u8DEF\u5F84\u4E3A\u7A7A\u3002");
    return [[uploadedPath], file.name];
  }
  async function sendGeminiWebMessage(prompt, configuredModel, attachments = []) {
    const htmlResponse = await fetch("https://gemini.google.com/app", { credentials: "include" });
    const html = await htmlResponse.text();
    const at = extractGeminiToken("SNlM0e", html);
    const bl = extractGeminiToken("cfb2h", html);
    const fSid = extractGeminiToken("FdrFJe", html);
    const uploadPushId = extractGeminiToken("qKIAYe", html);
    const uploadClientPctx = extractGeminiToken("Ylro7b", html);
    const authUser = html.match(/data-index="(\d+)"/)?.[1] || "0";
    if (!at || !bl || !fSid)
      throw new Error("Gemini Web \u767B\u5F55\u4F1A\u8BDD\u4E0D\u53EF\u7528\u3002\u8BF7\u6253\u5F00 gemini.google.com \u540E\u5237\u65B0\u767B\u5F55\u3002");
    if (attachments.length > 0 && (!uploadPushId || !uploadClientPctx))
      throw new Error("Gemini Web \u56FE\u7247\u4E0A\u4F20\u4EE4\u724C\u4E0D\u53EF\u7528\u3002\u8BF7\u6253\u5F00 gemini.google.com \u540E\u5237\u65B0\u767B\u5F55\u3002");
    const modelId = WEB_ALIASES[configuredModel] || configuredModel || "56fdd199312815e2";
    const model = WEB_MODELS[modelId];
    if (!model)
      throw new Error("Gemini Web \u6A21\u578B\u4E0D\u53D7\u652F\u6301\u3002\u8BF7\u9009\u62E9 3.5 Flash\u30013.1 Flash-Lite \u6216 3.1 Pro\u3002");
    const requestId = crypto.randomUUID().toUpperCase();
    const modelHeader = [];
    modelHeader[0] = 1;
    modelHeader[4] = model.hash;
    modelHeader[7] = true;
    modelHeader[8] = [4, 5, 6, 8];
    modelHeader[11] = model.mode;
    modelHeader[14] = model.mode;
    modelHeader[15] = 1;
    modelHeader[16] = requestId;
    const fileList = attachments.length > 0 ? await Promise.all(attachments.map((file) => uploadGeminiWebImage(file, { uploadPushId, uploadClientPctx }))) : [];
    const messageStruct = fileList.length > 0 ? [prompt, 0, null, fileList] : [prompt];
    const requestPayload = [messageStruct, null, ["", "", ""]];
    requestPayload[45] = true;
    const accountPrefix = authUser === "0" ? "" : `/u/${authUser}`;
    const query = new URLSearchParams({ bl, "f.sid": fSid, hl: html.match(/<html[^>]*\slang="([^"]+)"/)?.[1] || "zh-CN", _reqid: String(Math.floor(Math.random() * 9e5) + 1e5), rt: "c" });
    const response = await fetch(`https://gemini.google.com${accountPrefix}/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?${query}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8", "X-Same-Domain": "1", Origin: "https://gemini.google.com", Referer: "https://gemini.google.com/", "x-goog-ext-525001261-jspb": JSON.stringify(modelHeader), "x-goog-ext-525005358-jspb": JSON.stringify([requestId, 1]), "x-goog-ext-73010989-jspb": "[0]", "x-goog-ext-73010990-jspb": "[0,0,0]", ...authUser === "0" ? {} : { "X-Goog-AuthUser": authUser } },
      body: new URLSearchParams({ at, "f.req": JSON.stringify([null, JSON.stringify(requestPayload)]) })
    });
    if (!response.ok)
      throw new Error(`Gemini Web \u8BF7\u6C42\u5931\u8D25\uFF1A${response.status} ${response.statusText}`);
    const raw = await response.text();
    const result = raw.split("\n").map(parseGeminiLine).filter((value) => Boolean(value)).at(-1);
    if (!result)
      throw new Error("Gemini Web \u672A\u8FD4\u56DE\u53EF\u89E3\u6790\u5185\u5BB9\uFF0C\u8BF7\u5237\u65B0 Gemini \u767B\u5F55\u540E\u91CD\u8BD5\u3002");
    return result;
  }
  async function sendGeminiWebMessageStreaming(prompt, model, onChunk) {
    const fullText = await sendGeminiWebMessage(prompt, model, []);
    const CHUNK_DELAY_MS = 30;
    const CHUNK_BATCH_SIZE = 3;
    const chars = Array.from(fullText);
    for (let i = 0; i < chars.length; i += CHUNK_BATCH_SIZE) {
      const chunk = chars.slice(i, i + CHUNK_BATCH_SIZE).join("");
      onChunk(chunk);
      await sleep(CHUNK_DELAY_MS);
    }
    return fullText;
  }
  async function runInlineAiStreaming(payload, sender) {
    const tabId = sender.tab?.id;
    if (!tabId)
      return;
    const pushChunk = (chunk) => {
      chrome.tabs.sendMessage(tabId, { type: "ai-stream-chunk", payload: { chunk } }).catch(() => {
      });
    };
    const stored = await chrome.storage.sync.get("aiConfig");
    const config = { ...DEFAULT_INLINE_AI_CONFIG, ...stored.aiConfig ?? {} };
    const systemPrompt = config.systemPrompt ? `${config.systemPrompt}

` : "";
    const fullPrompt = `${systemPrompt}${payload.prompt || ""}`;
    try {
      const fullText = await sendGeminiWebMessageStreaming(fullPrompt, config.model, pushChunk);
      chrome.tabs.sendMessage(tabId, { type: "ai-stream-done", payload: { text: fullText } }).catch(() => {
      });
    } catch (geminiError) {
      console.warn("[feishu-sync] Gemini Web \u6D41\u5F0F\u5931\u8D25\uFF0C\u964D\u7EA7 DeepSeek Web \u6D41\u5F0F\uFF1A", geminiError);
      try {
        await sendDeepSeekWebMessageStream({ prompt: fullPrompt }, pushChunk);
        chrome.tabs.sendMessage(tabId, { type: "ai-stream-done" }).catch(() => {
        });
      } catch (dsError) {
        const errorInfo = classifyAiError(dsError, (payload.text || "").length);
        chrome.tabs.sendMessage(tabId, { type: "ai-stream-error", payload: errorInfo }).catch(() => {
        });
      }
    }
  }
  var lastSessionCheck = null;
  var lastSessionAlive = false;
  var lastSessionError = "";
  async function checkGeminiSession() {
    try {
      const response = await fetch("https://gemini.google.com/app", { credentials: "include" });
      if (!response.ok) {
        lastSessionAlive = false;
        lastSessionError = `Gemini \u9875\u9762\u8FD4\u56DE HTTP ${response.status}`;
        return { alive: false, error: lastSessionError };
      }
      const html = await response.text();
      const at = extractGeminiToken("SNlM0e", html);
      const bl = extractGeminiToken("cfb2h", html);
      const fSid = extractGeminiToken("FdrFJe", html);
      lastSessionAlive = Boolean(at && bl && fSid);
      lastSessionError = lastSessionAlive ? "" : "Gemini Web \u4F1A\u8BDD\u4EE4\u724C\u4E0D\u53EF\u7528\uFF0C\u8BF7\u6253\u5F00 gemini.google.com \u767B\u5F55\u3002";
      lastSessionCheck = Date.now();
      return { alive: lastSessionAlive, error: lastSessionError };
    } catch (err) {
      lastSessionAlive = false;
      lastSessionError = err instanceof Error ? err.message : String(err);
      lastSessionCheck = Date.now();
      return { alive: false, error: lastSessionError };
    }
  }
  async function broadcastSessionStatus() {
    const status = await checkGeminiSession();
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: "gemini-session-status",
            payload: { alive: status.alive, error: status.error }
          }).catch(() => {
          });
        }
      }
    } catch {
    }
  }
  chrome.runtime.onInstalled.addListener(async (details) => {
    console.log("[feishu-sync] installed/updated:", details.reason);
    const config = await loadConfig();
    if (!config.token) {
      await saveConfig(DEFAULT_CONFIG);
    }
    chrome.storage.sync.get(["aiConfig"], (result) => {
      if (!result.aiConfig) {
        chrome.storage.sync.set({
          aiConfig: {
            provider: "gemini-web",
            apiKey: "",
            baseUrl: "",
            model: "56fdd199312815e2",
            systemPrompt: "\u4F60\u662F\u98DE\u4E66\u540C\u6B65\u63D2\u4EF6\u7684 AI \u52A9\u624B\u3002\u4F60\u53EF\u4EE5\u5E2E\u52A9\u7528\u6237\u7FFB\u8BD1\u3001\u603B\u7ED3\u6587\u6863\uFF0C\u89E3\u7B54 Obsidian \u548C\u98DE\u4E66\u540C\u6B65\u76F8\u5173\u7684\u95EE\u9898\u3002\u8BF7\u7528\u7B80\u6D01\u7684\u4E2D\u6587\u56DE\u7B54\u3002"
          }
        });
      }
    });
    await ensureContextScenes();
    await rebuildContextMenus();
    setTimeout(() => broadcastSessionStatus().catch(() => {
    }), 3e3);
  });
  chrome.runtime.onStartup?.addListener(() => {
    rebuildContextMenus().catch((error) => console.warn("[feishu-sync] context menu rebuild failed:", error));
    setTimeout(() => broadcastSessionStatus().catch(() => {
    }), 3e3);
  });
  async function ensureContextScenes() {
    const stored = await chrome.storage.sync.get("contextScenes");
    const scenes = normalizeContextScenes(stored.contextScenes);
    if (!stored.contextScenes)
      await chrome.storage.sync.set({ contextScenes: scenes });
    return scenes;
  }
  function normalizeContextScenes(input) {
    const fallbackById = new Map(DEFAULT_CONTEXT_SCENES.map((scene) => [scene.id, scene]));
    const rawScenes = Array.isArray(input) && input.length > 0 ? input : DEFAULT_CONTEXT_SCENES;
    const scenes = rawScenes.filter((item) => Boolean(item && typeof item === "object")).map((item) => {
      const fallback = item.id ? fallbackById.get(item.id) : void 0;
      return {
        id: item.id || fallback?.id || "scene",
        label: item.label || fallback?.label || "\u573A\u666F",
        action: item.action || fallback?.action || "showResult",
        prompt: item.prompt ?? fallback?.prompt ?? "{text}",
        enabled: item.enabled ?? fallback?.enabled ?? true,
        defaultDir: item.defaultDir || fallback?.defaultDir || "",
        defaultAppendPath: item.defaultAppendPath || fallback?.defaultAppendPath || "",
        aiEnabled: item.aiEnabled ?? fallback?.aiEnabled ?? true
      };
    }).filter((scene) => scene.id);
    const ids = new Set(scenes.map((scene) => scene.id));
    for (const scene of DEFAULT_CONTEXT_SCENES) {
      if (!ids.has(scene.id))
        scenes.push(scene);
    }
    return scenes;
  }
  async function rebuildContextMenus() {
    await new Promise((resolve) => chrome.contextMenus.removeAll(() => resolve()));
    const scenes = (await ensureContextScenes()).filter((scene) => scene.enabled && scene.action !== "copy");
    for (const scene of scenes) {
      chrome.contextMenus.create({
        id: `context-scene:${scene.id}`,
        title: `\u98DE\u4E66\u540C\u6B65 \xB7 ${scene.label}`,
        contexts: ["selection"]
      });
    }
  }
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!info.menuItemId || typeof info.menuItemId !== "string" || !info.menuItemId.startsWith("context-scene:"))
      return;
    (async () => {
      const sceneId = String(info.menuItemId).replace("context-scene:", "");
      const scenes = await ensureContextScenes();
      const scene = scenes.find((item) => item.id === sceneId);
      if (!scene || !tab?.id)
        return;
      const selectedText = info.selectionText || "";
      const prompt = fillScenePrompt(scene.prompt, {
        text: selectedText,
        title: tab.title || "",
        url: tab.url || "",
        domain: getHostname(tab.url || ""),
        date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
      });
      if (scene.action === "showResult") {
        const sidePanel = chrome.sidePanel;
        if (sidePanel.open)
          await sidePanel.open({ tabId: tab.id });
        setTimeout(() => {
          chrome.runtime.sendMessage({
            type: "ai-prompt",
            payload: { action: scene.id, label: scene.label, text: prompt, title: tab.title || "", url: tab.url || "" }
          });
        }, 400);
        return;
      }
      if (scene.action === "save" || scene.action === "append" || scene.action === "refine" || scene.action === "openSidepanel") {
        const sidePanel = chrome.sidePanel;
        if (sidePanel.open)
          await sidePanel.open({ tabId: tab.id });
        setTimeout(() => {
          chrome.runtime.sendMessage({
            type: "clip-data",
            payload: {
              text: selectedText,
              title: tab.title || "",
              url: tab.url || "",
              description: "",
              favicon: tab.favIconUrl || "",
              domain: getHostname(tab.url || ""),
              sceneId: scene.id,
              sceneLabel: scene.label,
              sceneAction: scene.action,
              prompt,
              defaultDir: scene.defaultDir || "",
              appendPath: scene.defaultAppendPath || "",
              aiEnabled: scene.aiEnabled
            }
          });
        }, 400);
        return;
      }
    })().catch((error) => console.warn("[feishu-sync] context menu action failed:", error));
  });
  function fillScenePrompt(template, values) {
    return template.replace(/\{text\}/g, values.text).replace(/\{title\}/g, values.title).replace(/\{url\}/g, values.url).replace(/\{domain\}/g, values.domain).replace(/\{date\}/g, values.date).replace(/\{context\}/g, values.context || "");
  }
  function getHostname(url) {
    try {
      return url ? new URL(url).hostname : "";
    } catch {
      return "";
    }
  }
  function buildSilentClipMarkdown(payload) {
    const title = String(payload.title || "\u7F51\u9875\u526A\u85CF").trim();
    const url = String(payload.url || "").trim();
    const text = String(payload.text || "").trim();
    const description = String(payload.description || "").trim();
    return [
      `# ${title}`,
      "",
      url ? `\u6765\u6E90\uFF1A${url}` : "",
      description ? `> ${description}` : "",
      "",
      text || "\uFF08\u672A\u8BFB\u53D6\u5230\u9009\u4E2D\u6587\u672C\uFF09"
    ].filter((line) => line !== "").join("\n");
  }
  function draftSilentKeywords(text) {
    return Array.from(new Set(String(text).replace(/[^\p{L}\p{N}\u4e00-\u9fa5]+/gu, " ").split(/\s+/).map((item) => item.trim()).filter((item) => item.length >= 2 && item.length <= 12).slice(0, 6)));
  }
  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === "ai-tool") {
      (async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id)
          throw new Error("\u672A\u627E\u5230\u5F53\u524D\u7F51\u9875\u6807\u7B7E\u9875\u3002");
        const action = message.payload?.action;
        const userInstruction = typeof message.payload?.text === "string" ? message.payload.text.trim() : "";
        const page = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const selection = window.getSelection()?.toString() || "";
            const text = (selection || document.body.innerText || "").slice(0, 12e3);
            const elements = Array.from(document.querySelectorAll('a,button,input,textarea,select,[role="button"],[role="link"]')).slice(0, 80).map((element, index) => {
              const htmlElement = element;
              return {
                index,
                tag: element.tagName.toLowerCase(),
                role: element.getAttribute("role") || "",
                text: (htmlElement.innerText || htmlElement.getAttribute("aria-label") || htmlElement.getAttribute("placeholder") || "").trim().slice(0, 120),
                href: element instanceof HTMLAnchorElement ? element.href : "",
                disabled: element instanceof HTMLButtonElement || element instanceof HTMLInputElement ? element.disabled : false
              };
            }).filter((item) => item.text || item.href);
            return { title: document.title, url: location.href, selection, text, elements };
          }
        });
        const context = page[0]?.result || { title: tab.title || "", url: tab.url || "", text: "" };
        const payload = { action, title: context.title, url: context.url, text: context.text, selection: context.selection || "", elements: context.elements || [], userInstruction };
        if (action === "screenshot-translate" || action === "ocr" || action === "screen-shot") {
          payload.imageDataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
        }
        if (action === "browser-control") {
          const debuggee = { tabId: tab.id };
          try {
            await chrome.debugger.attach(debuggee, "1.3");
            const result = await chrome.debugger.sendCommand(debuggee, "Runtime.evaluate", {
              expression: `(() => ({
              title: document.title,
              url: location.href,
              selection: window.getSelection()?.toString() || '',
              viewport: { width: innerWidth, height: innerHeight },
              scroll: { x: scrollX, y: scrollY },
              interactive: Array.from(document.querySelectorAll('a,button,input,textarea,select,[role="button"],[role="link"]')).slice(0, 80).map((el, index) => ({
                index,
                tag: el.tagName.toLowerCase(),
                text: (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').trim().slice(0, 120),
                href: el.href || '',
                rect: (() => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })()
              }))
            }))()`,
              returnByValue: true
            });
            payload.debugTarget = result.result?.value;
          } finally {
            chrome.debugger.detach(debuggee).catch(() => void 0);
          }
        }
        chrome.runtime.sendMessage({ type: "ai-prompt", payload });
      })().catch((error) => chrome.runtime.sendMessage({ type: "ai-prompt", payload: { action: "error", text: error instanceof Error ? error.message : String(error) } }));
      sendResponse({ ok: true });
      return true;
    }
    if (message.type === "TEST_CONNECTION") {
      loadConfig().then(testConnection).then(sendResponse).catch((err) => sendResponse({ ok: false, message: String(err) }));
      return true;
    }
    if (message.type === "GET_STATUS") {
      loadConfig().then(async (config) => {
        try {
          const { getStatus: getStatus2 } = await Promise.resolve().then(() => (init_client(), client_exports));
          sendResponse({ ok: true, status: await getStatus2(config) });
        } catch (err) {
          sendResponse({ ok: false, message: String(err) });
        }
      });
      return true;
    }
    if (message.type === "ai-inline") {
      runInlineAiWithRetry(message.payload ?? {}).then((text) => {
        if (!text || !text.trim()) {
          sendResponse({ error: "AI \u672A\u8FD4\u56DE\u5185\u5BB9", errorType: "EMPTY_RESULT" });
          return;
        }
        sendResponse({ text });
      }).catch((error) => {
        const errorInfo = classifyAiError(error, (message.payload?.text || "").length);
        sendResponse({ error: errorInfo.message, errorType: errorInfo.errorType });
      });
      return true;
    }
    if (message.type === "ai-inline-stream") {
      runInlineAiStreaming(message.payload ?? {}, sender).catch((error) => {
        console.warn("[feishu-sync] ai-inline-stream error:", error);
      });
      sendResponse({ ok: true });
      return true;
    }
    if (message.type === "ai-inline-deepseek-web") {
      const text = message.payload?.text || "";
      if (!text) {
        sendResponse({ error: "\u8BF7\u8F93\u5165\u5185\u5BB9" });
        return true;
      }
      try {
        const result = await withTimeout(
          sendDeepSeekWebMessage({ prompt: text }),
          AI_TIMEOUT_MS,
          AI_TIMEOUT_MESSAGE
        );
        sendResponse({ text: result });
      } catch (error) {
        sendResponse({ error: error instanceof Error ? error.message : String(error) });
      }
      return true;
    }
    if (message.type === "REBUILD_CONTEXT_MENUS") {
      rebuildContextMenus().then(() => sendResponse({ ok: true })).catch((error) => sendResponse({ ok: false, message: error instanceof Error ? error.message : String(error) }));
      return true;
    }
    if (message.type === "clip-to-obsidian") {
      (async () => {
        const tab = sender.tab;
        if (!tab?.id)
          return;
        const payload = message.payload || {};
        console.log("[feishu-sync] clip-to-obsidian:", payload);
        try {
          if (payload.openMode === "silent" && payload.sceneAction === "save" && payload.aiEnabled !== true && typeof payload.defaultDir === "string" && payload.defaultDir.trim()) {
            const config = await loadConfig();
            await postClip(config, {
              title: payload.title || tab.title || "\u7F51\u9875\u526A\u85CF",
              url: payload.url || tab.url || "",
              sourceKind: "selection",
              text: payload.text || "",
              rawText: payload.text || "",
              bodyMarkdown: buildSilentClipMarkdown(payload),
              description: payload.description || "",
              dir: payload.defaultDir.trim(),
              meta: {
                \u6807\u7B7E: "S",
                \u7F16\u7801: "",
                \u8F93\u5165: payload.defaultDir.trim(),
                \u65E5\u671F: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
                \u5173\u952E\u8BCD: draftSilentKeywords(`${payload.title || ""} ${payload.text || ""}`).join("\u3001") || "\u7F51\u9875\u526A\u5B58",
                \u6982\u8FF0: String(payload.description || payload.text || payload.title || "\u7F51\u9875\u526A\u5B58").slice(0, 160),
                \u8BC4\u5206: 1,
                \u8BC4\u5206_\u663E\u793A: "\u{1F31F}\xB7\u7D20\u6750"
              }
            });
            return;
          }
          const sidePanel = chrome.sidePanel;
          if (sidePanel.open) {
            await sidePanel.open({ tabId: tab.id });
          }
          setTimeout(() => {
            chrome.runtime.sendMessage({
              type: "clip-data",
              payload: {
                text: payload.text || "",
                title: payload.title || tab.title || "",
                url: payload.url || tab.url || "",
                description: payload.description || "",
                favicon: payload.favicon || "",
                docToken: payload.docToken || null,
                domain: payload.domain || "",
                sceneId: payload.sceneId || "",
                sceneLabel: payload.sceneLabel || "",
                sceneAction: payload.sceneAction || "",
                prompt: payload.prompt || "",
                defaultDir: payload.defaultDir || "",
                appendPath: payload.appendPath || "",
                aiEnabled: payload.aiEnabled === true,
                openMode: payload.openMode || "confirmInSidepanel"
              }
            });
          }, 500);
        } catch (e) {
          console.error("[feishu-sync] clip error:", e);
        }
      })();
      sendResponse({ ok: true });
      return true;
    }
    if (message.type === "feishu-sync-trigger") {
      (async () => {
        const tab = sender.tab;
        if (!tab?.id)
          return;
        const payload = message.payload || {};
        try {
          const sidePanel = chrome.sidePanel;
          if (sidePanel.open) {
            await sidePanel.open({ tabId: tab.id });
          }
          setTimeout(() => {
            chrome.runtime.sendMessage({
              type: "clip-data",
              payload: {
                text: "",
                title: payload.title || tab.title || "",
                url: payload.url || tab.url || "",
                description: payload.description || "",
                docToken: payload.docToken || null,
                domain: payload.domain || "",
                triggerSync: true,
                obsidianUri: payload.obsidianUri || null,
                protocolFailed: payload.protocolFailed === true
              }
            });
          }, 500);
        } catch (e) {
          console.error("[feishu-sync] feishu-sync-trigger error:", e);
        }
      })();
      sendResponse({ ok: true });
      return true;
    }
    if (message.type === "query-gemini-session") {
      if (lastSessionCheck && Date.now() - lastSessionCheck < 3e4) {
        sendResponse({ alive: lastSessionAlive, error: lastSessionError });
      } else {
        checkGeminiSession().then((status) => sendResponse(status)).catch(() => sendResponse({ alive: false, error: "\u68C0\u67E5\u5931\u8D25" }));
      }
      return true;
    }
    if (message.type === "set-deepseek-token") {
      const token = message.payload?.token || "";
      setDeepSeekToken(token).then(() => sendResponse({ ok: true, hasToken: isValidToken(token) }));
      return true;
    }
    if (message.type === "get-deepseek-token") {
      getDeepSeekToken().then((token) => sendResponse({ token: token || "", hasToken: isValidToken(token) }));
      return true;
    }
    if (message.type === "ai-chat") {
      (async () => {
        const tab = sender.tab;
        if (!tab?.id)
          return;
        try {
          const payload = { ...message.payload ?? {} };
          if (payload.action === "screen-shot" || payload.action === "screenshot-translate" || payload.action === "ocr") {
            try {
              payload.imageDataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
                format: "png"
              });
            } catch (captureErr) {
              payload.captureError = captureErr instanceof Error ? captureErr.message : String(captureErr);
            }
          }
          const sidePanel = chrome.sidePanel;
          if (sidePanel.open) {
            await sidePanel.open({ tabId: tab.id });
          }
          setTimeout(() => {
            chrome.runtime.sendMessage({
              type: "ai-prompt",
              payload
            });
          }, 500);
        } catch (e) {
          console.error("[feishu-sync] ai error:", e);
        }
      })();
      sendResponse({ ok: true });
      return true;
    }
    return false;
  });
  chrome.alarms?.create("health-check", { periodInMinutes: 5 });
  chrome.alarms?.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== "health-check")
      return;
    const config = await loadConfig();
    if (!config.token) {
      chrome.action.setBadgeText({ text: "!" });
      chrome.action.setBadgeBackgroundColor({ color: "#999" });
      return;
    }
    const result = await testConnection(config);
    chrome.action.setBadgeText({ text: result.ok ? "\u2713" : "\u2717" });
    chrome.action.setBadgeBackgroundColor({ color: result.ok ? "#07C160" : "#d93025" });
  });
  console.log("[feishu-sync] background v3.0.1 loaded");
})();
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.2.0 https://github.com/nodeca/js-yaml @license MIT *)

js-sha3/src/sha3.js:
  (**
   * [js-sha3]{@link https://github.com/emn178/js-sha3}
   *
   * @version 0.9.3
   * @author Chen, Yi-Cyuan [emn178@gmail.com]
   * @copyright Chen, Yi-Cyuan 2015-2023
   * @license MIT
   *)
*/
//# sourceMappingURL=background.js.map
