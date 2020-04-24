export default {
  view: {
    height: () => document.documentElement.clientHeight / 2,
    width: () => document.documentElement.clientWidth / 2,
  },
  extensible: {
    enableAll: false,
    enableRow: false,
    enableCol: false,
    maxRow: 1048576,
    maxCol: 16384,
  },
  privileges: {
    editable: true, // 全局可编辑
    formatEdit: true, // 编辑格式
    dataEdit: true, // 编辑数据
    sheetEdit: true, // 增删sheet
  },
  showGrid: true,
  showToolbar: true,
  showContextmenu: true,
  row: {
    len: 100,
    height: 18,
    minHeight: 5,
  },
  col: {
    len: 26,
    width: 80,
    indexWidth: 40,
    minWidth: 1,
  },
  style: {
    bgcolor: '#ffffff',
    align: 'left',
    valign: 'middle',
    textwrap: false,
    strike: false,
    underline: false,
    color: '#0a0a0a',
    font: {
      name: 'Arial',
      size: 10,
      bold: false,
      italic: false,
    },
  },
};
