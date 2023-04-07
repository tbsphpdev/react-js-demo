import React, { useState } from 'react';

import {
  Stack,
  MenuItem,
  TextField,
  Box,
  Button,
  Grid,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  FormControl
} from '@material-ui/core';
import { format, subDays, subMonths, startOfMonth, endOfMonth, addDays } from 'date-fns';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import { LocalizationProvider, StaticDateRangePicker } from '@material-ui/lab';
import { fDateAbr } from 'utils/formatTime';

interface props {
  setDate?: any;
  statedates?: { startDate: string; endDate: string };
  isgraph?: boolean;
  customRange?: boolean;
  defaultValue?: string | number;
  resetOption?: boolean;
  label?: string;
  sx?: any;
  removeDays?: boolean;
}

const DATE_RANGE = [
  {
    key: 'Select',
    text: 'Select Date',
    value: {
      start: '',
      end: ''
    }
  },
  {
    key: 'Today',
    text: 'Today',
    value: {
      start: format(new Date(), 'yyyy-MM-dd'),
      end: format(addDays(new Date(), 1), 'yyyy-MM-dd')
    }
  },
  {
    key: 'Yesterday',
    text: 'Yesterday',
    value: {
      start: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd')
    }
  },
  {
    key: 'Last 7 Days',
    text: 'Last 7 Days',
    value: {
      start: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
      end: format(addDays(new Date(), 1), 'yyyy-MM-dd')
    }
  },
  {
    key: 'Last 30 Days',
    text: 'Last 30 Days',
    value: {
      start: format(subDays(new Date(), 29), 'yyyy-MM-dd'),
      end: format(addDays(new Date(), 1), 'yyyy-MM-dd')
    }
  },
  {
    key: 'This Month',
    text: 'This Month',
    value: {
      start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      end: format(addDays(new Date(), 1), 'yyyy-MM-dd')
    }
  },
  {
    key: 'Last Month',
    text: 'Last Month',
    value: {
      start: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
      end: format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd')
    }
  }
];

export const DateRangePickPop = ({
  setDate,
  statedates,
  isgraph,
  customRange = true,
  defaultValue = 3,
  resetOption = false,
  label = '',
  sx,
  removeDays = false
}: props) => {
  const [value, setValue] = React.useState<any>([null, null]);
  const [selectVal, setSelectVal] = React.useState<any>(defaultValue ?? defaultValue);
  const [showDateRange, setShowDateRange] = useState<boolean>(false);
  const [customLabel, setCustomLabel] = useState<string>('Custom Range');

  const handleapplydate = () => {
    if (value[0] !== null && value[1] !== null) {
      setDate({
        startDate: format(new Date(value[0]), 'yyyy-MM-dd'),
        endDate: format(new Date(value[1]), 'yyyy-MM-dd')
      });

      setShowDateRange(false);
      setCustomLabel(`${fDateAbr(new Date(value[0]))} - ${fDateAbr(new Date(value[1]))}`);
    }
  };

  const handleSelect = (event: any) => {
    setSelectVal(event.target.value);
    if (event.target.value?.toString() !== 7) {
      if (!event.target.value) {
        setDate('');
      } else {
        setDate({
          startDate: DATE_RANGE[event.target.value].value.start,
          endDate: DATE_RANGE[event.target.value].value.end
        });
      }
    }
  };

  const DateRangePopUp = () => (
    <Dialog open={!!showDateRange} maxWidth="md">
      <DialogTitle>Select Date</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid item display={{ xs: 'none', md: 'block' }}>
            <StaticDateRangePicker
              displayStaticWrapperAs="desktop"
              value={value}
              onChange={(newValue) => {
                setValue(newValue);
              }}
              renderInput={(startProps, endProps) => (
                <>
                  <TextField {...startProps} />
                  <Box sx={{ mx: 2 }}> to </Box>
                  <TextField {...endProps} />
                </>
              )}
            />
          </Grid>
          <Grid item display={{ xs: 'block', md: 'none' }}>
            <StaticDateRangePicker
              displayStaticWrapperAs="mobile"
              value={value}
              onChange={(newValue) => {
                setValue(newValue);
              }}
              renderInput={(startProps, endProps) => (
                <>
                  <TextField {...startProps} />
                  <Box sx={{ mx: 2 }}> to </Box>
                  <TextField {...endProps} />
                </>
              )}
            />
          </Grid>
        </LocalizationProvider>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={() => handleapplydate()}>
            Apply
          </Button>
          <Button onClick={() => setShowDateRange(false)} variant="outlined" color="error">
            Close
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );

  return (
    <Stack sx={{ ...sx }}>
      <FormControl sx={{ ...sx }}>
        {label && <InputLabel id="period">{label}</InputLabel>}
        <Select
          id="period"
          value={selectVal}
          onChange={handleSelect}
          sx={{
            ...sx,
            '& div': {
              padding: '4px 36px 5px 10px'
            }
          }}
          onOpen={() => {
            setCustomLabel('Custom Range');
          }}
          onClose={() =>
            setCustomLabel(`${fDateAbr(new Date(value[0]))} - ${fDateAbr(new Date(value[1]))}`)
          }
          label={label}
        >
          {resetOption && selectVal && <MenuItem value="">None</MenuItem>}
          {/* Do not add Fragment, Select doesnt support Fragment */}
          {!removeDays && <MenuItem value={1}>Today</MenuItem>}
          {!removeDays && <MenuItem value={2}>Yesterday</MenuItem>}
          <MenuItem value={3}>Last 7 days</MenuItem>
          <MenuItem value={4}>Last 30 days</MenuItem>
          <MenuItem value={5}>This Month</MenuItem>
          <MenuItem value={6}>Last Month</MenuItem>
          {customRange && (
            <MenuItem value={7} onClick={() => setShowDateRange(true)}>
              {customLabel}
            </MenuItem>
          )}
        </Select>
        {DateRangePopUp()}
      </FormControl>
    </Stack>
  );
};
