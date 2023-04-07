import Payment from 'payment';

const clearNumber = (value = '') => value.replace(/\D+/g, '');

export const getCardIssuer = (value: string) => Payment.fns.cardType(value);

export const formatCreditCardNumber = (value: string) => {
  if (!value) {
    return value;
  }

  const issuer = getCardIssuer(value);
  const clearValue = clearNumber(value);
  let nextValue;

  switch (issuer) {
    case 'amex':
      nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(4, 10)} ${clearValue.slice(
        10,
        15
      )}`;
      break;
    case 'dinersclub':
      nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(4, 10)} ${clearValue.slice(
        10,
        14
      )}`;
      break;
    default:
      nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(4, 8)} ${clearValue.slice(
        8,
        12
      )} ${clearValue.slice(12, 19)}`;
      break;
  }

  return nextValue.trim();
};

export const formatCVC = (value: string, cardNumber: string | null = null) => {
  const clearValue = clearNumber(value);
  let maxLength = 3;

  if (cardNumber) {
    const issuer = Payment.fns.cardType(cardNumber);
    maxLength = issuer === 'amex' ? 4 : 3;
  }

  return clearValue.slice(0, maxLength);
};

export const formatExpirationDate = (value: string) => {
  const clearValue = clearNumber(value);

  if (clearValue.length >= 3) {
    return `${clearValue.slice(0, 2)}/${clearValue.slice(2, 4)}`;
  }

  return clearValue;
};

export const validateCardNumber = (value: string) => {
  const isValid = Payment.fns.validateCardNumber(value);
  return isValid;
};
