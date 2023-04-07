import { BlinkPageFormState } from '@customTypes/blinkPages';
import { FormHelperText, Stack, TextField, Typography } from '@material-ui/core';
import { FieldInputProps, FormikErrors } from 'formik';
import { debounce } from 'lodash';
import { useEffect, useMemo } from 'react';
import { RootState, useSelector } from 'redux/store';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';
import SettingsLabel from './SettingsLabel';

type PropTypes = {
  getFieldProps: (nameOrOptions: any) => FieldInputProps<any>;
  touchedURLSlug: boolean | undefined;
  errorsURLSlug: string | undefined;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => Promise<void> | Promise<FormikErrors<BlinkPageFormState>>;
  urlFeedback: {
    isError: boolean;
    message: string;
  };
  setUrlFeedback: React.Dispatch<
    React.SetStateAction<{
      isError: boolean;
      message: string;
    }>
  >;
};

const URLSlug = ({
  getFieldProps,
  errorsURLSlug,
  setFieldValue,
  touchedURLSlug,
  urlFeedback,
  setUrlFeedback
}: PropTypes) => {
  const { urlSlug } = useSelector((state: RootState) => state.customiser);

  const checkSlug = async (val: string) => {
    try {
      if (val.trim() === '') return;

      if (val.trim() === urlSlug.trim()) {
        setUrlFeedback({
          isError: false,
          message: ''
        });

        return;
      }
      setUrlFeedback({
        isError: false,
        message: 'Checking for availability...'
      });
      const url = `${API_BASE_URLS.blinkpage}/blinkpages/slug/${val}`;

      await axiosInstance.get(url);

      setUrlFeedback({
        isError: false,
        message: 'URL Slug is Available'
      });
    } catch (error) {
      if (error?.response?.status === 409) {
        setUrlFeedback({
          isError: true,
          message: error.response.data.error
        });
      }
      console.error(error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedCheckSlug = useMemo(() => debounce(checkSlug, 300), []);
  useEffect(
    () => () => {
      debouncedCheckSlug.cancel();
    },
    [debouncedCheckSlug]
  );

  return (
    <Stack>
      <SettingsLabel title="URL Slug" />
      <TextField
        fullWidth
        type="url"
        {...getFieldProps('urlSlug')}
        onChange={(event) => {
          const { value } = event.target;
          setFieldValue('urlSlug', value);
          debouncedCheckSlug(value);
        }}
        error={Boolean((touchedURLSlug && errorsURLSlug) || urlFeedback.isError)}
        sx={{
          '& .MuiOutlinedInput-root': { p: 1 }
        }}
      />
      {((touchedURLSlug && errorsURLSlug) || urlFeedback.message) && (
        <FormHelperText>
          <Typography
            variant="caption"
            component="p"
            color={(touchedURLSlug && errorsURLSlug) || urlFeedback.isError ? 'error' : 'green'}
          >
            {(touchedURLSlug && errorsURLSlug) || urlFeedback.message}
          </Typography>
        </FormHelperText>
      )}
    </Stack>
  );
};

export default URLSlug;
