import { Divider, Grid, Stack } from '@material-ui/core';
import AnalyticsCards from './AnalyticsCards';
import CardSchemesChart from './CardSchemesChart';
import CardTypesChart from './CardTypesChart';
import PaylinkBreakDownChart from './PaylinkBreakDownChart';
import PaymentTypeChart from './PaymentTypeChart';
import RevenueChart from './RevenueChart';

const AnalyticsWrapper = () => {
  const Chart_Height: number = 300;

  const Charts = () => (
    <Stack spacing={2}>
      <Stack>
        <AnalyticsCards />
      </Stack>
      <Divider />
      <Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <RevenueChart chartHeight={Chart_Height} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PaymentTypeChart chartHeight={Chart_Height} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <PaylinkBreakDownChart chartHeight={Chart_Height} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <CardSchemesChart chartHeight={Chart_Height + 50} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CardTypesChart chartHeight={Chart_Height + 50} />
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  );

  return <Stack>{Charts()}</Stack>;
};

export default AnalyticsWrapper;
