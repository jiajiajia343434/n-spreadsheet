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
import { clearEventListeners } from './ui/event';

class Spreadsheet {
  constructor(selectors, settings = {}, initData = [], onLoad = () => {
  }) {
    let container = selectors;
    if (typeof selectors === 'string') {
      container = document.querySelector(selectors);
    }
    this.settings = helper.merge(DefaultSetting, settings || {});
    this.settings.view = {
      height: () => container.clientHeight,
      width: () => container.clientWidth,
    };
    this.sheetIndex = 1;
    this.dataAgents = [];
    this.bottombar = new BottomBar(() => {
      if (this.settings.privileges.editable && this.settings.privileges.sheetEdit) {
        const d = this.addSheet();
        this.dataAgent = d;
        this.sheet.reset(d);
        this.bottombar.setScale(this.dataAgent.scale);
        this.sheet.trigger('change', d, this.dataAgents);
      }
    }, (index) => {
      this.swapSheet(index);
      this.bottombar.setScale(this.dataAgent.scale);
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
    }, () => {
      const { scale } = this.dataAgent;
      if (scale < 2) {
        this.sheet.setScale(scale + 0.1);
      }
      return this.dataAgent.scale;
    },
    () => {
      const { scale } = this.dataAgent;
      if (scale > 0.55) {
        this.sheet.setScale(scale - 0.1);
      }
      return this.dataAgent.scale;
    },
    this.settings.privileges);
    this.dataAgent = this.addSheet();
    this.bottombar.setScale(this.dataAgent.scale);
    const rootEl = h('div', `${cssPrefix}`)
      .on('contextmenu', evt => evt.preventDefault());
    // create canvas element
    container.appendChild(rootEl.el);
    this.sheet = new Sheet(rootEl, this.dataAgent, container);
    rootEl.child(this.bottombar.el);
    this.loadData(initData);
    onLoad.call(this, this, this.dataAgent, this.dataAgents);
  }

  addSheet(name, active = true) {
    const n = name || `Sheet${this.sheetIndex}`;
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
    const [deleted, pos] = this.bottombar.deleteItem();
    if (deleted >= 0) {
      this.dataAgents.splice(deleted, 1);
      if (pos >= 0) {
        const newIndex = deleted >= this.dataAgents.length - 1
          ? this.dataAgents.length - 1
          : deleted;
        this.sheet.reset(
          this.dataAgents[newIndex],
        );
        this.dataAgent = this.dataAgents[newIndex];
      }
    }
  }

  swapSheet(index) {
    const d = this.dataAgents[index];
    this.dataAgent = d;
    this.sheet.reset(d);
  }

  loadData(data) {
    this.sheetIndex = 1; // 重新从1开始计数
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
    return this;
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

  unMountEventListener() {
    clearEventListeners();
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

  /*
 * polyfill requestAnimationFrame
 */
  if (!Date.now) Date.now = () => new Date().getTime();

  const vendors = ['webkit', 'moz'];
  for (let i = 0; i < vendors.length && !window.requestAnimationFrame; i += 1) {
    const vp = vendors[i];
    window.requestAnimationFrame = window[`${vp}RequestAnimationFrame`];
    window.cancelAnimationFrame = (window[`${vp}CancelAnimationFrame`]
      || window[`${vp}CancelRequestAnimationFrame`]);
  }
  if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
    || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
    let lastTime = 0;
    window.requestAnimationFrame = (callback) => {
      const now = Date.now();
      const nextTime = Math.max(lastTime + 16, now);
      return setTimeout(() => {
        callback(lastTime = nextTime);
      },
      nextTime - now);
    };
    window.cancelAnimationFrame = clearTimeout;
  }
}

export default Spreadsheet;
export {
  spreadsheet,
};
