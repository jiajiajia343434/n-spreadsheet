import { evalFormula } from '../formula/interpreter';

const calFormula = (src, formulaMap, getCellText, deps) => {
  try {
    if (src[0] === '=') {
      if (src.trim().length === 1) {
        return '=';
      }
      return evalFormula(src.substring(1), formulaMap,
        (x, y) => {
          const result = calFormula(getCellText(x, y), formulaMap, getCellText, deps);
          if (result instanceof Error) {
            throw result;
          }
          return result;
        }, deps);
    }
  } catch (e) {
    return e;
  }
  return src;
};

export default {
  calFormula,
};
