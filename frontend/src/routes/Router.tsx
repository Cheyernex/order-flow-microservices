// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import ProtectedRoute from '../components/auth/ProtectedRoute';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// Microservices Views
const DashboardView = Loadable(lazy(() => import('../views/microservices/DashboardView')));
const CatalogView = Loadable(lazy(() => import('../views/microservices/CatalogView')));
const CreateOrderView = Loadable(lazy(() => import('../views/microservices/CreateOrderView')));
const OrdersView = Loadable(lazy(() => import('../views/microservices/OrdersView')));
const PaymentsView = Loadable(lazy(() => import('../views/microservices/PaymentsView')));
const ObservabilityView = Loadable(lazy(() => import('../views/microservices/ObservabilityView')));
const UsersView = Loadable(lazy(() => import('../views/microservices/UsersView')));

// Auth Views
const Login = Loadable(lazy(() => import('../views/authentication/auth2/Login')));
const Register = Loadable(lazy(() => import('../views/authentication/auth2/Register')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));

const Router = [
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <FullLayout />,
        children: [
          { path: '/', exact: true, element: <DashboardView /> },
          { path: '/catalog', element: <CatalogView /> },
          { path: '/orders/new', element: <CreateOrderView /> },
          { path: '/orders', element: <OrdersView /> },
          { path: '/payments', element: <PaymentsView /> },
          { path: '/users', element: <UsersView /> },
          { path: '/observability', element: <ObservabilityView /> },
          { path: '*', element: <Navigate to="/404" /> },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: '/auth/login', element: <Login /> },
      { path: '/auth/register', element: <Register /> },
      { path: '/auth/auth2/login', element: <Navigate to="/auth/login" replace /> },
      { path: '/auth/auth2/register', element: <Navigate to="/auth/register" replace /> },
      { path: '*', element: <Navigate to="/auth/login" replace /> },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '404', element: <Error /> },
      { path: '*', element: <Navigate to="/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router);

export default router;
