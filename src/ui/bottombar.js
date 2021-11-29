import { h } from './element';
import { bindClickoutside, unbindClickoutside } from './event';
import { cssPrefix } from '../config';
import Icon from './icon';
import FormInput from './form_input';
import Dropdown from './dropdown';
import { message } from './message';
import { t, tf } from '@/locale/locale';

class DropdownMore extends Dropdown {
  constructor(click) {
    const icon = new Icon('ellipsis');
    super(icon, 'auto', false, 'top-left');
    this.contentClick = click;
  }

  reset(items) {
    const eles = items.map((it, i) => h('div', `${cssPrefix}-item`)
      .css('width', '150px')
      .css('font-weight', 'normal')
      .on('click', () => {
        this.hide();
        this.contentClick(i);
      })
      .child(it));
    this.setContentChildren(...eles);
  }

  setTitle() {
  }
}

const menuItems = [
  { key: 'delete', title: tf('contextmenu.deleteSheet') },
  { key: 'rename', title: tf('contextmenu.renameSheet') },
];

function buildMenuItem(item) {
  return h('div', `${cssPrefix}-item`)
    .child(item.title())
    .on('click', () => {
      this.itemClick(item.key);
      this.hide();
    });
}

function buildMenu() {
  return menuItems.map(it => buildMenuItem.call(this, it));
}

class ContextMenu {
  constructor() {
    this.el = h('div', `${cssPrefix}-contextmenu`)
      .css('width', '160px')
      .css('position', 'fixed') // fix position
      .children(...buildMenu.call(this))
      .hide();
    this.itemClick = () => {
    };
  }

  hide() {
    const { el } = this;
    el.hide();
    unbindClickoutside(el);
  }

  setOffset(offset) {
    const { el } = this;
    el.offset(offset);
    el.show();
    bindClickoutside(el);
  }
}

function resetIntersectionObserver() {
  const { forwardBtn, backwardBtn, forwardObserver, backwardObserver, menuEl } = this;
  if (forwardObserver) {
    forwardObserver.disconnect();
  }
  if (backwardObserver) {
    backwardObserver.disconnect();
  }
  this.forwardObserver = new IntersectionObserver((entry) => {
    if (entry[0].intersectionRatio <= 0.5) {
      forwardBtn.addClass('active');
    }
    if (entry[0].intersectionRatio >= 0.5) {
      forwardBtn.removeClass('active');
    }
  }, {
    root: menuEl.el,
    threshold: [0, 0.99],
  });
  this.backwardObserver = new IntersectionObserver((entry) => {
    if (entry[0].intersectionRatio <= 0.5) {
      backwardBtn.addClass('active');
    }
    if (entry[0].intersectionRatio >= 0.5) {
      backwardBtn.removeClass('active');
    }
  }, {
    root: menuEl.el,
    threshold: [0, 0.99],
  });
  this.forwardObserver.observe(menuEl.children()[0]);
  this.backwardObserver.observe(menuEl.children()[menuEl.children().length - 1]);
}

function renameFn(item = this.focusEl) {
  if (this.privileges.editable && this.privileges.sheetEdit && !item.editing) {
    item.editing = true;
    const v = item.html();
    const input = new FormInput('auto', '');
    input.val(v);
    input.input.on('blur', ({ target }) => {
      const { value } = target;
      const nindex = this.dataNames.findIndex(it => it === v);
      this.renameItem(nindex, value);
      /*
      this.dataNames.splice(nindex, 1, value);
      this.moreEl.reset(this.dataNames);
      item.html('').child(value);
      this.updateFunc(nindex, value);
      */
      item.editing = false;
    });
    item.html('').child(input.el);
    input.focus();
  }
}

export default class BottomBar {
  constructor(
    addFunc = () => {
    },
    swapFunc = () => {
    },
    deleteFunc = () => {
    },
    updateFunc = () => {
    },
    zoomInFunc = () => {
    },
    zoomOutFunc = () => {
    },
    privileges,
  ) {
    this.privileges = privileges;
    this.swapFunc = swapFunc;
    this.updateFunc = updateFunc;
    this.dataNames = [];
    this.activeEl = null;
    this.focusEl = null;
    this.items = [];
    this.moreEl = new DropdownMore((i) => {
      this.clickSwap2(this.items[i]);
    });
    this.contextMenu = new ContextMenu();
    this.contextMenu.itemClick = (key) => {
      if (key === 'delete') {
        deleteFunc();
      }
      if (key === 'rename') {
        renameFn.call(this);
      }
    };
    this.el = h('div', `${cssPrefix}-bottom-bar`).children(
      this.contextMenu.el,
      h('div', `${cssPrefix}-bottom-btn-group`).children(
        privileges.editable && privileges.sheetEdit ? h('div', `${cssPrefix}-bottom-btn-add`).child(
          new Icon('add').on('click', () => {
            if (this.dataNames.length < 100) {
              addFunc();
            } else {
              message(t('error.tip'), 'Sheet数量不能超过 100');
            }
          }),
        ) : '',
        h('div', `${cssPrefix}-bottom-btn-infos`).child(this.moreEl),
        this.forwardBtn = h('div', `${cssPrefix}-bottom-btn-forward`).child(
          h('span', ''),
        ).on('click', () => {
          if (this.menuEl) {
            this.menuEl.el.scrollBy(-180, 0);
          }
        }),
        this.backwardBtn = h('div', `${cssPrefix}-bottom-btn-backward`).child(
          h('span', ''),
        ).on('click', () => {
          if (this.menuEl) {
            this.menuEl.el.scrollBy(180, 0);
          }
        }),
      ),
      this.menuEl = h('div', `${cssPrefix}-bottom-list`),
      this.zoomEl = h('div', `${cssPrefix}-bottom-zoom-group`).children(
        h('div', `${cssPrefix}-bottom-zoomOut`).on('click', () => {
          const scale = zoomOutFunc();
          this.scaleEl.html(`${parseInt(`${scale * 100}`, 10)}%`);
        }),
        this.scaleEl = h('div', `${cssPrefix}-bottom-scale`),
        h('div', `${cssPrefix}-bottom-zoomIn`).on('click', () => {
          const scale = zoomInFunc();
          this.scaleEl.html(`${parseInt(`${scale * 100}`, 10)}%`);
        }),
      ),
    );
  }

  setScale(scale) {
    this.scaleEl.html(`${parseInt(`${scale * 100}`, 10)}%`);
  }

  addItem(name, active) {
    this.dataNames.push(name);
    const item = h('li', active ? 'active' : '').child(name);
    item.on('click', () => {
      this.clickSwap2(item);
    }).on('contextmenu', (evt) => {
      const { left, bottom, y } = evt.target.getBoundingClientRect();
      this.contextMenu.setOffset({ left, bottom: bottom - y + 1 });
      this.focusEl = item;
    }).on('dblclick', () => {
      renameFn.call(this, item);
    });
    this.items.push(item);
    this.menuEl.child(item);
    this.moreEl.reset(this.dataNames);
    if (active) {
      this.clickSwap(item);
    }
    resetIntersectionObserver.call(this);
  }

  renameItem(index, value) {
    this.dataNames.splice(index, 1, value);
    this.moreEl.reset(this.dataNames);
    this.items[index].html('').child(value);
    this.updateFunc(index, value);
  }

  deleteItem() {
    const { activeEl } = this;
    let { focusEl } = this;
    this.focusEl = null;
    if (typeof focusEl === 'undefined' || focusEl === null) {
      focusEl = activeEl;
    }
    if (this.items.length > 1) {
      const index = this.items.findIndex(it => it === focusEl);
      this.items.splice(index, 1);
      this.dataNames.splice(index, 1);
      this.menuEl.removeChild(focusEl.el);
      this.moreEl.reset(this.dataNames);
      resetIntersectionObserver.call(this);
      if (activeEl === focusEl) {
        const newIndex = index >= this.items.length - 1
          ? this.items.length - 1
          : index;
        this.activeEl = this.items[newIndex];
        this.activeEl.toggle();
        return [index, 0];
      }
      return [index, -1];
    }
    return [-1];
  }

  clickSwap2(item) {
    const index = this.items.findIndex(it => it === item);
    this.clickSwap(item);
    this.activeEl.toggle();
    this.swapFunc(index);
  }

  clickSwap(item) {
    if (this.activeEl !== null) {
      this.activeEl.toggle();
    }
    this.activeEl = item;
    if (item) {
      if (item.el.scrollIntoViewIfNeeded) {
        item.el.scrollIntoViewIfNeeded(true);
      } else {
        item.el.scrollIntoView();
      }
    }
  }
}
