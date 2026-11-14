/**
 * Reloj del prototipo. Todas las fechas de ejemplo se calculan desde el 17/11/2026
 * para que la lista muestre cada estado del semáforo, sin importar el día en que se abra.
 */

import type { FechaCalendario } from '@/lib/formato';

export const HOY_SST: FechaCalendario = '2026-11-17';

const MS_DIA = 86_400_000;
const DESFASE_BOGOTA_MS = 5 * 3_600_000;
const [ANIO, MES, DIA] = HOY_SST.split('-').map(Number);
const MEDIANOCHE_BOGOTA = Date.UTC(ANIO, MES - 1, DIA) + DESFASE_BOGOTA_MS;

/** Fecha calendario a `n` días de hoy (negativo: en el pasado). */
export function enDias(n: number): FechaCalendario {
  return new Date(Date.UTC(ANIO, MES - 1, DIA + n)).toISOString().slice(0, 10);
}

/** Fecha y hora en Bogotá, `n` días antes o después de hoy. */
export function momento(n: number, hora: string): Date {
  const [h, m] = hora.split(':').map(Number);
  return new Date(MEDIANOCHE_BOGOTA + n * MS_DIA + (h * 60 + m) * 60_000);
}

/** «Ahora» dentro del prototipo: el 17/11 a la hora actual de Bogotá. */
export function ahora(): Date {
  const transcurrido = (((Date.now() - DESFASE_BOGOTA_MS) % MS_DIA) + MS_DIA) % MS_DIA;
  return new Date(MEDIANOCHE_BOGOTA + transcurrido);
}

/** Hora de la última sincronización de los datos SST en el dispositivo. */
export const SINCRONIZADO_EN = momento(0, '06:10');
