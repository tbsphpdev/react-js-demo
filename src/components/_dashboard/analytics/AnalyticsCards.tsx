import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography
} from '@material-ui/core';
import { experimentalStyled as styled } from '@material-ui/core/styles';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import TrendingDownSharp from '@material-ui/icons/TrendingDownSharp';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import { LocalizationProvider, StaticDateRangePicker } from '@material-ui/lab';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import { DateRangePickPop } from 'components/DateRangePickPop';
import { addDays, format, subDays } from 'date-fns';
import useAuth from 'hooks/useAuth';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';
import { ErrorMsg } from 'utils/helpError';

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: 'none',
  textAlign: 'center',
  minWidth: '220px',
  padding: theme.spacing(3, 3),
  color: theme.palette.text.primary,
  cursor: 'pointer'
}));

type statetype = {
  Year: string | number;
  Month: string | number;
  categories: any[];
  data: any[];
  isLoading: boolean;
};

const AnalyticsCards = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuth();

  const [revenueDate, setRevenueDate] = useState<any>({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd')
  });
  const [transactionDate, setTransactionDate] = useState<any>({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd')
  });
  const [revenueData, setRevenueData] = useState<any>(null);
  const [transactionData, setTransactionData] = useState<any>(null);

  const [value, setValue] = useState<any>([null, null]);
  const [showDatePicker, setShowDatePicker] = useState('');

  useEffect(() => {
    const preloadRevenues = async () => {
      try {
        const url = `${API_BASE_URLS.report}/analytics/revenues/merchants/${user?.userSub}?startDate=${revenueDate.startDate}&endDate=${revenueDate.endDate}`;
        const response = await axiosInstance.get(url);
        if (response.data.message) {
          const tempPL = Number(response?.data?.message?.profitLoss);
          const tempTotal = Number(response?.data?.message?.revenue);
          const profitLoss = ((tempPL * 100) / (tempTotal || 1)).toFixed(2);
          setRevenueData({ revenue: tempTotal, profitLoss });
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
      }
    };

    preloadRevenues();
  }, [enqueueSnackbar, revenueDate, user?.userSub]);

  useEffect(() => {
    const preloadTransactions = async () => {
      try {
        const url = `${API_BASE_URLS.report}/analytics/transactions/merchants/${user?.userSub}?startDate=${transactionDate.startDate}&endDate=${transactionDate.endDate}`;
        const response = await axiosInstance.get(url);
        if (response.data.message) {
          const tempPL = Number(response?.data?.message?.profitLoss);
          const tempTotal = Number(response?.data?.message?.total);
          const profitLoss = ((tempPL * 100) / (tempTotal || 1)).toFixed(2);
          setTransactionData({ total: tempTotal, profitLoss });
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
      }
    };

    preloadTransactions();
  }, [enqueueSnackbar, transactionDate, user?.userSub]);

  const handleapplydate = (type: string) => {
    if (value[0] !== null && value[1] !== null) {
      if (type === 'revenue') {
        setRevenueDate((prevState: statetype) => ({
          ...prevState,
          startDate: format(new Date(value[0]), 'yyyy-MM-dd'),
          endDate: format(new Date(value[1]), 'yyyy-MM-dd')
        }));
      } else if (type === 'transaction') {
        setTransactionDate((prevState: statetype) => ({
          ...prevState,
          startDate: format(new Date(value[0]), 'yyyy-MM-dd'),
          endDate: format(new Date(value[1]), 'yyyy-MM-dd')
        }));
      }
      setShowDatePicker('');
      setValue([null, null]);
    }
  };

  const TransactionCard = () => (
    <RootStyle
      sx={{
        backgroundColor: '#c2edfe'
      }}
    >
      <Stack direction="column" spacing={1.5}>
        <Stack direction="row" spacing={0.5}>
          <Stack
            sx={{
              backgroundColor: '#54b4f1',
              borderRadius: '50%',
              padding: '2px',
              '& svg': { color: '#ffffff' }
            }}
          >
            <SwapHorizIcon sx={{ width: '.8em', height: '.8em' }} />
          </Stack>
          <Stack>
            <Typography variant="body1" fontSize=".9em">
              Transactions
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Stack>
            <Typography variant="subtitle1" fontSize="1.2em">
              {transactionData.total || 0}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <Stack
              sx={{
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                padding: '2px',

                height: '24px'
              }}
            >
              {transactionData.profitLoss >= 0 ? (
                <TrendingUpIcon sx={{ width: '.8em', height: '.8em', color: '#299d2f' }} />
              ) : (
                <TrendingDownSharp sx={{ width: '.8em', height: '.8em', color: '#FF4842' }} />
              )}
            </Stack>
            <Stack>
              <Typography variant="body1" fontSize=".9em">
                {transactionData.profitLoss > 0
                  ? `+${transactionData.profitLoss}%`
                  : `${transactionData.profitLoss}%`}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
        <Stack>
          <DateRangePickPop
            setDate={(val: { startDate: string; endDate: string }) => {
              setTransactionDate({
                startDate: format(new Date(val.startDate), 'yyyy-MM-dd'),
                endDate: format(new Date(val.endDate), 'yyyy-MM-dd')
              });
            }}
          />
        </Stack>
      </Stack>
    </RootStyle>
  );

  const DatePickerPopUp = () => (
    <Dialog open={!!showDatePicker} maxWidth="md">
      <DialogTitle>Select Date</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid item display={{ xs: 'none', md: 'block' }}>
            <StaticDateRangePicker
              displayStaticWrapperAs="desktop"
              value={value}
              onChange={(newValue) => {
                setValue(newValue);
              }}
              renderInput={(startProps, endProps) => (
                <>
                  <TextField {...startProps} />
                  <Box sx={{ mx: 2 }}> to </Box>
                  <TextField {...endProps} />
                </>
              )}
            />
          </Grid>
          <Grid item display={{ xs: 'block', md: 'none' }}>
            <StaticDateRangePicker
              displayStaticWrapperAs="mobile"
              value={value}
              onChange={(newValue) => {
                setValue(newValue);
              }}
              renderInput={(startProps, endProps) => (
                <>
                  <TextField {...startProps} />
                  <Box sx={{ mx: 2 }}> to </Box>
                  <TextField {...endProps} />
                </>
              )}
            />
          </Grid>
        </LocalizationProvider>

        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleapplydate(showDatePicker)}
          >
            Apply
          </Button>
          <Button onClick={() => setShowDatePicker('')} variant="outlined" color="error">
            Close
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );

  const RevenueCard = () => (
    <RootStyle
      sx={{
        backgroundColor: '#c8f9cc'
      }}
    >
      <Stack direction="column" spacing={1.5}>
        <Stack direction="row" spacing={0.5}>
          <Stack
            sx={{
              backgroundColor: '#78ca7e',
              borderRadius: '50%',
              padding: '2px',
              '& svg': { color: '#ffffff' }
            }}
          >
            <SwapHorizIcon sx={{ width: '.8em', height: '.8em' }} />
          </Stack>
          <Stack>
            <Typography variant="body1" fontSize=".9em">
              Revenue
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Stack>
            <Typography variant="subtitle1" fontSize="1.2em">
              {`£ ${revenueData.revenue || 0}`}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <Stack
              sx={{
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                padding: '2px',
                height: '24px'
              }}
            >
              {revenueData.profitLoss >= 0 ? (
                <TrendingUpIcon sx={{ width: '.8em', height: '.8em', color: '#299d2f' }} />
              ) : (
                <TrendingDownSharp sx={{ width: '.8em', height: '.8em', color: '#FF4842' }} />
              )}
            </Stack>

            <Stack>
              <Typography variant="body1" fontSize=".9em">
                {revenueData.profitLoss > 0
                  ? `+${revenueData.profitLoss}%`
                  : `${revenueData.profitLoss}%`}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
        <Stack>
          <DateRangePickPop
            setDate={(val: { startDate: string; endDate: string }) => {
              setRevenueDate({
                startDate: format(new Date(val.startDate), 'yyyy-MM-dd'),
                endDate: format(new Date(val.endDate), 'yyyy-MM-dd')
              });
            }}
          />
        </Stack>
      </Stack>
    </RootStyle>
  );
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <Stack>{transactionData && TransactionCard()}</Stack>
      <Stack>{revenueData && RevenueCard()}</Stack>
      <Stack>{DatePickerPopUp()}</Stack>
    </Stack>
  );
};

export default AnalyticsCards;
