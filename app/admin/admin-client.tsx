'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '@/app/components/theme-provider';
import Navbar from '@/app/components/navbar';
import ConfirmModal from '@/app/components/confirm-modal';
import { PRESET_AVATARS, GAMES } from '@/lib/game-data';

const GAME_LABELS: Record<string, string> = {};
(GAMES as any[]).forEach((g) => { GAME_LABELS[g.slug] = g.name; });

function gameLabel(slug: string): string {
  return GAME_LABELS[slug] ?? slug;
}

function fmt(iso: any): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul',
    });
  } catch { return '-'; }
}

interface Member {
  id: string;
  username: string;
  email: string;
  profilePic: string | null;
  profilePicUrl: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  lastSeen: string | null;
  activeGame: { gameName: string; gameLabel: string; startedAt: string } | null;
  online: boolean;
}

function Avatar({ m }: { m: Member }) {
  const preset = m.profilePic ? PRESET_AVATARS.find((a: any) => a?.key === m.profilePic) : null;
  if (preset) {
    return (
      <span className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0" style={{ background: preset.bg }}>
        {preset.emoji}
      </span>
    );
  }
  if (m.profilePicUrl) {
    return (
      <img src={m.profilePicUrl} alt={m.username} className="w-11 h-11 rounded-full object-cover shrink-0"
        onError={(e: any) => { if (e?.target) e.target.style.display = 'none'; }} />
    );
  }
  return (
    <span className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0" style={{ background: '#f97316' }}>🎮</span>
  );
}

function StatsModal({ memberId, onClose }: { memberId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${memberId}/stats`, { cache: 'no-store' })
      .then((r: any) => r?.json?.())
      .then((d: any) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [memberId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card !max-w-md w-full" onClick={(e: any) => e?.stopPropagation?.()}>
        <button className="absolute top-3 right-4 bg-transparent border-none text-xl cursor-pointer" style={{ color: 'var(--muted)' }} onClick={onClose}>✕</button>
        {loading ? (
          <p className="text-center py-8" style={{ color: 'var(--muted)' }}>Yükleniyor...</p>
        ) : !data?.user ? (
          <p className="text-center py-8" style={{ color: 'var(--muted)' }}>Bulunamadı</p>
        ) : (
          <>
            <h3 className="mt-0 mb-1 text-lg" style={{ color: data.user.role === 'admin' ? '#ef4444' : 'var(--text)' }}>
              {data.user.username}{data.user.role === 'admin' ? ' 👑' : ''}
            </h3>
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }} suppressHydrationWarning>{data.user.email}</p>
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }} suppressHydrationWarning>Kayıt: {fmt(data.user.createdAt)}</p>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }} suppressHydrationWarning>Son giriş: {fmt(data.user.lastSeen)}</p>

            <div className="flex gap-3 mb-4">
              <div className="flex-1 game-card !p-3 text-center !cursor-default">
                <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{data.totalPlays ?? 0}</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>Toplam Oyun</div>
              </div>
              <div className="flex-1 game-card !p-3 text-center !cursor-default">
                <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{data.savedCount ?? 0}</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>Kayıtlı Oyun</div>
              </div>
            </div>

            {(data.stats?.length ?? 0) === 0 ? (
              <p className="text-center text-sm py-4" style={{ color: 'var(--muted)' }}>Henüz oyun oynamamış</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.stats.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'var(--panel)' }}>
                    <span className="text-sm font-semibold">{gameLabel(s.gameName)}</span>
                    <span className="text-sm" style={{ color: 'var(--accent)' }}>{s.playCount} kez</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AdminContent({ user }: { user: any }) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [statsMemberId, setStatsMemberId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      if (!res.ok) { if (res.status === 403 || res.status === 401) router.push('/'); return; }
      const d = await res.json();
      setMembers(Array.isArray(d?.users) ? d.users : []);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let stopped = false;
    const run = async () => { if (!stopped) await load(); };
    run();
    const iv = setInterval(run, 5000);
    return () => { stopped = true; clearInterval(iv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const doDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch {}
  };

  const totalOnline = members.filter((m) => m.online).length;

  return (
    <>
      <Navbar user={user} />
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-sm flex items-center gap-1 bg-transparent border-none cursor-pointer"
          style={{ color: 'var(--muted)' }}
        >
          ← Ana Sayfa
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">🛡️ Yönetici Paneli</h1>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>
            {members.length} üye · <span style={{ color: '#22c55e' }}>{totalOnline} çevrimiçi</span>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-10" style={{ color: 'var(--muted)' }}>Yükleniyor...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {members.map((m) => {
              const isAdmin = m.role === 'admin';
              return (
                <div key={m.id} className="game-card !p-4 flex items-center gap-3 !cursor-default">
                  <div className="relative shrink-0">
                    <Avatar m={m} />
                    <span
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                      style={{ background: m.online ? '#22c55e' : '#6b7280', borderColor: 'var(--card)' }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setStatsMemberId(m.id)}
                        className="font-bold truncate bg-transparent border-none cursor-pointer p-0 text-left hover:underline"
                        style={{ color: isAdmin ? '#ef4444' : 'var(--accent)' }}
                        title="İstatistikleri gör"
                      >
                        {m.username}{isAdmin ? ' 👑' : ''}
                      </button>
                      {isAdmin && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                          Yönetici
                        </span>
                      )}
                    </div>
                    <div className="text-xs truncate" style={{ color: 'var(--muted)' }} suppressHydrationWarning>
                      {m.email}
                    </div>
                    {m.activeGame ? (
                      <div className="text-xs mt-0.5" style={{ color: 'var(--accent)' }}>
                        🎮 {gameLabel(m.activeGame.gameName)} oynuyor
                      </div>
                    ) : null}
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }} suppressHydrationWarning>
                      Son giriş: {fmt(m.lastSeen)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs" style={{ color: m.online ? '#22c55e' : 'var(--muted)' }}>
                      {m.online ? 'Çevrimiçi' : 'Çevrimdışı'}
                    </span>
                    {!isAdmin && (
                      <button
                        onClick={() => setDeleteTarget(m)}
                        className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer"
                        style={{ background: '#ef4444', color: '#fff' }}
                      >
                        Sil
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Kullanıcıyı Sil"
        message={deleteTarget ? `"${deleteTarget.username}" adlı üyeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.` : ''}
        onConfirm={doDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
      />

      {statsMemberId && (
        <StatsModal memberId={statsMemberId} onClose={() => setStatsMemberId(null)} />
      )}
    </>
  );
}

export default function AdminClient({ user }: { user: any }) {
  return (
    <ThemeProvider initialTheme={user?.theme}>
      <AdminContent user={user} />
    </ThemeProvider>
  );
}
