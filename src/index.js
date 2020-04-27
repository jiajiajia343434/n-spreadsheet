import { h } from './ui/element';
import DataAgent from './model/data_agent';
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
  constructor(selectors, settings = {}, initData = [], onLoad = () => {
  }) {
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
    this.dataAgents = [];
    this.bottombar = new BottomBar(() => {
      if (this.settings.privileges.editable && this.settings.privileges.sheetEdit) {
        const d = this.addSheet();
        this.dataAgent = d;
        this.sheet.reset(d);
        this.sheet.trigger('change', d, this.dataAgents);
      }
    }, (index) => {
      this.swapSheet(index);
      this.sheet.trigger('change', this.dataAgent, this.dataAgents);
    }, () => {
      if (this.settings.privileges.editable && this.settings.privileges.sheetEdit) {
        this.deleteSheet();
        this.sheet.trigger('change', this.dataAgent, this.dataAgents);
      }
    }, (index, value) => {
      if (this.settings.privileges.editable && this.settings.privileges.sheetEdit) {
        this.dataAgents[index].name = value;
        this.sheet.trigger('change', this.dataAgent, this.dataAgents);
      }
    }, this.settings.privileges);
    this.dataAgent = this.addSheet();
    const rootEl = h('div', `${cssPrefix}`)
      .on('contextmenu', evt => evt.preventDefault());
    // create canvas element
    container.appendChild(rootEl.el);
    this.sheet = new Sheet(rootEl, this.dataAgent);
    rootEl.child(this.bottombar.el);
    this.loadData(initData);
    onLoad.call(this, this, this.dataAgent, this.dataAgents);
  }

  addSheet(name, active = true) {
    const n = name || `sheet${this.sheetIndex}`;
    const d = new DataAgent(n, this.settings);
    d.change = () => {
      this.sheet.trigger('change', d, this.dataAgents);
    };
    this.dataAgents.push(d);
    // console.log('d:', n, d, this.dataAgents);
    this.bottombar.addItem(n, active);
    this.sheetIndex += 1;
    return d;
  }

  deleteSheet() {
    const [oldIndex, nindex] = this.bottombar.deleteItem();
    if (oldIndex >= 0) {
      this.dataAgents.splice(oldIndex, 1);
      if (nindex >= 0) this.sheet.reset(this.dataAgents[nindex]);
    }
    this.dataAgent = this.dataAgents[nindex];
  }

  swapSheet(index) {
    const d = this.dataAgents[index];
    this.dataAgent = d;
    this.sheet.reset(d);
  }

  loadData(data) {
    const ds = Array.isArray(data) ? data : [data];
    for (let i = 0; i < ds.length; i += 1) {
      const it = ds[i];
      const nd = this.addSheet(it.name, false);
      nd.setData(it);
    }
    const oldCount = this.dataAgents.length - ds.length;
    for (let i = 1; i <= oldCount; i += 1) {
      this.deleteSheet();
    }
    return this;
  }

  getData() {
    return this.dataAgents.map(dataAgent => dataAgent.getData());
  }

  // use for set data from onchange callback
  setData(data) {
    this.dataAgents.map((d, idx) => d.setData(data[idx]));
    this.sheet.table.render();
  }

  setCustomMenu(menus) {
    this.sheet.contextMenu.removeAllCustomMenu();
    menus.forEach((menu) => {
      this.sheet.contextMenu.addCustomMenu(menu);
    });
  }

  validate() {
    const { validations } = this.dataAgent;
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
