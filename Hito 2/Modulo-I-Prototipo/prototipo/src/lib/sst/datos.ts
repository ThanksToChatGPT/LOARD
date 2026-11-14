/**
 * Datos de ejemplo de HU-M09. Los vencimientos se cuentan en días desde el 17/11/2026
 * (`HOY_SST`) para que aparezcan todos los estados del semáforo y sus límites:
 * vencido, vence hoy, 15, 16, 30 y 31 días, No Habilitado y curso faltante.
 */

import type { ConceptoMedico } from '@/lib/semaforo';
import { enDias, momento } from './fechas';
import type { Aptitud, Curso, TipoCurso, Trabajador } from './tipos';

export const COORDINADORA = { nombre: 'Laura Gómez', rol: 'Coordinación SST' };

const ENTIDADES: Record<TipoCurso, string> = {
  'Trabajo en alturas': 'Centro de Entrenamiento Andino',
  'Coordinador de alturas': 'Centro de Entrenamiento Andino',
  'Espacios confinados': 'Instituto Técnico del Pacífico',
  'Primeros auxilios': 'Escuela de Rescate del Valle',
  'Manejo de sustancias químicas': 'Instituto Técnico del Pacífico',
};

const SLUG: Record<TipoCurso, string> = {
  'Trabajo en alturas': 'alturas',
  'Coordinador de alturas': 'coord-alturas',
  'Espacios confinados': 'confinados',
  'Primeros auxilios': 'primeros-auxilios',
  'Manejo de sustancias químicas': 'sustancias',
};

/** Un curso dura un año: la expedición es 365 días antes del vencimiento. */
const VIGENCIA_DIAS = 365;

interface SemillaCurso {
  tipo: TipoCurso;
  vence: number;
  /** Días desde hoy en que se registró. Por defecto, el día de la expedición. */
  registrado?: number;
  hora?: string;
  reemplazaA?: string;
  id?: string;
}

interface SemillaAptitud {
  concepto: ConceptoMedico;
  vence: number;
  registrado?: number;
  hora?: string;
}

interface Semilla {
  trabajador: Trabajador;
  cursos: SemillaCurso[];
  aptitudes: SemillaAptitud[];
}

const SEMILLAS: Semilla[] = [
  {
    trabajador: { id: 't01', nombre: 'Jhon Angulo', cedula: '1144082315', cargo: 'Soldador', frente: 'Estación compresora', cursosRequeridos: ['Trabajo en alturas', 'Espacios confinados'] },
    cursos: [
      { tipo: 'Trabajo en alturas', vence: -4 },
      { tipo: 'Espacios confinados', vence: 210 },
    ],
    aptitudes: [{ concepto: 'Habilitado', vence: 150 }],
  },
  {
    trabajador: { id: 't02', nombre: 'Martha Ríos', cedula: '31986540', cargo: 'Ayudante de obra', frente: 'Línea de flujo L-3', cursosRequeridos: ['Trabajo en alturas'] },
    cursos: [{ tipo: 'Trabajo en alturas', vence: 180 }],
    aptitudes: [
      { concepto: 'Habilitado', vence: 40 },
      { concepto: 'No Habilitado', vence: 170, registrado: -6, hora: '10:42' },
    ],
  },
  {
    trabajador: { id: 't03', nombre: 'Carlos Arboleda', cedula: '16789432', cargo: 'Tubero', frente: 'Estación compresora', cursosRequeridos: ['Trabajo en alturas', 'Espacios confinados'] },
    cursos: [
      { tipo: 'Trabajo en alturas', vence: 90 },
      { tipo: 'Espacios confinados', vence: 60 },
    ],
    aptitudes: [{ concepto: 'Habilitado', vence: -1 }],
  },
  {
    trabajador: { id: 't04', nombre: 'Luis Mosquera', cedula: '94512378', cargo: 'Supervisor HSE', frente: 'Línea de flujo L-3', cursosRequeridos: ['Trabajo en alturas', 'Coordinador de alturas', 'Primeros auxilios'] },
    cursos: [
      { tipo: 'Trabajo en alturas', vence: 300 },
      { tipo: 'Coordinador de alturas', vence: 240 },
      { tipo: 'Primeros auxilios', vence: 0 },
    ],
    aptitudes: [{ concepto: 'Habilitado', vence: 190 }],
  },
  {
    trabajador: { id: 't05', nombre: 'Ana Valencia', cedula: '1130654987', cargo: 'Operadora de grúa', frente: 'Patio de tuberías', cursosRequeridos: ['Trabajo en alturas'] },
    cursos: [{ tipo: 'Trabajo en alturas', vence: 12 }],
    aptitudes: [{ concepto: 'Habilitado', vence: 200 }],
  },
  {
    trabajador: { id: 't06', nombre: 'Diego Caicedo', cedula: '1107845210', cargo: 'Pintor industrial', frente: 'Patio de tuberías', cursosRequeridos: ['Trabajo en alturas', 'Manejo de sustancias químicas'] },
    cursos: [
      { tipo: 'Trabajo en alturas', vence: 100 },
      { tipo: 'Manejo de sustancias químicas', vence: 45 },
    ],
    aptitudes: [{ concepto: 'Habilitado', vence: 15 }],
  },
  {
    trabajador: { id: 't07', nombre: 'Yesid Torres', cedula: '16934781', cargo: 'Electricista', frente: 'Estación compresora', cursosRequeridos: ['Trabajo en alturas'] },
    cursos: [{ tipo: 'Trabajo en alturas', vence: 16 }],
    aptitudes: [{ concepto: 'Habilitado', vence: 120 }],
  },
  {
    trabajador: { id: 't08', nombre: 'Paola Hurtado', cedula: '1144198765', cargo: 'Inspectora de calidad', frente: 'Línea de flujo L-3', cursosRequeridos: ['Trabajo en alturas'] },
    cursos: [{ tipo: 'Trabajo en alturas', vence: 28 }],
    aptitudes: [{ concepto: 'Habilitado', vence: 22 }],
  },
  {
    trabajador: { id: 't09', nombre: 'Andrés Lozano', cedula: '1113625874', cargo: 'Soldador', frente: 'Estación compresora', cursosRequeridos: ['Trabajo en alturas', 'Espacios confinados'] },
    cursos: [
      { tipo: 'Trabajo en alturas', vence: 30 },
      { tipo: 'Espacios confinados', vence: 130 },
    ],
    aptitudes: [{ concepto: 'Habilitado', vence: 95 }],
  },
  {
    trabajador: { id: 't10', nombre: 'Wilson Riascos', cedula: '76321458', cargo: 'Andamiero', frente: 'Patio de tuberías', cursosRequeridos: ['Trabajo en alturas', 'Coordinador de alturas'] },
    cursos: [
      { tipo: 'Trabajo en alturas', vence: 31 },
      { tipo: 'Coordinador de alturas', vence: 200 },
    ],
    aptitudes: [{ concepto: 'Habilitado', vence: 60 }],
  },
  {
    trabajador: { id: 't11', nombre: 'Sandra Mina', cedula: '29875412', cargo: 'Almacenista', frente: 'Patio de tuberías', cursosRequeridos: ['Primeros auxilios'] },
    cursos: [{ tipo: 'Primeros auxilios', vence: 300 }],
    aptitudes: [{ concepto: 'Habilitado', vence: 250 }],
  },
  {
    trabajador: { id: 't12', nombre: 'Fredy Cuero', cedula: '1061723456', cargo: 'Tubero', frente: 'Línea de flujo L-3', cursosRequeridos: ['Trabajo en alturas', 'Espacios confinados'] },
    cursos: [
      // Renovó alturas, se registró con el vencimiento mal digitado y se corrigió con un registro nuevo.
      { tipo: 'Trabajo en alturas', vence: -40 },
      { tipo: 'Trabajo en alturas', vence: 2, registrado: -45, hora: '09:15', id: 'c12-err' },
      { tipo: 'Trabajo en alturas', vence: 320, registrado: -44, hora: '08:03', reemplazaA: 'c12-err' },
      { tipo: 'Espacios confinados', vence: 95 },
    ],
    aptitudes: [{ concepto: 'Habilitado', vence: 180 }],
  },
  {
    trabajador: { id: 't13', nombre: 'Kevin Ortiz', cedula: '1144567321', cargo: 'Ayudante de obra', frente: 'Estación compresora', cursosRequeridos: ['Trabajo en alturas'] },
    cursos: [{ tipo: 'Trabajo en alturas', vence: -20 }],
    aptitudes: [
      { concepto: 'Habilitado', vence: 30 },
      { concepto: 'No Habilitado', vence: 175, registrado: -2, hora: '15:20' },
    ],
  },
  {
    trabajador: { id: 't14', nombre: 'Nelson Quiñónez', cedula: '1087412963', cargo: 'Operador de equipo', frente: 'Línea de flujo L-3', cursosRequeridos: ['Trabajo en alturas', 'Espacios confinados'] },
    cursos: [{ tipo: 'Trabajo en alturas', vence: 260 }],
    aptitudes: [{ concepto: 'Habilitado', vence: 210 }],
  },
];

/** Tamaño de archivo estable a partir de un texto: los datos no cambian entre recargas. */
function bytesDe(texto: string): number {
  let h = 0;
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 380_000 + (h % 2_400_000);
}

/** El alta de cada trabajador en el control SST: un día y hora fijos por trabajador. */
function altaDe(semilla: Semilla, indice: number): { dia: number; hora: string } {
  const vencimientos = [...semilla.cursos, ...semilla.aptitudes]
    .filter((x) => x.registrado == null)
    .map((x) => x.vence);
  // Al entrar al proyecto presentó todos sus soportes: el día de la expedición más reciente.
  const dia = Math.max(...vencimientos) - VIGENCIA_DIAS;
  return { dia, hora: `0${7 + (indice % 3)}:${String(10 + indice * 3).padStart(2, '0')}` };
}

function construir() {
  const trabajadores: Trabajador[] = [];
  const cursos: Curso[] = [];
  const aptitudes: Aptitud[] = [];

  SEMILLAS.forEach((semilla, i) => {
    const t = semilla.trabajador;
    const alta = altaDe(semilla, i);
    trabajadores.push(t);

    semilla.cursos.forEach((c, j) => {
      const nombre = `cert_${SLUG[c.tipo]}_${t.cedula}.pdf`;
      cursos.push({
        id: c.id ?? `c${t.id.slice(1)}-${j}`,
        trabajadorId: t.id,
        tipo: c.tipo,
        entidad: ENTIDADES[c.tipo],
        expedicion: enDias(c.vence - VIGENCIA_DIAS),
        vencimiento: enDias(c.vence),
        certificado: { nombre, bytes: bytesDe(nombre), tipoMime: 'application/pdf' },
        registradoPor: COORDINADORA.nombre,
        registradoEn: momento(c.registrado ?? alta.dia, c.hora ?? alta.hora),
        reemplazaA: c.reemplazaA,
      });
    });

    semilla.aptitudes.forEach((a, j) => {
      aptitudes.push({
        id: `a${t.id.slice(1)}-${j}`,
        trabajadorId: t.id,
        concepto: a.concepto,
        expedicion: enDias(a.registrado ?? a.vence - VIGENCIA_DIAS),
        vencimiento: enDias(a.vence),
        registradoPor: COORDINADORA.nombre,
        registradoEn: momento(a.registrado ?? alta.dia, a.hora ?? alta.hora),
      });
    });
  });

  return { trabajadores, cursos, aptitudes };
}

export const DATOS_INICIALES = construir();
