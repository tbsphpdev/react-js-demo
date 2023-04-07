import { Button, makeStyles, Stack } from '@material-ui/core';
import { useNavigate, useParams } from 'react-router-dom';
import { PATH_DASHBOARD } from 'routes/paths';
import RepeatTransactionHistory from './RepeatTransactionHistory';
import TransactionHistory from './TransactionHistory';

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

const TransactionListIndex = () => {
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
          className={section === 'history' ? classes.activeButton : classes.Button}
          onClick={() => {
            navigate(`${PATH_DASHBOARD.transaction.history}`);
          }}
        >
          Transaction History
        </Button>
        <Button
          className={section === 'repeat' ? classes.activeButton : classes.Button}
          onClick={() => {
            navigate(`${PATH_DASHBOARD.transaction.repeat}`);
          }}
        >
          Repeat Transaction
        </Button>
      </Stack>
      <>{section === 'history' && <TransactionHistory />}</>
      <>{section === 'repeat' && <RepeatTransactionHistory />}</>
    </>
  );
};

export default TransactionListIndex;
