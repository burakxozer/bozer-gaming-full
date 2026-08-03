'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SavedSession {
  id: string;
  gameName: string;
  gameLabel: string;
  name: string;
  updatedAt: string;
}

export default function SavedGames() {
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const router = useRouter();

  const load = async () => {
    try {
      const res = await fetch('/api/games/sessions', { cache: 'no-store' });
      if (!res.ok) return;
      const d = await res.json();
      setSessions(Array.isArray(d?.sessions) ? d.sessions : []);
    } catch {} finally {
      setLoaded(true);
    }
  };

  useEffect(() => { load(); }, []);

  const resume = (s: SavedSession) => {
    router.push(`/games/${s.gameName}?session=${s.id}`);
  };

  const remove = async (id: string) => {
    try {
      await fetch(`/api/games/sessions/${id}`, { method: 'DELETE' });
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {}
  };

  const startEdit = (s: SavedSession) => {
    setEditingId(s.id);
    setEditName(s.name);
  };

  const saveEdit = async (id: string) => {
    const name = editName.trim();
    if (!name) { setEditingId(null); return; }
    try {
      await fetch(`/api/games/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
    } catch {}
    setEditingId(null);
  };

  if (!loaded || sessions.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">💾 Kayıtlı Oyunlarım</h3>
      <div className="flex flex-col gap-2">
        {sessions.map((s) => (
          <div key={s.id} className="game-card !p-4 flex items-center gap-3">
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
                  <div className="font-semibold truncate" style={{ color: 'var(--text)' }}>{s.name}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{s.gameLabel}</div>
                </>
              )}
            </div>
            <button
              onClick={() => resume(s)}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold cursor-pointer border-none shrink-0"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              ▶️ Devam
            </button>
            <button
              onClick={() => startEdit(s)}
              className="px-2 py-1.5 rounded-lg text-sm cursor-pointer shrink-0"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
              title="Yeniden adlandır"
            >
              ✏️
            </button>
            <button
              onClick={() => remove(s.id)}
              className="px-2 py-1.5 rounded-lg text-sm cursor-pointer shrink-0"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none' }}
              title="Sil"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
