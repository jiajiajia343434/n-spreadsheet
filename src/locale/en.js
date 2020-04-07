export default {
  toolbar: {
    undo: 'Undo',
    redo: 'Redo',
    print: 'Print',
    paintformat: 'Paint format',
    clearformat: 'Clear format',
    format: 'Format',
    fontName: 'Font',
    fontSize: 'Font size',
    fontBold: 'Font bold',
    fontItalic: 'Font italic',
    underline: 'Underline',
    strike: 'Strike',
    color: 'Text color',
    bgcolor: 'Fill color',
    border: 'Borders',
    merge: 'Merge cells',
    align: 'Horizontal align',
    valign: 'Vertical align',
    textwrap: 'Text wrapping',
    freeze: 'Freeze cell',
    autofilter: 'Filter',
    formula: 'Functions',
    more: 'More',
  },
  contextmenu: {
    copy: 'Copy',
    cut: 'Cut',
    paste: 'Paste',
    pasteValue: 'Paste values only',
    pasteFormat: 'Paste format only',
    insertRow: 'Insert row',
    insertColumn: 'Insert column',
    hide: 'hide',
    deleteSheet: 'Delete',
    deleteRow: 'Delete row',
    deleteColumn: 'Delete column',
    deleteCell: 'Delete cell',
    deleteCellText: 'Delete cell text',
    validation: 'Data validations',
    cellprintable: 'Enable export',
    cellnonprintable: 'Disable export',
    celleditable: 'Enable editing',
    cellnoneditable: 'Disable editing',
  },
  format: {
    normal: 'Normal',
    text: 'Plain Text',
    number: 'Number',
    percent: 'Percent',
    rmb: 'RMB',
    usd: 'USD',
    eur: 'EUR',
    date: 'Date',
    time: 'Time',
    datetime: 'Date time',
    duration: 'Duration',
  },
  formula: {
    text: {
      substitute:'SUBSTITUTE',
      text:'TEXT',
      textjoin:'TEXTJOIN',
      _trim:'TRIM',
      upper:'UPPER',
      _value:'VALUE',
    },
    logic: {
      _if: 'IF',
    },
    time: {
      date: 'DATE',
      day: 'DAY',
      hour: 'HOUR',
      minute: 'MINUTE',
      month: 'MONTH',
      networkdays: 'NETWORKDAYS',
      networkdaysintl: 'NETWORKDAYS.INTL',
      now: 'NOW',
      second: 'SECOND',
      time: 'TIME',
      timevalue: 'TIMEVALUE',
      today: 'TODAY',
      weekday: 'WEEKDAY',
      weeknum: 'WEEKNUM',
      workday: 'WORKDAY',
      workdayintl: 'WORKDAY.INTL',

    },
    statistics: {
      average: 'average',
      averageif: 'averageif',
      count: 'count',
      countif: 'countif',
      max:'max',
      mim:'min',
      counta:'counta',
      countblank:'countblank',
    },
    math: {
      sum: 'SUM',
      _round:'ROUND',
      _sqrt:'SQRT',
      _abs:'ABS',
      _trunc:'TRUNC',
      _sumif:'SUMIF',
      _sumifs:'SUMIFS',
      _roundup:'ROUNDUP',
      _rounddown:'ROUNDDOWN',
    },
    // sum: 'Sum',
    // average: 'Average',
    // max: 'Max',
    // min: 'Min',
    // _if: 'IF',
    // and: 'AND',
    // or: 'OR',
    // concat: 'Concat',
  },
  validation: {
    required: 'it must be required',
    notMatch: 'it not match its validation rule',
    between: 'it is between {} and {}',
    notBetween: 'it is not between {} and {}',
    notIn: 'it is not in list',
    equal: 'it equal to {}',
    notEqual: 'it not equal to {}',
    lessThan: 'it less than {}',
    lessThanEqual: 'it less than or equal to {}',
    greaterThan: 'it greater than {}',
    greaterThanEqual: 'it greater than or equal to {}',
  },
  error: {
    pasteForMergedCell: 'Unable to do this for merged cells',
  },
  calendar: {
    weeks: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },
  button: {
    next: 'Next',
    cancel: 'Cancel',
    remove: 'Remove',
    save: 'Save',
    ok: 'OK',
  },
  sort: {
    desc: 'Sort Z -> A',
    asc: 'Sort A -> Z',
  },
  filter: {
    empty: 'empty',
  },
  dataValidation: {
    mode: 'Mode',
    range: 'Cell Range',
    criteria: 'Criteria',
    modeType: {
      cell: 'Cell',
      column: 'Colun',
      row: 'Row',
    },
    type: {
      list: 'List',
      number: 'Number',
      date: 'Date',
      phone: 'Phone',
      email: 'Email',
    },
    operator: {
      be: 'between',
      nbe: 'not betwwen',
      lt: 'less than',
      lte: 'less than or equal to',
      gt: 'greater than',
      gte: 'greater than or equal to',
      eq: 'equal to',
      neq: 'not equal to',
    },
  },
};
