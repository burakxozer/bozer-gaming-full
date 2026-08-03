'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/app/components/confirm-modal';
import { ThemeProvider } from '@/app/components/theme-provider';

interface GameClientProps {
  slug: string;
  file: string;
  label: string;
  isLoggedIn: boolean;
  resumeSessionId: string | null;
  resumeState: any;
  resumeName: string | null;
}

export default function GameClient({
  slug,
  file,
  label,
  isLoggedIn,
  resumeSessionId,
  resumeState,
  resumeName,
}: GameClientProps) {
  const [confirmClose, setConfirmClose] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionName, setSessionName] = useState(resumeName ?? '');
  const [nameSaved, setNameSaved] = useState(false);
  const router = useRouter();
  const reported = useRef(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sessionIdRef = useRef<string | null>(resumeSessionId);
  const latestStateRef = useRef<any>(null);
  const lastSyncRef = useRef(0);
  const lastSaveRef = useRef(0);
  const readyRef = useRef(false);

  // Default session name (computed on client to avoid hydration mismatch)
  useEffect(() => {
    if (!sessionName) {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const def = `${label} - ${pad(d.getDate())}.${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setSessionName(def);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('lastGame', JSON.stringify({ slug, name: label }));
    } catch {}

    if (isLoggedIn && !reported.current) {
      reported.current = true;
      fetch('/api/games/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameName: slug, gameLabel: label }),
      }).catch(() => {});
    }

    const handleBeforeUnload = () => {
      if (isLoggedIn) navigator.sendBeacon?.('/api/games/active', '');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (isLoggedIn) fetch('/api/games/active', { method: 'DELETE' }).catch(() => {});
    };
  }, [slug, label, isLoggedIn]);

  // Ensure a saved-game session exists (create on demand), returns id
  const ensureSession = async (): Promise<string | null> => {
    if (!isLoggedIn) return null;
    if (sessionIdRef.current) return sessionIdRef.current;
    try {
      const res = await fetch('/api/games/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameName: slug,
          gameLabel: label,
          name: sessionName || label,
          state: latestStateRef.current,
        }),
      });
      const d = await res.json();
      if (d?.id) {
        sessionIdRef.current = d.id;
        setNameSaved(true);
        return d.id;
      }
    } catch {}
    return null;
  };

  // postMessage protocol with the game iframe
  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      const d: any = ev.data || {};
      if (d.type === 'bozer-ready') {
        readyRef.current = true;
        if (resumeState != null && iframeRef.current?.contentWindow) {
          setTimeout(() => {
            iframeRef.current?.contentWindow?.postMessage(
              { type: 'bozer-restore', state: resumeState },
              '*'
            );
          }, 250);
        }
      } else if (d.type === 'bozer-snapshot') {
        if (!isLoggedIn) return;
        const now = Date.now();
        if (now - lastSyncRef.current < 900) return;
        lastSyncRef.current = now;
        fetch('/api/games/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ snapshot: d.html, gameName: slug, gameLabel: label }),
        }).catch(() => {});
      } else if (d.type === 'bozer-save') {
        if (!isLoggedIn) return;
        latestStateRef.current = d.state;
        const now = Date.now();
        if (now - lastSaveRef.current < 1000) return;
        lastSaveRef.current = now;
        (async () => {
          const id = await ensureSession();
          if (id) {
            fetch(`/api/games/sessions/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ state: d.state }),
            }).catch(() => {});
          }
        })();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, slug, label, resumeState]);

  const saveName = async () => {
    if (!isLoggedIn) return;
    const id = sessionIdRef.current;
    if (id) {
      await fetch(`/api/games/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: sessionName || label }),
      }).catch(() => {});
      setNameSaved(true);
    } else {
      await ensureSession();
    }
  };

  const handleClose = () => {
    setConfirmClose(false);
    if (isLoggedIn) fetch('/api/games/active', { method: 'DELETE' }).catch(() => {});
    router.push('/');
  };

  return (
    <ThemeProvider>
      <div className="fixed inset-0 z-50" style={{ background: 'var(--bg)' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-10 h-10 border-4 rounded-full mx-auto mb-3" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Yükleniyor...</p>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={file}
          className="w-full h-full border-none"
          onLoad={() => setLoading(false)}
          allow="fullscreen"
        />

        {isLoggedIn && (
          <div
            className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1 rounded-full px-3 py-1.5"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', maxWidth: 'calc(100vw - 24px)' }}
          >
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>💾</span>
            <input
              value={sessionName}
              onChange={(e) => { setSessionName(e.target.value); setNameSaved(false); }}
              onBlur={saveName}
              placeholder="Oyun ismi"
              className="bg-transparent border-none outline-none text-xs text-white w-32"
              style={{ minWidth: '80px' }}
            />
            <button
              onClick={saveName}
              className="text-xs px-2 py-0.5 rounded-full border-none cursor-pointer whitespace-nowrap"
              style={{ background: nameSaved ? '#22c55e' : 'var(--accent)', color: '#fff' }}
            >
              {nameSaved ? 'Kaydedildi' : 'Kaydet'}
            </button>
          </div>
        )}

        <button
          onClick={() => setConfirmClose(true)}
          className="fixed top-3 right-3 z-[1000] w-10 h-10 rounded-full border-none text-white text-xl cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
        >
          ✕
        </button>

        <ConfirmModal
          open={confirmClose}
          title={label}
          message="Oyunu kapatmak istiyor musun? İlerlemen kaydedildi."
          onConfirm={handleClose}
          onCancel={() => setConfirmClose(false)}
        />
      </div>
    </ThemeProvider>
  );
}