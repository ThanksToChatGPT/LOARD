import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Banner, Button, DateField, FileUpload, PageHeader, Select, StatusBadge, TextField, UploadItem } from '@/components';
import { useAuthDemo } from '@/features/acceso/AuthDemo';
import { HOY_SST } from '@/lib/sst/fechas';
import { useSst } from '@/lib/sst/SstContext';
import { formatoFechaHora } from '@/lib/formato';
import { DetalleItem } from './DetalleItem';
import { useDossier } from './DossierContext';
import { PestanasDossier } from './DossierLayout';
import { JUNTAS_NDT, TIPOS_NDT, registrarArchivoSesion, validarEnsayo, validarPdf, type DatosEnsayo } from './modelo';
import { useCargasSimuladas } from './useCargasSimuladas';

export function EnsayosNdt() {
  const { dossier, error } = useDossier();
  const { usuario } = useAuthDemo();
  const navigate = useNavigate();
  const location = useLocation();
  const [busqueda, setBusqueda] = useState('');
  const [itemId, setItemId] = useState<string | null>(null);
  const ensayos = (dossier.ensayos ?? []).filter(e => `${e.junta} ${e.informe} ${e.laboratorio}`.toLowerCase().includes(busqueda.toLowerCase()));
  return <div className="grid-page gap-y-gutter-lg">
    <PestanasDossier />
    <PageHeader className="col-span-full" title="Ensayos no destructivos" description="Reportes de laboratorio vinculados a juntas soldadas y a la Carpeta 4."
      actions={usuario?.rol === 'calidad' && <Button onClick={() => navigate('/dossier/ensayos/nuevo')}>Registrar ensayo NDT</Button>} />
    {error && <div className="col-span-full"><Banner tone="error">{error}</Banner></div>}
    {location.state?.ensayoRegistrado && <div className="col-span-full"><Banner tone="success" title="Ensayo registrado">El reporte está vinculado a la Carpeta 4 y disponible para revisión documental.</Banner></div>}
    <TextField className="col-span-full" label="Buscar por junta, informe o laboratorio" type="search" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
    <div className="col-span-full flex flex-col gap-gutter-md">
      {!ensayos.length && <section className="card p-gutter-lg"><h2 className="text-title-lg">{busqueda ? 'Sin coincidencias' : 'Aún no hay ensayos registrados'}</h2><p className="mt-gutter-sm text-body-md">{busqueda ? 'Prueba con otra junta, informe o laboratorio.' : 'Calidad puede registrar el primer reporte PDF. El soporte quedará disponible para revisión en la checklist.'}</p></section>}
      {ensayos.map(ensayo => {
        const item = dossier.items.find(i => i.id === ensayo.itemId);
        return <article key={ensayo.id} className="card flex flex-col gap-gutter-md p-gutter-md tablet:flex-row tablet:items-center">
          <div className="min-w-0 flex-1 break-words"><h2 className="text-title-lg">Junta {ensayo.junta} · {ensayo.informe}</h2>
            <p className="text-body-md">{ensayo.tipo} · {ensayo.laboratorio}</p>
            <p className="text-body-sm text-on-surface-muted">Ensayado: {ensayo.fechaEnsayo} · Registrado por {ensayo.registradoPor} · {formatoFechaHora(new Date(ensayo.fechaRegistro))}</p>
            <p className={`text-body-md ${ensayo.resultado === 'No conforme' ? 'text-error' : 'text-success'}`}>Resultado del laboratorio: {ensayo.resultado}</p>
            {ensayo.resultado === 'No conforme' && <p className="text-body-sm">Requiere tratamiento de la junta. Validar el documento no habilita la soldadura.</p>}
          </div>
          {item && !item.retirado ? <><StatusBadge estado={item.estado} /><Button variant="secondary" onClick={() => setItemId(item.id)}>Ver reporte y requisito</Button></> : <p className="text-warning">Requisito retirado · registro conservado</p>}
        </article>;
      })}
    </div>
    <DetalleItem item={dossier.items.find(i => i.id === itemId && !i.retirado) ?? null} onClose={() => setItemId(null)} />
  </div>;
}

const VACIO: DatosEnsayo = { junta: '', laboratorio: '', informe: '', tipo: '', fechaEnsayo: HOY_SST, resultado: 'Conforme' };
interface BorradorNdt { id: string; datos: DatosEnsayo }
function leerBorrador(clave: string): BorradorNdt | null {
  const raw = localStorage.getItem(clave);
  if (!raw) return null;
  const b: unknown = JSON.parse(raw);
  if (typeof b !== 'object' || !b || !('id' in b) || typeof b.id !== 'string' || !('datos' in b) || typeof b.datos !== 'object' || !b.datos ||
    !Object.keys(VACIO).every(k => typeof (b.datos as Record<string, unknown>)[k] === 'string')) throw new Error('El borrador NDT no se pudo leer. Conserva el almacenamiento del navegador antes de restablecerlo.');
  return b as BorradorNdt;
}

export function RegistrarEnsayoNdt() {
  const { usuario } = useAuthDemo();
  const { dossier, error: errorDossier, registrarNdt } = useDossier();
  const { enLinea } = useSst();
  const navigate = useNavigate();
  const clave = `loard_borrador_ndt_${usuario?.correo}`;
  const [inicial] = useState(() => {
    try { return { borrador: leerBorrador(clave), error: '' }; }
    catch (e) { return { borrador: null, error: e instanceof Error ? e.message : 'No se pudo recuperar el borrador.' }; }
  });
  const [id, setId] = useState(() => inicial.borrador?.id ?? crypto.randomUUID());
  const [datos, setDatos] = useState<DatosEnsayo>(inicial.borrador?.datos ?? VACIO);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState(inicial.error);
  const [estado, setEstado] = useState(inicial.borrador ? 'Borrador recuperado. Vuelve a seleccionar el reporte PDF.' : '');
  const [guardando, setGuardando] = useState(false);
  const carga = useCargasSimuladas({ enLinea, conservar: true });
  const reporte = carga.cargas[0];
  function cambiar(campo: keyof DatosEnsayo, valor: string) {
    const siguientes = { ...datos, [campo]: valor };
    setDatos(siguientes);
    if (inicial.error) return;
    try { localStorage.setItem(clave, JSON.stringify({ id, datos: siguientes })); setEstado('Borrador guardado en este navegador. El PDF debe seleccionarse de nuevo si sales.'); }
    catch { setEstado('No se pudo guardar el borrador. Conserva esta pantalla abierta.'); }
  }
  async function guardar() {
    if (guardando || !enLinea || errorDossier || inicial.error) return;
    const rechazo = validarEnsayo(datos, archivo, dossier.ensayos);
    setError(rechazo ?? '');
    if (rechazo || !archivo) return;
    if (reporte?.estado !== 'done') { setError('Espera a que termine la carga simulada del reporte PDF.'); return; }
    setGuardando(true);
    try {
      // Se comprueba el contenido además de la extensión; no se envía el PDF a ningún servidor.
      if (!new TextDecoder().decode(await archivo.slice(0, 5).arrayBuffer()).startsWith('%PDF-')) throw new Error('El archivo no contiene una cabecera PDF válida. Selecciona el reporte original.');
      registrarArchivoSesion(`soporte-${id}`, archivo);
      registrarNdt({ id, datos, archivo, usuario });
      try { localStorage.removeItem(clave); } catch { /* El registro ya se guardó. */ }
      navigate('/dossier/ensayos', { state: { ensayoRegistrado: id } });
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar. Tus datos se conservan; intenta de nuevo.'); }
    finally { setGuardando(false); }
  }
  return <div className="grid-page gap-y-gutter-lg">
    <PestanasDossier />
    <PageHeader className="col-span-full" title="Registrar ensayo NDT" description="Cada informe se conserva por separado y crea un requisito de revisión en la Carpeta 4." />
    <div className="col-span-full"><Banner tone="info">Demostración del 17/11/2026. Los metadatos quedan en este navegador. El PDF original estará disponible durante esta sesión.</Banner></div>
    <form className="card col-span-full flex flex-col gap-gutter-lg p-gutter-md" noValidate onSubmit={e => { e.preventDefault(); void guardar(); }}>
      {(error || errorDossier) && <Banner tone="error" title="Revisa el registro">{error || errorDossier}</Banner>}
      {estado && <p role="status" className="text-body-sm text-on-surface-muted">{estado}</p>}
      <fieldset disabled={guardando} className="grid min-w-0 gap-gutter-md tablet:grid-cols-2">
        <legend className="mb-gutter-md text-title-lg">Informe del laboratorio</legend>
        <Select label="Junta soldada" required value={datos.junta} placeholder="Selecciona una junta" options={JUNTAS_NDT.map(j => ({ value: j, label: `${j} · Frente B` }))} onChange={e => cambiar('junta', e.target.value)} />
        <Select label="Tipo de ensayo" required value={datos.tipo} placeholder="Selecciona el método" options={TIPOS_NDT.map(t => ({ value: t, label: t }))} onChange={e => cambiar('tipo', e.target.value)} />
        <TextField label="Laboratorio" required maxLength={120} value={datos.laboratorio} onChange={e => cambiar('laboratorio', e.target.value)} />
        <TextField label="Número de informe" required maxLength={80} value={datos.informe} onChange={e => cambiar('informe', e.target.value)} />
        <DateField label="Fecha del ensayo" required max={HOY_SST} value={datos.fechaEnsayo} onChange={e => cambiar('fechaEnsayo', e.target.value)} />
        <Select label="Resultado del laboratorio" required value={datos.resultado} options={['Conforme', 'No conforme'].map(r => ({ value: r, label: r }))} onChange={e => cambiar('resultado', e.target.value)} />
        <FileUpload className="tablet:col-span-2" label="Reporte PDF del laboratorio" hint="PDF original, máximo 15 MB. Obligatorio para registrar el ensayo." multiple={false} onFiles={([f]) => { const motivo = validarPdf(f); setError(motivo ?? ''); if (!motivo) { setArchivo(f); carga.iniciar('reporte', f); } }}>
          {reporte && <ul><UploadItem name={reporte.archivo.name} sizeBytes={reporte.archivo.size} status={reporte.estado} progress={reporte.progreso} errorMessage={reporte.error} onCancel={() => { carga.cancelar(); setArchivo(null); }} onRetry={() => carga.reintentar('reporte')} /></ul>}
        </FileUpload>
      </fieldset>
      <div className="flex flex-wrap gap-gutter-md">
        <Button type="submit" loading={guardando} loadingText="Registrando…" blocked={!enLinea || !!errorDossier || !!inicial.error} blockedReason={!enLinea ? 'Recupera la conexión simulada para registrar. El borrador se conserva.' : 'Resuelve el problema de almacenamiento antes de registrar.'}>Registrar y vincular ensayo</Button>
        <Button variant="secondary" onClick={() => navigate('/dossier/ensayos')}>Volver a ensayos</Button>
        <Button variant="ghost" blocked={!!inicial.error || guardando} onClick={() => { try { localStorage.removeItem(clave); setDatos(VACIO); setArchivo(null); carga.cancelar(); setId(crypto.randomUUID()); setEstado('Borrador descartado.'); setError(''); } catch { setError('No se pudo descartar el borrador.'); } }}>Descartar borrador</Button>
      </div>
    </form>
  </div>;
}
