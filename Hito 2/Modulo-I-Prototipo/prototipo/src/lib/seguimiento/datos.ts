import { ESTADOS_CORTE, ESTADOS_REQUISITO, type EstadoRequisito } from '@/lib/estados';
import type { TimelineEntry } from '@/components';

export const FECHA_DEMO = '2026-11-17';
export const ACTUALIZADO = '2026-11-17T14:30:00-05:00';
export const CARPETAS = [
  'Documentación contractual y legal', 'Actas de corte de obra', 'Planos de ingeniería',
  'Certificados de materiales, equipos y NDT', 'Informes técnicos de obra', 'Memorias de cálculo',
] as const;
export interface ProyectoResumen {
  id: string; nombre: string; inicio: string | null; fin: string | null;
  avanceFisico: number | null; aceptacionActa: string | null;
}
export interface Registro {
  id: string; proyecto: string; nombre: string; tipo: 'corte' | 'requisito'; carpeta?: number;
  estado: string; eventos: TimelineEntry[];
}
export const PROYECTOS: ProyectoResumen[] = [
  { id: 'CW-118', nombre: 'Estación compresora', inicio: '2026-09-01', fin: '2026-12-17', avanceFisico: 68, aceptacionActa: '2026-11-10' },
  { id: 'CW-204', nombre: 'Adecuación de plataforma', inicio: '2026-11-01', fin: '2027-01-15', avanceFisico: 12, aceptacionActa: null },
];
const [pendiente, cargado, observado, validado] = ESTADOS_REQUISITO;
const [revision, visado, devuelto] = ESTADOS_CORTE;
const nombres = [
  ['Contrato y orden de servicio', 'Pólizas vigentes'], ['Acta de avance', 'Corte operativo visado'],
  ['Plano mecánico', 'Plano as-built'], ['Certificado de material', 'Reporte NDT de junta J-04'],
  ['Informe semanal', 'Informe final'], ['Memoria de cálculo', 'Soporte de ingeniería'],
];
const estados: EstadoRequisito[] = [validado, validado, validado, cargado, validado, pendiente, validado, observado, validado, pendiente, validado, cargado];
function evento(id: string, fecha: string, anterior: string, nuevo: string, motivo?: string): TimelineEntry {
  return { id, fecha: new Date(fecha), usuario: 'Laura Torres', rol: 'Coordinación SIG / Calidad', estadoAnterior: anterior, estadoNuevo: nuevo, motivo };
}
// Todos los nombres, contratos y eventos de este archivo son ficticios.
export const REGISTROS: Registro[] = PROYECTOS.flatMap((p, proyectoIndex) => {
  const requisitos: Registro[] = nombres.flatMap((par, carpeta) => par.map((nombre, posicion) => {
    const i = carpeta * 2 + posicion;
    const estado = proyectoIndex === 0 ? estados[i] : (i < 2 ? validado : pendiente);
    const id = `${p.id}-R${i + 1}`;
    const eventos: TimelineEntry[] = estado === pendiente ? [] : [evento(`${id}-1`, '2026-11-12T08:15:00-05:00', pendiente, cargado)];
    if (estado === validado || estado === observado) eventos.push(evento(`${id}-2`, '2026-11-16T10:35:20-05:00', cargado, estado,
      estado === observado ? 'El número de junta del soporte no coincide con J-04.' : 'Soporte revisado y asociado al requisito.'));
    return { id, proyecto: p.id, nombre, tipo: 'requisito', carpeta: carpeta + 1, estado, eventos };
  }));
  return [{ id: `${p.id}-C04`, proyecto: p.id, nombre: 'Corte #04 · periodo semanal', tipo: 'corte', estado: visado,
    eventos: [
      { ...evento(`${p.id}-C04-1`, '2026-11-11T08:00:00-05:00', revision, devuelto, 'Revisar las horas del periodo y completar la observación.'), usuario: 'Carlos Rojas', rol: 'Director de Proyectos' },
      { ...evento(`${p.id}-C04-2`, '2026-11-12T09:10:00-05:00', devuelto, revision, 'Horas corregidas y soporte actualizado.'), usuario: 'Ana Ruiz', rol: 'Ingeniero Residente' },
      { ...evento(`${p.id}-C04-3`, '2026-11-16T11:25:30-05:00', revision, visado, 'Corte revisado técnicamente.'), usuario: 'Carlos Rojas', rol: 'Director de Proyectos' },
    ] }, ...requisitos];
});
