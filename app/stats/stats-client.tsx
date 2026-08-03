'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '@/app/components/theme-provider';
import Navbar from '@/app/components/navbar';
import { GAMES } from '@/lib/game-data';

const GAME_ICONS: Record<string, string> = {
  americano: '🧮',
  'kura-cek': '🎲',
  lig: '🏟️',
  somali: '🎴',
  'dartbot-v1': '🤖',
  'dart-turnuva': '🏆',
  'dart-mac': '⚔️',
};

const GAME_LABELS: Record<string, string> = {};
(GAMES as any[]).forEach((g) => { GAME_LABELS[g.slug] = g.name; });

function fmt(iso: any): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul',
    });
  } catch { return '-'; }
}

function SavedMatches({ gameName }: { gameName: string }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const router = useRouter();

  const load = () => {
    fetch(`/api/games/sessions?gameName=${gameName}`, { cache: 'no-store' })
      .then((r: any) => r?.json?.())
      .then((d: any) => setSessions(Array.isArray(d?.sessions) ? d.sessions : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [gameName]);

  const remove = async (id: string) => {
    try {
      await fetch(`/api/games/sessions/${id}`, { method: 'DELETE' });
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {}
  };

  const saveEdit = async (id: string) => {
    const name = editName.trim();
    if (!name) { setEditingId(null); return; }
    try {
      await fetch(`/api/games/sessions/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
    } catch {}
    setEditingId(null);
  };

  if (loading) {
    return <div className="text-xs py-3 text-center" style={{ color: 'var(--muted)' }}>Yükleniyor...</div>;
  }
  if (sessions.length === 0) {
    return <div className="text-xs py-3 text-center" style={{ color: 'var(--muted)' }}>Bu oyunda kayıtlı maç yok</div>;
  }

  return (
    <div className="flex flex-col gap-2 pt-1">
      {sessions.map((s: any) => (
        <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--panel)' }}>
          <div className="min-w-0 flex-1">
            {editingId === s.id ? (
              <input
                autoFocus
                value={editName}
                onChange={(e: any) => setEditName(e.target.value)}
                onBlur={() => saveEdit(s.id)}
                onKeyDown={(e: any) => { if (e.key === 'Enter') saveEdit(s.id); if (e.key === 'Escape') setEditingId(null); }}
                className="form-input !py-1 !text-sm"
                maxLength={60}
              />
            ) : (
              <>
                <div className="font-semibold text-sm truncate">{s.name}</div>
                <div className="text-[11px]" style={{ color: 'var(--muted)' }} suppressHydrationWarning>
                  Oluşturuldu: {fmt(s.createdAt)}
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => router.push(`/games/${s.gameName}?session=${s.id}`)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border-none shrink-0"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            ▶️ Aç
          </button>
          <button
            onClick={() => { setEditingId(s.id); setEditName(s.name); }}
            className="px-2 py-1.5 rounded-lg text-xs cursor-pointer shrink-0"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
            title="Yeniden adlandır"
          >✏️</button>
          <button
            onClick={() => remove(s.id)}
            className="px-2 py-1.5 rounded-lg text-xs cursor-pointer shrink-0"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none' }}
            title="Sil"
          >🗑️</button>
        </div>
      ))}
    </div>
  );
}

export default function StatsClient({ user }: { user: any }) {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetch('/api/stats')
      .then((r: any) => r?.json?.())
      .then((d: any) => setStats(d?.stats ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const totalPlays = (stats ?? []).reduce((sum: number, s: any) => sum + (s?.playCount ?? 0), 0);

  return (
    <ThemeProvider initialTheme={user?.theme}>
      {user && <Navbar user={user} />}
      <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in">
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-sm flex items-center gap-1 bg-transparent border-none cursor-pointer"
          style={{ color: 'var(--muted)' }}
        >
          ← Ana Sayfa
        </button>

        <h1 className="text-center text-2xl font-bold mb-6">📊 İstatistikler</h1>

        {!user ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔒</div>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              İstatistikler için giriş yapın
            </p>
            <button className="btn-accent max-w-xs mx-auto !mt-4" onClick={() => router.push('/auth/login')}>
              Giriş Yap
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 rounded-full mx-auto" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (stats?.length ?? 0) === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🎮</div>
            <p style={{ color: 'var(--muted)' }}>Henüz oyun oynamadınız</p>
          </div>
        ) : (
          <>
            <div className="game-card mb-6 text-center !cursor-default">
              <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{totalPlays}</div>
              <div className="text-sm" style={{ color: 'var(--muted)' }}>Toplam Oyun</div>
            </div>

            <p className="text-xs text-center mb-3" style={{ color: 'var(--muted)' }}>
              Kayıtlı maçları görmek için bir oyuna dokunun
            </p>

            <div className="space-y-3">
              {(stats ?? []).map((s: any) => {
                const isOpen = expanded === s?.gameName;
                return (
                  <div key={s?.id} className="game-card !cursor-default">
                    <button
                      onClick={() => setExpanded(isOpen ? null : s?.gameName)}
                      className="w-full flex items-center gap-4 bg-transparent border-none cursor-pointer p-0 text-left"
                    >
                      <span className="text-2xl">{GAME_ICONS[s?.gameName ?? ''] ?? '🎮'}</span>
                      <div className="flex-1">
                        <div className="font-semibold">{GAME_LABELS[s?.gameName] ?? s?.gameName}</div>
                        <div className="text-xs" style={{ color: 'var(--muted)' }} suppressHydrationWarning>
                          Son: {s?.lastPlayed ? fmt(s.lastPlayed) : '-'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{s?.playCount ?? 0}</div>
                        <div className="text-xs" style={{ color: 'var(--muted)' }}>kez</div>
                      </div>
                      <span className="text-sm ml-1" style={{ color: 'var(--muted)' }}>{isOpen ? '▲' : '▼'}</span>
                    </button>
                    {isOpen && (
                      <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                        <SavedMatches gameName={s?.gameName} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
