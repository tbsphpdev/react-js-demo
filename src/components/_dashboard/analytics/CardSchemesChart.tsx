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
import { CHART_DETAILS } from 'utils/chartConstant';
import { API_BASE_URLS } from 'utils/constant';
import { ErrorMsg } from 'utils/helpError';

// ----------------------------------------------------------------------

const STATE = {
  series: [1153, 2923, 438],
  legend: {
    position: 'bottom'
  },
  options: {
    labels: ['Visa', 'American Express', 'Master Card'],
    dataLabels: {
      enabled: false
    },

    responsive: [
      {
        breakpoint: 10000,
        options: {
          legend: {
            position: 'bottom',
            fontSize: '15px'
          }
        }
      }
    ],
    plotOptions: {
      pie: {
        donut: {
          size: '90%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '22px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 600,
              color: 'undefined',
              offsetY: -10,
              formatter: (val: any) => val
            },
            value: {
              show: true,
              fontSize: '16px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 400,
              color: undefined,
              offsetY: 16,
              formatter: (val: any) => val
            },
            total: {
              show: true,
              showAlways: false,
              label: 'Total',
              fontSize: '22px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 600,
              color: '#373d3f',
              formatter: (w: any) => w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0)
            }
          }
        }
      }
    }
  }
};

type PropTypes = {
  chartHeight?: number;
};

const useStyles = makeStyles({
  p30: {
    padding: '30px'
  }
});

export default function CardSchemesChart(props: PropTypes) {
  const { chartHeight } = props;
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<any>({
    startDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd')
  });
  const [cardSchemesData, setCardSchemesData] = useState<any>(null);

  useEffect(() => {
    const preload = async () => {
      try {
        const url = `${API_BASE_URLS.report}/analytics/cardSchemes/merchants/${user?.userSub}?startDate=${date.startDate}&endDate=${date.endDate}`;
        const response = await axiosInstance.get(url);
        if (response.data.message) {
          setCardSchemesData(response.data.message);
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
    <Card sx={{ paddingBottom: 2 }}>
      <Grid item xs={12} md={12}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ p: '20px 16px' }}
        >
          <Stack direction="row" spacing={1}>
            <Typography variant="h6">Card Schemes</Typography>
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
          {cardSchemesData ? (
            <Box sx={{ '.apexcharts-tooltip': { color: '#ffffff !important' } }}>
              <ReactApexChart
                options={{
                  ...STATE.options,
                  labels: cardSchemesData.categories.map((obj: string) => {
                    if (!obj) return '';
                    return (
                      CHART_DETAILS[obj.replace(/ /g, '').toLowerCase()] || {
                        label: obj.replace(/ /g, '').toLowerCase(),
                        color: '#000000'
                      }
                    ).label;
                  }),
                  colors: cardSchemesData.categories.map((obj: any) => {
                    if (!obj) return CHART_DETAILS.default.color;
                    return (
                      CHART_DETAILS[obj.replace(/ /g, '').toLowerCase()] || {
                        label: obj.replace(/ /g, '').toLowerCase(),
                        color: '#000000'
                      }
                    ).color;
                  })
                }}
                series={cardSchemesData.data.map((obj: any) => Number(obj))}
                type="donut"
                height={chartHeight}
              />
            </Box>
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
