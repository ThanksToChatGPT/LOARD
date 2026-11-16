import { useEffect, useId, useState, type ReactNode } from 'react';
import { Banner, Button, Chip, Dialog, TextArea } from '@/components';
import { OBSERVACION_MIN_CARACTERES } from '@/lib/constantes';

export interface DialogoObservacionProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  /** Causas frecuentes que agregan su texto a la observación. */
  causas: string[];
  confirmLabel: string;
  loadingText: string;
  enviando: boolean;
  /** Motivo por el que no se puede confirmar (sin señal, versión cambiada). */
  bloqueo?: string;
  error?: string;
  onConfirm: (observacion: string) => void;
}

/**
 * «Devolver con observaciones» (§6.2B). El campo recibe el foco al abrir, los chips
 * completan el texto y la confirmación espera al menos 10 caracteres.
 * Pensado para reutilizarse en «Observar requisito» del dossier (HU-M06).
 */
export function DialogoObservacion({
  open, onClose, title, description, causas, confirmLabel, loadingText, enviando, bloqueo, error, onConfirm,
}: DialogoObservacionProps) {
  const [texto, setTexto] = useState('');
  const causasId = useId();
  const [elegidas, setElegidas] = useState<string[]>([]);

  useEffect(() => {
    if (open) { setTexto(''); setElegidas([]); }
  }, [open]);

  function alternar(causa: string) {
    const frase = `${causa}. `;
    if (elegidas.includes(causa)) {
      setElegidas(lista => lista.filter(item => item !== causa));
      setTexto(actual => actual.replace(frase, ''));
    } else {
      setElegidas(lista => [...lista, causa]);
      setTexto(actual => `${actual && !actual.endsWith(' ') ? `${actual} ` : actual}${frase}`);
    }
  }

  const faltan = Math.max(0, OBSERVACION_MIN_CARACTERES - texto.trim().length);
  const motivo = bloqueo ?? (faltan > 0 ? `Escribe la observación: faltan ${faltan} caracteres para confirmar.` : undefined);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      dirty={texto.trim().length > 0 && !enviando}
      discardQuestion="¿Descartar la observación escrita?"
      discardLabel="Descartar observación"
      keepLabel="Seguir escribiendo"
      footer={<>
        <Button variant="secondary" className="self-start" blocked={enviando} blockedReason="Espera a que termine el registro." onClick={onClose}>Cancelar</Button>
        <Button variant="warning" loading={enviando} loadingText={loadingText} blocked={motivo != null} blockedReason={motivo}
          onClick={() => onConfirm(texto)}>{confirmLabel}</Button>
      </>}
    >
      {error && <Banner tone="error">{error}</Banner>}
      <TextArea label="Observación para el residente" required minCharacters={OBSERVACION_MIN_CARACTERES} maxLength={1000}
        hint="Explica qué debe corregir." value={texto} onChange={event => setTexto(event.target.value)} />
      <div className="flex flex-col gap-gutter-sm">
        <span className="text-label-lg" id={causasId}>Causas frecuentes (opcional)</span>
        <div role="group" aria-labelledby={causasId} className="flex flex-wrap gap-gutter-sm">
          {causas.map(causa => <Chip key={causa} selected={elegidas.includes(causa)} onClick={() => alternar(causa)}>{causa}</Chip>)}
        </div>
      </div>
    </Dialog>
  );
}
