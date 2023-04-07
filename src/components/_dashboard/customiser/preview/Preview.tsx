import { Paper, Stack } from '@material-ui/core';
import Banner from './Banner';
import CustomerFields from './CustomerFields';
import CustomerLogo from './CustomerLogo';
import OpeningHours from './OpeningHours';
import PaymentFields from './PaymentFields';
import ProcessBtn from './ProcessBtn';

const Preview = () => (
  <Paper
    sx={{
      pointerEvents: 'none',
      backgroundColor: '#F7FCFF',
      p: {
        xs: 1,
        lg: 3
      }
    }}
  >
    {/* Parent Stack */}
    <Stack spacing={5}>
      {/* Customer Logo */}
      <CustomerLogo />
      <Stack direction="column" spacing={2}>
        {/* Customer fields */}
        <CustomerFields />
        {/* Payment information */}
        <PaymentFields />
      </Stack>
      {/* Process Button */}
      <ProcessBtn />
      {/* Opening Hours */}
      <OpeningHours />
      {/* Banner */}
      <Banner />
    </Stack>
  </Paper>
);

export default Preview;
