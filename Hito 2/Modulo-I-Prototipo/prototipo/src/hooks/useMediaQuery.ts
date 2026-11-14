import { useCallback, useSyncExternalStore } from 'react';

export function useMediaQuery(consulta: string): boolean {
  const suscribir = useCallback(
    (avisar: () => void) => {
      const mq = window.matchMedia(consulta);
      mq.addEventListener('change', avisar);
      return () => mq.removeEventListener('change', avisar);
    },
    [consulta],
  );
  return useSyncExternalStore(suscribir, () => window.matchMedia(consulta).matches, () => false);
}

/** Desde 600 px: retícula de 8 columnas. */
export const useEsTableta = () => useMediaQuery('(min-width: 600px)');

/** Desde 1024 px: retícula de 12 columnas y menú lateral fijo. */
export const useEsEscritorio = () => useMediaQuery('(min-width: 1024px)');
