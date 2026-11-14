import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useMemo, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import { Field, controlClass, useFieldIds, type FieldBaseProps } from './Field';

export interface ComboboxOption {
  value: string;
  label: string;
  /** Segunda línea: cargo, cédula… */
  description?: string;
}

export interface ComboboxProps extends FieldBaseProps {
  options: ComboboxOption[];
  value: string | null;
  onChange: (valor: string | null) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
}

/** Selector con búsqueda para listas largas (ej. trabajadores). */
export function Combobox({
  label,
  hint,
  error,
  size = 'default',
  className,
  id,
  required,
  options,
  value,
  onChange,
  placeholder,
}: ComboboxProps) {
  const f = useFieldIds(id, hint, error);
  const listaId = useId();
  const seleccionada = options.find((o) => o.value === value) ?? null;

  const [texto, setTexto] = useState(seleccionada?.label ?? '');
  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState(0);

  // Si el valor cambia desde fuera (ej. precargado), el texto lo refleja.
  useEffect(() => {
    setTexto(seleccionada?.label ?? '');
  }, [seleccionada?.label]);

  const visibles = useMemo(() => {
    const q = texto.trim().toLowerCase();
    if (!q || texto === seleccionada?.label) return options;
    return options.filter((o) => `${o.label} ${o.description ?? ''}`.toLowerCase().includes(q));
  }, [options, texto, seleccionada?.label]);

  const elegir = (opcion: ComboboxOption) => {
    onChange(opcion.value);
    setTexto(opcion.label);
    setAbierto(false);
  };

  const alTeclear = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!abierto) {
        setAbierto(true);
        return;
      }
      const paso = e.key === 'ArrowDown' ? 1 : -1;
      setActiva((i) => (visibles.length ? (i + paso + visibles.length) % visibles.length : 0));
    } else if (e.key === 'Enter' && abierto && visibles[activa]) {
      e.preventDefault();
      elegir(visibles[activa]);
    } else if (e.key === 'Escape' && abierto) {
      // Cierra solo la lista; no el diálogo que la contiene.
      e.stopPropagation();
      setAbierto(false);
      setTexto(seleccionada?.label ?? '');
    }
  };

  return (
    <Field {...f} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        <input
          id={f.id}
          role="combobox"
          aria-expanded={abierto}
          aria-controls={listaId}
          aria-autocomplete="list"
          aria-activedescendant={abierto && visibles[activa] ? `${listaId}-${activa}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={f.describedBy}
          aria-required={required || undefined}
          autoComplete="off"
          placeholder={placeholder}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setAbierto(true);
            setActiva(0);
            if (value !== null) onChange(null);
          }}
          onFocus={() => setAbierto(true)}
          onBlur={() => {
            setAbierto(false);
            setTexto(seleccionada?.label ?? '');
          }}
          onKeyDown={alTeclear}
          className={controlClass(size, Boolean(error), 'pr-10')}
        />
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-muted"
        />
        <ul
          id={listaId}
          role="listbox"
          aria-label={typeof label === 'string' ? label : undefined}
          hidden={!abierto}
          className="sf-container absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-md border border-outline py-1 shadow-2"
        >
          {visibles.map((o, i) => (
            <li
              key={o.value}
              id={`${listaId}-${i}`}
              role="option"
              aria-selected={o.value === value}
              // mousedown en lugar de click: evita que el blur cierre la lista antes de elegir.
              onMouseDown={(e) => {
                e.preventDefault();
                elegir(o);
              }}
              onMouseEnter={() => setActiva(i)}
              className={cn(
                'flex min-h-touch cursor-pointer flex-col justify-center px-3 py-1',
                i === activa && 'bg-surface-container-low',
                o.value === value && 'font-semibold',
              )}
            >
              <span className="text-body-md">{o.label}</span>
              {o.description && <span className="text-body-sm text-on-surface-muted">{o.description}</span>}
            </li>
          ))}
          {visibles.length === 0 && (
            <li role="presentation" className="px-3 py-3 text-body-md text-on-surface-muted">
              Sin resultados para «{texto.trim()}». Revisa el texto o borra la búsqueda.
            </li>
          )}
        </ul>
      </div>
    </Field>
  );
}
