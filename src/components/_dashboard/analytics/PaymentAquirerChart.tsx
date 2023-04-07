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
import { addDays, format, subDays } from 'date-fns';
import useAuth from 'hooks/useAuth';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';
import { ErrorMsg } from 'utils/helpError';

// ----------------------------------------------------------------------

type PropTypes = {
  chartHeight?: number;
};

const staticData = [
  {
    x: 'VT',
    y: 5500
  },
  {
    x: 'Paylink',
    y: 3523
  },
  {
    x: ['Blink', 'Page'],
    y: 16800
  },
  {
    x: ['Go', 'Cardless'],
    y: 6743
  }
];

const STATE = {
  series: [
    {
      data: staticData.map((el: any) => el.y)
    }
  ],
  options: {
    chart: {
      toolbar: {
        show: true,
        tools: {
          download: false
        }
      }
    },

    colors: ['#867fc2', '#f69f5a', '#a7a7a7', '#fbcb5f'],
    plotOptions: {
      bar: {
        columnWidth: '45%',
        distributed: true
      }
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      show: false
    },
    fill: {
      opacity: 1,
      border: 'none'
    },
    xaxis: {
      categories: staticData.map((el: any) => el.x),
      labels: {
        rotate: 0,
        style: {
          colors: '#000000',
          fontSize: '12px'
        }
      }
    }
  }
};

const useStyles = makeStyles({
  p30: {
    padding: '30px'
  }
});
export default function PaymentAquirerChart(props: PropTypes) {
  const { chartHeight } = props;
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<any>({
    startDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd')
  });
  const [pmtAquirerData, setPmtAquirerData] = useState<any>(null);

  useEffect(() => {
    const preload = async () => {
      try {
        const url = `${API_BASE_URLS.report}/analytics/acquires/merchants/${user?.userSub}?startDate=${date.startDate}&endDate=${date.endDate}`;
        const response = await axiosInstance.get(url);
        if (response.data.message) {
          setPmtAquirerData(response.data.message);
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
            <Typography variant="h6">Payment Aquirer</Typography>
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
          {pmtAquirerData ? (
            <Stack spacing={2}>
              <ReactApexChart
                width="100%"
                type="bar"
                series={[{ name: '', data: pmtAquirerData.data }]}
                options={{
                  ...STATE.options,
                  xaxis: {
                    ...STATE.options.xaxis,
                    categories: pmtAquirerData.categories.map((obj: string) => {
                      if (!obj) return '';
                      return obj;
                    })
                  }
                }}
                height={chartHeight}
              />
            </Stack>
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
