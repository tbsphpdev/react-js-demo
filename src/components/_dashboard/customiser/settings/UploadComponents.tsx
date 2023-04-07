import { BlinkPageFormState } from '@customTypes/blinkPages';
import { FormHelperText, Grid, TextField } from '@material-ui/core';
import MinimalUpload from 'components/upload/MinimalUpload';
import { FieldInputProps, FormikErrors, FormikTouched } from 'formik';
import { debounce } from 'lodash';
import { useCallback, useMemo } from 'react';
import { handleBackgroundColor, handleBanner, handleCustomerLogo } from 'redux/slices/customiser';
import { dispatch, RootState, useSelector } from 'redux/store';
import SettingsLabel from './SettingsLabel';

type PropTypes = {
  getFieldProps: (nameOrOptions: any) => FieldInputProps<any>;
  touchedCustomerLogo: boolean | FormikTouched<any> | FormikTouched<any>[] | undefined;
  errorsCustomerLogo: string | string[] | FormikErrors<any> | FormikErrors<any>[] | undefined;
  touchedBanner: boolean | FormikTouched<any> | FormikTouched<any>[] | undefined;
  errorsBanner: string | string[] | FormikErrors<any> | FormikErrors<any>[] | undefined;
  touchedBgColor: boolean | undefined;
  errorsBgColor: string | undefined;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => Promise<void> | Promise<FormikErrors<BlinkPageFormState>>;
};

const UploadComponents = ({
  setFieldValue,
  touchedCustomerLogo,
  errorsCustomerLogo,
  touchedBanner,
  errorsBanner,
  touchedBgColor,
  errorsBgColor,
  getFieldProps
}: PropTypes) => {
  const { customerLogo, banner, backgroundColor } = useSelector(
    (state: RootState) => state.customiser
  );

  const handleCustomerLogoDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const preview = URL.createObjectURL(file);
        dispatch(handleCustomerLogo(preview));
        setFieldValue('customerLogo', file);
      }
    },
    [setFieldValue]
  );

  const removeCustomerLogo = useCallback(() => {
    dispatch(handleCustomerLogo(''));
    setFieldValue('customerLogo', '');
  }, [setFieldValue]);

  const handleBannnerDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const preview = URL.createObjectURL(file);
        dispatch(handleBanner(preview));
        setFieldValue('banner', file);
      }
    },
    [setFieldValue]
  );

  const removeBanner = useCallback(() => {
    dispatch(handleBanner(''));
    setFieldValue('banner', '');
  }, [setFieldValue]);

  const setBgColor = useCallback(
    (val: string) => {
      setFieldValue('backgroundColor', val);
      dispatch(handleBackgroundColor(val));
    },
    [setFieldValue]
  );

  const debouncedHandleBgColor = useMemo(() => debounce(setBgColor, 300), [setBgColor]);

  const handleBgColor = useCallback(
    (event) => {
      const { value } = event.target;

      debouncedHandleBgColor(value);
    },
    [debouncedHandleBgColor]
  );

  return (
    <>
      <Grid item xs={12} sm={6} md={3}>
        <SettingsLabel title="Add A Logo" />
        <MinimalUpload
          maxSize={3145728}
          accept="image/*"
          file={customerLogo}
          onDrop={handleCustomerLogoDrop}
          error={Boolean(touchedCustomerLogo && errorsCustomerLogo)}
          onRemove={removeCustomerLogo}
        />
        {touchedCustomerLogo && errorsCustomerLogo && (
          <FormHelperText error sx={{ px: 2 }}>
            {touchedCustomerLogo && errorsCustomerLogo}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <SettingsLabel title="Select Banner" />
        <MinimalUpload
          maxSize={3145728}
          accept="image/*"
          file={banner}
          onDrop={handleBannnerDrop}
          error={Boolean(touchedBanner && errorsBanner)}
          onRemove={removeBanner}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <SettingsLabel title="Choose a background Colour" />
        {/* Background COLOR */}
        <TextField
          fullWidth
          type="color"
          {...getFieldProps('backgroundColor')}
          onChange={handleBgColor}
          value={backgroundColor || '#ffffff'}
          error={Boolean(touchedBgColor && errorsBgColor)}
          helperText={touchedBgColor && errorsBgColor}
          sx={{
            '& .MuiOutlinedInput-root': { p: 1 }
          }}
        />
      </Grid>
    </>
  );
};

export default UploadComponents;
