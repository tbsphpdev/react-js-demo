import { DropdownType } from '@customTypes/report';
import { TextField, InputAdornment, FormControl, MenuItem, Select } from '@material-ui/core';
import { experimentalStyled as styled } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import { useState } from 'react';
import { setDropdownFields } from 'redux/slices/reports';
import { dispatch, RootState, useSelector } from 'redux/store';

const SELECT_LIST: {
  name: string;
  value: keyof DropdownType;
}[] = [
  {
    name: 'Customer Name',
    value: 'customerName'
  },
  {
    name: 'Customer Email',
    value: 'customerEmail'
  },
  {
    name: 'Customer Address',
    value: 'customerAddress'
  },
  {
    name: 'Amount',
    value: 'amount'
  },
  {
    name: 'Reference',
    value: 'references'
  },
  {
    name: 'Auth Code',
    value: 'authCode'
  },
  {
    name: 'Blink Unique Reference',
    value: 'blinkUniqueReference'
  }
];

const SelectStyle = styled(Select)(({ theme }) => ({
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0
}));

const DropdownSelection = () => {
  const [selectedVal, setSelectedVal] = useState<keyof DropdownType | ''>('');
  const {
    customerEmail,
    customerName,
    amount,
    customerAddress,
    references,
    blinkUniqueReference,
    authCode
  } = useSelector((state: RootState) => state.reports);

  const vals: any = {
    customerEmail,
    customerName,
    amount,
    customerAddress,
    references,
    blinkUniqueReference,
    authCode
  };

  const handleTypeChange = (event: any) => {
    setSelectedVal(event.target.value);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { value } = event.target;
    if (selectedVal === '') return;
    dispatch(
      setDropdownFields({
        data: value,
        key: selectedVal
      })
    );
  };

  return (
    <TextField
      fullWidth
      value={selectedVal === '' ? '' : vals[selectedVal]}
      disabled={selectedVal === ''}
      id="input-with-icon-textfield"
      placeholder={selectedVal === '' ? 'Choose filter...' : 'Enter Keyword...'}
      onChange={handleInputChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <FormControl variant="outlined">
              <SelectStyle
                id="report-dropdown"
                displayEmpty
                value={selectedVal}
                onChange={handleTypeChange}
                MenuProps={{
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left'
                  }
                }}
              >
                <MenuItem value="">
                  <em>Choose a Filter</em>
                </MenuItem>
                {SELECT_LIST.map((option, index) => (
                  <MenuItem value={option.value} key={index}>
                    {option.name}
                  </MenuItem>
                ))}
              </SelectStyle>
            </FormControl>
            <SearchIcon
              sx={{
                pl: 1
              }}
            />
          </InputAdornment>
        ),
        style: {
          paddingLeft: '0'
        }
      }}
    />
  );
};

export default DropdownSelection;
