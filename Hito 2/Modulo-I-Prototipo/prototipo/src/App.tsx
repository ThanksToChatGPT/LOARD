import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { ToastProvider } from '@/components';
import { CortesLayout, PersonalCorte } from '@/features/cortes';
import { ActualizarAptitud, FichaTrabajador, ListaPersonal, RegistrarCurso, SstLayout } from '@/features/sst';
import { SstProvider } from '@/lib/sst/SstContext';
import { Muestra } from '@/muestra/Muestra';

/** Rutas de la aplicación. Cada módulo de `src/features` conecta aquí sus pantallas. */
export function App() {
  return (
    <ToastProvider>
      {/* Datos SST compartidos: lo que registra Coordinación SST se refleja en el selector del corte. */}
      <SstProvider>
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

            {/* HU-M10 · Personal del corte con bloqueo SST */}
            <Route path="cortes" element={<CortesLayout />}>
              <Route index element={<Navigate to="nuevo/personal" replace />} />
              <Route path="nuevo/personal" element={<PersonalCorte />} />
            </Route>

            <Route path="muestra" element={<Muestra />} />
            <Route path="*" element={<Navigate to="/sst" replace />} />
          </Routes>
        </BrowserRouter>
      </SstProvider>
    </ToastProvider>
  );
}
