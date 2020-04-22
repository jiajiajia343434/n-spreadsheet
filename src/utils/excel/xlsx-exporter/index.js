import Excel from 'exceljs';
import { expr2xy } from '../../../model/alphabet';
import Color from '../xlsx-importer/color';

function transBorder(source, target, position) {
  if (Array.isArray(source[position])) {
    const b = {};
    const [style, color] = source[position];
    if (style) {
      b.style = style;
    }
    if (color) {
      b.color = { argb: Color.transRgbToArgb(color) };
    }
    target[position] = b;
  }
}

export default class {
  constructor() {
    this.workbook = new Excel.Workbook();
  }

  setData(sheetsData) {
    if (Array.isArray(sheetsData)) {
      const { workbook } = this;
      workbook.creator = '河北新禾科技';
      workbook.lastModifiedBy = '河北新禾科技';
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.lastPrinted = new Date();
      sheetsData.forEach((s) => {
        const options = {
          views: [],
        };
        // resolve frozen
        const freeze = {
          x: 0,
          y: 0,
        };
        if (s.freeze) {
          const [x, y] = expr2xy(s.freeze);
          freeze.x = x;
          freeze.y = y;
        }
        if (freeze.x > 0 || freeze.y > 0) {
          options.views.push({ state: 'frozen', xSplit: freeze.x, ySplit: freeze.y });
        }
        // add target sheet
        const sheet = workbook.addWorksheet(s.name, options);

        const styleSheet = [];
        if (s.styles) {
          styleSheet.push(...s.styles);
        }
        if (s.rows) {
          const rowKeys = Object.keys(s.rows);
          rowKeys.forEach((rowKey) => {
            const ri = Number.parseInt(rowKey, 10);
            if (!Number.isNaN(ri)) {
              // origin row object
              const r = s.rows[rowKey];
              // add target row, 1-based
              const row = sheet.getRow(ri + 1);
              // resolve row height
              if (typeof r.height === 'number') {
                row.height = r.height / 1.2;
              }
              // resolve hidden
              if (typeof r.hide === 'boolean') {
                row.hidden = r.hide;
              }
              if (r.cells) {
                const cellKeys = Object.keys(r.cells);
                cellKeys.forEach((cellKey) => {
                  const ci = Number.parseInt(cellKey, 10);
                  if (!Number.isNaN(ci)) {
                    // origin cell object
                    const c = r.cells[cellKey];
                    // add target cell, 1-based
                    const cell = row.getCell(ci + 1);
                    // resolve value, todo resolve formula
                    cell.value = c.text;
                    // resolve comment
                    if (c.comment) {
                      cell.note = c.comment;
                    }
                    // resolve styles
                    if (typeof c.style === 'number') {
                      // origin cell style
                      const oStyle = styleSheet[c.style];
                      // target font object
                      const font = {};
                      // todo numFmt
                      // resolve font
                      if (oStyle.font) {
                        if (oStyle.font.name) {
                          font.name = oStyle.font.name;
                        }
                        if (oStyle.font.size) {
                          font.size = oStyle.font.size;
                        }
                        if (typeof oStyle.font.bold === 'boolean') {
                          font.bold = oStyle.font.bold;
                        }
                        if (typeof oStyle.font.italic === 'boolean') {
                          font.italic = oStyle.font.italic;
                        }
                      }
                      if (oStyle.color) {
                        font.color = { argb: Color.transRgbToArgb(oStyle.color) };
                      }
                      if (oStyle.underline) {
                        font.underline = oStyle.underline;
                      }
                      if (typeof oStyle.strike === 'boolean') {
                        font.strike = oStyle.strike;
                      }
                      cell.font = font;
                      // resolve alignment
                      if (oStyle.align || oStyle.valign || typeof oStyle.textwrap === 'boolean') {
                        const alignment = {};
                        if (oStyle.align) {
                          alignment.horizontal = oStyle.align;
                        }
                        if (oStyle.valign) {
                          alignment.vertical = oStyle.valign;
                        }
                        if (typeof oStyle.textwrap === 'boolean') {
                          alignment.wrapText = oStyle.textwrap;
                        }
                        cell.alignment = alignment;
                      }
                      // resolve borders
                      if (oStyle.border) {
                        // target border object
                        const border = {};
                        transBorder(oStyle.border, border, 'left');
                        transBorder(oStyle.border, border, 'right');
                        transBorder(oStyle.border, border, 'top');
                        transBorder(oStyle.border, border, 'bottom');
                        cell.border = border;
                      }
                      // resolve fill
                      if (oStyle.bgcolor) {
                        cell.fill = {
                          type: 'pattern',
                          pattern: 'solid',
                          fgColor: { argb: Color.transRgbToArgb(oStyle.bgcolor) },
                        };
                      }
                    }
                  }
                });
              }
            }
          });
        }
        // resolve merges
        if (Array.isArray(s.merges)) {
          s.merges.forEach((merge) => {
            sheet.mergeCells(merge);
          });
        }
        // sheet.commit();
        // resolve column properties
        if (s.cols) {
          const colKeys = Object.keys(s.cols);
          colKeys.forEach((colKey) => {
            const ci = Number.parseInt(colKey, 10);
            if (!Number.isNaN(ci)) {
              const c = s.cols[colKey];
              if (typeof c.width === 'number') {
                sheet.getColumn(ci + 1).width = c.width / 8;
              }
            }
          });
        }
        // sheet.commit();
      });
    }
    return this;
  }

  exportWithBuffer() {
    return this.workbook.xlsx.writeBuffer();
  }
}
