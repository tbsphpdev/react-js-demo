import SvgIconStyle from 'components/SvgIconStyle';

const getIcon = (name: string) => (
  <SvgIconStyle src={`/static/icons/navbar/${name}.svg`} sx={{ width: '100%', height: '100%' }} />
);

export const ICONS: Record<string, JSX.Element> = {
  user: getIcon('ic_user'),
  dashboard: getIcon('ic_dashboard'),
  transaction: getIcon('ic_txn_hstry'),
  settings: getIcon('ic_settings'),
  direct_debits: getIcon('ic_direct_debit'),
  blinkpage: getIcon('ic_blink_pgs'),
  vt: getIcon('ic_vt'),
  paylink: getIcon('ic_paylinks'),
  analytics: getIcon('ic_analytics'),
  reporting: getIcon('ic_reporting'),
  bankRecons: getIcon('ic_bank_recons'),
  userMgmt: getIcon('ic_user_mgmt'),
  support: getIcon('ic_support')
};
