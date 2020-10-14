import React from 'react';
import { makeStyles, Table, TableBody, TableCell, TableContainer,
   TableHead, TableRow, TablePagination, TableFooter, Paper, Typography } from '@material-ui/core';
import TablePaginationActions from './tablePaginationActions';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
  },
  container: {
    paddingBottom: theme.spacing(4)
  },
  header: {

  }
}))

export default function TableComponent(props) {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const { rows, columnTitles, fieldNames } = props

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  let emptyRows = 0;
  if (rows) {
    emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length ? rows.length : 0 - page * rowsPerPage);
  }

  let rowContent = null;
  if (rows && rows.length > 0) {
    rowContent = 
      (rowsPerPage > 0
        ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : rows
      ).map((row) => {
        let i = 0;
        let rowCells = fieldNames.map(field => {
          if (row[field] !== undefined) {
            if (i === 0) {
              i++;
              return <TableCell component='th'>{row[field]}</TableCell>
            } else {
              i++;
              return <TableCell align="right">{row[field]}</TableCell>
            }
          }
        })
        return (
          <TableRow key={row[0]}>
            {rowCells}
          </TableRow>
        )
      })
  }

  let headerContent;

  if (columnTitles) {
    let i = 0;
    headerContent = (
      columnTitles.map(title => {
        if (i === 0) {
          i++;
          return <TableCell><Typography variant='h5'>{title}</Typography></TableCell>
        } else {
          i++;
          return <TableCell align="right"><Typography variant='h5'>{title}</Typography></TableCell>
        }
      })
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table stickyHeader className={classes.table} aria-label="table">
        <TableHead variant='h3'>
          <TableRow>
            {headerContent}
          </TableRow>
        </TableHead>
        <TableBody>
          {rowContent}
          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
        <TableFooter > 
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              count={rows.length}
              colSpan={6}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: { 'aria-label': 'rows per page' },
                native: true,
              }}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  )
}

Table.propTypes = {
  rows: PropTypes.array.isRequired,
  columnTitles: PropTypes.array.isRequired,
  fieldNames: PropTypes.array.isRequired
};
