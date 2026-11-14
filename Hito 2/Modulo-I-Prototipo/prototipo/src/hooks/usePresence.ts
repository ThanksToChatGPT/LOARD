import { useEffect, useState } from 'react';

/**
 * Mantiene montado un panel mientras corre su animación de salida
 * (`surface-exit`, 150 ms) antes de quitarlo del DOM.
 */
export function usePresence(abierto: boolean, duracionSalidaMs = 150) {
  const [montado, setMontado] = useState(abierto);

  useEffect(() => {
    if (abierto) {
      setMontado(true);
      return;
    }
    const t = window.setTimeout(() => setMontado(false), duracionSalidaMs);
    return () => window.clearTimeout(t);
  }, [abierto, duracionSalidaMs]);

  return { montado: abierto || montado, saliendo: !abierto && montado };
}
