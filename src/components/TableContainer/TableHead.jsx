import React, { createRef, Component } from "react";
import { Form } from "react-bootstrap";
import PropTypes from "prop-types";
import MultiCheckboxComboBox from "../MultiCheckboxComboBox";

class HeadColumn extends Component {
  constructor(props) {
    super(props);

    this.refInput = createRef();
    this.handleThClick = this.handleThClick.bind(this);
  }

  handleThClick = (e) => {
    const { editMode, column, handleDataSort } = this.props;
    if (editMode || !column.sort) {
      return;
    }

    if (!column.filter || !this.refInput.current?.contains(e.target)) {
      handleDataSort(column.dataField);
    }
  };

  renderFilter = (filterColumn, dataField) => {
    const { editMode, handleFilterValueChange } = this.props;
    if (!filterColumn?.type) {
      return null;
    }

    const { value } = filterColumn;
    const placeholder = filterColumn.placeholder || "";
    const options = filterColumn.options || [];

    if (filterColumn.type === "select") {
      return (
        <Form.Select
          value={value}
          selected={!!value}
          disabled={editMode}
          onChange={(e) => {
            handleFilterValueChange(e.target.value, dataField, filterColumn);
          }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((item) => (
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
          controlId={`table-filter-${dataField}`}
          values={value}
          items={options}
          itemLabelKey="label"
          itemValueKey="value"
          placeholder={placeholder}
          canSelectAll={!!filterColumn.canSelectAll}
          disabled={editMode}
          onSelectChange={(values) => {
            handleFilterValueChange(values, dataField, filterColumn);
          }}
        />
      );
    }

    return (
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={value}
        disabled={editMode}
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
        return (
          <div className="both-arrow">
            <span className="dropdown">
              <span className="caret caret--both" />
            </span>
            <span className="dropup">
              <span className="caret caret--both" />
            </span>
          </div>
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
        {!column.headerFormatter ? (
          <>
            <span>{column.text}</span>
            {this.renderSortArrow()}
            {column.filter && (
              <div ref={this.refInput}>
                {this.renderFilter(filters[column.dataField], column.dataField)}
              </div>
            )}
          </>
        ) : (
          column.headerFormatter(column.text, column.dataField)
        )}
      </th>
    );
  }
}

HeadColumn.propTypes = {
  editMode: PropTypes.bool,
  column: PropTypes.object.isRequired,
  sort: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  handleDataSort: PropTypes.func,
  handleFilterValueChange: PropTypes.func
};

HeadColumn.defaultProps = {
  editMode: false,
  handleDataSort: () => null,
  handleFilterValueChange: () => null
};

const TableHead = ({
  editMode,
  selectRow,
  columns,
  pageStartIndex,
  pageDataLen,
  sort,
  handleDataSort,
  filters,
  handleFilterValueChange,
  showIndex,
  showIndexHeaderFormatter
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
                disabled={editMode}
                onChange={() => {
                  if (selectRow?.onSelectAll) {
                    selectRow.onSelectAll(pageStartIndex);
                  }
                }}
              />
            )}
          </th>
        )}
        {showIndex && (
          <th className="indexCell">
            {showIndexHeaderFormatter() ?? <span />}
          </th>
        )}
        {columns.map((column, index) => (
          <HeadColumn
            key={column.dataField}
            editMode={editMode}
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
  editMode: PropTypes.bool,
  columns: PropTypes.array.isRequired,
  pageStartIndex: PropTypes.number.isRequired,
  pageDataLen: PropTypes.number.isRequired,
  sort: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  selectRow: PropTypes.object,
  showIndex: PropTypes.bool,
  showIndexHeaderFormatter: PropTypes.func,
  handleDataSort: PropTypes.func,
  handleFilterValueChange: PropTypes.func
};

TableHead.defaultProps = {
  editMode: false,
  selectRow: {},
  showIndex: false,
  showIndexHeaderFormatter: () => null,
  handleDataSort: () => null,
  handleFilterValueChange: () => null
};

export default TableHead;
