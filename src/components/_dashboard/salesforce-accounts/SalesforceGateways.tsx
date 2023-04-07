import * as Yup from 'yup';
import {
  Table,
  TableContainer,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Paper,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions
} from '@material-ui/core';
import { TableSkeletonLoad } from 'components/common';
import Scrollbar from 'components/Scrollbar';
import { Form, FormikProvider, useFormik } from 'formik';
import { API_BASE_URLS } from 'utils/constant';
import { ErrorMsg } from 'utils/helpError';
import axiosInstance from 'utils/axios';
import LoadingButton from '@material-ui/lab/LoadingButton';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { ButtonAnimate } from 'components/animate';

const TABLE_HEADERS = ['Gateway', 'MID'];

type GatewayType = {
  MID: String;
};

interface Props {
  GatewayDetails: GatewayType[];
  isLoadingDetails: Boolean;
  classes: any;
  selectedAccounts: any;
  handleselectAll: any;
}

const SalesforceGateways = ({
  GatewayDetails,
  isLoadingDetails,
  classes,
  selectedAccounts,
  handleselectAll
}: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isRaiseTicketOpen, setIsRaiseTicketOpen] = useState(false);
  const createTicketSchema = Yup.object().shape({
    note: Yup.string().required('Message Is Required')
  });
  const createTicketFormik = useFormik({
    initialValues: {
      category: 'Gateway',
      note: ''
    },
    validationSchema: createTicketSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const url = `${API_BASE_URLS.salesforce}/account/salesforces/ticket`;
        await axiosInstance.post(url, {
          subject: values.category,
          description: values.note
        });

        enqueueSnackbar('Ticket Created Successfully', { variant: 'success' });
        setSubmitting(false);
        setIsRaiseTicketOpen(false);
        resetForm();
      } catch (error) {
        console.error(error);
        enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
        resetForm();
        setSubmitting(false);
      }
    }
  });

  const GATEWAY_TABLE = GatewayDetails.map((data: any) => data);
  const { errors, touched, getFieldProps } = createTicketFormik;
  return (
    <Scrollbar>
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              {TABLE_HEADERS.map((header, idx) => (
                <TableCell key={`transaction-header-${idx}`}>{header}</TableCell>
              ))}
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!isLoadingDetails &&
              GATEWAY_TABLE.map((row: any) => (
                <TableRow key={row.assetId}>
                  <TableCell />
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <Typography>{row.MID ? row.MID : ''}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        setIsRaiseTicketOpen(true);
                      }}
                    >
                      Support
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

            {isLoadingDetails && <TableSkeletonLoad colSpan={TABLE_HEADERS.length + 1} rows={1} />}
            {selectedAccounts !== '' && !isLoadingDetails && GATEWAY_TABLE.length < 1 && (
              <TableRow>
                <TableCell colSpan={TABLE_HEADERS.length + 1}>
                  <Typography color="textSecondary">No Gateway Found...</Typography>
                </TableCell>
              </TableRow>
            )}
            {selectedAccounts === '' && !isLoadingDetails && GATEWAY_TABLE.length < 1 && (
              <TableRow>
                <TableCell colSpan={TABLE_HEADERS.length + 1}>
                  <Typography color="textSecondary">Please select an account...</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog maxWidth="sm" open={isRaiseTicketOpen} fullWidth>
        <DialogTitle>Raise Ticket</DialogTitle>
        <FormikProvider value={createTicketFormik}>
          <Form noValidate onSubmit={createTicketFormik.handleSubmit}>
            <DialogContent>
              <Stack spacing={3}>
                <TextField
                  placeholder="Type Your Message"
                  multiline
                  rows={10}
                  {...getFieldProps('note')}
                  error={Boolean(touched.note && errors.note)}
                  helperText={touched.note && errors.note}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Stack direction="row" spacing={3}>
                <ButtonAnimate>
                  <LoadingButton
                    variant="outlined"
                    type="submit"
                    loading={createTicketFormik.isSubmitting}
                  >
                    Report
                  </LoadingButton>
                </ButtonAnimate>
                <Button variant="contained" onClick={() => setIsRaiseTicketOpen(false)}>
                  Close
                </Button>
              </Stack>
            </DialogActions>
          </Form>
        </FormikProvider>
      </Dialog>
    </Scrollbar>
  );
};

export default SalesforceGateways;
