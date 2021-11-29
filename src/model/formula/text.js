/**
 formula:
 文本处理类
 */
import {tf} from '@/locale/locale';


const Formula = [
  {
    key: 'SUBSTITUTE',
    title: tf('formula.text.substitute'),
    render: function (args) {
      if (args.length < 4) {

      }
      let str = args[0];
      let old_text = args[1];
      let new_text = args[2];
      let index = args[3];
      if (args.length === 4) {
        let dataIndex = [];
        for (let i = 0; i < str.length; i += 1) {
          let nane = str.indexOf(old_text, i);
          if (nane === -1) {
            break;
          } else {
            dataIndex.push(nane);
            i += old_text.length;
          }
        }
        if (dataIndex.length < index) {
          return str;
        } else {
          return str.substr(0, dataIndex[index - 1]) + new_text + str.substr(dataIndex[index - 1] + old_text.length, str.length);
        }
      } else {
        return str.replace(new RegExp(old_text, "gm"), new_text);
      }
    }
  },
  {
    key: 'TEXT',
    title: tf('formula.text.text'),
    render: args => {

    }
  },
  {
    key: 'TEXTJOIN',
    title: tf('formula.text.textjoin'),
    render: args => {

    }
  },
  {
    key: 'TRIM',
    title: tf('formula.text._trim'),
    render: args => {
      if(args.length>1){
        throw new Error('参数过多！');
      }
      if(args.length===0){
        throw new Error('参数过少！');
      }
      return args[0].trim();
    }
  },
  {
    key: 'UPPER',
    title: tf('formula.text.upper'),
    render: args => {
      if(args.length>1){
        throw new Error('参数过多！');
      }
      if(args.length===0){
        throw new Error('参数过少！');
      }
      return args[0].toUpperCase();
    }
  },
  {
    key: 'VALUE',
    title: tf('formula.text._value'),
    render: args => {

    }
  }
];

export default {};
export {
  Formula,
};
