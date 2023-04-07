import { capitalCase } from 'change-case';
import { Link as RouterLink } from 'react-router-dom';
// material
import { experimentalStyled as styled } from '@material-ui/core/styles';
import { Box, Stack, Link, Tooltip, Container, Typography, Grid } from '@material-ui/core';
// routes
import LoadingLogo from 'components/LoadingLogo';
import Label from 'components/Label';
import { PATH_AUTH } from '../../routes/paths';

// components
import Page from '../../components/Page';
import { MHidden } from '../../components/@material-extend';
import { LoginForm } from '../../components/authentication/login';
import BlinkIllustration from './BlinkIllustration';

// ----------------------------------------------------------------------

const ALLOWED_STAGE_STATUS = ['dev', 'test'];

const STAGE_NAME = process.env.REACT_APP_ENV
  ? ALLOWED_STAGE_STATUS.includes(process.env.REACT_APP_ENV)
  : false;

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  },
  height: '100vh'
}));

const ContentStyle = styled(Box)(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0)
}));

// ----------------------------------------------------------------------

export default function Login() {
  return (
    <RootStyle title="Login | ">
      <Grid container>
        <MHidden width="lgDown">
          <Grid item lg={6}>
            <BlinkIllustration />
          </Grid>
        </MHidden>
        <Grid item lg={6} xs={12}>
          <Container maxWidth="sm">
            <ContentStyle>
              <Stack direction="row" alignItems="center" sx={{ mb: 5 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" gutterBottom>
                    Sign in to Blink
                    <sup>
                      <Label color="info">
                        <Typography>Beta</Typography>
                      </Label>
                    </sup>
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    Enter your details below.
                  </Typography>
                  {STAGE_NAME && (
                    <Typography
                      sx={{ color: 'text.secondary' }}
                      fontStyle="italic"
                      variant="caption"
                    >
                      {process.env.REACT_APP_ENV} environment
                    </Typography>
                  )}
                </Box>

                <Tooltip title={capitalCase('Blink')}>
                  <LoadingLogo sx={{ width: 55, height: 55 }} />
                </Tooltip>
              </Stack>

              <LoginForm />

              <MHidden width="smUp">
                <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                  Don't have an account?&nbsp;
                  <Link variant="subtitle2" component={RouterLink} to={PATH_AUTH.register}>
                    Get started
                  </Link>
                </Typography>
              </MHidden>
            </ContentStyle>
          </Container>
        </Grid>
      </Grid>
    </RootStyle>
  );
}
