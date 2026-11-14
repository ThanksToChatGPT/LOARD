import type { ComponentProps } from 'react';
import { Field, controlClass, useFieldIds, type FieldBaseProps } from './Field';

export interface TextFieldProps extends Omit<ComponentProps<'input'>, 'size' | 'className'>, FieldBaseProps {
  inputClassName?: string;
}

export function TextField({
  label,
  hint,
  error,
  size = 'default',
  className,
  inputClassName,
  id,
  required,
  ...rest
}: TextFieldProps) {
  const f = useFieldIds(id, hint, error);
  return (
    <Field {...f} label={label} hint={hint} error={error} required={required} className={className}>
      <input
        {...rest}
        id={f.id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={f.describedBy}
        className={controlClass(size, Boolean(error), inputClassName)}
      />
    </Field>
  );
}

/** Fecha con números tabulares. El valor es 'AAAA-MM-DD'. */
export function DateField(props: Omit<TextFieldProps, 'type'>) {
  return <TextField {...props} type="date" inputClassName="tabular-nums" />;
}
