import { reconList, reconviewList } from '@customTypes/transaction';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Grid,
  makeStyles,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@material-ui/core';
import TableSkeletonLoad from 'components/common/TableSkeletonLoad';
import Scrollbar from 'components/Scrollbar';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';
import { getCardIssuer } from 'utils/formatCard';
import { fDateMonthMin, fDateTime } from 'utils/formatTime';
import { ErrorMsg } from 'utils/helpError';
import GetCardIcon from '../transactions/GetCardIcons';

const useStyles = makeStyles({
  root: {
    padding: '20px'
  },
  content: {
    marginTop: '10px'
  },
  previewbackground: {
    padding: '16px',
    background: '#e4f1ff66',
    borderRadius: '15px'
  },
  amountborder: {
    borderRight: '1px solid #e2e7ec'
  },
  headercolor: {
    color: '#74828f'
  },
  positioncenter: {
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  amountcolor: {
    color: '#3168e4d9'
  },
  refundcolor: {
    color: '#fc7705c7'
  },
  midcontentcss: {
    background: '#47a8ecfa',
    color: '#fffffffa',
    borderRadius: '8px'
  },
  fs14: {
    fontSize: '14px'
  },
  paginationroot: {
    alignItems: 'end'
  },
  paginationposition: {
    justifyContent: 'flex-end',
    alignItems: 'center'
  },

  activeButton: {
    color: '#0045FF',
    backgroundColor: 'rgba(145, 158, 171, 0.08)'
  }
});
const TABLE_HEADERS = ['Acquiring Bank', 'Funding Date', 'Merchant ID', 'Amount (Currency)'];
const TABLE_HEADERS_VIEW = ['Transaction Date', 'Card', 'Amount'];

type StateType = {
  viewTransaction: reconviewList[];
  viewmerchantid: string;
  isViewdatacall: boolean;
  viewpage: number;
  viewrowsPerPage: number;
  viewTotalpage: number;
  viewisLoading: boolean;
  viewparams: {
    customer_merchant_id: string;
    payment_key_of_funding_payment: string;
    bankReconsPayment: number;
  };
  callViewData: boolean;
  extradata: {
    recons_detail: {
      total_amount_of_funding_payment: number;
      transaction_date: string;
      transaction_funding_currency: string;
    };

    refund_total: number;
    transaction_total: number;
  };
};

const ReconciliationContent = ({
  selectedMerchantView,
  merchantList,
  handleMerchantView,
  isLoading,
  transactionList,
  isLoadingtrans,
  sectionChange,
  section,
  totalpage,
  rowsPerPage,
  page,
  handlePage
}: any) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [state, setState] = useState<StateType>({
    viewTransaction: [],
    viewmerchantid: '',
    extradata: {
      recons_detail: {
        total_amount_of_funding_payment: 0,
        transaction_date: '',
        transaction_funding_currency: ''
      },

      refund_total: 0,
      transaction_total: 0
    },
    viewpage: 1,
    viewrowsPerPage: 10,
    viewTotalpage: 0,
    viewparams: {
      customer_merchant_id: '',
      payment_key_of_funding_payment: '',
      bankReconsPayment: 0
    },
    isViewdatacall: false,

    viewisLoading: false,

    callViewData: false
  });
  const {
    viewisLoading,
    viewrowsPerPage,
    viewpage,
    viewmerchantid,
    viewTransaction,
    viewparams,
    callViewData,
    extradata
  } = state;
  useEffect(() => {
    const fetchviewList = async () => {
      setState((prevState) => ({
        ...prevState,
        viewTransaction: [],
        viewisLoading: true
      }));
      try {
        const url = `${
          API_BASE_URLS.reconciliation
        }/merchants/${section}?limit=${viewrowsPerPage}&offset=${viewrowsPerPage * (viewpage - 1)}`;
        const { data } = await axiosInstance.post(url, viewparams);

        if (data) {
          const { message } = data;
          if (message.data.length > 0) {
            setState((prevState: StateType) => ({
              ...prevState,
              viewTotalpage: Math.ceil(message.count / viewrowsPerPage),
              viewTransaction: [...message.data],
              extradata: {
                recons_detail: {
                  total_amount_of_funding_payment:
                    message.recons_detail.total_amount_of_funding_payment,
                  transaction_date: message.recons_detail.transaction_date,
                  transaction_funding_currency: message.recons_detail.transaction_funding_currency
                },

                refund_total: message.refund_total,
                transaction_total: message.transaction_total
              }
            }));
          }
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
      } finally {
        setState((prevState) => ({
          ...prevState,
          viewisLoading: false,
          callViewData: false,
          reloadtransaction: false
        }));
      }
    };
    if (callViewData) {
      fetchviewList();
    }
  }, [callViewData, enqueueSnackbar, section, viewpage, viewparams, viewrowsPerPage]);

  const handleView = (data: any) => {
    setState((prevState: StateType) => ({
      ...prevState,
      viewTransaction: [],
      extradata: {
        recons_detail: {
          total_amount_of_funding_payment: 0,
          transaction_date: '',
          transaction_funding_currency: ''
        },

        refund_total: 0,
        transaction_total: 0
      },
      viewpage: 1,
      viewTotalpage: 0,
      isViewdatacall: false,
      viewparams: { ...data },
      viewmerchantid: data.bankReconsPayment.toString(),
      callViewData: true
    }));
  };
  return (
    <Stack className={classes.root}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1, sm: 1 }}
        justifyContent="space-between"
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 1 }}>
          {' '}
          <Button
            onClick={() => {
              sectionChange('elavon');
            }}
            className={`${section === 'elavon' ? classes.activeButton : ''}`}
          >
            ELAVON
          </Button>
          <Button
            onClick={() => {
              sectionChange('aib');
            }}
            className={`${section === 'aib' ? classes.activeButton : ''}`}
          >
            AIB
          </Button>
        </Stack>
        <Button>Export to CSV</Button>
      </Stack>
      <Divider />
      <Grid container spacing={2} className={classes.content}>
        <Grid item md={6}>
          <Box>
            <Scrollbar>
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      {TABLE_HEADERS.map((header, idx) => (
                        <TableCell key={`transaction-header-${idx}`}>{header}</TableCell>
                      ))}
                      <TableCell colSpan={2} align="center" />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!isLoadingtrans &&
                      transactionList.map((row: reconList, index: number) => (
                        <TableRow key={index}>
                          <TableCell />
                          <TableCell>{row.acquirer}</TableCell>
                          <TableCell>{fDateMonthMin(row.transaction_processing_date)}</TableCell>
                          <TableCell>{row.trading_merchant_id}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Typography>{row.total_amount_of_funding_payment}</Typography>
                              <Typography>({row.transaction_funding_currency})</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell component="th" scope="row">
                            <Button
                              variant={
                                viewmerchantid === row.id.toString() ? 'contained' : 'outlined'
                              }
                              onClick={() =>
                                handleView({
                                  customer_merchant_id: row.customer_merchant_id,
                                  payment_key_of_funding_payment:
                                    row.payment_key_of_funding_payment,
                                  bankReconsPayment: row.id
                                })
                              }
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}

                    {isLoadingtrans && <TableSkeletonLoad colSpan={TABLE_HEADERS.length} />}
                    {!isLoadingtrans && transactionList.length < 1 && (
                      <TableRow>
                        <TableCell colSpan={TABLE_HEADERS.length + 1}>
                          <Typography color="textSecondary">No Transactions Found...</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
            {!isLoading && transactionList.length > 0 && (
              <Stack className={classes.paginationroot}>
                <Stack direction="row" className={classes.paginationposition}>
                  <Pagination
                    count={totalpage}
                    page={page}
                    onChange={(e, page) => handlePage(page)}
                  />
                </Stack>
              </Stack>
            )}
          </Box>
        </Grid>
        <Grid item md={6}>
          {viewmerchantid !== '' && !viewisLoading && (
            <Stack className={classes.previewbackground}>
              <Card>
                <Stack className={classes.root} spacing={2}>
                  <Typography>Preview</Typography>
                  {section === 'elavon' && (
                    <Autocomplete
                      fullWidth
                      onChange={(e, val) => {
                        handleMerchantView(val);
                      }}
                      options={merchantList}
                      getOptionLabel={(option) => option.merchantName}
                      loading={isLoading}
                      isOptionEqualToValue={(option, val) =>
                        option.merchantName === val.merchantName
                      }
                      value={selectedMerchantView}
                      disableClearable
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Merchant Id"
                          variant="outlined"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                    />
                  )}
                  <Grid container className={classes.midcontentcss}>
                    <Grid item xs={12} md={4} className={classes.amountborder}>
                      <Stack>
                        <Stack>
                          <Typography className={`${classes.fs14} ${classes.positioncenter}`}>
                            Funding Date
                          </Typography>
                          <Typography variant="h6" className={`${classes.positioncenter}`}>
                            {format(
                              new Date(extradata.recons_detail.transaction_date),
                              'yyyy-MM-dd'
                            )}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={4} className={classes.amountborder}>
                      <Stack>
                        <Stack>
                          <Typography className={`${classes.fs14} ${classes.positioncenter}`}>
                            Merchant Id
                          </Typography>
                          <Typography variant="h6" className={`${classes.positioncenter}`}>
                            {viewmerchantid}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Stack>
                        <Typography className={`${classes.fs14} ${classes.positioncenter}`}>
                          Total amount per batch
                        </Typography>
                        <Typography variant="h6" className={`${classes.positioncenter}`}>
                          {`${extradata.recons_detail.total_amount_of_funding_payment}(${extradata.recons_detail.transaction_funding_currency})`}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>

                  <Grid container>
                    <Grid item xs={12} md={6} className={classes.amountborder}>
                      <Stack>
                        <Stack>
                          <Typography
                            className={`${classes.headercolor} ${classes.positioncenter}`}
                          >
                            Transaction Amount
                          </Typography>
                          <Typography
                            variant="h6"
                            className={`${classes.amountcolor} ${classes.positioncenter}`}
                          >
                            {`${extradata.transaction_total}(${extradata.recons_detail.transaction_funding_currency})`}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack>
                        <Typography className={`${classes.headercolor} ${classes.positioncenter}`}>
                          Refund
                        </Typography>
                        <Typography
                          variant="h6"
                          className={`${classes.refundcolor} ${classes.positioncenter}`}
                        >
                          {`${extradata.refund_total}(${extradata.recons_detail.transaction_funding_currency})`}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                  <Scrollbar>
                    <TableContainer component={Paper} elevation={2}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell />
                            {TABLE_HEADERS_VIEW.map((header, idx) => (
                              <TableCell key={`transaction-header-${idx}`}>{header}</TableCell>
                            ))}
                            <TableCell colSpan={2} align="center" />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {!viewisLoading &&
                            viewTransaction.map((row, index) => (
                              <TableRow key={index}>
                                <TableCell />
                                <TableCell>{fDateTime(row.created_at)}</TableCell>
                                <TableCell>
                                  <GetCardIcon name={getCardIssuer(row.card_type)} />
                                </TableCell>
                                <TableCell>{`${row.transaction_funding_amount}(${row.transaction_funding_currency})`}</TableCell>
                              </TableRow>
                            ))}

                          {viewisLoading && (
                            <TableSkeletonLoad colSpan={TABLE_HEADERS_VIEW.length} />
                          )}
                          {!viewisLoading && viewTransaction.length < 1 && (
                            <TableRow>
                              <TableCell colSpan={TABLE_HEADERS_VIEW.length + 1}>
                                <Typography color="textSecondary">
                                  No Transactions Found...
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Scrollbar>
                  {!viewisLoading && transactionList.length > 0 && (
                    <Stack className={classes.paginationroot}>
                      <Stack direction="row" className={classes.paginationposition}>
                        <Pagination
                          count={totalpage}
                          page={page}
                          onChange={(e, page) => handlePage(page)}
                        />
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              </Card>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ReconciliationContent;
