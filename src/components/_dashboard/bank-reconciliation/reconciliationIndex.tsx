import { reconList } from '@customTypes/transaction';
import {
  Autocomplete,
  Button,
  Card,
  CircularProgress,
  Grid,
  makeStyles,
  Stack,
  TextField,
  Typography
} from '@material-ui/core';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';
import { ErrorMsg } from 'utils/helpError';
import { DateRangePicker } from '../../../utils/dateRangepicker';
import ReconciliationContent from './reconciliationContent';

const useStyles = makeStyles({
  btnheight: {
    height: '100%'
  }
});

type MerchantList = {
  id: number;
  merchantName: string;
  userSubId: string;
  merchantId: number | null;
};

type StateType = {
  selectedMerchant: MerchantList;
  selectedMerchantView: MerchantList;
  merchantList: MerchantList[];
  transactionList: reconList[];
  isLoading: boolean;
  isLoadingtrans: boolean;
  date: { startDate: string; endDate: string };
  section: string;
  totalpage: number;
  rowsPerPage: number;
  page: number;
  reloadtransaction: boolean;
};

const ReconciliationIndex = () => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [state, setState] = useState<StateType>({
    selectedMerchant: { id: 0, merchantName: '', userSubId: '', merchantId: null },
    selectedMerchantView: { id: 0, merchantName: '', userSubId: '', merchantId: null },
    merchantList: [],
    transactionList: [],
    date: { startDate: '', endDate: '' },
    isLoading: false,
    isLoadingtrans: false,
    section: 'elavon',
    totalpage: 0,
    rowsPerPage: 10,
    page: 1,
    reloadtransaction: true
  });
  const {
    isLoading,
    selectedMerchant,
    merchantList,
    date,
    selectedMerchantView,
    transactionList,
    isLoadingtrans,
    section,
    totalpage,
    rowsPerPage,
    page,
    reloadtransaction
  } = state;

  useEffect(() => {
    const fetchMerchantList = async () => {
      setState((prevState) => ({
        ...prevState,
        isLoading: true
      }));
      try {
        const url = `${API_BASE_URLS.transaction}/transactions/merchants`;

        const { data } = await axiosInstance.get(url);

        if (data) {
          const { message } = data;
          const merchants: MerchantList[] =
            message.defaultGateway === 1 ? message.csCustomerId : message.spVendorId;
          if (merchants.length > 0) {
            setState((prevState) => ({
              ...prevState,
              merchantList: [...merchants],
              selectedMerchant: { ...merchants[0] }
            }));
          }
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
      } finally {
        setState((prevState) => ({
          ...prevState,
          isLoading: false
        }));
      }
    };
    fetchMerchantList();
  }, [enqueueSnackbar]);

  useEffect(() => {
    const fetchReconciliationList = async () => {
      setState((prevState) => ({
        ...prevState,
        transactionList: [],
        isLoadingtrans: true
      }));
      try {
        const url = `${
          API_BASE_URLS.reconciliation
        }/merchants/${section}?limit=${rowsPerPage}&offset=${rowsPerPage * (page - 1)}`;
        const { data } = await axiosInstance.get(url);

        if (data) {
          const { message } = data;
          if (message.data.length > 0) {
            setState((prevState) => ({
              ...prevState,
              totalpage: Math.ceil(message.count / rowsPerPage),
              transactionList: [...message.data]
            }));
          }
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
      } finally {
        setState((prevState) => ({
          ...prevState,
          isLoadingtrans: false,
          reloadtransaction: false
        }));
      }
    };
    if (reloadtransaction) {
      fetchReconciliationList();
    }
  }, [enqueueSnackbar, page, reloadtransaction, rowsPerPage, section]);

  const handleDate = (dates: { start: string; end: string }) => {
    setState((prevState: StateType) => ({
      ...prevState,
      filteroptions: {
        ...prevState,
        date: {
          ...prevState.date,
          startDate: dates.start,
          endDate: dates.end
        }
      }
    }));
  };

  const handleMerchantView = (val: any) => {
    val &&
      setState((prevState) => ({
        ...prevState,
        selectedMerchant: { ...val }
      }));
  };
  const sectionChange = (name: string) => {
    if (section !== name) {
      setState((prevState) => ({
        ...prevState,
        section: name,
        reloadtransaction: true
      }));
    }
  };
  const handlePage = (pages: any) => {
    setState((prevState: StateType) => ({
      ...prevState,
      page: pages,
      reloadtransaction: true
    }));
  };
  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'column' }} spacing={{ xs: 3, sm: 2 }}>
        <Grid container spacing={1}>
          <Grid item md={3}>
            <Autocomplete
              fullWidth
              onChange={(e, val) => {
                val &&
                  setState((prevState) => ({
                    ...prevState,
                    selectedMerchant: { ...val }
                  }));
              }}
              options={merchantList}
              getOptionLabel={(option) => option.merchantName}
              loading={isLoading}
              isOptionEqualToValue={(option, val) => option.merchantName === val.merchantName}
              value={selectedMerchant}
              disableClearable
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Merchant Id"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
          </Grid>
          <Grid item md={3}>
            <DateRangePicker handleDate={handleDate} statedates={date} />
          </Grid>
          <Grid item md={3}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, sm: 1 }}
              alignItems="center"
              className={classes.btnheight}
            >
              <Button variant="contained">Apply Filter</Button>
              <Button variant="outlined">Clear Filter</Button>
            </Stack>
          </Grid>
          <Grid item md={3}>
            <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
              <Typography>Last Updated Date:</Typography>
              <Typography>{format(new Date(), 'yyyy-MM-dd')}</Typography>
            </Stack>
          </Grid>
        </Grid>

        <Stack>
          <Card>
            <ReconciliationContent
              transactionList={transactionList}
              selectedMerchantView={selectedMerchantView}
              merchantList={merchantList}
              handleMerchantView={handleMerchantView}
              isLoading={isLoading}
              isLoadingtrans={isLoadingtrans}
              sectionChange={sectionChange}
              section={section}
              totalpage={totalpage}
              rowsPerPage={rowsPerPage}
              page={page}
              handlePage={handlePage}
            />
          </Card>
        </Stack>
      </Stack>
    </>
  );
};

export default ReconciliationIndex;
