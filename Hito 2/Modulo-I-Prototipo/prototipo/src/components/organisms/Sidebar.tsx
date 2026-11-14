import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Si se pasa, el ítem es un enlace; si no, un botón que llama a `onNavigate`. */
  href?: string;
}

export interface SidebarProps {
  /** Ítems visibles. Qué ve cada rol lo decide quien usa el componente. */
  items: SidebarItem[];
  activeId?: string;
  onNavigate?: (id: string) => void;
  /** Logo o nombre de la aplicación, arriba. */
  brand?: ReactNode;
  /** Contenido al pie: cuenta, tema, versión. */
  footer?: ReactNode;
  className?: string;
}

/** Menú lateral. Fondo oscuro propio en ambos temas (tokens `nav-*`). */
export function Sidebar({ items, activeId, onNavigate, brand, footer, className }: SidebarProps) {
  return (
    <nav aria-label="Navegación principal" className={cn('sf-nav flex h-full flex-col', className)}>
      {brand && <div className="flex h-topbar shrink-0 items-center px-gutter-md text-title-lg">{brand}</div>}
      <ul className="flex flex-1 flex-col gap-gutter-xs overflow-y-auto p-gutter-sm">
        {items.map((item) => {
          const activo = item.id === activeId;
          const clases = cn(
            'relative flex min-h-touch w-full items-center gap-3 rounded px-3 text-left text-label-lg',
            'transition-colors duration-state ease-out',
            activo ? 'bg-nav-active text-on-nav' : 'text-on-nav-muted hover:bg-nav-active hover:text-on-nav',
          );
          const contenido = (
            <>
              {activo && (
                <span aria-hidden="true" className="absolute bottom-2 left-0 top-2 w-[3px] rounded-full bg-nav-indicator" />
              )}
              {item.icon}
              <span>{item.label}</span>
            </>
          );
          return (
            <li key={item.id}>
              {item.href ? (
                <a
                  href={item.href}
                  aria-current={activo ? 'page' : undefined}
                  onClick={() => onNavigate?.(item.id)}
                  className={clases}
                >
                  {contenido}
                </a>
              ) : (
                <button
                  type="button"
                  aria-current={activo ? 'page' : undefined}
                  onClick={() => onNavigate?.(item.id)}
                  className={clases}
                >
                  {contenido}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {footer && <div className="shrink-0 border-t border-nav-active p-gutter-sm">{footer}</div>}
    </nav>
  );
}
