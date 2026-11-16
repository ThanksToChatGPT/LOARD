import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { guardarCorteDemo, leerCortes, revisarCorteDemo, type CorteDemo, type RevisionCorteDemo, type SolicitudCorteDemo } from './modeloDemo';
import { agregarSoporteDemo, leerSoportes, retirarSoporteDemo, type RetiroSoporteDemo, type SolicitudSoporteDemo, type SoporteDemo } from './soportes';

interface CortesApi {
  cortes: CorteDemo[];
  error: string;
  guardar: (solicitud: SolicitudCorteDemo) => CorteDemo;
  /** HU-M04: visar o devolver con observaciones. */
  revisar: (solicitud: RevisionCorteDemo) => CorteDemo;
  /** HU-M03: soportes de todos los cortes, incluidos los retirados. */
  soportes: SoporteDemo[];
  errorSoportes: string;
  agregarSoporte: (solicitud: SolicitudSoporteDemo) => SoporteDemo;
  retirarSoporte: (solicitud: RetiroSoporteDemo) => SoporteDemo;
}
const Contexto = createContext<CortesApi | null>(null);

export function CortesDemoProvider({ children }: { children: ReactNode }) {
  const [cortes, setCortes] = useState<CorteDemo[]>([]);
  const [error, setError] = useState('');
  const [soportes, setSoportes] = useState<SoporteDemo[]>([]);
  const [errorSoportes, setErrorSoportes] = useState('');
  useEffect(() => {
    function cargar() {
      try { setCortes(leerCortes()); setError(''); }
      catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudieron leer los ejemplos.'); }
      try { setSoportes(leerSoportes()); setErrorSoportes(''); }
      catch (failure) { setErrorSoportes(failure instanceof Error ? failure.message : 'No se pudieron leer los soportes de ejemplo.'); }
    }
    cargar();
    window.addEventListener('storage', cargar);
    window.addEventListener('focus', cargar);
    return () => { window.removeEventListener('storage', cargar); window.removeEventListener('focus', cargar); };
  }, []);
  function guardar(solicitud: SolicitudCorteDemo) {
    const corte = guardarCorteDemo(solicitud);
    setCortes(leerCortes());
    setError('');
    return corte;
  }
  function revisar(solicitud: RevisionCorteDemo) {
    const corte = revisarCorteDemo(solicitud);
    setCortes(leerCortes());
    setError('');
    return corte;
  }
  const agregarSoporte = useCallback((solicitud: SolicitudSoporteDemo) => {
    const soporte = agregarSoporteDemo(solicitud);
    setSoportes(leerSoportes());
    setErrorSoportes('');
    return soporte;
  }, []);
  const retirarSoporte = useCallback((solicitud: RetiroSoporteDemo) => {
    const soporte = retirarSoporteDemo(solicitud);
    setSoportes(leerSoportes());
    setErrorSoportes('');
    return soporte;
  }, []);
  return <Contexto.Provider value={{ cortes, error, guardar, revisar, soportes, errorSoportes, agregarSoporte, retirarSoporte }}>{children}</Contexto.Provider>;
}

export function useCortesDemo() {
  const value = useContext(Contexto);
  if (!value) throw new Error('CortesDemoProvider es obligatorio.');
  return value;
}
