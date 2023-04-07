import { merge } from 'lodash';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
// material
import { Card, Stack, Grid, Typography, CircularProgress, makeStyles } from '@material-ui/core';
import { experimentalStyled as styled } from '@material-ui/core/styles';

import { API_BASE_URLS } from 'utils/constant';
import axiosInstance from 'utils/axios';
import { DateRangePicker } from 'utils/dateRangepicker';
import { addDays, format, getYear, startOfMonth } from 'date-fns';
import useAuth from 'hooks/useAuth';
import { fillStartDate } from 'utils/chart';
import { BaseOptionChart } from '../../charts';
// ----------------------------------------------------------------------

type statetype = {
  Year: string | number;
  Month: string | number;
  date: { startDate: string; endDate: string };
  categories: any[];
  data: any[];
  isLoading: boolean;
  group: string;
};

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

const useStyles = makeStyles({
  p30: {
    padding: '30px'
  }
});
export default function AppRevenue() {
  const classes = useStyles();
  const [state, setState] = useState<statetype>({
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

  const { user } = useAuth();

  const { Year, Month, data, isLoading, date, group } = state;

  useEffect(() => {
    if (isLoading) {
      const fetchdata = async () => {
        try {
          const url = `${API_BASE_URLS.report}/dashbord/graph/${user?.userSub}?group=${group}&type=line&startDate=${date.startDate}&endDate=${date.endDate}`;

          const { data } = await axiosInstance.get(url);
          if (data) {
            const { message } = data;
            const updatedData = fillStartDate(date.startDate, message?.line?.data);
            const tempdata = [{ year: Year, data: [...updatedData] }];
            setState((prevState) => ({
              ...prevState,

              data: [...tempdata]
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
    xaxis: {
      categories: [...state.categories],
      type: 'datetime'
    }
  });

  const handleDate = (dates: { start: string; end: string }, text: string) => {
    setState((prevState: statetype) => ({
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
          <Typography variant="h6">Revenue</Typography>
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
        <ChartWrapperStyle key={Year} sx={{ mx: 3 }} dir="ltr">
          {data.length !== 0 ? (
            <ReactApexChart type="line" series={data} options={chartOptions} height={365} />
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
