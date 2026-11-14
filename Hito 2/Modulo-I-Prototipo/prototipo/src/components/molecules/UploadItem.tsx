import { CircleAlert, CircleCheck, CloudOff, FileText, RotateCcw, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { formatoMB } from '@/lib/formato';
import { Button } from '../atoms/Button';
import { IconButton } from '../atoms/IconButton';
import { ProgressBar } from '../atoms/ProgressBar';
import type { ControlSize } from '../atoms/sizes';

export type UploadStatus = 'uploading' | 'confirming' | 'done' | 'error' | 'queued';

export interface UploadItemProps {
  name: string;
  sizeBytes: number;
  status: UploadStatus;
  /** 0 a 100, mientras `status` es `uploading`. */
  progress?: number;
  /** Qué falló y qué hacer, cuando `status` es `error`. */
  errorMessage?: ReactNode;
  onCancel?: () => void;
  onRetry?: () => void;
  /** Abre el soporte en el visor. */
  onOpen?: () => void;
  size?: ControlSize;
  className?: string;
}

/** Un archivo en carga: nombre, tamaño, progreso real y acciones (§7.2). */
export function UploadItem({
  name,
  sizeBytes,
  status,
  progress = 0,
  errorMessage,
  onCancel,
  onRetry,
  onOpen,
  size = 'default',
  className,
}: UploadItemProps) {
  return (
    <li
      className={cn(
        'sf-container flex flex-col gap-gutter-sm rounded-md border p-3',
        status === 'error' ? 'border-error' : 'border-outline-variant',
        className,
      )}
    >
      <div className="flex items-center gap-gutter-sm">
        <FileText aria-hidden="true" className="h-5 w-5 shrink-0 text-on-surface-muted" />
        <div className="min-w-0 flex-1">
          <p className="break-words text-title-md">{name}</p>
          <p className="text-body-sm tabular-nums text-on-surface-muted">{formatoMB(sizeBytes)}</p>
        </div>
        {status === 'done' && onOpen && (
          <Button variant="ghost" size={size} onClick={onOpen}>
            Ver soporte
          </Button>
        )}
        {status === 'error' && onRetry && (
          <Button
            variant="secondary"
            size={size}
            icon={<RotateCcw aria-hidden="true" className="h-4 w-4" />}
            onClick={onRetry}
          >
            Reintentar
          </Button>
        )}
        {onCancel && status !== 'done' && (
          <IconButton label={`Cancelar la carga de ${name}`} size={size} onClick={onCancel}>
            <X aria-hidden="true" className="h-5 w-5" />
          </IconButton>
        )}
      </div>

      {status === 'uploading' && (
        <div className="flex items-center gap-gutter-sm">
          <ProgressBar label={`Carga de ${name}`} value={progress} className="flex-1" />
          <span className="w-10 text-right text-body-sm tabular-nums text-on-surface-muted">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      {status === 'confirming' && (
        <div role="status" className="flex flex-col gap-gutter-xs">
          <ProgressBar label={`Confirmando la carga de ${name}`} tone="info" />
          <span className="text-body-sm text-on-surface-muted">Confirmando carga…</span>
        </div>
      )}
      {status === 'done' && (
        <p role="status" className="flex items-center gap-gutter-xs text-body-sm text-success">
          <CircleCheck aria-hidden="true" className="h-4 w-4 shrink-0" />
          Archivo cargado
        </p>
      )}
      {status === 'queued' && (
        <p role="status" className="flex items-center gap-gutter-xs text-body-sm text-warning">
          <CloudOff aria-hidden="true" className="h-4 w-4 shrink-0" />
          En espera de señal. Se subirá solo al recuperar la conexión.
        </p>
      )}
      {status === 'error' && (
        <p role="alert" className="flex items-start gap-gutter-xs text-body-sm text-error">
          <CircleAlert aria-hidden="true" className="mt-px h-4 w-4 shrink-0" />
          <span>{errorMessage ?? 'No se pudo cargar el archivo. Oprime «Reintentar».'}</span>
        </p>
      )}
    </li>
  );
}
