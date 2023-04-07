export const API_BASE_URLS = {
  activateUser: process.env.REACT_APP_ACTIVATE_USER,
  admin: process.env.REACT_APP_ADMIN,
  goCardless: process.env.REACT_APP_GOCARDLESS,
  token: `https://gateway.blinkpayment.co.uk/${process.env.REACT_APP_TOKEN}`,
  salesforce: process.env.REACT_APP_SALESFORCE,
  adminGateway: `${process.env.REACT_APP_API_URL_ADMIN}/${process.env.REACT_APP_ADMIN_GATEWAY}`,
  blinkpage: process.env.REACT_APP_BLINKPAGE,
  notification: process.env.REACT_APP_NOTIFICATION,
  paylink: process.env.REACT_APP_PAYLINK,
  payment: process.env.REACT_APP_PAYMENT,
  reconciliation: process.env.REACT_APP_BANK_RECONCILIATION,
  report: process.env.REACT_APP_REPORT,
  static: `${process.env.REACT_APP_API_URL_ADMIN}/${process.env.REACT_APP_STATIC}`,
  transaction: process.env.REACT_APP_TRANSACTION,
  user: process.env.REACT_APP_USER
};

export interface CurrencyType {
  symbol: string;
  name: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  code: string;
  name_plural: string;
}

export interface CountryType {
  code: string;
  label: string;
  phone: string;
  suggested?: boolean;
}

export const CURRENCY: { [key: string]: CurrencyType } = {
  default: {
    symbol: '£',
    name: 'British Pound Sterling',
    symbol_native: '£',
    decimal_digits: 2,
    rounding: 0,
    code: 'GBP',
    name_plural: 'British pounds sterling'
  },
  USD: {
    symbol: '$',
    name: 'US Dollar',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'USD',
    name_plural: 'US dollars'
  },
  CAD: {
    symbol: 'CA$',
    name: 'Canadian Dollar',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'CAD',
    name_plural: 'Canadian dollars'
  },
  EUR: {
    symbol: '€',
    name: 'Euro',
    symbol_native: '€',
    decimal_digits: 2,
    rounding: 0,
    code: 'EUR',
    name_plural: 'euros'
  },
  AED: {
    symbol: 'AED',
    name: 'United Arab Emirates Dirham',
    symbol_native: 'د.إ.',
    decimal_digits: 2,
    rounding: 0,
    code: 'AED',
    name_plural: 'UAE dirhams'
  },
  AFN: {
    symbol: 'Af',
    name: 'Afghan Afghani',
    symbol_native: '؋',
    decimal_digits: 0,
    rounding: 0,
    code: 'AFN',
    name_plural: 'Afghan Afghanis'
  },
  ALL: {
    symbol: 'ALL',
    name: 'Albanian Lek',
    symbol_native: 'Lek',
    decimal_digits: 0,
    rounding: 0,
    code: 'ALL',
    name_plural: 'Albanian lekë'
  },
  AMD: {
    symbol: 'AMD',
    name: 'Armenian Dram',
    symbol_native: 'դր.',
    decimal_digits: 0,
    rounding: 0,
    code: 'AMD',
    name_plural: 'Armenian drams'
  },
  ARS: {
    symbol: 'AR$',
    name: 'Argentine Peso',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'ARS',
    name_plural: 'Argentine pesos'
  },
  AUD: {
    symbol: 'AU$',
    name: 'Australian Dollar',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'AUD',
    name_plural: 'Australian dollars'
  },
  AZN: {
    symbol: 'man.',
    name: 'Azerbaijani Manat',
    symbol_native: 'ман.',
    decimal_digits: 2,
    rounding: 0,
    code: 'AZN',
    name_plural: 'Azerbaijani manats'
  },
  BAM: {
    symbol: 'KM',
    name: 'Bosnia-Herzegovina Convertible Mark',
    symbol_native: 'KM',
    decimal_digits: 2,
    rounding: 0,
    code: 'BAM',
    name_plural: 'Bosnia-Herzegovina convertible marks'
  },
  BDT: {
    symbol: 'Tk',
    name: 'Bangladeshi Taka',
    symbol_native: '৳',
    decimal_digits: 2,
    rounding: 0,
    code: 'BDT',
    name_plural: 'Bangladeshi takas'
  },
  BGN: {
    symbol: 'BGN',
    name: 'Bulgarian Lev',
    symbol_native: 'лв.',
    decimal_digits: 2,
    rounding: 0,
    code: 'BGN',
    name_plural: 'Bulgarian leva'
  },
  BHD: {
    symbol: 'BD',
    name: 'Bahraini Dinar',
    symbol_native: 'د.ب.',
    decimal_digits: 3,
    rounding: 0,
    code: 'BHD',
    name_plural: 'Bahraini dinars'
  },
  BIF: {
    symbol: 'FBu',
    name: 'Burundian Franc',
    symbol_native: 'FBu',
    decimal_digits: 0,
    rounding: 0,
    code: 'BIF',
    name_plural: 'Burundian francs'
  },
  BND: {
    symbol: 'BN$',
    name: 'Brunei Dollar',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'BND',
    name_plural: 'Brunei dollars'
  },
  BOB: {
    symbol: 'Bs',
    name: 'Bolivian Boliviano',
    symbol_native: 'Bs',
    decimal_digits: 2,
    rounding: 0,
    code: 'BOB',
    name_plural: 'Bolivian bolivianos'
  },
  BRL: {
    symbol: 'R$',
    name: 'Brazilian Real',
    symbol_native: 'R$',
    decimal_digits: 2,
    rounding: 0,
    code: 'BRL',
    name_plural: 'Brazilian reals'
  },
  BWP: {
    symbol: 'BWP',
    name: 'Botswanan Pula',
    symbol_native: 'P',
    decimal_digits: 2,
    rounding: 0,
    code: 'BWP',
    name_plural: 'Botswanan pulas'
  },
  BYN: {
    symbol: 'Br',
    name: 'Belarusian Ruble',
    symbol_native: 'руб.',
    decimal_digits: 2,
    rounding: 0,
    code: 'BYN',
    name_plural: 'Belarusian rubles'
  },
  BZD: {
    symbol: 'BZ$',
    name: 'Belize Dollar',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'BZD',
    name_plural: 'Belize dollars'
  },
  CDF: {
    symbol: 'CDF',
    name: 'Congolese Franc',
    symbol_native: 'FrCD',
    decimal_digits: 2,
    rounding: 0,
    code: 'CDF',
    name_plural: 'Congolese francs'
  },
  CHF: {
    symbol: 'CHF',
    name: 'Swiss Franc',
    symbol_native: 'CHF',
    decimal_digits: 2,
    rounding: 0.05,
    code: 'CHF',
    name_plural: 'Swiss francs'
  },
  CLP: {
    symbol: 'CL$',
    name: 'Chilean Peso',
    symbol_native: '$',
    decimal_digits: 0,
    rounding: 0,
    code: 'CLP',
    name_plural: 'Chilean pesos'
  },
  CNY: {
    symbol: 'CN¥',
    name: 'Chinese Yuan',
    symbol_native: 'CN¥',
    decimal_digits: 2,
    rounding: 0,
    code: 'CNY',
    name_plural: 'Chinese yuan'
  },
  COP: {
    symbol: 'CO$',
    name: 'Colombian Peso',
    symbol_native: '$',
    decimal_digits: 0,
    rounding: 0,
    code: 'COP',
    name_plural: 'Colombian pesos'
  },
  CRC: {
    symbol: '₡',
    name: 'Costa Rican Colón',
    symbol_native: '₡',
    decimal_digits: 0,
    rounding: 0,
    code: 'CRC',
    name_plural: 'Costa Rican colóns'
  },
  CVE: {
    symbol: 'CV$',
    name: 'Cape Verdean Escudo',
    symbol_native: 'CV$',
    decimal_digits: 2,
    rounding: 0,
    code: 'CVE',
    name_plural: 'Cape Verdean escudos'
  },
  CZK: {
    symbol: 'Kč',
    name: 'Czech Republic Koruna',
    symbol_native: 'Kč',
    decimal_digits: 2,
    rounding: 0,
    code: 'CZK',
    name_plural: 'Czech Republic korunas'
  },
  DJF: {
    symbol: 'Fdj',
    name: 'Djiboutian Franc',
    symbol_native: 'Fdj',
    decimal_digits: 0,
    rounding: 0,
    code: 'DJF',
    name_plural: 'Djiboutian francs'
  },
  DKK: {
    symbol: 'Dkr',
    name: 'Danish Krone',
    symbol_native: 'kr',
    decimal_digits: 2,
    rounding: 0,
    code: 'DKK',
    name_plural: 'Danish kroner'
  },
  DOP: {
    symbol: 'RD$',
    name: 'Dominican Peso',
    symbol_native: 'RD$',
    decimal_digits: 2,
    rounding: 0,
    code: 'DOP',
    name_plural: 'Dominican pesos'
  },
  DZD: {
    symbol: 'DA',
    name: 'Algerian Dinar',
    symbol_native: 'د.ج.',
    decimal_digits: 2,
    rounding: 0,
    code: 'DZD',
    name_plural: 'Algerian dinars'
  },
  EEK: {
    symbol: 'Ekr',
    name: 'Estonian Kroon',
    symbol_native: 'kr',
    decimal_digits: 2,
    rounding: 0,
    code: 'EEK',
    name_plural: 'Estonian kroons'
  },
  EGP: {
    symbol: 'EGP',
    name: 'Egyptian Pound',
    symbol_native: 'ج.م.',
    decimal_digits: 2,
    rounding: 0,
    code: 'EGP',
    name_plural: 'Egyptian pounds'
  },
  ERN: {
    symbol: 'Nfk',
    name: 'Eritrean Nakfa',
    symbol_native: 'Nfk',
    decimal_digits: 2,
    rounding: 0,
    code: 'ERN',
    name_plural: 'Eritrean nakfas'
  },
  ETB: {
    symbol: 'Br',
    name: 'Ethiopian Birr',
    symbol_native: 'Br',
    decimal_digits: 2,
    rounding: 0,
    code: 'ETB',
    name_plural: 'Ethiopian birrs'
  },
  GBP: {
    symbol: '£',
    name: 'British Pound Sterling',
    symbol_native: '£',
    decimal_digits: 2,
    rounding: 0,
    code: 'GBP',
    name_plural: 'British pounds sterling'
  },
  GEL: {
    symbol: 'GEL',
    name: 'Georgian Lari',
    symbol_native: 'GEL',
    decimal_digits: 2,
    rounding: 0,
    code: 'GEL',
    name_plural: 'Georgian laris'
  },
  GHS: {
    symbol: 'GH₵',
    name: 'Ghanaian Cedi',
    symbol_native: 'GH₵',
    decimal_digits: 2,
    rounding: 0,
    code: 'GHS',
    name_plural: 'Ghanaian cedis'
  },
  GNF: {
    symbol: 'FG',
    name: 'Guinean Franc',
    symbol_native: 'FG',
    decimal_digits: 0,
    rounding: 0,
    code: 'GNF',
    name_plural: 'Guinean francs'
  },
  GTQ: {
    symbol: 'GTQ',
    name: 'Guatemalan Quetzal',
    symbol_native: 'Q',
    decimal_digits: 2,
    rounding: 0,
    code: 'GTQ',
    name_plural: 'Guatemalan quetzals'
  },
  HKD: {
    symbol: 'HK$',
    name: 'Hong Kong Dollar',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'HKD',
    name_plural: 'Hong Kong dollars'
  },
  HNL: {
    symbol: 'HNL',
    name: 'Honduran Lempira',
    symbol_native: 'L',
    decimal_digits: 2,
    rounding: 0,
    code: 'HNL',
    name_plural: 'Honduran lempiras'
  },
  HRK: {
    symbol: 'kn',
    name: 'Croatian Kuna',
    symbol_native: 'kn',
    decimal_digits: 2,
    rounding: 0,
    code: 'HRK',
    name_plural: 'Croatian kunas'
  },
  HUF: {
    symbol: 'Ft',
    name: 'Hungarian Forint',
    symbol_native: 'Ft',
    decimal_digits: 0,
    rounding: 0,
    code: 'HUF',
    name_plural: 'Hungarian forints'
  },
  IDR: {
    symbol: 'Rp',
    name: 'Indonesian Rupiah',
    symbol_native: 'Rp',
    decimal_digits: 0,
    rounding: 0,
    code: 'IDR',
    name_plural: 'Indonesian rupiahs'
  },
  ILS: {
    symbol: '₪',
    name: 'Israeli New Sheqel',
    symbol_native: '₪',
    decimal_digits: 2,
    rounding: 0,
    code: 'ILS',
    name_plural: 'Israeli new sheqels'
  },
  INR: {
    symbol: 'Rs',
    name: 'Indian Rupee',
    symbol_native: 'টকা',
    decimal_digits: 2,
    rounding: 0,
    code: 'INR',
    name_plural: 'Indian rupees'
  },
  IQD: {
    symbol: 'IQD',
    name: 'Iraqi Dinar',
    symbol_native: 'د.ع.',
    decimal_digits: 0,
    rounding: 0,
    code: 'IQD',
    name_plural: 'Iraqi dinars'
  },
  IRR: {
    symbol: 'IRR',
    name: 'Iranian Rial',
    symbol_native: '﷼',
    decimal_digits: 0,
    rounding: 0,
    code: 'IRR',
    name_plural: 'Iranian rials'
  },
  ISK: {
    symbol: 'Ikr',
    name: 'Icelandic Króna',
    symbol_native: 'kr',
    decimal_digits: 0,
    rounding: 0,
    code: 'ISK',
    name_plural: 'Icelandic krónur'
  },
  JMD: {
    symbol: 'J$',
    name: 'Jamaican Dollar',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'JMD',
    name_plural: 'Jamaican dollars'
  },
  JOD: {
    symbol: 'JD',
    name: 'Jordanian Dinar',
    symbol_native: 'د.أ.',
    decimal_digits: 3,
    rounding: 0,
    code: 'JOD',
    name_plural: 'Jordanian dinars'
  },
  JPY: {
    symbol: '¥',
    name: 'Japanese Yen',
    symbol_native: '￥',
    decimal_digits: 0,
    rounding: 0,
    code: 'JPY',
    name_plural: 'Japanese yen'
  },
  KES: {
    symbol: 'Ksh',
    name: 'Kenyan Shilling',
    symbol_native: 'Ksh',
    decimal_digits: 2,
    rounding: 0,
    code: 'KES',
    name_plural: 'Kenyan shillings'
  },
  KHR: {
    symbol: 'KHR',
    name: 'Cambodian Riel',
    symbol_native: '៛',
    decimal_digits: 2,
    rounding: 0,
    code: 'KHR',
    name_plural: 'Cambodian riels'
  },
  KMF: {
    symbol: 'CF',
    name: 'Comorian Franc',
    symbol_native: 'FC',
    decimal_digits: 0,
    rounding: 0,
    code: 'KMF',
    name_plural: 'Comorian francs'
  },
  KRW: {
    symbol: '₩',
    name: 'South Korean Won',
    symbol_native: '₩',
    decimal_digits: 0,
    rounding: 0,
    code: 'KRW',
    name_plural: 'South Korean won'
  },
  KWD: {
    symbol: 'KD',
    name: 'Kuwaiti Dinar',
    symbol_native: 'د.ك.',
    decimal_digits: 3,
    rounding: 0,
    code: 'KWD',
    name_plural: 'Kuwaiti dinars'
  },
  KZT: {
    symbol: 'KZT',
    name: 'Kazakhstani Tenge',
    symbol_native: 'тңг.',
    decimal_digits: 2,
    rounding: 0,
    code: 'KZT',
    name_plural: 'Kazakhstani tenges'
  },
  LBP: {
    symbol: 'LB£',
    name: 'Lebanese Pound',
    symbol_native: 'ل.ل.',
    decimal_digits: 0,
    rounding: 0,
    code: 'LBP',
    name_plural: 'Lebanese pounds'
  },
  LKR: {
    symbol: 'SLRs',
    name: 'Sri Lankan Rupee',
    symbol_native: 'SL Re',
    decimal_digits: 2,
    rounding: 0,
    code: 'LKR',
    name_plural: 'Sri Lankan rupees'
  },
  LTL: {
    symbol: 'Lt',
    name: 'Lithuanian Litas',
    symbol_native: 'Lt',
    decimal_digits: 2,
    rounding: 0,
    code: 'LTL',
    name_plural: 'Lithuanian litai'
  },
  LVL: {
    symbol: 'Ls',
    name: 'Latvian Lats',
    symbol_native: 'Ls',
    decimal_digits: 2,
    rounding: 0,
    code: 'LVL',
    name_plural: 'Latvian lati'
  },
  LYD: {
    symbol: 'LD',
    name: 'Libyan Dinar',
    symbol_native: 'د.ل.',
    decimal_digits: 3,
    rounding: 0,
    code: 'LYD',
    name_plural: 'Libyan dinars'
  },
  MAD: {
    symbol: 'MAD',
    name: 'Moroccan Dirham',
    symbol_native: 'د.م.',
    decimal_digits: 2,
    rounding: 0,
    code: 'MAD',
    name_plural: 'Moroccan dirhams'
  },
  MDL: {
    symbol: 'MDL',
    name: 'Moldovan Leu',
    symbol_native: 'MDL',
    decimal_digits: 2,
    rounding: 0,
    code: 'MDL',
    name_plural: 'Moldovan lei'
  },
  MGA: {
    symbol: 'MGA',
    name: 'Malagasy Ariary',
    symbol_native: 'MGA',
    decimal_digits: 0,
    rounding: 0,
    code: 'MGA',
    name_plural: 'Malagasy Ariaries'
  },
  MKD: {
    symbol: 'MKD',
    name: 'Macedonian Denar',
    symbol_native: 'MKD',
    decimal_digits: 2,
    rounding: 0,
    code: 'MKD',
    name_plural: 'Macedonian denari'
  },
  MMK: {
    symbol: 'MMK',
    name: 'Myanma Kyat',
    symbol_native: 'K',
    decimal_digits: 0,
    rounding: 0,
    code: 'MMK',
    name_plural: 'Myanma kyats'
  },
  MOP: {
    symbol: 'MOP$',
    name: 'Macanese Pataca',
    symbol_native: 'MOP$',
    decimal_digits: 2,
    rounding: 0,
    code: 'MOP',
    name_plural: 'Macanese patacas'
  },
  MUR: {
    symbol: 'MURs',
    name: 'Mauritian Rupee',
    symbol_native: 'MURs',
    decimal_digits: 0,
    rounding: 0,
    code: 'MUR',
    name_plural: 'Mauritian rupees'
  },
  MXN: {
    symbol: 'MX$',
    name: 'Mexican Peso',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'MXN',
    name_plural: 'Mexican pesos'
  },
  MYR: {
    symbol: 'RM',
    name: 'Malaysian Ringgit',
    symbol_native: 'RM',
    decimal_digits: 2,
    rounding: 0,
    code: 'MYR',
    name_plural: 'Malaysian ringgits'
  },
  MZN: {
    symbol: 'MTn',
    name: 'Mozambican Metical',
    symbol_native: 'MTn',
    decimal_digits: 2,
    rounding: 0,
    code: 'MZN',
    name_plural: 'Mozambican meticals'
  },
  NAD: {
    symbol: 'N$',
    name: 'Namibian Dollar',
    symbol_native: 'N$',
    decimal_digits: 2,
    rounding: 0,
    code: 'NAD',
    name_plural: 'Namibian dollars'
  },
  NGN: {
    symbol: '₦',
    name: 'Nigerian Naira',
    symbol_native: '₦',
    decimal_digits: 2,
    rounding: 0,
    code: 'NGN',
    name_plural: 'Nigerian nairas'
  },
  NIO: {
    symbol: 'C$',
    name: 'Nicaraguan Córdoba',
    symbol_native: 'C$',
    decimal_digits: 2,
    rounding: 0,
    code: 'NIO',
    name_plural: 'Nicaraguan córdobas'
  },
  NOK: {
    symbol: 'Nkr',
    name: 'Norwegian Krone',
    symbol_native: 'kr',
    decimal_digits: 2,
    rounding: 0,
    code: 'NOK',
    name_plural: 'Norwegian kroner'
  },
  NPR: {
    symbol: 'NPRs',
    name: 'Nepalese Rupee',
    symbol_native: 'नेरू',
    decimal_digits: 2,
    rounding: 0,
    code: 'NPR',
    name_plural: 'Nepalese rupees'
  },
  NZD: {
    symbol: 'NZ$',
    name: 'New Zealand Dollar',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'NZD',
    name_plural: 'New Zealand dollars'
  },
  OMR: {
    symbol: 'OMR',
    name: 'Omani Rial',
    symbol_native: 'ر.ع.',
    decimal_digits: 3,
    rounding: 0,
    code: 'OMR',
    name_plural: 'Omani rials'
  },
  PAB: {
    symbol: 'B/.',
    name: 'Panamanian Balboa',
    symbol_native: 'B/.',
    decimal_digits: 2,
    rounding: 0,
    code: 'PAB',
    name_plural: 'Panamanian balboas'
  },
  PEN: {
    symbol: 'S/.',
    name: 'Peruvian Nuevo Sol',
    symbol_native: 'S/.',
    decimal_digits: 2,
    rounding: 0,
    code: 'PEN',
    name_plural: 'Peruvian nuevos soles'
  },
  PHP: {
    symbol: '₱',
    name: 'Philippine Peso',
    symbol_native: '₱',
    decimal_digits: 2,
    rounding: 0,
    code: 'PHP',
    name_plural: 'Philippine pesos'
  },
  PKR: {
    symbol: 'PKRs',
    name: 'Pakistani Rupee',
    symbol_native: '₨',
    decimal_digits: 0,
    rounding: 0,
    code: 'PKR',
    name_plural: 'Pakistani rupees'
  },
  PLN: {
    symbol: 'zł',
    name: 'Polish Zloty',
    symbol_native: 'zł',
    decimal_digits: 2,
    rounding: 0,
    code: 'PLN',
    name_plural: 'Polish zlotys'
  },
  PYG: {
    symbol: '₲',
    name: 'Paraguayan Guarani',
    symbol_native: '₲',
    decimal_digits: 0,
    rounding: 0,
    code: 'PYG',
    name_plural: 'Paraguayan guaranis'
  },
  QAR: {
    symbol: 'QR',
    name: 'Qatari Rial',
    symbol_native: 'ر.ق.',
    decimal_digits: 2,
    rounding: 0,
    code: 'QAR',
    name_plural: 'Qatari rials'
  },
  RON: {
    symbol: 'RON',
    name: 'Romanian Leu',
    symbol_native: 'RON',
    decimal_digits: 2,
    rounding: 0,
    code: 'RON',
    name_plural: 'Romanian lei'
  },
  RSD: {
    symbol: 'din.',
    name: 'Serbian Dinar',
    symbol_native: 'дин.',
    decimal_digits: 0,
    rounding: 0,
    code: 'RSD',
    name_plural: 'Serbian dinars'
  },
  RUB: {
    symbol: 'RUB',
    name: 'Russian Ruble',
    symbol_native: '₽.',
    decimal_digits: 2,
    rounding: 0,
    code: 'RUB',
    name_plural: 'Russian rubles'
  },
  RWF: {
    symbol: 'RWF',
    name: 'Rwandan Franc',
    symbol_native: 'FR',
    decimal_digits: 0,
    rounding: 0,
    code: 'RWF',
    name_plural: 'Rwandan francs'
  },
  SAR: {
    symbol: 'SR',
    name: 'Saudi Riyal',
    symbol_native: 'ر.س.',
    decimal_digits: 2,
    rounding: 0,
    code: 'SAR',
    name_plural: 'Saudi riyals'
  },
  SDG: {
    symbol: 'SDG',
    name: 'Sudanese Pound',
    symbol_native: 'SDG',
    decimal_digits: 2,
    rounding: 0,
    code: 'SDG',
    name_plural: 'Sudanese pounds'
  },
  SEK: {
    symbol: 'Skr',
    name: 'Swedish Krona',
    symbol_native: 'kr',
    decimal_digits: 2,
    rounding: 0,
    code: 'SEK',
    name_plural: 'Swedish kronor'
  },
  SGD: {
    symbol: 'S$',
    name: 'Singapore Dollar',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'SGD',
    name_plural: 'Singapore dollars'
  },
  SOS: {
    symbol: 'Ssh',
    name: 'Somali Shilling',
    symbol_native: 'Ssh',
    decimal_digits: 0,
    rounding: 0,
    code: 'SOS',
    name_plural: 'Somali shillings'
  },
  SYP: {
    symbol: 'SY£',
    name: 'Syrian Pound',
    symbol_native: 'ل.س.',
    decimal_digits: 0,
    rounding: 0,
    code: 'SYP',
    name_plural: 'Syrian pounds'
  },
  THB: {
    symbol: '฿',
    name: 'Thai Baht',
    symbol_native: '฿',
    decimal_digits: 2,
    rounding: 0,
    code: 'THB',
    name_plural: 'Thai baht'
  },
  TND: {
    symbol: 'DT',
    name: 'Tunisian Dinar',
    symbol_native: 'د.ت.',
    decimal_digits: 3,
    rounding: 0,
    code: 'TND',
    name_plural: 'Tunisian dinars'
  },
  TOP: {
    symbol: 'T$',
    name: 'Tongan Paʻanga',
    symbol_native: 'T$',
    decimal_digits: 2,
    rounding: 0,
    code: 'TOP',
    name_plural: 'Tongan paʻanga'
  },
  TRY: {
    symbol: 'TL',
    name: 'Turkish Lira',
    symbol_native: 'TL',
    decimal_digits: 2,
    rounding: 0,
    code: 'TRY',
    name_plural: 'Turkish Lira'
  },
  TTD: {
    symbol: 'TT$',
    name: 'Trinidad and Tobago Dollar',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'TTD',
    name_plural: 'Trinidad and Tobago dollars'
  },
  TWD: {
    symbol: 'NT$',
    name: 'New Taiwan Dollar',
    symbol_native: 'NT$',
    decimal_digits: 2,
    rounding: 0,
    code: 'TWD',
    name_plural: 'New Taiwan dollars'
  },
  TZS: {
    symbol: 'TSh',
    name: 'Tanzanian Shilling',
    symbol_native: 'TSh',
    decimal_digits: 0,
    rounding: 0,
    code: 'TZS',
    name_plural: 'Tanzanian shillings'
  },
  UAH: {
    symbol: '₴',
    name: 'Ukrainian Hryvnia',
    symbol_native: '₴',
    decimal_digits: 2,
    rounding: 0,
    code: 'UAH',
    name_plural: 'Ukrainian hryvnias'
  },
  UGX: {
    symbol: 'USh',
    name: 'Ugandan Shilling',
    symbol_native: 'USh',
    decimal_digits: 0,
    rounding: 0,
    code: 'UGX',
    name_plural: 'Ugandan shillings'
  },
  UYU: {
    symbol: '$U',
    name: 'Uruguayan Peso',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'UYU',
    name_plural: 'Uruguayan pesos'
  },
  UZS: {
    symbol: 'UZS',
    name: 'Uzbekistan Som',
    symbol_native: 'UZS',
    decimal_digits: 0,
    rounding: 0,
    code: 'UZS',
    name_plural: 'Uzbekistan som'
  },
  VEF: {
    symbol: 'Bs.F.',
    name: 'Venezuelan Bolívar',
    symbol_native: 'Bs.F.',
    decimal_digits: 2,
    rounding: 0,
    code: 'VEF',
    name_plural: 'Venezuelan bolívars'
  },
  VND: {
    symbol: '₫',
    name: 'Vietnamese Dong',
    symbol_native: '₫',
    decimal_digits: 0,
    rounding: 0,
    code: 'VND',
    name_plural: 'Vietnamese dong'
  },
  XAF: {
    symbol: 'FCFA',
    name: 'CFA Franc BEAC',
    symbol_native: 'FCFA',
    decimal_digits: 0,
    rounding: 0,
    code: 'XAF',
    name_plural: 'CFA francs BEAC'
  },
  XOF: {
    symbol: 'CFA',
    name: 'CFA Franc BCEAO',
    symbol_native: 'CFA',
    decimal_digits: 0,
    rounding: 0,
    code: 'XOF',
    name_plural: 'CFA francs BCEAO'
  },
  YER: {
    symbol: 'YR',
    name: 'Yemeni Rial',
    symbol_native: 'ر.ي.',
    decimal_digits: 0,
    rounding: 0,
    code: 'YER',
    name_plural: 'Yemeni rials'
  },
  ZAR: {
    symbol: 'R',
    name: 'South African Rand',
    symbol_native: 'R',
    decimal_digits: 2,
    rounding: 0,
    code: 'ZAR',
    name_plural: 'South African rand'
  },
  ZMK: {
    symbol: 'ZK',
    name: 'Zambian Kwacha',
    symbol_native: 'ZK',
    decimal_digits: 0,
    rounding: 0,
    code: 'ZMK',
    name_plural: 'Zambian kwachas'
  },
  ZWL: {
    symbol: 'ZWL$',
    name: 'Zimbabwean Dollar',
    symbol_native: 'ZWL$',
    decimal_digits: 0,
    rounding: 0,
    code: 'ZWL',
    name_plural: 'Zimbabwean Dollar'
  }
};

export const COUNTRIES: readonly CountryType[] = [
  {
    code: 'AF',
    label: 'Afghanistan',
    phone: '93'
  },
  {
    code: 'AL',
    label: 'Albania',
    phone: '355'
  },
  {
    code: 'DZ',
    label: 'Algeria',
    phone: '213'
  },
  {
    code: 'AD',
    label: 'Andorra',
    phone: '376'
  },
  {
    code: 'AO',
    label: 'Angola',
    phone: '244'
  },
  {
    code: 'AG',
    label: 'Antigua and Barbuda',
    phone: '1268'
  },
  {
    code: 'AR',
    label: 'Argentina',
    phone: '54'
  },
  {
    code: 'AM',
    label: 'Armenia',
    phone: '374'
  },
  {
    code: 'AW',
    label: 'Aruba',
    phone: '297'
  },
  {
    code: 'AU',
    label: 'Australia',
    phone: '61'
  },
  {
    code: 'AT',
    label: 'Austria',
    phone: '43'
  },
  {
    code: 'AZ',
    label: 'Azerbaijan',
    phone: '994'
  },
  {
    code: 'BS',
    label: 'Bahamas',
    phone: '1242'
  },
  {
    code: 'BH',
    label: 'Bahrain',
    phone: '973'
  },
  {
    code: 'BD',
    label: 'Bangladesh',
    phone: '880'
  },
  {
    code: 'BB',
    label: 'Barbados',
    phone: '1246'
  },
  {
    code: 'BY',
    label: 'Belarus',
    phone: '375'
  },
  {
    code: 'BE',
    label: 'Belgium',
    phone: '32'
  },
  {
    code: 'BZ',
    label: 'Belize',
    phone: '501'
  },
  {
    code: 'BJ',
    label: 'Benin',
    phone: '229'
  },
  {
    code: 'BT',
    label: 'Bhutan',
    phone: '975'
  },
  {
    code: 'BO',
    label: 'Bolivia',
    phone: '591'
  },
  {
    code: 'BA',
    label: 'Bosnia and Herzegovina',
    phone: '387'
  },
  {
    code: 'BW',
    label: 'Botswana',
    phone: '267'
  },
  {
    code: 'BR',
    label: 'Brazil',
    phone: '55'
  },
  {
    code: 'IO',
    label: 'British Indian Ocean Territory',
    phone: '246'
  },
  {
    code: 'BN',
    label: 'Brunei',
    phone: '673'
  },
  {
    code: 'BG',
    label: 'Bulgaria',
    phone: '359'
  },
  {
    code: 'BF',
    label: 'Burkina Faso',
    phone: '226'
  },
  {
    code: 'BI',
    label: 'Burundi',
    phone: '257'
  },
  {
    code: 'KH',
    label: 'Cambodia',
    phone: '855'
  },
  {
    code: 'CM',
    label: 'Cameroon',
    phone: '237'
  },
  {
    code: 'CA',
    label: 'Canada',
    phone: '1'
  },
  {
    code: 'CV',
    label: 'Cape Verde',
    phone: '238'
  },
  {
    code: 'BQ',
    label: 'Caribbean Netherlands',
    phone: '599'
  },
  {
    code: 'CF',
    label: 'Central African Republic',
    phone: '236'
  },
  {
    code: 'TD',
    label: 'Chad',
    phone: '235'
  },
  {
    code: 'CL',
    label: 'Chile',
    phone: '56'
  },
  {
    code: 'CN',
    label: 'China',
    phone: '86'
  },
  {
    code: 'CO',
    label: 'Colombia',
    phone: '57'
  },
  {
    code: 'KM',
    label: 'Comoros',
    phone: '269'
  },
  {
    code: 'CD',
    label: 'Congo',
    phone: '243'
  },
  {
    code: 'CG',
    label: 'Congo',
    phone: '242'
  },
  {
    code: 'CR',
    label: 'Costa Rica',
    phone: '506'
  },
  {
    code: 'CI',
    label: 'Côte d’Ivoire',
    phone: '225'
  },
  {
    code: 'HR',
    label: 'Croatia',
    phone: '385'
  },
  {
    code: 'CU',
    label: 'Cuba',
    phone: '53'
  },
  {
    code: 'CW',
    label: 'Curaçao',
    phone: '599'
  },
  {
    code: 'CY',
    label: 'Cyprus',
    phone: '357'
  },
  {
    code: 'CZ',
    label: 'Czech Republic',
    phone: '420'
  },
  {
    code: 'DK',
    label: 'Denmark',
    phone: '45'
  },
  {
    code: 'DJ',
    label: 'Djibouti',
    phone: '253'
  },
  {
    code: 'DM',
    label: 'Dominica',
    phone: '1767'
  },
  {
    code: 'DO',
    label: 'Dominican Republic',
    phone: '1'
  },
  {
    code: 'EC',
    label: 'Ecuador',
    phone: '593'
  },
  {
    code: 'EG',
    label: 'Egypt',
    phone: '20'
  },
  {
    code: 'SV',
    label: 'El Salvador',
    phone: '503'
  },
  {
    code: 'GQ',
    label: 'Equatorial Guinea',
    phone: '240'
  },
  {
    code: 'ER',
    label: 'Eritrea',
    phone: '291'
  },
  {
    code: 'EE',
    label: 'Estonia',
    phone: '372'
  },
  {
    code: 'ET',
    label: 'Ethiopia',
    phone: '251'
  },
  {
    code: 'FJ',
    label: 'Fiji',
    phone: '679'
  },
  {
    code: 'FI',
    label: 'Finland',
    phone: '358'
  },
  {
    code: 'FR',
    label: 'France',
    phone: '33'
  },
  {
    code: 'GF',
    label: 'French Guiana',
    phone: '594'
  },
  {
    code: 'PF',
    label: 'French Polynesia',
    phone: '689'
  },
  {
    code: 'GA',
    label: 'Gabon',
    phone: '241'
  },
  {
    code: 'GM',
    label: 'Gambia',
    phone: '220'
  },
  {
    code: 'GE',
    label: 'Georgia',
    phone: '995'
  },
  {
    code: 'DE',
    label: 'Germany',
    phone: '49'
  },
  {
    code: 'GH',
    label: 'Ghana',
    phone: '233'
  },
  {
    code: 'GR',
    label: 'Greece',
    phone: '30'
  },
  {
    code: 'GD',
    label: 'Grenada',
    phone: '1473'
  },
  {
    code: 'GP',
    label: 'Guadeloupe',
    phone: '590'
  },
  {
    code: 'GU',
    label: 'Guam',
    phone: '1671'
  },
  {
    code: 'GT',
    label: 'Guatemala',
    phone: '502'
  },
  {
    code: 'GN',
    label: 'Guinea',
    phone: '224'
  },
  {
    code: 'GW',
    label: 'Guinea-Bissau',
    phone: '245'
  },
  {
    code: 'GY',
    label: 'Guyana',
    phone: '592'
  },
  {
    code: 'HT',
    label: 'Haiti',
    phone: '509'
  },
  {
    code: 'HN',
    label: 'Honduras',
    phone: '504'
  },
  {
    code: 'HK',
    label: 'Hong Kong',
    phone: '852'
  },
  {
    code: 'HU',
    label: 'Hungary',
    phone: '36'
  },
  {
    code: 'IS',
    label: 'Iceland',
    phone: '354'
  },
  {
    code: 'IN',
    label: 'India',
    phone: '91'
  },
  {
    code: 'ID',
    label: 'Indonesia',
    phone: '62'
  },
  {
    code: 'IR',
    label: 'Iran',
    phone: '98'
  },
  {
    code: 'IQ',
    label: 'Iraq',
    phone: '964'
  },
  {
    code: 'IE',
    label: 'Ireland',
    phone: '353'
  },
  {
    code: 'IL',
    label: 'Israel',
    phone: '972'
  },
  {
    code: 'IT',
    label: 'Italy',
    phone: '39'
  },
  {
    code: 'JM',
    label: 'Jamaica',
    phone: '1876'
  },
  {
    code: 'JP',
    label: 'Japan',
    phone: '81'
  },
  {
    code: 'JO',
    label: 'Jordan',
    phone: '962'
  },
  {
    code: 'KZ',
    label: 'Kazakhstan',
    phone: '7'
  },
  {
    code: 'KE',
    label: 'Kenya',
    phone: '254'
  },
  {
    code: 'KI',
    label: 'Kiribati',
    phone: '686'
  },
  {
    code: 'XK',
    label: 'Kosovo',
    phone: '383'
  },
  {
    code: 'KW',
    label: 'Kuwait',
    phone: '965'
  },
  {
    code: 'KG',
    label: 'Kyrgyzstan',
    phone: '996'
  },
  {
    code: 'LA',
    label: 'Laos',
    phone: '856'
  },
  {
    code: 'LV',
    label: 'Latvia',
    phone: '371'
  },
  {
    code: 'LB',
    label: 'Lebanon',
    phone: '961'
  },
  {
    code: 'LS',
    label: 'Lesotho',
    phone: '266'
  },
  {
    code: 'LR',
    label: 'Liberia',
    phone: '231'
  },
  {
    code: 'LY',
    label: 'Libya',
    phone: '218'
  },
  {
    code: 'LI',
    label: 'Liechtenstein',
    phone: '423'
  },
  {
    code: 'LT',
    label: 'Lithuania',
    phone: '370'
  },
  {
    code: 'LU',
    label: 'Luxembourg',
    phone: '352'
  },
  {
    code: 'MO',
    label: 'Macau',
    phone: '853'
  },
  {
    code: 'MK',
    label: 'Macedonia',
    phone: '389'
  },
  {
    code: 'MG',
    label: 'Madagascar',
    phone: '261'
  },
  {
    code: 'MW',
    label: 'Malawi',
    phone: '265'
  },
  {
    code: 'MY',
    label: 'Malaysia',
    phone: '60'
  },
  {
    code: 'MV',
    label: 'Maldives',
    phone: '960'
  },
  {
    code: 'ML',
    label: 'Mali',
    phone: '223'
  },
  {
    code: 'MT',
    label: 'Malta',
    phone: '356'
  },
  {
    code: 'MH',
    label: 'Marshall Islands',
    phone: '692'
  },
  {
    code: 'MQ',
    label: 'Martinique',
    phone: '596'
  },
  {
    code: 'MR',
    label: 'Mauritania',
    phone: '222'
  },
  {
    code: 'MU',
    label: 'Mauritius',
    phone: '230'
  },
  {
    code: 'MX',
    label: 'Mexico',
    phone: '52'
  },
  {
    code: 'FM',
    label: 'Micronesia',
    phone: '691'
  },
  {
    code: 'MD',
    label: 'Moldova',
    phone: '373'
  },
  {
    code: 'MC',
    label: 'Monaco',
    phone: '377'
  },
  {
    code: 'MN',
    label: 'Mongolia',
    phone: '976'
  },
  {
    code: 'ME',
    label: 'Montenegro',
    phone: '382'
  },
  {
    code: 'MA',
    label: 'Morocco',
    phone: '212'
  },
  {
    code: 'MZ',
    label: 'Mozambique',
    phone: '258'
  },
  {
    code: 'MM',
    label: 'Myanmar',
    phone: '95'
  },
  {
    code: 'NA',
    label: 'Namibia',
    phone: '264'
  },
  {
    code: 'NR',
    label: 'Nauru',
    phone: '674'
  },
  {
    code: 'NP',
    label: 'Nepal',
    phone: '977'
  },
  {
    code: 'NL',
    label: 'Netherlands',
    phone: '31'
  },
  {
    code: 'NC',
    label: 'New Caledonia',
    phone: '687'
  },
  {
    code: 'NZ',
    label: 'New Zealand',
    phone: '64'
  },
  {
    code: 'NI',
    label: 'Nicaragua',
    phone: '505'
  },
  {
    code: 'NE',
    label: 'Niger',
    phone: '227'
  },
  {
    code: 'NG',
    label: 'Nigeria',
    phone: '234'
  },
  {
    code: 'KP',
    label: 'North Korea',
    phone: '850'
  },
  {
    code: 'NO',
    label: 'Norway',
    phone: '47'
  },
  {
    code: 'OM',
    label: 'Oman',
    phone: '968'
  },
  {
    code: 'PK',
    label: 'Pakistan',
    phone: '92'
  },
  {
    code: 'PW',
    label: 'Palau',
    phone: '680'
  },
  {
    code: 'PS',
    label: 'Palestine',
    phone: '970'
  },
  {
    code: 'PA',
    label: 'Panama',
    phone: '507'
  },
  {
    code: 'PG',
    label: 'Papua New Guinea',
    phone: '675'
  },
  {
    code: 'PY',
    label: 'Paraguay',
    phone: '595'
  },
  {
    code: 'PE',
    label: 'Peru',
    phone: '51'
  },
  {
    code: 'PH',
    label: 'Philippines',
    phone: '63'
  },
  {
    code: 'PL',
    label: 'Poland',
    phone: '48'
  },
  {
    code: 'PT',
    label: 'Portugal',
    phone: '351'
  },
  {
    code: 'PR',
    label: 'Puerto Rico',
    phone: '1'
  },
  {
    code: 'QA',
    label: 'Qatar',
    phone: '974'
  },
  {
    code: 'RE',
    label: 'Réunion',
    phone: '262'
  },
  {
    code: 'RO',
    label: 'Romania',
    phone: '40'
  },
  {
    code: 'RU',
    label: 'Russia',
    phone: '7'
  },
  {
    code: 'RW',
    label: 'Rwanda',
    phone: '250'
  },
  {
    code: 'KN',
    label: 'Saint Kitts and Nevis',
    phone: '1869'
  },
  {
    code: 'LC',
    label: 'Saint Lucia',
    phone: '1758'
  },
  {
    code: 'VC',
    label: 'Saint Vincent and the Grenadines',
    phone: '1784'
  },
  {
    code: 'WS',
    label: 'Samoa',
    phone: '685'
  },
  {
    code: 'SM',
    label: 'San Marino',
    phone: '378'
  },
  {
    code: 'ST',
    label: 'São Tomé and Príncipe',
    phone: '239'
  },
  {
    code: 'SA',
    label: 'Saudi Arabia',
    phone: '966'
  },
  {
    code: 'SN',
    label: 'Senegal',
    phone: '221'
  },
  {
    code: 'RS',
    label: 'Serbia',
    phone: '381'
  },
  {
    code: 'SC',
    label: 'Seychelles',
    phone: '248'
  },
  {
    code: 'SL',
    label: 'Sierra Leone',
    phone: '232'
  },
  {
    code: 'SG',
    label: 'Singapore',
    phone: '65'
  },
  {
    code: 'SK',
    label: 'Slovakia',
    phone: '421'
  },
  {
    code: 'SI',
    label: 'Slovenia',
    phone: '386'
  },
  {
    code: 'SB',
    label: 'Solomon Islands',
    phone: '677'
  },
  {
    code: 'SO',
    label: 'Somalia',
    phone: '252'
  },
  {
    code: 'ZA',
    label: 'South Africa',
    phone: '27'
  },
  {
    code: 'KR',
    label: 'South Korea',
    phone: '82'
  },
  {
    code: 'SS',
    label: 'South Sudan',
    phone: '211'
  },
  {
    code: 'ES',
    label: 'Spain',
    phone: '34'
  },
  {
    code: 'LK',
    label: 'Sri Lanka',
    phone: '94'
  },
  {
    code: 'SD',
    label: 'Sudan',
    phone: '249'
  },
  {
    code: 'SR',
    label: 'Suriname',
    phone: '597'
  },
  {
    code: 'SZ',
    label: 'Swaziland',
    phone: '268'
  },
  {
    code: 'SE',
    label: 'Sweden',
    phone: '46'
  },
  {
    code: 'CH',
    label: 'Switzerland',
    phone: '41'
  },
  {
    code: 'SY',
    label: 'Syria',
    phone: '963'
  },
  {
    code: 'TW',
    label: 'Taiwan',
    phone: '886'
  },
  {
    code: 'TJ',
    label: 'Tajikistan',
    phone: '992'
  },
  {
    code: 'TZ',
    label: 'Tanzania',
    phone: '255'
  },
  {
    code: 'TH',
    label: 'Thailand',
    phone: '66'
  },
  {
    code: 'TL',
    label: 'Timor-Leste',
    phone: '670'
  },
  {
    code: 'TG',
    label: 'Togo',
    phone: '228'
  },
  {
    code: 'TO',
    label: 'Tonga',
    phone: '676'
  },
  {
    code: 'TT',
    label: 'Trinidad and Tobago',
    phone: '1868'
  },
  {
    code: 'TN',
    label: 'Tunisia',
    phone: '216'
  },
  {
    code: 'TR',
    label: 'Turkey',
    phone: '90'
  },
  {
    code: 'TM',
    label: 'Turkmenistan',
    phone: '993'
  },
  {
    code: 'TV',
    label: 'Tuvalu',
    phone: '688'
  },
  {
    code: 'UG',
    label: 'Uganda',
    phone: '256'
  },
  {
    code: 'UA',
    label: 'Ukraine',
    phone: '380'
  },
  {
    code: 'AE',
    label: 'United Arab Emirates',
    phone: '971'
  },
  {
    code: 'GB',
    label: 'United Kingdom',
    phone: '44'
  },
  {
    code: 'US',
    label: 'United States',
    phone: '1'
  },
  {
    code: 'UY',
    label: 'Uruguay',
    phone: '598'
  },
  {
    code: 'UZ',
    label: 'Uzbekistan',
    phone: '998'
  },
  {
    code: 'VU',
    label: 'Vanuatu',
    phone: '678'
  },
  {
    code: 'VA',
    label: 'Vatican City',
    phone: '39'
  },
  {
    code: 'VE',
    label: 'Venezuela',
    phone: '58'
  },
  {
    code: 'VN',
    label: 'Vietnam',
    phone: '84'
  },
  {
    code: 'YE',
    label: 'Yemen',
    phone: '967'
  },
  {
    code: 'ZM',
    label: 'Zambia',
    phone: '260'
  },
  {
    code: 'ZW',
    label: 'Zimbabwe',
    phone: '263'
  }
];

export const modifyAddressDataPub = {
  address1: {
    visible: true,
    required: true,
    label: '',
    readOnly: false
  },
  address2: {
    visible: true,
    required: true,
    label: '',
    readOnly: false
  },
  city: {
    visible: true,
    required: true,
    label: '',
    readOnly: false
  },
  country: {
    visible: true,
    required: true,
    label: '',
    readOnly: false
  },
  state: {
    visible: true,
    required: true,
    label: '',
    readOnly: false
  },
  postalCode: {
    visible: true,
    required: true,
    label: '',
    readOnly: false
  }
};
export const modifyFieldsDataPub = {
  ...modifyAddressDataPub,
  customerEmail: {
    visible: true,
    required: true,
    label: '',
    readOnly: false
  },
  customerFirstName: {
    visible: true,
    required: true,
    label: '',
    readOnly: false
  },
  customerLastName: {
    visible: true,
    required: true,
    label: '',
    readOnly: false
  },
  customerPostCode: {
    visible: true,
    required: true,
    label: '',
    readOnly: false
  },
  orderRef: {
    visible: true,
    required: true,
    label: '',
    readOnly: false
  },
  description: {
    visible: true,
    required: true,
    label: '',
    readOnly: false
  },
  amount: {
    visible: true,
    required: true,
    readOnly: false,
    label: ''
  }
};
