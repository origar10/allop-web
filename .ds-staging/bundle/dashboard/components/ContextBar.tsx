import React from 'react';
import { Icon } from './primitives';

interface ContextBarProps {
  title: string;
  sub?: string;
  search?: boolean;
  onSearch?: (q: string) => void;
  actions?: React.ReactNode;
}

export function ContextBar({ title, sub, search, onSearch, actions }: ContextBarProps) {
  return (
    <header className="ctxbar">
      <div className="ctx-title">
        <span className="t">{title}</span>
        {sub && <span className="s">{sub}</span>}
      </div>
      <div className="ctx-spacer" />
      {search && (
        <div className="ctx-search">
          <Icon name="search" size={15} color="var(--fg-4)" />
          <input placeholder="Buscar…" onChange={e => onSearch?.(e.target.value)} />
        </div>
      )}
      {actions}
    </header>
  );
}
