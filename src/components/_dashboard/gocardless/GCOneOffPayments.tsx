import { useEffect, useState } from 'react';
import {
  Table,
  TableContainer,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Paper,
  Typography
} from '@material-ui/core';
import axiosInstance from 'utils/axios';
import { useTheme } from '@material-ui/core/styles';
import { API_BASE_URLS } from 'utils/constant';
import Scrollbar from 'components/Scrollbar';
import { useSnackbar } from 'notistack';
import Label from 'components/Label';
import { fDate } from 'utils/formatTime';
import { sentenceCase } from 'change-case';

type PropTypes = {
  id: string;
};

type MandatesState = {
  id: string;
  created_at: string;
  reference: string;
  status: string;
  scheme: string;
  next_possible_charge_date: string;
  payments_require_approval: boolean;
  metadata: {};
  links: {
    customer_bank_account: string;
    creditor: string;
    customer: string;
  };
};

const MANDATE_TABLE_HEADER = ['Ref', 'Initiated', 'Last Payment', 'Status'];

const GCOneOffPayments = ({ id }: PropTypes) => {
  const [payments, setPayments] = useState<MandatesState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchPayments = async (customerId: string) => {
      try {
        const url = `${API_BASE_URLS.goCardless}/gocardless/customers/${customerId}/payments`;

        const { data } = await axiosInstance.get(url);

        setPayments(data.message);
      } catch (error) {
        console.error(error);

        enqueueSnackbar('error occured', {
          variant: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments(id);
  }, [enqueueSnackbar, id]);

  const PAYMENTS_TABLE = payments.map((mandate) => (
    <PaymentsRow key={mandate.id} mandate={mandate} />
  ));

  return (
    <Scrollbar>
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              {MANDATE_TABLE_HEADER.map((header, idx) => (
                <TableCell key={`transaction-header-${idx}`}>{header}</TableCell>
              ))}
              <TableCell colSpan={2} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!isLoading && PAYMENTS_TABLE}
            {!isLoading && PAYMENTS_TABLE.length < 1 && (
              <TableRow>
                <TableCell colSpan={MANDATE_TABLE_HEADER.length + 1}>
                  <Typography color="textSecondary">No One-Off Payments Found...</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Scrollbar>
  );
};

export default GCOneOffPayments;

type RowProps = {
  mandate: MandatesState;
};

const defaultStatuses = {
  error: ['canceled', 'cancelled', 'declined', 'void'],
  warning: ['captured'],
  success: ['ok', 'accepted'],
  info: ['refund', 'partial  refund', 'fully refunded', 'full refund']
};

const PaymentsRow = ({ mandate }: RowProps) => {
  const theme = useTheme();
  return (
    <TableRow>
      <TableCell>{mandate.reference}</TableCell>
      <TableCell>{fDate(mandate.created_at)}</TableCell>
      <TableCell>
        {mandate.status && (
          <Label
            variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
            color={
              (defaultStatuses.warning.includes(mandate.status.toLowerCase()) && 'warning') ||
              (defaultStatuses.success.includes(mandate.status.toLowerCase()) && 'success') ||
              (defaultStatuses.info.includes(mandate.status.toLowerCase()) && 'info') ||
              'error'
            }
          >
            {sentenceCase(mandate.status)}
          </Label>
        )}
      </TableCell>
      <TableCell />
    </TableRow>
  );
};
