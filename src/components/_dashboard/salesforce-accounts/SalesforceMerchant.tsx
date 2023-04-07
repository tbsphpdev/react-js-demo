import { Card, Checkbox, Typography, Stack, Grid } from '@material-ui/core';

const SalesforceMerchant = (props: any) => {
  const MERCHANT_TABLE = props.merchantaccountData.map((data: any) => data);

  return (
    <>
      {!props.isLoadingAccounts &&
        MERCHANT_TABLE.map((row: any) => (
          <Grid item xs={12} md={6} key={row.MID} className={props.classes.cardpadding}>
            <Card
              onClick={(e: any) =>
                props.handleCheckbox(
                  row.checked !== undefined ? !row.checked : true,
                  row.merchantId
                )
              }
              className={
                !!row.checked === false ? props.classes.inactivecard : props.classes.activecard
              }
            >
              <Stack spacing={{ xs: 3, sm: 2 }} className={props.classes.cardContentpadding}>
                <Stack
                  direction={{ xs: 'row', sm: 'row' }}
                  spacing={{ xs: 3, sm: 2 }}
                  className={props.classes.cardContentspace}
                >
                  <Grid item xs={10} md={10}>
                    <Stack>
                      Merchant Account Name
                      <Typography variant="h6">{row.tradingName}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={2} md={2} className={props.classes.checkbox}>
                    <Checkbox
                      checked={row.checked ? row.checked : false}
                      inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                  </Grid>
                </Stack>
                <Stack
                  className={`${props.classes.carddetails} ${props.classes.carddetailsmargin}`}
                >
                  <Stack direction={{ xs: 'row', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Stack>
                      Merchant Id
                      <Typography variant="h6">{row.MID}</Typography>
                    </Stack>
                    <Stack>
                      Acquirer
                      <Typography variant="h6">{row.acquirerName}</Typography>
                    </Stack>
                  </Stack>
                  <Stack>
                    Address
                    <Typography variant="h6">{row.street}</Typography>
                    <Typography variant="h6">
                      {row.city} {row.zipPostalCode}
                    </Typography>
                    <Typography variant="h6">{row.country}</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        ))}
    </>
  );
};

export default SalesforceMerchant;
