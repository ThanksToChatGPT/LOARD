import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useToast } from '@/components';
import { useAuthDemo } from '@/features/acceso/AuthDemo';
import { useSst } from '@/lib/sst/SstContext';
import { useDossier } from './DossierContext';
import { registrarArchivoSesion } from './modelo';
import { useCargasSimuladas } from './useCargasSimuladas';

type CargasApi = ReturnType<typeof useCargasSimuladas>;
const Contexto = createContext<CargasApi | null>(null);

/**
 * HU-M06 · Cola de soportes en carga, una por requisito (la clave es el id del requisito).
 * Vive por encima de las pantallas: el archivo sigue subiendo, o esperando la señal,
 * aunque se cierre el panel del requisito o se cambie de módulo (§8.3).
 */
export function CargasDossierProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuthDemo();
  const { cargar } = useDossier();
  const { enLinea } = useSst();
  const toast = useToast();
  const api = useCargasSimuladas({
    enLinea,
    alConfirmar: ({ clave, archivo }) => {
      const soporteId = crypto.randomUUID();
      const item = cargar({ itemId: clave, soporteId, archivo, usuario });
      registrarArchivoSesion(soporteId, archivo);
      toast.show({ message: `Soporte cargado. «${item.nombre}» quedó en estado ${item.estado}.` });
    },
  });

  // Las cargas pertenecen a quien las inició: al cambiar de sesión se descartan.
  const { cancelar } = api;
  const correo = usuario?.correo;
  useEffect(() => cancelar(), [correo, cancelar]);

  return <Contexto.Provider value={api}>{children}</Contexto.Provider>;
}

export function useCargasDossier() {
  const value = useContext(Contexto);
  if (!value) throw new Error('CargasDossierProvider es obligatorio.');
  return value;
}
