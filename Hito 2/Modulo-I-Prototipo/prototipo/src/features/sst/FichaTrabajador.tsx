import { FilePlus2, FileText, RefreshCw, ShieldCheck, Stethoscope } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Badge, Banner, Button, PageHeader, StatusBadge, Timeline } from '@/components';
import { formatoFecha, formatoFechaHora } from '@/lib/formato';
import { calcularEstadoSST, esAsignable, textoVencimiento } from '@/lib/semaforo';
import { Seccion, VisorCertificado, Volver, formatoCedula } from './componentes';
import { aptitudVigente, construirBitacora, cursosVigentes, textoOtros } from './evaluacion';
import { HOY_SST } from './fechas';
import { useTrabajador } from './SstContext';
import type { Curso } from './tipos';

export function FichaTrabajador() {
  const { id } = useParams();
  const datos = useTrabajador(id);
  const navigate = useNavigate();
  const [visor, setVisor] = useState<Curso | null>(null);

  const bitacora = useMemo(
    () => (datos ? construirBitacora(datos.trabajador, datos.cursos, datos.aptitudes, HOY_SST) : []),
    [datos],
  );

  if (!datos) {
    return (
      <div className="grid-page">
        <div className="col-span-full flex flex-col gap-gutter-md">
          <Volver to="/sst">Personal SST</Volver>
          <Banner tone="warning" title="No encontramos este trabajador">
            Puede que el enlace esté incompleto. Vuelve a la lista de personal y búscalo por nombre o cédula.
          </Banner>
        </div>
      </div>
    );
  }

  const { trabajador: t, cursos, aptitudes, evaluacion: e } = datos;
  const vigentes = cursosVigentes(cursos).sort(
    (a, b) => t.cursosRequeridos.indexOf(a.tipo) - t.cursosRequeridos.indexOf(b.tipo),
  );
  const faltantes = t.cursosRequeridos.filter((tipo) => !vigentes.some((c) => c.tipo === tipo));
  const reemplazados = cursos
    .filter((c) => !vigentes.includes(c))
    .sort((a, b) => b.registradoEn.getTime() - a.registradoEn.getTime());
  const aptitud = aptitudVigente(aptitudes);
  const aptitudesAnteriores = aptitudes
    .filter((a) => a !== aptitud)
    .sort((a, b) => b.registradoEn.getTime() - a.registradoEn.getTime());
  const bloqueado = !esAsignable(e.estado);
  const otros = textoOtros(e.otrosEnAlerta);
  // Lo reemplazó la corrección que lo nombra o, si no, el siguiente registro del mismo tipo.
  const reemplazoDe = (c: Curso) =>
    cursos.find((x) => x.reemplazaA === c.id) ??
    cursos
      .filter((x) => x.tipo === c.tipo && x.registradoEn > c.registradoEn)
      .sort((a, b) => a.registradoEn.getTime() - b.registradoEn.getTime())[0];

  return (
    <div className="grid-page gap-y-gutter-lg">
      <div className="col-span-full flex flex-col gap-gutter-sm">
        <Volver to="/sst">Personal SST</Volver>
        <PageHeader
          title={t.nombre}
          description={
            <span className="tabular-nums">
              C.C. {formatoCedula(t.cedula)} · {t.cargo} · {t.frente}
            </span>
          }
          actions={
            <>
              <Button
                size="field"
                icon={<FilePlus2 aria-hidden="true" className="h-4 w-4" />}
                onClick={() => navigate(`/sst/${t.id}/cursos/nuevo`)}
              >
                Registrar curso
              </Button>
              <Button
                variant="secondary"
                size="field"
                icon={<Stethoscope aria-hidden="true" className="h-4 w-4" />}
                onClick={() => navigate(`/sst/${t.id}/aptitud`)}
              >
                Actualizar aptitud médica
              </Button>
            </>
          }
        />
      </div>

      {/* Resumen del estado general */}
      <section
        aria-label="Estado general"
        className={
          bloqueado
            ? 'col-span-full flex flex-col gap-gutter-sm rounded-md border border-error-border bg-error-subtle p-gutter-md'
            : 'card col-span-full flex flex-col gap-gutter-sm p-gutter-md'
        }
      >
        <div className="flex flex-wrap items-center gap-gutter-sm">
          <span className="text-label-lg text-on-surface-muted">Estado general</span>
          <StatusBadge estado={e.estado} />
        </div>
        <p className={bloqueado ? 'text-title-lg text-error' : 'text-title-lg'}>{e.motivo}</p>
        {otros && (
          <p className="text-body-md text-on-surface-muted">
            También: {e.otrosEnAlerta.map((o) => `${o.etiqueta} ${o.causa}`).join('; ')}.
          </p>
        )}
        <p className="text-body-md text-on-surface-muted">
          {bloqueado
            ? 'No se puede asignar a un corte de obra hasta que se registre un curso o una aptitud vigente.'
            : 'Se puede asignar a cortes de obra.'}
        </p>
      </section>

      {/* Cursos normativos */}
      <Seccion
        className="col-span-full desktop:col-span-7"
        titulo="Cursos normativos"
        descripcion="Los cursos no se editan ni se borran. Para corregir un dato, registra el curso de nuevo: el anterior queda en el historial como reemplazado."
      >
        {faltantes.length > 0 && (
          <Banner tone="error" title="Falta un curso obligatorio para el cargo">
            {faltantes.join(', ')}. Registra el certificado para habilitar al trabajador.
          </Banner>
        )}
        <ul className="flex flex-col gap-gutter-sm">
          {vigentes.map((c) => {
            const estado = calcularEstadoSST(c.vencimiento, HOY_SST);
            const requerido = t.cursosRequeridos.includes(c.tipo);
            return (
              <li key={c.id} className="flex flex-col gap-gutter-sm rounded-md border border-outline-variant p-gutter-md">
                <div className="flex flex-wrap items-start justify-between gap-gutter-sm">
                  <div className="flex min-w-0 flex-col gap-gutter-xs">
                    <h3 className="text-title-lg">{c.tipo}</h3>
                    <p className="text-body-sm text-on-surface-muted">
                      {c.entidad}
                      {!requerido && ' · no obligatorio para el cargo'}
                    </p>
                  </div>
                  <StatusBadge estado={estado} />
                </div>
                <dl className="grid grid-cols-2 gap-gutter-sm text-body-md tablet:grid-cols-3">
                  <div>
                    <dt className="text-label-md text-on-surface-muted">Expedición</dt>
                    <dd className="tabular-nums">{formatoFecha(c.expedicion)}</dd>
                  </div>
                  <div>
                    <dt className="text-label-md text-on-surface-muted">Vencimiento</dt>
                    <dd className="tabular-nums">{formatoFecha(c.vencimiento)}</dd>
                  </div>
                  <div className="col-span-2 tablet:col-span-1">
                    <dt className="text-label-md text-on-surface-muted">Vigencia</dt>
                    <dd className={estado === 'Vencido' ? 'font-semibold tabular-nums text-error' : 'tabular-nums'}>
                      {textoVencimiento(c.vencimiento, HOY_SST)}
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-gutter-sm">
                  <Button
                    variant="ghost"
                    size="field"
                    icon={<FileText aria-hidden="true" className="h-4 w-4" />}
                    aria-label={`Ver certificado de ${c.tipo}`}
                    onClick={() => setVisor(c)}
                  >
                    Ver certificado
                  </Button>
                  <Button
                    variant="ghost"
                    size="field"
                    icon={<RefreshCw aria-hidden="true" className="h-4 w-4" />}
                    aria-label={`Renovar o corregir ${c.tipo}`}
                    onClick={() => navigate(`/sst/${t.id}/cursos/nuevo?tipo=${encodeURIComponent(c.tipo)}&reemplaza=${c.id}`)}
                  >
                    Renovar o corregir
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </Seccion>

      {/* Aptitud médica */}
      <Seccion
        className="col-span-full self-start desktop:col-span-5"
        titulo="Aptitud médica"
        descripcion="Solo el concepto y sus fechas. Por reserva legal no se registran diagnósticos ni datos clínicos."
      >
        {aptitud ? (
          <div className="flex flex-col gap-gutter-md">
            <div className="flex flex-wrap items-center gap-gutter-sm">
              <span className="text-label-lg text-on-surface-muted">Concepto</span>
              <StatusBadge estado={aptitud.concepto} />
            </div>
            <dl className="grid grid-cols-2 gap-gutter-sm text-body-md">
              <div>
                <dt className="text-label-md text-on-surface-muted">Expedición</dt>
                <dd className="tabular-nums">{formatoFecha(aptitud.expedicion)}</dd>
              </div>
              <div>
                <dt className="text-label-md text-on-surface-muted">Vencimiento</dt>
                <dd className="tabular-nums">{formatoFecha(aptitud.vencimiento)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-label-md text-on-surface-muted">Vigencia</dt>
                <dd className="flex flex-wrap items-center gap-gutter-sm tabular-nums">
                  <StatusBadge estado={calcularEstadoSST(aptitud.vencimiento, HOY_SST)}>
                    {textoVencimiento(aptitud.vencimiento, HOY_SST)}
                  </StatusBadge>
                </dd>
              </div>
            </dl>
            <p className="text-body-sm tabular-nums text-on-surface-muted">
              Registrado por {aptitud.registradoPor} el {formatoFechaHora(aptitud.registradoEn)}
            </p>
          </div>
        ) : (
          <Banner tone="error" title="Sin aptitud médica registrada">
            Registra el concepto para habilitar al trabajador.
          </Banner>
        )}
        <Button
          variant="secondary"
          size="field"
          icon={<ShieldCheck aria-hidden="true" className="h-4 w-4" />}
          onClick={() => navigate(`/sst/${t.id}/aptitud`)}
        >
          Actualizar aptitud médica
        </Button>
      </Seccion>

      {/* Historial */}
      <Seccion
        className="col-span-full"
        titulo="Historial"
        descripcion="Registros reemplazados y bitácora de cambios de estado. Solo lectura."
      >
        <div className="grid grid-cols-1 gap-gutter-lg desktop:grid-cols-12">
          <div className="flex flex-col gap-gutter-sm desktop:col-span-5">
            <h3 className="text-title-lg">Registros anteriores</h3>
            {reemplazados.length + aptitudesAnteriores.length === 0 ? (
              <p className="text-body-md text-on-surface-muted">Aún no hay registros reemplazados.</p>
            ) : (
              <ul className="flex flex-col gap-gutter-sm">
                {reemplazados.map((c) => {
                  const nuevo = reemplazoDe(c);
                  return (
                    <li key={c.id} className="flex flex-col gap-gutter-xs rounded-md border border-outline-variant p-3">
                      <div className="flex flex-wrap items-center justify-between gap-gutter-sm">
                        <span className="text-title-md">{c.tipo}</span>
                        <Badge tone="neutral">{c.id === nuevo?.reemplazaA ? 'Corregido' : 'Renovado'}</Badge>
                      </div>
                      <p className="text-body-sm tabular-nums text-on-surface-muted">
                        Vencía el {formatoFecha(c.vencimiento)} · registrado el {formatoFechaHora(c.registradoEn)}
                        {nuevo && ` · reemplazado el ${formatoFecha(nuevo.registradoEn)}`}
                      </p>
                      <Button variant="ghost" className="self-start" onClick={() => setVisor(c)} aria-label={`Ver certificado anterior de ${c.tipo}`}>
                        Ver certificado
                      </Button>
                    </li>
                  );
                })}
                {aptitudesAnteriores.map((a) => (
                  <li key={a.id} className="flex flex-col gap-gutter-xs rounded-md border border-outline-variant p-3">
                    <div className="flex flex-wrap items-center justify-between gap-gutter-sm">
                      <span className="text-title-md">Aptitud médica · {a.concepto}</span>
                      <Badge tone="neutral">Reemplazada</Badge>
                    </div>
                    <p className="text-body-sm tabular-nums text-on-surface-muted">
                      Vigente hasta el {formatoFecha(a.vencimiento)} · registrada el {formatoFechaHora(a.registradoEn)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-col gap-gutter-sm desktop:col-span-7">
            <h3 className="text-title-lg">Bitácora</h3>
            <Timeline label={`Bitácora SST de ${t.nombre}`} entries={bitacora} />
          </div>
        </div>
      </Seccion>

      <VisorCertificado curso={visor} onClose={() => setVisor(null)} />
    </div>
  );
}
