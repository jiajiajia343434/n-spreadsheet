/* global window */
import { h } from './element';
import { mouseMoveUp } from './event';
import { cssPrefix } from '../config';

export default class Resizer {
  constructor(vertical = false, minDistance, scaleFn = size => size) {
    this.moving = false;
    this.scaleFn = scaleFn;
    this.vertical = vertical;
    this.el = h('div', `${cssPrefix}-resizer ${vertical ? 'vertical' : 'horizontal'}`).children(
      this.unhideHoverEl = h('div', `${cssPrefix}-resizer-hover`)
        .on('dblclick.stop', evt => this.mousedblclickHandler(evt))
        .css('position', 'absolute').hide(),
      this.hoverEl = h('div', `${cssPrefix}-resizer-hover`)
        .on('mousedown.stop', evt => this.mousedownHandler(evt)),
      this.lineEl = h('div', `${cssPrefix}-resizer-line`).hide(),
    ).hide();
    this.clickCount = 0;
    // cell rect
    this.cRect = null;
    this.finishedFn = null;
    this.minDistance = minDistance;
    this.dbClickCallback = () => {
    };
    this.unHideFn = () => {
    };
  }

  showUnhide(index) {
    this.unhideIndex = index;
    this.unhideHoverEl.show();
  }

  hideUnhide() {
    this.unhideHoverEl.hide();
  }

  // rect : {top, left, width, height}
  // line : {width, height}
  show(rect, line) {
    const {
      moving, vertical, hoverEl, lineEl, el, unhideHoverEl, scaleFn,
    } = this;
    if (moving) return;
    this.cRect = rect;
    const {
      left, top, width, height,
    } = rect;
    el.offset({
      left: vertical ? left + width - scaleFn(5) : 0,
      top: vertical ? 0 : top + height - scaleFn(5),
    }).show();
    hoverEl.offset({
      width: vertical ? scaleFn(5) : scaleFn(width),
      height: vertical ? scaleFn(height) : scaleFn(5),
    });
    lineEl.offset({
      width: vertical ? 0 : line.width,
      height: vertical ? line.height : 0,
    });
    // unhideHoverEl.offset({
    //   left: vertical ? scaleFn(5 - width) : left,
    //   top: vertical ? top : scaleFn(5 - height),
    //   width: vertical ? scaleFn(5) : scaleFn(width),
    //   height: vertical ? scaleFn(height) : scaleFn(5),
    // });
    unhideHoverEl.offset({
      left: vertical ? scaleFn(5) - width : 0,
      top: vertical ? 0 : scaleFn(5) - height,
      width: vertical ? scaleFn(5) : scaleFn(width),
      height: vertical ? scaleFn(height) : scaleFn(5),
    });
  }

  hide() {
    this.el.offset({
      left: 0,
      top: 0,
    }).hide();
    this.hideUnhide();
  }

  mousedblclickHandler() {
    if (this.unhideIndex) {
      this.unHideFn(this.unhideIndex);
    }
  }

  mousedownHandler(evt) {
    this.clickCount += 1;
    setTimeout(() => {
      this.clickCount = 0;
    }, 200);
    if (this.clickCount >= 2) {
      if (this.vertical) {
        this.dbClickCallback(this.cRect.ci);
      } else {
        this.dbClickCallback(this.cRect.ri);
      }
      this.hide();
      this.clickCount = 0;
      return;
    }
    let startEvt = evt;
    const {
      el, lineEl, cRect, vertical, minDistance, scaleFn,
    } = this;
    let distance = vertical ? cRect.width : cRect.height;
    // console.log('distance:', distance);
    lineEl.show();
    mouseMoveUp(window, (e) => {
      this.moving = true;
      if (startEvt !== null && e.buttons === 1) {
        // console.log('top:', top, ', left:', top, ', cRect:', cRect);
        if (vertical) {
          distance += e.movementX;
          if (distance > minDistance) {
            el.css('left', `${cRect.left + distance - scaleFn(5)}px`);
          }
        } else {
          distance += e.movementY;
          if (distance > minDistance) {
            el.css('top', `${cRect.top + distance - scaleFn(5)}px`);
          }
        }
        startEvt = e;
      }
    }, () => {
      startEvt = null;
      lineEl.hide();
      this.moving = false;
      if (this.finishedFn) {
        if (distance < minDistance) distance = minDistance;
        this.finishedFn(cRect, distance);
      }
    });
  }
}
