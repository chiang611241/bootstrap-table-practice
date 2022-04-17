import React, { useRef } from "react";
import { Form } from "react-bootstrap";
import PropTypes from "prop-types";
import MultiCheckboxComboBox from "../MultiCheckboxComboBox";

const HeadColumn = ({
  column,
  index,
  sort,
  filters,
  handleDataSort,
  handleFilterValueChange
}) => {
  const inputRef = useRef(null);
  const renderSortArrow = (sortType) => {
    switch (sortType) {
      case "":
        return (
          <>
            <span className="dropdown">
              <span className="caret caret--both" />
            </span>
            <span className="dropup">
              <span className="caret caret--both" />
            </span>
          </>
        );
      case "desc":
        return (
          <span className="dropup">
            <span className="caret" />
          </span>
        );
      case "asc":
        return (
          <span className="dropdown">
            <span className="caret" />
          </span>
        );
      default:
        return null;
    }
  };

  const renderFilter = (filterColumn, dataField) => {
    if (filterColumn.type === "text") {
      return (
        <Form.Control
          className="sortButton--filter"
          type="text"
          placeholder={filterColumn?.placeholder || dataField}
          value={filterColumn?.value || ""}
          onChange={(e) => {
            handleFilterValueChange(e.target.value, dataField, filterColumn);
          }}
        />
      );
    }

    if (filterColumn.type === "multiSelect") {
      return (
        <MultiCheckboxComboBox
          values={filterColumn?.value || []}
          items={filterColumn.options}
          placeholder={filterColumn?.placeholder || dataField}
          onSelectChange={(values) => {
            handleFilterValueChange(values, dataField, filterColumn);
          }}
        />
      );
    }

    return (
      <Form.Select
        value={filterColumn?.value || ""}
        selected={!!filterColumn?.value || ""}
        onChange={(e) => {
          handleFilterValueChange(e.target.value, dataField, filterColumn);
        }}
      >
        <option value="">{filterColumn.placeholder || dataField}</option>
        {filterColumn.options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </Form.Select>
    );
  };

  const getStyle = (column, colIndex) => {
    if (!column.headerStyle) return {};

    if (typeof column.headerStyle === "object") {
      return column.headerStyle;
    }

    return column.headerStyle(column, colIndex);
  };

  const getClasses = (column, colIndex) => {
    if (!column.headerClasses) return "";

    if (typeof column.headerClasses === "string") {
      return column.headerClasses;
    }

    return column.headerClasses(column, colIndex);
  };

  return (
    <th
      key={column.dataField}
      className={`tableHead ${getClasses(column, index)}`}
      style={getStyle(column, index)}
      onClick={(e) => {
        if (column.sort && !inputRef.current?.contains(e.target)) {
          handleDataSort(column.dataField);
        }
      }}
    >
      <span>{column.text}</span>
      {column.sort && renderSortArrow(sort[column.dataField])}
      {column.filter && (
        <div ref={inputRef}>
          {renderFilter(filters[column.dataField], column.dataField)}
        </div>
      )}
    </th>
  );
};

HeadColumn.propTypes = {
  column: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  sort: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  handleDataSort: PropTypes.func,
  handleFilterValueChange: PropTypes.func
};

HeadColumn.defaultProps = {
  handleDataSort: () => null,
  handleFilterValueChange: () => null
};

const TableHead = ({
  selectRow,
  columns,
  remote,
  data,
  sort,
  handleDataSort,
  filters,
  handleFilterValueChange
}) => {
  const selectedLen = selectRow?.selected?.length || 0;
  const checked = data.length && selectedLen === data.length;
  const checkClassName = selectedLen ? "indeterminate" : "";

  return (
    <thead>
      <tr>
        {selectRow && (
          <th className="selectRow--cell">
            {selectRow?.mode === "checkbox" && (
              <Form.Check
                className={checkClassName}
                type="checkbox"
                value="selectAll"
                checked={checked}
                onChange={() => {
                  return selectRow?.onSelectAll(data);
                }}
              />
            )}
          </th>
        )}
        {columns.map((column, index) => (
          <HeadColumn
            key={`${column.text}-${index}`}
            column={column}
            index={index}
            sort={sort}
            filters={filters}
            remote={remote}
            handleDataSort={handleDataSort}
            handleFilterValueChange={handleFilterValueChange}
          />
        ))}
      </tr>
    </thead>
  );
};

TableHead.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  sort: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  selectRow: PropTypes.object,
  remote: PropTypes.bool,
  handleDataSort: PropTypes.func,
  handleFilterValueChange: PropTypes.func
};

TableHead.defaultProps = {
  selectRow: {},
  remote: false,
  handleDataSort: () => null,
  handleFilterValueChange: () => null
};

export default TableHead;
