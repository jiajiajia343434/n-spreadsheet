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
  }



];

export default {};
export {
  Formula,
};
