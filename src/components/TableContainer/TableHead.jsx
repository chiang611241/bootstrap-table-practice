import React, { Component, createRef } from "react";
import { Form } from "react-bootstrap";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MultiCheckboxComboBox from "../MultiCheckboxComboBox";
import { faCaretUp, faCaretDown } from "@fortawesome/free-solid-svg-icons";

class HeadColumn extends Component {
  constructor(props) {
    super(props);

    this.refInput = createRef();
    this.handleThClick = this.handleThClick.bind(this);
  }

  handleThClick = (e) => {
    const { column, handleDataSort } = this.props;
    if (!column.sort) {
      return;
    }

    if (!column.filter || !this.refInput.current?.contains(e.target)) {
      handleDataSort(column.dataField);
    }
  };

  renderFilter = (filterColumn, dataField) => {
    const { handleFilterValueChange } = this.props;
    if (!filterColumn.type) {
      return null;
    }

    let value = "";

    if (filterColumn?.value) {
      value = filterColumn.value;
    } else if (filterColumn.type === "multiSelect" && !filterColumn?.value) {
      value = [];
    }

    if (filterColumn.type === "select") {
      return (
        <Form.Select
          value={value}
          selected={!!value}
          onChange={(e) => {
            handleFilterValueChange(e.target.value, dataField, filterColumn);
          }}
        >
          <option value="">{filterColumn.placeholder || dataField}</option>
          {filterColumn?.options?.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Form.Select>
      );
    }

    if (filterColumn.type === "multiSelect") {
      return (
        <MultiCheckboxComboBox
          values={value}
          items={filterColumn?.options}
          placeholder={filterColumn?.placeholder || dataField}
          onSelectChange={(values) => {
            handleFilterValueChange(values, dataField, filterColumn);
          }}
        />
      );
    }

    return (
      <Form.Control
        type="text"
        placeholder={filterColumn?.placeholder || dataField}
        value={value}
        onChange={(e) => {
          handleFilterValueChange(e.target.value, dataField, filterColumn);
        }}
      />
    );
  };

  renderSortArrow() {
    const { column, sort } = this.props;
    if (!column.sort || !sort) {
      return null;
    }

    switch (sort[column.dataField]) {
      case "desc":
        return <FontAwesomeIcon icon={faCaretUp} className="arrow" />;
      case "asc":
        return <FontAwesomeIcon icon={faCaretDown} className="arrow" />;
      default:
        return (
          <>
            <FontAwesomeIcon icon={faCaretUp} className="arrow arrow--both" />
            <FontAwesomeIcon icon={faCaretDown} className="arrow arrow--both" />
          </>
        );
    }
  }

  render() {
    const { column, index, filters } = this.props;

    const headClassNames = ["tableHead"];
    if (typeof column.headerClasses === "string") {
      headClassNames.push(column.headerClasses);
    } else if (column.headerClasses) {
      headClassNames.push(column.headerClasses(column, index));
    }

    let headStyle;
    if (typeof column.headerStyle === "object") {
      headStyle = column.headerStyle;
    } else if (column.headerStyle) {
      headStyle = column.headerStyle(column, index);
    }

    return (
      <th
        className={headClassNames.join(" ")}
        style={headStyle}
        onClick={this.handleThClick}
      >
        <span>{column.text}</span>
        {this.renderSortArrow()}
        {column.filter && (
          <div ref={this.refInput}>
            {this.renderFilter(filters[column.dataField], column.dataField)}
          </div>
        )}
      </th>
    );
  }
}

HeadColumn.propTypes = {
  column: PropTypes.object.isRequired,
  sort: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
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
  pageStartIndex,
  pageDataLen,
  sort,
  handleDataSort,
  filters,
  handleFilterValueChange
}) => {
  const selectedLen = selectRow?.selected?.length || 0;
  const checked = pageDataLen && selectedLen === pageDataLen;
  const checkClassName = !checked && selectedLen ? "indeterminate" : "";

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
                  if (selectRow?.onSelectAll) {
                    selectRow.onSelectAll(pageStartIndex);
                  }
                }}
              />
            )}
          </th>
        )}
        {columns.map((column, index) => (
          <HeadColumn
            key={column.dataField}
            column={column}
            index={index}
            sort={sort}
            filters={filters}
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
  pageStartIndex: PropTypes.number.isRequired,
  pageDataLen: PropTypes.number.isRequired,
  sort: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  selectRow: PropTypes.object,
  handleDataSort: PropTypes.func,
  handleFilterValueChange: PropTypes.func
};

TableHead.defaultProps = {
  selectRow: {},
  handleDataSort: () => null,
  handleFilterValueChange: () => null
};

export default TableHead;
