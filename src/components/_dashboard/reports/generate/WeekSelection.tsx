import { Paper, FormControlLabel, Radio, Grid, RadioGroup } from '@material-ui/core';
import { capitalCase } from 'change-case';
import { setSchedule } from 'redux/slices/reports';
import { dispatch, RootState, useSelector } from 'redux/store';

const WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const WeekSelection = () => {
  const { scheduledOn } = useSelector((state: RootState) => state.reports);

  const renderDay = WEEK.map((day, idx) => (
    <Grid item xs="auto" key="day">
      <Paper
        variant="outlined"
        sx={{
          py: 1
        }}
      >
        <FormControlLabel
          value={idx}
          control={<Radio />}
          label={capitalCase(day)}
          labelPlacement="top"
        />
      </Paper>
    </Grid>
  ));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    dispatch(setSchedule(parseInt(value, 10)));
  };

  return (
    <RadioGroup
      aria-label="Week days"
      value={scheduledOn}
      name="radio-buttons-group"
      onChange={handleChange}
    >
      <Grid container spacing={2}>
        {renderDay}
      </Grid>
    </RadioGroup>
  );
};

export default WeekSelection;
