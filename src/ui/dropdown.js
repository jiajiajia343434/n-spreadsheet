import { Element, h } from './element';
import { bindClickoutside, unbindClickoutside } from './event';
import { cssPrefix } from '../config';

export default class Dropdown extends Element {
  constructor(title, width, showArrow, placement, ...children) {
    super('div', `${cssPrefix}-dropdown ${placement}`);
    this.title = title;
    this.change = () => {
    };
    this.headerClick = () => {
    };
    if (typeof title === 'string') {
      this.title = h('div', `${cssPrefix}-dropdown-title`).child(title);
    } else if (showArrow) {
      this.title.addClass('arrow-left');
    }
    this.contentEl = h('div', `${cssPrefix}-dropdown-content`)
      .css('width', width)
      .hide();

    this.setContentChildren(...children);

    this.headerEl = h('div', `${cssPrefix}-dropdown-header`);
    this.headerEl.on('click', () => {
      if (this.contentEl.css('display') !== 'block') {
        this.show();
      } else {
        this.hide();
      }
    }).children(
      this.title,
      showArrow ? h('div', `${cssPrefix}-icon arrow-right`).child(
        h('div', `${cssPrefix}-icon-img arrow-down`),
      ) : '',
    );
    this.children(this.headerEl, this.contentEl);
  }

  setContentChildren(...children) {
    this.contentEl.html('');
    if (children.length > 0) {
      this.contentEl.children(...children);
    }
  }

  setTitle(title) {
    this.title.html(title);
    this.hide();
  }

  show() {
    const { contentEl } = this;
    contentEl.css('maxHeight', 'unset');
    contentEl.show();
    const { top, bottom, height } = contentEl.box();
    if (bottom >= window.innerHeight) {
      const fixedHeight = height + window.innerHeight - bottom - 36;
      contentEl.css('maxHeight', `${fixedHeight}px`);
    }
    if (top <= 10) {
      const fixedHeight = bottom - 50;
      contentEl.css('maxHeight', `${fixedHeight}px`);
    }
    this.parent().active();
    bindClickoutside(this.parent(), () => {
      this.hide();
    });
  }

  hide() {
    this.parent().active(false);
    this.contentEl.hide();
    unbindClickoutside(this.parent());
  }

  setContainerClass(className) {
    this.contentEl.addClass(className);
  }

  setMaxHeight(maxHeight) {
    this.contentEl.css('maxHeight', `${maxHeight - 10}px`);
  }
}
