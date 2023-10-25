import {evalFormula} from '../formula/interpreter';

const calFormula = (src, formulaMap, getCellText, deps) => {
  if (src[0] === '=') {
    if (src.trim().length === 1) {
      return '=';
    }
    return evalFormula(src.substring(1), formulaMap,
        (x, y, sheetName) => calFormula(getCellText(x, y, sheetName), formulaMap, getCellText, deps), deps);
  }
  return src;
};

export default {
  calFormula,
};
