import { Grid, Stack, Box, Typography, Divider, Button } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { sentenceCase } from 'change-case';
import LockIcon from '@material-ui/icons/Lock';
import { getCardIssuer } from 'utils/formatCard';
import { fDateMonthMin } from 'utils/formatTime';
import GetCardIcon from './GetCardIcons';

const Summarysection = (
  values: any,
  classes: any,
  isSubmitting: any,
  handleSubmit: any,
  handleModalClose: any,
  user: any,
  selectedMerchant: any,
  currencyarr: any
) => {
  const calculateamount = () => {
    let amount = 0.0;
    values.variableCycle.forEach((val: any) => {
      if (val.amount !== '') {
        amount += parseFloat(val.amount);
      }
    });
    return amount;
  };

  const getcurrency = () => {
    let cursym = '£';
    if (currencyarr.length !== 0) {
      if (currencyarr.length === 1) {
        cursym = currencyarr[0].symbol;
      } else {
        cursym =
          currencyarr[currencyarr.findIndex((val: any) => val.code === values.currency)].symbol;
      }
    }
    return cursym;
  };

  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        className={classes.image}
        spacing={{ xs: 1, sm: 2 }}
      >
        <img src={selectedMerchant.logo || user.logo} alt="" />
      </Stack>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={{ xs: 3, sm: 2 }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'column' }}
          justifyContent="space-between"
          spacing={{ xs: 3, sm: 2 }}
        >
          <Typography className={classes.bold}>{`${
            values.merchantName ? values.merchantName : 'Merchant Name'
          }`}</Typography>
        </Stack>
        <Stack
          direction={{ xs: 'column', sm: 'column' }}
          justifyContent="space-between"
          spacing={{ xs: 3, sm: 2 }}
          alignItems="end"
        >
          <Typography className={classes.colorgrey}>{`${
            values.action ? sentenceCase(values.action) : 'Sale'
          } Transaction`}</Typography>
          {!values.isRepeatPayment && (
            <Typography variant="h4" className={classes.colorgrey}>{`${getcurrency()} ${
              values.amount ? values.amount : '00.00'
            }`}</Typography>
          )}
          {values.isRepeatPayment && values.cycleType === 'fixed' && (
            <Typography variant="h4" className={classes.colorgrey}>{`${getcurrency()} ${
              values.amount ? values.amount : '00.00'
            }`}</Typography>
          )}
          {values.isRepeatPayment && values.cycleType === 'variable' && (
            <Typography
              variant="h4"
              className={classes.colorgrey}
            >{`${getcurrency()} ${calculateamount().toFixed(2)}`}</Typography>
          )}
        </Stack>
      </Stack>
      {values.isRepeatPayment && values.cycleType === 'variable' && (
        <>
          <Divider />
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} justifyContent="space-between">
              <Typography>Date</Typography>
              <Typography>Amount</Typography>
            </Stack>
            {values.variableCycle.length < 4
              ? values.variableCycle.map((value: any, index: number) => (
                  <Stack direction="row" spacing={1} key={index} justifyContent="space-between">
                    <Typography>{`${
                      value.date !== '' ? fDateMonthMin(value.date) : 'Select Date'
                    }`}</Typography>
                    <Typography>{`${getcurrency()} ${
                      value.amount !== '' ? value.amount : '0.00'
                    }`}</Typography>
                  </Stack>
                ))
              : values.variableCycle.slice(0, 3).map((value: any, index: number) => (
                  <Stack direction="row" spacing={1} key={index} justifyContent="space-between">
                    <Typography>{`${
                      value.date !== '' ? fDateMonthMin(value.date) : 'DATE'
                    }`}</Typography>
                    <Typography>{`${value.amount !== '' ? value.amount : '0.00'}`}</Typography>
                  </Stack>
                ))}
            {values.variableCycle.length > 3 && (
              <Typography>{`+ ${values.variableCycle.length - 3} Transaction`}</Typography>
            )}
          </Stack>
        </>
      )}

      <Divider />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={{ xs: 3, sm: 2 }}
      >
        <Typography className={classes.bold}>{`${
          values.customerFirstName || values.customerLastName
            ? `${values.customerFirstName} ${values.customerLastName}`
            : 'Customer Name'
        }`}</Typography>
        <Typography className={classes.colorgrey}>{`${
          values.customerEmail ? values.customerEmail : 'Email'
        }`}</Typography>
      </Stack>
      <Stack
        direction={{ xs: 'row', sm: 'row' }}
        justifyContent="space-between"
        className={classes.carddetails}
        spacing={{ xs: 3, sm: 2 }}
      >
        <GetCardIcon name={getCardIssuer(values.cardNumber)} />
        <Stack spacing={1} alignItems="end">
          <Typography className={classes.colorgrey}>
            Card ends in{' '}
            {`${
              values.cardNumber.length > 4
                ? `${values.cardNumber.substr(values.cardNumber.length - 4)}`
                : 'XXXX'
            }`}
          </Typography>
          <Typography className={classes.colorgrey}>
            Expires on {`${values.validity.length > 3 ? `${values.validity}` : 'XX/XX'}`}
          </Typography>
        </Stack>
      </Stack>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <LoadingButton
          fullWidth
          type="submit"
          variant="contained"
          loading={isSubmitting}
          onClick={() => {
            handleSubmit();
          }}
        >
          <LockIcon className={classes.lockicon} /> Charge
        </LoadingButton>
      </Box>
      <Box display={{ xs: 'block', md: 'none' }}>
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              handleModalClose();
            }}
          >
            Close
          </Button>
        </Grid>
      </Box>
    </Stack>
  );
};

export default Summarysection;
