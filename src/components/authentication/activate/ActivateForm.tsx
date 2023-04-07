import * as Yup from 'yup';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useFormik, Form, FormikProvider } from 'formik';
import { Icon } from '@iconify/react';
import eyeFill from '@iconify/icons-eva/eye-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
// material
import { Stack, Alert, TextField, IconButton, InputAdornment, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';

import { passwordValidation } from 'utils/RegexPatterns';
// hooks
import { ErrorMsg } from 'utils/helpError';
import { PATH_DASHBOARD } from 'routes/paths';
import { useNavigate } from 'react-router';
import useAuth from '../../../hooks/useAuth';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
//
import { MIconButton } from '../../@material-extend';

// ----------------------------------------------------------------------
type InitialValues = {
  email: string;
  password: string;
  temporaryPassword: string;
  afterSubmit?: string;
};

export default function ActivateForm() {
  const { activate } = useAuth();
  const isMountedRef = useIsMountedRef();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false);

  const navigate = useNavigate();

  const ActivateSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    temporaryPassword: Yup.string().required('Temporary Password is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8)
      .max(20)
      .matches(
        passwordValidation,
        'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character'
      )
  });

  const formik = useFormik<InitialValues>({
    initialValues: {
      email: '',
      password: '',
      temporaryPassword: ''
    },
    validationSchema: ActivateSchema,
    onSubmit: async (values, { setErrors, setSubmitting, resetForm }) => {
      try {
        await activate(values.email, values.temporaryPassword, values.password);
        enqueueSnackbar('Activated successfully', {
          variant: 'success',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          )
        });
        resetForm();
        if (isMountedRef.current) {
          setSubmitting(false);
          navigate(PATH_DASHBOARD.root);
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
        resetForm();
        if (isMountedRef.current) {
          setSubmitting(false);
          setErrors({ afterSubmit: error.message });
        }
      }
    }
  });

  const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleShowTempPassword = () => {
    setShowTemporaryPassword((show) => !show);
  };

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {errors.afterSubmit && <Alert severity="error">{errors.afterSubmit}</Alert>}

          <TextField
            fullWidth
            type="email"
            label="Email address"
            {...getFieldProps('email')}
            error={Boolean(touched.email && errors.email)}
            helperText={touched.email && errors.email}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            type={showTemporaryPassword ? 'text' : 'password'}
            label="Temporary Password"
            {...getFieldProps('temporaryPassword')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleShowTempPassword} edge="end">
                    <Icon icon={showTemporaryPassword ? eyeFill : eyeOffFill} />
                  </IconButton>
                </InputAdornment>
              )
            }}
            error={Boolean(touched.temporaryPassword && errors.temporaryPassword)}
            helperText={touched.temporaryPassword && errors.temporaryPassword}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="New Password"
            {...getFieldProps('password')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleShowPassword} edge="end">
                    <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                  </IconButton>
                </InputAdornment>
              )
            }}
            error={Boolean(touched.password && errors.password)}
            helperText={touched.password && errors.password}
            InputLabelProps={{ shrink: true }}
          />

          <Typography variant="caption" component="p" color="textSecondary">
            Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case
            Character.
          </Typography>
        </Stack>

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Login
        </LoadingButton>
      </Form>
    </FormikProvider>
  );
}
