/**
 formula:
 逻辑类
 */
import {tf} from '../locale/locale';


const Formula = [
    {
        key: 'IF',
        title: tf('formula.logic._if'),
        render: function (args) {
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
    }
];

export default {};
export {
    Formula,
};
