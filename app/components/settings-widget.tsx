'use client';

import { useState, useEffect } from 'react';
import { useTheme } from './theme-provider';
import { THEMES } from '@/lib/game-data';

export default function SettingsWidget() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [continueEnabled, setContinueEnabled] = useState(false);

  useEffect(() => {
    setContinueEnabled(localStorage.getItem('continueEnabled') === 'true');
  }, []);

  const toggleContinue = () => {
    const newVal = !continueEnabled;
    setContinueEnabled(newVal);
    localStorage.setItem('continueEnabled', String(newVal));
    window.dispatchEvent(new Event('continue-toggle'));
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full border-none text-white text-[22px] transition-colors"
          style={{ background: open ? 'var(--accent)' : '#334155' }}
        >
          ⚙️
        </button>
      </div>

      {open && (
        <div className="settings-panel fixed bottom-[84px] right-4 z-50">
          <label className="flex justify-between items-center mb-3 text-sm" style={{ color: 'var(--text)' }}>
            Devam Et
            <input
              type="checkbox"
              checked={continueEnabled}
              onChange={toggleContinue}
              className="w-4 h-4 accent-[var(--accent)]"
            />
          </label>

          <label className="flex justify-between items-center mb-3 text-sm" style={{ color: 'var(--text)' }}>
            Tema
            <select
              value={theme}
              onChange={(e: any) => setTheme(e.target.value)}
              className="form-input !w-auto !p-1 !px-2 text-sm"
            >
              {THEMES.map((t: any) => (
                <option key={t?.value} value={t?.value}>
                  {t?.label}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() => {
              localStorage.removeItem('lastGame');
              window.dispatchEvent(new Event('continue-toggle'));
            }}
            className="btn-gray !mt-1 !text-sm !py-2"
          >
            Açık Oyunları Kapat
          </button>
        </div>
      )}
    </>
  );
}
