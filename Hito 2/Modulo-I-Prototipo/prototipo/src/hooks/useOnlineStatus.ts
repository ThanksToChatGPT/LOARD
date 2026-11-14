import { useSyncExternalStore } from 'react';

function suscribir(avisar: () => void) {
  window.addEventListener('online', avisar);
  window.addEventListener('offline', avisar);
  return () => {
    window.removeEventListener('online', avisar);
    window.removeEventListener('offline', avisar);
  };
}

/** `true` mientras el navegador reporta conexión. */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(suscribir, () => navigator.onLine, () => true);
}
