import { CircleAlert } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

export interface RadioCardGroupProps {
  /** Pregunta o nombre del grupo, siempre visible. */
  legend: ReactNode;
  options: RadioCardOption[];
  value: string | null;
  onChange: (valor: string) => void;
  name?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
}

/** Opciones grandes tipo tarjeta para decisiones de pocas alternativas (ej. concepto médico). */
export function RadioCardGroup({
  legend,
  options,
  value,
  onChange,
  name,
  hint,
  error,
  required,
  className,
}: RadioCardGroupProps) {
  const generado = useId();
  const grupo = name ?? generado;
  const errorId = `${generado}-error`;

  return (
    <fieldset className={cn('flex flex-col gap-gutter-sm', className)} aria-describedby={error ? errorId : undefined}>
      <legend className="mb-gutter-xs text-label-lg text-on-surface">
        {legend}
        {required && <span aria-hidden="true"> *</span>}
      </legend>
      <div className="grid grid-cols-1 gap-gutter-sm tablet:grid-cols-2">
        {options.map((o) => {
          const marcada = o.value === value;
          return (
            <label
              key={o.value}
              className={cn(
                'flex min-h-touch-field cursor-pointer items-center gap-gutter-sm rounded-md border p-gutter-md',
                'transition duration-state ease-out',
                marcada
                  ? 'sf-low border-primary shadow-[inset_0_0_0_1px_var(--primary)]'
                  : 'sf-container border-outline hover:bg-surface-container-low',
              )}
            >
              <input
                type="radio"
                name={grupo}
                value={o.value}
                checked={marcada}
                required={required}
                onChange={() => onChange(o.value)}
                className="h-5 w-5 shrink-0 accent-primary"
              />
              {o.icon}
              <span className="flex flex-col">
                <span className="text-title-md">{o.label}</span>
                {o.description && <span className="text-body-sm text-on-surface-muted">{o.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {hint && <p className="text-body-sm text-on-surface-muted">{hint}</p>}
      {error && (
        <p id={errorId} className="flex items-start gap-gutter-xs text-body-sm text-error">
          <CircleAlert aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </fieldset>
  );
}
