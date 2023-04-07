import * as Yup from 'yup';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import {
  makeStyles,
  Card,
  Grid,
  Stack,
  TextField,
  Box,
  Container,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Switch,
  Collapse,
  Autocomplete
} from '@material-ui/core';
import classNames from 'classnames';
import LockIcon from '@material-ui/icons/Lock';
import { experimentalStyled as styled } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import { Form, FormikProvider, useFormik, getIn } from 'formik';
import {
  formatCreditCardNumber,
  formatCVC,
  formatExpirationDate,
  getCardIssuer,
  validateCardNumber
} from 'utils/formatCard';
import { LoadingButton } from '@material-ui/lab';
import { PublicPaylink } from '@customTypes/transaction';
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URLS } from 'utils/constant';
import ZipCodeAddrPicker from 'components/ZipCodeAddrPicker';
import { makePublicPayment } from '_apis_/transaction';
import { ErrorMsg } from 'utils/helpError';
import Page from 'components/Page';
import { useLocation, useNavigate } from 'react-router';
import { PATH_PAGE } from 'routes/paths';
import LoadingScreen from 'components/LoadingScreen';
import LogoGiftAid from 'assets/logo_gift_aid';
import { amountValidation } from 'utils/RegexPatterns';
import { sentenceCase } from 'change-case';
import ManualAddressComp from 'components/ManualAddressComp';
import closeFill from '@iconify/icons-eva/close-fill';
import { MIconButton } from 'components/@material-extend';
import Icon from '@iconify/react';
import publicAxiosInstance from 'utils/publicAxios';
import GetCardIcon from '../GetCardIcons';
import AlreadyPaidScreen from './AlreadyPaidScreen';
import CancelledScreen from './CancelledScreen';

const useStyles = makeStyles((theme) => ({
  image: {
    borderRadius: '14px',
    maxWidth: '15em',
    paddingTop: '10px',
    paddingBottom: '10px'
  },
  cardheader: {
    paddingX: 1,
    textAlign: 'left'
  },
  alignFlexLeft: {
    alignSelf: 'flex-start'
  },
  userName: {
    paddingTop: 2
  },
  transaction: {
    marginBottom: 1
  },
  btnSubmit: {
    width: '100%',
    fontSize: '1.3em'
  },
  btnAddress: {
    width: '100%'
  },
  lockicon: {
    marginRight: '8px',
    color: '#fff'
  },
  colorgrey: {
    color: '#637381'
  },
  cardText: {
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  width50: {
    width: '50%'
  }
}));

type Currency = {
  code: string;
  symbol: string;
};

type InitialState = {
  action: string;
  customerFirstName: string;
  customerLastName: string;
  amount: string;
  customerEmail: string;
  gatewayId: number | null;
  merchantName: string;
  merchantSub: string;
  paylinkId: number | null;
  orderRef: string;
  notes: string;
  merchantId: number | null;
  csId: number | null;
  isRepeatPayment: boolean;
  createdBy: string;
  amountDecision: boolean;
  paylinkSub: {
    defaultGateway: number;
    giftAid: { paylinkGiftAid: boolean };
    userId: {
      logo: string;
    };
  };
  giftAidDetail: {
    firstName: string;
    lastName: string;
    address: string;
    title: string;
    amount: string;
    finalAmount: string;
    margin: number;
  };
};

type CycleState = {
  cycleAmount: string | null;
  cycleCount: number | null;
  cycleDurationUnit: string | null;
};
type SettingType = {
  paylinkGiftAid: boolean;
};

const WrapperStyle = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  marginTop: theme.spacing(5)
}));

const GIFTAID_INITIAL = {
  firstName: '',
  lastName: '',
  address: '',
  title: '',
  amount: '0',
  finalAmount: '0',
  margin: 25
};

const PublicPaylinkForm = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const classes = useStyles();

  const [currency, setCurrency] = useState<Currency>({
    code: '',
    symbol: ''
  });

  const [isCustomCycle, setIsCustomCycle] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [maxInstalments, setMaxInstalments] = useState(0);

  const [initialState, setInitialState] = useState<InitialState>({
    action: '',
    customerFirstName: '',
    customerLastName: '',
    amount: '',
    customerEmail: '',
    gatewayId: null,
    merchantName: '',
    merchantSub: '',
    notes: '',
    paylinkId: null,
    orderRef: '',
    csId: null,
    merchantId: null,
    isRepeatPayment: false,
    createdBy: '',
    amountDecision: false,
    paylinkSub: {
      defaultGateway: 1,
      giftAid: { paylinkGiftAid: false },
      userId: {
        logo: ''
      }
    },
    giftAidDetail: {
      firstName: '',
      lastName: '',
      address: '',
      title: '',
      amount: '0',
      finalAmount: '0',
      margin: 25
    }
  });
  const [settings, setSettings] = useState<SettingType>({ paylinkGiftAid: false });

  const [cycleState, setCycleState] = useState<CycleState>({
    cycleAmount: null,
    cycleCount: null,
    cycleDurationUnit: null
  });
  const [isShowGiftAid, setIsShowGiftAid] = useState(false);
  const [manualAddress, setManualAddress] = useState<boolean>(false);

  const pageURL = useLocation();
  const navigate = useNavigate();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const PublicPaylinkFormSchema = Yup.object().shape({
    customerFirstName: Yup.string().required('First Name is required'),
    customerLastName: Yup.string().required('Last Name is required'),
    customerEmail: Yup.string().required('Email is required').email(),
    billingAddress: Yup.object().shape({
      address1: Yup.string().required('Address is required'),
      country: Yup.string().required('Country is required'),
      city: Yup.string().required('City is required'),
      postalCode: Yup.string().required('Zip Code is required')
    }),

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
      then: Yup.string().required('CVV is required').max(4).min(4, 'Please enter valid CVV'),
      otherwise: Yup.string().required('CVV is required').max(3).min(3, 'Please enter valid CVV')
    }),
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
    amount: Yup.string()
      .trim()
      .matches(amountValidation, 'Must contain number')
      .when('action', {
        is: 'VERIFY',
        otherwise: Yup.string()
          .trim()
          .matches(amountValidation, 'Must contain number')
          .required('Amount is required')
          .test('is-zero', 'Invalid Amount', (value) => {
            if (value !== undefined) return Number(value) > 0;
            return true;
          })
      }),
    merchantName: Yup.string().required('Merchant Name is required').nullable(),
    cycleCount: Yup.number().when('isRepeatPayment', {
      is: true,
      then: Yup.number()
        .min(1, `Cycle count must be greater than or equal to 1`)
        .max(maxInstalments, `Cycle count must be less than or equal to ${maxInstalments}`)
        .required('Instalments is required')
    }),
    token: Yup.boolean().test('is-not-dev', 'Please complete the Recaptcha', (value) => {
      if (value !== undefined && value !== null) {
        if (process.env.REACT_APP_ENV === 'dev') {
          return true;
        }
        return !!value;
      }
      return false;
    })
  });

  const formik = useFormik<PublicPaylink>({
    enableReinitialize: true,
    initialValues: {
      paylinkId: initialState.paylinkId,
      action: initialState.action,
      type: 2,
      currency: currency.code,
      cardHolderName: '',
      customerFirstName: initialState.customerFirstName,
      customerLastName: initialState.customerLastName,
      validity: '',
      billingAddress: {
        address1: '',
        address2: '',
        city: '',
        postalCode: '',
        country: '',
        state: ''
      },
      blink_transaction_type: 'paylink',
      merchantName: initialState.merchantName,
      transactionReference: '',
      amount: initialState.amount,
      cardNumber: '',
      cardCVV: '',
      customerEmail: initialState.customerEmail,
      gatewayId: initialState.gatewayId,
      merchantSub: initialState.merchantSub,
      orderRef: initialState.orderRef,
      description: '',
      isRepeatPayment: initialState.isRepeatPayment,
      cycleCount: maxInstalments,
      giftAidDetail: {
        firstName: '',
        lastName: '',
        address: '',
        title: '',
        amount: '0',
        finalAmount: '0',
        margin: 25
      },
      token: true
    },
    validationSchema: PublicPaylinkFormSchema,
    onSubmit: async (values, { setFieldValue, setSubmitting, resetForm }) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { token, ...rest } = values;
        const cyclePayload = initialState.isRepeatPayment
          ? {
              ...cycleState,
              cycleType: 'fixed',
              cycleCount: values.cycleCount,
              cycleAmount: parseFloat(
                (Number(values.amount) / values.cycleCount).toString()
              ).toFixed(2)
            }
          : {};

        let body = {
          ...rest,
          cardNumber: Number(values.cardNumber.replace(/\s/g, '')),
          cardCVV: Number(values.cardCVV),
          cardExpiryMonth: Number(values.validity.slice(0, 2)),
          cardExpiryYear: Number(values.validity.slice(-2)),
          csId: initialState.csId,
          merchantId: initialState.merchantId,
          isRepeatPayment: initialState.isRepeatPayment,
          createdBy: initialState.createdBy,
          giftAid: settings.paylinkGiftAid,
          ...cyclePayload
        };

        if (!settings.paylinkGiftAid) {
          body = { ...body, giftAidDetail: GIFTAID_INITIAL };
        }

        await makePublicPayment(body);

        resetForm();

        enqueueSnackbar('Payment Successful', { variant: 'success' });
        setSubmitting(false);

        navigate(`/public/transaction/success/${values.orderRef}`);
      } catch (error) {
        if (
          error.error &&
          (error.toString().replace('Error: ', '') === 'Please enter valid card' ||
            error.toString().replace('Error: ', '') === 'Please enter a valid CVV')
        ) {
          enqueueSnackbar(error.toString().replace('Error: ', ''), { variant: 'error' });
        } else {
          enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
        }

        setSubmitting(false);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps, values } =
    formik;

  useEffect(() => {
    const path = pageURL.pathname.split('/paylink/');

    const fetchPaylinkDetails = async (path: string[]) => {
      try {
        const url = `${API_BASE_URLS.paylink}/paylinks/public?token=${path[1]}`;

        const response = await publicAxiosInstance.get(url);

        if (response.data) {
          const {
            action,
            customerEmail,
            customerFirstName,
            customerLastName,
            paylinkSub,
            merchantSub,
            merchantName,
            id,
            notes,
            amount,
            defaultPaylinkCurrency,
            transactionReference,
            merchantId,
            csCustomerId,
            isRepeatPayment,
            createdBy,
            amountDecision
          } = response.data.message.paylink;
          setCurrency(defaultPaylinkCurrency);
          setIsShowGiftAid(paylinkSub.giftAid.paylinkGiftAid);
          setInitialState({
            action,
            customerFirstName,
            customerLastName,
            amount,
            customerEmail,
            notes,
            merchantId,
            isRepeatPayment,
            createdBy,
            amountDecision,
            paylinkSub,
            gatewayId: Number(paylinkSub.defaultGateway),
            merchantName,
            merchantSub,
            paylinkId: id,
            csId: csCustomerId?.id,
            orderRef: transactionReference,
            giftAidDetail: {
              firstName: '',
              lastName: '',
              address: '',
              title: '',
              amount: '0',
              finalAmount: '0',
              margin: 25
            }
          });
          setSettings(response.data.message.paylink.paylinkSub.giftAid);

          if (isRepeatPayment) {
            const { cycleAmount, cycleCount, cycleDurationUnit } = response.data.message.paylink;
            setCycleState({
              cycleAmount,
              cycleCount,
              cycleDurationUnit
            });
            setMaxInstalments(cycleCount);
          }
        }

        setIsLoading(false);
      } catch (error) {
        if (
          error?.response?.status === 404 ||
          error?.response?.data?.error === 'Malformed UTF-8 data'
        ) {
          navigate(PATH_PAGE.page404);
        } else if (
          error?.response?.status === 422 &&
          error?.response?.data?.error === 'Already Paid'
        ) {
          setIsLoading(false);
          setIsPaid(true);
        } else if (
          error?.response?.status === 422 &&
          error?.response?.data?.error === 'Link is has been cancelled by merchant'
        ) {
          setIsLoading(false);
          setIsCancelled(true);
        } else {
          enqueueSnackbar(ErrorMsg(error), {
            variant: 'error'
          });
        }
      }
    };

    fetchPaylinkDetails(path);
  }, [enqueueSnackbar, navigate, pageURL.pathname, setFieldValue]);

  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      return;
    }
    const token = await executeRecaptcha('yourAction');

    try {
      const url = `${API_BASE_URLS.payment}/payment/verifyToken`;

      const { data } = await publicAxiosInstance.post(url, {
        token
      });

      if (data.message?.success) {
        setFieldValue('token', true);
      } else {
        enqueueSnackbar(
          `Couldn't verify the Recaptcha,
        Please reload the page!`,
          {
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            ),
            variant: 'error',
            persist: true
          }
        );
      }
    } catch (error) {
      console.error(error);

      if (process.env.REACT_APP_ENV !== 'dev') {
        setFieldValue(token, false);
        enqueueSnackbar(
          `Couldn't verify the Recaptcha,
          Please reload the page!`,
          {
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            ),
            variant: 'error',
            persist: true
          }
        );
      }
    }
  }, [closeSnackbar, enqueueSnackbar, executeRecaptcha, setFieldValue]);

  useEffect(() => {
    if (process.env.REACT_APP_ENV !== 'dev') {
      handleReCaptchaVerify();
    }
  }, [handleReCaptchaVerify]);

  const handleCustomCycle = () => {
    setIsCustomCycle((prev) => {
      if (errors.cycleCount) return true;
      return !prev;
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isPaid) {
    return <AlreadyPaidScreen />;
  }
  if (isCancelled) {
    return <CancelledScreen />;
  }

  return (
    <Page>
      <Container>
        <WrapperStyle>
          <FormikProvider value={formik}>
            <Form noValidate onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={2} />
                <Grid item xs={12} md={8}>
                  <Card sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      <Stack
                        direction={{ xs: 'column', sm: 'column', md: 'column', lg: 'row' }}
                        spacing={{ xs: 4, sm: 2 }}
                      >
                        <Grid item lg={6} md={12} sm={12} xs={12}>
                          <Typography
                            fontSize="1.2em"
                            fontWeight={200}
                            className={classNames(classes.cardheader, classes.colorgrey)}
                          >
                            Summary
                          </Typography>
                          <Stack>
                            <Stack>
                              <img
                                src={initialState.paylinkSub?.userId?.logo}
                                alt="brandLogo"
                                className={classes.image}
                              />
                            </Stack>
                            <Typography
                              fontWeight={500}
                              fontSize="1em"
                              className={classNames(
                                classes.colorgrey,
                                classes.alignFlexLeft,
                                classes.userName
                              )}
                            >
                              {`${values.customerFirstName}  ${values.customerLastName}`}
                            </Typography>
                            <Typography
                              fontWeight={100}
                              fontSize=".8em"
                              className={classNames(classes.colorgrey, classes.alignFlexLeft)}
                            >
                              {values.customerEmail}
                            </Typography>
                          </Stack>
                          <Stack mt={3}>
                            <Typography
                              fontWeight={100}
                              fontSize=".9em"
                              className={classNames(
                                classes.colorgrey,
                                classes.alignFlexLeft,
                                classes.transaction
                              )}
                            >
                              {sentenceCase(values.action)} Transaction
                            </Typography>
                            <Typography
                              fontWeight={500}
                              fontSize="2.2em"
                              className={classNames(classes.colorgrey, classes.alignFlexLeft)}
                            >
                              {currency.symbol + values.amount}
                            </Typography>
                            <Typography
                              fontWeight={100}
                              fontSize=".8em"
                              className={classNames(classes.colorgrey, classes.alignFlexLeft)}
                            >
                              Reference : {values.orderRef}
                            </Typography>
                          </Stack>
                          {initialState.notes && (
                            <Stack mt={3}>
                              <Card sx={{ p: 4, marginRight: '1.5em' }}>
                                <Typography
                                  fontWeight={500}
                                  className={classNames(classes.colorgrey, classes.alignFlexLeft)}
                                  sx={{ textAlign: 'left', marginBottom: '.7em' }}
                                >
                                  Paylink Notes
                                </Typography>
                                <Typography
                                  fontSize=".8em"
                                  className={classNames(classes.colorgrey)}
                                  sx={{ textAlign: 'left' }}
                                >
                                  {initialState.notes}
                                </Typography>
                              </Card>
                            </Stack>
                          )}
                        </Grid>
                        <Grid item lg={6} md={12} xs={12} sm={12}>
                          <Stack spacing={3}>
                            {!initialState.customerEmail?.trim() && (
                              <Stack spacing={2}>
                                <Typography
                                  fontSize="1.2em"
                                  className={classNames(classes.cardheader, classes.colorgrey)}
                                >
                                  Receipt Email Address
                                </Typography>
                                <TextField
                                  fullWidth
                                  label="Email"
                                  placeholder="Enter email address for Receipt"
                                  {...getFieldProps('customerEmail')}
                                  error={Boolean(touched.customerEmail && errors.customerEmail)}
                                  helperText={touched.customerEmail && errors.customerEmail}
                                  required
                                />
                              </Stack>
                            )}
                            {initialState.amountDecision && (
                              <Stack spacing={2}>
                                <Typography
                                  fontSize="1.2em"
                                  className={classNames(classes.cardheader, classes.colorgrey)}
                                >
                                  Amount
                                </Typography>
                                <TextField
                                  fullWidth
                                  label="Amount"
                                  {...getFieldProps('amount')}
                                  onChange={(event) => {
                                    const { value } = event.target;

                                    if (amountValidation.test(value)) {
                                      setFieldValue('amount', value);
                                    }
                                  }}
                                  value={values.amount}
                                  error={Boolean(touched.amount && errors.amount)}
                                  helperText={touched.amount && errors.amount}
                                />
                              </Stack>
                            )}
                            {initialState.isRepeatPayment && (
                              <Stack spacing={2}>
                                <Typography
                                  fontSize="1.2em"
                                  className={classNames(classes.cardheader, classes.colorgrey)}
                                >
                                  Monthly Installments
                                </Typography>
                                <FormControlLabel
                                  control={
                                    <Switch checked={isCustomCycle} onChange={handleCustomCycle} />
                                  }
                                  label="Modify your Monthly instalments"
                                />
                                {isCustomCycle && (
                                  <>
                                    <TextField
                                      type="number"
                                      inputProps={{
                                        min: 1,
                                        max: maxInstalments
                                      }}
                                      {...getFieldProps('cycleCount')}
                                      error={Boolean(touched.cycleCount && errors.cycleCount)}
                                      helperText={
                                        touched.cycleCount && errors.cycleCount
                                          ? errors.cycleCount
                                          : `${currency.symbol} ${parseFloat(
                                              (Number(values.amount) / values.cycleCount).toString()
                                            ).toFixed(2)} per monthly instalment`
                                      }
                                    />
                                    <Typography
                                      variant="caption"
                                      align="left"
                                      color="textSecondary"
                                    >
                                      Max Instalments allowed: {maxInstalments}
                                    </Typography>
                                  </>
                                )}
                              </Stack>
                            )}
                            <Typography
                              fontSize="1.2em"
                              className={classNames(classes.cardheader, classes.colorgrey)}
                            >
                              Card information
                            </Typography>
                            <Stack>
                              <TextField
                                size="medium"
                                placeholder="XXXX XXXX XXXX XXXX"
                                label="Card number"
                                {...getFieldProps('cardNumber')}
                                InputProps={{
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

                              <Stack my={1} direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                                />
                              </Stack>
                              <Stack my={1} direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField
                                  fullWidth
                                  label="Name on card"
                                  {...getFieldProps('cardHolderName')}
                                  error={Boolean(touched.cardHolderName && errors.cardHolderName)}
                                  helperText={touched.cardHolderName && errors.cardHolderName}
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
                              <Stack
                                my={1}
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={{ xs: 3, sm: 2 }}
                              >
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
                                    getFieldProps={getFieldProps('billingAddress.address1')}
                                    error={Boolean(
                                      (getIn(touched, 'billingAddress.address1') &&
                                        getIn(errors, 'billingAddress.address1')) ||
                                        (getIn(touched, 'billingAddress.city') &&
                                          getIn(errors, 'billingAddress.city')) ||
                                        (getIn(touched, 'billingAddress.postalCode') &&
                                          getIn(errors, 'billingAddress.postalCode')) ||
                                        (getIn(touched, 'billingAddress.country') &&
                                          getIn(errors, 'billingAddress.country'))
                                    )}
                                    helperText={
                                      (getIn(touched, 'billingAddress.address1') &&
                                        getIn(errors, 'billingAddress.address1')) ||
                                      (getIn(touched, 'billingAddress.city') &&
                                        getIn(errors, 'billingAddress.city')) ||
                                      (getIn(touched, 'billingAddress.postalCode') &&
                                        getIn(errors, 'billingAddress.postalCode')) ||
                                      (getIn(touched, 'billingAddress.country') &&
                                        getIn(errors, 'billingAddress.country'))
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
                              {currency.code === 'GBP' && isShowGiftAid && (
                                <Stack
                                  my={1}
                                  direction={{ xs: 'column', sm: 'row' }}
                                  spacing={{ xs: 3, sm: 2 }}
                                >
                                  <Stack>
                                    <FormGroup>
                                      <FormControlLabel
                                        sx={{ textAlign: 'left' }}
                                        control={
                                          <Checkbox
                                            checked={settings?.paylinkGiftAid}
                                            onChange={() => {
                                              if (!settings.paylinkGiftAid) {
                                                setFieldValue('giftAidDetail', {
                                                  ...values.giftAidDetail,
                                                  firstName: initialState.customerFirstName,
                                                  lastName: initialState.customerLastName,
                                                  address: values.billingAddress.address1,
                                                  title: 'Mr',
                                                  amount: initialState.amount,
                                                  finalAmount: String(
                                                    (
                                                      (Number(initialState.amount) *
                                                        values.giftAidDetail.margin) /
                                                      100
                                                    ).toFixed(2)
                                                  )
                                                });
                                              }
                                              setSettings({
                                                ...settings,
                                                paylinkGiftAid: !settings.paylinkGiftAid
                                              });
                                            }}
                                          />
                                        }
                                        label="Yes, I Would Like To Add Gift Aid"
                                      />
                                    </FormGroup>
                                  </Stack>

                                  <Stack>
                                    <LogoGiftAid width={102.4} height={36} />
                                  </Stack>
                                </Stack>
                              )}
                              <Stack my={2}>
                                <Collapse in={settings?.paylinkGiftAid || false}>
                                  <Stack spacing={2}>
                                    <Stack direction={{ sm: 'column', md: 'row' }} spacing={2}>
                                      <Autocomplete
                                        fullWidth
                                        options={['Mr', 'Mrs', 'Ms']}
                                        loading={false}
                                        onChange={(e, val) => {
                                          setFieldValue('giftAidDetail.title', val);
                                        }}
                                        value={getFieldProps('giftAidDetail.title').value}
                                        disableClearable
                                        renderInput={(params) => (
                                          <TextField
                                            {...params}
                                            onKeyDown={(e) => e.preventDefault()}
                                            label="Title"
                                            variant="outlined"
                                            {...getFieldProps('giftAidDetail.title')}
                                            error={Boolean(
                                              getIn(touched, 'giftAidDetail.title') &&
                                                getIn(errors, 'giftAidDetail.title')
                                            )}
                                            helperText={
                                              getIn(touched, 'giftAidDetail.title') &&
                                              getIn(errors, 'giftAidDetail.title')
                                            }
                                            InputProps={{
                                              ...params.InputProps,
                                              endAdornment: <>{params.InputProps.endAdornment}</>
                                            }}
                                          />
                                        )}
                                      />
                                      <TextField
                                        fullWidth
                                        label="First Name"
                                        value={getFieldProps('giftAidDetail.firstName').value}
                                        onChange={(e: any) =>
                                          setFieldValue('giftAidDetail.firstName', e.target.value)
                                        }
                                        error={Boolean(
                                          getIn(touched, 'giftAidDetail.firstName') &&
                                            getIn(errors, 'giftAidDetail.firstName')
                                        )}
                                        helperText={
                                          getIn(touched, 'giftAidDetail.firstName') &&
                                          getIn(errors, 'giftAidDetail.firstName')
                                        }
                                      />
                                    </Stack>
                                    <Stack direction={{ sm: 'column', md: 'row' }} spacing={2}>
                                      <TextField
                                        fullWidth
                                        label="Last name"
                                        value={getFieldProps('giftAidDetail.lastName').value}
                                        onChange={(e: any) =>
                                          setFieldValue('giftAidDetail.lastName', e.target.value)
                                        }
                                        error={Boolean(
                                          getIn(touched, 'giftAidDetail.lastName') &&
                                            getIn(errors, 'giftAidDetail.lastName')
                                        )}
                                        helperText={
                                          getIn(touched, 'giftAidDetail.lastName') &&
                                          getIn(errors, 'giftAidDetail.lastName')
                                        }
                                      />
                                      <TextField
                                        fullWidth
                                        label="Address"
                                        value={getFieldProps('billingAddress.address1').value}
                                        error={Boolean(
                                          getIn(touched, 'giftAidDetail.address') &&
                                            getIn(errors, 'giftAidDetail.address')
                                        )}
                                        helperText={
                                          getIn(touched, 'giftAidDetail.address') &&
                                          getIn(errors, 'giftAidDetail.address')
                                        }
                                        sx={{ pointerEvents: 'none' }}
                                      />
                                    </Stack>
                                  </Stack>
                                </Collapse>
                              </Stack>

                              <Box sx={{ mt: 3 }}>
                                <LoadingButton
                                  type="submit"
                                  variant="contained"
                                  loading={isSubmitting}
                                  className={classes.btnSubmit}
                                >
                                  <LockIcon className="text-white" />
                                  <Stack ml={2}>
                                    Pay{'  '}
                                    {(currency.symbol ? currency.symbol : '£') +
                                      (values.amount ? values.amount : '00:00')}
                                    <Typography variant="subtitle2">
                                      {values.amount &&
                                        settings?.paylinkGiftAid &&
                                        ` + £  ${Number(values.amount) * 0.25} Gift Aid`}
                                    </Typography>
                                  </Stack>
                                </LoadingButton>
                              </Box>
                            </Stack>
                          </Stack>
                        </Grid>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={2} />
              </Grid>
            </Form>
          </FormikProvider>
        </WrapperStyle>
      </Container>
    </Page>
  );
};

export default PublicPaylinkForm;
