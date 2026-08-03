'use client';

import { GameInfo, GAME_INFO_TEXTS } from '@/lib/game-data';
import { useState } from 'react';
import InfoModal from './info-modal';

interface GameCardProps {
  game: GameInfo;
  onClick: () => void;
}

export default function GameCard({ game, onClick }: GameCardProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  const infoData = GAME_INFO_TEXTS[game?.slug ?? ''];
  const rulesData = game?.hasRules ? GAME_INFO_TEXTS[`${game?.slug}-rules`] : null;

  return (
    <>
      <div className="game-card" onClick={onClick}>
        <h3 className="m-0 mb-1.5 text-xl flex items-center gap-2 font-semibold">
          <span className="text-[22px]">{game?.icon}</span>
          {game?.name}
          {game?.hasRules && (
            <span
              className="text-sm cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--accent)' }}
              title="Oyun Kuralları"
              onClick={(e: any) => { e?.stopPropagation?.(); setRulesOpen(true); }}
            >
              📜
            </span>
          )}
          {infoData && (
            <span
              className="text-sm cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
              onClick={(e: any) => { e?.stopPropagation?.(); setInfoOpen(true); }}
            >
              ℹ
            </span>
          )}
        </h3>
        <span className="text-sm" style={{ color: 'var(--muted)' }}>{game?.description}</span>
        {(game?.features?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {(game?.features ?? []).map((f: string) => (
              <span key={f} className="feature-tag">{f}</span>
            ))}
          </div>
        )}
        <button className="btn-accent" onClick={(e: any) => { e?.stopPropagation?.(); onClick(); }}>
          {game?.isDart ? 'Aç' : 'Oyna'}
        </button>
      </div>

      {infoData && (
        <InfoModal
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          title={infoData?.title ?? ''}
          items={infoData?.items ?? []}
        />
      )}
      {rulesData && (
        <InfoModal
          open={rulesOpen}
          onClose={() => setRulesOpen(false)}
          title={rulesData?.title ?? ''}
          items={rulesData?.items ?? []}
        />
      )}
    </>
  );
}
