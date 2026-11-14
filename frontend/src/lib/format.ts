export const number = (value: string | number) => Number(value).toLocaleString('es-CO', { maximumFractionDigits: 3 });
export const date = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('es-CO');
export const timestamp = (value: string) => new Date(value).toLocaleString('es-CO', { timeZone: 'America/Bogota' });
