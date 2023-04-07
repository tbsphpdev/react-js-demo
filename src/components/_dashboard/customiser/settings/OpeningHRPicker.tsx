import { OpeningTimes } from '@customTypes/blinkPages';
import {
  Box,
  experimentalStyled,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack
} from '@material-ui/core';

type PropsType = {
  timeValue: OpeningTimes;
  setGlobalTIme: (newValue: OpeningTimes, type: 'open' | 'close') => void;
  timeType: 'open' | 'close';
};

const FormControlStyle = experimentalStyled(FormControl)(({ minWidth }: { minWidth: number }) => ({
  minWidth
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
};

const HOURS = Array.from(new Array(12), (_, index) =>
  index < 9 ? `0${index + 1}` : `${index + 1}`
);
const MINUTES = Array.from(new Array(12), (_, index) => {
  const minute = index * 5;
  return minute < 10 ? `0${minute}` : `${minute}`;
});
const TYPE = ['AM', 'PM'];

const OpeningHRPicker = ({ timeType, timeValue, setGlobalTIme }: PropsType) => {
  const { hour, minute, type } = timeValue;

  const handleTime = (event: React.ChangeEvent<{ value: unknown }>, key: keyof OpeningTimes) => {
    const { value } = event.target;

    setGlobalTIme(
      {
        ...timeValue,
        [key]: value
      },
      timeType
    );
  };

  return (
    <Stack direction="row" spacing={2}>
      <Box>
        <FormControlStyle minWidth={85}>
          <InputLabel id="select-hours">Hours</InputLabel>
          <Select
            labelId="select-hours"
            value={hour}
            MenuProps={MenuProps}
            onChange={(e) => handleTime(e, 'hour')}
            label="Hours"
            autoWidth
          >
            <MenuItem value="">
              <em>Hour</em>
            </MenuItem>
            {HOURS.map((hr) => (
              <MenuItem key={`${hr}-hour`} value={hr}>
                {hr}
              </MenuItem>
            ))}
          </Select>
        </FormControlStyle>
      </Box>
      <Box>
        <FormControlStyle minWidth={100}>
          <InputLabel id="select-minutes">Minutes</InputLabel>
          <Select
            labelId="select-minutes"
            value={minute}
            MenuProps={MenuProps}
            onChange={(e) => handleTime(e, 'minute')}
            label="Minutes"
          >
            <MenuItem value="">
              <em>Minutes</em>
            </MenuItem>
            {MINUTES.map((min) => (
              <MenuItem key={`${min}-minutes`} value={min}>
                {min}
              </MenuItem>
            ))}
          </Select>
        </FormControlStyle>
      </Box>
      <Box>
        <FormControl>
          <Select value={type} MenuProps={MenuProps} onChange={(e) => handleTime(e, 'type')}>
            {TYPE.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Stack>
  );
};

export default OpeningHRPicker;
