import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import client from '../../shared/api/client';

export const RegisterPage = () => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: { nickname: string; email: string; password: string }) =>
      client.post('/auth/register', data),
    onSuccess: () => setSuccess(true),
  });

  if (success) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-[#e8e2d9] p-8 text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h1 className="font-serif text-2xl font-bold text-[#1c1714] mb-2">Check your email!</h1>
          <p className="text-[#7a6f68] text-sm mb-5">We've sent a verification link to <strong>{email}</strong>.</p>
          <Link to="/login" className="text-[#5b63d3] font-medium hover:underline text-sm">Go to Login →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-[#e8e2d9] p-8">
        <h1 className="font-serif text-2xl font-bold text-[#1c1714] text-center mb-1">Join White Nights</h1>
        <p className="text-center text-[#7a6f68] text-sm mb-6">A home for book lovers</p>
        <form
          onSubmit={(e) => { e.preventDefault(); mutation.mutate({ nickname, email, password }); }}
          className="flex flex-col gap-3"
        >
          <input
            type="text" placeholder="Nickname" value={nickname}
            onChange={(e) => setNickname(e.target.value)} required
            className="w-full px-3 py-2.5 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:border-[#5b63d3] focus:ring-2 focus:ring-[#5b63d3]/20 bg-white transition"
          />
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
            {mutation.isPending ? 'Registering…' : 'Create account'}
          </button>
          {mutation.isError && (
            <p className="text-red-500 text-sm text-center">
              {(mutation.error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Registration failed'}
            </p>
          )}
        </form>
        <p className="mt-5 text-center text-[#7a6f68] text-sm">
          Already have an account? <Link to="/login" className="text-[#5b63d3] font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};
