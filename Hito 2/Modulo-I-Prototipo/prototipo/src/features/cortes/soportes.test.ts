import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CUENTAS_DEMO } from '@/features/acceso/AuthDemo';
import { cortesIniciales } from './modeloDemo';
import { agregarSoporteDemo, leerSoportes, resumenSoportes, retirarSoporteDemo, soportesActivos } from './soportes';

const [visado, , enRevision] = cortesIniciales();
const residente = CUENTAS_DEMO[0];
const director = CUENTAS_DEMO[1];
const foto = { name: 'avance-frente.jpg', size: 2_400_000, type: 'image/jpeg' };

describe('soportes del corte (HU-M03)', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((clave: string) => storage.get(clave) ?? null),
      setItem: vi.fn((clave: string, valor: string) => storage.set(clave, valor)),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('incluye soportes de ejemplo y un corte sin soportes', () => {
    expect(resumenSoportes(soportesActivos(leerSoportes(), visado.id))).toBe('2 soportes · 1 fotografía, 1 PDF');
    expect(resumenSoportes(soportesActivos(leerSoportes(), enRevision.id))).toBe('Sin soportes');
  });
  it('adjunta una fotografía a un corte propio en revisión', () => {
    const soporte = agregarSoporteDemo({ id: 's1', corte: enRevision, archivo: foto, usuario: residente });
    expect(soporte).toMatchObject({ corteId: enRevision.id, nombre: foto.name, subidoPor: residente.nombre });
    expect(soportesActivos(leerSoportes(), enRevision.id)).toHaveLength(1);
    expect(agregarSoporteDemo({ id: 's1', corte: enRevision, archivo: foto, usuario: residente })).toEqual(soporte);
    expect(soportesActivos(leerSoportes(), enRevision.id)).toHaveLength(1);
  });
  it('rechaza formatos no permitidos, archivos pesados y repetidos', () => {
    expect(() => agregarSoporteDemo({ id: 's1', corte: enRevision, archivo: { name: 'acta.docx', size: 10, type: '' }, usuario: residente })).toThrow('no es PDF');
    expect(() => agregarSoporteDemo({ id: 's2', corte: enRevision, archivo: { ...foto, size: 20 * 1_048_576 }, usuario: residente })).toThrow('15 MB');
    agregarSoporteDemo({ id: 's3', corte: enRevision, archivo: foto, usuario: residente });
    expect(() => agregarSoporteDemo({ id: 's4', corte: enRevision, archivo: foto, usuario: residente })).toThrow('ya está adjunto');
  });
  it('no deja modificar los soportes de un corte visado ni desde otro perfil', () => {
    expect(() => agregarSoporteDemo({ id: 's1', corte: visado, archivo: foto, usuario: residente })).toThrow('visado');
    expect(() => retirarSoporteDemo({ corte: visado, soporteId: 'soporte-ejemplo-1', usuario: residente })).toThrow('visado');
    expect(() => agregarSoporteDemo({ id: 's1', corte: enRevision, archivo: foto, usuario: director })).toThrow('residente autor');
  });
  it('retira un soporte sin borrarlo del registro', () => {
    agregarSoporteDemo({ id: 's1', corte: enRevision, archivo: foto, usuario: residente });
    const retirado = retirarSoporteDemo({ corte: enRevision, soporteId: 's1', usuario: residente });
    expect(retirado.retiradoPor).toBe(residente.nombre);
    expect(soportesActivos(leerSoportes(), enRevision.id)).toHaveLength(0);
    expect(leerSoportes().find(s => s.id === 's1')?.fechaRetiro).toBeTruthy();
    expect(() => retirarSoporteDemo({ corte: enRevision, soporteId: 's1', usuario: residente })).toThrow('ya no está');
  });
  it('informa datos dañados del navegador sin reemplazarlos', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify([{ id: 1 }]));
    expect(() => leerSoportes()).toThrow('formato');
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
