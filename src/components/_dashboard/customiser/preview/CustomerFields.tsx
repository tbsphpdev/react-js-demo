import { Stack, TextField, Grid } from '@material-ui/core';
import { RootState, useSelector } from 'redux/store';

const CustomerFields = () => {
  const {
    fields: {
      customerFirstName,
      customerLastName,
      customerEmail,
      customerAddress,
      orderRef,
      description
    }
  } = useSelector((state: RootState) => state.customiser);
  return (
    <Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
              {customerFirstName.visible === '1' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder={customerFirstName?.displayNamePlaceHolder}
                    value={customerFirstName?.displayNameValue}
                    disabled
                  />
                </Grid>
              )}
              {customerLastName.visible === '1' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder={customerLastName?.displayNamePlaceHolder}
                    value={customerLastName?.displayNameValue}
                    disabled
                  />
                </Grid>
              )}
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
              {customerEmail.visible === '1' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder={customerEmail?.displayNamePlaceHolder}
                    value={customerEmail?.displayNameValue}
                    disabled
                  />
                </Grid>
              )}
              {orderRef.visible === '1' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder={orderRef?.displayNamePlaceHolder}
                    value={orderRef?.displayNameValue}
                    disabled
                  />
                </Grid>
              )}
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
              <Grid item xs={12} md={12}>
                <TextField
                  fullWidth
                  placeholder={customerAddress?.address1.displayNamePlaceHolder}
                  value={customerAddress?.address1.displayNameValue}
                  disabled
                />
              </Grid>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
              {description.visible === '1' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder={description?.displayNamePlaceHolder}
                    value={description?.displayNameValue}
                    disabled
                  />
                </Grid>
              )}
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default CustomerFields;
