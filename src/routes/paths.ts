// ----------------------------------------------------------------------

function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';
const ROOTS_DASHBOARD = '/app';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  loginUnprotected: path(ROOTS_AUTH, '/login-unprotected'),
  register: path(ROOTS_AUTH, '/register'),
  registerUnprotected: path(ROOTS_AUTH, '/register-unprotected'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
  verify: path(ROOTS_AUTH, '/verify')
};

export const PATH_PAGE = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page404: '/404',
  page500: '/500',
  components: '/components'
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  general: {
    app: path(ROOTS_DASHBOARD, '/dashboard'),
    analytics: path(ROOTS_DASHBOARD, '/analytics'),
    support: path(ROOTS_DASHBOARD, '/support')
  },

  user: {
    root: path(ROOTS_DASHBOARD, '/user'),
    profile: path(ROOTS_DASHBOARD, '/user/profile'),
    cards: path(ROOTS_DASHBOARD, '/user/cards'),
    list: path(ROOTS_DASHBOARD, '/user/list'),
    newUser: path(ROOTS_DASHBOARD, '/user/new'),
    editById: path(ROOTS_DASHBOARD, '/user/ada-lindgren/edit'),
    account: path(ROOTS_DASHBOARD, '/user/account')
  },
  settings: {
    root: path(ROOTS_DASHBOARD, '/settings')
  },
  bankReconciliation: {
    root: path(ROOTS_DASHBOARD, '/bankreconciliation')
  },

  virtualTerminal: {
    create: path(ROOTS_DASHBOARD, '/virtual-terminal/create'),
    setting: path(ROOTS_DASHBOARD, '/virtual-terminal/setting')
  },
  transaction: {
    history: path(ROOTS_DASHBOARD, '/transactions/history'),
    repeat: path(ROOTS_DASHBOARD, '/transactions/repeat')
  },
  blinkPages: {
    root: path(ROOTS_DASHBOARD, '/blink-pages/all'),
    customiser: path(ROOTS_DASHBOARD, '/blink-pages/customiser')
  },
  salesforceaccount: {
    root: path(ROOTS_DASHBOARD, '/myaccount')
  },
  paylink: {
    create: path(ROOTS_DASHBOARD, '/paylink/create-paylink'),
    track: path(ROOTS_DASHBOARD, '/paylink/track-paylink')
  },
  gc: {
    home: path(ROOTS_DASHBOARD, '/gc/home'),
    connect: path(ROOTS_DASHBOARD, '/gc/connect'),
    customer: path(ROOTS_DASHBOARD, '/gc/customer')
  },
  success: {
    root: path(ROOTS_DASHBOARD, '/success')
  },
  notification: {
    root: path(ROOTS_DASHBOARD, '/notifications')
  },
  reports: {
    root: path(ROOTS_DASHBOARD, '/reports')
  }
};

export const PATH_DOCS = 'https://docs-minimals.vercel.app/introduction';
