import { recentRepeatTransactionState } from '@customTypes/transaction';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemText,
  makeStyles,
  MenuItem,
  OutlinedInput,
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
import AddCircleIcon from '@material-ui/icons/AddCircle';
import SearchIcon from '@material-ui/icons/Search';
import TableSkeletonLoad from 'components/common/TableSkeletonLoad';
import Scrollbar from 'components/Scrollbar';
import useAuth from 'hooks/useAuth';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'redux/store';
import { PATH_DASHBOARD } from 'routes/paths';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';
import { ErrorMsg } from 'utils/helpError';
import { amountValidation } from 'utils/RegexPatterns';
import { DateRangePicker } from '../../../utils/dateRangepicker';
import RepeatTransactionRow from './RepeatTransactionRow';

const TABLE_HEADERS = [
  'Date/Time',
  'Customer Name/Email',
  'Reference',
  'Amount Per Payment',
  'Frequency',
  'Number of Payments',
  'Status'
];

const useStyles = makeStyles({
  header: {
    padding: '20px'
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

  applybtn: {
    padding: '0px 6px'
  }
});

type filterotntype = {
  date: { startDate: string; endDate: string };
  customerName: string;
  email: string;
  references: string;
  createdBy: string;
  merchantId: string[];
  merchantSelectedName: string[];
};

type statetype = {
  page: number;
  rowsPerPage: number;
  filteroptions: filterotntype;
  morefilter: {
    searchsec: string;
    searchfield: string;
  };
  transactionlist: recentRepeatTransactionState[];
  applyfilter: boolean;
  userList: UserList[];
  merchants: MerchantList[];
  totalpage: number;
  gatewayId: number | null;
  isLoading: boolean;
  editedid: string;
};
type MerchantList = {
  id: number;
  merchantName: string;
  userSubId: string;
  merchantId: string;
};

type UserList = {
  id: number;
  name: string;
  companyName: string;
  userSubId: string;
};

const searchsec = [
  { name: 'Customer Name', value: 'customerName' },
  { name: 'Customer Email', value: 'email' },
  { name: 'Reference', value: 'references' }
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

const RepeatTransactionHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<statetype>({
    filteroptions: {
      date: {
        startDate: '',
        endDate: ''
      },
      customerName: '',
      email: '',
      references: '',
      createdBy: '',
      merchantId: [],
      merchantSelectedName: []
    },
    morefilter: {
      searchsec: '',
      searchfield: ''
    },
    userList: [],
    merchants: [],
    gatewayId: null,
    transactionlist: [],
    page: 1,
    totalpage: 0,
    rowsPerPage: 10,
    isLoading: true,
    applyfilter: true,
    editedid: ''
  });

  const classes = useStyles();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const {
    page,
    rowsPerPage,
    applyfilter,
    morefilter,
    filteroptions,
    totalpage,
    isLoading,
    transactionlist,
    merchants,
    editedid
  } = state;
  useEffect(() => {
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

    fetchmerchants();
  }, [enqueueSnackbar]);

  useEffect(() => {
    const fetchtransactionlist = async () => {
      try {
        setState((prevState: statetype) => ({
          ...prevState,
          isLoading: true
        }));

        let queries = '';
        for (const key of Object.keys(filteroptions)) {
          if (key !== 'date' && key !== 'merchantId' && key !== 'merchantSelectedName') {
            if ((filteroptions as any)[key] !== '') {
              queries += `&${key}=${(filteroptions as any)[key].replace('+', '')}`;
            }
          } else if (key === 'date') {
            if (
              (filteroptions as filterotntype)[key].startDate !== '' &&
              (filteroptions as filterotntype)[key].endDate !== ''
            ) {
              queries += `&startDate=${(filteroptions as filterotntype)[key].startDate}&endDate=${
                filteroptions.date.endDate
              }`;
            }
          } else if (key === 'merchantId') {
            if ((filteroptions as filterotntype)[key].length !== 0) {
              queries += `&${key}=${(filteroptions as filterotntype)[key].join(',')}`;
            }
          }
        }

        const url: string = `${
          API_BASE_URLS.transaction
        }/transactions/repeat/merchants?limit=${rowsPerPage}&offset=${
          rowsPerPage * (page - 1)
        }${queries}`;

        const { data } = await axiosInstance.get(url);

        setState((prevState: statetype) => ({
          ...prevState,
          transactionlist: [...data.message.rpt],
          totalpage: Math.ceil(data.message.count / prevState.rowsPerPage)
        }));
      } catch (error) {
        console.error(error);
      } finally {
        setState((prevState: statetype) => ({
          ...prevState,
          isLoading: false
        }));
      }
    };

    if (applyfilter) {
      fetchtransactionlist();
      setState((prevState: statetype) => ({
        ...prevState,
        applyfilter: false
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, state]);
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
      page: 1,
      applyfilter: false
    }));
  };

  const handlefields = (e: any) => {
    if (state.morefilter.searchsec === 'amount') {
      const value = e.target.value.replace(/[^0-9.]/g, '');
      if (amountValidation.test(value)) {
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

        date: {
          startDate: '',
          endDate: ''
        },
        customerName: '',
        email: '',
        references: '',
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

  const activebtn = () => {
    if (
      filteroptions.email !== '' ||
      filteroptions.customerName !== '' ||
      filteroptions.references !== '' ||
      filteroptions.date.startDate !== '' ||
      filteroptions.createdBy !== '' ||
      filteroptions.merchantId.length !== 0
    ) {
      return false;
    }
    return true;
  };

  /** *********************Filter Functions Ends ************************ */
  /** *********************Child Functions Starts ************************ */
  const handleCancelPauseEditSuccess = (id: string) => {
    setState((prevState) => ({
      ...prevState,
      applyfilter: true
    }));
    if (id) {
      setState((prevState) => ({
        ...prevState,
        editedid: id
      }));
    }
  };
  const cleareditid = () => {
    setState((prevState) => ({
      ...prevState,
      editedid: ''
    }));
  };

  /** *********************Child Functions Ends ************************ */

  const TRANSACTION_TABLE = transactionlist.map((transaction) => transaction);

  return (
    <Card>
      <Stack className={classes.header} spacing={{ xs: 2, sm: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 1 }}>
          {user?.gatewayId === 1 && (
            <Grid item xs={12} md={2}>
              <FormControl sx={{ width: '100%' }}>
                <InputLabel id="demo-simple-select-label">Select Merchant</InputLabel>
                <Select
                  fullWidth
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  multiple
                  value={filteroptions.merchantId}
                  onChange={handleSelectMerchant}
                  input={<OutlinedInput label="Method" />}
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
            </Grid>
          )}
          <Grid item xs={12} md={3}>
            <DateRangePicker handleDate={handleDate} statedates={filteroptions.date} />
          </Grid>
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={1}>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              onClick={() => {
                navigate(`${PATH_DASHBOARD.virtualTerminal.create}`, {
                  state: { isRepeat: 'repeat' }
                });
              }}
              sx={{ cursor: 'pointer' }}
            >
              Create
              <IconButton color="primary" size="small">
                <AddCircleIcon />
              </IconButton>
            </Stack>
          </Grid>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
          <Typography>Selected Filters:</Typography>
          <Grid item xs={12} md={8}>
            {filteroptions.email !== '' ||
            filteroptions.customerName !== '' ||
            filteroptions.references !== '' ||
            filteroptions.date.startDate !== '' ||
            filteroptions.createdBy !== '' ||
            filteroptions.merchantId.length !== 0 ? (
              <Stack direction={{ xs: 'row', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
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
                  {filteroptions.email !== '' && (
                    <Grid item>
                      <Chip
                        label={`email:${filteroptions.email}`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('email')}
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
                  {filteroptions.createdBy !== '' && (
                    <Grid item>
                      <Chip
                        label={`Merchant: ${
                          state.userList[
                            state.userList.findIndex(
                              (element: any) =>
                                element.userSubId.toString() === filteroptions.createdBy.toString()
                            )
                          ].name
                        }`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('createdBy')}
                      />
                    </Grid>
                  )}
                </Grid>
              </Stack>
            ) : (
              <Typography>No Selected Filters</Typography>
            )}
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
                  {TABLE_HEADERS.map((header, idx) => (
                    <TableCell key={`transaction-header-${idx}`}>{header}</TableCell>
                  ))}
                  <TableCell colSpan={2} align="center" />
                </TableRow>
              </TableHead>
              <TableBody>
                {!isLoading &&
                  TRANSACTION_TABLE.map((row) => (
                    <RepeatTransactionRow
                      key={row.id}
                      row={row}
                      editedid={editedid}
                      handleCancelPauseEditSuccess={handleCancelPauseEditSuccess}
                      cleareditid={cleareditid}
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
        {!isLoading && (
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

export default RepeatTransactionHistory;
