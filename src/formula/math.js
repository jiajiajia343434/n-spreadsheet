/**
 formula:
 数学运算类
 */
import { tf } from '../locale/locale';


const Formula = [
  {
    key: 'SUM',
    title: tf('formula.math.sum'),
    render: ary => ary.reduce((total, n) => {
      if (Array.isArray(n)) {
        return total + n.reduce((x, y) => Number(x) + Number(y), 0);
      }
      return total + Number(n);
    }, 0),
  },
];

export default {};
export {
  Formula,
};
