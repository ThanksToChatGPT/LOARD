import { Plus, Trash2 } from 'lucide-react';
import { Button, Select, TextField } from '@/components';
import type { RecursoDemo } from './modeloDemo';

interface CatalogoRecurso { id: string; nombre: string; unidad: string }
interface Props {
  titulo: string; etiqueta: string; valorLabel: string; opciones: CatalogoRecurso[];
  filas: RecursoDemo[]; onChange: (filas: RecursoDemo[]) => void;
}

export function RecursosCorte({ titulo, etiqueta, valorLabel, opciones, filas, onChange }: Props) {
  function actualizar(index: number, patch: Partial<RecursoDemo>) {
    onChange(filas.map((fila, position) => position === index ? { ...fila, ...patch } : fila));
  }
  return <section className="card flex flex-col gap-gutter-md p-gutter-md">
    <div className="flex items-center justify-between gap-gutter-sm"><h2 className="text-headline-sm">{titulo}</h2>
      <Button variant="secondary" blocked={filas.length >= opciones.length} blockedReason="Ya agregaste todas las opciones del ejemplo."
        onClick={() => onChange([...filas, { id: opciones.find(opcion => !filas.some(fila => fila.id === opcion.id))?.id ?? '', cantidad: '' }])}
        icon={<Plus className="h-4 w-4" />}>Agregar</Button></div>
    {!filas.length && <p className="text-body-md text-on-surface-muted">Sin registros en esta sección.</p>}
    {filas.map((fila, index) => <div className="demo-resource-row" key={index}>
      <Select label={`${etiqueta} ${index + 1}`} value={fila.id} required
        options={opciones.filter(opcion => opcion.id === fila.id || !filas.some(otra => otra.id === opcion.id)).map(opcion => ({ value: opcion.id, label: `${opcion.nombre} (${opcion.unidad})` }))}
        onChange={event => actualizar(index, { id: event.target.value })} />
      <TextField label={`${valorLabel} ${index + 1}`} type="number" inputMode="decimal" min="0.001" step="0.001" required value={fila.cantidad}
        hint={opciones.find(opcion => opcion.id === fila.id)?.unidad} onChange={event => actualizar(index, { cantidad: event.target.value })} />
      <Button variant="ghost" aria-label={`Quitar ${etiqueta.toLowerCase()} ${index + 1}`} onClick={() => onChange(filas.filter((_, position) => index !== position))}><Trash2 className="h-4 w-4" /></Button>
    </div>)}
  </section>;
}
