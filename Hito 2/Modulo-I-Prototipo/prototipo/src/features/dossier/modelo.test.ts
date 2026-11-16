import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CUENTAS_DEMO } from '@/features/acceso/AuthDemo';
import { CARPETAS_DOSSIER } from '@/lib/constantes';
import {
  agregarItem, avanceCarpeta, buscarDocumentos, cargarSoporte, documentosVigentes, dossierInicial, editarItem, itemsActivos,
  leerDossier, publicarDocumento, retirarItem, revisarItem, validarDocumento, validarPdf, versionesDe,
} from './modelo';

const [residente, director, calidad, sst, gerencia] = CUENTAS_DEMO;
const pdf = { name: 'soporte.pdf', size: 250_000 };
const nuevoDocumento = { id: 'doc-nuevo', codigo: 'GC-FR99', nombre: 'Lista de verificación de entrega', version: 1, carpeta: 4, nota: '', archivo: pdf };
const nuevoItem = { id: 'item-nuevo', carpeta: 6, nombre: 'Memoria de cálculo de tubería', detalle: 'Firmada por ingeniería.' };
/** Requisito de ejemplo por nombre, leído de lo guardado. */
const item = (nombre: string) => leerDossier().items.find(candidato => candidato.nombre === nombre)!;

beforeEach(() => {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((clave: string) => storage.get(clave) ?? null),
    setItem: vi.fn((clave: string, valor: string) => storage.set(clave, valor)),
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('HU-M05 · documentos del SIG', () => {
  it('publica un documento con código, nombre y versión', () => {
    const publicado = publicarDocumento({ ...nuevoDocumento, codigo: ' gc-fr99 ', usuario: calidad });
    expect(publicado).toMatchObject({ codigo: 'GC-FR99', nombre: 'Lista de verificación de entrega', version: 1, vigente: true, publicadoPor: 'Dilan Castro' });
    expect(documentosVigentes(leerDossier().documentos).map(documento => documento.codigo)).toContain('GC-FR99');
  });
  it('al publicar una versión nueva, la anterior deja de ser vigente y queda en el historial', () => {
    publicarDocumento({ ...nuevoDocumento, codigo: 'GT-FR64', nombre: 'Libro de tubería', version: 4, nota: 'Se agregó el número de isométrico.', usuario: calidad });
    const versiones = versionesDe(leerDossier().documentos, 'GT-FR64');
    expect(versiones.map(documento => [documento.version, documento.vigente])).toEqual([[4, true], [3, false], [2, false], [1, false]]);
  });
  it('exige una versión mayor que la vigente y explicar qué cambió', () => {
    const { documentos } = dossierInicial();
    const repetida = { ...nuevoDocumento, codigo: 'GT-FR64', version: 3 };
    expect(validarDocumento(documentos, repetida).version).toContain('mayor que la vigente (v3)');
    expect(validarDocumento(documentos, { ...repetida, version: 4 }).nota).toContain('qué cambió');
    expect(() => publicarDocumento({ ...repetida, usuario: calidad })).toThrow('mayor que la vigente');
    expect(versionesDe(leerDossier().documentos, 'GT-FR64')[0].version).toBe(3);
  });
  it('señala cada campo incompleto del documento', () => {
    const errores = validarDocumento([], { codigo: 'libro', nombre: 'abc', version: 1.5, carpeta: 9, nota: '', archivo: null });
    expect(Object.keys(errores).sort()).toEqual(['archivo', 'carpeta', 'codigo', 'nombre', 'version']);
    expect(validarDocumento([], nuevoDocumento)).toEqual({});
  });
  it('no duplica el documento si la publicación se repite', () => {
    publicarDocumento({ ...nuevoDocumento, usuario: calidad });
    publicarDocumento({ ...nuevoDocumento, usuario: calidad });
    expect(versionesDe(leerDossier().documentos, 'GC-FR99')).toHaveLength(1);
  });
});

describe('HU-M05 · estructura de la checklist', () => {
  it('organiza la checklist del proyecto en las 6 carpetas contractuales', () => {
    const { items } = leerDossier();
    expect(CARPETAS_DOSSIER).toHaveLength(6);
    for (const carpeta of CARPETAS_DOSSIER) expect(itemsActivos(items, carpeta.numero).length).toBeGreaterThan(0);
    expect(items.every(candidato => CARPETAS_DOSSIER.some(carpeta => carpeta.numero === candidato.carpeta))).toBe(true);
  });
  it('agrega un requisito, que arranca en estado Pendiente', () => {
    const agregado = agregarItem({ ...nuevoItem, usuario: calidad });
    expect(agregado).toMatchObject({ estado: 'Pendiente', carpeta: 6 });
    expect(agregado.soporte).toBeUndefined();
    expect(agregado.historial).toMatchObject([{ anterior: 'Sin registro', nuevo: 'Pendiente' }]);
    expect(itemsActivos(leerDossier().items, 6)).toHaveLength(3);
  });
  it('edita el requisito sin cambiar su estado ni su soporte', () => {
    const antes = item('Pólizas vigentes');
    const editado = editarItem({ itemId: antes.id, nombre: 'Pólizas y garantías vigentes', detalle: 'Incluye anexos.', documentoCodigo: 'GC-PR02', usuario: calidad });
    expect(editado).toMatchObject({ nombre: 'Pólizas y garantías vigentes', documentoCodigo: 'GC-PR02', estado: antes.estado, soporte: antes.soporte });
  });
  it('retira un requisito: deja de contar en el avance y se conserva para la bitácora', () => {
    const antes = avanceCarpeta(leerDossier().items, 1);
    retirarItem({ itemId: item('Pólizas vigentes').id, usuario: calidad });
    const { items } = leerDossier();
    expect(avanceCarpeta(items, 1)).toMatchObject({ total: antes.total - 1, porcentaje: 100 });
    expect(items.find(candidato => candidato.nombre === 'Pólizas vigentes')?.retirado?.por).toBe('Dilan Castro');
    expect(() => retirarItem({ itemId: item('Pólizas vigentes').id, usuario: calidad })).toThrow('ya no está en la checklist');
  });
  it('rechaza nombres cortos, repetidos en la carpeta y documentos que no están vigentes', () => {
    expect(() => agregarItem({ ...nuevoItem, nombre: 'abc', usuario: calidad })).toThrow('mínimo 5');
    expect(() => agregarItem({ ...nuevoItem, carpeta: 1, nombre: ' polizas VIGENTES ', usuario: calidad })).toThrow('ya tiene un requisito');
    expect(() => agregarItem({ ...nuevoItem, documentoCodigo: 'NO-EXISTE', usuario: calidad })).toThrow('ya no está vigente');
    expect(agregarItem({ ...nuevoItem, nombre: 'Pólizas vigentes', usuario: calidad }).carpeta).toBe(6);
  });
  it('solo Calidad publica documentos y modifica la estructura', () => {
    for (const usuario of [residente, director, sst, gerencia, null]) {
      expect(() => publicarDocumento({ ...nuevoDocumento, usuario })).toThrow('Solo Coordinación SIG / Calidad');
      expect(() => agregarItem({ ...nuevoItem, usuario })).toThrow('Solo Coordinación SIG / Calidad');
      expect(() => editarItem({ itemId: 'item-1', nombre: 'Otro nombre', detalle: '', usuario })).toThrow('Solo Coordinación SIG / Calidad');
      expect(() => retirarItem({ itemId: 'item-1', usuario })).toThrow('Solo Coordinación SIG / Calidad');
    }
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
  it('calcula el avance validado por carpeta y del dossier', () => {
    const { items } = dossierInicial();
    expect(avanceCarpeta(items, 1)).toMatchObject({ total: 3, porcentaje: 67, conteo: { Validado: 2, 'Archivo Cargado': 1 } });
    expect(avanceCarpeta(items)).toMatchObject({ total: 18, conteo: { Pendiente: 8, 'Archivo Cargado': 4, Observado: 2, Validado: 4 } });
    expect(avanceCarpeta([], 1).porcentaje).toBe(0);
  });
});

describe('HU-M06 · soportes de la checklist', () => {
  it('al cargar un PDF el requisito pasa a Archivo Cargado', () => {
    const cargado = cargarSoporte({ itemId: item('WPS y PQR').id, soporteId: 's1', archivo: pdf, usuario: residente });
    expect(cargado).toMatchObject({ estado: 'Archivo Cargado', soporte: { nombre: 'soporte.pdf', subidoPor: 'Mauricio Palacios' } });
    expect(cargado.historial[0]).toMatchObject({ anterior: 'Pendiente', nuevo: 'Archivo Cargado', motivo: 'Soporte cargado: soporte.pdf' });
    expect(cargarSoporte({ itemId: item('Planos eléctricos').id, soporteId: 's2', archivo: pdf, usuario: calidad }).estado).toBe('Archivo Cargado');
  });
  it('rechaza archivos que no son PDF, vacíos o de más de 15 MB', () => {
    expect(validarPdf({ name: 'foto.jpg', size: 1000 })).toContain('no es un PDF');
    expect(validarPdf({ name: 'vacio.pdf', size: 0 })).toContain('vacío');
    expect(validarPdf({ name: 'pesado.pdf', size: 16 * 1_048_576 })).toContain('máximo es 15 MB');
    expect(validarPdf({ name: 'ACTA.PDF', size: 15 * 1_048_576 })).toBeNull();
    expect(() => cargarSoporte({ itemId: item('WPS y PQR').id, soporteId: 's1', archivo: { name: 'foto.jpg', size: 1000 }, usuario: residente })).toThrow('no es un PDF');
    expect(item('WPS y PQR').estado).toBe('Pendiente');
  });
  it('solo el Residente y Calidad cargan soportes', () => {
    for (const usuario of [director, sst, gerencia, null]) {
      expect(() => cargarSoporte({ itemId: 'item-13', soporteId: 's1', archivo: pdf, usuario })).toThrow('Solo el Ingeniero Residente o Calidad');
    }
  });
  it('Calidad valida el requisito', () => {
    const validado = revisarItem({ itemId: item('Libro de tubería').id, decision: 'Validado', usuario: calidad });
    expect(validado.estado).toBe('Validado');
    expect(validado.historial[0]).toMatchObject({ anterior: 'Archivo Cargado', nuevo: 'Validado', usuario: 'Dilan Castro' });
  });
  it('Calidad observa el requisito dejando escrito el motivo', () => {
    const { id } = item('Libro de tubería');
    expect(() => revisarItem({ itemId: id, decision: 'Observado', observacion: ' corto ', usuario: calidad })).toThrow('mínimo 10');
    const observado = revisarItem({ itemId: id, decision: 'Observado', observacion: 'Falta el número de colada.', usuario: calidad });
    expect(observado).toMatchObject({ estado: 'Observado', observacion: 'Falta el número de colada.' });
    expect(observado.historial[0].motivo).toBe('Falta el número de colada.');
  });
  it('solo Calidad valida u observa, y solo sobre un soporte cargado', () => {
    const { id } = item('Libro de tubería');
    for (const usuario of [residente, director, sst, gerencia, null]) {
      expect(() => revisarItem({ itemId: id, decision: 'Validado', usuario })).toThrow('Solo Coordinación SIG / Calidad');
    }
    expect(() => revisarItem({ itemId: item('WPS y PQR').id, decision: 'Validado', usuario: calidad })).toThrow('no tiene un soporte');
    expect(() => revisarItem({ itemId: item('Acta del Corte #07').id, decision: 'Validado', usuario: calidad })).toThrow('estado Observado');
    expect(() => revisarItem({ itemId: id, decision: 'Validado', usuario: calidad, soporteEsperado: 'otro' })).toThrow('El soporte cambió');
  });
  it('si queda Observado, al reemplazar el archivo vuelve a Archivo Cargado', () => {
    const observado = item('Acta del Corte #07');
    const reemplazado = cargarSoporte({ itemId: observado.id, soporteId: 's1', archivo: { name: 'acta-firmada.pdf', size: 300_000 }, usuario: residente });
    expect(reemplazado).toMatchObject({ estado: 'Archivo Cargado', soporte: { nombre: 'acta-firmada.pdf' } });
    expect(reemplazado.observacion).toBeUndefined();
    expect(reemplazado.historial[0]).toMatchObject({ anterior: 'Observado', nuevo: 'Archivo Cargado', motivo: 'Soporte reemplazado: acta-firmada.pdf' });
    expect(reemplazado.historial).toHaveLength(observado.historial.length + 1);
  });
  it('un requisito validado no admite otro soporte hasta que Calidad lo observe', () => {
    const { id } = item('Orden de servicio');
    expect(() => cargarSoporte({ itemId: id, soporteId: 's1', archivo: pdf, usuario: residente })).toThrow('ya está validado');
    revisarItem({ itemId: id, decision: 'Observado', observacion: 'La orden corresponde a otro periodo.', usuario: calidad });
    expect(cargarSoporte({ itemId: id, soporteId: 's1', archivo: pdf, usuario: residente }).estado).toBe('Archivo Cargado');
  });
  it('no duplica el cargue si la confirmación se repite', () => {
    const { id } = item('WPS y PQR');
    cargarSoporte({ itemId: id, soporteId: 's1', archivo: pdf, usuario: residente });
    expect(cargarSoporte({ itemId: id, soporteId: 's1', archivo: pdf, usuario: residente }).historial).toHaveLength(2);
  });
});

describe('HU-M06 · búsqueda de documentos vigentes', () => {
  const codigos = (filtro: Parameters<typeof buscarDocumentos>[1]) => buscarDocumentos(leerDossier(), filtro).map(fila => fila.documento.codigo);

  it('busca por nombre o por código, sin importar tildes ni mayúsculas', () => {
    expect(codigos({ texto: 'TUBERIA' })).toEqual(['GT-FR64']);
    expect(codigos({ texto: ' gt-fr ' })).toEqual(['GT-FR08', 'GT-FR64', 'GT-FR12']);
  });
  it('filtra por carpeta y por estado en la checklist', () => {
    expect(codigos({ carpeta: 4 })).toEqual(['GC-FR21', 'GC-FR30', 'GT-FR64']);
    expect(codigos({ estado: 'Observado' })).toEqual(['GT-FR08']);
    expect(codigos({ estado: 'Archivo Cargado' })).toEqual(['GD-FR05', 'GT-FR64', 'GT-FR12']);
    expect(codigos({ carpeta: 4, estado: 'Pendiente', texto: 'ndt' })).toEqual(['GC-FR30']);
  });
  it('muestra solo versiones vigentes, nunca las obsoletas', () => {
    const filas = buscarDocumentos(leerDossier());
    expect(filas).toHaveLength(8);
    expect(filas.every(fila => fila.documento.vigente)).toBe(true);
    expect(filas.find(fila => fila.documento.codigo === 'GT-FR64')?.documento.version).toBe(3);
    publicarDocumento({ ...nuevoDocumento, codigo: 'GT-FR64', version: 4, nota: 'Se agregó el número de isométrico.', usuario: calidad });
    expect(buscarDocumentos(leerDossier(), { texto: 'GT-FR64' }).map(fila => fila.documento.version)).toEqual([4]);
  });
  it('resume el estado del documento con su requisito más atrasado', () => {
    const fila = (codigo: string) => buscarDocumentos(leerDossier(), { texto: codigo })[0];
    expect(fila('GT-FR08')).toMatchObject({ estado: 'Observado', requisitos: 2 });
    expect(fila('GC-FR21')).toMatchObject({ estado: null, requisitos: 0 });
    cargarSoporte({ itemId: item('Acta del Corte #07').id, soporteId: 's1', archivo: pdf, usuario: residente });
    revisarItem({ itemId: item('Acta del Corte #07').id, decision: 'Validado', usuario: calidad });
    expect(fila('GT-FR08').estado).toBe('Validado');
  });
  it('devuelve una lista vacía cuando nada coincide', () => {
    expect(codigos({ texto: 'no existe' })).toEqual([]);
    expect(codigos({ carpeta: 6, estado: 'Validado' })).toEqual([]);
  });
});

describe('dossier guardado en el navegador', () => {
  it('recupera los cambios después de volver a leer', () => {
    agregarItem({ ...nuevoItem, usuario: calidad });
    expect(leerDossier().items).toHaveLength(19);
    expect(leerDossier()).toEqual(JSON.parse(JSON.stringify(leerDossier())));
  });
  it('informa datos dañados del navegador sin reemplazarlos', () => {
    for (const valor of ['{', 'null', '{"documentos":[],"items":[{"id":"x"}]}', JSON.stringify({ ...dossierInicial(), documentos: [{ codigo: 'GT-FR64' }] })]) {
      vi.mocked(localStorage.getItem).mockReturnValue(valor);
      expect(() => leerDossier()).toThrow(/no se pudo leer|incompatible/);
    }
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
  it('informa un fallo de almacenamiento y conserva lo anterior', () => {
    vi.mocked(localStorage.setItem).mockImplementation(() => { throw new Error('Sin espacio'); });
    expect(() => agregarItem({ ...nuevoItem, usuario: calidad })).toThrow('Sin espacio');
    expect(leerDossier().items).toHaveLength(18);
  });
});
