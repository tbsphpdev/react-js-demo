// material
import {
  Box,
  Card,
  CircularProgress,
  Grid,
  makeStyles,
  Stack,
  Typography
} from '@material-ui/core';
import { DateRangePickPop } from 'components/DateRangePickPop';
import { format } from 'date-fns';
import useAuth from 'hooks/useAuth';
import { merge } from 'lodash';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';
import { ErrorMsg } from 'utils/helpError';
import { BaseOptionChart } from '../../charts';

// ----------------------------------------------------------------------

type PropTypes = {
  chartHeight?: number;
};

const useStyles = makeStyles({
  p30: {
    padding: '30px'
  }
});
export default function MRRChart(props: PropTypes) {
  const { chartHeight } = props;
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);

  const chartOptions = merge(BaseOptionChart(), {
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
    },
    tooltip: { x: { show: false }, marker: { show: false } }
  });

  useEffect(() => {
    const preload = async () => {
      try {
        const url = `${API_BASE_URLS.report}/analytics/revenues/merchants/${user?.userSub}/chart?startDate=${date.startDate}&endDate=${date.endDate}`;
        const response = await axiosInstance.get(url);
        if (response.data.message) {
          setRevenueData(response.data.message);
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };
    preload();
  }, [date.endDate, date.startDate, enqueueSnackbar, user?.userSub]);

  return (
    <Card>
      <Grid item xs={12} md={12}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ p: '20px 16px' }}
        >
          <Stack direction="row" spacing={1}>
            <Typography variant="h6">MRR</Typography>
          </Stack>

          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
            <DateRangePickPop
              setDate={(val: { startDate: string; endDate: string }) => {
                setDate({
                  startDate: format(new Date(val.startDate), 'yyyy-MM-dd'),
                  endDate: format(new Date(val.endDate), 'yyyy-MM-dd')
                });
              }}
            />
          </Stack>
        </Stack>
      </Grid>

      {isLoading ? (
        <Stack direction="row" justifyContent="center" alignItems="center" className={classes.p30}>
          <CircularProgress color="inherit" size={40} />
        </Stack>
      ) : (
        <Box sx={{ mt: 3, mx: 3 }} dir="ltr">
          {revenueData?.data ? (
            <ReactApexChart
              type="line"
              series={[{ name: '', data: revenueData?.data }]}
              options={chartOptions}
              height={chartHeight}
            />
          ) : (
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              className={classes.p30}
            >
              <Typography variant="h4">No Data Found</Typography>
            </Stack>
          )}
        </Box>
      )}
    </Card>
  );
}
