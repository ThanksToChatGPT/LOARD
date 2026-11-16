import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Banner, Button, DateField, Dialog, PageHeader, ProgressBar, Select, StatusBadge, TextField } from '@/components';
import { useAuthDemo } from '@/features/acceso/AuthDemo';
import { CARPETAS_DOSSIER } from '@/lib/constantes';
import { HOY_SST } from '@/lib/sst/fechas';
import { useSst } from '@/lib/sst/SstContext';
import { useDossier } from './DossierContext';
import { useCargasDossier } from './CargasDossier';
import { DetalleItem } from './DetalleItem';
import { PestanasDossier } from './DossierLayout';
import { avanceCarpeta, itemsActivos } from './modelo';
import { bloqueoEntrega, paqueteDossier, plazoDossier } from './entrega';

export function AvanceDossier() {
  const { usuario } = useAuthDemo();
  const { dossier, error, porValidar, aceptarActa } = useDossier();
  const { cargas } = useCargasDossier();
  const { enLinea } = useSst();
  const navigate = useNavigate();
  const [carpeta, setCarpeta] = useState('');
  const [itemId, setItemId] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [numero, setNumero] = useState('');
  const [aceptada, setAceptada] = useState('');
  const [errorActa, setErrorActa] = useState('');
  const [exportando, setExportando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [errorExportar, setErrorExportar] = useState('');
  const total = avanceCarpeta(dossier.items);
  const plazo = plazoDossier(dossier.acta?.aceptada);
  const pendientes = itemsActivos(dossier.items).filter(i => i.estado !== 'Validado' || !i.soporte).filter(i => !carpeta || i.carpeta === Number(carpeta));
  const transicion = porValidar.length > 0 || cargas.length > 0;
  const bloqueo = error || (transicion ? 'Espera a que terminen las cargas y se confirmen las validaciones.' : bloqueoEntrega(dossier));
  async function exportar(definitivo: boolean) {
    if (exportando || error || transicion || (definitivo && bloqueo)) return;
    setExportando(true); setAviso(''); setErrorExportar('');
    try {
      const paquete = await paqueteDossier(dossier, definitivo);
      const url = URL.createObjectURL(new Blob([new Uint8Array(paquete.bytes)], { type: 'application/zip' }));
      const a = document.createElement('a'); a.href = url; a.download = paquete.nombre;
      document.body.append(a); a.click(); a.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setAviso(`Descarga preparada: ${paquete.nombre}. Incluye las seis carpetas, el resumen y la trazabilidad.`);
    } catch (e) { setErrorExportar(e instanceof Error ? e.message : 'No se pudo generar el ZIP. Intenta de nuevo.'); }
    finally { setExportando(false); }
  }
  return <div className="grid-page gap-y-gutter-lg">
    <PestanasDossier />
    <PageHeader className="col-span-full" title="Avance y entrega del dossier" description="Control de las seis carpetas contractuales · Contrato CW-118" meta="HU-M08 · Datos de demostración del 17/11/2026" />
    {error && <div className="col-span-full"><Banner tone="error">{error}</Banner></div>}
    <section className="card col-span-full flex flex-col gap-gutter-md p-gutter-lg">
      <div className="flex flex-wrap items-center justify-between gap-gutter-md"><div><h2 className="text-headline-sm">Plazo contractual · 10 días calendario</h2>
        <p className="text-body-md">{dossier.acta ? `${dossier.acta.numero} · Aceptada el ${dossier.acta.aceptada}` : 'Sin acta de facturación aceptada. Calidad debe registrar la referencia y la fecha.'}</p></div>
        {usuario?.rol === 'calidad' && <Button variant="secondary" onClick={() => { setNumero(dossier.acta?.numero ?? ''); setAceptada(dossier.acta?.aceptada ?? ''); setErrorActa(''); setEditando(true); }}>{dossier.acta ? 'Editar aceptación del acta' : 'Registrar acta aceptada'}</Button>}
      </div>
      {plazo && <Banner tone={plazo.vencido ? 'error' : plazo.dias <= 3 ? 'warning' : 'info'} title={plazo.vencido ? `Plazo vencido hace ${-plazo.dias} ${plazo.dias === -1 ? 'día' : 'días'}` : plazo.dias === 0 ? 'El plazo vence hoy' : `${plazo.dias} ${plazo.dias === 1 ? 'día restante' : 'días restantes'}`}>Fecha límite: {plazo.limite}. Se cuentan fines de semana y festivos. {plazo.vencido && 'Completa y entrega el dossier; el vencimiento se mantiene visible.'}</Banner>}
      {dossier.acta && <p className="text-body-sm text-on-surface-muted">Aceptación registrada por {dossier.acta.registradoPor}. Este dato de ejemplo se conserva en el navegador.</p>}
    </section>
    <section className="card col-span-full flex flex-col gap-gutter-md p-gutter-lg">
      <h2 className="text-headline-sm">{total.porcentaje}% validado</h2>
      <ProgressBar label="Avance global del dossier" value={total.porcentaje} showLabel />
      <p className="text-body-md">{total.conteo.Validado} de {total.total} requisitos validados · {total.conteo['Archivo Cargado']} por revisar · {total.conteo.Observado} observados · {total.conteo.Pendiente} pendientes</p>
      <p className="text-body-sm text-on-surface-muted">Un archivo cargado aún no cuenta como validado. Calidad lo revisa desde la checklist o el detalle del requisito.</p>
      <div className="grid gap-gutter-md tablet:grid-cols-2 desktop:grid-cols-3">{CARPETAS_DOSSIER.map(c => {
        const a = avanceCarpeta(dossier.items, c.numero);
        return <button key={c.numero} className="sf-container flex min-w-0 flex-col gap-gutter-sm rounded-md border border-outline-variant p-gutter-md text-left" onClick={() => setCarpeta(String(c.numero))} aria-pressed={carpeta === String(c.numero)}>
          <span className="text-title-md">{c.numero}. {c.nombre}</span><ProgressBar label={`Avance de carpeta ${c.numero}`} value={a.porcentaje} showLabel /><span className="text-body-sm">{a.conteo.Validado}/{a.total} validados · {a.total - a.conteo.Validado} sin validar</span>
        </button>;
      })}</div>
    </section>
    <section className="card col-span-full flex flex-col gap-gutter-md p-gutter-lg">
      <h2 className="text-headline-sm">Requisitos que faltan para cerrar</h2>
      <Select label="Carpeta" value={carpeta} placeholder="Todas las carpetas" options={CARPETAS_DOSSIER.map(c => ({ value: String(c.numero), label: `${c.numero}. ${c.nombre}` }))} onChange={e => setCarpeta(e.target.value)} />
      {carpeta && <Button variant="ghost" onClick={() => setCarpeta('')}>Ver todas las carpetas</Button>}
      {!pendientes.length ? <p className="text-success">No hay requisitos sin validar en esta selección.</p> : <ul className="flex flex-col gap-gutter-sm">{pendientes.map(i => <li key={i.id} className="flex flex-col gap-gutter-sm rounded border border-outline-variant p-gutter-md tablet:flex-row tablet:items-center">
        <div className="min-w-0 flex-1 break-words"><p className="text-title-md">Carpeta {i.carpeta} · {i.nombre}</p><p className="text-body-sm text-on-surface-muted">{i.observacion ?? (i.soporte ? 'Esperando revisión de Calidad.' : 'Falta el soporte PDF.')}</p></div><StatusBadge estado={i.estado} /><Button variant="secondary" onClick={() => setItemId(i.id)}>Abrir requisito</Button>
      </li>)}</ul>}
    </section>
    <section className="card col-span-full flex flex-col gap-gutter-md p-gutter-lg">
      <h2 className="text-headline-sm">Paquete de entrega</h2>
      <Banner tone="info">ZIP de demostración. Incluye los PDF seleccionados durante esta sesión. Los soportes ficticios o cuyo original no esté disponible se identifican con una ficha .txt. El resumen indica los faltantes; no constituye una radicación contractual.</Banner>
      <div className="flex flex-wrap gap-gutter-md"><Button variant="secondary" loading={exportando} loadingText="Preparando ZIP…" blocked={!!error || transicion} blockedReason="Espera a que terminen las cargas y se confirmen las validaciones." onClick={() => void exportar(false)}>Exportar borrador parcial (.ZIP)</Button>
        <Button loading={exportando} loadingText="Preparando ZIP…" blocked={!!bloqueo} blockedReason={bloqueo ?? undefined} onClick={() => void exportar(true)}>Exportar dossier validado (.ZIP)</Button>
        <Button variant="ghost" onClick={() => navigate('/dossier')}>Ir a la checklist</Button></div>
      {aviso && <p role="status" className="break-words text-body-md text-success">{aviso}</p>}
      {errorExportar && <Banner tone="error" title="No se pudo exportar">{errorExportar} Puedes volver a intentar la descarga.</Banner>}
    </section>
    <DetalleItem item={dossier.items.find(i => i.id === itemId && !i.retirado) ?? null} onClose={() => setItemId(null)} />
    <Dialog open={editando} onClose={() => setEditando(false)} title="Aceptación del acta de facturación" description="El plazo empieza con la aceptación del acta, no con la creación de un corte." footer={<><Button variant="secondary" onClick={() => setEditando(false)}>Cancelar</Button><Button type="submit" form="acta-dossier" blocked={!enLinea || !!error} blockedReason="Recupera la conexión y resuelve los errores para guardar.">Guardar aceptación</Button></>}>
      <form id="acta-dossier" noValidate className="flex flex-col gap-gutter-md" onSubmit={e => { e.preventDefault(); if (!enLinea || error) return; try { aceptarActa({ numero, aceptada, usuario }); setEditando(false); } catch (fallo) { setErrorActa(fallo instanceof Error ? fallo.message : 'No se pudo guardar el acta.'); } }}>
        {errorActa && <Banner tone="error">{errorActa}</Banner>}
        <TextField label="Referencia del acta" required maxLength={120} value={numero} onChange={e => setNumero(e.target.value)} />
        <DateField label="Fecha de aceptación" required max={HOY_SST} value={aceptada} onChange={e => setAceptada(e.target.value)} />
        <p className="text-body-sm">Reloj de la demostración: {HOY_SST}. El día diez se incluye completo en el plazo.</p>
      </form>
    </Dialog>
  </div>;
}
