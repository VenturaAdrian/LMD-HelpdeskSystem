import { lazy, Suspense } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import MainLayout from 'layouts/MainLayout';
import { Navigate } from 'react-router-dom';

// Lazy imports
const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));
const Typography = lazy(() => import('../views/ui-elements/basic/BasicTypography'));
const Color = lazy(() => import('../views/ui-elements/basic/BasicColor'));
const FeatherIcon = lazy(() => import('../views/ui-elements/icons/Feather'));
const FontAwesome = lazy(() => import('../views/ui-elements/icons/FontAwesome'));
const MaterialIcon = lazy(() => import('../views/ui-elements/icons/Material'));
const Login = lazy(() => import('../views/auth/login'));

const Sample = lazy(() => import('../views/sample'));


const CreateTicket = lazy(() => import('views/tickets/createticket'))
const OpenTicket = lazy(() => import('views/tickets/openticket'))
const Assets = lazy(() => import('views/assets'))
const Announcements = lazy(() => import('views/pages/announcements'));
const Knowledgebase = lazy(() => import('views/pages/knowledgebase'));
const Reports = lazy(() => import('views/pages/reports'));
const Alltickets = lazy(() => import('views/tickets/alltickets'));
const ViewTicket = lazy(() => import('views/tickets/viewticket'));
const Myticket = lazy(() => import('views/tickets/myticket'));
const Profile = lazy(() => import('views/pages/profile'));
const Register = lazy(() => import('views/auth/register'))



// Spinner fallback
const LoadingSpinner = (
  <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
    <Spinner animation="border" role="status" variant="primary">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

// Suspense wrapper
const withSpinner = (Component) => <Suspense fallback={LoadingSpinner}>{Component}</Suspense>;

const RoleAccess = () => {

  if (localStorage.getItem("user" === null)) {
    return <Navigate to="/" replace />
  } else {
    return <MainLayout />
  }
}

const MainRoutes = {
  path: '/',
  element: <RoleAccess />,
  children: [
    {
      path: '/dashboard/sales',
      element: withSpinner(<DashboardSales />)
    },
    {
      path: '/register',
      element: withSpinner(<Register />)
    },
    {
      path: '/typography',
      element: withSpinner(<Typography />)
    },
    {
      path: '/color',
      element: withSpinner(<Color />)
    },
    {
      path: '/icons/Feather',
      element: withSpinner(<FeatherIcon />)
    },
    {
      path: '/icons/font-awesome-5',
      element: withSpinner(<FontAwesome />)
    },
    {
      path: '/icons/material',
      element: withSpinner(<MaterialIcon />)
    },
    {
      path: '/sample-page',
      element: withSpinner(<Sample />)
    },
    {
      path: '/create-ticket',
      element: withSpinner(<CreateTicket />)
    },
    {
      path: '/open-ticket',
      element: withSpinner(<OpenTicket />)
    },
    {
      path: '/assets',
      element: withSpinner(<Assets />)
    },
    {
      path: '/announcements',
      element: withSpinner(<Announcements />)
    },
    {
      path: '/knowledgebase',
      element: withSpinner(<Knowledgebase />)
    },
    {
      path: '/reports',
      element: withSpinner(<Reports />)
    },
    {
      path: '/all-tickets',
      element: withSpinner(<Alltickets />)
    },
    {
      path: '/profile',
      element: withSpinner(<Profile />)
    },
    {
      path: '/my-ticket',
      element: withSpinner(<Myticket />)
    },
    {
      path: '/view-ticket',
      element: withSpinner(<ViewTicket />)
    },



  ]
};

export default MainRoutes;
