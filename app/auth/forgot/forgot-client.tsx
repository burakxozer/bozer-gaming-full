'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '@/app/components/theme-provider';
import SettingsWidget from '@/app/components/settings-widget';

export default function ForgotClient() {
  const [email, setEmail] = useState('');
  const [type, setType] = useState<'password' | 'username'>('password');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Bir hata oluştu');
        return;
      }
      setSent(true);
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
          <button
            onClick={() => router.push('/auth/login')}
            className="mb-6 text-sm flex items-center gap-1 bg-transparent border-none cursor-pointer"
            style={{ color: 'var(--muted)' }}
          >
            ← Geri
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-1">🎮 Bözer Gaming</h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {type === 'password' ? 'Şifremi Unuttum' : 'Kullanıcı Adımı Unuttum'}
            </p>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">✉️</div>
              <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
                {type === 'password'
                  ? 'E-postanıza şifre sıfırlama linki gönderildi.'
                  : 'Kullanıcı adınız e-posta adresinize gönderildi.'}
              </p>
              <button className="btn-accent" onClick={() => router.push('/auth/login')}>
                Giriş Yap
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('password')}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer"
                  style={{
                    background: type === 'password' ? 'var(--accent)' : 'var(--panel)',
                    color: type === 'password' ? '#000' : 'var(--text)',
                    border: type !== 'password' ? '1px solid var(--border)' : 'none',
                  }}
                >
                  Şifre Sıfırla
                </button>
                <button
                  type="button"
                  onClick={() => setType('username')}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer"
                  style={{
                    background: type === 'username' ? 'var(--accent)' : 'var(--panel)',
                    color: type === 'username' ? '#000' : 'var(--text)',
                    border: type !== 'username' ? '1px solid var(--border)' : 'none',
                  }}
                >
                  Kullanıcı Adı
                </button>
              </div>

              <input
                type="email"
                placeholder="E-posta adresin"
                value={email}
                onChange={(e: any) => setEmail(e?.target?.value ?? '')}
                className="form-input"
                required
              />

              {error && <p className="text-sm text-red-400 text-center">{error}</p>}

              <button type="submit" className="btn-accent" disabled={loading}>
                {loading ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </form>
          )}
        </div>
      </div>
      <SettingsWidget />
    </ThemeProvider>
  );
}
