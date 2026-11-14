import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';

export function Button({ children, busy = false, variant = 'primary', className = '', ...props }:
  ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean; variant?: 'primary' | 'secondary' | 'ghost' }) {
  return <button {...props} disabled={busy || props.disabled} className={`button ${variant} ${className}`}>
    {busy ? <LoaderCircle size={16} className="spin" aria-hidden="true" /> : null}{children}
  </button>;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="field"><span>{label}</span>{children}{hint ? <small>{hint}</small> : null}</label>;
}

export function ErrorNotice({ error }: { error: unknown }) {
  if (!error) return null;
  return <div className="notice error" role="alert">{error instanceof Error ? error.message : String(error)}</div>;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="empty-state"><h2>{title}</h2>{children}</div>;
}

export function Skeleton({ rows = 5 }: { rows?: number }) {
  return <div className="skeleton-list" role="status" aria-label="Cargando datos">
    {Array.from({ length: rows }, (_, index) => <div key={index} className="skeleton" />)}
  </div>;
}
