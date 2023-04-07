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
import { CHART_DETAILS } from '../../../utils/chartConstant';

// ----------------------------------------------------------------------

type PropTypes = {
  chartHeight?: number;
};

const STATIC_DATA = [
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
  series: [{ name: 'total', data: STATIC_DATA.map((el: any) => el.y) }],
  options: {
    chart: {
      toolbar: {
        show: true,
        tools: {
          download: false
        }
      }
    },
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
      categories: STATIC_DATA.map((el: any) => el.x),
      labels: {
        rotate: 0,
        style: {
          colors: '#000000',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        formatter(val: number) {
          return `£ ${val.toFixed(0)}`;
        }
      },
      title: {
        text: ''
      }
    }
  }
};

const TREE_STATE = {
  series: [
    {
      data: STATIC_DATA
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
    legend: {
      show: false
    },

    fill: {
      opacity: 1,
      border: 'none'
    },
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: false
      }
    }
  }
};

const useStyles = makeStyles({
  p30: {
    padding: '30px'
  }
});

export default function PaymentTypeChart(props: PropTypes) {
  const { chartHeight } = props;
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<any>({
    startDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd')
  });
  const [paymentTypeData, setPaymentTypeData] = useState<any>(null);

  useEffect(() => {
    const preload = async () => {
      try {
        const url = `${API_BASE_URLS.report}/analytics/paymentTypes/merchants/${user?.userSub}?startDate=${date.startDate}&endDate=${date.endDate}`;
        const response = await axiosInstance.get(url);
        if (response.data.message) {
          const temp = response.data.message.tree.filter((obj: any) => Number(obj.y) > 0);
          setPaymentTypeData({ ...response.data.message, tree: temp });
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
            <Typography variant="h6">Payment Type</Typography>
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
          {paymentTypeData ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Stack>
                <Typography variant="h5" align="center">
                  Amount
                </Typography>
                <Box>
                  <ReactApexChart
                    type="bar"
                    series={[{ name: 'Amount', data: paymentTypeData.bar.data }]}
                    options={{
                      ...STATE.options,
                      colors: paymentTypeData?.bar?.categories
                        .filter((v: any) => !!v)
                        .map(
                          (obj: any) =>
                            (
                              CHART_DETAILS[obj.replace(/ /g, '').toLowerCase()] || {
                                label: obj.replace(/ /g, '').toLowerCase(),
                                color: '#000000'
                              }
                            ).color
                        ),
                      xaxis: {
                        ...STATE.options.xaxis,
                        categories: paymentTypeData.bar.categories
                          .filter((v: any) => !!v)
                          .map(
                            (obj: string) =>
                              (
                                CHART_DETAILS[obj.replace(/ /g, '').toLowerCase()] || {
                                  label: obj.replace(/ /g, '').toLowerCase(),
                                  color: '#000000'
                                }
                              ).label
                          )
                      }
                    }}
                    height={chartHeight}
                  />
                </Box>
              </Stack>
              <Stack>
                <Typography variant="h5" align="center">
                  Count
                </Typography>
                <Box>
                  <ReactApexChart
                    type="treemap"
                    series={[
                      {
                        data: paymentTypeData.tree.map((obj: any) => {
                          if (obj.x) {
                            return {
                              ...obj,
                              x: CHART_DETAILS[obj.x.replace(/ /g, '').toLowerCase()].label
                            };
                          }
                          return obj;
                        })
                      }
                    ]}
                    options={{
                      ...TREE_STATE.options,
                      colors: paymentTypeData?.tree?.map(
                        (obj: any) => CHART_DETAILS[obj.x.replace(/ /g, '').toLowerCase()].color
                      )
                    }}
                    height={chartHeight}
                  />
                </Box>
              </Stack>
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
