import { merge } from 'lodash';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
// material
import {
  Card,
  Box,
  Stack,
  Grid,
  Typography,
  CircularProgress,
  makeStyles
} from '@material-ui/core';

import { API_BASE_URLS } from 'utils/constant';
import axiosInstance from 'utils/axios';
import { format, subDays, addDays } from 'date-fns';
import useAuth from 'hooks/useAuth';
import { ErrorMsg } from 'utils/helpError';
import { useSnackbar } from 'notistack';
import { DateRangePickPop } from 'components/DateRangePickPop';
import { fillStartDate } from 'utils/chart';
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
export default function RevenueChart(props: PropTypes) {
  const { chartHeight } = props;
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<any>({
    startDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd')
  });
  const [revenueData, setRevenueData] = useState<any>(null);

  const chartOptions = merge(BaseOptionChart(), {
    xaxis: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ]
    },
    yaxis: {
      labels: {
        formatter(val: number) {
          return `£ ${val.toFixed(2)}`; // Why the currency symbol is static
        }
      },
      title: {
        text: ''
      }
    },
    tooltip: { x: { show: false }, marker: { show: false } }
  });

  useEffect(() => {
    const preload = async () => {
      try {
        const url = `${API_BASE_URLS.report}/analytics/revenues/merchants/${user?.userSub}/chart?startDate=${date.startDate}&endDate=${date.endDate}`;
        const response = await axiosInstance.get(url);
        if (response.data.message) {
          const updatedData = fillStartDate(date.startDate, response.data?.message?.data);
          setRevenueData(updatedData);
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
  }, [date, enqueueSnackbar, user?.userSub]);

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
            <Typography variant="h6">Revenue</Typography>
          </Stack>

          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
            <DateRangePickPop
              setDate={(val: { startDate: string; endDate: string }) => {
                setDate({
                  startDate: format(new Date(val.startDate), 'yyyy-MM-dd'),
                  endDate: format(new Date(val.endDate), 'yyyy-MM-dd')
                });
              }}
              customRange={false}
              removeDays
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
          {revenueData ? (
            <ReactApexChart
              type="line"
              series={[{ name: '', data: revenueData }]}
              options={{
                ...chartOptions,
                xaxis: {
                  type: 'datetime'
                }
              }}
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
