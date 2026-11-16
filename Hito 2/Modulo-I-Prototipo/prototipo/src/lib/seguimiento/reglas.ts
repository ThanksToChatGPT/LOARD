import { ESTADOS_REQUISITO } from '@/lib/estados';
import { numeroDeDia } from '@/lib/formato';
import type { Registro } from './datos';

export function porcentajeTiempo(inicio: string | null, fin: string | null, hoy: string): number | null {
  if (!inicio || !fin) return null;
  const fechas = [inicio, fin, hoy];
  if (fechas.some(f => !/^\d{4}-\d{2}-\d{2}$/.test(f) || !Number.isFinite(Date.parse(f)) || new Date(f).toISOString().slice(0,10) !== f)) return null;
  const duracion = numeroDeDia(fin) - numeroDeDia(inicio);
  if (!Number.isFinite(duracion) || duracion <= 0) return null;
  return Math.max(0, (numeroDeDia(hoy) - numeroDeDia(inicio)) / duracion * 100);
}
export function resumenDossier(registros: Registro[]) {
  const requisitos = registros.filter(r => r.tipo === 'requisito');
  const conteos = Object.fromEntries(ESTADOS_REQUISITO.map(e => [e, requisitos.filter(r => r.estado === e).length]));
  const total = requisitos.length;
  return { total, conteos, validados: conteos[ESTADOS_REQUISITO[3]],
    porcentaje: total ? conteos[ESTADOS_REQUISITO[3]] / total * 100 : null };
}
export function historial(registros: Registro[], proyecto: string, registro: string) {
  return [...(registros.find(r => r.proyecto === proyecto && r.id === registro)?.eventos ?? [])]
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime() || b.id.localeCompare(a.id));
}
export const porcentaje = (n: number | null) => n == null ? 'Sin datos' : `${n.toLocaleString('es-CO', { maximumFractionDigits: 1 })} %`;
