import { Suspense, lazy } from 'react';
import { Navigate, useRoutes, useLocation } from 'react-router-dom';
// layouts
import MainLayout from '../layouts/main';
import DashboardLayout from '../layouts/dashboard';
import LogoOnlyLayout from '../layouts/LogoOnlyLayout';
// guards
import GCAuthGuard from '../guards/GCAuthGuard';
import GuestGuard from '../guards/GuestGuard';
import AuthGuard from '../guards/AuthGuard';
// import RoleBasedGuard from '../guards/RoleBasedGuard';
// components
import LoadingScreen from '../components/LoadingScreen';
// ----------------------------------------------------------------------

const Loadable = (Component: any) => (props: any) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();
  const isDashboard = pathname.includes('/dashboard');

  return (
    <Suspense
      fallback={
        <LoadingScreen
          sx={{
            ...(!isDashboard && {
              top: 0,
              left: 0,
              width: 1,
              zIndex: 9999,
              position: 'fixed'
            })
          }}
        />
      }
    >
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            // <GuestGuard>
            <Login />
            // </GuestGuard>
          )
        },
        {
          path: 'register',
          element: (
            // <GuestGuard>
            <Register />
            // </GuestGuard>
          )
        },
        { path: 'login-unprotected', element: <Login /> },
        { path: 'register-unprotected', element: <Register /> },
        { path: 'reset-password', element: <ResetPassword /> },
        { path: 'verify', element: <VerifyCode /> },
        // Blink Routes
        {
          path: 'account/activate',
          element: <Activate />
        }
      ]
    },

    // Dashboard Routes
    {
      path: 'app',
      element: (
        // <AuthGuard>
        <DashboardLayout />
        // </AuthGuard>
      ),
      children: [
        { path: '/', element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <GeneralApp /> },
        { path: 'support', element: <SupportPage /> },
        { path: 'analytics', element: <AnalyticsContainer /> },
        {
          path: 'user',
          children: [
            { path: '/', element: <Navigate to="list" replace /> },
            { path: 'list', element: <UserList /> },
            { path: 'new', element: <UserCreate /> },
            { path: '/:name/edit', element: <UserCreate /> },
            { path: 'account/:userSub', element: <UserAccount /> }
          ]
        },
        // blink routes
        {
          path: 'notifications',
          element: <Notifications />
        },
        {
          path: 'virtual-terminal',
          children: [
            { path: '/:section', element: <VirtualTerminal /> },
            { path: '/:section/:id', element: <VirtualTerminal /> }
          ]
        },
        {
          path: 'transactions',
          children: [
            { path: '/:section', element: <Transactions /> },
            { path: '/:section/:id', element: <Transactions /> },
            { path: '/:section/:id/:subid', element: <Transactions /> }
          ]
        },
        {
          path: 'bankreconciliation',
          children: [{ path: '/', element: <BankReconciliation /> }]
        },
        {
          path: 'blink-pages',
          children: [
            {
              path: '/',
              element: <Navigate to="all" replace />
            },
            {
              path: 'all',
              element: <BlinkPages />
            },
            {
              path: 'customiser',
              element: <BlinkCustomiser />
            }
          ]
        },
        {
          path: 'settings',
          element: <UserAccount />
        },
        {
          path: 'myaccount',
          element: <MyAccount />
        },
        {
          path: 'paylink/:section',
          element: <Paylink />
        },
        {
          path: 'gc',
          children: [
            { path: '/', element: <Navigate to="/app/gc/home" replace /> },
            {
              path: 'home',
              element: (
                // <GCAuthGuard>
                <GoCardless />
                // </GCAuthGuard>
              )
            },
            {
              path: 'customer/:id',
              element: (
                // <GCAuthGuard>
                <GoCardlessCustomer />
                // </GCAuthGuard>
              )
            },
            { path: 'connect', element: <GoCardlessConnect /> }
            // { path: 'connectgc', element: <GCConnectPage /> }
          ]
        },
        {
          path: 'reports',

          children: [
            {
              path: '/',
              element: <Reports />
            }
          ]
        }
      ]
    },
    // Public Form Routes

    { path: 'public/paylink/:token', element: <PublicPaylink /> },
    { path: 'public/blink/:urlSlug', element: <PublicBlinkPage /> },
    { path: 'public/transaction/success/:id', element: <SuccessPage /> },

    // Main Routes
    {
      path: '*',
      element: <LogoOnlyLayout />,
      children: [
        { path: 'maintenance', element: <Maintenance /> },
        { path: '500', element: <Page500 /> },
        { path: '404', element: <NotFound /> },
        { path: '/public/gc/confirm', element: <GoCardlessConfirm /> },
        { path: '/analytics/reports/download/:id', element: <PublicDownloadReport /> },
        { path: '*', element: <Navigate to="/404" replace /> }
      ]
    },
    {
      path: '/',
      element: <MainLayout />,
      children: [
        {
          path: '/',
          element: <Navigate to="/app/dashboard" replace />
        }
      ]
    },
    { path: '*', element: <Navigate to="/404" replace /> }
  ]);
}

// IMPORT COMPONENTS

// Authentication
const Login = Loadable(lazy(() => import('../pages/authentication/Login')));
const Register = Loadable(lazy(() => import('../pages/authentication/Register')));
const ResetPassword = Loadable(lazy(() => import('../pages/authentication/ResetPassword')));
const VerifyCode = Loadable(lazy(() => import('../pages/authentication/VerifyCode')));
// Dashboard
const GeneralApp = Loadable(lazy(() => import('../pages/dashboard/GeneralApp')));

const UserList = Loadable(lazy(() => import('../pages/dashboard/UserList')));
const UserAccount = Loadable(lazy(() => import('../pages/dashboard/UserAccount')));
const UserCreate = Loadable(lazy(() => import('../pages/dashboard/UserCreate')));

// Main
const Maintenance = Loadable(lazy(() => import('../pages/Maintenance')));
const Page500 = Loadable(lazy(() => import('../pages/Page500')));
const NotFound = Loadable(lazy(() => import('../pages/Page404')));
// Components

// BLINK COMPONENTS
const Activate = Loadable(lazy(() => import('../pages/authentication/Activate')));
const VirtualTerminal = Loadable(lazy(() => import('../pages/dashboard/VirtualTerminal')));
const MyAccount = Loadable(lazy(() => import('../pages/dashboard/MyAccount')));
const Transactions = Loadable(lazy(() => import('../pages/dashboard/Transactions')));
const Paylink = Loadable(lazy(() => import('../pages/dashboard/Paylink')));
const GoCardless = Loadable(lazy(() => import('../pages/dashboard/GoCardless')));
const GoCardlessConnect = Loadable(lazy(() => import('../pages/dashboard/GoCardlessConnect')));
const BankReconciliation = Loadable(lazy(() => import('../pages/dashboard/BankReconciliation')));
const SupportPage = Loadable(lazy(() => import('../pages/dashboard/SupportPage')));
const PublicPaylink = Loadable(lazy(() => import('../pages/PublicPaylinkPage')));
const BlinkPages = Loadable(lazy(() => import('../pages/dashboard/BlinkPages')));
const BlinkCustomiser = Loadable(lazy(() => import('../pages/dashboard/BlinkCustomiser')));
const PublicBlinkPage = Loadable(lazy(() => import('../pages/PublicBlinkPage')));

const GoCardlessConfirm = Loadable(lazy(() => import('../pages/GoCardlessConfirm')));

const GoCardlessCustomer = Loadable(lazy(() => import('../pages/dashboard/GoCardlessCustomer')));
const SuccessPage = Loadable(lazy(() => import('../pages/dashboard/SuccessPage')));
const Notifications = Loadable(lazy(() => import('../pages/dashboard/Notifications')));
const AnalyticsContainer = Loadable(lazy(() => import('../pages/dashboard/AnalyticsContainer')));
const Reports = Loadable(lazy(() => import('../pages/dashboard/Reports')));
const PublicDownloadReport = Loadable(lazy(() => import('../pages/PublicDownloadReport')));
