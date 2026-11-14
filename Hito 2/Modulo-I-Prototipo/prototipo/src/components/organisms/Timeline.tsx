import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { formatoFechaHora } from '@/lib/formato';

export interface TimelineEntry {
  id: string;
  fecha: Date;
  usuario: string;
  rol: string;
  estadoAnterior: string;
  estadoNuevo: string;
  /** Motivo u observación, si el cambio la exige. */
  motivo?: string;
}

export interface TimelineProps {
  /** Nombre de la lista: «Bitácora del Corte #04». */
  label: string;
  /** De la más reciente a la más antigua. */
  entries: TimelineEntry[];
  empty?: ReactNode;
  className?: string;
}

/**
 * Bitácora de auditoría de solo lectura (§10, HU-M11). Formato fijo:
 * [DD/MM/AAAA HH:mm:ss] — [Nombre y Rol] cambió el estado de [Anterior] a [Nuevo]. Motivo/Observación: "…"
 */
export function Timeline({
  label,
  entries,
  empty = 'Aún no hay cambios registrados.',
  className,
}: TimelineProps) {
  if (entries.length === 0) {
    return <p className={cn('text-body-md text-on-surface-muted', className)}>{empty}</p>;
  }

  return (
    <ol aria-label={label} className={cn('flex flex-col', className)}>
      {entries.map((e, i) => (
        <li key={e.id} className="relative flex gap-gutter-md pb-gutter-md last:pb-0">
          {i < entries.length - 1 && (
            <span aria-hidden="true" className="absolute bottom-0 left-[5px] top-4 w-px bg-outline-variant" />
          )}
          <span aria-hidden="true" className="relative mt-1 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-outline bg-surface-container" />
          <div className="flex min-w-0 flex-col gap-gutter-xs">
            <time dateTime={e.fecha.toISOString()} className="text-label-md tabular-nums text-on-surface-muted">
              {formatoFechaHora(e.fecha)}
            </time>
            <p className="text-body-md">
              <strong className="font-semibold">
                {e.usuario} ({e.rol})
              </strong>{' '}
              cambió el estado de <strong className="font-semibold">{e.estadoAnterior}</strong> a{' '}
              <strong className="font-semibold">{e.estadoNuevo}</strong>.
            </p>
            {e.motivo && (
              <p className="text-body-md text-on-surface-muted">Motivo/Observación: «{e.motivo}»</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
