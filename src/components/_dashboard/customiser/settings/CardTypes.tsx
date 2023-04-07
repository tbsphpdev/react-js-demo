import { BlinkPageFormState, CardType } from '@customTypes/blinkPages';
import {
  Checkbox,
  experimentalStyled as styled,
  FormControlLabel,
  FormHelperText,
  Grid,
  Paper,
  Stack
} from '@material-ui/core';
import GetCardIcon from 'components/_dashboard/transactions/GetCardIcons';
import { FieldInputProps, FormikErrors, FormikTouched } from 'formik';
import SettingsLabel from './SettingsLabel';

type PropTypes = {
  getFieldProps: (nameOrOptions: any) => FieldInputProps<any>;
  touched: FormikTouched<Number>[] | undefined;
  errors: string | string[] | FormikErrors<Number>[] | undefined;
  selectedCardTypes: Number[];
  cardTypes: CardType[];
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => Promise<void> | Promise<FormikErrors<BlinkPageFormState>>;
};

const WrapperStyle = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 2),
  backgroundColor: theme.palette.grey[50012]
}));

const cardNames: { [k: string]: string } = {
  americanexpress: 'amex',
  mastercard: 'mastercard',
  diners: 'dinersclub',
  visa: 'visa',
  discover: 'discover'
};

const CardTypes = ({
  getFieldProps,
  touched,
  errors,
  selectedCardTypes,
  cardTypes,
  setFieldValue
}: PropTypes) => {
  const handleCheck = (event: { target: { value: any } }) => {
    const { value } = event.target;
    const val = parseInt(value, 10);

    const newVal = [...selectedCardTypes];

    if (!newVal.includes(val)) {
      newVal.push(val);
    } else {
      newVal.splice(newVal.indexOf(val), 1);
    }

    setFieldValue('blinkPageCard', newVal);
  };
  const secondColumnStart = Math.ceil(cardTypes.length / 2);

  const cardFirstColumn = cardTypes.slice(0, secondColumnStart).map((card) => {
    const abbr = card.name.toLowerCase().replace(/ /g, '');

    const Label = (
      <Stack spacing={2} direction="row" alignItems="center">
        <Stack>{card.name === 'Master Card' ? 'Mastercard' : card.name}</Stack>
        <GetCardIcon name={cardNames[abbr]} />
      </Stack>
    );
    return (
      <FormControlLabel
        control={
          <Checkbox
            color="secondary"
            {...getFieldProps('cardTypes')}
            value={card.id}
            checked={selectedCardTypes.includes(card.id)}
            onChange={handleCheck}
          />
        }
        label={Label}
        key={card.id}
      />
    );
  });

  const cardSecondColumn = cardTypes.slice(secondColumnStart).map((card) => {
    const abbr = card.name.toLowerCase().replace(/ /g, '');
    const Label = (
      <Stack spacing={2} direction="row" alignItems="center">
        <Stack>{card.name === 'Master Card' ? 'Mastercard' : card.name}</Stack>
        <GetCardIcon name={cardNames[abbr]} />
      </Stack>
    );
    return (
      <FormControlLabel
        control={
          <Checkbox
            {...getFieldProps('cardTypes')}
            color="secondary"
            value={card.id}
            onChange={handleCheck}
            checked={selectedCardTypes.includes(card.id)}
          />
        }
        label={Label}
        key={card.id}
      />
    );
  });

  return (
    <>
      <SettingsLabel title="Card Types" />
      {Boolean(touched && errors) && <FormHelperText error>Card Types is Required</FormHelperText>}
      <WrapperStyle>
        <Grid container spacing={1}>
          <Grid item xs={12} md={6}>
            <Stack>{cardFirstColumn}</Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack>{cardSecondColumn}</Stack>
          </Grid>
        </Grid>
      </WrapperStyle>
    </>
  );
};

export default CardTypes;
