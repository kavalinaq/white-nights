import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePost } from './hooks/usePost';
import { useInteractions } from './hooks/useInteractions';
import { useComments } from './hooks/useComments';
import { useDeletePost } from './hooks/usePostMutations';
import { EditPostModal } from './EditPostModal';
import { useAuthStore } from '../../shared/store/useAuthStore';
import { Avatar } from '../../shared/components/Avatar';

export function PostPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const { data: post, isLoading } = usePost(postId);
  const { like, unlike, save, unsave, recordView } = useInteractions(postId);
  const { items: comments, hasMore, loadMore, isFetching: commentsFetching, addComment, deleteComment } = useComments(postId);
  const deletePost = useDeletePost();

  const [commentText, setCommentText] = useState('');
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (postId) recordView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-8 text-center text-[#7a6f68]">Loading…</div>;
  if (!post) return <div className="max-w-2xl mx-auto px-4 py-8 text-center text-[#7a6f68]">Post not found.</div>;

  const isMine = user?.nickname === post.authorInfo.nickname;

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    await deletePost.mutateAsync(postId);
    navigate('/');
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment.mutateAsync(commentText.trim());
    setCommentText('');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link to="/" className="text-sm text-[#7a6f68] hover:text-[#5b63d3] transition-colors">← Back to feed</Link>

      <article className="mt-4 bg-white rounded-2xl border border-[#e8e2d9] shadow-sm overflow-hidden">
        {post.imageUrl && (
          <img src={post.imageUrl} alt={post.title} className="w-full max-h-80 object-cover" />
        )}

        <div className="p-6">
          {/* Author + actions */}
          <div className="flex items-center gap-3 mb-5">
            <Link to={`/u/${post.authorInfo.nickname}`} className="flex items-center gap-2 no-underline">
              <Avatar src={post.authorInfo.avatarUrl} name={post.authorInfo.nickname} size="md" />
              <span className="font-semibold text-sm text-[#2d2926] hover:text-[#5b63d3] transition-colors">@{post.authorInfo.nickname}</span>
            </Link>
            <span className="text-xs text-[#7a6f68] ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
            {isMine && (
              <div className="flex gap-2">
                <button onClick={() => setShowEdit(true)}
                  className="px-3 py-1 text-xs rounded-lg border border-[#e8e2d9] bg-white text-[#7a6f68] cursor-pointer hover:border-[#5b63d3] transition">Edit</button>
                <button onClick={handleDelete} disabled={deletePost.isPending}
                  className="px-3 py-1 text-xs rounded-lg bg-red-500 hover:bg-red-600 text-white border-none cursor-pointer transition disabled:opacity-50">Delete</button>
              </div>
            )}
          </div>

          <h1 className="font-serif text-2xl font-bold text-[#1c1714] mb-1">{post.title}</h1>
          <p className="text-sm text-[#7a6f68] italic mb-4">{post.author}</p>
          <p className="text-sm leading-relaxed text-[#2d2926] mb-5">{post.description}</p>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {post.tags.map((tag) => (
                <Link key={tag.tagId} to={`/tags/${tag.name}`}
                  className="text-xs bg-[#eef0ff] text-[#5b63d3] px-2.5 py-0.5 rounded-full no-underline hover:bg-[#5b63d3] hover:text-white transition font-medium">
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {isAuthenticated && (
            <div className="flex gap-3 pb-5 border-b border-[#f3ede4]">
              <button
                onClick={() => post.liked ? unlike.mutate() : like.mutate()}
                disabled={like.isPending || unlike.isPending}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm border cursor-pointer transition disabled:opacity-50 ${post.liked ? 'bg-red-50 border-red-200 text-red-500 font-semibold' : 'bg-white border-[#e8e2d9] text-[#7a6f68] hover:border-red-200 hover:text-red-400'}`}
              >
                {post.liked ? '♥' : '♡'} {post.likeCount}
              </button>
              <button
                onClick={() => post.saved ? unsave.mutate() : save.mutate()}
                disabled={save.isPending || unsave.isPending}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm border cursor-pointer transition disabled:opacity-50 ${post.saved ? 'bg-amber-50 border-amber-200 text-amber-500 font-semibold' : 'bg-white border-[#e8e2d9] text-[#7a6f68] hover:border-amber-200 hover:text-amber-400'}`}
              >
                {post.saved ? '🔖 Saved' : '🏷️ Save'}
              </button>
              <span className="ml-auto text-xs text-[#7a6f68] self-center">👁 {post.viewCount} views</span>
            </div>
          )}

          {/* Comments */}
          <div className="mt-5">
            <h3 className="font-serif font-bold text-[#1c1714] mb-4">Comments ({post.commentCount})</h3>

            {isAuthenticated && (
              <form onSubmit={handleComment} className="flex gap-2 mb-5">
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment…" maxLength={2000}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#e8e2d9] bg-white text-sm focus:outline-none focus:border-[#5b63d3] focus:ring-2 focus:ring-[#5b63d3]/20 transition" />
                <button type="submit" disabled={addComment.isPending || !commentText.trim()}
                  className="px-4 py-2 rounded-lg bg-[#5b63d3] hover:bg-[#4951c4] text-white text-sm font-medium border-none cursor-pointer transition disabled:opacity-50">
                  Post
                </button>
              </form>
            )}

            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.commentId} className="bg-[#faf7f2] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar src={c.author.avatarUrl} name={c.author.nickname} size="sm" />
                    <Link to={`/u/${c.author.nickname}`} className="font-semibold text-sm no-underline text-[#2d2926] hover:text-[#5b63d3] transition-colors">
                      @{c.author.nickname}
                    </Link>
                    <span className="text-xs text-[#7a6f68]">{new Date(c.createdAt).toLocaleString()}</span>
                    {(user?.nickname === c.author.nickname || user?.role === 'moderator' || user?.role === 'admin') && (
                      <button onClick={() => deleteComment.mutate(c.commentId)}
                        className="ml-auto text-xs text-[#b0a9a1] hover:text-red-400 bg-transparent border-none cursor-pointer transition">✕</button>
                    )}
                  </div>
                  <p className="text-sm text-[#2d2926] m-0">{c.text}</p>
                </div>
              ))}
            </div>

            {hasMore && (
              <button onClick={() => loadMore()} disabled={commentsFetching}
                className="mt-4 w-full py-2 rounded-xl border border-[#e8e2d9] bg-white text-sm text-[#7a6f68] hover:border-[#5b63d3] cursor-pointer transition disabled:opacity-50">
                {commentsFetching ? 'Loading…' : 'Load more comments'}
              </button>
            )}
          </div>
        </div>
      </article>

      {showEdit && post && <EditPostModal post={post} onClose={() => setShowEdit(false)} />}
    </div>
  );
}
