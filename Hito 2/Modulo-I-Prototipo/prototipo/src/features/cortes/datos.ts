/** Datos de ejemplo del módulo de cortes. Mismo día del prototipo SST: 17/11/2026. */

import { HOY_SST } from '@/lib/sst/fechas';

export const RESIDENTE = { nombre: 'Mauricio Palacios', rol: 'Ingeniero Residente' };

/** Corte en borrador al que se agrega el personal. */
export const CORTE_BORRADOR = {
  numero: '08',
  frente: 'Estación compresora',
  fecha: HOY_SST,
};
