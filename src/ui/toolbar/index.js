/* global window */

import Align from './align';
import Valign from './valign';
import Bold from './bold';
import Italic from './italic';
import Strike from './strike';
import Underline from './underline';
import Border from './border';
import Clearformat from './clearformat';
import TextColor from './text_color';
import FillColor from './fill_color';
import FontSize from './font_size';
import Font from './font';
import Format from './format';
import Formula from './formula';
import Freeze from './freeze';
import Merge from './merge';
import Textwrap from './textwrap';
import More from './more';

import { h } from '../element';
import { cssPrefix } from '../../config';
import { bind } from '../event';
import Redo from './redo';
import Undo from './undo';

function buildDivider() {
  return h('div', `${cssPrefix}-toolbar-divider`);
}

function initBtns2() {
  this.btns2 = [];
  this.items.forEach((it) => {
    if (Array.isArray(it)) {
      it.forEach(({ el }) => {
        const rect = el.box();
        const { marginLeft, marginRight } = el.computedStyle();
        this.btns2.push([el, rect.width + parseInt(marginLeft, 10) + parseInt(marginRight, 10)]);
      });
    } else {
      const rect = it.box();
      const { marginLeft, marginRight } = it.computedStyle();
      this.btns2.push([it, rect.width + parseInt(marginLeft, 10) + parseInt(marginRight, 10)]);
    }
  });
}

function moreResize() {
  const {
    el, btns, moreEl, btns2,
  } = this;
  const { moreBtns, contentEl } = moreEl.dd;
  el.css('width', `${this.widthFn() - 60}px`);
  const elBox = el.box();

  let sumWidth = 160;
  let sumWidth2 = 12;
  const list1 = [];
  const list2 = [];
  btns2.forEach(([it, w], index) => {
    sumWidth += w;
    if (index === btns2.length - 1 || sumWidth < elBox.width) {
      list1.push(it);
    } else {
      sumWidth2 += w;
      list2.push(it);
    }
  });
  btns.html('').children(...list1);
  moreBtns.html('').children(...list2);
  contentEl.css('width', `${sumWidth2}px`);
  if (list2.length > 0) {
    moreEl.show();
  } else {
    moreEl.hide();
  }
}

export default class Toolbar {
  constructor(data, isHide = false) {
    this.data = data;
    const { width: viewWidth } = data.settings.view;
    this.change = () => {
    };
    this.widthFn = viewWidth;
    this.isHide = isHide;
    const style = data.defaultStyle();
    if (data.settings.privileges.formatEdit) {
      this.items = [
        [
          this.undoEl = new Undo(),
          this.redoEl = new Redo(),
          // new Print(),
          // this.paintformatEl = new Paintformat(),
          this.clearformatEl = new Clearformat(),
        ],
        buildDivider(),
        [
          this.formatEl = new Format(),
        ],
        buildDivider(),
        [
          this.fontEl = new Font(),
          this.fontSizeEl = new FontSize(),
        ],
        buildDivider(),
        [
          this.boldEl = new Bold(),
          this.italicEl = new Italic(),
          this.underlineEl = new Underline(),
          this.strikeEl = new Strike(),
          this.textColorEl = new TextColor(style.color),
        ],
        buildDivider(),
        [
          this.fillColorEl = new FillColor(style.bgcolor),
          this.borderEl = new Border(),
          this.mergeEl = new Merge(),
        ],
        buildDivider(),
        [
          this.alignEl = new Align(style.align),
          this.valignEl = new Valign(style.valign),
          this.textwrapEl = new Textwrap(),
        ],
        buildDivider(),
        [
          this.freezeEl = new Freeze(),
          // this.autofilterEl = new Autofilter(),
          this.formulaEl = new Formula(),
          this.moreEl = new More(),
        ],
      ];
    } else {
      this.items = [
        [
          this.undoEl = new Undo(),
          this.redoEl = new Redo(),
          this.moreEl = new More(),
        ],
      ];
    }

    this.el = h('div', `${cssPrefix}-toolbar`);
    this.btns = h('div', `${cssPrefix}-toolbar-btns`);

    this.el.child(this.btns);
    if (isHide) {
      this.el.hide();
    } else {
      this.init();
      setTimeout(() => {
        initBtns2.call(this);
        moreResize.call(this);
      }, 0);
      bind(window, 'resize', () => {
        moreResize.call(this);
      });
    }

    window.show = () => {
      this.show();
    };
    window.hide = () => {
      this.hide();
    };
  }

  init() {
    this.items.forEach((it) => {
      if (Array.isArray(it)) {
        it.forEach((i) => {
          this.btns.child(i.el);
          i.change = (...args) => {
            this.change(...args);
          };
        });
      } else {
        this.btns.child(it.el);
      }
    });
    this.reset();
  }

  show() {
    if (this.isHide) {
      this.isHide = false;
      this.init();
      this.el.show();
    }
  }

  hide() {
    if (!this.isHide) {
      this.isHide = true;
      this.el.hide();
      this.btns.el.innerHTML = '';
    }
  }

  paintformatActive() {
    if (this.paintformatEl) {
      return this.paintformatEl.active();
    }
    return false;
  }

  paintformatToggle() {
    if (this.paintformatEl) {
      this.paintformatEl.toggle();
    }
  }

  trigger(type) {
    if (this[`${type}El`]) {
      this[`${type}El`].click();
    }
  }

  resetData(data) {
    this.data = data;
    this.reset();
  }

  reset() {
    if (this.isHide) return;
    const { data } = this;
    const style = data.getSelectedCellStyle();
    const cell = data.getSelectedCell();
    // console.log('canUndo:', data.canUndo());
    if (this.undoEl) this.undoEl.setState(!data.canUndo());
    if (this.redoEl) this.redoEl.setState(!data.canRedo());
    if (this.mergeEl) this.mergeEl.setState(data.canUnmerge(), !data.selector.multiple());
    // this.autofilterEl.setState(!data.canAutofilter());
    // this.mergeEl.disabled();
    // console.log('selectedCell:', style, cell);
    const { font } = style;
    if (this.fontEl) this.fontEl.setState(font.name);
    if (this.fontSizeEl) this.fontSizeEl.setState(font.size);
    if (this.boldEl) this.boldEl.setState(font.bold);
    if (this.italicEl) this.italicEl.setState(font.italic);
    if (this.underlineEl) this.underlineEl.setState(style.underline);
    if (this.strikeEl) this.strikeEl.setState(style.strike);
    if (this.textColorEl) this.textColorEl.setState(style.color);
    if (this.fillColorEl) this.fillColorEl.setState(style.bgcolor);
    if (this.alignEl) this.alignEl.setState(style.align);
    if (this.valignEl) this.valignEl.setState(style.valign);
    if (this.textwrapEl) this.textwrapEl.setState(style.textwrap);
    // console.log('freeze is Active:', data.freezeIsActive());
    if (this.freezeEl) this.freezeEl.setState(data.freezeIsActive());
    if (cell) {
      if (cell.format) {
        this.formatEl.setState(cell.format);
      }
    }
  }
}
