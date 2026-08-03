'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PRESET_AVATARS } from '@/lib/game-data';
import ConfirmModal from './confirm-modal';

function AvatarSmall({ profilePic, size = 'w-8 h-8' }: { profilePic: string | null; size?: string }) {
  if (!profilePic) {
    return <span className={`${size} rounded-full flex items-center justify-center text-lg`} style={{ background: '#f97316' }}>🎮</span>;
  }
  const preset = PRESET_AVATARS.find((a: any) => a?.key === profilePic);
  if (preset) {
    return <span className={`${size} rounded-full flex items-center justify-center text-lg`} style={{ background: preset.bg }}>{preset.emoji}</span>;
  }
  return <span className={`${size} rounded-full bg-gray-600 flex items-center justify-center text-lg`}>🎮</span>;
}

function formatTime(iso: any): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function ChatModal({ user, friend, onClose }: { user: any; friend: any; onClose: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    fetch(`/api/messages?friendId=${friend?.id}`)
      .then((r: any) => r?.json?.())
      .then((d: any) => setMessages(d?.messages ?? []))
      .catch(() => {});
  }, [friend?.id]);

  useEffect(() => {
    load();
    const iv = setInterval(load, 3000);
    return () => clearInterval(iv);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: friend?.id, content }),
      });
      const d = await res.json();
      if (res.ok && d?.message) {
        setMessages((prev) => [...prev, d.message]);
        setText('');
      }
    } catch {}
    setSending(false);
  };

  const clearChat = async () => {
    setClearConfirm(false);
    try {
      await fetch(`/api/messages?friendId=${friend?.id}`, { method: 'DELETE' });
      setMessages([]);
    } catch {}
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md h-[70vh] sm:h-[75vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 h-14 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <AvatarSmall profilePic={friend?.profilePic} size="w-8 h-8" />
            <span className="font-semibold text-sm" style={friend?.role === 'admin' ? { color: '#ef4444' } : { color: 'var(--text)' }}>{friend?.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setClearConfirm(true)}
              title="Mesajları Temizle"
              className="text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer"
              style={{ background: 'var(--panel)', color: '#ef4444', border: '1px solid var(--border)' }}
            >
              🗑️ Temizle
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full border-none cursor-pointer" style={{ background: 'var(--panel)', color: 'var(--text)' }}>✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {messages.length === 0 ? (
            <div className="text-center text-sm py-8" style={{ color: 'var(--muted)' }}>Henüz mesaj yok. Selam ver! 👋</div>
          ) : (
            messages.map((m: any) => {
              const mine = m?.senderId === user?.id;
              return (
                <div key={m?.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  <div
                    className="max-w-[75%] px-3 py-2 rounded-2xl text-sm break-words"
                    style={{
                      background: mine ? 'var(--accent)' : 'var(--panel)',
                      color: mine ? '#000' : 'var(--text)',
                      border: mine ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    {m?.content}
                  </div>
                  <span className="text-[10px] mt-0.5 px-1" style={{ color: 'var(--muted)' }} suppressHydrationWarning>
                    {formatTime(m?.createdAt)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 p-3 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            placeholder="Mesaj yaz..."
            className="form-input flex-1"
          />
          <button onClick={send} disabled={sending} className="btn-accent !w-auto !mt-0 !px-5">Gönder</button>
        </div>
      </div>

      <ConfirmModal
        open={clearConfirm}
        title="Mesajları Temizle"
        message="Bu konuşmadaki tüm mesajlar silinecek. Emin misiniz?"
        onConfirm={clearChat}
        onCancel={() => setClearConfirm(false)}
        confirmText="Evet, Temizle"
      />
    </div>
  );
}
