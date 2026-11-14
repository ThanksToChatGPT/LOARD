import { Plus, Trash2 } from 'lucide-react';
import { Button, Field } from '../../components/ui';

interface Entry { item: number; value: string }
interface Option { id: number; label: string; unit: string }
interface Props {
  title: string;
  description: string;
  itemLabel: string;
  valueLabel: string;
  options: Option[];
  rows: Entry[];
  step: string;
  onChange: (rows: Entry[]) => void;
}

export function EntrySection({ title, description, itemLabel, valueLabel, options, rows, step, onChange }: Props) {
  function update(index: number, patch: Partial<Entry>) {
    onChange(rows.map((row, position) => position === index ? { ...row, ...patch } : row));
  }
  return <section className="panel"><div className="panel-header"><div><h2>{title}</h2><p className="muted">{description}</p></div>
    <Button type="button" variant="secondary" disabled={rows.length >= options.length}
      onClick={() => onChange([...rows, { item: 0, value: '' }])}><Plus size={16} />Agregar</Button></div>
    <div className="entry-list">{!rows.length ? <p className="muted">Sin registros. Usa «Agregar» para incluir uno.</p> : null}
      {rows.map((row, index) => <div className="entry-row" key={index}>
        <Field label={`${itemLabel} ${index + 1}`}><select value={row.item} required onChange={event => update(index, { item: Number(event.target.value) })}>
          <option value="0" disabled>Seleccionar {itemLabel.toLowerCase()}</option>
          {options.map(option => <option key={option.id} value={option.id} disabled={rows.some((other, position) => position !== index && other.item === option.id)}>{option.label}</option>)}
        </select></Field>
        <Field label={valueLabel}><div className="input-with-unit"><input type="number" required inputMode="decimal" min={step} max="99999999999.999" step={step} value={row.value} onChange={event => update(index, { value: event.target.value })} /><span>{options.find(option => option.id === row.item)?.unit ?? '—'}</span></div></Field>
        <button type="button" className="icon-button delete-row" aria-label={`Quitar ${itemLabel.toLowerCase()} ${index + 1}`} onClick={() => onChange(rows.filter((_, position) => position !== index))}><Trash2 size={18} /></button>
      </div>)}
      {!options.length ? <div className="notice">El administrador debe registrar {title.toLowerCase()} en este proyecto.</div> : null}
    </div></section>;
}
