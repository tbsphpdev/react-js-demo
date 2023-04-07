import { Box, Button, Dialog, DialogContent, Stack, Typography } from '@material-ui/core';
import { orange } from '@material-ui/core/colors';
import { ErrorOutlineOutlined } from '@material-ui/icons';
import { LoadingButton } from '@material-ui/lab';

type PropsType = {
  open: boolean;
  msg: string;
  closeAction: (action: boolean) => Promise<void> | void;
};

const Confirmation = ({ msg, open, closeAction }: PropsType) => (
  <Dialog open={open} onClose={() => closeAction(false)}>
    <DialogContent>
      <Stack spacing={5}>
        <Stack spacing={2}>
          <Box display="flex" justifyContent="center">
            <ErrorOutlineOutlined
              sx={{
                color: orange[500],
                fontSize: 40
              }}
            />
          </Box>
          <Typography variant="h6">Are you sure you want to {msg}?</Typography>
        </Stack>

        <Stack
          spacing={3}
          direction="row"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <LoadingButton onClick={() => closeAction(true)} variant="contained" color="primary">
            Yes
          </LoadingButton>
          <Button onClick={() => closeAction(false)} variant="outlined" color="inherit">
            No
          </Button>
        </Stack>
      </Stack>
    </DialogContent>
  </Dialog>
);

export default Confirmation;
