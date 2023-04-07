import { Box, Button, Card, Grid, List, ListItem } from '@material-ui/core';
// material
import { experimentalStyled as styled, makeStyles } from '@material-ui/core/styles';
import { useState } from 'react';

// ----------------------------------------------------------------------

const DAYSELECT = ['Today', 'Week', 'Month', 'Year'];
const DayListStyle = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '482px',
  List: {
    width: '100%'
  }
}));

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%'
  },
  primary: { backgroundColor: theme.palette.primary.dark },
  secondary: { backgroundColor: theme.palette.primary.light },
  listitems: {
    marginBottom: theme.spacing(5)
  }
}));

const ListStyle = styled(Box)({
  flexDirection: 'column'
});

// ----------------------------------------------------------------------

export default function AppDaySelection() {
  const classes = useStyles();
  const [day, changeday] = useState('Today');
  return (
    <Grid item xs={12}>
      <Card>
        <DayListStyle>
          <List className={classes.root}>
            <ListStyle>
              {DAYSELECT.map((val, index) => (
                <ListItem key={index} className={classes.listitems}>
                  <Button
                    variant="contained"
                    size="large"
                    className={day === val ? classes.primary : classes.secondary}
                    fullWidth
                    onClick={(e) => {
                      changeday(val);
                    }}
                  >
                    {val}
                  </Button>
                </ListItem>
              ))}
            </ListStyle>
          </List>
        </DayListStyle>
      </Card>
    </Grid>
  );
}
