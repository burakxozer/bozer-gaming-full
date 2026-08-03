'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '@/app/components/theme-provider';

export default function GoogleUsernameClient() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/google/complete')
      .then((r) => r.json())
      .then((d) => {
        if (!d?.pending) {
          router.replace('/auth/register?error=google_expired');
          return;
        }
        setEmail(d.email ?? '');
      })
      .catch(() => router.replace('/auth/register'))
      .finally(() => setChecking(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Hata oluştu');
        return;
      }
      router.replace('/');
    } catch {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-gradient, var(--bg))' }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-1">🎮 Bözer Gaming</h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Neredeyse hazır! Bir kullanıcı adı seç</p>
          </div>

          {checking ? (
            <p className="text-center" style={{ color: 'var(--muted)' }}>Yükleniyor...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {email && (
                <p className="text-sm text-center" style={{ color: 'var(--muted)' }} suppressHydrationWarning>
                  Google hesabın: <span style={{ color: 'var(--text)' }}>{email}</span>
                </p>
              )}
              <input
                type="text"
                placeholder="Kullanıcı adı"
                value={username}
                onChange={(e: any) => setUsername(e?.target?.value ?? '')}
                className="form-input"
                autoFocus
                required
              />
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              <button type="submit" className="btn-accent" disabled={loading}>
                {loading ? 'Oluşturuluyor...' : 'Kaydı Tamamla'}
              </button>
            </form>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
