import { gCCustOneOffPaymentDetails } from '@customTypes/goCardLess';
import {
  Button,
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
  Typography,
  useTheme
} from '@material-ui/core';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import TableSkeletonLoad from 'components/common/TableSkeletonLoad';
import Label from 'components/Label';
import Scrollbar from 'components/Scrollbar';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';
import { fDateAbr } from 'utils/formatTime';
import { ErrorMsg } from 'utils/helpError';
import GCOneOffPaymentPopUp from './GCOneOffPaymentPopUp';

const useStyles = makeStyles((theme) => ({
  justifyContBtw: {
    justifyContent: 'space-between'
  },

  btnCreate: {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: '2px 20px 2px 20px',
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
  tableCell: {
    '& td': {
      fontSize: '.8em'
    },
    '& svg': {
      fontSize: '.8em'
    }
  }
}));

const GCCustomerOneOffPayments = (props: { customer: { name: string } }) => {
  const theme = useTheme();
  const classes = useStyles(theme);
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [oneOffPaymentList, setOneOffPaymentList] = useState<gCCustOneOffPaymentDetails[]>([]);
  const [oopModalOpen, setOopModalOpen] = useState(false);

  const TABLE_HEADERS = ['Ref', 'Initiated', 'Paid Out', 'Amount', 'Fee', 'Net Amount', 'Status'];

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const ONEOFFPAYMENT_TABLE = oneOffPaymentList
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map((payment, i) => (
      <TableRow key={payment.id} className={classes.tableCell}>
        <TableCell>-</TableCell>
        <TableCell>{fDateAbr(payment.created_at)} </TableCell>
        <TableCell> </TableCell>
        <TableCell>
          {`£ ${(
            Number(payment.amount) / 100 -
            (Number(payment.fees) / 100) * (Number(payment.amount) / 100)
          ).toFixed(2)}`}
        </TableCell>
        <TableCell>{`£ ${(Number(payment.fees) / 100).toFixed(2)}`} </TableCell>
        <TableCell>{`£ ${(Number(payment.amount) / 100).toFixed(2)}`} </TableCell>
        <TableCell sx={{ textTransform: 'capitalize' }}>
          <Label color={payment.status === 'cancelled' ? 'error' : 'success'}>
            {payment.status}
          </Label>
        </TableCell>
      </TableRow>
    ));

  const getCustomerOneOffPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = `${API_BASE_URLS.goCardless}/gocardless/customers/${params.id}/payments`;
      const { data } = await axiosInstance.get(url);

      setOneOffPaymentList(data.message);
    } catch (error) {
      enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar, params.id]);

  useEffect(() => {
    !oopModalOpen && getCustomerOneOffPayments();
  }, [getCustomerOneOffPayments, oopModalOpen]);

  return (
    <>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'row' }} className={classes.justifyContBtw}>
          <Stack>
            <Button className={classes.btnCreate} onClick={() => setOopModalOpen(true)}>
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
              <Table>
                <TableHead className={classes.tableHeader}>
                  <TableRow>
                    {TABLE_HEADERS.map((header, idx) => (
                      <TableCell key={`transaction-header-${idx}`}>{header}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!isLoading && ONEOFFPAYMENT_TABLE}

                  {isLoading && <TableSkeletonLoad colSpan={TABLE_HEADERS.length} />}
                  {!isLoading && ONEOFFPAYMENT_TABLE.length < 1 && (
                    <TableRow>
                      <TableCell colSpan={TABLE_HEADERS.length + 1}>
                        <Typography color="textSecondary">No Payment Found...</Typography>
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
            count={oneOffPaymentList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, page) => setPage(page)}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Stack>
      </Stack>
      <GCOneOffPaymentPopUp
        oopModalOpen={oopModalOpen}
        setOopModalOpen={() => setOopModalOpen(false)}
        selectedCustomer={{ id: params.id, name: props.customer.name }}
      />
    </>
  );
};

export default GCCustomerOneOffPayments;
