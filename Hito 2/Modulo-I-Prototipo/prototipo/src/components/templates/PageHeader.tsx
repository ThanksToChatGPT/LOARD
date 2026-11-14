import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  /** Dato de contexto bajo el título: «Datos SST actualizados hoy a las 06:10». */
  meta?: ReactNode;
  /** Acción principal de la pantalla y secundarias. */
  actions?: ReactNode;
  className?: string;
}

/** Encabezado de pantalla: único `<h1>`, contexto y acciones. */
export function PageHeader({ title, description, meta, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-gutter-md tablet:flex-row tablet:items-end tablet:justify-between', className)}>
      <div className="flex min-w-0 flex-col gap-gutter-xs">
        <h1 className="text-headline-lg-mobile tablet:text-headline-lg">{title}</h1>
        {description && <p className="text-body-lg text-on-surface-muted">{description}</p>}
        {meta && <p className="text-body-sm tabular-nums text-on-surface-muted">{meta}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-gutter-sm">{actions}</div>}
    </div>
  );
}
