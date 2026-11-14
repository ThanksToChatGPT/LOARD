import { cn } from '@/lib/cn';

/** Bloque de carga. Darle el tamaño del contenido real para que no salte el diseño (§7.1). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('block h-4 animate-pulse rounded-sm bg-surface-container-high', className)}
    />
  );
}
