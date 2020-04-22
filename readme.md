# n-spreadsheet 更新文档

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

