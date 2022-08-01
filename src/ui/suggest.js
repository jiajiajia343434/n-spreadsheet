import { h } from './element';
import { bind, bindClickoutside, unbind, unbindClickoutside } from './event';
import { cssPrefix } from '../config';

function inputMovePrev(evt) {
  evt.preventDefault();
  evt.stopPropagation();
  const { filterItems } = this;
  if (filterItems.length <= 0) return;
  const parent = filterItems[0].parent();
  if (this.itemIndex >= 0) filterItems[this.itemIndex].toggle();
  this.itemIndex -= 1;
  if (this.itemIndex < 0) {
    this.itemIndex = filterItems.length - 1;
    parent.scroll({
      top: parent.el.scrollHeight,
    });
  } else {
    const height = parent.el.offsetHeight;
    if (filterItems[this.itemIndex].box().y < parent.box().y
      || filterItems[this.itemIndex].box().y + filterItems[this.itemIndex].el.offsetHeight
      > parent.box().y + height) {
      parent.scroll({
        top: filterItems[this.itemIndex].el.offsetTop,
      });
    }
  }
  filterItems[this.itemIndex].toggle();
}

function inputMoveNext(evt) {
  evt.stopPropagation();
  const { filterItems } = this;
  if (filterItems.length <= 0) return;
  const parent = filterItems[0].parent();
  if (this.itemIndex >= 0) filterItems[this.itemIndex].toggle();
  this.itemIndex += 1;
  if (this.itemIndex > filterItems.length - 1) {
    this.itemIndex = 0;
    parent.scroll({
      top: 0,
    });
  } else {
    const height = parent.el.offsetHeight;
    // const { top } = parent.scroll();
    // if (top + height <= filterItems[this.itemIndex].el.offsetTop
    //   + filterItems[this.itemIndex].el.offsetHeight) {
    //   parent.scroll({
    //     top: top + filterItems[this.itemIndex].el.offsetHeight,
    //   });
    // } else if (top >= filterItems[this.itemIndex].el.offsetTop) {
    //   parent.scroll({
    //     top: filterItems[this.itemIndex].el.offsetTop
    //       + height
    //       - filterItems[this.itemIndex].el.offsetHeight,
    //   });
    // }
    if (filterItems[this.itemIndex].box().y < parent.box().y
      || filterItems[this.itemIndex].box().y + filterItems[this.itemIndex].el.offsetHeight
      > parent.box().y + height) {
      parent.scroll({
        top: filterItems[this.itemIndex].el.offsetTop
          - height
          + filterItems[this.itemIndex].el.offsetHeight,
      });
    }
  }
  filterItems[this.itemIndex].toggle();
}

function inputEnter(evt) {
  evt.preventDefault();
  const { filterItems } = this;
  if (filterItems.length <= 0) return;
  evt.stopPropagation();
  if (this.itemIndex < 0) {
    // this.itemIndex = 0;  <- 默认选中第一个
    // 默认不选中 v
    this.hide();
    return;
  }
  filterItems[this.itemIndex].el.click();
  this.hide();
}

function inputKeydownHandler(evt) {
  const { keyCode } = evt;
  if (evt.ctrlKey) {
    evt.stopPropagation();
  }
  switch (keyCode) {
    case 37: // left
      evt.stopPropagation();
      break;
    case 38: // up
      inputMovePrev.call(this, evt);
      break;
    case 39: // right
      evt.stopPropagation();
      break;
    case 40: // down
      inputMoveNext.call(this, evt);
      break;
    case 13: // enter
      inputEnter.call(this, evt);
      break;
    case 9:
      inputEnter.call(this, evt);
      break;
    default:
      evt.stopPropagation();
      break;
  }
}

// set modal height and position
function setHeightAndPosition(el) {
  const { top, bottom, height } = el.box();
  // fix previous height
  if (this.position === 'bottom') {
    const fixedHeight = bottom - 50;
    el.css('maxHeight', `${fixedHeight}px`);
  } else {
    const fixedHeight = height + window.innerHeight - bottom - 56;
    el.css('maxHeight', `${fixedHeight}px`);
  }
  // calculate height
  if (bottom >= window.innerHeight) {
    const fixedHeight = height + window.innerHeight - bottom - 56;
    el.css('maxHeight', `${fixedHeight}px`);
  }
  if (top <= 10) {
    const fixedHeight = bottom - 50;
    el.css('maxHeight', `${fixedHeight}px`);
  }

  // set fixed can display completable
  el.css('left', `${el.box().x}px`);
  el.css('top', `${el.box().y}px`);
  el.css('position', 'fixed');
  el.css('width', `${el.parent().el.offsetWidth}px`);
}

export default class Suggest {
  constructor(items, itemClick, width = '200px') {
    this.filterItems = [];
    this.items = items;
    this.el = h('div', `${cssPrefix}-suggest`).css('width', width).hide();
    this.el.on('mouseout', () => {
      this.value = undefined;
    });
    this.itemClick = itemClick;
    this.itemIndex = -1;
    this.position = 'bottom';
    let timeout;
    this._r = () => {
      if (this.el) {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
          setHeightAndPosition.call(this, this.el);
        }, 100);
      } else {
        unbind(window, 'resize', this._r);
      }
    };
  }

  setOffset(v, position = 'bottom') {
    this.position = position;
    this.el.css('position', 'absolute');
    this.el.cssRemoveKeys('top', 'bottom')
      .offset(v);
  }

  hide() {
    const { el } = this;
    this.filterItems = [];
    this.itemIndex = -1;
    el.hide();
    unbindClickoutside(this.el.parent());
    unbind(window, 'resize', this._r);
  }

  setItems(items) {
    this.items = items;
    // this.search('');
  }

  search(word) {
    let { items } = this;
    const { el } = this;
    if (!/^\s*$/.test(word)) {
      items = items.filter(it => (it.key || it).startsWith(word.toUpperCase()));
    }
    items = items.map((it) => {
      let { title } = it;
      if (title) {
        if (typeof title === 'function') {
          title = title();
        }
      } else {
        title = it;
      }
      const item = h('div', `${cssPrefix}-item`)
        .child(title)
        .on('click.stop', () => {
          this.itemClick(it);
          this.hide();
        })
        .on('mouseover', () => {
          this.value = it;
        });
      if (it.label) {
        item.child(h('div', 'label').html(it.label));
      }
      return item;
    });
    this.filterItems = items;
    if (items.length <= 0) {
      return;
    }
    el.html('').children(...items).show();
    // items[0].toggle();
    setHeightAndPosition.call(this, el);
    el.el.onwheel = (event) => {
      event.stopPropagation();
    };

    bind(window, 'resize', this._r);
    bindClickoutside(el.parent(), () => {
      this.hide();
      // el.css('position', 'absolute');
    });
  }

  bindInputEvents(input) {
    input.on('keydown', evt => inputKeydownHandler.call(this, evt));
  }
}
