import { NavLink } from 'react-router';
import { LayoutPrototipo } from '@/LayoutPrototipo';
import { cn } from '@/lib/cn';

const CALIDAD = { nombre: 'Dilan Castro', rol: 'Coordinación SIG / Calidad' };

/** Pantallas de HU-M05 y HU-M06: checklist del dossier y documentos del SIG. */
export function DossierLayout() {
  return (
    <LayoutPrototipo
      usuario={CALIDAD}
      mensajeSinSenal="Sin conexión. Puedes consultar la checklist y los documentos vigentes. Los archivos que selecciones esperan la señal. Validar, observar, publicar y cambiar la checklist requieren conexión."
    />
  );
}

const PESTANAS = [
  { to: '/dossier', label: 'Checklist', end: true },
  { to: '/dossier/documentos', label: 'Documentos del SIG', end: false },
];

/** Cambia entre las dos vistas del dossier. La activa se anuncia con `aria-current`. */
export function PestanasDossier() {
  return (
    <nav aria-label="Secciones del dossier" className="col-span-full flex gap-gutter-sm border-b border-outline-variant">
      {PESTANAS.map(pestana => (
        <NavLink key={pestana.to} to={pestana.to} end={pestana.end}
          className={({ isActive }) => cn(
            '-mb-px inline-flex min-h-touch items-center rounded-t border-b-2 px-gutter-md text-label-lg transition-colors duration-state ease-out',
            isActive ? 'border-primary text-primary' : 'border-transparent text-on-surface-muted hover:text-on-surface',
          )}>
          {pestana.label}
        </NavLink>
      ))}
    </nav>
  );
}
