import {
  Stack,
  TextField,
  Grid,
  InputAdornment,
  FormControl,
  MenuItem,
  Select
} from '@material-ui/core';
import GetCardIcon from 'components/_dashboard/transactions/GetCardIcons';
import { RootState, useSelector } from 'redux/store';

const PaymentFields = () => {
  const { previewCurrency } = useSelector((state: RootState) => state.customiser);
  return (
    <Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Stack>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  disabled
                  placeholder="Amount"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FormControl variant="outlined">
                          <Select disabled value={previewCurrency || '£'}>
                            <MenuItem value={previewCurrency || '£'}>
                              {previewCurrency || '£'}
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </InputAdornment>
                    ),
                    style: {
                      paddingLeft: 0
                    }
                  }}
                />
              </Grid>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
              <Grid item xs={12}>
                <TextField fullWidth placeholder="Name on Card" disabled />
              </Grid>
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Stack>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  disabled
                  placeholder="Card Number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <GetCardIcon name="" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth placeholder="MM/YY" disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth placeholder="CVV" disabled />
              </Grid>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default PaymentFields;
