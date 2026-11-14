import { X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { usePresence } from '@/hooks/usePresence';
import { cn } from '@/lib/cn';
import { Button } from '../atoms/Button';
import { IconButton } from '../atoms/IconButton';
import { Portal, Scrim, useScrollLock } from './overlay';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Botones de acción. La acción principal va a la derecha. */
  footer?: ReactNode;
  /** Control que recibe el foco al abrir. Ver `useFocusTrap`. */
  initialFocus?: RefObject<HTMLElement | null>;
  /**
   * Hay texto escrito sin confirmar. `Esc`, la X y el clic en el fondo
   * preguntan antes de cerrar, dentro del mismo diálogo (§11.4).
   */
  dirty?: boolean;
  discardQuestion?: string;
  discardLabel?: string;
  keepLabel?: string;
}

/** Confirmaciones y formularios cortos (visar, devolver con observaciones). */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  initialFocus,
  dirty = false,
  discardQuestion = '¿Descartar los cambios?',
  discardLabel = 'Descartar',
  keepLabel = 'Seguir editando',
}: DialogProps) {
  const { montado, saliendo } = usePresence(open);
  const panel = useRef<HTMLDivElement>(null);
  const tituloId = useId();
  const descripcionId = useId();
  const [preguntando, setPreguntando] = useState(false);

  useEffect(() => {
    if (!open) setPreguntando(false);
  }, [open]);

  const pedirCierre = () => {
    if (preguntando) setPreguntando(false);
    else if (dirty) setPreguntando(true);
    else onClose();
  };

  useFocusTrap(panel, open, { onEscape: pedirCierre, focoInicial: initialFocus });
  useScrollLock(open);

  if (!montado) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-end justify-center p-gutter-md tablet:items-center">
        <Scrim saliendo={saliendo} onClick={pedirCierre} />
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={tituloId}
          aria-describedby={description ? descripcionId : undefined}
          tabIndex={-1}
          className={cn(
            'sf-container relative flex max-h-[calc(100dvh-32px)] w-full max-w-[520px] flex-col rounded-lg shadow-2',
            saliendo ? 'animate-fade-out' : 'animate-pop-in',
          )}
        >
          <header className="flex items-start gap-gutter-sm pb-gutter-sm pl-gutter-lg pr-gutter-sm pt-gutter-sm">
            <h2 id={tituloId} className="flex-1 pt-3 text-headline-sm">
              {title}
            </h2>
            <IconButton label="Cerrar" onClick={pedirCierre}>
              <X aria-hidden="true" className="h-5 w-5" />
            </IconButton>
          </header>

          <div className="flex flex-col gap-gutter-md overflow-y-auto px-gutter-lg pb-gutter-md">
            {description && (
              <p id={descripcionId} className="text-body-md text-on-surface-muted">
                {description}
              </p>
            )}
            {children}
          </div>

          {preguntando ? (
            <div
              role="group"
              aria-label={discardQuestion}
              className="flex flex-col gap-gutter-sm border-t border-outline-variant p-gutter-md tablet:flex-row tablet:items-center tablet:justify-between"
            >
              <p className="text-title-md">{discardQuestion}</p>
              <div className="flex flex-wrap gap-gutter-sm">
                <Button variant="ghost" onClick={onClose}>
                  {discardLabel}
                </Button>
                <Button variant="secondary" autoFocus onClick={() => setPreguntando(false)}>
                  {keepLabel}
                </Button>
              </div>
            </div>
          ) : (
            footer && (
              <footer className="flex flex-wrap justify-end gap-gutter-sm border-t border-outline-variant p-gutter-md">
                {footer}
              </footer>
            )
          )}
        </div>
      </div>
    </Portal>
  );
}
