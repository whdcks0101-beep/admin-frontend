import type { ReactNode } from 'react';

interface SearchPanelProps {
  children: ReactNode;
  actions?: ReactNode;
  onSearch?: () => void;
  disabled?: boolean;
}
export default function SearchPanel({ children, actions, onSearch, disabled = false }: SearchPanelProps) {
  return <form className="search-panel" onSubmit={(event) => { event.preventDefault(); onSearch?.(); }}>
    <fieldset disabled={disabled}>
      <legend className="visually-hidden">검색 조건</legend>
      <div className="search-fields">{children}</div>
      {actions && <div className="search-actions">{actions}</div>}
    </fieldset>
  </form>;
}
