import { Card, Stack, Typography, Divider } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { sentenceCase } from 'change-case';

const PaylinkSummary = (
  values: any,
  classes: any,
  user: any,
  isSubmitting: any,
  handleSubmit: any,
  setisGenerate: any,
  selectedMerchant?: any
) => (
  <Card sx={{ p: 5 }}>
    <Typography className={classes.heading}>Summary</Typography>
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        className={classes.image}
        spacing={{ xs: 3, sm: 2 }}
      >
        <img src={selectedMerchant.logo || user.logo} alt="" />
      </Stack>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        className={classes.spacebet}
        spacing={{ xs: 3, sm: 2 }}
      >
        <Typography className={classes.bold}>
          {`Merchant id : ${values.csId ? values.csId : 'xxxx'}`}
        </Typography>
        <Typography>{`${
          values.action ? sentenceCase(values.action) : 'Sale'
        } Transaction`}</Typography>
      </Stack>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        className={classes.spacebet}
        spacing={{ xs: 3, sm: 2 }}
      >
        <Typography className={classes.bold}>{`${
          values.merchantName ? values.merchantName : 'Merchant Name'
        }`}</Typography>
        <Typography variant="h4" color="textPrimary">{`${
          values.currencyCode ? values.currencyCode : '£'
        } ${values.amount ? values.amount : '00.00'}`}</Typography>
      </Stack>
      <Divider />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        className={classes.spacebet}
        spacing={{ xs: 3, sm: 2 }}
      >
        <Typography className={classes.bold}>{`${
          values.customerFirstName || values.customerLastName
            ? `${values.customerFirstName} ${values.customerLastName}`
            : 'Customer Name'
        }`}</Typography>
        <Typography>{`${values.customerEmail ? values.customerEmail : 'Email'}`}</Typography>
      </Stack>
      <Divider />
      {values.notes && (
        <>
          <Typography className={classes.bold}>Paylink Note</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
            <Typography>{values.notes ? values.notes : 'Notes ...'}</Typography>
          </Stack>
        </>
      )}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        className={classes.spacebet}
        spacing={{ xs: 3, sm: 1 }}
      >
        <LoadingButton
          fullWidth
          type="submit"
          onClick={(e) => {
            handleSubmit();
          }}
          variant="contained"
          loading={isSubmitting}
        >
          Send
        </LoadingButton>

        <LoadingButton
          fullWidth
          variant="contained"
          color="secondary"
          onClick={(e) => {
            setisGenerate(true);
            handleSubmit();
          }}
          loading={isSubmitting}
        >
          Generate Link
        </LoadingButton>
      </Stack>
    </Stack>
  </Card>
);

export default PaylinkSummary;
