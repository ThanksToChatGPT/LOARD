import { ESTADOS_CORTE, type EstadoCorte } from '@/lib/estados';
import type { UsuarioDemo } from '@/features/acceso/AuthDemo';
import { HOY_SST, ahora, momento } from '@/lib/sst/fechas';

export const ACTIVIDADES_DEMO = [
  { id: 'tuberia', nombre: 'Soldadura y tendido de tubería', unidad: 'm', prevista: 1200 },
  { id: 'soportes', nombre: 'Montaje de soportes metálicos', unidad: 'und', prevista: 80 },
];
export const INSUMOS_DEMO = [
  { id: 'electrodo', nombre: 'Electrodo E7018', unidad: 'kg' },
  { id: 'discos', nombre: 'Discos de corte', unidad: 'und' },
];
export const FRENTES_DEMO = ['Estación compresora', 'Línea de flujo L-3', 'Patio de tuberías'];
export interface RecursoDemo { id: string; cantidad: string }
export interface FormularioCorteDemo {
  frente: string; inicio: string; fin: string; observaciones: string;
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

export function validarCorteDemo(form: FormularioCorteDemo): string | null {
  if (!FRENTES_DEMO.includes(form.frente)) return 'Selecciona un frente del proyecto.';
  if (!form.inicio || !form.fin || !Number.isFinite(Date.parse(form.inicio)) || !Number.isFinite(Date.parse(form.fin))) return 'Completa las fechas del periodo.';
  if (form.fin < form.inicio) return 'El fin del periodo debe ser igual o posterior al inicio.';
  if (!form.actividades.length) return 'Agrega al menos una actividad ejecutada.';
  if (!form.personal.length) return 'Agrega al menos un trabajador habilitado.';
  for (const rows of [form.actividades, form.personal, form.insumos]) {
    if (new Set(rows.map(row => row.id)).size !== rows.length) return 'Cada recurso se puede registrar una vez por corte.';
    if (rows.some(row => !row.id || !Number.isFinite(Number(row.cantidad)) || Number(row.cantidad) <= 0)) return 'Las cantidades y las horas deben ser números positivos.';
  }
  if (form.actividades.some(row => !ACTIVIDADES_DEMO.some(item => item.id === row.id)) ||
      form.insumos.some(row => !INSUMOS_DEMO.some(item => item.id === row.id))) return 'Selecciona los recursos disponibles en el ejemplo.';
  const dias = (Date.parse(form.fin) - Date.parse(form.inicio)) / 86_400_000 + 1;
  if (form.personal.some(row => Number(row.cantidad) > dias * 24)) return 'Las horas por trabajador superan las horas disponibles en el periodo.';
  return null;
}

export function formularioVacio(): FormularioCorteDemo {
  return { frente: FRENTES_DEMO[0], inicio: HOY_SST, fin: HOY_SST, observaciones: '',
    actividades: [{ id: 'tuberia', cantidad: '' }], personal: [], insumos: [] };
}

export function cortesIniciales(): CorteDemo[] {
  return ['Visado', 'Devuelto con Observaciones', 'En Revisión (Enviado)'].map((estado, index) => {
    const datos: FormularioCorteDemo = { ...formularioVacio(), inicio: '2026-11-10', fin: HOY_SST,
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
    'cantidad' in value && typeof value.cantidad === 'string' && Number.isFinite(Number(value.cantidad));
}
export function esFormulario(value: unknown): value is FormularioCorteDemo {
  if (!value || typeof value !== 'object') return false;
  const form = value as Partial<FormularioCorteDemo>;
  return typeof form.frente === 'string' && typeof form.inicio === 'string' && typeof form.fin === 'string' &&
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
  return value as CorteDemo[];
}

export function guardarCorteDemo({ id, anterior, datos, usuario, motivo, versionEsperada }: SolicitudCorteDemo): CorteDemo {
  if (usuario.rol !== 'residente') throw new Error('Este perfil tiene acceso de consulta a los cortes.');
  const error = validarCorteDemo(datos);
  if (error) throw new Error(error);
  const cortes = leerCortes();
  const existente = cortes.find(item => item.id === id);
  if (!anterior && existente) return existente;
  if (anterior && (!existente || existente.autorCorreo !== usuario.correo)) throw new Error('Solo el residente autor puede editar este corte de ejemplo.');
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

export function horasTotales(form: FormularioCorteDemo): number {
  return form.personal.reduce((sum, row) => sum + Number(row.cantidad), 0);
}
