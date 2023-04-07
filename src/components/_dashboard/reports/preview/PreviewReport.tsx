import {
  Card,
  CardContent,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';
import TableSkeletonLoad from 'components/common/TableSkeletonLoad';

import { RootState, useSelector } from 'redux/store';
import { fDateAbr, ftimeSuffix } from 'utils/formatTime';

const TABLE_HEADERS = [
  'Date/Time',
  'Card',
  'Amount',
  'Customer Name/Email',
  'Customer Address/Postcode',
  'Acquirer'
];

const PreviewReport = () => {
  const { preview, isLoadingReports } = useSelector((state: RootState) => state.reports);
  return (
    <Card
      sx={{
        width: '100%'
      }}
    >
      <CardContent>
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                {TABLE_HEADERS.map((header, idx) => (
                  <TableCell key={`transaction-header-${idx}`}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            {isLoadingReports ? (
              <TableBody>
                <TableSkeletonLoad colSpan={TABLE_HEADERS.length} />
              </TableBody>
            ) : (
              <TableBody>
                {preview.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Stack>
                        <Typography>{fDateAbr(row.createdAt)}</Typography>
                        <Typography>{ftimeSuffix(row.createdAt)}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        <Stack direction="column">
                          <Typography>End in {row.cardLastFourDigits}</Typography>
                          <Typography>
                            {row.cardExpireDate &&
                              `${row.cardExpireDate.toString().slice(0, 2)}/${row.cardExpireDate
                                .toString()
                                .slice(2)}`}
                          </Typography>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography>{row.amount}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack>
                        <Typography>{row.customerName}</Typography>
                        <Typography>{row.customerEmail}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack>
                        <Typography noWrap textOverflow="ellipsis">
                          {row.customerAddress}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography>{row.acquireName}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default PreviewReport;
