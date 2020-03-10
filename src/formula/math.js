/**
 formula:
 数学运算类
 */
import {tf} from '../locale/locale';


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
                throw new Error("参数不符");
            } else if (Number(args[1]) >= 0) {
                //参数2为正
                //return Number(args[0]).toFixed(Number(args[1]));
                if (args[0] >= 0) {
                    var times = Math.pow(10, Number(args[1]))
                    var des = Number(args[0]) * times + 0.5
                    des = parseInt(des, 10) / times
                    return des + '';
                } else {
                    var times = Math.pow(10, Number(args[1]));
                    var des = Number(args[0]) * times * (-1) + 0.5;
                    des = parseInt(des, 10) / times * (-1);
                    return des + '';
                }

            } else {
                //参数2为负
                var power = Number(args[1]) * (-1);//要舍弃的位数
                var str = args[0].toString();//参数1
                if (str.indexOf('.') != -1) {
                    //有小数点
                    var num = new Array();
                    num = str.split('.');
                    var zero = Math.pow(10, power);//补零
                    var nums = Number(num[0]);//取出来小数点之前的整数
                    if (nums > 0) {
                        var strs = nums.toString();
                        var n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
                        if (n >= 5) {
                            return (Number(strs.substring(0, (strs.length - power))) + 1) * zero;
                        } else {
                            return Number(strs.substring(0, (strs.length - power))) * zero;
                        }
                    } else {
                        var strs = (nums * (-1)).toString();
                        var n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
                        if (n >= 5) {
                            return (Number(strs.substring(0, (strs.length - power))) + 1) * zero * (-1);
                        } else {
                            return Number(strs.substring(0, (strs.length - power))) * zero * (-1);
                        }
                    }
                } else {
                    //没有小数点
                    var nums = Number(args[0]);//取出来小数点之前的整数
                    var zero = Math.pow(10, power);//补零
                    if (nums > 0) {
                        var strs = nums.toString();
                        var n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
                        if (n >= 5) {
                            return (Number(strs.substring(0, (strs.length - power))) + 1) * zero;
                        } else {
                            return Number(strs.substring(0, (strs.length - power))) * zero;
                        }
                    } else {
                        var strs = (nums * (-1)).toString();
                        var n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
                        if (n >= 5) {
                            return (Number(strs.substring(0, (strs.length - power))) + 1) * zero * (-1);
                        } else {
                            return Number(strs.substring(0, (strs.length - power))) * zero * (-1);
                        }
                    }
                }
            }
        }
    },
    {
        key: 'ROUNDUP',
        title: tf('formula.math._roundup'),
        render: function (args) {
            if (args.length != 2) {
                throw new Error("参数不符");
            } else if (Number(args[1]) >= 0) {
                var power = Number(args[1]);//要舍弃的位数
                var num1 = Number(args[0]);
                var num2 = Number(args[0]).toFixed(Number(args[1]));
                if (num1 >= 0) {
                    if (num1 < num2) {
                        return num2;
                    } else {
                        var num3 = Math.pow(10, power * (-1));
                        var result = Number(num2) + Number(num3);
                        return result.toFixed(power);
                    }
                } else {
                    if (num1 > num2) {
                        return num2;
                    } else {
                        var num3 = Math.pow(10, power * (-1));
                        var result = Number(num2) - Number(num3);
                        return result.toFixed(power);
                    }
                }
            } else {
                //参数2为负
                var power = Number(args[1]) * (-1);//要舍弃的位数
                var str = args[0].toString();//参数1
                if (str.indexOf('.') != -1) {
                    //有小数点
                    var num = new Array();
                    num = str.split('.');
                    var zero = Math.pow(10, power);//补零
                    var nums = Number(num[0]);//取出来小数点之前的整数
                    if (nums > 0) {
                        var strs = nums.toString();
                        var n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
                        return (Number(strs.substring(0, (strs.length - power))) + 1) * zero;
                    } else {
                        var strs = (nums * (-1)).toString();
                        var n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
                        return (Number(strs.substring(0, (strs.length - power))) + 1) * zero * (-1);
                    }
                } else {
                    //没有小数点
                    var nums = Number(args[0]);//取出来小数点之前的整数
                    var zero = Math.pow(10, power);//补零

                    if (nums > 0) {
                        var strs = nums.toString();
                        var n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
                        return (Number(strs.substring(0, (strs.length - power))) + 1) * zero;
                    } else {
                        var strs = (nums * (-1)).toString();
                        var n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
                        return (Number(strs.substring(0, (strs.length - power))) + 1) * zero * (-1);
                    }
                }
            }
        }
    },
    {
        key: 'ROUNDDOWN',
        title: tf('formula.math._roundfdown'),
        render: function (args) {
            if (args.length != 2) {
                throw new Error("参数不符");
            } else if (Number(args[1]) >= 0) {
                var power = Number(args[1]);//要舍弃的位数
                var num1 = Number(args[0]);
                var num2 = Number(args[0]).toFixed(Number(args[1]));
                if (num1 >= 0) {
                    if (num1 > num2) {
                        return num2;
                    } else {
                        var num3 = Math.pow(10, power * (-1));
                        var result = Number(num2) - Number(num3);
                        return result.toFixed(power);
                    }
                } else {
                    if (num1 < num2) {
                        return num2;
                    } else {
                        var num3 = Math.pow(10, power * (-1));
                        var result = Number(num2) + Number(num3);
                        return result.toFixed(power);
                    }
                }
            } else {
                //参数2为负
                var power = Number(args[1]) * (-1);//要舍弃的位数
                var str = args[0].toString();//参数1
                if (str.indexOf('.') != -1) {
                    //有小数点
                    var num = new Array();
                    num = str.split('.');
                    var zero = Math.pow(10, power);//补零
                    var nums = Number(num[0]);//取出来小数点之前的整数
                    if (nums > 0) {
                        var strs = nums.toString();
                        var n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
                        return Number(strs.substring(0, (strs.length - power))) * zero;
                    } else {
                        var strs = (nums * (-1)).toString();
                        var n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
                        return Number(strs.substring(0, (strs.length - power))) * zero * (-1);
                    }
                } else {
                    //没有小数点
                    var nums = Number(args[0]);//取出来小数点之前的整数
                    var zero = Math.pow(10, power);//补零

                    if (nums > 0) {
                        var strs = nums.toString();
                        var n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
                        return Number(strs.substring(0, (strs.length - power))) * zero;
                    } else {
                        var strs = (nums * (-1)).toString();
                        var n = Number(strs.charAt(strs.length - power));//舍弃的最后一位
                        return Number(strs.substring(0, (strs.length - power))) * zero * (-1);
                    }
                }
            }
        }
    },
    {
        key: 'SQRT',
        title: tf('formula.math._sqrt'),
        render: function (args) {
            if (args.length != 1) {
                throw new Error("参数不符");
            } else if (args[0] < 0) {
                throw new Error("('#N/A!')");
            } else {
                return Math.sqrt(Number(args[0]));
            }
        }
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
                throw new Error("参数不符");
            } else {
                let sum = new Number(0);
                for (let i = 0; i < args[0].length; i++) {
                    sum += Number(args[0][i]);
                }
                return sum;
            }
        }
    },
    {
        key: 'SUMIF',
        title: tf('formula.math._sumif'),
        render: function (args) {

            if (args.length != 2 && args.length != 3) {
                throw new Error("参数不符");
            } else {
                if (args.length == 2) {
                    if (args[1].indexOf('>') != -1 || args[1].indexOf('<') != -1 || args[1].indexOf('=') != -1) {

                        var func = new Function("a", "b", "return a+b;");

                        var sum = 0;
                        for (var i = 0; i < args[0].length; i++) {
                            var str = func(args[0][i], args[1]);
                            if (str.charAt(1) == "=") {
                                str = str.replace("=", "==");
                            }
                            if (eval(str)) {
                                sum += Number(args[0][i]);
                            }
                        }
                        return sum;
                    } else {
                        var sum = 0;
                        for (var i = 0; i < args[0].length; i++) {
                            var str = args[0][i] + "==" + args[1];
                            if (eval(str)) {
                                sum += Number(args[0][i]);
                            }
                        }
                        return sum;
                    }
                } else {
                    if (args[1].indexOf('>') != -1 || args[1].indexOf('<') != -1 || args[1].indexOf('=') != -1) {

                        var func = new Function("a", "b", "return a+b;");

                        var sum = 0;
                        for (var i = 0; i < args[0].length; i++) {
                            var str = func(args[0][i], args[1]);
                            if (str.charAt(1) == "=") {
                                str = str.replace("=", "==");
                            }
                            if (eval(str)) {
                                sum += Number(args[2][i]);
                            }
                        }
                        return sum;
                    } else {
                        var sum = 0;
                        for (var i = 0; i < args[0].length; i++) {
                            var str = args[0][i] + "==" + args[1];
                            if (eval(str)) {
                                sum += Number(args[2][i]);
                            }
                        }
                        return sum;

                    }


                }
            }
        }
    },
    {
        key: 'SUMIFS',
        title: tf('formula.math._sumifs'),
        render: function (args) {
            if (args.length < 3 || args.length > 255) {
                throw new Error("参数不符");
            } else {
                var length = args.length;
                var sum = 0;
                var ary1 = new Array();
                var ary2 = new Array();
                for (var i = 1; i < args.length; i += 2) {
                    if (i == 1) {
                        if (args[i + 1].indexOf('>') != -1 || args[i + 1].indexOf('<') != -1 || args[i + 1].indexOf('=') != -1) {
                            var func = new Function("a", "b", "return a+b;");
                            for (var j = 0; j < args[i].length; j++) {
                                var str = func(args[i][j], args[i + 1]);
                                if (str.charAt(1) == "=") {
                                    str = str.replace("=", "==");
                                }
                                if (eval(str)) {
                                    ary1.push(j);
                                }
                            }
                        } else {
                            for (var j = 1; j < args[i].length; j++) {
                                var str = args[i][j] + "==" + args[i + 1];
                                if (eval(str)) {
                                    ary1.push(j);
                                }
                            }
                        }
                    } else {
                        if (args[i + 1].indexOf('>') != -1 || args[i + 1].indexOf('<') != -1 || args[i + 1].indexOf('=') != -1) {
                            var func = new Function("a", "b", "return a+b;");
                            for (var j = 0; j < args[i].length; j++) {
                                var str = func(args[i][j], args[i + 1]);
                                if (str.charAt(1) == "=") {
                                    str = str.replace("=", "==");
                                }
                                if (eval(str)) {
                                    ary2.push(j);
                                }
                            }
                        } else {
                            for (var j = 1; j < args[i].length; j++) {
                                var str = args[i][j] + "==" + args[i + 1];
                                if (eval(str)) {
                                    ary2.push(j);
                                }
                            }
                        }
                        ary1 = ary1.filter(function (val) {
                            return ary2.indexOf(val) > -1
                        })
                    }
                }
                for (var i = 0; i < ary1.length; i++) {
                    var ind = ary1[i];
                    sum += Number(args[0][ind]);
                }
            }
            return sum;
        }
    },

    {
        key: 'TRUNC',
        title: tf('formula.math._trunc'),
        render: function (args) {
            if (args.length > 2) {
                throw new Error("参数不符");
            } else if (args.length == 1) {
                return Math.trunc(Number(args[0]));
            } else {
                var numStr = args[0].toString();
                var index = numStr.indexOf('.');
                if (index == -1) {
                    index = numStr.length;
                    numStr += ".0000000000000";
                } else {
                    numStr += "0000000000000";
                }
                var newNum = numStr.substring(0, index + Number(args[1]) + 1);
                return newNum;
            }
        }
    },


];

export default {};
export {
    Formula,
};
