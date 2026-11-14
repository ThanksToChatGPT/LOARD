import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';
import { ALTO_CONTROL, type ControlSize } from './sizes';

export type ButtonVariant = 'primary' | 'secondary' | 'warning' | 'ghost';

export interface ButtonProps extends Omit<ComponentProps<'button'>, 'disabled'> {
  variant?: ButtonVariant;
  size?: ControlSize;
  /** Ícono a la izquierda del texto. */
  icon?: ReactNode;
  /** Petición en curso: muestra el spinner e impide un segundo envío. */
  loading?: boolean;
  /** Texto en gerundio mientras carga: «Guardando corte…». */
  loadingText?: string;
  /** Bloqueado por una regla de negocio. Sigue recibiendo foco. */
  blocked?: boolean;
  /** Motivo visible del bloqueo y cómo resolverlo. Obligatorio si `blocked`. */
  blockedReason?: ReactNode;
  fullWidth?: boolean;
}

const VARIANTE: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-primary text-on-primary',
  secondary: 'border-outline bg-surface-container text-on-surface',
  warning: 'border-transparent bg-warning text-on-warning',
  ghost: 'border-transparent bg-transparent text-primary',
};

const HOVER: Record<ButtonVariant, string> = {
  primary: 'hover:bg-primary-hover',
  secondary: 'hover:bg-surface-container-low',
  warning: 'hover:opacity-90',
  ghost: 'hover:bg-surface-container-low',
};

export function Button({
  variant = 'primary',
  size = 'default',
  icon,
  loading = false,
  loadingText,
  blocked = false,
  blockedReason,
  fullWidth = false,
  type = 'button',
  className,
  onClick,
  children,
  'aria-describedby': describedBy,
  ...rest
}: ButtonProps) {
  const motivoId = useId();
  const inactivo = blocked || loading;
  const conMotivo = blocked && blockedReason != null;

  const boton = (
    <button
      {...rest}
      type={type}
      // aria-disabled en lugar de disabled: el botón conserva el foco y anuncia el motivo.
      aria-disabled={inactivo || undefined}
      aria-busy={loading || undefined}
      aria-describedby={cn(conMotivo && motivoId, describedBy) || undefined}
      onClick={(e) => {
        if (inactivo) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      className={cn(
        'inline-flex select-none items-center justify-center gap-gutter-sm rounded border px-gutter-md text-label-lg',
        'transition duration-state ease-out',
        ALTO_CONTROL[size],
        VARIANTE[variant],
        fullWidth && 'w-full',
        blocked && 'cursor-not-allowed opacity-50',
        loading && 'pointer-events-none',
        !inactivo && HOVER[variant],
        !inactivo && 'active:scale-[0.98] active:border-primary',
        className,
      )}
    >
      {loading ? <Spinner /> : icon}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  );

  if (!conMotivo) return boton;

  return (
    <span className={cn('flex-col gap-gutter-xs', fullWidth ? 'flex w-full' : 'inline-flex items-start')}>
      {boton}
      <span id={motivoId} className="text-body-sm text-on-surface-muted">
        {blockedReason}
      </span>
    </span>
  );
}
