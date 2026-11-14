import { useCallback, useEffect, useState } from 'react';

export type Tema = 'light' | 'dark';

const CLAVE = 'loard_tema';

function temaInicial(): Tema {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado === 'light' || guardado === 'dark') return guardado;
  } catch {
    // Sin acceso a localStorage: se usa la preferencia del sistema.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Tema claro/oscuro. Lo aplica en `<html data-theme>` y lo recuerda en el dispositivo. */
export function useTheme() {
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    try {
      localStorage.setItem(CLAVE, tema);
    } catch {
      // El tema sigue aplicado aunque no se pueda recordar.
    }
  }, [tema]);

  const alternar = useCallback(() => setTema((t) => (t === 'dark' ? 'light' : 'dark')), []);

  return { tema, setTema, alternar };
}
