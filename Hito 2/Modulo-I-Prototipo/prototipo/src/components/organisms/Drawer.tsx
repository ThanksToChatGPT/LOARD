import { X } from 'lucide-react';
import { useId, useRef, type ReactNode } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useEsEscritorio } from '@/hooks/useMediaQuery';
import { usePresence } from '@/hooks/usePresence';
import { cn } from '@/lib/cn';
import { IconButton } from '../atoms/IconButton';
import { Portal, Scrim, useScrollLock } from './overlay';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Metadatos bajo el título: autor del cargue, fecha y hora, junta vinculada. */
  meta?: ReactNode;
  children: ReactNode;
  /** Acciones fijas al pie: «Validar Documento», «Observar Documento». */
  footer?: ReactNode;
  /** Atenúa la página de fondo. Sin él, la lista de la izquierda sigue visible (§7.2). */
  scrim?: boolean;
}

/**
 * Panel lateral derecho desde 1024 px (visor de soportes, ficha de trabajador).
 * Por debajo de 1024 px ocupa toda la pantalla.
 */
export function Drawer({ open, onClose, title, meta, children, footer, scrim = false }: DrawerProps) {
  const { montado, saliendo } = usePresence(open);
  const esEscritorio = useEsEscritorio();
  const panel = useRef<HTMLDivElement>(null);
  const tituloId = useId();

  useFocusTrap(panel, open, { onEscape: onClose });
  useScrollLock(open && (scrim || !esEscritorio));

  if (!montado) return null;

  return (
    <Portal>
      <div className={cn('fixed inset-0 z-40', !scrim && 'pointer-events-none')}>
        {scrim && <Scrim saliendo={saliendo} onClick={onClose} />}
        <div
          ref={panel}
          role="dialog"
          aria-modal={scrim || !esEscritorio}
          aria-labelledby={tituloId}
          tabIndex={-1}
          className={cn(
            'sf-container pointer-events-auto absolute inset-0 flex flex-col shadow-2',
            'desktop:left-auto desktop:w-[min(45vw,640px)] desktop:border-l desktop:border-outline-variant',
            saliendo ? 'animate-slide-out-right' : 'animate-slide-in-right',
          )}
        >
          <header className="flex items-start gap-gutter-sm border-b border-outline-variant py-gutter-sm pl-gutter-md pr-gutter-sm">
            <div className="min-w-0 flex-1 py-1">
              <h2 id={tituloId} className="break-words text-headline-sm">
                {title}
              </h2>
              {meta && <div className="mt-gutter-xs text-body-sm text-on-surface-muted">{meta}</div>}
            </div>
            <IconButton label="Cerrar" onClick={onClose}>
              <X aria-hidden="true" className="h-5 w-5" />
            </IconButton>
          </header>

          <div className="flex-1 overflow-y-auto p-gutter-md">{children}</div>

          {footer && (
            <footer className="flex flex-wrap justify-end gap-gutter-sm border-t border-outline-variant p-gutter-md">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </Portal>
  );
}
