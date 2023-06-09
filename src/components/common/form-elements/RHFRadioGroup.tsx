import {
  Radio,
  RadioGroupProps,
  RadioGroup,
  FormControlLabel,
  FormHelperText
} from '@material-ui/core';
// form
import { useFormContext, Controller } from 'react-hook-form';

// ----------------------------------------------------------------------

interface IProps {
  name: string;
  options: string[];
  getOptionLabel?: string[];
}

export default function RHFRadioGroup({
  name,
  options,
  getOptionLabel,
  ...other
}: IProps & RadioGroupProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <RadioGroup {...field} row {...other}>
            {options.map((option, index) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio />}
                label={getOptionLabel?.length ? getOptionLabel[index] : option}
              />
            ))}
          </RadioGroup>

          {!!error && (
            <FormHelperText error sx={{ px: 2 }}>
              {error.message}
            </FormHelperText>
          )}
        </div>
      )}
    />
  );
}
