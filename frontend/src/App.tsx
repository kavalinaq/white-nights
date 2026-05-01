import { useEffect } from 'react';
import { Routes, Route, Navigate, Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from './shared/store/useAuthStore';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { VerifyPage } from './features/auth/VerifyPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { FeedPage } from './features/feed/FeedPage';
import { PostPage } from './features/post/PostPage';
import { SearchPage } from './features/search/SearchPage';
import { TagPage } from './features/tag/TagPage';
import { ShelvesPage } from './features/shelves/ShelvesPage';
import { TrackerPage } from './features/tracker/TrackerPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { ChatsPage } from './features/chat/ChatsPage';
import { ModerationPage } from './features/moderation/ModerationPage';

function TopBar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="h-14 bg-white border-b border-[#e8e2d9] shadow-sm flex items-center px-6 gap-4 flex-shrink-0 z-50">
      <span className="font-serif font-bold text-[#5b63d3] text-xl tracking-tight">📖 White Nights</span>
      <div className="ml-auto flex items-center gap-5">
        {user ? (
          <>
            <Link
              to={`/u/${user.nickname}`}
              className="text-sm font-semibold text-[#2d2926] hover:text-[#5b63d3] transition-colors"
            >
              @{user.nickname}
            </Link>
            <Link to="/settings" className="text-sm text-[#7a6f68] hover:text-[#5b63d3] transition-colors">
              Settings
            </Link>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="text-sm text-[#7a6f68] hover:text-[#5b63d3] bg-transparent border-none cursor-pointer p-0 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-[#7a6f68] hover:text-[#5b63d3] transition-colors">Login</Link>
            <Link
              to="/register"
              className="text-sm bg-[#5b63d3] text-white px-4 py-1.5 rounded-lg hover:bg-[#4951c4] transition-colors font-medium"
            >
              Join
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

function SideNav() {
  const { user } = useAuthStore();
  const cls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#eef0ff] text-[#5b63d3]'
        : 'text-[#7a6f68] hover:bg-[#f4f1ec] hover:text-[#2d2926]'
    }`;

  return (
    <aside className="w-56 flex-shrink-0 border-r border-[#e8e2d9] bg-white px-3 py-5 flex flex-col gap-1 overflow-y-auto">
      <NavLink to="/" end className={cls}>📰 Feed</NavLink>
      <NavLink to="/search" className={cls}>🔍 Search</NavLink>
      {user && (
        <>
          <NavLink to={`/u/${user.nickname}/shelves`} className={cls}>📚 Shelves</NavLink>
          <NavLink to="/tracker" className={cls}>📅 Tracker</NavLink>
          <NavLink to="/chat" className={cls}>💬 Chat</NavLink>
          {(user.role === 'moderator' || user.role === 'admin') && (
            <NavLink to="/moderation" className={cls}>🛡️ Moderation</NavLink>
          )}
        </>
      )}
    </aside>
  );
}

function AppShell() {
  return (
    <div className="flex flex-col h-screen bg-[#faf8f5]">
      <TopBar />
      <div className="flex flex-1 overflow-hidden min-h-0">
        <SideNav />
        <main className="flex-1 overflow-y-auto min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AuthShell() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col">
      <header className="h-14 bg-white border-b border-[#e8e2d9] flex items-center px-6 flex-shrink-0">
        <Link to="/" className="font-serif font-bold text-[#5b63d3] text-xl tracking-tight">📖 White Nights</Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <Outlet />
      </main>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const { checkAuth } = useAuthStore();
  useEffect(() => { checkAuth(); }, [checkAuth]);

  return (
    <Routes>
      <Route element={<AuthShell />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>
      <Route element={<AppShell />}>
        <Route path="/u/:nickname" element={<ProfilePage />} />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/tags/:name" element={<TagPage />} />
        <Route path="/u/:nickname/shelves" element={<ShelvesPage />} />
        <Route path="/tracker" element={<PrivateRoute><TrackerPage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><ChatsPage /></PrivateRoute>} />
        <Route path="/chat/:id" element={<PrivateRoute><ChatsPage /></PrivateRoute>} />
        <Route path="/moderation" element={<PrivateRoute><ModerationPage /></PrivateRoute>} />
        <Route path="/" element={<PrivateRoute><FeedPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

export default App;
