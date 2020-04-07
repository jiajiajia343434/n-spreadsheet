import {evalFormula} from '../formula/interpreter';

const cellRender = (src, formulaMap, getCellText, cellList = []) => {
  if (src[0] === '=') {
    if(src.trim().length===1){
      return '=';
    }
    return evalFormula(src.substring(1), formulaMap, (x, y) => cellRender(getCellText(x, y), formulaMap, getCellText, cellList), cellList);
  }
  return src;
};

export default {
  render: cellRender,
};
