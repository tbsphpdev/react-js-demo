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
  padding: theme.spacing(3, 3)
}));

const BlinkNotFoundScreen = ({
  msg = 'Please check the URL is correct or contact the merchant for further information'
}: PropTypes) => (
  <WrapperStyle>
    <Stack spacing={4} justifyContent="center" alignItems="center">
      <Typography variant="h5" align="center" paddingX={3} fontWeight="500">
        {msg}
      </Typography>
      <Paper
        elevation={6}
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          maxWidth: 'fit-content'
        }}
      >
        <LazySize
          alt="notFound"
          src="/static/illustrations/notfoundblink.svg"
          sx={{ maxHeight: '75vh', maxWidth: '90vw' }}
        />
      </Paper>
    </Stack>
  </WrapperStyle>
);

export default BlinkNotFoundScreen;
