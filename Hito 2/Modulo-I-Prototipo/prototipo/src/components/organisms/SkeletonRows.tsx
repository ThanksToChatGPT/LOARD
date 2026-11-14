import { Skeleton } from '../atoms/Skeleton';

export interface SkeletonRowsProps {
  /** Entre 5 y 8 (§7.1). */
  rows?: number;
  /** Igual al número de columnas de la tabla real. */
  columns: number;
}

const ANCHOS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6'];

/** Filas de carga para el `<tbody>` de una tabla. La cabecera real se mantiene. */
export function SkeletonRows({ rows = 6, columns }: SkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, fila) => (
        <tr key={fila} aria-hidden="true" className="border-b border-outline-variant last:border-b-0">
          {Array.from({ length: columns }, (_, col) => (
            <td key={col} className="px-gutter-md py-4">
              <Skeleton className={ANCHOS[(fila + col) % ANCHOS.length]} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
