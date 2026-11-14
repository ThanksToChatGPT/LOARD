import type { FechaCalendario } from '@/lib/formato';
import type { ConceptoMedico } from '@/lib/semaforo';

/** Cursos normativos que se controlan en obra. */
export const TIPOS_CURSO = [
  'Trabajo en alturas',
  'Coordinador de alturas',
  'Espacios confinados',
  'Primeros auxilios',
  'Manejo de sustancias químicas',
] as const;
export type TipoCurso = (typeof TIPOS_CURSO)[number];

export interface Trabajador {
  id: string;
  nombre: string;
  /** Cédula de ciudadanía, solo dígitos. */
  cedula: string;
  cargo: string;
  frente: string;
  /** Cursos que el cargo exige para estar habilitado. */
  cursosRequeridos: TipoCurso[];
}

export interface Certificado {
  nombre: string;
  bytes: number;
  /** URL local del archivo recién cargado, para el visor. Los de ejemplo no la tienen. */
  url?: string;
  tipoMime?: string;
}

/**
 * Un curso registrado. No se edita ni se borra: para corregirlo se registra
 * otro del mismo tipo y el anterior queda como reemplazado en el historial.
 */
export interface Curso {
  id: string;
  trabajadorId: string;
  tipo: TipoCurso;
  entidad: string;
  expedicion: FechaCalendario;
  vencimiento: FechaCalendario;
  certificado: Certificado;
  registradoPor: string;
  registradoEn: Date;
  /** Curso anterior al que este reemplaza, si es una corrección. */
  reemplazaA?: string;
}

/**
 * Aptitud médica: solo el concepto y sus fechas (reserva legal, design.md §10).
 * Nunca diagnósticos, restricciones ni texto clínico.
 */
export interface Aptitud {
  id: string;
  trabajadorId: string;
  concepto: ConceptoMedico;
  expedicion: FechaCalendario;
  vencimiento: FechaCalendario;
  registradoPor: string;
  registradoEn: Date;
}

/** Línea de la bitácora del trabajador (HU-M11). */
export interface EventoBitacora {
  id: string;
  trabajadorId: string;
  fecha: Date;
  usuario: string;
  rol: string;
  estadoAnterior: string;
  estadoNuevo: string;
  motivo: string;
}
