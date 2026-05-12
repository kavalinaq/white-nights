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
        <div className="flex justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-[#e2dcd5] p-12 text-center">
            <div className="text-5xl mb-4">✉️</div>
            <h1 className="font-serif text-3xl font-bold text-[#1c1714] mb-3">Check your email</h1>
            <p className="text-[#7a6f68] text-base mb-6">
              If an account with <strong>{email}</strong> exists, we've sent a reset link.
            </p>
            <Link to="/login" className="text-[#5b63d3] font-medium hover:underline text-sm">
              Back to Login →
            </Link>
          </div>
        </div>
    );
  }

  return (
      <div className="flex justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-[#e2dcd5] p-12">
          <h1 className="font-serif text-3xl font-bold text-[#1c1714] text-center mb-3">RESET PASSWORD</h1>
          <p className="text-center text-[#7a6f68] text-base mb-8">
            Enter your email to receive a reset link.
          </p>
          <form
              onSubmit={(e) => { e.preventDefault(); mutation.mutate({ email }); }}
              className="flex flex-col gap-4"
          >
            <input
                type="email" placeholder="Your email" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:border-[#5b63d3] focus:ring-2 focus:ring-[#5b63d3]/20 bg-white transition"
            />
            <button
                type="submit" disabled={mutation.isPending}
                className="w-full py-3 bg-[#5b63d3] hover:bg-[#4951c4] disabled:opacity-50 text-white rounded-lg text-sm font-semibold mt-2 cursor-pointer border-none transition"
            >
              {mutation.isPending ? 'Sending…' : 'Send reset link'}
            </button>
            {mutation.isError && (
                <p className="text-red-500 text-sm text-center">
                  {(mutation.error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Something went wrong. Try again.'}
                </p>
            )}
          </form>
          <p className="mt-8 text-center text-sm">
            <Link to="/login" className="text-[#7a6f68] hover:text-[#5b63d3] transition-colors">
              ← Back to Login
            </Link>
          </p>
        </div>
      </div>
  );
};