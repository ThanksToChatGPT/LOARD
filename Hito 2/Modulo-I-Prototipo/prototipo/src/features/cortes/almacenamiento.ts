import { CORTE_BORRADOR } from './datos';

const CLAVE = `loard_prototipo_personal_${CORTE_BORRADOR.numero}_${CORTE_BORRADOR.frente}`;

/** Selección de la demostración guardada en este navegador. */
export function leerPersonal(): string[] {
  try {
    const datos: unknown = JSON.parse(localStorage.getItem(CLAVE) ?? 'null');
    if (!Array.isArray(datos) || !datos.every((id) => typeof id === 'string')) return [];
    return [...new Set(datos)];
  } catch {
    return [];
  }
}

/** La pantalla confirma el guardado únicamente si el navegador lo acepta. */
export function guardarPersonal(ids: string[]): void {
  localStorage.setItem(CLAVE, JSON.stringify(ids));
}
