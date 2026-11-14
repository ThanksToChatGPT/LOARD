import { Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, PageHeader, useToast } from '@/components';
import { formatoFecha, plural } from '@/lib/formato';
import { esAsignable } from '@/lib/semaforo';
import { useSst } from '@/lib/sst/SstContext';
import { CORTE_BORRADOR } from './datos';
import { ResumenPersonal } from './ResumenPersonal';
import { SelectorPersonal } from './SelectorPersonal';

/** HU-M10: personal del corte de obra con bloqueo estricto SST (§6.2A). */
export function PersonalCorte() {
  const { filas, enLinea } = useSst();
  const toast = useToast();
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);

  const elegidos = useMemo(
    () => seleccionados.map((id) => filas.find((f) => f.trabajador.id === id)).filter((f) => f != null),
    [seleccionados, filas],
  );
  const hayBloqueados = elegidos.some((f) => !esAsignable(f.evaluacion.estado));

  const cambiar = (id: string, marcado: boolean) =>
    setSeleccionados((lista) => (marcado ? (lista.includes(id) ? lista : [...lista, id]) : lista.filter((x) => x !== id)));

  const motivoBloqueo =
    elegidos.length === 0
      ? 'Agrega al menos un trabajador habilitado.'
      : hayBloqueados
        ? 'Quita al personal bloqueado para guardar.'
        : undefined;

  const guardar = () => {
    setGuardando(true);
    window.setTimeout(() => {
      setGuardando(false);
      toast.show({
        message: enLinea
          ? `Personal del Corte #${CORTE_BORRADOR.numero} guardado: ${plural(elegidos.length, 'trabajador', 'trabajadores')}.`
          : `Personal guardado en este dispositivo. Se enviará al recuperar señal.`,
      });
    }, 700);
  };

  return (
    <div className="grid-page gap-y-gutter-lg">
      <PageHeader
        className="col-span-full"
        title="Personal del corte"
        description={`Corte #${CORTE_BORRADOR.numero} · ${CORTE_BORRADOR.frente} · ${formatoFecha(CORTE_BORRADOR.fecha)}`}
      />

      <SelectorPersonal
        className="col-span-full desktop:col-span-7"
        seleccionados={seleccionados}
        onCambiar={cambiar}
      />

      <ResumenPersonal
        className="col-span-full self-start desktop:col-span-5"
        elegidos={elegidos}
        onQuitar={(id) => cambiar(id, false)}
      />

      {/* Pie fijo de acciones (§11.3). */}
      <div className="sf-page sticky bottom-0 z-10 col-span-full flex flex-wrap items-center justify-end gap-gutter-sm border-t border-outline-variant py-gutter-md">
        <p className="mr-auto text-body-md tabular-nums text-on-surface-muted">
          {plural(elegidos.length, 'trabajador seleccionado', 'trabajadores seleccionados')}
        </p>
        <Button
          size="field"
          icon={<Save aria-hidden="true" className="h-4 w-4" />}
          loading={guardando}
          loadingText="Guardando personal…"
          blocked={motivoBloqueo != null}
          blockedReason={motivoBloqueo}
          onClick={guardar}
        >
          Guardar personal
        </Button>
      </div>
    </div>
  );
}
