'use client';

import { DART_GAMES } from '@/lib/game-data';
import GameCard from './game-card';

interface DartSubmenuProps {
  onBack: () => void;
}

export default function DartSubmenu({ onBack }: DartSubmenuProps) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-center text-2xl font-bold mb-1">🎯 Dart Modları</h2>
      <p className="text-center text-sm mb-5" style={{ color: 'var(--muted)' }}>
        Tüm dart oyunları tek yerde
      </p>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {DART_GAMES.map((game: any) => (
          <GameCard
            key={game?.slug}
            game={game}
            onClick={() => { window.location.href = `/games/${game?.slug}`; }}
          />
        ))}
      </div>

      <div className="video-cta">
        <div className="text-4xl">📺</div>
        <strong style={{ color: 'var(--text)' }}>Karambol Kriket Nasıl Oynanır?</strong>
        <span style={{ color: 'var(--muted)' }}>Kuralları öğren, daha hızlı başla</span>
        <a
          href="https://www.youtube.com/watch?v=mSMOEP9QWJk"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 rounded-full font-bold text-black no-underline"
          style={{ background: 'var(--accent)' }}
        >
          YouTube&apos;da İzle ▶
        </a>
      </div>

      <button className="btn-gray" onClick={onBack}>
        ⬅ Ana Menü
      </button>
    </div>
  );
}
