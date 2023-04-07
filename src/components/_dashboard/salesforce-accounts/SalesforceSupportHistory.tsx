import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from '@material-ui/core';
import { sentenceCase } from 'change-case';
import { TableSkeletonLoad } from 'components/common';
import Scrollbar from 'components/Scrollbar';
import { fDate } from 'utils/formatTime';
import Label from '../../Label';

const TABLE_HEADERS = ['Date/time', 'Ref Number', 'Case Subject', 'Status'];

type HistoryType = {
  MID: string;
  createdDate: string;
  caseNumber: string;
  subject: string;
  status: string;
};

interface Props {
  HistoryDetails: HistoryType[];
  isLoadingDetails: Boolean;
  classes: any;
  selectedAccounts: any;
  handleselectAll: any;
}

const SalesforceSupportHistory = ({
  HistoryDetails,
  isLoadingDetails,
  classes,
  selectedAccounts,
  handleselectAll
}: Props) => {
  const HISTORY_TABLE = HistoryDetails.map((data: any) => data);
  const theme = useTheme();
  return (
    <Scrollbar>
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              {TABLE_HEADERS.map((header, idx) => (
                <TableCell key={`transaction-header-${idx}`}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!isLoadingDetails &&
              HISTORY_TABLE.map((row: any) => (
                <TableRow key={row.MID}>
                  <TableCell>
                    <Typography>{fDate(row.createdDate)}</Typography>
                  </TableCell>
                  <TableCell>{row.caseNumber}</TableCell>
                  <TableCell>
                    <Typography>{row.subject}</Typography>
                  </TableCell>
                  <TableCell>
                    <Label
                      variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                      color={(row.status === 'Open' && 'error') || 'success'}
                    >
                      {sentenceCase(row.status)}
                    </Label>
                  </TableCell>
                </TableRow>
              ))}
            {isLoadingDetails && <TableSkeletonLoad colSpan={TABLE_HEADERS.length} rows={2} />}
            {selectedAccounts !== '' && !isLoadingDetails && HISTORY_TABLE.length < 1 && (
              <TableRow>
                <TableCell colSpan={TABLE_HEADERS.length + 1}>
                  <Typography color="textSecondary">No History Found...</Typography>
                </TableCell>
              </TableRow>
            )}
            {selectedAccounts === '' && !isLoadingDetails && HISTORY_TABLE.length < 1 && (
              <TableRow>
                <TableCell colSpan={TABLE_HEADERS.length + 1}>
                  <Typography color="textSecondary">Please select an account...</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Scrollbar>
  );
};

export default SalesforceSupportHistory;
