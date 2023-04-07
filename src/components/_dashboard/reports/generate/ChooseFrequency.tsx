import { reportFrequencyTypes } from '@customTypes/report';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@material-ui/core';
import {
  resetFormError,
  setFrequency,
  setFrequencyType,
  setRecipients,
  setSchedule
} from 'redux/slices/reports';
import { dispatch, RootState, useSelector } from 'redux/store';
import MonthSelection from './MonthSelection';
import WeekSelection from './WeekSelection';

const ChooseFrequency = () => {
  const { frequency, frequencyType, recipient, formErrors } = useSelector(
    (state: RootState) => state.reports
  );

  const resetError = (key: 'recipient' | 'frequency') => {
    dispatch(resetFormError(key));
  };

  const handleFreqChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: string;
      event: Event | React.SyntheticEvent<Element, Event>;
    }>
  ) => {
    const { value } = event.target;
    dispatch(setFrequencyType(value));
    dispatch(setFrequency(1));
    dispatch(setSchedule(0));
  };

  const handleRecipientChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;

    dispatch(setRecipients(value));
  };

  const handleFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (value === '') {
      dispatch(setFrequency(value));
      return;
    }

    dispatch(setFrequency(parseInt(value, 10)));
  };

  return (
    <Stack spacing={3}>
      <Typography
        variant="subtitle1"
        sx={{
          textDecoration: 'underline'
        }}
      >
        Choose Frequency
      </Typography>
      <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }}>
        <Stack>
          <FormControl
            sx={{
              width: '200px'
            }}
          >
            <InputLabel id="report-frequency">Frequency</InputLabel>
            <Select
              labelId="report-frequency"
              id="select-report-frequency"
              value={frequencyType}
              label="Frequency"
              onChange={handleFreqChange}
            >
              {reportFrequencyTypes.map((r) => (
                <MenuItem value={r} key={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Stack spacing={3} flexGrow={1}>
          {frequencyType !== 'Daily' && (
            <>
              <Stack>
                <Stack
                  spacing={2}
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{
                    xs: 'flex-start',
                    sm: 'center'
                  }}
                >
                  <Typography>Every</Typography>
                  <Stack>
                    <TextField
                      type="number"
                      value={frequency}
                      onChange={handleFrequencyChange}
                      sx={{
                        maxWidth: '80px'
                      }}
                      error={formErrors.frequency.isError}
                      onBlur={(e) => {
                        if (e.target.value) {
                          resetError('frequency');
                        }
                      }}
                      inputProps={{
                        min: 1
                      }}
                    />
                  </Stack>

                  <Typography>{frequencyType.slice(0, -2)}(s)</Typography>
                </Stack>
                {formErrors.frequency.isError && (
                  <FormHelperText error>{formErrors.frequency.msg}</FormHelperText>
                )}
              </Stack>
              {frequencyType === 'Weekly' && (
                <Stack
                  spacing={2}
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{
                    xs: 'flex-start',
                    sm: 'center'
                  }}
                >
                  <Typography>On choose day</Typography>
                  <WeekSelection />
                </Stack>
              )}

              {frequencyType === 'Monthly' && (
                <Stack
                  spacing={{ xs: 2, sm: 5 }}
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{
                    xs: 'flex-start',
                    sm: 'center'
                  }}
                >
                  <Typography>On</Typography>
                  <MonthSelection />
                </Stack>
              )}
            </>
          )}

          <Stack
            spacing={2}
            alignItems={{
              xs: 'flex-start',
              sm: 'center'
            }}
            direction={{ xs: 'column', sm: 'row' }}
          >
            <Typography align="left">To be emailed to:</Typography>
            <TextField
              fullWidth
              placeholder="Enter multiple emails separated by semi colons(;)"
              onChange={handleRecipientChange}
              sx={{
                maxWidth: 400
              }}
              value={recipient}
              error={formErrors.recipient.isError}
              helperText={formErrors.recipient.isError && formErrors.recipient.msg}
              onBlur={(e) => {
                if (e.target.value) {
                  resetError('recipient');
                }
              }}
            />
          </Stack>
        </Stack>
      </Stack>
      <Typography>Summary</Typography>

      {frequencyType === 'Daily' && (
        <Typography>
          This report will be generated every day showing the previous days data.
        </Typography>
      )}
      {frequencyType === 'Weekly' && (
        <Typography>
          This report will run every {frequency} week(s) on the selected Day showing the last{' '}
          {frequency} week(s) data.
        </Typography>
      )}
      {frequencyType === 'Monthly' && (
        <Typography>
          This report will run every {frequency} month(s) on the selected date showing the last{' '}
          {frequency} months data.
        </Typography>
      )}
    </Stack>
  );
};

export default ChooseFrequency;
