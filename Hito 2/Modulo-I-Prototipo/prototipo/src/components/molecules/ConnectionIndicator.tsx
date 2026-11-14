import { Cloud, CloudAlert, CloudOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ConnectionState = 'online' | 'offline' | 'syncing' | 'error';

export interface ConnectionIndicatorProps {
  state: ConnectionState;
  /** Reemplaza el texto por defecto: «Enviando 2 de 3», «1 envío falló». */
  text?: string;
  className?: string;
}

const ESTADO: Record<ConnectionState, { texto: string; color: string; Icono: typeof Cloud }> = {
  online: { texto: 'En línea', color: 'text-on-surface-muted', Icono: Cloud },
  offline: { texto: 'Sin señal', color: 'text-warning', Icono: CloudOff },
  syncing: { texto: 'Sincronizando', color: 'text-info', Icono: RefreshCw },
  error: { texto: 'Un envío falló', color: 'text-error', Icono: CloudAlert },
};

/** Indicador permanente de conexión de la topbar (§8.3). En móvil muestra solo el ícono. */
export function ConnectionIndicator({ state, text, className }: ConnectionIndicatorProps) {
  const { texto, color, Icono } = ESTADO[state];
  const visible = text ?? texto;
  // «En línea» puede ir sin texto en móvil; los demás estados siempre lo muestran.
  const soloIconoEnMovil = state === 'online';

  return (
    <span role="status" className={cn('inline-flex items-center gap-gutter-xs text-label-lg', color, className)}>
      <Icono aria-hidden="true" className="h-5 w-5 shrink-0" />
      <span className={cn('tabular-nums', soloIconoEnMovil && 'sr-only tablet:not-sr-only')}>{visible}</span>
    </span>
  );
}
