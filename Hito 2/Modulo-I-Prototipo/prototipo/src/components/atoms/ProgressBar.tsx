import { cn } from '@/lib/cn';

export type ProgressTone = 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface ProgressBarProps {
  /** Nombre accesible: qué mide la barra. */
  label: string;
  /** De 0 a 100. Sin valor, la barra es indeterminada. */
  value?: number;
  tone?: ProgressTone;
  /** `thin`: 2 px, para recargas en segundo plano sobre una tabla (§7.1). */
  size?: 'default' | 'thin';
  /** Muestra la etiqueta y el porcentaje sobre la barra. */
  showLabel?: boolean;
  className?: string;
}

const RELLENO: Record<ProgressTone, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
};

export function ProgressBar({
  label,
  value,
  tone = 'primary',
  size = 'default',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const indeterminada = value == null;
  const porcentaje = indeterminada ? 0 : Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-gutter-xs flex items-baseline justify-between gap-gutter-sm text-body-sm text-on-surface-muted">
          <span>{label}</span>
          {!indeterminada && <span className="tabular-nums">{porcentaje}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminada ? undefined : porcentaje}
        className={cn(
          'w-full overflow-hidden rounded-full bg-surface-container-high',
          size === 'thin' ? 'h-0.5' : 'h-2',
        )}
      >
        <div
          className={cn(
            'h-full rounded-full',
            RELLENO[tone],
            indeterminada ? 'w-2/5 animate-indeterminate' : 'transition-[width] duration-enter ease-out',
          )}
          style={indeterminada ? undefined : { width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
}
