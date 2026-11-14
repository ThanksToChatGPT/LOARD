/**
 * Formatos de fecha, hora y tamaño. Todo se muestra en la zona America/Bogota.
 *
 * Una fecha sin hora (vencimiento, expedición) se maneja como texto 'AAAA-MM-DD'
 * para que no cambie de día al pasar por zonas horarias.
 */

export type FechaCalendario = string; // 'AAAA-MM-DD'

const ZONA = 'America/Bogota';
const MS_DIA = 86_400_000;
const DESFASE_BOGOTA_MS = 5 * 3_600_000; // UTC-5, sin horario de verano

const partes = new Intl.DateTimeFormat('es-CO', {
  timeZone: ZONA,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function descomponer(fecha: Date): Record<string, string> {
  return Object.fromEntries(partes.formatToParts(fecha).map((p) => [p.type, p.value]));
}

/** Número de día calendario (en Bogotá) para comparar fechas entre sí. */
export function numeroDeDia(fecha: Date | FechaCalendario): number {
  if (typeof fecha === 'string') {
    const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number);
    return Math.floor(Date.UTC(anio, mes - 1, dia) / MS_DIA);
  }
  return Math.floor((fecha.getTime() - DESFASE_BOGOTA_MS) / MS_DIA);
}

/** Días calendario entre hoy y la fecha. Negativo si ya pasó. */
export function diasRestantes(fecha: Date | FechaCalendario, hoy: Date | FechaCalendario = new Date()): number {
  return numeroDeDia(fecha) - numeroDeDia(hoy);
}

/** DD/MM/AAAA */
export function formatoFecha(fecha: Date | FechaCalendario): string {
  if (typeof fecha === 'string') {
    const [anio, mes, dia] = fecha.slice(0, 10).split('-');
    return `${dia}/${mes}/${anio}`;
  }
  const p = descomponer(fecha);
  return `${p.day}/${p.month}/${p.year}`;
}

/** HH:mm (24 horas) */
export function formatoHora(fecha: Date): string {
  const p = descomponer(fecha);
  return `${p.hour}:${p.minute}`;
}

/** DD/MM/AAAA HH:mm:ss, formato de la bitácora (§10). */
export function formatoFechaHora(fecha: Date): string {
  const p = descomponer(fecha);
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}:${p.second}`;
}

/** Tamaño de archivo en MB con un decimal: «2,4 MB». */
export function formatoMB(bytes: number): string {
  return `${(bytes / 1_048_576).toFixed(1).replace('.', ',')} MB`;
}

/** «1 día» / «12 días» */
export function plural(cantidad: number, singular: string, pluralTexto: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : pluralTexto}`;
}
