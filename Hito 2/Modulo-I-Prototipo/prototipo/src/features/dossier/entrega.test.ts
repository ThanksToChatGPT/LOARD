import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { strFromU8, unzipSync } from 'fflate';
import { CUENTAS_DEMO } from '@/features/acceso/AuthDemo';
import { registrosDossier } from '@/lib/seguimiento/dossier';
import { bloqueoEntrega, paqueteDossier, plazoDossier } from './entrega';
import { avanceCarpeta, dossierInicial, leerDossier, registrarActa, registrarEnsayo, revisarItem, validarEnsayo, TIPOS_NDT, type DatosEnsayo } from './modelo';

const [residente, , calidad] = CUENTAS_DEMO;
const datos: DatosEnsayo = { junta: 'JW-16-042', tipo: TIPOS_NDT[0], laboratorio: 'Laboratorio Delta', informe: 'RT-001', fechaEnsayo: '2026-11-16', resultado: 'Conforme' };
const archivo = { name: 'reporte.pdf', size: 1200 };
beforeEach(() => {
  const valores = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (k: string) => valores.get(k) ?? null, setItem: (k: string, v: string) => valores.set(k, v) });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('HU-M07 · vinculación NDT', () => {
  it('guarda ensayo, junta, PDF e historial en el mismo dossier sin validarlo automáticamente', () => {
    const antes = avanceCarpeta(leerDossier().items);
    const ensayo = registrarEnsayo({ id: 'e1', datos, archivo, usuario: calidad });
    const dossier = leerDossier();
    const item = dossier.items.find(i => i.id === ensayo.itemId)!;
    expect(dossier.ensayos?.[0]).toMatchObject({ junta: datos.junta, registradoPor: calidad.nombre });
    expect(item).toMatchObject({ carpeta: 4, estado: 'Archivo Cargado', soporte: { nombre: 'reporte.pdf' } });
    expect(avanceCarpeta(dossier.items).conteo.Validado).toBe(antes.conteo.Validado);
    expect(registrosDossier(dossier).find(i => i.id === item.id)?.eventos[0].motivo).toContain(datos.junta);
  });
  it('conserva reportes separados aunque correspondan a la misma junta y evita doble envío', () => {
    const primero = registrarEnsayo({ id: 'e1', datos, archivo, usuario: calidad });
    registrarEnsayo({ id: 'e1', datos, archivo, usuario: calidad });
    const segundo = registrarEnsayo({ id: 'e2', datos: { ...datos, informe: 'RT-002' }, archivo, usuario: calidad });
    expect(leerDossier().ensayos).toHaveLength(2);
    expect(primero.itemId).not.toBe(segundo.itemId);
    expect(leerDossier().items.find(i => i.id === primero.itemId)?.soporte?.nombre).toBe('reporte.pdf');
    expect(() => registrarEnsayo({ id: 'e3', datos, archivo, usuario: calidad })).toThrow('ya está registrado');
  });
  it('rechaza otro perfil, fechas futuras, juntas desconocidas, métodos y archivos inválidos', () => {
    expect(() => registrarEnsayo({ id: 'e1', datos, archivo, usuario: residente })).toThrow('Solo Calidad');
    expect(validarEnsayo({ ...datos, fechaEnsayo: '2026-11-18' }, archivo)).toContain('fecha');
    expect(validarEnsayo({ ...datos, fechaEnsayo: '2026-02-30' }, archivo)).toContain('fecha');
    expect(validarEnsayo({ ...datos, junta: 'otra' }, archivo)).toContain('junta');
    expect(validarEnsayo({ ...datos, tipo: 'otro' }, archivo)).toContain('tipo');
    expect(validarEnsayo(datos, { name: 'foto.png', size: 100 })).toContain('no es un PDF');
    expect(validarEnsayo(datos, { name: 'reporte.pdf', size: 16 * 1024 * 1024 })).toContain('máximo');
    expect(validarEnsayo(datos, null)).toContain('Adjunta');
  });
  it('permite revisar después el PDF asociado y refleja la validación confirmada', () => {
    const e = registrarEnsayo({ id: 'e1', datos, archivo, usuario: calidad });
    revisarItem({ itemId: e.itemId, decision: 'Validado', usuario: calidad });
    expect(leerDossier().items.find(i => i.id === e.itemId)?.estado).toBe('Validado');
  });
  it('conserva compatibilidad con los datos anteriores de HU5 y HU6', () => {
    const { documentos, items } = dossierInicial();
    localStorage.setItem('loard_prototipo_dossier_v1', JSON.stringify({ documentos, items }));
    registrarEnsayo({ id: 'e1', datos, archivo, usuario: calidad });
    expect(leerDossier().documentos).toEqual(documentos);
    expect(leerDossier().ensayos).toHaveLength(1);
  });
  it('no reporta éxito cuando el navegador rechaza el guardado', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('Sin espacio'); });
    expect(() => registrarEnsayo({ id: 'e1', datos, archivo, usuario: calidad })).toThrow('Sin espacio');
    expect(leerDossier().ensayos).toHaveLength(0);
  });
});

describe('HU-M08 · plazo y paquete', () => {
  it('rechaza fechas futuras de ensayo y acta aunque en UTC ya sea el día siguiente', () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-18T01:30:00Z'));
    expect(validarEnsayo({ ...datos, fechaEnsayo: '2026-11-18' }, archivo)).toContain('fecha');
    expect(validarEnsayo({ ...datos, fechaEnsayo: '2026-11-17' }, archivo)).toBeNull();
    expect(() => registrarActa({ numero: 'Acta #09', aceptada: '2026-11-18', usuario: calidad })).toThrow('fecha');
    expect(() => registrarActa({ numero: 'Acta #09', aceptada: '2026-11-17', usuario: calidad })).not.toThrow();
  });
  it('cuenta diez días calendario atravesando fines de semana y cambio de mes', () => {
    expect(plazoDossier('2026-10-28', '2026-11-07')).toEqual({ limite: '2026-11-07', dias: 0, vencido: false });
    expect(plazoDossier('2026-10-28', '2026-11-08')?.vencido).toBe(true);
    expect(plazoDossier('2026-11-11')?.dias).toBe(4);
    expect(plazoDossier()).toBeNull();
  });
  it('guarda el acta aceptada con responsable y controla rol y fecha', () => {
    registrarActa({ numero: 'Acta #08', aceptada: '2026-11-10', usuario: calidad });
    expect(leerDossier().acta).toMatchObject({ numero: 'Acta #08', aceptada: '2026-11-10', registradoPor: calidad.nombre });
    expect(() => registrarActa({ numero: 'Acta #09', aceptada: '2026-11-18', usuario: calidad })).toThrow('fecha');
    expect(() => registrarActa({ numero: 'Acta #09', aceptada: '2026-11-10', usuario: residente })).toThrow('Solo Calidad');
  });
  it('bloquea el cierre por requisitos sin validar, sin soporte, carpeta vacía o acta ausente', () => {
    const dossier = dossierInicial();
    expect(bloqueoEntrega(dossier)).toContain('Faltan');
    const completo = { ...dossier, items: dossier.items.map(i => ({ ...i, estado: 'Validado' as const, soporte: i.soporte ?? dossier.items[0].soporte })) };
    expect(bloqueoEntrega(completo)).toBeNull();
    expect(bloqueoEntrega({ ...completo, acta: undefined })).toContain('acta');
    expect(bloqueoEntrega({ ...completo, items: completo.items.filter(i => i.carpeta !== 6) })).toContain('seis carpetas');
    expect(bloqueoEntrega({ ...completo, items: completo.items.map((i, index) => index ? i : { ...i, soporte: undefined }) })).toContain('Faltan');
  });
  it('descarga seis carpetas, faltantes, trazabilidad y fichas de ejemplo explícitas', async () => {
    const dossier = dossierInicial();
    const paquete = await paqueteDossier(dossier, false);
    const contenido = unzipSync(paquete.bytes);
    expect(paquete.nombre).toMatch(/^BORRADOR_INCOMPLETO_/);
    for (let i = 1; i <= 6; i++) expect(Object.keys(contenido).some(k => k.startsWith(`${i}_`))).toBe(true);
    expect(strFromU8(contenido['RESUMEN.txt'])).toContain('Planos eléctricos · Pendiente');
    expect(JSON.parse(strFromU8(contenido['TRAZABILIDAD.json'])).items).toHaveLength(dossier.items.length);
    expect(Object.keys(contenido).some(k => k.endsWith('.FICHA_DEMO.txt'))).toBe(true);
    await expect(paqueteDossier(dossier, true)).rejects.toThrow('Faltan');
  });
  it('incluye el PDF original de sesión cuando existe, en lugar de una ficha', async () => {
    const { registrarArchivoSesion } = await import('./modelo');
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:prueba' });
    vi.stubGlobal('fetch', vi.fn(async () => new Response('%PDF-reporte')));
    const dossier = dossierInicial();
    dossier.items[0].soporte!.id = 'soporte-original-prueba';
    registrarArchivoSesion(dossier.items[0].soporte!.id, {} as File);
    const contenido = unzipSync((await paqueteDossier(dossier, false)).bytes);
    expect(Object.keys(contenido).some(k => k.endsWith('.pdf'))).toBe(true);
    expect(Object.values(contenido).some(b => strFromU8(b) === '%PDF-reporte')).toBe(true);
  });
  it('genera el paquete validado cuando todas las carpetas tienen soportes validados', async () => {
    const dossier = dossierInicial();
    dossier.items = dossier.items.map(i => ({ ...i, estado: 'Validado', soporte: i.soporte ?? { ...dossier.items[0].soporte!, id: `s-${i.id}` } }));
    const paquete = await paqueteDossier(dossier, true);
    expect(paquete.nombre).toMatch(/^DOSSIER_DEMO_VALIDADO_/);
    expect(strFromU8(unzipSync(paquete.bytes)['RESUMEN.txt'])).toContain('Requisitos sin validar o sin soporte:\nNinguno');
  });
});
