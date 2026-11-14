import { ChevronDown } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Field, controlClass, useFieldIds, type FieldBaseProps } from './Field';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<ComponentProps<'select'>, 'size' | 'className'>, FieldBaseProps {
  options: SelectOption[];
  /** Primera opción vacía: «Selecciona un tipo de curso». */
  placeholder?: string;
}

export function Select({
  label,
  hint,
  error,
  size = 'default',
  className,
  id,
  required,
  options,
  placeholder,
  ...rest
}: SelectProps) {
  const f = useFieldIds(id, hint, error);
  return (
    <Field {...f} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        <select
          {...rest}
          id={f.id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={f.describedBy}
          className={controlClass(size, Boolean(error), 'appearance-none pr-10')}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-muted"
        />
      </div>
    </Field>
  );
}
