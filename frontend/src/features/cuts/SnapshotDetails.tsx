import type { Snapshot } from '../../lib/types';
import { number } from '../../lib/format';

export function SnapshotDetails({ data }: { data: Snapshot }) {
  return <div className="snapshot-details">
    <section className="panel"><div className="panel-header"><div><h2>Avance por actividad</h2><p className="muted">Acumulado hasta el fin del periodo, calculado al guardar esta versión.</p></div></div>
      <div className="table-container" tabIndex={0} role="region" aria-label="Avance por actividad"><table><thead><tr><th>Actividad</th><th>Ejecutado en el periodo</th><th>Acumulado / previsto</th><th>Avance de actividad</th></tr></thead>
        <tbody>{data.activities.map(row => <tr key={row.activity}><td><strong>{row.code}</strong><small>{row.name}</small></td>
          <td className="numeric">{number(row.quantity)} {row.unit}</td><td className="numeric">{number(row.accumulated_at_save)} / {number(row.planned_quantity)} {row.unit}</td>
          <td><div className="progress-value numeric">{number(row.progress_at_save)} %</div><progress value={Number(row.progress_at_save)} max={100} aria-label={`Avance de ${row.name}`} /></td></tr>)}</tbody></table></div>
    </section>
    <div className="detail-grid"><section className="panel"><div className="panel-header"><h2>Horas-hombre</h2><span className="record-count numeric">{number(data.total_hours)} HH</span></div>
      <div className="table-container" tabIndex={0} role="region" aria-label="Horas por trabajador"><table><thead><tr><th>Trabajador</th><th>Horas del periodo</th></tr></thead><tbody>{data.labor.map(row => <tr key={row.worker}><td>{row.name}</td><td className="numeric">{number(row.hours)} HH</td></tr>)}</tbody></table></div></section>
      <section className="panel"><div className="panel-header"><h2>Insumos consumidos</h2></div>
        {data.supplies.length ? <div className="table-container" tabIndex={0} role="region" aria-label="Insumos consumidos"><table><thead><tr><th>Insumo</th><th>Cantidad</th></tr></thead><tbody>{data.supplies.map(row => <tr key={row.supply}><td>{row.name}</td><td className="numeric">{number(row.quantity)} {row.unit}</td></tr>)}</tbody></table></div> : <p className="panel-body muted">Sin consumos registrados en este periodo.</p>}</section>
    </div>
    {data.notes ? <section className="panel panel-body"><h2>Observaciones del residente</h2><p className="preserve-lines">{data.notes}</p></section> : null}
  </div>;
}
