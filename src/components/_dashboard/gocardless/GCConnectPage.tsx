import {
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  useTheme
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { connectGoCardless } from '_apis_/gocardless';
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined';
import BeanbagLady from 'assets/illustration_beanbag_lady';

const useStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.text.primary,
    '& button': {
      padding: '10px'
    },
    fontWeight: 700
  },
  heading: {
    fontSize: '1.7em',
    fontWeight: 700
  },
  list: {
    '& svg': {
      fontSize: '1.1em'
    },
    '& span': {
      fontWeight: 700,
      fontSize: '.8em'
    }
  },
  radioGroup: {
    border: `1px solid ${theme.palette.primary.light} !important`,
    borderRadius: '50px',
    '& span': { fontSize: '.8em !important', fontWeight: '600 !important' },
    '& label': { '& svg': { padding: '3px 0px' } }
  },
  formCard: {
    boxShadow: `0 0 60px ${theme.palette.primary.main}4d`
  }
}));

const GCConnectPage = () => {
  const theme = useTheme();
  const classes = useStyles(theme);

  return (
    <Stack px={4}>
      <Grid container spacing={6} className={classes.root}>
        <Grid item xs={12} md={6}>
          <Stack spacing={3} padding={{ xs: '20px 0', sm: '20px 50px' }}>
            <Typography variant="h3" className={classes.heading}>
              Direct Debits
            </Typography>
            <Typography variant="subtitle1" fontSize=".9em" fontWeight={700}>
              The simplest way to collect regular payments from your customers, set up recurring
              payments and rest-assured that funds will be transferred directly into your bank
              account on time, every time.
            </Typography>

            <List className={classes.list}>
              <ListItem alignItems="flex-start">
                <ListItemIcon sx={{ mt: 0 }}>
                  <CheckCircleOutlinedIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="We have a unique partnership with GoCardless, you can either connect to your
                  existing GoCardless account or connect a new account to the blink3sixty portal"
                />
              </ListItem>
              <ListItem alignItems="flex-start">
                <ListItemIcon sx={{ mt: 0 }}>
                  <CheckCircleOutlinedIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Once connected you can set up new Direct Debits and view existing mandates" />
              </ListItem>
            </List>
          </Stack>
          <Stack>
            <BeanbagLady />
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack
            padding={{ xs: '20px 0', sm: '20px 50px' }}
            height="100%"
            className={classes.formCard}
          >
            <Stack spacing={1} px={3}>
              <Typography variant="h3" align="center" className={classes.heading}>
                Go Cardless
              </Typography>
              <Stack py={2}>
                <RadioGroup defaultValue="Live Account" className={classes.radioGroup}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <FormControlLabel
                      value="Live Account"
                      label="Live Account"
                      control={<Radio />}
                    />
                    <FormControlLabel
                      value="Test Account"
                      label="Test Account"
                      control={<Radio />}
                    />
                  </Stack>
                </RadioGroup>
              </Stack>

              <Stack spacing={5}>
                <Stack direction="column" alignItems="center" spacing={2}>
                  <Stack>
                    <Typography fontSize=".8em" fontWeight={700}>
                      Already have an existing account?
                    </Typography>
                  </Stack>
                  <Stack width={{ xs: '100%', sm: '50%' }}>
                    <LoadingButton onClick={() => connectGoCardless('login')} variant="contained">
                      Connect Go Cardless
                    </LoadingButton>
                  </Stack>
                </Stack>

                <Stack mt="80px !important">
                  <Typography
                    align="center"
                    lineHeight="1.3"
                    fontWeight="700"
                    variant="h6"
                    fontSize=".85em !important"
                  >
                    Please elect either
                  </Typography>
                  <Typography
                    align="center"
                    lineHeight="1.3"
                    fontWeight="700"
                    variant="h6"
                    fontSize=".85em !important"
                  >
                    a Test or Live account to setup
                  </Typography>
                  <Typography
                    mt={2}
                    align="center"
                    variant="body1"
                    fontSize=".8em"
                    fontWeight={700}
                  >
                    To switch between a Test and Live account, Please Contact Us.
                  </Typography>
                </Stack>

                <Stack direction="column" alignItems="center">
                  <Typography align="center" fontSize=".8em" fontWeight={700}>
                    Don't have an account yet??
                  </Typography>
                  <Stack width={{ xs: '100%', sm: '30%' }} mt={1}>
                    <LoadingButton onClick={() => connectGoCardless('signup')} variant="contained">
                      Sign up
                    </LoadingButton>
                  </Stack>
                </Stack>

                <Stack mt="40px !important">
                  <Typography mt={2} align="center" variant="body1" fontSize=".8em">
                    To switch between a Test and Live account, Please Contact Us.
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default GCConnectPage;
