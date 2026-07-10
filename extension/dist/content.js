"use strict";
(() => {
  // ../packages/shared/dist/protocol.js
  var OBSIDIAN_LARK_DOC_ACTION = "lark-doc";
  var OBSIDIAN_LARK_DOC_URI_PREFIX = `obsidian://${OBSIDIAN_LARK_DOC_ACTION}`;
  function buildObsidianLarkDocUri(params) {
    const token = params.token || params.node_token || params.obj_token;
    const query = [
      ["token", token],
      ["node_token", params.node_token],
      ["obj_token", params.obj_token],
      ["space_id", params.space_id],
      ["title", params.title],
      ["url", params.url],
      ["dir", params.dir]
    ];
    const encoded = query.filter(([, value]) => value !== void 0 && value !== "").map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`).join("&");
    return encoded ? `${OBSIDIAN_LARK_DOC_URI_PREFIX}?${encoded}` : OBSIDIAN_LARK_DOC_URI_PREFIX;
  }

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

  // src/content/content.ts
  var FAB_ID = "feishu-sync-fab";
  var LABEL_ID = "feishu-sync-fab-label";
  var FAB_SIZE = 52;
  var DEFAULT_AI_EXCERPT_CHARS = 4e3;
  var LS_KEY = "feishu-sync-fab-pos";
  var CAT_ICON = `<svg viewBox="0 0 32 32" width="26" height="26">
  <defs>
    <radialGradient id="cat-body" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#41C978"/>
      <stop offset="100%" stop-color="#07C160"/>
    </radialGradient>
    <radialGradient id="cat-bell" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#FFA500"/>
    </radialGradient>
  </defs>
  <!-- \u8EAB\u4F53 -->
  <circle cx="16" cy="17" r="13" fill="url(#cat-body)"/>
  <!-- \u8033\u6735 -->
  <path d="M8 9 L5 3 L12 8Z" fill="#06A050"/>
  <path d="M24 9 L27 3 L20 8Z" fill="#06A050"/>
  <!-- \u5185\u8033 -->
  <path d="M9 8 L7 4 L12 8Z" fill="#FFD700" opacity="0.6"/>
  <path d="M23 8 L25 4 L20 8Z" fill="#FFD700" opacity="0.6"/>
  <!-- \u773C\u775B -->
  <ellipse cx="11" cy="14" rx="2" ry="2.5" fill="white"/>
  <ellipse cx="21" cy="14" rx="2" ry="2.5" fill="white"/>
  <circle cx="11.5" cy="14" r="1.2" fill="#191919"/>
  <circle cx="21.5" cy="14" r="1.2" fill="#191919"/>
  <!-- \u9AD8\u5149 -->
  <circle cx="12" cy="13.2" r="0.4" fill="white"/>
  <circle cx="22" cy="13.2" r="0.4" fill="white"/>
  <!-- \u9F3B\u5B50 -->
  <circle cx="16" cy="17" r="1.2" fill="#FF6B6B"/>
  <!-- \u5634\u5DF4 -->
  <path d="M13 17.5 Q16 21 19 17.5" fill="none" stroke="white" stroke-width="0.8" stroke-linecap="round"/>
  <!-- \u94C3\u94DB -->
  <circle cx="16" cy="22" r="2.5" fill="url(#cat-bell)"/>
  <circle cx="16" cy="22.8" r="0.4" fill="#8B6914"/>
  <!-- \u80E1\u987B -->
  <line x1="7" y1="16" x2="10" y2="17" stroke="white" stroke-width="0.5" opacity="0.7"/>
  <line x1="7" y1="18" x2="10" y2="18" stroke="white" stroke-width="0.5" opacity="0.7"/>
  <line x1="25" y1="16" x2="22" y2="17" stroke="white" stroke-width="0.5" opacity="0.7"/>
  <line x1="25" y1="18" x2="22" y2="18" stroke="white" stroke-width="0.5" opacity="0.7"/>
</svg>`;
  var SYNC_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16"/>
</svg>`;
  var SPINNER_ICON = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
  <path d="M16 4a12 12 0 0 1 12 12" class="fab-spinner-arc"/>
</svg>`;
  var CHECK_ICON = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#07C160" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="6 16 14 24 26 8"/>
</svg>`;
  var ERROR_ICON = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#E24B4A" stroke-width="2.5" stroke-linecap="round">
  <line x1="10" y1="10" x2="22" y2="22"/><line x1="22" y1="10" x2="10" y2="22"/>
</svg>`;
  function loadPosition() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.left === "number" && typeof parsed.top === "number") return parsed;
      }
    } catch {
    }
    return { left: 0, top: 0, dock: "floating" };
  }
  function savePosition(pos) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(pos));
    } catch {
    }
  }
  function defaultPosition() {
    return {
      left: window.innerWidth - FAB_SIZE - 16,
      top: window.innerHeight - FAB_SIZE - 100,
      dock: "floating"
    };
  }
  function computeSnap(el, pos) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = pos.left + FAB_SIZE / 2;
    let left = Math.max(0, Math.min(pos.left, w - FAB_SIZE));
    let top = Math.max(0, Math.min(pos.top, h - FAB_SIZE));
    let dock = "floating";
    const distLeft = cx;
    const distRight = w - cx;
    const threshold = w * 0.4;
    if (distLeft < threshold) {
      dock = "left";
    } else if (distRight < threshold) {
      dock = "right";
    }
    return { left, top, dock };
  }
  function applySnap(fab, pos) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    fab.style.left = "";
    fab.style.right = "";
    if (pos.dock === "left") {
      fab.style.top = `${pos.top}px`;
      fab.dataset.dock = "left";
    } else if (pos.dock === "right") {
      fab.style.top = `${pos.top}px`;
      fab.dataset.dock = "right";
    } else {
      fab.dataset.dock = "floating";
      fab.style.left = `${pos.left}px`;
      fab.style.top = `${pos.top}px`;
    }
  }
  function createOrGetLabel() {
    const existing = document.getElementById(LABEL_ID);
    if (existing) return existing;
    const label = document.createElement("div");
    label.id = LABEL_ID;
    label.className = "feishu-sync-fab-label";
    label.innerHTML = `${SYNC_ICON}\u540C\u6B65\u5230 Obsidian`;
    document.body.appendChild(label);
    return label;
  }
  function updateLabelPosition(fab, label) {
    const rect = fab.getBoundingClientRect();
    const fabCenterX = rect.left + rect.width / 2;
    const fabCenterY = rect.top + rect.height / 2;
    const dock = fab.dataset.dock;
    if (dock === "left") {
      label.style.left = `${rect.right + 10}px`;
      label.style.top = `${fabCenterY}px`;
      label.style.transform = "translateY(-50%)";
    } else if (dock === "right") {
      label.style.left = "";
      label.style.right = `${window.innerWidth - rect.left + 10}px`;
      label.style.top = `${fabCenterY}px`;
      label.style.transform = "translateY(-50%)";
      label.style.right = "";
      label.style.left = `${rect.left - 10}px`;
      label.style.transform = "translate(-100%, -50%)";
    } else {
      label.style.left = `${fabCenterX}px`;
      label.style.top = `${rect.top - 10}px`;
      label.style.transform = "translate(-50%, -100%)";
    }
  }
  function showLabel(fab) {
    const label = createOrGetLabel();
    updateLabelPosition(fab, label);
    label.classList.add("is-visible");
  }
  function hideLabel() {
    const label = document.getElementById(LABEL_ID);
    if (label) label.classList.remove("is-visible");
  }
  var dragState = null;
  function setupDrag(fab) {
    fab.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      fab.setPointerCapture(e.pointerId);
      fab.classList.add("is-dragging");
      hideLabel();
      const rect = fab.getBoundingClientRect();
      dragState = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startLeft: rect.left,
        startTop: rect.top,
        moved: false
      };
    });
    fab.addEventListener("pointermove", (e) => {
      if (!dragState || e.pointerId !== dragState.pointerId) return;
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist < 3) return;
      dragState.moved = true;
      let newLeft = dragState.startLeft + dx;
      let newTop = dragState.startTop + dy;
      const maxLeft = window.innerWidth - FAB_SIZE;
      const maxTop = window.innerHeight - FAB_SIZE;
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));
      fab.dataset.dock = "floating";
      fab.style.left = `${newLeft}px`;
      fab.style.top = `${newTop}px`;
      fab.style.right = "";
      dragState.startLeft = newLeft;
      dragState.startTop = newTop;
      dragState.startX = e.clientX;
      dragState.startY = e.clientY;
    });
    fab.addEventListener("pointerup", (e) => {
      if (!dragState || e.pointerId !== dragState.pointerId) return;
      const wasMoved = dragState.moved;
      const currentRect = fab.getBoundingClientRect();
      const pos = {
        left: currentRect.left,
        top: currentRect.top,
        dock: "floating"
      };
      fab.classList.remove("is-dragging");
      const snapped = computeSnap(fab, pos);
      savePosition(snapped);
      fab.classList.add("is-snapping");
      applySnap(fab, snapped);
      setTimeout(() => fab.classList.remove("is-snapping"), 500);
      dragState = null;
      fab.releasePointerCapture(e.pointerId);
      if (!wasMoved) {
        onSyncClick();
      }
    });
    fab.addEventListener("pointercancel", () => {
      if (dragState) {
        fab.classList.remove("is-dragging");
        dragState = null;
      }
    });
  }
  function extractTokenFromUrl() {
    const url = window.location.href;
    const wikiMatch = url.match(/\/wiki\/([A-Za-z0-9]+)/);
    if (wikiMatch) return { node_token: wikiMatch[1] };
    const docxMatch = url.match(/\/(?:docx|doc)\/([A-Za-z0-9]+)/);
    if (docxMatch) return { obj_token: docxMatch[1] };
    return null;
  }
  function isDocPage() {
    return /\/(wiki|docx|doc)\//.test(window.location.pathname);
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
  function injectFab() {
    if (document.getElementById(FAB_ID)) return;
    if (!isDocPage()) return;
    const fab = document.createElement("div");
    fab.id = FAB_ID;
    fab.className = "feishu-sync-fab";
    fab.innerHTML = CAT_ICON;
    fab.setAttribute("role", "button");
    fab.setAttribute("aria-label", "\u540C\u6B65\u5230 Obsidian");
    fab.setAttribute("tabindex", "0");
    const saved = loadPosition();
    const pos = saved.dock !== "floating" ? saved : defaultPosition();
    document.body.appendChild(fab);
    applySnap(fab, pos);
    if (pos.dock === "floating") {
      fab.style.left = `${pos.left}px`;
      fab.style.top = `${pos.top}px`;
    }
    savePosition(pos);
    setupDrag(fab);
    fab.addEventListener("pointerenter", () => {
      if (!dragState) showLabel(fab);
    });
    fab.addEventListener("pointerleave", () => hideLabel());
    console.log("[feishu-sync] draggable FAB injected");
  }
  async function onSyncClick() {
    const tokenInfo = extractTokenFromUrl();
    if (!tokenInfo?.node_token && !tokenInfo?.obj_token) {
      showToast("\u65E0\u6CD5\u8BC6\u522B\u5F53\u524D\u98DE\u4E66\u6587\u6863 token", "error");
      return;
    }
    const docTitle = getDocumentTitle();
    const nodeToken = tokenInfo.node_token || tokenInfo.obj_token;
    const fab = document.getElementById(FAB_ID);
    if (!fab) return;
    const obsidianUri = buildObsidianLarkDocUri({
      token: nodeToken,
      node_token: tokenInfo.node_token,
      obj_token: tokenInfo.obj_token,
      title: docTitle,
      url: window.location.href
    });
    setFabState("syncing", fab);
    tryOpenObsidianUri(obsidianUri);
    let syncDone = false;
    const onSyncComplete = (msg) => {
      if (msg?.type === "sync-complete" && msg?.payload?.token === nodeToken) {
        syncDone = true;
        if (msg.payload.success) {
          setFabState("success", fab);
          setTimeout(() => setFabState("idle", fab), 2e3);
        } else {
          setFabState("error", fab);
          setTimeout(() => setFabState("idle", fab), 3e3);
        }
      }
    };
    chrome.runtime.onMessage.addListener(onSyncComplete);
    setTimeout(() => {
      chrome.runtime.onMessage.removeListener(onSyncComplete);
      if (syncDone) return;
      chrome.runtime.sendMessage({
        type: "feishu-sync-trigger",
        payload: {
          title: docTitle,
          url: window.location.href,
          docToken: tokenInfo,
          domain: window.location.hostname,
          obsidianUri,
          protocolFailed: false
        }
      }).then(() => {
        setFabState("success", fab);
        setTimeout(() => setFabState("idle", fab), 2e3);
      }).catch(() => {
        setFabState("error", fab);
        showToast("\u540C\u6B65\u5931\u8D25\u3002\u8BF7\u6253\u5F00 Obsidian \u5E76\u5728\u4FA7\u8FB9\u680F\u624B\u52A8\u540C\u6B65\u3002", "error");
        setTimeout(() => setFabState("idle", fab), 3e3);
      });
    }, 3e3);
  }
  function setFabState(state, fab) {
    fab.classList.remove("syncing", "success", "error");
    switch (state) {
      case "idle":
        fab.innerHTML = CAT_ICON;
        break;
      case "syncing":
        fab.classList.add("syncing");
        fab.innerHTML = SPINNER_ICON;
        break;
      case "success":
        fab.classList.add("success");
        fab.innerHTML = CHECK_ICON;
        break;
      case "error":
        fab.classList.add("error");
        fab.innerHTML = ERROR_ICON;
        break;
    }
  }
  function tryOpenObsidianUri(uri) {
    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = uri;
      document.body.appendChild(iframe);
      setTimeout(() => iframe.remove(), 5e3);
      return true;
    } catch {
      return false;
    }
  }
  function showToast(message, type = "info") {
    const existing = document.querySelector(".feishu-sync-toast");
    if (existing) {
      existing.classList.add("feishu-sync-toast-closing");
      existing.addEventListener("animationend", () => existing.remove(), { once: true });
    }
    const toast = document.createElement("div");
    toast.className = `feishu-sync-toast feishu-sync-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add("feishu-sync-toast-closing");
        toast.addEventListener("animationend", () => toast.remove(), { once: true });
      }
    }, 4e3);
  }
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "GET_FEISHU_DOC_EXCERPT") return false;
    const limit = Number(message.limit) || DEFAULT_AI_EXCERPT_CHARS;
    sendResponse({
      ok: true,
      title: getDocumentTitle(),
      excerpt: getDocumentExcerpt(limit)
    });
    return false;
  });
  var lastPath = "";
  function watchRoute() {
    const check = () => {
      const path = window.location.pathname;
      if (path !== lastPath) {
        lastPath = path;
        document.getElementById(FAB_ID)?.remove();
        document.getElementById(LABEL_ID)?.remove();
        if (isDocPage()) {
          setTimeout(injectFab, 1200);
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
  (*! js-yaml 5.2.1 https://github.com/nodeca/js-yaml @license MIT *)
*/
//# sourceMappingURL=content.js.map
