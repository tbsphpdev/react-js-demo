import { Box, Stack, TextField } from '@material-ui/core';
import { format } from 'date-fns';
import { handleName, handleReportDate } from 'redux/slices/reports';
import { dispatch, RootState, useSelector } from 'redux/store';
import { DateRangePicker } from 'utils/dateRangepicker';
import DropdownSelection from './DropdownSelection';

const ReportsTopSection = () => {
  const { startDate, endDate } = useSelector((state: RootState) => state.reports);

  const handleDate = (dates: { start: string; end: string }) => {
    const { start, end } = dates;
    dispatch(
      handleReportDate({
        startDate: start,
        endDate: end
      })
    );
  };

  const handleNameInput = (event: { target: { value: string } }) => {
    dispatch(handleName(event.target.value));
  };

  const fStartDate = startDate ? format(new Date(startDate), 'yyyy-MM-dd') : '';
  const fEndDate = endDate ? format(new Date(endDate), 'yyyy-MM-dd') : '';
  return (
    <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }}>
      <Box>
        <DateRangePicker
          handleDate={handleDate}
          statedates={{
            startDate: fStartDate,
            endDate: fEndDate
          }}
        />
      </Box>
      <Box>
        <DropdownSelection />
      </Box>
      <Box>
        <TextField
          placeholder="Name of the report"
          inputProps={{
            maxLength: 30
          }}
          onChange={handleNameInput}
        />
      </Box>
    </Stack>
  );
};

export default ReportsTopSection;
