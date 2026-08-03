import GameClient from './game-client';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const GAME_MAP: Record<string, { file: string; label: string }> = {
  americano: { file: '/games/americano.html', label: 'Americano' },
  'kura-cek': { file: '/games/kura-cek.html', label: 'Kura Çek' },
  lig: { file: '/games/lig.html', label: 'Lig Oluştur' },
  somali: { file: '/games/somali.html', label: 'Somali' },
  'dartbot-v1': { file: '/games/dart/dartbot-v1.html', label: 'Dartbot v1' },
  'dart-turnuva': { file: '/games/dart/dart-turnuva.html', label: 'Dart Turnuva' },
  'dart-mac': { file: '/games/dart/dart-mac.html', label: 'Dart Maç' },
};

export default async function GamePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { session?: string };
}) {
  const slug = params?.slug ?? '';
  const game = GAME_MAP[slug];

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold mb-2">Oyun Bulunamadı</h2>
          <a href="/" className="text-sm" style={{ color: 'var(--accent)' }}>Ana Sayfaya Dön</a>
        </div>
      </div>
    );
  }

  const user = await getSession();
  const isLoggedIn = !!user;

  let resumeSessionId: string | null = null;
  let resumeState: any = null;
  let resumeName: string | null = null;

  const sid = searchParams?.session;
  if (sid && user) {
    const s = await prisma.gameSession.findUnique({ where: { id: sid } });
    if (s && s.userId === user.id && s.gameName === slug) {
      resumeSessionId = s.id;
      resumeName = s.name;
      try { resumeState = s.state ? JSON.parse(s.state) : null; } catch {}
    }
  }

  return (
    <GameClient
      slug={slug}
      file={game.file}
      label={game.label}
      isLoggedIn={isLoggedIn}
      resumeSessionId={resumeSessionId}
      resumeState={resumeState}
      resumeName={resumeName}
    />
  );
}