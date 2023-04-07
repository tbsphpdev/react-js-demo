import * as Yup from 'yup';
import {
  Card,
  Grid,
  Stack,
  TextField,
  Autocomplete,
  InputAdornment,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Tooltip,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import { Form, FormikProvider, useFormik } from 'formik';
import { LoadingButton } from '@material-ui/lab';
import { PaylinkFormState } from '@customTypes/transaction';
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URLS } from 'utils/constant';
import axiosInstance from 'utils/axios';
import { ErrorMsg } from 'utils/helpError';
import { sendCreatedPaylink, SendPaylink } from '_apis_/transaction';
import { makeStyles } from '@material-ui/styles';
import CloseIcon from '@material-ui/icons/Close';
import ContentCopyIcon from '@material-ui/icons/ContentCopy';
import InfoIcon from '@material-ui/icons/Info';
import PhoneNoInput from 'utils/PhoneInput';
import { amountValidation } from 'utils/RegexPatterns';
import useAuth from 'hooks/useAuth';
import MailOutlined from '@material-ui/icons/MailOutlined';
import SmsOutlined from '@material-ui/icons/SmsOutlined';
import PaylinkSummary from './PaylinkSummary';

type MerchantList = {
  id: number;
  merchantName: string;
  userSubId: string;
  merchantId: number | null;
  logo?: string | null;
};

type MerchantDetails = {
  merchants: MerchantList[];
  gatewayId: number | null;
};

type GenPaylinkDetails = {
  url: string;
  name: string;
  copytxt: string;
  id: string;
};

type Currencytype = { id: number; code: string; symbol: string };

const useStyles = makeStyles({
  input: {
    backgroundColor: '#fff'
  },
  image: {
    justifyContent: 'center',
    backgroundColor: 'rgba(145, 158, 171, 0.12)',
    borderRadius: '14px'
  },
  heading: {
    fontWeight: 500,
    fontSize: '20px'
  },
  width50: {
    width: '50%'
  },
  bold: {
    fontWeight: 'bold'
  },
  spacebet: {
    justifyContent: 'space-between'
  },
  dialogbox: {
    padding: '80px'
  },
  dialogboxheader: {
    justifyContent: 'center'
  },
  header: {
    fontSize: '50px',
    color: '#5dcc5d'
  },
  copysection: {
    width: '100%',
    borderRadius: '8px',
    justifyContent: 'center',
    paddingBottom: '20px'
  },
  copyurl: {
    backgroundColor: '#beb6b6',
    justifyContent: 'center',
    padding: '10px'
  },
  singlefield: {
    paddingRight: '7px'
  },
  pb20: {
    paddingBottom: '20px'
  },
  w100: {
    width: '100% !important'
  },
  summarydialogboxheader: {
    flexDirection: 'row-reverse'
  },
  ibtn: {
    padding: '13px 3px 12px 2px'
  },
  monthlycycles: {
    padding: '16px',
    backgroundColor: '#a4adb82b',
    borderRadius: '12px'
  },
  typostyle: {
    color: '#3366ff'
  },
  cross: {
    cursor: 'pointer'
  }
});

const PaylinkForm = () => {
  const classes = useStyles();
  const { gatewayactions, fetchactions, user } = useAuth();
  const [merchantList, setMerchantList] = useState<MerchantDetails>({
    merchants: [],
    gatewayId: null
  });
  const [generatepaylink, setgeneratepaylink] = useState<GenPaylinkDetails>({
    url: '',
    name: '',
    copytxt: 'Copy',
    id: ''
  });
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantList>({
    id: 0,
    merchantName: '',
    userSubId: '',
    merchantId: null
  });
  const [cycle, setCycle] = useState('');
  const [modal, setmodal] = useState(false);
  const [modalSent, setmodalSent] = useState(false);
  const [summarymodal, setsummarymodal] = useState(false);
  const [isGenerate, setisGenerate] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isLoadingResend, setLoadingResend] = useState(false);
  const [currencyarr, setCurrencyarr] = useState<Currencytype[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  const PaylinkFormSchema = Yup.object().shape(
    {
      customerFirstName: Yup.string()
        .trim()
        .matches(/^[aA-zZ\s]+$/g, 'Only alphabets are allowed for this field ')
        .required('First Name is required'),
      customerLastName: Yup.string()
        .trim()
        .matches(/^[aA-zZ\s]+$/g, 'Only alphabets are allowed for this field ')
        .required('Last Name is required'),
      customerPhoneNumberCode: Yup.string(),
      customerEmail: Yup.string().when('customerPhoneNumber', {
        is: (customerPhoneNumber: string) => !customerPhoneNumber || customerPhoneNumber.length > 4,
        then: Yup.string().email(),
        otherwise: Yup.string().required('Email is required').email('Please enter a valid Email')
      }),
      action: Yup.string().required('Action is required'),
      customerPhoneNumber: Yup.string().when('customerEmail', {
        is: (customerEmail: string) => !customerEmail || customerEmail.length !== 0,
        then: Yup.string(),
        otherwise: Yup.string().required('phone number is required')
      }),
      transactionReference: Yup.string()
        .required('Order Reference is required')
        .max(50, 'Only 50 Characters allowed'),
      amount: Yup.string().when(['action', 'amountDecision'], {
        is: (action: string, amountDecision: boolean) =>
          action === 'VERIFY' || amountDecision === true,
        then: Yup.string().notRequired(),
        otherwise: Yup.string()
          .trim()
          .matches(/^\d*\.?\d*$/, 'Must contain number')
          .required('Amount is required')
          .min(0.1)
          .test('is-zero', "Amount can't be 0", (value) => {
            if (value !== undefined) return Number(value) > 0;
            return true;
          })
      }),
      merchantName: Yup.string().required('Merchant Name is required'),
      merchantSub: Yup.string().required('Merchant Name is required'),
      isRepeatPayment: Yup.boolean(),
      notes: Yup.string().max(150, 'Only 150 characters allowed')
    },
    [['customerEmail', 'customerPhoneNumber']]
  );

  const formik = useFormik<PaylinkFormState>({
    initialValues: {
      action: '',
      type: 2,
      currency: '',
      currencyCode: '', // currencysymbol
      customerFirstName: '',
      customerLastName: '',
      customerPhoneNumberCode: '+44',
      customerPhoneNumber: '+44',
      transactionReference: '',
      blink_transaction_type: 'paylink',
      merchantName: '',
      amount: '',
      notes: '',
      customerEmail: '',
      defaultGateway: null,
      merchantSub: '',
      amountDecision: false,
      defaultCurrency: null,
      csId: null,
      isRepeatPayment: false
    },
    validationSchema: PaylinkFormSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const data = {
        ...values,
        defaultCurrency:
          currencyarr[currencyarr.findIndex((val) => val.symbol === values.currencyCode)].id
      };
      const amount = !data.amount ? '0' : data.amount;

      try {
        const cycleCount = data.isRepeatPayment ? parseInt(cycle, 10) : null;
        const cycleAmount = data.isRepeatPayment
          ? parseFloat((parseInt(values.amount, 10) / parseInt(cycle, 10)).toString()).toFixed(2)
          : null;
        if (isGenerate) {
          const is_email = false;
          const is_sms = false;
          const is_send = false;
          if (
            !(data.customerPhoneNumber.replace(data.customerPhoneNumberCode, '').trim().length > 4)
          ) {
            data.customerPhoneNumber = '';
          }
          const response = await SendPaylink({
            ...data,
            amount: amount.toString(),
            is_email,
            is_send,
            is_sms,
            cycleCount,
            cycleAmount
          });
          setgeneratepaylink((prevState) => ({
            ...prevState,
            url: response?.data?.message?.url,
            name: response?.data?.message?.merchantName,
            id: response?.data?.message?.id
          }));
          setSubmitting(false);
          setisGenerate(false);
          setmodal(true);
        } else {
          const is_email = data.customerEmail.trim().length > 0;
          const is_sms =
            data.customerPhoneNumber.replace(data.customerPhoneNumberCode, '').trim().length > 4;
          const is_send = true;
          if (!is_sms) {
            data.customerPhoneNumber = '';
          }
          const response = await SendPaylink({
            ...data,
            amount: amount.toString(),
            is_email,
            is_send,
            is_sms,
            cycleCount,
            cycleAmount
          });
          setgeneratepaylink((prevState) => ({
            ...prevState,
            url: response.data.message.url,
            name: response.data.message.merchantName
          }));

          setmodalSent(true);
          setSubmitting(false);
        }
      } catch (error) {
        console.error(error);

        enqueueSnackbar(ErrorMsg(error), { variant: 'error' });

        setSubmitting(false);
      }
    }
  });

  const {
    errors,
    values,
    touched,
    handleSubmit,
    isSubmitting,
    setFieldValue,
    getFieldProps,
    resetForm,
    setFieldError
  } = formik;

  const handleSendCreatedPL = useCallback(async () => {
    setLoadingResend(true);
    await sendCreatedPaylink({
      customerEmail: values.customerEmail,
      customerPhoneNumber: `${values.customerPhoneNumber}`,
      id: generatepaylink.id,
      merchantSub: values.merchantSub
    });
    setLoadingResend(false);
    setmodalSent(true);
  }, [generatepaylink.id, values.customerEmail, values.customerPhoneNumber, values.merchantSub]);

  const fetchDefaultCurrency = useCallback(
    async (merchantSub: string, gatewayId: number | null) => {
      try {
        const url = `${API_BASE_URLS.blinkpage}/blinkpages/${merchantSub}/currencies/${gatewayId}`;

        const response = await axiosInstance.get(url);

        if (response.data.message?.blinkPageCurrency) {
          setFieldValue('currency', response.data.message.blinkPageCurrency[0].code);
          setFieldValue('currencyCode', response.data.message.blinkPageCurrency[0].symbol);
          setFieldValue('defaultCurrency', response.data.message.blinkPageCurrency[0].id);
          setCurrencyarr(response.data.message.blinkPageCurrency);
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
      }
    },
    [enqueueSnackbar, setFieldValue]
  );

  useEffect(() => {
    if (gatewayactions.length === 0) {
      fetchactions(user?.gatewayId);
    } else {
      user?.gatewayId === 2 ? setFieldValue('action', 'Payment') : setFieldValue('action', 'SALE');
    }
  }, [fetchactions, gatewayactions, gatewayactions.length, setFieldValue, user?.gatewayId]);

  useEffect(() => {
    const fetchMerchantList = async () => {
      try {
        const url = `${API_BASE_URLS.transaction}/transactions/merchants`;

        const { data } = await axiosInstance.get(url);

        if (data) {
          const { message } = data;
          const gatewayId: number = message.defaultGateway;
          const merchants: MerchantList[] =
            message.defaultGateway === 1 ? message.csCustomerId : message.spVendorId;
          setMerchantList({
            merchants,
            gatewayId
          });
          setFieldValue('gatewayId', gatewayId);
          setFieldValue('defaultGateway', gatewayId);

          if (merchants.length === 1) {
            setSelectedMerchant({ ...merchants[0] });
            setFieldValue('merchantName', merchants[0].merchantName);
            setFieldValue('merchantId', merchants[0].merchantId);
            setFieldValue('merchantSub', merchants[0].userSubId);
            if (gatewayId === 1) {
              setFieldValue('csId', merchants[0].id);
            }
            fetchDefaultCurrency(merchants[0].userSubId, gatewayId);
          }
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMerchantList();
  }, [enqueueSnackbar, fetchDefaultCurrency, setFieldValue]);

  const afterReset = () => {
    user?.gatewayId === 2 ? setFieldValue('action', 'Payment') : setFieldValue('action', 'SALE');
    setFieldValue('merchantName', selectedMerchant.merchantName);
    setFieldValue('merchantSub', selectedMerchant.userSubId);
    setFieldValue('csId', selectedMerchant.id);
    setFieldValue('gatewayId', merchantList.gatewayId);
    setFieldValue('defaultGateway', merchantList.gatewayId);
    setFieldValue('currency', currencyarr[0].code);
    setFieldValue('currencyCode', currencyarr[0].symbol);
    setFieldValue('defaultCurrency', currencyarr[0].id);
  };

  const handleChangeDecision = (e: any) => {
    if (e.target.checked) {
      setFieldValue('isRepeatPayment', false);
      setFieldValue('amount', '');
    }
    setFieldValue('amountDecision', e.target.checked);
  };

  const setPhone = (e: any, code: any) => {
    if (e.includes('+')) {
      setFieldValue('customerPhoneNumber', e);
      setFieldValue('customerPhoneNumberCode', code);
    } else {
      const add = '+';
      setFieldValue('customerPhoneNumber', add.concat(e));
      setFieldValue('customerPhoneNumberCode', code);
    }

    setFieldError('customerPhoneNumber', '');
  };

  const handleSelectMerchant = (val: MerchantList) => {
    if (merchantList.gatewayId) {
      fetchDefaultCurrency(val.userSubId, merchantList.gatewayId);
    }
    setFieldValue('merchantName', val.merchantName);
    setFieldValue('merchantSub', val.userSubId);
    setFieldValue('csId', val.id);
  };

  const handleModalClose = () => {
    resetForm();
    afterReset();
    setmodal(false);
    setmodalSent(false);
    setisGenerate(false);
    setgeneratepaylink((prevState) => ({
      ...prevState,
      url: '',
      name: '',
      copytxt: 'Copy',
      id: ''
    }));
  };
  const copyToClipboard = (e: any) => {
    navigator.clipboard.writeText(generatepaylink.url);
    enqueueSnackbar('Paylink Copied Successfully', { variant: 'success' });
  };

  const handleaction = (val: any) => {
    setFieldValue('action', val);
    if (val === 'VERIFY') {
      setFieldValue('amount', '');
    }
  };

  return (
    <FormikProvider value={formik}>
      <Form noValidate onSubmit={handleSubmit} autoComplete="off">
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography className={classes.heading}>Send Paylink</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Autocomplete
                    fullWidth
                    onChange={(e, val) => {
                      val && handleSelectMerchant(val);
                      setSelectedMerchant((prevState: MerchantList) => ({ ...prevState, ...val }));
                    }}
                    options={merchantList.merchants}
                    value={selectedMerchant}
                    getOptionLabel={(option) => {
                      if (option.merchantId !== null && option.merchantName !== '') {
                        return `${option.merchantId || option.id}-${option.merchantName}`;
                      }
                      return '';
                    }}
                    loading={isLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={Boolean(touched.merchantName && errors.merchantName)}
                        helperText={touched.merchantName && errors.merchantName}
                        label="Select Merchant"
                        variant="outlined"
                        value={values.merchantName}
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
                  <FormControl fullWidth>
                    <InputLabel id="paylink-actions">Select Action</InputLabel>
                    <Select
                      labelId="paylink-actions"
                      id="paylink-action-select"
                      value={values.action}
                      onChange={(e) => {
                        handleaction(e.target.value);
                        setFieldValue('amountDecision', false);
                        setFieldValue('isRepeatPayment', false);
                      }}
                      label="Select Action"
                    >
                      {gatewayactions.map((action, i) => (
                        <MenuItem value={action.value} key={i}>
                          {action.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <Typography>Payment Details</Typography>
                {(values.action === 'SALE' || values.action === 'Payment') && (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.amountDecision}
                            onChange={handleChangeDecision}
                            name="amountDecision"
                            color="primary"
                          />
                        }
                        label="Customer To Decide Amount"
                      />
                    </Grid>
                    {!values.amountDecision && (
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.isRepeatPayment}
                              onChange={(e) => setFieldValue('isRepeatPayment', e.target.checked)}
                              name="repeat"
                              color="primary"
                            />
                          }
                          label="Allow Monthly Repeat Payments"
                        />
                        <Tooltip
                          title="Repeat Payments Only work with SALE"
                          className={classes.ibtn}
                        >
                          <IconButton aria-label="delete">
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    )}
                  </Stack>
                )}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  {values.action !== 'VERIFY' && !values.amountDecision && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        placeholder="100.00"
                        {...getFieldProps('amount')}
                        onBlur={() => {
                          setFieldValue('amount', Number(values.amount).toFixed(2));
                        }}
                        onChange={(event) => {
                          const { value } = event.target;

                          if (amountValidation.test(value)) {
                            setFieldValue('amount', value);
                          }
                        }}
                        value={values.amount}
                        error={Boolean(touched.amount && errors.amount)}
                        helperText={touched.amount && errors.amount}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              {currencyarr.length > 1 && (
                                <FormControl variant="outlined">
                                  <Select
                                    labelId="demo-simple-select-outlined-label"
                                    id="demo-simple-select-outlined"
                                    value={values.currency}
                                    disabled={values.merchantName === ''}
                                    onChange={(e) => {
                                      setFieldValue('currency', e.target.value);
                                      setFieldValue('currencyCode', e.target.value);
                                    }}
                                  >
                                    {currencyarr.map((curr, i) => (
                                      <MenuItem value={curr.symbol} key={i}>
                                        {curr.symbol}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                              {currencyarr.length === 1 && (
                                <Typography>{currencyarr[0].symbol}</Typography>
                              )}
                              {currencyarr.length === 0 && <Typography>£</Typography>}
                            </InputAdornment>
                          ),
                          style: {
                            paddingLeft: `${currencyarr.length > 1 ? '0' : '4'}`
                          }
                        }}
                      />
                    </Grid>
                  )}
                  <Grid
                    item
                    xs={12}
                    md={6}
                    className={values.amountDecision ? classes.singlefield : ''}
                  >
                    <TextField
                      fullWidth
                      label="Order Reference"
                      {...getFieldProps('transactionReference')}
                      error={Boolean(touched.transactionReference && errors.transactionReference)}
                      helperText={touched.transactionReference && errors.transactionReference}
                    />
                  </Grid>
                </Stack>
                {values.isRepeatPayment && (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Grid item xs={12} md={6} className={classes.singlefield}>
                      <TextField
                        fullWidth
                        placeholder="Number of Monthly Cycles"
                        value={cycle}
                        onChange={(e) => {
                          (e.target.value.match(/^[1-9][0-9]?$/g) || e.target.value === '') &&
                            setCycle(e.target.value);
                        }}
                      />
                    </Grid>
                    {values.amount && cycle && (
                      <Grid item xs={12} md={6} className={classes.monthlycycles}>
                        <Typography align="center" className={classes.typostyle}>
                          £{' '}
                          {`${parseFloat(
                            (parseInt(values.amount, 10) / parseInt(cycle, 10)).toString()
                          ).toFixed(2)}`}{' '}
                          per monthly cycle
                        </Typography>
                      </Grid>
                    )}
                  </Stack>
                )}
                <Typography>Customer Details</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    {...getFieldProps('customerFirstName')}
                    error={Boolean(touched.customerFirstName && errors.customerFirstName)}
                    helperText={touched.customerFirstName && errors.customerFirstName}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    {...getFieldProps('customerLastName')}
                    error={Boolean(touched.customerLastName && errors.customerLastName)}
                    helperText={touched.customerLastName && errors.customerLastName}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Send Via Email"
                      {...getFieldProps('customerEmail')}
                      error={Boolean(touched.customerEmail && errors.customerEmail)}
                      helperText={touched.customerEmail && errors.customerEmail}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <PhoneNoInput
                      formikdata={formik}
                      setPhone={setPhone}
                      require={false}
                      autofocus={false}
                    />
                  </Grid>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Notes"
                    {...getFieldProps('notes')}
                    error={Boolean(touched.notes && errors.notes)}
                    helperText={touched.notes && errors.notes}
                  />
                </Stack>
                <Box display={{ xs: 'block', md: 'none' }}>
                  <Stack direction={{ xs: 'row', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Grid item xs={12}>
                      <LoadingButton
                        fullWidth
                        onClick={() => {
                          setsummarymodal(true);
                        }}
                        variant="outlined"
                        loading={isSubmitting}
                      >
                        Proceed
                      </LoadingButton>
                    </Grid>
                  </Stack>
                </Box>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={5} display={{ xs: 'none', md: 'block' }}>
            {PaylinkSummary(
              values,
              classes,
              user,
              isSubmitting,
              handleSubmit,
              setisGenerate,
              selectedMerchant
            )}
          </Grid>
          {summarymodal && (
            <Dialog
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              open={summarymodal}
              onClose={() => {
                setsummarymodal(false);
              }}
            >
              <DialogTitle id="form-dialog-title">
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 3, sm: 2 }}
                  className={classes.summarydialogboxheader}
                >
                  <CloseIcon
                    onClick={() => {
                      setsummarymodal(false);
                    }}
                  />
                </Stack>
              </DialogTitle>
              <DialogContent>
                <Grid item xs={12}>
                  {PaylinkSummary(
                    values,
                    classes,
                    user,
                    isSubmitting,
                    handleSubmit,
                    setisGenerate,
                    selectedMerchant
                  )}
                </Grid>
              </DialogContent>
            </Dialog>
          )}
        </Grid>
      </Form>

      <Dialog
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        open={modal}
        onClose={handleModalClose}
      >
        <DialogTitle id="form-dialog-title">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 3, sm: 2 }}
            className={classes.summarydialogboxheader}
          >
            <CloseIcon
              onClick={() => {
                handleModalClose();
              }}
              className={classes.cross}
            />
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack justifyContent="center" alignItems="center" spacing={1}>
            <img src="/static/dialog/success-circle.svg" alt="success" width="100" />
            <Typography variant="h6">New Paylink Successfully Generated</Typography>
            <TextField
              fullWidth
              value={`${generatepaylink.url.slice(0, 30)}...`}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <ContentCopyIcon onClick={copyToClipboard} />
                  </InputAdornment>
                ),
                style: {
                  cursor: 'pointer'
                }
              }}
            />

            <Divider />
            <Typography>Or, Send Paylink By </Typography>
            <TextField
              fullWidth
              label="Send Via Email"
              {...getFieldProps('customerEmail')}
              error={Boolean(touched.customerEmail && errors.customerEmail)}
              helperText={touched.customerEmail && errors.customerEmail}
            />
            <PhoneNoInput
              formikdata={formik}
              setPhone={setPhone}
              require={false}
              autofocus={false}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} className={classes.pb20}>
              <LoadingButton
                fullWidth
                variant="contained"
                color="secondary"
                onClick={() => {
                  if (generatepaylink.id) {
                    handleSendCreatedPL();
                  }
                }}
                loading={isLoadingResend}
              >
                Send Link
              </LoadingButton>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        open={modalSent}
        onClose={handleModalClose}
      >
        <DialogTitle id="form-dialog-title">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 3, sm: 2 }}
            className={classes.summarydialogboxheader}
          >
            <CloseIcon
              onClick={() => {
                handleModalClose();
              }}
              className={classes.cross}
            />
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack justifyContent="center" alignItems="center" spacing={1}>
            <img src="/static/dialog/mail.svg" alt="success" width="100" />
            <Typography variant="h6" marginTop={2}>
              New Paylink successfully sent to
            </Typography>

            {values.customerEmail && (
              <Button
                startIcon={<MailOutlined />}
                component="div"
                disableFocusRipple
                disableRipple
                disableElevation
              >
                <Typography variant="subtitle1" color="textPrimary">
                  {values.customerEmail}
                </Typography>
              </Button>
            )}
            {values.customerPhoneNumber.length > 4 && (
              <Button
                startIcon={<SmsOutlined />}
                component="div"
                disableFocusRipple
                disableRipple
                disableElevation
              >
                <Typography variant="subtitle1" color="textPrimary">
                  {values.customerPhoneNumber}
                </Typography>
              </Button>
            )}
            <TextField
              fullWidth
              value={`${generatepaylink.url.slice(0, 30)}...`}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <ContentCopyIcon onClick={copyToClipboard} />
                  </InputAdornment>
                ),
                style: {
                  cursor: 'pointer'
                }
              }}
            />
          </Stack>
        </DialogContent>
      </Dialog>
    </FormikProvider>
  );
};

export default PaylinkForm;
