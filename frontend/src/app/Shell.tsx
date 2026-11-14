import { useEffect, useRef, useState } from 'react';
import { Building2, ClipboardList, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { Button, ErrorNotice } from '../components/ui';

export function Shell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    if (open) menuRef.current?.showModal();
    else menuRef.current?.close();
  }, [open]);
  async function exit() {
    setBusy(true);
    try { await signOut(); }
    catch (failure) { setError(failure); }
    finally { setBusy(false); navigate('/cuts', { replace: true }); }
  }
  const canRead = user?.is_superuser || user?.role !== 'sst';
  return <div className="app-shell">
    <aside className="sidebar desktop-sidebar"><SidebarContent canRead={Boolean(canRead)} /></aside>
    <dialog ref={menuRef} className="mobile-menu" onClose={() => setOpen(false)} aria-label="Menú principal">
      <button className="icon-button close-menu" aria-label="Cerrar menú" onClick={() => setOpen(false)}><X /></button>
      <SidebarContent canRead={Boolean(canRead)} onNavigate={() => setOpen(false)} />
    </dialog>
    <div className="workspace">
      <header className="topbar">
        <button className="icon-button menu-button" aria-label="Abrir menú"
          aria-expanded={open} onClick={() => setOpen(true)}><Menu /></button>
        <span className="topbar-title">Sistema operativo de obra</span>
        <div className="user-info"><strong>{user?.name}</strong><small>{user?.role_label}</small></div>
        <Button variant="ghost" busy={busy} onClick={() => void exit()} aria-label="Cerrar sesión"><LogOut size={18} /><span className="desktop-label">Salir</span></Button>
      </header>
      <main id="main-content" className="main-content"><ErrorNotice error={error} /><Outlet /></main>
      <footer className="workspace-footer"><span>Loard Construcciones S.A.S.</span><span>Operaciones · Cortes de obra</span></footer>
    </div>
  </div>;
}

function SidebarContent({ canRead, onNavigate }: { canRead: boolean; onNavigate?: () => void }) {
  return <>
      <div className="brand"><span className="brand-icon"><Building2 /></span><div>LOARD<span>CONSTRUCCIONES S.A.S.</span></div></div>
      <div className="sidebar-caption">ESPACIO DE TRABAJO</div>
      <nav aria-label="Navegación principal">
        {canRead ? <NavLink to="/cuts" onClick={onNavigate}><ClipboardList size={18} />Cortes de obra</NavLink> : null}
      </nav>
      <div className="sidebar-bottom"><ShieldCheck size={18} /><span>Operaciones y calidad<br /><small>Control documental de obra</small></span></div>
  </>;
}
