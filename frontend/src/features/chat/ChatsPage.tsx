import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChats, useCreateChat, useDeleteChat, type ChatMessage, type ChatPreview } from './hooks/useChats';
import { useMessages } from './hooks/useMessages';
import { useChatSocket } from './hooks/useChatSocket';
import { useAuthStore } from '../../shared/store/useAuthStore';
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

  const activeChat = chats?.find((c) => c.chatId === activeId);

  const handleNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewChatError('');
    try {
      const profileRes = await client.get(`/users/${peerNickname.trim()}`);
      const peerId: number = profileRes.data.userId;
      const result = await createChat.mutateAsync({ peerId });
      setPeerNickname(''); setShowNewChat(false);
      navigate(`/chat/${result.data.chatId}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      setNewChatError(msg || 'User not found or error starting chat.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)] max-w-5xl mx-auto border-x border-[#e8e2d9]">
      {/* Sidebar */}
      <aside className={`w-72 flex-shrink-0 border-r border-[#e8e2d9] bg-white flex flex-col ${activeId ? 'hidden sm:flex' : 'flex'}`}>
        <div className="px-4 py-3 border-b border-[#e8e2d9] flex items-center justify-between">
          <h3 className="font-serif font-bold text-[#1c1714]">Messages</h3>
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
            <input
              autoFocus value={peerNickname} onChange={(e) => setPeerNickname(e.target.value)}
              placeholder="Enter @username…" required
              className="w-full px-3 py-2 rounded-lg border border-[#e8e2d9] bg-[#faf7f2] text-sm focus:outline-none focus:border-[#5b63d3] focus:ring-2 focus:ring-[#5b63d3]/20 transition"
            />
            {newChatError && <p className="text-red-500 text-xs">{newChatError}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowNewChat(false)}
                className="flex-1 py-2 rounded-lg border border-[#e8e2d9] text-sm text-[#7a6f68] cursor-pointer transition hover:border-[#5b63d3]">
                Cancel
              </button>
              <button type="submit" disabled={createChat.isPending || !peerNickname.trim()}
                className="flex-1 py-2 rounded-lg bg-[#5b63d3] hover:bg-[#4951c4] text-white text-sm font-medium border-none cursor-pointer transition disabled:opacity-50">
                {createChat.isPending ? 'Starting…' : 'Start'}
              </button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-[#f3ede4] rounded-lg animate-pulse" />
              ))}
            </div>
          )}
          {!isLoading && chats?.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-[#b0a9a1] gap-2">
              <span className="text-3xl">💬</span>
              <p className="text-xs">No conversations yet</p>
            </div>
          )}
          {chats?.map((chat) => (
            <ChatListItem key={chat.chatId} chat={chat} isActive={activeId === chat.chatId}
              onClick={() => navigate(`/chat/${chat.chatId}`)} />
          ))}
        </div>
      </aside>

      {/* Main area */}
      <section className="flex-1 flex flex-col bg-[#faf7f2] min-w-0">
        {activeId ? (
          <ChatView key={activeId} chatId={activeId} chatName={activeChat?.name ?? `Chat ${activeId}`} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#7a6f68] gap-3">
            <span className="text-5xl">💬</span>
            <p className="text-sm font-medium">Select a conversation</p>
            <p className="text-xs text-[#b0a9a1]">or start a new one with + New</p>
          </div>
        )}
      </section>
    </div>
  );
}

function ChatListItem({ chat, isActive, onClick }: { chat: ChatPreview; isActive: boolean; onClick: () => void }) {
  const lastText = chat.lastMessage
    ? (chat.lastMessage.isDeleted ? '[deleted]' : chat.lastMessage.text)
    : null;

  const initials = (chat.name ?? '?').slice(0, 2).toUpperCase();

  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-3 text-left border-none border-b border-[#f3ede4] cursor-pointer transition flex items-center gap-3
        ${isActive ? 'bg-[#eef0ff]' : 'bg-white hover:bg-[#faf7f2]'}`}
    >
      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold
        ${isActive ? 'bg-[#5b63d3] text-white' : 'bg-[#e8e2d9] text-[#7a6f68]'}`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold truncate ${isActive ? 'text-[#5b63d3]' : 'text-[#2d2926]'}`}>
          {chat.name || `Chat ${chat.chatId}`}
        </div>
        {lastText && (
          <div className="text-xs text-[#b0a9a1] truncate">{lastText}</div>
        )}
        {!lastText && (
          <div className="text-xs text-[#b0a9a1] italic">No messages yet</div>
        )}
      </div>
    </button>
  );
}

function ChatView({ chatId, chatName }: { chatId: number; chatName: string }) {
  const { items: history, hasMore, loadMore, isFetching } = useMessages(chatId);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const deleteChat = useDeleteChat();

  const { connected, sendMessage } = useChatSocket(chatId, (msg) => {
    setLiveMessages((prev) => [...prev, msg]);
  });

  const allMessages = [...history].reverse().concat(liveMessages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [chatId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText('');
  };

  const handleDelete = async () => {
    if (!confirm('Delete this chat for everyone? This cannot be undone.')) return;
    await deleteChat.mutateAsync(chatId);
    navigate('/chat');
  };

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-[#e8e2d9] flex items-center gap-3 shadow-sm">
        <button
          onClick={() => navigate('/chat')}
          className="sm:hidden text-[#7a6f68] hover:text-[#5b63d3] bg-transparent border-none cursor-pointer text-lg leading-none transition"
        >
          ←
        </button>
        <div className="w-8 h-8 rounded-full bg-[#e8e2d9] flex items-center justify-center text-xs font-bold text-[#7a6f68] flex-shrink-0">
          {chatName.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-[#1c1714] truncate">{chatName}</div>
          <div className={`text-xs ${connected ? 'text-green-500' : 'text-[#b0a9a1]'}`}>
            {connected ? 'Online' : 'Connecting…'}
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleteChat.isPending}
          className="text-xs text-[#b0a9a1] hover:text-red-500 bg-transparent border-none cursor-pointer transition disabled:opacity-50 flex-shrink-0"
          title="Delete chat"
        >
          🗑
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {hasMore && (
          <button onClick={() => loadMore()} disabled={isFetching}
            className="self-center px-4 py-1.5 text-xs rounded-full border border-[#e8e2d9] bg-white text-[#7a6f68] cursor-pointer hover:border-[#5b63d3] transition disabled:opacity-50">
            {isFetching ? 'Loading…' : 'Load older messages'}
          </button>
        )}

        {allMessages.length === 0 && !isFetching && (
          <div className="flex-1 flex flex-col items-center justify-center text-[#b0a9a1] gap-2 py-16">
            <span className="text-4xl">👋</span>
            <p className="text-sm">No messages yet — say hello!</p>
          </div>
        )}

        {allMessages.map((m) => {
          const isOwn = m.senderNickname === user?.nickname;
          return (
            <div key={m.messageId} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[72%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                isOwn
                  ? 'bg-[#5b63d3] text-white rounded-br-sm'
                  : 'bg-white border border-[#e8e2d9] text-[#2d2926] rounded-bl-sm'
              }`}>
                {!isOwn && (
                  <div className="text-[11px] font-semibold text-[#5b63d3] mb-0.5">@{m.senderNickname}</div>
                )}
                <div className="text-sm break-words leading-relaxed">
                  {m.isDeleted
                    ? <i className={isOwn ? 'opacity-60 text-xs' : 'text-[#b0a9a1] text-xs'}>[message deleted]</i>
                    : m.text}
                </div>
                <div className={`text-[10px] mt-1 leading-none ${isOwn ? 'text-white/50 text-right' : 'text-[#b0a9a1]'}`}>
                  {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#e8e2d9] flex gap-2 items-center">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={connected ? 'Type a message…' : 'Connecting…'}
          disabled={!connected}
          className="flex-1 px-4 py-2.5 rounded-full border border-[#e8e2d9] bg-[#faf7f2] text-sm focus:outline-none focus:border-[#5b63d3] focus:ring-2 focus:ring-[#5b63d3]/20 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!connected || !text.trim()}
          className="w-10 h-10 rounded-full bg-[#5b63d3] hover:bg-[#4951c4] text-white flex items-center justify-center border-none cursor-pointer transition disabled:opacity-40 flex-shrink-0 text-base"
        >
          ↑
        </button>
      </form>
    </>
  );
}
