import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, ClipboardList, Clock3, GitBranch, Plus, Search } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useCuts, useProjects } from './queries';
import { EmptyState, ErrorNotice, Field, Skeleton } from '../../components/ui';
import { StatusBadge } from '../../components/StatusBadge';
import { date, number, timestamp } from '../../lib/format';

export function CutListPage() {
  const { user } = useAuth();
  const projects = useProjects();
  const [params, setParams] = useSearchParams();
  const requested = Number(params.get('project'));
  const selected = projects.data?.some(project => project.id === requested) ? requested : projects.data?.[0]?.id || 0;
  const cuts = useCuts(selected);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const rows = cuts.data ?? [];
  const filtered = rows.filter(cut => (!status || cut.status === status) &&
    `${cut.id} ${cut.front_name} ${cut.author_name}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const resident = user?.role === 'resident';
  return <>
    <div className="page-heading"><div><p className="eyebrow">CONTROL OPERATIVO</p><h1>Cortes de obra</h1>
      <p className="muted">Ejecución, recursos y trazabilidad por periodo.</p></div>
      {resident && selected ? <Link className="button primary" to={`/cuts/new?project=${selected}`}><Plus size={17} />Registrar corte</Link> : null}
    </div>
    <div className="project-context"><Field label="Proyecto activo"><select value={selected} disabled={projects.isPending}
      onChange={event => setParams({ project: event.target.value })}>
      {!projects.data?.length ? <option value="0">Sin proyectos asignados</option> : null}
      {projects.data?.map(project => <option key={project.id} value={project.id}>{project.code} · {project.name}</option>)}
    </select></Field><span className="context-note"><span className="status-dot" />Proyectos autorizados para tu cuenta</span></div>
    <ErrorNotice error={projects.error || cuts.error} />
    {projects.isPending ? <Skeleton rows={3} /> : null}
    {projects.isSuccess && !projects.data.length ? <EmptyState title="Aún no tienes proyectos asignados">
      <p className="muted">Solicita al administrador que te asigne a un proyecto activo.</p></EmptyState> : null}
    {selected ? <>
      {cuts.isPending ? <Skeleton rows={3} /> : <div className="stats-grid">
        <Stat icon={<ClipboardList size={19} />} label="Cortes registrados" value={number(rows.length)} />
        <Stat icon={<Clock3 size={19} />} label="En revisión" value={number(rows.filter(cut => cut.status === 'review').length)} />
        <Stat icon={<GitBranch size={19} />} label="Horas-hombre registradas" value={number(rows.reduce((sum, cut) => sum + Number(cut.data.total_hours || 0), 0))} />
      </div>}
      <section className="panel"><div className="panel-header"><div><h2>Registro de cortes</h2><p className="muted">Consulta los avances y las versiones de cada corte.</p></div>
        <span className="record-count">{filtered.length} registros</span></div>
        <div className="filter-bar"><label className="search-input"><Search size={17} /><input aria-label="Buscar cortes" type="search" placeholder="Buscar por corte, frente o residente" value={search} onChange={event => setSearch(event.target.value)} /></label>
          <select aria-label="Filtrar por estado" value={status} onChange={event => setStatus(event.target.value)}><option value="">Todos los estados</option><option value="review">En revisión</option><option value="approved">Visados</option><option value="observed">Devueltos con observaciones</option></select></div>
        {cuts.isPending ? <Skeleton /> : <div className="table-container" tabIndex={0} role="region" aria-label="Cortes registrados">
          <table className="cut-table"><thead><tr><th>Corte / periodo</th><th>Frente / residente</th><th>Horas-hombre</th><th>Estado</th><th>Versión</th><th><span className="sr-only">Acciones</span></th></tr></thead>
            <tbody>{filtered.map(cut => <tr key={cut.id}>
              <td><Link className="strong-link" to={`/cuts/${cut.id}`}>Corte #{String(cut.id).padStart(3, '0')}</Link><small>{date(cut.period_start)} – {date(cut.period_end)}</small></td>
              <td><strong>{cut.front_name}</strong><small>{cut.author_name}</small></td>
              <td className="numeric" data-label="Horas-hombre">{number(cut.data.total_hours)} HH</td>
              <td><StatusBadge status={cut.status} /></td>
              <td><span className="version-tag">v{cut.version}</span><small>{timestamp(cut.updated_at)}</small></td>
              <td><Link className="button secondary compact" to={`/cuts/${cut.id}`}>Ver detalle<ArrowUpRight size={14} /></Link></td>
            </tr>)}</tbody></table>
        </div>}
        {cuts.isSuccess && !filtered.length ? <EmptyState title={rows.length ? 'Sin resultados para estos filtros' : 'El primer corte empieza aquí'}>
          <p className="muted">{rows.length ? 'Prueba con otro nombre o estado.' : 'Los cortes registrados para este proyecto aparecerán en esta lista.'}</p>
        </EmptyState> : null}
      </section>
    </> : null}
  </>;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="stat-card"><div><span>{label}</span><strong className="numeric">{value}</strong></div><span className="stat-icon">{icon}</span></div>;
}
