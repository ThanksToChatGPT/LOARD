import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BannerTone = 'info' | 'warning' | 'error' | 'success';

export interface BannerProps {
  tone?: BannerTone;
  title?: ReactNode;
  children: ReactNode;
  /** Botones o enlaces de la acción que resuelve el aviso. */
  actions?: ReactNode;
  /** Reemplaza el ícono por defecto del tono. */
  icon?: ReactNode;
  className?: string;
}

const TONO: Record<BannerTone, { caja: string; icono: string; Icono: typeof Info }> = {
  info: { caja: 'border-info-border bg-info-subtle', icono: 'text-info', Icono: Info },
  warning: { caja: 'border-warning-border bg-warning-subtle', icono: 'text-warning', Icono: TriangleAlert },
  error: { caja: 'border-error-border bg-error-subtle', icono: 'text-error', Icono: CircleAlert },
  success: { caja: 'border-success-border bg-success-subtle', icono: 'text-success', Icono: CircleCheck },
};

/** Aviso dentro de la página: borrador recuperado, cortes devueltos, reserva legal SST… */
export function Banner({ tone = 'info', title, children, actions, icon, className }: BannerProps) {
  const { caja, icono, Icono } = TONO[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex flex-col gap-gutter-sm rounded-md border p-gutter-md text-on-surface tablet:flex-row tablet:items-center',
        caja,
        className,
      )}
      // El espacio del anillo de foco de sus botones toma el fondo del aviso.
      style={{ ['--focus-offset' as string]: `var(--${tone}-subtle)` }}
    >
      <div className="flex flex-1 items-start gap-gutter-sm">
        <span className={cn('mt-0.5 shrink-0', icono)}>{icon ?? <Icono aria-hidden="true" className="h-5 w-5" />}</span>
        <div className="flex flex-col gap-gutter-xs text-body-md">
          {title && <strong className={cn('text-title-md', icono)}>{title}</strong>}
          <div>{children}</div>
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-gutter-sm">{actions}</div>}
    </div>
  );
}
