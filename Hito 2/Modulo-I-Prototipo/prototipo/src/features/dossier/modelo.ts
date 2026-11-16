/**
 * HU-M05 y HU-M06 · Reglas del dossier de calidad.
 * Documentos del SIG con sus versiones y checklist de las 6 carpetas contractuales.
 * Todo se guarda en este navegador, igual que los cortes de ejemplo.
 */

import type { UsuarioDemo } from '@/features/acceso/AuthDemo';
import { ARCHIVO_MAX_BYTES } from '@/lib/archivos';
import { CARPETAS_DOSSIER, OBSERVACION_MIN_CARACTERES } from '@/lib/constantes';
import { ESTADOS_REQUISITO, type EstadoRequisito } from '@/lib/estados';
import { formatoMB, sinTildes } from '@/lib/formato';
import { ahora, momento } from '@/lib/sst/fechas';

/* ───────────────── Tipos ───────────────── */

export interface ArchivoDemo { nombre: string; bytes: number }

/** Una versión publicada de un documento del SIG. */
export interface DocumentoSig {
  id: string;
  codigo: string;
  nombre: string;
  version: number;
  /** Carpeta del dossier donde se usa el documento. */
  carpeta: number;
  /** Solo una versión por código es vigente. Las demás quedan en el historial. */
  vigente: boolean;
  /** Qué cambió frente a la versión anterior. */
  nota: string;
  archivo: ArchivoDemo;
  publicadoPor: string;
  rol: string;
  fecha: string;
}

export interface SoporteItem extends ArchivoDemo { id: string; subidoPor: string; rol: string; fecha: string }

/** Cambio de estado de un requisito. Alimenta la bitácora (HU-M11). */
export interface EventoItem {
  fecha: string;
  usuario: string;
  rol: string;
  anterior: EstadoRequisito | 'Sin registro';
  nuevo: EstadoRequisito;
  motivo?: string;
}

/** Requisito de la checklist dentro de una de las 6 carpetas. */
export interface ItemChecklist {
  id: string;
  carpeta: number;
  nombre: string;
  /** Qué soporte se espera en este requisito. */
  detalle: string;
  /** Código del documento del SIG que se debe diligenciar, si aplica. */
  documentoCodigo?: string;
  estado: EstadoRequisito;
  soporte?: SoporteItem;
  /** Motivo vigente mientras el estado es Observado. */
  observacion?: string;
  /** Un requisito retirado no se borra: se conserva para la bitácora (HU-M11). */
  retirado?: { por: string; fecha: string };
  /** Cambios de estado, del más reciente al más antiguo. */
  historial: EventoItem[];
}

export const JUNTAS_NDT = ['JW-16-042', 'JW-16-043', 'JW-16-044', 'JW-08-021'] as const;
export const TIPOS_NDT = ['RT · Radiografía', 'UT · Ultrasonido', 'PT · Líquidos penetrantes', 'MT · Partículas magnéticas'] as const;
export interface EnsayoNdt {
  id: string; itemId: string; junta: string; laboratorio: string; informe: string;
  tipo: string; fechaEnsayo: string; resultado: 'Conforme' | 'No conforme';
  registradoPor: string; fechaRegistro: string;
}
export interface ActaDossier { numero: string; aceptada: string; registradoPor: string; fechaRegistro: string }
export interface DossierDemo { documentos: DocumentoSig[]; items: ItemChecklist[]; ensayos?: EnsayoNdt[]; acta?: ActaDossier }

type Usuario = UsuarioDemo | null | undefined;
type ArchivoElegido = { name: string; size: number };

/* ───────────────── Permisos por rol ───────────────── */

/** Publicar documentos y cambiar la estructura de la checklist (HU-M05, criterio 6). */
export const puedeEstructurar = (usuario: Usuario): usuario is UsuarioDemo => usuario?.rol === 'calidad';
/** Validar u observar un requisito (HU-M06, criterio 2). */
export const puedeRevisar = (usuario: Usuario): usuario is UsuarioDemo => usuario?.rol === 'calidad';
/** Cargar o reemplazar el soporte de un requisito (HU-M06, criterio 1). */
export const puedeCargar = (usuario: Usuario): usuario is UsuarioDemo => usuario?.rol === 'residente' || usuario?.rol === 'calidad';

/* ───────────────── Archivos ───────────────── */

export const PDF_AYUDA = 'Selecciona un archivo PDF (máx. 15 MB)';
export const CAUSAS_OBSERVACION = ['Soporte PDF ilegible', 'Falta la firma del residente', 'Formato en versión obsoleta', 'El documento no corresponde al requisito'];

/** Devuelve el motivo del rechazo, o `null` si el PDF se puede cargar. */
export function validarPdf(archivo: ArchivoElegido): string | null {
  if (!archivo.name.toLowerCase().endsWith('.pdf')) return `«${archivo.name}» no es un PDF. En el dossier solo se cargan archivos PDF.`;
  if (archivo.size === 0) return `«${archivo.name}» está vacío. Selecciona un PDF con contenido.`;
  if (archivo.size > ARCHIVO_MAX_BYTES) return `«${archivo.name}» pesa ${formatoMB(archivo.size)} y el máximo es 15 MB. Reduce el archivo y vuelve a seleccionarlo.`;
  return null;
}

/** «58 KB» para archivos pequeños y «2,4 MB» desde 1 MB. */
export function formatoTamano(bytes: number): string {
  return bytes < 1_048_576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : formatoMB(bytes);
}

// Los PDF cargados durante la demostración solo viven en memoria hasta recargar la página.
const archivosSesion = new Map<string, string>();
export function registrarArchivoSesion(id: string, archivo: File) { archivosSesion.set(id, URL.createObjectURL(archivo)); }
export function urlArchivoSesion(id: string): string | undefined { return archivosSesion.get(id); }

/* ───────────────── Datos de ejemplo ───────────────── */

const CALIDAD = { usuario: 'Dilan Castro', rol: 'Coordinación SIG / Calidad' };
const RESIDENTE = { usuario: 'Mauricio Palacios', rol: 'Ingeniero Residente' };
const NOTA_INICIAL = 'Versión inicial del documento.';

/** Código, nombre, carpeta y nota de cada versión (la última es la vigente). */
const DOCUMENTOS_EJEMPLO: [string, string, number, string[]][] = [
  ['GC-PR02', 'Control de documentos y registros', 1, [NOTA_INICIAL]],
  ['GT-FR08', 'Acta de corte de obra', 2, [NOTA_INICIAL, 'Se agregó el campo de horas-hombre por frente.']],
  ['GD-FR05', 'Listado maestro de planos', 3, [NOTA_INICIAL]],
  ['GT-FR64', 'Libro de tubería', 4, [NOTA_INICIAL, 'Se separaron los diámetros por línea de flujo.', 'Se agregaron la junta soldada y el número de colada.']],
  ['GC-FR21', 'Registro de inspección visual de soldadura', 4, [NOTA_INICIAL]],
  ['GC-FR30', 'Reporte de ensayo NDT', 4, [NOTA_INICIAL, 'Se agregó el criterio de aceptación por junta.']],
  ['GT-FR12', 'Informe técnico semanal', 5, [NOTA_INICIAL, 'Se agregó el registro fotográfico del frente.']],
  ['GC-FR40', 'Memoria de cálculo', 6, [NOTA_INICIAL]],
];

/** Carpeta, requisito, soporte esperado, estado, documento del SIG y observación. */
const ITEMS_EJEMPLO: [number, string, string, EstadoRequisito, string?, string?][] = [
  [1, 'Contrato marco CW-118', 'Contrato firmado por las partes.', 'Validado'],
  [1, 'Orden de servicio', 'Orden de servicio del periodo en ejecución.', 'Validado'],
  [1, 'Pólizas vigentes', 'Pólizas de cumplimiento y de responsabilidad civil.', 'Archivo Cargado'],
  [2, 'Acta del Corte #06', 'Corte visado por el Director de Proyectos.', 'Validado', 'GT-FR08'],
  [2, 'Acta del Corte #07', 'Corte visado por el Director de Proyectos.', 'Observado', 'GT-FR08', 'El acta no tiene la firma del residente. Vuelve a cargarla firmada.'],
  [2, 'Acta de avance del periodo', 'Acta consolidada del avance físico.', 'Pendiente'],
  [3, 'Planos mecánicos e isométricos', 'Planos de diseño aprobados para construcción.', 'Archivo Cargado', 'GD-FR05'],
  [3, 'Planos eléctricos', 'Planos de diseño aprobados para construcción.', 'Pendiente'],
  [3, 'Planos finales as-built', 'Planos actualizados al cierre de la obra.', 'Pendiente'],
  [4, 'Certificados de calidad de consumibles', 'Certificados de electrodos y materiales de aporte.', 'Validado'],
  [4, 'Certificados de calibración de equipos', 'Calibración vigente de los equipos de soldadura.', 'Observado', undefined, 'El certificado del equipo de soldadura venció en octubre. Carga el vigente.'],
  [4, 'Libro de tubería', 'Registro de la tubería instalada por junta.', 'Archivo Cargado', 'GT-FR64'],
  [4, 'WPS y PQR', 'Procedimientos de soldadura calificados.', 'Pendiente'],
  [4, 'Reportes de ensayos NDT', 'Reportes PDF del laboratorio por junta.', 'Pendiente', 'GC-FR30'],
  [5, 'Informe técnico de la semana 46', 'Informe semanal elaborado por el residente.', 'Archivo Cargado', 'GT-FR12'],
  [5, 'Informe final consolidado', 'Informe de cierre del contrato.', 'Pendiente'],
  [6, 'Memoria de cálculo de soportería', 'Memoria técnica firmada por ingeniería.', 'Pendiente', 'GC-FR40'],
  [6, 'Registros de soporte de ingeniería', 'Registros que respaldan los cálculos del contrato.', 'Pendiente'],
];

export function dossierInicial(): DossierDemo {
  const documentos = DOCUMENTOS_EJEMPLO.flatMap(([codigo, nombre, carpeta, notas]) => notas.map((nota, i): DocumentoSig => ({
    id: `doc-${codigo}-v${i + 1}`, codigo, nombre, version: i + 1, carpeta, vigente: i === notas.length - 1, nota,
    archivo: { nombre: `${codigo}_v${i + 1}.pdf`, bytes: 180_000 + i * 42_000 },
    publicadoPor: CALIDAD.usuario, rol: CALIDAD.rol, fecha: momento(-30 * (notas.length - i) - carpeta * 3, '08:15').toISOString(),
  })));
  const items = ITEMS_EJEMPLO.map(([carpeta, nombre, detalle, estado, documentoCodigo, observacion], i): ItemChecklist => {
    const archivo = `${sinTildes(nombre).replace(/[^a-z0-9]+/g, '-')}.pdf`;
    const cargue = momento(-6, '10:30').toISOString();
    const historial: EventoItem[] = [{ ...CALIDAD, fecha: momento(-20, '09:00').toISOString(), anterior: 'Sin registro', nuevo: 'Pendiente', motivo: 'Requisito agregado a la checklist.' }];
    if (estado !== 'Pendiente') historial.unshift({ ...RESIDENTE, fecha: cargue, anterior: 'Pendiente', nuevo: 'Archivo Cargado', motivo: `Soporte cargado: ${archivo}` });
    if (estado === 'Validado' || estado === 'Observado') historial.unshift({ ...CALIDAD, fecha: momento(-4, '15:20').toISOString(), anterior: 'Archivo Cargado', nuevo: estado, motivo: observacion });
    return {
      id: `item-${i + 1}`, carpeta, nombre, detalle, documentoCodigo, estado, observacion, historial,
      soporte: estado === 'Pendiente' ? undefined
        : { id: `soporte-item-${i + 1}`, nombre: archivo, bytes: 240_000 + i * 61_000, subidoPor: RESIDENTE.usuario, rol: RESIDENTE.rol, fecha: cargue },
    };
  });
  return { documentos, items, ensayos: [], acta: { numero: 'Acta de facturación #07', aceptada: '2026-11-11', registradoPor: CALIDAD.usuario, fechaRegistro: momento(-6, '09:00').toISOString() } };
}

/* ───────────────── Lectura y guardado ───────────────── */

const CLAVE_DOSSIER = 'loard_prototipo_dossier_v1';

const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const esTexto = (v: unknown): v is string => typeof v === 'string';
const esFecha = (v: unknown): v is string => esTexto(v) && Number.isFinite(Date.parse(v));
const esCarpeta = (v: unknown): v is number => CARPETAS_DOSSIER.some(carpeta => carpeta.numero === v);
const esEstado = (v: unknown): v is EstadoRequisito => ESTADOS_REQUISITO.includes(v as EstadoRequisito);
const opcional = (v: unknown, es: (valor: unknown) => boolean) => v === undefined || es(v);
const esArchivo = (v: unknown) => esObjeto(v) && esTexto(v.nombre) && typeof v.bytes === 'number';

function esDocumento(v: unknown): v is DocumentoSig {
  return esObjeto(v) && esTexto(v.id) && esTexto(v.codigo) && esTexto(v.nombre) && Number.isInteger(v.version) && esCarpeta(v.carpeta) &&
    typeof v.vigente === 'boolean' && esTexto(v.nota) && esArchivo(v.archivo) && esTexto(v.publicadoPor) && esTexto(v.rol) && esFecha(v.fecha);
}
function esEvento(v: unknown): v is EventoItem {
  return esObjeto(v) && esFecha(v.fecha) && esTexto(v.usuario) && esTexto(v.rol) &&
    (v.anterior === 'Sin registro' || esEstado(v.anterior)) && esEstado(v.nuevo) && opcional(v.motivo, esTexto);
}
function esItem(v: unknown): v is ItemChecklist {
  return esObjeto(v) && esTexto(v.id) && esCarpeta(v.carpeta) && esTexto(v.nombre) && esTexto(v.detalle) && esEstado(v.estado) &&
    opcional(v.documentoCodigo, esTexto) && opcional(v.observacion, esTexto) &&
    opcional(v.soporte, s => esArchivo(s) && esObjeto(s) && esTexto(s.id) && esTexto(s.subidoPor) && esTexto(s.rol) && esFecha(s.fecha)) &&
    opcional(v.retirado, r => esObjeto(r) && esTexto(r.por) && esFecha(r.fecha)) &&
    Array.isArray(v.historial) && v.historial.every(esEvento);
}

export function leerDossier(): DossierDemo {
  const raw = localStorage.getItem(CLAVE_DOSSIER);
  if (raw === null) return dossierInicial();
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error('El dossier guardado no se pudo leer. Revisa el almacenamiento del navegador.'); }
  if (!esObjeto(value) || !Array.isArray(value.documentos) || !value.documentos.every(esDocumento) ||
      !Array.isArray(value.items) || !value.items.every(esItem) ||
      !opcional(value.ensayos, e => Array.isArray(e) && e.every(n => esObjeto(n) &&
        ['id', 'itemId', 'junta', 'laboratorio', 'informe', 'tipo', 'fechaEnsayo', 'registradoPor', 'fechaRegistro'].every(k => esTexto(n[k])) &&
        (n.resultado === 'Conforme' || n.resultado === 'No conforme'))) ||
      !opcional(value.acta, a => esObjeto(a) && ['numero', 'aceptada', 'registradoPor', 'fechaRegistro'].every(k => esTexto(a[k])))) {
    throw new Error('El formato del dossier guardado es incompatible. Conserva los datos del navegador antes de restablecer la demostración.');
  }
  return value as unknown as DossierDemo;
}

function guardarDossier(dossier: DossierDemo) {
  localStorage.setItem(CLAVE_DOSSIER, JSON.stringify(dossier));
}

export type DatosEnsayo = Pick<EnsayoNdt, 'junta' | 'laboratorio' | 'informe' | 'tipo' | 'fechaEnsayo' | 'resultado'>;
export function validarEnsayo(datos: DatosEnsayo, archivo: ArchivoElegido | null, ensayos: EnsayoNdt[] = []) {
  if (!JUNTAS_NDT.some(j => j === datos.junta)) return 'Selecciona una junta soldada del frente.';
  if (datos.laboratorio.trim().length < 3) return 'Escribe el laboratorio responsable (mínimo 3 caracteres).';
  if (!TIPOS_NDT.some(t => t === datos.tipo)) return 'Selecciona el tipo de ensayo.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fechaEnsayo) || !Number.isFinite(Date.parse(datos.fechaEnsayo)) ||
      new Date(`${datos.fechaEnsayo}T00:00:00Z`).toISOString().slice(0, 10) !== datos.fechaEnsayo || datos.fechaEnsayo > ahora().toISOString().slice(0, 10)) return 'Indica una fecha de ensayo válida, hasta el día de la demostración.';
  if (!['Conforme', 'No conforme'].includes(datos.resultado)) return 'Selecciona el resultado del laboratorio.';
  if (!datos.informe.trim()) return 'Escribe el número de informe del laboratorio.';
  if (ensayos.some(e => sinTildes(e.laboratorio.trim()) === sinTildes(datos.laboratorio.trim()) &&
      sinTildes(e.informe.trim()) === sinTildes(datos.informe.trim()))) return 'Ese informe ya está registrado para este laboratorio.';
  return archivo ? validarPdf(archivo) : 'Adjunta el reporte PDF del laboratorio.';
}

/** Guarda ensayo y requisito juntos: un informe nunca reemplaza el de otra junta. */
export function registrarEnsayo({ id, datos, archivo, usuario }: { id: string; datos: DatosEnsayo; archivo: ArchivoElegido; usuario: Usuario }): EnsayoNdt {
  if (!puedeRevisar(usuario)) throw new Error('Solo Calidad registra ensayos NDT.');
  const dossier = leerDossier();
  const existente = dossier.ensayos?.find(e => e.id === id);
  if (existente) return existente;
  const error = validarEnsayo(datos, archivo, dossier.ensayos);
  if (error) throw new Error(error);
  const fecha = ahora().toISOString();
  const inicial = dossier.items.find(i => !i.retirado && i.carpeta === 4 && i.documentoCodigo === 'GC-FR30' && i.estado === 'Pendiente' && !i.soporte && !dossier.ensayos?.some(e => e.itemId === i.id));
  const itemId = inicial?.id ?? `ndt-${id}`;
  const ensayo: EnsayoNdt = { ...datos, laboratorio: datos.laboratorio.trim(), informe: datos.informe.trim(), id, itemId, registradoPor: usuario.nombre, fechaRegistro: fecha };
  const nombre = `NDT ${datos.junta} · ${ensayo.informe}`;
  const soporte = { id: `soporte-${id}`, nombre: archivo.name, bytes: archivo.size, subidoPor: usuario.nombre, rol: usuario.etiqueta, fecha };
  const item: ItemChecklist = { id: itemId, carpeta: 4, nombre, detalle: `${datos.tipo} · ${ensayo.laboratorio} · Resultado: ${datos.resultado}`, documentoCodigo: 'GC-FR30',
    estado: 'Archivo Cargado', soporte, historial: [evento(usuario, inicial?.estado ?? 'Sin registro', 'Archivo Cargado', `Informe ${ensayo.informe} vinculado a junta ${datos.junta}. Resultado: ${datos.resultado}.`), ...(inicial?.historial ?? [])] };
  guardarDossier({ ...dossier, ensayos: [ensayo, ...(dossier.ensayos ?? [])], items: inicial ? dossier.items.map(i => i.id === itemId ? item : i) : [...dossier.items, item] });
  return ensayo;
}

export function registrarActa({ numero, aceptada, usuario }: { numero: string; aceptada: string; usuario: Usuario }) {
  if (!puedeRevisar(usuario)) throw new Error('Solo Calidad registra la aceptación del acta.');
  if (!numero.trim()) throw new Error('Indica la referencia del acta aceptada.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(aceptada) || !Number.isFinite(Date.parse(aceptada)) || new Date(`${aceptada}T00:00:00Z`).toISOString().slice(0, 10) !== aceptada || aceptada > ahora().toISOString().slice(0, 10)) throw new Error('Selecciona una fecha de aceptación válida, hasta el día de la demostración.');
  const dossier = leerDossier();
  guardarDossier({ ...dossier, acta: { numero: numero.trim(), aceptada, registradoPor: usuario.nombre, fechaRegistro: ahora().toISOString() } });
}

/* ───────────────── HU-M05 · Documentos del SIG ───────────────── */

export const normalizarCodigo = (codigo: string) => codigo.trim().toUpperCase();
export const documentosVigentes = (documentos: DocumentoSig[]) => documentos.filter(documento => documento.vigente);
/** Todas las versiones de un código, de la más reciente a la más antigua. */
export const versionesDe = (documentos: DocumentoSig[], codigo: string) =>
  documentos.filter(documento => documento.codigo === codigo).sort((a, b) => b.version - a.version);

export interface DatosDocumento { codigo: string; nombre: string; version: number; carpeta: number; nota: string; archivo: ArchivoElegido | null }
export type ErroresDocumento = Partial<Record<keyof DatosDocumento, string>>;

/** Un mensaje por campo con problema. Sin llaves, el documento se puede publicar. */
export function validarDocumento(documentos: DocumentoSig[], datos: DatosDocumento): ErroresDocumento {
  const errores: ErroresDocumento = {};
  const codigo = normalizarCodigo(datos.codigo);
  const vigente = documentos.find(documento => documento.vigente && documento.codigo === codigo);
  if (!/^[A-Z0-9]+(-[A-Z0-9]+)+$/.test(codigo)) errores.codigo = 'Escribe el código con letras, números y guiones, por ejemplo GT-FR64.';
  if (datos.nombre.trim().length < 5) errores.nombre = 'Escribe el nombre del documento (mínimo 5 caracteres).';
  if (!Number.isInteger(datos.version) || datos.version < 1) errores.version = 'La versión es un número entero desde 1.';
  else if (vigente && datos.version <= vigente.version) errores.version = `La versión debe ser mayor que la vigente (v${vigente.version}).`;
  if (!esCarpeta(datos.carpeta)) errores.carpeta = 'Selecciona una de las 6 carpetas del dossier.';
  if (vigente && datos.nota.trim().length < OBSERVACION_MIN_CARACTERES) {
    errores.nota = `Explica qué cambió frente a la versión ${vigente.version} (mínimo ${OBSERVACION_MIN_CARACTERES} caracteres).`;
  }
  const rechazo = datos.archivo ? validarPdf(datos.archivo) : 'Adjunta el PDF del documento.';
  if (rechazo) errores.archivo = rechazo;
  return errores;
}

/** Publica una versión. La versión anterior del mismo código deja de ser vigente y queda en el historial. */
export function publicarDocumento({ id, usuario, ...datos }: DatosDocumento & { id: string; usuario: Usuario }): DocumentoSig {
  if (!puedeEstructurar(usuario)) throw new Error('Solo Coordinación SIG / Calidad publica documentos del SIG.');
  const dossier = leerDossier();
  const existente = dossier.documentos.find(documento => documento.id === id);
  if (existente) return existente;
  const error = Object.values(validarDocumento(dossier.documentos, datos))[0];
  if (error || !datos.archivo) throw new Error(error);
  const codigo = normalizarCodigo(datos.codigo);
  const documento: DocumentoSig = {
    id, codigo, nombre: datos.nombre.trim(), version: datos.version, carpeta: datos.carpeta, vigente: true,
    nota: datos.nota.trim() || NOTA_INICIAL, archivo: { nombre: datos.archivo.name, bytes: datos.archivo.size },
    publicadoPor: usuario.nombre, rol: usuario.etiqueta, fecha: ahora().toISOString(),
  };
  const anteriores = dossier.documentos.map(item => (item.codigo === codigo ? { ...item, vigente: false } : item));
  guardarDossier({ ...dossier, documentos: [documento, ...anteriores] });
  return documento;
}

/* ───────────────── HU-M05 · Estructura de la checklist ───────────────── */

/** Requisitos vigentes (no retirados), de todo el dossier o de una carpeta. */
export const itemsActivos = (items: ItemChecklist[], carpeta?: number) =>
  items.filter(item => !item.retirado && (carpeta === undefined || item.carpeta === carpeta));

/** Conteo por estado y porcentaje validado, de todo el dossier o de una carpeta. */
export function avanceCarpeta(items: ItemChecklist[], carpeta?: number) {
  const activos = itemsActivos(items, carpeta);
  const conteo = Object.fromEntries(ESTADOS_REQUISITO.map(estado => [estado, activos.filter(item => item.estado === estado).length])) as Record<EstadoRequisito, number>;
  return { total: activos.length, conteo, porcentaje: activos.length ? Math.round((conteo.Validado / activos.length) * 100) : 0 };
}

export interface DatosItem { carpeta: number; nombre: string; detalle: string; documentoCodigo?: string }

/** Devuelve el motivo por el que no se puede guardar el requisito, o `null`. */
export function validarItem(dossier: DossierDemo, datos: DatosItem, itemId?: string): string | null {
  const nombre = sinTildes(datos.nombre.trim());
  if (!esCarpeta(datos.carpeta)) return 'Selecciona una de las 6 carpetas del dossier.';
  if (nombre.length < 5) return 'Escribe el nombre del requisito (mínimo 5 caracteres).';
  if (itemsActivos(dossier.items, datos.carpeta).some(item => item.id !== itemId && sinTildes(item.nombre.trim()) === nombre)) {
    return `La Carpeta ${datos.carpeta} ya tiene un requisito con ese nombre.`;
  }
  if (datos.documentoCodigo && !dossier.documentos.some(documento => documento.vigente && documento.codigo === datos.documentoCodigo)) {
    return 'El documento elegido ya no está vigente. Selecciona otro.';
  }
  return null;
}

const SIN_PERMISO_ESTRUCTURA = 'Solo Coordinación SIG / Calidad modifica la estructura de la checklist.';

function evento(usuario: UsuarioDemo, anterior: EventoItem['anterior'], nuevo: EstadoRequisito, motivo?: string): EventoItem {
  return { fecha: ahora().toISOString(), usuario: usuario.nombre, rol: usuario.etiqueta, anterior, nuevo, motivo };
}

/** Lee lo guardado, aplica el cambio a un requisito vigente y lo guarda. */
function actualizarItem(itemId: string, cambiar: (item: ItemChecklist, dossier: DossierDemo) => ItemChecklist): ItemChecklist {
  const dossier = leerDossier();
  const item = dossier.items.find(candidato => candidato.id === itemId && !candidato.retirado);
  if (!item) throw new Error('El requisito ya no está en la checklist. Actualiza la página para ver la lista vigente.');
  const nuevo = cambiar(item, dossier);
  if (nuevo !== item) guardarDossier({ ...dossier, items: dossier.items.map(candidato => (candidato.id === itemId ? nuevo : candidato)) });
  return nuevo;
}

/** Todo requisito nuevo arranca en Pendiente (HU-M05, criterio 5). */
export function agregarItem({ id, usuario, ...datos }: DatosItem & { id: string; usuario: Usuario }): ItemChecklist {
  if (!puedeEstructurar(usuario)) throw new Error(SIN_PERMISO_ESTRUCTURA);
  const dossier = leerDossier();
  const existente = dossier.items.find(item => item.id === id);
  if (existente) return existente;
  const error = validarItem(dossier, datos);
  if (error) throw new Error(error);
  const item: ItemChecklist = {
    id, carpeta: datos.carpeta, nombre: datos.nombre.trim(), detalle: datos.detalle.trim(), documentoCodigo: datos.documentoCodigo || undefined,
    estado: 'Pendiente', historial: [evento(usuario, 'Sin registro', 'Pendiente', 'Requisito agregado a la checklist.')],
  };
  guardarDossier({ ...dossier, items: [...dossier.items, item] });
  return item;
}

/** Cambia el nombre, el soporte esperado o el documento enlazado. No toca el estado ni el soporte. */
export function editarItem({ itemId, usuario, ...cambios }: Omit<DatosItem, 'carpeta'> & { itemId: string; usuario: Usuario }): ItemChecklist {
  if (!puedeEstructurar(usuario)) throw new Error(SIN_PERMISO_ESTRUCTURA);
  return actualizarItem(itemId, (item, dossier) => {
    const error = validarItem(dossier, { ...cambios, carpeta: item.carpeta }, item.id);
    if (error) throw new Error(error);
    return { ...item, nombre: cambios.nombre.trim(), detalle: cambios.detalle.trim(), documentoCodigo: cambios.documentoCodigo || undefined };
  });
}

/** El requisito deja de exigirse y de contar en el avance. Se conserva marcado como retirado. */
export function retirarItem({ itemId, usuario }: { itemId: string; usuario: Usuario }): ItemChecklist {
  if (!puedeEstructurar(usuario)) throw new Error(SIN_PERMISO_ESTRUCTURA);
  return actualizarItem(itemId, item => ({ ...item, retirado: { por: usuario.nombre, fecha: ahora().toISOString() } }));
}

/* ───────────────── HU-M06 · Soportes y revisión ───────────────── */

/** Carga o reemplaza el PDF de un requisito. El requisito queda en Archivo Cargado. */
export function cargarSoporte({ itemId, soporteId, archivo, usuario }: { itemId: string; soporteId: string; archivo: ArchivoElegido; usuario: Usuario }): ItemChecklist {
  if (!puedeCargar(usuario)) throw new Error('Solo el Ingeniero Residente o Calidad cargan soportes en la checklist.');
  const rechazo = validarPdf(archivo);
  if (rechazo) throw new Error(rechazo);
  return actualizarItem(itemId, item => {
    if (item.soporte?.id === soporteId) return item;
    if (item.estado === 'Validado') throw new Error('El requisito ya está validado. Calidad debe observarlo antes de cambiar el soporte.');
    const accion = item.soporte ? 'Soporte reemplazado' : 'Soporte cargado';
    return {
      ...item, estado: 'Archivo Cargado', observacion: undefined,
      soporte: { id: soporteId, nombre: archivo.name, bytes: archivo.size, subidoPor: usuario.nombre, rol: usuario.etiqueta, fecha: ahora().toISOString() },
      historial: [evento(usuario, item.estado, 'Archivo Cargado', `${accion}: ${archivo.name}`), ...item.historial],
    };
  });
}

export type DecisionItem = Extract<EstadoRequisito, 'Validado' | 'Observado'>;

/** Calidad valida el soporte o lo observa dejando escrito el motivo. */
export function revisarItem({ itemId, decision, observacion = '', usuario, soporteEsperado }: {
  itemId: string; decision: DecisionItem; observacion?: string; usuario: Usuario;
  /** Soporte que el revisor tenía en pantalla. Evita decidir sobre un archivo que ya cambió. */
  soporteEsperado?: string;
}): ItemChecklist {
  if (!puedeRevisar(usuario)) throw new Error('Solo Coordinación SIG / Calidad valida u observa requisitos.');
  const motivo = observacion.trim();
  if (decision === 'Observado' && motivo.length < OBSERVACION_MIN_CARACTERES) {
    throw new Error(`Escribe el motivo de la observación (mínimo ${OBSERVACION_MIN_CARACTERES} caracteres).`);
  }
  return actualizarItem(itemId, item => {
    if (!item.soporte) throw new Error('El requisito no tiene un soporte cargado para revisar.');
    if (soporteEsperado && item.soporte.id !== soporteEsperado) throw new Error('El soporte cambió mientras lo revisabas. Abre el requisito para ver el archivo actual.');
    const admite = item.estado === 'Archivo Cargado' || (decision === 'Observado' && item.estado === 'Validado');
    if (!admite) throw new Error(`El requisito está en estado ${item.estado} y no admite esta decisión.`);
    return {
      ...item, estado: decision, observacion: decision === 'Observado' ? motivo : undefined,
      historial: [evento(usuario, item.estado, decision, motivo || undefined), ...item.historial],
    };
  });
}

/* ───────────────── HU-M06 · Búsqueda de documentos vigentes ───────────────── */

export interface FiltroDocumentos { texto?: string; carpeta?: number | null; estado?: EstadoRequisito | null }
export interface FilaDocumento {
  documento: DocumentoSig;
  /** Estado del documento en la checklist, o `null` si ningún requisito lo usa. */
  estado: EstadoRequisito | null;
  /** Cuántos requisitos vigentes usan este documento. */
  requisitos: number;
}

// Del que más atención pide al que menos: un documento solo está Validado si todos sus requisitos lo están.
const ORDEN_ATENCION: EstadoRequisito[] = ['Observado', 'Pendiente', 'Archivo Cargado', 'Validado'];

/** Estado en la checklist: el más atrasado entre los requisitos que usan el documento. */
export function estadoEnChecklist(items: ItemChecklist[], codigo: string): Pick<FilaDocumento, 'estado' | 'requisitos'> {
  const estados = itemsActivos(items).filter(item => item.documentoCodigo === codigo).map(item => item.estado);
  return { estado: ORDEN_ATENCION.find(estado => estados.includes(estado)) ?? null, requisitos: estados.length };
}

/** Solo versiones vigentes, filtradas por nombre o código, carpeta y estado (HU-M06, criterios 4 y 5). */
export function buscarDocumentos({ documentos, items }: DossierDemo, { texto = '', carpeta = null, estado = null }: FiltroDocumentos = {}): FilaDocumento[] {
  const consulta = sinTildes(texto.trim());
  return documentosVigentes(documentos)
    .map(documento => ({ documento, ...estadoEnChecklist(items, documento.codigo) }))
    .filter(fila => (!consulta || sinTildes(`${fila.documento.codigo} ${fila.documento.nombre}`).includes(consulta)) &&
      (carpeta === null || fila.documento.carpeta === carpeta) && (estado === null || fila.estado === estado))
    .sort((a, b) => a.documento.carpeta - b.documento.carpeta || a.documento.codigo.localeCompare(b.documento.codigo, 'es'));
}
