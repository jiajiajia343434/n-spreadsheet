import { stringAt, xy2expr } from '../model/alphabet';
import { getFontSizePxByPt } from '../model/font';
import { formatm } from '../model/format';

import { Draw, DrawBox, npx, thinLineWidth } from '../canvas/draw';
import cellModel from '../model/cell';
import { formulam } from '../formula/formula';
// gobal var
const cellPaddingWidth = 1;
const tableFixedHeaderCleanStyle = { fillStyle: '#f4f5f8' };
const tableGridStyle = {
  fillStyle: '#fff',
  lineWidth: thinLineWidth,
  strokeStyle: '#d3d3d3',
};

function tableFixedHeaderStyle() {
  return {
    textAlign: 'center',
    textBaseline: 'middle',
    font: `500 ${npx(12)}px Source Sans Pro`,
    fillStyle: '#585757',
    lineWidth: thinLineWidth(),
    strokeStyle: '#e6e6e6',
  };
}

function getDrawBox(data, rindex, cindex, yoffset = 0) {
  const {
    left, top, width, height,
  } = data.cellRect(rindex, cindex);
  return new DrawBox(left, top + yoffset, width, height, cellPaddingWidth);
}

/*
function renderCellBorders(bboxes, translateFunc) {
  const { draw } = this;
  if (bboxes) {
    const rset = new Set();
    // console.log('bboxes:', bboxes);
    bboxes.forEach(({ ri, ci, box }) => {
      if (!rset.has(ri)) {
        rset.add(ri);
        translateFunc(ri);
      }
      draw.strokeBorders(box);
    });
  }
}
*/

export function renderCell(draw, data, rindex, cindex, yoffset = 0) {
  const { sortedRowMap, rows, cols } = data;
  if (rows.isHide(rindex) || cols.isHide(cindex)) return;
  let nrindex = rindex;
  if (sortedRowMap.has(rindex)) {
    nrindex = sortedRowMap.get(rindex);
  }

  const cell = data.getCell(nrindex, cindex);
  if (cell === null) return;
  let frozen = false;
  if ('editable' in cell && cell.editable === false) {
    frozen = true;
  }
  const { comment } = cell;

  const style = data.getCellStyleOrDefault(nrindex, cindex);
  const dbox = getDrawBox(data, rindex, cindex, yoffset);
  dbox.bgcolor = style.bgcolor;
  // console.log('cell:', rindex, cindex);
  draw.rect(dbox, () => {
    // render text
    let cellText = cell.text;
    if (cell[Symbol.for('err')]) {
      cellText = cell[Symbol.for('err')].message;
    }
    // optimize performance. do calculation in data model, not in UI. 2022-07-20
    // if (cell.formula) {
    //   const deps = new Set();
    //   cellText = cellModel.calFormula(`=${cell.formula}`, formulam,
    //     (y, x) => (data.getCellTextOrDefault(x, y)), deps);
    //   const name = xy2expr(cindex, rindex);
    //   // set dependence
    //   data.cellDepsList[name] = deps;
    // } else {
    //   cellText = cell.text || '';
    // }
    // render format
    if (style.format) {
      // console.log(data.formatm, '>>', cell.format);
      cellText = formatm[style.format].render(cellText);
    }
    // render text
    const font = Object.assign({}, style.font);
    draw.text(cellText, dbox, {
      align: style.align,
      valign: style.valign,
      font,
      color: style.color,
      strike: style.strike,
      underline: style.underline,
    }, style.textwrap, cell.richText);
    // error
    const error = data.validations.getError(rindex, cindex);
    if (error) {
      // console.log('error:', rindex, cindex, error);
      draw.error(dbox);
    }
    if (frozen) {
      draw.frozen(dbox);
    }
    if (comment) {
      draw.comment(dbox);
    }
  });
  if (style.border !== undefined) {
    dbox.setBorders(style.border);
    draw.strokeBorders(dbox);
  }
}

function renderAutofilter(viewRange) {
  const { data, draw } = this;
  if (viewRange) {
    const { autoFilter } = data;
    if (!autoFilter.active()) return;
    const afRange = autoFilter.hrange();
    if (viewRange.intersects(afRange)) {
      afRange.each((ri, ci) => {
        const dbox = getDrawBox(data, ri, ci);
        draw.dropdown(dbox);
      });
    }
  }
}

function renderContent(viewRange, fw, fh, tx, ty) {
  const { draw, data } = this;
  draw.save();
  draw.translate(fw, fh)
    .translate(tx, ty);

  const { exceptRowSet } = data;
  // const exceptRows = Array.from(exceptRowSet);
  const filteredTranslateFunc = (ri) => {
    const ret = exceptRowSet.has(ri);
    if (ret) {
      const height = data.rows.getHeight(ri);
      draw.translate(0, -height);
    }
    return !ret;
  };

  const exceptRowTotalHeight = data.exceptRowTotalHeight(viewRange.sri, viewRange.eri);
  // 1 render cell
  draw.save();
  draw.translate(0, -exceptRowTotalHeight);
  viewRange.each((ri, ci) => {
    renderCell(draw, data, ri, ci);
  }, ri => filteredTranslateFunc(ri));
  draw.restore();


  // 2 render mergeCell
  const rset = new Set();
  draw.save();
  draw.translate(0, -exceptRowTotalHeight);
  data.eachMergesInView(viewRange, ({ sri, sci, eri }) => {
    if (!exceptRowSet.has(sri)) {
      renderCell(draw, data, sri, sci);
    } else if (!rset.has(sri)) {
      rset.add(sri);
      const height = data.rows.sumHeight(sri, eri + 1);
      draw.translate(0, -height);
    }
  });
  draw.restore();

  // 3 render autofilter
  renderAutofilter.call(this, viewRange);

  draw.restore();
}

function renderSelectedHeaderCell(x, y, w, h) {
  const { draw } = this;
  draw.save();
  draw.attr({ fillStyle: 'rgba(75, 137, 255, 0.08)' })
    .fillRect(x, y, w, h);
  draw.restore();
}

// viewRange
// type: all | left | top
// w: the fixed width of header
// h: the fixed height of header
// tx: moving distance on x-axis
// ty: moving distance on y-axis
function renderFixedHeaders(type, viewRange, w, h, tx, ty) {
  const { draw, data } = this;
  const sumHeight = viewRange.h; // rows.sumHeight(viewRange.sri, viewRange.eri + 1);
  const sumWidth = viewRange.w; // cols.sumWidth(viewRange.sci, viewRange.eci + 1);
  const nty = ty + h;
  const ntx = tx + w;

  draw.save();
  // draw rect background
  draw.attr(tableFixedHeaderCleanStyle);
  if (type === 'all' || type === 'left') draw.fillRect(0, nty, w, sumHeight);
  if (type === 'all' || type === 'top') draw.fillRect(ntx, 0, sumWidth, h);

  const {
    sri, sci, eri, eci,
  } = data.selector.range;
  // console.log(data.selectIndexes);
  // draw text
  // text font, align...
  draw.attr(tableFixedHeaderStyle());
  // y-header-text
  if (type === 'all' || type === 'left') {
    data.rowEach(viewRange.sri, viewRange.eri, (i, y1, rowHeight) => {
      const y = nty + y1;
      const ii = i;
      draw.line([0, y], [w, y]);
      if (sri <= ii && ii < eri + 1) {
        renderSelectedHeaderCell.call(this, 0, y, w, rowHeight);
      }
      draw.fillText(ii + 1, w / 2, y + (rowHeight / 2));
      if (i > 0 && data.rows.isHide(i - 1)) {
        draw.save();
        draw.attr({ strokeStyle: '#c6c6c6' });
        draw.line([5, y + 5], [w - 5, y + 5]);
        draw.restore();
      }
    });
    draw.line([0, sumHeight + nty], [w, sumHeight + nty]);
    draw.line([w, nty], [w, sumHeight + nty]);
  }
  // x-header-text
  if (type === 'all' || type === 'top') {
    data.colEach(viewRange.sci, viewRange.eci, (i, x1, colWidth) => {
      const x = ntx + x1;
      const ii = i;
      draw.line([x, 0], [x, h]);
      if (sci <= ii && ii < eci + 1) {
        renderSelectedHeaderCell.call(this, x, 0, colWidth, h);
      }
      draw.fillText(stringAt(ii), x + (colWidth / 2), h / 2);
      if (i > 0 && data.cols.isHide(i - 1)) {
        draw.save();
        draw.attr({ strokeStyle: '#c6c6c6' });
        draw.line([x + 5, 5], [x + 5, h - 5]);
        draw.restore();
      }
    });
    draw.line([sumWidth + ntx, 0], [sumWidth + ntx, h]);
    draw.line([0, h], [sumWidth + ntx, h]);
  }
  draw.restore();
}

function renderFixedLeftTopCell(fw, fh) {
  const { draw } = this;
  draw.save();
  // left-top-cell
  draw.attr({ fillStyle: '#f4f5f8' })
    .fillRect(0, 0, fw, fh);
  draw.restore();
}

function renderContentGrid({ sri, sci, eri, eci, w, h }, fw, fh, tx, ty) {
  const r = [];
  const { draw, data } = this;
  const { settings } = data;
  draw.save();
  draw.attr(tableGridStyle)
    .translate(fw + tx, fh + ty);
  // const sumWidth = cols.sumWidth(sci, eci + 1);
  // const sumHeight = rows.sumHeight(sri, eri + 1);
  // console.log('sumWidth:', sumWidth);
  draw.clearRect(0, 0, w, h);
  if (!settings.showGrid) {
    draw.restore();
    return r;
  }
  // console.log('rowStart:', rowStart, ', rowLen:', rowLen);
  data.rowEach(sri, eri, (i, y, ch) => {
    // console.log('y:', y);
    if (i !== sri) draw.line([0, y], [w, y]);
    if (i === eri) {
      draw.line([0, y + ch], [w, y + ch]);
      r[0] = y + ch;
    }
  });
  data.colEach(sci, eci, (i, x, cw) => {
    if (i !== sci) draw.line([x, 0], [x, h]);
    if (i === eci) {
      draw.line([x + cw, 0], [x + cw, h]);
      r[1] = x + cw;
    }
  });
  draw.restore();
  return r;
}

function renderFreezeHighlightLine(fw, fh, ftw, fth, boundary) {
  const { draw, data } = this;
  const twidth = boundary[0][1] ? boundary[0][1] : data.viewWidth() / data.scale - fw;
  const theight = boundary[1][0] ? boundary[1][0] : data.viewHeight() / data.scale - fh;
  draw.save()
    .translate(fw, fh)
    .attr({ strokeStyle: 'rgba(75, 137, 255, .6)' });
  draw.line([0, fth], [twidth, fth]);
  draw.line([ftw, 0], [ftw, theight]);
  draw.restore();
}

function renderFreezeMask(fw, fh, ftw, fth, boundary) {
  const { draw, data } = this;
  const twidth = boundary[0][1] ? boundary[0][1] : data.viewWidth() / data.scale - fw;
  const theight = boundary[1][0] ? boundary[1][0] : data.viewHeight() / data.scale - fh;
  draw.save();
  draw.attr({ fillStyle: 'rgba(75, 137, 255, .2)' });
  // cross
  draw.fillRect(data.cols.indexWidth, data.rows.height, ftw, fth);
  // right
  draw.fillRect(ftw + data.cols.indexWidth, data.rows.height, twidth, fth);
  // bottom
  draw.fillRect(data.cols.indexWidth, fth + data.rows.height, ftw, theight);
  draw.restore();
}

/** end */
class Table {
  constructor(el, data) {
    this.el = el;
    this.data = data;
    this.draw = new Draw(el, data.viewWidth(), data.viewHeight());
  }

  resetData(data) {
    this.data = data;
    this.render();
  }

  calFitColWidth(colIdx) {
    const { rows } = this.data;
    let maxWidth = 0;
    rows.each((ri, row) => {
      if (row.cells && row.cells[colIdx] && typeof row.cells[colIdx].merge === 'undefined') {
        const cell = row.cells[colIdx];
        if (cell.text) {
          let { size, name } = this.data.settings.style.font;
          if (Number.isInteger(cell.style)) {
            const style = this.data.styles[cell.style];
            if (style.font) {
              if (style.font.name) {
                // eslint-disable-next-line prefer-destructuring
                name = style.font.name;
              }
              if (style.font.size) {
                // eslint-disable-next-line prefer-destructuring
                size = style.font.size;
              }
            }
          }
          let width = 0;
          cell.text.split('\n').forEach((line) => {
            this.draw.ctx.save();
            this.draw.ctx.font = `${getFontSizePxByPt(size)}px ${name}`;
            const lineWidth = this.draw.ctx.measureText(line).width;
            width = lineWidth > width ? lineWidth : width;
            this.draw.ctx.restore();
          });
          // const nWidth = this.draw.npx(width);
          const nWidth = width;
          if (nWidth > maxWidth) {
            maxWidth = nWidth;
          }
        }
      }
    });
    if (maxWidth !== 0) {
      this.data.cols.setWidth(colIdx, maxWidth + 10);
    }
  }

  render() {
    // resize canvas
    const { data } = this;
    const { rows, cols, scale } = data;
    // fixed width of header
    const fw = cols.indexWidth;
    // fixed height of header
    const fh = rows.height;

    // resize and clear
    this.draw.resize(data.viewWidth(), data.viewHeight());

    this.draw.ctx.scale(scale, scale);

    const viewRange = data.viewRange();
    const tx = data.freezeTotalWidth() / scale;
    const ty = data.freezeTotalHeight() / scale;

    let { x, y } = data.scroll;
    x /= scale;
    y /= scale;

    // 1
    renderContentGrid.call(this, viewRange, fw, fh, tx, ty);
    renderContent.call(this, viewRange, fw, fh, -x, -y);
    renderFixedHeaders.call(this, 'all', viewRange, fw, fh, tx, ty);
    renderFixedLeftTopCell.call(this, fw, fh);
    const [fri, fci] = data.freeze;
    if (fri > 0 || fci > 0) {
      const boundary = [[undefined, 0], [0, undefined]];
      // 2
      if (fri > 0) {
        const vr = viewRange.clone();
        vr.sri = 0;
        vr.eri = fri - 1;
        vr.h = ty;
        boundary[0] = renderContentGrid.call(this, vr, fw, fh, tx, 0);
        renderContent.call(this, vr, fw, fh, -x, 0);
        renderFixedHeaders.call(this, 'top', vr, fw, fh, tx, 0);
      }
      // 3
      if (fci > 0) {
        const vr = viewRange.clone();
        vr.sci = 0;
        vr.eci = fci - 1;
        vr.w = tx;
        boundary[1] = renderContentGrid.call(this, vr, fw, fh, 0, ty);
        renderFixedHeaders.call(this, 'left', vr, fw, fh, 0, ty);
        renderContent.call(this, vr, fw, fh, 0, -y);
      }
      // 4
      const freezeViewRange = data.freezeViewRange();
      renderContentGrid.call(this, freezeViewRange, fw, fh, 0, 0);
      renderFixedHeaders.call(this, 'all', freezeViewRange, fw, fh, 0, 0);
      renderContent.call(this, freezeViewRange, fw, fh, 0, 0);
      // 5
      renderFreezeHighlightLine.call(this, fw, fh, tx, ty, boundary);
      renderFreezeMask.call(this, fw, fh, tx, ty, boundary);
    }
  }
}

export default Table;
