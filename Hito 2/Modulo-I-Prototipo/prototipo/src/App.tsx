import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router';
import { Banner, ToastProvider } from '@/components';
import { CortesLayout, PersonalCorte } from '@/features/cortes';
import { ActualizarAptitud, FichaTrabajador, ListaPersonal, RegistrarCurso, SstLayout } from '@/features/sst';
import { SstProvider } from '@/lib/sst/SstContext';
import { Muestra } from '@/muestra/Muestra';
import { AuthDemoProvider, rutaInicial, useAuthDemo } from '@/features/acceso/AuthDemo';
import type { RolDemo } from '@/features/acceso/AuthDemo';
import { Acceso } from '@/features/acceso/Acceso';
import { CortesDemoProvider } from '@/features/cortes/CortesDemoContext';
import { ListaCortes } from '@/features/cortes/ListaCortes';
import { DetalleCorte } from '@/features/cortes/DetalleCorte';
import { FormularioCorte } from '@/features/cortes/FormularioCorte';
import { CargasDossierProvider, ChecklistDossier, DocumentosSig, DossierLayout, DossierProvider, PublicarDocumento } from '@/features/dossier';
import { Bitacora } from '@/features/dossier/Bitacora';
import { SeguimientoLayout } from '@/lib/seguimiento/consulta';
import { lazy, Suspense } from 'react';

const EnsayosNdt = lazy(() => import('@/features/dossier/EnsayosNdt').then(m => ({ default: m.EnsayosNdt })));
const RegistrarEnsayoNdt = lazy(() => import('@/features/dossier/EnsayosNdt').then(m => ({ default: m.RegistrarEnsayoNdt })));
const AvanceDossier = lazy(() => import('@/features/dossier/AvanceDossier').then(m => ({ default: m.AvanceDossier })));
const Tablero = lazy(() => import('@/features/tablero/Tablero').then(m => ({ default: m.Tablero })));

/** Rutas de la aplicación. Cada módulo de `src/features` conecta aquí sus pantallas. */
export function App() {
  return <AuthDemoProvider><ContenidoDemo /></AuthDemoProvider>;
}

function ContenidoDemo() {
  const { usuario } = useAuthDemo();
  return (
    <ToastProvider>
      {/* Datos SST compartidos: lo que registra Coordinación SST se refleja en el selector del corte. */}
      <SstProvider puedeGestionar={!usuario || usuario.rol === 'sst'}>
        <CortesDemoProvider>
        <DossierProvider>
        <CargasDossierProvider>
        <BrowserRouter>
          <Suspense fallback={<main className="p-gutter-lg" role="status">Abriendo módulo de calidad…</main>}>
          <Routes>
            <Route path="acceso" element={<Acceso />} />
            <Route element={<SesionDemo />}>
            <Route index element={<InicioDemo />} />

            {/* HU-M09 · Personal SST */}
            <Route element={<PermisoDemo roles={['sst', 'director', 'calidad', 'gerencia']} />}>
            <Route path="sst" element={<SstLayout />}>
              <Route index element={<ListaPersonal />} />
              <Route path=":id" element={<FichaTrabajador />} />
              <Route element={<PermisoDemo roles={['sst']} />}>
                <Route path=":id/cursos/nuevo" element={<RegistrarCurso />} />
                <Route path=":id/aptitud" element={<ActualizarAptitud />} />
              </Route>
            </Route>
            </Route>

            {/* HU-M10 · Personal del corte con bloqueo SST */}
            <Route element={<PermisoDemo roles={['residente', 'director', 'calidad', 'gerencia']} />}>
            <Route path="cortes" element={<CortesLayout />}>
              <Route index element={<ListaCortes />} />
              <Route path=":id" element={<DetalleCorte />} />
              <Route element={<PermisoDemo roles={['residente']} />}>
                <Route path="nuevo" element={<FormularioCorte />} />
                <Route path=":id/editar" element={<FormularioCorte />} />
                <Route path="nuevo/personal" element={<PersonalCorte />} />
              </Route>
            </Route>
            </Route>

            {/* HU-M05 y HU-M06 · Dossier de calidad: checklist y documentos del SIG */}
            <Route element={<PermisoDemo roles={['residente', 'director', 'calidad', 'gerencia']} />}>
            <Route path="dossier" element={<DossierLayout />}>
              <Route index element={<ChecklistDossier />} />
              <Route path="ensayos" element={<EnsayosNdt />} />
              <Route path="avance" element={<AvanceDossier />} />
              <Route path="documentos" element={<DocumentosSig />} />
              <Route element={<PermisoDemo roles={['calidad']} />}>
                <Route path="ensayos/nuevo" element={<RegistrarEnsayoNdt />} />
                <Route path="documentos/publicar" element={<PublicarDocumento />} />
              </Route>
            </Route>
            </Route>

            {/* HU-M11 · Bitácora del registro y HU-M12 · Tablero del proyecto */}
            <Route element={<PermisoDemo roles={['calidad']} />}>
              <Route element={<SeguimientoLayout />}><Route path="dossier/bitacora" element={<Bitacora />} /></Route>
            </Route>
            <Route element={<PermisoDemo roles={['director', 'gerencia']} />}>
              <Route element={<SeguimientoLayout />}><Route path="dashboard" element={<Tablero />} /></Route>
            </Route>

            <Route path="muestra" element={<Muestra />} />
            <Route path="*" element={<InicioDemo />} />
            </Route>
          </Routes>
          </Suspense>
        </BrowserRouter>
        </CargasDossierProvider>
        </DossierProvider>
        </CortesDemoProvider>
      </SstProvider>
    </ToastProvider>
  );
}

function SesionDemo() {
  const { usuario } = useAuthDemo();
  return usuario ? <Outlet /> : <Navigate to="/acceso" replace />;
}
function InicioDemo() {
  const { usuario } = useAuthDemo();
  return <Navigate to={usuario ? rutaInicial(usuario) : '/acceso'} replace />;
}
function PermisoDemo({ roles }: { roles: RolDemo[] }) {
  const { usuario } = useAuthDemo();
  return usuario && roles.includes(usuario.rol) ? <Outlet /> : <main className="p-gutter-lg"><Banner tone="warning" title="Acceso restringido para este perfil de ejemplo">
    Elige otro perfil desde la pantalla de acceso para recorrer este módulo. <a className="underline" href="/">Volver al inicio</a>
  </Banner></main>;
}
