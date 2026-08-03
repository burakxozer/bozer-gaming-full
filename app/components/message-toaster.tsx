'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Toast {
  id: string;
  senderUsername: string;
  content: string;
}

// Global notification toaster: polls for unread incoming messages every 5s and
// shows a 3-second toast sliding from the top of the screen for each new message.
// It does NOT mark messages as read (reading happens inside the chat modal).
export default function MessageToaster({ enabled }: { enabled: boolean }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seenRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    let stopped = false;

    const poll = async () => {
      try {
        const res = await fetch('/api/messages/unread', { cache: 'no-store' });
        if (!res.ok) return;
        const d = await res.json();
        if (stopped) return;
        const items: any[] = Array.isArray(d?.unread) ? d.unread : [];

        // On first poll, mark everything already-unread as "seen" so we don't
        // flood the user with toasts for old messages on page load.
        if (!initializedRef.current) {
          items.forEach((m: any) => seenRef.current.add(m.id));
          initializedRef.current = true;
          return;
        }

        const fresh = items.filter((m: any) => !seenRef.current.has(m.id));
        if (fresh.length === 0) return;

        fresh.forEach((m: any) => {
          seenRef.current.add(m.id);
          const toast: Toast = {
            id: m.id,
            senderUsername: m.senderUsername ?? 'Arkadaş',
            content: m.content ?? '',
          };
          setToasts((prev) => [...prev, toast]);
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toast.id));
          }, 3000);
        });
      } catch {}
    };

    poll();
    const iv = setInterval(poll, 5000);
    return () => { stopped = true; clearInterval(iv); };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col items-center gap-2 pt-3 px-4 pointer-events-none">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => router.push('/friends')}
          className="pointer-events-auto w-full max-w-sm text-left rounded-xl px-4 py-3 shadow-2xl cursor-pointer border-none animate-toast-in"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate" style={{ color: 'var(--accent)' }}>
                {t.senderUsername}
              </div>
              <div className="text-sm truncate" style={{ color: 'var(--text)' }}>
                {t.content}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
