import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, History, Pencil, Check } from 'lucide-react';
import { useCut, useHistory } from './queries';
import { SnapshotDetails } from './SnapshotDetails';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState, ErrorNotice, Skeleton } from '../../components/ui';
import { date, timestamp } from '../../lib/format';
import type { Revision } from '../../lib/types';

function changeSummary(revision: Revision, previous: Revision | undefined): string[] {
  if (!previous) return ['Registro inicial'];
  const changes: string[] = [];
  const current = revision.snapshot;
  const old = previous.snapshot;
  if (current.front !== old.front) changes.push(`Frente: ${old.front_name} → ${current.front_name}`);
  if (current.period_start !== old.period_start || current.period_end !== old.period_end) changes.push(`Periodo: ${date(old.period_start)} – ${date(old.period_end)} → ${date(current.period_start)} – ${date(current.period_end)}`);
  if (current.status !== old.status) changes.push('Cambio de estado');
  if (current.notes !== old.notes) changes.push('Observaciones modificadas');
  if (JSON.stringify(current.activities) !== JSON.stringify(old.activities)) changes.push('Actividades o cantidades modificadas');
  if (JSON.stringify(current.labor) !== JSON.stringify(old.labor)) changes.push('Trabajadores u horas modificados');
  if (JSON.stringify(current.supplies) !== JSON.stringify(old.supplies)) changes.push('Insumos o consumos modificados');
  return changes.length ? changes : ['Versión guardada sin cambios en los valores'];
}

export function CutDetailPage() {
  const id = Number(useParams().id);
  const [params] = useSearchParams();
  const cutQuery = useCut(id);
  const historyQuery = useHistory(id);
  const [tab, setTab] = useState('detail');
  const [version, setVersion] = useState<number | null>(null);
  const cut = cutQuery.data;
  const revisions = historyQuery.data ?? [];
  const selectedRevision = revisions.find(revision => revision.version === version);
  if (!Number.isSafeInteger(id) || id < 1) return <EmptyState title="Identificador de corte inválido"><Link to="/cuts">Volver a cortes</Link></EmptyState>;
  if (cutQuery.isPending) return <Skeleton />;
  if (cutQuery.isError) return <><Link className="back-link" to="/cuts"><ArrowLeft size={16} />Cortes de obra</Link><ErrorNotice error={cutQuery.error} /></>;
  if (!cut) return <EmptyState title="Corte no disponible" />;
  return <>
    <Link className="back-link" to={`/cuts?project=${cut.project}`}><ArrowLeft size={16} />Cortes de obra</Link>
    {params.has('saved') ? <div className="notice success" role="status"><Check size={17} />Corte guardado. La versión {cut.version} quedó registrada en el historial.</div> : null}
    <div className="page-heading"><div><p className="eyebrow">{cut.project_code} · {cut.front_name}</p><h1>Corte #{String(cut.id).padStart(3, '0')} <span className="version-tag">v{cut.version}</span></h1><p className="muted">{date(cut.period_start)} – {date(cut.period_end)} · {cut.author_name}</p></div>
      {cut.can_edit ? <Link className="button secondary" to={`/cuts/${id}/edit`}><Pencil size={16} />Editar corte</Link> : null}</div>
    <div className="detail-meta"><StatusBadge status={cut.status} /><span>Última actualización {timestamp(cut.updated_at)}</span></div>
    <div className="tabs" aria-label="Vistas del corte"><button type="button" aria-pressed={tab === 'detail'} className={tab === 'detail' ? 'active' : ''} onClick={() => setTab('detail')}>Detalle del corte</button>
      <button type="button" aria-pressed={tab === 'history'} className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}><History size={16} />Historial de versiones</button></div>
    {tab === 'detail' ? <SnapshotDetails data={cut.data} /> : <>
      <ErrorNotice error={historyQuery.error} />
      <div className="history-layout"><section className="panel"><div className="panel-header"><h2>Trazabilidad del corte</h2></div>
        {historyQuery.isPending ? <Skeleton rows={3} /> : <ol className="revision-list">{revisions.map((revision, index) => <li key={revision.version}>
          <button type="button" className={version === revision.version ? 'selected' : ''} onClick={() => setVersion(revision.version)}>
            <span className="revision-heading"><strong>Versión {revision.version}</strong><span className="version-tag">{revision.version === cut.version ? 'Actual' : 'Anterior'}</span></span>
            <span>{revision.editor_name} · {revision.editor_role}</span><small>{timestamp(revision.created_at)}</small><p>{revision.reason}</p>
            <ul>{changeSummary(revision, revisions[index + 1]).map(change => <li key={change}>{change}</li>)}</ul>
            <span className="strong-link">Consultar valores de esta versión →</span>
          </button></li>)}</ol>}
      </section><div>{selectedRevision ? <><div className="notice"><History size={18} />Consultando la versión {selectedRevision.version}, guardada el {timestamp(selectedRevision.created_at)}.<StatusBadge status={selectedRevision.snapshot.status} /></div><SnapshotDetails data={selectedRevision.snapshot} /></> : <EmptyState title="Selecciona una versión"><p className="muted">Consulta los valores conservados en cada cambio.</p></EmptyState>}</div></div>
    </>}
  </>;
}
