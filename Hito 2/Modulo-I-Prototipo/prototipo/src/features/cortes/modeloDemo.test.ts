import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { CUENTAS_DEMO } from '@/features/acceso/AuthDemo';
import { cortesIniciales, esEditable, guardarCorteDemo, leerCortes, revisarCorteDemo, validarCorteDemo } from './modeloDemo';

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
  it('impide modificar un corte visado y lo conserva intacto', () => {
    const visado = leerCortes().find(corte => corte.versiones[0].estado === 'Visado')!;
    expect(esEditable(visado)).toBe(false);
    const datos = structuredClone(visado.versiones[0].datos);
    datos.actividades[0].cantidad = '220';
    expect(() => guardarCorteDemo({ id: visado.id, anterior: visado, datos, usuario: CUENTAS_DEMO[0],
      motivo: 'Corregir medición del periodo', versionEsperada: 2 })).toThrow('visado');
    expect(leerCortes().find(corte => corte.id === visado.id)).toEqual(visado);
  });
  it('conserva la versión devuelta y la corrección vuelve a revisión', () => {
    const anterior = leerCortes().find(corte => corte.versiones[0].estado === 'Devuelto con Observaciones')!;
    expect(esEditable(anterior)).toBe(true);
    const datos = structuredClone(anterior.versiones[0].datos);
    datos.actividades[0].cantidad = '120';
    const actualizado = guardarCorteDemo({ id: anterior.id, anterior, datos, usuario: CUENTAS_DEMO[0],
      motivo: 'Corregir medición del periodo', versionEsperada: 2 });
    expect(actualizado.versiones[0].estado).toBe('En Revisión (Enviado)');
    expect(actualizado.versiones[0].version).toBe(3);
    expect(actualizado.versiones[1].estado).toBe('Devuelto con Observaciones');
    expect(actualizado.versiones[1].datos.actividades[0].cantidad).toBe('92');
    expect(anterior.versiones[0].datos.actividades[0].cantidad).toBe('92');
  });
  it('rechaza una edición basada en una versión anterior', () => {
    const anterior = leerCortes().find(corte => corte.versiones[0].estado === 'Devuelto con Observaciones')!;
    const solicitud = { id: anterior.id, anterior, datos: anterior.versiones[0].datos, usuario: CUENTAS_DEMO[0],
      motivo: 'Corregir las cantidades del periodo', versionEsperada: 2 };
    guardarCorteDemo(solicitud);
    expect(() => guardarCorteDemo(solicitud)).toThrow('otra pestaña');
  });
  it('impide registrar desde un perfil de consulta', () => {
    expect(() => guardarCorteDemo({ id: 'nuevo', datos: cortesIniciales()[0].versiones[0].datos,
      usuario: CUENTAS_DEMO[1], motivo: '' })).toThrow('consulta');
  });
  it('el director visa un corte en revisión y queda inmodificable', () => {
    const pendiente = leerCortes().find(corte => corte.versiones[0].estado === 'En Revisión (Enviado)')!;
    const visado = revisarCorteDemo({ corte: pendiente, usuario: CUENTAS_DEMO[1], decision: 'Visado', observacion: '', versionEsperada: 1 });
    expect(visado.versiones[0]).toMatchObject({ version: 2, estado: 'Visado', autor: 'Yonny Pérez', motivo: 'Revisión técnica conforme.' });
    expect(visado.versiones[0].datos).toEqual(pendiente.versiones[0].datos);
    expect(() => guardarCorteDemo({ id: visado.id, anterior: visado, datos: visado.versiones[0].datos, usuario: CUENTAS_DEMO[0],
      motivo: 'Corregir medición del periodo', versionEsperada: 2 })).toThrow('visado');
  });
  it('devolver exige una observación de 10 caracteres y el residente puede reenviar', () => {
    const pendiente = leerCortes().find(corte => corte.versiones[0].estado === 'En Revisión (Enviado)')!;
    const solicitud = { corte: pendiente, usuario: CUENTAS_DEMO[1], decision: 'Devuelto con Observaciones' as const, versionEsperada: 1 };
    expect(() => revisarCorteDemo({ ...solicitud, observacion: 'Revisar' })).toThrow('10 caracteres');
    const devuelto = revisarCorteDemo({ ...solicitud, observacion: '  Desfase en horas-hombre. ' });
    expect(devuelto.versiones[0]).toMatchObject({ estado: 'Devuelto con Observaciones', motivo: 'Desfase en horas-hombre.' });
    const corregido = guardarCorteDemo({ id: devuelto.id, anterior: devuelto, datos: devuelto.versiones[0].datos, usuario: CUENTAS_DEMO[0],
      motivo: 'Ajuste de horas-hombre', versionEsperada: 2 });
    expect(corregido.versiones[0].estado).toBe('En Revisión (Enviado)');
  });
  it('la revisión no bloquea registrar cortes nuevos', () => {
    const pendiente = leerCortes().find(corte => corte.versiones[0].estado === 'En Revisión (Enviado)')!;
    revisarCorteDemo({ corte: pendiente, usuario: CUENTAS_DEMO[1], decision: 'Devuelto con Observaciones', observacion: 'Falta soporte fotográfico.', versionEsperada: 1 });
    guardarCorteDemo({ id: 'siguiente', datos: structuredClone(pendiente.versiones[0].datos), usuario: CUENTAS_DEMO[0], motivo: '' });
    expect(leerCortes()).toHaveLength(4);
  });
  it('solo el director revisa, solo cortes en revisión y sobre la versión vigente', () => {
    const [visado, , pendiente] = leerCortes();
    expect(() => revisarCorteDemo({ corte: pendiente, usuario: CUENTAS_DEMO[0], decision: 'Visado', observacion: '', versionEsperada: 1 })).toThrow('Director');
    expect(() => revisarCorteDemo({ corte: visado, usuario: CUENTAS_DEMO[1], decision: 'Visado', observacion: '', versionEsperada: 2 })).toThrow('ya no está en revisión');
    expect(() => revisarCorteDemo({ corte: pendiente, usuario: CUENTAS_DEMO[1], decision: 'Visado', observacion: '', versionEsperada: 3 })).toThrow('cambió');
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
