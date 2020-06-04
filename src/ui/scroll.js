import { cssPrefix } from '../config';
import { h } from './element';

function setBlock() {
  const { block, totalLength, viewLength, scrollLength, wOrh, txOrty, scrollOffset } = this;
  let l = (viewLength ** 2) / totalLength;
  if (l < 15) {
    l = 15;
  }
  if (l > viewLength) {
    l = viewLength;
  }
  const y = scrollOffset * (viewLength - l) / scrollLength;
  block.css(wOrh, `${l}px`);
  block.css('transform', `${txOrty}(${y}px)`);
}

export default class ScrollBar {
  constructor(isVertical = false) {
    this.isVertical = isVertical;
    this.wOrh = this.isVertical ? 'height' : 'width';
    this.hOrw = this.isVertical ? 'width' : 'height';
    this.bOrr = this.isVertical ? 'bottom' : 'right';
    this.txOrty = this.isVertical ? 'translateY' : 'translateX';
    this.cxOrcy = this.isVertical ? 'clientY' : 'clientX';

    this.el = h('div', `${cssPrefix}-scroll-${isVertical ? 'y' : 'x'}-wrapper`)
      .child(this.block = h('div', `${cssPrefix}-scroll-${isVertical ? 'y' : 'x'}-block`));
    this.totalLength = 0;
    this.scrollLength = 0;
    this.viewLength = 0;
    this.scrollOffset = 0;
    this.block.on('mousedown', (evt) => {
      const start = evt[this.cxOrcy];
      const op = this.scrollOffset;
      let lastDistance = 0;
      // this.block.css(this.hOrw, '10px');
      this.block.mEvt = (mEvt) => {
        const stop = mEvt[this.cxOrcy];
        const distance = stop - start;
        if (distance > 0 && (this.scrollOffset !== this.scrollLength || lastDistance > distance)) {
          const moved = Math.floor(distance * this.totalLength / this.viewLength);
          if (op + moved >= this.scrollLength) {
            this.scrollOffset = this.scrollLength;
            lastDistance = distance;
          } else {
            this.scrollOffset = op + moved;
          }
          window.requestAnimationFrame(() => {
            setBlock.call(this);
            this.onscroll(this.scrollOffset);
          });
        }
        if (distance < 0 && (this.scrollOffset !== 0 || lastDistance < distance)) {
          const moved = Math.floor(distance * this.totalLength / this.viewLength);
          if (op + moved <= 0) {
            this.scrollOffset = 0;
            lastDistance = distance;
          } else {
            this.scrollOffset = op + moved;
          }
          window.requestAnimationFrame(() => {
            setBlock.call(this);
            this.onscroll(this.scrollOffset);
          });
        }
      };
      this.block.upEvt = () => {
        window.removeEventListener('mousemove', this.block.mEvt);
        window.removeEventListener('mouseup', this.block.upEvt);
        // this.block.css(this.hOrw, '');
        // this.block.css('background-color', '');
      };
      window.addEventListener('mousemove', this.block.mEvt);
      window.addEventListener('mouseup', this.block.upEvt);
    });
    this.onscroll = () => {
    };
  }

  setLength(viewLength, totalLength) {
    this.totalLength = totalLength;
    this.viewLength = viewLength - 12;
    this.scrollLength = totalLength - viewLength + 12;
    this.el.css(this.wOrh, `${viewLength - 12}px`);
    this.el.css(this.bOrr, '8px');
    setBlock.call(this);
  }

  moveTo(offset) {
    if (offset < 0) {
      this.scrollOffset = 0;
    } else if (offset > this.scrollLength) {
      this.scrollOffset = this.scrollLength;
    } else {
      this.scrollOffset = offset;
    }
    window.requestAnimationFrame(() => {
      setBlock.call(this);
      this.onscroll(offset);
    });
  }

  offset() {
    return this.scrollOffset;
  }

  isBottomOrRight() {
    return this.scrollOffset === this.scrollLength;
  }

  isTopOrLeft() {
    return this.scrollOffset === 0;
  }
}
