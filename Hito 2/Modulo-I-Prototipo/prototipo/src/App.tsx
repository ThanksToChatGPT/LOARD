import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { ToastProvider } from '@/components';
import { ActualizarAptitud, FichaTrabajador, ListaPersonal, RegistrarCurso, SstLayout } from '@/features/sst';
import { Muestra } from '@/muestra/Muestra';

/** Rutas de la aplicación. Cada módulo de `src/features` conecta aquí sus pantallas. */
export function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Navigate to="/sst" replace />} />

          {/* HU-M09 · Personal SST */}
          <Route path="sst" element={<SstLayout />}>
            <Route index element={<ListaPersonal />} />
            <Route path=":id" element={<FichaTrabajador />} />
            <Route path=":id/cursos/nuevo" element={<RegistrarCurso />} />
            <Route path=":id/aptitud" element={<ActualizarAptitud />} />
          </Route>

          <Route path="muestra" element={<Muestra />} />
          <Route path="*" element={<Navigate to="/sst" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
