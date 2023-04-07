import { makeStyles, useTheme } from '@material-ui/core/styles';
import { FormControl, FormHelperText } from '@material-ui/core';
import PhoneInput from 'react-phone-input-2';

const useStyles = makeStyles((theme) => ({
  input: {
    backgroundColor: '#fff'
  },
  w100: {
    width: '100% !important'
  },
  bgdark: {
    background: theme.palette.grey[700]
  },
  colordark: {
    color: '#45505c',
    '& .special-label': {
      backgroundColor: '#212b36'
    }
  }
}));

type proptype = {
  formikdata: any;
  setPhone: any;
  require: boolean;
  autofocus: boolean;
};

const PhoneNoInput = ({ formikdata, setPhone, require, autofocus }: proptype) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const classes = useStyles();
  const { errors, values, touched, getFieldProps } = formikdata;

  const handleChange = (value: any, data: any, event: any, formattedValue: any) => {
    const add = `+${data.dialCode}`;
    if (value.includes(add)) {
      setPhone(value, `+${data.dialCode}`);
    } else {
      setPhone(add.concat(value.slice(data.dialCode.length)), `+${data.dialCode}`);
    }
  };
  return (
    <FormControl
      error={Boolean(touched.customerPhoneNumber && errors.customerPhoneNumber)}
      className={classes.w100}
    >
      <PhoneInput
        country="gb"
        {...getFieldProps('customerPhoneNumber')}
        placeholder="Send Via SMS"
        value={values.customerPhoneNumber}
        onChange={handleChange}
        countryCodeEditable={false}
        enableSearch={true}
        specialLabel=""
        containerClass={`${isLight ? '' : classes.colordark}`}
        inputStyle={{
          background: theme.palette.grey[isLight ? 100 : 800],
          borderColor: isLight ? '#CACACA' : '#45505c',
          color: isLight ? '#9ba7b3' : '#424f5b',
          borderRadius: '8px'
        }}
        buttonClass="custom-phone-button"
        dropdownStyle={{
          background: theme.palette.grey[isLight ? 100 : 800],
          borderColor: isLight ? '#CACACA' : '#45505c',
          color: isLight ? '#9ba7b3' : '#424f5b'
        }}
        inputProps={{
          name: 'customerPhoneNumber',
          required: require,
          autoFocus: autofocus,
          id: 'customer-PhoneNumber-helper-text',
          label: '',
          error: errors.customerPhoneNumber
        }}
        inputClass={classes.w100}
      />
      <FormHelperText id="customer-PhoneNumber-helper-text">
        {errors.customerPhoneNumber}
      </FormHelperText>
    </FormControl>
  );
};
export default PhoneNoInput;
