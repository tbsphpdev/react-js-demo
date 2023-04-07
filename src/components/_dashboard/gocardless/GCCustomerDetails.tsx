import * as Yup from 'yup';
import { gCCustomerDetails } from '@customTypes/goCardLess';
import {
  Autocomplete,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  makeStyles,
  Stack,
  TextField,
  Typography,
  useTheme
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';
import { ErrorMsg } from 'utils/helpError';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import { LoadingButton } from '@material-ui/lab';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ZipCodeAddrPicker from 'components/ZipCodeAddrPicker';
import { Add } from '@material-ui/icons';
import Close from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
  justifyContBtw: {
    justifyContent: 'space-between'
  },
  blockHeading: {
    '& h6': {
      fontSize: '1em'
    }
  },
  btnAction: {
    padding: '4px 20px 4px 20px',
    color: '#3d5afe',
    border: '1px solid #3d5afe',
    borderRadius: 4,
    fontWeight: 600
  },
  fw300: {
    fontWeight: 300
  },
  cdLabel: {
    color: theme.palette.text.primary,
    fontSize: '.8em',
    fontWeight: 700
  },
  cdDetail: {
    marginLeft: 20,
    fontSize: '.8em',
    color: theme.palette.text.primary,
    wordWrap: 'break-word',
    '&:hover': {
      fontWeight: 600
    }
  },
  customFields: {
    boxShadow: 'inset 1.2px 1.2px 5px #6330b53d, inset -1.2px -1.2px 5px #6330b53d',
    borderRadius: '1em'
  }
}));

const LangAvailable = [
  { label: 'English', code: 'en' },
  { label: 'Swedish', code: 'sw' },
  { label: 'German', code: 'de' }
];

const GCCustomerDetails = (props: { setCustomer: (val: string) => void }) => {
  const theme = useTheme();
  const classes = useStyles(theme);
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { setCustomer } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [customFieldsOpen, setCustomFieldsOpen] = useState(false);
  const [advanceOptOpen, setAdvanceOptOpen] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<gCCustomerDetails>({
    id: '',
    email: '',
    given_name: '',
    family_name: '',
    company_name: null || '',
    address_line1: null || '',
    address_line2: null || '',
    city: null || '',
    region: null || '',
    postal_code: null || '',
    country_code: null || '',
    language: null || '',
    swedish_identity_number: null || '',
    danish_identity_number: null || '',
    phone_number: null || '',
    metaData: {
      customFields: [
        {
          name: '',
          value: ''
        }
      ]
    }
  });

  const getCustomerDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = `${API_BASE_URLS.goCardless}/gocardless/merchants/customers/${params.id}`;
      const { data } = await axiosInstance.get(url);
      const tempData = { ...data.message, metaData: { customFields: [] } };
      tempData.metaData.customFields = [{ name: '', value: '' }];
      setCustomerDetails(tempData);
      setCustomer(`${data.message.given_name} ${data.message.family_name}`);
    } catch (error) {
      enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar, params.id, setCustomer]);

  useEffect(() => {
    getCustomerDetails();
  }, [enqueueSnackbar, getCustomerDetails, params.id, setCustomer]);

  const CustomerDetailsSchema = Yup.object().shape({
    email: Yup.string().required('email is required'),
    given_name: Yup.string().required('Firsrt name is required'),
    address_line1: Yup.string().required('Address is required'),
    country_code: Yup.string().required('Country is required'),
    region: Yup.string().required('State/County is required'),
    city: Yup.string().required('City is required'),
    postal_code: Yup.string().required('Postal Code is required')
  });

  const formik = useFormik<gCCustomerDetails>({
    enableReinitialize: true,
    initialValues: customerDetails,
    validationSchema: CustomerDetailsSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const url = `${API_BASE_URLS.goCardless}/gocardless/merchants/customers/${params.id}`;
        await axiosInstance.put(url, values);
        setEditProfileOpen(false);
        setSubmitting(false);
        resetForm();
        getCustomerDetails();
      } catch (err) {
        setSubmitting(false);
      }
    }
  });
  const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } =
    formik;

  const handleAddCustomFields = () => {
    if (values.metaData.customFields.length < 3) {
      const tempCustomFields = [...values.metaData.customFields, { name: '', value: '' }];
      setFieldValue('metaData.customFields', tempCustomFields);
    }
  };

  const handleRemoveCustomFields = (index: number) => {
    const tempCustomFields = values.metaData.customFields.filter((obj, i) => i !== index);
    setFieldValue('metaData.customFields', tempCustomFields);
  };

  const EditProfilePopup = () => (
    <Dialog open={editProfileOpen}>
      {/* editProfileOpen */}
      <DialogTitle>Edit Customer Details </DialogTitle>
      <DialogContent>
        <FormikProvider value={formik}>
          <Form noValidate onSubmit={handleSubmit}>
            <Stack spacing={{ xs: 3, sm: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="First Name"
                  {...getFieldProps('given_name')}
                  error={Boolean(touched.given_name && errors.given_name)}
                  helperText={touched.given_name && errors.given_name}
                  InputProps={{}}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  {...getFieldProps('family_name')}
                  error={Boolean(touched.family_name && errors.family_name)}
                  helperText={touched.family_name && errors.family_name}
                  InputProps={{}}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Company Name (Optional)"
                  {...getFieldProps('company_name')}
                  error={Boolean(touched.company_name && errors.company_name)}
                  helperText={touched.company_name && errors.company_name}
                  InputProps={{}}
                />
                <Autocomplete
                  fullWidth
                  options={LangAvailable}
                  getOptionLabel={(option) => option.label.toUpperCase()}
                  onChange={(e, option) => {
                    setFieldValue('language', option.code);
                  }}
                  defaultValue={LangAvailable.find(
                    (lang) => lang.code === customerDetails.language
                  )}
                  disableClearable
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={Boolean(touched.language && errors.language)}
                      helperText={touched.language && errors.language}
                      label="Select Language"
                      variant="outlined"
                      {...getFieldProps('language')}
                      onKeyDown={(e) => e.preventDefault()}
                      value={LangAvailable.find((lang) => lang.code === customerDetails.language)}
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
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Email"
                  {...getFieldProps('email')}
                  error={Boolean(touched.email && errors.email)}
                  helperText={touched.email && errors.email}
                  InputProps={{}}
                />
              </Stack>
              <Stack spacing={2}>
                <Button
                  variant="text"
                  sx={{ alignItems: 'left', justifyContent: 'space-between' }}
                  onClick={() => setCustomFieldsOpen(!customFieldsOpen)}
                >
                  <span>Custom Fields</span>
                  <span>{customFieldsOpen ? <ExpandLess /> : <ExpandMore />}</span>
                </Button>
                <Collapse in={customFieldsOpen}>
                  <Stack spacing={2}>
                    <Stack sx={{ background: '#e9ecef' }}>
                      <Typography variant="body1" p={2}>
                        You can add, edit and remove up to three pairs of metadata. Use these to
                        store info unique to your organisation, for example, custom ID numbers.
                      </Typography>
                    </Stack>
                    <Stack spacing={2} className={classes.customFields}>
                      {values?.metaData?.customFields.map((cf, i) => (
                        <Stack key={i} spacing={2} p={2} direction={{ xs: 'column', sm: 'row' }}>
                          <TextField
                            fullWidth
                            label="Name"
                            {...getFieldProps(`metaData.customFields[${i}].name`)}
                            InputProps={{}}
                          />
                          <TextField
                            fullWidth
                            label="Value"
                            {...getFieldProps(`metaData.customFields[${i}].value`)}
                            InputProps={{}}
                          />
                          <Button>
                            <Close
                              onClick={() => {
                                handleRemoveCustomFields(i);
                              }}
                            />
                          </Button>
                        </Stack>
                      ))}
                      <Stack spacing={2} p={2} direction="row" className={classes.justifyContBtw}>
                        <Stack>
                          {values.metaData.customFields.length > 0 && (
                            <Button
                              sx={{ maxWidth: 'max-content', alignSelf: 'left' }}
                              size="small"
                              onClick={() => setFieldValue('metaData.customFields', [])}
                            >
                              Remove all
                            </Button>
                          )}
                        </Stack>

                        <Stack>
                          {values.metaData.customFields.length < 3 && (
                            <Button
                              sx={{ maxWidth: 'max-content', alignSelf: 'flex-end' }}
                              size="small"
                              onClick={handleAddCustomFields}
                            >
                              <Add /> Add Pair
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </Collapse>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <ZipCodeAddrPicker
                  label="Address Line 1"
                  setAddress={(val) => {
                    setFieldValue('address_line1', val);
                  }}
                  setAddressFields={(country, state, city) => {
                    setFieldValue('city', city);
                    setFieldValue('country_code', country);
                    setFieldValue('region', state);
                  }}
                  getFieldProps={getFieldProps('address_line1')}
                  error={Boolean(
                    (getIn(touched, 'address_line1') && getIn(errors, 'address_line1')) ||
                      (!values.city && getIn(errors, 'city')) ||
                      (!values.country_code && getIn(errors, 'country_code')) ||
                      (!values.region && getIn(errors, 'region'))
                  )}
                  helperText={
                    (getIn(touched, 'address_line1') && getIn(errors, 'address_line1')) ||
                    (!values.city && getIn(errors, 'city')) ||
                    (!values.country_code && getIn(errors, 'country_code')) ||
                    (!values.region && getIn(errors, 'region'))
                  }
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <ZipCodeAddrPicker
                  label="Address Line 2"
                  setAddress={(val) => {
                    setFieldValue('address_line2', val);
                  }}
                  setAddressFields={(country, state, city, postalCode) => {
                    setFieldValue('billingAddress.country_code', country);
                    setFieldValue('billingAddress.region', state.slice(0, 2));
                    setFieldValue('billingAddress.city', city);
                    setFieldValue('billingAddress.postal_code', postalCode);
                  }}
                  getFieldProps={getFieldProps('address_line2')}
                  error={Boolean(getIn(touched, 'address_line2') && getIn(errors, 'address_line2'))}
                  helperText={getIn(touched, 'address_line2') && getIn(errors, 'address_line2')}
                />
                <TextField
                  fullWidth
                  label="Postal Code"
                  {...getFieldProps('postal_code')}
                  error={Boolean(touched.postal_code && errors.postal_code)}
                  helperText={touched.postal_code && errors.postal_code}
                  InputProps={{}}
                />
              </Stack>
              <Stack spacing={2}>
                <Button
                  variant="text"
                  sx={{ alignItems: 'left', justifyContent: 'space-between' }}
                  onClick={() => setAdvanceOptOpen(!advanceOptOpen)}
                >
                  <span>Advance Options</span>
                  <span>{advanceOptOpen ? <ExpandLess /> : <ExpandMore />}</span>
                </Button>
                <Collapse in={advanceOptOpen}>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        {...getFieldProps('phone_number')}
                        error={Boolean(touched.phone_number && errors.phone_number)}
                        helperText={touched.phone_number && errors.phone_number}
                        InputProps={{}}
                      />
                      <TextField
                        fullWidth
                        label="Swedish Civic/Company Number (Swedish customers only)"
                        {...getFieldProps('swedish_identity_number')}
                        error={Boolean(
                          touched.swedish_identity_number && errors.swedish_identity_number
                        )}
                        helperText={
                          touched.swedish_identity_number && errors.swedish_identity_number
                        }
                        InputProps={{}}
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        label="CPR/CVR Number (Danish customers only)"
                        {...getFieldProps('danish_identity_number')}
                        error={Boolean(
                          touched.danish_identity_number && errors.danish_identity_number
                        )}
                        helperText={touched.danish_identity_number && errors.danish_identity_number}
                        InputProps={{}}
                      />
                    </Stack>
                  </Stack>
                </Collapse>
              </Stack>
            </Stack>
            <DialogActions>
              <Button onClick={() => setEditProfileOpen(false)}>Cancel</Button>
              <LoadingButton fullWidth type="submit" variant="contained" loading={isSubmitting}>
                Submit
              </LoadingButton>
            </DialogActions>
          </Form>
        </FormikProvider>
      </DialogContent>
    </Dialog>
  );

  const USER_DETAILS_VIEW = (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle1" className={`${classes.cdLabel}`}>
            Full Name
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography
            variant="subtitle1"
            sx={{ textTransform: 'capitalize' }}
            className={`${classes.fw300} ${classes.cdDetail}`}
          >
            {`${customerDetails.given_name} ${customerDetails.family_name}`}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1" className={`${classes.fw300} ${classes.cdLabel}`}>
            Email Address
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1" className={`${classes.fw300} ${classes.cdDetail}`}>
            {customerDetails.email}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1" className={`${classes.fw300} ${classes.cdLabel}`}>
            Business Name
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1" className={`${classes.fw300} ${classes.cdDetail}`}>
            {customerDetails.company_name}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1" className={`${classes.fw300} ${classes.cdLabel}`}>
            Address
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1" className={`${classes.fw300} ${classes.cdDetail}`}>
            {customerDetails.address_line1}
          </Typography>
        </Grid>
      </Grid>
    </>
  );

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'row' }} className={classes.justifyContBtw}>
        <Stack className={classes.blockHeading}>
          <Typography variant="h6" className={classes.fw300}>
            Customer Details
          </Typography>
        </Stack>
        <Stack justifyContent="center">
          <Button
            variant="outlined"
            className={classes.btnAction}
            onClick={() => setEditProfileOpen(true)}
          >
            Edit
          </Button>
        </Stack>
      </Stack>
      <Stack>
        <Divider />
      </Stack>
      <Stack>
        {isLoading && (
          <Stack direction="row" justifyContent="center" alignItems="center">
            <CircularProgress color="inherit" size={40} />
          </Stack>
        )}
        {!isLoading && USER_DETAILS_VIEW}
      </Stack>
      <Stack>{EditProfilePopup()}</Stack>
    </Stack>
  );
};

export default GCCustomerDetails;
