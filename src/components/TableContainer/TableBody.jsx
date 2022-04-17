import React, { useState } from "react";
import { Form, Collapse, Spinner } from "react-bootstrap";
import PropTypes from "prop-types";

const TableRow = ({
  data,
  columns,
  rowsPerPage,
  selectRow,
  expandRow,
  rowIndex
}) => {
  const [isExpand, setIsExpand] = useState(false);

  const handleRowClick = (e) => {
    e.stopPropagation();

    if (selectRow?.clickToSelect) {
      selectRow?.onSelect(data);
    }
    setIsExpand(!isExpand);
  };

  const renderSelect = () => {
    let checked = false;
    if (selectRow?.mode === "checkbox") {
      checked = !!selectRow?.selected?.find(
        (select) => JSON.stringify(select) === JSON.stringify(data)
      );
    } else {
      checked = selectRow?.selected === data;
    }

    return (
      <td className="selectRow--cell">
        <Form.Check
          type={selectRow?.mode || "checkbox"}
          value={data}
          checked={checked}
          onChange={() => {
            selectRow?.onSelect(data, rowsPerPage);
          }}
        />
      </td>
    );
  };

  const renderExpandRow = () => {
    const colSpan = selectRow ? columns.length + 1 : columns.length;

    return (
      <Collapse in={isExpand}>
        <tr>
          <td colSpan={colSpan} className="expandRowContainer">
            {expandRow?.renderer(data, rowIndex)}
          </td>
        </tr>
      </Collapse>
    );
  };

  const getStyle = (column, colIndex) => {
    if (!column.style) return {};

    if (typeof column.style === "object") {
      return column.style;
    }

    return column.style(data[column.dataField], data, rowIndex, colIndex);
  };

  const getClasses = (column, colIndex) => {
    if (!column.classes) return "";

    if (typeof column.classes === "string") {
      return column.classes;
    }

    return column.classes(data[column.dataField], data, rowIndex, colIndex);
  };

  return (
    <>
      <tr onClick={handleRowClick}>
        {selectRow && renderSelect()}
        {columns?.map((column, index) => {
          const key = `cell-${column.dataField}-${index}`;
          const colIndex = selectRow ? index + 1 : index;
          if (!column.formatter) {
            return (
              <td
                key={key}
                className={getClasses(column, colIndex)}
                style={getStyle(column, colIndex)}
              >
                {data[column.dataField]}
              </td>
            );
          }

          return (
            <td
              key={key}
              className={getClasses(column, colIndex)}
              style={getStyle(column, colIndex)}
            >
              {column.formatter(
                data[column.dataField],
                data,
                rowIndex,
                isExpand
              )}
            </td>
          );
        })}
      </tr>
      {expandRow && renderExpandRow()}
    </>
  );
};

TableRow.propTypes = {
  data: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  selectRow: PropTypes.object,
  rowsPerPage: PropTypes.number,
  expandRow: PropTypes.object,
  rowIndex: PropTypes.number
};

TableRow.defaultProps = {
  rowsPerPage: 0,
  expandRow: null,
  selectRow: {},
  rowIndex: 0
};

const TableBody = ({
  loading,
  data,
  columns,
  page,
  rowsPerPage,
  selectRow,
  expandRow,
  noDataIndication,
  keyField,
  t
}) => {
  const colSpan = selectRow ? columns.length + 1 : columns.length;

  const renderNoDataIndicationElement = () => (
    <tr>
      <td colSpan={colSpan}>
        <center>{t("default.no-data")}</center>
      </td>
    </tr>
  );

  return (
    <tbody>
      {loading && (
        <tr>
          <td colSpan={colSpan} align="center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </td>
        </tr>
      )}
      {!loading &&
        data?.map((item, index) => {
          const rowIndex = (page - 1) * rowsPerPage + index;
          return (
            <TableRow
              key={`${item[keyField]}`}
              data={item}
              columns={columns}
              rowsPerPage={rowsPerPage}
              selectRow={selectRow}
              expandRow={expandRow}
              rowIndex={rowIndex}
            />
          );
        })}
      {noDataIndication &&
        !loading &&
        !data.length &&
        renderNoDataIndicationElement()}
    </tbody>
  );
};

TableBody.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  keyField: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  selectRow: PropTypes.object,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  expandRow: PropTypes.object,
  noDataIndication: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  t: PropTypes.func
};

TableBody.defaultProps = {
  loading: false,
  page: 1,
  rowsPerPage: 0,
  expandRow: null,
  selectRow: {},
  noDataIndication: null,
  t: () => null
};

export default TableBody;
