import React, { PureComponent } from "react";
import { Table } from "react-bootstrap";
import PropTypes from "prop-types";
import TableHead from "./TableHead";
import TableBody from "./TableBody";
import TablePagination from "./TablePagination";

import "./TableContainer.scss";

const handleSort = (data, dataField, sortType) => {
  return data.sort((a, b) => {
    if (typeof a[dataField] === "number" || typeof a[dataField] === "boolean") {
      return sortType === "asc"
        ? a[dataField] - b[dataField]
        : b[dataField] - a[dataField];
    }

    a = a[dataField].toLowerCase();
    b = b[dataField].toLowerCase();
    if (a < b) return sortType === "asc" ? 1 : -1;
    if (a > b) return sortType === "asc" ? -1 : 1;
    return 0;
  });
};

const handleDataFilter = (data, filters) => {
  const filterKeys = Object.keys(filters);
  return data.filter((item) =>
    filterKeys.every((key) => {
      if (!filters[key].value) return true;

      // multiSelect filter
      if (Array.isArray(filters[key].value)) {
        // 如果沒有選取任何選項, 不做 filter
        if (!filters[key].value.length) return true;

        return filters[key].value.some((filterValue) =>
          item[key].toString().includes(filterValue)
        );
      }

      return item[key].toString().includes(filters[key].value);
    })
  );
};

class TableContainer extends PureComponent {
  constructor(props) {
    super(props);

    const { sort, filter } = TableContainer.getInitState(props.columns);
    this.state = {
      page: 1,
      data: [],
      oriData: null,
      sort,
      defaultSorted: [],
      filters: filter
    };

    this.rowsPerPage = props.pagination.sizePerPage || 0;

    this.handleDataSort = this.handleDataSort.bind(this);
    this.handleFilterValueChange = this.handleFilterValueChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleOnSelect = this.handleOnSelect.bind(this);
    this.handleOnSelectAll = this.handleOnSelectAll.bind(this);
    this.handleSelectClean = this.handleSelectClean.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let newState = prevState;
    if (nextProps.data !== prevState.oriData) {
      newState = {
        ...newState,
        data: [...nextProps.data],
        oriData: nextProps.data
      };
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

    if (
      nextProps.defaultSorted.length &&
      nextProps.defaultSorted !== prevState.defaultSorted
    ) {
      const newSort = { ...newState.sort };
      const data = [...newState.data];
      let newData = {};
      nextProps.defaultSorted.forEach((item) => {
        newSort[item.dataField] = item.order;
        if (data) {
          newData = handleSort(data, item.dataField, item.order);
        }
      });

      newState = {
        ...newState,
        data: newData,
        sort: newSort,
        defaultSorted: nextProps.defaultSorted
      };
    }

    if (newState !== prevState) {
      return newState;
    }

    return null;
  }

  static getInitState(columns) {
    const sort = {};
    const filter = {};
    columns.forEach((column) => {
      if (column.filter) {
        filter[column.dataField] = column.filter;
      }
      if (column.sort) {
        sort[column.dataField] = "";
      }
    });

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
      this.setState({
        data: handleSort(data, dataField, newSort[dataField]),
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
        data: value
          ? handleDataFilter(this.props.data, newFilter)
          : this.props.data
      });
    }
  }

  handlePageChange(value, pagination, rowsPerPage) {
    this.setState({ page: value });

    if (pagination.onPageNumberChange) {
      pagination.onPageNumberChange(value, rowsPerPage);
    }
  }

  handleOnSelect(isSelect) {
    const { selectRow } = this.props;
    const { mode, selected, onSelectChange } = selectRow;

    let newSelected = [];

    if (!onSelectChange) return;

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
    const { mode, onSelectChange } = selectRow;

    if (!onSelectChange) return;

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

  render() {
    let { selectRow } = this.props;
    const {
      loading,
      keyField,
      columns,
      noDataIndication,
      pagination,
      hover,
      expandRow,
      remote
    } = this.props;
    const { data, page, sort, filters } = this.state;
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
      <div className="TableContainer">
        <Table bordered responsive hover={hover}>
          <TableHead
            selectRow={newSelectRow}
            columns={columns}
            pageStartIndex={pageStartIndex}
            pageDataLen={pageDataLen}
            sort={sort}
            handleDataSort={this.handleDataSort}
            filters={filters}
            handleFilterValueChange={this.handleFilterValueChange}
          />
          <TableBody
            loading={loading}
            data={pageData}
            columns={columns}
            page={page}
            rowsPerPage={this.rowsPerPage}
            selectRow={newSelectRow}
            expandRow={expandRow}
            noDataIndication={noDataIndication}
            keyField={keyField}
          />
        </Table>
        <TablePagination
          paginationEndNumber={paginationEndNumber}
          page={page}
          pageDataLen={pageDataLen}
          setPage={(value) => {
            this.handlePageChange(value, newPagination, this.rowsPerPage);
            if (selectRow.selected) {
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
  keyField: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  getList: PropTypes.func,
  columns: PropTypes.array,
  data: PropTypes.array,
  hover: PropTypes.bool,
  defaultSorted: PropTypes.array,
  noDataIndication: PropTypes.bool,
  pagination: PropTypes.object,
  expandRow: PropTypes.object,
  remote: PropTypes.bool,
  selectRow: PropTypes.object
};

TableContainer.defaultProps = {
  loading: false,
  getList: () => null,
  columns: [],
  data: null,
  remote: false,
  selectRow: null,
  defaultSorted: [],
  noDataIndication: false,
  pagination: {},
  expandRow: null,
  hover: false
};

export default TableContainer;
