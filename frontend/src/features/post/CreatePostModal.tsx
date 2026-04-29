import { useState } from 'react';
import { useCreatePost } from './hooks/usePostMutations';

interface Props { onClose: () => void; }

export function CreatePostModal({ onClose }: Props) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const createPost = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagNames = tagInput.split(',').map((t) => t.trim()).filter(Boolean);
    await createPost.mutateAsync({ title, author, description, tagNames, image });
    onClose();
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-[#e8e2d9] bg-white text-sm focus:outline-none focus:border-[#5b63d3] focus:ring-2 focus:ring-[#5b63d3]/20 transition";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="font-serif text-xl font-bold text-[#1c1714] mb-5">New post</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input placeholder="Book title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} className={inputCls} />
          <input placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} required maxLength={120} className={inputCls} />
          <textarea placeholder="Your review or quote" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className={inputCls + ' resize-y'} />
          <input placeholder="Tags (comma-separated)" value={tagInput} onChange={(e) => setTagInput(e.target.value)} className={inputCls} />
          <div>
            <label className="text-xs text-[#7a6f68] mb-1 block">Cover image (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className="text-sm text-[#7a6f68] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#e8e2d9] file:bg-white file:text-sm file:cursor-pointer hover:file:border-[#5b63d3]" />
          </div>
          {createPost.error && (
            <p className="text-red-500 text-sm">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(createPost.error as any).response?.data?.detail || 'Failed to create post'}
            </p>
          )}
          <div className="flex gap-2 justify-end mt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#e8e2d9] bg-white text-sm text-[#7a6f68] cursor-pointer hover:border-[#5b63d3] transition">
              Cancel
            </button>
            <button type="submit" disabled={createPost.isPending}
              className="px-4 py-2 rounded-lg bg-[#5b63d3] hover:bg-[#4951c4] text-white text-sm font-semibold border-none cursor-pointer transition disabled:opacity-50">
              {createPost.isPending ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
