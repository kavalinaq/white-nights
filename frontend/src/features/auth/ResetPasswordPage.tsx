import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import client from '../../shared/api/client';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [matchError, setMatchError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const mutation = useMutation({
    mutationFn: (data: { token: string; newPassword: string }) => client.post('/auth/password/reset', data),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) { setMatchError('Passwords do not match.'); return; }
    setMatchError('');
    mutation.mutate({ token, newPassword });
  };

  if (!token) return (
      <div className="flex justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-[#e2dcd5] p-12 text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="font-serif text-3xl font-bold text-[#1c1714] mb-3">Invalid link</h1>
          <p className="text-[#7a6f68] text-base mb-6">Missing reset token.</p>
          <Link to="/forgot-password" className="text-[#5b63d3] font-medium hover:underline text-sm">
            Request a new reset link
          </Link>
        </div>
      </div>
  );

  if (mutation.isSuccess) return (
      <div className="flex justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-[#e2dcd5] p-12 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="font-serif text-3xl font-bold text-[#1c1714] mb-3">Password changed!</h1>
          <p className="text-[#7a6f68] text-base mb-6">You can now log in with your new password.</p>
          <Link to="/login" className="text-[#5b63d3] font-medium hover:underline text-sm">
            Go to Login →
          </Link>
        </div>
      </div>
  );

  return (
      <div className="flex justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-[#e2dcd5] p-12">
          <h1 className="font-serif text-3xl font-bold text-[#1c1714] text-center mb-8">Set new password</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
                ref={inputRef}
                type="password"
                placeholder="New password (min 8 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:border-[#5b63d3] focus:ring-2 focus:ring-[#5b63d3]/20 bg-white transition"
            />
            <input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:border-[#5b63d3] focus:ring-2 focus:ring-[#5b63d3]/20 bg-white transition"
            />
            {matchError && <p className="text-red-500 text-sm">{matchError}</p>}
            <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-3 bg-[#5b63d3] hover:bg-[#4951c4] disabled:opacity-50 text-white rounded-lg text-sm font-semibold mt-2 cursor-pointer border-none transition"
            >
              {mutation.isPending ? 'Saving…' : 'Set password'}
            </button>
            {mutation.isError && (
                <p className="text-red-500 text-sm">
                  {(mutation.error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Reset failed. Link may have expired.'}
                </p>
            )}
          </form>
        </div>
      </div>
  );
};