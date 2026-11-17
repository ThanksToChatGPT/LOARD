/**
 * HU-M03 · Soportes del corte (fotografías y PDF).
 * Los datos de cada soporte se guardan en el navegador. Los archivos que se
 * suben durante la demostración solo viven en memoria hasta recargar la página.
 */

import type { UsuarioDemo } from '@/features/acceso/AuthDemo';
import { validarArchivo } from '@/lib/archivos';
import { formatoMB, plural } from '@/lib/formato';
import { ahora, momento } from '@/lib/sst/fechas';
import { esEditable, type CorteDemo } from './modeloDemo';

export interface SoporteDemo {
  id: string;
  corteId: string;
  nombre: string;
  bytes: number;
  tipoMime: string;
  /** Archivo de ejemplo en `public/ejemplos`. Los archivos nuevos usan una URL de la sesión. */
  url?: string;
  subidoPor: string;
  rol: string;
  fecha: string;
  /** Un soporte retirado no se borra: se conserva para la bitácora (HU-M11). */
  retiradoPor?: string;
  fechaRetiro?: string;
}

export type TipoSoporte = 'foto' | 'pdf';

export interface SolicitudSoporteDemo {
  id: string;
  corte: CorteDemo;
  archivo: { name: string; size: number; type: string };
  usuario: UsuarioDemo | null;
}

export interface RetiroSoporteDemo {
  corte: CorteDemo;
  soporteId: string;
  usuario: UsuarioDemo | null;
}

const CLAVE_SOPORTES = 'loard_prototipo_soportes_v1';
const urlsSesion = new Map<string, string>();

export function tipoSoporte(soporte: { nombre: string; tipoMime: string }): TipoSoporte {
  return soporte.tipoMime.startsWith('image/') || /\.(jpe?g|png)$/i.test(soporte.nombre) ? 'foto' : 'pdf';
}

export function urlSoporte(soporte: SoporteDemo): string | undefined {
  return urlsSesion.get(soporte.id) ?? soporte.url;
}

export function registrarUrlSoporte(id: string, url: string) {
  urlsSesion.set(id, url);
}

/** «58 KB» para archivos pequeños y «2,4 MB» desde 1 MB. */
export function formatoTamano(bytes: number): string {
  return bytes < 1_048_576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : formatoMB(bytes);
}

export function soportesIniciales(): SoporteDemo[] {
  const base = `${import.meta.env.BASE_URL}ejemplos/`;
  const residente = { subidoPor: 'Mauricio Palacios', rol: 'Ingeniero Residente' };
  return [
    { ...residente, id: 'soporte-ejemplo-1', corteId: 'ejemplo-1', nombre: 'frente-soldadura-l3.jpg', bytes: 58_975,
      tipoMime: 'image/jpeg', url: `${base}frente-soldadura-l3.jpg`, fecha: momento(-3, '09:22').toISOString() },
    { ...residente, id: 'soporte-ejemplo-2', corteId: 'ejemplo-1', nombre: 'acta-avance-corte-06.pdf', bytes: 1_074,
      tipoMime: 'application/pdf', url: `${base}acta-avance-periodo.pdf`, fecha: momento(-3, '09:24').toISOString() },
    { ...residente, id: 'soporte-ejemplo-3', corteId: 'ejemplo-2', nombre: 'soportes-estacion.jpg', bytes: 59_702,
      tipoMime: 'image/jpeg', url: `${base}soportes-estacion.jpg`, fecha: momento(-2, '09:20').toISOString() },
  ];
}

function esSoporte(value: unknown): value is SoporteDemo {
  if (!value || typeof value !== 'object') return false;
  const s = value as Partial<SoporteDemo>;
  return typeof s.id === 'string' && typeof s.corteId === 'string' && typeof s.nombre === 'string' &&
    typeof s.bytes === 'number' && typeof s.tipoMime === 'string' && typeof s.subidoPor === 'string' &&
    typeof s.rol === 'string' && typeof s.fecha === 'string' && Number.isFinite(Date.parse(s.fecha));
}

export function leerSoportes(): SoporteDemo[] {
  const raw = localStorage.getItem(CLAVE_SOPORTES);
  if (raw === null) return soportesIniciales();
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error('Los soportes guardados no se pudieron leer. Revisa el almacenamiento del navegador.'); }
  if (!Array.isArray(value) || !value.every(esSoporte)) {
    throw new Error('El formato de los soportes guardados es incompatible. Conserva los datos del navegador antes de restablecer la demostración.');
  }
  return value as SoporteDemo[];
}

/** Soportes vigentes de un corte, en el orden en que se cargaron. */
export function soportesActivos(todos: SoporteDemo[], corteId: string): SoporteDemo[] {
  return todos.filter(s => s.corteId === corteId && !s.fechaRetiro);
}

/** Motivo por el que el usuario no puede agregar ni retirar soportes, o `null` si puede. */
export function motivoSinPermisoSoportes(corte: CorteDemo, usuario: UsuarioDemo | null): string | null {
  if (!usuario || usuario.rol !== 'residente' || usuario.correo !== corte.autorCorreo) return 'Solo el residente autor del corte agrega o retira soportes.';
  if (!esEditable(corte)) return 'El corte está visado. Sus soportes ya no se pueden modificar.';
  return null;
}

export function esDuplicado(soportes: { nombre: string; bytes: number }[], archivo: { name: string; size: number }): boolean {
  return soportes.some(s => s.nombre === archivo.name && s.bytes === archivo.size);
}

export function agregarSoporteDemo({ id, corte, archivo, usuario }: SolicitudSoporteDemo): SoporteDemo {
  const permiso = motivoSinPermisoSoportes(corte, usuario);
  if (permiso) throw new Error(permiso);
  const invalido = validarArchivo(archivo);
  if (invalido) throw new Error(invalido);
  const todos = leerSoportes();
  const existente = todos.find(s => s.id === id);
  if (existente) return existente;
  if (esDuplicado(soportesActivos(todos, corte.id), archivo)) throw new Error(`«${archivo.name}» ya está adjunto a este corte.`);
  const autor = usuario as UsuarioDemo;
  const soporte: SoporteDemo = {
    id, corteId: corte.id, nombre: archivo.name, bytes: archivo.size,
    tipoMime: archivo.type || (archivo.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
    subidoPor: autor.nombre, rol: autor.etiqueta, fecha: ahora().toISOString(),
  };
  localStorage.setItem(CLAVE_SOPORTES, JSON.stringify([...todos, soporte]));
  return soporte;
}

export function retirarSoporteDemo({ corte, soporteId, usuario }: RetiroSoporteDemo): SoporteDemo {
  const permiso = motivoSinPermisoSoportes(corte, usuario);
  if (permiso) throw new Error(permiso);
  const todos = leerSoportes();
  const soporte = soportesActivos(todos, corte.id).find(s => s.id === soporteId);
  if (!soporte) throw new Error('El soporte ya no está en el corte. Actualiza la página para ver la lista vigente.');
  const retirado: SoporteDemo = { ...soporte, retiradoPor: (usuario as UsuarioDemo).nombre, fechaRetiro: ahora().toISOString() };
  localStorage.setItem(CLAVE_SOPORTES, JSON.stringify(todos.map(s => (s.id === soporteId ? retirado : s))));
  return retirado;
}

/** «3 soportes · 2 fotografías, 1 PDF» */
export function resumenSoportes(soportes: { nombre: string; tipoMime: string }[]): string {
  if (!soportes.length) return 'Sin soportes';
  const fotos = soportes.filter(s => tipoSoporte(s) === 'foto').length;
  const pdfs = soportes.length - fotos;
  const partes = [fotos && plural(fotos, 'fotografía', 'fotografías'), pdfs && plural(pdfs, 'PDF', 'PDF')].filter(Boolean);
  return `${plural(soportes.length, 'soporte', 'soportes')} · ${partes.join(', ')}`;
}
