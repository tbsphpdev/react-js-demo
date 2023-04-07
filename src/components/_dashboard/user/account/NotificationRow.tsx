import {
  Stack,
  Grid,
  Typography,
  FormControlLabel,
  Switch,
  Select,
  MenuItem
} from '@material-ui/core';
import React, { useState } from 'react';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
};

type PropTypes = {
  label: string;
  getFieldPropsEmail: any;
  getFieldPropsBlink: any;
  setReminderFrequency?: (val: number) => void;
  setReminderUnit?: (val: string) => void;
  emailVal?: boolean;
  blinkVal?: boolean;
  reminder?: {
    frequency: number | string;
    frequencyUnit: string;
  };
};

const selectUnit = ['days', 'months'];
const selectFrequency = [
  Array.from({ length: 31 }, (v, i) => i + 1),
  Array.from({ length: 12 }, (v, i) => i + 1)
];

const NotificationRow = (props: PropTypes) => {
  const [selectedUnit, setSelectedUnit] = useState<number>(0);
  const {
    label,
    getFieldPropsEmail,
    getFieldPropsBlink,
    setReminderFrequency,
    setReminderUnit,
    emailVal,
    blinkVal,
    reminder
  } = props;

  return (
    <Stack>
      <Grid container>
        <Grid item xs={5} sx={{ display: 'flex' }}>
          <Stack alignSelf="center">
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              {label}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={2} sx={{ display: 'flex' }}>
          <FormControlLabel
            control={<Switch {...getFieldPropsEmail} checked={emailVal} />}
            label=""
            sx={{ mx: 0, justifySelf: 'center' }}
          />
        </Grid>
        <Grid item xs={2} sx={{ display: 'flex' }}>
          <FormControlLabel
            control={<Switch {...getFieldPropsBlink} checked={blinkVal} />}
            label=""
            sx={{ mx: 0, justifySelf: 'center' }}
          />
        </Grid>
        <Grid item xs={3} px="5px">
          {reminder && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Select
                labelId="label"
                id="select"
                value={reminder?.frequency}
                sx={{
                  fontSize: '.8em',
                  '& .MuiOutlinedInput-root': {
                    padding: '5.5px 14px'
                  }
                }}
                onChange={(e) => {
                  if (setReminderFrequency) setReminderFrequency(Number(e.target.value));
                }}
                MenuProps={MenuProps}
              >
                {selectFrequency[selectedUnit].map((obj, i) => (
                  <MenuItem key={i} value={obj}>
                    {obj}
                  </MenuItem>
                ))}
              </Select>

              <Select
                labelId="label"
                id="select"
                value={reminder?.frequencyUnit}
                sx={{
                  display: 'flex',
                  fontSize: '.8em',
                  '& .MuiOutlinedInput-root': {
                    padding: '5.5px 14px'
                  }
                }}
                onChange={(e) => {
                  if (selectUnit.indexOf(e.target.value) > -1) {
                    setSelectedUnit(selectUnit.indexOf(e.target.value));
                    if (setReminderUnit) setReminderUnit(e.target.value);
                  }
                }}
                MenuProps={MenuProps}
              >
                {selectUnit.map((obj, i) => (
                  <MenuItem key={i} value={obj}>
                    {obj}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Stack>
  );
};

export default NotificationRow;
