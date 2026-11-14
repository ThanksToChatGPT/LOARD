import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useEsEscritorio } from '@/hooks/useMediaQuery';
import { usePresence } from '@/hooks/usePresence';
import { cn } from '@/lib/cn';
import { Portal, Scrim, useScrollLock } from '../organisms/overlay';
import { Sidebar, type SidebarProps } from '../organisms/Sidebar';
import { Topbar, type TopbarProps } from '../organisms/Topbar';

export interface AppShellProps {
  nav: SidebarProps;
  topbar: Omit<TopbarProps, 'onMenuClick' | 'menuOpen'>;
  /** Franja bajo la topbar, fija al hacer scroll: `OfflineQueueBanner`. */
  banner?: ReactNode;
  children: ReactNode;
}

/**
 * Estructura común de todas las pantallas (§4, §11.1): menú lateral fijo de 256 px
 * desde 1024 px y temporal por debajo, topbar de 64 px, franja de avisos y contenido.
 */
export function AppShell({ nav, topbar, banner, children }: AppShellProps) {
  const esEscritorio = useEsEscritorio();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const abierto = menuAbierto && !esEscritorio;
  const { montado, saliendo } = usePresence(abierto);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (esEscritorio) setMenuAbierto(false);
  }, [esEscritorio]);

  useFocusTrap(panel, abierto, { onEscape: () => setMenuAbierto(false) });
  useScrollLock(abierto);

  return (
    <div className="sf-page min-h-dvh">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-gutter-sm focus:top-gutter-sm focus:z-[70] focus:rounded focus:bg-primary focus:px-gutter-md focus:py-3 focus:text-label-lg focus:text-on-primary"
      >
        Saltar al contenido
      </a>

      {esEscritorio && (
        <aside className="fixed inset-y-0 left-0 z-30 w-sidebar">
          <Sidebar {...nav} />
        </aside>
      )}

      {montado && (
        <Portal>
          <div className="fixed inset-0 z-50">
            <Scrim saliendo={saliendo} onClick={() => setMenuAbierto(false)} />
            <div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-label="Menú"
              tabIndex={-1}
              className={cn(
                'absolute inset-y-0 left-0 w-sidebar max-w-[85vw] shadow-2',
                saliendo ? 'animate-slide-out-left' : 'animate-slide-in-left',
              )}
            >
              <Sidebar
                {...nav}
                onNavigate={(id) => {
                  setMenuAbierto(false);
                  nav.onNavigate?.(id);
                }}
              />
            </div>
          </div>
        </Portal>
      )}

      <div className="flex min-h-dvh flex-col desktop:pl-sidebar">
        <Topbar {...topbar} menuOpen={abierto} onMenuClick={() => setMenuAbierto(true)} />
        {banner && <div className="sticky top-topbar z-20">{banner}</div>}
        <main id="contenido" tabIndex={-1} className="flex-1 py-gutter-lg focus-visible:shadow-none">
          {children}
        </main>
      </div>
    </div>
  );
}
