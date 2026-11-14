import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { guardarCorteDemo, leerCortes, type CorteDemo, type SolicitudCorteDemo } from './modeloDemo';

interface CortesApi {
  cortes: CorteDemo[];
  error: string;
  guardar: (solicitud: SolicitudCorteDemo) => CorteDemo;
}
const Contexto = createContext<CortesApi | null>(null);

export function CortesDemoProvider({ children }: { children: ReactNode }) {
  const [cortes, setCortes] = useState<CorteDemo[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    function cargar() {
      try { setCortes(leerCortes()); setError(''); }
      catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudieron leer los ejemplos.'); }
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
  return <Contexto.Provider value={{ cortes, error, guardar }}>{children}</Contexto.Provider>;
}

export function useCortesDemo() {
  const value = useContext(Contexto);
  if (!value) throw new Error('CortesDemoProvider es obligatorio.');
  return value;
}
