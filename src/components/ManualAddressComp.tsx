// material
import { Options } from '@customTypes/blinkPages';
import { VirtualTerminalFormState } from '@customTypes/transaction';
import { Autocomplete, Box, Grid, Stack, TextField } from '@material-ui/core';
import { experimentalStyled as styled } from '@material-ui/core/styles';
import { FormikErrors } from 'formik';
import { COUNTRIES, modifyAddressDataPub } from 'utils/constant';

// ----------------------------------------------------------------------

const CountryStyle = styled(Autocomplete)(({ theme }) => ({
  '& input.Mui-disabled': {
    color: theme.palette.text.primary,
    '-webkit-text-fill-color': `${theme.palette.text.primary} !important`
  }
}));

type ManualAddressCompProps = {
  getCityProps: any;
  getStateProps: any;
  getCountryProps: any;
  getPostcodeProps: any;
  getFullAddressProps: any;
  label?: string;
  setCountry: (val: string) => void;
  touched?: any;
  errors?: any;
  handleBlur?: (
    field: string,
    touched?: boolean | undefined,
    shouldValidate?: boolean | undefined
  ) => Promise<void> | Promise<FormikErrors<VirtualTerminalFormState>>;
  readonlyData?: {
    address1: Options;
    address2: Options;
    city: Options;
    country: Options;
    state: Options;
    postalCode: Options;
  };
};

export default function ManualAddressComp({
  getCityProps,
  getStateProps,
  getCountryProps,
  getPostcodeProps,
  getFullAddressProps,
  label,
  errors,
  touched,
  setCountry,
  handleBlur,
  readonlyData = { ...modifyAddressDataPub }
}: ManualAddressCompProps) {
  return (
    <Stack>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={label || 'Full Address'}
            {...getFullAddressProps}
            error={Boolean(touched.address && errors.address)}
            helperText={touched.address && errors.address}
            InputProps={{
              readOnly: readonlyData?.address1?.readOnly
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <CountryStyle
            fullWidth
            id="country-select"
            options={COUNTRIES}
            autoHighlight
            getOptionLabel={(option: any) => option.label}
            value={COUNTRIES.find(
              (obj: any) =>
                obj?.code?.toLowerCase() === getCountryProps?.value?.toLowerCase() ||
                obj?.label?.toLowerCase() === getCountryProps?.value?.toLowerCase()
            )}
            onChange={(e, val: any) => {
              if (readonlyData?.country?.readOnly) return;
              setCountry(val?.code);
            }}
            renderOption={(props, option: any) => (
              <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                <img
                  loading="lazy"
                  width="20"
                  src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                  srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                  alt={`${option?.code?.toLowerCase()}-flag`}
                />
                {option.label}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Choose a country"
                error={Boolean(touched.country && errors.country)}
                helperText={touched.country && errors.country}
                inputProps={{
                  ...params.inputProps,
                  autoComplete: 'new-password', // disable autocomplete and autofill
                  readOnly: readonlyData?.country?.readOnly
                }}
              />
            )}
            disabled={readonlyData?.country?.readOnly}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="County/State"
            {...getStateProps}
            error={Boolean(touched.state && errors.state)}
            helperText={touched.state && errors.state}
            InputProps={{
              readOnly: readonlyData?.state?.readOnly
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            {...getCityProps}
            error={Boolean(touched.city && errors.city)}
            helperText={touched.city && errors.city}
            InputProps={{
              readOnly: readonlyData?.city?.readOnly
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Postcode"
            {...getPostcodeProps}
            error={Boolean(touched.postcode && errors.postcode)}
            helperText={touched.postcode && errors.postcode}
            InputProps={{
              readOnly: readonlyData?.postalCode?.readOnly
            }}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
