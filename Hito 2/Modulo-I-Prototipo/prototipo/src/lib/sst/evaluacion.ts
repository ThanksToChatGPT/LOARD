/**
 * Estado SST de un trabajador a partir de sus registros. Usa el semáforo de `@/lib/semaforo`
 * para cada curso y para la aptitud, y elige el peor como estado general.
 */

import type { EstadoSST } from '@/lib/estados';
import { diasRestantes, formatoFecha, numeroDeDia, plural, type FechaCalendario } from '@/lib/formato';
import { GRAVEDAD_SST, calcularEstadoSST, textoVencimiento } from '@/lib/semaforo';
import type { Aptitud, Curso, EventoBitacora, Trabajador } from './tipos';

export const ETIQUETA_APTITUD = 'Aptitud médica';

export interface ItemSST {
  clave: string;
  etiqueta: string;
  estado: EstadoSST;
  /** Días hasta el vencimiento; sin valor si falta el registro. */
  dias?: number;
  vencimiento?: FechaCalendario;
  /** Causa corta en minúscula inicial: «vencido hace 4 días», «falta el registro». */
  causa: string;
}

export interface EvaluacionSST {
  estado: EstadoSST;
  /** Ítem que define el estado general. */
  principal: ItemSST;
  /** Otros ítems en alerta o bloqueados. */
  otrosEnAlerta: ItemSST[];
  /** Motivo visible en la fila: «Bloqueado: Trabajo en alturas vencido hace 4 días». */
  motivo: string;
  items: ItemSST[];
}

const minuscula = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** El registro más reciente de cada tipo es el vigente; los demás quedan reemplazados. */
export function cursosVigentes(cursos: Curso[]): Curso[] {
  const porTipo = new Map<string, Curso>();
  for (const c of cursos) {
    const actual = porTipo.get(c.tipo);
    if (!actual || c.registradoEn > actual.registradoEn) porTipo.set(c.tipo, c);
  }
  return [...porTipo.values()];
}

export function aptitudVigente(aptitudes: Aptitud[]): Aptitud | undefined {
  return aptitudes.reduce<Aptitud | undefined>(
    (ultima, a) => (!ultima || a.registradoEn > ultima.registradoEn ? a : ultima),
    undefined,
  );
}

function itemPorVencimiento(clave: string, etiqueta: string, vencimiento: FechaCalendario, hoy: FechaCalendario): ItemSST {
  return {
    clave,
    etiqueta,
    vencimiento,
    estado: calcularEstadoSST(vencimiento, hoy),
    dias: diasRestantes(vencimiento, hoy),
    causa: minuscula(textoVencimiento(vencimiento, hoy)),
  };
}

/** Orden: más grave primero; entre iguales, No Habilitado antes y luego el que vence antes. */
function compararItems(a: ItemSST, b: ItemSST): number {
  const g = GRAVEDAD_SST[b.estado] - GRAVEDAD_SST[a.estado];
  if (g !== 0) return g;
  if (a.estado !== b.estado) return a.estado === 'No Habilitado' ? -1 : 1;
  return (a.dias ?? -Infinity) - (b.dias ?? -Infinity);
}

export function evaluar(
  trabajador: Trabajador,
  cursos: Curso[],
  aptitudes: Aptitud[],
  hoy: FechaCalendario,
): EvaluacionSST {
  const vigentes = cursosVigentes(cursos);
  const items: ItemSST[] = trabajador.cursosRequeridos.map((tipo) => {
    const curso = vigentes.find((c) => c.tipo === tipo);
    if (!curso) return { clave: tipo, etiqueta: tipo, estado: 'No Habilitado', causa: 'sin curso registrado' };
    return itemPorVencimiento(tipo, tipo, curso.vencimiento, hoy);
  });

  const aptitud = aptitudVigente(aptitudes);
  if (!aptitud) {
    items.push({ clave: 'aptitud', etiqueta: ETIQUETA_APTITUD, estado: 'No Habilitado', causa: 'sin concepto registrado' });
  } else if (aptitud.concepto === 'No Habilitado') {
    items.push({
      clave: 'aptitud',
      etiqueta: ETIQUETA_APTITUD,
      estado: 'No Habilitado',
      vencimiento: aptitud.vencimiento,
      causa: 'concepto No Habilitado',
    });
  } else {
    items.push(itemPorVencimiento('aptitud', ETIQUETA_APTITUD, aptitud.vencimiento, hoy));
  }

  const ordenados = [...items].sort(compararItems);
  const principal = ordenados[0];
  const otrosEnAlerta = ordenados.slice(1).filter((i) => i.estado !== 'Habilitado');
  const estado = principal.estado;

  let motivo: string;
  if (estado === 'Habilitado') {
    const proximo = principal.vencimiento ? ` · próximo: ${principal.etiqueta} el ${formatoFecha(principal.vencimiento)}` : '';
    motivo = `Al día${proximo}`;
  } else {
    const base = `${principal.etiqueta} ${principal.causa}`;
    motivo = estado === 'Vencido' || estado === 'No Habilitado' ? `Bloqueado: ${base}` : base;
  }

  return { estado, principal, otrosEnAlerta, motivo, items };
}

/** «1 alerta más», «2 bloqueos más». */
export function textoOtros(otros: ItemSST[]): string | null {
  if (otros.length === 0) return null;
  const bloqueos = otros.filter((o) => GRAVEDAD_SST[o.estado] >= 3).length;
  const alertas = otros.length - bloqueos;
  return [
    bloqueos > 0 && `${plural(bloqueos, 'bloqueo', 'bloqueos')} más`,
    alertas > 0 && `${plural(alertas, 'alerta', 'alertas')} más`,
  ]
    .filter(Boolean)
    .join(' y ');
}

/* ───────────────────────── Bitácora ───────────────────────── */

const SISTEMA = { usuario: 'Semáforo SST', rol: 'cálculo diario automático' };
const SIN_REGISTRO = 'Sin registro';
const MS_DIA = 86_400_000;
const DESFASE_BOGOTA_MS = 5 * 3_600_000;

/** Día calendario (Bogotá) de un instante, como 'AAAA-MM-DD'. */
function diaDe(fecha: Date): FechaCalendario {
  return new Date(numeroDeDia(fecha) * MS_DIA).toISOString().slice(0, 10);
}

function sumarDias(fecha: FechaCalendario, n: number): FechaCalendario {
  return new Date((numeroDeDia(fecha) + n) * MS_DIA).toISOString().slice(0, 10);
}

/** 00:05 en Bogotá del día dado: cuando corre el cálculo diario. */
function inicioDelDia(fecha: FechaCalendario): Date {
  return new Date(numeroDeDia(fecha) * MS_DIA + DESFASE_BOGOTA_MS + 5 * 60_000);
}

function describirRegistro(r: { curso?: Curso; aptitud?: Aptitud }, cursos: Curso[]): string {
  if (r.curso) {
    const c = r.curso;
    const anterior = c.reemplazaA ? cursos.find((x) => x.id === c.reemplazaA) : undefined;
    const base = `${c.tipo} (${c.entidad}), vigente hasta el ${formatoFecha(c.vencimiento)}. Certificado: ${c.certificado.nombre}`;
    return anterior
      ? `Corrección: registró de nuevo el curso ${base}. Reemplaza el registro del ${formatoFecha(anterior.registradoEn)}.`
      : `Registró el curso ${base}.`;
  }
  const a = r.aptitud!;
  return `Actualizó la aptitud médica: concepto ${a.concepto}, expedido el ${formatoFecha(a.expedicion)} y vigente hasta el ${formatoFecha(a.vencimiento)}.`;
}

/**
 * Bitácora de solo lectura del trabajador, de la más reciente a la más antigua.
 * Se deriva de los registros: cada curso o aptitud registrada deja una línea, y el
 * cálculo diario deja otra cada vez que el semáforo cambia el estado general.
 */
export function construirBitacora(
  trabajador: Trabajador,
  cursos: Curso[],
  aptitudes: Aptitud[],
  hoy: FechaCalendario,
): EventoBitacora[] {
  const registros = [
    ...cursos.map((curso) => ({ fecha: curso.registradoEn, usuario: curso.registradoPor, curso })),
    ...aptitudes.map((aptitud) => ({ fecha: aptitud.registradoEn, usuario: aptitud.registradoPor, aptitud })),
  ].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  if (registros.length === 0) return [];

  const hasta = (instante: Date, incluir: boolean) => {
    const cumple = (f: Date) => (incluir ? f <= instante : f < instante);
    return { c: cursos.filter((x) => cumple(x.registradoEn)), a: aptitudes.filter((x) => cumple(x.registradoEn)) };
  };
  const estadoEn = (instante: Date, dia: FechaCalendario, incluir: boolean) => {
    const { c, a } = hasta(instante, incluir);
    return c.length + a.length === 0 ? SIN_REGISTRO : evaluar(trabajador, c, a, dia).estado;
  };

  const eventos: EventoBitacora[] = [];

  // Registros hechos al mismo instante (alta en el control) van en una sola línea.
  const grupos = new Map<number, typeof registros>();
  for (const r of registros) grupos.set(r.fecha.getTime(), [...(grupos.get(r.fecha.getTime()) ?? []), r]);
  for (const [ms, grupo] of grupos) {
    const fecha = new Date(ms);
    const dia = diaDe(fecha);
    const motivo =
      grupo.length > 1
        ? `Alta en el control SST. ${grupo.map((r) => describirRegistro(r, cursos)).join(' ')}`
        : describirRegistro(grupo[0], cursos);
    eventos.push({
      id: `reg-${trabajador.id}-${ms}`,
      trabajadorId: trabajador.id,
      fecha,
      usuario: grupo[0].usuario,
      rol: 'Coordinación SST',
      estadoAnterior: estadoEn(fecha, dia, false),
      estadoNuevo: estadoEn(fecha, dia, true),
      motivo,
    });
  }

  // Cambios del semáforo por paso del tiempo: se revisan los días en que algo cruza 30, 15 o 0 días.
  const primero = diaDe(registros[0].fecha);
  const candidatos = new Set<FechaCalendario>();
  for (const v of [...cursos.map((c) => c.vencimiento), ...aptitudes.map((a) => a.vencimiento)]) {
    for (const d of [sumarDias(v, -30), sumarDias(v, -15), sumarDias(v, 1)]) {
      if (numeroDeDia(d) > numeroDeDia(primero) && numeroDeDia(d) <= numeroDeDia(hoy)) candidatos.add(d);
    }
  }
  for (const dia of [...candidatos].sort()) {
    const instante = inicioDelDia(dia);
    const { c, a } = hasta(instante, true);
    if (c.length + a.length === 0) continue;
    const antes = evaluar(trabajador, c, a, sumarDias(dia, -1)).estado;
    const despues = evaluar(trabajador, c, a, dia);
    if (antes === despues.estado) continue;
    eventos.push({
      id: `sem-${trabajador.id}-${dia}`,
      trabajadorId: trabajador.id,
      fecha: instante,
      usuario: SISTEMA.usuario,
      rol: SISTEMA.rol,
      estadoAnterior: antes,
      estadoNuevo: despues.estado,
      motivo: despues.motivo,
    });
  }

  return eventos.sort((x, y) => y.fecha.getTime() - x.fecha.getTime());
}
