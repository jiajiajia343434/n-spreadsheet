import helper from './helper';
import { expr2expr, xy2expr } from './alphabet';
import cellModel from './cell';
import { formulam } from '../formula/formula';

function addProxyFn(that, name, target, ri, ci) {
  const obj = {};
  Object.defineProperty(obj, 'text', {
    enumerable: true,
    set(o) {
      obj[Symbol.for('text')] = o;
    },
    get() {
      if (obj.formula) {
        const deps = new Set();
        const result = cellModel.calFormula(`=${obj.formula}` || '', formulam, (x, y, sheetName) => {
          const cell = that.getCell(y, x, sheetName);
          if (name === xy2expr(x, y)) {
            return '';
          }
          if (cell[Symbol.for('err')]) {
            return cell[Symbol.for('err')];
          }
          return (cell && cell.text) ? cell.text : '';
        }, deps);
        if (deps.has(name)) {
          // return '#ERR';
          return new Error('#ERR');
        }
        // 公式错误
        if (result instanceof Error) {
          that.validations.validate(ri, ci, '');
          obj[Symbol.for('err')] = result;
          return undefined;
        }
        that.validations.validate(ri, ci, result);
        delete obj[Symbol.for('err')];
        return result;
      } else {
        delete obj[Symbol.for('err')];
      }
      that.validations.validate(ri, ci, obj[Symbol.for('text')]);
      return obj[Symbol.for('text')];
    },
  });
  return Object.assign(obj, target);
}

class Rows {
  constructor(globalSettings, { len, height, minHeight }, validations, sheet) {
    this.globalSettings = globalSettings;
    this._ = {};
    this.len = len;
    // default row height
    this.height = height;
    this.minHeight = minHeight;
    this.validations = validations;
    this[Symbol.for('sheet')] = sheet;
  }

  getHeight(ri) {
    if (this.isHide(ri)) return 0;
    const row = this.get(ri);
    if (row && row.height) {
      return row.height;
    }
    return this.height;
  }

  setHeight(ri, v) {
    const row = this.getOrNew(ri);
    row.height = v;
  }

  unhide(idx) {
    let index = idx;
    while (index > 0) {
      index -= 1;
      if (this.isHide(index)) {
        this.setHide(index, false);
      } else break;
    }
  }

  isHide(ri) {
    const row = this.get(ri);
    return row && row.hide;
  }

  setHide(ri, v) {
    const row = this.getOrNew(ri);
    if (v === true) row.hide = true;
    else delete row.hide;
  }


  setStyle(ri, style) {
    const row = this.getOrNew(ri);
    row.style = style;
  }

  sumHeight(min, max, exceptSet) {
    return helper.rangeSum(min, max, (i) => {
      if (exceptSet && exceptSet.has(i)) return 0;
      return this.getHeight(i);
    });
  }

  totalHeight() {
    return this.sumHeight(0, this.len);
  }

  get(ri) {
    return this._[ri];
  }

  getOrNew(ri) {
    this._[ri] = this._[ri] || { cells: {} };
    return this._[ri];
  }

  getCell(ri, ci , sheetName) {
    if(typeof sheetName !== 'undefined'){
      try {
        for (let i = 0; i < this[Symbol.for('sheet')].dataAgents.length; i += 1) {
          if (sheetName === this[Symbol.for('sheet')].dataAgents[i].name.toUpperCase()) {
            return this[Symbol.for('sheet')].dataAgents[i].rows.getCell(ri, ci);
          }
        }
      } catch (e) {
        console.warn(e);
        return null;
      }
    }else{
      const row = this.get(ri);
      if (row !== undefined && row.cells !== undefined && row.cells[ci] !== undefined) {
        return row.cells[ci];
      }
      return null;
    }
  }

  getCellMerge(ri, ci) {
    const cell = this.getCell(ri, ci);
    if (cell && cell.merge) return cell.merge;
    return [0, 0];
  }

  getCellOrNew(ri, ci) {
    const row = this.getOrNew(ri);
    if(row.cells==null){
      row.cells={};
    }
    row.cells[ci] = row.cells[ci] || addProxyFn(this, xy2expr(ci, ri), {}, ri, ci);
    return row.cells[ci];
  }

  // what: all | text | format
  setCell(ri, ci, cell, what = 'all') {
    const row = this.getOrNew(ri);
    if (what === 'all') {
      row.cells[ci] = cell;
    } else if (what === 'text') {
      row.cells[ci] = row.cells[ci] || {};
      row.cells[ci].text = cell.text;
    } else if (what === 'format') {
      row.cells[ci] = row.cells[ci] || {};
      row.cells[ci].style = cell.style;
      if (cell.merge) row.cells[ci].merge = cell.merge;
    }
  }

  setCellText(ri, ci, text, formulaText, byDeps = false) {
    const cell = this.getCellOrNew(ri, ci);
    if (byDeps || typeof cell.editable === 'undefined' || cell.editable) {
      if (formulaText) {
        cell.formula = formulaText;
      }
      if (text) {
        cell.text = text;
      }
      // todo: edit richText. only delete the richText attribute now
      if (cell.richText) {
        delete cell.richText;
      }
      return true;
    }
    return false;
  }

  setCellEditTable(ri, ci, editTable) {
    const cell = this.getCellOrNew(ri, ci);
    cell.editable=editTable

  }
  // what: all | format | text
  copyPaste(srcCellRange, dstCellRange, what, autofill = false, cb = () => {
  }) {
    const {
      sri, sci, eri, eci,
    } = srcCellRange;
    const dsri = dstCellRange.sri;
    const dsci = dstCellRange.sci;
    const deri = dstCellRange.eri;
    const deci = dstCellRange.eci;
    const [rn, cn] = srcCellRange.size();
    const [drn, dcn] = dstCellRange.size();
    // console.log(srcIndexes, dstIndexes);
    let isAdd = true;
    let dn = 0;
    if (deri < sri || deci < sci) {
      isAdd = false;
      if (deri < sri) dn = drn;
      else dn = dcn;
    }
    // console.log('drn:', drn, ', dcn:', dcn, dn, isAdd);
    for (let i = sri; i <= eri; i += 1) {
      if (this._[i]) {
        for (let j = sci; j <= eci; j += 1) {
          if (this._[i].cells && this._[i].cells[j]) {
            for (let ii = dsri; ii <= deri; ii += rn) {
              for (let jj = dsci; jj <= deci; jj += cn) {
                const nri = ii + (i - sri);
                const nci = jj + (j - sci);
                const ncell = helper.cloneDeep(this._[i].cells[j]);
                // ncell.text
                if (autofill && ncell && ncell.text && ncell.text.length > 0) {
                  const { text } = ncell;
                  let n = (jj - dsci) + (ii - dsri) + 2;
                  if (!isAdd) {
                    n -= dn + 1;
                  }
                  if (text[0] === '=') {
                    ncell.text = text.replace(/\w{1,3}\d/g, (word) => {
                      let [xn, yn] = [0, 0];
                      if (sri === dsri) {
                        xn = n - 1;
                        // if (isAdd) xn -= 1;
                      } else {
                        yn = n - 1;
                      }
                      // console.log('xn:', xn, ', yn:', yn, word, expr2expr(word, xn, yn));
                      return expr2expr(word, xn, yn);
                    });
                  } else {
                    const result = /[\\.\d]+$/.exec(text);
                    // console.log('result:', result);
                    if (result !== null) {
                      const index = Number(result[0]) + n - 1;
                      ncell.text = text.substring(0, result.index) + index;
                    }
                  }
                }
                this.setCell(nri, nci, ncell, what);
                cb(nri, nci, ncell);
              }
            }
          }
        }
      }
    }
  }

  cutPaste(srcCellRange, dstCellRange) {
    const ncellmm = {};
    this.each((ri) => {
      this.eachCells(ri, (ci) => {
        let nri = parseInt(ri, 10);
        let nci = parseInt(ci, 10);
        if (srcCellRange.includes(ri, ci)) {
          nri = dstCellRange.sri + (nri - srcCellRange.sri);
          nci = dstCellRange.sci + (nci - srcCellRange.sci);
        }
        ncellmm[nri] = ncellmm[nri] || { cells: {} };
        ncellmm[nri].cells[nci] = this._[ri].cells[ci];
      });
    });
    this._ = ncellmm;
  }

  // src: Array<Array<String>>
  paste(src, dstCellRange) {
    if (src.length <= 0) return;
    const { sri, sci } = dstCellRange;
    src.forEach((row, i) => {
      const ri = sri + i;
      row.forEach((cell, j) => {
        const ci = sci + j;
        this.setCellText(ri, ci, cell);
      });
    });
  }

  add(n) {
    if (this.len === this.globalSettings.extensible.maxRow) {
      return false;
    }
    if (this.len + n <= this.globalSettings.extensible.maxRow) {
      this.len += n;
    } else {
      this.len = this.globalSettings.extensible.maxRow;
    }
    return true;
  }

  insert(sri, n = 1) {
    const ndata = {};
    this.each((ri, row) => {
      let nri = parseInt(ri, 10);
      if (nri >= sri) {
        nri += n;
      }
      ndata[nri] = row;
    });
    this._ = ndata;
    this.len += n;
  }

  delete(sri, eri) {
    const n = eri - sri + 1;
    const ndata = {};
    this.each((ri, row) => {
      const nri = parseInt(ri, 10);
      if (nri < sri) {
        ndata[nri] = row;
      } else if (ri > eri) {
        ndata[nri - n] = row;
      }
    });
    this._ = ndata;
    this.len -= n;
  }

  insertColumn(sci, n = 1) {
    this.each((ri, row) => {
      const rndata = {};
      this.eachCells(ri, (ci, cell) => {
        let nci = parseInt(ci, 10);
        if (nci >= sci) {
          nci += n;
        }
        rndata[nci] = cell;
      });
      row.cells = rndata;
    });
  }

  deleteColumn(sci, eci) {
    const n = eci - sci + 1;
    this.each((ri, row) => {
      const rndata = {};
      this.eachCells(ri, (ci, cell) => {
        const nci = parseInt(ci, 10);
        if (nci < sci) {
          rndata[nci] = cell;
        } else if (nci > eci) {
          rndata[nci - n] = cell;
        }
      });
      row.cells = rndata;
    });
  }

  // what: all | text | format | merge
  deleteCells(cellRange, what = 'all') {
    cellRange.each((i, j) => {
      this.deleteCell(i, j, what);
    });
  }

  // what: all | text | format | merge
  deleteCell(ri, ci, what = 'all') {
    const row = this.get(ri);
    if (row !== null) {
      const cell = this.getCell(ri, ci);
      if (cell !== null) {
        if (what === 'all') {
          delete row.cells[ci];
        } else if (what === 'text') {
          if(cell.editable===false) return;
          if (cell.text) cell.text = undefined;
          if (cell.value) delete cell.value;
          if (cell.formula) delete cell.formula;
        } else if (what === 'format') {
          if (cell.style !== undefined) delete cell.style;
          if (cell.merge) delete cell.merge;
        } else if (what === 'merge') {
          if (cell.merge) delete cell.merge;
        }
      }
    }
  }

  maxCell() {
    const keys = Object.keys(this._);
    const rows = Object.values(this._);
    const lri = keys[keys.length - 1] ? keys[keys.length - 1] : 0;
    let lci = 0;
    rows.forEach((row) => {
      if (row) {
        const { cells } = row;
        const ks = Math.max(...Array.prototype.map.call(Object.keys(cells), k => parseInt(k, 10)));
        lci = ks > lci ? ks : lci;
      }
    });
    return [parseInt(lri, 10), parseInt(lci, 10)];
  }

  each(cb) {
    Object.entries(this._).forEach(([ri, row]) => {
      cb(ri, row);
    });
  }

  eachCells(ri, cb) {
    if (this._[ri] && this._[ri].cells) {
      Object.entries(this._[ri].cells).forEach(([ci, cell]) => {
        cb(ci, cell);
      });
    }
  }

  setData(d) {
    if (d.len) {
      this.len = d.len;
      delete d.len;
    }
    this._ = d;
    // 增加计算公式的拦截器
    const rowKeys = Object.keys(this._);
    for (let i = 0; i < rowKeys.length; i += 1) {
      const { cells } = this._[rowKeys[i]];
      if (cells) {
        const cellKeys = Object.keys(cells);
        for (let j = 0; j < cellKeys.length; j += 1) {
          cells[cellKeys[j]] = addProxyFn(this, xy2expr(j, i), cells[cellKeys[j]], i, j);
        }
      }
    }
  }

  getData() {
    const { len } = this;
    return Object.assign({ len }, this._);
  }
}

export default {};
export {
  Rows,
};
