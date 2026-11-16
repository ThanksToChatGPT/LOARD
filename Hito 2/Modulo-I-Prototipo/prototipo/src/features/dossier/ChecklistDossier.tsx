import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import {
  Banner, Button, Dialog, FilterChips, IconButton, PageHeader, ProgressBar, Select, StatusBadge, TextArea, TextField, useToast,
} from '@/components';
import { useAuthDemo, type UsuarioDemo } from '@/features/acceso/AuthDemo';
import { CARPETAS_DOSSIER } from '@/lib/constantes';
import { ESTADOS_REQUISITO, type EstadoRequisito } from '@/lib/estados';
import { plural } from '@/lib/formato';
import { useSst } from '@/lib/sst/SstContext';
import { useCargasDossier } from './CargasDossier';
import { DetalleItem } from './DetalleItem';
import { useDossier } from './DossierContext';
import { PestanasDossier } from './DossierLayout';
import {
  avanceCarpeta, documentosVigentes, itemsActivos, puedeCargar, puedeEstructurar, puedeRevisar, validarItem, type ItemChecklist,
} from './modelo';
import type { CargaSimulada } from './useCargasSimuladas';

/** Requisito que se está creando (solo carpeta) o editando (con `item`). */
interface Edicion { carpeta: number; item?: ItemChecklist }

const SIN_SENAL = 'Necesitas conexión para cambiar la checklist.';
const idCarpeta = (numero: number) => `carpeta-${numero}`;

/** Texto del botón de cada requisito: nombra la tarea que le corresponde al perfil. */
function accionDe(item: ItemChecklist, usuario: UsuarioDemo | null): string {
  if (puedeRevisar(usuario) && item.estado === 'Archivo Cargado') return 'Revisar soporte';
  if (puedeCargar(usuario) && item.estado === 'Pendiente') return 'Cargar soporte';
  if (puedeCargar(usuario) && item.estado === 'Observado') return 'Reemplazar soporte';
  return 'Ver detalle';
}

/** Carga en curso de un requisito. Se ve en la lista aunque su panel esté cerrado (#8.3). */
function AvisoCarga({ carga }: { carga: CargaSimulada }) {
  const nombre = `«${carga.archivo.name}»`;
  if (carga.estado === 'error') return <p className="break-words text-body-sm text-error">No se pudo cargar {nombre}. Abre el requisito para reintentar.</p>;
  if (carga.estado === 'queued') return <p className="break-words text-body-sm text-warning">{nombre} espera la señal. Se subirá solo al recuperar la conexión.</p>;
  return (
    <p className="break-words text-body-sm tabular-nums text-info">
      {carga.estado === 'confirming' ? `Confirmando la carga de ${nombre}…` : `Cargando ${nombre}… ${Math.round(carga.progreso)}%`}
    </p>
  );
}

/**
 * HU-M05 y HU-M06 · Checklist del dossier en las 6 carpetas contractuales.
 * Calidad arma la estructura (agregar, editar, retirar). El Residente y Calidad cargan los soportes.
 */
export function ChecklistDossier() {
  const { usuario } = useAuthDemo();
  const { dossier, error } = useDossier();
  const { cargas } = useCargasDossier();
  const [filtro, setFiltro] = useState<EstadoRequisito | null>(null);
  const [abiertoId, setAbiertoId] = useState<string | null>(null);
  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const [retiro, setRetiro] = useState<ItemChecklist | null>(null);

  const estructura = puedeEstructurar(usuario);
  const total = avanceCarpeta(dossier.items);
  const abierto = itemsActivos(dossier.items).find(item => item.id === abiertoId) ?? null;

  return (
    <div className="grid-page gap-y-gutter-lg">
      <PestanasDossier />
      <PageHeader className="col-span-full" title="Checklist del dossier"
        description="Requisitos de las 6 carpetas contractuales del Contrato CW-118."
        meta={`${plural(total.total, 'requisito', 'requisitos')} · ${total.porcentaje}% validado`} />
      {error && <div className="col-span-full"><Banner tone="error" title="No se pudo abrir el dossier">{error}</Banner></div>}

      <FilterChips className="col-span-full" size="field" label="Filtrar requisitos por estado" value={filtro}
        onChange={valor => setFiltro(ESTADOS_REQUISITO.find(estado => estado === valor) ?? null)}
        options={ESTADOS_REQUISITO.map(estado => ({ value: estado, label: estado, count: total.conteo[estado] }))} />

      {CARPETAS_DOSSIER.map(carpeta => {
        const avance = avanceCarpeta(dossier.items, carpeta.numero);
        const visibles = itemsActivos(dossier.items, carpeta.numero).filter(item => !filtro || item.estado === filtro);
        const resumen = ESTADOS_REQUISITO.filter(estado => avance.conteo[estado] > 0).map(estado => `${estado}: ${avance.conteo[estado]}`).join(' · ');
        const vacio = avance.total > 0 ? `Ningún requisito de esta carpeta está en estado ${filtro}.`
          : estructura ? 'Esta carpeta aún no tiene requisitos. Agrega el primero con «Agregar requisito».'
          : 'Calidad aún no ha definido requisitos en esta carpeta.';
        return (
          <section key={carpeta.numero} aria-labelledby={idCarpeta(carpeta.numero)} className="card col-span-full flex flex-col gap-gutter-md p-gutter-md">
            <div className="flex flex-col gap-gutter-sm tablet:flex-row tablet:items-start tablet:justify-between">
              <div className="flex flex-col gap-gutter-xs">
                <h2 id={idCarpeta(carpeta.numero)} tabIndex={-1} className="rounded text-headline-sm">Carpeta {carpeta.numero} · {carpeta.nombre}</h2>
                <p className="text-body-sm tabular-nums text-on-surface-muted">
                  {plural(avance.total, 'requisito', 'requisitos')}{resumen && ` · ${resumen}`}
                </p>
              </div>
              {estructura && (
                <Button variant="secondary" size="field" icon={<Plus aria-hidden="true" className="h-4 w-4" />}
                  aria-label={`Agregar requisito a la Carpeta ${carpeta.numero}`} onClick={() => setEdicion({ carpeta: carpeta.numero })}>
                  Agregar requisito
                </Button>
              )}
            </div>
            <ProgressBar label={`Avance validado de la Carpeta ${carpeta.numero}`} value={avance.porcentaje}
              tone={avance.porcentaje === 100 ? 'success' : 'primary'} showLabel />
            {visibles.length === 0 ? <p className="text-body-md text-on-surface-muted">{vacio}</p> : (
              <ul className="flex flex-col gap-gutter-sm">
                {visibles.map(item => {
                  const documento = dossier.documentos.find(d => d.vigente && d.codigo === item.documentoCodigo);
                  const accion = accionDe(item, usuario);
                  const carga = cargas.find(c => c.clave === item.id);
                  return (
                    <li key={item.id} className="sf-container flex flex-col gap-gutter-sm rounded-md border border-outline-variant p-3 tablet:flex-row tablet:items-center">
                      <div className="flex min-w-0 flex-1 flex-col gap-gutter-xs">
                        <p className="break-words text-title-md">{item.nombre}</p>
                        <p className="break-words text-body-sm text-on-surface-muted">
                          {[item.detalle, documento && `Documento ${documento.codigo} v${documento.version}`, item.soporte?.nombre ?? 'Sin soporte'].filter(Boolean).join(' · ')}
                        </p>
                        {item.estado === 'Observado' && item.observacion && <p className="break-words text-body-sm text-warning">Observación: «{item.observacion}»</p>}
                        {carga && <AvisoCarga carga={carga} />}
                      </div>
                      <StatusBadge estado={item.estado} className="self-start tablet:self-center" />
                      <div className="flex flex-wrap items-center gap-gutter-sm">
                        <Button variant={accion === 'Ver detalle' ? 'secondary' : 'primary'} size="field" aria-label={`${accion}: ${item.nombre}`} onClick={() => setAbiertoId(item.id)}>{accion}</Button>
                        {estructura && (
                          <>
                            <IconButton label={`Editar requisito: ${item.nombre}`} size="field" onClick={() => setEdicion({ carpeta: item.carpeta, item })}>
                              <Pencil aria-hidden="true" className="h-5 w-5" />
                            </IconButton>
                            <IconButton label={`Retirar requisito: ${item.nombre}`} size="field" onClick={() => setRetiro(item)}>
                              <Trash2 aria-hidden="true" className="h-5 w-5" />
                            </IconButton>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}

      <DetalleItem item={abierto} onClose={() => setAbiertoId(null)} />
      <DialogoItem edicion={edicion} onClose={() => setEdicion(null)} />
      <DialogoRetiro item={retiro} onClose={() => setRetiro(null)} />
    </div>
  );
}

/** HU-M05 · Agregar o editar un requisito. El nuevo arranca en Pendiente. */
function DialogoItem({ edicion, onClose }: { edicion: Edicion | null; onClose: () => void }) {
  const { usuario } = useAuthDemo();
  const { dossier, agregar, editar } = useDossier();
  const { enLinea } = useSst();
  const toast = useToast();
  const formId = useId();
  const ultima = useRef(edicion);
  if (edicion) ultima.current = edicion;
  const e = edicion ?? ultima.current;
  const [id, setId] = useState('');
  const [nombre, setNombre] = useState('');
  const [detalle, setDetalle] = useState('');
  const [codigo, setCodigo] = useState('');
  const [errorNombre, setErrorNombre] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!edicion) return;
    setId(crypto.randomUUID());
    setNombre(edicion.item?.nombre ?? '');
    setDetalle(edicion.item?.detalle ?? '');
    setCodigo(edicion.item?.documentoCodigo ?? '');
    setErrorNombre('');
    setError('');
  }, [edicion]);

  const cambio = nombre !== (e?.item?.nombre ?? '') || detalle !== (e?.item?.detalle ?? '') || codigo !== (e?.item?.documentoCodigo ?? '');
  const documentos = documentosVigentes(dossier.documentos).sort((a, b) => a.codigo.localeCompare(b.codigo, 'es'));

  function guardar() {
    if (!e || !enLinea) return;
    const datos = { nombre, detalle, documentoCodigo: codigo || undefined };
    const invalido = validarItem(dossier, { ...datos, carpeta: e.carpeta }, e.item?.id);
    setErrorNombre(invalido ?? '');
    setError('');
    if (invalido) return;
    try {
      if (e.item) editar({ itemId: e.item.id, usuario, ...datos });
      else agregar({ id, carpeta: e.carpeta, usuario, ...datos });
      toast.show({ message: e.item ? 'Requisito actualizado.' : `Requisito agregado a la Carpeta ${e.carpeta} en estado ${ESTADOS_REQUISITO[0]}.` });
      onClose();
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo guardar el requisito. Intenta de nuevo.');
    }
  }

  return (
    <Dialog
      open={edicion != null}
      onClose={onClose}
      title={e?.item ? 'Editar requisito' : 'Agregar requisito'}
      description={e && `Carpeta ${e.carpeta} · ${CARPETAS_DOSSIER.find(c => c.numero === e.carpeta)?.nombre}`}
      dirty={cambio}
      footer={(
        <>
          <Button variant="secondary" className="self-start" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form={formId} blocked={!enLinea} blockedReason={SIN_SENAL}>{e?.item ? 'Guardar cambios' : 'Agregar requisito'}</Button>
        </>
      )}
    >
      <form id={formId} noValidate className="flex flex-col gap-gutter-md" onSubmit={event => { event.preventDefault(); guardar(); }}>
        {error && <Banner tone="error">{error}</Banner>}
        <TextField label="Nombre del requisito" required maxLength={120} value={nombre} error={errorNombre}
          hint="Por ejemplo: Certificados de calibración de equipos." onChange={event => setNombre(event.target.value)} />
        <TextArea label="Soporte esperado" rows={2} maxLength={200} value={detalle}
          hint="Opcional. Qué documento debe cargarse en este requisito." onChange={event => setDetalle(event.target.value)} />
        <Select label="Documento del SIG que se debe usar" value={codigo} placeholder="Ninguno" hint="Opcional. Solo aparecen las versiones vigentes."
          options={documentos.map(d => ({ value: d.codigo, label: `${d.codigo} · ${d.nombre} (v${d.version})` }))}
          onChange={event => setCodigo(event.target.value)} />
      </form>
    </Dialog>
  );
}

/** HU-M05 · Confirmación antes de retirar un requisito. El foco inicial queda en «Cancelar». */
function DialogoRetiro({ item, onClose }: { item: ItemChecklist | null; onClose: () => void }) {
  const { usuario } = useAuthDemo();
  const { retirar } = useDossier();
  const { cancelar } = useCargasDossier();
  const { enLinea } = useSst();
  const toast = useToast();
  const ultimo = useRef(item);
  if (item) ultimo.current = item;
  const i = item ?? ultimo.current;
  const [error, setError] = useState('');
  useEffect(() => { if (item) setError(''); }, [item]);

  function confirmar() {
    if (!i || !enLinea) return;
    try {
      retirar({ itemId: i.id, usuario });
      cancelar(i.id); // un archivo en carga ya no tiene requisito al que asociarse
      // La fila desaparece: el foco pasa al título de su carpeta.
      document.getElementById(idCarpeta(i.carpeta))?.focus();
      toast.show({ message: `«${i.nombre}» se retiró de la Carpeta ${i.carpeta}.` });
      onClose();
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo retirar el requisito. Intenta de nuevo.');
    }
  }

  return (
    <Dialog
      open={item != null}
      onClose={onClose}
      title={`¿Retirar «${i?.nombre ?? ''}» de la Carpeta ${i?.carpeta ?? ''}?`}
      description={i?.soporte
        ? `El requisito tiene el soporte «${i.soporte.nombre}» en estado ${i.estado}. Al retirarlo deja de exigirse y de contar en el avance de la carpeta. Queda registrado para la bitácora.`
        : 'El requisito deja de exigirse y de contar en el avance de la carpeta. Queda registrado para la bitácora.'}
      footer={(
        <>
          <Button variant="secondary" className="self-start" data-autofocus onClick={onClose}>Cancelar</Button>
          <Button variant="warning" blocked={!enLinea} blockedReason={SIN_SENAL} onClick={confirmar}>Retirar requisito</Button>
        </>
      )}
    >
      {error && <Banner tone="error">{error}</Banner>}
    </Dialog>
  );
}
