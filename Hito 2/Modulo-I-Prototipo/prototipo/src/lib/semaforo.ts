/**
 * Semáforo SST (HU-M09, HU-M10). Funciones puras: reciben la fecha de hoy
 * para poder probarse y para que todas las pantallas calculen igual.
 */

import type { EstadoSST } from './estados';
import { diasRestantes, formatoFecha, plural, type FechaCalendario } from './formato';

export const DIAS_ALERTA_30 = 30;
export const DIAS_ALERTA_15 = 15;

export type ConceptoMedico = 'Habilitado' | 'No Habilitado';

/** Estado de un curso o de la vigencia de la aptitud médica según su vencimiento. */
export function calcularEstadoSST(
  vencimiento: Date | FechaCalendario,
  hoy: Date | FechaCalendario = new Date(),
): EstadoSST {
  const dias = diasRestantes(vencimiento, hoy);
  if (dias < 0) return 'Vencido';
  if (dias <= DIAS_ALERTA_15) return 'Próximo a Vencer (15d)';
  if (dias <= DIAS_ALERTA_30) return 'Próximo a Vencer (30d)';
  return 'Habilitado';
}

/** Gravedad para ordenar «Críticos primero»: mayor número, más urgente. */
export const GRAVEDAD_SST: Record<EstadoSST, number> = {
  Habilitado: 0,
  'Próximo a Vencer (30d)': 1,
  'Próximo a Vencer (15d)': 2,
  Vencido: 3,
  'No Habilitado': 3,
};

export interface HabilitacionSST {
  /** Vencimiento de cada curso obligatorio. */
  vencimientosCursos: Array<Date | FechaCalendario>;
  aptitud: { concepto: ConceptoMedico; vencimiento: Date | FechaCalendario };
}

/** El peor estado entre los cursos obligatorios y la aptitud médica. */
export function estadoGeneral(
  habilitacion: HabilitacionSST,
  hoy: Date | FechaCalendario = new Date(),
): EstadoSST {
  if (habilitacion.aptitud.concepto === 'No Habilitado') return 'No Habilitado';
  const estados = [...habilitacion.vencimientosCursos, habilitacion.aptitud.vencimiento].map((v) =>
    calcularEstadoSST(v, hoy),
  );
  return estados.reduce<EstadoSST>(
    (peor, actual) => (GRAVEDAD_SST[actual] > GRAVEDAD_SST[peor] ? actual : peor),
    'Habilitado',
  );
}

/** Vencido y No Habilitado no se pueden asignar a un corte de obra. */
export function esAsignable(estado: EstadoSST): boolean {
  return estado !== 'Vencido' && estado !== 'No Habilitado';
}

/** Para `Array.sort`: primero los más graves. */
export function compararCriticosPrimero(a: EstadoSST, b: EstadoSST): number {
  return GRAVEDAD_SST[b] - GRAVEDAD_SST[a];
}

/** Texto que acompaña al estado: «Vence en 12 días», «Vencido hace 4 días»… */
export function textoVencimiento(
  vencimiento: Date | FechaCalendario,
  hoy: Date | FechaCalendario = new Date(),
): string {
  const dias = diasRestantes(vencimiento, hoy);
  if (dias < 0) return `Vencido hace ${plural(-dias, 'día', 'días')}`;
  if (dias === 0) return 'Vence hoy';
  if (dias <= DIAS_ALERTA_30) return `Vence en ${plural(dias, 'día', 'días')}`;
  return `Vigente · vence el ${formatoFecha(vencimiento)}`;
}
