import {
  Button,
  Card,
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  makeStyles,
  MenuItem,
  OutlinedInput,
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
import { LoadingButton } from '@material-ui/lab';
import TableSkeletonLoad from 'components/common/TableSkeletonLoad';
import Scrollbar from 'components/Scrollbar';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';
import { ErrorMsg } from 'utils/helpError';
import * as Yup from 'yup';
import Admin from './Admin';
import Gateway from './Gateway';
import Query from './Query';
import SupportHistoryRow from './SupportHistoryRow';
import TerminalBtn from './TerminalBtn';

// ----------------------------------------------------------------------

const useStyles = makeStyles((theme) => ({
  ticket: {
    padding: '10px'
  },

  colorGrey: {
    color: '#a2acb5'
  },
  mainFilter: {
    height: '35px',
    padding: '0px 6px'
  },
  activecategory: {
    border: `2px solid ${theme.palette.primary.main}`,
    boxShadow: theme.customShadows.z24
  }
}));

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

type Historydata = {
  caseId: string;
  caseNumber: string;
  createdDate: string;
  salesforceOwnerId: {
    name: string;
    ownerId: string;
  };
  status: string;
  subject: string;
};

export type MerchantAccountState = {
  MID: string;
  MIDType: string;
  acquirerName: string | null;
  billingContact: string | null;
  city: string | null;
  country: string | null;
  merchantId: string;
  street: string | null;
  tradingName: string;
  zipPostalCode: string;
  salesforceContactId: {
    contactId: string;
    email: string | null;
    firstName: string;
    lastName: string;
    name: string;
    phone: string | null;
  };
  checked: boolean | null;
};

type StateType = {
  data: Historydata[];
  selectedMerchant: string[];
  isLoading: boolean;
  isLoadingMechant: boolean;
  merchantList: MerchantAccountState[];
  fetchhistory: boolean;
};

const TABLE_HEADERS = ['Date/Time', 'Reference', 'Case Subject', 'Status'];

const SupportIndex = () => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [state, setState] = useState<StateType>({
    data: [],
    merchantList: [],
    selectedMerchant: [],
    isLoading: false,
    isLoadingMechant: true,
    fetchhistory: true
  });
  const { data, isLoading, merchantList, selectedMerchant } = state;

  const fetchAccounts = useCallback(async () => {
    setState((prevState) => ({
      ...prevState,
      isLoadingMechant: true
    }));
    try {
      const url: string = `${API_BASE_URLS.salesforce}/account/salesforces`;
      const { data } = await axiosInstance.get(url);

      const accountData = data.message.sfAccountId.salesforceAccountId;

      if (accountData.length !== 0) {
        setState((prevState) => ({
          ...prevState,
          merchantList: [...accountData]
        }));
      }
    } catch (error) {
      enqueueSnackbar(ErrorMsg(error), {
        variant: 'error'
      });
      console.error(error);
    } finally {
      setState((prevState) => ({
        ...prevState,
        isLoadingMechant: false
      }));
    }
  }, [enqueueSnackbar]);

  const fetchsupporthistory = useCallback(
    async (selecteddata?: any) => {
      setState((prevState) => ({
        ...prevState,
        data: [],
        isLoading: true
      }));
      try {
        let url = '';
        if (selecteddata) {
          url = `${
            API_BASE_URLS.salesforce
          }/account/salesforces/ticket?merchantId=${selecteddata.join(',')}`;
        } else {
          url = `${API_BASE_URLS.salesforce}/account/salesforces/ticket`;
        }
        const { data } = await axiosInstance.get(url);

        if (data.message.length !== 0) {
          setState((prevState: StateType) => ({
            ...prevState,
            data: [...data.message]
          }));
        }
      } catch (error) {
        if (error?.response?.status !== 404) {
          enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
        }
      } finally {
        setState((prevState) => ({
          ...prevState,
          isLoading: false
        }));
      }
    },
    [enqueueSnackbar]
  );

  useEffect(() => {
    fetchsupporthistory();
    fetchAccounts();
  }, [fetchAccounts, fetchsupporthistory]);

  const createTicketSchema = Yup.object().shape({
    note: Yup.string().required('Message Is Required')
  });
  const createTicketFormik = useFormik({
    initialValues: {
      category: 'Terminal',
      note: ''
    },
    validationSchema: createTicketSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const url = `${API_BASE_URLS.salesforce}/account/salesforces/ticket`;
        await axiosInstance.post(url, {
          subject: values.category,
          description: values.note
        });

        enqueueSnackbar('Ticket Created Successfully', { variant: 'success' });

        resetForm();
        fetchsupporthistory();
      } catch (error) {
        console.error(error);
        if (ErrorMsg(error)) {
          enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
        } else {
          enqueueSnackbar('something went wrong', { variant: 'error' });
        }
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleChange = (event: any) => {
    const {
      target: { value }
    } = event;
    setState((prevState) => ({
      ...prevState,
      selectedMerchant: [...value]
    }));
  };

  const applyFilter = () => {
    fetchsupporthistory(selectedMerchant);
  };
  const clearFilter = () => {
    setState((prevState) => ({
      ...prevState,
      selectedMerchant: []
    }));
    fetchsupporthistory();
  };

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue, values } =
    createTicketFormik;
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={5}>
        <Card>
          <Grid container item spacing={2} xs={12} md={12} className={classes.ticket}>
            <Grid item xs={12} sm={12} md={12}>
              <Typography variant="h4">Create Support Ticket</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <Typography>Please Select a Category</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <TerminalBtn setFieldValue={setFieldValue} values={values} classes={classes} />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Gateway setFieldValue={setFieldValue} values={values} classes={classes} />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Admin setFieldValue={setFieldValue} values={values} classes={classes} />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Query setFieldValue={setFieldValue} values={values} classes={classes} />
            </Grid>
          </Grid>
        </Card>
      </Grid>
      <Grid item xs={12} md={7}>
        <Card>
          <Stack className={classes.ticket} spacing={2} justifyContent="flex-start">
            <Typography variant="h4">Your Message</Typography>
            <TextField
              placeholder="Type Your Message"
              multiline
              rows={10}
              {...getFieldProps('note')}
              error={Boolean(touched.note && errors.note)}
              helperText={touched.note && errors.note}
            />
            <Grid item xs={12} sm={4} md={4}>
              <LoadingButton
                fullWidth
                type="submit"
                variant="contained"
                onClick={() => {
                  handleSubmit();
                }}
                loading={isSubmitting}
              >
                Raise Ticket
              </LoadingButton>
            </Grid>
          </Stack>
        </Card>
      </Grid>
      <Grid item xs={12} md={12}>
        <Card>
          <Stack className={classes.ticket}>
            <Typography variant="h4">Support History</Typography>
            <Stack direction="row" spacing={2}>
              <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id="demo-multiple-checkbox-label">Merchant</InputLabel>
                <Select
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  multiple
                  value={selectedMerchant}
                  onChange={handleChange}
                  input={<OutlinedInput label="Merchant" />}
                  renderValue={(selected) => `${selected.length} merchant selected`}
                  MenuProps={MenuProps}
                >
                  {merchantList.map((name) => (
                    <MenuItem key={name.merchantId} value={name.merchantId}>
                      <Checkbox checked={selectedMerchant.indexOf(name.merchantId) > -1} />
                      <ListItemText primary={name.tradingName} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
                <Button
                  className={classes.mainFilter}
                  variant="contained"
                  disabled={selectedMerchant.length === 0}
                  onClick={applyFilter}
                >
                  Apply Filter
                </Button>
                <Button className={classes.colorGrey} onClick={clearFilter}>
                  Clear Filter
                </Button>
              </Stack>
            </Stack>
            <Scrollbar>
              <TableContainer sx={{ minWidth: 720 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      {TABLE_HEADERS.map((header, idx) => (
                        <TableCell key={`transaction-header-${idx}`}>{header}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!isLoading &&
                      data.map((row: Historydata, index: number) => (
                        <SupportHistoryRow key={row.caseId} row={row} index={index} />
                      ))}

                    {isLoading && <TableSkeletonLoad colSpan={TABLE_HEADERS.length} />}
                    {!isLoading && data.length < 1 && (
                      <TableRow>
                        <TableCell colSpan={TABLE_HEADERS.length + 1}>
                          <Typography color="textSecondary">No Support Data Found...</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SupportIndex;
