'use client';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  open, title, message, onConfirm, onCancel,
  confirmText = 'Kapat',
  cancelText = 'Vazgeç',
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e: any) => e?.stopPropagation?.()}>
        <button
          className="absolute top-3 right-4 bg-transparent border-none text-xl cursor-pointer"
          style={{ color: 'var(--muted)' }}
          onClick={onCancel}
        >
          ✕
        </button>
        <h3 className="mt-0 mb-1 text-lg">{title}</h3>
        <p className="mb-5 text-sm" style={{ color: 'var(--muted)' }}>{message}</p>
        <div className="flex gap-3">
          <button className="btn-gray flex-1" onClick={onCancel}>{cancelText}</button>
          <button className="btn-accent flex-1" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
