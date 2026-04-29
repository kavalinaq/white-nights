import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import client from '../../shared/api/client';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');

  const mutation = useMutation({
    mutationFn: (data: { email: string }) => client.post('/auth/password/reset-request', data),
  });

  if (mutation.isSuccess) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-[#e8e2d9] p-8 text-center">
          <div className="text-4xl mb-3">✉️</div>
          <h1 className="font-serif text-xl font-bold text-[#1c1714] mb-2">Check your email</h1>
          <p className="text-[#7a6f68] text-sm mb-5">If an account with <strong>{email}</strong> exists, we've sent a reset link.</p>
          <Link to="/login" className="text-[#5b63d3] font-medium hover:underline text-sm">Back to Login →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-[#e8e2d9] p-8">
        <h1 className="font-serif text-xl font-bold text-[#1c1714] text-center mb-1">Reset password</h1>
        <p className="text-center text-[#7a6f68] text-sm mb-6">Enter your email to receive a reset link.</p>
        <form
          onSubmit={(e) => { e.preventDefault(); mutation.mutate({ email }); }}
          className="flex flex-col gap-3"
        >
          <input
            type="email" placeholder="Your email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
            className="w-full px-3 py-2.5 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:border-[#5b63d3] focus:ring-2 focus:ring-[#5b63d3]/20 bg-white transition"
          />
          <button
            type="submit" disabled={mutation.isPending}
            className="w-full py-2.5 bg-[#5b63d3] hover:bg-[#4951c4] disabled:opacity-50 text-white rounded-lg text-sm font-semibold mt-1 cursor-pointer border-none transition"
          >
            {mutation.isPending ? 'Sending…' : 'Send reset link'}
          </button>
          {mutation.isError && (
            <p className="text-red-500 text-sm text-center">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(mutation.error as any).response?.data?.detail || 'Something went wrong. Try again.'}
            </p>
          )}
        </form>
        <p className="mt-5 text-center text-sm">
          <Link to="/login" className="text-[#7a6f68] hover:text-[#5b63d3] transition-colors">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
};
