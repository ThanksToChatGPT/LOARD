/** Búsqueda y filtros de la lista de cortes. */

import { sinTildes } from '@/lib/formato';
import type { CorteDemo } from './modeloDemo';

export interface FiltrosCortes {
  /** Texto libre: número, residente, frente, ciudad o cliente. */
  busqueda: string;
  /** Estado del corte. Vacío: todos. No se aplica mientras hay texto en el buscador. */
  estado: string;
  /** Rango de fechas 'AAAA-MM-DD'. Entra todo corte cuyo periodo toque el rango. */
  desde: string;
  hasta: string;
  ciudad: string;
  cliente: string;
}

export const SIN_FILTROS: FiltrosCortes = { busqueda: '', estado: '', desde: '', hasta: '', ciudad: '', cliente: '' };

/** Cuando se escribe en el buscador, la búsqueda mira los cortes de todos los estados. */
export function buscaEnTodosLosEstados(filtros: FiltrosCortes): boolean {
  return filtros.busqueda.trim() !== '' && filtros.estado !== '';
}

/**
 * Cortes que cumplen la búsqueda y los filtros.
 * Los cortes guardados sin ciudad ni cliente siguen saliendo mientras no se filtre por esos datos.
 */
export function filtrarCortes(cortes: CorteDemo[], filtros: FiltrosCortes): CorteDemo[] {
  const texto = sinTildes(filtros.busqueda.trim());
  return cortes.filter(corte => {
    const { estado, datos } = corte.versiones[0];
    if (!texto && filtros.estado && estado !== filtros.estado) return false;
    if (filtros.desde && datos.fin < filtros.desde) return false;
    if (filtros.hasta && datos.inicio > filtros.hasta) return false;
    if (filtros.ciudad && datos.ciudad !== filtros.ciudad) return false;
    if (filtros.cliente && datos.cliente !== filtros.cliente) return false;
    return !texto || sinTildes(`${corte.numero} corte #${corte.numero} ${corte.autorNombre} ${datos.frente} ${datos.ciudad ?? ''} ${datos.cliente ?? ''}`).includes(texto);
  });
}
