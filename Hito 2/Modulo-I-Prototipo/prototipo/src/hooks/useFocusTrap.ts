import { useEffect, useRef, type RefObject } from 'react';

const ENFOCABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface Opciones {
  /** Se llama al oprimir `Esc`. */
  onEscape?: () => void;
  /**
   * Elemento que recibe el foco al abrir. Por defecto, el primer campo;
   * en confirmaciones, marcar «Cancelar» con `data-autofocus`.
   */
  focoInicial?: RefObject<HTMLElement | null>;
}

/**
 * Reglas de teclado para diálogos, drawers y menú temporal (design.md §11.4):
 * al abrir, el foco entra; `Tab` circula solo adentro; `Esc` cierra;
 * al cerrar, el foco vuelve al control que lo abrió.
 */
export function useFocusTrap(
  contenedor: RefObject<HTMLElement | null>,
  activo: boolean,
  { onEscape, focoInicial }: Opciones = {},
) {
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!activo) return;
    const nodo = contenedor.current;
    if (!nodo) return;

    const anterior = document.activeElement as HTMLElement | null;
    const enfocables = () =>
      Array.from(nodo.querySelectorAll<HTMLElement>(ENFOCABLES)).filter((el) => el.offsetParent !== null);

    // Orden de preferencia: el indicado, [data-autofocus], el primer campo, el primer control.
    const primerCampo = nodo.querySelector<HTMLElement>(
      '[data-autofocus], input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])',
    );
    (focoInicial?.current ?? primerCampo ?? enfocables()[0] ?? nodo).focus();

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onEscapeRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const lista = enfocables();
      if (lista.length === 0) {
        e.preventDefault();
        return;
      }
      const primero = lista[0];
      const ultimo = lista[lista.length - 1];
      const actual = document.activeElement;
      if (e.shiftKey && (actual === primero || !nodo.contains(actual))) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (actual === ultimo || !nodo.contains(actual))) {
        e.preventDefault();
        primero.focus();
      }
    };

    nodo.addEventListener('keydown', alTeclear);
    return () => {
      nodo.removeEventListener('keydown', alTeclear);
      anterior?.focus?.();
    };
  }, [activo, contenedor, focoInicial]);
}
