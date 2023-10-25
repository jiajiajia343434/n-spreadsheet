/**
 formula:
 数学运算类
 */
import { tf } from '../locale/locale';

// 修复四则运算小数不准确
const floatCalc = (x, y) => {
  let a = `${x}`;
  let b = `${y}`;
  const aNum = a.indexOf('.');
  const bNum = b.indexOf('.');

  const aSum = aNum < 0 ? 0 : a.split('.')[1].length;
  const bSum = bNum < 0 ? 0 : b.split('.')[1].length;
  const resultNum = aSum > bSum ? aSum : bSum;

  const inta = aNum < 0 ? Number(a + (`${10 ** resultNum}`).replace('1', '')) : ((() => {
    a = a.replace('.', '');
    a = resultNum === aSum ? a : a + (`${10 ** (resultNum - aSum)}`).replace('1', '');
    return Number(a);
  })());

  const intb = bNum < 0 ? Number(b + (`${10 ** resultNum}`).replace('1', '')) : ((() => {
    b = b.replace('.', '');
    b = resultNum === bSum ? b : b + (`${10 ** (resultNum - bSum)}`).replace('1', '');
    return Number(b);
  })());

  return {
    a: inta,
    b: intb,
    num: resultNum,
  };
};
// 加法
// eslint-disable-next-line no-extend-native,func-names
Number.prototype.add = function (n) {
  const o = floatCalc(this, n);
  return (o.a + o.b) / (10 ** o.num);
};
// 减法
// eslint-disable-next-line no-extend-native,func-names
Number.prototype.subtract = function (n) {
  const o = floatCalc(this, n);
  return (o.a - o.b) / (10 ** o.num);
};
// 乘法
// eslint-disable-next-line no-extend-native,func-names
Number.prototype.multiply = function (n) {
  const o = floatCalc(this, n);
  return (o.a * o.b) / (10 ** (o.num * 2));
};
// 除法
// eslint-disable-next-line no-extend-native,func-names
Number.prototype.divide = function (n) {
  const o = floatCalc(this, n);
  return (o.a / o.b);
};

const Formula = [
  // {
  //   key: 'SUM',
  //   title: tf('formula.math.sum'),
  //   render: ary => ary.reduce((total, n) => {
  //     if (Array.isArray(n)) {
  //       debugger
  //       return total + n.reduce((x, y) => Number(x) + Number(y), 0);
  //     }
  //     return total + Number(n);
  //   }, 0),
  // },
  {
    key: 'ROUND',
    title: tf('formula.math._round'),
    render: function (args) {
      if (args.length != 2) {
        throw new Error('参数不符');
      } else if (Number(args[1]) >= 0) {
        // 参数2为正
        // return Number(args[0]).toFixed(Number(args[1]));
        if (args[0] >= 0) {
          let times = Math.pow(10, Number(args[1]));
          let des = Number(args[0]) * times + 0.5;
          des = parseInt(des, 10) / times;
          return des + '';
        } else {
          let times = Math.pow(10, Number(args[1]));
          let des = Number(args[0]) * times * (-1) + 0.5;
          des = parseInt(des, 10) / times * (-1);
          return des + '';
        }

      } else {
        //参数2为负
        let power = Number(args[1]) * (-1);//要舍弃的位数
        let str = args[0].toString();//参数1
        if (str.indexOf('.') != -1) {
          //有小数点
          let num = new Array();
          num = str.split('.');
          let zero = Math.pow(10, power);//补零
          let nums = Number(num[0]);//取出来小数点之前的整数
          if (nums > 0) {
            let strs = nums.toString();
            let n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
            if (n >= 5) {
              return (Number(strs.substring(0, (strs.length - power))) + 1) * zero;
            } else {
              return Number(strs.substring(0, (strs.length - power))) * zero;
            }
          } else {
            let strs = (nums * (-1)).toString();
            let n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
            if (n >= 5) {
              return (Number(strs.substring(0, (strs.length - power))) + 1) * zero * (-1);
            } else {
              return Number(strs.substring(0, (strs.length - power))) * zero * (-1);
            }
          }
        } else {
          //没有小数点
          let nums = Number(args[0]);//取出来小数点之前的整数
          let zero = Math.pow(10, power);//补零
          if (nums > 0) {
            let strs = nums.toString();
            let n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
            if (n >= 5) {
              return (Number(strs.substring(0, (strs.length - power))) + 1) * zero;
            } else {
              return Number(strs.substring(0, (strs.length - power))) * zero;
            }
          } else {
            let strs = (nums * (-1)).toString();
            let n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
            if (n >= 5) {
              return (Number(strs.substring(0, (strs.length - power))) + 1) * zero * (-1);
            } else {
              return Number(strs.substring(0, (strs.length - power))) * zero * (-1);
            }
          }
        }
      }
    },
  },
  {
    key: 'ROUNDUP',
    title: tf('formula.math._roundup'),
    render: function (args) {
      if (args.length != 2) {
        throw new Error('参数不符');
      } else if (Number(args[1]) >= 0) {
        let power = Number(args[1]);//要舍弃的位数
        let num1 = Number(args[0]);
        let num2 = Number(args[0]).toFixed(Number(args[1]));
        if (num1 >= 0) {
          if (num1 < num2) {
            return num2;
          } else {
            let num3 = Math.pow(10, power * (-1));
            let result = Number(num2) + Number(num3);
            return result.toFixed(power);
          }
        } else {
          if (num1 > num2) {
            return num2;
          } else {
            let num3 = Math.pow(10, power * (-1));
            let result = Number(num2) - Number(num3);
            return result.toFixed(power);
          }
        }
      } else {
        // 参数2为负
        let power = Number(args[1]) * (-1);//要舍弃的位数
        let str = args[0].toString();//参数1
        if (str.indexOf('.') != -1) {
          //有小数点
          let num = new Array();
          num = str.split('.');
          let zero = Math.pow(10, power);//补零
          let nums = Number(num[0]);//取出来小数点之前的整数
          if (nums > 0) {
            let strs = nums.toString();
            let n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
            return (Number(strs.substring(0, (strs.length - power))) + 1) * zero;
          } else {
            let strs = (nums * (-1)).toString();
            let n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
            return (Number(strs.substring(0, (strs.length - power))) + 1) * zero * (-1);
          }
        } else {
          //没有小数点
          let nums = Number(args[0]);//取出来小数点之前的整数
          let zero = Math.pow(10, power);//补零

          if (nums > 0) {
            let strs = nums.toString();
            let n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
            return (Number(strs.substring(0, (strs.length - power))) + 1) * zero;
          } else {
            let strs = (nums * (-1)).toString();
            let n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
            return (Number(strs.substring(0, (strs.length - power))) + 1) * zero * (-1);
          }
        }
      }
    },
  },
  {
    key: 'ROUNDDOWN',
    title: tf('formula.math._roundfdown'),
    render: function (args) {
      if (args.length !== 2) {
        throw new Error('参数不符');
      } else if (Number(args[1]) >= 0) {
        let power = Number(args[1]);//要舍弃的位数
        let num1 = Number(args[0]);
        let num2 = Number(args[0]).toFixed(Number(args[1]));
        if (num1 >= 0) {
          if (num1 > num2) {
            return num2;
          } else {
            let num3 = Math.pow(10, power * (-1));
            let result = Number(num2) - Number(num3);
            return result.toFixed(power);
          }
        } else {
          if (num1 < num2) {
            return num2;
          } else {
            let num3 = Math.pow(10, power * (-1));
            let result = Number(num2) + Number(num3);
            return result.toFixed(power);
          }
        }
      } else {
        //参数2为负
        let power = Number(args[1]) * (-1);//要舍弃的位数
        let str = args[0].toString();//参数1
        if (str.indexOf('.') != -1) {
          //有小数点
          let num = new Array();
          num = str.split('.');
          let zero = Math.pow(10, power);//补零
          let nums = Number(num[0]);//取出来小数点之前的整数
          if (nums > 0) {
            let strs = nums.toString();
            let n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
            return Number(strs.substring(0, (strs.length - power))) * zero;
          } else {
            let strs = (nums * (-1)).toString();
            let n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
            return Number(strs.substring(0, (strs.length - power))) * zero * (-1);
          }
        } else {
          //没有小数点
          let nums = Number(args[0]);//取出来小数点之前的整数
          let zero = Math.pow(10, power);//补零

          if (nums > 0) {
            let strs = nums.toString();
            let n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
            return Number(strs.substring(0, (strs.length - power))) * zero;
          } else {
            let strs = (nums * (-1)).toString();
            let n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
            return Number(strs.substring(0, (strs.length - power))) * zero * (-1);
          }
        }
      }
    },
  },
  {
    key: 'SQRT',
    title: tf('formula.math._sqrt'),
    render: function (args) {
      if (args.length != 1) {
        throw new Error('参数不符');
      } else if (args[0] < 0) {
        throw new Error('(\'#N/A!\')');
      } else {
        return Math.sqrt(Number(args[0]));
      }
    },
  },
  // {
  //     key: 'ABS',
  //     title: tf('formula.math._abs'),
  //     render: function (args) {
  //         if (args.length != 1) {
  //             throw new Error("参数不符");
  //         } else if (args[0] >= 0) {
  //             return args[0];
  //         } else {
  //             return Number(args[0]) * (-1);
  //         }
  //     }
  // },
  {
    key: 'SUM',
    title: tf('formula.math._sum'),
    render: function (args) {
      if (args.length == 0) {
        throw new Error('参数不符');
      } else {
        let sum = new Number(0);
        for (let i = 0; i < args.length; i++) {
          const v = args[i];
          if (v instanceof Array) {
            for (let j = 0; j < v.length; j++) {
              sum = sum.add(Number(v[j]));
            }
          } else {
            sum = sum.add(Number(v));
          }
        }
        return sum;
      }
    },
  },
  {
    key: 'SUMIF',
    title: tf('formula.math._sumif'),
    render: function (args) {

      if (args.length != 2 && args.length != 3) {
        throw new Error('参数不符');
      } else {
        if (args.length == 2) {
          if (args[1].indexOf('>') != -1 || args[1].indexOf('<') != -1 || args[1].indexOf('=') != -1) {

            let func = new Function('a', 'b', 'return a+b;');

            let sum = 0;
            for (let i = 0; i < args[0].length; i++) {
              if (args[0][i] != null && args[0][i] != '') {
                let str = func(args[0][i], args[1]);
                if (str.charAt(1) == '=') {
                  str = str.replace('=', '==');
                }
                if (eval(str)) {
                  sum += Number(args[0][i]);
                }
              } else {
                continue;
              }

            }
            return sum;
          } else {
            let sum = 0;
            for (let i = 0; i < args[0].length; i++) {
              if (args[0][i] != null && args[0][i] != '') {
                // let str = args[0][i] + "==" + args[1];
                // if (eval(str)) {
                //     sum += Number(args[0][i]);
                // }

                let str1 = '\"' + args[0][i] + '\"';
                let str2 = '\"' + args[1] + '\"';
                if (eval(str1 == str2)) {
                  sum += Number(args[0][i]);
                }
              } else {
                continue;
              }

            }
            return sum;
          }
        } else {
          if (args[1].indexOf('>') != -1 || args[1].indexOf('<') != -1 || args[1].indexOf('=') != -1) {

            let func = new Function('a', 'b', 'return a+b;');

            let sum = 0;
            for (let i = 0; i < args[0].length; i++) {
              if (args[0][i] != null && args[0][i] != '') {
                let str = func(args[0][i], args[1]);
                if (str.charAt(1) == '=') {
                  str = str.replace('=', '==');
                }
                if (eval(str)) {
                  sum += Number(args[2][i]);
                }
              } else {
                continue;
              }
            }
            return sum;
          } else {
            let sum = 0;
            for (let i = 0; i < args[0].length; i++) {
              if (args[0][i] != null && args[0][i] != '') {
                let str1 = '\"' + args[0][i] + '\"';
                let str2 = '\"' + args[1] + '\"';
                if (eval(str1 == str2)) {
                  sum += Number(args[2][i]);
                }
              } else {
                if (args[1] == null || args[1] == '') {
                  sum += Number(args[2][i]);
                } else {
                  continue;
                }

              }
            }
            return sum;

          }
        }
      }
    },
  },
  {
    key: 'SUMIFS',
    title: tf('formula.math._sumifs'),
    render: function (args) {
      if (args.length < 3 || args.length > 255) {
        throw new Error('参数不符');
      } else {
        let length = args.length;
        let sum = 0;
        let ary1 = new Array();
        let ary2 = new Array();
        for (let i = 1; i < args.length; i += 2) {
          if (i == 1) {
            if (args[i + 1].indexOf('>') != -1 || args[i + 1].indexOf('<') != -1 || args[i + 1].indexOf('=') != -1) {
              let func = new Function('a', 'b', 'return a+b;');
              for (let j = 0; j < args[i].length; j++) {
                let str = func(args[i][j], args[i + 1]);
                if (str.charAt(1) == '=') {
                  str = str.replace('=', '==');
                }
                if (eval(str)) {
                  ary1.push(j);
                }
              }
            } else {
              for (let j = 1; j < args[i].length; j++) {
                let str = args[i][j] + '==' + args[i + 1];
                if (eval(str)) {
                  ary1.push(j);
                }
              }
            }
          } else {
            if (args[i + 1].indexOf('>') != -1 || args[i + 1].indexOf('<') != -1 || args[i + 1].indexOf('=') != -1) {
              let func = new Function('a', 'b', 'return a+b;');
              for (let j = 0; j < args[i].length; j++) {
                let str = func(args[i][j], args[i + 1]);
                if (str.charAt(1) == '=') {
                  str = str.replace('=', '==');
                }
                if (eval(str)) {
                  ary2.push(j);
                }
              }
            } else {
              for (let j = 1; j < args[i].length; j++) {
                let str = args[i][j] + '==' + args[i + 1];
                if (eval(str)) {
                  ary2.push(j);
                }
              }
            }
            ary1 = ary1.filter(function (val) {
              return ary2.indexOf(val) > -1;
            });
          }
        }
        for (let i = 0; i < ary1.length; i++) {
          let ind = ary1[i];
          if (args[0][ind] != null || args[0][ind] != '') {
            sum += Number(args[0][ind]);
          } else {
            continue;
          }
        }
      }
      return sum;
    },
  },

  {
    key: 'TRUNC',
    title: tf('formula.math._trunc'),
    render: function (args) {
      if (args.length > 2) {
        throw new Error('参数不符');
      } else if (args.length == 1) {
        return Math.trunc(Number(args[0]));
      } else {
        let numStr = args[0].toString();
        let index = numStr.indexOf('.');
        if (index == -1) {
          index = numStr.length;
          numStr += '.0000000000000';
        } else {
          numStr += '0000000000000';
        }
        let newNum = numStr.substring(0, index + Number(args[1]) + 1);
        return newNum;
      }
    },
  },
  {
    key: 'ABS',
    title: tf('formula.math._abs'),
    render: (args) => {
      if (args.length !== 1) {
        throw new Error('参数必有且唯一');
      }
      if (Number(args[0]) > 0) {
        return Number(args[0]);
      } else if (Number(args[0]) < 0) {
        return -Number(args[0]);
      } else {
        throw new Error('0没有绝对值');
      }
    },
  },
  {
    key: 'EXP',
    title: tf('formula.math._exp'),
    render: (args) => {
      let e = 2.71828182845904;
      let i = 0;
      let re = 1;
      if (args.length !== 1) {
        throw new Error('参数存在且唯一');
      }
      while (i <= Number(args[0]) - 1) {
        re *= e;
        i++;
      }
      return Number(re.toFixed(7));
    },
  },
  {
    key: 'PI',
    title: tf('formula.math._pi'),
    render: () => {
      return Number(3.14159265);
    },
  },
  {
    key: 'POWER',
    title: tf('formula.math._power'),
    render: (args) => {
      if (args.length !== 2) {
        throw new Error('参数存在且为两个');
      }
      let re = 1;
      let i = 0;
      for (i; i < Number(args[1]); i++) {
        re *= Number(args[0]);
      }
      return Number(re);
    },
  },
  {
    key: 'PRODUCT',
    title: tf('formula.math._product'),
    render: function (args) {
      if (args.length < 1) {
        throw new Error('参数必须，至少1个');
      } else if (args.length > 255) {
        throw new Error('参数最多255个');
      }
      let result = 1;
      let nullNum = 0;
      let all = 0;
      if (args.length === 1) {
        if (Array.isArray(args)) {
          if (args[0].length === 0) {
            return 0;
          }
          args[0].map(item => {
            if (item.length === 0) {
              item = 1;
              nullNum += 1;
            }
            result *= Number(item);
          });
        } else {
          if (args[0].length === 0) {
            args[0] = 1;
            nullNum += 1;
          }
          result *= Number(args[0]);
        }
        args.forEach(item => {
          all += item.length;
        });
        if (nullNum === all) {
          result = 0;
        }
        nullNum = 0;
        return Number(result);
      } else if (args.length >= 1) {
        args.forEach(item => {
          if (Array.isArray(item)) {
            item.map(item => {
              if (item.length === 0) {
                item = 1;
                nullNum += 1;
              }
              result *= Number(item);
            });
          } else {
            if (item.length === 0) {
              item = 1;
              nullNum += 1;
            }
            result *= Number(item);
          }
        });
        args.forEach(item => {
          all += item.length;
        });
        if (nullNum === all) {
          result = 0;
          all = 0;
        }
        nullNum = 0;
        return Number(result);
      } else {
        return 0;
      }
    },
  },
  {
    key: 'RAND',
    title: tf('formula.math._rand'),
    render: () => {
      return Math.random();
    },
  },
  {
    key: 'RANDBETWEEN',
    title: tf('formula.math._randbetween'),
    render: (args) => {
      if (args.length !== 2) {
        throw new Error('参数存在且为两个');
      }
      return Math.floor(Math.random() * (args[1] - args[0] + 1) + args[0]);
    },
  },


];

export default {};
export {
  Formula,
};
