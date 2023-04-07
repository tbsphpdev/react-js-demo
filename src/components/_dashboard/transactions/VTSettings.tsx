import {
  Card,
  Container,
  FormControlLabel,
  makeStyles,
  Stack,
  Switch,
  Typography
} from '@material-ui/core';

const useStyles = makeStyles({
  heading: {
    marginBottom: '18px',
    fontWeight: 'bold',
    fontSize: '18px'
  },

  card: {
    padding: '34px'
  },

  container: {
    padding: 0
  }
});

const FIELDS = ['Address Postcode', 'Full Name', 'Email Address', 'Reference'];

const VTSettings = () => {
  const classes = useStyles();
  return (
    <Container className={classes.container}>
      <Card className={classes.card}>
        <Typography className={classes.heading}>Virtual Terminal Mandatory Fields</Typography>

        {FIELDS.map((val, index) => (
          <Stack key={index}>
            <FormControlLabel
              control={<Switch checked={false} name="fields" color="primary" />}
              label={val}
            />
          </Stack>
        ))}
      </Card>
    </Container>
  );
};

export default VTSettings;
