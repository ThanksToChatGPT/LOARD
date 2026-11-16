import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  agregarItem, cargarSoporte, editarItem, leerDossier, publicarDocumento, retirarItem, revisarItem, registrarEnsayo, registrarActa, type DossierDemo,
} from './modelo';

interface DossierApi {
  /** Documentos y checklist. Un requisito en plazo de «Deshacer» ya se muestra como Validado. */
  dossier: DossierDemo;
  confirmado: DossierDemo;
  /** Problema al leer lo guardado en el navegador. */
  error: string;
  /** Requisitos cuya validación aún se puede deshacer (§6.2B): todavía no está en la bitácora. */
  porValidar: string[];
  iniciarValidacion: (itemId: string) => void;
  terminarValidacion: (itemId: string) => void;
  publicar: typeof publicarDocumento;
  agregar: typeof agregarItem;
  editar: typeof editarItem;
  retirar: typeof retirarItem;
  cargar: typeof cargarSoporte;
  revisar: typeof revisarItem;
  registrarNdt: typeof registrarEnsayo;
  aceptarActa: typeof registrarActa;
}

const Contexto = createContext<DossierApi | null>(null);
const VACIO: DossierDemo = { documentos: [], items: [] };

function leerSeguro(): { dossier: DossierDemo; error: string } {
  try { return { dossier: leerDossier(), error: '' }; }
  catch (fallo) { return { dossier: VACIO, error: fallo instanceof Error ? fallo.message : 'No se pudo leer el dossier de ejemplo.' }; }
}

/** Datos del dossier compartidos por la checklist, el buscador y la publicación de documentos. */
export function DossierProvider({ children }: { children: ReactNode }) {
  const [{ dossier, error }, setLectura] = useState(leerSeguro);
  const [porValidar, setPorValidar] = useState<string[]>([]);
  const recargar = useCallback(() => setLectura(leerSeguro()), []);

  // Otra pestaña pudo cambiar el dossier: se vuelve a leer al recibir el aviso o al volver a esta.
  useEffect(() => {
    window.addEventListener('storage', recargar);
    window.addEventListener('focus', recargar);
    return () => { window.removeEventListener('storage', recargar); window.removeEventListener('focus', recargar); };
  }, [recargar]);

  const acciones = useMemo(() => {
    /** Ejecuta una regla del modelo y refresca la pantalla con lo que quedó guardado. */
    const conRecarga = <A extends unknown[], R>(regla: (...args: A) => R) => (...args: A): R => {
      try { return regla(...args); } finally { recargar(); }
    };
    return {
      iniciarValidacion: (itemId: string) => setPorValidar(ids => [...ids, itemId]),
      terminarValidacion: (itemId: string) => setPorValidar(ids => ids.filter(id => id !== itemId)),
      publicar: conRecarga(publicarDocumento), agregar: conRecarga(agregarItem), editar: conRecarga(editarItem),
      retirar: conRecarga(retirarItem), cargar: conRecarga(cargarSoporte), revisar: conRecarga(revisarItem),
      registrarNdt: conRecarga(registrarEnsayo), aceptarActa: conRecarga(registrarActa),
    };
  }, [recargar]);

  const api = useMemo<DossierApi>(() => ({
    ...acciones, error, porValidar, confirmado: dossier,
    dossier: { ...dossier, items: dossier.items.map(item => (porValidar.includes(item.id) && item.estado === 'Archivo Cargado' ? { ...item, estado: 'Validado' } : item)) },
  }), [acciones, dossier, error, porValidar]);

  return <Contexto.Provider value={api}>{children}</Contexto.Provider>;
}

export function useDossier() {
  const value = useContext(Contexto);
  if (!value) throw new Error('DossierProvider es obligatorio.');
  return value;
}
