import { Save } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Banner, Button, DateField, FormLayout, PageHeader, Select, TextArea, TextField, useToast } from '@/components';
import { useAuthDemo } from '@/features/acceso/AuthDemo';
import { Volver } from '@/features/sst/componentes';
import { useSst } from '@/lib/sst/SstContext';
import { esAsignable } from '@/lib/semaforo';
import { formatoFechaHora, plural } from '@/lib/formato';
import { useCortesDemo } from './CortesDemoContext';
import { ACTIVIDADES_DEMO, CIUDADES_DEMO, CLIENTES_DEMO, FRENTES_DEMO, INSUMOS_DEMO, MOTIVO_CORTE_VISADO, esEditable, formularioVacio, validarCorteDemo, type CorteDemo, type FormularioCorteDemo } from './modeloDemo';
import { RecursosCorte } from './RecursosCorte';
import { registrarUrlSoporte } from './soportes';
import { SoportesCorte } from './SoportesCorte';
import { SoportesPorGuardar, type SoportePendiente } from './SoportesPorGuardar';
import { SelectorPersonal } from './SelectorPersonal';
import { useBorradorDemo } from './useBorradorDemo';

export function FormularioCorte() {
  const { id } = useParams();
  const { cortes, error } = useCortesDemo();
  const { usuario } = useAuthDemo();
  const corte = cortes.find(item => item.id === id);
  if (!usuario || usuario.rol !== 'residente') return <Banner tone="warning" title="Acceso de consulta">El perfil Residente registra y edita los cortes de ejemplo.</Banner>;
  if (id && (!corte || corte.autorCorreo !== usuario.correo)) return <Banner tone="warning" title="Corte no disponible">Abre un corte propio desde la lista.</Banner>;
  if (corte && !esEditable(corte)) return <div className="flex flex-col gap-gutter-md"><Volver to={`/cortes/${corte.id}`}>Corte #{corte.numero}</Volver>
    <Banner tone="info" title={`Corte #${corte.numero} visado`}>{MOTIVO_CORTE_VISADO}</Banner></div>;
  if (error) return <Banner tone="error">{error}</Banner>;
  return <EditorCorte key={id ?? 'nuevo'} corte={corte} />;
}

function EditorCorte({ corte }: { corte?: CorteDemo }) {
  const { usuario } = useAuthDemo();
  const { guardar, agregarSoporte } = useCortesDemo();
  const { filas } = useSst();
  const navigate = useNavigate();
  const toast = useToast();
  const [datos, setDatos] = useState<FormularioCorteDemo>(() => structuredClone(corte?.versiones[0].datos ?? formularioVacio()));
  const [solicitud, setSolicitud] = useState<string>(() => crypto.randomUUID());
  const [motivo, setMotivo] = useState('');
  const [sucio, setSucio] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [version] = useState(() => corte?.versiones[0].version ?? 0);
  // Fotografías y PDF elegidos antes de guardar un corte nuevo: se asocian al corte al guardarlo.
  const [adjuntos, setAdjuntos] = useState<SoportePendiente[]>([]);
  const sinAsociar = useRef(adjuntos);
  useEffect(() => () => sinAsociar.current.forEach(item => URL.revokeObjectURL(item.url)), []);
  function cambiarAdjuntos(lista: SoportePendiente[]) { sinAsociar.current = lista; setAdjuntos(lista); }
  const contenido = useMemo(() => ({ datos, solicitud, motivo, version }), [datos, solicitud, motivo, version]);
  const borrador = useBorradorDemo(`loard_prototipo_borrador_${usuario!.correo}_${corte?.id ?? 'nuevo'}`, contenido, sucio);
  const bloqueados = datos.personal.map(row => filas.find(fila => fila.trabajador.id === row.id))
    .filter(fila => !fila || !esAsignable(fila.evaluacion.estado));
  function cambiar(patch: Partial<FormularioCorteDemo>) { setDatos(actual => ({ ...actual, ...patch })); setSucio(true); }
  function cambiarPersonal(id: string, marcado: boolean) {
    cambiar({ personal: marcado ? [...datos.personal.filter(row => row.id !== id), { id, cantidad: '' }] : datos.personal.filter(row => row.id !== id) });
  }
  async function enviar(event: FormEvent) {
    event.preventDefault();
    if (guardando || borrador.pendiente) return;
    setError('');
    const validacion = validarCorteDemo(datos);
    if (validacion || bloqueados.length || (corte && motivo.trim().length < 10)) {
      setError(validacion || (bloqueados.length ? 'Retira los trabajadores bloqueados por SST antes de guardar.' : 'Escribe un motivo de al menos 10 caracteres.'));
      return;
    }
    setGuardando(true);
    await new Promise(resolve => window.setTimeout(resolve, 350));
    try {
      const saved = guardar({ id: corte?.id ?? solicitud, anterior: corte, datos, usuario: usuario!, motivo, versionEsperada: version });
      borrador.completar();
      setSucio(false);
      const fallidos: SoportePendiente[] = [];
      for (const item of adjuntos) {
        try {
          const soporte = agregarSoporte({ id: item.clave, corte: saved, archivo: item.archivo, usuario: usuario! });
          registrarUrlSoporte(soporte.id, item.url);
        } catch { fallidos.push(item); }
      }
      // Los archivos ya asociados conservan su vista previa; los que fallaron se liberan al salir.
      cambiarAdjuntos(fallidos);
      const cargados = adjuntos.length - fallidos.length;
      toast.show({ message: corte ? `Corte #${saved.numero} de ejemplo guardado. Versión ${saved.versiones[0].version}.`
        : fallidos.length ? `Corte #${saved.numero} de ejemplo guardado. No se pudo adjuntar: ${fallidos.map(item => `«${item.archivo.name}»`).join(', ')}. Agrégalo de nuevo en «Soportes del corte».`
        : cargados ? `Corte #${saved.numero} de ejemplo guardado con ${plural(cargados, 'soporte', 'soportes')}.`
        : `Corte #${saved.numero} de ejemplo guardado. Puedes agregar fotografías y PDF en «Soportes del corte».` });
      navigate(`/cortes/${saved.id}`, { replace: true });
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo guardar el ejemplo. Intenta de nuevo.'); }
    finally { setGuardando(false); }
  }
  const puedeRecuperar = borrador.pendiente?.version === version;
  return <FormLayout onSubmit={enviar} status={borrador.estado || 'Los cambios se conservan como borrador local mientras completas el corte.'}
    header={<div className="flex flex-col gap-gutter-md"><Volver to={corte ? `/cortes/${corte.id}` : '/cortes'}>Cortes de obra</Volver>
      <PageHeader title={corte ? `Editar corte #${corte.numero}` : 'Registrar corte de obra'} description="Cantidades ejecutadas, horas por trabajador e insumos del periodo." /></div>}
    footer={<><Button variant="secondary" blocked={guardando} blockedReason="Espera a que termine el guardado de ejemplo." onClick={() => navigate('/cortes')}>Volver a cortes</Button>
      <Button type="submit" size="field" icon={<Save className="h-4 w-4" />} loading={guardando} loadingText="Guardando corte…"
        blocked={Boolean(borrador.pendiente) || bloqueados.length > 0} blockedReason={bloqueados.length ? 'Retira los trabajadores bloqueados por SST.' : 'Recupera o descarta el borrador antes de continuar.'}>
        {corte ? 'Guardar nueva versión' : 'Guardar corte de ejemplo'}</Button></>}
  >
    {borrador.pendiente && <Banner tone="info" title={`Hay un borrador del ${formatoFechaHora(new Date(borrador.pendiente.fecha))}`}
      actions={<div className="flex flex-wrap gap-gutter-sm">{puedeRecuperar && <Button variant="secondary" onClick={() => {
        setDatos(borrador.pendiente!.datos); setSolicitud(borrador.pendiente!.solicitud); setMotivo(borrador.pendiente!.motivo); setSucio(true); borrador.continuar();
      }}>Continuar editando</Button>}<Button variant="ghost" onClick={() => { try { borrador.descartar(); } catch { setError('No se pudo descartar el borrador del navegador.'); } }}>Descartar borrador</Button></div>}>
      {puedeRecuperar ? 'Recupera los campos guardados en este navegador.' : 'El corte tiene una versión más reciente. Conserva el borrador antes de descartarlo.'}
    </Banner>}
    {corte?.versiones[0].estado === 'Devuelto con Observaciones' && <Banner tone="warning" title={`Observación de ${corte.versiones[0].autor}`}>
      <span className="whitespace-pre-wrap">«{corte.versiones[0].motivo}»</span></Banner>}
    {error && <Banner tone="error" title="Revisa el corte">{error}</Banner>}
    <fieldset disabled={guardando || Boolean(borrador.pendiente)} className="flex min-w-0 flex-col gap-gutter-lg">
      <section className="card flex flex-col gap-gutter-md p-gutter-md"><h2 className="text-headline-sm">Información del corte</h2>
        <Select label="Frente de obra" value={datos.frente} options={FRENTES_DEMO.map(value => ({ value, label: value }))} onChange={event => cambiar({ frente: event.target.value })} />
        <div className="grid grid-cols-1 gap-gutter-md tablet:grid-cols-2"><Select label="Ciudad" required placeholder="Selecciona la ciudad" value={datos.ciudad ?? ''} options={CIUDADES_DEMO.map(value => ({ value, label: value }))} onChange={event => cambiar({ ciudad: event.target.value })} />
          <Select label="Cliente" required placeholder="Selecciona el cliente" value={datos.cliente ?? ''} options={CLIENTES_DEMO.map(value => ({ value, label: value }))} onChange={event => cambiar({ cliente: event.target.value })} /></div>
        <div className="grid grid-cols-1 gap-gutter-md tablet:grid-cols-2"><DateField label="Inicio del periodo" required value={datos.inicio} onChange={event => cambiar({ inicio: event.target.value })} />
          <DateField label="Fin del periodo" required value={datos.fin} min={datos.inicio} onChange={event => cambiar({ fin: event.target.value })} /></div>
      </section>
      <RecursosCorte titulo="Actividades ejecutadas" etiqueta="Actividad" valorLabel="Cantidad ejecutada" opciones={ACTIVIDADES_DEMO} filas={datos.actividades} onChange={actividades => cambiar({ actividades })} permitePropia entero />
      <SelectorPersonal seleccionados={datos.personal.map(row => row.id)} onCambiar={cambiarPersonal} />
      <section className="card flex flex-col gap-gutter-md p-gutter-md"><h2 className="text-headline-sm">Horas-hombre del periodo</h2>
        {!datos.personal.length && <p className="text-body-md text-on-surface-muted">Selecciona trabajadores habilitados para registrar sus horas.</p>}
        {datos.personal.map((row, index) => <TextField key={row.id} label={`Horas de ${filas.find(fila => fila.trabajador.id === row.id)?.trabajador.nombre ?? row.id}`}
          type="number" min="0.01" step="0.01" inputMode="decimal" required value={row.cantidad} onChange={event => cambiar({ personal: datos.personal.map((item, position) => position === index ? { ...item, cantidad: event.target.value } : item) })} />)}
      </section>
      <RecursosCorte titulo="Insumos consumidos" etiqueta="Insumo" valorLabel="Cantidad consumida" opciones={INSUMOS_DEMO} filas={datos.insumos} onChange={insumos => cambiar({ insumos })} />
      <TextArea label="Observaciones del residente" value={datos.observaciones} maxLength={5000} onChange={event => cambiar({ observaciones: event.target.value })} />
      {corte && <TextArea label="Motivo de la edición" required minCharacters={10} maxLength={1000} value={motivo} onChange={event => { setMotivo(event.target.value); setSucio(true); }} />}
    </fieldset>
    {corte ? <SoportesCorte corte={corte} /> : <SoportesPorGuardar pendientes={adjuntos} onChange={cambiarAdjuntos} />}
  </FormLayout>;
}
