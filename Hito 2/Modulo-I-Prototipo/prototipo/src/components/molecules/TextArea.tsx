import type { ComponentProps } from 'react';
import { Field, controlClass, useFieldIds, type FieldBaseProps } from './Field';

export interface TextAreaProps
  extends Omit<ComponentProps<'textarea'>, 'className' | 'value'>,
    Omit<FieldBaseProps, 'size'> {
  value: string;
  /** Muestra bajo el campo cuántos caracteres faltan para el mínimo (ej. 10 en una observación). */
  minCharacters?: number;
}

export function TextArea({
  label,
  hint,
  error,
  className,
  id,
  required,
  value,
  minCharacters,
  rows = 4,
  ...rest
}: TextAreaProps) {
  const largo = value.trim().length;
  const ayuda =
    minCharacters != null ? (
      <span className="tabular-nums">
        {largo >= minCharacters
          ? `Mínimo ${minCharacters} caracteres: cumplido.`
          : `Mínimo ${minCharacters} caracteres. Llevas ${largo}.`}
        {hint ? <> {hint}</> : null}
      </span>
    ) : (
      hint
    );
  const f = useFieldIds(id, ayuda, error);

  return (
    <Field {...f} label={label} hint={ayuda} error={error} required={required} className={className}>
      <textarea
        {...rest}
        id={f.id}
        rows={rows}
        value={value}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={f.describedBy}
        className={controlClass('default', Boolean(error), 'resize-y py-2')}
      />
    </Field>
  );
}
