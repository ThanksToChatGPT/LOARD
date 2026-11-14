import { X } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IconButton } from '../atoms/IconButton';

export interface ToastProps extends Omit<ComponentProps<'div'>, 'children'> {
  message: ReactNode;
  /** Acción dentro del aviso: «Deshacer», «Revisar corte». */
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
}

/**
 * Aviso breve sobre superficie inversa. Es solo la pieza visual:
 * para mostrar uno, usar `useToast()` de `ToastProvider`.
 */
export function Toast({ message, actionLabel, onAction, onClose, className, ...rest }: ToastProps) {
  return (
    <div
      {...rest}
      className={cn(
        'sf-inverse flex w-full animate-pop-in items-center gap-gutter-sm rounded-md py-1 pl-gutter-md pr-1 shadow-2',
        className,
      )}
    >
      <p className="flex-1 py-2 text-body-md">{message}</p>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded px-3 text-label-lg font-semibold text-inverse-primary transition duration-state ease-out hover:opacity-80 active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
      {onClose && (
        <IconButton label="Cerrar aviso" tone="inverse" onClick={onClose}>
          <X aria-hidden="true" className="h-5 w-5" />
        </IconButton>
      )}
    </div>
  );
}
