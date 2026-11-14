import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface KpiCardProps {
  title: string;
  /** Cifra principal. Se muestra con números tabulares. */
  value: ReactNode;
  description?: ReactNode;
  /** Color de la cifra cuando representa un estado. */
  tone?: 'default' | 'success' | 'warning' | 'error' | 'info';
  icon?: ReactNode;
  /** Barras, desgloses u otro contenido bajo la cifra. */
  children?: ReactNode;
  /** Si se pasa, la tarjeta es un botón (ej. filtra la tabla por ese estado). */
  onClick?: () => void;
  selected?: boolean;
  /** Ocupa 4 columnas de la retícula por defecto: 1, 2 o 3 tarjetas por fila. */
  className?: string;
}

const CIFRA = {
  default: 'text-on-surface',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
};

export function KpiCard({
  title,
  value,
  description,
  tone = 'default',
  icon,
  children,
  onClick,
  selected = false,
  className,
}: KpiCardProps) {
  const contenido = (
    <>
      <span className="flex items-center gap-gutter-sm text-label-lg text-on-surface-muted">
        {icon}
        {title}
      </span>
      <span className={cn('text-headline-lg tabular-nums', CIFRA[tone])}>{value}</span>
      {description && <span className="text-body-sm text-on-surface-muted">{description}</span>}
      {children && <span className="mt-gutter-sm flex flex-col gap-gutter-sm">{children}</span>}
    </>
  );

  const clases = cn('card col-span-4 flex flex-col gap-gutter-xs p-gutter-md text-left', className);

  if (!onClick) return <div className={clases}>{contenido}</div>;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        clases,
        'transition duration-state ease-out hover:bg-surface-container-low active:scale-[0.98]',
        selected && 'border-primary shadow-[inset_0_0_0_1px_var(--primary)]',
      )}
    >
      {contenido}
    </button>
  );
}
