'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PRESET_AVATARS } from '@/lib/game-data';
import ChatModal from './chat-modal';

function AvatarSmall({ profilePic, size = 'w-9 h-9' }: { profilePic: string | null; size?: string }) {
  if (!profilePic) {
    return <span className={`${size} rounded-full flex items-center justify-center text-base`} style={{ background: '#f97316' }}>🎮</span>;
  }
  const preset = PRESET_AVATARS.find((a: any) => a?.key === profilePic);
  if (preset) {
    return <span className={`${size} rounded-full flex items-center justify-center text-base`} style={{ background: preset.bg }}>{preset.emoji}</span>;
  }
  return <span className={`${size} rounded-full bg-gray-600 flex items-center justify-center text-base`}>🎮</span>;
}

function formatShort(iso: any): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('tr-TR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  } catch { return ''; }
}

export default function Inbox({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [chatFriend, setChatFriend] = useState<any>(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    fetch('/api/messages/conversations', { cache: 'no-store' })
      .then((r: any) => r?.json?.())
      .then((d: any) => {
        const list = d?.conversations ?? [];
        setConversations(list);
        setTotalUnread(list.reduce((s: number, c: any) => s + (c?.unreadCount ?? 0), 0));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, [user, load]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen((o) => !o); if (!open) load(); }}
        title="Gelen Kutusu"
        className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
      >
        <span className="text-lg">📩</span>
      </button>

      {totalUnread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-xs flex items-center justify-center text-white font-bold" style={{ background: '#ef4444' }}>
          {totalUnread}
        </span>
      )}

      {open && (
        <div
          className="absolute right-0 top-12 w-80 max-w-[90vw] rounded-xl shadow-2xl overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="px-4 py-3 font-bold text-sm" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>
            📩 Gelen Kutusu
          </div>
          <div className="max-h-96 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center text-sm py-8" style={{ color: 'var(--muted)' }}>Henüz konuşma yok</div>
            ) : (
              conversations.map((c: any) => (
                <button
                  key={c?.id}
                  onClick={() => { setChatFriend(c); setOpen(false); }}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-3 border-none cursor-pointer"
                  style={{ background: 'transparent', borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e: any) => { if (e?.currentTarget) e.currentTarget.style.background = 'var(--panel)'; }}
                  onMouseLeave={(e: any) => { if (e?.currentTarget) e.currentTarget.style.background = 'transparent'; }}
                >
                  <AvatarSmall profilePic={c?.profilePic} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm truncate" style={c?.role === 'admin' ? { color: '#ef4444' } : { color: 'var(--text)' }}>{c?.username}</span>
                      <span className="text-[10px] shrink-0" style={{ color: 'var(--muted)' }} suppressHydrationWarning>{formatShort(c?.lastMessageAt)}</span>
                    </div>
                    <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                      {c?.lastMessage ? `${c?.lastFromMe ? 'Sen: ' : ''}${c.lastMessage}` : 'Mesaj yok'}
                    </div>
                  </div>
                  {c?.unreadCount > 0 && (
                    <span className="min-w-5 h-5 px-1 rounded-full text-xs flex items-center justify-center text-white font-bold shrink-0" style={{ background: '#ef4444' }}>
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {chatFriend && (
        <ChatModal user={user} friend={chatFriend} onClose={() => { setChatFriend(null); load(); }} />
      )}
    </div>
  );
}
