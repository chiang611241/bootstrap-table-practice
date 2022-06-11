# bootstrap-table-practice
Created with CodeSandbox

| name | require | type  | description |
|  ----  | ----  | ----  | ----  |
| keyField | Y | string | 可作為 key 的欄位 |
| columns | Y | array | table 設定檔 |
| data | Y | array | 顯示資料 |
| loading | N | boolean | 是否顯示 loading 動畫 |
| getList  | N | function | 取得表格變更內容（sort, filter, skip(略過筆數）, limit(每頁最大筆數) |
| defaultSorted  | N | array | 預設 sort ([{ dataField: 'name', order: 'asc' }]) |
| hover | N | boolean | 游標移動到資料上後，是否反灰 |
| noDataIndication | N | boolean | 是否顯示無資料列 | 
| hideHeader | N | boolean | 隱藏 header | 
| remote | N | boolean | 資料是否為分頁取得 |
| showIndex | N | boolean | 是否顯示索引列 |
| showIndexHeaderFormatter | N | function | 索引列 th formatter | 
| pagination | N | object | pagination 設定 |
| pagination.page | N | number | 頁面位置 |
| pagination.sizePerPage | N | number | 每頁筆數 | 
| pagination.showTotal | N | number | 是否顯示總比數區塊 |
| pagination.totalSize | N | number | 總筆數 |
| pagination.onPageNumberChange | N | function | page 變更 | 
| expandRow | N | object | 每列展開列設定 |
| expandRow.renderer | N | function | 展開列 render 內容 | selectRow
| selectRow | N | object | 選取列設定 | 
| selectRow.mode | N | string | 選取列模式 (checkbox or raido) | 
| selectRow.selected | N | array | 已選取的列 | 
| selectRow.onSelectChange | N | function | 選取列  | 

