/* global window */
import { h } from './element';
import { bind, bindTouch, mouseMoveUp } from './event';
import Resizer from './resizer';
import Scrollbar from './scrollbar';
import Selector from './selector';
import Editor from './editor';
import Print from './print';
import ContextMenu from './contextmenu';
import Table from './table';
import Toolbar from './toolbar/index';
import ModalValidation from './modal_validation';
import SortFilter from './sort_filter';
import { message } from './message';
import { cssPrefix } from '../config';
import { formulas } from '../formula/formula';
import { t as locale } from '../locale/locale';
import helper from '../model/helper';
import OperableCell from '../utils/decorator/OperableCell';

/**
 * @desc throttle fn
 * @param fn function
 * @param interval Delay in milliseconds
 */
function throttle(fn, interval) {
  let timeout;
  return (...arg) => {
    const that = this;
    const args = arg;
    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        fn.apply(that, args);
      }, interval);
    }
  };
}

/**
 * @desc debounce fn
 * @param fn function
 * @param delay Delay in milliseconds
 */
function debounce(fn, delay) {
  let timer;
  return (...arg) => {
    const that = this;
    const args = arg;
    clearTimeout(timer);
    timer = setTimeout(() => {
      // 绑定this，传入参数给callback。通常我们需要事件对象就ok
      fn.apply(that, args);
    }, delay);
  };
}

function scrollbarFitSelector() {
  const {
    data, verticalScrollbar, horizontalScrollbar,
  } = this;
  const {
    l, t, left, top, width, height,
  } = data.getSelectedRect();
  const tableOffset = this.getTableOffset();
  // console.log(',l:', l, ', left:', left, ', tOffset.left:', tableOffset.width);
  if (Math.abs(left) + width > tableOffset.width) {
    horizontalScrollbar.move({ left: l + width - tableOffset.width });
  } else {
    const fsw = data.freezeTotalWidth();
    if (left < fsw) {
      horizontalScrollbar.move({ left: l - 1 - fsw });
    }
  }
  // console.log('top:', top, ', height:', height, ', tof.height:', tableOffset.height);
  if (Math.abs(top) + height > tableOffset.height) {
    verticalScrollbar.move({ top: t + height - tableOffset.height - 1 });
  } else {
    const fsh = data.freezeTotalHeight();
    if (top < fsh) {
      verticalScrollbar.move({ top: t - 1 - fsh });
    }
  }
}

function selectorSet(multiple, ri, ci, indexesUpdated = true, moving = false) {
  if (ri === -1 && ci === -1) return;
  // console.log(multiple, ', ri:', ri, ', ci:', ci);
  const {
    table, selector, toolbar, data, contextMenu,
  } = this;
  contextMenu.setMode((ri === -1 || ci === -1) ? 'row-col' : 'range');
  const cell = data.getCell(ri, ci);
  let selectType = 'range';
  if (ri === -1) {
    selectType = 'col';
  }
  if (ci === -1) {
    selectType = 'row';
  }
  if (multiple) {
    if (selector.setEnd(ri, ci, moving, selectType)) {
      const { range } = selector;
      const view = [];
      for (let row = range.sri; row <= range.eri; row += 1) {
        view[row] = [];
        for (let col = range.sci; col <= range.eci; col += 1) {
          view[row][col] = new OperableCell(
            row, col, data.getCell(row, col) || {}, {
              setCellText: data.setCellText.bind(data, row, col),
            }, table.render.bind(table),
          );
        }
      }
      this.trigger('cells-selected', view, range);
    }
  } else {
    // trigger click event
    selector.set(ri, ci, indexesUpdated, selectType);
    const dCell = new OperableCell(
      ri, ci, cell || {}, {
        setCellText: data.setCellText.bind(data, ri, ci),
      }, table.render.bind(table),
    );
    this.trigger('cell-selected', dCell, ri, ci);
  }
  toolbar.reset();
  table.render();
}

// private methods
function overlayerMousemove(evt) {
  // console.log('x:', evt.offsetX, ', y:', evt.offsetY);
  if (evt.buttons !== 0) return;
  if (evt.target.className === `${cssPrefix}-resizer-hover`) return;
  const { offsetX, offsetY } = evt;
  const {
    rowResizer, colResizer, tableEl, data,
  } = this;
  const { rows, cols } = data;
  if (offsetX > cols.indexWidth && offsetY > rows.height) {
    rowResizer.hide();
    colResizer.hide();
    return;
  }
  const tRect = tableEl.box();
  const cRect = data.getCellRectByXY(evt.offsetX, evt.offsetY);
  if (cRect.ri >= 0 && cRect.ci === -1) {
    cRect.width = cols.indexWidth;
    rowResizer.show(cRect, {
      width: tRect.width,
    });
    if (rows.isHide(cRect.ri - 1)) {
      rowResizer.showUnhide(cRect.ri);
    } else {
      rowResizer.hideUnhide();
    }
  } else {
    rowResizer.hide();
  }
  if (cRect.ri === -1 && cRect.ci >= 0) {
    cRect.height = rows.height;
    colResizer.show(cRect, {
      height: tRect.height,
    });
    if (cols.isHide(cRect.ci - 1)) {
      colResizer.showUnhide(cRect.ci);
    } else {
      colResizer.hideUnhide();
    }
  } else {
    colResizer.hide();
  }
}

function verticalScrollbarSet() {
  const { data, verticalScrollbar } = this;
  const { height } = this.getTableOffset();
  const erth = data.exceptRowTotalHeight(0, -1);
  // console.log('erth:', erth);
  verticalScrollbar.set(height, data.rows.totalHeight() - erth);
}

function horizontalScrollbarSet() {
  const { data, horizontalScrollbar } = this;
  const { width } = this.getTableOffset();
  if (data) {
    horizontalScrollbar.set(width, data.cols.totalWidth());
  }
}

function sheetFreeze() {
  const {
    selector, data, editor,
  } = this;
  const [ri, ci] = data.freeze;
  if (ri > 0 || ci > 0) {
    const fwidth = data.freezeTotalWidth();
    const fheight = data.freezeTotalHeight();
    editor.setFreezeLengths(fwidth, fheight);
  }
  selector.resetAreaOffset();
}

function sheetReset() {
  const {
    tableEl,
    overlayerEl,
    overlayerCEl,
    table,
    toolbar,
    selector,
    el,
  } = this;
  const tOffset = this.getTableOffset();
  const vRect = this.getRect();
  tableEl.attr(vRect);
  overlayerEl.offset(vRect);
  overlayerCEl.offset(tOffset);
  el.css('width', `${vRect.width}px`);
  verticalScrollbarSet.call(this);
  horizontalScrollbarSet.call(this);
  sheetFreeze.call(this);
  table.render();
  toolbar.reset();
  selector.reset();
}

// 缩减行并匹配当前视窗
const fitAvailableRow = (sheet, refresh = true) => {
  if (sheet.data.settings.extensible.enableAll || sheet.data.settings.extensible.enableRow) {
    const { data, verticalScrollbar, selector, table } = sheet;
    const lr = data.rows.maxCell()[0] || 0;
    const { eri } = selector.range;
    const vh = verticalScrollbar.el.el.clientHeight + verticalScrollbar.scroll().top;
    // eslint-disable-next-line no-unused-vars
    const [index, axiosY, height] = helper.rangeReduceIf(
      data.freeze[0], data.settings.extensible.maxRow - 1, data.freezeTotalHeight(), 0, vh,
      i => data.rows.getHeight(i),
    );
    const ix = index
      + Math.floor(sheet.data.settings.view.height() / sheet.data.settings.row.height / 2);
    data.rows.len = Math.max(ix, lr, eri) + 1;
    if (refresh) {
      verticalScrollbarSet.call(sheet);
      table.render();
    }
  }
};

// 缩减列并匹配当前视窗
const fitAvailableColumn = (sheet, refresh = true) => {
  if (sheet.data.settings.extensible.enableAll || sheet.data.settings.extensible.enableCol) {
    const { data, horizontalScrollbar, selector, table } = sheet;
    const lc = data.rows.maxCell()[1] || 0;
    const { eci } = selector.range;
    const vw = horizontalScrollbar.el.el.clientWidth + horizontalScrollbar.scroll().left;
    // eslint-disable-next-line no-unused-vars
    const [index, axiosX, width] = helper.rangeReduceIf(
      data.freeze[1], data.settings.extensible.maxCol - 1, data.freezeTotalWidth(), 0, vw,
      i => data.cols.getWidth(i),
    );
    const ix = index
      + Math.floor(sheet.data.settings.view.width() / sheet.data.settings.col.width / 2);
    data.cols.len = Math.max(ix, lc, eci) + 1;
    if (refresh) {
      horizontalScrollbarSet.call(sheet);
      table.render();
    }
  }
};
// 增加行
const extendRow = (sheet) => {
  if (sheet.data.settings.extensible.enableAll || sheet.data.settings.extensible.enableRow) {
    sheet.data.add('row', Math.floor(sheet.data.settings.view.width() / sheet.data.settings.row.height / 2));
    verticalScrollbarSet.call(sheet);
    sheet.table.render();
    return true;
  }
  return false;
};
// 增加列
const extendColumn = (sheet) => {
  if (sheet.data.settings.extensible.enableAll || sheet.data.settings.extensible.enableCol) {
    sheet.data.add('column', Math.floor(sheet.data.settings.view.width() / sheet.data.settings.col.width / 2));
    horizontalScrollbarSet.call(sheet);
    sheet.table.render();
    return true;
  }
  return false;
};

const loopValue = (ii, vFunc) => {
  let i = ii;
  let v = 0;
  do {
    v = vFunc(i);
    i += 1;
  } while (v <= 0);
  return v;
};
// deltaX for Mac horizontal scroll
const moveX = throttle((horizontal, data, cols, horizontalScrollbar, left) => {
  if (horizontal > 0) {
    // left
    const ci = data.scroll.ci + 1;
    if (ci < cols.len) {
      const cw = loopValue(ci, i => cols.getWidth(i));
      horizontalScrollbar.move({ left: left + cw - 1 });
    }
  } else {
    // right
    const ci = data.scroll.ci - 1;
    if (ci >= 0) {
      const cw = loopValue(ci, i => cols.getWidth(i));
      horizontalScrollbar.move({ left: ci === 0 ? 0 : left - cw });
    }
  }
}, 30);
// if (evt.detail) deltaY = evt.detail * 40;
const moveY = throttle((vertical, data, rows, verticalScrollbar, top) => {
  if (vertical > 0) {
    // up
    const ri = data.scroll.ri + 1;
    if (ri < rows.len) {
      const rh = loopValue(ri, i => rows.getHeight(i));
      verticalScrollbar.move({ top: top + rh - 1 });
    }
  } else {
    // down
    const ri = data.scroll.ri - 1;
    if (ri >= 0) {
      const rh = loopValue(ri, i => rows.getHeight(i));
      verticalScrollbar.move({ top: ri === 0 ? 0 : top - rh });
    }
  }
}, 30);

function overlayerMousescroll(evt) {
  const { verticalScrollbar, horizontalScrollbar, data } = this;
  const { top } = verticalScrollbar.scroll();
  const { left } = horizontalScrollbar.scroll();

  // console.log('evt:::', evt.wheelDelta, evt.detail * 40);
  const { rows, cols } = data;

  // deltaY for vertical delta
  const { deltaY, deltaX } = evt;

  if (verticalScrollbar.isBottomOrRight() && deltaY > 0) {
    extendRow(this);
  }
  if (horizontalScrollbar.isBottomOrRight() && deltaX > 0) {
    extendColumn(this);
  }
  if (top === 0 && deltaY < 0 && data.scroll.ri > 0) {
    fitAvailableRow(this);
  }
  if (left === 0 && deltaX < 0 && data.scroll.ci > 0) {
    fitAvailableColumn(this);
  }
  const tempY = Math.abs(deltaY);
  const tempX = Math.abs(deltaX);
  const temp = Math.max(tempY, tempX);

  // detail for windows/mac firefox vertical scroll
  if (/Firefox/i.test(window.navigator.userAgent)) throttle(moveY(evt.detail), 50);
  // if (temp === tempX) throttle(moveX(deltaX, data, cols, horizontalScrollbar, left), 50);
  if (temp === tempX) moveX(deltaX, data, cols, horizontalScrollbar, left);
  // if (temp === tempY) throttle(moveY(deltaY, data, rows, verticalScrollbar, top), 50);
  if (temp === tempY) moveY(deltaY, data, rows, verticalScrollbar, top);
}

function overlayerTouch(direction, distance) {
  const { verticalScrollbar, horizontalScrollbar } = this;
  const { top } = verticalScrollbar.scroll();
  const { left } = horizontalScrollbar.scroll();

  if (direction === 'left' || direction === 'right') {
    horizontalScrollbar.move({ left: left - distance });
  } else if (direction === 'up' || direction === 'down') {
    verticalScrollbar.move({ top: top - distance });
  }
}

// multiple: boolean
// direction: left | right | up | down | row-first | row-last | col-first | col-last
function selectorMove(multiple, direction) {
  const {
    selector, data,
  } = this;
  const { rows, cols } = data;
  let [ri, ci] = selector.indexes;
  const { eri, eci } = selector.range;
  if (multiple) {
    [ri, ci] = selector.moveIndexes;
  }
  // console.log('selector.move:', ri, ci);
  if (direction === 'left') {
    if (ci > 0) ci -= 1;
    if (ci < data.scroll.ci) {
      fitAvailableColumn(this);
    }
  } else if (direction === 'right') {
    if (eci !== ci && !multiple) ci = eci;
    if (ci < cols.len - 1) {
      ci += 1;
    } else if (ci === cols.len - 1) {
      if (extendColumn(this)) ci += 1;
    }
  } else if (direction === 'up') {
    if (ri > 0) ri -= 1;
    if (ri < data.scroll.ri) {
      fitAvailableRow(this);
    }
  } else if (direction === 'down') {
    if (eri !== ri && !multiple) ri = eri;
    if (ri < rows.len - 1) {
      ri += 1;
    } else if (ri === rows.len - 1) {
      if (extendRow(this)) ri += 1;
    }
  } else if (direction === 'row-first') {
    ci = 0;
  } else if (direction === 'row-last') {
    ci = cols.len - 1;
  } else if (direction === 'col-first') {
    ri = 0;
  } else if (direction === 'col-last') {
    ri = rows.len - 1;
  }
  if (multiple) {
    selector.moveIndexes = [ri, ci];
  }
  selectorSet.call(this, multiple, ri, ci);
  scrollbarFitSelector.call(this);
}

function clearClipboard() {
  const { data, selector } = this;
  data.clearClipboard();
  selector.hideClipboard();
}

function copy(evt) {
  if (evt && evt.target.tagName !== 'TEXTAREA') {
    const { data, selector } = this;
    const clipboardData = evt.clipboardData || window.clipboardData;
    data.copy(clipboardData);
    evt.preventDefault();
    selector.showClipboard();
  }
}

function cut(evt) {
  if (evt && evt.target.tagName !== 'TEXTAREA') {
    const { data, selector } = this;
    const clipboardData = evt.clipboardData || window.clipboardData;
    data.cut(clipboardData);
    evt.preventDefault();
    selector.showClipboard();
  }
}

function paste(what, evt) {
  // todo 粘贴格式
  // Array.prototype.map.call(
  //   evt.clipboardData.types, type => console.log(evt.clipboardData.getData(type)),
  // );
  const { data } = this;
  if (typeof evt === 'undefined' || evt.target.tagName !== 'TEXTAREA') {
    if (data.paste(what, msg => message(locale('error.tip'), msg))) {
      sheetReset.call(this);
    }
    if (evt) {
      evt.preventDefault();
    }
  }
}

function hideRowsOrCols() {
  this.data.hideRowsOrCols();
  sheetReset.call(this);
}

function unhideRowsOrCols(type, index) {
  this.data.unhideRowsOrCols(type, index);
  sheetReset.call(this);
}

function autofilter() {
  const { data } = this;
  data.autofilter();
  sheetReset.call(this);
}

function toolbarChangePaintformatPaste() {
  const { toolbar } = this;
  if (toolbar.paintformatActive()) {
    paste.call(this, 'format');
    clearClipboard.call(this);
    toolbar.paintformatToggle();
  }
}

function overlayerMousedown(evt) {
  // console.log(':::::overlayer.mousedown:', evt.detail, evt.button, evt.buttons, evt.shiftKey);
  // console.log('evt.target.className:', evt.target.className);
  const {
    selector, data, table, sortFilter,
  } = this;
  const { offsetX, offsetY } = evt;
  const isAutofillEl = evt.target.className === `${cssPrefix}-selector-corner`;
  const cellRect = data.getCellRectByXY(offsetX, offsetY);
  const {
    left, top, width, height,
  } = cellRect;
  let { ri, ci } = cellRect;
  // sort or filter
  const { autoFilter } = data;
  if (autoFilter.includes(ri, ci)) {
    if (left + width - 20 < offsetX && top + height - 20 < offsetY) {
      const items = autoFilter.items(ci, (r, c) => data.rows.getCell(r, c));
      sortFilter.set(ci, items, autoFilter.getFilter(ci), autoFilter.getSort(ci));
      sortFilter.setOffset({ left, top: top + height + 2 });
      return;
    }
  }

  // console.log('ri:', ri, ', ci:', ci);
  if (!evt.shiftKey) {
    // console.log('selectorSetStart:::');
    if (isAutofillEl) {
      selector.showAutofill(ri, ci);
    } else {
      selectorSet.call(this, false, ri, ci);
    }

    // mouse move up
    mouseMoveUp(window, (e) => {
      // console.log('mouseMoveUp::::', e);
      ({ ri, ci } = data.getCellRectByXY(e.offsetX, e.offsetY));
      if (isAutofillEl) {
        selector.showAutofill(ri, ci);
      } else if (e.buttons === 1 && !e.shiftKey) {
        selectorSet.call(this, true, ri, ci, true, true);
      }
    }, () => {
      if (isAutofillEl) {
        if (data.autofill(selector.arange, 'all', msg => message(locale('error.tip'), msg))) {
          table.render();
        }
      }
      selector.hideAutofill();
      toolbarChangePaintformatPaste.call(this);
    });
  }

  if (!isAutofillEl && evt.buttons === 1) {
    if (evt.shiftKey) {
      // console.log('shiftKey::::');
      selectorSet.call(this, true, ri, ci);
    }
  }
}

function editorSetOffset() {
  const { editor, data } = this;
  const sOffset = data.getSelectedRect();
  const tOffset = this.getTableOffset();
  let sPosition = 'top';
  // console.log('sOffset:', sOffset, ':', tOffset);
  if (sOffset.top > tOffset.height / 2) {
    sPosition = 'bottom';
  }
  editor.setOffset(sOffset, sPosition);
}

function editorSet() {
  const { editor, data, selector } = this;
  const { privileges } = data.settings;
  // 禁止编辑freeze
  // if (selector.range.sri < data.freeze[0] || selector.range.sci < data.freeze[1]) {
  //   return false;
  // }
  // 禁止编辑
  if (privileges.editable === false) {
    return false;
  }
  if (data.getSelectedCell() === null && privileges.dataEdit === false) {
    return false;
  }
  if (data.getSelectedCell() && data.getSelectedCell().editable === false) {
    return false;
  }
  editorSetOffset.call(this);
  editor.setCell(data.getSelectedCell(), data.getSelectedValidator());
  clearClipboard.call(this);
  selector.hide();
  return true;
}

// eslint-disable-next-line no-unused-vars
function verticalScrollbarMove(distance, evt) {
  const { data, table, selector } = this;
  data.scrolly(distance, () => {
    selector.resetBRLAreaOffset();
    editorSetOffset.call(this);
    table.render();
  });
}

// eslint-disable-next-line no-unused-vars
function horizontalScrollbarMove(distance, evt) {
  const { data, table, selector } = this;
  data.scrollx(distance, () => {
    selector.resetBRTAreaOffset();
    editorSetOffset.call(this);
    table.render();
  });
}

function rowResizerFinished(cRect, distance) {
  const { ri } = cRect;
  const { table, selector, data, toolbar } = this;
  data.changeData(() => {
    data.rows.setHeight(ri, distance);
  });
  table.render();
  toolbar.reset();
  selector.resetAreaOffset();
  verticalScrollbarSet.call(this);
  editorSetOffset.call(this);
}

function colResizerFinished(cRect, distance) {
  const { ci } = cRect;
  const { table, selector, data, toolbar } = this;
  data.changeData(() => {
    data.cols.setWidth(ci, distance);
  });
  table.render();
  toolbar.reset();
  selector.resetAreaOffset();
  horizontalScrollbarSet.call(this);
  editorSetOffset.call(this);
}

//
// function dataSetCellText(text, state = 'finished') {
//   const { data, table } = this;
//   data.setSelectedCellText(text, state);
//   if (state === 'finished') {
//     // const [ri, ci] = selector.indexes;
//     const { ri, ci } = data.selector;
//     this.trigger('cell-edited', text, ri, ci);
//     table.render();
//   }
// }

function dataSetCellText(text) {
  const { data, table } = this;
  // const [ri, ci] = selector.indexes;
  data.setSelectedCellText(text);
  const { ri, ci } = data.selector;
  this.trigger('cell-edited', text, ri, ci);
  table.render();
}

function insertDeleteRowColumn(type) {
  const { data } = this;
  if (type === 'insert-row') {
    data.insert('row');
  } else if (type === 'delete-row') {
    data.delete('row');
  } else if (type === 'insert-column') {
    data.insert('column');
  } else if (type === 'delete-column') {
    data.delete('column');
  } else if (type === 'delete-cell') {
    data.deleteCell();
  } else if (type === 'delete-cell-format') {
    data.deleteCell('format');
  } else if (type === 'delete-cell-text') {
    data.deleteCell('text');
  } else if (type === 'cell-printable') {
    data.setSelectedCellAttr('printable', true);
  } else if (type === 'cell-non-printable') {
    data.setSelectedCellAttr('printable', false);
  } else if (type === 'cell-editable') {
    data.setSelectedCellAttr('editable', true);
  } else if (type === 'cell-non-editable') {
    data.setSelectedCellAttr('editable', false);
  }
  clearClipboard.call(this);
  sheetReset.call(this);
}

function toolbarChange(type, value) {
  const { data } = this;
  if (type === 'undo') {
    this.undo();
  } else if (type === 'redo') {
    this.redo();
  } else if (type === 'print') {
    this.print.preview();
  } else if (type === 'paintformat') {
    if (value === true) copy.call(this);
    else clearClipboard.call(this);
  } else if (type === 'clearformat') {
    insertDeleteRowColumn.call(this, 'delete-cell-format');
  } else if (type === 'link') {
    // link
  } else if (type === 'chart') {
    // chart
  } else if (type === 'autofilter') {
    // filter
    autofilter.call(this);
  } else if (type === 'freeze') {
    if (value) {
      const { ri, ci } = data.selector;
      this.freeze(ri, ci);
    } else {
      this.freeze(0, 0);
    }
  } else {
    data.setSelectedCellAttr(type, value);
    if (type === 'formula' && !data.selector.multiple()) {
      editorSet.call(this);
    }
    sheetReset.call(this);
  }
}

function sortFilterChange(ci, order, operator, value) {
  // console.log('sort:', sortDesc, operator, value);
  this.data.setAutoFilter(ci, order, operator, value);
  sheetReset.call(this);
}

function sheetInitEvents() {
  const {
    selector,
    overlayerEl,
    rowResizer,
    colResizer,
    verticalScrollbar,
    horizontalScrollbar,
    editor,
    contextMenu,
    toolbar,
    modalValidation,
    sortFilter,
  } = this;
  // overlayer
  overlayerEl
    .on('mousemove', (evt) => {
      overlayerMousemove.call(this, evt);
    })
    .on('mousedown', (evt) => {
      // the left mouse button: mousedown → mouseup → click
      // the right mouse button: mousedown → contenxtmenu → mouseup
      editor.restore();
      contextMenu.hide();
      if (evt.buttons === 2) {
        if (!this.data.xyInSelectedRect(evt.offsetX, evt.offsetY)) {
          overlayerMousedown.call(this, evt);
        }
        contextMenu.show(evt.offsetX, evt.offsetY, selector.range, this.data);
        evt.stopPropagation();
      } else if (evt.detail === 2) {
        editorSet.call(this);
      } else {
        overlayerMousedown.call(this, evt);
      }
    })
    .on('mousewheel.stop', (evt) => {
      overlayerMousescroll.call(this, evt);
    })
    .on('mouseout', (evt) => {
      const { offsetX, offsetY } = evt;
      if (offsetY <= 0) colResizer.hide();
      if (offsetX <= 0) rowResizer.hide();
    });

  selector.inputChange = () => {
    // dataSetCellText.call(this, v, 'input');
    editorSet.call(this);
  };

  // slide on mobile
  bindTouch(overlayerEl.el, {
    move: (direction, d) => {
      overlayerTouch.call(this, direction, d);
    },
  });

  // toolbar change
  toolbar.change = (type, value) => toolbarChange.call(this, type, value);

  // sort filter ok
  sortFilter.ok = (ci, order, o, v) => sortFilterChange.call(this, ci, order, o, v);

  // resizer finished callback
  rowResizer.finishedFn = (cRect, distance) => {
    rowResizerFinished.call(this, cRect, distance);
  };
  colResizer.finishedFn = (cRect, distance) => {
    colResizerFinished.call(this, cRect, distance);
  };
  // resizer unhide callback
  rowResizer.unhideFn = (index) => {
    unhideRowsOrCols.call(this, 'row', index);
  };
  colResizer.unhideFn = (index) => {
    unhideRowsOrCols.call(this, 'col', index);
  };
  // scrollbar move callback
  const debounceFitAvailableRow = debounce((sheet) => {
    fitAvailableRow(sheet);
  }, 500);
  const debounceFitAvailableColumn = debounce((sheet) => {
    fitAvailableColumn(sheet);
  }, 500);
  verticalScrollbar.moveFn = (distance, evt) => {
    verticalScrollbarMove.call(this, distance, evt);
    debounceFitAvailableRow(this);
  };
  horizontalScrollbar.moveFn = (distance, evt) => {
    horizontalScrollbarMove.call(this, distance, evt);
    debounceFitAvailableColumn(this);
  };
  // editor
  // editor.change = (state, itext) => {
  //   dataSetCellText.call(this, itext, state);
  // };
  editor.change = (itext) => {
    dataSetCellText.call(this, itext);
  };
  // modal validation
  modalValidation.change = (action, ...args) => {
    if (action === 'save') {
      this.data.addValidation(...args);
    } else {
      this.data.removeValidation();
    }
  };
  // contextmenu
  contextMenu.innerEventObservers = [
    {
      key: 'validation',
      handler: () => {
        modalValidation.setValue(this.data.getSelectedValidation());
      },
    },
    {
      key: 'copy',
      handler: () => {
        window.document.execCommand('copy');
      },
    },
    {
      key: 'cut',
      handler: () => {
        window.document.execCommand('cut');
      },
    },
    {
      key: 'paste',
      handler: () => {
        paste.call(this, 'all');
      },
    },
    {
      key: 'paste-value',
      handler: () => {
        paste.call(this, 'text');
      },
    },
    {
      key: 'paste-format',
      handler: () => {
        paste.call(this, 'format');
      },
    },
    {
      key: 'hide',
      handler: () => {
        hideRowsOrCols.call(this);
      },
    },
    {
      key: 'insert-row',
      handler: (key) => {
        insertDeleteRowColumn.call(this, key);
      },
    },
    {
      key: 'delete-row',
      handler: (key) => {
        insertDeleteRowColumn.call(this, key);
      },
    },
    {
      key: 'insert-column',
      handler: (key) => {
        insertDeleteRowColumn.call(this, key);
      },
    },
    {
      key: 'delete-column',
      handler: (key) => {
        insertDeleteRowColumn.call(this, key);
      },
    },
    {
      key: 'delete-cell',
      handler: (key) => {
        insertDeleteRowColumn.call(this, key);
      },
    },
    {
      key: 'delete-cell-format',
      handler: (key) => {
        insertDeleteRowColumn.call(this, key);
      },
    },
    {
      key: 'delete-cell-text',
      handler: (key) => {
        insertDeleteRowColumn.call(this, key);
      },
    },
    {
      key: 'cell-printable',
      handler: (key) => {
        insertDeleteRowColumn.call(this, key);
      },
    },
    {
      key: 'cell-none-printable',
      handler: (key) => {
        insertDeleteRowColumn.call(this, key);
      },
    },
    {
      key: 'cell-editable',
      handler: (key) => {
        insertDeleteRowColumn.call(this, key);
      },
    },
    {
      key: 'cell-non-editable',
      handler: (key) => {
        insertDeleteRowColumn.call(this, key);
      },
    },
  ];

  bind(window, 'resize', () => {
    this.reload();
  });

  // bind(window, 'click', (evt) => {
  //   this.focusing = overlayerEl.contains(evt.target);
  // });

  bind(window, 'mousedown', (evt) => {
    this.focusing = overlayerEl.contains(evt.target);
  });

  bind(window, 'paste', (evt) => {
    paste.call(this, 'all', evt);
  });

  bind(window, 'beforecopy', (evt) => {
    copy.call(this, evt);
  });
  bind(window, 'beforecut', (evt) => {
    cut.call(this, evt);
  });

  // for selector
  bind(window, 'keydown', (evt) => {
    if (!this.focusing) return;
    const keyCode = evt.keyCode || evt.which;
    const {
      key, ctrlKey, shiftKey, altKey, metaKey,
    } = evt;
    // console.log('keydown.evt: ', keyCode);
    if (ctrlKey || metaKey) {
      // const { sIndexes, eIndexes } = selector;
      // let what = 'all';
      // if (shiftKey) what = 'text';
      // if (altKey) what = 'format';
      switch (keyCode) {
        case 90:
          // undo: ctrl + z
          this.undo();
          evt.preventDefault();
          break;
        case 89:
          // redo: ctrl + y
          this.redo();
          evt.preventDefault();
          break;
        case 67:
          // ctrl + c
          // copy.call(this);
          // evt.preventDefault();
          break;
        case 88:
          // ctrl + x
          // cut.call(this);
          // evt.preventDefault();
          break;
        case 85:
          // ctrl + u
          toolbar.trigger('underline');
          evt.preventDefault();
          break;
        case 86:
          // ctrl + v
          // paste.call(this, what);
          // evt.preventDefault();
          break;
        case 37:
          // ctrl + left
          selectorMove.call(this, shiftKey, 'row-first');
          evt.preventDefault();
          break;
        case 38:
          // ctrl + up
          selectorMove.call(this, shiftKey, 'col-first');
          evt.preventDefault();
          break;
        case 39:
          // ctrl + right
          selectorMove.call(this, shiftKey, 'row-last');
          evt.preventDefault();
          break;
        case 40:
          // ctrl + down
          selectorMove.call(this, shiftKey, 'col-last');
          evt.preventDefault();
          break;
        case 32:
          // ctrl + space, all cells in col
          selectorSet.call(this, false, -1, this.data.selector.ci, false);
          evt.preventDefault();
          break;
        case 66:
          // ctrl + B
          toolbar.trigger('bold');
          break;
        case 73:
          // ctrl + I
          toolbar.trigger('italic');
          break;
        default:
          break;
      }
    } else {
      // console.log('evt.keyCode:', evt.keyCode);
      switch (keyCode) {
        case 32:
          if (shiftKey) {
            // shift + space, all cells in row
            selectorSet.call(this, false, this.data.selector.ri, -1, false);
          }
          break;
        case 27: // esc
          contextMenu.hide();
          clearClipboard.call(this);
          break;
        case 37: // left
          selectorMove.call(this, shiftKey, 'left');
          evt.preventDefault();
          break;
        case 38: // up
          selectorMove.call(this, shiftKey, 'up');
          evt.preventDefault();
          break;
        case 39: // right
          selectorMove.call(this, shiftKey, 'right');
          evt.preventDefault();
          break;
        case 40: // down
          selectorMove.call(this, shiftKey, 'down');
          evt.preventDefault();
          break;
        case 9: // tab
          editor.restore();
          // shift + tab => move left
          // tab => move right
          selectorMove.call(this, false, shiftKey ? 'left' : 'right');
          evt.preventDefault();
          break;
        case 13: // enter
          if (altKey) {
            // const c = this.data.getSelectedCell();
            // const ntxt = c.text || '';
            // dataSetCellText.call(this, `${ntxt}\n`, 'input');
            // editorSet.call(this);
            const e = this.editor;
            if (e.isEditing()) {
              const ntxt = `${e.getText()}\n`;
              e.setText(ntxt);
            }
            break;
          }
          editor.restore();
          // shift + enter => move up
          // enter => move down
          selectorMove.call(this, false, shiftKey ? 'up' : 'down');
          evt.preventDefault();
          break;
        case 8: // backspace
          insertDeleteRowColumn.call(this, 'delete-cell-text');
          evt.preventDefault();
          break;
        default:
          break;
      }

      if (key === 'Delete') {
        insertDeleteRowColumn.call(this, 'delete-cell-text');
        evt.preventDefault();
      } else if ((keyCode >= 65 && keyCode <= 90)
        || (keyCode >= 48 && keyCode <= 57)
        || (keyCode >= 96 && keyCode <= 105)
        || evt.key === '='
      ) {
        // dataSetCellText.call(this, evt.key, 'input');
        if (editorSet.call(this)) {
          this.editor.setText(evt.key);
        }
      } else if (keyCode === 113) {
        // F2
        editorSet.call(this);
      }
    }
  });
}

export default class Sheet {
  constructor(targetEl, data) {
    this.eventMap = new Map();
    const { showToolbar, showContextmenu } = data.settings;
    this.el = h('div', `${cssPrefix}-sheet`);
    this.toolbar = new Toolbar(data, !showToolbar);
    this.print = new Print(data);
    targetEl.children(this.toolbar.el, this.el, this.print.el);
    this.data = data;
    // table
    this.tableEl = h('canvas', `${cssPrefix}-table`);
    // resizer
    this.rowResizer = new Resizer(false, data.rows.minHeight);
    this.colResizer = new Resizer(true, data.cols.minWidth);
    // scrollbar
    this.verticalScrollbar = new Scrollbar(true);
    this.horizontalScrollbar = new Scrollbar(false);
    // editor
    this.editor = new Editor(
      formulas,
      () => this.getTableOffset(),
      data.rows.height,
    );
    // data validation
    this.modalValidation = new ModalValidation();
    // contextMenu
    this.contextMenu = new ContextMenu(() => this.getRect(), !showContextmenu, data.settings);
    // selector
    this.selector = new Selector(data);
    this.overlayerCEl = h('div', `${cssPrefix}-overlayer-content`)
      .children(
        this.editor.el,
        this.selector.el,
      );
    this.overlayerEl = h('div', `${cssPrefix}-overlayer`)
      .child(this.overlayerCEl);
    // sortFilter
    this.sortFilter = new SortFilter();
    // root element
    this.el.children(
      this.tableEl,
      this.overlayerEl.el,
      this.rowResizer.el,
      this.colResizer.el,
      this.verticalScrollbar.el,
      this.horizontalScrollbar.el,
      this.contextMenu.el,
      this.modalValidation.el,
      this.sortFilter.el,
    );
    // table
    this.table = new Table(this.tableEl.el, data);
    sheetInitEvents.call(this);
    sheetReset.call(this);
    // init selector [0, 0]
    selectorSet.call(this, false, 0, 0);
  }

  on(eventName, func) {
    this.eventMap.set(eventName, func);
    return this;
  }

  trigger(eventName, ...args) {
    const { eventMap } = this;
    if (eventMap.has(eventName)) {
      eventMap.get(eventName).call(this, ...args);
    }
  }

  reset(data) {
    // store editing data before reset
    this.editor.restore();
    this.data = data;
    this.toolbar.resetData(data);
    this.print.resetData(data);
    this.selector.resetData(data);
    this.table.resetData(data);
    fitAvailableColumn(this, false);
    fitAvailableRow(this, false);
    sheetReset.call(this);
  }

  //
  // loadData(data) {
  //   this.data.setData(data);
  //   sheetReset.call(this);
  //   return this;
  // }

  // freeze rows or cols
  freeze(ri, ci) {
    const { data } = this;
    data.setFreeze(ri, ci);
    sheetReset.call(this);
    return this;
  }

  undo() {
    this.data.undo();
    sheetReset.call(this);
  }

  redo() {
    this.data.redo();
    sheetReset.call(this);
  }

  reload() {
    fitAvailableColumn(this, false);
    fitAvailableRow(this, false);
    sheetReset.call(this);
    return this;
  }

  getRect() {
    const { data } = this;
    return { width: data.viewWidth(), height: data.viewHeight() };
  }

  getTableOffset() {
    const { rows, cols } = this.data;
    const { width, height } = this.getRect();
    return {
      width: width - cols.indexWidth,
      height: height - rows.height,
      left: cols.indexWidth,
      top: rows.height,
    };
  }
}
