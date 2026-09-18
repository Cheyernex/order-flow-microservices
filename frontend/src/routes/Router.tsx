// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';

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

const Error = Loadable(lazy(() => import('../views/authentication/Error')));

const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/', exact: true, element: <DashboardView /> },
      { path: '/catalog', element: <CatalogView /> },
      { path: '/orders/new', element: <CreateOrderView /> },
      { path: '/orders', element: <OrdersView /> },
      { path: '/payments', element: <PaymentsView /> },
      { path: '/observability', element: <ObservabilityView /> },
      { path: '*', element: <Navigate to="/404" /> },
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
