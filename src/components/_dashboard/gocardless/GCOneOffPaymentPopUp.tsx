import * as Yup from 'yup';
import {
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@material-ui/core';
import { LoadingButton, LocalizationProvider, DatePicker } from '@material-ui/lab';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';

import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { API_BASE_URLS } from 'utils/constant';
import axiosInstance from 'utils/axios';
import { ErrorMsg, gcError } from 'utils/helpError';
import { Form, FormikProvider, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { amountValidation } from 'utils/RegexPatterns';
import { fDateHyphen, fDateMonthDb } from 'utils/formatTime';

type PropTypes = {
  oopModalOpen: boolean;
  setOopModalOpen: () => void;
  selectedCustomer: { id: string; name: string };
};

type OneOffPaymentSchemaDef = {
  amount: string;
  currency: string;
  description: string;
  mandate: string;
  chargeDate: Date;
};

const TODAY = new Date();

const GCOneOffPaymentPopUp = (props: PropTypes) => {
  const { user } = useAuth();
  const { oopModalOpen, setOopModalOpen, selectedCustomer } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [todaySelected, setTodaySelected] = useState('true');
  const [customerMandates, setCustomerMandates] = useState([]);
  const [currencyarr, setCurrencyarr] = useState([]);

  const [nextDate, setNextDate] = useState(fDateHyphen(TODAY));

  const OneOffPaymentSchema = Yup.object().shape({
    amount: Yup.string().required('amount is required'),
    currency: Yup.string().required('Currency is required'),
    mandate: Yup.string().required('Mandate is required'),
    chargeDate: Yup.string().required('date is required')
  });

  const formik = useFormik<OneOffPaymentSchemaDef>({
    initialValues: {
      amount: '0.00',
      currency: 'GBP',
      description: '',
      mandate: '',
      chargeDate: TODAY
    },
    validationSchema: OneOffPaymentSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const url = `${API_BASE_URLS.goCardless}/gocardless/customers/${selectedCustomer.id}/payments`;

        const postData = {
          ...values,
          chargeDate: fDateMonthDb(values.chargeDate)
        };

        await axiosInstance.post(url, postData);
        setOopModalOpen();
        setSubmitting(false);
        enqueueSnackbar('One-off Payment Created!', {
          variant: 'success'
        });
      } catch (err) {
        console.error(err);
        setSubmitting(false);
        enqueueSnackbar(gcError(err), {
          variant: 'error'
        });
      }
    }
  });

  const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } =
    formik;

  useEffect(() => {
    const fetchCustomerMandates = async () => {
      try {
        setIsLoading(true);
        const url = `${API_BASE_URLS.goCardless}/gocardless/customers/${selectedCustomer.id}/mandates`;
        const { data } = await axiosInstance.get(url);

        setCustomerMandates(data.message);
      } catch (error) {
        enqueueSnackbar(gcError(error), { variant: 'error' });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDefaultCurrency = async (merchantSub: string, gatewayId: number | null) => {
      try {
        const url = `${API_BASE_URLS.blinkpage}/blinkpages/${merchantSub}/currencies/${gatewayId}`;

        const response = await axiosInstance.get(url);

        if (response.data.message?.blinkPageCurrency) {
          setCurrencyarr(response.data.message.blinkPageCurrency);
          setFieldValue('currency', response.data.message.blinkPageCurrency[0].code);
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
      }
    };
    if (selectedCustomer && oopModalOpen) {
      fetchCustomerMandates();
      fetchDefaultCurrency(user?.userSub, user?.gatewayId);
    }
  }, [
    selectedCustomer,
    oopModalOpen,
    user?.userSub,
    user?.gatewayId,
    enqueueSnackbar,
    setFieldValue
  ]);

  return (
    <Dialog open={oopModalOpen}>
      <DialogTitle>Create One-off payment for {selectedCustomer.name}</DialogTitle>
      <DialogContent>
        <FormikProvider value={formik}>
          <Form noValidate onSubmit={handleSubmit}>
            <Stack spacing={{ xs: 3, sm: 2 }}>
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
                onChange={(e, val) => {
                  val && setFieldValue('currency', val?.code);
                }}
                options={currencyarr}
                getOptionLabel={(option: any) => `${option?.code} / ${option?.symbol}`}
                loading={isLoading}
                disableClearable
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
                onChange={(e, val) => {
                  val && setFieldValue('mandate', val.id);
                  setFieldValue('chargeDate', val.nextDate);
                  setNextDate(fDateHyphen(val.nextDate));
                }}
                options={customerMandates.map(
                  (mandate: {
                    id: string;
                    reference: string;
                    next_possible_charge_date: string;
                  }) => ({
                    id: mandate.id,
                    name: mandate.reference,
                    nextDate: mandate.next_possible_charge_date
                  })
                )}
                getOptionLabel={(option) => option.name}
                loading={isLoading}
                disableClearable
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={Boolean(touched.mandate && errors.mandate)}
                    helperText={touched.mandate && errors.mandate}
                    label="Select mandate"
                    variant="outlined"
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
              <TextField
                fullWidth
                label="Description"
                {...getFieldProps('description')}
                error={Boolean(touched.description && errors.description)}
                helperText={touched.description && errors.description}
              />

              {values.mandate && (
                <>
                  <RadioGroup
                    aria-label="date"
                    value={todaySelected}
                    name="radio-buttons-group"
                    onChange={(e, val) => {
                      setTodaySelected(val);
                      if (val === 'true') {
                        setFieldValue('chargeDate', TODAY);
                      }
                    }}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label={`Take payment as soon as possible ${nextDate}`}
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="Take payment on a specific date"
                    />
                  </RadioGroup>
                  {todaySelected === 'false' && (
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Date"
                        value={values.chargeDate}
                        onChange={(newValue) => {
                          if (newValue) {
                            setFieldValue('chargeDate', newValue);
                          }
                        }}
                        renderInput={(params) => <TextField {...params} fullWidth helperText="" />}
                        minDate={TODAY}
                        inputFormat="dd-MM-yyyy"
                      />
                    </LocalizationProvider>
                  )}
                </>
              )}
            </Stack>
            <DialogActions>
              <Button onClick={() => setOopModalOpen()}>Cancel</Button>
              <LoadingButton fullWidth type="submit" variant="contained" loading={isSubmitting}>
                Create Payment
              </LoadingButton>
            </DialogActions>
          </Form>
        </FormikProvider>
      </DialogContent>
    </Dialog>
  );
};

export default GCOneOffPaymentPopUp;
