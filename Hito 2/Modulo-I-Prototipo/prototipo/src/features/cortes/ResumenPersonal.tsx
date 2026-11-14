import { TriangleAlert, X } from 'lucide-react';
import { useRef } from 'react';
import { Badge, Banner, IconButton, StatusBadge } from '@/components';
import { cn } from '@/lib/cn';
import { plural } from '@/lib/formato';
import { esAsignable } from '@/lib/semaforo';
import type { FilaPersonal } from '@/lib/sst/SstContext';
import { alertasDeVigencia, conteoAlertas, textoAlerta } from './personal';

export interface ResumenPersonalProps {
  /** Trabajadores elegidos, en el orden en que se agregaron. */
  elegidos: FilaPersonal[];
  onQuitar: (id: string) => void;
  className?: string;
}

/** Trabajadores del corte con sus alertas preventivas de 15 y 30 días. */
export function ResumenPersonal({ elegidos, onQuitar, className }: ResumenPersonalProps) {
  const titulo = useRef<HTMLHeadingElement>(null);
  const { d15, d30 } = conteoAlertas(elegidos);
  // Pudo vencerse después de agregarlo (p. ej. al sincronizar, §8.3).
  const bloqueados = elegidos.filter((f) => !esAsignable(f.evaluacion.estado));

  return (
    <section aria-labelledby="resumen-titulo" className={cn('card flex flex-col gap-gutter-md p-gutter-md', className)}>
      <div className="flex flex-col gap-gutter-sm">
        <h2 id="resumen-titulo" ref={titulo} tabIndex={-1} className="text-headline-sm">
          Personal del corte <span className="tabular-nums text-on-surface-muted">({elegidos.length})</span>
        </h2>
        {elegidos.length > 0 && (
          <div role="status" className="flex flex-wrap gap-gutter-xs">
            <StatusBadge estado="Próximo a Vencer (15d)">{plural(d15, 'alerta', 'alertas')} de 15 días</StatusBadge>
            <StatusBadge estado="Próximo a Vencer (30d)">{plural(d30, 'alerta', 'alertas')} de 30 días</StatusBadge>
          </div>
        )}
      </div>

      {bloqueados.length > 0 && (
        <Banner tone="error" title="Hay personal que ya no se puede asignar">
          {bloqueados.map((f) => `${f.trabajador.nombre} (${f.evaluacion.motivo})`).join('; ')}. Quítalo para guardar el corte.
        </Banner>
      )}

      {elegidos.length === 0 ? (
        <p className="text-body-md text-on-surface-muted">Aún no has agregado trabajadores. Márcalos en la lista de personal.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-outline-variant">
          {elegidos.map((f) => {
            const t = f.trabajador;
            const alertas = alertasDeVigencia(f.evaluacion);
            const bloqueado = !esAsignable(f.evaluacion.estado);
            return (
              <li key={t.id} className="flex items-start justify-between gap-gutter-sm py-gutter-sm first:pt-0 last:pb-0">
                <div className="flex min-w-0 flex-col gap-gutter-xs">
                  <span className="text-title-md">{t.nombre}</span>
                  <span className="text-body-sm text-on-surface-muted">{t.cargo}</span>
                  <div className="flex flex-wrap gap-gutter-xs">
                    {bloqueado ? (
                      <StatusBadge estado={f.evaluacion.estado}>{f.evaluacion.motivo}</StatusBadge>
                    ) : alertas.length > 0 ? (
                      alertas.map((a) => (
                        <StatusBadge key={a.clave} estado={a.estado}>
                          {textoAlerta(a)}
                        </StatusBadge>
                      ))
                    ) : (
                      <StatusBadge estado="Habilitado">Al día</StatusBadge>
                    )}
                  </div>
                </div>
                <IconButton
                  size="field"
                  label={`Quitar a ${t.nombre} del corte`}
                  onClick={() => {
                    onQuitar(t.id);
                    titulo.current?.focus();
                  }}
                >
                  <X aria-hidden="true" className="h-5 w-5" />
                </IconButton>
              </li>
            );
          })}
        </ul>
      )}

      {d15 + d30 > 0 && (
        <p className="flex items-start gap-gutter-xs text-body-sm text-on-surface-muted">
          <TriangleAlert aria-hidden="true" className="mt-px h-4 w-4 shrink-0 text-warning" />
          Las alertas no impiden agregar al trabajador. Avisa a Coordinación SST para que renueve a tiempo.
        </p>
      )}
      {elegidos.length > 0 && <Badge tone="info" className="self-start">Se revisa de nuevo al enviar el corte</Badge>}
    </section>
  );
}
