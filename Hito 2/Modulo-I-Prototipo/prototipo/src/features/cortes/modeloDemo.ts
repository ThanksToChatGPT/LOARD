import { ESTADOS_CORTE, type EstadoCorte } from '@/lib/estados';
import type { UsuarioDemo } from '@/features/acceso/AuthDemo';
import { HOY_SST, ahora, momento } from '@/lib/sst/fechas';
import { OBSERVACION_MIN_CARACTERES } from '@/lib/constantes';

export const ACTIVIDADES_DEMO = [
  { id: 'tuberia', nombre: 'Soldadura y tendido de tubería', unidad: 'm', prevista: 1200 },
  { id: 'soportes', nombre: 'Montaje de soportes metálicos', unidad: 'und', prevista: 80 },
];
export const INSUMOS_DEMO = [
  { id: 'electrodo', nombre: 'Electrodo E7018', unidad: 'kg' },
  { id: 'discos', nombre: 'Discos de corte', unidad: 'und' },
];
export const FRENTES_DEMO = ['Estación compresora', 'Línea de flujo L-3', 'Patio de tuberías'];
/** Ciudades y clientes de los cortes de ejemplo (filtros de la lista y encabezado del corte). */
export const CIUDADES_DEMO = ['Medellín', 'Cartagena', 'Cartago'];
export const CLIENTES_DEMO = ['Gases del Litoral S.A.', 'Energía del Valle S.A.S.', 'Tuberías Andinas S.A.'];
/** Unidades de medida de una actividad escrita por el residente. */
export const UNIDADES_DEMO = ['m', 'm²', 'm³', 'kg', 'und'];
const PREFIJO_PROPIA = 'propia-';
export interface RecursoDemo {
  id: string; cantidad: string;
  /** Solo en actividades propias (escritas por el residente): su nombre y su unidad de medida. */
  nombre?: string; unidad?: string;
}
export interface FormularioCorteDemo {
  frente: string; inicio: string; fin: string; observaciones: string;
  /** Opcionales: los cortes guardados antes de existir estos datos no los traen. */
  ciudad?: string; cliente?: string;
  actividades: RecursoDemo[]; personal: RecursoDemo[]; insumos: RecursoDemo[];
}
export interface VersionDemo {
  version: number; fecha: string; autor: string; rol: string; motivo: string;
  estado: EstadoCorte; datos: FormularioCorteDemo;
}
export interface CorteDemo {
  id: string; numero: string; autorCorreo: string; autorNombre: string; versiones: VersionDemo[];
}
export interface SolicitudCorteDemo {
  id: string; anterior?: CorteDemo; datos: FormularioCorteDemo; usuario: UsuarioDemo;
  motivo: string; versionEsperada?: number;
}
const CLAVE_CORTES = 'loard_prototipo_cortes_v1';

/** HU-M04: un corte visado queda aprobado y ya no se modifica. */
export const MOTIVO_CORTE_VISADO = 'El corte está visado y ya no se puede modificar. Registra un corte nuevo para el siguiente periodo.';
export function esEditable(corte: CorteDemo): boolean {
  return corte.versiones[0].estado !== 'Visado';
}

/** Actividad que el residente escribe a mano, fuera de la lista del ejemplo. */
export function esActividadPropia(row: RecursoDemo): boolean {
  return row.id.startsWith(PREFIJO_PROPIA);
}
export function nuevaActividadPropia(): RecursoDemo {
  return { id: `${PREFIJO_PROPIA}${crypto.randomUUID()}`, cantidad: '', nombre: '', unidad: UNIDADES_DEMO[0] };
}
/** Nombre y unidad de un recurso: del catálogo, o los escritos por el residente. */
export function describirRecurso(row: RecursoDemo, catalogo: { id: string; nombre: string; unidad: string }[]): { nombre: string; unidad: string } {
  const item = catalogo.find(opcion => opcion.id === row.id);
  return { nombre: item?.nombre ?? (row.nombre?.trim() || row.id), unidad: item?.unidad ?? row.unidad ?? '' };
}
const clave = (texto: string) => texto.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export function validarCorteDemo(form: FormularioCorteDemo): string | null {
  if (!FRENTES_DEMO.includes(form.frente)) return 'Selecciona un frente del proyecto.';
  if (!form.ciudad || !CIUDADES_DEMO.includes(form.ciudad)) return 'Selecciona la ciudad del corte.';
  if (!form.cliente || !CLIENTES_DEMO.includes(form.cliente)) return 'Selecciona el cliente del corte.';
  if (!form.inicio || !form.fin || !Number.isFinite(Date.parse(form.inicio)) || !Number.isFinite(Date.parse(form.fin))) return 'Completa las fechas del periodo.';
  if (form.fin < form.inicio) return 'El fin del periodo debe ser igual o posterior al inicio.';
  if (!form.actividades.length) return 'Agrega al menos una actividad ejecutada.';
  if (!form.personal.length) return 'Agrega al menos un trabajador habilitado.';
  for (const rows of [form.actividades, form.personal, form.insumos]) {
    if (new Set(rows.map(row => row.id)).size !== rows.length) return 'Cada recurso se puede registrar una vez por corte.';
    if (rows.some(row => !row.id || !Number.isFinite(Number(row.cantidad)) || Number(row.cantidad) <= 0)) return 'Las cantidades y las horas deben ser números positivos.';
  }
  if (form.actividades.some(row => !/^\d+$/.test(row.cantidad.trim()))) return 'Las cantidades ejecutadas deben ser números enteros (1, 2, 3…), sin decimales.';
  const propias = form.actividades.filter(esActividadPropia);
  if (propias.some(row => !row.nombre?.trim())) return 'Escribe el nombre de la actividad propia.';
  if (propias.some(row => row.nombre!.trim().length > 80)) return 'El nombre de la actividad propia admite hasta 80 caracteres.';
  if (propias.some(row => !UNIDADES_DEMO.includes(row.unidad ?? ''))) return 'Elige la unidad de medida de la actividad propia.';
  const nombres = [...ACTIVIDADES_DEMO.map(item => item.nombre), ...propias.map(row => row.nombre!)].map(clave);
  if (new Set(nombres).size !== nombres.length) return 'Ya hay una actividad con ese nombre. Usa la de la lista o cambia el nombre.';
  if (form.actividades.some(row => !esActividadPropia(row) && !ACTIVIDADES_DEMO.some(item => item.id === row.id)) ||
      form.insumos.some(row => !INSUMOS_DEMO.some(item => item.id === row.id))) return 'Selecciona los recursos disponibles en el ejemplo.';
  const dias = (Date.parse(form.fin) - Date.parse(form.inicio)) / 86_400_000 + 1;
  if (form.personal.some(row => Number(row.cantidad) > dias * 24)) return 'Las horas por trabajador superan las horas disponibles en el periodo.';
  return null;
}

export function formularioVacio(): FormularioCorteDemo {
  return { frente: FRENTES_DEMO[0], ciudad: '', cliente: '', inicio: HOY_SST, fin: HOY_SST, observaciones: '',
    actividades: [{ id: 'tuberia', cantidad: '' }], personal: [], insumos: [] };
}

export function cortesIniciales(): CorteDemo[] {
  return ['Visado', 'Devuelto con Observaciones', 'En Revisión (Enviado)'].map((estado, index) => {
    const datos: FormularioCorteDemo = { ...formularioVacio(), ciudad: CIUDADES_DEMO[index], cliente: CLIENTES_DEMO[index], inicio: '2026-11-10', fin: HOY_SST,
      actividades: [{ id: 'tuberia', cantidad: String([214, 92, 168][index]) }],
      personal: [{ id: 't12', cantidad: '40' }], insumos: [{ id: 'electrodo', cantidad: '12.5' }],
      observaciones: 'Avance del periodo. Registro de ejemplo para la presentación del prototipo.' };
    const primera: VersionDemo = { version: 1, fecha: momento(-3 + index, '09:30').toISOString(), autor: 'Mauricio Palacios',
      rol: 'Ingeniero Residente', motivo: 'Registro inicial del corte', estado: 'En Revisión (Enviado)', datos };
    const versiones = [primera];
    if (estado !== primera.estado) versiones.unshift({ ...primera, version: 2, fecha: momento(-2 + index, '10:45').toISOString(),
      autor: 'Yonny Pérez', rol: 'Director de Proyectos', motivo: estado === 'Visado' ? 'Revisión técnica conforme.' : 'Revisar las cantidades del periodo reportado.', estado: estado as EstadoCorte });
    return { id: `ejemplo-${index + 1}`, numero: String(index + 6).padStart(2, '0'), autorCorreo: 'residente@loard.demo', autorNombre: 'Mauricio Palacios', versiones };
  });
}

function esRecurso(value: unknown): value is RecursoDemo {
  return typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string' &&
    'cantidad' in value && typeof value.cantidad === 'string' && Number.isFinite(Number(value.cantidad)) &&
    (!('nombre' in value) || typeof value.nombre === 'string') && (!('unidad' in value) || typeof value.unidad === 'string');
}
export function esFormulario(value: unknown): value is FormularioCorteDemo {
  if (!value || typeof value !== 'object') return false;
  const form = value as Partial<FormularioCorteDemo>;
  return typeof form.frente === 'string' && typeof form.inicio === 'string' && typeof form.fin === 'string' &&
    (form.ciudad === undefined || typeof form.ciudad === 'string') && (form.cliente === undefined || typeof form.cliente === 'string') &&
    typeof form.observaciones === 'string' && [form.actividades, form.personal, form.insumos].every(rows => Array.isArray(rows) && rows.every(esRecurso));
}

function esVersion(value: unknown): value is VersionDemo {
  if (!value || typeof value !== 'object') return false;
  const version = value as Partial<VersionDemo>;
  return Number.isInteger(version.version) && Number(version.version) > 0 &&
    typeof version.fecha === 'string' && Number.isFinite(Date.parse(version.fecha)) &&
    typeof version.autor === 'string' && typeof version.rol === 'string' && typeof version.motivo === 'string' &&
    ESTADOS_CORTE.includes(version.estado as EstadoCorte) && esFormulario(version.datos);
}

function esCorte(value: unknown): value is CorteDemo {
  if (!value || typeof value !== 'object') return false;
  const corte = value as Partial<CorteDemo>;
  return typeof corte.id === 'string' && typeof corte.numero === 'string' &&
    typeof corte.autorCorreo === 'string' && typeof corte.autorNombre === 'string' &&
    Array.isArray(corte.versiones) && corte.versiones.length > 0 && corte.versiones.every(esVersion);
}

export function leerCortes(): CorteDemo[] {
  const raw = localStorage.getItem(CLAVE_CORTES);
  if (raw === null) return cortesIniciales();
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error('Los cortes de ejemplo guardados no se pudieron leer. Revisa el almacenamiento del navegador.'); }
  if (!Array.isArray(value) || !value.every(esCorte)) {
    throw new Error('El formato de los cortes guardados es incompatible. Conserva los datos del navegador antes de restablecer la demostración.');
  }
  return (value as CorteDemo[]).map(completarEjemplo);
}

/**
 * Los cortes de ejemplo guardados antes de existir ciudad y cliente los reciben de los datos iniciales.
 * Los demás cortes antiguos se conservan tal cual, sin esos datos.
 */
function completarEjemplo(corte: CorteDemo): CorteDemo {
  const base = cortesIniciales().find(item => item.id === corte.id)?.versiones[0].datos;
  if (!base || corte.versiones.every(version => version.datos.ciudad !== undefined && version.datos.cliente !== undefined)) return corte;
  return { ...corte, versiones: corte.versiones.map(version => ({ ...version,
    datos: { ...version.datos, ciudad: version.datos.ciudad ?? base.ciudad, cliente: version.datos.cliente ?? base.cliente } })) };
}

export function guardarCorteDemo({ id, anterior, datos, usuario, motivo, versionEsperada }: SolicitudCorteDemo): CorteDemo {
  if (usuario.rol !== 'residente') throw new Error('Este perfil tiene acceso de consulta a los cortes.');
  const error = validarCorteDemo(datos);
  if (error) throw new Error(error);
  const cortes = leerCortes();
  const existente = cortes.find(item => item.id === id);
  if (!anterior && existente) return existente;
  if (anterior && (!existente || existente.autorCorreo !== usuario.correo)) throw new Error('Solo el residente autor puede editar este corte de ejemplo.');
  if (anterior && !esEditable(existente!)) throw new Error(MOTIVO_CORTE_VISADO);
  if (anterior && existente!.versiones[0].version !== versionEsperada) throw new Error('El corte cambió en otra pestaña. Consulta su versión actual antes de guardar.');
  if (anterior && motivo.trim().length < 10) throw new Error('Escribe un motivo de al menos 10 caracteres.');
  const copia = structuredClone(datos);
  const version: VersionDemo = { version: (existente?.versiones[0].version ?? 0) + 1, fecha: ahora().toISOString(),
    autor: usuario.nombre, rol: usuario.etiqueta, motivo: anterior ? motivo.trim() : 'Registro inicial del corte',
    estado: 'En Revisión (Enviado)', datos: copia };
  const corte: CorteDemo = { id, numero: existente?.numero ?? String(Math.max(0, ...cortes.map(item => Number(item.numero))) + 1).padStart(2, '0'),
    autorCorreo: usuario.correo, autorNombre: usuario.nombre, versiones: [version, ...(existente?.versiones ?? [])] };
  localStorage.setItem(CLAVE_CORTES, JSON.stringify([corte, ...cortes.filter(item => item.id !== id)]));
  return corte;
}

/* ───────────── HU-M04 · Visado o devolución del director ───────────── */

export type DecisionCorte = Extract<EstadoCorte, 'Visado' | 'Devuelto con Observaciones'>;
export interface RevisionCorteDemo {
  corte: CorteDemo; usuario: UsuarioDemo | null; decision: DecisionCorte; observacion: string; versionEsperada: number;
}
export const OBSERVACION_VISADO = 'Revisión técnica conforme.';
export const CAUSAS_DEVOLUCION = [
  'Desfase en horas-hombre',
  'Falta soporte fotográfico',
  'Soporte PDF ilegible',
  'Cantidades no coinciden con el avance',
  'Falta firma del residente',
];

/**
 * Visa o devuelve un corte en revisión. Cada decisión es una versión nueva con
 * los mismos valores, el autor, el rol y la observación (bitácora, HU-M11).
 * No toca los demás cortes: el residente sigue registrando (visado no bloqueante).
 */
export function revisarCorteDemo({ corte, usuario, decision, observacion, versionEsperada }: RevisionCorteDemo): CorteDemo {
  if (!usuario || usuario.rol !== 'director') throw new Error('Solo el Director de Proyectos visa o devuelve cortes.');
  const texto = observacion.trim();
  if (decision === 'Devuelto con Observaciones' && texto.length < OBSERVACION_MIN_CARACTERES) {
    throw new Error(`Escribe una observación de al menos ${OBSERVACION_MIN_CARACTERES} caracteres para devolver el corte.`);
  }
  const cortes = leerCortes();
  const existente = cortes.find(item => item.id === corte.id);
  if (!existente) throw new Error('El corte ya no está disponible. Vuelve a la lista de cortes.');
  const vigente = existente.versiones[0];
  if (vigente.version !== versionEsperada) throw new Error(`El corte cambió (versión ${vigente.version}). Revisa la versión actual antes de decidir.`);
  if (vigente.estado !== 'En Revisión (Enviado)') throw new Error(`El Corte #${existente.numero} ya no está en revisión. Su estado es «${vigente.estado}».`);
  const version: VersionDemo = { version: vigente.version + 1, fecha: ahora().toISOString(), autor: usuario.nombre, rol: usuario.etiqueta,
    motivo: texto || OBSERVACION_VISADO, estado: decision, datos: structuredClone(vigente.datos) };
  const actualizado: CorteDemo = { ...existente, versiones: [version, ...existente.versiones] };
  localStorage.setItem(CLAVE_CORTES, JSON.stringify(cortes.map(item => (item.id === existente.id ? actualizado : item))));
  return actualizado;
}

export function horasTotales(form: FormularioCorteDemo): number {
  return form.personal.reduce((sum, row) => sum + Number(row.cantidad), 0);
}
