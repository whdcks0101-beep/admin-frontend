import type { ReactNode } from 'react';

interface TablePanelProps {
  title: string;
  count?: number;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}
export default function TablePanel({ title, count, actions, children, footer }: TablePanelProps) {
  return <section className="table-panel">
    <div className="panel-heading"><div className="panel-title">{title}
      {count !== undefined && <span className="count-badge">{count.toLocaleString()}</span>}</div>
      {actions && <div className="panel-actions">{actions}</div>}
    </div>
    <div className="table-scroll" tabIndex={0} role="region" aria-label={title}>{children}</div>
    {footer && <div className="panel-footer">{footer}</div>}
  </section>;
}
