import { filter } from 'lodash';
import { useState, useEffect } from 'react';
// material
import { visuallyHidden } from '@material-ui/utils';
import {
  Card,
  Table,
  Box,
  TableHead,
  TableSortLabel,
  Stack,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  TableContainer,
  TablePagination,
  Link
} from '@material-ui/core';
// @types
import { BlinkPageManager } from '@customTypes/blinkPages';
// utils
import { fDate } from 'utils/formatTime';
import { ErrorMsg } from 'utils/helpError';
import { useSnackbar } from 'notistack';
// redux
import { getBlinkPages } from 'redux/slices/customiser';
import { RootState, useDispatch, useSelector } from 'redux/store';
// components
import { TableSkeletonLoad } from 'components/common';
import { capitalCase } from 'change-case';
import Scrollbar from '../../Scrollbar';
import SearchNotFound from '../../SearchNotFound';
import BlinkPListToolBar from './BlinkPListToolBar';
import BlinkPMoreMenu from './BlinkPMoreMenu';

// ---------------------------------------------------------------------
type BlinkPListHeadProps = {
  order: 'asc' | 'desc';
  orderBy: string;
  rowCount: number;
  headLabel: any[];
  numSelected: number;
  onRequestSort: (id: string) => void;
  onSelectAllClick: (checked: boolean) => void;
};

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'slug', label: 'Slug', alignRight: false },
  { id: 'mName', label: 'Merchant Name', alignRight: false },
  { id: 'mId', label: 'Merchant Id', alignRight: false },
  { id: 'createdBy', label: 'Created By', alignRight: false },
  { id: 'lastUpdated', label: 'Last Updated', alignRight: false },
  { id: 'updatedBy', label: 'Updated By', alignRight: false },
  { id: '' }
];

// ----------------------------------------------------------------------

type Anonymous = Record<string | number, string>;

function descendingComparator(a: Anonymous, b: Anonymous, orderBy: string) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order: string, orderBy: string) {
  return order === 'desc'
    ? (a: Anonymous, b: Anonymous) => descendingComparator(a, b, orderBy)
    : (a: Anonymous, b: Anonymous) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(
  array: BlinkPageManager[],
  comparator: (a: any, b: any) => number,
  query: string
) {
  const stabilizedThis = array.map((el, index) => [el, index] as const);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(
      array,
      (blink) => blink.merchantName.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

// --------------------------------------------------------------------------

function BlinkPListHead({
  order,
  orderBy,
  rowCount,
  headLabel,
  numSelected,
  onRequestSort,
  onSelectAllClick
}: BlinkPListHeadProps) {
  return (
    <TableHead>
      <TableRow>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.alignRight ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              hideSortIcon
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={() => onRequestSort(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box sx={{ ...visuallyHidden }}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// ---------------------------------------------------------------------------

export default function BlinkPagesList() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterMName, setfilterMName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isLoading, setIsLoading] = useState(true);

  const { enqueueSnackbar } = useSnackbar();

  const { blinkPagesList: blinkPagesData } = useSelector((state: RootState) => state.customiser);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchBlinkPages = async () => {
      try {
        await dispatch(getBlinkPages());
      } catch (error) {
        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlinkPages();
  }, [dispatch, enqueueSnackbar]);

  // --------------------------------------------------------------
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (checked: boolean) => {
    if (checked) {
      const newSelecteds = blinkPagesData.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByMName = (filterMName: string) => {
    setfilterMName(filterMName);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - blinkPagesData.length) : 0;

  const filteredBPData = applySortFilter(
    blinkPagesData,
    getComparator(order, orderBy),
    filterMName
  );
  // --------------------------------------------------------------
  const isBPNotFound = filteredBPData.length === 0;
  return (
    <Card>
      <BlinkPListToolBar
        numSelected={selected.length}
        filterMName={filterMName}
        onFilterMName={handleFilterByMName}
      />

      <Scrollbar>
        <TableContainer sx={{ minWidth: 800 }}>
          <Table>
            <BlinkPListHead
              order={order}
              orderBy={orderBy}
              headLabel={TABLE_HEAD}
              rowCount={blinkPagesData.length}
              numSelected={selected.length}
              onRequestSort={handleRequestSort}
              onSelectAllClick={handleSelectAllClick}
            />

            <TableBody>
              {filteredBPData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row: BlinkPageManager) => {
                  const {
                    id,
                    urlSlug,
                    merchantName,
                    merchantId,
                    created_by,
                    updatedAt,
                    updated_by
                  } = row;

                  return (
                    <TableRow hover key={id} tabIndex={-1}>
                      <TableCell component="th" scope="row" padding="none">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap>
                            <Link
                              href={`${process.env.REACT_APP_HOST_URL}/public/blink/${urlSlug}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {urlSlug}
                            </Link>
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="left">{merchantName}</TableCell>
                      <TableCell align="left">{merchantId}</TableCell>
                      <TableCell align="left">
                        {created_by && capitalCase(`${created_by.name} ${created_by.familyName}`)}
                      </TableCell>
                      <TableCell align="left">{fDate(updatedAt)}</TableCell>
                      <TableCell align="left">
                        {updated_by && capitalCase(`${updated_by.name} ${updated_by.familyName}`)}
                      </TableCell>
                      <TableCell align="left">
                        <BlinkPMoreMenu id={id} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>

            {isLoading && (
              <TableBody>
                <TableSkeletonLoad colSpan={TABLE_HEAD.length} />
              </TableBody>
            )}
            {isBPNotFound && !isLoading && (
              <TableBody>
                <TableRow>
                  <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                    <SearchNotFound searchQuery={filterMName} />
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Scrollbar>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={blinkPagesData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, page) => setPage(page)}
        onRowsPerPageChange={(e) => handleChangeRowsPerPage}
      />
    </Card>
  );
}
