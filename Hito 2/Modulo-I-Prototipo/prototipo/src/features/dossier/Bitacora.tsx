import { useCortesDemo } from '@/features/cortes/CortesDemoContext';
import { registrosCortes } from '@/lib/seguimiento/cortes';
import { PageHeader, Select, StatusBadge, Timeline, Banner } from '@/components';
import { type EstadoOficial } from '@/lib/estados';
import { REGISTROS, ACTUALIZADO } from '@/lib/seguimiento/datos';
import { historial } from '@/lib/seguimiento/reglas';
import { useConsulta, ControlesConsulta, EstadoConsulta, consultaDisponible } from '@/lib/seguimiento/consulta';
import { formatoFechaHora } from '@/lib/formato';
import { useDossier } from './DossierContext';
import { registrosDossier } from '@/lib/seguimiento/dossier';

export function Bitacora() {
  const q = useConsulta();
  const { cortes, error } = useCortesDemo();
  const { confirmado, error: errorDossier } = useDossier();
  const fuente = [...registrosCortes(cortes), ...registrosDossier(confirmado, true), ...REGISTROS.filter(r=>r.tipo==='requisito' && r.proyecto !== 'CW-118')];
  const registros = q.escenario === 'vacio' ? [] : fuente.filter(r => r.proyecto === q.proyectoId);
  const id = q.params.get('registro') ?? registros[0]?.id;
  const registro = registros.find(r => r.id === id);
  const eventos = q.escenario === 'incompleto' ? [] : historial(fuente,q.proyectoId,id ?? '');
  return <div className="grid-page"><div className="col-span-full flex min-w-0 flex-col gap-gutter-lg">
    <PageHeader title="Bitácora del registro" description="Consulta quién cambió un estado, cuándo y por qué."
      meta={`Hora de Bogotá · Consulta de solo lectura · Datos de ejemplo: ${formatoFechaHora(new Date(ACTUALIZADO))}`} />
    <ControlesConsulta consulta={q} /><EstadoConsulta consulta={q} />
    {error && <Banner tone="error" title="No se pudo leer el historial de cortes">{error}</Banner>}
    {errorDossier && <Banner tone="error" title="No se pudo leer el historial del dossier">{errorDossier}</Banner>}
    {consultaDisponible(q) && <>
      {!registros.length ? <Banner title="Sin registros">Este proyecto no tiene registros disponibles para consultar.</Banner> : <>
        <Select label="Registro" value={id} options={registros.map(r => ({value:r.id,label:`${r.tipo === 'corte' ? 'Corte' : `Carpeta ${r.carpeta}`} · ${r.nombre}`}))}
          onChange={e => q.cambiar({registro:e.target.value})} />
        {!registro ? <Banner tone="warning" title="Registro no disponible">Selecciona un registro del proyecto actual.</Banner> : <section className="card p-gutter-md tablet:p-gutter-lg" aria-labelledby="registro-titulo">
          <div className="mb-gutter-lg flex flex-wrap items-start justify-between gap-gutter-md">
            <div><p className="text-body-sm text-on-surface-muted">{registro.id}</p><h2 id="registro-titulo" className="text-headline-sm">{registro.nombre}</h2></div>
            <StatusBadge estado={registro.estado as EstadoOficial} />
          </div>
          <p className="mb-gutter-md text-body-sm text-on-surface-muted">Más reciente primero · {eventos.length} eventos confirmados</p>
          {q.escenario === 'incompleto' ? <Banner tone="warning">El historial no está disponible. El estado actual no permite reconstruir quién lo cambió.</Banner> :
            <Timeline label={`Historial de ${registro.nombre}`} entries={eventos} empty="Aún no hay cambios registrados." />}
          <p className="mt-gutter-lg border-t border-outline-variant pt-gutter-md text-body-sm text-on-surface-muted">Solo se muestran cambios confirmados. Una validación deshecha antes de confirmarse no genera un evento.</p>
        </section>}
      </>}
    </>}
  </div></div>;
}
