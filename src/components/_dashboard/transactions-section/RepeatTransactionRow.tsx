import { recentRepeatTransactionState } from '@customTypes/transaction';
// material
import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { DatePicker, LoadingButton, LocalizationProvider } from '@material-ui/lab';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import { sentenceCase } from 'change-case';
import { ButtonAnimate } from 'components/animate';
import Label from 'components/Label';
import { addDays, format, isBefore } from 'date-fns';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from 'routes/paths';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';
import { fDateMonthMin, ftimeSuffix } from 'utils/formatTime';
import { ErrorMsg } from 'utils/helpError';
import * as Yup from 'yup';

interface Props {
  row: recentRepeatTransactionState;
  handleCancelPauseEditSuccess: any;
  editedid: string;
  cleareditid: any;
}

type cyclestate = {
  createdAt: string;
  cycleAmount: string;
  id: string;
  isDateEdited?: boolean;
  isAmountEdited?: boolean;
  nextPaymentDate: string;
  paymentDate: string;
  rtPayId: string;
  state: string;
  updatedAt: string;
};

type StateType = {
  modal: boolean;
  editmodal: boolean;
  action: string;
  isLoading: boolean;
  pid: string;
  cid: string;
  editdata: {
    amount: number;
    date: string;
  };
  page: number;
  cycledata: cyclestate[];
};

const useStyles = makeStyles({
  tablerow: {
    borderBottom: '1px solid',
    borderColor: '#f4f6f8 !important'
  },
  collapse: {
    backgroundColor: '#f4f6f8'
  },
  collapsetablehead: {
    borderBottom: '1px solid',
    borderBottomColor: '#d1d5da'
  },
  salecolor: {
    color: '#07ae07'
  },
  verifycolor: {
    color: '#0045ff'
  },
  refundcolor: {
    color: '#f42424'
  },
  tablecell: {
    color: '#181c1f',
    boxShadow: 'none !important'
  },
  refundstatus: {
    border: '1px solid',
    borderRadius: '6px',
    padding: '1px',
    fontSize: '13px'
  },
  detailssec: {
    background: '#f5f8fd',
    borderRadius: '7px'
  },
  pagination: {
    justifyContent: 'center'
  }
});

const defaultStatuses = {
  error: ['cancel'],
  warning: ['scheduled'],
  success: ['processed', 'completed'],
  info: ['refund', 'partial  refund', 'fully refunded', 'full refund'],
  default: ['reserved', 'pending'],
  secondary: ['verified']
};

const TABLEHEADER = ['Date/Time', 'Amount', 'Status'];

const RepeatTransactionRow = ({
  row,
  handleCancelPauseEditSuccess,
  editedid,
  cleareditid
}: Props) => {
  const navigate = useNavigate();
  const classes = useStyles();
  const [state, setState] = useState<StateType>({
    modal: false,
    editmodal: false,
    action: '',
    isLoading: false,
    pid: '',
    cid: '',
    editdata: {
      amount: 0,
      date: ''
    },
    page: 1,
    cycledata: []
  });
  const [openCollapse, setOpenCollapse] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const { modal, pid, cid, isLoading, action, editmodal, editdata, page, cycledata } = state;

  useEffect(() => {
    const tempdata = [...row.rtPayDetail];
    setState((prevState: StateType) => ({
      ...prevState,
      cycledata: [...tempdata.slice(0, 5)]
    }));
    if (editedid !== '' && editedid === row.id) {
      setOpenCollapse(true);
      cleareditid();
    }
  }, [cleareditid, editedid, row.id, row.rtPayDetail]);

  const handlePage = (pageno: number) => {
    const initialposition = pageno * 5 - 5;
    const tempdata = [...row.rtPayDetail];
    setState((prevState: StateType) => ({
      ...prevState,
      page: pageno,
      cycledata: [...tempdata.slice(initialposition, pageno * 5)]
    }));
  };

  const cancelpauseTransaction = async () => {
    try {
      setState((prevState) => ({
        ...prevState,
        isLoading: true
      }));
      let url = '';
      if (cid !== '') {
        url = `${API_BASE_URLS.transaction}/transactions/repeat/${pid}/${action}/schedule/${cid}`;
      } else {
        url = `${API_BASE_URLS.transaction}/transactions/repeat/${pid}/${action}`;
      }

      const { data } = await axiosInstance.put(url);
      if (data) {
        closeModal();
        enqueueSnackbar(`${action.charAt(0).toUpperCase() + action.slice(1)} Successful`, {
          variant: 'success'
        });
        handleCancelPauseEditSuccess();
      }
    } catch (error) {
      enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
    } finally {
      setState((prevState) => ({
        ...prevState,
        isLoading: false
      }));
    }
  };

  const editTxnSchema = Yup.object().shape({
    amount: Yup.number().required('Amount is required'),
    date: Yup.string().required('Date is required')
  });

  const editTxnFormik = useFormik({
    initialValues: {
      parentId: '',
      schedulerId: '',
      amount: 0,
      date: ''
    },
    validationSchema: editTxnSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const url: string = `${API_BASE_URLS.transaction}/transactions/repeat/${values.parentId}`;
        if (editdata.amount !== values.amount || editdata.date !== values.date) {
          let Data = {};
          Data = { ...Data, scheduleId: values.schedulerId };
          if (editdata.amount !== values.amount) {
            Data = { ...Data, amount: values.amount.toString() };
          }
          if (editdata.date !== values.date) {
            Data = { ...Data, date: format(new Date(values.date), 'yyyy-MM-dd') };
          }

          const { data } = await axiosInstance.put(url, { ...Data });
          if (data) {
            setSubmitting(false);
            resetForm();
            enqueueSnackbar('Edit Successful', { variant: 'success' });
            handleClose();
            handleCancelPauseEditSuccess(values.parentId);
          }
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), { variant: 'error' });

        setSubmitting(false);
      }
    }
  });

  const closeModal = () => {
    setState((prevState) => ({
      ...prevState,
      modal: false,
      action: '',
      pid: '',
      cid: ''
    }));
  };

  const handleClose = () => {
    setState((prevState) => ({
      ...prevState,
      editmodal: false
    }));
    setState((prevState) => ({
      ...prevState,
      editdata: {
        ...editdata,
        amount: 0,
        date: ''
      }
    }));
  };

  const openEditModal = (data: any, parentId: any) => {
    setState((prevState) => ({
      ...prevState,
      editmodal: true,
      editdata: {
        ...editdata,
        amount: parseFloat(data.cycleAmount),
        date: format(addDays(new Date(data.paymentDate), 1), 'yyyy-MM-dd').toString()
      }
    }));
    editTxnFormik.setFieldValue('parentId', parentId);
    editTxnFormik.setFieldValue(
      'date',
      format(addDays(new Date(data.paymentDate), 1), 'yyyy-MM-dd').toString()
    );
    editTxnFormik.setFieldValue('schedulerId', data.id);
    editTxnFormik.setFieldValue('amount', parseFloat(data.cycleAmount));
  };

  const cyclePaid =
    row.cycleCount !== null && row.remaningCycleCount !== null
      ? row.cycleCount - row.remaningCycleCount
      : 0;

  return (
    <>
      <TableRow
        sx={{ '& > *': { borderBottom: 'unset' } }}
        className={`${!openCollapse && classes.tablerow}`}
      >
        <TableCell component="th" scope="row">
          {row.createdAt && (
            <Stack>
              <Typography>{fDateMonthMin(row.createdAt)}</Typography>
              <Typography>{ftimeSuffix(row.createdAt)}</Typography>
            </Stack>
          )}
        </TableCell>
        <TableCell>
          <Stack>
            <Typography>{row.parentTransactionId.customerName}</Typography>
            <Typography>{row.parentTransactionId.customerEmail}</Typography>
          </Stack>
        </TableCell>
        <TableCell>{row.parentTransactionId.orderRef}</TableCell>
        <TableCell>
          <Stack direction="row" spacing={1}>
            {row.cycleType === 'fixed' ? (
              <>
                <Typography>{row.curSym.symbol}</Typography>
                <Typography>{row.cycleAmount}</Typography>
              </>
            ) : (
              <Typography>Variable</Typography>
            )}
          </Stack>
        </TableCell>
        <TableCell>{`${row.cycleCount || ''} ${
          row.cycleUnit ? row.cycleUnit : row.cycleType
        }`}</TableCell>
        <TableCell>
          <Stack>
            <Typography>{`${cyclePaid} of ${
              row.cycleType === 'fixed' ? row.cycleCount || 'unlimited' : 'variable'
            }`}</Typography>
            <Typography>{`${row.curSym.symbol} ${parseInt(
              (cyclePaid * Number(row.cycleAmount)).toString(),
              10
            ).toFixed(2)} of ${
              row.cycleType === 'fixed'
                ? (row.cycleCount && row.curSym.symbol + row.finalAmount) || 'unlimited'
                : row.curSym.symbol + row.finalAmount
            }`}</Typography>
          </Stack>
        </TableCell>
        <TableCell>
          {row.state && (
            <Label
              variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
              color={
                (defaultStatuses.warning.includes(row.state?.toLowerCase()) && 'warning') ||
                (defaultStatuses.success.includes(row.state?.toLowerCase()) && 'success') ||
                (defaultStatuses.info.includes(row.state?.toLowerCase()) && 'info') ||
                (defaultStatuses.default.includes(row.state?.toLowerCase()) && 'default') ||
                (defaultStatuses.secondary.includes(row.state?.toLowerCase()) && 'secondary') ||
                'error'
              }
            >
              {sentenceCase(row.state)}
            </Label>
          )}
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Button
              id="basic-button"
              aria-controls="basic-menu"
              aria-haspopup="true"
              variant={`${!openCollapse ? 'outlined' : 'contained'}`}
              onClick={() => setOpenCollapse(!openCollapse)}
            >
              View/Edit
            </Button>
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow className={`${openCollapse && classes.tablerow}`}>
        <TableCell style={{ padding: 2 }} colSpan={20}>
          <Collapse in={openCollapse} timeout="auto" unmountOnExit>
            {row.state !== 'cancel' && (
              <Stack direction="row-reverse" sx={{ margin: 1 }} spacing={1}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setState((prevState) => ({
                      ...prevState,
                      modal: true,
                      pid: row.id,
                      action: 'cancel'
                    }));
                  }}
                >
                  Cancel
                </Button>
                {row.state === 'pause' ? (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setState((prevState) => ({
                        ...prevState,
                        modal: true,
                        pid: row.id,
                        action: 'scheduled'
                      }));
                    }}
                  >
                    Resume
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setState((prevState) => ({
                        ...prevState,
                        modal: true,
                        pid: row.id,
                        action: 'pause'
                      }));
                    }}
                  >
                    Pause
                  </Button>
                )}
              </Stack>
            )}
            <Stack
              direction="row"
              sx={{ margin: 1 }}
              justifyContent="space-between"
              className={classes.collapse}
            >
              <Stack sx={{ pl: 3 }}>
                <Table size="small" aria-label="purchases">
                  <TableHead className={classes.collapsetablehead}>
                    <TableRow>
                      {TABLEHEADER.map((value, index) => (
                        <TableCell key={index} className={classes.tablecell}>
                          {value}
                        </TableCell>
                      ))}
                      <TableCell className={classes.tablecell} align="center">
                        <ButtonAnimate>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              navigate(`${PATH_DASHBOARD.transaction.history}/${row.id}`);
                            }}
                          >
                            View All
                          </Button>
                        </ButtonAnimate>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cycledata.map((value, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          <Stack direction="row" spacing={1}>
                            <Typography>{fDateMonthMin(value.paymentDate)}</Typography>
                            <Typography>{ftimeSuffix(value.paymentDate)}</Typography>
                            {value.isDateEdited ? <Typography>(edited)</Typography> : ''}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Typography>{row.curSym.symbol}</Typography>
                            <Typography>
                              {value.cycleAmount}
                              {value.isAmountEdited ? `(edited)` : ''}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {value.state && (
                            <Label
                              variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                              color={
                                (defaultStatuses.warning.includes(value.state?.toLowerCase()) &&
                                  'warning') ||
                                (defaultStatuses.success.includes(value.state?.toLowerCase()) &&
                                  'success') ||
                                (defaultStatuses.info.includes(value.state?.toLowerCase()) &&
                                  'info') ||
                                (defaultStatuses.default.includes(value.state?.toLowerCase()) &&
                                  'default') ||
                                (defaultStatuses.secondary.includes(value.state?.toLowerCase()) &&
                                  'secondary') ||
                                'error'
                              }
                            >
                              {sentenceCase(value.state)}
                            </Label>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {value.state !== 'pending' ? (
                            <Button
                              variant="contained"
                              onClick={() => {
                                navigate(
                                  `${PATH_DASHBOARD.transaction.history}/${row.id}/${value.id}`
                                );
                              }}
                            >
                              View
                            </Button>
                          ) : (
                            <Stack direction="row" spacing={1}>
                              {!isBefore(new Date(), new Date(value.createdAt)) && (
                                <ButtonAnimate>
                                  <Button
                                    variant="contained"
                                    onClick={() => {
                                      openEditModal(value, row.id);
                                    }}
                                  >
                                    edit
                                  </Button>
                                </ButtonAnimate>
                              )}

                              <Button
                                variant="outlined"
                                color="error"
                                onClick={() => {
                                  setState((prevState) => ({
                                    ...prevState,
                                    modal: true,
                                    pid: row.id,
                                    cid: value.id,
                                    action: 'cancel'
                                  }));
                                }}
                              >
                                cancel
                              </Button>
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination
                  className={classes.pagination}
                  count={Math.ceil(row.rtPayDetail.length / 5)}
                  page={page}
                  onChange={(e, pageno) => handlePage(pageno)}
                />
              </Stack>
            </Stack>
          </Collapse>
        </TableCell>
      </TableRow>
      <Dialog maxWidth="sm" open={modal} fullWidth>
        <DialogTitle>{action.charAt(0).toUpperCase() + action.slice(1)} Payment</DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="h6" color="warning">
              Are you sure? You want to {action.charAt(0).toUpperCase() + action.slice(1)} this
              Transaction
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" spacing={3}>
            <ButtonAnimate>
              <LoadingButton
                variant="outlined"
                onClick={() => cancelpauseTransaction()}
                loading={isLoading}
              >
                {action} Transaction
              </LoadingButton>
            </ButtonAnimate>
            <Button variant="contained" onClick={() => closeModal()}>
              Close
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
      <Dialog maxWidth="sm" open={editmodal} fullWidth>
        <DialogTitle>Edit Transaction</DialogTitle>
        <FormikProvider value={editTxnFormik}>
          <Form noValidate onSubmit={editTxnFormik.handleSubmit}>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      required
                      {...editTxnFormik.getFieldProps('amount')}
                      label="Amount"
                      type="number"
                      error={Boolean(editTxnFormik.errors.amount && editTxnFormik.touched.amount)}
                      helperText={editTxnFormik.touched.amount && editTxnFormik.errors.amount}
                      inputProps={{
                        min: 0.1
                      }}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Date"
                        value={editTxnFormik.values.date}
                        onChange={(newValue) => {
                          editTxnFormik.setFieldValue('date', newValue);
                        }}
                        inputFormat="dd-MM-yyyy"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            error={Boolean(editTxnFormik.errors.date && editTxnFormik.touched.date)}
                            helperText={editTxnFormik.touched.date && editTxnFormik.errors.date}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    handleClose();
                  }}
                >
                  Cancel
                </Button>
                <ButtonAnimate>
                  <LoadingButton
                    variant="contained"
                    type="submit"
                    loading={editTxnFormik.isSubmitting}
                  >
                    Edit Transaction
                  </LoadingButton>
                </ButtonAnimate>
              </Stack>
            </DialogActions>
          </Form>
        </FormikProvider>
      </Dialog>
    </>
  );
};

export default RepeatTransactionRow;
