import { useState } from 'react';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
// material
import { OutlinedInput, Stack, TextField, InputAdornment, IconButton } from '@material-ui/core';
import { Icon } from '@iconify/react';
import { LoadingButton } from '@material-ui/lab';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
// routes
import { ErrorMsg } from 'utils/helpError';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';
import { PATH_AUTH } from '../../../routes/paths';

// ----------------------------------------------------------------------

// eslint-disable-next-line consistent-return
function maxLength(object: any, index: number) {
  if (object.target.value.length > object.target.maxLength) {
    return (object.target.value = object.target.value.slice(0, object.target.maxLength));
  }
}

const handleOtpInput = (e: any, item: any, i: number) => {
  const CurrentElement = document.getElementById(item) as HTMLInputElement;
  if (CurrentElement?.value?.length === 1) {
    const NextElement = document.getElementById(
      item.replace(item.charAt(item.length - 1), (i + 2).toString())
    );
    NextElement?.focus();
  }
  if (e.key === 'Backspace') {
    const PreviousElement = document.getElementById(
      item.replace(item.charAt(item.length - 1), i.toString())
    );
    PreviousElement?.focus();
  }
};

type InitialValues = {
  code: {
    code1: string;
    code2: string;
    code3: string;
    code4: string;
    code5: string;
    code6: string;
  };
  password: string;
  username: string;
};

export default function VerifyCodeForm() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState<Boolean>(false);

  const VerifyCodeSchema = Yup.object().shape({
    code: Yup.object().shape({
      code1: Yup.number().required('Code is required'),
      code2: Yup.number().required('Code is required'),
      code3: Yup.number().required('Code is required'),
      code4: Yup.number().required('Code is required'),
      code5: Yup.number().required('Code is required'),
      code6: Yup.number().required('Code is required')
    }),
    password: Yup.string().required('Password is required'),
    username: Yup.string().required('Email is required')
  });

  const formik = useFormik<InitialValues>({
    initialValues: {
      code: {
        code1: '',
        code2: '',
        code3: '',
        code4: '',
        code5: '',
        code6: ''
      },
      password: '',
      username: localStorage.getItem('resetPwdUsername') || ''
    },
    validationSchema: VerifyCodeSchema,
    onSubmit: async () => {
      try {
        const url = `${API_BASE_URLS.user}/users/password/confirm`;
        const tempValues = {
          code: Object.values(values.code).join(''),
          username: values.username,
          password: values.password
        };
        await axiosInstance.post(url, tempValues);
        enqueueSnackbar('Verify success', { variant: 'success' });
        localStorage.removeItem('resetPwdUsername');
        navigate(PATH_AUTH.login);
      } catch (error) {
        enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
        console.error(error);
      }
    }
  });

  const { values, errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack direction="column" spacing={2} justifyContent="center">
          <Stack direction="row" spacing={2} justifyContent="center">
            {Object.keys(values.code).map((item, i) => (
              <OutlinedInput
                key={`code.${item}`}
                {...getFieldProps(`code.${item}`)}
                type="number"
                placeholder="-"
                onInput={(e) => {
                  maxLength(e, i);
                }}
                error={Boolean(getIn(touched, `code.${item}`) && getIn(errors, `code.${item}`))}
                inputProps={{
                  onKeyUp: (e) => {
                    handleOtpInput(e, `code.${item}`, i);
                  },
                  id: `code.${item}`,
                  maxLength: 1,
                  sx: {
                    p: 0,
                    textAlign: 'center',
                    width: { xs: 36, sm: 56 },
                    height: { xs: 36, sm: 56 }
                  }
                }}
              />
            ))}
          </Stack>
          <TextField
            fullWidth
            {...getFieldProps('password')}
            type={showPassword ? 'text' : 'password'}
            label="Password"
            error={Boolean(touched.password && errors.password)}
            helperText={touched.password && errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                    edge="end"
                  >
                    <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Stack>

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ mt: 3 }}
        >
          Verify And Create
        </LoadingButton>
      </Form>
    </FormikProvider>
  );
}
