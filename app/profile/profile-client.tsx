'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider, useTheme } from '@/app/components/theme-provider';
import Navbar from '@/app/components/navbar';
import SettingsWidget from '@/app/components/settings-widget';
import ConfirmModal from '@/app/components/confirm-modal';
import { PRESET_AVATARS, THEMES } from '@/lib/game-data';

function ProfileContent({ user }: { user: any }) {
  const { theme, setTheme } = useTheme();
  const [confirmClear, setConfirmClear] = useState(false);
  const [avatarModal, setAvatarModal] = useState(false);
  const [profilePic, setProfilePic] = useState(user?.profilePic ?? null);
  const [profilePicUrl, setProfilePicUrl] = useState(user?.profilePicUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPw2, setNewPw2] = useState('');
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);
  const router = useRouter();

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (!curPw || !newPw) { setPwMsg({ type: 'err', text: 'Tüm alanları doldurun' }); return; }
    if (newPw.length < 6) { setPwMsg({ type: 'err', text: 'Yeni şifre en az 6 karakter olmalı' }); return; }
    if (newPw !== newPw2) { setPwMsg({ type: 'err', text: 'Yeni şifreler eşleşmiyor' }); return; }
    setPwSaving(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setPwMsg({ type: 'err', text: data?.error ?? 'Hata' }); return; }
      setPwMsg({ type: 'ok', text: 'Şifre başarıyla değiştirildi' });
      setCurPw(''); setNewPw(''); setNewPw2('');
    } catch {
      setPwMsg({ type: 'err', text: 'Hata oluştu' });
    } finally {
      setPwSaving(false);
    }
  };

  const getAvatar = () => {
    if (!profilePic) return { type: 'emoji' as const, emoji: '🎮', bg: '#f97316' };
    const preset = PRESET_AVATARS.find((a: any) => a?.key === profilePic);
    if (preset) return { type: 'emoji' as const, emoji: preset.emoji, bg: preset.bg };
    return { type: 'url' as const, url: profilePicUrl ?? profilePic };
  };

  const avatar = getAvatar();

  const handlePresetAvatar = async (key: string) => {
    await fetch('/api/profile/avatar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'preset', value: key }),
    });
    setProfilePic(key);
    setAvatarModal(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e?.target?.files ?? [])[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Dosya 2MB\'dan küçük olmalı');
      return;
    }

    setUploading(true);
    try {
      const res = await fetch('/api/profile/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'upload', fileName: file.name, contentType: file.type }),
      });
      const data = await res.json();
      if (!data?.uploadUrl) throw new Error('Upload URL alınamadı');

      await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      await fetch('/api/profile/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'confirm-upload', value: data.cloud_storage_path }),
      });

      setProfilePic(data.cloud_storage_path);
      setProfilePicUrl(URL.createObjectURL(file));
      setAvatarModal(false);
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Yükleme başarısız');
    } finally {
      setUploading(false);
    }
  };

  const handleClearHistory = async () => {
    await fetch('/api/games/clear-history', { method: 'POST' });
    setConfirmClear(false);
    localStorage.removeItem('lastGame');
    window.dispatchEvent(new Event('continue-toggle'));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <Navbar user={user} />
      <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in">
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-sm flex items-center gap-1 bg-transparent border-none cursor-pointer"
          style={{ color: 'var(--muted)' }}
        >
          ← Ana Sayfa
        </button>

        <div className="text-center mb-8">
          <button
            onClick={() => setAvatarModal(true)}
            className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 cursor-pointer bg-transparent"
            style={{ borderColor: 'var(--accent)' }}
          >
            {avatar.type === 'emoji' ? (
              <span className="w-full h-full flex items-center justify-center text-4xl" style={{ background: avatar.bg }}>
                {avatar.emoji}
              </span>
            ) : (
              <img src={avatar.url} alt="avatar" className="w-full h-full object-cover" onError={(e: any) => { if (e?.target) e.target.style.display = 'none'; }} />
            )}
          </button>
          <h2 className="text-xl font-bold">{user?.username}</h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }} suppressHydrationWarning>{user?.email}</p>
        </div>

        <div className="game-card mb-4">
          <h3 className="text-base font-semibold mb-3">🎨 Tema</h3>
          <select
            value={theme}
            onChange={(e: any) => setTheme(e?.target?.value)}
            className="form-input"
          >
            {THEMES.map((t: any) => (
              <option key={t?.value} value={t?.value}>{t?.label}</option>
            ))}
          </select>
        </div>

        <div className="game-card mb-4">
          <h3 className="text-base font-semibold mb-3">🔒 Şifre Değiştir</h3>
          <div className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Mevcut şifre"
              value={curPw}
              onChange={(e: any) => setCurPw(e.target.value)}
              className="form-input"
            />
            <input
              type="password"
              placeholder="Yeni şifre (en az 6 karakter)"
              value={newPw}
              onChange={(e: any) => setNewPw(e.target.value)}
              className="form-input"
            />
            <input
              type="password"
              placeholder="Yeni şifre (tekrar)"
              value={newPw2}
              onChange={(e: any) => setNewPw2(e.target.value)}
              className="form-input"
            />
            {pwMsg && (
              <p className="text-sm" style={{ color: pwMsg.type === 'ok' ? '#22c55e' : '#ef4444' }}>
                {pwMsg.text}
              </p>
            )}
            <button onClick={handleChangePassword} disabled={pwSaving} className="btn-accent">
              {pwSaving ? 'Kaydediliyor...' : 'Şifreyi Değiştir'}
            </button>
          </div>
        </div>

        <div className="game-card mb-4">
          <h3 className="text-base font-semibold mb-3">🗑️ Geçmişi Temizle</h3>
          <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>
            Tüm oyun istatistiklerini ve devam et verisini siler.
          </p>
          <button onClick={() => setConfirmClear(true)} className="btn-accent !bg-red-500">
            Geçmişi Temizle
          </button>
        </div>

        <button onClick={handleLogout} className="btn-gray !flex !items-center !justify-center !gap-2">
          🚪 Çıkış Yap
        </button>
      </div>

      {avatarModal && (
        <div className="modal-overlay" onClick={() => setAvatarModal(false)}>
          <div className="modal-card" onClick={(e: any) => e?.stopPropagation?.()}>
            <button className="absolute top-3 right-4 bg-transparent border-none text-xl cursor-pointer" style={{ color: 'var(--muted)' }} onClick={() => setAvatarModal(false)}>✕</button>
            <h3 className="text-lg font-bold mb-4">Profil Fotoğrafı</h3>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {PRESET_AVATARS.map((a: any) => (
                <button
                  key={a?.key}
                  onClick={() => handlePresetAvatar(a?.key)}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl cursor-pointer border-2 transition-transform hover:scale-110"
                  style={{ background: a?.bg, borderColor: profilePic === a?.key ? 'var(--accent)' : 'transparent' }}
                >
                  {a?.emoji}
                </button>
              ))}
            </div>

            <div className="text-center">
              <label className="btn-gray inline-block cursor-pointer !w-auto !px-6">
                {uploading ? 'Yükleniyor...' : '📷 Fotoğraf Yükle'}
                <input type="file" accept="image/jpeg,image/png" onChange={handleFileUpload} className="hidden" disabled={uploading} />
              </label>
              <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>Max 2MB, JPG veya PNG</p>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmClear}
        title="Geçmişi Temizle"
        message="Tüm oyun istatistiklerin ve devam et verin silinecek. Emin misin?"
        onConfirm={handleClearHistory}
        onCancel={() => setConfirmClear(false)}
        confirmText="Evet, Temizle"
      />

      <SettingsWidget />
    </>
  );
}

export default function ProfileClient({ user }: { user: any }) {
  return (
    <ThemeProvider initialTheme={user?.theme}>
      <ProfileContent user={user} />
    </ThemeProvider>
  );
}
