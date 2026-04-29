import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSavedPosts, useChangePassword, useSendSupport, useDeleteAccount } from './hooks/useSettings';
import { PostCard } from '../../shared/components/PostCard';
import { useAuthStore } from '../../shared/store/useAuthStore';

type Tab = 'saved' | 'password' | 'support' | 'account';

const TABS: { key: Tab; label: string }[] = [
  { key: 'saved', label: 'Saved posts' },
  { key: 'password', label: 'Password' },
  { key: 'support', label: 'Support' },
  { key: 'account', label: 'Account' },
];

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>('saved');

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h2 className="font-serif text-2xl font-bold text-[#1c1714] mb-5">Settings</h2>

      <div className="flex gap-1 border-b border-[#e8e2d9] mb-6">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-none cursor-pointer transition bg-transparent
              ${tab === key ? 'text-[#5b63d3] border-b-2 border-[#5b63d3]' : 'text-[#7a6f68] hover:text-[#2d2926]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'saved' && <SavedPostsTab />}
      {tab === 'password' && <PasswordTab />}
      {tab === 'support' && <SupportTab />}
      {tab === 'account' && <AccountTab />}
    </div>
  );
}

function SavedPostsTab() {
  const { items, hasMore, loadMore, isLoading, isFetching } = useSavedPosts();
  if (isLoading) return <p className="text-[#7a6f68] text-sm">Loading…</p>;
  if (items.length === 0) return (
    <div className="text-center py-12 text-[#7a6f68]">
      <div className="text-4xl mb-3">🔖</div>
      <p className="text-sm">You haven't saved any posts yet.</p>
    </div>
  );
  return (
    <>
      <div className="space-y-4">{items.map((post) => <PostCard key={post.postId} post={post} />)}</div>
      {hasMore && (
        <button onClick={() => loadMore()} disabled={isFetching}
          className="mt-5 w-full py-2.5 rounded-xl border border-[#e8e2d9] bg-white text-sm text-[#7a6f68] hover:border-[#5b63d3] cursor-pointer transition disabled:opacity-50">
          {isFetching ? 'Loading…' : 'Load more'}
        </button>
      )}
    </>
  );
}

function PasswordTab() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [done, setDone] = useState(false);
  const change = useChangePassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await change.mutateAsync({ currentPassword: current, newPassword: next });
    setCurrent(''); setNext(''); setDone(true);
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-[#e8e2d9] bg-white text-sm focus:outline-none focus:border-[#5b63d3] focus:ring-2 focus:ring-[#5b63d3]/20 transition";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
      <input type="password" placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} required className={inputCls} />
      <input type="password" placeholder="New password (min 8 chars)" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} maxLength={100} className={inputCls} />
      {change.error && <p className="text-red-500 text-sm">{(change.error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to change password'}</p>}
      {done && <p className="text-green-600 text-sm">Password changed successfully.</p>}
      <button type="submit" disabled={change.isPending}
        className="px-5 py-2.5 bg-[#5b63d3] hover:bg-[#4951c4] text-white rounded-lg text-sm font-semibold border-none cursor-pointer transition disabled:opacity-50 self-start mt-1">
        {change.isPending ? 'Saving…' : 'Change password'}
      </button>
    </form>
  );
}

function SupportTab() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const send = useSendSupport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await send.mutateAsync({ subject, message });
    setSubject(''); setMessage(''); setDone(true);
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-[#e8e2d9] bg-white text-sm focus:outline-none focus:border-[#5b63d3] focus:ring-2 focus:ring-[#5b63d3]/20 transition";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-lg">
      <input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={200} className={inputCls} />
      <textarea placeholder="Describe your issue…" value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={5000} rows={6} className={inputCls + ' resize-y'} />
      {done && <p className="text-green-600 text-sm">Message sent. We'll get back to you soon.</p>}
      <button type="submit" disabled={send.isPending}
        className="px-5 py-2.5 bg-[#5b63d3] hover:bg-[#4951c4] text-white rounded-lg text-sm font-semibold border-none cursor-pointer transition disabled:opacity-50 self-start">
        {send.isPending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

function AccountTab() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const deleteAccount = useDeleteAccount();

  const handleDelete = async () => {
    if (!confirm('Delete your account? This cannot be undone.')) return;
    await deleteAccount.mutateAsync();
    logout(); navigate('/login');
  };

  return (
    <div className="max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <h3 className="font-serif font-bold text-red-700 mb-2">Danger zone</h3>
        <p className="text-sm text-red-600 mb-4">Deleting your account is permanent. All posts, comments, shelves, and chats will be removed.</p>
        <button onClick={handleDelete} disabled={deleteAccount.isPending}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold border-none cursor-pointer transition disabled:opacity-50">
          {deleteAccount.isPending ? 'Deleting…' : 'Delete my account'}
        </button>
      </div>
    </div>
  );
}
