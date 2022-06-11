import React, { Component, createRef, forwardRef } from "react";
import { Table } from "react-bootstrap";
import PropTypes from "prop-types";
import TableHead from "./TableHead";
import TableBody from "./TableBody";
import TablePagination from "./TablePagination";

import "./TableContainer.scss";

const sortDataByField = (data, dataField, sortType) => {
  if (!dataField || !sortType) {
    return;
  }

  const defaultAscNum = sortType === "asc" ? -1 : 1;
  data.sort((a, b) => {
    let valA = a[dataField];
    let valB = b[dataField];
    if (typeof valA === "boolean") {
      valA = Number(valA);
      valB = Number(valB);
    } else if (typeof valA !== "number") {
      valA = (valA || "").toString().toLowerCase();
      valB = (valB || "").toString().toLowerCase();
    }

    if (valA < valB) {
      return defaultAscNum;
    }
    if (valA > valB) {
      return defaultAscNum * -1;
    }
    return 0;
  });
};

const sortDataByObject = (data, sortObj) => {
  for (const sortKey in sortObj) {
    if (sortObj[sortKey]) {
      sortDataByField(data, sortKey, sortObj[sortKey]);
      break;
    }
  }
};

const getFilteredData = (data, filters) => {
  const filterKeys = Object.keys(filters);
  return data.filter((item) =>
    filterKeys.every((key) => {
      const filterObj = filters[key];
      const itemValue = item[key];
      const { type, value } = filterObj;

      switch (type) {
        case "multiSelect":
          if (!Array.isArray(value) || !value.length) {
            return false;
          }
          return value.some((val) => itemValue === val);
        case "select":
          if (!value) {
            return true;
          }
          if (Array.isArray(itemValue)) {
            return itemValue
              .find((itemVal) => itemVal.toString() === value)
              ?.toString();
          }
          return value === itemValue?.toString();
        case "text":
        default:
          if (!value) {
            return true;
          }

          return itemValue?.toString().includes(filters[key].value);
      }
    })
  );
};

class TableContainer extends Component {
  constructor(props) {
    super(props);

    const { sort, filter } = TableContainer.getInitState(
      props.columns,
      props.defaultSorted
    );
    this.state = {
      hasRunDefaultSort: false,
      oriData: [],
      page: 1,
      data: [],
      sort,
      filters: filter,
      columns: [],
      oriColumns: []
    };

    this.rowsPerPage = props.pagination.sizePerPage || 0;
    this.tableBodyRef = createRef();

    this.handleDataSort = this.handleDataSort.bind(this);
    this.handleFilterValueChange = this.handleFilterValueChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleOnSelect = this.handleOnSelect.bind(this);
    this.handleOnSelectAll = this.handleOnSelectAll.bind(this);
    this.handleSelectClean = this.handleSelectClean.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let newState = prevState;

    if (nextProps.columns !== prevState.oriColumns) {
      const { sort, filter } = TableContainer.getInitState(
        nextProps.columns,
        nextProps.defaultSorted
      );
      newState = {
        ...newState,
        columns: [...nextProps.columns],
        oriColumns: nextProps.columns,
        filters: filter,
        sort
      };
    }

    if (nextProps.data !== prevState.oriData) {
      newState = {
        ...newState,
        data: [...nextProps.data],
        oriData: nextProps.data
      };

      if (!nextProps.remote) {
        newState.data = getFilteredData(nextProps.data, newState.filters);
        if (!newState.hasRunDefaultSort) {
          newState.hasRunDefaultSort = true;
          nextProps.defaultSorted?.forEach((item) => {
            sortDataByField(newState.data, item.dataField, item.order || "asc");
          });
        } else {
          sortDataByObject(newState.data, newState.sort);
        }
      }
    }

    if (
      nextProps.pagination?.page &&
      nextProps.pagination.page !== prevState.page
    ) {
      newState = {
        ...newState,
        page: nextProps.pagination.page
      };
    }

    if (newState !== prevState) {
      return newState;
    }

    return null;
  }

  static getInitState(columns, defaultSorted) {
    const sort = {};
    const filter = {};
    columns.forEach((column) => {
      if (column.filter) {
        const defVal = column.filter.type === "multiSelect" ? [] : "";
        filter[column.dataField] = {
          ...column.filter,
          value: column.filter.defaultValue || defVal
        };
      }
      if (column.sort) {
        sort[column.dataField] = "";
      }
    });

    const idx = (defaultSorted?.length || 0) - 1;
    if (idx > -1) {
      const item = defaultSorted[idx];
      sort[item.dataField] = item.order || "asc";
    }

    return { sort, filter };
  }

  handleDataSort(dataField) {
    const { getList, remote } = this.props;
    const { data, page, sort, filters } = this.state;

    const newSort = {};
    Object.getOwnPropertyNames(sort).forEach((prop) => {
      newSort[prop] = "";
    });

    newSort[dataField] =
      sort[dataField] === "" || sort[dataField] === "asc" ? "desc" : "asc";

    if (remote) {
      this.setState({
        sort: newSort
      });

      getList({
        limit: this.rowsPerPage,
        skip:
          (page - 1) * this.rowsPerPage > 0 ? (page - 1) * this.rowsPerPage : 0,
        sort: newSort,
        filter: this.getFilters(filters)
      });
    } else {
      sortDataByField(data, dataField, newSort[dataField]);
      this.setState({
        data,
        sort: newSort
      });
    }
  }

  handleFilterValueChange(value, dataField, originFilter) {
    const { getList, remote } = this.props;
    const { page, sort } = this.state;

    const newFilter = { ...this.state.filters };
    newFilter[dataField] = { ...originFilter, value };

    if (remote) {
      this.setState({
        filters: newFilter
      });
      getList({
        limit: this.rowsPerPage,
        skip:
          (page - 1) * this.rowsPerPage > 0 ? (page - 1) * this.rowsPerPage : 0,
        sort,
        filter: this.getFilters(newFilter)
      });
    } else {
      this.setState({
        filters: newFilter,
        data: getFilteredData(this.props.data, newFilter)
      });
    }
  }

  handlePageChange(value, pagination, rowsPerPage) {
    const { getList, remote } = this.props;
    const { sort, filters } = this.state;
    this.setState({ page: value });

    if (pagination.onPageNumberChange) {
      pagination.onPageNumberChange(value, rowsPerPage);
    }

    if (getList && remote) {
      getList({
        limit: this.rowsPerPage,
        skip: Math.max((value - 1) * this.rowsPerPage, 0),
        sort,
        filter: this.getFilters(filters)
      });
    }
  }

  handleOnSelect(isSelect) {
    const { selectRow } = this.props;
    if (!selectRow) {
      return;
    }

    const {
      mode = "checkbox",
      selected = [],
      onSelectChange = () => null
    } = selectRow;
    let newSelected = [];

    if (!onSelectChange) {
      return;
    }

    if (mode === "checkbox") {
      if (
        selected &&
        selected.find(
          (select) => JSON.stringify(select) === JSON.stringify(isSelect)
        )
      ) {
        newSelected = selected.filter(
          (select) => JSON.stringify(select) !== JSON.stringify(isSelect)
        );
        onSelectChange(newSelected);
      } else {
        newSelected = [...selected, isSelect];
        onSelectChange(newSelected);
      }
    } else {
      onSelectChange(isSelect);
    }
  }

  handleOnSelectAll(pageStartIndex) {
    const { selectRow } = this.props;
    if (!selectRow) {
      return;
    }

    const { selected = [], onSelectChange = () => null } = selectRow;

    if (selected.length) {
      onSelectChange([]);
    } else if (this.rowsPerPage) {
      onSelectChange(
        this.state.data.slice(pageStartIndex, pageStartIndex + this.rowsPerPage)
      );
    } else {
      onSelectChange(this.state.data);
    }
  }

  handleSelectClean() {
    const { selectRow } = this.props;
    const { mode = "checkbox", onSelectChange = () => null } = selectRow;

    if (!onSelectChange) {
      return;
    }

    if (mode === "checkbox") {
      onSelectChange([]);
    } else {
      onSelectChange({});
    }
  }

  getFilters(filters) {
    const copyNewFilters = JSON.parse(JSON.stringify(filters));
    for (const key in copyNewFilters) {
      delete copyNewFilters[key].type;
      delete copyNewFilters[key].placeholder;
      delete copyNewFilters[key].options;

      copyNewFilters[key] = copyNewFilters[key].value || null;
    }

    return copyNewFilters;
  }

  getStartEndIndex(data, page, rowsPerPage) {
    const { pagination } = this.props;
    let pageStartIndex = 0;
    let paginationEndNumber = -1;

    if (rowsPerPage && data.length) {
      if (pagination?.totalSize) {
        paginationEndNumber = Math.ceil(pagination.totalSize / rowsPerPage);
      } else {
        paginationEndNumber = Math.ceil(data.length / rowsPerPage) || 1;
      }

      pageStartIndex = (page - 1) * rowsPerPage;
    }

    return { pageStartIndex, paginationEndNumber };
  }

  getTableInformation(data, remote, pageStartIndex, paginationEndNumber) {
    let pageData = [];
    if (remote || paginationEndNumber === -1) {
      pageData = data;
    } else {
      pageData = data.slice(pageStartIndex, pageStartIndex + this.rowsPerPage);
    }
    const pageDataLen = pageData.length;

    return { pageData, pageDataLen };
  }

  expandRowFlagOpen(flag) {
    return this.tableBodyRef?.current?.expandRowOpen(flag);
  }

  render() {
    const {
      editMode,
      loading,
      keyField,
      noDataIndication,
      hover,
      expandRow,
      pagination,
      selectRow,
      remote,
      showIndex,
      showIndexHeaderFormatter,
      hideHeader,
      tableClassName
    } = this.props;
    const { data, filters, sort, page, columns } = this.state;
    const { pageStartIndex, paginationEndNumber } = this.getStartEndIndex(
      data,
      page,
      this.rowsPerPage
    );
    const { pageData, pageDataLen } = this.getTableInformation(
      data,
      remote,
      pageStartIndex,
      paginationEndNumber
    );
    let newTableContainerClassName = "TableContainer";

    if (tableClassName) {
      newTableContainerClassName = `${newTableContainerClassName} ${tableClassName}`;
    }

    let newSelectRow = null;
    if (selectRow) {
      newSelectRow = {
        ...selectRow,
        clickToSelect:
          selectRow.clickToSelect === undefined
            ? true
            : selectRow.clickToSelect,
        mode: selectRow.mode || "checkbox",
        selected: selectRow.selected || [],
        onSelect: this.handleOnSelect,
        onSelectAll: this.handleOnSelectAll
      };
    }

    let newPagination = {
      hidePageListOnlyOnePage: true,
      page: page || 1,
      totalSize: pagination.totalSize || data.length
    };
    if (pagination && typeof pagination === "object") {
      newPagination = {
        ...newPagination,
        ...pagination,
        hidePageListOnlyOnePage:
          pagination.hidePageListOnlyOnePage === undefined
            ? true
            : pagination.hidePageListOnlyOnePage
      };
    }

    return (
      <div className={newTableContainerClassName}>
        <Table bordered responsive hover={hover}>
          {!hideHeader && (
            <TableHead
              editMode={editMode}
              selectRow={newSelectRow}
              columns={columns}
              pageStartIndex={pageStartIndex}
              pageDataLen={pageDataLen}
              sort={sort}
              handleDataSort={this.handleDataSort}
              filters={filters}
              handleFilterValueChange={this.handleFilterValueChange}
              showIndex={showIndex}
              showIndexHeaderFormatter={showIndexHeaderFormatter}
            />
          )}
          <TableBody
            ref={this.tableBodyRef}
            loading={loading}
            data={pageData}
            columns={columns}
            page={page}
            rowsPerPage={this.rowsPerPage}
            selectRow={newSelectRow}
            expandRow={expandRow}
            noDataIndication={noDataIndication}
            keyField={keyField}
            showIndex={showIndex}
          />
        </Table>
        <TablePagination
          editMode={editMode}
          paginationEndNumber={paginationEndNumber}
          page={page}
          pageDataLen={pageDataLen}
          dataTotalLen={data.length}
          setPage={(value) => {
            this.handlePageChange(value, newPagination, this.rowsPerPage);
            if (selectRow) {
              this.handleSelectClean();
            }
          }}
          pagination={newPagination}
          rowsPerPage={this.rowsPerPage}
        />
      </div>
    );
  }
}

TableContainer.propTypes = {
  editMode: PropTypes.bool,
  loading: PropTypes.bool,
  getList: PropTypes.func,
  keyField: PropTypes.string.isRequired,
  columns: PropTypes.array,
  data: PropTypes.array,
  hover: PropTypes.bool,
  defaultSorted: PropTypes.array,
  noDataIndication: PropTypes.bool,
  pagination: PropTypes.object,
  expandRow: PropTypes.object,
  remote: PropTypes.bool,
  selectRow: PropTypes.object,
  showIndex: PropTypes.bool,
  showIndexHeaderFormatter: PropTypes.func,
  hideHeader: PropTypes.bool,
  tableClassName: PropTypes.string
};

TableContainer.defaultProps = {
  editMode: false,
  loading: false,
  getList: () => null,
  columns: [],
  data: null,
  remote: false,
  selectRow: null,
  defaultSorted: [],
  noDataIndication: false,
  pagination: {
    hidePageListOnlyOnePage: true
  },
  expandRow: null,
  hover: false,
  showIndex: false,
  showIndexHeaderFormatter: () => null,
  hideHeader: false,
  tableClassName: ""
};

export default forwardRef((props, ref) => (
  <TableContainer ref={ref} {...props} />
));
