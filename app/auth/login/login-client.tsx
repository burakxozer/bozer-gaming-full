'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '@/app/components/theme-provider';
import SettingsWidget from '@/app/components/settings-widget';
import GoogleButton from '@/app/components/google-button';

const GOOGLE_ERRORS: Record<string, string> = {
  google_failed: 'Google ile giriş başarısız oldu, tekrar deneyin.',
  google_state: 'Güvenlik doğrulaması başarısız, tekrar deneyin.',
  google_noemail: 'Google hesabından e-posta alınamadı.',
  google_unconfigured: 'Google girişi henüz yapılandırılmadı.',
};

export default function LoginClient() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get('error');
    if (e && GOOGLE_ERRORS[e]) setError(GOOGLE_ERRORS[e]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Giriş başarısız');
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
          <button
            onClick={() => router.push('/')}
            className="mb-6 text-sm flex items-center gap-1 bg-transparent border-none cursor-pointer"
            style={{ color: 'var(--muted)' }}
          >
            ← Geri
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-1">🎮 Bözer Gaming</h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Giriş Yap</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Kullanıcı adı veya e-posta"
              value={identifier}
              onChange={(e: any) => setIdentifier(e?.target?.value ?? '')}
              className="form-input"
              required
            />
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e: any) => setPassword(e?.target?.value ?? '')}
              className="form-input"
              required
            />

            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e: any) => setRememberMe(e?.target?.checked ?? false)}
                className="accent-[var(--accent)]"
              />
              Beni hatırla
            </label>

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <button
              type="submit"
              className="btn-accent"
              disabled={loading}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>veya</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <GoogleButton label="Google ile Giriş Yap" />

          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/auth/forgot')}
              className="text-sm bg-transparent border-none cursor-pointer underline"
              style={{ color: 'var(--accent)' }}
            >
              Kullanıcı adımı / şifremi unuttum
            </button>
          </div>

          <div className="text-center mt-3">
            <span className="text-sm" style={{ color: 'var(--muted)' }}>Hesabın yok mu? </span>
            <button
              onClick={() => router.push('/auth/register')}
              className="text-sm bg-transparent border-none cursor-pointer font-semibold"
              style={{ color: 'var(--accent)' }}
            >
              Kayıt Ol
            </button>
          </div>
        </div>
      </div>
      <SettingsWidget />
    </ThemeProvider>
  );
}
