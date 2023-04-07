// material
import { VirtualTerminalFormState } from '@customTypes/transaction';
import { Stack, TextField } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { FormikErrors } from 'formik';
import { useSnackbar } from 'notistack';
import { ErrorMsg } from 'utils/helpError';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

// ----------------------------------------------------------------------

type ZipCodeAddrPickerProps = {
  setAddress: (val: string) => void;
  setAddressFields: (country: string, state: string, city: string, postalCode: string) => void;
  error?: boolean;
  helperText?: string;
  isLoading?: boolean;
  getFieldProps: any;
  label?: string;
  handleBlur?: (
    field: string,
    touched?: boolean | undefined,
    shouldValidate?: boolean | undefined
  ) => Promise<void> | Promise<FormikErrors<VirtualTerminalFormState>>;
};
export default function ZipCodeAddrPicker({
  setAddress,
  setAddressFields,
  helperText,
  error,
  isLoading,
  getFieldProps,
  label,
  handleBlur
}: ZipCodeAddrPickerProps) {
  const [value, setValue] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const handleSelectAddress = async (val: any) => {
    const DetailedAddress: any = [val];

    setAddress(DetailedAddress[0].formatted_address);

    let city = '';
    let state = '';
    let country = '';
    let postalCode = '';
    let streetNumber = '';
    try {
      await DetailedAddress[0].address_components.forEach(
        (comp: { types: string[]; long_name: string; short_name: string }) => {
          if (comp.types[0] === 'administrative_area_level_1' || comp.types[0] === 'locality') {
            city = comp.long_name;
          }
          if (comp.types[0] === 'administrative_area_level_2') {
            state = comp.short_name;
          }
          if (comp.types[0] === 'country') {
            country = comp.short_name;
          }
          if (comp.types[0] === 'postal_code') {
            postalCode = comp.short_name;
          }
          if (comp.types[0] === 'street_number') {
            streetNumber = comp.short_name;
          }
        }
      );
      if (!postalCode || !streetNumber) {
        if (!postalCode) {
          enqueueSnackbar(
            ErrorMsg({
              response: { data: 'Missing postal code' }
            }),
            {
              variant: 'error'
            }
          );
        }
        if (!streetNumber) {
          enqueueSnackbar(
            ErrorMsg({
              response: { data: 'Missing street number' }
            }),
            {
              variant: 'error'
            }
          );
        }
        setValue('');
      } else {
        setValue(val.formatted_address);
        setAddressFields(country, state, city, postalCode);
      }
    } catch (error) {
      enqueueSnackbar(ErrorMsg(error), { variant: 'error' });
    }
  };

  const handleChange = (address: any) => {
    setValue(address);
    if (address.trim().length < 1) {
      setAddressFields('', '', '', '');
      setAddress('');
    }
  };

  const handleSelect = (address: any) => {
    geocodeByAddress(address)
      .then((results) => {
        getLatLng(results[0]);
        handleSelectAddress(results[0]);
      })
      .catch((error) => console.error('Error', error));
  };

  useEffect(() => {
    setValue(getFieldProps.value);
  }, [getFieldProps.value]);

  const searchOptions = {
    componentRestrictions: {
      country: 'gb'
    }
  };

  return (
    <Stack sx={{ width: '100%' }}>
      <PlacesAutocomplete
        value={value}
        searchOptions={searchOptions}
        onChange={handleChange}
        onSelect={handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div className="w-100">
            <TextField
              {...getInputProps()}
              error={error}
              helperText={helperText || !value ? helperText : ''}
              label={label || 'Enter Address'}
              sx={{ width: '100%' }}
              onBlur={() => {
                if (handleBlur) {
                  handleBlur('billingAddress.address1', true);
                  handleBlur('billingAddress.city', true, true);
                  handleBlur('billingAddress.postalCode', true);
                  handleBlur('billingAddress.country', true);
                }
              }}
            />
            {suggestions.length > 0 && (
              <div className="autocomplete-dropdown-container" style={{ marginTop: 15 }}>
                {loading && <div>Loading...</div>}
                {suggestions.map((suggestion, i) => {
                  const className = suggestion.active
                    ? 'suggestion-item--active'
                    : 'suggestion-item';
                  // inline style for demonstration purpose
                  const style = suggestion.active
                    ? { backgroundColor: '#f3e7fded', cursor: 'pointer', fontSize: '14px' }
                    : { backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '14px' };
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <div
                      {...getSuggestionItemProps(suggestion, {
                        className,
                        style
                      })}
                    >
                      <span style={{ paddingTop: 10, paddingBottom: 10 }}>
                        {suggestion.description}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </PlacesAutocomplete>
    </Stack>
  );
}
