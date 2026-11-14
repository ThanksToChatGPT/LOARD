import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useBlocker, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { Catalogs, Cut, CutForm } from '../../lib/types';
import { timestamp } from '../../lib/format';
import { Button, EmptyState, ErrorNotice, Field, Skeleton } from '../../components/ui';
import { useAuth } from '../auth/AuthProvider';
import { useCatalogs, useCut, useProjects } from './queries';
import { EntrySection } from './EntrySection';
import { useCutDraft } from './useCutDraft';

function initialForm(project: number, cut?: Cut): CutForm {
  if (cut) return {
    project, front: cut.front, period_start: cut.period_start, period_end: cut.period_end, notes: cut.notes,
    activities: cut.data.activities.map(({ activity, quantity }) => ({ activity, quantity })),
    labor: cut.data.labor.map(({ worker, hours }) => ({ worker, hours })),
    supplies: cut.data.supplies.map(({ supply, quantity }) => ({ supply, quantity })),
    version: cut.version, reason: '', request_id: cut.request_id,
  };
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  return { project, front: 0, period_start: today, period_end: today, notes: '',
    activities: [{ activity: 0, quantity: '' }], labor: [{ worker: 0, hours: '' }], supplies: [],
    request_id: crypto.randomUUID() };
}

export function CutFormPage() {
  const { user } = useAuth();
  const routeId = useParams().id;
  const id = Number(routeId) || 0;
  const [params] = useSearchParams();
  const projects = useProjects();
  const cutQuery = useCut(id);
  const requestedProject = Number(params.get('project'));
  const project = cutQuery.data?.project || (Number.isSafeInteger(requestedProject) && requestedProject > 0 ? requestedProject : 0);
  const catalogs = useCatalogs(project);
  if (user?.role !== 'resident') return <EmptyState title="Tu rol tiene acceso de consulta a los cortes" />;
  if (routeId && (!Number.isSafeInteger(id) || id < 1)) return <EmptyState title="Identificador de corte inválido"><Link to="/cuts">Volver a cortes</Link></EmptyState>;
  if (projects.isPending || catalogs.isPending || (id > 0 && cutQuery.isPending)) {
    if (!project && projects.isSuccess && !id) return <EmptyState title="Selecciona un proyecto desde la lista de cortes"><Link to="/cuts">Volver a cortes</Link></EmptyState>;
    return <Skeleton />;
  }
  const failure = projects.error || catalogs.error || cutQuery.error;
  if (failure) return <ErrorNotice error={failure} />;
  if (id && !cutQuery.data?.can_edit) return <EmptyState title="Solo el residente autor puede editar este corte" />;
  const activeProject = projects.data?.find(item => item.id === project);
  if (!activeProject || !catalogs.data) return <EmptyState title="Proyecto no disponible"><Link to="/cuts">Volver a cortes</Link></EmptyState>;
  return <CutEditor key={`${project}-${id}`} project={project} projectName={`${activeProject.code} · ${activeProject.name}`} catalogs={catalogs.data} cut={cutQuery.data} />;
}

function CutEditor({ project, projectName, catalogs, cut }: { project: number; projectName: string; catalogs: Catalogs; cut?: Cut }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => initialForm(project, cut));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const leaving = useRef(false);
  const draft = useCutDraft(`loard_draft_corte_proj_${project}_user_${user!.id}_${cut?.id ?? 'new'}`, form, dirty);
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    dirty && !leaving.current && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('Hay cambios sin enviar. ¿Quieres salir del formulario?')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);
  useEffect(() => {
    function warn(event: BeforeUnloadEvent) { if (dirty) event.preventDefault(); }
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function change(patch: Partial<CutForm>) { setForm(previous => ({ ...previous, ...patch })); setDirty(true); }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const saved = await api<Cut>(cut ? `/cuts/${cut.id}/` : '/cuts/', {
        method: cut ? 'PUT' : 'POST', body: JSON.stringify(form),
      });
      leaving.current = true;
      setDirty(false);
      draft.discard();
      queryClient.setQueryData(['cut', saved.id], saved);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cuts'] }),
        queryClient.invalidateQueries({ queryKey: ['cut-history', saved.id] }),
      ]);
      navigate(`/cuts/${saved.id}?saved=1`, { replace: true });
    } catch (failure) {
      setError(failure);
      if (cut && failure instanceof ApiError && failure.status === 409) {
        void queryClient.invalidateQueries({ queryKey: ['cut', cut.id] });
        void queryClient.invalidateQueries({ queryKey: ['cut-history', cut.id] });
      }
    }
    finally { setBusy(false); }
  }
  const conflict = error instanceof ApiError && error.status === 409;
  const draftMatches = draft.pending?.form.project === project && draft.pending?.form.version === cut?.version;
  const missingCatalogs = !catalogs.fronts.length || !catalogs.activities.length || !catalogs.workers.length;
  return <>
    <Link className="back-link" to={cut ? `/cuts/${cut.id}` : `/cuts?project=${project}`}><ArrowLeft size={16} />{cut ? 'Volver al detalle' : 'Cortes de obra'}</Link>
    <div className="page-heading"><div><p className="eyebrow">{projectName}</p><h1>{cut ? `Editar corte #${String(cut.id).padStart(3, '0')}` : 'Registrar corte de obra'}</h1>
      <p className="muted">Registra las cantidades ejecutadas y los recursos del periodo.</p></div></div>
    <p className="draft-status" role="status">{draft.message || (dirty ? 'Guardando borrador local…' : 'Los cambios se guardan localmente mientras completas el formulario.')}</p>
    {draft.pending ? <div className="notice draft-notice"><div><strong>Hay un borrador del {timestamp(draft.pending.updatedAt)}.</strong><p>{draftMatches ? 'Puedes recuperar los campos que dejaste pendientes.' : 'El corte cambió desde este borrador. Consulta su contenido antes de descartarlo.'}</p></div>
      {draftMatches ? <Button type="button" variant="secondary" onClick={() => { setForm(draft.pending!.form); setDirty(true); draft.resume(); }}>Continuar editando</Button> : <details><summary>Ver borrador anterior</summary><pre>{JSON.stringify(draft.pending.form, null, 2)}</pre></details>}
      <Button type="button" variant="ghost" onClick={draft.discard}>Descartar borrador</Button></div> : null}
    {cut?.status === 'approved' ? <div className="notice"><ShieldCheck size={20} /><span>Al guardar, se conservará la versión visada y el corte volverá a revisión.</span></div> : null}
    <ErrorNotice error={error} />
    {conflict ? <div className="notice"><p>Tu borrador se conserva. Consulta el corte guardado antes de continuar.</p><Link to={cut ? `/cuts/${cut.id}` : `/cuts?project=${project}`} className="button secondary">Consultar cortes guardados</Link></div> : null}
    <form onSubmit={submit} className="cut-form">
      <fieldset disabled={busy || Boolean(draft.pending)} className="form-fields">
        <section className="panel"><div className="panel-header"><h2>Información del corte</h2></div><div className="form-grid panel-body">
          <Field label="Frente de obra"><select value={form.front} required onChange={event => change({ front: Number(event.target.value) })}><option value="0" disabled>Selecciona un frente</option>{catalogs.fronts.map(front => <option key={front.id} value={front.id}>{front.name}</option>)}</select></Field>
          <Field label="Inicio del periodo"><input required type="date" value={form.period_start} onChange={event => change({ period_start: event.target.value })} /></Field>
          <Field label="Fin del periodo"><input required type="date" min={form.period_start} value={form.period_end} onChange={event => change({ period_end: event.target.value })} /></Field>
        </div></section>
        <EntrySection title="Actividades ejecutadas" description="Registra la cantidad ejecutada en este periodo, en la unidad definida para cada actividad." itemLabel="Actividad" valueLabel="Cantidad del periodo" step="0.001"
          options={catalogs.activities.map(item => ({ id: item.id, label: `${item.code} · ${item.name} (previsto: ${item.planned_quantity} ${item.unit})`, unit: item.unit }))}
          rows={form.activities.map(row => ({ item: row.activity, value: row.quantity }))} onChange={rows => change({ activities: rows.map(row => ({ activity: row.item, quantity: row.value })) })} />
        <EntrySection title="Horas-hombre" description="Total de horas trabajadas por persona durante el periodo del corte." itemLabel="Trabajador" valueLabel="Horas trabajadas" step="0.01"
          options={catalogs.workers.map(item => ({ id: item.id, label: `${item.name} · ${item.identification}`, unit: 'HH' }))}
          rows={form.labor.map(row => ({ item: row.worker, value: row.hours }))} onChange={rows => change({ labor: rows.map(row => ({ worker: row.item, hours: row.value })) })} />
        <EntrySection title="Insumos consumidos" description="Agrega los materiales utilizados. Puedes dejar esta sección vacía si no hubo consumos." itemLabel="Insumo" valueLabel="Cantidad consumida" step="0.001"
          options={catalogs.supplies.map(item => ({ id: item.id, label: item.name, unit: item.unit }))}
          rows={form.supplies.map(row => ({ item: row.supply, value: row.quantity }))} onChange={rows => change({ supplies: rows.map(row => ({ supply: row.item, quantity: row.value })) })} />
        <section className="panel panel-body"><Field label="Observaciones del residente (opcional)"><textarea rows={3} maxLength={5000} value={form.notes} onChange={event => change({ notes: event.target.value })} /></Field>
          {cut ? <Field label="Motivo de la edición" hint="Escribe al menos 10 caracteres. Se conservará junto con tu nombre, fecha y hora."><textarea required rows={2} minLength={10} maxLength={1000} value={form.reason} onChange={event => change({ reason: event.target.value })} /></Field> : null}</section>
      </fieldset>
      <div className="form-actions"><span className="muted">{cut ? `Se registrará la versión ${cut.version + 1}.` : 'El corte se enviará a revisión.'}</span>
        <Button type="submit" busy={busy} disabled={missingCatalogs || Boolean(draft.pending) || conflict || !form.activities.length || !form.labor.length}
          aria-describedby="save-requirements"><Save size={17} />{busy ? 'Guardando corte…' : cut ? 'Guardar nueva versión' : 'Guardar y enviar corte'}</Button>
      </div>
      <p id="save-requirements" className="muted">{missingCatalogs ? 'Solicita al administrador que complete los frentes, actividades y trabajadores del proyecto.' : 'Requiere al menos una actividad y un trabajador. Los valores deben ser positivos.'}</p>
    </form>
  </>;
}
