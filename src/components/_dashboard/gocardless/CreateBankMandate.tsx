import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Tab,
  TextField
} from '@material-ui/core';
import { LoadingButton, TabContext, TabList, TabPanel } from '@material-ui/lab';
import React, { useState } from 'react';

type PropTypes = {
  isOpen: boolean;
  setOpen: VoidFunction;
  title?: string;
  banks?: any[];
};

const CreateBankMandate = ({ isOpen, setOpen, title, banks }: PropTypes) => {
  const [value, setValue] = React.useState('1');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const CreateDialog = () => (
    <Stack>
      <Dialog open={isOpen} fullWidth maxWidth="sm">
        <DialogContent>{Tabs}</DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={setOpen}>
            Close
          </Button>

          <LoadingButton variant="outlined">Submit</LoadingButton>
        </DialogActions>
      </Dialog>
    </Stack>
  );

  const MandateForm = () => {
    const [selectedBank, setSelectedBank] = useState<any>(null);
    return (
      <Stack spacing={2} paddingTop={2}>
        <Autocomplete
          fullWidth
          options={banks || []}
          getOptionLabel={(option) =>
            `${option.bank_name.toUpperCase()} | ${option.id.toUpperCase()}`
          }
          onChange={(e, val) => {
            setSelectedBank(val);
          }}
          value={selectedBank}
          disableClearable
          renderInput={(params) => (
            <TextField
              {...params}
              helperText="*Not working right now"
              label="Select Bank"
              variant="outlined"
              onKeyDown={(e) => e.preventDefault()}
              InputProps={{
                ...params.InputProps,
                endAdornment: <>{params.InputProps.endAdornment}</>
              }}
            />
          )}
        />
      </Stack>
    );
  };

  const Tabs = (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Create Bank" value="1" />
            <Tab label="Create Mandate" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">Bank Form</TabPanel>
        <TabPanel value="2">{MandateForm()}</TabPanel>
      </TabContext>
    </Box>
  );

  return <>{CreateDialog()}</>;
};

export default CreateBankMandate;
