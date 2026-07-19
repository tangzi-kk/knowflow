"use strict";
(() => {
  // ../packages/shared/dist/protocol.js
  var DEFAULT_PORT = 4567;
  var TOKEN_HEADER = "X-Sync-Token";
  var OBSIDIAN_LARK_DOC_ACTION = "lark-doc";
  var OBSIDIAN_LARK_DOC_URI_PREFIX = `obsidian://${OBSIDIAN_LARK_DOC_ACTION}`;

  // ../node_modules/js-yaml/dist/js-yaml.mjs
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
    tags;
    implicitScalarTags;
    implicitScalarByFirstChar;
    implicitScalarAnyFirstChar;
    defaultScalarTag;
    defaultSequenceTag;
    defaultMappingTag;
    exact;
    prefix;
    constructor(tags) {
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
  var DEFAULT_CONSTRUCTOR_OPTIONS = {
    filename: "",
    schema: CORE_SCHEMA,
    json: false,
    maxTotalMergeKeys: 1e4,
    maxAliases: -1
  };
  var NS_URI_CHAR = String.raw`(?:%[0-9A-Fa-f]{2}|[0-9A-Za-z\-#;/?:@&=+$,_.!~*'()\[\]])`;
  var NS_TAG_CHAR = String.raw`(?:%[0-9A-Fa-f]{2}|[0-9A-Za-z\-#;/?:@&=+$.~*'()_])`;
  var PATTERN_TAG_URI = new RegExp(`^(?:${NS_URI_CHAR})*$`);
  var PATTERN_TAG_SUFFIX = new RegExp(`^(?:${NS_TAG_CHAR})+$`);
  var PATTERN_TAG_PREFIX = new RegExp(`^(?:!(?:${NS_URI_CHAR})*|${NS_TAG_CHAR}(?:${NS_URI_CHAR})*)$`);
  var DEFAULT_PARSER_OPTIONS = {
    filename: "",
    maxDepth: 100
  };
  var DEFAULT_LOAD_OPTIONS = {
    ...DEFAULT_PARSER_OPTIONS,
    ...DEFAULT_CONSTRUCTOR_OPTIONS
  };
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

  // src/storage.ts
  var CANONICAL_SCHEMA = 1;
  var LOCAL_SECRET_KEYS = {
    syncToken: "syncToken",
    aiApiKey: "aiApiKey",
    interpreterApiKey: "interpreterApiKey",
    deepseekToken: "deepseek_web_token"
  };
  var LOCAL_ENVELOPE_KEYS = {
    syncConfig: "knowflow_sync_config_v1",
    aiConfig: "knowflow_ai_config_v1",
    interpreterConfig: "knowflow_interpreter_config_v1",
    deepseekToken: "knowflow_deepseek_token_v1"
  };
  var SYNC_CONFIG_STORAGE = {
    syncKey: "syncConfig",
    secretField: "token",
    localSecretKey: LOCAL_SECRET_KEYS.syncToken,
    envelopeKey: LOCAL_ENVELOPE_KEYS.syncConfig
  };
  var AI_CONFIG_STORAGE = {
    syncKey: "aiConfig",
    secretField: "apiKey",
    localSecretKey: LOCAL_SECRET_KEYS.aiApiKey,
    envelopeKey: LOCAL_ENVELOPE_KEYS.aiConfig
  };
  var INTERPRETER_CONFIG_STORAGE = {
    syncKey: "interpreterConfig",
    secretField: "apiKey",
    localSecretKey: LOCAL_SECRET_KEYS.interpreterApiKey,
    envelopeKey: LOCAL_ENVELOPE_KEYS.interpreterConfig
  };
  function chromeStorage() {
    return {
      sync: chrome.storage.sync,
      local: chrome.storage.local
    };
  }
  function storageOrDefault(storage) {
    return storage ?? chromeStorage();
  }
  function asObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value) ? value : null;
  }
  function newRevision() {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
  function sameData(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
  }
  function parseEnvelope(value, key) {
    if (value === void 0) return null;
    const record = asObject(value);
    if (!record || record.schema !== CANONICAL_SCHEMA || typeof record.revision !== "string" || typeof record.verified !== "boolean" || !asObject(record.config)) {
      throw new Error(`Invalid canonical envelope: ${key}`);
    }
    return record;
  }
  async function readEnvelope(key, storage) {
    const result = await storage.local.get(key);
    return parseEnvelope(result[key], key);
  }
  async function writeCanonicalEnvelope(key, config, storage) {
    const revision = newRevision();
    const pending = {
      schema: CANONICAL_SCHEMA,
      revision,
      verified: false,
      config
    };
    await storage.local.set({ [key]: pending });
    const pendingReadback = await readEnvelope(key, storage);
    if (!pendingReadback || !sameData(pendingReadback, pending)) {
      throw new Error(`Failed to verify pending canonical envelope: ${key}`);
    }
    const committed = { ...pending, verified: true };
    await storage.local.set({ [key]: committed });
    const committedReadback = await readEnvelope(key, storage);
    if (!committedReadback || !sameData(committedReadback, committed)) {
      throw new Error(`Failed to verify canonical envelope: ${key}`);
    }
    return committed;
  }
  function withoutSecret(config, secretField) {
    const projection = { ...config };
    delete projection[secretField];
    return projection;
  }
  async function cleanupLegacyConfig(spec, config, storage) {
    await storage.sync.set({
      [spec.syncKey]: withoutSecret(config, spec.secretField)
    });
    await storage.local.remove(spec.localSecretKey);
  }
  async function migrateConfig(defaults, spec, storage) {
    const existing = await readEnvelope(spec.envelopeKey, storage);
    if (existing) {
      if (!existing.verified) {
        throw new Error(`Unverified canonical envelope: ${spec.envelopeKey}`);
      }
      try {
        await cleanupLegacyConfig(
          spec,
          existing.config,
          storage
        );
      } catch {
      }
      return existing;
    }
    const [syncResult, localResult] = await Promise.all([
      storage.sync.get(spec.syncKey),
      storage.local.get(spec.localSecretKey)
    ]);
    const legacyConfig = asObject(syncResult[spec.syncKey]) ?? {};
    const syncSecret = legacyConfig[spec.secretField];
    const localSecret = localResult[spec.localSecretKey];
    if (syncSecret !== void 0 && typeof syncSecret !== "string") {
      throw new Error(`Invalid legacy secret in ${spec.syncKey}.${spec.secretField}`);
    }
    if (localSecret !== void 0 && typeof localSecret !== "string") {
      throw new Error(`Invalid local secret in ${spec.localSecretKey}`);
    }
    if (typeof syncSecret === "string" && syncSecret.length > 0 && typeof localSecret === "string" && localSecret.length > 0 && syncSecret !== localSecret) {
      throw new Error(`Legacy secret conflict: ${spec.syncKey}`);
    }
    const secret = typeof localSecret === "string" && localSecret.length > 0 ? localSecret : typeof syncSecret === "string" ? syncSecret : "";
    const config = {
      ...defaults,
      ...legacyConfig,
      [spec.secretField]: secret
    };
    const envelope = await writeCanonicalEnvelope(spec.envelopeKey, config, storage);
    await cleanupLegacyConfig(spec, config, storage);
    return envelope;
  }
  async function loadSecretBackedConfig(defaults, spec, storage) {
    const envelope = await migrateConfig(defaults, spec, storageOrDefault(storage));
    return { ...defaults, ...envelope.config };
  }
  async function saveSecretBackedConfig(config, spec, storage) {
    const record = asObject(config);
    if (!record || typeof record[spec.secretField] !== "string") {
      throw new Error(`Invalid secret value for ${spec.secretField}`);
    }
    const areas = storageOrDefault(storage);
    await writeCanonicalEnvelope(spec.envelopeKey, config, areas);
    await cleanupLegacyConfig(spec, record, areas);
  }

  // src/client.ts
  var DEFAULT_CONFIG = {
    host: "127.0.0.1",
    port: DEFAULT_PORT,
    token: ""
  };
  async function loadConfig() {
    return loadSecretBackedConfig(DEFAULT_CONFIG, SYNC_CONFIG_STORAGE);
  }
  async function saveConfig(config) {
    await saveSecretBackedConfig(config, SYNC_CONFIG_STORAGE);
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

  // src/popup/popup.ts
  var $ = (id) => document.getElementById(id);
  async function init() {
    const config = await loadConfig();
    $("host").value = config.host;
    $("port").value = String(config.port);
    $("token").value = config.token;
    if (config.token) {
      checkStatus(config);
    } else {
      updateStatus(false);
    }
    $("save-btn").onclick = async () => {
      const newConfig = {
        host: $("host").value.trim() || "127.0.0.1",
        port: parseInt($("port").value, 10) || 4567,
        token: $("token").value.trim()
      };
      await saveConfig(newConfig);
      showResult("\u5DF2\u4FDD\u5B58", "success");
      checkStatus(newConfig);
    };
    $("test-btn").onclick = async () => {
      const newConfig = {
        host: $("host").value.trim() || "127.0.0.1",
        port: parseInt($("port").value, 10) || 4567,
        token: $("token").value.trim()
      };
      showResult("\u6D4B\u8BD5\u4E2D...", "success");
      const result = await testConnection(newConfig);
      showResult(result.message, result.ok ? "success" : "error");
      updateStatus(result.ok);
    };
    $("open-sidepanel-btn").onclick = async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        showResult("\u65E0\u6CD5\u8BC6\u522B\u5F53\u524D\u6807\u7B7E\u9875", "error");
        return;
      }
      try {
        const sidePanel = chrome.sidePanel;
        await sidePanel.open({ tabId: tab.id });
        window.close();
      } catch (err) {
        showResult(`\u4FA7\u8FB9\u680F\u6253\u5F00\u5931\u8D25\uFF1A${err instanceof Error ? err.message : String(err)}`, "error");
      }
    };
    $("open-settings-btn").onclick = () => {
      chrome.tabs.create({ url: chrome.runtime.getURL("settings.html?section=general") });
    };
    $("open-ai-btn").onclick = async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        const sidePanel = chrome.sidePanel;
        sidePanel.open({ tabId: tab.id });
        setTimeout(() => {
          chrome.runtime.sendMessage({ type: "ai-chat", payload: { action: "ai-chat", text: "" } }).catch(() => {
          });
        }, 500);
      }
    };
    const toolbarToggle = document.getElementById("toolbar-enabled");
    if (toolbarToggle) {
      chrome.storage.sync.get(["toolbarEnabled"], (result) => {
        toolbarToggle.checked = result.toolbarEnabled !== false;
      });
      toolbarToggle.addEventListener("change", () => {
        chrome.storage.sync.set({ toolbarEnabled: toolbarToggle.checked });
        chrome.tabs.query({}, (tabs) => {
          for (const tab of tabs) {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, {
                type: "toolbar-toggle",
                payload: { enabled: toolbarToggle.checked }
              }).catch(() => {
              });
            }
          }
        });
      });
    }
  }
  async function checkStatus(config) {
    try {
      const status = await getStatus(config);
      const ok = status.larkReady;
      const recentFailure = status.recentActivity?.find((item) => item.status === "failed");
      updateStatus(ok, recentFailure ? `${status.vault} \xB7 \u6700\u8FD1\u5931\u8D25 ${recentFailure.errorCode || recentFailure.kind}` : status.vault);
    } catch {
      updateStatus(false);
    }
  }
  function updateStatus(ok, vault) {
    const bar = $("status-bar");
    const text = $("status-text");
    const label = $("vault-label");
    if (ok) {
      bar.className = "status-bar status-ok";
      text.textContent = "\u5DF2\u8FDE\u63A5";
      if (vault) {
        label.textContent = vault;
        label.style.display = "";
      } else {
        label.style.display = "none";
      }
    } else {
      bar.className = "status-bar status-error";
      text.textContent = "\u672A\u8FDE\u63A5";
      label.style.display = "none";
    }
  }
  function showResult(message, type) {
    const el = $("result");
    el.textContent = message;
    el.className = `result show ${type}`;
  }
  init();
})();
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 5.2.1 https://github.com/nodeca/js-yaml @license MIT *)
*/
//# sourceMappingURL=popup.js.map
