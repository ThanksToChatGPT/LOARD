import type { FormEventHandler, ReactNode } from 'react';

export interface FormLayoutProps {
  /** `PageHeader` del formulario. */
  header?: ReactNode;
  /** Estado del borrador, cerca del encabezado: «Borrador guardado localmente a las 14:32». */
  status?: ReactNode;
  children: ReactNode;
  /** Acciones en un pie fijo: principal a la derecha, «Cancelar» a su izquierda. */
  footer?: ReactNode;
  onSubmit?: FormEventHandler<HTMLFormElement>;
}

/**
 * Formulario sobre la retícula (§11.1): 4 de 4 columnas en móvil, 8 de 8 en tableta
 * y 8 de 12 centradas en escritorio. El pie se mantiene visible sin tapar el último campo.
 */
export function FormLayout({ header, status, children, footer, onSubmit }: FormLayoutProps) {
  return (
    <div className="grid-page">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.(e);
        }}
        className="col-span-4 flex flex-col gap-gutter-lg tablet:col-span-8 desktop:col-start-3"
      >
        {header}
        {status && (
          <p role="status" className="text-body-sm tabular-nums text-on-surface-muted">
            {status}
          </p>
        )}
        {children}
        {footer && (
          <div className="sf-page sticky bottom-0 z-10 flex flex-wrap justify-end gap-gutter-sm border-t border-outline-variant py-gutter-md">
            {footer}
          </div>
        )}
      </form>
    </div>
  );
}
