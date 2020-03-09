/**
 formula:
 统计类
 */
import { tf } from '../locale/locale';


const Formula = [
    {
        key: 'AVERAGE',
        title: tf('formula.statistics.average'),
        render: (args)=>{
            console.log(args);
            if(args.length==0){
                throw new Error("没有参数，无法计算");
            }
            let total=0;
            let idx;
            let count=0;
            //读取单元格区域内容，并进行判断
            for(idx=0;idx<args.length;idx++){
                if(Array.isArray(args[idx])){
                    let childIdx;
                    for(childIdx=0;childIdx<args[idx].length;childIdx++){
                        total+=Number(args[idx][childIdx])
                        count++;
                    }
                }else{
                    total+=Number(args[idx]);
                    count++;
                }
            }
            return total/count;
        }
    },
    {
        key: 'AVERAGEIF',
        title: tf('formula.statistics.averageif'),
        render: (args)=>{
            if(args.length==0){
                throw new Error("没有参数，无法计算");
            }
            console.log(args);
            let total=0;
            let idx;
            let count=0;
            //读取条件表达式
            let strExp=args[args.length-1];
            //读取单元格区域内容，并进行判断
            for(idx=0;idx<args.length-1;idx++){
                if(Array.isArray(args[idx])){
                    let childIdx;
                    for(childIdx=0;childIdx<args[idx].length;childIdx++){
                        //判断表达式，转换为函数得到逻辑值
                        if(isNumber(args[idx][childIdx])){
                            let boolValue= (new Function("return " +args[idx][childIdx]+strExp)).call(this);
                            total+=Number(boolValue?(args[idx][childIdx]):0);
                            if(boolValue){
                                count++;}
                        }
                    }
                }else{
                    if(isNumber(args[idx])){
                        let boolValue= (new Function("return " +args[idx]+strExp)).call(this);
                        total+=Number((args[idx]+strExp)?(args[idx]):0);
                        if(boolValue){
                            count++;
                        }
                    }
                }
            }
            if(count===0){
                throw new Error("#DIV/0!");
            }else{
                return total/count;
            }
        }
    },

    {
        key: 'COUNT',
        title: tf('formula.statistics.count'),
        render: (args)=>{
            if(args.length==0){
                return 0;
            }else{
                let count=0;
                for(var idx=0;idx<args.length;idx++){
                    if(Array.isArray(args[idx])){
                        let childIdx;
                        for(childIdx=0;childIdx<args[idx].length;childIdx++){
                            count++;
                        }
                    }else{
                        count++;
                    }
                }
                return count;
            }
        }
    },
    {
        key: 'COUNTIF',
        title: tf('formula.statistics.countif'),
        render: (args)=>{
            if(args.length==0){
                return 0;
            }else{
                let count=0;
                //取出条件语句
                let strExp=args[args.length-1];
                for(var idx=0;idx<args.length-1;idx++){
                    if(Array.isArray(args[idx])){
                        let childIdx;
                        for(childIdx=0;childIdx<args[idx].length;childIdx++){
                            //判断是否符合条件，是则计数器加一
                            let boolValue= (new Function("return " +args[idx][childIdx]+strExp)).call(this);
                            if(boolValue){
                                count++;
                            }
                        }
                    }else{
                        //判断是否符合条件，是则计数器加一
                        let boolValue= (new Function("return " +args[idx]+strExp)).call(this);
                        if(boolValue){
                            count++;
                        }
                    }
                }
                return count;
            }
        }
    },

    {
        key: 'MEDIAN',
        title: tf('formula.statistics.median'),
        render: (args)=>{
            if(args.length==0){
                throw new Error("没有参数，无法计算");
            }else{
                let arrNums=[];
                for(let idx=0;idx<args.length;idx++){
                    if(Array.isArray(args[idx])){
                        let childIdx;
                        for(childIdx=0;childIdx<args[idx].length;childIdx++){
                            //判断表达式，转换为函数得到逻辑值
                            if(isNumber(args[idx][childIdx])){
                                console.log(args[idx][childIdx]);
                                arrNums.push(args[idx][childIdx]);
                            }
                        }
                    }else{
                        if(isNumber(args[idx])){
                            arrNums.push(args[idx]);
                        }
                    }
                }
                arrNums.sort(function (a, b) { return a - b });
                return arrNums.length % 2 === 0 ? (Number(arrNums[arrNums.length / 2]) + Number(arrNums[(arrNums.length / 2) - 1])) / 2 : arrNums[Math.floor(arrNums.length / 2)];

            }
        }
    },




    {
        key: 'MAX',
        title: tf('formula.statistics.max'),
        render: (args)=>{
            if(args.length==0){
                return 0;
            }else{
                let arrayList=[];
                for(var idx=0;idx<args.length;idx++){
                    if(Array.isArray(args[idx])){
                        let childIdx;
                        for(childIdx=0;childIdx<args[idx].length;childIdx++){
                            arrayList.push(Number(args[idx][childIdx]));
                        }
                    }else{
                        arrayList.push(Number(args[idx]));
                    }
                }
                let maxValue= Math.max(...arrayList)
                return maxValue;
            }
        }
    },
    {
        key: 'MIN',
        title: tf('formula.statistics.min'),
        render: (args)=>{
            if(args.length==0){
                return 0;
            }else{
                let arrayList=[];
                for(var idx=0;idx<args.length;idx++){
                    if(Array.isArray(args[idx])){
                        let childIdx;
                        for(childIdx=0;childIdx<args[idx].length;childIdx++){
                            arrayList.push(Number(args[idx][childIdx]));
                        }
                    }else{
                        arrayList.push(Number(args[idx]));
                    }
                }
                let maxValue= Math.min(...arrayList)
                return maxValue;
            }
        }
    }
];

function isNumber(value) {
    return 'number' && !isNaN(value);
}

export default {};
export {
    Formula,
};
