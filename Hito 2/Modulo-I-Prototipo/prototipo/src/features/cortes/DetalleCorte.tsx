import { History, Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Banner, Button, PageHeader, ResponsiveTable, StatusBadge, Timeline } from '@/components';
import { formatoFecha, formatoFechaHora } from '@/lib/formato';
import { useSst } from '@/lib/sst/SstContext';
import { useAuthDemo } from '@/features/acceso/AuthDemo';
import { Volver } from '@/features/sst/componentes';
import { useCortesDemo } from './CortesDemoContext';
import { SoportesCorte } from './SoportesCorte';
import { AvisoDevolucion, RevisionCorte } from './RevisionCorte';
import { ACTIVIDADES_DEMO, INSUMOS_DEMO, MOTIVO_CORTE_VISADO, describirRecurso, esEditable, horasTotales, type FormularioCorteDemo, type RecursoDemo } from './modeloDemo';

/** Contrato de ejemplo del prototipo. La obra es el frente del corte. */
const CONTRATO = 'Contrato CW-118';

export function DetalleCorte() {
  const { id } = useParams();
  const { cortes, error } = useCortesDemo();
  const { usuario } = useAuthDemo();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const historial = params.get('vista') === 'historial';
  function setHistorial(abierto: boolean) {
    setParams(actual => {
      const next = new URLSearchParams(actual);
      if (abierto) next.set('vista', 'historial');
      else next.delete('vista');
      return next;
    }, { replace: true });
  }
  const [version, setVersion] = useState<number | null>(null);
  const corte = cortes.find(item => item.id === id);
  // Tras visar o devolver, el diálogo y la barra desaparecen: el foco pasa al nuevo estado del corte.
  const estadoRef = useRef<HTMLDivElement>(null);
  const [enfocarEstado, setEnfocarEstado] = useState(false);
  useEffect(() => {
    if (!enfocarEstado) return;
    estadoRef.current?.focus();
    setEnfocarEstado(false);
  }, [enfocarEstado]);
  if (!corte) return <div className="grid-page"><div className="col-span-full"><Volver to="/cortes">Cortes de obra</Volver><Banner tone="warning" title="Corte no disponible">{error || 'Abre un corte desde la lista de ejemplos.'}</Banner></div></div>;
  const actual = corte.versiones[0];
  const consultada = corte.versiones.find(item => item.version === version) ?? actual;
  const esAutor = usuario?.rol === 'residente' && usuario.correo === corte.autorCorreo;
  const visado = !esEditable(corte);
  return <div className="grid-page gap-y-gutter-lg"><div className="col-span-full"><Volver to="/cortes">Cortes de obra</Volver></div>
    <PageHeader className="col-span-full" title={`Corte #${corte.numero}`} description={`${actual.datos.frente} · ${formatoFecha(actual.datos.inicio)} – ${formatoFecha(actual.datos.fin)}`}
      meta={`Versión ${actual.version} · Actualizado ${formatoFechaHora(new Date(actual.fecha))}`}
      actions={esAutor && <Button variant="secondary" icon={<Pencil className="h-4 w-4" />} blocked={visado} blockedReason={MOTIVO_CORTE_VISADO}
        onClick={() => navigate(`/cortes/${corte.id}/editar`)}>Editar corte</Button>} />
    {/* Ciudad, residente y contrato u obra: grandes y a la vista en el encabezado del corte. */}
    <dl aria-label="Datos principales del corte" className="card col-span-full grid grid-cols-1 gap-gutter-md p-gutter-md tablet:grid-cols-3">
      {[
        { etiqueta: 'Ciudad', valor: actual.datos.ciudad || 'Sin ciudad registrada' },
        { etiqueta: 'Residente', valor: corte.autorNombre },
        { etiqueta: 'Contrato u obra', valor: `${CONTRATO} · ${actual.datos.frente}`, extra: actual.datos.cliente && `Cliente: ${actual.datos.cliente}` },
      ].map(dato => <div key={dato.etiqueta} className="flex min-w-0 flex-col gap-gutter-xs">
        <dt className="text-label-lg text-on-surface-muted">{dato.etiqueta}</dt>
        <dd className="break-words text-headline-md text-on-surface">{dato.valor}</dd>
        {dato.extra && <dd className="text-body-md text-on-surface-muted">{dato.extra}</dd>}
      </div>)}
    </dl>
    <div ref={estadoRef} tabIndex={-1} className="col-span-full flex flex-col gap-gutter-md rounded focus:outline-none">
      <div><StatusBadge estado={actual.estado} /></div>
      <AvisoDevolucion corte={corte} />
    </div>
    <div className="col-span-full flex flex-wrap gap-gutter-sm"><Button variant={historial ? 'secondary' : 'primary'} onClick={() => setHistorial(false)}>Detalle del corte</Button>
      <Button variant={historial ? 'primary' : 'secondary'} icon={<History className="h-4 w-4" />} onClick={() => setHistorial(true)}>Historial de versiones</Button></div>
    {historial && <section className="card col-span-full flex flex-col gap-gutter-lg p-gutter-md"><h2 className="text-headline-sm">Cambios del corte</h2>
      <Timeline label={`Historial del Corte #${corte.numero}`} entries={corte.versiones.map((item, index) => ({ id: String(item.version), fecha: new Date(item.fecha), usuario: item.autor, rol: item.rol,
        estadoAnterior: corte.versiones[index + 1]?.estado ?? 'Sin registro', estadoNuevo: item.estado, motivo: `Versión ${item.version}. ${item.motivo}` }))} />
      <div className="flex flex-wrap gap-gutter-sm">{corte.versiones.map(item => <Button key={item.version} variant={consultada.version === item.version ? 'primary' : 'secondary'} onClick={() => setVersion(item.version)}>Consultar versión {item.version}</Button>)}</div>
      <Banner tone="info">Versión {consultada.version} · {consultada.autor} · {formatoFechaHora(new Date(consultada.fecha))}<span className="ml-gutter-sm"><StatusBadge estado={consultada.estado} /></span></Banner>
    </section>}
    <div className="col-span-full"><ValoresCorte datos={(historial ? consultada : actual).datos} /></div>
    <div className="col-span-full"><SoportesCorte corte={corte} /></div>
    {/* HU-M04: fija al pie para que el director decida sin volver a subir. */}
    <RevisionCorte key={corte.id} corte={corte} onDecidido={() => setEnfocarEstado(true)} />
  </div>;
}

function ValoresCorte({ datos }: { datos: FormularioCorteDemo }) {
  const { trabajadores } = useSst();
  const bloques = [
    { titulo: 'Actividades ejecutadas', filas: datos.actividades, catalogo: ACTIVIDADES_DEMO },
    { titulo: 'Horas-hombre', filas: datos.personal, catalogo: trabajadores.map(item => ({ id: item.id, nombre: item.nombre, unidad: 'HH' })) },
    { titulo: 'Insumos consumidos', filas: datos.insumos, catalogo: INSUMOS_DEMO },
  ];
  return <div className="flex flex-col gap-gutter-lg">{bloques.map(bloque => <section key={bloque.titulo} className="card flex flex-col gap-gutter-md p-gutter-md">
    <div className="flex justify-between gap-gutter-sm"><h2 className="text-headline-sm">{bloque.titulo}</h2>{bloque.titulo === 'Horas-hombre' && <span className="tabular-nums text-on-surface-muted">Total {horasTotales(datos)} HH</span>}</div>
    <ResponsiveTable caption={bloque.titulo} rows={bloque.filas} rowKey={row => row.id} empty="Sin consumos registrados en este periodo."
      columns={[
        { key: 'recurso', header: 'Recurso', primary: true, cell: (row: RecursoDemo) => describirRecurso(row, bloque.catalogo).nombre },
        { key: 'cantidad', header: 'Cantidad del periodo', numeric: true, cell: (row: RecursoDemo) => `${row.cantidad} ${describirRecurso(row, bloque.catalogo).unidad}`.trim() },
      ]} />
  </section>)}<section className="card flex flex-col gap-gutter-sm p-gutter-md"><h2 className="text-headline-sm">Observaciones</h2><p className="whitespace-pre-wrap text-body-md">{datos.observaciones || 'Sin observaciones del residente.'}</p></section></div>;
}
