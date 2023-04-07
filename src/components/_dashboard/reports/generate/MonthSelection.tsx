import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack
} from '@material-ui/core';
import { setSchedule } from 'redux/slices/reports';
import { dispatch, RootState, useSelector } from 'redux/store';

const Days = Array.from(new Array(30), (val, index) => index + 1);

const MonthSelection = () => {
  const { scheduledOn } = useSelector((state: RootState) => state.reports);

  const handleChange = (event: { target: { value: any } }) => {
    const { value } = event.target;
    dispatch(setSchedule(parseInt(value, 10)));
  };

  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
      <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
        <FormControl
          sx={{
            width: (theme) => theme.spacing(18)
          }}
        >
          <InputLabel id="report-month-frequency">Choose Day</InputLabel>
          <Select
            labelId="report-month-frequency"
            id="select-report-month-frequency"
            value={scheduledOn}
            label="Choose Day"
            onChange={handleChange}
            fullWidth
          >
            {Days.map((r, idx) => (
              <MenuItem value={idx} key={r}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={<Checkbox value={0} checked={scheduledOn === 0} onChange={handleChange} />}
          label="First of the month"
        />
      </Stack>
    </Stack>
  );
};

export default MonthSelection;
