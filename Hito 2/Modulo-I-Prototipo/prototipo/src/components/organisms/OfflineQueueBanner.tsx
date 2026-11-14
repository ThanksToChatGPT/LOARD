import { CircleAlert, CircleCheck, CloudOff, RefreshCw } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { formatoHora, plural } from '@/lib/formato';
import { ProgressBar } from '../atoms/ProgressBar';

export type OfflineQueueState = 'offline' | 'syncing' | 'synced' | 'rejected';

export interface OfflineQueueBannerProps {
  state: OfflineQueueState;
  /** Cambios guardados en el dispositivo (estado `offline`). */
  pending?: number;
  /** Enviados y total (estado `syncing`). */
  sent?: number;
  total?: number;
  /** Hora de la última sincronización (estado `synced`). */
  syncedAt?: Date;
  /** Reemplaza el texto por defecto. Obligatorio en `rejected`: qué se rechazó y por qué. */
  message?: ReactNode;
  /** Acción que resuelve el rechazo: «Revisar corte». */
  action?: ReactNode;
  /** Se llama 5 s después de «Todo sincronizado» para ocultar la franja. */
  onHide?: () => void;
}

const ESTADO: Record<OfflineQueueState, { caja: string; color: string; fondo: string; Icono: typeof CloudOff }> = {
  offline: { caja: 'border-warning-border bg-warning-subtle', color: 'text-warning', fondo: 'warning', Icono: CloudOff },
  syncing: { caja: 'border-info-border bg-info-subtle', color: 'text-info', fondo: 'info', Icono: RefreshCw },
  synced: { caja: 'border-success-border bg-success-subtle', color: 'text-success', fondo: 'success', Icono: CircleCheck },
  rejected: { caja: 'border-error-border bg-error-subtle', color: 'text-error', fondo: 'error', Icono: CircleAlert },
};

/** Franja bajo la topbar con el estado de la cola sin conexión (§8.3). */
export function OfflineQueueBanner({
  state,
  pending = 0,
  sent = 0,
  total = 0,
  syncedAt,
  message,
  action,
  onHide,
}: OfflineQueueBannerProps) {
  useEffect(() => {
    if (state !== 'synced' || !onHide) return;
    const t = window.setTimeout(onHide, 5000);
    return () => window.clearTimeout(t);
  }, [state, onHide]);

  const { caja, color, fondo, Icono } = ESTADO[state];

  const texto =
    message ??
    {
      offline: `Sin conexión. ${plural(pending, 'cambio guardado', 'cambios guardados')} en este dispositivo; se ${
        pending === 1 ? 'enviará' : 'enviarán'
      } al recuperar señal.`,
      syncing: `Señal recuperada. Enviando ${sent} de ${total}…`,
      synced: syncedAt ? `Todo sincronizado a las ${formatoHora(syncedAt)}.` : 'Todo sincronizado.',
      rejected: 'Un envío fue rechazado. Revisa el registro para corregirlo.',
    }[state];

  return (
    <div
      role="status"
      className={cn('flex flex-col gap-gutter-sm border-b px-gutter-md py-gutter-sm text-on-surface tablet:px-gutter-lg', caja)}
      style={{ ['--focus-offset' as string]: `var(--${fondo}-subtle)` }}
    >
      <div className="flex flex-wrap items-center gap-gutter-sm">
        <Icono aria-hidden="true" className={cn('h-5 w-5 shrink-0', color)} />
        <p className="min-w-0 flex-1 text-body-md tabular-nums">{texto}</p>
        {action}
      </div>
      {state === 'syncing' && total > 0 && (
        <ProgressBar label="Envío de cambios pendientes" value={(sent / total) * 100} tone="info" />
      )}
    </div>
  );
}
