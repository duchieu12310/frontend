import { useEffect, useRef, useState } from 'react';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import NotFound from 'components/share/not.found';
import Loading from 'components/share/loading';
import LoginPage from 'pages/auth/login';
import RegisterPage from 'pages/auth/register';
import LayoutAdmin from 'components/admin/layout.admin';
import ProtectedRoute from 'components/share/protected-route.ts';
import Header from 'components/client/header.client';
import Footer from 'components/client/footer.client';
import HomePage from 'pages/home';
import styles from 'styles/app.module.scss';
import DashboardPage from './pages/admin/dashboard';
import CompanyPage from './pages/admin/company';
import CompanyRegistrationPage from './pages/admin/CompanyRegistrationPage';
import PermissionPage from './pages/admin/permission';
import ResumePage from './pages/admin/resume';
import RolePage from './pages/admin/role';
import UserPage from './pages/admin/user';
import { fetchAccount } from './redux/slice/accountSlide';
import LayoutApp from './components/share/layout.app';
import ViewUpsertJob from './components/admin/job/upsert.job';
import ClientJobPage from './pages/job';
import ClientJobDetailPage from './pages/job/detail';
import ClientCompanyPage from './pages/company';
import ClientCompanyDetailPage from './pages/company/detail';
import ClientRegisterCompanyPage from './pages/register-company';
import JobTabs from './pages/admin/job/job.tabs';
import ClientBlogPage from './pages/blog';
import ClientBlogDetailPage from './pages/blog/detail';
import ChatBot from 'components/client/chatbot/ChatBot';
import GptChatBot from 'components/client/chatbot/GptChatBot';
import ChatBotPage from 'pages/chatbot';
import CVTemplatePage from './pages/admin/cv-template';
import ViewUpsertCVTemplate from './components/admin/cv-template/upsert.cv-template';
import ClientCVPage from './pages/cv';
import ViewUpsertCV from './pages/cv/upsert';
import ViewCV from './pages/cv/view';
import ClientAppliedJobsPage from './pages/applied-jobs';
import ClientChatPage from './pages/chat';
import AdminChatPage from './pages/admin/chat';
import AdminCVPage from './pages/admin/cv';
import EditRequestPage from './pages/admin/edit-request';
import SubscriptionPage from './pages/admin/subscription';
import PaymentResultPage from './pages/admin/subscription/payment-result';
import SubscriptionPackagePage from './pages/admin/subscription-package';
import SubscriptionOrderPage from './pages/admin/subscription-order';

const LayoutClient = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // if (rootRef && rootRef.current) {
    //   rootRef.current.scrollIntoView({ behavior: 'smooth' });
    // }

  }, [location]);

  return (
    <div
      className="layout-app"
      ref={rootRef}
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
      }}
    >
      {/* HEADER */}
      <Header />

      {/* MAIN CONTENT */}
      <main
        className={styles["content-app"]}
        style={{
          flex: 1,
          padding: "0 20px 30px 20px",
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          margin: "20px auto",
          width: "100%",
          maxWidth: "1280px",
          borderRadius: "12px",
        }}
      >
        <Outlet context={[searchTerm, setSearchTerm]} />
      </main>


      {/* FOOTER */}
      <Footer />
      <ChatBot />
      <GptChatBot />
    </div>
  );
};

export default function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(state => state.account.isLoading);


  useEffect(() => {
    if (
      window.location.pathname === '/login'
      || window.location.pathname === '/register'
    )
      return;
    dispatch(fetchAccount())
  }, [])

  const router = createBrowserRouter([
    {
      path: "/",
      element: (<LayoutApp><LayoutClient /></LayoutApp>),
      errorElement: <NotFound />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "job", element: <ClientJobPage /> },
        { path: "job/:id", element: <ClientJobDetailPage /> },
        { path: "company", element: <ClientCompanyPage /> },
        { path: "company/:id", element: <ClientCompanyDetailPage /> },
        { path: "blog", element: <ClientBlogPage /> },
        { path: "blog/:id", element: <ClientBlogDetailPage /> },
        { path: "chat-ai", element: <ChatBotPage /> },
        { path: "cv", element: <ClientCVPage /> },
        { path: "cv/upsert", element: <ViewUpsertCV /> },
        { path: "cv/view/:id", element: <ViewCV /> },
        {
          path: "applied-jobs",
          element: (
            <ProtectedRoute>
              <ClientAppliedJobsPage />
            </ProtectedRoute>
          )
        },
        {
          path: "chat",
          element: (
            <ProtectedRoute>
              <ClientChatPage />
            </ProtectedRoute>
          )
        },
        { path: "register-company", element: <ClientRegisterCompanyPage /> }
      ],
    },

    {
      path: "/admin",
      element: (<LayoutApp><LayoutAdmin /> </LayoutApp>),
      errorElement: <NotFound />,
      children: [
        {
          index: true, element:
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
        },
        {
          path: "company",
          element:
            <ProtectedRoute>
              <CompanyPage />
            </ProtectedRoute>
        },
        {
          path: "company-registration",
          element:
            <ProtectedRoute>
              <CompanyRegistrationPage />
            </ProtectedRoute>
        },
        {
          path: "user",
          element:
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
        },

        {
          path: "job",
          children: [
            {
              index: true,
              element: <ProtectedRoute><JobTabs /></ProtectedRoute>
            },
            {
              path: "upsert", element:
                <ProtectedRoute><ViewUpsertJob /></ProtectedRoute>
            }
          ]
        },

        {
          path: "resume",
          element:
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>
        },
        {
          path: "cv",
          element:
            <ProtectedRoute>
              <AdminCVPage />
            </ProtectedRoute>
        },
        {
          path: "cv-template",
          children: [
            {
              index: true,
              element: <ProtectedRoute><CVTemplatePage /></ProtectedRoute>
            },
            {
              path: "upsert",
              element: <ProtectedRoute><ViewUpsertCVTemplate /></ProtectedRoute>
            }
          ]
        },
        {
          path: "permission",
          element:
            <ProtectedRoute>
              <PermissionPage />
            </ProtectedRoute>
        },
        {
          path: "role",
          element:
            <ProtectedRoute>
              <RolePage />
            </ProtectedRoute>
        },
        {
          path: "edit-request",
          element:
            <ProtectedRoute>
              <EditRequestPage />
            </ProtectedRoute>
        },
        {
          path: "subscription",
          element:
            <ProtectedRoute>
              <SubscriptionPage />
            </ProtectedRoute>
        },
        {
          path: "payment-result",
          element:
            <ProtectedRoute>
              <PaymentResultPage />
            </ProtectedRoute>
        },
        {
          path: "subscription-package",
          element:
            <ProtectedRoute>
              <SubscriptionPackagePage />
            </ProtectedRoute>
        },
        {
          path: "subscription-order",
          element:
            <ProtectedRoute>
              <SubscriptionOrderPage />
            </ProtectedRoute>
        },
        {
          path: "chat",
          element: (
            <ProtectedRoute>
              <AdminChatPage />
            </ProtectedRoute>
          )
        }
      ],
    },


    {
      path: "/login",
      element: <LoginPage />,
    },

    {
      path: "/register",
      element: <RegisterPage />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}