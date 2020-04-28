import { h } from './element';
import { bind, unbind } from './event';
import { cssPrefix } from '../config';

export default function tooltip(html, target) {
  if (target.classList.contains('active')) {
    return;
  }
  const {
    left, top, width, height,
  } = target.getBoundingClientRect();
  const el = h('div', `${cssPrefix}-tooltip`).html(html).show();
  document.body.appendChild(el.el);
  const elBox = el.box();
  // console.log('elBox:', elBox);
  el.css('left', `${left + (width / 2) - (elBox.width / 2)}px`)
    .css('top', `${top + height + 2}px`);

  const fn = () => {
    if (document.body.contains(el.el)) {
      document.body.removeChild(el.el);
    }
    unbind(target, 'mouseleave', fn);
    unbind(window, 'click', fn);
  };
  bind(target, 'mouseleave', fn);

  bind(window, 'click', fn);
}
