import type { DossierDemo } from '@/features/dossier/modelo';
import type { Registro } from './datos';

/** Fuente compartida CW-118; conserva los retirados para la consulta histórica. */
export function registrosDossier(dossier: DossierDemo, incluirRetirados = false): Registro[] {
  return dossier.items.filter(i => incluirRetirados || !i.retirado).map(item => ({
    id: item.id, proyecto: 'CW-118', nombre: `${item.nombre}${item.retirado ? ' (retirado)' : ''}`,
    tipo: 'requisito', carpeta: item.carpeta, estado: item.estado,
    eventos: item.historial.map((e, i) => ({ id: `${item.id}-${i}`, fecha: new Date(e.fecha), usuario: e.usuario, rol: e.rol,
      estadoAnterior: e.anterior, estadoNuevo: e.nuevo, motivo: e.motivo })),
  }));
}
