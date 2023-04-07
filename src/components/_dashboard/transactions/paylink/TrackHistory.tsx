import { useEffect, useState } from 'react';
import axiosInstance from 'utils/axios';
import {
  Card,
  Table,
  TableContainer,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Paper,
  Box,
  makeStyles,
  InputAdornment,
  Stack,
  TextField,
  MenuItem,
  Button,
  Grid,
  FormControl,
  Select,
  Typography,
  Chip,
  Pagination,
  Checkbox,
  OutlinedInput,
  InputLabel,
  ListItemText
} from '@material-ui/core';
import Scrollbar from 'components/Scrollbar';
import { API_BASE_URLS } from 'utils/constant';
import { TrackPaylinkState } from '@customTypes/transaction';
import { useSnackbar } from 'notistack';
import { ErrorMsg } from 'utils/helpError';
import SearchIcon from '@material-ui/icons/Search';
import TableSkeletonLoad from 'components/common/TableSkeletonLoad';
import { amountValidation } from 'utils/RegexPatterns';
import TrackRow from './TrackRow';
import { DateRangePicker } from '../../../../utils/dateRangepicker';

const TABLE_HEADERS = ['Customer Name', 'Email/SMS', 'Reference', 'Amount', 'Date/Time', 'Status'];

const useStyles = makeStyles({
  header: {
    padding: '20px'
  },
  search: {
    margin: '0px 8px'
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
    borderTop: 'solid 1px #00000063',
    alignItems: 'end'
  },
  paginationposition: {
    justifyContent: 'flex-end',
    alignItems: 'center'
  },

  applybtn: {
    padding: '0px 6px'
  }
});

const options = [
  {
    value: 'paid',
    label: 'Paid'
  },
  {
    value: 'unpaid',
    label: 'Unpaid'
  },
  {
    value: 'unopened',
    label: 'Unopened'
  },
  {
    value: 'cancelled',
    label: 'Cancelled'
  }
];

const searchsec = [
  { name: 'Customer Name', value: 'customerName' },
  { name: 'Customer Email', value: 'email' },
  { name: 'Reference', value: 'references' },
  { name: 'Amount', value: 'amount' },
  { name: 'PhoneNumber', value: 'phoneNumber' }
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

type filterotntype = {
  status: string[];
  createdBy: string;
  date: { startDate: string; endDate: string };
  customerName: string;
  email: string;
  references: string;
  amount: string;
  phoneNumber: string;
};

type statetype = {
  PaylinkData: TrackPaylinkState[];
  userList: UserList[];
  page: number;
  totalpage: number;
  rowsPerPage: number;
  isLoading: boolean;
  filteroptions: filterotntype;
  morefilter: {
    searchsec: string;
    searchfield: string;
  };
  applyfilter: boolean;
  iscancelloading: boolean;
};

type UserList = {
  id: number;
  name: string;
  companyName: string;
  userSubId: string;
};

const TrackHistory = () => {
  const [state, setState] = useState<statetype>({
    PaylinkData: [],
    page: 1,
    totalpage: 0,
    rowsPerPage: 10,
    isLoading: true,
    applyfilter: true,
    userList: [],
    filteroptions: {
      status: [],
      date: {
        startDate: '',
        endDate: ''
      },
      customerName: '',
      email: '',
      phoneNumber: '',
      references: '',
      amount: '',
      createdBy: ''
    },
    morefilter: {
      searchsec: '',
      searchfield: ''
    },
    iscancelloading: false
  });

  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const {
    PaylinkData,
    page,
    totalpage,
    rowsPerPage,
    isLoading,
    filteroptions,
    morefilter,
    applyfilter,
    userList
  } = state;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setState((prevState: statetype) => ({
          ...prevState,
          PaylinkData: [],
          applyfilter: false,
          isLoading: true
        }));
        let queries = '';
        for (const key of Object.keys(filteroptions)) {
          if (key !== 'status' && key !== 'date') {
            if ((filteroptions as any)[key] !== '') {
              queries += `&${key}=${(filteroptions as any)[key].replace('+', '')}`;
            }
          } else if (key === 'status') {
            if ((filteroptions as filterotntype)[key].length !== 0) {
              queries += `&${key}=${(filteroptions as filterotntype)[key].join(',')}`;
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
          }
        }

        const url: string = `${API_BASE_URLS.paylink}/paylinks?limit=${rowsPerPage}&offset=${
          rowsPerPage * (page - 1)
        }${queries}`;
        const { data } = await axiosInstance.get(url);

        setState((prevState: statetype) => ({
          ...prevState,
          PaylinkData: [...data.message.paylinks],
          totalpage: Math.ceil(data.message.count / prevState.rowsPerPage)
        }));
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
      } finally {
        setState((prevState: statetype) => ({
          ...prevState,
          isLoading: false
        }));
      }
    };
    if (applyfilter) {
      fetchTransactions();
      setState((prevState: statetype) => ({
        ...prevState,
        applyfilter: false
      }));
    }
  }, [applyfilter, enqueueSnackbar, filteroptions, page, rowsPerPage, state]);

  useEffect(() => {
    fetchUserList();
  }, []);

  /* *****************************Filter functions************************************ */

  // ------------------------------------------chips functions----------------------------
  const clearchips = async () => {
    setState((prevState: statetype) => ({
      ...prevState,
      filteroptions: {
        ...prevState.filteroptions,
        status: [],
        createdBy: '',
        date: {
          startDate: '',
          endDate: ''
        },
        customerName: '',
        email: '',
        references: '',
        phoneNumber: '',
        amount: ''
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
    if (clear !== 'status') {
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
      setState((prevState: statetype) => ({
        ...prevState,
        filteroptions: {
          ...prevState.filteroptions,
          status: []
        },
        page: 1,
        applyfilter: true
      }));
    }
  };

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
  // --------------------------------------------chip function ends-------------------------
  // --------------------------------------------other filter functions---------------------
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
  const handlefilter = (names: string, value: any) => {
    setState((prevState: statetype) => ({
      ...prevState,
      filteroptions: {
        ...prevState.filteroptions,
        [names]: value
      }
    }));
  };

  const activebtn = () => {
    if (
      filteroptions.amount !== '' ||
      filteroptions.phoneNumber !== '' ||
      filteroptions.email !== '' ||
      filteroptions.customerName !== '' ||
      filteroptions.references !== '' ||
      filteroptions.status.length !== 0 ||
      filteroptions.createdBy !== '' ||
      filteroptions.date.startDate !== ''
    ) {
      return false;
    }
    return true;
  };
  // --------------------------------------------other filter functions ends-----------------

  /* *****************************Filter functions ends************************************ */
  /* *****************************Page Change functions************************************ */
  const handleChangeRowsPerPage = (event: any) => {
    setState((prevState: statetype) => ({
      ...prevState,
      page: 1,
      rowsPerPage: parseInt(event.target.value, 10),
      applyfilter: true
    }));
  };
  const handlePage = (pages: any) => {
    setState((prevState: statetype) => ({
      ...prevState,
      page: pages,
      applyfilter: true
    }));
  };
  /* *****************************Page Change functions ends************************************ */
  /* *****************************cancel paylink starts here************************************ */
  const handleCancel = async (id: number, index: number) => {
    setState((prevState: statetype) => ({
      ...prevState,
      iscancelloading: true
    }));
    try {
      const url: string = `${API_BASE_URLS.paylink}/paylinks/cancel/${id}`;

      const { data } = await axiosInstance.delete(url);

      if (data?.message === 'Paylink is cancelled') {
        const prevdata = [...state.PaylinkData];
        const d = new Date();
        const prevobj = { ...prevdata[index], cancelled: d.toString() };
        prevdata.splice(index, 1, prevobj);
        setState((prevState: statetype) => ({
          ...prevState,
          PaylinkData: [...prevdata]
        }));
      }
      enqueueSnackbar(data.message, {
        variant: 'success'
      });
    } catch (err) {
      console.error(err, 'error');
    } finally {
      setState((prevState: statetype) => ({
        ...prevState,
        iscancelloading: false
      }));
    }
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
  /* *****************************cancel paylink ends here************************************ */
  const PAYLINK_TABLE = PaylinkData.map((transaction) => transaction);

  return (
    <Card>
      <Stack className={classes.header} spacing={{ xs: 3, sm: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 1, md: 1 }}>
          <Grid item xs={12} md={3}>
            <DateRangePicker handleDate={handleDate} statedates={filteroptions.date} />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl sx={{ m: 1, width: 300 }} className={classes.search}>
              <InputLabel id="demo-multiple-checkbox-label">Status</InputLabel>
              <Select
                labelId="demo-multiple-checkbox-label"
                id="demo-multiple-checkbox"
                multiple
                value={filteroptions.status}
                onChange={(e: any) => {
                  handlefilter('status', e.target.value);
                }}
                input={<OutlinedInput label="Status" />}
                renderValue={(selected) => selected.join(', ')}
                MenuProps={MenuProps}
              >
                {options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Checkbox checked={filteroptions.status.indexOf(option.value) > -1} />
                    <ListItemText primary={option.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            {userList.length !== 0 && (
              <FormControl sx={{ m: 1, width: 300 }} className={classes.search}>
                <InputLabel id="User-label">Select User</InputLabel>
                <Select
                  labelId="User-label"
                  id="User-label-select"
                  value={filteroptions.createdBy}
                  label="Select User"
                  onChange={handleSelectUser}
                  MenuProps={MenuProps}
                >
                  {userList.map((data, index) => (
                    <MenuItem value={data.userSubId} key={index}>
                      {data.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>
        </Stack>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          spacing={{ xs: 3, sm: 2 }}
        >
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
          <Grid item xs={12} md={6}>
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
          <Typography>Selected Filters :</Typography>
          <Grid item xs={12} md={8}>
            <Stack direction={{ xs: 'row', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
              {filteroptions.amount !== '' ||
              filteroptions.phoneNumber !== '' ||
              filteroptions.email !== '' ||
              filteroptions.customerName !== '' ||
              filteroptions.references !== '' ||
              filteroptions.createdBy !== '' ||
              filteroptions.status.length !== 0 ||
              filteroptions.date.startDate !== '' ? (
                <Grid container spacing={2}>
                  {filteroptions.customerName !== '' && (
                    <Grid item>
                      <Chip
                        label={`name:${filteroptions.customerName}`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('customerName')}
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
                  {filteroptions.amount !== '' && (
                    <Grid item>
                      <Chip
                        label={`amount:${filteroptions.amount}`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('amount')}
                      />
                    </Grid>
                  )}
                  {filteroptions.phoneNumber !== '' && (
                    <Grid item>
                      <Chip
                        label={`phone no:${filteroptions.phoneNumber}`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('phoneNumber')}
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
                        label={`reference:${filteroptions.references}`}
                        variant="outlined"
                        onDelete={() => clearsinglechips('references')}
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
                </Grid>
              ) : (
                'No Selected Filter'
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
                    <TableCell key={`transaction-header-${idx}`}>
                      <Stack direction="row">
                        <Typography>{header}</Typography>
                      </Stack>
                    </TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {!isLoading &&
                  PAYLINK_TABLE.map((row, index) => (
                    <TrackRow
                      key={row.id}
                      row={row}
                      index={index}
                      handleCancelpaylink={handleCancel}
                      iscancelloading={state.iscancelloading}
                    />
                  ))}
                {!isLoading && PAYLINK_TABLE.length === 0 && (
                  <Typography>No Transaction Found</Typography>
                )}

                {isLoading && <TableSkeletonLoad colSpan={TABLE_HEADERS.length} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        {!isLoading && PAYLINK_TABLE.length !== 0 && (
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

export default TrackHistory;
