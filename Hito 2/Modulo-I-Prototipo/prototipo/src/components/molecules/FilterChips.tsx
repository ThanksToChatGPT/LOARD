import { cn } from '@/lib/cn';
import { Chip } from '../atoms/Chip';
import type { ControlSize } from '../atoms/sizes';

export interface FilterChipOption {
  value: string;
  label: string;
  /** Conteo junto al nombre. */
  count?: number;
}

export interface FilterChipsProps {
  /** Nombre del grupo para lectores de pantalla: «Filtrar por estado». */
  label: string;
  options: FilterChipOption[];
  /** `null`: sin filtro. */
  value: string | null;
  onChange: (valor: string | null) => void;
  /** Texto del chip que quita el filtro. */
  allLabel?: string;
  size?: ControlSize;
  className?: string;
}

export function FilterChips({
  label,
  options,
  value,
  onChange,
  allLabel = 'Todos',
  size = 'default',
  className,
}: FilterChipsProps) {
  return (
    <div role="group" aria-label={label} className={cn('flex flex-wrap gap-gutter-sm', className)}>
      <Chip size={size} selected={value === null} onClick={() => onChange(null)}>
        {allLabel}
      </Chip>
      {options.map((o) => (
        <Chip
          key={o.value}
          size={size}
          selected={value === o.value}
          onClick={() => onChange(value === o.value ? null : o.value)}
        >
          {o.label}
          {o.count != null && <span className="tabular-nums">· {o.count}</span>}
        </Chip>
      ))}
    </div>
  );
}
