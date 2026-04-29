import { useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
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

function NavBar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-[#e8e2d9] shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link to="/" className="font-serif font-bold text-[#5b63d3] text-lg tracking-tight">
          📖 White Nights
        </Link>
        <Link to="/" className="text-sm text-[#7a6f68] hover:text-[#5b63d3] transition-colors">Feed</Link>
        <Link to="/search" className="text-sm text-[#7a6f68] hover:text-[#5b63d3] transition-colors">Search</Link>
        {user && (
          <>
            <Link to={`/u/${user.nickname}/shelves`} className="text-sm text-[#7a6f68] hover:text-[#5b63d3] transition-colors">Shelves</Link>
            <Link to="/tracker" className="text-sm text-[#7a6f68] hover:text-[#5b63d3] transition-colors">Tracker</Link>
            <Link to="/chat" className="text-sm text-[#7a6f68] hover:text-[#5b63d3] transition-colors">Chat</Link>
          </>
        )}
        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <>
              <Link to={`/u/${user.nickname}`} className="text-sm font-medium text-[#2d2926] hover:text-[#5b63d3] transition-colors">@{user.nickname}</Link>
              <Link to="/settings" className="text-sm text-[#7a6f68] hover:text-[#5b63d3] transition-colors">Settings</Link>
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
              <Link to="/register" className="text-sm bg-[#5b63d3] text-white px-3 py-1.5 rounded-lg hover:bg-[#4951c4] transition-colors">Join</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const { checkAuth } = useAuthStore();
  useEffect(() => { checkAuth(); }, [checkAuth]);

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/u/:nickname" element={<ProfilePage />} />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/tags/:name" element={<TagPage />} />
        <Route path="/u/:nickname/shelves" element={<ShelvesPage />} />
        <Route path="/tracker" element={<PrivateRoute><TrackerPage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><ChatsPage /></PrivateRoute>} />
        <Route path="/chat/:id" element={<PrivateRoute><ChatsPage /></PrivateRoute>} />
        <Route path="/" element={<PrivateRoute><FeedPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
