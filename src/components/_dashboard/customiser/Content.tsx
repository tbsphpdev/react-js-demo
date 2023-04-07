import { Card, Grid, Stack, Tabs, Tab, Box, Typography, Divider } from '@material-ui/core';
import { capitalCase } from 'change-case';
import { useEffect, useState } from 'react';
import { RootState, useDispatch, useSelector } from 'redux/store';
import { BlinkSelect } from 'assets';
import { resetSelection } from 'redux/slices/customiser';
import { CustomiserSettings } from './settings';
import { ModifyFields } from './modifyFields';
import Preview from './preview/Preview';

const CUSTOMISER_TABS = [
  {
    value: 'settings',
    component: <CustomiserSettings />
  },
  {
    value: 'modify fields',
    component: <ModifyFields />
  }
];

const Content = () => {
  const [currentTab, setCurrentTab] = useState('settings');

  const { id, backgroundColor } = useSelector((state: RootState) => state.customiser);

  const dispatch = useDispatch();

  useEffect(
    () => () => {
      dispatch(resetSelection());
    },
    [dispatch]
  );

  if (!id) {
    return (
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} justifyContent="center">
          <Stack spacing={3}>
            <Typography align="center" variant="h5" color="textSecondary" gutterBottom>
              Select a page from the dropdown to customise it.
            </Typography>
            <BlinkSelect sx={{ p: 5, height: 500 }} />
          </Stack>
        </Grid>
      </Grid>
    );
  }

  return (
    <Card
      sx={{
        p: 4
      }}
    >
      <Stack spacing={3}>
        <Tabs
          value={currentTab}
          scrollButtons="auto"
          variant="scrollable"
          allowScrollButtonsMobile
          onChange={(e, value) => setCurrentTab(value)}
        >
          {CUSTOMISER_TABS.map((tab) => (
            <Tab disableRipple key={tab.value} label={capitalCase(tab.value)} value={tab.value} />
          ))}
        </Tabs>
        {CUSTOMISER_TABS.map(
          (tab) => tab.value === currentTab && <Box key={tab.value}>{tab.component}</Box>
        )}

        <Divider />
        <Box>
          <Stack spacing={3}>
            <Typography variant="h5">Preview</Typography>
            <Box
              sx={{
                p: {
                  xs: 1,
                  lg: 4
                },
                backgroundColor
              }}
            >
              <Preview />
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
};

export default Content;
