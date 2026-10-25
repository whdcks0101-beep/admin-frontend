import type { ReactNode } from 'react';

export default function Feedback({ children, kind = 'empty' }: {
  children: ReactNode;
  kind?: 'loading' | 'error' | 'empty' | 'success';
}) {
  return <div className={`feedback feedback-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
    {kind === 'loading' && <span className="spinner-border spinner-border-sm" aria-hidden="true" />}
    {children}
  </div>;
}
