import React from "react";
import { Col, Row, Pagination } from "react-bootstrap";
import PropTypes from "prop-types";

const maxDisplayPageNumber = 5;
const halfDisplayPageNumber = 2;

const getRange = (page, paginationEndNumber) => {
  let start = 1;
  let end = 1;

  start = page - halfDisplayPageNumber;
  end = page + halfDisplayPageNumber;

  if (end > paginationEndNumber) {
    end = paginationEndNumber;
    start = paginationEndNumber - maxDisplayPageNumber + 1;
  }

  if (start < 1) {
    start = 1;
    end = start + maxDisplayPageNumber - 1;
    if (end > paginationEndNumber) {
      end = paginationEndNumber;
    }
  }

  return { start, end };
};

const Total = ({
  pageDataLen,
  page,
  paginationEndNumber,
  rowsPerPage,
  dataTotalSize,
  t
}) => {
  const from = pageDataLen ? (page - 1) * rowsPerPage + 1 : 0;
  let to = 0;
  if (pageDataLen) {
    if (page === paginationEndNumber && pageDataLen === rowsPerPage) {
      to = dataTotalSize;
    } else if (pageDataLen < rowsPerPage) {
      to = page > 1 ? pageDataLen + (page - 1) * rowsPerPage : pageDataLen;
    } else if (paginationEndNumber < 0) {
      to = pageDataLen;
    } else {
      to = page * rowsPerPage;
    }
  }

  return (
    <span>
      {from} - {to} / {dataTotalSize}
    </span>
  );
};

Total.propTypes = {
  pageDataLen: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  dataTotalSize: PropTypes.number.isRequired,
  paginationEndNumber: PropTypes.number,
  rowsPerPage: PropTypes.number.isRequired,
  t: PropTypes.func
};

Total.defaultProps = {
  paginationEndNumber: 1,
  t: () => null
};

const PaginationBlock = ({
  pagination,
  page,
  setPage,
  paginationEndNumber
}) => {
  const { start, end } = getRange(page, paginationEndNumber);

  const renderPagination = () => {
    const paginations = [];

    for (let i = start; i <= end; i++) {
      paginations.push(
        <Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>
          {i}
        </Pagination.Item>
      );
    }

    return paginations;
  };

  if (pagination.hidePageListOnlyOnePage && paginationEndNumber === 1) {
    return null;
  }

  return (
    <Pagination>
      {start !== 1 && <Pagination.First onClick={() => setPage(1)} />}
      {page !== 1 && <Pagination.Prev onClick={() => setPage(page - 1)} />}
      {renderPagination()}
      {page + 1 <= paginationEndNumber && (
        <Pagination.Next onClick={() => setPage(page + 1)} />
      )}
      {end !== paginationEndNumber && (
        <Pagination.Last onClick={() => setPage(paginationEndNumber)} />
      )}
    </Pagination>
  );
};

PaginationBlock.propTypes = {
  pagination: PropTypes.object.isRequired,
  page: PropTypes.number.isRequired,
  paginationEndNumber: PropTypes.number,
  setPage: PropTypes.func
};

PaginationBlock.defaultProps = {
  paginationEndNumber: 1,
  setPage: () => null
};

const TablePagination = ({
  paginationEndNumber,
  page,
  pageDataLen,
  setPage,
  pagination,
  t,
  rowsPerPage
}) => {
  if (pagination === false) {
    return null;
  }
  const nowPage = pagination.page || page;

  return (
    <Row>
      <Col xs={6}>
        {pagination.showTotal && (
          <Total
            // 每頁資料長度, 顯示當前頁面筆數用
            page={nowPage}
            paginationEndNumber={paginationEndNumber}
            pageDataLen={pageDataLen}
            rowsPerPage={rowsPerPage}
            dataTotalSize={pagination.totalSize}
            t={t}
          />
        )}
      </Col>
      <Col xs={6} className="d-flex justify-content-end">
        <PaginationBlock
          pagination={pagination}
          paginationEndNumber={paginationEndNumber}
          page={nowPage}
          setPage={setPage}
        />
      </Col>
    </Row>
  );
};

TablePagination.propTypes = {
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  pageDataLen: PropTypes.number.isRequired,
  pagination: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  paginationEndNumber: PropTypes.number,
  t: PropTypes.func,
  rowsPerPage: PropTypes.number
};

TablePagination.defaultProps = {
  paginationEndNumber: 1,
  pagination: false,
  rowsPerPage: 10
};

export default TablePagination;
