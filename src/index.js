import { h } from './ui/element';
import DataProxy from './model/data_proxy';
import Sheet from './ui/sheet';
import BottomBar from './ui/bottombar';
import { cssPrefix } from './config';
import { locale } from './locale/locale';
import './index.less';
import ExcelParser from './utils/excel/xlsx-importer';
import ExcelExport from './utils/excel/xlsx-exporter';
import helper from './model/helper';
import DefaultSetting from './settings/default';

class Spreadsheet {
  constructor(selectors, settings = {}) {
    let container = selectors;
    if (typeof selectors === 'string') {
      container = document.querySelector(selectors);
    }
    settings.view = {
      height: () => container.clientHeight,
      width: () => container.clientWidth,
    };
    this.settings = helper.merge(DefaultSetting, settings || {});
    this.sheetIndex = 1;
    this.datas = [];
    this.bottombar = new BottomBar(() => {
      if (this.data.settings.privileges.editable && this.data.settings.privileges.sheetEdit) {
        const d = this.addSheet();
        this.sheet.reset(d);
        this.sheet.trigger('change', d.getData(), this.datas.map(data => data.getData()));
      }
    }, (index) => {
      this.swapSheet(index);
      this.sheet.trigger('change', this.data.getData(), this.datas.map(data => data.getData()));
    }, () => {
      if (this.data.settings.privileges.editable && this.data.settings.privileges.sheetEdit) {
        this.deleteSheet();
        this.sheet.trigger('change', this.data.getData(), this.datas.map(data => data.getData()));
      }
    }, (index, value) => {
      if (this.data.settings.privileges.editable && this.data.settings.privileges.sheetEdit) {
        this.datas[index].name = value;
        this.sheet.trigger('change', this.data.getData(), this.datas.map(data => data.getData()));
      }
    }, this.settings.privileges);
    this.data = this.addSheet();
    const rootEl = h('div', `${cssPrefix}`)
      .on('contextmenu', evt => evt.preventDefault());
    // create canvas element
    container.appendChild(rootEl.el);
    this.sheet = new Sheet(rootEl, this.data);
    rootEl.child(this.bottombar.el);
  }

  addSheet(name, active = true) {
    const n = name || `sheet${this.sheetIndex}`;
    const d = new DataProxy(n, this.settings);
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

  // use for set data from onchange callback
  setData(sheets) {
    this.datas.map((d, idx) => d.setData(sheets[idx]));
    this.sheet.table.render();
  }

  setCustomMenu(menus) {
    this.sheet.contextMenu.removeAllCustomMenu();
    menus.forEach((menu) => {
      this.sheet.contextMenu.addCustomMenu(menu);
    });
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
  window.$ = window.$ || {};
  window.$.spreadsheet = spreadsheet;
  window.$.excel = {
    exporter: ExcelExport,
    importer: ExcelParser,
  };
  window.$.spreadsheet.locale = (lang, message) => locale(lang, message);
}

export default Spreadsheet;
export {
  spreadsheet,
};
