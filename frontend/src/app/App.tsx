import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { LoginPage } from '../features/auth/LoginPage';
import { Button, EmptyState, ErrorNotice, Skeleton } from '../components/ui';

export function AuthGate() {
  const { user, loading, error, reload } = useAuth();
  if (loading) return <main className="boot-screen"><Skeleton rows={3} /></main>;
  if (error) return <main className="boot-screen"><ErrorNotice error={error} /><Button onClick={() => void reload()}>Reintentar conexión</Button></main>;
  if (!user) return <LoginPage />;
  return <Outlet />;
}

export function CutsGate() {
  const { user } = useAuth();
  if (user?.role === 'sst' && !user.is_superuser) return <EmptyState title="Acceso SST"><p className="muted">Tu cuenta está activa. El módulo de SST corresponde a otra entrega del equipo.</p></EmptyState>;
  return <Outlet />;
}

export function HomeRedirect() { return <Navigate to="/cuts" replace />; }
