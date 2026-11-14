import { CircleAlert } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ALTO_CONTROL, type ControlSize } from '../atoms/sizes';

/** Props comunes a todos los campos de formulario. */
export interface FieldBaseProps {
  /** Siempre visible: el placeholder nunca hace de etiqueta. */
  label: ReactNode;
  /** Ayuda permanente bajo el campo (formato esperado, límites). */
  hint?: ReactNode;
  /** Qué pasó y cómo corregirlo, en lenguaje claro. */
  error?: ReactNode;
  size?: ControlSize;
  className?: string;
}

/** Identificadores para enlazar etiqueta, ayuda y error con el control. */
export function useFieldIds(id: string | undefined, hint: ReactNode, error: ReactNode) {
  const generado = useId();
  const base = id ?? generado;
  const hintId = hint ? `${base}-ayuda` : undefined;
  const errorId = error ? `${base}-error` : undefined;
  return {
    id: base,
    hintId,
    errorId,
    describedBy: cn(errorId, hintId) || undefined,
  };
}

/** Clases de un control de texto (input, select, textarea). */
export function controlClass(size: ControlSize, conError: boolean, extra?: string) {
  return cn(
    'w-full rounded border bg-surface-container px-3 text-body-lg text-on-surface',
    'placeholder:text-on-surface-muted transition-colors duration-state ease-out',
    ALTO_CONTROL[size],
    conError ? 'border-error' : 'border-outline',
    extra,
  );
}

interface FieldProps {
  id: string;
  hintId?: string;
  errorId?: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/** Envoltura de un campo: etiqueta arriba, control, ayuda y error debajo. */
export function Field({ id, hintId, errorId, label, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-gutter-xs', className)}>
      <label htmlFor={id} className="text-label-lg text-on-surface">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && (
        <p id={hintId} className="text-body-sm text-on-surface-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-start gap-gutter-xs text-body-sm text-error">
          <CircleAlert aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
