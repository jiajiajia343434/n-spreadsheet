import { h } from './element';
import { cssPrefix } from '../config';

export default function comment() {
  const el = h('div', `${cssPrefix}-comment`);
  const obj = {
    el,
    show: (content) => {
      el.html('');
      if (typeof content === 'undefined') {
        return obj;
      }
      if (typeof content === 'string') {
        el.children(content);
      } else if (content !== null && typeof Array.isArray(content.texts)) {
        const childs = [];
        content.texts.forEach((rich) => {
          const t = h('span', `${cssPrefix}-comment-text`);
          const font = rich.font || {};
          t.css('font-size', `${font.size}px`);
          t.css('color', `${font.hexColor}`);
          t.css('font-family', `${font.name}`);
          t.html(
            rich.text
              .replace(/\r\n/g, '<br />')
              .replace(/\r/g, '<br />')
              .replace(/\n/g, '<br />'),
          );
          childs.push(t);
        });
        el.children(...childs);
      }
      el.removeClass(`${cssPrefix}-comment-hide`).addClass(`${cssPrefix}-comment-show`);
      return obj;
    },
    hide: () => {
      el.html('');
      el.removeClass(`${cssPrefix}-comment-show`).addClass(`${cssPrefix}-comment-hide`);
      return obj;
    },
    position: (x, y) => {
      el.css('left', x);
      el.css('top', y);
      return obj;
    },
  };
  return obj;
}
