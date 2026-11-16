import type { Zippable } from 'fflate';
import { CARPETAS_DOSSIER } from '@/lib/constantes';
import { HOY_SST } from '@/lib/sst/fechas';
import { itemsActivos, urlArchivoSesion, type DossierDemo } from './modelo';

const DIA = 86_400_000;
/** Días calendario: el día de aceptación es el día cero; vence al finalizar el día diez. */
export function plazoDossier(aceptada?: string, hoy = HOY_SST) {
  if (!aceptada) return null;
  const inicio = Date.parse(`${aceptada}T00:00:00Z`);
  const actual = Date.parse(`${hoy}T00:00:00Z`);
  if (!Number.isFinite(inicio) || !Number.isFinite(actual)) return null;
  const limite = new Date(inicio + 10 * DIA).toISOString().slice(0, 10);
  const dias = Math.round((inicio + 10 * DIA - actual) / DIA);
  return { limite, dias, vencido: dias < 0 };
}

export function bloqueoEntrega(dossier: DossierDemo): string | null {
  if (!dossier.acta || !plazoDossier(dossier.acta.aceptada)) return 'Registra la aceptación del acta de facturación.';
  if (CARPETAS_DOSSIER.some(c => !itemsActivos(dossier.items, c.numero).length)) return 'Las seis carpetas deben tener al menos un requisito.';
  const faltan = itemsActivos(dossier.items).filter(i => i.estado !== 'Validado' || !i.soporte).length;
  return faltan ? `Faltan ${faltan} requisitos con soporte validado para habilitar el cierre.` : null;
}

const seguro = (nombre: string) => nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);

/** ZIP de demostración: los PDF de esta sesión se incluyen; los ejemplos llevan una ficha .txt explícita. */
export async function paqueteDossier(dossier: DossierDemo, definitivo: boolean) {
  const bloqueo = bloqueoEntrega(dossier);
  if (definitivo && bloqueo) throw new Error(bloqueo);
  const { strToU8, zip } = await import('fflate');
  const activos = itemsActivos(dossier.items);
  const archivos: Zippable = {};
  const prefijo = definitivo ? 'DOSSIER_DEMO_VALIDADO' : 'BORRADOR_INCOMPLETO';
  const faltantes = activos.filter(i => i.estado !== 'Validado' || !i.soporte);
  const sinOriginal: string[] = [];
  for (const carpeta of CARPETAS_DOSSIER) {
    const ruta = `${carpeta.numero}_${seguro(carpeta.nombre)}/`;
    archivos[`${ruta}LEEME.txt`] = strToU8(`Carpeta ${carpeta.numero}: ${carpeta.nombre}\nPrototipo académico. Los registros ficticios no son certificados reales.`);
    for (const item of activos.filter(i => i.carpeta === carpeta.numero && i.soporte)) {
      const soporte = item.soporte!;
      const url = urlArchivoSesion(soporte.id);
      const nombre = `${seguro(item.id)}_${seguro(soporte.nombre)}`;
      if (url) {
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error(`No se pudo recuperar ${soporte.nombre}. Vuelve a seleccionar su PDF antes de exportar.`);
        archivos[`${ruta}${nombre}`] = new Uint8Array(await respuesta.arrayBuffer());
      } else {
        sinOriginal.push(item.nombre);
        archivos[`${ruta}${nombre}.FICHA_DEMO.txt`] = strToU8(`FICHA DE DEMOSTRACIÓN — NO ES UN PDF\nRequisito: ${item.nombre}\nEstado: ${item.estado}\nArchivo registrado: ${soporte.nombre}\nEl original es ficticio o no está disponible después de recargar el prototipo.`);
      }
    }
  }
  archivos['RESUMEN.txt'] = strToU8(`${prefijo}\nCONTRATO CW-118 · PROTOTIPO ACADÉMICO\nActa: ${dossier.acta?.numero ?? 'Sin registrar'}\nAceptación: ${dossier.acta?.aceptada ?? 'Sin registrar'}\nFecha de demostración: ${HOY_SST}\n\nRequisitos sin validar o sin soporte:\n${faltantes.map(i => `Carpeta ${i.carpeta} · ${i.nombre} · ${i.estado}`).join('\n') || 'Ninguno'}\n\nOriginales no disponibles (incluidos como fichas de demostración):\n${sinOriginal.join('\n') || 'Ninguno'}\n\nEste ZIP es un ejemplo navegable. No constituye radicación contractual.`);
  archivos['TRAZABILIDAD.json'] = strToU8(JSON.stringify(dossier, null, 2));
  const bytes = await new Promise<Uint8Array>((resolve, reject) => zip(archivos, { level: 1 }, (error, data) => error ? reject(error) : resolve(data)));
  return { bytes, nombre: `${prefijo}_CW-118_${HOY_SST}.zip` };
}
