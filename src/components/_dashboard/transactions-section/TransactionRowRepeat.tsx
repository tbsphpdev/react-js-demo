import { recentTransactionState } from '@customTypes/transaction';
import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Grid,
  InputAdornment,
  makeStyles,
  Stack,
  TextField,
  Typography
} from '@material-ui/core';
import LockIcon from '@material-ui/icons/Lock';
import { DatePicker, LoadingButton, LocalizationProvider } from '@material-ui/lab';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import { format } from 'date-fns';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';
import { addDate } from 'utils/formatTime';
import { ErrorMsg } from 'utils/helpError';
import { amountValidation } from 'utils/RegexPatterns';
import * as Yup from 'yup';

interface Props {
  row: recentTransactionState;
  handlerepeatsucccess: any;
}
const durationArr1 = ['days', 'weeks', 'months', 'years'];
const useStyles = makeStyles({
  mt14: {
    marginTop: '14px'
  },
  checkboxback: {
    backgroundColor: '#f8fafb',
    padding: '8px',
    borderRadius: '8px'
  },

  lockicon: {
    marginRight: '8px',
    color: '#fff'
  }
});

const TransactionRowRepeat = ({ row, handlerepeatsucccess }: Props) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const VTFormSchema = Yup.object().shape({
    orderRef: Yup.string().required('Order Reference is required'),
    amount: Yup.string()
      .trim()
      .matches(/^\d*\.?\d*$/, 'Must contain number')
      .required('Amount is required')
      .test('is-zero', "Amount can't be 0", (value) => {
        if (value !== undefined) return Number(value) > 0;
        return true;
      }),
    cycleDurationUnit: Yup.string().required('Date Is Required'),
    cycleDuration: Yup.string().required('Duration Is Required'),
    cycleCount: Yup.string().when(['unlimitedcycle'], {
      is: (unlimitedcycle: boolean) => !unlimitedcycle,
      then: Yup.string().required('Count Is Required')
    }),
    startDate: Yup.string().required('Date Is Required'),
    unlimitedcycle: Yup.boolean()
  });
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      csId: row.cardstreamTxnId.csTxnId.id,
      cycleType: 'fixed',
      orderRef: '',
      amount: '',
      cycleDurationUnit: 'months',
      cycleDuration: '',
      cycleCount: '',
      startDate: '',
      isRepeatPayment: true,
      unlimitedcycle: false,
      transactionOf: row.transactionOf,
      transactionId: row.id
    },
    validationSchema: VTFormSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const url = `${API_BASE_URLS.transaction}/transactions/repeat`;
        const { data } = await axiosInstance.post(url, {
          ...values
        });

        if (data) {
          enqueueSnackbar('Transaction Successful', { variant: 'success' });
          resetForm();
          handlerepeatsucccess();
        }
      } catch (err) {
        enqueueSnackbar(ErrorMsg(err), { variant: 'error' });
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } =
    formik;

  const changeDate = (date: any) => {
    setFieldValue('startDate', format(date, 'yyyy-MM-dd'));
  };
  const changeUnlimited = (e: any) => {
    setFieldValue('unlimitedcycle', e.target.checked);
    !e.target.checked && setFieldValue('cycleCount', 0);
  };
  return (
    <FormikProvider value={formik}>
      <Form noValidate onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  type="number"
                  fullWidth
                  placeholder="100.00"
                  value={getFieldProps('amount').value}
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
                        <Typography>£</Typography>
                      </InputAdornment>
                    ),
                    style: {
                      paddingLeft: '4'
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
            <Grid item xs={12} md={6}>
              <Stack direction={{ xs: 'row', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                <Grid item xs={12} md={7} className={classes.mt14}>
                  <Typography>Take Payment Every :</Typography>
                </Grid>

                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Duration"
                    value={values.cycleDuration}
                    error={Boolean(touched.cycleDuration && errors.cycleDuration)}
                    helperText={touched.cycleDuration && errors.cycleDuration}
                    onChange={(e) => {
                      (e.target.value.match(/^[1-9][0-9]?$/g) || e.target.value === '') &&
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
            <Grid item xs={12} md={6}>
              <Stack direction={{ xs: 'row', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                <Grid item xs={12} md={6} className={classes.mt14}>
                  <Typography>Number of Cycles :</Typography>
                </Grid>
                <Grid item xs={12} md={6} className={(classes.mt14, classes.checkboxback)}>
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
                    (e.target.value.match(/^[1-9][0-9]?$/g) || e.target.value === '') &&
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
            <Grid item xs={12} md={6}>
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
            </Grid>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
            <LoadingButton fullWidth type="submit" variant="contained" loading={isSubmitting}>
              <LockIcon className={classes.lockicon} /> Charge
            </LoadingButton>
          </Stack>
        </Stack>
      </Form>
    </FormikProvider>
  );
};

export default TransactionRowRepeat;
