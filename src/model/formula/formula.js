/**
 formula:
 key
 title
 render
 */
/**
 * @typedef {object} Formula
 * @property {string} key
 * @property {function} title
 * @property {function} render
 */
import { Formula as text } from './text';
import { Formula as math } from './math';
import { Formula as logic } from './logic';
import { Formula as statistics } from './statistics';
import { Formula as time } from './time';

/** @type {Formula[]} */
const baseFormulas = [
  ...text,
  ...math,
  ...logic,
  ...statistics,
  ...time,
  // {
  //   key: 'SUM',
  //   title: tf('formula.sum'),
  //   render: ary => ary.reduce((total, n) => {
  //     if (Array.isArray(n)) {
  //       return total + n.reduce((x, y) => Number(x) + Number(y), 0);
  //     }
  //     return total + Number(n);
  //   }, 0),
  // },
  // {
  //   key: 'AVERAGE',
  //   title: tf('formula.average'),
  //   render: ary => ary.reduce((a, b) => Number(a) + Number(b), 0) / ary.length,
  // },
  // {
  //   key: 'MAX',
  //   title: tf('formula.max'),
  //   render: ary => Math.max(...ary.map(v => Number(v))),
  // },
  // {
  //   key: 'MIN',
  //   title: tf('formula.min'),
  //   render: ary => Math.min(...ary.map(v => Number(v))),
  // },
  // {
  //   key: 'IF',
  //   title: tf('formula._if'),
  //   render: ([b, t, f]) => (b ? t : f),
  // },
  // {
  //   key: 'AND',
  //   title: tf('formula.and'),
  //   render: ary => ary.every(it => it),
  // },
  // {
  //   key: 'OR',
  //   title: tf('formula.or'),
  //   render: ary => ary.some(it => it),
  // },
  // {
  //   key: 'CONCAT',
  //   title: tf('formula.concat'),
  //   render: ary => ary.join(''),
  // },
  // {
  //   key: 'FLOOR',
  //   title: tf('formula.floor'),
  //   render: ary => {
  //     console.log(ary);
  //     return 1;
  //   },
  // },
  /* support:  1 + A1 + B2 * 3
  {
    key: 'DIVIDE',
    title: tf('formula.divide'),
    render: ary => ary.reduce((a, b) => Number(a) / Number(b)),
  },
  {
    key: 'PRODUCT',
    title: tf('formula.product'),
    render: ary => ary.reduce((a, b) => Number(a) * Number(b),1),
  },
  {
    key: 'SUBTRACT',
    title: tf('formula.subtract'),
    render: ary => ary.reduce((a, b) => Number(a) - Number(b)),
  },
  */
];

const formulas = baseFormulas;

// const formulas = (formulaAry = []) => {
//   const formulaMap = {};
//   baseFormulas.concat(formulaAry).forEach((f) => {
//     formulaMap[f.key] = f;
//   });
//   return formulaMap;
// };
const formulam = {};
baseFormulas.forEach((f) => {
  formulam[f.key] = f;
});

export default {};

export {
  formulam,
  formulas,
  baseFormulas,
};
