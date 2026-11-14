import { CloudOff, Lock, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { PRESENTACION_ESTADO, type EstadoOficial, type IconoEstado } from '@/lib/estados';
import { Badge } from './Badge';

export interface StatusBadgeProps {
  /** Estado oficial: decide color, ícono y texto. */
  estado: EstadoOficial;
  /** Texto más específico que el nombre del estado: «Bloqueado: Alturas vencido hace 4 días». */
  children?: ReactNode;
  id?: string;
  className?: string;
}

const ICONO: Record<IconoEstado, ReactNode> = {
  alerta: <TriangleAlert aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />,
  candado: <Lock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />,
  'nube-tachada': <CloudOff aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />,
};

export function StatusBadge({ estado, children, id, className }: StatusBadgeProps) {
  const { tono, icono, enfasis } = PRESENTACION_ESTADO[estado];
  return (
    <Badge tone={tono} icon={icono && ICONO[icono]} emphasis={enfasis} id={id} className={className}>
      {children ?? estado}
    </Badge>
  );
}
