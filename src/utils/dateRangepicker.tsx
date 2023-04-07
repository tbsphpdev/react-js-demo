import React, { useEffect, useState } from 'react';

import {
  Stack,
  MenuItem,
  Typography,
  Menu,
  ListItem,
  List,
  TextField,
  Box,
  Divider,
  Button,
  Grid,
  makeStyles
} from '@material-ui/core';
import {
  format,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  addDays,
  startOfWeek,
  subWeeks
} from 'date-fns';
import EventRoundedIcon from '@material-ui/icons/EventRounded';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import { LocalizationProvider, StaticDateRangePicker } from '@material-ui/lab';

type rangetype = {
  key: string;
  text: string;
  value:
    | {
        start: string;
        end: string;
      }
    | string;
};

type pickertype = {
  wasSubmitted: boolean;
  dateRange: rangetype[];
  dateRangegraph: rangetype[];
  anchorEl: any;
  selectedOption: string;
};

const useStyles = makeStyles({
  datepickerroot: {
    border: '1px solid #dde1e4',
    borderRadius: '8px',
    padding: '0px'
  },
  datepickerpadding: {
    padding: '8px 0px',
    justifyContent: 'space-between',
    width: '100%'
  }
});

interface props {
  handleDate: any;
  statedates: { startDate: string; endDate: string };
  isgraph?: boolean;
}

export const DateRangePicker = ({ handleDate, statedates, isgraph }: props) => {
  const classes = useStyles();
  const [value, setValue] = React.useState<any>([null, null]);
  const [state, setState] = useState<pickertype>({
    anchorEl: null,
    selectedOption: 'Select Date',
    wasSubmitted: false,
    dateRange: [
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
          start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
          end: format(addDays(new Date(), 1), 'yyyy-MM-dd')
        }
      },
      {
        key: 'Last 30 Days',
        text: 'Last 30 Days',
        value: {
          start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
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
    ],
    dateRangegraph: [
      {
        key: 'This Week',
        text: 'This Week',
        value: {
          start: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
          end: format(addDays(new Date(), 1), 'yyyy-MM-dd')
        }
      },
      {
        key: 'Last Week',
        text: 'Last Week',
        value: {
          start: format(startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
          end: format(
            addDays(startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), 6),
            'yyyy-MM-dd'
          )
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
    ]
  });

  useEffect(() => {
    if (statedates.startDate === '' && statedates.endDate === '') {
      setState((prevState: pickertype) => ({
        ...prevState,
        anchorEl: null,
        selectedOption: 'Select Date'
      }));
    }
  }, [statedates]);

  const { dateRange, selectedOption, anchorEl, dateRangegraph } = state;

  const open = Boolean(anchorEl);
  const handleClickListItem = (event: any) => {
    setState((prevState: pickertype) => ({
      ...prevState,
      anchorEl: event.currentTarget
    }));
  };

  const handleMenuItemClick = (event: any, options: any) => {
    if (options.text === 'Custom Range') {
      setState((prevState: pickertype) => ({
        ...prevState,
        selectedOption: options.text
      }));
    } else if (options.text === 'Select Date') {
      handleDate({
        start: '',
        end: ''
      });
      setState((prevState: pickertype) => ({
        ...prevState,
        anchorEl: null,
        selectedOption: options.text
      }));
    } else {
      handleDate(options.value, options.text);
      setState((prevState: pickertype) => ({
        ...prevState,
        anchorEl: null,
        selectedOption: options.text
      }));
    }
    if (value[0] !== null && value[1] !== null) {
      setValue([null, null]);
    }
  };

  const handleClose = () => {
    setState((prevState: pickertype) => ({
      ...prevState,
      anchorEl: null
    }));
  };

  const handleapplydate = () => {
    if (value[0] !== null && value[1] !== null) {
      handleDate({
        start: format(new Date(value[0]), 'yyyy-MM-dd'),
        end: format(new Date(value[1]), 'yyyy-MM-dd')
      });
      setState((prevState: pickertype) => ({
        ...prevState,
        anchorEl: null
      }));
    }
  };

  const handlecanceldate = () => {
    setState((prevState: pickertype) => ({
      ...prevState,
      anchorEl: null
    }));
    setValue([null, null]);
  };

  const disableapply = () => {
    if (value[0] === null || value[1] === null) {
      return true;
    }
    if (value[0].toDateString() === value[1].toDateString()) {
      return true;
    }
    return false;
  };

  return (
    <>
      <List
        component="nav"
        aria-label="Device settings"
        sx={{ bgcolor: 'background.paper' }}
        className={classes.datepickerroot}
      >
        <ListItem button onClick={handleClickListItem}>
          <Stack direction="row" className={classes.datepickerpadding}>
            <Stack>
              <Typography>
                {statedates.startDate !== ''
                  ? `${
                      statedates.startDate !== statedates.endDate
                        ? `(${statedates.startDate}) - (${statedates.endDate})`
                        : `${statedates.startDate}`
                    }`
                  : 'Date'}
              </Typography>
            </Stack>

            <Stack>
              <EventRoundedIcon />
            </Stack>
          </Stack>
        </ListItem>
      </List>
      <Menu
        id="lock-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => {
          selectedOption !== 'Custom Range' && handleClose();
        }}
        MenuListProps={{
          'aria-labelledby': 'lock-button',
          role: 'listbox'
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <Stack direction="row" spacing={2}>
          <Stack spacing={1}>
            {!!isgraph === false
              ? dateRange.map((option, index) => (
                  <MenuItem
                    key={index}
                    selected={option.text === selectedOption}
                    onClick={(event) => handleMenuItemClick(event, option)}
                  >
                    {option.text}
                  </MenuItem>
                ))
              : dateRangegraph.map((option, index) => (
                  <MenuItem
                    key={index}
                    selected={option.text === selectedOption}
                    onClick={(event) => handleMenuItemClick(event, option)}
                  >
                    {option.text}
                  </MenuItem>
                ))}
            <Divider />
            {!!isgraph === false && (
              <MenuItem
                selected={selectedOption === 'Custom Range'}
                onClick={(event) =>
                  handleMenuItemClick(event, {
                    key: 'Custom Range',
                    text: 'Custom Range',
                    value: 'custom range'
                  })
                }
              >
                Custom Range
              </MenuItem>
            )}
            {selectedOption === 'Custom Range' && (
              <Stack spacing={1}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={disableapply()}
                  onClick={handleapplydate}
                >
                  Apply
                </Button>
                <Button onClick={handlecanceldate} variant="outlined" color="error">
                  Close
                </Button>
              </Stack>
            )}
          </Stack>
          {selectedOption === 'Custom Range' && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid item display={{ xs: 'none', md: 'block' }}>
                <StaticDateRangePicker
                  allowSameDateSelection={false}
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
                  allowSameDateSelection={false}
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
          )}
        </Stack>
      </Menu>
    </>
  );
};
