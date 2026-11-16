import { CircleAlert, FileText, MessageSquareWarning, ShieldCheck } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Banner, Button, Chip, Dialog, Drawer, FileUpload, StatusBadge, TextArea, Timeline, UploadItem, useToast } from '@/components';
import { useAuthDemo } from '@/features/acceso/AuthDemo';
import { CARPETAS_DOSSIER, OBSERVACION_MIN_CARACTERES } from '@/lib/constantes';
import { formatoFechaHora, plural } from '@/lib/formato';
import { useSst } from '@/lib/sst/SstContext';
import { useCargasDossier } from './CargasDossier';
import { useDossier } from './DossierContext';
import {
  CAUSAS_OBSERVACION, PDF_AYUDA, formatoTamano, puedeCargar, puedeRevisar, urlArchivoSesion, validarPdf,
  type ItemChecklist, type SoporteItem,
} from './modelo';

/**
 * HU-M06 · Detalle de un requisito de la checklist.
 * Visor lateral desde 1024 px y de pantalla completa en móvil (§7.2). El Residente y Calidad
 * cargan o reemplazan el PDF. Calidad lo valida con «Deshacer» o lo observa con motivo (§6.2B).
 */
export function DetalleItem({ item, onClose }: { item: ItemChecklist | null; onClose: () => void }) {
  const { usuario } = useAuthDemo();
  const { dossier, porValidar, revisar, iniciarValidacion, terminarValidacion } = useDossier();
  const { enLinea } = useSst();
  const toast = useToast();
  const motivoId = useId();
  // El panel conserva el último requisito mientras corre su animación de salida.
  const ultimo = useRef(item);
  if (item) ultimo.current = item;
  const i = item ?? ultimo.current;
  const [observando, setObservando] = useState(false);
  const [errorObservar, setErrorObservar] = useState('');
  const [rechazo, setRechazo] = useState('');

  // La carga vive en la cola del dossier: sigue aunque se cierre este panel.
  const { cargas, iniciar, cancelar, reintentar } = useCargasDossier();
  const carga = cargas.find(c => c.clave === i?.id);

  // Al cerrar el panel o abrir otro requisito se limpian los avisos del anterior.
  const abiertoId = item?.id;
  useEffect(() => { setRechazo(''); setObservando(false); }, [abiertoId]);

  const carpeta = CARPETAS_DOSSIER.find(c => c.numero === i?.carpeta);
  const documento = dossier.documentos.find(d => d.vigente && d.codigo === i?.documentoCodigo);
  const enPlazo = i != null && porValidar.includes(i.id);
  const puedeSubir = puedeCargar(usuario);
  const revisor = puedeRevisar(usuario) && i?.soporte != null && (i.estado === 'Archivo Cargado' || i.estado === 'Validado');
  const bloqueo = !enLinea ? 'Necesitas conexión para validar u observar requisitos.'
    : enPlazo ? 'La validación se confirma en unos segundos. Usa «Deshacer» en el aviso si fue un error.'
    : carga ? 'Espera a que termine la carga del archivo.' : undefined;

  function recibir([archivo]: File[]) {
    const motivo = validarPdf(archivo);
    setRechazo(motivo ?? '');
    if (!motivo && i) iniciar(i.id, archivo);
  }

  function validar() {
    if (!i?.soporte || bloqueo) return;
    const itemId = i.id;
    const soporteEsperado = i.soporte.id;
    iniciarValidacion(itemId);
    onClose();
    toast.showUndo({
      message: `Requisito validado: «${i.nombre}».`,
      // Al terminar los 5 segundos se registra la validación. Antes no hay nada en la bitácora.
      onCommit: () => {
        try { revisar({ itemId, decision: 'Validado', usuario, soporteEsperado }); }
        catch (fallo) { toast.show({ message: fallo instanceof Error ? fallo.message : 'No se pudo registrar la validación. Intenta de nuevo.' }); }
        finally { terminarValidacion(itemId); }
      },
      onUndo: () => terminarValidacion(itemId),
    });
  }

  function observar(texto: string) {
    if (!i?.soporte || bloqueo) return;
    try {
      revisar({ itemId: i.id, decision: 'Observado', observacion: texto, usuario, soporteEsperado: i.soporte.id });
      setObservando(false);
      onClose();
      toast.show({ message: `Requisito observado. ${i.soporte.subidoPor} verá tu observación y podrá reemplazar el archivo.` });
    } catch (fallo) {
      setErrorObservar(fallo instanceof Error ? fallo.message : 'No se pudo registrar la observación. Intenta de nuevo.');
    }
  }

  return (
    <>
      {/* El diálogo va antes del panel: al cerrar ambos, el foco termina en el botón de la lista. */}
      <DialogoObservar open={observando && item != null} nombre={i?.nombre ?? ''} bloqueo={bloqueo} error={errorObservar}
        onClose={() => setObservando(false)} onConfirm={observar} />
      <Drawer
        open={item != null}
        onClose={onClose}
        title={i?.nombre ?? ''}
        meta={carpeta && `Carpeta ${carpeta.numero} · ${carpeta.nombre}`}
        footer={i && revisor && (
          <>
            {bloqueo && <p id={motivoId} className="w-full text-body-sm text-warning">{bloqueo}</p>}
            <Button variant="secondary" icon={<MessageSquareWarning aria-hidden="true" className="h-4 w-4" />} blocked={Boolean(bloqueo)}
              aria-describedby={bloqueo ? motivoId : undefined} onClick={() => { setErrorObservar(''); setObservando(true); }}>Observar requisito</Button>
            {i.estado === 'Archivo Cargado' && (
              <Button icon={<ShieldCheck aria-hidden="true" className="h-4 w-4" />} blocked={Boolean(bloqueo)}
                aria-describedby={bloqueo ? motivoId : undefined} onClick={validar}>Validar requisito</Button>
            )}
          </>
        )}
      >
        {i && (
          <div className="flex flex-col gap-gutter-lg">
            {/* Recibe el foco al abrir: el lector de pantalla empieza por el estado del requisito. */}
            <div tabIndex={-1} data-autofocus className="flex flex-col gap-gutter-sm rounded">
              <div className="flex flex-wrap items-center gap-gutter-sm">
                <StatusBadge estado={i.estado} />
                {enPlazo && <span className="text-body-sm text-on-surface-muted">Validación por confirmar: aún puedes deshacerla.</span>}
              </div>
              {i.detalle && <p className="text-body-md">{i.detalle}</p>}
            </div>

            {i.estado === 'Observado' && i.observacion && (
              <Banner tone="warning" title="Observado por Calidad">
                «{i.observacion}»{puedeSubir && ' Reemplaza el archivo para enviarlo de nuevo a revisión.'}
              </Banner>
            )}
            {documento && (
              <Banner tone="info" title="Documento vigente del SIG">
                Usa <strong className="font-semibold tabular-nums">{documento.codigo} · versión {documento.version}</strong> ({documento.nombre}).
                Las versiones anteriores están obsoletas.
              </Banner>
            )}

            {/* Cada selección nueva borra el rechazo del archivo anterior. */}
            <section className="flex flex-col gap-gutter-sm" onChangeCapture={() => setRechazo('')} onDropCapture={() => setRechazo('')}>
              <h3 className="text-title-lg">Soporte del requisito</h3>
              {i.soporte ? <SoporteActual soporte={i.soporte} /> : <p className="text-body-md text-on-surface-muted">Este requisito aún no tiene soporte.</p>}
              {!puedeSubir && <p className="text-body-sm text-on-surface-muted">Tu perfil consulta la checklist. El Ingeniero Residente y Calidad cargan los soportes.</p>}
              {puedeSubir && (i.estado === 'Validado'
                ? <p className="text-body-sm text-on-surface-muted">{enPlazo ? 'El soporte se podrá cambiar si deshaces la validación.' : 'El requisito está validado y su soporte ya no se cambia. Si necesita corrección, Calidad debe observarlo.'}</p>
                : (
                  <FileUpload label={i.soporte ? 'Reemplazar el soporte PDF' : 'Cargar el soporte PDF'} hint={PDF_AYUDA} multiple={false} size="field" onFiles={recibir}>
                    {carga && (
                      <UploadItem name={carga.archivo.name} sizeBytes={carga.archivo.size} status={carga.estado} progress={carga.progreso}
                        errorMessage={carga.error} size="field" onCancel={() => cancelar(i.id)} onRetry={() => reintentar(i.id)} />
                    )}
                  </FileUpload>
                ))}
              {rechazo && (
                <p role="alert" className="flex items-start gap-gutter-xs text-body-sm text-error">
                  <CircleAlert aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" /><span>{rechazo}</span>
                </p>
              )}
            </section>

            <section className="flex flex-col gap-gutter-sm">
              <h3 className="text-title-lg">Historial del requisito</h3>
              <Timeline label={`Historial de ${i.nombre}`} entries={i.historial.map((e, n) => ({
                id: `${e.fecha}-${n}`, fecha: new Date(e.fecha), usuario: e.usuario, rol: e.rol, estadoAnterior: e.anterior, estadoNuevo: e.nuevo, motivo: e.motivo,
              }))} />
            </section>
          </div>
        )}
      </Drawer>
    </>
  );
}

/** Datos del PDF cargado y su vista previa cuando el archivo se cargó en esta sesión. */
function SoporteActual({ soporte }: { soporte: SoporteItem }) {
  const url = urlArchivoSesion(soporte.id);
  const marco = useRef<HTMLIFrameElement>(null);

  // Con un PDF dañado, el visor del navegador toma el foco al cargar y `Esc` deja de cerrar el panel.
  // Durante el primer segundo, el foco vuelve al contenido del panel.
  useEffect(() => {
    if (!url) return;
    const devolver = () => window.setTimeout(() => {
      if (document.activeElement === marco.current) marco.current?.closest('[role="dialog"]')?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    });
    window.addEventListener('blur', devolver);
    const fin = window.setTimeout(() => window.removeEventListener('blur', devolver), 1000);
    return () => { window.clearTimeout(fin); window.removeEventListener('blur', devolver); };
  }, [url]);

  return (
    <div className="flex flex-col gap-gutter-sm">
      <div className="flex items-start gap-gutter-sm">
        <FileText aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-on-surface-muted" />
        <div className="min-w-0">
          <p className="break-words text-title-md">{soporte.nombre}</p>
          <p className="text-body-sm tabular-nums text-on-surface-muted">
            {formatoTamano(soporte.bytes)} · Cargado por {soporte.subidoPor} ({soporte.rol}) el {formatoFechaHora(new Date(soporte.fecha))}
          </p>
        </div>
      </div>
      {url
        ? <iframe ref={marco} title={`Soporte: ${soporte.nombre}`} src={url} className="h-[60vh] w-full rounded-md border border-outline-variant" />
        : (
          <p className="sf-low rounded-md border border-outline-variant p-gutter-md text-body-sm text-on-surface-muted">
            Vista previa no disponible: el prototipo conserva los datos del soporte, pero no el archivo. Los PDF que cargues en esta sesión se ven aquí.
          </p>
        )}
    </div>
  );
}

/** «Observar requisito» (§6.2B): motivo obligatorio de 10 caracteres, con causas frecuentes. */
function DialogoObservar({ open, nombre, bloqueo, error, onClose, onConfirm }: {
  open: boolean; nombre: string; bloqueo?: string; error: string; onClose: () => void; onConfirm: (texto: string) => void;
}) {
  const [texto, setTexto] = useState('');
  useEffect(() => { if (open) setTexto(''); }, [open]);

  const alternar = (causa: string) => setTexto(actual => (actual.includes(`${causa}. `)
    ? actual.replace(`${causa}. `, '')
    : `${actual && !actual.endsWith(' ') ? `${actual} ` : actual}${causa}. `));
  const faltan = Math.max(0, OBSERVACION_MIN_CARACTERES - texto.trim().length);
  const motivo = bloqueo ?? (faltan > 0 ? `Escribe el motivo: ${faltan === 1 ? 'falta' : 'faltan'} ${plural(faltan, 'carácter', 'caracteres')} para confirmar.` : undefined);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Observar «${nombre}»`}
      description="Quien cargó el soporte verá tu observación y podrá reemplazar el archivo."
      dirty={texto.trim().length > 0}
      discardQuestion="¿Descartar la observación escrita?"
      discardLabel="Descartar observación"
      keepLabel="Seguir escribiendo"
      footer={(
        <>
          <Button variant="secondary" className="self-start" onClick={onClose}>Cancelar</Button>
          <Button variant="warning" blocked={motivo != null} blockedReason={motivo} onClick={() => onConfirm(texto)}>Confirmar observación</Button>
        </>
      )}
    >
      {error && <Banner tone="error">{error}</Banner>}
      <TextArea label="Motivo de la observación" required minCharacters={OBSERVACION_MIN_CARACTERES} maxLength={500}
        hint="Explica qué se debe corregir." value={texto} onChange={event => setTexto(event.target.value)} />
      <div role="group" aria-label="Causas frecuentes (opcional)" className="flex flex-col gap-gutter-sm">
        <span aria-hidden="true" className="text-label-lg">Causas frecuentes (opcional)</span>
        <div className="flex flex-wrap gap-gutter-sm">
          {CAUSAS_OBSERVACION.map(causa => <Chip key={causa} selected={texto.includes(`${causa}. `)} onClick={() => alternar(causa)}>{causa}</Chip>)}
        </div>
      </div>
    </Dialog>
  );
}
