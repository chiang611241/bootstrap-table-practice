import React, { Component } from "react";
import { Form, Collapse } from "react-bootstrap";
import PropTypes from "prop-types";
import Loading from "../Loading";

const TableRow = ({
  data,
  columns,
  selectRow,
  expandRow,
  rowIndex,
  showIndex,
  expandFlag,
  onRowClick
}) => {
  const renderSelect = () => {
    let checked = false;
    if (!selectRow) {
      return null;
    }

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
            if (selectRow?.onSelect) {
              selectRow.onSelect(data);
            }
          }}
          onMouseDown={(e) => {
            if (selectRow?.clickToSelect) {
              e.stopPropagation();
            }
          }}
        />
      </td>
    );
  };

  const renderIndex = (index) => {
    if (!showIndex) {
      return null;
    }

    return <td className="indexCell">{index}</td>;
  };

  const renderExpandRow = () => {
    let colSpan = columns.length;
    if (selectRow) {
      colSpan += 1;
    }
    if (showIndex) {
      colSpan += 1;
    }

    const expandRowBody = expandRow?.renderer(data, rowIndex);

    if (!expandRow || !expandRowBody) {
      return null;
    }

    return (
      <Collapse in={expandFlag}>
        <tr>
          <td colSpan={colSpan} className="expandRowContainer">
            {expandRowBody}
          </td>
        </tr>
      </Collapse>
    );
  };

  const getStyle = (column, colIndex) => {
    if (!column.style) {
      return {};
    }

    if (typeof column.style === "object") {
      return column.style;
    }

    return column.style(data[column.dataField], data, rowIndex, colIndex);
  };

  const getClasses = (column, colIndex) => {
    if (!column.classes) {
      return "";
    }

    if (typeof column.classes === "string") {
      return column.classes;
    }

    return column.classes(data[column.dataField], data, rowIndex, colIndex);
  };

  return (
    <>
      <tr onMouseDown={() => onRowClick(data, rowIndex)}>
        {renderSelect()}
        {renderIndex(rowIndex + 1)}
        {columns?.map((column, idx) => {
          const key = `cell-${column.dataField}-${idx}`;
          const colIndex = selectRow ? idx + 1 : idx;

          return (
            <td
              key={key}
              className={getClasses(column, colIndex)}
              style={getStyle(column, colIndex)}
            >
              {!column.formatter
                ? data[column.dataField]
                : column.formatter(
                    data[column.dataField],
                    data,
                    rowIndex,
                    expandFlag
                  )}
            </td>
          );
        })}
      </tr>
      {renderExpandRow()}
    </>
  );
};

TableRow.propTypes = {
  data: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  selectRow: PropTypes.object,
  expandRow: PropTypes.object,
  rowIndex: PropTypes.number,
  showIndex: PropTypes.bool,
  expandFlag: PropTypes.bool,
  onRowClick: PropTypes.func
};

TableRow.defaultProps = {
  expandRow: null,
  selectRow: {},
  rowIndex: 0,
  showIndex: false,
  expandFlag: false,
  onRowClick: () => null
};
class TableBody extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isExpands: [],
      data: []
    };

    this.handleRowClick = this.handleRowClick.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let newState = prevState;

    if (nextProps.data !== prevState.data) {
      newState = {
        ...newState,
        data: nextProps.data
      };
    }

    if (!prevState.isExpands.length) {
      newState = {
        ...newState,
        isExpands: nextProps.data.map(() => false)
      };
    }

    if (newState !== prevState) {
      return newState;
    }

    return null;
  }

  handleRowClick(data, index) {
    const { selectRow, expandRow } = this.props;
    const { isExpands } = this.state;
    const newExpandRowFlag = [...isExpands];

    if (!selectRow && !expandRow) {
      return;
    }

    if (selectRow?.clickToSelect && selectRow?.onSelect) {
      selectRow.onSelect(data);
    }

    newExpandRowFlag[index] = !isExpands[index];

    this.setState({ isExpands: newExpandRowFlag });
  }

  expandRowOpen(flag) {
    const { data } = this.state;
    const newExpandRowFlag = data.map(() => flag);
    this.setState({ isExpands: newExpandRowFlag });
  }

  renderNoDataIndicationElement = (colSpan) => {
    return (
      <tr>
        <td colSpan={colSpan}>
          <center>no data</center>
        </td>
      </tr>
    );
  };

  render() {
    const {
      loading,
      data,
      columns,
      page,
      rowsPerPage,
      selectRow,
      expandRow,
      noDataIndication,
      keyField,
      showIndex
    } = this.props;
    const { isExpands } = this.state;

    let colSpan = columns.length;
    if (selectRow) {
      colSpan += 1;
    }
    if (showIndex) {
      colSpan += 1;
    }

    return (
      <tbody>
        {loading && (
          <tr>
            <td colSpan={colSpan} align="center">
              <Loading />
            </td>
          </tr>
        )}
        {!loading &&
          data?.map((item, index) => {
            const rowIndex = (page - 1) * rowsPerPage + index;

            return (
              <TableRow
                key={`${item[keyField]}-${rowIndex}`}
                data={item}
                columns={columns}
                selectRow={selectRow}
                expandRow={expandRow}
                rowIndex={rowIndex}
                showIndex={showIndex}
                expandFlag={isExpands[index]}
                onRowClick={this.handleRowClick}
              />
            );
          })}
        {noDataIndication &&
          !loading &&
          !data.length &&
          this.renderNoDataIndicationElement(colSpan)}
      </tbody>
    );
  }
}

TableBody.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  keyField: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  selectRow: PropTypes.object,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  expandRow: PropTypes.object,
  noDataIndication: PropTypes.bool,
  showIndex: PropTypes.bool
};

TableBody.defaultProps = {
  loading: false,
  page: 1,
  rowsPerPage: 0,
  expandRow: null,
  selectRow: {},
  noDataIndication: null,
  showIndex: false
};

export default React.forwardRef((props, ref) => (
  <TableBody ref={ref} {...props} />
));
