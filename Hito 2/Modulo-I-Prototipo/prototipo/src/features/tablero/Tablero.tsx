import { useState } from 'react';
import { Banner, Button, Drawer, KpiCard, PageHeader, ProgressBar, StatusBadge } from '@/components';
import { ESTADOS_REQUISITO, type EstadoOficial } from '@/lib/estados';
import { formatoFecha, formatoFechaHora, numeroDeDia } from '@/lib/formato';
import { ACTUALIZADO, CARPETAS, FECHA_DEMO, REGISTROS } from '@/lib/seguimiento/datos';
import { porcentaje, porcentajeTiempo, resumenDossier } from '@/lib/seguimiento/reglas';
import { useConsulta, ControlesConsulta, EstadoConsulta, consultaDisponible } from '@/lib/seguimiento/consulta';

export function Tablero() {
  const q = useConsulta();
  const [carpeta, setCarpeta] = useState<number | null>(null);
  const [proyectoDetalle, setProyectoDetalle] = useState(q.proyectoId);
  const registros = q.escenario === 'vacio' ? [] : REGISTROS.filter(r => r.proyecto === q.proyectoId && r.tipo === 'requisito');
  const resumen = resumenDossier(registros);
  const incompleto = ['vacio','incompleto'].includes(q.escenario);
  const fisico = incompleto ? null : q.proyecto?.avanceFisico ?? null;
  const tiempo = incompleto ? null : porcentajeTiempo(q.proyecto?.inicio ?? null,q.proyecto?.fin ?? null,FECHA_DEMO);
  const dias = q.proyecto?.aceptacionActa ? 10 - (numeroDeDia(FECHA_DEMO) - numeroDeDia(q.proyecto.aceptacionActa)) : null;
  const diferencia = fisico != null && tiempo != null ? fisico-tiempo : null;
  const detalleAbierto = carpeta != null && proyectoDetalle === q.proyectoId && consultaDisponible(q);
  return <div className="grid-page"><div className="col-span-full flex min-w-0 flex-col gap-gutter-lg">
    <PageHeader title="Tablero del proyecto" description="Avance físico, tiempo contractual y expediente de calidad en una sola consulta."
      meta={`Datos de ejemplo al ${formatoFechaHora(new Date(ACTUALIZADO))} · Hora de Bogotá`} />
    <ControlesConsulta consulta={q} /><EstadoConsulta consulta={q} />
    {consultaDisponible(q) && <>
      {q.escenario === 'vacio' && <Banner title="Aún no hay datos operativos">No hay cortes ni requisitos registrados en este escenario. La ausencia de información no representa un avance de cero.</Banner>}
      {dias != null ? <Banner tone={dias < 0 ? 'error' : 'warning'} title={dias < 0 ? `Plazo del dossier vencido hace ${-dias} días` : dias === 0 ? 'El plazo del dossier vence hoy' : `Quedan ${dias} días para el dossier`}>
        Acta aceptada el {formatoFecha(q.proyecto!.aceptacionActa!)}. Plazo: 10 días calendario. {resumen.total ? `${resumen.total-resumen.validados} requisitos por validar.` : 'Sin requisitos configurados.'}
      </Banner> : <Banner title="Plazo del dossier sin iniciar">No hay fecha de aceptación del acta registrada.</Banner>}
      <div className="grid grid-cols-4 gap-gutter-md tablet:grid-cols-8 desktop:grid-cols-12">
        <KpiCard title="Avance físico" value={porcentaje(fisico)} description="Referencia consolidada del proyecto">
          {fisico != null && <ProgressBar label="Avance físico" value={fisico} />}
        </KpiCard>
        <KpiCard title="Tiempo contractual transcurrido" value={porcentaje(tiempo)} description={tiempo == null ? 'Faltan fechas válidas para calcularlo.' : `${formatoFecha(q.proyecto!.inicio!)} — ${formatoFecha(q.proyecto!.fin!)}`}>
          {tiempo != null && <ProgressBar label="Tiempo contractual transcurrido" value={tiempo} tone="info" />}
        </KpiCard>
        <KpiCard title="Dossier validado" value={porcentaje(resumen.porcentaje)} description={`${resumen.validados} de ${resumen.total} requisitos validados`}>
          {resumen.porcentaje != null && <ProgressBar label="Dossier validado" value={resumen.porcentaje} tone="success" />}
        </KpiCard>
      </div>
      <p className="text-body-md text-on-surface-muted">{diferencia == null ? 'Comparación no disponible: faltan datos de avance o fechas contractuales.' :
        `El avance físico está ${Math.abs(diferencia).toLocaleString('es-CO',{maximumFractionDigits:1})} puntos porcentuales ${diferencia < 0 ? 'por debajo' : 'por encima'} del tiempo transcurrido.`} La comparación orienta la revisión; no reemplaza el cronograma de actividades.</p>
      <section aria-labelledby="carpetas-titulo"><h2 id="carpetas-titulo" className="mb-gutter-sm text-headline-md">Las seis carpetas del dossier</h2>
        <p className="mb-gutter-md text-body-md text-on-surface-muted">Un archivo cargado u observado todavía no cuenta como validado.</p>
        <div className="grid grid-cols-1 gap-gutter-md tablet:grid-cols-2 desktop:grid-cols-3">
          {CARPETAS.map((nombre,i) => { const r = resumenDossier(registros.filter(item => item.carpeta === i+1)); return <article key={nombre} className="card flex min-w-0 flex-col gap-gutter-md p-gutter-md">
            <p className="text-label-md text-on-surface-muted">CARPETA {i+1}</p><h3 className="text-title-lg">{nombre}</h3>
            <p className="text-headline-md tabular-nums">{porcentaje(r.porcentaje)}</p>
            {r.porcentaje != null && <ProgressBar label={`Validación de carpeta ${i+1}`} value={r.porcentaje} tone="success" />}
            <p className="text-body-sm tabular-nums text-on-surface-muted">{r.validados} de {r.total} validados</p>
            <ul className="text-body-sm text-on-surface-muted">{ESTADOS_REQUISITO.map(estado => <li key={estado}>{estado}: {r.conteos[estado]}</li>)}</ul>
            <Button variant="secondary" className="mt-auto" aria-label={`Ver requisitos de carpeta ${i+1}`} onClick={() => {setProyectoDetalle(q.proyectoId);setCarpeta(i+1);}}>Ver requisitos</Button>
          </article>; })}
        </div>
      </section>
      <p className="text-body-sm text-on-surface-muted">El progreso global se calcula con todos los requisitos, no promediando los porcentajes de las carpetas. El avance físico de demostración se recibe como referencia; no se suman cantidades de unidades distintas.</p>
    </>}
    <Drawer open={detalleAbierto} onClose={() => setCarpeta(null)} title={`Carpeta ${carpeta} · ${CARPETAS[(carpeta ?? 1)-1]}`} meta="Consulta de requisitos · Sin acciones de validación" scrim>
      <div className="flex flex-col gap-gutter-md">{registros.filter(r => r.carpeta === carpeta).map(r => <article key={r.id} className="card flex flex-col gap-gutter-sm p-gutter-md">
        <h3 className="text-title-lg">{r.nombre}</h3><StatusBadge estado={r.estado as EstadoOficial} />
        <p className="text-body-sm text-on-surface-muted">{r.estado === ESTADOS_REQUISITO[0] ? 'Falta cargar el soporte.' : r.estado === ESTADOS_REQUISITO[2] ? 'Calidad registró observaciones pendientes.' : r.estado === ESTADOS_REQUISITO[1] ? 'El soporte espera revisión de Calidad.' : 'Requisito revisado por Calidad.'}</p>
      </article>)}{!registros.some(r => r.carpeta === carpeta) && <p>No hay requisitos configurados en esta carpeta.</p>}</div>
    </Drawer>
  </div></div>;
}
