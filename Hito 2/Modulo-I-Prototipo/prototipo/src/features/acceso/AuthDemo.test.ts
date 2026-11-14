import { describe, expect, it } from 'vitest';
import { autenticarDemo, CLAVE_DEMO, CUENTAS_DEMO, rutaInicial } from './AuthDemo';

describe('acceso de ejemplo', () => {
  it('abre el perfil indicado y normaliza el correo', () => {
    expect(autenticarDemo(' RESIDENTE@LOARD.DEMO ', CLAVE_DEMO).rol).toBe('residente');
  });
  it('muestra error ante credenciales incorrectas', () => {
    expect(() => autenticarDemo('residente@loard.demo', 'incorrecta')).toThrow();
    expect(() => autenticarDemo('desconocido@loard.demo', CLAVE_DEMO)).toThrow();
  });
  it('dirige SST a personal y los demás perfiles a cortes', () => {
    for (const usuario of CUENTAS_DEMO) expect(rutaInicial(usuario)).toBe(usuario.rol === 'sst' ? '/sst' : '/cortes');
  });
});
