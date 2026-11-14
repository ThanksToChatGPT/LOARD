import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { COORDINADORA, DATOS_INICIALES } from './datos';
import { evaluar, type EvaluacionSST } from './evaluacion';
import { HOY_SST, ahora } from './fechas';
import type { Aptitud, Certificado, Curso, TipoCurso, Trabajador } from './tipos';

export interface NuevoCurso {
  trabajadorId: string;
  tipo: TipoCurso;
  entidad: string;
  expedicion: string;
  vencimiento: string;
  certificado: Certificado;
  reemplazaA?: string;
}

export type NuevaAptitud = Pick<Aptitud, 'trabajadorId' | 'concepto' | 'expedicion' | 'vencimiento'>;

export interface FilaPersonal {
  trabajador: Trabajador;
  evaluacion: EvaluacionSST;
}

interface SstApi {
  trabajadores: Trabajador[];
  cursos: Curso[];
  aptitudes: Aptitud[];
  /** Trabajador con su estado calculado al día del prototipo. */
  filas: FilaPersonal[];
  registrarCurso: (nuevo: NuevoCurso) => Curso;
  registrarAptitud: (nueva: NuevaAptitud) => Aptitud;
  /** Conexión real del navegador y, además, la simulada desde la topbar del prototipo. */
  enLinea: boolean;
  sinSenalSimulada: boolean;
  alternarSinSenal: () => void;
}

const SstContext = createContext<SstApi | null>(null);

export function useSst(): SstApi {
  const api = useContext(SstContext);
  if (!api) throw new Error('useSst debe usarse dentro de <SstProvider>.');
  return api;
}

let consecutivo = 0;
const nuevoId = (prefijo: string) => `${prefijo}-nuevo-${Date.now()}-${consecutivo++}`;

export function SstProvider({ children }: { children: ReactNode }) {
  const navegadorEnLinea = useOnlineStatus();
  const [sinSenalSimulada, setSinSenalSimulada] = useState(false);
  const [cursos, setCursos] = useState<Curso[]>(DATOS_INICIALES.cursos);
  const [aptitudes, setAptitudes] = useState<Aptitud[]>(DATOS_INICIALES.aptitudes);
  const trabajadores = DATOS_INICIALES.trabajadores;

  const filas = useMemo(
    () =>
      trabajadores.map((trabajador) => ({
        trabajador,
        evaluacion: evaluar(
          trabajador,
          cursos.filter((c) => c.trabajadorId === trabajador.id),
          aptitudes.filter((a) => a.trabajadorId === trabajador.id),
          HOY_SST,
        ),
      })),
    [trabajadores, cursos, aptitudes],
  );

  // Solo se agregan registros: nunca se editan ni se borran (HU-M09).
  const registrarCurso = useCallback((nuevo: NuevoCurso) => {
    const curso: Curso = { ...nuevo, id: nuevoId('c'), registradoPor: COORDINADORA.nombre, registradoEn: ahora() };
    setCursos((lista) => [...lista, curso]);
    return curso;
  }, []);

  const registrarAptitud = useCallback((nueva: NuevaAptitud) => {
    const aptitud: Aptitud = { ...nueva, id: nuevoId('a'), registradoPor: COORDINADORA.nombre, registradoEn: ahora() };
    setAptitudes((lista) => [...lista, aptitud]);
    return aptitud;
  }, []);

  const alternarSinSenal = useCallback(() => setSinSenalSimulada((v) => !v), []);

  const api = useMemo<SstApi>(
    () => ({
      trabajadores,
      cursos,
      aptitudes,
      filas,
      registrarCurso,
      registrarAptitud,
      enLinea: navegadorEnLinea && !sinSenalSimulada,
      sinSenalSimulada,
      alternarSinSenal,
    }),
    [trabajadores, cursos, aptitudes, filas, registrarCurso, registrarAptitud, navegadorEnLinea, sinSenalSimulada, alternarSinSenal],
  );

  return <SstContext.Provider value={api}>{children}</SstContext.Provider>;
}

/** Datos de un trabajador, o `null` si el id no existe. */
export function useTrabajador(id: string | undefined) {
  const { trabajadores, cursos, aptitudes, filas } = useSst();
  return useMemo(() => {
    const trabajador = trabajadores.find((t) => t.id === id);
    if (!trabajador) return null;
    return {
      trabajador,
      cursos: cursos.filter((c) => c.trabajadorId === trabajador.id),
      aptitudes: aptitudes.filter((a) => a.trabajadorId === trabajador.id),
      evaluacion: filas.find((f) => f.trabajador.id === trabajador.id)!.evaluacion,
    };
  }, [id, trabajadores, cursos, aptitudes, filas]);
}
