import { useCallback } from 'react';
import {
  TableRow,
  TableCell,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel
} from '@material-ui/core';
import { handleOpeningHours } from 'redux/slices/customiser';
import { sentenceCase } from 'change-case';
import { dispatch } from 'redux/store';
import { OpeningHours, OpeningTimes } from '@customTypes/blinkPages';
import OpeningHRPicker from './OpeningHRPicker';

type PropTypes = {
  day: string;
  value: OpeningHours;
};

const OpeningHoursSingle = ({ day, value }: PropTypes) => {
  const { close, isClosed, open } = value;

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    if (checked === null) return;
    const updatedData = {
      type: day,
      data: {
        ...value,
        isClosed: !checked
      }
    };
    dispatch(handleOpeningHours(updatedData));
  };

  const handleTime = useCallback(
    (newValue: OpeningTimes, type: 'open' | 'close') => {
      if (newValue === null) return;

      const updatedData = {
        type: day,
        data: {
          ...value,
          [type]: newValue
        }
      };
      dispatch(handleOpeningHours(updatedData));
    },
    [day, value]
  );

  return (
    <TableRow>
      <TableCell component="th" scope="row" size="small">
        <Typography variant="subtitle1">{sentenceCase(day)}</Typography>
      </TableCell>
      <TableCell align="right" size="small">
        <OpeningHRPicker timeValue={open} setGlobalTIme={handleTime} timeType="open" />
      </TableCell>
      <TableCell align="right" size="small">
        <OpeningHRPicker timeValue={close} setGlobalTIme={handleTime} timeType="close" />
      </TableCell>
      <TableCell align="right" size="small">
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={!isClosed} onChange={handleStatusChange} />}
            label={isClosed ? 'Closed' : 'Open'}
          />
        </FormGroup>
      </TableCell>
    </TableRow>
  );
};

export default OpeningHoursSingle;
