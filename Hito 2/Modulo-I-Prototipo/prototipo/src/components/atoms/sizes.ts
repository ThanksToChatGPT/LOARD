/**
 * Áreas táctiles (design.md §6.1).
 * `default`: 48 px. `field`: 56 px por debajo de 1024 px, para las vistas
 * que se usan en obra (registro de corte, personal SST, carga de evidencias).
 */
export type ControlSize = 'default' | 'field';

export const ALTO_CONTROL: Record<ControlSize, string> = {
  default: 'min-h-touch',
  field: 'min-h-touch-field desktop:min-h-touch',
};

export const LADO_CONTROL: Record<ControlSize, string> = {
  default: 'min-h-touch min-w-touch',
  field: 'min-h-touch-field min-w-touch-field desktop:min-h-touch desktop:min-w-touch',
};
