import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  busy?: boolean;
}
export default function Modal({ isOpen, onClose, children, title, description, busy = false }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!isOpen || !dialog) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return <dialog ref={ref} className="app-modal" aria-labelledby={title ? headingId : undefined}
    aria-label={title ? undefined : '입력 창'}
    onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className="modal-heading">
      <div>{title && <h2 id={headingId}>{title}</h2>}{description && <p>{description}</p>}</div>
      <button type="button" className="btn modal-close" aria-label="닫기" disabled={busy} onClick={onClose}>×</button>
    </div>
    <div className="modal-content-body">{children}</div>
  </dialog>;
}
