import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useChats, useCreateChat, type ChatMessage } from './hooks/useChats';
import { useMessages } from './hooks/useMessages';
import { useChatSocket } from './hooks/useChatSocket';
import client from '../../shared/api/client';

export function ChatsPage() {
  const { id } = useParams<{ id: string }>();
  const activeId = id ? Number(id) : undefined;
  const { data: chats, isLoading } = useChats();
  const navigate = useNavigate();

  const [showNewChat, setShowNewChat] = useState(false);
  const [peerNickname, setPeerNickname] = useState('');
  const [newChatError, setNewChatError] = useState('');
  const createChat = useCreateChat();

  const handleNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewChatError('');
    try {
      const profileRes = await client.get(`/users/${peerNickname.trim()}`);
      const peerId: number = profileRes.data.userId;
      const result = await createChat.mutateAsync({ peerId });
      setPeerNickname(''); setShowNewChat(false);
      navigate(`/chat/${result.data.chatId}`);
    } catch {
      setNewChatError('User not found or error starting chat.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)] max-w-5xl mx-auto">
      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 border-r border-[#e8e2d9] bg-white flex flex-col">
        <div className="px-4 py-3 border-b border-[#e8e2d9] flex items-center justify-between">
          <h3 className="font-serif font-bold text-[#1c1714]">Chats</h3>
          <button
            onClick={() => { setShowNewChat((v) => !v); setNewChatError(''); }}
            className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition
              ${showNewChat ? 'bg-[#5b63d3] border-[#5b63d3] text-white' : 'border-[#5b63d3] text-[#5b63d3] bg-white hover:bg-[#5b63d3] hover:text-white'}`}
          >
            + New
          </button>
        </div>

        {showNewChat && (
          <form onSubmit={handleNewChat} className="px-3 py-3 border-b border-[#e8e2d9] flex flex-col gap-2">
            <input autoFocus value={peerNickname} onChange={(e) => setPeerNickname(e.target.value)}
              placeholder="Enter username…" required
              className="w-full px-3 py-2 rounded-lg border border-[#e8e2d9] bg-[#faf7f2] text-sm focus:outline-none focus:border-[#5b63d3] focus:ring-2 focus:ring-[#5b63d3]/20 transition" />
            {newChatError && <p className="text-red-500 text-xs">{newChatError}</p>}
            <button type="submit" disabled={createChat.isPending || !peerNickname.trim()}
              className="py-2 rounded-lg bg-[#5b63d3] hover:bg-[#4951c4] text-white text-sm font-medium border-none cursor-pointer transition disabled:opacity-50">
              {createChat.isPending ? 'Starting…' : 'Start chat'}
            </button>
          </form>
        )}

        <div className="flex-1 overflow-y-auto">
          {isLoading && <p className="text-[#7a6f68] text-sm p-4">Loading…</p>}
          {chats?.length === 0 && <p className="text-[#7a6f68] text-sm p-4">No chats yet.</p>}
          {chats?.map((chat) => (
            <button key={chat.chatId} onClick={() => navigate(`/chat/${chat.chatId}`)}
              className={`w-full px-4 py-3 text-left border-none border-b border-[#f3ede4] cursor-pointer transition flex flex-col gap-0.5
                ${activeId === chat.chatId ? 'bg-[#eef0ff]' : 'bg-white hover:bg-[#faf7f2]'}`}
            >
              <div className={`text-sm font-semibold ${activeId === chat.chatId ? 'text-[#5b63d3]' : 'text-[#2d2926]'}`}>
                {chat.name || `Chat ${chat.chatId}`}
              </div>
              {chat.lastMessage && (
                <div className="text-xs text-[#7a6f68] truncate">{chat.lastMessage.text}</div>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Main area */}
      <section className="flex-1 flex flex-col bg-[#faf7f2]">
        {activeId ? <ChatView key={activeId} chatId={activeId} /> : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#7a6f68] gap-3">
            <span className="text-5xl">💬</span>
            <p className="text-sm">Select a chat or start a new one</p>
          </div>
        )}
      </section>
    </div>
  );
}

function ChatView({ chatId }: { chatId: number }) {
  const { items: history, hasMore, loadMore, isFetching } = useMessages(chatId);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { connected, sendMessage } = useChatSocket(chatId, (msg) => {
    setLiveMessages((prev) => [...prev, msg]);
  });

  const allMessages = [...history].reverse().concat(liveMessages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText('');
  };

  return (
    <>
      <div className="px-4 py-3 bg-white border-b border-[#e8e2d9] flex justify-between items-center">
        <Link to="/chat" className="text-sm text-[#7a6f68] hover:text-[#5b63d3] transition-colors">← All chats</Link>
        <span className={`text-xs font-medium ${connected ? 'text-green-500' : 'text-[#b0a9a1]'}`}>
          {connected ? '● Connected' : '○ Connecting…'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {hasMore && (
          <button onClick={() => loadMore()} disabled={isFetching}
            className="self-center px-3 py-1 text-xs rounded-full border border-[#e8e2d9] bg-white text-[#7a6f68] cursor-pointer hover:border-[#5b63d3] transition disabled:opacity-50">
            {isFetching ? 'Loading…' : 'Load older'}
          </button>
        )}
        {allMessages.map((m) => (
          <div key={m.messageId} className="max-w-[70%] bg-white rounded-xl px-3 py-2.5 shadow-sm border border-[#e8e2d9]">
            <div className="text-xs font-semibold text-[#5b63d3] mb-1">@{m.senderNickname}</div>
            <div className="text-sm text-[#2d2926] break-words">
              {m.isDeleted ? <i className="text-[#b0a9a1]">[deleted]</i> : m.text}
            </div>
            <div className="text-[10px] text-[#b0a9a1] mt-1">{new Date(m.sentAt).toLocaleTimeString()}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#e8e2d9] flex gap-2">
        <input
          value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…"
          className="flex-1 px-4 py-2.5 rounded-full border border-[#e8e2d9] bg-[#faf7f2] text-sm focus:outline-none focus:border-[#5b63d3] focus:ring-2 focus:ring-[#5b63d3]/20 transition"
        />
        <button type="submit" disabled={!connected || !text.trim()}
          className="px-5 py-2.5 rounded-full bg-[#5b63d3] hover:bg-[#4951c4] text-white text-sm font-medium border-none cursor-pointer transition disabled:opacity-40">
          Send
        </button>
      </form>
    </>
  );
}
