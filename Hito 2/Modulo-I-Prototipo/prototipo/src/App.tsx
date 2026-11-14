import { ToastProvider } from '@/components';
import { Muestra } from '@/muestra/Muestra';

/**
 * Por ahora la aplicación solo monta la página de muestra de componentes.
 * Las pantallas de cada módulo se construyen en `src/features` y se conectan aquí.
 */
export function App() {
  return (
    <ToastProvider>
      <Muestra />
    </ToastProvider>
  );
}
