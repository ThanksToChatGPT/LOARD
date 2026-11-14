import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { Tono } from '@/lib/estados';

export interface BadgeProps {
  tone?: Tono;
  /** Reemplaza el punto de 8 px. */
  icon?: ReactNode;
  emphasis?: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
}

// Texto del token sobre su *-subtle, con borde *-border (§10).
const TONO: Record<Tono, string> = {
  success: 'border-success-border bg-success-subtle text-success',
  warning: 'border-warning-border bg-warning-subtle text-warning',
  error: 'border-error-border bg-error-subtle text-error',
  info: 'border-info-border bg-info-subtle text-info',
  neutral: 'border-outline bg-surface-container text-on-surface-muted',
  local: 'border-dashed border-outline bg-surface-container text-on-surface-muted',
};

/** Insignia genérica. Para un estado oficial, usar `StatusBadge`. */
export function Badge({ tone = 'neutral', icon, emphasis = false, id, className, children }: BadgeProps) {
  return (
    <span
      id={id}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-label-md tabular-nums',
        emphasis && 'font-bold',
        TONO[tone],
        className,
      )}
    >
      {icon ?? <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-current" />}
      <span>{children}</span>
    </span>
  );
}
