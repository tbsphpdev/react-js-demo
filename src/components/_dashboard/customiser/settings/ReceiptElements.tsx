import { Grid, Stack, TextField } from '@material-ui/core';
import { FieldInputProps } from 'formik';
import SettingsLabel from './SettingsLabel';

type PropTypes = {
  getFieldProps: (nameOrOptions: any) => FieldInputProps<any>;
  touchedFooter: boolean | undefined;
  errorsFooter: string | undefined;
  touchedEmail: boolean | undefined;
  errorsEmail: string | undefined;
  touchedURL: boolean | undefined;
  errorsURL: string | undefined;
  touchedTimeout: boolean | undefined;
  errorsTimeout: string | undefined;
};

const ReceiptElements = ({
  getFieldProps,
  errorsEmail,
  errorsFooter,
  errorsTimeout,
  errorsURL,
  touchedEmail,
  touchedFooter,
  touchedTimeout,
  touchedURL
}: PropTypes) => (
  <Stack spacing={2}>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      <Grid item xs={12} md={6}>
        <SettingsLabel title="Receipt Footer" />
        <TextField
          fullWidth
          type="email"
          {...getFieldProps('receiptFooter')}
          error={Boolean(touchedFooter && errorsFooter)}
          helperText={touchedFooter && errorsFooter}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <SettingsLabel title="Receipt Phone Number" />
        <TextField fullWidth {...getFieldProps('receiptPhoneNumber')} />
      </Grid>
    </Stack>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      <Grid item xs={12} md={6}>
        <SettingsLabel title="Receipt Email Address" />
        <TextField
          fullWidth
          type="email"
          {...getFieldProps('receiptEmailAddress')}
          error={Boolean(touchedEmail && errorsEmail)}
          helperText={touchedEmail && errorsEmail}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <SettingsLabel title="Receipt Redirect URL" />
        <TextField
          fullWidth
          type="url"
          {...getFieldProps('receiptRedirectURL')}
          error={Boolean(touchedURL && errorsURL)}
          helperText={touchedURL && errorsURL}
          placeholder="https://yourdomain.abc"
        />
      </Grid>
    </Stack>
    <Stack>
      <Grid item xs={12}>
        <SettingsLabel title="Receipt Redirect Timeout(sec.)" />
        <TextField
          fullWidth
          type="number"
          {...getFieldProps('timeout')}
          error={Boolean(touchedTimeout && errorsTimeout)}
          helperText={touchedTimeout && errorsTimeout}
        />
      </Grid>
    </Stack>
  </Stack>
);

export default ReceiptElements;
