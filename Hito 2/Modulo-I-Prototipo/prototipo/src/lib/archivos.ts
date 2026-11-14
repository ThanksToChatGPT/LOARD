/** Reglas de carga de soportes (design.md §7.2). */

import { formatoMB } from './formato';

export const ARCHIVO_EXTENSIONES = ['.pdf', '.jpg', '.jpeg', '.png'] as const;
export const ARCHIVO_ACCEPT = ARCHIVO_EXTENSIONES.join(',');
export const ARCHIVO_MAX_BYTES = 15 * 1_048_576;
export const ARCHIVO_AYUDA = 'Selecciona archivos PDF, JPG o PNG (máx. 15 MB por archivo)';

/** Devuelve el motivo del rechazo, o `null` si el archivo se puede subir. */
export function validarArchivo(archivo: { name: string; size: number }): string | null {
  const nombre = archivo.name.toLowerCase();
  if (!ARCHIVO_EXTENSIONES.some((ext) => nombre.endsWith(ext))) {
    return `«${archivo.name}» no es PDF, JPG ni PNG. Selecciona un archivo en uno de esos formatos.`;
  }
  if (archivo.size > ARCHIVO_MAX_BYTES) {
    return `«${archivo.name}» pesa ${formatoMB(archivo.size)} y el máximo es 15 MB. Reduce el archivo y vuelve a seleccionarlo.`;
  }
  return null;
}
