/* eslint-disable */
export default class OperableCell {
  constructor(ri, ci, cell, { setCellText }, render) {
    this.cell = cell;
    this._ri = ri;
    this._ci = ci;
    this._render = render;
    this._setCellText = setCellText;
  }

  setText(text) {
    this._setCellText(text);
    this._render();
  }
}
