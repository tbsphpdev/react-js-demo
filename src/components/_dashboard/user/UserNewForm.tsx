import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { Form, FormikProvider, useFormik } from 'formik';
// material
import { LoadingButton } from '@material-ui/lab';
import { Box, Card, Grid, Stack, TextField, Autocomplete, makeStyles } from '@material-ui/core';
// utils
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';
import { ErrorMsg } from 'utils/helpError';
// routes
import PhoneNoInput from 'utils/PhoneInput';
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { UserManager } from '../../../@customTypes/user';

// ----------------------------------------------------------------------

type UserNewFormProps = {
  isEdit: boolean;
  currentUser?: UserManager;
};

const useStyles = makeStyles({
  company: {
    paddingRight: '7px'
  },
  singlefield: {
    paddingRight: '7px'
  },
  w100: {
    width: '100% !important'
  }
});

type state = {
  merchantarr: any[];
  companyname: string;
  gatewayId: number | null;
};

export default function UserNewForm({ isEdit, currentUser }: UserNewFormProps) {
  const classes = useStyles();
  const [merchant, setmerchant] = useState<state>({
    merchantarr: [],
    companyname: '',
    gatewayId: null
  });
  const [selectedMerchant, setSelectedMerchant] = useState<any[]>([]);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const getMerchants = async () => {
      try {
        const url = `${API_BASE_URLS.transaction}/transactions/merchants`;
        const { data } = await axiosInstance.get(url);
        const SELECT_ALL = { id: 'ALL', merchantName: 'SELECT ALL' };
        setmerchant((prevState) => ({
          ...prevState,
          merchantarr:
            data.message.defaultGatewayId.gatewayName === 'cardStream'
              ? [SELECT_ALL, ...data.message.csCustomerId]
              : [SELECT_ALL, ...data.message.spVendorId],
          companyname: data.message.userId.companyName,
          gatewayId: data.message.defaultGateway
        }));
      } catch (error) {
        console.error(error);
      }
    };
    getMerchants();
  }, []);

  const NewUserSchema = Yup.object().shape({
    merchantName: Yup.array().required().min(1, 'Merchant must be selected'),
    first_name: Yup.string()
      .trim()
      .matches(/^[aA-zZ\s]+$/g, 'Only alphabets are allowed for this field ')
      .required('First name is required'),
    last_name: Yup.string()
      .trim()
      .matches(/^[aA-zZ\s]+$/g, 'Only alphabets are allowed for this field ')
      .required('Last name is required'),
    email: Yup.string().required('Email is required').email(),
    customerPhoneNumber: Yup.string()
      .required('Phone number is required')
      .matches(/^\+[0-9]+$/, 'Must be only digits'),
    company: Yup.string().required('Company is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      merchantName: currentUser ? [...currentUser?.merchantName] : [],
      first_name: currentUser?.first_name || '',
      last_name: currentUser?.familyName || '',
      email: currentUser?.email || '',
      PhoneNumberCode: '+44',
      customerPhoneNumber: currentUser?.phoneNumber || '',
      company: currentUser?.company || merchant.companyname,
      gatewayId: merchant.gatewayId
    },
    validationSchema: NewUserSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setFieldError }) => {
      try {
        if (values.customerPhoneNumber.replace(values.PhoneNumberCode, '').trim().length > 4) {
          const formdata = {
            name: values.first_name,
            familyName: values.last_name,
            email: values.email,
            phoneNumber: values.customerPhoneNumber,
            companyName: values.company,
            roleName: 5,
            merchantIds: [...values.merchantName.map(String)],
            gatewayId: values.gatewayId
          };
          const url = `${API_BASE_URLS.user}/merchant/users/invite`;
          await axiosInstance.post(url, { ...formdata });
          resetForm();
          setSubmitting(false);
          enqueueSnackbar(!isEdit ? 'Create success' : 'Update success', { variant: 'success' });
          navigate(PATH_DASHBOARD.user.list);
        } else {
          setFieldError('customerPhoneNumber', 'Enter Phone Number');
        }
      } catch (error) {
        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
        console.error(error);
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
    setFieldError
  } = formik;

  const handleChange = (data: any) => {
    let arr: Number[] = [];

    const isAll = data.some((d: { id: string }) => d.id === 'ALL');
    const filteredMerchant = merchant.merchantarr.filter((m) => m.id !== 'ALL');
    if (isAll) {
      arr = filteredMerchant.map((m) => m.id);
      setSelectedMerchant(filteredMerchant);
    } else {
      data.forEach((element: any) => {
        arr.push(element.id);
      });
      setSelectedMerchant(data);
    }

    setFieldValue('merchantName', arr);
  };

  const setPhone = (e: string, code: any) => {
    if (e.includes('+')) {
      setFieldValue('customerPhoneNumber', e);
      setFieldValue('PhoneNumberCode', code);
    } else {
      const add = '+';
      setFieldValue('customerPhoneNumber', add.concat(e));
      setFieldValue('PhoneNumberCode', code);
    }
    setFieldError('customerPhoneNumber', '');
  };

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Autocomplete
                    fullWidth
                    multiple
                    id="tags-outlined"
                    options={merchant.merchantarr}
                    onChange={(e: any, value) => handleChange(value)}
                    getOptionLabel={(option: any) => option.merchantName}
                    filterSelectedOptions
                    value={selectedMerchant}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={Boolean(touched.merchantName && errors.merchantName)}
                        helperText={touched.merchantName && errors.merchantName}
                        value={values.merchantName}
                        variant="outlined"
                        label="Merchant Name"
                      />
                    )}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    {...getFieldProps('first_name')}
                    error={Boolean(touched.first_name && errors.first_name)}
                    helperText={touched.first_name && errors.first_name}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    {...getFieldProps('last_name')}
                    error={Boolean(touched.last_name && errors.last_name)}
                    helperText={touched.last_name && errors.last_name}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      {...getFieldProps('email')}
                      error={Boolean(touched.email && errors.email)}
                      helperText={touched.email && errors.email}
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
                  <Grid item xs={12} md={6} className={classes.company}>
                    <TextField
                      fullWidth
                      label="Company"
                      {...getFieldProps('company')}
                      error={Boolean(touched.company && errors.company)}
                      helperText={touched.company && errors.company}
                    />
                  </Grid>
                </Stack>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                    {!isEdit ? 'Create User' : 'Save Changes'}
                  </LoadingButton>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  );
}
