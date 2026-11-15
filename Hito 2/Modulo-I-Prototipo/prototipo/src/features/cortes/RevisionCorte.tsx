import { RotateCcw, ShieldCheck } from 'lucide-react';
import { useId, useState } from 'react';
import { useNavigate } from 'react-router';
import { Banner, Button, Dialog, useToast } from '@/components';
import { useAuthDemo } from '@/features/acceso/AuthDemo';
import { formatoFechaHora } from '@/lib/formato';
import { useSst } from '@/lib/sst/SstContext';
import { useCortesDemo } from './CortesDemoContext';
import { DialogoObservacion } from './DialogoObservacion';
import { CAUSAS_DEVOLUCION, type CorteDemo, type DecisionCorte } from './modeloDemo';
import { soportesActivos } from './soportes';

/**
 * HU-M04 · Barra de revisión del Director de Proyectos.
 * Fija al pie mientras recorre cantidades y soportes. Solo aparece en cortes en revisión.
 */
export function RevisionCorte({ corte }: { corte: CorteDemo }) {
  const { usuario } = useAuthDemo();
  const { revisar, soportes } = useCortesDemo();
  const { enLinea } = useSst();
  const toast = useToast();
  const motivoId = useId();
  const [vista, setVista] = useState(corte.versiones[0].version);
  const [dialogo, setDialogo] = useState<DecisionCorte | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const actual = corte.versiones[0];
  const cambio = actual.version !== vista;
  if (usuario?.rol !== 'director' || (actual.estado !== 'En Revisión (Enviado)' && !cambio)) return null;

  const sinSoportes = soportesActivos(soportes, corte.id).length === 0;
  const bloqueo = !enLinea ? 'Necesitas conexión para visar o devolver cortes. Tus datos de revisión siguen en pantalla.'
    : cambio ? 'El corte cambió mientras lo revisabas. Consulta la versión actual antes de decidir.' : undefined;

  async function decidir(decision: DecisionCorte, observacion: string) {
    if (enviando || bloqueo) return;
    setEnviando(true);
    setError('');
    await new Promise(resolve => window.setTimeout(resolve, 350));
    try {
      const revisado = revisar({ corte, usuario, decision, observacion, versionEsperada: vista });
      setVista(revisado.versiones[0].version);
      setDialogo(null);
      toast.show({ message: decision === 'Visado'
        ? `Corte #${corte.numero} visado. La decisión quedó registrada en la bitácora.`
        : `Corte #${corte.numero} devuelto al residente con tu observación.` });
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo registrar la decisión. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  function abrir(decision: DecisionCorte) { setError(''); setDialogo(decision); }

  return (
    <section aria-label={`Revisión del Corte #${corte.numero}`} className="card flex flex-col gap-gutter-sm p-gutter-md shadow-2">
      <div className="flex flex-col gap-gutter-xs">
        <h2 className="text-headline-sm">Revisión del director</h2>
        <p className="text-body-md text-on-surface-muted">
          Revisa cantidades, horas-hombre, insumos y soportes. El residente puede seguir registrando cortes mientras decides.
        </p>
      </div>
      {cambio && (
        <Banner tone="warning" title={`El corte cambió (versión ${actual.version})`}
          actions={<Button variant="secondary" onClick={() => setVista(actual.version)}>Revisar versión actual</Button>}>
          {actual.autor} guardó una versión nueva el {formatoFechaHora(new Date(actual.fecha))}. Los valores en pantalla ya son los actuales.
        </Banner>
      )}
      {sinSoportes && <Banner tone="info">Este corte no tiene soportes adjuntos. Puedes decidir igual o devolverlo pidiendo evidencia.</Banner>}
      {error && !dialogo && <Banner tone="error">{error}</Banner>}
      <div className="flex flex-col gap-gutter-sm tablet:flex-row tablet:items-center tablet:justify-end">
        {bloqueo && <p id={motivoId} className="text-body-sm text-warning tablet:mr-auto">{bloqueo}</p>}
        <Button variant="secondary" icon={<RotateCcw className="h-4 w-4" />} blocked={Boolean(bloqueo)} aria-describedby={bloqueo ? motivoId : undefined}
          onClick={() => abrir('Devuelto con Observaciones')}>Devolver con observaciones</Button>
        <Button icon={<ShieldCheck className="h-4 w-4" />} blocked={Boolean(bloqueo)} aria-describedby={bloqueo ? motivoId : undefined}
          onClick={() => abrir('Visado')}>Visar corte</Button>
      </div>

      <Dialog
        open={dialogo === 'Visado'}
        onClose={() => setDialogo(null)}
        title={`¿Confirmar visado técnico del Corte #${corte.numero}?`}
        description="Esta acción quedará registrada en la bitácora de auditoría. El corte quedará aprobado y ya no se podrá modificar."
        footer={<>
          <Button variant="secondary" data-autofocus blocked={enviando} blockedReason="Espera a que termine el registro." onClick={() => setDialogo(null)}>Cancelar</Button>
          <Button loading={enviando} loadingText="Registrando visado…" blocked={Boolean(bloqueo)} blockedReason={bloqueo}
            onClick={() => decidir('Visado', '')}>Confirmar visado</Button>
        </>}
      >
        {sinSoportes && <Banner tone="info">El corte no tiene soportes adjuntos.</Banner>}
        {error && <Banner tone="error">{error}</Banner>}
      </Dialog>

      <DialogoObservacion
        open={dialogo === 'Devuelto con Observaciones'}
        onClose={() => setDialogo(null)}
        title={`Devolver el Corte #${corte.numero}`}
        description="El residente verá tu observación y podrá corregir y reenviar el corte. Puede seguir registrando cortes nuevos en este frente."
        causas={CAUSAS_DEVOLUCION}
        confirmLabel="Confirmar devolución"
        loadingText="Registrando devolución…"
        enviando={enviando}
        bloqueo={bloqueo}
        error={error}
        onConfirm={observacion => decidir('Devuelto con Observaciones', observacion)}
      />
    </section>
  );
}

/** Aviso del corte devuelto: lo ven todos los perfiles; solo el residente autor puede corregirlo. */
export function AvisoDevolucion({ corte }: { corte: CorteDemo }) {
  const { usuario } = useAuthDemo();
  const navigate = useNavigate();
  const actual = corte.versiones[0];
  if (actual.estado !== 'Devuelto con Observaciones') return null;
  const esAutor = usuario?.rol === 'residente' && usuario.correo === corte.autorCorreo;
  return (
    <Banner tone="warning" title={`Devuelto con observaciones por ${actual.autor}`}
      actions={esAutor && <Button onClick={() => navigate(`/cortes/${corte.id}/editar`)}>Corregir corte</Button>}>
      <span className="flex flex-col gap-gutter-xs">
        <span className="whitespace-pre-wrap">«{actual.motivo}»</span>
        <span className="text-body-sm tabular-nums">{actual.rol} · {formatoFechaHora(new Date(actual.fecha))}
          {esAutor && ' · Puedes seguir registrando cortes nuevos mientras lo corriges.'}</span>
      </span>
    </Banner>
  );
}
