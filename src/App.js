import "bootstrap/dist/css/bootstrap.min.css";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);

    return () => clearTimeout();
  }, []);

  const columns = [
    {
      dataField: "id",
      text: "Product ID",
      filter: {
        type: "text",
        placeholder: "test"
      }
    },
    {
      dataField: "name",
      text: "Product Name",
      sort: true
    },
    {
      dataField: "price",
      text: "Product Price"
    },
    {
      dataField: "checked",
      text: "checked",
      formatter: (cell, _row, rowIndex, _isExpand) => {
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
      }
    }
  ];

  return (
    <TableContainer
      keyField="id"
      data={state}
      columns={columns}
      expandRow={expandRow}
      loading={loading}
      noDataIndication
      showIndex
    />
  );
}
