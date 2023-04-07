import { merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';
// material
import { useTheme, experimentalStyled as styled } from '@material-ui/core/styles';
import { Card, CircularProgress, Grid, makeStyles, Stack, Typography } from '@material-ui/core';
// utils
import { useEffect, useState } from 'react';
import axiosInstance from 'utils/axios';
import { addDays, format, getYear, startOfMonth } from 'date-fns';
import { API_BASE_URLS } from 'utils/constant';
import { DateRangePicker } from 'utils/dateRangepicker';
import useAuth from 'hooks/useAuth';
import { fNumber } from '../../../utils/formatNumber';
import { BaseOptionChart } from '../../charts';

// ----------------------------------------------------------------------

const CHART_HEIGHT = 392;
const LEGEND_HEIGHT = 72;

const ChartWrapperStyle = styled('div')(({ theme }) => ({
  height: CHART_HEIGHT,
  marginTop: theme.spacing(5),
  '& .apexcharts-canvas svg': { height: CHART_HEIGHT },
  '& .apexcharts-canvas svg,.apexcharts-canvas foreignObject': {
    overflow: 'visible'
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    alignContent: 'center',
    position: 'relative !important' as 'relative',
    borderTop: `solid 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`
  }
}));

// ----------------------------------------------------------------------

type StateType = {
  Year: string | number;
  Month: string | number;
  date: { startDate: string; endDate: string };
  categories: any[];
  data: any[];
  isLoading: boolean;
  group: string;
};

const useStyles = makeStyles({
  p30: {
    padding: '30px'
  }
});
export default function AppPaymentType() {
  const classes = useStyles();
  const [state, setState] = useState<StateType>({
    date: {
      startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd').toString(),
      endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd').toString()
    },
    Year: getYear(new Date()),
    Month: 12,
    categories: [],
    data: [],
    isLoading: true,
    group: 'month'
  });
  const theme = useTheme();
  const { user } = useAuth();

  const { Year, Month, data, isLoading, date, group } = state;

  useEffect(() => {
    if (isLoading) {
      const fetchdata = async () => {
        try {
          const url = `${API_BASE_URLS.report}/dashbord/graph/${user?.userSub}?group=${group}&type=pie&startDate=${date.startDate}&endDate=${date.endDate}`;
          const { data } = await axiosInstance.get(url);

          if (data) {
            const { message } = data;
            const numbers = message.pie.data.map(Number);
            const Category: string[] = [];
            message.pie.categories.forEach((val: any) => {
              Category.push(val.toUpperCase());
            });
            setState((prevState) => ({
              ...prevState,
              categories: [...Category],
              data: [...numbers]
            }));
          }
        } catch (error) {
          console.error(error);
        } finally {
          setState((prevState) => ({
            ...prevState,
            isLoading: false
          }));
        }
      };
      fetchdata();
    }
  }, [Month, Year, date.endDate, date.startDate, group, isLoading, user?.userSub]);

  const chartOptions = merge(BaseOptionChart(), {
    colors: ['#fb8c00', '#fdd835', '#673ab7'],
    labels: [...state.categories.filter((val) => val.toUpperCase())],
    stroke: { colors: [theme.palette.background.paper] },
    legend: { floating: true, horizontalAlign: 'center' },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (seriesName: string) => fNumber(seriesName),
        title: {
          formatter: (seriesName: string) => `#${seriesName}`
        }
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '90%',
          labels: {
            value: {
              formatter: (val: number | string) => fNumber(val)
            },
            total: {
              formatter: (w: { globals: { seriesTotals: number[] } }) => {
                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return fNumber(sum);
              }
            }
          }
        }
      }
    }
  });

  const handleDate = (dates: { start: string; end: string }, text: string) => {
    setState((prevState: StateType) => ({
      ...prevState,
      date: {
        ...prevState.date,
        startDate: dates.start,
        endDate: dates.end
      },
      group: text.includes('Week') ? 'Week' : 'Month',
      isLoading: true,
      categories: [],
      data: []
    }));
  };

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
          <Typography variant="h6">Type of Payment</Typography>
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
            <DateRangePicker handleDate={handleDate} statedates={date} isgraph={true} />
          </Stack>
        </Stack>
      </Grid>
      {isLoading ? (
        <Stack direction="row" justifyContent="center" alignItems="center" className={classes.p30}>
          <CircularProgress color="inherit" size={40} />
        </Stack>
      ) : (
        <ChartWrapperStyle dir="ltr">
          {data.length !== 0 ? (
            <ReactApexChart type="donut" series={data} options={chartOptions} height={280} />
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
        </ChartWrapperStyle>
      )}
    </Card>
  );
}
