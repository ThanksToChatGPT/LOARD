import type { ReactNode } from 'react';
import { useEsTableta } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';
import { ProgressBar } from '../atoms/ProgressBar';
import { Skeleton } from '../atoms/Skeleton';
import { SkeletonRows } from './SkeletonRows';

export interface TableColumn<T> {
  key: string;
  /** Texto de la cabecera. En la tarjeta de móvil hace de etiqueta del dato. */
  header: string;
  cell: (fila: T) => ReactNode;
  align?: 'start' | 'end';
  /** Cifras, fechas y códigos: números tabulares. */
  numeric?: boolean;
  /** En móvil, este dato es el título de la tarjeta. */
  primary?: boolean;
  /** Columna de acciones: en móvil va al pie de la tarjeta, sin etiqueta. */
  action?: boolean;
}

export interface ResponsiveTableProps<T> {
  /** Nombre de la tabla para lectores de pantalla. */
  caption: string;
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (fila: T) => string;
  /** Primera carga: cabecera real con filas esqueleto. */
  loading?: boolean;
  /** Recarga con datos ya en pantalla: barra de 2 px, sin borrar el contenido. */
  refetching?: boolean;
  skeletonRows?: number;
  /** Qué mostrar cuando no hay filas: qué significa y qué hacer. */
  empty?: ReactNode;
  /** Resalta la fila completa: bloqueos (`error`) o alertas (`warning`). */
  rowTone?: (fila: T) => 'error' | 'warning' | undefined;
  /**
   * Conserva la tabla en móvil con desplazamiento horizontal dentro de su contenedor.
   * Solo cuando comparar columnas es parte de la tarea (§11.2).
   */
  keepTableOnMobile?: boolean;
  className?: string;
}

const FONDO_FILA = { error: 'bg-error-subtle', warning: 'bg-warning-subtle' };

/** Tabla desde 600 px; tarjetas apiladas en móvil. */
export function ResponsiveTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  loading = false,
  refetching = false,
  skeletonRows = 6,
  empty = 'No hay registros para mostrar.',
  rowTone,
  keepTableOnMobile = false,
  className,
}: ResponsiveTableProps<T>) {
  const esTableta = useEsTableta();
  const comoTabla = esTableta || keepTableOnMobile;
  const barra = refetching && (
    <ProgressBar label={`Actualizando ${caption}`} size="thin" className="absolute inset-x-0 top-0 z-10" />
  );

  if (!comoTabla) {
    const titulo = columns.find((c) => c.primary) ?? columns[0];
    const acciones = columns.filter((c) => c.action);
    const datos = columns.filter((c) => c !== titulo && !c.action);

    return (
      <div className={cn('relative', className)} aria-busy={loading || refetching}>
        {barra}
        <ul aria-label={caption} className="flex flex-col gap-gutter-sm">
          {loading &&
            Array.from({ length: 3 }, (_, i) => (
              <li key={i} aria-hidden="true" className="card flex flex-col gap-gutter-sm p-gutter-md">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="w-1/2" />
                <Skeleton className="w-3/4" />
              </li>
            ))}
          {!loading && rows.length === 0 && (
            <li className="card p-gutter-md text-body-md text-on-surface-muted">{empty}</li>
          )}
          {!loading &&
            rows.map((fila) => {
              const tono = rowTone?.(fila);
              return (
                <li
                  key={rowKey(fila)}
                  className={cn(
                    'flex flex-col gap-gutter-sm rounded-md border border-outline-variant p-gutter-md shadow-1',
                    tono ? FONDO_FILA[tono] : 'sf-container',
                  )}
                >
                  <div className="text-title-lg">{titulo.cell(fila)}</div>
                  <dl className="flex flex-col gap-gutter-xs">
                    {datos.map((c) => (
                      <div key={c.key} className="flex flex-wrap items-center justify-between gap-x-gutter-md gap-y-gutter-xs">
                        <dt className="text-label-md text-on-surface-muted">{c.header}</dt>
                        <dd className={cn('text-body-md', c.numeric && 'tabular-nums')}>{c.cell(fila)}</dd>
                      </div>
                    ))}
                  </dl>
                  {acciones.length > 0 && (
                    <div className="flex flex-wrap gap-gutter-sm">
                      {acciones.map((c) => (
                        <div key={c.key}>{c.cell(fila)}</div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      </div>
    );
  }

  const tabla = (
    <table className="w-full border-collapse text-left text-body-md" aria-busy={loading || refetching}>
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="border-b border-outline-variant bg-surface-container-low">
          {columns.map((c) => (
            <th
              key={c.key}
              scope="col"
              className={cn(
                'whitespace-nowrap px-gutter-md py-3 text-label-md text-on-surface-muted',
                c.align === 'end' && 'text-right',
              )}
            >
              {c.action ? <span className="sr-only">{c.header}</span> : c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading && <SkeletonRows rows={skeletonRows} columns={columns.length} />}
        {!loading && rows.length === 0 && (
          <tr>
            <td colSpan={columns.length} className="px-gutter-md py-gutter-lg text-on-surface-muted">
              {empty}
            </td>
          </tr>
        )}
        {!loading &&
          rows.map((fila) => {
            const tono = rowTone?.(fila);
            return (
              <tr
                key={rowKey(fila)}
                className={cn('border-b border-outline-variant last:border-b-0', tono && FONDO_FILA[tono])}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      'px-gutter-md py-2 align-middle',
                      c.numeric && 'tabular-nums',
                      c.align === 'end' && 'text-right',
                    )}
                  >
                    {c.cell(fila)}
                  </td>
                ))}
              </tr>
            );
          })}
      </tbody>
    </table>
  );

  return (
    <div className={cn('card relative overflow-hidden', className)}>
      {barra}
      {/* El contenedor con desplazamiento recibe foco para recorrerlo con las flechas (§11.4). */}
      <div role="region" aria-label={caption} tabIndex={0} className="overflow-x-auto">
        {tabla}
      </div>
    </div>
  );
}
