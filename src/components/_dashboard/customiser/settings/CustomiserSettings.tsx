import * as Yup from 'yup';
import { Button, Grid, Stack } from '@material-ui/core';
import { BlinkPageFormState } from '@customTypes/blinkPages';
import { Form, FormikProvider, useFormik } from 'formik';
import { RootState, useDispatch, useSelector } from 'redux/store';
import { LoadingButton } from '@material-ui/lab';
import axiosInstance from 'utils/axios';
import { useState, useCallback } from 'react';
import { API_BASE_URLS } from 'utils/constant';
import { getSingleBlinkPage, resetGeneralChanges } from 'redux/slices/customiser';
import Confirmation from 'components/MessageDialogs/Confirmation';
import useToggle from 'hooks/useToggle';
import { useSnackbar } from 'notistack';
import { ErrorMsg } from 'utils/helpError';
import AddOpeningHours from './AddOpeningHours';
import UploadComponents from './UploadComponents';
import URLSlug from './URLSlug';
// import CurrencyDropdown from './CurrencyDropdown';

const CustomiserSettings = () => {
  const [urlFeedback, setUrlFeedback] = useState({
    isError: false,
    message: ''
  });

  const { banner, customerLogo, id, urlSlug, openingHours, backgroundColor } = useSelector(
    (state: RootState) => state.customiser
  );

  const [isConfirmOpen, setIsConfirmOpen] = useToggle(false);

  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const CustomiserSchema = Yup.object().shape({
    urlSlug: Yup.string().required('URL Slug is required')
  });

  const CustomiserForm = useFormik<BlinkPageFormState>({
    enableReinitialize: true,
    validationSchema: CustomiserSchema,
    initialValues: {
      urlSlug,
      // optional Fields
      customerLogo: '',
      banner: '',
      backgroundColor: ''
    },
    onSubmit: async (values) => {
      try {
        if (urlFeedback.isError) return;
        const { urlSlug: fUrlSlug, ...rest } = values;

        const updatedData = {
          // cardTypes: values.blinkPageCard,
          // currency: values.blinkPageCurrency.map((c) => c.id),
          customerLogo: values.customerLogo || customerLogo,
          banner: values.banner || banner,
          backgroundColor: values.backgroundColor || backgroundColor
        };

        const postData =
          urlSlug === fUrlSlug
            ? {
                ...rest,
                ...updatedData
              }
            : {
                ...values,
                ...updatedData
              };

        const url: string = `${API_BASE_URLS.blinkpage}/blinkpages`;

        const formData = new FormData();
        if (id) {
          formData.append('id', id);
          formData.append('openingHours', JSON.stringify(openingHours));
          for (const [key, value] of Object.entries(postData)) {
            formData.append(key, value);
          }
          await axiosInstance.put(url, formData);

          setUrlFeedback({
            isError: false,
            message: ''
          });

          dispatch(getSingleBlinkPage(id));
          enqueueSnackbar('Updated Successfully', { variant: 'success' });
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
      }
    }
  });

  const { errors, touched, setFieldValue, getFieldProps, isSubmitting, handleSubmit, dirty } =
    CustomiserForm;

  const handleDialogActions = (action: boolean) => {
    if (action) {
      handleRevertChanges();
    }
    setIsConfirmOpen(false);
  };

  const handleRevertChanges = useCallback(() => {
    dispatch(resetGeneralChanges(id));
  }, [dispatch, id]);

  return (
    <FormikProvider value={CustomiserForm}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Upload Components */}
          <Grid container spacing={2}>
            <UploadComponents
              touchedCustomerLogo={touched.customerLogo}
              errorsCustomerLogo={errors.customerLogo}
              touchedBanner={touched.banner}
              errorsBanner={errors.banner}
              touchedBgColor={touched.backgroundColor}
              errorsBgColor={errors.backgroundColor}
              setFieldValue={setFieldValue}
              getFieldProps={getFieldProps}
            />
            {/* URL Slug */}
            <Grid item xs={12} sm={6} md={3}>
              <URLSlug
                errorsURLSlug={errors.urlSlug}
                getFieldProps={getFieldProps}
                touchedURLSlug={touched.urlSlug}
                setFieldValue={setFieldValue}
                urlFeedback={urlFeedback}
                setUrlFeedback={setUrlFeedback}
              />
            </Grid>
          </Grid>
          {/* Opening Hours */}
          <AddOpeningHours />
          {/* Currency */}
          {/* <CurrencyDropdown
            getFieldProps={getFieldProps}
            touchedCurrency={touched.blinkPageCurrency}
            touchedDefaultCurrency={touched.defaultCurrency}
            errorsCurrency={errors.blinkPageCurrency}
            errorsDefaultCurrency={errors.defaultCurrency}
            currency={values.blinkPageCurrency}
            defaultCurrency={values.defaultCurrency}
            setFieldValue={setFieldValue}
            currencyList={currencies}
          /> */}
          {/* CardTypes */}
          {/* <CardTypes
            getFieldProps={getFieldProps}
            touched={touched.blinkPageCard}
            errors={errors.blinkPageCard}
            selectedCardTypes={values.blinkPageCard}
            cardTypes={cardTypes}
            setFieldValue={setFieldValue}
          /> */}

          {/* Receipts Part */}
          {/* <ReceiptElements
            getFieldProps={getFieldProps}
            touchedFooter={touched.receiptFooter}
            errorsFooter={errors.receiptFooter}
            // touchedPhone={touched.receiptPhoneNumber}
            // errorsPhone={errors.receiptPhoneNumber}
            touchedEmail={touched.receiptEmailAddress}
            errorsEmail={errors.receiptEmailAddress}
            touchedURL={touched.receiptRedirectURL}
            errorsURL={errors.receiptRedirectURL}
            touchedTimeout={touched.timeout}
            errorsTimeout={errors.timeout}
          /> */}
          {/* Contack Box */}
          {/* <ContactBox /> */}
          <Stack spacing={2} direction="row">
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
              size="large"
              disabled={!dirty}
            >
              Save Changes
            </LoadingButton>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setIsConfirmOpen(true)}
              disabled={!dirty}
            >
              Revert Changes
            </Button>
            <Confirmation
              open={isConfirmOpen}
              msg="Revert the changes"
              closeAction={handleDialogActions}
            />
          </Stack>
        </Stack>
      </Form>
    </FormikProvider>
  );
};

export default CustomiserSettings;
