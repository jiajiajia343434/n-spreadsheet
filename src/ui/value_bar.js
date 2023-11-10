import { h } from './element';
import { cssPrefix } from '../config';

export default class ValueBar {
  constructor() {
    this.el = h('div', `${cssPrefix}-value-bar`);
    this.positionValueBar = h('div', `${cssPrefix}-position-value-bar-position`);
    this.cellValueBar = h('div', `${cssPrefix}-cell-value-bar-position`);
    this.positionValueBar.el.innerHTML = 'E1';
    this.cellValueBar.el.innerHTML = 'E1+E2';
    this.el.child(this.positionValueBar);
    this.el.child(h('div', `${cssPrefix}-value-bar-divider`));
    this.el.child(this.cellValueBar);
  }

  update(position, cell) {
    this.positionValueBar.el.innerHTML = position;
    this.cellValueBar.el.innerHTML = cell;
  }
}
