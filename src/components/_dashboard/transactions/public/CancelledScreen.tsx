import { experimentalStyled as styled, Paper, Stack, Typography } from '@material-ui/core';
import LazySize from 'components/LazySize';

const WrapperStyle = styled(Paper)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  maxWidth: '100vw',
  padding: theme.spacing(3)
}));

const CancelledScreen = () => (
  <WrapperStyle>
    <Stack spacing={4}>
      <Typography variant="h4" align="center">
        The Paylink has been Cancelled by the Merchant!
      </Typography>
      <Paper
        elevation={6}
        sx={{
          p: 3,
          maxWidth: '750px'
        }}
      >
        <LazySize alt="Cancelled" src="/static/illustrations/PaylinkCancelled.svg" />
      </Paper>
    </Stack>
  </WrapperStyle>
);

export default CancelledScreen;
