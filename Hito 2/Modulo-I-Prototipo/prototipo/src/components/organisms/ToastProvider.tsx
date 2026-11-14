import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { UNDO_MS } from '@/lib/constantes';
import { Toast } from '../molecules/Toast';
import { Portal } from './overlay';

interface ToastData {
  id: number;
  message: ReactNode;
  duration: number;
  actionLabel?: string;
  onAction?: () => void;
  /** Aviso con «Deshacer»: la acción real queda pendiente hasta que termine el plazo. */
  undo?: { onCommit: () => void; onUndo?: () => void };
}

type Cierre = 'expire' | 'action' | 'close';

export interface ToastApi {
  /** Aviso informativo: «Curso registrado.» */
  show: (opciones: { message: ReactNode; actionLabel?: string; onAction?: () => void; duration?: number }) => void;
  /**
   * Aviso con «Deshacer» por 5 segundos (§6.2B). Cambia la pantalla de inmediato y pasa:
   * - `onCommit`: envía a la API y escribe en la bitácora. Se llama al terminar el plazo,
   *   al cerrar el aviso, al validar otro ítem o al salir de la pantalla.
   * - `onUndo`: devuelve la pantalla al estado anterior. No deja registro.
   */
  showUndo: (opciones: { message: ReactNode; onCommit: () => void; onUndo?: () => void }) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast debe usarse dentro de <ToastProvider>.');
  return api;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const lista = useRef<ToastData[]>([]);
  const siguienteId = useRef(0);

  const guardar = useCallback((nueva: ToastData[]) => {
    lista.current = nueva;
    setToasts(nueva);
  }, []);

  const cerrar = useCallback(
    (id: number, cierre: Cierre) => {
      const toast = lista.current.find((t) => t.id === id);
      if (!toast) return;
      guardar(lista.current.filter((t) => t.id !== id));
      if (toast.undo) {
        if (cierre === 'action') toast.undo.onUndo?.();
        else toast.undo.onCommit();
      } else if (cierre === 'action') {
        toast.onAction?.();
      }
    },
    [guardar],
  );

  const confirmarPendientes = useCallback(() => {
    for (const t of lista.current.filter((x) => x.undo)) cerrar(t.id, 'expire');
  }, [cerrar]);

  const api = useMemo<ToastApi>(
    () => ({
      show: ({ message, actionLabel, onAction, duration = UNDO_MS }) => {
        guardar([...lista.current, { id: siguienteId.current++, message, actionLabel, onAction, duration }]);
      },
      showUndo: ({ message, onCommit, onUndo }) => {
        confirmarPendientes(); // validar otro ítem confirma el anterior
        guardar([
          ...lista.current,
          {
            id: siguienteId.current++,
            message,
            duration: UNDO_MS,
            actionLabel: 'Deshacer',
            undo: { onCommit, onUndo },
          },
        ]);
      },
    }),
    [guardar, confirmarPendientes],
  );

  // Ctrl+Z deshace mientras el aviso está visible; salir de la página confirma lo pendiente.
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z' || e.shiftKey) return;
      const destino = e.target as HTMLElement | null;
      if (destino?.matches?.('input, textarea, [contenteditable="true"]')) return; // deshacer de texto
      const pendiente = [...lista.current].reverse().find((t) => t.undo);
      if (!pendiente) return;
      e.preventDefault();
      cerrar(pendiente.id, 'action');
    };
    window.addEventListener('keydown', alTeclear);
    window.addEventListener('pagehide', confirmarPendientes);
    return () => {
      window.removeEventListener('keydown', alTeclear);
      window.removeEventListener('pagehide', confirmarPendientes);
      confirmarPendientes();
    };
  }, [cerrar, confirmarPendientes]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Portal>
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-gutter-md bottom-gutter-md z-[60] flex flex-col gap-gutter-sm tablet:left-auto tablet:w-[400px]"
        >
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={cerrar} />
          ))}
        </div>
      </Portal>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastData; onClose: (id: number, cierre: Cierre) => void }) {
  const [conPuntero, setConPuntero] = useState(false);
  const [conFoco, setConFoco] = useState(false);
  const restante = useRef(toast.duration);
  const pausado = conPuntero || conFoco;

  // El conteo se pausa mientras el puntero está encima o el aviso tiene el foco.
  useEffect(() => {
    if (pausado) return;
    const inicio = Date.now();
    const t = window.setTimeout(() => onClose(toast.id, 'expire'), restante.current);
    return () => {
      window.clearTimeout(t);
      restante.current = Math.max(0, restante.current - (Date.now() - inicio));
    };
  }, [pausado, toast.id, onClose]);

  return (
    <Toast
      className="pointer-events-auto"
      message={toast.message}
      actionLabel={toast.actionLabel}
      onAction={() => onClose(toast.id, 'action')}
      onClose={() => onClose(toast.id, 'close')}
      onMouseEnter={() => setConPuntero(true)}
      onMouseLeave={() => setConPuntero(false)}
      onFocus={() => setConFoco(true)}
      onBlur={() => setConFoco(false)}
    />
  );
}
