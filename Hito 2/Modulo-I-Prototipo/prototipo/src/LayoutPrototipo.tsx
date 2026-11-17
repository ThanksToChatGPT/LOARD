import { ClipboardList, FolderCheck, HardHat, History, Layers, LayoutDashboard, Moon, Power, Sun, Wifi, WifiOff } from 'lucide-react';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { AppShell, Banner, ConnectionIndicator, IconButton, OfflineQueueBanner } from '@/components';
import { useTheme } from '@/hooks/useTheme';
import { useSst } from '@/lib/sst/SstContext';
import { useAuthDemo } from '@/features/acceso/AuthDemo';

export interface UsuarioPrototipo {
  nombre: string;
  rol: string;
}

export interface LayoutPrototipoProps {
  /** Quién está usando la pantalla: cambia el pie del menú y el rol de la topbar. */
  usuario: UsuarioPrototipo;
  /** Texto de la franja sin conexión: qué se puede y qué no en este módulo. */
  mensajeSinSenal: string;
  /** Proyecto activo de la topbar. Por defecto, el contrato de ejemplo CW-118. */
  proyecto?: string;
}

const NAV = [
  { id: 'cortes', ruta: '/cortes', label: 'Cortes de obra', icon: <ClipboardList aria-hidden="true" className="h-5 w-5" /> },
  { id: 'dossier', ruta: '/dossier', label: 'Dossier de calidad', icon: <FolderCheck aria-hidden="true" className="h-5 w-5" /> },
  { id: 'bitacora', ruta: '/dossier/bitacora', label: 'Bitácora del registro', icon: <History aria-hidden="true" className="h-5 w-5" /> },
  { id: 'tablero', ruta: '/dashboard', label: 'Tablero del proyecto', icon: <LayoutDashboard aria-hidden="true" className="h-5 w-5" /> },
  { id: 'sst', ruta: '/sst', label: 'Personal SST', icon: <HardHat aria-hidden="true" className="h-5 w-5" /> },
  { id: 'muestra', ruta: '/muestra', label: 'Componentes', icon: <Layers aria-hidden="true" className="h-5 w-5" /> },
];

/**
 * Estructura del prototipo: menú, topbar con conexión y tema, y franja sin conexión.
 * Los botones de la topbar marcados «Prototipo» solo existen para la demostración.
 */
export function LayoutPrototipo({ usuario, mensajeSinSenal, proyecto }: LayoutPrototipoProps) {
  const { usuario: cuenta, salir } = useAuthDemo();
  const nombre = cuenta?.nombre ?? usuario.nombre;
  const rol = cuenta?.etiqueta ?? usuario.rol;
  // Bitácora (HU-M11): Calidad. Tablero (HU-M12): Director y Gerencia.
  // Cortes y dossier: todos menos SST. Personal SST: todos menos el residente.
  const nav = NAV.filter(item => item.id === 'bitacora' ? cuenta?.rol === 'calidad'
    : item.id === 'tablero' ? ['director', 'gerencia'].includes(cuenta?.rol ?? '')
    : item.id === 'muestra' || (item.id === 'sst' ? cuenta?.rol !== 'residente' : cuenta?.rol !== 'sst'));
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // La ruta más específica gana: /dossier/bitacora marca «Bitácora», no «Dossier».
  const activo = NAV.filter((n) => pathname.startsWith(n.ruta)).sort((a, b) => b.ruta.length - a.ruta.length)[0]?.id;
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
        items: nav.map(({ id, label, icon }) => ({ id, label, icon })),
        activeId: activo,
        onNavigate: (id) => navigate(NAV.find((n) => n.id === id)?.ruta ?? '/'),
        footer: (
          <p className="px-3 py-gutter-xs text-body-sm text-on-nav-muted">
            {nombre}
            <span className="block">{rol}</span>
          </p>
        ),
      }}
      topbar={{
        project: proyecto ?? 'Contrato CW-118 · Estación compresora',
        connection: <ConnectionIndicator state={enLinea ? 'online' : 'offline'} />,
        role: rol,
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
            <IconButton label="Cerrar sesión de ejemplo" onClick={() => { salir(); navigate('/acceso', { replace: true }); }}><Power aria-hidden="true" className="h-5 w-5" /></IconButton>
          </>
        ),
      }}
      banner={<><Banner tone="info">Prototipo de alta fidelidad · Datos de ejemplo guardados en este navegador.</Banner>{!enLinea && <OfflineQueueBanner state="offline" message={mensajeSinSenal} />}</>}
    >
      <Outlet />
    </AppShell>
  );
}
