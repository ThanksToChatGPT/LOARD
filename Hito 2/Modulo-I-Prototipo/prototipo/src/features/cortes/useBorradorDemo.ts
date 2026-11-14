import { useEffect, useRef, useState } from 'react';
import { esFormulario, type FormularioCorteDemo } from './modeloDemo';

interface Borrador { datos: FormularioCorteDemo; solicitud: string; version: number; motivo: string; fecha: string }

function leer(clave: string): Borrador | null {
  try {
    const value = JSON.parse(localStorage.getItem(clave) ?? 'null') as Borrador | null;
    return value && esFormulario(value.datos) && typeof value.solicitud === 'string' &&
      typeof value.motivo === 'string' && Number.isInteger(value.version) && Number.isFinite(Date.parse(value.fecha)) ? value : null;
  } catch { return null; }
}

export function useBorradorDemo(clave: string, contenido: Omit<Borrador, 'fecha'>, sucio: boolean) {
  const [pendiente, setPendiente] = useState(() => leer(clave));
  const [estado, setEstado] = useState('');
  const ultimo = useRef({ contenido, sucio, pendiente });
  const terminado = useRef(false);
  ultimo.current = { contenido, sucio, pendiente };

  useEffect(() => {
    function guardar() {
      const actual = ultimo.current;
      if (terminado.current || !actual.sucio || actual.pendiente) return;
      localStorage.setItem(clave, JSON.stringify({ ...actual.contenido, fecha: new Date().toISOString() }));
    }
    function alSalir(event: BeforeUnloadEvent) {
      if (ultimo.current.sucio && !terminado.current) {
        try { guardar(); } catch { /* El aviso de salida mantiene la opción de continuar. */ }
        event.preventDefault();
      }
    }
    window.addEventListener('beforeunload', alSalir);
    return () => {
      window.removeEventListener('beforeunload', alSalir);
      try { guardar(); } catch { /* La pantalla ya está cerrándose. */ }
    };
  }, [clave]);

  useEffect(() => {
    if (!sucio || pendiente || terminado.current) return;
    setEstado('Guardando borrador local…');
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(clave, JSON.stringify({ ...contenido, fecha: new Date().toISOString() }));
        setEstado('Borrador guardado en este navegador.');
      } catch { setEstado('El navegador no permitió guardar el borrador. Conserva esta pantalla abierta.'); }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [clave, contenido, sucio, pendiente]);

  function descartar() { localStorage.removeItem(clave); setPendiente(null); setEstado(''); }
  function completar() { terminado.current = true; try { localStorage.removeItem(clave); } catch { /* El corte ya se guardó. */ } }
  return { pendiente, estado, descartar, completar, continuar: () => setPendiente(null) };
}
