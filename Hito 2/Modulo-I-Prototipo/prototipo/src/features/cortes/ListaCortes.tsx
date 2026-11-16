import { ClipboardList, Clock3, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Banner, Button, KpiCard, PageHeader, ResponsiveTable, SearchField, Select, StatusBadge, type TableColumn } from '@/components';
import { ESTADOS_CORTE } from '@/lib/estados';
import { formatoFecha, sinTildes } from '@/lib/formato';
import { useAuthDemo } from '@/features/acceso/AuthDemo';
import { useCortesDemo } from './CortesDemoContext';
import { horasTotales, type CorteDemo } from './modeloDemo';
import { soportesActivos } from './soportes';

const EN_REVISION = ESTADOS_CORTE[0];

export function ListaCortes() {
  const { usuario } = useAuthDemo();
  const { cortes, error, soportes } = useCortesDemo();
  const navigate = useNavigate();
  const esDirector = usuario?.rol === 'director';
  const [busqueda, setBusqueda] = useState('');
  // HU-M04: el director entra directo a su bandeja de pendientes de visado.
  const [estado, setEstado] = useState<string>(esDirector ? EN_REVISION : '');
  const visibles = cortes.filter(corte => (!estado || corte.versiones[0].estado === estado) &&
    sinTildes(`${corte.numero} ${corte.autorNombre} ${corte.versiones[0].datos.frente}`).includes(sinTildes(busqueda)));
  const pendientes = cortes.filter(corte => corte.versiones[0].estado === EN_REVISION).length;
  const columnas: TableColumn<CorteDemo>[] = [
    { key: 'numero', header: 'Corte / periodo', primary: true, cell: corte => <span className="flex flex-col gap-gutter-xs"><strong>Corte #{corte.numero}</strong><span className="text-body-sm text-on-surface-muted">{formatoFecha(corte.versiones[0].datos.inicio)} – {formatoFecha(corte.versiones[0].datos.fin)}</span></span> },
    { key: 'frente', header: 'Frente / residente', cell: corte => <span className="flex flex-col"><span>{corte.versiones[0].datos.frente}</span><span className="text-body-sm text-on-surface-muted">{corte.autorNombre}</span></span> },
    { key: 'horas', header: 'Horas-hombre', numeric: true, cell: corte => `${horasTotales(corte.versiones[0].datos)} HH` },
    { key: 'soportes', header: 'Soportes', numeric: true, cell: corte => soportesActivos(soportes, corte.id).length },
    { key: 'estado', header: 'Estado', cell: corte => <StatusBadge estado={corte.versiones[0].estado} /> },
    { key: 'version', header: 'Versión', numeric: true, cell: corte => `v${corte.versiones[0].version}` },
    { key: 'acciones', header: 'Acciones', action: true, cell: corte => esDirector && corte.versiones[0].estado === EN_REVISION
      ? <Button onClick={() => navigate(`/cortes/${corte.id}`)} aria-label={`Revisar Corte #${corte.numero}`}>Revisar</Button>
      : <Button variant="secondary" onClick={() => navigate(`/cortes/${corte.id}`)} aria-label={`Ver detalle del Corte #${corte.numero}`}>Ver detalle</Button> },
  ];
  const vacio = esDirector && estado === EN_REVISION && !busqueda
    ? 'No hay cortes pendientes de visado. Elige «Todos los estados» para consultar los visados y devueltos.'
    : 'No hay cortes que coincidan. Cambia la búsqueda o registra un corte de ejemplo.';
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
      <div className="flex flex-col gap-gutter-md tablet:flex-row"><SearchField className="flex-1" label="Buscar corte" value={busqueda} onChange={setBusqueda} placeholder="Número, frente o residente" />
        <Select label="Estado del corte" value={estado} onChange={event => setEstado(event.target.value)} options={[{ value: '', label: 'Todos los estados' }, ...ESTADOS_CORTE.map(value => ({ value, label: value }))]} /></div>
      <ResponsiveTable caption="Cortes de obra del proyecto" columns={columnas} rows={visibles} rowKey={corte => corte.id} empty={vacio} />
    </section>
  </div>;
}
