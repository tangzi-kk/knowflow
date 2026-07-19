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
    if (!raw) return "";
    if (key === "\u6807\u7B7E") {
      const tag = raw.match(/([SXLZQJ])(?:_|$)/)?.[1];
      return tag ?? raw;
    }
    if (key === "\u8BC4\u5206") {
      const explicit = raw.match(/[1-5]/)?.[0];
      if (explicit) return explicit;
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
    return loadSecretBackedConfig(DEFAULT_CONFIG, SYNC_CONFIG_STORAGE);
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
    return loadSecretBackedConfig(DEFAULT_INTERPRETER_CONFIG, INTERPRETER_CONFIG_STORAGE);
  }
  async function suggestMetaWithInterpreter(config, input) {
    if (!config.enabled) throw new Error("\u89E3\u91CA\u5668\u672A\u542F\u7528");
    if (!config.baseUrl || !config.model) throw new Error("\u8BF7\u5148\u914D\u7F6E AI \u4E2D\u8F6C\u5730\u5740\u548C\u8DEF\u7531\u6A21\u578B");
    if (/newapi/i.test(config.provider) && !config.apiKey) throw new Error("\u8BF7\u5148\u5728 AI \u89E3\u91CA\u5668\u8BBE\u7F6E\u91CC\u586B\u5199 NewAPI API Key");
    const endpoint = `${config.baseUrl.replace(/\/+$/, "")}/chat/completions`;
    const headers = { "Content-Type": "application/json" };
    if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
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
    if (!content) throw new Error("AI \u672A\u8FD4\u56DE\u5EFA\u8BAE\u5185\u5BB9");
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
  async function runPersistedWrite(kind, request2) {
    const requestId = crypto.randomUUID();
    const response = await chrome.runtime.sendMessage({
      type: "knowflow-write",
      payload: { kind, request: { ...request2, requestId } }
    });
    if (!response?.ok || !response.result?.path || !response.result?.action) {
      throw new Error(response?.error || "Obsidian \u672A\u8FD4\u56DE\u6700\u7EC8\u5199\u5165\u7ED3\u679C\u3002");
    }
    return response.result;
  }
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
        if (target.value) updateSteps(2, "done");
      }
    });
    document.addEventListener("input", (e) => {
      const target = e.target;
      if (target instanceof HTMLInputElement && target.name === "target-dir") {
        if (target.value.trim()) updateSteps(2, "done");
      }
    });
  }
  async function loadPanel(passedDocToken) {
    setStatus("\u6B63\u5728\u8BFB\u53D6\u5F53\u524D\u6807\u7B7E\u9875...", "info");
    $("sync-btn").setAttribute("disabled", "true");
    renderLoading();
    const activeTab = await getActiveTab();
    const urlTokenInfo = extractTokenFromUrl(activeTab.url ?? "");
    const tokenInfo = passedDocToken?.node_token || passedDocToken?.obj_token ? passedDocToken : urlTokenInfo;
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
    if (wikiMatch) return { node_token: wikiMatch[1] };
    const docxMatch = url.match(/\/(?:docx|doc)\/([A-Za-z0-9]+)/);
    if (docxMatch) return { obj_token: docxMatch[1] };
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
              if (isExpanded) expanded.delete(dir.path);
              else expanded.add(dir.path);
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
          if (isExpanded) dir.children.forEach(appendNode);
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
      if (normalizedValue && !optionValues.includes(normalizedValue)) appendOption(select, normalizedValue, stringValue);
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
      if (!input || !checkbox) return;
      input.disabled = !checkbox.checked;
      if (checkbox.checked) input.focus();
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
      if (!key) return;
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
    if (!state) return;
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
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not object");
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
    if (!next.\u5173\u952E\u8BCD) next.\u5173\u952E\u8BCD = draftKeywords(String(next.\u6982\u8FF0 || "")).join("\u3001");
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
      if (!control) continue;
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
          if (!active) button.classList.add("is-selected");
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
    if (!state) return;
    const current = state;
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
      if (current.mode === "web-clip") {
        await confirmWebClip(current, dir || current.fallbackDir);
        return;
      }
      const targetDir = dir || "";
      setStatus("\u6B63\u5728\u6293\u53D6\u5E76\u5199\u5165 Obsidian...", "info");
      const result = await runPersistedWrite("fetch", {
        node_token: current.nodeToken,
        obj_token: current.tokenInfo.obj_token,
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
    const result = await runPersistedWrite("clip", {
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
    if (next.treeError) return `\u76EE\u5F55\u6811\u52A0\u8F7D\u5931\u8D25\uFF0C\u53EF\u624B\u52A8\u586B\u5199\u76EE\u5F55\uFF1A${next.treeError}`;
    if (next.existingPath) return `\u68C0\u6D4B\u5230\u5DF2\u540C\u6B65\u6587\u4EF6\uFF0C\u786E\u8BA4\u540E\u5C06\u66F4\u65B0\uFF1A${next.existingPath}`;
    if (next.mode === "web-clip") return "\u5F53\u524D\u9875\u4E0D\u662F\u98DE\u4E66 wiki/docx/doc \u6587\u6863\uFF0C\u5C06\u4F7F\u7528\u201C\u7F51\u9875\u8F6C Obsidian\u201D\u6A21\u5F0F\u3002Base\u3001\u591A\u7EF4\u8868\u683C\u548C\u666E\u901A\u7F51\u9875\u4F1A\u6309\u53EF\u89C1\u5185\u5BB9\u751F\u6210 Obsidian \u6587\u6863\u3002";
    return "\u8BF7\u786E\u8BA4\u76EE\u5F55\u548C\u5C5E\u6027\uFF0C\u786E\u8BA4\u540E\u5F00\u59CB\u540C\u6B65\u3002";
  }
  function getInterpreterSummary(next) {
    if (next.mode === "web-clip") {
      return "\u7F51\u9875\u8F6C\u6362\uFF1A\u8BFB\u53D6\u5F53\u524D\u9875\u53EF\u89C1\u5185\u5BB9\uFF1B\u53EF\u52FE\u9009\u201C\u8865\u5145\u5230\u5DF2\u6709\u6587\u6863\u201D\u628A\u5212\u8BCD/\u91D1\u53E5\u8FFD\u52A0\u5230\u6C47\u603B\u6587\u4EF6\u3002";
    }
    if (!next.interpreter.enabled) return "\u89E3\u91CA\u5668\uFF1A\u5173\u95ED\u3002\u4FA7\u8FB9\u680F\u5C06\u53EA\u4F7F\u7528\u5C5E\u6027\u6A21\u677F\u9884\u586B\u3002";
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
    if (!tab?.id) return "";
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
    if (hasSelection) return "selection";
    if (/\.feishu\.cn\/(base|bitable|sheets|mindnotes|wiki\/base)/i.test(url) || /多维表格|Base|bitable/i.test(text)) return "feishu-base";
    if (/\/(article|post|news|blog|posts)\b/i.test(url)) return "article";
    return "generic-page";
  }
  async function buildWebConversionDraft(current, snapshot, dir) {
    const scenePrompt = current.scenePrompt?.trim();
    if (!current.interpreter.enabled && !current.aiEnabled) return fallbackWebDraft(current, snapshot, dir);
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
    if (!path) return "";
    const parts = path.split("/").filter(Boolean);
    if (parts.length <= 1) return "";
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
    if (dirs.length === 0) return preferred;
    if (preferred && dirs.some((dir) => dir.path === preferred)) return preferred;
    if (preferred) {
      const parent = dirs.filter((dir) => preferred.startsWith(`${dir.path}/`)).sort((a, b) => b.path.length - a.path.length)[0];
      if (parent) return parent.path;
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
      if (parent) parent.children.push(node);
      else roots.push(node);
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
      if (n < current) dot.classList.add("step-done");
      if (n === current) dot.classList.add(stepState === "active" ? "step-active" : "step-done");
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
    if (syncEl) syncEl.style.display = panel === "sync" ? "" : "none";
    if (aiEl) aiEl.style.display = panel === "ai" ? "flex" : "none";
    const title = document.getElementById("page-title");
    if (title) title.textContent = panel === "sync" ? "\u540C\u6B65\u524D\u9884\u89C8" : "AI \u5BF9\u8BDD";
  }
  async function loadAiConfig() {
    aiConfig = await loadSecretBackedConfig(DEFAULT_AI_CONFIG, AI_CONFIG_STORAGE);
    updateProviderBadge();
  }
  function updateProviderBadge() {
    const badge = document.getElementById("ai-provider-badge");
    if (!badge) return;
    const labels = {
      "gemini-web": "Gemini Web",
      "gemini-nano": "Gemini Nano (\u5185\u7F6E)",
      "gemini-api": "Gemini API",
      "openai": "OpenAI",
      "deepseek": "DeepSeek",
      "deepseek-web": "DeepSeek Web (\u514D\u8D39)",
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
            if (error) reject(new Error(error));
            else resolve(response?.text || "Gemini Web \u672A\u8FD4\u56DE\u5185\u5BB9");
          });
        });
      }
      case "deepseek-web": {
        const prompt = messages.filter((message) => message.role !== "system").map((message) => message.content).join("\n\n");
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({ type: "ai-inline-deepseek-web", payload: { text: prompt } }, (response) => {
            const error = chrome.runtime.lastError?.message || response?.error;
            if (error) reject(new Error(error));
            else resolve(response?.text || "DeepSeek Web \u672A\u8FD4\u56DE\u5185\u5BB9");
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
            if (m.role === "system") return `[\u7CFB\u7EDF]: ${m.content}`;
            if (m.role === "user") return `[\u7528\u6237]: ${m.content}`;
            return `[AI]: ${m.content}`;
          }).join("\n\n") + "\n\n[AI]: ";
          const result = await session.prompt(prompt);
          return result;
        } finally {
          session.destroy();
        }
      }
      case "gemini-api": {
        if (!config.apiKey) throw new Error("Gemini API \u9700\u8981 API Key\u3002\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6E\u3002");
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
        if (!res.ok) throw new Error(data.error?.message || `Gemini API HTTP ${res.status}`);
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "(\u7A7A\u54CD\u5E94)";
      }
      case "openai":
      case "deepseek":
      case "custom": {
        const baseUrl2 = config.baseUrl || (config.provider === "openai" ? "https://api.openai.com" : config.provider === "deepseek" ? "https://api.deepseek.com" : "");
        if (!baseUrl2) throw new Error("AI \u52A9\u624B\u5C1A\u672A\u914D\u7F6E\u3002\u8BF7\u5728\u6269\u5C55\u8BBE\u7F6E > AI \u52A9\u624B\u4E2D\u586B\u5199 Base URL \u548C\u6A21\u578B\uFF0C\u6216\u9009\u62E9 Gemini API\u3001OpenAI\u3001DeepSeek\u3002");
        if (!config.apiKey && config.provider !== "custom") throw new Error("\u8BF7\u914D\u7F6E API Key\u3002");
        const endpoint = `${baseUrl2.replace(/\/+$/, "")}/chat/completions`;
        const headers = { "Content-Type": "application/json" };
        if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
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
        if (!res.ok) throw new Error(data.error?.message || `API HTTP ${res.status}`);
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
    if (!el) return;
    const empty = el.querySelector(".ai-empty");
    if (empty) empty.remove();
    const msg = document.createElement("div");
    msg.className = "ai-msg ai-msg-user";
    msg.textContent = text;
    el.appendChild(msg);
    el.scrollTop = el.scrollHeight;
  }
  function addAiMessage(text) {
    const el = document.getElementById("ai-messages");
    if (!el) return;
    const msg = document.createElement("div");
    msg.className = "ai-msg ai-msg-ai";
    msg.innerHTML = renderMarkdown(text);
    el.appendChild(msg);
    el.scrollTop = el.scrollHeight;
  }
  function addAiError(text) {
    const el = document.getElementById("ai-messages");
    if (!el) return;
    const msg = document.createElement("div");
    msg.className = "ai-msg ai-msg-error";
    msg.textContent = text;
    el.appendChild(msg);
    el.scrollTop = el.scrollHeight;
  }
  function addScreenshotMessage(dataUrl, label) {
    const el = document.getElementById("ai-messages");
    if (!el) return;
    const empty = el.querySelector(".ai-empty");
    if (empty) empty.remove();
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
    if (!target) return;
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
      if (!ctx) throw new Error("\u65E0\u6CD5\u521B\u5EFA\u622A\u56FE\u753B\u5E03\u3002");
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
    if (!options.skipUserBubble) addUserMessage(`${prompt}${attachmentSuffix}`);
    if (sendBtn) sendBtn.disabled = true;
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
      if (sendBtn) sendBtn.disabled = false;
    }
  }
  function setupAiChat() {
    const sendBtn = document.getElementById("ai-send");
    const inputEl = document.getElementById("ai-input");
    const clearBtn = document.getElementById("ai-clear");
    const fileInput = document.getElementById("ai-file");
    if (!sendBtn || !inputEl) return;
    sendBtn.addEventListener("click", () => {
      const text = inputEl.value.trim();
      if (!text) return;
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
        if (!message.payload.imageDataUrl) addUserMessage(`${label}\uFF1A${userText || message.payload.title || ""}`);
        sendAiMessage(prompt, attachments, { skipUserBubble: true });
      }, 200);
    }
    if (message.type === "clip-data") {
      if (message.payload?.triggerSync) {
        switchTab("sync");
        const docToken = message.payload?.docToken;
        loadPanel(docToken);
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
    if (next.defaultDir && dirInput) dirInput.value = next.defaultDir;
    if (!appendCheckbox || !appendInput) return;
    const shouldAppend = next.sceneAction === "append";
    if (!shouldAppend) return;
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
  (*! js-yaml 5.2.1 https://github.com/nodeca/js-yaml @license MIT *)
*/
//# sourceMappingURL=sidepanel.js.map
