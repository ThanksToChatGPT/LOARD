import { Plus, Trash2 } from 'lucide-react';
import { Button, Select, TextField } from '@/components';
import { UNIDADES_DEMO, describirRecurso, esActividadPropia, nuevaActividadPropia, type RecursoDemo } from './modeloDemo';

interface CatalogoRecurso { id: string; nombre: string; unidad: string }
interface Props {
  titulo: string; etiqueta: string; valorLabel: string; opciones: CatalogoRecurso[];
  filas: RecursoDemo[]; onChange: (filas: RecursoDemo[]) => void;
  /** Permite escribir un recurso que no está en la lista, con su nombre y su unidad. */
  permitePropia?: boolean;
  /** La cantidad sube y baja de uno en uno y solo acepta enteros. */
  entero?: boolean;
}

const PROPIA = '__propia';

export function RecursosCorte({ titulo, etiqueta, valorLabel, opciones, filas, onChange, permitePropia = false, entero = false }: Props) {
  function actualizar(index: number, patch: Partial<RecursoDemo>) {
    onChange(filas.map((fila, position) => position === index ? { ...fila, ...patch } : fila));
  }
  function elegir(index: number, valor: string) {
    const cantidad = filas[index].cantidad;
    onChange(filas.map((fila, position) => position !== index ? fila : valor === PROPIA ? { ...nuevaActividadPropia(), cantidad } : { id: valor, cantidad }));
  }
  function agregar() {
    const libre = opciones.find(opcion => !filas.some(fila => fila.id === opcion.id));
    onChange([...filas, libre ? { id: libre.id, cantidad: '' } : permitePropia ? nuevaActividadPropia() : { id: '', cantidad: '' }]);
  }
  const propia = etiqueta.toLowerCase();
  return <section className="card flex flex-col gap-gutter-md p-gutter-md">
    <div className="flex items-center justify-between gap-gutter-sm"><h2 className="text-headline-sm">{titulo}</h2>
      <Button variant="secondary" blocked={!permitePropia && filas.length >= opciones.length} blockedReason="Ya agregaste todas las opciones del ejemplo."
        onClick={agregar} icon={<Plus className="h-4 w-4" />}>Agregar</Button></div>
    {permitePropia && <p className="text-body-md text-on-surface-muted">Elige una {propia} de la lista o escoge «Otra {propia} (escribir)» para registrar una propia.</p>}
    {!filas.length && <p className="text-body-md text-on-surface-muted">Sin registros en esta sección.</p>}
    {filas.map((fila, index) => {
      const esPropia = permitePropia && esActividadPropia(fila);
      const unidad = describirRecurso(fila, opciones).unidad;
      const sufijo = unidad ? ` (${unidad})` : '';
      return <div className="flex flex-col gap-gutter-sm" key={index}>
        {/* Sin textos de ayuda bajo los campos: los tres controles comparten base y alto (48 px). */}
        <div className="demo-resource-row">
          <Select label={`${etiqueta} ${index + 1}`} value={esPropia ? PROPIA : fila.id} required
            options={[
              ...opciones.filter(opcion => opcion.id === fila.id || !filas.some(otra => otra.id === opcion.id)).map(opcion => ({ value: opcion.id, label: `${opcion.nombre} (${opcion.unidad})` })),
              ...(permitePropia ? [{ value: PROPIA, label: `Otra ${propia} (escribir)` }] : []),
            ]}
            onChange={event => elegir(index, event.target.value)} />
          <TextField aria-label={`${valorLabel} ${index + 1}${unidad ? `, en ${unidad}` : ''}`}
            label={<><span className="hidden tablet:inline">{valorLabel} {index + 1}{sufijo}</span><span className="tablet:hidden">Cantidad{sufijo}</span></>}
            type="number" required value={fila.cantidad} inputClassName="tabular-nums"
            {...(entero ? { inputMode: 'numeric' as const, min: '1', step: '1' } : { inputMode: 'decimal' as const, min: '0.001', step: '0.001' })}
            onKeyDown={event => { if (entero && ['.', ',', 'e', 'E', '+', '-'].includes(event.key)) event.preventDefault(); }}
            onChange={event => {
              const valor = event.target.value;
              actualizar(index, { cantidad: entero && valor !== '' && !/^\d+$/.test(valor) ? String(Math.max(0, Math.trunc(Number(valor) || 0)) || '') : valor });
            }} />
          <Button variant="ghost" aria-label={`Quitar ${propia} ${index + 1}`} onClick={() => onChange(filas.filter((_, position) => index !== position))}><Trash2 className="h-4 w-4" /></Button>
        </div>
        {esPropia && <div className="grid grid-cols-[minmax(0,1fr)_104px] items-start gap-gutter-sm tablet:grid-cols-[minmax(0,1fr)_160px] tablet:gap-gutter-md">
          <TextField label={`Nombre de la ${propia} ${index + 1}`} required maxLength={80} placeholder="Ej.: Pintura de tubería"
            value={fila.nombre ?? ''} onChange={event => actualizar(index, { nombre: event.target.value })} />
          <Select label="Unidad" required value={fila.unidad ?? UNIDADES_DEMO[0]} options={UNIDADES_DEMO.map(value => ({ value, label: value }))}
            onChange={event => actualizar(index, { unidad: event.target.value })} />
        </div>}
      </div>;
    })}
  </section>;
}
