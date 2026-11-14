import { describe, expect, it } from 'vitest';
import { diasRestantes } from './formato';
import { calcularEstadoSST, esAsignable, estadoGeneral, textoVencimiento } from './semaforo';

const HOY = '2026-11-13';
const enDias = (n: number) => {
  const d = new Date(Date.UTC(2026, 10, 13 + n));
  return d.toISOString().slice(0, 10);
};

describe('calcularEstadoSST', () => {
  it.each([
    [-1, 'Vencido'],
    [0, 'Próximo a Vencer (15d)'],
    [15, 'Próximo a Vencer (15d)'],
    [16, 'Próximo a Vencer (30d)'],
    [30, 'Próximo a Vencer (30d)'],
    [31, 'Habilitado'],
  ])('a %i días es %s', (dias, esperado) => {
    expect(calcularEstadoSST(enDias(dias), HOY)).toBe(esperado);
  });
});

describe('diasRestantes', () => {
  it('cuenta el día según la hora de Bogotá, no la UTC', () => {
    // 03:00 UTC del 14 todavía es 13 a las 22:00 en Bogotá.
    const ahora = new Date('2026-11-14T03:00:00Z');
    expect(diasRestantes('2026-11-13', ahora)).toBe(0);
    expect(diasRestantes('2026-11-12', ahora)).toBe(-1);
  });
});

describe('estadoGeneral', () => {
  const vigente = enDias(200);

  it('toma el peor estado entre cursos y aptitud', () => {
    expect(
      estadoGeneral(
        { vencimientosCursos: [vigente, enDias(12)], aptitud: { concepto: 'Habilitado', vencimiento: enDias(28) } },
        HOY,
      ),
    ).toBe('Próximo a Vencer (15d)');
  });

  it('No Habilitado manda aunque todo esté vigente', () => {
    expect(
      estadoGeneral(
        { vencimientosCursos: [vigente], aptitud: { concepto: 'No Habilitado', vencimiento: vigente } },
        HOY,
      ),
    ).toBe('No Habilitado');
  });

  it('una aptitud vencida bloquea', () => {
    const estado = estadoGeneral(
      { vencimientosCursos: [vigente], aptitud: { concepto: 'Habilitado', vencimiento: enDias(-4) } },
      HOY,
    );
    expect(estado).toBe('Vencido');
    expect(esAsignable(estado)).toBe(false);
  });
});

describe('textoVencimiento', () => {
  it.each([
    [-4, 'Vencido hace 4 días'],
    [-1, 'Vencido hace 1 día'],
    [0, 'Vence hoy'],
    [1, 'Vence en 1 día'],
    [12, 'Vence en 12 días'],
  ])('a %i días dice «%s»', (dias, esperado) => {
    expect(textoVencimiento(enDias(dias), HOY)).toBe(esperado);
  });

  it('con más de 30 días muestra la fecha', () => {
    expect(textoVencimiento('2027-03-15', HOY)).toBe('Vigente · vence el 15/03/2027');
  });
});
