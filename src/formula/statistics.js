/**
 formula:
 统计类
 */
import { tf } from '../locale/locale';
import Excel from 'exceljs';


const Formula = [
    {
        key: 'AVERAGE',
        title: tf('formula.statistics.average'),
        render: (args)=>{
            if(args.length==0){
                throw new Error("没有参数，无法计算");
            }
            let total=0;
            let idx;
            let count=0;
            // 读取单元格区域内容，并进行判断
            for(idx=0;idx<args.length;idx++){
                if(Array.isArray(args[idx])){
                    let childIdx;
                    for(childIdx=0;childIdx<args[idx].length;childIdx++){
                        if(isNumber(args[idx][childIdx])){
                            total+=Number(args[idx][childIdx])
                            count++;
                        }
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
            let total=0;
            let idx;
            let count=0;
            // 读取条件表达式
            let strExp=args[args.length-1];
            // 读取单元格区域内容，并进行判断
            for(idx=0;idx<args.length-1;idx++){
                if(Array.isArray(args[idx])){
                    let childIdx;
                    for(childIdx=0;childIdx<args[idx].length;childIdx++){
                        // 判断表达式，转换为函数得到逻辑值
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
                throw new Error(Excel.ErrorValue.DivZero);
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
                for(let idx=0;idx<args.length;idx++){
                    if(Array.isArray(args[idx])){
                        count+=args[idx].length;
                    }else{
                        count++;
                    }
                }
                return count;
            }
        }
    },

    {
        key: 'COUNTA',
        title: tf('formula.statistics.counta'),
        render: (args)=>{
            if(args.length==0){
                return 0;
            }else{
                let count=0;
                for(let idx=0;idx<args.length;idx++){
                    if(Array.isArray(args[idx])){
                        let childIdx;
                        for(childIdx=0;childIdx<args[idx].length;childIdx++){
                            if(args[idx][childIdx].trim()!=""){
                                count++;
                            }
                        }
                    }
                    return count;
                }
            }
        }
    },

    {
        key: 'COUNTBLANK',
        title: tf('formula.statistics.countblank'),
        render: (args)=>{
            if(args.length==0){
                return 0;
            }else{
                let count=0;
                for(let idx=0;idx<args.length;idx++){
                    if(Array.isArray(args[idx])){
                        let childIdx;
                        for(childIdx=0;childIdx<args[idx].length;childIdx++){
                            if(args[idx][childIdx].trim()===""){
                                count++;
                            }
                        }
                    }
                    return count;
                }
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
                // 取出条件语句
                let strExp=args[args.length-1];
                for(let idx=0;idx<args.length-1;idx++){
                    if(Array.isArray(args[idx])){
                        let childIdx;
                        for(childIdx=0;childIdx<args[idx].length;childIdx++){
                            // 判断是否符合条件，是则计数器加一
                            let boolValue= (new Function("return " +args[idx][childIdx]+strExp)).call(this);
                            if(boolValue){
                                count++;
                            }
                        }
                    }else{
                        // 判断是否符合条件，是则计数器加一
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
        key: 'MAX',
        title: tf('formula.statistics.max'),
        render: (args)=>{
            if(args.length==0){
                return 0;
            }else{
                let arrayList=[];
                for(let idx=0;idx<args.length;idx++){
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

];

// 内部函数，判断字符串是否可以转换为数值
function isNumber(value) {
    return 'number' && !isNaN(value);
}

export default {};
export {
    Formula,
};
