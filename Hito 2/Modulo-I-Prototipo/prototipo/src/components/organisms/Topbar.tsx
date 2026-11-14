import { Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import { IconButton } from '../atoms/IconButton';

export interface TopbarProps {
  /** Proyecto o contrato activo (texto o selector). */
  project: ReactNode;
  /** `ConnectionIndicator` con el estado de la conexión. */
  connection?: ReactNode;
  /** Rol del usuario. Solo se muestra en escritorio; en móvil va en el menú de cuenta. */
  role?: string;
  /** Alertas, cuenta y otras acciones a la derecha. */
  actions?: ReactNode;
  /** Abre el menú temporal. El botón solo existe por debajo de 1024 px. */
  onMenuClick?: () => void;
  menuOpen?: boolean;
}

/** Barra de contexto de 64 px, fija arriba. */
export function Topbar({ project, connection, role, actions, onMenuClick, menuOpen = false }: TopbarProps) {
  return (
    <header className="sf-container sticky top-0 z-30 flex h-topbar items-center gap-gutter-sm border-b border-outline-variant px-gutter-sm tablet:px-gutter-md">
      {onMenuClick && (
        <IconButton
          label="Abrir menú"
          aria-expanded={menuOpen}
          aria-haspopup="dialog"
          onClick={onMenuClick}
          className="desktop:hidden"
        >
          <Menu aria-hidden="true" className="h-6 w-6" />
        </IconButton>
      )}
      <div className="min-w-0 flex-1 truncate text-title-lg desktop:pl-gutter-sm">{project}</div>
      {connection}
      {role && (
        <span className="hidden border-l border-outline-variant pl-gutter-md text-label-lg text-on-surface-muted desktop:inline">
          {role}
        </span>
      )}
      {actions}
    </header>
  );
}
