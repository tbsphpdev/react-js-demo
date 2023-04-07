import { ActionTypes, DialogMsgActions } from '@customTypes/transaction';
import { Box, Button, Dialog, DialogContent, Stack, Typography } from '@material-ui/core';
import { experimentalStyled as styled } from '@material-ui/core/styles';
import { Dispatch } from 'react';

type PropTypes = {
  open: boolean;
  errorMsg: string | null;
  closeAction: Dispatch<DialogMsgActions>;
};

const CenteredWrapperStyle = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});

const PrimaryTextStyle = styled(Typography)(({ theme }) => ({
  color: theme.palette.mode === 'light' ? '#4A5A69' : theme.palette.text.secondary,
  fontWeight: 400,
  fontSize: theme.typography.pxToRem(26),
  [theme.breakpoints.between('sm', 'md')]: {
    fontSize: theme.typography.pxToRem(30)
  },
  [theme.breakpoints.between('md', 'lg')]: {
    fontSize: theme.typography.pxToRem(35)
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: theme.typography.pxToRem(40)
  }
}));

const SecondaryTextStyle = styled(Typography)({
  color: '#637381'
});

const DetailsSectionStyle = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.grey[50012],
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius
}));

const ErrorDialog = ({ open, errorMsg, closeAction }: PropTypes) => (
  <Dialog open={open}>
    <DialogContent>
      <Box sx={{ p: 5 }}>
        <Stack spacing={3}>
          <CenteredWrapperStyle>
            <img src="/static/dialog/declined.svg" alt="success" width="100" />
          </CenteredWrapperStyle>
          <Box>
            <PrimaryTextStyle align="center">Declined!</PrimaryTextStyle>
            <SecondaryTextStyle align="center">
              Issue with processing the payment
            </SecondaryTextStyle>
          </Box>
          <Stack spacing={4}>
            <DetailsSectionStyle>
              <SecondaryTextStyle>{errorMsg}</SecondaryTextStyle>
            </DetailsSectionStyle>

            <Stack spacing={3}>
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={() =>
                  closeAction({
                    type: ActionTypes.resetAll
                  })
                }
              >
                Try Again
              </Button>
              <CenteredWrapperStyle>
                <Button
                  variant="text"
                  onClick={() =>
                    closeAction({
                      type: ActionTypes.resetAll
                    })
                  }
                >
                  Close
                </Button>
              </CenteredWrapperStyle>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </DialogContent>
  </Dialog>
);

export default ErrorDialog;
