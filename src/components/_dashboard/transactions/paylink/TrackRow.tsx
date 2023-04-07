import * as Yup from 'yup';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

// material
import {
  Collapse,
  TableRow,
  TableCell,
  Typography,
  Button,
  Stack,
  Checkbox,
  Menu,
  MenuItem,
  DialogTitle,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  FormGroup,
  TextField,
  Grid,
  FormHelperText,
  makeStyles
} from '@material-ui/core';
import { fDateMonthMin, ftimeSuffix } from 'utils/formatTime';
import { TrackPaylinkState } from '@customTypes/transaction';
import Label from 'components/Label';
import { useTheme } from '@material-ui/core/styles';
import { sentenceCase } from 'change-case';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
import { useSnackbar } from 'notistack';
import { ButtonAnimate } from 'components/animate';
import { LoadingButton } from '@material-ui/lab';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';
import CloseIcon from '@material-ui/icons/Close';
import CancelIcon from '@material-ui/icons/Cancel';
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ReplayIcon from '@material-ui/icons/Replay';
import { Form, FormikProvider, useFormik } from 'formik';
import { ErrorMsg } from 'utils/helpError';

import PhoneNoInput from 'utils/PhoneInput';
import { usePrevious } from 'hooks/usePrevious';
import { PATH_DASHBOARD } from 'routes/paths';
import { useNavigate } from 'react-router-dom';
import PaylinkTimeline from './PaylinkTimeline';

interface Props {
  row: TrackPaylinkState;
  handleCancelpaylink: any;
  iscancelloading: boolean;
  index: number;
}

type ResendFormState = {
  Id: number;
  is_email: boolean;
  is_sms: boolean;
  customerEmail: string;
  customerPhoneNumber: string;
  resentby: string;
};

const useStyles = makeStyles((theme) => ({
  iconCursor: {
    cursor: 'pointer'
  },
  mainrow: {
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}));

const TrackRow = ({ row, handleCancelpaylink, iscancelloading, index }: Props) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [openCollapse, setOpenCollapse] = useState(false);
  const [isResendDialogOpen, setIsResendDialogOpen] = useState(false);
  const [cancelmodal, setCancelmodal] = useState(false);
  const [edit, setIsedit] = useState({
    emailedit: false,
    smsedit: false
  });

  const prevState = usePrevious({ iscancelloading });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  useEffect(() => {
    if (prevState?.iscancelloading === true && iscancelloading === false) {
      setCancelmodal(false);
    }
  }, [iscancelloading, prevState?.iscancelloading]);

  const ResendFormSchema = Yup.object().shape({
    Id: Yup.string(),
    is_email: Yup.boolean(),
    is_sms: Yup.boolean(),
    customerEmail: Yup.string().when('is_email', {
      is: true,
      then: Yup.string().required('Email is required').email()
    }),
    customerPhoneNumber: Yup.string().when('is_sms', {
      is: true,
      then: Yup.string().required('Phone Number is required')
    }),
    resentby: Yup.string()
  });

  const resendFormik = useFormik<ResendFormState>({
    initialValues: {
      Id: row?.id,
      is_email: false,
      is_sms: false,
      customerEmail: row?.customerEmail ? row?.customerEmail : '',
      customerPhoneNumber: row?.customerPhoneNumber ? row?.customerPhoneNumber : '',
      resentby: ''
    },
    validationSchema: ResendFormSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const data = { ...values };
        if (values.is_email && values.is_sms) {
          data.resentby = `BOTH`;
        } else if (values.is_email) {
          data.resentby = `EMAIL`;
        } else if (values.is_sms) {
          data.resentby = `SMS`;
        }

        const url = `${API_BASE_URLS.paylink}/paylinks/resent`;
        const response = await axiosInstance.post(url, data);
        if (response) {
          enqueueSnackbar('Paylink Sent', { variant: 'success' });
          setIsResendDialogOpen(false);
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
      } finally {
        setSubmitting(false);
      }
    }
  });
  const { errors, values, touched, setFieldValue, getFieldProps, setFieldError, resetForm } =
    resendFormik;

  const handleEdit = (name: string, value: boolean) => {
    setIsedit((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleCancel = (name: string, value: string) => {
    setFieldValue(`${name}`, value);
  };

  const setPhone = (e: string) => {
    setFieldValue('customerPhoneNumber', e);

    setFieldError('customerPhoneNumber', '');
  };
  const copyToClipboard = (e: any) => {
    if (row?.url !== null) {
      navigator.clipboard.writeText(row?.url);
    }
    enqueueSnackbar('Paylink Copied Successfully', { variant: 'success' });
  };
  return (
    <>
      <TableRow className={classes.mainrow}>
        <TableCell>
          <Button
            aria-label="expand row"
            size="medium"
            variant="text"
            onClick={() => setOpenCollapse(!openCollapse)}
          >
            {openCollapse ? <ArrowDropUpIcon /> : <ArrowRightIcon />}
          </Button>
        </TableCell>
        <TableCell>
          {row?.customerFirstName} {row?.customerLastName}
        </TableCell>
        <TableCell>
          <Stack>
            <Typography>{row?.customerEmail}</Typography>
            <Typography>{row?.customerPhoneNumber}</Typography>
          </Stack>
        </TableCell>
        <TableCell>{row?.transactionReference}</TableCell>
        <TableCell>
          <Stack direction="row" spacing={1}>
            <Typography>{row?.defaultPaylinkCurrency?.symbol}</Typography>
            <Typography>{row?.amount}</Typography>
          </Stack>
        </TableCell>
        <TableCell component="th" scope="row">
          <Stack>
            {row?.createdAt && (
              <>
                <Typography>{fDateMonthMin(row?.createdAt)}</Typography>
                <Typography>{ftimeSuffix(row?.createdAt)}</Typography>
              </>
            )}
          </Stack>
        </TableCell>
        <TableCell>
          {row?.cancelled !== null && (
            <Label variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'} color="error">
              Cancelled
            </Label>
          )}
          {row?.cancelled === null && row?.opened !== null && (
            <Label
              variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
              color={row?.paidStatus ? 'success' : 'warning'}
            >
              {sentenceCase(!row?.paidStatus ? 'Unpaid' : 'Paid')}
            </Label>
          )}
          {row?.cancelled === null && row?.opened === null && (
            <Label variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'} color="default">
              Unopened
            </Label>
          )}
        </TableCell>
        <TableCell>
          {!row?.paidStatus && (
            <Stack direction="row">
              <Button
                variant="outlined"
                onClick={() => {
                  setIsResendDialogOpen(true);
                  setAnchorEl(null);
                  resetForm();
                }}
              >
                Resend <ReplayIcon />
              </Button>

              {row?.cancelled == null && (
                <IconButton
                  id="basic-button"
                  aria-controls="basic-menu"
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                  onClick={handleClick}
                >
                  <Icon icon={moreVerticalFill} width={20} height={20} />
                </IconButton>
              )}
            </Stack>
          )}
          {row?.paidStatus && (
            <Button
              variant="outlined"
              onClick={() => {
                setAnchorEl(null);
                navigate(`${PATH_DASHBOARD.transaction.history}/${row?.gatewayTransactionId}`);
              }}
            >
              View
            </Button>
          )}
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={() => {
              setAnchorEl(null);
            }}
            MenuListProps={{
              'aria-labelledby': 'basic-button'
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left'
            }}
          >
            {!row?.paidStatus && row?.url !== null && (
              <MenuItem
                onClick={(e) => {
                  setAnchorEl(null);
                  copyToClipboard(e);
                }}
              >
                Copy Paylink
              </MenuItem>
            )}
            {!row?.paidStatus && (
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setCancelmodal(true);
                }}
              >
                Cancel
              </MenuItem>
            )}
          </Menu>
        </TableCell>
      </TableRow>
      <TableRow className={`${openCollapse ? classes.mainrow : ''}`}>
        <TableCell style={{ padding: 0 }} colSpan={8}>
          <Collapse in={openCollapse} timeout="auto" unmountOnExit>
            <Stack sx={{ my: 2, mx: 1, p: 2 }} spacing={3}>
              <Stack
                sx={{
                  px: 3
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    textDecoration: 'underline'
                  }}
                  gutterBottom
                  color="textSecondary"
                >
                  Details
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Created By:{' '}
                  <Typography variant="body2" component="span" color="textPrimary">
                    {row?.created_by?.name} {row?.created_by?.familyName}
                  </Typography>
                </Typography>
              </Stack>

              <PaylinkTimeline
                history={{
                  created: row?.createdAt,
                  opened: row?.opened,
                  paid: row?.paid,
                  cancelled: row?.cancelled
                }}
              />
            </Stack>
          </Collapse>
        </TableCell>
      </TableRow>
      <Dialog maxWidth="sm" open={isResendDialogOpen} fullWidth>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ pr: 2 }}
        >
          <DialogTitle>Resend Paylink</DialogTitle>
          <IconButton onClick={() => setIsResendDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />
        <FormikProvider value={resendFormik}>
          <Form onSubmit={resendFormik.handleSubmit}>
            <DialogContent>
              <Stack spacing={3}>
                <Typography color="warning">
                  Resend Paylink to {row?.customerFirstName} {row?.customerLastName} ?
                </Typography>

                <FormGroup>
                  <Stack spacing={3}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="flex-start">
                      <Checkbox
                        checked={values.is_email}
                        onClick={(e) => {
                          setFieldValue('is_email', !values.is_email);
                        }}
                      />
                      <Stack>
                        <Typography>Resend via Email</Typography>
                        {!edit.emailedit ? (
                          <Stack direction="row" spacing={1}>
                            <Typography>{values.customerEmail}</Typography>
                            <EditIcon
                              className={classes.iconCursor}
                              fontSize="small"
                              onClick={() => handleEdit('emailedit', true)}
                            />
                          </Stack>
                        ) : (
                          <Stack direction="row" spacing={1}>
                            <Grid item xs={12} md={12}>
                              <TextField
                                fullWidth
                                {...getFieldProps('customerEmail')}
                                error={Boolean(touched.customerEmail && errors.customerEmail)}
                              />
                            </Grid>
                            <IconButton
                              color="primary"
                              onClick={() => {
                                errors.customerEmail
                                  ? errors.customerEmail.length === 0 &&
                                    handleEdit('emailedit', false)
                                  : handleEdit('emailedit', false);
                              }}
                              aria-label="done"
                            >
                              <DoneIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="primary"
                              onClick={() => {
                                handleEdit('emailedit', false);
                                handleCancel(
                                  'customerEmail',
                                  row?.customerEmail ? row?.customerEmail : ''
                                );
                              }}
                              aria-label="cancel"
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                        <FormHelperText id="customerEmail">{errors.customerEmail}</FormHelperText>
                      </Stack>
                    </Stack>
                    <Stack direction="row" alignItems="flex-start" justifyContent="flex-start">
                      <Checkbox
                        checked={values.is_sms}
                        onClick={(e) => {
                          setFieldValue('is_sms', !values.is_sms);
                        }}
                      />
                      <Stack>
                        <Typography>Resend via SMS</Typography>
                        {!edit.smsedit ? (
                          <Stack direction="row" spacing={1}>
                            <Typography>{values.customerPhoneNumber}</Typography>

                            <EditIcon
                              className={classes.iconCursor}
                              fontSize="small"
                              onClick={() => handleEdit('smsedit', true)}
                            />
                          </Stack>
                        ) : (
                          <Stack direction="row" spacing={1}>
                            <Grid item xs={12} md={12}>
                              <PhoneNoInput
                                formikdata={resendFormik}
                                setPhone={setPhone}
                                require={true}
                                autofocus={true}
                              />
                            </Grid>
                            <IconButton
                              color="primary"
                              onClick={() => {
                                errors.customerPhoneNumber
                                  ? errors.customerPhoneNumber.length === 0 &&
                                    handleEdit('smsedit', false)
                                  : handleEdit('smsedit', false);
                              }}
                              aria-label="done"
                            >
                              <DoneIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="primary"
                              onClick={() => {
                                handleEdit('smsedit', false);
                                handleCancel(
                                  'customerPhoneNumber',
                                  row?.customerPhoneNumber ? row?.customerPhoneNumber : ''
                                );
                              }}
                              aria-label="cancel"
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                        <FormHelperText id="customer-PhoneNumber-helper-text">
                          {errors.customerPhoneNumber}
                        </FormHelperText>
                      </Stack>
                    </Stack>
                    <Stack direction="row">
                      <Checkbox
                        checked={values.is_email && values.is_sms}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setFieldValue('is_sms', e.target.checked);
                          setFieldValue('is_email', e.target.checked);
                        }}
                      />
                      <Stack justifyContent="center" alignItems="center">
                        <Typography>Resend via SMS and Email</Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </FormGroup>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Stack direction="row" spacing={3}>
                <ButtonAnimate>
                  <LoadingButton
                    variant="outlined"
                    type="submit"
                    disabled={
                      edit.emailedit || edit.smsedit || (!values.is_email && !values.is_sms)
                    }
                    loading={resendFormik.isSubmitting}
                  >
                    Resend Paylink
                  </LoadingButton>
                </ButtonAnimate>
              </Stack>
            </DialogActions>
          </Form>
        </FormikProvider>
      </Dialog>
      <Dialog
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        open={cancelmodal}
        maxWidth="sm"
        fullWidth
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ pr: 2 }}
        >
          <DialogTitle>Cancel Paylink</DialogTitle>
        </Stack>
        <DialogContent>
          <Stack>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <LoadingButton
                variant="contained"
                color="secondary"
                onClick={() => handleCancelpaylink(row?.id, index)}
                loading={iscancelloading}
              >
                Yes
              </LoadingButton>
              <LoadingButton
                variant="outlined"
                color="error"
                onClick={() => setCancelmodal(false)}
                loading={iscancelloading}
              >
                No
              </LoadingButton>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrackRow;
