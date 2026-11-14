import { Search, X } from 'lucide-react';
import { useRef, type ComponentProps } from 'react';
import { Field, controlClass, useFieldIds, type FieldBaseProps } from './Field';

export interface SearchFieldProps
  extends Omit<ComponentProps<'input'>, 'size' | 'className' | 'value' | 'onChange' | 'type'>,
    FieldBaseProps {
  value: string;
  onChange: (valor: string) => void;
}

export function SearchField({
  label,
  hint,
  error,
  size = 'default',
  className,
  id,
  value,
  onChange,
  ...rest
}: SearchFieldProps) {
  const f = useFieldIds(id, hint, error);
  const input = useRef<HTMLInputElement>(null);

  return (
    <Field {...f} label={label} hint={hint} error={error} className={className}>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-muted"
        />
        <input
          {...rest}
          ref={input}
          id={f.id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={f.describedBy}
          className={controlClass(size, Boolean(error), 'pl-10 pr-12 [&::-webkit-search-cancel-button]:hidden')}
        />
        {value !== '' && (
          <button
            type="button"
            aria-label="Borrar búsqueda"
            onClick={() => {
              onChange('');
              input.current?.focus();
            }}
            className="absolute inset-y-0 right-0 inline-flex w-touch items-center justify-center rounded text-on-surface-muted hover:text-on-surface"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        )}
      </div>
    </Field>
  );
}
