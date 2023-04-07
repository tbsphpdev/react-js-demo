import { Stack, makeStyles, Button } from '@material-ui/core';

import { useNavigate, useParams } from 'react-router-dom';

import { PATH_DASHBOARD } from 'routes/paths';
import VTForm from './VTForm';

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

const VTIndex = () => {
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
          className={section === 'create' ? classes.activeButton : classes.Button}
          onClick={() => {
            navigate(`${PATH_DASHBOARD.virtualTerminal.create}`);
          }}
        >
          Virtual Terminal
        </Button>
      </Stack>
      <>{section === 'create' && <VTForm />}</>
    </>
  );
};

export default VTIndex;
