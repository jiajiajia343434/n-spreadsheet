/* eslint-disable no-param-reassign */
function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const mergeDeep = (object = {}, ...sources) => {
  sources.forEach((source) => {
    Object.keys(source).forEach((key) => {
      const v = source[key];
      // console.log('k:', key, ', v:', source[key], typeof v, v instanceof Object);
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        object[key] = v;
      } else if (typeof v !== 'function' && !Array.isArray(v) && v instanceof Object) {
        object[key] = object[key] || {};
        mergeDeep(object[key], v);
      } else {
        object[key] = v;
      }
    });
  });
  // console.log('::', object);
  return object;
};

function compareStyle(original, news) {
  if (original === news) return true;
  if (original === null || typeof original === 'undefined') return false;
  if (news === null || typeof news === 'undefined') return false;
  const keys = Object.keys(original);
  if (keys.length !== Object.keys(news).length) return false;
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    const v1 = original[k];
    const v2 = news[k];
    if (typeof v1 === 'string' || typeof v1 === 'number' || typeof v1 === 'boolean') {
      if (v1 !== v2) return false;
    } else if (Array.isArray(v1)) {
      if (typeof v2 === 'undefined') return false;
      if (v1.length !== v2.length) return false;
      for (let ai = 0; ai < v1.length; ai += 1) {
        if (!compareStyle(v1[ai], v2[ai])) return false;
      }
    } else if (typeof v1 !== 'function' && !Array.isArray(v1) && v1 instanceof Object) {
      if (!compareStyle(v1, v2)) return false;
    } else if (typeof v1 === 'undefined') {
      if (!compareStyle(v1, v2)) return false;
    }
  }
  return true;
}

/*
  objOrAry: obejct or Array
  cb: (value, index | key) => { return value }
*/
const sum = (objOrAry, cb = value => value) => {
  let total = 0;
  let size = 0;
  Object.keys(objOrAry).forEach((key) => {
    total += cb(objOrAry[key], key);
    size += 1;
  });
  return [total, size];
};

function deleteProperty(obj, property) {
  const oldv = obj[`${property}`];
  delete obj[`${property}`];
  return oldv;
}

// min 可移动的起始单元格, max 可移动的最后单元格, inits , initv , ifv 目标偏移量, getv
function rangeReduceIf(min, max, inits, initv, ifv, getv) {
  let s = inits;
  let v = initv;
  let i = min;
  for (; i < max; i += 1) {
    if (s > ifv) break;
    v = getv(i);
    s += v;
  }
  // [index, X or Y axis, cell_height]
  return [i, s - v, v];
}

function rangeSum(min, max, getv) {
  let s = 0;
  for (let i = min; i < max; i += 1) {
    s += getv(i);
  }
  return s;
}

function rangeEach(min, max, cb) {
  for (let i = min; i < max; i += 1) {
    cb(i);
  }
}

function arrayEquals(a1, a2) {
  if (a1.length === a2.length) {
    for (let i = 0; i < a1.length; i += 1) {
      if (a1[i] !== a2[i]) return false;
    }
  } else return false;
  return true;
}

export default {
  cloneDeep,
  merge: (...sources) => mergeDeep({}, ...sources),
  compareStyle,
  arrayEquals,
  sum,
  rangeEach,
  rangeSum,
  rangeReduceIf,
  deleteProperty,
};
