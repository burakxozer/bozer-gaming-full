'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ThemeProvider } from '@/app/components/theme-provider';
import SettingsWidget from '@/app/components/settings-widget';
import { Suspense } from 'react';

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Bir hata oluştu');
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
      <div className="text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold mb-2">Şifre Değiştirildi!</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Yeni şifrenle giriş yapabilirsin.
        </p>
        <button className="btn-accent" onClick={() => router.push('/auth/login')}>
          Giriş Yap
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="password"
        placeholder="Yeni Şifre"
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
        {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
      </button>
    </form>
  );
}

export default function ResetClient() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-gradient, var(--bg))' }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-1">🎮 Bözer Gaming</h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Şifre Sıfırlama</p>
          </div>
          <Suspense fallback={<div className="text-center" style={{ color: 'var(--muted)' }}>Yükleniyor...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
      <SettingsWidget />
    </ThemeProvider>
  );
}
