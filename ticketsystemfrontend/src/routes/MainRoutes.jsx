import { lazy, Suspense } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import MainLayout from 'layouts/MainLayout';
import { Navigate } from 'react-router-dom';



// Lazy imports
const Typography = lazy(() => import('../views/ui-elements/basic/BasicTypography'));
const Color = lazy(() => import('../views/ui-elements/basic/BasicColor'));
const FeatherIcon = lazy(() => import('../views/ui-elements/icons/Feather'));
const FontAwesome = lazy(() => import('../views/ui-elements/icons/FontAwesome'));
const MaterialIcon = lazy(() => import('../views/ui-elements/icons/Material'));

const Register = lazy(() => import('views/auth/register'))
const Dashboard = lazy(() => import('views/dashboard'));
const Assets = lazy(() => import('views/assets'))

const Announcements = lazy(() => import('views/announcements'));
const InActiveAnnouncement = lazy(() => import('views/announcements/inactiveannouncement'));

const Knowledgebase = lazy(() => import('views/knowledgebase/knowledgebase'));
const Hardware = lazy(() => import('views/knowledgebase/hardware'));
const AHardware = lazy(() => import('views/knowledgebase/hardwarearchive'));
const Software = lazy(() => import('views/knowledgebase/software'));
const ASoftware = lazy(() => import('views/knowledgebase/softwarearchive'));
const Network = lazy(() => import('views/knowledgebase/network'));
const ANetwork = lazy(() => import('views/knowledgebase/networkarchive'));

const Reports = lazy(() => import('views/report/reports'));

const Tickets = lazy(() => import('views/tickets'))
const CreateTicket = lazy(() => import('views/tickets/createticket'))
const OpenTicket = lazy(() => import('views/tickets/openticket'))
const Alltickets = lazy(() => import('views/tickets/alltickets'));
const ViewTicket = lazy(() => import('views/tickets/viewticket'));
const ViewHDTicket = lazy(() => import('views/tickets/viewhdticket'));
const Myticket = lazy(() => import('views/tickets/myticket'));
const History = lazy(() => import('views/tickets/history'));


const AllTicketsByUser = lazy(() => import('views/report/allticketsbyuser'));
const AllTicketsBySite = lazy(() => import('views/report/allticketbysite'));
const AllTicketsByStatus = lazy(() => import('views/report/allticketsbystatus'));


const Profile = lazy(() => import('views/pages/profile'));
const Users = lazy(() => import('views/users'))
const UsersView = lazy(() => import('views/users/users-view'))




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
      path: '/sample',
      element: withSpinner(<AllTicketsByUser />)
    },
    {
      path: '/sample1',
      element: withSpinner(<AllTicketsBySite />)
    },
    {
      path: '/sample2',
      element: withSpinner(<AllTicketsByStatus />)
    },
    {
      path: '/dashboard',
      element: withSpinner(<Dashboard />)
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
      path: '/inactive-announcements',
      element: withSpinner(<InActiveAnnouncement />)
    },
    {
      path: '/knowledgebase',
      element: withSpinner(<Knowledgebase />)
    },
    {
      path: '/hardware',
      element: withSpinner(<Hardware />)
    },
    {
      path: '/hardwarearchive',
      element: withSpinner(<AHardware />)
    },
    {
      path: '/network',
      element: withSpinner(<Network />)
    },
    {
      path: '/networkarchive',
      element: withSpinner(<ANetwork />)
    },
    {
      path: '/software',
      element: withSpinner(<Software />)
    },
    {
      path: '/softwarearchive',
      element: withSpinner(<ASoftware />)
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
    {
      path: '/view-hd-ticket',
      element: withSpinner(<ViewHDTicket />)
    },
    {
      path: '/users',
      element: withSpinner(<Users />)
    },
    {
      path: '/users-view',
      element: withSpinner(<UsersView />)
    },
    {
      path: '/tickets',
      element: <Tickets />
    },
    {
      path: '/history',
      element: <History />
    }




  ]
};

export default MainRoutes;
