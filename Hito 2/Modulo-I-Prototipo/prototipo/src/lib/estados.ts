/**
 * Estados oficiales (design.md §10). Son idénticos en la base de datos,
 * la API y las insignias: nunca escribirlos a mano en una pantalla.
 */

export const ESTADOS_SST = [
  'Habilitado',
  'Próximo a Vencer (30d)',
  'Próximo a Vencer (15d)',
  'Vencido',
  'No Habilitado',
] as const;
export type EstadoSST = (typeof ESTADOS_SST)[number];

export const ESTADOS_CORTE = ['En Revisión (Enviado)', 'Visado', 'Devuelto con Observaciones'] as const;
export type EstadoCorte = (typeof ESTADOS_CORTE)[number];

export const ESTADOS_REQUISITO = ['Pendiente', 'Archivo Cargado', 'Observado', 'Validado'] as const;
export type EstadoRequisito = (typeof ESTADOS_REQUISITO)[number];

/** Solo existe en el dispositivo: corte en la cola sin conexión (§8.3). */
export const ESTADO_LOCAL = 'Pendiente de envío' as const;
export type EstadoLocal = typeof ESTADO_LOCAL;

export type EstadoOficial = EstadoSST | EstadoCorte | EstadoRequisito | EstadoLocal;

/** Familia de color de una insignia. `neutral` y `local` no usan color de estado. */
export type Tono = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'local';

export type IconoEstado = 'alerta' | 'candado' | 'nube-tachada';

export interface PresentacionEstado {
  tono: Tono;
  /** Reemplaza el punto de 8 px cuando el color no basta para distinguir. */
  icono?: IconoEstado;
  /** Texto en negrita: diferencia 15d de 30d, que comparten `warning`. */
  enfasis?: boolean;
}

export const PRESENTACION_ESTADO: Record<EstadoOficial, PresentacionEstado> = {
  // Personal SST
  Habilitado: { tono: 'success' },
  'Próximo a Vencer (30d)': { tono: 'warning' },
  'Próximo a Vencer (15d)': { tono: 'warning', icono: 'alerta', enfasis: true },
  Vencido: { tono: 'error', icono: 'candado' },
  'No Habilitado': { tono: 'error', icono: 'candado' },
  // Cortes de obra
  'En Revisión (Enviado)': { tono: 'info' },
  Visado: { tono: 'success' },
  'Devuelto con Observaciones': { tono: 'warning' },
  // Checklist del dossier
  Pendiente: { tono: 'neutral' },
  'Archivo Cargado': { tono: 'info' },
  Observado: { tono: 'warning' },
  Validado: { tono: 'success' },
  // Local
  'Pendiente de envío': { tono: 'local', icono: 'nube-tachada' },
};
