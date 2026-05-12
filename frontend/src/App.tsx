import { useEffect } from 'react';
import { Routes, Route, Navigate, Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useChats } from './features/chat/hooks/useChats';
import { useUnreadStore, isUnread } from './shared/store/useUnreadStore';
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
        <header className="relative h-16 bg-white border-b border-[#e8e2d9] shadow-sm flex items-center justify-end px-6 flex-shrink-0 z-50">
            <span className="absolute left-1/2 transform -translate-x-1/2 font-serif font-bold text-black text-4xl tracking-tight">
        WHITE NIGHTS
      </span>

            <div className="flex items-center gap-5">
                {user ? (
                    <>
                        <Link to={`/u/${user.nickname}`} className="text-sm font-semibold text-[#2d2926] hover:text-[#5b63d3] transition-colors">
                            @{user.nickname}
                        </Link>
                        <Link to="/settings" className="text-sm text-[#7a6f68] hover:text-[#5b63d3] transition-colors">
                            Settings
                        </Link>
                        <button onClick={() => { logout(); navigate('/login'); }}
                                className="text-sm text-[#7a6f68] hover:text-[#5b63d3] bg-transparent border-none cursor-pointer p-0 transition-colors">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-sm text-[#7a6f68] hover:text-[#5b63d3] transition-colors">Login</Link>
                        <Link to="/register" className="text-sm bg-[#5b63d3] text-white px-4 py-1.5 rounded-lg hover:bg-[#4951c4] transition-colors font-medium">
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
    const { data: chats } = useChats();
    const { lastSeenAt } = useUnreadStore();

    const unreadCount = user
        ? (chats ?? []).filter((c) => isUnread(c.lastMessage, c.chatId, user.nickname, lastSeenAt)).length
        : 0;

    const cls = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive
                ? 'bg-[#eef0ff] text-[#5b63d3]'
                : 'text-[#7a6f68] hover:bg-[#f4f1ec] hover:text-[#2d2926]'
        }`;

    return (
        <aside className="w-56 flex-shrink-0 border-r border-[#e8e2d9] bg-white flex flex-col h-full overflow-y-auto">
            <div className="flex-1 px-3 py-5 flex flex-col gap-1">
                <NavLink to="/" end className={cls}>📰 Feed</NavLink>
                <NavLink to="/search" className={cls}>🔍 Search</NavLink>
                {user && (
                    <>
                        <NavLink to={`/u/${user.nickname}/shelves`} className={cls}>📚 Shelves</NavLink>
                        <NavLink to="/tracker" className={cls}>📅 Tracker</NavLink>
                        <NavLink to="/chat" className={cls}>
                            <span>💬 Chat</span>
                            {unreadCount > 0 && (
                                <span className="ml-auto min-w-[18px] h-[18px] rounded-full bg-[#5b63d3] text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {unreadCount}
                </span>
                            )}
                        </NavLink>
                        {(user.role === 'moderator' || user.role === 'admin') && (
                            <NavLink to="/moderation" className={cls}>🛡️ Moderation</NavLink>
                        )}
                    </>
                )}
            </div>


            <div className="px-3 pb-4 mt-auto">
                <img
                    src="/footer-image.jpg"
                    alt="Footer decoration"
                    className="w-full rounded-lg opacity-80 hover:opacity-100 transition"
                />
            </div>
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
            <header className="bg-white border-b border-[#e8e2d9] py-3 flex-shrink-0">
                <div className="text-center px-4">
                    <h1 className="font-serif font-bold text-black text-5xl sm:text-6xl md:text-6xl tracking-tight">
                        WHITE NIGHTS
                    </h1>
                    <p className="text-sm text-[#7a6f68] mt-2 max-w-lg mx-auto">
                        To stop reading books means to stop thinking
                    </p>
                </div>
            </header>
            <main className="flex-1 flex justify-center pt-12 pb-12 px-4">
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
