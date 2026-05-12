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
      <div className="flex justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-[#e2dcd5] p-12 text-center">
          <div className="text-5xl mb-4">{icon}</div>
          <h1 className="font-serif text-3xl font-bold text-[#1c1714] mb-3">{title}</h1>
          <div className="text-[#7a6f68] text-base space-y-3">{body}</div>
        </div>
      </div>
  );

  if (mutation.isPending) return wrap('⏳', 'Verifying your account…', <p>Please wait a moment.</p>);
  if (mutation.isSuccess) return wrap('✅', 'Email verified!', <><p>You can now log in to your account.</p><Link to="/login" className="inline-block mt-3 text-[#5b63d3] font-medium hover:underline">Go to Login →</Link></>);
  if (mutation.isError) return wrap('❌', 'Verification failed', <><p>{(mutation.error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Invalid or expired token.'}</p><Link to="/register" className="inline-block mt-3 text-[#5b63d3] font-medium hover:underline">Register again</Link></>);
  return wrap('🔗', 'Missing token', <p>No verification token found in the URL.</p>);
};