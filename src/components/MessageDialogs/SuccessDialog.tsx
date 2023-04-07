import { ActionTypes, DialogMsgActions, SuccessDialogType } from '@customTypes/transaction';
import { Box, Button, Dialog, DialogContent, Stack, Typography } from '@material-ui/core';
import { experimentalStyled as styled } from '@material-ui/core/styles';
import { Dispatch } from 'react';
import { CURRENCY } from 'utils/constant';
import { fDateMonthMin, ftimeSuffix } from 'utils/formatTime';

type PropTypes = {
  open: boolean;
  details: SuccessDialogType;
  closeAction?: Dispatch<DialogMsgActions>;
  children?: any;
};

const CenteredWrapperStyle = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});

const PrimaryTextStyle = styled(Typography)(({ theme }) => ({
  color: '#4A5A69',
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

const SuccessDialog = ({ open, details, closeAction, children }: PropTypes) => {
  const {
    amount,
    cardNumber,
    customerEmail,
    action,
    giftAid,
    currency,
    isRepeatPayment,
    delayCapture,
    variableCycle,
    cycleType
  } = details;
  return (
    <Dialog open={open}>
      <DialogContent>
        <Box sx={{ p: 5 }}>
          <Stack spacing={3}>
            <CenteredWrapperStyle>
              <img src="/static/dialog/success-main.svg" alt="success" width="100" />
            </CenteredWrapperStyle>
            <Box>
              <PrimaryTextStyle align="center">Success!</PrimaryTextStyle>
              {isRepeatPayment && (
                <SecondaryTextStyle align="center">
                  <Typography
                    variant="subtitle1"
                    sx={{ textTransform: 'capitalize', padding: '5px 0' }}
                  >
                    Repeat Payment - {cycleType}
                  </Typography>
                </SecondaryTextStyle>
              )}
              <SecondaryTextStyle align="center">
                Reference card Ending: {cardNumber}
              </SecondaryTextStyle>
            </Box>
            <Box>
              <CenteredWrapperStyle display="flex" alignItems="center" justifyContent="center">
                <PrimaryTextStyle align="center">
                  {CURRENCY[currency || 'default'].symbol} {parseFloat(`${amount}`).toFixed(2)}
                </PrimaryTextStyle>
                <img src="/static/dialog/success-sub.svg" alt="success-icon" />
              </CenteredWrapperStyle>
              {isRepeatPayment ? (
                <SecondaryTextStyle align="center">Repeat Payment Created</SecondaryTextStyle>
              ) : (
                <SecondaryTextStyle align="center">
                  {action && `${action} Transaction`}
                </SecondaryTextStyle>
              )}
              {action === 'DELAY_CAPTURE' && delayCapture && (
                <SecondaryTextStyle align="center">
                  {`Capture On ${fDateMonthMin(delayCapture)} ${ftimeSuffix(delayCapture)}`}
                </SecondaryTextStyle>
              )}
              {giftAid && giftAid !== '0' && (
                <SecondaryTextStyle align="center">
                  GiftAid: {currency} {giftAid}
                </SecondaryTextStyle>
              )}
            </Box>
            {isRepeatPayment && cycleType !== 'fixed' && variableCycle && (
              <Box>
                <Stack>
                  <Stack direction="row" spacing={1} justifyContent="space-between">
                    <Typography>Date</Typography>
                    <Typography>Amount</Typography>
                  </Stack>
                  {variableCycle.length < 4
                    ? variableCycle.map((value: any, index: number) => (
                        <Stack
                          direction="row"
                          spacing={1}
                          key={index}
                          justifyContent="space-between"
                        >
                          <Typography>{`${
                            value.date !== '' ? fDateMonthMin(value.date) : 'Select Date'
                          }`}</Typography>
                          <Typography>{`${CURRENCY[currency || 'default'].symbol} ${
                            value.amount !== '' ? value.amount : '0.00'
                          }`}</Typography>
                        </Stack>
                      ))
                    : variableCycle.slice(0, 3).map((value: any, index: number) => (
                        <Stack
                          direction="row"
                          spacing={1}
                          key={index}
                          justifyContent="space-between"
                        >
                          <Typography>{`${
                            value.date !== '' ? fDateMonthMin(value.date) : 'DATE'
                          }`}</Typography>
                          <Typography>{`${
                            value.amount !== '' ? value.amount : '0.00'
                          }`}</Typography>
                        </Stack>
                      ))}
                  {variableCycle.length > 3 && (
                    <Typography>{`+ ${variableCycle.length - 3} Transaction`}</Typography>
                  )}
                </Stack>
              </Box>
            )}

            <Box>
              <SecondaryTextStyle align="center">
                Email receipt has been sent to:
              </SecondaryTextStyle>
              <SecondaryTextStyle align="center">{customerEmail}</SecondaryTextStyle>
            </Box>
            <Stack spacing={3}>
              {closeAction && (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() =>
                    closeAction({
                      type: ActionTypes.resetAll
                    })
                  }
                >
                  Make Another Payment
                </Button>
              )}
            </Stack>
            <Stack spacing={3}>{children && <>{children}</>}</Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;
