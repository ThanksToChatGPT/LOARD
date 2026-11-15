import { CircleAlert, CircleCheck, Download, Eye, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Banner, Button, Drawer, FileUpload, UploadItem, useToast, type UploadStatus } from '@/components';
import { useAuthDemo } from '@/features/acceso/AuthDemo';
import { formatoFechaHora } from '@/lib/formato';
import { useSst } from '@/lib/sst/SstContext';
import { useCortesDemo } from './CortesDemoContext';
import type { CorteDemo } from './modeloDemo';
import {
  esDuplicado, formatoTamano, motivoSinPermisoSoportes, registrarUrlSoporte, resumenSoportes,
  soportesActivos, tipoSoporte, urlSoporte, type SoporteDemo,
} from './soportes';

interface Subida {
  clave: string;
  archivo: File;
  url: string;
  estado: UploadStatus;
  progreso: number;
  error?: string;
}

/**
 * HU-M03 · Fotografías y PDF del corte.
 * El residente autor agrega y retira soportes mientras el corte no esté visado.
 * Los demás perfiles los consultan en el mismo lugar (criterio 5).
 */
export function SoportesCorte({ corte }: { corte: CorteDemo }) {
  const { usuario } = useAuthDemo();
  const { soportes, errorSoportes, agregarSoporte, retirarSoporte } = useCortesDemo();
  const { enLinea } = useSst();
  const toast = useToast();
  const tituloId = useId();
  const titulo = useRef<HTMLHeadingElement>(null);
  const [subidas, setSubidas] = useState<Subida[]>([]);
  const [ocultos, setOcultos] = useState<string[]>([]);
  const [recientes, setRecientes] = useState<string[]>([]);
  const [repetidos, setRepetidos] = useState<string[]>([]);
  const [abierto, setAbierto] = useState<SoporteDemo | null>(null);

  const motivo = motivoSinPermisoSoportes(corte, usuario);
  const puedeModificar = motivo === null;
  const esAutor = usuario?.rol === 'residente' && usuario.correo === corte.autorCorreo;
  const activos = soportesActivos(soportes, corte.id).filter(s => !ocultos.includes(s.id));

  // Los temporizadores leen siempre los valores más recientes sin reiniciarse en cada render.
  const actual = useRef({ subidas, corte, usuario, agregarSoporte });
  useEffect(() => { actual.current = { subidas, corte, usuario, agregarSoporte }; });

  // Progreso simulado de cada archivo hacia el almacenamiento (§7.2).
  const hayCarga = subidas.some(s => s.estado === 'uploading');
  useEffect(() => {
    if (!hayCarga) return;
    const t = window.setTimeout(() => setSubidas(lista => lista.map((s): Subida => {
      if (s.estado !== 'uploading') return s;
      const progreso = Math.min(100, s.progreso + 9 + Math.random() * 14);
      return { ...s, progreso, estado: progreso >= 100 ? 'confirming' : 'uploading' };
    })), 180);
    return () => window.clearTimeout(t);
  }, [subidas, hayCarga]);

  // Sin señal, los archivos esperan en cola y siguen solos al volver la conexión (§8.3).
  useEffect(() => {
    setSubidas(lista => lista.map((s): Subida => {
      if (!enLinea && (s.estado === 'uploading' || s.estado === 'confirming')) return { ...s, estado: 'queued' };
      if (enLinea && s.estado === 'queued') return { ...s, estado: 'uploading' };
      return s;
    }));
  }, [enLinea]);

  // «Confirmando carga…»: se asocia el archivo al corte y pasa a la lista de soportes.
  const confirmando = subidas.find(s => s.estado === 'confirming')?.clave;
  useEffect(() => {
    if (!confirmando) return;
    const t = window.setTimeout(() => {
      const { subidas: lista, corte: vigente, usuario: autor, agregarSoporte: agregar } = actual.current;
      const subida = lista.find(s => s.clave === confirmando);
      if (!subida || subida.estado !== 'confirming') return;
      try {
        const soporte = agregar({ id: subida.clave, corte: vigente, archivo: subida.archivo, usuario: autor });
        registrarUrlSoporte(soporte.id, subida.url);
        setRecientes(ids => [...ids, soporte.id]);
        setSubidas(items => items.filter(s => s.clave !== confirmando));
      } catch (fallo) {
        const mensaje = fallo instanceof Error ? fallo.message : 'No se pudo asociar el archivo al corte. Oprime «Reintentar».';
        setSubidas(items => items.map((s): Subida => (s.clave === confirmando ? { ...s, estado: 'error', error: mensaje } : s)));
      }
    }, 700);
    return () => window.clearTimeout(t);
  }, [confirmando]);

  // Aviso del navegador si se intenta salir con archivos sin confirmar (§8.2).
  const pendientes = subidas.some(s => s.estado !== 'error');
  useEffect(() => {
    if (!pendientes) return;
    const avisar = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [pendientes]);

  // Al salir de la pantalla se liberan los archivos que no alcanzaron a confirmarse.
  useEffect(() => () => actual.current.subidas.forEach(s => URL.revokeObjectURL(s.url)), []);

  function recibir(archivos: File[]) {
    const conocidos = [
      ...activos.map(s => ({ nombre: s.nombre, bytes: s.bytes })),
      ...subidas.map(s => ({ nombre: s.archivo.name, bytes: s.archivo.size })),
    ];
    const nuevos: Subida[] = [];
    const avisos: string[] = [];
    for (const archivo of archivos) {
      if (esDuplicado(conocidos, archivo)) { avisos.push(`«${archivo.name}» ya está adjunto a este corte.`); continue; }
      conocidos.push({ nombre: archivo.name, bytes: archivo.size });
      nuevos.push({ clave: crypto.randomUUID(), archivo, url: URL.createObjectURL(archivo), estado: enLinea ? 'uploading' : 'queued', progreso: 0 });
    }
    setRepetidos(avisos);
    if (nuevos.length) setSubidas(lista => [...lista, ...nuevos]);
  }

  function cancelar(clave: string) {
    const subida = subidas.find(s => s.clave === clave);
    if (subida) URL.revokeObjectURL(subida.url);
    setSubidas(lista => lista.filter(s => s.clave !== clave));
  }

  function reintentar(clave: string) {
    setSubidas(lista => lista.map((s): Subida => (s.clave === clave ? { ...s, estado: enLinea ? 'uploading' : 'queued', progreso: 0, error: undefined } : s)));
  }

  function quitar(soporte: SoporteDemo) {
    const mostrar = () => setOcultos(ids => ids.filter(id => id !== soporte.id));
    setOcultos(ids => [...ids, soporte.id]);
    titulo.current?.focus();
    toast.showUndo({
      message: `«${soporte.nombre}» se retiró del Corte #${corte.numero}.`,
      onCommit: () => {
        try { retirarSoporte({ corte, soporteId: soporte.id, usuario }); }
        catch (fallo) { toast.show({ message: fallo instanceof Error ? fallo.message : 'No se pudo retirar el soporte. Intenta de nuevo.' }); }
        mostrar();
      },
      onUndo: mostrar,
    });
  }

  const vacio = puedeModificar
    ? 'Este corte aún no tiene soportes. Agrega fotografías o PDF del periodo.'
    : esAutor ? 'Este corte no tiene soportes.' : 'El residente no adjuntó soportes en este corte.';

  return (
    <section aria-labelledby={tituloId} className="card flex flex-col gap-gutter-md p-gutter-md">
      <div className="flex flex-wrap items-baseline justify-between gap-gutter-sm">
        <h2 id={tituloId} ref={titulo} tabIndex={-1} className="text-headline-sm">Soportes del corte</h2>
        <span className="text-body-md tabular-nums text-on-surface-muted">{resumenSoportes(activos)}</span>
      </div>
      {errorSoportes && <Banner tone="error">{errorSoportes}</Banner>}
      {esAutor && motivo && <Banner tone="info">{motivo}</Banner>}

      {activos.length > 0 ? (
        <ul className="flex flex-col gap-gutter-sm">
          {activos.map(soporte => (
            <ItemSoporte key={soporte.id} soporte={soporte} reciente={recientes.includes(soporte.id)} puedeQuitar={puedeModificar}
              onVer={() => setAbierto(soporte)} onQuitar={() => quitar(soporte)} />
          ))}
        </ul>
      ) : (
        <p className="text-body-md text-on-surface-muted">{vacio}</p>
      )}

      {puedeModificar && (
        <FileUpload label="Agregar fotografías o PDF" onFiles={recibir}>
          {subidas.length > 0 ? subidas.map(s => (
            <UploadItem key={s.clave} name={s.archivo.name} sizeBytes={s.archivo.size} status={s.estado} progress={s.progreso}
              errorMessage={s.error} onCancel={() => cancelar(s.clave)} onRetry={() => reintentar(s.clave)} />
          )) : undefined}
        </FileUpload>
      )}
      {repetidos.length > 0 && (
        <ul role="alert" className="flex flex-col gap-gutter-xs">
          {repetidos.map(aviso => (
            <li key={aviso} className="flex items-start gap-gutter-xs text-body-sm text-warning">
              <CircleAlert aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" />
              <span>{aviso} No se volvió a cargar.</span>
            </li>
          ))}
        </ul>
      )}

      <VisorSoporte soporte={abierto} onClose={() => setAbierto(null)} />
    </section>
  );
}

function ItemSoporte({ soporte, reciente, puedeQuitar, onVer, onQuitar }: {
  soporte: SoporteDemo; reciente: boolean; puedeQuitar: boolean; onVer: () => void; onQuitar: () => void;
}) {
  const url = urlSoporte(soporte);
  const foto = tipoSoporte(soporte) === 'foto';
  const Icono = foto ? ImageIcon : FileText;
  return (
    <li className="sf-container flex flex-col gap-gutter-sm rounded-md border border-outline-variant p-3 tablet:flex-row tablet:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-gutter-sm">
        {foto && url
          ? <img src={url} alt="" className="h-12 w-12 shrink-0 rounded border border-outline-variant object-cover" />
          : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-outline-variant"><Icono aria-hidden="true" className="h-5 w-5 text-on-surface-muted" /></span>}
        <div className="min-w-0">
          <p className="break-words text-title-md">{soporte.nombre}</p>
          <p className="text-body-sm tabular-nums text-on-surface-muted">
            {foto ? 'Fotografía' : 'PDF'} · {formatoTamano(soporte.bytes)} · {soporte.subidoPor} · {formatoFechaHora(new Date(soporte.fecha))}
          </p>
          {reciente && (
            <p role="status" className="flex items-center gap-gutter-xs text-body-sm text-success">
              <CircleCheck aria-hidden="true" className="h-4 w-4 shrink-0" />Archivo cargado
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-gutter-sm">
        <Button variant="secondary" icon={<Eye className="h-4 w-4" />} aria-label={`Ver ${soporte.nombre}`} onClick={onVer}>Ver</Button>
        {puedeQuitar && <Button variant="ghost" icon={<Trash2 className="h-4 w-4" />} aria-label={`Quitar ${soporte.nombre}`} onClick={onQuitar}>Quitar</Button>}
      </div>
    </li>
  );
}

function descargar(url: string, nombre: string) {
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
}

/** Visor lateral desde 1024 px y de pantalla completa en móvil (§7.2). Al cerrar, el foco vuelve a «Ver». */
function VisorSoporte({ soporte, onClose }: { soporte: SoporteDemo | null; onClose: () => void }) {
  const ultimo = useRef(soporte);
  if (soporte) ultimo.current = soporte;
  const s = soporte ?? ultimo.current;
  const url = s ? urlSoporte(s) : undefined;
  return (
    <Drawer
      open={soporte != null}
      onClose={onClose}
      title={s?.nombre ?? ''}
      meta={s && <span className="tabular-nums">Cargado por {s.subidoPor} ({s.rol}) el {formatoFechaHora(new Date(s.fecha))} · {formatoTamano(s.bytes)}</span>}
      footer={s && <>
        {url && <Button variant="secondary" icon={<Download className="h-4 w-4" />} onClick={() => descargar(url, s.nombre)}>Descargar</Button>}
        <Button onClick={onClose}>Cerrar visor</Button>
      </>}
    >
      {s && (url ? (
        tipoSoporte(s) === 'foto'
          ? <img src={url} alt={`Fotografía del corte: ${s.nombre}`} className="mx-auto max-w-full rounded-md border border-outline-variant" />
          : <iframe title={`Documento del corte: ${s.nombre}`} src={url} className="h-[70vh] w-full rounded-md border border-outline-variant" />
      ) : (
        <Banner tone="info" title="Vista previa no disponible">
          Este archivo se cargó antes de recargar la demostración. El prototipo conserva sus datos, pero no el archivo.
          Vuelve a seleccionarlo si necesitas verlo.
        </Banner>
      ))}
    </Drawer>
  );
}
