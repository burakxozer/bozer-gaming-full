'use client';

import { useState, useEffect } from 'react';

interface ContinueCardProps {
  user: any;
}

export default function ContinueCard({ user }: ContinueCardProps) {
  const [lastGame, setLastGame] = useState<{ slug: string; name: string } | null>(null);
  const [enabled, setEnabled] = useState(false);

  const loadData = () => {
    const e = localStorage.getItem('continueEnabled') === 'true';
    setEnabled(e);
    if (!e) { setLastGame(null); return; }

    if (user) {
      fetch('/api/games/last')
        .then((r: any) => r?.json?.())
        .then((d: any) => {
          if (d?.gameName) setLastGame({ slug: d.gameName, name: d.gameLabel ?? d.gameName });
          else setLastGame(null);
        })
        .catch(() => {
          const local = tryLocalStorage();
          setLastGame(local);
        });
    } else {
      const local = tryLocalStorage();
      setLastGame(local);
    }
  };

  const tryLocalStorage = () => {
    try {
      const raw = localStorage.getItem('lastGame');
      if (raw) {
        const parsed = JSON.parse(raw);
        return { slug: parsed?.slug ?? '', name: parsed?.name ?? '' };
      }
    } catch {}
    return null;
  };

  useEffect(() => {
    loadData();
    window.addEventListener('continue-toggle', loadData);
    return () => window.removeEventListener('continue-toggle', loadData);
  }, [user]);

  if (!enabled || !lastGame) return null;

  return (
    <div className="mt-6">
      <div
        className="game-card continue-card cursor-pointer"
        onClick={() => { window.location.href = `/games/${lastGame?.slug}`; }}
      >
        <h3 className="m-0 mb-1 text-xl flex items-center gap-2 font-semibold">
          <span className="text-[22px]">▶️</span> Devam Et
        </h3>
        <span className="text-sm" style={{ color: 'var(--muted)' }}>{lastGame?.name}</span>
        <button className="btn-accent">Devam</button>
      </div>
    </div>
  );
}
