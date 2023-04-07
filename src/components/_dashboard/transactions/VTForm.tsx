import * as Yup from 'yup';
import {
  Card,
  Grid,
  Stack,
  TextField,
  Box,
  Autocomplete,
  Container,
  makeStyles,
  Typography,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
  Switch,
  Button,
  Dialog,
  DialogContent,
  MenuItem,
  Tooltip,
  IconButton,
  Checkbox,
  FormControl,
  Select,
  DialogTitle,
  FormGroup
} from '@material-ui/core';
import ZipCodeAddrPicker from 'components/ZipCodeAddrPicker';
import { useSnackbar } from 'notistack';
import { Form, FormikProvider, useFormik, getIn } from 'formik';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import { LoadingButton, LocalizationProvider, DatePicker } from '@material-ui/lab';
import {
  ActionTypes,
  DialogMsgActions,
  DialogMsgState,
  VirtualTerminalFormState
} from '@customTypes/transaction';
import { useState, useEffect, useReducer, useCallback } from 'react';
import { API_BASE_URLS } from 'utils/constant';
import axiosInstance from 'utils/axios';
import { makeVTPayment } from '_apis_/transaction';
import { ErrorMsg } from 'utils/helpError';
import LockIcon from '@material-ui/icons/Lock';
import {
  formatCreditCardNumber,
  formatCVC,
  formatExpirationDate,
  getCardIssuer,
  validateCardNumber
} from 'utils/formatCard';

import CloseIcon from '@material-ui/icons/Close';
import { addDate } from 'utils/formatTime';
import InfoIcon from '@material-ui/icons/Info';
import IndeterminateCheckBoxOutlinedIcon from '@material-ui/icons/IndeterminateCheckBoxOutlined';
import { actionTypes } from 'utils/actionTypes';
import { SuccessDialog, ErrorDialog } from 'components/MessageDialogs';
import { format, isValid } from 'date-fns';
import ManualAddressComp from 'components/ManualAddressComp';
import { useLocation } from 'react-router-dom';
import { amountValidation } from 'utils/RegexPatterns';
import { currencyOrder } from 'utils/currencyOrder';
import useAuth from 'hooks/useAuth';
import GetCardIcon from './GetCardIcons';
import Summarysection from './VTSummary';

const useStyles = makeStyles((theme) => ({
  [theme.breakpoints.down('lg')]: {
    textFieldStyle: {
      fontSize: 15
    }
  },
  [theme.breakpoints.down('md')]: {
    textFieldStyle: {
      fontSize: 13
    }
  },
  [theme.breakpoints.down('sm')]: {
    textFieldStyle: {
      fontSize: 11
    }
  },

  container: {
    padding: 0
  },
  lockicon: {
    marginRight: '8px',
    color: '#fff'
  },

  disableback: {
    backgroundColor: '#f2f3f5',
    borderRadius: '7px',
    color: '#9da1a9',
    justifyContent: 'center',
    alignItems: 'center',
    height: '56px'
  },
  activeback: {
    backgroundColor: '#eff4fe',
    borderRadius: '7px',
    color: '#598aeb',
    justifyContent: 'center',
    alignItems: 'center',
    height: '56px'
  },

  cardIcons: {
    display: 'flex'
  },
  singlefield: {
    paddingRight: '7px'
  },

  mt14: {
    marginTop: '14px'
  },
  checkboxback: {
    backgroundColor: '#f8fafb',
    padding: '8px',
    borderRadius: '8px'
  },

  ibtn: {
    padding: '13px 3px 12px 2px'
  },
  dialogboxheader: {
    flexDirection: 'row-reverse'
  },
  typosize: {
    fontSize: '0.7rem'
  }
}));

type MerchantList = {
  id: number;
  merchantName: string;
  userSubId: string;
  merchantId: number | null;
};

type MerchantDetails = {
  merchants: MerchantList[];
  gatewayId: number | null;
};

type RepeatDetails = {
  type: { name: string };
};

type Currencytype = { id: number; code: string; symbol: string };
const durationArr1 = ['days', 'weeks', 'months', 'years'];
const methodoptions = [{ name: 'Fixed Cycle' }, { name: 'Variable Schedule' }];
const initialDialogMsgState: DialogMsgState = {
  success: {
    isSuccess: false,
    authCode: null,
    amount: 0,
    cardNumber: 'xxxx',
    customerEmail: '',
    action: '',
    isRepeatPayment: false,
    currency: '',
    cycleType: 'fixed',
    variableCycle: [
      {
        currency: '',
        amount: '1',
        date: ''
      }
    ]
  },
  error: {
    isError: false,
    errorMsg: null
  }
};

const DialogMsgReducer = (state: DialogMsgState, action: DialogMsgActions) => {
  switch (action.type) {
    case 'SHOW_SUCCESS':
      return {
        ...state,
        success: {
          isSuccess: true,
          authCode: action.payload.authCode,
          amount: action.payload.amount,
          cardNumber: action.payload.cardNumber,
          customerEmail: action.payload.customerEmail,
          action: action.payload.action,
          isRepeatPayment: action.payload.isRepeatPayment,
          currency: action.payload.currency,
          delayCapture: action.payload.delayCapture,
          variableCycle: action.payload.variableCycle,
          cycleType: action.payload.cycleType
        }
      };
    case 'SHOW_ERROR':
      return {
        ...state,
        error: {
          isError: true,
          errorMsg: action.payload.errorMsg
        }
      };
    case 'RESET_ALL':
      return {
        ...state,
        ...initialDialogMsgState
      };

    default:
      return state;
  }
};

const VTForm = () => {
  const [merchantList, setMerchantList] = useState<MerchantDetails>({
    merchants: [],
    gatewayId: null
  });
  const { gatewayactionsvt, fetchactions, user } = useAuth();
  const location = useLocation();
  const [modal, setmodal] = useState(false);

  const [selectedMerchant, setSelectedMerchant] = useState<MerchantList>({
    id: 0,
    merchantName: '',
    userSubId: '',
    merchantId: null
  });
  const [isLoading, setLoading] = useState(true);
  const [repeat, setrepeat] = useState<RepeatDetails>({
    type: { name: 'Fixed Cycle' }
  });
  const [currencyarr, setCurrencyarr] = useState<Currencytype[]>([]);
  const [dialogMsg, dispatch] = useReducer(DialogMsgReducer, initialDialogMsgState);

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [manualAddress, setManualAddress] = useState(false);

  const VTFormSchema = Yup.object().shape({
    customerFirstName: Yup.string()
      .trim()
      .matches(/^[aA-zZ\s]+$/g, 'Only alphabets are allowed for this field ')
      .required('First Name is required'),
    customerLastName: Yup.string()
      .trim()
      .matches(/^[aA-zZ\s]+$/g, 'Only alphabets are allowed for this field ')
      .required('Last Name is required'),
    customerEmail: Yup.string().required('Email is required').email('Please enter a valid Email'),
    billingAddress: Yup.object().shape({
      address1: Yup.string().required('Address 1 is required'),
      country: Yup.string().required('country is required'),
      city: Yup.string().required('City is required'),
      postalCode: Yup.string().required('Zip Code is required')
    }),
    action: Yup.string().required('Action is required'),
    cardHolderName: Yup.string().required('Card Name is required'),
    cardNumber: Yup.string()
      .required('Card Number is required')
      .test('is-valid', 'Invalid Card Number', (value) => {
        if (value !== undefined) {
          return validateCardNumber(value);
        }
        return false;
      }),
    cardCVV: Yup.string().when('cardNumber', {
      is: (cardNumber: string) => getCardIssuer(cardNumber) === 'amex',
      then: Yup.string().required('Card CVV is required').max(4).min(4, 'Please enter valid CVV'),
      otherwise: Yup.string()
        .required('Card CVV is required')
        .max(3)
        .min(3, 'Please enter valid CVV')
    }),
    orderRef: Yup.string().required('Order Reference is required'),
    validity: Yup.string()
      .required('Card Expiry is required')
      .min(5, 'Please enter valid expiry date')
      .max(5, 'Please enter valid expiry date')
      .test('is-valid', 'Expiry date is not valid', (value) => {
        if (value !== undefined) return Number(value?.split('/')[0]) <= 12;
        return true;
      })
      .test('is-month-expired', 'Expiry date is not valid', (value) => {
        if (value !== undefined && Number(value?.split('/')[1]) === new Date().getFullYear() % 100)
          return Number(value?.split('/')[0]) >= new Date().getMonth() + 1;
        return true;
      })
      .test('is-year-expired', 'Expiry date is not valid', (value) => {
        if (value !== undefined)
          return Number(value?.split('/')[1]) >= new Date().getFullYear() % 100;
        return true;
      }),
    amount: Yup.string().when(['isRepeatPayment', 'cycleType', 'action'], {
      is: (isRepeatPayment: boolean, cycleType: string, action: string) =>
        action === 'VERIFY' || (isRepeatPayment && cycleType === 'variable'),
      then: Yup.string().notRequired(),
      otherwise: Yup.string()
        .trim()
        .matches(/^\d*\.?\d*$/, 'Must contain number')
        .required('Amount is required')
        .test('is-zero', "Amount can't be 0", (value) => {
          if (value !== undefined) return Number(value) > 0;
          return true;
        })
    }),
    merchantName: Yup.string().required('Merchant Name is required'),
    isRepeatPayment: Yup.boolean(),
    cycleDurationUnit: Yup.string().when(['isRepeatPayment', 'cycleType'], {
      is: (isRepeatPayment: boolean, cycleType: string) => isRepeatPayment && cycleType === 'fixed',
      then: Yup.string().required('Date Is Required')
    }),
    cycleDuration: Yup.string().when(['isRepeatPayment', 'cycleType'], {
      is: (isRepeatPayment: boolean, cycleType: string) => isRepeatPayment && cycleType === 'fixed',
      then: Yup.string().required('Duration Is Required')
    }),
    cycleCount: Yup.string().when(['isRepeatPayment', 'cycleType', 'unlimitedcycle'], {
      is: (isRepeatPayment: boolean, cycleType: string, unlimitedcycle: boolean) =>
        isRepeatPayment && cycleType === 'fixed' && !unlimitedcycle,
      then: Yup.string().required('Count Is Required')
    }),
    startDate: Yup.string().when(['isRepeatPayment', 'cycleType'], {
      is: (isRepeatPayment: boolean, cycleType: string) => isRepeatPayment && cycleType === 'fixed',
      then: Yup.string().required('Date Is Required')
    }),
    variableCycle: Yup.array().when(['isRepeatPayment', 'cycleType'], {
      is: (isRepeatPayment: boolean, cycleType: string) =>
        isRepeatPayment && cycleType === 'variable',
      then: Yup.array(
        Yup.object().shape({
          currency: Yup.string(),
          amount: Yup.string().required('Amount Is Required'),
          date: Yup.string().required('Date Is Required')
        })
      )
    }),
    unlimitedcycle: Yup.boolean()
  });

  const formik = useFormik<VirtualTerminalFormState>({
    enableReinitialize: true,
    initialValues: {
      action: 'SALE',
      type: 2,
      currency: 'GBP',
      cardHolderName: '',
      customerFirstName: '',
      customerLastName: '',
      validity: '',
      billingAddress: {
        address1: '',
        address2: '',
        city: '',
        postalCode: '',
        country: '',
        state: ''
      },

      orderRef: '',
      blink_transaction_type: 'vt',
      merchantName: '',
      transactionUnique: '',
      amount: '',
      cardNumber: '',
      cardCVV: '',
      customerEmail: '',
      merchantSub: '',
      csId: null,
      merchantId: null,
      delayCapture: null,
      cycleDurationUnit: 'months',
      cycleDuration: '',
      cycleCount: '',
      startDate: '',
      unlimitedcycle: false,
      isRepeatPayment: false,
      cycleType: 'fixed',
      variableCycle: [
        {
          currency: '',
          amount: '1',
          date: ''
        }
      ]
    },
    validationSchema: VTFormSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setFieldTouched }) => {
      try {
        await makeVTPayment({
          ...values,
          amount: String(values.amount),
          gatewayId: merchantList.gatewayId,
          cardNumber: Number(values.cardNumber.replace(/ /g, '')),
          cardCVV: Number(values.cardCVV),
          cardExpiryMonth: Number(values.validity.slice(0, 2)),
          cardExpiryYear: Number(values.validity.slice(-2)),
          cardType: getCardIssuer(values.cardNumber),
          cycleCount: String(values.cycleCount)
        });

        setmodal(false);
        setSubmitting(false);
        let amounttemp = values.amount;
        if (values.isRepeatPayment && values.cycleType !== 'fixed' && values.variableCycle) {
          amounttemp = values.variableCycle[values.variableCycle.length - 1].amount;
        }
        dispatch({
          type: ActionTypes.showSuccess,
          payload: {
            authCode: 'success',
            amount: amounttemp,
            cardNumber: values.cardNumber.slice(-4),
            customerEmail: values.customerEmail,
            action: values.action,
            isRepeatPayment: values.isRepeatPayment,
            currency: values.currency,
            variableCycle: values.variableCycle,
            cycleType: values.cycleType,
            delayCapture: String(values.delayCapture)
          }
        });
        const { merchantName, merchantId, merchantSub, csId, action } = values;
        resetForm();
        setrepeat((prevState) => ({
          ...prevState,
          type: { name: 'Fixed Cycle' }
        }));
        setFieldValue('billingAddress.address1', '');

        setFieldValue('merchantName', merchantName);
        setFieldValue('merchantId', merchantId);
        setFieldValue('merchantSub', merchantSub);
        setFieldValue('csId', csId);
        setFieldValue('action', action);
      } catch (err) {
        dispatch({
          type: ActionTypes.showError,
          payload: {
            errorMsg: ErrorMsg(err)
          }
        });

        setSubmitting(false);

        setFieldTouched('validity', false);
        setFieldValue('validity', '');
        setFieldValue('cardHolderName', '');
        setFieldTouched('cardHolderName', false);
        setFieldTouched('cardCVV', false);
        setFieldValue('cardCVV', '');
        setFieldTouched('cardNumber', false);
        setFieldValue('cardNumber', '');
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
    setFieldTouched
  } = formik;

  const fetchDefaultCurrency = useCallback(
    async (merchantSub: string, gatewayId: number | null) => {
      try {
        const url = `${API_BASE_URLS.blinkpage}/blinkpages/${merchantSub}/currencies/${gatewayId}`;

        const response = await axiosInstance.get(url);

        if (response.data.message?.blinkPageCurrency) {
          const orderedCurrency = currencyOrder(response.data.message.blinkPageCurrency);
          setCurrencyarr(orderedCurrency);
          setFieldValue('currency', orderedCurrency.length > 0 ? orderedCurrency[0].code : 'GBP');
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
      }
    },
    [enqueueSnackbar, setFieldValue]
  );

  useEffect(() => {
    if (location.state !== null) {
      setFieldValue('isRepeatPayment', true);
    }
    if (gatewayactionsvt.length === 0) {
      fetchactions(user?.gatewayId);
    } else {
      user?.gatewayId === 2 ? setFieldValue('action', 'Payment') : setFieldValue('action', 'SALE');
    }
  }, [fetchactions, gatewayactionsvt.length, location.state, setFieldValue, user?.gatewayId]);

  const handleSelectMerchant = (val: MerchantList) => {
    const { merchantName, userSubId, id, merchantId } = val;

    setFieldValue('merchantName', merchantName);
    setFieldValue('merchantId', merchantId);
    setFieldValue('merchantSub', userSubId);
    if (merchantList.gatewayId === 1) {
      setFieldValue('csId', id);
    }
    fetchDefaultCurrency(userSubId, merchantList.gatewayId);
  };

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

  const handleModalClose = () => {
    setmodal(false);
  };

  const changerepeat = (val: any) => {
    setFieldValue('cycleType', val.name.split(' ')[0].toLowerCase());
    const tempstate = [];
    setrepeat((prevState) => ({
      ...prevState,
      type: { name: val.name }
    }));

    tempstate.push({
      currency: '',
      amount: '',
      date: ''
    });
    setFieldValue('variableCycle', tempstate);
  };

  const addfield = () => {
    const tempstate = [...(values.variableCycle || [])];
    tempstate.push({
      currency: '',
      amount: '',
      date: ''
    });
    setFieldValue('variableCycle', tempstate);
  };

  const deletefield = (index: number) => {
    const tempstate = [...(values.variableCycle || [])];
    tempstate.splice(index, 1);
    setFieldValue('variableCycle', tempstate);
  };

  const handleRepeat = (e: boolean) => {
    setFieldValue('isRepeatPayment', e);
    if (e === false) {
      changerepeat({ name: 'Fixed Cycle' });
    }
  };

  const changerVarFields = (index: number, name: string, value: any) => {
    if (!isValid(value)) return;
    const tempstate = [...(values.variableCycle || [])];
    if (name === 'date') {
      tempstate[index].date = format(value, 'yyyy-MM-dd');
    } else if (name === 'amount') {
      tempstate[index].amount = value;
    }
    setFieldValue('variableCycle', tempstate);
  };

  const changeDate = (date: any) => {
    if (!isValid(date)) return;
    setFieldValue('startDate', format(date, 'yyyy-MM-dd'));
  };

  const changeUnlimited = (e: any) => {
    setFieldValue('unlimitedcycle', e.target.checked);
    !e.target.checked && setFieldValue('cycleCount', 0);
  };

  return (
    <>
      <SuccessDialog
        open={dialogMsg.success.isSuccess}
        details={dialogMsg.success}
        closeAction={dispatch}
      />
      <ErrorDialog
        open={dialogMsg.error.isError}
        errorMsg={dialogMsg.error.errorMsg}
        closeAction={dispatch}
      />
      <FormikProvider value={formik}>
        <Form noValidate onSubmit={handleSubmit}>
          <Container className={classes.container}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Card sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                      <Grid item xs={12} md={6}>
                        <Autocomplete
                          fullWidth
                          onChange={(e, val) => {
                            val && handleSelectMerchant(val);
                            setSelectedMerchant({ ...val });
                          }}
                          options={merchantList.merchants}
                          getOptionLabel={(option) => {
                            if (option.merchantId !== null && option.merchantName !== '') {
                              return `${option.merchantId || option.id}-${option.merchantName}`;
                            }
                            return '';
                          }}
                          loading={isLoading}
                          isOptionEqualToValue={(option, val) =>
                            option.merchantName === val.merchantName
                          }
                          value={selectedMerchant}
                          disableClearable
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
                                    {isLoading ? (
                                      <CircularProgress color="inherit" size={20} />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                )
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={values.action === 'SALE' || values.action === 'Payment' ? 3 : 6}
                      >
                        <FormControl variant="outlined" fullWidth>
                          <Select
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={values.action}
                            onChange={(e) => {
                              const { value } = e.target;
                              setFieldValue('action', value);
                              if (value === 'VERIFY') {
                                setFieldValue('amount', '00.00');
                              }
                              if (value !== 'SALE' && value !== 'Payment') {
                                handleRepeat(false);
                              }
                            }}
                          >
                            {gatewayactionsvt.map((action, i) => (
                              <MenuItem value={action.value} key={i}>
                                {action.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      {(values.action === 'SALE' || values.action === 'Payment') && (
                        <Grid item xs={12} md={3}>
                          <Stack
                            direction="row"
                            className={
                              values.action === 'SALE' || values.action === 'Payment'
                                ? classes.activeback
                                : classes.disableback
                            }
                          >
                            <Switch
                              checked={values.isRepeatPayment}
                              onChange={(e) => handleRepeat(e.target.checked)}
                              name="checkedB"
                              color="primary"
                              size="small"
                              disabled={values.action !== 'SALE' && values.action !== 'Payment'}
                            />

                            <Typography className={classes.typosize}>Repeat Payment</Typography>
                            <Tooltip
                              title="Repeat Payments Only work with sale"
                              className={classes.ibtn}
                            >
                              <IconButton aria-label="delete">
                                <InfoIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Grid>
                      )}
                    </Stack>
                    {actionTypes.delayStatus.includes(values.action) && (
                      <>
                        <Typography>Select Date</Typography>

                        <Stack>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              label="Date"
                              value={values.delayCapture}
                              inputFormat="dd-MM-yyyy"
                              onChange={(newValue) => setFieldValue('delayCapture', newValue)}
                              renderInput={(params) => (
                                <TextField {...params} fullWidth helperText="" />
                              )}
                              InputProps={{ readOnly: true }}
                              minDate={addDate(1)}
                              maxDate={addDate(30)}
                            />
                          </LocalizationProvider>
                        </Stack>
                      </>
                    )}
                    {(values.action === 'SALE' || values.action === 'Payment') &&
                      values.isRepeatPayment && (
                        <>
                          <Typography>Repeat Payment</Typography>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Grid item xs={12} md={6} className={classes.singlefield}>
                              <Autocomplete
                                fullWidth
                                options={methodoptions}
                                onChange={(e: any, val) => changerepeat(val)}
                                value={repeat.type}
                                disableClearable
                                getOptionLabel={(option) => option.name || ''}
                                isOptionEqualToValue={(option, val) => option.name === val.name}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    error={Boolean(touched.action && errors.action)}
                                    helperText={touched.action && errors.action}
                                    label="Cycle Type"
                                    variant="outlined"
                                    InputProps={{
                                      ...params.InputProps,
                                      endAdornment: params.InputProps.endAdornment
                                    }}
                                  />
                                )}
                              />
                            </Grid>
                          </Stack>
                          {repeat.type.name === 'Variable Schedule' && (
                            <>
                              <Stack direction="column" spacing={2}>
                                {(values.variableCycle || []).map((val, index) => (
                                  <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={2}
                                    key={index}
                                  >
                                    <Grid item xs={12} md={6}>
                                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                        <TextField
                                          fullWidth
                                          placeholder="100"
                                          value={val.amount}
                                          onBlur={() => {
                                            setFieldValue('amount', Number(val.amount).toFixed(2));
                                          }}
                                          error={Boolean(
                                            getIn(touched, `variableCycle[${index}].amount`) &&
                                              getIn(errors, `variableCycle[${index}].amount`)
                                          )}
                                          helperText={
                                            getIn(touched, `variableCycle[${index}].amount`) &&
                                            getIn(errors, `variableCycle[${index}].amount`)
                                          }
                                          onChange={(e) => {
                                            if (amountValidation.test(e.target.value)) {
                                              setFieldValue(
                                                `variableCycle[${index}].amount`,
                                                e.target.value
                                              );
                                            }
                                            return false;
                                          }}
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
                                                      onChange={(e) =>
                                                        setFieldValue('currency', e.target.value)
                                                      }
                                                    >
                                                      {currencyarr.map((curr, i) => (
                                                        <MenuItem value={curr.code} key={i}>
                                                          {curr.symbol}
                                                        </MenuItem>
                                                      ))}
                                                    </Select>
                                                  </FormControl>
                                                )}
                                                {currencyarr.length === 1 && (
                                                  <Typography>{currencyarr[0].symbol}</Typography>
                                                )}
                                                {currencyarr.length === 0 && (
                                                  <Typography>£</Typography>
                                                )}
                                              </InputAdornment>
                                            ),
                                            style: {
                                              paddingLeft: `${currencyarr.length > 1 ? '0' : '4'}`
                                            }
                                          }}
                                        />
                                      </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                          label="Date"
                                          inputFormat="dd-MM-yyyy"
                                          value={val.date}
                                          onChange={(newValue) => {
                                            changerVarFields(index, 'date', newValue);
                                          }}
                                          InputProps={{ readOnly: true }}
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              fullWidth
                                              error={Boolean(
                                                getIn(touched, `variableCycle[${index}].date`) &&
                                                  getIn(errors, `variableCycle[${index}].date`)
                                              )}
                                              helperText={
                                                getIn(touched, `variableCycle[${index}].date`) &&
                                                getIn(errors, `variableCycle[${index}].date`)
                                              }
                                            />
                                          )}
                                          minDate={addDate(1)}
                                          maxDate={addDate(30)}
                                        />
                                      </LocalizationProvider>
                                    </Grid>
                                    <Grid item xs={12} md={1}>
                                      {index !== 0 && (
                                        <IconButton
                                          aria-label="delete"
                                          size="small"
                                          onClick={() => deletefield(index)}
                                        >
                                          <IndeterminateCheckBoxOutlinedIcon
                                            fontSize="inherit"
                                            color="primary"
                                          />
                                        </IconButton>
                                      )}
                                    </Grid>
                                  </Stack>
                                ))}
                              </Stack>

                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Grid item xs={12} md={3}>
                                  <Button fullWidth variant="outlined" onClick={addfield}>
                                    Add More
                                  </Button>
                                </Grid>
                              </Stack>
                            </>
                          )}
                          {repeat.type.name === 'Fixed Cycle' && (
                            <>
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Grid item xs={12} md={6}>
                                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                      fullWidth
                                      placeholder="100.00"
                                      value={values.amount}
                                      onBlur={() => {
                                        setFieldValue('amount', Number(values.amount).toFixed(2));
                                      }}
                                      error={Boolean(touched.amount && errors.amount)}
                                      helperText={touched.amount && errors.amount}
                                      onChange={(e) => {
                                        if (amountValidation.test(e.target.value)) {
                                          setFieldValue('amount', e.target.value);
                                        }
                                        return false;
                                      }}
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
                                                  onChange={(e) =>
                                                    setFieldValue('currency', e.target.value)
                                                  }
                                                >
                                                  {currencyarr.map((curr, i) => (
                                                    <MenuItem value={curr.code} key={i}>
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
                                  </Stack>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                      label="Start Date"
                                      inputFormat="dd-MM-yyyy"
                                      value={values.startDate}
                                      onChange={(newValue) => changeDate(newValue)}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          fullWidth
                                          helperText={touched.startDate && errors.startDate}
                                          error={Boolean(touched.startDate && errors.startDate)}
                                        />
                                      )}
                                      InputProps={{ readOnly: true }}
                                      minDate={addDate(1)}
                                      maxDate={addDate(30)}
                                    />
                                  </LocalizationProvider>
                                </Grid>
                              </Stack>

                              <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={{ xs: 3, sm: 2 }}
                              >
                                <Grid item xs={12} md={6}>
                                  <Stack
                                    direction={{ xs: 'row', sm: 'row' }}
                                    spacing={{ xs: 3, sm: 2 }}
                                  >
                                    <Grid item xs={12} md={7} className={classes.mt14}>
                                      <Typography>Take Payment Every :</Typography>
                                    </Grid>

                                    <Grid item xs={12} md={5}>
                                      <TextField
                                        fullWidth
                                        label="Duration"
                                        value={values.cycleDuration}
                                        error={Boolean(
                                          touched.cycleDuration && errors.cycleDuration
                                        )}
                                        helperText={touched.cycleDuration && errors.cycleDuration}
                                        onChange={(e) => {
                                          (e.target.value.match(/^[1-9][0-9]?$/g) ||
                                            e.target.value === '') &&
                                            setFieldValue('cycleDuration', e.target.value);
                                        }}
                                      />
                                    </Grid>
                                  </Stack>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Autocomplete
                                    fullWidth
                                    options={durationArr1}
                                    onChange={(e, val) => {
                                      setFieldValue('cycleDurationUnit', val);
                                    }}
                                    value={values.cycleDurationUnit}
                                    disableClearable
                                    getOptionLabel={(option) => option || ''}
                                    isOptionEqualToValue={(option, val) => option === val}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        label="Choose Duration"
                                        variant="outlined"
                                        InputProps={{
                                          ...params.InputProps,
                                          endAdornment: <>{params.InputProps.endAdornment}</>
                                        }}
                                      />
                                    )}
                                  />
                                </Grid>
                              </Stack>
                              <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={{ xs: 3, sm: 2 }}
                              >
                                <Grid item xs={12} md={6}>
                                  <Stack
                                    direction={{ xs: 'row', sm: 'row' }}
                                    spacing={{ xs: 3, sm: 2 }}
                                  >
                                    <Grid item xs={12} md={6} className={classes.mt14}>
                                      <Typography>Number of Cycles :</Typography>
                                    </Grid>
                                    <Grid
                                      item
                                      xs={12}
                                      md={6}
                                      className={(classes.mt14, classes.checkboxback)}
                                    >
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            onChange={changeUnlimited}
                                            checked={values.unlimitedcycle}
                                            name="Unlimited"
                                            color="primary"
                                          />
                                        }
                                        labelPlacement="end"
                                        label="Unlimited"
                                      />
                                    </Grid>
                                  </Stack>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Stack direction={{ xs: 'row', sm: 'row' }}>
                                    <TextField
                                      fullWidth
                                      type="text"
                                      value={values.cycleCount}
                                      onChange={(e) => {
                                        (e.target.value.match(/^[1-9][0-9]?$/g) ||
                                          e.target.value === '') &&
                                          setFieldValue('cycleCount', e.target.value);
                                      }}
                                      error={Boolean(touched.cycleCount && errors.cycleCount)}
                                      helperText={touched.cycleCount && errors.cycleCount}
                                      disabled={values.unlimitedcycle}
                                      onKeyDown={(e: any) => {
                                        if (!e.target.value && e.which === 48) {
                                          e.preventDefault();
                                        }
                                      }}
                                      InputProps={{
                                        inputProps: { min: 1, max: 99 },
                                        startAdornment: (
                                          <InputAdornment position="start">
                                            <TextField value="custom" disabled />
                                          </InputAdornment>
                                        ),
                                        style: {
                                          paddingLeft: '0'
                                        }
                                      }}
                                    />
                                  </Stack>
                                </Grid>
                              </Stack>
                            </>
                          )}
                        </>
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
                      <TextField
                        fullWidth
                        label="Email"
                        {...getFieldProps('customerEmail')}
                        error={Boolean(touched.customerEmail && errors.customerEmail)}
                        helperText={touched.customerEmail && errors.customerEmail}
                      />
                      <TextField
                        fullWidth
                        label="Order Reference"
                        {...getFieldProps('orderRef')}
                        error={Boolean(touched.orderRef && errors.orderRef)}
                        helperText={touched.orderRef && errors.orderRef}
                        inputProps={{
                          maxLength: 50
                        }}
                      />
                    </Stack>
                    <Stack>
                      <FormGroup>
                        <FormControlLabel
                          sx={{ textAlign: 'left', maxWidth: 'max-content' }}
                          control={
                            <Checkbox
                              checked={manualAddress}
                              onClick={() => {
                                setManualAddress(!manualAddress);
                              }}
                            />
                          }
                          label="Enter Address Manually"
                        />
                      </FormGroup>
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 1 }}>
                      {!manualAddress && (
                        <ZipCodeAddrPicker
                          setAddress={(val) => {
                            setFieldValue('billingAddress.address1', val);
                          }}
                          setAddressFields={(country, state, city, postalCode) => {
                            setFieldValue('billingAddress.country', country);
                            setFieldValue('billingAddress.state', state.slice(0, 2));
                            setFieldValue('billingAddress.city', city);
                            setFieldValue('billingAddress.postalCode', postalCode);
                          }}
                          handleBlur={setFieldTouched}
                          getFieldProps={getFieldProps('billingAddress.address1')}
                          error={Boolean(
                            getIn(touched, 'billingAddress.address1') &&
                              (getIn(errors, 'billingAddress.address1') ||
                                getIn(errors, 'billingAddress.city') ||
                                getIn(errors, 'billingAddress.postalCode') ||
                                getIn(errors, 'billingAddress.country'))
                          )}
                          helperText={
                            getIn(errors, 'billingAddress.address1') ||
                            getIn(errors, 'billingAddress.city') ||
                            getIn(errors, 'billingAddress.postalCode') ||
                            getIn(errors, 'billingAddress.country')
                          }
                        />
                      )}
                      {manualAddress && (
                        <ManualAddressComp
                          getCityProps={getFieldProps('billingAddress.city')}
                          getStateProps={getFieldProps('billingAddress.state')}
                          getCountryProps={getFieldProps('billingAddress.country')}
                          getPostcodeProps={getFieldProps('billingAddress.postalCode')}
                          getFullAddressProps={getFieldProps('billingAddress.address1')}
                          label="Address line 1"
                          touched={{
                            city: getIn(touched, 'billingAddress.city'),
                            state: getIn(touched, 'billingAddress.state'),
                            country: getIn(touched, 'billingAddress.country'),
                            postcode: getIn(touched, 'billingAddress.postalCode'),
                            address: getIn(touched, 'billingAddress.address1')
                          }}
                          errors={{
                            city: getIn(errors, 'billingAddress.city'),
                            state: getIn(errors, 'billingAddress.state'),
                            country: getIn(errors, 'billingAddress.country'),
                            postcode: getIn(errors, 'billingAddress.postalCode'),
                            address: getIn(errors, 'billingAddress.address1')
                          }}
                          setCountry={(val: string) => {
                            setFieldValue('billingAddress.country', val);
                          }}
                        />
                      )}
                    </Stack>
                    <Typography>Card Information</Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                      <Grid item xs={12} md={values.isRepeatPayment ? 6 : 12}>
                        <TextField
                          fullWidth
                          label="Name on card"
                          {...getFieldProps('cardHolderName')}
                          error={Boolean(touched.cardHolderName && errors.cardHolderName)}
                          helperText={touched.cardHolderName && errors.cardHolderName}
                        />
                      </Grid>

                      {values.action !== 'VERIFY' && !values.isRepeatPayment && (
                        <TextField
                          fullWidth
                          placeholder="100.00"
                          value={values.amount}
                          onBlur={() => {
                            setFieldValue('amount', Number(values.amount).toFixed(2));
                          }}
                          error={Boolean(touched.amount && errors.amount)}
                          helperText={touched.amount && errors.amount}
                          onChange={(e) => {
                            if (amountValidation.test(e.target.value)) {
                              setFieldValue('amount', e.target.value);
                            }
                            return false;
                          }}
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
                                      onChange={(e) => setFieldValue('currency', e.target.value)}
                                    >
                                      {currencyarr.map((curr, i) => (
                                        <MenuItem value={curr.code} key={i}>
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
                      )}
                      {values.isRepeatPayment && (
                        <Grid item xs={12} md={6}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                              fullWidth
                              label="Expiration date"
                              placeholder="MM/YY"
                              {...getFieldProps('validity')}
                              onChange={(e) => {
                                const val = formatExpirationDate(e.target.value);
                                setFieldValue('validity', val);
                              }}
                              error={Boolean(touched.validity && errors.validity)}
                              helperText={touched.validity && errors.validity}
                              inputProps={{
                                maxLength: 5
                              }}
                            />
                            <TextField
                              fullWidth
                              label="CVV"
                              {...getFieldProps('cardCVV')}
                              onChange={(e) => {
                                const val = formatCVC(e.target.value, values.cardNumber);
                                setFieldValue('cardCVV', val);
                              }}
                              error={Boolean(touched.cardCVV && errors.cardCVV)}
                              helperText={touched.cardCVV && errors.cardCVV}
                              inputProps={{
                                maxLength: 4
                              }}
                            />
                          </Stack>
                        </Grid>
                      )}
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Grid item xs={12} md={values.isRepeatPayment ? 12 : 6}>
                        <TextField
                          fullWidth
                          placeholder="XXXX XXXX XXXX XXXX"
                          label="Card number"
                          {...getFieldProps('cardNumber')}
                          InputProps={{
                            classes: { input: classes.textFieldStyle },
                            endAdornment: (
                              <InputAdornment position="end">
                                <GetCardIcon name={getCardIssuer(values.cardNumber)} />
                              </InputAdornment>
                            )
                          }}
                          onChange={(e) => {
                            const val = formatCreditCardNumber(e.target.value);
                            const cvv = formatCVC(values.cardCVV.toString(), e.target.value);
                            setFieldValue('cardNumber', val);
                            setFieldValue('cardCVV', cvv);
                          }}
                          error={Boolean(touched.cardNumber && errors.cardNumber)}
                          helperText={touched.cardNumber && errors.cardNumber}
                        />
                      </Grid>

                      {!values.isRepeatPayment && (
                        <Grid item xs={12} md={6}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                              fullWidth
                              label="Expiration date"
                              placeholder="MM/YY"
                              {...getFieldProps('validity')}
                              onChange={(e) => {
                                const val = formatExpirationDate(e.target.value);
                                setFieldValue('validity', val);
                              }}
                              error={Boolean(touched.validity && errors.validity)}
                              helperText={touched.validity && errors.validity}
                              inputProps={{
                                maxLength: 5
                              }}
                            />
                            <TextField
                              fullWidth
                              label="CVV"
                              {...getFieldProps('cardCVV')}
                              onChange={(e) => {
                                const val = formatCVC(e.target.value, values.cardNumber);
                                setFieldValue('cardCVV', val);
                              }}
                              error={Boolean(touched.cardCVV && errors.cardCVV)}
                              helperText={touched.cardCVV && errors.cardCVV}
                              inputProps={{
                                maxLength: 4
                              }}
                            />
                          </Stack>
                        </Grid>
                      )}
                    </Stack>
                    <Box display={{ xs: 'block', md: 'none' }}>
                      <Stack direction={{ xs: 'row', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            variant="contained"
                            color="secondary"
                            onClick={() => {
                              setmodal(true);
                            }}
                          >
                            Preview
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <LoadingButton
                            fullWidth
                            type="submit"
                            variant="contained"
                            loading={isSubmitting}
                          >
                            <LockIcon className={classes.lockicon} /> Charge
                          </LoadingButton>
                        </Grid>
                      </Stack>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} md={5} display={{ xs: 'none', md: 'block' }}>
                {Summarysection(
                  values,
                  classes,
                  isSubmitting,
                  handleSubmit,
                  handleModalClose,
                  user,
                  selectedMerchant,
                  currencyarr
                )}
              </Grid>
            </Grid>

            <Dialog
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              open={modal}
              onClose={handleModalClose}
            >
              <DialogTitle id="form-dialog-title">
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 3, sm: 2 }}
                  className={classes.dialogboxheader}
                >
                  <CloseIcon
                    onClick={() => {
                      handleModalClose();
                    }}
                  />
                </Stack>
              </DialogTitle>
              <DialogContent>
                <Grid item xs={12} md={5}>
                  {Summarysection(
                    values,
                    classes,
                    isSubmitting,
                    handleSubmit,
                    handleModalClose,
                    user,
                    selectedMerchant,
                    currencyarr
                  )}
                </Grid>
              </DialogContent>
            </Dialog>
          </Container>
        </Form>
      </FormikProvider>
    </>
  );
};

export default VTForm;
