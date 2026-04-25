import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './shared/store/useAuthStore';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { VerifyPage } from './features/auth/VerifyPage';

const FeedPage = () => {
  const { user, logout } = useAuthStore();
  return (
    <div>
      <h1>Feed Page</h1>
      <p>Welcome, {user?.nickname}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      
      <Route 
        path="/" 
        element={isAuthenticated ? <FeedPage /> : <Navigate to="/login" />} 
      />
    </Routes>
  );
}

export default App;
