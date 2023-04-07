// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { TextFieldProps, TextField } from '@material-ui/core';

// ----------------------------------------------------------------------

interface IProps {
  name: string;
}

export default function RHFTextField({ name, ...other }: IProps & TextFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField {...field} fullWidth error={!!error} helperText={error?.message} {...other} />
      )}
    />
  );
}
