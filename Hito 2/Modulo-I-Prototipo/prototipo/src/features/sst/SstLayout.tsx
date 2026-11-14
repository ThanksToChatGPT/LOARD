import { HardHat, Layers, Moon, Sun, Wifi, WifiOff } from 'lucide-react';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { AppShell, ConnectionIndicator, IconButton, OfflineQueueBanner } from '@/components';
import { useTheme } from '@/hooks/useTheme';
import { formatoHora } from '@/lib/formato';
import { COORDINADORA } from './datos';
import { SINCRONIZADO_EN } from './fechas';
import { SstProvider, useSst } from './SstContext';

export function SstLayout() {
  return (
    <SstProvider>
      <Estructura />
    </SstProvider>
  );
}

function Estructura() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { tema, alternar } = useTheme();
  const { enLinea, sinSenalSimulada, alternarSinSenal } = useSst();

  // Cada pantalla arranca arriba, como una página nueva.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <AppShell
      nav={{
        brand: (
          <span className="flex items-center gap-gutter-sm">
            <HardHat aria-hidden="true" className="h-5 w-5" /> Loard · Obra
          </span>
        ),
        items: [
          { id: 'sst', label: 'Personal SST', icon: <HardHat aria-hidden="true" className="h-5 w-5" /> },
          { id: 'muestra', label: 'Componentes', icon: <Layers aria-hidden="true" className="h-5 w-5" /> },
        ],
        activeId: pathname.startsWith('/muestra') ? 'muestra' : 'sst',
        onNavigate: (id) => navigate(id === 'muestra' ? '/muestra' : '/sst'),
        footer: (
          <p className="px-3 py-gutter-xs text-body-sm text-on-nav-muted">
            {COORDINADORA.nombre}
            <span className="block">{COORDINADORA.rol}</span>
          </p>
        ),
      }}
      topbar={{
        project: 'Contrato CW-118 · Estación compresora',
        connection: <ConnectionIndicator state={enLinea ? 'online' : 'offline'} />,
        role: COORDINADORA.rol,
        actions: (
          <>
            <IconButton
              label={sinSenalSimulada ? 'Prototipo: volver a simular conexión' : 'Prototipo: simular sin señal'}
              aria-pressed={sinSenalSimulada}
              onClick={alternarSinSenal}
            >
              {sinSenalSimulada ? <WifiOff aria-hidden="true" className="h-5 w-5" /> : <Wifi aria-hidden="true" className="h-5 w-5" />}
            </IconButton>
            <IconButton label={tema === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'} onClick={alternar}>
              {tema === 'dark' ? <Sun aria-hidden="true" className="h-5 w-5" /> : <Moon aria-hidden="true" className="h-5 w-5" />}
            </IconButton>
          </>
        ),
      }}
      banner={
        !enLinea && (
          <OfflineQueueBanner
            state="offline"
            message={`Sin conexión. Consultas con los datos SST actualizados hoy a las ${formatoHora(SINCRONIZADO_EN)}. Registrar cursos o aptitudes requiere señal.`}
          />
        )
      }
    >
      <Outlet />
    </AppShell>
  );
}
