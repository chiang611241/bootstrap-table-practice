import React from "react";
import { Col, Row, Pagination } from "react-bootstrap";
import PropTypes from "prop-types";

const maxDisplayPageNumber = 5;
const halfDisplayPageNumber = 2;

const Total = ({ dataLen, page, endIndex, rowsPerPage, total, t }) => {
  const from = dataLen && page * rowsPerPage - rowsPerPage + 1;
  let to = 0;
  if (dataLen) {
    if (page === endIndex && dataLen === rowsPerPage) {
      to = total;
    } else if (dataLen < rowsPerPage) {
      to = page > 1 ? dataLen + (page - 1) * rowsPerPage : dataLen;
    } else {
      to = page * rowsPerPage;
    }
  }

  return (
    <span>
      {from}
      &nbsp; - &nbsp;
      {to}
      &nbsp; / total: &nbsp;
      {total}
      &nbsp;
    </span>
  );
};

Total.propTypes = {
  dataLen: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  endIndex: PropTypes.number,
  rowsPerPage: PropTypes.number.isRequired,
  t: PropTypes.func
};

Total.defaultProps = {
  endIndex: 1,
  t: () => null
};

const TableFooter = ({
  pageEndIndex,
  pageDataLen,
  setPage,
  page,
  total,
  showTotal,
  t,
  rowsPerPage
}) => {
  const getRange = () => {
    let start = 1;
    let end = 1;

    start = page - halfDisplayPageNumber;
    end = page + halfDisplayPageNumber;

    if (end > pageEndIndex) {
      end = pageEndIndex;
      start = pageEndIndex - maxDisplayPageNumber + 1;
    }

    if (start < 1) {
      start = 1;
      end = start + maxDisplayPageNumber - 1;
      if (end > pageEndIndex) {
        end = pageEndIndex;
      }
    }

    return { start, end };
  };

  const renderPagination = () => {
    const paginations = [];
    const { start, end } = getRange();

    for (let i = start; i <= end; i++) {
      paginations.push(
        <Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>
          {i}
        </Pagination.Item>
      );
    }

    return paginations;
  };

  return (
    <Row>
      <Col xs={6}>
        {showTotal && (
          <Total
            dataLen={pageDataLen}
            page={page}
            endIndex={pageEndIndex}
            rowsPerPage={rowsPerPage}
            total={total}
            t={t}
          />
        )}
      </Col>
      <Col xs={6} className="d-flex justify-content-end">
        <Pagination>
          {page !== 1 && <Pagination.First onClick={() => setPage(1)} />}
          {page !== 1 && <Pagination.Prev onClick={() => setPage(page - 1)} />}
          {renderPagination()}
          {page !== pageEndIndex && (
            <Pagination.Next onClick={() => setPage(page + 1)} />
          )}
          {page !== pageEndIndex && (
            <Pagination.Last onClick={() => setPage(pageEndIndex)} />
          )}
        </Pagination>
      </Col>
    </Row>
  );
};

TableFooter.propTypes = {
  pageDataLen: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  startIndex: PropTypes.number,
  pageEndIndex: PropTypes.number,
  t: PropTypes.func,
  rowsPerPage: PropTypes.number,
  showTotal: PropTypes.bool
};

TableFooter.defaultProps = {
  pageEndIndex: 1,
  t: () => null,
  rowsPerPage: 10,
  showTotal: false
};

export default TableFooter;
