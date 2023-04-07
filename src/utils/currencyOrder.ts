type CurrencyType = { id: number; code: string; symbol: string };

type PriorityCurrency = {
  GBP: CurrencyType[];
  EUR: CurrencyType[];
  USD: CurrencyType[];
  rest: CurrencyType[];
};
export const currencyOrder = (currencyArr: CurrencyType[]) => {
  const priorityCurr: PriorityCurrency = {
    GBP: [],
    EUR: [],
    USD: [],
    rest: []
  };

  priorityCurr.USD = currencyArr.filter((c) => c.code === 'USD');
  priorityCurr.GBP = currencyArr.filter((c) => c.code === 'GBP');
  priorityCurr.EUR = currencyArr.filter((c) => c.code === 'EUR');

  priorityCurr.rest = currencyArr.filter(
    (c) => c.code !== 'GBP' && c.code !== 'EUR' && c.code !== 'USD'
  );
  return [...priorityCurr.GBP, ...priorityCurr.EUR, ...priorityCurr.USD, ...priorityCurr.rest];
};
