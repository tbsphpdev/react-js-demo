import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useFormik, Form, FormikProvider } from 'formik';
// material
import { Card, Stack, Typography, Grid, Box, makeStyles, useTheme } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { ErrorMsg } from 'utils/helpError';
import { API_BASE_URLS } from 'utils/constant';
import axiosInstance from 'utils/axios';
import LoadingScreen from 'components/LoadingScreen';
import NotificationRow from './NotificationRow';

// ----------------------------------------------------------------------

const OPTIONS_HEADER = ['Notification', 'Email', 'Blink', 'Reminder'];

const TABS = ['Paylink', 'Virtual Terminal', 'Blink Page', 'Direct Debits'];

const useStyles = makeStyles((theme) => ({
  tab: {
    width: '100%',
    minHeight: 50,
    padding: '5px',
    boxShadow: `0px 0px 3px ${theme.palette.primary.dark}`,
    borderRadius: '5px',
    color: theme.palette.text.primary,
    fontSize: '1em',
    display: 'flex',
    justifyContent: 'center',
    '&:hover': {
      color: '#ffffff',
      backgroundColor: theme.palette.secondary.light,
      cursor: 'pointer'
    }
  },
  tabActive: {
    color: '#ffffff',
    backgroundColor: theme.palette.secondary.main,
    cursor: 'pointer'
  }
}));

// ----------------------------------------------------------------------

type NotificationDetails = {
  email: boolean;
  blink: boolean;
  reminder?: {
    frequency: number;
    frequencyUnit: string;
  };
};

type Notifications = {
  payLink: {
    sent: NotificationDetails;
    paid: NotificationDetails;
    opened: NotificationDetails;
    unopened: NotificationDetails;
    unpaid: NotificationDetails;
    cancelled: NotificationDetails;
    verifySuccess: NotificationDetails;
    resent: NotificationDetails;
  };
  vt: {
    saleDeclined: NotificationDetails;
    paymentSuccess: NotificationDetails;
    verifySuccess: NotificationDetails;
    verifyFailed: NotificationDetails;
    preAuthSuccess: NotificationDetails;
    preAuthFailed: NotificationDetails;
    preAuthExpireIn: NotificationDetails;
    preAuthCaptured: NotificationDetails;
    preAuthExpired: NotificationDetails;
    delayCaptureSuccess: NotificationDetails;
    delayCaptureFailed: NotificationDetails;
    delayCaptureCaptured: NotificationDetails;
  };
  bp: {
    paymentSuccess: NotificationDetails;
    paymentFailed: NotificationDetails;
  };
  directDebit: {
    mandateMade: NotificationDetails;
    paymentMade: NotificationDetails;
    paymentSuccess: NotificationDetails;
    customerCancelledMandate: NotificationDetails;
  };
};

const INITIAL_NOTIFICATIONS = {
  payLink: {
    sent: {
      email: false,
      blink: false
    },
    paid: {
      email: false,
      blink: false
    },
    opened: {
      email: false,
      blink: false
    },
    unopened: {
      email: false,
      blink: false,
      reminder: {
        frequency: 1,
        frequencyUnit: 'days'
      }
    },
    unpaid: {
      email: false,
      blink: false,
      reminder: {
        frequency: 1,
        frequencyUnit: 'days'
      }
    },
    cancelled: {
      email: false,
      blink: false
    },
    verifySuccess: {
      email: false,
      blink: false
    },
    resent: {
      email: false,
      blink: false
    }
  },
  vt: {
    saleDeclined: {
      email: false,
      blink: false
    },
    paymentSuccess: {
      email: false,
      blink: false
    },
    paymentFailed: {
      email: false,
      blink: false
    },
    verifySuccess: {
      email: false,
      blink: false
    },
    verifyFailed: {
      email: false,
      blink: false
    },
    preAuthSuccess: {
      email: false,
      blink: false
    },
    preAuthFailed: {
      email: false,
      blink: false
    },
    preAuthExpireIn: {
      email: false,
      blink: false,
      reminder: {
        frequency: 1,
        frequencyUnit: 'days'
      }
    },
    preAuthCaptured: {
      email: false,
      blink: false
    },
    preAuthExpired: {
      email: false,
      blink: false
    },
    delayCaptureSuccess: {
      email: false,
      blink: false
    },
    delayCaptureFailed: {
      email: false,
      blink: false
    },
    delayCaptureCaptured: {
      email: false,
      blink: false
    }
  },
  bp: {
    paymentSuccess: {
      email: false,
      blink: false
    },
    paymentFailed: {
      email: false,
      blink: false
    }
  },
  directDebit: {
    mandateMade: {
      email: false,
      blink: false
    },
    paymentMade: {
      email: false,
      blink: false
    },
    paymentSuccess: {
      email: false,
      blink: false
    },
    customerCancelledMandate: {
      email: false,
      blink: false
    }
  }
};

export default function AccountNotifications(props: { userSub: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const classes = useStyles(theme);
  const [activeTab, setActiveTab] = useState(0);
  const [notificationData, setNotificationData] = useState<Notifications>(INITIAL_NOTIFICATIONS);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchnNotificationData = async () => {
      try {
        const url = `${API_BASE_URLS.user}/merchant/${props.userSub}/notification/settings`;
        const response = await axiosInstance.get(url);
        if (response.data) {
          const { payLink, directDebit, bp, vt } = response.data.message;

          setNotificationData({ payLink, directDebit, bp, vt });
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchnNotificationData();
  }, [enqueueSnackbar, props.userSub]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: notificationData,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const url = `${API_BASE_URLS.user}/merchant/${props.userSub}/notification/settings`;
        await axiosInstance.put(url, values);
        enqueueSnackbar('Save success', { variant: 'success' });
      } catch (err) {
        enqueueSnackbar(ErrorMsg(err), {
          variant: 'error'
        });
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { values, isSubmitting, handleSubmit, getFieldProps, setFieldValue } = formik;

  const PaylinkNotifications = () => (
    <>
      <Stack spacing={1} direction="column">
        <NotificationRow
          label="Sent"
          getFieldPropsEmail={getFieldProps(`payLink.sent.email`)}
          getFieldPropsBlink={getFieldProps(`payLink.sent.blink`)}
          emailVal={values.payLink.sent.email}
          blinkVal={values.payLink.sent.blink}
        />
        <NotificationRow
          label="Resent"
          getFieldPropsEmail={getFieldProps(`payLink.resent.email`)}
          getFieldPropsBlink={getFieldProps(`payLink.resent.blink`)}
          emailVal={values.payLink.resent.email}
          blinkVal={values.payLink.resent.blink}
        />
        <NotificationRow
          label="Paid"
          getFieldPropsEmail={getFieldProps(`payLink.paid.email`)}
          getFieldPropsBlink={getFieldProps(`payLink.paid.blink`)}
          emailVal={values.payLink.paid.email}
          blinkVal={values.payLink.paid.blink}
        />
        <NotificationRow
          label="Unpaid"
          getFieldPropsEmail={getFieldProps(`payLink.unpaid.email`)}
          getFieldPropsBlink={getFieldProps(`payLink.unpaid.blink`)}
          setReminderFrequency={(val: any) => {
            setFieldValue(`payLink.unpaid.reminder.frequency`, val);
          }}
          setReminderUnit={(val: any) => {
            setFieldValue(`payLink.unpaid.reminder.frequencyUnit`, val);
          }}
          emailVal={values.payLink.unpaid.email}
          blinkVal={values.payLink.unpaid.blink}
          reminder={values.payLink.unpaid.reminder}
        />
        <NotificationRow
          label="Opened"
          getFieldPropsEmail={getFieldProps(`payLink.opened.email`)}
          getFieldPropsBlink={getFieldProps(`payLink.opened.blink`)}
          emailVal={values.payLink.opened.email}
          blinkVal={values.payLink.opened.blink}
        />
        <NotificationRow
          label="Unopened"
          getFieldPropsEmail={getFieldProps(`payLink.unopened.email`)}
          getFieldPropsBlink={getFieldProps(`payLink.unopened.blink`)}
          emailVal={values.payLink.unopened.email}
          blinkVal={values.payLink.unopened.blink}
        />
        <NotificationRow
          label="Cancelled"
          getFieldPropsEmail={getFieldProps(`payLink.cancelled.email`)}
          getFieldPropsBlink={getFieldProps(`payLink.cancelled.blink`)}
          emailVal={values.payLink.cancelled.email}
          blinkVal={values.payLink.cancelled.blink}
        />
        <NotificationRow
          label="Verify Success"
          getFieldPropsEmail={getFieldProps(`payLink.verifySuccess.email`)}
          getFieldPropsBlink={getFieldProps(`payLink.verifySuccess.blink`)}
          emailVal={values.payLink.verifySuccess.email}
          blinkVal={values.payLink.verifySuccess.blink}
        />
      </Stack>
    </>
  );

  const VTNotifications = () => (
    <>
      <Stack spacing={1} direction="column">
        <NotificationRow
          label="Sale Declined"
          getFieldPropsEmail={getFieldProps(`vt.saleDeclined.email`)}
          getFieldPropsBlink={getFieldProps(`vt.saleDeclined.blink`)}
          emailVal={values.vt.saleDeclined.email}
          blinkVal={values.vt.saleDeclined.blink}
        />
        <NotificationRow
          label="Payment Success"
          getFieldPropsEmail={getFieldProps(`vt.paymentSuccess.email`)}
          getFieldPropsBlink={getFieldProps(`vt.paymentSuccess.blink`)}
          emailVal={values.vt.paymentSuccess.email}
          blinkVal={values.vt.paymentSuccess.blink}
        />
        <NotificationRow
          label="Verify Success"
          getFieldPropsEmail={getFieldProps(`vt.verifySuccess.email`)}
          getFieldPropsBlink={getFieldProps(`vt.verifySuccess.blink`)}
          emailVal={values.vt.verifySuccess.email}
          blinkVal={values.vt.verifySuccess.blink}
        />
        <NotificationRow
          label="Verify Failed"
          getFieldPropsEmail={getFieldProps(`vt.verifyFailed.email`)}
          getFieldPropsBlink={getFieldProps(`vt.verifyFailed.blink`)}
          emailVal={values.vt.verifyFailed.email}
          blinkVal={values.vt.verifyFailed.blink}
        />
        <NotificationRow
          label="Pre Auth Success"
          getFieldPropsEmail={getFieldProps(`vt.preAuthSuccess.email`)}
          getFieldPropsBlink={getFieldProps(`vt.preAuthSuccess.blink`)}
          emailVal={values.vt.preAuthSuccess.email}
          blinkVal={values.vt.preAuthSuccess.blink}
        />
        <NotificationRow
          label="Pre Auth Failed"
          getFieldPropsEmail={getFieldProps(`vt.preAuthFailed.email`)}
          getFieldPropsBlink={getFieldProps(`vt.preAuthFailed.blink`)}
          emailVal={values.vt.preAuthFailed.email}
          blinkVal={values.vt.preAuthFailed.blink}
        />
        <NotificationRow
          label="Pre Auth Expiring"
          getFieldPropsEmail={getFieldProps(`vt.preAuthExpireIn.email`)}
          getFieldPropsBlink={getFieldProps(`vt.preAuthExpireIn.blink`)}
          emailVal={values.vt.preAuthExpireIn.email}
          blinkVal={values.vt.preAuthExpireIn.blink}
          reminder={values.vt.preAuthExpireIn.reminder}
        />
        <NotificationRow
          label="Pre Auth Expired"
          getFieldPropsEmail={getFieldProps(`vt.preAuthExpired.email`)}
          getFieldPropsBlink={getFieldProps(`vt.preAuthExpired.blink`)}
          emailVal={values.vt.preAuthExpired.email}
          blinkVal={values.vt.preAuthExpired.blink}
        />
        <NotificationRow
          label="Pre Auth Captured"
          getFieldPropsEmail={getFieldProps(`vt.preAuthCaptured.email`)}
          getFieldPropsBlink={getFieldProps(`vt.preAuthCaptured.blink`)}
          emailVal={values.vt.preAuthCaptured.email}
          blinkVal={values.vt.preAuthCaptured.blink}
        />
        <NotificationRow
          label="Delay Capture Success"
          getFieldPropsEmail={getFieldProps(`vt.delayCaptureSuccess.email`)}
          getFieldPropsBlink={getFieldProps(`vt.delayCaptureSuccess.blink`)}
          emailVal={values.vt.delayCaptureSuccess.email}
          blinkVal={values.vt.delayCaptureSuccess.blink}
        />
        <NotificationRow
          label="Delay Capture Failed"
          getFieldPropsEmail={getFieldProps(`vt.delayCaptureFailed.email`)}
          getFieldPropsBlink={getFieldProps(`vt.delayCaptureFailed.blink`)}
          emailVal={values.vt.delayCaptureFailed.email}
          blinkVal={values.vt.delayCaptureFailed.blink}
        />
        <NotificationRow
          label="Delay Capture Captured"
          getFieldPropsEmail={getFieldProps(`vt.delayCaptureCaptured.email`)}
          getFieldPropsBlink={getFieldProps(`vt.delayCaptureCaptured.blink`)}
          emailVal={values.vt.delayCaptureCaptured.email}
          blinkVal={values.vt.delayCaptureCaptured.blink}
        />
      </Stack>
    </>
  );

  const BPNotifications = () => (
    <>
      <Stack spacing={1} direction="column">
        <NotificationRow
          label="Payment Success"
          getFieldPropsEmail={getFieldProps(`bp.paymentSuccess.email`)}
          getFieldPropsBlink={getFieldProps(`bp.paymentSuccess.blink`)}
          emailVal={values.bp.paymentSuccess.email}
          blinkVal={values.bp.paymentSuccess.blink}
        />
        <NotificationRow
          label="Payment Failed"
          getFieldPropsEmail={getFieldProps(`bp.paymentFailed.email`)}
          getFieldPropsBlink={getFieldProps(`bp.paymentFailed.blink`)}
          emailVal={values.bp.paymentFailed.email}
          blinkVal={values.bp.paymentFailed.blink}
        />
      </Stack>
    </>
  );

  const DDNotifications = () => (
    <>
      <Stack spacing={1} direction="column">
        <NotificationRow
          label="Mandate Made"
          getFieldPropsEmail={getFieldProps(`directDebit.mandateMade.email`)}
          getFieldPropsBlink={getFieldProps(`directDebit.mandateMade.blink`)}
          emailVal={values.directDebit.mandateMade.email}
          blinkVal={values.directDebit.mandateMade.blink}
        />
        <NotificationRow
          label="Payment Made"
          getFieldPropsEmail={getFieldProps(`directDebit.paymentMade.email`)}
          getFieldPropsBlink={getFieldProps(`directDebit.paymentMade.blink`)}
          emailVal={values.directDebit.paymentMade.email}
          blinkVal={values.directDebit.paymentMade.blink}
        />
        <NotificationRow
          label="Payment Success"
          getFieldPropsEmail={getFieldProps(`directDebit.paymentSuccess.email`)}
          getFieldPropsBlink={getFieldProps(`directDebit.paymentSuccess.blink`)}
          emailVal={values.directDebit.paymentSuccess.email}
          blinkVal={values.directDebit.paymentSuccess.blink}
        />
        <NotificationRow
          label="Customer Cancelled Mandate"
          getFieldPropsEmail={getFieldProps(`directDebit.customerCancelledMandate.email`)}
          getFieldPropsBlink={getFieldProps(`directDebit.customerCancelledMandate.blink`)}
          emailVal={values.directDebit.customerCancelledMandate.email}
          blinkVal={values.directDebit.customerCancelledMandate.blink}
        />
      </Stack>
    </>
  );

  return (
    <Card sx={{ p: 3 }}>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Stack spacing={3} alignItems="flex-end">
            <Grid container spacing={3}>
              <Grid item sm={3} xs={12}>
                <Stack sx={{ width: '100%' }} spacing={2} direction={{ xs: 'row', sm: 'column' }}>
                  {TABS.map((tab, i) => (
                    <Stack flexGrow={1} key={i}>
                      <Box
                        className={`${classes.tab} ${activeTab === i && classes.tabActive}`}
                        onClick={() => {
                          setActiveTab(i);
                        }}
                      >
                        <Stack alignSelf="center">
                          <Typography variant="subtitle1" align="center" fontSize=".9em">
                            {tab}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
              <Grid item sm={9} xs={12} sx={{ paddingLeft: { sm: '50px !important' } }}>
                <Stack spacing={2}>
                  <Stack>
                    <Typography variant="h6">{TABS[activeTab]}</Typography>
                  </Stack>
                  <Stack spacing={2}>
                    <Grid container spacing={1} sx={{ margin: 0 }}>
                      <Grid item xs={5} sx={{ paddingLeft: '0 !important' }}>
                        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                          {OPTIONS_HEADER[0]}
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sx={{ paddingLeft: '0 !important' }}>
                        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                          {OPTIONS_HEADER[1]}
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sx={{ paddingLeft: '0 !important' }}>
                        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                          {OPTIONS_HEADER[2]}
                        </Typography>
                      </Grid>
                      <Grid item xs={3} sx={{ paddingLeft: '0 !important' }}>
                        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                          {OPTIONS_HEADER[3]}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Stack>
                  <Stack sx={{ position: 'relative' }}>
                    {loading && (
                      <LoadingScreen
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          zIndex: 99
                        }}
                      />
                    )}
                    {activeTab === 0 && PaylinkNotifications()}
                    {activeTab === 1 && VTNotifications()}
                    {activeTab === 2 && BPNotifications()}
                    {activeTab === 3 && DDNotifications()}
                  </Stack>
                </Stack>
              </Grid>
            </Grid>

            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={loading}
            >
              Save Changes
            </LoadingButton>
          </Stack>
        </Form>
      </FormikProvider>
    </Card>
  );
}
