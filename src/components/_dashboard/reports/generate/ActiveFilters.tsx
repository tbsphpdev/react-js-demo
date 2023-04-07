import { ReportsStateType } from '@customTypes/report';
import { Box, Button, Chip, Paper, Stack } from '@material-ui/core';
import { TuneRounded } from '@material-ui/icons';
import { capitalCase } from 'change-case';
import { pick } from 'lodash';
import { clearField } from 'redux/slices/reports';
import { dispatch, RootState, useSelector } from 'redux/store';

const keyValue: Record<string, string> = {
  accquire: 'Acquirer',
  amount: 'Amount',
  authCode: 'Auth Code',
  blinkTransactionType: 'Transaction Method',
  blinkUniqueReference: 'Blink Unique Reference',
  cardSchemes: 'Card Schemes',
  cardType: 'Card Types',
  currency: 'Currency',
  customerAddress: ' Customer Address',
  customerEmail: 'Customer Email',
  customerName: 'Customer Name',
  references: 'Reference',
  status: 'Status',
  transactionMode: 'Transaction Type',
  transactionType: 'Transaction Action'
};

function getValue(val: any[]) {
  if (val instanceof Array) {
    return val.includes('All') ? 'All' : val.join(', ').substring(0, 20);
  }
  return val;
}

function getActiveFilters(obj: Record<string, any>) {
  return Object.entries(obj)
    .filter(([key, value]) => {
      if (value && value.length > 0) {
        return true;
      }
      return false;
    })
    .map(([key, value]) => ({
      key,
      label: keyValue[key],
      value: getValue(value)
    }));
}
const ActiveFilters = () => {
  const state = useSelector((state: RootState) => state.reports);

  const filters = getActiveFilters(
    pick(state, [
      'accquire',
      'amount',
      'authCode',
      'blinkTransactionType',
      'blinkUniqueReference',
      'cardSchemes',
      'cardType',
      'currency',
      'customerAddress',
      'customerEmail',
      'customerName',
      'references',
      'status',
      'transactionMode',
      'transactionType'
    ])
  );

  const handleDelete = (key: string) => {
    const k = key as keyof ReportsStateType;
    dispatch(clearField(k));
  };

  if (filters.length < 1) return null;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3
      }}
    >
      <Stack spacing={4}>
        <Box>
          <Button variant="text" startIcon={<TuneRounded />}>
            Active Filters
          </Button>
        </Box>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {filters.map((f) => (
            <Chip
              label={`${capitalCase(f.label)}: ${capitalCase(f.value)}`}
              variant="outlined"
              onDelete={() => handleDelete(f.key)}
              key={f.key}
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default ActiveFilters;
