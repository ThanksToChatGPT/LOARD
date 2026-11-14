/**
 * Reglas del selector de personal del corte (HU-M10, design.md §6.2A).
 * Funciones puras para poder probarlas sin pantalla.
 */

import type { EstadoSST } from '@/lib/estados';
import { sinTildes } from '@/lib/formato';
import { esAsignable } from '@/lib/semaforo';
import type { EvaluacionSST, ItemSST } from '@/lib/sst/evaluacion';
import type { FilaPersonal } from '@/lib/sst/SstContext';

export interface OpcionesPersonal {
  /** Se pueden agregar al corte. Por nombre. */
  asignables: FilaPersonal[];
  /** Vencidos o No Habilitado: aparecen, pero abajo y sin poder marcarse. Por nombre. */
  bloqueados: FilaPersonal[];
}

const porNombre = (a: FilaPersonal, b: FilaPersonal) => a.trabajador.nombre.localeCompare(b.trabajador.nombre, 'es');

/** Coincide por nombre, cédula (con o sin puntos), cargo o frente, sin importar tildes. */
export function coincide(fila: FilaPersonal, busqueda: string): boolean {
  const q = sinTildes(busqueda.trim()).replace(/\./g, '');
  if (!q) return true;
  const t = fila.trabajador;
  return sinTildes(`${t.nombre} ${t.cedula} ${t.cargo} ${t.frente}`).includes(q);
}

/** Todos los trabajadores que coinciden con la búsqueda, con los bloqueados aparte. */
export function opcionesPersonal(filas: FilaPersonal[], busqueda: string): OpcionesPersonal {
  const visibles = filas.filter((f) => coincide(f, busqueda));
  return {
    asignables: visibles.filter((f) => esAsignable(f.evaluacion.estado)).sort(porNombre),
    bloqueados: visibles.filter((f) => !esAsignable(f.evaluacion.estado)).sort(porNombre),
  };
}

const ALERTAS: EstadoSST[] = ['Próximo a Vencer (15d)', 'Próximo a Vencer (30d)'];

/** Cursos o aptitud que vencen en 30 días o menos, el más próximo primero. */
export function alertasDeVigencia(evaluacion: EvaluacionSST): ItemSST[] {
  return evaluacion.items
    .filter((i) => ALERTAS.includes(i.estado))
    .sort((a, b) => (a.dias ?? 0) - (b.dias ?? 0));
}

/** «Trabajo en alturas vence en 12 días». */
export function textoAlerta(item: ItemSST): string {
  return `${item.etiqueta} ${item.causa}`;
}

/** Conteo de trabajadores elegidos por su alerta más urgente. */
export function conteoAlertas(filas: FilaPersonal[]): { d15: number; d30: number } {
  let d15 = 0;
  let d30 = 0;
  for (const f of filas) {
    const estados = alertasDeVigencia(f.evaluacion).map((i) => i.estado);
    if (estados.includes('Próximo a Vencer (15d)')) d15++;
    else if (estados.includes('Próximo a Vencer (30d)')) d30++;
  }
  return { d15, d30 };
}
