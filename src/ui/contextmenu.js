import { h } from './element';
import { bindClickoutside, unbindClickoutside } from './event';
import { cssPrefix } from '../config';
import { tf } from '../locale/locale';

const menuItems = [
  { key: 'copy', title: tf('contextmenu.copy'), label: 'Ctrl+C', privileges: [] },
  { key: 'cut', title: tf('contextmenu.cut'), label: 'Ctrl+X', privileges: [] },
  { key: 'paste', title: tf('contextmenu.paste'), label: 'Ctrl+V', privileges: ['dataEdit', 'formatEdit'] },
  { key: 'paste-value', title: tf('contextmenu.pasteValue'), privileges: ['dataEdit'] },
  { key: 'paste-format', title: tf('contextmenu.pasteFormat'), privileges: ['formatEdit'] },
  { key: 'divider' },
  { key: 'insert-row', title: tf('contextmenu.insertRow'), privileges: ['dataEdit'] },
  { key: 'insert-column', title: tf('contextmenu.insertColumn'), privileges: ['dataEdit'] },
  { key: 'divider' },
  { key: 'delete-row', title: tf('contextmenu.deleteRow'), privileges: ['dataEdit'] },
  { key: 'delete-column', title: tf('contextmenu.deleteColumn'), privileges: ['dataEdit'] },
  { key: 'delete-cell-text', title: tf('contextmenu.deleteCellText'), privileges: ['dataEdit'] },
  { key: 'hide', title: tf('contextmenu.hide'), privileges: ['formatEdit'] },
  // { key: 'divider' },
  // { key: 'validation', title: tf('contextmenu.validation') },
  // { key: 'divider' },
  // { key: 'cell-printable', title: tf('contextmenu.cellprintable') },
  // { key: 'cell-non-printable', title: tf('contextmenu.cellnonprintable') },
  // { key: 'divider' },
  // { key: 'cell-editable', title: tf('contextmenu.celleditable') },
  // { key: 'cell-non-editable', title: tf('contextmenu.cellnoneditable') },
];

function buildMenuItem(item) {
  if (item.key === 'divider') {
    return h('div', `${cssPrefix}-item divider`);
  }
  let hasPrivilege = true;
  item.privileges.map((privilege) => {
    if (this.settings.privileges[privilege] === false) {
      hasPrivilege = false;
      return '';
    }
    return '';
  });
  return h('div', `${cssPrefix}-item${hasPrivilege ? '' : ' disabled'}`)
    .on('click', () => {
      if (hasPrivilege) {
        this.itemClick(item.key);
        this.hide();
      }
    })
    .children(
      item.title(),
      h('div', 'label').child(item.label || ''),
    );
}

function buildMenu() {
  return menuItems.map(it => buildMenuItem.call(this, it));
}

export default class ContextMenu {
  constructor(viewFn, isHide = false, settings) {
    this.settings = settings;
    this.menuItems = buildMenu.call(this);
    this.el = h('div', `${cssPrefix}-contextmenu`)
      .children(...buildMenu.call(this))
      .hide();
    this.viewFn = viewFn;
    this.itemClick = () => {};
    this.isHide = isHide;
    this.setMode('range');
  }

  // row-col: the whole rows or the whole cols
  // range: select range
  setMode(mode) {
    const hideEl = this.menuItems[12];
    if (mode === 'row-col') {
      hideEl.show();
    } else {
      hideEl.hide();
    }
  }

  hide() {
    const { el } = this;
    el.hide();
    unbindClickoutside(el);
  }

  setPosition(x, y) {
    if (this.isHide) return;
    const { el } = this;
    const { width } = el.show().offset();
    const view = this.viewFn();
    const vhf = view.height / 2;
    let left = x;
    if (view.width - x <= width) {
      left -= width;
    }
    el.css('left', `${left}px`);
    if (y > vhf) {
      el.css('bottom', `${view.height - y}px`)
        .css('max-height', `${y}px`)
        .css('top', 'auto');
    } else {
      el.css('top', `${y}px`)
        .css('max-height', `${view.height - y}px`)
        .css('bottom', 'auto');
    }
    bindClickoutside(el);
  }
}
