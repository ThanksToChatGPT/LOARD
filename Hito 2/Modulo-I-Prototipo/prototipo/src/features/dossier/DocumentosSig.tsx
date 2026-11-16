import { FilePlus2, History } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Badge, Banner, Button, Drawer, FilterChips, PageHeader, ResponsiveTable, SearchField, Select, StatusBadge, type TableColumn,
} from '@/components';
import { useAuthDemo } from '@/features/acceso/AuthDemo';
import { CARPETAS_DOSSIER } from '@/lib/constantes';
import { ESTADOS_REQUISITO } from '@/lib/estados';
import { formatoFecha, formatoFechaHora, plural } from '@/lib/formato';
import { useDossier } from './DossierContext';
import { PestanasDossier } from './DossierLayout';
import { buscarDocumentos, documentosVigentes, formatoTamano, puedeEstructurar, versionesDe, type FilaDocumento } from './modelo';

const ID_BUSQUEDA = 'buscar-documento';
// Dato en dos líneas: a la derecha en la tarjeta de móvil y a la izquierda en la tabla.
const APILADO = 'flex flex-col items-end text-right tablet:items-start tablet:text-left';

/**
 * HU-M06 · Búsqueda de documentos vigentes del SIG por nombre o código, carpeta y estado.
 * Las versiones obsoletas solo se consultan en el historial de cada documento (HU-M05).
 */
export function DocumentosSig() {
  const { usuario } = useAuthDemo();
  const { dossier, error } = useDossier();
  const navigate = useNavigate();
  // Búsqueda y filtros en la URL: se conservan al volver de «Publicar documento».
  const [params, setParams] = useSearchParams();
  const [historial, setHistorial] = useState<string | null>(null);
  const ultimoHistorial = useRef(historial);
  if (historial) ultimoHistorial.current = historial;

  const texto = params.get('q') ?? '';
  const carpeta = CARPETAS_DOSSIER.find(c => String(c.numero) === params.get('carpeta'))?.numero ?? null;
  const estado = ESTADOS_REQUISITO.find(e => e === params.get('estado')) ?? null;
  const conFiltros = texto.trim() !== '' || carpeta !== null || estado !== null;
  const filas = buscarDocumentos(dossier, { texto, carpeta, estado });
  const total = documentosVigentes(dossier.documentos).length;
  const estructura = puedeEstructurar(usuario);
  const versiones = versionesDe(dossier.documentos, ultimoHistorial.current ?? '');

  const actualizar = (cambios: Record<string, string | null>) => {
    const siguiente = new URLSearchParams(params);
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor) siguiente.set(clave, valor);
      else siguiente.delete(clave);
    }
    setParams(siguiente, { replace: true });
  };
  // El botón desaparece al limpiar: el foco pasa al campo de búsqueda.
  const limpiar = () => { setParams({}, { replace: true }); document.getElementById(ID_BUSQUEDA)?.focus(); };
  const criterios = [texto.trim() && `«${texto.trim()}»`, carpeta && `la Carpeta ${carpeta}`, estado && `el estado ${estado}`].filter(Boolean).join(', ');

  const columnas: TableColumn<FilaDocumento>[] = [
    { key: 'documento', header: 'Documento', primary: true, cell: ({ documento }) => (
      <span className="flex flex-col gap-gutter-xs"><strong className="font-semibold tabular-nums">{documento.codigo}</strong><span className="text-body-md font-normal">{documento.nombre}</span></span>
    ) },
    { key: 'version', header: 'Versión vigente', numeric: true, cell: ({ documento }) => (
      <span className={APILADO}><span>v{documento.version}</span><span className="text-body-sm text-on-surface-muted">{formatoFecha(new Date(documento.fecha))}</span></span>
    ) },
    { key: 'carpeta', header: 'Carpeta', cell: ({ documento }) => (
      <span className={APILADO}><span>Carpeta {documento.carpeta}</span><span className="text-body-sm text-on-surface-muted">{CARPETAS_DOSSIER.find(c => c.numero === documento.carpeta)?.nombre}</span></span>
    ) },
    { key: 'estado', header: 'Estado en la checklist', cell: fila => (fila.estado
      ? <span className={`${APILADO} gap-gutter-xs`}><StatusBadge estado={fila.estado} />{fila.requisitos > 1 && <span className="text-body-sm text-on-surface-muted">{fila.requisitos} requisitos lo usan</span>}</span>
      : <span className="text-body-sm text-on-surface-muted">Sin requisito en la checklist</span>) },
    { key: 'acciones', header: 'Acciones', action: true, cell: ({ documento }) => (
      <span className="flex flex-wrap gap-gutter-sm">
        <Button variant="secondary" icon={<History aria-hidden="true" className="h-4 w-4" />} aria-label={`Historial de ${documento.codigo}`}
          onClick={() => setHistorial(documento.codigo)}>Historial</Button>
        {estructura && (
          <Button variant="ghost" aria-label={`Nueva versión de ${documento.codigo}`}
            onClick={() => navigate(`/dossier/documentos/publicar?codigo=${encodeURIComponent(documento.codigo)}`)}>Nueva versión</Button>
        )}
      </span>
    ) },
  ];

  return (
    <div className="grid-page gap-y-gutter-lg">
      <PestanasDossier />
      <PageHeader className="col-span-full" title="Documentos del SIG" description="Formatos y procedimientos vigentes para armar el dossier."
        actions={estructura && (
          <Button icon={<FilePlus2 aria-hidden="true" className="h-4 w-4" />} onClick={() => navigate('/dossier/documentos/publicar')}>Publicar documento</Button>
        )} />
      {error && <div className="col-span-full"><Banner tone="error" title="No se pudo abrir el dossier">{error}</Banner></div>}

      <section className="card col-span-full flex flex-col gap-gutter-md p-gutter-md">
        <div className="flex flex-col gap-gutter-md tablet:flex-row">
          <SearchField id={ID_BUSQUEDA} className="flex-1" label="Buscar documento vigente" placeholder="Nombre o código, por ejemplo GT-FR64" value={texto} onChange={q => actualizar({ q })} />
          <Select label="Carpeta del dossier" value={carpeta === null ? '' : String(carpeta)} onChange={event => actualizar({ carpeta: event.target.value })}
            options={[{ value: '', label: 'Todas las carpetas' }, ...CARPETAS_DOSSIER.map(c => ({ value: String(c.numero), label: `Carpeta ${c.numero} · ${c.nombre}` }))]} />
        </div>
        <div className="flex flex-col gap-gutter-sm">
          <span aria-hidden="true" className="text-label-lg">Estado en la checklist</span>
          <FilterChips label="Filtrar por estado en la checklist" value={estado} onChange={valor => actualizar({ estado: valor })}
            options={ESTADOS_REQUISITO.map(e => ({ value: e, label: e }))} />
        </div>
        <p role="status" className="text-body-sm tabular-nums text-on-surface-muted">
          {conFiltros ? `${filas.length} de ${plural(total, 'documento vigente', 'documentos vigentes')}` : plural(total, 'documento vigente', 'documentos vigentes')}.
          {' '}Las versiones obsoletas solo aparecen en el historial de cada documento.
        </p>
        <ResponsiveTable caption="Documentos vigentes del SIG" columns={columnas} rows={filas} rowKey={fila => fila.documento.id}
          empty={conFiltros ? (
            <span className="flex flex-col items-start gap-gutter-sm">
              <span>No hay documentos vigentes para {criterios}. Revisa la búsqueda o quita los filtros.</span>
              <Button variant="secondary" onClick={limpiar}>Limpiar filtros</Button>
            </span>
          ) : 'Aún no hay documentos publicados. Calidad los publica con «Publicar documento».'} />
      </section>

      <Drawer open={historial != null} onClose={() => setHistorial(null)} title={versiones[0] ? `${versiones[0].codigo} · ${versiones[0].nombre}` : ''}
        meta="Historial de versiones. Solo la vigente se usa en obra.">
        <ol aria-label="Versiones del documento" className="flex flex-col gap-gutter-sm">
          {versiones.map(version => (
            <li key={version.id} className="flex flex-col gap-gutter-xs rounded-md border border-outline-variant p-3">
              <div className="flex flex-wrap items-center gap-gutter-sm">
                <strong className="text-title-md tabular-nums">Versión {version.version}</strong>
                <Badge tone={version.vigente ? 'success' : 'neutral'}>{version.vigente ? 'Vigente' : 'Obsoleta'}</Badge>
              </div>
              <p className="break-words text-body-md">{version.nota}</p>
              <p className="break-words text-body-sm tabular-nums text-on-surface-muted">
                {version.archivo.nombre} · {formatoTamano(version.archivo.bytes)} · Publicada por {version.publicadoPor} ({version.rol}) el {formatoFechaHora(new Date(version.fecha))}
              </p>
            </li>
          ))}
        </ol>
      </Drawer>
    </div>
  );
}
