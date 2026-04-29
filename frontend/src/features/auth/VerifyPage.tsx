import { useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import client from '../../shared/api/client';

export const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const hasRun = useRef(false);
  const mutation = useMutation({
    mutationFn: (t: string) => client.post(`/auth/verify?token=${t}`),
  });

  useEffect(() => {
    if (token && !hasRun.current) {
      hasRun.current = true;
      mutation.mutate(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const wrap = (icon: string, title: string, body: React.ReactNode) => (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-[#e8e2d9] p-8 text-center">
        <div className="text-4xl mb-3">{icon}</div>
        <h1 className="font-serif text-xl font-bold text-[#1c1714] mb-3">{title}</h1>
        <div className="text-[#7a6f68] text-sm space-y-2">{body}</div>
      </div>
    </div>
  );

  if (mutation.isPending) return wrap('⏳', 'Verifying your account…', <p>Please wait a moment.</p>);
  if (mutation.isSuccess) return wrap('✅', 'Email verified!', <><p>You can now log in to your account.</p><Link to="/login" className="inline-block mt-3 text-[#5b63d3] font-medium hover:underline">Go to Login →</Link></>);
  if (mutation.isError) return wrap('❌', 'Verification failed', <><p>{(mutation.error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Invalid or expired token.'}</p><Link to="/register" className="inline-block mt-3 text-[#5b63d3] font-medium hover:underline">Register again</Link></>);
  return wrap('🔗', 'Missing token', <p>No verification token found in the URL.</p>);
};
