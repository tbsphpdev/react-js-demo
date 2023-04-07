import { BlinkPageFormState, CurrencyType } from '@customTypes/blinkPages';
import { Autocomplete, Box, TextField } from '@material-ui/core';
import { FieldInputProps, FormikErrors, FormikTouched } from 'formik';
import { useEffect, useState } from 'react';
import { handlePreviewCurrency } from 'redux/slices/customiser';
import { dispatch } from 'redux/store';
import SettingsLabel from './SettingsLabel';

type PropTypes = {
  getFieldProps: (nameOrOptions: any) => FieldInputProps<any>;
  touchedCurrency: FormikTouched<CurrencyType>[] | undefined;
  touchedDefaultCurrency: boolean | undefined;
  errorsCurrency: string | string[] | FormikErrors<CurrencyType>[] | undefined;
  errorsDefaultCurrency: string | undefined;
  currency: CurrencyType[];
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => Promise<void> | Promise<FormikErrors<BlinkPageFormState>>;
  currencyList: CurrencyType[];
  defaultCurrency: number | null;
};

const CurrencyDropdown = ({
  getFieldProps,
  touchedCurrency,
  touchedDefaultCurrency,
  errorsCurrency,
  errorsDefaultCurrency,
  currency,
  setFieldValue,
  currencyList,
  defaultCurrency
}: PropTypes) => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType[]>([]);

  const [defCurr, setDefCurr] = useState<CurrencyType | null>(null);

  const handleCurrencyChange = (val: CurrencyType[]) => {
    setFieldValue('blinkPageCurrency', val);
    if (val) {
      setSelectedCurrency(val);
    }
    setFieldValue('additionalCurrencies', val.length > 1);
  };

  useEffect(() => {
    const currVal = currency.find((c) => c.id === defaultCurrency);
    if (currVal) {
      setDefCurr(currVal);
    } else {
      setDefCurr(null);
    }
  }, [currency, defaultCurrency]);

  return (
    <>
      <Box>
        <SettingsLabel title="Choose Currencies" />
        <Autocomplete
          multiple
          id="currency"
          options={currencyList}
          getOptionLabel={(option) => `${option.symbol} ${option.code}`}
          onChange={(e, val) => {
            handleCurrencyChange(val);
          }}
          value={currency}
          filterSelectedOptions
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="currency..."
              error={Boolean(touchedCurrency && errorsCurrency)}
              helperText={touchedCurrency && errorsCurrency}
            />
          )}
        />
      </Box>
      {/* Default Currency */}
      <Box>
        <SettingsLabel title="Default Currency" />
        <Autocomplete
          id="default-currency"
          options={selectedCurrency.length > 0 ? selectedCurrency : currency}
          getOptionLabel={(option) => `${option.symbol} ${option.code}`}
          onChange={(e, val) => {
            setFieldValue('defaultCurrency', val?.id);
            dispatch(handlePreviewCurrency(val?.symbol));
          }}
          value={defCurr}
          filterSelectedOptions
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="choose a default currency ..."
              error={Boolean(touchedDefaultCurrency && errorsDefaultCurrency)}
              helperText={touchedDefaultCurrency && errorsDefaultCurrency}
            />
          )}
        />
      </Box>
    </>
  );
};

export default CurrencyDropdown;
