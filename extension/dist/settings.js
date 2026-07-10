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

  // src/settings/settings.ts
  var $ = (id) => document.getElementById(id);
  var PROPERTY_FIELDS = [
    { key: "\u6807\u7B7E", label: "\u6807\u7B7E", kind: "text" },
    { key: "\u7F16\u7801", label: "\u7F16\u7801", kind: "text" },
    { key: "\u8F93\u5165", label: "\u8F93\u5165", kind: "text" },
    { key: "\u65E5\u671F", label: "\u65E5\u671F", kind: "text" },
    { key: "\u65E5\u671F\u7D22\u5F15", label: "\u65E5\u671F\u7D22\u5F15", kind: "list" },
    { key: "\u5173\u952E\u8BCD", label: "\u5173\u952E\u8BCD", kind: "text" },
    { key: "\u6982\u8FF0", label: "\u6982\u8FF0", kind: "text" },
    { key: "\u8BC4\u5206", label: "\u8BC4\u5206", kind: "number" },
    { key: "\u8BC4\u5206_\u663E\u793A", label: "\u8BC4\u5206\u663E\u793A", kind: "text" },
    { key: "\u7D22\u5F15_\u77E5\u8BC6\u5E93", label: "\u7D22\u5F15_\u77E5\u8BC6\u5E93", kind: "text" },
    { key: "\u7D22\u5F15_\u989C\u8272", label: "\u7D22\u5F15_\u989C\u8272", kind: "text" },
    { key: "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988", label: "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988", kind: "text" },
    { key: "\u7D22\u5F15_\u5757", label: "\u7D22\u5F15_\u5757", kind: "list" },
    { key: "\u7D22\u5F15_\u98CE\u9669", label: "\u7D22\u5F15_\u98CE\u9669", kind: "list" }
  ];
  var OPTION_FIELDS = [
    { key: "\u6807\u7B7E", label: "\u6807\u7B7E\u9009\u9879" },
    { key: "\u65E5\u671F\u7D22\u5F15", label: "\u65E5\u671F\u7D22\u5F15\u9009\u9879" },
    { key: "\u8BC4\u5206", label: "\u8BC4\u5206\u9009\u9879" },
    { key: "\u8BC4\u5206_\u663E\u793A", label: "\u8BC4\u5206\u663E\u793A\u9009\u9879" },
    { key: "\u7D22\u5F15_\u77E5\u8BC6\u5E93", label: "\u77E5\u8BC6\u5E93\u7D22\u5F15" },
    { key: "\u7D22\u5F15_\u989C\u8272", label: "\u989C\u8272\u7D22\u5F15" },
    { key: "\u7D22\u5F15_\u64CD\u4F5C&\u53CD\u9988", label: "\u64CD\u4F5C\u53CD\u9988\u7D22\u5F15" },
    { key: "\u7D22\u5F15_\u5757", label: "\u5757\u7D22\u5F15" },
    { key: "\u7D22\u5F15_\u98CE\u9669", label: "\u98CE\u9669\u7D22\u5F15" }
  ];
  var DEFAULT_AI_CONFIG = {
    provider: "gemini-web",
    apiKey: "",
    baseUrl: "",
    model: "56fdd199312815e2",
    systemPrompt: "\u4F60\u662F\u98DE\u4E66\u540C\u6B65\u63D2\u4EF6\u7684 AI \u52A9\u624B\u3002\u4F60\u53EF\u4EE5\u5E2E\u52A9\u7528\u6237\u7FFB\u8BD1\u3001\u603B\u7ED3\u6587\u6863\uFF0C\u89E3\u7B54 Obsidian \u548C\u98DE\u4E66\u540C\u6B65\u76F8\u5173\u7684\u95EE\u9898\u3002\u8BF7\u7528\u7B80\u6D01\u7684\u4E2D\u6587\u56DE\u7B54\u3002"
  };
  var DEFAULT_CONTEXT_SCENES = [
    { id: "save", label: "\u6536\u5B58", action: "save", prompt: "{text}", enabled: true, aiEnabled: false },
    { id: "append", label: "\u8865\u5145", action: "append", prompt: "{text}", enabled: true, aiEnabled: false },
    { id: "refine", label: "\u7CBE\u70BC", action: "refine", prompt: "\u8BF7\u628A\u4EE5\u4E0B\u5185\u5BB9\u6574\u7406\u6210 Obsidian \u77E5\u8BC6\u5361\u7247\uFF1A\n\n\u8F93\u51FA\u7ED3\u6784\uFF1A\n## \u6838\u5FC3\u89C2\u70B9\n## \u5173\u952E\u8981\u70B9\n## \u53EF\u590D\u7528\u542F\u53D1\n## \u76F8\u5173\u5173\u952E\u8BCD\n\n\u8981\u6C42\uFF1A\n- \u4E0D\u8981\u7A7A\u6CDB\u603B\u7ED3\u3002\n- \u4FDD\u7559\u6709\u4FE1\u606F\u5BC6\u5EA6\u7684\u539F\u53E5\u3002\n- \u5982\u679C\u5185\u5BB9\u5F88\u77ED\uFF0C\u5C31\u76F4\u63A5\u56F4\u7ED5\u8FD9\u53E5\u8BDD\u5C55\u5F00\u3002\n- \u7528\u4E2D\u6587\u8F93\u51FA\u3002\n\n\u5185\u5BB9\uFF1A\n{text}", enabled: true, aiEnabled: true },
    { id: "translate-explain", label: "\u8BD1\u89E3", action: "showResult", prompt: "\u8BF7\u4E0D\u8981\u505A\u9010\u5B57\u7FFB\u8BD1\u3002\u8BF7\u628A\u4EE5\u4E0B\u5185\u5BB9\u8F6C\u6362\u6210\u6211\u80FD\u653E\u5165 Obsidian \u7684\u201C\u6982\u5FF5\u7406\u89E3\u7B14\u8BB0\u201D\uFF1A\n\n\u8981\u6C42\uFF1A\n1. \u5148\u7ED9\u81EA\u7136\u4E2D\u6587\u89E3\u91CA\u3002\n2. \u4FDD\u7559\u5173\u952E\u539F\u6587\u672F\u8BED\uFF0C\u5E76\u89E3\u91CA\u5B83\u4EEC\u7684\u542B\u4E49\u3002\n3. \u5982\u679C\u539F\u6587\u6709\u9690\u542B\u80CC\u666F\uFF0C\u8BF7\u8865\u51FA\u6765\u3002\n4. \u7ED9\u4E00\u4E2A\u6211\u80FD\u590D\u7528\u7684\u4F8B\u5B50\u3002\n5. \u6700\u540E\u7ED9 3-5 \u4E2A\u5173\u952E\u8BCD\u3002\n\n\u5185\u5BB9\uFF1A\n{text}\n\n\u6765\u6E90\uFF1A\n{title}\n{url}", enabled: true, aiEnabled: true },
    { id: "concept-card", label: "\u6982\u5FF5\u5361", action: "showResult", prompt: "\u8BF7\u628A\u4EE5\u4E0B\u5185\u5BB9\u6574\u7406\u6210\u4E00\u4E2A Obsidian \u6982\u5FF5\u5361\uFF1A\n\n\u8F93\u51FA\u7ED3\u6784\uFF1A\n## \u5B9A\u4E49\n## \u80CC\u666F\n## \u4F8B\u5B50\n## \u5BB9\u6613\u8BEF\u89E3\u7684\u70B9\n## \u5173\u8054\u6982\u5FF5\n\n\u5185\u5BB9\uFF1A\n{text}", enabled: true, aiEnabled: true },
    { id: "quote", label: "\u91D1\u53E5", action: "showResult", prompt: "\u8BF7\u628A\u4EE5\u4E0B\u9009\u4E2D\u6587\u672C\u6574\u7406\u6210\u201C\u91D1\u53E5/\u6D1E\u5BDF\u5361\u7247\u201D\uFF1A\n\n\u8F93\u51FA\u7ED3\u6784\uFF1A\n> \u539F\u53E5\n\n## \u8FD9\u53E5\u8BDD\u7684\u542B\u4E49\n## \u4E3A\u4EC0\u4E48\u91CD\u8981\n## \u6211\u53EF\u4EE5\u600E\u4E48\u7528\n## \u5173\u952E\u8BCD\n\n\u5185\u5BB9\uFF1A\n{text}", enabled: true, aiEnabled: true },
    { id: "question", label: "\u95EE\u9898", action: "showResult", prompt: "\u8BF7\u628A\u4EE5\u4E0B\u5185\u5BB9\u8F6C\u6210\u540E\u7EED\u53EF\u63A2\u7D22\u7684\u95EE\u9898\uFF1A\n\n\u8F93\u51FA\u7ED3\u6784\uFF1A\n## \u6838\u5FC3\u95EE\u9898\n## \u53EF\u80FD\u7B54\u6848\n## \u8FD8\u9700\u8981\u67E5\u4EC0\u4E48\n## \u9002\u5408\u653E\u5165 Obsidian \u7684\u8FFD\u95EE\n\n\u5185\u5BB9\uFF1A\n{text}", enabled: true, aiEnabled: true },
    { id: "copy", label: "\u590D\u5236", action: "copy", prompt: "{text}", enabled: true, aiEnabled: false },
    { id: "open-sidepanel", label: "\u6253\u5F00\u4FA7\u8FB9\u680F", action: "openSidepanel", prompt: "{text}", enabled: true, aiEnabled: false }
  ];
  var DEFAULT_SELECTION_TOOLBAR_CONFIG = {
    enabled: true,
    defaultAction: "append",
    saveBehavior: "confirmInSidepanel",
    defaultAppendPath: "",
    aiBeforeSave: false,
    visibleActions: DEFAULT_CONTEXT_SCENES.map((scene) => scene.id)
  };
  async function init() {
    const [config, template, options, interpreter] = await Promise.all([
      loadConfig(),
      loadPropertyTemplate(),
      loadPropertyOptions(),
      loadInterpreterConfig()
    ]);
    renderConfig(config);
    renderPropertyFields(template);
    renderPropertyOptions(options);
    renderInterpreter(interpreter);
    await renderAiConfig();
    await renderContextScenes();
    bindEvents();
    applySectionFromUrl();
    window.addEventListener("popstate", applySectionFromUrl);
  }
  function bindEvents() {
    document.querySelectorAll("[data-section-link]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const section = link.dataset.sectionLink || "general";
        history.pushState(null, "", `?section=${encodeURIComponent(section)}`);
        applySectionFromUrl();
      });
    });
    $("save-config-btn").addEventListener("click", async () => {
      const config = readConfig();
      await saveConfig(config);
      showResult("\u8FDE\u63A5\u8BBE\u7F6E\u5DF2\u4FDD\u5B58");
    });
    $("test-btn").addEventListener("click", async () => {
      showResult("\u6B63\u5728\u6D4B\u8BD5\u8FDE\u63A5...");
      const result = await testConnection(readConfig());
      showResult(result.message, result.ok ? "success" : "error");
    });
    $("save-template-btn").addEventListener("click", async () => {
      await Promise.all([
        savePropertyTemplate(readPropertyTemplate()),
        savePropertyOptions(readPropertyOptions())
      ]);
      showResult("\u5C5E\u6027\u6A21\u677F\u4E0E\u4E0B\u62C9\u9009\u9879\u5DF2\u4FDD\u5B58");
    });
    $("reset-template-btn").addEventListener("click", async () => {
      renderPropertyFields(DEFAULT_PROPERTY_TEMPLATE);
      renderPropertyOptions(DEFAULT_PROPERTY_OPTIONS);
      await Promise.all([
        savePropertyTemplate(DEFAULT_PROPERTY_TEMPLATE),
        savePropertyOptions(DEFAULT_PROPERTY_OPTIONS)
      ]);
      showResult("\u5DF2\u6062\u590D\u5BFC\u5F15\u9ED8\u8BA4\u9009\u9879");
    });
    $("save-interpreter-btn").addEventListener("click", async () => {
      await saveInterpreterConfig(readInterpreter());
      showResult("AI \u89E3\u91CA\u5668\u8BBE\u7F6E\u5DF2\u4FDD\u5B58");
    });
    $("save-ai-config-btn").addEventListener("click", async () => {
      await saveAiConfig(readAiConfig());
      showResult("AI \u52A9\u624B\u914D\u7F6E\u5DF2\u4FDD\u5B58");
    });
    $("save-context-scenes-btn").addEventListener("click", async () => {
      await Promise.all([
        saveContextScenes(readContextScenes()),
        saveSelectionToolbarConfig(readSelectionToolbarConfig())
      ]);
      await rebuildContextMenus();
      showResult("\u5212\u8BCD\u526A\u8D34\u677F\u4E0E AI \u573A\u666F\u5DF2\u4FDD\u5B58");
    });
    $("reset-context-scenes-btn").addEventListener("click", async () => {
      renderSelectionToolbarConfig(DEFAULT_SELECTION_TOOLBAR_CONFIG);
      renderContextSceneRows(DEFAULT_CONTEXT_SCENES);
      await Promise.all([
        saveContextScenes(DEFAULT_CONTEXT_SCENES),
        saveSelectionToolbarConfig(DEFAULT_SELECTION_TOOLBAR_CONFIG)
      ]);
      await rebuildContextMenus();
      showResult("\u5DF2\u6062\u590D\u9ED8\u8BA4\u5212\u8BCD\u526A\u8D34\u677F");
    });
    $("ai-provider").addEventListener("change", () => {
      const provider = $("ai-provider").value;
      const baseUrlGroup = $("ai-base-url-group");
      baseUrlGroup.style.display = provider === "deepseek" || provider === "custom" ? "" : "none";
    });
  }
  function renderConfig(config) {
    $("host").value = config.host;
    $("port").value = String(config.port);
    $("token").value = config.token;
  }
  function readConfig() {
    return {
      host: $("host").value.trim() || "127.0.0.1",
      port: parseInt($("port").value, 10) || 4567,
      token: $("token").value.trim()
    };
  }
  function renderPropertyFields(template) {
    const container = $("property-fields");
    container.innerHTML = PROPERTY_FIELDS.map(({ key, label, kind }) => `
    <label class="property-row">
      <span class="row-label">${label}</span>
      <input
        type="${kind === "number" ? "number" : "text"}"
        data-property-key="${String(key)}"
        placeholder="${kind === "list" ? "\u7528\u9017\u53F7\u6216\u987F\u53F7\u5206\u9694" : ""}"
        value="${escapeAttr(String(template[key] ?? ""))}"
      />
    </label>
  `).join("");
  }
  function renderPropertyOptions(options) {
    const container = $("property-options");
    container.innerHTML = OPTION_FIELDS.map(({ key, label }) => `
    <label class="property-row">
      <span class="row-label">${label}</span>
      <input
        type="text"
        data-option-key="${String(key)}"
        placeholder="\u7528\u9017\u53F7\u6216\u987F\u53F7\u5206\u9694"
        value="${escapeAttr(String(options[key] ?? ""))}"
      />
    </label>
  `).join("");
  }
  function readPropertyTemplate() {
    const next = { ...DEFAULT_PROPERTY_TEMPLATE };
    for (const input of Array.from(document.querySelectorAll("[data-property-key]"))) {
      const key = input.dataset.propertyKey;
      next[key] = input.value.trim();
    }
    return next;
  }
  function readPropertyOptions() {
    const next = { ...DEFAULT_PROPERTY_OPTIONS };
    for (const input of Array.from(document.querySelectorAll("[data-option-key]"))) {
      const key = input.dataset.optionKey;
      next[key] = input.value.trim();
    }
    return next;
  }
  function renderInterpreter(config) {
    $("interpreter-enabled").checked = config.enabled;
    $("interpreter-auto-run").checked = config.autoRun;
    $("interpreter-custom-enabled").checked = config.customProviderEnabled === true;
    $("interpreter-provider").value = config.provider;
    $("interpreter-base-url").value = config.baseUrl;
    $("interpreter-model").value = config.model;
    $("interpreter-excerpt-chars").value = String(config.excerptChars || DEFAULT_INTERPRETER_CONFIG.excerptChars || 4e3);
    $("interpreter-api-key").value = config.apiKey;
    $("interpreter-context").value = config.context;
  }
  function readInterpreter() {
    return {
      ...DEFAULT_INTERPRETER_CONFIG,
      enabled: $("interpreter-enabled").checked,
      autoRun: $("interpreter-auto-run").checked,
      customProviderEnabled: $("interpreter-custom-enabled").checked,
      provider: $("interpreter-provider").value.trim() || DEFAULT_INTERPRETER_CONFIG.provider,
      baseUrl: $("interpreter-base-url").value.trim() || DEFAULT_INTERPRETER_CONFIG.baseUrl,
      model: $("interpreter-model").value.trim() || DEFAULT_INTERPRETER_CONFIG.model,
      excerptChars: clampNumber(parseInt($("interpreter-excerpt-chars").value, 10), 800, 12e3, DEFAULT_INTERPRETER_CONFIG.excerptChars || 4e3),
      apiKey: $("interpreter-api-key").value.trim(),
      context: $("interpreter-context").value.trim() || DEFAULT_INTERPRETER_CONFIG.context
    };
  }
  async function loadAiConfig() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["aiConfig"], (result) => {
        resolve({ ...DEFAULT_AI_CONFIG, ...result.aiConfig ?? {} });
      });
    });
  }
  async function saveAiConfig(config) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ aiConfig: config }, () => resolve());
    });
  }
  async function renderAiConfig() {
    const config = await loadAiConfig();
    $("ai-provider").value = config.provider;
    $("ai-api-key").value = config.apiKey;
    $("ai-base-url").value = config.baseUrl;
    $("ai-model").value = config.model;
    $("ai-system-prompt").value = config.systemPrompt;
    const baseUrlGroup = $("ai-base-url-group");
    baseUrlGroup.style.display = config.provider === "deepseek" || config.provider === "custom" ? "" : "none";
  }
  function readAiConfig() {
    return {
      provider: $("ai-provider").value,
      apiKey: $("ai-api-key").value.trim(),
      baseUrl: $("ai-base-url").value.trim(),
      model: $("ai-model").value.trim() || DEFAULT_AI_CONFIG.model,
      systemPrompt: $("ai-system-prompt").value.trim() || DEFAULT_AI_CONFIG.systemPrompt
    };
  }
  async function loadContextScenes() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["contextScenes"], (result) => {
        resolve(normalizeContextScenes(result.contextScenes));
      });
    });
  }
  async function saveContextScenes(scenes) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ contextScenes: scenes }, () => resolve());
    });
  }
  async function renderContextScenes() {
    const [toolbarConfig, scenes] = await Promise.all([
      loadSelectionToolbarConfig(),
      loadContextScenes()
    ]);
    renderSelectionToolbarConfig(toolbarConfig);
    renderContextSceneRows(scenes);
  }
  function renderContextSceneRows(scenes) {
    const container = $("context-scenes-list");
    container.innerHTML = scenes.map((scene) => `
    <div class="scene-row" data-scene-id="${escapeAttr(scene.id)}" data-scene-action="${escapeAttr(scene.action)}">
      <label class="scene-enabled">
        <input type="checkbox" data-scene-enabled ${scene.enabled ? "checked" : ""} />
        <span>${escapeHtml(scene.label)}</span>
      </label>
      <input type="text" data-scene-label value="${escapeAttr(scene.label)}" placeholder="\u573A\u666F\u540D\u79F0" />
      <label class="mini-field">
        <span>\u4FDD\u5B58\u65B9\u5F0F</span>
        <select data-scene-action-select>
          ${renderActionOptions(scene.action)}
        </select>
      </label>
      <label class="mini-check">
        <input type="checkbox" data-scene-ai-enabled ${scene.aiEnabled ? "checked" : ""} />
        <span>\u4F7F\u7528 AI Prompt</span>
      </label>
      <label class="mini-field">
        <span>\u9ED8\u8BA4\u76EE\u6807\u76EE\u5F55</span>
        <input type="text" data-scene-default-dir value="${escapeAttr(scene.defaultDir || "")}" placeholder="\u4F8B\u5982\uFF1A0\uFE0F\u20E3\u8F93\u5165" />
      </label>
      <label class="mini-field">
        <span>\u9ED8\u8BA4\u8865\u5145\u6587\u6863</span>
        <input type="text" data-scene-default-append-path value="${escapeAttr(scene.defaultAppendPath || "")}" placeholder="\u4F8B\u5982\uFF1A2\uFE0F\u20E3\u8F93\u51FA/\u91D1\u53E5\u6C47\u603B.md" />
      </label>
      <label class="scene-prompt">
        <span>Prompt \u6A21\u677F</span>
        <textarea data-scene-prompt rows="6" placeholder="\u652F\u6301 {text} {title} {url} {domain} {date}">${escapeHtml(scene.prompt)}</textarea>
      </label>
    </div>
  `).join("");
  }
  function renderActionOptions(selected) {
    const options = [
      { value: "save", label: "\u65B0\u5EFA\u6587\u6863" },
      { value: "append", label: "\u8865\u5145\u5230\u5DF2\u6709\u6587\u6863" },
      { value: "refine", label: "AI \u6574\u7406\u540E\u4FDD\u5B58" },
      { value: "showResult", label: "\u4EC5\u663E\u793A AI \u7ED3\u679C" },
      { value: "copy", label: "\u590D\u5236" },
      { value: "openSidepanel", label: "\u6253\u5F00\u4FA7\u8FB9\u680F" }
    ];
    return options.map((option) => `<option value="${option.value}" ${option.value === selected ? "selected" : ""}>${option.label}</option>`).join("");
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
      if (!ids.has(scene.id)) scenes.push(scene);
    }
    return scenes;
  }
  async function loadSelectionToolbarConfig() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["selectionToolbarConfig"], (result) => {
        resolve(normalizeSelectionToolbarConfig(result.selectionToolbarConfig));
      });
    });
  }
  async function saveSelectionToolbarConfig(config) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ selectionToolbarConfig: config }, () => resolve());
    });
  }
  function normalizeSelectionToolbarConfig(input) {
    if (!input || typeof input !== "object") return { ...DEFAULT_SELECTION_TOOLBAR_CONFIG };
    const value = input;
    return {
      enabled: value.enabled ?? DEFAULT_SELECTION_TOOLBAR_CONFIG.enabled,
      defaultAction: value.defaultAction ?? DEFAULT_SELECTION_TOOLBAR_CONFIG.defaultAction,
      saveBehavior: value.saveBehavior ?? DEFAULT_SELECTION_TOOLBAR_CONFIG.saveBehavior,
      defaultAppendPath: value.defaultAppendPath ?? DEFAULT_SELECTION_TOOLBAR_CONFIG.defaultAppendPath,
      aiBeforeSave: value.aiBeforeSave ?? DEFAULT_SELECTION_TOOLBAR_CONFIG.aiBeforeSave,
      visibleActions: Array.isArray(value.visibleActions) && value.visibleActions.length > 0 ? value.visibleActions : DEFAULT_SELECTION_TOOLBAR_CONFIG.visibleActions
    };
  }
  function renderSelectionToolbarConfig(config) {
    $("selection-toolbar-enabled").checked = config.enabled;
    $("selection-default-action").value = config.defaultAction;
    $("selection-save-behavior").value = config.saveBehavior;
    $("selection-default-append-path").value = config.defaultAppendPath;
    $("selection-ai-before-save").checked = config.aiBeforeSave;
    const visible = new Set(config.visibleActions);
    document.querySelectorAll("[data-visible-action]").forEach((input) => {
      input.checked = visible.has(input.dataset.visibleAction || "");
    });
  }
  function readSelectionToolbarConfig() {
    const visibleActions = Array.from(document.querySelectorAll("[data-visible-action]")).filter((input) => input.checked).map((input) => input.dataset.visibleAction || "").filter(Boolean);
    return {
      enabled: $("selection-toolbar-enabled").checked,
      defaultAction: $("selection-default-action").value,
      saveBehavior: $("selection-save-behavior").value,
      defaultAppendPath: $("selection-default-append-path").value.trim(),
      aiBeforeSave: $("selection-ai-before-save").checked,
      visibleActions
    };
  }
  function readContextScenes() {
    return Array.from(document.querySelectorAll("[data-scene-id]")).map((row) => ({
      id: row.dataset.sceneId || "",
      action: row.querySelector("[data-scene-action-select]")?.value || row.dataset.sceneAction || "showResult",
      label: row.querySelector("[data-scene-label]")?.value.trim() || row.dataset.sceneId || "\u573A\u666F",
      prompt: row.querySelector("[data-scene-prompt]")?.value.trim() || "{text}",
      enabled: row.querySelector("[data-scene-enabled]")?.checked ?? true,
      defaultDir: row.querySelector("[data-scene-default-dir]")?.value.trim() || "",
      defaultAppendPath: row.querySelector("[data-scene-default-append-path]")?.value.trim() || "",
      aiEnabled: row.querySelector("[data-scene-ai-enabled]")?.checked ?? true
    })).filter((scene) => scene.id);
  }
  async function rebuildContextMenus() {
    await chrome.runtime.sendMessage({ type: "REBUILD_CONTEXT_MENUS" }).catch(() => void 0);
  }
  function clampNumber(value, min, max, fallback) {
    if (!Number.isFinite(value)) return fallback;
    return Math.min(Math.max(value, min), max);
  }
  function showResult(message, type = "success") {
    const el = $("result");
    el.textContent = message;
    el.className = `result ${type}`;
  }
  function applySectionFromUrl() {
    const sectionId = new URLSearchParams(location.search).get("section") || "general";
    const activeNav = document.querySelector(`[data-section-link="${CSS.escape(sectionId)}"]`);
    document.querySelectorAll("[data-section-link]").forEach((link) => {
      link.classList.toggle("active", link === activeNav);
    });
    document.querySelectorAll(".section").forEach((section) => {
      section.style.display = section.id === sectionId ? "" : "none";
    });
    const titles = {
      general: "\u5E38\u89C4",
      template: "\u5C5E\u6027\u6A21\u677F",
      options: "\u4E0B\u62C9\u9009\u9879",
      interpreter: "AI \u89E3\u91CA\u5668",
      ai: "AI \u52A9\u624B",
      scenes: "\u5212\u8BCD\u573A\u666F"
    };
    const h1 = document.querySelector(".hero h1");
    if (h1) h1.textContent = titles[sectionId] || "\u6269\u5C55\u8BBE\u7F6E";
  }
  function escapeAttr(value) {
    return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escapeHtml(value) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  init();
})();
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 5.2.1 https://github.com/nodeca/js-yaml @license MIT *)
*/
//# sourceMappingURL=settings.js.map
