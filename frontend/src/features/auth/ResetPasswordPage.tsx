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
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-[#e8e2d9] p-8 text-center">
        <div className="text-4xl mb-3">🔗</div>
        <h1 className="font-serif text-xl font-bold text-[#1c1714] mb-2">Invalid link</h1>
        <p className="text-[#7a6f68] text-sm mb-4">Missing reset token.</p>
        <Link to="/forgot-password" className="text-[#5b63d3] font-medium hover:underline text-sm">Request a new reset link</Link>
      </div>
    </div>
  );

  if (mutation.isSuccess) return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-[#e8e2d9] p-8 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h1 className="font-serif text-xl font-bold text-[#1c1714] mb-2">Password changed!</h1>
        <p className="text-[#7a6f68] text-sm mb-4">You can now log in with your new password.</p>
        <Link to="/login" className="text-[#5b63d3] font-medium hover:underline text-sm">Go to Login →</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-[#e8e2d9] p-8">
        <h1 className="font-serif text-xl font-bold text-[#1c1714] text-center mb-6">Set new password</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            ref={inputRef} type="password" placeholder="New password (min 8 chars)"
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required
            className="w-full px-3 py-2.5 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:border-[#5b63d3] focus:ring-2 focus:ring-[#5b63d3]/20 bg-white transition"
          />
          <input
            type="password" placeholder="Confirm new password"
            value={confirm} onChange={(e) => setConfirm(e.target.value)} required
            className="w-full px-3 py-2.5 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:border-[#5b63d3] focus:ring-2 focus:ring-[#5b63d3]/20 bg-white transition"
          />
          {matchError && <p className="text-red-500 text-sm">{matchError}</p>}
          <button
            type="submit" disabled={mutation.isPending}
            className="w-full py-2.5 bg-[#5b63d3] hover:bg-[#4951c4] disabled:opacity-50 text-white rounded-lg text-sm font-semibold mt-1 cursor-pointer border-none transition"
          >
            {mutation.isPending ? 'Saving…' : 'Set password'}
          </button>
          {mutation.isError && (
            <p className="text-red-500 text-sm">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(mutation.error as any).response?.data?.detail || 'Reset failed. Link may have expired.'}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
