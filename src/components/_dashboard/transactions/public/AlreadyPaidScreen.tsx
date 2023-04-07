import { experimentalStyled as styled, Paper, Stack, Typography } from '@material-ui/core';
import LazySize from 'components/LazySize';

type PropTypes = {
  msg?: string;
};

const WrapperStyle = styled(Paper)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  maxWidth: '100vw',
  padding: theme.spacing(3)
}));

const AlreadyPaidScreen = ({ msg = 'The Paylink has already been Paid!' }: PropTypes) => (
  <WrapperStyle>
    <Stack spacing={4}>
      <Typography variant="h4" align="center">
        {msg}
      </Typography>
      <Paper
        elevation={6}
        sx={{
          p: 3
        }}
      >
        <LazySize alt="Already Paid" src="/static/illustrations/PaylinkPaid.svg" />
      </Paper>
    </Stack>
  </WrapperStyle>
);

export default AlreadyPaidScreen;
