/** Constantes de negocio compartidas por todas las pantallas. */

export const ROLES = [
  'Ingeniero Residente',
  'Director de Proyectos',
  'Coordinación SIG / Calidad',
  'Coordinación SST',
  'Gerencia',
] as const;
export type Rol = (typeof ROLES)[number];

/** Las 6 carpetas contractuales del dossier de calidad. */
export const CARPETAS_DOSSIER = [
  { numero: 1, nombre: 'Documentación contractual y legal' },
  { numero: 2, nombre: 'Actas de corte de obra' },
  { numero: 3, nombre: 'Planos de ingeniería' },
  { numero: 4, nombre: 'Certificados de materiales, equipos y NDT' },
  { numero: 5, nombre: 'Informes técnicos de obra' },
  { numero: 6, nombre: 'Memorias de cálculo' },
] as const;

/** Plazo contractual para radicar el dossier tras aceptar el acta de facturación. */
export const PLAZO_DOSSIER_DIAS = 10;

/** Tiempo para «Deshacer» antes de escribir en la bitácora (§6.2B). */
export const UNDO_MS = 5000;

/** Largo mínimo del comentario al devolver u observar (§6.2B). */
export const OBSERVACION_MIN_CARACTERES = 10;

/** Espera antes de autoguardar un borrador local (§8.1). */
export const BORRADOR_DEBOUNCE_MS = 500;

/** Clave de localStorage del borrador de un corte (§8.1). */
export function claveBorradorCorte(proyectoId: string | number, usuarioId: string | number): string {
  return `loard_draft_corte_proj_${proyectoId}_user_${usuarioId}`;
}
