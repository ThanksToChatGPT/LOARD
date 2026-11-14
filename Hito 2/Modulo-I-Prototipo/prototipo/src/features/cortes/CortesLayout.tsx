import { LayoutPrototipo } from '@/LayoutPrototipo';
import { formatoHora } from '@/lib/formato';
import { SINCRONIZADO_EN } from '@/lib/sst/fechas';
import { RESIDENTE } from './datos';

/** Pantallas de cortes de obra, vistas por el Ingeniero Residente. */
export function CortesLayout() {
  return (
    <LayoutPrototipo
      usuario={RESIDENTE}
      mensajeSinSenal={`Sin conexión. El selector de personal usa los datos SST actualizados hoy a las ${formatoHora(SINCRONIZADO_EN)}. Lo que guardes se enviará al recuperar señal.`}
    />
  );
}
