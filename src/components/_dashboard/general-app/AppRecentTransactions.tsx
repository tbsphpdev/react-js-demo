import { recentTransactionState } from '@customTypes/transaction';
import arrowIosForwardFill from '@iconify/icons-eva/arrow-ios-forward-fill';
import { Icon } from '@iconify/react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';
// material
import { useTheme } from '@material-ui/core/styles';
import { sentenceCase } from 'change-case';
import TableSkeletonLoad from 'components/common/TableSkeletonLoad';
import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getTransactionList } from 'redux/slices/user';
import { RootState, useDispatch, useSelector } from 'redux/store';
import { PATH_DASHBOARD } from 'routes/paths';
// utils
import { CURRENCY } from 'utils/constant';
import { fDateAbr, fDateMonthMin } from 'utils/formatTime';
import Label from '../../Label';
import Scrollbar from '../../Scrollbar';

// ----------------------------------------------------------------------

const defaultStatuses = {
  error: ['cancelled'],
  warning: ['authorised'],
  success: ['processed'],
  info: ['refund', 'partial  refund', 'fully refunded', 'full refund'],
  default: ['reserved'],
  secondary: ['verified']
};

const TABLE_HEADERS = ['Date/Time', 'Customer Name', 'Amount', 'Status'];

export default function AppRecentTransactions() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { transactionlist, isLoading } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(getTransactionList());
  }, [dispatch]);

  const TRANSACTION_TABLE = transactionlist.slice(0, 5).map((transaction) => transaction);

  return (
    <Card>
      <CardHeader title="Recent Transactions" sx={{ mb: 3 }} />
      <Scrollbar>
        <TableContainer sx={{ minWidth: 720 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {TABLE_HEADERS.map((header, idx) => (
                  <TableCell key={`transaction-header-${idx}`}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!isLoading &&
                TRANSACTION_TABLE.map((row: recentTransactionState) => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row">
                      {row.createdAt && fDateMonthMin(row.createdAt)}
                    </TableCell>
                    <TableCell>{row.customerName}</TableCell>
                    <TableCell>{`${
                      row.gatewayId === 2
                        ? row.sagepayTxnId?.curSym?.symbol ||
                          CURRENCY[row.currency || 'default'].symbol
                        : row.cardstreamTxnId?.curSym?.symbol ||
                          CURRENCY[row.currency || 'default'].symbol
                    } ${row.amount}`}</TableCell>
                    <TableCell>
                      {row.status && (
                        <Label
                          variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                          color={
                            (defaultStatuses.warning.includes(row.status.toLowerCase()) &&
                              'warning') ||
                            (defaultStatuses.success.includes(row.status.toLowerCase()) &&
                              'success') ||
                            (defaultStatuses.info.includes(row.status.toLowerCase()) && 'info') ||
                            (defaultStatuses.default.includes(row.status.toLowerCase()) &&
                              'default') ||
                            (defaultStatuses.secondary.includes(row.status.toLowerCase()) &&
                              'secondary') ||
                            'error'
                          }
                        >
                          {sentenceCase(row.status)}
                          {row.delayCapture && row.status === 'processed' ? ` (DC)` : ''}
                          {row.status === 'authorised' &&
                          row.relatedTxn &&
                          row.relatedTxn.status === 'verified'
                            ? ` (V) on ${fDateAbr(row.createdAt)}`
                            : ''}
                          {row.status === 'authorised' &&
                          row.relatedTxn &&
                          row.relatedTxn.status === 'reversed'
                            ? ` (PA) on ${fDateAbr(row.createdAt)}`
                            : ''}
                        </Label>
                      )}
                    </TableCell>
                    <TableCell />
                  </TableRow>
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

      <Divider />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          to={PATH_DASHBOARD.transaction.history}
          size="small"
          color="inherit"
          component={RouterLink}
          endIcon={<Icon icon={arrowIosForwardFill} />}
        >
          View All
        </Button>
      </Box>
    </Card>
  );
}
