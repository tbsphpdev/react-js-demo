// form
import { FormControlLabelProps, FormControlLabel, Switch } from '@material-ui/core';
import { useFormContext, Controller } from 'react-hook-form';
// @mui

// ----------------------------------------------------------------------

type IProps = Omit<FormControlLabelProps, 'control'>;

interface Props extends IProps {
  name: string;
}

export default function RHFSwitch({ name, ...other }: Props) {
  const { control } = useFormContext();

  return (
    <FormControlLabel
      control={
        <Controller
          name={name}
          control={control}
          render={({ field }) => <Switch {...field} checked={field.value} />}
        />
      }
      {...other}
    />
  );
}
