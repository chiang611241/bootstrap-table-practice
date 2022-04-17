import React, { PureComponent } from "react";
import { Table } from "react-bootstrap";
import PropTypes from "prop-types";
import TableHead from "./TableHead";
import TableBody from "./TableBody";
import TableFooter from "./TableFooter";

import "./TableContainer.scss";

class TableContainer extends PureComponent {
  constructor(props) {
    super(props);

    const { sort, filter } = TableContainer.getInitState(props.columns);
    this.state = {
      page: props.pagination.page || 1,
      data: [...props.data],
      sort,
      filters: filter
    };

    this.rowsPerPage = props.pagination.sizePerPage || 0;

    this.handleSort = this.handleSort.bind(this);
    this.handleDataSort = this.handleDataSort.bind(this);
    this.handleFilterValueChange = this.handleFilterValueChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleOnSelect = this.handleOnSelect.bind(this);
    this.handleOnSelectAll = this.handleOnSelectAll.bind(this);
    this.handleSelectClean = this.handleSelectClean.bind(this);
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

  componentDidMount() {
    const { sort } = this.state;
    const { defaultSorted } = this.props;
    const newSort = { ...sort };
    defaultSorted.forEach((item) => {
      newSort[item.dataField] = item.order;
    });

    this.setState({ sort: newSort });
  }

  handleSort(data, dataField, sortType) {
    return data.sort((a, b) => {
      if (
        typeof a[dataField] === "number" ||
        typeof a[dataField] === "boolean"
      ) {
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
        data: this.handleSort(data, dataField, newSort[dataField]),
        sort: newSort
      });
    }
  }

  handleDataFilter(data, filters) {
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
          ? this.handleDataFilter(this.props.data, newFilter)
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

  handleOnSelectAll(isSelect) {
    const { selectRow } = this.props;
    const { selected, onSelectChange } = selectRow;

    if (selected.length === isSelect.length) {
      onSelectChange([]);
    } else {
      onSelectChange(isSelect);
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

  getTableData(data, page, rowsPerPage) {
    const { remote, pagination } = this.props;
    let pageEndIndex = -1;
    let pageData = [];

    // 如果 rowsPerPage 是 0, 不分割 data
    if (!rowsPerPage) {
      return { pageData: data, pageEndIndex: 1 };
    }

    if (!data.length) {
      return { pageData: [], pageEndIndex: 1 };
    }

    if (pagination?.totalSize) {
      pageEndIndex = Math.ceil(pagination.totalSize / rowsPerPage);
    } else {
      pageEndIndex = Math.ceil(data.length / rowsPerPage) || 1;
    }

    if (!remote) {
      const newData = this.sliceData(data, page, rowsPerPage);
      pageData = [...newData];
    } else {
      pageData = [...data];
    }

    return { pageData, pageEndIndex };
  }

  sliceData(data, page, rowsPerPage) {
    return data.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  }

  render() {
    let { selectRow } = this.props;
    const {
      t,
      loading,
      keyField,
      columns,
      noDataIndication,
      pagination,
      hover,
      expandRow,
      remote
    } = this.props;
    const { data, filters, sort, page } = this.state;
    const { pageData, pageEndIndex } = this.getTableData(
      data,
      page,
      this.rowsPerPage
    );

    if (selectRow) {
      selectRow = {
        ...selectRow,
        // mode: radio or checkbox
        mode: selectRow.mode ? selectRow.mode : "checkbox",
        clickToSelect: selectRow.clickToSelect ? selectRow.clickToSelect : true,
        selected: selectRow.selected,
        onSelect: this.handleOnSelect,
        onSelectAll: this.handleOnSelectAll
      };
    }

    return (
      <>
        <Table bordered responsive hover={hover} className="TableContainer">
          <TableHead
            selectRow={selectRow}
            columns={columns}
            remote={remote}
            data={pageData}
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
            selectRow={selectRow}
            expandRow={expandRow}
            noDataIndication={noDataIndication}
            keyField={keyField}
            t={t}
          />
        </Table>
        {(!!pagination || !this.rowsPerPage) && (
          <TableFooter
            pageEndIndex={pageEndIndex}
            pageDataLen={pageData.length}
            setPage={(value) => {
              this.handlePageChange(value, pagination, this.rowsPerPage);
              this.handleSelectClean();
            }}
            page={pagination.page || page}
            total={pagination.totalSize || data.length}
            showTotal={pagination.showTotal}
            t={t}
            rowsPerPage={this.rowsPerPage}
          />
        )}
      </>
    );
  }
}

TableContainer.propTypes = {
  loading: PropTypes.bool,
  getList: PropTypes.func,
  keyField: PropTypes.string.isRequired,
  columns: PropTypes.array,
  data: PropTypes.array,
  hover: PropTypes.bool,
  defaultSorted: PropTypes.array,
  noDataIndication: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  pagination: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  expandRow: PropTypes.object,
  t: PropTypes.func,
  remote: PropTypes.bool,
  selectRow: PropTypes.oneOfType([PropTypes.bool, PropTypes.object])
};

TableContainer.defaultProps = {
  loading: false,
  getList: () => null,
  columns: [],
  data: null,
  remote: false,
  selectRow: null,
  defaultSorted: [],
  noDataIndication: null,
  pagination: {},
  expandRow: null,
  hover: false,
  t: () => null
};

export default TableContainer;
