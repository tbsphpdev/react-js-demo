import { gCCustomerMandateDetails } from '@customTypes/goCardLess';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  makeStyles,
  Stack,
  Typography,
  useTheme
} from '@material-ui/core';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { LoadingButton } from '@material-ui/lab';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';
import { fDateAbr, ftimeSuffix } from 'utils/formatTime';
import { ErrorMsg } from 'utils/helpError';
import CreateBankMandate from './CreateBankMandate';

const useStyles = makeStyles((theme) => ({
  justifyContBtw: {
    justifyContent: 'space-between'
  },
  btnAction: {
    padding: '0 10px 0 10px',
    color: '#3d5afe',
    border: '1px solid #3d5afe',
    borderRadius: 4,
    fontWeight: 600,
    fontSize: '.7em',
    minWidth: 'min-content',
    '&.error': {
      color: theme.palette.error.main,
      border: `1px solid ${theme.palette.error.main}`,
      fontSize: '.9em',
      lineHeight: '1.1em',
      width: '100%'
    },
    '&.success': {
      color: theme.palette.success.dark,
      border: `1px solid ${theme.palette.success.dark}`,
      fontSize: '.9em',
      lineHeight: '1.1em',
      width: '100%'
    }
  },
  btnCreate: {
    width: '100%',
    height: '100%',
    padding: '2px 20px 2px 20px',
    margin: 0,
    color: '#7635dc',
    '& p': {
      fontSize: '1em',
      color: theme.palette.text.primary
    }
  },
  blockHeading: {
    '& h6': {
      fontSize: '1em'
    }
  },
  fw300: {
    fontWeight: 300
  },
  baDetails: {
    color: theme.palette.text.primary,
    '& h6': {
      fontSize: '.8em'
    }
  },
  baTableHeader: {
    color: '#637381',
    marginBottom: 10,
    '& h6': {
      fontSize: '.7em'
    }
  },
  baTableCell: {
    paddingTop: 5,
    paddingBottom: 5,
    '& h6': {
      fontSize: '.8em'
    },

    '& span': {
      padding: 5,
      borderRadius: 4,
      fontSize: '.7em'
    }
  },
  mColumn: {
    display: 'flex',
    '& h6': { alignSelf: 'center' }
  }
}));

const GCCustomerBankAccounts = () => {
  const theme = useTheme();
  const classes = useStyles(theme);
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [customerMandates, setCustomerMandates] = useState<gCCustomerMandateDetails[]>([]);
  const [bankList, setBankList] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<any>('');
  const [mandateLoading, setMandateLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ type: '', id: '' });
  const [createDialog, setCreateDialog] = useState(false);

  const fetchMandates = async (bankId: string, load: boolean = true) => {
    try {
      load && setMandateLoading(true);
      setIsLoading(true);
      const url = `${API_BASE_URLS.goCardless}/gocardless/customers/${params.id}/banks/${bankId}/mandates`;
      const { data } = await axiosInstance.get(url);

      setCustomerMandates(data.message);
    } catch (error) {
      enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
      setMandateLoading(false);
    }
  };

  useEffect(() => {
    const fetchBankList = async () => {
      try {
        setIsLoading(true);
        const url = `${API_BASE_URLS.goCardless}/gocardless/customers/${params.id}/banks`;
        const { data } = await axiosInstance.get(url);

        setBankList(data.message);
      } catch (error) {
        enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBankList();
  }, [enqueueSnackbar, params.id]);

  const handleReinstate = async (mandateId: string) => {
    try {
      setIsSubmitting(true);
      const url = `${API_BASE_URLS.goCardless}/gocardless/customers/${params.id}/mandates/${mandateId}/reinstate`;
      await axiosInstance.post(url);

      enqueueSnackbar('Reinstate Successfull', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
      console.error(error);
    } finally {
      setIsSubmitting(false);
      fetchMandates(bankList[expanded].id, false);
      setDialog({ type: '', id: '' });
    }
  };

  const handleCancel = async (mandateId: string) => {
    try {
      setIsSubmitting(true);
      const url = `${API_BASE_URLS.goCardless}/gocardless/customers/${params.id}/mandates/${mandateId}`;
      await axiosInstance.delete(url);

      enqueueSnackbar('Cancelled', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
      console.error(error);
    } finally {
      setIsSubmitting(false);

      fetchMandates(bankList[expanded].id, false);
      setDialog({ type: '', id: '' });
    }
  };

  const BankRow = (props?: any) => {
    const { index, bankDetails } = props;
    const key = index;
    return (
      <Accordion expanded={expanded === key} sx={{ boxShadow: `0px 1px 3px black` }}>
        <AccordionSummary
          expandIcon={
            expanded === key ? (
              <ExpandMoreIcon
                onClick={() => {
                  setExpanded(null);
                }}
              />
            ) : (
              <Button
                variant="outlined"
                className={classes.btnAction}
                onClick={() => {
                  expanded !== key && setCustomerMandates([]);
                  setExpanded(key);
                  fetchMandates(bankDetails.id);
                }}
              >
                View
              </Button>
            )
          }
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Stack
            sx={{
              width: '100%'
            }}
            key={key}
          >
            <Grid container className={classes.baDetails}>
              <Grid item xs={6}>
                <Typography variant="subtitle1">{bankDetails?.bank_name || ''}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1">{`${fDateAbr(
                  bankDetails?.created_at
                )} ${ftimeSuffix(bankDetails?.created_at)}`}</Typography>
              </Grid>
            </Grid>
          </Stack>
        </AccordionSummary>
        <Divider />
        <AccordionDetails>
          <Stack sx={{ fontWeight: 700 }}>Mandates</Stack>
          <Stack>
            <Grid container spacing={2} className={classes.baTableHeader}>
              <Grid item xs={6}>
                <Typography variant="subtitle1">Ref</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="subtitle1">Initiated</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="subtitle1">Status</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="subtitle1">Actions</Typography>
              </Grid>
            </Grid>
            {expanded === key &&
              customerMandates.map((obj: any, i: number) => (
                <Mandate key={i} mandateDetails={obj} />
              ))}
            {mandateLoading && (
              <Stack direction="row" justifyContent="center" alignItems="center">
                <CircularProgress color="inherit" size={40} />
              </Stack>
            )}
            {!mandateLoading && customerMandates.length === 0 && (
              <Typography variant="subtitle1">No Mandates Found</Typography>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  };

  const Mandate = (props?: any) => {
    const { key, mandateDetails } = props;
    const M_Status = mandateDetails.status.toLowerCase();
    return (
      <Stack key={key}>
        <Grid container spacing={2} className={classes.baTableCell}>
          <Grid item xs={6} paddingRight={2} className={classes.mColumn}>
            <Typography variant="subtitle1" className={`${classes.fw300} `}>
              {mandateDetails.id || ''}| {mandateDetails.reference || ''}
            </Typography>
          </Grid>
          <Grid item xs={2} className={classes.mColumn}>
            <Typography variant="subtitle1" className={`${classes.fw300} `}>
              {`${fDateAbr(mandateDetails?.created_at)} ${ftimeSuffix(mandateDetails?.created_at)}`}
            </Typography>
          </Grid>
          <Grid item xs={2} className={classes.mColumn}>
            <Typography
              sx={{
                textTransform: 'capitalize',
                wordWrap: 'break-word',
                maxWidth: '100%',
                textAlign: 'center',
                background:
                  (M_Status === 'pending_submission' && theme.palette.warning.lighter) ||
                  (M_Status === 'active' && theme.palette.success.lighter) ||
                  theme.palette.error.lighter,
                color:
                  (M_Status === 'pending_submission' && theme.palette.warning.dark) ||
                  (M_Status === 'active' && theme.palette.success.dark) ||
                  theme.palette.error.dark,
                paddingX: '5px',
                borderRadius: '5px'
              }}
              variant="h6"
            >
              {M_Status === 'pending_submission'
                ? `${M_Status.split('_')[0]} ${M_Status.split('_')[1]}`
                : M_Status}
            </Typography>
          </Grid>
          <Grid item xs={2} className={classes.mColumn}>
            {M_Status === 'cancelled' ? (
              <LoadingButton
                variant="outlined"
                className={`${classes.btnAction} success`}
                onClick={() => {
                  setDialog({ type: 'reinstate', id: mandateDetails.id });
                }}
                loading={isSubmitting}
              >
                Reinstate
              </LoadingButton>
            ) : (
              <LoadingButton
                variant="outlined"
                className={`${classes.btnAction} error`}
                onClick={() => {
                  setDialog({ type: 'cancel', id: mandateDetails.id });
                }}
                loading={isSubmitting}
              >
                Cancel
              </LoadingButton>
            )}
          </Grid>
        </Grid>
      </Stack>
    );
  };

  const ConfirmDialog = (
    <Stack>
      <Dialog open={!!dialog.type} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialog.type === 'cancel' && 'Cancel Mandate'}{' '}
          {dialog.type === 'reinstate' && 'Reinstate Mandate'} {dialog.id}
        </DialogTitle>

        <DialogContent>
          <Typography variant="subtitle1">
            Are you sure you want to {dialog.type} this Mandate
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setDialog({ type: '', id: '' })}>
            Close
          </Button>
          {dialog.type === 'cancel' && (
            <LoadingButton
              variant="outlined"
              onClick={() => handleCancel(dialog.id)}
              loading={isSubmitting}
            >
              Cancel
            </LoadingButton>
          )}
          {dialog.type === 'reinstate' && (
            <LoadingButton
              variant="outlined"
              onClick={() => handleReinstate(dialog.id)}
              loading={isSubmitting}
            >
              Reinstate
            </LoadingButton>
          )}
        </DialogActions>
      </Dialog>
    </Stack>
  );

  return (
    <>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'row' }} className={classes.justifyContBtw}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Stack className={classes.blockHeading}>
              <Typography variant="h6" className={classes.fw300}>
                Bank Accounts
              </Typography>
            </Stack>
            <Stack>
              <Button
                className={classes.btnCreate}
                onClick={() => {
                  setCreateDialog(true);
                }}
              >
                <Typography> Create New </Typography>{' '}
                <AddCircleIcon style={{ margin: 5 }} fontSize="small" />
              </Button>
            </Stack>
          </Stack>
        </Stack>
        <Stack>
          <Divider />
        </Stack>
        <Stack>
          {isLoading && bankList.length === 0 && (
            <Stack direction="row" justifyContent="center" alignItems="center">
              <CircularProgress color="inherit" size={40} />
            </Stack>
          )}
          {!isLoading && bankList.length === 0 && (
            <Typography variant="subtitle1">No Bank Found</Typography>
          )}
          {bankList.map((obj: any, i: number) => (
            <BankRow key={i} index={i} bankDetails={obj} />
          ))}
        </Stack>
        {ConfirmDialog}
      </Stack>
      <CreateBankMandate
        isOpen={createDialog}
        setOpen={() => {
          setCreateDialog(false);
        }}
        banks={bankList}
      />
    </>
  );
};

export default GCCustomerBankAccounts;
