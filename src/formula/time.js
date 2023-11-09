/**
 formula:
 时间处理类
 */
import { tf } from '../locale/locale';


const Formula = [
    {
        //返回日期序列数。
        key: 'DATE',
        title: tf('formula.time.date'),
        render: function (args) {
            if(args == null || args.length<1){
                throw new Error("参数过少");
            }
            //如果参数中有非数字，返回#NAME
            if(isNaN(args[0]) || isNaN(args[1]) || isNaN(args[2])){
                throw new Error("#NAME");
            }
            //参数为一个时间的序列号值
            var date = new Date(args[0],Number(args[1])-1,args[2]);

            var serial = 25569.0 + ((date.getTime() - (date.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
            return Math.floor(serial);
        },
    },
  {
    //返回以序列数表示的某日期的天数。 天数是介于 1 到 31 之间的整数。
    key: 'DAY',
    title: tf('formula.time.day'),
    render: function (args) {
        if(args == null || args.length<1){
            throw new Error("参数过少");
        }
        //如果参数中有非数字，返回#NAME
        if(isNaN(args[0])){
            throw new Error("#NAME");
        }
        //参数为一个时间的序列号值
        var date = new Date(Math.round((Number(args[0]) - 25569)*86400*1000+(new Date()).getTimezoneOffset() * 60 * 1000));

        return date.getDate();
    },
  },
  {
    //返回时间值的小时数。
    // 小时数是介于 0 (12:00 A.M.) 到 23 (11:00 P.M.) 之间的整数
    key: 'HOUR',
    title: tf('formula.time.hour'),
    render: function (args) {
        if(args == null || args.length<1){
            throw new Error("参数过少");
        }
        //如果参数中有非数字，返回#NAME
        if(isNaN(args[0])){
            throw new Error("#NAME");
        }
        //参数为一个时间的序列号值
        var date = new Date(Math.round((Number(args[0]) - 25569)*86400*1000+(new Date()).getTimezoneOffset() * 60 * 1000));

        return date.getHours();
    },
  },
  {
    //返回时间值中的分钟。 分钟是一个介于 0 到 59 之间的整数
    key: 'MINUTE',
    title: tf('formula.time.minute'),
    render: function (args) {
      if(args == null || args.length<1){
        throw new Error("参数过少");
      }
      //如果参数中有非数字，返回#NAME
      if(isNaN(args[0])){
        throw new Error("#NAME");
      }
      //参数为一个时间的序列号值
      var date = new Date(Math.round((Number(args[0]) - 25569)*86400*1000+(new Date()).getTimezoneOffset() * 60 * 1000));

      return date.getMinutes();
    },
  },
  {
    //返回日期（以序列数表示）中的月份
    key: 'MONTH',
    title: tf('formula.time.month'),
    render: function (args) {
      if(args == null || args.length<1){
        throw new Error("参数过少");
      }
      //如果参数中有非数字，返回#NAME
      if(isNaN(args[0])){
        throw new Error("#NAME");
      }
      //参数为一个时间的序列号值
      var date = new Date(Math.round((Number(args[0]) - 25569)*86400*1000+(new Date()).getTimezoneOffset() * 60 * 1000));

      return date.getMonth()+1;
    },
  },
  {
    //返回参数 startdate 和 enddate 之间完整的工作日数值。
    // 工作日不包括周末和专门指定的假期。
    key: 'NETWORKDAYS',
    title: tf('formula.time.networkdays'),
    render: function (args) {
      if(args == null || args.length<2){
        throw new Error("参数过少");
      }
      //读取参数：开始日期，结束日期
      var startdate = new Date(args[0]);
      var enddate = new Date(args[1]);
      //计算日期差
      var rd = Math.floor((enddate.getTime()-startdate.getTime())/ (1000 * 60 * 60 * 24));

      //默认星期六、星期日
      var weekenddates = [0,6];

      var holidays = args.length>=3?args[2]:null;
      //判断是否周末
      if(weekenddates.findIndex(item => { return item == startdate.getDay()})>=0 && weekenddates.findIndex(item => { return item == enddate.getDay()})>=0 && Math.abs(rd)<2){
        return 0;
      }
      if (rd == 0)
        return 1;
      var r = 0;
      var dtTemp = startdate;

      // TODO:节假日未实现
      if(Array.isArray(holidays)){
        let childIdx;
        for(childIdx=0;childIdx<holidays.length;childIdx++){
          console.log(holidays[childIdx]);
        }
      }
      // console.log(holidays.toString())

      if(rd > 0){
        //开始日期早于结束日期
        for(var i = 0; i <= rd; i++){
          r++;
          startdate.setTime(startdate.getTime()+1000 * 60 * 60 * 24)
          if(weekenddates.findIndex(item => { return item == startdate.getDay()})>=0){
            r--;
            continue;
          }
          //判断节假日
          var thisDate = 25569.0 + ((startdate.getTime() - (startdate.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
          if(holidays != null && Math.floor(thisDate) == holidays){
            r--;
            continue;
          }

        }
        return r;
      }else{
        //开始日期晚于结束日期
        for(var i = 0; i >= rd; i--){
          r--;
          startdate.setTime(startdate.getTime()-1000 * 60 * 60 * 24)
          if(weekenddates.findIndex(item => { return item == startdate.getDay()})>=0){
            r++;
            continue;
          }
          //判断节假日
          var thisDate = 25569.0 + ((startdate.getTime() - (startdate.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
          if(holidays != null && Math.floor(thisDate) == holidays){
            r++;
            continue;
          }

        }
        return r;
      }

    },
  },
  {
    //返回两个日期之间的所有工作日数，使用参数指示哪些天是周末，以及有多少天是周末。
    // 周末和任何指定为假期的日期不被视为工作日。
    key: 'NETWORKDAYS.INTL',
    title: tf('formula.time.networkdaysintl'),
    render: function (args) {
      if(args == null || args.length<2){
        throw new Error("参数过少");
      }
      //读取参数：开始日期，结束日期
      var startdate = new Date(args[0]);
      var enddate = new Date(args[1]);
      //计算日期差
      var rd = Math.floor((enddate.getTime()-startdate.getTime())/ (1000 * 60 * 60 * 24));
      //读取周末参数
      var weekend = args.length>=3?(args[2]!=null?Number(args[2]):null):null;
      var weekenddates;
      if(weekend != null){
        //如果周末参数为数字
        if(!isNaN(weekend)){
          switch (weekend) {
            case 1:
              //星期六、星期日
              weekenddates = [0,6];
              break;
            case 2:
              //星期日、星期一
              weekenddates = [0,1];
              break;
            case 3:
              //星期一、星期二
              weekenddates = [1,2];
              break;
            case 4:
              //星期二、星期三
              weekenddates = [2,3];
              break;
            case 5:
              //星期三、星期四
              weekenddates = [3,4];
              break;
            case 6:
              //星期四、星期五
              weekenddates = [4,5];
              break;
            case 7:
              //星期五、星期六
              weekenddates = [5,6];
              break;
            case 11:
              //仅星期日
              weekenddates = [0];
              break;
            case 12:
              //仅星期一
              weekenddates = [1];
              break;
            case 13:
              //仅星期二
              weekenddates = [2];
              break;
            case 14:
              //仅星期三
              weekenddates = [3];
              break;
            case 15:
              //仅星期四
              weekenddates = [4];
              break;
            case 16:
              //仅星期五
              weekenddates = [5];
              break;
            case 17:
              //仅星期六
              weekenddates = [6];
              break;

            default:
              //默认星期六、星期日
              weekenddates = [0,6];
              break;
          }
        }else if(typeof(weekend)=='string'){
          //如果周末参数是字符串
          //如果字符串参数位数不为7，返回#N/A
          if(weekend.length!=7){
            throw new Error('#N/A!');
          }
          //周末参数为1111111 将始终返回 0
          if(weekend == "1111111"){
            return 0;
          }
          weekenddates = [-1,-1,-1,-1,-1,-1,-1];
          //解析周末字符串参数
          //周末字符串值的长度为七个字符，并且字符串中的每个字符表示一周中的一天（从星期一开始）
          for(var i=0; i<7; i++){
            if(Number(weekend.charAt(i))==1){
              weekenddates[i]= (i+1) % 7;
            }
          }
        }

      }else{
        //默认星期六、星期日
        weekenddates = [0,6];
      }

      var holidays = args.length>=4?args[3]:null;
      console.log(args[3])
      //判断是否周末
      if(weekenddates.findIndex(item => { return item == startdate.getDay()})>=0 && weekenddates.findIndex(item => { return item == enddate.getDay()})>=0 && Math.abs(rd)<2){
        return 0;
      }
      if (rd == 0)
        return 1;
      var r = 0;
      var dtTemp = startdate;

      // TODO:节假日未实现
      if(Array.isArray(holidays)){
        let childIdx;
        for(childIdx=0;childIdx<holidays.length;childIdx++){
          console.log(holidays[childIdx]);
        }
      }
      console.log(holidays.toString())

      if(rd > 0){
        //开始日期早于结束日期
        for(var i = 0; i <= rd; i++){
          r++;
          startdate.setTime(startdate.getTime()+1000 * 60 * 60 * 24)
          if(weekenddates.findIndex(item => { return item == startdate.getDay()})>=0){
            r--;
            continue;
          }
            //判断节假日
            var thisDate = 25569.0 + ((startdate.getTime() - (startdate.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
            if(holidays != null && Math.floor(thisDate) == holidays){
              r--;
              continue;
            }


        }
        return r;
      }else{
        //开始日期晚于结束日期
        for(var i = 0; i >= rd; i--){
          r--;
          startdate.setTime(startdate.getTime()-1000 * 60 * 60 * 24)
          if(weekenddates.findIndex(item => { return item == startdate.getDay()})>=0){
            r++;
            continue;
          }
            //判断节假日
            var thisDate = 25569.0 + ((startdate.getTime() - (startdate.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
            if(holidays != null && Math.floor(thisDate) == holidays){
              r++;
              continue;
            }


        }
        return r;
      }

    },
  },
  {
    //返回当前日期和时间的序列号值
    key: 'NOW',
    title: tf('formula.time.now'),
    render: function (args) {
      //无参，直接返回当前日期和时间的序列号
      var date = new Date();
      return (25569.0 + ((date.getTime() - (date.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24)));

    },
  },
  {
    //返回一个时间序列值的秒数
    key: 'SECOND',
    title: tf('formula.time.second'),
    render: function (args) {
      if(args == null || args.length<1){
        throw new Error("参数过少");
      }
      //参数为一个时间的序列号值
      let serial = Number(args[0]);
      var fractional_day = serial - Math.floor(serial) + 0.0000001;
      var total_seconds = Math.floor(86400 * fractional_day);
      var seconds = total_seconds % 60;
      return seconds;
    },
  },
  {
    //返回的十进制数字是一个范围在 0（零）到 0.99988426 之间的值
    key: 'TIME',
    title: tf('formula.time.time'),
    render: function (args) {
      if(args == null || args.length<3){
        throw new Error("参数过少");
      }
      //如果参数中有非数字，返回#NAME
      if(isNaN(args[0]) || isNaN(args[1]) || isNaN(args[2])){
        throw new Error("#NAME");
      }

      return ((Number(args[0])*1000 * 60 * 60 + Number(args[1])*1000 * 60  + Number(args[2])*1000 )/ (1000 * 60 * 60 * 24)).toFixed(8);

    },
  },
  {
    //返回由文本字符串表示的时间的十进制数字。
    // 十进制数字是一个范围在 0（零）到 0.99988426 之间的值，表示 0:00:00 (12:00:00 AM) 到 23:59:59 (11:59:59 P.M.) 之间的时间。
    key: 'TIMEVALUE',
    title: tf('formula.time.timevalue'),
    render: function (args) {

      if(args == null || args.length<1){
        throw new Error("参数过少");
      }
      if(args[0] == undefined){
        throw new Error("#VAL");
      }
      var date = new Date(args[0]);
      //计算成一个小数，是一个范围在 0（零）到 0.99988426 之间的值，表示 0:00:00 (12:00:00 AM) 到 23:59:59 (11:59:59 P.M.) 之间的时间。
      var serial = ((date.getHours()*1000 * 60 * 60 + date.getMinutes()*1000 * 60  + date.getSeconds()*1000 + date.getMilliseconds())/ (1000 * 60 * 60 * 24)).toFixed(8);
      return serial;
    },
  },
  {
    //返回当前日期的序列号值
    key: 'TODAY',
    title: tf('formula.time.today'),
    render: function (args) {
      //无参，直接返回当前日期的序列号值
      var date = new Date();
      var serial = 25569.0 + ((date.getTime() - (date.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
      return Math.floor(serial);
    },
  },
  {
    //返回对应于某个日期的一周中的第几天
    key: 'WEEKDAY',
    title: tf('formula.time.weekday'),
    render: function (args) {
      if(args == null || args.length<1){
        throw new Error("参数过少");
      }
      //如果参数中有非数字，返回#NAME
      if(isNaN(args[0])){
        throw new Error("#NAME");
      }
      //如果 serial_number 不在当前日期基数值范围内，则返回 错误 #NUM!
      if(Number(args[0])<0 || Number(args[0])>2958465){
        throw new Error("#NUM");
      }
      var date = new Date(Math.round((Number(args[0]) - 25569)*86400*1000+(new Date()).getTimezoneOffset() * 60 * 1000)).getDay();
      if(args.length == 2){
        var day =0;
        //如果第二个参数中有非数字，返回#NUM
        if(isNaN(args[1])){
          //如果 return_type 不在上述表格中指定的范围内，则返回 错误 #NUM!。
          throw new Error("#NUM");
        }
        switch (Number(args[1])) {
          case 1:
            day = date;
            break;
          case 2:
            day = Number("7123456".charAt(date-1));  //date +8) % 7;
            break;
          case 3:
            day = Number("6012345".charAt(date-1));
            break;
          case 11:
            day = Number("7123456".charAt(date-1));
            break;
          case 12:
            day = Number("6712345".charAt(date-1));
            break;
          case 13:
            day = Number("5671234".charAt(date-1));
            break;
          case 14:
            day = Number("4567123".charAt(date-1));
            break;
          case 15:
            day = Number("3456712".charAt(date-1));
            break;
          case 16:
            day = Number("2345671".charAt(date-1));
            break;
          case 17:
            day = date;
            break;
          default:
            //如果 return_type 不在上述表格中指定的范围内，则返回 错误 #NUM!。
            throw new Error("#NUM");
            break;
        }
        return day;
      }

      return date;
    },
  },
  {
    //返回特定日期的周数
    //此函数可采用两种机制：
    // 机制 1    包含 1 月 1 日的周为该年的第 1 周，其编号为第 1 周。
    // 机制 2    包含该年的第一个星期四的周为该年的第 1 周，其编号为第 1 周。
    key: 'WEEKNUM',
    title: tf('formula.time.weeknum'),
    render: function (args) {
      console.log(args)
      if( args.length<1){
        throw new Error("参数过少");
        // return "参数过少";
      }
      //如果参数中有非数字，返回#NAME
      if(args[0]== undefined||isNaN(args[0])){
        throw new Error("#NAME");
        // return "#NAME";
      }
      //如果 serial_number 不在当前日期基数值范围内，则返回 错误 #NUM!
      if(Number(args[0])<0 || Number(args[0])>2958465){
        throw new Error("#NUM");
        return ;
      }
      //转换为date格式
      var date = new Date(Math.round((Number(args[0]) - 25569)*86400*1000+(new Date()).getTimezoneOffset() * 60 * 1000));
      //获取年月日
      var year = date.getFullYear();
      var month = date.getMonth();
      var days = date.getDate();
      // console.log(month)
      // 获取当年的1 月 1 日
      var yearFirstDate = new Date(year,0,1);
      //计算天数
      var date2 = new Date(year, month, days,1);
      var dayMS = 24*60*60*1000;
      //根据return_type参数确定星期从哪一天开始。 默认值为 1。
      var firday = yearFirstDate.getDay();
      if(args.length == 2){
        //如果 return_type 不在上述表格中指定的范围内，则返回 错误 #NUM!。
        if(isNaN(args[1])){
          throw new Error("#NUM");
          return ;
        }
        //根据return_type参数确定星期从哪一天开始。
        switch (Number(args[1])) {
          case 1:
            firday = yearFirstDate.getDay();
            break;
          case 2:
            firday = Number("6012345".charAt(yearFirstDate.getDay()));
            break;
          case 11:
            firday = Number("6012345".charAt(yearFirstDate.getDay()));
            break;
          case 12:
            firday = Number("5601234".charAt(yearFirstDate.getDay()));
            break;
          case 13:
            firday = Number("4560123".charAt(yearFirstDate.getDay()));
            break;
          case 14:
            firday = Number("3456012".charAt(yearFirstDate.getDay()));
            break;
          case 15:
            firday = Number("2345601".charAt(yearFirstDate.getDay()));
            break;
          case 16:
            firday = Number("1234560".charAt(yearFirstDate.getDay()));
            break;
          case 17:
            firday = yearFirstDate.getDay();
            break;
          default:
            //如果 return_type 不在上述表格中指定的范围内，则返回 错误 #NUM!。
            throw new Error("#NUM");
            break;
        }
      }
      //计算周数
      var firstDay = (7-firday)*dayMS;
      var weekMS = 7*dayMS;
      return  Math.ceil((date2.getTime()-yearFirstDate.getTime()-firstDay)/weekMS)+1;

    },
  },
  {
    //返回在某日期（起始日期）之前或之后、与该日期相隔指定工作日的某一日期的日期值。
    // 工作日不包括周末和专门指定的假日。
    // 在计算发票到期日、预期交货时间或工作天数时，可以使用函数 WORKDAY 来扣除周末或假日。
    key: 'WORKDAY',
    title: tf('formula.time.workday'),
    render: function (args) {
      if(args == null || args.length<2){
        throw new Error("参数过少");
      }
      //如果参数中有非数字，返回#VALUE
      if(isNaN(args[0])){
        throw new Error("#VALUE");
        return ;
      }
      //如果 serial_number 不在当前日期基数值范围内，则返回 错误 #VALUE!
      if(Number(args[0])<0 || Number(args[0])>2958465){
        throw new Error("#VALUE");
        return ;
      }
      //起始日期
      var date = new Date(Math.round((Number(args[0]) - 25569)*86400*1000+(new Date()).getTimezoneOffset() * 60 * 1000));
      var T = 24*60*60*1000;
      //如果参数中有非数字，返回#NUM
      if(isNaN(args[1])){
        throw new Error("#NUM");
        return ;
      }
      var limitDay = Number(args[1]);
      //如果 start_date 加 days 产生非法日期值，函数 WORKDAY 返回 错误值 #NUM!。
      if(Number(args[0])+limitDay >2958465){
        throw new Error("#NUM");
        return ;
      }
      //假期
      var holidays = args.length==3?args[2]:null;
      // TODO:节假日未实现
      if(limitDay>0){
        var num = 0;
        while(num != limitDay){
          date.setTime(date.getTime()+24*60*60*1000);
          var thisDate = 25569.0 + ((date.getTime() - (date.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
          if(holidays != null && Math.floor(thisDate) == holidays){
            continue;
          }else if( date.getDay() == 0 || date.getDay() ==6){
            continue;
          }
          num++;
        }
      }else if(limitDay < 0){
        var num = 0;
        while(num != limitDay){
          date.setTime(date.getTime()-24*60*60*1000);
          var thisDate = 25569.0 + ((date.getTime() - (date.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
          if(holidays != null && Math.floor(thisDate) == holidays){
            continue;
          }else if( date.getDay() == 0 || date.getDay() ==6){
            continue;
          }
          num--;
        }
      }

      var serial = 25569.0 + ((date.getTime() - (date.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
      return Math.floor(serial);
    },
  },
  {
    //返回在某日期（起始日期）之前或之后、与该日期相隔指定工作日的某一日期的日期值。
    // 工作日不包括周末和专门指定的假日。
    // 在计算发票到期日、预期交货时间或工作天数时，可以使用函数 WORKDAY 来扣除周末或假日。
    key: 'WORKDAY.INTL',
    title: tf('formula.time.workdayintl'),
    render: function (args) {
      if(args == null || args.length<2){
        throw new Error("参数过少");
      }
      //如果参数中有非数字，返回#VALUE
      if(isNaN(args[0])){
        throw new Error("#VALUE");
        return ;
      }
      //如果 serial_number 不在当前日期基数值范围内，则返回 错误 #VALUE!
      if(Number(args[0])<0 || Number(args[0])>2958465){
        throw new Error("#VALUE");
        return ;
      }
      var date = new Date(Math.round((Number(args[0]) - 25569)*86400*1000+(new Date()).getTimezoneOffset() * 60 * 1000));
      var T = 24*60*60*1000;
      //如果参数中有非数字，返回#NUM
      if(isNaN(args[1])){
        throw new Error("#NUM");
        return ;
      }
      var limitDay = Number(args[1]);
      //如果 start_date 加 days 产生非法日期值，函数 WORKDAY 返回 错误值 #NUM!。
      if(Number(args[0])+limitDay >2958465){
        throw new Error("#NUM");
        return ;
      }
      //获取周末
      var weekend = args.length>=3?(args[2]!=null?Number(args[2]):null):null;
      var weekenddates = [];
      if(weekend != null){
        //如果周末参数为数字
        if(!isNaN(weekend)){
          switch (weekend) {
            case 1:
              //星期六、星期日
              weekenddates = [0,6];
              break;
            case 2:
              //星期日、星期一
              weekenddates = [0,1];
              break;
            case 3:
              //星期一、星期二
              weekenddates = [1,2];
              break;
            case 4:
              //星期二、星期三
              weekenddates = [2,3];
              break;
            case 5:
              //星期三、星期四
              weekenddates = [3,4];
              break;
            case 6:
              //星期四、星期五
              weekenddates = [4,5];
              break;
            case 7:
              //星期五、星期六
              weekenddates = [5,6];
              break;
            case 11:
              //仅星期日
              weekenddates = [0];
              break;
            case 12:
              //仅星期一
              weekenddates = [1];
              break;
            case 13:
              //仅星期二
              weekenddates = [2];
              break;
            case 14:
              //仅星期三
              weekenddates = [3];
              break;
            case 15:
              //仅星期四
              weekenddates = [4];
              break;
            case 16:
              //仅星期五
              weekenddates = [5];
              break;
            case 17:
              //仅星期六
              weekenddates = [6];
              break;

            default:
              //默认星期六、星期日
              weekenddates = [0,6];
              break;
          }
        }else if(typeof(weekend)=='string'){
          //如果周末参数是字符串
          //如果字符串参数位数不为7，返回#N/A
          if(weekend.length!=7){
            throw new Error('#N/A!');
          }
          //周末参数为1111111 将始终返回无效字符串
          if(weekend == "1111111"){
            throw new Error('无效字符串');
            return;
          }
          weekenddates = [-1,-1,-1,-1,-1,-1,-1];
          //解析周末字符串参数
          //周末字符串值的长度为七个字符，并且字符串中的每个字符表示一周中的一天（从星期一开始）
          for(var i=0; i<7; i++){
            if(Number(weekend.charAt(i))==1){
              weekenddates[i]= (i+1) % 7;
            }
          }
        }

      }else{
        //默认星期六、星期日
        weekenddates = [0,6];
      }

      // console.log(weekenddates);
      var holidays = args.length>=4?args[3]:null;
      // TODO:节假日未实现
      if(limitDay>0){
        var num = 0;
        while(num != limitDay){
          // console.log(date.getDay())
          date.setTime(date.getTime()+24*60*60*1000);

          var thisDate = 25569.0 + ((date.getTime() - (date.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));

          if(holidays != null && Math.floor(thisDate) == holidays){
            continue;
          }else if( weekenddates.findIndex(item => { return item ==date.getDay()})>=0){

            continue;
          }
          // console.log(num)
          num ++;
        }
      }else if(limitDay < 0){
        var num = 0;
        while(num != limitDay){
          date.setTime(date.getTime()-24*60*60*1000);
          var thisDate = 25569.0 + ((date.getTime() - (date.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
          if(holidays != null && Math.floor(thisDate) == holidays){
            continue;
          }else if( weekenddates.findIndex(item => { return item ==date.getDay()})>=0){

            continue;
          }
          num --;
        }
      }
      // console.log(date.getDate());
      var serial = 25569.0 + ((date.getTime() - (date.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
      return Math.floor(serial);
    },
  },
  {
    //返回日期（以序列数表示）中的年份
    key: 'YEAR',
    title: tf('formula.time.year'),
    render: function (args) {
      if (args == null || args.length < 1) {
        throw new Error("参数过少");
      }
      //如果参数中有非数字，返回#NAME
      if (isNaN(args[0])) {
        throw new Error("#NAME");
      }
      //参数为一个时间的序列号值
      let date = new Date(Math.round((Number(args[0]) - 25569) * 86400 * 1000 + (new Date()).getTimezoneOffset() * 60 * 1000));
      return date.getFullYear();
    }
  },
];

export default {};
export {
  Formula,
};
