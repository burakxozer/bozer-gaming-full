'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PRESET_AVATARS } from '@/lib/game-data';
import MessageToaster from './message-toaster';
import Inbox from './inbox';

interface UserData {
  id: string;
  username: string;
  profilePic: string | null;
  profilePicUrl?: string | null;
  role?: string | null;
}

export default function Navbar({ user }: { user: UserData | null }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch('/api/friends/requests')
      .then((r: any) => r?.json?.())
      .then((d: any) => setPendingCount(d?.requests?.length ?? 0))
      .catch(() => {});
  }, [user]);

  const getAvatarDisplay = () => {
    const pic = user?.profilePic;
    if (!pic) return { type: 'emoji' as const, emoji: '🎮', bg: '#f97316' };
    const preset = PRESET_AVATARS.find((a: any) => a?.key === pic);
    if (preset) return { type: 'emoji' as const, emoji: preset.emoji, bg: preset.bg };
    return { type: 'url' as const, url: user?.profilePicUrl ?? pic };
  };

  const avatar = getAvatarDisplay();
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <nav
      className="sticky top-0 z-40 w-full"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-[1100px] mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer"
        >
          <span className="text-xl">🎮</span>
          <span className="font-bold text-base" style={{ color: 'var(--text)' }}>
            Bözer Gaming
          </span>
        </button>

        {user && (
         <div className="flex items-center gap-3">
          <Inbox user={user} />
          <div ref={ref} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 cursor-pointer bg-transparent border-none"
            >
              <span className="text-sm font-semibold hidden sm:inline" style={{ color: isAdmin ? '#ef4444' : 'var(--text)' }}>
                {user?.username}{isAdmin ? ' 👑' : ''}
              </span>
              <span
                className="w-9 h-9 rounded-full border-2 flex items-center justify-center overflow-hidden"
                style={{ borderColor: 'var(--accent)' }}
              >
              {avatar.type === 'emoji' ? (
                <span
                  className="w-full h-full flex items-center justify-center text-lg"
                  style={{ background: avatar.bg }}
                >
                  {avatar.emoji}
                </span>
              ) : (
                <img
                  src={avatar.url}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    if (e?.target) e.target.style.display = 'none';
                  }}
                />
              )}
              </span>
            </button>

            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white font-bold" style={{ background: '#ef4444' }}>
                {pendingCount}
              </span>
            )}

            {dropdownOpen && (
              <div
                className="absolute right-0 top-12 w-48 rounded-xl p-2 shadow-2xl"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="px-3 py-2 text-sm font-bold" style={{ color: isAdmin ? '#ef4444' : 'var(--accent)' }}>
                  {user?.username}{isAdmin ? ' 👑' : ''}
                </div>
                <hr style={{ borderColor: 'var(--border)' }} />
                {[
                  { icon: '📊', label: 'İstatistikler', href: '/stats' },
                  { icon: '👥', label: `Arkadaşlar${pendingCount > 0 ? ` (${pendingCount})` : ''}`, href: '/friends' },
                  { icon: '👤', label: 'Profil', href: '/profile' },
                  ...(isAdmin ? [{ icon: '🛡️', label: 'Panel', href: '/admin' }] : []),
                ].map((item: any) => (
                  <button
                    key={item?.href}
                    onClick={() => { setDropdownOpen(false); router.push(item?.href); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:opacity-80 bg-transparent border-none cursor-pointer transition-colors"
                    style={{ color: 'var(--text)' }}
                    onMouseEnter={(e: any) => { if (e?.currentTarget) e.currentTarget.style.background = 'var(--panel)'; }}
                    onMouseLeave={(e: any) => { if (e?.currentTarget) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>{item?.icon}</span> {item?.label}
                  </button>
                ))}
                <hr style={{ borderColor: 'var(--border)' }} />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:opacity-80 bg-transparent border-none cursor-pointer"
                  style={{ color: '#ef4444' }}
                  onMouseEnter={(e: any) => { if (e?.currentTarget) e.currentTarget.style.background = 'var(--panel)'; }}
                  onMouseLeave={(e: any) => { if (e?.currentTarget) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>🚪</span> Çıkış Yap
                </button>
              </div>
            )}
          </div>
         </div>
        )}
      </div>
      <MessageToaster enabled={!!user} />
    </nav>
  );
}
