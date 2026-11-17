import { ClipboardList, Clock3, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Banner, Button, DateField, KpiCard, PageHeader, ResponsiveTable, SearchField, Select, StatusBadge, type TableColumn } from '@/components';
import { ESTADOS_CORTE } from '@/lib/estados';
import { formatoFecha } from '@/lib/formato';
import { useAuthDemo } from '@/features/acceso/AuthDemo';
import { useCortesDemo } from './CortesDemoContext';
import { SIN_FILTROS, buscaEnTodosLosEstados, filtrarCortes, type FiltrosCortes } from './filtros';
import { CIUDADES_DEMO, CLIENTES_DEMO, horasTotales, type CorteDemo } from './modeloDemo';
import { soportesActivos } from './soportes';

const EN_REVISION = ESTADOS_CORTE[0];

export function ListaCortes() {
  const { usuario } = useAuthDemo();
  const { cortes, error, soportes } = useCortesDemo();
  const navigate = useNavigate();
  const esDirector = usuario?.rol === 'director';
  // HU-M04: el director entra directo a su bandeja de pendientes de visado.
  const [filtros, setFiltros] = useState<FiltrosCortes>({ ...SIN_FILTROS, estado: esDirector ? EN_REVISION : '' });
  const { busqueda, estado } = filtros;
  const cambiar = (patch: Partial<FiltrosCortes>) => setFiltros(actual => ({ ...actual, ...patch }));
  const setEstado = (valor: string) => cambiar({ estado: valor });
  // Al escribir en el buscador se miran los cortes de todos los estados.
  const visibles = filtrarCortes(cortes, filtros);
  const todosLosEstados = buscaEnTodosLosEstados(filtros);
  const conFiltros = Boolean(busqueda || filtros.desde || filtros.hasta || filtros.ciudad || filtros.cliente);
  const pendientes = cortes.filter(corte => corte.versiones[0].estado === EN_REVISION).length;
  const columnas: TableColumn<CorteDemo>[] = [
    { key: 'numero', header: 'Corte / periodo', primary: true, cell: corte => <span className="flex flex-col gap-gutter-xs"><strong>Corte #{corte.numero}</strong><span className="text-body-sm text-on-surface-muted">{formatoFecha(corte.versiones[0].datos.inicio)} – {formatoFecha(corte.versiones[0].datos.fin)}</span></span> },
    { key: 'frente', header: 'Frente / residente', cell: corte => <span className="flex flex-col"><span>{corte.versiones[0].datos.frente}</span><span className="text-body-sm text-on-surface-muted">{corte.autorNombre}</span></span> },
    { key: 'ciudad', header: 'Ciudad / cliente', cell: corte => <span className="flex flex-col"><span>{corte.versiones[0].datos.ciudad || 'Sin ciudad'}</span><span className="text-body-sm text-on-surface-muted">{corte.versiones[0].datos.cliente || 'Sin cliente'}</span></span> },
    { key: 'horas', header: 'Horas-hombre', numeric: true, cell: corte => `${horasTotales(corte.versiones[0].datos)} HH` },
    { key: 'soportes', header: 'Soportes', numeric: true, cell: corte => soportesActivos(soportes, corte.id).length },
    { key: 'estado', header: 'Estado', cell: corte => <StatusBadge estado={corte.versiones[0].estado} /> },
    { key: 'version', header: 'Versión', numeric: true, cell: corte => `v${corte.versiones[0].version}` },
    { key: 'acciones', header: 'Acciones', action: true, cell: corte => esDirector && corte.versiones[0].estado === EN_REVISION
      ? <Button onClick={() => navigate(`/cortes/${corte.id}`)} aria-label={`Revisar Corte #${corte.numero}`}>Revisar</Button>
      : <Button variant="secondary" onClick={() => navigate(`/cortes/${corte.id}`)} aria-label={`Ver detalle del Corte #${corte.numero}`}>Ver detalle</Button> },
  ];
  const vacio = esDirector && estado === EN_REVISION && !conFiltros
    ? 'No hay cortes pendientes de visado. Elige «Todos los estados» para consultar los visados y devueltos.'
    : 'No hay cortes que coincidan. Cambia la búsqueda o los filtros.';
  return <div className="grid-page gap-y-gutter-lg">
    <PageHeader className="col-span-full" title={esDirector ? 'Cortes por revisar' : 'Cortes de obra'}
      description={esDirector ? 'Cortes enviados por los residentes del Contrato CW-118. Vísalos o devuélvelos con una observación.' : 'Avances, horas e insumos del Contrato CW-118.'}
      actions={usuario?.rol === 'residente' && <Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/cortes/nuevo')}>Registrar corte</Button>} />
    {error && <div className="col-span-full"><Banner tone="error">{error}</Banner></div>}
    <KpiCard title="Cortes registrados" value={cortes.length} icon={<ClipboardList className="h-4 w-4" />} />
    <KpiCard title={esDirector ? 'Pendientes de visado' : 'En revisión'} value={pendientes} tone={esDirector && pendientes > 0 ? 'info' : 'default'}
      icon={<Clock3 className="h-4 w-4" />} selected={estado === EN_REVISION} onClick={() => setEstado(estado === EN_REVISION ? '' : EN_REVISION)} />
    <KpiCard title="Horas-hombre" value={cortes.reduce((sum, corte) => sum + horasTotales(corte.versiones[0].datos), 0)} />
    <section className="card col-span-full flex flex-col gap-gutter-md p-gutter-md">
      <div className="flex flex-col gap-gutter-md tablet:flex-row"><SearchField className="flex-1" label="Buscar corte" value={busqueda} onChange={valor => cambiar({ busqueda: valor })} placeholder="Número, frente, residente, ciudad o cliente" />
        <Select label="Estado del corte" value={estado} onChange={event => setEstado(event.target.value)} options={[{ value: '', label: 'Todos los estados' }, ...ESTADOS_CORTE.map(value => ({ value, label: value }))]} /></div>
      <div role="group" aria-label="Filtros de cortes" className="grid grid-cols-1 gap-gutter-md tablet:grid-cols-2 desktop:grid-cols-4">
        <DateField label="Desde" value={filtros.desde} max={filtros.hasta || undefined} onChange={event => cambiar({ desde: event.target.value })} />
        <DateField label="Hasta" value={filtros.hasta} min={filtros.desde || undefined} onChange={event => cambiar({ hasta: event.target.value })} />
        <Select label="Ciudad" value={filtros.ciudad} onChange={event => cambiar({ ciudad: event.target.value })} options={[{ value: '', label: 'Todas las ciudades' }, ...CIUDADES_DEMO.map(value => ({ value, label: value }))]} />
        <Select label="Cliente" value={filtros.cliente} onChange={event => cambiar({ cliente: event.target.value })} options={[{ value: '', label: 'Todos los clientes' }, ...CLIENTES_DEMO.map(value => ({ value, label: value }))]} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-gutter-sm">
        <p role="status" className="text-body-md tabular-nums text-on-surface-muted">
          {visibles.length === 1 ? '1 corte encontrado.' : `${visibles.length} cortes encontrados.`}
          {todosLosEstados && ' La búsqueda mira los cortes de todos los estados.'}
        </p>
        {conFiltros && <Button variant="ghost" onClick={() => setFiltros({ ...SIN_FILTROS, estado })}>Limpiar búsqueda y filtros</Button>}
      </div>
      <ResponsiveTable caption="Cortes de obra del proyecto" columns={columnas} rows={visibles} rowKey={corte => corte.id} empty={vacio} />
    </section>
  </div>;
}
