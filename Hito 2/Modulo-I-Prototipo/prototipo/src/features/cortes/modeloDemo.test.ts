import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { CUENTAS_DEMO } from '@/features/acceso/AuthDemo';
import { cortesIniciales, guardarCorteDemo, leerCortes, validarCorteDemo } from './modeloDemo';

describe('cortes del prototipo', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((clave: string) => storage.get(clave) ?? null),
      setItem: vi.fn((clave: string, valor: string) => storage.set(clave, valor)),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('incluye ejemplos de revisión, visado y devolución', () => {
    expect(new Set(leerCortes().map(corte => corte.versiones[0].estado)).size).toBe(3);
  });
  it('guarda un corte y recupera sus datos desde el navegador', () => {
    const datos = structuredClone(cortesIniciales()[0].versiones[0].datos);
    guardarCorteDemo({ id: 'nuevo', datos, usuario: CUENTAS_DEMO[0], motivo: '' });
    expect(leerCortes()).toHaveLength(4);
    expect(leerCortes().find(corte => corte.id === 'nuevo')?.versiones[0].datos).toEqual(datos);
  });
  it('conserva la versión visada y la corrección vuelve a revisión', () => {
    const anterior = leerCortes()[0];
    const datos = structuredClone(anterior.versiones[0].datos);
    datos.actividades[0].cantidad = '220';
    const actualizado = guardarCorteDemo({ id: anterior.id, anterior, datos, usuario: CUENTAS_DEMO[0],
      motivo: 'Corregir medición del periodo', versionEsperada: 2 });
    expect(actualizado.versiones[0].estado).toBe('En Revisión (Enviado)');
    expect(actualizado.versiones[0].version).toBe(3);
    expect(actualizado.versiones[1].estado).toBe('Visado');
    expect(actualizado.versiones[1].datos.actividades[0].cantidad).toBe('214');
    expect(anterior.versiones[0].datos.actividades[0].cantidad).toBe('214');
  });
  it('rechaza una edición basada en una versión anterior', () => {
    const anterior = leerCortes()[0];
    const solicitud = { id: anterior.id, anterior, datos: anterior.versiones[0].datos, usuario: CUENTAS_DEMO[0],
      motivo: 'Corregir las cantidades del periodo', versionEsperada: 2 };
    guardarCorteDemo(solicitud);
    expect(() => guardarCorteDemo(solicitud)).toThrow('otra pestaña');
  });
  it('impide registrar desde un perfil de consulta', () => {
    expect(() => guardarCorteDemo({ id: 'nuevo', datos: cortesIniciales()[0].versiones[0].datos,
      usuario: CUENTAS_DEMO[1], motivo: '' })).toThrow('consulta');
  });
  it('valida cantidades, periodos y horas disponibles', () => {
    const datos = structuredClone(cortesIniciales()[0].versiones[0].datos);
    datos.actividades[0].cantidad = '0';
    expect(validarCorteDemo(datos)).toContain('positivos');
    datos.actividades[0].cantidad = '1';
    datos.fin = '2026-11-01';
    expect(validarCorteDemo(datos)).toContain('fin del periodo');
    datos.fin = datos.inicio;
    expect(validarCorteDemo(datos)).toContain('horas disponibles');
  });
  it('informa un fallo de almacenamiento y conserva las versiones anteriores', () => {
    vi.mocked(localStorage.setItem).mockImplementation(() => { throw new Error('Sin espacio'); });
    expect(() => guardarCorteDemo({ id: 'nuevo', datos: cortesIniciales()[0].versiones[0].datos,
      usuario: CUENTAS_DEMO[0], motivo: '' })).toThrow('Sin espacio');
    expect(leerCortes()).toHaveLength(3);
  });
  it('informa datos dañados del navegador sin reemplazarlos', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify([{ ...cortesIniciales()[0], versiones: [null] }]));
    expect(() => leerCortes()).toThrow('formato');
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
