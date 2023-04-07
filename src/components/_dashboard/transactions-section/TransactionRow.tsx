import * as Yup from 'yup';
import { useState, useRef } from 'react';
// material
import {
  TableRow,
  TableCell,
  Typography,
  Button,
  DialogContent,
  DialogTitle,
  TextField,
  Stack,
  DialogActions,
  Dialog,
  Grid,
  IconButton,
  Collapse,
  Box,
  makeStyles,
  TableHead,
  Table,
  TableBody,
  Tooltip,
  Divider,
  TableContainer,
  Paper,
  CircularProgress
} from '@material-ui/core';
import { fDateAbr, fDateMonthMin, ftimeSuffix } from 'utils/formatTime';
import { recentTransactionState } from '@customTypes/transaction';
import Label from 'components/Label';
import { useTheme } from '@material-ui/core/styles';
import { sentenceCase } from 'change-case';
import { ButtonAnimate } from 'components/animate';
import { API_BASE_URLS, CURRENCY } from 'utils/constant';
import axiosInstance from 'utils/axios';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { ErrorMsg } from 'utils/helpError';
import { LoadingButton } from '@material-ui/lab';
import { useReactToPrint } from 'react-to-print';
import ReceiptLongIcon from '@material-ui/icons/ReceiptLong';
import CloseIcon from '@material-ui/icons/Close';
import ContentCopyIcon from '@material-ui/icons/ContentCopy';
import Scrollbar from 'components/Scrollbar';
import { ICONS } from 'utils/blinkIcons';
import TableSkeletonLoad from 'components/common/TableSkeletonLoad';
import { amountValidation } from 'utils/RegexPatterns';
import { TransactionReceipt } from './TransactionReceipt';
import GetCardIcon from '../transactions/GetCardIcons';
import TransactionRowRepeat from './TransactionRowRepeat';

interface Props {
  row: recentTransactionState;
  cancelTransactionChange: any;
  index: number;
  handlererunrefundsuccess: any;
}

type RefundPayload = {
  transactionId: string;
  gatewayId: number;
  merchantSub: string;
  amount: string;
  currency?: string;
  description?: string;
};
type RunTxnPayload = {
  transactionId: string;
  merchantSub: string;
  csId: number;
  amount: number | string;
};

type ReceiptpayloadType = {
  action: string;
  currency: string | undefined;
  cardType: string;
  transactionId: number;
  transactionDate: string;
  orderRef: string;
  amount: string;
  customerName: string;
  customerEmail: string;
  lastFour: number;
  merchantEmail: string;
  merchantName: string;
  delayCapture?: string;
};

type Relatedtxn = {
  reltxndata: recentTransactionState[];
  isLoadingreltxn: boolean;
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
  copyicon: {
    cursor: 'pointer'
  },
  dialogboxheader: {
    padding: '5px'
  }
});

const defaultStatuses = {
  error: ['cancelled', 'rejected', 'referred'],
  warning: ['authorised'],
  success: ['processed'],
  info: ['refund', 'partial  refund', 'fully refunded', 'full refund'],
  default: ['reserved'],
  secondary: ['verified']
};

const TABLEHEADER = [
  'AVS Match',
  'CV2 Match',
  '3DS status',
  'Acquirer',
  'Card Type',
  'Auth code',
  'Blink Unique reference'
];

const RELTABLEHEADER = [
  'Date/Time',
  'Customer Name',
  'Card',
  'Order Reference',
  'Amount',
  'Status'
];

const TransactionRow = ({
  row,
  cancelTransactionChange,
  index,
  handlererunrefundsuccess
}: Props) => {
  const classes = useStyles();
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  });
  const [receiptTemplate, setReceiptTemplate] = useState('');
  const [receiptTemplateLoading, setReceiptTemplateLoading] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRunTxnDialogOpen, setIsRunTxnDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsdialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptdialogOpen] = useState(false);
  const [repeatDialogOpen, setIsRepeatDialogOpen] = useState(false);
  const [issendReceipt, setIssendReceipt] = useState(false);
  const [iscancelloading, setIscancelloading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openCollapse, setOpenCollapse] = useState(false);
  const open = Boolean(anchorEl);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const transactionId = row?.id.toString();
  const [reltxn, setReltxn] = useState<Relatedtxn>({
    reltxndata: [],
    isLoadingreltxn: false
  });
  const refundTransaction = async (payload: RefundPayload) => {
    try {
      let postData: any = {
        transactionId: payload.transactionId,
        merchantSub: payload.merchantSub,
        gatewayId: payload.gatewayId,
        csId: row?.cardstreamTxnId?.csTxnId?.id || null
      };

      if (payload.gatewayId === 2) {
        postData = {
          ...postData,
          currency: payload.currency,
          description: payload.description
        };
      }

      const url = `${API_BASE_URLS.transaction}/transactions/refund`;
      const { data } = await axiosInstance.post(url, {
        ...postData,
        amount: payload.amount
      });

      if (data) {
        enqueueSnackbar('Refund Successful', { variant: 'success' });
      }
    } catch (error) {
      enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
      console.error(error);
    }
  };
  const runTransaction = async (payload: RunTxnPayload) => {
    try {
      const postData: any = {
        transactionId: payload.transactionId,
        merchantSub: payload.merchantSub,
        csId: payload.csId,
        amount: payload.amount
      };

      const url = `${API_BASE_URLS.transaction}/transactions/run`;
      const { data } = await axiosInstance.post(url, {
        ...postData
      });

      if (data) {
        enqueueSnackbar('Transaction Successful', { variant: 'success' });
      }
    } catch (error) {
      enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
      console.error(error);
    }
  };

  const runTxnSchema = Yup.object().shape({
    amount: Yup.number().required('Amount is required')
  });

  const runTxnFormik = useFormik({
    initialValues: {
      transactionId,
      csId: row?.cardstreamTxnId?.csTxnId?.id,
      amount: row?.amount,
      merchantSub: row?.transactionOf
    },
    validationSchema: runTxnSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await runTransaction(values);
        setIsRunTxnDialogOpen(false);
        setSubmitting(false);
        resetForm();
        handlererunrefundsuccess();
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), { variant: 'error' });

        resetForm();
        setSubmitting(false);
      }
    }
  });

  const getReceipt = async () => {
    setReceiptTemplateLoading(true);
    try {
      const sendpayload: ReceiptpayloadType = {
        action: row?.transactionAction
          ? row?.transactionAction.toUpperCase()
          : row?.transactionAction,
        currency: '£',
        cardType: row?.cardScheme ? row?.cardScheme?.toLowerCase() : '',
        transactionId: row?.id,
        transactionDate: row?.createdAt,
        orderRef: row?.orderRef,
        amount: row?.amount,
        customerName: row?.customerName,
        customerEmail: row?.customerEmail,
        lastFour: row?.cardLastFourDigits,
        merchantEmail: row?.genTxnsubId.email,
        merchantName: row?.genTxnsubId.companyName
      };
      if (row?.delayCapture) {
        sendpayload.delayCapture = row?.delayCapture;
      }
      const url = `${API_BASE_URLS.notification}/getTemplate`;
      const { data } = await axiosInstance.post(url, { ...sendpayload });
      setReceiptTemplate(data.message);
    } catch (err) {
      console.error(err, 'error');
    } finally {
      setReceiptTemplateLoading(false);
    }
  };

  const sendreceiptSchema = Yup.object().shape({
    customerEmail: Yup.string().required('Email is required').email('Please enter a valid Email')
  });

  const sendreceiptFormik = useFormik({
    initialValues: {
      action: row?.transactionAction
        ? row?.transactionAction?.toUpperCase()
        : row?.transactionAction,
      currency:
        row?.gatewayId === 2
          ? row?.sagepayTxnId?.curSym?.symbol || CURRENCY[row?.currency || 'default'].symbol
          : row?.cardstreamTxnId?.curSym?.symbol || CURRENCY[row?.currency || 'default'].symbol,
      cardType: row?.cardScheme ? row?.cardScheme?.toLowerCase() : '',
      transactionId: row?.id,
      transactionDate: row?.createdAt,
      orderRef: row?.orderRef,
      amount: row?.amount,
      customerName: row?.customerName,
      customerEmail: row?.customerEmail,
      lastFour: row?.cardLastFourDigits,
      merchantEmail: row?.genTxnsubId.email,
      merchantName: row?.genTxnsubId.companyName,
      delayCapture: row?.delayCapture
    },
    validationSchema: sendreceiptSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const formdata = { ...values };
        if (values.action !== 'DELAY_CAPTURE') {
          delete formdata.delayCapture;
        }
        const url = `${API_BASE_URLS.notification}/reciepts/customer`;
        const { data } = await axiosInstance.post(url, {
          ...formdata
        });

        if (data) {
          enqueueSnackbar('Mail Sent Successfully', { variant: 'success' });
          setIssendReceipt(false);
          setSubmitting(false);
          resetForm();
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
        resetForm();
        setSubmitting(false);
      }
    }
  });

  const RefundFormSchema = Yup.object().shape({
    amount: Yup.number().max(Number(row?.amount)).required('Amount is required'),
    gatewayId: Yup.number(),
    description: Yup.string().when('gatewayId', {
      is: 2,
      then: Yup.string().required("'Description is required")
    })
  });

  const refundFormik = useFormik({
    initialValues: {
      transactionId,
      gatewayId: row?.gatewayId,
      amount: row?.amount,
      merchantSub: row?.transactionOf,
      currency: row?.gatewayId === 2 ? row?.sagepayTxnId?.currency : '',
      description: ''
    },
    validationSchema: RefundFormSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await refundTransaction(values);
        setIsRefundDialogOpen(false);
        setSubmitting(false);
        resetForm();
        handlererunrefundsuccess();
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
        resetForm();
        setSubmitting(false);
      }
    }
  });

  const cancelTransaction = async () => {
    try {
      setIscancelloading(true);
      const formData = {
        transactionId,
        gatewayId: row?.gatewayId,
        merchantSub: row?.transactionOf,
        csId: row?.cardstreamTxnId?.csTxnId?.id || null
      };

      const url = `${API_BASE_URLS.transaction}/transactions/cancel`;
      const { data } = await axiosInstance.delete(url, {
        data: {
          ...formData
        }
      });
      if (data.message === 'Cancelled Successfully') {
        enqueueSnackbar('Cancel Successful', { variant: 'success' });
        setIscancelloading(false);
        setIsCancelDialogOpen(false);
        cancelTransactionChange(index);
      }
    } catch (error) {
      setIscancelloading(false);
      enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
    }
  };

  const copyToClipboard = (reference: string) => {
    navigator.clipboard.writeText(reference);
    enqueueSnackbar('Copied Successfully', { variant: 'success' });
  };

  const handlerepeatsucccess = () => {
    setIsRepeatDialogOpen(false);
    handlererunrefundsuccess();
  };

  const fetchview = async () => {
    setReltxn((prevState) => ({
      ...prevState,
      isLoadingreltxn: true
    }));
    try {
      const url = `${API_BASE_URLS.transaction}/transactions/related/${row?.blinkUniqueReference}?limit=10&offset=0`;
      const { data } = await axiosInstance.get(url);
      if (data) {
        setReltxn((prevState) => ({
          ...prevState,
          reltxndata: [...data.message.transactions]
        }));
      }
    } catch (error) {
      enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
    } finally {
      setReltxn((prevState) => ({
        ...prevState,
        isLoadingreltxn: false
      }));
    }
  };

  const openview = () => {
    fetchview();
    setDetailsdialogOpen(true);
  };
  const closereltxn = () => {
    setReltxn((prevState) => ({
      ...prevState,
      reltxndata: []
    }));
    setDetailsdialogOpen(false);
  };

  const { errors, touched, getFieldProps } = refundFormik;

  return (
    <>
      <TableRow
        sx={{ '& > *': { borderBottom: 'unset' } }}
        className={`${!openCollapse && classes.tablerow}`}
      >
        <TableCell>
          <Stack direction="row">
            <Box
              display="flex"
              justifyContent="center"
              sx={{
                width: (theme) => theme.spacing(2.25)
              }}
            >
              {row?.blinkTransactionType && ICONS[row?.blinkTransactionType?.toLowerCase()]}
            </Box>
            <Button
              aria-label="expand row"
              size="medium"
              variant="text"
              onClick={() => setOpenCollapse(!openCollapse)}
            >
              <Stack>
                <Typography
                  className={`${
                    row?.transactionAction?.toUpperCase() === 'SALE' ? classes.salecolor : ''
                  } ${
                    row?.transactionAction === 'VERIFY' || row?.transactionAction === 'PRE-AUTH'
                      ? classes.verifycolor
                      : ''
                  }`}
                >
                  {row?.transactionAction}
                </Typography>
              </Stack>
            </Button>
          </Stack>
        </TableCell>
        <TableCell component="th" scope="row">
          {row?.createdAt && (
            <>
              <Typography>{fDateMonthMin(row?.createdAt)}</Typography>
              <Typography>{ftimeSuffix(row?.createdAt)}</Typography>
            </>
          )}
        </TableCell>
        <TableCell>
          <Stack>
            <Typography>{row?.customerName}</Typography>
            <Typography>{row?.customerEmail}</Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Stack spacing={1}>
            {row?.cardScheme && <GetCardIcon name={row?.cardScheme?.toLowerCase()} />}
            <Stack>{`Ends in ${row?.cardLastFourDigits}`}</Stack>
            {row?.cardExpireDate && (
              <Stack>{`${row?.cardExpireDate.toString().slice(0, 2)}/${row?.cardExpireDate
                .toString()
                .slice(2, 4)}`}</Stack>
            )}
          </Stack>
        </TableCell>
        <TableCell>{row?.orderRef}</TableCell>
        <TableCell>
          {`${
            row?.gatewayId === 2
              ? row?.sagepayTxnId?.curSym?.symbol || CURRENCY[row?.currency || 'default'].symbol
              : row?.cardstreamTxnId?.curSym?.symbol || CURRENCY[row?.currency || 'default'].symbol
          } ${row?.amount}`}
        </TableCell>
        <TableCell>
          {row?.status && (
            <Label
              variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
              color={
                (defaultStatuses.warning.includes(row?.status?.toLowerCase()) && 'warning') ||
                (defaultStatuses.success.includes(row?.status?.toLowerCase()) && 'success') ||
                (defaultStatuses.info.includes(row?.status?.toLowerCase()) && 'info') ||
                (defaultStatuses.default.includes(row?.status?.toLowerCase()) && 'default') ||
                (defaultStatuses.secondary.includes(row?.status?.toLowerCase()) && 'secondary') ||
                'error'
              }
            >
              {sentenceCase(row?.status)}
              {row?.delayCapture && row?.status === 'processed' ? ` (DC)` : ''}
              {row?.status === 'authorised' &&
              row?.relatedTxn &&
              row?.relatedTxn.status === 'verified'
                ? ` (V) on ${fDateAbr(row?.createdAt)}`
                : ''}
              {row?.status === 'authorised' &&
              row?.relatedTxn &&
              row?.relatedTxn.status === 'reversed'
                ? ` (PA) on ${fDateAbr(row?.createdAt)}`
                : ''}
            </Label>
          )}
        </TableCell>
        <TableCell />
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={1}>
            {row?.status !== 'pending' && (
              <IconButton
                color="primary"
                component="span"
                onClick={() => {
                  setReceiptdialogOpen(true);
                  getReceipt();
                }}
              >
                <ReceiptLongIcon />
              </IconButton>
            )}
            <Button
              id="basic-button"
              aria-controls="basic-menu"
              aria-haspopup="true"
              variant={`${!openCollapse ? 'outlined' : 'contained'}`}
              aria-expanded={open ? 'true' : undefined}
              onClick={() => setOpenCollapse(!openCollapse)}
            >
              Action
            </Button>
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow className={`${openCollapse && classes.tablerow} ${classes.collapse}`}>
        <TableCell style={{ padding: 0 }} colSpan={20}>
          <Collapse in={openCollapse} timeout="auto" unmountOnExit>
            <Stack direction="row" sx={{ margin: 1 }} justifyContent="space-between">
              <Stack>
                <Table size="small" aria-label="purchases">
                  <TableHead className={classes.collapsetablehead}>
                    <TableRow>
                      {TABLEHEADER.map((value, index) => (
                        <TableCell key={index} className={classes.tablecell}>
                          {value}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row?.cardstreamTxnId !== null && (
                      <TableRow>
                        <TableCell component="th" scope="row">
                          {row?.cardstreamTxnId.addressCheck}
                        </TableCell>
                        <TableCell>{row?.cardstreamTxnId.securityCodeCheck}</TableCell>
                        <TableCell>
                          {row?.cardstreamTxnId.threeSecureCheck !== null
                            ? row?.cardstreamTxnId.threeSecureCheck
                            : 'not known'}
                        </TableCell>
                        <TableCell>Simulator</TableCell>
                        <TableCell>{row?.cardType}</TableCell>
                        <TableCell>{row?.cardstreamTxnId.authorisationCode}</TableCell>
                        <TableCell>
                          <Stack direction="row">
                            <Tooltip title={row?.blinkUniqueReference}>
                              <Typography>{`${row?.blinkUniqueReference.slice(
                                0,
                                14
                              )}...`}</Typography>
                            </Tooltip>{' '}
                            <Tooltip title="click to copy">
                              <ContentCopyIcon
                                fontSize="small"
                                className={classes.copyicon}
                                onClick={() => copyToClipboard(row?.blinkUniqueReference)}
                              />
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )}
                    {row?.sagepayTxnId !== null && (
                      <TableRow>
                        <TableCell component="th" scope="row">
                          {row?.sagepayTxnId.addressCheck}
                        </TableCell>
                        <TableCell>{row?.sagepayTxnId.securityCodeCheck}</TableCell>
                        <TableCell>
                          {row?.sagepayTxnId.threeSecureCheck !== null
                            ? row?.sagepayTxnId.threeSecureCheck
                            : 'not known'}
                        </TableCell>
                        <TableCell>Simulator</TableCell>
                        <TableCell>{row?.cardType}</TableCell>
                        <TableCell>{row?.sagepayTxnId.authorisationCode}</TableCell>
                        <TableCell>
                          <Stack direction="row">
                            <Tooltip title={row?.blinkUniqueReference}>
                              <Typography>{`${row?.blinkUniqueReference.slice(
                                0,
                                14
                              )}...`}</Typography>
                            </Tooltip>{' '}
                            <Tooltip title="click to copy">
                              <ContentCopyIcon
                                fontSize="small"
                                className={classes.copyicon}
                                onClick={() => copyToClipboard(row?.blinkUniqueReference)}
                              />
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Stack>
              <Stack spacing={1} justifyContent="center">
                {row?.status !== 'rejected' && !row.isRepeatPayment && (
                  <>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      {(row?.status === 'verified' ||
                        row?.status === 'reserved' ||
                        row?.status === 'processed') && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setIsRunTxnDialogOpen(true);
                            setAnchorEl(null);
                          }}
                        >
                          {row?.status === 'processed' && 'Rerun Transaction'}
                          {row?.status === 'reserved' && 'Run Transaction'}
                          {row?.status === 'verified' && 'Capture Transaction'}
                        </Button>
                      )}
                      {row?.status === 'processed' && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setIsRefundDialogOpen(true);
                            setAnchorEl(null);
                          }}
                        >
                          Refund
                        </Button>
                      )}
                      {(row?.status === 'authorised' || row?.status === '(DC)') && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setIsCancelDialogOpen(true);
                            setAnchorEl(null);
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      {(row?.status === 'processed' || row?.status === '(DC)') && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setIsRepeatDialogOpen(true);
                            setAnchorEl(null);
                          }}
                        >
                          Repeat
                        </Button>
                      )}
                      {row?.relatedBlinkUniqueReference !== null && (
                        <Button onClick={() => openview()} variant="outlined">
                          View Related Transaction
                        </Button>
                      )}
                    </Stack>
                  </>
                )}
              </Stack>
            </Stack>
          </Collapse>
        </TableCell>
      </TableRow>

      <Dialog maxWidth="md" open={repeatDialogOpen} fullWidth>
        <DialogTitle>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 3, sm: 2 }}
            className={classes.dialogboxheader}
            justifyContent="space-between"
          >
            <Typography>Repeat Transaction</Typography>
            <CloseIcon
              onClick={() => {
                setIsRepeatDialogOpen(false);
              }}
            />
          </Stack>
        </DialogTitle>
        <DialogContent>
          <TransactionRowRepeat row={row} handlerepeatsucccess={handlerepeatsucccess} />
        </DialogContent>
      </Dialog>
      <Dialog maxWidth="lg" open={detailsDialogOpen} fullWidth>
        <DialogTitle>Related Transaction</DialogTitle>
        <DialogContent>
          <Scrollbar>
            <TableContainer component={Paper} elevation={2}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    {RELTABLEHEADER.map((header, idx) => (
                      <TableCell key={`transaction-header-${idx}`}>{header}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!reltxn.isLoadingreltxn &&
                    reltxn.reltxndata.length !== 0 &&
                    reltxn.reltxndata.map((data, i) => (
                      <TableRow
                        sx={{ '& > *': { borderBottom: 'unset' } }}
                        className={`${classes.tablerow}`}
                        key={i}
                      >
                        <TableCell />
                        <TableCell component="th" scope="row">
                          {data.createdAt && fDateMonthMin(data.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography>{data.customerName}</Typography>
                            <Typography>{data.customerEmail}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            {data?.cardScheme && (
                              <GetCardIcon name={data?.cardScheme?.toLowerCase()} />
                            )}
                            <Stack>{`Ends in ${data.cardLastFourDigits}`}</Stack>
                            {data?.cardExpireDate && (
                              <Stack>{`${data.cardExpireDate
                                .toString()
                                .slice(0, 2)}/${data.cardExpireDate
                                .toString()
                                .slice(2, 4)}`}</Stack>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>{data.orderRef}</TableCell>
                        <TableCell>{`${
                          data.gatewayId === 2
                            ? data.sagepayTxnId?.curSym?.symbol ||
                              CURRENCY[row?.currency || 'default'].symbol
                            : data.cardstreamTxnId?.curSym?.symbol ||
                              CURRENCY[row?.currency || 'default'].symbol
                        } ${data.amount}`}</TableCell>
                        <TableCell>
                          {data?.status && (
                            <Label
                              variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                              color={
                                (defaultStatuses.warning.includes(data?.status?.toLowerCase()) &&
                                  'warning') ||
                                (defaultStatuses.success.includes(data?.status?.toLowerCase()) &&
                                  'success') ||
                                (defaultStatuses.info.includes(data?.status?.toLowerCase()) &&
                                  'info') ||
                                (defaultStatuses.default.includes(data?.status?.toLowerCase()) &&
                                  'default') ||
                                (defaultStatuses.secondary.includes(data?.status?.toLowerCase()) &&
                                  'secondary') ||
                                'error'
                              }
                            >
                              {sentenceCase(data?.status)}
                              {data.delayCapture && data?.status === 'processed' ? ` (DC)` : ''}
                              {data?.status === 'authorised' &&
                              data.relatedTxn &&
                              data.relatedTxn.status === 'verified'
                                ? ` (V) on ${fDateAbr(data.createdAt)}`
                                : ''}
                              {data?.status === 'authorised' &&
                              data.relatedTxn &&
                              data.relatedTxn.status === 'reversed'
                                ? ` (PA) on ${fDateAbr(data.createdAt)}`
                                : ''}
                            </Label>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  {!reltxn.isLoadingreltxn && reltxn.reltxndata.length === 0 && (
                    <Typography>No Related Transaction Found</Typography>
                  )}
                  {reltxn.isLoadingreltxn && <TableSkeletonLoad colSpan={RELTABLEHEADER.length} />}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        </DialogContent>

        <DialogActions>
          <Stack spacing={3}>
            <Button variant="contained" onClick={() => closereltxn()}>
              Close
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
      <Dialog maxWidth="sm" open={isRefundDialogOpen} fullWidth>
        <DialogTitle>Refund Payment</DialogTitle>
        <FormikProvider value={refundFormik}>
          <Form noValidate onSubmit={refundFormik.handleSubmit}>
            <DialogContent>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  required
                  {...getFieldProps('amount')}
                  label="Amount"
                  type="number"
                  onChange={(e) => {
                    if (amountValidation.test(e.target.value)) {
                      refundFormik.setFieldValue('amount', e.target.value);
                    }
                    return false;
                  }}
                  error={Boolean(errors.amount && touched.amount)}
                  helperText={touched.amount && errors.amount}
                  inputProps={{
                    min: 0.1,
                    max: Number(row?.amount)
                  }}
                />

                {row?.gatewayId === 2 && (
                  <TextField
                    fullWidth
                    multiline
                    required
                    rows={3}
                    {...getFieldProps('description')}
                    label="Description"
                    error={Boolean(errors.description)}
                    helperText={errors.description}
                  />
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Stack direction="row" spacing={3}>
                <ButtonAnimate>
                  <LoadingButton
                    variant="outlined"
                    type="submit"
                    loading={refundFormik.isSubmitting}
                  >
                    Refund
                  </LoadingButton>
                </ButtonAnimate>
                <Button variant="contained" onClick={() => setIsRefundDialogOpen(false)}>
                  Close
                </Button>
              </Stack>
            </DialogActions>
          </Form>
        </FormikProvider>
      </Dialog>
      <Dialog maxWidth="sm" open={isCancelDialogOpen} fullWidth>
        <DialogTitle>Cancel Payment</DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="h6" color="warning">
              Are you sure? You want to Cancel this Transaction
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" spacing={3}>
            <ButtonAnimate>
              <LoadingButton
                variant="outlined"
                loading={iscancelloading}
                onClick={() => cancelTransaction()}
              >
                Cancel Transaction
              </LoadingButton>
            </ButtonAnimate>
            <Button variant="contained" onClick={() => setIsCancelDialogOpen(false)}>
              Close
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
      <Dialog maxWidth="sm" open={isRunTxnDialogOpen} fullWidth>
        <DialogTitle>Complete Transaction</DialogTitle>
        <FormikProvider value={runTxnFormik}>
          <Form noValidate onSubmit={runTxnFormik.handleSubmit}>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={10}>
                  <TextField
                    fullWidth
                    required
                    {...runTxnFormik.getFieldProps('amount')}
                    label="Amount"
                    type="number"
                    onChange={(e) => {
                      if (amountValidation.test(e.target.value)) {
                        runTxnFormik.setFieldValue('amount', e.target.value);
                      }
                      return false;
                    }}
                    error={Boolean(runTxnFormik.errors.amount && runTxnFormik.touched.amount)}
                    helperText={runTxnFormik.touched.amount && runTxnFormik.errors.amount}
                    inputProps={{
                      min: 0.1
                    }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Label sx={{ height: '100%' }}>GBP</Label>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Stack direction="row" spacing={3}>
                <Button variant="outlined" onClick={() => setIsRunTxnDialogOpen(false)}>
                  Cancel
                </Button>
                <ButtonAnimate>
                  <LoadingButton
                    variant="contained"
                    type="submit"
                    loading={runTxnFormik.isSubmitting}
                  >
                    Complete Transaction
                  </LoadingButton>
                </ButtonAnimate>
              </Stack>
            </DialogActions>
          </Form>
        </FormikProvider>
      </Dialog>
      <Dialog
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        open={receiptDialogOpen}
        maxWidth="md"
        fullWidth
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ pr: 2 }}
        >
          <DialogTitle>Receipt Preview</DialogTitle>
          <IconButton
            onClick={() => {
              setReceiptTemplate('');
              setReceiptdialogOpen(false);
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />
        <DialogContent>
          <Box sx={{ width: '100%', height: 400 }} ref={componentRef}>
            {receiptTemplateLoading ? (
              <Stack
                direction="row"
                spacing={{ xs: 3, sm: 3 }}
                justifyContent="center"
                alignItems="center"
              >
                <CircularProgress color="inherit" size={20} />
              </Stack>
            ) : (
              <TransactionReceipt
                row={row}
                receiptTemplate={receiptTemplate}
                receiptTemplateLoading={receiptTemplateLoading}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" spacing={3}>
            <Divider />
            <Button
              variant="contained"
              disabled={receiptTemplateLoading}
              onClick={() => setIssendReceipt(true)}
            >
              Send Receipt
            </Button>
            <Button variant="contained" disabled={receiptTemplateLoading} onClick={handlePrint}>
              Print Receipt
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
      <Dialog maxWidth="sm" open={issendReceipt} fullWidth>
        <DialogTitle>Send Receipt</DialogTitle>
        <FormikProvider value={sendreceiptFormik}>
          <Form noValidate onSubmit={sendreceiptFormik.handleSubmit}>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={10}>
                  <TextField
                    fullWidth
                    required
                    {...sendreceiptFormik.getFieldProps('customerEmail')}
                    label="Email"
                    error={Boolean(
                      sendreceiptFormik.errors.customerEmail &&
                        sendreceiptFormik.touched.customerEmail
                    )}
                    helperText={
                      sendreceiptFormik.touched.customerEmail &&
                      sendreceiptFormik.errors.customerEmail
                    }
                    inputProps={{
                      min: 0.1
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Stack direction="row" spacing={3}>
                <Button variant="outlined" onClick={() => setIssendReceipt(false)}>
                  Cancel
                </Button>
                <ButtonAnimate>
                  <LoadingButton
                    variant="contained"
                    type="submit"
                    loading={sendreceiptFormik.isSubmitting}
                  >
                    Send Receipt
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

export default TransactionRow;
