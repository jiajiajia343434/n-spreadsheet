import { expr2xy, xy2expr } from '../model/alphabet';

const base_operator = [
  ':',
  '%',
  '^',
  '*', '/',
  '+', '-',
  '&',
  '=', '>', '<', '>=', '<=', '<>',
];
const operatorMap = {
  ':': () => new Colon(),
  '%': () => new Percent(),
  '^': () => new Power(),
  '*': () => new Multiple(),
  '/': () => new Div(),
  '+': () => new Add(),
  '-': () => new Sub(),
  '&': () => new Connect(),
  '=': () => new Equal(),
  '>': () => new Greater(),
  '<': () => new Less(),
  '>=': () => new GreaterEqual(),
  '<=': () => new LessEqual(),
  '<>': () => new NotEqual(),
  ' ': () => new Space(),

};
//eg: -1 + SUM(A1:A5 A2:B2,NUMBER(-1),(1+B2)*3+B6)
//中缀表达式 => 后缀表达式 + 公式树的形式 , 即公式作为子表达式处理，在后缀表达式里一个公式当做普通操作数看待
const infixToSuffixExpr = src => {
  let ex = src.trim();

  let result = [];//存放结果
  let chars = [];//存放读取到的零散操作数
  let stack = [];//操作符栈

  for (let i = 0; i < ex.length; i += 1) {
    let c = ex.charAt(i);

    //遇到""字符串直接引用内部所有内容作为操作数
    // todo 转义的情况
    if (c === '"') {
      i += 1;
      while (ex.charAt(i) !== '"') {
        chars.push(ex.charAt(i));
        i += 1;
        if (i > ex.length) {
          throw new Error('公式拼写错误');
        }
      }
      result.push(`"${chars.join('')}`);
      chars = [];
      continue;
    }

    //遇到空格判断是否为操作符
    if (c === ' ') {
      // todo 实现空格运算符
    }

    //遇到连续的字母和数字，合并为操作数
    while ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || c === '.') {
      chars.push(c.toUpperCase());
      i += 1;
      c = ex.charAt(i);
    }
    if (chars.length > 0) {
      result.push(chars.join(''));
      chars = [];
      i -= 1;
      continue;
    }

    //遇到操作符
    if (base_operator.includes(c)) {
      //判断特殊情况 '-' 负号还是减法
      if (c === '-') {
        let isSubZero = false;
        let j = i - 1;
        if (j < 0) {
          isSubZero = true;
        } else {
          while (ex.charAt(j) === ' ' && j >= 0) {
            if (ex.charAt(j) === '(') {
              isSubZero = true;
            }
            j -= 1;
          }
        }
        if (isSubZero) {
          chars.push('-');
          i += 1;
          c = ex.charAt(i);
          while ((c >= '0' && c <= '9') || c === '.') {
            chars.push(c);
            i += 1;
            c = ex.charAt(i);
          }
          i -= 1;
          result.push(chars.join(''));
          chars = [];
          continue;
        }
      }
      //多字符操作符判断 >= <= <>
      if (c === '>') {
        if (ex.charAt(i + 1) === '=') {
          i += 1;
          c = '>=';
        }
      }
      if (c === '<') {
        if (ex.charAt(i + 1) === '=' || ex.charAt(i + 1) === '>') {
          i += 1;
          c += ex.charAt(i);
        }
      }

      const operator = operatorMap[c]();
      if (stack.length > 0) {
        let fn = stack[stack.length - 1];
        while (operator.proper(fn) === -1 && fn !== '(') {
          result.push(fn);
          stack.pop();
          fn = stack[stack.length - 1];
          if (typeof (fn) == 'undefined') break;
        }
      }
      stack.push(operator);
    }

    //遇到左括号
    if (c === '(') {
      //判断是否是公式的括号
      if (i === 0 || result[result.length - 1] instanceof Operator) {
        //不是公式的括号
        stack.push(c);
        continue;
      } else {
        //是公式的括号 开始截取子表达式
        let left_bracket_count = 1;
        let start = i + 1;
        let end = i + 1;
        let n = ex.charAt(end);
        while (left_bracket_count !== 0) {
          if (end > ex.length) {
            throw new Error('缺失右括号');
          }
          if (n === '(') {
            left_bracket_count += 1;
          }
          if (n === ')') {
            left_bracket_count -= 1;
          }
          end += 1;
          n = ex.charAt(end);
        }

        //按','分解参数字符串
        let param_str = ex.substring(start, end - 1);
        let expression_str = [];
        let commaIndex = [];
        let cursor_char;
        if ((end - 1) !== start) {
          for (let cursor = 0; cursor < param_str.length; cursor += 1) {
            cursor_char = param_str.charAt(cursor);
            if (cursor_char === '(') {
              left_bracket_count += 1;
            }
            if (cursor_char === ')') {
              left_bracket_count -= 1;
            }
            if (cursor_char === ',' && left_bracket_count === 0) {
              commaIndex.push(cursor);
            }
          }
        }
        let sub_start = 0;
        let cursor = 0;
        while (cursor < commaIndex.length) {
          expression_str.push(param_str.substring(sub_start, commaIndex[cursor]));
          sub_start = commaIndex[cursor] + 1;
          cursor += 1;
        }
        if (cursor > 0 || param_str.length > 0) {
          //fix bug: 如果cursor大于0，说明至少有一个逗号
          //所以最后应该截取最后一个逗号之后的表达式作为最后一个参数
          //还有一种情况是只有一个参数的情况，没有逗号
          expression_str.push(param_str.substring(sub_start));
        }

        //构建函数对象
        let fnName = result.pop();
        result.push(new Formula(fnName, ...(expression_str.map(ex => infixToSuffixExpr(ex)))));
        //因为循环完毕后i会+1，所以-1
        i = end - 1;
        continue;
      }
    }

    //遇到右括号
    if (c === ')') {
      if (stack.length > 0) {
        let fn = stack[stack.length - 1];
        while (fn !== '(') {
          result.push(fn);
          stack.pop();
          fn = stack[stack.length - 1];
          if (typeof (fn) == 'undefined') throw new Error('缺失左括号');
        }
      }
    }

  }
  //处理最后一个字符
  while (stack.length > 0) {
    let op = stack.pop();
    if (op !== '(') {
      result.push(op);
    }
  }

  for (let i = 0; i < result.length; i++) {
    let e = result[i];
    if (typeof (e) == 'string' && e.length > 1 && e[0] >= 'A' && e[0] <= 'Z') {
      result[i] = new Cell(e);
    }
  }
  return result;
};
//计算后缀表达式
const evalSuffixExpr = (suffixExpr, formulaMap, cellRender) => {
  const stack = [];
  for (let i = 0; i < suffixExpr.length; i += 1) {
    let op = suffixExpr[i];
    if (op instanceof Formula) {
      let eps = op.expressions;
      for (let i = 0; i < eps.length; i += 1) {
        let r = evalSuffixExpr(eps[i], formulaMap, cellRender);

        if (r instanceof Cell) {// todo 以后转为引用实现时不需要判断
          eps[i] = cellRender(r.x, r.y);
        } else {
          eps[i] = r;
        }
      }
      stack.push(formulaMap[op.key].render([...eps]));
    } else if (op instanceof Operator) {
      let paramLength = op.argLength;
      let params = [];
      for (let i = 0; i < paramLength; i += 1) {
        params.push(stack.pop());
      }
      if (op instanceof Colon) {// todo 以后转为引用实现时不需要判断
        let v = op.cal(params.reverse());
        stack.push([...v.map(_v => cellRender(_v.x, _v.y))]);
      } else if (op instanceof Connect) {// todo 以后转为引用实现时不需要判断
        let p = params.reverse();
        let r = op.cal(p.map(_p => {
          if (_p instanceof Cell) {
            return cellRender(_p.x, _p.y);
          }
          return _p;
        }));
        stack.push(r);
      } else {
        stack.push(op.cal(params.reverse()));
      }
    } else if (op instanceof Cell) {
      stack.push(op);
    } else {
      if ((op[0] >= '0' && op[0] <= '9') || op[0] === '-') {
        stack.push(Number(op));
      }
      if (op[0] === '"') {
        stack.push(op.substring(1));
      }
    }

  }
  return stack[0];
};

const evalFormula = (srcText, formulaMap, cellRender, parentCell) => {
  let expr = infixToSuffixExpr(srcText);
  if (expr.length === 0) return srcText;
  let result = srcText;
  try {
    result = evalSuffixExpr(expr, formulaMap, cellRender);
  } catch (e) {
    console.log(e);
  }
  if (result instanceof Cell) {
    return cellRender(result.x, result.y);
  }
  if (Array.isArray(result)) {
    return result[0];
  }
  return result;
};

//单元格引用
class Cell {
  constructor(name) {
    const [x, y] = expr2xy(name);
    this.x = x;
    this.y = y;
    this.name = name;
  }
}

//公式
class Formula {
  constructor(key, ...expressions) {
    this.key = key;
    this.expressions = expressions;
  }
}

//所有操作符的父类
class Operator {
  constructor() {
    this.properValue = 0;
    this.argLength = 2;
  }

  proper(other) {
    if (this.properValue === other.properValue) {
      return 0;
    }
    return this.properValue > other.properValue ? 1 : -1;
  }

  cal(params) {
  }
}

//冒号操作符
class Colon extends Operator {
  constructor() {
    super();
    this.key = 'colon';
    this.properValue = 90;
  }

  cal(params) {
    let sCell = params[0];
    let eCell = params[1];
    const result = [];
    for (let x = sCell.x; x <= eCell.x; x += 1) {
      for (let y = sCell.y; y <= eCell.y; y += 1) {
        result.push(new Cell(xy2expr(x, y)));
      }
    }
    return result;
  }
}

//空格操作符
class Space extends Operator {
  constructor() {
    super();
    this.key = 'space';
    this.properValue = 80;
  }

  cal(params) {
  }
}

//百分比操作符
class Percent extends Operator {
  constructor() {
    super();
    this.key = 'percent';
    this.argLength = 1;
    this.properValue = 70;
  }

  cal(params) {
    return params[0] / 100;
  }
}

//幂操作符
class Power extends Operator {
  constructor() {
    super();
    this.key = 'power';
    this.properValue = 60;
  }

  cal(params) {
    return Math.pow(params[0], params[1]);
  }
}

//乘法操作符
class Multiple extends Operator {
  constructor() {
    super();
    this.key = 'multiple';
    this.properValue = 40;
  }

  cal(params) {
    return Number(params[0]) * Number(params[1]);
  }
}

//除法操作符
class Div extends Operator {
  constructor() {
    super();
    this.key = 'div';
    this.properValue = 40;
  }

  cal(params) {
    return Number(params[0]) / Number(params[1]);
  }
}

//加法操作符
class Add extends Operator {
  constructor() {
    super();
    this.key = 'add';
    this.properValue = 30;
  }

  cal(params) {
    return Number(params[0]) + Number(params[1]);
  }
}

//减法操作符
class Sub extends Operator {
  constructor() {
    super();
    this.key = 'sub';
    this.properValue = 30;
  }

  cal(params) {
    return Number(params[0]) - Number(params[1]);
  }
}

//&连接操作符
class Connect extends Operator {
  constructor() {
    super();
    this.key = 'connect';
    this.properValue = 20;
  }

  cal(params) {
    return `${params[0]}${params[1]}`;
  }
}

//比较操作符 >
class Greater extends Operator {
  constructor() {
    super();
    this.key = 'greater';
    this.properValue = 10;
  }

  cal(params) {
    return params[0] > params[1];
  }
}

//比较操作符 <
class Less extends Operator {
  constructor() {
    super();
    this.key = 'less';
    this.properValue = 10;
  }

  cal(params) {
    return params[0] < params[1];
  }
}

//比较操作符 >=
class GreaterEqual extends Operator {
  constructor() {
    super();
    this.key = 'gtAeq';
    this.properValue = 10;
  }

  cal(params) {
    return params[0] >= params[1];
  }
}

//比较操作符 <=
class LessEqual extends Operator {
  constructor() {
    super();
    this.key = 'lsAeq';
    this.properValue = 10;
  }

  cal(params) {
    return params[0] <= params[1];
  }
}

//比较操作符 =
class Equal extends Operator {
  constructor() {
    super();
    this.key = 'equal';
    this.properValue = 10;
  }

  cal(params) {
    return params[0] === params[1];
  }
}

//比较操作符 <>
class NotEqual extends Operator {
  constructor() {
    super();
    this.key = 'nEq';
    this.properValue = 10;
  }

  cal(params) {
    return params[0] !== params[1];
  }
}

export default {};
export {
  evalFormula,
};



