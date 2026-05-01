import { create } from 'zustand';

const STORAGE_KEY = 'chat_last_seen';

function loadFromStorage(): Record<number, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

interface UnreadState {
  lastSeenAt: Record<number, string>;
  markRead: (chatId: number) => void;
}

export const useUnreadStore = create<UnreadState>((set) => ({
  lastSeenAt: loadFromStorage(),
  markRead: (chatId) =>
    set((state) => {
      const updated = { ...state.lastSeenAt, [chatId]: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { lastSeenAt: updated };
    }),
}));

export function isUnread(
  lastMessage: { sentAt: string; senderNickname: string } | null,
  chatId: number,
  currentNickname: string | undefined,
  lastSeenAt: Record<number, string>,
): boolean {
  if (!lastMessage) return false;
  if (lastMessage.senderNickname === currentNickname) return false;
  const seenAt = lastSeenAt[chatId];
  if (!seenAt) return true;
  return new Date(lastMessage.sentAt) > new Date(seenAt);
}
