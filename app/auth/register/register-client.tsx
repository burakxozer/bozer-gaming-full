'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ThemeProvider } from '@/app/components/theme-provider';
import SettingsWidget from '@/app/components/settings-widget';
import GoogleButton from '@/app/components/google-button';

const GOOGLE_ERRORS: Record<string, string> = {
  google_expired: 'Google oturumu zaman aşımına uğradı, tekrar deneyin.',
  google_failed: 'Google ile kayıt başarısız oldu, tekrar deneyin.',
  google_unconfigured: 'Google girişi henüz yapılandırılmadı.',
};

export default function RegisterClient() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const e = searchParams?.get('error');
    if (e && GOOGLE_ERRORS[e]) setError(GOOGLE_ERRORS[e]);
  }, [searchParams]);

  const usernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usernameValid) {
      setError('Kullanıcı adı sadece İngilizce harf, rakam ve _ içerebilir (3-20 karakter)');
      return;
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Kayıt başarısız');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-gradient, var(--bg))' }}>
          <div className="w-full max-w-sm text-center">
            <div className="text-5xl mb-4">✉️</div>
            <h2 className="text-xl font-bold mb-2">Kayıt Başarılı!</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
              E-postanı doğrula, ardından giriş yapabilirsin.
            </p>
            <button className="btn-accent" onClick={() => router.push('/auth/login')}>
              Giriş Yap Sayfasına Git
            </button>
          </div>
        </div>
        <SettingsWidget />
      </ThemeProvider>
    );
  }

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
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Kayıt Ol</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={(e: any) => setUsername(e?.target?.value ?? '')}
                className="form-input"
                required
              />
              {username.length > 0 && !usernameValid && (
                <p className="text-xs text-red-400 mt-1">Sadece İngilizce harf, rakam ve _ (3-20 karakter)</p>
              )}
            </div>
            <input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e: any) => setEmail(e?.target?.value ?? '')}
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
              minLength={6}
            />
            <input
              type="password"
              placeholder="Şifreyi Onayla"
              value={confirmPassword}
              onChange={(e: any) => setConfirmPassword(e?.target?.value ?? '')}
              className="form-input"
              required
            />

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button type="submit" className="btn-accent" disabled={loading}>
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>veya</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <GoogleButton label="Google ile Kayıt Ol" />

          <div className="text-center mt-4">
            <span className="text-sm" style={{ color: 'var(--muted)' }}>Zaten hesabın var mı? </span>
            <button
              onClick={() => router.push('/auth/login')}
              className="text-sm bg-transparent border-none cursor-pointer font-semibold"
              style={{ color: 'var(--accent)' }}
            >
              Giriş Yap
            </button>
          </div>
        </div>
      </div>
      <SettingsWidget />
    </ThemeProvider>
  );
}
