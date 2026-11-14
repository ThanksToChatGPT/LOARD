/** Piezas que solo usa el módulo SST. */

import { ArrowLeft, FileText } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Drawer, StatusBadge } from '@/components';
import type { EstadoSST } from '@/lib/estados';
import { cn } from '@/lib/cn';
import { diasRestantes, formatoFecha, formatoFechaHora, formatoMB, type FechaCalendario } from '@/lib/formato';
import { DIAS_ALERTA_15, DIAS_ALERTA_30, calcularEstadoSST, textoVencimiento } from '@/lib/semaforo';
import { HOY_SST } from './fechas';
import type { Curso } from './tipos';

/** 1144082315 → «1.144.082.315» */
export function formatoCedula(cedula: string): string {
  return cedula.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Enlace de regreso, con área táctil completa. */
export function Volver({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-touch items-center gap-gutter-xs self-start rounded pr-gutter-sm text-label-lg text-primary hover:underline"
    >
      <ArrowLeft aria-hidden="true" className="h-4 w-4" />
      {children}
    </Link>
  );
}

/** Sección con título dentro de una tarjeta. */
export function Seccion({
  titulo,
  descripcion,
  acciones,
  children,
  className,
}: {
  titulo: string;
  descripcion?: ReactNode;
  acciones?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const id = `sec-${titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <section aria-labelledby={id} className={cn('card flex flex-col gap-gutter-md p-gutter-md', className)}>
      <div className="flex flex-col gap-gutter-sm tablet:flex-row tablet:items-start tablet:justify-between">
        <div className="flex flex-col gap-gutter-xs">
          <h2 id={id} className="text-headline-sm">
            {titulo}
          </h2>
          {descripcion && <p className="text-body-md text-on-surface-muted">{descripcion}</p>}
        </div>
        {acciones && <div className="flex flex-wrap gap-gutter-sm">{acciones}</div>}
      </div>
      {children}
    </section>
  );
}

/* ───────────────── Vista previa del semáforo ───────────────── */

const TRAMOS: Array<{ estado: EstadoSST; rango: string; clase: string }> = [
  { estado: 'Vencido', rango: 'Ya pasó', clase: 'border-error-border bg-error-subtle text-error' },
  { estado: 'Próximo a Vencer (15d)', rango: `0 a ${DIAS_ALERTA_15} días`, clase: 'border-warning-border bg-warning-subtle text-warning' },
  { estado: 'Próximo a Vencer (30d)', rango: `${DIAS_ALERTA_15 + 1} a ${DIAS_ALERTA_30} días`, clase: 'border-warning-border bg-warning-subtle text-warning' },
  { estado: 'Habilitado', rango: `Más de ${DIAS_ALERTA_30} días`, clase: 'border-success-border bg-success-subtle text-success' },
];

export interface VistaPreviaSemaforoProps {
  /** Qué se está evaluando: «el curso», «la aptitud». */
  sujeto: string;
  vencimiento: FechaCalendario | '';
  /** Fuerza el estado (ej. concepto No Habilitado, sin importar la fecha). */
  estadoForzado?: EstadoSST;
  /** Cómo queda el estado general del trabajador con este registro. */
  impacto?: { nombre: string; antes: EstadoSST; despues: EstadoSST; motivo: string };
}

/**
 * Muestra en vivo en qué tramo del semáforo cae la fecha elegida y cómo cambia
 * el estado general del trabajador al guardar.
 */
export function VistaPreviaSemaforo({ sujeto, vencimiento, estadoForzado, impacto }: VistaPreviaSemaforoProps) {
  const conFecha = vencimiento !== '';
  const estado = estadoForzado ?? (conFecha ? calcularEstadoSST(vencimiento, HOY_SST) : null);
  const dias = conFecha ? diasRestantes(vencimiento, HOY_SST) : null;

  return (
    <section aria-labelledby="vista-semaforo" className="sf-low flex flex-col gap-gutter-md rounded-md border border-outline-variant p-gutter-md">
      <div className="flex flex-col gap-gutter-xs">
        <h2 id="vista-semaforo" className="text-title-lg">
          Vista previa del semáforo
        </h2>
        <p className="text-body-sm tabular-nums text-on-surface-muted">
          Calculado al {formatoFecha(HOY_SST)}. Alertas a {DIAS_ALERTA_30} y {DIAS_ALERTA_15} días del vencimiento.
        </p>
      </div>

      <div aria-live="polite" className="flex flex-col gap-gutter-md">
        {!estado && (
          <p className="text-body-md text-on-surface-muted">Elige la fecha de vencimiento para ver el estado de {sujeto}.</p>
        )}

        {estado && (
          <>
            <div className="flex flex-wrap items-center gap-gutter-sm">
              <StatusBadge estado={estado} />
              <span className="text-body-md tabular-nums">
                {estadoForzado === 'No Habilitado'
                  ? 'Concepto No Habilitado: bloquea al trabajador sin importar la fecha.'
                  : dias != null && conFecha && textoVencimiento(vencimiento, HOY_SST)}
              </span>
            </div>

            {!estadoForzado && (
              <ol aria-label="Tramos del semáforo" className="grid grid-cols-2 gap-gutter-xs tablet:grid-cols-4">
                {TRAMOS.map((t) => {
                  const activo = t.estado === estado;
                  return (
                    <li
                      key={t.estado}
                      aria-current={activo ? 'true' : undefined}
                      className={cn(
                        'flex flex-col gap-0.5 rounded-sm border px-gutter-sm py-gutter-xs text-label-md transition duration-state ease-out',
                        activo ? cn(t.clase, 'font-bold shadow-[inset_0_0_0_1px_currentColor]') : 'border-outline-variant text-on-surface-muted',
                      )}
                    >
                      <span>{t.estado}</span>
                      <span className="tabular-nums font-normal">{t.rango}</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </>
        )}

        {impacto && estado && (
          <p className="text-body-md">
            Al guardar, el estado general de <strong className="font-semibold">{impacto.nombre}</strong>{' '}
            {impacto.antes === impacto.despues ? (
              <>
                sigue en <StatusBadge estado={impacto.despues} className="align-middle" />
              </>
            ) : (
              <>
                pasa de <StatusBadge estado={impacto.antes} className="align-middle" /> a{' '}
                <StatusBadge estado={impacto.despues} className="align-middle" />
              </>
            )}
            <span className="mt-gutter-xs block text-body-sm text-on-surface-muted">{impacto.motivo}</span>
          </p>
        )}
      </div>
    </section>
  );
}

/* ───────────────── Visor de certificado ───────────────── */

export function VisorCertificado({ curso, onClose }: { curso: Curso | null; onClose: () => void }) {
  const c = curso;
  return (
    <Drawer
      open={c != null}
      onClose={onClose}
      title={c ? `Certificado · ${c.tipo}` : ''}
      meta={
        c && (
          <span className="tabular-nums">
            Cargado por {c.registradoPor} el {formatoFechaHora(c.registradoEn)} · {c.certificado.nombre} ·{' '}
            {formatoMB(c.certificado.bytes)}
          </span>
        )
      }
    >
      {c &&
        (c.certificado.url ? (
          c.certificado.tipoMime?.startsWith('image/') ? (
            <img src={c.certificado.url} alt={`Certificado de ${c.tipo}`} className="mx-auto max-w-full rounded-md border border-outline-variant" />
          ) : (
            <iframe title={`Certificado de ${c.tipo}`} src={c.certificado.url} className="h-[70vh] w-full rounded-md border border-outline-variant" />
          )
        ) : (
          <CertificadoDeMuestra curso={c} />
        ))}
    </Drawer>
  );
}

/** Representación del PDF para los datos de ejemplo, que no tienen archivo real. */
function CertificadoDeMuestra({ curso }: { curso: Curso }) {
  const estado = calcularEstadoSST(curso.vencimiento, HOY_SST);
  return (
    <div className="flex flex-col gap-gutter-md">
      <p className="text-body-sm text-on-surface-muted">Vista de muestra: los datos de ejemplo no incluyen el PDF original.</p>
      <article className="mx-auto flex w-full max-w-md flex-col gap-gutter-md rounded-md border border-outline p-gutter-lg text-center">
        <FileText aria-hidden="true" className="mx-auto h-8 w-8 text-on-surface-muted" />
        <p className="text-label-sm uppercase text-on-surface-muted">{curso.entidad}</p>
        <h3 className="text-headline-sm">Certificado de {curso.tipo}</h3>
        <dl className="grid grid-cols-2 gap-gutter-sm text-left text-body-md">
          <dt className="text-on-surface-muted">Expedición</dt>
          <dd className="tabular-nums">{formatoFecha(curso.expedicion)}</dd>
          <dt className="text-on-surface-muted">Vencimiento</dt>
          <dd className="tabular-nums">{formatoFecha(curso.vencimiento)}</dd>
        </dl>
        <StatusBadge estado={estado} className="self-center">
          {textoVencimiento(curso.vencimiento, HOY_SST)}
        </StatusBadge>
      </article>
    </div>
  );
}
