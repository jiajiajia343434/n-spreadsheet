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
  }

];

export default {};
export {
  Formula,
};
