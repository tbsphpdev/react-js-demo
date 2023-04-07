import { goCardLessCustomerList } from '@customTypes/user';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  makeStyles,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { LoadingButton } from '@material-ui/lab';
import TableSkeletonLoad from 'components/common/TableSkeletonLoad';
import { DateRangePickPop } from 'components/DateRangePickPop';
import Label from 'components/Label';
import Scrollbar from 'components/Scrollbar';
import { isAfter, isBefore, isEqual } from 'date-fns';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'routes/paths';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';
import { fDate } from 'utils/formatTime';
import { ErrorMsg, gcError } from 'utils/helpError';
import * as Yup from 'yup';
import { inviteGCCustomer } from '_apis_/gocardless';
import GCCustomerTableMenu from './GCCustomerTableMenu';
import GCOneOffPaymentPopUp from './GCOneOffPaymentPopUp';
import GCSubscriptionPopUp from './GCSubscriptionPopUp';

const useStyles = makeStyles({
  createdDate: {
    '& input': {
      padding: '4px 3px',
      border: '1px solid #3369e2',
      boxShadow: 'none',
      color: '#3369e2',
      borderRadius: 4,
      outline: 'none',
      alignSelf: 'center',
      maxWidth: 121
    },
    '& svg': {
      position: 'relative',
      height: '100%',
      alignSelf: 'center',
      right: 25,
      background: 'none',
      border: 'none',
      pointerEvents: 'none'
    }
  },
  h_100: {
    height: '100%'
  },

  dFlex: {
    display: 'flex'
  },
  justifyCC: {
    justifyContent: 'center'
  },
  filter: {
    '& label': {
      fontSize: '.8em !important'
    },
    '& input': {
      fontSize: '.8em !important'
    },
    '& button p': {
      fontSize: '.9em !important'
    }
  }
});

type CustomerListState = {
  address_line1: string;
  address_line2: string | null;
  address_line3: string | null;
  city: string;
  company_name: string | null;
  country_code: string;
  created_at: string;
  danish_identity_number: number | null;
  email: string;
  family_name: string;
  given_name: string;
  id: string;
  language: string;
  metadata: {};
  phone_number: string | number | null;
  postal_code: string;
  region: null;
  swedish_identity_number: number | null;
  status: boolean;
};

const TABLE_HEADERS = ['Status', 'Customer Name', 'Email', 'Created Date', ''];

const GCCustomerTable = () => {
  const [customerList, setCustomerList] = useState<CustomerListState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [oopModalOpen, setOopModalOpen] = useState(false);
  const [sbscModalOpen, setSbscModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState({ id: '', name: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [filter, setFilter] = useState<any>({
    date: '',
    searchStr: '',
    status: null
  });
  const theme = useTheme();
  const classes = useStyles();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = `${API_BASE_URLS.goCardless}/gocardless/merchants/customers`;

      const { data } = await axiosInstance.get(url);

      setCustomerList([...data.message]);
    } catch (error) {
      enqueueSnackbar(gcError(error), { variant: 'error' });
      console.error('ERROR:', error);
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const deleteCustomer = async () => {
    try {
      const url = `${API_BASE_URLS.goCardless}/gocardless/merchants/customers/${selectedCustomer.id}`;
      await axiosInstance.delete(url);

      fetchCustomers();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(gcError(error), {
        variant: 'error'
      });
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const AddCustomerSchema = Yup.object().shape({
    email: Yup.string().email().required('Customer Email address is required')
  });

  const formik = useFormik<goCardLessCustomerList>({
    initialValues: {
      email: ''
    },
    validationSchema: AddCustomerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await inviteGCCustomer(values.email);
      } catch (error) {
        enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
        console.error(error);
      } finally {
        setSubmitting(false);
        setAddModalOpen(false);
      }
    }
  });

  const { getFieldProps, touched, errors, handleSubmit, isSubmitting } = formik;

  const openDeleteModal = (customerId: string) => {
    setSelectedCustomer({ id: customerId, name: '' });
    setDeleteModalOpen(true);
  };
  const openOopModal = (customerId: string, customerName: string) => {
    setSelectedCustomer({ id: customerId, name: customerName });
    setOopModalOpen(true);
  };
  const openSbscModal = (customerId: string, customerName: string) => {
    setSelectedCustomer({ id: customerId, name: customerName });
    setSbscModalOpen(true);
  };

  const viewCustomerDetails = (customerId: string) =>
    navigate(`${PATH_DASHBOARD.gc.customer}/${customerId}`);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const FilteredData = customerList
    .filter(
      (customer) =>
        customer.given_name.toLowerCase().includes(filter.searchStr.toLowerCase()) ||
        customer.family_name.toLowerCase().includes(filter.searchStr.toLowerCase()) ||
        customer.email.toLowerCase().includes(filter.searchStr.toLowerCase())
    )
    .filter((customer) => (filter.status !== null ? customer.status === filter.status : customer))
    .filter((customer) =>
      filter.date && customer.created_at
        ? (isBefore(new Date(customer.created_at), new Date(filter.date.endDate)) ||
            isEqual(
              new Date(customer.created_at.substring(0, 10)),
              new Date(filter.date.endDate)
            )) &&
          (isAfter(new Date(customer.created_at), new Date(filter.date.startDate)) ||
            isEqual(
              new Date(customer.created_at.substring(0, 10)),
              new Date(filter.date.startDate)
            ))
        : customer
    );

  const CUSTOMER_TABLE = FilteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  ).map((customer) => (
    <TableRow key={customer.id}>
      <TableCell>
        <Label
          variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
          color={customer.status ? 'success' : 'warning'}
        >
          {customer.status ? 'Active' : 'Inactive'}
        </Label>
      </TableCell>
      <TableCell>
        {customer.given_name} {customer.family_name}
      </TableCell>
      <TableCell>{customer.email}</TableCell>
      <TableCell>
        <Stack className={classes.h_100}>{fDate(customer.created_at)}</Stack>
      </TableCell>
      <TableCell>
        <Stack>
          <GCCustomerTableMenu
            customerId={customer.id}
            customerName={`${customer.given_name} ${customer.family_name}`}
            openSbscModal={openSbscModal}
            openOopModal={openOopModal}
          />
        </Stack>
      </TableCell>

      <TableCell>
        <Stack direction="row" spacing={3}>
          <Button color="error" variant="outlined" onClick={() => openDeleteModal(customer.id)}>
            Delete
          </Button>
          <Button variant="contained" onClick={() => viewCustomerDetails(customer.id)}>
            View
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  ));

  const TableContent = () => (
    <Table>
      <TableHead>
        <TableRow>
          {TABLE_HEADERS.map((header, idx) => (
            <TableCell key={`transaction-header-${idx}`}>{header}</TableCell>
          ))}
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {!isLoading && CUSTOMER_TABLE}
        {isLoading && <TableSkeletonLoad colSpan={TABLE_HEADERS.length} />}
        {!isLoading && CUSTOMER_TABLE.length < 1 && (
          <TableRow>
            <TableCell colSpan={TABLE_HEADERS.length + 1}>
              <Typography color="textSecondary">No Customers Found...</Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const ADD_CUSTOMER_POPUP = (
    <Box sx={{ display: 'flex' }}>
      <Box
        sx={{
          flexGrow: 1
        }}
      />

      <Dialog open={addModalOpen} fullWidth maxWidth="sm">
        <DialogTitle title="Add New Customer">Add New Customer</DialogTitle>
        <FormikProvider value={formik}>
          <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
            <DialogContent>
              <DialogContentText>
                Please enter the email address below to add a new customer.
              </DialogContentText>
              <TextField
                fullWidth
                {...getFieldProps('email')}
                label="Customer Email Address"
                error={Boolean(getIn(touched, 'email') && getIn(errors, 'email'))}
                helperText={getIn(touched, 'email') && getIn(errors, 'email')}
                required
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAddModalOpen(false)} color="error">
                Cancel
              </Button>

              <LoadingButton variant="contained" type="submit" loading={isSubmitting}>
                Add
              </LoadingButton>
            </DialogActions>
          </Form>
        </FormikProvider>
      </Dialog>
    </Box>
  );

  return (
    <>
      <Grid container spacing={2} className={classes.filter}>
        <Grid item xs={12}>
          <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
            <Stack sx={{ minWidth: { xs: '100%', sm: '35%', md: '25%' } }}>
              <TextField
                className={classes.filter}
                label="Search"
                value={filter.searchStr}
                onChange={(e: any) => setFilter({ ...filter, searchStr: e.target.value })}
              />
            </Stack>
            <Stack
              sx={{
                height: 'inherit',
                minWidth: { xs: '100%', sm: '25%', md: '15%' },
                maxWidth: 'fit-content'
              }}
            >
              <DateRangePickPop
                sx={{ height: '100%' }}
                defaultValue=""
                label="Date"
                setDate={(val: { startDate: string; endDate: string } | string) => {
                  setFilter({
                    ...filter,
                    date: val
                  });
                }}
                resetOption={true}
              />
            </Stack>
            <Stack
              sx={{
                height: 'inherit',
                minWidth: { xs: '100%', sm: '25%', md: '15%' },
                maxWidth: 'fit-content'
              }}
            >
              <Autocomplete
                fullWidth
                options={[
                  { label: 'All', value: null },
                  { label: 'Active', value: true },
                  { label: 'Inactive', value: false }
                ]}
                onChange={(e: any, obj: any) => {
                  setFilter({ ...filter, status: obj.value });
                }}
                defaultValue={{ label: 'All', value: null }}
                disableClearable
                getOptionLabel={(option) => option.label || ''}
                isOptionEqualToValue={(option, val) => option === val}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select status"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: <>{params.InputProps.endAdornment}</>
                    }}
                  />
                )}
              />
            </Stack>
            <Stack
              sx={{
                height: 'inherit',
                minWidth: { xs: '100%', sm: '25%', md: '15%' },
                marginLeft: 'auto !important'
              }}
            >
              <Button
                sx={{
                  width: '100%',
                  height: '100%',
                  padding: 0,
                  margin: 0,
                  color: theme.palette.primary.main
                }}
                onClick={() => setAddModalOpen(true)}
              >
                <Typography color="initial"> Add Customer </Typography>{' '}
                <AddCircleIcon style={{ margin: 5 }} fontSize="medium" />
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      <Scrollbar>
        <TableContainer component={Paper} elevation={2}>
          {!isLoading && TableContent()}
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={FilteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, page) => {
            setPage(page);
          }}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Dialog open={deleteModalOpen}>
          <DialogTitle>Delete Customer</DialogTitle>
          <DialogContent>Are you sure you want to delete this customer?</DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button onClick={() => deleteCustomer()} color="error" variant="outlined">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <GCSubscriptionPopUp
          sbscModalOpen={sbscModalOpen}
          setSbscModalOpen={() => setSbscModalOpen(false)}
          selectedCustomer={selectedCustomer}
        />
        <GCOneOffPaymentPopUp
          oopModalOpen={oopModalOpen}
          setOopModalOpen={() => setOopModalOpen(false)}
          selectedCustomer={selectedCustomer}
        />
      </Scrollbar>

      {ADD_CUSTOMER_POPUP}
    </>
  );
};

export default GCCustomerTable;
