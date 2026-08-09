import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from './components/ui/LoadingScreen.jsx';
import { useAuth } from './auth/AuthContext.jsx';
import { ALL_TOPICS } from './pages/topics.js';

/* Route-level code splitting — each screen loads on demand, showing the
   branded loading state while its chunk is fetched. */
const Homepage = lazy(() => import('./Homepage.jsx'));
const Login = lazy(() => import('./auth/Login.jsx'));
const Register = lazy(() => import('./auth/Register.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const PricingPage = lazy(() => import('./pages/PricingPage.jsx'));
const Partners = lazy(() => import('./pages/Partners.jsx'));
const TopicPage = lazy(() => import('./pages/TopicPage.jsx'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage.jsx'));
const DashboardLayout = lazy(() => import('./dashboard/components/DashboardLayout.jsx'));
const Dashboard = lazy(() => import('./dashboard/Dashboard.jsx'));
const Account = lazy(() => import('./dashboard/pages/Account.jsx'));
const Invest = lazy(() => import('./dashboard/pages/Invest.jsx'));
const Withdrawal = lazy(() => import('./dashboard/pages/Withdrawal.jsx'));
const Funding = lazy(() => import('./dashboard/pages/Funding.jsx'));
const TransactionHistory = lazy(() => import('./dashboard/pages/TransactionHistory.jsx'));
const Referrals = lazy(() => import('./dashboard/pages/Referrals.jsx'));
const AccountSettings = lazy(() => import('./dashboard/pages/AccountSettings.jsx'));
const Kyc = lazy(() => import('./dashboard/pages/Kyc.jsx'));

/* Gate for authenticated routes — waits for session rehydration and
   bounces logged-out visitors to /login. */
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/* ============================================================
   Application routes.
   - Public:  Homepage, Login, Register, marketing/info pages
   - Dashboard shell (persistent nav, auth-gated) with nested pages:
     Overview, Account, Invest, Funding, Withdrawal, Activity,
     Referral, Settings — plus KYC, and redirects for the paths
     these screens replaced.
   ============================================================ */
export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* marketing / info pages */}
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/invest" element={<Navigate to="/invest/cash-management" replace />} />
        <Route path="/invest/:topic" element={<TopicPage topics={ALL_TOPICS} base="/invest" eyebrow="Investing" />} />
        <Route path="/resources" element={<Navigate to="/resources/help-center" replace />} />
        <Route path="/resources/:topic" element={<ResourcesPage />} />

        <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="account" element={<Account />} />
          <Route path="invest" element={<Invest />} />
          <Route path="withdrawal" element={<Withdrawal />} />
          <Route path="funding" element={<Funding />} />
          <Route path="activity" element={<TransactionHistory />} />
          <Route path="referral" element={<Referrals />} />
          <Route path="settings" element={<AccountSettings />} />
          <Route path="kyc" element={<Kyc />} />
          {/* retired paths — keep old links and bookmarks alive */}
          <Route path="accounts" element={<Navigate to="/dashboard/account" replace />} />
          <Route path="holdings" element={<Navigate to="/dashboard/account" replace />} />
          <Route path="portfolio" element={<Navigate to="/dashboard/account" replace />} />
          <Route path="transfers" element={<Navigate to="/dashboard/account" replace />} />
          <Route path="deposit" element={<Navigate to="/dashboard/funding" replace />} />
          <Route path="transactions" element={<Navigate to="/dashboard/activity" replace />} />
          <Route path="referrals" element={<Navigate to="/dashboard/referral" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
