import {
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS, CURRENCY } from 'utils/constant';
import { ErrorMsg, gcError } from 'utils/helpError';
import { amountValidation } from 'utils/RegexPatterns';
import * as Yup from 'yup';

type SubscriptionSchemaDef = {
  id?: string;
  amount: string;
  currency: string;
  description: string;
  mandate: string;
  name: string;
  intervalUnit: string;
  month: string | null;
  dayOfMonth: number | null;
};
type PropTypes = {
  sbscModalOpen: boolean;
  setSbscModalOpen: () => void;
  selectedCustomer: { id: string; name: string };
  subscriptionDetails?: SubscriptionSchemaDef | null;
};

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december'
];

const GCSubscriptionPopUp = (props: PropTypes) => {
  const { user } = useAuth();
  const { sbscModalOpen, setSbscModalOpen, selectedCustomer, subscriptionDetails } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [customerMandates, setCustomerMandates] = useState([]);
  const [currencyarr, setCurrencyarr] = useState([]);
  const [initialSubDetails, setInitialSubDetails] = useState<SubscriptionSchemaDef>({
    amount: '',
    currency: 'GBP',
    description: '',
    mandate: '',
    name: selectedCustomer.name,
    intervalUnit: '',
    month: MONTHS[0],
    dayOfMonth: 1
  });
  const [mandate, setMandate] = useState<any>({ id: '', name: '' });
  const [currency, setCurrency] = useState<any>({
    symbol: CURRENCY.GBP.symbol,
    code: CURRENCY.GBP.code
  });

  // -HANDLERS

  const handleRecurring = (val: string) => {
    if (val === 'None') {
      val = '';
    }
    if (val === 'weekly') {
      setFieldValue('dayOfMonth', null);
    } else {
      setFieldValue('dayOfMonth', 1);
    }
    setFieldValue('intervalUnit', val);
  };

  // -USEEFFECTS

  useEffect(() => {
    // -SETTING MANDATE
    const setSubscription = async () => {
      if (subscriptionDetails) {
        const { amount, currency, description, mandate, name, intervalUnit, month, dayOfMonth } =
          subscriptionDetails;
        setInitialSubDetails((prevState) => ({
          ...prevState,
          amount,
          currency,
          description,
          mandate,
          name,
          intervalUnit,
          month,
          dayOfMonth
        }));
        const mandateObj: any = customerMandates.find((obj: any) => obj.id === mandate);
        setMandate({ id: mandate, name: mandateObj?.reference || '' });
        const currencyObj: any = currencyarr.find((obj: any) => obj.symbol === currency);
        setCurrency({ symbol: currency, code: currencyObj?.code });
      } else {
        setInitialSubDetails((prevState) => ({
          ...prevState,
          amount: '',
          currency: 'GBP',
          description: '',
          mandate: '',
          name: selectedCustomer.name,
          intervalUnit: '',
          month: MONTHS[0],
          dayOfMonth: 1
        }));
        setMandate({ id: '', name: '' });
        setCurrency({ symbol: CURRENCY.GBP.symbol, code: CURRENCY.GBP.code });
      }
    };

    if (selectedCustomer && sbscModalOpen) {
      setSubscription();
    }
  }, [customerMandates, currencyarr, sbscModalOpen, selectedCustomer, subscriptionDetails]);

  // -FORMIK
  const SubscriptionSchema = Yup.object().shape({
    amount: Yup.string().required('amount is required'),
    currency: Yup.string().required('Currency is required'),
    mandate: Yup.string().required('Mandate is required'),
    name: Yup.string().required('Name is required')
  });

  const formik = useFormik<SubscriptionSchemaDef>({
    enableReinitialize: true,
    initialValues: initialSubDetails,
    validationSchema: SubscriptionSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const { dayOfMonth, month, intervalUnit, ...rest } = values;
        let body: any = { ...rest, intervalUnit };
        if (intervalUnit) {
          if (intervalUnit === 'monthly') {
            body = { ...body, dayOfMonth };
          } else if (intervalUnit === 'yearly') {
            body = { ...body, dayOfMonth, month };
          }
        }

        if (subscriptionDetails?.id) {
          const url = `${API_BASE_URLS.goCardless}/gocardless/customers/${selectedCustomer.id}/subscriptions/${subscriptionDetails?.id}`;
          await axiosInstance.put(url, {
            name: values.name,
            amount: String(values.amount)
          });
          enqueueSnackbar('Subscription updated!', { variant: 'success' });
        } else {
          const url = `${API_BASE_URLS.goCardless}/gocardless/customers/${selectedCustomer.id}/subscriptions`;
          await axiosInstance.post(url, {
            ...body,
            amount: String(values.amount)
          });
          enqueueSnackbar('Subscription created!', { variant: 'success' });
        }

        setSbscModalOpen();
        setSubmitting(false);
        resetForm();
      } catch (err) {
        console.error(err);
        setSubmitting(false);
        enqueueSnackbar(gcError(err), {
          variant: 'error'
        });
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
    resetForm
  } = formik;

  useEffect(() => {
    const fetchCustomerMandates = async () => {
      try {
        setIsLoading(true);
        const url = `${API_BASE_URLS.goCardless}/gocardless/customers/${selectedCustomer.id}/mandates/`;
        const { data } = await axiosInstance.get(url);

        setCustomerMandates(data.message);
      } catch (error) {
        enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    // -GET API CALLS

    const fetchDefaultCurrency = async (merchantSub: string, gatewayId: number | null) => {
      try {
        const url = `${API_BASE_URLS.blinkpage}/blinkpages/${merchantSub}/currencies/${gatewayId}`;

        const response = await axiosInstance.get(url);

        if (response.data.message?.blinkPageCurrency) {
          setCurrencyarr(response.data.message.blinkPageCurrency);
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
      }
    };

    if (selectedCustomer && sbscModalOpen) {
      fetchCustomerMandates();
      fetchDefaultCurrency(user?.userSub, user?.gatewayId);
    }
  }, [
    selectedCustomer,
    sbscModalOpen,
    enqueueSnackbar,
    setFieldValue,
    user?.userSub,
    user?.gatewayId
  ]);

  return (
    <Dialog open={sbscModalOpen}>
      <DialogTitle>
        {subscriptionDetails ? 'Update' : 'Create'} subscription for {selectedCustomer.name}
      </DialogTitle>
      <DialogContent>
        <FormikProvider value={formik}>
          <Form noValidate onSubmit={handleSubmit}>
            <Stack spacing={{ xs: 3, sm: 2 }}>
              <TextField
                fullWidth
                label="Name"
                {...getFieldProps('name')}
                error={Boolean(touched.name && errors.name)}
                helperText={touched.name && errors.name}
              />
              <TextField
                fullWidth
                label="Amount"
                value={values.amount}
                onBlur={() => {
                  setFieldValue('amount', Number(values.amount).toFixed(2));
                }}
                onChange={(e) => {
                  if (amountValidation.test(e.target.value)) {
                    setFieldValue(`amount`, e.target.value);
                  }
                  return false;
                }}
                error={Boolean(touched.amount && errors.amount)}
                helperText={touched.amount && errors.amount}
              />

              <Autocomplete
                fullWidth
                disabled={!!subscriptionDetails}
                onChange={(e, val) => {
                  if (val) {
                    setFieldValue('currency', val?.code);
                    setCurrency((prevState: any) => ({
                      ...prevState,
                      code: val.code,
                      symbol: val.symbol
                    }));
                  }
                }}
                options={currencyarr}
                getOptionLabel={(option: any) => `${option?.code} / ${option?.symbol}`}
                loading={isLoading}
                disableClearable
                value={currency}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={Boolean(touched.currency && errors.currency)}
                    helperText={touched.currency && errors.currency}
                    onKeyDown={(e) => e.preventDefault()}
                    label="Select Currency"
                    variant="outlined"
                    {...getFieldProps('currency')}
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
              <Autocomplete
                fullWidth
                disabled={!!subscriptionDetails}
                onChange={(e, val) => {
                  if (val) {
                    if (val === 'none') {
                      val = '';
                    }
                    handleRecurring(val);
                  }
                }}
                options={
                  values.intervalUnit
                    ? ['weekly', 'monthly', 'yearly', 'none']
                    : ['weekly', 'monthly', 'yearly']
                }
                getOptionLabel={(option) => option.toUpperCase()}
                value={values.intervalUnit}
                loading={isLoading}
                disableClearable
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={Boolean(touched.intervalUnit && errors.intervalUnit)}
                    helperText={touched.intervalUnit && errors.intervalUnit}
                    label="Select Interval"
                    variant="outlined"
                    onKeyDown={(e) => e.preventDefault()}
                    value={values.intervalUnit}
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
              {values.intervalUnit && values.intervalUnit !== 'weekly' && (
                <Stack direction="row" spacing={2}>
                  {values.intervalUnit === 'yearly' && (
                    <Autocomplete
                      disabled={!!subscriptionDetails}
                      fullWidth
                      onChange={(e: any, val) => {
                        val && setFieldValue('month', val);
                      }}
                      options={MONTHS}
                      getOptionLabel={(option) =>
                        option.replace(option.charAt(0), option.charAt(0).toUpperCase())
                      }
                      value={values.month || MONTHS[0]}
                      loading={isLoading}
                      disableClearable
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={Boolean(touched.month && errors.month)}
                          helperText={touched.month && errors.month}
                          onKeyDown={(e) => e.preventDefault()}
                          label="Month"
                          variant="outlined"
                          {...getFieldProps('month')}
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
                  {(values.intervalUnit === 'monthly' || values.intervalUnit === 'yearly') && (
                    <Autocomplete
                      disabled={!!subscriptionDetails}
                      fullWidth
                      onChange={(e: any, val) => {
                        val && setFieldValue('dayOfMonth', Number(val));
                      }}
                      options={Array.from({ length: 29 }, (v, i) => (i + 1).toString())}
                      loading={isLoading}
                      disableClearable
                      value={String(values.dayOfMonth) || '1'}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={Boolean(touched.dayOfMonth && errors.dayOfMonth)}
                          helperText={touched.dayOfMonth && errors.dayOfMonth}
                          onKeyDown={(e) => e.preventDefault()}
                          label="Day Of Month"
                          variant="outlined"
                          {...getFieldProps('dayOfMonth')}
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
                </Stack>
              )}
              <Autocomplete
                disabled={!!subscriptionDetails}
                fullWidth
                onChange={(e, val) => {
                  if (val) {
                    setFieldValue('mandate', val.id);
                    setMandate((prevState: any) => ({
                      ...prevState,
                      ...val
                    }));
                  }
                }}
                options={customerMandates.map((mandate: { id: string; reference: string }) => ({
                  id: mandate.id,
                  name: mandate.reference
                }))}
                getOptionLabel={(option) => option.name}
                value={mandate}
                loading={isLoading}
                disableClearable
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={Boolean(touched.mandate && errors.mandate)}
                    helperText={touched.mandate && errors.mandate}
                    label="Select mandate"
                    variant="outlined"
                    onKeyDown={(e) => e.preventDefault()}
                    {...getFieldProps('mandate')}
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
            </Stack>
            <DialogActions>
              <Button
                onClick={() => {
                  setSbscModalOpen();
                  resetForm();
                }}
              >
                Cancel
              </Button>

              <LoadingButton fullWidth type="submit" variant="contained" loading={isSubmitting}>
                {subscriptionDetails?.id ? 'Save' : 'Create Subscription'}
              </LoadingButton>
            </DialogActions>
          </Form>
        </FormikProvider>
      </DialogContent>
    </Dialog>
  );
};

export default GCSubscriptionPopUp;
