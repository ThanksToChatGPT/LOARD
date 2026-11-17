import { useCallback, useEffect, useRef, useState } from 'react';
import type { UploadStatus } from '@/components';

export interface CargaSimulada {
  /** Identifica a qué registro pertenece el archivo. Solo hay una carga por clave. */
  clave: string;
  archivo: File;
  estado: UploadStatus;
  progreso: number;
  error?: string;
}

interface Opciones {
  enLinea: boolean;
  /** Asocia el archivo a su registro cuando termina la carga. Si lanza un error, la carga queda en «error». */
  alConfirmar?: (carga: CargaSimulada) => void;
  /** Deja el archivo visible como «Archivo cargado» (formularios). Sin esto, sale de la lista al terminar. */
  conservar?: boolean;
}

/**
 * Cargas simuladas hacia el almacenamiento (#7.2): progreso de cada archivo y «Confirmando carga…».
 * Sin señal, los archivos esperan en cola y se suben solos al recuperar la conexión (#8.3).
 */
export function useCargasSimuladas({ enLinea, alConfirmar, conservar = false }: Opciones) {
  const [cargas, setCargas] = useState<CargaSimulada[]>([]);
  // El temporizador usa siempre la función más reciente sin reiniciarse en cada render.
  const confirmar = useRef(alConfirmar);
  confirmar.current = alConfirmar;
  const cambiar = (clave: string, cambio: Partial<CargaSimulada>) =>
    setCargas(lista => lista.map((carga): CargaSimulada => (carga.clave === clave ? { ...carga, ...cambio } : carga)));

  // Al perder o recuperar la señal, las cargas pasan a la cola o salen de ella.
  useEffect(() => {
    setCargas(lista => lista.map((carga): CargaSimulada => {
      if (!enLinea && (carga.estado === 'uploading' || carga.estado === 'confirming')) return { ...carga, estado: 'queued' };
      if (enLinea && carga.estado === 'queued') return { ...carga, estado: 'uploading' };
      return carga;
    }));
  }, [enLinea]);

  // Avance de los archivos que se están subiendo.
  const subiendo = cargas.some(carga => carga.estado === 'uploading');
  useEffect(() => {
    if (!subiendo) return;
    const t = window.setTimeout(() => setCargas(lista => lista.map((carga): CargaSimulada => {
      if (carga.estado !== 'uploading') return carga;
      const progreso = Math.min(100, carga.progreso + 9 + Math.random() * 14);
      return { ...carga, progreso, estado: progreso >= 100 ? 'confirming' : 'uploading' };
    })), 180);
    return () => window.clearTimeout(t);
  }, [cargas, subiendo]);

  // «Confirmando carga…»: el archivo se asocia a su registro, uno a la vez.
  const confirmando = cargas.find(carga => carga.estado === 'confirming');
  useEffect(() => {
    if (!confirmando) return;
    const { clave } = confirmando;
    const t = window.setTimeout(() => {
      try {
        confirmar.current?.(confirmando);
        if (conservar) cambiar(clave, { estado: 'done' });
        else setCargas(lista => lista.filter(carga => carga.clave !== clave));
      } catch (fallo) {
        cambiar(clave, { estado: 'error', error: fallo instanceof Error ? fallo.message : 'No se pudo asociar el archivo. Oprime «Reintentar».' });
      }
    }, 700);
    return () => window.clearTimeout(t);
  }, [confirmando, conservar]);

  const inicial = enLinea ? 'uploading' : 'queued';
  const iniciar = useCallback((clave: string, archivo: File) =>
    setCargas(lista => [...lista.filter(carga => carga.clave !== clave), { clave, archivo, estado: inicial, progreso: 0 }]), [inicial]);
  const cancelar = useCallback((clave?: string) => setCargas(lista => (clave === undefined ? [] : lista.filter(carga => carga.clave !== clave))), []);
  const reintentar = useCallback((clave: string) => cambiar(clave, { estado: inicial, progreso: 0, error: undefined }), [inicial]);

  return { cargas, iniciar, cancelar, reintentar };
}
