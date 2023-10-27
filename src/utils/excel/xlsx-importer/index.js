import Excel from 'exceljs';
import JSZip from 'jszip';
import Theme from './theme';
import helper from '../../../model/helper';
import Color from './color';

function setMerges(source, target) {
  const info = [];
  target.merges = [];
  const merges = source._merges;
  Object.values(merges).forEach((merge) => {
    target.merges.push(merge.range);
    info[merge.tl] = [merge.bottom - merge.top, merge.right - merge.left];
  });
  return info;
}

function setColsWidth(target, source, columnCount) {
  for (let i = 0; i < columnCount; i += 1) {
    const col = source._columns[i];
    if (typeof col.width !== 'undefined') {
      if (col.width === 0) {
        target.cols[i] = { hide: true };
      } else {
        target.cols[i] = Object.assign(target.cols[i] || {},
          { width: col.width * 8 });
      }
    }
  }
}

function resolveColor(colorScheme, indexedColors) {
  if (typeof colorScheme.theme !== 'undefined') {
    return this.theme.getColor(colorScheme.theme, colorScheme.tint);
  }
  if (colorScheme.argb) {
    return Color.transArgbToRgb(colorScheme.argb);
  }
  if (typeof colorScheme.indexed === 'number') {
    if (indexedColors.length > 0) {
      return indexedColors[colorScheme.indexed];
    }
    return Color.getDefaultIndexColor(colorScheme.indexed);
  }
  return undefined;
}

function addStyle(nstyle, styles) {
  for (let i = 0; i < styles.length; i += 1) {
    const style = styles[i];
    if (helper.compareStyle(style, nstyle)) return i;
  }
  styles.push(nstyle);
  return styles.length - 1;
}

function resolveFont(style, font, indexedColors) {
  style.font = Object.assign({}, font);
  if (font.strike) {
    style.strike = font.strike;
  }
  if (font.underline) {
    style.underline = font.underline;
  }
  if (font.color) {
    style.color = resolveColor.call(this, font.color, indexedColors);
  }
}

export default class {
  constructor() {
    this.workbook = new Excel.Workbook();
  }

  parse(arrayBuffer) {
    return new Promise((resolve, reject) => {
      this.workbook.xlsx.load(arrayBuffer).then(async () => {
        // console.log(window.xx = this.workbook);
        const indexedColors = [];
        try {
          const jsZip = await new JSZip().loadAsync(arrayBuffer);
          const xmlString = await jsZip.file('xl/styles.xml').async('text');
          const nodes = new DOMParser().parseFromString(xmlString, 'application/xml');
          const indexedColorTable = nodes.querySelectorAll('indexedColors');
          if (indexedColorTable.length > 0) {
            Array.prototype.map.call(indexedColorTable[0].children, (indexedColor, idx) => {
              indexedColors[idx] = `#${indexedColor.getAttribute('rgb').substring(2)}`;
            });
          }
        } catch (e) {
          console.warn('文件格式似乎不完整，解析indexedColor错误！', e);
        }
        window.e = this.workbook;
        this.theme = new Theme(this.workbook);
        const data = [];
        this.workbook.eachSheet((_sheet) => {
          const sheet = {};
          sheet.name = _sheet.name;
          sheet.rows = {};
          sheet.rows.len = _sheet.rowCount;
          sheet.cols = {};
          sheet.cols.len = _sheet.columnCount;
          setColsWidth(sheet, _sheet, _sheet.columnCount);
          sheet.styles = [];
          // frozen
          if (_sheet.views && _sheet.views.length > 0) {
            if (_sheet.views[0].topLeftCell) {
              sheet.freeze = _sheet.views[0].topLeftCell;
            }
          }
          const mergeInfo = setMerges(_sheet, sheet);
          for (let i = 0; i < _sheet.rowCount; i += 1) {
            const _row = _sheet._rows[i];
            if (_row) {
              const rIdx = i + 1;
              const row = {};
              row.cells = {};
              if (_row.height) {
                row.height = _row.height * 1.2;
              }
              for (let j = 0; j < _row._cells.length; j += 1) {
                const _cell = _row._cells[j];
                const cIdx = j + 1;
                if (_cell) {
                  if (_cell.master.address === _cell.address) {
                    const cell = {};
                    // console.log(_cell, _cell.numFmt, _cell.type);
                    if (typeof _cell.value === 'object') {
                      // formula resove
                      if (_cell.formula) {
                        cell.formula = _cell.formula;
                        cell.text = _cell.value.result;
                      }
                      // richText resolve
                      if (_cell.value && _cell.value.richText) {
                        cell.text = _cell.text;
                        cell.richText = [];
                        _cell.value.richText.forEach((info) => {
                          const style = {};
                          resolveFont.call(this, style, info.font || {}, indexedColors);
                          cell.richText.push({
                            text: info.text,
                            style,
                          });
                        });
                      }
                    } else {
                      cell.text = _cell.value;
                    }
                    if (_cell.style) {
                      const _style = _cell.style;
                      const style = {};
                      // font
                      if (_style.font) {
                        resolveFont.call(this, style, _style.font || {}, indexedColors);
                      }
                      // align and wrap
                      if (_style.alignment) {
                        if (_style.alignment.vertical) {
                          style.valign = _style.alignment.vertical;
                        }
                        if (_style.alignment.horizontal) {
                          style.align = _style.alignment.horizontal;
                        }
                        if (_style.alignment.wrapText) {
                          style.textwrap = true;
                        }
                      }
                      // border
                      if (_style.border && Object.keys(_style.border).length > 0) {
                        const border = Object.assign({}, _style.border);
                        Object.keys(border).forEach((key) => {
                          const s = border[key].style;
                          const c = border[key].color || {};
                          border[key] = [s, resolveColor.call(this, c, indexedColors)];
                        });
                        style.border = border;
                      }
                      // fill
                      if (_style.fill) {
                        if (_style.fill.fgColor) {
                          style.bgcolor = resolveColor.call(this,
                            _style.fill.fgColor, indexedColors);
                        } else if (_style.fill.pattern === 'solid') {
                          // system default color
                          style.bgcolor = resolveColor.call(this, { indexed: 64 }, indexedColors);
                        }
                      }
                      // numFmt
                      if (_cell.numFmt) {
                        const matchPercent = _cell.numFmt.match(/^[-+]?\d+(\.\d+)?%$/g);
                        if (matchPercent && matchPercent.length === 1) {
                          style.format = 'percent';
                        }
                      }
                      cell.style = addStyle(style, sheet.styles);
                    }
                    if (_cell.isMerged) {
                      cell.merge = mergeInfo[_cell.address];
                    }
                    // comment
                    if (_cell.note) {
                      if (typeof _cell.note !== 'string' && Array.isArray(_cell.note.texts)) {
                        _cell.note.texts.forEach((text) => {
                          if (text.font && typeof text.font.color !== 'undefined') {
                            text.font.hexColor = resolveColor.call(
                              this, text.font.color, indexedColors,
                            );
                          }
                        });
                      }
                      cell.comment = _cell.note;
                    }
                    row.cells[cIdx - 1] = cell;
                  }
                }
              }
              sheet.rows[rIdx - 1] = row;
            }
          }
          data.push(sheet);
        });
        resolve(data);
      }, (e) => {
        reject(e);
      });
    });
  }
}
