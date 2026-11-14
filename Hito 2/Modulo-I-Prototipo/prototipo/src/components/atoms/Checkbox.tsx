import { Lock } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ALTO_CONTROL, type ControlSize } from './sizes';

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type' | 'size' | 'disabled'> {
  label: ReactNode;
  description?: ReactNode;
  size?: ControlSize;
  /**
   * Bloqueada por regla de negocio (ej. trabajador no habilitado, §6.2A).
   * Sigue recibiendo foco; al intentar marcarla no cambia y avisa con `onBlockedAttempt`.
   */
  blocked?: boolean;
  onBlockedAttempt?: () => void;
}

export function Checkbox({
  label,
  description,
  size = 'default',
  blocked = false,
  onBlockedAttempt,
  className,
  onClick,
  onKeyDown,
  ...rest
}: CheckboxProps) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-gutter-sm',
        ALTO_CONTROL[size],
        blocked ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
    >
      <input
        {...rest}
        type="checkbox"
        aria-disabled={blocked || undefined}
        onClick={(e) => {
          if (blocked) {
            e.preventDefault();
            onBlockedAttempt?.();
            return;
          }
          onClick?.(e);
        }}
        onKeyDown={(e) => {
          // Espacio ya dispara onClick; Enter no, y también debe explicar el bloqueo.
          if (blocked && e.key === 'Enter') onBlockedAttempt?.();
          onKeyDown?.(e);
        }}
        className={cn('h-5 w-5 shrink-0 rounded-sm accent-primary', blocked && 'opacity-50')}
      />
      {blocked && <Lock aria-hidden="true" className="h-4 w-4 shrink-0 text-error" />}
      <span className="flex flex-col">
        <span className="text-body-md">{label}</span>
        {description && <span className="text-body-sm text-on-surface-muted">{description}</span>}
      </span>
    </label>
  );
}
