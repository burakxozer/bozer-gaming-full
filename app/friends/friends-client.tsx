'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '@/app/components/theme-provider';
import Navbar from '@/app/components/navbar';
import SettingsWidget from '@/app/components/settings-widget';
import ConfirmModal from '@/app/components/confirm-modal';
import ChatModal from '@/app/components/chat-modal';
import { PRESET_AVATARS } from '@/lib/game-data';

const GAME_ICONS: Record<string, string> = {
  americano: '🧮',
  'kura-cek': '🎲',
  lig: '🏟️',
  somali: '🎴',
  'dartbot-v1': '🤖',
  'dart-turnuva': '🏆',
  'dart-mac': '⚔️',
};

function AvatarSmall({ profilePic, size = 'w-10 h-10' }: { profilePic: string | null; size?: string }) {
  if (!profilePic) {
    return <span className={`${size} rounded-full flex items-center justify-center text-lg`} style={{ background: '#f97316' }}>🎮</span>;
  }
  const preset = PRESET_AVATARS.find((a: any) => a?.key === profilePic);
  if (preset) {
    return <span className={`${size} rounded-full flex items-center justify-center text-lg`} style={{ background: preset.bg }}>{preset.emoji}</span>;
  }
  return <span className={`${size} rounded-full bg-gray-600 flex items-center justify-center text-lg`}>🎮</span>;
}

function FriendsContent({ user }: { user: any }) {
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState<'friends' | 'requests'>('friends');
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatFriend, setChatFriend] = useState<any>(null);
  const router = useRouter();

  const loadFriends = useCallback(() => {
    fetch('/api/friends')
      .then((r: any) => r?.json?.())
      .then((d: any) => setFriends(d?.friends ?? []))
      .catch(() => {});
  }, []);

  const loadRequests = useCallback(() => {
    fetch('/api/friends/requests')
      .then((r: any) => r?.json?.())
      .then((d: any) => setRequests(d?.requests ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([loadFriends(), loadRequests()]).finally(() => setLoading(false));
    const interval = setInterval(() => { loadFriends(); loadRequests(); }, 5000);
    return () => clearInterval(interval);
  }, [loadFriends, loadRequests]);

  const sendRequest = async () => {
    if (!username.trim()) return;
    setMessage('');
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error ?? 'Hata oluştu');
        return;
      }
      setMessage('İstek gönderildi!');
      setUsername('');
    } catch {
      setMessage('Hata oluştu');
    }
  };

  const handleRequest = async (id: string, action: string) => {
    await fetch(`/api/friends/request/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    loadRequests();
    if (action === 'accept') loadFriends();
  };

  const removeFriend = async (friendId: string) => {
    await fetch(`/api/friends/${friendId}`, { method: 'DELETE' });
    setRemoveConfirm(null);
    loadFriends();
  };

  return (
    <>
      <Navbar user={user} />
      <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in">
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-sm flex items-center gap-1 bg-transparent border-none cursor-pointer"
          style={{ color: 'var(--muted)' }}
        >
          ← Ana Sayfa
        </button>

        <h1 className="text-center text-2xl font-bold mb-6">👥 Arkadaşlar</h1>

        <div className="game-card mb-6">
          <h3 className="text-base font-semibold mb-3">Arkadaş Ekle</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Kullanıcı adı"
              value={username}
              onChange={(e: any) => setUsername(e?.target?.value ?? '')}
              className="form-input flex-1"
              onKeyDown={(e: any) => { if (e?.key === 'Enter') sendRequest(); }}
            />
            <button onClick={sendRequest} className="btn-accent !w-auto !mt-0 !px-6">Gönder</button>
          </div>
          {message && (
            <p className="text-sm mt-2" style={{ color: message.includes('İstek') ? 'var(--accent)' : '#ef4444' }}>
              {message}
            </p>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('friends')}
            className="flex-1 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer"
            style={{
              background: tab === 'friends' ? 'var(--accent)' : 'var(--panel)',
              color: tab === 'friends' ? '#000' : 'var(--text)',
              border: tab !== 'friends' ? '1px solid var(--border)' : 'none',
            }}
          >
            Arkadaşlar ({friends?.length ?? 0})
          </button>
          <button
            onClick={() => setTab('requests')}
            className="flex-1 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer"
            style={{
              background: tab === 'requests' ? 'var(--accent)' : 'var(--panel)',
              color: tab === 'requests' ? '#000' : 'var(--text)',
              border: tab !== 'requests' ? '1px solid var(--border)' : 'none',
            }}
          >
            İstekler ({requests?.length ?? 0})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 rounded-full mx-auto" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : tab === 'friends' ? (
          (friends?.length ?? 0) === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">👥</div>
              <p style={{ color: 'var(--muted)' }}>Henüz arkadaşın yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(friends ?? []).map((f: any) => (
                <div key={f?.id} className="game-card !cursor-default flex items-center gap-3">
                  <div className="relative">
                    <AvatarSmall profilePic={f?.profilePic} />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                      style={{ background: f?.online ? '#22c55e' : '#6b7280', borderColor: 'var(--card)' }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm" style={f?.role === 'admin' ? { color: '#ef4444' } : undefined}>{f?.username}</div>
                    {f?.activeGame ? (
                      <div className="text-xs" style={{ color: 'var(--accent)' }}>
                        {GAME_ICONS[f?.activeGame?.gameName] ?? '🎮'} {f?.activeGame?.gameLabel ?? f?.activeGame?.gameName} oynuyor
                      </div>
                    ) : (
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>
                        {f?.online ? 'Çevrimiçi' : 'Çevrimdışı'}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {f?.activeGame && (
                      <button
                        onClick={() => router.push(`/watch/${f?.id}`)}
                        className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer font-semibold"
                        style={{ background: 'var(--accent)', color: '#000' }}
                      >
                        👁️ İzle
                      </button>
                    )}
                    <button
                      onClick={() => setChatFriend(f)}
                      className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer font-semibold"
                      style={{ background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--border)' }}
                    >
                      💬 Mesaj
                    </button>
                    <button
                      onClick={() => setRemoveConfirm(f?.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer"
                      style={{ background: '#ef4444', color: '#fff' }}
                    >
                      Kaldır
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          (requests?.length ?? 0) === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✉️</div>
              <p style={{ color: 'var(--muted)' }}>Bekleyen istek yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(requests ?? []).map((r: any) => (
                <div key={r?.id} className="game-card !cursor-default flex items-center gap-3">
                  <AvatarSmall profilePic={r?.sender?.profilePic} />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{r?.sender?.username}</div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>Arkadaşlık isteği</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRequest(r?.id, 'accept')}
                      className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer font-semibold"
                      style={{ background: 'var(--accent)', color: '#000' }}
                    >
                      Kabul
                    </button>
                    <button
                      onClick={() => handleRequest(r?.id, 'reject')}
                      className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer"
                      style={{ background: '#ef4444', color: '#fff' }}
                    >
                      Reddet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <ConfirmModal
        open={!!removeConfirm}
        title="Arkadaş Kaldır"
        message="Bu kişiyi arkadaş listenden kaldırmak istiyor musun?"
        onConfirm={() => { if (removeConfirm) removeFriend(removeConfirm); }}
        onCancel={() => setRemoveConfirm(null)}
        confirmText="Evet, Kaldır"
      />

      {chatFriend && (
        <ChatModal user={user} friend={chatFriend} onClose={() => setChatFriend(null)} />
      )}

      <SettingsWidget />
    </>
  );
}

export default function FriendsClient({ user }: { user: any }) {
  return (
    <ThemeProvider initialTheme={user?.theme}>
      <FriendsContent user={user} />
    </ThemeProvider>
  );
}