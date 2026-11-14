import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ALTO_CONTROL, type ControlSize } from './sizes';

export interface ChipProps extends ComponentProps<'button'> {
  selected?: boolean;
  size?: ControlSize;
  children: ReactNode;
}

/** Opción de selección rápida: filtros de estado, causas frecuentes de una observación. */
export function Chip({ selected = false, size = 'default', type = 'button', className, children, ...rest }: ChipProps) {
  return (
    <button
      {...rest}
      type={type}
      aria-pressed={selected}
      className={cn(
        'inline-flex items-center gap-gutter-xs rounded-full border px-gutter-md text-label-lg',
        'transition duration-state ease-out active:scale-[0.98]',
        ALTO_CONTROL[size],
        selected
          ? 'border-primary bg-primary text-on-primary'
          : 'border-outline bg-surface-container text-on-surface hover:bg-surface-container-low',
        className,
      )}
    >
      {children}
    </button>
  );
}
