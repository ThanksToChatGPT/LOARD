import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { CUENTAS_DEMO } from '@/features/acceso/AuthDemo';
import { cortesIniciales, describirRecurso, esActividadPropia, esEditable, guardarCorteDemo, leerCortes, nuevaActividadPropia, revisarCorteDemo, validarCorteDemo, ACTIVIDADES_DEMO } from './modeloDemo';

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
  it('las cantidades ejecutadas solo aceptan enteros; los insumos conservan decimales', () => {
    const datos = structuredClone(cortesIniciales()[0].versiones[0].datos);
    for (const cantidad of ['1.5', '1e2', '3.0']) {
      datos.actividades[0].cantidad = cantidad;
      expect(validarCorteDemo(datos)).toContain('enteros');
    }
    datos.actividades[0].cantidad = '3';
    expect(datos.insumos[0].cantidad).toBe('12.5');
    expect(validarCorteDemo(datos)).toBeNull();
  });
  it('guarda una actividad propia con su nombre, unidad y cantidad', () => {
    const datos = structuredClone(cortesIniciales()[0].versiones[0].datos);
    const propia = { ...nuevaActividadPropia(), nombre: 'Pintura de tubería', unidad: 'm²', cantidad: '35' };
    expect(esActividadPropia(propia)).toBe(true);
    datos.actividades.push(propia);
    expect(validarCorteDemo(datos)).toBeNull();
    guardarCorteDemo({ id: 'con-propia', datos, usuario: CUENTAS_DEMO[0], motivo: '' });
    const guardada = leerCortes().find(corte => corte.id === 'con-propia')!.versiones[0].datos.actividades[1];
    expect(guardada).toEqual(propia);
    expect(describirRecurso(guardada, ACTIVIDADES_DEMO)).toEqual({ nombre: 'Pintura de tubería', unidad: 'm²' });
    expect(describirRecurso(datos.actividades[0], ACTIVIDADES_DEMO)).toEqual({ nombre: 'Soldadura y tendido de tubería', unidad: 'm' });
  });
  it('una actividad propia exige nombre, unidad válida y no repetir una actividad', () => {
    const datos = structuredClone(cortesIniciales()[0].versiones[0].datos);
    const propia = { ...nuevaActividadPropia(), cantidad: '4' };
    datos.actividades.push(propia);
    expect(validarCorteDemo(datos)).toContain('nombre de la actividad');
    propia.nombre = 'Pintura de tubería';
    propia.unidad = 'litros';
    expect(validarCorteDemo(datos)).toContain('unidad de medida');
    propia.unidad = 'kg';
    propia.cantidad = '4.5';
    expect(validarCorteDemo(datos)).toContain('enteros');
    propia.cantidad = '4';
    propia.nombre = ' soldadura y tendido de tuberia ';
    expect(validarCorteDemo(datos)).toContain('Ya hay una actividad');
    propia.nombre = 'Pintura de tubería';
    datos.actividades.push({ ...nuevaActividadPropia(), nombre: 'PINTURA DE TUBERIA', cantidad: '2' });
    expect(validarCorteDemo(datos)).toContain('Ya hay una actividad');
    datos.actividades.pop();
    datos.actividades.push({ id: 'inventada', cantidad: '2' });
    expect(validarCorteDemo(datos)).toContain('recursos disponibles');
  });
  it('exige ciudad y cliente al guardar', () => {
    const datos = structuredClone(cortesIniciales()[0].versiones[0].datos);
    expect(validarCorteDemo({ ...datos, ciudad: '' })).toContain('ciudad');
    expect(validarCorteDemo({ ...datos, cliente: undefined })).toContain('cliente');
  });
  it('lee cortes guardados antes de existir ciudad y cliente', () => {
    const viejos = cortesIniciales().map(corte => ({ ...corte, versiones: corte.versiones.map(version => {
      const { ciudad: _ciudad, cliente: _cliente, ...datos } = version.datos;
      return { ...version, datos };
    }) }));
    viejos.push({ ...viejos[2], id: 'propio-viejo', numero: '09' });
    localStorage.setItem('loard_prototipo_cortes_v1', JSON.stringify(viejos));
    const leidos = leerCortes();
    expect(leidos).toHaveLength(4);
    // Los ejemplos reciben la ciudad y el cliente de los datos iniciales, en todas sus versiones.
    expect(leidos[0].versiones.map(version => version.datos.ciudad)).toEqual(['Medellín', 'Medellín']);
    expect(leidos[1].versiones[0].datos).toMatchObject({ ciudad: 'Cartagena', cliente: 'Energía del Valle S.A.S.' });
    // Un corte propio antiguo se conserva sin esos datos y se puede seguir revisando.
    expect(leidos[3].versiones[0].datos.ciudad).toBeUndefined();
    const visado = revisarCorteDemo({ corte: leidos[3], usuario: CUENTAS_DEMO[1], decision: 'Visado', observacion: '', versionEsperada: 1 });
    expect(visado.versiones[0].estado).toBe('Visado');
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
