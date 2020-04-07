/* global window, document */
import { h } from './ui/element';
import DataProxy from './core/data_proxy';
import Sheet from './ui/sheet';
import Bottombar from './ui/bottombar';
import { cssPrefix } from './config';
import { locale } from './locale/locale';
import './index.less';
import ExcelParser from './utils/parser/excel';

class Spreadsheet {
  constructor(selectors, options = {}) {
    let targetEl = selectors;
    if (typeof selectors === 'string') {
      targetEl = document.querySelector(selectors);
    }
    options.view = {
      height: () => targetEl.clientHeight,
      width: () => targetEl.clientWidth,
    };
    this.options = options;
    this.sheetIndex = 1;
    this.datas = [];
    this.bottombar = new Bottombar(() => {
      const d = this.addSheet();
      this.sheet.reset(d);
      this.sheet.trigger('change', d.getData(), this.datas.map(data => data.getData()));
    }, (index) => {
      this.swapSheet(index);
      this.sheet.trigger('change', this.data.getData(), this.datas.map(data => data.getData()));
    }, () => {
      this.deleteSheet();
      this.sheet.trigger('change', this.data.getData(), this.datas.map(data => data.getData()));
    }, (index, value) => {
      this.datas[index].name = value;
      this.sheet.trigger('change', this.data.getData(), this.datas.map(data => data.getData()));
    });
    this.data = this.addSheet();
    const rootEl = h('div', `${cssPrefix}`)
      .on('contextmenu', evt => evt.preventDefault());
    // create canvas element
    targetEl.appendChild(rootEl.el);
    this.sheet = new Sheet(rootEl, this.data);
    rootEl.child(this.bottombar.el);
  }

  addSheet(name, active = true) {
    const n = name || `sheet${this.sheetIndex}`;
    const d = new DataProxy(n, this.options);
    d.change = (...args) => {
      this.sheet.trigger('change', ...args, this.datas.map(data => data.getData()));
    };
    this.datas.push(d);
    // console.log('d:', n, d, this.datas);
    this.bottombar.addItem(n, active);
    this.sheetIndex += 1;
    return d;
  }

  deleteSheet() {
    const [oldIndex, nindex] = this.bottombar.deleteItem();
    if (oldIndex >= 0) {
      this.datas.splice(oldIndex, 1);
      if (nindex >= 0) this.sheet.reset(this.datas[nindex]);
    }
    this.data = this.datas[nindex];
  }

  swapSheet(index) {
    const d = this.datas[index];
    this.data = d;
    this.sheet.reset(d);
  }

  loadData(data) {
    const ds = Array.isArray(data) ? data : [data];
    for (let i = 0; i < ds.length; i += 1) {
      const it = ds[i];
      const nd = this.addSheet(it.name, false);
      nd.setData(it);
    }
    const oldCount = this.datas.length - ds.length;
    for (let i = 1; i <= oldCount; i += 1) {
      this.deleteSheet();
    }
    return this;
  }

  getData() {
    return this.datas.map(it => it.getData());
  }

  validate() {
    const { validations } = this.data;
    return validations.errors.size <= 0;
  }

  change(cb) {
    this.sheet.on('change', cb);
    return this;
  }

  on(eventName, func) {
    this.sheet.on(eventName, func);
    return this;
  }

  openFile() {
    const el = document.createElement('input');
    el.style.display = 'none';
    el.type = 'file';
    el.id = '_file';
    document.body.append(el);
    el.click();
    const fileDom = document.getElementById('_file');
    fileDom.onchange = () => {
      // eslint-disable-next-line
      const reader = new FileReader();
      reader.readAsArrayBuffer(fileDom.files[0]);
      fileDom.remove();
      reader.onload = () => {
        const { result } = reader;
        const parser = new ExcelParser();
        parser.parse(result).then(data => this.loadData(data));
      };
    };
  }

  static locale(lang, message) {
    locale(lang, message);
  }
}

const spreadsheet = (el, options = {}) => new Spreadsheet(el, options);

if (window) {
  window.x = window.x || {};
  window.x.spreadsheet = spreadsheet;
  window.x.spreadsheet.locale = (lang, message) => locale(lang, message);
}

export default Spreadsheet;
export {
  spreadsheet,
};
