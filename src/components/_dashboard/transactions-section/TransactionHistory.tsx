import { recentTransactionState } from '@customTypes/transaction';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  ListItemText,
  makeStyles,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import TableSkeletonLoad from 'components/common/TableSkeletonLoad';
import Scrollbar from 'components/Scrollbar';
import useAuth from 'hooks/useAuth';
import { usePrevious } from 'hooks/usePrevious';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { cancelTransaction, clearTransactionList, getTransactionList } from 'redux/slices/user';
import { RootState, useDispatch, useSelector } from 'redux/store';
import axiosInstance from 'utils/axios';
import { ICONS } from 'utils/blinkIcons';
import { API_BASE_URLS } from 'utils/constant';
import { ErrorMsg } from 'utils/helpError';
import { DateRangePicker } from '../../../utils/dateRangepicker';
import TransactionRow from './TransactionRow';

const TABLE_HEADERS = ['Date/Time', 'Customer Name', 'Card', 'Order Reference', 'Amount', 'Status'];

const useStyles = makeStyles({
  header: {
    padding: '20px'
  },
  search: {
    width: '20%'
  },
  searchdrop: {
    '& fieldset': {
      padding: '8px 0px 0px 8px'
    },
    marginRight: '3px'
  },
  buttonheight: {
    height: '56px',
    boxShadow: 'none'
  },
  colorskyblue: {
    color: '#6fb9ff'
  },
  colorgreyback: {
    backgroundColor: '#f1f6ff'
  },
  colorgrey: {
    color: '#a4adb8'
  },
  filterbtn: {
    padding: '0px'
  },
  paginationroot: {
    alignItems: 'end'
  },
  paginationposition: {
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  paginationdrop: {
    padding: '0px 27px'
  },
  datepickerroot: {
    border: '1px solid #dde1e4',
    borderRadius: '8px',
    padding: '0px'
  },
  datepickerpadding: {
    padding: '8px 0px',
    justifyContent: 'space-between',
    width: '100%'
  },
  applybtn: {
    padding: '0px 6px'
  }
});

type statetype = {
  page: number;
  rowsPerPage: number;
  filteroptions: {
    status: string[];
    mid: string[];
    transactionMethod: string[];
    action: string[];
    date: { startDate: string; endDate: string };
    customerName: string;
    email: string;
    references: string;
    amount: string;
    lastFour: string;
    blinkUniqueReference: string;
    createdBy: string;
    merchantId: string[];
    merchantSelectedName: string[];
  };
  morefilter: {
    searchsec: string;
    searchfield: string;
  };
  userList: UserList[];
  Listdata: recentTransactionState[];
  applyfilter: boolean;
  merchants: MerchantList[];
  gatewayId: number | null;
};

type UserList = {
  id: number;
  name: string;
  companyName: string;
  userSubId: string;
};

type MerchantList = {
  id: number;
  merchantName: string;
  userSubId: string;
  merchantId: string;
};

const searchsec = [
  { name: 'Customer Name', value: 'customerName' },
  { name: 'Customer Email', value: 'email' },
  { name: 'Reference', value: 'references' },
  { name: 'Amount', value: 'amount' },
  { name: 'Card', value: 'lastFour' },
  { name: 'Blink Unique Reference', value: 'blinkUniqueReference' }
];

const options = [
  {
    value: 'verified',
    label: 'Verified'
  },
  {
    value: 'authorised',
    label: 'Authorised'
  },
  {
    value: 'processed',
    label: 'Processed'
  },
  {
    value: 'cancelled',
    label: 'Cancelled'
  },
  {
    value: 'reserved',
    label: 'Reserved'
  },
  {
    value: 'rejected',
    label: 'Rejected'
  }
];
const methodOptions = [
  {
    value: 'paylink',
    label: 'Paylink'
  },
  {
    value: 'vt',
    label: 'VT'
  },
  {
    value: 'blinkPage',
    label: 'Blink Page'
  }
];

const typeOptions = [
  {
    value: 'REFUND',
    label: 'REFUND'
  }
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

const TransactionHistory = () => {
  const { gatewayactionsvt, fetchactions, user } = useAuth();
  const [state, setState] = useState<statetype>({
    filteroptions: {
      status: [],
      date: {
        startDate: '',
        endDate: ''
      },
      mid: [],
      transactionMethod: [],
      action: [],
      customerName: '',
      email: '',
      references: '',
      amount: '',
      lastFour: '',
      createdBy: '',
      blinkUniqueReference: '',
      merchantId: [],
      merchantSelectedName: []
    },
    morefilter: {
      searchsec: '',
      searchfield: ''
    },
    userList: [],
    Listdata: [],
    merchants: [],
    gatewayId: null,
    page: 1,
    rowsPerPage: 10,
    applyfilter: true
  });
  const { id, subid } = useParams();
  const classes = useStyles();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { transactionlist, isLoading, totalpage } = useSelector((state: RootState) => state.user);
  const { page, rowsPerPage, applyfilter, userList, morefilter, filteroptions, merchants } = state;
  const prevState = usePrevious({ isLoading });
  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const url = `/${API_BASE_URLS.user}/merchant/users`;

        const { data } = await axiosInstance.get(url);

        if (data) {
          const { message } = data;
          setState((prevState) => ({
            ...prevState,
            userList: [...message]
          }));
        }
      } catch (error) {
        console.error(error);
      }
    };

    const fetchmerchants = async () => {
      try {
        const url = `${API_BASE_URLS.transaction}/transactions/merchants`;

        const { data } = await axiosInstance.get(url);

        if (data) {
          const { message } = data;
          const tempmerchantlist: MerchantList[] =
            message.defaultGateway === 1 ? message.csCustomerId : message.spVendorId;
          setState((prevState) => ({
            ...prevState,
            merchants: [...tempmerchantlist]
          }));
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
      }
    };

    fetchUserList();
    fetchmerchants();
    if (gatewayactionsvt.length === 0) {
      fetchactions(user?.gatewayId);
    }
  }, [enqueueSnackbar, fetchactions, gatewayactionsvt.length, user?.gatewayId]);

  useEffect(() => {
    if (applyfilter) {
      dispatch(clearTransactionList());
      dispatch(getTransactionList(state, { id, subid }));
      setState((prevState: statetype) => ({
        ...prevState,
        applyfilter: false
      }));
    }
    if (prevState?.isLoading === true && isLoading === false) {
      setState((prevState) => ({
        ...prevState,
        Listdata: [...transactionlist]
      }));
    }
  }, [dispatch, state, isLoading, applyfilter, prevState?.isLoading, id, subid, transactionlist]);

  /** *********************Pagination Starts********************* */
  const handlePage = (pages: any) => {
    setState((prevState) => ({
      ...prevState,
      page: pages,
      applyfilter: true
    }));
  };

  const handleChangeRowsPerPage = (event: any) => {
    setState((prevState) => ({
      ...prevState,
      page: 1,
      rowsPerPage: parseInt(event.target.value, 10),
      applyfilter: true
    }));
  };
  /** *********************Pagination Ends********************* */
  /** *********************Date Functions ********************* */
  const handleDate = (dates: { start: string; end: string }) => {
    setState((prevState: statetype) => ({
      ...prevState,
      filteroptions: {
        ...prevState.filteroptions,
        date: {
          ...prevState.filteroptions.date,
          startDate: dates.start,
          endDate: dates.end
        }
      }
    }));
  };
  /** *********************Date Functions ends ********************* */
  /** *********************Filter Functions ************************ */
  const addFilter = () => {
    setState((prevState: statetype) => ({
      ...prevState,
      filteroptions: {
        ...prevState.filteroptions,
        [morefilter.searchsec]: morefilter.searchfield
      },
      morefilter: {
        ...prevState.morefilter,
        searchsec: '',
        searchfield: ''
      },
      applyfilter: false
    }));
  };

  const handlefilter = (names: string, value: any) => {
    setState((prevState: statetype) => ({
      ...prevState,
      filteroptions: {
        ...prevState.filteroptions,
        [names]: value
      }
    }));
  };

  const handlefields = (e: any) => {
    if (state.morefilter.searchsec === 'amount') {
      const value = e.target.value.replace(/[^0-9.]/g, '');
      const regex = /^[0-9]*(\.[0-9]{0,2})?$/g;
      if (regex.test(value)) {
        setState((prevState: statetype) => ({
          ...prevState,
          morefilter: {
            ...prevState.morefilter,
            searchfield: value
          }
        }));
      }
    } else if (state.morefilter.searchsec === 'lastFour') {
      const value = e.target.value.replace(/[^0-9]/g, '');
      const regex = /^[0-9]{0,4}$/g;

      if (regex.test(value)) {
        setState((prevState: statetype) => ({
          ...prevState,
          morefilter: {
            ...prevState.morefilter,
            searchfield: value
          }
        }));
      }
    } else {
      setState((prevState: statetype) => ({
        ...prevState,
        morefilter: {
          ...prevState.morefilter,
          searchfield: e.target.value
        }
      }));
    }
  };

  const clearchips = async () => {
    setState((prevState: statetype) => ({
      ...prevState,
      filteroptions: {
        ...prevState.filteroptions,
        status: [],
        date: {
          startDate: '',
          endDate: ''
        },
        mid: [],
        transactionMethod: [],
        action: [],
        customerName: '',
        email: '',
        references: '',
        amount: '',
        lastFour: '',
        createdBy: '',
        merchantId: [],
        merchantSelectedName: []
      },
      morefilter: {
        ...prevState.morefilter,
        searchsec: '',
        searchfield: ''
      },
      page: 1,
      applyfilter: true
    }));
  };

  const clearsinglechips = (clear: string) => {
    if (
      clear !== 'status' &&
      clear !== 'mid' &&
      clear !== 'transactionMethod' &&
      clear !== 'action' &&
      clear !== 'merchantId'
    ) {
      setState((prevState: statetype) => ({
        ...prevState,
        filteroptions: {
          ...prevState.filteroptions,
          [clear]:
            clear !== 'date'
              ? ''
              : {
                  startDate: '',
                  endDate: ''
                }
        },
        page: 1,
        applyfilter: true
      }));
    } else {
      clear === 'merchantId'
        ? setState((prevState: statetype) => ({
            ...prevState,
            filteroptions: {
              ...prevState.filteroptions,
              merchantId: [],
              merchantSelectedName: []
            },
            page: 1,
            applyfilter: true
          }))
        : setState((prevState: statetype) => ({
            ...prevState,
            filteroptions: {
              ...prevState.filteroptions,
              [clear]: []
            },
            page: 1,
            applyfilter: true
          }));
    }
  };

  const handleSelectMerchant = (e: any) => {
    const names: string[] = [];
    if (e.target.value.length !== 0) {
      e.target.value.forEach((id: string) => {
        merchants.forEach((merchant) => {
          if (id === merchant.merchantId) {
            names.push(merchant.merchantName);
          }
        });
      });
    }
    setState((prevState: statetype) => ({
      ...prevState,
      filteroptions: {
        ...prevState.filteroptions,
        merchantId: e.target.value,
        merchantSelectedName: [...names]
      }
    }));
  };

  const handleSelectUser = (e: any) => {
    setState((prevState: statetype) => ({
      ...prevState,
      filteroptions: {
        ...prevState.filteroptions,
        createdBy: e.target.value
      }
    }));
  };

  /** *********************Filter Functions Ends ************************ */
  /** *********************Cancel Transaction starts *************************** */

  const cancelTransactionChange = (index: number) => {
    dispatch(cancelTransaction(index));
  };

  /** *********************Cancel Transaction ends *************************** */
  /** *********************Other functions *********************************** */
  const handlererunrefundsuccess = () => {
    setState((prevState) => ({
      ...prevState,
      page: 1,
      applyfilter: true
    }));
  };

  const activebtn = () => {
    if (
      filteroptions.amount !== '' ||
      filteroptions.email !== '' ||
      filteroptions.customerName !== '' ||
      filteroptions.references !== '' ||
      filteroptions.status.length !== 0 ||
      filteroptions.date.startDate !== '' ||
      filteroptions.transactionMethod.length !== 0 ||
      filteroptions.action.length !== 0 ||
      filteroptions.createdBy !== '' ||
      filteroptions.lastFour !== '' ||
      filteroptions.merchantId.length !== 0 ||
      filteroptions.blinkUniqueReference !== ''
    ) {
      return false;
    }
    return true;
  };
  /** *********************Other functions ends *********************************** */
  const TRANSACTION_TABLE = transactionlist.map((transaction) => transaction);
  return (
    <Card>
      <Stack className={classes.header} spacing={{ xs: 3, sm: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 1 }}>
          {user?.gatewayId === 1 && (
            <FormControl sx={{ width: 100 }} className={classes.search}>
              <InputLabel id="Merchant-label">Select Merchant</InputLabel>
              <Select
                labelId="Merchant-label"
                id="Merchant-label-select"
                multiple
                label="Select Merchant"
                value={filteroptions.merchantId}
                onChange={handleSelectMerchant}
                renderValue={(selected) => `${selected.length} Merchant Selected`}
                MenuProps={MenuProps}
              >
                {merchants.map((data, index) => (
                  <MenuItem key={data.merchantId} value={data.merchantId}>
                    <Checkbox checked={filteroptions.merchantId.indexOf(data.merchantId) > -1} />
                    <ListItemText primary={data.merchantName} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {userList.length !== 0 && (
            <FormControl sx={{ width: 100 }} className={classes.search}>
              <InputLabel id="User-label">Select User</InputLabel>
              <Select
                labelId="User-label"
                id="User-label-select"
                value={filteroptions.createdBy}
                label="Select User"
                onChange={handleSelectUser}
              >
                {userList.map((data, index) => (
                  <MenuItem value={data.userSubId} key={index}>
                    {data.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl sx={{ width: 100 }} className={classes.search}>
            <InputLabel id="method-label">Trans Method</InputLabel>
            <Select
              fullWidth
              labelId="method-label"
              id="method-label-checkbox"
              label="Trans Method"
              multiple
              value={filteroptions.transactionMethod}
              onChange={(e: any) => {
                handlefilter('transactionMethod', e.target.value);
              }}
              renderValue={(selected) => selected.join(', ')}
            >
              {methodOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={filteroptions.transactionMethod.indexOf(option.value) > -1} />
                  <ListItemText primary={option.label} />

                  <Box
                    display="flex"
                    justifyContent="center"
                    sx={{
                      width: (theme) => theme.spacing(2.25),
                      height: '5vh'
                    }}
                  >
                    {ICONS[option.value.toLowerCase()]}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ width: 100 }} className={classes.search}>
            <InputLabel id="Type-label">Trans Type</InputLabel>
            <Select
              fullWidth
              labelId="Type-label"
              id="Type-label-checkbox"
              label="Trans Type"
              multiple
              value={filteroptions.action}
              onChange={(e: any) => {
                handlefilter('action', e.target.value);
              }}
              renderValue={(selected) => selected.join(', ')}
            >
              {typeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={filteroptions.action.indexOf(option.value) > -1} />
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
              {gatewayactionsvt.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={filteroptions.action.indexOf(option.value) > -1} />
                  <ListItemText primary={option.value} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1, width: 300 }} className={classes.search}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              fullWidth
              labelId="status-label"
              label="Status"
              id="status-label-checkbox"
              multiple
              value={filteroptions.status}
              onChange={(e: any) => {
                handlefilter('status', e.target.value);
              }}
              renderValue={(selected) => selected.join(', ')}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={filteroptions.status.indexOf(option.value) > -1} />
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 1 }}>
          <Grid item xs={12} md={3}>
            <DateRangePicker handleDate={handleDate} statedates={filteroptions.date} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              value={morefilter.searchfield}
              id="input-with-icon-textfield"
              placeholder="Enter Keyword..."
              disabled={morefilter.searchsec === ''}
              onChange={(e: any) => {
                handlefields(e);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FormControl variant="outlined" className={classes.searchdrop}>
                      <Select
                        labelId="demo-simple-select-outlined-label"
                        id="demo-simple-select-outlined"
                        displayEmpty
                        value={morefilter.searchsec}
                        onChange={(e: any) => {
                          setState((prevState: statetype) => ({
                            ...prevState,
                            morefilter: {
                              ...prevState.morefilter,
                              searchsec: e.target.value
                            }
                          }));
                        }}
                        MenuProps={{
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left'
                          }
                        }}
                      >
                        <MenuItem value="">
                          <em>Select Search</em>
                        </MenuItem>
                        {searchsec.map((option, index) => (
                          <MenuItem value={option.value} key={index}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <SearchIcon />
                  </InputAdornment>
                ),
                style: {
                  paddingLeft: '0'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
              <Button
                onClick={addFilter}
                className={`${classes.colorskyblue} ${classes.buttonheight}`}
                disabled={morefilter.searchsec === '' || morefilter.searchfield === ''}
              >
                Add Filter
              </Button>
            </Stack>
          </Grid>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
          <Typography>Selected Filters:</Typography>

          <Grid item xs={12} md={8}>
            <Stack direction={{ xs: 'row', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
              {filteroptions.amount !== '' ||
              filteroptions.email !== '' ||
              filteroptions.customerName !== '' ||
              filteroptions.references !== '' ||
              filteroptions.status.length !== 0 ||
              filteroptions.date.startDate !== '' ||
              filteroptions.transactionMethod.length !== 0 ||
              filteroptions.action.length !== 0 ||
              filteroptions.lastFour !== '' ||
              filteroptions.merchantId.length !== 0 ||
              filteroptions.createdBy !== '' ||
              filteroptions.blinkUniqueReference !== '' ? (
                <Grid container spacing={2}>
                  {filteroptions.customerName !== '' && (
                    <Grid item>
                      <Chip
                        label={`Customer Name:${filteroptions.customerName}`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('customerName')}
                      />
                    </Grid>
                  )}
                  {filteroptions.amount !== '' && (
                    <Grid item>
                      <Chip
                        label={`amount:${filteroptions.amount}`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('amount')}
                      />
                    </Grid>
                  )}
                  {filteroptions.email !== '' && (
                    <Grid item>
                      <Chip
                        label={`email:${filteroptions.email}`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('email')}
                      />
                    </Grid>
                  )}
                  {filteroptions.date.startDate !== '' && filteroptions.date.endDate !== '' && (
                    <Grid item>
                      <Chip
                        label={`date: ${
                          filteroptions.date.startDate !== filteroptions.date.endDate
                            ? `(${filteroptions.date.startDate}) - (${filteroptions.date.endDate})`
                            : `${filteroptions.date.startDate}`
                        }`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('date')}
                      />
                    </Grid>
                  )}
                  {filteroptions.references !== '' && (
                    <Grid item>
                      <Chip
                        label={`references:${filteroptions.references}`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('references')}
                      />
                    </Grid>
                  )}
                  {filteroptions.blinkUniqueReference !== '' && (
                    <Grid item>
                      <Chip
                        label={`blink unique references:${filteroptions.blinkUniqueReference}`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('blinkUniqueReference')}
                      />
                    </Grid>
                  )}
                  {filteroptions.lastFour !== '' && (
                    <Grid item>
                      <Chip
                        label={`card:${filteroptions.lastFour}`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('lastFour')}
                      />
                    </Grid>
                  )}
                  {filteroptions.createdBy !== '' && (
                    <Grid item>
                      <Chip
                        label={`User: ${
                          state.userList[
                            state.userList.findIndex(
                              (element: any) => element.userSubId === filteroptions.createdBy
                            )
                          ].name
                        }`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('createdBy')}
                      />
                    </Grid>
                  )}
                  {filteroptions.merchantId.length !== 0 && (
                    <Grid item>
                      <Chip
                        label={`Merchant: ${filteroptions.merchantSelectedName
                          .slice(0, 2)
                          .join(',')} ${
                          filteroptions.merchantSelectedName.length > 2
                            ? `+${filteroptions.merchantSelectedName.length - 2} more`
                            : ''
                        }`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('merchantId')}
                      />
                    </Grid>
                  )}
                  {filteroptions.status.length !== 0 && (
                    <Grid item>
                      <Chip
                        label={`status:${filteroptions.status.slice(0, 2).join(',')} ${
                          filteroptions.status.length > 2
                            ? `+${filteroptions.status.length - 2} more`
                            : ''
                        }`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('status')}
                      />
                    </Grid>
                  )}
                  {filteroptions.action.length !== 0 && (
                    <Grid item>
                      <Chip
                        label={`Type:${filteroptions.action.slice(0, 2).join(',')} ${
                          filteroptions.action.length > 2
                            ? `+${filteroptions.action.length - 2} more`
                            : ''
                        }`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('action')}
                      />
                    </Grid>
                  )}
                  {filteroptions.transactionMethod.length !== 0 && (
                    <Grid item>
                      <Chip
                        label={`Method:${filteroptions.transactionMethod
                          .slice(0, 2)
                          .join(',')
                          .replace('vt', 'VT')}  ${
                          filteroptions.transactionMethod.length > 2
                            ? `+${filteroptions.transactionMethod.length - 2} more`
                            : ''
                        }`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('transactionMethod')}
                      />
                    </Grid>
                  )}
                </Grid>
              ) : (
                'No Selected Filters'
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} md={2}>
            <Stack direction={{ xs: 'row', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
              <Button
                variant="contained"
                className={classes.applybtn}
                onClick={() => {
                  setState((prevState: statetype) => ({
                    ...prevState,
                    page: 1,
                    applyfilter: true
                  }));
                }}
                disabled={activebtn()}
              >
                Apply Filter
              </Button>
              <Button className={classes.colorskyblue} onClick={clearchips}>
                Clear All
              </Button>
            </Stack>
          </Grid>
        </Stack>
      </Stack>
      <Box>
        <Scrollbar>
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  {TABLE_HEADERS.map((header, idx) => (
                    <TableCell key={`transaction-header-${idx}`}>{header}</TableCell>
                  ))}
                  <TableCell colSpan={2} align="center" />
                </TableRow>
              </TableHead>
              <TableBody>
                {!isLoading &&
                  TRANSACTION_TABLE.map((row, index) => (
                    <TransactionRow
                      key={row.id}
                      row={row}
                      handlererunrefundsuccess={handlererunrefundsuccess}
                      cancelTransactionChange={cancelTransactionChange}
                      index={index}
                    />
                  ))}

                {isLoading && <TableSkeletonLoad colSpan={TABLE_HEADERS.length} />}
                {!isLoading && TRANSACTION_TABLE.length < 1 && (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEADERS.length + 1}>
                      <Typography color="textSecondary">No Transactions Found...</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        {!isLoading && TRANSACTION_TABLE.length !== 0 && (
          <Stack className={classes.paginationroot}>
            <Stack direction="row" className={classes.paginationposition}>
              <Typography>Rows per page :</Typography>
              <FormControl sx={{ m: 1, minWidth: 40 }}>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={rowsPerPage}
                  onChange={(e) => handleChangeRowsPerPage(e)}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                </Select>
              </FormControl>
              <Pagination count={totalpage} page={page} onChange={(e, page) => handlePage(page)} />
            </Stack>
          </Stack>
        )}
      </Box>
    </Card>
  );
};

export default TransactionHistory;
