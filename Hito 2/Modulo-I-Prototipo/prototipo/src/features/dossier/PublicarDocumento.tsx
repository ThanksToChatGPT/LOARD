import { CircleAlert, FileCheck2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Banner, Button, FileUpload, FormLayout, PageHeader, Select, TextArea, TextField, UploadItem, useToast } from '@/components';
import { useAuthDemo } from '@/features/acceso/AuthDemo';
import { Volver } from '@/features/sst/componentes';
import { CARPETAS_DOSSIER, OBSERVACION_MIN_CARACTERES } from '@/lib/constantes';
import { useSst } from '@/lib/sst/SstContext';
import { useDossier } from './DossierContext';
import { PDF_AYUDA, documentosVigentes, normalizarCodigo, validarDocumento, validarPdf, type ErroresDocumento } from './modelo';
import { useCargasSimuladas } from './useCargasSimuladas';

const LISTA = '/dossier/documentos';
const CAMPOS = ['codigo', 'nombre', 'version', 'carpeta', 'nota'] as const;

/**
 * HU-M05 · Publicar un documento del SIG con código, nombre y versión.
 * Si el código ya existe se publica como versión nueva: la anterior pasa al historial.
 */
export function PublicarDocumento() {
  const { usuario } = useAuthDemo();
  const { dossier, publicar } = useDossier();
  const { enLinea } = useSst();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const vigentes = documentosVigentes(dossier.documentos);
  // «Nueva versión» desde la lista llega con el código: se proponen sus datos y la versión siguiente.
  const [base] = useState(() => vigentes.find(d => d.codigo === normalizarCodigo(params.get('codigo') ?? '')));
  const [id] = useState(() => crypto.randomUUID());
  const [codigo, setCodigo] = useState(base?.codigo ?? '');
  const [nombre, setNombre] = useState(base?.nombre ?? '');
  const [version, setVersion] = useState(base ? String(base.version + 1) : '1');
  const [carpeta, setCarpeta] = useState(base ? String(base.carpeta) : '');
  const [nota, setNota] = useState('');
  const [errores, setErrores] = useState<ErroresDocumento>({});
  const [general, setGeneral] = useState('');
  const [publicando, setPublicando] = useState(false);
  const { cargas, iniciar, cancelar, reintentar } = useCargasSimuladas({ enLinea, conservar: true });
  const carga = cargas.at(0);

  const vigente = vigentes.find(d => d.codigo === normalizarCodigo(codigo));

  /** Pone o retira el mensaje de un campo. Al corregir el campo, su error desaparece. */
  const ponerError = (campo: keyof ErroresDocumento, mensaje?: string) => setErrores(actuales => ({ ...actuales, [campo]: mensaje }));

  function cambiarCodigo(valor: string) {
    setCodigo(valor);
    ponerError('codigo');
    const existente = vigentes.find(d => d.codigo === normalizarCodigo(valor));
    if (!existente) return;
    // El código ya existe: se propone la versión siguiente y se completan los campos vacíos.
    if (!nombre.trim()) setNombre(existente.nombre);
    if (!carpeta) setCarpeta(String(existente.carpeta));
    if (!(Number(version) > existente.version)) { setVersion(String(existente.version + 1)); ponerError('version'); }
  }

  function recibir([archivo]: File[]) {
    const rechazo = validarPdf(archivo);
    if (rechazo) ponerError('archivo', rechazo);
    else iniciar('documento', archivo);
  }

  // Cuando el PDF termina de cargar ya no aplica «Espera a que termine la carga».
  const cargado = carga?.estado === 'done';
  useEffect(() => { if (cargado) ponerError('archivo'); }, [cargado]);

  async function enviar() {
    if (publicando || !enLinea) return;
    const datos = { codigo, nombre, version: Number(version), carpeta: Number(carpeta), nota, archivo: carga?.estado === 'done' ? carga.archivo : null };
    const e = validarDocumento(dossier.documentos, datos);
    if (carga && carga.estado !== 'done') e.archivo = carga.estado === 'error' ? 'El PDF no se cargó. Oprime «Reintentar» o selecciona otro archivo.' : 'Espera a que termine la carga del PDF.';
    setErrores(e);
    setGeneral('');
    const primero = CAMPOS.find(campo => e[campo]);
    if (primero) { document.getElementById(`doc-${primero}`)?.focus(); return; }
    if (e.archivo) return;
    setPublicando(true);
    await new Promise(resolve => window.setTimeout(resolve, 400));
    try {
      const publicado = publicar({ id, usuario, ...datos });
      toast.show({ message: vigente
        ? `${publicado.codigo} versión ${publicado.version} publicada. La versión ${vigente.version} quedó en el historial.`
        : `${publicado.codigo} versión ${publicado.version} publicada como documento vigente.` });
      navigate(LISTA);
    } catch (fallo) {
      setGeneral(fallo instanceof Error ? fallo.message : 'No se pudo publicar el documento. Intenta de nuevo.');
      setPublicando(false);
    }
  }

  return (
    <FormLayout
      onSubmit={enviar}
      header={(
        <>
          <Volver to={LISTA}>Documentos del SIG</Volver>
          <PageHeader title="Publicar documento del SIG" description="La versión que publiques será la vigente para todo el equipo." />
        </>
      )}
      footer={(
        <>
          <Button variant="secondary" className="self-start" onClick={() => navigate(LISTA)}>Cancelar</Button>
          <Button type="submit" icon={<FileCheck2 aria-hidden="true" className="h-4 w-4" />} loading={publicando} loadingText="Publicando documento…"
            blocked={!enLinea} blockedReason="Necesitas conexión para publicar documentos.">Publicar documento</Button>
        </>
      )}
    >
      {general && <Banner tone="error" title="No se pudo publicar">{general}</Banner>}
      {vigente && (
        <Banner tone="info" title={`${vigente.codigo} ya tiene vigente la versión ${vigente.version}`}>
          Al publicar, la versión {vigente.version} de «{vigente.nombre}» deja de ser vigente y se conserva en el historial.
        </Banner>
      )}
      <section className="card flex flex-col gap-gutter-md p-gutter-md">
        <div className="grid gap-gutter-md tablet:grid-cols-2">
          <TextField id="doc-codigo" label="Código" required maxLength={20} autoComplete="off" value={codigo} error={errores.codigo}
            hint="Por ejemplo GT-FR64. Si ya existe, se publica como versión nueva." onChange={event => cambiarCodigo(event.target.value)} />
          <TextField id="doc-version" label="Versión" required type="number" inputMode="numeric" min={1} step={1} inputClassName="tabular-nums" value={version}
            error={errores.version} hint={vigente ? `Mayor que la vigente (v${vigente.version}).` : 'Número entero desde 1.'} onChange={event => { setVersion(event.target.value); ponerError('version'); }} />
        </div>
        <TextField id="doc-nombre" label="Nombre del documento" required maxLength={120} value={nombre} error={errores.nombre}
          onChange={event => { setNombre(event.target.value); ponerError('nombre'); }} />
        <Select id="doc-carpeta" label="Carpeta del dossier donde se usa" required placeholder="Selecciona una carpeta" value={carpeta} error={errores.carpeta}
          options={CARPETAS_DOSSIER.map(c => ({ value: String(c.numero), label: `Carpeta ${c.numero} · ${c.nombre}` }))} onChange={event => { setCarpeta(event.target.value); ponerError('carpeta'); }} />
        <TextArea id="doc-nota" label="Qué cambió en esta versión" rows={3} maxLength={300} required={Boolean(vigente)} value={nota} error={errores.nota}
          minCharacters={vigente ? OBSERVACION_MIN_CARACTERES : undefined} hint={vigente ? 'Queda en el historial del documento.' : 'Opcional en la primera versión.'}
          onChange={event => { setNota(event.target.value); ponerError('nota'); }} />
      </section>
      {/* Cada selección nueva borra el rechazo del archivo anterior. */}
      <section className="card flex flex-col gap-gutter-sm p-gutter-md" onChangeCapture={() => ponerError('archivo')} onDropCapture={() => ponerError('archivo')}>
        <FileUpload label="Archivo PDF del documento" hint={PDF_AYUDA} multiple={false} onFiles={recibir}>
          {carga && (
            <UploadItem name={carga.archivo.name} sizeBytes={carga.archivo.size} status={carga.estado} progress={carga.progreso}
              errorMessage={carga.error} onCancel={() => cancelar()} onRetry={() => reintentar('documento')} />
          )}
        </FileUpload>
        {cargado && <Button variant="ghost" className="self-start" onClick={() => cancelar()}>Quitar archivo</Button>}
        {errores.archivo && (
          <p role="alert" className="flex items-start gap-gutter-xs text-body-sm text-error">
            <CircleAlert aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" /><span>{errores.archivo}</span>
          </p>
        )}
      </section>
    </FormLayout>
  );
}
