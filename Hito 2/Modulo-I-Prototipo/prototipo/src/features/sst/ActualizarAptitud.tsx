import { Lock, Save, ShieldCheck, ShieldX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Banner, Button, DateField, FormLayout, PageHeader, RadioCardGroup, StatusBadge, useToast } from '@/components';
import { formatoFecha, numeroDeDia } from '@/lib/formato';
import type { ConceptoMedico } from '@/lib/semaforo';
import { VistaPreviaSemaforo, Volver } from './componentes';
import { aptitudVigente, evaluar } from './evaluacion';
import { HOY_SST, ahora } from './fechas';
import { useSst, useTrabajador } from './SstContext';
import type { Aptitud } from './tipos';

type Errores = Partial<Record<'concepto' | 'expedicion' | 'vencimiento', string>>;

/**
 * Aptitud médica: solo concepto (Habilitado / No Habilitado) y fechas.
 * Por reserva legal no hay campos de diagnóstico, restricciones ni texto libre.
 */
export function ActualizarAptitud() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const datos = useTrabajador(id);
  const { registrarAptitud, enLinea } = useSst();

  const [concepto, setConcepto] = useState<ConceptoMedico | null>(null);
  const [expedicion, setExpedicion] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);

  const impacto = useMemo(() => {
    if (!datos || !concepto || !vencimiento) return undefined;
    const t = datos.trabajador;
    const hipotetica: Aptitud = {
      id: 'vista-previa',
      trabajadorId: t.id,
      concepto,
      expedicion,
      vencimiento,
      registradoPor: '',
      registradoEn: ahora(),
    };
    const despues = evaluar(t, datos.cursos, [...datos.aptitudes, hipotetica], HOY_SST);
    return { nombre: t.nombre, antes: datos.evaluacion.estado, despues: despues.estado, motivo: despues.motivo };
  }, [datos, concepto, expedicion, vencimiento]);

  if (!datos) {
    return (
      <div className="grid-page">
        <div className="col-span-full flex flex-col gap-gutter-md">
          <Volver to="/sst">Personal SST</Volver>
          <Banner tone="warning" title="No encontramos este trabajador">
            Vuelve a la lista de personal y ábrelo desde allí.
          </Banner>
        </div>
      </div>
    );
  }

  const t = datos.trabajador;
  const actual = aptitudVigente(datos.aptitudes);

  const validar = (): Errores => {
    const e: Errores = {};
    if (!concepto) e.concepto = 'Elige el concepto que indica el certificado de aptitud.';
    if (!expedicion) e.expedicion = 'Elige la fecha de expedición del concepto.';
    else if (numeroDeDia(expedicion) > numeroDeDia(HOY_SST))
      e.expedicion = `La expedición no puede ser posterior a hoy (${formatoFecha(HOY_SST)}).`;
    if (!vencimiento) e.vencimiento = 'Elige la fecha de vencimiento del concepto.';
    else if (expedicion && numeroDeDia(vencimiento) <= numeroDeDia(expedicion))
      e.vencimiento = 'El vencimiento debe ser posterior a la expedición. Revisa las dos fechas.';
    return e;
  };

  const guardar = () => {
    const e = validar();
    setErrores(e);
    if (e.concepto) {
      document.querySelector<HTMLInputElement>('input[name="aptitud-concepto"]')?.focus();
      return;
    }
    const primero = (['expedicion', 'vencimiento'] as const).find((k) => e[k]);
    if (primero) {
      document.getElementById(`aptitud-${primero}`)?.focus();
      return;
    }

    setGuardando(true);
    window.setTimeout(() => {
      registrarAptitud({ trabajadorId: t.id, concepto: concepto!, expedicion, vencimiento });
      toast.show({ message: `Aptitud médica de ${t.nombre} actualizada: ${concepto}.` });
      navigate(`/sst/${t.id}`);
    }, 900);
  };

  return (
    <FormLayout
      onSubmit={guardar}
      header={
        <div className="flex flex-col gap-gutter-sm">
          <Volver to={`/sst/${t.id}`}>{t.nombre}</Volver>
          <PageHeader title="Actualizar aptitud médica" description={`${t.nombre} · ${t.cargo}`} />
        </div>
      }
      footer={
        <>
          <Button variant="secondary" size="field" onClick={() => navigate(`/sst/${t.id}`)}>
            Cancelar
          </Button>
          <Button
            type="submit"
            size="field"
            icon={<Save aria-hidden="true" className="h-4 w-4" />}
            loading={guardando}
            loadingText="Guardando aptitud…"
            blocked={!enLinea}
            blockedReason={
              !enLinea
                ? 'Necesitas conexión para guardar la aptitud médica. Lo que llenaste se conserva mientras sigas en esta pantalla.'
                : undefined
            }
          >
            Guardar aptitud
          </Button>
        </>
      }
    >
      <Banner tone="info" icon={<Lock aria-hidden="true" className="h-5 w-5" />} title="Reserva legal">
        Aquí solo se registra el concepto y sus fechas. No se guardan diagnósticos, restricciones ni datos clínicos: ese
        soporte lo custodia el médico ocupacional.
      </Banner>

      {actual && (
        <p className="flex flex-wrap items-center gap-gutter-sm text-body-md tabular-nums text-on-surface-muted">
          Concepto actual: <StatusBadge estado={actual.concepto} /> vigente hasta el {formatoFecha(actual.vencimiento)}. Queda
          en el historial al guardar el nuevo.
        </p>
      )}

      <RadioCardGroup
        name="aptitud-concepto"
        legend="Concepto médico"
        required
        value={concepto}
        onChange={(v) => {
          setConcepto(v as ConceptoMedico);
          setErrores((e) => ({ ...e, concepto: undefined }));
        }}
        error={errores.concepto}
        options={[
          {
            value: 'Habilitado',
            label: 'Habilitado',
            description: 'Puede trabajar mientras el concepto esté vigente.',
            icon: <ShieldCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-success" />,
          },
          {
            value: 'No Habilitado',
            label: 'No Habilitado',
            description: 'Queda bloqueado para cortes de obra sin importar la fecha.',
            icon: <ShieldX aria-hidden="true" className="h-5 w-5 shrink-0 text-error" />,
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-gutter-md tablet:grid-cols-2">
        <DateField
          id="aptitud-expedicion"
          size="field"
          label="Fecha de expedición"
          required
          max={HOY_SST}
          value={expedicion}
          error={errores.expedicion}
          onChange={(ev) => setExpedicion(ev.target.value)}
        />
        <DateField
          id="aptitud-vencimiento"
          size="field"
          label="Fecha de vencimiento"
          required
          min={expedicion || undefined}
          value={vencimiento}
          error={errores.vencimiento}
          onChange={(ev) => setVencimiento(ev.target.value)}
        />
      </div>

      <VistaPreviaSemaforo
        sujeto="la aptitud"
        vencimiento={vencimiento}
        estadoForzado={concepto === 'No Habilitado' ? 'No Habilitado' : undefined}
        impacto={impacto}
      />
    </FormLayout>
  );
}
