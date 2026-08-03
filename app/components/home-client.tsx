'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GAMES } from '@/lib/game-data';
import { ThemeProvider } from './theme-provider';
import Navbar from './navbar';
import GameCard from './game-card';
import ContinueCard from './continue-card';
import SavedGames from './saved-games';
import DartSubmenu from './dart-submenu';

interface HomeClientProps {
  user: any;
}

export default function HomeClient({ user }: HomeClientProps) {
  const [view, setView] = useState<'home' | 'dart'>('home');
  const router = useRouter();

  const handleGameClick = (game: any) => {
    if (game?.isDart) {
      setView('dart');
    } else {
      router.push(`/games/${game?.slug}`);
    }
  };

  return (
    <ThemeProvider initialTheme={user?.theme}>
      {user ? (
        <Navbar user={user} />
      ) : (
        <nav
          className="sticky top-0 z-40 w-full"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }}
        >
          <div className="max-w-[1100px] mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎮</span>
              <span className="font-bold text-base" style={{ color: 'var(--text)' }}>
                Bözer Gaming
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border-none"
                style={{ background: 'var(--accent)', color: '#fff' }}
                onClick={() => router.push('/auth/login')}
              >
                Giriş Yap
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
                onClick={() => router.push('/auth/register')}
              >
                Kayıt Ol
              </button>
            </div>
          </div>
        </nav>
      )}
      <div className="max-w-[1100px] mx-auto px-4 py-4">
        {view === 'home' && (
          <div className="animate-fade-in">
            <h1 className="text-center text-3xl font-bold mb-2 tracking-tight">
              🎮 Bözer Gaming 🎮
            </h1>
            <p className="text-center text-sm mb-5" style={{ color: 'var(--muted)' }}>
              Mini Oyun Platformu
            </p>
          </div>
        )}

        {view === 'home' && (
          <div className="animate-fade-in">
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', maxWidth: '1200px', margin: 'auto' }}>
              {GAMES.map((game: any) => (
                <GameCard
                  key={game?.slug}
                  game={game}
                  onClick={() => handleGameClick(game)}
                />
              ))}
            </div>
            {user && <SavedGames />}
            <ContinueCard user={user} />
          </div>
        )}

        {view === 'dart' && (
          <DartSubmenu onBack={() => setView('home')} />
        )}
      </div>
    </ThemeProvider>
  );
}
