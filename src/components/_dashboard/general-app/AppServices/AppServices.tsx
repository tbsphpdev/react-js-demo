// material
import { Grid } from '@material-ui/core';
import SvgIconStyle from 'components/SvgIconStyle';
import SupportCard from './Cards/SupportCard';
import ReportsCard from './Cards/ReportsCard';
import TransactionCard from './Cards/TransactionCard';
import DirectDebitsCard from './Cards/DirectDebitsCard';
import PaylinkCard from './Cards/PaylinkCard';
import VTCard from './Cards/VTCard';

const getIcon = (name: string) => <SvgIconStyle src={`/static/icons/navbar/${name}.svg`} />;

const ICONS = {
  user: getIcon('ic_user'),
  dashboard: getIcon('ic_dashboard'),
  transaction: getIcon('ic_txn_hstry'),
  settings: getIcon('ic_settings'),
  direct_debits: getIcon('ic_direct_debit'),
  blink: getIcon('ic_blink_pgs'),
  vt: getIcon('ic_vt'),
  paylinks: getIcon('ic_paylinks'),
  analytics: getIcon('ic_analytics'),
  reporting: getIcon('ic_reporting'),
  bankRecons: getIcon('ic_bank_recons'),
  userMgmt: getIcon('ic_user_mgmt'),
  support: getIcon('ic_support')
};

const AppServices = () => (
  <>
    <Grid item xs={12} sm={4} md={4}>
      <VTCard icon={ICONS.vt} />
    </Grid>
    <Grid item xs={12} sm={4} md={4}>
      <PaylinkCard icon={ICONS.paylinks} />
    </Grid>
    <Grid item xs={12} sm={4} md={4}>
      <DirectDebitsCard icon={ICONS.direct_debits} />
    </Grid>
    <Grid item xs={12} sm={4} md={4}>
      <TransactionCard icon={ICONS.transaction} />
    </Grid>
    <Grid item xs={12} sm={4} md={4}>
      <ReportsCard icon={ICONS.reporting} />
    </Grid>
    <Grid item xs={12} sm={4} md={4}>
      <SupportCard icon={ICONS.support} />
    </Grid>
  </>
);

export default AppServices;
