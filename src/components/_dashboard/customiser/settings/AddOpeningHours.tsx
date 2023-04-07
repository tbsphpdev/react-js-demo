import {
  Button,
  experimentalStyled,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  TableContainer,
  Table,
  TableBody,
  Paper,
  DialogActions,
  Typography,
  TextField,
  Divider
} from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { LoadingButton } from '@material-ui/lab';
import Confirmation from 'components/MessageDialogs/Confirmation';
import useToggle from 'hooks/useToggle';
import { useCallback } from 'react';
import {
  handleContact,
  openingHoursState,
  resetOpeningHoursChanges
} from 'redux/slices/customiser';
import { RootState, dispatch, useSelector } from 'redux/store';
import OpeningHoursSingle from './OpeningHoursSingle';
import SettingsLabel from './SettingsLabel';

const ButtonStyle = experimentalStyled(Button)(({ theme }) => ({
  color: theme.palette.text.disabled,
  justifyContent: 'space-between',
  fontWeight: 400
}));

const AddOpeningHours = () => {
  const [isOpen, setIsOpen] = useToggle(false);
  const [isConfirmOpen, setIsConfirmOpen] = useToggle(false);

  const { openingHours, id } = useSelector((state: RootState) => state.customiser);

  const { contact, ...rest } = openingHours;
  const { contact: contactState, ...restState } = openingHoursState;

  const handleDialogActions = (action: boolean) => {
    if (action) {
      handleRevertChanges();
    }
    setIsConfirmOpen(false);
  };

  const handleRevertChanges = useCallback(() => {
    dispatch(resetOpeningHoursChanges(id));
    setIsOpen(false);
  }, [id, setIsOpen]);

  const handleContactInput = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    type: 'email' | 'phone'
  ) => {
    const { value } = event.target;
    const payload = {
      key: type,
      data: value
    };

    dispatch(handleContact(payload));
  };

  return (
    <Stack>
      <SettingsLabel title="Add Opening Hours" />
      <ButtonStyle
        fullWidth
        variant="outlined"
        endIcon={<Add />}
        size="large"
        color="inherit"
        onClick={() => setIsOpen()}
      >
        Add your business hours
      </ButtonStyle>

      <Dialog open={isOpen} onClose={() => setIsOpen()} maxWidth="md" scroll="paper">
        <DialogTitle>Opening Hours</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TableContainer component={Paper}>
              <Table aria-label="Opening Hours Selection Table" size="small">
                <TableBody>
                  {openingHours
                    ? Object.entries(rest).map(([key, val]) => (
                        <OpeningHoursSingle key={key} day={key} value={val} />
                      ))
                    : Object.entries(restState).map(([key, val]) => (
                        <OpeningHoursSingle key={key} day={key} value={val} />
                      ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />

            <Stack spacing={1}>
              <Typography variant="subtitle1" gutterBottom>
                Contact Details
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  label="Contact Email"
                  onChange={(e) => handleContactInput(e, 'email')}
                  value={openingHours ? contact?.email : contactState.email}
                />
                <TextField
                  label="Contact Phone No."
                  onChange={(e) => handleContactInput(e, 'phone')}
                  value={openingHours ? contact?.phone : contactState.phone}
                />
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <LoadingButton variant="contained" color="primary" onClick={() => setIsOpen(false)}>
            Confirm Opening Hours
          </LoadingButton>
          <LoadingButton variant="contained" color="inherit" onClick={() => setIsConfirmOpen(true)}>
            Cancel Changes
          </LoadingButton>
          <Confirmation
            open={isConfirmOpen}
            msg="Cancel the changes"
            closeAction={handleDialogActions}
          />
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AddOpeningHours;
