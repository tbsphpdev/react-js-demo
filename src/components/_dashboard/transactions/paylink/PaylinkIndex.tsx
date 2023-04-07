// material
import { Stack, Button, makeStyles } from '@material-ui/core';
import { useParams, useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from 'routes/paths';
import PaylinkForm from './CreatePaylinkForm';
import TrackHistory from './TrackHistory';

const useStyles = makeStyles({
  buttoncontainer: {
    paddingBottom: '30px'
  },
  activeButton: {
    color: '#0045FF',
    backgroundColor: 'rgba(145, 158, 171, 0.08)'
  },
  Button: {
    color: '#919EAB',
    backgroundColor: 'rgb(145, 158, 171, 0)'
  }
});

const PaylinkIndex = () => {
  const classes = useStyles();
  const { section } = useParams();
  const navigate = useNavigate();
  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 3, sm: 2 }}
        className={classes.buttoncontainer}
      >
        <Button
          className={section === 'create-paylink' ? classes.activeButton : classes.Button}
          onClick={() => {
            navigate(`${PATH_DASHBOARD.paylink.create}`);
          }}
        >
          Send Paylink
        </Button>
        <Button
          className={section === 'track-paylink' ? classes.activeButton : classes.Button}
          onClick={() => {
            navigate(`${PATH_DASHBOARD.paylink.track}`);
          }}
        >
          Track Paylink
        </Button>
      </Stack>
      <>{section === 'create-paylink' && <PaylinkForm />}</>
      <>{section === 'track-paylink' && <TrackHistory />}</>
    </>
  );
};

export default PaylinkIndex;
