import * as Yup from 'yup';
import {
  Card,
  Grid,
  Stack,
  TextField,
  Box,
  Container,
  FormControlLabel,
  Checkbox,
  Typography,
  Collapse,
  Autocomplete,
  InputAdornment,
  FormGroup,
  Button,
  FormControl,
  Select,
  MenuItem
} from '@material-ui/core';
import closeFill from '@iconify/icons-eva/close-fill';
import Icon from '@iconify/react';
import { experimentalStyled as styled } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import { Form, FormikProvider, useFormik, getIn } from 'formik';
import { LoadingButton } from '@material-ui/lab';
import {
  ActionTypes,
  BlinkPageFormState,
  DialogMsgActions,
  DialogMsgState
} from '@customTypes/transaction';
import { useState, useEffect, useCallback, useReducer } from 'react';
import { API_BASE_URLS, COUNTRIES, CountryType, modifyFieldsDataPub } from 'utils/constant';
import axiosInstance from 'utils/axios';
import { makePublicPayment } from '_apis_/transaction';
import ZipCodeAddrPicker from 'components/ZipCodeAddrPicker';
import { ErrorMsg } from 'utils/helpError';
import Page from 'components/Page';
import { useLocation, useParams } from 'react-router';
import LogoGiftAid from 'assets/logo_gift_aid';
import {
  formatCreditCardNumber,
  formatCVC,
  formatExpirationDate,
  getCardIssuer
} from 'utils/formatCard';
import LazySize from 'components/LazySize';
import { pick } from 'lodash';
import OpeningHours from 'components/_dashboard/customiser/preview/OpeningHours';
import { CurrencyType, OpeningHoursParent, Options } from '@customTypes/blinkPages';
import { amountValidation } from 'utils/RegexPatterns';
import useToggle from 'hooks/useToggle';
import LoadingScreen from 'components/LoadingScreen';
import ManualAddressComp from 'components/ManualAddressComp';
import { ErrorDialog, SuccessDialog } from 'components/MessageDialogs';
import { currencyOrder } from 'utils/currencyOrder';
import { MIconButton } from 'components/@material-extend';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import GetCardIcon from '../GetCardIcons';
import BlinkNotFoundScreen from './BlinkNotFoundScreen';

type BlinkPageType = {
  backgroundColor: string;
  customerLogo: string;
  banner: string;
  defaultCurrency: number | null;
  defaultGatewayId: number | null;
  defaultblinkPageCurrency: { id: number | null; name: string; symbol: string; code: string };
  merchantSub: string;
  merchantName: string;
  merchantId: number | null;
  csTxnId: { id: number | null };
  amount: string;
  giftAidDetail: {
    firstName: string;
    lastName: string;
    address: string;
    title: string;
    amount: string;
    finalAmount: string;
    margin: number;
  };
  openingHours: OpeningHoursParent | null;
  receiptRedirectURL: string | null;
  timeout: number;
};

type BlinkOptions = {
  customerFirstName: Options;
  customerLastName: Options;
  customerEmail: Options;
  address1: Options;
  address2: Options;
  city: Options;
  postalCode: Options;
  country: Options;
  state: Options;
  customerPostCode: Options;
  description: Options;
  orderRef: Options;
  amount: Options;
};

const WrapperStyle = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(9),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(6)
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3)
  }
}));

const CardStyle = styled(Card)(({ theme }) => ({
  padding: theme.spacing(8),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(5)
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3)
  },
  backgroundColor: '#F7FCFF'
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
const initialDialogMsgState: DialogMsgState = {
  success: {
    isSuccess: false,
    authCode: null,
    amount: 0,
    cardNumber: 'xxxx',
    customerEmail: '',
    action: '',
    isRepeatPayment: false,
    giftAid: '',
    currency: ''
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
          giftAid: action.payload.giftAid,
          currency: action.payload.currency
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

const PublicBlinkPageForm = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [dialogMsg, dispatch] = useReducer(DialogMsgReducer, initialDialogMsgState);
  const [isLoading, setIsLoading] = useToggle(true);
  const [notFound, setNotFound] = useToggle(false);
  const [blinkOptions, setBlinkOptions] = useState<BlinkOptions>({ ...modifyFieldsDataPub });

  const { search } = useLocation();
  const [blinkPage, setBlinkPage] = useState<BlinkPageType>({
    backgroundColor: '',
    customerLogo: '',
    banner: '',
    defaultCurrency: null,
    defaultGatewayId: null,
    defaultblinkPageCurrency: { id: null, name: '', symbol: '', code: '' },
    merchantSub: '',
    merchantName: '',
    merchantId: null,
    csTxnId: { id: null },
    amount: '',
    giftAidDetail: {
      firstName: '',
      lastName: '',
      address: '',
      title: '',
      amount: '0',
      finalAmount: '0',
      margin: 0
    },
    openingHours: null,
    receiptRedirectURL: null,
    timeout: 0
  });
  const [isGiftAid, setIsGiftAid] = useState(false);
  const [isShowGiftAid, setIsShowGiftAid] = useState(false);
  const [hideManualAddress, setHideManualAddress] = useState(false);
  const [manualAddress, setManualAddress] = useState<boolean>(false);
  const [currencyarr, setCurrencyarr] = useState<CurrencyType[]>([]);

  const { urlSlug } = useParams();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleRedirect = useCallback(() => {
    if (blinkPage.receiptRedirectURL && blinkPage.timeout) {
      setTimeout(
        () => window.open(`${blinkPage.receiptRedirectURL}`, '_self'),
        blinkPage.timeout * 1000
      );
    }
  }, [blinkPage.receiptRedirectURL, blinkPage.timeout]);

  const PublicBlinkPageSchema = Yup.object().shape({
    customerFirstName: Yup.string().test('is-required', 'First Name is required', (value) => {
      if (
        blinkOptions.customerFirstName.required &&
        blinkOptions.customerFirstName.visible &&
        !value
      )
        return false;
      return true;
    }),
    customerLastName: Yup.string().test('is-required', 'Last Name is required', (value) => {
      if (blinkOptions.customerLastName.required && blinkOptions.customerLastName.visible && !value)
        return false;
      return true;
    }),
    customerEmail: Yup.string()
      .test('is-required', 'Email is required', (value) => {
        if (blinkOptions.customerEmail.required && blinkOptions.customerEmail.visible && !value)
          return false;
        return true;
      })
      .email('Please enter a valid Email'),
    billingAddress: Yup.object().shape({
      address1: Yup.string().required('Address 1 is required'),
      country: Yup.string().required('country is required'),
      city: Yup.string().required('City is required'),
      postalCode: Yup.string().required('Zip Code is required')
    }),
    cardHolderName: Yup.string().required('Card Name is required'),
    cardNumber: Yup.string().required('Card Number is required'),
    cardCVV: Yup.string().when('cardNumber', {
      is: (cardNumber: string) => getCardIssuer(cardNumber) === 'amex',
      then: Yup.string().required().max(4).min(4, 'Please enter valid CVV'),
      otherwise: Yup.string().required().max(3).min(3, 'Please enter valid CVV')
    }),
    orderRef: Yup.string()
      .test('is-required', 'Order Reference is required', (value) => {
        if (blinkOptions.orderRef.required && blinkOptions.orderRef.visible && !value) return false;
        return true;
      })
      .max(50, 'Only 50 Characters allowed'),
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
      .required('Amount is required')
      .test('is-zero', 'Amount must be greater than 0.00', (value) => {
        if (value !== undefined) return Number(value) > 0;
        return true;
      }),
    description: Yup.string()
      .max(150, 'Only 150 characters allowed')
      .test('is-required', 'Description is required', (value) => {
        if (blinkOptions.description.required && blinkOptions.description.visible && !value)
          return false;
        return true;
      })
  });

  const formik = useFormik<BlinkPageFormState>({
    enableReinitialize: true,
    initialValues: {
      action: blinkPage.defaultGatewayId === 1 ? 'SALE' : 'Payment',
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
      customerLogo: blinkPage.customerLogo,
      banner: blinkPage.banner,
      orderRef: '',
      blink_transaction_type: 'blinkPage',
      merchantName: blinkPage.merchantName,
      transactionUnique: '',
      amount: '',
      cardNumber: '',
      cardCVV: '',
      customerEmail: '',
      gatewayId: blinkPage.defaultGatewayId,
      merchantSub: blinkPage.merchantSub,
      giftAid: false,
      description: '',
      merchantId: blinkPage.merchantId,
      giftAidDetail: {
        firstName: '',
        lastName: '',
        address: '',
        title: '',
        amount: '0',
        finalAmount: '0',
        margin: 25
      }
    },
    validationSchema: PublicBlinkPageSchema,
    onSubmit: async (values, { setFieldValue, setSubmitting, resetForm }) => {
      try {
        // TODO: Add Default name and address
        let body = {
          ...values,
          cardNumber: Number(values.cardNumber.replace(/ /g, '')),
          cardCVV: Number(values.cardCVV),
          cardExpiryMonth: Number(values.validity.slice(0, 2)),
          cardExpiryYear: Number(values.validity.slice(-2)),
          csId: blinkPage.csTxnId?.id,
          giftAid: isGiftAid,
          amount: values.amount.toString(),
          isRepeatPayment: false
        };

        if (!isGiftAid) {
          body = { ...body, giftAidDetail: GIFTAID_INITIAL };
        }

        await makePublicPayment(body);

        resetForm();
        enqueueSnackbar('Payment Successful', { variant: 'success' });
        dispatch({
          type: ActionTypes.showSuccess,
          payload: {
            authCode: 'success',
            amount: values.amount,
            cardNumber: values.cardNumber.slice(-4),
            customerEmail: values.customerEmail,
            action: values.action,
            giftAid: values.giftAidDetail.finalAmount,
            currency: values.currency
          }
        });
      } catch (error) {
        console.error(error);

        enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
        dispatch({
          type: ActionTypes.showError,
          payload: {
            errorMsg: ErrorMsg(error)
          }
        });
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue, values } =
    formik;

  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      return;
    }
    const token = await executeRecaptcha();

    try {
      const url = `${API_BASE_URLS.payment}/payment/verifyToken`;

      const { data } = await axiosInstance.post(url, {
        token
      });

      if (data?.success) {
        setFieldValue(token, true);
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
            variant: 'error'
          }
        );
      }
    }
  }, [closeSnackbar, enqueueSnackbar, executeRecaptcha, setFieldValue]);

  useEffect(() => {
    const fetchBlinkPageDetails = async () => {
      try {
        const url = `${API_BASE_URLS.blinkpage}/blinkpages/public?urlSlug=${urlSlug}`;

        const response = await axiosInstance.get(url);

        if (response.data) {
          setBlinkPage({
            ...response.data.message.slug
          });
          response.data.settings && setIsShowGiftAid(response.data.settings.blinkPageGiftAid);

          const orderedCurrency = currencyOrder(response.data.message.slug.blinkPageCurrency);

          setCurrencyarr(orderedCurrency);

          const { fields } = response.data.message.slug;

          const amountField = {
            amount: fields?.rawAmount
          };

          const usableFields = {
            ...amountField,
            ...pick(fields, [
              'customerFirstName',
              'customerLastName',
              'customerEmail',
              'description',
              'orderRef'
            ])
          };
          const params = new URLSearchParams(search);

          const addressFields = pick(
            fields?.customerAddress,
            'address1',
            'address2',
            'city',
            'postalCode',
            'country',
            'state'
          );

          const updatedOptions: { [k: string]: any } = {};
          for (const [key, value] of Object.entries(usableFields)) {
            const {
              descriptorValue,
              descriptorPlaceHolder,
              displayNameValue,
              displayNamePlaceHolder,
              visible,
              required,
              readOnly
            } = value;
            const val = descriptorValue || descriptorPlaceHolder;
            const label = displayNameValue || displayNamePlaceHolder;

            let isReadOnly = false;

            const urlVal = params.get(val);
            if (urlVal) {
              // Ensure only digits are accepted for the amount field
              if (key === 'amount' && Number(urlVal)) {
                setFieldValue('amount', Number(urlVal).toFixed(2));
              }
              if (key !== 'amount') {
                setFieldValue(key, urlVal);
              }
              isReadOnly = readOnly === '1';
            }

            updatedOptions[key] = {
              visible: visible === '1',
              label,
              required: required === '1',
              readOnly: isReadOnly
            };
          }

          let isManual = false;
          let hideManual = false;

          for (const [key, value] of Object.entries(addressFields)) {
            const {
              descriptorValue,
              descriptorPlaceHolder,
              displayNameValue,
              displayNamePlaceHolder,
              visible,
              required,
              readOnly
            } = value;
            const val = descriptorValue || descriptorPlaceHolder;
            const label = displayNameValue || displayNamePlaceHolder;

            let isReadOnly = false;
            const urlVal = params.get(val);
            if (urlVal) {
              // Check for the valid country code
              if (key === 'country') {
                const countryCode = COUNTRIES.find(
                  (country: CountryType) =>
                    country?.code?.toLowerCase() === urlVal.toLowerCase() ||
                    country?.label?.toLowerCase() === urlVal.toLowerCase()
                );

                if (countryCode) {
                  setFieldValue(`billingAddress[${key}]`, countryCode.code);
                }
              } else {
                setFieldValue(`billingAddress[${key}]`, urlVal);
              }
              isReadOnly = readOnly === '1';
              if (!isManual) {
                isManual = true;
              }
              if (isReadOnly && !hideManual) {
                hideManual = true;
              }
            }

            updatedOptions[key] = {
              visible: visible === '1',
              label,
              required: required === '1',
              readOnly: isReadOnly
            };
          }

          setBlinkOptions((prev) => ({
            ...prev,
            ...updatedOptions
          }));

          if (isManual) {
            setManualAddress(true);
          }
          if (hideManual) {
            setHideManualAddress(true);
          }
        }
      } catch (error) {
        console.error(error);

        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlinkPageDetails();
  }, [enqueueSnackbar, search, setFieldValue, setIsLoading, setNotFound, urlSlug]);

  useEffect(() => {
    if (process.env.REACT_APP_ENV !== 'dev') {
      handleReCaptchaVerify();
    }
  }, [handleReCaptchaVerify]);

  if (isLoading) {
    return <LoadingScreen />;
  }
  if (!isLoading && notFound) {
    return (
      <Page title="Blink Page | Not Found">
        <BlinkNotFoundScreen />
      </Page>
    );
  }

  return (
    <Page
      sx={{
        backgroundColor: blinkPage.backgroundColor,
        minHeight: '100vh'
      }}
      title={blinkPage.merchantName}
    >
      <SuccessDialog open={dialogMsg.success.isSuccess} details={dialogMsg.success}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => {
            handleRedirect();
            dispatch({
              type: ActionTypes.resetAll
            });
            blinkPage.timeout && blinkPage.receiptRedirectURL && setIsLoading(true);
          }}
        >
          Close
        </Button>
      </SuccessDialog>
      <ErrorDialog
        open={dialogMsg.error.isError}
        errorMsg={dialogMsg.error.errorMsg}
        closeAction={dispatch}
      />
      <Container
        maxWidth="lg"
        sx={{
          height: '100%'
        }}
      >
        <WrapperStyle>
          <FormikProvider value={formik}>
            <Form noValidate onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <Stack direction="column" spacing={{ xs: 2, sm: 3 }} justifyContent="center">
                  {values.customerLogo && (
                    <Box display="flex" justifyContent="center">
                      <LazySize
                        alt="main_logo"
                        src={values.customerLogo}
                        sx={{
                          maxHeight: '250px',
                          maxWidth: '250px'
                        }}
                      />
                    </Box>
                  )}
                </Stack>
                <CardStyle>
                  <Stack spacing={{ xs: 4, sm: 5 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                          <Stack spacing={2}>
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              spacing={{ xs: 3, sm: 2 }}
                            >
                              {blinkOptions.customerFirstName.visible && (
                                <TextField
                                  fullWidth
                                  label={blinkOptions.customerFirstName.label || 'First Name'}
                                  {...getFieldProps('customerFirstName')}
                                  error={Boolean(
                                    touched.customerFirstName && errors.customerFirstName
                                  )}
                                  helperText={touched.customerFirstName && errors.customerFirstName}
                                  required={
                                    blinkOptions.customerFirstName.required &&
                                    blinkOptions.customerFirstName.visible
                                  }
                                  InputProps={{
                                    readOnly: blinkOptions.customerFirstName.readOnly
                                  }}
                                />
                              )}
                              {blinkOptions.customerLastName.visible && (
                                <TextField
                                  fullWidth
                                  label={blinkOptions.customerLastName.label || 'Last Name'}
                                  {...getFieldProps('customerLastName')}
                                  error={Boolean(
                                    touched.customerLastName && errors.customerLastName
                                  )}
                                  helperText={touched.customerLastName && errors.customerLastName}
                                  required={
                                    blinkOptions.customerLastName.required &&
                                    blinkOptions.customerLastName.visible
                                  }
                                  InputProps={{
                                    readOnly: blinkOptions.customerLastName.readOnly
                                  }}
                                />
                              )}
                            </Stack>
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              spacing={{ xs: 3, sm: 2 }}
                            >
                              {blinkOptions.customerEmail.visible && (
                                <TextField
                                  fullWidth
                                  label={blinkOptions.customerEmail.label || 'Email'}
                                  {...getFieldProps('customerEmail')}
                                  error={Boolean(touched.customerEmail && errors.customerEmail)}
                                  helperText={touched.customerEmail && errors.customerEmail}
                                  required={
                                    blinkOptions.customerEmail.required &&
                                    blinkOptions.customerEmail.visible
                                  }
                                  InputProps={{
                                    readOnly: blinkOptions.customerEmail.readOnly
                                  }}
                                />
                              )}
                              {blinkOptions.orderRef.visible && (
                                <TextField
                                  fullWidth
                                  label={blinkOptions.orderRef.label || 'Order Reference'}
                                  {...getFieldProps('orderRef')}
                                  error={Boolean(touched.orderRef && errors.orderRef)}
                                  helperText={touched.orderRef && errors.orderRef}
                                  required={
                                    blinkOptions.orderRef.required && blinkOptions.orderRef.visible
                                  }
                                  InputProps={{
                                    readOnly: blinkOptions.orderRef.readOnly
                                  }}
                                />
                              )}
                            </Stack>
                          </Stack>

                          <Stack spacing={2}>
                            <Stack spacing={2}>
                              {blinkOptions.description.visible && (
                                <Stack
                                  direction={{ xs: 'column', sm: 'row' }}
                                  spacing={{ xs: 3, sm: 2 }}
                                >
                                  <TextField
                                    fullWidth
                                    multiline
                                    label={blinkOptions.description.label || 'Description'}
                                    {...getFieldProps('description')}
                                    error={Boolean(touched.description && errors.description)}
                                    helperText={touched.description && errors.description}
                                    required={
                                      blinkOptions.description.required &&
                                      blinkOptions.description.visible
                                    }
                                    InputProps={{
                                      readOnly: blinkOptions.description.readOnly
                                    }}
                                    maxRows={3}
                                  />
                                </Stack>
                              )}
                            </Stack>
                            <Stack spacing={1}>
                              <Stack
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
                                      setFieldValue('billingAddress.state', '');
                                      setFieldValue('billingAddress.city', city);
                                      setFieldValue('billingAddress.postalCode', postalCode);
                                    }}
                                    label="Enter Address"
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
                                    readonlyData={{
                                      address1: blinkOptions.address1,
                                      address2: blinkOptions.address2,
                                      city: blinkOptions.city,
                                      country: blinkOptions.country,
                                      state: blinkOptions.state,
                                      postalCode: blinkOptions.postalCode
                                    }}
                                  />
                                )}
                              </Stack>
                              {!hideManualAddress && (
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
                              )}
                            </Stack>
                          </Stack>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                          <TextField
                            fullWidth
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
                            placeholder="Amount *"
                            value={values.amount}
                            error={Boolean(touched.amount && errors.amount)}
                            helperText={touched.amount && errors.amount}
                            InputLabelProps={{
                              shrink: true
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  {currencyarr.length > 1 && (
                                    <FormControl variant="outlined">
                                      <Select
                                        value={
                                          currencyarr.find((curr) => curr.code === values.currency)
                                            ?.symbol
                                        }
                                        disabled={values.merchantName === ''}
                                        onChange={(e) => {
                                          setFieldValue(
                                            'currency',
                                            currencyarr.find(
                                              (obj: any) => obj.symbol === e.target.value
                                            )?.code
                                          );
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
                              },
                              readOnly: blinkOptions.amount.readOnly
                            }}
                            required
                          />

                          <TextField
                            fullWidth
                            label="Name on card"
                            {...getFieldProps('cardHolderName')}
                            error={Boolean(touched.cardHolderName && errors.cardHolderName)}
                            helperText={touched.cardHolderName && errors.cardHolderName}
                            required
                          />

                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                              fullWidth
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
                              required
                            />
                          </Stack>
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
                              required
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
                              required
                            />
                          </Stack>
                        </Stack>
                      </Grid>
                    </Grid>
                    {isShowGiftAid && (
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                        <Stack>
                          <FormControlLabel
                            sx={{ textAlign: 'left' }}
                            control={
                              <Checkbox
                                checked={isGiftAid}
                                onChange={(e) => {
                                  if (!isGiftAid) {
                                    setFieldValue('giftAidDetail', {
                                      ...values.giftAidDetail,
                                      firstName: values.customerFirstName,
                                      lastName: values.customerLastName,
                                      address: values.billingAddress.address1,
                                      title: 'Mr',
                                      amount: values.amount,
                                      finalAmount: String(
                                        (
                                          (Number(values.amount) * values.giftAidDetail.margin) /
                                          100
                                        ).toFixed(2)
                                      )
                                    });
                                  }

                                  setIsGiftAid(!isGiftAid);
                                }}
                              />
                            }
                            label="Yes, I Would Like To Add Gift Aid"
                          />
                        </Stack>
                        <Stack sx={{ alignSelf: 'center' }}>
                          <LogoGiftAid width={102.4} height={36} />
                        </Stack>
                      </Stack>
                    )}
                    <Stack>
                      <Collapse in={isGiftAid}>
                        <Stack spacing={3}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                              onChange={(e) => {
                                setFieldValue('giftAidDetail.firstName', e.target.value);
                              }}
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
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                              fullWidth
                              label="Last name"
                              value={getFieldProps('giftAidDetail.lastName').value}
                              onChange={(e) => {
                                setFieldValue('giftAidDetail.lastName', e.target.value);
                              }}
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
                              value={values.billingAddress.address1}
                              onChange={(e) => {
                                setFieldValue('giftAidDetail.address', e.target.value);
                              }}
                              error={Boolean(
                                getIn(touched, 'giftAidDetail.address') &&
                                  getIn(errors, 'giftAidDetail.address')
                              )}
                              helperText={
                                getIn(touched, 'giftAidDetail.address') &&
                                getIn(errors, 'giftAidDetail.address')
                              }
                            />
                          </Stack>
                          <Stack
                            direction={{ xs: 'column' }}
                            sx={{ textAlign: 'center' }}
                            spacing={2}
                          >
                            <Typography variant="h4" lineHeight="1em">
                              {values.amount && `Total Amount: £ ${values.amount}`}
                            </Typography>
                            <Typography variant="subtitle1" lineHeight="1em">
                              {values.amount
                                ? `+ £ ${(
                                    Number(values.amount) *
                                    Number(values.giftAidDetail.margin / 100)
                                  ).toFixed(2)} Gift Aid`
                                : ''}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Collapse>
                    </Stack>
                    <Stack spacing={5}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <LoadingButton
                          type="submit"
                          variant="contained"
                          loading={isSubmitting}
                          size="large"
                        >
                          Process Payment
                        </LoadingButton>
                      </Box>
                      <Stack direction="column" spacing={5} justifyContent="center">
                        {blinkPage.openingHours && (
                          <OpeningHours isPublic={true} publicData={blinkPage.openingHours} />
                        )}
                        {values.banner && (
                          <Box display="flex" justifyContent="center" flexGrow={2}>
                            <LazySize
                              alt="banner_logo"
                              src={values.banner}
                              sx={{
                                borderRadius: 1,
                                maxHeight: '275px',
                                maxWidth: '750px',
                                width: '100%',
                                height: '100%'
                              }}
                            />
                          </Box>
                        )}
                      </Stack>
                    </Stack>
                  </Stack>
                </CardStyle>
              </Stack>
            </Form>
          </FormikProvider>
        </WrapperStyle>
      </Container>
    </Page>
  );
};

export default PublicBlinkPageForm;
