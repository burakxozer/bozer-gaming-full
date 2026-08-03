'use client';

import { useEffect } from 'react';

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  items: string[];
}

export default function InfoModal({ open, onClose, title, items }: InfoModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e: any) => e?.stopPropagation?.()}>
        <button
          className="absolute top-3 right-4 bg-transparent border-none text-xl cursor-pointer"
          style={{ color: 'var(--muted)' }}
          onClick={onClose}
        >
          ✕
        </button>
        <h4 className="text-[15px] font-semibold mb-3 mt-0" style={{ color: 'var(--accent)' }}>
          {title}
        </h4>
        <ul className="pl-5 m-0 space-y-1 text-sm" style={{ color: 'var(--text)' }}>
          {(items ?? []).map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <button className="btn-accent !mt-4 !text-sm" onClick={onClose}>
          Kapat
        </button>
      </div>
    </div>
  );
}
