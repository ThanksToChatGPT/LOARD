import { LayoutPrototipo } from '@/LayoutPrototipo';
import { formatoHora } from '@/lib/formato';
import { COORDINADORA } from '@/lib/sst/datos';
import { SINCRONIZADO_EN } from '@/lib/sst/fechas';

/** Pantallas de HU-M09, vistas por Coordinación SST. */
export function SstLayout() {
  return (
    <LayoutPrototipo
      usuario={COORDINADORA}
      mensajeSinSenal={`Sin conexión. Consultas con los datos SST actualizados hoy a las ${formatoHora(SINCRONIZADO_EN)}. Registrar cursos o aptitudes requiere señal.`}
    />
  );
}
