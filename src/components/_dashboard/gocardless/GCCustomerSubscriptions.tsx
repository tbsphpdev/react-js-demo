import { gCCustSubscDetails } from '@customTypes/goCardLess';
import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Typography
} from '@material-ui/core';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TableSkeletonLoad from 'components/common/TableSkeletonLoad';
import Label from 'components/Label';
import Scrollbar from 'components/Scrollbar';
import { useSnackbar } from 'notistack';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS, CURRENCY } from 'utils/constant';
import { fDateAbr } from 'utils/formatTime';
import { ErrorMsg } from 'utils/helpError';
import GCSubscriptionPopUp from './GCSubscriptionPopUp';

const useStyles = makeStyles((theme) => ({
  justifyContBtw: {
    justifyContent: 'space-between'
  },
  btnAction: {
    padding: 0,
    borderRadius: 4,
    fontWeight: 600,
    fontSize: '1em',
    '& span': {
      padding: '0 !important'
    }
  },
  btnCreate: {
    width: '100%',
    height: '100%',
    padding: '2px 20px 2px 20px',
    margin: 0,
    color: '#7635dc',
    '& p': {
      fontSize: '1em',
      color: theme.palette.text.primary
    }
  },
  tableHeader: {
    '& th': {
      fontSize: '.8em'
    }
  },
  tableRow: {
    '& td': {
      fontSize: '.8em',
      maxWidth: '65px'
    },
    '& span': {
      padding: 5,
      borderRadius: 4,
      fontSize: '1em'
    },
    '& svg': {
      fontSize: '.8em'
    }
  }
}));

const GCCustomerSubscriptions = (props: { customer: { name: string } }) => {
  const classes = useStyles();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [subPage, setSubPage] = useState(0);
  const [subRowsPerPage, setSubRowsPerPage] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionList, setSubscriptionList] = useState<gCCustSubscDetails[]>([]);
  const [collapsedCell, setCollapsedCell] = useState('');
  const [sbscModalOpen, setSbscModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [cancelPopup, setCancelPopup] = useState<any>(false);

  const TABLE_HEADERS = ['', 'Status', 'Name', 'Created', 'Start', 'End', 'Collect', ''];
  const SUB_TABLE_HEADERS = ['Ref', 'Charged', 'Paid Out', 'Amount', 'Status'];

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleChangeSubRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubRowsPerPage(parseInt(event.target.value, 10));
    setSubPage(0);
  };

  const getCustomerSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = `${API_BASE_URLS.goCardless}/gocardless/customers/${params.id}/subscriptions`;
      const { data } = await axiosInstance.get(url);

      setSubscriptionList(data.message.subscriptions);
    } catch (error) {
      enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar, params.id]);

  const handleCancelSub = async (subId: string) => {
    try {
      setIsLoading(true);
      const url = `${API_BASE_URLS.goCardless}/gocardless/customers/${params.id}/subscriptions/${subId}`;
      await axiosInstance.delete(url);

      enqueueSnackbar('Cancelled', { variant: 'success' });
      getCustomerSubscriptions();
    } catch (error) {
      enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
      setCancelPopup({ id: '', status: false });
    }
  };

  useEffect(() => {
    !sbscModalOpen && getCustomerSubscriptions();
  }, [getCustomerSubscriptions, sbscModalOpen]);

  const ConfirmCancel = (
    <Stack>
      <Dialog open={!!cancelPopup.status} fullWidth maxWidth="sm">
        <DialogTitle>Cancel Subscription {cancelPopup.id}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1">
            Are you sure you want to cancel this subscription
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setCancelPopup({ id: '', status: false })}>
            Close
          </Button>
          <Button variant="contained" onClick={() => handleCancelSub(cancelPopup.id)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );

  const SUBSCRIPTION_TABLE = subscriptionList
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map((subscription, i) => (
      <Fragment key={subscription.id}>
        <TableRow key={subscription.id} className={classes.tableRow}>
          <TableCell
            onClick={() => {
              if (collapsedCell === subscription.id) setCollapsedCell('');
              else setCollapsedCell(subscription.id);
            }}
          >
            {subscription.id === collapsedCell ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </TableCell>
          <TableCell sx={{ textTransform: 'capitalize' }}>
            <Label color={subscription.status === 'cancelled' ? 'error' : 'success'}>
              {subscription.status}
            </Label>
          </TableCell>
          <TableCell>{subscription.name}</TableCell>
          <TableCell>{fDateAbr(subscription.created_at)}</TableCell>
          <TableCell>{fDateAbr(subscription.start_date)}</TableCell>
          <TableCell>{fDateAbr(subscription.end_date)}</TableCell>
          <TableCell>{`£ ${(Number(subscription.amount) / 100).toFixed(2)}`}</TableCell>
          <TableCell>
            {subscription.status !== 'cancelled' ? (
              <Stack direction={{ xs: 'column' }} spacing={1}>
                <Button
                  variant="outlined"
                  sx={{ color: '#3d5afe', border: '1px solid #3d5afe' }}
                  className={classes.btnAction}
                  onClick={() => {
                    setSelectedSubscription({
                      id: subscription.id,
                      amount: (Number(subscription.amount) / 100).toFixed(2),
                      currency:
                        CURRENCY[subscription?.currency || 'default'].symbol ||
                        CURRENCY.default.code,
                      description: subscription?.description,
                      mandate: subscription?.links?.mandate,
                      name: subscription?.name,
                      intervalUnit: subscription?.interval_unit,
                      month: subscription?.month,
                      dayOfMonth: subscription?.day_of_month
                    });
                    setSbscModalOpen(true);
                  }}
                >
                  Edit
                </Button>

                <Button
                  variant="contained"
                  className={classes.btnAction}
                  onClick={() => {
                    setCancelPopup({ id: subscription.id, status: true });
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            ) : (
              ''
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            sx={{
              paddingBottom: 0,
              paddingTop: 0,
              border: collapsedCell === subscription.id ? '1px solid #bcc6ff' : '1px solid #ffffff',
              borderCollapse: 'initial',
              borderRadius: '5px'
            }}
            colSpan={12}
          >
            <Scrollbar>
              <Collapse in={subscription.id === collapsedCell} timeout="auto" unmountOnExit>
                <Box sx={{ margin: 1 }}>
                  <Table>
                    <TableHead className={classes.tableHeader}>
                      <TableRow>
                        {SUB_TABLE_HEADERS.map((header, idx) => (
                          <TableCell key={`transaction-header-${idx}`}>{header}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subscription.upcoming_payments
                        .slice(page * subRowsPerPage, page * subRowsPerPage + subRowsPerPage)
                        .map((payment, i) => (
                          <TableRow key={subscription.id} className={classes.tableRow}>
                            <TableCell>-</TableCell>
                            <TableCell>{fDateAbr(payment.charge_date)}</TableCell>
                            <TableCell>--</TableCell>
                            <TableCell>{`£ ${(Number(payment.amount) / 100).toFixed(
                              2
                            )}`}</TableCell>
                            <TableCell sx={{ textTransform: 'capitalize' }}>
                              <Label
                                color={subscription.status === 'Cancelled' ? 'error' : 'success'}
                              >
                                {subscription.status}
                              </Label>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={subscriptionList.length}
                    rowsPerPage={subRowsPerPage}
                    page={subPage}
                    onPageChange={(e, page) => setSubPage(page)}
                    onRowsPerPageChange={handleChangeSubRowsPerPage}
                  />
                </Box>
              </Collapse>
            </Scrollbar>
          </TableCell>
        </TableRow>
      </Fragment>
    ));

  return (
    <>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'row' }} className={classes.justifyContBtw}>
          <Stack>
            <Button
              className={classes.btnCreate}
              onClick={() => {
                setSbscModalOpen(true);
              }}
            >
              <Typography> Create New </Typography>{' '}
              <AddCircleIcon style={{ margin: 5 }} fontSize="small" />
            </Button>
          </Stack>
        </Stack>
        <Stack
          sx={{
            marginTop: 5,
            marginBottom: 10
          }}
        >
          <Scrollbar>
            <TableContainer component={Paper} elevation={2}>
              <Table sx={{ width: '99%' }}>
                <TableHead className={classes.tableHeader}>
                  <TableRow>
                    {TABLE_HEADERS.map((header, idx) => (
                      <TableCell key={`transaction-header-${idx}`}>{header}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!isLoading && SUBSCRIPTION_TABLE}

                  {isLoading && <TableSkeletonLoad colSpan={TABLE_HEADERS.length} />}
                  {!isLoading && SUBSCRIPTION_TABLE.length < 1 && (
                    <TableRow>
                      <TableCell colSpan={TABLE_HEADERS.length + 1}>
                        <Typography color="textSecondary">No Subscription Found...</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
          <TablePagination
            rowsPerPageOptions={[2, 4, 6, 8, 10]}
            component="div"
            count={subscriptionList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, page) => setPage(page)}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Stack>
      </Stack>
      <GCSubscriptionPopUp
        sbscModalOpen={sbscModalOpen}
        setSbscModalOpen={() => {
          setSbscModalOpen(false);
          setSelectedSubscription(null);
        }}
        selectedCustomer={{ id: params.id, name: props.customer.name }}
        subscriptionDetails={selectedSubscription}
      />
      {ConfirmCancel}
    </>
  );
};

export default GCCustomerSubscriptions;
