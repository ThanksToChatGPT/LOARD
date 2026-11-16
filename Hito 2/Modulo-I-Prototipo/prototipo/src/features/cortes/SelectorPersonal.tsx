import { CloudOff, Lock, RefreshCw } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { Checkbox, SearchField, StatusBadge } from '@/components';
import { cn } from '@/lib/cn';
import { formatoCedula, formatoFecha, formatoHora, plural } from '@/lib/formato';
import { esAsignable } from '@/lib/semaforo';
import { textoOtros } from '@/lib/sst/evaluacion';
import { HOY_SST, SINCRONIZADO_EN } from '@/lib/sst/fechas';
import { useSst, type FilaPersonal } from '@/lib/sst/SstContext';
import { alertasDeVigencia, opcionesPersonal, textoAlerta } from './personal';

export interface SelectorPersonalProps {
  seleccionados: string[];
  onCambiar: (id: string, marcado: boolean) => void;
  className?: string;
}

/**
 * Selector de personal del corte (#6.2A, opción A «Transparencia operativa»):
 * salen todos los trabajadores; los vencidos o No Habilitado van abajo, en rojo,
 * con candado y el motivo exacto, y no se pueden marcar.
 */
export function SelectorPersonal({ seleccionados, onCambiar, className }: SelectorPersonalProps) {
  const { filas, enLinea } = useSst();
  const [busqueda, setBusqueda] = useState('');
  // Cada intento suma 1 para reiniciar la sacudida aunque sea la misma fila.
  const [sacudida, setSacudida] = useState<{ id: string; n: number } | null>(null);
  const [resaltado, setResaltado] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const idDisponibles = useId();
  const idBloqueados = useId();

  const { asignables, bloqueados } = useMemo(() => opcionesPersonal(filas, busqueda), [filas, busqueda]);
  const total = asignables.length + bloqueados.length;

  const intentarBloqueado = (f: FilaPersonal) => {
    setSacudida((s) => ({ id: f.trabajador.id, n: (s?.n ?? 0) + 1 }));
    setResaltado(f.trabajador.id);
    // Se anuncia aunque se repita el mismo texto: el espacio final fuerza el cambio.
    setAviso((anterior) => {
      const texto = `No puedes agregar a ${f.trabajador.nombre}. ${f.evaluacion.motivo}.`;
      return anterior === texto ? `${texto} ` : texto;
    });
  };

  const fila = (f: FilaPersonal) => (
    <FilaTrabajador
      key={f.trabajador.id}
      fila={f}
      marcado={seleccionados.includes(f.trabajador.id)}
      sacudida={sacudida?.id === f.trabajador.id ? sacudida.n : 0}
      resaltado={resaltado === f.trabajador.id}
      onCambiar={(marcado) => {
        setResaltado(null);
        onCambiar(f.trabajador.id, marcado);
      }}
      onIntentoBloqueado={() => intentarBloqueado(f)}
    />
  );

  return (
    <section aria-labelledby="selector-titulo" className={cn('card flex flex-col gap-gutter-md p-gutter-md', className)}>
      <div className="flex flex-col gap-gutter-xs">
        <h2 id="selector-titulo" className="text-headline-sm">
          Agregar personal
        </h2>
        <p className="text-body-md text-on-surface-muted">
          Solo puedes agregar trabajadores habilitados. Los vencidos o No Habilitado aparecen al final con el motivo.
        </p>
      </div>

      <SearchField
        size="field"
        label="Buscar trabajador"
        placeholder="Nombre, cédula, cargo o frente"
        value={busqueda}
        onChange={setBusqueda}
      />

      {/* Origen de los datos SST: con señal, el cálculo del día; sin señal, la última sincronización. */}
      {enLinea ? (
        <p className="flex items-center gap-gutter-xs text-body-sm tabular-nums text-on-surface-muted">
          <RefreshCw aria-hidden="true" className="h-4 w-4 shrink-0" />
          Datos SST en línea · semáforo calculado al {formatoFecha(HOY_SST)}
        </p>
      ) : (
        <p className="flex items-start gap-gutter-xs text-body-sm tabular-nums text-warning">
          <CloudOff aria-hidden="true" className="mt-px h-4 w-4 shrink-0" />
          <span>
            <strong className="font-semibold">Sin señal: datos SST actualizados hoy a las {formatoHora(SINCRONIZADO_EN)}.</strong>{' '}
            La habilitación de cada trabajador se revisa antes del guardado local de esta demostración.
          </span>
        </p>
      )}

      <p role="status" className="text-body-sm tabular-nums text-on-surface-muted">
        {total === 0
          ? `Ningún trabajador coincide con «${busqueda.trim()}».`
          : `${plural(total, 'trabajador', 'trabajadores')} · ${plural(asignables.length, 'disponible', 'disponibles')} · ${plural(bloqueados.length, 'bloqueado', 'bloqueados')}`}
      </p>

      {/* Explica el bloqueo a lectores de pantalla tras un intento de selección. */}
      <p aria-live="assertive" className="sr-only">
        {aviso}
      </p>

      {asignables.length > 0 && (
        <div className="flex flex-col gap-gutter-sm">
          <h3 id={idDisponibles} className="text-title-lg">
            Disponibles <span className="tabular-nums text-on-surface-muted">({asignables.length})</span>
          </h3>
          <ul aria-labelledby={idDisponibles} className="flex flex-col gap-gutter-sm">
            {asignables.map(fila)}
          </ul>
        </div>
      )}

      {bloqueados.length > 0 && (
        <div className="flex flex-col gap-gutter-sm">
          <h3 id={idBloqueados} className="flex items-center gap-gutter-xs text-title-lg text-error">
            <Lock aria-hidden="true" className="h-4 w-4" />
            No se pueden agregar <span className="tabular-nums">({bloqueados.length})</span>
          </h3>
          <ul aria-labelledby={idBloqueados} className="flex flex-col gap-gutter-sm">
            {bloqueados.map(fila)}
          </ul>
        </div>
      )}
    </section>
  );
}

interface FilaTrabajadorProps {
  fila: FilaPersonal;
  marcado: boolean;
  /** Contador de intentos sobre esta fila bloqueada; 0 si no hay. */
  sacudida: number;
  resaltado: boolean;
  onCambiar: (marcado: boolean) => void;
  onIntentoBloqueado: () => void;
}

function FilaTrabajador({ fila, marcado, sacudida, resaltado, onCambiar, onIntentoBloqueado }: FilaTrabajadorProps) {
  const { trabajador: t, evaluacion: e } = fila;
  const ref = useRef<HTMLLIElement>(null);

  // error-shake (150 ms): se quita y se vuelve a poner para que se repita en cada intento.
  // Con movimiento reducido, la animación queda anulada por index.css y solo cambia el resaltado.
  useEffect(() => {
    const el = ref.current;
    if (!sacudida || !el) return;
    el.classList.remove('animate-error-shake');
    void el.offsetWidth;
    el.classList.add('animate-error-shake');
    const t = window.setTimeout(() => el.classList.remove('animate-error-shake'), 200);
    return () => window.clearTimeout(t);
  }, [sacudida]);
  const bloqueado = !esAsignable(e.estado);
  const motivoId = useId();
  const alertas = alertasDeVigencia(e);
  const otros = textoOtros(e.otrosEnAlerta.filter((o) => !esAsignable(o.estado)));

  // Un toque en cualquier parte de la fila cuenta como intento de selección.
  const alTocarFila = (ev: MouseEvent<HTMLLIElement>) => {
    if ((ev.target as HTMLElement).closest('label, button')) return;
    if (bloqueado) onIntentoBloqueado();
    else onCambiar(!marcado);
  };

  return (
    <li
      ref={ref}
      onClick={alTocarFila}
      style={bloqueado ? ({ '--focus-offset': 'var(--error-subtle)' } as CSSProperties) : undefined}
      className={cn(
        'flex flex-col gap-gutter-xs rounded-md border px-gutter-md py-gutter-xs transition-colors duration-state ease-out',
        // El motivo del bloqueo es largo: siempre va debajo del nombre. Las alertas caben al lado.
        !bloqueado && 'tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-gutter-md',
        bloqueado
          ? cn('cursor-not-allowed bg-error-subtle text-on-surface-muted', resaltado ? 'border-error' : 'border-error-border')
          : marcado
            ? 'sf-low cursor-pointer border-primary'
            : 'cursor-pointer border-outline-variant hover:bg-surface-container-low',
      )}
    >
      <Checkbox
        size="field"
        className="min-w-0 flex-1"
        label={<span className={cn('text-title-md', !bloqueado && 'text-on-surface')}>{t.nombre}</span>}
        description={
          <span className="tabular-nums">
            C.C. {formatoCedula(t.cedula)} · {t.cargo} · {t.frente}
          </span>
        }
        checked={!bloqueado && marcado}
        onChange={(ev) => !bloqueado && onCambiar(ev.target.checked)}
        blocked={bloqueado}
        onBlockedAttempt={onIntentoBloqueado}
        aria-describedby={motivoId}
      />

      {/* Sangría de casilla (20 px) + candado (16 px) y sus separaciones, para alinear el motivo con el nombre. */}
      <div
        id={motivoId}
        className={cn(
          'flex flex-col items-start gap-gutter-xs pb-gutter-xs',
          bloqueado ? 'pl-[52px]' : 'pl-[28px] tablet:items-end tablet:pb-0 tablet:pl-0',
        )}
      >
        {bloqueado ? (
          <>
            <StatusBadge
              estado={e.estado}
              className={cn('transition duration-state ease-out', resaltado && 'border-error font-bold shadow-[inset_0_0_0_1px_currentColor]')}
            >
              {e.motivo}
            </StatusBadge>
            {otros && <span className="text-body-sm text-on-surface-muted">y {otros}</span>}
          </>
        ) : alertas.length > 0 ? (
          <>
            <StatusBadge estado={alertas[0].estado}>{textoAlerta(alertas[0])}</StatusBadge>
            {alertas.length > 1 && (
              <span className="text-body-sm text-on-surface-muted">y {plural(alertas.length - 1, 'alerta', 'alertas')} más</span>
            )}
          </>
        ) : (
          <StatusBadge estado="Habilitado" />
        )}
      </div>
    </li>
  );
}
