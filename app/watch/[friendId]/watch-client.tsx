'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '@/app/components/theme-provider';

interface WatchClientProps {
  friendId: string;
  theme?: string;
}

export default function WatchClient({ friendId, theme }: WatchClientProps) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [username, setUsername] = useState('');
  const [gameLabel, setGameLabel] = useState<string | null>(null);
  const [active, setActive] = useState<boolean | null>(null);
  const [online, setOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const lastHtmlRef = useRef<string>('');

  useEffect(() => {
    let stopped = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/games/watch/${friendId}`, { cache: 'no-store' });
        if (!res.ok) {
          if (res.status === 403) { setActive(false); }
          return;
        }
        const d = await res.json();
        if (stopped) return;
        setUsername(d.username ?? '');
        setOnline(!!d.online);
        setActive(!!d.active);
        setGameLabel(d.gameLabel ?? null);
        if (d.snapshot && d.snapshot !== lastHtmlRef.current) {
          lastHtmlRef.current = d.snapshot;
          if (iframeRef.current) {
            iframeRef.current.srcdoc = d.snapshot;
          }
          setLastUpdate(Date.now());
        }
      } catch {}
    };

    poll();
    const iv = setInterval(poll, 1000);
    return () => { stopped = true; clearInterval(iv); };
  }, [friendId]);

  return (
    <ThemeProvider initialTheme={theme}>
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg)' }}>
        <div
          className="flex items-center justify-between px-4 h-14 shrink-0"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">👁️</span>
            <div className="min-w-0">
              <div className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>
                {username ? `${username} izleniyor` : 'Canlı İzleme'}
              </div>
              <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                {gameLabel ? gameLabel : ''}
                {online ? ' · çevrimiçi' : ''}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
            >
              ● CANLI
            </span>
            <button
              onClick={() => router.push('/friends')}
              className="w-9 h-9 rounded-full border-none text-white text-lg cursor-pointer"
              style={{ background: 'rgba(0,0,0,0.4)' }}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          {active === false && (
            <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: 'var(--bg)' }}>
              <div className="text-center px-6">
                <div className="text-5xl mb-4">🎮</div>
                <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
                  {username ? `${username} şu an oyun oynamıyor` : 'Aktif oyun yok'}
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Arkadaşın bir oyuna başladığında burada canlı görünecek.
                </p>
              </div>
            </div>
          )}
          {active && !lastHtmlRef.current && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-10 h-10 border-4 rounded-full mx-auto mb-3" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Bağlanılıyor...</p>
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            className="w-full h-full border-none"
            style={{ pointerEvents: 'none' }}
            sandbox="allow-same-origin"
            title="Canlı izleme"
          />
        </div>
      </div>
    </ThemeProvider>
  );
}