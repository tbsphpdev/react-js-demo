import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';
import { TableSkeletonLoad } from 'components/common';
import Scrollbar from 'components/Scrollbar';
import { fDate } from 'utils/formatTime';

const TABLE_HEADERS = ['Invoice Name', 'Amount', 'Paid', 'Payment to be collected on'];

type InvoiceType = {
  invoiceId: string;
  invoiceAmount: string;
  invoicePaid: string;
  createdDate: string;
  invoiceURL: string;
};

interface Props {
  InvoiceDetails: InvoiceType[];
  isLoadingDetails: Boolean;
  classes: any;
  selectedAccounts: any;
  handleselectAll: any;
}

const SalesforceInvoice = ({
  InvoiceDetails,
  isLoadingDetails,
  classes,
  selectedAccounts,
  handleselectAll
}: Props) => {
  const INVOICE_TABLE = InvoiceDetails.map((data: any) => data);

  return (
    <Scrollbar>
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              {TABLE_HEADERS.map((header, idx) => (
                <TableCell key={`transaction-header-${idx}`}>{header}</TableCell>
              ))}
              <TableCell colSpan={2} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!isLoadingDetails &&
              INVOICE_TABLE.map((row: any) => (
                <TableRow key={row.invoiceId}>
                  <TableCell>
                    <Typography>{row.invoiceId}</Typography>
                  </TableCell>
                  <TableCell>{row.invoiceAmount}</TableCell>
                  <TableCell>
                    <Typography>{row.invoicePaid === 'true' ? 'Paid' : 'Not Paid'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{fDate(row.createdDate)}</Typography>
                  </TableCell>
                  <TableCell colSpan={2} align="center">
                    <Button variant="outlined" color="primary" href={row.invoiceURL}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

            {isLoadingDetails && <TableSkeletonLoad colSpan={TABLE_HEADERS.length + 1} rows={2} />}
            {selectedAccounts !== '' && !isLoadingDetails && INVOICE_TABLE.length < 1 && (
              <TableRow>
                <TableCell colSpan={TABLE_HEADERS.length + 1}>
                  <Typography color="textSecondary">No Invoice Found...</Typography>
                </TableCell>
              </TableRow>
            )}
            {selectedAccounts === '' && !isLoadingDetails && INVOICE_TABLE.length < 1 && (
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

export default SalesforceInvoice;
