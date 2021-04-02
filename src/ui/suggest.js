import { h } from './element';
import { bindClickoutside, unbindClickoutside } from './event';
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
  if (this.itemIndex < 0) this.itemIndex = 0;
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

export default class Suggest {
  constructor(items, itemClick, width = '200px') {
    this.filterItems = [];
    this.items = items;
    this.el = h('div', `${cssPrefix}-suggest`).css('width', width).hide();
    this.itemClick = itemClick;
    this.itemIndex = -1;
    this.position = {};
  }

  setOffset(v) {
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
    const { top, bottom, height } = el.box();
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
    el.el.onwheel = (event) => {
      event.stopPropagation();
    };
    bindClickoutside(el.parent(), () => {
      this.hide();
      // el.css('position', 'absolute');
    });
  }

  bindInputEvents(input) {
    input.on('keydown', evt => inputKeydownHandler.call(this, evt));
  }
}
