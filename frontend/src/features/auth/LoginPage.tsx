import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../shared/api/client';
import { useAuthStore } from '../../shared/store/useAuthStore';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const mutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (data: any) => client.post('/auth/login', data),
    onSuccess: (response) => {
      const { accessToken, user } = response.data;
      setAuth(user, accessToken);
      navigate('/');
    },
  });

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-[#e8e2d9] p-8">
        <h1 className="font-serif text-2xl font-bold text-[#1c1714] text-center mb-6">Welcome back</h1>
        <form
          onSubmit={(e) => { e.preventDefault(); mutation.mutate({ email, password }); }}
          className="flex flex-col gap-3"
        >
          <input
            type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
            className="w-full px-3 py-2.5 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:border-[#5b63d3] focus:ring-2 focus:ring-[#5b63d3]/20 bg-white transition"
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required
            className="w-full px-3 py-2.5 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:border-[#5b63d3] focus:ring-2 focus:ring-[#5b63d3]/20 bg-white transition"
          />
          <button
            type="submit" disabled={mutation.isPending}
            className="w-full py-2.5 bg-[#5b63d3] hover:bg-[#4951c4] disabled:opacity-50 text-white rounded-lg text-sm font-semibold mt-1 cursor-pointer border-none transition"
          >
            {mutation.isPending ? 'Logging in…' : 'Login'}
          </button>
          {mutation.isError && (
            <p className="text-red-500 text-sm text-center">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(mutation.error as any).response?.data?.message || 'Login failed'}
            </p>
          )}
        </form>
        <div className="mt-5 text-center text-sm space-y-1.5">
          <div><Link to="/forgot-password" className="text-[#7a6f68] hover:text-[#5b63d3] transition-colors text-xs">Forgot password?</Link></div>
          <div className="text-[#7a6f68]">No account? <Link to="/register" className="text-[#5b63d3] font-medium hover:underline">Register</Link></div>
        </div>
      </div>
    </div>
  );
};
