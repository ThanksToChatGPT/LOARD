import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { guardarPersonal, leerPersonal } from './almacenamiento';

describe('personal guardado del prototipo', () => {
  beforeEach(() => {
    const datos = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((clave: string) => datos.get(clave) ?? null),
      setItem: vi.fn((clave: string, valor: string) => datos.set(clave, valor)),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('recupera la selección después de volver a la pantalla', () => {
    guardarPersonal(['trabajador-1', 'trabajador-2']);
    expect(leerPersonal()).toEqual(['trabajador-1', 'trabajador-2']);
  });

  it('descarta datos dañados y formatos anteriores incompatibles', () => {
    for (const valor of ['{', '{}', '[1]', 'null']) {
      vi.mocked(localStorage.getItem).mockReturnValue(valor);
      expect(leerPersonal()).toEqual([]);
    }
  });

  it('normaliza identificadores repetidos', () => {
    guardarPersonal(['trabajador-1', 'trabajador-1']);
    expect(leerPersonal()).toEqual(['trabajador-1']);
  });

  it('conserva un error de almacenamiento para que la pantalla informe el fallo', () => {
    vi.mocked(localStorage.setItem).mockImplementation(() => { throw new Error('Sin espacio'); });
    expect(() => guardarPersonal(['trabajador-1'])).toThrow('Sin espacio');
  });
});
