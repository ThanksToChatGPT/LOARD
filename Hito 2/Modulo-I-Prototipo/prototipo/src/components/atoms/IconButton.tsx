import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { LADO_CONTROL, type ControlSize } from './sizes';

export interface IconButtonProps extends Omit<ComponentProps<'button'>, 'aria-label'> {
  /** Nombre accesible. Un ícono nunca va sin texto o etiqueta. */
  label: string;
  size?: ControlSize;
  /** Superficie donde está el botón. */
  tone?: 'default' | 'nav' | 'inverse';
  /** Conteo sobre el ícono (ej. alertas pendientes). */
  badge?: number;
  children: ReactNode;
}

const TONO = {
  default: 'text-on-surface hover:bg-surface-container-low',
  nav: 'text-on-nav hover:bg-nav-active',
  inverse: 'text-inverse-on-surface hover:opacity-80',
};

export function IconButton({
  label,
  size = 'default',
  tone = 'default',
  badge,
  type = 'button',
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      aria-label={label}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded',
        'transition duration-state ease-out active:scale-[0.98]',
        LADO_CONTROL[size],
        TONO[tone],
        className,
      )}
    >
      {children}
      {badge != null && badge > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-error px-1 text-label-sm tabular-nums text-surface-container"
        >
          {badge}
        </span>
      )}
    </button>
  );
}
