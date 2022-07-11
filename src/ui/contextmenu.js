import { h } from './element';
import { bindClickoutside, unbindClickoutside } from './event';
import { cssPrefix } from '../config';
import { tf } from '../locale/locale';

const sysMenuItems = [
  { key: 'cut', title: tf('contextmenu.cut'), label: 'Ctrl+X', privileges: [] },
  { key: 'copy', title: tf('contextmenu.copy'), label: 'Ctrl+C', privileges: [] },
  // { key: 'paste', title: tf('contextmenu.paste'), label: 'Ctrl+V', privileges: ['dataEdit', 'formatEdit'] },
  // { key: 'paste-value', title: tf('contextmenu.pasteValue'), privileges: ['dataEdit'] },
  // { key: 'paste-format', title: tf('contextmenu.pasteFormat'), privileges: ['formatEdit'] },
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
  if (item.privileges) {
    item.privileges.forEach((privilege) => {
      if (this.settings.privileges[privilege] === false) {
        hasPrivilege = false;
      }
    });
  }
  const menuEl = h('div', `${cssPrefix}-item${hasPrivilege ? '' : ' disabled'}`)
    .attr('key', item.key)
    .children(
      typeof item.title === 'function' ? item.title() : item.title || '',
      h('div', 'label').child(item.label || ''),
    );

  if (item.key === 'hide') {
    if (this.mode === 'row-col') {
      menuEl.show();
    } else {
      menuEl.hide();
    }
  }
  return menuEl;
}

function buildMenu() {
  const els = [];
  els.push(...sysMenuItems.map(it => buildMenuItem.call(this, it)));
  if (this.customMenu.length > 0 && els[els.length - 1] && els[els.length - 1].attr('key') !== 'divider') {
    els.push(buildMenuItem.call(this, { key: 'divider' }));
  }

  els.push(...this.customMenu.map(it => buildMenuItem.call(this, it)));
  return els;
}

function observe(observer, eventKey, target, sheetData) {
  const { key, handler, privileges } = observer;
  if (eventKey === key) {
    let hasPrivilege = true;
    if (privileges) {
      privileges.forEach((privilege) => {
        if (this.settings.privileges[privilege] === false) {
          hasPrivilege = false;
        }
      });
    }
    if (hasPrivilege) {
      handler(eventKey, target, sheetData);
    }
  }
}

export default class ContextMenu {
  constructor(viewFn, isHide = false, settings) {
    this.settings = settings;
    this.innerEventObservers = [];
    this.userEventObservers = [];
    this.customMenu = [];
    this.el = h('div', `${cssPrefix}-contextmenu`)
      .on('click', (e) => {
        // console.log(e.target.getAttribute('key'));
        const eventKey = e.target.getAttribute('key');
        this.innerEventObservers.forEach((observer) => {
          observe.call(this, observer, eventKey, this.target, this.sheetData);
        });
        this.userEventObservers.forEach((observer) => {
          observe.call(this, observer, eventKey, this.target, this.sheetData);
        });
        this.hide();
      })
      .hide();
    this.viewFn = viewFn;
    this.isHide = isHide;
    this.setMode('range');
    this.target = null;
    this.sheetData = null;
  }

  // row-col: the whole rows or the whole cols
  // range: select range
  setMode(mode) {
    this.mode = mode;
  }

  hide() {
    const { el } = this;
    el.hide().html('');
    unbindClickoutside(el);
  }

  show(x, y, target, sheetData) {
    if (this.isHide) return;
    const { el } = this;
    this.target = target;
    this.sheetData = sheetData;
    el.html('')
      .children(...buildMenu.call(this));
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
        .css('max-height', `${y - 4}px`)
        .css('top', 'auto');
    } else {
      el.css('top', `${y}px`)
        .css('max-height', `${view.height - y - 4}px`)
        .css('bottom', 'auto');
    }
    bindClickoutside(el);
  }

  addCustomMenu(menu) {
    if (menu.handler) {
      this.userEventObservers.push({
        key: menu.key,
        handler: menu.handler,
      });
    }
    this.customMenu.push(menu);
    return this;
  }

  removeCustomMenu(key) {
    this.userEventObservers = this.userEventObservers.filter(observer => observer.key !== key);
    this.customMenu = this.customMenu.filter(menu => menu.key !== key);
    return this;
  }

  removeAllCustomMenu() {
    this.userEventObservers = [];
    this.customMenu = [];
    return this;
  }
}
