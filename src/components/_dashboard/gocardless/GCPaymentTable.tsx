import Scrollbar from 'components/Scrollbar';
import {
  Table,
  TableContainer,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Paper,
  Box,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  makeStyles,
  TablePagination,
  Grid,
  InputAdornment
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import { LocalizationProvider, DatePicker } from '@material-ui/lab';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import Label from 'components/Label';
import { useEffect, useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { API_BASE_URLS, CURRENCY } from 'utils/constant';
import axiosInstance from 'utils/axios';
import { fDateAbr } from 'utils/formatTime';
import { gcError } from 'utils/helpError';
import TableSkeletonLoad from 'components/common/TableSkeletonLoad';

const useStyles = makeStyles({
  filter: {
    '& label': {
      fontSize: '.8em !important'
    },
    '& input': {
      fontSize: '.8em !important'
    },
    '& button p': {
      fontSize: '.9em !important'
    }
  }
});

type paymentListState = {
  amount: number | string;
  amount_refunded: number | string;
  charge_date: string;
  created_at: string;
  currency: string;
  description: string;
  email: string;
  customerName: string;
  fx?: any;
  id: string;
  links: any;
  metadata: any;
  reference: string | null;
  retry_if_possible: boolean;
  status: string;
};

const TABLE_HEADERS = [
  'Customer name',
  'Email',
  'Description',
  'Amount',
  'Requested date',
  'Completed date',
  'Status'
];

const FILTER_OPTIONS = ['date', 'customer name', 'email', 'status'];
const GCPaymentTable = () => {
  const [paymentList, setPaymentList] = useState<paymentListState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedFilter, setSelectedFilter] = useState<any>([]);
  const [searchStr, setSearchStr] = useState('');
  const [filter, setFilter] = useState({
    date: null,
    customerName: '',
    email: '',
    status: ''
  });

  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const fetchPayments = useCallback(
    async (filter) => {
      try {
        setIsLoading(true);
        let url = `${API_BASE_URLS.goCardless}/gocardless/payments`;
        if (Object.entries(filter).length > 0) {
          const queryString = Object.entries(filter)
            .filter((obj: any) => !!obj[1])
            .join('&')
            .replace(/,/gi, '=');
          url = `${url}${queryString.length === 0 ? '' : `?${queryString}`}`;
        }
        const { data } = await axiosInstance.get(url);
        setPaymentList([...data.message]);
      } catch (error) {
        enqueueSnackbar(gcError(error), { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
    [enqueueSnackbar]
  );

  useEffect(() => {
    const updateFilter = async () => {
      const res: any = await Promise.all(
        FILTER_OPTIONS.map((obj: any) => selectedFilter.indexOf(obj) > -1)
      );
      setFilter({
        date: res[0] ? filter.date : null,
        customerName: res[1] ? filter.customerName : '',
        email: res[2] ? filter.email : '',
        status: res[3] ? filter.status : ''
      });
      return {
        date: res[0] ? filter.date : null,
        customerName: res[1] ? filter.customerName : '',
        email: res[2] ? filter.email : '',
        status: res[3] ? filter.status : ''
      };
    };

    const filter1 = updateFilter();
    fetchPayments(filter1);
  }, [
    fetchPayments,
    filter.customerName,
    filter.date,
    filter.email,
    filter.status,
    selectedFilter
  ]);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const FilteredData = paymentList.filter(
    (payment) =>
      payment?.customerName?.toLowerCase().includes(searchStr?.toLowerCase()) ||
      payment?.email?.toLowerCase().includes(searchStr?.toLowerCase())
  );

  const PAYMENT_TABLE = FilteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  ).map((payment) => (
    <TableRow key={payment?.id}>
      <TableCell>{payment?.customerName}</TableCell>
      <TableCell>{payment?.email}</TableCell>
      <TableCell>{payment?.description || '-'}</TableCell>
      <TableCell>
        {payment?.amount
          ? `${CURRENCY[payment?.currency || 'default'].symbol} ${(
              Number(payment?.amount) / 100
            ).toFixed(2)}`
          : '-'}
      </TableCell>
      <TableCell>{fDateAbr(payment?.created_at) || '-'} </TableCell>

      <TableCell>{fDateAbr(payment?.charge_date) || '-'}</TableCell>
      <TableCell sx={{ textTransform: 'capitalize' }}>
        {payment?.status ? (
          <Label color={payment?.status === 'cancelled' ? 'error' : 'success'}>
            {payment?.status}
          </Label>
        ) : (
          '-'
        )}
      </TableCell>
    </TableRow>
  ));

  const TableContent = () => (
    <Table>
      <TableHead>
        <TableRow>
          {TABLE_HEADERS.map((header, idx) => (
            <TableCell key={`transaction-header-${idx}`}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {!isLoading && PAYMENT_TABLE}
        {isLoading && <TableSkeletonLoad colSpan={TABLE_HEADERS.length} />}
        {!isLoading && PAYMENT_TABLE.length < 1 && (
          <TableRow>
            <TableCell colSpan={TABLE_HEADERS.length + 1}>
              <Typography color="textSecondary">No Payments Found...</Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <>
      <Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
          <Grid container spacing={2} className={classes.filter}>
            <Grid item xs={12}>
              <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
                <Stack sx={{ minWidth: { xs: '100%', sm: '35%', md: '25%' } }}>
                  <TextField
                    className={classes.filter}
                    label="Search"
                    value={searchStr}
                    onChange={(e: any) => setSearchStr(e.target.value)}
                  />
                </Stack>
                <Autocomplete
                  multiple
                  sx={{ minWidth: { xs: '100%', sm: '30%', md: '20%' }, maxWidth: 'fit-content' }}
                  options={FILTER_OPTIONS}
                  onChange={(e: any, val: any) => {
                    const temp = [...val];
                    if (
                      val.indexOf('email') !== -1 &&
                      selectedFilter.indexOf('customer name') !== -1
                    ) {
                      temp.splice(selectedFilter.indexOf('customer name'), 1);
                    } else if (
                      val.indexOf('customer name') !== -1 &&
                      selectedFilter.indexOf('email') !== -1
                    ) {
                      temp.splice(selectedFilter.indexOf('email'), 1);
                    }
                    setSelectedFilter(temp);
                  }}
                  value={selectedFilter}
                  disableClearable
                  getOptionLabel={(option) => option.toUpperCase() || ''}
                  isOptionEqualToValue={(option, val) => option === val}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select filters"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: <>{params.InputProps.endAdornment}</>
                      }}
                    />
                  )}
                />
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    sx={{ height: '100%' }}
                    onClick={() => {
                      if (filter.date || filter.email || filter.customerName || filter.status) {
                        fetchPayments(filter);
                      }
                    }}
                  >
                    Apply
                  </Button>

                  {(filter.date || filter.email || filter.customerName || filter.status) && (
                    <Button
                      variant="contained"
                      sx={{ height: '100%' }}
                      onClick={() => {
                        const tempFilter = { date: null, customerName: '', email: '', status: '' };

                        setFilter(tempFilter);
                        setSelectedFilter([]);
                        fetchPayments(tempFilter);
                      }}
                    >
                      Reset
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Grid>
            {selectedFilter.indexOf('date') !== -1 && (
              <Grid item xs={12} sm={6} md={3} display="flex">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    InputProps={{ readOnly: true }}
                    label="Date"
                    value={filter.date}
                    onChange={(val) => {
                      setFilter({ ...filter, date: val });
                    }}
                    inputFormat="dd-MM-yyyy"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        helperText=""
                        onKeyDown={(e) => {
                          e.preventDefault();
                          return false;
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Button sx={{ padding: '5px', minWidth: 'min-content' }}>
                                <CloseIcon
                                  sx={{ alignSelf: 'center' }}
                                  onClick={() => {
                                    setFilter({ ...filter, date: null });
                                  }}
                                />
                              </Button>

                              {params?.InputProps?.endAdornment}
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            )}

            {selectedFilter.indexOf('email') !== -1 && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  className={classes.filter}
                  fullWidth
                  label="email"
                  value={filter.email}
                  onChange={(e) =>
                    setFilter({ ...filter, email: e.target.value || '', customerName: '' })
                  }
                />
              </Grid>
            )}
            {selectedFilter.indexOf('customer name') !== -1 && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  className={classes.filter}
                  fullWidth
                  label="Customer name"
                  value={filter.customerName}
                  onChange={(e) =>
                    setFilter({ ...filter, customerName: e.target.value || '', email: '' })
                  }
                />
              </Grid>
            )}

            {selectedFilter.indexOf('status') !== -1 && (
              <Grid item xs={12} sm={6} md={3}>
                <Autocomplete
                  fullWidth
                  options={[
                    { label: 'Submitted', value: 'submitted' },
                    { label: 'Cancelled', value: 'cancelled' },
                    { label: 'Paid Out', value: 'paid_out' }
                  ]}
                  onChange={(e: any, obj: any) => {
                    setFilter({ ...filter, status: obj.value });
                  }}
                  disableClearable
                  getOptionLabel={(option) => option.label || ''}
                  isOptionEqualToValue={(option, val) => option === val}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select status"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: <>{params.InputProps.endAdornment}</>
                      }}
                    />
                  )}
                />
              </Grid>
            )}
          </Grid>
        </Stack>
      </Box>

      <Scrollbar>
        <TableContainer component={Paper} elevation={2}>
          {!isLoading && TableContent()}
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={FilteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, page) => {
            setPage(page);
          }}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Dialog open={deleteModalOpen}>
          <DialogTitle>Delete Customer</DialogTitle>
          <DialogContent>Are you sure you want to delete this payment?</DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Scrollbar>
    </>
  );
};

export default GCPaymentTable;
