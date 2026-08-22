import { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopNav from './TopNav.jsx';
import BottomNav from './BottomNav.jsx';
import MobileNav from './MobileNav.jsx';
import SearchOverlay from './SearchOverlay.jsx';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';
import { NAV_ITEMS } from '../data.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useApi } from '../../lib/useApi.js';
import { THEME_KEY, getPreferredTheme, watchSystemTheme } from '../../lib/theme.js';
import '../../index.css';
import '../dashboard.css';

/* ============================================================
   Dashboard shell — sidebar, top bar, plain bottom bar, and the
   active route through <Outlet />.

   The first-visit tour and the account-opening gift modal are gone;
   nothing greets a client but their own balance.
   ============================================================ */
export default function DashboardLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Bumped after balance-changing actions so open pages refetch.
  const [walletVersion, setWalletVersion] = useState(0);
  const bumpWallet = () => setWalletVersion((v) => v + 1);

  const { data: accountData } = useApi('/api/accounts', [walletVersion]);
  const checkingBalance = accountData?.accounts?.find((a) => a.kind === 'cash')?.balance ?? 0;

  /* Light is the default; the toggle stores an override that then wins.
     The attribute sits on <html> so fixed overlays pick it up too, and is
     removed on unmount so the marketing site stays on paper. */
  const [theme, setTheme] = useState(getPreferredTheme);
  useEffect(() => {
    document.documentElement.setAttribute('data-dash-theme', theme);
    return () => document.documentElement.removeAttribute('data-dash-theme');
  }, [theme]);
  useEffect(() => watchSystemTheme(setTheme), []);
  const toggleTheme = () => setTheme((t) => {
    const next = t === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    return next;
  });

  // Deepest match wins, so nested paths beat the index route.
  const activeItem = [...NAV_ITEMS]
    .sort((a, b) => b.path.length - a.path.length)
    .find((n) => location.pathname === n.path || location.pathname.startsWith(n.path + '/'));
  const activeLabel = location.pathname === '/dashboard/kyc'
    ? 'Verification'
    : (activeItem?.label ?? 'Overview');

  useEffect(() => { setMobileNavOpen(false); }, [location.pathname]);

  // Identity verification stays mandatory before any money moves.
  const kycStatus = user?.kyc?.status || 'unverified';
  const needsKyc = user && user.role !== 'admin' && ['unverified', 'skipped', 'rejected'].includes(kycStatus);
  if (needsKyc && location.pathname !== '/dashboard/kyc') {
    return <Navigate to="/dashboard/kyc" replace />;
  }

  return (
    <div className="dash-shell">
      <Sidebar balance={checkingBalance} />

      <div className="min-w-0">
        <TopNav
          activeLabel={activeLabel}
          mobileNavOpen={mobileNavOpen}
          setMobileNavOpen={setMobileNavOpen}
          theme={theme}
          onToggleTheme={toggleTheme}
          onRefresh={bumpWallet}
          onSearch={() => setSearchOpen(true)}
        />
        <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} balance={checkingBalance} />

        <main className="dash-main-pad px-4 md:px-8 py-6 flex flex-col gap-5 max-w-[1240px]">
          <Suspense fallback={<LoadingScreen inline />}>
            <Outlet context={{ walletVersion, bumpWallet, theme }} />
          </Suspense>
        </main>
      </div>

      <BottomNav />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
