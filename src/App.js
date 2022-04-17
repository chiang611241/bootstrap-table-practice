import "bootstrap/dist/css/bootstrap.min.css";

import { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import TableContainer from "./components/TableContainer/TableContainer";
import { products } from "./data";

const expandRow = {
  renderer: (row) => {
    if (row.t) {
      return (
        <div>
          <div>{row.price}</div>
        </div>
      );
    }
  }
};

export default function App() {
  const [state, setState] = useState(products);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectRow, setSelectRow] = useState([]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  });
  const columns = [
    {
      dataField: "id",
      text: "Product ID",
      filter: {
        type: "text",
        placeholder: "test"
      },
      headerStyle: {
        backgroundColor: "#c8e6c9",
        width: "25%"
      },
      sort: true
    },
    {
      dataField: "name",
      text: "Product Name",
      sort: true,
      headerStyle: { backgroundColor: "blue", width: "30%" }
    },
    {
      dataField: "price",
      text: "Product Price",
      sort: true,
      filter: {
        type: "multiSelect",
        options: ["2102", "2103"]
      },
      style: (cell, row, rowIndex, colIndex) => {
        if (rowIndex % 2 === 0) {
          return {
            backgroundColor: "#81c784"
          };
        }
        return {
          backgroundColor: "#c8e6c9"
        };
      }
    },
    {
      dataField: "checked",
      text: "checked",
      formatter: (cell, row, rowIndex, isExpand) => {
        return (
          <input
            className="form-check-input"
            type="checkbox"
            checked={cell}
            onChange={(e) => {
              let newState = [...state];
              newState[rowIndex].checked = e.target.checked;
              setState(newState);
            }}
          />
        );
      },
      sort: true,
      filter: {
        type: "select",
        options: [
          { label: "勾選", value: true },
          { label: "未勾選", value: false }
        ]
      },
      style: (cell, row, rowIndex, colIndex) => {
        if (rowIndex % 2 === 0) {
          return {
            backgroundColor: "#81c784"
          };
        }
        return {
          backgroundColor: "#c8e6c9"
        };
      },
      classes: (cell, row, rowIndex, colIndex) => {
        if (rowIndex % 2 === 0) {
          return "selectRow--cell";
        }
        return "";
      }
    },
    {
      dataField: "",
      // text: 'checked',
      formatter: (cell, row, rowIndex, isExpand) => {
        return (
          <Form.Check
            type="checkbox"
            checked={cell}
            label="hi"
            onChange={(e) => {
              let newState = [...state];
              newState[rowIndex].checked = e.target.checked;
              setState(newState);
            }}
          />
        );
      }
      // sort: true,
      // filter: {
      //   type: 'select',
      //   options: [
      //     { label: '勾選', value: true },
      //     { label: '未勾選', value: false }
      //   ],
      // },
    }
  ];

  return (
    <TableContainer
      keyField="id"
      data={state}
      columns={columns}
      expandRow={expandRow}
      loading={loading}
      // remote
      noDataIndication
      // getList={() => null}
      // defaultSorted={[{
      //   dataField: 'name',
      //   order: 'asc',
      // }]}
      pagination={{
        page,
        sizePerPage: 10,
        showTotal: true,
        totalSize: 200,
        onPageNumberChange: setPage
      }}
      selectRow={{
        mode: "checkbox",
        selected: selectRow,
        onSelectChange: setSelectRow
      }}
    />
  );
}
