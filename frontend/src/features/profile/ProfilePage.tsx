import { useParams, useNavigate } from 'react-router-dom';
import { useProfile } from './hooks/useProfile';
import { useAuthStore } from '../../shared/store/useAuthStore';
import { useState } from 'react';
import { EditProfileModal } from './EditProfileModal';
import { useFollow, useFollowRequests } from './hooks/useFollow';
import { FollowRequestsModal } from './FollowRequestsModal';
import { FollowersModal } from './FollowersModal';
import { usePosts } from '../post/hooks/usePosts';
import { PostCard } from '../../shared/components/PostCard';
import { useCreateChat } from '../chat/hooks/useChats';

export const ProfilePage = () => {
  const { nickname } = useParams<{ nickname: string }>();
  const { data: profile, isLoading, error } = useProfile(nickname!);
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null);

  const { follow, unfollow } = useFollow(profile?.userId, profile?.nickname);
  const { data: requests } = useFollowRequests();
  const createChat = useCreateChat();

  const isSelf = currentUser?.nickname === profile?.nickname;
  const canSeePosts = isSelf || !profile?.isPrivate || profile?.followStatus === 'accepted';
  const { items: posts, hasMore, loadMore, isFetching } = usePosts(canSeePosts ? profile?.userId : undefined);
  const hasPendingRequests = isSelf && requests && requests.length > 0;

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-[#7a6f68]">Loading…</div>;
  if (error) return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-red-500">Error loading profile</div>;
  if (!profile) return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-[#7a6f68]">User not found</div>;

  const handleMessage = async () => {
    const result = await createChat.mutateAsync({ peerId: profile.userId });
    navigate(`/chat/${result.data.chatId}`);
  };

  const renderFollowButton = () => {
    if (isSelf) return null;
    if (profile.followStatus === 'accepted')
      return <button onClick={() => unfollow.mutate()} className="px-5 py-2 rounded-full border border-[#e8e2d9] bg-white text-sm font-medium text-[#7a6f68] cursor-pointer hover:border-red-300 hover:text-red-500 transition">Unfollow</button>;
    if (profile.followStatus === 'pending')
      return <button disabled className="px-5 py-2 rounded-full border border-[#e8e2d9] bg-white text-sm font-medium text-[#7a6f68] opacity-60 cursor-not-allowed">Requested</button>;
    return <button onClick={() => follow.mutate()} className="px-5 py-2 rounded-full bg-[#5b63d3] hover:bg-[#4951c4] text-white text-sm font-semibold border-none cursor-pointer transition">Follow</button>;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-[#e8e2d9] shadow-sm p-8 mb-6 text-center">
        {profile.avatarUrl
          ? <img src={profile.avatarUrl} alt={profile.nickname} className="w-24 h-24 rounded-full object-cover border-4 border-[#e8e2d9] mx-auto mb-4" />
          : <div className="w-24 h-24 rounded-full bg-[#e8e2d9] border-4 border-white mx-auto mb-4 flex items-center justify-center text-3xl text-[#7a6f68]">📚</div>
        }

        <h1 className="font-serif text-xl font-bold text-[#1c1714] mb-1">{profile.nickname}</h1>
        {profile.bio && <p className="text-sm text-[#7a6f68] mb-4 max-w-xs mx-auto">{profile.bio}</p>}

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-5">
          <div className="text-center">
            <div className="font-bold text-[#1c1714] text-lg">{profile.postCount}</div>
            <div className="text-xs text-[#7a6f68]">posts</div>
          </div>
          <button onClick={() => setFollowModal('followers')} className="text-center bg-transparent border-none cursor-pointer p-0 hover:opacity-70 transition">
            <div className="font-bold text-[#1c1714] text-lg">{profile.followerCount}</div>
            <div className="text-xs text-[#7a6f68]">followers</div>
          </button>
          <button onClick={() => setFollowModal('following')} className="text-center bg-transparent border-none cursor-pointer p-0 hover:opacity-70 transition">
            <div className="font-bold text-[#1c1714] text-lg">{profile.followingCount}</div>
            <div className="text-xs text-[#7a6f68]">following</div>
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-center flex-wrap">
          {isSelf ? (
            <>
              <button onClick={() => setIsEditModalOpen(true)} className="px-5 py-2 rounded-full border border-[#e8e2d9] bg-white text-sm font-medium text-[#2d2926] cursor-pointer hover:border-[#5b63d3] hover:text-[#5b63d3] transition">Edit Profile</button>
              {hasPendingRequests && (
                <button onClick={() => setIsRequestsModalOpen(true)} className="px-5 py-2 rounded-full bg-[#5b63d3] hover:bg-[#4951c4] text-white text-sm font-semibold border-none cursor-pointer transition">
                  Requests ({requests.length})
                </button>
              )}
            </>
          ) : (
            <>
              {renderFollowButton()}
              {currentUser && (
                <button onClick={handleMessage} disabled={createChat.isPending}
                  className="px-5 py-2 rounded-full border border-[#e8e2d9] bg-white text-sm font-medium text-[#2d2926] cursor-pointer hover:border-[#5b63d3] hover:text-[#5b63d3] transition disabled:opacity-50">
                  {createChat.isPending ? '…' : 'Message'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Posts */}
      {!canSeePosts ? (
        <div className="bg-white rounded-2xl border border-[#e8e2d9] p-10 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="font-serif font-bold text-[#1c1714] mb-1">Private Account</h3>
          <p className="text-sm text-[#7a6f68]">Follow to see their posts.</p>
        </div>
      ) : (
        <>
          {posts.length === 0 && !isFetching && (
            <div className="text-center py-12 text-[#7a6f68]">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-sm">No posts yet.</p>
            </div>
          )}
          <div className="space-y-4">
            {posts.map((post) => <PostCard key={post.postId} post={post} />)}
          </div>
          {hasMore && (
            <button onClick={() => loadMore()} disabled={isFetching}
              className="mt-5 w-full py-2.5 rounded-xl border border-[#e8e2d9] bg-white text-sm text-[#7a6f68] hover:border-[#5b63d3] hover:text-[#5b63d3] cursor-pointer transition disabled:opacity-50">
              {isFetching ? 'Loading…' : 'Load more'}
            </button>
          )}
        </>
      )}

      {isEditModalOpen && <EditProfileModal profile={profile} onClose={() => setIsEditModalOpen(false)} />}
      {isRequestsModalOpen && <FollowRequestsModal onClose={() => setIsRequestsModalOpen(false)} />}
      {followModal && <FollowersModal userId={profile.userId} initialTab={followModal} onClose={() => setFollowModal(null)} />}
    </div>
  );
};
