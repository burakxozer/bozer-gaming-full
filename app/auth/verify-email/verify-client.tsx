'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ThemeProvider } from '@/app/components/theme-provider';
import { Suspense } from 'react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Geçersiz doğrulama linki');
      return;
    }
    fetch(`/api/auth/verify-email?token=${token}`)
      .then((r: any) => r?.json?.())
      .then((d: any) => {
        if (d?.success) {
          setStatus('success');
          setMessage('E-posta doğrulandı!');
        } else {
          setStatus('error');
          setMessage(d?.error ?? 'Doğrulama başarısız');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Bir hata oluştu');
      });
  }, [token]);

  return (
    <div className="text-center">
      {status === 'loading' && (
        <>
          <div className="w-10 h-10 border-4 rounded-full mx-auto mb-4" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--muted)' }}>Doğrulanıyor...</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-2">{message}</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
            Artık giriş yapabilirsin.
          </p>
          <button className="btn-accent max-w-xs mx-auto" onClick={() => router.push('/auth/login')}>
            Giriş Yap
          </button>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold mb-2">Hata</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>{message}</p>
          <button className="btn-accent max-w-xs mx-auto" onClick={() => router.push('/')}>
            Ana Sayfa
          </button>
        </>
      )}
    </div>
  );
}

export default function VerifyClient() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-gradient, var(--bg))' }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-1">🎮 Bözer Gaming</h1>
          </div>
          <Suspense fallback={<div className="text-center" style={{ color: 'var(--muted)' }}>Yükleniyor...</div>}>
            <VerifyContent />
          </Suspense>
        </div>
      </div>
    </ThemeProvider>
  );
}
