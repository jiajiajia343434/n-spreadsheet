/**
 formula:
 逻辑类
 */
import {tf} from '@/locale/locale';


const Formula = [
    {
        key: 'IF',
        title: tf('formula.logic._if'),
        render: function (args) {
            console.log(args);
            if(args.length<2){
              throw new Error("参数过少");
            }
            let boolean = args[0];
            if (boolean) {
                return args[1];
            } else {
                if (args.length < 3) {
                    return 0;
                }
                return args[2];
            }
        }
    },
    {
        key: 'SWITCH',
        title: tf('formula.logic._switch'),
        render: (args) => {
            if(args.length <= 1) {
               throw new Error('参数太少')
            } else if(args.length > 254) { // 需匹配值  [1-126]可匹配值
                throw new Error('该函数最多可匹配126个值或结果');
            } else {
                let target = args[0];
                for(let i = 1; i < args.length; i++) {
                    if(args[0] != null) {
                        if(target === args[i]) {
                            return args[i + 1];
                        }
                    } else {
                        throw new Error('#N/A!');
                    }
                }
                if(args.length % 2 === 0) {
                    return args[args.length - 1];
                } else {
                    throw new Error('#N/A!');
                }
            }
        }
    },
    {
        key: 'TRUE',
        title: tf('formula.logic._true'),
        render: () => {
            return true;
        }
    },
    {
        key: 'XOR',
        title: tf('formula.logic._xor'),
        render: (args) => {
            if(args.length < 1) {
                throw new Error('参数太少，至少1个');
            } else if(args.length > 254) {
                throw new Error('参数太多，最多254个');
            }
            let re = false;
            if(typeof(args[0]) === 'number') {
                re = true;
            } else if(typeof(args[0]) === 'boolean') {
                re = args[0];
            }
            if(args.length >= 2) {
                args.shift();
                args.forEach(item => {
                    re = re ^ item;
                });
            }
            return re === 1 ? true : re === 0 ? false : true;
        }
    }
];

export default {};
export {
    Formula,
};
