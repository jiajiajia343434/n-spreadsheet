import { h } from './element';
import { cssPrefix } from '../config';
import { CellRange } from '../model/cell_range';
import comment from './comment';
import { xy2expr } from '../model/alphabet';

const selectorHeightBorderWidth = 2 * 2 - 1;
let startZIndex = 10;

class SelectorElement {
  constructor(useHideInput = false) {
    this.useHideInput = useHideInput;
    this.inputChange = () => {
    };
    this.cornerEl = h('div', `${cssPrefix}-selector-corner`);
    this.areaEl = h('div', `${cssPrefix}-selector-area`)
      .child(this.cornerEl).hide();
    this.clipboardEl = h('div', `${cssPrefix}-selector-clipboard`).hide();
    this.autofillEl = h('div', `${cssPrefix}-selector-autofill`).hide();
    this.el = h('div', `${cssPrefix}-selector`)
      .css('z-index', `${startZIndex}`)
      .children(this.areaEl, this.clipboardEl, this.autofillEl)
      .hide();
    if (useHideInput) {
      this.hideInput = h('input', '')
        .on('input', (evt) => {
          this.inputChange(evt.target.value);
        });
      this.el.child(this.hideInputDiv = h('div', 'hide-input').child(this.hideInput));
    }
    startZIndex += 1;
  }

  setOffset(v) {
    this.el.offset(v).show();
    return this;
  }

  hide() {
    this.el.hide();
    return this;
  }

  setAreaOffset(v) {
    const {
      left, top, width, height,
    } = v;
    const of = {
      width: width - selectorHeightBorderWidth + 0.8,
      height: height - selectorHeightBorderWidth + 0.8,
      left: left - 0.8,
      top: top - 0.8,
    };
    this.areaEl.offset(of).show();
    if (this.useHideInput) {
      this.hideInputDiv.offset(of);
      this.hideInput.val('').focus();
    }
  }

  setClipboardOffset(v) {
    const {
      left, top, width, height,
    } = v;
    this.clipboardEl.offset({
      left,
      top,
      width: width - 5,
      height: height - 5,
    });
  }

  showAutofill(v) {
    const {
      left, top, width, height,
    } = v;
    this.autofillEl.offset({
      width: width - selectorHeightBorderWidth,
      height: height - selectorHeightBorderWidth,
      left,
      top,
    }).show();
  }

  hideAutofill() {
    this.autofillEl.hide();
  }

  showClipboard() {
    this.clipboardEl.show();
  }

  hideClipboard() {
    this.clipboardEl.hide();
  }
}

function calBRAreaOffset(offset) {
  const { data } = this;
  const {
    left, top, width, height, scroll, l, t,
  } = offset;
  const ftwidth = data.freezeTotalWidth();
  const ftheight = data.freezeTotalHeight();
  let left0 = left - ftwidth;
  if (ftwidth > l) left0 -= scroll.x;
  let top0 = top - ftheight;
  if (ftheight > t) top0 -= scroll.y;
  return {
    left: left0,
    top: top0,
    width,
    height,
  };
}

function calTAreaOffset(offset) {
  const { data } = this;
  const {
    left, width, height, l, t, scroll,
  } = offset;
  const ftwidth = data.freezeTotalWidth();
  let left0 = left - ftwidth;
  if (ftwidth > l) left0 -= scroll.x;
  return {
    left: left0, top: t, width, height,
  };
}

function calLAreaOffset(offset) {
  const { data } = this;
  const {
    top, width, height, l, t, scroll,
  } = offset;
  const ftheight = data.freezeTotalHeight();
  let top0 = top - ftheight;
  // console.log('ftheight:', ftheight, ', t:', t);
  if (ftheight > t) top0 -= scroll.y;
  return {
    left: l, top: top0, width, height,
  };
}

function setBRAreaOffset(offset) {
  const { br } = this;
  br.setAreaOffset(calBRAreaOffset.call(this, offset));
}

function setTLAreaOffset(offset) {
  const { tl } = this;
  tl.setAreaOffset(offset);
}

function setTAreaOffset(offset) {
  const { t } = this;
  t.setAreaOffset(calTAreaOffset.call(this, offset));
}

function setLAreaOffset(offset) {
  const { l } = this;
  l.setAreaOffset(calLAreaOffset.call(this, offset));
}

function setLClipboardOffset(offset) {
  const { l } = this;
  l.setClipboardOffset(calLAreaOffset.call(this, offset));
}

function setBRClipboardOffset(offset) {
  const { br } = this;
  br.setClipboardOffset(calBRAreaOffset.call(this, offset));
}

function setTLClipboardOffset(offset) {
  const { tl } = this;
  tl.setClipboardOffset(offset);
}

function setTClipboardOffset(offset) {
  const { t } = this;
  t.setClipboardOffset(calTAreaOffset.call(this, offset));
}

function setAllAreaOffset(offset) {
  setBRAreaOffset.call(this, offset);
  setTLAreaOffset.call(this, offset);
  setTAreaOffset.call(this, offset);
  setLAreaOffset.call(this, offset);
}

function setAllClipboardOffset(offset) {
  setBRClipboardOffset.call(this, offset);
  setTLClipboardOffset.call(this, offset);
  setTClipboardOffset.call(this, offset);
  setLClipboardOffset.call(this, offset);
}

function getText(data, ri, ci) {
  const cell = data.getCell(ri, ci);
  if (cell) {
    if (cell.formula) {
      return `=${cell.formula}`;
    }
    if (cell.text) {
      return cell.text;
    }
  }
  return '';
}

function setValueBar(data, mode, ci, ri, sci, sri) {
  if (mode === 'col') {
    const n = xy2expr(ci, ri);
    this.valueBar.update(n.substring(0, n.length - 1), getText(data, ri, ci));
  } else if (mode === 'row') {
    this.valueBar.update('', '');
  } else if (mode === 'range') {
    const n = xy2expr(sci, sri);
    this.valueBar.update(n, getText(data, sri, sci));
  } else {
    const n = xy2expr(ci, ri);
    this.valueBar.update(n, getText(data, ri, ci));
  }
}

export default class Selector {
  constructor(data, valueBar) {
    this.inputChange = () => {
    };
    this.data = data;
    this.valueBar = valueBar;
    this.br = new SelectorElement(true);
    this.t = new SelectorElement();
    this.l = new SelectorElement();
    this.tl = new SelectorElement();
    this.br.inputChange = () => {
      this.inputChange();
    };
    this.br.el.show();
    this.offset = null;
    // this.areaOffset = null;
    this.indexes = null;
    this.moveIndexes = null;
    this.range = null;
    this.arange = null;
    this.el = h('div', `${cssPrefix}-selectors`)
      .children(
        this.tl.el,
        this.t.el,
        this.l.el,
        this.br.el,
      ).hide();
    // comment
    this.comment = comment();
    this.el.children(this.comment.el);
    this.comment.hide();
    // for performance
    this.lastri = -1;
    this.lastci = -1;

    startZIndex += 1;
  }

  resetData(data) {
    this.data = data;
    this.range = data.selector.range;
    this.resetAreaOffset();
  }

  hide() {
    this.el.hide();
  }

  resetOffset() {
    const {
      data, tl, t, l, br,
    } = this;
    const freezeHeight = data.freezeTotalHeight();
    const freezeWidth = data.freezeTotalWidth();
    if (freezeHeight > 0 || freezeWidth > 0) {
      tl.setOffset({ width: freezeWidth, height: freezeHeight });
      t.setOffset({ left: freezeWidth, height: freezeHeight });
      l.setOffset({ top: freezeHeight, width: freezeWidth });
      br.setOffset({ left: freezeWidth, top: freezeHeight });
    } else {
      tl.hide();
      t.hide();
      l.hide();
      br.setOffset({ left: 0, top: 0 });
    }
  }

  resetAreaOffset() {
    const { data } = this;
    const offset = this.data.getSelectedRect();
    const coffset = this.data.getClipboardRect();
    setAllAreaOffset.call(this, offset);
    setAllClipboardOffset.call(this, coffset);
    this.resetOffset();
  }

  resetBRTAreaOffset() {
    const offset = this.data.getSelectedRect();
    const coffset = this.data.getClipboardRect();
    setBRAreaOffset.call(this, offset);
    setTAreaOffset.call(this, offset);
    setBRClipboardOffset.call(this, coffset);
    setTClipboardOffset.call(this, coffset);
    this.resetOffset();
  }

  resetBRLAreaOffset() {
    const offset = this.data.getSelectedRect();
    const coffset = this.data.getClipboardRect();
    setBRAreaOffset.call(this, offset);
    setLAreaOffset.call(this, offset);
    setBRClipboardOffset.call(this, coffset);
    setLClipboardOffset.call(this, coffset);
    this.resetOffset();
  }

  set(ri, ci, indexesUpdated = true, mode) {
    const { data } = this;
    const cellRange = data.calSelectedRangeByStart(ri, ci);
    const { sri, sci } = cellRange;
    if (indexesUpdated) {
      let [cri, cci] = [ri, ci];
      if (ri < 0) cri = 0;
      if (ci < 0) cci = 0;
      data.selector.setIndexes(cri, cci);
      this.indexes = [cri, cci];
    }
    // fixed bug: trigger range selected when move in single cell
    this.lastri = sri;
    this.lastci = sci;
    // comment
    this.comment.hide();
    if (mode === 'range') {
      const cellData = data.getCell(sri, sci);
      if (cellData && cellData.comment) {
        const { top, left, width, height } = data.getSelectedRect();
        this.comment
          .position(`${left + width + 5}px`, `${top + height + 5}px`)
          .show(cellData.comment);
      }
    }

    this.moveIndexes = [ri, ci];
    // this.sIndexes = sIndexes;
    // this.eIndexes = eIndexes;
    cellRange.mode = mode;
    this.range = cellRange;
    this.resetAreaOffset();
    this.el.show();
    setValueBar.call(this, data, mode, ci, ri, sci, sri);
  }

  setEnd(ri, ci, moving = true, mode) {
    const { data, lastri, lastci } = this;
    if (moving) {
      if (ri === lastri && ci === lastci) return false;
      this.lastri = ri;
      this.lastci = ci;
    }
    this.comment.hide();
    this.range = data.calSelectedRangeByEnd(ri, ci);
    if (mode) {
      this.range.mode = mode;
    }
    setAllAreaOffset.call(this, this.data.getSelectedRect());
    return true;
  }

  reset() {
    // console.log('::::', this.data);
    const { sri, sci, eri, eci } = this.data.selector.range;
    this.set(sri, sci, true, 'range');
    this.setEnd(eri, eci);
  }

  showAutofill(ri, ci) {
    if (ri === -1 && ci === -1) return;
    // console.log('ri:', ri, ', ci:', ci);
    // const [sri, sci] = this.sIndexes;
    // const [eri, eci] = this.eIndexes;
    const {
      sri, sci, eri, eci,
    } = this.range;
    const [nri, nci] = [ri, ci];
    // const rn = eri - sri;
    // const cn = eci - sci;
    const srn = sri - ri;
    const scn = sci - ci;
    const ern = eri - ri;
    const ecn = eci - ci;
    if (scn > 0) {
      // left
      // console.log('left');
      this.arange = new CellRange(sri, nci, eri, sci - 1);
      // this.saIndexes = [sri, nci];
      // this.eaIndexes = [eri, sci - 1];
      // data.calRangeIndexes2(
    } else if (srn > 0) {
      // top
      // console.log('top');
      // nri = sri;
      this.arange = new CellRange(nri, sci, sri - 1, eci);
      // this.saIndexes = [nri, sci];
      // this.eaIndexes = [sri - 1, eci];
    } else if (ecn < 0) {
      // right
      // console.log('right');
      // nci = eci;
      this.arange = new CellRange(sri, eci + 1, eri, nci);
      // this.saIndexes = [sri, eci + 1];
      // this.eaIndexes = [eri, nci];
    } else if (ern < 0) {
      // bottom
      // console.log('bottom');
      // nri = eri;
      this.arange = new CellRange(eri + 1, sci, nri, eci);
      // this.saIndexes = [eri + 1, sci];
      // this.eaIndexes = [nri, eci];
    } else {
      // console.log('else:');
      this.arange = null;
      // this.saIndexes = null;
      // this.eaIndexes = null;
      return;
    }
    if (this.arange !== null) {
      // console.log(this.saIndexes, ':', this.eaIndexes);
      const offset = this.data.getRect(this.arange);
      offset.width += 2;
      offset.height += 2;
      const {
        br, l, t, tl,
      } = this;
      br.showAutofill(calBRAreaOffset.call(this, offset));
      l.showAutofill(calLAreaOffset.call(this, offset));
      t.showAutofill(calTAreaOffset.call(this, offset));
      tl.showAutofill(offset);
    }
  }

  hideAutofill() {
    ['br', 'l', 't', 'tl'].forEach((property) => {
      this[property].hideAutofill();
    });
  }

  showClipboard() {
    const coffset = this.data.getClipboardRect();
    setAllClipboardOffset.call(this, coffset);
    ['br', 'l', 't', 'tl'].forEach((property) => {
      this[property].showClipboard();
    });
  }

  hideClipboard() {
    ['br', 'l', 't', 'tl'].forEach((property) => {
      this[property].hideClipboard();
    });
  }
}
