import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

/** Dibuja su contenido al final de `<body>`, por encima de la página. */
export function Portal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}

/** Impide que la página de fondo se desplace mientras hay una capa abierta. */
export function useScrollLock(activo: boolean) {
  useEffect(() => {
    if (!activo) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo;
    };
  }, [activo]);
}

/** Fondo atenuado detrás de modales y menú temporal. Un clic o toque lo cierra. */
export function Scrim({ saliendo, onClick }: { saliendo: boolean; onClick: () => void }) {
  return (
    <div
      aria-hidden="true"
      onClick={onClick}
      className={cn('absolute inset-0 bg-scrim', saliendo ? 'animate-fade-out' : 'animate-fade-in')}
    />
  );
}
