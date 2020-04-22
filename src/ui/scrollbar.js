import { h } from './element';
import { cssPrefix } from '../config';

export default class Scrollbar {
  constructor(vertical) {
    this.vertical = vertical;
    this.moveFn = null;
    this.el = h('div', `${cssPrefix}-scrollbar ${vertical ? 'vertical' : 'horizontal'}`)
      .child(this.virtualContentEl = h('div', ''))
      .on('mousemove.stop', () => {
      })
      .on('scroll.stop', (evt) => {
        const { scrollTop, scrollLeft } = evt.target;
        // console.log('scrollTop:', scrollTop);
        if (this.moveFn) {
          const distance = this.vertical ? scrollTop : scrollLeft;
          const direction = distance > this.before ? 1 : -1;
          this.before = distance;
          this.moveFn(distance, evt, direction);
        }
        // console.log('evt:::', evt);
      });
    this.before = 0;
  }

  move(v) {
    this.el.scroll(v);
    return this;
  }

  scroll() {
    return this.el.scroll();
  }

  isBottomOrRight() {
    if (this.vertical) {
      return this.el.el.scrollTop + this.el.el.clientHeight >= this.el.el.scrollHeight;
    }
    return this.el.el.scrollLeft + this.el.el.clientWidth >= this.el.el.scrollWidth;
  }

  isTopOrLeft() {
    if (this.vertical) {
      return this.el.el.scrollTop === 0;
    }
    return this.el.el.scrollLeft === 0;
  }

  set(distance, contentDistance) {
    const d = distance - 1;
    // console.log('distance:', distance, ', contentDistance:', contentDistance);
    // if (contentDistance > d) {
    const cssKey = this.vertical ? 'height' : 'width';
    // console.log('d:', d);
    this.el.css(cssKey, `${d - 15}px`).show();
    this.virtualContentEl
      .css(this.vertical ? 'width' : 'height', '1px')
      .css(cssKey, `${contentDistance < d ? d - 14 : contentDistance}px`);
    // } else {
    //   this.el.hide();
    // }
    return this;
  }
}
