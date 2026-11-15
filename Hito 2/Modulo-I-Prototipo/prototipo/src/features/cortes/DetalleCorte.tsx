import { History, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Banner, Button, PageHeader, ResponsiveTable, StatusBadge, Timeline } from '@/components';
import { formatoFecha, formatoFechaHora } from '@/lib/formato';
import { useSst } from '@/lib/sst/SstContext';
import { useAuthDemo } from '@/features/acceso/AuthDemo';
import { Volver } from '@/features/sst/componentes';
import { useCortesDemo } from './CortesDemoContext';
import { SoportesCorte } from './SoportesCorte';
import { AvisoDevolucion, RevisionCorte } from './RevisionCorte';
import { ACTIVIDADES_DEMO, INSUMOS_DEMO, MOTIVO_CORTE_VISADO, esEditable, horasTotales, type FormularioCorteDemo, type RecursoDemo } from './modeloDemo';

export function DetalleCorte() {
  const { id } = useParams();
  const { cortes, error } = useCortesDemo();
  const { usuario } = useAuthDemo();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState(false);
  const [version, setVersion] = useState<number | null>(null);
  const corte = cortes.find(item => item.id === id);
  if (!corte) return <div className="grid-page"><div className="col-span-full"><Volver to="/cortes">Cortes de obra</Volver><Banner tone="warning" title="Corte no disponible">{error || 'Abre un corte desde la lista de ejemplos.'}</Banner></div></div>;
  const actual = corte.versiones[0];
  const consultada = corte.versiones.find(item => item.version === version) ?? actual;
  const esAutor = usuario?.rol === 'residente' && usuario.correo === corte.autorCorreo;
  const visado = !esEditable(corte);
  return <div className="grid-page gap-y-gutter-lg"><div className="col-span-full"><Volver to="/cortes">Cortes de obra</Volver></div>
    <PageHeader className="col-span-full" title={`Corte #${corte.numero}`} description={`${actual.datos.frente} · ${formatoFecha(actual.datos.inicio)} – ${formatoFecha(actual.datos.fin)}`}
      meta={`${corte.autorNombre} · Versión ${actual.version} · Actualizado ${formatoFechaHora(new Date(actual.fecha))}`}
      actions={esAutor && <Button variant="secondary" icon={<Pencil className="h-4 w-4" />} blocked={visado} blockedReason={MOTIVO_CORTE_VISADO}
        onClick={() => navigate(`/cortes/${corte.id}/editar`)}>Editar corte</Button>} />
    <div className="col-span-full"><StatusBadge estado={actual.estado} /></div>
    <div className="col-span-full empty:hidden"><AvisoDevolucion corte={corte} /></div>
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
    <div className="sticky bottom-gutter-md z-10 col-span-full empty:hidden"><RevisionCorte key={corte.id} corte={corte} /></div>
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
        { key: 'recurso', header: 'Recurso', primary: true, cell: (row: RecursoDemo) => bloque.catalogo.find(item => item.id === row.id)?.nombre ?? row.id },
        { key: 'cantidad', header: 'Cantidad del periodo', numeric: true, cell: (row: RecursoDemo) => `${row.cantidad} ${bloque.catalogo.find(item => item.id === row.id)?.unidad ?? ''}` },
      ]} />
  </section>)}<section className="card flex flex-col gap-gutter-sm p-gutter-md"><h2 className="text-headline-sm">Observaciones</h2><p className="whitespace-pre-wrap text-body-md">{datos.observaciones || 'Sin observaciones del residente.'}</p></section></div>;
}
