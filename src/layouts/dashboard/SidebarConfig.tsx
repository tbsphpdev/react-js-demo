// routes
import { ICONS } from 'utils/blinkIcons';
import { PATH_DASHBOARD } from '../../routes/paths';
// components
// ----------------------------------------------------------------------

const sidebarConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'general',
    items: [
      {
        title: 'dashboard',
        path: PATH_DASHBOARD.general.app,
        icon: ICONS.dashboard
      },
      {
        title: 'settings',
        path: PATH_DASHBOARD.settings.root,
        icon: ICONS.settings
      }
    ]
  },

  // PAYMENTS
  // ----------------------------------------------------------------------

  {
    subheader: 'Payments',
    items: [
      {
        title: 'Virtual Terminal',
        path: PATH_DASHBOARD.virtualTerminal.create,
        icon: ICONS.vt
      },
      {
        title: 'Paylink',
        path: PATH_DASHBOARD.paylink.create,
        icon: ICONS.paylink
      },
      {
        title: 'Direct Debits',
        path: PATH_DASHBOARD.gc.home,
        icon: ICONS.direct_debits
      },
      {
        title: 'Blink Pages',
        path: PATH_DASHBOARD.blinkPages.root,
        icon: ICONS.blinkpage
      }
    ]
  },
  // TRANSACTION DATA
  // ----------------------------------------------------------------------

  {
    subheader: 'Transaction data',
    items: [
      {
        title: 'transaction history',
        path: PATH_DASHBOARD.transaction.history,
        icon: ICONS.transaction
      },
      {
        title: 'Analytics',
        path: PATH_DASHBOARD.general.analytics,
        icon: ICONS.analytics
      },
      {
        title: 'Reports',
        path: PATH_DASHBOARD.reports.root,
        icon: ICONS.reporting
      },
      {
        title: 'Bank Reconciliation',
        path: PATH_DASHBOARD.bankReconciliation.root,
        icon: ICONS.bankRecons
      }
    ]
  },

  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    subheader: 'management',
    items: [
      {
        title: 'my account',
        path: PATH_DASHBOARD.salesforceaccount.root,
        icon: ICONS.user
      },
      {
        title: 'support',
        path: PATH_DASHBOARD.general.support,
        icon: ICONS.support
      },
      {
        title: 'users',
        path: PATH_DASHBOARD.user.root,
        icon: ICONS.userMgmt
      },
      {
        title: 'Customiser',
        path: PATH_DASHBOARD.blinkPages.customiser,
        icon: ICONS.settings
      }
    ]
  }
];

export default sidebarConfig;
