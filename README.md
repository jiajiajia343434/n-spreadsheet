# n-spreadsheet 说明文档

> 本项目原始版本从 [x-spreadsheet](https://github.com/myliang/x-spreadsheet) 而来，以可以在浏览器中操作Excel文件为方向进行修改。
> 
> 致敬x-spreadsheet
---
## 更新日志
  

0.0.6
---
可扩展行列可分开配置
> extensible.enableAll  控制扩展  
> extensible.enableRow  控制行扩展  
> extensible.enableCol  控制列扩展

0.0.7
---
增加权限控制
> privileges.editable 控制文档可编辑  
> privileges.dataEdit 控制文档数据可编辑  
> privileges.editable 控制文档格式可编辑  

0.0.8
---
1. 增加导出工具 xlsx-exporter 位于 /utis/excel/xlsx-exporter 
2. 导入工具更名为 xlsx-importer 位于/utis/excel/xlsx-importer 
    - 相关API
    ```javascript
        import ExcelParser from '/utils/excel/xlsx-importer';
        import ExcelExport from '/utils/excel/xlsx-exporter';
        
        const parser = new ExcelParser();
        parser.parse(arrayBuffer).then(data => {
          // do something with data
        });
        
        const exporter = new ExcelExport();
        exporter.setData(data).exportWithBuffer().then(arrayBuffer => {
          // do something with arraybuffer
        });
    ```
3. 增加sheet编辑权限
     > privileges.sheetEdit 控制文档sheet可增删、重命名
4. 修复一些bug

0.0.9
---
1. 修复更改行高、列宽、隐藏行、隐藏列不触发onchange和历史记录的bug
2. spreadsheet对象增加setData方法，用于用户对onchange获取的sheets数据的回设

0.0.10
---
1. 修复因exceljs库无法读取indexedColor表导致的读取indexedColor颜色不正确的问题

0.0.11
---
1. 新功能: 增加自定义菜单功能。
    - 相关API
    ```JavaScript
      new Spreadsheet().setCustomMenu([
              {
                key:'test',
                title:'测试',
                handler:(key, target, sheet)=>{
                  console.log(key,target,sheet)
                  }
              }
            ]);
    ```

0.0.12
---
1. 修复回调data某些情况下不正确的bug
2. 修复为data增加属性，回调不显示的bug

0.0.13
---
1. 修复若干bug
2. 将'on***'等回调方法参数改为DataAgent对象，提供一些API，方便开发者操作表格
3. 增加onLoad回调（表格初始化完成后回调）。

0.0.14
---
1. 修复dataAgent.getData()导出过多属性导致history数据递归增加引发崩溃的bug

0.0.15
---
1. 修复cells-selected事件疯狂触发的bug
2. 为Range增加了mode属性
    - 'range': 选中的区域为单元格区域  
    - 'row': 选中的区域为行头  
    - 'col': 选中的区域为列头  

0.0.16
---
1. 改进并完善0.0.15修复的cells-selected事件

0.0.17
---
1. 修复:tooltip特定条件下不消失
2. 修复:修复撤销/重做不触发change事件

0.0.18
---
1. 修复若干bug
2. 优化滚动
3. 增加显示批注的功能，尚未实现UI层面增加和编辑批注

0.0.19
---
1. 修复若干bug

0.0.20
---
1. 日常修复bug
2. 完善BottomBar功能，增加缩放功能

0.0.21
---
1. 日常修复bug
2. 优化缩放功能

0.0.22
---
1. 使缩放触发onchange回调
2. 修复FireFox不能滚动页面的bug
3. 临时性优化缩放后单元格位置，下个版本准备重写scrollbar

0.0.23
---
1. 重写scrollbar
2. 修复comment换行问题
3. 修复其他一些小问题

0.0.24
---
1. 双击列头边缘自动调整最适宽度
2. 修复一些小问题

0.0.25
---
1. 修复自动调整列宽度的一些bug

0.0.26
---
1. 增加从excel粘贴功能

0.0.29
---
1. 修复bind window上的事件导致的内存泄漏的问题

0.0.30
---
新增：公式支持（测试版）

0.0.31
---
支持SUM公式和加减（测试版）

0.0.32
---
修复四则运算小数不精确的问题

0.0.33
---
1. 修复含有公式的单元格无法清空内容的bug

0.0.34
---
修复一些已知bug

0.0.36
---
增加富文本显示（支持导入和导出，未实现编辑），优化单元格水平和垂直对齐方式

0.0.37
---
修复富文本导出样式丢失的问题

0.0.38
---
修复富文本导入时的漏洞

0.0.39
---
修复富文本某些片段没有颜色时默认颜色的问题

0.0.40
---
修复删除合并单元格首行(首列)时的问题

0.0.41
---
修复删除合并单元格导致坐标为负产生的渲染卡死问题

0.0.42
---
1. 优化百分比格式化

0.0.43-alpha1
---
1. 修复无法编辑的单元格能被粘贴更改值

0.0.42-alpha2
---
1. 回退0.0.42的部分修改

0.0.43-alpha3
---
1. 修复粘贴少一行的bug
2. 修复initData预设公式的text值无法根据依赖的单元格的值变动

0.0.43-alpha4
---
1. 修复被设置不可编辑带有公式单元格的Text值无法根据依赖的单元格的值变动

0.0.43-alpha5
---
1. 常规优化

0.0.43-alpha6
---
1. 优化公式单元格text值的计算方式

0.0.43-alpha7
---
1. 优化校验逻辑

0.0.43-alpha8
---
1. 优化百分比显示

0.0.43-alpha9
---
1. 优化百分比显示

0.0.43-alpha10
---
1. 优化百分比显示
