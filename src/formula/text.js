/**
 formula:
 文本处理类
 */
import { tf } from '../locale/locale';


const Formula = [
  {
    key: 'SUBSTITUTE',
    title: tf('formula.text.substitute'),
    render: function (args) {
      debugger;
      if(args.length<4){

      }
      var str = args[0];
      var old_text = args[1];
      var new_text = args[2];
      var index=args[3];
      if (args.length==4){

        var dataIndex=new Array();
        for (var i=0;i<str.length;i++){
          var nane=str.indexOf(old_text,i)
          if (nane==-1){
            break;
          }else{
            dataIndex.push(nane);
            i+=old_text.length;
          }
        }
        if (dataIndex.length<index){
          return str;
        }else{
          return str.substr(0,dataIndex[index-1])+new_text+str.substr(dataIndex[index-1]+old_text.length,str.length);
        }
      }
     else{
       return str.replace(new RegExp(old_text, "gm"), new_text);
      }
    }
  },
];

export default {};
export {
  Formula,
};
